"use babel";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var settings = require("./settings");

var CSON = undefined,
    path = undefined,
    selectList = undefined,
    OperationAbortedError = undefined,
    __plus = undefined;
var CLASS_REGISTRY = {};

function _plus() {
  return __plus || (__plus = require("underscore-plus"));
}

var VMP_LOADING_FILE = undefined;
function loadVmpOperationFile(filename) {
  // Call to loadVmpOperationFile can be nested.
  // 1. require("./operator-transform-string")
  // 2. in operator-transform-string.coffee call Base.getClass("Operator") cause operator.coffee required.
  // So we have to save original VMP_LOADING_FILE and restore it after require finished.
  var preserved = VMP_LOADING_FILE;
  VMP_LOADING_FILE = filename;
  require(filename);
  VMP_LOADING_FILE = preserved;
}

var Base = (function () {
  _createClass(Base, [{
    key: "name",
    get: function get() {
      return this.constructor.name;
    }
  }], [{
    key: "commandTable",
    value: null,
    enumerable: true
  }, {
    key: "commandPrefix",
    value: "vim-mode-plus",
    enumerable: true
  }, {
    key: "commandScope",
    value: "atom-text-editor",
    enumerable: true
  }, {
    key: "operationKind",
    value: null,
    enumerable: true
  }, {
    key: "getEditorState",
    value: null,
    // set through init()

    enumerable: true
  }]);

  function Base(vimState) {
    _classCallCheck(this, Base);

    this.requireTarget = false;
    this.requireInput = false;
    this.recordable = false;
    this.repeated = false;
    this.target = null;
    this.operator = null;
    this.count = null;
    this.defaultCount = 1;
    this.input = null;

    this.vimState = vimState;
  }

  _createClass(Base, [{
    key: "initialize",
    value: function initialize() {}

    // Called both on cancel and success
  }, {
    key: "resetState",
    value: function resetState() {}

    // Operation processor execute only when isComplete() return true.
    // If false, operation processor postpone its execution.
  }, {
    key: "isComplete",
    value: function isComplete() {
      if (this.requireInput && this.input == null) {
        return false;
      } else if (this.requireTarget) {
        // When this function is called in Base::constructor
        // tagert is still string like `MoveToRight`, in this case isComplete
        // is not available.
        return !!this.target && this.target.isComplete();
      } else {
        return true; // Set in operator's target( Motion or TextObject )
      }
    }
  }, {
    key: "isAsTargetExceptSelectInVisualMode",
    value: function isAsTargetExceptSelectInVisualMode() {
      return this.operator && !this.operator["instanceof"]("SelectInVisualMode");
    }
  }, {
    key: "abort",
    value: function abort() {
      if (!OperationAbortedError) OperationAbortedError = require("./errors");
      throw new OperationAbortedError("aborted");
    }
  }, {
    key: "getCount",
    value: function getCount() {
      var offset = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];

      if (this.count == null) {
        this.count = this.vimState.hasCount() ? this.vimState.getCount() : this.defaultCount;
      }
      return this.count + offset;
    }
  }, {
    key: "resetCount",
    value: function resetCount() {
      this.count = null;
    }
  }, {
    key: "countTimes",
    value: function countTimes(last, fn) {
      if (last < 1) return;

      var stopped = false;
      var stop = function stop() {
        return stopped = true;
      };
      for (var count = 1; count <= last; count++) {
        fn({ count: count, isFinal: count === last, stop: stop });
        if (stopped) break;
      }
    }
  }, {
    key: "activateMode",
    value: function activateMode(mode, submode) {
      var _this = this;

      this.onDidFinishOperation(function () {
        return _this.vimState.activate(mode, submode);
      });
    }
  }, {
    key: "activateModeIfNecessary",
    value: function activateModeIfNecessary(mode, submode) {
      if (!this.vimState.isMode(mode, submode)) {
        this.activateMode(mode, submode);
      }
    }
  }, {
    key: "getInstance",
    value: function getInstance(name, properties) {
      return this.constructor.getInstance(this.vimState, name, properties);
    }
  }, {
    key: "cancelOperation",
    value: function cancelOperation() {
      this.vimState.operationStack.cancel(this);
    }
  }, {
    key: "processOperation",
    value: function processOperation() {
      this.vimState.operationStack.process();
    }
  }, {
    key: "focusSelectList",
    value: function focusSelectList() {
      var _this2 = this;

      var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      this.onDidCancelSelectList(function () {
        return _this2.cancelOperation();
      });
      if (!selectList) {
        selectList = new (require("./select-list"))();
      }
      selectList.show(this.vimState, options);
    }
  }, {
    key: "focusInput",
    value: function focusInput() {
      var _this3 = this;

      var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      if (!options.onConfirm) {
        options.onConfirm = function (input) {
          _this3.input = input;
          _this3.processOperation();
        };
      }
      if (!options.onCancel) options.onCancel = function () {
        return _this3.cancelOperation();
      };
      if (!options.onChange) options.onChange = function (input) {
        return _this3.vimState.hover.set(input);
      };

      this.vimState.focusInput(options);
    }
  }, {
    key: "readChar",
    value: function readChar() {
      var _this4 = this;

      this.vimState.readChar({
        onConfirm: function onConfirm(input) {
          _this4.input = input;
          _this4.processOperation();
        },
        onCancel: function onCancel() {
          return _this4.cancelOperation();
        }
      });
    }

    // Wrapper for this.utils == start
  }, {
    key: "getVimEofBufferPosition",
    value: function getVimEofBufferPosition() {
      return this.utils.getVimEofBufferPosition(this.editor);
    }
  }, {
    key: "getVimLastBufferRow",
    value: function getVimLastBufferRow() {
      return this.utils.getVimLastBufferRow(this.editor);
    }
  }, {
    key: "getVimLastScreenRow",
    value: function getVimLastScreenRow() {
      return this.utils.getVimLastScreenRow(this.editor);
    }
  }, {
    key: "getValidVimBufferRow",
    value: function getValidVimBufferRow(row) {
      return this.utils.getValidVimBufferRow(this.editor, row);
    }
  }, {
    key: "getWordBufferRangeAndKindAtBufferPosition",
    value: function getWordBufferRangeAndKindAtBufferPosition() {
      var _utils;

      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return (_utils = this.utils).getWordBufferRangeAndKindAtBufferPosition.apply(_utils, [this.editor].concat(args));
    }
  }, {
    key: "getFirstCharacterPositionForBufferRow",
    value: function getFirstCharacterPositionForBufferRow(row) {
      return this.utils.getFirstCharacterPositionForBufferRow(this.editor, row);
    }
  }, {
    key: "getBufferRangeForRowRange",
    value: function getBufferRangeForRowRange(rowRange) {
      return this.utils.getBufferRangeForRowRange(this.editor, rowRange);
    }
  }, {
    key: "scanForward",
    value: function scanForward() {
      var _utils2;

      for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      return (_utils2 = this.utils).scanEditorInDirection.apply(_utils2, [this.editor, "forward"].concat(args));
    }
  }, {
    key: "scanBackward",
    value: function scanBackward() {
      var _utils3;

      for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        args[_key3] = arguments[_key3];
      }

      return (_utils3 = this.utils).scanEditorInDirection.apply(_utils3, [this.editor, "backward"].concat(args));
    }
  }, {
    key: "getFoldStartRowForRow",
    value: function getFoldStartRowForRow() {
      var _utils4;

      for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
        args[_key4] = arguments[_key4];
      }

      return (_utils4 = this.utils).getFoldStartRowForRow.apply(_utils4, [this.editor].concat(args));
    }
  }, {
    key: "getFoldEndRowForRow",
    value: function getFoldEndRowForRow() {
      var _utils5;

      for (var _len5 = arguments.length, args = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
        args[_key5] = arguments[_key5];
      }

      return (_utils5 = this.utils).getFoldEndRowForRow.apply(_utils5, [this.editor].concat(args));
    }
  }, {
    key: "getBufferRows",
    value: function getBufferRows() {
      var _utils6;

      for (var _len6 = arguments.length, args = Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
        args[_key6] = arguments[_key6];
      }

      return (_utils6 = this.utils).getRows.apply(_utils6, [this.editor, "buffer"].concat(args));
    }
  }, {
    key: "getScreenRows",
    value: function getScreenRows() {
      var _utils7;

      for (var _len7 = arguments.length, args = Array(_len7), _key7 = 0; _key7 < _len7; _key7++) {
        args[_key7] = arguments[_key7];
      }

      return (_utils7 = this.utils).getRows.apply(_utils7, [this.editor, "screen"].concat(args));
    }

    // Wrapper for this.utils == end

  }, {
    key: "instanceof",
    value: function _instanceof(klassName) {
      return this instanceof Base.getClass(klassName);
    }
  }, {
    key: "is",
    value: function is(klassName) {
      return this.constructor === Base.getClass(klassName);
    }
  }, {
    key: "isOperator",
    value: function isOperator() {
      // Don't use `instanceof` to postpone require for faster activation.
      return this.constructor.operationKind === "operator";
    }
  }, {
    key: "isMotion",
    value: function isMotion() {
      // Don't use `instanceof` to postpone require for faster activation.
      return this.constructor.operationKind === "motion";
    }
  }, {
    key: "isTextObject",
    value: function isTextObject() {
      // Don't use `instanceof` to postpone require for faster activation.
      return this.constructor.operationKind === "text-object";
    }
  }, {
    key: "getCursorBufferPosition",
    value: function getCursorBufferPosition() {
      return this.mode === "visual" ? this.getCursorPositionForSelection(this.editor.getLastSelection()) : this.editor.getCursorBufferPosition();
    }
  }, {
    key: "getCursorBufferPositions",
    value: function getCursorBufferPositions() {
      var _this5 = this;

      return this.mode === "visual" ? this.editor.getSelections().map(function (selection) {
        return _this5.getCursorPositionForSelection(selection);
      }) : this.editor.getCursorBufferPositions();
    }
  }, {
    key: "getCursorBufferPositionsOrdered",
    value: function getCursorBufferPositionsOrdered() {
      return this.utils.sortPoints(this.getCursorBufferPositions());
    }
  }, {
    key: "getBufferPositionForCursor",
    value: function getBufferPositionForCursor(cursor) {
      return this.mode === "visual" ? this.getCursorPositionForSelection(cursor.selection) : cursor.getBufferPosition();
    }
  }, {
    key: "getCursorPositionForSelection",
    value: function getCursorPositionForSelection(selection) {
      return this.swrap(selection).getBufferPositionFor("head", { from: ["property", "selection"] });
    }
  }, {
    key: "getTypeOperationTypeChar",
    value: function getTypeOperationTypeChar() {
      var operationKind = this.constructor.operationKind;

      if (operationKind === "operator") return "O";else if (operationKind === "text-object") return "T";else if (operationKind === "motion") return "M";else if (operationKind === "misc-command") return "X";
    }
  }, {
    key: "toString",
    value: function toString() {
      var base = this.name + "<" + this.getTypeOperationTypeChar() + ">";
      return this.target ? base + "{target = " + this.target.toString() + "}" : base;
    }
  }, {
    key: "getCommandName",
    value: function getCommandName() {
      return this.constructor.getCommandName();
    }
  }, {
    key: "getCommandNameWithoutPrefix",
    value: function getCommandNameWithoutPrefix() {
      return this.constructor.getCommandNameWithoutPrefix();
    }
  }, {
    key: "onDidChangeSearch",
    // prettier-ignore

    value: function onDidChangeSearch() {
      var _vimState;

      return (_vimState = this.vimState).onDidChangeSearch.apply(_vimState, arguments);
    }
    // prettier-ignore
  }, {
    key: "onDidConfirmSearch",
    value: function onDidConfirmSearch() {
      var _vimState2;

      return (_vimState2 = this.vimState).onDidConfirmSearch.apply(_vimState2, arguments);
    }
    // prettier-ignore
  }, {
    key: "onDidCancelSearch",
    value: function onDidCancelSearch() {
      var _vimState3;

      return (_vimState3 = this.vimState).onDidCancelSearch.apply(_vimState3, arguments);
    }
    // prettier-ignore
  }, {
    key: "onDidCommandSearch",
    value: function onDidCommandSearch() {
      var _vimState4;

      return (_vimState4 = this.vimState).onDidCommandSearch.apply(_vimState4, arguments);
    }
    // prettier-ignore
  }, {
    key: "onDidSetTarget",
    value: function onDidSetTarget() {
      var _vimState5;

      return (_vimState5 = this.vimState).onDidSetTarget.apply(_vimState5, arguments);
    }
    // prettier-ignore
  }, {
    key: "emitDidSetTarget",
    value: function emitDidSetTarget() {
      var _vimState6;

      return (_vimState6 = this.vimState).emitDidSetTarget.apply(_vimState6, arguments);
    }
    // prettier-ignore
  }, {
    key: "onWillSelectTarget",
    value: function onWillSelectTarget() {
      var _vimState7;

      return (_vimState7 = this.vimState).onWillSelectTarget.apply(_vimState7, arguments);
    }
    // prettier-ignore
  }, {
    key: "emitWillSelectTarget",
    value: function emitWillSelectTarget() {
      var _vimState8;

      return (_vimState8 = this.vimState).emitWillSelectTarget.apply(_vimState8, arguments);
    }
    // prettier-ignore
  }, {
    key: "onDidSelectTarget",
    value: function onDidSelectTarget() {
      var _vimState9;

      return (_vimState9 = this.vimState).onDidSelectTarget.apply(_vimState9, arguments);
    }
    // prettier-ignore
  }, {
    key: "emitDidSelectTarget",
    value: function emitDidSelectTarget() {
      var _vimState10;

      return (_vimState10 = this.vimState).emitDidSelectTarget.apply(_vimState10, arguments);
    }
    // prettier-ignore
  }, {
    key: "onDidFailSelectTarget",
    value: function onDidFailSelectTarget() {
      var _vimState11;

      return (_vimState11 = this.vimState).onDidFailSelectTarget.apply(_vimState11, arguments);
    }
    // prettier-ignore
  }, {
    key: "emitDidFailSelectTarget",
    value: function emitDidFailSelectTarget() {
      var _vimState12;

      return (_vimState12 = this.vimState).emitDidFailSelectTarget.apply(_vimState12, arguments);
    }
    // prettier-ignore
  }, {
    key: "onWillFinishMutation",
    value: function onWillFinishMutation() {
      var _vimState13;

      return (_vimState13 = this.vimState).onWillFinishMutation.apply(_vimState13, arguments);
    }
    // prettier-ignore
  }, {
    key: "emitWillFinishMutation",
    value: function emitWillFinishMutation() {
      var _vimState14;

      return (_vimState14 = this.vimState).emitWillFinishMutation.apply(_vimState14, arguments);
    }
    // prettier-ignore
  }, {
    key: "onDidFinishMutation",
    value: function onDidFinishMutation() {
      var _vimState15;

      return (_vimState15 = this.vimState).onDidFinishMutation.apply(_vimState15, arguments);
    }
    // prettier-ignore
  }, {
    key: "emitDidFinishMutation",
    value: function emitDidFinishMutation() {
      var _vimState16;

      return (_vimState16 = this.vimState).emitDidFinishMutation.apply(_vimState16, arguments);
    }
    // prettier-ignore
  }, {
    key: "onDidFinishOperation",
    value: function onDidFinishOperation() {
      var _vimState17;

      return (_vimState17 = this.vimState).onDidFinishOperation.apply(_vimState17, arguments);
    }
    // prettier-ignore
  }, {
    key: "onDidResetOperationStack",
    value: function onDidResetOperationStack() {
      var _vimState18;

      return (_vimState18 = this.vimState).onDidResetOperationStack.apply(_vimState18, arguments);
    }
    // prettier-ignore
  }, {
    key: "onWillActivateMode",
    value: function onWillActivateMode() {
      var _vimState19;

      return (_vimState19 = this.vimState).onWillActivateMode.apply(_vimState19, arguments);
    }
    // prettier-ignore
  }, {
    key: "onDidActivateMode",
    value: function onDidActivateMode() {
      var _vimState20;

      return (_vimState20 = this.vimState).onDidActivateMode.apply(_vimState20, arguments);
    }
    // prettier-ignore
  }, {
    key: "preemptWillDeactivateMode",
    value: function preemptWillDeactivateMode() {
      var _vimState21;

      return (_vimState21 = this.vimState).preemptWillDeactivateMode.apply(_vimState21, arguments);
    }
    // prettier-ignore
  }, {
    key: "onWillDeactivateMode",
    value: function onWillDeactivateMode() {
      var _vimState22;

      return (_vimState22 = this.vimState).onWillDeactivateMode.apply(_vimState22, arguments);
    }
    // prettier-ignore
  }, {
    key: "onDidDeactivateMode",
    value: function onDidDeactivateMode() {
      var _vimState23;

      return (_vimState23 = this.vimState).onDidDeactivateMode.apply(_vimState23, arguments);
    }
    // prettier-ignore
  }, {
    key: "onDidCancelSelectList",
    value: function onDidCancelSelectList() {
      var _vimState24;

      return (_vimState24 = this.vimState).onDidCancelSelectList.apply(_vimState24, arguments);
    }
    // prettier-ignore
  }, {
    key: "subscribe",
    value: function subscribe() {
      var _vimState25;

      return (_vimState25 = this.vimState).subscribe.apply(_vimState25, arguments);
    }
    // prettier-ignore
  }, {
    key: "isMode",
    value: function isMode() {
      var _vimState26;

      return (_vimState26 = this.vimState).isMode.apply(_vimState26, arguments);
    }
    // prettier-ignore
  }, {
    key: "getBlockwiseSelections",
    value: function getBlockwiseSelections() {
      var _vimState27;

      return (_vimState27 = this.vimState).getBlockwiseSelections.apply(_vimState27, arguments);
    }
    // prettier-ignore
  }, {
    key: "getLastBlockwiseSelection",
    value: function getLastBlockwiseSelection() {
      var _vimState28;

      return (_vimState28 = this.vimState).getLastBlockwiseSelection.apply(_vimState28, arguments);
    }
    // prettier-ignore
  }, {
    key: "addToClassList",
    value: function addToClassList() {
      var _vimState29;

      return (_vimState29 = this.vimState).addToClassList.apply(_vimState29, arguments);
    }
    // prettier-ignore
  }, {
    key: "getConfig",
    value: function getConfig() {
      var _vimState30;

      return (_vimState30 = this.vimState).getConfig.apply(_vimState30, arguments);
    }
    // prettier-ignore
  }, {
    key: "mode",

    // Proxy propperties and methods
    //===========================================================================
    get: function get() {
      return this.vimState.mode;
    }
    // prettier-ignore
  }, {
    key: "submode",
    get: function get() {
      return this.vimState.submode;
    }
    // prettier-ignore
  }, {
    key: "swrap",
    get: function get() {
      return this.vimState.swrap;
    }
    // prettier-ignore
  }, {
    key: "utils",
    get: function get() {
      return this.vimState.utils;
    }
    // prettier-ignore
  }, {
    key: "editor",
    get: function get() {
      return this.vimState.editor;
    }
    // prettier-ignore
  }, {
    key: "editorElement",
    get: function get() {
      return this.vimState.editorElement;
    }
    // prettier-ignore
  }, {
    key: "globalState",
    get: function get() {
      return this.vimState.globalState;
    }
    // prettier-ignore
  }, {
    key: "mutationManager",
    get: function get() {
      return this.vimState.mutationManager;
    }
    // prettier-ignore
  }, {
    key: "occurrenceManager",
    get: function get() {
      return this.vimState.occurrenceManager;
    }
    // prettier-ignore
  }, {
    key: "persistentSelection",
    get: function get() {
      return this.vimState.persistentSelection;
    }
  }], [{
    key: "writeCommandTableOnDisk",
    value: function writeCommandTableOnDisk() {
      var commandTable = this.generateCommandTableByEagerLoad();
      var _ = _plus();
      if (_.isEqual(this.commandTable, commandTable)) {
        atom.notifications.addInfo("No changes in commandTable", { dismissable: true });
        return;
      }

      if (!CSON) CSON = require("season");
      if (!path) path = require("path");

      var loadableCSONText = "# This file is auto generated by `vim-mode-plus:write-command-table-on-disk` command.\n";
      loadableCSONText += "# DONT edit manually.\n";
      loadableCSONText += "module.exports =\n";
      loadableCSONText += CSON.stringify(commandTable) + "\n";

      var commandTablePath = path.join(__dirname, "command-table.coffee");
      var openOption = { activatePane: false, activateItem: false };
      atom.workspace.open(commandTablePath, openOption).then(function (editor) {
        editor.setText(loadableCSONText);
        editor.save();
        atom.notifications.addInfo("Updated commandTable", { dismissable: true });
      });
    }
  }, {
    key: "generateCommandTableByEagerLoad",
    value: function generateCommandTableByEagerLoad() {
      // NOTE: changing order affects output of lib/command-table.coffee
      var filesToLoad = ["./operator", "./operator-insert", "./operator-transform-string", "./motion", "./motion-search", "./text-object", "./misc-command"];
      filesToLoad.forEach(loadVmpOperationFile);
      var _ = _plus();
      var klassesGroupedByFile = _.groupBy(_.values(CLASS_REGISTRY), function (klass) {
        return klass.file;
      });

      var commandTable = {};
      for (var file of filesToLoad) {
        for (var klass of klassesGroupedByFile[file]) {
          commandTable[klass.name] = klass.command ? { file: klass.file, commandName: klass.getCommandName(), commandScope: klass.commandScope } : { file: klass.file };
        }
      }
      return commandTable;
    }
  }, {
    key: "init",
    value: function init(getEditorState) {
      this.getEditorState = getEditorState;

      this.commandTable = require("./command-table");
      var subscriptions = [];
      for (var _name in this.commandTable) {
        var spec = this.commandTable[_name];
        if (spec.commandName) {
          subscriptions.push(this.registerCommandFromSpec(_name, spec));
        }
      }
      return subscriptions;
    }
  }, {
    key: "register",
    value: function register() {
      var command = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];

      this.command = command;
      this.file = VMP_LOADING_FILE;
      if (this.name in CLASS_REGISTRY) {
        console.warn("Duplicate constructor " + this.name);
      }
      CLASS_REGISTRY[this.name] = this;
    }
  }, {
    key: "extend",
    value: function extend() {
      console.error("calling deprecated Base.extend(), use Base.register instead!");
      this.register.apply(this, arguments);
    }
  }, {
    key: "getClass",
    value: function getClass(name) {
      if (name in CLASS_REGISTRY) return CLASS_REGISTRY[name];

      var fileToLoad = this.commandTable[name].file;
      if (atom.inDevMode() && settings.get("debug")) {
        console.log("lazy-require: " + fileToLoad + " for " + name);
      }
      loadVmpOperationFile(fileToLoad);
      if (name in CLASS_REGISTRY) return CLASS_REGISTRY[name];

      throw new Error("class '" + name + "' not found");
    }
  }, {
    key: "getInstance",
    value: function getInstance(vimState, klass, properties) {
      klass = typeof klass === "function" ? klass : Base.getClass(klass);
      var object = new klass(vimState);
      if (properties) Object.assign(object, properties);
      object.initialize();
      return object;
    }
  }, {
    key: "getClassRegistry",
    value: function getClassRegistry() {
      return CLASS_REGISTRY;
    }
  }, {
    key: "getCommandName",
    value: function getCommandName() {
      return this.commandPrefix + ":" + _plus().dasherize(this.name);
    }
  }, {
    key: "getCommandNameWithoutPrefix",
    value: function getCommandNameWithoutPrefix() {
      return _plus().dasherize(this.name);
    }
  }, {
    key: "registerCommand",
    value: function registerCommand() {
      var _this6 = this;

      return this.registerCommandFromSpec(this.name, {
        commandScope: this.commandScope,
        commandName: this.getCommandName(),
        getClass: function getClass() {
          return _this6;
        }
      });
    }
  }, {
    key: "registerCommandFromSpec",
    value: function registerCommandFromSpec(name, spec) {
      var _this7 = this;

      var _spec$commandScope = spec.commandScope;
      var commandScope = _spec$commandScope === undefined ? "atom-text-editor" : _spec$commandScope;
      var _spec$commandPrefix = spec.commandPrefix;
      var commandPrefix = _spec$commandPrefix === undefined ? "vim-mode-plus" : _spec$commandPrefix;
      var commandName = spec.commandName;
      var getClass = spec.getClass;

      if (!commandName) commandName = commandPrefix + ":" + _plus().dasherize(name);
      if (!getClass) getClass = function (name) {
        return _this7.getClass(name);
      };

      var getEditorState = this.getEditorState;
      return atom.commands.add(commandScope, commandName, function (event) {
        var vimState = getEditorState(this.getModel()) || getEditorState(atom.workspace.getActiveTextEditor());
        if (vimState) vimState.operationStack.run(getClass(name)); // vimState possibly be undefined See #85
        event.stopPropagation();
      });
    }
  }, {
    key: "getKindForCommandName",
    value: function getKindForCommandName(command) {
      var commandWithoutPrefix = command.replace(/^vim-mode-plus:/, "");

      var _plus2 = _plus();

      var capitalize = _plus2.capitalize;
      var camelize = _plus2.camelize;

      var commandClassName = capitalize(camelize(commandWithoutPrefix));
      if (commandClassName in CLASS_REGISTRY) {
        return CLASS_REGISTRY[commandClassName].operationKind;
      }
    }
  }]);

  return Base;
})();

