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

var _require2 = require("./utils");

var getLineTextToBufferPosition = _require2.getLineTextToBufferPosition;
var getCodeFoldRowRangesContainesForRow = _require2.getCodeFoldRowRangesContainesForRow;
var isIncludeFunctionScopeForRow = _require2.isIncludeFunctionScopeForRow;
var expandRangeToWhiteSpaces = _require2.expandRangeToWhiteSpaces;
var getVisibleBufferRange = _require2.getVisibleBufferRange;
var translatePointAndClip = _require2.translatePointAndClip;
var getBufferRows = _require2.getBufferRows;
var getValidVimBufferRow = _require2.getValidVimBufferRow;
var trimRange = _require2.trimRange;
var sortRanges = _require2.sortRanges;
var pointIsAtEndOfLine = _require2.pointIsAtEndOfLine;
var splitArguments = _require2.splitArguments;
var traverseTextFromPoint = _require2.traverseTextFromPoint;

var PairFinder = undefined;

var TextObject = (function (_Base) {
  _inherits(TextObject, _Base);

  function TextObject() {
    _classCallCheck(this, TextObject);

    _get(Object.getPrototypeOf(TextObject.prototype), "constructor", this).apply(this, arguments);

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
    //  - `v i p`, is `SelectInVisualMode` operator with @target = `InnerParagraph`.
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
            this.swrap.getSelections(this.editor).forEach(function ($selection) {
              return $selection.saveProperties();
            });
            for (var $selection of this.swrap.getSelections(this.editor)) {
              $selection.saveProperties();
            }
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

      return this.isA() ? expandRangeToWhiteSpaces(this.editor, range) : range;
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

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _get(Object.getPrototypeOf(Pair.prototype), "constructor", this).apply(this, args);
    this.supportCount = true;
    this.allowNextLine = null;
    this.adjustInnerRange = true;
    this.pair = null;
    this.inclusive = true;
    if (!PairFinder) PairFinder = require("./pair-finder");
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
      if (pointIsAtEndOfLine(this.editor, start)) {
        start = start.traverse([1, 0]);
      }

      if (getLineTextToBufferPosition(this.editor, end).match(/^\s*$/)) {
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
      return _.last(sortRanges(this.getRanges(selection)));
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

      var enclosingRange = _.last(sortRanges(enclosingRanges));
      forwardingRanges = sortRanges(forwardingRanges);

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
      for (var row of getBufferRows(this.editor, { startRow: fromRow, direction: direction })) {
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
        fromRow = getValidVimBufferRow(this.editor, fromRow);
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
      return getCodeFoldRowRangesContainesForRow(this.editor, row).reverse();
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
        return isIncludeFunctionScopeForRow(_this5.editor, rowRange[0]);
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
      var argEnd = traverseTextFromPoint(argStart, arg);
      var argRange = new Range(argStart, argEnd);

      var separatorEnd = traverseTextFromPoint(argEnd, separator != null ? separator : "");
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

      range = trimRange(this.editor, range);

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
      return this.isA() ? range : trimRange(this.editor, range);
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
        fromPoint = translatePointAndClip(this.editor, fromPoint, "forward");
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
        if (tail.isLessThan(head)) head = translatePointAndClip(this.editor, head, "forward");
      } else {
        if (head.isLessThan(tail)) head = translatePointAndClip(this.editor, head, "backward");
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
        fromPoint = translatePointAndClip(this.editor, fromPoint, "backward");
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
      var range = getVisibleBufferRange(this.editor);
      return range.getRows() > this.editor.getRowsPerPage() ? range.translate([+1, 0], [-3, 0]) : range;
    }
  }]);

  return VisibleArea;
})(TextObject);

VisibleArea.register(false, true);
// FIXME #472, #66

