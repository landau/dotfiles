"use babel";

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, "next"); var callThrow = step.bind(null, "throw"); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var changeCase = require("change-case");

var _require = require("atom");

var BufferedProcess = _require.BufferedProcess;
var Range = _require.Range;

var _require2 = require("./operator");

var Operator = _require2.Operator;

// TransformString
// ================================

var TransformString = (function (_Operator) {
  _inherits(TransformString, _Operator);

  function TransformString() {
    _classCallCheck(this, TransformString);

    _get(Object.getPrototypeOf(TransformString.prototype), "constructor", this).apply(this, arguments);

    this.trackChange = true;
    this.stayOptionName = "stayOnTransformString";
    this.autoIndent = false;
    this.autoIndentNewline = false;
    this.autoIndentAfterInsertText = false;
  }

  _createClass(TransformString, [{
    key: "mutateSelection",
    value: function mutateSelection(selection) {
      var text = this.getNewText(selection.getText(), selection);
      if (text) {
        var startRowIndentLevel = undefined;
        if (this.autoIndentAfterInsertText) {
          var startRow = selection.getBufferRange().start.row;
          startRowIndentLevel = this.editor.indentationForBufferRow(startRow);
        }
        var range = selection.insertText(text, { autoIndent: this.autoIndent, autoIndentNewline: this.autoIndentNewline });

        if (this.autoIndentAfterInsertText) {
          // Currently used by SplitArguments and Surround( linewise target only )
          if (this.target.isLinewise()) {
            range = range.translate([0, 0], [-1, 0]);
          }
          this.editor.setIndentationForBufferRow(range.start.row, startRowIndentLevel);
          this.editor.setIndentationForBufferRow(range.end.row, startRowIndentLevel);
          // Adjust inner range, end.row is already( if needed ) translated so no need to re-translate.
          this.utils.adjustIndentWithKeepingLayout(this.editor, range.translate([1, 0], [0, 0]));
        }
      }
    }
  }], [{
    key: "registerToSelectList",
    value: function registerToSelectList() {
      this.stringTransformers.push(this);
    }
  }, {
    key: "command",
    value: false,
    enumerable: true
  }, {
    key: "stringTransformers",
    value: [],
    enumerable: true
  }]);

  return TransformString;
})(Operator);

