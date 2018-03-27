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

  // Section: Word
  // =========================

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
    key: "deriveClass",
    value: function deriveClass(innerAndA, innerAndAForAllowForwarding) {
      var _this2 = this;

      this.command = false;
      var store = {};
      var generateClass = function generateClass() {
        var klass = _this2.generateClass.apply(_this2, arguments);
        store[klass.name] = klass;
      };

      if (innerAndA) {
        generateClass(false);
        generateClass(true);
      }
      if (innerAndAForAllowForwarding) {
        generateClass(false, true);
        generateClass(true, true);
      }
      return store;
    }
  }, {
    key: "generateClass",
    value: function generateClass(inner, allowForwarding) {
      var klassName = (inner ? "Inner" : "A") + this.name + (allowForwarding ? "AllowForwarding" : "");

      return (function (_ref) {
        _inherits(_class, _ref);

        _createClass(_class, null, [{
          key: "name",
          get: function get() {
            return klassName;
          }
        }]);

        function _class(vimState) {
          _classCallCheck(this, _class);

          _get(Object.getPrototypeOf(_class.prototype), "constructor", this).call(this, vimState);
          this.inner = inner;
          if (allowForwarding != null) this.allowForwarding = allowForwarding;
        }

        return _class;
      })(this);
    }
  }, {
    key: "operationKind",
    value: "text-object",
    enumerable: true
  }, {
    key: "command",
    value: false,
    enumerable: true
  }]);

  return TextObject;
})(Base);

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

var WholeWord = (function (_Word) {
  _inherits(WholeWord, _Word);

  function WholeWord() {
    _classCallCheck(this, WholeWord);

    _get(Object.getPrototypeOf(WholeWord.prototype), "constructor", this).apply(this, arguments);

    this.wordRegex = /\S+/;
  }

  // Just include _, -
  return WholeWord;
})(Word);

var SmartWord = (function (_Word2) {
  _inherits(SmartWord, _Word2);

  function SmartWord() {
    _classCallCheck(this, SmartWord);

    _get(Object.getPrototypeOf(SmartWord.prototype), "constructor", this).apply(this, arguments);

    this.wordRegex = /[\w-]+/;
  }

  // Just include _, -
  return SmartWord;
})(Word);

var Subword = (function (_Word3) {
  _inherits(Subword, _Word3);

  function Subword() {
    _classCallCheck(this, Subword);

    _get(Object.getPrototypeOf(Subword.prototype), "constructor", this).apply(this, arguments);
  }

  // Section: Pair
  // =========================

  _createClass(Subword, [{
    key: "getRange",
    value: function getRange(selection) {
      this.wordRegex = selection.cursor.subwordRegExp();
      return _get(Object.getPrototypeOf(Subword.prototype), "getRange", this).call(this, selection);
    }
  }]);

  return Subword;
})(Word);

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

  // Used by DeleteSurround

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
  }], [{
    key: "command",
    value: false,
    enumerable: true
  }]);

  return Pair;
})(TextObject);