// Some language don't include closing `}` into fold.
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL3RleHQtb2JqZWN0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFdBQVcsQ0FBQTs7Ozs7Ozs7Ozs7O2VBRVksT0FBTyxDQUFDLE1BQU0sQ0FBQzs7SUFBL0IsS0FBSyxZQUFMLEtBQUs7SUFBRSxLQUFLLFlBQUwsS0FBSzs7QUFDbkIsSUFBTSxDQUFDLEdBQUcsT0FBTyxDQUFDLGlCQUFpQixDQUFDLENBQUE7Ozs7O0FBS3BDLElBQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQTs7Z0JBZTFCLE9BQU8sQ0FBQyxTQUFTLENBQUM7O0lBYnBCLDJCQUEyQixhQUEzQiwyQkFBMkI7SUFDM0IsbUNBQW1DLGFBQW5DLG1DQUFtQztJQUNuQyw0QkFBNEIsYUFBNUIsNEJBQTRCO0lBQzVCLHdCQUF3QixhQUF4Qix3QkFBd0I7SUFDeEIscUJBQXFCLGFBQXJCLHFCQUFxQjtJQUNyQixxQkFBcUIsYUFBckIscUJBQXFCO0lBQ3JCLGFBQWEsYUFBYixhQUFhO0lBQ2Isb0JBQW9CLGFBQXBCLG9CQUFvQjtJQUNwQixTQUFTLGFBQVQsU0FBUztJQUNULFVBQVUsYUFBVixVQUFVO0lBQ1Ysa0JBQWtCLGFBQWxCLGtCQUFrQjtJQUNsQixjQUFjLGFBQWQsY0FBYztJQUNkLHFCQUFxQixhQUFyQixxQkFBcUI7O0FBRXZCLElBQUksVUFBVSxZQUFBLENBQUE7O0lBRVIsVUFBVTtZQUFWLFVBQVU7O1dBQVYsVUFBVTswQkFBVixVQUFVOzsrQkFBVixVQUFVOztTQUdkLElBQUksR0FBRyxlQUFlO1NBQ3RCLFlBQVksR0FBRyxLQUFLO1NBQ3BCLFVBQVUsR0FBRyxLQUFLO1NBQ2xCLGVBQWUsR0FBRyxLQUFLOzs7ZUFObkIsVUFBVTs7V0FvQ1AsbUJBQUc7QUFDUixhQUFPLElBQUksQ0FBQyxLQUFLLENBQUE7S0FDbEI7OztXQUVFLGVBQUc7QUFD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QUEwQixDQUFDLFNBQVMsQ0FBQyxDQUFBO0FBQ3hGLGlCQUFTLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxDQUFBO09BQ2hDO0FBQ0QsYUFBTyxJQUFJLENBQUE7S0FDWjs7O1NBVkcsZUFBZTtHQUFTLFVBQVU7O0FBWXhDLGVBQWUsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUE7O0lBRXpCLFdBQVc7WUFBWCxXQUFXOztXQUFYLFdBQVc7MEJBQVgsV0FBVzs7K0JBQVgsV0FBVzs7U0FDZixVQUFVLEdBQUcsSUFBSTs7O2VBRGIsV0FBVzs7V0FHUCxrQkFBQyxTQUFTLEVBQUU7OztBQUdsQixVQUFNLEtBQUssR0FBRyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUE7QUFDaEQsYUFBTyxLQUFLLENBQUMsT0FBTyxFQUFFLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxjQUFjLEVBQUUsR0FBRyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQTtLQUNsRzs7O1NBUkcsV0FBVztHQUFTLFVBQVU7O0FBVXBDLFdBQVcsQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFBIiwiZmlsZSI6Ii9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL3RleHQtb2JqZWN0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2UgYmFiZWxcIlxuXG5jb25zdCB7UmFuZ2UsIFBvaW50fSA9IHJlcXVpcmUoXCJhdG9tXCIpXG5jb25zdCBfID0gcmVxdWlyZShcInVuZGVyc2NvcmUtcGx1c1wiKVxuXG4vLyBbVE9ET10gTmVlZCBvdmVyaGF1bFxuLy8gIC0gWyBdIE1ha2UgZXhwYW5kYWJsZSBieSBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKS51bmlvbih0aGlzLmdldFJhbmdlKHNlbGVjdGlvbikpXG4vLyAgLSBbIF0gQ291bnQgc3VwcG9ydChwcmlvcml0eSBsb3cpP1xuY29uc3QgQmFzZSA9IHJlcXVpcmUoXCIuL2Jhc2VcIilcbmNvbnN0IHtcbiAgZ2V0TGluZVRleHRUb0J1ZmZlclBvc2l0aW9uLFxuICBnZXRDb2RlRm9sZFJvd1Jhbmdlc0NvbnRhaW5lc0ZvclJvdyxcbiAgaXNJbmNsdWRlRnVuY3Rpb25TY29wZUZvclJvdyxcbiAgZXhwYW5kUmFuZ2VUb1doaXRlU3BhY2VzLFxuICBnZXRWaXNpYmxlQnVmZmVyUmFuZ2UsXG4gIHRyYW5zbGF0ZVBvaW50QW5kQ2xpcCxcbiAgZ2V0QnVmZmVyUm93cyxcbiAgZ2V0VmFsaWRWaW1CdWZmZXJSb3csXG4gIHRyaW1SYW5nZSxcbiAgc29ydFJhbmdlcyxcbiAgcG9pbnRJc0F0RW5kT2ZMaW5lLFxuICBzcGxpdEFyZ3VtZW50cyxcbiAgdHJhdmVyc2VUZXh0RnJvbVBvaW50LFxufSA9IHJlcXVpcmUoXCIuL3V0aWxzXCIpXG5sZXQgUGFpckZpbmRlclxuXG5jbGFzcyBUZXh0T2JqZWN0IGV4dGVuZHMgQmFzZSB7XG4gIHN0YXRpYyBvcGVyYXRpb25LaW5kID0gXCJ0ZXh0LW9iamVjdFwiXG5cbiAgd2lzZSA9IFwiY2hhcmFjdGVyd2lzZVwiXG4gIHN1cHBvcnRDb3VudCA9IGZhbHNlIC8vIEZJWE1FICM0NzIsICM2NlxuICBzZWxlY3RPbmNlID0gZmFsc2VcbiAgc2VsZWN0U3VjY2VlZGVkID0gZmFsc2VcblxuICBzdGF0aWMgcmVnaXN0ZXIoaXNDb21tYW5kLCBkZXJpdmVJbm5lckFuZEEsIGRlcml2ZUlubmVyQW5kQUZvckFsbG93Rm9yd2FyZGluZykge1xuICAgIHN1cGVyLnJlZ2lzdGVyKGlzQ29tbWFuZClcblxuICAgIGlmIChkZXJpdmVJbm5lckFuZEEpIHtcbiAgICAgIHRoaXMuZ2VuZXJhdGVDbGFzcyhgQSR7dGhpcy5uYW1lfWAsIGZhbHNlKVxuICAgICAgdGhpcy5nZW5lcmF0ZUNsYXNzKGBJbm5lciR7dGhpcy5uYW1lfWAsIHRydWUpXG4gICAgfVxuXG4gICAgaWYgKGRlcml2ZUlubmVyQW5kQUZvckFsbG93Rm9yd2FyZGluZykge1xuICAgICAgdGhpcy5nZW5lcmF0ZUNsYXNzKGBBJHt0aGlzLm5hbWV9QWxsb3dGb3J3YXJkaW5nYCwgZmFsc2UsIHRydWUpXG4gICAgICB0aGlzLmdlbmVyYXRlQ2xhc3MoYElubmVyJHt0aGlzLm5hbWV9QWxsb3dGb3J3YXJkaW5nYCwgdHJ1ZSwgdHJ1ZSlcbiAgICB9XG4gIH1cblxuICBzdGF0aWMgZ2VuZXJhdGVDbGFzcyhrbGFzc05hbWUsIGlubmVyLCBhbGxvd0ZvcndhcmRpbmcpIHtcbiAgICBjb25zdCBrbGFzcyA9IGNsYXNzIGV4dGVuZHMgdGhpcyB7XG4gICAgICBzdGF0aWMgZ2V0IG5hbWUoKSB7XG4gICAgICAgIHJldHVybiBrbGFzc05hbWVcbiAgICAgIH1cbiAgICAgIGNvbnN0cnVjdG9yKHZpbVN0YXRlKSB7XG4gICAgICAgIHN1cGVyKHZpbVN0YXRlKVxuICAgICAgICB0aGlzLmlubmVyID0gaW5uZXJcbiAgICAgICAgaWYgKGFsbG93Rm9yd2FyZGluZyAhPSBudWxsKSB0aGlzLmFsbG93Rm9yd2FyZGluZyA9IGFsbG93Rm9yd2FyZGluZ1xuICAgICAgfVxuICAgIH1cbiAgICBrbGFzcy5yZWdpc3RlcigpXG4gIH1cblxuICBpc0lubmVyKCkge1xuICAgIHJldHVybiB0aGlzLmlubmVyXG4gIH1cblxuICBpc0EoKSB7XG4gICAgcmV0dXJuICF0aGlzLmlubmVyXG4gIH1cblxuICBpc0xpbmV3aXNlKCkge1xuICAgIHJldHVybiB0aGlzLndpc2UgPT09IFwibGluZXdpc2VcIlxuICB9XG5cbiAgaXNCbG9ja3dpc2UoKSB7XG4gICAgcmV0dXJuIHRoaXMud2lzZSA9PT0gXCJibG9ja3dpc2VcIlxuICB9XG5cbiAgZm9yY2VXaXNlKHdpc2UpIHtcbiAgICByZXR1cm4gKHRoaXMud2lzZSA9IHdpc2UpIC8vIEZJWE1FIGN1cnJlbnRseSBub3Qgd2VsbCBzdXBwb3J0ZWRcbiAgfVxuXG4gIHJlc2V0U3RhdGUoKSB7XG4gICAgdGhpcy5zZWxlY3RTdWNjZWVkZWQgPSBmYWxzZVxuICB9XG5cbiAgLy8gZXhlY3V0ZTogQ2FsbGVkIGZyb20gT3BlcmF0b3I6OnNlbGVjdFRhcmdldCgpXG4gIC8vICAtIGB2IGkgcGAsIGlzIGBTZWxlY3RJblZpc3VhbE1vZGVgIG9wZXJhdG9yIHdpdGggQHRhcmdldCA9IGBJbm5lclBhcmFncmFwaGAuXG4gIC8vICAtIGBkIGkgcGAsIGlzIGBEZWxldGVgIG9wZXJhdG9yIHdpdGggQHRhcmdldCA9IGBJbm5lclBhcmFncmFwaGAuXG4gIGV4ZWN1dGUoKSB7XG4gICAgLy8gV2hlbm5ldmVyIFRleHRPYmplY3QgaXMgZXhlY3V0ZWQsIGl0IGhhcyBAb3BlcmF0b3JcbiAgICBpZiAoIXRoaXMub3BlcmF0b3IpIHRocm93IG5ldyBFcnJvcihcImluIFRleHRPYmplY3Q6IE11c3Qgbm90IGhhcHBlblwiKVxuICAgIHRoaXMuc2VsZWN0KClcbiAgfVxuXG4gIHNlbGVjdCgpIHtcbiAgICBpZiAodGhpcy5pc01vZGUoXCJ2aXN1YWxcIiwgXCJibG9ja3dpc2VcIikpIHtcbiAgICAgIHRoaXMuc3dyYXAubm9ybWFsaXplKHRoaXMuZWRpdG9yKVxuICAgIH1cblxuICAgIHRoaXMuY291bnRUaW1lcyh0aGlzLmdldENvdW50KCksICh7c3RvcH0pID0+IHtcbiAgICAgIGlmICghdGhpcy5zdXBwb3J0Q291bnQpIHN0b3AoKSAvLyBxdWljay1maXggZm9yICM1NjBcblxuICAgICAgZm9yIChjb25zdCBzZWxlY3Rpb24gb2YgdGhpcy5lZGl0b3IuZ2V0U2VsZWN0aW9ucygpKSB7XG4gICAgICAgIGNvbnN0IG9sZFJhbmdlID0gc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKClcbiAgICAgICAgaWYgKHRoaXMuc2VsZWN0VGV4dE9iamVjdChzZWxlY3Rpb24pKSB0aGlzLnNlbGVjdFN1Y2NlZWRlZCA9IHRydWVcbiAgICAgICAgaWYgKHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpLmlzRXF1YWwob2xkUmFuZ2UpKSBzdG9wKClcbiAgICAgICAgaWYgKHRoaXMuc2VsZWN0T25jZSkgYnJlYWtcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgdGhpcy5lZGl0b3IubWVyZ2VJbnRlcnNlY3RpbmdTZWxlY3Rpb25zKClcbiAgICAvLyBTb21lIFRleHRPYmplY3QncyB3aXNlIGlzIE5PVCBkZXRlcm1pbmlzdGljLiBJdCBoYXMgdG8gYmUgZGV0ZWN0ZWQgZnJvbSBzZWxlY3RlZCByYW5nZS5cbiAgICBpZiAodGhpcy53aXNlID09IG51bGwpIHRoaXMud2lzZSA9IHRoaXMuc3dyYXAuZGV0ZWN0V2lzZSh0aGlzLmVkaXRvcilcblxuICAgIGlmICh0aGlzLm9wZXJhdG9yLmluc3RhbmNlb2YoXCJTZWxlY3RCYXNlXCIpKSB7XG4gICAgICBpZiAodGhpcy5zZWxlY3RTdWNjZWVkZWQpIHtcbiAgICAgICAgaWYgKHRoaXMud2lzZSA9PT0gXCJjaGFyYWN0ZXJ3aXNlXCIpIHtcbiAgICAgICAgICB0aGlzLnN3cmFwLmdldFNlbGVjdGlvbnModGhpcy5lZGl0b3IpLmZvckVhY2goJHNlbGVjdGlvbiA9PiAkc2VsZWN0aW9uLnNhdmVQcm9wZXJ0aWVzKCkpXG4gICAgICAgICAgZm9yIChjb25zdCAkc2VsZWN0aW9uIG9mIHRoaXMuc3dyYXAuZ2V0U2VsZWN0aW9ucyh0aGlzLmVkaXRvcikpIHtcbiAgICAgICAgICAgICRzZWxlY3Rpb24uc2F2ZVByb3BlcnRpZXMoKVxuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLndpc2UgPT09IFwibGluZXdpc2VcIikge1xuICAgICAgICAgIC8vIFdoZW4gdGFyZ2V0IGlzIHBlcnNpc3RlbnQtc2VsZWN0aW9uLCBuZXcgc2VsZWN0aW9uIGlzIGFkZGVkIGFmdGVyIHNlbGVjdFRleHRPYmplY3QuXG4gICAgICAgICAgLy8gU28gd2UgaGF2ZSB0byBhc3N1cmUgYWxsIHNlbGVjdGlvbiBoYXZlIHNlbGN0aW9uIHByb3BlcnR5LlxuICAgICAgICAgIC8vIE1heWJlIHRoaXMgbG9naWMgY2FuIGJlIG1vdmVkIHRvIG9wZXJhdGlvbiBzdGFjay5cbiAgICAgICAgICBmb3IgKGNvbnN0ICRzZWxlY3Rpb24gb2YgdGhpcy5zd3JhcC5nZXRTZWxlY3Rpb25zKHRoaXMuZWRpdG9yKSkge1xuICAgICAgICAgICAgaWYgKHRoaXMuZ2V0Q29uZmlnKFwic3RheU9uU2VsZWN0VGV4dE9iamVjdFwiKSkge1xuICAgICAgICAgICAgICBpZiAoISRzZWxlY3Rpb24uaGFzUHJvcGVydGllcygpKSAkc2VsZWN0aW9uLnNhdmVQcm9wZXJ0aWVzKClcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICRzZWxlY3Rpb24uc2F2ZVByb3BlcnRpZXMoKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgJHNlbGVjdGlvbi5maXhQcm9wZXJ0eVJvd1RvUm93UmFuZ2UoKVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5zdWJtb2RlID09PSBcImJsb2Nrd2lzZVwiKSB7XG4gICAgICAgIGZvciAoY29uc3QgJHNlbGVjdGlvbiBvZiB0aGlzLnN3cmFwLmdldFNlbGVjdGlvbnModGhpcy5lZGl0b3IpKSB7XG4gICAgICAgICAgJHNlbGVjdGlvbi5ub3JtYWxpemUoKVxuICAgICAgICAgICRzZWxlY3Rpb24uYXBwbHlXaXNlKFwiYmxvY2t3aXNlXCIpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyBSZXR1cm4gdHJ1ZSBvciBmYWxzZVxuICBzZWxlY3RUZXh0T2JqZWN0KHNlbGVjdGlvbikge1xuICAgIGNvbnN0IHJhbmdlID0gdGhpcy5nZXRSYW5nZShzZWxlY3Rpb24pXG4gICAgaWYgKHJhbmdlKSB7XG4gICAgICB0aGlzLnN3cmFwKHNlbGVjdGlvbikuc2V0QnVmZmVyUmFuZ2UocmFuZ2UpXG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG4gIH1cblxuICAvLyB0byBvdmVycmlkZVxuICBnZXRSYW5nZShzZWxlY3Rpb24pIHt9XG59XG5UZXh0T2JqZWN0LnJlZ2lzdGVyKGZhbHNlKVxuXG4vLyBTZWN0aW9uOiBXb3JkXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09XG5jbGFzcyBXb3JkIGV4dGVuZHMgVGV4dE9iamVjdCB7XG4gIGdldFJhbmdlKHNlbGVjdGlvbikge1xuICAgIGNvbnN0IHBvaW50ID0gdGhpcy5nZXRDdXJzb3JQb3NpdGlvbkZvclNlbGVjdGlvbihzZWxlY3Rpb24pXG4gICAgY29uc3Qge3JhbmdlfSA9IHRoaXMuZ2V0V29yZEJ1ZmZlclJhbmdlQW5kS2luZEF0QnVmZmVyUG9zaXRpb24ocG9pbnQsIHt3b3JkUmVnZXg6IHRoaXMud29yZFJlZ2V4fSlcbiAgICByZXR1cm4gdGhpcy5pc0EoKSA/IGV4cGFuZFJhbmdlVG9XaGl0ZVNwYWNlcyh0aGlzLmVkaXRvciwgcmFuZ2UpIDogcmFuZ2VcbiAgfVxufVxuV29yZC5yZWdpc3RlcihmYWxzZSwgdHJ1ZSlcblxuY2xhc3MgV2hvbGVXb3JkIGV4dGVuZHMgV29yZCB7XG4gIHdvcmRSZWdleCA9IC9cXFMrL1xufVxuV2hvbGVXb3JkLnJlZ2lzdGVyKGZhbHNlLCB0cnVlKVxuXG4vLyBKdXN0IGluY2x1ZGUgXywgLVxuY2xhc3MgU21hcnRXb3JkIGV4dGVuZHMgV29yZCB7XG4gIHdvcmRSZWdleCA9IC9bXFx3LV0rL1xufVxuU21hcnRXb3JkLnJlZ2lzdGVyKGZhbHNlLCB0cnVlKVxuXG4vLyBKdXN0IGluY2x1ZGUgXywgLVxuY2xhc3MgU3Vid29yZCBleHRlbmRzIFdvcmQge1xuICBnZXRSYW5nZShzZWxlY3Rpb24pIHtcbiAgICB0aGlzLndvcmRSZWdleCA9IHNlbGVjdGlvbi5jdXJzb3Iuc3Vid29yZFJlZ0V4cCgpXG4gICAgcmV0dXJuIHN1cGVyLmdldFJhbmdlKHNlbGVjdGlvbilcbiAgfVxufVxuU3Vid29yZC5yZWdpc3RlcihmYWxzZSwgdHJ1ZSlcblxuLy8gU2VjdGlvbjogUGFpclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PVxuY2xhc3MgUGFpciBleHRlbmRzIFRleHRPYmplY3Qge1xuICBzdXBwb3J0Q291bnQgPSB0cnVlXG4gIGFsbG93TmV4dExpbmUgPSBudWxsXG4gIGFkanVzdElubmVyUmFuZ2UgPSB0cnVlXG4gIHBhaXIgPSBudWxsXG4gIGluY2x1c2l2ZSA9IHRydWVcblxuICBjb25zdHJ1Y3RvciguLi5hcmdzKSB7XG4gICAgc3VwZXIoLi4uYXJncylcbiAgICBpZiAoIVBhaXJGaW5kZXIpIFBhaXJGaW5kZXIgPSByZXF1aXJlKFwiLi9wYWlyLWZpbmRlclwiKVxuICB9XG5cbiAgaXNBbGxvd05leHRMaW5lKCkge1xuICAgIHJldHVybiB0aGlzLmFsbG93TmV4dExpbmUgIT0gbnVsbCA/IHRoaXMuYWxsb3dOZXh0TGluZSA6IHRoaXMucGFpciAhPSBudWxsICYmIHRoaXMucGFpclswXSAhPT0gdGhpcy5wYWlyWzFdXG4gIH1cblxuICBhZGp1c3RSYW5nZSh7c3RhcnQsIGVuZH0pIHtcbiAgICAvLyBEaXJ0eSB3b3JrIHRvIGZlZWwgbmF0dXJhbCBmb3IgaHVtYW4sIHRvIGJlaGF2ZSBjb21wYXRpYmxlIHdpdGggcHVyZSBWaW0uXG4gICAgLy8gV2hlcmUgdGhpcyBhZGp1c3RtZW50IGFwcGVhciBpcyBpbiBmb2xsb3dpbmcgc2l0dWF0aW9uLlxuICAgIC8vIG9wLTE6IGBjaXtgIHJlcGxhY2Ugb25seSAybmQgbGluZVxuICAgIC8vIG9wLTI6IGBkaXtgIGRlbGV0ZSBvbmx5IDJuZCBsaW5lLlxuICAgIC8vIHRleHQ6XG4gICAgLy8gIHtcbiAgICAvLyAgICBhYWFcbiAgICAvLyAgfVxuICAgIGlmIChwb2ludElzQXRFbmRPZkxpbmUodGhpcy5lZGl0b3IsIHN0YXJ0KSkge1xuICAgICAgc3RhcnQgPSBzdGFydC50cmF2ZXJzZShbMSwgMF0pXG4gICAgfVxuXG4gICAgaWYgKGdldExpbmVUZXh0VG9CdWZmZXJQb3NpdGlvbih0aGlzLmVkaXRvciwgZW5kKS5tYXRjaCgvXlxccyokLykpIHtcbiAgICAgIGlmICh0aGlzLm1vZGUgPT09IFwidmlzdWFsXCIpIHtcbiAgICAgICAgLy8gVGhpcyBpcyBzbGlnaHRseSBpbm5jb25zaXN0ZW50IHdpdGggcmVndWxhciBWaW1cbiAgICAgICAgLy8gLSByZWd1bGFyIFZpbTogc2VsZWN0IG5ldyBsaW5lIGFmdGVyIEVPTFxuICAgICAgICAvLyAtIHZpbS1tb2RlLXBsdXM6IHNlbGVjdCB0byBFT0woYmVmb3JlIG5ldyBsaW5lKVxuICAgICAgICAvLyBUaGlzIGlzIGludGVudGlvbmFsIHNpbmNlIHRvIG1ha2Ugc3VibW9kZSBgY2hhcmFjdGVyd2lzZWAgd2hlbiBhdXRvLWRldGVjdCBzdWJtb2RlXG4gICAgICAgIC8vIGlubmVyRW5kID0gbmV3IFBvaW50KGlubmVyRW5kLnJvdyAtIDEsIEluZmluaXR5KVxuICAgICAgICBlbmQgPSBuZXcgUG9pbnQoZW5kLnJvdyAtIDEsIEluZmluaXR5KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZW5kID0gbmV3IFBvaW50KGVuZC5yb3csIDApXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBuZXcgUmFuZ2Uoc3RhcnQsIGVuZClcbiAgfVxuXG4gIGdldEZpbmRlcigpIHtcbiAgICBjb25zdCBmaW5kZXJOYW1lID0gdGhpcy5wYWlyWzBdID09PSB0aGlzLnBhaXJbMV0gPyBcIlF1b3RlRmluZGVyXCIgOiBcIkJyYWNrZXRGaW5kZXJcIlxuICAgIHJldHVybiBuZXcgUGFpckZpbmRlcltmaW5kZXJOYW1lXSh0aGlzLmVkaXRvciwge1xuICAgICAgYWxsb3dOZXh0TGluZTogdGhpcy5pc0FsbG93TmV4dExpbmUoKSxcbiAgICAgIGFsbG93Rm9yd2FyZGluZzogdGhpcy5hbGxvd0ZvcndhcmRpbmcsXG4gICAgICBwYWlyOiB0aGlzLnBhaXIsXG4gICAgICBpbmNsdXNpdmU6IHRoaXMuaW5jbHVzaXZlLFxuICAgIH0pXG4gIH1cblxuICBnZXRQYWlySW5mbyhmcm9tKSB7XG4gICAgY29uc3QgcGFpckluZm8gPSB0aGlzLmdldEZpbmRlcigpLmZpbmQoZnJvbSlcbiAgICBpZiAocGFpckluZm8pIHtcbiAgICAgIGlmICh0aGlzLmFkanVzdElubmVyUmFuZ2UpIHBhaXJJbmZvLmlubmVyUmFuZ2UgPSB0aGlzLmFkanVzdFJhbmdlKHBhaXJJbmZvLmlubmVyUmFuZ2UpXG4gICAgICBwYWlySW5mby50YXJnZXRSYW5nZSA9IHRoaXMuaXNJbm5lcigpID8gcGFpckluZm8uaW5uZXJSYW5nZSA6IHBhaXJJbmZvLmFSYW5nZVxuICAgICAgcmV0dXJuIHBhaXJJbmZvXG4gICAgfVxuICB9XG5cbiAgZ2V0UmFuZ2Uoc2VsZWN0aW9uKSB7XG4gICAgY29uc3Qgb3JpZ2luYWxSYW5nZSA9IHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpXG4gICAgbGV0IHBhaXJJbmZvID0gdGhpcy5nZXRQYWlySW5mbyh0aGlzLmdldEN1cnNvclBvc2l0aW9uRm9yU2VsZWN0aW9uKHNlbGVjdGlvbikpXG4gICAgLy8gV2hlbiByYW5nZSB3YXMgc2FtZSwgdHJ5IHRvIGV4cGFuZCByYW5nZVxuICAgIGlmIChwYWlySW5mbyAmJiBwYWlySW5mby50YXJnZXRSYW5nZS5pc0VxdWFsKG9yaWdpbmFsUmFuZ2UpKSB7XG4gICAgICBwYWlySW5mbyA9IHRoaXMuZ2V0UGFpckluZm8ocGFpckluZm8uYVJhbmdlLmVuZClcbiAgICB9XG4gICAgaWYgKHBhaXJJbmZvKSByZXR1cm4gcGFpckluZm8udGFyZ2V0UmFuZ2VcbiAgfVxufVxuUGFpci5yZWdpc3RlcihmYWxzZSlcblxuLy8gVXNlZCBieSBEZWxldGVTdXJyb3VuZFxuY2xhc3MgQVBhaXIgZXh0ZW5kcyBQYWlyIHt9XG5BUGFpci5yZWdpc3RlcihmYWxzZSlcblxuY2xhc3MgQW55UGFpciBleHRlbmRzIFBhaXIge1xuICBhbGxvd0ZvcndhcmRpbmcgPSBmYWxzZVxuICBtZW1iZXIgPSBbXCJEb3VibGVRdW90ZVwiLCBcIlNpbmdsZVF1b3RlXCIsIFwiQmFja1RpY2tcIiwgXCJDdXJseUJyYWNrZXRcIiwgXCJBbmdsZUJyYWNrZXRcIiwgXCJTcXVhcmVCcmFja2V0XCIsIFwiUGFyZW50aGVzaXNcIl1cblxuICBnZXRSYW5nZXMoc2VsZWN0aW9uKSB7XG4gICAgY29uc3Qgb3B0aW9ucyA9IHtpbm5lcjogdGhpcy5pbm5lciwgYWxsb3dGb3J3YXJkaW5nOiB0aGlzLmFsbG93Rm9yd2FyZGluZywgaW5jbHVzaXZlOiB0aGlzLmluY2x1c2l2ZX1cbiAgICByZXR1cm4gdGhpcy5tZW1iZXIubWFwKG1lbWJlciA9PiB0aGlzLmdldEluc3RhbmNlKG1lbWJlciwgb3B0aW9ucykuZ2V0UmFuZ2Uoc2VsZWN0aW9uKSkuZmlsdGVyKHJhbmdlID0+IHJhbmdlKVxuICB9XG5cbiAgZ2V0UmFuZ2Uoc2VsZWN0aW9uKSB7XG4gICAgcmV0dXJuIF8ubGFzdChzb3J0UmFuZ2VzKHRoaXMuZ2V0UmFuZ2VzKHNlbGVjdGlvbikpKVxuICB9XG59XG5BbnlQYWlyLnJlZ2lzdGVyKGZhbHNlLCB0cnVlKVxuXG5jbGFzcyBBbnlQYWlyQWxsb3dGb3J3YXJkaW5nIGV4dGVuZHMgQW55UGFpciB7XG4gIGFsbG93Rm9yd2FyZGluZyA9IHRydWVcblxuICBnZXRSYW5nZShzZWxlY3Rpb24pIHtcbiAgICBjb25zdCByYW5nZXMgPSB0aGlzLmdldFJhbmdlcyhzZWxlY3Rpb24pXG4gICAgY29uc3QgZnJvbSA9IHNlbGVjdGlvbi5jdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuICAgIGxldCBbZm9yd2FyZGluZ1JhbmdlcywgZW5jbG9zaW5nUmFuZ2VzXSA9IF8ucGFydGl0aW9uKHJhbmdlcywgcmFuZ2UgPT4gcmFuZ2Uuc3RhcnQuaXNHcmVhdGVyVGhhbk9yRXF1YWwoZnJvbSkpXG4gICAgY29uc3QgZW5jbG9zaW5nUmFuZ2UgPSBfLmxhc3Qoc29ydFJhbmdlcyhlbmNsb3NpbmdSYW5nZXMpKVxuICAgIGZvcndhcmRpbmdSYW5nZXMgPSBzb3J0UmFuZ2VzKGZvcndhcmRpbmdSYW5nZXMpXG5cbiAgICAvLyBXaGVuIGVuY2xvc2luZ1JhbmdlIGlzIGV4aXN0cyxcbiAgICAvLyBXZSBkb24ndCBnbyBhY3Jvc3MgZW5jbG9zaW5nUmFuZ2UuZW5kLlxuICAgIC8vIFNvIGNob29zZSBmcm9tIHJhbmdlcyBjb250YWluZWQgaW4gZW5jbG9zaW5nUmFuZ2UuXG4gICAgaWYgKGVuY2xvc2luZ1JhbmdlKSB7XG4gICAgICBmb3J3YXJkaW5nUmFuZ2VzID0gZm9yd2FyZGluZ1Jhbmdlcy5maWx0ZXIocmFuZ2UgPT4gZW5jbG9zaW5nUmFuZ2UuY29udGFpbnNSYW5nZShyYW5nZSkpXG4gICAgfVxuXG4gICAgcmV0dXJuIGZvcndhcmRpbmdSYW5nZXNbMF0gfHwgZW5jbG9zaW5nUmFuZ2VcbiAgfVxufVxuQW55UGFpckFsbG93Rm9yd2FyZGluZy5yZWdpc3RlcihmYWxzZSwgdHJ1ZSlcblxuY2xhc3MgQW55UXVvdGUgZXh0ZW5kcyBBbnlQYWlyIHtcbiAgYWxsb3dGb3J3YXJkaW5nID0gdHJ1ZVxuICBtZW1iZXIgPSBbXCJEb3VibGVRdW90ZVwiLCBcIlNpbmdsZVF1b3RlXCIsIFwiQmFja1RpY2tcIl1cblxuICBnZXRSYW5nZShzZWxlY3Rpb24pIHtcbiAgICBjb25zdCByYW5nZXMgPSB0aGlzLmdldFJhbmdlcyhzZWxlY3Rpb24pXG4gICAgLy8gUGljayByYW5nZSB3aGljaCBlbmQuY29sdW0gaXMgbGVmdG1vc3QobWVhbiwgY2xvc2VkIGZpcnN0KVxuICAgIGlmIChyYW5nZXMubGVuZ3RoKSByZXR1cm4gXy5maXJzdChfLnNvcnRCeShyYW5nZXMsIHIgPT4gci5lbmQuY29sdW1uKSlcbiAgfVxufVxuQW55UXVvdGUucmVnaXN0ZXIoZmFsc2UsIHRydWUpXG5cbmNsYXNzIFF1b3RlIGV4dGVuZHMgUGFpciB7XG4gIGFsbG93Rm9yd2FyZGluZyA9IHRydWVcbn1cblF1b3RlLnJlZ2lzdGVyKGZhbHNlKVxuXG5jbGFzcyBEb3VibGVRdW90ZSBleHRlbmRzIFF1b3RlIHtcbiAgcGFpciA9IFsnXCInLCAnXCInXVxufVxuRG91YmxlUXVvdGUucmVnaXN0ZXIoZmFsc2UsIHRydWUpXG5cbmNsYXNzIFNpbmdsZVF1b3RlIGV4dGVuZHMgUXVvdGUge1xuICBwYWlyID0gW1wiJ1wiLCBcIidcIl1cbn1cblNpbmdsZVF1b3RlLnJlZ2lzdGVyKGZhbHNlLCB0cnVlKVxuXG5jbGFzcyBCYWNrVGljayBleHRlbmRzIFF1b3RlIHtcbiAgcGFpciA9IFtcImBcIiwgXCJgXCJdXG59XG5CYWNrVGljay5yZWdpc3RlcihmYWxzZSwgdHJ1ZSlcblxuY2xhc3MgQ3VybHlCcmFja2V0IGV4dGVuZHMgUGFpciB7XG4gIHBhaXIgPSBbXCJ7XCIsIFwifVwiXVxufVxuQ3VybHlCcmFja2V0LnJlZ2lzdGVyKGZhbHNlLCB0cnVlLCB0cnVlKVxuXG5jbGFzcyBTcXVhcmVCcmFja2V0IGV4dGVuZHMgUGFpciB7XG4gIHBhaXIgPSBbXCJbXCIsIFwiXVwiXVxufVxuU3F1YXJlQnJhY2tldC5yZWdpc3RlcihmYWxzZSwgdHJ1ZSwgdHJ1ZSlcblxuY2xhc3MgUGFyZW50aGVzaXMgZXh0ZW5kcyBQYWlyIHtcbiAgcGFpciA9IFtcIihcIiwgXCIpXCJdXG59XG5QYXJlbnRoZXNpcy5yZWdpc3RlcihmYWxzZSwgdHJ1ZSwgdHJ1ZSlcblxuY2xhc3MgQW5nbGVCcmFja2V0IGV4dGVuZHMgUGFpciB7XG4gIHBhaXIgPSBbXCI8XCIsIFwiPlwiXVxufVxuQW5nbGVCcmFja2V0LnJlZ2lzdGVyKGZhbHNlLCB0cnVlLCB0cnVlKVxuXG5jbGFzcyBUYWcgZXh0ZW5kcyBQYWlyIHtcbiAgYWxsb3dOZXh0TGluZSA9IHRydWVcbiAgYWxsb3dGb3J3YXJkaW5nID0gdHJ1ZVxuICBhZGp1c3RJbm5lclJhbmdlID0gZmFsc2VcblxuICBnZXRUYWdTdGFydFBvaW50KGZyb20pIHtcbiAgICBsZXQgdGFnUmFuZ2VcbiAgICBjb25zdCB7cGF0dGVybn0gPSBQYWlyRmluZGVyLlRhZ0ZpbmRlclxuICAgIHRoaXMuc2NhbkZvcndhcmQocGF0dGVybiwge2Zyb206IFtmcm9tLnJvdywgMF19LCAoe3JhbmdlLCBzdG9wfSkgPT4ge1xuICAgICAgaWYgKHJhbmdlLmNvbnRhaW5zUG9pbnQoZnJvbSwgdHJ1ZSkpIHtcbiAgICAgICAgdGFnUmFuZ2UgPSByYW5nZVxuICAgICAgICBzdG9wKClcbiAgICAgIH1cbiAgICB9KVxuICAgIGlmICh0YWdSYW5nZSkgcmV0dXJuIHRhZ1JhbmdlLnN0YXJ0XG4gIH1cblxuICBnZXRGaW5kZXIoKSB7XG4gICAgcmV0dXJuIG5ldyBQYWlyRmluZGVyLlRhZ0ZpbmRlcih0aGlzLmVkaXRvciwge1xuICAgICAgYWxsb3dOZXh0TGluZTogdGhpcy5pc0FsbG93TmV4dExpbmUoKSxcbiAgICAgIGFsbG93Rm9yd2FyZGluZzogdGhpcy5hbGxvd0ZvcndhcmRpbmcsXG4gICAgICBpbmNsdXNpdmU6IHRoaXMuaW5jbHVzaXZlLFxuICAgIH0pXG4gIH1cblxuICBnZXRQYWlySW5mbyhmcm9tKSB7XG4gICAgcmV0dXJuIHN1cGVyLmdldFBhaXJJbmZvKHRoaXMuZ2V0VGFnU3RhcnRQb2ludChmcm9tKSB8fCBmcm9tKVxuICB9XG59XG5UYWcucmVnaXN0ZXIoZmFsc2UsIHRydWUpXG5cbi8vIFNlY3Rpb246IFBhcmFncmFwaFxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gUGFyYWdyYXBoIGlzIGRlZmluZWQgYXMgY29uc2VjdXRpdmUgKG5vbi0pYmxhbmstbGluZS5cbmNsYXNzIFBhcmFncmFwaCBleHRlbmRzIFRleHRPYmplY3Qge1xuICB3aXNlID0gXCJsaW5ld2lzZVwiXG4gIHN1cHBvcnRDb3VudCA9IHRydWVcblxuICBmaW5kUm93KGZyb21Sb3csIGRpcmVjdGlvbiwgZm4pIHtcbiAgICBpZiAoZm4ucmVzZXQpIGZuLnJlc2V0KClcbiAgICBsZXQgZm91bmRSb3cgPSBmcm9tUm93XG4gICAgZm9yIChjb25zdCByb3cgb2YgZ2V0QnVmZmVyUm93cyh0aGlzLmVkaXRvciwge3N0YXJ0Um93OiBmcm9tUm93LCBkaXJlY3Rpb259KSkge1xuICAgICAgaWYgKCFmbihyb3csIGRpcmVjdGlvbikpIGJyZWFrXG4gICAgICBmb3VuZFJvdyA9IHJvd1xuICAgIH1cbiAgICByZXR1cm4gZm91bmRSb3dcbiAgfVxuXG4gIGZpbmRSb3dSYW5nZUJ5KGZyb21Sb3csIGZuKSB7XG4gICAgY29uc3Qgc3RhcnRSb3cgPSB0aGlzLmZpbmRSb3coZnJvbVJvdywgXCJwcmV2aW91c1wiLCBmbilcbiAgICBjb25zdCBlbmRSb3cgPSB0aGlzLmZpbmRSb3coZnJvbVJvdywgXCJuZXh0XCIsIGZuKVxuICAgIHJldHVybiBbc3RhcnRSb3csIGVuZFJvd11cbiAgfVxuXG4gIGdldFByZWRpY3RGdW5jdGlvbihmcm9tUm93LCBzZWxlY3Rpb24pIHtcbiAgICBjb25zdCBmcm9tUm93UmVzdWx0ID0gdGhpcy5lZGl0b3IuaXNCdWZmZXJSb3dCbGFuayhmcm9tUm93KVxuXG4gICAgaWYgKHRoaXMuaXNJbm5lcigpKSB7XG4gICAgICByZXR1cm4gKHJvdywgZGlyZWN0aW9uKSA9PiB0aGlzLmVkaXRvci5pc0J1ZmZlclJvd0JsYW5rKHJvdykgPT09IGZyb21Sb3dSZXN1bHRcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgZGlyZWN0aW9uVG9FeHRlbmQgPSBzZWxlY3Rpb24uaXNSZXZlcnNlZCgpID8gXCJwcmV2aW91c1wiIDogXCJuZXh0XCJcblxuICAgICAgbGV0IGZsaXAgPSBmYWxzZVxuICAgICAgY29uc3QgcHJlZGljdCA9IChyb3csIGRpcmVjdGlvbikgPT4ge1xuICAgICAgICBjb25zdCByZXN1bHQgPSB0aGlzLmVkaXRvci5pc0J1ZmZlclJvd0JsYW5rKHJvdykgPT09IGZyb21Sb3dSZXN1bHRcbiAgICAgICAgaWYgKGZsaXApIHtcbiAgICAgICAgICByZXR1cm4gIXJlc3VsdFxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmICghcmVzdWx0ICYmIGRpcmVjdGlvbiA9PT0gZGlyZWN0aW9uVG9FeHRlbmQpIHtcbiAgICAgICAgICAgIHJldHVybiAoZmxpcCA9IHRydWUpXG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiByZXN1bHRcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcHJlZGljdC5yZXNldCA9ICgpID0+IChmbGlwID0gZmFsc2UpXG4gICAgICByZXR1cm4gcHJlZGljdFxuICAgIH1cbiAgfVxuXG4gIGdldFJhbmdlKHNlbGVjdGlvbikge1xuICAgIGNvbnN0IG9yaWdpbmFsUmFuZ2UgPSBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKVxuICAgIGxldCBmcm9tUm93ID0gdGhpcy5nZXRDdXJzb3JQb3NpdGlvbkZvclNlbGVjdGlvbihzZWxlY3Rpb24pLnJvd1xuICAgIGlmICh0aGlzLmlzTW9kZShcInZpc3VhbFwiLCBcImxpbmV3aXNlXCIpKSB7XG4gICAgICBpZiAoc2VsZWN0aW9uLmlzUmV2ZXJzZWQoKSkgZnJvbVJvdy0tXG4gICAgICBlbHNlIGZyb21Sb3crK1xuICAgICAgZnJvbVJvdyA9IGdldFZhbGlkVmltQnVmZmVyUm93KHRoaXMuZWRpdG9yLCBmcm9tUm93KVxuICAgIH1cbiAgICBjb25zdCByb3dSYW5nZSA9IHRoaXMuZmluZFJvd1JhbmdlQnkoZnJvbVJvdywgdGhpcy5nZXRQcmVkaWN0RnVuY3Rpb24oZnJvbVJvdywgc2VsZWN0aW9uKSlcbiAgICByZXR1cm4gc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKCkudW5pb24odGhpcy5nZXRCdWZmZXJSYW5nZUZvclJvd1JhbmdlKHJvd1JhbmdlKSlcbiAgfVxufVxuUGFyYWdyYXBoLnJlZ2lzdGVyKGZhbHNlLCB0cnVlKVxuXG5jbGFzcyBJbmRlbnRhdGlvbiBleHRlbmRzIFBhcmFncmFwaCB7XG4gIGdldFJhbmdlKHNlbGVjdGlvbikge1xuICAgIGNvbnN0IGZyb21Sb3cgPSB0aGlzLmdldEN1cnNvclBvc2l0aW9uRm9yU2VsZWN0aW9uKHNlbGVjdGlvbikucm93XG4gICAgY29uc3QgYmFzZUluZGVudExldmVsID0gdGhpcy5lZGl0b3IuaW5kZW50YXRpb25Gb3JCdWZmZXJSb3coZnJvbVJvdylcbiAgICBjb25zdCByb3dSYW5nZSA9IHRoaXMuZmluZFJvd1JhbmdlQnkoZnJvbVJvdywgcm93ID0+IHtcbiAgICAgIHJldHVybiB0aGlzLmVkaXRvci5pc0J1ZmZlclJvd0JsYW5rKHJvdylcbiAgICAgICAgPyB0aGlzLmlzQSgpXG4gICAgICAgIDogdGhpcy5lZGl0b3IuaW5kZW50YXRpb25Gb3JCdWZmZXJSb3cocm93KSA+PSBiYXNlSW5kZW50TGV2ZWxcbiAgICB9KVxuICAgIHJldHVybiB0aGlzLmdldEJ1ZmZlclJhbmdlRm9yUm93UmFuZ2Uocm93UmFuZ2UpXG4gIH1cbn1cbkluZGVudGF0aW9uLnJlZ2lzdGVyKGZhbHNlLCB0cnVlKVxuXG4vLyBTZWN0aW9uOiBDb21tZW50XG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09XG5jbGFzcyBDb21tZW50IGV4dGVuZHMgVGV4dE9iamVjdCB7XG4gIHdpc2UgPSBcImxpbmV3aXNlXCJcblxuICBnZXRSYW5nZShzZWxlY3Rpb24pIHtcbiAgICBjb25zdCB7cm93fSA9IHRoaXMuZ2V0Q3Vyc29yUG9zaXRpb25Gb3JTZWxlY3Rpb24oc2VsZWN0aW9uKVxuICAgIGNvbnN0IHJvd1JhbmdlID0gdGhpcy51dGlscy5nZXRSb3dSYW5nZUZvckNvbW1lbnRBdEJ1ZmZlclJvdyh0aGlzLmVkaXRvciwgcm93KVxuICAgIGlmIChyb3dSYW5nZSkge1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0QnVmZmVyUmFuZ2VGb3JSb3dSYW5nZShyb3dSYW5nZSlcbiAgICB9XG4gIH1cbn1cbkNvbW1lbnQucmVnaXN0ZXIoZmFsc2UsIHRydWUpXG5cbmNsYXNzIENvbW1lbnRPclBhcmFncmFwaCBleHRlbmRzIFRleHRPYmplY3Qge1xuICB3aXNlID0gXCJsaW5ld2lzZVwiXG5cbiAgZ2V0UmFuZ2Uoc2VsZWN0aW9uKSB7XG4gICAgY29uc3Qge2lubmVyfSA9IHRoaXNcbiAgICBmb3IgKGNvbnN0IGtsYXNzIG9mIFtcIkNvbW1lbnRcIiwgXCJQYXJhZ3JhcGhcIl0pIHtcbiAgICAgIGNvbnN0IHJhbmdlID0gdGhpcy5nZXRJbnN0YW5jZShrbGFzcywge2lubmVyfSkuZ2V0UmFuZ2Uoc2VsZWN0aW9uKVxuICAgICAgaWYgKHJhbmdlKSByZXR1cm4gcmFuZ2VcbiAgICB9XG4gIH1cbn1cbkNvbW1lbnRPclBhcmFncmFwaC5yZWdpc3RlcihmYWxzZSwgdHJ1ZSlcblxuLy8gU2VjdGlvbjogRm9sZFxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PVxuY2xhc3MgRm9sZCBleHRlbmRzIFRleHRPYmplY3Qge1xuICB3aXNlID0gXCJsaW5ld2lzZVwiXG5cbiAgYWRqdXN0Um93UmFuZ2Uocm93UmFuZ2UpIHtcbiAgICBpZiAodGhpcy5pc0EoKSkgcmV0dXJuIHJvd1JhbmdlXG5cbiAgICBsZXQgW3N0YXJ0Um93LCBlbmRSb3ddID0gcm93UmFuZ2VcbiAgICBpZiAodGhpcy5lZGl0b3IuaW5kZW50YXRpb25Gb3JCdWZmZXJSb3coc3RhcnRSb3cpID09PSB0aGlzLmVkaXRvci5pbmRlbnRhdGlvbkZvckJ1ZmZlclJvdyhlbmRSb3cpKSB7XG4gICAgICBlbmRSb3cgLT0gMVxuICAgIH1cbiAgICBzdGFydFJvdyArPSAxXG4gICAgcmV0dXJuIFtzdGFydFJvdywgZW5kUm93XVxuICB9XG5cbiAgZ2V0Rm9sZFJvd1Jhbmdlc0NvbnRhaW5zRm9yUm93KHJvdykge1xuICAgIHJldHVybiBnZXRDb2RlRm9sZFJvd1Jhbmdlc0NvbnRhaW5lc0ZvclJvdyh0aGlzLmVkaXRvciwgcm93KS5yZXZlcnNlKClcbiAgfVxuXG4gIGdldFJhbmdlKHNlbGVjdGlvbikge1xuICAgIGNvbnN0IHtyb3d9ID0gdGhpcy5nZXRDdXJzb3JQb3NpdGlvbkZvclNlbGVjdGlvbihzZWxlY3Rpb24pXG4gICAgY29uc3Qgc2VsZWN0ZWRSYW5nZSA9IHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpXG4gICAgZm9yIChjb25zdCByb3dSYW5nZSBvZiB0aGlzLmdldEZvbGRSb3dSYW5nZXNDb250YWluc0ZvclJvdyhyb3cpKSB7XG4gICAgICBjb25zdCByYW5nZSA9IHRoaXMuZ2V0QnVmZmVyUmFuZ2VGb3JSb3dSYW5nZSh0aGlzLmFkanVzdFJvd1JhbmdlKHJvd1JhbmdlKSlcblxuICAgICAgLy8gRG9uJ3QgY2hhbmdlIHRvIGBpZiByYW5nZS5jb250YWluc1JhbmdlKHNlbGVjdGVkUmFuZ2UsIHRydWUpYFxuICAgICAgLy8gVGhlcmUgaXMgYmVoYXZpb3IgZGlmZiB3aGVuIGN1cnNvciBpcyBhdCBiZWdpbm5pbmcgb2YgbGluZSggY29sdW1uIDAgKS5cbiAgICAgIGlmICghc2VsZWN0ZWRSYW5nZS5jb250YWluc1JhbmdlKHJhbmdlKSkgcmV0dXJuIHJhbmdlXG4gICAgfVxuICB9XG59XG5Gb2xkLnJlZ2lzdGVyKGZhbHNlLCB0cnVlKVxuXG4vLyBOT1RFOiBGdW5jdGlvbiByYW5nZSBkZXRlcm1pbmF0aW9uIGlzIGRlcGVuZGluZyBvbiBmb2xkLlxuY2xhc3MgRnVuY3Rpb24gZXh0ZW5kcyBGb2xkIHtcbiAgLy8gU29tZSBsYW5ndWFnZSBkb24ndCBpbmNsdWRlIGNsb3NpbmcgYH1gIGludG8gZm9sZC5cbiAgc2NvcGVOYW1lc09taXR0aW5nRW5kUm93ID0gW1wic291cmNlLmdvXCIsIFwic291cmNlLmVsaXhpclwiXVxuXG4gIGlzR3JhbW1hck5vdEZvbGRFbmRSb3coKSB7XG4gICAgY29uc3Qge3Njb3BlTmFtZSwgcGFja2FnZU5hbWV9ID0gdGhpcy5lZGl0b3IuZ2V0R3JhbW1hcigpXG4gICAgaWYgKHRoaXMuc2NvcGVOYW1lc09taXR0aW5nRW5kUm93LmluY2x1ZGVzKHNjb3BlTmFtZSkpIHtcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIEhBQ0s6IFJ1c3QgaGF2ZSB0d28gcGFja2FnZSBgbGFuZ3VhZ2UtcnVzdGAgYW5kIGBhdG9tLWxhbmd1YWdlLXJ1c3RgXG4gICAgICAvLyBsYW5ndWFnZS1ydXN0IGRvbid0IGZvbGQgZW5kaW5nIGB9YCwgYnV0IGF0b20tbGFuZ3VhZ2UtcnVzdCBkb2VzLlxuICAgICAgcmV0dXJuIHNjb3BlTmFtZSA9PT0gXCJzb3VyY2UucnVzdFwiICYmIHBhY2thZ2VOYW1lID09PSBcImxhbmd1YWdlLXJ1c3RcIlxuICAgIH1cbiAgfVxuXG4gIGdldEZvbGRSb3dSYW5nZXNDb250YWluc0ZvclJvdyhyb3cpIHtcbiAgICByZXR1cm4gc3VwZXIuZ2V0Rm9sZFJvd1Jhbmdlc0NvbnRhaW5zRm9yUm93KHJvdykuZmlsdGVyKHJvd1JhbmdlID0+IHtcbiAgICAgIHJldHVybiBpc0luY2x1ZGVGdW5jdGlvblNjb3BlRm9yUm93KHRoaXMuZWRpdG9yLCByb3dSYW5nZVswXSlcbiAgICB9KVxuICB9XG5cbiAgYWRqdXN0Um93UmFuZ2Uocm93UmFuZ2UpIHtcbiAgICBsZXQgW3N0YXJ0Um93LCBlbmRSb3ddID0gc3VwZXIuYWRqdXN0Um93UmFuZ2Uocm93UmFuZ2UpXG4gICAgLy8gTk9URTogVGhpcyBhZGp1c3RtZW50IHNob3VkIG5vdCBiZSBuZWNlc3NhcnkgaWYgbGFuZ3VhZ2Utc3ludGF4IGlzIHByb3Blcmx5IGRlZmluZWQuXG4gICAgaWYgKHRoaXMuaXNBKCkgJiYgdGhpcy5pc0dyYW1tYXJOb3RGb2xkRW5kUm93KCkpIGVuZFJvdyArPSAxXG4gICAgcmV0dXJuIFtzdGFydFJvdywgZW5kUm93XVxuICB9XG59XG5GdW5jdGlvbi5yZWdpc3RlcihmYWxzZSwgdHJ1ZSlcblxuLy8gU2VjdGlvbjogT3RoZXJcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIEFyZ3VtZW50cyBleHRlbmRzIFRleHRPYmplY3Qge1xuICBuZXdBcmdJbmZvKGFyZ1N0YXJ0LCBhcmcsIHNlcGFyYXRvcikge1xuICAgIGNvbnN0IGFyZ0VuZCA9IHRyYXZlcnNlVGV4dEZyb21Qb2ludChhcmdTdGFydCwgYXJnKVxuICAgIGNvbnN0IGFyZ1JhbmdlID0gbmV3IFJhbmdlKGFyZ1N0YXJ0LCBhcmdFbmQpXG5cbiAgICBjb25zdCBzZXBhcmF0b3JFbmQgPSB0cmF2ZXJzZVRleHRGcm9tUG9pbnQoYXJnRW5kLCBzZXBhcmF0b3IgIT0gbnVsbCA/IHNlcGFyYXRvciA6IFwiXCIpXG4gICAgY29uc3Qgc2VwYXJhdG9yUmFuZ2UgPSBuZXcgUmFuZ2UoYXJnRW5kLCBzZXBhcmF0b3JFbmQpXG5cbiAgICBjb25zdCBpbm5lclJhbmdlID0gYXJnUmFuZ2VcbiAgICBjb25zdCBhUmFuZ2UgPSBhcmdSYW5nZS51bmlvbihzZXBhcmF0b3JSYW5nZSlcbiAgICByZXR1cm4ge2FyZ1JhbmdlLCBzZXBhcmF0b3JSYW5nZSwgaW5uZXJSYW5nZSwgYVJhbmdlfVxuICB9XG5cbiAgZ2V0QXJndW1lbnRzUmFuZ2VGb3JTZWxlY3Rpb24oc2VsZWN0aW9uKSB7XG4gICAgY29uc3Qgb3B0aW9ucyA9IHtcbiAgICAgIG1lbWJlcjogW1wiQ3VybHlCcmFja2V0XCIsIFwiU3F1YXJlQnJhY2tldFwiLCBcIlBhcmVudGhlc2lzXCJdLFxuICAgICAgaW5jbHVzaXZlOiBmYWxzZSxcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZ2V0SW5zdGFuY2UoXCJJbm5lckFueVBhaXJcIiwgb3B0aW9ucykuZ2V0UmFuZ2Uoc2VsZWN0aW9uKVxuICB9XG5cbiAgZ2V0UmFuZ2Uoc2VsZWN0aW9uKSB7XG4gICAgbGV0IHJhbmdlID0gdGhpcy5nZXRBcmd1bWVudHNSYW5nZUZvclNlbGVjdGlvbihzZWxlY3Rpb24pXG4gICAgY29uc3QgcGFpclJhbmdlRm91bmQgPSByYW5nZSAhPSBudWxsXG5cbiAgICByYW5nZSA9IHJhbmdlIHx8IHRoaXMuZ2V0SW5zdGFuY2UoXCJJbm5lckN1cnJlbnRMaW5lXCIpLmdldFJhbmdlKHNlbGVjdGlvbikgLy8gZmFsbGJhY2tcbiAgICBpZiAoIXJhbmdlKSByZXR1cm5cblxuICAgIHJhbmdlID0gdHJpbVJhbmdlKHRoaXMuZWRpdG9yLCByYW5nZSlcblxuICAgIGNvbnN0IHRleHQgPSB0aGlzLmVkaXRvci5nZXRUZXh0SW5CdWZmZXJSYW5nZShyYW5nZSlcbiAgICBjb25zdCBhbGxUb2tlbnMgPSBzcGxpdEFyZ3VtZW50cyh0ZXh0LCBwYWlyUmFuZ2VGb3VuZClcblxuICAgIGNvbnN0IGFyZ0luZm9zID0gW11cbiAgICBsZXQgYXJnU3RhcnQgPSByYW5nZS5zdGFydFxuXG4gICAgLy8gU2tpcCBzdGFydGluZyBzZXBhcmF0b3JcbiAgICBpZiAoYWxsVG9rZW5zLmxlbmd0aCAmJiBhbGxUb2tlbnNbMF0udHlwZSA9PT0gXCJzZXBhcmF0b3JcIikge1xuICAgICAgY29uc3QgdG9rZW4gPSBhbGxUb2tlbnMuc2hpZnQoKVxuICAgICAgYXJnU3RhcnQgPSB0cmF2ZXJzZVRleHRGcm9tUG9pbnQoYXJnU3RhcnQsIHRva2VuLnRleHQpXG4gICAgfVxuXG4gICAgd2hpbGUgKGFsbFRva2Vucy5sZW5ndGgpIHtcbiAgICAgIGNvbnN0IHRva2VuID0gYWxsVG9rZW5zLnNoaWZ0KClcbiAgICAgIGlmICh0b2tlbi50eXBlID09PSBcImFyZ3VtZW50XCIpIHtcbiAgICAgICAgY29uc3QgbmV4dFRva2VuID0gYWxsVG9rZW5zLnNoaWZ0KClcbiAgICAgICAgY29uc3Qgc2VwYXJhdG9yID0gbmV4dFRva2VuID8gbmV4dFRva2VuLnRleHQgOiB1bmRlZmluZWRcbiAgICAgICAgY29uc3QgYXJnSW5mbyA9IHRoaXMubmV3QXJnSW5mbyhhcmdTdGFydCwgdG9rZW4udGV4dCwgc2VwYXJhdG9yKVxuXG4gICAgICAgIGlmIChhbGxUb2tlbnMubGVuZ3RoID09PSAwICYmIGFyZ0luZm9zLmxlbmd0aCkge1xuICAgICAgICAgIGFyZ0luZm8uYVJhbmdlID0gYXJnSW5mby5hcmdSYW5nZS51bmlvbihfLmxhc3QoYXJnSW5mb3MpLnNlcGFyYXRvclJhbmdlKVxuICAgICAgICB9XG5cbiAgICAgICAgYXJnU3RhcnQgPSBhcmdJbmZvLmFSYW5nZS5lbmRcbiAgICAgICAgYXJnSW5mb3MucHVzaChhcmdJbmZvKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwibXVzdCBub3QgaGFwcGVuXCIpXG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgcG9pbnQgPSB0aGlzLmdldEN1cnNvclBvc2l0aW9uRm9yU2VsZWN0aW9uKHNlbGVjdGlvbilcbiAgICBmb3IgKGNvbnN0IHtpbm5lclJhbmdlLCBhUmFuZ2V9IG9mIGFyZ0luZm9zKSB7XG4gICAgICBpZiAoaW5uZXJSYW5nZS5lbmQuaXNHcmVhdGVyVGhhbk9yRXF1YWwocG9pbnQpKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmlzSW5uZXIoKSA/IGlubmVyUmFuZ2UgOiBhUmFuZ2VcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cbkFyZ3VtZW50cy5yZWdpc3RlcihmYWxzZSwgdHJ1ZSlcblxuY2xhc3MgQ3VycmVudExpbmUgZXh0ZW5kcyBUZXh0T2JqZWN0IHtcbiAgZ2V0UmFuZ2Uoc2VsZWN0aW9uKSB7XG4gICAgY29uc3Qge3Jvd30gPSB0aGlzLmdldEN1cnNvclBvc2l0aW9uRm9yU2VsZWN0aW9uKHNlbGVjdGlvbilcbiAgICBjb25zdCByYW5nZSA9IHRoaXMuZWRpdG9yLmJ1ZmZlclJhbmdlRm9yQnVmZmVyUm93KHJvdylcbiAgICByZXR1cm4gdGhpcy5pc0EoKSA/IHJhbmdlIDogdHJpbVJhbmdlKHRoaXMuZWRpdG9yLCByYW5nZSlcbiAgfVxufVxuQ3VycmVudExpbmUucmVnaXN0ZXIoZmFsc2UsIHRydWUpXG5cbmNsYXNzIEVudGlyZSBleHRlbmRzIFRleHRPYmplY3Qge1xuICB3aXNlID0gXCJsaW5ld2lzZVwiXG4gIHNlbGVjdE9uY2UgPSB0cnVlXG5cbiAgZ2V0UmFuZ2Uoc2VsZWN0aW9uKSB7XG4gICAgcmV0dXJuIHRoaXMuZWRpdG9yLmJ1ZmZlci5nZXRSYW5nZSgpXG4gIH1cbn1cbkVudGlyZS5yZWdpc3RlcihmYWxzZSwgdHJ1ZSlcblxuY2xhc3MgRW1wdHkgZXh0ZW5kcyBUZXh0T2JqZWN0IHtcbiAgc2VsZWN0T25jZSA9IHRydWVcbn1cbkVtcHR5LnJlZ2lzdGVyKGZhbHNlKVxuXG5jbGFzcyBMYXRlc3RDaGFuZ2UgZXh0ZW5kcyBUZXh0T2JqZWN0IHtcbiAgd2lzZSA9IG51bGxcbiAgc2VsZWN0T25jZSA9IHRydWVcbiAgZ2V0UmFuZ2Uoc2VsZWN0aW9uKSB7XG4gICAgY29uc3Qgc3RhcnQgPSB0aGlzLnZpbVN0YXRlLm1hcmsuZ2V0KFwiW1wiKVxuICAgIGNvbnN0IGVuZCA9IHRoaXMudmltU3RhdGUubWFyay5nZXQoXCJdXCIpXG4gICAgaWYgKHN0YXJ0ICYmIGVuZCkge1xuICAgICAgcmV0dXJuIG5ldyBSYW5nZShzdGFydCwgZW5kKVxuICAgIH1cbiAgfVxufVxuTGF0ZXN0Q2hhbmdlLnJlZ2lzdGVyKGZhbHNlLCB0cnVlKVxuXG5jbGFzcyBTZWFyY2hNYXRjaEZvcndhcmQgZXh0ZW5kcyBUZXh0T2JqZWN0IHtcbiAgYmFja3dhcmQgPSBmYWxzZVxuXG4gIGZpbmRNYXRjaChmcm9tUG9pbnQsIHBhdHRlcm4pIHtcbiAgICBpZiAodGhpcy5tb2RlID09PSBcInZpc3VhbFwiKSB7XG4gICAgICBmcm9tUG9pbnQgPSB0cmFuc2xhdGVQb2ludEFuZENsaXAodGhpcy5lZGl0b3IsIGZyb21Qb2ludCwgXCJmb3J3YXJkXCIpXG4gICAgfVxuICAgIGxldCBmb3VuZFJhbmdlXG4gICAgdGhpcy5zY2FuRm9yd2FyZChwYXR0ZXJuLCB7ZnJvbTogW2Zyb21Qb2ludC5yb3csIDBdfSwgKHtyYW5nZSwgc3RvcH0pID0+IHtcbiAgICAgIGlmIChyYW5nZS5lbmQuaXNHcmVhdGVyVGhhbihmcm9tUG9pbnQpKSB7XG4gICAgICAgIGZvdW5kUmFuZ2UgPSByYW5nZVxuICAgICAgICBzdG9wKClcbiAgICAgIH1cbiAgICB9KVxuICAgIHJldHVybiB7cmFuZ2U6IGZvdW5kUmFuZ2UsIHdoaWNoSXNIZWFkOiBcImVuZFwifVxuICB9XG5cbiAgZ2V0UmFuZ2Uoc2VsZWN0aW9uKSB7XG4gICAgY29uc3QgcGF0dGVybiA9IHRoaXMuZ2xvYmFsU3RhdGUuZ2V0KFwibGFzdFNlYXJjaFBhdHRlcm5cIilcbiAgICBpZiAoIXBhdHRlcm4pIHJldHVyblxuXG4gICAgY29uc3QgZnJvbVBvaW50ID0gc2VsZWN0aW9uLmdldEhlYWRCdWZmZXJQb3NpdGlvbigpXG4gICAgY29uc3Qge3JhbmdlLCB3aGljaElzSGVhZH0gPSB0aGlzLmZpbmRNYXRjaChmcm9tUG9pbnQsIHBhdHRlcm4pXG4gICAgaWYgKHJhbmdlKSB7XG4gICAgICByZXR1cm4gdGhpcy51bmlvblJhbmdlQW5kRGV0ZXJtaW5lUmV2ZXJzZWRTdGF0ZShzZWxlY3Rpb24sIHJhbmdlLCB3aGljaElzSGVhZClcbiAgICB9XG4gIH1cblxuICB1bmlvblJhbmdlQW5kRGV0ZXJtaW5lUmV2ZXJzZWRTdGF0ZShzZWxlY3Rpb24sIHJhbmdlLCB3aGljaElzSGVhZCkge1xuICAgIGlmIChzZWxlY3Rpb24uaXNFbXB0eSgpKSByZXR1cm4gcmFuZ2VcblxuICAgIGxldCBoZWFkID0gcmFuZ2Vbd2hpY2hJc0hlYWRdXG4gICAgY29uc3QgdGFpbCA9IHNlbGVjdGlvbi5nZXRUYWlsQnVmZmVyUG9zaXRpb24oKVxuXG4gICAgaWYgKHRoaXMuYmFja3dhcmQpIHtcbiAgICAgIGlmICh0YWlsLmlzTGVzc1RoYW4oaGVhZCkpIGhlYWQgPSB0cmFuc2xhdGVQb2ludEFuZENsaXAodGhpcy5lZGl0b3IsIGhlYWQsIFwiZm9yd2FyZFwiKVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoaGVhZC5pc0xlc3NUaGFuKHRhaWwpKSBoZWFkID0gdHJhbnNsYXRlUG9pbnRBbmRDbGlwKHRoaXMuZWRpdG9yLCBoZWFkLCBcImJhY2t3YXJkXCIpXG4gICAgfVxuXG4gICAgdGhpcy5yZXZlcnNlZCA9IGhlYWQuaXNMZXNzVGhhbih0YWlsKVxuICAgIHJldHVybiBuZXcgUmFuZ2UodGFpbCwgaGVhZCkudW5pb24odGhpcy5zd3JhcChzZWxlY3Rpb24pLmdldFRhaWxCdWZmZXJSYW5nZSgpKVxuICB9XG5cbiAgc2VsZWN0VGV4dE9iamVjdChzZWxlY3Rpb24pIHtcbiAgICBjb25zdCByYW5nZSA9IHRoaXMuZ2V0UmFuZ2Uoc2VsZWN0aW9uKVxuICAgIGlmIChyYW5nZSkge1xuICAgICAgdGhpcy5zd3JhcChzZWxlY3Rpb24pLnNldEJ1ZmZlclJhbmdlKHJhbmdlLCB7cmV2ZXJzZWQ6IHRoaXMucmV2ZXJzZWQgIT0gbnVsbCA/IHRoaXMucmV2ZXJzZWQgOiB0aGlzLmJhY2t3YXJkfSlcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfVxuICB9XG59XG5TZWFyY2hNYXRjaEZvcndhcmQucmVnaXN0ZXIoKVxuXG5jbGFzcyBTZWFyY2hNYXRjaEJhY2t3YXJkIGV4dGVuZHMgU2VhcmNoTWF0Y2hGb3J3YXJkIHtcbiAgYmFja3dhcmQgPSB0cnVlXG5cbiAgZmluZE1hdGNoKGZyb21Qb2ludCwgcGF0dGVybikge1xuICAgIGlmICh0aGlzLm1vZGUgPT09IFwidmlzdWFsXCIpIHtcbiAgICAgIGZyb21Qb2ludCA9IHRyYW5zbGF0ZVBvaW50QW5kQ2xpcCh0aGlzLmVkaXRvciwgZnJvbVBvaW50LCBcImJhY2t3YXJkXCIpXG4gICAgfVxuICAgIGxldCBmb3VuZFJhbmdlXG4gICAgdGhpcy5zY2FuQmFja3dhcmQocGF0dGVybiwge2Zyb206IFtmcm9tUG9pbnQucm93LCBJbmZpbml0eV19LCAoe3JhbmdlLCBzdG9wfSkgPT4ge1xuICAgICAgaWYgKHJhbmdlLnN0YXJ0LmlzTGVzc1RoYW4oZnJvbVBvaW50KSkge1xuICAgICAgICBmb3VuZFJhbmdlID0gcmFuZ2VcbiAgICAgICAgc3RvcCgpXG4gICAgICB9XG4gICAgfSlcbiAgICByZXR1cm4ge3JhbmdlOiBmb3VuZFJhbmdlLCB3aGljaElzSGVhZDogXCJzdGFydFwifVxuICB9XG59XG5TZWFyY2hNYXRjaEJhY2t3YXJkLnJlZ2lzdGVyKClcblxuLy8gW0xpbWl0YXRpb246IHdvbid0IGZpeF06IFNlbGVjdGVkIHJhbmdlIGlzIG5vdCBzdWJtb2RlIGF3YXJlLiBhbHdheXMgY2hhcmFjdGVyd2lzZS5cbi8vIFNvIGV2ZW4gaWYgb3JpZ2luYWwgc2VsZWN0aW9uIHdhcyB2TCBvciB2Qiwgc2VsZWN0ZWQgcmFuZ2UgYnkgdGhpcyB0ZXh0LW9iamVjdFxuLy8gaXMgYWx3YXlzIHZDIHJhbmdlLlxuY2xhc3MgUHJldmlvdXNTZWxlY3Rpb24gZXh0ZW5kcyBUZXh0T2JqZWN0IHtcbiAgd2lzZSA9IG51bGxcbiAgc2VsZWN0T25jZSA9IHRydWVcblxuICBzZWxlY3RUZXh0T2JqZWN0KHNlbGVjdGlvbikge1xuICAgIGNvbnN0IHtwcm9wZXJ0aWVzLCBzdWJtb2RlfSA9IHRoaXMudmltU3RhdGUucHJldmlvdXNTZWxlY3Rpb25cbiAgICBpZiAocHJvcGVydGllcyAmJiBzdWJtb2RlKSB7XG4gICAgICB0aGlzLndpc2UgPSBzdWJtb2RlXG4gICAgICB0aGlzLnN3cmFwKHRoaXMuZWRpdG9yLmdldExhc3RTZWxlY3Rpb24oKSkuc2VsZWN0QnlQcm9wZXJ0aWVzKHByb3BlcnRpZXMpXG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH1cbiAgfVxufVxuUHJldmlvdXNTZWxlY3Rpb24ucmVnaXN0ZXIoKVxuXG5jbGFzcyBQZXJzaXN0ZW50U2VsZWN0aW9uIGV4dGVuZHMgVGV4dE9iamVjdCB7XG4gIHdpc2UgPSBudWxsXG4gIHNlbGVjdE9uY2UgPSB0cnVlXG5cbiAgc2VsZWN0VGV4dE9iamVjdChzZWxlY3Rpb24pIHtcbiAgICBpZiAodGhpcy52aW1TdGF0ZS5oYXNQZXJzaXN0ZW50U2VsZWN0aW9ucygpKSB7XG4gICAgICB0aGlzLnBlcnNpc3RlbnRTZWxlY3Rpb24uc2V0U2VsZWN0ZWRCdWZmZXJSYW5nZXMoKVxuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG4gIH1cbn1cblBlcnNpc3RlbnRTZWxlY3Rpb24ucmVnaXN0ZXIoZmFsc2UsIHRydWUpXG5cbi8vIFVzZWQgb25seSBieSBSZXBsYWNlV2l0aFJlZ2lzdGVyIGFuZCBQdXRCZWZvcmUgYW5kIGl0cycgY2hpbGRyZW4uXG5jbGFzcyBMYXN0UGFzdGVkUmFuZ2UgZXh0ZW5kcyBUZXh0T2JqZWN0IHtcbiAgd2lzZSA9IG51bGxcbiAgc2VsZWN0T25jZSA9IHRydWVcblxuICBzZWxlY3RUZXh0T2JqZWN0KHNlbGVjdGlvbikge1xuICAgIGZvciAoc2VsZWN0aW9uIG9mIHRoaXMuZWRpdG9yLmdldFNlbGVjdGlvbnMoKSkge1xuICAgICAgY29uc3QgcmFuZ2UgPSB0aGlzLnZpbVN0YXRlLnNlcXVlbnRpYWxQYXN0ZU1hbmFnZXIuZ2V0UGFzdGVkUmFuZ2VGb3JTZWxlY3Rpb24oc2VsZWN0aW9uKVxuICAgICAgc2VsZWN0aW9uLnNldEJ1ZmZlclJhbmdlKHJhbmdlKVxuICAgIH1cbiAgICByZXR1cm4gdHJ1ZVxuICB9XG59XG5MYXN0UGFzdGVkUmFuZ2UucmVnaXN0ZXIoZmFsc2UpXG5cbmNsYXNzIFZpc2libGVBcmVhIGV4dGVuZHMgVGV4dE9iamVjdCB7XG4gIHNlbGVjdE9uY2UgPSB0cnVlXG5cbiAgZ2V0UmFuZ2Uoc2VsZWN0aW9uKSB7XG4gICAgLy8gW0JVRz9dIE5lZWQgdHJhbnNsYXRlIHRvIHNoaWxuayB0b3AgYW5kIGJvdHRvbSB0byBmaXQgYWN0dWFsIHJvdy5cbiAgICAvLyBUaGUgcmVhc29uIEkgbmVlZCAtMiBhdCBib3R0b20gaXMgYmVjYXVzZSBvZiBzdGF0dXMgYmFyP1xuICAgIGNvbnN0IHJhbmdlID0gZ2V0VmlzaWJsZUJ1ZmZlclJhbmdlKHRoaXMuZWRpdG9yKVxuICAgIHJldHVybiByYW5nZS5nZXRSb3dzKCkgPiB0aGlzLmVkaXRvci5nZXRSb3dzUGVyUGFnZSgpID8gcmFuZ2UudHJhbnNsYXRlKFsrMSwgMF0sIFstMywgMF0pIDogcmFuZ2VcbiAgfVxufVxuVmlzaWJsZUFyZWEucmVnaXN0ZXIoZmFsc2UsIHRydWUpXG4iXX0=