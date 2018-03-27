"use babel";

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _require = require("atom");

var Range = _require.Range;
var Point = _require.Point;

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
      return this.utils.sortRanges(this.getRanges(selection)).pop();
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

      var _$partition = this._.partition(ranges, function (range) {
        return range.start.isGreaterThanOrEqual(from);
      });

      var _$partition2 = _slicedToArray(_$partition, 2);

      var forwardingRanges = _$partition2[0];
      var enclosingRanges = _$partition2[1];

      var enclosingRange = this.utils.sortRanges(enclosingRanges).pop();
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
      // Pick range which end.colum is leftmost(mean, closed first)
      return this.getRanges(selection).sort(function (a, b) {
        return a.end.column - b.end.column;
      })[0];
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

  _createClass(Fold, [{
    key: "getRange",
    value: function getRange(selection) {
      var _getCursorPositionForSelection2 = this.getCursorPositionForSelection(selection);

      var row = _getCursorPositionForSelection2.row;

      var selectedRange = selection.getBufferRange();
      var foldRanges = this.utils.getCodeFoldRangesContainesRow(this.editor, row).reverse();
      for (var foldRange of foldRanges) {
        var _adjustRange = this.adjustRange(foldRange);

        var start = _adjustRange.start;
        var end = _adjustRange.end;

        var range = this.getBufferRangeForRowRange([start.row, end.row]);
        if (!selectedRange.containsRange(range)) return range;
      }
    }
  }, {
    key: "adjustRange",
    value: function adjustRange(range) {
      if (this.isA()) return range;
      if (this.editor.indentationForBufferRow(range.start.row) === this.editor.indentationForBufferRow(range.end.row)) {
        range.end.row -= 1;
      }
      range.start.row += 1;
      return range;
    }
  }]);

  return Fold;
})(TextObject);

var Function = (function (_TextObject7) {
  _inherits(Function, _TextObject7);

  function Function() {
    _classCallCheck(this, Function);

    _get(Object.getPrototypeOf(Function.prototype), "constructor", this).apply(this, arguments);

    this.wise = "linewise";
    this.scopeNamesOmittingClosingBrace = ["source.go", "source.elixir"];
  }

  // Section: Other
  // =========================

  _createClass(Function, [{
    key: "getFunctionBodyStartRegex",
    // language doesn't include closing `}` into fold.

    value: function getFunctionBodyStartRegex(_ref5) {
      var scopeName = _ref5.scopeName;

      if (scopeName === "source.python") {
        return (/:$/
        );
      } else if (scopeName === "source.coffee") {
        return (/-|=>$/
        );
      } else {
        return (/{$/
        );
      }
    }
  }, {
    key: "isMultiLineParameterFunctionRange",
    value: function isMultiLineParameterFunctionRange(parameterRange, bodyRange, bodyStartRegex) {
      var _this6 = this;

      var isBodyStartRow = function isBodyStartRow(row) {
        return bodyStartRegex.test(_this6.editor.lineTextForBufferRow(row));
      };
      if (isBodyStartRow(parameterRange.start.row)) return false;
      if (isBodyStartRow(parameterRange.end.row)) return parameterRange.end.row === bodyRange.start.row;
      if (isBodyStartRow(parameterRange.end.row + 1)) return parameterRange.end.row + 1 === bodyRange.start.row;
      return false;
    }
  }, {
    key: "getRange",
    value: function getRange(selection) {
      var _this7 = this;

      var editor = this.editor;
      var cursorRow = this.getCursorPositionForSelection(selection).row;
      var bodyStartRegex = this.getFunctionBodyStartRegex(editor.getGrammar());
      var isIncludeFunctionScopeForRow = function isIncludeFunctionScopeForRow(row) {
        return _this7.utils.isIncludeFunctionScopeForRow(editor, row);
      };

      var functionRanges = [];
      var saveFunctionRange = function saveFunctionRange(_ref6) {
        var aRange = _ref6.aRange;
        var innerRange = _ref6.innerRange;

        functionRanges.push({
          aRange: _this7.buildARange(aRange),
          innerRange: _this7.buildInnerRange(innerRange)
        });
      };

      var foldRanges = this.utils.getCodeFoldRanges(editor);
      while (foldRanges.length) {
        var range = foldRanges.shift();
        if (isIncludeFunctionScopeForRow(range.start.row)) {
          var nextRange = foldRanges[0];
          var nextFoldIsConnected = nextRange && nextRange.start.row <= range.end.row + 1;
          var maybeAFunctionRange = nextFoldIsConnected ? range.union(nextRange) : range;
          if (!maybeAFunctionRange.containsPoint([cursorRow, Infinity])) continue; // skip to avoid heavy computation
          if (nextFoldIsConnected && this.isMultiLineParameterFunctionRange(range, nextRange, bodyStartRegex)) {
            var bodyRange = foldRanges.shift();
            saveFunctionRange({ aRange: range.union(bodyRange), innerRange: bodyRange });
          } else {
            saveFunctionRange({ aRange: range, innerRange: range });
          }
        } else {
          var previousRow = range.start.row - 1;
          if (previousRow < 0) continue;
          if (editor.isFoldableAtBufferRow(previousRow)) continue;
          var maybeAFunctionRange = range.union(editor.bufferRangeForBufferRow(previousRow));
          if (!maybeAFunctionRange.containsPoint([cursorRow, Infinity])) continue; // skip to avoid heavy computation

          var isBodyStartOnlyRow = function isBodyStartOnlyRow(row) {
            return new RegExp("^\\s*" + bodyStartRegex.source).test(editor.lineTextForBufferRow(row));
          };
          if (isBodyStartOnlyRow(range.start.row) && isIncludeFunctionScopeForRow(previousRow)) {
            saveFunctionRange({ aRange: maybeAFunctionRange, innerRange: range });
          }
        }
      }

      for (var functionRange of functionRanges.reverse()) {
        var _ref7 = this.isA() ? functionRange.aRange : functionRange.innerRange;

        var start = _ref7.start;
        var end = _ref7.end;

        var range = this.getBufferRangeForRowRange([start.row, end.row]);
        if (!selection.getBufferRange().containsRange(range)) return range;
      }
    }
  }, {
    key: "buildInnerRange",
    value: function buildInnerRange(range) {
      var _this8 = this;

      var indentForRow = function indentForRow(row) {
        return _this8.editor.indentationForBufferRow(row);
      };
      var endRowTranslation = indentForRow(range.start.row) === indentForRow(range.end.row) ? -1 : 0;
      return range.translate([1, 0], [endRowTranslation, 0]);
    }
  }, {
    key: "buildARange",
    value: function buildARange(range) {
      // NOTE: This adjustment shoud not be necessary if language-syntax is properly defined.
      var endRowTranslation = this.isGrammarDoesNotFoldClosingRow() ? +1 : 0;
      return range.translate([0, 0], [endRowTranslation, 0]);
    }
  }, {
    key: "isGrammarDoesNotFoldClosingRow",
    value: function isGrammarDoesNotFoldClosingRow() {
      var _editor$getGrammar = this.editor.getGrammar();

      var scopeName = _editor$getGrammar.scopeName;
      var packageName = _editor$getGrammar.packageName;

      if (this.scopeNamesOmittingClosingBrace.includes(scopeName)) {
        return true;
      } else {
        // HACK: Rust have two package `language-rust` and `atom-language-rust`
        // language-rust don't fold ending `}`, but atom-language-rust does.
        return scopeName === "source.rust" && packageName === "language-rust";
      }
    }
  }]);

  return Function;
})(TextObject);

var Arguments = (function (_TextObject8) {
  _inherits(Arguments, _TextObject8);

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
      var _utils = this.utils;
      var splitArguments = _utils.splitArguments;
      var traverseTextFromPoint = _utils.traverseTextFromPoint;
      var getLast = _utils.getLast;

      var range = this.getArgumentsRangeForSelection(selection);
      var pairRangeFound = range != null;

      range = range || this.getInstance("InnerCurrentLine").getRange(selection); // fallback
      if (!range) return;

      range = this.trimBufferRange(range);

      var text = this.editor.getTextInBufferRange(range);
      var allTokens = splitArguments(text, pairRangeFound);

      var argInfos = [];
      var argStart = range.start;

      // Skip starting separator
      if (allTokens.length && allTokens[0].type === "separator") {
        var token = allTokens.shift();
        argStart = traverseTextFromPoint(argStart, token.text);
      }

      while (allTokens.length) {
        var token = allTokens.shift();
        if (token.type === "argument") {
          var nextToken = allTokens.shift();
          var separator = nextToken ? nextToken.text : undefined;
          var argInfo = this.newArgInfo(argStart, token.text, separator);

          if (allTokens.length === 0 && argInfos.length) {
            argInfo.aRange = argInfo.argRange.union(getLast(argInfos).separatorRange);
          }

          argStart = argInfo.aRange.end;
          argInfos.push(argInfo);
        } else {
          throw new Error("must not happen");
        }
      }

      var point = this.getCursorPositionForSelection(selection);
      for (var _ref82 of argInfos) {
        var innerRange = _ref82.innerRange;
        var aRange = _ref82.aRange;

        if (innerRange.end.isGreaterThanOrEqual(point)) {
          return this.isInner() ? innerRange : aRange;
        }
      }
    }
  }]);

  return Arguments;
})(TextObject);

