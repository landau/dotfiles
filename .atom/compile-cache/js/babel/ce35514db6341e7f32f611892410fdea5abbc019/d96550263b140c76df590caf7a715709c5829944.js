"use babel";

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _require = require("atom");

var Range = _require.Range;
var Point = _require.Point;

var _ = require("underscore-plus");

// [TODO] Need overhaul
//  - [ ] Make expandable by selection.getBufferRange().union(this.getRange(selection))
//  - [ ] Count support(priority low)?
var Base = require("./base");
var PairFinder = require("./pair-finder");

var TextObject = (function (_Base) {
  _inherits(TextObject, _Base);

  function TextObject() {
    _classCallCheck(this, TextObject);

    _get(Object.getPrototypeOf(TextObject.prototype), "constructor", this).apply(this, arguments);

    this.operator = null;
    this.wise = "characterwise";
    this.supportCount = false;
    this.selectOnce = false;
    this.selectSucceeded = false;
  }

  _createClass(TextObject, [{
    key: "isInner",
    value: function isInner() {
      return this.inner;
    }
  }, {
    key: "isA",
    value: function isA() {
      return !this.inner;
    }
  }, {
    key: "isLinewise",
    value: function isLinewise() {
      return this.wise === "linewise";
    }
  }, {
    key: "isBlockwise",
    value: function isBlockwise() {
      return this.wise === "blockwise";
    }
  }, {
    key: "forceWise",
    value: function forceWise(wise) {
      return this.wise = wise; // FIXME currently not well supported
    }
  }, {
    key: "resetState",
    value: function resetState() {
      this.selectSucceeded = false;
    }

    // execute: Called from Operator::selectTarget()
    //  - `v i p`, is `VisualModeSelect` operator with @target = `InnerParagraph`.
    //  - `d i p`, is `Delete` operator with @target = `InnerParagraph`.
  }, {
    key: "execute",
    value: function execute() {
      // Whennever TextObject is executed, it has @operator
      if (!this.operator) throw new Error("in TextObject: Must not happen");
      this.select();
    }
  }, {
    key: "select",
    value: function select() {
      var _this = this;

      if (this.isMode("visual", "blockwise")) {
        this.swrap.normalize(this.editor);
      }

      this.countTimes(this.getCount(), function (_ref2) {
        var stop = _ref2.stop;

        if (!_this.supportCount) stop(); // quick-fix for #560

        for (var selection of _this.editor.getSelections()) {
          var oldRange = selection.getBufferRange();
          if (_this.selectTextObject(selection)) _this.selectSucceeded = true;
          if (selection.getBufferRange().isEqual(oldRange)) stop();
          if (_this.selectOnce) break;
        }
      });

      this.editor.mergeIntersectingSelections();
      // Some TextObject's wise is NOT deterministic. It has to be detected from selected range.
      if (this.wise == null) this.wise = this.swrap.detectWise(this.editor);

      if (this.operator["instanceof"]("SelectBase")) {
        if (this.selectSucceeded) {
          if (this.wise === "characterwise") {
            this.swrap.saveProperties(this.editor, { force: true });
          } else if (this.wise === "linewise") {
            // When target is persistent-selection, new selection is added after selectTextObject.
            // So we have to assure all selection have selction property.
            // Maybe this logic can be moved to operation stack.
            for (var $selection of this.swrap.getSelections(this.editor)) {
              if (this.getConfig("stayOnSelectTextObject")) {
                if (!$selection.hasProperties()) $selection.saveProperties();
              } else {
                $selection.saveProperties();
              }
              $selection.fixPropertyRowToRowRange();
            }
          }
        }

        if (this.submode === "blockwise") {
          for (var $selection of this.swrap.getSelections(this.editor)) {
            $selection.normalize();
            $selection.applyWise("blockwise");
          }
        }
      }
    }

    // Return true or false
  }, {
    key: "selectTextObject",
    value: function selectTextObject(selection) {
      var range = this.getRange(selection);
      if (range) {
        this.swrap(selection).setBufferRange(range);
        return true;
      } else {
        return false;
      }
    }

    // to override
  }, {
    key: "getRange",
    value: function getRange(selection) {}
  }], [{
    key: "register",
    value: function register(isCommand, deriveInnerAndA, deriveInnerAndAForAllowForwarding) {
      _get(Object.getPrototypeOf(TextObject), "register", this).call(this, isCommand);

      if (deriveInnerAndA) {
        this.generateClass("A" + this.name, false);
        this.generateClass("Inner" + this.name, true);
      }

      if (deriveInnerAndAForAllowForwarding) {
        this.generateClass("A" + this.name + "AllowForwarding", false, true);
        this.generateClass("Inner" + this.name + "AllowForwarding", true, true);
      }
    }
  }, {
    key: "generateClass",
    value: function generateClass(klassName, inner, allowForwarding) {
      var klass = (function (_ref) {
        _inherits(klass, _ref);

        _createClass(klass, null, [{
          key: "name",
          get: function get() {
            return klassName;
          }
        }]);

        function klass(vimState) {
          _classCallCheck(this, klass);

          _get(Object.getPrototypeOf(klass.prototype), "constructor", this).call(this, vimState);
          this.inner = inner;
          if (allowForwarding != null) this.allowForwarding = allowForwarding;
        }

        return klass;
      })(this);
      klass.register();
    }
  }, {
    key: "operationKind",
    value: "text-object",
    enumerable: true
  }]);

  return TextObject;
})(Base);

TextObject.register(false);

// Section: Word
// =========================

