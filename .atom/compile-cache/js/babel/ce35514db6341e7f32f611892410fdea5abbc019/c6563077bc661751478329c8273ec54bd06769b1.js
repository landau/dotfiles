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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL3RleHQtb2JqZWN0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFdBQVcsQ0FBQTs7Ozs7Ozs7Ozs7O2VBRVksT0FBTyxDQUFDLE1BQU0sQ0FBQzs7SUFBL0IsS0FBSyxZQUFMLEtBQUs7SUFBRSxLQUFLLFlBQUwsS0FBSzs7Ozs7QUFLbkIsSUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFBO0FBQzlCLElBQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQTs7SUFFckMsVUFBVTtZQUFWLFVBQVU7O1dBQVYsVUFBVTswQkFBVixVQUFVOzsrQkFBVixVQUFVOztTQUlkLFFBQVEsR0FBRyxJQUFJO1NBQ2YsSUFBSSxHQUFHLGVBQWU7U0FDdEIsWUFBWSxHQUFHLEtBQUs7U0FDcEIsVUFBVSxHQUFHLEtBQUs7U0FDbEIsZUFBZSxHQUFHLEtBQUs7Ozs7OztlQVJuQixVQUFVOztXQTRDUCxtQkFBRztBQUNSLGFBQU8sSUFBSSxDQUFDLEtBQUssQ0FBQTtLQUNsQjs7O1dBRUUsZUFBRztBQUNKLGFBQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFBO0tBQ25COzs7V0FFUyxzQkFBRztBQUNYLGFBQU8sSUFBSSxDQUFDLElBQUksS0FBSyxVQUFVLENBQUE7S0FDaEM7OztXQUVVLHVCQUFHO0FBQ1osYUFBTyxJQUFJLENBQUMsSUFBSSxLQUFLLFdBQVcsQ0FBQTtLQUNqQzs7O1dBRVEsbUJBQUMsSUFBSSxFQUFFO0FBQ2QsYUFBUSxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztLQUMxQjs7O1dBRVMsc0JBQUc7QUFDWCxVQUFJLENBQUMsZUFBZSxHQUFHLEtBQUssQ0FBQTtLQUM3Qjs7Ozs7OztXQUtNLG1CQUFHOztBQUVSLFVBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLE1BQU0sSUFBSSxLQUFLLENB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LENBQUMsSUFBSSxDQUFDLEVBQ3hCLFlBQVksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEVBQzlCLG1CQUFtQixDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsRUFDckMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FDOUIsQ0FBQSIsImZpbGUiOiIvVXNlcnMvdGxhbmRhdS9kb3RmaWxlcy8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi90ZXh0LW9iamVjdC5qcyIsInNvdXJjZXNDb250ZW50IjpbIlwidXNlIGJhYmVsXCJcblxuY29uc3Qge1JhbmdlLCBQb2ludH0gPSByZXF1aXJlKFwiYXRvbVwiKVxuXG4vLyBbVE9ET10gTmVlZCBvdmVyaGF1bFxuLy8gIC0gWyBdIE1ha2UgZXhwYW5kYWJsZSBieSBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKS51bmlvbih0aGlzLmdldFJhbmdlKHNlbGVjdGlvbikpXG4vLyAgLSBbIF0gQ291bnQgc3VwcG9ydChwcmlvcml0eSBsb3cpP1xuY29uc3QgQmFzZSA9IHJlcXVpcmUoXCIuL2Jhc2VcIilcbmNvbnN0IFBhaXJGaW5kZXIgPSByZXF1aXJlKFwiLi9wYWlyLWZpbmRlclwiKVxuXG5jbGFzcyBUZXh0T2JqZWN0IGV4dGVuZHMgQmFzZSB7XG4gIHN0YXRpYyBvcGVyYXRpb25LaW5kID0gXCJ0ZXh0LW9iamVjdFwiXG4gIHN0YXRpYyBjb21tYW5kID0gZmFsc2VcblxuICBvcGVyYXRvciA9IG51bGxcbiAgd2lzZSA9IFwiY2hhcmFjdGVyd2lzZVwiXG4gIHN1cHBvcnRDb3VudCA9IGZhbHNlIC8vIEZJWE1FICM0NzIsICM2NlxuICBzZWxlY3RPbmNlID0gZmFsc2VcbiAgc2VsZWN0U3VjY2VlZGVkID0gZmFsc2VcblxuICBzdGF0aWMgZGVyaXZlQ2xhc3MoaW5uZXJBbmRBLCBpbm5lckFuZEFGb3JBbGxvd0ZvcndhcmRpbmcpIHtcbiAgICB0aGlzLmNvbW1hbmQgPSBmYWxzZVxuICAgIGNvbnN0IHN0b3JlID0ge31cbiAgICBjb25zdCBnZW5lcmF0ZUNsYXNzID0gKC4uLmFyZ3MpID0+IHtcbiAgICAgIGNvbnN0IGtsYXNzID0gdGhpcy5nZW5lcmF0ZUNsYXNzKC4uLmFyZ3MpXG4gICAgICBzdG9yZVtrbGFzcy5uYW1lXSA9IGtsYXNzXG4gICAgfVxuXG4gICAgaWYgKGlubmVyQW5kQSkge1xuICAgICAgZ2VuZXJhdGVDbGFzcyhmYWxzZSlcbiAgICAgIGdlbmVyYXRlQ2xhc3ModHJ1ZSlcbiAgICB9XG4gICAgaWYgKGlubmVyQW5kQUZvckFsbG93Rm9yd2FyZGluZykge1xuICAgICAgZ2VuZXJhdGVDbGFzcyhmYWxzZSwgdHJ1ZSlcbiAgICAgIGdlbmVyYXRlQ2xhc3ModHJ1ZSwgdHJ1ZSlcbiAgICB9XG4gICAgcmV0dXJuIHN0b3JlXG4gIH1cblxuICBzdGF0aWMgZ2VuZXJhdGVDbGFzcyhpbm5lciwgYWxsb3dGb3J3YXJkaW5nKSB7XG4gICAgY29uc3Qga2xhc3NOYW1lID0gKGlubmVyID8gXCJJbm5lclwiIDogXCJBXCIpICsgdGhpcy5uYW1lICsgKGFsbG93Rm9yd2FyZGluZyA/IFwiQWxsb3dGb3J3YXJkaW5nXCIgOiBcIlwiKVxuXG4gICAgcmV0dXJuIGNsYXNzIGV4dGVuZHMgdGhpcyB7XG4gICAgICBzdGF0aWMgZ2V0IG5hbWUoKSB7XG4gICAgICAgIHJldHVybiBrbGFzc05hbWVcbiAgICAgIH1cbiAgICAgIGNvbnN0cnVjdG9yKHZpbVN0YXRlKSB7XG4gICAgICAgIHN1cGVyKHZpbVN0YXRlKVxuICAgICAgICB0aGlzLmlubmVyID0gaW5uZXJcbiAgICAgICAgaWYgKGFsbG93Rm9yd2FyZGluZyAhPSBudWxsKSB0aGlzLmFsbG93Rm9yd2FyZGluZyA9IGFsbG93Rm9yd2FyZGluZ1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGlzSW5uZXIoKSB7XG4gICAgcmV0dXJuIHRoaXMuaW5uZXJcbiAgfVxuXG4gIGlzQSgpIHtcbiAgICByZXR1cm4gIXRoaXMuaW5uZXJcbiAgfVxuXG4gIGlzTGluZXdpc2UoKSB7XG4gICAgcmV0dXJuIHRoaXMud2lzZSA9PT0gXCJsaW5ld2lzZVwiXG4gIH1cblxuICBpc0Jsb2Nrd2lzZSgpIHtcbiAgICByZXR1cm4gdGhpcy53aXNlID09PSBcImJsb2Nrd2lzZVwiXG4gIH1cblxuICBmb3JjZVdpc2Uod2lzZSkge1xuICAgIHJldHVybiAodGhpcy53aXNlID0gd2lzZSkgLy8gRklYTUUgY3VycmVudGx5IG5vdCB3ZWxsIHN1cHBvcnRlZFxuICB9XG5cbiAgcmVzZXRTdGF0ZSgpIHtcbiAgICB0aGlzLnNlbGVjdFN1Y2NlZWRlZCA9IGZhbHNlXG4gIH1cblxuICAvLyBleGVjdXRlOiBDYWxsZWQgZnJvbSBPcGVyYXRvcjo6c2VsZWN0VGFyZ2V0KClcbiAgLy8gIC0gYHYgaSBwYCwgaXMgYFZpc3VhbE1vZGVTZWxlY3RgIG9wZXJhdG9yIHdpdGggQHRhcmdldCA9IGBJbm5lclBhcmFncmFwaGAuXG4gIC8vICAtIGBkIGkgcGAsIGlzIGBEZWxldGVgIG9wZXJhdG9yIHdpdGggQHRhcmdldCA9IGBJbm5lclBhcmFncmFwaGAuXG4gIGV4ZWN1dGUoKSB7XG4gICAgLy8gV2hlbm5ldmVyIFRleHRPYmplY3QgaXMgZXhlY3V0ZWQsIGl0IGhhcyBAb3BlcmF0b3JcbiAgICBpZiAoIXRoaXMub3BlcmF0b3IpIHRocm93IG5ldyBFcnJvcihcImluIFRleHRPYmplY3Q6IE11c3Qgbm90IGhhcHBlblwiKVxuICAgIHRoaXMuc2VsZWN0KClcbiAgfVxuXG4gIHNlbGVjdCgpIHtcbiAgICBpZiAodGhpcy5pc01vZGUoXCJ2aXN1YWxcIiwgXCJibG9ja3dpc2VcIikpIHtcbiAgICAgIHRoaXMuc3dyYXAubm9ybWFsaXplKHRoaXMuZWRpdG9yKVxuICAgIH1cblxuICAgIHRoaXMuY291bnRUaW1lcyh0aGlzLmdldENvdW50KCksICh7c3RvcH0pID0+IHtcbiAgICAgIGlmICghdGhpcy5zdXBwb3J0Q291bnQpIHN0b3AoKSAvLyBxdWljay1maXggZm9yICM1NjBcblxuICAgICAgZm9yIChjb25zdCBzZWxlY3Rpb24gb2YgdGhpcy5lZGl0b3IuZ2V0U2VsZWN0aW9ucygpKSB7XG4gICAgICAgIGNvbnN0IG9sZFJhbmdlID0gc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKClcbiAgICAgICAgaWYgKHRoaXMuc2VsZWN0VGV4dE9iamVjdChzZWxlY3Rpb24pKSB0aGlzLnNlbGVjdFN1Y2NlZWRlZCA9IHRydWVcbiAgICAgICAgaWYgKHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpLmlzRXF1YWwob2xkUmFuZ2UpKSBzdG9wKClcbiAgICAgICAgaWYgKHRoaXMuc2VsZWN0T25jZSkgYnJlYWtcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgdGhpcy5lZGl0b3IubWVyZ2VJbnRlcnNlY3RpbmdTZWxlY3Rpb25zKClcbiAgICAvLyBTb21lIFRleHRPYmplY3QncyB3aXNlIGlzIE5PVCBkZXRlcm1pbmlzdGljLiBJdCBoYXMgdG8gYmUgZGV0ZWN0ZWQgZnJvbSBzZWxlY3RlZCByYW5nZS5cbiAgICBpZiAodGhpcy53aXNlID09IG51bGwpIHRoaXMud2lzZSA9IHRoaXMuc3dyYXAuZGV0ZWN0V2lzZSh0aGlzLmVkaXRvcilcblxuICAgIGlmICh0aGlzLm9wZXJhdG9yLmluc3RhbmNlb2YoXCJTZWxlY3RCYXNlXCIpKSB7XG4gICAgICBpZiAodGhpcy5zZWxlY3RTdWNjZWVkZWQpIHtcbiAgICAgICAgaWYgKHRoaXMud2lzZSA9PT0gXCJjaGFyYWN0ZXJ3aXNlXCIpIHtcbiAgICAgICAgICB0aGlzLnN3cmFwLnNhdmVQcm9wZXJ0aWVzKHRoaXMuZWRpdG9yLCB7Zm9yY2U6IHRydWV9KVxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMud2lzZSA9PT0gXCJsaW5ld2lzZVwiKSB7XG4gICAgICAgICAgLy8gV2hlbiB0YXJnZXQgaXMgcGVyc2lzdGVudC1zZWxlY3Rpb24sIG5ldyBzZWxlY3Rpb24gaXMgYWRkZWQgYWZ0ZXIgc2VsZWN0VGV4dE9iamVjdC5cbiAgICAgICAgICAvLyBTbyB3ZSBoYXZlIHRvIGFzc3VyZSBhbGwgc2VsZWN0aW9uIGhhdmUgc2VsY3Rpb24gcHJvcGVydHkuXG4gICAgICAgICAgLy8gTWF5YmUgdGhpcyBsb2dpYyBjYW4gYmUgbW92ZWQgdG8gb3BlcmF0aW9uIHN0YWNrLlxuICAgICAgICAgIGZvciAoY29uc3QgJHNlbGVjdGlvbiBvZiB0aGlzLnN3cmFwLmdldFNlbGVjdGlvbnModGhpcy5lZGl0b3IpKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5nZXRDb25maWcoXCJzdGF5T25TZWxlY3RUZXh0T2JqZWN0XCIpKSB7XG4gICAgICAgICAgICAgIGlmICghJHNlbGVjdGlvbi5oYXNQcm9wZXJ0aWVzKCkpICRzZWxlY3Rpb24uc2F2ZVByb3BlcnRpZXMoKVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgJHNlbGVjdGlvbi5zYXZlUHJvcGVydGllcygpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAkc2VsZWN0aW9uLmZpeFByb3BlcnR5Um93VG9Sb3dSYW5nZSgpXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLnN1Ym1vZGUgPT09IFwiYmxvY2t3aXNlXCIpIHtcbiAgICAgICAgZm9yIChjb25zdCAkc2VsZWN0aW9uIG9mIHRoaXMuc3dyYXAuZ2V0U2VsZWN0aW9ucyh0aGlzLmVkaXRvcikpIHtcbiAgICAgICAgICAkc2VsZWN0aW9uLm5vcm1hbGl6ZSgpXG4gICAgICAgICAgJHNlbGVjdGlvbi5hcHBseVdpc2UoXCJibG9ja3dpc2VcIilcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIFJldHVybiB0cnVlIG9yIGZhbHNlXG4gIHNlbGVjdFRleHRPYmplY3Qoc2VsZWN0aW9uKSB7XG4gICAgY29uc3QgcmFuZ2UgPSB0aGlzLmdldFJhbmdlKHNlbGVjdGlvbilcbiAgICBpZiAocmFuZ2UpIHtcbiAgICAgIHRoaXMuc3dyYXAoc2VsZWN0aW9uKS5zZXRCdWZmZXJSYW5nZShyYW5nZSlcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cbiAgfVxuXG4gIC8vIHRvIG92ZXJyaWRlXG4gIGdldFJhbmdlKHNlbGVjdGlvbikge31cbn1cblxuLy8gU2VjdGlvbjogV29yZFxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PVxuY2xhc3MgV29yZCBleHRlbmRzIFRleHRPYmplY3Qge1xuICBnZXRSYW5nZShzZWxlY3Rpb24pIHtcbiAgICBjb25zdCBwb2ludCA9IHRoaXMuZ2V0Q3Vyc29yUG9zaXRpb25Gb3JTZWxlY3Rpb24oc2VsZWN0aW9uKVxuICAgIGNvbnN0IHtyYW5nZX0gPSB0aGlzLmdldFdvcmRCdWZmZXJSYW5nZUFuZEtpbmRBdEJ1ZmZlclBvc2l0aW9uKHBvaW50LCB7d29yZFJlZ2V4OiB0aGlzLndvcmRSZWdleH0pXG4gICAgcmV0dXJuIHRoaXMuaXNBKCkgPyB0aGlzLnV0aWxzLmV4cGFuZFJhbmdlVG9XaGl0ZVNwYWNlcyh0aGlzLmVkaXRvciwgcmFuZ2UpIDogcmFuZ2VcbiAgfVxufVxuXG5jbGFzcyBXaG9sZVdvcmQgZXh0ZW5kcyBXb3JkIHtcbiAgd29yZFJlZ2V4ID0gL1xcUysvXG59XG5cbi8vIEp1c3QgaW5jbHVkZSBfLCAtXG5jbGFzcyBTbWFydFdvcmQgZXh0ZW5kcyBXb3JkIHtcbiAgd29yZFJlZ2V4ID0gL1tcXHctXSsvXG59XG5cbi8vIEp1c3QgaW5jbHVkZSBfLCAtXG5jbGFzcyBTdWJ3b3JkIGV4dGVuZHMgV29yZCB7XG4gIGdldFJhbmdlKHNlbGVjdGlvbikge1xuICAgIHRoaXMud29yZFJlZ2V4ID0gc2VsZWN0aW9uLmN1cnNvci5zdWJ3b3JkUmVnRXhwKClcbiAgICByZXR1cm4gc3VwZXIuZ2V0UmFuZ2Uoc2VsZWN0aW9uKVxuICB9XG59XG5cbi8vIFNlY3Rpb246IFBhaXJcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIFBhaXIgZXh0ZW5kcyBUZXh0T2JqZWN0IHtcbiAgc3RhdGljIGNvbW1hbmQgPSBmYWxzZVxuICBzdXBwb3J0Q291bnQgPSB0cnVlXG4gIGFsbG93TmV4dExpbmUgPSBudWxsXG4gIGFkanVzdElubmVyUmFuZ2UgPSB0cnVlXG4gIHBhaXIgPSBudWxsXG4gIGluY2x1c2l2ZSA9IHRydWVcblxuICBpc0FsbG93TmV4dExpbmUoKSB7XG4gICAgcmV0dXJuIHRoaXMuYWxsb3dOZXh0TGluZSAhPSBudWxsID8gdGhpcy5hbGxvd05leHRMaW5lIDogdGhpcy5wYWlyICE9IG51bGwgJiYgdGhpcy5wYWlyWzBdICE9PSB0aGlzLnBhaXJbMV1cbiAgfVxuXG4gIGFkanVzdFJhbmdlKHtzdGFydCwgZW5kfSkge1xuICAgIC8vIERpcnR5IHdvcmsgdG8gZmVlbCBuYXR1cmFsIGZvciBodW1hbiwgdG8gYmVoYXZlIGNvbXBhdGlibGUgd2l0aCBwdXJlIFZpbS5cbiAgICAvLyBXaGVyZSB0aGlzIGFkanVzdG1lbnQgYXBwZWFyIGlzIGluIGZvbGxvd2luZyBzaXR1YXRpb24uXG4gICAgLy8gb3AtMTogYGNpe2AgcmVwbGFjZSBvbmx5IDJuZCBsaW5lXG4gICAgLy8gb3AtMjogYGRpe2AgZGVsZXRlIG9ubHkgMm5kIGxpbmUuXG4gICAgLy8gdGV4dDpcbiAgICAvLyAge1xuICAgIC8vICAgIGFhYVxuICAgIC8vICB9XG4gICAgaWYgKHRoaXMudXRpbHMucG9pbnRJc0F0RW5kT2ZMaW5lKHRoaXMuZWRpdG9yLCBzdGFydCkpIHtcbiAgICAgIHN0YXJ0ID0gc3RhcnQudHJhdmVyc2UoWzEsIDBdKVxuICAgIH1cblxuICAgIGlmICh0aGlzLnV0aWxzLmdldExpbmVUZXh0VG9CdWZmZXJQb3NpdGlvbih0aGlzLmVkaXRvciwgZW5kKS5tYXRjaCgvXlxccyokLykpIHtcbiAgICAgIGlmICh0aGlzLm1vZGUgPT09IFwidmlzdWFsXCIpIHtcbiAgICAgICAgLy8gVGhpcyBpcyBzbGlnaHRseSBpbm5jb25zaXN0ZW50IHdpdGggcmVndWxhciBWaW1cbiAgICAgICAgLy8gLSByZWd1bGFyIFZpbTogc2VsZWN0IG5ldyBsaW5lIGFmdGVyIEVPTFxuICAgICAgICAvLyAtIHZpbS1tb2RlLXBsdXM6IHNlbGVjdCB0byBFT0woYmVmb3JlIG5ldyBsaW5lKVxuICAgICAgICAvLyBUaGlzIGlzIGludGVudGlvbmFsIHNpbmNlIHRvIG1ha2Ugc3VibW9kZSBgY2hhcmFjdGVyd2lzZWAgd2hlbiBhdXRvLWRldGVjdCBzdWJtb2RlXG4gICAgICAgIC8vIGlubmVyRW5kID0gbmV3IFBvaW50KGlubmVyRW5kLnJvdyAtIDEsIEluZmluaXR5KVxuICAgICAgICBlbmQgPSBuZXcgUG9pbnQoZW5kLnJvdyAtIDEsIEluZmluaXR5KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZW5kID0gbmV3IFBvaW50KGVuZC5yb3csIDApXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBuZXcgUmFuZ2Uoc3RhcnQsIGVuZClcbiAgfVxuXG4gIGdldEZpbmRlcigpIHtcbiAgICBjb25zdCBmaW5kZXJOYW1lID0gdGhpcy5wYWlyWzBdID09PSB0aGlzLnBhaXJbMV0gPyBcIlF1b3RlRmluZGVyXCIgOiBcIkJyYWNrZXRGaW5kZXJcIlxuICAgIHJldHVybiBuZXcgUGFpckZpbmRlcltmaW5kZXJOYW1lXSh0aGlzLmVkaXRvciwge1xuICAgICAgYWxsb3dOZXh0TGluZTogdGhpcy5pc0FsbG93TmV4dExpbmUoKSxcbiAgICAgIGFsbG93Rm9yd2FyZGluZzogdGhpcy5hbGxvd0ZvcndhcmRpbmcsXG4gICAgICBwYWlyOiB0aGlzLnBhaXIsXG4gICAgICBpbmNsdXNpdmU6IHRoaXMuaW5jbHVzaXZlLFxuICAgIH0pXG4gIH1cblxuICBnZXRQYWlySW5mbyhmcm9tKSB7XG4gICAgY29uc3QgcGFpckluZm8gPSB0aGlzLmdldEZpbmRlcigpLmZpbmQoZnJvbSlcbiAgICBpZiAocGFpckluZm8pIHtcbiAgICAgIGlmICh0aGlzLmFkanVzdElubmVyUmFuZ2UpIHBhaXJJbmZvLmlubmVyUmFuZ2UgPSB0aGlzLmFkanVzdFJhbmdlKHBhaXJJbmZvLmlubmVyUmFuZ2UpXG4gICAgICBwYWlySW5mby50YXJnZXRSYW5nZSA9IHRoaXMuaXNJbm5lcigpID8gcGFpckluZm8uaW5uZXJSYW5nZSA6IHBhaXJJbmZvLmFSYW5nZVxuICAgICAgcmV0dXJuIHBhaXJJbmZvXG4gICAgfVxuICB9XG5cbiAgZ2V0UmFuZ2Uoc2VsZWN0aW9uKSB7XG4gICAgY29uc3Qgb3JpZ2luYWxSYW5nZSA9IHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpXG4gICAgbGV0IHBhaXJJbmZvID0gdGhpcy5nZXRQYWlySW5mbyh0aGlzLmdldEN1cnNvclBvc2l0aW9uRm9yU2VsZWN0aW9uKHNlbGVjdGlvbikpXG4gICAgLy8gV2hlbiByYW5nZSB3YXMgc2FtZSwgdHJ5IHRvIGV4cGFuZCByYW5nZVxuICAgIGlmIChwYWlySW5mbyAmJiBwYWlySW5mby50YXJnZXRSYW5nZS5pc0VxdWFsKG9yaWdpbmFsUmFuZ2UpKSB7XG4gICAgICBwYWlySW5mbyA9IHRoaXMuZ2V0UGFpckluZm8ocGFpckluZm8uYVJhbmdlLmVuZClcbiAgICB9XG4gICAgaWYgKHBhaXJJbmZvKSByZXR1cm4gcGFpckluZm8udGFyZ2V0UmFuZ2VcbiAgfVxufVxuXG4vLyBVc2VkIGJ5IERlbGV0ZVN1cnJvdW5kXG5jbGFzcyBBUGFpciBleHRlbmRzIFBhaXIge1xuICBzdGF0aWMgY29tbWFuZCA9IGZhbHNlXG59XG5cbmNsYXNzIEFueVBhaXIgZXh0ZW5kcyBQYWlyIHtcbiAgYWxsb3dGb3J3YXJkaW5nID0gZmFsc2VcbiAgbWVtYmVyID0gW1wiRG91YmxlUXVvdGVcIiwgXCJTaW5nbGVRdW90ZVwiLCBcIkJhY2tUaWNrXCIsIFwiQ3VybHlCcmFja2V0XCIsIFwiQW5nbGVCcmFja2V0XCIsIFwiU3F1YXJlQnJhY2tldFwiLCBcIlBhcmVudGhlc2lzXCJdXG5cbiAgZ2V0UmFuZ2VzKHNlbGVjdGlvbikge1xuICAgIGNvbnN0IG9wdGlvbnMgPSB7aW5uZXI6IHRoaXMuaW5uZXIsIGFsbG93Rm9yd2FyZGluZzogdGhpcy5hbGxvd0ZvcndhcmRpbmcsIGluY2x1c2l2ZTogdGhpcy5pbmNsdXNpdmV9XG4gICAgcmV0dXJuIHRoaXMubWVtYmVyLm1hcChtZW1iZXIgPT4gdGhpcy5nZXRJbnN0YW5jZShtZW1iZXIsIG9wdGlvbnMpLmdldFJhbmdlKHNlbGVjdGlvbikpLmZpbHRlcihyYW5nZSA9PiByYW5nZSlcbiAgfVxuXG4gIGdldFJhbmdlKHNlbGVjdGlvbikge1xuICAgIHJldHVybiB0aGlzLnV0aWxzLnNvcnRSYW5nZXModGhpcy5nZXRSYW5nZXMoc2VsZWN0aW9uKSkucG9wKClcbiAgfVxufVxuXG5jbGFzcyBBbnlQYWlyQWxsb3dGb3J3YXJkaW5nIGV4dGVuZHMgQW55UGFpciB7XG4gIGFsbG93Rm9yd2FyZGluZyA9IHRydWVcblxuICBnZXRSYW5nZShzZWxlY3Rpb24pIHtcbiAgICBjb25zdCByYW5nZXMgPSB0aGlzLmdldFJhbmdlcyhzZWxlY3Rpb24pXG4gICAgY29uc3QgZnJvbSA9IHNlbGVjdGlvbi5jdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuICAgIGxldCBbZm9yd2FyZGluZ1JhbmdlcywgZW5jbG9zaW5nUmFuZ2VzXSA9IHRoaXMuXy5wYXJ0aXRpb24ocmFuZ2VzLCByYW5nZSA9PiByYW5nZS5zdGFydC5pc0dyZWF0ZXJUaGFuT3JFcXVhbChmcm9tKSlcbiAgICBjb25zdCBlbmNsb3NpbmdSYW5nZSA9IHRoaXMudXRpbHMuc29ydFJhbmdlcyhlbmNsb3NpbmdSYW5nZXMpLnBvcCgpXG4gICAgZm9yd2FyZGluZ1JhbmdlcyA9IHRoaXMudXRpbHMuc29ydFJhbmdlcyhmb3J3YXJkaW5nUmFuZ2VzKVxuXG4gICAgLy8gV2hlbiBlbmNsb3NpbmdSYW5nZSBpcyBleGlzdHMsXG4gICAgLy8gV2UgZG9uJ3QgZ28gYWNyb3NzIGVuY2xvc2luZ1JhbmdlLmVuZC5cbiAgICAvLyBTbyBjaG9vc2UgZnJvbSByYW5nZXMgY29udGFpbmVkIGluIGVuY2xvc2luZ1JhbmdlLlxuICAgIGlmIChlbmNsb3NpbmdSYW5nZSkge1xuICAgICAgZm9yd2FyZGluZ1JhbmdlcyA9IGZvcndhcmRpbmdSYW5nZXMuZmlsdGVyKHJhbmdlID0+IGVuY2xvc2luZ1JhbmdlLmNvbnRhaW5zUmFuZ2UocmFuZ2UpKVxuICAgIH1cblxuICAgIHJldHVybiBmb3J3YXJkaW5nUmFuZ2VzWzBdIHx8IGVuY2xvc2luZ1JhbmdlXG4gIH1cbn1cblxuY2xhc3MgQW55UXVvdGUgZXh0ZW5kcyBBbnlQYWlyIHtcbiAgYWxsb3dGb3J3YXJkaW5nID0gdHJ1ZVxuICBtZW1iZXIgPSBbXCJEb3VibGVRdW90ZVwiLCBcIlNpbmdsZVF1b3RlXCIsIFwiQmFja1RpY2tcIl1cblxuICBnZXRSYW5nZShzZWxlY3Rpb24pIHtcbiAgICAvLyBQaWNrIHJhbmdlIHdoaWNoIGVuZC5jb2x1bSBpcyBsZWZ0bW9zdChtZWFuLCBjbG9zZWQgZmlyc3QpXG4gICAgcmV0dXJuIHRoaXMuZ2V0UmFuZ2VzKHNlbGVjdGlvbikuc29ydCgoYSwgYikgPT4gYS5lbmQuY29sdW1uIC0gYi5lbmQuY29sdW1uKVswXVxuICB9XG59XG5cbmNsYXNzIFF1b3RlIGV4dGVuZHMgUGFpciB7XG4gIHN0YXRpYyBjb21tYW5kID0gZmFsc2VcbiAgYWxsb3dGb3J3YXJkaW5nID0gdHJ1ZVxufVxuXG5jbGFzcyBEb3VibGVRdW90ZSBleHRlbmRzIFF1b3RlIHtcbiAgcGFpciA9IFsnXCInLCAnXCInXVxufVxuXG5jbGFzcyBTaW5nbGVRdW90ZSBleHRlbmRzIFF1b3RlIHtcbiAgcGFpciA9IFtcIidcIiwgXCInXCJdXG59XG5cbmNsYXNzIEJhY2tUaWNrIGV4dGVuZHMgUXVvdGUge1xuICBwYWlyID0gW1wiYFwiLCBcImBcIl1cbn1cblxuY2xhc3MgQ3VybHlCcmFja2V0IGV4dGVuZHMgUGFpciB7XG4gIHBhaXIgPSBbXCJ7XCIsIFwifVwiXVxufVxuXG5jbGFzcyBTcXVhcmVCcmFja2V0IGV4dGVuZHMgUGFpciB7XG4gIHBhaXIgPSBbXCJbXCIsIFwiXVwiXVxufVxuXG5jbGFzcyBQYXJlbnRoZXNpcyBleHRlbmRzIFBhaXIge1xuICBwYWlyID0gW1wiKFwiLCBcIilcIl1cbn1cblxuY2xhc3MgQW5nbGVCcmFja2V0IGV4dGVuZHMgUGFpciB7XG4gIHBhaXIgPSBbXCI8XCIsIFwiPlwiXVxufVxuXG5jbGFzcyBUYWcgZXh0ZW5kcyBQYWlyIHtcbiAgYWxsb3dOZXh0TGluZSA9IHRydWVcbiAgYWxsb3dGb3J3YXJkaW5nID0gdHJ1ZVxuICBhZGp1c3RJbm5lclJhbmdlID0gZmFsc2VcblxuICBnZXRUYWdTdGFydFBvaW50KGZyb20pIHtcbiAgICBjb25zdCByZWdleCA9IFBhaXJGaW5kZXIuVGFnRmluZGVyLnBhdHRlcm5cbiAgICBjb25zdCBvcHRpb25zID0ge2Zyb206IFtmcm9tLnJvdywgMF19XG4gICAgcmV0dXJuIHRoaXMuZmluZEluRWRpdG9yKFwiZm9yd2FyZFwiLCByZWdleCwgb3B0aW9ucywgKHtyYW5nZX0pID0+IHJhbmdlLmNvbnRhaW5zUG9pbnQoZnJvbSwgdHJ1ZSkgJiYgcmFuZ2Uuc3RhcnQpXG4gIH1cblxuICBnZXRGaW5kZXIoKSB7XG4gICAgcmV0dXJuIG5ldyBQYWlyRmluZGVyLlRhZ0ZpbmRlcih0aGlzLmVkaXRvciwge1xuICAgICAgYWxsb3dOZXh0TGluZTogdGhpcy5pc0FsbG93TmV4dExpbmUoKSxcbiAgICAgIGFsbG93Rm9yd2FyZGluZzogdGhpcy5hbGxvd0ZvcndhcmRpbmcsXG4gICAgICBpbmNsdXNpdmU6IHRoaXMuaW5jbHVzaXZlLFxuICAgIH0pXG4gIH1cblxuICBnZXRQYWlySW5mbyhmcm9tKSB7XG4gICAgcmV0dXJuIHN1cGVyLmdldFBhaXJJbmZvKHRoaXMuZ2V0VGFnU3RhcnRQb2ludChmcm9tKSB8fCBmcm9tKVxuICB9XG59XG5cbi8vIFNlY3Rpb246IFBhcmFncmFwaFxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gUGFyYWdyYXBoIGlzIGRlZmluZWQgYXMgY29uc2VjdXRpdmUgKG5vbi0pYmxhbmstbGluZS5cbmNsYXNzIFBhcmFncmFwaCBleHRlbmRzIFRleHRPYmplY3Qge1xuICB3aXNlID0gXCJsaW5ld2lzZVwiXG4gIHN1cHBvcnRDb3VudCA9IHRydWVcblxuICBmaW5kUm93KGZyb21Sb3csIGRpcmVjdGlvbiwgZm4pIHtcbiAgICBpZiAoZm4ucmVzZXQpIGZuLnJlc2V0KClcbiAgICBsZXQgZm91bmRSb3cgPSBmcm9tUm93XG4gICAgZm9yIChjb25zdCByb3cgb2YgdGhpcy5nZXRCdWZmZXJSb3dzKHtzdGFydFJvdzogZnJvbVJvdywgZGlyZWN0aW9ufSkpIHtcbiAgICAgIGlmICghZm4ocm93LCBkaXJlY3Rpb24pKSBicmVha1xuICAgICAgZm91bmRSb3cgPSByb3dcbiAgICB9XG4gICAgcmV0dXJuIGZvdW5kUm93XG4gIH1cblxuICBmaW5kUm93UmFuZ2VCeShmcm9tUm93LCBmbikge1xuICAgIGNvbnN0IHN0YXJ0Um93ID0gdGhpcy5maW5kUm93KGZyb21Sb3csIFwicHJldmlvdXNcIiwgZm4pXG4gICAgY29uc3QgZW5kUm93ID0gdGhpcy5maW5kUm93KGZyb21Sb3csIFwibmV4dFwiLCBmbilcbiAgICByZXR1cm4gW3N0YXJ0Um93LCBlbmRSb3ddXG4gIH1cblxuICBnZXRQcmVkaWN0RnVuY3Rpb24oZnJvbVJvdywgc2VsZWN0aW9uKSB7XG4gICAgY29uc3QgZnJvbVJvd1Jlc3VsdCA9IHRoaXMuZWRpdG9yLmlzQnVmZmVyUm93QmxhbmsoZnJvbVJvdylcblxuICAgIGlmICh0aGlzLmlzSW5uZXIoKSkge1xuICAgICAgcmV0dXJuIChyb3csIGRpcmVjdGlvbikgPT4gdGhpcy5lZGl0b3IuaXNCdWZmZXJSb3dCbGFuayhyb3cpID09PSBmcm9tUm93UmVzdWx0XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGRpcmVjdGlvblRvRXh0ZW5kID0gc2VsZWN0aW9uLmlzUmV2ZXJzZWQoKSA/IFwicHJldmlvdXNcIiA6IFwibmV4dFwiXG5cbiAgICAgIGxldCBmbGlwID0gZmFsc2VcbiAgICAgIGNvbnN0IHByZWRpY3QgPSAocm93LCBkaXJlY3Rpb24pID0+IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gdGhpcy5lZGl0b3IuaXNCdWZmZXJSb3dCbGFuayhyb3cpID09PSBmcm9tUm93UmVzdWx0XG4gICAgICAgIGlmIChmbGlwKSB7XG4gICAgICAgICAgcmV0dXJuICFyZXN1bHRcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAoIXJlc3VsdCAmJiBkaXJlY3Rpb24gPT09IGRpcmVjdGlvblRvRXh0ZW5kKSB7XG4gICAgICAgICAgICByZXR1cm4gKGZsaXAgPSB0cnVlKVxuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gcmVzdWx0XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHByZWRpY3QucmVzZXQgPSAoKSA9PiAoZmxpcCA9IGZhbHNlKVxuICAgICAgcmV0dXJuIHByZWRpY3RcbiAgICB9XG4gIH1cblxuICBnZXRSYW5nZShzZWxlY3Rpb24pIHtcbiAgICBjb25zdCBvcmlnaW5hbFJhbmdlID0gc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKClcbiAgICBsZXQgZnJvbVJvdyA9IHRoaXMuZ2V0Q3Vyc29yUG9zaXRpb25Gb3JTZWxlY3Rpb24oc2VsZWN0aW9uKS5yb3dcbiAgICBpZiAodGhpcy5pc01vZGUoXCJ2aXN1YWxcIiwgXCJsaW5ld2lzZVwiKSkge1xuICAgICAgaWYgKHNlbGVjdGlvbi5pc1JldmVyc2VkKCkpIGZyb21Sb3ctLVxuICAgICAgZWxzZSBmcm9tUm93KytcbiAgICAgIGZyb21Sb3cgPSB0aGlzLmdldFZhbGlkVmltQnVmZmVyUm93KGZyb21Sb3cpXG4gICAgfVxuICAgIGNvbnN0IHJvd1JhbmdlID0gdGhpcy5maW5kUm93UmFuZ2VCeShmcm9tUm93LCB0aGlzLmdldFByZWRpY3RGdW5jdGlvbihmcm9tUm93LCBzZWxlY3Rpb24pKVxuICAgIHJldHVybiBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKS51bmlvbih0aGlzLmdldEJ1ZmZlclJhbmdlRm9yUm93UmFuZ2Uocm93UmFuZ2UpKVxuICB9XG59XG5cbmNsYXNzIEluZGVudGF0aW9uIGV4dGVuZHMgUGFyYWdyYXBoIHtcbiAgZ2V0UmFuZ2Uoc2VsZWN0aW9uKSB7XG4gICAgY29uc3QgZnJvbVJvdyA9IHRoaXMuZ2V0Q3Vyc29yUG9zaXRpb25Gb3JTZWxlY3Rpb24oc2VsZWN0aW9uKS5yb3dcbiAgICBjb25zdCBiYXNlSW5kZW50TGV2ZWwgPSB0aGlzLmVkaXRvci5pbmRlbnRhdGlvbkZvckJ1ZmZlclJvdyhmcm9tUm93KVxuICAgIGNvbnN0IHJvd1JhbmdlID0gdGhpcy5maW5kUm93UmFuZ2VCeShmcm9tUm93LCByb3cgPT4ge1xuICAgICAgcmV0dXJuIHRoaXMuZWRpdG9yLmlzQnVmZmVyUm93Qmxhbmsocm93KVxuICAgICAgICA/IHRoaXMuaXNBKClcbiAgICAgICAgOiB0aGlzLmVkaXRvci5pbmRlbnRhdGlvbkZvckJ1ZmZlclJvdyhyb3cpID49IGJhc2VJbmRlbnRMZXZlbFxuICAgIH0pXG4gICAgcmV0dXJuIHRoaXMuZ2V0QnVmZmVyUmFuZ2VGb3JSb3dSYW5nZShyb3dSYW5nZSlcbiAgfVxufVxuXG4vLyBTZWN0aW9uOiBDb21tZW50XG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09XG5jbGFzcyBDb21tZW50IGV4dGVuZHMgVGV4dE9iamVjdCB7XG4gIENvbW1lbnRcbiAgd2lzZSA9IFwibGluZXdpc2VcIlxuXG4gIGdldFJhbmdlKHNlbGVjdGlvbikge1xuICAgIGNvbnN0IHtyb3d9ID0gdGhpcy5nZXRDdXJzb3JQb3NpdGlvbkZvclNlbGVjdGlvbihzZWxlY3Rpb24pXG4gICAgY29uc3Qgcm93UmFuZ2UgPSB0aGlzLnV0aWxzLmdldFJvd1JhbmdlRm9yQ29tbWVudEF0QnVmZmVyUm93KHRoaXMuZWRpdG9yLCByb3cpXG4gICAgaWYgKHJvd1JhbmdlKSB7XG4gICAgICByZXR1cm4gdGhpcy5nZXRCdWZmZXJSYW5nZUZvclJvd1JhbmdlKHJvd1JhbmdlKVxuICAgIH1cbiAgfVxufVxuXG5jbGFzcyBDb21tZW50T3JQYXJhZ3JhcGggZXh0ZW5kcyBUZXh0T2JqZWN0IHtcbiAgd2lzZSA9IFwibGluZXdpc2VcIlxuXG4gIGdldFJhbmdlKHNlbGVjdGlvbikge1xuICAgIGNvbnN0IHtpbm5lcn0gPSB0aGlzXG4gICAgZm9yIChjb25zdCBrbGFzcyBvZiBbXCJDb21tZW50XCIsIFwiUGFyYWdyYXBoXCJdKSB7XG4gICAgICBjb25zdCByYW5nZSA9IHRoaXMuZ2V0SW5zdGFuY2Uoa2xhc3MsIHtpbm5lcn0pLmdldFJhbmdlKHNlbGVjdGlvbilcbiAgICAgIGlmIChyYW5nZSkgcmV0dXJuIHJhbmdlXG4gICAgfVxuICB9XG59XG5cbi8vIFNlY3Rpb246IEZvbGRcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIEZvbGQgZXh0ZW5kcyBUZXh0T2JqZWN0IHtcbiAgd2lzZSA9IFwibGluZXdpc2VcIlxuXG4gIGFkanVzdFJvd1JhbmdlKHJvd1JhbmdlKSB7XG4gICAgaWYgKHRoaXMuaXNBKCkpIHJldHVybiByb3dSYW5nZVxuXG4gICAgbGV0IFtzdGFydFJvdywgZW5kUm93XSA9IHJvd1JhbmdlXG4gICAgaWYgKHRoaXMuZWRpdG9yLmluZGVudGF0aW9uRm9yQnVmZmVyUm93KHN0YXJ0Um93KSA9PT0gdGhpcy5lZGl0b3IuaW5kZW50YXRpb25Gb3JCdWZmZXJSb3coZW5kUm93KSkge1xuICAgICAgZW5kUm93IC09IDFcbiAgICB9XG4gICAgc3RhcnRSb3cgKz0gMVxuICAgIHJldHVybiBbc3RhcnRSb3csIGVuZFJvd11cbiAgfVxuXG4gIGdldEZvbGRSb3dSYW5nZXNDb250YWluc0ZvclJvdyhyb3cpIHtcbiAgICByZXR1cm4gdGhpcy51dGlscy5nZXRDb2RlRm9sZFJvd1Jhbmdlc0NvbnRhaW5lc0ZvclJvdyh0aGlzLmVkaXRvciwgcm93KS5yZXZlcnNlKClcbiAgfVxuXG4gIGdldFJhbmdlKHNlbGVjdGlvbikge1xuICAgIGNvbnN0IHtyb3d9ID0gdGhpcy5nZXRDdXJzb3JQb3NpdGlvbkZvclNlbGVjdGlvbihzZWxlY3Rpb24pXG4gICAgY29uc3Qgc2VsZWN0ZWRSYW5nZSA9IHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpXG4gICAgZm9yIChjb25zdCByb3dSYW5nZSBvZiB0aGlzLmdldEZvbGRSb3dSYW5nZXNDb250YWluc0ZvclJvdyhyb3cpKSB7XG4gICAgICBjb25zdCByYW5nZSA9IHRoaXMuZ2V0QnVmZmVyUmFuZ2VGb3JSb3dSYW5nZSh0aGlzLmFkanVzdFJvd1JhbmdlKHJvd1JhbmdlKSlcblxuICAgICAgLy8gRG9uJ3QgY2hhbmdlIHRvIGBpZiByYW5nZS5jb250YWluc1JhbmdlKHNlbGVjdGVkUmFuZ2UsIHRydWUpYFxuICAgICAgLy8gVGhlcmUgaXMgYmVoYXZpb3IgZGlmZiB3aGVuIGN1cnNvciBpcyBhdCBiZWdpbm5pbmcgb2YgbGluZSggY29sdW1uIDAgKS5cbiAgICAgIGlmICghc2VsZWN0ZWRSYW5nZS5jb250YWluc1JhbmdlKHJhbmdlKSkgcmV0dXJuIHJhbmdlXG4gICAgfVxuICB9XG59XG5cbi8vIE5PVEU6IEZ1bmN0aW9uIHJhbmdlIGRldGVybWluYXRpb24gaXMgZGVwZW5kaW5nIG9uIGZvbGQuXG5jbGFzcyBGdW5jdGlvbiBleHRlbmRzIEZvbGQge1xuICAvLyBTb21lIGxhbmd1YWdlIGRvbid0IGluY2x1ZGUgY2xvc2luZyBgfWAgaW50byBmb2xkLlxuICBzY29wZU5hbWVzT21pdHRpbmdFbmRSb3cgPSBbXCJzb3VyY2UuZ29cIiwgXCJzb3VyY2UuZWxpeGlyXCJdXG5cbiAgaXNHcmFtbWFyTm90Rm9sZEVuZFJvdygpIHtcbiAgICBjb25zdCB7c2NvcGVOYW1lLCBwYWNrYWdlTmFtZX0gPSB0aGlzLmVkaXRvci5nZXRHcmFtbWFyKClcbiAgICBpZiAodGhpcy5zY29wZU5hbWVzT21pdHRpbmdFbmRSb3cuaW5jbHVkZXMoc2NvcGVOYW1lKSkge1xuICAgICAgcmV0dXJuIHRydWVcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gSEFDSzogUnVzdCBoYXZlIHR3byBwYWNrYWdlIGBsYW5ndWFnZS1ydXN0YCBhbmQgYGF0b20tbGFuZ3VhZ2UtcnVzdGBcbiAgICAgIC8vIGxhbmd1YWdlLXJ1c3QgZG9uJ3QgZm9sZCBlbmRpbmcgYH1gLCBidXQgYXRvbS1sYW5ndWFnZS1ydXN0IGRvZXMuXG4gICAgICByZXR1cm4gc2NvcGVOYW1lID09PSBcInNvdXJjZS5ydXN0XCIgJiYgcGFja2FnZU5hbWUgPT09IFwibGFuZ3VhZ2UtcnVzdFwiXG4gICAgfVxuICB9XG5cbiAgZ2V0Rm9sZFJvd1Jhbmdlc0NvbnRhaW5zRm9yUm93KHJvdykge1xuICAgIHJldHVybiBzdXBlci5nZXRGb2xkUm93UmFuZ2VzQ29udGFpbnNGb3JSb3cocm93KS5maWx0ZXIocm93UmFuZ2UgPT4ge1xuICAgICAgcmV0dXJuIHRoaXMudXRpbHMuaXNJbmNsdWRlRnVuY3Rpb25TY29wZUZvclJvdyh0aGlzLmVkaXRvciwgcm93UmFuZ2VbMF0pXG4gICAgfSlcbiAgfVxuXG4gIGFkanVzdFJvd1JhbmdlKHJvd1JhbmdlKSB7XG4gICAgbGV0IFtzdGFydFJvdywgZW5kUm93XSA9IHN1cGVyLmFkanVzdFJvd1JhbmdlKHJvd1JhbmdlKVxuICAgIC8vIE5PVEU6IFRoaXMgYWRqdXN0bWVudCBzaG91ZCBub3QgYmUgbmVjZXNzYXJ5IGlmIGxhbmd1YWdlLXN5bnRheCBpcyBwcm9wZXJseSBkZWZpbmVkLlxuICAgIGlmICh0aGlzLmlzQSgpICYmIHRoaXMuaXNHcmFtbWFyTm90Rm9sZEVuZFJvdygpKSBlbmRSb3cgKz0gMVxuICAgIHJldHVybiBbc3RhcnRSb3csIGVuZFJvd11cbiAgfVxufVxuXG4vLyBTZWN0aW9uOiBPdGhlclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PVxuY2xhc3MgQXJndW1lbnRzIGV4dGVuZHMgVGV4dE9iamVjdCB7XG4gIG5ld0FyZ0luZm8oYXJnU3RhcnQsIGFyZywgc2VwYXJhdG9yKSB7XG4gICAgY29uc3QgYXJnRW5kID0gdGhpcy51dGlscy50cmF2ZXJzZVRleHRGcm9tUG9pbnQoYXJnU3RhcnQsIGFyZylcbiAgICBjb25zdCBhcmdSYW5nZSA9IG5ldyBSYW5nZShhcmdTdGFydCwgYXJnRW5kKVxuXG4gICAgY29uc3Qgc2VwYXJhdG9yRW5kID0gdGhpcy51dGlscy50cmF2ZXJzZVRleHRGcm9tUG9pbnQoYXJnRW5kLCBzZXBhcmF0b3IgIT0gbnVsbCA/IHNlcGFyYXRvciA6IFwiXCIpXG4gICAgY29uc3Qgc2VwYXJhdG9yUmFuZ2UgPSBuZXcgUmFuZ2UoYXJnRW5kLCBzZXBhcmF0b3JFbmQpXG5cbiAgICBjb25zdCBpbm5lclJhbmdlID0gYXJnUmFuZ2VcbiAgICBjb25zdCBhUmFuZ2UgPSBhcmdSYW5nZS51bmlvbihzZXBhcmF0b3JSYW5nZSlcbiAgICByZXR1cm4ge2FyZ1JhbmdlLCBzZXBhcmF0b3JSYW5nZSwgaW5uZXJSYW5nZSwgYVJhbmdlfVxuICB9XG5cbiAgZ2V0QXJndW1lbnRzUmFuZ2VGb3JTZWxlY3Rpb24oc2VsZWN0aW9uKSB7XG4gICAgY29uc3Qgb3B0aW9ucyA9IHtcbiAgICAgIG1lbWJlcjogW1wiQ3VybHlCcmFja2V0XCIsIFwiU3F1YXJlQnJhY2tldFwiLCBcIlBhcmVudGhlc2lzXCJdLFxuICAgICAgaW5jbHVzaXZlOiBmYWxzZSxcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZ2V0SW5zdGFuY2UoXCJJbm5lckFueVBhaXJcIiwgb3B0aW9ucykuZ2V0UmFuZ2Uoc2VsZWN0aW9uKVxuICB9XG5cbiAgZ2V0UmFuZ2Uoc2VsZWN0aW9uKSB7XG4gICAgY29uc3Qge3NwbGl0QXJndW1lbnRzLCB0cmF2ZXJzZVRleHRGcm9tUG9pbnQsIGdldExhc3R9ID0gdGhpcy51dGlsc1xuICAgIGxldCByYW5nZSA9IHRoaXMuZ2V0QXJndW1lbnRzUmFuZ2VGb3JTZWxlY3Rpb24oc2VsZWN0aW9uKVxuICAgIGNvbnN0IHBhaXJSYW5nZUZvdW5kID0gcmFuZ2UgIT0gbnVsbFxuXG4gICAgcmFuZ2UgPSByYW5nZSB8fCB0aGlzLmdldEluc3RhbmNlKFwiSW5uZXJDdXJyZW50TGluZVwiKS5nZXRSYW5nZShzZWxlY3Rpb24pIC8vIGZhbGxiYWNrXG4gICAgaWYgKCFyYW5nZSkgcmV0dXJuXG5cbiAgICByYW5nZSA9IHRoaXMudHJpbUJ1ZmZlclJhbmdlKHJhbmdlKVxuXG4gICAgY29uc3QgdGV4dCA9IHRoaXMuZWRpdG9yLmdldFRleHRJbkJ1ZmZlclJhbmdlKHJhbmdlKVxuICAgIGNvbnN0IGFsbFRva2VucyA9IHNwbGl0QXJndW1lbnRzKHRleHQsIHBhaXJSYW5nZUZvdW5kKVxuXG4gICAgY29uc3QgYXJnSW5mb3MgPSBbXVxuICAgIGxldCBhcmdTdGFydCA9IHJhbmdlLnN0YXJ0XG5cbiAgICAvLyBTa2lwIHN0YXJ0aW5nIHNlcGFyYXRvclxuICAgIGlmIChhbGxUb2tlbnMubGVuZ3RoICYmIGFsbFRva2Vuc1swXS50eXBlID09PSBcInNlcGFyYXRvclwiKSB7XG4gICAgICBjb25zdCB0b2tlbiA9IGFsbFRva2Vucy5zaGlmdCgpXG4gICAgICBhcmdTdGFydCA9IHRyYXZlcnNlVGV4dEZyb21Qb2ludChhcmdTdGFydCwgdG9rZW4udGV4dClcbiAgICB9XG5cbiAgICB3aGlsZSAoYWxsVG9rZW5zLmxlbmd0aCkge1xuICAgICAgY29uc3QgdG9rZW4gPSBhbGxUb2tlbnMuc2hpZnQoKVxuICAgICAgaWYgKHRva2VuLnR5cGUgPT09IFwiYXJndW1lbnRcIikge1xuICAgICAgICBjb25zdCBuZXh0VG9rZW4gPSBhbGxUb2tlbnMuc2hpZnQoKVxuICAgICAgICBjb25zdCBzZXBhcmF0b3IgPSBuZXh0VG9rZW4gPyBuZXh0VG9rZW4udGV4dCA6IHVuZGVmaW5lZFxuICAgICAgICBjb25zdCBhcmdJbmZvID0gdGhpcy5uZXdBcmdJbmZvKGFyZ1N0YXJ0LCB0b2tlbi50ZXh0LCBzZXBhcmF0b3IpXG5cbiAgICAgICAgaWYgKGFsbFRva2Vucy5sZW5ndGggPT09IDAgJiYgYXJnSW5mb3MubGVuZ3RoKSB7XG4gICAgICAgICAgYXJnSW5mby5hUmFuZ2UgPSBhcmdJbmZvLmFyZ1JhbmdlLnVuaW9uKGdldExhc3QoYXJnSW5mb3MpLnNlcGFyYXRvclJhbmdlKVxuICAgICAgICB9XG5cbiAgICAgICAgYXJnU3RhcnQgPSBhcmdJbmZvLmFSYW5nZS5lbmRcbiAgICAgICAgYXJnSW5mb3MucHVzaChhcmdJbmZvKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwibXVzdCBub3QgaGFwcGVuXCIpXG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgcG9pbnQgPSB0aGlzLmdldEN1cnNvclBvc2l0aW9uRm9yU2VsZWN0aW9uKHNlbGVjdGlvbilcbiAgICBmb3IgKGNvbnN0IHtpbm5lclJhbmdlLCBhUmFuZ2V9IG9mIGFyZ0luZm9zKSB7XG4gICAgICBpZiAoaW5uZXJSYW5nZS5lbmQuaXNHcmVhdGVyVGhhbk9yRXF1YWwocG9pbnQpKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmlzSW5uZXIoKSA/IGlubmVyUmFuZ2UgOiBhUmFuZ2VcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuY2xhc3MgQ3VycmVudExpbmUgZXh0ZW5kcyBUZXh0T2JqZWN0IHtcbiAgZ2V0UmFuZ2Uoc2VsZWN0aW9uKSB7XG4gICAgY29uc3Qge3Jvd30gPSB0aGlzLmdldEN1cnNvclBvc2l0aW9uRm9yU2VsZWN0aW9uKHNlbGVjdGlvbilcbiAgICBjb25zdCByYW5nZSA9IHRoaXMuZWRpdG9yLmJ1ZmZlclJhbmdlRm9yQnVmZmVyUm93KHJvdylcbiAgICByZXR1cm4gdGhpcy5pc0EoKSA/IHJhbmdlIDogdGhpcy50cmltQnVmZmVyUmFuZ2UocmFuZ2UpXG4gIH1cbn1cblxuY2xhc3MgRW50aXJlIGV4dGVuZHMgVGV4dE9iamVjdCB7XG4gIHdpc2UgPSBcImxpbmV3aXNlXCJcbiAgc2VsZWN0T25jZSA9IHRydWVcblxuICBnZXRSYW5nZShzZWxlY3Rpb24pIHtcbiAgICByZXR1cm4gdGhpcy5lZGl0b3IuYnVmZmVyLmdldFJhbmdlKClcbiAgfVxufVxuXG5jbGFzcyBFbXB0eSBleHRlbmRzIFRleHRPYmplY3Qge1xuICBzdGF0aWMgY29tbWFuZCA9IGZhbHNlXG4gIHNlbGVjdE9uY2UgPSB0cnVlXG59XG5cbmNsYXNzIExhdGVzdENoYW5nZSBleHRlbmRzIFRleHRPYmplY3Qge1xuICB3aXNlID0gbnVsbFxuICBzZWxlY3RPbmNlID0gdHJ1ZVxuICBnZXRSYW5nZShzZWxlY3Rpb24pIHtcbiAgICBjb25zdCBzdGFydCA9IHRoaXMudmltU3RhdGUubWFyay5nZXQoXCJbXCIpXG4gICAgY29uc3QgZW5kID0gdGhpcy52aW1TdGF0ZS5tYXJrLmdldChcIl1cIilcbiAgICBpZiAoc3RhcnQgJiYgZW5kKSB7XG4gICAgICByZXR1cm4gbmV3IFJhbmdlKHN0YXJ0LCBlbmQpXG4gICAgfVxuICB9XG59XG5cbmNsYXNzIFNlYXJjaE1hdGNoRm9yd2FyZCBleHRlbmRzIFRleHRPYmplY3Qge1xuICBiYWNrd2FyZCA9IGZhbHNlXG5cbiAgZmluZE1hdGNoKGZyb20sIHJlZ2V4KSB7XG4gICAgaWYgKHRoaXMuYmFja3dhcmQpIHtcbiAgICAgIGlmICh0aGlzLm1vZGUgPT09IFwidmlzdWFsXCIpIHtcbiAgICAgICAgZnJvbSA9IHRoaXMudXRpbHMudHJhbnNsYXRlUG9pbnRBbmRDbGlwKHRoaXMuZWRpdG9yLCBmcm9tLCBcImJhY2t3YXJkXCIpXG4gICAgICB9XG5cbiAgICAgIGNvbnN0IG9wdGlvbnMgPSB7ZnJvbTogW2Zyb20ucm93LCBJbmZpbml0eV19XG4gICAgICByZXR1cm4ge1xuICAgICAgICByYW5nZTogdGhpcy5maW5kSW5FZGl0b3IoXCJiYWNrd2FyZFwiLCByZWdleCwgb3B0aW9ucywgKHtyYW5nZX0pID0+IHJhbmdlLnN0YXJ0LmlzTGVzc1RoYW4oZnJvbSkgJiYgcmFuZ2UpLFxuICAgICAgICB3aGljaElzSGVhZDogXCJzdGFydFwiLFxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAodGhpcy5tb2RlID09PSBcInZpc3VhbFwiKSB7XG4gICAgICAgIGZyb20gPSB0aGlzLnV0aWxzLnRyYW5zbGF0ZVBvaW50QW5kQ2xpcCh0aGlzLmVkaXRvciwgZnJvbSwgXCJmb3J3YXJkXCIpXG4gICAgICB9XG5cbiAgICAgIGNvbnN0IG9wdGlvbnMgPSB7ZnJvbTogW2Zyb20ucm93LCAwXX1cbiAgICAgIHJldHVybiB7XG4gICAgICAgIHJhbmdlOiB0aGlzLmZpbmRJbkVkaXRvcihcImZvcndhcmRcIiwgcmVnZXgsIG9wdGlvbnMsICh7cmFuZ2V9KSA9PiByYW5nZS5lbmQuaXNHcmVhdGVyVGhhbihmcm9tKSAmJiByYW5nZSksXG4gICAgICAgIHdoaWNoSXNIZWFkOiBcImVuZFwiLFxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGdldFJhbmdlKHNlbGVjdGlvbikge1xuICAgIGNvbnN0IHBhdHRlcm4gPSB0aGlzLmdsb2JhbFN0YXRlLmdldChcImxhc3RTZWFyY2hQYXR0ZXJuXCIpXG4gICAgaWYgKCFwYXR0ZXJuKSByZXR1cm5cblxuICAgIGNvbnN0IGZyb21Qb2ludCA9IHNlbGVjdGlvbi5nZXRIZWFkQnVmZmVyUG9zaXRpb24oKVxuICAgIGNvbnN0IHtyYW5nZSwgd2hpY2hJc0hlYWR9ID0gdGhpcy5maW5kTWF0Y2goZnJvbVBvaW50LCBwYXR0ZXJuKVxuICAgIGlmIChyYW5nZSkge1xuICAgICAgcmV0dXJuIHRoaXMudW5pb25SYW5nZUFuZERldGVybWluZVJldmVyc2VkU3RhdGUoc2VsZWN0aW9uLCByYW5nZSwgd2hpY2hJc0hlYWQpXG4gICAgfVxuICB9XG5cbiAgdW5pb25SYW5nZUFuZERldGVybWluZVJldmVyc2VkU3RhdGUoc2VsZWN0aW9uLCByYW5nZSwgd2hpY2hJc0hlYWQpIHtcbiAgICBpZiAoc2VsZWN0aW9uLmlzRW1wdHkoKSkgcmV0dXJuIHJhbmdlXG5cbiAgICBsZXQgaGVhZCA9IHJhbmdlW3doaWNoSXNIZWFkXVxuICAgIGNvbnN0IHRhaWwgPSBzZWxlY3Rpb24uZ2V0VGFpbEJ1ZmZlclBvc2l0aW9uKClcblxuICAgIGlmICh0aGlzLmJhY2t3YXJkKSB7XG4gICAgICBpZiAodGFpbC5pc0xlc3NUaGFuKGhlYWQpKSBoZWFkID0gdGhpcy51dGlscy50cmFuc2xhdGVQb2ludEFuZENsaXAodGhpcy5lZGl0b3IsIGhlYWQsIFwiZm9yd2FyZFwiKVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoaGVhZC5pc0xlc3NUaGFuKHRhaWwpKSBoZWFkID0gdGhpcy51dGlscy50cmFuc2xhdGVQb2ludEFuZENsaXAodGhpcy5lZGl0b3IsIGhlYWQsIFwiYmFja3dhcmRcIilcbiAgICB9XG5cbiAgICB0aGlzLnJldmVyc2VkID0gaGVhZC5pc0xlc3NUaGFuKHRhaWwpXG4gICAgcmV0dXJuIG5ldyBSYW5nZSh0YWlsLCBoZWFkKS51bmlvbih0aGlzLnN3cmFwKHNlbGVjdGlvbikuZ2V0VGFpbEJ1ZmZlclJhbmdlKCkpXG4gIH1cblxuICBzZWxlY3RUZXh0T2JqZWN0KHNlbGVjdGlvbikge1xuICAgIGNvbnN0IHJhbmdlID0gdGhpcy5nZXRSYW5nZShzZWxlY3Rpb24pXG4gICAgaWYgKHJhbmdlKSB7XG4gICAgICB0aGlzLnN3cmFwKHNlbGVjdGlvbikuc2V0QnVmZmVyUmFuZ2UocmFuZ2UsIHtyZXZlcnNlZDogdGhpcy5yZXZlcnNlZCAhPSBudWxsID8gdGhpcy5yZXZlcnNlZCA6IHRoaXMuYmFja3dhcmR9KVxuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG4gIH1cbn1cblxuY2xhc3MgU2VhcmNoTWF0Y2hCYWNrd2FyZCBleHRlbmRzIFNlYXJjaE1hdGNoRm9yd2FyZCB7XG4gIGJhY2t3YXJkID0gdHJ1ZVxufVxuXG4vLyBbTGltaXRhdGlvbjogd29uJ3QgZml4XTogU2VsZWN0ZWQgcmFuZ2UgaXMgbm90IHN1Ym1vZGUgYXdhcmUuIGFsd2F5cyBjaGFyYWN0ZXJ3aXNlLlxuLy8gU28gZXZlbiBpZiBvcmlnaW5hbCBzZWxlY3Rpb24gd2FzIHZMIG9yIHZCLCBzZWxlY3RlZCByYW5nZSBieSB0aGlzIHRleHQtb2JqZWN0XG4vLyBpcyBhbHdheXMgdkMgcmFuZ2UuXG5jbGFzcyBQcmV2aW91c1NlbGVjdGlvbiBleHRlbmRzIFRleHRPYmplY3Qge1xuICB3aXNlID0gbnVsbFxuICBzZWxlY3RPbmNlID0gdHJ1ZVxuXG4gIHNlbGVjdFRleHRPYmplY3Qoc2VsZWN0aW9uKSB7XG4gICAgY29uc3Qge3Byb3BlcnRpZXMsIHN1Ym1vZGV9ID0gdGhpcy52aW1TdGF0ZS5wcmV2aW91c1NlbGVjdGlvblxuICAgIGlmIChwcm9wZXJ0aWVzICYmIHN1Ym1vZGUpIHtcbiAgICAgIHRoaXMud2lzZSA9IHN1Ym1vZGVcbiAgICAgIHRoaXMuc3dyYXAodGhpcy5lZGl0b3IuZ2V0TGFzdFNlbGVjdGlvbigpKS5zZWxlY3RCeVByb3BlcnRpZXMocHJvcGVydGllcylcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfVxuICB9XG59XG5cbmNsYXNzIFBlcnNpc3RlbnRTZWxlY3Rpb24gZXh0ZW5kcyBUZXh0T2JqZWN0IHtcbiAgd2lzZSA9IG51bGxcbiAgc2VsZWN0T25jZSA9IHRydWVcblxuICBzZWxlY3RUZXh0T2JqZWN0KHNlbGVjdGlvbikge1xuICAgIGlmICh0aGlzLnZpbVN0YXRlLmhhc1BlcnNpc3RlbnRTZWxlY3Rpb25zKCkpIHtcbiAgICAgIHRoaXMucGVyc2lzdGVudFNlbGVjdGlvbi5zZXRTZWxlY3RlZEJ1ZmZlclJhbmdlcygpXG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH1cbiAgfVxufVxuXG4vLyBVc2VkIG9ubHkgYnkgUmVwbGFjZVdpdGhSZWdpc3RlciBhbmQgUHV0QmVmb3JlIGFuZCBpdHMnIGNoaWxkcmVuLlxuY2xhc3MgTGFzdFBhc3RlZFJhbmdlIGV4dGVuZHMgVGV4dE9iamVjdCB7XG4gIHN0YXRpYyBjb21tYW5kID0gZmFsc2VcbiAgd2lzZSA9IG51bGxcbiAgc2VsZWN0T25jZSA9IHRydWVcblxuICBzZWxlY3RUZXh0T2JqZWN0KHNlbGVjdGlvbikge1xuICAgIGZvciAoc2VsZWN0aW9uIG9mIHRoaXMuZWRpdG9yLmdldFNlbGVjdGlvbnMoKSkge1xuICAgICAgY29uc3QgcmFuZ2UgPSB0aGlzLnZpbVN0YXRlLnNlcXVlbnRpYWxQYXN0ZU1hbmFnZXIuZ2V0UGFzdGVkUmFuZ2VGb3JTZWxlY3Rpb24oc2VsZWN0aW9uKVxuICAgICAgc2VsZWN0aW9uLnNldEJ1ZmZlclJhbmdlKHJhbmdlKVxuICAgIH1cbiAgICByZXR1cm4gdHJ1ZVxuICB9XG59XG5cbmNsYXNzIFZpc2libGVBcmVhIGV4dGVuZHMgVGV4dE9iamVjdCB7XG4gIHNlbGVjdE9uY2UgPSB0cnVlXG5cbiAgZ2V0UmFuZ2Uoc2VsZWN0aW9uKSB7XG4gICAgY29uc3QgW3N0YXJ0Um93LCBlbmRSb3ddID0gdGhpcy5lZGl0b3IuZ2V0VmlzaWJsZVJvd1JhbmdlKClcbiAgICByZXR1cm4gdGhpcy5lZGl0b3IuYnVmZmVyUmFuZ2VGb3JTY3JlZW5SYW5nZShbW3N0YXJ0Um93LCAwXSwgW2VuZFJvdywgSW5maW5pdHldXSlcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IE9iamVjdC5hc3NpZ24oXG4gIHtcbiAgICBUZXh0T2JqZWN0LFxuICAgIFdvcmQsXG4gICAgV2hvbGVXb3JkLFxuICAgIFNtYXJ0V29yZCxcbiAgICBTdWJ3b3JkLFxuICAgIFBhaXIsXG4gICAgQVBhaXIsXG4gICAgQW55UGFpcixcbiAgICBBbnlQYWlyQWxsb3dGb3J3YXJkaW5nLFxuICAgIEFueVF1b3RlLFxuICAgIFF1b3RlLFxuICAgIERvdWJsZVF1b3RlLFxuICAgIFNpbmdsZVF1b3RlLFxuICAgIEJhY2tUaWNrLFxuICAgIEN1cmx5QnJhY2tldCxcbiAgICBTcXVhcmVCcmFja2V0LFxuICAgIFBhcmVudGhlc2lzLFxuICAgIEFuZ2xlQnJhY2tldCxcbiAgICBUYWcsXG4gICAgUGFyYWdyYXBoLFxuICAgIEluZGVudGF0aW9uLFxuICAgIENvbW1lbnQsXG4gICAgQ29tbWVudE9yUGFyYWdyYXBoLFxuICAgIEZvbGQsXG4gICAgRnVuY3Rpb24sXG4gICAgQXJndW1lbnRzLFxuICAgIEN1cnJlbnRMaW5lLFxuICAgIEVudGlyZSxcbiAgICBFbXB0eSxcbiAgICBMYXRlc3RDaGFuZ2UsXG4gICAgU2VhcmNoTWF0Y2hGb3J3YXJkLFxuICAgIFNlYXJjaE1hdGNoQmFja3dhcmQsXG4gICAgUHJldmlvdXNTZWxlY3Rpb24sXG4gICAgUGVyc2lzdGVudFNlbGVjdGlvbixcbiAgICBMYXN0UGFzdGVkUmFuZ2UsXG4gICAgVmlzaWJsZUFyZWEsXG4gIH0sXG4gIFdvcmQuZGVyaXZlQ2xhc3ModHJ1ZSksXG4gIFdob2xlV29yZC5kZXJpdmVDbGFzcyh0cnVlKSxcbiAgU21hcnRXb3JkLmRlcml2ZUNsYXNzKHRydWUpLFxuICBTdWJ3b3JkLmRlcml2ZUNsYXNzKHRydWUpLFxuICBBbnlQYWlyLmRlcml2ZUNsYXNzKHRydWUpLFxuICBBbnlQYWlyQWxsb3dGb3J3YXJkaW5nLmRlcml2ZUNsYXNzKHRydWUpLFxuICBBbnlRdW90ZS5kZXJpdmVDbGFzcyh0cnVlKSxcbiAgRG91YmxlUXVvdGUuZGVyaXZlQ2xhc3ModHJ1ZSksXG4gIFNpbmdsZVF1b3RlLmRlcml2ZUNsYXNzKHRydWUpLFxuICBCYWNrVGljay5kZXJpdmVDbGFzcyh0cnVlKSxcbiAgQ3VybHlCcmFja2V0LmRlcml2ZUNsYXNzKHRydWUsIHRydWUpLFxuICBTcXVhcmVCcmFja2V0LmRlcml2ZUNsYXNzKHRydWUsIHRydWUpLFxuICBQYXJlbnRoZXNpcy5kZXJpdmVDbGFzcyh0cnVlLCB0cnVlKSxcbiAgQW5nbGVCcmFja2V0LmRlcml2ZUNsYXNzKHRydWUsIHRydWUpLFxuICBUYWcuZGVyaXZlQ2xhc3ModHJ1ZSksXG4gIFBhcmFncmFwaC5kZXJpdmVDbGFzcyh0cnVlKSxcbiAgSW5kZW50YXRpb24uZGVyaXZlQ2xhc3ModHJ1ZSksXG4gIENvbW1lbnQuZGVyaXZlQ2xhc3ModHJ1ZSksXG4gIENvbW1lbnRPclBhcmFncmFwaC5kZXJpdmVDbGFzcyh0cnVlKSxcbiAgRm9sZC5kZXJpdmVDbGFzcyh0cnVlKSxcbiAgRnVuY3Rpb24uZGVyaXZlQ2xhc3ModHJ1ZSksXG4gIEFyZ3VtZW50cy5kZXJpdmVDbGFzcyh0cnVlKSxcbiAgQ3VycmVudExpbmUuZGVyaXZlQ2xhc3ModHJ1ZSksXG4gIEVudGlyZS5kZXJpdmVDbGFzcyh0cnVlKSxcbiAgTGF0ZXN0Q2hhbmdlLmRlcml2ZUNsYXNzKHRydWUpLFxuICBQZXJzaXN0ZW50U2VsZWN0aW9uLmRlcml2ZUNsYXNzKHRydWUpLFxuICBWaXNpYmxlQXJlYS5kZXJpdmVDbGFzcyh0cnVlKVxuKVxuIl19