var CurrentLine = (function (_TextObject9) {
  _inherits(CurrentLine, _TextObject9);

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

var Entire = (function (_TextObject10) {
  _inherits(Entire, _TextObject10);

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

var Empty = (function (_TextObject11) {
  _inherits(Empty, _TextObject11);

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

var LatestChange = (function (_TextObject12) {
  _inherits(LatestChange, _TextObject12);

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

var SearchMatchForward = (function (_TextObject13) {
  _inherits(SearchMatchForward, _TextObject13);

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
          range: this.findInEditor("backward", regex, options, function (_ref9) {
            var range = _ref9.range;
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
          range: this.findInEditor("forward", regex, options, function (_ref10) {
            var range = _ref10.range;
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

var PreviousSelection = (function (_TextObject14) {
  _inherits(PreviousSelection, _TextObject14);

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

var PersistentSelection = (function (_TextObject15) {
  _inherits(PersistentSelection, _TextObject15);

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

var LastPastedRange = (function (_TextObject16) {
  _inherits(LastPastedRange, _TextObject16);

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

var VisibleArea = (function (_TextObject17) {
  _inherits(VisibleArea, _TextObject17);

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL3RleHQtb2JqZWN0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFdBQVcsQ0FBQTs7Ozs7Ozs7Ozs7O2VBRVksT0FBTyxDQUFDLE1BQU0sQ0FBQzs7SUFBL0IsS0FBSyxZQUFMLEtBQUs7SUFBRSxLQUFLLFlBQUwsS0FBSzs7Ozs7QUFLbkIsSUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFBO0FBQzlCLElBQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQTs7SUFFckMsVUFBVTtZQUFWLFVBQVU7O1dBQVYsVUFBVTswQkFBVixVQUFVOzsrQkFBVixVQUFVOztTQUlkLFFBQVEsR0FBRyxJQUFJO1NBQ2YsSUFBSSxHQUFHLGVBQWU7U0FDdEIsWUFBWSxHQUFHLEtBQUs7U0FDcEIsVUFBVSxHQUFHLEtBQUs7U0FDbEIsZUFBZSxHQUFHLEtBQUs7Ozs7OztlQVJuQixVQUFVOztXQTRDUCxtQkFBRztBQUNSLGFBQU8sSUFBSSxDQUFDLEtBQUssQ0FBQTtLQUNsQjs7O1dBRUUsZUFBRztBQUNKLGFBQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFBO0tBQ25COzs7V0FFUyxzQkFBRztBQUNYLGFBQU8sSUFBSSxDQUFDLElBQUksS0FBSyxVQUFVLENBQUE7S0FDaEM7OztXQUVVLHVCQUFHO0FBQ1osYUFBTyxJQUFJLENBQUMsSUFBSSxLQUFLLFdBQVcsQ0FBQTtLQUNqQzs7O1dBRVEsbUJBQUMsSUFBSSxFQUFFO0FBQ2QsYUFBUSxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztLQUMxQjs7O1dBRVMsc0JBQUc7QUFDWCxVQUFJLENBQUMsZUFBZSxHQUFHLEtBQUssQ0FBQTtLQUM3Qjs7Ozs7OztXQUtNLG1CQUFHOztBQUVSLFVBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLE1BQU0sSUFBSSxLQUFLLENB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ZXMvdmltLW1vZGUtcGx1cy9saWIvdGV4dC1vYmplY3QuanMiLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBiYWJlbFwiXG5cbmNvbnN0IHtSYW5nZSwgUG9pbnR9ID0gcmVxdWlyZShcImF0b21cIilcblxuLy8gW1RPRE9dIE5lZWQgb3ZlcmhhdWxcbi8vICAtIFsgXSBNYWtlIGV4cGFuZGFibGUgYnkgc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKCkudW5pb24odGhpcy5nZXRSYW5nZShzZWxlY3Rpb24pKVxuLy8gIC0gWyBdIENvdW50IHN1cHBvcnQocHJpb3JpdHkgbG93KT9cbmNvbnN0IEJhc2UgPSByZXF1aXJlKFwiLi9iYXNlXCIpXG5jb25zdCBQYWlyRmluZGVyID0gcmVxdWlyZShcIi4vcGFpci1maW5kZXJcIilcblxuY2xhc3MgVGV4dE9iamVjdCBleHRlbmRzIEJhc2Uge1xuICBzdGF0aWMgb3BlcmF0aW9uS2luZCA9IFwidGV4dC1vYmplY3RcIlxuICBzdGF0aWMgY29tbWFuZCA9IGZhbHNlXG5cbiAgb3BlcmF0b3IgPSBudWxsXG4gIHdpc2UgPSBcImNoYXJhY3Rlcndpc2VcIlxuICBzdXBwb3J0Q291bnQgPSBmYWxzZSAvLyBGSVhNRSAjNDcyLCAjNjZcbiAgc2VsZWN0T25jZSA9IGZhbHNlXG4gIHNlbGVjdFN1Y2NlZWRlZCA9IGZhbHNlXG5cbiAgc3RhdGljIGRlcml2ZUNsYXNzKGlubmVyQW5kQSwgaW5uZXJBbmRBRm9yQWxsb3dGb3J3YXJkaW5nKSB7XG4gICAgdGhpcy5jb21tYW5kID0gZmFsc2VcbiAgICBjb25zdCBzdG9yZSA9IHt9XG4gICAgY29uc3QgZ2VuZXJhdGVDbGFzcyA9ICguLi5hcmdzKSA9PiB7XG4gICAgICBjb25zdCBrbGFzcyA9IHRoaXMuZ2VuZXJhdGVDbGFzcyguLi5hcmdzKVxuICAgICAgc3RvcmVba2xhc3MubmFtZV0gPSBrbGFzc1xuICAgIH1cblxuICAgIGlmIChpbm5lckFuZEEpIHtcbiAgICAgIGdlbmVyYXRlQ2xhc3MoZmFsc2UpXG4gICAgICBnZW5lcmF0ZUNsYXNzKHRydWUpXG4gICAgfVxuICAgIGlmIChpbm5lckFuZEFGb3JBbGxvd0ZvcndhcmRpbmcpIHtcbiAgICAgIGdlbmVyYXRlQ2xhc3MoZmFsc2UsIHRydWUpXG4gICAgICBnZW5lcmF0ZUNsYXNzKHRydWUsIHRydWUpXG4gICAgfVxuICAgIHJldHVybiBzdG9yZVxuICB9XG5cbiAgc3RhdGljIGdlbmVyYXRlQ2xhc3MoaW5uZXIsIGFsbG93Rm9yd2FyZGluZykge1xuICAgIGNvbnN0IGtsYXNzTmFtZSA9IChpbm5lciA/IFwiSW5uZXJcIiA6IFwiQVwiKSArIHRoaXMubmFtZSArIChhbGxvd0ZvcndhcmRpbmcgPyBcIkFsbG93Rm9yd2FyZGluZ1wiIDogXCJcIilcblxuICAgIHJldHVybiBjbGFzcyBleHRlbmRzIHRoaXMge1xuICAgICAgc3RhdGljIGdldCBuYW1lKCkge1xuICAgICAgICByZXR1cm4ga2xhc3NOYW1lXG4gICAgICB9XG4gICAgICBjb25zdHJ1Y3Rvcih2aW1TdGF0ZSkge1xuICAgICAgICBzdXBlcih2aW1TdGF0ZSlcbiAgICAgICAgdGhpcy5pbm5lciA9IGlubmVyXG4gICAgICAgIGlmIChhbGxvd0ZvcndhcmRpbmcgIT0gbnVsbCkgdGhpcy5hbGxvd0ZvcndhcmRpbmcgPSBhbGxvd0ZvcndhcmRpbmdcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBpc0lubmVyKCkge1xuICAgIHJldHVybiB0aGlzLmlubmVyXG4gIH1cblxuICBpc0EoKSB7XG4gICAgcmV0dXJuICF0aGlzLmlubmVyXG4gIH1cblxuICBpc0xpbmV3aXNlKCkge1xuICAgIHJldHVybiB0aGlzLndpc2UgPT09IFwibGluZXdpc2VcIlxuICB9XG5cbiAgaXNCbG9ja3dpc2UoKSB7XG4gICAgcmV0dXJuIHRoaXMud2lzZSA9PT0gXCJibG9ja3dpc2VcIlxuICB9XG5cbiAgZm9yY2VXaXNlKHdpc2UpIHtcbiAgICByZXR1cm4gKHRoaXMud2lzZSA9IHdpc2UpIC8vIEZJWE1FIGN1cnJlbnRseSBub3Qgd2VsbCBzdXBwb3J0ZWRcbiAgfVxuXG4gIHJlc2V0U3RhdGUoKSB7XG4gICAgdGhpcy5zZWxlY3RTdWNjZWVkZWQgPSBmYWxzZVxuICB9XG5cbiAgLy8gZXhlY3V0ZTogQ2FsbGVkIGZyb20gT3BlcmF0b3I6OnNlbGVjdFRhcmdldCgpXG4gIC8vICAtIGB2IGkgcGAsIGlzIGBWaXN1YWxNb2RlU2VsZWN0YCBvcGVyYXRvciB3aXRoIEB0YXJnZXQgPSBgSW5uZXJQYXJhZ3JhcGhgLlxuICAvLyAgLSBgZCBpIHBgLCBpcyBgRGVsZXRlYCBvcGVyYXRvciB3aXRoIEB0YXJnZXQgPSBgSW5uZXJQYXJhZ3JhcGhgLlxuICBleGVjdXRlKCkge1xuICAgIC8vIFdoZW5uZXZlciBUZXh0T2JqZWN0IGlzIGV4ZWN1dGVkLCBpdCBoYXMgQG9wZXJhdG9yXG4gICAgaWYgKCF0aGlzLm9wZXJhdG9yKSB0aHJvdyBuZXcgRXJyb3IoXCJpbiBUZXh0T2JqZWN0OiBNdXN0IG5vdCBoYXBwZW5cIilcbiAgICB0aGlzLnNlbGVjdCgpXG4gIH1cblxuICBzZWxlY3QoKSB7XG4gICAgaWYgKHRoaXMuaXNNb2RlKFwidmlzdWFsXCIsIFwiYmxvY2t3aXNlXCIpKSB7XG4gICAgICB0aGlzLnN3cmFwLm5vcm1hbGl6ZSh0aGlzLmVkaXRvcilcbiAgICB9XG5cbiAgICB0aGlzLmNvdW50VGltZXModGhpcy5nZXRDb3VudCgpLCAoe3N0b3B9KSA9PiB7XG4gICAgICBpZiAoIXRoaXMuc3VwcG9ydENvdW50KSBzdG9wKCkgLy8gcXVpY2stZml4IGZvciAjNTYwXG5cbiAgICAgIGZvciAoY29uc3Qgc2VsZWN0aW9uIG9mIHRoaXMuZWRpdG9yLmdldFNlbGVjdGlvbnMoKSkge1xuICAgICAgICBjb25zdCBvbGRSYW5nZSA9IHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpXG4gICAgICAgIGlmICh0aGlzLnNlbGVjdFRleHRPYmplY3Qoc2VsZWN0aW9uKSkgdGhpcy5zZWxlY3RTdWNjZWVkZWQgPSB0cnVlXG4gICAgICAgIGlmIChzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKS5pc0VxdWFsKG9sZFJhbmdlKSkgc3RvcCgpXG4gICAgICAgIGlmICh0aGlzLnNlbGVjdE9uY2UpIGJyZWFrXG4gICAgICB9XG4gICAgfSlcblxuICAgIHRoaXMuZWRpdG9yLm1lcmdlSW50ZXJzZWN0aW5nU2VsZWN0aW9ucygpXG4gICAgLy8gU29tZSBUZXh0T2JqZWN0J3Mgd2lzZSBpcyBOT1QgZGV0ZXJtaW5pc3RpYy4gSXQgaGFzIHRvIGJlIGRldGVjdGVkIGZyb20gc2VsZWN0ZWQgcmFuZ2UuXG4gICAgaWYgKHRoaXMud2lzZSA9PSBudWxsKSB0aGlzLndpc2UgPSB0aGlzLnN3cmFwLmRldGVjdFdpc2UodGhpcy5lZGl0b3IpXG5cbiAgICBpZiAodGhpcy5vcGVyYXRvci5pbnN0YW5jZW9mKFwiU2VsZWN0QmFzZVwiKSkge1xuICAgICAgaWYgKHRoaXMuc2VsZWN0U3VjY2VlZGVkKSB7XG4gICAgICAgIGlmICh0aGlzLndpc2UgPT09IFwiY2hhcmFjdGVyd2lzZVwiKSB7XG4gICAgICAgICAgdGhpcy5zd3JhcC5zYXZlUHJvcGVydGllcyh0aGlzLmVkaXRvciwge2ZvcmNlOiB0cnVlfSlcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLndpc2UgPT09IFwibGluZXdpc2VcIikge1xuICAgICAgICAgIC8vIFdoZW4gdGFyZ2V0IGlzIHBlcnNpc3RlbnQtc2VsZWN0aW9uLCBuZXcgc2VsZWN0aW9uIGlzIGFkZGVkIGFmdGVyIHNlbGVjdFRleHRPYmplY3QuXG4gICAgICAgICAgLy8gU28gd2UgaGF2ZSB0byBhc3N1cmUgYWxsIHNlbGVjdGlvbiBoYXZlIHNlbGN0aW9uIHByb3BlcnR5LlxuICAgICAgICAgIC8vIE1heWJlIHRoaXMgbG9naWMgY2FuIGJlIG1vdmVkIHRvIG9wZXJhdGlvbiBzdGFjay5cbiAgICAgICAgICBmb3IgKGNvbnN0ICRzZWxlY3Rpb24gb2YgdGhpcy5zd3JhcC5nZXRTZWxlY3Rpb25zKHRoaXMuZWRpdG9yKSkge1xuICAgICAgICAgICAgaWYgKHRoaXMuZ2V0Q29uZmlnKFwic3RheU9uU2VsZWN0VGV4dE9iamVjdFwiKSkge1xuICAgICAgICAgICAgICBpZiAoISRzZWxlY3Rpb24uaGFzUHJvcGVydGllcygpKSAkc2VsZWN0aW9uLnNhdmVQcm9wZXJ0aWVzKClcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICRzZWxlY3Rpb24uc2F2ZVByb3BlcnRpZXMoKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgJHNlbGVjdGlvbi5maXhQcm9wZXJ0eVJvd1RvUm93UmFuZ2UoKVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5zdWJtb2RlID09PSBcImJsb2Nrd2lzZVwiKSB7XG4gICAgICAgIGZvciAoY29uc3QgJHNlbGVjdGlvbiBvZiB0aGlzLnN3cmFwLmdldFNlbGVjdGlvbnModGhpcy5lZGl0b3IpKSB7XG4gICAgICAgICAgJHNlbGVjdGlvbi5ub3JtYWxpemUoKVxuICAgICAgICAgICRzZWxlY3Rpb24uYXBwbHlXaXNlKFwiYmxvY2t3aXNlXCIpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyBSZXR1cm4gdHJ1ZSBvciBmYWxzZVxuICBzZWxlY3RUZXh0T2JqZWN0KHNlbGVjdGlvbikge1xuICAgIGNvbnN0IHJhbmdlID0gdGhpcy5nZXRSYW5nZShzZWxlY3Rpb24pXG4gICAgaWYgKHJhbmdlKSB7XG4gICAgICB0aGlzLnN3cmFwKHNlbGVjdGlvbikuc2V0QnVmZmVyUmFuZ2UocmFuZ2UpXG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG4gIH1cblxuICAvLyB0byBvdmVycmlkZVxuICBnZXRSYW5nZShzZWxlY3Rpb24pIHt9XG59XG5cbi8vIFNlY3Rpb246IFdvcmRcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIFdvcmQgZXh0ZW5kcyBUZXh0T2JqZWN0IHtcbiAgZ2V0UmFuZ2Uoc2VsZWN0aW9uKSB7XG4gICAgY29uc3QgcG9pbnQgPSB0aGlzLmdldEN1cnNvclBvc2l0aW9uRm9yU2VsZWN0aW9uKHNlbGVjdGlvbilcbiAgICBjb25zdCB7cmFuZ2V9ID0gdGhpcy5nZXRXb3JkQnVmZmVyUmFuZ2VBbmRLaW5kQXRCdWZmZXJQb3NpdGlvbihwb2ludCwge3dvcmRSZWdleDogdGhpcy53b3JkUmVnZXh9KVxuICAgIHJldHVybiB0aGlzLmlzQSgpID8gdGhpcy51dGlscy5leHBhbmRSYW5nZVRvV2hpdGVTcGFjZXModGhpcy5lZGl0b3IsIHJhbmdlKSA6IHJhbmdlXG4gIH1cbn1cblxuY2xhc3MgV2hvbGVXb3JkIGV4dGVuZHMgV29yZCB7XG4gIHdvcmRSZWdleCA9IC9cXFMrL1xufVxuXG4vLyBKdXN0IGluY2x1ZGUgXywgLVxuY2xhc3MgU21hcnRXb3JkIGV4dGVuZHMgV29yZCB7XG4gIHdvcmRSZWdleCA9IC9bXFx3LV0rL1xufVxuXG4vLyBKdXN0IGluY2x1ZGUgXywgLVxuY2xhc3MgU3Vid29yZCBleHRlbmRzIFdvcmQge1xuICBnZXRSYW5nZShzZWxlY3Rpb24pIHtcbiAgICB0aGlzLndvcmRSZWdleCA9IHNlbGVjdGlvbi5jdXJzb3Iuc3Vid29yZFJlZ0V4cCgpXG4gICAgcmV0dXJuIHN1cGVyLmdldFJhbmdlKHNlbGVjdGlvbilcbiAgfVxufVxuXG4vLyBTZWN0aW9uOiBQYWlyXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09XG5jbGFzcyBQYWlyIGV4dGVuZHMgVGV4dE9iamVjdCB7XG4gIHN0YXRpYyBjb21tYW5kID0gZmFsc2VcbiAgc3VwcG9ydENvdW50ID0gdHJ1ZVxuICBhbGxvd05leHRMaW5lID0gbnVsbFxuICBhZGp1c3RJbm5lclJhbmdlID0gdHJ1ZVxuICBwYWlyID0gbnVsbFxuICBpbmNsdXNpdmUgPSB0cnVlXG5cbiAgaXNBbGxvd05leHRMaW5lKCkge1xuICAgIHJldHVybiB0aGlzLmFsbG93TmV4dExpbmUgIT0gbnVsbCA/IHRoaXMuYWxsb3dOZXh0TGluZSA6IHRoaXMucGFpciAhPSBudWxsICYmIHRoaXMucGFpclswXSAhPT0gdGhpcy5wYWlyWzFdXG4gIH1cblxuICBhZGp1c3RSYW5nZSh7c3RhcnQsIGVuZH0pIHtcbiAgICAvLyBEaXJ0eSB3b3JrIHRvIGZlZWwgbmF0dXJhbCBmb3IgaHVtYW4sIHRvIGJlaGF2ZSBjb21wYXRpYmxlIHdpdGggcHVyZSBWaW0uXG4gICAgLy8gV2hlcmUgdGhpcyBhZGp1c3RtZW50IGFwcGVhciBpcyBpbiBmb2xsb3dpbmcgc2l0dWF0aW9uLlxuICAgIC8vIG9wLTE6IGBjaXtgIHJlcGxhY2Ugb25seSAybmQgbGluZVxuICAgIC8vIG9wLTI6IGBkaXtgIGRlbGV0ZSBvbmx5IDJuZCBsaW5lLlxuICAgIC8vIHRleHQ6XG4gICAgLy8gIHtcbiAgICAvLyAgICBhYWFcbiAgICAvLyAgfVxuICAgIGlmICh0aGlzLnV0aWxzLnBvaW50SXNBdEVuZE9mTGluZSh0aGlzLmVkaXRvciwgc3RhcnQpKSB7XG4gICAgICBzdGFydCA9IHN0YXJ0LnRyYXZlcnNlKFsxLCAwXSlcbiAgICB9XG5cbiAgICBpZiAodGhpcy51dGlscy5nZXRMaW5lVGV4dFRvQnVmZmVyUG9zaXRpb24odGhpcy5lZGl0b3IsIGVuZCkubWF0Y2goL15cXHMqJC8pKSB7XG4gICAgICBpZiAodGhpcy5tb2RlID09PSBcInZpc3VhbFwiKSB7XG4gICAgICAgIC8vIFRoaXMgaXMgc2xpZ2h0bHkgaW5uY29uc2lzdGVudCB3aXRoIHJlZ3VsYXIgVmltXG4gICAgICAgIC8vIC0gcmVndWxhciBWaW06IHNlbGVjdCBuZXcgbGluZSBhZnRlciBFT0xcbiAgICAgICAgLy8gLSB2aW0tbW9kZS1wbHVzOiBzZWxlY3QgdG8gRU9MKGJlZm9yZSBuZXcgbGluZSlcbiAgICAgICAgLy8gVGhpcyBpcyBpbnRlbnRpb25hbCBzaW5jZSB0byBtYWtlIHN1Ym1vZGUgYGNoYXJhY3Rlcndpc2VgIHdoZW4gYXV0by1kZXRlY3Qgc3VibW9kZVxuICAgICAgICAvLyBpbm5lckVuZCA9IG5ldyBQb2ludChpbm5lckVuZC5yb3cgLSAxLCBJbmZpbml0eSlcbiAgICAgICAgZW5kID0gbmV3IFBvaW50KGVuZC5yb3cgLSAxLCBJbmZpbml0eSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGVuZCA9IG5ldyBQb2ludChlbmQucm93LCAwKVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbmV3IFJhbmdlKHN0YXJ0LCBlbmQpXG4gIH1cblxuICBnZXRGaW5kZXIoKSB7XG4gICAgY29uc3QgZmluZGVyTmFtZSA9IHRoaXMucGFpclswXSA9PT0gdGhpcy5wYWlyWzFdID8gXCJRdW90ZUZpbmRlclwiIDogXCJCcmFja2V0RmluZGVyXCJcbiAgICByZXR1cm4gbmV3IFBhaXJGaW5kZXJbZmluZGVyTmFtZV0odGhpcy5lZGl0b3IsIHtcbiAgICAgIGFsbG93TmV4dExpbmU6IHRoaXMuaXNBbGxvd05leHRMaW5lKCksXG4gICAgICBhbGxvd0ZvcndhcmRpbmc6IHRoaXMuYWxsb3dGb3J3YXJkaW5nLFxuICAgICAgcGFpcjogdGhpcy5wYWlyLFxuICAgICAgaW5jbHVzaXZlOiB0aGlzLmluY2x1c2l2ZSxcbiAgICB9KVxuICB9XG5cbiAgZ2V0UGFpckluZm8oZnJvbSkge1xuICAgIGNvbnN0IHBhaXJJbmZvID0gdGhpcy5nZXRGaW5kZXIoKS5maW5kKGZyb20pXG4gICAgaWYgKHBhaXJJbmZvKSB7XG4gICAgICBpZiAodGhpcy5hZGp1c3RJbm5lclJhbmdlKSBwYWlySW5mby5pbm5lclJhbmdlID0gdGhpcy5hZGp1c3RSYW5nZShwYWlySW5mby5pbm5lclJhbmdlKVxuICAgICAgcGFpckluZm8udGFyZ2V0UmFuZ2UgPSB0aGlzLmlzSW5uZXIoKSA/IHBhaXJJbmZvLmlubmVyUmFuZ2UgOiBwYWlySW5mby5hUmFuZ2VcbiAgICAgIHJldHVybiBwYWlySW5mb1xuICAgIH1cbiAgfVxuXG4gIGdldFJhbmdlKHNlbGVjdGlvbikge1xuICAgIGNvbnN0IG9yaWdpbmFsUmFuZ2UgPSBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKVxuICAgIGxldCBwYWlySW5mbyA9IHRoaXMuZ2V0UGFpckluZm8odGhpcy5nZXRDdXJzb3JQb3NpdGlvbkZvclNlbGVjdGlvbihzZWxlY3Rpb24pKVxuICAgIC8vIFdoZW4gcmFuZ2Ugd2FzIHNhbWUsIHRyeSB0byBleHBhbmQgcmFuZ2VcbiAgICBpZiAocGFpckluZm8gJiYgcGFpckluZm8udGFyZ2V0UmFuZ2UuaXNFcXVhbChvcmlnaW5hbFJhbmdlKSkge1xuICAgICAgcGFpckluZm8gPSB0aGlzLmdldFBhaXJJbmZvKHBhaXJJbmZvLmFSYW5nZS5lbmQpXG4gICAgfVxuICAgIGlmIChwYWlySW5mbykgcmV0dXJuIHBhaXJJbmZvLnRhcmdldFJhbmdlXG4gIH1cbn1cblxuLy8gVXNlZCBieSBEZWxldGVTdXJyb3VuZFxuY2xhc3MgQVBhaXIgZXh0ZW5kcyBQYWlyIHtcbiAgc3RhdGljIGNvbW1hbmQgPSBmYWxzZVxufVxuXG5jbGFzcyBBbnlQYWlyIGV4dGVuZHMgUGFpciB7XG4gIGFsbG93Rm9yd2FyZGluZyA9IGZhbHNlXG4gIG1lbWJlciA9IFtcIkRvdWJsZVF1b3RlXCIsIFwiU2luZ2xlUXVvdGVcIiwgXCJCYWNrVGlja1wiLCBcIkN1cmx5QnJhY2tldFwiLCBcIkFuZ2xlQnJhY2tldFwiLCBcIlNxdWFyZUJyYWNrZXRcIiwgXCJQYXJlbnRoZXNpc1wiXVxuXG4gIGdldFJhbmdlcyhzZWxlY3Rpb24pIHtcbiAgICBjb25zdCBvcHRpb25zID0ge2lubmVyOiB0aGlzLmlubmVyLCBhbGxvd0ZvcndhcmRpbmc6IHRoaXMuYWxsb3dGb3J3YXJkaW5nLCBpbmNsdXNpdmU6IHRoaXMuaW5jbHVzaXZlfVxuICAgIHJldHVybiB0aGlzLm1lbWJlci5tYXAobWVtYmVyID0+IHRoaXMuZ2V0SW5zdGFuY2UobWVtYmVyLCBvcHRpb25zKS5nZXRSYW5nZShzZWxlY3Rpb24pKS5maWx0ZXIocmFuZ2UgPT4gcmFuZ2UpXG4gIH1cblxuICBnZXRSYW5nZShzZWxlY3Rpb24pIHtcbiAgICByZXR1cm4gdGhpcy51dGlscy5zb3J0UmFuZ2VzKHRoaXMuZ2V0UmFuZ2VzKHNlbGVjdGlvbikpLnBvcCgpXG4gIH1cbn1cblxuY2xhc3MgQW55UGFpckFsbG93Rm9yd2FyZGluZyBleHRlbmRzIEFueVBhaXIge1xuICBhbGxvd0ZvcndhcmRpbmcgPSB0cnVlXG5cbiAgZ2V0UmFuZ2Uoc2VsZWN0aW9uKSB7XG4gICAgY29uc3QgcmFuZ2VzID0gdGhpcy5nZXRSYW5nZXMoc2VsZWN0aW9uKVxuICAgIGNvbnN0IGZyb20gPSBzZWxlY3Rpb24uY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKClcbiAgICBsZXQgW2ZvcndhcmRpbmdSYW5nZXMsIGVuY2xvc2luZ1Jhbmdlc10gPSB0aGlzLl8ucGFydGl0aW9uKHJhbmdlcywgcmFuZ2UgPT4gcmFuZ2Uuc3RhcnQuaXNHcmVhdGVyVGhhbk9yRXF1YWwoZnJvbSkpXG4gICAgY29uc3QgZW5jbG9zaW5nUmFuZ2UgPSB0aGlzLnV0aWxzLnNvcnRSYW5nZXMoZW5jbG9zaW5nUmFuZ2VzKS5wb3AoKVxuICAgIGZvcndhcmRpbmdSYW5nZXMgPSB0aGlzLnV0aWxzLnNvcnRSYW5nZXMoZm9yd2FyZGluZ1JhbmdlcylcblxuICAgIC8vIFdoZW4gZW5jbG9zaW5nUmFuZ2UgaXMgZXhpc3RzLFxuICAgIC8vIFdlIGRvbid0IGdvIGFjcm9zcyBlbmNsb3NpbmdSYW5nZS5lbmQuXG4gICAgLy8gU28gY2hvb3NlIGZyb20gcmFuZ2VzIGNvbnRhaW5lZCBpbiBlbmNsb3NpbmdSYW5nZS5cbiAgICBpZiAoZW5jbG9zaW5nUmFuZ2UpIHtcbiAgICAgIGZvcndhcmRpbmdSYW5nZXMgPSBmb3J3YXJkaW5nUmFuZ2VzLmZpbHRlcihyYW5nZSA9PiBlbmNsb3NpbmdSYW5nZS5jb250YWluc1JhbmdlKHJhbmdlKSlcbiAgICB9XG5cbiAgICByZXR1cm4gZm9yd2FyZGluZ1Jhbmdlc1swXSB8fCBlbmNsb3NpbmdSYW5nZVxuICB9XG59XG5cbmNsYXNzIEFueVF1b3RlIGV4dGVuZHMgQW55UGFpciB7XG4gIGFsbG93Rm9yd2FyZGluZyA9IHRydWVcbiAgbWVtYmVyID0gW1wiRG91YmxlUXVvdGVcIiwgXCJTaW5nbGVRdW90ZVwiLCBcIkJhY2tUaWNrXCJdXG5cbiAgZ2V0UmFuZ2Uoc2VsZWN0aW9uKSB7XG4gICAgLy8gUGljayByYW5nZSB3aGljaCBlbmQuY29sdW0gaXMgbGVmdG1vc3QobWVhbiwgY2xvc2VkIGZpcnN0KVxuICAgIHJldHVybiB0aGlzLmdldFJhbmdlcyhzZWxlY3Rpb24pLnNvcnQoKGEsIGIpID0+IGEuZW5kLmNvbHVtbiAtIGIuZW5kLmNvbHVtbilbMF1cbiAgfVxufVxuXG5jbGFzcyBRdW90ZSBleHRlbmRzIFBhaXIge1xuICBzdGF0aWMgY29tbWFuZCA9IGZhbHNlXG4gIGFsbG93Rm9yd2FyZGluZyA9IHRydWVcbn1cblxuY2xhc3MgRG91YmxlUXVvdGUgZXh0ZW5kcyBRdW90ZSB7XG4gIHBhaXIgPSBbJ1wiJywgJ1wiJ11cbn1cblxuY2xhc3MgU2luZ2xlUXVvdGUgZXh0ZW5kcyBRdW90ZSB7XG4gIHBhaXIgPSBbXCInXCIsIFwiJ1wiXVxufVxuXG5jbGFzcyBCYWNrVGljayBleHRlbmRzIFF1b3RlIHtcbiAgcGFpciA9IFtcImBcIiwgXCJgXCJdXG59XG5cbmNsYXNzIEN1cmx5QnJhY2tldCBleHRlbmRzIFBhaXIge1xuICBwYWlyID0gW1wie1wiLCBcIn1cIl1cbn1cblxuY2xhc3MgU3F1YXJlQnJhY2tldCBleHRlbmRzIFBhaXIge1xuICBwYWlyID0gW1wiW1wiLCBcIl1cIl1cbn1cblxuY2xhc3MgUGFyZW50aGVzaXMgZXh0ZW5kcyBQYWlyIHtcbiAgcGFpciA9IFtcIihcIiwgXCIpXCJdXG59XG5cbmNsYXNzIEFuZ2xlQnJhY2tldCBleHRlbmRzIFBhaXIge1xuICBwYWlyID0gW1wiPFwiLCBcIj5cIl1cbn1cblxuY2xhc3MgVGFnIGV4dGVuZHMgUGFpciB7XG4gIGFsbG93TmV4dExpbmUgPSB0cnVlXG4gIGFsbG93Rm9yd2FyZGluZyA9IHRydWVcbiAgYWRqdXN0SW5uZXJSYW5nZSA9IGZhbHNlXG5cbiAgZ2V0VGFnU3RhcnRQb2ludChmcm9tKSB7XG4gICAgY29uc3QgcmVnZXggPSBQYWlyRmluZGVyLlRhZ0ZpbmRlci5wYXR0ZXJuXG4gICAgY29uc3Qgb3B0aW9ucyA9IHtmcm9tOiBbZnJvbS5yb3csIDBdfVxuICAgIHJldHVybiB0aGlzLmZpbmRJbkVkaXRvcihcImZvcndhcmRcIiwgcmVnZXgsIG9wdGlvbnMsICh7cmFuZ2V9KSA9PiByYW5nZS5jb250YWluc1BvaW50KGZyb20sIHRydWUpICYmIHJhbmdlLnN0YXJ0KVxuICB9XG5cbiAgZ2V0RmluZGVyKCkge1xuICAgIHJldHVybiBuZXcgUGFpckZpbmRlci5UYWdGaW5kZXIodGhpcy5lZGl0b3IsIHtcbiAgICAgIGFsbG93TmV4dExpbmU6IHRoaXMuaXNBbGxvd05leHRMaW5lKCksXG4gICAgICBhbGxvd0ZvcndhcmRpbmc6IHRoaXMuYWxsb3dGb3J3YXJkaW5nLFxuICAgICAgaW5jbHVzaXZlOiB0aGlzLmluY2x1c2l2ZSxcbiAgICB9KVxuICB9XG5cbiAgZ2V0UGFpckluZm8oZnJvbSkge1xuICAgIHJldHVybiBzdXBlci5nZXRQYWlySW5mbyh0aGlzLmdldFRhZ1N0YXJ0UG9pbnQoZnJvbSkgfHwgZnJvbSlcbiAgfVxufVxuXG4vLyBTZWN0aW9uOiBQYXJhZ3JhcGhcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIFBhcmFncmFwaCBpcyBkZWZpbmVkIGFzIGNvbnNlY3V0aXZlIChub24tKWJsYW5rLWxpbmUuXG5jbGFzcyBQYXJhZ3JhcGggZXh0ZW5kcyBUZXh0T2JqZWN0IHtcbiAgd2lzZSA9IFwibGluZXdpc2VcIlxuICBzdXBwb3J0Q291bnQgPSB0cnVlXG5cbiAgZmluZFJvdyhmcm9tUm93LCBkaXJlY3Rpb24sIGZuKSB7XG4gICAgaWYgKGZuLnJlc2V0KSBmbi5yZXNldCgpXG4gICAgbGV0IGZvdW5kUm93ID0gZnJvbVJvd1xuICAgIGZvciAoY29uc3Qgcm93IG9mIHRoaXMuZ2V0QnVmZmVyUm93cyh7c3RhcnRSb3c6IGZyb21Sb3csIGRpcmVjdGlvbn0pKSB7XG4gICAgICBpZiAoIWZuKHJvdywgZGlyZWN0aW9uKSkgYnJlYWtcbiAgICAgIGZvdW5kUm93ID0gcm93XG4gICAgfVxuICAgIHJldHVybiBmb3VuZFJvd1xuICB9XG5cbiAgZmluZFJvd1JhbmdlQnkoZnJvbVJvdywgZm4pIHtcbiAgICBjb25zdCBzdGFydFJvdyA9IHRoaXMuZmluZFJvdyhmcm9tUm93LCBcInByZXZpb3VzXCIsIGZuKVxuICAgIGNvbnN0IGVuZFJvdyA9IHRoaXMuZmluZFJvdyhmcm9tUm93LCBcIm5leHRcIiwgZm4pXG4gICAgcmV0dXJuIFtzdGFydFJvdywgZW5kUm93XVxuICB9XG5cbiAgZ2V0UHJlZGljdEZ1bmN0aW9uKGZyb21Sb3csIHNlbGVjdGlvbikge1xuICAgIGNvbnN0IGZyb21Sb3dSZXN1bHQgPSB0aGlzLmVkaXRvci5pc0J1ZmZlclJvd0JsYW5rKGZyb21Sb3cpXG5cbiAgICBpZiAodGhpcy5pc0lubmVyKCkpIHtcbiAgICAgIHJldHVybiAocm93LCBkaXJlY3Rpb24pID0+IHRoaXMuZWRpdG9yLmlzQnVmZmVyUm93Qmxhbmsocm93KSA9PT0gZnJvbVJvd1Jlc3VsdFxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBkaXJlY3Rpb25Ub0V4dGVuZCA9IHNlbGVjdGlvbi5pc1JldmVyc2VkKCkgPyBcInByZXZpb3VzXCIgOiBcIm5leHRcIlxuXG4gICAgICBsZXQgZmxpcCA9IGZhbHNlXG4gICAgICBjb25zdCBwcmVkaWN0ID0gKHJvdywgZGlyZWN0aW9uKSA9PiB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IHRoaXMuZWRpdG9yLmlzQnVmZmVyUm93Qmxhbmsocm93KSA9PT0gZnJvbVJvd1Jlc3VsdFxuICAgICAgICBpZiAoZmxpcCkge1xuICAgICAgICAgIHJldHVybiAhcmVzdWx0XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKCFyZXN1bHQgJiYgZGlyZWN0aW9uID09PSBkaXJlY3Rpb25Ub0V4dGVuZCkge1xuICAgICAgICAgICAgcmV0dXJuIChmbGlwID0gdHJ1ZSlcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHJlc3VsdFxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBwcmVkaWN0LnJlc2V0ID0gKCkgPT4gKGZsaXAgPSBmYWxzZSlcbiAgICAgIHJldHVybiBwcmVkaWN0XG4gICAgfVxuICB9XG5cbiAgZ2V0UmFuZ2Uoc2VsZWN0aW9uKSB7XG4gICAgY29uc3Qgb3JpZ2luYWxSYW5nZSA9IHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpXG4gICAgbGV0IGZyb21Sb3cgPSB0aGlzLmdldEN1cnNvclBvc2l0aW9uRm9yU2VsZWN0aW9uKHNlbGVjdGlvbikucm93XG4gICAgaWYgKHRoaXMuaXNNb2RlKFwidmlzdWFsXCIsIFwibGluZXdpc2VcIikpIHtcbiAgICAgIGlmIChzZWxlY3Rpb24uaXNSZXZlcnNlZCgpKSBmcm9tUm93LS1cbiAgICAgIGVsc2UgZnJvbVJvdysrXG4gICAgICBmcm9tUm93ID0gdGhpcy5nZXRWYWxpZFZpbUJ1ZmZlclJvdyhmcm9tUm93KVxuICAgIH1cbiAgICBjb25zdCByb3dSYW5nZSA9IHRoaXMuZmluZFJvd1JhbmdlQnkoZnJvbVJvdywgdGhpcy5nZXRQcmVkaWN0RnVuY3Rpb24oZnJvbVJvdywgc2VsZWN0aW9uKSlcbiAgICByZXR1cm4gc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKCkudW5pb24odGhpcy5nZXRCdWZmZXJSYW5nZUZvclJvd1JhbmdlKHJvd1JhbmdlKSlcbiAgfVxufVxuXG5jbGFzcyBJbmRlbnRhdGlvbiBleHRlbmRzIFBhcmFncmFwaCB7XG4gIGdldFJhbmdlKHNlbGVjdGlvbikge1xuICAgIGNvbnN0IGZyb21Sb3cgPSB0aGlzLmdldEN1cnNvclBvc2l0aW9uRm9yU2VsZWN0aW9uKHNlbGVjdGlvbikucm93XG4gICAgY29uc3QgYmFzZUluZGVudExldmVsID0gdGhpcy5lZGl0b3IuaW5kZW50YXRpb25Gb3JCdWZmZXJSb3coZnJvbVJvdylcbiAgICBjb25zdCByb3dSYW5nZSA9IHRoaXMuZmluZFJvd1JhbmdlQnkoZnJvbVJvdywgcm93ID0+IHtcbiAgICAgIHJldHVybiB0aGlzLmVkaXRvci5pc0J1ZmZlclJvd0JsYW5rKHJvdylcbiAgICAgICAgPyB0aGlzLmlzQSgpXG4gICAgICAgIDogdGhpcy5lZGl0b3IuaW5kZW50YXRpb25Gb3JCdWZmZXJSb3cocm93KSA+PSBiYXNlSW5kZW50TGV2ZWxcbiAgICB9KVxuICAgIHJldHVybiB0aGlzLmdldEJ1ZmZlclJhbmdlRm9yUm93UmFuZ2Uocm93UmFuZ2UpXG4gIH1cbn1cblxuLy8gU2VjdGlvbjogQ29tbWVudFxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PVxuY2xhc3MgQ29tbWVudCBleHRlbmRzIFRleHRPYmplY3Qge1xuICBDb21tZW50XG4gIHdpc2UgPSBcImxpbmV3aXNlXCJcblxuICBnZXRSYW5nZShzZWxlY3Rpb24pIHtcbiAgICBjb25zdCB7cm93fSA9IHRoaXMuZ2V0Q3Vyc29yUG9zaXRpb25Gb3JTZWxlY3Rpb24oc2VsZWN0aW9uKVxuICAgIGNvbnN0IHJvd1JhbmdlID0gdGhpcy51dGlscy5nZXRSb3dSYW5nZUZvckNvbW1lbnRBdEJ1ZmZlclJvdyh0aGlzLmVkaXRvciwgcm93KVxuICAgIGlmIChyb3dSYW5nZSkge1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0QnVmZmVyUmFuZ2VGb3JSb3dSYW5nZShyb3dSYW5nZSlcbiAgICB9XG4gIH1cbn1cblxuY2xhc3MgQ29tbWVudE9yUGFyYWdyYXBoIGV4dGVuZHMgVGV4dE9iamVjdCB7XG4gIHdpc2UgPSBcImxpbmV3aXNlXCJcblxuICBnZXRSYW5nZShzZWxlY3Rpb24pIHtcbiAgICBjb25zdCB7aW5uZXJ9ID0gdGhpc1xuICAgIGZvciAoY29uc3Qga2xhc3Mgb2YgW1wiQ29tbWVudFwiLCBcIlBhcmFncmFwaFwiXSkge1xuICAgICAgY29uc3QgcmFuZ2UgPSB0aGlzLmdldEluc3RhbmNlKGtsYXNzLCB7aW5uZXJ9KS5nZXRSYW5nZShzZWxlY3Rpb24pXG4gICAgICBpZiAocmFuZ2UpIHJldHVybiByYW5nZVxuICAgIH1cbiAgfVxufVxuXG4vLyBTZWN0aW9uOiBGb2xkXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09XG5jbGFzcyBGb2xkIGV4dGVuZHMgVGV4dE9iamVjdCB7XG4gIHdpc2UgPSBcImxpbmV3aXNlXCJcblxuICBnZXRSYW5nZShzZWxlY3Rpb24pIHtcbiAgICBjb25zdCB7cm93fSA9IHRoaXMuZ2V0Q3Vyc29yUG9zaXRpb25Gb3JTZWxlY3Rpb24oc2VsZWN0aW9uKVxuICAgIGNvbnN0IHNlbGVjdGVkUmFuZ2UgPSBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKVxuICAgIGNvbnN0IGZvbGRSYW5nZXMgPSB0aGlzLnV0aWxzLmdldENvZGVGb2xkUmFuZ2VzQ29udGFpbmVzUm93KHRoaXMuZWRpdG9yLCByb3cpLnJldmVyc2UoKVxuICAgIGZvciAoY29uc3QgZm9sZFJhbmdlIG9mIGZvbGRSYW5nZXMpIHtcbiAgICAgIGNvbnN0IHtzdGFydCwgZW5kfSA9IHRoaXMuYWRqdXN0UmFuZ2UoZm9sZFJhbmdlKVxuICAgICAgY29uc3QgcmFuZ2UgPSB0aGlzLmdldEJ1ZmZlclJhbmdlRm9yUm93UmFuZ2UoW3N0YXJ0LnJvdywgZW5kLnJvd10pXG4gICAgICBpZiAoIXNlbGVjdGVkUmFuZ2UuY29udGFpbnNSYW5nZShyYW5nZSkpIHJldHVybiByYW5nZVxuICAgIH1cbiAgfVxuXG4gIGFkanVzdFJhbmdlKHJhbmdlKSB7XG4gICAgaWYgKHRoaXMuaXNBKCkpIHJldHVybiByYW5nZVxuICAgIGlmICh0aGlzLmVkaXRvci5pbmRlbnRhdGlvbkZvckJ1ZmZlclJvdyhyYW5nZS5zdGFydC5yb3cpID09PSB0aGlzLmVkaXRvci5pbmRlbnRhdGlvbkZvckJ1ZmZlclJvdyhyYW5nZS5lbmQucm93KSkge1xuICAgICAgcmFuZ2UuZW5kLnJvdyAtPSAxXG4gICAgfVxuICAgIHJhbmdlLnN0YXJ0LnJvdyArPSAxXG4gICAgcmV0dXJuIHJhbmdlXG4gIH1cbn1cblxuY2xhc3MgRnVuY3Rpb24gZXh0ZW5kcyBUZXh0T2JqZWN0IHtcbiAgd2lzZSA9IFwibGluZXdpc2VcIlxuICBzY29wZU5hbWVzT21pdHRpbmdDbG9zaW5nQnJhY2UgPSBbXCJzb3VyY2UuZ29cIiwgXCJzb3VyY2UuZWxpeGlyXCJdIC8vIGxhbmd1YWdlIGRvZXNuJ3QgaW5jbHVkZSBjbG9zaW5nIGB9YCBpbnRvIGZvbGQuXG5cbiAgZ2V0RnVuY3Rpb25Cb2R5U3RhcnRSZWdleCh7c2NvcGVOYW1lfSkge1xuICAgIGlmIChzY29wZU5hbWUgPT09IFwic291cmNlLnB5dGhvblwiKSB7XG4gICAgICByZXR1cm4gLzokL1xuICAgIH0gZWxzZSBpZiAoc2NvcGVOYW1lID09PSBcInNvdXJjZS5jb2ZmZWVcIikge1xuICAgICAgcmV0dXJuIC8tfD0+JC9cbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIC97JC9cbiAgICB9XG4gIH1cblxuICBpc011bHRpTGluZVBhcmFtZXRlckZ1bmN0aW9uUmFuZ2UocGFyYW1ldGVyUmFuZ2UsIGJvZHlSYW5nZSwgYm9keVN0YXJ0UmVnZXgpIHtcbiAgICBjb25zdCBpc0JvZHlTdGFydFJvdyA9IHJvdyA9PiBib2R5U3RhcnRSZWdleC50ZXN0KHRoaXMuZWRpdG9yLmxpbmVUZXh0Rm9yQnVmZmVyUm93KHJvdykpXG4gICAgaWYgKGlzQm9keVN0YXJ0Um93KHBhcmFtZXRlclJhbmdlLnN0YXJ0LnJvdykpIHJldHVybiBmYWxzZVxuICAgIGlmIChpc0JvZHlTdGFydFJvdyhwYXJhbWV0ZXJSYW5nZS5lbmQucm93KSkgcmV0dXJuIHBhcmFtZXRlclJhbmdlLmVuZC5yb3cgPT09IGJvZHlSYW5nZS5zdGFydC5yb3dcbiAgICBpZiAoaXNCb2R5U3RhcnRSb3cocGFyYW1ldGVyUmFuZ2UuZW5kLnJvdyArIDEpKSByZXR1cm4gcGFyYW1ldGVyUmFuZ2UuZW5kLnJvdyArIDEgPT09IGJvZHlSYW5nZS5zdGFydC5yb3dcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIGdldFJhbmdlKHNlbGVjdGlvbikge1xuICAgIGNvbnN0IGVkaXRvciA9IHRoaXMuZWRpdG9yXG4gICAgY29uc3QgY3Vyc29yUm93ID0gdGhpcy5nZXRDdXJzb3JQb3NpdGlvbkZvclNlbGVjdGlvbihzZWxlY3Rpb24pLnJvd1xuICAgIGNvbnN0IGJvZHlTdGFydFJlZ2V4ID0gdGhpcy5nZXRGdW5jdGlvbkJvZHlTdGFydFJlZ2V4KGVkaXRvci5nZXRHcmFtbWFyKCkpXG4gICAgY29uc3QgaXNJbmNsdWRlRnVuY3Rpb25TY29wZUZvclJvdyA9IHJvdyA9PiB0aGlzLnV0aWxzLmlzSW5jbHVkZUZ1bmN0aW9uU2NvcGVGb3JSb3coZWRpdG9yLCByb3cpXG5cbiAgICBjb25zdCBmdW5jdGlvblJhbmdlcyA9IFtdXG4gICAgY29uc3Qgc2F2ZUZ1bmN0aW9uUmFuZ2UgPSAoe2FSYW5nZSwgaW5uZXJSYW5nZX0pID0+IHtcbiAgICAgIGZ1bmN0aW9uUmFuZ2VzLnB1c2goe1xuICAgICAgICBhUmFuZ2U6IHRoaXMuYnVpbGRBUmFuZ2UoYVJhbmdlKSxcbiAgICAgICAgaW5uZXJSYW5nZTogdGhpcy5idWlsZElubmVyUmFuZ2UoaW5uZXJSYW5nZSksXG4gICAgICB9KVxuICAgIH1cblxuICAgIGNvbnN0IGZvbGRSYW5nZXMgPSB0aGlzLnV0aWxzLmdldENvZGVGb2xkUmFuZ2VzKGVkaXRvcilcbiAgICB3aGlsZSAoZm9sZFJhbmdlcy5sZW5ndGgpIHtcbiAgICAgIGNvbnN0IHJhbmdlID0gZm9sZFJhbmdlcy5zaGlmdCgpXG4gICAgICBpZiAoaXNJbmNsdWRlRnVuY3Rpb25TY29wZUZvclJvdyhyYW5nZS5zdGFydC5yb3cpKSB7XG4gICAgICAgIGNvbnN0IG5leHRSYW5nZSA9IGZvbGRSYW5nZXNbMF1cbiAgICAgICAgY29uc3QgbmV4dEZvbGRJc0Nvbm5lY3RlZCA9IG5leHRSYW5nZSAmJiBuZXh0UmFuZ2Uuc3RhcnQucm93IDw9IHJhbmdlLmVuZC5yb3cgKyAxXG4gICAgICAgIGNvbnN0IG1heWJlQUZ1bmN0aW9uUmFuZ2UgPSBuZXh0Rm9sZElzQ29ubmVjdGVkID8gcmFuZ2UudW5pb24obmV4dFJhbmdlKSA6IHJhbmdlXG4gICAgICAgIGlmICghbWF5YmVBRnVuY3Rpb25SYW5nZS5jb250YWluc1BvaW50KFtjdXJzb3JSb3csIEluZmluaXR5XSkpIGNvbnRpbnVlIC8vIHNraXAgdG8gYXZvaWQgaGVhdnkgY29tcHV0YXRpb25cbiAgICAgICAgaWYgKG5leHRGb2xkSXNDb25uZWN0ZWQgJiYgdGhpcy5pc011bHRpTGluZVBhcmFtZXRlckZ1bmN0aW9uUmFuZ2UocmFuZ2UsIG5leHRSYW5nZSwgYm9keVN0YXJ0UmVnZXgpKSB7XG4gICAgICAgICAgY29uc3QgYm9keVJhbmdlID0gZm9sZFJhbmdlcy5zaGlmdCgpXG4gICAgICAgICAgc2F2ZUZ1bmN0aW9uUmFuZ2Uoe2FSYW5nZTogcmFuZ2UudW5pb24oYm9keVJhbmdlKSwgaW5uZXJSYW5nZTogYm9keVJhbmdlfSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzYXZlRnVuY3Rpb25SYW5nZSh7YVJhbmdlOiByYW5nZSwgaW5uZXJSYW5nZTogcmFuZ2V9KVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBwcmV2aW91c1JvdyA9IHJhbmdlLnN0YXJ0LnJvdyAtIDFcbiAgICAgICAgaWYgKHByZXZpb3VzUm93IDwgMCkgY29udGludWVcbiAgICAgICAgaWYgKGVkaXRvci5pc0ZvbGRhYmxlQXRCdWZmZXJSb3cocHJldmlvdXNSb3cpKSBjb250aW51ZVxuICAgICAgICBjb25zdCBtYXliZUFGdW5jdGlvblJhbmdlID0gcmFuZ2UudW5pb24oZWRpdG9yLmJ1ZmZlclJhbmdlRm9yQnVmZmVyUm93KHByZXZpb3VzUm93KSlcbiAgICAgICAgaWYgKCFtYXliZUFGdW5jdGlvblJhbmdlLmNvbnRhaW5zUG9pbnQoW2N1cnNvclJvdywgSW5maW5pdHldKSkgY29udGludWUgLy8gc2tpcCB0byBhdm9pZCBoZWF2eSBjb21wdXRhdGlvblxuXG4gICAgICAgIGNvbnN0IGlzQm9keVN0YXJ0T25seVJvdyA9IHJvdyA9PlxuICAgICAgICAgIG5ldyBSZWdFeHAoXCJeXFxcXHMqXCIgKyBib2R5U3RhcnRSZWdleC5zb3VyY2UpLnRlc3QoZWRpdG9yLmxpbmVUZXh0Rm9yQnVmZmVyUm93KHJvdykpXG4gICAgICAgIGlmIChpc0JvZHlTdGFydE9ubHlSb3cocmFuZ2Uuc3RhcnQucm93KSAmJiBpc0luY2x1ZGVGdW5jdGlvblNjb3BlRm9yUm93KHByZXZpb3VzUm93KSkge1xuICAgICAgICAgIHNhdmVGdW5jdGlvblJhbmdlKHthUmFuZ2U6IG1heWJlQUZ1bmN0aW9uUmFuZ2UsIGlubmVyUmFuZ2U6IHJhbmdlfSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGZvciAoY29uc3QgZnVuY3Rpb25SYW5nZSBvZiBmdW5jdGlvblJhbmdlcy5yZXZlcnNlKCkpIHtcbiAgICAgIGNvbnN0IHtzdGFydCwgZW5kfSA9IHRoaXMuaXNBKCkgPyBmdW5jdGlvblJhbmdlLmFSYW5nZSA6IGZ1bmN0aW9uUmFuZ2UuaW5uZXJSYW5nZVxuICAgICAgY29uc3QgcmFuZ2UgPSB0aGlzLmdldEJ1ZmZlclJhbmdlRm9yUm93UmFuZ2UoW3N0YXJ0LnJvdywgZW5kLnJvd10pXG4gICAgICBpZiAoIXNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpLmNvbnRhaW5zUmFuZ2UocmFuZ2UpKSByZXR1cm4gcmFuZ2VcbiAgICB9XG4gIH1cblxuICBidWlsZElubmVyUmFuZ2UocmFuZ2UpIHtcbiAgICBjb25zdCBpbmRlbnRGb3JSb3cgPSByb3cgPT4gdGhpcy5lZGl0b3IuaW5kZW50YXRpb25Gb3JCdWZmZXJSb3cocm93KVxuICAgIGNvbnN0IGVuZFJvd1RyYW5zbGF0aW9uID0gaW5kZW50Rm9yUm93KHJhbmdlLnN0YXJ0LnJvdykgPT09IGluZGVudEZvclJvdyhyYW5nZS5lbmQucm93KSA/IC0xIDogMFxuICAgIHJldHVybiByYW5nZS50cmFuc2xhdGUoWzEsIDBdLCBbZW5kUm93VHJhbnNsYXRpb24sIDBdKVxuICB9XG5cbiAgYnVpbGRBUmFuZ2UocmFuZ2UpIHtcbiAgICAvLyBOT1RFOiBUaGlzIGFkanVzdG1lbnQgc2hvdWQgbm90IGJlIG5lY2Vzc2FyeSBpZiBsYW5ndWFnZS1zeW50YXggaXMgcHJvcGVybHkgZGVmaW5lZC5cbiAgICBjb25zdCBlbmRSb3dUcmFuc2xhdGlvbiA9IHRoaXMuaXNHcmFtbWFyRG9lc05vdEZvbGRDbG9zaW5nUm93KCkgPyArMSA6IDBcbiAgICByZXR1cm4gcmFuZ2UudHJhbnNsYXRlKFswLCAwXSwgW2VuZFJvd1RyYW5zbGF0aW9uLCAwXSlcbiAgfVxuXG4gIGlzR3JhbW1hckRvZXNOb3RGb2xkQ2xvc2luZ1JvdygpIHtcbiAgICBjb25zdCB7c2NvcGVOYW1lLCBwYWNrYWdlTmFtZX0gPSB0aGlzLmVkaXRvci5nZXRHcmFtbWFyKClcbiAgICBpZiAodGhpcy5zY29wZU5hbWVzT21pdHRpbmdDbG9zaW5nQnJhY2UuaW5jbHVkZXMoc2NvcGVOYW1lKSkge1xuICAgICAgcmV0dXJuIHRydWVcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gSEFDSzogUnVzdCBoYXZlIHR3byBwYWNrYWdlIGBsYW5ndWFnZS1ydXN0YCBhbmQgYGF0b20tbGFuZ3VhZ2UtcnVzdGBcbiAgICAgIC8vIGxhbmd1YWdlLXJ1c3QgZG9uJ3QgZm9sZCBlbmRpbmcgYH1gLCBidXQgYXRvbS1sYW5ndWFnZS1ydXN0IGRvZXMuXG4gICAgICByZXR1cm4gc2NvcGVOYW1lID09PSBcInNvdXJjZS5ydXN0XCIgJiYgcGFja2FnZU5hbWUgPT09IFwibGFuZ3VhZ2UtcnVzdFwiXG4gICAgfVxuICB9XG59XG5cbi8vIFNlY3Rpb246IE90aGVyXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09XG5jbGFzcyBBcmd1bWVudHMgZXh0ZW5kcyBUZXh0T2JqZWN0IHtcbiAgbmV3QXJnSW5mbyhhcmdTdGFydCwgYXJnLCBzZXBhcmF0b3IpIHtcbiAgICBjb25zdCBhcmdFbmQgPSB0aGlzLnV0aWxzLnRyYXZlcnNlVGV4dEZyb21Qb2ludChhcmdTdGFydCwgYXJnKVxuICAgIGNvbnN0IGFyZ1JhbmdlID0gbmV3IFJhbmdlKGFyZ1N0YXJ0LCBhcmdFbmQpXG5cbiAgICBjb25zdCBzZXBhcmF0b3JFbmQgPSB0aGlzLnV0aWxzLnRyYXZlcnNlVGV4dEZyb21Qb2ludChhcmdFbmQsIHNlcGFyYXRvciAhPSBudWxsID8gc2VwYXJhdG9yIDogXCJcIilcbiAgICBjb25zdCBzZXBhcmF0b3JSYW5nZSA9IG5ldyBSYW5nZShhcmdFbmQsIHNlcGFyYXRvckVuZClcblxuICAgIGNvbnN0IGlubmVyUmFuZ2UgPSBhcmdSYW5nZVxuICAgIGNvbnN0IGFSYW5nZSA9IGFyZ1JhbmdlLnVuaW9uKHNlcGFyYXRvclJhbmdlKVxuICAgIHJldHVybiB7YXJnUmFuZ2UsIHNlcGFyYXRvclJhbmdlLCBpbm5lclJhbmdlLCBhUmFuZ2V9XG4gIH1cblxuICBnZXRBcmd1bWVudHNSYW5nZUZvclNlbGVjdGlvbihzZWxlY3Rpb24pIHtcbiAgICBjb25zdCBvcHRpb25zID0ge1xuICAgICAgbWVtYmVyOiBbXCJDdXJseUJyYWNrZXRcIiwgXCJTcXVhcmVCcmFja2V0XCIsIFwiUGFyZW50aGVzaXNcIl0sXG4gICAgICBpbmNsdXNpdmU6IGZhbHNlLFxuICAgIH1cbiAgICByZXR1cm4gdGhpcy5nZXRJbnN0YW5jZShcIklubmVyQW55UGFpclwiLCBvcHRpb25zKS5nZXRSYW5nZShzZWxlY3Rpb24pXG4gIH1cblxuICBnZXRSYW5nZShzZWxlY3Rpb24pIHtcbiAgICBjb25zdCB7c3BsaXRBcmd1bWVudHMsIHRyYXZlcnNlVGV4dEZyb21Qb2ludCwgZ2V0TGFzdH0gPSB0aGlzLnV0aWxzXG4gICAgbGV0IHJhbmdlID0gdGhpcy5nZXRBcmd1bWVudHNSYW5nZUZvclNlbGVjdGlvbihzZWxlY3Rpb24pXG4gICAgY29uc3QgcGFpclJhbmdlRm91bmQgPSByYW5nZSAhPSBudWxsXG5cbiAgICByYW5nZSA9IHJhbmdlIHx8IHRoaXMuZ2V0SW5zdGFuY2UoXCJJbm5lckN1cnJlbnRMaW5lXCIpLmdldFJhbmdlKHNlbGVjdGlvbikgLy8gZmFsbGJhY2tcbiAgICBpZiAoIXJhbmdlKSByZXR1cm5cblxuICAgIHJhbmdlID0gdGhpcy50cmltQnVmZmVyUmFuZ2UocmFuZ2UpXG5cbiAgICBjb25zdCB0ZXh0ID0gdGhpcy5lZGl0b3IuZ2V0VGV4dEluQnVmZmVyUmFuZ2UocmFuZ2UpXG4gICAgY29uc3QgYWxsVG9rZW5zID0gc3BsaXRBcmd1bWVudHModGV4dCwgcGFpclJhbmdlRm91bmQpXG5cbiAgICBjb25zdCBhcmdJbmZvcyA9IFtdXG4gICAgbGV0IGFyZ1N0YXJ0ID0gcmFuZ2Uuc3RhcnRcblxuICAgIC8vIFNraXAgc3RhcnRpbmcgc2VwYXJhdG9yXG4gICAgaWYgKGFsbFRva2Vucy5sZW5ndGggJiYgYWxsVG9rZW5zWzBdLnR5cGUgPT09IFwic2VwYXJhdG9yXCIpIHtcbiAgICAgIGNvbnN0IHRva2VuID0gYWxsVG9rZW5zLnNoaWZ0KClcbiAgICAgIGFyZ1N0YXJ0ID0gdHJhdmVyc2VUZXh0RnJvbVBvaW50KGFyZ1N0YXJ0LCB0b2tlbi50ZXh0KVxuICAgIH1cblxuICAgIHdoaWxlIChhbGxUb2tlbnMubGVuZ3RoKSB7XG4gICAgICBjb25zdCB0b2tlbiA9IGFsbFRva2Vucy5zaGlmdCgpXG4gICAgICBpZiAodG9rZW4udHlwZSA9PT0gXCJhcmd1bWVudFwiKSB7XG4gICAgICAgIGNvbnN0IG5leHRUb2tlbiA9IGFsbFRva2Vucy5zaGlmdCgpXG4gICAgICAgIGNvbnN0IHNlcGFyYXRvciA9IG5leHRUb2tlbiA/IG5leHRUb2tlbi50ZXh0IDogdW5kZWZpbmVkXG4gICAgICAgIGNvbnN0IGFyZ0luZm8gPSB0aGlzLm5ld0FyZ0luZm8oYXJnU3RhcnQsIHRva2VuLnRleHQsIHNlcGFyYXRvcilcblxuICAgICAgICBpZiAoYWxsVG9rZW5zLmxlbmd0aCA9PT0gMCAmJiBhcmdJbmZvcy5sZW5ndGgpIHtcbiAgICAgICAgICBhcmdJbmZvLmFSYW5nZSA9IGFyZ0luZm8uYXJnUmFuZ2UudW5pb24oZ2V0TGFzdChhcmdJbmZvcykuc2VwYXJhdG9yUmFuZ2UpXG4gICAgICAgIH1cblxuICAgICAgICBhcmdTdGFydCA9IGFyZ0luZm8uYVJhbmdlLmVuZFxuICAgICAgICBhcmdJbmZvcy5wdXNoKGFyZ0luZm8pXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJtdXN0IG5vdCBoYXBwZW5cIilcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBwb2ludCA9IHRoaXMuZ2V0Q3Vyc29yUG9zaXRpb25Gb3JTZWxlY3Rpb24oc2VsZWN0aW9uKVxuICAgIGZvciAoY29uc3Qge2lubmVyUmFuZ2UsIGFSYW5nZX0gb2YgYXJnSW5mb3MpIHtcbiAgICAgIGlmIChpbm5lclJhbmdlLmVuZC5pc0dyZWF0ZXJUaGFuT3JFcXVhbChwb2ludCkpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaXNJbm5lcigpID8gaW5uZXJSYW5nZSA6IGFSYW5nZVxuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5jbGFzcyBDdXJyZW50TGluZSBleHRlbmRzIFRleHRPYmplY3Qge1xuICBnZXRSYW5nZShzZWxlY3Rpb24pIHtcbiAgICBjb25zdCB7cm93fSA9IHRoaXMuZ2V0Q3Vyc29yUG9zaXRpb25Gb3JTZWxlY3Rpb24oc2VsZWN0aW9uKVxuICAgIGNvbnN0IHJhbmdlID0gdGhpcy5lZGl0b3IuYnVmZmVyUmFuZ2VGb3JCdWZmZXJSb3cocm93KVxuICAgIHJldHVybiB0aGlzLmlzQSgpID8gcmFuZ2UgOiB0aGlzLnRyaW1CdWZmZXJSYW5nZShyYW5nZSlcbiAgfVxufVxuXG5jbGFzcyBFbnRpcmUgZXh0ZW5kcyBUZXh0T2JqZWN0IHtcbiAgd2lzZSA9IFwibGluZXdpc2VcIlxuICBzZWxlY3RPbmNlID0gdHJ1ZVxuXG4gIGdldFJhbmdlKHNlbGVjdGlvbikge1xuICAgIHJldHVybiB0aGlzLmVkaXRvci5idWZmZXIuZ2V0UmFuZ2UoKVxuICB9XG59XG5cbmNsYXNzIEVtcHR5IGV4dGVuZHMgVGV4dE9iamVjdCB7XG4gIHN0YXRpYyBjb21tYW5kID0gZmFsc2VcbiAgc2VsZWN0T25jZSA9IHRydWVcbn1cblxuY2xhc3MgTGF0ZXN0Q2hhbmdlIGV4dGVuZHMgVGV4dE9iamVjdCB7XG4gIHdpc2UgPSBudWxsXG4gIHNlbGVjdE9uY2UgPSB0cnVlXG4gIGdldFJhbmdlKHNlbGVjdGlvbikge1xuICAgIGNvbnN0IHN0YXJ0ID0gdGhpcy52aW1TdGF0ZS5tYXJrLmdldChcIltcIilcbiAgICBjb25zdCBlbmQgPSB0aGlzLnZpbVN0YXRlLm1hcmsuZ2V0KFwiXVwiKVxuICAgIGlmIChzdGFydCAmJiBlbmQpIHtcbiAgICAgIHJldHVybiBuZXcgUmFuZ2Uoc3RhcnQsIGVuZClcbiAgICB9XG4gIH1cbn1cblxuY2xhc3MgU2VhcmNoTWF0Y2hGb3J3YXJkIGV4dGVuZHMgVGV4dE9iamVjdCB7XG4gIGJhY2t3YXJkID0gZmFsc2VcblxuICBmaW5kTWF0Y2goZnJvbSwgcmVnZXgpIHtcbiAgICBpZiAodGhpcy5iYWNrd2FyZCkge1xuICAgICAgaWYgKHRoaXMubW9kZSA9PT0gXCJ2aXN1YWxcIikge1xuICAgICAgICBmcm9tID0gdGhpcy51dGlscy50cmFuc2xhdGVQb2ludEFuZENsaXAodGhpcy5lZGl0b3IsIGZyb20sIFwiYmFja3dhcmRcIilcbiAgICAgIH1cblxuICAgICAgY29uc3Qgb3B0aW9ucyA9IHtmcm9tOiBbZnJvbS5yb3csIEluZmluaXR5XX1cbiAgICAgIHJldHVybiB7XG4gICAgICAgIHJhbmdlOiB0aGlzLmZpbmRJbkVkaXRvcihcImJhY2t3YXJkXCIsIHJlZ2V4LCBvcHRpb25zLCAoe3JhbmdlfSkgPT4gcmFuZ2Uuc3RhcnQuaXNMZXNzVGhhbihmcm9tKSAmJiByYW5nZSksXG4gICAgICAgIHdoaWNoSXNIZWFkOiBcInN0YXJ0XCIsXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICh0aGlzLm1vZGUgPT09IFwidmlzdWFsXCIpIHtcbiAgICAgICAgZnJvbSA9IHRoaXMudXRpbHMudHJhbnNsYXRlUG9pbnRBbmRDbGlwKHRoaXMuZWRpdG9yLCBmcm9tLCBcImZvcndhcmRcIilcbiAgICAgIH1cblxuICAgICAgY29uc3Qgb3B0aW9ucyA9IHtmcm9tOiBbZnJvbS5yb3csIDBdfVxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgcmFuZ2U6IHRoaXMuZmluZEluRWRpdG9yKFwiZm9yd2FyZFwiLCByZWdleCwgb3B0aW9ucywgKHtyYW5nZX0pID0+IHJhbmdlLmVuZC5pc0dyZWF0ZXJUaGFuKGZyb20pICYmIHJhbmdlKSxcbiAgICAgICAgd2hpY2hJc0hlYWQ6IFwiZW5kXCIsXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZ2V0UmFuZ2Uoc2VsZWN0aW9uKSB7XG4gICAgY29uc3QgcGF0dGVybiA9IHRoaXMuZ2xvYmFsU3RhdGUuZ2V0KFwibGFzdFNlYXJjaFBhdHRlcm5cIilcbiAgICBpZiAoIXBhdHRlcm4pIHJldHVyblxuXG4gICAgY29uc3QgZnJvbVBvaW50ID0gc2VsZWN0aW9uLmdldEhlYWRCdWZmZXJQb3NpdGlvbigpXG4gICAgY29uc3Qge3JhbmdlLCB3aGljaElzSGVhZH0gPSB0aGlzLmZpbmRNYXRjaChmcm9tUG9pbnQsIHBhdHRlcm4pXG4gICAgaWYgKHJhbmdlKSB7XG4gICAgICByZXR1cm4gdGhpcy51bmlvblJhbmdlQW5kRGV0ZXJtaW5lUmV2ZXJzZWRTdGF0ZShzZWxlY3Rpb24sIHJhbmdlLCB3aGljaElzSGVhZClcbiAgICB9XG4gIH1cblxuICB1bmlvblJhbmdlQW5kRGV0ZXJtaW5lUmV2ZXJzZWRTdGF0ZShzZWxlY3Rpb24sIHJhbmdlLCB3aGljaElzSGVhZCkge1xuICAgIGlmIChzZWxlY3Rpb24uaXNFbXB0eSgpKSByZXR1cm4gcmFuZ2VcblxuICAgIGxldCBoZWFkID0gcmFuZ2Vbd2hpY2hJc0hlYWRdXG4gICAgY29uc3QgdGFpbCA9IHNlbGVjdGlvbi5nZXRUYWlsQnVmZmVyUG9zaXRpb24oKVxuXG4gICAgaWYgKHRoaXMuYmFja3dhcmQpIHtcbiAgICAgIGlmICh0YWlsLmlzTGVzc1RoYW4oaGVhZCkpIGhlYWQgPSB0aGlzLnV0aWxzLnRyYW5zbGF0ZVBvaW50QW5kQ2xpcCh0aGlzLmVkaXRvciwgaGVhZCwgXCJmb3J3YXJkXCIpXG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChoZWFkLmlzTGVzc1RoYW4odGFpbCkpIGhlYWQgPSB0aGlzLnV0aWxzLnRyYW5zbGF0ZVBvaW50QW5kQ2xpcCh0aGlzLmVkaXRvciwgaGVhZCwgXCJiYWNrd2FyZFwiKVxuICAgIH1cblxuICAgIHRoaXMucmV2ZXJzZWQgPSBoZWFkLmlzTGVzc1RoYW4odGFpbClcbiAgICByZXR1cm4gbmV3IFJhbmdlKHRhaWwsIGhlYWQpLnVuaW9uKHRoaXMuc3dyYXAoc2VsZWN0aW9uKS5nZXRUYWlsQnVmZmVyUmFuZ2UoKSlcbiAgfVxuXG4gIHNlbGVjdFRleHRPYmplY3Qoc2VsZWN0aW9uKSB7XG4gICAgY29uc3QgcmFuZ2UgPSB0aGlzLmdldFJhbmdlKHNlbGVjdGlvbilcbiAgICBpZiAocmFuZ2UpIHtcbiAgICAgIHRoaXMuc3dyYXAoc2VsZWN0aW9uKS5zZXRCdWZmZXJSYW5nZShyYW5nZSwge3JldmVyc2VkOiB0aGlzLnJldmVyc2VkICE9IG51bGwgPyB0aGlzLnJldmVyc2VkIDogdGhpcy5iYWNrd2FyZH0pXG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH1cbiAgfVxufVxuXG5jbGFzcyBTZWFyY2hNYXRjaEJhY2t3YXJkIGV4dGVuZHMgU2VhcmNoTWF0Y2hGb3J3YXJkIHtcbiAgYmFja3dhcmQgPSB0cnVlXG59XG5cbi8vIFtMaW1pdGF0aW9uOiB3b24ndCBmaXhdOiBTZWxlY3RlZCByYW5nZSBpcyBub3Qgc3VibW9kZSBhd2FyZS4gYWx3YXlzIGNoYXJhY3Rlcndpc2UuXG4vLyBTbyBldmVuIGlmIG9yaWdpbmFsIHNlbGVjdGlvbiB3YXMgdkwgb3IgdkIsIHNlbGVjdGVkIHJhbmdlIGJ5IHRoaXMgdGV4dC1vYmplY3Rcbi8vIGlzIGFsd2F5cyB2QyByYW5nZS5cbmNsYXNzIFByZXZpb3VzU2VsZWN0aW9uIGV4dGVuZHMgVGV4dE9iamVjdCB7XG4gIHdpc2UgPSBudWxsXG4gIHNlbGVjdE9uY2UgPSB0cnVlXG5cbiAgc2VsZWN0VGV4dE9iamVjdChzZWxlY3Rpb24pIHtcbiAgICBjb25zdCB7cHJvcGVydGllcywgc3VibW9kZX0gPSB0aGlzLnZpbVN0YXRlLnByZXZpb3VzU2VsZWN0aW9uXG4gICAgaWYgKHByb3BlcnRpZXMgJiYgc3VibW9kZSkge1xuICAgICAgdGhpcy53aXNlID0gc3VibW9kZVxuICAgICAgdGhpcy5zd3JhcCh0aGlzLmVkaXRvci5nZXRMYXN0U2VsZWN0aW9uKCkpLnNlbGVjdEJ5UHJvcGVydGllcyhwcm9wZXJ0aWVzKVxuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG4gIH1cbn1cblxuY2xhc3MgUGVyc2lzdGVudFNlbGVjdGlvbiBleHRlbmRzIFRleHRPYmplY3Qge1xuICB3aXNlID0gbnVsbFxuICBzZWxlY3RPbmNlID0gdHJ1ZVxuXG4gIHNlbGVjdFRleHRPYmplY3Qoc2VsZWN0aW9uKSB7XG4gICAgaWYgKHRoaXMudmltU3RhdGUuaGFzUGVyc2lzdGVudFNlbGVjdGlvbnMoKSkge1xuICAgICAgdGhpcy5wZXJzaXN0ZW50U2VsZWN0aW9uLnNldFNlbGVjdGVkQnVmZmVyUmFuZ2VzKClcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfVxuICB9XG59XG5cbi8vIFVzZWQgb25seSBieSBSZXBsYWNlV2l0aFJlZ2lzdGVyIGFuZCBQdXRCZWZvcmUgYW5kIGl0cycgY2hpbGRyZW4uXG5jbGFzcyBMYXN0UGFzdGVkUmFuZ2UgZXh0ZW5kcyBUZXh0T2JqZWN0IHtcbiAgc3RhdGljIGNvbW1hbmQgPSBmYWxzZVxuICB3aXNlID0gbnVsbFxuICBzZWxlY3RPbmNlID0gdHJ1ZVxuXG4gIHNlbGVjdFRleHRPYmplY3Qoc2VsZWN0aW9uKSB7XG4gICAgZm9yIChzZWxlY3Rpb24gb2YgdGhpcy5lZGl0b3IuZ2V0U2VsZWN0aW9ucygpKSB7XG4gICAgICBjb25zdCByYW5nZSA9IHRoaXMudmltU3RhdGUuc2VxdWVudGlhbFBhc3RlTWFuYWdlci5nZXRQYXN0ZWRSYW5nZUZvclNlbGVjdGlvbihzZWxlY3Rpb24pXG4gICAgICBzZWxlY3Rpb24uc2V0QnVmZmVyUmFuZ2UocmFuZ2UpXG4gICAgfVxuICAgIHJldHVybiB0cnVlXG4gIH1cbn1cblxuY2xhc3MgVmlzaWJsZUFyZWEgZXh0ZW5kcyBUZXh0T2JqZWN0IHtcbiAgc2VsZWN0T25jZSA9IHRydWVcblxuICBnZXRSYW5nZShzZWxlY3Rpb24pIHtcbiAgICBjb25zdCBbc3RhcnRSb3csIGVuZFJvd10gPSB0aGlzLmVkaXRvci5nZXRWaXNpYmxlUm93UmFuZ2UoKVxuICAgIHJldHVybiB0aGlzLmVkaXRvci5idWZmZXJSYW5nZUZvclNjcmVlblJhbmdlKFtbc3RhcnRSb3csIDBdLCBbZW5kUm93LCBJbmZpbml0eV1dKVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gT2JqZWN0LmFzc2lnbihcbiAge1xuICAgIFRleHRPYmplY3QsXG4gICAgV29yZCxcbiAgICBXaG9sZVdvcmQsXG4gICAgU21hcnRXb3JkLFxuICAgIFN1YndvcmQsXG4gICAgUGFpcixcbiAgICBBUGFpcixcbiAgICBBbnlQYWlyLFxuICAgIEFueVBhaXJBbGxvd0ZvcndhcmRpbmcsXG4gICAgQW55UXVvdGUsXG4gICAgUXVvdGUsXG4gICAgRG91YmxlUXVvdGUsXG4gICAgU2luZ2xlUXVvdGUsXG4gICAgQmFja1RpY2ssXG4gICAgQ3VybHlCcmFja2V0LFxuICAgIFNxdWFyZUJyYWNrZXQsXG4gICAgUGFyZW50aGVzaXMsXG4gICAgQW5nbGVCcmFja2V0LFxuICAgIFRhZyxcbiAgICBQYXJhZ3JhcGgsXG4gICAgSW5kZW50YXRpb24sXG4gICAgQ29tbWVudCxcbiAgICBDb21tZW50T3JQYXJhZ3JhcGgsXG4gICAgRm9sZCxcbiAgICBGdW5jdGlvbixcbiAgICBBcmd1bWVudHMsXG4gICAgQ3VycmVudExpbmUsXG4gICAgRW50aXJlLFxuICAgIEVtcHR5LFxuICAgIExhdGVzdENoYW5nZSxcbiAgICBTZWFyY2hNYXRjaEZvcndhcmQsXG4gICAgU2VhcmNoTWF0Y2hCYWNrd2FyZCxcbiAgICBQcmV2aW91c1NlbGVjdGlvbixcbiAgICBQZXJzaXN0ZW50U2VsZWN0aW9uLFxuICAgIExhc3RQYXN0ZWRSYW5nZSxcbiAgICBWaXNpYmxlQXJlYSxcbiAgfSxcbiAgV29yZC5kZXJpdmVDbGFzcyh0cnVlKSxcbiAgV2hvbGVXb3JkLmRlcml2ZUNsYXNzKHRydWUpLFxuICBTbWFydFdvcmQuZGVyaXZlQ2xhc3ModHJ1ZSksXG4gIFN1YndvcmQuZGVyaXZlQ2xhc3ModHJ1ZSksXG4gIEFueVBhaXIuZGVyaXZlQ2xhc3ModHJ1ZSksXG4gIEFueVBhaXJBbGxvd0ZvcndhcmRpbmcuZGVyaXZlQ2xhc3ModHJ1ZSksXG4gIEFueVF1b3RlLmRlcml2ZUNsYXNzKHRydWUpLFxuICBEb3VibGVRdW90ZS5kZXJpdmVDbGFzcyh0cnVlKSxcbiAgU2luZ2xlUXVvdGUuZGVyaXZlQ2xhc3ModHJ1ZSksXG4gIEJhY2tUaWNrLmRlcml2ZUNsYXNzKHRydWUpLFxuICBDdXJseUJyYWNrZXQuZGVyaXZlQ2xhc3ModHJ1ZSwgdHJ1ZSksXG4gIFNxdWFyZUJyYWNrZXQuZGVyaXZlQ2xhc3ModHJ1ZSwgdHJ1ZSksXG4gIFBhcmVudGhlc2lzLmRlcml2ZUNsYXNzKHRydWUsIHRydWUpLFxuICBBbmdsZUJyYWNrZXQuZGVyaXZlQ2xhc3ModHJ1ZSwgdHJ1ZSksXG4gIFRhZy5kZXJpdmVDbGFzcyh0cnVlKSxcbiAgUGFyYWdyYXBoLmRlcml2ZUNsYXNzKHRydWUpLFxuICBJbmRlbnRhdGlvbi5kZXJpdmVDbGFzcyh0cnVlKSxcbiAgQ29tbWVudC5kZXJpdmVDbGFzcyh0cnVlKSxcbiAgQ29tbWVudE9yUGFyYWdyYXBoLmRlcml2ZUNsYXNzKHRydWUpLFxuICBGb2xkLmRlcml2ZUNsYXNzKHRydWUpLFxuICBGdW5jdGlvbi5kZXJpdmVDbGFzcyh0cnVlKSxcbiAgQXJndW1lbnRzLmRlcml2ZUNsYXNzKHRydWUpLFxuICBDdXJyZW50TGluZS5kZXJpdmVDbGFzcyh0cnVlKSxcbiAgRW50aXJlLmRlcml2ZUNsYXNzKHRydWUpLFxuICBMYXRlc3RDaGFuZ2UuZGVyaXZlQ2xhc3ModHJ1ZSksXG4gIFBlcnNpc3RlbnRTZWxlY3Rpb24uZGVyaXZlQ2xhc3ModHJ1ZSksXG4gIFZpc2libGVBcmVhLmRlcml2ZUNsYXNzKHRydWUpXG4pXG4iXX0=