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
      if (this.target.is("CurrentSelection")) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL29wZXJhdG9yLXRyYW5zZm9ybS1zdHJpbmcuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsV0FBVyxDQUFBOzs7Ozs7Ozs7Ozs7Ozs7O0FBRVgsSUFBTSxDQUFDLEdBQUcsT0FBTyxDQUFDLGlCQUFpQixDQUFDLENBQUE7O2VBQ0gsT0FBTyxDQUFDLE1BQU0sQ0FBQzs7SUFBekMsZUFBZSxZQUFmLGVBQWU7SUFBRSxLQUFLLFlBQUwsS0FBSzs7QUFFN0IsSUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFBO0FBQzlCLElBQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUE7Ozs7O0lBSXBDLGVBQWU7WUFBZixlQUFlOztXQUFmLGVBQWU7MEJBQWYsZUFBZTs7K0JBQWYsZUFBZTs7U0FFbkIsV0FBVyxHQUFHLElBQUk7U0FDbEIsY0FBYyxHQUFHLHVCQUF1QjtTQUN4QyxVQUFVLEdBQUcsS0FBSztTQUNsQixpQkFBaUIsR0FBRyxLQUFLO1NBQ3pCLHlCQUF5QixHQUFHLEtBQUs7OztlQU43QixlQUFlOztXQVlKLHlCQUFDLFNBQVMsRUFBRTtBQUN6QixVQUFNLElBQUksR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxTQUFTLENBQUMsQ0FBQTtBQUM1RCxVQUFJLElBQUksRUFBRTtBQUNSLFlBQUksbUJBQW1CLFlBQUEsQ0FBQTtBQUN2QixZQUFJLElBQUksQ0FBQyx5QkFBeUIsRUFBRTtBQUNsQyxjQUFNLFFBQVEsR0FBRyxTQUFTLENBQUMsY0FBYyxFQUFFLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQTtBQUNyRCw2QkFBbUIsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLHVCQUF1QixDQUFDLFFBQVEsQ0FBQyxDQUFBO1NBQ3BFO0FBQ0QsWUFBSSxL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QStCLENBQ2hDLENBQUE7O0FBRUQsS0FBSyxJQUFNLEtBQUssSUFBSSw2QkFBNkIsRUFBRTtBQUNqRCxPQUFLLENBQUMsb0JBQW9CLEVBQUUsQ0FBQTtDQUM3QiIsImZpbGUiOiIvVXNlcnMvdGxhbmRhdS9kb3RmaWxlcy8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi9vcGVyYXRvci10cmFuc2Zvcm0tc3RyaW5nLmpzIiwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2UgYmFiZWxcIlxuXG5jb25zdCBfID0gcmVxdWlyZShcInVuZGVyc2NvcmUtcGx1c1wiKVxuY29uc3Qge0J1ZmZlcmVkUHJvY2VzcywgUmFuZ2V9ID0gcmVxdWlyZShcImF0b21cIilcblxuY29uc3QgQmFzZSA9IHJlcXVpcmUoXCIuL2Jhc2VcIilcbmNvbnN0IE9wZXJhdG9yID0gQmFzZS5nZXRDbGFzcyhcIk9wZXJhdG9yXCIpXG5cbi8vIFRyYW5zZm9ybVN0cmluZ1xuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIFRyYW5zZm9ybVN0cmluZyBleHRlbmRzIE9wZXJhdG9yIHtcbiAgc3RhdGljIHN0cmluZ1RyYW5zZm9ybWVycyA9IFtdXG4gIHRyYWNrQ2hhbmdlID0gdHJ1ZVxuICBzdGF5T3B0aW9uTmFtZSA9IFwic3RheU9uVHJhbnNmb3JtU3RyaW5nXCJcbiAgYXV0b0luZGVudCA9IGZhbHNlXG4gIGF1dG9JbmRlbnROZXdsaW5lID0gZmFsc2VcbiAgYXV0b0luZGVudEFmdGVySW5zZXJ0VGV4dCA9IGZhbHNlXG5cbiAgc3RhdGljIHJlZ2lzdGVyVG9TZWxlY3RMaXN0KCkge1xuICAgIHRoaXMuc3RyaW5nVHJhbnNmb3JtZXJzLnB1c2godGhpcylcbiAgfVxuXG4gIG11dGF0ZVNlbGVjdGlvbihzZWxlY3Rpb24pIHtcbiAgICBjb25zdCB0ZXh0ID0gdGhpcy5nZXROZXdUZXh0KHNlbGVjdGlvbi5nZXRUZXh0KCksIHNlbGVjdGlvbilcbiAgICBpZiAodGV4dCkge1xuICAgICAgbGV0IHN0YXJ0Um93SW5kZW50TGV2ZWxcbiAgICAgIGlmICh0aGlzLmF1dG9JbmRlbnRBZnRlckluc2VydFRleHQpIHtcbiAgICAgICAgY29uc3Qgc3RhcnRSb3cgPSBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKS5zdGFydC5yb3dcbiAgICAgICAgc3RhcnRSb3dJbmRlbnRMZXZlbCA9IHRoaXMuZWRpdG9yLmluZGVudGF0aW9uRm9yQnVmZmVyUm93KHN0YXJ0Um93KVxuICAgICAgfVxuICAgICAgbGV0IHJhbmdlID0gc2VsZWN0aW9uLmluc2VydFRleHQodGV4dCwge2F1dG9JbmRlbnQ6IHRoaXMuYXV0b0luZGVudCwgYXV0b0luZGVudE5ld2xpbmU6IHRoaXMuYXV0b0luZGVudE5ld2xpbmV9KVxuXG4gICAgICBpZiAodGhpcy5hdXRvSW5kZW50QWZ0ZXJJbnNlcnRUZXh0KSB7XG4gICAgICAgIC8vIEN1cnJlbnRseSB1c2VkIGJ5IFNwbGl0QXJndW1lbnRzIGFuZCBTdXJyb3VuZCggbGluZXdpc2UgdGFyZ2V0IG9ubHkgKVxuICAgICAgICBpZiAodGhpcy50YXJnZXQuaXNMaW5ld2lzZSgpKSB7XG4gICAgICAgICAgcmFuZ2UgPSByYW5nZS50cmFuc2xhdGUoWzAsIDBdLCBbLTEsIDBdKVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuZWRpdG9yLnNldEluZGVudGF0aW9uRm9yQnVmZmVyUm93KHJhbmdlLnN0YXJ0LnJvdywgc3RhcnRSb3dJbmRlbnRMZXZlbClcbiAgICAgICAgdGhpcy5lZGl0b3Iuc2V0SW5kZW50YXRpb25Gb3JCdWZmZXJSb3cocmFuZ2UuZW5kLnJvdywgc3RhcnRSb3dJbmRlbnRMZXZlbClcbiAgICAgICAgLy8gQWRqdXN0IGlubmVyIHJhbmdlLCBlbmQucm93IGlzIGFscmVhZHkoIGlmIG5lZWRlZCApIHRyYW5zbGF0ZWQgc28gbm8gbmVlZCB0byByZS10cmFuc2xhdGUuXG4gICAgICAgIHRoaXMudXRpbHMuYWRqdXN0SW5kZW50V2l0aEtlZXBpbmdMYXlvdXQodGhpcy5lZGl0b3IsIHJhbmdlLnRyYW5zbGF0ZShbMSwgMF0sIFswLCAwXSkpXG4gICAgICB9XG4gICAgfVxuICB9XG59XG5UcmFuc2Zvcm1TdHJpbmcucmVnaXN0ZXIoZmFsc2UpXG5cbmNsYXNzIFRvZ2dsZUNhc2UgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmcge1xuICBzdGF0aWMgZGlzcGxheU5hbWUgPSBcIlRvZ2dsZSB+XCJcblxuICBnZXROZXdUZXh0KHRleHQpIHtcbiAgICByZXR1cm4gdGV4dC5yZXBsYWNlKC8uL2csIHRoaXMudXRpbHMudG9nZ2xlQ2FzZUZvckNoYXJhY3RlcilcbiAgfVxufVxuVG9nZ2xlQ2FzZS5yZWdpc3RlcigpXG5cbmNsYXNzIFRvZ2dsZUNhc2VBbmRNb3ZlUmlnaHQgZXh0ZW5kcyBUb2dnbGVDYXNlIHtcbiAgZmxhc2hUYXJnZXQgPSBmYWxzZVxuICByZXN0b3JlUG9zaXRpb25zID0gZmFsc2VcbiAgdGFyZ2V0ID0gXCJNb3ZlUmlnaHRcIlxufVxuVG9nZ2xlQ2FzZUFuZE1vdmVSaWdodC5yZWdpc3RlcigpXG5cbmNsYXNzIFVwcGVyQ2FzZSBleHRlbmRzIFRyYW5zZm9ybVN0cmluZyB7XG4gIHN0YXRpYyBkaXNwbGF5TmFtZSA9IFwiVXBwZXJcIlxuXG4gIGdldE5ld1RleHQodGV4dCkge1xuICAgIHJldHVybiB0ZXh0LnRvVXBwZXJDYXNlKClcbiAgfVxufVxuVXBwZXJDYXNlLnJlZ2lzdGVyKClcblxuY2xhc3MgTG93ZXJDYXNlIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nIHtcbiAgc3RhdGljIGRpc3BsYXlOYW1lID0gXCJMb3dlclwiXG5cbiAgZ2V0TmV3VGV4dCh0ZXh0KSB7XG4gICAgcmV0dXJuIHRleHQudG9Mb3dlckNhc2UoKVxuICB9XG59XG5Mb3dlckNhc2UucmVnaXN0ZXIoKVxuXG4vLyBSZXBsYWNlXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBSZXBsYWNlIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nIHtcbiAgZmxhc2hDaGVja3BvaW50ID0gXCJkaWQtc2VsZWN0LW9jY3VycmVuY2VcIlxuICBhdXRvSW5kZW50TmV3bGluZSA9IHRydWVcbiAgcmVhZElucHV0QWZ0ZXJFeGVjdXRlID0gdHJ1ZVxuXG4gIGdldE5ld1RleHQodGV4dCkge1xuICAgIGlmICh0aGlzLnRhcmdldC5pcyhcIk1vdmVSaWdodEJ1ZmZlckNvbHVtblwiKSAmJiB0ZXh0Lmxlbmd0aCAhPT0gdGhpcy5nZXRDb3VudCgpKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBjb25zdCBpbnB1dCA9IHRoaXMuaW5wdXQgfHwgXCJcXG5cIlxuICAgIGlmIChpbnB1dCA9PT0gXCJcXG5cIikge1xuICAgICAgdGhpcy5yZXN0b3JlUG9zaXRpb25zID0gZmFsc2VcbiAgICB9XG4gICAgcmV0dXJuIHRleHQucmVwbGFjZSgvLi9nLCBpbnB1dClcbiAgfVxufVxuUmVwbGFjZS5yZWdpc3RlcigpXG5cbmNsYXNzIFJlcGxhY2VDaGFyYWN0ZXIgZXh0ZW5kcyBSZXBsYWNlIHtcbiAgdGFyZ2V0ID0gXCJNb3ZlUmlnaHRCdWZmZXJDb2x1bW5cIlxufVxuUmVwbGFjZUNoYXJhY3Rlci5yZWdpc3RlcigpXG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIERVUCBtZWFuaW5nIHdpdGggU3BsaXRTdHJpbmcgbmVlZCBjb25zb2xpZGF0ZS5cbmNsYXNzIFNwbGl0QnlDaGFyYWN0ZXIgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmcge1xuICBnZXROZXdUZXh0KHRleHQpIHtcbiAgICByZXR1cm4gdGV4dC5zcGxpdChcIlwiKS5qb2luKFwiIFwiKVxuICB9XG59XG5TcGxpdEJ5Q2hhcmFjdGVyLnJlZ2lzdGVyKClcblxuY2xhc3MgQ2FtZWxDYXNlIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nIHtcbiAgc3RhdGljIGRpc3BsYXlOYW1lID0gXCJDYW1lbGl6ZVwiXG4gIGdldE5ld1RleHQodGV4dCkge1xuICAgIHJldHVybiBfLmNhbWVsaXplKHRleHQpXG4gIH1cbn1cbkNhbWVsQ2FzZS5yZWdpc3RlcigpXG5cbmNsYXNzIFNuYWtlQ2FzZSBleHRlbmRzIFRyYW5zZm9ybVN0cmluZyB7XG4gIHN0YXRpYyBkaXNwbGF5TmFtZSA9IFwiVW5kZXJzY29yZSBfXCJcbiAgZ2V0TmV3VGV4dCh0ZXh0KSB7XG4gICAgcmV0dXJuIF8udW5kZXJzY29yZSh0ZXh0KVxuICB9XG59XG5TbmFrZUNhc2UucmVnaXN0ZXIoKVxuXG5jbGFzcyBQYXNjYWxDYXNlIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nIHtcbiAgc3RhdGljIGRpc3BsYXlOYW1lID0gXCJQYXNjYWxpemVcIlxuICBnZXROZXdUZXh0KHRleHQpIHtcbiAgICByZXR1cm4gXy5jYXBpdGFsaXplKF8uY2FtZWxpemUodGV4dCkpXG4gIH1cbn1cblBhc2NhbENhc2UucmVnaXN0ZXIoKVxuXG5jbGFzcyBEYXNoQ2FzZSBleHRlbmRzIFRyYW5zZm9ybVN0cmluZyB7XG4gIHN0YXRpYyBkaXNwbGF5TmFtZSA9IFwiRGFzaGVyaXplIC1cIlxuICBnZXROZXdUZXh0KHRleHQpIHtcbiAgICByZXR1cm4gXy5kYXNoZXJpemUodGV4dClcbiAgfVxufVxuRGFzaENhc2UucmVnaXN0ZXIoKVxuXG5jbGFzcyBUaXRsZUNhc2UgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmcge1xuICBzdGF0aWMgZGlzcGxheU5hbWUgPSBcIlRpdGxpemVcIlxuICBnZXROZXdUZXh0KHRleHQpIHtcbiAgICByZXR1cm4gXy5odW1hbml6ZUV2ZW50TmFtZShfLmRhc2hlcml6ZSh0ZXh0KSlcbiAgfVxufVxuVGl0bGVDYXNlLnJlZ2lzdGVyKClcblxuY2xhc3MgRW5jb2RlVXJpQ29tcG9uZW50IGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nIHtcbiAgc3RhdGljIGRpc3BsYXlOYW1lID0gXCJFbmNvZGUgVVJJIENvbXBvbmVudCAlXCJcbiAgZ2V0TmV3VGV4dCh0ZXh0KSB7XG4gICAgcmV0dXJuIGVuY29kZVVSSUNvbXBvbmVudCh0ZXh0KVxuICB9XG59XG5FbmNvZGVVcmlDb21wb25lbnQucmVnaXN0ZXIoKVxuXG5jbGFzcyBEZWNvZGVVcmlDb21wb25lbnQgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmcge1xuICBzdGF0aWMgZGlzcGxheU5hbWUgPSBcIkRlY29kZSBVUkkgQ29tcG9uZW50ICUlXCJcbiAgZ2V0TmV3VGV4dCh0ZXh0KSB7XG4gICAgcmV0dXJuIGRlY29kZVVSSUNvbXBvbmVudCh0ZXh0KVxuICB9XG59XG5EZWNvZGVVcmlDb21wb25lbnQucmVnaXN0ZXIoKVxuXG5jbGFzcyBUcmltU3RyaW5nIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nIHtcbiAgc3RhdGljIGRpc3BsYXlOYW1lID0gXCJUcmltIHN0cmluZ1wiXG4gIGdldE5ld1RleHQodGV4dCkge1xuICAgIHJldHVybiB0ZXh0LnRyaW0oKVxuICB9XG59XG5UcmltU3RyaW5nLnJlZ2lzdGVyKClcblxuY2xhc3MgQ29tcGFjdFNwYWNlcyBleHRlbmRzIFRyYW5zZm9ybVN0cmluZyB7XG4gIHN0YXRpYyBkaXNwbGF5TmFtZSA9IFwiQ29tcGFjdCBzcGFjZVwiXG4gIGdldE5ld1RleHQodGV4dCkge1xuICAgIGlmICh0ZXh0Lm1hdGNoKC9eWyBdKyQvKSkge1xuICAgICAgcmV0dXJuIFwiIFwiXG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIERvbid0IGNvbXBhY3QgZm9yIGxlYWRpbmcgYW5kIHRyYWlsaW5nIHdoaXRlIHNwYWNlcy5cbiAgICAgIGNvbnN0IHJlZ2V4ID0gL14oXFxzKikoLio/KShcXHMqKSQvZ21cbiAgICAgIHJldHVybiB0ZXh0LnJlcGxhY2UocmVnZXgsIChtLCBsZWFkaW5nLCBtaWRkbGUsIHRyYWlsaW5nKSA9PiB7XG4gICAgICAgIHJldHVybiBsZWFkaW5nICsgbWlkZGxlLnNwbGl0KC9bIFxcdF0rLykuam9pbihcIiBcIikgKyB0cmFpbGluZ1xuICAgICAgfSlcbiAgICB9XG4gIH1cbn1cbkNvbXBhY3RTcGFjZXMucmVnaXN0ZXIoKVxuXG5jbGFzcyBBbGlnbk9jY3VycmVuY2UgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmcge1xuICBvY2N1cnJlbmNlID0gdHJ1ZVxuICB3aGljaFRvUGFkID0gXCJhdXRvXCJcblxuICBnZXRTZWxlY3Rpb25UYWtlcigpIHtcbiAgICBjb25zdCBzZWxlY3Rpb25zQnlSb3cgPSBfLmdyb3VwQnkoXG4gICAgICB0aGlzLmVkaXRvci5nZXRTZWxlY3Rpb25zT3JkZXJlZEJ5QnVmZmVyUG9zaXRpb24oKSxcbiAgICAgIHNlbGVjdGlvbiA9PiBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKS5zdGFydC5yb3dcbiAgICApXG5cbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgY29uc3Qgcm93cyA9IE9iamVjdC5rZXlzKHNlbGVjdGlvbnNCeVJvdylcbiAgICAgIGNvbnN0IHNlbGVjdGlvbnMgPSByb3dzLm1hcChyb3cgPT4gc2VsZWN0aW9uc0J5Um93W3Jvd10uc2hpZnQoKSkuZmlsdGVyKHMgPT4gcylcbiAgICAgIHJldHVybiBzZWxlY3Rpb25zXG4gICAgfVxuICB9XG5cbiAgZ2V0V2ljaFRvUGFkRm9yVGV4dCh0ZXh0KSB7XG4gICAgaWYgKHRoaXMud2hpY2hUb1BhZCAhPT0gXCJhdXRvXCIpIHJldHVybiB0aGlzLndoaWNoVG9QYWRcblxuICAgIGlmICgvXlxccypbPVxcfF1cXHMqJC8udGVzdCh0ZXh0KSkge1xuICAgICAgLy8gQXNpZ25tZW50KD0pIGFuZCBgfGAobWFya2Rvd24tdGFibGUgc2VwYXJhdG9yKVxuICAgICAgcmV0dXJuIFwic3RhcnRcIlxuICAgIH0gZWxzZSBpZiAoL15cXHMqLFxccyokLy50ZXN0KHRleHQpKSB7XG4gICAgICAvLyBBcmd1bWVudHNcbiAgICAgIHJldHVybiBcImVuZFwiXG4gICAgfSBlbHNlIGlmICgvXFxXJC8udGVzdCh0ZXh0KSkge1xuICAgICAgLy8gZW5kcyB3aXRoIG5vbi13b3JkLWNoYXJcbiAgICAgIHJldHVybiBcImVuZFwiXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBcInN0YXJ0XCJcbiAgICB9XG4gIH1cblxuICBjYWxjdWxhdGVQYWRkaW5nKCkge1xuICAgIGNvbnN0IHRvdGFsQW1vdW50T2ZQYWRkaW5nQnlSb3cgPSB7fVxuICAgIGNvbnN0IGNvbHVtbkZvclNlbGVjdGlvbiA9IHNlbGVjdGlvbiA9PiB7XG4gICAgICBjb25zdCB3aGljaCA9IHRoaXMuZ2V0V2ljaFRvUGFkRm9yVGV4dChzZWxlY3Rpb24uZ2V0VGV4dCgpKVxuICAgICAgY29uc3QgcG9pbnQgPSBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKVt3aGljaF1cbiAgICAgIHJldHVybiBwb2ludC5jb2x1bW4gKyAodG90YWxBbW91bnRPZlBhZGRpbmdCeVJvd1twb2ludC5yb3ddIHx8IDApXG4gICAgfVxuXG4gICAgY29uc3QgdGFrZVNlbGVjdGlvbnMgPSB0aGlzLmdldFNlbGVjdGlvblRha2VyKClcbiAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgY29uc3Qgc2VsZWN0aW9ucyA9IHRha2VTZWxlY3Rpb25zKClcbiAgICAgIGlmICghc2VsZWN0aW9ucy5sZW5ndGgpIHJldHVyblxuICAgICAgY29uc3QgbWF4Q29sdW1uID0gc2VsZWN0aW9ucy5tYXAoY29sdW1uRm9yU2VsZWN0aW9uKS5yZWR1Y2UoKG1heCwgY3VyKSA9PiAoY3VyID4gbWF4ID8gY3VyIDogbWF4KSlcbiAgICAgIGZvciAoY29uc3Qgc2VsZWN0aW9uIG9mIHNlbGVjdGlvbnMpIHtcbiAgICAgICAgY29uc3Qgcm93ID0gc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKCkuc3RhcnQucm93XG4gICAgICAgIGNvbnN0IGFtb3VudE9mUGFkZGluZyA9IG1heENvbHVtbiAtIGNvbHVtbkZvclNlbGVjdGlvbihzZWxlY3Rpb24pXG4gICAgICAgIHRvdGFsQW1vdW50T2ZQYWRkaW5nQnlSb3dbcm93XSA9ICh0b3RhbEFtb3VudE9mUGFkZGluZ0J5Um93W3Jvd10gfHwgMCkgKyBhbW91bnRPZlBhZGRpbmdcbiAgICAgICAgdGhpcy5hbW91bnRPZlBhZGRpbmdCeVNlbGVjdGlvbi5zZXQoc2VsZWN0aW9uLCBhbW91bnRPZlBhZGRpbmcpXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZXhlY3V0ZSgpIHtcbiAgICB0aGlzLmFtb3VudE9mUGFkZGluZ0J5U2VsZWN0aW9uID0gbmV3IE1hcCgpXG4gICAgdGhpcy5vbkRpZFNlbGVjdFRhcmdldCgoKSA9PiB7XG4gICAgICB0aGlzLmNhbGN1bGF0ZVBhZGRpbmcoKVxuICAgIH0pXG4gICAgc3VwZXIuZXhlY3V0ZSgpXG4gIH1cblxuICBnZXROZXdUZXh0KHRleHQsIHNlbGVjdGlvbikge1xuICAgIGNvbnN0IHBhZGRpbmcgPSBcIiBcIi5yZXBlYXQodGhpcy5hbW91bnRPZlBhZGRpbmdCeVNlbGVjdGlvbi5nZXQoc2VsZWN0aW9uKSlcbiAgICBjb25zdCB3aGljaFRvUGFkID0gdGhpcy5nZXRXaWNoVG9QYWRGb3JUZXh0KHNlbGVjdGlvbi5nZXRUZXh0KCkpXG4gICAgcmV0dXJuIHdoaWNoVG9QYWQgPT09IFwic3RhcnRcIiA/IHBhZGRpbmcgKyB0ZXh0IDogdGV4dCArIHBhZGRpbmdcbiAgfVxufVxuQWxpZ25PY2N1cnJlbmNlLnJlZ2lzdGVyKClcblxuY2xhc3MgQWxpZ25PY2N1cnJlbmNlQnlQYWRMZWZ0IGV4dGVuZHMgQWxpZ25PY2N1cnJlbmNlIHtcbiAgd2hpY2hUb1BhZCA9IFwic3RhcnRcIlxufVxuQWxpZ25PY2N1cnJlbmNlQnlQYWRMZWZ0LnJlZ2lzdGVyKClcblxuY2xhc3MgQWxpZ25PY2N1cnJlbmNlQnlQYWRSaWdodCBleHRlbmRzIEFsaWduT2NjdXJyZW5jZSB7XG4gIHdoaWNoVG9QYWQgPSBcImVuZFwiXG59XG5BbGlnbk9jY3VycmVuY2VCeVBhZFJpZ2h0LnJlZ2lzdGVyKClcblxuY2xhc3MgUmVtb3ZlTGVhZGluZ1doaXRlU3BhY2VzIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nIHtcbiAgd2lzZSA9IFwibGluZXdpc2VcIlxuICBnZXROZXdUZXh0KHRleHQsIHNlbGVjdGlvbikge1xuICAgIGNvbnN0IHRyaW1MZWZ0ID0gdGV4dCA9PiB0ZXh0LnRyaW1MZWZ0KClcbiAgICByZXR1cm4gKFxuICAgICAgdGhpcy51dGlsc1xuICAgICAgICAuc3BsaXRUZXh0QnlOZXdMaW5lKHRleHQpXG4gICAgICAgIC5tYXAodHJpbUxlZnQpXG4gICAgICAgIC5qb2luKFwiXFxuXCIpICsgXCJcXG5cIlxuICAgIClcbiAgfVxufVxuUmVtb3ZlTGVhZGluZ1doaXRlU3BhY2VzLnJlZ2lzdGVyKClcblxuY2xhc3MgQ29udmVydFRvU29mdFRhYiBleHRlbmRzIFRyYW5zZm9ybVN0cmluZyB7XG4gIHN0YXRpYyBkaXNwbGF5TmFtZSA9IFwiU29mdCBUYWJcIlxuICB3aXNlID0gXCJsaW5ld2lzZVwiXG5cbiAgbXV0YXRlU2VsZWN0aW9uKHNlbGVjdGlvbikge1xuICAgIHJldHVybiB0aGlzLnNjYW5Gb3J3YXJkKC9cXHQvZywge3NjYW5SYW5nZTogc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKCl9LCAoe3JhbmdlLCByZXBsYWNlfSkgPT4ge1xuICAgICAgLy8gUmVwbGFjZSBcXHQgdG8gc3BhY2VzIHdoaWNoIGxlbmd0aCBpcyB2YXJ5IGRlcGVuZGluZyBvbiB0YWJTdG9wIGFuZCB0YWJMZW5naHRcbiAgICAgIC8vIFNvIHdlIGRpcmVjdGx5IGNvbnN1bHQgaXQncyBzY3JlZW4gcmVwcmVzZW50aW5nIGxlbmd0aC5cbiAgICAgIGNvbnN0IGxlbmd0aCA9IHRoaXMuZWRpdG9yLnNjcmVlblJhbmdlRm9yQnVmZmVyUmFuZ2UocmFuZ2UpLmdldEV4dGVudCgpLmNvbHVtblxuICAgICAgcmV0dXJuIHJlcGxhY2UoXCIgXCIucmVwZWF0KGxlbmd0aCkpXG4gICAgfSlcbiAgfVxufVxuQ29udmVydFRvU29mdFRhYi5yZWdpc3RlcigpXG5cbmNsYXNzIENvbnZlcnRUb0hhcmRUYWIgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmcge1xuICBzdGF0aWMgZGlzcGxheU5hbWUgPSBcIkhhcmQgVGFiXCJcblxuICBtdXRhdGVTZWxlY3Rpb24oc2VsZWN0aW9uKSB7XG4gICAgY29uc3QgdGFiTGVuZ3RoID0gdGhpcy5lZGl0b3IuZ2V0VGFiTGVuZ3RoKClcbiAgICB0aGlzLnNjYW5Gb3J3YXJkKC9bIFxcdF0rL2csIHtzY2FuUmFuZ2U6IHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpfSwgKHtyYW5nZSwgcmVwbGFjZX0pID0+IHtcbiAgICAgIGNvbnN0IHtzdGFydCwgZW5kfSA9IHRoaXMuZWRpdG9yLnNjcmVlblJhbmdlRm9yQnVmZmVyUmFuZ2UocmFuZ2UpXG4gICAgICBsZXQgc3RhcnRDb2x1bW4gPSBzdGFydC5jb2x1bW5cbiAgICAgIGNvbnN0IGVuZENvbHVtbiA9IGVuZC5jb2x1bW5cblxuICAgICAgLy8gV2UgY2FuJ3QgbmFpdmVseSByZXBsYWNlIHNwYWNlcyB0byB0YWIsIHdlIGhhdmUgdG8gY29uc2lkZXIgdmFsaWQgdGFiU3RvcCBjb2x1bW5cbiAgICAgIC8vIElmIG5leHRUYWJTdG9wIGNvbHVtbiBleGNlZWRzIHJlcGxhY2FibGUgcmFuZ2UsIHdlIHBhZCB3aXRoIHNwYWNlcy5cbiAgICAgIGxldCBuZXdUZXh0ID0gXCJcIlxuICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgY29uc3QgcmVtYWluZGVyID0gc3RhcnRDb2x1bW4gJSB0YWJMZW5ndGhcbiAgICAgICAgY29uc3QgbmV4dFRhYlN0b3AgPSBzdGFydENvbHVtbiArIChyZW1haW5kZXIgPT09IDAgPyB0YWJMZW5ndGggOiByZW1haW5kZXIpXG4gICAgICAgIGlmIChuZXh0VGFiU3RvcCA+IGVuZENvbHVtbikge1xuICAgICAgICAgIG5ld1RleHQgKz0gXCIgXCIucmVwZWF0KGVuZENvbHVtbiAtIHN0YXJ0Q29sdW1uKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG5ld1RleHQgKz0gXCJcXHRcIlxuICAgICAgICB9XG4gICAgICAgIHN0YXJ0Q29sdW1uID0gbmV4dFRhYlN0b3BcbiAgICAgICAgaWYgKHN0YXJ0Q29sdW1uID49IGVuZENvbHVtbikge1xuICAgICAgICAgIGJyZWFrXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmVwbGFjZShuZXdUZXh0KVxuICAgIH0pXG4gIH1cbn1cbkNvbnZlcnRUb0hhcmRUYWIucmVnaXN0ZXIoKVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBUcmFuc2Zvcm1TdHJpbmdCeUV4dGVybmFsQ29tbWFuZCBleHRlbmRzIFRyYW5zZm9ybVN0cmluZyB7XG4gIGF1dG9JbmRlbnQgPSB0cnVlXG4gIGNvbW1hbmQgPSBcIlwiIC8vIGUuZy4gY29tbWFuZDogJ3NvcnQnXG4gIGFyZ3MgPSBbXSAvLyBlLmcgYXJnczogWyctcm4nXVxuXG4gIC8vIE5PVEU6IFVubGlrZSBvdGhlciBjbGFzcywgZmlyc3QgYXJnIGlzIGBzdGRvdXRgIG9mIGV4dGVybmFsIGNvbW1hbmRzLlxuICBnZXROZXdUZXh0KHRleHQsIHNlbGVjdGlvbikge1xuICAgIHJldHVybiB0ZXh0IHx8IHNlbGVjdGlvbi5nZXRUZXh0KClcbiAgfVxuICBnZXRDb21tYW5kKHNlbGVjdGlvbikge1xuICAgIHJldHVybiB7Y29tbWFuZDogdGhpcy5jb21tYW5kLCBhcmdzOiB0aGlzLmFyZ3N9XG4gIH1cbiAgZ2V0U3RkaW4oc2VsZWN0aW9uKSB7XG4gICAgcmV0dXJuIHNlbGVjdGlvbi5nZXRUZXh0KClcbiAgfVxuXG4gIGFzeW5jIGV4ZWN1dGUoKSB7XG4gICAgdGhpcy5ub3JtYWxpemVTZWxlY3Rpb25zSWZOZWNlc3NhcnkoKVxuICAgIHRoaXMuY3JlYXRlQnVmZmVyQ2hlY2twb2ludChcInVuZG9cIilcblxuICAgIGlmICh0aGlzLnNlbGVjdFRhcmdldCgpKSB7XG4gICAgICBmb3IgKGNvbnN0IHNlbGVjdGlvbiBvZiB0aGlzLmVkaXRvci5nZXRTZWxlY3Rpb25zKCkpIHtcbiAgICAgICAgY29uc3Qge2NvbW1hbmQsIGFyZ3N9ID0gdGhpcy5nZXRDb21tYW5kKHNlbGVjdGlvbikgfHwge31cbiAgICAgICAgaWYgKGNvbW1hbmQgPT0gbnVsbCB8fCBhcmdzID09IG51bGwpIGNvbnRpbnVlXG5cbiAgICAgICAgY29uc3Qgc3Rkb3V0ID0gYXdhaXQgdGhpcy5ydW5FeHRlcm5hbENvbW1hbmQoe2NvbW1hbmQsIGFyZ3MsIHN0ZGluOiB0aGlzLmdldFN0ZGluKHNlbGVjdGlvbil9KVxuICAgICAgICBzZWxlY3Rpb24uaW5zZXJ0VGV4dCh0aGlzLmdldE5ld1RleHQoc3Rkb3V0LCBzZWxlY3Rpb24pLCB7YXV0b0luZGVudDogdGhpcy5hdXRvSW5kZW50fSlcbiAgICAgIH1cbiAgICAgIHRoaXMubXV0YXRpb25NYW5hZ2VyLnNldENoZWNrcG9pbnQoXCJkaWQtZmluaXNoXCIpXG4gICAgICB0aGlzLnJlc3RvcmVDdXJzb3JQb3NpdGlvbnNJZk5lY2Vzc2FyeSgpXG4gICAgICB0aGlzLmdyb3VwQ2hhbmdlc1NpbmNlQnVmZmVyQ2hlY2twb2ludChcInVuZG9cIilcbiAgICB9XG4gICAgdGhpcy5lbWl0RGlkRmluaXNoTXV0YXRpb24oKVxuICAgIHRoaXMuYWN0aXZhdGVNb2RlKFwibm9ybWFsXCIpXG4gIH1cblxuICBydW5FeHRlcm5hbENvbW1hbmQob3B0aW9ucykge1xuICAgIGxldCBvdXRwdXQgPSBcIlwiXG4gICAgb3B0aW9ucy5zdGRvdXQgPSBkYXRhID0+IChvdXRwdXQgKz0gZGF0YSlcbiAgICBjb25zdCBleGl0UHJvbWlzZSA9IG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgICAgb3B0aW9ucy5leGl0ID0gKCkgPT4gcmVzb2x2ZShvdXRwdXQpXG4gICAgfSlcbiAgICBjb25zdCB7c3RkaW59ID0gb3B0aW9uc1xuICAgIGRlbGV0ZSBvcHRpb25zLnN0ZGluXG4gICAgY29uc3QgYnVmZmVyZWRQcm9jZXNzID0gbmV3IEJ1ZmZlcmVkUHJvY2VzcyhvcHRpb25zKVxuICAgIGJ1ZmZlcmVkUHJvY2Vzcy5vbldpbGxUaHJvd0Vycm9yKCh7ZXJyb3IsIGhhbmRsZX0pID0+IHtcbiAgICAgIC8vIFN1cHByZXNzIGNvbW1hbmQgbm90IGZvdW5kIGVycm9yIGludGVudGlvbmFsbHkuXG4gICAgICBpZiAoZXJyb3IuY29kZSA9PT0gXCJFTk9FTlRcIiAmJiBlcnJvci5zeXNjYWxsLmluZGV4T2YoXCJzcGF3blwiKSA9PT0gMCkge1xuICAgICAgICBjb25zb2xlLmxvZyhgJHt0aGlzLmdldENvbW1hbmROYW1lKCl9OiBGYWlsZWQgdG8gc3Bhd24gY29tbWFuZCAke2Vycm9yLnBhdGh9LmApXG4gICAgICAgIGhhbmRsZSgpXG4gICAgICB9XG4gICAgICB0aGlzLmNhbmNlbE9wZXJhdGlvbigpXG4gICAgfSlcblxuICAgIGlmIChzdGRpbikge1xuICAgICAgYnVmZmVyZWRQcm9jZXNzLnByb2Nlc3Muc3RkaW4ud3JpdGUoc3RkaW4pXG4gICAgICBidWZmZXJlZFByb2Nlc3MucHJvY2Vzcy5zdGRpbi5lbmQoKVxuICAgIH1cbiAgICByZXR1cm4gZXhpdFByb21pc2VcbiAgfVxufVxuVHJhbnNmb3JtU3RyaW5nQnlFeHRlcm5hbENvbW1hbmQucmVnaXN0ZXIoZmFsc2UpXG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIFRyYW5zZm9ybVN0cmluZ0J5U2VsZWN0TGlzdCBleHRlbmRzIFRyYW5zZm9ybVN0cmluZyB7XG4gIGlzUmVhZHkoKSB7XG4gICAgLy8gVGhpcyBjb21tYW5kIGlzIGp1c3QgZ2F0ZSB0byBleGVjdXRlIGFub3RoZXIgb3BlcmF0b3IuXG4gICAgLy8gU28gbmV2ZXIgZ2V0IHJlYWR5IGFuZCBuZXZlciBiZSBleGVjdXRlZC5cbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIGluaXRpYWxpemUoKSB7XG4gICAgdGhpcy5mb2N1c1NlbGVjdExpc3Qoe2l0ZW1zOiB0aGlzLmNvbnN0cnVjdG9yLmdldFNlbGVjdExpc3RJdGVtcygpfSlcbiAgICB0aGlzLnZpbVN0YXRlLm9uRGlkQ29uZmlybVNlbGVjdExpc3QoaXRlbSA9PiB7XG4gICAgICB0aGlzLnZpbVN0YXRlLnJlc2V0KClcbiAgICAgIHRoaXMudmltU3RhdGUub3BlcmF0aW9uU3RhY2sucnVuKGl0ZW0ua2xhc3MsIHt0YXJnZXQ6IHRoaXMudGFyZ2V0fSlcbiAgICB9KVxuICB9XG5cbiAgc3RhdGljIGdldFNlbGVjdExpc3RJdGVtcygpIHtcbiAgICBpZiAoIXRoaXMuc2VsZWN0TGlzdEl0ZW1zKSB7XG4gICAgICB0aGlzLnNlbGVjdExpc3RJdGVtcyA9IHRoaXMuc3RyaW5nVHJhbnNmb3JtZXJzLm1hcChrbGFzcyA9PiAoe1xuICAgICAgICBrbGFzczoga2xhc3MsXG4gICAgICAgIGRpc3BsYXlOYW1lOiBrbGFzcy5oYXNPd25Qcm9wZXJ0eShcImRpc3BsYXlOYW1lXCIpXG4gICAgICAgICAgPyBrbGFzcy5kaXNwbGF5TmFtZVxuICAgICAgICAgIDogXy5odW1hbml6ZUV2ZW50TmFtZShfLmRhc2hlcml6ZShrbGFzcy5uYW1lKSksXG4gICAgICB9KSlcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuc2VsZWN0TGlzdEl0ZW1zXG4gIH1cblxuICBleGVjdXRlKCkge1xuICAgIHRocm93IG5ldyBFcnJvcihgJHt0aGlzLm5hbWV9IHNob3VsZCBub3QgYmUgZXhlY3V0ZWRgKVxuICB9XG59XG5UcmFuc2Zvcm1TdHJpbmdCeVNlbGVjdExpc3QucmVnaXN0ZXIoKVxuXG5jbGFzcyBUcmFuc2Zvcm1Xb3JkQnlTZWxlY3RMaXN0IGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nQnlTZWxlY3RMaXN0IHtcbiAgdGFyZ2V0ID0gXCJJbm5lcldvcmRcIlxufVxuVHJhbnNmb3JtV29yZEJ5U2VsZWN0TGlzdC5yZWdpc3RlcigpXG5cbmNsYXNzIFRyYW5zZm9ybVNtYXJ0V29yZEJ5U2VsZWN0TGlzdCBleHRlbmRzIFRyYW5zZm9ybVN0cmluZ0J5U2VsZWN0TGlzdCB7XG4gIHRhcmdldCA9IFwiSW5uZXJTbWFydFdvcmRcIlxufVxuVHJhbnNmb3JtU21hcnRXb3JkQnlTZWxlY3RMaXN0LnJlZ2lzdGVyKClcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgUmVwbGFjZVdpdGhSZWdpc3RlciBleHRlbmRzIFRyYW5zZm9ybVN0cmluZyB7XG4gIGZsYXNoVHlwZSA9IFwib3BlcmF0b3ItbG9uZ1wiXG5cbiAgaW5pdGlhbGl6ZSgpIHtcbiAgICB0aGlzLnZpbVN0YXRlLnNlcXVlbnRpYWxQYXN0ZU1hbmFnZXIub25Jbml0aWFsaXplKHRoaXMpXG4gICAgc3VwZXIuaW5pdGlhbGl6ZSgpXG4gIH1cblxuICBleGVjdXRlKCkge1xuICAgIHRoaXMuc2VxdWVudGlhbFBhc3RlID0gdGhpcy52aW1TdGF0ZS5zZXF1ZW50aWFsUGFzdGVNYW5hZ2VyLm9uRXhlY3V0ZSh0aGlzKVxuXG4gICAgc3VwZXIuZXhlY3V0ZSgpXG5cbiAgICBmb3IgKGNvbnN0IHNlbGVjdGlvbiBvZiB0aGlzLmVkaXRvci5nZXRTZWxlY3Rpb25zKCkpIHtcbiAgICAgIGNvbnN0IHJhbmdlID0gdGhpcy5tdXRhdGlvbk1hbmFnZXIuZ2V0TXV0YXRlZEJ1ZmZlclJhbmdlRm9yU2VsZWN0aW9uKHNlbGVjdGlvbilcbiAgICAgIHRoaXMudmltU3RhdGUuc2VxdWVudGlhbFBhc3RlTWFuYWdlci5zYXZlUGFzdGVkUmFuZ2VGb3JTZWxlY3Rpb24oc2VsZWN0aW9uLCByYW5nZSlcbiAgICB9XG4gIH1cblxuICBnZXROZXdUZXh0KHRleHQsIHNlbGVjdGlvbikge1xuICAgIGNvbnN0IHZhbHVlID0gdGhpcy52aW1TdGF0ZS5yZWdpc3Rlci5nZXQobnVsbCwgc2VsZWN0aW9uLCB0aGlzLnNlcXVlbnRpYWxQYXN0ZSlcbiAgICByZXR1cm4gdmFsdWUgPyB2YWx1ZS50ZXh0IDogXCJcIlxuICB9XG59XG5SZXBsYWNlV2l0aFJlZ2lzdGVyLnJlZ2lzdGVyKClcblxuY2xhc3MgUmVwbGFjZU9jY3VycmVuY2VXaXRoUmVnaXN0ZXIgZXh0ZW5kcyBSZXBsYWNlV2l0aFJlZ2lzdGVyIHtcbiAgb2NjdXJyZW5jZSA9IHRydWVcbn1cblJlcGxhY2VPY2N1cnJlbmNlV2l0aFJlZ2lzdGVyLnJlZ2lzdGVyKClcblxuLy8gU2F2ZSB0ZXh0IHRvIHJlZ2lzdGVyIGJlZm9yZSByZXBsYWNlXG5jbGFzcyBTd2FwV2l0aFJlZ2lzdGVyIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nIHtcbiAgZ2V0TmV3VGV4dCh0ZXh0LCBzZWxlY3Rpb24pIHtcbiAgICBjb25zdCBuZXdUZXh0ID0gdGhpcy52aW1TdGF0ZS5yZWdpc3Rlci5nZXRUZXh0KClcbiAgICB0aGlzLnNldFRleHRUb1JlZ2lzdGVyKHRleHQsIHNlbGVjdGlvbilcbiAgICByZXR1cm4gbmV3VGV4dFxuICB9XG59XG5Td2FwV2l0aFJlZ2lzdGVyLnJlZ2lzdGVyKClcblxuLy8gSW5kZW50IDwgVHJhbnNmb3JtU3RyaW5nXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBJbmRlbnQgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmcge1xuICBzdGF5QnlNYXJrZXIgPSB0cnVlXG4gIHNldFRvRmlyc3RDaGFyYWN0ZXJPbkxpbmV3aXNlID0gdHJ1ZVxuICB3aXNlID0gXCJsaW5ld2lzZVwiXG5cbiAgbXV0YXRlU2VsZWN0aW9uKHNlbGVjdGlvbikge1xuICAgIC8vIE5lZWQgY291bnQgdGltZXMgaW5kZW50YXRpb24gaW4gdmlzdWFsLW1vZGUgYW5kIGl0cyByZXBlYXQoYC5gKS5cbiAgICBpZiAodGhpcy50YXJnZXQuaXMoXCJDdXJyZW50U2VsZWN0aW9uXCIpKSB7XG4gICAgICBsZXQgb2xkVGV4dFxuICAgICAgLy8gbGltaXQgdG8gMTAwIHRvIGF2b2lkIGZyZWV6aW5nIGJ5IGFjY2lkZW50YWwgYmlnIG51bWJlci5cbiAgICAgIGNvbnN0IGNvdW50ID0gdGhpcy51dGlscy5saW1pdE51bWJlcih0aGlzLmdldENvdW50KCksIHttYXg6IDEwMH0pXG4gICAgICB0aGlzLmNvdW50VGltZXMoY291bnQsICh7c3RvcH0pID0+IHtcbiAgICAgICAgb2xkVGV4dCA9IHNlbGVjdGlvbi5nZXRUZXh0KClcbiAgICAgICAgdGhpcy5pbmRlbnQoc2VsZWN0aW9uKVxuICAgICAgICBpZiAoc2VsZWN0aW9uLmdldFRleHQoKSA9PT0gb2xkVGV4dCkgc3RvcCgpXG4gICAgICB9KVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmluZGVudChzZWxlY3Rpb24pXG4gICAgfVxuICB9XG5cbiAgaW5kZW50KHNlbGVjdGlvbikge1xuICAgIHNlbGVjdGlvbi5pbmRlbnRTZWxlY3RlZFJvd3MoKVxuICB9XG59XG5JbmRlbnQucmVnaXN0ZXIoKVxuXG5jbGFzcyBPdXRkZW50IGV4dGVuZHMgSW5kZW50IHtcbiAgaW5kZW50KHNlbGVjdGlvbikge1xuICAgIHNlbGVjdGlvbi5vdXRkZW50U2VsZWN0ZWRSb3dzKClcbiAgfVxufVxuT3V0ZGVudC5yZWdpc3RlcigpXG5cbmNsYXNzIEF1dG9JbmRlbnQgZXh0ZW5kcyBJbmRlbnQge1xuICBpbmRlbnQoc2VsZWN0aW9uKSB7XG4gICAgc2VsZWN0aW9uLmF1dG9JbmRlbnRTZWxlY3RlZFJvd3MoKVxuICB9XG59XG5BdXRvSW5kZW50LnJlZ2lzdGVyKClcblxuY2xhc3MgVG9nZ2xlTGluZUNvbW1lbnRzIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nIHtcbiAgZmxhc2hUYXJnZXQgPSBmYWxzZVxuICBzdGF5QnlNYXJrZXIgPSB0cnVlXG4gIHN0YXlBdFNhbWVQb3NpdGlvbiA9IHRydWVcbiAgd2lzZSA9IFwibGluZXdpc2VcIlxuXG4gIG11dGF0ZVNlbGVjdGlvbihzZWxlY3Rpb24pIHtcbiAgICBzZWxlY3Rpb24udG9nZ2xlTGluZUNvbW1lbnRzKClcbiAgfVxufVxuVG9nZ2xlTGluZUNvbW1lbnRzLnJlZ2lzdGVyKClcblxuY2xhc3MgUmVmbG93IGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nIHtcbiAgbXV0YXRlU2VsZWN0aW9uKHNlbGVjdGlvbikge1xuICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2godGhpcy5lZGl0b3JFbGVtZW50LCBcImF1dG9mbG93OnJlZmxvdy1zZWxlY3Rpb25cIilcbiAgfVxufVxuUmVmbG93LnJlZ2lzdGVyKClcblxuY2xhc3MgUmVmbG93V2l0aFN0YXkgZXh0ZW5kcyBSZWZsb3cge1xuICBzdGF5QXRTYW1lUG9zaXRpb24gPSB0cnVlXG59XG5SZWZsb3dXaXRoU3RheS5yZWdpc3RlcigpXG5cbi8vIFN1cnJvdW5kIDwgVHJhbnNmb3JtU3RyaW5nXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBTdXJyb3VuZEJhc2UgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmcge1xuICBzdXJyb3VuZEFjdGlvbiA9IG51bGxcbiAgcGFpcnMgPSBbW1wiKFwiLCBcIilcIl0sIFtcIntcIiwgXCJ9XCJdLCBbXCJbXCIsIFwiXVwiXSwgW1wiPFwiLCBcIj5cIl1dXG4gIHBhaXJzQnlBbGlhcyA9IHtcbiAgICBiOiBbXCIoXCIsIFwiKVwiXSxcbiAgICBCOiBbXCJ7XCIsIFwifVwiXSxcbiAgICByOiBbXCJbXCIsIFwiXVwiXSxcbiAgICBhOiBbXCI8XCIsIFwiPlwiXSxcbiAgfVxuXG4gIGdldFBhaXIoY2hhcikge1xuICAgIHJldHVybiBjaGFyIGluIHRoaXMucGFpcnNCeUFsaWFzXG4gICAgICA/IHRoaXMucGFpcnNCeUFsaWFzW2NoYXJdXG4gICAgICA6IFsuLi50aGlzLnBhaXJzLCBbY2hhciwgY2hhcl1dLmZpbmQocGFpciA9PiBwYWlyLmluY2x1ZGVzKGNoYXIpKVxuICB9XG5cbiAgc3Vycm91bmQodGV4dCwgY2hhciwge2tlZXBMYXlvdXQgPSBmYWxzZX0gPSB7fSkge1xuICAgIGxldCBbb3BlbiwgY2xvc2VdID0gdGhpcy5nZXRQYWlyKGNoYXIpXG4gICAgaWYgKCFrZWVwTGF5b3V0ICYmIHRleHQuZW5kc1dpdGgoXCJcXG5cIikpIHtcbiAgICAgIHRoaXMuYXV0b0luZGVudEFmdGVySW5zZXJ0VGV4dCA9IHRydWVcbiAgICAgIG9wZW4gKz0gXCJcXG5cIlxuICAgICAgY2xvc2UgKz0gXCJcXG5cIlxuICAgIH1cblxuICAgIGlmICh0aGlzLmdldENvbmZpZyhcImNoYXJhY3RlcnNUb0FkZFNwYWNlT25TdXJyb3VuZFwiKS5pbmNsdWRlcyhjaGFyKSAmJiB0aGlzLnV0aWxzLmlzU2luZ2xlTGluZVRleHQodGV4dCkpIHtcbiAgICAgIHRleHQgPSBcIiBcIiArIHRleHQgKyBcIiBcIlxuICAgIH1cblxuICAgIHJldHVybiBvcGVuICsgdGV4dCArIGNsb3NlXG4gIH1cblxuICBkZWxldGVTdXJyb3VuZCh0ZXh0KSB7XG4gICAgLy8gQXNzdW1lIHN1cnJvdW5kaW5nIGNoYXIgaXMgb25lLWNoYXIgbGVuZ3RoLlxuICAgIGNvbnN0IG9wZW4gPSB0ZXh0WzBdXG4gICAgY29uc3QgY2xvc2UgPSB0ZXh0W3RleHQubGVuZ3RoIC0gMV1cbiAgICBjb25zdCBpbm5lclRleHQgPSB0ZXh0LnNsaWNlKDEsIHRleHQubGVuZ3RoIC0gMSlcbiAgICByZXR1cm4gdGhpcy51dGlscy5pc1NpbmdsZUxpbmVUZXh0KHRleHQpICYmIG9wZW4gIT09IGNsb3NlID8gaW5uZXJUZXh0LnRyaW0oKSA6IGlubmVyVGV4dFxuICB9XG5cbiAgZ2V0TmV3VGV4dCh0ZXh0KSB7XG4gICAgaWYgKHRoaXMuc3Vycm91bmRBY3Rpb24gPT09IFwic3Vycm91bmRcIikge1xuICAgICAgcmV0dXJuIHRoaXMuc3Vycm91bmQodGV4dCwgdGhpcy5pbnB1dClcbiAgICB9IGVsc2UgaWYgKHRoaXMuc3Vycm91bmRBY3Rpb24gPT09IFwiZGVsZXRlLXN1cnJvdW5kXCIpIHtcbiAgICAgIHJldHVybiB0aGlzLmRlbGV0ZVN1cnJvdW5kKHRleHQpXG4gICAgfSBlbHNlIGlmICh0aGlzLnN1cnJvdW5kQWN0aW9uID09PSBcImNoYW5nZS1zdXJyb3VuZFwiKSB7XG4gICAgICByZXR1cm4gdGhpcy5zdXJyb3VuZCh0aGlzLmRlbGV0ZVN1cnJvdW5kKHRleHQpLCB0aGlzLmlucHV0LCB7a2VlcExheW91dDogdHJ1ZX0pXG4gICAgfVxuICB9XG59XG5TdXJyb3VuZEJhc2UucmVnaXN0ZXIoZmFsc2UpXG5cbmNsYXNzIFN1cnJvdW5kIGV4dGVuZHMgU3Vycm91bmRCYXNlIHtcbiAgc3Vycm91bmRBY3Rpb24gPSBcInN1cnJvdW5kXCJcbiAgcmVhZElucHV0QWZ0ZXJFeGVjdXRlID0gdHJ1ZVxufVxuU3Vycm91bmQucmVnaXN0ZXIoKVxuXG5jbGFzcyBTdXJyb3VuZFdvcmQgZXh0ZW5kcyBTdXJyb3VuZCB7XG4gIHRhcmdldCA9IFwiSW5uZXJXb3JkXCJcbn1cblN1cnJvdW5kV29yZC5yZWdpc3RlcigpXG5cbmNsYXNzIFN1cnJvdW5kU21hcnRXb3JkIGV4dGVuZHMgU3Vycm91bmQge1xuICB0YXJnZXQgPSBcIklubmVyU21hcnRXb3JkXCJcbn1cblN1cnJvdW5kU21hcnRXb3JkLnJlZ2lzdGVyKClcblxuY2xhc3MgTWFwU3Vycm91bmQgZXh0ZW5kcyBTdXJyb3VuZCB7XG4gIG9jY3VycmVuY2UgPSB0cnVlXG4gIHBhdHRlcm5Gb3JPY2N1cnJlbmNlID0gL1xcdysvZ1xufVxuTWFwU3Vycm91bmQucmVnaXN0ZXIoKVxuXG4vLyBEZWxldGUgU3Vycm91bmRcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIERlbGV0ZVN1cnJvdW5kIGV4dGVuZHMgU3Vycm91bmRCYXNlIHtcbiAgc3Vycm91bmRBY3Rpb24gPSBcImRlbGV0ZS1zdXJyb3VuZFwiXG4gIGluaXRpYWxpemUoKSB7XG4gICAgaWYgKCF0aGlzLnRhcmdldCkge1xuICAgICAgdGhpcy5mb2N1c0lucHV0KHtcbiAgICAgICAgb25Db25maXJtOiBjaGFyID0+IHtcbiAgICAgICAgICB0aGlzLnNldFRhcmdldCh0aGlzLmdldEluc3RhbmNlKFwiQVBhaXJcIiwge3BhaXI6IHRoaXMuZ2V0UGFpcihjaGFyKX0pKVxuICAgICAgICAgIHRoaXMucHJvY2Vzc09wZXJhdGlvbigpXG4gICAgICAgIH0sXG4gICAgICB9KVxuICAgIH1cbiAgICBzdXBlci5pbml0aWFsaXplKClcbiAgfVxufVxuRGVsZXRlU3Vycm91bmQucmVnaXN0ZXIoKVxuXG5jbGFzcyBEZWxldGVTdXJyb3VuZEFueVBhaXIgZXh0ZW5kcyBEZWxldGVTdXJyb3VuZCB7XG4gIHRhcmdldCA9IFwiQUFueVBhaXJcIlxufVxuRGVsZXRlU3Vycm91bmRBbnlQYWlyLnJlZ2lzdGVyKClcblxuY2xhc3MgRGVsZXRlU3Vycm91bmRBbnlQYWlyQWxsb3dGb3J3YXJkaW5nIGV4dGVuZHMgRGVsZXRlU3Vycm91bmRBbnlQYWlyIHtcbiAgdGFyZ2V0ID0gXCJBQW55UGFpckFsbG93Rm9yd2FyZGluZ1wiXG59XG5EZWxldGVTdXJyb3VuZEFueVBhaXJBbGxvd0ZvcndhcmRpbmcucmVnaXN0ZXIoKVxuXG4vLyBDaGFuZ2UgU3Vycm91bmRcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIENoYW5nZVN1cnJvdW5kIGV4dGVuZHMgRGVsZXRlU3Vycm91bmQge1xuICBzdXJyb3VuZEFjdGlvbiA9IFwiY2hhbmdlLXN1cnJvdW5kXCJcbiAgcmVhZElucHV0QWZ0ZXJFeGVjdXRlID0gdHJ1ZVxuXG4gIC8vIE92ZXJyaWRlIHRvIHNob3cgY2hhbmdpbmcgY2hhciBvbiBob3ZlclxuICBhc3luYyBmb2N1c0lucHV0UHJvbWlzaWZpZWQoLi4uYXJncykge1xuICAgIGNvbnN0IGhvdmVyUG9pbnQgPSB0aGlzLm11dGF0aW9uTWFuYWdlci5nZXRJbml0aWFsUG9pbnRGb3JTZWxlY3Rpb24odGhpcy5lZGl0b3IuZ2V0TGFzdFNlbGVjdGlvbigpKVxuICAgIHRoaXMudmltU3RhdGUuaG92ZXIuc2V0KHRoaXMuZWRpdG9yLmdldFNlbGVjdGVkVGV4dCgpWzBdLCBob3ZlclBvaW50KVxuICAgIHJldHVybiBzdXBlci5mb2N1c0lucHV0UHJvbWlzaWZpZWQoLi4uYXJncylcbiAgfVxufVxuQ2hhbmdlU3Vycm91bmQucmVnaXN0ZXIoKVxuXG5jbGFzcyBDaGFuZ2VTdXJyb3VuZEFueVBhaXIgZXh0ZW5kcyBDaGFuZ2VTdXJyb3VuZCB7XG4gIHRhcmdldCA9IFwiQUFueVBhaXJcIlxufVxuQ2hhbmdlU3Vycm91bmRBbnlQYWlyLnJlZ2lzdGVyKClcblxuY2xhc3MgQ2hhbmdlU3Vycm91bmRBbnlQYWlyQWxsb3dGb3J3YXJkaW5nIGV4dGVuZHMgQ2hhbmdlU3Vycm91bmRBbnlQYWlyIHtcbiAgdGFyZ2V0ID0gXCJBQW55UGFpckFsbG93Rm9yd2FyZGluZ1wiXG59XG5DaGFuZ2VTdXJyb3VuZEFueVBhaXJBbGxvd0ZvcndhcmRpbmcucmVnaXN0ZXIoKVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBGSVhNRVxuLy8gQ3VycmVudGx5IG5hdGl2ZSBlZGl0b3Iuam9pbkxpbmVzKCkgaXMgYmV0dGVyIGZvciBjdXJzb3IgcG9zaXRpb24gc2V0dGluZ1xuLy8gU28gSSB1c2UgbmF0aXZlIG1ldGhvZHMgZm9yIGEgbWVhbndoaWxlLlxuY2xhc3MgSm9pblRhcmdldCBleHRlbmRzIFRyYW5zZm9ybVN0cmluZyB7XG4gIGZsYXNoVGFyZ2V0ID0gZmFsc2VcbiAgcmVzdG9yZVBvc2l0aW9ucyA9IGZhbHNlXG5cbiAgbXV0YXRlU2VsZWN0aW9uKHNlbGVjdGlvbikge1xuICAgIGNvbnN0IHJhbmdlID0gc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKClcblxuICAgIC8vIFdoZW4gY3Vyc29yIGlzIGF0IGxhc3QgQlVGRkVSIHJvdywgaXQgc2VsZWN0IGxhc3QtYnVmZmVyLXJvdywgdGhlblxuICAgIC8vIGpvaW5uaW5nIHJlc3VsdCBpbiBcImNsZWFyIGxhc3QtYnVmZmVyLXJvdyB0ZXh0XCIuXG4gICAgLy8gSSBiZWxpZXZlIHRoaXMgaXMgQlVHIG9mIHVwc3RyZWFtIGF0b20tY29yZS4gZ3VhcmQgdGhpcyBzaXR1YXRpb24gaGVyZVxuICAgIGlmICghcmFuZ2UuaXNTaW5nbGVMaW5lKCkgfHwgcmFuZ2UuZW5kLnJvdyAhPT0gdGhpcy5lZGl0b3IuZ2V0TGFzdEJ1ZmZlclJvdygpKSB7XG4gICAgICBpZiAodGhpcy51dGlscy5pc0xpbmV3aXNlUmFuZ2UocmFuZ2UpKSB7XG4gICAgICAgIHNlbGVjdGlvbi5zZXRCdWZmZXJSYW5nZShyYW5nZS50cmFuc2xhdGUoWzAsIDBdLCBbLTEsIEluZmluaXR5XSkpXG4gICAgICB9XG4gICAgICBzZWxlY3Rpb24uam9pbkxpbmVzKClcbiAgICB9XG4gICAgY29uc3QgcG9pbnQgPSBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKS5lbmQudHJhbnNsYXRlKFswLCAtMV0pXG4gICAgcmV0dXJuIHNlbGVjdGlvbi5jdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24ocG9pbnQpXG4gIH1cbn1cbkpvaW5UYXJnZXQucmVnaXN0ZXIoKVxuXG5jbGFzcyBKb2luIGV4dGVuZHMgSm9pblRhcmdldCB7XG4gIHRhcmdldCA9IFwiTW92ZVRvUmVsYXRpdmVMaW5lXCJcbn1cbkpvaW4ucmVnaXN0ZXIoKVxuXG5jbGFzcyBKb2luQmFzZSBleHRlbmRzIFRyYW5zZm9ybVN0cmluZyB7XG4gIHdpc2UgPSBcImxpbmV3aXNlXCJcbiAgdHJpbSA9IGZhbHNlXG4gIHRhcmdldCA9IFwiTW92ZVRvUmVsYXRpdmVMaW5lTWluaW11bVR3b1wiXG5cbiAgZ2V0TmV3VGV4dCh0ZXh0KSB7XG4gICAgY29uc3QgcmVnZXggPSB0aGlzLnRyaW0gPyAvXFxyP1xcblsgXFx0XSovZyA6IC9cXHI/XFxuL2dcbiAgICByZXR1cm4gdGV4dC50cmltUmlnaHQoKS5yZXBsYWNlKHJlZ2V4LCB0aGlzLmlucHV0KSArIFwiXFxuXCJcbiAgfVxufVxuSm9pbkJhc2UucmVnaXN0ZXIoZmFsc2UpXG5cbmNsYXNzIEpvaW5XaXRoS2VlcGluZ1NwYWNlIGV4dGVuZHMgSm9pbkJhc2Uge1xuICBpbnB1dCA9IFwiXCJcbn1cbkpvaW5XaXRoS2VlcGluZ1NwYWNlLnJlZ2lzdGVyKClcblxuY2xhc3MgSm9pbkJ5SW5wdXQgZXh0ZW5kcyBKb2luQmFzZSB7XG4gIHJlYWRJbnB1dEFmdGVyRXhlY3V0ZSA9IHRydWVcbiAgZm9jdXNJbnB1dE9wdGlvbnMgPSB7Y2hhcnNNYXg6IDEwfVxuICB0cmltID0gdHJ1ZVxufVxuSm9pbkJ5SW5wdXQucmVnaXN0ZXIoKVxuXG5jbGFzcyBKb2luQnlJbnB1dFdpdGhLZWVwaW5nU3BhY2UgZXh0ZW5kcyBKb2luQnlJbnB1dCB7XG4gIHRyaW0gPSBmYWxzZVxufVxuSm9pbkJ5SW5wdXRXaXRoS2VlcGluZ1NwYWNlLnJlZ2lzdGVyKClcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gU3RyaW5nIHN1ZmZpeCBpbiBuYW1lIGlzIHRvIGF2b2lkIGNvbmZ1c2lvbiB3aXRoICdzcGxpdCcgd2luZG93LlxuY2xhc3MgU3BsaXRTdHJpbmcgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmcge1xuICB0YXJnZXQgPSBcIk1vdmVUb1JlbGF0aXZlTGluZVwiXG4gIGtlZXBTcGxpdHRlciA9IGZhbHNlXG4gIHJlYWRJbnB1dEFmdGVyRXhlY3V0ZSA9IHRydWVcbiAgZm9jdXNJbnB1dE9wdGlvbnMgPSB7Y2hhcnNNYXg6IDEwfVxuXG4gIGdldE5ld1RleHQodGV4dCkge1xuICAgIGNvbnN0IHJlZ2V4ID0gbmV3IFJlZ0V4cChfLmVzY2FwZVJlZ0V4cCh0aGlzLmlucHV0IHx8IFwiXFxcXG5cIiksIFwiZ1wiKVxuICAgIGNvbnN0IGxpbmVTZXBhcmF0b3IgPSAodGhpcy5rZWVwU3BsaXR0ZXIgPyB0aGlzLmlucHV0IDogXCJcIikgKyBcIlxcblwiXG4gICAgcmV0dXJuIHRleHQucmVwbGFjZShyZWdleCwgbGluZVNlcGFyYXRvcilcbiAgfVxufVxuU3BsaXRTdHJpbmcucmVnaXN0ZXIoKVxuXG5jbGFzcyBTcGxpdFN0cmluZ1dpdGhLZWVwaW5nU3BsaXR0ZXIgZXh0ZW5kcyBTcGxpdFN0cmluZyB7XG4gIGtlZXBTcGxpdHRlciA9IHRydWVcbn1cblNwbGl0U3RyaW5nV2l0aEtlZXBpbmdTcGxpdHRlci5yZWdpc3RlcigpXG5cbmNsYXNzIFNwbGl0QXJndW1lbnRzIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nIHtcbiAga2VlcFNlcGFyYXRvciA9IHRydWVcbiAgYXV0b0luZGVudEFmdGVySW5zZXJ0VGV4dCA9IHRydWVcblxuICBnZXROZXdUZXh0KHRleHQpIHtcbiAgICBjb25zdCBhbGxUb2tlbnMgPSB0aGlzLnV0aWxzLnNwbGl0QXJndW1lbnRzKHRleHQudHJpbSgpKVxuICAgIGxldCBuZXdUZXh0ID0gXCJcIlxuICAgIHdoaWxlIChhbGxUb2tlbnMubGVuZ3RoKSB7XG4gICAgICBjb25zdCB7dGV4dCwgdHlwZX0gPSBhbGxUb2tlbnMuc2hpZnQoKVxuICAgICAgbmV3VGV4dCArPSB0eXBlID09PSBcInNlcGFyYXRvclwiID8gKHRoaXMua2VlcFNlcGFyYXRvciA/IHRleHQudHJpbSgpIDogXCJcIikgKyBcIlxcblwiIDogdGV4dFxuICAgIH1cbiAgICByZXR1cm4gYFxcbiR7bmV3VGV4dH1cXG5gXG4gIH1cbn1cblNwbGl0QXJndW1lbnRzLnJlZ2lzdGVyKClcblxuY2xhc3MgU3BsaXRBcmd1bWVudHNXaXRoUmVtb3ZlU2VwYXJhdG9yIGV4dGVuZHMgU3BsaXRBcmd1bWVudHMge1xuICBrZWVwU2VwYXJhdG9yID0gZmFsc2Vcbn1cblNwbGl0QXJndW1lbnRzV2l0aFJlbW92ZVNlcGFyYXRvci5yZWdpc3RlcigpXG5cbmNsYXNzIFNwbGl0QXJndW1lbnRzT2ZJbm5lckFueVBhaXIgZXh0ZW5kcyBTcGxpdEFyZ3VtZW50cyB7XG4gIHRhcmdldCA9IFwiSW5uZXJBbnlQYWlyXCJcbn1cblNwbGl0QXJndW1lbnRzT2ZJbm5lckFueVBhaXIucmVnaXN0ZXIoKVxuXG5jbGFzcyBDaGFuZ2VPcmRlciBleHRlbmRzIFRyYW5zZm9ybVN0cmluZyB7XG4gIGdldE5ld1RleHQodGV4dCkge1xuICAgIHJldHVybiB0aGlzLnRhcmdldC5pc0xpbmV3aXNlKClcbiAgICAgID8gdGhpcy5nZXROZXdMaXN0KHRoaXMudXRpbHMuc3BsaXRUZXh0QnlOZXdMaW5lKHRleHQpKS5qb2luKFwiXFxuXCIpICsgXCJcXG5cIlxuICAgICAgOiB0aGlzLnNvcnRBcmd1bWVudHNJblRleHRCeSh0ZXh0LCBhcmdzID0+IHRoaXMuZ2V0TmV3TGlzdChhcmdzKSlcbiAgfVxuXG4gIHNvcnRBcmd1bWVudHNJblRleHRCeSh0ZXh0LCBmbikge1xuICAgIGNvbnN0IHN0YXJ0ID0gdGV4dC5zZWFyY2goL1xcUy8pXG4gICAgY29uc3QgZW5kID0gdGV4dC5zZWFyY2goL1xccyokLylcbiAgICBjb25zdCBsZWFkaW5nU3BhY2VzID0gc3RhcnQgIT09IC0xID8gdGV4dC5zbGljZSgwLCBzdGFydCkgOiBcIlwiXG4gICAgY29uc3QgdHJhaWxpbmdTcGFjZXMgPSBlbmQgIT09IC0xID8gdGV4dC5zbGljZShlbmQpIDogXCJcIlxuICAgIGNvbnN0IGFsbFRva2VucyA9IHRoaXMudXRpbHMuc3BsaXRBcmd1bWVudHModGV4dC5zbGljZShzdGFydCwgZW5kKSlcbiAgICBjb25zdCBhcmdzID0gYWxsVG9rZW5zLmZpbHRlcih0b2tlbiA9PiB0b2tlbi50eXBlID09PSBcImFyZ3VtZW50XCIpLm1hcCh0b2tlbiA9PiB0b2tlbi50ZXh0KVxuICAgIGNvbnN0IG5ld0FyZ3MgPSBmbihhcmdzKVxuXG4gICAgbGV0IG5ld1RleHQgPSBcIlwiXG4gICAgd2hpbGUgKGFsbFRva2Vucy5sZW5ndGgpIHtcbiAgICAgIGNvbnN0IHRva2VuID0gYWxsVG9rZW5zLnNoaWZ0KClcbiAgICAgIC8vIHRva2VuLnR5cGUgaXMgXCJzZXBhcmF0b3JcIiBvciBcImFyZ3VtZW50XCJcbiAgICAgIG5ld1RleHQgKz0gdG9rZW4udHlwZSA9PT0gXCJzZXBhcmF0b3JcIiA/IHRva2VuLnRleHQgOiBuZXdBcmdzLnNoaWZ0KClcbiAgICB9XG4gICAgcmV0dXJuIGxlYWRpbmdTcGFjZXMgKyBuZXdUZXh0ICsgdHJhaWxpbmdTcGFjZXNcbiAgfVxufVxuQ2hhbmdlT3JkZXIucmVnaXN0ZXIoZmFsc2UpXG5cbmNsYXNzIFJldmVyc2UgZXh0ZW5kcyBDaGFuZ2VPcmRlciB7XG4gIGdldE5ld0xpc3Qocm93cykge1xuICAgIHJldHVybiByb3dzLnJldmVyc2UoKVxuICB9XG59XG5SZXZlcnNlLnJlZ2lzdGVyKClcblxuY2xhc3MgUmV2ZXJzZUlubmVyQW55UGFpciBleHRlbmRzIFJldmVyc2Uge1xuICB0YXJnZXQgPSBcIklubmVyQW55UGFpclwiXG59XG5SZXZlcnNlSW5uZXJBbnlQYWlyLnJlZ2lzdGVyKClcblxuY2xhc3MgUm90YXRlIGV4dGVuZHMgQ2hhbmdlT3JkZXIge1xuICBiYWNrd2FyZHMgPSBmYWxzZVxuICBnZXROZXdMaXN0KHJvd3MpIHtcbiAgICBpZiAodGhpcy5iYWNrd2FyZHMpIHJvd3MucHVzaChyb3dzLnNoaWZ0KCkpXG4gICAgZWxzZSByb3dzLnVuc2hpZnQocm93cy5wb3AoKSlcbiAgICByZXR1cm4gcm93c1xuICB9XG59XG5Sb3RhdGUucmVnaXN0ZXIoKVxuXG5jbGFzcyBSb3RhdGVCYWNrd2FyZHMgZXh0ZW5kcyBDaGFuZ2VPcmRlciB7XG4gIGJhY2t3YXJkcyA9IHRydWVcbn1cblJvdGF0ZUJhY2t3YXJkcy5yZWdpc3RlcigpXG5cbmNsYXNzIFJvdGF0ZUFyZ3VtZW50c09mSW5uZXJQYWlyIGV4dGVuZHMgUm90YXRlIHtcbiAgdGFyZ2V0ID0gXCJJbm5lckFueVBhaXJcIlxufVxuUm90YXRlQXJndW1lbnRzT2ZJbm5lclBhaXIucmVnaXN0ZXIoKVxuXG5jbGFzcyBSb3RhdGVBcmd1bWVudHNCYWNrd2FyZHNPZklubmVyUGFpciBleHRlbmRzIFJvdGF0ZUFyZ3VtZW50c09mSW5uZXJQYWlyIHtcbiAgYmFja3dhcmRzID0gdHJ1ZVxufVxuUm90YXRlQXJndW1lbnRzQmFja3dhcmRzT2ZJbm5lclBhaXIucmVnaXN0ZXIoKVxuXG5jbGFzcyBTb3J0IGV4dGVuZHMgQ2hhbmdlT3JkZXIge1xuICBnZXROZXdMaXN0KHJvd3MpIHtcbiAgICByZXR1cm4gcm93cy5zb3J0KClcbiAgfVxufVxuU29ydC5yZWdpc3RlcigpXG5cbmNsYXNzIFNvcnRDYXNlSW5zZW5zaXRpdmVseSBleHRlbmRzIENoYW5nZU9yZGVyIHtcbiAgZ2V0TmV3TGlzdChyb3dzKSB7XG4gICAgcmV0dXJuIHJvd3Muc29ydCgocm93QSwgcm93QikgPT4gcm93QS5sb2NhbGVDb21wYXJlKHJvd0IsIHtzZW5zaXRpdml0eTogXCJiYXNlXCJ9KSlcbiAgfVxufVxuU29ydENhc2VJbnNlbnNpdGl2ZWx5LnJlZ2lzdGVyKClcblxuY2xhc3MgU29ydEJ5TnVtYmVyIGV4dGVuZHMgQ2hhbmdlT3JkZXIge1xuICBnZXROZXdMaXN0KHJvd3MpIHtcbiAgICByZXR1cm4gXy5zb3J0Qnkocm93cywgcm93ID0+IE51bWJlci5wYXJzZUludChyb3cpIHx8IEluZmluaXR5KVxuICB9XG59XG5Tb3J0QnlOdW1iZXIucmVnaXN0ZXIoKVxuXG5jbGFzcyBOdW1iZXJpbmdMaW5lcyBleHRlbmRzIFRyYW5zZm9ybVN0cmluZyB7XG4gIHdpc2UgPSBcImxpbmV3aXNlXCJcblxuICBnZXROZXdUZXh0KHRleHQpIHtcbiAgICBjb25zdCByb3dzID0gdGhpcy51dGlscy5zcGxpdFRleHRCeU5ld0xpbmUodGV4dClcbiAgICBjb25zdCBsYXN0Um93V2lkdGggPSBTdHJpbmcocm93cy5sZW5ndGgpLmxlbmd0aFxuXG4gICAgY29uc3QgbmV3Um93cyA9IHJvd3MubWFwKChyb3dUZXh0LCBpKSA9PiB7XG4gICAgICBpKysgLy8gZml4IDAgc3RhcnQgaW5kZXggdG8gMSBzdGFydC5cbiAgICAgIGNvbnN0IGFtb3VudE9mUGFkZGluZyA9IHRoaXMudXRpbHMubGltaXROdW1iZXIobGFzdFJvd1dpZHRoIC0gU3RyaW5nKGkpLmxlbmd0aCwge21pbjogMH0pXG4gICAgICByZXR1cm4gXCIgXCIucmVwZWF0KGFtb3VudE9mUGFkZGluZykgKyBpICsgXCI6IFwiICsgcm93VGV4dFxuICAgIH0pXG4gICAgcmV0dXJuIG5ld1Jvd3Muam9pbihcIlxcblwiKSArIFwiXFxuXCJcbiAgfVxufVxuTnVtYmVyaW5nTGluZXMucmVnaXN0ZXIoKVxuXG5jbGFzcyBEdXBsaWNhdGVXaXRoQ29tbWVudE91dE9yaWdpbmFsIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nIHtcbiAgd2lzZSA9IFwibGluZXdpc2VcIlxuICBzdGF5QnlNYXJrZXIgPSB0cnVlXG4gIHN0YXlBdFNhbWVQb3NpdGlvbiA9IHRydWVcbiAgbXV0YXRlU2VsZWN0aW9uKHNlbGVjdGlvbikge1xuICAgIGNvbnN0IFtzdGFydFJvdywgZW5kUm93XSA9IHNlbGVjdGlvbi5nZXRCdWZmZXJSb3dSYW5nZSgpXG4gICAgc2VsZWN0aW9uLnNldEJ1ZmZlclJhbmdlKHRoaXMudXRpbHMuaW5zZXJ0VGV4dEF0QnVmZmVyUG9zaXRpb24odGhpcy5lZGl0b3IsIFtzdGFydFJvdywgMF0sIHNlbGVjdGlvbi5nZXRUZXh0KCkpKVxuICAgIHRoaXMuZWRpdG9yLnRvZ2dsZUxpbmVDb21tZW50c0ZvckJ1ZmZlclJvd3Moc3RhcnRSb3csIGVuZFJvdylcbiAgfVxufVxuRHVwbGljYXRlV2l0aENvbW1lbnRPdXRPcmlnaW5hbC5yZWdpc3RlcigpXG5cbi8vIHByZXR0aWVyLWlnbm9yZVxuY29uc3QgY2xhc3Nlc1RvUmVnaXN0ZXJUb1NlbGVjdExpc3QgPSBbXG4gIFRvZ2dsZUNhc2UsIFVwcGVyQ2FzZSwgTG93ZXJDYXNlLFxuICBSZXBsYWNlLCBTcGxpdEJ5Q2hhcmFjdGVyLFxuICBDYW1lbENhc2UsIFNuYWtlQ2FzZSwgUGFzY2FsQ2FzZSwgRGFzaENhc2UsIFRpdGxlQ2FzZSxcbiAgRW5jb2RlVXJpQ29tcG9uZW50LCBEZWNvZGVVcmlDb21wb25lbnQsXG4gIFRyaW1TdHJpbmcsIENvbXBhY3RTcGFjZXMsIFJlbW92ZUxlYWRpbmdXaGl0ZVNwYWNlcyxcbiAgQWxpZ25PY2N1cnJlbmNlLCBBbGlnbk9jY3VycmVuY2VCeVBhZExlZnQsIEFsaWduT2NjdXJyZW5jZUJ5UGFkUmlnaHQsXG4gIENvbnZlcnRUb1NvZnRUYWIsIENvbnZlcnRUb0hhcmRUYWIsXG4gIEpvaW5UYXJnZXQsIEpvaW4sIEpvaW5XaXRoS2VlcGluZ1NwYWNlLCBKb2luQnlJbnB1dCwgSm9pbkJ5SW5wdXRXaXRoS2VlcGluZ1NwYWNlLFxuICBTcGxpdFN0cmluZywgU3BsaXRTdHJpbmdXaXRoS2VlcGluZ1NwbGl0dGVyLFxuICBTcGxpdEFyZ3VtZW50cywgU3BsaXRBcmd1bWVudHNXaXRoUmVtb3ZlU2VwYXJhdG9yLCBTcGxpdEFyZ3VtZW50c09mSW5uZXJBbnlQYWlyLFxuICBSZXZlcnNlLCBSb3RhdGUsIFJvdGF0ZUJhY2t3YXJkcywgU29ydCwgU29ydENhc2VJbnNlbnNpdGl2ZWx5LCBTb3J0QnlOdW1iZXIsXG4gIE51bWJlcmluZ0xpbmVzLFxuICBEdXBsaWNhdGVXaXRoQ29tbWVudE91dE9yaWdpbmFsLFxuXVxuXG5mb3IgKGNvbnN0IGtsYXNzIG9mIGNsYXNzZXNUb1JlZ2lzdGVyVG9TZWxlY3RMaXN0KSB7XG4gIGtsYXNzLnJlZ2lzdGVyVG9TZWxlY3RMaXN0KClcbn1cbiJdfQ==