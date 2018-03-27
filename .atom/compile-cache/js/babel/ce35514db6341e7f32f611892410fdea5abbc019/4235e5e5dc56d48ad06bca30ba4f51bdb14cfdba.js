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

  // NOTE: initialize() must return `this`

  _createClass(Base, [{
    key: "initialize",
    value: function initialize() {
      return this;
    }

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
      if (!options.onCancel) {
        options.onCancel = function () {
          return _this3.cancelOperation();
        };
      }
      if (!options.onChange) {
        options.onChange = function (input) {
          return _this3.vimState.hover.set(input);
        };
      }
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
    key: "getWordBufferRangeAndKindAtBufferPosition",
    value: function getWordBufferRangeAndKindAtBufferPosition(point, options) {
      return this.utils.getWordBufferRangeAndKindAtBufferPosition(this.editor, point, options);
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
      var _utils;

      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return (_utils = this.utils).scanEditorInDirection.apply(_utils, [this.editor, "forward"].concat(args));
    }
  }, {
    key: "scanBackward",
    value: function scanBackward() {
      var _utils2;

      for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      return (_utils2 = this.utils).scanEditorInDirection.apply(_utils2, [this.editor, "backward"].concat(args));
    }
  }, {
    key: "getFoldStartRowForRow",
    value: function getFoldStartRowForRow() {
      var _utils3;

      for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        args[_key3] = arguments[_key3];
      }

      return (_utils3 = this.utils).getFoldStartRowForRow.apply(_utils3, [this.editor].concat(args));
    }
  }, {
    key: "getFoldEndRowForRow",
    value: function getFoldEndRowForRow() {
      var _utils4;

      for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
        args[_key4] = arguments[_key4];
      }

      return (_utils4 = this.utils).getFoldEndRowForRow.apply(_utils4, [this.editor].concat(args));
    }
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
      return this.mode === "visual" ? this.editor.getSelections().map(this.getCursorPositionForSelection.bind(this)) : this.editor.getCursorBufferPositions();
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
    key: "toString",
    value: function toString() {
      var targetStr = this.target ? ", target: " + this.target.toString() : "";
      return this.name + "{wise: " + this.wise + targetStr + "}";
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
    key: "onDidSetOperatorModifier",
    value: function onDidSetOperatorModifier() {
      var _vimState19;

      return (_vimState19 = this.vimState).onDidSetOperatorModifier.apply(_vimState19, arguments);
    }
    // prettier-ignore
  }, {
    key: "onWillActivateMode",
    value: function onWillActivateMode() {
      var _vimState20;

      return (_vimState20 = this.vimState).onWillActivateMode.apply(_vimState20, arguments);
    }
    // prettier-ignore
  }, {
    key: "onDidActivateMode",
    value: function onDidActivateMode() {
      var _vimState21;

      return (_vimState21 = this.vimState).onDidActivateMode.apply(_vimState21, arguments);
    }
    // prettier-ignore
  }, {
    key: "preemptWillDeactivateMode",
    value: function preemptWillDeactivateMode() {
      var _vimState22;

      return (_vimState22 = this.vimState).preemptWillDeactivateMode.apply(_vimState22, arguments);
    }
    // prettier-ignore
  }, {
    key: "onWillDeactivateMode",
    value: function onWillDeactivateMode() {
      var _vimState23;

      return (_vimState23 = this.vimState).onWillDeactivateMode.apply(_vimState23, arguments);
    }
    // prettier-ignore
  }, {
    key: "onDidDeactivateMode",
    value: function onDidDeactivateMode() {
      var _vimState24;

      return (_vimState24 = this.vimState).onDidDeactivateMode.apply(_vimState24, arguments);
    }
    // prettier-ignore
  }, {
    key: "onDidCancelSelectList",
    value: function onDidCancelSelectList() {
      var _vimState25;

      return (_vimState25 = this.vimState).onDidCancelSelectList.apply(_vimState25, arguments);
    }
    // prettier-ignore
  }, {
    key: "subscribe",
    value: function subscribe() {
      var _vimState26;

      return (_vimState26 = this.vimState).subscribe.apply(_vimState26, arguments);
    }
    // prettier-ignore
  }, {
    key: "isMode",
    value: function isMode() {
      var _vimState27;

      return (_vimState27 = this.vimState).isMode.apply(_vimState27, arguments);
    }
    // prettier-ignore
  }, {
    key: "getBlockwiseSelections",
    value: function getBlockwiseSelections() {
      var _vimState28;

      return (_vimState28 = this.vimState).getBlockwiseSelections.apply(_vimState28, arguments);
    }
    // prettier-ignore
  }, {
    key: "getLastBlockwiseSelection",
    value: function getLastBlockwiseSelection() {
      var _vimState29;

      return (_vimState29 = this.vimState).getLastBlockwiseSelection.apply(_vimState29, arguments);
    }
    // prettier-ignore
  }, {
    key: "addToClassList",
    value: function addToClassList() {
      var _vimState30;

      return (_vimState30 = this.vimState).addToClassList.apply(_vimState30, arguments);
    }
    // prettier-ignore
  }, {
    key: "getConfig",
    value: function getConfig() {
      var _vimState31;

      return (_vimState31 = this.vimState).getConfig.apply(_vimState31, arguments);
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
      atom.workspace.open(commandTablePath).then(function (editor) {
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
          commandTable[klass.name] = klass.isCommand() ? { file: klass.file, commandName: klass.getCommandName(), commandScope: klass.getCommandScope() } : { file: klass.file };
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
    value: function getInstance(vimState, klassOrName, properties) {
      var klass = typeof klassOrName === "function" ? klassOrName : Base.getClass(klassOrName);
      var instance = new klass(vimState);
      if (properties) Object.assign(instance, properties);
      return instance.initialize(); // initialize must return instance.
    }
  }, {
    key: "getClassRegistry",
    value: function getClassRegistry() {
      return CLASS_REGISTRY;
    }
  }, {
    key: "isCommand",
    value: function isCommand() {
      return this.command;
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
    key: "getCommandScope",
    value: function getCommandScope() {
      return this.commandScope;
    }
  }, {
    key: "registerCommand",
    value: function registerCommand() {
      var _this5 = this;

      return this.registerCommandFromSpec(this.name, {
        commandScope: this.getCommandScope(),
        commandName: this.getCommandName(),
        getClass: function getClass() {
          return _this5;
        }
      });
    }
  }, {
    key: "registerCommandFromSpec",
    value: function registerCommandFromSpec(name, spec) {
      var _this6 = this;

      var _spec$commandScope = spec.commandScope;
      var commandScope = _spec$commandScope === undefined ? "atom-text-editor" : _spec$commandScope;
      var _spec$commandPrefix = spec.commandPrefix;
      var commandPrefix = _spec$commandPrefix === undefined ? "vim-mode-plus" : _spec$commandPrefix;
      var commandName = spec.commandName;
      var getClass = spec.getClass;

      if (!commandName) commandName = commandPrefix + ":" + _plus().dasherize(name);
      if (!getClass) getClass = function (name) {
        return _this6.getClass(name);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL2Jhc2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsV0FBVyxDQUFBOzs7Ozs7QUFFWCxJQUFNLFFBQVEsR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUE7O0FBRXRDLElBQUksSUFBSSxZQUFBO0lBQUUsSUFBSSxZQUFBO0lBQUUsVUFBVSxZQUFBO0lBQUUscUJBQXFCLFlBQUE7SUFBRSxNQUFNLFlBQUEsQ0FBQTtBQUN6RCxJQUFNLGNBQWMsR0FBRyxFQUFFLENBQUE7O0FBRXpCLFNBQVMsS0FBSyxHQUFHO0FBQ2YsU0FBTyxNQUFNLEtBQUssTUFBTSxHQUFHLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFBLEFBQUMsQ0FBQTtDQUN2RDs7QUFFRCxJQUFJLGdCQUFnQixZQUFBLENBQUE7QUFDcEIsU0FBUyxvQkFBb0IsQ0FBQyxRQUFRLEVBQUU7Ozs7O0FBS3RDLE1BQU0sU0FBUyxHQUFHLGdCQUFnQixDQUFBO0FBQ2xDLGtCQUFnQixHQUFHLFFBQVEsQ0FBQTtBQUMzQixTQUFPLENBQUMsUUFBUSxDQUFDLENBQUE7QUFDakIsa0JBQWdCLEdBQUcsU0FBUyxDQUFBO0NBQzdCOztJQUVLLElBQUk7ZUFBSixJQUFJOztTQWlCQSxlQUFHO0FBQ1QsYUFBTyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQTtLQUM3Qjs7O1dBbEJxQixJQUFJOzs7O1dBQ0gsZUFBZTs7OztXQUNoQixrQkFBa0I7Ozs7V0FDakIsSUFBSTs7OztXQUNILElBQUk7Ozs7OztBQWdCakIsV0FyQlAsSUFBSSxDQXFCSSxRQUFRLEVBQUU7MEJBckJsQixJQUFJOztTQU9SLGFBQWEsR0FBRyxLQUFLO1NBQ3JCLFlBQVksR0FBRyxLQUFLO1NBQ3BCLFVBQVUsR0FBRyxLQUFLO1NBQ2xCLFFBQVEsR0FBRyxLQUFLO1NBQ2hCLE1BQU0sR0FBRyxJQUFJO1NBQ2IsUUFBUSxHQUFHLElBQUk7U0FDZixLQUFLLEdBQUcsSUFBSTtTQUNaLFlBQVksR0FBRyxDQUFDO1NBQ2hCLEtBQUssR0FBRyxJQUFJOztBQU9WLFFBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFBO0dBQ3pCOzs7O2VBdkJHLElBQUk7O1dBMEJFLHNCQUFHO0FBQ1gsYUFBTyxJQUFJLENBQUE7S0FDWjs7Ozs7V0FHUyxzQkFBRyxFQUFFOzs7Ozs7V0FJTCxzQkFBRztBQUNYLFVBQUksSUFBSSxDQUFDLFlBQVksSUFBSSxJQUFJLENBQUMsS0FBSyxJQUFJLElBQUksRUFBRTtBQUMzQyxlQUFPLEtBQUssQ0FBQTtPQUNiLE1BQU0sSUFBSSxJQUFJLENBQUMsYUFBYSxFQUFFOzs7O0FBSTdCLGVBQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUUsQ0FBQTtPQUNqRCxNQUFNO0FBQ0wsZUFBTyxJQUFJLENBQUE7T0FDWjtLQUNGOzs7V0FFaUMsOENBQUc7QUFDbkMsYUFBTyxJQUFJLENBQUMsUUFBUSxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsY0FBVyxDQUFDLG9CQUFvQixDQUFDLENBQUE7S0FDeEU7OztXQUVJLGlCQUFHO0FBQ04sVUFBSSxDQUFDLHFCQUFxQixFQUFFLHFCQUFxQixHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQTtBQUN2RSxZQUFNLElBQUkscUJBQXFCLENBQUMsU0FBUyxDQUFDLENBQUE7S0FDM0M7OztXQUVPLG9CQUFhO1VBQVosTUFBTSx5REFBRyxDQUFDOztBQUNqQixVQUFJLElBQUksQ0FBQyxLQUFLLElBQUksSUFBSSxFQUFFO0FBQ3RCLFlBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUE7T0FDckY7QUFDRCxhQUFPLElBQUksQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFBO0tBQzNCOzs7V0FFUyxzQkFBRztBQUNYLFVBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFBO0tBQ2xCOzs7V0FFUyxvQkFBQyxJQUFJLEVBQUUsRUFBRSxFQUFFO0FBQ25CLFVBQUksSUFBSSxHQUFHLENBQUMsRUFBRSxPQUFNOztBQUVwQixVQUFJLE9BQU8sR0FBRyxLQUFLLENBQUE7QUFDbkIsVUFBTSxJQUFJLEdBQUcsU0FBUCxJQUFJO2VBQVUsT0FBTyxHQUFHLElBQUk7T0FBQyxDQUFBO0FBQ25DLFdBQUssSUFBSSxLQUFLLEdBQUcsQ0FBQyxFQUFFLEtBQUssSUFBSSxJQUFJLEVBQUUsS0FBSyxFQUFFLEVBQUU7QUFDMUMsVUFBRSxDQUFDLEVBQUMsS0FBSyxFQUFMLEtBQUssRUFBRSxPQUFPLEVBQUUsS0FBSyxLQUFLLElBQUksRUFBRSxJQUFJLEVBQUosSUFBSSxFQUFDLENBQUMsQ0FBQTtBQUMxQyxZQUFJLE9BQU8sRUFBRSxNQUFLO09BQ25CO0tBQ0Y7OztXQUVXLHNCQUFDLElBQUksRUFBRSxPQUFPLEVBQUU7OztBQUMxQixVQUFJLENBQUMsb0JBQW9CLENBQUM7ZUFBTSxNQUFLLFFBQVEsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQztPQUFBLENBQUMsQ0FBQTtLQUN2RTs7O1dBRXNCLGlDQUFDLElBQUksRUFBRSxPQUFPLEVBQUU7QUFDckMsVUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsRUFBRTtBQUN4QyxZQUFJLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQTtPQUNqQztLQUNGOzs7V0FFVSxxQkFBQyxJQUFJLEVBQUUsVUFBVSxFQUFFO0FBQzVCLGFBQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUUsVUFBVSxDQUFDLENBQUE7S0FDckU7OztXQUVjLDJCQUFHO0FBQ2hCLFVBQUksQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQTtLQUMxQzs7O1dBRWUsNEJBQUc7QUFDakIsVUFBSSxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsT0FBTyxFQUFFLENBQUE7S0FDdkM7OztXQUVjLDJCQUFlOzs7VUFBZCxPQUFPLHlEQUFHLEVBQUU7O0FBQzFCLFVBQUksQ0FBQyxxQkFBcUIsQ0FBQztlQUFNLE9BQUssZUFBZSxFQUFFO09BQUEsQ0FBQyxDQUFBO0FBQ3hELFVBQUksQ0FBQyxVQUFVLEVBQUU7QUFDZixrQkFBVSxHQUFHLEtBQUssT0FBTyxDQUFDLGVBQWUsRUFBQyxFQUFHLENBQUE7T0FDOUM7QUFDRCxnQkFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFBO0tBQ3hDOzs7V0FFUyxzQkFBZTs7O1VBQWQsT0FBTyx5REFBRyxFQUFFOztBQUNyQixVQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRTtBQUN0QixlQUFPLENBQUMsU0FBUyxHQUFHLFVBQUEsS0FBSyxFQUFJO0FBQzNCLGlCQUFLLEtBQUssR0FBRyxLQUFLLENBQUE7QUFDbEIsaUJBQUssZ0JBQWdCLEVBQUUsQ0FBQTtTQUN4QixDQUFBO09BQ0Y7QUFDRCxVQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRTtBQUNyQixlQUFPLENBQUMsUUFBUSxHQUFHO2lCQUFNLE9BQUssZUFBZSxFQUFFO1NBQUEsQ0FBQTtPQUNoRDtBQUNELFVBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFO0FBQ3JCLGVBQU8sQ0FBQyxRQUFRLEdBQUcsVUFBQSxLQUFLO2lCQUFJLE9BQUssUUFBUSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDO1NBQUEsQ0FBQTtPQUMzRDtBQUNELFVBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFBO0tBQ2xDOzs7V0FFTyxvQkFBRzs7O0FBQ1QsVUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUM7QUFDckIsaUJBQVMsRUFBRSxtQkFBQSxLQUFLLEVBQUk7QUFDbEIsaUJBQUssS0FBSyxHQUFHLEtBQUssQ0FBQTtBQUNsQixpQkFBSyxnQkFBZ0IsRUFBRSxDQUFBO1NBQ3hCO0FBQ0QsZ0JBQVEsRUFBRTtpQkFBTSxPQUFLLGVBQWUsRUFBRTtTQUFBO09BQ3ZDLENBQUMsQ0FBQTtLQUNIOzs7V0FFc0IsbUNBQUc7QUFDeEIsYUFBTyxJQUFJLENBQUMsS0FBSyxDQUFDLHVCQUF1QixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQTtLQUN2RDs7O1dBRWtCLCtCQUFHO0FBQ3BCLGFBQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUE7S0FDbkQ7OztXQUVrQiwrQkFBRztBQUNwQixhQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFBO0tBQ25EOzs7V0FFd0MsbURBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRTtBQUN4RCxhQUFPLElBQUksQ0FBQyxLQUFLLENBQUMseUNBQXlDLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUE7S0FDekY7OztXQUVvQywrQ0FBQyxHQUFHLEVBQUU7QUFDekMsYUFBTyxJQUFJLENBQUMsS0FBSyxDQUFDLHFDQUFxQyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUE7S0FDMUU7OztXQUV3QixtQ0FBQyxRQUFRLEVBQUU7QUFDbEMsYUFBTyxJQUFJLENBQUMsS0FBSyxDQUFDLHlCQUF5QixDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUE7S0FDbkU7OztXQUVVLHVCQUFVOzs7d0NBQU4sSUFBSTtBQUFKLFlBQUk7OztBQUNqQixhQUFPLFVBQUEsSUFBSSxDQUFDLEtBQUssRUFBQyxxQkFBcUIsTUFBQSxVQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsU0FBUyxTQUFLLElBQUksRUFBQyxDQUFBO0tBQ3pFOzs7V0FFVyx3QkFBVTs7O3lDQUFOLElBQUk7QUFBSixZQUFJOzs7QUFDbEIsYUFBTyxXQUFBLElBQUksQ0FBQyxLQUFLLEVBQUMscUJBQXFCLE1BQUEsV0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLFVBQVUsU0FBSyxJQUFJLEVBQUMsQ0FBQTtLQUMxRTs7O1dBRW9CLGlDQUFVOzs7eUNBQU4sSUFBSTtBQUFKLFlBQUk7OztBQUMzQixhQUFPLFdBQUEsSUFBSSxDQUFDLEtBQUssRUFBQyxxQkFBcUIsTUFBQSxXQUFDLElBQUksQ0FBQyxNQUFNLFNBQUssSUFBSSxFQUFDLENBQUE7S0FDOUQ7OztXQUVrQiwrQkFBVTs7O3lDQUFOLElBQUk7QUFBSixZQUFJOzs7QUFDekIsYUFBTyxXQUFBLElBQUksQ0FBQyxLQUFLLEVBQUMsbUJBQW1CLE1BQUEsV0FBQyxJQUFJLENBQUMsTUFBTSxTQUFLLElBQUksRUFBQyxDQUFBO0tBQzVEOzs7V0FFUyxxQkFBQyxTQUFTLEVBQUU7QUFDcEIsYUFBTyxJQUFJLFlBQVksSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQTtLQUNoRDs7O1dBRUMsWUFBQyxTQUFTLEVBQUU7QUFDWixhQUFPLElBQUksQ0FBQyxXQUFXLEtBQUssSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQTtLQUNyRDs7O1dBRVMsc0JBQUc7O0FBRVgsYUFBTyxJQUFJLENBQUMsV0FBVyxDQUFDLGFBQWEsS0FBSyxVQUFVLENBQUE7S0FDckQ7OztXQUVPLG9CQUFHOztBQUVULGFBQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxhQUFhLEtBQUssUUFBUSxDQUFBO0tBQ25EOzs7V0FFVyx3QkFBRzs7QUFFYixhQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsYUFBYSxLQUFLLGFBQWEsQ0FBQTtLQUN4RDs7O1dBRXNCLG1DQUFHO0FBQ3hCLGFBQU8sSUFBSSxDQUFDLElBQUksS0FBSyxRQUFRLEdBQ3pCLElBQUksQ0FBQyw2QkFBNkIsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLGdCQUFnQixFQUFFLENBQUMsR0FDbEUsSUFBSSxDQUFDLE1BQU0sQ0FBQyx1QkFBdUIsRUFBRSxDQUFBO0tBQzFDOzs7V0FFdUIsb0NBQUc7QUFDekIsYUFBTyxJQUFJLENBQUMsSUFBSSxLQUFLLFFBQVEsR0FDekIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxhQUFhLEVBQUUsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLDZCQUE2QixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUM5RSxJQUFJLENBQUMsTUFBTSxDQUFDLHdCQUF3QixFQUFFLENBQUE7S0FDM0M7OztXQUV5QixvQ0FBQyxNQUFNLEVBQUU7QUFDakMsYUFBTyxJQUFJLENBQUMsSUFBSSxLQUFLLFFBQVEsR0FBRyxJQUFJLENBQUMsNkJBQTZCLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxpQkFBaUIsRUFBRSxDQUFBO0tBQ2xIOzs7V0FFNEIsdUNBQUMsU0FBUyxFQUFFO0FBQ3ZDLGFBQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQyxvQkFBb0IsQ0FBQyxNQUFNLEVBQUUsRUFBQyxJQUFJLEVBQUUsQ0FBQyxVQUFVLEVBQUUsV0FBVyxDQUFDLEVBQUMsQ0FBQyxDQUFBO0tBQzdGOzs7V0FFTyxvQkFBRztBQUNULFVBQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxNQUFNLGtCQUFnQixJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxHQUFLLEVBQUUsQ0FBQTtBQUMxRSxhQUFVLElBQUksQ0FBQyxJQUFJLGVBQVUsSUFBSSxDQUFDLElBQUksR0FBRyxTQUFTLE9BQUc7S0FDdEQ7OztXQUVhLDBCQUFHO0FBQ2YsYUFBTyxJQUFJLENBQUMsV0FBVyxDQUFDLGNBQWMsRUFBRSxDQUFBO0tBQ3pDOzs7V0FFMEIsdUNBQUc7QUFDNUIsYUFBTyxJQUFJLENBQUMsV0FBVyxDQUFDLDJCQUEyQixFQUFFLENBQUE7S0FDdEQ7Ozs7O1dBbUtnQiw2QkFBVTs7O0FBQUUsYUFBTyxhQUFBLElBQUksQ0FBQyxRQUFRLEVBQUMsaUJBQWlCLE1BQUEsc0JBQVMsQ0FBQTtLQUFFOzs7O1dBQzVELDhCQUFVOzs7QUFBRSxhQUFPLGNBQUEsSUFBSSxDQUFDLFFBQVEsRUFBQyxrQkFBa0IsTUFBQSx1QkFBUyxDQUFBO0tBQUU7Ozs7V0FDL0QsNkJBQVU7OztBQUFFLGFBQU8sY0FBQSxJQUFJLENBQUMsUUFBUSxFQUFDLGlCQUFpQixNQUFBLHVCQUFTLENBQUE7S0FBRTs7OztXQUM1RCw4QkFBVTs7O0FBQUUsYUFBTyxjQUFBLElBQUksQ0FBQyxRQUFRLEVBQUMsa0JBQWtCLE1BQUEsdUJBQVMsQ0FBQTtLQUFFOzs7O1dBQ2xFLDBCQUFVOzs7QUFBRSxhQUFPLGNBQUEsSUFBSSxDQUFDLFFBQVEsRUFBQyxjQUFjLE1BQUEsdUJBQVMsQ0FBQTtLQUFFOzs7O1dBQ3hELDRCQUFVOzs7QUFBRSxhQUFPLGNBQUEsSUFBSSxDQUFDLFFBQVEsRUFBQyxnQkFBZ0IsTUFBQSx1QkFBUyxDQUFBO0tBQUU7Ozs7V0FDMUQsOEJBQVU7OztBQUFFLGFBQU8sY0FBQSxJQUFJLENBQUMsUUFBUSxFQUFDLGtCQUFrQixNQUFBLHVCQUFTLENBQUE7S0FBRTs7OztXQUM1RCxnQ0FBVTs7O0FBQUUsYUFBTyxjQUFBLElBQUksQ0FBQyxRQUFRLEVBQUMsb0JBQW9CLE1BQUEsdUJBQVMsQ0FBQTtLQUFFOzs7O1dBQ25FLDZCQUFVOzs7QUFBRSxhQUFPLGNBQUEsSUFBSSxDQUFDLFFBQVEsRUFBQyxpQkFBaUIsTUFBQSx1QkFBUyxDQUFBO0tBQUU7Ozs7V0FDM0QsK0JBQVU7OztBQUFFLGFBQU8sZUFBQSxJQUFJLENBQUMsUUFBUSxFQUFDLG1CQUFtQixNQUFBLHdCQUFTLENBQUE7S0FBRTs7OztXQUM3RCxpQ0FBVTs7O0FBQUUsYUFBTyxlQUFBLElBQUksQ0FBQyxRQUFRLEVBQUMscUJBQXFCLE1BQUEsd0JBQVMsQ0FBQTtLQUFFOzs7O1dBQy9ELG1DQUFVOzs7QUFBRSxhQUFPLGVBQUEsSUFBSSxDQUFDLFFBQVEsRUFBQyx1QkFBdUIsTUFBQSx3QkFBUyxDQUFBO0tBQUU7Ozs7V0FDdEUsZ0NBQVU7OztBQUFFLGFBQU8sZUFBQSxJQUFJLENBQUMsUUFBUSxFQUFDLG9CQUFvQixNQUFBLHdCQUFTLENBQUE7S0FBRTs7OztXQUM5RCxrQ0FBVTs7O0FBQUUsYUFBTyxlQUFBLElBQUksQ0FBQyxRQUFRLEVBQUMsc0JBQXNCLE1BQUEsd0JBQVMsQ0FBQTtLQUFFOzs7O1dBQ3JFLCtCQUFVOzs7QUFBRSxhQUFPLGVBQUEsSUFBSSxDQUFDLFFBQVEsRUFBQyxtQkFBbUIsTUFBQSx3QkFBUyxDQUFBO0tBQUU7Ozs7V0FDN0QsaUNBQVU7OztBQUFFLGFBQU8sZUFBQSxJQUFJLENBQUMsUUFBUSxFQUFDLHFCQUFxQixNQUFBLHdCQUFTLENBQUE7S0FBRTs7OztXQUNsRSxnQ0FBVTs7O0FBQUUsYUFBTyxlQUFBLElBQUksQ0FBQyxRQUFRLEVBQUMsb0JBQW9CLE1BQUEsd0JBQVMsQ0FBQTtLQUFFOzs7O1dBQzVELG9DQUFVOzs7QUFBRSxhQUFPLGVBQUEsSUFBSSxDQUFDLFFBQVEsRUFBQyx3QkFBd0IsTUFBQSx3QkFBUyxDQUFBO0tBQUU7Ozs7V0FDcEUsb0NBQVU7OztBQUFFLGFBQU8sZUFBQSxJQUFJLENBQUMsUUFBUSxFQUFDLHdCQUF3QixNQUFBLHdCQUFTLENBQUE7S0FBRTs7OztXQUMxRSw4QkFBVTs7O0FBQUUsYUFBTyxlQUFBLElBQUksQ0FBQyxRQUFRLEVBQUMsa0JBQWtCLE1BQUEsd0JBQVMsQ0FBQTtLQUFFOzs7O1dBQy9ELDZCQUFVOzs7QUFBRSxhQUFPLGVBQUEsSUFBSSxDQUFDLFFBQVEsRUFBQyxpQkFBaUIsTUFBQSx3QkFBUyxDQUFBO0tBQUU7Ozs7V0FDckQscUNBQVU7OztBQUFFLGFBQU8sZUFBQSxJQUFJLENBQUMsUUFBUSxFQUFDLHlCQUF5QixNQUFBLHdCQUFTLENBQUE7S0FBRTs7OztXQUMxRSxnQ0FBVTs7O0FBQUUsYUFBTyxlQUFBLElBQUksQ0FBQyxRQUFRLEVBQUMsb0JBQW9CLE1BQUEsd0JBQVMsQ0FBQTtLQUFFOzs7O1dBQ2pFLCtCQUFVOzs7QUFBRSxhQUFPLGVBQUEsSUFBSSxDQUFDLFFBQVEsRUFBQyxtQkFBbUIsTUFBQSx3QkFBUyxDQUFBO0tBQUU7Ozs7V0FDN0QsaUNBQVU7OztBQUFFLGFBQU8sZUFBQSxJQUFJLENBQUMsUUFBUSxFQUFDLHFCQUFxQixNQUFBLHdCQUFTLENBQUE7S0FBRTs7OztXQUM3RSxxQkFBVTs7O0FBQUUsYUFBTyxlQUFBLElBQUksQ0FBQyxRQUFRLEVBQUMsU0FBUyxNQUFBLHdCQUFTLENBQUE7S0FBRTs7OztXQUN4RCxrQkFBVTs7O0FBQUUsYUFBTyxlQUFBLElBQUksQ0FBQyxRQUFRLEVBQUMsTUFBTSxNQUFBLHdCQUFTLENBQUE7S0FBRTs7OztXQUNsQyxrQ0FBVTs7O0FBQUUsYUFBTyxlQUFBLElBQUksQ0FBQyxRQUFRLEVBQUMsc0JBQXNCLE1BQUEsd0JBQVMsQ0FBQTtLQUFFOzs7O1dBQy9ELHFDQUFVOzs7QUFBRSxhQUFPLGVBQUEsSUFBSSxDQUFDLFFBQVEsRUFBQyx5QkFBeUIsTUFBQSx3QkFBUyxDQUFBO0tBQUU7Ozs7V0FDaEYsMEJBQVU7OztBQUFFLGFBQU8sZUFBQSxJQUFJLENBQUMsUUFBUSxFQUFDLGNBQWMsTUFBQSx3QkFBUyxDQUFBO0tBQUU7Ozs7V0FDL0QscUJBQVU7OztBQUFFLGFBQU8sZUFBQSxJQUFJLENBQUMsUUFBUSxFQUFDLFNBQVMsTUFBQSx3QkFBUyxDQUFBO0tBQUU7Ozs7Ozs7U0F6Q3RELGVBQUc7QUFBRSxhQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFBO0tBQUU7Ozs7U0FDN0IsZUFBRztBQUFFLGFBQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUE7S0FBRTs7OztTQUNyQyxlQUFHO0FBQUUsYUFBTyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQTtLQUFFOzs7O1NBQ2pDLGVBQUc7QUFBRSxhQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFBO0tBQUU7Ozs7U0FDaEMsZUFBRztBQUFFLGFBQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUE7S0FBRTs7OztTQUMzQixlQUFHO0FBQUUsYUFBTyxJQUFJLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQTtLQUFFOzs7O1NBQzNDLGVBQUc7QUFBRSxhQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFBO0tBQUU7Ozs7U0FDbkMsZUFBRztBQUFFLGFBQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUE7S0FBRTs7OztTQUN6QyxlQUFHO0FBQUUsYUFBTyxJQUFJLENBQUMsUUFBUSxDQUFDLGlCQUFpQixDQUFBO0tBQUU7Ozs7U0FDM0MsZUFBRztBQUFFLGFBQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxtQkFBbUIsQ0FBQTtLQUFFOzs7V0EvSnhDLG1DQUFHO0FBQy9CLFVBQU0sWUFBWSxHQUFHLElBQUksQ0FBQywrQkFBK0IsRUFBRSxDQUFBO0FBQzNELFVBQU0sQ0FBQyxHQUFHLEtBQUssRUFBRSxDQUFBO0FBQ2pCLFVBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLFlBQVksQ0FBQyxFQUFFO0FBQzlDLFlBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLDRCQUE0QixFQUFFLEVBQUMsV0FBVyxFQUFFLElBQUksRUFBQyxDQUFDLENBQUE7QUFDN0UsZUFBTTtPQUNQOztBQUVELFVBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQTtBQUNuQyxVQUFJLENBQUMsSUFBSSxFQUFFLElBQUksR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUE7O0FBRWpDLFVBQUksZ0JBQWdCLEdBQUcseUZBQXlGLENBQUE7QUFDaEgsc0JBQWdCLElBQUkseUJBQXlCLENBQUE7QUFDN0Msc0JBQWdCLElBQUksb0JBQW9CLENBQUE7QUFDeEMsc0JBQWdCLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsR0FBRyxJQUFJLENBQUE7O0FBRXZELFVBQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsc0JBQXNCLENBQUMsQ0FBQTtBQUNyRSxVQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFBLE1BQU0sRUFBSTtBQUNuRCxjQUFNLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLENBQUE7QUFDaEMsY0FBTSxDQUFDLElBQUksRUFBRSxDQUFBO0FBQ2IsWUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsc0JBQXNCLEVBQUUsRUFBQyxXQUFXLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQTtPQUN4RSxDQUFDLENBQUE7S0FDSDs7O1dBRXFDLDJDQUFHOztBQUV2QyxVQUFNLFdBQVcsR0FBRyxDQUNsQixZQUFZLEVBQ1osbUJBQW1CLEVBQ25CLDZCQUE2QixFQUM3QixVQUFVLEVBQ1YsaUJBQWlCLEVBQ2pCLGVBQWUsRUFDZixnQkFBZ0IsQ0FDakIsQ0FBQTtBQUNELGlCQUFXLENBQUMsT0FBTyxDQUFDLG9CQUFvQixDQUFDLENBQUE7QUFDekMsVUFBTSxDQUFDLEdBQUcsS0FBSyxFQUFFLENBQUE7QUFDakIsVUFBTSxvQkFBb0IsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLEVBQUUsVUFBQSxLQUFLO2VBQUksS0FBSyxDQUFDLElBQUk7T0FBQSxDQUFDLENBQUE7O0FBRXJGLFVBQU0sWUFBWSxHQUFHLEVBQUUsQ0FBQTtBQUN2QixXQUFLLElBQU0sSUFBSSxJQUFJLFdBQVcsRUFBRTtBQUM5QixhQUFLLElBQU0sS0FBSyxJQUFJLG9CQUFvQixDQUFDLElBQUksQ0FBQyxFQUFFO0FBQzlDLHNCQUFZLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQyxTQUFTLEVBQUUsR0FDeEMsRUFBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLElBQUksRUFBRSxXQUFXLEVBQUUsS0FBSyxDQUFDLGNBQWMsRUFBRSxFQUFFLFlBQVksRUFBRSxLQUFLLENBQUMsZUFBZSxFQUFFLEVBQUMsR0FDOUYsRUFBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLElBQUksRUFBQyxDQUFBO1NBQ3ZCO09BQ0Y7QUFDRCxhQUFPLFlBQVksQ0FBQTtLQUNwQjs7O1dBRVUsY0FBQyxjQUFjLEVBQUU7QUFDMUIsVUFBSSxDQUFDLGNBQWMsR0FBRyxjQUFjLENBQUE7O0FBRXBDLFVBQUksQ0FBQyxZQUFZLEdBQUcsT0FBTyxDQUFDLGlCQUFpQixDQUFDLENBQUE7QUFDOUMsVUFBTSxhQUFhLEdBQUcsRUFBRSxDQUFBO0FBQ3hCLFdBQUssSUFBTSxLQUFJLElBQUksSUFBSSxDQUFDLFlBQVksRUFBRTtBQUNwQyxZQUFNLElBQUksR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUksQ0FBQyxDQUFBO0FBQ3BDLFlBQUksSUFBSSxDQUFDLFdBQVcsRUFBRTtBQUNwQix1QkFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsdUJBQXVCLENBQUMsS0FBSSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUE7U0FDN0Q7T0FDRjtBQUNELGFBQU8sYUFBYSxDQUFBO0tBQ3JCOzs7V0FFYyxvQkFBaUI7VUFBaEIsT0FBTyx5REFBRyxJQUFJOztBQUM1QixVQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQTtBQUN0QixVQUFJLENBQUMsSUFBSSxHQUFHLGdCQUFnQixDQUFBO0FBQzVCLFVBQUksSUFBSSxDQUFDLElBQUksSUFBSSxjQUFjLEVBQUU7QUFDL0IsZUFBTyxDQUFDLElBQUksNEJBQTBCLElBQUksQ0FBQyxJQUFJLENBQUcsQ0FBQTtPQUNuRDtBQUNELG9CQUFjLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQTtLQUNqQzs7O1dBRVksa0JBQVU7QUFDckIsYUFBTyxDQUFDLEtBQUssQ0FBQyw4REFBOEQsQ0FBQyxDQUFBO0FBQzdFLFVBQUksQ0FBQyxRQUFRLE1BQUEsQ0FBYixJQUFJLFlBQWtCLENBQUE7S0FDdkI7OztXQUVjLGtCQUFDLElBQUksRUFBRTtBQUNwQixVQUFJLElBQUksSUFBSSxjQUFjLEVBQUUsT0FBTyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUE7O0FBRXZELFVBQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFBO0FBQy9DLFVBQUksSUFBSSxDQUFDLFNBQVMsRUFBRSxJQUFJLFFBQVEsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEVBQUU7QUFDN0MsZUFBTyxDQUFDLEdBQUcsb0JBQWtCLFVBQVUsYUFBUSxJQUFJLENBQUcsQ0FBQTtPQUN2RDtBQUNELDBCQUFvQixDQUFDLFVBQVUsQ0FBQyxDQUFBO0FBQ2hDLFVBQUksSUFBSSxJQUFJLGNBQWMsRUFBRSxPQUFPLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQTs7QUFFdkQsWUFBTSxJQUFJLEtBQUssYUFBVyxJQUFJLGlCQUFjLENBQUE7S0FDN0M7OztXQUVpQixxQkFBQyxRQUFRLEVBQUUsV0FBVyxFQUFFLFVBQVUsRUFBRTtBQUNwRCxVQUFNLEtBQUssR0FBRyxPQUFPLFdBQVcsS0FBSyxVQUFVLEdBQUcsV0FBVyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLENBQUE7QUFDMUYsVUFBTSxRQUFRLEdBQUcsSUFBSSxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUE7QUFDcEMsVUFBSSxVQUFVLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsVUFBVSxDQUFDLENBQUE7QUFDbkQsYUFBTyxRQUFRLENBQUMsVUFBVSxFQUFFLENBQUE7S0FDN0I7OztXQUVzQiw0QkFBRztBQUN4QixhQUFPLGNBQWMsQ0FBQTtLQUN0Qjs7O1dBRWUscUJBQUc7QUFDakIsYUFBTyxJQUFJLENBQUMsT0FBTyxDQUFBO0tBQ3BCOzs7V0FFb0IsMEJBQUc7QUFDdEIsYUFBTyxJQUFJLENBQUMsYUFBYSxHQUFHLEdBQUcsR0FBRyxLQUFLLEVBQUUsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO0tBQy9EOzs7V0FFaUMsdUNBQUc7QUFDbkMsYUFBTyxLQUFLLEVBQUUsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO0tBQ3BDOzs7V0FFcUIsMkJBQUc7QUFDdkIsYUFBTyxJQUFJLENBQUMsWUFBWSxDQUFBO0tBQ3pCOzs7V0FFcUIsMkJBQUc7OztBQUN2QixhQUFPLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFO0FBQzdDLG9CQUFZLEVBQUUsSUFBSSxDQUFDLGVBQWUsRUFBRTtBQUNwQyxtQkFBVyxFQUFFLElBQUksQ0FBQyxjQUFjLEVBQUU7QUFDbEMsZ0JBQVEsRUFBRTs7U0FBVTtPQUNyQixDQUFDLENBQUE7S0FDSDs7O1dBRTZCLGlDQUFDLElBQUksRUFBRSxJQUFJLEVBQUU7OzsrQkFDeUQsSUFBSSxDQUFqRyxZQUFZO1VBQVosWUFBWSxzQ0FBRyxrQkFBa0I7Z0NBQTRELElBQUksQ0FBOUQsYUFBYTtVQUFiLGFBQWEsdUNBQUcsZUFBZTtVQUFFLFdBQVcsR0FBYyxJQUFJLENBQTdCLFdBQVc7VUFBRSxRQUFRLEdBQUksSUFBSSxDQUFoQixRQUFROztBQUM5RixVQUFJLENBQUMsV0FBVyxFQUFFLFdBQVcsR0FBRyxhQUFhLEdBQUcsR0FBRyxHQUFHLEtBQUssRUFBRSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQTtBQUM3RSxVQUFJLENBQUMsUUFBUSxFQUFFLFFBQVEsR0FBRyxVQUFBLElBQUk7ZUFBSSxPQUFLLFFBQVEsQ0FBQyxJQUFJLENBQUM7T0FBQSxDQUFBOztBQUVyRCxVQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFBO0FBQzFDLGFBQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsWUFBWSxFQUFFLFdBQVcsRUFBRSxVQUFTLEtBQUssRUFBRTtBQUNsRSxZQUFNLFFBQVEsR0FBRyxjQUFjLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLElBQUksY0FBYyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQW1CLEVBQUUsQ0FBQyxDQUFBO0FBQ3hHLFlBQUksUUFBUSxFQUFFLFFBQVEsQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFBO0FBQ3pELGFBQUssQ0FBQyxlQUFlLEVBQUUsQ0FBQTtPQUN4QixDQUFDLENBQUE7S0FDSDs7O1dBRTJCLCtCQUFDLE9BQU8sRUFBRTtBQUNwQyxVQUFNLG9CQUFvQixHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsaUJBQWlCLEVBQUUsRUFBRSxDQUFDLENBQUE7O21CQUNwQyxLQUFLLEVBQUU7O1VBQS9CLFVBQVUsVUFBVixVQUFVO1VBQUUsUUFBUSxVQUFSLFFBQVE7O0FBQzNCLFVBQU0sZ0JBQWdCLEdBQUcsVUFBVSxDQUFDLFFBQVEsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLENBQUE7QUFDbkUsVUFBSSxnQkFBZ0IsSUFBSSxjQUFjLEVBQUU7QUFDdEMsZUFBTyxjQUFjLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxhQUFhLENBQUE7T0FDdEQ7S0FDRjs7O1NBelhHLElBQUk7OztBQXdhVixJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFBOztBQUVwQixNQUFNLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQSIsImZpbGUiOiIvVXNlcnMvdGxhbmRhdS9kb3RmaWxlcy8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi9iYXNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2UgYmFiZWxcIlxuXG5jb25zdCBzZXR0aW5ncyA9IHJlcXVpcmUoXCIuL3NldHRpbmdzXCIpXG5cbmxldCBDU09OLCBwYXRoLCBzZWxlY3RMaXN0LCBPcGVyYXRpb25BYm9ydGVkRXJyb3IsIF9fcGx1c1xuY29uc3QgQ0xBU1NfUkVHSVNUUlkgPSB7fVxuXG5mdW5jdGlvbiBfcGx1cygpIHtcbiAgcmV0dXJuIF9fcGx1cyB8fCAoX19wbHVzID0gcmVxdWlyZShcInVuZGVyc2NvcmUtcGx1c1wiKSlcbn1cblxubGV0IFZNUF9MT0FESU5HX0ZJTEVcbmZ1bmN0aW9uIGxvYWRWbXBPcGVyYXRpb25GaWxlKGZpbGVuYW1lKSB7XG4gIC8vIENhbGwgdG8gbG9hZFZtcE9wZXJhdGlvbkZpbGUgY2FuIGJlIG5lc3RlZC5cbiAgLy8gMS4gcmVxdWlyZShcIi4vb3BlcmF0b3ItdHJhbnNmb3JtLXN0cmluZ1wiKVxuICAvLyAyLiBpbiBvcGVyYXRvci10cmFuc2Zvcm0tc3RyaW5nLmNvZmZlZSBjYWxsIEJhc2UuZ2V0Q2xhc3MoXCJPcGVyYXRvclwiKSBjYXVzZSBvcGVyYXRvci5jb2ZmZWUgcmVxdWlyZWQuXG4gIC8vIFNvIHdlIGhhdmUgdG8gc2F2ZSBvcmlnaW5hbCBWTVBfTE9BRElOR19GSUxFIGFuZCByZXN0b3JlIGl0IGFmdGVyIHJlcXVpcmUgZmluaXNoZWQuXG4gIGNvbnN0IHByZXNlcnZlZCA9IFZNUF9MT0FESU5HX0ZJTEVcbiAgVk1QX0xPQURJTkdfRklMRSA9IGZpbGVuYW1lXG4gIHJlcXVpcmUoZmlsZW5hbWUpXG4gIFZNUF9MT0FESU5HX0ZJTEUgPSBwcmVzZXJ2ZWRcbn1cblxuY2xhc3MgQmFzZSB7XG4gIHN0YXRpYyBjb21tYW5kVGFibGUgPSBudWxsXG4gIHN0YXRpYyBjb21tYW5kUHJlZml4ID0gXCJ2aW0tbW9kZS1wbHVzXCJcbiAgc3RhdGljIGNvbW1hbmRTY29wZSA9IFwiYXRvbS10ZXh0LWVkaXRvclwiXG4gIHN0YXRpYyBvcGVyYXRpb25LaW5kID0gbnVsbFxuICBzdGF0aWMgZ2V0RWRpdG9yU3RhdGUgPSBudWxsIC8vIHNldCB0aHJvdWdoIGluaXQoKVxuXG4gIHJlcXVpcmVUYXJnZXQgPSBmYWxzZVxuICByZXF1aXJlSW5wdXQgPSBmYWxzZVxuICByZWNvcmRhYmxlID0gZmFsc2VcbiAgcmVwZWF0ZWQgPSBmYWxzZVxuICB0YXJnZXQgPSBudWxsXG4gIG9wZXJhdG9yID0gbnVsbFxuICBjb3VudCA9IG51bGxcbiAgZGVmYXVsdENvdW50ID0gMVxuICBpbnB1dCA9IG51bGxcblxuICBnZXQgbmFtZSgpIHtcbiAgICByZXR1cm4gdGhpcy5jb25zdHJ1Y3Rvci5uYW1lXG4gIH1cblxuICBjb25zdHJ1Y3Rvcih2aW1TdGF0ZSkge1xuICAgIHRoaXMudmltU3RhdGUgPSB2aW1TdGF0ZVxuICB9XG5cbiAgLy8gTk9URTogaW5pdGlhbGl6ZSgpIG11c3QgcmV0dXJuIGB0aGlzYFxuICBpbml0aWFsaXplKCkge1xuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICAvLyBDYWxsZWQgYm90aCBvbiBjYW5jZWwgYW5kIHN1Y2Nlc3NcbiAgcmVzZXRTdGF0ZSgpIHt9XG5cbiAgLy8gT3BlcmF0aW9uIHByb2Nlc3NvciBleGVjdXRlIG9ubHkgd2hlbiBpc0NvbXBsZXRlKCkgcmV0dXJuIHRydWUuXG4gIC8vIElmIGZhbHNlLCBvcGVyYXRpb24gcHJvY2Vzc29yIHBvc3Rwb25lIGl0cyBleGVjdXRpb24uXG4gIGlzQ29tcGxldGUoKSB7XG4gICAgaWYgKHRoaXMucmVxdWlyZUlucHV0ICYmIHRoaXMuaW5wdXQgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfSBlbHNlIGlmICh0aGlzLnJlcXVpcmVUYXJnZXQpIHtcbiAgICAgIC8vIFdoZW4gdGhpcyBmdW5jdGlvbiBpcyBjYWxsZWQgaW4gQmFzZTo6Y29uc3RydWN0b3JcbiAgICAgIC8vIHRhZ2VydCBpcyBzdGlsbCBzdHJpbmcgbGlrZSBgTW92ZVRvUmlnaHRgLCBpbiB0aGlzIGNhc2UgaXNDb21wbGV0ZVxuICAgICAgLy8gaXMgbm90IGF2YWlsYWJsZS5cbiAgICAgIHJldHVybiAhIXRoaXMudGFyZ2V0ICYmIHRoaXMudGFyZ2V0LmlzQ29tcGxldGUoKVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdHJ1ZSAvLyBTZXQgaW4gb3BlcmF0b3IncyB0YXJnZXQoIE1vdGlvbiBvciBUZXh0T2JqZWN0IClcbiAgICB9XG4gIH1cblxuICBpc0FzVGFyZ2V0RXhjZXB0U2VsZWN0SW5WaXN1YWxNb2RlKCkge1xuICAgIHJldHVybiB0aGlzLm9wZXJhdG9yICYmICF0aGlzLm9wZXJhdG9yLmluc3RhbmNlb2YoXCJTZWxlY3RJblZpc3VhbE1vZGVcIilcbiAgfVxuXG4gIGFib3J0KCkge1xuICAgIGlmICghT3BlcmF0aW9uQWJvcnRlZEVycm9yKSBPcGVyYXRpb25BYm9ydGVkRXJyb3IgPSByZXF1aXJlKFwiLi9lcnJvcnNcIilcbiAgICB0aHJvdyBuZXcgT3BlcmF0aW9uQWJvcnRlZEVycm9yKFwiYWJvcnRlZFwiKVxuICB9XG5cbiAgZ2V0Q291bnQob2Zmc2V0ID0gMCkge1xuICAgIGlmICh0aGlzLmNvdW50ID09IG51bGwpIHtcbiAgICAgIHRoaXMuY291bnQgPSB0aGlzLnZpbVN0YXRlLmhhc0NvdW50KCkgPyB0aGlzLnZpbVN0YXRlLmdldENvdW50KCkgOiB0aGlzLmRlZmF1bHRDb3VudFxuICAgIH1cbiAgICByZXR1cm4gdGhpcy5jb3VudCArIG9mZnNldFxuICB9XG5cbiAgcmVzZXRDb3VudCgpIHtcbiAgICB0aGlzLmNvdW50ID0gbnVsbFxuICB9XG5cbiAgY291bnRUaW1lcyhsYXN0LCBmbikge1xuICAgIGlmIChsYXN0IDwgMSkgcmV0dXJuXG5cbiAgICBsZXQgc3RvcHBlZCA9IGZhbHNlXG4gICAgY29uc3Qgc3RvcCA9ICgpID0+IChzdG9wcGVkID0gdHJ1ZSlcbiAgICBmb3IgKGxldCBjb3VudCA9IDE7IGNvdW50IDw9IGxhc3Q7IGNvdW50KyspIHtcbiAgICAgIGZuKHtjb3VudCwgaXNGaW5hbDogY291bnQgPT09IGxhc3QsIHN0b3B9KVxuICAgICAgaWYgKHN0b3BwZWQpIGJyZWFrXG4gICAgfVxuICB9XG5cbiAgYWN0aXZhdGVNb2RlKG1vZGUsIHN1Ym1vZGUpIHtcbiAgICB0aGlzLm9uRGlkRmluaXNoT3BlcmF0aW9uKCgpID0+IHRoaXMudmltU3RhdGUuYWN0aXZhdGUobW9kZSwgc3VibW9kZSkpXG4gIH1cblxuICBhY3RpdmF0ZU1vZGVJZk5lY2Vzc2FyeShtb2RlLCBzdWJtb2RlKSB7XG4gICAgaWYgKCF0aGlzLnZpbVN0YXRlLmlzTW9kZShtb2RlLCBzdWJtb2RlKSkge1xuICAgICAgdGhpcy5hY3RpdmF0ZU1vZGUobW9kZSwgc3VibW9kZSlcbiAgICB9XG4gIH1cblxuICBnZXRJbnN0YW5jZShuYW1lLCBwcm9wZXJ0aWVzKSB7XG4gICAgcmV0dXJuIHRoaXMuY29uc3RydWN0b3IuZ2V0SW5zdGFuY2UodGhpcy52aW1TdGF0ZSwgbmFtZSwgcHJvcGVydGllcylcbiAgfVxuXG4gIGNhbmNlbE9wZXJhdGlvbigpIHtcbiAgICB0aGlzLnZpbVN0YXRlLm9wZXJhdGlvblN0YWNrLmNhbmNlbCh0aGlzKVxuICB9XG5cbiAgcHJvY2Vzc09wZXJhdGlvbigpIHtcbiAgICB0aGlzLnZpbVN0YXRlLm9wZXJhdGlvblN0YWNrLnByb2Nlc3MoKVxuICB9XG5cbiAgZm9jdXNTZWxlY3RMaXN0KG9wdGlvbnMgPSB7fSkge1xuICAgIHRoaXMub25EaWRDYW5jZWxTZWxlY3RMaXN0KCgpID0+IHRoaXMuY2FuY2VsT3BlcmF0aW9uKCkpXG4gICAgaWYgKCFzZWxlY3RMaXN0KSB7XG4gICAgICBzZWxlY3RMaXN0ID0gbmV3IChyZXF1aXJlKFwiLi9zZWxlY3QtbGlzdFwiKSkoKVxuICAgIH1cbiAgICBzZWxlY3RMaXN0LnNob3codGhpcy52aW1TdGF0ZSwgb3B0aW9ucylcbiAgfVxuXG4gIGZvY3VzSW5wdXQob3B0aW9ucyA9IHt9KSB7XG4gICAgaWYgKCFvcHRpb25zLm9uQ29uZmlybSkge1xuICAgICAgb3B0aW9ucy5vbkNvbmZpcm0gPSBpbnB1dCA9PiB7XG4gICAgICAgIHRoaXMuaW5wdXQgPSBpbnB1dFxuICAgICAgICB0aGlzLnByb2Nlc3NPcGVyYXRpb24oKVxuICAgICAgfVxuICAgIH1cbiAgICBpZiAoIW9wdGlvbnMub25DYW5jZWwpIHtcbiAgICAgIG9wdGlvbnMub25DYW5jZWwgPSAoKSA9PiB0aGlzLmNhbmNlbE9wZXJhdGlvbigpXG4gICAgfVxuICAgIGlmICghb3B0aW9ucy5vbkNoYW5nZSkge1xuICAgICAgb3B0aW9ucy5vbkNoYW5nZSA9IGlucHV0ID0+IHRoaXMudmltU3RhdGUuaG92ZXIuc2V0KGlucHV0KVxuICAgIH1cbiAgICB0aGlzLnZpbVN0YXRlLmZvY3VzSW5wdXQob3B0aW9ucylcbiAgfVxuXG4gIHJlYWRDaGFyKCkge1xuICAgIHRoaXMudmltU3RhdGUucmVhZENoYXIoe1xuICAgICAgb25Db25maXJtOiBpbnB1dCA9PiB7XG4gICAgICAgIHRoaXMuaW5wdXQgPSBpbnB1dFxuICAgICAgICB0aGlzLnByb2Nlc3NPcGVyYXRpb24oKVxuICAgICAgfSxcbiAgICAgIG9uQ2FuY2VsOiAoKSA9PiB0aGlzLmNhbmNlbE9wZXJhdGlvbigpLFxuICAgIH0pXG4gIH1cblxuICBnZXRWaW1Fb2ZCdWZmZXJQb3NpdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy51dGlscy5nZXRWaW1Fb2ZCdWZmZXJQb3NpdGlvbih0aGlzLmVkaXRvcilcbiAgfVxuXG4gIGdldFZpbUxhc3RCdWZmZXJSb3coKSB7XG4gICAgcmV0dXJuIHRoaXMudXRpbHMuZ2V0VmltTGFzdEJ1ZmZlclJvdyh0aGlzLmVkaXRvcilcbiAgfVxuXG4gIGdldFZpbUxhc3RTY3JlZW5Sb3coKSB7XG4gICAgcmV0dXJuIHRoaXMudXRpbHMuZ2V0VmltTGFzdFNjcmVlblJvdyh0aGlzLmVkaXRvcilcbiAgfVxuXG4gIGdldFdvcmRCdWZmZXJSYW5nZUFuZEtpbmRBdEJ1ZmZlclBvc2l0aW9uKHBvaW50LCBvcHRpb25zKSB7XG4gICAgcmV0dXJuIHRoaXMudXRpbHMuZ2V0V29yZEJ1ZmZlclJhbmdlQW5kS2luZEF0QnVmZmVyUG9zaXRpb24odGhpcy5lZGl0b3IsIHBvaW50LCBvcHRpb25zKVxuICB9XG5cbiAgZ2V0Rmlyc3RDaGFyYWN0ZXJQb3NpdGlvbkZvckJ1ZmZlclJvdyhyb3cpIHtcbiAgICByZXR1cm4gdGhpcy51dGlscy5nZXRGaXJzdENoYXJhY3RlclBvc2l0aW9uRm9yQnVmZmVyUm93KHRoaXMuZWRpdG9yLCByb3cpXG4gIH1cblxuICBnZXRCdWZmZXJSYW5nZUZvclJvd1JhbmdlKHJvd1JhbmdlKSB7XG4gICAgcmV0dXJuIHRoaXMudXRpbHMuZ2V0QnVmZmVyUmFuZ2VGb3JSb3dSYW5nZSh0aGlzLmVkaXRvciwgcm93UmFuZ2UpXG4gIH1cblxuICBzY2FuRm9yd2FyZCguLi5hcmdzKSB7XG4gICAgcmV0dXJuIHRoaXMudXRpbHMuc2NhbkVkaXRvckluRGlyZWN0aW9uKHRoaXMuZWRpdG9yLCBcImZvcndhcmRcIiwgLi4uYXJncylcbiAgfVxuXG4gIHNjYW5CYWNrd2FyZCguLi5hcmdzKSB7XG4gICAgcmV0dXJuIHRoaXMudXRpbHMuc2NhbkVkaXRvckluRGlyZWN0aW9uKHRoaXMuZWRpdG9yLCBcImJhY2t3YXJkXCIsIC4uLmFyZ3MpXG4gIH1cblxuICBnZXRGb2xkU3RhcnRSb3dGb3JSb3coLi4uYXJncykge1xuICAgIHJldHVybiB0aGlzLnV0aWxzLmdldEZvbGRTdGFydFJvd0ZvclJvdyh0aGlzLmVkaXRvciwgLi4uYXJncylcbiAgfVxuXG4gIGdldEZvbGRFbmRSb3dGb3JSb3coLi4uYXJncykge1xuICAgIHJldHVybiB0aGlzLnV0aWxzLmdldEZvbGRFbmRSb3dGb3JSb3codGhpcy5lZGl0b3IsIC4uLmFyZ3MpXG4gIH1cblxuICBpbnN0YW5jZW9mKGtsYXNzTmFtZSkge1xuICAgIHJldHVybiB0aGlzIGluc3RhbmNlb2YgQmFzZS5nZXRDbGFzcyhrbGFzc05hbWUpXG4gIH1cblxuICBpcyhrbGFzc05hbWUpIHtcbiAgICByZXR1cm4gdGhpcy5jb25zdHJ1Y3RvciA9PT0gQmFzZS5nZXRDbGFzcyhrbGFzc05hbWUpXG4gIH1cblxuICBpc09wZXJhdG9yKCkge1xuICAgIC8vIERvbid0IHVzZSBgaW5zdGFuY2VvZmAgdG8gcG9zdHBvbmUgcmVxdWlyZSBmb3IgZmFzdGVyIGFjdGl2YXRpb24uXG4gICAgcmV0dXJuIHRoaXMuY29uc3RydWN0b3Iub3BlcmF0aW9uS2luZCA9PT0gXCJvcGVyYXRvclwiXG4gIH1cblxuICBpc01vdGlvbigpIHtcbiAgICAvLyBEb24ndCB1c2UgYGluc3RhbmNlb2ZgIHRvIHBvc3Rwb25lIHJlcXVpcmUgZm9yIGZhc3RlciBhY3RpdmF0aW9uLlxuICAgIHJldHVybiB0aGlzLmNvbnN0cnVjdG9yLm9wZXJhdGlvbktpbmQgPT09IFwibW90aW9uXCJcbiAgfVxuXG4gIGlzVGV4dE9iamVjdCgpIHtcbiAgICAvLyBEb24ndCB1c2UgYGluc3RhbmNlb2ZgIHRvIHBvc3Rwb25lIHJlcXVpcmUgZm9yIGZhc3RlciBhY3RpdmF0aW9uLlxuICAgIHJldHVybiB0aGlzLmNvbnN0cnVjdG9yLm9wZXJhdGlvbktpbmQgPT09IFwidGV4dC1vYmplY3RcIlxuICB9XG5cbiAgZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMubW9kZSA9PT0gXCJ2aXN1YWxcIlxuICAgICAgPyB0aGlzLmdldEN1cnNvclBvc2l0aW9uRm9yU2VsZWN0aW9uKHRoaXMuZWRpdG9yLmdldExhc3RTZWxlY3Rpb24oKSlcbiAgICAgIDogdGhpcy5lZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKVxuICB9XG5cbiAgZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb25zKCkge1xuICAgIHJldHVybiB0aGlzLm1vZGUgPT09IFwidmlzdWFsXCJcbiAgICAgID8gdGhpcy5lZGl0b3IuZ2V0U2VsZWN0aW9ucygpLm1hcCh0aGlzLmdldEN1cnNvclBvc2l0aW9uRm9yU2VsZWN0aW9uLmJpbmQodGhpcykpXG4gICAgICA6IHRoaXMuZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9ucygpXG4gIH1cblxuICBnZXRCdWZmZXJQb3NpdGlvbkZvckN1cnNvcihjdXJzb3IpIHtcbiAgICByZXR1cm4gdGhpcy5tb2RlID09PSBcInZpc3VhbFwiID8gdGhpcy5nZXRDdXJzb3JQb3NpdGlvbkZvclNlbGVjdGlvbihjdXJzb3Iuc2VsZWN0aW9uKSA6IGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXG4gIH1cblxuICBnZXRDdXJzb3JQb3NpdGlvbkZvclNlbGVjdGlvbihzZWxlY3Rpb24pIHtcbiAgICByZXR1cm4gdGhpcy5zd3JhcChzZWxlY3Rpb24pLmdldEJ1ZmZlclBvc2l0aW9uRm9yKFwiaGVhZFwiLCB7ZnJvbTogW1wicHJvcGVydHlcIiwgXCJzZWxlY3Rpb25cIl19KVxuICB9XG5cbiAgdG9TdHJpbmcoKSB7XG4gICAgY29uc3QgdGFyZ2V0U3RyID0gdGhpcy50YXJnZXQgPyBgLCB0YXJnZXQ6ICR7dGhpcy50YXJnZXQudG9TdHJpbmcoKX1gIDogXCJcIlxuICAgIHJldHVybiBgJHt0aGlzLm5hbWV9e3dpc2U6ICR7dGhpcy53aXNlfSR7dGFyZ2V0U3RyfX1gXG4gIH1cblxuICBnZXRDb21tYW5kTmFtZSgpIHtcbiAgICByZXR1cm4gdGhpcy5jb25zdHJ1Y3Rvci5nZXRDb21tYW5kTmFtZSgpXG4gIH1cblxuICBnZXRDb21tYW5kTmFtZVdpdGhvdXRQcmVmaXgoKSB7XG4gICAgcmV0dXJuIHRoaXMuY29uc3RydWN0b3IuZ2V0Q29tbWFuZE5hbWVXaXRob3V0UHJlZml4KClcbiAgfVxuXG4gIHN0YXRpYyB3cml0ZUNvbW1hbmRUYWJsZU9uRGlzaygpIHtcbiAgICBjb25zdCBjb21tYW5kVGFibGUgPSB0aGlzLmdlbmVyYXRlQ29tbWFuZFRhYmxlQnlFYWdlckxvYWQoKVxuICAgIGNvbnN0IF8gPSBfcGx1cygpXG4gICAgaWYgKF8uaXNFcXVhbCh0aGlzLmNvbW1hbmRUYWJsZSwgY29tbWFuZFRhYmxlKSkge1xuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEluZm8oXCJObyBjaGFuZ2VzIGluIGNvbW1hbmRUYWJsZVwiLCB7ZGlzbWlzc2FibGU6IHRydWV9KVxuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgaWYgKCFDU09OKSBDU09OID0gcmVxdWlyZShcInNlYXNvblwiKVxuICAgIGlmICghcGF0aCkgcGF0aCA9IHJlcXVpcmUoXCJwYXRoXCIpXG5cbiAgICBsZXQgbG9hZGFibGVDU09OVGV4dCA9IFwiIyBUaGlzIGZpbGUgaXMgYXV0byBnZW5lcmF0ZWQgYnkgYHZpbS1tb2RlLXBsdXM6d3JpdGUtY29tbWFuZC10YWJsZS1vbi1kaXNrYCBjb21tYW5kLlxcblwiXG4gICAgbG9hZGFibGVDU09OVGV4dCArPSBcIiMgRE9OVCBlZGl0IG1hbnVhbGx5LlxcblwiXG4gICAgbG9hZGFibGVDU09OVGV4dCArPSBcIm1vZHVsZS5leHBvcnRzID1cXG5cIlxuICAgIGxvYWRhYmxlQ1NPTlRleHQgKz0gQ1NPTi5zdHJpbmdpZnkoY29tbWFuZFRhYmxlKSArIFwiXFxuXCJcblxuICAgIGNvbnN0IGNvbW1hbmRUYWJsZVBhdGggPSBwYXRoLmpvaW4oX19kaXJuYW1lLCBcImNvbW1hbmQtdGFibGUuY29mZmVlXCIpXG4gICAgYXRvbS53b3Jrc3BhY2Uub3Blbihjb21tYW5kVGFibGVQYXRoKS50aGVuKGVkaXRvciA9PiB7XG4gICAgICBlZGl0b3Iuc2V0VGV4dChsb2FkYWJsZUNTT05UZXh0KVxuICAgICAgZWRpdG9yLnNhdmUoKVxuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEluZm8oXCJVcGRhdGVkIGNvbW1hbmRUYWJsZVwiLCB7ZGlzbWlzc2FibGU6IHRydWV9KVxuICAgIH0pXG4gIH1cblxuICBzdGF0aWMgZ2VuZXJhdGVDb21tYW5kVGFibGVCeUVhZ2VyTG9hZCgpIHtcbiAgICAvLyBOT1RFOiBjaGFuZ2luZyBvcmRlciBhZmZlY3RzIG91dHB1dCBvZiBsaWIvY29tbWFuZC10YWJsZS5jb2ZmZWVcbiAgICBjb25zdCBmaWxlc1RvTG9hZCA9IFtcbiAgICAgIFwiLi9vcGVyYXRvclwiLFxuICAgICAgXCIuL29wZXJhdG9yLWluc2VydFwiLFxuICAgICAgXCIuL29wZXJhdG9yLXRyYW5zZm9ybS1zdHJpbmdcIixcbiAgICAgIFwiLi9tb3Rpb25cIixcbiAgICAgIFwiLi9tb3Rpb24tc2VhcmNoXCIsXG4gICAgICBcIi4vdGV4dC1vYmplY3RcIixcbiAgICAgIFwiLi9taXNjLWNvbW1hbmRcIixcbiAgICBdXG4gICAgZmlsZXNUb0xvYWQuZm9yRWFjaChsb2FkVm1wT3BlcmF0aW9uRmlsZSlcbiAgICBjb25zdCBfID0gX3BsdXMoKVxuICAgIGNvbnN0IGtsYXNzZXNHcm91cGVkQnlGaWxlID0gXy5ncm91cEJ5KF8udmFsdWVzKENMQVNTX1JFR0lTVFJZKSwga2xhc3MgPT4ga2xhc3MuZmlsZSlcblxuICAgIGNvbnN0IGNvbW1hbmRUYWJsZSA9IHt9XG4gICAgZm9yIChjb25zdCBmaWxlIG9mIGZpbGVzVG9Mb2FkKSB7XG4gICAgICBmb3IgKGNvbnN0IGtsYXNzIG9mIGtsYXNzZXNHcm91cGVkQnlGaWxlW2ZpbGVdKSB7XG4gICAgICAgIGNvbW1hbmRUYWJsZVtrbGFzcy5uYW1lXSA9IGtsYXNzLmlzQ29tbWFuZCgpXG4gICAgICAgICAgPyB7ZmlsZToga2xhc3MuZmlsZSwgY29tbWFuZE5hbWU6IGtsYXNzLmdldENvbW1hbmROYW1lKCksIGNvbW1hbmRTY29wZToga2xhc3MuZ2V0Q29tbWFuZFNjb3BlKCl9XG4gICAgICAgICAgOiB7ZmlsZToga2xhc3MuZmlsZX1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGNvbW1hbmRUYWJsZVxuICB9XG5cbiAgc3RhdGljIGluaXQoZ2V0RWRpdG9yU3RhdGUpIHtcbiAgICB0aGlzLmdldEVkaXRvclN0YXRlID0gZ2V0RWRpdG9yU3RhdGVcblxuICAgIHRoaXMuY29tbWFuZFRhYmxlID0gcmVxdWlyZShcIi4vY29tbWFuZC10YWJsZVwiKVxuICAgIGNvbnN0IHN1YnNjcmlwdGlvbnMgPSBbXVxuICAgIGZvciAoY29uc3QgbmFtZSBpbiB0aGlzLmNvbW1hbmRUYWJsZSkge1xuICAgICAgY29uc3Qgc3BlYyA9IHRoaXMuY29tbWFuZFRhYmxlW25hbWVdXG4gICAgICBpZiAoc3BlYy5jb21tYW5kTmFtZSkge1xuICAgICAgICBzdWJzY3JpcHRpb25zLnB1c2godGhpcy5yZWdpc3RlckNvbW1hbmRGcm9tU3BlYyhuYW1lLCBzcGVjKSlcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHN1YnNjcmlwdGlvbnNcbiAgfVxuXG4gIHN0YXRpYyByZWdpc3Rlcihjb21tYW5kID0gdHJ1ZSkge1xuICAgIHRoaXMuY29tbWFuZCA9IGNvbW1hbmRcbiAgICB0aGlzLmZpbGUgPSBWTVBfTE9BRElOR19GSUxFXG4gICAgaWYgKHRoaXMubmFtZSBpbiBDTEFTU19SRUdJU1RSWSkge1xuICAgICAgY29uc29sZS53YXJuKGBEdXBsaWNhdGUgY29uc3RydWN0b3IgJHt0aGlzLm5hbWV9YClcbiAgICB9XG4gICAgQ0xBU1NfUkVHSVNUUllbdGhpcy5uYW1lXSA9IHRoaXNcbiAgfVxuXG4gIHN0YXRpYyBleHRlbmQoLi4uYXJncykge1xuICAgIGNvbnNvbGUuZXJyb3IoXCJjYWxsaW5nIGRlcHJlY2F0ZWQgQmFzZS5leHRlbmQoKSwgdXNlIEJhc2UucmVnaXN0ZXIgaW5zdGVhZCFcIilcbiAgICB0aGlzLnJlZ2lzdGVyKC4uLmFyZ3MpXG4gIH1cblxuICBzdGF0aWMgZ2V0Q2xhc3MobmFtZSkge1xuICAgIGlmIChuYW1lIGluIENMQVNTX1JFR0lTVFJZKSByZXR1cm4gQ0xBU1NfUkVHSVNUUllbbmFtZV1cblxuICAgIGNvbnN0IGZpbGVUb0xvYWQgPSB0aGlzLmNvbW1hbmRUYWJsZVtuYW1lXS5maWxlXG4gICAgaWYgKGF0b20uaW5EZXZNb2RlKCkgJiYgc2V0dGluZ3MuZ2V0KFwiZGVidWdcIikpIHtcbiAgICAgIGNvbnNvbGUubG9nKGBsYXp5LXJlcXVpcmU6ICR7ZmlsZVRvTG9hZH0gZm9yICR7bmFtZX1gKVxuICAgIH1cbiAgICBsb2FkVm1wT3BlcmF0aW9uRmlsZShmaWxlVG9Mb2FkKVxuICAgIGlmIChuYW1lIGluIENMQVNTX1JFR0lTVFJZKSByZXR1cm4gQ0xBU1NfUkVHSVNUUllbbmFtZV1cblxuICAgIHRocm93IG5ldyBFcnJvcihgY2xhc3MgJyR7bmFtZX0nIG5vdCBmb3VuZGApXG4gIH1cblxuICBzdGF0aWMgZ2V0SW5zdGFuY2UodmltU3RhdGUsIGtsYXNzT3JOYW1lLCBwcm9wZXJ0aWVzKSB7XG4gICAgY29uc3Qga2xhc3MgPSB0eXBlb2Yga2xhc3NPck5hbWUgPT09IFwiZnVuY3Rpb25cIiA/IGtsYXNzT3JOYW1lIDogQmFzZS5nZXRDbGFzcyhrbGFzc09yTmFtZSlcbiAgICBjb25zdCBpbnN0YW5jZSA9IG5ldyBrbGFzcyh2aW1TdGF0ZSlcbiAgICBpZiAocHJvcGVydGllcykgT2JqZWN0LmFzc2lnbihpbnN0YW5jZSwgcHJvcGVydGllcylcbiAgICByZXR1cm4gaW5zdGFuY2UuaW5pdGlhbGl6ZSgpIC8vIGluaXRpYWxpemUgbXVzdCByZXR1cm4gaW5zdGFuY2UuXG4gIH1cblxuICBzdGF0aWMgZ2V0Q2xhc3NSZWdpc3RyeSgpIHtcbiAgICByZXR1cm4gQ0xBU1NfUkVHSVNUUllcbiAgfVxuXG4gIHN0YXRpYyBpc0NvbW1hbmQoKSB7XG4gICAgcmV0dXJuIHRoaXMuY29tbWFuZFxuICB9XG5cbiAgc3RhdGljIGdldENvbW1hbmROYW1lKCkge1xuICAgIHJldHVybiB0aGlzLmNvbW1hbmRQcmVmaXggKyBcIjpcIiArIF9wbHVzKCkuZGFzaGVyaXplKHRoaXMubmFtZSlcbiAgfVxuXG4gIHN0YXRpYyBnZXRDb21tYW5kTmFtZVdpdGhvdXRQcmVmaXgoKSB7XG4gICAgcmV0dXJuIF9wbHVzKCkuZGFzaGVyaXplKHRoaXMubmFtZSlcbiAgfVxuXG4gIHN0YXRpYyBnZXRDb21tYW5kU2NvcGUoKSB7XG4gICAgcmV0dXJuIHRoaXMuY29tbWFuZFNjb3BlXG4gIH1cblxuICBzdGF0aWMgcmVnaXN0ZXJDb21tYW5kKCkge1xuICAgIHJldHVybiB0aGlzLnJlZ2lzdGVyQ29tbWFuZEZyb21TcGVjKHRoaXMubmFtZSwge1xuICAgICAgY29tbWFuZFNjb3BlOiB0aGlzLmdldENvbW1hbmRTY29wZSgpLFxuICAgICAgY29tbWFuZE5hbWU6IHRoaXMuZ2V0Q29tbWFuZE5hbWUoKSxcbiAgICAgIGdldENsYXNzOiAoKSA9PiB0aGlzLFxuICAgIH0pXG4gIH1cblxuICBzdGF0aWMgcmVnaXN0ZXJDb21tYW5kRnJvbVNwZWMobmFtZSwgc3BlYykge1xuICAgIGxldCB7Y29tbWFuZFNjb3BlID0gXCJhdG9tLXRleHQtZWRpdG9yXCIsIGNvbW1hbmRQcmVmaXggPSBcInZpbS1tb2RlLXBsdXNcIiwgY29tbWFuZE5hbWUsIGdldENsYXNzfSA9IHNwZWNcbiAgICBpZiAoIWNvbW1hbmROYW1lKSBjb21tYW5kTmFtZSA9IGNvbW1hbmRQcmVmaXggKyBcIjpcIiArIF9wbHVzKCkuZGFzaGVyaXplKG5hbWUpXG4gICAgaWYgKCFnZXRDbGFzcykgZ2V0Q2xhc3MgPSBuYW1lID0+IHRoaXMuZ2V0Q2xhc3MobmFtZSlcblxuICAgIGNvbnN0IGdldEVkaXRvclN0YXRlID0gdGhpcy5nZXRFZGl0b3JTdGF0ZVxuICAgIHJldHVybiBhdG9tLmNvbW1hbmRzLmFkZChjb21tYW5kU2NvcGUsIGNvbW1hbmROYW1lLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgY29uc3QgdmltU3RhdGUgPSBnZXRFZGl0b3JTdGF0ZSh0aGlzLmdldE1vZGVsKCkpIHx8IGdldEVkaXRvclN0YXRlKGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKSlcbiAgICAgIGlmICh2aW1TdGF0ZSkgdmltU3RhdGUub3BlcmF0aW9uU3RhY2sucnVuKGdldENsYXNzKG5hbWUpKSAvLyB2aW1TdGF0ZSBwb3NzaWJseSBiZSB1bmRlZmluZWQgU2VlICM4NVxuICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcbiAgICB9KVxuICB9XG5cbiAgc3RhdGljIGdldEtpbmRGb3JDb21tYW5kTmFtZShjb21tYW5kKSB7XG4gICAgY29uc3QgY29tbWFuZFdpdGhvdXRQcmVmaXggPSBjb21tYW5kLnJlcGxhY2UoL152aW0tbW9kZS1wbHVzOi8sIFwiXCIpXG4gICAgY29uc3Qge2NhcGl0YWxpemUsIGNhbWVsaXplfSA9IF9wbHVzKClcbiAgICBjb25zdCBjb21tYW5kQ2xhc3NOYW1lID0gY2FwaXRhbGl6ZShjYW1lbGl6ZShjb21tYW5kV2l0aG91dFByZWZpeCkpXG4gICAgaWYgKGNvbW1hbmRDbGFzc05hbWUgaW4gQ0xBU1NfUkVHSVNUUlkpIHtcbiAgICAgIHJldHVybiBDTEFTU19SRUdJU1RSWVtjb21tYW5kQ2xhc3NOYW1lXS5vcGVyYXRpb25LaW5kXG4gICAgfVxuICB9XG5cbiAgLy8gUHJveHkgcHJvcHBlcnRpZXMgYW5kIG1ldGhvZHNcbiAgLy89PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgZ2V0IG1vZGUoKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLm1vZGUgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgZ2V0IHN1Ym1vZGUoKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLnN1Ym1vZGUgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgZ2V0IHN3cmFwKCkgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5zd3JhcCB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBnZXQgdXRpbHMoKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLnV0aWxzIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIGdldCBlZGl0b3IoKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLmVkaXRvciB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBnZXQgZWRpdG9yRWxlbWVudCgpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUuZWRpdG9yRWxlbWVudCB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBnZXQgZ2xvYmFsU3RhdGUoKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLmdsb2JhbFN0YXRlIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIGdldCBtdXRhdGlvbk1hbmFnZXIoKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLm11dGF0aW9uTWFuYWdlciB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBnZXQgb2NjdXJyZW5jZU1hbmFnZXIoKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLm9jY3VycmVuY2VNYW5hZ2VyIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIGdldCBwZXJzaXN0ZW50U2VsZWN0aW9uKCkgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5wZXJzaXN0ZW50U2VsZWN0aW9uIH0gLy8gcHJldHRpZXItaWdub3JlXG5cbiAgb25EaWRDaGFuZ2VTZWFyY2goLi4uYXJncykgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5vbkRpZENoYW5nZVNlYXJjaCguLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBvbkRpZENvbmZpcm1TZWFyY2goLi4uYXJncykgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5vbkRpZENvbmZpcm1TZWFyY2goLi4uYXJncykgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgb25EaWRDYW5jZWxTZWFyY2goLi4uYXJncykgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5vbkRpZENhbmNlbFNlYXJjaCguLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBvbkRpZENvbW1hbmRTZWFyY2goLi4uYXJncykgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5vbkRpZENvbW1hbmRTZWFyY2goLi4uYXJncykgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgb25EaWRTZXRUYXJnZXQoLi4uYXJncykgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5vbkRpZFNldFRhcmdldCguLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBlbWl0RGlkU2V0VGFyZ2V0KC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUuZW1pdERpZFNldFRhcmdldCguLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBvbldpbGxTZWxlY3RUYXJnZXQoLi4uYXJncykgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5vbldpbGxTZWxlY3RUYXJnZXQoLi4uYXJncykgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgZW1pdFdpbGxTZWxlY3RUYXJnZXQoLi4uYXJncykgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5lbWl0V2lsbFNlbGVjdFRhcmdldCguLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBvbkRpZFNlbGVjdFRhcmdldCguLi5hcmdzKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLm9uRGlkU2VsZWN0VGFyZ2V0KC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIGVtaXREaWRTZWxlY3RUYXJnZXQoLi4uYXJncykgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5lbWl0RGlkU2VsZWN0VGFyZ2V0KC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIG9uRGlkRmFpbFNlbGVjdFRhcmdldCguLi5hcmdzKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLm9uRGlkRmFpbFNlbGVjdFRhcmdldCguLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBlbWl0RGlkRmFpbFNlbGVjdFRhcmdldCguLi5hcmdzKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLmVtaXREaWRGYWlsU2VsZWN0VGFyZ2V0KC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIG9uV2lsbEZpbmlzaE11dGF0aW9uKC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUub25XaWxsRmluaXNoTXV0YXRpb24oLi4uYXJncykgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgZW1pdFdpbGxGaW5pc2hNdXRhdGlvbiguLi5hcmdzKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLmVtaXRXaWxsRmluaXNoTXV0YXRpb24oLi4uYXJncykgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgb25EaWRGaW5pc2hNdXRhdGlvbiguLi5hcmdzKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLm9uRGlkRmluaXNoTXV0YXRpb24oLi4uYXJncykgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgZW1pdERpZEZpbmlzaE11dGF0aW9uKC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUuZW1pdERpZEZpbmlzaE11dGF0aW9uKC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIG9uRGlkRmluaXNoT3BlcmF0aW9uKC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUub25EaWRGaW5pc2hPcGVyYXRpb24oLi4uYXJncykgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgb25EaWRSZXNldE9wZXJhdGlvblN0YWNrKC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUub25EaWRSZXNldE9wZXJhdGlvblN0YWNrKC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIG9uRGlkU2V0T3BlcmF0b3JNb2RpZmllciguLi5hcmdzKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLm9uRGlkU2V0T3BlcmF0b3JNb2RpZmllciguLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBvbldpbGxBY3RpdmF0ZU1vZGUoLi4uYXJncykgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5vbldpbGxBY3RpdmF0ZU1vZGUoLi4uYXJncykgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgb25EaWRBY3RpdmF0ZU1vZGUoLi4uYXJncykgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5vbkRpZEFjdGl2YXRlTW9kZSguLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBwcmVlbXB0V2lsbERlYWN0aXZhdGVNb2RlKC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUucHJlZW1wdFdpbGxEZWFjdGl2YXRlTW9kZSguLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBvbldpbGxEZWFjdGl2YXRlTW9kZSguLi5hcmdzKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLm9uV2lsbERlYWN0aXZhdGVNb2RlKC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIG9uRGlkRGVhY3RpdmF0ZU1vZGUoLi4uYXJncykgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5vbkRpZERlYWN0aXZhdGVNb2RlKC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIG9uRGlkQ2FuY2VsU2VsZWN0TGlzdCguLi5hcmdzKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLm9uRGlkQ2FuY2VsU2VsZWN0TGlzdCguLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBzdWJzY3JpYmUoLi4uYXJncykgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5zdWJzY3JpYmUoLi4uYXJncykgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgaXNNb2RlKC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUuaXNNb2RlKC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIGdldEJsb2Nrd2lzZVNlbGVjdGlvbnMoLi4uYXJncykgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5nZXRCbG9ja3dpc2VTZWxlY3Rpb25zKC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIGdldExhc3RCbG9ja3dpc2VTZWxlY3Rpb24oLi4uYXJncykgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5nZXRMYXN0QmxvY2t3aXNlU2VsZWN0aW9uKC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIGFkZFRvQ2xhc3NMaXN0KC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUuYWRkVG9DbGFzc0xpc3QoLi4uYXJncykgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgZ2V0Q29uZmlnKC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUuZ2V0Q29uZmlnKC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG59XG5CYXNlLnJlZ2lzdGVyKGZhbHNlKVxuXG5tb2R1bGUuZXhwb3J0cyA9IEJhc2VcbiJdfQ==