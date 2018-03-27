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
      return this.operator && !this.operator.is("VisualModeSelect");
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL2Jhc2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsV0FBVyxDQUFBOzs7Ozs7OztBQUVYLElBQU0sUUFBUSxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQTs7QUFFdEMsSUFBSSxJQUFJLFlBQUE7SUFBRSxJQUFJLFlBQUE7SUFBRSxVQUFVLFlBQUE7SUFBRSxNQUFNLFlBQUEsQ0FBQTtBQUNsQyxJQUFNLGNBQWMsR0FBRyxFQUFFLENBQUE7O0FBRXpCLFNBQVMsS0FBSyxHQUFHO0FBQ2YsU0FBTyxNQUFNLEtBQUssTUFBTSxHQUFHLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFBLEFBQUMsQ0FBQTtDQUN2RDs7QUFFRCxJQUFJLGdCQUFnQixZQUFBLENBQUE7QUFDcEIsU0FBUyxvQkFBb0IsQ0FBQyxRQUFRLEVBQUU7Ozs7O0FBS3RDLE1BQU0sU0FBUyxHQUFHLGdCQUFnQixDQUFBO0FBQ2xDLGtCQUFnQixHQUFHLFFBQVEsQ0FBQTtBQUMzQixTQUFPLENBQUMsUUFBUSxDQUFDLENBQUE7QUFDakIsa0JBQWdCLEdBQUcsU0FBUyxDQUFBO0NBQzdCOztJQUVLLElBQUk7ZUFBSixJQUFJOztTQVlBLGVBQUc7QUFDVCxhQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFBO0tBQzdCOzs7V0FicUIsSUFBSTs7OztXQUNILGVBQWU7Ozs7V0FDaEIsa0JBQWtCOzs7O1dBQ2pCLElBQUk7Ozs7V0FDSCxJQUFJOzs7Ozs7QUFXakIsV0FoQlAsSUFBSSxDQWdCSSxRQUFRLEVBQUU7MEJBaEJsQixJQUFJOztTQU9SLFVBQVUsR0FBRyxLQUFLO1NBQ2xCLFFBQVEsR0FBRyxLQUFLO1NBQ2hCLEtBQUssR0FBRyxJQUFJO1NBQ1osWUFBWSxHQUFHLENBQUM7O0FBT2QsUUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUE7R0FDekI7O2VBbEJH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UUFBSyxRQUFRLENBQUMsSUFBSSxDQUFDO09BQUEsQ0FBQTs7QUFFckQsVUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQTtBQUMxQyxhQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLFlBQVksRUFBRSxXQUFXLEVBQUUsVUFBUyxLQUFLLEVBQUU7QUFDbEUsWUFBTSxRQUFRLEdBQUcsY0FBYyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxJQUFJLGNBQWMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLG1CQUFtQixFQUFFLENBQUMsQ0FBQTtBQUN4RyxZQUFJLFFBQVEsRUFBRSxRQUFRLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQTtBQUN6RCxhQUFLLENBQUMsZUFBZSxFQUFFLENBQUE7T0FDeEIsQ0FBQyxDQUFBO0tBQ0g7OztXQUUyQiwrQkFBQyxPQUFPLEVBQUU7QUFDcEMsVUFBTSxvQkFBb0IsR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLGlCQUFpQixFQUFFLEVBQUUsQ0FBQyxDQUFBOzttQkFDcEMsS0FBSyxFQUFFOztVQUEvQixVQUFVLFVBQVYsVUFBVTtVQUFFLFFBQVEsVUFBUixRQUFROztBQUMzQixVQUFNLGdCQUFnQixHQUFHLFVBQVUsQ0FBQyxRQUFRLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxDQUFBO0FBQ25FLFVBQUksZ0JBQWdCLElBQUksY0FBYyxFQUFFO0FBQ3RDLGVBQU8sY0FBYyxDQUFDLGdCQUFnQixDQUFDLENBQUMsYUFBYSxDQUFBO09BQ3REO0tBQ0Y7OztTQWpVRyxJQUFJOzs7QUErWFYsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQTs7QUFFcEIsTUFBTSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUEiLCJmaWxlIjoiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvYmFzZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIlwidXNlIGJhYmVsXCJcblxuY29uc3Qgc2V0dGluZ3MgPSByZXF1aXJlKFwiLi9zZXR0aW5nc1wiKVxuXG5sZXQgQ1NPTiwgcGF0aCwgc2VsZWN0TGlzdCwgX19wbHVzXG5jb25zdCBDTEFTU19SRUdJU1RSWSA9IHt9XG5cbmZ1bmN0aW9uIF9wbHVzKCkge1xuICByZXR1cm4gX19wbHVzIHx8IChfX3BsdXMgPSByZXF1aXJlKFwidW5kZXJzY29yZS1wbHVzXCIpKVxufVxuXG5sZXQgVk1QX0xPQURJTkdfRklMRVxuZnVuY3Rpb24gbG9hZFZtcE9wZXJhdGlvbkZpbGUoZmlsZW5hbWUpIHtcbiAgLy8gQ2FsbCB0byBsb2FkVm1wT3BlcmF0aW9uRmlsZSBjYW4gYmUgbmVzdGVkLlxuICAvLyAxLiByZXF1aXJlKFwiLi9vcGVyYXRvci10cmFuc2Zvcm0tc3RyaW5nXCIpXG4gIC8vIDIuIGluIG9wZXJhdG9yLXRyYW5zZm9ybS1zdHJpbmcuY29mZmVlIGNhbGwgQmFzZS5nZXRDbGFzcyhcIk9wZXJhdG9yXCIpIGNhdXNlIG9wZXJhdG9yLmNvZmZlZSByZXF1aXJlZC5cbiAgLy8gU28gd2UgaGF2ZSB0byBzYXZlIG9yaWdpbmFsIFZNUF9MT0FESU5HX0ZJTEUgYW5kIHJlc3RvcmUgaXQgYWZ0ZXIgcmVxdWlyZSBmaW5pc2hlZC5cbiAgY29uc3QgcHJlc2VydmVkID0gVk1QX0xPQURJTkdfRklMRVxuICBWTVBfTE9BRElOR19GSUxFID0gZmlsZW5hbWVcbiAgcmVxdWlyZShmaWxlbmFtZSlcbiAgVk1QX0xPQURJTkdfRklMRSA9IHByZXNlcnZlZFxufVxuXG5jbGFzcyBCYXNlIHtcbiAgc3RhdGljIGNvbW1hbmRUYWJsZSA9IG51bGxcbiAgc3RhdGljIGNvbW1hbmRQcmVmaXggPSBcInZpbS1tb2RlLXBsdXNcIlxuICBzdGF0aWMgY29tbWFuZFNjb3BlID0gXCJhdG9tLXRleHQtZWRpdG9yXCJcbiAgc3RhdGljIG9wZXJhdGlvbktpbmQgPSBudWxsXG4gIHN0YXRpYyBnZXRFZGl0b3JTdGF0ZSA9IG51bGwgLy8gc2V0IHRocm91Z2ggaW5pdCgpXG5cbiAgcmVjb3JkYWJsZSA9IGZhbHNlXG4gIHJlcGVhdGVkID0gZmFsc2VcbiAgY291bnQgPSBudWxsXG4gIGRlZmF1bHRDb3VudCA9IDFcblxuICBnZXQgbmFtZSgpIHtcbiAgICByZXR1cm4gdGhpcy5jb25zdHJ1Y3Rvci5uYW1lXG4gIH1cblxuICBjb25zdHJ1Y3Rvcih2aW1TdGF0ZSkge1xuICAgIHRoaXMudmltU3RhdGUgPSB2aW1TdGF0ZVxuICB9XG5cbiAgaW5pdGlhbGl6ZSgpIHt9XG5cbiAgLy8gQ2FsbGVkIGJvdGggb24gY2FuY2VsIGFuZCBzdWNjZXNzXG4gIHJlc2V0U3RhdGUoKSB7fVxuXG4gIC8vIE9wZXJhdGlvblN0YWNrIHBvc3Rwb25lIGV4ZWN1dGlvbiB1bnRpbGwgaXNSZWFkeSgpIGdldCB0cnVlXG4gIC8vIE92ZXJyaWRlIGlmIG5lY2Vzc2FyeS5cbiAgaXNSZWFkeSgpIHtcbiAgICByZXR1cm4gdHJ1ZVxuICB9XG5cbiAgLy8gVmlzdWFsTW9kZVNlbGVjdCBpcyBhbm9ybWFsLCBzaW5jZSBpdCBhdXRvIGNvbXBsZW1lbnRlZCBpbiB2aXNpYWwgbW9kZS5cbiAgLy8gSW4gb3RoZXIgd29yZCwgbm9ybWFsLW9wZXJhdG9yIGlzIGV4cGxpY2l0IHdoZXJlYXMgYW5vcm1hbC1vcGVyYXRvciBpcyBpbnBsaWNpdC5cbiAgaXNUYXJnZXRPZk5vcm1hbE9wZXJhdG9yKCkge1xuICAgIHJldHVybiB0aGlzLm9wZXJhdG9yICYmICF0aGlzLm9wZXJhdG9yLmlzKFwiVmlzdWFsTW9kZVNlbGVjdFwiKVxuICB9XG5cbiAgZ2V0Q291bnQob2Zmc2V0ID0gMCkge1xuICAgIGlmICh0aGlzLmNvdW50ID09IG51bGwpIHtcbiAgICAgIHRoaXMuY291bnQgPSB0aGlzLnZpbVN0YXRlLmhhc0NvdW50KCkgPyB0aGlzLnZpbVN0YXRlLmdldENvdW50KCkgOiB0aGlzLmRlZmF1bHRDb3VudFxuICAgIH1cbiAgICByZXR1cm4gdGhpcy5jb3VudCArIG9mZnNldFxuICB9XG5cbiAgcmVzZXRDb3VudCgpIHtcbiAgICB0aGlzLmNvdW50ID0gbnVsbFxuICB9XG5cbiAgY291bnRUaW1lcyhsYXN0LCBmbikge1xuICAgIGlmIChsYXN0IDwgMSkgcmV0dXJuXG5cbiAgICBsZXQgc3RvcHBlZCA9IGZhbHNlXG4gICAgY29uc3Qgc3RvcCA9ICgpID0+IChzdG9wcGVkID0gdHJ1ZSlcbiAgICBmb3IgKGxldCBjb3VudCA9IDE7IGNvdW50IDw9IGxhc3Q7IGNvdW50KyspIHtcbiAgICAgIGZuKHtjb3VudCwgaXNGaW5hbDogY291bnQgPT09IGxhc3QsIHN0b3B9KVxuICAgICAgaWYgKHN0b3BwZWQpIGJyZWFrXG4gICAgfVxuICB9XG5cbiAgYWN0aXZhdGVNb2RlKG1vZGUsIHN1Ym1vZGUpIHtcbiAgICB0aGlzLm9uRGlkRmluaXNoT3BlcmF0aW9uKCgpID0+IHRoaXMudmltU3RhdGUuYWN0aXZhdGUobW9kZSwgc3VibW9kZSkpXG4gIH1cblxuICBhY3RpdmF0ZU1vZGVJZk5lY2Vzc2FyeShtb2RlLCBzdWJtb2RlKSB7XG4gICAgaWYgKCF0aGlzLnZpbVN0YXRlLmlzTW9kZShtb2RlLCBzdWJtb2RlKSkge1xuICAgICAgdGhpcy5hY3RpdmF0ZU1vZGUobW9kZSwgc3VibW9kZSlcbiAgICB9XG4gIH1cblxuICBnZXRJbnN0YW5jZShuYW1lLCBwcm9wZXJ0aWVzKSB7XG4gICAgcmV0dXJuIHRoaXMuY29uc3RydWN0b3IuZ2V0SW5zdGFuY2UodGhpcy52aW1TdGF0ZSwgbmFtZSwgcHJvcGVydGllcylcbiAgfVxuXG4gIGNhbmNlbE9wZXJhdGlvbigpIHtcbiAgICB0aGlzLnZpbVN0YXRlLm9wZXJhdGlvblN0YWNrLmNhbmNlbCh0aGlzKVxuICB9XG5cbiAgcHJvY2Vzc09wZXJhdGlvbigpIHtcbiAgICB0aGlzLnZpbVN0YXRlLm9wZXJhdGlvblN0YWNrLnByb2Nlc3MoKVxuICB9XG5cbiAgZm9jdXNTZWxlY3RMaXN0KG9wdGlvbnMgPSB7fSkge1xuICAgIHRoaXMub25EaWRDYW5jZWxTZWxlY3RMaXN0KCgpID0+IHRoaXMuY2FuY2VsT3BlcmF0aW9uKCkpXG4gICAgaWYgKCFzZWxlY3RMaXN0KSB7XG4gICAgICBzZWxlY3RMaXN0ID0gbmV3IChyZXF1aXJlKFwiLi9zZWxlY3QtbGlzdFwiKSkoKVxuICAgIH1cbiAgICBzZWxlY3RMaXN0LnNob3codGhpcy52aW1TdGF0ZSwgb3B0aW9ucylcbiAgfVxuXG4gIGZvY3VzSW5wdXQob3B0aW9ucyA9IHt9KSB7XG4gICAgaWYgKCFvcHRpb25zLm9uQ29uZmlybSkge1xuICAgICAgb3B0aW9ucy5vbkNvbmZpcm0gPSBpbnB1dCA9PiB7XG4gICAgICAgIHRoaXMuaW5wdXQgPSBpbnB1dFxuICAgICAgICB0aGlzLnByb2Nlc3NPcGVyYXRpb24oKVxuICAgICAgfVxuICAgIH1cbiAgICBpZiAoIW9wdGlvbnMub25DYW5jZWwpIG9wdGlvbnMub25DYW5jZWwgPSAoKSA9PiB0aGlzLmNhbmNlbE9wZXJhdGlvbigpXG4gICAgaWYgKCFvcHRpb25zLm9uQ2hhbmdlKSBvcHRpb25zLm9uQ2hhbmdlID0gaW5wdXQgPT4gdGhpcy52aW1TdGF0ZS5ob3Zlci5zZXQoaW5wdXQpXG5cbiAgICB0aGlzLnZpbVN0YXRlLmZvY3VzSW5wdXQob3B0aW9ucylcbiAgfVxuXG4gIGZvY3VzSW5wdXRQcm9taXNpZmllZChvcHRpb25zID0ge30pIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKG9uQ29uZmlybSwgb25DYW5jZWwpID0+IHtcbiAgICAgIGNvbnN0IGRlZmF1bHRPcHRpb25zID0ge1xuICAgICAgICBoaWRlQ3Vyc29yOiB0cnVlLFxuICAgICAgICBvbkNoYW5nZTogaW5wdXQgPT4gdGhpcy52aW1TdGF0ZS5ob3Zlci5zZXQoaW5wdXQpLFxuICAgICAgfVxuICAgICAgdGhpcy52aW1TdGF0ZS5mb2N1c0lucHV0KE9iamVjdC5hc3NpZ24oZGVmYXVsdE9wdGlvbnMsIG9wdGlvbnMsIHtvbkNvbmZpcm0sIG9uQ2FuY2VsfSkpXG4gICAgfSlcbiAgfVxuXG4gIHJlYWRDaGFyKCkge1xuICAgIHRoaXMudmltU3RhdGUucmVhZENoYXIoe1xuICAgICAgb25Db25maXJtOiBpbnB1dCA9PiB7XG4gICAgICAgIHRoaXMuaW5wdXQgPSBpbnB1dFxuICAgICAgICB0aGlzLnByb2Nlc3NPcGVyYXRpb24oKVxuICAgICAgfSxcbiAgICAgIG9uQ2FuY2VsOiAoKSA9PiB0aGlzLmNhbmNlbE9wZXJhdGlvbigpLFxuICAgIH0pXG4gIH1cblxuICAvLyBSZXR1cm4gcHJvbWlzZSB3aGljaCByZXNvbHZlIHdpdGggcmVhZCBjaGFyIG9yIGB1bmRlZmluZWRgIHdoZW4gY2FuY2VsbGVkLlxuICByZWFkQ2hhclByb21pc2VkKCkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICAgIHRoaXMudmltU3RhdGUucmVhZENoYXIoe29uQ29uZmlybTogcmVzb2x2ZSwgb25DYW5jZWw6IHJlc29sdmV9KVxuICAgIH0pXG4gIH1cblxuICBpbnN0YW5jZW9mKGtsYXNzTmFtZSkge1xuICAgIHJldHVybiB0aGlzIGluc3RhbmNlb2YgQmFzZS5nZXRDbGFzcyhrbGFzc05hbWUpXG4gIH1cblxuICBpcyhrbGFzc05hbWUpIHtcbiAgICByZXR1cm4gdGhpcy5jb25zdHJ1Y3RvciA9PT0gQmFzZS5nZXRDbGFzcyhrbGFzc05hbWUpXG4gIH1cblxuICBpc09wZXJhdG9yKCkge1xuICAgIC8vIERvbid0IHVzZSBgaW5zdGFuY2VvZmAgdG8gcG9zdHBvbmUgcmVxdWlyZSBmb3IgZmFzdGVyIGFjdGl2YXRpb24uXG4gICAgcmV0dXJuIHRoaXMuY29uc3RydWN0b3Iub3BlcmF0aW9uS2luZCA9PT0gXCJvcGVyYXRvclwiXG4gIH1cblxuICBpc01vdGlvbigpIHtcbiAgICAvLyBEb24ndCB1c2UgYGluc3RhbmNlb2ZgIHRvIHBvc3Rwb25lIHJlcXVpcmUgZm9yIGZhc3RlciBhY3RpdmF0aW9uLlxuICAgIHJldHVybiB0aGlzLmNvbnN0cnVjdG9yLm9wZXJhdGlvbktpbmQgPT09IFwibW90aW9uXCJcbiAgfVxuXG4gIGlzVGV4dE9iamVjdCgpIHtcbiAgICAvLyBEb24ndCB1c2UgYGluc3RhbmNlb2ZgIHRvIHBvc3Rwb25lIHJlcXVpcmUgZm9yIGZhc3RlciBhY3RpdmF0aW9uLlxuICAgIHJldHVybiB0aGlzLmNvbnN0cnVjdG9yLm9wZXJhdGlvbktpbmQgPT09IFwidGV4dC1vYmplY3RcIlxuICB9XG5cbiAgZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0QnVmZmVyUG9zaXRpb25Gb3JDdXJzb3IodGhpcy5lZGl0b3IuZ2V0TGFzdEN1cnNvcigpKVxuICB9XG5cbiAgZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb25zKCkge1xuICAgIHJldHVybiB0aGlzLmVkaXRvci5nZXRDdXJzb3JzKCkubWFwKGN1cnNvciA9PiB0aGlzLmdldEJ1ZmZlclBvc2l0aW9uRm9yQ3Vyc29yKGN1cnNvcikpXG4gIH1cblxuICBnZXRDdXJzb3JCdWZmZXJQb3NpdGlvbnNPcmRlcmVkKCkge1xuICAgIHJldHVybiB0aGlzLnV0aWxzLnNvcnRQb2ludHModGhpcy5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbnMoKSlcbiAgfVxuXG4gIGdldEJ1ZmZlclBvc2l0aW9uRm9yQ3Vyc29yKGN1cnNvcikge1xuICAgIHJldHVybiB0aGlzLm1vZGUgPT09IFwidmlzdWFsXCIgPyB0aGlzLmdldEN1cnNvclBvc2l0aW9uRm9yU2VsZWN0aW9uKGN1cnNvci5zZWxlY3Rpb24pIDogY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKClcbiAgfVxuXG4gIGdldEN1cnNvclBvc2l0aW9uRm9yU2VsZWN0aW9uKHNlbGVjdGlvbikge1xuICAgIHJldHVybiB0aGlzLnN3cmFwKHNlbGVjdGlvbikuZ2V0QnVmZmVyUG9zaXRpb25Gb3IoXCJoZWFkXCIsIHtmcm9tOiBbXCJwcm9wZXJ0eVwiLCBcInNlbGVjdGlvblwiXX0pXG4gIH1cblxuICBnZXRPcGVyYXRpb25UeXBlQ2hhcigpIHtcbiAgICByZXR1cm4ge29wZXJhdG9yOiBcIk9cIiwgXCJ0ZXh0LW9iamVjdFwiOiBcIlRcIiwgbW90aW9uOiBcIk1cIiwgXCJtaXNjLWNvbW1hbmRcIjogXCJYXCJ9W3RoaXMuY29uc3RydWN0b3Iub3BlcmF0aW9uS2luZF1cbiAgfVxuXG4gIHRvU3RyaW5nKCkge1xuICAgIGNvbnN0IGJhc2UgPSBgJHt0aGlzLm5hbWV9PCR7dGhpcy5nZXRPcGVyYXRpb25UeXBlQ2hhcigpfT5gXG4gICAgcmV0dXJuIHRoaXMudGFyZ2V0ID8gYCR7YmFzZX17dGFyZ2V0ID0gJHt0aGlzLnRhcmdldC50b1N0cmluZygpfX1gIDogYmFzZVxuICB9XG5cbiAgZ2V0Q29tbWFuZE5hbWUoKSB7XG4gICAgcmV0dXJuIHRoaXMuY29uc3RydWN0b3IuZ2V0Q29tbWFuZE5hbWUoKVxuICB9XG5cbiAgZ2V0Q29tbWFuZE5hbWVXaXRob3V0UHJlZml4KCkge1xuICAgIHJldHVybiB0aGlzLmNvbnN0cnVjdG9yLmdldENvbW1hbmROYW1lV2l0aG91dFByZWZpeCgpXG4gIH1cblxuICBzdGF0aWMgYXN5bmMgd3JpdGVDb21tYW5kVGFibGVPbkRpc2soKSB7XG4gICAgY29uc3QgY29tbWFuZFRhYmxlID0gdGhpcy5nZW5lcmF0ZUNvbW1hbmRUYWJsZUJ5RWFnZXJMb2FkKClcbiAgICBjb25zdCBfID0gX3BsdXMoKVxuICAgIGlmIChfLmlzRXF1YWwodGhpcy5jb21tYW5kVGFibGUsIGNvbW1hbmRUYWJsZSkpIHtcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRJbmZvKFwiTm8gY2hhbmdlcyBpbiBjb21tYW5kVGFibGVcIiwge2Rpc21pc3NhYmxlOiB0cnVlfSlcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGlmICghQ1NPTikgQ1NPTiA9IHJlcXVpcmUoXCJzZWFzb25cIilcbiAgICBpZiAoIXBhdGgpIHBhdGggPSByZXF1aXJlKFwicGF0aFwiKVxuXG4gICAgY29uc3QgbG9hZGFibGVDU09OVGV4dCA9XG4gICAgICBbXG4gICAgICAgIFwiIyBUaGlzIGZpbGUgaXMgYXV0byBnZW5lcmF0ZWQgYnkgYHZpbS1tb2RlLXBsdXM6d3JpdGUtY29tbWFuZC10YWJsZS1vbi1kaXNrYCBjb21tYW5kLlwiLFxuICAgICAgICBcIiMgRE9OVCBlZGl0IG1hbnVhbGx5LlwiLFxuICAgICAgICBcIm1vZHVsZS5leHBvcnRzID1cIixcbiAgICAgICAgQ1NPTi5zdHJpbmdpZnkoY29tbWFuZFRhYmxlKSxcbiAgICAgIF0uam9pbihcIlxcblwiKSArIFwiXFxuXCJcblxuICAgIGNvbnN0IGNvbW1hbmRUYWJsZVBhdGggPSBwYXRoLmpvaW4oX19kaXJuYW1lLCBcImNvbW1hbmQtdGFibGUuY29mZmVlXCIpXG4gICAgY29uc3QgZWRpdG9yID0gYXdhaXQgYXRvbS53b3Jrc3BhY2Uub3Blbihjb21tYW5kVGFibGVQYXRoLCB7YWN0aXZhdGVQYW5lOiBmYWxzZSwgYWN0aXZhdGVJdGVtOiBmYWxzZX0pXG4gICAgZWRpdG9yLnNldFRleHQobG9hZGFibGVDU09OVGV4dClcbiAgICBhd2FpdCBlZGl0b3Iuc2F2ZSgpXG4gICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEluZm8oXCJVcGRhdGVkIGNvbW1hbmRUYWJsZVwiLCB7ZGlzbWlzc2FibGU6IHRydWV9KVxuICB9XG5cbiAgc3RhdGljIGdlbmVyYXRlQ29tbWFuZFRhYmxlQnlFYWdlckxvYWQoKSB7XG4gICAgLy8gTk9URTogY2hhbmdpbmcgb3JkZXIgYWZmZWN0cyBvdXRwdXQgb2YgbGliL2NvbW1hbmQtdGFibGUuY29mZmVlXG4gICAgY29uc3QgZmlsZXNUb0xvYWQgPSBbXG4gICAgICBcIi4vb3BlcmF0b3JcIixcbiAgICAgIFwiLi9vcGVyYXRvci1pbnNlcnRcIixcbiAgICAgIFwiLi9vcGVyYXRvci10cmFuc2Zvcm0tc3RyaW5nXCIsXG4gICAgICBcIi4vbW90aW9uXCIsXG4gICAgICBcIi4vbW90aW9uLXNlYXJjaFwiLFxuICAgICAgXCIuL3RleHQtb2JqZWN0XCIsXG4gICAgICBcIi4vbWlzYy1jb21tYW5kXCIsXG4gICAgXVxuICAgIGZpbGVzVG9Mb2FkLmZvckVhY2gobG9hZFZtcE9wZXJhdGlvbkZpbGUpXG4gICAgY29uc3QgXyA9IF9wbHVzKClcbiAgICBjb25zdCBrbGFzc2VzR3JvdXBlZEJ5RmlsZSA9IF8uZ3JvdXBCeShfLnZhbHVlcyhDTEFTU19SRUdJU1RSWSksIGtsYXNzID0+IGtsYXNzLmZpbGUpXG5cbiAgICBjb25zdCBjb21tYW5kVGFibGUgPSB7fVxuICAgIGZvciAoY29uc3QgZmlsZSBvZiBmaWxlc1RvTG9hZCkge1xuICAgICAgZm9yIChjb25zdCBrbGFzcyBvZiBrbGFzc2VzR3JvdXBlZEJ5RmlsZVtmaWxlXSkge1xuICAgICAgICBjb21tYW5kVGFibGVba2xhc3MubmFtZV0gPSBrbGFzcy5jb21tYW5kXG4gICAgICAgICAgPyB7ZmlsZToga2xhc3MuZmlsZSwgY29tbWFuZE5hbWU6IGtsYXNzLmdldENvbW1hbmROYW1lKCksIGNvbW1hbmRTY29wZToga2xhc3MuY29tbWFuZFNjb3BlfVxuICAgICAgICAgIDoge2ZpbGU6IGtsYXNzLmZpbGV9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBjb21tYW5kVGFibGVcbiAgfVxuXG4gIC8vIFJldHVybiBkaXNwb3NhYmxlcyBmb3Igdm1wIGNvbW1hbmRzLlxuICBzdGF0aWMgaW5pdChnZXRFZGl0b3JTdGF0ZSkge1xuICAgIHRoaXMuZ2V0RWRpdG9yU3RhdGUgPSBnZXRFZGl0b3JTdGF0ZVxuICAgIHRoaXMuY29tbWFuZFRhYmxlID0gcmVxdWlyZShcIi4vY29tbWFuZC10YWJsZVwiKVxuXG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKHRoaXMuY29tbWFuZFRhYmxlKVxuICAgICAgLmZpbHRlcihuYW1lID0+IHRoaXMuY29tbWFuZFRhYmxlW25hbWVdLmNvbW1hbmROYW1lKVxuICAgICAgLm1hcChuYW1lID0+IHRoaXMucmVnaXN0ZXJDb21tYW5kRnJvbVNwZWMobmFtZSwgdGhpcy5jb21tYW5kVGFibGVbbmFtZV0pKVxuICB9XG5cbiAgc3RhdGljIHJlZ2lzdGVyKGNvbW1hbmQgPSB0cnVlKSB7XG4gICAgdGhpcy5jb21tYW5kID0gY29tbWFuZFxuICAgIHRoaXMuZmlsZSA9IFZNUF9MT0FESU5HX0ZJTEVcbiAgICBpZiAodGhpcy5uYW1lIGluIENMQVNTX1JFR0lTVFJZKSB7XG4gICAgICBjb25zb2xlLndhcm4oYER1cGxpY2F0ZSBjb25zdHJ1Y3RvciAke3RoaXMubmFtZX1gKVxuICAgIH1cbiAgICBDTEFTU19SRUdJU1RSWVt0aGlzLm5hbWVdID0gdGhpc1xuICB9XG5cbiAgc3RhdGljIGdldENsYXNzKG5hbWUpIHtcbiAgICBpZiAobmFtZSBpbiBDTEFTU19SRUdJU1RSWSkgcmV0dXJuIENMQVNTX1JFR0lTVFJZW25hbWVdXG5cbiAgICBjb25zdCBmaWxlVG9Mb2FkID0gdGhpcy5jb21tYW5kVGFibGVbbmFtZV0uZmlsZVxuICAgIGlmIChhdG9tLmluRGV2TW9kZSgpICYmIHNldHRpbmdzLmdldChcImRlYnVnXCIpKSB7XG4gICAgICBjb25zb2xlLmxvZyhgbGF6eS1yZXF1aXJlOiAke2ZpbGVUb0xvYWR9IGZvciAke25hbWV9YClcbiAgICB9XG4gICAgbG9hZFZtcE9wZXJhdGlvbkZpbGUoZmlsZVRvTG9hZClcbiAgICBpZiAobmFtZSBpbiBDTEFTU19SRUdJU1RSWSkgcmV0dXJuIENMQVNTX1JFR0lTVFJZW25hbWVdXG5cbiAgICB0aHJvdyBuZXcgRXJyb3IoYGNsYXNzICcke25hbWV9JyBub3QgZm91bmRgKVxuICB9XG5cbiAgc3RhdGljIGdldEluc3RhbmNlKHZpbVN0YXRlLCBrbGFzcywgcHJvcGVydGllcykge1xuICAgIGtsYXNzID0gdHlwZW9mIGtsYXNzID09PSBcImZ1bmN0aW9uXCIgPyBrbGFzcyA6IEJhc2UuZ2V0Q2xhc3Moa2xhc3MpXG4gICAgY29uc3Qgb2JqZWN0ID0gbmV3IGtsYXNzKHZpbVN0YXRlKVxuICAgIGlmIChwcm9wZXJ0aWVzKSBPYmplY3QuYXNzaWduKG9iamVjdCwgcHJvcGVydGllcylcbiAgICBvYmplY3QuaW5pdGlhbGl6ZSgpXG4gICAgcmV0dXJuIG9iamVjdFxuICB9XG5cbiAgc3RhdGljIGdldENsYXNzUmVnaXN0cnkoKSB7XG4gICAgcmV0dXJuIENMQVNTX1JFR0lTVFJZXG4gIH1cblxuICBzdGF0aWMgZ2V0Q29tbWFuZE5hbWUoKSB7XG4gICAgcmV0dXJuIHRoaXMuY29tbWFuZFByZWZpeCArIFwiOlwiICsgX3BsdXMoKS5kYXNoZXJpemUodGhpcy5uYW1lKVxuICB9XG5cbiAgc3RhdGljIGdldENvbW1hbmROYW1lV2l0aG91dFByZWZpeCgpIHtcbiAgICByZXR1cm4gX3BsdXMoKS5kYXNoZXJpemUodGhpcy5uYW1lKVxuICB9XG5cbiAgc3RhdGljIHJlZ2lzdGVyQ29tbWFuZCgpIHtcbiAgICByZXR1cm4gdGhpcy5yZWdpc3RlckNvbW1hbmRGcm9tU3BlYyh0aGlzLm5hbWUsIHtcbiAgICAgIGNvbW1hbmRTY29wZTogdGhpcy5jb21tYW5kU2NvcGUsXG4gICAgICBjb21tYW5kTmFtZTogdGhpcy5nZXRDb21tYW5kTmFtZSgpLFxuICAgICAgZ2V0Q2xhc3M6ICgpID0+IHRoaXMsXG4gICAgfSlcbiAgfVxuXG4gIHN0YXRpYyByZWdpc3RlckNvbW1hbmRGcm9tU3BlYyhuYW1lLCBzcGVjKSB7XG4gICAgbGV0IHtjb21tYW5kU2NvcGUgPSBcImF0b20tdGV4dC1lZGl0b3JcIiwgY29tbWFuZFByZWZpeCA9IFwidmltLW1vZGUtcGx1c1wiLCBjb21tYW5kTmFtZSwgZ2V0Q2xhc3N9ID0gc3BlY1xuICAgIGlmICghY29tbWFuZE5hbWUpIGNvbW1hbmROYW1lID0gY29tbWFuZFByZWZpeCArIFwiOlwiICsgX3BsdXMoKS5kYXNoZXJpemUobmFtZSlcbiAgICBpZiAoIWdldENsYXNzKSBnZXRDbGFzcyA9IG5hbWUgPT4gdGhpcy5nZXRDbGFzcyhuYW1lKVxuXG4gICAgY29uc3QgZ2V0RWRpdG9yU3RhdGUgPSB0aGlzLmdldEVkaXRvclN0YXRlXG4gICAgcmV0dXJuIGF0b20uY29tbWFuZHMuYWRkKGNvbW1hbmRTY29wZSwgY29tbWFuZE5hbWUsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICBjb25zdCB2aW1TdGF0ZSA9IGdldEVkaXRvclN0YXRlKHRoaXMuZ2V0TW9kZWwoKSkgfHwgZ2V0RWRpdG9yU3RhdGUoYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpKVxuICAgICAgaWYgKHZpbVN0YXRlKSB2aW1TdGF0ZS5vcGVyYXRpb25TdGFjay5ydW4oZ2V0Q2xhc3MobmFtZSkpIC8vIHZpbVN0YXRlIHBvc3NpYmx5IGJlIHVuZGVmaW5lZCBTZWUgIzg1XG4gICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICAgIH0pXG4gIH1cblxuICBzdGF0aWMgZ2V0S2luZEZvckNvbW1hbmROYW1lKGNvbW1hbmQpIHtcbiAgICBjb25zdCBjb21tYW5kV2l0aG91dFByZWZpeCA9IGNvbW1hbmQucmVwbGFjZSgvXnZpbS1tb2RlLXBsdXM6LywgXCJcIilcbiAgICBjb25zdCB7Y2FwaXRhbGl6ZSwgY2FtZWxpemV9ID0gX3BsdXMoKVxuICAgIGNvbnN0IGNvbW1hbmRDbGFzc05hbWUgPSBjYXBpdGFsaXplKGNhbWVsaXplKGNvbW1hbmRXaXRob3V0UHJlZml4KSlcbiAgICBpZiAoY29tbWFuZENsYXNzTmFtZSBpbiBDTEFTU19SRUdJU1RSWSkge1xuICAgICAgcmV0dXJuIENMQVNTX1JFR0lTVFJZW2NvbW1hbmRDbGFzc05hbWVdLm9wZXJhdGlvbktpbmRcbiAgICB9XG4gIH1cblxuICAvLyBQcm94eSBwcm9wcGVydGllcyBhbmQgbWV0aG9kc1xuICAvLz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICBnZXQgbW9kZSgpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUubW9kZSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBnZXQgc3VibW9kZSgpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUuc3VibW9kZSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBnZXQgc3dyYXAoKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLnN3cmFwIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIGdldCB1dGlscygpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUudXRpbHMgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgZ2V0IGVkaXRvcigpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUuZWRpdG9yIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIGdldCBlZGl0b3JFbGVtZW50KCkgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5lZGl0b3JFbGVtZW50IH0gLy8gcHJldHRpZXItaWdub3JlXG4gIGdldCBnbG9iYWxTdGF0ZSgpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUuZ2xvYmFsU3RhdGUgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgZ2V0IG11dGF0aW9uTWFuYWdlcigpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUubXV0YXRpb25NYW5hZ2VyIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIGdldCBvY2N1cnJlbmNlTWFuYWdlcigpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUub2NjdXJyZW5jZU1hbmFnZXIgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgZ2V0IHBlcnNpc3RlbnRTZWxlY3Rpb24oKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLnBlcnNpc3RlbnRTZWxlY3Rpb24gfSAvLyBwcmV0dGllci1pZ25vcmVcblxuICBvbkRpZENoYW5nZVNlYXJjaCguLi5hcmdzKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLm9uRGlkQ2hhbmdlU2VhcmNoKC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIG9uRGlkQ29uZmlybVNlYXJjaCguLi5hcmdzKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLm9uRGlkQ29uZmlybVNlYXJjaCguLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBvbkRpZENhbmNlbFNlYXJjaCguLi5hcmdzKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLm9uRGlkQ2FuY2VsU2VhcmNoKC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIG9uRGlkQ29tbWFuZFNlYXJjaCguLi5hcmdzKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLm9uRGlkQ29tbWFuZFNlYXJjaCguLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBvbkRpZFNldFRhcmdldCguLi5hcmdzKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLm9uRGlkU2V0VGFyZ2V0KC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIGVtaXREaWRTZXRUYXJnZXQoLi4uYXJncykgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5lbWl0RGlkU2V0VGFyZ2V0KC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIG9uV2lsbFNlbGVjdFRhcmdldCguLi5hcmdzKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLm9uV2lsbFNlbGVjdFRhcmdldCguLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBlbWl0V2lsbFNlbGVjdFRhcmdldCguLi5hcmdzKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLmVtaXRXaWxsU2VsZWN0VGFyZ2V0KC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIG9uRGlkU2VsZWN0VGFyZ2V0KC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUub25EaWRTZWxlY3RUYXJnZXQoLi4uYXJncykgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgZW1pdERpZFNlbGVjdFRhcmdldCguLi5hcmdzKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLmVtaXREaWRTZWxlY3RUYXJnZXQoLi4uYXJncykgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgb25EaWRGYWlsU2VsZWN0VGFyZ2V0KC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUub25EaWRGYWlsU2VsZWN0VGFyZ2V0KC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIGVtaXREaWRGYWlsU2VsZWN0VGFyZ2V0KC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUuZW1pdERpZEZhaWxTZWxlY3RUYXJnZXQoLi4uYXJncykgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgb25XaWxsRmluaXNoTXV0YXRpb24oLi4uYXJncykgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5vbldpbGxGaW5pc2hNdXRhdGlvbiguLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBlbWl0V2lsbEZpbmlzaE11dGF0aW9uKC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUuZW1pdFdpbGxGaW5pc2hNdXRhdGlvbiguLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBvbkRpZEZpbmlzaE11dGF0aW9uKC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUub25EaWRGaW5pc2hNdXRhdGlvbiguLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBlbWl0RGlkRmluaXNoTXV0YXRpb24oLi4uYXJncykgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5lbWl0RGlkRmluaXNoTXV0YXRpb24oLi4uYXJncykgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgb25EaWRGaW5pc2hPcGVyYXRpb24oLi4uYXJncykgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5vbkRpZEZpbmlzaE9wZXJhdGlvbiguLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBvbkRpZFJlc2V0T3BlcmF0aW9uU3RhY2soLi4uYXJncykgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5vbkRpZFJlc2V0T3BlcmF0aW9uU3RhY2soLi4uYXJncykgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgb25XaWxsQWN0aXZhdGVNb2RlKC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUub25XaWxsQWN0aXZhdGVNb2RlKC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIG9uRGlkQWN0aXZhdGVNb2RlKC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUub25EaWRBY3RpdmF0ZU1vZGUoLi4uYXJncykgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgcHJlZW1wdFdpbGxEZWFjdGl2YXRlTW9kZSguLi5hcmdzKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLnByZWVtcHRXaWxsRGVhY3RpdmF0ZU1vZGUoLi4uYXJncykgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgb25XaWxsRGVhY3RpdmF0ZU1vZGUoLi4uYXJncykgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5vbldpbGxEZWFjdGl2YXRlTW9kZSguLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBvbkRpZERlYWN0aXZhdGVNb2RlKC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUub25EaWREZWFjdGl2YXRlTW9kZSguLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBvbkRpZENhbmNlbFNlbGVjdExpc3QoLi4uYXJncykgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5vbkRpZENhbmNlbFNlbGVjdExpc3QoLi4uYXJncykgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgc3Vic2NyaWJlKC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUuc3Vic2NyaWJlKC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIGlzTW9kZSguLi5hcmdzKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLmlzTW9kZSguLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBnZXRCbG9ja3dpc2VTZWxlY3Rpb25zKC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUuZ2V0QmxvY2t3aXNlU2VsZWN0aW9ucyguLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBnZXRMYXN0QmxvY2t3aXNlU2VsZWN0aW9uKC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUuZ2V0TGFzdEJsb2Nrd2lzZVNlbGVjdGlvbiguLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBhZGRUb0NsYXNzTGlzdCguLi5hcmdzKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLmFkZFRvQ2xhc3NMaXN0KC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIGdldENvbmZpZyguLi5hcmdzKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLmdldENvbmZpZyguLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuXG4gIC8vIFdyYXBwZXIgZm9yIHRoaXMudXRpbHNcbiAgLy89PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgZ2V0VmltRW9mQnVmZmVyUG9zaXRpb24oKSB7IHJldHVybiB0aGlzLnV0aWxzLmdldFZpbUVvZkJ1ZmZlclBvc2l0aW9uKHRoaXMuZWRpdG9yKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBnZXRWaW1MYXN0QnVmZmVyUm93KCkgeyByZXR1cm4gdGhpcy51dGlscy5nZXRWaW1MYXN0QnVmZmVyUm93KHRoaXMuZWRpdG9yKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBnZXRWaW1MYXN0U2NyZWVuUm93KCkgeyByZXR1cm4gdGhpcy51dGlscy5nZXRWaW1MYXN0U2NyZWVuUm93KHRoaXMuZWRpdG9yKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBnZXRWYWxpZFZpbUJ1ZmZlclJvdyhyb3cpIHsgcmV0dXJuIHRoaXMudXRpbHMuZ2V0VmFsaWRWaW1CdWZmZXJSb3codGhpcy5lZGl0b3IsIHJvdykgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgZ2V0V29yZEJ1ZmZlclJhbmdlQW5kS2luZEF0QnVmZmVyUG9zaXRpb24oLi4uYXJncykgeyByZXR1cm4gdGhpcy51dGlscy5nZXRXb3JkQnVmZmVyUmFuZ2VBbmRLaW5kQXRCdWZmZXJQb3NpdGlvbih0aGlzLmVkaXRvciwgLi4uYXJncykgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgZ2V0Rmlyc3RDaGFyYWN0ZXJQb3NpdGlvbkZvckJ1ZmZlclJvdyhyb3cpIHsgcmV0dXJuIHRoaXMudXRpbHMuZ2V0Rmlyc3RDaGFyYWN0ZXJQb3NpdGlvbkZvckJ1ZmZlclJvdyh0aGlzLmVkaXRvciwgcm93KSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBnZXRCdWZmZXJSYW5nZUZvclJvd1JhbmdlKHJvd1JhbmdlKSB7IHJldHVybiB0aGlzLnV0aWxzLmdldEJ1ZmZlclJhbmdlRm9yUm93UmFuZ2UodGhpcy5lZGl0b3IsIHJvd1JhbmdlKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBzY2FuRm9yd2FyZCguLi5hcmdzKSB7IHJldHVybiB0aGlzLnV0aWxzLnNjYW5FZGl0b3IodGhpcy5lZGl0b3IsIFwiZm9yd2FyZFwiLCAuLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBzY2FuQmFja3dhcmQoLi4uYXJncykgeyByZXR1cm4gdGhpcy51dGlscy5zY2FuRWRpdG9yKHRoaXMuZWRpdG9yLCBcImJhY2t3YXJkXCIsIC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIGdldEZvbGRTdGFydFJvd0ZvclJvdyguLi5hcmdzKSB7IHJldHVybiB0aGlzLnV0aWxzLmdldEZvbGRTdGFydFJvd0ZvclJvdyh0aGlzLmVkaXRvciwgLi4uYXJncykgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgZ2V0Rm9sZEVuZFJvd0ZvclJvdyguLi5hcmdzKSB7IHJldHVybiB0aGlzLnV0aWxzLmdldEZvbGRFbmRSb3dGb3JSb3codGhpcy5lZGl0b3IsIC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIGdldEJ1ZmZlclJvd3MoLi4uYXJncykgeyByZXR1cm4gdGhpcy51dGlscy5nZXRSb3dzKHRoaXMuZWRpdG9yLCBcImJ1ZmZlclwiLCAuLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBnZXRTY3JlZW5Sb3dzKC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudXRpbHMuZ2V0Um93cyh0aGlzLmVkaXRvciwgXCJzY3JlZW5cIiwgLi4uYXJncykgfSAvLyBwcmV0dGllci1pZ25vcmVcbn1cbkJhc2UucmVnaXN0ZXIoZmFsc2UpXG5cbm1vZHVsZS5leHBvcnRzID0gQmFzZVxuIl19