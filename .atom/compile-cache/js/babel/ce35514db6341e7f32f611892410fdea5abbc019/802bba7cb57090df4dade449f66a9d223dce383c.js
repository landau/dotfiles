"use babel";

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _ = require("underscore-plus");

var _require = require("atom");

var BufferedProcess = _require.BufferedProcess;
var Range = _require.Range;

var Base = require("./base");
var Operator = Base.getClass("Operator");

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
    key: "stringTransformers",
    value: [],
    enumerable: true
  }]);

  return TransformString;
})(Operator);

TransformString.register(false);

var ToggleCase = (function (_TransformString) {
  _inherits(ToggleCase, _TransformString);

  function ToggleCase() {
    _classCallCheck(this, ToggleCase);

    _get(Object.getPrototypeOf(ToggleCase.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(ToggleCase, [{
    key: "getNewText",
    value: function getNewText(text) {
      return text.replace(/./g, this.utils.toggleCaseForCharacter);
    }
  }], [{
    key: "displayName",
    value: "Toggle ~",
    enumerable: true
  }]);

  return ToggleCase;
})(TransformString);

ToggleCase.register();

var ToggleCaseAndMoveRight = (function (_ToggleCase) {
  _inherits(ToggleCaseAndMoveRight, _ToggleCase);

  function ToggleCaseAndMoveRight() {
    _classCallCheck(this, ToggleCaseAndMoveRight);

    _get(Object.getPrototypeOf(ToggleCaseAndMoveRight.prototype), "constructor", this).apply(this, arguments);

    this.flashTarget = false;
    this.restorePositions = false;
    this.target = "MoveRight";
  }

  return ToggleCaseAndMoveRight;
})(ToggleCase);

ToggleCaseAndMoveRight.register();

var UpperCase = (function (_TransformString2) {
  _inherits(UpperCase, _TransformString2);

  function UpperCase() {
    _classCallCheck(this, UpperCase);

    _get(Object.getPrototypeOf(UpperCase.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(UpperCase, [{
    key: "getNewText",
    value: function getNewText(text) {
      return text.toUpperCase();
    }
  }], [{
    key: "displayName",
    value: "Upper",
    enumerable: true
  }]);

  return UpperCase;
})(TransformString);

UpperCase.register();

var LowerCase = (function (_TransformString3) {
  _inherits(LowerCase, _TransformString3);

  function LowerCase() {
    _classCallCheck(this, LowerCase);

    _get(Object.getPrototypeOf(LowerCase.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(LowerCase, [{
    key: "getNewText",
    value: function getNewText(text) {
      return text.toLowerCase();
    }
  }], [{
    key: "displayName",
    value: "Lower",
    enumerable: true
  }]);

  return LowerCase;
})(TransformString);

LowerCase.register();

// Replace
// -------------------------

var Replace = (function (_TransformString4) {
  _inherits(Replace, _TransformString4);

  function Replace() {
    _classCallCheck(this, Replace);

    _get(Object.getPrototypeOf(Replace.prototype), "constructor", this).apply(this, arguments);

    this.flashCheckpoint = "did-select-occurrence";
    this.input = null;
    this.requireInput = true;
    this.autoIndentNewline = true;
    this.supportEarlySelect = true;
  }

  _createClass(Replace, [{
    key: "initialize",
    value: function initialize() {
      var _this = this;

      this.onDidSelectTarget(function () {
        return _this.focusInput({ hideCursor: true });
      });
      _get(Object.getPrototypeOf(Replace.prototype), "initialize", this).call(this);
    }
  }, {
    key: "getNewText",
    value: function getNewText(text) {
      if (this.target.is("MoveRightBufferColumn") && text.length !== this.getCount()) {
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

Replace.register();

var ReplaceCharacter = (function (_Replace) {
  _inherits(ReplaceCharacter, _Replace);

  function ReplaceCharacter() {
    _classCallCheck(this, ReplaceCharacter);

    _get(Object.getPrototypeOf(ReplaceCharacter.prototype), "constructor", this).apply(this, arguments);

    this.target = "MoveRightBufferColumn";
  }

  return ReplaceCharacter;
})(Replace);

ReplaceCharacter.register();

// -------------------------
// DUP meaning with SplitString need consolidate.

var SplitByCharacter = (function (_TransformString5) {
  _inherits(SplitByCharacter, _TransformString5);

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

SplitByCharacter.register();

var CamelCase = (function (_TransformString6) {
  _inherits(CamelCase, _TransformString6);

  function CamelCase() {
    _classCallCheck(this, CamelCase);

    _get(Object.getPrototypeOf(CamelCase.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(CamelCase, [{
    key: "getNewText",
    value: function getNewText(text) {
      return _.camelize(text);
    }
  }], [{
    key: "displayName",
    value: "Camelize",
    enumerable: true
  }]);

  return CamelCase;
})(TransformString);

CamelCase.register();

var SnakeCase = (function (_TransformString7) {
  _inherits(SnakeCase, _TransformString7);

  function SnakeCase() {
    _classCallCheck(this, SnakeCase);

    _get(Object.getPrototypeOf(SnakeCase.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(SnakeCase, [{
    key: "getNewText",
    value: function getNewText(text) {
      return _.underscore(text);
    }
  }], [{
    key: "displayName",
    value: "Underscore _",
    enumerable: true
  }]);

  return SnakeCase;
})(TransformString);

SnakeCase.register();

var PascalCase = (function (_TransformString8) {
  _inherits(PascalCase, _TransformString8);

  function PascalCase() {
    _classCallCheck(this, PascalCase);

    _get(Object.getPrototypeOf(PascalCase.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(PascalCase, [{
    key: "getNewText",
    value: function getNewText(text) {
      return _.capitalize(_.camelize(text));
    }
  }], [{
    key: "displayName",
    value: "Pascalize",
    enumerable: true
  }]);

  return PascalCase;
})(TransformString);

PascalCase.register();

var DashCase = (function (_TransformString9) {
  _inherits(DashCase, _TransformString9);

  function DashCase() {
    _classCallCheck(this, DashCase);

    _get(Object.getPrototypeOf(DashCase.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(DashCase, [{
    key: "getNewText",
    value: function getNewText(text) {
      return _.dasherize(text);
    }
  }], [{
    key: "displayName",
    value: "Dasherize -",
    enumerable: true
  }]);

  return DashCase;
})(TransformString);

DashCase.register();

var TitleCase = (function (_TransformString10) {
  _inherits(TitleCase, _TransformString10);

  function TitleCase() {
    _classCallCheck(this, TitleCase);

    _get(Object.getPrototypeOf(TitleCase.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(TitleCase, [{
    key: "getNewText",
    value: function getNewText(text) {
      return _.humanizeEventName(_.dasherize(text));
    }
  }], [{
    key: "displayName",
    value: "Titlize",
    enumerable: true
  }]);

  return TitleCase;
})(TransformString);

TitleCase.register();

var EncodeUriComponent = (function (_TransformString11) {
  _inherits(EncodeUriComponent, _TransformString11);

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
    key: "displayName",
    value: "Encode URI Component %",
    enumerable: true
  }]);

  return EncodeUriComponent;
})(TransformString);

EncodeUriComponent.register();

var DecodeUriComponent = (function (_TransformString12) {
  _inherits(DecodeUriComponent, _TransformString12);

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
    key: "displayName",
    value: "Decode URI Component %%",
    enumerable: true
  }]);

  return DecodeUriComponent;
})(TransformString);

DecodeUriComponent.register();

var TrimString = (function (_TransformString13) {
  _inherits(TrimString, _TransformString13);

  function TrimString() {
    _classCallCheck(this, TrimString);

    _get(Object.getPrototypeOf(TrimString.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(TrimString, [{
    key: "getNewText",
    value: function getNewText(text) {
      return text.trim();
    }
  }], [{
    key: "displayName",
    value: "Trim string",
    enumerable: true
  }]);

  return TrimString;
})(TransformString);

TrimString.register();

var CompactSpaces = (function (_TransformString14) {
  _inherits(CompactSpaces, _TransformString14);

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
  }], [{
    key: "displayName",
    value: "Compact space",
    enumerable: true
  }]);

  return CompactSpaces;
})(TransformString);

CompactSpaces.register();

var AlignOccurrence = (function (_TransformString15) {
  _inherits(AlignOccurrence, _TransformString15);

  function AlignOccurrence() {
    _classCallCheck(this, AlignOccurrence);

    _get(Object.getPrototypeOf(AlignOccurrence.prototype), "constructor", this).apply(this, arguments);

    this.occurrence = true;
    this.whichToPad = "auto";
  }

  _createClass(AlignOccurrence, [{
    key: "getSelectionTaker",
    value: function getSelectionTaker() {
      var selectionsByRow = _.groupBy(this.editor.getSelectionsOrderedByBufferPosition(), function (selection) {
        return selection.getBufferRange().start.row;
      });

      return function () {
        var rows = Object.keys(selectionsByRow);
        var selections = rows.map(function (row) {
          return selectionsByRow[row].shift();
        }).filter(function (s) {
          return s;
        });
        return selections;
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
      var _this2 = this;

      var totalAmountOfPaddingByRow = {};
      var columnForSelection = function columnForSelection(selection) {
        var which = _this2.getWichToPadForText(selection.getText());
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
      var _this3 = this;

      this.amountOfPaddingBySelection = new Map();
      this.onDidSelectTarget(function () {
        _this3.calculatePadding();
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

AlignOccurrence.register();

var AlignOccurrenceByPadLeft = (function (_AlignOccurrence) {
  _inherits(AlignOccurrenceByPadLeft, _AlignOccurrence);

  function AlignOccurrenceByPadLeft() {
    _classCallCheck(this, AlignOccurrenceByPadLeft);

    _get(Object.getPrototypeOf(AlignOccurrenceByPadLeft.prototype), "constructor", this).apply(this, arguments);

    this.whichToPad = "start";
  }

  return AlignOccurrenceByPadLeft;
})(AlignOccurrence);

AlignOccurrenceByPadLeft.register();

var AlignOccurrenceByPadRight = (function (_AlignOccurrence2) {
  _inherits(AlignOccurrenceByPadRight, _AlignOccurrence2);

  function AlignOccurrenceByPadRight() {
    _classCallCheck(this, AlignOccurrenceByPadRight);

    _get(Object.getPrototypeOf(AlignOccurrenceByPadRight.prototype), "constructor", this).apply(this, arguments);

    this.whichToPad = "end";
  }

  return AlignOccurrenceByPadRight;
})(AlignOccurrence);

AlignOccurrenceByPadRight.register();

var RemoveLeadingWhiteSpaces = (function (_TransformString16) {
  _inherits(RemoveLeadingWhiteSpaces, _TransformString16);

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

RemoveLeadingWhiteSpaces.register();

var ConvertToSoftTab = (function (_TransformString17) {
  _inherits(ConvertToSoftTab, _TransformString17);

  function ConvertToSoftTab() {
    _classCallCheck(this, ConvertToSoftTab);

    _get(Object.getPrototypeOf(ConvertToSoftTab.prototype), "constructor", this).apply(this, arguments);

    this.wise = "linewise";
  }

  _createClass(ConvertToSoftTab, [{
    key: "mutateSelection",
    value: function mutateSelection(selection) {
      var _this4 = this;

      return this.scanForward(/\t/g, { scanRange: selection.getBufferRange() }, function (_ref) {
        var range = _ref.range;
        var replace = _ref.replace;

        // Replace \t to spaces which length is vary depending on tabStop and tabLenght
        // So we directly consult it's screen representing length.
        var length = _this4.editor.screenRangeForBufferRange(range).getExtent().column;
        return replace(" ".repeat(length));
      });
    }
  }], [{
    key: "displayName",
    value: "Soft Tab",
    enumerable: true
  }]);

  return ConvertToSoftTab;
})(TransformString);

ConvertToSoftTab.register();

var ConvertToHardTab = (function (_TransformString18) {
  _inherits(ConvertToHardTab, _TransformString18);

  function ConvertToHardTab() {
    _classCallCheck(this, ConvertToHardTab);

    _get(Object.getPrototypeOf(ConvertToHardTab.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(ConvertToHardTab, [{
    key: "mutateSelection",
    value: function mutateSelection(selection) {
      var _this5 = this;

      var tabLength = this.editor.getTabLength();
      this.scanForward(/[ \t]+/g, { scanRange: selection.getBufferRange() }, function (_ref2) {
        var range = _ref2.range;
        var replace = _ref2.replace;

        var _editor$screenRangeForBufferRange = _this5.editor.screenRangeForBufferRange(range);

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

ConvertToHardTab.register();

// -------------------------

var TransformStringByExternalCommand = (function (_TransformString19) {
  _inherits(TransformStringByExternalCommand, _TransformString19);

  function TransformStringByExternalCommand() {
    _classCallCheck(this, TransformStringByExternalCommand);

    _get(Object.getPrototypeOf(TransformStringByExternalCommand.prototype), "constructor", this).apply(this, arguments);

    this.autoIndent = true;
    this.command = "";
    this.args = [];
    this.stdoutBySelection = null;
  }

  _createClass(TransformStringByExternalCommand, [{
    key: "execute",
    value: function execute() {
      var _this6 = this;

      this.normalizeSelectionsIfNecessary();
      if (this.selectTarget()) {
        return new Promise(function (resolve) {
          return _this6.collect(resolve);
        }).then(function () {
          for (var selection of _this6.editor.getSelections()) {
            var text = _this6.getNewText(selection.getText(), selection);
            selection.insertText(text, { autoIndent: _this6.autoIndent });
          }
          _this6.restoreCursorPositionsIfNecessary();
          _this6.activateMode("normal");
        });
      }
    }
  }, {
    key: "collect",
    value: function collect(resolve) {
      var _this7 = this;

      this.stdoutBySelection = new Map();
      var processFinished = 0,
          processRunning = 0;

      var _loop = function (selection) {
        var _ref3 = _this7.getCommand(selection) || {};

        var command = _ref3.command;
        var args = _ref3.args;

        if (command == null || args == null) return {
            v: undefined
          };

        processRunning++;
        _this7.runExternalCommand({
          command: command,
          args: args,
          stdin: _this7.getStdin(selection),
          stdout: function stdout(output) {
            return _this7.stdoutBySelection.set(selection, output);
          },
          exit: function exit(code) {
            processFinished++;
            if (processRunning === processFinished) resolve();
          }
        });
      };

      for (var selection of this.editor.getSelections()) {
        var _ret = _loop(selection);

        if (typeof _ret === "object") return _ret.v;
      }
    }
  }, {
    key: "runExternalCommand",
    value: function runExternalCommand(options) {
      var _this8 = this;

      var stdin = options.stdin;

      delete options.stdin;
      var bufferedProcess = new BufferedProcess(options);
      bufferedProcess.onWillThrowError(function (_ref4) {
        var error = _ref4.error;
        var handle = _ref4.handle;

        // Suppress command not found error intentionally.
        if (error.code === "ENOENT" && error.syscall.indexOf("spawn") === 0) {
          console.log(_this8.getCommandName() + ": Failed to spawn command " + error.path + ".");
          handle();
        }
        _this8.cancelOperation();
      });

      if (stdin) {
        bufferedProcess.process.stdin.write(stdin);
        bufferedProcess.process.stdin.end();
      }
    }
  }, {
    key: "getNewText",
    value: function getNewText(text, selection) {
      return this.getStdout(selection) || text;
    }

    // For easily extend by vmp plugin.
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
    key: "getStdout",
    value: function getStdout(selection) {
      return this.stdoutBySelection.get(selection);
    }
  }]);

  return TransformStringByExternalCommand;
})(TransformString);

TransformStringByExternalCommand.register(false);

// -------------------------

var TransformStringBySelectList = (function (_TransformString20) {
  _inherits(TransformStringBySelectList, _TransformString20);

  function TransformStringBySelectList() {
    _classCallCheck(this, TransformStringBySelectList);

    _get(Object.getPrototypeOf(TransformStringBySelectList.prototype), "constructor", this).apply(this, arguments);

    this.requireInput = true;
  }

  _createClass(TransformStringBySelectList, [{
    key: "getItems",
    value: function getItems() {
      return this.constructor.getSelectListItems();
    }
  }, {
    key: "initialize",
    value: function initialize() {
      var _this9 = this;

      this.vimState.onDidConfirmSelectList(function (item) {
        var transformer = item.klass;
        if (transformer.prototype.target) {
          _this9.target = transformer.prototype.target;
        }
        _this9.vimState.reset();
        if (_this9.target) {
          _this9.vimState.operationStack.run(transformer, { target: _this9.target });
        } else {
          _this9.vimState.operationStack.run(transformer);
        }
      });

      this.focusSelectList({ items: this.getItems() });

      _get(Object.getPrototypeOf(TransformStringBySelectList.prototype), "initialize", this).call(this);
    }
  }, {
    key: "execute",
    value: function execute() {
      // NEVER be executed since operationStack is replaced with selected transformer
      throw new Error(this.name + " should not be executed");
    }
  }], [{
    key: "getSelectListItems",
    value: function getSelectListItems() {
      if (!this.selectListItems) {
        this.selectListItems = this.stringTransformers.map(function (klass) {
          return {
            klass: klass,
            displayName: klass.hasOwnProperty("displayName") ? klass.displayName : _.humanizeEventName(_.dasherize(klass.name))
          };
        });
      }
      return this.selectListItems;
    }
  }, {
    key: "electListItems",
    value: null,
    enumerable: true
  }]);

  return TransformStringBySelectList;
})(TransformString);

TransformStringBySelectList.register();

var TransformWordBySelectList = (function (_TransformStringBySelectList) {
  _inherits(TransformWordBySelectList, _TransformStringBySelectList);

  function TransformWordBySelectList() {
    _classCallCheck(this, TransformWordBySelectList);

    _get(Object.getPrototypeOf(TransformWordBySelectList.prototype), "constructor", this).apply(this, arguments);

    this.target = "InnerWord";
  }

  return TransformWordBySelectList;
})(TransformStringBySelectList);

TransformWordBySelectList.register();

var TransformSmartWordBySelectList = (function (_TransformStringBySelectList2) {
  _inherits(TransformSmartWordBySelectList, _TransformStringBySelectList2);

  function TransformSmartWordBySelectList() {
    _classCallCheck(this, TransformSmartWordBySelectList);

    _get(Object.getPrototypeOf(TransformSmartWordBySelectList.prototype), "constructor", this).apply(this, arguments);

    this.target = "InnerSmartWord";
  }

  return TransformSmartWordBySelectList;
})(TransformStringBySelectList);

TransformSmartWordBySelectList.register();

// -------------------------

var ReplaceWithRegister = (function (_TransformString21) {
  _inherits(ReplaceWithRegister, _TransformString21);

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

ReplaceWithRegister.register();

// Save text to register before replace

var SwapWithRegister = (function (_TransformString22) {
  _inherits(SwapWithRegister, _TransformString22);

  function SwapWithRegister() {
    _classCallCheck(this, SwapWithRegister);

    _get(Object.getPrototypeOf(SwapWithRegister.prototype), "constructor", this).apply(this, arguments);
  }

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

SwapWithRegister.register();

// Indent < TransformString
// -------------------------

var Indent = (function (_TransformString23) {
  _inherits(Indent, _TransformString23);

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
      var _this10 = this;

      // Need count times indentation in visual-mode and its repeat(`.`).
      if (this.target.is("CurrentSelection")) {
        (function () {
          var oldText = undefined;
          // limit to 100 to avoid freezing by accidental big number.
          var count = _this10.utils.limitNumber(_this10.getCount(), { max: 100 });
          _this10.countTimes(count, function (_ref5) {
            var stop = _ref5.stop;

            oldText = selection.getText();
            _this10.indent(selection);
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

Indent.register();

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

Outdent.register();

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

AutoIndent.register();

var ToggleLineComments = (function (_TransformString24) {
  _inherits(ToggleLineComments, _TransformString24);

  function ToggleLineComments() {
    _classCallCheck(this, ToggleLineComments);

    _get(Object.getPrototypeOf(ToggleLineComments.prototype), "constructor", this).apply(this, arguments);

    this.flashTarget = false;
    this.stayByMarker = true;
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

ToggleLineComments.register();

var Reflow = (function (_TransformString25) {
  _inherits(Reflow, _TransformString25);

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

Reflow.register();

var ReflowWithStay = (function (_Reflow) {
  _inherits(ReflowWithStay, _Reflow);

  function ReflowWithStay() {
    _classCallCheck(this, ReflowWithStay);

    _get(Object.getPrototypeOf(ReflowWithStay.prototype), "constructor", this).apply(this, arguments);

    this.stayAtSamePosition = true;
  }

  return ReflowWithStay;
})(Reflow);

ReflowWithStay.register();

// Surround < TransformString
// -------------------------

var SurroundBase = (function (_TransformString26) {
  _inherits(SurroundBase, _TransformString26);

  function SurroundBase() {
    _classCallCheck(this, SurroundBase);

    _get(Object.getPrototypeOf(SurroundBase.prototype), "constructor", this).apply(this, arguments);

    this.pairs = [["(", ")"], ["{", "}"], ["[", "]"], ["<", ">"]];
    this.pairsByAlias = {
      b: ["(", ")"],
      B: ["{", "}"],
      r: ["[", "]"],
      a: ["<", ">"]
    };
    this.pairCharsAllowForwarding = "[](){}";
    this.input = null;
    this.requireInput = true;
    this.supportEarlySelect = true;
  }

  _createClass(SurroundBase, [{
    key: "focusInputForSurroundChar",
    // Experimental

    value: function focusInputForSurroundChar() {
      this.focusInput({ hideCursor: true });
    }
  }, {
    key: "focusInputForTargetPairChar",
    value: function focusInputForTargetPairChar() {
      var _this11 = this;

      this.focusInput({ onConfirm: function onConfirm(char) {
          return _this11.onConfirmTargetPairChar(char);
        } });
    }
  }, {
    key: "getPair",
    value: function getPair(char) {
      var pair = undefined;
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
    key: "onConfirmTargetPairChar",
    value: function onConfirmTargetPairChar(char) {
      this.setTarget(this.getInstance("APair", { pair: this.getPair(char) }));
    }
  }]);

  return SurroundBase;
})(TransformString);

SurroundBase.register(false);

var Surround = (function (_SurroundBase) {
  _inherits(Surround, _SurroundBase);

  function Surround() {
    _classCallCheck(this, Surround);

    _get(Object.getPrototypeOf(Surround.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(Surround, [{
    key: "initialize",
    value: function initialize() {
      var _this12 = this;

      this.onDidSelectTarget(function () {
        return _this12.focusInputForSurroundChar();
      });
      _get(Object.getPrototypeOf(Surround.prototype), "initialize", this).call(this);
    }
  }, {
    key: "getNewText",
    value: function getNewText(text) {
      return this.surround(text, this.input);
    }
  }]);

  return Surround;
})(SurroundBase);

Surround.register();

var SurroundWord = (function (_Surround) {
  _inherits(SurroundWord, _Surround);

  function SurroundWord() {
    _classCallCheck(this, SurroundWord);

    _get(Object.getPrototypeOf(SurroundWord.prototype), "constructor", this).apply(this, arguments);

    this.target = "InnerWord";
  }

  return SurroundWord;
})(Surround);

SurroundWord.register();

var SurroundSmartWord = (function (_Surround2) {
  _inherits(SurroundSmartWord, _Surround2);

  function SurroundSmartWord() {
    _classCallCheck(this, SurroundSmartWord);

    _get(Object.getPrototypeOf(SurroundSmartWord.prototype), "constructor", this).apply(this, arguments);

    this.target = "InnerSmartWord";
  }

  return SurroundSmartWord;
})(Surround);

SurroundSmartWord.register();

var MapSurround = (function (_Surround3) {
  _inherits(MapSurround, _Surround3);

  function MapSurround() {
    _classCallCheck(this, MapSurround);

    _get(Object.getPrototypeOf(MapSurround.prototype), "constructor", this).apply(this, arguments);

    this.occurrence = true;
    this.patternForOccurrence = /\w+/g;
  }

  return MapSurround;
})(Surround);

MapSurround.register();

// Delete Surround
// -------------------------

var DeleteSurround = (function (_SurroundBase2) {
  _inherits(DeleteSurround, _SurroundBase2);

  function DeleteSurround() {
    _classCallCheck(this, DeleteSurround);

    _get(Object.getPrototypeOf(DeleteSurround.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(DeleteSurround, [{
    key: "initialize",
    value: function initialize() {
      if (!this.target) {
        this.focusInputForTargetPairChar();
      }
      _get(Object.getPrototypeOf(DeleteSurround.prototype), "initialize", this).call(this);
    }
  }, {
    key: "onConfirmTargetPairChar",
    value: function onConfirmTargetPairChar(char) {
      _get(Object.getPrototypeOf(DeleteSurround.prototype), "onConfirmTargetPairChar", this).call(this, char);
      this.input = char;
      this.processOperation();
    }
  }, {
    key: "getNewText",
    value: function getNewText(text) {
      return this.deleteSurround(text);
    }
  }]);

  return DeleteSurround;
})(SurroundBase);

DeleteSurround.register();

var DeleteSurroundAnyPair = (function (_DeleteSurround) {
  _inherits(DeleteSurroundAnyPair, _DeleteSurround);

  function DeleteSurroundAnyPair() {
    _classCallCheck(this, DeleteSurroundAnyPair);

    _get(Object.getPrototypeOf(DeleteSurroundAnyPair.prototype), "constructor", this).apply(this, arguments);

    this.target = "AAnyPair";
    this.requireInput = false;
  }

  return DeleteSurroundAnyPair;
})(DeleteSurround);

DeleteSurroundAnyPair.register();

var DeleteSurroundAnyPairAllowForwarding = (function (_DeleteSurroundAnyPair) {
  _inherits(DeleteSurroundAnyPairAllowForwarding, _DeleteSurroundAnyPair);

  function DeleteSurroundAnyPairAllowForwarding() {
    _classCallCheck(this, DeleteSurroundAnyPairAllowForwarding);

    _get(Object.getPrototypeOf(DeleteSurroundAnyPairAllowForwarding.prototype), "constructor", this).apply(this, arguments);

    this.target = "AAnyPairAllowForwarding";
  }

  return DeleteSurroundAnyPairAllowForwarding;
})(DeleteSurroundAnyPair);

DeleteSurroundAnyPairAllowForwarding.register();

// Change Surround
// -------------------------

var ChangeSurround = (function (_SurroundBase3) {
  _inherits(ChangeSurround, _SurroundBase3);

  function ChangeSurround() {
    _classCallCheck(this, ChangeSurround);

    _get(Object.getPrototypeOf(ChangeSurround.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(ChangeSurround, [{
    key: "showDeleteCharOnHover",
    value: function showDeleteCharOnHover() {
      var hoverPoint = this.mutationManager.getInitialPointForSelection(this.editor.getLastSelection());
      var char = this.editor.getSelectedText()[0];
      this.vimState.hover.set(char, hoverPoint);
    }
  }, {
    key: "initialize",
    value: function initialize() {
      var _this13 = this;

      if (this.target) {
        this.onDidFailSelectTarget(function () {
          return _this13.abort();
        });
      } else {
        this.onDidFailSelectTarget(function () {
          return _this13.cancelOperation();
        });
        this.focusInputForTargetPairChar();
      }

      this.onDidSelectTarget(function () {
        _this13.showDeleteCharOnHover();
        _this13.focusInputForSurroundChar();
      });
      _get(Object.getPrototypeOf(ChangeSurround.prototype), "initialize", this).call(this);
    }
  }, {
    key: "getNewText",
    value: function getNewText(text) {
      var innerText = this.deleteSurround(text);
      return this.surround(innerText, this.input, { keepLayout: true });
    }
  }]);

  return ChangeSurround;
})(SurroundBase);

ChangeSurround.register();

var ChangeSurroundAnyPair = (function (_ChangeSurround) {
  _inherits(ChangeSurroundAnyPair, _ChangeSurround);

  function ChangeSurroundAnyPair() {
    _classCallCheck(this, ChangeSurroundAnyPair);

    _get(Object.getPrototypeOf(ChangeSurroundAnyPair.prototype), "constructor", this).apply(this, arguments);

    this.target = "AAnyPair";
  }

  return ChangeSurroundAnyPair;
})(ChangeSurround);

ChangeSurroundAnyPair.register();

var ChangeSurroundAnyPairAllowForwarding = (function (_ChangeSurroundAnyPair) {
  _inherits(ChangeSurroundAnyPairAllowForwarding, _ChangeSurroundAnyPair);

  function ChangeSurroundAnyPairAllowForwarding() {
    _classCallCheck(this, ChangeSurroundAnyPairAllowForwarding);

    _get(Object.getPrototypeOf(ChangeSurroundAnyPairAllowForwarding.prototype), "constructor", this).apply(this, arguments);

    this.target = "AAnyPairAllowForwarding";
  }

  return ChangeSurroundAnyPairAllowForwarding;
})(ChangeSurroundAnyPair);

ChangeSurroundAnyPairAllowForwarding.register();

// -------------------------
// FIXME
// Currently native editor.joinLines() is better for cursor position setting
// So I use native methods for a meanwhile.

var Join = (function (_TransformString27) {
  _inherits(Join, _TransformString27);

  function Join() {
    _classCallCheck(this, Join);

    _get(Object.getPrototypeOf(Join.prototype), "constructor", this).apply(this, arguments);

    this.target = "MoveToRelativeLine";
    this.flashTarget = false;
    this.restorePositions = false;
  }

  _createClass(Join, [{
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

  return Join;
})(TransformString);

Join.register();

var JoinBase = (function (_TransformString28) {
  _inherits(JoinBase, _TransformString28);

  function JoinBase() {
    _classCallCheck(this, JoinBase);

    _get(Object.getPrototypeOf(JoinBase.prototype), "constructor", this).apply(this, arguments);

    this.wise = "linewise";
    this.trim = false;
    this.target = "MoveToRelativeLineMinimumTwo";
  }

  _createClass(JoinBase, [{
    key: "initialize",
    value: function initialize() {
      if (this.requireInput) {
        this.focusInput({ charsMax: 10 });
      }
      _get(Object.getPrototypeOf(JoinBase.prototype), "initialize", this).call(this);
    }
  }, {
    key: "getNewText",
    value: function getNewText(text) {
      var regex = this.trim ? /\r?\n[ \t]*/g : /\r?\n/g;
      return text.trimRight().replace(regex, this.input) + "\n";
    }
  }]);

  return JoinBase;
})(TransformString);

JoinBase.register(false);

var JoinWithKeepingSpace = (function (_JoinBase) {
  _inherits(JoinWithKeepingSpace, _JoinBase);

  function JoinWithKeepingSpace() {
    _classCallCheck(this, JoinWithKeepingSpace);

    _get(Object.getPrototypeOf(JoinWithKeepingSpace.prototype), "constructor", this).apply(this, arguments);

    this.input = "";
  }

  return JoinWithKeepingSpace;
})(JoinBase);

JoinWithKeepingSpace.register();

var JoinByInput = (function (_JoinBase2) {
  _inherits(JoinByInput, _JoinBase2);

  function JoinByInput() {
    _classCallCheck(this, JoinByInput);

    _get(Object.getPrototypeOf(JoinByInput.prototype), "constructor", this).apply(this, arguments);

    this.requireInput = true;
    this.trim = true;
  }

  return JoinByInput;
})(JoinBase);

JoinByInput.register();

var JoinByInputWithKeepingSpace = (function (_JoinByInput) {
  _inherits(JoinByInputWithKeepingSpace, _JoinByInput);

  function JoinByInputWithKeepingSpace() {
    _classCallCheck(this, JoinByInputWithKeepingSpace);

    _get(Object.getPrototypeOf(JoinByInputWithKeepingSpace.prototype), "constructor", this).apply(this, arguments);

    this.trim = false;
  }

  return JoinByInputWithKeepingSpace;
})(JoinByInput);

JoinByInputWithKeepingSpace.register();

// -------------------------
// String suffix in name is to avoid confusion with 'split' window.

var SplitString = (function (_TransformString29) {
  _inherits(SplitString, _TransformString29);

  function SplitString() {
    _classCallCheck(this, SplitString);

    _get(Object.getPrototypeOf(SplitString.prototype), "constructor", this).apply(this, arguments);

    this.requireInput = true;
    this.input = null;
    this.target = "MoveToRelativeLine";
    this.keepSplitter = false;
  }

  _createClass(SplitString, [{
    key: "initialize",
    value: function initialize() {
      var _this14 = this;

      this.onDidSetTarget(function () {
        _this14.focusInput({ charsMax: 10 });
      });
      _get(Object.getPrototypeOf(SplitString.prototype), "initialize", this).call(this);
    }
  }, {
    key: "getNewText",
    value: function getNewText(text) {
      var regex = new RegExp(_.escapeRegExp(this.input || "\\n"), "g");
      var lineSeparator = (this.keepSplitter ? this.input : "") + "\n";
      return text.replace(regex, lineSeparator);
    }
  }]);

  return SplitString;
})(TransformString);

SplitString.register();

var SplitStringWithKeepingSplitter = (function (_SplitString) {
  _inherits(SplitStringWithKeepingSplitter, _SplitString);

  function SplitStringWithKeepingSplitter() {
    _classCallCheck(this, SplitStringWithKeepingSplitter);

    _get(Object.getPrototypeOf(SplitStringWithKeepingSplitter.prototype), "constructor", this).apply(this, arguments);

    this.keepSplitter = true;
  }

  return SplitStringWithKeepingSplitter;
})(SplitString);

SplitStringWithKeepingSplitter.register();

var SplitArguments = (function (_TransformString30) {
  _inherits(SplitArguments, _TransformString30);

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

SplitArguments.register();

var SplitArgumentsWithRemoveSeparator = (function (_SplitArguments) {
  _inherits(SplitArgumentsWithRemoveSeparator, _SplitArguments);

  function SplitArgumentsWithRemoveSeparator() {
    _classCallCheck(this, SplitArgumentsWithRemoveSeparator);

    _get(Object.getPrototypeOf(SplitArgumentsWithRemoveSeparator.prototype), "constructor", this).apply(this, arguments);

    this.keepSeparator = false;
  }

  return SplitArgumentsWithRemoveSeparator;
})(SplitArguments);

SplitArgumentsWithRemoveSeparator.register();

var SplitArgumentsOfInnerAnyPair = (function (_SplitArguments2) {
  _inherits(SplitArgumentsOfInnerAnyPair, _SplitArguments2);

  function SplitArgumentsOfInnerAnyPair() {
    _classCallCheck(this, SplitArgumentsOfInnerAnyPair);

    _get(Object.getPrototypeOf(SplitArgumentsOfInnerAnyPair.prototype), "constructor", this).apply(this, arguments);

    this.target = "InnerAnyPair";
  }

  return SplitArgumentsOfInnerAnyPair;
})(SplitArguments);

SplitArgumentsOfInnerAnyPair.register();

var ChangeOrder = (function (_TransformString31) {
  _inherits(ChangeOrder, _TransformString31);

  function ChangeOrder() {
    _classCallCheck(this, ChangeOrder);

    _get(Object.getPrototypeOf(ChangeOrder.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(ChangeOrder, [{
    key: "getNewText",
    value: function getNewText(text) {
      var _this15 = this;

      return this.target.isLinewise() ? this.getNewList(this.utils.splitTextByNewLine(text)).join("\n") + "\n" : this.sortArgumentsInTextBy(text, function (args) {
        return _this15.getNewList(args);
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
  }]);

  return ChangeOrder;
})(TransformString);

ChangeOrder.register(false);

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

Reverse.register();

var ReverseInnerAnyPair = (function (_Reverse) {
  _inherits(ReverseInnerAnyPair, _Reverse);

  function ReverseInnerAnyPair() {
    _classCallCheck(this, ReverseInnerAnyPair);

    _get(Object.getPrototypeOf(ReverseInnerAnyPair.prototype), "constructor", this).apply(this, arguments);

    this.target = "InnerAnyPair";
  }

  return ReverseInnerAnyPair;
})(Reverse);

ReverseInnerAnyPair.register();

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

Rotate.register();

var RotateBackwards = (function (_ChangeOrder3) {
  _inherits(RotateBackwards, _ChangeOrder3);

  function RotateBackwards() {
    _classCallCheck(this, RotateBackwards);

    _get(Object.getPrototypeOf(RotateBackwards.prototype), "constructor", this).apply(this, arguments);

    this.backwards = true;
  }

  return RotateBackwards;
})(ChangeOrder);

RotateBackwards.register();

var RotateArgumentsOfInnerPair = (function (_Rotate) {
  _inherits(RotateArgumentsOfInnerPair, _Rotate);

  function RotateArgumentsOfInnerPair() {
    _classCallCheck(this, RotateArgumentsOfInnerPair);

    _get(Object.getPrototypeOf(RotateArgumentsOfInnerPair.prototype), "constructor", this).apply(this, arguments);

    this.target = "InnerAnyPair";
  }

  return RotateArgumentsOfInnerPair;
})(Rotate);

RotateArgumentsOfInnerPair.register();

var RotateArgumentsBackwardsOfInnerPair = (function (_RotateArgumentsOfInnerPair) {
  _inherits(RotateArgumentsBackwardsOfInnerPair, _RotateArgumentsOfInnerPair);

  function RotateArgumentsBackwardsOfInnerPair() {
    _classCallCheck(this, RotateArgumentsBackwardsOfInnerPair);

    _get(Object.getPrototypeOf(RotateArgumentsBackwardsOfInnerPair.prototype), "constructor", this).apply(this, arguments);

    this.backwards = true;
  }

  return RotateArgumentsBackwardsOfInnerPair;
})(RotateArgumentsOfInnerPair);

RotateArgumentsBackwardsOfInnerPair.register();

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

Sort.register();

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

SortCaseInsensitively.register();

var SortByNumber = (function (_ChangeOrder6) {
  _inherits(SortByNumber, _ChangeOrder6);

  function SortByNumber() {
    _classCallCheck(this, SortByNumber);

    _get(Object.getPrototypeOf(SortByNumber.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(SortByNumber, [{
    key: "getNewList",
    value: function getNewList(rows) {
      return _.sortBy(rows, function (row) {
        return Number.parseInt(row) || Infinity;
      });
    }
  }]);

  return SortByNumber;
})(ChangeOrder);

SortByNumber.register();

var NumberingLines = (function (_TransformString32) {
  _inherits(NumberingLines, _TransformString32);

  function NumberingLines() {
    _classCallCheck(this, NumberingLines);

    _get(Object.getPrototypeOf(NumberingLines.prototype), "constructor", this).apply(this, arguments);

    this.wise = "linewise";
  }

  _createClass(NumberingLines, [{
    key: "getNewText",
    value: function getNewText(text) {
      var _this16 = this;

      var rows = this.utils.splitTextByNewLine(text);
      var lastRowWidth = String(rows.length).length;

      var newRows = rows.map(function (rowText, i) {
        i++; // fix 0 start index to 1 start.
        var amountOfPadding = _this16.utils.limitNumber(lastRowWidth - String(i).length, { min: 0 });
        return " ".repeat(amountOfPadding) + i + ": " + rowText;
      });
      return newRows.join("\n") + "\n";
    }
  }]);

  return NumberingLines;
})(TransformString);

NumberingLines.register();

// prettier-ignore
var classesToRegisterToSelectList = [ToggleCase, UpperCase, LowerCase, Replace, SplitByCharacter, CamelCase, SnakeCase, PascalCase, DashCase, TitleCase, EncodeUriComponent, DecodeUriComponent, TrimString, CompactSpaces, RemoveLeadingWhiteSpaces, AlignOccurrence, AlignOccurrenceByPadLeft, AlignOccurrenceByPadRight, ConvertToSoftTab, ConvertToHardTab, JoinWithKeepingSpace, JoinByInput, JoinByInputWithKeepingSpace, SplitString, SplitStringWithKeepingSplitter, SplitArguments, SplitArgumentsWithRemoveSeparator, SplitArgumentsOfInnerAnyPair, Reverse, Rotate, RotateBackwards, Sort, SortCaseInsensitively, SortByNumber, NumberingLines];
for (var klass of classesToRegisterToSelectList) {
  klass.registerToSelectList();
}
// e.g. command: 'sort'
// e.g args: ['-rn']
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL29wZXJhdG9yLXRyYW5zZm9ybS1zdHJpbmcuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsV0FBVyxDQUFBOzs7Ozs7Ozs7Ozs7OztBQUVYLElBQU0sQ0FBQyxHQUFHLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFBOztlQUNILE9BQU8sQ0FBQyxNQUFNLENBQUM7O0lBQXpDLGVBQWUsWUFBZixlQUFlO0lBQUUsS0FBSyxZQUFMLEtBQUs7O0FBRTdCLElBQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQTtBQUM5QixJQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFBOzs7OztJQUlwQyxlQUFlO1lBQWYsZUFBZTs7V0FBZixlQUFlOzBCQUFmLGVBQWU7OytCQUFmLGVBQWU7O1NBRW5CLFdBQVcsR0FBRyxJQUFJO1NBQ2xCLGNBQWMsR0FBRyx1QkFBdUI7U0FDeEMsVUFBVSxHQUFHLEtBQUs7U0FDbEIsaUJBQWlCLEdBQUcsS0FBSztTQUN6Qix5QkFBeUIsR0FBRyxLQUFLOzs7ZUFON0IsZUFBZTs7V0FZSix5QkFBQyxTQUFTLEVBQUU7QUFDekIsVUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLEVBQUUsU0FBUyxDQUFDLENBQUE7QUFDNUQsVUFBSSxJQUFJLEVBQUU7QUFDUixZQUFJLG1CQUFtQixZQUFBLENBQUE7QUFDdkIsWUFBSSxJQUFJLENBQUMseUJBQXlCLEVBQUU7QUFDbEMsY0FBTSxRQUFRLEdBQUcsU0FBUyxDQUFDLGNBQWMsRUFBRSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUE7QUFDckQsNkJBQW1CLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyx1QkFBdUIsQ0FBQyxRQUFRLENBQUMsQ0FBQTtTQUNwRTtBQUNELFlBQUksS0FB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QkFBb0IsRUFBRSxDQUFBO0NBQzdCIiwiZmlsZSI6Ii9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL29wZXJhdG9yLXRyYW5zZm9ybS1zdHJpbmcuanMiLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBiYWJlbFwiXG5cbmNvbnN0IF8gPSByZXF1aXJlKFwidW5kZXJzY29yZS1wbHVzXCIpXG5jb25zdCB7QnVmZmVyZWRQcm9jZXNzLCBSYW5nZX0gPSByZXF1aXJlKFwiYXRvbVwiKVxuXG5jb25zdCBCYXNlID0gcmVxdWlyZShcIi4vYmFzZVwiKVxuY29uc3QgT3BlcmF0b3IgPSBCYXNlLmdldENsYXNzKFwiT3BlcmF0b3JcIilcblxuLy8gVHJhbnNmb3JtU3RyaW5nXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuY2xhc3MgVHJhbnNmb3JtU3RyaW5nIGV4dGVuZHMgT3BlcmF0b3Ige1xuICBzdGF0aWMgc3RyaW5nVHJhbnNmb3JtZXJzID0gW11cbiAgdHJhY2tDaGFuZ2UgPSB0cnVlXG4gIHN0YXlPcHRpb25OYW1lID0gXCJzdGF5T25UcmFuc2Zvcm1TdHJpbmdcIlxuICBhdXRvSW5kZW50ID0gZmFsc2VcbiAgYXV0b0luZGVudE5ld2xpbmUgPSBmYWxzZVxuICBhdXRvSW5kZW50QWZ0ZXJJbnNlcnRUZXh0ID0gZmFsc2VcblxuICBzdGF0aWMgcmVnaXN0ZXJUb1NlbGVjdExpc3QoKSB7XG4gICAgdGhpcy5zdHJpbmdUcmFuc2Zvcm1lcnMucHVzaCh0aGlzKVxuICB9XG5cbiAgbXV0YXRlU2VsZWN0aW9uKHNlbGVjdGlvbikge1xuICAgIGNvbnN0IHRleHQgPSB0aGlzLmdldE5ld1RleHQoc2VsZWN0aW9uLmdldFRleHQoKSwgc2VsZWN0aW9uKVxuICAgIGlmICh0ZXh0KSB7XG4gICAgICBsZXQgc3RhcnRSb3dJbmRlbnRMZXZlbFxuICAgICAgaWYgKHRoaXMuYXV0b0luZGVudEFmdGVySW5zZXJ0VGV4dCkge1xuICAgICAgICBjb25zdCBzdGFydFJvdyA9IHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpLnN0YXJ0LnJvd1xuICAgICAgICBzdGFydFJvd0luZGVudExldmVsID0gdGhpcy5lZGl0b3IuaW5kZW50YXRpb25Gb3JCdWZmZXJSb3coc3RhcnRSb3cpXG4gICAgICB9XG4gICAgICBsZXQgcmFuZ2UgPSBzZWxlY3Rpb24uaW5zZXJ0VGV4dCh0ZXh0LCB7YXV0b0luZGVudDogdGhpcy5hdXRvSW5kZW50LCBhdXRvSW5kZW50TmV3bGluZTogdGhpcy5hdXRvSW5kZW50TmV3bGluZX0pXG5cbiAgICAgIGlmICh0aGlzLmF1dG9JbmRlbnRBZnRlckluc2VydFRleHQpIHtcbiAgICAgICAgLy8gQ3VycmVudGx5IHVzZWQgYnkgU3BsaXRBcmd1bWVudHMgYW5kIFN1cnJvdW5kKCBsaW5ld2lzZSB0YXJnZXQgb25seSApXG4gICAgICAgIGlmICh0aGlzLnRhcmdldC5pc0xpbmV3aXNlKCkpIHtcbiAgICAgICAgICByYW5nZSA9IHJhbmdlLnRyYW5zbGF0ZShbMCwgMF0sIFstMSwgMF0pXG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5lZGl0b3Iuc2V0SW5kZW50YXRpb25Gb3JCdWZmZXJSb3cocmFuZ2Uuc3RhcnQucm93LCBzdGFydFJvd0luZGVudExldmVsKVxuICAgICAgICB0aGlzLmVkaXRvci5zZXRJbmRlbnRhdGlvbkZvckJ1ZmZlclJvdyhyYW5nZS5lbmQucm93LCBzdGFydFJvd0luZGVudExldmVsKVxuICAgICAgICAvLyBBZGp1c3QgaW5uZXIgcmFuZ2UsIGVuZC5yb3cgaXMgYWxyZWFkeSggaWYgbmVlZGVkICkgdHJhbnNsYXRlZCBzbyBubyBuZWVkIHRvIHJlLXRyYW5zbGF0ZS5cbiAgICAgICAgdGhpcy51dGlscy5hZGp1c3RJbmRlbnRXaXRoS2VlcGluZ0xheW91dCh0aGlzLmVkaXRvciwgcmFuZ2UudHJhbnNsYXRlKFsxLCAwXSwgWzAsIDBdKSlcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblRyYW5zZm9ybVN0cmluZy5yZWdpc3RlcihmYWxzZSlcblxuY2xhc3MgVG9nZ2xlQ2FzZSBleHRlbmRzIFRyYW5zZm9ybVN0cmluZyB7XG4gIHN0YXRpYyBkaXNwbGF5TmFtZSA9IFwiVG9nZ2xlIH5cIlxuXG4gIGdldE5ld1RleHQodGV4dCkge1xuICAgIHJldHVybiB0ZXh0LnJlcGxhY2UoLy4vZywgdGhpcy51dGlscy50b2dnbGVDYXNlRm9yQ2hhcmFjdGVyKVxuICB9XG59XG5Ub2dnbGVDYXNlLnJlZ2lzdGVyKClcblxuY2xhc3MgVG9nZ2xlQ2FzZUFuZE1vdmVSaWdodCBleHRlbmRzIFRvZ2dsZUNhc2Uge1xuICBmbGFzaFRhcmdldCA9IGZhbHNlXG4gIHJlc3RvcmVQb3NpdGlvbnMgPSBmYWxzZVxuICB0YXJnZXQgPSBcIk1vdmVSaWdodFwiXG59XG5Ub2dnbGVDYXNlQW5kTW92ZVJpZ2h0LnJlZ2lzdGVyKClcblxuY2xhc3MgVXBwZXJDYXNlIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nIHtcbiAgc3RhdGljIGRpc3BsYXlOYW1lID0gXCJVcHBlclwiXG5cbiAgZ2V0TmV3VGV4dCh0ZXh0KSB7XG4gICAgcmV0dXJuIHRleHQudG9VcHBlckNhc2UoKVxuICB9XG59XG5VcHBlckNhc2UucmVnaXN0ZXIoKVxuXG5jbGFzcyBMb3dlckNhc2UgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmcge1xuICBzdGF0aWMgZGlzcGxheU5hbWUgPSBcIkxvd2VyXCJcblxuICBnZXROZXdUZXh0KHRleHQpIHtcbiAgICByZXR1cm4gdGV4dC50b0xvd2VyQ2FzZSgpXG4gIH1cbn1cbkxvd2VyQ2FzZS5yZWdpc3RlcigpXG5cbi8vIFJlcGxhY2Vcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIFJlcGxhY2UgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmcge1xuICBmbGFzaENoZWNrcG9pbnQgPSBcImRpZC1zZWxlY3Qtb2NjdXJyZW5jZVwiXG4gIGlucHV0ID0gbnVsbFxuICByZXF1aXJlSW5wdXQgPSB0cnVlXG4gIGF1dG9JbmRlbnROZXdsaW5lID0gdHJ1ZVxuICBzdXBwb3J0RWFybHlTZWxlY3QgPSB0cnVlXG5cbiAgaW5pdGlhbGl6ZSgpIHtcbiAgICB0aGlzLm9uRGlkU2VsZWN0VGFyZ2V0KCgpID0+IHRoaXMuZm9jdXNJbnB1dCh7aGlkZUN1cnNvcjogdHJ1ZX0pKVxuICAgIHN1cGVyLmluaXRpYWxpemUoKVxuICB9XG5cbiAgZ2V0TmV3VGV4dCh0ZXh0KSB7XG4gICAgaWYgKHRoaXMudGFyZ2V0LmlzKFwiTW92ZVJpZ2h0QnVmZmVyQ29sdW1uXCIpICYmIHRleHQubGVuZ3RoICE9PSB0aGlzLmdldENvdW50KCkpIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGNvbnN0IGlucHV0ID0gdGhpcy5pbnB1dCB8fCBcIlxcblwiXG4gICAgaWYgKGlucHV0ID09PSBcIlxcblwiKSB7XG4gICAgICB0aGlzLnJlc3RvcmVQb3NpdGlvbnMgPSBmYWxzZVxuICAgIH1cbiAgICByZXR1cm4gdGV4dC5yZXBsYWNlKC8uL2csIGlucHV0KVxuICB9XG59XG5SZXBsYWNlLnJlZ2lzdGVyKClcblxuY2xhc3MgUmVwbGFjZUNoYXJhY3RlciBleHRlbmRzIFJlcGxhY2Uge1xuICB0YXJnZXQgPSBcIk1vdmVSaWdodEJ1ZmZlckNvbHVtblwiXG59XG5SZXBsYWNlQ2hhcmFjdGVyLnJlZ2lzdGVyKClcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gRFVQIG1lYW5pbmcgd2l0aCBTcGxpdFN0cmluZyBuZWVkIGNvbnNvbGlkYXRlLlxuY2xhc3MgU3BsaXRCeUNoYXJhY3RlciBleHRlbmRzIFRyYW5zZm9ybVN0cmluZyB7XG4gIGdldE5ld1RleHQodGV4dCkge1xuICAgIHJldHVybiB0ZXh0LnNwbGl0KFwiXCIpLmpvaW4oXCIgXCIpXG4gIH1cbn1cblNwbGl0QnlDaGFyYWN0ZXIucmVnaXN0ZXIoKVxuXG5jbGFzcyBDYW1lbENhc2UgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmcge1xuICBzdGF0aWMgZGlzcGxheU5hbWUgPSBcIkNhbWVsaXplXCJcbiAgZ2V0TmV3VGV4dCh0ZXh0KSB7XG4gICAgcmV0dXJuIF8uY2FtZWxpemUodGV4dClcbiAgfVxufVxuQ2FtZWxDYXNlLnJlZ2lzdGVyKClcblxuY2xhc3MgU25ha2VDYXNlIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nIHtcbiAgc3RhdGljIGRpc3BsYXlOYW1lID0gXCJVbmRlcnNjb3JlIF9cIlxuICBnZXROZXdUZXh0KHRleHQpIHtcbiAgICByZXR1cm4gXy51bmRlcnNjb3JlKHRleHQpXG4gIH1cbn1cblNuYWtlQ2FzZS5yZWdpc3RlcigpXG5cbmNsYXNzIFBhc2NhbENhc2UgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmcge1xuICBzdGF0aWMgZGlzcGxheU5hbWUgPSBcIlBhc2NhbGl6ZVwiXG4gIGdldE5ld1RleHQodGV4dCkge1xuICAgIHJldHVybiBfLmNhcGl0YWxpemUoXy5jYW1lbGl6ZSh0ZXh0KSlcbiAgfVxufVxuUGFzY2FsQ2FzZS5yZWdpc3RlcigpXG5cbmNsYXNzIERhc2hDYXNlIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nIHtcbiAgc3RhdGljIGRpc3BsYXlOYW1lID0gXCJEYXNoZXJpemUgLVwiXG4gIGdldE5ld1RleHQodGV4dCkge1xuICAgIHJldHVybiBfLmRhc2hlcml6ZSh0ZXh0KVxuICB9XG59XG5EYXNoQ2FzZS5yZWdpc3RlcigpXG5cbmNsYXNzIFRpdGxlQ2FzZSBleHRlbmRzIFRyYW5zZm9ybVN0cmluZyB7XG4gIHN0YXRpYyBkaXNwbGF5TmFtZSA9IFwiVGl0bGl6ZVwiXG4gIGdldE5ld1RleHQodGV4dCkge1xuICAgIHJldHVybiBfLmh1bWFuaXplRXZlbnROYW1lKF8uZGFzaGVyaXplKHRleHQpKVxuICB9XG59XG5UaXRsZUNhc2UucmVnaXN0ZXIoKVxuXG5jbGFzcyBFbmNvZGVVcmlDb21wb25lbnQgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmcge1xuICBzdGF0aWMgZGlzcGxheU5hbWUgPSBcIkVuY29kZSBVUkkgQ29tcG9uZW50ICVcIlxuICBnZXROZXdUZXh0KHRleHQpIHtcbiAgICByZXR1cm4gZW5jb2RlVVJJQ29tcG9uZW50KHRleHQpXG4gIH1cbn1cbkVuY29kZVVyaUNvbXBvbmVudC5yZWdpc3RlcigpXG5cbmNsYXNzIERlY29kZVVyaUNvbXBvbmVudCBleHRlbmRzIFRyYW5zZm9ybVN0cmluZyB7XG4gIHN0YXRpYyBkaXNwbGF5TmFtZSA9IFwiRGVjb2RlIFVSSSBDb21wb25lbnQgJSVcIlxuICBnZXROZXdUZXh0KHRleHQpIHtcbiAgICByZXR1cm4gZGVjb2RlVVJJQ29tcG9uZW50KHRleHQpXG4gIH1cbn1cbkRlY29kZVVyaUNvbXBvbmVudC5yZWdpc3RlcigpXG5cbmNsYXNzIFRyaW1TdHJpbmcgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmcge1xuICBzdGF0aWMgZGlzcGxheU5hbWUgPSBcIlRyaW0gc3RyaW5nXCJcbiAgZ2V0TmV3VGV4dCh0ZXh0KSB7XG4gICAgcmV0dXJuIHRleHQudHJpbSgpXG4gIH1cbn1cblRyaW1TdHJpbmcucmVnaXN0ZXIoKVxuXG5jbGFzcyBDb21wYWN0U3BhY2VzIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nIHtcbiAgc3RhdGljIGRpc3BsYXlOYW1lID0gXCJDb21wYWN0IHNwYWNlXCJcbiAgZ2V0TmV3VGV4dCh0ZXh0KSB7XG4gICAgaWYgKHRleHQubWF0Y2goL15bIF0rJC8pKSB7XG4gICAgICByZXR1cm4gXCIgXCJcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gRG9uJ3QgY29tcGFjdCBmb3IgbGVhZGluZyBhbmQgdHJhaWxpbmcgd2hpdGUgc3BhY2VzLlxuICAgICAgY29uc3QgcmVnZXggPSAvXihcXHMqKSguKj8pKFxccyopJC9nbVxuICAgICAgcmV0dXJuIHRleHQucmVwbGFjZShyZWdleCwgKG0sIGxlYWRpbmcsIG1pZGRsZSwgdHJhaWxpbmcpID0+IHtcbiAgICAgICAgcmV0dXJuIGxlYWRpbmcgKyBtaWRkbGUuc3BsaXQoL1sgXFx0XSsvKS5qb2luKFwiIFwiKSArIHRyYWlsaW5nXG4gICAgICB9KVxuICAgIH1cbiAgfVxufVxuQ29tcGFjdFNwYWNlcy5yZWdpc3RlcigpXG5cbmNsYXNzIEFsaWduT2NjdXJyZW5jZSBleHRlbmRzIFRyYW5zZm9ybVN0cmluZyB7XG4gIG9jY3VycmVuY2UgPSB0cnVlXG4gIHdoaWNoVG9QYWQgPSBcImF1dG9cIlxuXG4gIGdldFNlbGVjdGlvblRha2VyKCkge1xuICAgIGNvbnN0IHNlbGVjdGlvbnNCeVJvdyA9IF8uZ3JvdXBCeShcbiAgICAgIHRoaXMuZWRpdG9yLmdldFNlbGVjdGlvbnNPcmRlcmVkQnlCdWZmZXJQb3NpdGlvbigpLFxuICAgICAgc2VsZWN0aW9uID0+IHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpLnN0YXJ0LnJvd1xuICAgIClcblxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBjb25zdCByb3dzID0gT2JqZWN0LmtleXMoc2VsZWN0aW9uc0J5Um93KVxuICAgICAgY29uc3Qgc2VsZWN0aW9ucyA9IHJvd3MubWFwKHJvdyA9PiBzZWxlY3Rpb25zQnlSb3dbcm93XS5zaGlmdCgpKS5maWx0ZXIocyA9PiBzKVxuICAgICAgcmV0dXJuIHNlbGVjdGlvbnNcbiAgICB9XG4gIH1cblxuICBnZXRXaWNoVG9QYWRGb3JUZXh0KHRleHQpIHtcbiAgICBpZiAodGhpcy53aGljaFRvUGFkICE9PSBcImF1dG9cIikgcmV0dXJuIHRoaXMud2hpY2hUb1BhZFxuXG4gICAgaWYgKC9eXFxzKls9XFx8XVxccyokLy50ZXN0KHRleHQpKSB7XG4gICAgICAvLyBBc2lnbm1lbnQoPSkgYW5kIGB8YChtYXJrZG93bi10YWJsZSBzZXBhcmF0b3IpXG4gICAgICByZXR1cm4gXCJzdGFydFwiXG4gICAgfSBlbHNlIGlmICgvXlxccyosXFxzKiQvLnRlc3QodGV4dCkpIHtcbiAgICAgIC8vIEFyZ3VtZW50c1xuICAgICAgcmV0dXJuIFwiZW5kXCJcbiAgICB9IGVsc2UgaWYgKC9cXFckLy50ZXN0KHRleHQpKSB7XG4gICAgICAvLyBlbmRzIHdpdGggbm9uLXdvcmQtY2hhclxuICAgICAgcmV0dXJuIFwiZW5kXCJcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIFwic3RhcnRcIlxuICAgIH1cbiAgfVxuXG4gIGNhbGN1bGF0ZVBhZGRpbmcoKSB7XG4gICAgY29uc3QgdG90YWxBbW91bnRPZlBhZGRpbmdCeVJvdyA9IHt9XG4gICAgY29uc3QgY29sdW1uRm9yU2VsZWN0aW9uID0gc2VsZWN0aW9uID0+IHtcbiAgICAgIGNvbnN0IHdoaWNoID0gdGhpcy5nZXRXaWNoVG9QYWRGb3JUZXh0KHNlbGVjdGlvbi5nZXRUZXh0KCkpXG4gICAgICBjb25zdCBwb2ludCA9IHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpW3doaWNoXVxuICAgICAgcmV0dXJuIHBvaW50LmNvbHVtbiArICh0b3RhbEFtb3VudE9mUGFkZGluZ0J5Um93W3BvaW50LnJvd10gfHwgMClcbiAgICB9XG5cbiAgICBjb25zdCB0YWtlU2VsZWN0aW9ucyA9IHRoaXMuZ2V0U2VsZWN0aW9uVGFrZXIoKVxuICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICBjb25zdCBzZWxlY3Rpb25zID0gdGFrZVNlbGVjdGlvbnMoKVxuICAgICAgaWYgKCFzZWxlY3Rpb25zLmxlbmd0aCkgcmV0dXJuXG4gICAgICBjb25zdCBtYXhDb2x1bW4gPSBzZWxlY3Rpb25zLm1hcChjb2x1bW5Gb3JTZWxlY3Rpb24pLnJlZHVjZSgobWF4LCBjdXIpID0+IChjdXIgPiBtYXggPyBjdXIgOiBtYXgpKVxuICAgICAgZm9yIChjb25zdCBzZWxlY3Rpb24gb2Ygc2VsZWN0aW9ucykge1xuICAgICAgICBjb25zdCByb3cgPSBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKS5zdGFydC5yb3dcbiAgICAgICAgY29uc3QgYW1vdW50T2ZQYWRkaW5nID0gbWF4Q29sdW1uIC0gY29sdW1uRm9yU2VsZWN0aW9uKHNlbGVjdGlvbilcbiAgICAgICAgdG90YWxBbW91bnRPZlBhZGRpbmdCeVJvd1tyb3ddID0gKHRvdGFsQW1vdW50T2ZQYWRkaW5nQnlSb3dbcm93XSB8fCAwKSArIGFtb3VudE9mUGFkZGluZ1xuICAgICAgICB0aGlzLmFtb3VudE9mUGFkZGluZ0J5U2VsZWN0aW9uLnNldChzZWxlY3Rpb24sIGFtb3VudE9mUGFkZGluZylcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBleGVjdXRlKCkge1xuICAgIHRoaXMuYW1vdW50T2ZQYWRkaW5nQnlTZWxlY3Rpb24gPSBuZXcgTWFwKClcbiAgICB0aGlzLm9uRGlkU2VsZWN0VGFyZ2V0KCgpID0+IHtcbiAgICAgIHRoaXMuY2FsY3VsYXRlUGFkZGluZygpXG4gICAgfSlcbiAgICBzdXBlci5leGVjdXRlKClcbiAgfVxuXG4gIGdldE5ld1RleHQodGV4dCwgc2VsZWN0aW9uKSB7XG4gICAgY29uc3QgcGFkZGluZyA9IFwiIFwiLnJlcGVhdCh0aGlzLmFtb3VudE9mUGFkZGluZ0J5U2VsZWN0aW9uLmdldChzZWxlY3Rpb24pKVxuICAgIGNvbnN0IHdoaWNoVG9QYWQgPSB0aGlzLmdldFdpY2hUb1BhZEZvclRleHQoc2VsZWN0aW9uLmdldFRleHQoKSlcbiAgICByZXR1cm4gd2hpY2hUb1BhZCA9PT0gXCJzdGFydFwiID8gcGFkZGluZyArIHRleHQgOiB0ZXh0ICsgcGFkZGluZ1xuICB9XG59XG5BbGlnbk9jY3VycmVuY2UucmVnaXN0ZXIoKVxuXG5jbGFzcyBBbGlnbk9jY3VycmVuY2VCeVBhZExlZnQgZXh0ZW5kcyBBbGlnbk9jY3VycmVuY2Uge1xuICB3aGljaFRvUGFkID0gXCJzdGFydFwiXG59XG5BbGlnbk9jY3VycmVuY2VCeVBhZExlZnQucmVnaXN0ZXIoKVxuXG5jbGFzcyBBbGlnbk9jY3VycmVuY2VCeVBhZFJpZ2h0IGV4dGVuZHMgQWxpZ25PY2N1cnJlbmNlIHtcbiAgd2hpY2hUb1BhZCA9IFwiZW5kXCJcbn1cbkFsaWduT2NjdXJyZW5jZUJ5UGFkUmlnaHQucmVnaXN0ZXIoKVxuXG5jbGFzcyBSZW1vdmVMZWFkaW5nV2hpdGVTcGFjZXMgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmcge1xuICB3aXNlID0gXCJsaW5ld2lzZVwiXG4gIGdldE5ld1RleHQodGV4dCwgc2VsZWN0aW9uKSB7XG4gICAgY29uc3QgdHJpbUxlZnQgPSB0ZXh0ID0+IHRleHQudHJpbUxlZnQoKVxuICAgIHJldHVybiAoXG4gICAgICB0aGlzLnV0aWxzLnNwbGl0VGV4dEJ5TmV3TGluZSh0ZXh0KVxuICAgICAgICAubWFwKHRyaW1MZWZ0KVxuICAgICAgICAuam9pbihcIlxcblwiKSArIFwiXFxuXCJcbiAgICApXG4gIH1cbn1cblJlbW92ZUxlYWRpbmdXaGl0ZVNwYWNlcy5yZWdpc3RlcigpXG5cbmNsYXNzIENvbnZlcnRUb1NvZnRUYWIgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmcge1xuICBzdGF0aWMgZGlzcGxheU5hbWUgPSBcIlNvZnQgVGFiXCJcbiAgd2lzZSA9IFwibGluZXdpc2VcIlxuXG4gIG11dGF0ZVNlbGVjdGlvbihzZWxlY3Rpb24pIHtcbiAgICByZXR1cm4gdGhpcy5zY2FuRm9yd2FyZCgvXFx0L2csIHtzY2FuUmFuZ2U6IHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpfSwgKHtyYW5nZSwgcmVwbGFjZX0pID0+IHtcbiAgICAgIC8vIFJlcGxhY2UgXFx0IHRvIHNwYWNlcyB3aGljaCBsZW5ndGggaXMgdmFyeSBkZXBlbmRpbmcgb24gdGFiU3RvcCBhbmQgdGFiTGVuZ2h0XG4gICAgICAvLyBTbyB3ZSBkaXJlY3RseSBjb25zdWx0IGl0J3Mgc2NyZWVuIHJlcHJlc2VudGluZyBsZW5ndGguXG4gICAgICBjb25zdCBsZW5ndGggPSB0aGlzLmVkaXRvci5zY3JlZW5SYW5nZUZvckJ1ZmZlclJhbmdlKHJhbmdlKS5nZXRFeHRlbnQoKS5jb2x1bW5cbiAgICAgIHJldHVybiByZXBsYWNlKFwiIFwiLnJlcGVhdChsZW5ndGgpKVxuICAgIH0pXG4gIH1cbn1cbkNvbnZlcnRUb1NvZnRUYWIucmVnaXN0ZXIoKVxuXG5jbGFzcyBDb252ZXJ0VG9IYXJkVGFiIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nIHtcbiAgc3RhdGljIGRpc3BsYXlOYW1lID0gXCJIYXJkIFRhYlwiXG5cbiAgbXV0YXRlU2VsZWN0aW9uKHNlbGVjdGlvbikge1xuICAgIGNvbnN0IHRhYkxlbmd0aCA9IHRoaXMuZWRpdG9yLmdldFRhYkxlbmd0aCgpXG4gICAgdGhpcy5zY2FuRm9yd2FyZCgvWyBcXHRdKy9nLCB7c2NhblJhbmdlOiBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKX0sICh7cmFuZ2UsIHJlcGxhY2V9KSA9PiB7XG4gICAgICBjb25zdCB7c3RhcnQsIGVuZH0gPSB0aGlzLmVkaXRvci5zY3JlZW5SYW5nZUZvckJ1ZmZlclJhbmdlKHJhbmdlKVxuICAgICAgbGV0IHN0YXJ0Q29sdW1uID0gc3RhcnQuY29sdW1uXG4gICAgICBjb25zdCBlbmRDb2x1bW4gPSBlbmQuY29sdW1uXG5cbiAgICAgIC8vIFdlIGNhbid0IG5haXZlbHkgcmVwbGFjZSBzcGFjZXMgdG8gdGFiLCB3ZSBoYXZlIHRvIGNvbnNpZGVyIHZhbGlkIHRhYlN0b3AgY29sdW1uXG4gICAgICAvLyBJZiBuZXh0VGFiU3RvcCBjb2x1bW4gZXhjZWVkcyByZXBsYWNhYmxlIHJhbmdlLCB3ZSBwYWQgd2l0aCBzcGFjZXMuXG4gICAgICBsZXQgbmV3VGV4dCA9IFwiXCJcbiAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgIGNvbnN0IHJlbWFpbmRlciA9IHN0YXJ0Q29sdW1uICUgdGFiTGVuZ3RoXG4gICAgICAgIGNvbnN0IG5leHRUYWJTdG9wID0gc3RhcnRDb2x1bW4gKyAocmVtYWluZGVyID09PSAwID8gdGFiTGVuZ3RoIDogcmVtYWluZGVyKVxuICAgICAgICBpZiAobmV4dFRhYlN0b3AgPiBlbmRDb2x1bW4pIHtcbiAgICAgICAgICBuZXdUZXh0ICs9IFwiIFwiLnJlcGVhdChlbmRDb2x1bW4gLSBzdGFydENvbHVtbilcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBuZXdUZXh0ICs9IFwiXFx0XCJcbiAgICAgICAgfVxuICAgICAgICBzdGFydENvbHVtbiA9IG5leHRUYWJTdG9wXG4gICAgICAgIGlmIChzdGFydENvbHVtbiA+PSBlbmRDb2x1bW4pIHtcbiAgICAgICAgICBicmVha1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJlcGxhY2UobmV3VGV4dClcbiAgICB9KVxuICB9XG59XG5Db252ZXJ0VG9IYXJkVGFiLnJlZ2lzdGVyKClcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgVHJhbnNmb3JtU3RyaW5nQnlFeHRlcm5hbENvbW1hbmQgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmcge1xuICBhdXRvSW5kZW50ID0gdHJ1ZVxuICBjb21tYW5kID0gXCJcIiAvLyBlLmcuIGNvbW1hbmQ6ICdzb3J0J1xuICBhcmdzID0gW10gLy8gZS5nIGFyZ3M6IFsnLXJuJ11cbiAgc3Rkb3V0QnlTZWxlY3Rpb24gPSBudWxsXG5cbiAgZXhlY3V0ZSgpIHtcbiAgICB0aGlzLm5vcm1hbGl6ZVNlbGVjdGlvbnNJZk5lY2Vzc2FyeSgpXG4gICAgaWYgKHRoaXMuc2VsZWN0VGFyZ2V0KCkpIHtcbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHRoaXMuY29sbGVjdChyZXNvbHZlKSkudGhlbigoKSA9PiB7XG4gICAgICAgIGZvciAoY29uc3Qgc2VsZWN0aW9uIG9mIHRoaXMuZWRpdG9yLmdldFNlbGVjdGlvbnMoKSkge1xuICAgICAgICAgIGNvbnN0IHRleHQgPSB0aGlzLmdldE5ld1RleHQoc2VsZWN0aW9uLmdldFRleHQoKSwgc2VsZWN0aW9uKVxuICAgICAgICAgIHNlbGVjdGlvbi5pbnNlcnRUZXh0KHRleHQsIHthdXRvSW5kZW50OiB0aGlzLmF1dG9JbmRlbnR9KVxuICAgICAgICB9XG4gICAgICAgIHRoaXMucmVzdG9yZUN1cnNvclBvc2l0aW9uc0lmTmVjZXNzYXJ5KClcbiAgICAgICAgdGhpcy5hY3RpdmF0ZU1vZGUoXCJub3JtYWxcIilcbiAgICAgIH0pXG4gICAgfVxuICB9XG5cbiAgY29sbGVjdChyZXNvbHZlKSB7XG4gICAgdGhpcy5zdGRvdXRCeVNlbGVjdGlvbiA9IG5ldyBNYXAoKVxuICAgIGxldCBwcm9jZXNzRmluaXNoZWQgPSAwLFxuICAgICAgcHJvY2Vzc1J1bm5pbmcgPSAwXG4gICAgZm9yIChjb25zdCBzZWxlY3Rpb24gb2YgdGhpcy5lZGl0b3IuZ2V0U2VsZWN0aW9ucygpKSB7XG4gICAgICBjb25zdCB7Y29tbWFuZCwgYXJnc30gPSB0aGlzLmdldENvbW1hbmQoc2VsZWN0aW9uKSB8fCB7fVxuICAgICAgaWYgKGNvbW1hbmQgPT0gbnVsbCB8fCBhcmdzID09IG51bGwpIHJldHVyblxuXG4gICAgICBwcm9jZXNzUnVubmluZysrXG4gICAgICB0aGlzLnJ1bkV4dGVybmFsQ29tbWFuZCh7XG4gICAgICAgIGNvbW1hbmQ6IGNvbW1hbmQsXG4gICAgICAgIGFyZ3M6IGFyZ3MsXG4gICAgICAgIHN0ZGluOiB0aGlzLmdldFN0ZGluKHNlbGVjdGlvbiksXG4gICAgICAgIHN0ZG91dDogb3V0cHV0ID0+IHRoaXMuc3Rkb3V0QnlTZWxlY3Rpb24uc2V0KHNlbGVjdGlvbiwgb3V0cHV0KSxcbiAgICAgICAgZXhpdDogY29kZSA9PiB7XG4gICAgICAgICAgcHJvY2Vzc0ZpbmlzaGVkKytcbiAgICAgICAgICBpZiAocHJvY2Vzc1J1bm5pbmcgPT09IHByb2Nlc3NGaW5pc2hlZCkgcmVzb2x2ZSgpXG4gICAgICAgIH0sXG4gICAgICB9KVxuICAgIH1cbiAgfVxuXG4gIHJ1bkV4dGVybmFsQ29tbWFuZChvcHRpb25zKSB7XG4gICAgY29uc3Qge3N0ZGlufSA9IG9wdGlvbnNcbiAgICBkZWxldGUgb3B0aW9ucy5zdGRpblxuICAgIGNvbnN0IGJ1ZmZlcmVkUHJvY2VzcyA9IG5ldyBCdWZmZXJlZFByb2Nlc3Mob3B0aW9ucylcbiAgICBidWZmZXJlZFByb2Nlc3Mub25XaWxsVGhyb3dFcnJvcigoe2Vycm9yLCBoYW5kbGV9KSA9PiB7XG4gICAgICAvLyBTdXBwcmVzcyBjb21tYW5kIG5vdCBmb3VuZCBlcnJvciBpbnRlbnRpb25hbGx5LlxuICAgICAgaWYgKGVycm9yLmNvZGUgPT09IFwiRU5PRU5UXCIgJiYgZXJyb3Iuc3lzY2FsbC5pbmRleE9mKFwic3Bhd25cIikgPT09IDApIHtcbiAgICAgICAgY29uc29sZS5sb2coYCR7dGhpcy5nZXRDb21tYW5kTmFtZSgpfTogRmFpbGVkIHRvIHNwYXduIGNvbW1hbmQgJHtlcnJvci5wYXRofS5gKVxuICAgICAgICBoYW5kbGUoKVxuICAgICAgfVxuICAgICAgdGhpcy5jYW5jZWxPcGVyYXRpb24oKVxuICAgIH0pXG5cbiAgICBpZiAoc3RkaW4pIHtcbiAgICAgIGJ1ZmZlcmVkUHJvY2Vzcy5wcm9jZXNzLnN0ZGluLndyaXRlKHN0ZGluKVxuICAgICAgYnVmZmVyZWRQcm9jZXNzLnByb2Nlc3Muc3RkaW4uZW5kKClcbiAgICB9XG4gIH1cblxuICBnZXROZXdUZXh0KHRleHQsIHNlbGVjdGlvbikge1xuICAgIHJldHVybiB0aGlzLmdldFN0ZG91dChzZWxlY3Rpb24pIHx8IHRleHRcbiAgfVxuXG4gIC8vIEZvciBlYXNpbHkgZXh0ZW5kIGJ5IHZtcCBwbHVnaW4uXG4gIGdldENvbW1hbmQoc2VsZWN0aW9uKSB7XG4gICAgcmV0dXJuIHtjb21tYW5kOiB0aGlzLmNvbW1hbmQsIGFyZ3M6IHRoaXMuYXJnc31cbiAgfVxuICBnZXRTdGRpbihzZWxlY3Rpb24pIHtcbiAgICByZXR1cm4gc2VsZWN0aW9uLmdldFRleHQoKVxuICB9XG4gIGdldFN0ZG91dChzZWxlY3Rpb24pIHtcbiAgICByZXR1cm4gdGhpcy5zdGRvdXRCeVNlbGVjdGlvbi5nZXQoc2VsZWN0aW9uKVxuICB9XG59XG5UcmFuc2Zvcm1TdHJpbmdCeUV4dGVybmFsQ29tbWFuZC5yZWdpc3RlcihmYWxzZSlcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgVHJhbnNmb3JtU3RyaW5nQnlTZWxlY3RMaXN0IGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nIHtcbiAgc3RhdGljIGVsZWN0TGlzdEl0ZW1zID0gbnVsbFxuICByZXF1aXJlSW5wdXQgPSB0cnVlXG5cbiAgc3RhdGljIGdldFNlbGVjdExpc3RJdGVtcygpIHtcbiAgICBpZiAoIXRoaXMuc2VsZWN0TGlzdEl0ZW1zKSB7XG4gICAgICB0aGlzLnNlbGVjdExpc3RJdGVtcyA9IHRoaXMuc3RyaW5nVHJhbnNmb3JtZXJzLm1hcChrbGFzcyA9PiAoe1xuICAgICAgICBrbGFzczoga2xhc3MsXG4gICAgICAgIGRpc3BsYXlOYW1lOiBrbGFzcy5oYXNPd25Qcm9wZXJ0eShcImRpc3BsYXlOYW1lXCIpXG4gICAgICAgICAgPyBrbGFzcy5kaXNwbGF5TmFtZVxuICAgICAgICAgIDogXy5odW1hbml6ZUV2ZW50TmFtZShfLmRhc2hlcml6ZShrbGFzcy5uYW1lKSksXG4gICAgICB9KSlcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuc2VsZWN0TGlzdEl0ZW1zXG4gIH1cblxuICBnZXRJdGVtcygpIHtcbiAgICByZXR1cm4gdGhpcy5jb25zdHJ1Y3Rvci5nZXRTZWxlY3RMaXN0SXRlbXMoKVxuICB9XG5cbiAgaW5pdGlhbGl6ZSgpIHtcbiAgICB0aGlzLnZpbVN0YXRlLm9uRGlkQ29uZmlybVNlbGVjdExpc3QoaXRlbSA9PiB7XG4gICAgICBjb25zdCB0cmFuc2Zvcm1lciA9IGl0ZW0ua2xhc3NcbiAgICAgIGlmICh0cmFuc2Zvcm1lci5wcm90b3R5cGUudGFyZ2V0KSB7XG4gICAgICAgIHRoaXMudGFyZ2V0ID0gdHJhbnNmb3JtZXIucHJvdG90eXBlLnRhcmdldFxuICAgICAgfVxuICAgICAgdGhpcy52aW1TdGF0ZS5yZXNldCgpXG4gICAgICBpZiAodGhpcy50YXJnZXQpIHtcbiAgICAgICAgdGhpcy52aW1TdGF0ZS5vcGVyYXRpb25TdGFjay5ydW4odHJhbnNmb3JtZXIsIHt0YXJnZXQ6IHRoaXMudGFyZ2V0fSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMudmltU3RhdGUub3BlcmF0aW9uU3RhY2sucnVuKHRyYW5zZm9ybWVyKVxuICAgICAgfVxuICAgIH0pXG5cbiAgICB0aGlzLmZvY3VzU2VsZWN0TGlzdCh7aXRlbXM6IHRoaXMuZ2V0SXRlbXMoKX0pXG5cbiAgICBzdXBlci5pbml0aWFsaXplKClcbiAgfVxuXG4gIGV4ZWN1dGUoKSB7XG4gICAgLy8gTkVWRVIgYmUgZXhlY3V0ZWQgc2luY2Ugb3BlcmF0aW9uU3RhY2sgaXMgcmVwbGFjZWQgd2l0aCBzZWxlY3RlZCB0cmFuc2Zvcm1lclxuICAgIHRocm93IG5ldyBFcnJvcihgJHt0aGlzLm5hbWV9IHNob3VsZCBub3QgYmUgZXhlY3V0ZWRgKVxuICB9XG59XG5UcmFuc2Zvcm1TdHJpbmdCeVNlbGVjdExpc3QucmVnaXN0ZXIoKVxuXG5jbGFzcyBUcmFuc2Zvcm1Xb3JkQnlTZWxlY3RMaXN0IGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nQnlTZWxlY3RMaXN0IHtcbiAgdGFyZ2V0ID0gXCJJbm5lcldvcmRcIlxufVxuVHJhbnNmb3JtV29yZEJ5U2VsZWN0TGlzdC5yZWdpc3RlcigpXG5cbmNsYXNzIFRyYW5zZm9ybVNtYXJ0V29yZEJ5U2VsZWN0TGlzdCBleHRlbmRzIFRyYW5zZm9ybVN0cmluZ0J5U2VsZWN0TGlzdCB7XG4gIHRhcmdldCA9IFwiSW5uZXJTbWFydFdvcmRcIlxufVxuVHJhbnNmb3JtU21hcnRXb3JkQnlTZWxlY3RMaXN0LnJlZ2lzdGVyKClcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgUmVwbGFjZVdpdGhSZWdpc3RlciBleHRlbmRzIFRyYW5zZm9ybVN0cmluZyB7XG4gIGZsYXNoVHlwZSA9IFwib3BlcmF0b3ItbG9uZ1wiXG5cbiAgaW5pdGlhbGl6ZSgpIHtcbiAgICB0aGlzLnZpbVN0YXRlLnNlcXVlbnRpYWxQYXN0ZU1hbmFnZXIub25Jbml0aWFsaXplKHRoaXMpXG4gICAgc3VwZXIuaW5pdGlhbGl6ZSgpXG4gIH1cblxuICBleGVjdXRlKCkge1xuICAgIHRoaXMuc2VxdWVudGlhbFBhc3RlID0gdGhpcy52aW1TdGF0ZS5zZXF1ZW50aWFsUGFzdGVNYW5hZ2VyLm9uRXhlY3V0ZSh0aGlzKVxuXG4gICAgc3VwZXIuZXhlY3V0ZSgpXG5cbiAgICBmb3IgKGNvbnN0IHNlbGVjdGlvbiBvZiB0aGlzLmVkaXRvci5nZXRTZWxlY3Rpb25zKCkpIHtcbiAgICAgIGNvbnN0IHJhbmdlID0gdGhpcy5tdXRhdGlvbk1hbmFnZXIuZ2V0TXV0YXRlZEJ1ZmZlclJhbmdlRm9yU2VsZWN0aW9uKHNlbGVjdGlvbilcbiAgICAgIHRoaXMudmltU3RhdGUuc2VxdWVudGlhbFBhc3RlTWFuYWdlci5zYXZlUGFzdGVkUmFuZ2VGb3JTZWxlY3Rpb24oc2VsZWN0aW9uLCByYW5nZSlcbiAgICB9XG4gIH1cblxuICBnZXROZXdUZXh0KHRleHQsIHNlbGVjdGlvbikge1xuICAgIGNvbnN0IHZhbHVlID0gdGhpcy52aW1TdGF0ZS5yZWdpc3Rlci5nZXQobnVsbCwgc2VsZWN0aW9uLCB0aGlzLnNlcXVlbnRpYWxQYXN0ZSlcbiAgICByZXR1cm4gdmFsdWUgPyB2YWx1ZS50ZXh0IDogXCJcIlxuICB9XG59XG5SZXBsYWNlV2l0aFJlZ2lzdGVyLnJlZ2lzdGVyKClcblxuLy8gU2F2ZSB0ZXh0IHRvIHJlZ2lzdGVyIGJlZm9yZSByZXBsYWNlXG5jbGFzcyBTd2FwV2l0aFJlZ2lzdGVyIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nIHtcbiAgZ2V0TmV3VGV4dCh0ZXh0LCBzZWxlY3Rpb24pIHtcbiAgICBjb25zdCBuZXdUZXh0ID0gdGhpcy52aW1TdGF0ZS5yZWdpc3Rlci5nZXRUZXh0KClcbiAgICB0aGlzLnNldFRleHRUb1JlZ2lzdGVyKHRleHQsIHNlbGVjdGlvbilcbiAgICByZXR1cm4gbmV3VGV4dFxuICB9XG59XG5Td2FwV2l0aFJlZ2lzdGVyLnJlZ2lzdGVyKClcblxuLy8gSW5kZW50IDwgVHJhbnNmb3JtU3RyaW5nXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBJbmRlbnQgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmcge1xuICBzdGF5QnlNYXJrZXIgPSB0cnVlXG4gIHNldFRvRmlyc3RDaGFyYWN0ZXJPbkxpbmV3aXNlID0gdHJ1ZVxuICB3aXNlID0gXCJsaW5ld2lzZVwiXG5cbiAgbXV0YXRlU2VsZWN0aW9uKHNlbGVjdGlvbikge1xuICAgIC8vIE5lZWQgY291bnQgdGltZXMgaW5kZW50YXRpb24gaW4gdmlzdWFsLW1vZGUgYW5kIGl0cyByZXBlYXQoYC5gKS5cbiAgICBpZiAodGhpcy50YXJnZXQuaXMoXCJDdXJyZW50U2VsZWN0aW9uXCIpKSB7XG4gICAgICBsZXQgb2xkVGV4dFxuICAgICAgLy8gbGltaXQgdG8gMTAwIHRvIGF2b2lkIGZyZWV6aW5nIGJ5IGFjY2lkZW50YWwgYmlnIG51bWJlci5cbiAgICAgIGNvbnN0IGNvdW50ID0gdGhpcy51dGlscy5saW1pdE51bWJlcih0aGlzLmdldENvdW50KCksIHttYXg6IDEwMH0pXG4gICAgICB0aGlzLmNvdW50VGltZXMoY291bnQsICh7c3RvcH0pID0+IHtcbiAgICAgICAgb2xkVGV4dCA9IHNlbGVjdGlvbi5nZXRUZXh0KClcbiAgICAgICAgdGhpcy5pbmRlbnQoc2VsZWN0aW9uKVxuICAgICAgICBpZiAoc2VsZWN0aW9uLmdldFRleHQoKSA9PT0gb2xkVGV4dCkgc3RvcCgpXG4gICAgICB9KVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmluZGVudChzZWxlY3Rpb24pXG4gICAgfVxuICB9XG5cbiAgaW5kZW50KHNlbGVjdGlvbikge1xuICAgIHNlbGVjdGlvbi5pbmRlbnRTZWxlY3RlZFJvd3MoKVxuICB9XG59XG5JbmRlbnQucmVnaXN0ZXIoKVxuXG5jbGFzcyBPdXRkZW50IGV4dGVuZHMgSW5kZW50IHtcbiAgaW5kZW50KHNlbGVjdGlvbikge1xuICAgIHNlbGVjdGlvbi5vdXRkZW50U2VsZWN0ZWRSb3dzKClcbiAgfVxufVxuT3V0ZGVudC5yZWdpc3RlcigpXG5cbmNsYXNzIEF1dG9JbmRlbnQgZXh0ZW5kcyBJbmRlbnQge1xuICBpbmRlbnQoc2VsZWN0aW9uKSB7XG4gICAgc2VsZWN0aW9uLmF1dG9JbmRlbnRTZWxlY3RlZFJvd3MoKVxuICB9XG59XG5BdXRvSW5kZW50LnJlZ2lzdGVyKClcblxuY2xhc3MgVG9nZ2xlTGluZUNvbW1lbnRzIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nIHtcbiAgZmxhc2hUYXJnZXQgPSBmYWxzZVxuICBzdGF5QnlNYXJrZXIgPSB0cnVlXG4gIHdpc2UgPSBcImxpbmV3aXNlXCJcblxuICBtdXRhdGVTZWxlY3Rpb24oc2VsZWN0aW9uKSB7XG4gICAgc2VsZWN0aW9uLnRvZ2dsZUxpbmVDb21tZW50cygpXG4gIH1cbn1cblRvZ2dsZUxpbmVDb21tZW50cy5yZWdpc3RlcigpXG5cbmNsYXNzIFJlZmxvdyBleHRlbmRzIFRyYW5zZm9ybVN0cmluZyB7XG4gIG11dGF0ZVNlbGVjdGlvbihzZWxlY3Rpb24pIHtcbiAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKHRoaXMuZWRpdG9yRWxlbWVudCwgXCJhdXRvZmxvdzpyZWZsb3ctc2VsZWN0aW9uXCIpXG4gIH1cbn1cblJlZmxvdy5yZWdpc3RlcigpXG5cbmNsYXNzIFJlZmxvd1dpdGhTdGF5IGV4dGVuZHMgUmVmbG93IHtcbiAgc3RheUF0U2FtZVBvc2l0aW9uID0gdHJ1ZVxufVxuUmVmbG93V2l0aFN0YXkucmVnaXN0ZXIoKVxuXG4vLyBTdXJyb3VuZCA8IFRyYW5zZm9ybVN0cmluZ1xuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgU3Vycm91bmRCYXNlIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nIHtcbiAgcGFpcnMgPSBbW1wiKFwiLCBcIilcIl0sIFtcIntcIiwgXCJ9XCJdLCBbXCJbXCIsIFwiXVwiXSwgW1wiPFwiLCBcIj5cIl1dXG4gIHBhaXJzQnlBbGlhcyA9IHtcbiAgICBiOiBbXCIoXCIsIFwiKVwiXSxcbiAgICBCOiBbXCJ7XCIsIFwifVwiXSxcbiAgICByOiBbXCJbXCIsIFwiXVwiXSxcbiAgICBhOiBbXCI8XCIsIFwiPlwiXSxcbiAgfVxuXG4gIHBhaXJDaGFyc0FsbG93Rm9yd2FyZGluZyA9IFwiW10oKXt9XCJcbiAgaW5wdXQgPSBudWxsXG4gIHJlcXVpcmVJbnB1dCA9IHRydWVcbiAgc3VwcG9ydEVhcmx5U2VsZWN0ID0gdHJ1ZSAvLyBFeHBlcmltZW50YWxcblxuICBmb2N1c0lucHV0Rm9yU3Vycm91bmRDaGFyKCkge1xuICAgIHRoaXMuZm9jdXNJbnB1dCh7aGlkZUN1cnNvcjogdHJ1ZX0pXG4gIH1cblxuICBmb2N1c0lucHV0Rm9yVGFyZ2V0UGFpckNoYXIoKSB7XG4gICAgdGhpcy5mb2N1c0lucHV0KHtvbkNvbmZpcm06IGNoYXIgPT4gdGhpcy5vbkNvbmZpcm1UYXJnZXRQYWlyQ2hhcihjaGFyKX0pXG4gIH1cblxuICBnZXRQYWlyKGNoYXIpIHtcbiAgICBsZXQgcGFpclxuICAgIHJldHVybiBjaGFyIGluIHRoaXMucGFpcnNCeUFsaWFzXG4gICAgICA/IHRoaXMucGFpcnNCeUFsaWFzW2NoYXJdXG4gICAgICA6IFsuLi50aGlzLnBhaXJzLCBbY2hhciwgY2hhcl1dLmZpbmQocGFpciA9PiBwYWlyLmluY2x1ZGVzKGNoYXIpKVxuICB9XG5cbiAgc3Vycm91bmQodGV4dCwgY2hhciwge2tlZXBMYXlvdXQgPSBmYWxzZX0gPSB7fSkge1xuICAgIGxldCBbb3BlbiwgY2xvc2VdID0gdGhpcy5nZXRQYWlyKGNoYXIpXG4gICAgaWYgKCFrZWVwTGF5b3V0ICYmIHRleHQuZW5kc1dpdGgoXCJcXG5cIikpIHtcbiAgICAgIHRoaXMuYXV0b0luZGVudEFmdGVySW5zZXJ0VGV4dCA9IHRydWVcbiAgICAgIG9wZW4gKz0gXCJcXG5cIlxuICAgICAgY2xvc2UgKz0gXCJcXG5cIlxuICAgIH1cblxuICAgIGlmICh0aGlzLmdldENvbmZpZyhcImNoYXJhY3RlcnNUb0FkZFNwYWNlT25TdXJyb3VuZFwiKS5pbmNsdWRlcyhjaGFyKSAmJiB0aGlzLnV0aWxzLmlzU2luZ2xlTGluZVRleHQodGV4dCkpIHtcbiAgICAgIHRleHQgPSBcIiBcIiArIHRleHQgKyBcIiBcIlxuICAgIH1cblxuICAgIHJldHVybiBvcGVuICsgdGV4dCArIGNsb3NlXG4gIH1cblxuICBkZWxldGVTdXJyb3VuZCh0ZXh0KSB7XG4gICAgLy8gQXNzdW1lIHN1cnJvdW5kaW5nIGNoYXIgaXMgb25lLWNoYXIgbGVuZ3RoLlxuICAgIGNvbnN0IG9wZW4gPSB0ZXh0WzBdXG4gICAgY29uc3QgY2xvc2UgPSB0ZXh0W3RleHQubGVuZ3RoIC0gMV1cbiAgICBjb25zdCBpbm5lclRleHQgPSB0ZXh0LnNsaWNlKDEsIHRleHQubGVuZ3RoIC0gMSlcbiAgICByZXR1cm4gdGhpcy51dGlscy5pc1NpbmdsZUxpbmVUZXh0KHRleHQpICYmIG9wZW4gIT09IGNsb3NlID8gaW5uZXJUZXh0LnRyaW0oKSA6IGlubmVyVGV4dFxuICB9XG5cbiAgb25Db25maXJtVGFyZ2V0UGFpckNoYXIoY2hhcikge1xuICAgIHRoaXMuc2V0VGFyZ2V0KHRoaXMuZ2V0SW5zdGFuY2UoXCJBUGFpclwiLCB7cGFpcjogdGhpcy5nZXRQYWlyKGNoYXIpfSkpXG4gIH1cbn1cblN1cnJvdW5kQmFzZS5yZWdpc3RlcihmYWxzZSlcblxuY2xhc3MgU3Vycm91bmQgZXh0ZW5kcyBTdXJyb3VuZEJhc2Uge1xuICBpbml0aWFsaXplKCkge1xuICAgIHRoaXMub25EaWRTZWxlY3RUYXJnZXQoKCkgPT4gdGhpcy5mb2N1c0lucHV0Rm9yU3Vycm91bmRDaGFyKCkpXG4gICAgc3VwZXIuaW5pdGlhbGl6ZSgpXG4gIH1cblxuICBnZXROZXdUZXh0KHRleHQpIHtcbiAgICByZXR1cm4gdGhpcy5zdXJyb3VuZCh0ZXh0LCB0aGlzLmlucHV0KVxuICB9XG59XG5TdXJyb3VuZC5yZWdpc3RlcigpXG5cbmNsYXNzIFN1cnJvdW5kV29yZCBleHRlbmRzIFN1cnJvdW5kIHtcbiAgdGFyZ2V0ID0gXCJJbm5lcldvcmRcIlxufVxuU3Vycm91bmRXb3JkLnJlZ2lzdGVyKClcblxuY2xhc3MgU3Vycm91bmRTbWFydFdvcmQgZXh0ZW5kcyBTdXJyb3VuZCB7XG4gIHRhcmdldCA9IFwiSW5uZXJTbWFydFdvcmRcIlxufVxuU3Vycm91bmRTbWFydFdvcmQucmVnaXN0ZXIoKVxuXG5jbGFzcyBNYXBTdXJyb3VuZCBleHRlbmRzIFN1cnJvdW5kIHtcbiAgb2NjdXJyZW5jZSA9IHRydWVcbiAgcGF0dGVybkZvck9jY3VycmVuY2UgPSAvXFx3Ky9nXG59XG5NYXBTdXJyb3VuZC5yZWdpc3RlcigpXG5cbi8vIERlbGV0ZSBTdXJyb3VuZFxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgRGVsZXRlU3Vycm91bmQgZXh0ZW5kcyBTdXJyb3VuZEJhc2Uge1xuICBpbml0aWFsaXplKCkge1xuICAgIGlmICghdGhpcy50YXJnZXQpIHtcbiAgICAgIHRoaXMuZm9jdXNJbnB1dEZvclRhcmdldFBhaXJDaGFyKClcbiAgICB9XG4gICAgc3VwZXIuaW5pdGlhbGl6ZSgpXG4gIH1cblxuICBvbkNvbmZpcm1UYXJnZXRQYWlyQ2hhcihjaGFyKSB7XG4gICAgc3VwZXIub25Db25maXJtVGFyZ2V0UGFpckNoYXIoY2hhcilcbiAgICB0aGlzLmlucHV0ID0gY2hhclxuICAgIHRoaXMucHJvY2Vzc09wZXJhdGlvbigpXG4gIH1cblxuICBnZXROZXdUZXh0KHRleHQpIHtcbiAgICByZXR1cm4gdGhpcy5kZWxldGVTdXJyb3VuZCh0ZXh0KVxuICB9XG59XG5EZWxldGVTdXJyb3VuZC5yZWdpc3RlcigpXG5cbmNsYXNzIERlbGV0ZVN1cnJvdW5kQW55UGFpciBleHRlbmRzIERlbGV0ZVN1cnJvdW5kIHtcbiAgdGFyZ2V0ID0gXCJBQW55UGFpclwiXG4gIHJlcXVpcmVJbnB1dCA9IGZhbHNlXG59XG5EZWxldGVTdXJyb3VuZEFueVBhaXIucmVnaXN0ZXIoKVxuXG5jbGFzcyBEZWxldGVTdXJyb3VuZEFueVBhaXJBbGxvd0ZvcndhcmRpbmcgZXh0ZW5kcyBEZWxldGVTdXJyb3VuZEFueVBhaXIge1xuICB0YXJnZXQgPSBcIkFBbnlQYWlyQWxsb3dGb3J3YXJkaW5nXCJcbn1cbkRlbGV0ZVN1cnJvdW5kQW55UGFpckFsbG93Rm9yd2FyZGluZy5yZWdpc3RlcigpXG5cbi8vIENoYW5nZSBTdXJyb3VuZFxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgQ2hhbmdlU3Vycm91bmQgZXh0ZW5kcyBTdXJyb3VuZEJhc2Uge1xuICBzaG93RGVsZXRlQ2hhck9uSG92ZXIoKSB7XG4gICAgY29uc3QgaG92ZXJQb2ludCA9IHRoaXMubXV0YXRpb25NYW5hZ2VyLmdldEluaXRpYWxQb2ludEZvclNlbGVjdGlvbih0aGlzLmVkaXRvci5nZXRMYXN0U2VsZWN0aW9uKCkpXG4gICAgY29uc3QgY2hhciA9IHRoaXMuZWRpdG9yLmdldFNlbGVjdGVkVGV4dCgpWzBdXG4gICAgdGhpcy52aW1TdGF0ZS5ob3Zlci5zZXQoY2hhciwgaG92ZXJQb2ludClcbiAgfVxuXG4gIGluaXRpYWxpemUoKSB7XG4gICAgaWYgKHRoaXMudGFyZ2V0KSB7XG4gICAgICB0aGlzLm9uRGlkRmFpbFNlbGVjdFRhcmdldCgoKSA9PiB0aGlzLmFib3J0KCkpXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMub25EaWRGYWlsU2VsZWN0VGFyZ2V0KCgpID0+IHRoaXMuY2FuY2VsT3BlcmF0aW9uKCkpXG4gICAgICB0aGlzLmZvY3VzSW5wdXRGb3JUYXJnZXRQYWlyQ2hhcigpXG4gICAgfVxuXG4gICAgdGhpcy5vbkRpZFNlbGVjdFRhcmdldCgoKSA9PiB7XG4gICAgICB0aGlzLnNob3dEZWxldGVDaGFyT25Ib3ZlcigpXG4gICAgICB0aGlzLmZvY3VzSW5wdXRGb3JTdXJyb3VuZENoYXIoKVxuICAgIH0pXG4gICAgc3VwZXIuaW5pdGlhbGl6ZSgpXG4gIH1cblxuICBnZXROZXdUZXh0KHRleHQpIHtcbiAgICBjb25zdCBpbm5lclRleHQgPSB0aGlzLmRlbGV0ZVN1cnJvdW5kKHRleHQpXG4gICAgcmV0dXJuIHRoaXMuc3Vycm91bmQoaW5uZXJUZXh0LCB0aGlzLmlucHV0LCB7a2VlcExheW91dDogdHJ1ZX0pXG4gIH1cbn1cbkNoYW5nZVN1cnJvdW5kLnJlZ2lzdGVyKClcblxuY2xhc3MgQ2hhbmdlU3Vycm91bmRBbnlQYWlyIGV4dGVuZHMgQ2hhbmdlU3Vycm91bmQge1xuICB0YXJnZXQgPSBcIkFBbnlQYWlyXCJcbn1cbkNoYW5nZVN1cnJvdW5kQW55UGFpci5yZWdpc3RlcigpXG5cbmNsYXNzIENoYW5nZVN1cnJvdW5kQW55UGFpckFsbG93Rm9yd2FyZGluZyBleHRlbmRzIENoYW5nZVN1cnJvdW5kQW55UGFpciB7XG4gIHRhcmdldCA9IFwiQUFueVBhaXJBbGxvd0ZvcndhcmRpbmdcIlxufVxuQ2hhbmdlU3Vycm91bmRBbnlQYWlyQWxsb3dGb3J3YXJkaW5nLnJlZ2lzdGVyKClcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gRklYTUVcbi8vIEN1cnJlbnRseSBuYXRpdmUgZWRpdG9yLmpvaW5MaW5lcygpIGlzIGJldHRlciBmb3IgY3Vyc29yIHBvc2l0aW9uIHNldHRpbmdcbi8vIFNvIEkgdXNlIG5hdGl2ZSBtZXRob2RzIGZvciBhIG1lYW53aGlsZS5cbmNsYXNzIEpvaW4gZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmcge1xuICB0YXJnZXQgPSBcIk1vdmVUb1JlbGF0aXZlTGluZVwiXG4gIGZsYXNoVGFyZ2V0ID0gZmFsc2VcbiAgcmVzdG9yZVBvc2l0aW9ucyA9IGZhbHNlXG5cbiAgbXV0YXRlU2VsZWN0aW9uKHNlbGVjdGlvbikge1xuICAgIGNvbnN0IHJhbmdlID0gc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKClcblxuICAgIC8vIFdoZW4gY3Vyc29yIGlzIGF0IGxhc3QgQlVGRkVSIHJvdywgaXQgc2VsZWN0IGxhc3QtYnVmZmVyLXJvdywgdGhlblxuICAgIC8vIGpvaW5uaW5nIHJlc3VsdCBpbiBcImNsZWFyIGxhc3QtYnVmZmVyLXJvdyB0ZXh0XCIuXG4gICAgLy8gSSBiZWxpZXZlIHRoaXMgaXMgQlVHIG9mIHVwc3RyZWFtIGF0b20tY29yZS4gZ3VhcmQgdGhpcyBzaXR1YXRpb24gaGVyZVxuICAgIGlmICghcmFuZ2UuaXNTaW5nbGVMaW5lKCkgfHwgcmFuZ2UuZW5kLnJvdyAhPT0gdGhpcy5lZGl0b3IuZ2V0TGFzdEJ1ZmZlclJvdygpKSB7XG4gICAgICBpZiAodGhpcy51dGlscy5pc0xpbmV3aXNlUmFuZ2UocmFuZ2UpKSB7XG4gICAgICAgIHNlbGVjdGlvbi5zZXRCdWZmZXJSYW5nZShyYW5nZS50cmFuc2xhdGUoWzAsIDBdLCBbLTEsIEluZmluaXR5XSkpXG4gICAgICB9XG4gICAgICBzZWxlY3Rpb24uam9pbkxpbmVzKClcbiAgICB9XG4gICAgY29uc3QgcG9pbnQgPSBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKS5lbmQudHJhbnNsYXRlKFswLCAtMV0pXG4gICAgcmV0dXJuIHNlbGVjdGlvbi5jdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24ocG9pbnQpXG4gIH1cbn1cbkpvaW4ucmVnaXN0ZXIoKVxuXG5jbGFzcyBKb2luQmFzZSBleHRlbmRzIFRyYW5zZm9ybVN0cmluZyB7XG4gIHdpc2UgPSBcImxpbmV3aXNlXCJcbiAgdHJpbSA9IGZhbHNlXG4gIHRhcmdldCA9IFwiTW92ZVRvUmVsYXRpdmVMaW5lTWluaW11bVR3b1wiXG5cbiAgaW5pdGlhbGl6ZSgpIHtcbiAgICBpZiAodGhpcy5yZXF1aXJlSW5wdXQpIHtcbiAgICAgIHRoaXMuZm9jdXNJbnB1dCh7Y2hhcnNNYXg6IDEwfSlcbiAgICB9XG4gICAgc3VwZXIuaW5pdGlhbGl6ZSgpXG4gIH1cblxuICBnZXROZXdUZXh0KHRleHQpIHtcbiAgICBjb25zdCByZWdleCA9IHRoaXMudHJpbSA/IC9cXHI/XFxuWyBcXHRdKi9nIDogL1xccj9cXG4vZ1xuICAgIHJldHVybiB0ZXh0LnRyaW1SaWdodCgpLnJlcGxhY2UocmVnZXgsIHRoaXMuaW5wdXQpICsgXCJcXG5cIlxuICB9XG59XG5Kb2luQmFzZS5yZWdpc3RlcihmYWxzZSlcblxuY2xhc3MgSm9pbldpdGhLZWVwaW5nU3BhY2UgZXh0ZW5kcyBKb2luQmFzZSB7XG4gIGlucHV0ID0gXCJcIlxufVxuSm9pbldpdGhLZWVwaW5nU3BhY2UucmVnaXN0ZXIoKVxuXG5jbGFzcyBKb2luQnlJbnB1dCBleHRlbmRzIEpvaW5CYXNlIHtcbiAgcmVxdWlyZUlucHV0ID0gdHJ1ZVxuICB0cmltID0gdHJ1ZVxufVxuSm9pbkJ5SW5wdXQucmVnaXN0ZXIoKVxuXG5jbGFzcyBKb2luQnlJbnB1dFdpdGhLZWVwaW5nU3BhY2UgZXh0ZW5kcyBKb2luQnlJbnB1dCB7XG4gIHRyaW0gPSBmYWxzZVxufVxuSm9pbkJ5SW5wdXRXaXRoS2VlcGluZ1NwYWNlLnJlZ2lzdGVyKClcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gU3RyaW5nIHN1ZmZpeCBpbiBuYW1lIGlzIHRvIGF2b2lkIGNvbmZ1c2lvbiB3aXRoICdzcGxpdCcgd2luZG93LlxuY2xhc3MgU3BsaXRTdHJpbmcgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmcge1xuICByZXF1aXJlSW5wdXQgPSB0cnVlXG4gIGlucHV0ID0gbnVsbFxuICB0YXJnZXQgPSBcIk1vdmVUb1JlbGF0aXZlTGluZVwiXG4gIGtlZXBTcGxpdHRlciA9IGZhbHNlXG5cbiAgaW5pdGlhbGl6ZSgpIHtcbiAgICB0aGlzLm9uRGlkU2V0VGFyZ2V0KCgpID0+IHtcbiAgICAgIHRoaXMuZm9jdXNJbnB1dCh7Y2hhcnNNYXg6IDEwfSlcbiAgICB9KVxuICAgIHN1cGVyLmluaXRpYWxpemUoKVxuICB9XG5cbiAgZ2V0TmV3VGV4dCh0ZXh0KSB7XG4gICAgY29uc3QgcmVnZXggPSBuZXcgUmVnRXhwKF8uZXNjYXBlUmVnRXhwKHRoaXMuaW5wdXQgfHwgXCJcXFxcblwiKSwgXCJnXCIpXG4gICAgY29uc3QgbGluZVNlcGFyYXRvciA9ICh0aGlzLmtlZXBTcGxpdHRlciA/IHRoaXMuaW5wdXQgOiBcIlwiKSArIFwiXFxuXCJcbiAgICByZXR1cm4gdGV4dC5yZXBsYWNlKHJlZ2V4LCBsaW5lU2VwYXJhdG9yKVxuICB9XG59XG5TcGxpdFN0cmluZy5yZWdpc3RlcigpXG5cbmNsYXNzIFNwbGl0U3RyaW5nV2l0aEtlZXBpbmdTcGxpdHRlciBleHRlbmRzIFNwbGl0U3RyaW5nIHtcbiAga2VlcFNwbGl0dGVyID0gdHJ1ZVxufVxuU3BsaXRTdHJpbmdXaXRoS2VlcGluZ1NwbGl0dGVyLnJlZ2lzdGVyKClcblxuY2xhc3MgU3BsaXRBcmd1bWVudHMgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmcge1xuICBrZWVwU2VwYXJhdG9yID0gdHJ1ZVxuICBhdXRvSW5kZW50QWZ0ZXJJbnNlcnRUZXh0ID0gdHJ1ZVxuXG4gIGdldE5ld1RleHQodGV4dCkge1xuICAgIGNvbnN0IGFsbFRva2VucyA9IHRoaXMudXRpbHMuc3BsaXRBcmd1bWVudHModGV4dC50cmltKCkpXG4gICAgbGV0IG5ld1RleHQgPSBcIlwiXG4gICAgd2hpbGUgKGFsbFRva2Vucy5sZW5ndGgpIHtcbiAgICAgIGNvbnN0IHt0ZXh0LCB0eXBlfSA9IGFsbFRva2Vucy5zaGlmdCgpXG4gICAgICBuZXdUZXh0ICs9IHR5cGUgPT09IFwic2VwYXJhdG9yXCIgPyAodGhpcy5rZWVwU2VwYXJhdG9yID8gdGV4dC50cmltKCkgOiBcIlwiKSArIFwiXFxuXCIgOiB0ZXh0XG4gICAgfVxuICAgIHJldHVybiBgXFxuJHtuZXdUZXh0fVxcbmBcbiAgfVxufVxuU3BsaXRBcmd1bWVudHMucmVnaXN0ZXIoKVxuXG5jbGFzcyBTcGxpdEFyZ3VtZW50c1dpdGhSZW1vdmVTZXBhcmF0b3IgZXh0ZW5kcyBTcGxpdEFyZ3VtZW50cyB7XG4gIGtlZXBTZXBhcmF0b3IgPSBmYWxzZVxufVxuU3BsaXRBcmd1bWVudHNXaXRoUmVtb3ZlU2VwYXJhdG9yLnJlZ2lzdGVyKClcblxuY2xhc3MgU3BsaXRBcmd1bWVudHNPZklubmVyQW55UGFpciBleHRlbmRzIFNwbGl0QXJndW1lbnRzIHtcbiAgdGFyZ2V0ID0gXCJJbm5lckFueVBhaXJcIlxufVxuU3BsaXRBcmd1bWVudHNPZklubmVyQW55UGFpci5yZWdpc3RlcigpXG5cbmNsYXNzIENoYW5nZU9yZGVyIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nIHtcbiAgZ2V0TmV3VGV4dCh0ZXh0KSB7XG4gICAgcmV0dXJuIHRoaXMudGFyZ2V0LmlzTGluZXdpc2UoKVxuICAgICAgPyB0aGlzLmdldE5ld0xpc3QodGhpcy51dGlscy5zcGxpdFRleHRCeU5ld0xpbmUodGV4dCkpLmpvaW4oXCJcXG5cIikgKyBcIlxcblwiXG4gICAgICA6IHRoaXMuc29ydEFyZ3VtZW50c0luVGV4dEJ5KHRleHQsIGFyZ3MgPT4gdGhpcy5nZXROZXdMaXN0KGFyZ3MpKVxuICB9XG5cbiAgc29ydEFyZ3VtZW50c0luVGV4dEJ5KHRleHQsIGZuKSB7XG4gICAgY29uc3Qgc3RhcnQgPSB0ZXh0LnNlYXJjaCgvXFxTLylcbiAgICBjb25zdCBlbmQgPSB0ZXh0LnNlYXJjaCgvXFxzKiQvKVxuICAgIGNvbnN0IGxlYWRpbmdTcGFjZXMgPSBzdGFydCAhPT0gLTEgPyB0ZXh0LnNsaWNlKDAsIHN0YXJ0KSA6IFwiXCJcbiAgICBjb25zdCB0cmFpbGluZ1NwYWNlcyA9IGVuZCAhPT0gLTEgPyB0ZXh0LnNsaWNlKGVuZCkgOiBcIlwiXG4gICAgY29uc3QgYWxsVG9rZW5zID0gdGhpcy51dGlscy5zcGxpdEFyZ3VtZW50cyh0ZXh0LnNsaWNlKHN0YXJ0LCBlbmQpKVxuICAgIGNvbnN0IGFyZ3MgPSBhbGxUb2tlbnMuZmlsdGVyKHRva2VuID0+IHRva2VuLnR5cGUgPT09IFwiYXJndW1lbnRcIikubWFwKHRva2VuID0+IHRva2VuLnRleHQpXG4gICAgY29uc3QgbmV3QXJncyA9IGZuKGFyZ3MpXG5cbiAgICBsZXQgbmV3VGV4dCA9IFwiXCJcbiAgICB3aGlsZSAoYWxsVG9rZW5zLmxlbmd0aCkge1xuICAgICAgY29uc3QgdG9rZW4gPSBhbGxUb2tlbnMuc2hpZnQoKVxuICAgICAgLy8gdG9rZW4udHlwZSBpcyBcInNlcGFyYXRvclwiIG9yIFwiYXJndW1lbnRcIlxuICAgICAgbmV3VGV4dCArPSB0b2tlbi50eXBlID09PSBcInNlcGFyYXRvclwiID8gdG9rZW4udGV4dCA6IG5ld0FyZ3Muc2hpZnQoKVxuICAgIH1cbiAgICByZXR1cm4gbGVhZGluZ1NwYWNlcyArIG5ld1RleHQgKyB0cmFpbGluZ1NwYWNlc1xuICB9XG59XG5DaGFuZ2VPcmRlci5yZWdpc3RlcihmYWxzZSlcblxuY2xhc3MgUmV2ZXJzZSBleHRlbmRzIENoYW5nZU9yZGVyIHtcbiAgZ2V0TmV3TGlzdChyb3dzKSB7XG4gICAgcmV0dXJuIHJvd3MucmV2ZXJzZSgpXG4gIH1cbn1cblJldmVyc2UucmVnaXN0ZXIoKVxuXG5jbGFzcyBSZXZlcnNlSW5uZXJBbnlQYWlyIGV4dGVuZHMgUmV2ZXJzZSB7XG4gIHRhcmdldCA9IFwiSW5uZXJBbnlQYWlyXCJcbn1cblJldmVyc2VJbm5lckFueVBhaXIucmVnaXN0ZXIoKVxuXG5jbGFzcyBSb3RhdGUgZXh0ZW5kcyBDaGFuZ2VPcmRlciB7XG4gIGJhY2t3YXJkcyA9IGZhbHNlXG4gIGdldE5ld0xpc3Qocm93cykge1xuICAgIGlmICh0aGlzLmJhY2t3YXJkcykgcm93cy5wdXNoKHJvd3Muc2hpZnQoKSlcbiAgICBlbHNlIHJvd3MudW5zaGlmdChyb3dzLnBvcCgpKVxuICAgIHJldHVybiByb3dzXG4gIH1cbn1cblJvdGF0ZS5yZWdpc3RlcigpXG5cbmNsYXNzIFJvdGF0ZUJhY2t3YXJkcyBleHRlbmRzIENoYW5nZU9yZGVyIHtcbiAgYmFja3dhcmRzID0gdHJ1ZVxufVxuUm90YXRlQmFja3dhcmRzLnJlZ2lzdGVyKClcblxuY2xhc3MgUm90YXRlQXJndW1lbnRzT2ZJbm5lclBhaXIgZXh0ZW5kcyBSb3RhdGUge1xuICB0YXJnZXQgPSBcIklubmVyQW55UGFpclwiXG59XG5Sb3RhdGVBcmd1bWVudHNPZklubmVyUGFpci5yZWdpc3RlcigpXG5cbmNsYXNzIFJvdGF0ZUFyZ3VtZW50c0JhY2t3YXJkc09mSW5uZXJQYWlyIGV4dGVuZHMgUm90YXRlQXJndW1lbnRzT2ZJbm5lclBhaXIge1xuICBiYWNrd2FyZHMgPSB0cnVlXG59XG5Sb3RhdGVBcmd1bWVudHNCYWNrd2FyZHNPZklubmVyUGFpci5yZWdpc3RlcigpXG5cbmNsYXNzIFNvcnQgZXh0ZW5kcyBDaGFuZ2VPcmRlciB7XG4gIGdldE5ld0xpc3Qocm93cykge1xuICAgIHJldHVybiByb3dzLnNvcnQoKVxuICB9XG59XG5Tb3J0LnJlZ2lzdGVyKClcblxuY2xhc3MgU29ydENhc2VJbnNlbnNpdGl2ZWx5IGV4dGVuZHMgQ2hhbmdlT3JkZXIge1xuICBnZXROZXdMaXN0KHJvd3MpIHtcbiAgICByZXR1cm4gcm93cy5zb3J0KChyb3dBLCByb3dCKSA9PiByb3dBLmxvY2FsZUNvbXBhcmUocm93Qiwge3NlbnNpdGl2aXR5OiBcImJhc2VcIn0pKVxuICB9XG59XG5Tb3J0Q2FzZUluc2Vuc2l0aXZlbHkucmVnaXN0ZXIoKVxuXG5jbGFzcyBTb3J0QnlOdW1iZXIgZXh0ZW5kcyBDaGFuZ2VPcmRlciB7XG4gIGdldE5ld0xpc3Qocm93cykge1xuICAgIHJldHVybiBfLnNvcnRCeShyb3dzLCByb3cgPT4gTnVtYmVyLnBhcnNlSW50KHJvdykgfHwgSW5maW5pdHkpXG4gIH1cbn1cblNvcnRCeU51bWJlci5yZWdpc3RlcigpXG5cbmNsYXNzIE51bWJlcmluZ0xpbmVzIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nIHtcbiAgd2lzZSA9IFwibGluZXdpc2VcIlxuXG4gIGdldE5ld1RleHQodGV4dCkge1xuICAgIGNvbnN0IHJvd3MgPSB0aGlzLnV0aWxzLnNwbGl0VGV4dEJ5TmV3TGluZSh0ZXh0KVxuICAgIGNvbnN0IGxhc3RSb3dXaWR0aCA9IFN0cmluZyhyb3dzLmxlbmd0aCkubGVuZ3RoXG5cbiAgICBjb25zdCBuZXdSb3dzID0gcm93cy5tYXAoKHJvd1RleHQsIGkpID0+IHtcbiAgICAgIGkrKyAvLyBmaXggMCBzdGFydCBpbmRleCB0byAxIHN0YXJ0LlxuICAgICAgY29uc3QgYW1vdW50T2ZQYWRkaW5nID0gdGhpcy51dGlscy5saW1pdE51bWJlcihsYXN0Um93V2lkdGggLSBTdHJpbmcoaSkubGVuZ3RoLCB7bWluOiAwfSlcbiAgICAgIHJldHVybiBcIiBcIi5yZXBlYXQoYW1vdW50T2ZQYWRkaW5nKSArIGkgKyBcIjogXCIgKyByb3dUZXh0XG4gICAgfSlcbiAgICByZXR1cm4gbmV3Um93cy5qb2luKFwiXFxuXCIpICsgXCJcXG5cIlxuICB9XG59XG5OdW1iZXJpbmdMaW5lcy5yZWdpc3RlcigpXG5cbi8vIHByZXR0aWVyLWlnbm9yZVxuY29uc3QgY2xhc3Nlc1RvUmVnaXN0ZXJUb1NlbGVjdExpc3QgPSBbXG4gIFRvZ2dsZUNhc2UsIFVwcGVyQ2FzZSwgTG93ZXJDYXNlLFxuICBSZXBsYWNlLCBTcGxpdEJ5Q2hhcmFjdGVyLFxuICBDYW1lbENhc2UsIFNuYWtlQ2FzZSwgUGFzY2FsQ2FzZSwgRGFzaENhc2UsIFRpdGxlQ2FzZSxcbiAgRW5jb2RlVXJpQ29tcG9uZW50LCBEZWNvZGVVcmlDb21wb25lbnQsXG4gIFRyaW1TdHJpbmcsIENvbXBhY3RTcGFjZXMsIFJlbW92ZUxlYWRpbmdXaGl0ZVNwYWNlcyxcbiAgQWxpZ25PY2N1cnJlbmNlLCBBbGlnbk9jY3VycmVuY2VCeVBhZExlZnQsIEFsaWduT2NjdXJyZW5jZUJ5UGFkUmlnaHQsXG4gIENvbnZlcnRUb1NvZnRUYWIsIENvbnZlcnRUb0hhcmRUYWIsXG4gIEpvaW5XaXRoS2VlcGluZ1NwYWNlLCBKb2luQnlJbnB1dCwgSm9pbkJ5SW5wdXRXaXRoS2VlcGluZ1NwYWNlLFxuICBTcGxpdFN0cmluZywgU3BsaXRTdHJpbmdXaXRoS2VlcGluZ1NwbGl0dGVyLFxuICBTcGxpdEFyZ3VtZW50cywgU3BsaXRBcmd1bWVudHNXaXRoUmVtb3ZlU2VwYXJhdG9yLCBTcGxpdEFyZ3VtZW50c09mSW5uZXJBbnlQYWlyLFxuICBSZXZlcnNlLCBSb3RhdGUsIFJvdGF0ZUJhY2t3YXJkcywgU29ydCwgU29ydENhc2VJbnNlbnNpdGl2ZWx5LCBTb3J0QnlOdW1iZXIsXG4gIE51bWJlcmluZ0xpbmVzLFxuXVxuZm9yIChjb25zdCBrbGFzcyBvZiBjbGFzc2VzVG9SZWdpc3RlclRvU2VsZWN0TGlzdCkge1xuICBrbGFzcy5yZWdpc3RlclRvU2VsZWN0TGlzdCgpXG59XG4iXX0=