Base.register(false);

module.exports = Base;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL2Jhc2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsV0FBVyxDQUFBOzs7Ozs7QUFFWCxJQUFNLFFBQVEsR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUE7O0FBRXRDLElBQUksSUFBSSxZQUFBO0lBQUUsSUFBSSxZQUFBO0lBQUUsVUFBVSxZQUFBO0lBQUUscUJBQXFCLFlBQUE7SUFBRSxNQUFNLFlBQUEsQ0FBQTtBQUN6RCxJQUFNLGNBQWMsR0FBRyxFQUFFLENBQUE7O0FBRXpCLFNBQVMsS0FBSyxHQUFHO0FBQ2YsU0FBTyxNQUFNLEtBQUssTUFBTSxHQUFHLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFBLEFBQUMsQ0FBQTtDQUN2RDs7QUFFRCxJQUFJLGdCQUFnQixZQUFBLENBQUE7QUFDcEIsU0FBUyxvQkFBb0IsQ0FBQyxRQUFRLEVBQUU7Ozs7O0FBS3RDLE1BQU0sU0FBUyxHQUFHLGdCQUFnQixDQUFBO0FBQ2xDLGtCQUFnQixHQUFHLFFBQVEsQ0FBQTtBQUMzQixTQUFPLENBQUMsUUFBUSxDQUFDLENBQUE7QUFDakIsa0JBQWdCLEdBQUcsU0FBUyxDQUFBO0NBQzdCOztJQUVLLElBQUk7ZUFBSixJQUFJOztTQWlCQSxlQUFHO0FBQ1QsYUFBTyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQTtLQUM3Qjs7O1dBbEJxQixJQUFJOzs7O1dBQ0gsZUFBZTs7OztXQUNoQixrQkFBa0I7Ozs7V0FDakIsSUFBSTs7OztXQUNILElBQUk7Ozs7OztBQWdCakIsV0FyQlAsSUFBSSxDQXFCSSxRQUFRLEVBQUU7MEJBckJsQixJQUFJOztTQU9SLGFBQWEsR0FBRyxLQUFLO1NBQ3JCLFlBQVksR0FBRyxLQUFLO1NBQ3BCLFVBQVUsR0FBRyxLQUFLO1NBQ2xCLFFBQVEsR0FBRyxLQUFLO1NBQ2hCLE1BQU0sR0FBRyxJQUFJO1NBQ2IsUUFB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QUFSLFFBQVE7O0FBQzNCLFVBQU0sZ0JBQWdCLEdBQUcsVUFBVSxDQUFDLFFBQVEsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLENBQUE7QUFDbkUsVUFBSSxnQkFBZ0IsSUFBSSxjQUFjLEVBQUU7QUFDdEMsZUFBTyxjQUFjLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxhQUFhLENBQUE7T0FDdEQ7S0FDRjs7O1NBdllHLElBQUk7OztBQXFiVixJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFBOztBQUVwQixNQUFNLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQSIsImZpbGUiOiIvVXNlcnMvdGxhbmRhdS9kb3RmaWxlcy8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi9iYXNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2UgYmFiZWxcIlxuXG5jb25zdCBzZXR0aW5ncyA9IHJlcXVpcmUoXCIuL3NldHRpbmdzXCIpXG5cbmxldCBDU09OLCBwYXRoLCBzZWxlY3RMaXN0LCBPcGVyYXRpb25BYm9ydGVkRXJyb3IsIF9fcGx1c1xuY29uc3QgQ0xBU1NfUkVHSVNUUlkgPSB7fVxuXG5mdW5jdGlvbiBfcGx1cygpIHtcbiAgcmV0dXJuIF9fcGx1cyB8fCAoX19wbHVzID0gcmVxdWlyZShcInVuZGVyc2NvcmUtcGx1c1wiKSlcbn1cblxubGV0IFZNUF9MT0FESU5HX0ZJTEVcbmZ1bmN0aW9uIGxvYWRWbXBPcGVyYXRpb25GaWxlKGZpbGVuYW1lKSB7XG4gIC8vIENhbGwgdG8gbG9hZFZtcE9wZXJhdGlvbkZpbGUgY2FuIGJlIG5lc3RlZC5cbiAgLy8gMS4gcmVxdWlyZShcIi4vb3BlcmF0b3ItdHJhbnNmb3JtLXN0cmluZ1wiKVxuICAvLyAyLiBpbiBvcGVyYXRvci10cmFuc2Zvcm0tc3RyaW5nLmNvZmZlZSBjYWxsIEJhc2UuZ2V0Q2xhc3MoXCJPcGVyYXRvclwiKSBjYXVzZSBvcGVyYXRvci5jb2ZmZWUgcmVxdWlyZWQuXG4gIC8vIFNvIHdlIGhhdmUgdG8gc2F2ZSBvcmlnaW5hbCBWTVBfTE9BRElOR19GSUxFIGFuZCByZXN0b3JlIGl0IGFmdGVyIHJlcXVpcmUgZmluaXNoZWQuXG4gIGNvbnN0IHByZXNlcnZlZCA9IFZNUF9MT0FESU5HX0ZJTEVcbiAgVk1QX0xPQURJTkdfRklMRSA9IGZpbGVuYW1lXG4gIHJlcXVpcmUoZmlsZW5hbWUpXG4gIFZNUF9MT0FESU5HX0ZJTEUgPSBwcmVzZXJ2ZWRcbn1cblxuY2xhc3MgQmFzZSB7XG4gIHN0YXRpYyBjb21tYW5kVGFibGUgPSBudWxsXG4gIHN0YXRpYyBjb21tYW5kUHJlZml4ID0gXCJ2aW0tbW9kZS1wbHVzXCJcbiAgc3RhdGljIGNvbW1hbmRTY29wZSA9IFwiYXRvbS10ZXh0LWVkaXRvclwiXG4gIHN0YXRpYyBvcGVyYXRpb25LaW5kID0gbnVsbFxuICBzdGF0aWMgZ2V0RWRpdG9yU3RhdGUgPSBudWxsIC8vIHNldCB0aHJvdWdoIGluaXQoKVxuXG4gIHJlcXVpcmVUYXJnZXQgPSBmYWxzZVxuICByZXF1aXJlSW5wdXQgPSBmYWxzZVxuICByZWNvcmRhYmxlID0gZmFsc2VcbiAgcmVwZWF0ZWQgPSBmYWxzZVxuICB0YXJnZXQgPSBudWxsXG4gIG9wZXJhdG9yID0gbnVsbFxuICBjb3VudCA9IG51bGxcbiAgZGVmYXVsdENvdW50ID0gMVxuICBpbnB1dCA9IG51bGxcblxuICBnZXQgbmFtZSgpIHtcbiAgICByZXR1cm4gdGhpcy5jb25zdHJ1Y3Rvci5uYW1lXG4gIH1cblxuICBjb25zdHJ1Y3Rvcih2aW1TdGF0ZSkge1xuICAgIHRoaXMudmltU3RhdGUgPSB2aW1TdGF0ZVxuICB9XG5cbiAgaW5pdGlhbGl6ZSgpIHt9XG5cbiAgLy8gQ2FsbGVkIGJvdGggb24gY2FuY2VsIGFuZCBzdWNjZXNzXG4gIHJlc2V0U3RhdGUoKSB7fVxuXG4gIC8vIE9wZXJhdGlvbiBwcm9jZXNzb3IgZXhlY3V0ZSBvbmx5IHdoZW4gaXNDb21wbGV0ZSgpIHJldHVybiB0cnVlLlxuICAvLyBJZiBmYWxzZSwgb3BlcmF0aW9uIHByb2Nlc3NvciBwb3N0cG9uZSBpdHMgZXhlY3V0aW9uLlxuICBpc0NvbXBsZXRlKCkge1xuICAgIGlmICh0aGlzLnJlcXVpcmVJbnB1dCAmJiB0aGlzLmlucHV0ID09IG51bGwpIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH0gZWxzZSBpZiAodGhpcy5yZXF1aXJlVGFyZ2V0KSB7XG4gICAgICAvLyBXaGVuIHRoaXMgZnVuY3Rpb24gaXMgY2FsbGVkIGluIEJhc2U6OmNvbnN0cnVjdG9yXG4gICAgICAvLyB0YWdlcnQgaXMgc3RpbGwgc3RyaW5nIGxpa2UgYE1vdmVUb1JpZ2h0YCwgaW4gdGhpcyBjYXNlIGlzQ29tcGxldGVcbiAgICAgIC8vIGlzIG5vdCBhdmFpbGFibGUuXG4gICAgICByZXR1cm4gISF0aGlzLnRhcmdldCAmJiB0aGlzLnRhcmdldC5pc0NvbXBsZXRlKClcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRydWUgLy8gU2V0IGluIG9wZXJhdG9yJ3MgdGFyZ2V0KCBNb3Rpb24gb3IgVGV4dE9iamVjdCApXG4gICAgfVxuICB9XG5cbiAgaXNBc1RhcmdldEV4Y2VwdFNlbGVjdEluVmlzdWFsTW9kZSgpIHtcbiAgICByZXR1cm4gdGhpcy5vcGVyYXRvciAmJiAhdGhpcy5vcGVyYXRvci5pbnN0YW5jZW9mKFwiU2VsZWN0SW5WaXN1YWxNb2RlXCIpXG4gIH1cblxuICBhYm9ydCgpIHtcbiAgICBpZiAoIU9wZXJhdGlvbkFib3J0ZWRFcnJvcikgT3BlcmF0aW9uQWJvcnRlZEVycm9yID0gcmVxdWlyZShcIi4vZXJyb3JzXCIpXG4gICAgdGhyb3cgbmV3IE9wZXJhdGlvbkFib3J0ZWRFcnJvcihcImFib3J0ZWRcIilcbiAgfVxuXG4gIGdldENvdW50KG9mZnNldCA9IDApIHtcbiAgICBpZiAodGhpcy5jb3VudCA9PSBudWxsKSB7XG4gICAgICB0aGlzLmNvdW50ID0gdGhpcy52aW1TdGF0ZS5oYXNDb3VudCgpID8gdGhpcy52aW1TdGF0ZS5nZXRDb3VudCgpIDogdGhpcy5kZWZhdWx0Q291bnRcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuY291bnQgKyBvZmZzZXRcbiAgfVxuXG4gIHJlc2V0Q291bnQoKSB7XG4gICAgdGhpcy5jb3VudCA9IG51bGxcbiAgfVxuXG4gIGNvdW50VGltZXMobGFzdCwgZm4pIHtcbiAgICBpZiAobGFzdCA8IDEpIHJldHVyblxuXG4gICAgbGV0IHN0b3BwZWQgPSBmYWxzZVxuICAgIGNvbnN0IHN0b3AgPSAoKSA9PiAoc3RvcHBlZCA9IHRydWUpXG4gICAgZm9yIChsZXQgY291bnQgPSAxOyBjb3VudCA8PSBsYXN0OyBjb3VudCsrKSB7XG4gICAgICBmbih7Y291bnQsIGlzRmluYWw6IGNvdW50ID09PSBsYXN0LCBzdG9wfSlcbiAgICAgIGlmIChzdG9wcGVkKSBicmVha1xuICAgIH1cbiAgfVxuXG4gIGFjdGl2YXRlTW9kZShtb2RlLCBzdWJtb2RlKSB7XG4gICAgdGhpcy5vbkRpZEZpbmlzaE9wZXJhdGlvbigoKSA9PiB0aGlzLnZpbVN0YXRlLmFjdGl2YXRlKG1vZGUsIHN1Ym1vZGUpKVxuICB9XG5cbiAgYWN0aXZhdGVNb2RlSWZOZWNlc3NhcnkobW9kZSwgc3VibW9kZSkge1xuICAgIGlmICghdGhpcy52aW1TdGF0ZS5pc01vZGUobW9kZSwgc3VibW9kZSkpIHtcbiAgICAgIHRoaXMuYWN0aXZhdGVNb2RlKG1vZGUsIHN1Ym1vZGUpXG4gICAgfVxuICB9XG5cbiAgZ2V0SW5zdGFuY2UobmFtZSwgcHJvcGVydGllcykge1xuICAgIHJldHVybiB0aGlzLmNvbnN0cnVjdG9yLmdldEluc3RhbmNlKHRoaXMudmltU3RhdGUsIG5hbWUsIHByb3BlcnRpZXMpXG4gIH1cblxuICBjYW5jZWxPcGVyYXRpb24oKSB7XG4gICAgdGhpcy52aW1TdGF0ZS5vcGVyYXRpb25TdGFjay5jYW5jZWwodGhpcylcbiAgfVxuXG4gIHByb2Nlc3NPcGVyYXRpb24oKSB7XG4gICAgdGhpcy52aW1TdGF0ZS5vcGVyYXRpb25TdGFjay5wcm9jZXNzKClcbiAgfVxuXG4gIGZvY3VzU2VsZWN0TGlzdChvcHRpb25zID0ge30pIHtcbiAgICB0aGlzLm9uRGlkQ2FuY2VsU2VsZWN0TGlzdCgoKSA9PiB0aGlzLmNhbmNlbE9wZXJhdGlvbigpKVxuICAgIGlmICghc2VsZWN0TGlzdCkge1xuICAgICAgc2VsZWN0TGlzdCA9IG5ldyAocmVxdWlyZShcIi4vc2VsZWN0LWxpc3RcIikpKClcbiAgICB9XG4gICAgc2VsZWN0TGlzdC5zaG93KHRoaXMudmltU3RhdGUsIG9wdGlvbnMpXG4gIH1cblxuICBmb2N1c0lucHV0KG9wdGlvbnMgPSB7fSkge1xuICAgIGlmICghb3B0aW9ucy5vbkNvbmZpcm0pIHtcbiAgICAgIG9wdGlvbnMub25Db25maXJtID0gaW5wdXQgPT4ge1xuICAgICAgICB0aGlzLmlucHV0ID0gaW5wdXRcbiAgICAgICAgdGhpcy5wcm9jZXNzT3BlcmF0aW9uKClcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKCFvcHRpb25zLm9uQ2FuY2VsKSBvcHRpb25zLm9uQ2FuY2VsID0gKCkgPT4gdGhpcy5jYW5jZWxPcGVyYXRpb24oKVxuICAgIGlmICghb3B0aW9ucy5vbkNoYW5nZSkgb3B0aW9ucy5vbkNoYW5nZSA9IGlucHV0ID0+IHRoaXMudmltU3RhdGUuaG92ZXIuc2V0KGlucHV0KVxuXG4gICAgdGhpcy52aW1TdGF0ZS5mb2N1c0lucHV0KG9wdGlvbnMpXG4gIH1cblxuICByZWFkQ2hhcigpIHtcbiAgICB0aGlzLnZpbVN0YXRlLnJlYWRDaGFyKHtcbiAgICAgIG9uQ29uZmlybTogaW5wdXQgPT4ge1xuICAgICAgICB0aGlzLmlucHV0ID0gaW5wdXRcbiAgICAgICAgdGhpcy5wcm9jZXNzT3BlcmF0aW9uKClcbiAgICAgIH0sXG4gICAgICBvbkNhbmNlbDogKCkgPT4gdGhpcy5jYW5jZWxPcGVyYXRpb24oKSxcbiAgICB9KVxuICB9XG5cbiAgLy8gV3JhcHBlciBmb3IgdGhpcy51dGlscyA9PSBzdGFydFxuICBnZXRWaW1Fb2ZCdWZmZXJQb3NpdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy51dGlscy5nZXRWaW1Fb2ZCdWZmZXJQb3NpdGlvbih0aGlzLmVkaXRvcilcbiAgfVxuXG4gIGdldFZpbUxhc3RCdWZmZXJSb3coKSB7XG4gICAgcmV0dXJuIHRoaXMudXRpbHMuZ2V0VmltTGFzdEJ1ZmZlclJvdyh0aGlzLmVkaXRvcilcbiAgfVxuXG4gIGdldFZpbUxhc3RTY3JlZW5Sb3coKSB7XG4gICAgcmV0dXJuIHRoaXMudXRpbHMuZ2V0VmltTGFzdFNjcmVlblJvdyh0aGlzLmVkaXRvcilcbiAgfVxuXG4gIGdldFZhbGlkVmltQnVmZmVyUm93KHJvdykge1xuICAgIHJldHVybiB0aGlzLnV0aWxzLmdldFZhbGlkVmltQnVmZmVyUm93KHRoaXMuZWRpdG9yLCByb3cpXG4gIH1cblxuICBnZXRXb3JkQnVmZmVyUmFuZ2VBbmRLaW5kQXRCdWZmZXJQb3NpdGlvbiguLi5hcmdzKSB7XG4gICAgcmV0dXJuIHRoaXMudXRpbHMuZ2V0V29yZEJ1ZmZlclJhbmdlQW5kS2luZEF0QnVmZmVyUG9zaXRpb24odGhpcy5lZGl0b3IsIC4uLmFyZ3MpXG4gIH1cblxuICBnZXRGaXJzdENoYXJhY3RlclBvc2l0aW9uRm9yQnVmZmVyUm93KHJvdykge1xuICAgIHJldHVybiB0aGlzLnV0aWxzLmdldEZpcnN0Q2hhcmFjdGVyUG9zaXRpb25Gb3JCdWZmZXJSb3codGhpcy5lZGl0b3IsIHJvdylcbiAgfVxuXG4gIGdldEJ1ZmZlclJhbmdlRm9yUm93UmFuZ2Uocm93UmFuZ2UpIHtcbiAgICByZXR1cm4gdGhpcy51dGlscy5nZXRCdWZmZXJSYW5nZUZvclJvd1JhbmdlKHRoaXMuZWRpdG9yLCByb3dSYW5nZSlcbiAgfVxuXG4gIHNjYW5Gb3J3YXJkKC4uLmFyZ3MpIHtcbiAgICByZXR1cm4gdGhpcy51dGlscy5zY2FuRWRpdG9ySW5EaXJlY3Rpb24odGhpcy5lZGl0b3IsIFwiZm9yd2FyZFwiLCAuLi5hcmdzKVxuICB9XG5cbiAgc2NhbkJhY2t3YXJkKC4uLmFyZ3MpIHtcbiAgICByZXR1cm4gdGhpcy51dGlscy5zY2FuRWRpdG9ySW5EaXJlY3Rpb24odGhpcy5lZGl0b3IsIFwiYmFja3dhcmRcIiwgLi4uYXJncylcbiAgfVxuXG4gIGdldEZvbGRTdGFydFJvd0ZvclJvdyguLi5hcmdzKSB7XG4gICAgcmV0dXJuIHRoaXMudXRpbHMuZ2V0Rm9sZFN0YXJ0Um93Rm9yUm93KHRoaXMuZWRpdG9yLCAuLi5hcmdzKVxuICB9XG5cbiAgZ2V0Rm9sZEVuZFJvd0ZvclJvdyguLi5hcmdzKSB7XG4gICAgcmV0dXJuIHRoaXMudXRpbHMuZ2V0Rm9sZEVuZFJvd0ZvclJvdyh0aGlzLmVkaXRvciwgLi4uYXJncylcbiAgfVxuXG4gIGdldEJ1ZmZlclJvd3MoLi4uYXJncykge1xuICAgIHJldHVybiB0aGlzLnV0aWxzLmdldFJvd3ModGhpcy5lZGl0b3IsIFwiYnVmZmVyXCIsIC4uLmFyZ3MpXG4gIH1cblxuICBnZXRTY3JlZW5Sb3dzKC4uLmFyZ3MpIHtcbiAgICByZXR1cm4gdGhpcy51dGlscy5nZXRSb3dzKHRoaXMuZWRpdG9yLCBcInNjcmVlblwiLCAuLi5hcmdzKVxuICB9XG4gIC8vIFdyYXBwZXIgZm9yIHRoaXMudXRpbHMgPT0gZW5kXG5cbiAgaW5zdGFuY2VvZihrbGFzc05hbWUpIHtcbiAgICByZXR1cm4gdGhpcyBpbnN0YW5jZW9mIEJhc2UuZ2V0Q2xhc3Moa2xhc3NOYW1lKVxuICB9XG5cbiAgaXMoa2xhc3NOYW1lKSB7XG4gICAgcmV0dXJuIHRoaXMuY29uc3RydWN0b3IgPT09IEJhc2UuZ2V0Q2xhc3Moa2xhc3NOYW1lKVxuICB9XG5cbiAgaXNPcGVyYXRvcigpIHtcbiAgICAvLyBEb24ndCB1c2UgYGluc3RhbmNlb2ZgIHRvIHBvc3Rwb25lIHJlcXVpcmUgZm9yIGZhc3RlciBhY3RpdmF0aW9uLlxuICAgIHJldHVybiB0aGlzLmNvbnN0cnVjdG9yLm9wZXJhdGlvbktpbmQgPT09IFwib3BlcmF0b3JcIlxuICB9XG5cbiAgaXNNb3Rpb24oKSB7XG4gICAgLy8gRG9uJ3QgdXNlIGBpbnN0YW5jZW9mYCB0byBwb3N0cG9uZSByZXF1aXJlIGZvciBmYXN0ZXIgYWN0aXZhdGlvbi5cbiAgICByZXR1cm4gdGhpcy5jb25zdHJ1Y3Rvci5vcGVyYXRpb25LaW5kID09PSBcIm1vdGlvblwiXG4gIH1cblxuICBpc1RleHRPYmplY3QoKSB7XG4gICAgLy8gRG9uJ3QgdXNlIGBpbnN0YW5jZW9mYCB0byBwb3N0cG9uZSByZXF1aXJlIGZvciBmYXN0ZXIgYWN0aXZhdGlvbi5cbiAgICByZXR1cm4gdGhpcy5jb25zdHJ1Y3Rvci5vcGVyYXRpb25LaW5kID09PSBcInRleHQtb2JqZWN0XCJcbiAgfVxuXG4gIGdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLm1vZGUgPT09IFwidmlzdWFsXCJcbiAgICAgID8gdGhpcy5nZXRDdXJzb3JQb3NpdGlvbkZvclNlbGVjdGlvbih0aGlzLmVkaXRvci5nZXRMYXN0U2VsZWN0aW9uKCkpXG4gICAgICA6IHRoaXMuZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKClcbiAgfVxuXG4gIGdldEN1cnNvckJ1ZmZlclBvc2l0aW9ucygpIHtcbiAgICByZXR1cm4gdGhpcy5tb2RlID09PSBcInZpc3VhbFwiXG4gICAgICA/IHRoaXMuZWRpdG9yLmdldFNlbGVjdGlvbnMoKS5tYXAoc2VsZWN0aW9uID0+IHRoaXMuZ2V0Q3Vyc29yUG9zaXRpb25Gb3JTZWxlY3Rpb24oc2VsZWN0aW9uKSlcbiAgICAgIDogdGhpcy5lZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb25zKClcbiAgfVxuXG4gIGdldEN1cnNvckJ1ZmZlclBvc2l0aW9uc09yZGVyZWQoKSB7XG4gICAgcmV0dXJuIHRoaXMudXRpbHMuc29ydFBvaW50cyh0aGlzLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9ucygpKVxuICB9XG5cbiAgZ2V0QnVmZmVyUG9zaXRpb25Gb3JDdXJzb3IoY3Vyc29yKSB7XG4gICAgcmV0dXJuIHRoaXMubW9kZSA9PT0gXCJ2aXN1YWxcIiA/IHRoaXMuZ2V0Q3Vyc29yUG9zaXRpb25Gb3JTZWxlY3Rpb24oY3Vyc29yLnNlbGVjdGlvbikgOiBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuICB9XG5cbiAgZ2V0Q3Vyc29yUG9zaXRpb25Gb3JTZWxlY3Rpb24oc2VsZWN0aW9uKSB7XG4gICAgcmV0dXJuIHRoaXMuc3dyYXAoc2VsZWN0aW9uKS5nZXRCdWZmZXJQb3NpdGlvbkZvcihcImhlYWRcIiwge2Zyb206IFtcInByb3BlcnR5XCIsIFwic2VsZWN0aW9uXCJdfSlcbiAgfVxuXG4gIGdldFR5cGVPcGVyYXRpb25UeXBlQ2hhcigpIHtcbiAgICBjb25zdCB7b3BlcmF0aW9uS2luZH0gPSB0aGlzLmNvbnN0cnVjdG9yXG4gICAgaWYgKG9wZXJhdGlvbktpbmQgPT09IFwib3BlcmF0b3JcIikgcmV0dXJuIFwiT1wiXG4gICAgZWxzZSBpZiAob3BlcmF0aW9uS2luZCA9PT0gXCJ0ZXh0LW9iamVjdFwiKSByZXR1cm4gXCJUXCJcbiAgICBlbHNlIGlmIChvcGVyYXRpb25LaW5kID09PSBcIm1vdGlvblwiKSByZXR1cm4gXCJNXCJcbiAgICBlbHNlIGlmIChvcGVyYXRpb25LaW5kID09PSBcIm1pc2MtY29tbWFuZFwiKSByZXR1cm4gXCJYXCJcbiAgfVxuXG4gIHRvU3RyaW5nKCkge1xuICAgIGNvbnN0IGJhc2UgPSBgJHt0aGlzLm5hbWV9PCR7dGhpcy5nZXRUeXBlT3BlcmF0aW9uVHlwZUNoYXIoKX0+YFxuICAgIHJldHVybiB0aGlzLnRhcmdldCA/IGAke2Jhc2V9e3RhcmdldCA9ICR7dGhpcy50YXJnZXQudG9TdHJpbmcoKX19YCA6IGJhc2VcbiAgfVxuXG4gIGdldENvbW1hbmROYW1lKCkge1xuICAgIHJldHVybiB0aGlzLmNvbnN0cnVjdG9yLmdldENvbW1hbmROYW1lKClcbiAgfVxuXG4gIGdldENvbW1hbmROYW1lV2l0aG91dFByZWZpeCgpIHtcbiAgICByZXR1cm4gdGhpcy5jb25zdHJ1Y3Rvci5nZXRDb21tYW5kTmFtZVdpdGhvdXRQcmVmaXgoKVxuICB9XG5cbiAgc3RhdGljIHdyaXRlQ29tbWFuZFRhYmxlT25EaXNrKCkge1xuICAgIGNvbnN0IGNvbW1hbmRUYWJsZSA9IHRoaXMuZ2VuZXJhdGVDb21tYW5kVGFibGVCeUVhZ2VyTG9hZCgpXG4gICAgY29uc3QgXyA9IF9wbHVzKClcbiAgICBpZiAoXy5pc0VxdWFsKHRoaXMuY29tbWFuZFRhYmxlLCBjb21tYW5kVGFibGUpKSB7XG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkSW5mbyhcIk5vIGNoYW5nZXMgaW4gY29tbWFuZFRhYmxlXCIsIHtkaXNtaXNzYWJsZTogdHJ1ZX0pXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBpZiAoIUNTT04pIENTT04gPSByZXF1aXJlKFwic2Vhc29uXCIpXG4gICAgaWYgKCFwYXRoKSBwYXRoID0gcmVxdWlyZShcInBhdGhcIilcblxuICAgIGxldCBsb2FkYWJsZUNTT05UZXh0ID0gXCIjIFRoaXMgZmlsZSBpcyBhdXRvIGdlbmVyYXRlZCBieSBgdmltLW1vZGUtcGx1czp3cml0ZS1jb21tYW5kLXRhYmxlLW9uLWRpc2tgIGNvbW1hbmQuXFxuXCJcbiAgICBsb2FkYWJsZUNTT05UZXh0ICs9IFwiIyBET05UIGVkaXQgbWFudWFsbHkuXFxuXCJcbiAgICBsb2FkYWJsZUNTT05UZXh0ICs9IFwibW9kdWxlLmV4cG9ydHMgPVxcblwiXG4gICAgbG9hZGFibGVDU09OVGV4dCArPSBDU09OLnN0cmluZ2lmeShjb21tYW5kVGFibGUpICsgXCJcXG5cIlxuXG4gICAgY29uc3QgY29tbWFuZFRhYmxlUGF0aCA9IHBhdGguam9pbihfX2Rpcm5hbWUsIFwiY29tbWFuZC10YWJsZS5jb2ZmZWVcIilcbiAgICBjb25zdCBvcGVuT3B0aW9uID0ge2FjdGl2YXRlUGFuZTogZmFsc2UsIGFjdGl2YXRlSXRlbTogZmFsc2V9XG4gICAgYXRvbS53b3Jrc3BhY2Uub3Blbihjb21tYW5kVGFibGVQYXRoLCBvcGVuT3B0aW9uKS50aGVuKGVkaXRvciA9PiB7XG4gICAgICBlZGl0b3Iuc2V0VGV4dChsb2FkYWJsZUNTT05UZXh0KVxuICAgICAgZWRpdG9yLnNhdmUoKVxuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEluZm8oXCJVcGRhdGVkIGNvbW1hbmRUYWJsZVwiLCB7ZGlzbWlzc2FibGU6IHRydWV9KVxuICAgIH0pXG4gIH1cblxuICBzdGF0aWMgZ2VuZXJhdGVDb21tYW5kVGFibGVCeUVhZ2VyTG9hZCgpIHtcbiAgICAvLyBOT1RFOiBjaGFuZ2luZyBvcmRlciBhZmZlY3RzIG91dHB1dCBvZiBsaWIvY29tbWFuZC10YWJsZS5jb2ZmZWVcbiAgICBjb25zdCBmaWxlc1RvTG9hZCA9IFtcbiAgICAgIFwiLi9vcGVyYXRvclwiLFxuICAgICAgXCIuL29wZXJhdG9yLWluc2VydFwiLFxuICAgICAgXCIuL29wZXJhdG9yLXRyYW5zZm9ybS1zdHJpbmdcIixcbiAgICAgIFwiLi9tb3Rpb25cIixcbiAgICAgIFwiLi9tb3Rpb24tc2VhcmNoXCIsXG4gICAgICBcIi4vdGV4dC1vYmplY3RcIixcbiAgICAgIFwiLi9taXNjLWNvbW1hbmRcIixcbiAgICBdXG4gICAgZmlsZXNUb0xvYWQuZm9yRWFjaChsb2FkVm1wT3BlcmF0aW9uRmlsZSlcbiAgICBjb25zdCBfID0gX3BsdXMoKVxuICAgIGNvbnN0IGtsYXNzZXNHcm91cGVkQnlGaWxlID0gXy5ncm91cEJ5KF8udmFsdWVzKENMQVNTX1JFR0lTVFJZKSwga2xhc3MgPT4ga2xhc3MuZmlsZSlcblxuICAgIGNvbnN0IGNvbW1hbmRUYWJsZSA9IHt9XG4gICAgZm9yIChjb25zdCBmaWxlIG9mIGZpbGVzVG9Mb2FkKSB7XG4gICAgICBmb3IgKGNvbnN0IGtsYXNzIG9mIGtsYXNzZXNHcm91cGVkQnlGaWxlW2ZpbGVdKSB7XG4gICAgICAgIGNvbW1hbmRUYWJsZVtrbGFzcy5uYW1lXSA9IGtsYXNzLmNvbW1hbmRcbiAgICAgICAgICA/IHtmaWxlOiBrbGFzcy5maWxlLCBjb21tYW5kTmFtZToga2xhc3MuZ2V0Q29tbWFuZE5hbWUoKSwgY29tbWFuZFNjb3BlOiBrbGFzcy5jb21tYW5kU2NvcGV9XG4gICAgICAgICAgOiB7ZmlsZToga2xhc3MuZmlsZX1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGNvbW1hbmRUYWJsZVxuICB9XG5cbiAgc3RhdGljIGluaXQoZ2V0RWRpdG9yU3RhdGUpIHtcbiAgICB0aGlzLmdldEVkaXRvclN0YXRlID0gZ2V0RWRpdG9yU3RhdGVcblxuICAgIHRoaXMuY29tbWFuZFRhYmxlID0gcmVxdWlyZShcIi4vY29tbWFuZC10YWJsZVwiKVxuICAgIGNvbnN0IHN1YnNjcmlwdGlvbnMgPSBbXVxuICAgIGZvciAoY29uc3QgbmFtZSBpbiB0aGlzLmNvbW1hbmRUYWJsZSkge1xuICAgICAgY29uc3Qgc3BlYyA9IHRoaXMuY29tbWFuZFRhYmxlW25hbWVdXG4gICAgICBpZiAoc3BlYy5jb21tYW5kTmFtZSkge1xuICAgICAgICBzdWJzY3JpcHRpb25zLnB1c2godGhpcy5yZWdpc3RlckNvbW1hbmRGcm9tU3BlYyhuYW1lLCBzcGVjKSlcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHN1YnNjcmlwdGlvbnNcbiAgfVxuXG4gIHN0YXRpYyByZWdpc3Rlcihjb21tYW5kID0gdHJ1ZSkge1xuICAgIHRoaXMuY29tbWFuZCA9IGNvbW1hbmRcbiAgICB0aGlzLmZpbGUgPSBWTVBfTE9BRElOR19GSUxFXG4gICAgaWYgKHRoaXMubmFtZSBpbiBDTEFTU19SRUdJU1RSWSkge1xuICAgICAgY29uc29sZS53YXJuKGBEdXBsaWNhdGUgY29uc3RydWN0b3IgJHt0aGlzLm5hbWV9YClcbiAgICB9XG4gICAgQ0xBU1NfUkVHSVNUUllbdGhpcy5uYW1lXSA9IHRoaXNcbiAgfVxuXG4gIHN0YXRpYyBleHRlbmQoLi4uYXJncykge1xuICAgIGNvbnNvbGUuZXJyb3IoXCJjYWxsaW5nIGRlcHJlY2F0ZWQgQmFzZS5leHRlbmQoKSwgdXNlIEJhc2UucmVnaXN0ZXIgaW5zdGVhZCFcIilcbiAgICB0aGlzLnJlZ2lzdGVyKC4uLmFyZ3MpXG4gIH1cblxuICBzdGF0aWMgZ2V0Q2xhc3MobmFtZSkge1xuICAgIGlmIChuYW1lIGluIENMQVNTX1JFR0lTVFJZKSByZXR1cm4gQ0xBU1NfUkVHSVNUUllbbmFtZV1cblxuICAgIGNvbnN0IGZpbGVUb0xvYWQgPSB0aGlzLmNvbW1hbmRUYWJsZVtuYW1lXS5maWxlXG4gICAgaWYgKGF0b20uaW5EZXZNb2RlKCkgJiYgc2V0dGluZ3MuZ2V0KFwiZGVidWdcIikpIHtcbiAgICAgIGNvbnNvbGUubG9nKGBsYXp5LXJlcXVpcmU6ICR7ZmlsZVRvTG9hZH0gZm9yICR7bmFtZX1gKVxuICAgIH1cbiAgICBsb2FkVm1wT3BlcmF0aW9uRmlsZShmaWxlVG9Mb2FkKVxuICAgIGlmIChuYW1lIGluIENMQVNTX1JFR0lTVFJZKSByZXR1cm4gQ0xBU1NfUkVHSVNUUllbbmFtZV1cblxuICAgIHRocm93IG5ldyBFcnJvcihgY2xhc3MgJyR7bmFtZX0nIG5vdCBmb3VuZGApXG4gIH1cblxuICBzdGF0aWMgZ2V0SW5zdGFuY2UodmltU3RhdGUsIGtsYXNzLCBwcm9wZXJ0aWVzKSB7XG4gICAga2xhc3MgPSB0eXBlb2Yga2xhc3MgPT09IFwiZnVuY3Rpb25cIiA/IGtsYXNzIDogQmFzZS5nZXRDbGFzcyhrbGFzcylcbiAgICBjb25zdCBvYmplY3QgPSBuZXcga2xhc3ModmltU3RhdGUpXG4gICAgaWYgKHByb3BlcnRpZXMpIE9iamVjdC5hc3NpZ24ob2JqZWN0LCBwcm9wZXJ0aWVzKVxuICAgIG9iamVjdC5pbml0aWFsaXplKClcbiAgICByZXR1cm4gb2JqZWN0XG4gIH1cblxuICBzdGF0aWMgZ2V0Q2xhc3NSZWdpc3RyeSgpIHtcbiAgICByZXR1cm4gQ0xBU1NfUkVHSVNUUllcbiAgfVxuXG4gIHN0YXRpYyBnZXRDb21tYW5kTmFtZSgpIHtcbiAgICByZXR1cm4gdGhpcy5jb21tYW5kUHJlZml4ICsgXCI6XCIgKyBfcGx1cygpLmRhc2hlcml6ZSh0aGlzLm5hbWUpXG4gIH1cblxuICBzdGF0aWMgZ2V0Q29tbWFuZE5hbWVXaXRob3V0UHJlZml4KCkge1xuICAgIHJldHVybiBfcGx1cygpLmRhc2hlcml6ZSh0aGlzLm5hbWUpXG4gIH1cblxuICBzdGF0aWMgcmVnaXN0ZXJDb21tYW5kKCkge1xuICAgIHJldHVybiB0aGlzLnJlZ2lzdGVyQ29tbWFuZEZyb21TcGVjKHRoaXMubmFtZSwge1xuICAgICAgY29tbWFuZFNjb3BlOiB0aGlzLmNvbW1hbmRTY29wZSxcbiAgICAgIGNvbW1hbmROYW1lOiB0aGlzLmdldENvbW1hbmROYW1lKCksXG4gICAgICBnZXRDbGFzczogKCkgPT4gdGhpcyxcbiAgICB9KVxuICB9XG5cbiAgc3RhdGljIHJlZ2lzdGVyQ29tbWFuZEZyb21TcGVjKG5hbWUsIHNwZWMpIHtcbiAgICBsZXQge2NvbW1hbmRTY29wZSA9IFwiYXRvbS10ZXh0LWVkaXRvclwiLCBjb21tYW5kUHJlZml4ID0gXCJ2aW0tbW9kZS1wbHVzXCIsIGNvbW1hbmROYW1lLCBnZXRDbGFzc30gPSBzcGVjXG4gICAgaWYgKCFjb21tYW5kTmFtZSkgY29tbWFuZE5hbWUgPSBjb21tYW5kUHJlZml4ICsgXCI6XCIgKyBfcGx1cygpLmRhc2hlcml6ZShuYW1lKVxuICAgIGlmICghZ2V0Q2xhc3MpIGdldENsYXNzID0gbmFtZSA9PiB0aGlzLmdldENsYXNzKG5hbWUpXG5cbiAgICBjb25zdCBnZXRFZGl0b3JTdGF0ZSA9IHRoaXMuZ2V0RWRpdG9yU3RhdGVcbiAgICByZXR1cm4gYXRvbS5jb21tYW5kcy5hZGQoY29tbWFuZFNjb3BlLCBjb21tYW5kTmFtZSwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgIGNvbnN0IHZpbVN0YXRlID0gZ2V0RWRpdG9yU3RhdGUodGhpcy5nZXRNb2RlbCgpKSB8fCBnZXRFZGl0b3JTdGF0ZShhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCkpXG4gICAgICBpZiAodmltU3RhdGUpIHZpbVN0YXRlLm9wZXJhdGlvblN0YWNrLnJ1bihnZXRDbGFzcyhuYW1lKSkgLy8gdmltU3RhdGUgcG9zc2libHkgYmUgdW5kZWZpbmVkIFNlZSAjODVcbiAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXG4gICAgfSlcbiAgfVxuXG4gIHN0YXRpYyBnZXRLaW5kRm9yQ29tbWFuZE5hbWUoY29tbWFuZCkge1xuICAgIGNvbnN0IGNvbW1hbmRXaXRob3V0UHJlZml4ID0gY29tbWFuZC5yZXBsYWNlKC9edmltLW1vZGUtcGx1czovLCBcIlwiKVxuICAgIGNvbnN0IHtjYXBpdGFsaXplLCBjYW1lbGl6ZX0gPSBfcGx1cygpXG4gICAgY29uc3QgY29tbWFuZENsYXNzTmFtZSA9IGNhcGl0YWxpemUoY2FtZWxpemUoY29tbWFuZFdpdGhvdXRQcmVmaXgpKVxuICAgIGlmIChjb21tYW5kQ2xhc3NOYW1lIGluIENMQVNTX1JFR0lTVFJZKSB7XG4gICAgICByZXR1cm4gQ0xBU1NfUkVHSVNUUllbY29tbWFuZENsYXNzTmFtZV0ub3BlcmF0aW9uS2luZFxuICAgIH1cbiAgfVxuXG4gIC8vIFByb3h5IHByb3BwZXJ0aWVzIGFuZCBtZXRob2RzXG4gIC8vPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gIGdldCBtb2RlKCkgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5tb2RlIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIGdldCBzdWJtb2RlKCkgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5zdWJtb2RlIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIGdldCBzd3JhcCgpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUuc3dyYXAgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgZ2V0IHV0aWxzKCkgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS51dGlscyB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBnZXQgZWRpdG9yKCkgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5lZGl0b3IgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgZ2V0IGVkaXRvckVsZW1lbnQoKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLmVkaXRvckVsZW1lbnQgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgZ2V0IGdsb2JhbFN0YXRlKCkgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5nbG9iYWxTdGF0ZSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBnZXQgbXV0YXRpb25NYW5hZ2VyKCkgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5tdXRhdGlvbk1hbmFnZXIgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgZ2V0IG9jY3VycmVuY2VNYW5hZ2VyKCkgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5vY2N1cnJlbmNlTWFuYWdlciB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBnZXQgcGVyc2lzdGVudFNlbGVjdGlvbigpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUucGVyc2lzdGVudFNlbGVjdGlvbiB9IC8vIHByZXR0aWVyLWlnbm9yZVxuXG4gIG9uRGlkQ2hhbmdlU2VhcmNoKC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUub25EaWRDaGFuZ2VTZWFyY2goLi4uYXJncykgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgb25EaWRDb25maXJtU2VhcmNoKC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUub25EaWRDb25maXJtU2VhcmNoKC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIG9uRGlkQ2FuY2VsU2VhcmNoKC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUub25EaWRDYW5jZWxTZWFyY2goLi4uYXJncykgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgb25EaWRDb21tYW5kU2VhcmNoKC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUub25EaWRDb21tYW5kU2VhcmNoKC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIG9uRGlkU2V0VGFyZ2V0KC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUub25EaWRTZXRUYXJnZXQoLi4uYXJncykgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgZW1pdERpZFNldFRhcmdldCguLi5hcmdzKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLmVtaXREaWRTZXRUYXJnZXQoLi4uYXJncykgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgb25XaWxsU2VsZWN0VGFyZ2V0KC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUub25XaWxsU2VsZWN0VGFyZ2V0KC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIGVtaXRXaWxsU2VsZWN0VGFyZ2V0KC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUuZW1pdFdpbGxTZWxlY3RUYXJnZXQoLi4uYXJncykgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgb25EaWRTZWxlY3RUYXJnZXQoLi4uYXJncykgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5vbkRpZFNlbGVjdFRhcmdldCguLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBlbWl0RGlkU2VsZWN0VGFyZ2V0KC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUuZW1pdERpZFNlbGVjdFRhcmdldCguLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBvbkRpZEZhaWxTZWxlY3RUYXJnZXQoLi4uYXJncykgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5vbkRpZEZhaWxTZWxlY3RUYXJnZXQoLi4uYXJncykgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgZW1pdERpZEZhaWxTZWxlY3RUYXJnZXQoLi4uYXJncykgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5lbWl0RGlkRmFpbFNlbGVjdFRhcmdldCguLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBvbldpbGxGaW5pc2hNdXRhdGlvbiguLi5hcmdzKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLm9uV2lsbEZpbmlzaE11dGF0aW9uKC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIGVtaXRXaWxsRmluaXNoTXV0YXRpb24oLi4uYXJncykgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5lbWl0V2lsbEZpbmlzaE11dGF0aW9uKC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIG9uRGlkRmluaXNoTXV0YXRpb24oLi4uYXJncykgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5vbkRpZEZpbmlzaE11dGF0aW9uKC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIGVtaXREaWRGaW5pc2hNdXRhdGlvbiguLi5hcmdzKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLmVtaXREaWRGaW5pc2hNdXRhdGlvbiguLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBvbkRpZEZpbmlzaE9wZXJhdGlvbiguLi5hcmdzKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLm9uRGlkRmluaXNoT3BlcmF0aW9uKC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIG9uRGlkUmVzZXRPcGVyYXRpb25TdGFjayguLi5hcmdzKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLm9uRGlkUmVzZXRPcGVyYXRpb25TdGFjayguLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBvbldpbGxBY3RpdmF0ZU1vZGUoLi4uYXJncykgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5vbldpbGxBY3RpdmF0ZU1vZGUoLi4uYXJncykgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgb25EaWRBY3RpdmF0ZU1vZGUoLi4uYXJncykgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5vbkRpZEFjdGl2YXRlTW9kZSguLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBwcmVlbXB0V2lsbERlYWN0aXZhdGVNb2RlKC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUucHJlZW1wdFdpbGxEZWFjdGl2YXRlTW9kZSguLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBvbldpbGxEZWFjdGl2YXRlTW9kZSguLi5hcmdzKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLm9uV2lsbERlYWN0aXZhdGVNb2RlKC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIG9uRGlkRGVhY3RpdmF0ZU1vZGUoLi4uYXJncykgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5vbkRpZERlYWN0aXZhdGVNb2RlKC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIG9uRGlkQ2FuY2VsU2VsZWN0TGlzdCguLi5hcmdzKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLm9uRGlkQ2FuY2VsU2VsZWN0TGlzdCguLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBzdWJzY3JpYmUoLi4uYXJncykgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5zdWJzY3JpYmUoLi4uYXJncykgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgaXNNb2RlKC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUuaXNNb2RlKC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIGdldEJsb2Nrd2lzZVNlbGVjdGlvbnMoLi4uYXJncykgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5nZXRCbG9ja3dpc2VTZWxlY3Rpb25zKC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIGdldExhc3RCbG9ja3dpc2VTZWxlY3Rpb24oLi4uYXJncykgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5nZXRMYXN0QmxvY2t3aXNlU2VsZWN0aW9uKC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIGFkZFRvQ2xhc3NMaXN0KC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUuYWRkVG9DbGFzc0xpc3QoLi4uYXJncykgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgZ2V0Q29uZmlnKC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUuZ2V0Q29uZmlnKC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG59XG5CYXNlLnJlZ2lzdGVyKGZhbHNlKVxuXG5tb2R1bGUuZXhwb3J0cyA9IEJhc2VcbiJdfQ==