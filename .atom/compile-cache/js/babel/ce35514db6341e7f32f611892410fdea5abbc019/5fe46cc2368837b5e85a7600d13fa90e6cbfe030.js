"use babel";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, "next"); var callThrow = step.bind(null, "throw"); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var settings = require("./settings");

var CSON = undefined,
    path = undefined,
    selectList = undefined,
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

    this.recordable = false;
    this.repeated = false;
    this.count = null;
    this.defaultCount = 1;

    this.vimState = vimState;
  }

  _createClass(Base, [{
    key: "initialize",
    value: function initialize() {}

    // Called both on cancel and success
  }, {
    key: "resetState",
    value: function resetState() {}

    // OperationStack postpone execution untill isReady() get true
    // Override if necessary.
  }, {
    key: "isReady",
    value: function isReady() {
      return true;
    }

    // VisualModeSelect is anormal, since it auto complemented in visial mode.
    // In other word, normal-operator is explicit whereas anormal-operator is inplicit.
  }, {
    key: "isTargetOfNormalOperator",
    value: function isTargetOfNormalOperator() {
      return this.operator && this.operator.name !== "VisualModeSelect";
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
    key: "focusInputPromisified",
    value: function focusInputPromisified() {
      var _this4 = this;

      var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      return new Promise(function (onConfirm, onCancel) {
        var defaultOptions = {
          hideCursor: true,
          onChange: function onChange(input) {
            return _this4.vimState.hover.set(input);
          }
        };
        _this4.vimState.focusInput(Object.assign(defaultOptions, options, { onConfirm: onConfirm, onCancel: onCancel }));
      });
    }
  }, {
    key: "readChar",
    value: function readChar() {
      var _this5 = this;

      this.vimState.readChar({
        onConfirm: function onConfirm(input) {
          _this5.input = input;
          _this5.processOperation();
        },
        onCancel: function onCancel() {
          return _this5.cancelOperation();
        }
      });
    }

    // Return promise which resolve with read char or `undefined` when cancelled.
  }, {
    key: "readCharPromised",
    value: function readCharPromised() {
      var _this6 = this;

      return new Promise(function (resolve) {
        _this6.vimState.readChar({ onConfirm: resolve, onCancel: resolve });
      });
    }
  }, {
    key: "instanceof",
    value: function _instanceof(klassName) {
      return this instanceof Base.getClass(klassName);
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
      return this.getBufferPositionForCursor(this.editor.getLastCursor());
    }
  }, {
    key: "getCursorBufferPositions",
    value: function getCursorBufferPositions() {
      var _this7 = this;

      return this.editor.getCursors().map(function (cursor) {
        return _this7.getBufferPositionForCursor(cursor);
      });
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
    key: "getOperationTypeChar",
    value: function getOperationTypeChar() {
      return ({ operator: "O", "text-object": "T", motion: "M", "misc-command": "X" })[this.constructor.operationKind];
    }
  }, {
    key: "toString",
    value: function toString() {
      var base = this.name + "<" + this.getOperationTypeChar() + ">";
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
    key: "getSmoothScrollDuation",
    value: function getSmoothScrollDuation(kind) {
      var base = "smoothScrollOn" + kind;
      return this.getConfig(base) ? this.getConfig(base + "Duration") : 0;
    }

    // Proxy propperties and methods
    //===========================================================================
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

    // Wrapper for this.utils
    //===========================================================================
  }, {
    key: "getVimEofBufferPosition",
    value: function getVimEofBufferPosition() {
      return this.utils.getVimEofBufferPosition(this.editor);
    }
    // prettier-ignore
  }, {
    key: "getVimLastBufferRow",
    value: function getVimLastBufferRow() {
      return this.utils.getVimLastBufferRow(this.editor);
    }
    // prettier-ignore
  }, {
    key: "getVimLastScreenRow",
    value: function getVimLastScreenRow() {
      return this.utils.getVimLastScreenRow(this.editor);
    }
    // prettier-ignore
  }, {
    key: "getValidVimBufferRow",
    value: function getValidVimBufferRow(row) {
      return this.utils.getValidVimBufferRow(this.editor, row);
    }
    // prettier-ignore
  }, {
    key: "getValidVimScreenRow",
    value: function getValidVimScreenRow(row) {
      return this.utils.getValidVimScreenRow(this.editor, row);
    }
    // prettier-ignore
  }, {
    key: "getWordBufferRangeAndKindAtBufferPosition",
    value: function getWordBufferRangeAndKindAtBufferPosition() {
      var _utils;

      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return (_utils = this.utils).getWordBufferRangeAndKindAtBufferPosition.apply(_utils, [this.editor].concat(args));
    }
    // prettier-ignore
  }, {
    key: "getFirstCharacterPositionForBufferRow",
    value: function getFirstCharacterPositionForBufferRow(row) {
      return this.utils.getFirstCharacterPositionForBufferRow(this.editor, row);
    }
    // prettier-ignore
  }, {
    key: "getBufferRangeForRowRange",
    value: function getBufferRangeForRowRange(rowRange) {
      return this.utils.getBufferRangeForRowRange(this.editor, rowRange);
    }
    // prettier-ignore
  }, {
    key: "scanForward",
    value: function scanForward() {
      var _utils2;

      for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      return (_utils2 = this.utils).scanEditor.apply(_utils2, [this.editor, "forward"].concat(args));
    }
    // prettier-ignore
  }, {
    key: "scanBackward",
    value: function scanBackward() {
      var _utils3;

      for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        args[_key3] = arguments[_key3];
      }

      return (_utils3 = this.utils).scanEditor.apply(_utils3, [this.editor, "backward"].concat(args));
    }
    // prettier-ignore
  }, {
    key: "getFoldStartRowForRow",
    value: function getFoldStartRowForRow() {
      var _utils4;

      for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
        args[_key4] = arguments[_key4];
      }

      return (_utils4 = this.utils).getFoldStartRowForRow.apply(_utils4, [this.editor].concat(args));
    }
    // prettier-ignore
  }, {
    key: "getFoldEndRowForRow",
    value: function getFoldEndRowForRow() {
      var _utils5;

      for (var _len5 = arguments.length, args = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
        args[_key5] = arguments[_key5];
      }

      return (_utils5 = this.utils).getFoldEndRowForRow.apply(_utils5, [this.editor].concat(args));
    }
    // prettier-ignore
  }, {
    key: "getBufferRows",
    value: function getBufferRows() {
      var _utils6;

      for (var _len6 = arguments.length, args = Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
        args[_key6] = arguments[_key6];
      }

      return (_utils6 = this.utils).getRows.apply(_utils6, [this.editor, "buffer"].concat(args));
    }
    // prettier-ignore
  }, {
    key: "getScreenRows",
    value: function getScreenRows() {
      var _utils7;

      for (var _len7 = arguments.length, args = Array(_len7), _key7 = 0; _key7 < _len7; _key7++) {
        args[_key7] = arguments[_key7];
      }

      return (_utils7 = this.utils).getRows.apply(_utils7, [this.editor, "screen"].concat(args));
    }
    // prettier-ignore
  }, {
    key: "mode",
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
    value: _asyncToGenerator(function* () {
      var commandTable = this.generateCommandTableByEagerLoad();
      var _ = _plus();
      if (_.isEqual(this.commandTable, commandTable)) {
        atom.notifications.addInfo("No changes in commandTable", { dismissable: true });
        return;
      }

      if (!CSON) CSON = require("season");
      if (!path) path = require("path");

      var loadableCSONText = ["# This file is auto generated by `vim-mode-plus:write-command-table-on-disk` command.", "# DONT edit manually.", "module.exports =", CSON.stringify(commandTable)].join("\n") + "\n";

      var commandTablePath = path.join(__dirname, "command-table.coffee");
      var editor = yield atom.workspace.open(commandTablePath, { activatePane: false, activateItem: false });
      editor.setText(loadableCSONText);
      yield editor.save();
      atom.notifications.addInfo("Updated commandTable", { dismissable: true });
    })
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

    // Return disposables for vmp commands.
  }, {
    key: "init",
    value: function init(getEditorState) {
      var _this8 = this;

      this.getEditorState = getEditorState;
      this.commandTable = require("./command-table");

      return Object.keys(this.commandTable).filter(function (name) {
        return _this8.commandTable[name].commandName;
      }).map(function (name) {
        return _this8.registerCommandFromSpec(name, _this8.commandTable[name]);
      });
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
      var _this9 = this;

      return this.registerCommandFromSpec(this.name, {
        commandScope: this.commandScope,
        commandName: this.getCommandName(),
        getClass: function getClass() {
          return _this9;
        }
      });
    }
  }, {
    key: "registerCommandFromSpec",
    value: function registerCommandFromSpec(name, spec) {
      var _this10 = this;

      var _spec$commandScope = spec.commandScope;
      var commandScope = _spec$commandScope === undefined ? "atom-text-editor" : _spec$commandScope;
      var _spec$commandPrefix = spec.commandPrefix;
      var commandPrefix = _spec$commandPrefix === undefined ? "vim-mode-plus" : _spec$commandPrefix;
      var commandName = spec.commandName;
      var getClass = spec.getClass;

      if (!commandName) commandName = commandPrefix + ":" + _plus().dasherize(name);
      if (!getClass) getClass = function (name) {
        return _this10.getClass(name);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL2Jhc2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsV0FBVyxDQUFBOzs7Ozs7OztBQUVYLElBQU0sUUFBUSxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQTs7QUFFdEMsSUFBSSxJQUFJLFlBQUE7SUFBRSxJQUFJLFlBQUE7SUFBRSxVQUFVLFlBQUE7SUFBRSxNQUFNLFlBQUEsQ0FBQTtBQUNsQyxJQUFNLGNBQWMsR0FBRyxFQUFFLENBQUE7O0FBRXpCLFNBQVMsS0FBSyxHQUFHO0FBQ2YsU0FBTyxNQUFNLEtBQUssTUFBTSxHQUFHLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFBLEFBQUMsQ0FBQTtDQUN2RDs7QUFFRCxJQUFJLGdCQUFnQixZQUFBLENBQUE7QUFDcEIsU0FBUyxvQkFBb0IsQ0FBQyxRQUFRLEVBQUU7Ozs7O0FBS3RDLE1BQU0sU0FBUyxHQUFHLGdCQUFnQixDQUFBO0FBQ2xDLGtCQUFnQixHQUFHLFFBQVEsQ0FBQTtBQUMzQixTQUFPLENBQUMsUUFBUSxDQUFDLENBQUE7QUFDakIsa0JBQWdCLEdBQUcsU0FBUyxDQUFBO0NBQzdCOztJQUVLLElBQUk7ZUFBSixJQUFJOztTQVlBLGVBQUc7QUFDVCxhQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFBO0tBQzdCOzs7V0FicUIsSUFBSTs7OztXQUNILGVBQWU7Ozs7V0FDaEIsa0JBQWtCOzs7O1dBQ2pCLElBQUk7Ozs7V0FDSCxJQUFJOzs7Ozs7QUFXakIsV0FoQlAsSUFBSSxDQWdCSSxRQUFRLEVBQUU7MEJBaEJsQixJQUFJOztTQU9SLFVBQVUsR0FBRyxLQUFLO1NBQ2xCLFFBQVEsR0FBRyxLQUFLO1NBQ2hCLEtBQUssR0FBRyxJQUFJO1NBQ1osWUFBWSxHQUFHLENBQUM7O0FBT2QsUUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUE7R0FDekI7O2VBbEJH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STs7O0FBaVlWLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUE7O0FBRXBCLE1BQU0sQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFBIiwiZmlsZSI6Ii9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL2Jhc2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBiYWJlbFwiXG5cbmNvbnN0IHNldHRpbmdzID0gcmVxdWlyZShcIi4vc2V0dGluZ3NcIilcblxubGV0IENTT04sIHBhdGgsIHNlbGVjdExpc3QsIF9fcGx1c1xuY29uc3QgQ0xBU1NfUkVHSVNUUlkgPSB7fVxuXG5mdW5jdGlvbiBfcGx1cygpIHtcbiAgcmV0dXJuIF9fcGx1cyB8fCAoX19wbHVzID0gcmVxdWlyZShcInVuZGVyc2NvcmUtcGx1c1wiKSlcbn1cblxubGV0IFZNUF9MT0FESU5HX0ZJTEVcbmZ1bmN0aW9uIGxvYWRWbXBPcGVyYXRpb25GaWxlKGZpbGVuYW1lKSB7XG4gIC8vIENhbGwgdG8gbG9hZFZtcE9wZXJhdGlvbkZpbGUgY2FuIGJlIG5lc3RlZC5cbiAgLy8gMS4gcmVxdWlyZShcIi4vb3BlcmF0b3ItdHJhbnNmb3JtLXN0cmluZ1wiKVxuICAvLyAyLiBpbiBvcGVyYXRvci10cmFuc2Zvcm0tc3RyaW5nLmNvZmZlZSBjYWxsIEJhc2UuZ2V0Q2xhc3MoXCJPcGVyYXRvclwiKSBjYXVzZSBvcGVyYXRvci5jb2ZmZWUgcmVxdWlyZWQuXG4gIC8vIFNvIHdlIGhhdmUgdG8gc2F2ZSBvcmlnaW5hbCBWTVBfTE9BRElOR19GSUxFIGFuZCByZXN0b3JlIGl0IGFmdGVyIHJlcXVpcmUgZmluaXNoZWQuXG4gIGNvbnN0IHByZXNlcnZlZCA9IFZNUF9MT0FESU5HX0ZJTEVcbiAgVk1QX0xPQURJTkdfRklMRSA9IGZpbGVuYW1lXG4gIHJlcXVpcmUoZmlsZW5hbWUpXG4gIFZNUF9MT0FESU5HX0ZJTEUgPSBwcmVzZXJ2ZWRcbn1cblxuY2xhc3MgQmFzZSB7XG4gIHN0YXRpYyBjb21tYW5kVGFibGUgPSBudWxsXG4gIHN0YXRpYyBjb21tYW5kUHJlZml4ID0gXCJ2aW0tbW9kZS1wbHVzXCJcbiAgc3RhdGljIGNvbW1hbmRTY29wZSA9IFwiYXRvbS10ZXh0LWVkaXRvclwiXG4gIHN0YXRpYyBvcGVyYXRpb25LaW5kID0gbnVsbFxuICBzdGF0aWMgZ2V0RWRpdG9yU3RhdGUgPSBudWxsIC8vIHNldCB0aHJvdWdoIGluaXQoKVxuXG4gIHJlY29yZGFibGUgPSBmYWxzZVxuICByZXBlYXRlZCA9IGZhbHNlXG4gIGNvdW50ID0gbnVsbFxuICBkZWZhdWx0Q291bnQgPSAxXG5cbiAgZ2V0IG5hbWUoKSB7XG4gICAgcmV0dXJuIHRoaXMuY29uc3RydWN0b3IubmFtZVxuICB9XG5cbiAgY29uc3RydWN0b3IodmltU3RhdGUpIHtcbiAgICB0aGlzLnZpbVN0YXRlID0gdmltU3RhdGVcbiAgfVxuXG4gIGluaXRpYWxpemUoKSB7fVxuXG4gIC8vIENhbGxlZCBib3RoIG9uIGNhbmNlbCBhbmQgc3VjY2Vzc1xuICByZXNldFN0YXRlKCkge31cblxuICAvLyBPcGVyYXRpb25TdGFjayBwb3N0cG9uZSBleGVjdXRpb24gdW50aWxsIGlzUmVhZHkoKSBnZXQgdHJ1ZVxuICAvLyBPdmVycmlkZSBpZiBuZWNlc3NhcnkuXG4gIGlzUmVhZHkoKSB7XG4gICAgcmV0dXJuIHRydWVcbiAgfVxuXG4gIC8vIFZpc3VhbE1vZGVTZWxlY3QgaXMgYW5vcm1hbCwgc2luY2UgaXQgYXV0byBjb21wbGVtZW50ZWQgaW4gdmlzaWFsIG1vZGUuXG4gIC8vIEluIG90aGVyIHdvcmQsIG5vcm1hbC1vcGVyYXRvciBpcyBleHBsaWNpdCB3aGVyZWFzIGFub3JtYWwtb3BlcmF0b3IgaXMgaW5wbGljaXQuXG4gIGlzVGFyZ2V0T2ZOb3JtYWxPcGVyYXRvcigpIHtcbiAgICByZXR1cm4gdGhpcy5vcGVyYXRvciAmJiB0aGlzLm9wZXJhdG9yLm5hbWUgIT09IFwiVmlzdWFsTW9kZVNlbGVjdFwiXG4gIH1cblxuICBnZXRDb3VudChvZmZzZXQgPSAwKSB7XG4gICAgaWYgKHRoaXMuY291bnQgPT0gbnVsbCkge1xuICAgICAgdGhpcy5jb3VudCA9IHRoaXMudmltU3RhdGUuaGFzQ291bnQoKSA/IHRoaXMudmltU3RhdGUuZ2V0Q291bnQoKSA6IHRoaXMuZGVmYXVsdENvdW50XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmNvdW50ICsgb2Zmc2V0XG4gIH1cblxuICByZXNldENvdW50KCkge1xuICAgIHRoaXMuY291bnQgPSBudWxsXG4gIH1cblxuICBjb3VudFRpbWVzKGxhc3QsIGZuKSB7XG4gICAgaWYgKGxhc3QgPCAxKSByZXR1cm5cblxuICAgIGxldCBzdG9wcGVkID0gZmFsc2VcbiAgICBjb25zdCBzdG9wID0gKCkgPT4gKHN0b3BwZWQgPSB0cnVlKVxuICAgIGZvciAobGV0IGNvdW50ID0gMTsgY291bnQgPD0gbGFzdDsgY291bnQrKykge1xuICAgICAgZm4oe2NvdW50LCBpc0ZpbmFsOiBjb3VudCA9PT0gbGFzdCwgc3RvcH0pXG4gICAgICBpZiAoc3RvcHBlZCkgYnJlYWtcbiAgICB9XG4gIH1cblxuICBhY3RpdmF0ZU1vZGUobW9kZSwgc3VibW9kZSkge1xuICAgIHRoaXMub25EaWRGaW5pc2hPcGVyYXRpb24oKCkgPT4gdGhpcy52aW1TdGF0ZS5hY3RpdmF0ZShtb2RlLCBzdWJtb2RlKSlcbiAgfVxuXG4gIGFjdGl2YXRlTW9kZUlmTmVjZXNzYXJ5KG1vZGUsIHN1Ym1vZGUpIHtcbiAgICBpZiAoIXRoaXMudmltU3RhdGUuaXNNb2RlKG1vZGUsIHN1Ym1vZGUpKSB7XG4gICAgICB0aGlzLmFjdGl2YXRlTW9kZShtb2RlLCBzdWJtb2RlKVxuICAgIH1cbiAgfVxuXG4gIGdldEluc3RhbmNlKG5hbWUsIHByb3BlcnRpZXMpIHtcbiAgICByZXR1cm4gdGhpcy5jb25zdHJ1Y3Rvci5nZXRJbnN0YW5jZSh0aGlzLnZpbVN0YXRlLCBuYW1lLCBwcm9wZXJ0aWVzKVxuICB9XG5cbiAgY2FuY2VsT3BlcmF0aW9uKCkge1xuICAgIHRoaXMudmltU3RhdGUub3BlcmF0aW9uU3RhY2suY2FuY2VsKHRoaXMpXG4gIH1cblxuICBwcm9jZXNzT3BlcmF0aW9uKCkge1xuICAgIHRoaXMudmltU3RhdGUub3BlcmF0aW9uU3RhY2sucHJvY2VzcygpXG4gIH1cblxuICBmb2N1c1NlbGVjdExpc3Qob3B0aW9ucyA9IHt9KSB7XG4gICAgdGhpcy5vbkRpZENhbmNlbFNlbGVjdExpc3QoKCkgPT4gdGhpcy5jYW5jZWxPcGVyYXRpb24oKSlcbiAgICBpZiAoIXNlbGVjdExpc3QpIHtcbiAgICAgIHNlbGVjdExpc3QgPSBuZXcgKHJlcXVpcmUoXCIuL3NlbGVjdC1saXN0XCIpKSgpXG4gICAgfVxuICAgIHNlbGVjdExpc3Quc2hvdyh0aGlzLnZpbVN0YXRlLCBvcHRpb25zKVxuICB9XG5cbiAgZm9jdXNJbnB1dChvcHRpb25zID0ge30pIHtcbiAgICBpZiAoIW9wdGlvbnMub25Db25maXJtKSB7XG4gICAgICBvcHRpb25zLm9uQ29uZmlybSA9IGlucHV0ID0+IHtcbiAgICAgICAgdGhpcy5pbnB1dCA9IGlucHV0XG4gICAgICAgIHRoaXMucHJvY2Vzc09wZXJhdGlvbigpXG4gICAgICB9XG4gICAgfVxuICAgIGlmICghb3B0aW9ucy5vbkNhbmNlbCkgb3B0aW9ucy5vbkNhbmNlbCA9ICgpID0+IHRoaXMuY2FuY2VsT3BlcmF0aW9uKClcbiAgICBpZiAoIW9wdGlvbnMub25DaGFuZ2UpIG9wdGlvbnMub25DaGFuZ2UgPSBpbnB1dCA9PiB0aGlzLnZpbVN0YXRlLmhvdmVyLnNldChpbnB1dClcblxuICAgIHRoaXMudmltU3RhdGUuZm9jdXNJbnB1dChvcHRpb25zKVxuICB9XG5cbiAgZm9jdXNJbnB1dFByb21pc2lmaWVkKG9wdGlvbnMgPSB7fSkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgob25Db25maXJtLCBvbkNhbmNlbCkgPT4ge1xuICAgICAgY29uc3QgZGVmYXVsdE9wdGlvbnMgPSB7XG4gICAgICAgIGhpZGVDdXJzb3I6IHRydWUsXG4gICAgICAgIG9uQ2hhbmdlOiBpbnB1dCA9PiB0aGlzLnZpbVN0YXRlLmhvdmVyLnNldChpbnB1dCksXG4gICAgICB9XG4gICAgICB0aGlzLnZpbVN0YXRlLmZvY3VzSW5wdXQoT2JqZWN0LmFzc2lnbihkZWZhdWx0T3B0aW9ucywgb3B0aW9ucywge29uQ29uZmlybSwgb25DYW5jZWx9KSlcbiAgICB9KVxuICB9XG5cbiAgcmVhZENoYXIoKSB7XG4gICAgdGhpcy52aW1TdGF0ZS5yZWFkQ2hhcih7XG4gICAgICBvbkNvbmZpcm06IGlucHV0ID0+IHtcbiAgICAgICAgdGhpcy5pbnB1dCA9IGlucHV0XG4gICAgICAgIHRoaXMucHJvY2Vzc09wZXJhdGlvbigpXG4gICAgICB9LFxuICAgICAgb25DYW5jZWw6ICgpID0+IHRoaXMuY2FuY2VsT3BlcmF0aW9uKCksXG4gICAgfSlcbiAgfVxuXG4gIC8vIFJldHVybiBwcm9taXNlIHdoaWNoIHJlc29sdmUgd2l0aCByZWFkIGNoYXIgb3IgYHVuZGVmaW5lZGAgd2hlbiBjYW5jZWxsZWQuXG4gIHJlYWRDaGFyUHJvbWlzZWQoKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgICAgdGhpcy52aW1TdGF0ZS5yZWFkQ2hhcih7b25Db25maXJtOiByZXNvbHZlLCBvbkNhbmNlbDogcmVzb2x2ZX0pXG4gICAgfSlcbiAgfVxuXG4gIGluc3RhbmNlb2Yoa2xhc3NOYW1lKSB7XG4gICAgcmV0dXJuIHRoaXMgaW5zdGFuY2VvZiBCYXNlLmdldENsYXNzKGtsYXNzTmFtZSlcbiAgfVxuXG4gIGlzT3BlcmF0b3IoKSB7XG4gICAgLy8gRG9uJ3QgdXNlIGBpbnN0YW5jZW9mYCB0byBwb3N0cG9uZSByZXF1aXJlIGZvciBmYXN0ZXIgYWN0aXZhdGlvbi5cbiAgICByZXR1cm4gdGhpcy5jb25zdHJ1Y3Rvci5vcGVyYXRpb25LaW5kID09PSBcIm9wZXJhdG9yXCJcbiAgfVxuXG4gIGlzTW90aW9uKCkge1xuICAgIC8vIERvbid0IHVzZSBgaW5zdGFuY2VvZmAgdG8gcG9zdHBvbmUgcmVxdWlyZSBmb3IgZmFzdGVyIGFjdGl2YXRpb24uXG4gICAgcmV0dXJuIHRoaXMuY29uc3RydWN0b3Iub3BlcmF0aW9uS2luZCA9PT0gXCJtb3Rpb25cIlxuICB9XG5cbiAgaXNUZXh0T2JqZWN0KCkge1xuICAgIC8vIERvbid0IHVzZSBgaW5zdGFuY2VvZmAgdG8gcG9zdHBvbmUgcmVxdWlyZSBmb3IgZmFzdGVyIGFjdGl2YXRpb24uXG4gICAgcmV0dXJuIHRoaXMuY29uc3RydWN0b3Iub3BlcmF0aW9uS2luZCA9PT0gXCJ0ZXh0LW9iamVjdFwiXG4gIH1cblxuICBnZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRCdWZmZXJQb3NpdGlvbkZvckN1cnNvcih0aGlzLmVkaXRvci5nZXRMYXN0Q3Vyc29yKCkpXG4gIH1cblxuICBnZXRDdXJzb3JCdWZmZXJQb3NpdGlvbnMoKSB7XG4gICAgcmV0dXJuIHRoaXMuZWRpdG9yLmdldEN1cnNvcnMoKS5tYXAoY3Vyc29yID0+IHRoaXMuZ2V0QnVmZmVyUG9zaXRpb25Gb3JDdXJzb3IoY3Vyc29yKSlcbiAgfVxuXG4gIGdldEN1cnNvckJ1ZmZlclBvc2l0aW9uc09yZGVyZWQoKSB7XG4gICAgcmV0dXJuIHRoaXMudXRpbHMuc29ydFBvaW50cyh0aGlzLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9ucygpKVxuICB9XG5cbiAgZ2V0QnVmZmVyUG9zaXRpb25Gb3JDdXJzb3IoY3Vyc29yKSB7XG4gICAgcmV0dXJuIHRoaXMubW9kZSA9PT0gXCJ2aXN1YWxcIiA/IHRoaXMuZ2V0Q3Vyc29yUG9zaXRpb25Gb3JTZWxlY3Rpb24oY3Vyc29yLnNlbGVjdGlvbikgOiBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuICB9XG5cbiAgZ2V0Q3Vyc29yUG9zaXRpb25Gb3JTZWxlY3Rpb24oc2VsZWN0aW9uKSB7XG4gICAgcmV0dXJuIHRoaXMuc3dyYXAoc2VsZWN0aW9uKS5nZXRCdWZmZXJQb3NpdGlvbkZvcihcImhlYWRcIiwge2Zyb206IFtcInByb3BlcnR5XCIsIFwic2VsZWN0aW9uXCJdfSlcbiAgfVxuXG4gIGdldE9wZXJhdGlvblR5cGVDaGFyKCkge1xuICAgIHJldHVybiB7b3BlcmF0b3I6IFwiT1wiLCBcInRleHQtb2JqZWN0XCI6IFwiVFwiLCBtb3Rpb246IFwiTVwiLCBcIm1pc2MtY29tbWFuZFwiOiBcIlhcIn1bdGhpcy5jb25zdHJ1Y3Rvci5vcGVyYXRpb25LaW5kXVxuICB9XG5cbiAgdG9TdHJpbmcoKSB7XG4gICAgY29uc3QgYmFzZSA9IGAke3RoaXMubmFtZX08JHt0aGlzLmdldE9wZXJhdGlvblR5cGVDaGFyKCl9PmBcbiAgICByZXR1cm4gdGhpcy50YXJnZXQgPyBgJHtiYXNlfXt0YXJnZXQgPSAke3RoaXMudGFyZ2V0LnRvU3RyaW5nKCl9fWAgOiBiYXNlXG4gIH1cblxuICBnZXRDb21tYW5kTmFtZSgpIHtcbiAgICByZXR1cm4gdGhpcy5jb25zdHJ1Y3Rvci5nZXRDb21tYW5kTmFtZSgpXG4gIH1cblxuICBnZXRDb21tYW5kTmFtZVdpdGhvdXRQcmVmaXgoKSB7XG4gICAgcmV0dXJuIHRoaXMuY29uc3RydWN0b3IuZ2V0Q29tbWFuZE5hbWVXaXRob3V0UHJlZml4KClcbiAgfVxuXG4gIHN0YXRpYyBhc3luYyB3cml0ZUNvbW1hbmRUYWJsZU9uRGlzaygpIHtcbiAgICBjb25zdCBjb21tYW5kVGFibGUgPSB0aGlzLmdlbmVyYXRlQ29tbWFuZFRhYmxlQnlFYWdlckxvYWQoKVxuICAgIGNvbnN0IF8gPSBfcGx1cygpXG4gICAgaWYgKF8uaXNFcXVhbCh0aGlzLmNvbW1hbmRUYWJsZSwgY29tbWFuZFRhYmxlKSkge1xuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEluZm8oXCJObyBjaGFuZ2VzIGluIGNvbW1hbmRUYWJsZVwiLCB7ZGlzbWlzc2FibGU6IHRydWV9KVxuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgaWYgKCFDU09OKSBDU09OID0gcmVxdWlyZShcInNlYXNvblwiKVxuICAgIGlmICghcGF0aCkgcGF0aCA9IHJlcXVpcmUoXCJwYXRoXCIpXG5cbiAgICBjb25zdCBsb2FkYWJsZUNTT05UZXh0ID1cbiAgICAgIFtcbiAgICAgICAgXCIjIFRoaXMgZmlsZSBpcyBhdXRvIGdlbmVyYXRlZCBieSBgdmltLW1vZGUtcGx1czp3cml0ZS1jb21tYW5kLXRhYmxlLW9uLWRpc2tgIGNvbW1hbmQuXCIsXG4gICAgICAgIFwiIyBET05UIGVkaXQgbWFudWFsbHkuXCIsXG4gICAgICAgIFwibW9kdWxlLmV4cG9ydHMgPVwiLFxuICAgICAgICBDU09OLnN0cmluZ2lmeShjb21tYW5kVGFibGUpLFxuICAgICAgXS5qb2luKFwiXFxuXCIpICsgXCJcXG5cIlxuXG4gICAgY29uc3QgY29tbWFuZFRhYmxlUGF0aCA9IHBhdGguam9pbihfX2Rpcm5hbWUsIFwiY29tbWFuZC10YWJsZS5jb2ZmZWVcIilcbiAgICBjb25zdCBlZGl0b3IgPSBhd2FpdCBhdG9tLndvcmtzcGFjZS5vcGVuKGNvbW1hbmRUYWJsZVBhdGgsIHthY3RpdmF0ZVBhbmU6IGZhbHNlLCBhY3RpdmF0ZUl0ZW06IGZhbHNlfSlcbiAgICBlZGl0b3Iuc2V0VGV4dChsb2FkYWJsZUNTT05UZXh0KVxuICAgIGF3YWl0IGVkaXRvci5zYXZlKClcbiAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkSW5mbyhcIlVwZGF0ZWQgY29tbWFuZFRhYmxlXCIsIHtkaXNtaXNzYWJsZTogdHJ1ZX0pXG4gIH1cblxuICBzdGF0aWMgZ2VuZXJhdGVDb21tYW5kVGFibGVCeUVhZ2VyTG9hZCgpIHtcbiAgICAvLyBOT1RFOiBjaGFuZ2luZyBvcmRlciBhZmZlY3RzIG91dHB1dCBvZiBsaWIvY29tbWFuZC10YWJsZS5jb2ZmZWVcbiAgICBjb25zdCBmaWxlc1RvTG9hZCA9IFtcbiAgICAgIFwiLi9vcGVyYXRvclwiLFxuICAgICAgXCIuL29wZXJhdG9yLWluc2VydFwiLFxuICAgICAgXCIuL29wZXJhdG9yLXRyYW5zZm9ybS1zdHJpbmdcIixcbiAgICAgIFwiLi9tb3Rpb25cIixcbiAgICAgIFwiLi9tb3Rpb24tc2VhcmNoXCIsXG4gICAgICBcIi4vdGV4dC1vYmplY3RcIixcbiAgICAgIFwiLi9taXNjLWNvbW1hbmRcIixcbiAgICBdXG4gICAgZmlsZXNUb0xvYWQuZm9yRWFjaChsb2FkVm1wT3BlcmF0aW9uRmlsZSlcbiAgICBjb25zdCBfID0gX3BsdXMoKVxuICAgIGNvbnN0IGtsYXNzZXNHcm91cGVkQnlGaWxlID0gXy5ncm91cEJ5KF8udmFsdWVzKENMQVNTX1JFR0lTVFJZKSwga2xhc3MgPT4ga2xhc3MuZmlsZSlcblxuICAgIGNvbnN0IGNvbW1hbmRUYWJsZSA9IHt9XG4gICAgZm9yIChjb25zdCBmaWxlIG9mIGZpbGVzVG9Mb2FkKSB7XG4gICAgICBmb3IgKGNvbnN0IGtsYXNzIG9mIGtsYXNzZXNHcm91cGVkQnlGaWxlW2ZpbGVdKSB7XG4gICAgICAgIGNvbW1hbmRUYWJsZVtrbGFzcy5uYW1lXSA9IGtsYXNzLmNvbW1hbmRcbiAgICAgICAgICA/IHtmaWxlOiBrbGFzcy5maWxlLCBjb21tYW5kTmFtZToga2xhc3MuZ2V0Q29tbWFuZE5hbWUoKSwgY29tbWFuZFNjb3BlOiBrbGFzcy5jb21tYW5kU2NvcGV9XG4gICAgICAgICAgOiB7ZmlsZToga2xhc3MuZmlsZX1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGNvbW1hbmRUYWJsZVxuICB9XG5cbiAgLy8gUmV0dXJuIGRpc3Bvc2FibGVzIGZvciB2bXAgY29tbWFuZHMuXG4gIHN0YXRpYyBpbml0KGdldEVkaXRvclN0YXRlKSB7XG4gICAgdGhpcy5nZXRFZGl0b3JTdGF0ZSA9IGdldEVkaXRvclN0YXRlXG4gICAgdGhpcy5jb21tYW5kVGFibGUgPSByZXF1aXJlKFwiLi9jb21tYW5kLXRhYmxlXCIpXG5cbiAgICByZXR1cm4gT2JqZWN0LmtleXModGhpcy5jb21tYW5kVGFibGUpXG4gICAgICAuZmlsdGVyKG5hbWUgPT4gdGhpcy5jb21tYW5kVGFibGVbbmFtZV0uY29tbWFuZE5hbWUpXG4gICAgICAubWFwKG5hbWUgPT4gdGhpcy5yZWdpc3RlckNvbW1hbmRGcm9tU3BlYyhuYW1lLCB0aGlzLmNvbW1hbmRUYWJsZVtuYW1lXSkpXG4gIH1cblxuICBzdGF0aWMgcmVnaXN0ZXIoY29tbWFuZCA9IHRydWUpIHtcbiAgICB0aGlzLmNvbW1hbmQgPSBjb21tYW5kXG4gICAgdGhpcy5maWxlID0gVk1QX0xPQURJTkdfRklMRVxuICAgIGlmICh0aGlzLm5hbWUgaW4gQ0xBU1NfUkVHSVNUUlkpIHtcbiAgICAgIGNvbnNvbGUud2FybihgRHVwbGljYXRlIGNvbnN0cnVjdG9yICR7dGhpcy5uYW1lfWApXG4gICAgfVxuICAgIENMQVNTX1JFR0lTVFJZW3RoaXMubmFtZV0gPSB0aGlzXG4gIH1cblxuICBzdGF0aWMgZ2V0Q2xhc3MobmFtZSkge1xuICAgIGlmIChuYW1lIGluIENMQVNTX1JFR0lTVFJZKSByZXR1cm4gQ0xBU1NfUkVHSVNUUllbbmFtZV1cblxuICAgIGNvbnN0IGZpbGVUb0xvYWQgPSB0aGlzLmNvbW1hbmRUYWJsZVtuYW1lXS5maWxlXG4gICAgaWYgKGF0b20uaW5EZXZNb2RlKCkgJiYgc2V0dGluZ3MuZ2V0KFwiZGVidWdcIikpIHtcbiAgICAgIGNvbnNvbGUubG9nKGBsYXp5LXJlcXVpcmU6ICR7ZmlsZVRvTG9hZH0gZm9yICR7bmFtZX1gKVxuICAgIH1cbiAgICBsb2FkVm1wT3BlcmF0aW9uRmlsZShmaWxlVG9Mb2FkKVxuICAgIGlmIChuYW1lIGluIENMQVNTX1JFR0lTVFJZKSByZXR1cm4gQ0xBU1NfUkVHSVNUUllbbmFtZV1cblxuICAgIHRocm93IG5ldyBFcnJvcihgY2xhc3MgJyR7bmFtZX0nIG5vdCBmb3VuZGApXG4gIH1cblxuICBzdGF0aWMgZ2V0SW5zdGFuY2UodmltU3RhdGUsIGtsYXNzLCBwcm9wZXJ0aWVzKSB7XG4gICAga2xhc3MgPSB0eXBlb2Yga2xhc3MgPT09IFwiZnVuY3Rpb25cIiA/IGtsYXNzIDogQmFzZS5nZXRDbGFzcyhrbGFzcylcbiAgICBjb25zdCBvYmplY3QgPSBuZXcga2xhc3ModmltU3RhdGUpXG4gICAgaWYgKHByb3BlcnRpZXMpIE9iamVjdC5hc3NpZ24ob2JqZWN0LCBwcm9wZXJ0aWVzKVxuICAgIG9iamVjdC5pbml0aWFsaXplKClcbiAgICByZXR1cm4gb2JqZWN0XG4gIH1cblxuICBzdGF0aWMgZ2V0Q2xhc3NSZWdpc3RyeSgpIHtcbiAgICByZXR1cm4gQ0xBU1NfUkVHSVNUUllcbiAgfVxuXG4gIHN0YXRpYyBnZXRDb21tYW5kTmFtZSgpIHtcbiAgICByZXR1cm4gdGhpcy5jb21tYW5kUHJlZml4ICsgXCI6XCIgKyBfcGx1cygpLmRhc2hlcml6ZSh0aGlzLm5hbWUpXG4gIH1cblxuICBzdGF0aWMgZ2V0Q29tbWFuZE5hbWVXaXRob3V0UHJlZml4KCkge1xuICAgIHJldHVybiBfcGx1cygpLmRhc2hlcml6ZSh0aGlzLm5hbWUpXG4gIH1cblxuICBzdGF0aWMgcmVnaXN0ZXJDb21tYW5kKCkge1xuICAgIHJldHVybiB0aGlzLnJlZ2lzdGVyQ29tbWFuZEZyb21TcGVjKHRoaXMubmFtZSwge1xuICAgICAgY29tbWFuZFNjb3BlOiB0aGlzLmNvbW1hbmRTY29wZSxcbiAgICAgIGNvbW1hbmROYW1lOiB0aGlzLmdldENvbW1hbmROYW1lKCksXG4gICAgICBnZXRDbGFzczogKCkgPT4gdGhpcyxcbiAgICB9KVxuICB9XG5cbiAgc3RhdGljIHJlZ2lzdGVyQ29tbWFuZEZyb21TcGVjKG5hbWUsIHNwZWMpIHtcbiAgICBsZXQge2NvbW1hbmRTY29wZSA9IFwiYXRvbS10ZXh0LWVkaXRvclwiLCBjb21tYW5kUHJlZml4ID0gXCJ2aW0tbW9kZS1wbHVzXCIsIGNvbW1hbmROYW1lLCBnZXRDbGFzc30gPSBzcGVjXG4gICAgaWYgKCFjb21tYW5kTmFtZSkgY29tbWFuZE5hbWUgPSBjb21tYW5kUHJlZml4ICsgXCI6XCIgKyBfcGx1cygpLmRhc2hlcml6ZShuYW1lKVxuICAgIGlmICghZ2V0Q2xhc3MpIGdldENsYXNzID0gbmFtZSA9PiB0aGlzLmdldENsYXNzKG5hbWUpXG5cbiAgICBjb25zdCBnZXRFZGl0b3JTdGF0ZSA9IHRoaXMuZ2V0RWRpdG9yU3RhdGVcbiAgICByZXR1cm4gYXRvbS5jb21tYW5kcy5hZGQoY29tbWFuZFNjb3BlLCBjb21tYW5kTmFtZSwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgIGNvbnN0IHZpbVN0YXRlID0gZ2V0RWRpdG9yU3RhdGUodGhpcy5nZXRNb2RlbCgpKSB8fCBnZXRFZGl0b3JTdGF0ZShhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCkpXG4gICAgICBpZiAodmltU3RhdGUpIHZpbVN0YXRlLm9wZXJhdGlvblN0YWNrLnJ1bihnZXRDbGFzcyhuYW1lKSkgLy8gdmltU3RhdGUgcG9zc2libHkgYmUgdW5kZWZpbmVkIFNlZSAjODVcbiAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXG4gICAgfSlcbiAgfVxuXG4gIHN0YXRpYyBnZXRLaW5kRm9yQ29tbWFuZE5hbWUoY29tbWFuZCkge1xuICAgIGNvbnN0IGNvbW1hbmRXaXRob3V0UHJlZml4ID0gY29tbWFuZC5yZXBsYWNlKC9edmltLW1vZGUtcGx1czovLCBcIlwiKVxuICAgIGNvbnN0IHtjYXBpdGFsaXplLCBjYW1lbGl6ZX0gPSBfcGx1cygpXG4gICAgY29uc3QgY29tbWFuZENsYXNzTmFtZSA9IGNhcGl0YWxpemUoY2FtZWxpemUoY29tbWFuZFdpdGhvdXRQcmVmaXgpKVxuICAgIGlmIChjb21tYW5kQ2xhc3NOYW1lIGluIENMQVNTX1JFR0lTVFJZKSB7XG4gICAgICByZXR1cm4gQ0xBU1NfUkVHSVNUUllbY29tbWFuZENsYXNzTmFtZV0ub3BlcmF0aW9uS2luZFxuICAgIH1cbiAgfVxuXG4gIGdldFNtb290aFNjcm9sbER1YXRpb24oa2luZCkge1xuICAgIGNvbnN0IGJhc2UgPSBcInNtb290aFNjcm9sbE9uXCIgKyBraW5kXG4gICAgcmV0dXJuIHRoaXMuZ2V0Q29uZmlnKGJhc2UpID8gdGhpcy5nZXRDb25maWcoYmFzZSArIFwiRHVyYXRpb25cIikgOiAwXG4gIH1cblxuICAvLyBQcm94eSBwcm9wcGVydGllcyBhbmQgbWV0aG9kc1xuICAvLz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICBnZXQgbW9kZSgpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUubW9kZSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBnZXQgc3VibW9kZSgpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUuc3VibW9kZSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBnZXQgc3dyYXAoKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLnN3cmFwIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIGdldCB1dGlscygpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUudXRpbHMgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgZ2V0IGVkaXRvcigpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUuZWRpdG9yIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIGdldCBlZGl0b3JFbGVtZW50KCkgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5lZGl0b3JFbGVtZW50IH0gLy8gcHJldHRpZXItaWdub3JlXG4gIGdldCBnbG9iYWxTdGF0ZSgpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUuZ2xvYmFsU3RhdGUgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgZ2V0IG11dGF0aW9uTWFuYWdlcigpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUubXV0YXRpb25NYW5hZ2VyIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIGdldCBvY2N1cnJlbmNlTWFuYWdlcigpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUub2NjdXJyZW5jZU1hbmFnZXIgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgZ2V0IHBlcnNpc3RlbnRTZWxlY3Rpb24oKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLnBlcnNpc3RlbnRTZWxlY3Rpb24gfSAvLyBwcmV0dGllci1pZ25vcmVcblxuICBvbkRpZENoYW5nZVNlYXJjaCguLi5hcmdzKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLm9uRGlkQ2hhbmdlU2VhcmNoKC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIG9uRGlkQ29uZmlybVNlYXJjaCguLi5hcmdzKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLm9uRGlkQ29uZmlybVNlYXJjaCguLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBvbkRpZENhbmNlbFNlYXJjaCguLi5hcmdzKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLm9uRGlkQ2FuY2VsU2VhcmNoKC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIG9uRGlkQ29tbWFuZFNlYXJjaCguLi5hcmdzKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLm9uRGlkQ29tbWFuZFNlYXJjaCguLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBvbkRpZFNldFRhcmdldCguLi5hcmdzKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLm9uRGlkU2V0VGFyZ2V0KC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIGVtaXREaWRTZXRUYXJnZXQoLi4uYXJncykgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5lbWl0RGlkU2V0VGFyZ2V0KC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIG9uV2lsbFNlbGVjdFRhcmdldCguLi5hcmdzKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLm9uV2lsbFNlbGVjdFRhcmdldCguLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBlbWl0V2lsbFNlbGVjdFRhcmdldCguLi5hcmdzKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLmVtaXRXaWxsU2VsZWN0VGFyZ2V0KC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIG9uRGlkU2VsZWN0VGFyZ2V0KC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUub25EaWRTZWxlY3RUYXJnZXQoLi4uYXJncykgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgZW1pdERpZFNlbGVjdFRhcmdldCguLi5hcmdzKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLmVtaXREaWRTZWxlY3RUYXJnZXQoLi4uYXJncykgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgb25EaWRGYWlsU2VsZWN0VGFyZ2V0KC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUub25EaWRGYWlsU2VsZWN0VGFyZ2V0KC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIGVtaXREaWRGYWlsU2VsZWN0VGFyZ2V0KC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUuZW1pdERpZEZhaWxTZWxlY3RUYXJnZXQoLi4uYXJncykgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgb25XaWxsRmluaXNoTXV0YXRpb24oLi4uYXJncykgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5vbldpbGxGaW5pc2hNdXRhdGlvbiguLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBlbWl0V2lsbEZpbmlzaE11dGF0aW9uKC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUuZW1pdFdpbGxGaW5pc2hNdXRhdGlvbiguLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBvbkRpZEZpbmlzaE11dGF0aW9uKC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUub25EaWRGaW5pc2hNdXRhdGlvbiguLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBlbWl0RGlkRmluaXNoTXV0YXRpb24oLi4uYXJncykgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5lbWl0RGlkRmluaXNoTXV0YXRpb24oLi4uYXJncykgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgb25EaWRGaW5pc2hPcGVyYXRpb24oLi4uYXJncykgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5vbkRpZEZpbmlzaE9wZXJhdGlvbiguLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBvbkRpZFJlc2V0T3BlcmF0aW9uU3RhY2soLi4uYXJncykgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5vbkRpZFJlc2V0T3BlcmF0aW9uU3RhY2soLi4uYXJncykgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgb25XaWxsQWN0aXZhdGVNb2RlKC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUub25XaWxsQWN0aXZhdGVNb2RlKC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIG9uRGlkQWN0aXZhdGVNb2RlKC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUub25EaWRBY3RpdmF0ZU1vZGUoLi4uYXJncykgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgcHJlZW1wdFdpbGxEZWFjdGl2YXRlTW9kZSguLi5hcmdzKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLnByZWVtcHRXaWxsRGVhY3RpdmF0ZU1vZGUoLi4uYXJncykgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgb25XaWxsRGVhY3RpdmF0ZU1vZGUoLi4uYXJncykgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5vbldpbGxEZWFjdGl2YXRlTW9kZSguLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBvbkRpZERlYWN0aXZhdGVNb2RlKC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUub25EaWREZWFjdGl2YXRlTW9kZSguLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBvbkRpZENhbmNlbFNlbGVjdExpc3QoLi4uYXJncykgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5vbkRpZENhbmNlbFNlbGVjdExpc3QoLi4uYXJncykgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgc3Vic2NyaWJlKC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUuc3Vic2NyaWJlKC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIGlzTW9kZSguLi5hcmdzKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLmlzTW9kZSguLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBnZXRCbG9ja3dpc2VTZWxlY3Rpb25zKC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUuZ2V0QmxvY2t3aXNlU2VsZWN0aW9ucyguLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBnZXRMYXN0QmxvY2t3aXNlU2VsZWN0aW9uKC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUuZ2V0TGFzdEJsb2Nrd2lzZVNlbGVjdGlvbiguLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBhZGRUb0NsYXNzTGlzdCguLi5hcmdzKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLmFkZFRvQ2xhc3NMaXN0KC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIGdldENvbmZpZyguLi5hcmdzKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLmdldENvbmZpZyguLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuXG4gIC8vIFdyYXBwZXIgZm9yIHRoaXMudXRpbHNcbiAgLy89PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgZ2V0VmltRW9mQnVmZmVyUG9zaXRpb24oKSB7IHJldHVybiB0aGlzLnV0aWxzLmdldFZpbUVvZkJ1ZmZlclBvc2l0aW9uKHRoaXMuZWRpdG9yKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBnZXRWaW1MYXN0QnVmZmVyUm93KCkgeyByZXR1cm4gdGhpcy51dGlscy5nZXRWaW1MYXN0QnVmZmVyUm93KHRoaXMuZWRpdG9yKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBnZXRWaW1MYXN0U2NyZWVuUm93KCkgeyByZXR1cm4gdGhpcy51dGlscy5nZXRWaW1MYXN0U2NyZWVuUm93KHRoaXMuZWRpdG9yKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBnZXRWYWxpZFZpbUJ1ZmZlclJvdyhyb3cpIHsgcmV0dXJuIHRoaXMudXRpbHMuZ2V0VmFsaWRWaW1CdWZmZXJSb3codGhpcy5lZGl0b3IsIHJvdykgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgZ2V0VmFsaWRWaW1TY3JlZW5Sb3cocm93KSB7IHJldHVybiB0aGlzLnV0aWxzLmdldFZhbGlkVmltU2NyZWVuUm93KHRoaXMuZWRpdG9yLCByb3cpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIGdldFdvcmRCdWZmZXJSYW5nZUFuZEtpbmRBdEJ1ZmZlclBvc2l0aW9uKC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudXRpbHMuZ2V0V29yZEJ1ZmZlclJhbmdlQW5kS2luZEF0QnVmZmVyUG9zaXRpb24odGhpcy5lZGl0b3IsIC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIGdldEZpcnN0Q2hhcmFjdGVyUG9zaXRpb25Gb3JCdWZmZXJSb3cocm93KSB7IHJldHVybiB0aGlzLnV0aWxzLmdldEZpcnN0Q2hhcmFjdGVyUG9zaXRpb25Gb3JCdWZmZXJSb3codGhpcy5lZGl0b3IsIHJvdykgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgZ2V0QnVmZmVyUmFuZ2VGb3JSb3dSYW5nZShyb3dSYW5nZSkgeyByZXR1cm4gdGhpcy51dGlscy5nZXRCdWZmZXJSYW5nZUZvclJvd1JhbmdlKHRoaXMuZWRpdG9yLCByb3dSYW5nZSkgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgc2NhbkZvcndhcmQoLi4uYXJncykgeyByZXR1cm4gdGhpcy51dGlscy5zY2FuRWRpdG9yKHRoaXMuZWRpdG9yLCBcImZvcndhcmRcIiwgLi4uYXJncykgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgc2NhbkJhY2t3YXJkKC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudXRpbHMuc2NhbkVkaXRvcih0aGlzLmVkaXRvciwgXCJiYWNrd2FyZFwiLCAuLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBnZXRGb2xkU3RhcnRSb3dGb3JSb3coLi4uYXJncykgeyByZXR1cm4gdGhpcy51dGlscy5nZXRGb2xkU3RhcnRSb3dGb3JSb3codGhpcy5lZGl0b3IsIC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIGdldEZvbGRFbmRSb3dGb3JSb3coLi4uYXJncykgeyByZXR1cm4gdGhpcy51dGlscy5nZXRGb2xkRW5kUm93Rm9yUm93KHRoaXMuZWRpdG9yLCAuLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBnZXRCdWZmZXJSb3dzKC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudXRpbHMuZ2V0Um93cyh0aGlzLmVkaXRvciwgXCJidWZmZXJcIiwgLi4uYXJncykgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgZ2V0U2NyZWVuUm93cyguLi5hcmdzKSB7IHJldHVybiB0aGlzLnV0aWxzLmdldFJvd3ModGhpcy5lZGl0b3IsIFwic2NyZWVuXCIsIC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG59XG5CYXNlLnJlZ2lzdGVyKGZhbHNlKVxuXG5tb2R1bGUuZXhwb3J0cyA9IEJhc2VcbiJdfQ==