var ChangeCase = (function (_TransformString) {
  _inherits(ChangeCase, _TransformString);

  function ChangeCase() {
    _classCallCheck(this, ChangeCase);

    _get(Object.getPrototypeOf(ChangeCase.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(ChangeCase, [{
    key: "getNewText",
    value: function getNewText(text) {
      var functionName = this.functionName || changeCase.lowerCaseFirst(this.name);
      // HACK: IMO `changeCase` does aggressive transformation(remove punctuation, remove white spaces...)
      // make changeCase less aggressive by targeting narrower charset.
      var regex = /\w+(:?[-./]?[\w+])*/g;
      return text.replace(regex, function (match) {
        return changeCase[functionName](match);
      });
    }
  }], [{
    key: "command",
    value: false,
    enumerable: true
  }]);

  return ChangeCase;
})(TransformString);

var NoCase = (function (_ChangeCase) {
  _inherits(NoCase, _ChangeCase);

  function NoCase() {
    _classCallCheck(this, NoCase);

    _get(Object.getPrototypeOf(NoCase.prototype), "constructor", this).apply(this, arguments);
  }

  return NoCase;
})(ChangeCase);

var DotCase = (function (_ChangeCase2) {
  _inherits(DotCase, _ChangeCase2);

  function DotCase() {
    _classCallCheck(this, DotCase);

    _get(Object.getPrototypeOf(DotCase.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(DotCase, null, [{
    key: "displayNameSuffix",
    value: ".",
    enumerable: true
  }]);

  return DotCase;
})(ChangeCase);

var SwapCase = (function (_ChangeCase3) {
  _inherits(SwapCase, _ChangeCase3);

  function SwapCase() {
    _classCallCheck(this, SwapCase);

    _get(Object.getPrototypeOf(SwapCase.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(SwapCase, null, [{
    key: "displayNameSuffix",
    value: "~",
    enumerable: true
  }]);

  return SwapCase;
})(ChangeCase);

var PathCase = (function (_ChangeCase4) {
  _inherits(PathCase, _ChangeCase4);

  function PathCase() {
    _classCallCheck(this, PathCase);

    _get(Object.getPrototypeOf(PathCase.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(PathCase, null, [{
    key: "displayNameSuffix",
    value: "/",
    enumerable: true
  }]);

  return PathCase;
})(ChangeCase);

var UpperCase = (function (_ChangeCase5) {
  _inherits(UpperCase, _ChangeCase5);

  function UpperCase() {
    _classCallCheck(this, UpperCase);

    _get(Object.getPrototypeOf(UpperCase.prototype), "constructor", this).apply(this, arguments);
  }

  return UpperCase;
})(ChangeCase);

var LowerCase = (function (_ChangeCase6) {
  _inherits(LowerCase, _ChangeCase6);

  function LowerCase() {
    _classCallCheck(this, LowerCase);

    _get(Object.getPrototypeOf(LowerCase.prototype), "constructor", this).apply(this, arguments);
  }

  return LowerCase;
})(ChangeCase);

var CamelCase = (function (_ChangeCase7) {
  _inherits(CamelCase, _ChangeCase7);

  function CamelCase() {
    _classCallCheck(this, CamelCase);

    _get(Object.getPrototypeOf(CamelCase.prototype), "constructor", this).apply(this, arguments);
  }

  return CamelCase;
})(ChangeCase);

var SnakeCase = (function (_ChangeCase8) {
  _inherits(SnakeCase, _ChangeCase8);

  function SnakeCase() {
    _classCallCheck(this, SnakeCase);

    _get(Object.getPrototypeOf(SnakeCase.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(SnakeCase, null, [{
    key: "displayNameSuffix",
    value: "_",
    enumerable: true
  }]);

  return SnakeCase;
})(ChangeCase);

var TitleCase = (function (_ChangeCase9) {
  _inherits(TitleCase, _ChangeCase9);

  function TitleCase() {
    _classCallCheck(this, TitleCase);

    _get(Object.getPrototypeOf(TitleCase.prototype), "constructor", this).apply(this, arguments);
  }

  return TitleCase;
})(ChangeCase);

var ParamCase = (function (_ChangeCase10) {
  _inherits(ParamCase, _ChangeCase10);

  function ParamCase() {
    _classCallCheck(this, ParamCase);

    _get(Object.getPrototypeOf(ParamCase.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(ParamCase, null, [{
    key: "displayNameSuffix",
    value: "-",
    enumerable: true
  }]);

  return ParamCase;
})(ChangeCase);

var HeaderCase = (function (_ChangeCase11) {
  _inherits(HeaderCase, _ChangeCase11);

  function HeaderCase() {
    _classCallCheck(this, HeaderCase);

    _get(Object.getPrototypeOf(HeaderCase.prototype), "constructor", this).apply(this, arguments);
  }

  return HeaderCase;
})(ChangeCase);

var PascalCase = (function (_ChangeCase12) {
  _inherits(PascalCase, _ChangeCase12);

  function PascalCase() {
    _classCallCheck(this, PascalCase);

    _get(Object.getPrototypeOf(PascalCase.prototype), "constructor", this).apply(this, arguments);
  }

  return PascalCase;
})(ChangeCase);

var ConstantCase = (function (_ChangeCase13) {
  _inherits(ConstantCase, _ChangeCase13);

  function ConstantCase() {
    _classCallCheck(this, ConstantCase);

    _get(Object.getPrototypeOf(ConstantCase.prototype), "constructor", this).apply(this, arguments);
  }

  return ConstantCase;
})(ChangeCase);

var SentenceCase = (function (_ChangeCase14) {
  _inherits(SentenceCase, _ChangeCase14);

  function SentenceCase() {
    _classCallCheck(this, SentenceCase);

    _get(Object.getPrototypeOf(SentenceCase.prototype), "constructor", this).apply(this, arguments);
  }

  return SentenceCase;
})(ChangeCase);

var UpperCaseFirst = (function (_ChangeCase15) {
  _inherits(UpperCaseFirst, _ChangeCase15);

  function UpperCaseFirst() {
    _classCallCheck(this, UpperCaseFirst);

    _get(Object.getPrototypeOf(UpperCaseFirst.prototype), "constructor", this).apply(this, arguments);
  }

  return UpperCaseFirst;
})(ChangeCase);

var LowerCaseFirst = (function (_ChangeCase16) {
  _inherits(LowerCaseFirst, _ChangeCase16);

  function LowerCaseFirst() {
    _classCallCheck(this, LowerCaseFirst);

    _get(Object.getPrototypeOf(LowerCaseFirst.prototype), "constructor", this).apply(this, arguments);
  }

  return LowerCaseFirst;
})(ChangeCase);

var DashCase = (function (_ChangeCase17) {
  _inherits(DashCase, _ChangeCase17);

  function DashCase() {
    _classCallCheck(this, DashCase);

    _get(Object.getPrototypeOf(DashCase.prototype), "constructor", this).apply(this, arguments);

    this.functionName = "paramCase";
  }

  _createClass(DashCase, null, [{
    key: "displayNameSuffix",
    value: "-",
    enumerable: true
  }]);

  return DashCase;
})(ChangeCase);

var ToggleCase = (function (_ChangeCase18) {
  _inherits(ToggleCase, _ChangeCase18);

  function ToggleCase() {
    _classCallCheck(this, ToggleCase);

    _get(Object.getPrototypeOf(ToggleCase.prototype), "constructor", this).apply(this, arguments);

    this.functionName = "swapCase";
  }

  _createClass(ToggleCase, null, [{
    key: "displayNameSuffix",
    value: "~",
    enumerable: true
  }]);

  return ToggleCase;
})(ChangeCase);

var ToggleCaseAndMoveRight = (function (_ChangeCase19) {
  _inherits(ToggleCaseAndMoveRight, _ChangeCase19);

  function ToggleCaseAndMoveRight() {
    _classCallCheck(this, ToggleCaseAndMoveRight);

    _get(Object.getPrototypeOf(ToggleCaseAndMoveRight.prototype), "constructor", this).apply(this, arguments);

    this.functionName = "swapCase";
    this.flashTarget = false;
    this.restorePositions = false;
    this.target = "MoveRight";
  }

  // Replace
  // -------------------------
  return ToggleCaseAndMoveRight;
})(ChangeCase);

var Replace = (function (_TransformString2) {
  _inherits(Replace, _TransformString2);

  function Replace() {
    _classCallCheck(this, Replace);

    _get(Object.getPrototypeOf(Replace.prototype), "constructor", this).apply(this, arguments);

    this.flashCheckpoint = "did-select-occurrence";
    this.autoIndentNewline = true;
    this.readInputAfterSelect = true;
  }

  _createClass(Replace, [{
    key: "getNewText",
    value: function getNewText(text) {
      if (this.target.name === "MoveRightBufferColumn" && text.length !== this.getCount()) {
        return;
      }

      var input = this.input || "\n";
      if (input === "\n") {
        this.restorePositions = false;
      }
      return text.replace(/./g, input);
    }
  }]);

  return Replace;
})(TransformString);

var ReplaceCharacter = (function (_Replace) {
  _inherits(ReplaceCharacter, _Replace);

  function ReplaceCharacter() {
    _classCallCheck(this, ReplaceCharacter);

    _get(Object.getPrototypeOf(ReplaceCharacter.prototype), "constructor", this).apply(this, arguments);

    this.target = "MoveRightBufferColumn";
  }

  // -------------------------
  // DUP meaning with SplitString need consolidate.
  return ReplaceCharacter;
})(Replace);

var SplitByCharacter = (function (_TransformString3) {
  _inherits(SplitByCharacter, _TransformString3);

  function SplitByCharacter() {
    _classCallCheck(this, SplitByCharacter);

    _get(Object.getPrototypeOf(SplitByCharacter.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(SplitByCharacter, [{
    key: "getNewText",
    value: function getNewText(text) {
      return text.split("").join(" ");
    }
  }]);

  return SplitByCharacter;
})(TransformString);

var EncodeUriComponent = (function (_TransformString4) {
  _inherits(EncodeUriComponent, _TransformString4);

  function EncodeUriComponent() {
    _classCallCheck(this, EncodeUriComponent);

    _get(Object.getPrototypeOf(EncodeUriComponent.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(EncodeUriComponent, [{
    key: "getNewText",
    value: function getNewText(text) {
      return encodeURIComponent(text);
    }
  }], [{
    key: "displayNameSuffix",
    value: "%",
    enumerable: true
  }]);

  return EncodeUriComponent;
})(TransformString);

var DecodeUriComponent = (function (_TransformString5) {
  _inherits(DecodeUriComponent, _TransformString5);

  function DecodeUriComponent() {
    _classCallCheck(this, DecodeUriComponent);

    _get(Object.getPrototypeOf(DecodeUriComponent.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(DecodeUriComponent, [{
    key: "getNewText",
    value: function getNewText(text) {
      return decodeURIComponent(text);
    }
  }], [{
    key: "displayNameSuffix",
    value: "%%",
    enumerable: true
  }]);

  return DecodeUriComponent;
})(TransformString);

var TrimString = (function (_TransformString6) {
  _inherits(TrimString, _TransformString6);

  function TrimString() {
    _classCallCheck(this, TrimString);

    _get(Object.getPrototypeOf(TrimString.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(TrimString, [{
    key: "getNewText",
    value: function getNewText(text) {
      return text.trim();
    }
  }]);

  return TrimString;
})(TransformString);

var CompactSpaces = (function (_TransformString7) {
  _inherits(CompactSpaces, _TransformString7);

  function CompactSpaces() {
    _classCallCheck(this, CompactSpaces);

    _get(Object.getPrototypeOf(CompactSpaces.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(CompactSpaces, [{
    key: "getNewText",
    value: function getNewText(text) {
      if (text.match(/^[ ]+$/)) {
        return " ";
      } else {
        // Don't compact for leading and trailing white spaces.
        var regex = /^(\s*)(.*?)(\s*)$/gm;
        return text.replace(regex, function (m, leading, middle, trailing) {
          return leading + middle.split(/[ \t]+/).join(" ") + trailing;
        });
      }
    }
  }]);

  return CompactSpaces;
})(TransformString);

var AlignOccurrence = (function (_TransformString8) {
  _inherits(AlignOccurrence, _TransformString8);

  function AlignOccurrence() {
    _classCallCheck(this, AlignOccurrence);

    _get(Object.getPrototypeOf(AlignOccurrence.prototype), "constructor", this).apply(this, arguments);

    this.occurrence = true;
    this.whichToPad = "auto";
  }

  _createClass(AlignOccurrence, [{
    key: "getSelectionTaker",
    value: function getSelectionTaker() {
      var selectionsByRow = {};
      for (var selection of this.editor.getSelectionsOrderedByBufferPosition()) {
        var row = selection.getBufferRange().start.row;
        if (!(row in selectionsByRow)) selectionsByRow[row] = [];
        selectionsByRow[row].push(selection);
      }
      var allRows = Object.keys(selectionsByRow);
      return function () {
        return allRows.map(function (row) {
          return selectionsByRow[row].shift();
        }).filter(function (s) {
          return s;
        });
      };
    }
  }, {
    key: "getWichToPadForText",
    value: function getWichToPadForText(text) {
      if (this.whichToPad !== "auto") return this.whichToPad;

      if (/^\s*[=\|]\s*$/.test(text)) {
        // Asignment(=) and `|`(markdown-table separator)
        return "start";
      } else if (/^\s*,\s*$/.test(text)) {
        // Arguments
        return "end";
      } else if (/\W$/.test(text)) {
        // ends with non-word-char
        return "end";
      } else {
        return "start";
      }
    }
  }, {
    key: "calculatePadding",
    value: function calculatePadding() {
      var _this = this;

      var totalAmountOfPaddingByRow = {};
      var columnForSelection = function columnForSelection(selection) {
        var which = _this.getWichToPadForText(selection.getText());
        var point = selection.getBufferRange()[which];
        return point.column + (totalAmountOfPaddingByRow[point.row] || 0);
      };

      var takeSelections = this.getSelectionTaker();
      while (true) {
        var selections = takeSelections();
        if (!selections.length) return;
        var maxColumn = selections.map(columnForSelection).reduce(function (max, cur) {
          return cur > max ? cur : max;
        });
        for (var selection of selections) {
          var row = selection.getBufferRange().start.row;
          var amountOfPadding = maxColumn - columnForSelection(selection);
          totalAmountOfPaddingByRow[row] = (totalAmountOfPaddingByRow[row] || 0) + amountOfPadding;
          this.amountOfPaddingBySelection.set(selection, amountOfPadding);
        }
      }
    }
  }, {
    key: "execute",
    value: function execute() {
      var _this2 = this;

      this.amountOfPaddingBySelection = new Map();
      this.onDidSelectTarget(function () {
        _this2.calculatePadding();
      });
      _get(Object.getPrototypeOf(AlignOccurrence.prototype), "execute", this).call(this);
    }
  }, {
    key: "getNewText",
    value: function getNewText(text, selection) {
      var padding = " ".repeat(this.amountOfPaddingBySelection.get(selection));
      var whichToPad = this.getWichToPadForText(selection.getText());
      return whichToPad === "start" ? padding + text : text + padding;
    }
  }]);

  return AlignOccurrence;
})(TransformString);

var AlignOccurrenceByPadLeft = (function (_AlignOccurrence) {
  _inherits(AlignOccurrenceByPadLeft, _AlignOccurrence);

  function AlignOccurrenceByPadLeft() {
    _classCallCheck(this, AlignOccurrenceByPadLeft);

    _get(Object.getPrototypeOf(AlignOccurrenceByPadLeft.prototype), "constructor", this).apply(this, arguments);

    this.whichToPad = "start";
  }

  return AlignOccurrenceByPadLeft;
})(AlignOccurrence);

var AlignOccurrenceByPadRight = (function (_AlignOccurrence2) {
  _inherits(AlignOccurrenceByPadRight, _AlignOccurrence2);

  function AlignOccurrenceByPadRight() {
    _classCallCheck(this, AlignOccurrenceByPadRight);

    _get(Object.getPrototypeOf(AlignOccurrenceByPadRight.prototype), "constructor", this).apply(this, arguments);

    this.whichToPad = "end";
  }

  return AlignOccurrenceByPadRight;
})(AlignOccurrence);

var RemoveLeadingWhiteSpaces = (function (_TransformString9) {
  _inherits(RemoveLeadingWhiteSpaces, _TransformString9);

  function RemoveLeadingWhiteSpaces() {
    _classCallCheck(this, RemoveLeadingWhiteSpaces);

    _get(Object.getPrototypeOf(RemoveLeadingWhiteSpaces.prototype), "constructor", this).apply(this, arguments);

    this.wise = "linewise";
  }

  _createClass(RemoveLeadingWhiteSpaces, [{
    key: "getNewText",
    value: function getNewText(text, selection) {
      var trimLeft = function trimLeft(text) {
        return text.trimLeft();
      };
      return this.utils.splitTextByNewLine(text).map(trimLeft).join("\n") + "\n";
    }
  }]);

  return RemoveLeadingWhiteSpaces;
})(TransformString);

var ConvertToSoftTab = (function (_TransformString10) {
  _inherits(ConvertToSoftTab, _TransformString10);

  function ConvertToSoftTab() {
    _classCallCheck(this, ConvertToSoftTab);

    _get(Object.getPrototypeOf(ConvertToSoftTab.prototype), "constructor", this).apply(this, arguments);

    this.wise = "linewise";
  }

  _createClass(ConvertToSoftTab, [{
    key: "mutateSelection",
    value: function mutateSelection(selection) {
      var _this3 = this;

      this.scanEditor("forward", /\t/g, { scanRange: selection.getBufferRange() }, function (_ref) {
        var range = _ref.range;
        var replace = _ref.replace;

        // Replace \t to spaces which length is vary depending on tabStop and tabLenght
        // So we directly consult it's screen representing length.
        var length = _this3.editor.screenRangeForBufferRange(range).getExtent().column;
        replace(" ".repeat(length));
      });
    }
  }], [{
    key: "displayName",
    value: "Soft Tab",
    enumerable: true
  }]);

  return ConvertToSoftTab;
})(TransformString);

var ConvertToHardTab = (function (_TransformString11) {
  _inherits(ConvertToHardTab, _TransformString11);

  function ConvertToHardTab() {
    _classCallCheck(this, ConvertToHardTab);

    _get(Object.getPrototypeOf(ConvertToHardTab.prototype), "constructor", this).apply(this, arguments);
  }

  // -------------------------

  _createClass(ConvertToHardTab, [{
    key: "mutateSelection",
    value: function mutateSelection(selection) {
      var _this4 = this;

      var tabLength = this.editor.getTabLength();
      this.scanEditor("forward", /[ \t]+/g, { scanRange: selection.getBufferRange() }, function (_ref2) {
        var range = _ref2.range;
        var replace = _ref2.replace;

        var _editor$screenRangeForBufferRange = _this4.editor.screenRangeForBufferRange(range);

        var start = _editor$screenRangeForBufferRange.start;
        var end = _editor$screenRangeForBufferRange.end;

        var startColumn = start.column;
        var endColumn = end.column;

        // We can't naively replace spaces to tab, we have to consider valid tabStop column
        // If nextTabStop column exceeds replacable range, we pad with spaces.
        var newText = "";
        while (true) {
          var remainder = startColumn % tabLength;
          var nextTabStop = startColumn + (remainder === 0 ? tabLength : remainder);
          if (nextTabStop > endColumn) {
            newText += " ".repeat(endColumn - startColumn);
          } else {
            newText += "\t";
          }
          startColumn = nextTabStop;
          if (startColumn >= endColumn) {
            break;
          }
        }

        replace(newText);
      });
    }
  }], [{
    key: "displayName",
    value: "Hard Tab",
    enumerable: true
  }]);

  return ConvertToHardTab;
})(TransformString);

var TransformStringByExternalCommand = (function (_TransformString12) {
  _inherits(TransformStringByExternalCommand, _TransformString12);

  function TransformStringByExternalCommand() {
    _classCallCheck(this, TransformStringByExternalCommand);

    _get(Object.getPrototypeOf(TransformStringByExternalCommand.prototype), "constructor", this).apply(this, arguments);

    this.autoIndent = true;
    this.command = "";
    this.args = [];
  }

  // -------------------------

  _createClass(TransformStringByExternalCommand, [{
    key: "getNewText",
    // e.g args: ['-rn']

    // NOTE: Unlike other class, first arg is `stdout` of external commands.
    value: function getNewText(text, selection) {
      return text || selection.getText();
    }
  }, {
    key: "getCommand",
    value: function getCommand(selection) {
      return { command: this.command, args: this.args };
    }
  }, {
    key: "getStdin",
    value: function getStdin(selection) {
      return selection.getText();
    }
  }, {
    key: "execute",
    value: _asyncToGenerator(function* () {
      this.preSelect();

      if (this.selectTarget()) {
        for (var selection of this.editor.getSelections()) {
          var _ref3 = this.getCommand(selection) || {};

          var command = _ref3.command;
          var args = _ref3.args;

          if (command == null || args == null) continue;

          var stdout = yield this.runExternalCommand({ command: command, args: args, stdin: this.getStdin(selection) });
          selection.insertText(this.getNewText(stdout, selection), { autoIndent: this.autoIndent });
        }
        this.mutationManager.setCheckpoint("did-finish");
        this.restoreCursorPositionsIfNecessary();
      }
      this.postMutate();
    })
  }, {
    key: "runExternalCommand",
    value: function runExternalCommand(options) {
      var _this5 = this;

      var output = "";
      options.stdout = function (data) {
        return output += data;
      };
      var exitPromise = new Promise(function (resolve) {
        options.exit = function () {
          return resolve(output);
        };
      });
      var stdin = options.stdin;

      delete options.stdin;
      var bufferedProcess = new BufferedProcess(options);
      bufferedProcess.onWillThrowError(function (_ref4) {
        var error = _ref4.error;
        var handle = _ref4.handle;

        // Suppress command not found error intentionally.
        if (error.code === "ENOENT" && error.syscall.indexOf("spawn") === 0) {
          console.log(_this5.getCommandName() + ": Failed to spawn command " + error.path + ".");
          handle();
        }
        _this5.cancelOperation();
      });

      if (stdin) {
        bufferedProcess.process.stdin.write(stdin);
        bufferedProcess.process.stdin.end();
      }
      return exitPromise;
    }
  }], [{
    key: "command",
    value: false,
    enumerable: true
  }]);

  return TransformStringByExternalCommand;
})(TransformString);

var TransformStringBySelectList = (function (_TransformString13) {
  _inherits(TransformStringBySelectList, _TransformString13);

  function TransformStringBySelectList() {
    _classCallCheck(this, TransformStringBySelectList);

    _get(Object.getPrototypeOf(TransformStringBySelectList.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(TransformStringBySelectList, [{
    key: "isReady",
    value: function isReady() {
      // This command is just gate to execute another operator.
      // So never get ready and never be executed.
      return false;
    }
  }, {
    key: "initialize",
    value: function initialize() {
      var _this6 = this;

      this.focusSelectList({ items: this.constructor.getSelectListItems() });
      this.vimState.onDidConfirmSelectList(function (item) {
        _this6.vimState.reset();
        _this6.vimState.operationStack.run(item.klass, { target: _this6.target });
      });
    }
  }, {
    key: "execute",
    value: function execute() {
      throw new Error(this.name + " should not be executed");
    }
  }], [{
    key: "getSelectListItems",
    value: function getSelectListItems() {
      var _this7 = this;

      if (!this.selectListItems) {
        this.selectListItems = this.stringTransformers.map(function (klass) {
          var suffix = klass.hasOwnProperty("displayNameSuffix") ? " " + klass.displayNameSuffix : "";

          return {
            klass: klass,
            displayName: klass.hasOwnProperty("displayName") ? klass.displayName + suffix : _this7._.humanizeEventName(_this7._.dasherize(klass.name)) + suffix
          };
        });
      }
      return this.selectListItems;
    }
  }]);

  return TransformStringBySelectList;
})(TransformString);

var TransformWordBySelectList = (function (_TransformStringBySelectList) {
  _inherits(TransformWordBySelectList, _TransformStringBySelectList);

  function TransformWordBySelectList() {
    _classCallCheck(this, TransformWordBySelectList);

    _get(Object.getPrototypeOf(TransformWordBySelectList.prototype), "constructor", this).apply(this, arguments);

    this.target = "InnerWord";
  }

  return TransformWordBySelectList;
})(TransformStringBySelectList);

var TransformSmartWordBySelectList = (function (_TransformStringBySelectList2) {
  _inherits(TransformSmartWordBySelectList, _TransformStringBySelectList2);

  function TransformSmartWordBySelectList() {
    _classCallCheck(this, TransformSmartWordBySelectList);

    _get(Object.getPrototypeOf(TransformSmartWordBySelectList.prototype), "constructor", this).apply(this, arguments);

    this.target = "InnerSmartWord";
  }

  // -------------------------
  return TransformSmartWordBySelectList;
})(TransformStringBySelectList);

var ReplaceWithRegister = (function (_TransformString14) {
  _inherits(ReplaceWithRegister, _TransformString14);

  function ReplaceWithRegister() {
    _classCallCheck(this, ReplaceWithRegister);

    _get(Object.getPrototypeOf(ReplaceWithRegister.prototype), "constructor", this).apply(this, arguments);

    this.flashType = "operator-long";
  }

  _createClass(ReplaceWithRegister, [{
    key: "initialize",
    value: function initialize() {
      this.vimState.sequentialPasteManager.onInitialize(this);
      _get(Object.getPrototypeOf(ReplaceWithRegister.prototype), "initialize", this).call(this);
    }
  }, {
    key: "execute",
    value: function execute() {
      this.sequentialPaste = this.vimState.sequentialPasteManager.onExecute(this);

      _get(Object.getPrototypeOf(ReplaceWithRegister.prototype), "execute", this).call(this);

      for (var selection of this.editor.getSelections()) {
        var range = this.mutationManager.getMutatedBufferRangeForSelection(selection);
        this.vimState.sequentialPasteManager.savePastedRangeForSelection(selection, range);
      }
    }
  }, {
    key: "getNewText",
    value: function getNewText(text, selection) {
      var value = this.vimState.register.get(null, selection, this.sequentialPaste);
      return value ? value.text : "";
    }
  }]);

  return ReplaceWithRegister;
})(TransformString);

var ReplaceOccurrenceWithRegister = (function (_ReplaceWithRegister) {
  _inherits(ReplaceOccurrenceWithRegister, _ReplaceWithRegister);

  function ReplaceOccurrenceWithRegister() {
    _classCallCheck(this, ReplaceOccurrenceWithRegister);

    _get(Object.getPrototypeOf(ReplaceOccurrenceWithRegister.prototype), "constructor", this).apply(this, arguments);

    this.occurrence = true;
  }

  // Save text to register before replace
  return ReplaceOccurrenceWithRegister;
})(ReplaceWithRegister);

var SwapWithRegister = (function (_TransformString15) {
  _inherits(SwapWithRegister, _TransformString15);

  function SwapWithRegister() {
    _classCallCheck(this, SwapWithRegister);

    _get(Object.getPrototypeOf(SwapWithRegister.prototype), "constructor", this).apply(this, arguments);
  }

  // Indent < TransformString
  // -------------------------

  _createClass(SwapWithRegister, [{
    key: "getNewText",
    value: function getNewText(text, selection) {
      var newText = this.vimState.register.getText();
      this.setTextToRegister(text, selection);
      return newText;
    }
  }]);

  return SwapWithRegister;
})(TransformString);

var Indent = (function (_TransformString16) {
  _inherits(Indent, _TransformString16);

  function Indent() {
    _classCallCheck(this, Indent);

    _get(Object.getPrototypeOf(Indent.prototype), "constructor", this).apply(this, arguments);

    this.stayByMarker = true;
    this.setToFirstCharacterOnLinewise = true;
    this.wise = "linewise";
  }

  _createClass(Indent, [{
    key: "mutateSelection",
    value: function mutateSelection(selection) {
      var _this8 = this;

      // Need count times indentation in visual-mode and its repeat(`.`).
      if (this.target.name === "CurrentSelection") {
        (function () {
          var oldText = undefined;
          // limit to 100 to avoid freezing by accidental big number.
          _this8.countTimes(_this8.limitNumber(_this8.getCount(), { max: 100 }), function (_ref5) {
            var stop = _ref5.stop;

            oldText = selection.getText();
            _this8.indent(selection);
            if (selection.getText() === oldText) stop();
          });
        })();
      } else {
        this.indent(selection);
      }
    }
  }, {
    key: "indent",
    value: function indent(selection) {
      selection.indentSelectedRows();
    }
  }]);

  return Indent;
})(TransformString);

var Outdent = (function (_Indent) {
  _inherits(Outdent, _Indent);

  function Outdent() {
    _classCallCheck(this, Outdent);

    _get(Object.getPrototypeOf(Outdent.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(Outdent, [{
    key: "indent",
    value: function indent(selection) {
      selection.outdentSelectedRows();
    }
  }]);

  return Outdent;
})(Indent);

var AutoIndent = (function (_Indent2) {
  _inherits(AutoIndent, _Indent2);

  function AutoIndent() {
    _classCallCheck(this, AutoIndent);

    _get(Object.getPrototypeOf(AutoIndent.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(AutoIndent, [{
    key: "indent",
    value: function indent(selection) {
      selection.autoIndentSelectedRows();
    }
  }]);

  return AutoIndent;
})(Indent);

var ToggleLineComments = (function (_TransformString17) {
  _inherits(ToggleLineComments, _TransformString17);

  function ToggleLineComments() {
    _classCallCheck(this, ToggleLineComments);

    _get(Object.getPrototypeOf(ToggleLineComments.prototype), "constructor", this).apply(this, arguments);

    this.flashTarget = false;
    this.stayByMarker = true;
    this.stayAtSamePosition = true;
    this.wise = "linewise";
  }

  _createClass(ToggleLineComments, [{
    key: "mutateSelection",
    value: function mutateSelection(selection) {
      selection.toggleLineComments();
    }
  }]);

  return ToggleLineComments;
})(TransformString);

var Reflow = (function (_TransformString18) {
  _inherits(Reflow, _TransformString18);

  function Reflow() {
    _classCallCheck(this, Reflow);

    _get(Object.getPrototypeOf(Reflow.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(Reflow, [{
    key: "mutateSelection",
    value: function mutateSelection(selection) {
      atom.commands.dispatch(this.editorElement, "autoflow:reflow-selection");
    }
  }]);

  return Reflow;
})(TransformString);

var ReflowWithStay = (function (_Reflow) {
  _inherits(ReflowWithStay, _Reflow);

  function ReflowWithStay() {
    _classCallCheck(this, ReflowWithStay);

    _get(Object.getPrototypeOf(ReflowWithStay.prototype), "constructor", this).apply(this, arguments);

    this.stayAtSamePosition = true;
  }

  // Surround < TransformString
  // -------------------------
  return ReflowWithStay;
})(Reflow);

var SurroundBase = (function (_TransformString19) {
  _inherits(SurroundBase, _TransformString19);

  function SurroundBase() {
    _classCallCheck(this, SurroundBase);

    _get(Object.getPrototypeOf(SurroundBase.prototype), "constructor", this).apply(this, arguments);

    this.surroundAction = null;
    this.pairs = [["(", ")"], ["{", "}"], ["[", "]"], ["<", ">"]];
    this.pairsByAlias = {
      b: ["(", ")"],
      B: ["{", "}"],
      r: ["[", "]"],
      a: ["<", ">"]
    };
  }

  _createClass(SurroundBase, [{
    key: "getPair",
    value: function getPair(char) {
      return char in this.pairsByAlias ? this.pairsByAlias[char] : [].concat(_toConsumableArray(this.pairs), [[char, char]]).find(function (pair) {
        return pair.includes(char);
      });
    }
  }, {
    key: "surround",
    value: function surround(text, char) {
      var _ref6 = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

      var _ref6$keepLayout = _ref6.keepLayout;
      var keepLayout = _ref6$keepLayout === undefined ? false : _ref6$keepLayout;

      var _getPair = this.getPair(char);

      var _getPair2 = _slicedToArray(_getPair, 2);

      var open = _getPair2[0];
      var close = _getPair2[1];

      if (!keepLayout && text.endsWith("\n")) {
        this.autoIndentAfterInsertText = true;
        open += "\n";
        close += "\n";
      }

      if (this.getConfig("charactersToAddSpaceOnSurround").includes(char) && this.utils.isSingleLineText(text)) {
        text = " " + text + " ";
      }

      return open + text + close;
    }
  }, {
    key: "deleteSurround",
    value: function deleteSurround(text) {
      // Assume surrounding char is one-char length.
      var open = text[0];
      var close = text[text.length - 1];
      var innerText = text.slice(1, text.length - 1);
      return this.utils.isSingleLineText(text) && open !== close ? innerText.trim() : innerText;
    }
  }, {
    key: "getNewText",
    value: function getNewText(text) {
      if (this.surroundAction === "surround") {
        return this.surround(text, this.input);
      } else if (this.surroundAction === "delete-surround") {
        return this.deleteSurround(text);
      } else if (this.surroundAction === "change-surround") {
        return this.surround(this.deleteSurround(text), this.input, { keepLayout: true });
      }
    }
  }], [{
    key: "command",
    value: false,
    enumerable: true
  }]);

  return SurroundBase;
})(TransformString);

var Surround = (function (_SurroundBase) {
  _inherits(Surround, _SurroundBase);

  function Surround() {
    _classCallCheck(this, Surround);

    _get(Object.getPrototypeOf(Surround.prototype), "constructor", this).apply(this, arguments);

    this.surroundAction = "surround";
    this.readInputAfterSelect = true;
  }

  return Surround;
})(SurroundBase);

var SurroundWord = (function (_Surround) {
  _inherits(SurroundWord, _Surround);

  function SurroundWord() {
    _classCallCheck(this, SurroundWord);

    _get(Object.getPrototypeOf(SurroundWord.prototype), "constructor", this).apply(this, arguments);

    this.target = "InnerWord";
  }

  return SurroundWord;
})(Surround);

var SurroundSmartWord = (function (_Surround2) {
  _inherits(SurroundSmartWord, _Surround2);

  function SurroundSmartWord() {
    _classCallCheck(this, SurroundSmartWord);

    _get(Object.getPrototypeOf(SurroundSmartWord.prototype), "constructor", this).apply(this, arguments);

    this.target = "InnerSmartWord";
  }

  return SurroundSmartWord;
})(Surround);

var MapSurround = (function (_Surround3) {
  _inherits(MapSurround, _Surround3);

  function MapSurround() {
    _classCallCheck(this, MapSurround);

    _get(Object.getPrototypeOf(MapSurround.prototype), "constructor", this).apply(this, arguments);

    this.occurrence = true;
    this.patternForOccurrence = /\w+/g;
  }

  // Delete Surround
  // -------------------------
  return MapSurround;
})(Surround);

var DeleteSurround = (function (_SurroundBase2) {
  _inherits(DeleteSurround, _SurroundBase2);

  function DeleteSurround() {
    _classCallCheck(this, DeleteSurround);

    _get(Object.getPrototypeOf(DeleteSurround.prototype), "constructor", this).apply(this, arguments);

    this.surroundAction = "delete-surround";
  }

  _createClass(DeleteSurround, [{
    key: "initialize",
    value: function initialize() {
      var _this9 = this;

      if (!this.target) {
        this.focusInput({
          onConfirm: function onConfirm(char) {
            _this9.setTarget(_this9.getInstance("APair", { pair: _this9.getPair(char) }));
            _this9.processOperation();
          }
        });
      }
      _get(Object.getPrototypeOf(DeleteSurround.prototype), "initialize", this).call(this);
    }
  }]);

  return DeleteSurround;
})(SurroundBase);

var DeleteSurroundAnyPair = (function (_DeleteSurround) {
  _inherits(DeleteSurroundAnyPair, _DeleteSurround);

  function DeleteSurroundAnyPair() {
    _classCallCheck(this, DeleteSurroundAnyPair);

    _get(Object.getPrototypeOf(DeleteSurroundAnyPair.prototype), "constructor", this).apply(this, arguments);

    this.target = "AAnyPair";
  }

  return DeleteSurroundAnyPair;
})(DeleteSurround);

var DeleteSurroundAnyPairAllowForwarding = (function (_DeleteSurroundAnyPair) {
  _inherits(DeleteSurroundAnyPairAllowForwarding, _DeleteSurroundAnyPair);

  function DeleteSurroundAnyPairAllowForwarding() {
    _classCallCheck(this, DeleteSurroundAnyPairAllowForwarding);

    _get(Object.getPrototypeOf(DeleteSurroundAnyPairAllowForwarding.prototype), "constructor", this).apply(this, arguments);

    this.target = "AAnyPairAllowForwarding";
  }

  // Change Surround
  // -------------------------
  return DeleteSurroundAnyPairAllowForwarding;
})(DeleteSurroundAnyPair);

var ChangeSurround = (function (_DeleteSurround2) {
  _inherits(ChangeSurround, _DeleteSurround2);

  function ChangeSurround() {
    _classCallCheck(this, ChangeSurround);

    _get(Object.getPrototypeOf(ChangeSurround.prototype), "constructor", this).apply(this, arguments);

    this.surroundAction = "change-surround";
    this.readInputAfterSelect = true;
  }

  _createClass(ChangeSurround, [{
    key: "focusInputPromised",

    // Override to show changing char on hover
    value: _asyncToGenerator(function* () {
      var hoverPoint = this.mutationManager.getInitialPointForSelection(this.editor.getLastSelection());
      this.vimState.hover.set(this.editor.getSelectedText()[0], hoverPoint);

      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return _get(Object.getPrototypeOf(ChangeSurround.prototype), "focusInputPromised", this).apply(this, args);
    })
  }]);

  return ChangeSurround;
})(DeleteSurround);

var ChangeSurroundAnyPair = (function (_ChangeSurround) {
  _inherits(ChangeSurroundAnyPair, _ChangeSurround);

  function ChangeSurroundAnyPair() {
    _classCallCheck(this, ChangeSurroundAnyPair);

    _get(Object.getPrototypeOf(ChangeSurroundAnyPair.prototype), "constructor", this).apply(this, arguments);

    this.target = "AAnyPair";
  }

  return ChangeSurroundAnyPair;
})(ChangeSurround);

var ChangeSurroundAnyPairAllowForwarding = (function (_ChangeSurroundAnyPair) {
  _inherits(ChangeSurroundAnyPairAllowForwarding, _ChangeSurroundAnyPair);

  function ChangeSurroundAnyPairAllowForwarding() {
    _classCallCheck(this, ChangeSurroundAnyPairAllowForwarding);

    _get(Object.getPrototypeOf(ChangeSurroundAnyPairAllowForwarding.prototype), "constructor", this).apply(this, arguments);

    this.target = "AAnyPairAllowForwarding";
  }

  // -------------------------
  // FIXME
  // Currently native editor.joinLines() is better for cursor position setting
  // So I use native methods for a meanwhile.
  return ChangeSurroundAnyPairAllowForwarding;
})(ChangeSurroundAnyPair);

var JoinTarget = (function (_TransformString20) {
  _inherits(JoinTarget, _TransformString20);

  function JoinTarget() {
    _classCallCheck(this, JoinTarget);

    _get(Object.getPrototypeOf(JoinTarget.prototype), "constructor", this).apply(this, arguments);

    this.flashTarget = false;
    this.restorePositions = false;
  }

  _createClass(JoinTarget, [{
    key: "mutateSelection",
    value: function mutateSelection(selection) {
      var range = selection.getBufferRange();

      // When cursor is at last BUFFER row, it select last-buffer-row, then
      // joinning result in "clear last-buffer-row text".
      // I believe this is BUG of upstream atom-core. guard this situation here
      if (!range.isSingleLine() || range.end.row !== this.editor.getLastBufferRow()) {
        if (this.utils.isLinewiseRange(range)) {
          selection.setBufferRange(range.translate([0, 0], [-1, Infinity]));
        }
        selection.joinLines();
      }
      var point = selection.getBufferRange().end.translate([0, -1]);
      return selection.cursor.setBufferPosition(point);
    }
  }]);

  return JoinTarget;
})(TransformString);

var Join = (function (_JoinTarget) {
  _inherits(Join, _JoinTarget);

  function Join() {
    _classCallCheck(this, Join);

    _get(Object.getPrototypeOf(Join.prototype), "constructor", this).apply(this, arguments);

    this.target = "MoveToRelativeLine";
  }

  return Join;
})(JoinTarget);

var JoinBase = (function (_TransformString21) {
  _inherits(JoinBase, _TransformString21);

  function JoinBase() {
    _classCallCheck(this, JoinBase);

    _get(Object.getPrototypeOf(JoinBase.prototype), "constructor", this).apply(this, arguments);

    this.wise = "linewise";
    this.trim = false;
    this.target = "MoveToRelativeLineMinimumTwo";
  }

  _createClass(JoinBase, [{
    key: "getNewText",
    value: function getNewText(text) {
      var regex = this.trim ? /\r?\n[ \t]*/g : /\r?\n/g;
      return text.trimRight().replace(regex, this.input) + "\n";
    }
  }], [{
    key: "command",
    value: false,
    enumerable: true
  }]);

  return JoinBase;
})(TransformString);

var JoinWithKeepingSpace = (function (_JoinBase) {
  _inherits(JoinWithKeepingSpace, _JoinBase);

  function JoinWithKeepingSpace() {
    _classCallCheck(this, JoinWithKeepingSpace);

    _get(Object.getPrototypeOf(JoinWithKeepingSpace.prototype), "constructor", this).apply(this, arguments);

    this.input = "";
  }

  return JoinWithKeepingSpace;
})(JoinBase);

var JoinByInput = (function (_JoinBase2) {
  _inherits(JoinByInput, _JoinBase2);

  function JoinByInput() {
    _classCallCheck(this, JoinByInput);

    _get(Object.getPrototypeOf(JoinByInput.prototype), "constructor", this).apply(this, arguments);

    this.readInputAfterSelect = true;
    this.focusInputOptions = { charsMax: 10 };
    this.trim = true;
  }

  return JoinByInput;
})(JoinBase);

var JoinByInputWithKeepingSpace = (function (_JoinByInput) {
  _inherits(JoinByInputWithKeepingSpace, _JoinByInput);

  function JoinByInputWithKeepingSpace() {
    _classCallCheck(this, JoinByInputWithKeepingSpace);

    _get(Object.getPrototypeOf(JoinByInputWithKeepingSpace.prototype), "constructor", this).apply(this, arguments);

    this.trim = false;
  }

  // -------------------------
  // String suffix in name is to avoid confusion with 'split' window.
  return JoinByInputWithKeepingSpace;
})(JoinByInput);

var SplitString = (function (_TransformString22) {
  _inherits(SplitString, _TransformString22);

  function SplitString() {
    _classCallCheck(this, SplitString);

    _get(Object.getPrototypeOf(SplitString.prototype), "constructor", this).apply(this, arguments);

    this.target = "MoveToRelativeLine";
    this.keepSplitter = false;
    this.readInputAfterSelect = true;
    this.focusInputOptions = { charsMax: 10 };
  }

  _createClass(SplitString, [{
    key: "getNewText",
    value: function getNewText(text) {
      var regex = new RegExp(this._.escapeRegExp(this.input || "\\n"), "g");
      var lineSeparator = (this.keepSplitter ? this.input : "") + "\n";
      return text.replace(regex, lineSeparator);
    }
  }]);

  return SplitString;
})(TransformString);

var SplitStringWithKeepingSplitter = (function (_SplitString) {
  _inherits(SplitStringWithKeepingSplitter, _SplitString);

  function SplitStringWithKeepingSplitter() {
    _classCallCheck(this, SplitStringWithKeepingSplitter);

    _get(Object.getPrototypeOf(SplitStringWithKeepingSplitter.prototype), "constructor", this).apply(this, arguments);

    this.keepSplitter = true;
  }

  return SplitStringWithKeepingSplitter;
})(SplitString);

var SplitArguments = (function (_TransformString23) {
  _inherits(SplitArguments, _TransformString23);

  function SplitArguments() {
    _classCallCheck(this, SplitArguments);

    _get(Object.getPrototypeOf(SplitArguments.prototype), "constructor", this).apply(this, arguments);

    this.keepSeparator = true;
    this.autoIndentAfterInsertText = true;
  }

  _createClass(SplitArguments, [{
    key: "getNewText",
    value: function getNewText(text) {
      var allTokens = this.utils.splitArguments(text.trim());
      var newText = "";
      while (allTokens.length) {
        var _allTokens$shift = allTokens.shift();

        var _text = _allTokens$shift.text;
        var type = _allTokens$shift.type;

        newText += type === "separator" ? (this.keepSeparator ? _text.trim() : "") + "\n" : _text;
      }
      return "\n" + newText + "\n";
    }
  }]);

  return SplitArguments;
})(TransformString);

var SplitArgumentsWithRemoveSeparator = (function (_SplitArguments) {
  _inherits(SplitArgumentsWithRemoveSeparator, _SplitArguments);

  function SplitArgumentsWithRemoveSeparator() {
    _classCallCheck(this, SplitArgumentsWithRemoveSeparator);

    _get(Object.getPrototypeOf(SplitArgumentsWithRemoveSeparator.prototype), "constructor", this).apply(this, arguments);

    this.keepSeparator = false;
  }

  return SplitArgumentsWithRemoveSeparator;
})(SplitArguments);

var SplitArgumentsOfInnerAnyPair = (function (_SplitArguments2) {
  _inherits(SplitArgumentsOfInnerAnyPair, _SplitArguments2);

  function SplitArgumentsOfInnerAnyPair() {
    _classCallCheck(this, SplitArgumentsOfInnerAnyPair);

    _get(Object.getPrototypeOf(SplitArgumentsOfInnerAnyPair.prototype), "constructor", this).apply(this, arguments);

    this.target = "InnerAnyPair";
  }

  return SplitArgumentsOfInnerAnyPair;
})(SplitArguments);

var ChangeOrder = (function (_TransformString24) {
  _inherits(ChangeOrder, _TransformString24);

  function ChangeOrder() {
    _classCallCheck(this, ChangeOrder);

    _get(Object.getPrototypeOf(ChangeOrder.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(ChangeOrder, [{
    key: "getNewText",
    value: function getNewText(text) {
      var _this10 = this;

      return this.target.isLinewise() ? this.getNewList(this.utils.splitTextByNewLine(text)).join("\n") + "\n" : this.sortArgumentsInTextBy(text, function (args) {
        return _this10.getNewList(args);
      });
    }
  }, {
    key: "sortArgumentsInTextBy",
    value: function sortArgumentsInTextBy(text, fn) {
      var start = text.search(/\S/);
      var end = text.search(/\s*$/);
      var leadingSpaces = start !== -1 ? text.slice(0, start) : "";
      var trailingSpaces = end !== -1 ? text.slice(end) : "";
      var allTokens = this.utils.splitArguments(text.slice(start, end));
      var args = allTokens.filter(function (token) {
        return token.type === "argument";
      }).map(function (token) {
        return token.text;
      });
      var newArgs = fn(args);

      var newText = "";
      while (allTokens.length) {
        var token = allTokens.shift();
        // token.type is "separator" or "argument"
        newText += token.type === "separator" ? token.text : newArgs.shift();
      }
      return leadingSpaces + newText + trailingSpaces;
    }
  }], [{
    key: "command",
    value: false,
    enumerable: true
  }]);

  return ChangeOrder;
})(TransformString);

var Reverse = (function (_ChangeOrder) {
  _inherits(Reverse, _ChangeOrder);

  function Reverse() {
    _classCallCheck(this, Reverse);

    _get(Object.getPrototypeOf(Reverse.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(Reverse, [{
    key: "getNewList",
    value: function getNewList(rows) {
      return rows.reverse();
    }
  }]);

  return Reverse;
})(ChangeOrder);

var ReverseInnerAnyPair = (function (_Reverse) {
  _inherits(ReverseInnerAnyPair, _Reverse);

  function ReverseInnerAnyPair() {
    _classCallCheck(this, ReverseInnerAnyPair);

    _get(Object.getPrototypeOf(ReverseInnerAnyPair.prototype), "constructor", this).apply(this, arguments);

    this.target = "InnerAnyPair";
  }

  return ReverseInnerAnyPair;
})(Reverse);

var Rotate = (function (_ChangeOrder2) {
  _inherits(Rotate, _ChangeOrder2);

  function Rotate() {
    _classCallCheck(this, Rotate);

    _get(Object.getPrototypeOf(Rotate.prototype), "constructor", this).apply(this, arguments);

    this.backwards = false;
  }

  _createClass(Rotate, [{
    key: "getNewList",
    value: function getNewList(rows) {
      if (this.backwards) rows.push(rows.shift());else rows.unshift(rows.pop());
      return rows;
    }
  }]);

  return Rotate;
})(ChangeOrder);

var RotateBackwards = (function (_ChangeOrder3) {
  _inherits(RotateBackwards, _ChangeOrder3);

  function RotateBackwards() {
    _classCallCheck(this, RotateBackwards);

    _get(Object.getPrototypeOf(RotateBackwards.prototype), "constructor", this).apply(this, arguments);

    this.backwards = true;
  }

  return RotateBackwards;
})(ChangeOrder);

var RotateArgumentsOfInnerPair = (function (_Rotate) {
  _inherits(RotateArgumentsOfInnerPair, _Rotate);

  function RotateArgumentsOfInnerPair() {
    _classCallCheck(this, RotateArgumentsOfInnerPair);

    _get(Object.getPrototypeOf(RotateArgumentsOfInnerPair.prototype), "constructor", this).apply(this, arguments);

    this.target = "InnerAnyPair";
  }

  return RotateArgumentsOfInnerPair;
})(Rotate);

var RotateArgumentsBackwardsOfInnerPair = (function (_RotateArgumentsOfInnerPair) {
  _inherits(RotateArgumentsBackwardsOfInnerPair, _RotateArgumentsOfInnerPair);

  function RotateArgumentsBackwardsOfInnerPair() {
    _classCallCheck(this, RotateArgumentsBackwardsOfInnerPair);

    _get(Object.getPrototypeOf(RotateArgumentsBackwardsOfInnerPair.prototype), "constructor", this).apply(this, arguments);

    this.backwards = true;
  }

  return RotateArgumentsBackwardsOfInnerPair;
})(RotateArgumentsOfInnerPair);

var Sort = (function (_ChangeOrder4) {
  _inherits(Sort, _ChangeOrder4);

  function Sort() {
    _classCallCheck(this, Sort);

    _get(Object.getPrototypeOf(Sort.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(Sort, [{
    key: "getNewList",
    value: function getNewList(rows) {
      return rows.sort();
    }
  }]);

  return Sort;
})(ChangeOrder);

var SortCaseInsensitively = (function (_ChangeOrder5) {
  _inherits(SortCaseInsensitively, _ChangeOrder5);

  function SortCaseInsensitively() {
    _classCallCheck(this, SortCaseInsensitively);

    _get(Object.getPrototypeOf(SortCaseInsensitively.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(SortCaseInsensitively, [{
    key: "getNewList",
    value: function getNewList(rows) {
      return rows.sort(function (rowA, rowB) {
        return rowA.localeCompare(rowB, { sensitivity: "base" });
      });
    }
  }]);

  return SortCaseInsensitively;
})(ChangeOrder);

var SortByNumber = (function (_ChangeOrder6) {
  _inherits(SortByNumber, _ChangeOrder6);

  function SortByNumber() {
    _classCallCheck(this, SortByNumber);

    _get(Object.getPrototypeOf(SortByNumber.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(SortByNumber, [{
    key: "getNewList",
    value: function getNewList(rows) {
      return this._.sortBy(rows, function (row) {
        return Number.parseInt(row) || Infinity;
      });
    }
  }]);

  return SortByNumber;
})(ChangeOrder);

var NumberingLines = (function (_TransformString25) {
  _inherits(NumberingLines, _TransformString25);

  function NumberingLines() {
    _classCallCheck(this, NumberingLines);

    _get(Object.getPrototypeOf(NumberingLines.prototype), "constructor", this).apply(this, arguments);

    this.wise = "linewise";
  }

  _createClass(NumberingLines, [{
    key: "getNewText",
    value: function getNewText(text) {
      var _this11 = this;

      var rows = this.utils.splitTextByNewLine(text);
      var lastRowWidth = String(rows.length).length;

      var newRows = rows.map(function (rowText, i) {
        i++; // fix 0 start index to 1 start.
        var amountOfPadding = _this11.limitNumber(lastRowWidth - String(i).length, { min: 0 });
        return " ".repeat(amountOfPadding) + i + ": " + rowText;
      });
      return newRows.join("\n") + "\n";
    }
  }]);

  return NumberingLines;
})(TransformString);

var DuplicateWithCommentOutOriginal = (function (_TransformString26) {
  _inherits(DuplicateWithCommentOutOriginal, _TransformString26);

  function DuplicateWithCommentOutOriginal() {
    _classCallCheck(this, DuplicateWithCommentOutOriginal);

    _get(Object.getPrototypeOf(DuplicateWithCommentOutOriginal.prototype), "constructor", this).apply(this, arguments);

    this.wise = "linewise";
    this.stayByMarker = true;
    this.stayAtSamePosition = true;
  }

  _createClass(DuplicateWithCommentOutOriginal, [{
    key: "mutateSelection",
    value: function mutateSelection(selection) {
      var _selection$getBufferRowRange = selection.getBufferRowRange();

      var _selection$getBufferRowRange2 = _slicedToArray(_selection$getBufferRowRange, 2);

      var startRow = _selection$getBufferRowRange2[0];
      var endRow = _selection$getBufferRowRange2[1];

      selection.setBufferRange(this.utils.insertTextAtBufferPosition(this.editor, [startRow, 0], selection.getText()));
      this.editor.toggleLineCommentsForBufferRows(startRow, endRow);
    }
  }]);

  return DuplicateWithCommentOutOriginal;
})(TransformString);

module.exports = {
  TransformString: TransformString,

  NoCase: NoCase,
  DotCase: DotCase,
  SwapCase: SwapCase,
  PathCase: PathCase,
  UpperCase: UpperCase,
  LowerCase: LowerCase,
  CamelCase: CamelCase,
  SnakeCase: SnakeCase,
  TitleCase: TitleCase,
  ParamCase: ParamCase,
  HeaderCase: HeaderCase,
  PascalCase: PascalCase,
  ConstantCase: ConstantCase,
  SentenceCase: SentenceCase,
  UpperCaseFirst: UpperCaseFirst,
  LowerCaseFirst: LowerCaseFirst,
  DashCase: DashCase,
  ToggleCase: ToggleCase,
  ToggleCaseAndMoveRight: ToggleCaseAndMoveRight,

  Replace: Replace,
  ReplaceCharacter: ReplaceCharacter,
  SplitByCharacter: SplitByCharacter,
  EncodeUriComponent: EncodeUriComponent,
  DecodeUriComponent: DecodeUriComponent,
  TrimString: TrimString,
  CompactSpaces: CompactSpaces,
  AlignOccurrence: AlignOccurrence,
  AlignOccurrenceByPadLeft: AlignOccurrenceByPadLeft,
  AlignOccurrenceByPadRight: AlignOccurrenceByPadRight,
  RemoveLeadingWhiteSpaces: RemoveLeadingWhiteSpaces,
  ConvertToSoftTab: ConvertToSoftTab,
  ConvertToHardTab: ConvertToHardTab,
  TransformStringByExternalCommand: TransformStringByExternalCommand,
  TransformStringBySelectList: TransformStringBySelectList,
  TransformWordBySelectList: TransformWordBySelectList,
  TransformSmartWordBySelectList: TransformSmartWordBySelectList,
  ReplaceWithRegister: ReplaceWithRegister,
  ReplaceOccurrenceWithRegister: ReplaceOccurrenceWithRegister,
  SwapWithRegister: SwapWithRegister,
  Indent: Indent,
  Outdent: Outdent,
  AutoIndent: AutoIndent,
  ToggleLineComments: ToggleLineComments,
  Reflow: Reflow,
  ReflowWithStay: ReflowWithStay,
  SurroundBase: SurroundBase,
  Surround: Surround,
  SurroundWord: SurroundWord,
  SurroundSmartWord: SurroundSmartWord,
  MapSurround: MapSurround,
  DeleteSurround: DeleteSurround,
  DeleteSurroundAnyPair: DeleteSurroundAnyPair,
  DeleteSurroundAnyPairAllowForwarding: DeleteSurroundAnyPairAllowForwarding,
  ChangeSurround: ChangeSurround,
  ChangeSurroundAnyPair: ChangeSurroundAnyPair,
  ChangeSurroundAnyPairAllowForwarding: ChangeSurroundAnyPairAllowForwarding,
  JoinTarget: JoinTarget,
  Join: Join,
  JoinBase: JoinBase,
  JoinWithKeepingSpace: JoinWithKeepingSpace,
  JoinByInput: JoinByInput,
  JoinByInputWithKeepingSpace: JoinByInputWithKeepingSpace,
  SplitString: SplitString,
  SplitStringWithKeepingSplitter: SplitStringWithKeepingSplitter,
  SplitArguments: SplitArguments,
  SplitArgumentsWithRemoveSeparator: SplitArgumentsWithRemoveSeparator,
  SplitArgumentsOfInnerAnyPair: SplitArgumentsOfInnerAnyPair,
  ChangeOrder: ChangeOrder,
  Reverse: Reverse,
  ReverseInnerAnyPair: ReverseInnerAnyPair,
  Rotate: Rotate,
  RotateBackwards: RotateBackwards,
  RotateArgumentsOfInnerPair: RotateArgumentsOfInnerPair,
  RotateArgumentsBackwardsOfInnerPair: RotateArgumentsBackwardsOfInnerPair,
  Sort: Sort,
  SortCaseInsensitively: SortCaseInsensitively,
  SortByNumber: SortByNumber,
  NumberingLines: NumberingLines,
  DuplicateWithCommentOutOriginal: DuplicateWithCommentOutOriginal
};
for (var klass of Object.values(module.exports)) {
  if (klass.isCommand()) klass.registerToSelectList();
}
// e.g. command: 'sort'
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL29wZXJhdG9yLXRyYW5zZm9ybS1zdHJpbmcuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsV0FBVyxDQUFBOzs7Ozs7Ozs7Ozs7Ozs7O0FBRVgsSUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFBOztlQUVSLE9BQU8sQ0FBQyxNQUFNLENBQUM7O0lBQXpDLGVBQWUsWUFBZixlQUFlO0lBQUUsS0FBSyxZQUFMLEtBQUs7O2dCQUNWLE9BQU8sQ0FBQyxZQUFZLENBQUM7O0lBQWpDLFFBQVEsYUFBUixRQUFROzs7OztJQUlULGVBQWU7WUFBZixlQUFlOztXQUFmLGVBQWU7MEJBQWYsZUFBZTs7K0JBQWYsZUFBZTs7U0FHbkIsV0FBVyxHQUFHLElBQUk7U0FDbEIsY0FBYyxHQUFHLHVCQUF1QjtTQUN4QyxVQUFVLEdBQUcsS0FBSztTQUNsQixpQkFBaUIsR0FBRyxLQUFLO1NBQ3pCLHlCQUF5QixHQUFHLEtBQUs7OztlQVA3QixlQUFlOztXQWFKLHlCQUFDLFNBQVMsRUFBRTtBQUN6QixVQUFNLElBQUksR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxTQUFTLENBQUMsQ0FBQTtBQUM1RCxVQUFJLElBQUksRUFBRTtBQUNSLFlBQUksbUJBQW1CLFlBQUEsQ0FBQTtBQUN2QixZQUFJLElBQUksQ0FBQyx5QkFBeUIsRUFBRTtBQUNsQyxjQUFNLFFBQVEsR0FBRyxTQUFTLENBQUMsY0FBYyxFQUFFLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQTtBQUNyRCw2QkFBbUIsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLHVCQUF1QixDQUFDLFFBQVEsQ0FBQyxDQUFBO1NBQ3BFO0FBQ0QsWUFBSSxLQUFLLEdBQUcsU0FBUyxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsRUFBQyxVQUFVLEVBQUUsSUFB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QUFvQyxFQUFwQyxvQ0FBb0M7QUFDcEMsWUFBVSxFQUFWLFVBQVU7QUFDVixNQUFJLEVBQUosSUFBSTtBQUNKLFVBQVEsRUFBUixRQUFRO0FBQ1Isc0JBQW9CLEVBQXBCLG9CQUFvQjtBQUNwQixhQUFXLEVBQVgsV0FBVztBQUNYLDZCQUEyQixFQUEzQiwyQkFBMkI7QUFDM0IsYUFBVyxFQUFYLFdBQVc7QUFDWCxnQ0FBOEIsRUFBOUIsOEJBQThCO0FBQzlCLGdCQUFjLEVBQWQsY0FBYztBQUNkLG1DQUFpQyxFQUFqQyxpQ0FBaUM7QUFDakMsOEJBQTRCLEVBQTVCLDRCQUE0QjtBQUM1QixhQUFXLEVBQVgsV0FBVztBQUNYLFNBQU8sRUFBUCxPQUFPO0FBQ1AscUJBQW1CLEVBQW5CLG1CQUFtQjtBQUNuQixRQUFNLEVBQU4sTUFBTTtBQUNOLGlCQUFlLEVBQWYsZUFBZTtBQUNmLDRCQUEwQixFQUExQiwwQkFBMEI7QUFDMUIscUNBQW1DLEVBQW5DLG1DQUFtQztBQUNuQyxNQUFJLEVBQUosSUFBSTtBQUNKLHVCQUFxQixFQUFyQixxQkFBcUI7QUFDckIsY0FBWSxFQUFaLFlBQVk7QUFDWixnQkFBYyxFQUFkLGNBQWM7QUFDZCxpQ0FBK0IsRUFBL0IsK0JBQStCO0NBQ2hDLENBQUE7QUFDRCxLQUFLLElBQU0sS0FBSyxJQUFJLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxFQUFFO0FBQ2pELE1BQUksS0FBSyxDQUFDLFNBQVMsRUFBRSxFQUFFLEtBQUssQ0FBQyxvQkFBb0IsRUFBRSxDQUFBO0NBQ3BEIiwiZmlsZSI6Ii9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL29wZXJhdG9yLXRyYW5zZm9ybS1zdHJpbmcuanMiLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBiYWJlbFwiXG5cbmNvbnN0IGNoYW5nZUNhc2UgPSByZXF1aXJlKFwiY2hhbmdlLWNhc2VcIilcblxuY29uc3Qge0J1ZmZlcmVkUHJvY2VzcywgUmFuZ2V9ID0gcmVxdWlyZShcImF0b21cIilcbmNvbnN0IHtPcGVyYXRvcn0gPSByZXF1aXJlKFwiLi9vcGVyYXRvclwiKVxuXG4vLyBUcmFuc2Zvcm1TdHJpbmdcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5jbGFzcyBUcmFuc2Zvcm1TdHJpbmcgZXh0ZW5kcyBPcGVyYXRvciB7XG4gIHN0YXRpYyBjb21tYW5kID0gZmFsc2VcbiAgc3RhdGljIHN0cmluZ1RyYW5zZm9ybWVycyA9IFtdXG4gIHRyYWNrQ2hhbmdlID0gdHJ1ZVxuICBzdGF5T3B0aW9uTmFtZSA9IFwic3RheU9uVHJhbnNmb3JtU3RyaW5nXCJcbiAgYXV0b0luZGVudCA9IGZhbHNlXG4gIGF1dG9JbmRlbnROZXdsaW5lID0gZmFsc2VcbiAgYXV0b0luZGVudEFmdGVySW5zZXJ0VGV4dCA9IGZhbHNlXG5cbiAgc3RhdGljIHJlZ2lzdGVyVG9TZWxlY3RMaXN0KCkge1xuICAgIHRoaXMuc3RyaW5nVHJhbnNmb3JtZXJzLnB1c2godGhpcylcbiAgfVxuXG4gIG11dGF0ZVNlbGVjdGlvbihzZWxlY3Rpb24pIHtcbiAgICBjb25zdCB0ZXh0ID0gdGhpcy5nZXROZXdUZXh0KHNlbGVjdGlvbi5nZXRUZXh0KCksIHNlbGVjdGlvbilcbiAgICBpZiAodGV4dCkge1xuICAgICAgbGV0IHN0YXJ0Um93SW5kZW50TGV2ZWxcbiAgICAgIGlmICh0aGlzLmF1dG9JbmRlbnRBZnRlckluc2VydFRleHQpIHtcbiAgICAgICAgY29uc3Qgc3RhcnRSb3cgPSBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKS5zdGFydC5yb3dcbiAgICAgICAgc3RhcnRSb3dJbmRlbnRMZXZlbCA9IHRoaXMuZWRpdG9yLmluZGVudGF0aW9uRm9yQnVmZmVyUm93KHN0YXJ0Um93KVxuICAgICAgfVxuICAgICAgbGV0IHJhbmdlID0gc2VsZWN0aW9uLmluc2VydFRleHQodGV4dCwge2F1dG9JbmRlbnQ6IHRoaXMuYXV0b0luZGVudCwgYXV0b0luZGVudE5ld2xpbmU6IHRoaXMuYXV0b0luZGVudE5ld2xpbmV9KVxuXG4gICAgICBpZiAodGhpcy5hdXRvSW5kZW50QWZ0ZXJJbnNlcnRUZXh0KSB7XG4gICAgICAgIC8vIEN1cnJlbnRseSB1c2VkIGJ5IFNwbGl0QXJndW1lbnRzIGFuZCBTdXJyb3VuZCggbGluZXdpc2UgdGFyZ2V0IG9ubHkgKVxuICAgICAgICBpZiAodGhpcy50YXJnZXQuaXNMaW5ld2lzZSgpKSB7XG4gICAgICAgICAgcmFuZ2UgPSByYW5nZS50cmFuc2xhdGUoWzAsIDBdLCBbLTEsIDBdKVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuZWRpdG9yLnNldEluZGVudGF0aW9uRm9yQnVmZmVyUm93KHJhbmdlLnN0YXJ0LnJvdywgc3RhcnRSb3dJbmRlbnRMZXZlbClcbiAgICAgICAgdGhpcy5lZGl0b3Iuc2V0SW5kZW50YXRpb25Gb3JCdWZmZXJSb3cocmFuZ2UuZW5kLnJvdywgc3RhcnRSb3dJbmRlbnRMZXZlbClcbiAgICAgICAgLy8gQWRqdXN0IGlubmVyIHJhbmdlLCBlbmQucm93IGlzIGFscmVhZHkoIGlmIG5lZWRlZCApIHRyYW5zbGF0ZWQgc28gbm8gbmVlZCB0byByZS10cmFuc2xhdGUuXG4gICAgICAgIHRoaXMudXRpbHMuYWRqdXN0SW5kZW50V2l0aEtlZXBpbmdMYXlvdXQodGhpcy5lZGl0b3IsIHJhbmdlLnRyYW5zbGF0ZShbMSwgMF0sIFswLCAwXSkpXG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbmNsYXNzIENoYW5nZUNhc2UgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmcge1xuICBzdGF0aWMgY29tbWFuZCA9IGZhbHNlXG4gIGdldE5ld1RleHQodGV4dCkge1xuICAgIGNvbnN0IGZ1bmN0aW9uTmFtZSA9IHRoaXMuZnVuY3Rpb25OYW1lIHx8IGNoYW5nZUNhc2UubG93ZXJDYXNlRmlyc3QodGhpcy5uYW1lKVxuICAgIC8vIEhBQ0s6IElNTyBgY2hhbmdlQ2FzZWAgZG9lcyBhZ2dyZXNzaXZlIHRyYW5zZm9ybWF0aW9uKHJlbW92ZSBwdW5jdHVhdGlvbiwgcmVtb3ZlIHdoaXRlIHNwYWNlcy4uLilcbiAgICAvLyBtYWtlIGNoYW5nZUNhc2UgbGVzcyBhZ2dyZXNzaXZlIGJ5IHRhcmdldGluZyBuYXJyb3dlciBjaGFyc2V0LlxuICAgIGNvbnN0IHJlZ2V4ID0gL1xcdysoOj9bLS4vXT9bXFx3K10pKi9nXG4gICAgcmV0dXJuIHRleHQucmVwbGFjZShyZWdleCwgbWF0Y2ggPT4gY2hhbmdlQ2FzZVtmdW5jdGlvbk5hbWVdKG1hdGNoKSlcbiAgfVxufVxuXG5jbGFzcyBOb0Nhc2UgZXh0ZW5kcyBDaGFuZ2VDYXNlIHt9XG5jbGFzcyBEb3RDYXNlIGV4dGVuZHMgQ2hhbmdlQ2FzZSB7XG4gIHN0YXRpYyBkaXNwbGF5TmFtZVN1ZmZpeCA9IFwiLlwiXG59XG5jbGFzcyBTd2FwQ2FzZSBleHRlbmRzIENoYW5nZUNhc2Uge1xuICBzdGF0aWMgZGlzcGxheU5hbWVTdWZmaXggPSBcIn5cIlxufVxuY2xhc3MgUGF0aENhc2UgZXh0ZW5kcyBDaGFuZ2VDYXNlIHtcbiAgc3RhdGljIGRpc3BsYXlOYW1lU3VmZml4ID0gXCIvXCJcbn1cbmNsYXNzIFVwcGVyQ2FzZSBleHRlbmRzIENoYW5nZUNhc2Uge31cbmNsYXNzIExvd2VyQ2FzZSBleHRlbmRzIENoYW5nZUNhc2Uge31cbmNsYXNzIENhbWVsQ2FzZSBleHRlbmRzIENoYW5nZUNhc2Uge31cbmNsYXNzIFNuYWtlQ2FzZSBleHRlbmRzIENoYW5nZUNhc2Uge1xuICBzdGF0aWMgZGlzcGxheU5hbWVTdWZmaXggPSBcIl9cIlxufVxuY2xhc3MgVGl0bGVDYXNlIGV4dGVuZHMgQ2hhbmdlQ2FzZSB7fVxuY2xhc3MgUGFyYW1DYXNlIGV4dGVuZHMgQ2hhbmdlQ2FzZSB7XG4gIHN0YXRpYyBkaXNwbGF5TmFtZVN1ZmZpeCA9IFwiLVwiXG59XG5jbGFzcyBIZWFkZXJDYXNlIGV4dGVuZHMgQ2hhbmdlQ2FzZSB7fVxuY2xhc3MgUGFzY2FsQ2FzZSBleHRlbmRzIENoYW5nZUNhc2Uge31cbmNsYXNzIENvbnN0YW50Q2FzZSBleHRlbmRzIENoYW5nZUNhc2Uge31cbmNsYXNzIFNlbnRlbmNlQ2FzZSBleHRlbmRzIENoYW5nZUNhc2Uge31cbmNsYXNzIFVwcGVyQ2FzZUZpcnN0IGV4dGVuZHMgQ2hhbmdlQ2FzZSB7fVxuY2xhc3MgTG93ZXJDYXNlRmlyc3QgZXh0ZW5kcyBDaGFuZ2VDYXNlIHt9XG5cbmNsYXNzIERhc2hDYXNlIGV4dGVuZHMgQ2hhbmdlQ2FzZSB7XG4gIHN0YXRpYyBkaXNwbGF5TmFtZVN1ZmZpeCA9IFwiLVwiXG4gIGZ1bmN0aW9uTmFtZSA9IFwicGFyYW1DYXNlXCJcbn1cbmNsYXNzIFRvZ2dsZUNhc2UgZXh0ZW5kcyBDaGFuZ2VDYXNlIHtcbiAgc3RhdGljIGRpc3BsYXlOYW1lU3VmZml4ID0gXCJ+XCJcbiAgZnVuY3Rpb25OYW1lID0gXCJzd2FwQ2FzZVwiXG59XG5cbmNsYXNzIFRvZ2dsZUNhc2VBbmRNb3ZlUmlnaHQgZXh0ZW5kcyBDaGFuZ2VDYXNlIHtcbiAgZnVuY3Rpb25OYW1lID0gXCJzd2FwQ2FzZVwiXG4gIGZsYXNoVGFyZ2V0ID0gZmFsc2VcbiAgcmVzdG9yZVBvc2l0aW9ucyA9IGZhbHNlXG4gIHRhcmdldCA9IFwiTW92ZVJpZ2h0XCJcbn1cblxuLy8gUmVwbGFjZVxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgUmVwbGFjZSBleHRlbmRzIFRyYW5zZm9ybVN0cmluZyB7XG4gIGZsYXNoQ2hlY2twb2ludCA9IFwiZGlkLXNlbGVjdC1vY2N1cnJlbmNlXCJcbiAgYXV0b0luZGVudE5ld2xpbmUgPSB0cnVlXG4gIHJlYWRJbnB1dEFmdGVyU2VsZWN0ID0gdHJ1ZVxuXG4gIGdldE5ld1RleHQodGV4dCkge1xuICAgIGlmICh0aGlzLnRhcmdldC5uYW1lID09PSBcIk1vdmVSaWdodEJ1ZmZlckNvbHVtblwiICYmIHRleHQubGVuZ3RoICE9PSB0aGlzLmdldENvdW50KCkpIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGNvbnN0IGlucHV0ID0gdGhpcy5pbnB1dCB8fCBcIlxcblwiXG4gICAgaWYgKGlucHV0ID09PSBcIlxcblwiKSB7XG4gICAgICB0aGlzLnJlc3RvcmVQb3NpdGlvbnMgPSBmYWxzZVxuICAgIH1cbiAgICByZXR1cm4gdGV4dC5yZXBsYWNlKC8uL2csIGlucHV0KVxuICB9XG59XG5cbmNsYXNzIFJlcGxhY2VDaGFyYWN0ZXIgZXh0ZW5kcyBSZXBsYWNlIHtcbiAgdGFyZ2V0ID0gXCJNb3ZlUmlnaHRCdWZmZXJDb2x1bW5cIlxufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBEVVAgbWVhbmluZyB3aXRoIFNwbGl0U3RyaW5nIG5lZWQgY29uc29saWRhdGUuXG5jbGFzcyBTcGxpdEJ5Q2hhcmFjdGVyIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nIHtcbiAgZ2V0TmV3VGV4dCh0ZXh0KSB7XG4gICAgcmV0dXJuIHRleHQuc3BsaXQoXCJcIikuam9pbihcIiBcIilcbiAgfVxufVxuXG5jbGFzcyBFbmNvZGVVcmlDb21wb25lbnQgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmcge1xuICBzdGF0aWMgZGlzcGxheU5hbWVTdWZmaXggPSBcIiVcIlxuICBnZXROZXdUZXh0KHRleHQpIHtcbiAgICByZXR1cm4gZW5jb2RlVVJJQ29tcG9uZW50KHRleHQpXG4gIH1cbn1cblxuY2xhc3MgRGVjb2RlVXJpQ29tcG9uZW50IGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nIHtcbiAgc3RhdGljIGRpc3BsYXlOYW1lU3VmZml4ID0gXCIlJVwiXG4gIGdldE5ld1RleHQodGV4dCkge1xuICAgIHJldHVybiBkZWNvZGVVUklDb21wb25lbnQodGV4dClcbiAgfVxufVxuXG5jbGFzcyBUcmltU3RyaW5nIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nIHtcbiAgZ2V0TmV3VGV4dCh0ZXh0KSB7XG4gICAgcmV0dXJuIHRleHQudHJpbSgpXG4gIH1cbn1cblxuY2xhc3MgQ29tcGFjdFNwYWNlcyBleHRlbmRzIFRyYW5zZm9ybVN0cmluZyB7XG4gIGdldE5ld1RleHQodGV4dCkge1xuICAgIGlmICh0ZXh0Lm1hdGNoKC9eWyBdKyQvKSkge1xuICAgICAgcmV0dXJuIFwiIFwiXG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIERvbid0IGNvbXBhY3QgZm9yIGxlYWRpbmcgYW5kIHRyYWlsaW5nIHdoaXRlIHNwYWNlcy5cbiAgICAgIGNvbnN0IHJlZ2V4ID0gL14oXFxzKikoLio/KShcXHMqKSQvZ21cbiAgICAgIHJldHVybiB0ZXh0LnJlcGxhY2UocmVnZXgsIChtLCBsZWFkaW5nLCBtaWRkbGUsIHRyYWlsaW5nKSA9PiB7XG4gICAgICAgIHJldHVybiBsZWFkaW5nICsgbWlkZGxlLnNwbGl0KC9bIFxcdF0rLykuam9pbihcIiBcIikgKyB0cmFpbGluZ1xuICAgICAgfSlcbiAgICB9XG4gIH1cbn1cblxuY2xhc3MgQWxpZ25PY2N1cnJlbmNlIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nIHtcbiAgb2NjdXJyZW5jZSA9IHRydWVcbiAgd2hpY2hUb1BhZCA9IFwiYXV0b1wiXG5cbiAgZ2V0U2VsZWN0aW9uVGFrZXIoKSB7XG4gICAgY29uc3Qgc2VsZWN0aW9uc0J5Um93ID0ge31cbiAgICBmb3IgKGNvbnN0IHNlbGVjdGlvbiBvZiB0aGlzLmVkaXRvci5nZXRTZWxlY3Rpb25zT3JkZXJlZEJ5QnVmZmVyUG9zaXRpb24oKSkge1xuICAgICAgY29uc3Qgcm93ID0gc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKCkuc3RhcnQucm93XG4gICAgICBpZiAoIShyb3cgaW4gc2VsZWN0aW9uc0J5Um93KSkgc2VsZWN0aW9uc0J5Um93W3Jvd10gPSBbXVxuICAgICAgc2VsZWN0aW9uc0J5Um93W3Jvd10ucHVzaChzZWxlY3Rpb24pXG4gICAgfVxuICAgIGNvbnN0IGFsbFJvd3MgPSBPYmplY3Qua2V5cyhzZWxlY3Rpb25zQnlSb3cpXG4gICAgcmV0dXJuICgpID0+IGFsbFJvd3MubWFwKHJvdyA9PiBzZWxlY3Rpb25zQnlSb3dbcm93XS5zaGlmdCgpKS5maWx0ZXIocyA9PiBzKVxuICB9XG5cbiAgZ2V0V2ljaFRvUGFkRm9yVGV4dCh0ZXh0KSB7XG4gICAgaWYgKHRoaXMud2hpY2hUb1BhZCAhPT0gXCJhdXRvXCIpIHJldHVybiB0aGlzLndoaWNoVG9QYWRcblxuICAgIGlmICgvXlxccypbPVxcfF1cXHMqJC8udGVzdCh0ZXh0KSkge1xuICAgICAgLy8gQXNpZ25tZW50KD0pIGFuZCBgfGAobWFya2Rvd24tdGFibGUgc2VwYXJhdG9yKVxuICAgICAgcmV0dXJuIFwic3RhcnRcIlxuICAgIH0gZWxzZSBpZiAoL15cXHMqLFxccyokLy50ZXN0KHRleHQpKSB7XG4gICAgICAvLyBBcmd1bWVudHNcbiAgICAgIHJldHVybiBcImVuZFwiXG4gICAgfSBlbHNlIGlmICgvXFxXJC8udGVzdCh0ZXh0KSkge1xuICAgICAgLy8gZW5kcyB3aXRoIG5vbi13b3JkLWNoYXJcbiAgICAgIHJldHVybiBcImVuZFwiXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBcInN0YXJ0XCJcbiAgICB9XG4gIH1cblxuICBjYWxjdWxhdGVQYWRkaW5nKCkge1xuICAgIGNvbnN0IHRvdGFsQW1vdW50T2ZQYWRkaW5nQnlSb3cgPSB7fVxuICAgIGNvbnN0IGNvbHVtbkZvclNlbGVjdGlvbiA9IHNlbGVjdGlvbiA9PiB7XG4gICAgICBjb25zdCB3aGljaCA9IHRoaXMuZ2V0V2ljaFRvUGFkRm9yVGV4dChzZWxlY3Rpb24uZ2V0VGV4dCgpKVxuICAgICAgY29uc3QgcG9pbnQgPSBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKVt3aGljaF1cbiAgICAgIHJldHVybiBwb2ludC5jb2x1bW4gKyAodG90YWxBbW91bnRPZlBhZGRpbmdCeVJvd1twb2ludC5yb3ddIHx8IDApXG4gICAgfVxuXG4gICAgY29uc3QgdGFrZVNlbGVjdGlvbnMgPSB0aGlzLmdldFNlbGVjdGlvblRha2VyKClcbiAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgY29uc3Qgc2VsZWN0aW9ucyA9IHRha2VTZWxlY3Rpb25zKClcbiAgICAgIGlmICghc2VsZWN0aW9ucy5sZW5ndGgpIHJldHVyblxuICAgICAgY29uc3QgbWF4Q29sdW1uID0gc2VsZWN0aW9ucy5tYXAoY29sdW1uRm9yU2VsZWN0aW9uKS5yZWR1Y2UoKG1heCwgY3VyKSA9PiAoY3VyID4gbWF4ID8gY3VyIDogbWF4KSlcbiAgICAgIGZvciAoY29uc3Qgc2VsZWN0aW9uIG9mIHNlbGVjdGlvbnMpIHtcbiAgICAgICAgY29uc3Qgcm93ID0gc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKCkuc3RhcnQucm93XG4gICAgICAgIGNvbnN0IGFtb3VudE9mUGFkZGluZyA9IG1heENvbHVtbiAtIGNvbHVtbkZvclNlbGVjdGlvbihzZWxlY3Rpb24pXG4gICAgICAgIHRvdGFsQW1vdW50T2ZQYWRkaW5nQnlSb3dbcm93XSA9ICh0b3RhbEFtb3VudE9mUGFkZGluZ0J5Um93W3Jvd10gfHwgMCkgKyBhbW91bnRPZlBhZGRpbmdcbiAgICAgICAgdGhpcy5hbW91bnRPZlBhZGRpbmdCeVNlbGVjdGlvbi5zZXQoc2VsZWN0aW9uLCBhbW91bnRPZlBhZGRpbmcpXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZXhlY3V0ZSgpIHtcbiAgICB0aGlzLmFtb3VudE9mUGFkZGluZ0J5U2VsZWN0aW9uID0gbmV3IE1hcCgpXG4gICAgdGhpcy5vbkRpZFNlbGVjdFRhcmdldCgoKSA9PiB7XG4gICAgICB0aGlzLmNhbGN1bGF0ZVBhZGRpbmcoKVxuICAgIH0pXG4gICAgc3VwZXIuZXhlY3V0ZSgpXG4gIH1cblxuICBnZXROZXdUZXh0KHRleHQsIHNlbGVjdGlvbikge1xuICAgIGNvbnN0IHBhZGRpbmcgPSBcIiBcIi5yZXBlYXQodGhpcy5hbW91bnRPZlBhZGRpbmdCeVNlbGVjdGlvbi5nZXQoc2VsZWN0aW9uKSlcbiAgICBjb25zdCB3aGljaFRvUGFkID0gdGhpcy5nZXRXaWNoVG9QYWRGb3JUZXh0KHNlbGVjdGlvbi5nZXRUZXh0KCkpXG4gICAgcmV0dXJuIHdoaWNoVG9QYWQgPT09IFwic3RhcnRcIiA/IHBhZGRpbmcgKyB0ZXh0IDogdGV4dCArIHBhZGRpbmdcbiAgfVxufVxuXG5jbGFzcyBBbGlnbk9jY3VycmVuY2VCeVBhZExlZnQgZXh0ZW5kcyBBbGlnbk9jY3VycmVuY2Uge1xuICB3aGljaFRvUGFkID0gXCJzdGFydFwiXG59XG5cbmNsYXNzIEFsaWduT2NjdXJyZW5jZUJ5UGFkUmlnaHQgZXh0ZW5kcyBBbGlnbk9jY3VycmVuY2Uge1xuICB3aGljaFRvUGFkID0gXCJlbmRcIlxufVxuXG5jbGFzcyBSZW1vdmVMZWFkaW5nV2hpdGVTcGFjZXMgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmcge1xuICB3aXNlID0gXCJsaW5ld2lzZVwiXG4gIGdldE5ld1RleHQodGV4dCwgc2VsZWN0aW9uKSB7XG4gICAgY29uc3QgdHJpbUxlZnQgPSB0ZXh0ID0+IHRleHQudHJpbUxlZnQoKVxuICAgIHJldHVybiAoXG4gICAgICB0aGlzLnV0aWxzXG4gICAgICAgIC5zcGxpdFRleHRCeU5ld0xpbmUodGV4dClcbiAgICAgICAgLm1hcCh0cmltTGVmdClcbiAgICAgICAgLmpvaW4oXCJcXG5cIikgKyBcIlxcblwiXG4gICAgKVxuICB9XG59XG5cbmNsYXNzIENvbnZlcnRUb1NvZnRUYWIgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmcge1xuICBzdGF0aWMgZGlzcGxheU5hbWUgPSBcIlNvZnQgVGFiXCJcbiAgd2lzZSA9IFwibGluZXdpc2VcIlxuXG4gIG11dGF0ZVNlbGVjdGlvbihzZWxlY3Rpb24pIHtcbiAgICB0aGlzLnNjYW5FZGl0b3IoXCJmb3J3YXJkXCIsIC9cXHQvZywge3NjYW5SYW5nZTogc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKCl9LCAoe3JhbmdlLCByZXBsYWNlfSkgPT4ge1xuICAgICAgLy8gUmVwbGFjZSBcXHQgdG8gc3BhY2VzIHdoaWNoIGxlbmd0aCBpcyB2YXJ5IGRlcGVuZGluZyBvbiB0YWJTdG9wIGFuZCB0YWJMZW5naHRcbiAgICAgIC8vIFNvIHdlIGRpcmVjdGx5IGNvbnN1bHQgaXQncyBzY3JlZW4gcmVwcmVzZW50aW5nIGxlbmd0aC5cbiAgICAgIGNvbnN0IGxlbmd0aCA9IHRoaXMuZWRpdG9yLnNjcmVlblJhbmdlRm9yQnVmZmVyUmFuZ2UocmFuZ2UpLmdldEV4dGVudCgpLmNvbHVtblxuICAgICAgcmVwbGFjZShcIiBcIi5yZXBlYXQobGVuZ3RoKSlcbiAgICB9KVxuICB9XG59XG5cbmNsYXNzIENvbnZlcnRUb0hhcmRUYWIgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmcge1xuICBzdGF0aWMgZGlzcGxheU5hbWUgPSBcIkhhcmQgVGFiXCJcblxuICBtdXRhdGVTZWxlY3Rpb24oc2VsZWN0aW9uKSB7XG4gICAgY29uc3QgdGFiTGVuZ3RoID0gdGhpcy5lZGl0b3IuZ2V0VGFiTGVuZ3RoKClcbiAgICB0aGlzLnNjYW5FZGl0b3IoXCJmb3J3YXJkXCIsIC9bIFxcdF0rL2csIHtzY2FuUmFuZ2U6IHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpfSwgKHtyYW5nZSwgcmVwbGFjZX0pID0+IHtcbiAgICAgIGNvbnN0IHtzdGFydCwgZW5kfSA9IHRoaXMuZWRpdG9yLnNjcmVlblJhbmdlRm9yQnVmZmVyUmFuZ2UocmFuZ2UpXG4gICAgICBsZXQgc3RhcnRDb2x1bW4gPSBzdGFydC5jb2x1bW5cbiAgICAgIGNvbnN0IGVuZENvbHVtbiA9IGVuZC5jb2x1bW5cblxuICAgICAgLy8gV2UgY2FuJ3QgbmFpdmVseSByZXBsYWNlIHNwYWNlcyB0byB0YWIsIHdlIGhhdmUgdG8gY29uc2lkZXIgdmFsaWQgdGFiU3RvcCBjb2x1bW5cbiAgICAgIC8vIElmIG5leHRUYWJTdG9wIGNvbHVtbiBleGNlZWRzIHJlcGxhY2FibGUgcmFuZ2UsIHdlIHBhZCB3aXRoIHNwYWNlcy5cbiAgICAgIGxldCBuZXdUZXh0ID0gXCJcIlxuICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgY29uc3QgcmVtYWluZGVyID0gc3RhcnRDb2x1bW4gJSB0YWJMZW5ndGhcbiAgICAgICAgY29uc3QgbmV4dFRhYlN0b3AgPSBzdGFydENvbHVtbiArIChyZW1haW5kZXIgPT09IDAgPyB0YWJMZW5ndGggOiByZW1haW5kZXIpXG4gICAgICAgIGlmIChuZXh0VGFiU3RvcCA+IGVuZENvbHVtbikge1xuICAgICAgICAgIG5ld1RleHQgKz0gXCIgXCIucmVwZWF0KGVuZENvbHVtbiAtIHN0YXJ0Q29sdW1uKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG5ld1RleHQgKz0gXCJcXHRcIlxuICAgICAgICB9XG4gICAgICAgIHN0YXJ0Q29sdW1uID0gbmV4dFRhYlN0b3BcbiAgICAgICAgaWYgKHN0YXJ0Q29sdW1uID49IGVuZENvbHVtbikge1xuICAgICAgICAgIGJyZWFrXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmVwbGFjZShuZXdUZXh0KVxuICAgIH0pXG4gIH1cbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgVHJhbnNmb3JtU3RyaW5nQnlFeHRlcm5hbENvbW1hbmQgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmcge1xuICBzdGF0aWMgY29tbWFuZCA9IGZhbHNlXG4gIGF1dG9JbmRlbnQgPSB0cnVlXG4gIGNvbW1hbmQgPSBcIlwiIC8vIGUuZy4gY29tbWFuZDogJ3NvcnQnXG4gIGFyZ3MgPSBbXSAvLyBlLmcgYXJnczogWyctcm4nXVxuXG4gIC8vIE5PVEU6IFVubGlrZSBvdGhlciBjbGFzcywgZmlyc3QgYXJnIGlzIGBzdGRvdXRgIG9mIGV4dGVybmFsIGNvbW1hbmRzLlxuICBnZXROZXdUZXh0KHRleHQsIHNlbGVjdGlvbikge1xuICAgIHJldHVybiB0ZXh0IHx8IHNlbGVjdGlvbi5nZXRUZXh0KClcbiAgfVxuICBnZXRDb21tYW5kKHNlbGVjdGlvbikge1xuICAgIHJldHVybiB7Y29tbWFuZDogdGhpcy5jb21tYW5kLCBhcmdzOiB0aGlzLmFyZ3N9XG4gIH1cbiAgZ2V0U3RkaW4oc2VsZWN0aW9uKSB7XG4gICAgcmV0dXJuIHNlbGVjdGlvbi5nZXRUZXh0KClcbiAgfVxuXG4gIGFzeW5jIGV4ZWN1dGUoKSB7XG4gICAgdGhpcy5wcmVTZWxlY3QoKVxuXG4gICAgaWYgKHRoaXMuc2VsZWN0VGFyZ2V0KCkpIHtcbiAgICAgIGZvciAoY29uc3Qgc2VsZWN0aW9uIG9mIHRoaXMuZWRpdG9yLmdldFNlbGVjdGlvbnMoKSkge1xuICAgICAgICBjb25zdCB7Y29tbWFuZCwgYXJnc30gPSB0aGlzLmdldENvbW1hbmQoc2VsZWN0aW9uKSB8fCB7fVxuICAgICAgICBpZiAoY29tbWFuZCA9PSBudWxsIHx8IGFyZ3MgPT0gbnVsbCkgY29udGludWVcblxuICAgICAgICBjb25zdCBzdGRvdXQgPSBhd2FpdCB0aGlzLnJ1bkV4dGVybmFsQ29tbWFuZCh7Y29tbWFuZCwgYXJncywgc3RkaW46IHRoaXMuZ2V0U3RkaW4oc2VsZWN0aW9uKX0pXG4gICAgICAgIHNlbGVjdGlvbi5pbnNlcnRUZXh0KHRoaXMuZ2V0TmV3VGV4dChzdGRvdXQsIHNlbGVjdGlvbiksIHthdXRvSW5kZW50OiB0aGlzLmF1dG9JbmRlbnR9KVxuICAgICAgfVxuICAgICAgdGhpcy5tdXRhdGlvbk1hbmFnZXIuc2V0Q2hlY2twb2ludChcImRpZC1maW5pc2hcIilcbiAgICAgIHRoaXMucmVzdG9yZUN1cnNvclBvc2l0aW9uc0lmTmVjZXNzYXJ5KClcbiAgICB9XG4gICAgdGhpcy5wb3N0TXV0YXRlKClcbiAgfVxuXG4gIHJ1bkV4dGVybmFsQ29tbWFuZChvcHRpb25zKSB7XG4gICAgbGV0IG91dHB1dCA9IFwiXCJcbiAgICBvcHRpb25zLnN0ZG91dCA9IGRhdGEgPT4gKG91dHB1dCArPSBkYXRhKVxuICAgIGNvbnN0IGV4aXRQcm9taXNlID0gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgICBvcHRpb25zLmV4aXQgPSAoKSA9PiByZXNvbHZlKG91dHB1dClcbiAgICB9KVxuICAgIGNvbnN0IHtzdGRpbn0gPSBvcHRpb25zXG4gICAgZGVsZXRlIG9wdGlvbnMuc3RkaW5cbiAgICBjb25zdCBidWZmZXJlZFByb2Nlc3MgPSBuZXcgQnVmZmVyZWRQcm9jZXNzKG9wdGlvbnMpXG4gICAgYnVmZmVyZWRQcm9jZXNzLm9uV2lsbFRocm93RXJyb3IoKHtlcnJvciwgaGFuZGxlfSkgPT4ge1xuICAgICAgLy8gU3VwcHJlc3MgY29tbWFuZCBub3QgZm91bmQgZXJyb3IgaW50ZW50aW9uYWxseS5cbiAgICAgIGlmIChlcnJvci5jb2RlID09PSBcIkVOT0VOVFwiICYmIGVycm9yLnN5c2NhbGwuaW5kZXhPZihcInNwYXduXCIpID09PSAwKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGAke3RoaXMuZ2V0Q29tbWFuZE5hbWUoKX06IEZhaWxlZCB0byBzcGF3biBjb21tYW5kICR7ZXJyb3IucGF0aH0uYClcbiAgICAgICAgaGFuZGxlKClcbiAgICAgIH1cbiAgICAgIHRoaXMuY2FuY2VsT3BlcmF0aW9uKClcbiAgICB9KVxuXG4gICAgaWYgKHN0ZGluKSB7XG4gICAgICBidWZmZXJlZFByb2Nlc3MucHJvY2Vzcy5zdGRpbi53cml0ZShzdGRpbilcbiAgICAgIGJ1ZmZlcmVkUHJvY2Vzcy5wcm9jZXNzLnN0ZGluLmVuZCgpXG4gICAgfVxuICAgIHJldHVybiBleGl0UHJvbWlzZVxuICB9XG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIFRyYW5zZm9ybVN0cmluZ0J5U2VsZWN0TGlzdCBleHRlbmRzIFRyYW5zZm9ybVN0cmluZyB7XG4gIGlzUmVhZHkoKSB7XG4gICAgLy8gVGhpcyBjb21tYW5kIGlzIGp1c3QgZ2F0ZSB0byBleGVjdXRlIGFub3RoZXIgb3BlcmF0b3IuXG4gICAgLy8gU28gbmV2ZXIgZ2V0IHJlYWR5IGFuZCBuZXZlciBiZSBleGVjdXRlZC5cbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIGluaXRpYWxpemUoKSB7XG4gICAgdGhpcy5mb2N1c1NlbGVjdExpc3Qoe2l0ZW1zOiB0aGlzLmNvbnN0cnVjdG9yLmdldFNlbGVjdExpc3RJdGVtcygpfSlcbiAgICB0aGlzLnZpbVN0YXRlLm9uRGlkQ29uZmlybVNlbGVjdExpc3QoaXRlbSA9PiB7XG4gICAgICB0aGlzLnZpbVN0YXRlLnJlc2V0KClcbiAgICAgIHRoaXMudmltU3RhdGUub3BlcmF0aW9uU3RhY2sucnVuKGl0ZW0ua2xhc3MsIHt0YXJnZXQ6IHRoaXMudGFyZ2V0fSlcbiAgICB9KVxuICB9XG5cbiAgc3RhdGljIGdldFNlbGVjdExpc3RJdGVtcygpIHtcbiAgICBpZiAoIXRoaXMuc2VsZWN0TGlzdEl0ZW1zKSB7XG4gICAgICB0aGlzLnNlbGVjdExpc3RJdGVtcyA9IHRoaXMuc3RyaW5nVHJhbnNmb3JtZXJzLm1hcChrbGFzcyA9PiB7XG4gICAgICAgIGNvbnN0IHN1ZmZpeCA9IGtsYXNzLmhhc093blByb3BlcnR5KFwiZGlzcGxheU5hbWVTdWZmaXhcIikgPyBcIiBcIiArIGtsYXNzLmRpc3BsYXlOYW1lU3VmZml4IDogXCJcIlxuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAga2xhc3M6IGtsYXNzLFxuICAgICAgICAgIGRpc3BsYXlOYW1lOiBrbGFzcy5oYXNPd25Qcm9wZXJ0eShcImRpc3BsYXlOYW1lXCIpXG4gICAgICAgICAgICA/IGtsYXNzLmRpc3BsYXlOYW1lICsgc3VmZml4XG4gICAgICAgICAgICA6IHRoaXMuXy5odW1hbml6ZUV2ZW50TmFtZSh0aGlzLl8uZGFzaGVyaXplKGtsYXNzLm5hbWUpKSArIHN1ZmZpeCxcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuc2VsZWN0TGlzdEl0ZW1zXG4gIH1cblxuICBleGVjdXRlKCkge1xuICAgIHRocm93IG5ldyBFcnJvcihgJHt0aGlzLm5hbWV9IHNob3VsZCBub3QgYmUgZXhlY3V0ZWRgKVxuICB9XG59XG5cbmNsYXNzIFRyYW5zZm9ybVdvcmRCeVNlbGVjdExpc3QgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmdCeVNlbGVjdExpc3Qge1xuICB0YXJnZXQgPSBcIklubmVyV29yZFwiXG59XG5cbmNsYXNzIFRyYW5zZm9ybVNtYXJ0V29yZEJ5U2VsZWN0TGlzdCBleHRlbmRzIFRyYW5zZm9ybVN0cmluZ0J5U2VsZWN0TGlzdCB7XG4gIHRhcmdldCA9IFwiSW5uZXJTbWFydFdvcmRcIlxufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBSZXBsYWNlV2l0aFJlZ2lzdGVyIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nIHtcbiAgZmxhc2hUeXBlID0gXCJvcGVyYXRvci1sb25nXCJcblxuICBpbml0aWFsaXplKCkge1xuICAgIHRoaXMudmltU3RhdGUuc2VxdWVudGlhbFBhc3RlTWFuYWdlci5vbkluaXRpYWxpemUodGhpcylcbiAgICBzdXBlci5pbml0aWFsaXplKClcbiAgfVxuXG4gIGV4ZWN1dGUoKSB7XG4gICAgdGhpcy5zZXF1ZW50aWFsUGFzdGUgPSB0aGlzLnZpbVN0YXRlLnNlcXVlbnRpYWxQYXN0ZU1hbmFnZXIub25FeGVjdXRlKHRoaXMpXG5cbiAgICBzdXBlci5leGVjdXRlKClcblxuICAgIGZvciAoY29uc3Qgc2VsZWN0aW9uIG9mIHRoaXMuZWRpdG9yLmdldFNlbGVjdGlvbnMoKSkge1xuICAgICAgY29uc3QgcmFuZ2UgPSB0aGlzLm11dGF0aW9uTWFuYWdlci5nZXRNdXRhdGVkQnVmZmVyUmFuZ2VGb3JTZWxlY3Rpb24oc2VsZWN0aW9uKVxuICAgICAgdGhpcy52aW1TdGF0ZS5zZXF1ZW50aWFsUGFzdGVNYW5hZ2VyLnNhdmVQYXN0ZWRSYW5nZUZvclNlbGVjdGlvbihzZWxlY3Rpb24sIHJhbmdlKVxuICAgIH1cbiAgfVxuXG4gIGdldE5ld1RleHQodGV4dCwgc2VsZWN0aW9uKSB7XG4gICAgY29uc3QgdmFsdWUgPSB0aGlzLnZpbVN0YXRlLnJlZ2lzdGVyLmdldChudWxsLCBzZWxlY3Rpb24sIHRoaXMuc2VxdWVudGlhbFBhc3RlKVxuICAgIHJldHVybiB2YWx1ZSA/IHZhbHVlLnRleHQgOiBcIlwiXG4gIH1cbn1cblxuY2xhc3MgUmVwbGFjZU9jY3VycmVuY2VXaXRoUmVnaXN0ZXIgZXh0ZW5kcyBSZXBsYWNlV2l0aFJlZ2lzdGVyIHtcbiAgb2NjdXJyZW5jZSA9IHRydWVcbn1cblxuLy8gU2F2ZSB0ZXh0IHRvIHJlZ2lzdGVyIGJlZm9yZSByZXBsYWNlXG5jbGFzcyBTd2FwV2l0aFJlZ2lzdGVyIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nIHtcbiAgZ2V0TmV3VGV4dCh0ZXh0LCBzZWxlY3Rpb24pIHtcbiAgICBjb25zdCBuZXdUZXh0ID0gdGhpcy52aW1TdGF0ZS5yZWdpc3Rlci5nZXRUZXh0KClcbiAgICB0aGlzLnNldFRleHRUb1JlZ2lzdGVyKHRleHQsIHNlbGVjdGlvbilcbiAgICByZXR1cm4gbmV3VGV4dFxuICB9XG59XG5cbi8vIEluZGVudCA8IFRyYW5zZm9ybVN0cmluZ1xuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgSW5kZW50IGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nIHtcbiAgc3RheUJ5TWFya2VyID0gdHJ1ZVxuICBzZXRUb0ZpcnN0Q2hhcmFjdGVyT25MaW5ld2lzZSA9IHRydWVcbiAgd2lzZSA9IFwibGluZXdpc2VcIlxuXG4gIG11dGF0ZVNlbGVjdGlvbihzZWxlY3Rpb24pIHtcbiAgICAvLyBOZWVkIGNvdW50IHRpbWVzIGluZGVudGF0aW9uIGluIHZpc3VhbC1tb2RlIGFuZCBpdHMgcmVwZWF0KGAuYCkuXG4gICAgaWYgKHRoaXMudGFyZ2V0Lm5hbWUgPT09IFwiQ3VycmVudFNlbGVjdGlvblwiKSB7XG4gICAgICBsZXQgb2xkVGV4dFxuICAgICAgLy8gbGltaXQgdG8gMTAwIHRvIGF2b2lkIGZyZWV6aW5nIGJ5IGFjY2lkZW50YWwgYmlnIG51bWJlci5cbiAgICAgIHRoaXMuY291bnRUaW1lcyh0aGlzLmxpbWl0TnVtYmVyKHRoaXMuZ2V0Q291bnQoKSwge21heDogMTAwfSksICh7c3RvcH0pID0+IHtcbiAgICAgICAgb2xkVGV4dCA9IHNlbGVjdGlvbi5nZXRUZXh0KClcbiAgICAgICAgdGhpcy5pbmRlbnQoc2VsZWN0aW9uKVxuICAgICAgICBpZiAoc2VsZWN0aW9uLmdldFRleHQoKSA9PT0gb2xkVGV4dCkgc3RvcCgpXG4gICAgICB9KVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmluZGVudChzZWxlY3Rpb24pXG4gICAgfVxuICB9XG5cbiAgaW5kZW50KHNlbGVjdGlvbikge1xuICAgIHNlbGVjdGlvbi5pbmRlbnRTZWxlY3RlZFJvd3MoKVxuICB9XG59XG5cbmNsYXNzIE91dGRlbnQgZXh0ZW5kcyBJbmRlbnQge1xuICBpbmRlbnQoc2VsZWN0aW9uKSB7XG4gICAgc2VsZWN0aW9uLm91dGRlbnRTZWxlY3RlZFJvd3MoKVxuICB9XG59XG5cbmNsYXNzIEF1dG9JbmRlbnQgZXh0ZW5kcyBJbmRlbnQge1xuICBpbmRlbnQoc2VsZWN0aW9uKSB7XG4gICAgc2VsZWN0aW9uLmF1dG9JbmRlbnRTZWxlY3RlZFJvd3MoKVxuICB9XG59XG5cbmNsYXNzIFRvZ2dsZUxpbmVDb21tZW50cyBleHRlbmRzIFRyYW5zZm9ybVN0cmluZyB7XG4gIGZsYXNoVGFyZ2V0ID0gZmFsc2VcbiAgc3RheUJ5TWFya2VyID0gdHJ1ZVxuICBzdGF5QXRTYW1lUG9zaXRpb24gPSB0cnVlXG4gIHdpc2UgPSBcImxpbmV3aXNlXCJcblxuICBtdXRhdGVTZWxlY3Rpb24oc2VsZWN0aW9uKSB7XG4gICAgc2VsZWN0aW9uLnRvZ2dsZUxpbmVDb21tZW50cygpXG4gIH1cbn1cblxuY2xhc3MgUmVmbG93IGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nIHtcbiAgbXV0YXRlU2VsZWN0aW9uKHNlbGVjdGlvbikge1xuICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2godGhpcy5lZGl0b3JFbGVtZW50LCBcImF1dG9mbG93OnJlZmxvdy1zZWxlY3Rpb25cIilcbiAgfVxufVxuXG5jbGFzcyBSZWZsb3dXaXRoU3RheSBleHRlbmRzIFJlZmxvdyB7XG4gIHN0YXlBdFNhbWVQb3NpdGlvbiA9IHRydWVcbn1cblxuLy8gU3Vycm91bmQgPCBUcmFuc2Zvcm1TdHJpbmdcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIFN1cnJvdW5kQmFzZSBleHRlbmRzIFRyYW5zZm9ybVN0cmluZyB7XG4gIHN0YXRpYyBjb21tYW5kID0gZmFsc2VcbiAgc3Vycm91bmRBY3Rpb24gPSBudWxsXG4gIHBhaXJzID0gW1tcIihcIiwgXCIpXCJdLCBbXCJ7XCIsIFwifVwiXSwgW1wiW1wiLCBcIl1cIl0sIFtcIjxcIiwgXCI+XCJdXVxuICBwYWlyc0J5QWxpYXMgPSB7XG4gICAgYjogW1wiKFwiLCBcIilcIl0sXG4gICAgQjogW1wie1wiLCBcIn1cIl0sXG4gICAgcjogW1wiW1wiLCBcIl1cIl0sXG4gICAgYTogW1wiPFwiLCBcIj5cIl0sXG4gIH1cblxuICBnZXRQYWlyKGNoYXIpIHtcbiAgICByZXR1cm4gY2hhciBpbiB0aGlzLnBhaXJzQnlBbGlhc1xuICAgICAgPyB0aGlzLnBhaXJzQnlBbGlhc1tjaGFyXVxuICAgICAgOiBbLi4udGhpcy5wYWlycywgW2NoYXIsIGNoYXJdXS5maW5kKHBhaXIgPT4gcGFpci5pbmNsdWRlcyhjaGFyKSlcbiAgfVxuXG4gIHN1cnJvdW5kKHRleHQsIGNoYXIsIHtrZWVwTGF5b3V0ID0gZmFsc2V9ID0ge30pIHtcbiAgICBsZXQgW29wZW4sIGNsb3NlXSA9IHRoaXMuZ2V0UGFpcihjaGFyKVxuICAgIGlmICgha2VlcExheW91dCAmJiB0ZXh0LmVuZHNXaXRoKFwiXFxuXCIpKSB7XG4gICAgICB0aGlzLmF1dG9JbmRlbnRBZnRlckluc2VydFRleHQgPSB0cnVlXG4gICAgICBvcGVuICs9IFwiXFxuXCJcbiAgICAgIGNsb3NlICs9IFwiXFxuXCJcbiAgICB9XG5cbiAgICBpZiAodGhpcy5nZXRDb25maWcoXCJjaGFyYWN0ZXJzVG9BZGRTcGFjZU9uU3Vycm91bmRcIikuaW5jbHVkZXMoY2hhcikgJiYgdGhpcy51dGlscy5pc1NpbmdsZUxpbmVUZXh0KHRleHQpKSB7XG4gICAgICB0ZXh0ID0gXCIgXCIgKyB0ZXh0ICsgXCIgXCJcbiAgICB9XG5cbiAgICByZXR1cm4gb3BlbiArIHRleHQgKyBjbG9zZVxuICB9XG5cbiAgZGVsZXRlU3Vycm91bmQodGV4dCkge1xuICAgIC8vIEFzc3VtZSBzdXJyb3VuZGluZyBjaGFyIGlzIG9uZS1jaGFyIGxlbmd0aC5cbiAgICBjb25zdCBvcGVuID0gdGV4dFswXVxuICAgIGNvbnN0IGNsb3NlID0gdGV4dFt0ZXh0Lmxlbmd0aCAtIDFdXG4gICAgY29uc3QgaW5uZXJUZXh0ID0gdGV4dC5zbGljZSgxLCB0ZXh0Lmxlbmd0aCAtIDEpXG4gICAgcmV0dXJuIHRoaXMudXRpbHMuaXNTaW5nbGVMaW5lVGV4dCh0ZXh0KSAmJiBvcGVuICE9PSBjbG9zZSA/IGlubmVyVGV4dC50cmltKCkgOiBpbm5lclRleHRcbiAgfVxuXG4gIGdldE5ld1RleHQodGV4dCkge1xuICAgIGlmICh0aGlzLnN1cnJvdW5kQWN0aW9uID09PSBcInN1cnJvdW5kXCIpIHtcbiAgICAgIHJldHVybiB0aGlzLnN1cnJvdW5kKHRleHQsIHRoaXMuaW5wdXQpXG4gICAgfSBlbHNlIGlmICh0aGlzLnN1cnJvdW5kQWN0aW9uID09PSBcImRlbGV0ZS1zdXJyb3VuZFwiKSB7XG4gICAgICByZXR1cm4gdGhpcy5kZWxldGVTdXJyb3VuZCh0ZXh0KVxuICAgIH0gZWxzZSBpZiAodGhpcy5zdXJyb3VuZEFjdGlvbiA9PT0gXCJjaGFuZ2Utc3Vycm91bmRcIikge1xuICAgICAgcmV0dXJuIHRoaXMuc3Vycm91bmQodGhpcy5kZWxldGVTdXJyb3VuZCh0ZXh0KSwgdGhpcy5pbnB1dCwge2tlZXBMYXlvdXQ6IHRydWV9KVxuICAgIH1cbiAgfVxufVxuXG5jbGFzcyBTdXJyb3VuZCBleHRlbmRzIFN1cnJvdW5kQmFzZSB7XG4gIHN1cnJvdW5kQWN0aW9uID0gXCJzdXJyb3VuZFwiXG4gIHJlYWRJbnB1dEFmdGVyU2VsZWN0ID0gdHJ1ZVxufVxuXG5jbGFzcyBTdXJyb3VuZFdvcmQgZXh0ZW5kcyBTdXJyb3VuZCB7XG4gIHRhcmdldCA9IFwiSW5uZXJXb3JkXCJcbn1cblxuY2xhc3MgU3Vycm91bmRTbWFydFdvcmQgZXh0ZW5kcyBTdXJyb3VuZCB7XG4gIHRhcmdldCA9IFwiSW5uZXJTbWFydFdvcmRcIlxufVxuXG5jbGFzcyBNYXBTdXJyb3VuZCBleHRlbmRzIFN1cnJvdW5kIHtcbiAgb2NjdXJyZW5jZSA9IHRydWVcbiAgcGF0dGVybkZvck9jY3VycmVuY2UgPSAvXFx3Ky9nXG59XG5cbi8vIERlbGV0ZSBTdXJyb3VuZFxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgRGVsZXRlU3Vycm91bmQgZXh0ZW5kcyBTdXJyb3VuZEJhc2Uge1xuICBzdXJyb3VuZEFjdGlvbiA9IFwiZGVsZXRlLXN1cnJvdW5kXCJcbiAgaW5pdGlhbGl6ZSgpIHtcbiAgICBpZiAoIXRoaXMudGFyZ2V0KSB7XG4gICAgICB0aGlzLmZvY3VzSW5wdXQoe1xuICAgICAgICBvbkNvbmZpcm06IGNoYXIgPT4ge1xuICAgICAgICAgIHRoaXMuc2V0VGFyZ2V0KHRoaXMuZ2V0SW5zdGFuY2UoXCJBUGFpclwiLCB7cGFpcjogdGhpcy5nZXRQYWlyKGNoYXIpfSkpXG4gICAgICAgICAgdGhpcy5wcm9jZXNzT3BlcmF0aW9uKClcbiAgICAgICAgfSxcbiAgICAgIH0pXG4gICAgfVxuICAgIHN1cGVyLmluaXRpYWxpemUoKVxuICB9XG59XG5cbmNsYXNzIERlbGV0ZVN1cnJvdW5kQW55UGFpciBleHRlbmRzIERlbGV0ZVN1cnJvdW5kIHtcbiAgdGFyZ2V0ID0gXCJBQW55UGFpclwiXG59XG5cbmNsYXNzIERlbGV0ZVN1cnJvdW5kQW55UGFpckFsbG93Rm9yd2FyZGluZyBleHRlbmRzIERlbGV0ZVN1cnJvdW5kQW55UGFpciB7XG4gIHRhcmdldCA9IFwiQUFueVBhaXJBbGxvd0ZvcndhcmRpbmdcIlxufVxuXG4vLyBDaGFuZ2UgU3Vycm91bmRcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIENoYW5nZVN1cnJvdW5kIGV4dGVuZHMgRGVsZXRlU3Vycm91bmQge1xuICBzdXJyb3VuZEFjdGlvbiA9IFwiY2hhbmdlLXN1cnJvdW5kXCJcbiAgcmVhZElucHV0QWZ0ZXJTZWxlY3QgPSB0cnVlXG5cbiAgLy8gT3ZlcnJpZGUgdG8gc2hvdyBjaGFuZ2luZyBjaGFyIG9uIGhvdmVyXG4gIGFzeW5jIGZvY3VzSW5wdXRQcm9taXNlZCguLi5hcmdzKSB7XG4gICAgY29uc3QgaG92ZXJQb2ludCA9IHRoaXMubXV0YXRpb25NYW5hZ2VyLmdldEluaXRpYWxQb2ludEZvclNlbGVjdGlvbih0aGlzLmVkaXRvci5nZXRMYXN0U2VsZWN0aW9uKCkpXG4gICAgdGhpcy52aW1TdGF0ZS5ob3Zlci5zZXQodGhpcy5lZGl0b3IuZ2V0U2VsZWN0ZWRUZXh0KClbMF0sIGhvdmVyUG9pbnQpXG4gICAgcmV0dXJuIHN1cGVyLmZvY3VzSW5wdXRQcm9taXNlZCguLi5hcmdzKVxuICB9XG59XG5cbmNsYXNzIENoYW5nZVN1cnJvdW5kQW55UGFpciBleHRlbmRzIENoYW5nZVN1cnJvdW5kIHtcbiAgdGFyZ2V0ID0gXCJBQW55UGFpclwiXG59XG5cbmNsYXNzIENoYW5nZVN1cnJvdW5kQW55UGFpckFsbG93Rm9yd2FyZGluZyBleHRlbmRzIENoYW5nZVN1cnJvdW5kQW55UGFpciB7XG4gIHRhcmdldCA9IFwiQUFueVBhaXJBbGxvd0ZvcndhcmRpbmdcIlxufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBGSVhNRVxuLy8gQ3VycmVudGx5IG5hdGl2ZSBlZGl0b3Iuam9pbkxpbmVzKCkgaXMgYmV0dGVyIGZvciBjdXJzb3IgcG9zaXRpb24gc2V0dGluZ1xuLy8gU28gSSB1c2UgbmF0aXZlIG1ldGhvZHMgZm9yIGEgbWVhbndoaWxlLlxuY2xhc3MgSm9pblRhcmdldCBleHRlbmRzIFRyYW5zZm9ybVN0cmluZyB7XG4gIGZsYXNoVGFyZ2V0ID0gZmFsc2VcbiAgcmVzdG9yZVBvc2l0aW9ucyA9IGZhbHNlXG5cbiAgbXV0YXRlU2VsZWN0aW9uKHNlbGVjdGlvbikge1xuICAgIGNvbnN0IHJhbmdlID0gc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKClcblxuICAgIC8vIFdoZW4gY3Vyc29yIGlzIGF0IGxhc3QgQlVGRkVSIHJvdywgaXQgc2VsZWN0IGxhc3QtYnVmZmVyLXJvdywgdGhlblxuICAgIC8vIGpvaW5uaW5nIHJlc3VsdCBpbiBcImNsZWFyIGxhc3QtYnVmZmVyLXJvdyB0ZXh0XCIuXG4gICAgLy8gSSBiZWxpZXZlIHRoaXMgaXMgQlVHIG9mIHVwc3RyZWFtIGF0b20tY29yZS4gZ3VhcmQgdGhpcyBzaXR1YXRpb24gaGVyZVxuICAgIGlmICghcmFuZ2UuaXNTaW5nbGVMaW5lKCkgfHwgcmFuZ2UuZW5kLnJvdyAhPT0gdGhpcy5lZGl0b3IuZ2V0TGFzdEJ1ZmZlclJvdygpKSB7XG4gICAgICBpZiAodGhpcy51dGlscy5pc0xpbmV3aXNlUmFuZ2UocmFuZ2UpKSB7XG4gICAgICAgIHNlbGVjdGlvbi5zZXRCdWZmZXJSYW5nZShyYW5nZS50cmFuc2xhdGUoWzAsIDBdLCBbLTEsIEluZmluaXR5XSkpXG4gICAgICB9XG4gICAgICBzZWxlY3Rpb24uam9pbkxpbmVzKClcbiAgICB9XG4gICAgY29uc3QgcG9pbnQgPSBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKS5lbmQudHJhbnNsYXRlKFswLCAtMV0pXG4gICAgcmV0dXJuIHNlbGVjdGlvbi5jdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24ocG9pbnQpXG4gIH1cbn1cblxuY2xhc3MgSm9pbiBleHRlbmRzIEpvaW5UYXJnZXQge1xuICB0YXJnZXQgPSBcIk1vdmVUb1JlbGF0aXZlTGluZVwiXG59XG5cbmNsYXNzIEpvaW5CYXNlIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nIHtcbiAgc3RhdGljIGNvbW1hbmQgPSBmYWxzZVxuICB3aXNlID0gXCJsaW5ld2lzZVwiXG4gIHRyaW0gPSBmYWxzZVxuICB0YXJnZXQgPSBcIk1vdmVUb1JlbGF0aXZlTGluZU1pbmltdW1Ud29cIlxuXG4gIGdldE5ld1RleHQodGV4dCkge1xuICAgIGNvbnN0IHJlZ2V4ID0gdGhpcy50cmltID8gL1xccj9cXG5bIFxcdF0qL2cgOiAvXFxyP1xcbi9nXG4gICAgcmV0dXJuIHRleHQudHJpbVJpZ2h0KCkucmVwbGFjZShyZWdleCwgdGhpcy5pbnB1dCkgKyBcIlxcblwiXG4gIH1cbn1cblxuY2xhc3MgSm9pbldpdGhLZWVwaW5nU3BhY2UgZXh0ZW5kcyBKb2luQmFzZSB7XG4gIGlucHV0ID0gXCJcIlxufVxuXG5jbGFzcyBKb2luQnlJbnB1dCBleHRlbmRzIEpvaW5CYXNlIHtcbiAgcmVhZElucHV0QWZ0ZXJTZWxlY3QgPSB0cnVlXG4gIGZvY3VzSW5wdXRPcHRpb25zID0ge2NoYXJzTWF4OiAxMH1cbiAgdHJpbSA9IHRydWVcbn1cblxuY2xhc3MgSm9pbkJ5SW5wdXRXaXRoS2VlcGluZ1NwYWNlIGV4dGVuZHMgSm9pbkJ5SW5wdXQge1xuICB0cmltID0gZmFsc2Vcbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gU3RyaW5nIHN1ZmZpeCBpbiBuYW1lIGlzIHRvIGF2b2lkIGNvbmZ1c2lvbiB3aXRoICdzcGxpdCcgd2luZG93LlxuY2xhc3MgU3BsaXRTdHJpbmcgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmcge1xuICB0YXJnZXQgPSBcIk1vdmVUb1JlbGF0aXZlTGluZVwiXG4gIGtlZXBTcGxpdHRlciA9IGZhbHNlXG4gIHJlYWRJbnB1dEFmdGVyU2VsZWN0ID0gdHJ1ZVxuICBmb2N1c0lucHV0T3B0aW9ucyA9IHtjaGFyc01heDogMTB9XG5cbiAgZ2V0TmV3VGV4dCh0ZXh0KSB7XG4gICAgY29uc3QgcmVnZXggPSBuZXcgUmVnRXhwKHRoaXMuXy5lc2NhcGVSZWdFeHAodGhpcy5pbnB1dCB8fCBcIlxcXFxuXCIpLCBcImdcIilcbiAgICBjb25zdCBsaW5lU2VwYXJhdG9yID0gKHRoaXMua2VlcFNwbGl0dGVyID8gdGhpcy5pbnB1dCA6IFwiXCIpICsgXCJcXG5cIlxuICAgIHJldHVybiB0ZXh0LnJlcGxhY2UocmVnZXgsIGxpbmVTZXBhcmF0b3IpXG4gIH1cbn1cblxuY2xhc3MgU3BsaXRTdHJpbmdXaXRoS2VlcGluZ1NwbGl0dGVyIGV4dGVuZHMgU3BsaXRTdHJpbmcge1xuICBrZWVwU3BsaXR0ZXIgPSB0cnVlXG59XG5cbmNsYXNzIFNwbGl0QXJndW1lbnRzIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nIHtcbiAga2VlcFNlcGFyYXRvciA9IHRydWVcbiAgYXV0b0luZGVudEFmdGVySW5zZXJ0VGV4dCA9IHRydWVcblxuICBnZXROZXdUZXh0KHRleHQpIHtcbiAgICBjb25zdCBhbGxUb2tlbnMgPSB0aGlzLnV0aWxzLnNwbGl0QXJndW1lbnRzKHRleHQudHJpbSgpKVxuICAgIGxldCBuZXdUZXh0ID0gXCJcIlxuICAgIHdoaWxlIChhbGxUb2tlbnMubGVuZ3RoKSB7XG4gICAgICBjb25zdCB7dGV4dCwgdHlwZX0gPSBhbGxUb2tlbnMuc2hpZnQoKVxuICAgICAgbmV3VGV4dCArPSB0eXBlID09PSBcInNlcGFyYXRvclwiID8gKHRoaXMua2VlcFNlcGFyYXRvciA/IHRleHQudHJpbSgpIDogXCJcIikgKyBcIlxcblwiIDogdGV4dFxuICAgIH1cbiAgICByZXR1cm4gYFxcbiR7bmV3VGV4dH1cXG5gXG4gIH1cbn1cblxuY2xhc3MgU3BsaXRBcmd1bWVudHNXaXRoUmVtb3ZlU2VwYXJhdG9yIGV4dGVuZHMgU3BsaXRBcmd1bWVudHMge1xuICBrZWVwU2VwYXJhdG9yID0gZmFsc2Vcbn1cblxuY2xhc3MgU3BsaXRBcmd1bWVudHNPZklubmVyQW55UGFpciBleHRlbmRzIFNwbGl0QXJndW1lbnRzIHtcbiAgdGFyZ2V0ID0gXCJJbm5lckFueVBhaXJcIlxufVxuXG5jbGFzcyBDaGFuZ2VPcmRlciBleHRlbmRzIFRyYW5zZm9ybVN0cmluZyB7XG4gIHN0YXRpYyBjb21tYW5kID0gZmFsc2VcbiAgZ2V0TmV3VGV4dCh0ZXh0KSB7XG4gICAgcmV0dXJuIHRoaXMudGFyZ2V0LmlzTGluZXdpc2UoKVxuICAgICAgPyB0aGlzLmdldE5ld0xpc3QodGhpcy51dGlscy5zcGxpdFRleHRCeU5ld0xpbmUodGV4dCkpLmpvaW4oXCJcXG5cIikgKyBcIlxcblwiXG4gICAgICA6IHRoaXMuc29ydEFyZ3VtZW50c0luVGV4dEJ5KHRleHQsIGFyZ3MgPT4gdGhpcy5nZXROZXdMaXN0KGFyZ3MpKVxuICB9XG5cbiAgc29ydEFyZ3VtZW50c0luVGV4dEJ5KHRleHQsIGZuKSB7XG4gICAgY29uc3Qgc3RhcnQgPSB0ZXh0LnNlYXJjaCgvXFxTLylcbiAgICBjb25zdCBlbmQgPSB0ZXh0LnNlYXJjaCgvXFxzKiQvKVxuICAgIGNvbnN0IGxlYWRpbmdTcGFjZXMgPSBzdGFydCAhPT0gLTEgPyB0ZXh0LnNsaWNlKDAsIHN0YXJ0KSA6IFwiXCJcbiAgICBjb25zdCB0cmFpbGluZ1NwYWNlcyA9IGVuZCAhPT0gLTEgPyB0ZXh0LnNsaWNlKGVuZCkgOiBcIlwiXG4gICAgY29uc3QgYWxsVG9rZW5zID0gdGhpcy51dGlscy5zcGxpdEFyZ3VtZW50cyh0ZXh0LnNsaWNlKHN0YXJ0LCBlbmQpKVxuICAgIGNvbnN0IGFyZ3MgPSBhbGxUb2tlbnMuZmlsdGVyKHRva2VuID0+IHRva2VuLnR5cGUgPT09IFwiYXJndW1lbnRcIikubWFwKHRva2VuID0+IHRva2VuLnRleHQpXG4gICAgY29uc3QgbmV3QXJncyA9IGZuKGFyZ3MpXG5cbiAgICBsZXQgbmV3VGV4dCA9IFwiXCJcbiAgICB3aGlsZSAoYWxsVG9rZW5zLmxlbmd0aCkge1xuICAgICAgY29uc3QgdG9rZW4gPSBhbGxUb2tlbnMuc2hpZnQoKVxuICAgICAgLy8gdG9rZW4udHlwZSBpcyBcInNlcGFyYXRvclwiIG9yIFwiYXJndW1lbnRcIlxuICAgICAgbmV3VGV4dCArPSB0b2tlbi50eXBlID09PSBcInNlcGFyYXRvclwiID8gdG9rZW4udGV4dCA6IG5ld0FyZ3Muc2hpZnQoKVxuICAgIH1cbiAgICByZXR1cm4gbGVhZGluZ1NwYWNlcyArIG5ld1RleHQgKyB0cmFpbGluZ1NwYWNlc1xuICB9XG59XG5cbmNsYXNzIFJldmVyc2UgZXh0ZW5kcyBDaGFuZ2VPcmRlciB7XG4gIGdldE5ld0xpc3Qocm93cykge1xuICAgIHJldHVybiByb3dzLnJldmVyc2UoKVxuICB9XG59XG5cbmNsYXNzIFJldmVyc2VJbm5lckFueVBhaXIgZXh0ZW5kcyBSZXZlcnNlIHtcbiAgdGFyZ2V0ID0gXCJJbm5lckFueVBhaXJcIlxufVxuXG5jbGFzcyBSb3RhdGUgZXh0ZW5kcyBDaGFuZ2VPcmRlciB7XG4gIGJhY2t3YXJkcyA9IGZhbHNlXG4gIGdldE5ld0xpc3Qocm93cykge1xuICAgIGlmICh0aGlzLmJhY2t3YXJkcykgcm93cy5wdXNoKHJvd3Muc2hpZnQoKSlcbiAgICBlbHNlIHJvd3MudW5zaGlmdChyb3dzLnBvcCgpKVxuICAgIHJldHVybiByb3dzXG4gIH1cbn1cblxuY2xhc3MgUm90YXRlQmFja3dhcmRzIGV4dGVuZHMgQ2hhbmdlT3JkZXIge1xuICBiYWNrd2FyZHMgPSB0cnVlXG59XG5cbmNsYXNzIFJvdGF0ZUFyZ3VtZW50c09mSW5uZXJQYWlyIGV4dGVuZHMgUm90YXRlIHtcbiAgdGFyZ2V0ID0gXCJJbm5lckFueVBhaXJcIlxufVxuXG5jbGFzcyBSb3RhdGVBcmd1bWVudHNCYWNrd2FyZHNPZklubmVyUGFpciBleHRlbmRzIFJvdGF0ZUFyZ3VtZW50c09mSW5uZXJQYWlyIHtcbiAgYmFja3dhcmRzID0gdHJ1ZVxufVxuXG5jbGFzcyBTb3J0IGV4dGVuZHMgQ2hhbmdlT3JkZXIge1xuICBnZXROZXdMaXN0KHJvd3MpIHtcbiAgICByZXR1cm4gcm93cy5zb3J0KClcbiAgfVxufVxuXG5jbGFzcyBTb3J0Q2FzZUluc2Vuc2l0aXZlbHkgZXh0ZW5kcyBDaGFuZ2VPcmRlciB7XG4gIGdldE5ld0xpc3Qocm93cykge1xuICAgIHJldHVybiByb3dzLnNvcnQoKHJvd0EsIHJvd0IpID0+IHJvd0EubG9jYWxlQ29tcGFyZShyb3dCLCB7c2Vuc2l0aXZpdHk6IFwiYmFzZVwifSkpXG4gIH1cbn1cblxuY2xhc3MgU29ydEJ5TnVtYmVyIGV4dGVuZHMgQ2hhbmdlT3JkZXIge1xuICBnZXROZXdMaXN0KHJvd3MpIHtcbiAgICByZXR1cm4gdGhpcy5fLnNvcnRCeShyb3dzLCByb3cgPT4gTnVtYmVyLnBhcnNlSW50KHJvdykgfHwgSW5maW5pdHkpXG4gIH1cbn1cblxuY2xhc3MgTnVtYmVyaW5nTGluZXMgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmcge1xuICB3aXNlID0gXCJsaW5ld2lzZVwiXG5cbiAgZ2V0TmV3VGV4dCh0ZXh0KSB7XG4gICAgY29uc3Qgcm93cyA9IHRoaXMudXRpbHMuc3BsaXRUZXh0QnlOZXdMaW5lKHRleHQpXG4gICAgY29uc3QgbGFzdFJvd1dpZHRoID0gU3RyaW5nKHJvd3MubGVuZ3RoKS5sZW5ndGhcblxuICAgIGNvbnN0IG5ld1Jvd3MgPSByb3dzLm1hcCgocm93VGV4dCwgaSkgPT4ge1xuICAgICAgaSsrIC8vIGZpeCAwIHN0YXJ0IGluZGV4IHRvIDEgc3RhcnQuXG4gICAgICBjb25zdCBhbW91bnRPZlBhZGRpbmcgPSB0aGlzLmxpbWl0TnVtYmVyKGxhc3RSb3dXaWR0aCAtIFN0cmluZyhpKS5sZW5ndGgsIHttaW46IDB9KVxuICAgICAgcmV0dXJuIFwiIFwiLnJlcGVhdChhbW91bnRPZlBhZGRpbmcpICsgaSArIFwiOiBcIiArIHJvd1RleHRcbiAgICB9KVxuICAgIHJldHVybiBuZXdSb3dzLmpvaW4oXCJcXG5cIikgKyBcIlxcblwiXG4gIH1cbn1cblxuY2xhc3MgRHVwbGljYXRlV2l0aENvbW1lbnRPdXRPcmlnaW5hbCBleHRlbmRzIFRyYW5zZm9ybVN0cmluZyB7XG4gIHdpc2UgPSBcImxpbmV3aXNlXCJcbiAgc3RheUJ5TWFya2VyID0gdHJ1ZVxuICBzdGF5QXRTYW1lUG9zaXRpb24gPSB0cnVlXG4gIG11dGF0ZVNlbGVjdGlvbihzZWxlY3Rpb24pIHtcbiAgICBjb25zdCBbc3RhcnRSb3csIGVuZFJvd10gPSBzZWxlY3Rpb24uZ2V0QnVmZmVyUm93UmFuZ2UoKVxuICAgIHNlbGVjdGlvbi5zZXRCdWZmZXJSYW5nZSh0aGlzLnV0aWxzLmluc2VydFRleHRBdEJ1ZmZlclBvc2l0aW9uKHRoaXMuZWRpdG9yLCBbc3RhcnRSb3csIDBdLCBzZWxlY3Rpb24uZ2V0VGV4dCgpKSlcbiAgICB0aGlzLmVkaXRvci50b2dnbGVMaW5lQ29tbWVudHNGb3JCdWZmZXJSb3dzKHN0YXJ0Um93LCBlbmRSb3cpXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIFRyYW5zZm9ybVN0cmluZyxcblxuICBOb0Nhc2UsXG4gIERvdENhc2UsXG4gIFN3YXBDYXNlLFxuICBQYXRoQ2FzZSxcbiAgVXBwZXJDYXNlLFxuICBMb3dlckNhc2UsXG4gIENhbWVsQ2FzZSxcbiAgU25ha2VDYXNlLFxuICBUaXRsZUNhc2UsXG4gIFBhcmFtQ2FzZSxcbiAgSGVhZGVyQ2FzZSxcbiAgUGFzY2FsQ2FzZSxcbiAgQ29uc3RhbnRDYXNlLFxuICBTZW50ZW5jZUNhc2UsXG4gIFVwcGVyQ2FzZUZpcnN0LFxuICBMb3dlckNhc2VGaXJzdCxcbiAgRGFzaENhc2UsXG4gIFRvZ2dsZUNhc2UsXG4gIFRvZ2dsZUNhc2VBbmRNb3ZlUmlnaHQsXG5cbiAgUmVwbGFjZSxcbiAgUmVwbGFjZUNoYXJhY3RlcixcbiAgU3BsaXRCeUNoYXJhY3RlcixcbiAgRW5jb2RlVXJpQ29tcG9uZW50LFxuICBEZWNvZGVVcmlDb21wb25lbnQsXG4gIFRyaW1TdHJpbmcsXG4gIENvbXBhY3RTcGFjZXMsXG4gIEFsaWduT2NjdXJyZW5jZSxcbiAgQWxpZ25PY2N1cnJlbmNlQnlQYWRMZWZ0LFxuICBBbGlnbk9jY3VycmVuY2VCeVBhZFJpZ2h0LFxuICBSZW1vdmVMZWFkaW5nV2hpdGVTcGFjZXMsXG4gIENvbnZlcnRUb1NvZnRUYWIsXG4gIENvbnZlcnRUb0hhcmRUYWIsXG4gIFRyYW5zZm9ybVN0cmluZ0J5RXh0ZXJuYWxDb21tYW5kLFxuICBUcmFuc2Zvcm1TdHJpbmdCeVNlbGVjdExpc3QsXG4gIFRyYW5zZm9ybVdvcmRCeVNlbGVjdExpc3QsXG4gIFRyYW5zZm9ybVNtYXJ0V29yZEJ5U2VsZWN0TGlzdCxcbiAgUmVwbGFjZVdpdGhSZWdpc3RlcixcbiAgUmVwbGFjZU9jY3VycmVuY2VXaXRoUmVnaXN0ZXIsXG4gIFN3YXBXaXRoUmVnaXN0ZXIsXG4gIEluZGVudCxcbiAgT3V0ZGVudCxcbiAgQXV0b0luZGVudCxcbiAgVG9nZ2xlTGluZUNvbW1lbnRzLFxuICBSZWZsb3csXG4gIFJlZmxvd1dpdGhTdGF5LFxuICBTdXJyb3VuZEJhc2UsXG4gIFN1cnJvdW5kLFxuICBTdXJyb3VuZFdvcmQsXG4gIFN1cnJvdW5kU21hcnRXb3JkLFxuICBNYXBTdXJyb3VuZCxcbiAgRGVsZXRlU3Vycm91bmQsXG4gIERlbGV0ZVN1cnJvdW5kQW55UGFpcixcbiAgRGVsZXRlU3Vycm91bmRBbnlQYWlyQWxsb3dGb3J3YXJkaW5nLFxuICBDaGFuZ2VTdXJyb3VuZCxcbiAgQ2hhbmdlU3Vycm91bmRBbnlQYWlyLFxuICBDaGFuZ2VTdXJyb3VuZEFueVBhaXJBbGxvd0ZvcndhcmRpbmcsXG4gIEpvaW5UYXJnZXQsXG4gIEpvaW4sXG4gIEpvaW5CYXNlLFxuICBKb2luV2l0aEtlZXBpbmdTcGFjZSxcbiAgSm9pbkJ5SW5wdXQsXG4gIEpvaW5CeUlucHV0V2l0aEtlZXBpbmdTcGFjZSxcbiAgU3BsaXRTdHJpbmcsXG4gIFNwbGl0U3RyaW5nV2l0aEtlZXBpbmdTcGxpdHRlcixcbiAgU3BsaXRBcmd1bWVudHMsXG4gIFNwbGl0QXJndW1lbnRzV2l0aFJlbW92ZVNlcGFyYXRvcixcbiAgU3BsaXRBcmd1bWVudHNPZklubmVyQW55UGFpcixcbiAgQ2hhbmdlT3JkZXIsXG4gIFJldmVyc2UsXG4gIFJldmVyc2VJbm5lckFueVBhaXIsXG4gIFJvdGF0ZSxcbiAgUm90YXRlQmFja3dhcmRzLFxuICBSb3RhdGVBcmd1bWVudHNPZklubmVyUGFpcixcbiAgUm90YXRlQXJndW1lbnRzQmFja3dhcmRzT2ZJbm5lclBhaXIsXG4gIFNvcnQsXG4gIFNvcnRDYXNlSW5zZW5zaXRpdmVseSxcbiAgU29ydEJ5TnVtYmVyLFxuICBOdW1iZXJpbmdMaW5lcyxcbiAgRHVwbGljYXRlV2l0aENvbW1lbnRPdXRPcmlnaW5hbCxcbn1cbmZvciAoY29uc3Qga2xhc3Mgb2YgT2JqZWN0LnZhbHVlcyhtb2R1bGUuZXhwb3J0cykpIHtcbiAgaWYgKGtsYXNzLmlzQ29tbWFuZCgpKSBrbGFzcy5yZWdpc3RlclRvU2VsZWN0TGlzdCgpXG59XG4iXX0=