var APair = (function (_Pair) {
  _inherits(APair, _Pair);

  function APair() {
    _classCallCheck(this, APair);

    _get(Object.getPrototypeOf(APair.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(APair, null, [{
    key: "command",
    value: false,
    enumerable: true
  }]);

  return APair;
})(Pair);

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
      var _this3 = this;

      var options = { inner: this.inner, allowForwarding: this.allowForwarding, inclusive: this.inclusive };
      return this.member.map(function (member) {
        return _this3.getInstance(member, options).getRange(selection);
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

var Quote = (function (_Pair3) {
  _inherits(Quote, _Pair3);

  function Quote() {
    _classCallCheck(this, Quote);

    _get(Object.getPrototypeOf(Quote.prototype), "constructor", this).apply(this, arguments);

    this.allowForwarding = true;
  }

  _createClass(Quote, null, [{
    key: "command",
    value: false,
    enumerable: true
  }]);

  return Quote;
})(Pair);

var DoubleQuote = (function (_Quote) {
  _inherits(DoubleQuote, _Quote);

  function DoubleQuote() {
    _classCallCheck(this, DoubleQuote);

    _get(Object.getPrototypeOf(DoubleQuote.prototype), "constructor", this).apply(this, arguments);

    this.pair = ['"', '"'];
  }

  return DoubleQuote;
})(Quote);

var SingleQuote = (function (_Quote2) {
  _inherits(SingleQuote, _Quote2);

  function SingleQuote() {
    _classCallCheck(this, SingleQuote);

    _get(Object.getPrototypeOf(SingleQuote.prototype), "constructor", this).apply(this, arguments);

    this.pair = ["'", "'"];
  }

  return SingleQuote;
})(Quote);

var BackTick = (function (_Quote3) {
  _inherits(BackTick, _Quote3);

  function BackTick() {
    _classCallCheck(this, BackTick);

    _get(Object.getPrototypeOf(BackTick.prototype), "constructor", this).apply(this, arguments);

    this.pair = ["`", "`"];
  }

  return BackTick;
})(Quote);

var CurlyBracket = (function (_Pair4) {
  _inherits(CurlyBracket, _Pair4);

  function CurlyBracket() {
    _classCallCheck(this, CurlyBracket);

    _get(Object.getPrototypeOf(CurlyBracket.prototype), "constructor", this).apply(this, arguments);

    this.pair = ["{", "}"];
  }

  return CurlyBracket;
})(Pair);

var SquareBracket = (function (_Pair5) {
  _inherits(SquareBracket, _Pair5);

  function SquareBracket() {
    _classCallCheck(this, SquareBracket);

    _get(Object.getPrototypeOf(SquareBracket.prototype), "constructor", this).apply(this, arguments);

    this.pair = ["[", "]"];
  }

  return SquareBracket;
})(Pair);

var Parenthesis = (function (_Pair6) {
  _inherits(Parenthesis, _Pair6);

  function Parenthesis() {
    _classCallCheck(this, Parenthesis);

    _get(Object.getPrototypeOf(Parenthesis.prototype), "constructor", this).apply(this, arguments);

    this.pair = ["(", ")"];
  }

  return Parenthesis;
})(Pair);

var AngleBracket = (function (_Pair7) {
  _inherits(AngleBracket, _Pair7);

  function AngleBracket() {
    _classCallCheck(this, AngleBracket);

    _get(Object.getPrototypeOf(AngleBracket.prototype), "constructor", this).apply(this, arguments);

    this.pair = ["<", ">"];
  }

  return AngleBracket;
})(Pair);

var Tag = (function (_Pair8) {
  _inherits(Tag, _Pair8);

  function Tag() {
    _classCallCheck(this, Tag);

    _get(Object.getPrototypeOf(Tag.prototype), "constructor", this).apply(this, arguments);

    this.allowNextLine = true;
    this.allowForwarding = true;
    this.adjustInnerRange = false;
  }

  // Section: Paragraph
  // =========================
  // Paragraph is defined as consecutive (non-)blank-line.

  _createClass(Tag, [{
    key: "getTagStartPoint",
    value: function getTagStartPoint(from) {
      var regex = PairFinder.TagFinder.pattern;
      var options = { from: [from.row, 0] };
      return this.findInEditor("forward", regex, options, function (_ref4) {
        var range = _ref4.range;
        return range.containsPoint(from, true) && range.start;
      });
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
      var _this4 = this;

      var fromRowResult = this.editor.isBufferRowBlank(fromRow);

      if (this.isInner()) {
        return function (row, direction) {
          return _this4.editor.isBufferRowBlank(row) === fromRowResult;
        };
      } else {
        var _ret = (function () {
          var directionToExtend = selection.isReversed() ? "previous" : "next";

          var flip = false;
          var predict = function predict(row, direction) {
            var result = _this4.editor.isBufferRowBlank(row) === fromRowResult;
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

var Indentation = (function (_Paragraph) {
  _inherits(Indentation, _Paragraph);

  function Indentation() {
    _classCallCheck(this, Indentation);

    _get(Object.getPrototypeOf(Indentation.prototype), "constructor", this).apply(this, arguments);
  }

  // Section: Comment
  // =========================

  _createClass(Indentation, [{
    key: "getRange",
    value: function getRange(selection) {
      var _this5 = this;

      var fromRow = this.getCursorPositionForSelection(selection).row;
      var baseIndentLevel = this.editor.indentationForBufferRow(fromRow);
      var rowRange = this.findRowRangeBy(fromRow, function (row) {
        return _this5.editor.isBufferRowBlank(row) ? _this5.isA() : _this5.editor.indentationForBufferRow(row) >= baseIndentLevel;
      });
      return this.getBufferRangeForRowRange(rowRange);
    }
  }]);

  return Indentation;
})(Paragraph);

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

var CommentOrParagraph = (function (_TextObject5) {
  _inherits(CommentOrParagraph, _TextObject5);

  function CommentOrParagraph() {
    _classCallCheck(this, CommentOrParagraph);

    _get(Object.getPrototypeOf(CommentOrParagraph.prototype), "constructor", this).apply(this, arguments);

    this.wise = "linewise";
  }

  // Section: Fold
  // =========================

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

var Fold = (function (_TextObject6) {
  _inherits(Fold, _TextObject6);

  function Fold() {
    _classCallCheck(this, Fold);

    _get(Object.getPrototypeOf(Fold.prototype), "constructor", this).apply(this, arguments);

    this.wise = "linewise";
  }

  // NOTE: Function range determination is depending on fold.

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

var Function = (function (_Fold) {
  _inherits(Function, _Fold);

  function Function() {
    _classCallCheck(this, Function);

    _get(Object.getPrototypeOf(Function.prototype), "constructor", this).apply(this, arguments);

    this.scopeNamesOmittingEndRow = ["source.go", "source.elixir"];
  }

  // Section: Other
  // =========================

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
      var _this6 = this;

      return _get(Object.getPrototypeOf(Function.prototype), "getFoldRowRangesContainsForRow", this).call(this, row).filter(function (rowRange) {
        return _this6.utils.isIncludeFunctionScopeForRow(_this6.editor, rowRange[0]);
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

      range = this.trimBufferRange(range);

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
      return this.isA() ? range : this.trimBufferRange(range);
    }
  }]);

  return CurrentLine;
})(TextObject);

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

var Empty = (function (_TextObject10) {
  _inherits(Empty, _TextObject10);

  function Empty() {
    _classCallCheck(this, Empty);

    _get(Object.getPrototypeOf(Empty.prototype), "constructor", this).apply(this, arguments);

    this.selectOnce = true;
  }

  _createClass(Empty, null, [{
    key: "command",
    value: false,
    enumerable: true
  }]);

  return Empty;
})(TextObject);

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

var SearchMatchForward = (function (_TextObject12) {
  _inherits(SearchMatchForward, _TextObject12);

  function SearchMatchForward() {
    _classCallCheck(this, SearchMatchForward);

    _get(Object.getPrototypeOf(SearchMatchForward.prototype), "constructor", this).apply(this, arguments);

    this.backward = false;
  }

  _createClass(SearchMatchForward, [{
    key: "findMatch",
    value: function findMatch(from, regex) {
      if (this.backward) {
        if (this.mode === "visual") {
          from = this.utils.translatePointAndClip(this.editor, from, "backward");
        }

        var options = { from: [from.row, Infinity] };
        return {
          range: this.findInEditor("backward", regex, options, function (_ref6) {
            var range = _ref6.range;
            return range.start.isLessThan(from) && range;
          }),
          whichIsHead: "start"
        };
      } else {
        if (this.mode === "visual") {
          from = this.utils.translatePointAndClip(this.editor, from, "forward");
        }

        var options = { from: [from.row, 0] };
        return {
          range: this.findInEditor("forward", regex, options, function (_ref7) {
            var range = _ref7.range;
            return range.end.isGreaterThan(from) && range;
          }),
          whichIsHead: "end"
        };
      }
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

var SearchMatchBackward = (function (_SearchMatchForward) {
  _inherits(SearchMatchBackward, _SearchMatchForward);

  function SearchMatchBackward() {
    _classCallCheck(this, SearchMatchBackward);

    _get(Object.getPrototypeOf(SearchMatchBackward.prototype), "constructor", this).apply(this, arguments);

    this.backward = true;
  }

  // [Limitation: won't fix]: Selected range is not submode aware. always characterwise.
  // So even if original selection was vL or vB, selected range by this text-object
  // is always vC range.
  return SearchMatchBackward;
})(SearchMatchForward);

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

var PersistentSelection = (function (_TextObject14) {
  _inherits(PersistentSelection, _TextObject14);

  function PersistentSelection() {
    _classCallCheck(this, PersistentSelection);

    _get(Object.getPrototypeOf(PersistentSelection.prototype), "constructor", this).apply(this, arguments);

    this.wise = null;
    this.selectOnce = true;
  }

  // Used only by ReplaceWithRegister and PutBefore and its' children.

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
  }], [{
    key: "command",
    value: false,
    enumerable: true
  }]);

  return LastPastedRange;
})(TextObject);

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
      var _editor$getVisibleRowRange = this.editor.getVisibleRowRange();

      var _editor$getVisibleRowRange2 = _slicedToArray(_editor$getVisibleRowRange, 2);

      var startRow = _editor$getVisibleRowRange2[0];
      var endRow = _editor$getVisibleRowRange2[1];

      return this.editor.bufferRangeForScreenRange([[startRow, 0], [endRow, Infinity]]);
    }
  }]);

  return VisibleArea;
})(TextObject);

module.exports = Object.assign({
  TextObject: TextObject,
  Word: Word,
  WholeWord: WholeWord,
  SmartWord: SmartWord,
  Subword: Subword,
  Pair: Pair,
  APair: APair,
  AnyPair: AnyPair,
  AnyPairAllowForwarding: AnyPairAllowForwarding,
  AnyQuote: AnyQuote,
  Quote: Quote,
  DoubleQuote: DoubleQuote,
  SingleQuote: SingleQuote,
  BackTick: BackTick,
  CurlyBracket: CurlyBracket,
  SquareBracket: SquareBracket,
  Parenthesis: Parenthesis,
  AngleBracket: AngleBracket,
  Tag: Tag,
  Paragraph: Paragraph,
  Indentation: Indentation,
  Comment: Comment,
  CommentOrParagraph: CommentOrParagraph,
  Fold: Fold,
  Function: Function,
  Arguments: Arguments,
  CurrentLine: CurrentLine,
  Entire: Entire,
  Empty: Empty,
  LatestChange: LatestChange,
  SearchMatchForward: SearchMatchForward,
  SearchMatchBackward: SearchMatchBackward,
  PreviousSelection: PreviousSelection,
  PersistentSelection: PersistentSelection,
  LastPastedRange: LastPastedRange,
  VisibleArea: VisibleArea
}, Word.deriveClass(true), WholeWord.deriveClass(true), SmartWord.deriveClass(true), Subword.deriveClass(true), AnyPair.deriveClass(true), AnyPairAllowForwarding.deriveClass(true), AnyQuote.deriveClass(true), DoubleQuote.deriveClass(true), SingleQuote.deriveClass(true), BackTick.deriveClass(true), CurlyBracket.deriveClass(true, true), SquareBracket.deriveClass(true, true), Parenthesis.deriveClass(true, true), AngleBracket.deriveClass(true, true), Tag.deriveClass(true), Paragraph.deriveClass(true), Indentation.deriveClass(true), Comment.deriveClass(true), CommentOrParagraph.deriveClass(true), Fold.deriveClass(true), Function.deriveClass(true), Arguments.deriveClass(true), CurrentLine.deriveClass(true), Entire.deriveClass(true), LatestChange.deriveClass(true), PersistentSelection.deriveClass(true), VisibleArea.deriveClass(true));
// FIXME #472, #66

// Some language don't include closing `}` into fold.
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL3RleHQtb2JqZWN0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFdBQVcsQ0FBQTs7Ozs7Ozs7Ozs7O2VBRVksT0FBTyxDQUFDLE1BQU0sQ0FBQzs7SUFBL0IsS0FBSyxZQUFMLEtBQUs7SUFBRSxLQUFLLFlBQUwsS0FBSzs7QUFDbkIsSUFBTSxDQUFDLEdBQUcsT0FBTyxDQUFDLGlCQUFpQixDQUFDLENBQUE7Ozs7O0FBS3BDLElBQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQTtBQUM5QixJQUFNLFVBQVUsR0FBRyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUE7O0lBRXJDLFVBQVU7WUFBVixVQUFVOztXQUFWLFVBQVU7MEJBQVYsVUFBVTs7K0JBQVYsVUFBVTs7U0FJZCxRQUFRLEdBQUcsSUFBSTtTQUNmLElBQUksR0FBRyxlQUFlO1NBQ3RCLFlBQVksR0FBRyxLQUFLO1NBQ3BCLFVBQVUsR0FBRyxLQUFLO1NBQ2xCLGVBQWUsR0FBRyxLQUFLOzs7Ozs7ZUFSbkIsVUFBVTs7V0E0Q1AsbUJBQUc7QUFDUixhQUFPLElBQUksQ0FBQyxLQUFLLENBQUE7S0FDbEI7OztXQUVFLGVBQUc7QUFDSixhQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQTtLQUNuQjs7O1dBRVMsc0JBQUc7QUFDWCxhQUFPLElBQUksQ0FBQyxJQUFJLEtBQUssVUFBVSxDQUFBO0tBQ2hDOzs7V0FFVSx1QkFBRztBQUNaLGFBQU8sSUFBSSxDQUFDLElBQUksS0FBSyxXQUFXLENBQUE7S0FDakM7OztXQUVRLG1CQUFDLElBQUksRUFBRTtBQUNkLGFBQVEsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7S0FDMUI7OztXQUVTLHNCQUFHO0FBQ1gsVUFBSSxDQUFDLGVBQWUsR0FBRyxLQUFLLENBQUE7S0FDN0I7Ozs7Ozs7V0FLTSxtQkFBRzs7QUFF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RUFDM0IsV0FBVyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsRUFDN0IsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsRUFDeEIsWUFBWSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsRUFDOUIsbUJBQW1CLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxFQUNyQyxXQUFXLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUM5QixDQUFBIiwiZmlsZSI6Ii9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL3RleHQtb2JqZWN0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2UgYmFiZWxcIlxuXG5jb25zdCB7UmFuZ2UsIFBvaW50fSA9IHJlcXVpcmUoXCJhdG9tXCIpXG5jb25zdCBfID0gcmVxdWlyZShcInVuZGVyc2NvcmUtcGx1c1wiKVxuXG4vLyBbVE9ET10gTmVlZCBvdmVyaGF1bFxuLy8gIC0gWyBdIE1ha2UgZXhwYW5kYWJsZSBieSBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKS51bmlvbih0aGlzLmdldFJhbmdlKHNlbGVjdGlvbikpXG4vLyAgLSBbIF0gQ291bnQgc3VwcG9ydChwcmlvcml0eSBsb3cpP1xuY29uc3QgQmFzZSA9IHJlcXVpcmUoXCIuL2Jhc2VcIilcbmNvbnN0IFBhaXJGaW5kZXIgPSByZXF1aXJlKFwiLi9wYWlyLWZpbmRlclwiKVxuXG5jbGFzcyBUZXh0T2JqZWN0IGV4dGVuZHMgQmFzZSB7XG4gIHN0YXRpYyBvcGVyYXRpb25LaW5kID0gXCJ0ZXh0LW9iamVjdFwiXG4gIHN0YXRpYyBjb21tYW5kID0gZmFsc2VcblxuICBvcGVyYXRvciA9IG51bGxcbiAgd2lzZSA9IFwiY2hhcmFjdGVyd2lzZVwiXG4gIHN1cHBvcnRDb3VudCA9IGZhbHNlIC8vIEZJWE1FICM0NzIsICM2NlxuICBzZWxlY3RPbmNlID0gZmFsc2VcbiAgc2VsZWN0U3VjY2VlZGVkID0gZmFsc2VcblxuICBzdGF0aWMgZGVyaXZlQ2xhc3MoaW5uZXJBbmRBLCBpbm5lckFuZEFGb3JBbGxvd0ZvcndhcmRpbmcpIHtcbiAgICB0aGlzLmNvbW1hbmQgPSBmYWxzZVxuICAgIGNvbnN0IHN0b3JlID0ge31cbiAgICBjb25zdCBnZW5lcmF0ZUNsYXNzID0gKC4uLmFyZ3MpID0+IHtcbiAgICAgIGNvbnN0IGtsYXNzID0gdGhpcy5nZW5lcmF0ZUNsYXNzKC4uLmFyZ3MpXG4gICAgICBzdG9yZVtrbGFzcy5uYW1lXSA9IGtsYXNzXG4gICAgfVxuXG4gICAgaWYgKGlubmVyQW5kQSkge1xuICAgICAgZ2VuZXJhdGVDbGFzcyhmYWxzZSlcbiAgICAgIGdlbmVyYXRlQ2xhc3ModHJ1ZSlcbiAgICB9XG4gICAgaWYgKGlubmVyQW5kQUZvckFsbG93Rm9yd2FyZGluZykge1xuICAgICAgZ2VuZXJhdGVDbGFzcyhmYWxzZSwgdHJ1ZSlcbiAgICAgIGdlbmVyYXRlQ2xhc3ModHJ1ZSwgdHJ1ZSlcbiAgICB9XG4gICAgcmV0dXJuIHN0b3JlXG4gIH1cblxuICBzdGF0aWMgZ2VuZXJhdGVDbGFzcyhpbm5lciwgYWxsb3dGb3J3YXJkaW5nKSB7XG4gICAgY29uc3Qga2xhc3NOYW1lID0gKGlubmVyID8gXCJJbm5lclwiIDogXCJBXCIpICsgdGhpcy5uYW1lICsgKGFsbG93Rm9yd2FyZGluZyA/IFwiQWxsb3dGb3J3YXJkaW5nXCIgOiBcIlwiKVxuXG4gICAgcmV0dXJuIGNsYXNzIGV4dGVuZHMgdGhpcyB7XG4gICAgICBzdGF0aWMgZ2V0IG5hbWUoKSB7XG4gICAgICAgIHJldHVybiBrbGFzc05hbWVcbiAgICAgIH1cbiAgICAgIGNvbnN0cnVjdG9yKHZpbVN0YXRlKSB7XG4gICAgICAgIHN1cGVyKHZpbVN0YXRlKVxuICAgICAgICB0aGlzLmlubmVyID0gaW5uZXJcbiAgICAgICAgaWYgKGFsbG93Rm9yd2FyZGluZyAhPSBudWxsKSB0aGlzLmFsbG93Rm9yd2FyZGluZyA9IGFsbG93Rm9yd2FyZGluZ1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGlzSW5uZXIoKSB7XG4gICAgcmV0dXJuIHRoaXMuaW5uZXJcbiAgfVxuXG4gIGlzQSgpIHtcbiAgICByZXR1cm4gIXRoaXMuaW5uZXJcbiAgfVxuXG4gIGlzTGluZXdpc2UoKSB7XG4gICAgcmV0dXJuIHRoaXMud2lzZSA9PT0gXCJsaW5ld2lzZVwiXG4gIH1cblxuICBpc0Jsb2Nrd2lzZSgpIHtcbiAgICByZXR1cm4gdGhpcy53aXNlID09PSBcImJsb2Nrd2lzZVwiXG4gIH1cblxuICBmb3JjZVdpc2Uod2lzZSkge1xuICAgIHJldHVybiAodGhpcy53aXNlID0gd2lzZSkgLy8gRklYTUUgY3VycmVudGx5IG5vdCB3ZWxsIHN1cHBvcnRlZFxuICB9XG5cbiAgcmVzZXRTdGF0ZSgpIHtcbiAgICB0aGlzLnNlbGVjdFN1Y2NlZWRlZCA9IGZhbHNlXG4gIH1cblxuICAvLyBleGVjdXRlOiBDYWxsZWQgZnJvbSBPcGVyYXRvcjo6c2VsZWN0VGFyZ2V0KClcbiAgLy8gIC0gYHYgaSBwYCwgaXMgYFZpc3VhbE1vZGVTZWxlY3RgIG9wZXJhdG9yIHdpdGggQHRhcmdldCA9IGBJbm5lclBhcmFncmFwaGAuXG4gIC8vICAtIGBkIGkgcGAsIGlzIGBEZWxldGVgIG9wZXJhdG9yIHdpdGggQHRhcmdldCA9IGBJbm5lclBhcmFncmFwaGAuXG4gIGV4ZWN1dGUoKSB7XG4gICAgLy8gV2hlbm5ldmVyIFRleHRPYmplY3QgaXMgZXhlY3V0ZWQsIGl0IGhhcyBAb3BlcmF0b3JcbiAgICBpZiAoIXRoaXMub3BlcmF0b3IpIHRocm93IG5ldyBFcnJvcihcImluIFRleHRPYmplY3Q6IE11c3Qgbm90IGhhcHBlblwiKVxuICAgIHRoaXMuc2VsZWN0KClcbiAgfVxuXG4gIHNlbGVjdCgpIHtcbiAgICBpZiAodGhpcy5pc01vZGUoXCJ2aXN1YWxcIiwgXCJibG9ja3dpc2VcIikpIHtcbiAgICAgIHRoaXMuc3dyYXAubm9ybWFsaXplKHRoaXMuZWRpdG9yKVxuICAgIH1cblxuICAgIHRoaXMuY291bnRUaW1lcyh0aGlzLmdldENvdW50KCksICh7c3RvcH0pID0+IHtcbiAgICAgIGlmICghdGhpcy5zdXBwb3J0Q291bnQpIHN0b3AoKSAvLyBxdWljay1maXggZm9yICM1NjBcblxuICAgICAgZm9yIChjb25zdCBzZWxlY3Rpb24gb2YgdGhpcy5lZGl0b3IuZ2V0U2VsZWN0aW9ucygpKSB7XG4gICAgICAgIGNvbnN0IG9sZFJhbmdlID0gc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKClcbiAgICAgICAgaWYgKHRoaXMuc2VsZWN0VGV4dE9iamVjdChzZWxlY3Rpb24pKSB0aGlzLnNlbGVjdFN1Y2NlZWRlZCA9IHRydWVcbiAgICAgICAgaWYgKHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpLmlzRXF1YWwob2xkUmFuZ2UpKSBzdG9wKClcbiAgICAgICAgaWYgKHRoaXMuc2VsZWN0T25jZSkgYnJlYWtcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgdGhpcy5lZGl0b3IubWVyZ2VJbnRlcnNlY3RpbmdTZWxlY3Rpb25zKClcbiAgICAvLyBTb21lIFRleHRPYmplY3QncyB3aXNlIGlzIE5PVCBkZXRlcm1pbmlzdGljLiBJdCBoYXMgdG8gYmUgZGV0ZWN0ZWQgZnJvbSBzZWxlY3RlZCByYW5nZS5cbiAgICBpZiAodGhpcy53aXNlID09IG51bGwpIHRoaXMud2lzZSA9IHRoaXMuc3dyYXAuZGV0ZWN0V2lzZSh0aGlzLmVkaXRvcilcblxuICAgIGlmICh0aGlzLm9wZXJhdG9yLmluc3RhbmNlb2YoXCJTZWxlY3RCYXNlXCIpKSB7XG4gICAgICBpZiAodGhpcy5zZWxlY3RTdWNjZWVkZWQpIHtcbiAgICAgICAgaWYgKHRoaXMud2lzZSA9PT0gXCJjaGFyYWN0ZXJ3aXNlXCIpIHtcbiAgICAgICAgICB0aGlzLnN3cmFwLnNhdmVQcm9wZXJ0aWVzKHRoaXMuZWRpdG9yLCB7Zm9yY2U6IHRydWV9KVxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMud2lzZSA9PT0gXCJsaW5ld2lzZVwiKSB7XG4gICAgICAgICAgLy8gV2hlbiB0YXJnZXQgaXMgcGVyc2lzdGVudC1zZWxlY3Rpb24sIG5ldyBzZWxlY3Rpb24gaXMgYWRkZWQgYWZ0ZXIgc2VsZWN0VGV4dE9iamVjdC5cbiAgICAgICAgICAvLyBTbyB3ZSBoYXZlIHRvIGFzc3VyZSBhbGwgc2VsZWN0aW9uIGhhdmUgc2VsY3Rpb24gcHJvcGVydHkuXG4gICAgICAgICAgLy8gTWF5YmUgdGhpcyBsb2dpYyBjYW4gYmUgbW92ZWQgdG8gb3BlcmF0aW9uIHN0YWNrLlxuICAgICAgICAgIGZvciAoY29uc3QgJHNlbGVjdGlvbiBvZiB0aGlzLnN3cmFwLmdldFNlbGVjdGlvbnModGhpcy5lZGl0b3IpKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5nZXRDb25maWcoXCJzdGF5T25TZWxlY3RUZXh0T2JqZWN0XCIpKSB7XG4gICAgICAgICAgICAgIGlmICghJHNlbGVjdGlvbi5oYXNQcm9wZXJ0aWVzKCkpICRzZWxlY3Rpb24uc2F2ZVByb3BlcnRpZXMoKVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgJHNlbGVjdGlvbi5zYXZlUHJvcGVydGllcygpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAkc2VsZWN0aW9uLmZpeFByb3BlcnR5Um93VG9Sb3dSYW5nZSgpXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLnN1Ym1vZGUgPT09IFwiYmxvY2t3aXNlXCIpIHtcbiAgICAgICAgZm9yIChjb25zdCAkc2VsZWN0aW9uIG9mIHRoaXMuc3dyYXAuZ2V0U2VsZWN0aW9ucyh0aGlzLmVkaXRvcikpIHtcbiAgICAgICAgICAkc2VsZWN0aW9uLm5vcm1hbGl6ZSgpXG4gICAgICAgICAgJHNlbGVjdGlvbi5hcHBseVdpc2UoXCJibG9ja3dpc2VcIilcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIFJldHVybiB0cnVlIG9yIGZhbHNlXG4gIHNlbGVjdFRleHRPYmplY3Qoc2VsZWN0aW9uKSB7XG4gICAgY29uc3QgcmFuZ2UgPSB0aGlzLmdldFJhbmdlKHNlbGVjdGlvbilcbiAgICBpZiAocmFuZ2UpIHtcbiAgICAgIHRoaXMuc3dyYXAoc2VsZWN0aW9uKS5zZXRCdWZmZXJSYW5nZShyYW5nZSlcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cbiAgfVxuXG4gIC8vIHRvIG92ZXJyaWRlXG4gIGdldFJhbmdlKHNlbGVjdGlvbikge31cbn1cblxuLy8gU2VjdGlvbjogV29yZFxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PVxuY2xhc3MgV29yZCBleHRlbmRzIFRleHRPYmplY3Qge1xuICBnZXRSYW5nZShzZWxlY3Rpb24pIHtcbiAgICBjb25zdCBwb2ludCA9IHRoaXMuZ2V0Q3Vyc29yUG9zaXRpb25Gb3JTZWxlY3Rpb24oc2VsZWN0aW9uKVxuICAgIGNvbnN0IHtyYW5nZX0gPSB0aGlzLmdldFdvcmRCdWZmZXJSYW5nZUFuZEtpbmRBdEJ1ZmZlclBvc2l0aW9uKHBvaW50LCB7d29yZFJlZ2V4OiB0aGlzLndvcmRSZWdleH0pXG4gICAgcmV0dXJuIHRoaXMuaXNBKCkgPyB0aGlzLnV0aWxzLmV4cGFuZFJhbmdlVG9XaGl0ZVNwYWNlcyh0aGlzLmVkaXRvciwgcmFuZ2UpIDogcmFuZ2VcbiAgfVxufVxuXG5jbGFzcyBXaG9sZVdvcmQgZXh0ZW5kcyBXb3JkIHtcbiAgd29yZFJlZ2V4ID0gL1xcUysvXG59XG5cbi8vIEp1c3QgaW5jbHVkZSBfLCAtXG5jbGFzcyBTbWFydFdvcmQgZXh0ZW5kcyBXb3JkIHtcbiAgd29yZFJlZ2V4ID0gL1tcXHctXSsvXG59XG5cbi8vIEp1c3QgaW5jbHVkZSBfLCAtXG5jbGFzcyBTdWJ3b3JkIGV4dGVuZHMgV29yZCB7XG4gIGdldFJhbmdlKHNlbGVjdGlvbikge1xuICAgIHRoaXMud29yZFJlZ2V4ID0gc2VsZWN0aW9uLmN1cnNvci5zdWJ3b3JkUmVnRXhwKClcbiAgICByZXR1cm4gc3VwZXIuZ2V0UmFuZ2Uoc2VsZWN0aW9uKVxuICB9XG59XG5cbi8vIFNlY3Rpb246IFBhaXJcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIFBhaXIgZXh0ZW5kcyBUZXh0T2JqZWN0IHtcbiAgc3RhdGljIGNvbW1hbmQgPSBmYWxzZVxuICBzdXBwb3J0Q291bnQgPSB0cnVlXG4gIGFsbG93TmV4dExpbmUgPSBudWxsXG4gIGFkanVzdElubmVyUmFuZ2UgPSB0cnVlXG4gIHBhaXIgPSBudWxsXG4gIGluY2x1c2l2ZSA9IHRydWVcblxuICBpc0FsbG93TmV4dExpbmUoKSB7XG4gICAgcmV0dXJuIHRoaXMuYWxsb3dOZXh0TGluZSAhPSBudWxsID8gdGhpcy5hbGxvd05leHRMaW5lIDogdGhpcy5wYWlyICE9IG51bGwgJiYgdGhpcy5wYWlyWzBdICE9PSB0aGlzLnBhaXJbMV1cbiAgfVxuXG4gIGFkanVzdFJhbmdlKHtzdGFydCwgZW5kfSkge1xuICAgIC8vIERpcnR5IHdvcmsgdG8gZmVlbCBuYXR1cmFsIGZvciBodW1hbiwgdG8gYmVoYXZlIGNvbXBhdGlibGUgd2l0aCBwdXJlIFZpbS5cbiAgICAvLyBXaGVyZSB0aGlzIGFkanVzdG1lbnQgYXBwZWFyIGlzIGluIGZvbGxvd2luZyBzaXR1YXRpb24uXG4gICAgLy8gb3AtMTogYGNpe2AgcmVwbGFjZSBvbmx5IDJuZCBsaW5lXG4gICAgLy8gb3AtMjogYGRpe2AgZGVsZXRlIG9ubHkgMm5kIGxpbmUuXG4gICAgLy8gdGV4dDpcbiAgICAvLyAge1xuICAgIC8vICAgIGFhYVxuICAgIC8vICB9XG4gICAgaWYgKHRoaXMudXRpbHMucG9pbnRJc0F0RW5kT2ZMaW5lKHRoaXMuZWRpdG9yLCBzdGFydCkpIHtcbiAgICAgIHN0YXJ0ID0gc3RhcnQudHJhdmVyc2UoWzEsIDBdKVxuICAgIH1cblxuICAgIGlmICh0aGlzLnV0aWxzLmdldExpbmVUZXh0VG9CdWZmZXJQb3NpdGlvbih0aGlzLmVkaXRvciwgZW5kKS5tYXRjaCgvXlxccyokLykpIHtcbiAgICAgIGlmICh0aGlzLm1vZGUgPT09IFwidmlzdWFsXCIpIHtcbiAgICAgICAgLy8gVGhpcyBpcyBzbGlnaHRseSBpbm5jb25zaXN0ZW50IHdpdGggcmVndWxhciBWaW1cbiAgICAgICAgLy8gLSByZWd1bGFyIFZpbTogc2VsZWN0IG5ldyBsaW5lIGFmdGVyIEVPTFxuICAgICAgICAvLyAtIHZpbS1tb2RlLXBsdXM6IHNlbGVjdCB0byBFT0woYmVmb3JlIG5ldyBsaW5lKVxuICAgICAgICAvLyBUaGlzIGlzIGludGVudGlvbmFsIHNpbmNlIHRvIG1ha2Ugc3VibW9kZSBgY2hhcmFjdGVyd2lzZWAgd2hlbiBhdXRvLWRldGVjdCBzdWJtb2RlXG4gICAgICAgIC8vIGlubmVyRW5kID0gbmV3IFBvaW50KGlubmVyRW5kLnJvdyAtIDEsIEluZmluaXR5KVxuICAgICAgICBlbmQgPSBuZXcgUG9pbnQoZW5kLnJvdyAtIDEsIEluZmluaXR5KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZW5kID0gbmV3IFBvaW50KGVuZC5yb3csIDApXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBuZXcgUmFuZ2Uoc3RhcnQsIGVuZClcbiAgfVxuXG4gIGdldEZpbmRlcigpIHtcbiAgICBjb25zdCBmaW5kZXJOYW1lID0gdGhpcy5wYWlyWzBdID09PSB0aGlzLnBhaXJbMV0gPyBcIlF1b3RlRmluZGVyXCIgOiBcIkJyYWNrZXRGaW5kZXJcIlxuICAgIHJldHVybiBuZXcgUGFpckZpbmRlcltmaW5kZXJOYW1lXSh0aGlzLmVkaXRvciwge1xuICAgICAgYWxsb3dOZXh0TGluZTogdGhpcy5pc0FsbG93TmV4dExpbmUoKSxcbiAgICAgIGFsbG93Rm9yd2FyZGluZzogdGhpcy5hbGxvd0ZvcndhcmRpbmcsXG4gICAgICBwYWlyOiB0aGlzLnBhaXIsXG4gICAgICBpbmNsdXNpdmU6IHRoaXMuaW5jbHVzaXZlLFxuICAgIH0pXG4gIH1cblxuICBnZXRQYWlySW5mbyhmcm9tKSB7XG4gICAgY29uc3QgcGFpckluZm8gPSB0aGlzLmdldEZpbmRlcigpLmZpbmQoZnJvbSlcbiAgICBpZiAocGFpckluZm8pIHtcbiAgICAgIGlmICh0aGlzLmFkanVzdElubmVyUmFuZ2UpIHBhaXJJbmZvLmlubmVyUmFuZ2UgPSB0aGlzLmFkanVzdFJhbmdlKHBhaXJJbmZvLmlubmVyUmFuZ2UpXG4gICAgICBwYWlySW5mby50YXJnZXRSYW5nZSA9IHRoaXMuaXNJbm5lcigpID8gcGFpckluZm8uaW5uZXJSYW5nZSA6IHBhaXJJbmZvLmFSYW5nZVxuICAgICAgcmV0dXJuIHBhaXJJbmZvXG4gICAgfVxuICB9XG5cbiAgZ2V0UmFuZ2Uoc2VsZWN0aW9uKSB7XG4gICAgY29uc3Qgb3JpZ2luYWxSYW5nZSA9IHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpXG4gICAgbGV0IHBhaXJJbmZvID0gdGhpcy5nZXRQYWlySW5mbyh0aGlzLmdldEN1cnNvclBvc2l0aW9uRm9yU2VsZWN0aW9uKHNlbGVjdGlvbikpXG4gICAgLy8gV2hlbiByYW5nZSB3YXMgc2FtZSwgdHJ5IHRvIGV4cGFuZCByYW5nZVxuICAgIGlmIChwYWlySW5mbyAmJiBwYWlySW5mby50YXJnZXRSYW5nZS5pc0VxdWFsKG9yaWdpbmFsUmFuZ2UpKSB7XG4gICAgICBwYWlySW5mbyA9IHRoaXMuZ2V0UGFpckluZm8ocGFpckluZm8uYVJhbmdlLmVuZClcbiAgICB9XG4gICAgaWYgKHBhaXJJbmZvKSByZXR1cm4gcGFpckluZm8udGFyZ2V0UmFuZ2VcbiAgfVxufVxuXG4vLyBVc2VkIGJ5IERlbGV0ZVN1cnJvdW5kXG5jbGFzcyBBUGFpciBleHRlbmRzIFBhaXIge1xuICBzdGF0aWMgY29tbWFuZCA9IGZhbHNlXG59XG5cbmNsYXNzIEFueVBhaXIgZXh0ZW5kcyBQYWlyIHtcbiAgYWxsb3dGb3J3YXJkaW5nID0gZmFsc2VcbiAgbWVtYmVyID0gW1wiRG91YmxlUXVvdGVcIiwgXCJTaW5nbGVRdW90ZVwiLCBcIkJhY2tUaWNrXCIsIFwiQ3VybHlCcmFja2V0XCIsIFwiQW5nbGVCcmFja2V0XCIsIFwiU3F1YXJlQnJhY2tldFwiLCBcIlBhcmVudGhlc2lzXCJdXG5cbiAgZ2V0UmFuZ2VzKHNlbGVjdGlvbikge1xuICAgIGNvbnN0IG9wdGlvbnMgPSB7aW5uZXI6IHRoaXMuaW5uZXIsIGFsbG93Rm9yd2FyZGluZzogdGhpcy5hbGxvd0ZvcndhcmRpbmcsIGluY2x1c2l2ZTogdGhpcy5pbmNsdXNpdmV9XG4gICAgcmV0dXJuIHRoaXMubWVtYmVyLm1hcChtZW1iZXIgPT4gdGhpcy5nZXRJbnN0YW5jZShtZW1iZXIsIG9wdGlvbnMpLmdldFJhbmdlKHNlbGVjdGlvbikpLmZpbHRlcihyYW5nZSA9PiByYW5nZSlcbiAgfVxuXG4gIGdldFJhbmdlKHNlbGVjdGlvbikge1xuICAgIHJldHVybiBfLmxhc3QodGhpcy51dGlscy5zb3J0UmFuZ2VzKHRoaXMuZ2V0UmFuZ2VzKHNlbGVjdGlvbikpKVxuICB9XG59XG5cbmNsYXNzIEFueVBhaXJBbGxvd0ZvcndhcmRpbmcgZXh0ZW5kcyBBbnlQYWlyIHtcbiAgYWxsb3dGb3J3YXJkaW5nID0gdHJ1ZVxuXG4gIGdldFJhbmdlKHNlbGVjdGlvbikge1xuICAgIGNvbnN0IHJhbmdlcyA9IHRoaXMuZ2V0UmFuZ2VzKHNlbGVjdGlvbilcbiAgICBjb25zdCBmcm9tID0gc2VsZWN0aW9uLmN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXG4gICAgbGV0IFtmb3J3YXJkaW5nUmFuZ2VzLCBlbmNsb3NpbmdSYW5nZXNdID0gXy5wYXJ0aXRpb24ocmFuZ2VzLCByYW5nZSA9PiByYW5nZS5zdGFydC5pc0dyZWF0ZXJUaGFuT3JFcXVhbChmcm9tKSlcbiAgICBjb25zdCBlbmNsb3NpbmdSYW5nZSA9IF8ubGFzdCh0aGlzLnV0aWxzLnNvcnRSYW5nZXMoZW5jbG9zaW5nUmFuZ2VzKSlcbiAgICBmb3J3YXJkaW5nUmFuZ2VzID0gdGhpcy51dGlscy5zb3J0UmFuZ2VzKGZvcndhcmRpbmdSYW5nZXMpXG5cbiAgICAvLyBXaGVuIGVuY2xvc2luZ1JhbmdlIGlzIGV4aXN0cyxcbiAgICAvLyBXZSBkb24ndCBnbyBhY3Jvc3MgZW5jbG9zaW5nUmFuZ2UuZW5kLlxuICAgIC8vIFNvIGNob29zZSBmcm9tIHJhbmdlcyBjb250YWluZWQgaW4gZW5jbG9zaW5nUmFuZ2UuXG4gICAgaWYgKGVuY2xvc2luZ1JhbmdlKSB7XG4gICAgICBmb3J3YXJkaW5nUmFuZ2VzID0gZm9yd2FyZGluZ1Jhbmdlcy5maWx0ZXIocmFuZ2UgPT4gZW5jbG9zaW5nUmFuZ2UuY29udGFpbnNSYW5nZShyYW5nZSkpXG4gICAgfVxuXG4gICAgcmV0dXJuIGZvcndhcmRpbmdSYW5nZXNbMF0gfHwgZW5jbG9zaW5nUmFuZ2VcbiAgfVxufVxuXG5jbGFzcyBBbnlRdW90ZSBleHRlbmRzIEFueVBhaXIge1xuICBhbGxvd0ZvcndhcmRpbmcgPSB0cnVlXG4gIG1lbWJlciA9IFtcIkRvdWJsZVF1b3RlXCIsIFwiU2luZ2xlUXVvdGVcIiwgXCJCYWNrVGlja1wiXVxuXG4gIGdldFJhbmdlKHNlbGVjdGlvbikge1xuICAgIGNvbnN0IHJhbmdlcyA9IHRoaXMuZ2V0UmFuZ2VzKHNlbGVjdGlvbilcbiAgICAvLyBQaWNrIHJhbmdlIHdoaWNoIGVuZC5jb2x1bSBpcyBsZWZ0bW9zdChtZWFuLCBjbG9zZWQgZmlyc3QpXG4gICAgaWYgKHJhbmdlcy5sZW5ndGgpIHJldHVybiBfLmZpcnN0KF8uc29ydEJ5KHJhbmdlcywgciA9PiByLmVuZC5jb2x1bW4pKVxuICB9XG59XG5cbmNsYXNzIFF1b3RlIGV4dGVuZHMgUGFpciB7XG4gIHN0YXRpYyBjb21tYW5kID0gZmFsc2VcbiAgYWxsb3dGb3J3YXJkaW5nID0gdHJ1ZVxufVxuXG5jbGFzcyBEb3VibGVRdW90ZSBleHRlbmRzIFF1b3RlIHtcbiAgcGFpciA9IFsnXCInLCAnXCInXVxufVxuXG5jbGFzcyBTaW5nbGVRdW90ZSBleHRlbmRzIFF1b3RlIHtcbiAgcGFpciA9IFtcIidcIiwgXCInXCJdXG59XG5cbmNsYXNzIEJhY2tUaWNrIGV4dGVuZHMgUXVvdGUge1xuICBwYWlyID0gW1wiYFwiLCBcImBcIl1cbn1cblxuY2xhc3MgQ3VybHlCcmFja2V0IGV4dGVuZHMgUGFpciB7XG4gIHBhaXIgPSBbXCJ7XCIsIFwifVwiXVxufVxuXG5jbGFzcyBTcXVhcmVCcmFja2V0IGV4dGVuZHMgUGFpciB7XG4gIHBhaXIgPSBbXCJbXCIsIFwiXVwiXVxufVxuXG5jbGFzcyBQYXJlbnRoZXNpcyBleHRlbmRzIFBhaXIge1xuICBwYWlyID0gW1wiKFwiLCBcIilcIl1cbn1cblxuY2xhc3MgQW5nbGVCcmFja2V0IGV4dGVuZHMgUGFpciB7XG4gIHBhaXIgPSBbXCI8XCIsIFwiPlwiXVxufVxuXG5jbGFzcyBUYWcgZXh0ZW5kcyBQYWlyIHtcbiAgYWxsb3dOZXh0TGluZSA9IHRydWVcbiAgYWxsb3dGb3J3YXJkaW5nID0gdHJ1ZVxuICBhZGp1c3RJbm5lclJhbmdlID0gZmFsc2VcblxuICBnZXRUYWdTdGFydFBvaW50KGZyb20pIHtcbiAgICBjb25zdCByZWdleCA9IFBhaXJGaW5kZXIuVGFnRmluZGVyLnBhdHRlcm5cbiAgICBjb25zdCBvcHRpb25zID0ge2Zyb206IFtmcm9tLnJvdywgMF19XG4gICAgcmV0dXJuIHRoaXMuZmluZEluRWRpdG9yKFwiZm9yd2FyZFwiLCByZWdleCwgb3B0aW9ucywgKHtyYW5nZX0pID0+IHJhbmdlLmNvbnRhaW5zUG9pbnQoZnJvbSwgdHJ1ZSkgJiYgcmFuZ2Uuc3RhcnQpXG4gIH1cblxuICBnZXRGaW5kZXIoKSB7XG4gICAgcmV0dXJuIG5ldyBQYWlyRmluZGVyLlRhZ0ZpbmRlcih0aGlzLmVkaXRvciwge1xuICAgICAgYWxsb3dOZXh0TGluZTogdGhpcy5pc0FsbG93TmV4dExpbmUoKSxcbiAgICAgIGFsbG93Rm9yd2FyZGluZzogdGhpcy5hbGxvd0ZvcndhcmRpbmcsXG4gICAgICBpbmNsdXNpdmU6IHRoaXMuaW5jbHVzaXZlLFxuICAgIH0pXG4gIH1cblxuICBnZXRQYWlySW5mbyhmcm9tKSB7XG4gICAgcmV0dXJuIHN1cGVyLmdldFBhaXJJbmZvKHRoaXMuZ2V0VGFnU3RhcnRQb2ludChmcm9tKSB8fCBmcm9tKVxuICB9XG59XG5cbi8vIFNlY3Rpb246IFBhcmFncmFwaFxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gUGFyYWdyYXBoIGlzIGRlZmluZWQgYXMgY29uc2VjdXRpdmUgKG5vbi0pYmxhbmstbGluZS5cbmNsYXNzIFBhcmFncmFwaCBleHRlbmRzIFRleHRPYmplY3Qge1xuICB3aXNlID0gXCJsaW5ld2lzZVwiXG4gIHN1cHBvcnRDb3VudCA9IHRydWVcblxuICBmaW5kUm93KGZyb21Sb3csIGRpcmVjdGlvbiwgZm4pIHtcbiAgICBpZiAoZm4ucmVzZXQpIGZuLnJlc2V0KClcbiAgICBsZXQgZm91bmRSb3cgPSBmcm9tUm93XG4gICAgZm9yIChjb25zdCByb3cgb2YgdGhpcy5nZXRCdWZmZXJSb3dzKHtzdGFydFJvdzogZnJvbVJvdywgZGlyZWN0aW9ufSkpIHtcbiAgICAgIGlmICghZm4ocm93LCBkaXJlY3Rpb24pKSBicmVha1xuICAgICAgZm91bmRSb3cgPSByb3dcbiAgICB9XG4gICAgcmV0dXJuIGZvdW5kUm93XG4gIH1cblxuICBmaW5kUm93UmFuZ2VCeShmcm9tUm93LCBmbikge1xuICAgIGNvbnN0IHN0YXJ0Um93ID0gdGhpcy5maW5kUm93KGZyb21Sb3csIFwicHJldmlvdXNcIiwgZm4pXG4gICAgY29uc3QgZW5kUm93ID0gdGhpcy5maW5kUm93KGZyb21Sb3csIFwibmV4dFwiLCBmbilcbiAgICByZXR1cm4gW3N0YXJ0Um93LCBlbmRSb3ddXG4gIH1cblxuICBnZXRQcmVkaWN0RnVuY3Rpb24oZnJvbVJvdywgc2VsZWN0aW9uKSB7XG4gICAgY29uc3QgZnJvbVJvd1Jlc3VsdCA9IHRoaXMuZWRpdG9yLmlzQnVmZmVyUm93QmxhbmsoZnJvbVJvdylcblxuICAgIGlmICh0aGlzLmlzSW5uZXIoKSkge1xuICAgICAgcmV0dXJuIChyb3csIGRpcmVjdGlvbikgPT4gdGhpcy5lZGl0b3IuaXNCdWZmZXJSb3dCbGFuayhyb3cpID09PSBmcm9tUm93UmVzdWx0XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGRpcmVjdGlvblRvRXh0ZW5kID0gc2VsZWN0aW9uLmlzUmV2ZXJzZWQoKSA/IFwicHJldmlvdXNcIiA6IFwibmV4dFwiXG5cbiAgICAgIGxldCBmbGlwID0gZmFsc2VcbiAgICAgIGNvbnN0IHByZWRpY3QgPSAocm93LCBkaXJlY3Rpb24pID0+IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gdGhpcy5lZGl0b3IuaXNCdWZmZXJSb3dCbGFuayhyb3cpID09PSBmcm9tUm93UmVzdWx0XG4gICAgICAgIGlmIChmbGlwKSB7XG4gICAgICAgICAgcmV0dXJuICFyZXN1bHRcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAoIXJlc3VsdCAmJiBkaXJlY3Rpb24gPT09IGRpcmVjdGlvblRvRXh0ZW5kKSB7XG4gICAgICAgICAgICByZXR1cm4gKGZsaXAgPSB0cnVlKVxuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gcmVzdWx0XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHByZWRpY3QucmVzZXQgPSAoKSA9PiAoZmxpcCA9IGZhbHNlKVxuICAgICAgcmV0dXJuIHByZWRpY3RcbiAgICB9XG4gIH1cblxuICBnZXRSYW5nZShzZWxlY3Rpb24pIHtcbiAgICBjb25zdCBvcmlnaW5hbFJhbmdlID0gc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKClcbiAgICBsZXQgZnJvbVJvdyA9IHRoaXMuZ2V0Q3Vyc29yUG9zaXRpb25Gb3JTZWxlY3Rpb24oc2VsZWN0aW9uKS5yb3dcbiAgICBpZiAodGhpcy5pc01vZGUoXCJ2aXN1YWxcIiwgXCJsaW5ld2lzZVwiKSkge1xuICAgICAgaWYgKHNlbGVjdGlvbi5pc1JldmVyc2VkKCkpIGZyb21Sb3ctLVxuICAgICAgZWxzZSBmcm9tUm93KytcbiAgICAgIGZyb21Sb3cgPSB0aGlzLmdldFZhbGlkVmltQnVmZmVyUm93KGZyb21Sb3cpXG4gICAgfVxuICAgIGNvbnN0IHJvd1JhbmdlID0gdGhpcy5maW5kUm93UmFuZ2VCeShmcm9tUm93LCB0aGlzLmdldFByZWRpY3RGdW5jdGlvbihmcm9tUm93LCBzZWxlY3Rpb24pKVxuICAgIHJldHVybiBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKS51bmlvbih0aGlzLmdldEJ1ZmZlclJhbmdlRm9yUm93UmFuZ2Uocm93UmFuZ2UpKVxuICB9XG59XG5cbmNsYXNzIEluZGVudGF0aW9uIGV4dGVuZHMgUGFyYWdyYXBoIHtcbiAgZ2V0UmFuZ2Uoc2VsZWN0aW9uKSB7XG4gICAgY29uc3QgZnJvbVJvdyA9IHRoaXMuZ2V0Q3Vyc29yUG9zaXRpb25Gb3JTZWxlY3Rpb24oc2VsZWN0aW9uKS5yb3dcbiAgICBjb25zdCBiYXNlSW5kZW50TGV2ZWwgPSB0aGlzLmVkaXRvci5pbmRlbnRhdGlvbkZvckJ1ZmZlclJvdyhmcm9tUm93KVxuICAgIGNvbnN0IHJvd1JhbmdlID0gdGhpcy5maW5kUm93UmFuZ2VCeShmcm9tUm93LCByb3cgPT4ge1xuICAgICAgcmV0dXJuIHRoaXMuZWRpdG9yLmlzQnVmZmVyUm93Qmxhbmsocm93KVxuICAgICAgICA/IHRoaXMuaXNBKClcbiAgICAgICAgOiB0aGlzLmVkaXRvci5pbmRlbnRhdGlvbkZvckJ1ZmZlclJvdyhyb3cpID49IGJhc2VJbmRlbnRMZXZlbFxuICAgIH0pXG4gICAgcmV0dXJuIHRoaXMuZ2V0QnVmZmVyUmFuZ2VGb3JSb3dSYW5nZShyb3dSYW5nZSlcbiAgfVxufVxuXG4vLyBTZWN0aW9uOiBDb21tZW50XG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09XG5jbGFzcyBDb21tZW50IGV4dGVuZHMgVGV4dE9iamVjdCB7XG4gIENvbW1lbnRcbiAgd2lzZSA9IFwibGluZXdpc2VcIlxuXG4gIGdldFJhbmdlKHNlbGVjdGlvbikge1xuICAgIGNvbnN0IHtyb3d9ID0gdGhpcy5nZXRDdXJzb3JQb3NpdGlvbkZvclNlbGVjdGlvbihzZWxlY3Rpb24pXG4gICAgY29uc3Qgcm93UmFuZ2UgPSB0aGlzLnV0aWxzLmdldFJvd1JhbmdlRm9yQ29tbWVudEF0QnVmZmVyUm93KHRoaXMuZWRpdG9yLCByb3cpXG4gICAgaWYgKHJvd1JhbmdlKSB7XG4gICAgICByZXR1cm4gdGhpcy5nZXRCdWZmZXJSYW5nZUZvclJvd1JhbmdlKHJvd1JhbmdlKVxuICAgIH1cbiAgfVxufVxuXG5jbGFzcyBDb21tZW50T3JQYXJhZ3JhcGggZXh0ZW5kcyBUZXh0T2JqZWN0IHtcbiAgd2lzZSA9IFwibGluZXdpc2VcIlxuXG4gIGdldFJhbmdlKHNlbGVjdGlvbikge1xuICAgIGNvbnN0IHtpbm5lcn0gPSB0aGlzXG4gICAgZm9yIChjb25zdCBrbGFzcyBvZiBbXCJDb21tZW50XCIsIFwiUGFyYWdyYXBoXCJdKSB7XG4gICAgICBjb25zdCByYW5nZSA9IHRoaXMuZ2V0SW5zdGFuY2Uoa2xhc3MsIHtpbm5lcn0pLmdldFJhbmdlKHNlbGVjdGlvbilcbiAgICAgIGlmIChyYW5nZSkgcmV0dXJuIHJhbmdlXG4gICAgfVxuICB9XG59XG5cbi8vIFNlY3Rpb246IEZvbGRcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIEZvbGQgZXh0ZW5kcyBUZXh0T2JqZWN0IHtcbiAgd2lzZSA9IFwibGluZXdpc2VcIlxuXG4gIGFkanVzdFJvd1JhbmdlKHJvd1JhbmdlKSB7XG4gICAgaWYgKHRoaXMuaXNBKCkpIHJldHVybiByb3dSYW5nZVxuXG4gICAgbGV0IFtzdGFydFJvdywgZW5kUm93XSA9IHJvd1JhbmdlXG4gICAgaWYgKHRoaXMuZWRpdG9yLmluZGVudGF0aW9uRm9yQnVmZmVyUm93KHN0YXJ0Um93KSA9PT0gdGhpcy5lZGl0b3IuaW5kZW50YXRpb25Gb3JCdWZmZXJSb3coZW5kUm93KSkge1xuICAgICAgZW5kUm93IC09IDFcbiAgICB9XG4gICAgc3RhcnRSb3cgKz0gMVxuICAgIHJldHVybiBbc3RhcnRSb3csIGVuZFJvd11cbiAgfVxuXG4gIGdldEZvbGRSb3dSYW5nZXNDb250YWluc0ZvclJvdyhyb3cpIHtcbiAgICByZXR1cm4gdGhpcy51dGlscy5nZXRDb2RlRm9sZFJvd1Jhbmdlc0NvbnRhaW5lc0ZvclJvdyh0aGlzLmVkaXRvciwgcm93KS5yZXZlcnNlKClcbiAgfVxuXG4gIGdldFJhbmdlKHNlbGVjdGlvbikge1xuICAgIGNvbnN0IHtyb3d9ID0gdGhpcy5nZXRDdXJzb3JQb3NpdGlvbkZvclNlbGVjdGlvbihzZWxlY3Rpb24pXG4gICAgY29uc3Qgc2VsZWN0ZWRSYW5nZSA9IHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpXG4gICAgZm9yIChjb25zdCByb3dSYW5nZSBvZiB0aGlzLmdldEZvbGRSb3dSYW5nZXNDb250YWluc0ZvclJvdyhyb3cpKSB7XG4gICAgICBjb25zdCByYW5nZSA9IHRoaXMuZ2V0QnVmZmVyUmFuZ2VGb3JSb3dSYW5nZSh0aGlzLmFkanVzdFJvd1JhbmdlKHJvd1JhbmdlKSlcblxuICAgICAgLy8gRG9uJ3QgY2hhbmdlIHRvIGBpZiByYW5nZS5jb250YWluc1JhbmdlKHNlbGVjdGVkUmFuZ2UsIHRydWUpYFxuICAgICAgLy8gVGhlcmUgaXMgYmVoYXZpb3IgZGlmZiB3aGVuIGN1cnNvciBpcyBhdCBiZWdpbm5pbmcgb2YgbGluZSggY29sdW1uIDAgKS5cbiAgICAgIGlmICghc2VsZWN0ZWRSYW5nZS5jb250YWluc1JhbmdlKHJhbmdlKSkgcmV0dXJuIHJhbmdlXG4gICAgfVxuICB9XG59XG5cbi8vIE5PVEU6IEZ1bmN0aW9uIHJhbmdlIGRldGVybWluYXRpb24gaXMgZGVwZW5kaW5nIG9uIGZvbGQuXG5jbGFzcyBGdW5jdGlvbiBleHRlbmRzIEZvbGQge1xuICAvLyBTb21lIGxhbmd1YWdlIGRvbid0IGluY2x1ZGUgY2xvc2luZyBgfWAgaW50byBmb2xkLlxuICBzY29wZU5hbWVzT21pdHRpbmdFbmRSb3cgPSBbXCJzb3VyY2UuZ29cIiwgXCJzb3VyY2UuZWxpeGlyXCJdXG5cbiAgaXNHcmFtbWFyTm90Rm9sZEVuZFJvdygpIHtcbiAgICBjb25zdCB7c2NvcGVOYW1lLCBwYWNrYWdlTmFtZX0gPSB0aGlzLmVkaXRvci5nZXRHcmFtbWFyKClcbiAgICBpZiAodGhpcy5zY29wZU5hbWVzT21pdHRpbmdFbmRSb3cuaW5jbHVkZXMoc2NvcGVOYW1lKSkge1xuICAgICAgcmV0dXJuIHRydWVcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gSEFDSzogUnVzdCBoYXZlIHR3byBwYWNrYWdlIGBsYW5ndWFnZS1ydXN0YCBhbmQgYGF0b20tbGFuZ3VhZ2UtcnVzdGBcbiAgICAgIC8vIGxhbmd1YWdlLXJ1c3QgZG9uJ3QgZm9sZCBlbmRpbmcgYH1gLCBidXQgYXRvbS1sYW5ndWFnZS1ydXN0IGRvZXMuXG4gICAgICByZXR1cm4gc2NvcGVOYW1lID09PSBcInNvdXJjZS5ydXN0XCIgJiYgcGFja2FnZU5hbWUgPT09IFwibGFuZ3VhZ2UtcnVzdFwiXG4gICAgfVxuICB9XG5cbiAgZ2V0Rm9sZFJvd1Jhbmdlc0NvbnRhaW5zRm9yUm93KHJvdykge1xuICAgIHJldHVybiBzdXBlci5nZXRGb2xkUm93UmFuZ2VzQ29udGFpbnNGb3JSb3cocm93KS5maWx0ZXIocm93UmFuZ2UgPT4ge1xuICAgICAgcmV0dXJuIHRoaXMudXRpbHMuaXNJbmNsdWRlRnVuY3Rpb25TY29wZUZvclJvdyh0aGlzLmVkaXRvciwgcm93UmFuZ2VbMF0pXG4gICAgfSlcbiAgfVxuXG4gIGFkanVzdFJvd1JhbmdlKHJvd1JhbmdlKSB7XG4gICAgbGV0IFtzdGFydFJvdywgZW5kUm93XSA9IHN1cGVyLmFkanVzdFJvd1JhbmdlKHJvd1JhbmdlKVxuICAgIC8vIE5PVEU6IFRoaXMgYWRqdXN0bWVudCBzaG91ZCBub3QgYmUgbmVjZXNzYXJ5IGlmIGxhbmd1YWdlLXN5bnRheCBpcyBwcm9wZXJseSBkZWZpbmVkLlxuICAgIGlmICh0aGlzLmlzQSgpICYmIHRoaXMuaXNHcmFtbWFyTm90Rm9sZEVuZFJvdygpKSBlbmRSb3cgKz0gMVxuICAgIHJldHVybiBbc3RhcnRSb3csIGVuZFJvd11cbiAgfVxufVxuXG4vLyBTZWN0aW9uOiBPdGhlclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PVxuY2xhc3MgQXJndW1lbnRzIGV4dGVuZHMgVGV4dE9iamVjdCB7XG4gIG5ld0FyZ0luZm8oYXJnU3RhcnQsIGFyZywgc2VwYXJhdG9yKSB7XG4gICAgY29uc3QgYXJnRW5kID0gdGhpcy51dGlscy50cmF2ZXJzZVRleHRGcm9tUG9pbnQoYXJnU3RhcnQsIGFyZylcbiAgICBjb25zdCBhcmdSYW5nZSA9IG5ldyBSYW5nZShhcmdTdGFydCwgYXJnRW5kKVxuXG4gICAgY29uc3Qgc2VwYXJhdG9yRW5kID0gdGhpcy51dGlscy50cmF2ZXJzZVRleHRGcm9tUG9pbnQoYXJnRW5kLCBzZXBhcmF0b3IgIT0gbnVsbCA/IHNlcGFyYXRvciA6IFwiXCIpXG4gICAgY29uc3Qgc2VwYXJhdG9yUmFuZ2UgPSBuZXcgUmFuZ2UoYXJnRW5kLCBzZXBhcmF0b3JFbmQpXG5cbiAgICBjb25zdCBpbm5lclJhbmdlID0gYXJnUmFuZ2VcbiAgICBjb25zdCBhUmFuZ2UgPSBhcmdSYW5nZS51bmlvbihzZXBhcmF0b3JSYW5nZSlcbiAgICByZXR1cm4ge2FyZ1JhbmdlLCBzZXBhcmF0b3JSYW5nZSwgaW5uZXJSYW5nZSwgYVJhbmdlfVxuICB9XG5cbiAgZ2V0QXJndW1lbnRzUmFuZ2VGb3JTZWxlY3Rpb24oc2VsZWN0aW9uKSB7XG4gICAgY29uc3Qgb3B0aW9ucyA9IHtcbiAgICAgIG1lbWJlcjogW1wiQ3VybHlCcmFja2V0XCIsIFwiU3F1YXJlQnJhY2tldFwiLCBcIlBhcmVudGhlc2lzXCJdLFxuICAgICAgaW5jbHVzaXZlOiBmYWxzZSxcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZ2V0SW5zdGFuY2UoXCJJbm5lckFueVBhaXJcIiwgb3B0aW9ucykuZ2V0UmFuZ2Uoc2VsZWN0aW9uKVxuICB9XG5cbiAgZ2V0UmFuZ2Uoc2VsZWN0aW9uKSB7XG4gICAgbGV0IHJhbmdlID0gdGhpcy5nZXRBcmd1bWVudHNSYW5nZUZvclNlbGVjdGlvbihzZWxlY3Rpb24pXG4gICAgY29uc3QgcGFpclJhbmdlRm91bmQgPSByYW5nZSAhPSBudWxsXG5cbiAgICByYW5nZSA9IHJhbmdlIHx8IHRoaXMuZ2V0SW5zdGFuY2UoXCJJbm5lckN1cnJlbnRMaW5lXCIpLmdldFJhbmdlKHNlbGVjdGlvbikgLy8gZmFsbGJhY2tcbiAgICBpZiAoIXJhbmdlKSByZXR1cm5cblxuICAgIHJhbmdlID0gdGhpcy50cmltQnVmZmVyUmFuZ2UocmFuZ2UpXG5cbiAgICBjb25zdCB0ZXh0ID0gdGhpcy5lZGl0b3IuZ2V0VGV4dEluQnVmZmVyUmFuZ2UocmFuZ2UpXG4gICAgY29uc3QgYWxsVG9rZW5zID0gdGhpcy51dGlscy5zcGxpdEFyZ3VtZW50cyh0ZXh0LCBwYWlyUmFuZ2VGb3VuZClcblxuICAgIGNvbnN0IGFyZ0luZm9zID0gW11cbiAgICBsZXQgYXJnU3RhcnQgPSByYW5nZS5zdGFydFxuXG4gICAgLy8gU2tpcCBzdGFydGluZyBzZXBhcmF0b3JcbiAgICBpZiAoYWxsVG9rZW5zLmxlbmd0aCAmJiBhbGxUb2tlbnNbMF0udHlwZSA9PT0gXCJzZXBhcmF0b3JcIikge1xuICAgICAgY29uc3QgdG9rZW4gPSBhbGxUb2tlbnMuc2hpZnQoKVxuICAgICAgYXJnU3RhcnQgPSB0aGlzLnV0aWxzLnRyYXZlcnNlVGV4dEZyb21Qb2ludChhcmdTdGFydCwgdG9rZW4udGV4dClcbiAgICB9XG5cbiAgICB3aGlsZSAoYWxsVG9rZW5zLmxlbmd0aCkge1xuICAgICAgY29uc3QgdG9rZW4gPSBhbGxUb2tlbnMuc2hpZnQoKVxuICAgICAgaWYgKHRva2VuLnR5cGUgPT09IFwiYXJndW1lbnRcIikge1xuICAgICAgICBjb25zdCBuZXh0VG9rZW4gPSBhbGxUb2tlbnMuc2hpZnQoKVxuICAgICAgICBjb25zdCBzZXBhcmF0b3IgPSBuZXh0VG9rZW4gPyBuZXh0VG9rZW4udGV4dCA6IHVuZGVmaW5lZFxuICAgICAgICBjb25zdCBhcmdJbmZvID0gdGhpcy5uZXdBcmdJbmZvKGFyZ1N0YXJ0LCB0b2tlbi50ZXh0LCBzZXBhcmF0b3IpXG5cbiAgICAgICAgaWYgKGFsbFRva2Vucy5sZW5ndGggPT09IDAgJiYgYXJnSW5mb3MubGVuZ3RoKSB7XG4gICAgICAgICAgYXJnSW5mby5hUmFuZ2UgPSBhcmdJbmZvLmFyZ1JhbmdlLnVuaW9uKF8ubGFzdChhcmdJbmZvcykuc2VwYXJhdG9yUmFuZ2UpXG4gICAgICAgIH1cblxuICAgICAgICBhcmdTdGFydCA9IGFyZ0luZm8uYVJhbmdlLmVuZFxuICAgICAgICBhcmdJbmZvcy5wdXNoKGFyZ0luZm8pXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJtdXN0IG5vdCBoYXBwZW5cIilcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBwb2ludCA9IHRoaXMuZ2V0Q3Vyc29yUG9zaXRpb25Gb3JTZWxlY3Rpb24oc2VsZWN0aW9uKVxuICAgIGZvciAoY29uc3Qge2lubmVyUmFuZ2UsIGFSYW5nZX0gb2YgYXJnSW5mb3MpIHtcbiAgICAgIGlmIChpbm5lclJhbmdlLmVuZC5pc0dyZWF0ZXJUaGFuT3JFcXVhbChwb2ludCkpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaXNJbm5lcigpID8gaW5uZXJSYW5nZSA6IGFSYW5nZVxuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5jbGFzcyBDdXJyZW50TGluZSBleHRlbmRzIFRleHRPYmplY3Qge1xuICBnZXRSYW5nZShzZWxlY3Rpb24pIHtcbiAgICBjb25zdCB7cm93fSA9IHRoaXMuZ2V0Q3Vyc29yUG9zaXRpb25Gb3JTZWxlY3Rpb24oc2VsZWN0aW9uKVxuICAgIGNvbnN0IHJhbmdlID0gdGhpcy5lZGl0b3IuYnVmZmVyUmFuZ2VGb3JCdWZmZXJSb3cocm93KVxuICAgIHJldHVybiB0aGlzLmlzQSgpID8gcmFuZ2UgOiB0aGlzLnRyaW1CdWZmZXJSYW5nZShyYW5nZSlcbiAgfVxufVxuXG5jbGFzcyBFbnRpcmUgZXh0ZW5kcyBUZXh0T2JqZWN0IHtcbiAgd2lzZSA9IFwibGluZXdpc2VcIlxuICBzZWxlY3RPbmNlID0gdHJ1ZVxuXG4gIGdldFJhbmdlKHNlbGVjdGlvbikge1xuICAgIHJldHVybiB0aGlzLmVkaXRvci5idWZmZXIuZ2V0UmFuZ2UoKVxuICB9XG59XG5cbmNsYXNzIEVtcHR5IGV4dGVuZHMgVGV4dE9iamVjdCB7XG4gIHN0YXRpYyBjb21tYW5kID0gZmFsc2VcbiAgc2VsZWN0T25jZSA9IHRydWVcbn1cblxuY2xhc3MgTGF0ZXN0Q2hhbmdlIGV4dGVuZHMgVGV4dE9iamVjdCB7XG4gIHdpc2UgPSBudWxsXG4gIHNlbGVjdE9uY2UgPSB0cnVlXG4gIGdldFJhbmdlKHNlbGVjdGlvbikge1xuICAgIGNvbnN0IHN0YXJ0ID0gdGhpcy52aW1TdGF0ZS5tYXJrLmdldChcIltcIilcbiAgICBjb25zdCBlbmQgPSB0aGlzLnZpbVN0YXRlLm1hcmsuZ2V0KFwiXVwiKVxuICAgIGlmIChzdGFydCAmJiBlbmQpIHtcbiAgICAgIHJldHVybiBuZXcgUmFuZ2Uoc3RhcnQsIGVuZClcbiAgICB9XG4gIH1cbn1cblxuY2xhc3MgU2VhcmNoTWF0Y2hGb3J3YXJkIGV4dGVuZHMgVGV4dE9iamVjdCB7XG4gIGJhY2t3YXJkID0gZmFsc2VcblxuICBmaW5kTWF0Y2goZnJvbSwgcmVnZXgpIHtcbiAgICBpZiAodGhpcy5iYWNrd2FyZCkge1xuICAgICAgaWYgKHRoaXMubW9kZSA9PT0gXCJ2aXN1YWxcIikge1xuICAgICAgICBmcm9tID0gdGhpcy51dGlscy50cmFuc2xhdGVQb2ludEFuZENsaXAodGhpcy5lZGl0b3IsIGZyb20sIFwiYmFja3dhcmRcIilcbiAgICAgIH1cblxuICAgICAgY29uc3Qgb3B0aW9ucyA9IHtmcm9tOiBbZnJvbS5yb3csIEluZmluaXR5XX1cbiAgICAgIHJldHVybiB7XG4gICAgICAgIHJhbmdlOiB0aGlzLmZpbmRJbkVkaXRvcihcImJhY2t3YXJkXCIsIHJlZ2V4LCBvcHRpb25zLCAoe3JhbmdlfSkgPT4gcmFuZ2Uuc3RhcnQuaXNMZXNzVGhhbihmcm9tKSAmJiByYW5nZSksXG4gICAgICAgIHdoaWNoSXNIZWFkOiBcInN0YXJ0XCIsXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICh0aGlzLm1vZGUgPT09IFwidmlzdWFsXCIpIHtcbiAgICAgICAgZnJvbSA9IHRoaXMudXRpbHMudHJhbnNsYXRlUG9pbnRBbmRDbGlwKHRoaXMuZWRpdG9yLCBmcm9tLCBcImZvcndhcmRcIilcbiAgICAgIH1cblxuICAgICAgY29uc3Qgb3B0aW9ucyA9IHtmcm9tOiBbZnJvbS5yb3csIDBdfVxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgcmFuZ2U6IHRoaXMuZmluZEluRWRpdG9yKFwiZm9yd2FyZFwiLCByZWdleCwgb3B0aW9ucywgKHtyYW5nZX0pID0+IHJhbmdlLmVuZC5pc0dyZWF0ZXJUaGFuKGZyb20pICYmIHJhbmdlKSxcbiAgICAgICAgd2hpY2hJc0hlYWQ6IFwiZW5kXCIsXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZ2V0UmFuZ2Uoc2VsZWN0aW9uKSB7XG4gICAgY29uc3QgcGF0dGVybiA9IHRoaXMuZ2xvYmFsU3RhdGUuZ2V0KFwibGFzdFNlYXJjaFBhdHRlcm5cIilcbiAgICBpZiAoIXBhdHRlcm4pIHJldHVyblxuXG4gICAgY29uc3QgZnJvbVBvaW50ID0gc2VsZWN0aW9uLmdldEhlYWRCdWZmZXJQb3NpdGlvbigpXG4gICAgY29uc3Qge3JhbmdlLCB3aGljaElzSGVhZH0gPSB0aGlzLmZpbmRNYXRjaChmcm9tUG9pbnQsIHBhdHRlcm4pXG4gICAgaWYgKHJhbmdlKSB7XG4gICAgICByZXR1cm4gdGhpcy51bmlvblJhbmdlQW5kRGV0ZXJtaW5lUmV2ZXJzZWRTdGF0ZShzZWxlY3Rpb24sIHJhbmdlLCB3aGljaElzSGVhZClcbiAgICB9XG4gIH1cblxuICB1bmlvblJhbmdlQW5kRGV0ZXJtaW5lUmV2ZXJzZWRTdGF0ZShzZWxlY3Rpb24sIHJhbmdlLCB3aGljaElzSGVhZCkge1xuICAgIGlmIChzZWxlY3Rpb24uaXNFbXB0eSgpKSByZXR1cm4gcmFuZ2VcblxuICAgIGxldCBoZWFkID0gcmFuZ2Vbd2hpY2hJc0hlYWRdXG4gICAgY29uc3QgdGFpbCA9IHNlbGVjdGlvbi5nZXRUYWlsQnVmZmVyUG9zaXRpb24oKVxuXG4gICAgaWYgKHRoaXMuYmFja3dhcmQpIHtcbiAgICAgIGlmICh0YWlsLmlzTGVzc1RoYW4oaGVhZCkpIGhlYWQgPSB0aGlzLnV0aWxzLnRyYW5zbGF0ZVBvaW50QW5kQ2xpcCh0aGlzLmVkaXRvciwgaGVhZCwgXCJmb3J3YXJkXCIpXG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChoZWFkLmlzTGVzc1RoYW4odGFpbCkpIGhlYWQgPSB0aGlzLnV0aWxzLnRyYW5zbGF0ZVBvaW50QW5kQ2xpcCh0aGlzLmVkaXRvciwgaGVhZCwgXCJiYWNrd2FyZFwiKVxuICAgIH1cblxuICAgIHRoaXMucmV2ZXJzZWQgPSBoZWFkLmlzTGVzc1RoYW4odGFpbClcbiAgICByZXR1cm4gbmV3IFJhbmdlKHRhaWwsIGhlYWQpLnVuaW9uKHRoaXMuc3dyYXAoc2VsZWN0aW9uKS5nZXRUYWlsQnVmZmVyUmFuZ2UoKSlcbiAgfVxuXG4gIHNlbGVjdFRleHRPYmplY3Qoc2VsZWN0aW9uKSB7XG4gICAgY29uc3QgcmFuZ2UgPSB0aGlzLmdldFJhbmdlKHNlbGVjdGlvbilcbiAgICBpZiAocmFuZ2UpIHtcbiAgICAgIHRoaXMuc3dyYXAoc2VsZWN0aW9uKS5zZXRCdWZmZXJSYW5nZShyYW5nZSwge3JldmVyc2VkOiB0aGlzLnJldmVyc2VkICE9IG51bGwgPyB0aGlzLnJldmVyc2VkIDogdGhpcy5iYWNrd2FyZH0pXG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH1cbiAgfVxufVxuXG5jbGFzcyBTZWFyY2hNYXRjaEJhY2t3YXJkIGV4dGVuZHMgU2VhcmNoTWF0Y2hGb3J3YXJkIHtcbiAgYmFja3dhcmQgPSB0cnVlXG59XG5cbi8vIFtMaW1pdGF0aW9uOiB3b24ndCBmaXhdOiBTZWxlY3RlZCByYW5nZSBpcyBub3Qgc3VibW9kZSBhd2FyZS4gYWx3YXlzIGNoYXJhY3Rlcndpc2UuXG4vLyBTbyBldmVuIGlmIG9yaWdpbmFsIHNlbGVjdGlvbiB3YXMgdkwgb3IgdkIsIHNlbGVjdGVkIHJhbmdlIGJ5IHRoaXMgdGV4dC1vYmplY3Rcbi8vIGlzIGFsd2F5cyB2QyByYW5nZS5cbmNsYXNzIFByZXZpb3VzU2VsZWN0aW9uIGV4dGVuZHMgVGV4dE9iamVjdCB7XG4gIHdpc2UgPSBudWxsXG4gIHNlbGVjdE9uY2UgPSB0cnVlXG5cbiAgc2VsZWN0VGV4dE9iamVjdChzZWxlY3Rpb24pIHtcbiAgICBjb25zdCB7cHJvcGVydGllcywgc3VibW9kZX0gPSB0aGlzLnZpbVN0YXRlLnByZXZpb3VzU2VsZWN0aW9uXG4gICAgaWYgKHByb3BlcnRpZXMgJiYgc3VibW9kZSkge1xuICAgICAgdGhpcy53aXNlID0gc3VibW9kZVxuICAgICAgdGhpcy5zd3JhcCh0aGlzLmVkaXRvci5nZXRMYXN0U2VsZWN0aW9uKCkpLnNlbGVjdEJ5UHJvcGVydGllcyhwcm9wZXJ0aWVzKVxuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG4gIH1cbn1cblxuY2xhc3MgUGVyc2lzdGVudFNlbGVjdGlvbiBleHRlbmRzIFRleHRPYmplY3Qge1xuICB3aXNlID0gbnVsbFxuICBzZWxlY3RPbmNlID0gdHJ1ZVxuXG4gIHNlbGVjdFRleHRPYmplY3Qoc2VsZWN0aW9uKSB7XG4gICAgaWYgKHRoaXMudmltU3RhdGUuaGFzUGVyc2lzdGVudFNlbGVjdGlvbnMoKSkge1xuICAgICAgdGhpcy5wZXJzaXN0ZW50U2VsZWN0aW9uLnNldFNlbGVjdGVkQnVmZmVyUmFuZ2VzKClcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfVxuICB9XG59XG5cbi8vIFVzZWQgb25seSBieSBSZXBsYWNlV2l0aFJlZ2lzdGVyIGFuZCBQdXRCZWZvcmUgYW5kIGl0cycgY2hpbGRyZW4uXG5jbGFzcyBMYXN0UGFzdGVkUmFuZ2UgZXh0ZW5kcyBUZXh0T2JqZWN0IHtcbiAgc3RhdGljIGNvbW1hbmQgPSBmYWxzZVxuICB3aXNlID0gbnVsbFxuICBzZWxlY3RPbmNlID0gdHJ1ZVxuXG4gIHNlbGVjdFRleHRPYmplY3Qoc2VsZWN0aW9uKSB7XG4gICAgZm9yIChzZWxlY3Rpb24gb2YgdGhpcy5lZGl0b3IuZ2V0U2VsZWN0aW9ucygpKSB7XG4gICAgICBjb25zdCByYW5nZSA9IHRoaXMudmltU3RhdGUuc2VxdWVudGlhbFBhc3RlTWFuYWdlci5nZXRQYXN0ZWRSYW5nZUZvclNlbGVjdGlvbihzZWxlY3Rpb24pXG4gICAgICBzZWxlY3Rpb24uc2V0QnVmZmVyUmFuZ2UocmFuZ2UpXG4gICAgfVxuICAgIHJldHVybiB0cnVlXG4gIH1cbn1cblxuY2xhc3MgVmlzaWJsZUFyZWEgZXh0ZW5kcyBUZXh0T2JqZWN0IHtcbiAgc2VsZWN0T25jZSA9IHRydWVcblxuICBnZXRSYW5nZShzZWxlY3Rpb24pIHtcbiAgICBjb25zdCBbc3RhcnRSb3csIGVuZFJvd10gPSB0aGlzLmVkaXRvci5nZXRWaXNpYmxlUm93UmFuZ2UoKVxuICAgIHJldHVybiB0aGlzLmVkaXRvci5idWZmZXJSYW5nZUZvclNjcmVlblJhbmdlKFtbc3RhcnRSb3csIDBdLCBbZW5kUm93LCBJbmZpbml0eV1dKVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gT2JqZWN0LmFzc2lnbihcbiAge1xuICAgIFRleHRPYmplY3QsXG4gICAgV29yZCxcbiAgICBXaG9sZVdvcmQsXG4gICAgU21hcnRXb3JkLFxuICAgIFN1YndvcmQsXG4gICAgUGFpcixcbiAgICBBUGFpcixcbiAgICBBbnlQYWlyLFxuICAgIEFueVBhaXJBbGxvd0ZvcndhcmRpbmcsXG4gICAgQW55UXVvdGUsXG4gICAgUXVvdGUsXG4gICAgRG91YmxlUXVvdGUsXG4gICAgU2luZ2xlUXVvdGUsXG4gICAgQmFja1RpY2ssXG4gICAgQ3VybHlCcmFja2V0LFxuICAgIFNxdWFyZUJyYWNrZXQsXG4gICAgUGFyZW50aGVzaXMsXG4gICAgQW5nbGVCcmFja2V0LFxuICAgIFRhZyxcbiAgICBQYXJhZ3JhcGgsXG4gICAgSW5kZW50YXRpb24sXG4gICAgQ29tbWVudCxcbiAgICBDb21tZW50T3JQYXJhZ3JhcGgsXG4gICAgRm9sZCxcbiAgICBGdW5jdGlvbixcbiAgICBBcmd1bWVudHMsXG4gICAgQ3VycmVudExpbmUsXG4gICAgRW50aXJlLFxuICAgIEVtcHR5LFxuICAgIExhdGVzdENoYW5nZSxcbiAgICBTZWFyY2hNYXRjaEZvcndhcmQsXG4gICAgU2VhcmNoTWF0Y2hCYWNrd2FyZCxcbiAgICBQcmV2aW91c1NlbGVjdGlvbixcbiAgICBQZXJzaXN0ZW50U2VsZWN0aW9uLFxuICAgIExhc3RQYXN0ZWRSYW5nZSxcbiAgICBWaXNpYmxlQXJlYSxcbiAgfSxcbiAgV29yZC5kZXJpdmVDbGFzcyh0cnVlKSxcbiAgV2hvbGVXb3JkLmRlcml2ZUNsYXNzKHRydWUpLFxuICBTbWFydFdvcmQuZGVyaXZlQ2xhc3ModHJ1ZSksXG4gIFN1YndvcmQuZGVyaXZlQ2xhc3ModHJ1ZSksXG4gIEFueVBhaXIuZGVyaXZlQ2xhc3ModHJ1ZSksXG4gIEFueVBhaXJBbGxvd0ZvcndhcmRpbmcuZGVyaXZlQ2xhc3ModHJ1ZSksXG4gIEFueVF1b3RlLmRlcml2ZUNsYXNzKHRydWUpLFxuICBEb3VibGVRdW90ZS5kZXJpdmVDbGFzcyh0cnVlKSxcbiAgU2luZ2xlUXVvdGUuZGVyaXZlQ2xhc3ModHJ1ZSksXG4gIEJhY2tUaWNrLmRlcml2ZUNsYXNzKHRydWUpLFxuICBDdXJseUJyYWNrZXQuZGVyaXZlQ2xhc3ModHJ1ZSwgdHJ1ZSksXG4gIFNxdWFyZUJyYWNrZXQuZGVyaXZlQ2xhc3ModHJ1ZSwgdHJ1ZSksXG4gIFBhcmVudGhlc2lzLmRlcml2ZUNsYXNzKHRydWUsIHRydWUpLFxuICBBbmdsZUJyYWNrZXQuZGVyaXZlQ2xhc3ModHJ1ZSwgdHJ1ZSksXG4gIFRhZy5kZXJpdmVDbGFzcyh0cnVlKSxcbiAgUGFyYWdyYXBoLmRlcml2ZUNsYXNzKHRydWUpLFxuICBJbmRlbnRhdGlvbi5kZXJpdmVDbGFzcyh0cnVlKSxcbiAgQ29tbWVudC5kZXJpdmVDbGFzcyh0cnVlKSxcbiAgQ29tbWVudE9yUGFyYWdyYXBoLmRlcml2ZUNsYXNzKHRydWUpLFxuICBGb2xkLmRlcml2ZUNsYXNzKHRydWUpLFxuICBGdW5jdGlvbi5kZXJpdmVDbGFzcyh0cnVlKSxcbiAgQXJndW1lbnRzLmRlcml2ZUNsYXNzKHRydWUpLFxuICBDdXJyZW50TGluZS5kZXJpdmVDbGFzcyh0cnVlKSxcbiAgRW50aXJlLmRlcml2ZUNsYXNzKHRydWUpLFxuICBMYXRlc3RDaGFuZ2UuZGVyaXZlQ2xhc3ModHJ1ZSksXG4gIFBlcnNpc3RlbnRTZWxlY3Rpb24uZGVyaXZlQ2xhc3ModHJ1ZSksXG4gIFZpc2libGVBcmVhLmRlcml2ZUNsYXNzKHRydWUpXG4pXG4iXX0=