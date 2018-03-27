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

var LowerCase = (function (_TransformString3) {
  _inherits(LowerCase, _TransformString3);

  function LowerCase() {
    _classCallCheck(this, LowerCase);

    _get(Object.getPrototypeOf(LowerCase.prototype), "constructor", this).apply(this, arguments);
  }

  // Replace
  // -------------------------

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

var Replace = (function (_TransformString4) {
  _inherits(Replace, _TransformString4);

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

var ConvertToHardTab = (function (_TransformString18) {
  _inherits(ConvertToHardTab, _TransformString18);

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

var TransformStringByExternalCommand = (function (_TransformString19) {
  _inherits(TransformStringByExternalCommand, _TransformString19);

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

var SwapWithRegister = (function (_TransformString22) {
  _inherits(SwapWithRegister, _TransformString22);

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

var Join = (function (_JoinTarget) {
  _inherits(Join, _JoinTarget);

  function Join() {
    _classCallCheck(this, Join);

    _get(Object.getPrototypeOf(Join.prototype), "constructor", this).apply(this, arguments);

    this.target = "MoveToRelativeLine";
  }

  return Join;
})(JoinTarget);

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

var SplitString = (function (_TransformString29) {
  _inherits(SplitString, _TransformString29);

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
      var regex = new RegExp(_.escapeRegExp(this.input || "\\n"), "g");
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
      return _.sortBy(rows, function (row) {
        return Number.parseInt(row) || Infinity;
      });
    }
  }]);

  return SortByNumber;
})(ChangeOrder);

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

var DuplicateWithCommentOutOriginal = (function (_TransformString33) {
  _inherits(DuplicateWithCommentOutOriginal, _TransformString33);

  function DuplicateWithCommentOutOriginal() {
    _classCallCheck(this, DuplicateWithCommentOutOriginal);

    _get(Object.getPrototypeOf(DuplicateWithCommentOutOriginal.prototype), "constructor", this).apply(this, arguments);

    this.wise = "linewise";
    this.stayByMarker = true;
    this.stayAtSamePosition = true;
  }

  // prettier-ignore

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

var classesToRegisterToSelectList = [ToggleCase, UpperCase, LowerCase, Replace, SplitByCharacter, CamelCase, SnakeCase, PascalCase, DashCase, TitleCase, EncodeUriComponent, DecodeUriComponent, TrimString, CompactSpaces, RemoveLeadingWhiteSpaces, AlignOccurrence, AlignOccurrenceByPadLeft, AlignOccurrenceByPadRight, ConvertToSoftTab, ConvertToHardTab, JoinTarget, Join, JoinWithKeepingSpace, JoinByInput, JoinByInputWithKeepingSpace, SplitString, SplitStringWithKeepingSplitter, SplitArguments, SplitArgumentsWithRemoveSeparator, SplitArgumentsOfInnerAnyPair, Reverse, Rotate, RotateBackwards, Sort, SortCaseInsensitively, SortByNumber, NumberingLines, DuplicateWithCommentOutOriginal];

for (var klass of classesToRegisterToSelectList) {
  klass.registerToSelectList();
}

module.exports = {
  TransformString: TransformString,
  ToggleCase: ToggleCase,
  ToggleCaseAndMoveRight: ToggleCaseAndMoveRight,
  UpperCase: UpperCase,
  LowerCase: LowerCase,
  Replace: Replace,
  ReplaceCharacter: ReplaceCharacter,
  SplitByCharacter: SplitByCharacter,
  CamelCase: CamelCase,
  SnakeCase: SnakeCase,
  PascalCase: PascalCase,
  DashCase: DashCase,
  TitleCase: TitleCase,
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
// e.g. command: 'sort'
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL29wZXJhdG9yLXRyYW5zZm9ybS1zdHJpbmcuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsV0FBVyxDQUFBOzs7Ozs7Ozs7Ozs7Ozs7O0FBRVgsSUFBTSxDQUFDLEdBQUcsT0FBTyxDQUFDLGlCQUFpQixDQUFDLENBQUE7O2VBQ0gsT0FBTyxDQUFDLE1BQU0sQ0FBQzs7SUFBekMsZUFBZSxZQUFmLGVBQWU7SUFBRSxLQUFLLFlBQUwsS0FBSzs7QUFFN0IsSUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFBO0FBQzlCLElBQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUE7Ozs7O0lBSXBDLGVBQWU7WUFBZixlQUFlOztXQUFmLGVBQWU7MEJBQWYsZUFBZTs7K0JBQWYsZUFBZTs7U0FHbkIsV0FBVyxHQUFHLElBQUk7U0FDbEIsY0FBYyxHQUFHLHVCQUF1QjtTQUN4QyxVQUFVLEdBQUcsS0FBSztTQUNsQixpQkFBaUIsR0FBRyxLQUFLO1NBQ3pCLHlCQUF5QixHQUFHLEtBQUs7OztlQVA3QixlQUFlOztXQWFKLHlCQUFDLFNBQVMsRUFBRTtBQUN6QixVQUFNLElBQUksR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxTQUFTLENBQUMsQ0FBQTtBQUM1RCxVQUFJLElBQUksRUFBRTtBQUNSLFlBQUksbUJBQW1CLFlBQUEsQ0FBQTtBQUN2QixZQUFJLElBQUksQ0FBQyx5QkFBeUIsRUFBRTtBQUNsQyxjQUFNLFFBQVEsR0FBRyxTQUFTLENBQUMsY0FBYyxFQUFFLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQTtBQUNyRCw2QkFBbUIsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLHVCQUF1QixDQUFDLFFBQVEsQ0FBQyxDQUFBO1NBQ3BFO0FBQ0QsWUFBSSxL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QW1CLEVBQW5CLG1CQUFtQjtBQUNuQixRQUFNLEVBQU4sTUFBTTtBQUNOLGlCQUFlLEVBQWYsZUFBZTtBQUNmLDRCQUEwQixFQUExQiwwQkFBMEI7QUFDMUIscUNBQW1DLEVBQW5DLG1DQUFtQztBQUNuQyxNQUFJLEVBQUosSUFBSTtBQUNKLHVCQUFxQixFQUFyQixxQkFBcUI7QUFDckIsY0FBWSxFQUFaLFlBQVk7QUFDWixnQkFBYyxFQUFkLGNBQWM7QUFDZCxpQ0FBK0IsRUFBL0IsK0JBQStCO0NBQ2hDLENBQUEiLCJmaWxlIjoiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvb3BlcmF0b3ItdHJhbnNmb3JtLXN0cmluZy5qcyIsInNvdXJjZXNDb250ZW50IjpbIlwidXNlIGJhYmVsXCJcblxuY29uc3QgXyA9IHJlcXVpcmUoXCJ1bmRlcnNjb3JlLXBsdXNcIilcbmNvbnN0IHtCdWZmZXJlZFByb2Nlc3MsIFJhbmdlfSA9IHJlcXVpcmUoXCJhdG9tXCIpXG5cbmNvbnN0IEJhc2UgPSByZXF1aXJlKFwiLi9iYXNlXCIpXG5jb25zdCBPcGVyYXRvciA9IEJhc2UuZ2V0Q2xhc3MoXCJPcGVyYXRvclwiKVxuXG4vLyBUcmFuc2Zvcm1TdHJpbmdcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5jbGFzcyBUcmFuc2Zvcm1TdHJpbmcgZXh0ZW5kcyBPcGVyYXRvciB7XG4gIHN0YXRpYyBjb21tYW5kID0gZmFsc2VcbiAgc3RhdGljIHN0cmluZ1RyYW5zZm9ybWVycyA9IFtdXG4gIHRyYWNrQ2hhbmdlID0gdHJ1ZVxuICBzdGF5T3B0aW9uTmFtZSA9IFwic3RheU9uVHJhbnNmb3JtU3RyaW5nXCJcbiAgYXV0b0luZGVudCA9IGZhbHNlXG4gIGF1dG9JbmRlbnROZXdsaW5lID0gZmFsc2VcbiAgYXV0b0luZGVudEFmdGVySW5zZXJ0VGV4dCA9IGZhbHNlXG5cbiAgc3RhdGljIHJlZ2lzdGVyVG9TZWxlY3RMaXN0KCkge1xuICAgIHRoaXMuc3RyaW5nVHJhbnNmb3JtZXJzLnB1c2godGhpcylcbiAgfVxuXG4gIG11dGF0ZVNlbGVjdGlvbihzZWxlY3Rpb24pIHtcbiAgICBjb25zdCB0ZXh0ID0gdGhpcy5nZXROZXdUZXh0KHNlbGVjdGlvbi5nZXRUZXh0KCksIHNlbGVjdGlvbilcbiAgICBpZiAodGV4dCkge1xuICAgICAgbGV0IHN0YXJ0Um93SW5kZW50TGV2ZWxcbiAgICAgIGlmICh0aGlzLmF1dG9JbmRlbnRBZnRlckluc2VydFRleHQpIHtcbiAgICAgICAgY29uc3Qgc3RhcnRSb3cgPSBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKS5zdGFydC5yb3dcbiAgICAgICAgc3RhcnRSb3dJbmRlbnRMZXZlbCA9IHRoaXMuZWRpdG9yLmluZGVudGF0aW9uRm9yQnVmZmVyUm93KHN0YXJ0Um93KVxuICAgICAgfVxuICAgICAgbGV0IHJhbmdlID0gc2VsZWN0aW9uLmluc2VydFRleHQodGV4dCwge2F1dG9JbmRlbnQ6IHRoaXMuYXV0b0luZGVudCwgYXV0b0luZGVudE5ld2xpbmU6IHRoaXMuYXV0b0luZGVudE5ld2xpbmV9KVxuXG4gICAgICBpZiAodGhpcy5hdXRvSW5kZW50QWZ0ZXJJbnNlcnRUZXh0KSB7XG4gICAgICAgIC8vIEN1cnJlbnRseSB1c2VkIGJ5IFNwbGl0QXJndW1lbnRzIGFuZCBTdXJyb3VuZCggbGluZXdpc2UgdGFyZ2V0IG9ubHkgKVxuICAgICAgICBpZiAodGhpcy50YXJnZXQuaXNMaW5ld2lzZSgpKSB7XG4gICAgICAgICAgcmFuZ2UgPSByYW5nZS50cmFuc2xhdGUoWzAsIDBdLCBbLTEsIDBdKVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuZWRpdG9yLnNldEluZGVudGF0aW9uRm9yQnVmZmVyUm93KHJhbmdlLnN0YXJ0LnJvdywgc3RhcnRSb3dJbmRlbnRMZXZlbClcbiAgICAgICAgdGhpcy5lZGl0b3Iuc2V0SW5kZW50YXRpb25Gb3JCdWZmZXJSb3cocmFuZ2UuZW5kLnJvdywgc3RhcnRSb3dJbmRlbnRMZXZlbClcbiAgICAgICAgLy8gQWRqdXN0IGlubmVyIHJhbmdlLCBlbmQucm93IGlzIGFscmVhZHkoIGlmIG5lZWRlZCApIHRyYW5zbGF0ZWQgc28gbm8gbmVlZCB0byByZS10cmFuc2xhdGUuXG4gICAgICAgIHRoaXMudXRpbHMuYWRqdXN0SW5kZW50V2l0aEtlZXBpbmdMYXlvdXQodGhpcy5lZGl0b3IsIHJhbmdlLnRyYW5zbGF0ZShbMSwgMF0sIFswLCAwXSkpXG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbmNsYXNzIFRvZ2dsZUNhc2UgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmcge1xuICBzdGF0aWMgZGlzcGxheU5hbWUgPSBcIlRvZ2dsZSB+XCJcblxuICBnZXROZXdUZXh0KHRleHQpIHtcbiAgICByZXR1cm4gdGV4dC5yZXBsYWNlKC8uL2csIHRoaXMudXRpbHMudG9nZ2xlQ2FzZUZvckNoYXJhY3RlcilcbiAgfVxufVxuXG5jbGFzcyBUb2dnbGVDYXNlQW5kTW92ZVJpZ2h0IGV4dGVuZHMgVG9nZ2xlQ2FzZSB7XG4gIGZsYXNoVGFyZ2V0ID0gZmFsc2VcbiAgcmVzdG9yZVBvc2l0aW9ucyA9IGZhbHNlXG4gIHRhcmdldCA9IFwiTW92ZVJpZ2h0XCJcbn1cblxuY2xhc3MgVXBwZXJDYXNlIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nIHtcbiAgc3RhdGljIGRpc3BsYXlOYW1lID0gXCJVcHBlclwiXG5cbiAgZ2V0TmV3VGV4dCh0ZXh0KSB7XG4gICAgcmV0dXJuIHRleHQudG9VcHBlckNhc2UoKVxuICB9XG59XG5cbmNsYXNzIExvd2VyQ2FzZSBleHRlbmRzIFRyYW5zZm9ybVN0cmluZyB7XG4gIHN0YXRpYyBkaXNwbGF5TmFtZSA9IFwiTG93ZXJcIlxuXG4gIGdldE5ld1RleHQodGV4dCkge1xuICAgIHJldHVybiB0ZXh0LnRvTG93ZXJDYXNlKClcbiAgfVxufVxuXG4vLyBSZXBsYWNlXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBSZXBsYWNlIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nIHtcbiAgZmxhc2hDaGVja3BvaW50ID0gXCJkaWQtc2VsZWN0LW9jY3VycmVuY2VcIlxuICBhdXRvSW5kZW50TmV3bGluZSA9IHRydWVcbiAgcmVhZElucHV0QWZ0ZXJTZWxlY3QgPSB0cnVlXG5cbiAgZ2V0TmV3VGV4dCh0ZXh0KSB7XG4gICAgaWYgKHRoaXMudGFyZ2V0Lm5hbWUgPT09IFwiTW92ZVJpZ2h0QnVmZmVyQ29sdW1uXCIgJiYgdGV4dC5sZW5ndGggIT09IHRoaXMuZ2V0Q291bnQoKSkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgY29uc3QgaW5wdXQgPSB0aGlzLmlucHV0IHx8IFwiXFxuXCJcbiAgICBpZiAoaW5wdXQgPT09IFwiXFxuXCIpIHtcbiAgICAgIHRoaXMucmVzdG9yZVBvc2l0aW9ucyA9IGZhbHNlXG4gICAgfVxuICAgIHJldHVybiB0ZXh0LnJlcGxhY2UoLy4vZywgaW5wdXQpXG4gIH1cbn1cblxuY2xhc3MgUmVwbGFjZUNoYXJhY3RlciBleHRlbmRzIFJlcGxhY2Uge1xuICB0YXJnZXQgPSBcIk1vdmVSaWdodEJ1ZmZlckNvbHVtblwiXG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIERVUCBtZWFuaW5nIHdpdGggU3BsaXRTdHJpbmcgbmVlZCBjb25zb2xpZGF0ZS5cbmNsYXNzIFNwbGl0QnlDaGFyYWN0ZXIgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmcge1xuICBnZXROZXdUZXh0KHRleHQpIHtcbiAgICByZXR1cm4gdGV4dC5zcGxpdChcIlwiKS5qb2luKFwiIFwiKVxuICB9XG59XG5cbmNsYXNzIENhbWVsQ2FzZSBleHRlbmRzIFRyYW5zZm9ybVN0cmluZyB7XG4gIHN0YXRpYyBkaXNwbGF5TmFtZSA9IFwiQ2FtZWxpemVcIlxuICBnZXROZXdUZXh0KHRleHQpIHtcbiAgICByZXR1cm4gXy5jYW1lbGl6ZSh0ZXh0KVxuICB9XG59XG5cbmNsYXNzIFNuYWtlQ2FzZSBleHRlbmRzIFRyYW5zZm9ybVN0cmluZyB7XG4gIHN0YXRpYyBkaXNwbGF5TmFtZSA9IFwiVW5kZXJzY29yZSBfXCJcbiAgZ2V0TmV3VGV4dCh0ZXh0KSB7XG4gICAgcmV0dXJuIF8udW5kZXJzY29yZSh0ZXh0KVxuICB9XG59XG5cbmNsYXNzIFBhc2NhbENhc2UgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmcge1xuICBzdGF0aWMgZGlzcGxheU5hbWUgPSBcIlBhc2NhbGl6ZVwiXG4gIGdldE5ld1RleHQodGV4dCkge1xuICAgIHJldHVybiBfLmNhcGl0YWxpemUoXy5jYW1lbGl6ZSh0ZXh0KSlcbiAgfVxufVxuXG5jbGFzcyBEYXNoQ2FzZSBleHRlbmRzIFRyYW5zZm9ybVN0cmluZyB7XG4gIHN0YXRpYyBkaXNwbGF5TmFtZSA9IFwiRGFzaGVyaXplIC1cIlxuICBnZXROZXdUZXh0KHRleHQpIHtcbiAgICByZXR1cm4gXy5kYXNoZXJpemUodGV4dClcbiAgfVxufVxuXG5jbGFzcyBUaXRsZUNhc2UgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmcge1xuICBzdGF0aWMgZGlzcGxheU5hbWUgPSBcIlRpdGxpemVcIlxuICBnZXROZXdUZXh0KHRleHQpIHtcbiAgICByZXR1cm4gXy5odW1hbml6ZUV2ZW50TmFtZShfLmRhc2hlcml6ZSh0ZXh0KSlcbiAgfVxufVxuXG5jbGFzcyBFbmNvZGVVcmlDb21wb25lbnQgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmcge1xuICBzdGF0aWMgZGlzcGxheU5hbWUgPSBcIkVuY29kZSBVUkkgQ29tcG9uZW50ICVcIlxuICBnZXROZXdUZXh0KHRleHQpIHtcbiAgICByZXR1cm4gZW5jb2RlVVJJQ29tcG9uZW50KHRleHQpXG4gIH1cbn1cblxuY2xhc3MgRGVjb2RlVXJpQ29tcG9uZW50IGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nIHtcbiAgc3RhdGljIGRpc3BsYXlOYW1lID0gXCJEZWNvZGUgVVJJIENvbXBvbmVudCAlJVwiXG4gIGdldE5ld1RleHQodGV4dCkge1xuICAgIHJldHVybiBkZWNvZGVVUklDb21wb25lbnQodGV4dClcbiAgfVxufVxuXG5jbGFzcyBUcmltU3RyaW5nIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nIHtcbiAgc3RhdGljIGRpc3BsYXlOYW1lID0gXCJUcmltIHN0cmluZ1wiXG4gIGdldE5ld1RleHQodGV4dCkge1xuICAgIHJldHVybiB0ZXh0LnRyaW0oKVxuICB9XG59XG5cbmNsYXNzIENvbXBhY3RTcGFjZXMgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmcge1xuICBzdGF0aWMgZGlzcGxheU5hbWUgPSBcIkNvbXBhY3Qgc3BhY2VcIlxuICBnZXROZXdUZXh0KHRleHQpIHtcbiAgICBpZiAodGV4dC5tYXRjaCgvXlsgXSskLykpIHtcbiAgICAgIHJldHVybiBcIiBcIlxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBEb24ndCBjb21wYWN0IGZvciBsZWFkaW5nIGFuZCB0cmFpbGluZyB3aGl0ZSBzcGFjZXMuXG4gICAgICBjb25zdCByZWdleCA9IC9eKFxccyopKC4qPykoXFxzKikkL2dtXG4gICAgICByZXR1cm4gdGV4dC5yZXBsYWNlKHJlZ2V4LCAobSwgbGVhZGluZywgbWlkZGxlLCB0cmFpbGluZykgPT4ge1xuICAgICAgICByZXR1cm4gbGVhZGluZyArIG1pZGRsZS5zcGxpdCgvWyBcXHRdKy8pLmpvaW4oXCIgXCIpICsgdHJhaWxpbmdcbiAgICAgIH0pXG4gICAgfVxuICB9XG59XG5cbmNsYXNzIEFsaWduT2NjdXJyZW5jZSBleHRlbmRzIFRyYW5zZm9ybVN0cmluZyB7XG4gIG9jY3VycmVuY2UgPSB0cnVlXG4gIHdoaWNoVG9QYWQgPSBcImF1dG9cIlxuXG4gIGdldFNlbGVjdGlvblRha2VyKCkge1xuICAgIGNvbnN0IHNlbGVjdGlvbnNCeVJvdyA9IF8uZ3JvdXBCeShcbiAgICAgIHRoaXMuZWRpdG9yLmdldFNlbGVjdGlvbnNPcmRlcmVkQnlCdWZmZXJQb3NpdGlvbigpLFxuICAgICAgc2VsZWN0aW9uID0+IHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpLnN0YXJ0LnJvd1xuICAgIClcblxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBjb25zdCByb3dzID0gT2JqZWN0LmtleXMoc2VsZWN0aW9uc0J5Um93KVxuICAgICAgY29uc3Qgc2VsZWN0aW9ucyA9IHJvd3MubWFwKHJvdyA9PiBzZWxlY3Rpb25zQnlSb3dbcm93XS5zaGlmdCgpKS5maWx0ZXIocyA9PiBzKVxuICAgICAgcmV0dXJuIHNlbGVjdGlvbnNcbiAgICB9XG4gIH1cblxuICBnZXRXaWNoVG9QYWRGb3JUZXh0KHRleHQpIHtcbiAgICBpZiAodGhpcy53aGljaFRvUGFkICE9PSBcImF1dG9cIikgcmV0dXJuIHRoaXMud2hpY2hUb1BhZFxuXG4gICAgaWYgKC9eXFxzKls9XFx8XVxccyokLy50ZXN0KHRleHQpKSB7XG4gICAgICAvLyBBc2lnbm1lbnQoPSkgYW5kIGB8YChtYXJrZG93bi10YWJsZSBzZXBhcmF0b3IpXG4gICAgICByZXR1cm4gXCJzdGFydFwiXG4gICAgfSBlbHNlIGlmICgvXlxccyosXFxzKiQvLnRlc3QodGV4dCkpIHtcbiAgICAgIC8vIEFyZ3VtZW50c1xuICAgICAgcmV0dXJuIFwiZW5kXCJcbiAgICB9IGVsc2UgaWYgKC9cXFckLy50ZXN0KHRleHQpKSB7XG4gICAgICAvLyBlbmRzIHdpdGggbm9uLXdvcmQtY2hhclxuICAgICAgcmV0dXJuIFwiZW5kXCJcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIFwic3RhcnRcIlxuICAgIH1cbiAgfVxuXG4gIGNhbGN1bGF0ZVBhZGRpbmcoKSB7XG4gICAgY29uc3QgdG90YWxBbW91bnRPZlBhZGRpbmdCeVJvdyA9IHt9XG4gICAgY29uc3QgY29sdW1uRm9yU2VsZWN0aW9uID0gc2VsZWN0aW9uID0+IHtcbiAgICAgIGNvbnN0IHdoaWNoID0gdGhpcy5nZXRXaWNoVG9QYWRGb3JUZXh0KHNlbGVjdGlvbi5nZXRUZXh0KCkpXG4gICAgICBjb25zdCBwb2ludCA9IHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpW3doaWNoXVxuICAgICAgcmV0dXJuIHBvaW50LmNvbHVtbiArICh0b3RhbEFtb3VudE9mUGFkZGluZ0J5Um93W3BvaW50LnJvd10gfHwgMClcbiAgICB9XG5cbiAgICBjb25zdCB0YWtlU2VsZWN0aW9ucyA9IHRoaXMuZ2V0U2VsZWN0aW9uVGFrZXIoKVxuICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICBjb25zdCBzZWxlY3Rpb25zID0gdGFrZVNlbGVjdGlvbnMoKVxuICAgICAgaWYgKCFzZWxlY3Rpb25zLmxlbmd0aCkgcmV0dXJuXG4gICAgICBjb25zdCBtYXhDb2x1bW4gPSBzZWxlY3Rpb25zLm1hcChjb2x1bW5Gb3JTZWxlY3Rpb24pLnJlZHVjZSgobWF4LCBjdXIpID0+IChjdXIgPiBtYXggPyBjdXIgOiBtYXgpKVxuICAgICAgZm9yIChjb25zdCBzZWxlY3Rpb24gb2Ygc2VsZWN0aW9ucykge1xuICAgICAgICBjb25zdCByb3cgPSBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKS5zdGFydC5yb3dcbiAgICAgICAgY29uc3QgYW1vdW50T2ZQYWRkaW5nID0gbWF4Q29sdW1uIC0gY29sdW1uRm9yU2VsZWN0aW9uKHNlbGVjdGlvbilcbiAgICAgICAgdG90YWxBbW91bnRPZlBhZGRpbmdCeVJvd1tyb3ddID0gKHRvdGFsQW1vdW50T2ZQYWRkaW5nQnlSb3dbcm93XSB8fCAwKSArIGFtb3VudE9mUGFkZGluZ1xuICAgICAgICB0aGlzLmFtb3VudE9mUGFkZGluZ0J5U2VsZWN0aW9uLnNldChzZWxlY3Rpb24sIGFtb3VudE9mUGFkZGluZylcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBleGVjdXRlKCkge1xuICAgIHRoaXMuYW1vdW50T2ZQYWRkaW5nQnlTZWxlY3Rpb24gPSBuZXcgTWFwKClcbiAgICB0aGlzLm9uRGlkU2VsZWN0VGFyZ2V0KCgpID0+IHtcbiAgICAgIHRoaXMuY2FsY3VsYXRlUGFkZGluZygpXG4gICAgfSlcbiAgICBzdXBlci5leGVjdXRlKClcbiAgfVxuXG4gIGdldE5ld1RleHQodGV4dCwgc2VsZWN0aW9uKSB7XG4gICAgY29uc3QgcGFkZGluZyA9IFwiIFwiLnJlcGVhdCh0aGlzLmFtb3VudE9mUGFkZGluZ0J5U2VsZWN0aW9uLmdldChzZWxlY3Rpb24pKVxuICAgIGNvbnN0IHdoaWNoVG9QYWQgPSB0aGlzLmdldFdpY2hUb1BhZEZvclRleHQoc2VsZWN0aW9uLmdldFRleHQoKSlcbiAgICByZXR1cm4gd2hpY2hUb1BhZCA9PT0gXCJzdGFydFwiID8gcGFkZGluZyArIHRleHQgOiB0ZXh0ICsgcGFkZGluZ1xuICB9XG59XG5cbmNsYXNzIEFsaWduT2NjdXJyZW5jZUJ5UGFkTGVmdCBleHRlbmRzIEFsaWduT2NjdXJyZW5jZSB7XG4gIHdoaWNoVG9QYWQgPSBcInN0YXJ0XCJcbn1cblxuY2xhc3MgQWxpZ25PY2N1cnJlbmNlQnlQYWRSaWdodCBleHRlbmRzIEFsaWduT2NjdXJyZW5jZSB7XG4gIHdoaWNoVG9QYWQgPSBcImVuZFwiXG59XG5cbmNsYXNzIFJlbW92ZUxlYWRpbmdXaGl0ZVNwYWNlcyBleHRlbmRzIFRyYW5zZm9ybVN0cmluZyB7XG4gIHdpc2UgPSBcImxpbmV3aXNlXCJcbiAgZ2V0TmV3VGV4dCh0ZXh0LCBzZWxlY3Rpb24pIHtcbiAgICBjb25zdCB0cmltTGVmdCA9IHRleHQgPT4gdGV4dC50cmltTGVmdCgpXG4gICAgcmV0dXJuIChcbiAgICAgIHRoaXMudXRpbHNcbiAgICAgICAgLnNwbGl0VGV4dEJ5TmV3TGluZSh0ZXh0KVxuICAgICAgICAubWFwKHRyaW1MZWZ0KVxuICAgICAgICAuam9pbihcIlxcblwiKSArIFwiXFxuXCJcbiAgICApXG4gIH1cbn1cblxuY2xhc3MgQ29udmVydFRvU29mdFRhYiBleHRlbmRzIFRyYW5zZm9ybVN0cmluZyB7XG4gIHN0YXRpYyBkaXNwbGF5TmFtZSA9IFwiU29mdCBUYWJcIlxuICB3aXNlID0gXCJsaW5ld2lzZVwiXG5cbiAgbXV0YXRlU2VsZWN0aW9uKHNlbGVjdGlvbikge1xuICAgIHRoaXMuc2NhbkVkaXRvcihcImZvcndhcmRcIiwgL1xcdC9nLCB7c2NhblJhbmdlOiBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKX0sICh7cmFuZ2UsIHJlcGxhY2V9KSA9PiB7XG4gICAgICAvLyBSZXBsYWNlIFxcdCB0byBzcGFjZXMgd2hpY2ggbGVuZ3RoIGlzIHZhcnkgZGVwZW5kaW5nIG9uIHRhYlN0b3AgYW5kIHRhYkxlbmdodFxuICAgICAgLy8gU28gd2UgZGlyZWN0bHkgY29uc3VsdCBpdCdzIHNjcmVlbiByZXByZXNlbnRpbmcgbGVuZ3RoLlxuICAgICAgY29uc3QgbGVuZ3RoID0gdGhpcy5lZGl0b3Iuc2NyZWVuUmFuZ2VGb3JCdWZmZXJSYW5nZShyYW5nZSkuZ2V0RXh0ZW50KCkuY29sdW1uXG4gICAgICByZXBsYWNlKFwiIFwiLnJlcGVhdChsZW5ndGgpKVxuICAgIH0pXG4gIH1cbn1cblxuY2xhc3MgQ29udmVydFRvSGFyZFRhYiBleHRlbmRzIFRyYW5zZm9ybVN0cmluZyB7XG4gIHN0YXRpYyBkaXNwbGF5TmFtZSA9IFwiSGFyZCBUYWJcIlxuXG4gIG11dGF0ZVNlbGVjdGlvbihzZWxlY3Rpb24pIHtcbiAgICBjb25zdCB0YWJMZW5ndGggPSB0aGlzLmVkaXRvci5nZXRUYWJMZW5ndGgoKVxuICAgIHRoaXMuc2NhbkVkaXRvcihcImZvcndhcmRcIiwgL1sgXFx0XSsvZywge3NjYW5SYW5nZTogc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKCl9LCAoe3JhbmdlLCByZXBsYWNlfSkgPT4ge1xuICAgICAgY29uc3Qge3N0YXJ0LCBlbmR9ID0gdGhpcy5lZGl0b3Iuc2NyZWVuUmFuZ2VGb3JCdWZmZXJSYW5nZShyYW5nZSlcbiAgICAgIGxldCBzdGFydENvbHVtbiA9IHN0YXJ0LmNvbHVtblxuICAgICAgY29uc3QgZW5kQ29sdW1uID0gZW5kLmNvbHVtblxuXG4gICAgICAvLyBXZSBjYW4ndCBuYWl2ZWx5IHJlcGxhY2Ugc3BhY2VzIHRvIHRhYiwgd2UgaGF2ZSB0byBjb25zaWRlciB2YWxpZCB0YWJTdG9wIGNvbHVtblxuICAgICAgLy8gSWYgbmV4dFRhYlN0b3AgY29sdW1uIGV4Y2VlZHMgcmVwbGFjYWJsZSByYW5nZSwgd2UgcGFkIHdpdGggc3BhY2VzLlxuICAgICAgbGV0IG5ld1RleHQgPSBcIlwiXG4gICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICBjb25zdCByZW1haW5kZXIgPSBzdGFydENvbHVtbiAlIHRhYkxlbmd0aFxuICAgICAgICBjb25zdCBuZXh0VGFiU3RvcCA9IHN0YXJ0Q29sdW1uICsgKHJlbWFpbmRlciA9PT0gMCA/IHRhYkxlbmd0aCA6IHJlbWFpbmRlcilcbiAgICAgICAgaWYgKG5leHRUYWJTdG9wID4gZW5kQ29sdW1uKSB7XG4gICAgICAgICAgbmV3VGV4dCArPSBcIiBcIi5yZXBlYXQoZW5kQ29sdW1uIC0gc3RhcnRDb2x1bW4pXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbmV3VGV4dCArPSBcIlxcdFwiXG4gICAgICAgIH1cbiAgICAgICAgc3RhcnRDb2x1bW4gPSBuZXh0VGFiU3RvcFxuICAgICAgICBpZiAoc3RhcnRDb2x1bW4gPj0gZW5kQ29sdW1uKSB7XG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXBsYWNlKG5ld1RleHQpXG4gICAgfSlcbiAgfVxufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBUcmFuc2Zvcm1TdHJpbmdCeUV4dGVybmFsQ29tbWFuZCBleHRlbmRzIFRyYW5zZm9ybVN0cmluZyB7XG4gIHN0YXRpYyBjb21tYW5kID0gZmFsc2VcbiAgYXV0b0luZGVudCA9IHRydWVcbiAgY29tbWFuZCA9IFwiXCIgLy8gZS5nLiBjb21tYW5kOiAnc29ydCdcbiAgYXJncyA9IFtdIC8vIGUuZyBhcmdzOiBbJy1ybiddXG5cbiAgLy8gTk9URTogVW5saWtlIG90aGVyIGNsYXNzLCBmaXJzdCBhcmcgaXMgYHN0ZG91dGAgb2YgZXh0ZXJuYWwgY29tbWFuZHMuXG4gIGdldE5ld1RleHQodGV4dCwgc2VsZWN0aW9uKSB7XG4gICAgcmV0dXJuIHRleHQgfHwgc2VsZWN0aW9uLmdldFRleHQoKVxuICB9XG4gIGdldENvbW1hbmQoc2VsZWN0aW9uKSB7XG4gICAgcmV0dXJuIHtjb21tYW5kOiB0aGlzLmNvbW1hbmQsIGFyZ3M6IHRoaXMuYXJnc31cbiAgfVxuICBnZXRTdGRpbihzZWxlY3Rpb24pIHtcbiAgICByZXR1cm4gc2VsZWN0aW9uLmdldFRleHQoKVxuICB9XG5cbiAgYXN5bmMgZXhlY3V0ZSgpIHtcbiAgICB0aGlzLnByZVNlbGVjdCgpXG5cbiAgICBpZiAodGhpcy5zZWxlY3RUYXJnZXQoKSkge1xuICAgICAgZm9yIChjb25zdCBzZWxlY3Rpb24gb2YgdGhpcy5lZGl0b3IuZ2V0U2VsZWN0aW9ucygpKSB7XG4gICAgICAgIGNvbnN0IHtjb21tYW5kLCBhcmdzfSA9IHRoaXMuZ2V0Q29tbWFuZChzZWxlY3Rpb24pIHx8IHt9XG4gICAgICAgIGlmIChjb21tYW5kID09IG51bGwgfHwgYXJncyA9PSBudWxsKSBjb250aW51ZVxuXG4gICAgICAgIGNvbnN0IHN0ZG91dCA9IGF3YWl0IHRoaXMucnVuRXh0ZXJuYWxDb21tYW5kKHtjb21tYW5kLCBhcmdzLCBzdGRpbjogdGhpcy5nZXRTdGRpbihzZWxlY3Rpb24pfSlcbiAgICAgICAgc2VsZWN0aW9uLmluc2VydFRleHQodGhpcy5nZXROZXdUZXh0KHN0ZG91dCwgc2VsZWN0aW9uKSwge2F1dG9JbmRlbnQ6IHRoaXMuYXV0b0luZGVudH0pXG4gICAgICB9XG4gICAgICB0aGlzLm11dGF0aW9uTWFuYWdlci5zZXRDaGVja3BvaW50KFwiZGlkLWZpbmlzaFwiKVxuICAgICAgdGhpcy5yZXN0b3JlQ3Vyc29yUG9zaXRpb25zSWZOZWNlc3NhcnkoKVxuICAgIH1cbiAgICB0aGlzLnBvc3RNdXRhdGUoKVxuICB9XG5cbiAgcnVuRXh0ZXJuYWxDb21tYW5kKG9wdGlvbnMpIHtcbiAgICBsZXQgb3V0cHV0ID0gXCJcIlxuICAgIG9wdGlvbnMuc3Rkb3V0ID0gZGF0YSA9PiAob3V0cHV0ICs9IGRhdGEpXG4gICAgY29uc3QgZXhpdFByb21pc2UgPSBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICAgIG9wdGlvbnMuZXhpdCA9ICgpID0+IHJlc29sdmUob3V0cHV0KVxuICAgIH0pXG4gICAgY29uc3Qge3N0ZGlufSA9IG9wdGlvbnNcbiAgICBkZWxldGUgb3B0aW9ucy5zdGRpblxuICAgIGNvbnN0IGJ1ZmZlcmVkUHJvY2VzcyA9IG5ldyBCdWZmZXJlZFByb2Nlc3Mob3B0aW9ucylcbiAgICBidWZmZXJlZFByb2Nlc3Mub25XaWxsVGhyb3dFcnJvcigoe2Vycm9yLCBoYW5kbGV9KSA9PiB7XG4gICAgICAvLyBTdXBwcmVzcyBjb21tYW5kIG5vdCBmb3VuZCBlcnJvciBpbnRlbnRpb25hbGx5LlxuICAgICAgaWYgKGVycm9yLmNvZGUgPT09IFwiRU5PRU5UXCIgJiYgZXJyb3Iuc3lzY2FsbC5pbmRleE9mKFwic3Bhd25cIikgPT09IDApIHtcbiAgICAgICAgY29uc29sZS5sb2coYCR7dGhpcy5nZXRDb21tYW5kTmFtZSgpfTogRmFpbGVkIHRvIHNwYXduIGNvbW1hbmQgJHtlcnJvci5wYXRofS5gKVxuICAgICAgICBoYW5kbGUoKVxuICAgICAgfVxuICAgICAgdGhpcy5jYW5jZWxPcGVyYXRpb24oKVxuICAgIH0pXG5cbiAgICBpZiAoc3RkaW4pIHtcbiAgICAgIGJ1ZmZlcmVkUHJvY2Vzcy5wcm9jZXNzLnN0ZGluLndyaXRlKHN0ZGluKVxuICAgICAgYnVmZmVyZWRQcm9jZXNzLnByb2Nlc3Muc3RkaW4uZW5kKClcbiAgICB9XG4gICAgcmV0dXJuIGV4aXRQcm9taXNlXG4gIH1cbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgVHJhbnNmb3JtU3RyaW5nQnlTZWxlY3RMaXN0IGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nIHtcbiAgaXNSZWFkeSgpIHtcbiAgICAvLyBUaGlzIGNvbW1hbmQgaXMganVzdCBnYXRlIHRvIGV4ZWN1dGUgYW5vdGhlciBvcGVyYXRvci5cbiAgICAvLyBTbyBuZXZlciBnZXQgcmVhZHkgYW5kIG5ldmVyIGJlIGV4ZWN1dGVkLlxuICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiAgaW5pdGlhbGl6ZSgpIHtcbiAgICB0aGlzLmZvY3VzU2VsZWN0TGlzdCh7aXRlbXM6IHRoaXMuY29uc3RydWN0b3IuZ2V0U2VsZWN0TGlzdEl0ZW1zKCl9KVxuICAgIHRoaXMudmltU3RhdGUub25EaWRDb25maXJtU2VsZWN0TGlzdChpdGVtID0+IHtcbiAgICAgIHRoaXMudmltU3RhdGUucmVzZXQoKVxuICAgICAgdGhpcy52aW1TdGF0ZS5vcGVyYXRpb25TdGFjay5ydW4oaXRlbS5rbGFzcywge3RhcmdldDogdGhpcy50YXJnZXR9KVxuICAgIH0pXG4gIH1cblxuICBzdGF0aWMgZ2V0U2VsZWN0TGlzdEl0ZW1zKCkge1xuICAgIGlmICghdGhpcy5zZWxlY3RMaXN0SXRlbXMpIHtcbiAgICAgIHRoaXMuc2VsZWN0TGlzdEl0ZW1zID0gdGhpcy5zdHJpbmdUcmFuc2Zvcm1lcnMubWFwKGtsYXNzID0+ICh7XG4gICAgICAgIGtsYXNzOiBrbGFzcyxcbiAgICAgICAgZGlzcGxheU5hbWU6IGtsYXNzLmhhc093blByb3BlcnR5KFwiZGlzcGxheU5hbWVcIilcbiAgICAgICAgICA/IGtsYXNzLmRpc3BsYXlOYW1lXG4gICAgICAgICAgOiBfLmh1bWFuaXplRXZlbnROYW1lKF8uZGFzaGVyaXplKGtsYXNzLm5hbWUpKSxcbiAgICAgIH0pKVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy5zZWxlY3RMaXN0SXRlbXNcbiAgfVxuXG4gIGV4ZWN1dGUoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGAke3RoaXMubmFtZX0gc2hvdWxkIG5vdCBiZSBleGVjdXRlZGApXG4gIH1cbn1cblxuY2xhc3MgVHJhbnNmb3JtV29yZEJ5U2VsZWN0TGlzdCBleHRlbmRzIFRyYW5zZm9ybVN0cmluZ0J5U2VsZWN0TGlzdCB7XG4gIHRhcmdldCA9IFwiSW5uZXJXb3JkXCJcbn1cblxuY2xhc3MgVHJhbnNmb3JtU21hcnRXb3JkQnlTZWxlY3RMaXN0IGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nQnlTZWxlY3RMaXN0IHtcbiAgdGFyZ2V0ID0gXCJJbm5lclNtYXJ0V29yZFwiXG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIFJlcGxhY2VXaXRoUmVnaXN0ZXIgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmcge1xuICBmbGFzaFR5cGUgPSBcIm9wZXJhdG9yLWxvbmdcIlxuXG4gIGluaXRpYWxpemUoKSB7XG4gICAgdGhpcy52aW1TdGF0ZS5zZXF1ZW50aWFsUGFzdGVNYW5hZ2VyLm9uSW5pdGlhbGl6ZSh0aGlzKVxuICAgIHN1cGVyLmluaXRpYWxpemUoKVxuICB9XG5cbiAgZXhlY3V0ZSgpIHtcbiAgICB0aGlzLnNlcXVlbnRpYWxQYXN0ZSA9IHRoaXMudmltU3RhdGUuc2VxdWVudGlhbFBhc3RlTWFuYWdlci5vbkV4ZWN1dGUodGhpcylcblxuICAgIHN1cGVyLmV4ZWN1dGUoKVxuXG4gICAgZm9yIChjb25zdCBzZWxlY3Rpb24gb2YgdGhpcy5lZGl0b3IuZ2V0U2VsZWN0aW9ucygpKSB7XG4gICAgICBjb25zdCByYW5nZSA9IHRoaXMubXV0YXRpb25NYW5hZ2VyLmdldE11dGF0ZWRCdWZmZXJSYW5nZUZvclNlbGVjdGlvbihzZWxlY3Rpb24pXG4gICAgICB0aGlzLnZpbVN0YXRlLnNlcXVlbnRpYWxQYXN0ZU1hbmFnZXIuc2F2ZVBhc3RlZFJhbmdlRm9yU2VsZWN0aW9uKHNlbGVjdGlvbiwgcmFuZ2UpXG4gICAgfVxuICB9XG5cbiAgZ2V0TmV3VGV4dCh0ZXh0LCBzZWxlY3Rpb24pIHtcbiAgICBjb25zdCB2YWx1ZSA9IHRoaXMudmltU3RhdGUucmVnaXN0ZXIuZ2V0KG51bGwsIHNlbGVjdGlvbiwgdGhpcy5zZXF1ZW50aWFsUGFzdGUpXG4gICAgcmV0dXJuIHZhbHVlID8gdmFsdWUudGV4dCA6IFwiXCJcbiAgfVxufVxuXG5jbGFzcyBSZXBsYWNlT2NjdXJyZW5jZVdpdGhSZWdpc3RlciBleHRlbmRzIFJlcGxhY2VXaXRoUmVnaXN0ZXIge1xuICBvY2N1cnJlbmNlID0gdHJ1ZVxufVxuXG4vLyBTYXZlIHRleHQgdG8gcmVnaXN0ZXIgYmVmb3JlIHJlcGxhY2VcbmNsYXNzIFN3YXBXaXRoUmVnaXN0ZXIgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmcge1xuICBnZXROZXdUZXh0KHRleHQsIHNlbGVjdGlvbikge1xuICAgIGNvbnN0IG5ld1RleHQgPSB0aGlzLnZpbVN0YXRlLnJlZ2lzdGVyLmdldFRleHQoKVxuICAgIHRoaXMuc2V0VGV4dFRvUmVnaXN0ZXIodGV4dCwgc2VsZWN0aW9uKVxuICAgIHJldHVybiBuZXdUZXh0XG4gIH1cbn1cblxuLy8gSW5kZW50IDwgVHJhbnNmb3JtU3RyaW5nXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBJbmRlbnQgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmcge1xuICBzdGF5QnlNYXJrZXIgPSB0cnVlXG4gIHNldFRvRmlyc3RDaGFyYWN0ZXJPbkxpbmV3aXNlID0gdHJ1ZVxuICB3aXNlID0gXCJsaW5ld2lzZVwiXG5cbiAgbXV0YXRlU2VsZWN0aW9uKHNlbGVjdGlvbikge1xuICAgIC8vIE5lZWQgY291bnQgdGltZXMgaW5kZW50YXRpb24gaW4gdmlzdWFsLW1vZGUgYW5kIGl0cyByZXBlYXQoYC5gKS5cbiAgICBpZiAodGhpcy50YXJnZXQubmFtZSA9PT0gXCJDdXJyZW50U2VsZWN0aW9uXCIpIHtcbiAgICAgIGxldCBvbGRUZXh0XG4gICAgICAvLyBsaW1pdCB0byAxMDAgdG8gYXZvaWQgZnJlZXppbmcgYnkgYWNjaWRlbnRhbCBiaWcgbnVtYmVyLlxuICAgICAgY29uc3QgY291bnQgPSB0aGlzLnV0aWxzLmxpbWl0TnVtYmVyKHRoaXMuZ2V0Q291bnQoKSwge21heDogMTAwfSlcbiAgICAgIHRoaXMuY291bnRUaW1lcyhjb3VudCwgKHtzdG9wfSkgPT4ge1xuICAgICAgICBvbGRUZXh0ID0gc2VsZWN0aW9uLmdldFRleHQoKVxuICAgICAgICB0aGlzLmluZGVudChzZWxlY3Rpb24pXG4gICAgICAgIGlmIChzZWxlY3Rpb24uZ2V0VGV4dCgpID09PSBvbGRUZXh0KSBzdG9wKClcbiAgICAgIH0pXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuaW5kZW50KHNlbGVjdGlvbilcbiAgICB9XG4gIH1cblxuICBpbmRlbnQoc2VsZWN0aW9uKSB7XG4gICAgc2VsZWN0aW9uLmluZGVudFNlbGVjdGVkUm93cygpXG4gIH1cbn1cblxuY2xhc3MgT3V0ZGVudCBleHRlbmRzIEluZGVudCB7XG4gIGluZGVudChzZWxlY3Rpb24pIHtcbiAgICBzZWxlY3Rpb24ub3V0ZGVudFNlbGVjdGVkUm93cygpXG4gIH1cbn1cblxuY2xhc3MgQXV0b0luZGVudCBleHRlbmRzIEluZGVudCB7XG4gIGluZGVudChzZWxlY3Rpb24pIHtcbiAgICBzZWxlY3Rpb24uYXV0b0luZGVudFNlbGVjdGVkUm93cygpXG4gIH1cbn1cblxuY2xhc3MgVG9nZ2xlTGluZUNvbW1lbnRzIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nIHtcbiAgZmxhc2hUYXJnZXQgPSBmYWxzZVxuICBzdGF5QnlNYXJrZXIgPSB0cnVlXG4gIHN0YXlBdFNhbWVQb3NpdGlvbiA9IHRydWVcbiAgd2lzZSA9IFwibGluZXdpc2VcIlxuXG4gIG11dGF0ZVNlbGVjdGlvbihzZWxlY3Rpb24pIHtcbiAgICBzZWxlY3Rpb24udG9nZ2xlTGluZUNvbW1lbnRzKClcbiAgfVxufVxuXG5jbGFzcyBSZWZsb3cgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmcge1xuICBtdXRhdGVTZWxlY3Rpb24oc2VsZWN0aW9uKSB7XG4gICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaCh0aGlzLmVkaXRvckVsZW1lbnQsIFwiYXV0b2Zsb3c6cmVmbG93LXNlbGVjdGlvblwiKVxuICB9XG59XG5cbmNsYXNzIFJlZmxvd1dpdGhTdGF5IGV4dGVuZHMgUmVmbG93IHtcbiAgc3RheUF0U2FtZVBvc2l0aW9uID0gdHJ1ZVxufVxuXG4vLyBTdXJyb3VuZCA8IFRyYW5zZm9ybVN0cmluZ1xuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgU3Vycm91bmRCYXNlIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nIHtcbiAgc3RhdGljIGNvbW1hbmQgPSBmYWxzZVxuICBzdXJyb3VuZEFjdGlvbiA9IG51bGxcbiAgcGFpcnMgPSBbW1wiKFwiLCBcIilcIl0sIFtcIntcIiwgXCJ9XCJdLCBbXCJbXCIsIFwiXVwiXSwgW1wiPFwiLCBcIj5cIl1dXG4gIHBhaXJzQnlBbGlhcyA9IHtcbiAgICBiOiBbXCIoXCIsIFwiKVwiXSxcbiAgICBCOiBbXCJ7XCIsIFwifVwiXSxcbiAgICByOiBbXCJbXCIsIFwiXVwiXSxcbiAgICBhOiBbXCI8XCIsIFwiPlwiXSxcbiAgfVxuXG4gIGdldFBhaXIoY2hhcikge1xuICAgIHJldHVybiBjaGFyIGluIHRoaXMucGFpcnNCeUFsaWFzXG4gICAgICA/IHRoaXMucGFpcnNCeUFsaWFzW2NoYXJdXG4gICAgICA6IFsuLi50aGlzLnBhaXJzLCBbY2hhciwgY2hhcl1dLmZpbmQocGFpciA9PiBwYWlyLmluY2x1ZGVzKGNoYXIpKVxuICB9XG5cbiAgc3Vycm91bmQodGV4dCwgY2hhciwge2tlZXBMYXlvdXQgPSBmYWxzZX0gPSB7fSkge1xuICAgIGxldCBbb3BlbiwgY2xvc2VdID0gdGhpcy5nZXRQYWlyKGNoYXIpXG4gICAgaWYgKCFrZWVwTGF5b3V0ICYmIHRleHQuZW5kc1dpdGgoXCJcXG5cIikpIHtcbiAgICAgIHRoaXMuYXV0b0luZGVudEFmdGVySW5zZXJ0VGV4dCA9IHRydWVcbiAgICAgIG9wZW4gKz0gXCJcXG5cIlxuICAgICAgY2xvc2UgKz0gXCJcXG5cIlxuICAgIH1cblxuICAgIGlmICh0aGlzLmdldENvbmZpZyhcImNoYXJhY3RlcnNUb0FkZFNwYWNlT25TdXJyb3VuZFwiKS5pbmNsdWRlcyhjaGFyKSAmJiB0aGlzLnV0aWxzLmlzU2luZ2xlTGluZVRleHQodGV4dCkpIHtcbiAgICAgIHRleHQgPSBcIiBcIiArIHRleHQgKyBcIiBcIlxuICAgIH1cblxuICAgIHJldHVybiBvcGVuICsgdGV4dCArIGNsb3NlXG4gIH1cblxuICBkZWxldGVTdXJyb3VuZCh0ZXh0KSB7XG4gICAgLy8gQXNzdW1lIHN1cnJvdW5kaW5nIGNoYXIgaXMgb25lLWNoYXIgbGVuZ3RoLlxuICAgIGNvbnN0IG9wZW4gPSB0ZXh0WzBdXG4gICAgY29uc3QgY2xvc2UgPSB0ZXh0W3RleHQubGVuZ3RoIC0gMV1cbiAgICBjb25zdCBpbm5lclRleHQgPSB0ZXh0LnNsaWNlKDEsIHRleHQubGVuZ3RoIC0gMSlcbiAgICByZXR1cm4gdGhpcy51dGlscy5pc1NpbmdsZUxpbmVUZXh0KHRleHQpICYmIG9wZW4gIT09IGNsb3NlID8gaW5uZXJUZXh0LnRyaW0oKSA6IGlubmVyVGV4dFxuICB9XG5cbiAgZ2V0TmV3VGV4dCh0ZXh0KSB7XG4gICAgaWYgKHRoaXMuc3Vycm91bmRBY3Rpb24gPT09IFwic3Vycm91bmRcIikge1xuICAgICAgcmV0dXJuIHRoaXMuc3Vycm91bmQodGV4dCwgdGhpcy5pbnB1dClcbiAgICB9IGVsc2UgaWYgKHRoaXMuc3Vycm91bmRBY3Rpb24gPT09IFwiZGVsZXRlLXN1cnJvdW5kXCIpIHtcbiAgICAgIHJldHVybiB0aGlzLmRlbGV0ZVN1cnJvdW5kKHRleHQpXG4gICAgfSBlbHNlIGlmICh0aGlzLnN1cnJvdW5kQWN0aW9uID09PSBcImNoYW5nZS1zdXJyb3VuZFwiKSB7XG4gICAgICByZXR1cm4gdGhpcy5zdXJyb3VuZCh0aGlzLmRlbGV0ZVN1cnJvdW5kKHRleHQpLCB0aGlzLmlucHV0LCB7a2VlcExheW91dDogdHJ1ZX0pXG4gICAgfVxuICB9XG59XG5cbmNsYXNzIFN1cnJvdW5kIGV4dGVuZHMgU3Vycm91bmRCYXNlIHtcbiAgc3Vycm91bmRBY3Rpb24gPSBcInN1cnJvdW5kXCJcbiAgcmVhZElucHV0QWZ0ZXJTZWxlY3QgPSB0cnVlXG59XG5cbmNsYXNzIFN1cnJvdW5kV29yZCBleHRlbmRzIFN1cnJvdW5kIHtcbiAgdGFyZ2V0ID0gXCJJbm5lcldvcmRcIlxufVxuXG5jbGFzcyBTdXJyb3VuZFNtYXJ0V29yZCBleHRlbmRzIFN1cnJvdW5kIHtcbiAgdGFyZ2V0ID0gXCJJbm5lclNtYXJ0V29yZFwiXG59XG5cbmNsYXNzIE1hcFN1cnJvdW5kIGV4dGVuZHMgU3Vycm91bmQge1xuICBvY2N1cnJlbmNlID0gdHJ1ZVxuICBwYXR0ZXJuRm9yT2NjdXJyZW5jZSA9IC9cXHcrL2dcbn1cblxuLy8gRGVsZXRlIFN1cnJvdW5kXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBEZWxldGVTdXJyb3VuZCBleHRlbmRzIFN1cnJvdW5kQmFzZSB7XG4gIHN1cnJvdW5kQWN0aW9uID0gXCJkZWxldGUtc3Vycm91bmRcIlxuICBpbml0aWFsaXplKCkge1xuICAgIGlmICghdGhpcy50YXJnZXQpIHtcbiAgICAgIHRoaXMuZm9jdXNJbnB1dCh7XG4gICAgICAgIG9uQ29uZmlybTogY2hhciA9PiB7XG4gICAgICAgICAgdGhpcy5zZXRUYXJnZXQodGhpcy5nZXRJbnN0YW5jZShcIkFQYWlyXCIsIHtwYWlyOiB0aGlzLmdldFBhaXIoY2hhcil9KSlcbiAgICAgICAgICB0aGlzLnByb2Nlc3NPcGVyYXRpb24oKVxuICAgICAgICB9LFxuICAgICAgfSlcbiAgICB9XG4gICAgc3VwZXIuaW5pdGlhbGl6ZSgpXG4gIH1cbn1cblxuY2xhc3MgRGVsZXRlU3Vycm91bmRBbnlQYWlyIGV4dGVuZHMgRGVsZXRlU3Vycm91bmQge1xuICB0YXJnZXQgPSBcIkFBbnlQYWlyXCJcbn1cblxuY2xhc3MgRGVsZXRlU3Vycm91bmRBbnlQYWlyQWxsb3dGb3J3YXJkaW5nIGV4dGVuZHMgRGVsZXRlU3Vycm91bmRBbnlQYWlyIHtcbiAgdGFyZ2V0ID0gXCJBQW55UGFpckFsbG93Rm9yd2FyZGluZ1wiXG59XG5cbi8vIENoYW5nZSBTdXJyb3VuZFxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgQ2hhbmdlU3Vycm91bmQgZXh0ZW5kcyBEZWxldGVTdXJyb3VuZCB7XG4gIHN1cnJvdW5kQWN0aW9uID0gXCJjaGFuZ2Utc3Vycm91bmRcIlxuICByZWFkSW5wdXRBZnRlclNlbGVjdCA9IHRydWVcblxuICAvLyBPdmVycmlkZSB0byBzaG93IGNoYW5naW5nIGNoYXIgb24gaG92ZXJcbiAgYXN5bmMgZm9jdXNJbnB1dFByb21pc2VkKC4uLmFyZ3MpIHtcbiAgICBjb25zdCBob3ZlclBvaW50ID0gdGhpcy5tdXRhdGlvbk1hbmFnZXIuZ2V0SW5pdGlhbFBvaW50Rm9yU2VsZWN0aW9uKHRoaXMuZWRpdG9yLmdldExhc3RTZWxlY3Rpb24oKSlcbiAgICB0aGlzLnZpbVN0YXRlLmhvdmVyLnNldCh0aGlzLmVkaXRvci5nZXRTZWxlY3RlZFRleHQoKVswXSwgaG92ZXJQb2ludClcbiAgICByZXR1cm4gc3VwZXIuZm9jdXNJbnB1dFByb21pc2VkKC4uLmFyZ3MpXG4gIH1cbn1cblxuY2xhc3MgQ2hhbmdlU3Vycm91bmRBbnlQYWlyIGV4dGVuZHMgQ2hhbmdlU3Vycm91bmQge1xuICB0YXJnZXQgPSBcIkFBbnlQYWlyXCJcbn1cblxuY2xhc3MgQ2hhbmdlU3Vycm91bmRBbnlQYWlyQWxsb3dGb3J3YXJkaW5nIGV4dGVuZHMgQ2hhbmdlU3Vycm91bmRBbnlQYWlyIHtcbiAgdGFyZ2V0ID0gXCJBQW55UGFpckFsbG93Rm9yd2FyZGluZ1wiXG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEZJWE1FXG4vLyBDdXJyZW50bHkgbmF0aXZlIGVkaXRvci5qb2luTGluZXMoKSBpcyBiZXR0ZXIgZm9yIGN1cnNvciBwb3NpdGlvbiBzZXR0aW5nXG4vLyBTbyBJIHVzZSBuYXRpdmUgbWV0aG9kcyBmb3IgYSBtZWFud2hpbGUuXG5jbGFzcyBKb2luVGFyZ2V0IGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nIHtcbiAgZmxhc2hUYXJnZXQgPSBmYWxzZVxuICByZXN0b3JlUG9zaXRpb25zID0gZmFsc2VcblxuICBtdXRhdGVTZWxlY3Rpb24oc2VsZWN0aW9uKSB7XG4gICAgY29uc3QgcmFuZ2UgPSBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKVxuXG4gICAgLy8gV2hlbiBjdXJzb3IgaXMgYXQgbGFzdCBCVUZGRVIgcm93LCBpdCBzZWxlY3QgbGFzdC1idWZmZXItcm93LCB0aGVuXG4gICAgLy8gam9pbm5pbmcgcmVzdWx0IGluIFwiY2xlYXIgbGFzdC1idWZmZXItcm93IHRleHRcIi5cbiAgICAvLyBJIGJlbGlldmUgdGhpcyBpcyBCVUcgb2YgdXBzdHJlYW0gYXRvbS1jb3JlLiBndWFyZCB0aGlzIHNpdHVhdGlvbiBoZXJlXG4gICAgaWYgKCFyYW5nZS5pc1NpbmdsZUxpbmUoKSB8fCByYW5nZS5lbmQucm93ICE9PSB0aGlzLmVkaXRvci5nZXRMYXN0QnVmZmVyUm93KCkpIHtcbiAgICAgIGlmICh0aGlzLnV0aWxzLmlzTGluZXdpc2VSYW5nZShyYW5nZSkpIHtcbiAgICAgICAgc2VsZWN0aW9uLnNldEJ1ZmZlclJhbmdlKHJhbmdlLnRyYW5zbGF0ZShbMCwgMF0sIFstMSwgSW5maW5pdHldKSlcbiAgICAgIH1cbiAgICAgIHNlbGVjdGlvbi5qb2luTGluZXMoKVxuICAgIH1cbiAgICBjb25zdCBwb2ludCA9IHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpLmVuZC50cmFuc2xhdGUoWzAsIC0xXSlcbiAgICByZXR1cm4gc2VsZWN0aW9uLmN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihwb2ludClcbiAgfVxufVxuXG5jbGFzcyBKb2luIGV4dGVuZHMgSm9pblRhcmdldCB7XG4gIHRhcmdldCA9IFwiTW92ZVRvUmVsYXRpdmVMaW5lXCJcbn1cblxuY2xhc3MgSm9pbkJhc2UgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmcge1xuICBzdGF0aWMgY29tbWFuZCA9IGZhbHNlXG4gIHdpc2UgPSBcImxpbmV3aXNlXCJcbiAgdHJpbSA9IGZhbHNlXG4gIHRhcmdldCA9IFwiTW92ZVRvUmVsYXRpdmVMaW5lTWluaW11bVR3b1wiXG5cbiAgZ2V0TmV3VGV4dCh0ZXh0KSB7XG4gICAgY29uc3QgcmVnZXggPSB0aGlzLnRyaW0gPyAvXFxyP1xcblsgXFx0XSovZyA6IC9cXHI/XFxuL2dcbiAgICByZXR1cm4gdGV4dC50cmltUmlnaHQoKS5yZXBsYWNlKHJlZ2V4LCB0aGlzLmlucHV0KSArIFwiXFxuXCJcbiAgfVxufVxuXG5jbGFzcyBKb2luV2l0aEtlZXBpbmdTcGFjZSBleHRlbmRzIEpvaW5CYXNlIHtcbiAgaW5wdXQgPSBcIlwiXG59XG5cbmNsYXNzIEpvaW5CeUlucHV0IGV4dGVuZHMgSm9pbkJhc2Uge1xuICByZWFkSW5wdXRBZnRlclNlbGVjdCA9IHRydWVcbiAgZm9jdXNJbnB1dE9wdGlvbnMgPSB7Y2hhcnNNYXg6IDEwfVxuICB0cmltID0gdHJ1ZVxufVxuXG5jbGFzcyBKb2luQnlJbnB1dFdpdGhLZWVwaW5nU3BhY2UgZXh0ZW5kcyBKb2luQnlJbnB1dCB7XG4gIHRyaW0gPSBmYWxzZVxufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBTdHJpbmcgc3VmZml4IGluIG5hbWUgaXMgdG8gYXZvaWQgY29uZnVzaW9uIHdpdGggJ3NwbGl0JyB3aW5kb3cuXG5jbGFzcyBTcGxpdFN0cmluZyBleHRlbmRzIFRyYW5zZm9ybVN0cmluZyB7XG4gIHRhcmdldCA9IFwiTW92ZVRvUmVsYXRpdmVMaW5lXCJcbiAga2VlcFNwbGl0dGVyID0gZmFsc2VcbiAgcmVhZElucHV0QWZ0ZXJTZWxlY3QgPSB0cnVlXG4gIGZvY3VzSW5wdXRPcHRpb25zID0ge2NoYXJzTWF4OiAxMH1cblxuICBnZXROZXdUZXh0KHRleHQpIHtcbiAgICBjb25zdCByZWdleCA9IG5ldyBSZWdFeHAoXy5lc2NhcGVSZWdFeHAodGhpcy5pbnB1dCB8fCBcIlxcXFxuXCIpLCBcImdcIilcbiAgICBjb25zdCBsaW5lU2VwYXJhdG9yID0gKHRoaXMua2VlcFNwbGl0dGVyID8gdGhpcy5pbnB1dCA6IFwiXCIpICsgXCJcXG5cIlxuICAgIHJldHVybiB0ZXh0LnJlcGxhY2UocmVnZXgsIGxpbmVTZXBhcmF0b3IpXG4gIH1cbn1cblxuY2xhc3MgU3BsaXRTdHJpbmdXaXRoS2VlcGluZ1NwbGl0dGVyIGV4dGVuZHMgU3BsaXRTdHJpbmcge1xuICBrZWVwU3BsaXR0ZXIgPSB0cnVlXG59XG5cbmNsYXNzIFNwbGl0QXJndW1lbnRzIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nIHtcbiAga2VlcFNlcGFyYXRvciA9IHRydWVcbiAgYXV0b0luZGVudEFmdGVySW5zZXJ0VGV4dCA9IHRydWVcblxuICBnZXROZXdUZXh0KHRleHQpIHtcbiAgICBjb25zdCBhbGxUb2tlbnMgPSB0aGlzLnV0aWxzLnNwbGl0QXJndW1lbnRzKHRleHQudHJpbSgpKVxuICAgIGxldCBuZXdUZXh0ID0gXCJcIlxuICAgIHdoaWxlIChhbGxUb2tlbnMubGVuZ3RoKSB7XG4gICAgICBjb25zdCB7dGV4dCwgdHlwZX0gPSBhbGxUb2tlbnMuc2hpZnQoKVxuICAgICAgbmV3VGV4dCArPSB0eXBlID09PSBcInNlcGFyYXRvclwiID8gKHRoaXMua2VlcFNlcGFyYXRvciA/IHRleHQudHJpbSgpIDogXCJcIikgKyBcIlxcblwiIDogdGV4dFxuICAgIH1cbiAgICByZXR1cm4gYFxcbiR7bmV3VGV4dH1cXG5gXG4gIH1cbn1cblxuY2xhc3MgU3BsaXRBcmd1bWVudHNXaXRoUmVtb3ZlU2VwYXJhdG9yIGV4dGVuZHMgU3BsaXRBcmd1bWVudHMge1xuICBrZWVwU2VwYXJhdG9yID0gZmFsc2Vcbn1cblxuY2xhc3MgU3BsaXRBcmd1bWVudHNPZklubmVyQW55UGFpciBleHRlbmRzIFNwbGl0QXJndW1lbnRzIHtcbiAgdGFyZ2V0ID0gXCJJbm5lckFueVBhaXJcIlxufVxuXG5jbGFzcyBDaGFuZ2VPcmRlciBleHRlbmRzIFRyYW5zZm9ybVN0cmluZyB7XG4gIHN0YXRpYyBjb21tYW5kID0gZmFsc2VcbiAgZ2V0TmV3VGV4dCh0ZXh0KSB7XG4gICAgcmV0dXJuIHRoaXMudGFyZ2V0LmlzTGluZXdpc2UoKVxuICAgICAgPyB0aGlzLmdldE5ld0xpc3QodGhpcy51dGlscy5zcGxpdFRleHRCeU5ld0xpbmUodGV4dCkpLmpvaW4oXCJcXG5cIikgKyBcIlxcblwiXG4gICAgICA6IHRoaXMuc29ydEFyZ3VtZW50c0luVGV4dEJ5KHRleHQsIGFyZ3MgPT4gdGhpcy5nZXROZXdMaXN0KGFyZ3MpKVxuICB9XG5cbiAgc29ydEFyZ3VtZW50c0luVGV4dEJ5KHRleHQsIGZuKSB7XG4gICAgY29uc3Qgc3RhcnQgPSB0ZXh0LnNlYXJjaCgvXFxTLylcbiAgICBjb25zdCBlbmQgPSB0ZXh0LnNlYXJjaCgvXFxzKiQvKVxuICAgIGNvbnN0IGxlYWRpbmdTcGFjZXMgPSBzdGFydCAhPT0gLTEgPyB0ZXh0LnNsaWNlKDAsIHN0YXJ0KSA6IFwiXCJcbiAgICBjb25zdCB0cmFpbGluZ1NwYWNlcyA9IGVuZCAhPT0gLTEgPyB0ZXh0LnNsaWNlKGVuZCkgOiBcIlwiXG4gICAgY29uc3QgYWxsVG9rZW5zID0gdGhpcy51dGlscy5zcGxpdEFyZ3VtZW50cyh0ZXh0LnNsaWNlKHN0YXJ0LCBlbmQpKVxuICAgIGNvbnN0IGFyZ3MgPSBhbGxUb2tlbnMuZmlsdGVyKHRva2VuID0+IHRva2VuLnR5cGUgPT09IFwiYXJndW1lbnRcIikubWFwKHRva2VuID0+IHRva2VuLnRleHQpXG4gICAgY29uc3QgbmV3QXJncyA9IGZuKGFyZ3MpXG5cbiAgICBsZXQgbmV3VGV4dCA9IFwiXCJcbiAgICB3aGlsZSAoYWxsVG9rZW5zLmxlbmd0aCkge1xuICAgICAgY29uc3QgdG9rZW4gPSBhbGxUb2tlbnMuc2hpZnQoKVxuICAgICAgLy8gdG9rZW4udHlwZSBpcyBcInNlcGFyYXRvclwiIG9yIFwiYXJndW1lbnRcIlxuICAgICAgbmV3VGV4dCArPSB0b2tlbi50eXBlID09PSBcInNlcGFyYXRvclwiID8gdG9rZW4udGV4dCA6IG5ld0FyZ3Muc2hpZnQoKVxuICAgIH1cbiAgICByZXR1cm4gbGVhZGluZ1NwYWNlcyArIG5ld1RleHQgKyB0cmFpbGluZ1NwYWNlc1xuICB9XG59XG5cbmNsYXNzIFJldmVyc2UgZXh0ZW5kcyBDaGFuZ2VPcmRlciB7XG4gIGdldE5ld0xpc3Qocm93cykge1xuICAgIHJldHVybiByb3dzLnJldmVyc2UoKVxuICB9XG59XG5cbmNsYXNzIFJldmVyc2VJbm5lckFueVBhaXIgZXh0ZW5kcyBSZXZlcnNlIHtcbiAgdGFyZ2V0ID0gXCJJbm5lckFueVBhaXJcIlxufVxuXG5jbGFzcyBSb3RhdGUgZXh0ZW5kcyBDaGFuZ2VPcmRlciB7XG4gIGJhY2t3YXJkcyA9IGZhbHNlXG4gIGdldE5ld0xpc3Qocm93cykge1xuICAgIGlmICh0aGlzLmJhY2t3YXJkcykgcm93cy5wdXNoKHJvd3Muc2hpZnQoKSlcbiAgICBlbHNlIHJvd3MudW5zaGlmdChyb3dzLnBvcCgpKVxuICAgIHJldHVybiByb3dzXG4gIH1cbn1cblxuY2xhc3MgUm90YXRlQmFja3dhcmRzIGV4dGVuZHMgQ2hhbmdlT3JkZXIge1xuICBiYWNrd2FyZHMgPSB0cnVlXG59XG5cbmNsYXNzIFJvdGF0ZUFyZ3VtZW50c09mSW5uZXJQYWlyIGV4dGVuZHMgUm90YXRlIHtcbiAgdGFyZ2V0ID0gXCJJbm5lckFueVBhaXJcIlxufVxuXG5jbGFzcyBSb3RhdGVBcmd1bWVudHNCYWNrd2FyZHNPZklubmVyUGFpciBleHRlbmRzIFJvdGF0ZUFyZ3VtZW50c09mSW5uZXJQYWlyIHtcbiAgYmFja3dhcmRzID0gdHJ1ZVxufVxuXG5jbGFzcyBTb3J0IGV4dGVuZHMgQ2hhbmdlT3JkZXIge1xuICBnZXROZXdMaXN0KHJvd3MpIHtcbiAgICByZXR1cm4gcm93cy5zb3J0KClcbiAgfVxufVxuXG5jbGFzcyBTb3J0Q2FzZUluc2Vuc2l0aXZlbHkgZXh0ZW5kcyBDaGFuZ2VPcmRlciB7XG4gIGdldE5ld0xpc3Qocm93cykge1xuICAgIHJldHVybiByb3dzLnNvcnQoKHJvd0EsIHJvd0IpID0+IHJvd0EubG9jYWxlQ29tcGFyZShyb3dCLCB7c2Vuc2l0aXZpdHk6IFwiYmFzZVwifSkpXG4gIH1cbn1cblxuY2xhc3MgU29ydEJ5TnVtYmVyIGV4dGVuZHMgQ2hhbmdlT3JkZXIge1xuICBnZXROZXdMaXN0KHJvd3MpIHtcbiAgICByZXR1cm4gXy5zb3J0Qnkocm93cywgcm93ID0+IE51bWJlci5wYXJzZUludChyb3cpIHx8IEluZmluaXR5KVxuICB9XG59XG5cbmNsYXNzIE51bWJlcmluZ0xpbmVzIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nIHtcbiAgd2lzZSA9IFwibGluZXdpc2VcIlxuXG4gIGdldE5ld1RleHQodGV4dCkge1xuICAgIGNvbnN0IHJvd3MgPSB0aGlzLnV0aWxzLnNwbGl0VGV4dEJ5TmV3TGluZSh0ZXh0KVxuICAgIGNvbnN0IGxhc3RSb3dXaWR0aCA9IFN0cmluZyhyb3dzLmxlbmd0aCkubGVuZ3RoXG5cbiAgICBjb25zdCBuZXdSb3dzID0gcm93cy5tYXAoKHJvd1RleHQsIGkpID0+IHtcbiAgICAgIGkrKyAvLyBmaXggMCBzdGFydCBpbmRleCB0byAxIHN0YXJ0LlxuICAgICAgY29uc3QgYW1vdW50T2ZQYWRkaW5nID0gdGhpcy51dGlscy5saW1pdE51bWJlcihsYXN0Um93V2lkdGggLSBTdHJpbmcoaSkubGVuZ3RoLCB7bWluOiAwfSlcbiAgICAgIHJldHVybiBcIiBcIi5yZXBlYXQoYW1vdW50T2ZQYWRkaW5nKSArIGkgKyBcIjogXCIgKyByb3dUZXh0XG4gICAgfSlcbiAgICByZXR1cm4gbmV3Um93cy5qb2luKFwiXFxuXCIpICsgXCJcXG5cIlxuICB9XG59XG5cbmNsYXNzIER1cGxpY2F0ZVdpdGhDb21tZW50T3V0T3JpZ2luYWwgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmcge1xuICB3aXNlID0gXCJsaW5ld2lzZVwiXG4gIHN0YXlCeU1hcmtlciA9IHRydWVcbiAgc3RheUF0U2FtZVBvc2l0aW9uID0gdHJ1ZVxuICBtdXRhdGVTZWxlY3Rpb24oc2VsZWN0aW9uKSB7XG4gICAgY29uc3QgW3N0YXJ0Um93LCBlbmRSb3ddID0gc2VsZWN0aW9uLmdldEJ1ZmZlclJvd1JhbmdlKClcbiAgICBzZWxlY3Rpb24uc2V0QnVmZmVyUmFuZ2UodGhpcy51dGlscy5pbnNlcnRUZXh0QXRCdWZmZXJQb3NpdGlvbih0aGlzLmVkaXRvciwgW3N0YXJ0Um93LCAwXSwgc2VsZWN0aW9uLmdldFRleHQoKSkpXG4gICAgdGhpcy5lZGl0b3IudG9nZ2xlTGluZUNvbW1lbnRzRm9yQnVmZmVyUm93cyhzdGFydFJvdywgZW5kUm93KVxuICB9XG59XG5cbi8vIHByZXR0aWVyLWlnbm9yZVxuY29uc3QgY2xhc3Nlc1RvUmVnaXN0ZXJUb1NlbGVjdExpc3QgPSBbXG4gIFRvZ2dsZUNhc2UsIFVwcGVyQ2FzZSwgTG93ZXJDYXNlLFxuICBSZXBsYWNlLCBTcGxpdEJ5Q2hhcmFjdGVyLFxuICBDYW1lbENhc2UsIFNuYWtlQ2FzZSwgUGFzY2FsQ2FzZSwgRGFzaENhc2UsIFRpdGxlQ2FzZSxcbiAgRW5jb2RlVXJpQ29tcG9uZW50LCBEZWNvZGVVcmlDb21wb25lbnQsXG4gIFRyaW1TdHJpbmcsIENvbXBhY3RTcGFjZXMsIFJlbW92ZUxlYWRpbmdXaGl0ZVNwYWNlcyxcbiAgQWxpZ25PY2N1cnJlbmNlLCBBbGlnbk9jY3VycmVuY2VCeVBhZExlZnQsIEFsaWduT2NjdXJyZW5jZUJ5UGFkUmlnaHQsXG4gIENvbnZlcnRUb1NvZnRUYWIsIENvbnZlcnRUb0hhcmRUYWIsXG4gIEpvaW5UYXJnZXQsIEpvaW4sIEpvaW5XaXRoS2VlcGluZ1NwYWNlLCBKb2luQnlJbnB1dCwgSm9pbkJ5SW5wdXRXaXRoS2VlcGluZ1NwYWNlLFxuICBTcGxpdFN0cmluZywgU3BsaXRTdHJpbmdXaXRoS2VlcGluZ1NwbGl0dGVyLFxuICBTcGxpdEFyZ3VtZW50cywgU3BsaXRBcmd1bWVudHNXaXRoUmVtb3ZlU2VwYXJhdG9yLCBTcGxpdEFyZ3VtZW50c09mSW5uZXJBbnlQYWlyLFxuICBSZXZlcnNlLCBSb3RhdGUsIFJvdGF0ZUJhY2t3YXJkcywgU29ydCwgU29ydENhc2VJbnNlbnNpdGl2ZWx5LCBTb3J0QnlOdW1iZXIsXG4gIE51bWJlcmluZ0xpbmVzLFxuICBEdXBsaWNhdGVXaXRoQ29tbWVudE91dE9yaWdpbmFsLFxuXVxuXG5mb3IgKGNvbnN0IGtsYXNzIG9mIGNsYXNzZXNUb1JlZ2lzdGVyVG9TZWxlY3RMaXN0KSB7XG4gIGtsYXNzLnJlZ2lzdGVyVG9TZWxlY3RMaXN0KClcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIFRyYW5zZm9ybVN0cmluZyxcbiAgVG9nZ2xlQ2FzZSxcbiAgVG9nZ2xlQ2FzZUFuZE1vdmVSaWdodCxcbiAgVXBwZXJDYXNlLFxuICBMb3dlckNhc2UsXG4gIFJlcGxhY2UsXG4gIFJlcGxhY2VDaGFyYWN0ZXIsXG4gIFNwbGl0QnlDaGFyYWN0ZXIsXG4gIENhbWVsQ2FzZSxcbiAgU25ha2VDYXNlLFxuICBQYXNjYWxDYXNlLFxuICBEYXNoQ2FzZSxcbiAgVGl0bGVDYXNlLFxuICBFbmNvZGVVcmlDb21wb25lbnQsXG4gIERlY29kZVVyaUNvbXBvbmVudCxcbiAgVHJpbVN0cmluZyxcbiAgQ29tcGFjdFNwYWNlcyxcbiAgQWxpZ25PY2N1cnJlbmNlLFxuICBBbGlnbk9jY3VycmVuY2VCeVBhZExlZnQsXG4gIEFsaWduT2NjdXJyZW5jZUJ5UGFkUmlnaHQsXG4gIFJlbW92ZUxlYWRpbmdXaGl0ZVNwYWNlcyxcbiAgQ29udmVydFRvU29mdFRhYixcbiAgQ29udmVydFRvSGFyZFRhYixcbiAgVHJhbnNmb3JtU3RyaW5nQnlFeHRlcm5hbENvbW1hbmQsXG4gIFRyYW5zZm9ybVN0cmluZ0J5U2VsZWN0TGlzdCxcbiAgVHJhbnNmb3JtV29yZEJ5U2VsZWN0TGlzdCxcbiAgVHJhbnNmb3JtU21hcnRXb3JkQnlTZWxlY3RMaXN0LFxuICBSZXBsYWNlV2l0aFJlZ2lzdGVyLFxuICBSZXBsYWNlT2NjdXJyZW5jZVdpdGhSZWdpc3RlcixcbiAgU3dhcFdpdGhSZWdpc3RlcixcbiAgSW5kZW50LFxuICBPdXRkZW50LFxuICBBdXRvSW5kZW50LFxuICBUb2dnbGVMaW5lQ29tbWVudHMsXG4gIFJlZmxvdyxcbiAgUmVmbG93V2l0aFN0YXksXG4gIFN1cnJvdW5kQmFzZSxcbiAgU3Vycm91bmQsXG4gIFN1cnJvdW5kV29yZCxcbiAgU3Vycm91bmRTbWFydFdvcmQsXG4gIE1hcFN1cnJvdW5kLFxuICBEZWxldGVTdXJyb3VuZCxcbiAgRGVsZXRlU3Vycm91bmRBbnlQYWlyLFxuICBEZWxldGVTdXJyb3VuZEFueVBhaXJBbGxvd0ZvcndhcmRpbmcsXG4gIENoYW5nZVN1cnJvdW5kLFxuICBDaGFuZ2VTdXJyb3VuZEFueVBhaXIsXG4gIENoYW5nZVN1cnJvdW5kQW55UGFpckFsbG93Rm9yd2FyZGluZyxcbiAgSm9pblRhcmdldCxcbiAgSm9pbixcbiAgSm9pbkJhc2UsXG4gIEpvaW5XaXRoS2VlcGluZ1NwYWNlLFxuICBKb2luQnlJbnB1dCxcbiAgSm9pbkJ5SW5wdXRXaXRoS2VlcGluZ1NwYWNlLFxuICBTcGxpdFN0cmluZyxcbiAgU3BsaXRTdHJpbmdXaXRoS2VlcGluZ1NwbGl0dGVyLFxuICBTcGxpdEFyZ3VtZW50cyxcbiAgU3BsaXRBcmd1bWVudHNXaXRoUmVtb3ZlU2VwYXJhdG9yLFxuICBTcGxpdEFyZ3VtZW50c09mSW5uZXJBbnlQYWlyLFxuICBDaGFuZ2VPcmRlcixcbiAgUmV2ZXJzZSxcbiAgUmV2ZXJzZUlubmVyQW55UGFpcixcbiAgUm90YXRlLFxuICBSb3RhdGVCYWNrd2FyZHMsXG4gIFJvdGF0ZUFyZ3VtZW50c09mSW5uZXJQYWlyLFxuICBSb3RhdGVBcmd1bWVudHNCYWNrd2FyZHNPZklubmVyUGFpcixcbiAgU29ydCxcbiAgU29ydENhc2VJbnNlbnNpdGl2ZWx5LFxuICBTb3J0QnlOdW1iZXIsXG4gIE51bWJlcmluZ0xpbmVzLFxuICBEdXBsaWNhdGVXaXRoQ29tbWVudE91dE9yaWdpbmFsLFxufVxuIl19