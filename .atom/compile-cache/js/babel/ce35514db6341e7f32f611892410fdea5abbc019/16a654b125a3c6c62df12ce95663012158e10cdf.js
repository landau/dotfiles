"use babel";

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, "next"); var callThrow = step.bind(null, "throw"); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

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
    this.autoIndentNewline = true;
    this.readInputAfterExecute = true;
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
      var _this3 = this;

      return this.scanForward(/\t/g, { scanRange: selection.getBufferRange() }, function (_ref) {
        var range = _ref.range;
        var replace = _ref.replace;

        // Replace \t to spaces which length is vary depending on tabStop and tabLenght
        // So we directly consult it's screen representing length.
        var length = _this3.editor.screenRangeForBufferRange(range).getExtent().column;
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
      var _this4 = this;

      var tabLength = this.editor.getTabLength();
      this.scanForward(/[ \t]+/g, { scanRange: selection.getBufferRange() }, function (_ref2) {
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
  }

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
      this.normalizeSelectionsIfNecessary();
      this.createBufferCheckpoint("undo");

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
        this.groupChangesSinceBufferCheckpoint("undo");
      }
      this.emitDidFinishMutation();
      this.activateMode("normal");
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

var ReplaceOccurrenceWithRegister = (function (_ReplaceWithRegister) {
  _inherits(ReplaceOccurrenceWithRegister, _ReplaceWithRegister);

  function ReplaceOccurrenceWithRegister() {
    _classCallCheck(this, ReplaceOccurrenceWithRegister);

    _get(Object.getPrototypeOf(ReplaceOccurrenceWithRegister.prototype), "constructor", this).apply(this, arguments);

    this.occurrence = true;
  }

  return ReplaceOccurrenceWithRegister;
})(ReplaceWithRegister);

ReplaceOccurrenceWithRegister.register();

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
      var _this7 = this;

      // Need count times indentation in visual-mode and its repeat(`.`).
      if (this.target.name === "CurrentSelection") {
        (function () {
          var oldText = undefined;
          // limit to 100 to avoid freezing by accidental big number.
          var count = _this7.utils.limitNumber(_this7.getCount(), { max: 100 });
          _this7.countTimes(count, function (_ref5) {
            var stop = _ref5.stop;

            oldText = selection.getText();
            _this7.indent(selection);
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
  }]);

  return SurroundBase;
})(TransformString);

SurroundBase.register(false);

var Surround = (function (_SurroundBase) {
  _inherits(Surround, _SurroundBase);

  function Surround() {
    _classCallCheck(this, Surround);

    _get(Object.getPrototypeOf(Surround.prototype), "constructor", this).apply(this, arguments);

    this.surroundAction = "surround";
    this.readInputAfterExecute = true;
  }

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

    this.surroundAction = "delete-surround";
  }

  _createClass(DeleteSurround, [{
    key: "initialize",
    value: function initialize() {
      var _this8 = this;

      if (!this.target) {
        this.focusInput({
          onConfirm: function onConfirm(char) {
            _this8.setTarget(_this8.getInstance("APair", { pair: _this8.getPair(char) }));
            _this8.processOperation();
          }
        });
      }
      _get(Object.getPrototypeOf(DeleteSurround.prototype), "initialize", this).call(this);
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

var ChangeSurround = (function (_DeleteSurround2) {
  _inherits(ChangeSurround, _DeleteSurround2);

  function ChangeSurround() {
    _classCallCheck(this, ChangeSurround);

    _get(Object.getPrototypeOf(ChangeSurround.prototype), "constructor", this).apply(this, arguments);

    this.surroundAction = "change-surround";
    this.readInputAfterExecute = true;
  }

  _createClass(ChangeSurround, [{
    key: "focusInputPromisified",

    // Override to show changing char on hover
    value: _asyncToGenerator(function* () {
      var hoverPoint = this.mutationManager.getInitialPointForSelection(this.editor.getLastSelection());
      this.vimState.hover.set(this.editor.getSelectedText()[0], hoverPoint);

      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return _get(Object.getPrototypeOf(ChangeSurround.prototype), "focusInputPromisified", this).apply(this, args);
    })
  }]);

  return ChangeSurround;
})(DeleteSurround);

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

var JoinTarget = (function (_TransformString27) {
  _inherits(JoinTarget, _TransformString27);

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

JoinTarget.register();

var Join = (function (_JoinTarget) {
  _inherits(Join, _JoinTarget);

  function Join() {
    _classCallCheck(this, Join);

    _get(Object.getPrototypeOf(Join.prototype), "constructor", this).apply(this, arguments);

    this.target = "MoveToRelativeLine";
  }

  return Join;
})(JoinTarget);

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

    this.readInputAfterExecute = true;
    this.focusInputOptions = { charsMax: 10 };
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

    this.target = "MoveToRelativeLine";
    this.keepSplitter = false;
    this.readInputAfterExecute = true;
    this.focusInputOptions = { charsMax: 10 };
  }

  _createClass(SplitString, [{
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
      var _this9 = this;

      return this.target.isLinewise() ? this.getNewList(this.utils.splitTextByNewLine(text)).join("\n") + "\n" : this.sortArgumentsInTextBy(text, function (args) {
        return _this9.getNewList(args);
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
      var _this10 = this;

      var rows = this.utils.splitTextByNewLine(text);
      var lastRowWidth = String(rows.length).length;

      var newRows = rows.map(function (rowText, i) {
        i++; // fix 0 start index to 1 start.
        var amountOfPadding = _this10.utils.limitNumber(lastRowWidth - String(i).length, { min: 0 });
        return " ".repeat(amountOfPadding) + i + ": " + rowText;
      });
      return newRows.join("\n") + "\n";
    }
  }]);

  return NumberingLines;
})(TransformString);

NumberingLines.register();

var DuplicateWithCommentOutOriginal = (function (_TransformString33) {
  _inherits(DuplicateWithCommentOutOriginal, _TransformString33);

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

DuplicateWithCommentOutOriginal.register();

// prettier-ignore
var classesToRegisterToSelectList = [ToggleCase, UpperCase, LowerCase, Replace, SplitByCharacter, CamelCase, SnakeCase, PascalCase, DashCase, TitleCase, EncodeUriComponent, DecodeUriComponent, TrimString, CompactSpaces, RemoveLeadingWhiteSpaces, AlignOccurrence, AlignOccurrenceByPadLeft, AlignOccurrenceByPadRight, ConvertToSoftTab, ConvertToHardTab, JoinTarget, Join, JoinWithKeepingSpace, JoinByInput, JoinByInputWithKeepingSpace, SplitString, SplitStringWithKeepingSplitter, SplitArguments, SplitArgumentsWithRemoveSeparator, SplitArgumentsOfInnerAnyPair, Reverse, Rotate, RotateBackwards, Sort, SortCaseInsensitively, SortByNumber, NumberingLines, DuplicateWithCommentOutOriginal];

for (var klass of classesToRegisterToSelectList) {
  klass.registerToSelectList();
}
// e.g. command: 'sort'
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL29wZXJhdG9yLXRyYW5zZm9ybS1zdHJpbmcuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsV0FBVyxDQUFBOzs7Ozs7Ozs7Ozs7Ozs7O0FBRVgsSUFBTSxDQUFDLEdBQUcsT0FBTyxDQUFDLGlCQUFpQixDQUFDLENBQUE7O2VBQ0gsT0FBTyxDQUFDLE1BQU0sQ0FBQzs7SUFBekMsZUFBZSxZQUFmLGVBQWU7SUFBRSxLQUFLLFlBQUwsS0FBSzs7QUFFN0IsSUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFBO0FBQzlCLElBQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUE7Ozs7O0lBSXBDLGVBQWU7WUFBZixlQUFlOztXQUFmLGVBQWU7MEJBQWYsZUFBZTs7K0JBQWYsZUFBZTs7U0FFbkIsV0FBVyxHQUFHLElBQUk7U0FDbEIsY0FBYyxHQUFHLHVCQUF1QjtTQUN4QyxVQUFVLEdBQUcsS0FBSztTQUNsQixpQkFBaUIsR0FBRyxLQUFLO1NBQ3pCLHlCQUF5QixHQUFHLEtBQUs7OztlQU43QixlQUFlOztXQVlKLHlCQUFDLFNBQVMsRUFBRTtBQUN6QixVQUFNLElBQUksR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxTQUFTLENBQUMsQ0FBQTtBQUM1RCxVQUFJLElBQUksRUFBRTtBQUNSLFlBQUksbUJBQW1CLFlBQUEsQ0FBQTtBQUN2QixZQUFJLElBQUksQ0FBQyx5QkFBeUIsRUFBRTtBQUNsQyxjQUFNLFFBQVEsR0FBRyxTQUFTLENBQUMsY0FBYyxFQUFFLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQTtBQUNyRCw2QkFBbUIsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLHVCQUF1QixDQUFDLFFBQVEsQ0FBQyxDQUFBO1NBQ3BFO0FBQ0QsWUFBSSxL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Q0FBQTs7QUFFRCxLQUFLLElBQU0sS0FBSyxJQUFJLDZCQUE2QixFQUFFO0FBQ2pELE9BQUssQ0FBQyxvQkFBb0IsRUFBRSxDQUFBO0NBQzdCIiwiZmlsZSI6Ii9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL29wZXJhdG9yLXRyYW5zZm9ybS1zdHJpbmcuanMiLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBiYWJlbFwiXG5cbmNvbnN0IF8gPSByZXF1aXJlKFwidW5kZXJzY29yZS1wbHVzXCIpXG5jb25zdCB7QnVmZmVyZWRQcm9jZXNzLCBSYW5nZX0gPSByZXF1aXJlKFwiYXRvbVwiKVxuXG5jb25zdCBCYXNlID0gcmVxdWlyZShcIi4vYmFzZVwiKVxuY29uc3QgT3BlcmF0b3IgPSBCYXNlLmdldENsYXNzKFwiT3BlcmF0b3JcIilcblxuLy8gVHJhbnNmb3JtU3RyaW5nXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuY2xhc3MgVHJhbnNmb3JtU3RyaW5nIGV4dGVuZHMgT3BlcmF0b3Ige1xuICBzdGF0aWMgc3RyaW5nVHJhbnNmb3JtZXJzID0gW11cbiAgdHJhY2tDaGFuZ2UgPSB0cnVlXG4gIHN0YXlPcHRpb25OYW1lID0gXCJzdGF5T25UcmFuc2Zvcm1TdHJpbmdcIlxuICBhdXRvSW5kZW50ID0gZmFsc2VcbiAgYXV0b0luZGVudE5ld2xpbmUgPSBmYWxzZVxuICBhdXRvSW5kZW50QWZ0ZXJJbnNlcnRUZXh0ID0gZmFsc2VcblxuICBzdGF0aWMgcmVnaXN0ZXJUb1NlbGVjdExpc3QoKSB7XG4gICAgdGhpcy5zdHJpbmdUcmFuc2Zvcm1lcnMucHVzaCh0aGlzKVxuICB9XG5cbiAgbXV0YXRlU2VsZWN0aW9uKHNlbGVjdGlvbikge1xuICAgIGNvbnN0IHRleHQgPSB0aGlzLmdldE5ld1RleHQoc2VsZWN0aW9uLmdldFRleHQoKSwgc2VsZWN0aW9uKVxuICAgIGlmICh0ZXh0KSB7XG4gICAgICBsZXQgc3RhcnRSb3dJbmRlbnRMZXZlbFxuICAgICAgaWYgKHRoaXMuYXV0b0luZGVudEFmdGVySW5zZXJ0VGV4dCkge1xuICAgICAgICBjb25zdCBzdGFydFJvdyA9IHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpLnN0YXJ0LnJvd1xuICAgICAgICBzdGFydFJvd0luZGVudExldmVsID0gdGhpcy5lZGl0b3IuaW5kZW50YXRpb25Gb3JCdWZmZXJSb3coc3RhcnRSb3cpXG4gICAgICB9XG4gICAgICBsZXQgcmFuZ2UgPSBzZWxlY3Rpb24uaW5zZXJ0VGV4dCh0ZXh0LCB7YXV0b0luZGVudDogdGhpcy5hdXRvSW5kZW50LCBhdXRvSW5kZW50TmV3bGluZTogdGhpcy5hdXRvSW5kZW50TmV3bGluZX0pXG5cbiAgICAgIGlmICh0aGlzLmF1dG9JbmRlbnRBZnRlckluc2VydFRleHQpIHtcbiAgICAgICAgLy8gQ3VycmVudGx5IHVzZWQgYnkgU3BsaXRBcmd1bWVudHMgYW5kIFN1cnJvdW5kKCBsaW5ld2lzZSB0YXJnZXQgb25seSApXG4gICAgICAgIGlmICh0aGlzLnRhcmdldC5pc0xpbmV3aXNlKCkpIHtcbiAgICAgICAgICByYW5nZSA9IHJhbmdlLnRyYW5zbGF0ZShbMCwgMF0sIFstMSwgMF0pXG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5lZGl0b3Iuc2V0SW5kZW50YXRpb25Gb3JCdWZmZXJSb3cocmFuZ2Uuc3RhcnQucm93LCBzdGFydFJvd0luZGVudExldmVsKVxuICAgICAgICB0aGlzLmVkaXRvci5zZXRJbmRlbnRhdGlvbkZvckJ1ZmZlclJvdyhyYW5nZS5lbmQucm93LCBzdGFydFJvd0luZGVudExldmVsKVxuICAgICAgICAvLyBBZGp1c3QgaW5uZXIgcmFuZ2UsIGVuZC5yb3cgaXMgYWxyZWFkeSggaWYgbmVlZGVkICkgdHJhbnNsYXRlZCBzbyBubyBuZWVkIHRvIHJlLXRyYW5zbGF0ZS5cbiAgICAgICAgdGhpcy51dGlscy5hZGp1c3RJbmRlbnRXaXRoS2VlcGluZ0xheW91dCh0aGlzLmVkaXRvciwgcmFuZ2UudHJhbnNsYXRlKFsxLCAwXSwgWzAsIDBdKSlcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblRyYW5zZm9ybVN0cmluZy5yZWdpc3RlcihmYWxzZSlcblxuY2xhc3MgVG9nZ2xlQ2FzZSBleHRlbmRzIFRyYW5zZm9ybVN0cmluZyB7XG4gIHN0YXRpYyBkaXNwbGF5TmFtZSA9IFwiVG9nZ2xlIH5cIlxuXG4gIGdldE5ld1RleHQodGV4dCkge1xuICAgIHJldHVybiB0ZXh0LnJlcGxhY2UoLy4vZywgdGhpcy51dGlscy50b2dnbGVDYXNlRm9yQ2hhcmFjdGVyKVxuICB9XG59XG5Ub2dnbGVDYXNlLnJlZ2lzdGVyKClcblxuY2xhc3MgVG9nZ2xlQ2FzZUFuZE1vdmVSaWdodCBleHRlbmRzIFRvZ2dsZUNhc2Uge1xuICBmbGFzaFRhcmdldCA9IGZhbHNlXG4gIHJlc3RvcmVQb3NpdGlvbnMgPSBmYWxzZVxuICB0YXJnZXQgPSBcIk1vdmVSaWdodFwiXG59XG5Ub2dnbGVDYXNlQW5kTW92ZVJpZ2h0LnJlZ2lzdGVyKClcblxuY2xhc3MgVXBwZXJDYXNlIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nIHtcbiAgc3RhdGljIGRpc3BsYXlOYW1lID0gXCJVcHBlclwiXG5cbiAgZ2V0TmV3VGV4dCh0ZXh0KSB7XG4gICAgcmV0dXJuIHRleHQudG9VcHBlckNhc2UoKVxuICB9XG59XG5VcHBlckNhc2UucmVnaXN0ZXIoKVxuXG5jbGFzcyBMb3dlckNhc2UgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmcge1xuICBzdGF0aWMgZGlzcGxheU5hbWUgPSBcIkxvd2VyXCJcblxuICBnZXROZXdUZXh0KHRleHQpIHtcbiAgICByZXR1cm4gdGV4dC50b0xvd2VyQ2FzZSgpXG4gIH1cbn1cbkxvd2VyQ2FzZS5yZWdpc3RlcigpXG5cbi8vIFJlcGxhY2Vcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIFJlcGxhY2UgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmcge1xuICBmbGFzaENoZWNrcG9pbnQgPSBcImRpZC1zZWxlY3Qtb2NjdXJyZW5jZVwiXG4gIGF1dG9JbmRlbnROZXdsaW5lID0gdHJ1ZVxuICByZWFkSW5wdXRBZnRlckV4ZWN1dGUgPSB0cnVlXG5cbiAgZ2V0TmV3VGV4dCh0ZXh0KSB7XG4gICAgaWYgKHRoaXMudGFyZ2V0Lm5hbWUgPT09IFwiTW92ZVJpZ2h0QnVmZmVyQ29sdW1uXCIgJiYgdGV4dC5sZW5ndGggIT09IHRoaXMuZ2V0Q291bnQoKSkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgY29uc3QgaW5wdXQgPSB0aGlzLmlucHV0IHx8IFwiXFxuXCJcbiAgICBpZiAoaW5wdXQgPT09IFwiXFxuXCIpIHtcbiAgICAgIHRoaXMucmVzdG9yZVBvc2l0aW9ucyA9IGZhbHNlXG4gICAgfVxuICAgIHJldHVybiB0ZXh0LnJlcGxhY2UoLy4vZywgaW5wdXQpXG4gIH1cbn1cblJlcGxhY2UucmVnaXN0ZXIoKVxuXG5jbGFzcyBSZXBsYWNlQ2hhcmFjdGVyIGV4dGVuZHMgUmVwbGFjZSB7XG4gIHRhcmdldCA9IFwiTW92ZVJpZ2h0QnVmZmVyQ29sdW1uXCJcbn1cblJlcGxhY2VDaGFyYWN0ZXIucmVnaXN0ZXIoKVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBEVVAgbWVhbmluZyB3aXRoIFNwbGl0U3RyaW5nIG5lZWQgY29uc29saWRhdGUuXG5jbGFzcyBTcGxpdEJ5Q2hhcmFjdGVyIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nIHtcbiAgZ2V0TmV3VGV4dCh0ZXh0KSB7XG4gICAgcmV0dXJuIHRleHQuc3BsaXQoXCJcIikuam9pbihcIiBcIilcbiAgfVxufVxuU3BsaXRCeUNoYXJhY3Rlci5yZWdpc3RlcigpXG5cbmNsYXNzIENhbWVsQ2FzZSBleHRlbmRzIFRyYW5zZm9ybVN0cmluZyB7XG4gIHN0YXRpYyBkaXNwbGF5TmFtZSA9IFwiQ2FtZWxpemVcIlxuICBnZXROZXdUZXh0KHRleHQpIHtcbiAgICByZXR1cm4gXy5jYW1lbGl6ZSh0ZXh0KVxuICB9XG59XG5DYW1lbENhc2UucmVnaXN0ZXIoKVxuXG5jbGFzcyBTbmFrZUNhc2UgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmcge1xuICBzdGF0aWMgZGlzcGxheU5hbWUgPSBcIlVuZGVyc2NvcmUgX1wiXG4gIGdldE5ld1RleHQodGV4dCkge1xuICAgIHJldHVybiBfLnVuZGVyc2NvcmUodGV4dClcbiAgfVxufVxuU25ha2VDYXNlLnJlZ2lzdGVyKClcblxuY2xhc3MgUGFzY2FsQ2FzZSBleHRlbmRzIFRyYW5zZm9ybVN0cmluZyB7XG4gIHN0YXRpYyBkaXNwbGF5TmFtZSA9IFwiUGFzY2FsaXplXCJcbiAgZ2V0TmV3VGV4dCh0ZXh0KSB7XG4gICAgcmV0dXJuIF8uY2FwaXRhbGl6ZShfLmNhbWVsaXplKHRleHQpKVxuICB9XG59XG5QYXNjYWxDYXNlLnJlZ2lzdGVyKClcblxuY2xhc3MgRGFzaENhc2UgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmcge1xuICBzdGF0aWMgZGlzcGxheU5hbWUgPSBcIkRhc2hlcml6ZSAtXCJcbiAgZ2V0TmV3VGV4dCh0ZXh0KSB7XG4gICAgcmV0dXJuIF8uZGFzaGVyaXplKHRleHQpXG4gIH1cbn1cbkRhc2hDYXNlLnJlZ2lzdGVyKClcblxuY2xhc3MgVGl0bGVDYXNlIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nIHtcbiAgc3RhdGljIGRpc3BsYXlOYW1lID0gXCJUaXRsaXplXCJcbiAgZ2V0TmV3VGV4dCh0ZXh0KSB7XG4gICAgcmV0dXJuIF8uaHVtYW5pemVFdmVudE5hbWUoXy5kYXNoZXJpemUodGV4dCkpXG4gIH1cbn1cblRpdGxlQ2FzZS5yZWdpc3RlcigpXG5cbmNsYXNzIEVuY29kZVVyaUNvbXBvbmVudCBleHRlbmRzIFRyYW5zZm9ybVN0cmluZyB7XG4gIHN0YXRpYyBkaXNwbGF5TmFtZSA9IFwiRW5jb2RlIFVSSSBDb21wb25lbnQgJVwiXG4gIGdldE5ld1RleHQodGV4dCkge1xuICAgIHJldHVybiBlbmNvZGVVUklDb21wb25lbnQodGV4dClcbiAgfVxufVxuRW5jb2RlVXJpQ29tcG9uZW50LnJlZ2lzdGVyKClcblxuY2xhc3MgRGVjb2RlVXJpQ29tcG9uZW50IGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nIHtcbiAgc3RhdGljIGRpc3BsYXlOYW1lID0gXCJEZWNvZGUgVVJJIENvbXBvbmVudCAlJVwiXG4gIGdldE5ld1RleHQodGV4dCkge1xuICAgIHJldHVybiBkZWNvZGVVUklDb21wb25lbnQodGV4dClcbiAgfVxufVxuRGVjb2RlVXJpQ29tcG9uZW50LnJlZ2lzdGVyKClcblxuY2xhc3MgVHJpbVN0cmluZyBleHRlbmRzIFRyYW5zZm9ybVN0cmluZyB7XG4gIHN0YXRpYyBkaXNwbGF5TmFtZSA9IFwiVHJpbSBzdHJpbmdcIlxuICBnZXROZXdUZXh0KHRleHQpIHtcbiAgICByZXR1cm4gdGV4dC50cmltKClcbiAgfVxufVxuVHJpbVN0cmluZy5yZWdpc3RlcigpXG5cbmNsYXNzIENvbXBhY3RTcGFjZXMgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmcge1xuICBzdGF0aWMgZGlzcGxheU5hbWUgPSBcIkNvbXBhY3Qgc3BhY2VcIlxuICBnZXROZXdUZXh0KHRleHQpIHtcbiAgICBpZiAodGV4dC5tYXRjaCgvXlsgXSskLykpIHtcbiAgICAgIHJldHVybiBcIiBcIlxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBEb24ndCBjb21wYWN0IGZvciBsZWFkaW5nIGFuZCB0cmFpbGluZyB3aGl0ZSBzcGFjZXMuXG4gICAgICBjb25zdCByZWdleCA9IC9eKFxccyopKC4qPykoXFxzKikkL2dtXG4gICAgICByZXR1cm4gdGV4dC5yZXBsYWNlKHJlZ2V4LCAobSwgbGVhZGluZywgbWlkZGxlLCB0cmFpbGluZykgPT4ge1xuICAgICAgICByZXR1cm4gbGVhZGluZyArIG1pZGRsZS5zcGxpdCgvWyBcXHRdKy8pLmpvaW4oXCIgXCIpICsgdHJhaWxpbmdcbiAgICAgIH0pXG4gICAgfVxuICB9XG59XG5Db21wYWN0U3BhY2VzLnJlZ2lzdGVyKClcblxuY2xhc3MgQWxpZ25PY2N1cnJlbmNlIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nIHtcbiAgb2NjdXJyZW5jZSA9IHRydWVcbiAgd2hpY2hUb1BhZCA9IFwiYXV0b1wiXG5cbiAgZ2V0U2VsZWN0aW9uVGFrZXIoKSB7XG4gICAgY29uc3Qgc2VsZWN0aW9uc0J5Um93ID0gXy5ncm91cEJ5KFxuICAgICAgdGhpcy5lZGl0b3IuZ2V0U2VsZWN0aW9uc09yZGVyZWRCeUJ1ZmZlclBvc2l0aW9uKCksXG4gICAgICBzZWxlY3Rpb24gPT4gc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKCkuc3RhcnQucm93XG4gICAgKVxuXG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIGNvbnN0IHJvd3MgPSBPYmplY3Qua2V5cyhzZWxlY3Rpb25zQnlSb3cpXG4gICAgICBjb25zdCBzZWxlY3Rpb25zID0gcm93cy5tYXAocm93ID0+IHNlbGVjdGlvbnNCeVJvd1tyb3ddLnNoaWZ0KCkpLmZpbHRlcihzID0+IHMpXG4gICAgICByZXR1cm4gc2VsZWN0aW9uc1xuICAgIH1cbiAgfVxuXG4gIGdldFdpY2hUb1BhZEZvclRleHQodGV4dCkge1xuICAgIGlmICh0aGlzLndoaWNoVG9QYWQgIT09IFwiYXV0b1wiKSByZXR1cm4gdGhpcy53aGljaFRvUGFkXG5cbiAgICBpZiAoL15cXHMqWz1cXHxdXFxzKiQvLnRlc3QodGV4dCkpIHtcbiAgICAgIC8vIEFzaWdubWVudCg9KSBhbmQgYHxgKG1hcmtkb3duLXRhYmxlIHNlcGFyYXRvcilcbiAgICAgIHJldHVybiBcInN0YXJ0XCJcbiAgICB9IGVsc2UgaWYgKC9eXFxzKixcXHMqJC8udGVzdCh0ZXh0KSkge1xuICAgICAgLy8gQXJndW1lbnRzXG4gICAgICByZXR1cm4gXCJlbmRcIlxuICAgIH0gZWxzZSBpZiAoL1xcVyQvLnRlc3QodGV4dCkpIHtcbiAgICAgIC8vIGVuZHMgd2l0aCBub24td29yZC1jaGFyXG4gICAgICByZXR1cm4gXCJlbmRcIlxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gXCJzdGFydFwiXG4gICAgfVxuICB9XG5cbiAgY2FsY3VsYXRlUGFkZGluZygpIHtcbiAgICBjb25zdCB0b3RhbEFtb3VudE9mUGFkZGluZ0J5Um93ID0ge31cbiAgICBjb25zdCBjb2x1bW5Gb3JTZWxlY3Rpb24gPSBzZWxlY3Rpb24gPT4ge1xuICAgICAgY29uc3Qgd2hpY2ggPSB0aGlzLmdldFdpY2hUb1BhZEZvclRleHQoc2VsZWN0aW9uLmdldFRleHQoKSlcbiAgICAgIGNvbnN0IHBvaW50ID0gc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKClbd2hpY2hdXG4gICAgICByZXR1cm4gcG9pbnQuY29sdW1uICsgKHRvdGFsQW1vdW50T2ZQYWRkaW5nQnlSb3dbcG9pbnQucm93XSB8fCAwKVxuICAgIH1cblxuICAgIGNvbnN0IHRha2VTZWxlY3Rpb25zID0gdGhpcy5nZXRTZWxlY3Rpb25UYWtlcigpXG4gICAgd2hpbGUgKHRydWUpIHtcbiAgICAgIGNvbnN0IHNlbGVjdGlvbnMgPSB0YWtlU2VsZWN0aW9ucygpXG4gICAgICBpZiAoIXNlbGVjdGlvbnMubGVuZ3RoKSByZXR1cm5cbiAgICAgIGNvbnN0IG1heENvbHVtbiA9IHNlbGVjdGlvbnMubWFwKGNvbHVtbkZvclNlbGVjdGlvbikucmVkdWNlKChtYXgsIGN1cikgPT4gKGN1ciA+IG1heCA/IGN1ciA6IG1heCkpXG4gICAgICBmb3IgKGNvbnN0IHNlbGVjdGlvbiBvZiBzZWxlY3Rpb25zKSB7XG4gICAgICAgIGNvbnN0IHJvdyA9IHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpLnN0YXJ0LnJvd1xuICAgICAgICBjb25zdCBhbW91bnRPZlBhZGRpbmcgPSBtYXhDb2x1bW4gLSBjb2x1bW5Gb3JTZWxlY3Rpb24oc2VsZWN0aW9uKVxuICAgICAgICB0b3RhbEFtb3VudE9mUGFkZGluZ0J5Um93W3Jvd10gPSAodG90YWxBbW91bnRPZlBhZGRpbmdCeVJvd1tyb3ddIHx8IDApICsgYW1vdW50T2ZQYWRkaW5nXG4gICAgICAgIHRoaXMuYW1vdW50T2ZQYWRkaW5nQnlTZWxlY3Rpb24uc2V0KHNlbGVjdGlvbiwgYW1vdW50T2ZQYWRkaW5nKVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGV4ZWN1dGUoKSB7XG4gICAgdGhpcy5hbW91bnRPZlBhZGRpbmdCeVNlbGVjdGlvbiA9IG5ldyBNYXAoKVxuICAgIHRoaXMub25EaWRTZWxlY3RUYXJnZXQoKCkgPT4ge1xuICAgICAgdGhpcy5jYWxjdWxhdGVQYWRkaW5nKClcbiAgICB9KVxuICAgIHN1cGVyLmV4ZWN1dGUoKVxuICB9XG5cbiAgZ2V0TmV3VGV4dCh0ZXh0LCBzZWxlY3Rpb24pIHtcbiAgICBjb25zdCBwYWRkaW5nID0gXCIgXCIucmVwZWF0KHRoaXMuYW1vdW50T2ZQYWRkaW5nQnlTZWxlY3Rpb24uZ2V0KHNlbGVjdGlvbikpXG4gICAgY29uc3Qgd2hpY2hUb1BhZCA9IHRoaXMuZ2V0V2ljaFRvUGFkRm9yVGV4dChzZWxlY3Rpb24uZ2V0VGV4dCgpKVxuICAgIHJldHVybiB3aGljaFRvUGFkID09PSBcInN0YXJ0XCIgPyBwYWRkaW5nICsgdGV4dCA6IHRleHQgKyBwYWRkaW5nXG4gIH1cbn1cbkFsaWduT2NjdXJyZW5jZS5yZWdpc3RlcigpXG5cbmNsYXNzIEFsaWduT2NjdXJyZW5jZUJ5UGFkTGVmdCBleHRlbmRzIEFsaWduT2NjdXJyZW5jZSB7XG4gIHdoaWNoVG9QYWQgPSBcInN0YXJ0XCJcbn1cbkFsaWduT2NjdXJyZW5jZUJ5UGFkTGVmdC5yZWdpc3RlcigpXG5cbmNsYXNzIEFsaWduT2NjdXJyZW5jZUJ5UGFkUmlnaHQgZXh0ZW5kcyBBbGlnbk9jY3VycmVuY2Uge1xuICB3aGljaFRvUGFkID0gXCJlbmRcIlxufVxuQWxpZ25PY2N1cnJlbmNlQnlQYWRSaWdodC5yZWdpc3RlcigpXG5cbmNsYXNzIFJlbW92ZUxlYWRpbmdXaGl0ZVNwYWNlcyBleHRlbmRzIFRyYW5zZm9ybVN0cmluZyB7XG4gIHdpc2UgPSBcImxpbmV3aXNlXCJcbiAgZ2V0TmV3VGV4dCh0ZXh0LCBzZWxlY3Rpb24pIHtcbiAgICBjb25zdCB0cmltTGVmdCA9IHRleHQgPT4gdGV4dC50cmltTGVmdCgpXG4gICAgcmV0dXJuIChcbiAgICAgIHRoaXMudXRpbHNcbiAgICAgICAgLnNwbGl0VGV4dEJ5TmV3TGluZSh0ZXh0KVxuICAgICAgICAubWFwKHRyaW1MZWZ0KVxuICAgICAgICAuam9pbihcIlxcblwiKSArIFwiXFxuXCJcbiAgICApXG4gIH1cbn1cblJlbW92ZUxlYWRpbmdXaGl0ZVNwYWNlcy5yZWdpc3RlcigpXG5cbmNsYXNzIENvbnZlcnRUb1NvZnRUYWIgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmcge1xuICBzdGF0aWMgZGlzcGxheU5hbWUgPSBcIlNvZnQgVGFiXCJcbiAgd2lzZSA9IFwibGluZXdpc2VcIlxuXG4gIG11dGF0ZVNlbGVjdGlvbihzZWxlY3Rpb24pIHtcbiAgICByZXR1cm4gdGhpcy5zY2FuRm9yd2FyZCgvXFx0L2csIHtzY2FuUmFuZ2U6IHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpfSwgKHtyYW5nZSwgcmVwbGFjZX0pID0+IHtcbiAgICAgIC8vIFJlcGxhY2UgXFx0IHRvIHNwYWNlcyB3aGljaCBsZW5ndGggaXMgdmFyeSBkZXBlbmRpbmcgb24gdGFiU3RvcCBhbmQgdGFiTGVuZ2h0XG4gICAgICAvLyBTbyB3ZSBkaXJlY3RseSBjb25zdWx0IGl0J3Mgc2NyZWVuIHJlcHJlc2VudGluZyBsZW5ndGguXG4gICAgICBjb25zdCBsZW5ndGggPSB0aGlzLmVkaXRvci5zY3JlZW5SYW5nZUZvckJ1ZmZlclJhbmdlKHJhbmdlKS5nZXRFeHRlbnQoKS5jb2x1bW5cbiAgICAgIHJldHVybiByZXBsYWNlKFwiIFwiLnJlcGVhdChsZW5ndGgpKVxuICAgIH0pXG4gIH1cbn1cbkNvbnZlcnRUb1NvZnRUYWIucmVnaXN0ZXIoKVxuXG5jbGFzcyBDb252ZXJ0VG9IYXJkVGFiIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nIHtcbiAgc3RhdGljIGRpc3BsYXlOYW1lID0gXCJIYXJkIFRhYlwiXG5cbiAgbXV0YXRlU2VsZWN0aW9uKHNlbGVjdGlvbikge1xuICAgIGNvbnN0IHRhYkxlbmd0aCA9IHRoaXMuZWRpdG9yLmdldFRhYkxlbmd0aCgpXG4gICAgdGhpcy5zY2FuRm9yd2FyZCgvWyBcXHRdKy9nLCB7c2NhblJhbmdlOiBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKX0sICh7cmFuZ2UsIHJlcGxhY2V9KSA9PiB7XG4gICAgICBjb25zdCB7c3RhcnQsIGVuZH0gPSB0aGlzLmVkaXRvci5zY3JlZW5SYW5nZUZvckJ1ZmZlclJhbmdlKHJhbmdlKVxuICAgICAgbGV0IHN0YXJ0Q29sdW1uID0gc3RhcnQuY29sdW1uXG4gICAgICBjb25zdCBlbmRDb2x1bW4gPSBlbmQuY29sdW1uXG5cbiAgICAgIC8vIFdlIGNhbid0IG5haXZlbHkgcmVwbGFjZSBzcGFjZXMgdG8gdGFiLCB3ZSBoYXZlIHRvIGNvbnNpZGVyIHZhbGlkIHRhYlN0b3AgY29sdW1uXG4gICAgICAvLyBJZiBuZXh0VGFiU3RvcCBjb2x1bW4gZXhjZWVkcyByZXBsYWNhYmxlIHJhbmdlLCB3ZSBwYWQgd2l0aCBzcGFjZXMuXG4gICAgICBsZXQgbmV3VGV4dCA9IFwiXCJcbiAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgIGNvbnN0IHJlbWFpbmRlciA9IHN0YXJ0Q29sdW1uICUgdGFiTGVuZ3RoXG4gICAgICAgIGNvbnN0IG5leHRUYWJTdG9wID0gc3RhcnRDb2x1bW4gKyAocmVtYWluZGVyID09PSAwID8gdGFiTGVuZ3RoIDogcmVtYWluZGVyKVxuICAgICAgICBpZiAobmV4dFRhYlN0b3AgPiBlbmRDb2x1bW4pIHtcbiAgICAgICAgICBuZXdUZXh0ICs9IFwiIFwiLnJlcGVhdChlbmRDb2x1bW4gLSBzdGFydENvbHVtbilcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBuZXdUZXh0ICs9IFwiXFx0XCJcbiAgICAgICAgfVxuICAgICAgICBzdGFydENvbHVtbiA9IG5leHRUYWJTdG9wXG4gICAgICAgIGlmIChzdGFydENvbHVtbiA+PSBlbmRDb2x1bW4pIHtcbiAgICAgICAgICBicmVha1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJlcGxhY2UobmV3VGV4dClcbiAgICB9KVxuICB9XG59XG5Db252ZXJ0VG9IYXJkVGFiLnJlZ2lzdGVyKClcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgVHJhbnNmb3JtU3RyaW5nQnlFeHRlcm5hbENvbW1hbmQgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmcge1xuICBhdXRvSW5kZW50ID0gdHJ1ZVxuICBjb21tYW5kID0gXCJcIiAvLyBlLmcuIGNvbW1hbmQ6ICdzb3J0J1xuICBhcmdzID0gW10gLy8gZS5nIGFyZ3M6IFsnLXJuJ11cblxuICAvLyBOT1RFOiBVbmxpa2Ugb3RoZXIgY2xhc3MsIGZpcnN0IGFyZyBpcyBgc3Rkb3V0YCBvZiBleHRlcm5hbCBjb21tYW5kcy5cbiAgZ2V0TmV3VGV4dCh0ZXh0LCBzZWxlY3Rpb24pIHtcbiAgICByZXR1cm4gdGV4dCB8fCBzZWxlY3Rpb24uZ2V0VGV4dCgpXG4gIH1cbiAgZ2V0Q29tbWFuZChzZWxlY3Rpb24pIHtcbiAgICByZXR1cm4ge2NvbW1hbmQ6IHRoaXMuY29tbWFuZCwgYXJnczogdGhpcy5hcmdzfVxuICB9XG4gIGdldFN0ZGluKHNlbGVjdGlvbikge1xuICAgIHJldHVybiBzZWxlY3Rpb24uZ2V0VGV4dCgpXG4gIH1cblxuICBhc3luYyBleGVjdXRlKCkge1xuICAgIHRoaXMubm9ybWFsaXplU2VsZWN0aW9uc0lmTmVjZXNzYXJ5KClcbiAgICB0aGlzLmNyZWF0ZUJ1ZmZlckNoZWNrcG9pbnQoXCJ1bmRvXCIpXG5cbiAgICBpZiAodGhpcy5zZWxlY3RUYXJnZXQoKSkge1xuICAgICAgZm9yIChjb25zdCBzZWxlY3Rpb24gb2YgdGhpcy5lZGl0b3IuZ2V0U2VsZWN0aW9ucygpKSB7XG4gICAgICAgIGNvbnN0IHtjb21tYW5kLCBhcmdzfSA9IHRoaXMuZ2V0Q29tbWFuZChzZWxlY3Rpb24pIHx8IHt9XG4gICAgICAgIGlmIChjb21tYW5kID09IG51bGwgfHwgYXJncyA9PSBudWxsKSBjb250aW51ZVxuXG4gICAgICAgIGNvbnN0IHN0ZG91dCA9IGF3YWl0IHRoaXMucnVuRXh0ZXJuYWxDb21tYW5kKHtjb21tYW5kLCBhcmdzLCBzdGRpbjogdGhpcy5nZXRTdGRpbihzZWxlY3Rpb24pfSlcbiAgICAgICAgc2VsZWN0aW9uLmluc2VydFRleHQodGhpcy5nZXROZXdUZXh0KHN0ZG91dCwgc2VsZWN0aW9uKSwge2F1dG9JbmRlbnQ6IHRoaXMuYXV0b0luZGVudH0pXG4gICAgICB9XG4gICAgICB0aGlzLm11dGF0aW9uTWFuYWdlci5zZXRDaGVja3BvaW50KFwiZGlkLWZpbmlzaFwiKVxuICAgICAgdGhpcy5yZXN0b3JlQ3Vyc29yUG9zaXRpb25zSWZOZWNlc3NhcnkoKVxuICAgICAgdGhpcy5ncm91cENoYW5nZXNTaW5jZUJ1ZmZlckNoZWNrcG9pbnQoXCJ1bmRvXCIpXG4gICAgfVxuICAgIHRoaXMuZW1pdERpZEZpbmlzaE11dGF0aW9uKClcbiAgICB0aGlzLmFjdGl2YXRlTW9kZShcIm5vcm1hbFwiKVxuICB9XG5cbiAgcnVuRXh0ZXJuYWxDb21tYW5kKG9wdGlvbnMpIHtcbiAgICBsZXQgb3V0cHV0ID0gXCJcIlxuICAgIG9wdGlvbnMuc3Rkb3V0ID0gZGF0YSA9PiAob3V0cHV0ICs9IGRhdGEpXG4gICAgY29uc3QgZXhpdFByb21pc2UgPSBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICAgIG9wdGlvbnMuZXhpdCA9ICgpID0+IHJlc29sdmUob3V0cHV0KVxuICAgIH0pXG4gICAgY29uc3Qge3N0ZGlufSA9IG9wdGlvbnNcbiAgICBkZWxldGUgb3B0aW9ucy5zdGRpblxuICAgIGNvbnN0IGJ1ZmZlcmVkUHJvY2VzcyA9IG5ldyBCdWZmZXJlZFByb2Nlc3Mob3B0aW9ucylcbiAgICBidWZmZXJlZFByb2Nlc3Mub25XaWxsVGhyb3dFcnJvcigoe2Vycm9yLCBoYW5kbGV9KSA9PiB7XG4gICAgICAvLyBTdXBwcmVzcyBjb21tYW5kIG5vdCBmb3VuZCBlcnJvciBpbnRlbnRpb25hbGx5LlxuICAgICAgaWYgKGVycm9yLmNvZGUgPT09IFwiRU5PRU5UXCIgJiYgZXJyb3Iuc3lzY2FsbC5pbmRleE9mKFwic3Bhd25cIikgPT09IDApIHtcbiAgICAgICAgY29uc29sZS5sb2coYCR7dGhpcy5nZXRDb21tYW5kTmFtZSgpfTogRmFpbGVkIHRvIHNwYXduIGNvbW1hbmQgJHtlcnJvci5wYXRofS5gKVxuICAgICAgICBoYW5kbGUoKVxuICAgICAgfVxuICAgICAgdGhpcy5jYW5jZWxPcGVyYXRpb24oKVxuICAgIH0pXG5cbiAgICBpZiAoc3RkaW4pIHtcbiAgICAgIGJ1ZmZlcmVkUHJvY2Vzcy5wcm9jZXNzLnN0ZGluLndyaXRlKHN0ZGluKVxuICAgICAgYnVmZmVyZWRQcm9jZXNzLnByb2Nlc3Muc3RkaW4uZW5kKClcbiAgICB9XG4gICAgcmV0dXJuIGV4aXRQcm9taXNlXG4gIH1cbn1cblRyYW5zZm9ybVN0cmluZ0J5RXh0ZXJuYWxDb21tYW5kLnJlZ2lzdGVyKGZhbHNlKVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBUcmFuc2Zvcm1TdHJpbmdCeVNlbGVjdExpc3QgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmcge1xuICBpc1JlYWR5KCkge1xuICAgIC8vIFRoaXMgY29tbWFuZCBpcyBqdXN0IGdhdGUgdG8gZXhlY3V0ZSBhbm90aGVyIG9wZXJhdG9yLlxuICAgIC8vIFNvIG5ldmVyIGdldCByZWFkeSBhbmQgbmV2ZXIgYmUgZXhlY3V0ZWQuXG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICBpbml0aWFsaXplKCkge1xuICAgIHRoaXMuZm9jdXNTZWxlY3RMaXN0KHtpdGVtczogdGhpcy5jb25zdHJ1Y3Rvci5nZXRTZWxlY3RMaXN0SXRlbXMoKX0pXG4gICAgdGhpcy52aW1TdGF0ZS5vbkRpZENvbmZpcm1TZWxlY3RMaXN0KGl0ZW0gPT4ge1xuICAgICAgdGhpcy52aW1TdGF0ZS5yZXNldCgpXG4gICAgICB0aGlzLnZpbVN0YXRlLm9wZXJhdGlvblN0YWNrLnJ1bihpdGVtLmtsYXNzLCB7dGFyZ2V0OiB0aGlzLnRhcmdldH0pXG4gICAgfSlcbiAgfVxuXG4gIHN0YXRpYyBnZXRTZWxlY3RMaXN0SXRlbXMoKSB7XG4gICAgaWYgKCF0aGlzLnNlbGVjdExpc3RJdGVtcykge1xuICAgICAgdGhpcy5zZWxlY3RMaXN0SXRlbXMgPSB0aGlzLnN0cmluZ1RyYW5zZm9ybWVycy5tYXAoa2xhc3MgPT4gKHtcbiAgICAgICAga2xhc3M6IGtsYXNzLFxuICAgICAgICBkaXNwbGF5TmFtZToga2xhc3MuaGFzT3duUHJvcGVydHkoXCJkaXNwbGF5TmFtZVwiKVxuICAgICAgICAgID8ga2xhc3MuZGlzcGxheU5hbWVcbiAgICAgICAgICA6IF8uaHVtYW5pemVFdmVudE5hbWUoXy5kYXNoZXJpemUoa2xhc3MubmFtZSkpLFxuICAgICAgfSkpXG4gICAgfVxuICAgIHJldHVybiB0aGlzLnNlbGVjdExpc3RJdGVtc1xuICB9XG5cbiAgZXhlY3V0ZSgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYCR7dGhpcy5uYW1lfSBzaG91bGQgbm90IGJlIGV4ZWN1dGVkYClcbiAgfVxufVxuVHJhbnNmb3JtU3RyaW5nQnlTZWxlY3RMaXN0LnJlZ2lzdGVyKClcblxuY2xhc3MgVHJhbnNmb3JtV29yZEJ5U2VsZWN0TGlzdCBleHRlbmRzIFRyYW5zZm9ybVN0cmluZ0J5U2VsZWN0TGlzdCB7XG4gIHRhcmdldCA9IFwiSW5uZXJXb3JkXCJcbn1cblRyYW5zZm9ybVdvcmRCeVNlbGVjdExpc3QucmVnaXN0ZXIoKVxuXG5jbGFzcyBUcmFuc2Zvcm1TbWFydFdvcmRCeVNlbGVjdExpc3QgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmdCeVNlbGVjdExpc3Qge1xuICB0YXJnZXQgPSBcIklubmVyU21hcnRXb3JkXCJcbn1cblRyYW5zZm9ybVNtYXJ0V29yZEJ5U2VsZWN0TGlzdC5yZWdpc3RlcigpXG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIFJlcGxhY2VXaXRoUmVnaXN0ZXIgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmcge1xuICBmbGFzaFR5cGUgPSBcIm9wZXJhdG9yLWxvbmdcIlxuXG4gIGluaXRpYWxpemUoKSB7XG4gICAgdGhpcy52aW1TdGF0ZS5zZXF1ZW50aWFsUGFzdGVNYW5hZ2VyLm9uSW5pdGlhbGl6ZSh0aGlzKVxuICAgIHN1cGVyLmluaXRpYWxpemUoKVxuICB9XG5cbiAgZXhlY3V0ZSgpIHtcbiAgICB0aGlzLnNlcXVlbnRpYWxQYXN0ZSA9IHRoaXMudmltU3RhdGUuc2VxdWVudGlhbFBhc3RlTWFuYWdlci5vbkV4ZWN1dGUodGhpcylcblxuICAgIHN1cGVyLmV4ZWN1dGUoKVxuXG4gICAgZm9yIChjb25zdCBzZWxlY3Rpb24gb2YgdGhpcy5lZGl0b3IuZ2V0U2VsZWN0aW9ucygpKSB7XG4gICAgICBjb25zdCByYW5nZSA9IHRoaXMubXV0YXRpb25NYW5hZ2VyLmdldE11dGF0ZWRCdWZmZXJSYW5nZUZvclNlbGVjdGlvbihzZWxlY3Rpb24pXG4gICAgICB0aGlzLnZpbVN0YXRlLnNlcXVlbnRpYWxQYXN0ZU1hbmFnZXIuc2F2ZVBhc3RlZFJhbmdlRm9yU2VsZWN0aW9uKHNlbGVjdGlvbiwgcmFuZ2UpXG4gICAgfVxuICB9XG5cbiAgZ2V0TmV3VGV4dCh0ZXh0LCBzZWxlY3Rpb24pIHtcbiAgICBjb25zdCB2YWx1ZSA9IHRoaXMudmltU3RhdGUucmVnaXN0ZXIuZ2V0KG51bGwsIHNlbGVjdGlvbiwgdGhpcy5zZXF1ZW50aWFsUGFzdGUpXG4gICAgcmV0dXJuIHZhbHVlID8gdmFsdWUudGV4dCA6IFwiXCJcbiAgfVxufVxuUmVwbGFjZVdpdGhSZWdpc3Rlci5yZWdpc3RlcigpXG5cbmNsYXNzIFJlcGxhY2VPY2N1cnJlbmNlV2l0aFJlZ2lzdGVyIGV4dGVuZHMgUmVwbGFjZVdpdGhSZWdpc3RlciB7XG4gIG9jY3VycmVuY2UgPSB0cnVlXG59XG5SZXBsYWNlT2NjdXJyZW5jZVdpdGhSZWdpc3Rlci5yZWdpc3RlcigpXG5cbi8vIFNhdmUgdGV4dCB0byByZWdpc3RlciBiZWZvcmUgcmVwbGFjZVxuY2xhc3MgU3dhcFdpdGhSZWdpc3RlciBleHRlbmRzIFRyYW5zZm9ybVN0cmluZyB7XG4gIGdldE5ld1RleHQodGV4dCwgc2VsZWN0aW9uKSB7XG4gICAgY29uc3QgbmV3VGV4dCA9IHRoaXMudmltU3RhdGUucmVnaXN0ZXIuZ2V0VGV4dCgpXG4gICAgdGhpcy5zZXRUZXh0VG9SZWdpc3Rlcih0ZXh0LCBzZWxlY3Rpb24pXG4gICAgcmV0dXJuIG5ld1RleHRcbiAgfVxufVxuU3dhcFdpdGhSZWdpc3Rlci5yZWdpc3RlcigpXG5cbi8vIEluZGVudCA8IFRyYW5zZm9ybVN0cmluZ1xuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgSW5kZW50IGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nIHtcbiAgc3RheUJ5TWFya2VyID0gdHJ1ZVxuICBzZXRUb0ZpcnN0Q2hhcmFjdGVyT25MaW5ld2lzZSA9IHRydWVcbiAgd2lzZSA9IFwibGluZXdpc2VcIlxuXG4gIG11dGF0ZVNlbGVjdGlvbihzZWxlY3Rpb24pIHtcbiAgICAvLyBOZWVkIGNvdW50IHRpbWVzIGluZGVudGF0aW9uIGluIHZpc3VhbC1tb2RlIGFuZCBpdHMgcmVwZWF0KGAuYCkuXG4gICAgaWYgKHRoaXMudGFyZ2V0Lm5hbWUgPT09IFwiQ3VycmVudFNlbGVjdGlvblwiKSB7XG4gICAgICBsZXQgb2xkVGV4dFxuICAgICAgLy8gbGltaXQgdG8gMTAwIHRvIGF2b2lkIGZyZWV6aW5nIGJ5IGFjY2lkZW50YWwgYmlnIG51bWJlci5cbiAgICAgIGNvbnN0IGNvdW50ID0gdGhpcy51dGlscy5saW1pdE51bWJlcih0aGlzLmdldENvdW50KCksIHttYXg6IDEwMH0pXG4gICAgICB0aGlzLmNvdW50VGltZXMoY291bnQsICh7c3RvcH0pID0+IHtcbiAgICAgICAgb2xkVGV4dCA9IHNlbGVjdGlvbi5nZXRUZXh0KClcbiAgICAgICAgdGhpcy5pbmRlbnQoc2VsZWN0aW9uKVxuICAgICAgICBpZiAoc2VsZWN0aW9uLmdldFRleHQoKSA9PT0gb2xkVGV4dCkgc3RvcCgpXG4gICAgICB9KVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmluZGVudChzZWxlY3Rpb24pXG4gICAgfVxuICB9XG5cbiAgaW5kZW50KHNlbGVjdGlvbikge1xuICAgIHNlbGVjdGlvbi5pbmRlbnRTZWxlY3RlZFJvd3MoKVxuICB9XG59XG5JbmRlbnQucmVnaXN0ZXIoKVxuXG5jbGFzcyBPdXRkZW50IGV4dGVuZHMgSW5kZW50IHtcbiAgaW5kZW50KHNlbGVjdGlvbikge1xuICAgIHNlbGVjdGlvbi5vdXRkZW50U2VsZWN0ZWRSb3dzKClcbiAgfVxufVxuT3V0ZGVudC5yZWdpc3RlcigpXG5cbmNsYXNzIEF1dG9JbmRlbnQgZXh0ZW5kcyBJbmRlbnQge1xuICBpbmRlbnQoc2VsZWN0aW9uKSB7XG4gICAgc2VsZWN0aW9uLmF1dG9JbmRlbnRTZWxlY3RlZFJvd3MoKVxuICB9XG59XG5BdXRvSW5kZW50LnJlZ2lzdGVyKClcblxuY2xhc3MgVG9nZ2xlTGluZUNvbW1lbnRzIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nIHtcbiAgZmxhc2hUYXJnZXQgPSBmYWxzZVxuICBzdGF5QnlNYXJrZXIgPSB0cnVlXG4gIHN0YXlBdFNhbWVQb3NpdGlvbiA9IHRydWVcbiAgd2lzZSA9IFwibGluZXdpc2VcIlxuXG4gIG11dGF0ZVNlbGVjdGlvbihzZWxlY3Rpb24pIHtcbiAgICBzZWxlY3Rpb24udG9nZ2xlTGluZUNvbW1lbnRzKClcbiAgfVxufVxuVG9nZ2xlTGluZUNvbW1lbnRzLnJlZ2lzdGVyKClcblxuY2xhc3MgUmVmbG93IGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nIHtcbiAgbXV0YXRlU2VsZWN0aW9uKHNlbGVjdGlvbikge1xuICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2godGhpcy5lZGl0b3JFbGVtZW50LCBcImF1dG9mbG93OnJlZmxvdy1zZWxlY3Rpb25cIilcbiAgfVxufVxuUmVmbG93LnJlZ2lzdGVyKClcblxuY2xhc3MgUmVmbG93V2l0aFN0YXkgZXh0ZW5kcyBSZWZsb3cge1xuICBzdGF5QXRTYW1lUG9zaXRpb24gPSB0cnVlXG59XG5SZWZsb3dXaXRoU3RheS5yZWdpc3RlcigpXG5cbi8vIFN1cnJvdW5kIDwgVHJhbnNmb3JtU3RyaW5nXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBTdXJyb3VuZEJhc2UgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmcge1xuICBzdXJyb3VuZEFjdGlvbiA9IG51bGxcbiAgcGFpcnMgPSBbW1wiKFwiLCBcIilcIl0sIFtcIntcIiwgXCJ9XCJdLCBbXCJbXCIsIFwiXVwiXSwgW1wiPFwiLCBcIj5cIl1dXG4gIHBhaXJzQnlBbGlhcyA9IHtcbiAgICBiOiBbXCIoXCIsIFwiKVwiXSxcbiAgICBCOiBbXCJ7XCIsIFwifVwiXSxcbiAgICByOiBbXCJbXCIsIFwiXVwiXSxcbiAgICBhOiBbXCI8XCIsIFwiPlwiXSxcbiAgfVxuXG4gIGdldFBhaXIoY2hhcikge1xuICAgIHJldHVybiBjaGFyIGluIHRoaXMucGFpcnNCeUFsaWFzXG4gICAgICA/IHRoaXMucGFpcnNCeUFsaWFzW2NoYXJdXG4gICAgICA6IFsuLi50aGlzLnBhaXJzLCBbY2hhciwgY2hhcl1dLmZpbmQocGFpciA9PiBwYWlyLmluY2x1ZGVzKGNoYXIpKVxuICB9XG5cbiAgc3Vycm91bmQodGV4dCwgY2hhciwge2tlZXBMYXlvdXQgPSBmYWxzZX0gPSB7fSkge1xuICAgIGxldCBbb3BlbiwgY2xvc2VdID0gdGhpcy5nZXRQYWlyKGNoYXIpXG4gICAgaWYgKCFrZWVwTGF5b3V0ICYmIHRleHQuZW5kc1dpdGgoXCJcXG5cIikpIHtcbiAgICAgIHRoaXMuYXV0b0luZGVudEFmdGVySW5zZXJ0VGV4dCA9IHRydWVcbiAgICAgIG9wZW4gKz0gXCJcXG5cIlxuICAgICAgY2xvc2UgKz0gXCJcXG5cIlxuICAgIH1cblxuICAgIGlmICh0aGlzLmdldENvbmZpZyhcImNoYXJhY3RlcnNUb0FkZFNwYWNlT25TdXJyb3VuZFwiKS5pbmNsdWRlcyhjaGFyKSAmJiB0aGlzLnV0aWxzLmlzU2luZ2xlTGluZVRleHQodGV4dCkpIHtcbiAgICAgIHRleHQgPSBcIiBcIiArIHRleHQgKyBcIiBcIlxuICAgIH1cblxuICAgIHJldHVybiBvcGVuICsgdGV4dCArIGNsb3NlXG4gIH1cblxuICBkZWxldGVTdXJyb3VuZCh0ZXh0KSB7XG4gICAgLy8gQXNzdW1lIHN1cnJvdW5kaW5nIGNoYXIgaXMgb25lLWNoYXIgbGVuZ3RoLlxuICAgIGNvbnN0IG9wZW4gPSB0ZXh0WzBdXG4gICAgY29uc3QgY2xvc2UgPSB0ZXh0W3RleHQubGVuZ3RoIC0gMV1cbiAgICBjb25zdCBpbm5lclRleHQgPSB0ZXh0LnNsaWNlKDEsIHRleHQubGVuZ3RoIC0gMSlcbiAgICByZXR1cm4gdGhpcy51dGlscy5pc1NpbmdsZUxpbmVUZXh0KHRleHQpICYmIG9wZW4gIT09IGNsb3NlID8gaW5uZXJUZXh0LnRyaW0oKSA6IGlubmVyVGV4dFxuICB9XG5cbiAgZ2V0TmV3VGV4dCh0ZXh0KSB7XG4gICAgaWYgKHRoaXMuc3Vycm91bmRBY3Rpb24gPT09IFwic3Vycm91bmRcIikge1xuICAgICAgcmV0dXJuIHRoaXMuc3Vycm91bmQodGV4dCwgdGhpcy5pbnB1dClcbiAgICB9IGVsc2UgaWYgKHRoaXMuc3Vycm91bmRBY3Rpb24gPT09IFwiZGVsZXRlLXN1cnJvdW5kXCIpIHtcbiAgICAgIHJldHVybiB0aGlzLmRlbGV0ZVN1cnJvdW5kKHRleHQpXG4gICAgfSBlbHNlIGlmICh0aGlzLnN1cnJvdW5kQWN0aW9uID09PSBcImNoYW5nZS1zdXJyb3VuZFwiKSB7XG4gICAgICByZXR1cm4gdGhpcy5zdXJyb3VuZCh0aGlzLmRlbGV0ZVN1cnJvdW5kKHRleHQpLCB0aGlzLmlucHV0LCB7a2VlcExheW91dDogdHJ1ZX0pXG4gICAgfVxuICB9XG59XG5TdXJyb3VuZEJhc2UucmVnaXN0ZXIoZmFsc2UpXG5cbmNsYXNzIFN1cnJvdW5kIGV4dGVuZHMgU3Vycm91bmRCYXNlIHtcbiAgc3Vycm91bmRBY3Rpb24gPSBcInN1cnJvdW5kXCJcbiAgcmVhZElucHV0QWZ0ZXJFeGVjdXRlID0gdHJ1ZVxufVxuU3Vycm91bmQucmVnaXN0ZXIoKVxuXG5jbGFzcyBTdXJyb3VuZFdvcmQgZXh0ZW5kcyBTdXJyb3VuZCB7XG4gIHRhcmdldCA9IFwiSW5uZXJXb3JkXCJcbn1cblN1cnJvdW5kV29yZC5yZWdpc3RlcigpXG5cbmNsYXNzIFN1cnJvdW5kU21hcnRXb3JkIGV4dGVuZHMgU3Vycm91bmQge1xuICB0YXJnZXQgPSBcIklubmVyU21hcnRXb3JkXCJcbn1cblN1cnJvdW5kU21hcnRXb3JkLnJlZ2lzdGVyKClcblxuY2xhc3MgTWFwU3Vycm91bmQgZXh0ZW5kcyBTdXJyb3VuZCB7XG4gIG9jY3VycmVuY2UgPSB0cnVlXG4gIHBhdHRlcm5Gb3JPY2N1cnJlbmNlID0gL1xcdysvZ1xufVxuTWFwU3Vycm91bmQucmVnaXN0ZXIoKVxuXG4vLyBEZWxldGUgU3Vycm91bmRcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIERlbGV0ZVN1cnJvdW5kIGV4dGVuZHMgU3Vycm91bmRCYXNlIHtcbiAgc3Vycm91bmRBY3Rpb24gPSBcImRlbGV0ZS1zdXJyb3VuZFwiXG4gIGluaXRpYWxpemUoKSB7XG4gICAgaWYgKCF0aGlzLnRhcmdldCkge1xuICAgICAgdGhpcy5mb2N1c0lucHV0KHtcbiAgICAgICAgb25Db25maXJtOiBjaGFyID0+IHtcbiAgICAgICAgICB0aGlzLnNldFRhcmdldCh0aGlzLmdldEluc3RhbmNlKFwiQVBhaXJcIiwge3BhaXI6IHRoaXMuZ2V0UGFpcihjaGFyKX0pKVxuICAgICAgICAgIHRoaXMucHJvY2Vzc09wZXJhdGlvbigpXG4gICAgICAgIH0sXG4gICAgICB9KVxuICAgIH1cbiAgICBzdXBlci5pbml0aWFsaXplKClcbiAgfVxufVxuRGVsZXRlU3Vycm91bmQucmVnaXN0ZXIoKVxuXG5jbGFzcyBEZWxldGVTdXJyb3VuZEFueVBhaXIgZXh0ZW5kcyBEZWxldGVTdXJyb3VuZCB7XG4gIHRhcmdldCA9IFwiQUFueVBhaXJcIlxufVxuRGVsZXRlU3Vycm91bmRBbnlQYWlyLnJlZ2lzdGVyKClcblxuY2xhc3MgRGVsZXRlU3Vycm91bmRBbnlQYWlyQWxsb3dGb3J3YXJkaW5nIGV4dGVuZHMgRGVsZXRlU3Vycm91bmRBbnlQYWlyIHtcbiAgdGFyZ2V0ID0gXCJBQW55UGFpckFsbG93Rm9yd2FyZGluZ1wiXG59XG5EZWxldGVTdXJyb3VuZEFueVBhaXJBbGxvd0ZvcndhcmRpbmcucmVnaXN0ZXIoKVxuXG4vLyBDaGFuZ2UgU3Vycm91bmRcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIENoYW5nZVN1cnJvdW5kIGV4dGVuZHMgRGVsZXRlU3Vycm91bmQge1xuICBzdXJyb3VuZEFjdGlvbiA9IFwiY2hhbmdlLXN1cnJvdW5kXCJcbiAgcmVhZElucHV0QWZ0ZXJFeGVjdXRlID0gdHJ1ZVxuXG4gIC8vIE92ZXJyaWRlIHRvIHNob3cgY2hhbmdpbmcgY2hhciBvbiBob3ZlclxuICBhc3luYyBmb2N1c0lucHV0UHJvbWlzaWZpZWQoLi4uYXJncykge1xuICAgIGNvbnN0IGhvdmVyUG9pbnQgPSB0aGlzLm11dGF0aW9uTWFuYWdlci5nZXRJbml0aWFsUG9pbnRGb3JTZWxlY3Rpb24odGhpcy5lZGl0b3IuZ2V0TGFzdFNlbGVjdGlvbigpKVxuICAgIHRoaXMudmltU3RhdGUuaG92ZXIuc2V0KHRoaXMuZWRpdG9yLmdldFNlbGVjdGVkVGV4dCgpWzBdLCBob3ZlclBvaW50KVxuICAgIHJldHVybiBzdXBlci5mb2N1c0lucHV0UHJvbWlzaWZpZWQoLi4uYXJncylcbiAgfVxufVxuQ2hhbmdlU3Vycm91bmQucmVnaXN0ZXIoKVxuXG5jbGFzcyBDaGFuZ2VTdXJyb3VuZEFueVBhaXIgZXh0ZW5kcyBDaGFuZ2VTdXJyb3VuZCB7XG4gIHRhcmdldCA9IFwiQUFueVBhaXJcIlxufVxuQ2hhbmdlU3Vycm91bmRBbnlQYWlyLnJlZ2lzdGVyKClcblxuY2xhc3MgQ2hhbmdlU3Vycm91bmRBbnlQYWlyQWxsb3dGb3J3YXJkaW5nIGV4dGVuZHMgQ2hhbmdlU3Vycm91bmRBbnlQYWlyIHtcbiAgdGFyZ2V0ID0gXCJBQW55UGFpckFsbG93Rm9yd2FyZGluZ1wiXG59XG5DaGFuZ2VTdXJyb3VuZEFueVBhaXJBbGxvd0ZvcndhcmRpbmcucmVnaXN0ZXIoKVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBGSVhNRVxuLy8gQ3VycmVudGx5IG5hdGl2ZSBlZGl0b3Iuam9pbkxpbmVzKCkgaXMgYmV0dGVyIGZvciBjdXJzb3IgcG9zaXRpb24gc2V0dGluZ1xuLy8gU28gSSB1c2UgbmF0aXZlIG1ldGhvZHMgZm9yIGEgbWVhbndoaWxlLlxuY2xhc3MgSm9pblRhcmdldCBleHRlbmRzIFRyYW5zZm9ybVN0cmluZyB7XG4gIGZsYXNoVGFyZ2V0ID0gZmFsc2VcbiAgcmVzdG9yZVBvc2l0aW9ucyA9IGZhbHNlXG5cbiAgbXV0YXRlU2VsZWN0aW9uKHNlbGVjdGlvbikge1xuICAgIGNvbnN0IHJhbmdlID0gc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKClcblxuICAgIC8vIFdoZW4gY3Vyc29yIGlzIGF0IGxhc3QgQlVGRkVSIHJvdywgaXQgc2VsZWN0IGxhc3QtYnVmZmVyLXJvdywgdGhlblxuICAgIC8vIGpvaW5uaW5nIHJlc3VsdCBpbiBcImNsZWFyIGxhc3QtYnVmZmVyLXJvdyB0ZXh0XCIuXG4gICAgLy8gSSBiZWxpZXZlIHRoaXMgaXMgQlVHIG9mIHVwc3RyZWFtIGF0b20tY29yZS4gZ3VhcmQgdGhpcyBzaXR1YXRpb24gaGVyZVxuICAgIGlmICghcmFuZ2UuaXNTaW5nbGVMaW5lKCkgfHwgcmFuZ2UuZW5kLnJvdyAhPT0gdGhpcy5lZGl0b3IuZ2V0TGFzdEJ1ZmZlclJvdygpKSB7XG4gICAgICBpZiAodGhpcy51dGlscy5pc0xpbmV3aXNlUmFuZ2UocmFuZ2UpKSB7XG4gICAgICAgIHNlbGVjdGlvbi5zZXRCdWZmZXJSYW5nZShyYW5nZS50cmFuc2xhdGUoWzAsIDBdLCBbLTEsIEluZmluaXR5XSkpXG4gICAgICB9XG4gICAgICBzZWxlY3Rpb24uam9pbkxpbmVzKClcbiAgICB9XG4gICAgY29uc3QgcG9pbnQgPSBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKS5lbmQudHJhbnNsYXRlKFswLCAtMV0pXG4gICAgcmV0dXJuIHNlbGVjdGlvbi5jdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24ocG9pbnQpXG4gIH1cbn1cbkpvaW5UYXJnZXQucmVnaXN0ZXIoKVxuXG5jbGFzcyBKb2luIGV4dGVuZHMgSm9pblRhcmdldCB7XG4gIHRhcmdldCA9IFwiTW92ZVRvUmVsYXRpdmVMaW5lXCJcbn1cbkpvaW4ucmVnaXN0ZXIoKVxuXG5jbGFzcyBKb2luQmFzZSBleHRlbmRzIFRyYW5zZm9ybVN0cmluZyB7XG4gIHdpc2UgPSBcImxpbmV3aXNlXCJcbiAgdHJpbSA9IGZhbHNlXG4gIHRhcmdldCA9IFwiTW92ZVRvUmVsYXRpdmVMaW5lTWluaW11bVR3b1wiXG5cbiAgZ2V0TmV3VGV4dCh0ZXh0KSB7XG4gICAgY29uc3QgcmVnZXggPSB0aGlzLnRyaW0gPyAvXFxyP1xcblsgXFx0XSovZyA6IC9cXHI/XFxuL2dcbiAgICByZXR1cm4gdGV4dC50cmltUmlnaHQoKS5yZXBsYWNlKHJlZ2V4LCB0aGlzLmlucHV0KSArIFwiXFxuXCJcbiAgfVxufVxuSm9pbkJhc2UucmVnaXN0ZXIoZmFsc2UpXG5cbmNsYXNzIEpvaW5XaXRoS2VlcGluZ1NwYWNlIGV4dGVuZHMgSm9pbkJhc2Uge1xuICBpbnB1dCA9IFwiXCJcbn1cbkpvaW5XaXRoS2VlcGluZ1NwYWNlLnJlZ2lzdGVyKClcblxuY2xhc3MgSm9pbkJ5SW5wdXQgZXh0ZW5kcyBKb2luQmFzZSB7XG4gIHJlYWRJbnB1dEFmdGVyRXhlY3V0ZSA9IHRydWVcbiAgZm9jdXNJbnB1dE9wdGlvbnMgPSB7Y2hhcnNNYXg6IDEwfVxuICB0cmltID0gdHJ1ZVxufVxuSm9pbkJ5SW5wdXQucmVnaXN0ZXIoKVxuXG5jbGFzcyBKb2luQnlJbnB1dFdpdGhLZWVwaW5nU3BhY2UgZXh0ZW5kcyBKb2luQnlJbnB1dCB7XG4gIHRyaW0gPSBmYWxzZVxufVxuSm9pbkJ5SW5wdXRXaXRoS2VlcGluZ1NwYWNlLnJlZ2lzdGVyKClcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gU3RyaW5nIHN1ZmZpeCBpbiBuYW1lIGlzIHRvIGF2b2lkIGNvbmZ1c2lvbiB3aXRoICdzcGxpdCcgd2luZG93LlxuY2xhc3MgU3BsaXRTdHJpbmcgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmcge1xuICB0YXJnZXQgPSBcIk1vdmVUb1JlbGF0aXZlTGluZVwiXG4gIGtlZXBTcGxpdHRlciA9IGZhbHNlXG4gIHJlYWRJbnB1dEFmdGVyRXhlY3V0ZSA9IHRydWVcbiAgZm9jdXNJbnB1dE9wdGlvbnMgPSB7Y2hhcnNNYXg6IDEwfVxuXG4gIGdldE5ld1RleHQodGV4dCkge1xuICAgIGNvbnN0IHJlZ2V4ID0gbmV3IFJlZ0V4cChfLmVzY2FwZVJlZ0V4cCh0aGlzLmlucHV0IHx8IFwiXFxcXG5cIiksIFwiZ1wiKVxuICAgIGNvbnN0IGxpbmVTZXBhcmF0b3IgPSAodGhpcy5rZWVwU3BsaXR0ZXIgPyB0aGlzLmlucHV0IDogXCJcIikgKyBcIlxcblwiXG4gICAgcmV0dXJuIHRleHQucmVwbGFjZShyZWdleCwgbGluZVNlcGFyYXRvcilcbiAgfVxufVxuU3BsaXRTdHJpbmcucmVnaXN0ZXIoKVxuXG5jbGFzcyBTcGxpdFN0cmluZ1dpdGhLZWVwaW5nU3BsaXR0ZXIgZXh0ZW5kcyBTcGxpdFN0cmluZyB7XG4gIGtlZXBTcGxpdHRlciA9IHRydWVcbn1cblNwbGl0U3RyaW5nV2l0aEtlZXBpbmdTcGxpdHRlci5yZWdpc3RlcigpXG5cbmNsYXNzIFNwbGl0QXJndW1lbnRzIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nIHtcbiAga2VlcFNlcGFyYXRvciA9IHRydWVcbiAgYXV0b0luZGVudEFmdGVySW5zZXJ0VGV4dCA9IHRydWVcblxuICBnZXROZXdUZXh0KHRleHQpIHtcbiAgICBjb25zdCBhbGxUb2tlbnMgPSB0aGlzLnV0aWxzLnNwbGl0QXJndW1lbnRzKHRleHQudHJpbSgpKVxuICAgIGxldCBuZXdUZXh0ID0gXCJcIlxuICAgIHdoaWxlIChhbGxUb2tlbnMubGVuZ3RoKSB7XG4gICAgICBjb25zdCB7dGV4dCwgdHlwZX0gPSBhbGxUb2tlbnMuc2hpZnQoKVxuICAgICAgbmV3VGV4dCArPSB0eXBlID09PSBcInNlcGFyYXRvclwiID8gKHRoaXMua2VlcFNlcGFyYXRvciA/IHRleHQudHJpbSgpIDogXCJcIikgKyBcIlxcblwiIDogdGV4dFxuICAgIH1cbiAgICByZXR1cm4gYFxcbiR7bmV3VGV4dH1cXG5gXG4gIH1cbn1cblNwbGl0QXJndW1lbnRzLnJlZ2lzdGVyKClcblxuY2xhc3MgU3BsaXRBcmd1bWVudHNXaXRoUmVtb3ZlU2VwYXJhdG9yIGV4dGVuZHMgU3BsaXRBcmd1bWVudHMge1xuICBrZWVwU2VwYXJhdG9yID0gZmFsc2Vcbn1cblNwbGl0QXJndW1lbnRzV2l0aFJlbW92ZVNlcGFyYXRvci5yZWdpc3RlcigpXG5cbmNsYXNzIFNwbGl0QXJndW1lbnRzT2ZJbm5lckFueVBhaXIgZXh0ZW5kcyBTcGxpdEFyZ3VtZW50cyB7XG4gIHRhcmdldCA9IFwiSW5uZXJBbnlQYWlyXCJcbn1cblNwbGl0QXJndW1lbnRzT2ZJbm5lckFueVBhaXIucmVnaXN0ZXIoKVxuXG5jbGFzcyBDaGFuZ2VPcmRlciBleHRlbmRzIFRyYW5zZm9ybVN0cmluZyB7XG4gIGdldE5ld1RleHQodGV4dCkge1xuICAgIHJldHVybiB0aGlzLnRhcmdldC5pc0xpbmV3aXNlKClcbiAgICAgID8gdGhpcy5nZXROZXdMaXN0KHRoaXMudXRpbHMuc3BsaXRUZXh0QnlOZXdMaW5lKHRleHQpKS5qb2luKFwiXFxuXCIpICsgXCJcXG5cIlxuICAgICAgOiB0aGlzLnNvcnRBcmd1bWVudHNJblRleHRCeSh0ZXh0LCBhcmdzID0+IHRoaXMuZ2V0TmV3TGlzdChhcmdzKSlcbiAgfVxuXG4gIHNvcnRBcmd1bWVudHNJblRleHRCeSh0ZXh0LCBmbikge1xuICAgIGNvbnN0IHN0YXJ0ID0gdGV4dC5zZWFyY2goL1xcUy8pXG4gICAgY29uc3QgZW5kID0gdGV4dC5zZWFyY2goL1xccyokLylcbiAgICBjb25zdCBsZWFkaW5nU3BhY2VzID0gc3RhcnQgIT09IC0xID8gdGV4dC5zbGljZSgwLCBzdGFydCkgOiBcIlwiXG4gICAgY29uc3QgdHJhaWxpbmdTcGFjZXMgPSBlbmQgIT09IC0xID8gdGV4dC5zbGljZShlbmQpIDogXCJcIlxuICAgIGNvbnN0IGFsbFRva2VucyA9IHRoaXMudXRpbHMuc3BsaXRBcmd1bWVudHModGV4dC5zbGljZShzdGFydCwgZW5kKSlcbiAgICBjb25zdCBhcmdzID0gYWxsVG9rZW5zLmZpbHRlcih0b2tlbiA9PiB0b2tlbi50eXBlID09PSBcImFyZ3VtZW50XCIpLm1hcCh0b2tlbiA9PiB0b2tlbi50ZXh0KVxuICAgIGNvbnN0IG5ld0FyZ3MgPSBmbihhcmdzKVxuXG4gICAgbGV0IG5ld1RleHQgPSBcIlwiXG4gICAgd2hpbGUgKGFsbFRva2Vucy5sZW5ndGgpIHtcbiAgICAgIGNvbnN0IHRva2VuID0gYWxsVG9rZW5zLnNoaWZ0KClcbiAgICAgIC8vIHRva2VuLnR5cGUgaXMgXCJzZXBhcmF0b3JcIiBvciBcImFyZ3VtZW50XCJcbiAgICAgIG5ld1RleHQgKz0gdG9rZW4udHlwZSA9PT0gXCJzZXBhcmF0b3JcIiA/IHRva2VuLnRleHQgOiBuZXdBcmdzLnNoaWZ0KClcbiAgICB9XG4gICAgcmV0dXJuIGxlYWRpbmdTcGFjZXMgKyBuZXdUZXh0ICsgdHJhaWxpbmdTcGFjZXNcbiAgfVxufVxuQ2hhbmdlT3JkZXIucmVnaXN0ZXIoZmFsc2UpXG5cbmNsYXNzIFJldmVyc2UgZXh0ZW5kcyBDaGFuZ2VPcmRlciB7XG4gIGdldE5ld0xpc3Qocm93cykge1xuICAgIHJldHVybiByb3dzLnJldmVyc2UoKVxuICB9XG59XG5SZXZlcnNlLnJlZ2lzdGVyKClcblxuY2xhc3MgUmV2ZXJzZUlubmVyQW55UGFpciBleHRlbmRzIFJldmVyc2Uge1xuICB0YXJnZXQgPSBcIklubmVyQW55UGFpclwiXG59XG5SZXZlcnNlSW5uZXJBbnlQYWlyLnJlZ2lzdGVyKClcblxuY2xhc3MgUm90YXRlIGV4dGVuZHMgQ2hhbmdlT3JkZXIge1xuICBiYWNrd2FyZHMgPSBmYWxzZVxuICBnZXROZXdMaXN0KHJvd3MpIHtcbiAgICBpZiAodGhpcy5iYWNrd2FyZHMpIHJvd3MucHVzaChyb3dzLnNoaWZ0KCkpXG4gICAgZWxzZSByb3dzLnVuc2hpZnQocm93cy5wb3AoKSlcbiAgICByZXR1cm4gcm93c1xuICB9XG59XG5Sb3RhdGUucmVnaXN0ZXIoKVxuXG5jbGFzcyBSb3RhdGVCYWNrd2FyZHMgZXh0ZW5kcyBDaGFuZ2VPcmRlciB7XG4gIGJhY2t3YXJkcyA9IHRydWVcbn1cblJvdGF0ZUJhY2t3YXJkcy5yZWdpc3RlcigpXG5cbmNsYXNzIFJvdGF0ZUFyZ3VtZW50c09mSW5uZXJQYWlyIGV4dGVuZHMgUm90YXRlIHtcbiAgdGFyZ2V0ID0gXCJJbm5lckFueVBhaXJcIlxufVxuUm90YXRlQXJndW1lbnRzT2ZJbm5lclBhaXIucmVnaXN0ZXIoKVxuXG5jbGFzcyBSb3RhdGVBcmd1bWVudHNCYWNrd2FyZHNPZklubmVyUGFpciBleHRlbmRzIFJvdGF0ZUFyZ3VtZW50c09mSW5uZXJQYWlyIHtcbiAgYmFja3dhcmRzID0gdHJ1ZVxufVxuUm90YXRlQXJndW1lbnRzQmFja3dhcmRzT2ZJbm5lclBhaXIucmVnaXN0ZXIoKVxuXG5jbGFzcyBTb3J0IGV4dGVuZHMgQ2hhbmdlT3JkZXIge1xuICBnZXROZXdMaXN0KHJvd3MpIHtcbiAgICByZXR1cm4gcm93cy5zb3J0KClcbiAgfVxufVxuU29ydC5yZWdpc3RlcigpXG5cbmNsYXNzIFNvcnRDYXNlSW5zZW5zaXRpdmVseSBleHRlbmRzIENoYW5nZU9yZGVyIHtcbiAgZ2V0TmV3TGlzdChyb3dzKSB7XG4gICAgcmV0dXJuIHJvd3Muc29ydCgocm93QSwgcm93QikgPT4gcm93QS5sb2NhbGVDb21wYXJlKHJvd0IsIHtzZW5zaXRpdml0eTogXCJiYXNlXCJ9KSlcbiAgfVxufVxuU29ydENhc2VJbnNlbnNpdGl2ZWx5LnJlZ2lzdGVyKClcblxuY2xhc3MgU29ydEJ5TnVtYmVyIGV4dGVuZHMgQ2hhbmdlT3JkZXIge1xuICBnZXROZXdMaXN0KHJvd3MpIHtcbiAgICByZXR1cm4gXy5zb3J0Qnkocm93cywgcm93ID0+IE51bWJlci5wYXJzZUludChyb3cpIHx8IEluZmluaXR5KVxuICB9XG59XG5Tb3J0QnlOdW1iZXIucmVnaXN0ZXIoKVxuXG5jbGFzcyBOdW1iZXJpbmdMaW5lcyBleHRlbmRzIFRyYW5zZm9ybVN0cmluZyB7XG4gIHdpc2UgPSBcImxpbmV3aXNlXCJcblxuICBnZXROZXdUZXh0KHRleHQpIHtcbiAgICBjb25zdCByb3dzID0gdGhpcy51dGlscy5zcGxpdFRleHRCeU5ld0xpbmUodGV4dClcbiAgICBjb25zdCBsYXN0Um93V2lkdGggPSBTdHJpbmcocm93cy5sZW5ndGgpLmxlbmd0aFxuXG4gICAgY29uc3QgbmV3Um93cyA9IHJvd3MubWFwKChyb3dUZXh0LCBpKSA9PiB7XG4gICAgICBpKysgLy8gZml4IDAgc3RhcnQgaW5kZXggdG8gMSBzdGFydC5cbiAgICAgIGNvbnN0IGFtb3VudE9mUGFkZGluZyA9IHRoaXMudXRpbHMubGltaXROdW1iZXIobGFzdFJvd1dpZHRoIC0gU3RyaW5nKGkpLmxlbmd0aCwge21pbjogMH0pXG4gICAgICByZXR1cm4gXCIgXCIucmVwZWF0KGFtb3VudE9mUGFkZGluZykgKyBpICsgXCI6IFwiICsgcm93VGV4dFxuICAgIH0pXG4gICAgcmV0dXJuIG5ld1Jvd3Muam9pbihcIlxcblwiKSArIFwiXFxuXCJcbiAgfVxufVxuTnVtYmVyaW5nTGluZXMucmVnaXN0ZXIoKVxuXG5jbGFzcyBEdXBsaWNhdGVXaXRoQ29tbWVudE91dE9yaWdpbmFsIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nIHtcbiAgd2lzZSA9IFwibGluZXdpc2VcIlxuICBzdGF5QnlNYXJrZXIgPSB0cnVlXG4gIHN0YXlBdFNhbWVQb3NpdGlvbiA9IHRydWVcbiAgbXV0YXRlU2VsZWN0aW9uKHNlbGVjdGlvbikge1xuICAgIGNvbnN0IFtzdGFydFJvdywgZW5kUm93XSA9IHNlbGVjdGlvbi5nZXRCdWZmZXJSb3dSYW5nZSgpXG4gICAgc2VsZWN0aW9uLnNldEJ1ZmZlclJhbmdlKHRoaXMudXRpbHMuaW5zZXJ0VGV4dEF0QnVmZmVyUG9zaXRpb24odGhpcy5lZGl0b3IsIFtzdGFydFJvdywgMF0sIHNlbGVjdGlvbi5nZXRUZXh0KCkpKVxuICAgIHRoaXMuZWRpdG9yLnRvZ2dsZUxpbmVDb21tZW50c0ZvckJ1ZmZlclJvd3Moc3RhcnRSb3csIGVuZFJvdylcbiAgfVxufVxuRHVwbGljYXRlV2l0aENvbW1lbnRPdXRPcmlnaW5hbC5yZWdpc3RlcigpXG5cbi8vIHByZXR0aWVyLWlnbm9yZVxuY29uc3QgY2xhc3Nlc1RvUmVnaXN0ZXJUb1NlbGVjdExpc3QgPSBbXG4gIFRvZ2dsZUNhc2UsIFVwcGVyQ2FzZSwgTG93ZXJDYXNlLFxuICBSZXBsYWNlLCBTcGxpdEJ5Q2hhcmFjdGVyLFxuICBDYW1lbENhc2UsIFNuYWtlQ2FzZSwgUGFzY2FsQ2FzZSwgRGFzaENhc2UsIFRpdGxlQ2FzZSxcbiAgRW5jb2RlVXJpQ29tcG9uZW50LCBEZWNvZGVVcmlDb21wb25lbnQsXG4gIFRyaW1TdHJpbmcsIENvbXBhY3RTcGFjZXMsIFJlbW92ZUxlYWRpbmdXaGl0ZVNwYWNlcyxcbiAgQWxpZ25PY2N1cnJlbmNlLCBBbGlnbk9jY3VycmVuY2VCeVBhZExlZnQsIEFsaWduT2NjdXJyZW5jZUJ5UGFkUmlnaHQsXG4gIENvbnZlcnRUb1NvZnRUYWIsIENvbnZlcnRUb0hhcmRUYWIsXG4gIEpvaW5UYXJnZXQsIEpvaW4sIEpvaW5XaXRoS2VlcGluZ1NwYWNlLCBKb2luQnlJbnB1dCwgSm9pbkJ5SW5wdXRXaXRoS2VlcGluZ1NwYWNlLFxuICBTcGxpdFN0cmluZywgU3BsaXRTdHJpbmdXaXRoS2VlcGluZ1NwbGl0dGVyLFxuICBTcGxpdEFyZ3VtZW50cywgU3BsaXRBcmd1bWVudHNXaXRoUmVtb3ZlU2VwYXJhdG9yLCBTcGxpdEFyZ3VtZW50c09mSW5uZXJBbnlQYWlyLFxuICBSZXZlcnNlLCBSb3RhdGUsIFJvdGF0ZUJhY2t3YXJkcywgU29ydCwgU29ydENhc2VJbnNlbnNpdGl2ZWx5LCBTb3J0QnlOdW1iZXIsXG4gIE51bWJlcmluZ0xpbmVzLFxuICBEdXBsaWNhdGVXaXRoQ29tbWVudE91dE9yaWdpbmFsLFxuXVxuXG5mb3IgKGNvbnN0IGtsYXNzIG9mIGNsYXNzZXNUb1JlZ2lzdGVyVG9TZWxlY3RMaXN0KSB7XG4gIGtsYXNzLnJlZ2lzdGVyVG9TZWxlY3RMaXN0KClcbn1cbiJdfQ==