var Word = (function (_TextObject) {
  _inherits(Word, _TextObject);

  function Word() {
    _classCallCheck(this, Word);

    _get(Object.getPrototypeOf(Word.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(Word, [{
    key: "getRange",
    value: function getRange(selection) {
      var point = this.getCursorPositionForSelection(selection);

      var _getWordBufferRangeAndKindAtBufferPosition = this.getWordBufferRangeAndKindAtBufferPosition(point, { wordRegex: this.wordRegex });

      var range = _getWordBufferRangeAndKindAtBufferPosition.range;

      return this.isA() ? this.utils.expandRangeToWhiteSpaces(this.editor, range) : range;
    }
  }]);

  return Word;
})(TextObject);

Word.register(false, true);

var WholeWord = (function (_Word) {
  _inherits(WholeWord, _Word);

  function WholeWord() {
    _classCallCheck(this, WholeWord);

    _get(Object.getPrototypeOf(WholeWord.prototype), "constructor", this).apply(this, arguments);

    this.wordRegex = /\S+/;
  }

  return WholeWord;
})(Word);

WholeWord.register(false, true);

// Just include _, -

var SmartWord = (function (_Word2) {
  _inherits(SmartWord, _Word2);

  function SmartWord() {
    _classCallCheck(this, SmartWord);

    _get(Object.getPrototypeOf(SmartWord.prototype), "constructor", this).apply(this, arguments);

    this.wordRegex = /[\w-]+/;
  }

  return SmartWord;
})(Word);

SmartWord.register(false, true);

// Just include _, -

var Subword = (function (_Word3) {
  _inherits(Subword, _Word3);

  function Subword() {
    _classCallCheck(this, Subword);

    _get(Object.getPrototypeOf(Subword.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(Subword, [{
    key: "getRange",
    value: function getRange(selection) {
      this.wordRegex = selection.cursor.subwordRegExp();
      return _get(Object.getPrototypeOf(Subword.prototype), "getRange", this).call(this, selection);
    }
  }]);

  return Subword;
})(Word);

Subword.register(false, true);

// Section: Pair
// =========================

var Pair = (function (_TextObject2) {
  _inherits(Pair, _TextObject2);

  function Pair() {
    _classCallCheck(this, Pair);

    _get(Object.getPrototypeOf(Pair.prototype), "constructor", this).apply(this, arguments);

    this.supportCount = true;
    this.allowNextLine = null;
    this.adjustInnerRange = true;
    this.pair = null;
    this.inclusive = true;
  }

  _createClass(Pair, [{
    key: "isAllowNextLine",
    value: function isAllowNextLine() {
      return this.allowNextLine != null ? this.allowNextLine : this.pair != null && this.pair[0] !== this.pair[1];
    }
  }, {
    key: "adjustRange",
    value: function adjustRange(_ref3) {
      var start = _ref3.start;
      var end = _ref3.end;

      // Dirty work to feel natural for human, to behave compatible with pure Vim.
      // Where this adjustment appear is in following situation.
      // op-1: `ci{` replace only 2nd line
      // op-2: `di{` delete only 2nd line.
      // text:
      //  {
      //    aaa
      //  }
      if (this.utils.pointIsAtEndOfLine(this.editor, start)) {
        start = start.traverse([1, 0]);
      }

      if (this.utils.getLineTextToBufferPosition(this.editor, end).match(/^\s*$/)) {
        if (this.mode === "visual") {
          // This is slightly innconsistent with regular Vim
          // - regular Vim: select new line after EOL
          // - vim-mode-plus: select to EOL(before new line)
          // This is intentional since to make submode `characterwise` when auto-detect submode
          // innerEnd = new Point(innerEnd.row - 1, Infinity)
          end = new Point(end.row - 1, Infinity);
        } else {
          end = new Point(end.row, 0);
        }
      }
      return new Range(start, end);
    }
  }, {
    key: "getFinder",
    value: function getFinder() {
      var finderName = this.pair[0] === this.pair[1] ? "QuoteFinder" : "BracketFinder";
      return new PairFinder[finderName](this.editor, {
        allowNextLine: this.isAllowNextLine(),
        allowForwarding: this.allowForwarding,
        pair: this.pair,
        inclusive: this.inclusive
      });
    }
  }, {
    key: "getPairInfo",
    value: function getPairInfo(from) {
      var pairInfo = this.getFinder().find(from);
      if (pairInfo) {
        if (this.adjustInnerRange) pairInfo.innerRange = this.adjustRange(pairInfo.innerRange);
        pairInfo.targetRange = this.isInner() ? pairInfo.innerRange : pairInfo.aRange;
        return pairInfo;
      }
    }
  }, {
    key: "getRange",
    value: function getRange(selection) {
      var originalRange = selection.getBufferRange();
      var pairInfo = this.getPairInfo(this.getCursorPositionForSelection(selection));
      // When range was same, try to expand range
      if (pairInfo && pairInfo.targetRange.isEqual(originalRange)) {
        pairInfo = this.getPairInfo(pairInfo.aRange.end);
      }
      if (pairInfo) return pairInfo.targetRange;
    }
  }]);

  return Pair;
})(TextObject);

Pair.register(false);

// Used by DeleteSurround

var APair = (function (_Pair) {
  _inherits(APair, _Pair);

  function APair() {
    _classCallCheck(this, APair);

    _get(Object.getPrototypeOf(APair.prototype), "constructor", this).apply(this, arguments);
  }

  return APair;
})(Pair);

APair.register(false);

var AnyPair = (function (_Pair2) {
  _inherits(AnyPair, _Pair2);

  function AnyPair() {
    _classCallCheck(this, AnyPair);

    _get(Object.getPrototypeOf(AnyPair.prototype), "constructor", this).apply(this, arguments);

    this.allowForwarding = false;
    this.member = ["DoubleQuote", "SingleQuote", "BackTick", "CurlyBracket", "AngleBracket", "SquareBracket", "Parenthesis"];
  }

  _createClass(AnyPair, [{
    key: "getRanges",
    value: function getRanges(selection) {
      var _this2 = this;

      var options = { inner: this.inner, allowForwarding: this.allowForwarding, inclusive: this.inclusive };
      return this.member.map(function (member) {
        return _this2.getInstance(member, options).getRange(selection);
      }).filter(function (range) {
        return range;
      });
    }
  }, {
    key: "getRange",
    value: function getRange(selection) {
      return _.last(this.utils.sortRanges(this.getRanges(selection)));
    }
  }]);

  return AnyPair;
})(Pair);

AnyPair.register(false, true);

var AnyPairAllowForwarding = (function (_AnyPair) {
  _inherits(AnyPairAllowForwarding, _AnyPair);

  function AnyPairAllowForwarding() {
    _classCallCheck(this, AnyPairAllowForwarding);

    _get(Object.getPrototypeOf(AnyPairAllowForwarding.prototype), "constructor", this).apply(this, arguments);

    this.allowForwarding = true;
  }

  _createClass(AnyPairAllowForwarding, [{
    key: "getRange",
    value: function getRange(selection) {
      var ranges = this.getRanges(selection);
      var from = selection.cursor.getBufferPosition();

      var _$partition = _.partition(ranges, function (range) {
        return range.start.isGreaterThanOrEqual(from);
      });

      var _$partition2 = _slicedToArray(_$partition, 2);

      var forwardingRanges = _$partition2[0];
      var enclosingRanges = _$partition2[1];

      var enclosingRange = _.last(this.utils.sortRanges(enclosingRanges));
      forwardingRanges = this.utils.sortRanges(forwardingRanges);

      // When enclosingRange is exists,
      // We don't go across enclosingRange.end.
      // So choose from ranges contained in enclosingRange.
      if (enclosingRange) {
        forwardingRanges = forwardingRanges.filter(function (range) {
          return enclosingRange.containsRange(range);
        });
      }

      return forwardingRanges[0] || enclosingRange;
    }
  }]);

  return AnyPairAllowForwarding;
})(AnyPair);

AnyPairAllowForwarding.register(false, true);

var AnyQuote = (function (_AnyPair2) {
  _inherits(AnyQuote, _AnyPair2);

  function AnyQuote() {
    _classCallCheck(this, AnyQuote);

    _get(Object.getPrototypeOf(AnyQuote.prototype), "constructor", this).apply(this, arguments);

    this.allowForwarding = true;
    this.member = ["DoubleQuote", "SingleQuote", "BackTick"];
  }

  _createClass(AnyQuote, [{
    key: "getRange",
    value: function getRange(selection) {
      var ranges = this.getRanges(selection);
      // Pick range which end.colum is leftmost(mean, closed first)
      if (ranges.length) return _.first(_.sortBy(ranges, function (r) {
        return r.end.column;
      }));
    }
  }]);

  return AnyQuote;
})(AnyPair);

AnyQuote.register(false, true);

var Quote = (function (_Pair3) {
  _inherits(Quote, _Pair3);

  function Quote() {
    _classCallCheck(this, Quote);

    _get(Object.getPrototypeOf(Quote.prototype), "constructor", this).apply(this, arguments);

    this.allowForwarding = true;
  }

  return Quote;
})(Pair);

Quote.register(false);

var DoubleQuote = (function (_Quote) {
  _inherits(DoubleQuote, _Quote);

  function DoubleQuote() {
    _classCallCheck(this, DoubleQuote);

    _get(Object.getPrototypeOf(DoubleQuote.prototype), "constructor", this).apply(this, arguments);

    this.pair = ['"', '"'];
  }

  return DoubleQuote;
})(Quote);

DoubleQuote.register(false, true);

var SingleQuote = (function (_Quote2) {
  _inherits(SingleQuote, _Quote2);

  function SingleQuote() {
    _classCallCheck(this, SingleQuote);

    _get(Object.getPrototypeOf(SingleQuote.prototype), "constructor", this).apply(this, arguments);

    this.pair = ["'", "'"];
  }

  return SingleQuote;
})(Quote);

SingleQuote.register(false, true);

var BackTick = (function (_Quote3) {
  _inherits(BackTick, _Quote3);

  function BackTick() {
    _classCallCheck(this, BackTick);

    _get(Object.getPrototypeOf(BackTick.prototype), "constructor", this).apply(this, arguments);

    this.pair = ["`", "`"];
  }

  return BackTick;
})(Quote);

BackTick.register(false, true);

var CurlyBracket = (function (_Pair4) {
  _inherits(CurlyBracket, _Pair4);

  function CurlyBracket() {
    _classCallCheck(this, CurlyBracket);

    _get(Object.getPrototypeOf(CurlyBracket.prototype), "constructor", this).apply(this, arguments);

    this.pair = ["{", "}"];
  }

  return CurlyBracket;
})(Pair);

CurlyBracket.register(false, true, true);

var SquareBracket = (function (_Pair5) {
  _inherits(SquareBracket, _Pair5);

  function SquareBracket() {
    _classCallCheck(this, SquareBracket);

    _get(Object.getPrototypeOf(SquareBracket.prototype), "constructor", this).apply(this, arguments);

    this.pair = ["[", "]"];
  }

  return SquareBracket;
})(Pair);

SquareBracket.register(false, true, true);

var Parenthesis = (function (_Pair6) {
  _inherits(Parenthesis, _Pair6);

  function Parenthesis() {
    _classCallCheck(this, Parenthesis);

    _get(Object.getPrototypeOf(Parenthesis.prototype), "constructor", this).apply(this, arguments);

    this.pair = ["(", ")"];
  }

  return Parenthesis;
})(Pair);

Parenthesis.register(false, true, true);

var AngleBracket = (function (_Pair7) {
  _inherits(AngleBracket, _Pair7);

  function AngleBracket() {
    _classCallCheck(this, AngleBracket);

    _get(Object.getPrototypeOf(AngleBracket.prototype), "constructor", this).apply(this, arguments);

    this.pair = ["<", ">"];
  }

  return AngleBracket;
})(Pair);

AngleBracket.register(false, true, true);

var Tag = (function (_Pair8) {
  _inherits(Tag, _Pair8);

  function Tag() {
    _classCallCheck(this, Tag);

    _get(Object.getPrototypeOf(Tag.prototype), "constructor", this).apply(this, arguments);

    this.allowNextLine = true;
    this.allowForwarding = true;
    this.adjustInnerRange = false;
  }

  _createClass(Tag, [{
    key: "getTagStartPoint",
    value: function getTagStartPoint(from) {
      var tagRange = undefined;
      var pattern = PairFinder.TagFinder.pattern;

      this.scanForward(pattern, { from: [from.row, 0] }, function (_ref4) {
        var range = _ref4.range;
        var stop = _ref4.stop;

        if (range.containsPoint(from, true)) {
          tagRange = range;
          stop();
        }
      });
      if (tagRange) return tagRange.start;
    }
  }, {
    key: "getFinder",
    value: function getFinder() {
      return new PairFinder.TagFinder(this.editor, {
        allowNextLine: this.isAllowNextLine(),
        allowForwarding: this.allowForwarding,
        inclusive: this.inclusive
      });
    }
  }, {
    key: "getPairInfo",
    value: function getPairInfo(from) {
      return _get(Object.getPrototypeOf(Tag.prototype), "getPairInfo", this).call(this, this.getTagStartPoint(from) || from);
    }
  }]);

  return Tag;
})(Pair);

Tag.register(false, true);

// Section: Paragraph
// =========================
// Paragraph is defined as consecutive (non-)blank-line.

var Paragraph = (function (_TextObject3) {
  _inherits(Paragraph, _TextObject3);

  function Paragraph() {
    _classCallCheck(this, Paragraph);

    _get(Object.getPrototypeOf(Paragraph.prototype), "constructor", this).apply(this, arguments);

    this.wise = "linewise";
    this.supportCount = true;
  }

  _createClass(Paragraph, [{
    key: "findRow",
    value: function findRow(fromRow, direction, fn) {
      if (fn.reset) fn.reset();
      var foundRow = fromRow;
      for (var row of this.getBufferRows({ startRow: fromRow, direction: direction })) {
        if (!fn(row, direction)) break;
        foundRow = row;
      }
      return foundRow;
    }
  }, {
    key: "findRowRangeBy",
    value: function findRowRangeBy(fromRow, fn) {
      var startRow = this.findRow(fromRow, "previous", fn);
      var endRow = this.findRow(fromRow, "next", fn);
      return [startRow, endRow];
    }
  }, {
    key: "getPredictFunction",
    value: function getPredictFunction(fromRow, selection) {
      var _this3 = this;

      var fromRowResult = this.editor.isBufferRowBlank(fromRow);

      if (this.isInner()) {
        return function (row, direction) {
          return _this3.editor.isBufferRowBlank(row) === fromRowResult;
        };
      } else {
        var _ret = (function () {
          var directionToExtend = selection.isReversed() ? "previous" : "next";

          var flip = false;
          var predict = function predict(row, direction) {
            var result = _this3.editor.isBufferRowBlank(row) === fromRowResult;
            if (flip) {
              return !result;
            } else {
              if (!result && direction === directionToExtend) {
                return flip = true;
              }
              return result;
            }
          };
          predict.reset = function () {
            return flip = false;
          };
          return {
            v: predict
          };
        })();

        if (typeof _ret === "object") return _ret.v;
      }
    }
  }, {
    key: "getRange",
    value: function getRange(selection) {
      var originalRange = selection.getBufferRange();
      var fromRow = this.getCursorPositionForSelection(selection).row;
      if (this.isMode("visual", "linewise")) {
        if (selection.isReversed()) fromRow--;else fromRow++;
        fromRow = this.getValidVimBufferRow(fromRow);
      }
      var rowRange = this.findRowRangeBy(fromRow, this.getPredictFunction(fromRow, selection));
      return selection.getBufferRange().union(this.getBufferRangeForRowRange(rowRange));
    }
  }]);

  return Paragraph;
})(TextObject);

Paragraph.register(false, true);

var Indentation = (function (_Paragraph) {
  _inherits(Indentation, _Paragraph);

  function Indentation() {
    _classCallCheck(this, Indentation);

    _get(Object.getPrototypeOf(Indentation.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(Indentation, [{
    key: "getRange",
    value: function getRange(selection) {
      var _this4 = this;

      var fromRow = this.getCursorPositionForSelection(selection).row;
      var baseIndentLevel = this.editor.indentationForBufferRow(fromRow);
      var rowRange = this.findRowRangeBy(fromRow, function (row) {
        return _this4.editor.isBufferRowBlank(row) ? _this4.isA() : _this4.editor.indentationForBufferRow(row) >= baseIndentLevel;
      });
      return this.getBufferRangeForRowRange(rowRange);
    }
  }]);

  return Indentation;
})(Paragraph);

Indentation.register(false, true);

// Section: Comment
// =========================

var Comment = (function (_TextObject4) {
  _inherits(Comment, _TextObject4);

  function Comment() {
    _classCallCheck(this, Comment);

    _get(Object.getPrototypeOf(Comment.prototype), "constructor", this).apply(this, arguments);

    this.wise = "linewise";
  }

  _createClass(Comment, [{
    key: "getRange",
    value: function getRange(selection) {
      var _getCursorPositionForSelection = this.getCursorPositionForSelection(selection);

      var row = _getCursorPositionForSelection.row;

      var rowRange = this.utils.getRowRangeForCommentAtBufferRow(this.editor, row);
      if (rowRange) {
        return this.getBufferRangeForRowRange(rowRange);
      }
    }
  }]);

  return Comment;
})(TextObject);

Comment.register(false, true);

var CommentOrParagraph = (function (_TextObject5) {
  _inherits(CommentOrParagraph, _TextObject5);

  function CommentOrParagraph() {
    _classCallCheck(this, CommentOrParagraph);

    _get(Object.getPrototypeOf(CommentOrParagraph.prototype), "constructor", this).apply(this, arguments);

    this.wise = "linewise";
  }

  _createClass(CommentOrParagraph, [{
    key: "getRange",
    value: function getRange(selection) {
      var inner = this.inner;

      for (var klass of ["Comment", "Paragraph"]) {
        var range = this.getInstance(klass, { inner: inner }).getRange(selection);
        if (range) return range;
      }
    }
  }]);

  return CommentOrParagraph;
})(TextObject);

CommentOrParagraph.register(false, true);

// Section: Fold
// =========================

var Fold = (function (_TextObject6) {
  _inherits(Fold, _TextObject6);

  function Fold() {
    _classCallCheck(this, Fold);

    _get(Object.getPrototypeOf(Fold.prototype), "constructor", this).apply(this, arguments);

    this.wise = "linewise";
  }

  _createClass(Fold, [{
    key: "adjustRowRange",
    value: function adjustRowRange(rowRange) {
      if (this.isA()) return rowRange;

      var _rowRange = _slicedToArray(rowRange, 2);

      var startRow = _rowRange[0];
      var endRow = _rowRange[1];

      if (this.editor.indentationForBufferRow(startRow) === this.editor.indentationForBufferRow(endRow)) {
        endRow -= 1;
      }
      startRow += 1;
      return [startRow, endRow];
    }
  }, {
    key: "getFoldRowRangesContainsForRow",
    value: function getFoldRowRangesContainsForRow(row) {
      return this.utils.getCodeFoldRowRangesContainesForRow(this.editor, row).reverse();
    }
  }, {
    key: "getRange",
    value: function getRange(selection) {
      var _getCursorPositionForSelection2 = this.getCursorPositionForSelection(selection);

      var row = _getCursorPositionForSelection2.row;

      var selectedRange = selection.getBufferRange();
      for (var rowRange of this.getFoldRowRangesContainsForRow(row)) {
        var range = this.getBufferRangeForRowRange(this.adjustRowRange(rowRange));

        // Don't change to `if range.containsRange(selectedRange, true)`
        // There is behavior diff when cursor is at beginning of line( column 0 ).
        if (!selectedRange.containsRange(range)) return range;
      }
    }
  }]);

  return Fold;
})(TextObject);

Fold.register(false, true);

// NOTE: Function range determination is depending on fold.

var Function = (function (_Fold) {
  _inherits(Function, _Fold);

  function Function() {
    _classCallCheck(this, Function);

    _get(Object.getPrototypeOf(Function.prototype), "constructor", this).apply(this, arguments);

    this.scopeNamesOmittingEndRow = ["source.go", "source.elixir"];
  }

  _createClass(Function, [{
    key: "isGrammarNotFoldEndRow",
    value: function isGrammarNotFoldEndRow() {
      var _editor$getGrammar = this.editor.getGrammar();

      var scopeName = _editor$getGrammar.scopeName;
      var packageName = _editor$getGrammar.packageName;

      if (this.scopeNamesOmittingEndRow.includes(scopeName)) {
        return true;
      } else {
        // HACK: Rust have two package `language-rust` and `atom-language-rust`
        // language-rust don't fold ending `}`, but atom-language-rust does.
        return scopeName === "source.rust" && packageName === "language-rust";
      }
    }
  }, {
    key: "getFoldRowRangesContainsForRow",
    value: function getFoldRowRangesContainsForRow(row) {
      var _this5 = this;

      return _get(Object.getPrototypeOf(Function.prototype), "getFoldRowRangesContainsForRow", this).call(this, row).filter(function (rowRange) {
        return _this5.utils.isIncludeFunctionScopeForRow(_this5.editor, rowRange[0]);
      });
    }
  }, {
    key: "adjustRowRange",
    value: function adjustRowRange(rowRange) {
      var _get$call = _get(Object.getPrototypeOf(Function.prototype), "adjustRowRange", this).call(this, rowRange);

      var _get$call2 = _slicedToArray(_get$call, 2);

      var startRow = _get$call2[0];
      var endRow = _get$call2[1];

      // NOTE: This adjustment shoud not be necessary if language-syntax is properly defined.
      if (this.isA() && this.isGrammarNotFoldEndRow()) endRow += 1;
      return [startRow, endRow];
    }
  }]);

  return Function;
})(Fold);

Function.register(false, true);

// Section: Other
// =========================

var Arguments = (function (_TextObject7) {
  _inherits(Arguments, _TextObject7);

  function Arguments() {
    _classCallCheck(this, Arguments);

    _get(Object.getPrototypeOf(Arguments.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(Arguments, [{
    key: "newArgInfo",
    value: function newArgInfo(argStart, arg, separator) {
      var argEnd = this.utils.traverseTextFromPoint(argStart, arg);
      var argRange = new Range(argStart, argEnd);

      var separatorEnd = this.utils.traverseTextFromPoint(argEnd, separator != null ? separator : "");
      var separatorRange = new Range(argEnd, separatorEnd);

      var innerRange = argRange;
      var aRange = argRange.union(separatorRange);
      return { argRange: argRange, separatorRange: separatorRange, innerRange: innerRange, aRange: aRange };
    }
  }, {
    key: "getArgumentsRangeForSelection",
    value: function getArgumentsRangeForSelection(selection) {
      var options = {
        member: ["CurlyBracket", "SquareBracket", "Parenthesis"],
        inclusive: false
      };
      return this.getInstance("InnerAnyPair", options).getRange(selection);
    }
  }, {
    key: "getRange",
    value: function getRange(selection) {
      var range = this.getArgumentsRangeForSelection(selection);
      var pairRangeFound = range != null;

      range = range || this.getInstance("InnerCurrentLine").getRange(selection); // fallback
      if (!range) return;

      range = this.utils.trimRange(this.editor, range);

      var text = this.editor.getTextInBufferRange(range);
      var allTokens = this.utils.splitArguments(text, pairRangeFound);

      var argInfos = [];
      var argStart = range.start;

      // Skip starting separator
      if (allTokens.length && allTokens[0].type === "separator") {
        var token = allTokens.shift();
        argStart = this.utils.traverseTextFromPoint(argStart, token.text);
      }

      while (allTokens.length) {
        var token = allTokens.shift();
        if (token.type === "argument") {
          var nextToken = allTokens.shift();
          var separator = nextToken ? nextToken.text : undefined;
          var argInfo = this.newArgInfo(argStart, token.text, separator);

          if (allTokens.length === 0 && argInfos.length) {
            argInfo.aRange = argInfo.argRange.union(_.last(argInfos).separatorRange);
          }

          argStart = argInfo.aRange.end;
          argInfos.push(argInfo);
        } else {
          throw new Error("must not happen");
        }
      }

      var point = this.getCursorPositionForSelection(selection);
      for (var _ref52 of argInfos) {
        var innerRange = _ref52.innerRange;
        var aRange = _ref52.aRange;

        if (innerRange.end.isGreaterThanOrEqual(point)) {
          return this.isInner() ? innerRange : aRange;
        }
      }
    }
  }]);

  return Arguments;
})(TextObject);

Arguments.register(false, true);

var CurrentLine = (function (_TextObject8) {
  _inherits(CurrentLine, _TextObject8);

  function CurrentLine() {
    _classCallCheck(this, CurrentLine);

    _get(Object.getPrototypeOf(CurrentLine.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(CurrentLine, [{
    key: "getRange",
    value: function getRange(selection) {
      var _getCursorPositionForSelection3 = this.getCursorPositionForSelection(selection);

      var row = _getCursorPositionForSelection3.row;

      var range = this.editor.bufferRangeForBufferRow(row);
      return this.isA() ? range : this.utils.trimRange(this.editor, range);
    }
  }]);

  return CurrentLine;
})(TextObject);

CurrentLine.register(false, true);

var Entire = (function (_TextObject9) {
  _inherits(Entire, _TextObject9);

  function Entire() {
    _classCallCheck(this, Entire);

    _get(Object.getPrototypeOf(Entire.prototype), "constructor", this).apply(this, arguments);

    this.wise = "linewise";
    this.selectOnce = true;
  }

  _createClass(Entire, [{
    key: "getRange",
    value: function getRange(selection) {
      return this.editor.buffer.getRange();
    }
  }]);

  return Entire;
})(TextObject);

Entire.register(false, true);

var Empty = (function (_TextObject10) {
  _inherits(Empty, _TextObject10);

  function Empty() {
    _classCallCheck(this, Empty);

    _get(Object.getPrototypeOf(Empty.prototype), "constructor", this).apply(this, arguments);

    this.selectOnce = true;
  }

  return Empty;
})(TextObject);

Empty.register(false);

var LatestChange = (function (_TextObject11) {
  _inherits(LatestChange, _TextObject11);

  function LatestChange() {
    _classCallCheck(this, LatestChange);

    _get(Object.getPrototypeOf(LatestChange.prototype), "constructor", this).apply(this, arguments);

    this.wise = null;
    this.selectOnce = true;
  }

  _createClass(LatestChange, [{
    key: "getRange",
    value: function getRange(selection) {
      var start = this.vimState.mark.get("[");
      var end = this.vimState.mark.get("]");
      if (start && end) {
        return new Range(start, end);
      }
    }
  }]);

  return LatestChange;
})(TextObject);

LatestChange.register(false, true);

var SearchMatchForward = (function (_TextObject12) {
  _inherits(SearchMatchForward, _TextObject12);

  function SearchMatchForward() {
    _classCallCheck(this, SearchMatchForward);

    _get(Object.getPrototypeOf(SearchMatchForward.prototype), "constructor", this).apply(this, arguments);

    this.backward = false;
  }

  _createClass(SearchMatchForward, [{
    key: "findMatch",
    value: function findMatch(fromPoint, pattern) {
      if (this.mode === "visual") {
        fromPoint = this.utils.translatePointAndClip(this.editor, fromPoint, "forward");
      }
      var foundRange = undefined;
      this.scanForward(pattern, { from: [fromPoint.row, 0] }, function (_ref6) {
        var range = _ref6.range;
        var stop = _ref6.stop;

        if (range.end.isGreaterThan(fromPoint)) {
          foundRange = range;
          stop();
        }
      });
      return { range: foundRange, whichIsHead: "end" };
    }
  }, {
    key: "getRange",
    value: function getRange(selection) {
      var pattern = this.globalState.get("lastSearchPattern");
      if (!pattern) return;

      var fromPoint = selection.getHeadBufferPosition();

      var _findMatch = this.findMatch(fromPoint, pattern);

      var range = _findMatch.range;
      var whichIsHead = _findMatch.whichIsHead;

      if (range) {
        return this.unionRangeAndDetermineReversedState(selection, range, whichIsHead);
      }
    }
  }, {
    key: "unionRangeAndDetermineReversedState",
    value: function unionRangeAndDetermineReversedState(selection, range, whichIsHead) {
      if (selection.isEmpty()) return range;

      var head = range[whichIsHead];
      var tail = selection.getTailBufferPosition();

      if (this.backward) {
        if (tail.isLessThan(head)) head = this.utils.translatePointAndClip(this.editor, head, "forward");
      } else {
        if (head.isLessThan(tail)) head = this.utils.translatePointAndClip(this.editor, head, "backward");
      }

      this.reversed = head.isLessThan(tail);
      return new Range(tail, head).union(this.swrap(selection).getTailBufferRange());
    }
  }, {
    key: "selectTextObject",
    value: function selectTextObject(selection) {
      var range = this.getRange(selection);
      if (range) {
        this.swrap(selection).setBufferRange(range, { reversed: this.reversed != null ? this.reversed : this.backward });
        return true;
      }
    }
  }]);

  return SearchMatchForward;
})(TextObject);

SearchMatchForward.register();

var SearchMatchBackward = (function (_SearchMatchForward) {
  _inherits(SearchMatchBackward, _SearchMatchForward);

  function SearchMatchBackward() {
    _classCallCheck(this, SearchMatchBackward);

    _get(Object.getPrototypeOf(SearchMatchBackward.prototype), "constructor", this).apply(this, arguments);

    this.backward = true;
  }

  _createClass(SearchMatchBackward, [{
    key: "findMatch",
    value: function findMatch(fromPoint, pattern) {
      if (this.mode === "visual") {
        fromPoint = this.utils.translatePointAndClip(this.editor, fromPoint, "backward");
      }
      var foundRange = undefined;
      this.scanBackward(pattern, { from: [fromPoint.row, Infinity] }, function (_ref7) {
        var range = _ref7.range;
        var stop = _ref7.stop;

        if (range.start.isLessThan(fromPoint)) {
          foundRange = range;
          stop();
        }
      });
      return { range: foundRange, whichIsHead: "start" };
    }
  }]);

  return SearchMatchBackward;
})(SearchMatchForward);

SearchMatchBackward.register();

// [Limitation: won't fix]: Selected range is not submode aware. always characterwise.
// So even if original selection was vL or vB, selected range by this text-object
// is always vC range.

var PreviousSelection = (function (_TextObject13) {
  _inherits(PreviousSelection, _TextObject13);

  function PreviousSelection() {
    _classCallCheck(this, PreviousSelection);

    _get(Object.getPrototypeOf(PreviousSelection.prototype), "constructor", this).apply(this, arguments);

    this.wise = null;
    this.selectOnce = true;
  }

  _createClass(PreviousSelection, [{
    key: "selectTextObject",
    value: function selectTextObject(selection) {
      var _vimState$previousSelection = this.vimState.previousSelection;
      var properties = _vimState$previousSelection.properties;
      var submode = _vimState$previousSelection.submode;

      if (properties && submode) {
        this.wise = submode;
        this.swrap(this.editor.getLastSelection()).selectByProperties(properties);
        return true;
      }
    }
  }]);

  return PreviousSelection;
})(TextObject);

PreviousSelection.register();

var PersistentSelection = (function (_TextObject14) {
  _inherits(PersistentSelection, _TextObject14);

  function PersistentSelection() {
    _classCallCheck(this, PersistentSelection);

    _get(Object.getPrototypeOf(PersistentSelection.prototype), "constructor", this).apply(this, arguments);

    this.wise = null;
    this.selectOnce = true;
  }

  _createClass(PersistentSelection, [{
    key: "selectTextObject",
    value: function selectTextObject(selection) {
      if (this.vimState.hasPersistentSelections()) {
        this.persistentSelection.setSelectedBufferRanges();
        return true;
      }
    }
  }]);

  return PersistentSelection;
})(TextObject);

PersistentSelection.register(false, true);

// Used only by ReplaceWithRegister and PutBefore and its' children.

var LastPastedRange = (function (_TextObject15) {
  _inherits(LastPastedRange, _TextObject15);

  function LastPastedRange() {
    _classCallCheck(this, LastPastedRange);

    _get(Object.getPrototypeOf(LastPastedRange.prototype), "constructor", this).apply(this, arguments);

    this.wise = null;
    this.selectOnce = true;
  }

  _createClass(LastPastedRange, [{
    key: "selectTextObject",
    value: function selectTextObject(selection) {
      for (selection of this.editor.getSelections()) {
        var range = this.vimState.sequentialPasteManager.getPastedRangeForSelection(selection);
        selection.setBufferRange(range);
      }
      return true;
    }
  }]);

  return LastPastedRange;
})(TextObject);

LastPastedRange.register(false);

var VisibleArea = (function (_TextObject16) {
  _inherits(VisibleArea, _TextObject16);

  function VisibleArea() {
    _classCallCheck(this, VisibleArea);

    _get(Object.getPrototypeOf(VisibleArea.prototype), "constructor", this).apply(this, arguments);

    this.selectOnce = true;
  }

  _createClass(VisibleArea, [{
    key: "getRange",
    value: function getRange(selection) {
      // [BUG?] Need translate to shilnk top and bottom to fit actual row.
      // The reason I need -2 at bottom is because of status bar?
      var range = this.utils.getVisibleBufferRange(this.editor);
      return range.getRows() > this.editor.getRowsPerPage() ? range.translate([+1, 0], [-3, 0]) : range;
    }
  }]);

  return VisibleArea;
})(TextObject);

VisibleArea.register(false, true);
// FIXME #472, #66

// Some language don't include closing `}` into fold.
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL3RleHQtb2JqZWN0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFdBQVcsQ0FBQTs7Ozs7Ozs7Ozs7O2VBRVksT0FBTyxDQUFDLE1BQU0sQ0FBQzs7SUFBL0IsS0FBSyxZQUFMLEtBQUs7SUFBRSxLQUFLLFlBQUwsS0FBSzs7QUFDbkIsSUFBTSxDQUFDLEdBQUcsT0FBTyxDQUFDLGlCQUFpQixDQUFDLENBQUE7Ozs7O0FBS3BDLElBQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQTtBQUM5QixJQUFNLFVBQVUsR0FBRyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUE7O0lBRXJDLFVBQVU7WUFBVixVQUFVOztXQUFWLFVBQVU7MEJBQVYsVUFBVTs7K0JBQVYsVUFBVTs7U0FFZCxRQUFRLEdBQUcsSUFBSTtTQUNmLElBQUksR0FBRyxlQUFlO1NBQ3RCLFlBQVksR0FBRyxLQUFLO1NBQ3BCLFVBQVUsR0FBRyxLQUFLO1NBQ2xCLGVBQWUsR0FBRyxLQUFLOzs7ZUFObkIsVUFBVTs7V0FvQ1AsbUJBQUc7QUFDUixhQUFPLElBQUksQ0FBQyxLQUFLLENBQUE7S0FDbEI7OztXQUVFLGVBQUc7QUFDSixhQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQTtLQUNuQjs7O1dBRVMsc0JBQUc7QUFDWCxhQUFPLElBQUksQ0FBQyxJQUFJLEtBQUssVUFBVSxDQUFBO0tBQ2hDOzs7V0FFVSx1QkFBRztBQUNaLGFBQU8sSUFBSSxDQUFDLElBQUksS0FBSyxXQUFXLENBQUE7S0FDakM7OztXQUVRLG1CQUFDLElBQUksRUFBRTtBQUNkLGFBQVEsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7S0FDMUI7OztXQUVTLHNCQUFHO0FBQ1gsVUFBSSxDQUFDLGVBQWUsR0FBRyxLQUFLLENBQUE7S0FDN0I7Ozs7Ozs7V0FLTSxtQkFBRzs7QUFFUixV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OztlQURiLFdBQVc7O1dBR1Asa0JBQUMsU0FBUyxFQUFFOzs7QUFHbEIsVUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUE7QUFDM0QsYUFBTyxLQUFLLENBQUMsT0FBTyxFQUFFLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxjQUFjLEVBQUUsR0FBRyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQTtLQUNsRzs7O1NBUkcsV0FBVztHQUFTLFVBQVU7O0FBVXBDLFdBQVcsQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFBIiwiZmlsZSI6Ii9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL3RleHQtb2JqZWN0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2UgYmFiZWxcIlxuXG5jb25zdCB7UmFuZ2UsIFBvaW50fSA9IHJlcXVpcmUoXCJhdG9tXCIpXG5jb25zdCBfID0gcmVxdWlyZShcInVuZGVyc2NvcmUtcGx1c1wiKVxuXG4vLyBbVE9ET10gTmVlZCBvdmVyaGF1bFxuLy8gIC0gWyBdIE1ha2UgZXhwYW5kYWJsZSBieSBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKS51bmlvbih0aGlzLmdldFJhbmdlKHNlbGVjdGlvbikpXG4vLyAgLSBbIF0gQ291bnQgc3VwcG9ydChwcmlvcml0eSBsb3cpP1xuY29uc3QgQmFzZSA9IHJlcXVpcmUoXCIuL2Jhc2VcIilcbmNvbnN0IFBhaXJGaW5kZXIgPSByZXF1aXJlKFwiLi9wYWlyLWZpbmRlclwiKVxuXG5jbGFzcyBUZXh0T2JqZWN0IGV4dGVuZHMgQmFzZSB7XG4gIHN0YXRpYyBvcGVyYXRpb25LaW5kID0gXCJ0ZXh0LW9iamVjdFwiXG4gIG9wZXJhdG9yID0gbnVsbFxuICB3aXNlID0gXCJjaGFyYWN0ZXJ3aXNlXCJcbiAgc3VwcG9ydENvdW50ID0gZmFsc2UgLy8gRklYTUUgIzQ3MiwgIzY2XG4gIHNlbGVjdE9uY2UgPSBmYWxzZVxuICBzZWxlY3RTdWNjZWVkZWQgPSBmYWxzZVxuXG4gIHN0YXRpYyByZWdpc3Rlcihpc0NvbW1hbmQsIGRlcml2ZUlubmVyQW5kQSwgZGVyaXZlSW5uZXJBbmRBRm9yQWxsb3dGb3J3YXJkaW5nKSB7XG4gICAgc3VwZXIucmVnaXN0ZXIoaXNDb21tYW5kKVxuXG4gICAgaWYgKGRlcml2ZUlubmVyQW5kQSkge1xuICAgICAgdGhpcy5nZW5lcmF0ZUNsYXNzKGBBJHt0aGlzLm5hbWV9YCwgZmFsc2UpXG4gICAgICB0aGlzLmdlbmVyYXRlQ2xhc3MoYElubmVyJHt0aGlzLm5hbWV9YCwgdHJ1ZSlcbiAgICB9XG5cbiAgICBpZiAoZGVyaXZlSW5uZXJBbmRBRm9yQWxsb3dGb3J3YXJkaW5nKSB7XG4gICAgICB0aGlzLmdlbmVyYXRlQ2xhc3MoYEEke3RoaXMubmFtZX1BbGxvd0ZvcndhcmRpbmdgLCBmYWxzZSwgdHJ1ZSlcbiAgICAgIHRoaXMuZ2VuZXJhdGVDbGFzcyhgSW5uZXIke3RoaXMubmFtZX1BbGxvd0ZvcndhcmRpbmdgLCB0cnVlLCB0cnVlKVxuICAgIH1cbiAgfVxuXG4gIHN0YXRpYyBnZW5lcmF0ZUNsYXNzKGtsYXNzTmFtZSwgaW5uZXIsIGFsbG93Rm9yd2FyZGluZykge1xuICAgIGNvbnN0IGtsYXNzID0gY2xhc3MgZXh0ZW5kcyB0aGlzIHtcbiAgICAgIHN0YXRpYyBnZXQgbmFtZSgpIHtcbiAgICAgICAgcmV0dXJuIGtsYXNzTmFtZVxuICAgICAgfVxuICAgICAgY29uc3RydWN0b3IodmltU3RhdGUpIHtcbiAgICAgICAgc3VwZXIodmltU3RhdGUpXG4gICAgICAgIHRoaXMuaW5uZXIgPSBpbm5lclxuICAgICAgICBpZiAoYWxsb3dGb3J3YXJkaW5nICE9IG51bGwpIHRoaXMuYWxsb3dGb3J3YXJkaW5nID0gYWxsb3dGb3J3YXJkaW5nXG4gICAgICB9XG4gICAgfVxuICAgIGtsYXNzLnJlZ2lzdGVyKClcbiAgfVxuXG4gIGlzSW5uZXIoKSB7XG4gICAgcmV0dXJuIHRoaXMuaW5uZXJcbiAgfVxuXG4gIGlzQSgpIHtcbiAgICByZXR1cm4gIXRoaXMuaW5uZXJcbiAgfVxuXG4gIGlzTGluZXdpc2UoKSB7XG4gICAgcmV0dXJuIHRoaXMud2lzZSA9PT0gXCJsaW5ld2lzZVwiXG4gIH1cblxuICBpc0Jsb2Nrd2lzZSgpIHtcbiAgICByZXR1cm4gdGhpcy53aXNlID09PSBcImJsb2Nrd2lzZVwiXG4gIH1cblxuICBmb3JjZVdpc2Uod2lzZSkge1xuICAgIHJldHVybiAodGhpcy53aXNlID0gd2lzZSkgLy8gRklYTUUgY3VycmVudGx5IG5vdCB3ZWxsIHN1cHBvcnRlZFxuICB9XG5cbiAgcmVzZXRTdGF0ZSgpIHtcbiAgICB0aGlzLnNlbGVjdFN1Y2NlZWRlZCA9IGZhbHNlXG4gIH1cblxuICAvLyBleGVjdXRlOiBDYWxsZWQgZnJvbSBPcGVyYXRvcjo6c2VsZWN0VGFyZ2V0KClcbiAgLy8gIC0gYHYgaSBwYCwgaXMgYFZpc3VhbE1vZGVTZWxlY3RgIG9wZXJhdG9yIHdpdGggQHRhcmdldCA9IGBJbm5lclBhcmFncmFwaGAuXG4gIC8vICAtIGBkIGkgcGAsIGlzIGBEZWxldGVgIG9wZXJhdG9yIHdpdGggQHRhcmdldCA9IGBJbm5lclBhcmFncmFwaGAuXG4gIGV4ZWN1dGUoKSB7XG4gICAgLy8gV2hlbm5ldmVyIFRleHRPYmplY3QgaXMgZXhlY3V0ZWQsIGl0IGhhcyBAb3BlcmF0b3JcbiAgICBpZiAoIXRoaXMub3BlcmF0b3IpIHRocm93IG5ldyBFcnJvcihcImluIFRleHRPYmplY3Q6IE11c3Qgbm90IGhhcHBlblwiKVxuICAgIHRoaXMuc2VsZWN0KClcbiAgfVxuXG4gIHNlbGVjdCgpIHtcbiAgICBpZiAodGhpcy5pc01vZGUoXCJ2aXN1YWxcIiwgXCJibG9ja3dpc2VcIikpIHtcbiAgICAgIHRoaXMuc3dyYXAubm9ybWFsaXplKHRoaXMuZWRpdG9yKVxuICAgIH1cblxuICAgIHRoaXMuY291bnRUaW1lcyh0aGlzLmdldENvdW50KCksICh7c3RvcH0pID0+IHtcbiAgICAgIGlmICghdGhpcy5zdXBwb3J0Q291bnQpIHN0b3AoKSAvLyBxdWljay1maXggZm9yICM1NjBcblxuICAgICAgZm9yIChjb25zdCBzZWxlY3Rpb24gb2YgdGhpcy5lZGl0b3IuZ2V0U2VsZWN0aW9ucygpKSB7XG4gICAgICAgIGNvbnN0IG9sZFJhbmdlID0gc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKClcbiAgICAgICAgaWYgKHRoaXMuc2VsZWN0VGV4dE9iamVjdChzZWxlY3Rpb24pKSB0aGlzLnNlbGVjdFN1Y2NlZWRlZCA9IHRydWVcbiAgICAgICAgaWYgKHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpLmlzRXF1YWwob2xkUmFuZ2UpKSBzdG9wKClcbiAgICAgICAgaWYgKHRoaXMuc2VsZWN0T25jZSkgYnJlYWtcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgdGhpcy5lZGl0b3IubWVyZ2VJbnRlcnNlY3RpbmdTZWxlY3Rpb25zKClcbiAgICAvLyBTb21lIFRleHRPYmplY3QncyB3aXNlIGlzIE5PVCBkZXRlcm1pbmlzdGljLiBJdCBoYXMgdG8gYmUgZGV0ZWN0ZWQgZnJvbSBzZWxlY3RlZCByYW5nZS5cbiAgICBpZiAodGhpcy53aXNlID09IG51bGwpIHRoaXMud2lzZSA9IHRoaXMuc3dyYXAuZGV0ZWN0V2lzZSh0aGlzLmVkaXRvcilcblxuICAgIGlmICh0aGlzLm9wZXJhdG9yLmluc3RhbmNlb2YoXCJTZWxlY3RCYXNlXCIpKSB7XG4gICAgICBpZiAodGhpcy5zZWxlY3RTdWNjZWVkZWQpIHtcbiAgICAgICAgaWYgKHRoaXMud2lzZSA9PT0gXCJjaGFyYWN0ZXJ3aXNlXCIpIHtcbiAgICAgICAgICB0aGlzLnN3cmFwLnNhdmVQcm9wZXJ0aWVzKHRoaXMuZWRpdG9yLCB7Zm9yY2U6IHRydWV9KVxuXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy53aXNlID09PSBcImxpbmV3aXNlXCIpIHtcbiAgICAgICAgICAvLyBXaGVuIHRhcmdldCBpcyBwZXJzaXN0ZW50LXNlbGVjdGlvbiwgbmV3IHNlbGVjdGlvbiBpcyBhZGRlZCBhZnRlciBzZWxlY3RUZXh0T2JqZWN0LlxuICAgICAgICAgIC8vIFNvIHdlIGhhdmUgdG8gYXNzdXJlIGFsbCBzZWxlY3Rpb24gaGF2ZSBzZWxjdGlvbiBwcm9wZXJ0eS5cbiAgICAgICAgICAvLyBNYXliZSB0aGlzIGxvZ2ljIGNhbiBiZSBtb3ZlZCB0byBvcGVyYXRpb24gc3RhY2suXG4gICAgICAgICAgZm9yIChjb25zdCAkc2VsZWN0aW9uIG9mIHRoaXMuc3dyYXAuZ2V0U2VsZWN0aW9ucyh0aGlzLmVkaXRvcikpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmdldENvbmZpZyhcInN0YXlPblNlbGVjdFRleHRPYmplY3RcIikpIHtcbiAgICAgICAgICAgICAgaWYgKCEkc2VsZWN0aW9uLmhhc1Byb3BlcnRpZXMoKSkgJHNlbGVjdGlvbi5zYXZlUHJvcGVydGllcygpXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAkc2VsZWN0aW9uLnNhdmVQcm9wZXJ0aWVzKClcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICRzZWxlY3Rpb24uZml4UHJvcGVydHlSb3dUb1Jvd1JhbmdlKClcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuc3VibW9kZSA9PT0gXCJibG9ja3dpc2VcIikge1xuICAgICAgICBmb3IgKGNvbnN0ICRzZWxlY3Rpb24gb2YgdGhpcy5zd3JhcC5nZXRTZWxlY3Rpb25zKHRoaXMuZWRpdG9yKSkge1xuICAgICAgICAgICRzZWxlY3Rpb24ubm9ybWFsaXplKClcbiAgICAgICAgICAkc2VsZWN0aW9uLmFwcGx5V2lzZShcImJsb2Nrd2lzZVwiKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gUmV0dXJuIHRydWUgb3IgZmFsc2VcbiAgc2VsZWN0VGV4dE9iamVjdChzZWxlY3Rpb24pIHtcbiAgICBjb25zdCByYW5nZSA9IHRoaXMuZ2V0UmFuZ2Uoc2VsZWN0aW9uKVxuICAgIGlmIChyYW5nZSkge1xuICAgICAgdGhpcy5zd3JhcChzZWxlY3Rpb24pLnNldEJ1ZmZlclJhbmdlKHJhbmdlKVxuICAgICAgcmV0dXJuIHRydWVcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuICB9XG5cbiAgLy8gdG8gb3ZlcnJpZGVcbiAgZ2V0UmFuZ2Uoc2VsZWN0aW9uKSB7fVxufVxuVGV4dE9iamVjdC5yZWdpc3RlcihmYWxzZSlcblxuLy8gU2VjdGlvbjogV29yZFxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PVxuY2xhc3MgV29yZCBleHRlbmRzIFRleHRPYmplY3Qge1xuICBnZXRSYW5nZShzZWxlY3Rpb24pIHtcbiAgICBjb25zdCBwb2ludCA9IHRoaXMuZ2V0Q3Vyc29yUG9zaXRpb25Gb3JTZWxlY3Rpb24oc2VsZWN0aW9uKVxuICAgIGNvbnN0IHtyYW5nZX0gPSB0aGlzLmdldFdvcmRCdWZmZXJSYW5nZUFuZEtpbmRBdEJ1ZmZlclBvc2l0aW9uKHBvaW50LCB7d29yZFJlZ2V4OiB0aGlzLndvcmRSZWdleH0pXG4gICAgcmV0dXJuIHRoaXMuaXNBKCkgPyB0aGlzLnV0aWxzLmV4cGFuZFJhbmdlVG9XaGl0ZVNwYWNlcyh0aGlzLmVkaXRvciwgcmFuZ2UpIDogcmFuZ2VcbiAgfVxufVxuV29yZC5yZWdpc3RlcihmYWxzZSwgdHJ1ZSlcblxuY2xhc3MgV2hvbGVXb3JkIGV4dGVuZHMgV29yZCB7XG4gIHdvcmRSZWdleCA9IC9cXFMrL1xufVxuV2hvbGVXb3JkLnJlZ2lzdGVyKGZhbHNlLCB0cnVlKVxuXG4vLyBKdXN0IGluY2x1ZGUgXywgLVxuY2xhc3MgU21hcnRXb3JkIGV4dGVuZHMgV29yZCB7XG4gIHdvcmRSZWdleCA9IC9bXFx3LV0rL1xufVxuU21hcnRXb3JkLnJlZ2lzdGVyKGZhbHNlLCB0cnVlKVxuXG4vLyBKdXN0IGluY2x1ZGUgXywgLVxuY2xhc3MgU3Vid29yZCBleHRlbmRzIFdvcmQge1xuICBnZXRSYW5nZShzZWxlY3Rpb24pIHtcbiAgICB0aGlzLndvcmRSZWdleCA9IHNlbGVjdGlvbi5jdXJzb3Iuc3Vid29yZFJlZ0V4cCgpXG4gICAgcmV0dXJuIHN1cGVyLmdldFJhbmdlKHNlbGVjdGlvbilcbiAgfVxufVxuU3Vid29yZC5yZWdpc3RlcihmYWxzZSwgdHJ1ZSlcblxuLy8gU2VjdGlvbjogUGFpclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PVxuY2xhc3MgUGFpciBleHRlbmRzIFRleHRPYmplY3Qge1xuICBzdXBwb3J0Q291bnQgPSB0cnVlXG4gIGFsbG93TmV4dExpbmUgPSBudWxsXG4gIGFkanVzdElubmVyUmFuZ2UgPSB0cnVlXG4gIHBhaXIgPSBudWxsXG4gIGluY2x1c2l2ZSA9IHRydWVcblxuICBpc0FsbG93TmV4dExpbmUoKSB7XG4gICAgcmV0dXJuIHRoaXMuYWxsb3dOZXh0TGluZSAhPSBudWxsID8gdGhpcy5hbGxvd05leHRMaW5lIDogdGhpcy5wYWlyICE9IG51bGwgJiYgdGhpcy5wYWlyWzBdICE9PSB0aGlzLnBhaXJbMV1cbiAgfVxuXG4gIGFkanVzdFJhbmdlKHtzdGFydCwgZW5kfSkge1xuICAgIC8vIERpcnR5IHdvcmsgdG8gZmVlbCBuYXR1cmFsIGZvciBodW1hbiwgdG8gYmVoYXZlIGNvbXBhdGlibGUgd2l0aCBwdXJlIFZpbS5cbiAgICAvLyBXaGVyZSB0aGlzIGFkanVzdG1lbnQgYXBwZWFyIGlzIGluIGZvbGxvd2luZyBzaXR1YXRpb24uXG4gICAgLy8gb3AtMTogYGNpe2AgcmVwbGFjZSBvbmx5IDJuZCBsaW5lXG4gICAgLy8gb3AtMjogYGRpe2AgZGVsZXRlIG9ubHkgMm5kIGxpbmUuXG4gICAgLy8gdGV4dDpcbiAgICAvLyAge1xuICAgIC8vICAgIGFhYVxuICAgIC8vICB9XG4gICAgaWYgKHRoaXMudXRpbHMucG9pbnRJc0F0RW5kT2ZMaW5lKHRoaXMuZWRpdG9yLCBzdGFydCkpIHtcbiAgICAgIHN0YXJ0ID0gc3RhcnQudHJhdmVyc2UoWzEsIDBdKVxuICAgIH1cblxuICAgIGlmICh0aGlzLnV0aWxzLmdldExpbmVUZXh0VG9CdWZmZXJQb3NpdGlvbih0aGlzLmVkaXRvciwgZW5kKS5tYXRjaCgvXlxccyokLykpIHtcbiAgICAgIGlmICh0aGlzLm1vZGUgPT09IFwidmlzdWFsXCIpIHtcbiAgICAgICAgLy8gVGhpcyBpcyBzbGlnaHRseSBpbm5jb25zaXN0ZW50IHdpdGggcmVndWxhciBWaW1cbiAgICAgICAgLy8gLSByZWd1bGFyIFZpbTogc2VsZWN0IG5ldyBsaW5lIGFmdGVyIEVPTFxuICAgICAgICAvLyAtIHZpbS1tb2RlLXBsdXM6IHNlbGVjdCB0byBFT0woYmVmb3JlIG5ldyBsaW5lKVxuICAgICAgICAvLyBUaGlzIGlzIGludGVudGlvbmFsIHNpbmNlIHRvIG1ha2Ugc3VibW9kZSBgY2hhcmFjdGVyd2lzZWAgd2hlbiBhdXRvLWRldGVjdCBzdWJtb2RlXG4gICAgICAgIC8vIGlubmVyRW5kID0gbmV3IFBvaW50KGlubmVyRW5kLnJvdyAtIDEsIEluZmluaXR5KVxuICAgICAgICBlbmQgPSBuZXcgUG9pbnQoZW5kLnJvdyAtIDEsIEluZmluaXR5KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZW5kID0gbmV3IFBvaW50KGVuZC5yb3csIDApXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBuZXcgUmFuZ2Uoc3RhcnQsIGVuZClcbiAgfVxuXG4gIGdldEZpbmRlcigpIHtcbiAgICBjb25zdCBmaW5kZXJOYW1lID0gdGhpcy5wYWlyWzBdID09PSB0aGlzLnBhaXJbMV0gPyBcIlF1b3RlRmluZGVyXCIgOiBcIkJyYWNrZXRGaW5kZXJcIlxuICAgIHJldHVybiBuZXcgUGFpckZpbmRlcltmaW5kZXJOYW1lXSh0aGlzLmVkaXRvciwge1xuICAgICAgYWxsb3dOZXh0TGluZTogdGhpcy5pc0FsbG93TmV4dExpbmUoKSxcbiAgICAgIGFsbG93Rm9yd2FyZGluZzogdGhpcy5hbGxvd0ZvcndhcmRpbmcsXG4gICAgICBwYWlyOiB0aGlzLnBhaXIsXG4gICAgICBpbmNsdXNpdmU6IHRoaXMuaW5jbHVzaXZlLFxuICAgIH0pXG4gIH1cblxuICBnZXRQYWlySW5mbyhmcm9tKSB7XG4gICAgY29uc3QgcGFpckluZm8gPSB0aGlzLmdldEZpbmRlcigpLmZpbmQoZnJvbSlcbiAgICBpZiAocGFpckluZm8pIHtcbiAgICAgIGlmICh0aGlzLmFkanVzdElubmVyUmFuZ2UpIHBhaXJJbmZvLmlubmVyUmFuZ2UgPSB0aGlzLmFkanVzdFJhbmdlKHBhaXJJbmZvLmlubmVyUmFuZ2UpXG4gICAgICBwYWlySW5mby50YXJnZXRSYW5nZSA9IHRoaXMuaXNJbm5lcigpID8gcGFpckluZm8uaW5uZXJSYW5nZSA6IHBhaXJJbmZvLmFSYW5nZVxuICAgICAgcmV0dXJuIHBhaXJJbmZvXG4gICAgfVxuICB9XG5cbiAgZ2V0UmFuZ2Uoc2VsZWN0aW9uKSB7XG4gICAgY29uc3Qgb3JpZ2luYWxSYW5nZSA9IHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpXG4gICAgbGV0IHBhaXJJbmZvID0gdGhpcy5nZXRQYWlySW5mbyh0aGlzLmdldEN1cnNvclBvc2l0aW9uRm9yU2VsZWN0aW9uKHNlbGVjdGlvbikpXG4gICAgLy8gV2hlbiByYW5nZSB3YXMgc2FtZSwgdHJ5IHRvIGV4cGFuZCByYW5nZVxuICAgIGlmIChwYWlySW5mbyAmJiBwYWlySW5mby50YXJnZXRSYW5nZS5pc0VxdWFsKG9yaWdpbmFsUmFuZ2UpKSB7XG4gICAgICBwYWlySW5mbyA9IHRoaXMuZ2V0UGFpckluZm8ocGFpckluZm8uYVJhbmdlLmVuZClcbiAgICB9XG4gICAgaWYgKHBhaXJJbmZvKSByZXR1cm4gcGFpckluZm8udGFyZ2V0UmFuZ2VcbiAgfVxufVxuUGFpci5yZWdpc3RlcihmYWxzZSlcblxuLy8gVXNlZCBieSBEZWxldGVTdXJyb3VuZFxuY2xhc3MgQVBhaXIgZXh0ZW5kcyBQYWlyIHt9XG5BUGFpci5yZWdpc3RlcihmYWxzZSlcblxuY2xhc3MgQW55UGFpciBleHRlbmRzIFBhaXIge1xuICBhbGxvd0ZvcndhcmRpbmcgPSBmYWxzZVxuICBtZW1iZXIgPSBbXCJEb3VibGVRdW90ZVwiLCBcIlNpbmdsZVF1b3RlXCIsIFwiQmFja1RpY2tcIiwgXCJDdXJseUJyYWNrZXRcIiwgXCJBbmdsZUJyYWNrZXRcIiwgXCJTcXVhcmVCcmFja2V0XCIsIFwiUGFyZW50aGVzaXNcIl1cblxuICBnZXRSYW5nZXMoc2VsZWN0aW9uKSB7XG4gICAgY29uc3Qgb3B0aW9ucyA9IHtpbm5lcjogdGhpcy5pbm5lciwgYWxsb3dGb3J3YXJkaW5nOiB0aGlzLmFsbG93Rm9yd2FyZGluZywgaW5jbHVzaXZlOiB0aGlzLmluY2x1c2l2ZX1cbiAgICByZXR1cm4gdGhpcy5tZW1iZXIubWFwKG1lbWJlciA9PiB0aGlzLmdldEluc3RhbmNlKG1lbWJlciwgb3B0aW9ucykuZ2V0UmFuZ2Uoc2VsZWN0aW9uKSkuZmlsdGVyKHJhbmdlID0+IHJhbmdlKVxuICB9XG5cbiAgZ2V0UmFuZ2Uoc2VsZWN0aW9uKSB7XG4gICAgcmV0dXJuIF8ubGFzdCh0aGlzLnV0aWxzLnNvcnRSYW5nZXModGhpcy5nZXRSYW5nZXMoc2VsZWN0aW9uKSkpXG4gIH1cbn1cbkFueVBhaXIucmVnaXN0ZXIoZmFsc2UsIHRydWUpXG5cbmNsYXNzIEFueVBhaXJBbGxvd0ZvcndhcmRpbmcgZXh0ZW5kcyBBbnlQYWlyIHtcbiAgYWxsb3dGb3J3YXJkaW5nID0gdHJ1ZVxuXG4gIGdldFJhbmdlKHNlbGVjdGlvbikge1xuICAgIGNvbnN0IHJhbmdlcyA9IHRoaXMuZ2V0UmFuZ2VzKHNlbGVjdGlvbilcbiAgICBjb25zdCBmcm9tID0gc2VsZWN0aW9uLmN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXG4gICAgbGV0IFtmb3J3YXJkaW5nUmFuZ2VzLCBlbmNsb3NpbmdSYW5nZXNdID0gXy5wYXJ0aXRpb24ocmFuZ2VzLCByYW5nZSA9PiByYW5nZS5zdGFydC5pc0dyZWF0ZXJUaGFuT3JFcXVhbChmcm9tKSlcbiAgICBjb25zdCBlbmNsb3NpbmdSYW5nZSA9IF8ubGFzdCh0aGlzLnV0aWxzLnNvcnRSYW5nZXMoZW5jbG9zaW5nUmFuZ2VzKSlcbiAgICBmb3J3YXJkaW5nUmFuZ2VzID0gdGhpcy51dGlscy5zb3J0UmFuZ2VzKGZvcndhcmRpbmdSYW5nZXMpXG5cbiAgICAvLyBXaGVuIGVuY2xvc2luZ1JhbmdlIGlzIGV4aXN0cyxcbiAgICAvLyBXZSBkb24ndCBnbyBhY3Jvc3MgZW5jbG9zaW5nUmFuZ2UuZW5kLlxuICAgIC8vIFNvIGNob29zZSBmcm9tIHJhbmdlcyBjb250YWluZWQgaW4gZW5jbG9zaW5nUmFuZ2UuXG4gICAgaWYgKGVuY2xvc2luZ1JhbmdlKSB7XG4gICAgICBmb3J3YXJkaW5nUmFuZ2VzID0gZm9yd2FyZGluZ1Jhbmdlcy5maWx0ZXIocmFuZ2UgPT4gZW5jbG9zaW5nUmFuZ2UuY29udGFpbnNSYW5nZShyYW5nZSkpXG4gICAgfVxuXG4gICAgcmV0dXJuIGZvcndhcmRpbmdSYW5nZXNbMF0gfHwgZW5jbG9zaW5nUmFuZ2VcbiAgfVxufVxuQW55UGFpckFsbG93Rm9yd2FyZGluZy5yZWdpc3RlcihmYWxzZSwgdHJ1ZSlcblxuY2xhc3MgQW55UXVvdGUgZXh0ZW5kcyBBbnlQYWlyIHtcbiAgYWxsb3dGb3J3YXJkaW5nID0gdHJ1ZVxuICBtZW1iZXIgPSBbXCJEb3VibGVRdW90ZVwiLCBcIlNpbmdsZVF1b3RlXCIsIFwiQmFja1RpY2tcIl1cblxuICBnZXRSYW5nZShzZWxlY3Rpb24pIHtcbiAgICBjb25zdCByYW5nZXMgPSB0aGlzLmdldFJhbmdlcyhzZWxlY3Rpb24pXG4gICAgLy8gUGljayByYW5nZSB3aGljaCBlbmQuY29sdW0gaXMgbGVmdG1vc3QobWVhbiwgY2xvc2VkIGZpcnN0KVxuICAgIGlmIChyYW5nZXMubGVuZ3RoKSByZXR1cm4gXy5maXJzdChfLnNvcnRCeShyYW5nZXMsIHIgPT4gci5lbmQuY29sdW1uKSlcbiAgfVxufVxuQW55UXVvdGUucmVnaXN0ZXIoZmFsc2UsIHRydWUpXG5cbmNsYXNzIFF1b3RlIGV4dGVuZHMgUGFpciB7XG4gIGFsbG93Rm9yd2FyZGluZyA9IHRydWVcbn1cblF1b3RlLnJlZ2lzdGVyKGZhbHNlKVxuXG5jbGFzcyBEb3VibGVRdW90ZSBleHRlbmRzIFF1b3RlIHtcbiAgcGFpciA9IFsnXCInLCAnXCInXVxufVxuRG91YmxlUXVvdGUucmVnaXN0ZXIoZmFsc2UsIHRydWUpXG5cbmNsYXNzIFNpbmdsZVF1b3RlIGV4dGVuZHMgUXVvdGUge1xuICBwYWlyID0gW1wiJ1wiLCBcIidcIl1cbn1cblNpbmdsZVF1b3RlLnJlZ2lzdGVyKGZhbHNlLCB0cnVlKVxuXG5jbGFzcyBCYWNrVGljayBleHRlbmRzIFF1b3RlIHtcbiAgcGFpciA9IFtcImBcIiwgXCJgXCJdXG59XG5CYWNrVGljay5yZWdpc3RlcihmYWxzZSwgdHJ1ZSlcblxuY2xhc3MgQ3VybHlCcmFja2V0IGV4dGVuZHMgUGFpciB7XG4gIHBhaXIgPSBbXCJ7XCIsIFwifVwiXVxufVxuQ3VybHlCcmFja2V0LnJlZ2lzdGVyKGZhbHNlLCB0cnVlLCB0cnVlKVxuXG5jbGFzcyBTcXVhcmVCcmFja2V0IGV4dGVuZHMgUGFpciB7XG4gIHBhaXIgPSBbXCJbXCIsIFwiXVwiXVxufVxuU3F1YXJlQnJhY2tldC5yZWdpc3RlcihmYWxzZSwgdHJ1ZSwgdHJ1ZSlcblxuY2xhc3MgUGFyZW50aGVzaXMgZXh0ZW5kcyBQYWlyIHtcbiAgcGFpciA9IFtcIihcIiwgXCIpXCJdXG59XG5QYXJlbnRoZXNpcy5yZWdpc3RlcihmYWxzZSwgdHJ1ZSwgdHJ1ZSlcblxuY2xhc3MgQW5nbGVCcmFja2V0IGV4dGVuZHMgUGFpciB7XG4gIHBhaXIgPSBbXCI8XCIsIFwiPlwiXVxufVxuQW5nbGVCcmFja2V0LnJlZ2lzdGVyKGZhbHNlLCB0cnVlLCB0cnVlKVxuXG5jbGFzcyBUYWcgZXh0ZW5kcyBQYWlyIHtcbiAgYWxsb3dOZXh0TGluZSA9IHRydWVcbiAgYWxsb3dGb3J3YXJkaW5nID0gdHJ1ZVxuICBhZGp1c3RJbm5lclJhbmdlID0gZmFsc2VcblxuICBnZXRUYWdTdGFydFBvaW50KGZyb20pIHtcbiAgICBsZXQgdGFnUmFuZ2VcbiAgICBjb25zdCB7cGF0dGVybn0gPSBQYWlyRmluZGVyLlRhZ0ZpbmRlclxuICAgIHRoaXMuc2NhbkZvcndhcmQocGF0dGVybiwge2Zyb206IFtmcm9tLnJvdywgMF19LCAoe3JhbmdlLCBzdG9wfSkgPT4ge1xuICAgICAgaWYgKHJhbmdlLmNvbnRhaW5zUG9pbnQoZnJvbSwgdHJ1ZSkpIHtcbiAgICAgICAgdGFnUmFuZ2UgPSByYW5nZVxuICAgICAgICBzdG9wKClcbiAgICAgIH1cbiAgICB9KVxuICAgIGlmICh0YWdSYW5nZSkgcmV0dXJuIHRhZ1JhbmdlLnN0YXJ0XG4gIH1cblxuICBnZXRGaW5kZXIoKSB7XG4gICAgcmV0dXJuIG5ldyBQYWlyRmluZGVyLlRhZ0ZpbmRlcih0aGlzLmVkaXRvciwge1xuICAgICAgYWxsb3dOZXh0TGluZTogdGhpcy5pc0FsbG93TmV4dExpbmUoKSxcbiAgICAgIGFsbG93Rm9yd2FyZGluZzogdGhpcy5hbGxvd0ZvcndhcmRpbmcsXG4gICAgICBpbmNsdXNpdmU6IHRoaXMuaW5jbHVzaXZlLFxuICAgIH0pXG4gIH1cblxuICBnZXRQYWlySW5mbyhmcm9tKSB7XG4gICAgcmV0dXJuIHN1cGVyLmdldFBhaXJJbmZvKHRoaXMuZ2V0VGFnU3RhcnRQb2ludChmcm9tKSB8fCBmcm9tKVxuICB9XG59XG5UYWcucmVnaXN0ZXIoZmFsc2UsIHRydWUpXG5cbi8vIFNlY3Rpb246IFBhcmFncmFwaFxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gUGFyYWdyYXBoIGlzIGRlZmluZWQgYXMgY29uc2VjdXRpdmUgKG5vbi0pYmxhbmstbGluZS5cbmNsYXNzIFBhcmFncmFwaCBleHRlbmRzIFRleHRPYmplY3Qge1xuICB3aXNlID0gXCJsaW5ld2lzZVwiXG4gIHN1cHBvcnRDb3VudCA9IHRydWVcblxuICBmaW5kUm93KGZyb21Sb3csIGRpcmVjdGlvbiwgZm4pIHtcbiAgICBpZiAoZm4ucmVzZXQpIGZuLnJlc2V0KClcbiAgICBsZXQgZm91bmRSb3cgPSBmcm9tUm93XG4gICAgZm9yIChjb25zdCByb3cgb2YgdGhpcy5nZXRCdWZmZXJSb3dzKHtzdGFydFJvdzogZnJvbVJvdywgZGlyZWN0aW9ufSkpIHtcbiAgICAgIGlmICghZm4ocm93LCBkaXJlY3Rpb24pKSBicmVha1xuICAgICAgZm91bmRSb3cgPSByb3dcbiAgICB9XG4gICAgcmV0dXJuIGZvdW5kUm93XG4gIH1cblxuICBmaW5kUm93UmFuZ2VCeShmcm9tUm93LCBmbikge1xuICAgIGNvbnN0IHN0YXJ0Um93ID0gdGhpcy5maW5kUm93KGZyb21Sb3csIFwicHJldmlvdXNcIiwgZm4pXG4gICAgY29uc3QgZW5kUm93ID0gdGhpcy5maW5kUm93KGZyb21Sb3csIFwibmV4dFwiLCBmbilcbiAgICByZXR1cm4gW3N0YXJ0Um93LCBlbmRSb3ddXG4gIH1cblxuICBnZXRQcmVkaWN0RnVuY3Rpb24oZnJvbVJvdywgc2VsZWN0aW9uKSB7XG4gICAgY29uc3QgZnJvbVJvd1Jlc3VsdCA9IHRoaXMuZWRpdG9yLmlzQnVmZmVyUm93QmxhbmsoZnJvbVJvdylcblxuICAgIGlmICh0aGlzLmlzSW5uZXIoKSkge1xuICAgICAgcmV0dXJuIChyb3csIGRpcmVjdGlvbikgPT4gdGhpcy5lZGl0b3IuaXNCdWZmZXJSb3dCbGFuayhyb3cpID09PSBmcm9tUm93UmVzdWx0XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGRpcmVjdGlvblRvRXh0ZW5kID0gc2VsZWN0aW9uLmlzUmV2ZXJzZWQoKSA/IFwicHJldmlvdXNcIiA6IFwibmV4dFwiXG5cbiAgICAgIGxldCBmbGlwID0gZmFsc2VcbiAgICAgIGNvbnN0IHByZWRpY3QgPSAocm93LCBkaXJlY3Rpb24pID0+IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gdGhpcy5lZGl0b3IuaXNCdWZmZXJSb3dCbGFuayhyb3cpID09PSBmcm9tUm93UmVzdWx0XG4gICAgICAgIGlmIChmbGlwKSB7XG4gICAgICAgICAgcmV0dXJuICFyZXN1bHRcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAoIXJlc3VsdCAmJiBkaXJlY3Rpb24gPT09IGRpcmVjdGlvblRvRXh0ZW5kKSB7XG4gICAgICAgICAgICByZXR1cm4gKGZsaXAgPSB0cnVlKVxuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gcmVzdWx0XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHByZWRpY3QucmVzZXQgPSAoKSA9PiAoZmxpcCA9IGZhbHNlKVxuICAgICAgcmV0dXJuIHByZWRpY3RcbiAgICB9XG4gIH1cblxuICBnZXRSYW5nZShzZWxlY3Rpb24pIHtcbiAgICBjb25zdCBvcmlnaW5hbFJhbmdlID0gc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKClcbiAgICBsZXQgZnJvbVJvdyA9IHRoaXMuZ2V0Q3Vyc29yUG9zaXRpb25Gb3JTZWxlY3Rpb24oc2VsZWN0aW9uKS5yb3dcbiAgICBpZiAodGhpcy5pc01vZGUoXCJ2aXN1YWxcIiwgXCJsaW5ld2lzZVwiKSkge1xuICAgICAgaWYgKHNlbGVjdGlvbi5pc1JldmVyc2VkKCkpIGZyb21Sb3ctLVxuICAgICAgZWxzZSBmcm9tUm93KytcbiAgICAgIGZyb21Sb3cgPSB0aGlzLmdldFZhbGlkVmltQnVmZmVyUm93KGZyb21Sb3cpXG4gICAgfVxuICAgIGNvbnN0IHJvd1JhbmdlID0gdGhpcy5maW5kUm93UmFuZ2VCeShmcm9tUm93LCB0aGlzLmdldFByZWRpY3RGdW5jdGlvbihmcm9tUm93LCBzZWxlY3Rpb24pKVxuICAgIHJldHVybiBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKS51bmlvbih0aGlzLmdldEJ1ZmZlclJhbmdlRm9yUm93UmFuZ2Uocm93UmFuZ2UpKVxuICB9XG59XG5QYXJhZ3JhcGgucmVnaXN0ZXIoZmFsc2UsIHRydWUpXG5cbmNsYXNzIEluZGVudGF0aW9uIGV4dGVuZHMgUGFyYWdyYXBoIHtcbiAgZ2V0UmFuZ2Uoc2VsZWN0aW9uKSB7XG4gICAgY29uc3QgZnJvbVJvdyA9IHRoaXMuZ2V0Q3Vyc29yUG9zaXRpb25Gb3JTZWxlY3Rpb24oc2VsZWN0aW9uKS5yb3dcbiAgICBjb25zdCBiYXNlSW5kZW50TGV2ZWwgPSB0aGlzLmVkaXRvci5pbmRlbnRhdGlvbkZvckJ1ZmZlclJvdyhmcm9tUm93KVxuICAgIGNvbnN0IHJvd1JhbmdlID0gdGhpcy5maW5kUm93UmFuZ2VCeShmcm9tUm93LCByb3cgPT4ge1xuICAgICAgcmV0dXJuIHRoaXMuZWRpdG9yLmlzQnVmZmVyUm93Qmxhbmsocm93KVxuICAgICAgICA/IHRoaXMuaXNBKClcbiAgICAgICAgOiB0aGlzLmVkaXRvci5pbmRlbnRhdGlvbkZvckJ1ZmZlclJvdyhyb3cpID49IGJhc2VJbmRlbnRMZXZlbFxuICAgIH0pXG4gICAgcmV0dXJuIHRoaXMuZ2V0QnVmZmVyUmFuZ2VGb3JSb3dSYW5nZShyb3dSYW5nZSlcbiAgfVxufVxuSW5kZW50YXRpb24ucmVnaXN0ZXIoZmFsc2UsIHRydWUpXG5cbi8vIFNlY3Rpb246IENvbW1lbnRcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIENvbW1lbnQgZXh0ZW5kcyBUZXh0T2JqZWN0IHtcbiAgd2lzZSA9IFwibGluZXdpc2VcIlxuXG4gIGdldFJhbmdlKHNlbGVjdGlvbikge1xuICAgIGNvbnN0IHtyb3d9ID0gdGhpcy5nZXRDdXJzb3JQb3NpdGlvbkZvclNlbGVjdGlvbihzZWxlY3Rpb24pXG4gICAgY29uc3Qgcm93UmFuZ2UgPSB0aGlzLnV0aWxzLmdldFJvd1JhbmdlRm9yQ29tbWVudEF0QnVmZmVyUm93KHRoaXMuZWRpdG9yLCByb3cpXG4gICAgaWYgKHJvd1JhbmdlKSB7XG4gICAgICByZXR1cm4gdGhpcy5nZXRCdWZmZXJSYW5nZUZvclJvd1JhbmdlKHJvd1JhbmdlKVxuICAgIH1cbiAgfVxufVxuQ29tbWVudC5yZWdpc3RlcihmYWxzZSwgdHJ1ZSlcblxuY2xhc3MgQ29tbWVudE9yUGFyYWdyYXBoIGV4dGVuZHMgVGV4dE9iamVjdCB7XG4gIHdpc2UgPSBcImxpbmV3aXNlXCJcblxuICBnZXRSYW5nZShzZWxlY3Rpb24pIHtcbiAgICBjb25zdCB7aW5uZXJ9ID0gdGhpc1xuICAgIGZvciAoY29uc3Qga2xhc3Mgb2YgW1wiQ29tbWVudFwiLCBcIlBhcmFncmFwaFwiXSkge1xuICAgICAgY29uc3QgcmFuZ2UgPSB0aGlzLmdldEluc3RhbmNlKGtsYXNzLCB7aW5uZXJ9KS5nZXRSYW5nZShzZWxlY3Rpb24pXG4gICAgICBpZiAocmFuZ2UpIHJldHVybiByYW5nZVxuICAgIH1cbiAgfVxufVxuQ29tbWVudE9yUGFyYWdyYXBoLnJlZ2lzdGVyKGZhbHNlLCB0cnVlKVxuXG4vLyBTZWN0aW9uOiBGb2xkXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09XG5jbGFzcyBGb2xkIGV4dGVuZHMgVGV4dE9iamVjdCB7XG4gIHdpc2UgPSBcImxpbmV3aXNlXCJcblxuICBhZGp1c3RSb3dSYW5nZShyb3dSYW5nZSkge1xuICAgIGlmICh0aGlzLmlzQSgpKSByZXR1cm4gcm93UmFuZ2VcblxuICAgIGxldCBbc3RhcnRSb3csIGVuZFJvd10gPSByb3dSYW5nZVxuICAgIGlmICh0aGlzLmVkaXRvci5pbmRlbnRhdGlvbkZvckJ1ZmZlclJvdyhzdGFydFJvdykgPT09IHRoaXMuZWRpdG9yLmluZGVudGF0aW9uRm9yQnVmZmVyUm93KGVuZFJvdykpIHtcbiAgICAgIGVuZFJvdyAtPSAxXG4gICAgfVxuICAgIHN0YXJ0Um93ICs9IDFcbiAgICByZXR1cm4gW3N0YXJ0Um93LCBlbmRSb3ddXG4gIH1cblxuICBnZXRGb2xkUm93UmFuZ2VzQ29udGFpbnNGb3JSb3cocm93KSB7XG4gICAgcmV0dXJuIHRoaXMudXRpbHMuZ2V0Q29kZUZvbGRSb3dSYW5nZXNDb250YWluZXNGb3JSb3codGhpcy5lZGl0b3IsIHJvdykucmV2ZXJzZSgpXG4gIH1cblxuICBnZXRSYW5nZShzZWxlY3Rpb24pIHtcbiAgICBjb25zdCB7cm93fSA9IHRoaXMuZ2V0Q3Vyc29yUG9zaXRpb25Gb3JTZWxlY3Rpb24oc2VsZWN0aW9uKVxuICAgIGNvbnN0IHNlbGVjdGVkUmFuZ2UgPSBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKVxuICAgIGZvciAoY29uc3Qgcm93UmFuZ2Ugb2YgdGhpcy5nZXRGb2xkUm93UmFuZ2VzQ29udGFpbnNGb3JSb3cocm93KSkge1xuICAgICAgY29uc3QgcmFuZ2UgPSB0aGlzLmdldEJ1ZmZlclJhbmdlRm9yUm93UmFuZ2UodGhpcy5hZGp1c3RSb3dSYW5nZShyb3dSYW5nZSkpXG5cbiAgICAgIC8vIERvbid0IGNoYW5nZSB0byBgaWYgcmFuZ2UuY29udGFpbnNSYW5nZShzZWxlY3RlZFJhbmdlLCB0cnVlKWBcbiAgICAgIC8vIFRoZXJlIGlzIGJlaGF2aW9yIGRpZmYgd2hlbiBjdXJzb3IgaXMgYXQgYmVnaW5uaW5nIG9mIGxpbmUoIGNvbHVtbiAwICkuXG4gICAgICBpZiAoIXNlbGVjdGVkUmFuZ2UuY29udGFpbnNSYW5nZShyYW5nZSkpIHJldHVybiByYW5nZVxuICAgIH1cbiAgfVxufVxuRm9sZC5yZWdpc3RlcihmYWxzZSwgdHJ1ZSlcblxuLy8gTk9URTogRnVuY3Rpb24gcmFuZ2UgZGV0ZXJtaW5hdGlvbiBpcyBkZXBlbmRpbmcgb24gZm9sZC5cbmNsYXNzIEZ1bmN0aW9uIGV4dGVuZHMgRm9sZCB7XG4gIC8vIFNvbWUgbGFuZ3VhZ2UgZG9uJ3QgaW5jbHVkZSBjbG9zaW5nIGB9YCBpbnRvIGZvbGQuXG4gIHNjb3BlTmFtZXNPbWl0dGluZ0VuZFJvdyA9IFtcInNvdXJjZS5nb1wiLCBcInNvdXJjZS5lbGl4aXJcIl1cblxuICBpc0dyYW1tYXJOb3RGb2xkRW5kUm93KCkge1xuICAgIGNvbnN0IHtzY29wZU5hbWUsIHBhY2thZ2VOYW1lfSA9IHRoaXMuZWRpdG9yLmdldEdyYW1tYXIoKVxuICAgIGlmICh0aGlzLnNjb3BlTmFtZXNPbWl0dGluZ0VuZFJvdy5pbmNsdWRlcyhzY29wZU5hbWUpKSB7XG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBIQUNLOiBSdXN0IGhhdmUgdHdvIHBhY2thZ2UgYGxhbmd1YWdlLXJ1c3RgIGFuZCBgYXRvbS1sYW5ndWFnZS1ydXN0YFxuICAgICAgLy8gbGFuZ3VhZ2UtcnVzdCBkb24ndCBmb2xkIGVuZGluZyBgfWAsIGJ1dCBhdG9tLWxhbmd1YWdlLXJ1c3QgZG9lcy5cbiAgICAgIHJldHVybiBzY29wZU5hbWUgPT09IFwic291cmNlLnJ1c3RcIiAmJiBwYWNrYWdlTmFtZSA9PT0gXCJsYW5ndWFnZS1ydXN0XCJcbiAgICB9XG4gIH1cblxuICBnZXRGb2xkUm93UmFuZ2VzQ29udGFpbnNGb3JSb3cocm93KSB7XG4gICAgcmV0dXJuIHN1cGVyLmdldEZvbGRSb3dSYW5nZXNDb250YWluc0ZvclJvdyhyb3cpLmZpbHRlcihyb3dSYW5nZSA9PiB7XG4gICAgICByZXR1cm4gdGhpcy51dGlscy5pc0luY2x1ZGVGdW5jdGlvblNjb3BlRm9yUm93KHRoaXMuZWRpdG9yLCByb3dSYW5nZVswXSlcbiAgICB9KVxuICB9XG5cbiAgYWRqdXN0Um93UmFuZ2Uocm93UmFuZ2UpIHtcbiAgICBsZXQgW3N0YXJ0Um93LCBlbmRSb3ddID0gc3VwZXIuYWRqdXN0Um93UmFuZ2Uocm93UmFuZ2UpXG4gICAgLy8gTk9URTogVGhpcyBhZGp1c3RtZW50IHNob3VkIG5vdCBiZSBuZWNlc3NhcnkgaWYgbGFuZ3VhZ2Utc3ludGF4IGlzIHByb3Blcmx5IGRlZmluZWQuXG4gICAgaWYgKHRoaXMuaXNBKCkgJiYgdGhpcy5pc0dyYW1tYXJOb3RGb2xkRW5kUm93KCkpIGVuZFJvdyArPSAxXG4gICAgcmV0dXJuIFtzdGFydFJvdywgZW5kUm93XVxuICB9XG59XG5GdW5jdGlvbi5yZWdpc3RlcihmYWxzZSwgdHJ1ZSlcblxuLy8gU2VjdGlvbjogT3RoZXJcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIEFyZ3VtZW50cyBleHRlbmRzIFRleHRPYmplY3Qge1xuICBuZXdBcmdJbmZvKGFyZ1N0YXJ0LCBhcmcsIHNlcGFyYXRvcikge1xuICAgIGNvbnN0IGFyZ0VuZCA9IHRoaXMudXRpbHMudHJhdmVyc2VUZXh0RnJvbVBvaW50KGFyZ1N0YXJ0LCBhcmcpXG4gICAgY29uc3QgYXJnUmFuZ2UgPSBuZXcgUmFuZ2UoYXJnU3RhcnQsIGFyZ0VuZClcblxuICAgIGNvbnN0IHNlcGFyYXRvckVuZCA9IHRoaXMudXRpbHMudHJhdmVyc2VUZXh0RnJvbVBvaW50KGFyZ0VuZCwgc2VwYXJhdG9yICE9IG51bGwgPyBzZXBhcmF0b3IgOiBcIlwiKVxuICAgIGNvbnN0IHNlcGFyYXRvclJhbmdlID0gbmV3IFJhbmdlKGFyZ0VuZCwgc2VwYXJhdG9yRW5kKVxuXG4gICAgY29uc3QgaW5uZXJSYW5nZSA9IGFyZ1JhbmdlXG4gICAgY29uc3QgYVJhbmdlID0gYXJnUmFuZ2UudW5pb24oc2VwYXJhdG9yUmFuZ2UpXG4gICAgcmV0dXJuIHthcmdSYW5nZSwgc2VwYXJhdG9yUmFuZ2UsIGlubmVyUmFuZ2UsIGFSYW5nZX1cbiAgfVxuXG4gIGdldEFyZ3VtZW50c1JhbmdlRm9yU2VsZWN0aW9uKHNlbGVjdGlvbikge1xuICAgIGNvbnN0IG9wdGlvbnMgPSB7XG4gICAgICBtZW1iZXI6IFtcIkN1cmx5QnJhY2tldFwiLCBcIlNxdWFyZUJyYWNrZXRcIiwgXCJQYXJlbnRoZXNpc1wiXSxcbiAgICAgIGluY2x1c2l2ZTogZmFsc2UsXG4gICAgfVxuICAgIHJldHVybiB0aGlzLmdldEluc3RhbmNlKFwiSW5uZXJBbnlQYWlyXCIsIG9wdGlvbnMpLmdldFJhbmdlKHNlbGVjdGlvbilcbiAgfVxuXG4gIGdldFJhbmdlKHNlbGVjdGlvbikge1xuICAgIGxldCByYW5nZSA9IHRoaXMuZ2V0QXJndW1lbnRzUmFuZ2VGb3JTZWxlY3Rpb24oc2VsZWN0aW9uKVxuICAgIGNvbnN0IHBhaXJSYW5nZUZvdW5kID0gcmFuZ2UgIT0gbnVsbFxuXG4gICAgcmFuZ2UgPSByYW5nZSB8fCB0aGlzLmdldEluc3RhbmNlKFwiSW5uZXJDdXJyZW50TGluZVwiKS5nZXRSYW5nZShzZWxlY3Rpb24pIC8vIGZhbGxiYWNrXG4gICAgaWYgKCFyYW5nZSkgcmV0dXJuXG5cbiAgICByYW5nZSA9IHRoaXMudXRpbHMudHJpbVJhbmdlKHRoaXMuZWRpdG9yLCByYW5nZSlcblxuICAgIGNvbnN0IHRleHQgPSB0aGlzLmVkaXRvci5nZXRUZXh0SW5CdWZmZXJSYW5nZShyYW5nZSlcbiAgICBjb25zdCBhbGxUb2tlbnMgPSB0aGlzLnV0aWxzLnNwbGl0QXJndW1lbnRzKHRleHQsIHBhaXJSYW5nZUZvdW5kKVxuXG4gICAgY29uc3QgYXJnSW5mb3MgPSBbXVxuICAgIGxldCBhcmdTdGFydCA9IHJhbmdlLnN0YXJ0XG5cbiAgICAvLyBTa2lwIHN0YXJ0aW5nIHNlcGFyYXRvclxuICAgIGlmIChhbGxUb2tlbnMubGVuZ3RoICYmIGFsbFRva2Vuc1swXS50eXBlID09PSBcInNlcGFyYXRvclwiKSB7XG4gICAgICBjb25zdCB0b2tlbiA9IGFsbFRva2Vucy5zaGlmdCgpXG4gICAgICBhcmdTdGFydCA9IHRoaXMudXRpbHMudHJhdmVyc2VUZXh0RnJvbVBvaW50KGFyZ1N0YXJ0LCB0b2tlbi50ZXh0KVxuICAgIH1cblxuICAgIHdoaWxlIChhbGxUb2tlbnMubGVuZ3RoKSB7XG4gICAgICBjb25zdCB0b2tlbiA9IGFsbFRva2Vucy5zaGlmdCgpXG4gICAgICBpZiAodG9rZW4udHlwZSA9PT0gXCJhcmd1bWVudFwiKSB7XG4gICAgICAgIGNvbnN0IG5leHRUb2tlbiA9IGFsbFRva2Vucy5zaGlmdCgpXG4gICAgICAgIGNvbnN0IHNlcGFyYXRvciA9IG5leHRUb2tlbiA/IG5leHRUb2tlbi50ZXh0IDogdW5kZWZpbmVkXG4gICAgICAgIGNvbnN0IGFyZ0luZm8gPSB0aGlzLm5ld0FyZ0luZm8oYXJnU3RhcnQsIHRva2VuLnRleHQsIHNlcGFyYXRvcilcblxuICAgICAgICBpZiAoYWxsVG9rZW5zLmxlbmd0aCA9PT0gMCAmJiBhcmdJbmZvcy5sZW5ndGgpIHtcbiAgICAgICAgICBhcmdJbmZvLmFSYW5nZSA9IGFyZ0luZm8uYXJnUmFuZ2UudW5pb24oXy5sYXN0KGFyZ0luZm9zKS5zZXBhcmF0b3JSYW5nZSlcbiAgICAgICAgfVxuXG4gICAgICAgIGFyZ1N0YXJ0ID0gYXJnSW5mby5hUmFuZ2UuZW5kXG4gICAgICAgIGFyZ0luZm9zLnB1c2goYXJnSW5mbylcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIm11c3Qgbm90IGhhcHBlblwiKVxuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IHBvaW50ID0gdGhpcy5nZXRDdXJzb3JQb3NpdGlvbkZvclNlbGVjdGlvbihzZWxlY3Rpb24pXG4gICAgZm9yIChjb25zdCB7aW5uZXJSYW5nZSwgYVJhbmdlfSBvZiBhcmdJbmZvcykge1xuICAgICAgaWYgKGlubmVyUmFuZ2UuZW5kLmlzR3JlYXRlclRoYW5PckVxdWFsKHBvaW50KSkge1xuICAgICAgICByZXR1cm4gdGhpcy5pc0lubmVyKCkgPyBpbm5lclJhbmdlIDogYVJhbmdlXG4gICAgICB9XG4gICAgfVxuICB9XG59XG5Bcmd1bWVudHMucmVnaXN0ZXIoZmFsc2UsIHRydWUpXG5cbmNsYXNzIEN1cnJlbnRMaW5lIGV4dGVuZHMgVGV4dE9iamVjdCB7XG4gIGdldFJhbmdlKHNlbGVjdGlvbikge1xuICAgIGNvbnN0IHtyb3d9ID0gdGhpcy5nZXRDdXJzb3JQb3NpdGlvbkZvclNlbGVjdGlvbihzZWxlY3Rpb24pXG4gICAgY29uc3QgcmFuZ2UgPSB0aGlzLmVkaXRvci5idWZmZXJSYW5nZUZvckJ1ZmZlclJvdyhyb3cpXG4gICAgcmV0dXJuIHRoaXMuaXNBKCkgPyByYW5nZSA6IHRoaXMudXRpbHMudHJpbVJhbmdlKHRoaXMuZWRpdG9yLCByYW5nZSlcbiAgfVxufVxuQ3VycmVudExpbmUucmVnaXN0ZXIoZmFsc2UsIHRydWUpXG5cbmNsYXNzIEVudGlyZSBleHRlbmRzIFRleHRPYmplY3Qge1xuICB3aXNlID0gXCJsaW5ld2lzZVwiXG4gIHNlbGVjdE9uY2UgPSB0cnVlXG5cbiAgZ2V0UmFuZ2Uoc2VsZWN0aW9uKSB7XG4gICAgcmV0dXJuIHRoaXMuZWRpdG9yLmJ1ZmZlci5nZXRSYW5nZSgpXG4gIH1cbn1cbkVudGlyZS5yZWdpc3RlcihmYWxzZSwgdHJ1ZSlcblxuY2xhc3MgRW1wdHkgZXh0ZW5kcyBUZXh0T2JqZWN0IHtcbiAgc2VsZWN0T25jZSA9IHRydWVcbn1cbkVtcHR5LnJlZ2lzdGVyKGZhbHNlKVxuXG5jbGFzcyBMYXRlc3RDaGFuZ2UgZXh0ZW5kcyBUZXh0T2JqZWN0IHtcbiAgd2lzZSA9IG51bGxcbiAgc2VsZWN0T25jZSA9IHRydWVcbiAgZ2V0UmFuZ2Uoc2VsZWN0aW9uKSB7XG4gICAgY29uc3Qgc3RhcnQgPSB0aGlzLnZpbVN0YXRlLm1hcmsuZ2V0KFwiW1wiKVxuICAgIGNvbnN0IGVuZCA9IHRoaXMudmltU3RhdGUubWFyay5nZXQoXCJdXCIpXG4gICAgaWYgKHN0YXJ0ICYmIGVuZCkge1xuICAgICAgcmV0dXJuIG5ldyBSYW5nZShzdGFydCwgZW5kKVxuICAgIH1cbiAgfVxufVxuTGF0ZXN0Q2hhbmdlLnJlZ2lzdGVyKGZhbHNlLCB0cnVlKVxuXG5jbGFzcyBTZWFyY2hNYXRjaEZvcndhcmQgZXh0ZW5kcyBUZXh0T2JqZWN0IHtcbiAgYmFja3dhcmQgPSBmYWxzZVxuXG4gIGZpbmRNYXRjaChmcm9tUG9pbnQsIHBhdHRlcm4pIHtcbiAgICBpZiAodGhpcy5tb2RlID09PSBcInZpc3VhbFwiKSB7XG4gICAgICBmcm9tUG9pbnQgPSB0aGlzLnV0aWxzLnRyYW5zbGF0ZVBvaW50QW5kQ2xpcCh0aGlzLmVkaXRvciwgZnJvbVBvaW50LCBcImZvcndhcmRcIilcbiAgICB9XG4gICAgbGV0IGZvdW5kUmFuZ2VcbiAgICB0aGlzLnNjYW5Gb3J3YXJkKHBhdHRlcm4sIHtmcm9tOiBbZnJvbVBvaW50LnJvdywgMF19LCAoe3JhbmdlLCBzdG9wfSkgPT4ge1xuICAgICAgaWYgKHJhbmdlLmVuZC5pc0dyZWF0ZXJUaGFuKGZyb21Qb2ludCkpIHtcbiAgICAgICAgZm91bmRSYW5nZSA9IHJhbmdlXG4gICAgICAgIHN0b3AoKVxuICAgICAgfVxuICAgIH0pXG4gICAgcmV0dXJuIHtyYW5nZTogZm91bmRSYW5nZSwgd2hpY2hJc0hlYWQ6IFwiZW5kXCJ9XG4gIH1cblxuICBnZXRSYW5nZShzZWxlY3Rpb24pIHtcbiAgICBjb25zdCBwYXR0ZXJuID0gdGhpcy5nbG9iYWxTdGF0ZS5nZXQoXCJsYXN0U2VhcmNoUGF0dGVyblwiKVxuICAgIGlmICghcGF0dGVybikgcmV0dXJuXG5cbiAgICBjb25zdCBmcm9tUG9pbnQgPSBzZWxlY3Rpb24uZ2V0SGVhZEJ1ZmZlclBvc2l0aW9uKClcbiAgICBjb25zdCB7cmFuZ2UsIHdoaWNoSXNIZWFkfSA9IHRoaXMuZmluZE1hdGNoKGZyb21Qb2ludCwgcGF0dGVybilcbiAgICBpZiAocmFuZ2UpIHtcbiAgICAgIHJldHVybiB0aGlzLnVuaW9uUmFuZ2VBbmREZXRlcm1pbmVSZXZlcnNlZFN0YXRlKHNlbGVjdGlvbiwgcmFuZ2UsIHdoaWNoSXNIZWFkKVxuICAgIH1cbiAgfVxuXG4gIHVuaW9uUmFuZ2VBbmREZXRlcm1pbmVSZXZlcnNlZFN0YXRlKHNlbGVjdGlvbiwgcmFuZ2UsIHdoaWNoSXNIZWFkKSB7XG4gICAgaWYgKHNlbGVjdGlvbi5pc0VtcHR5KCkpIHJldHVybiByYW5nZVxuXG4gICAgbGV0IGhlYWQgPSByYW5nZVt3aGljaElzSGVhZF1cbiAgICBjb25zdCB0YWlsID0gc2VsZWN0aW9uLmdldFRhaWxCdWZmZXJQb3NpdGlvbigpXG5cbiAgICBpZiAodGhpcy5iYWNrd2FyZCkge1xuICAgICAgaWYgKHRhaWwuaXNMZXNzVGhhbihoZWFkKSkgaGVhZCA9IHRoaXMudXRpbHMudHJhbnNsYXRlUG9pbnRBbmRDbGlwKHRoaXMuZWRpdG9yLCBoZWFkLCBcImZvcndhcmRcIilcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKGhlYWQuaXNMZXNzVGhhbih0YWlsKSkgaGVhZCA9IHRoaXMudXRpbHMudHJhbnNsYXRlUG9pbnRBbmRDbGlwKHRoaXMuZWRpdG9yLCBoZWFkLCBcImJhY2t3YXJkXCIpXG4gICAgfVxuXG4gICAgdGhpcy5yZXZlcnNlZCA9IGhlYWQuaXNMZXNzVGhhbih0YWlsKVxuICAgIHJldHVybiBuZXcgUmFuZ2UodGFpbCwgaGVhZCkudW5pb24odGhpcy5zd3JhcChzZWxlY3Rpb24pLmdldFRhaWxCdWZmZXJSYW5nZSgpKVxuICB9XG5cbiAgc2VsZWN0VGV4dE9iamVjdChzZWxlY3Rpb24pIHtcbiAgICBjb25zdCByYW5nZSA9IHRoaXMuZ2V0UmFuZ2Uoc2VsZWN0aW9uKVxuICAgIGlmIChyYW5nZSkge1xuICAgICAgdGhpcy5zd3JhcChzZWxlY3Rpb24pLnNldEJ1ZmZlclJhbmdlKHJhbmdlLCB7cmV2ZXJzZWQ6IHRoaXMucmV2ZXJzZWQgIT0gbnVsbCA/IHRoaXMucmV2ZXJzZWQgOiB0aGlzLmJhY2t3YXJkfSlcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfVxuICB9XG59XG5TZWFyY2hNYXRjaEZvcndhcmQucmVnaXN0ZXIoKVxuXG5jbGFzcyBTZWFyY2hNYXRjaEJhY2t3YXJkIGV4dGVuZHMgU2VhcmNoTWF0Y2hGb3J3YXJkIHtcbiAgYmFja3dhcmQgPSB0cnVlXG5cbiAgZmluZE1hdGNoKGZyb21Qb2ludCwgcGF0dGVybikge1xuICAgIGlmICh0aGlzLm1vZGUgPT09IFwidmlzdWFsXCIpIHtcbiAgICAgIGZyb21Qb2ludCA9IHRoaXMudXRpbHMudHJhbnNsYXRlUG9pbnRBbmRDbGlwKHRoaXMuZWRpdG9yLCBmcm9tUG9pbnQsIFwiYmFja3dhcmRcIilcbiAgICB9XG4gICAgbGV0IGZvdW5kUmFuZ2VcbiAgICB0aGlzLnNjYW5CYWNrd2FyZChwYXR0ZXJuLCB7ZnJvbTogW2Zyb21Qb2ludC5yb3csIEluZmluaXR5XX0sICh7cmFuZ2UsIHN0b3B9KSA9PiB7XG4gICAgICBpZiAocmFuZ2Uuc3RhcnQuaXNMZXNzVGhhbihmcm9tUG9pbnQpKSB7XG4gICAgICAgIGZvdW5kUmFuZ2UgPSByYW5nZVxuICAgICAgICBzdG9wKClcbiAgICAgIH1cbiAgICB9KVxuICAgIHJldHVybiB7cmFuZ2U6IGZvdW5kUmFuZ2UsIHdoaWNoSXNIZWFkOiBcInN0YXJ0XCJ9XG4gIH1cbn1cblNlYXJjaE1hdGNoQmFja3dhcmQucmVnaXN0ZXIoKVxuXG4vLyBbTGltaXRhdGlvbjogd29uJ3QgZml4XTogU2VsZWN0ZWQgcmFuZ2UgaXMgbm90IHN1Ym1vZGUgYXdhcmUuIGFsd2F5cyBjaGFyYWN0ZXJ3aXNlLlxuLy8gU28gZXZlbiBpZiBvcmlnaW5hbCBzZWxlY3Rpb24gd2FzIHZMIG9yIHZCLCBzZWxlY3RlZCByYW5nZSBieSB0aGlzIHRleHQtb2JqZWN0XG4vLyBpcyBhbHdheXMgdkMgcmFuZ2UuXG5jbGFzcyBQcmV2aW91c1NlbGVjdGlvbiBleHRlbmRzIFRleHRPYmplY3Qge1xuICB3aXNlID0gbnVsbFxuICBzZWxlY3RPbmNlID0gdHJ1ZVxuXG4gIHNlbGVjdFRleHRPYmplY3Qoc2VsZWN0aW9uKSB7XG4gICAgY29uc3Qge3Byb3BlcnRpZXMsIHN1Ym1vZGV9ID0gdGhpcy52aW1TdGF0ZS5wcmV2aW91c1NlbGVjdGlvblxuICAgIGlmIChwcm9wZXJ0aWVzICYmIHN1Ym1vZGUpIHtcbiAgICAgIHRoaXMud2lzZSA9IHN1Ym1vZGVcbiAgICAgIHRoaXMuc3dyYXAodGhpcy5lZGl0b3IuZ2V0TGFzdFNlbGVjdGlvbigpKS5zZWxlY3RCeVByb3BlcnRpZXMocHJvcGVydGllcylcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfVxuICB9XG59XG5QcmV2aW91c1NlbGVjdGlvbi5yZWdpc3RlcigpXG5cbmNsYXNzIFBlcnNpc3RlbnRTZWxlY3Rpb24gZXh0ZW5kcyBUZXh0T2JqZWN0IHtcbiAgd2lzZSA9IG51bGxcbiAgc2VsZWN0T25jZSA9IHRydWVcblxuICBzZWxlY3RUZXh0T2JqZWN0KHNlbGVjdGlvbikge1xuICAgIGlmICh0aGlzLnZpbVN0YXRlLmhhc1BlcnNpc3RlbnRTZWxlY3Rpb25zKCkpIHtcbiAgICAgIHRoaXMucGVyc2lzdGVudFNlbGVjdGlvbi5zZXRTZWxlY3RlZEJ1ZmZlclJhbmdlcygpXG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH1cbiAgfVxufVxuUGVyc2lzdGVudFNlbGVjdGlvbi5yZWdpc3RlcihmYWxzZSwgdHJ1ZSlcblxuLy8gVXNlZCBvbmx5IGJ5IFJlcGxhY2VXaXRoUmVnaXN0ZXIgYW5kIFB1dEJlZm9yZSBhbmQgaXRzJyBjaGlsZHJlbi5cbmNsYXNzIExhc3RQYXN0ZWRSYW5nZSBleHRlbmRzIFRleHRPYmplY3Qge1xuICB3aXNlID0gbnVsbFxuICBzZWxlY3RPbmNlID0gdHJ1ZVxuXG4gIHNlbGVjdFRleHRPYmplY3Qoc2VsZWN0aW9uKSB7XG4gICAgZm9yIChzZWxlY3Rpb24gb2YgdGhpcy5lZGl0b3IuZ2V0U2VsZWN0aW9ucygpKSB7XG4gICAgICBjb25zdCByYW5nZSA9IHRoaXMudmltU3RhdGUuc2VxdWVudGlhbFBhc3RlTWFuYWdlci5nZXRQYXN0ZWRSYW5nZUZvclNlbGVjdGlvbihzZWxlY3Rpb24pXG4gICAgICBzZWxlY3Rpb24uc2V0QnVmZmVyUmFuZ2UocmFuZ2UpXG4gICAgfVxuICAgIHJldHVybiB0cnVlXG4gIH1cbn1cbkxhc3RQYXN0ZWRSYW5nZS5yZWdpc3RlcihmYWxzZSlcblxuY2xhc3MgVmlzaWJsZUFyZWEgZXh0ZW5kcyBUZXh0T2JqZWN0IHtcbiAgc2VsZWN0T25jZSA9IHRydWVcblxuICBnZXRSYW5nZShzZWxlY3Rpb24pIHtcbiAgICAvLyBbQlVHP10gTmVlZCB0cmFuc2xhdGUgdG8gc2hpbG5rIHRvcCBhbmQgYm90dG9tIHRvIGZpdCBhY3R1YWwgcm93LlxuICAgIC8vIFRoZSByZWFzb24gSSBuZWVkIC0yIGF0IGJvdHRvbSBpcyBiZWNhdXNlIG9mIHN0YXR1cyBiYXI/XG4gICAgY29uc3QgcmFuZ2UgPSB0aGlzLnV0aWxzLmdldFZpc2libGVCdWZmZXJSYW5nZSh0aGlzLmVkaXRvcilcbiAgICByZXR1cm4gcmFuZ2UuZ2V0Um93cygpID4gdGhpcy5lZGl0b3IuZ2V0Um93c1BlclBhZ2UoKSA/IHJhbmdlLnRyYW5zbGF0ZShbKzEsIDBdLCBbLTMsIDBdKSA6IHJhbmdlXG4gIH1cbn1cblZpc2libGVBcmVhLnJlZ2lzdGVyKGZhbHNlLCB0cnVlKVxuIl19