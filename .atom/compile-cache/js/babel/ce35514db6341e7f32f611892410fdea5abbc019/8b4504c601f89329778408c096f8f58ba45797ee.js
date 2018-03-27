"use babel";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var settings = require("./settings");
var VimState = require("./vim-state");

var selectList = undefined,
    FILE_TABLE = undefined;

function classify(s) {
  return s[0].toUpperCase() + s.slice(1).replace(/-(\w)/g, function (m) {
    return m[1].toUpperCase();
  });
}

function dasherize(s) {
  return (s[0].toLowerCase() + s.slice(1)).replace(/[A-Z]/g, function (m) {
    return "-" + m.toLowerCase();
  });
}

var Base = (function () {
  _createClass(Base, [{
    key: "name",
    get: function get() {
      return this.constructor.name;
    }
  }], [{
    key: "classTable",
    value: {},
    enumerable: true
  }, {
    key: "commandPrefix",
    value: "vim-mode-plus",
    enumerable: true
  }, {
    key: "commandScope",
    value: null,
    enumerable: true
  }, {
    key: "operationKind",
    value: null,
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

    // OperationStack postpone execution untill isReady() get true, overridden on subclass.
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
      if (this.count == null) {
        this.count = this.vimState.hasCount() ? this.vimState.getCount() : this.defaultCount;
      }
      return this.count;
    }

    // Identical to utils.limitNumber. Copy here to postpone full require of utils.
  }, {
    key: "limitNumber",
    value: function limitNumber(number) {
      var _ref = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      var max = _ref.max;
      var min = _ref.min;

      if (max != null) number = Math.min(number, max);
      if (min != null) number = Math.max(number, min);
      return number;
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

    // Return promise which resolve with input char or `undefined` when cancelled.
  }, {
    key: "focusInputPromised",
    value: function focusInputPromised() {
      var _this4 = this;

      var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      return new Promise(function (resolve) {
        var defaultOptions = { hideCursor: true, onChange: function onChange(input) {
            return _this4.vimState.hover.set(input);
          } };
        _this4.vimState.focusInput(Object.assign(defaultOptions, options, { onConfirm: resolve, onCancel: resolve }));
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
    key: "onDidCancelSelectList",
    value: function onDidCancelSelectList() {
      var _vimState19;

      return (_vimState19 = this.vimState).onDidCancelSelectList.apply(_vimState19, arguments);
    }
    // prettier-ignore
  }, {
    key: "subscribe",
    value: function subscribe() {
      var _vimState20;

      return (_vimState20 = this.vimState).subscribe.apply(_vimState20, arguments);
    }
    // prettier-ignore
  }, {
    key: "isMode",
    value: function isMode() {
      var _vimState21;

      return (_vimState21 = this.vimState).isMode.apply(_vimState21, arguments);
    }
    // prettier-ignore
  }, {
    key: "getBlockwiseSelections",
    value: function getBlockwiseSelections() {
      var _vimState22;

      return (_vimState22 = this.vimState).getBlockwiseSelections.apply(_vimState22, arguments);
    }
    // prettier-ignore
  }, {
    key: "getLastBlockwiseSelection",
    value: function getLastBlockwiseSelection() {
      var _vimState23;

      return (_vimState23 = this.vimState).getLastBlockwiseSelection.apply(_vimState23, arguments);
    }
    // prettier-ignore
  }, {
    key: "addToClassList",
    value: function addToClassList() {
      var _vimState24;

      return (_vimState24 = this.vimState).addToClassList.apply(_vimState24, arguments);
    }
    // prettier-ignore
  }, {
    key: "getConfig",
    value: function getConfig() {
      var _vimState25;

      return (_vimState25 = this.vimState).getConfig.apply(_vimState25, arguments);
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
    key: "scanEditor",
    value: function scanEditor() {
      var _utils2;

      for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      return (_utils2 = this.utils).scanEditor.apply(_utils2, [this.editor].concat(args));
    }
    // prettier-ignore
  }, {
    key: "findInEditor",
    value: function findInEditor() {
      var _utils3;

      for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        args[_key3] = arguments[_key3];
      }

      return (_utils3 = this.utils).findInEditor.apply(_utils3, [this.editor].concat(args));
    }
    // prettier-ignore
  }, {
    key: "findPoint",
    value: function findPoint() {
      var _utils4;

      for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
        args[_key4] = arguments[_key4];
      }

      return (_utils4 = this.utils).findPoint.apply(_utils4, [this.editor].concat(args));
    }
    // prettier-ignore
  }, {
    key: "trimBufferRange",
    value: function trimBufferRange() {
      var _utils5;

      for (var _len5 = arguments.length, args = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
        args[_key5] = arguments[_key5];
      }

      return (_utils5 = this.utils).trimBufferRange.apply(_utils5, [this.editor].concat(args));
    }
    // prettier-ignore
  }, {
    key: "isEmptyRow",
    value: function isEmptyRow() {
      var _utils6;

      for (var _len6 = arguments.length, args = Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
        args[_key6] = arguments[_key6];
      }

      return (_utils6 = this.utils).isEmptyRow.apply(_utils6, [this.editor].concat(args));
    }
    // prettier-ignore
  }, {
    key: "getFoldStartRowForRow",
    value: function getFoldStartRowForRow() {
      var _utils7;

      for (var _len7 = arguments.length, args = Array(_len7), _key7 = 0; _key7 < _len7; _key7++) {
        args[_key7] = arguments[_key7];
      }

      return (_utils7 = this.utils).getFoldStartRowForRow.apply(_utils7, [this.editor].concat(args));
    }
    // prettier-ignore
  }, {
    key: "getFoldEndRowForRow",
    value: function getFoldEndRowForRow() {
      var _utils8;

      for (var _len8 = arguments.length, args = Array(_len8), _key8 = 0; _key8 < _len8; _key8++) {
        args[_key8] = arguments[_key8];
      }

      return (_utils8 = this.utils).getFoldEndRowForRow.apply(_utils8, [this.editor].concat(args));
    }
    // prettier-ignore
  }, {
    key: "getBufferRows",
    value: function getBufferRows() {
      var _utils9;

      for (var _len9 = arguments.length, args = Array(_len9), _key9 = 0; _key9 < _len9; _key9++) {
        args[_key9] = arguments[_key9];
      }

      return (_utils9 = this.utils).getRows.apply(_utils9, [this.editor, "buffer"].concat(args));
    }
    // prettier-ignore
  }, {
    key: "getScreenRows",
    value: function getScreenRows() {
      var _utils10;

      for (var _len10 = arguments.length, args = Array(_len10), _key10 = 0; _key10 < _len10; _key10++) {
        args[_key10] = arguments[_key10];
      }

      return (_utils10 = this.utils).getRows.apply(_utils10, [this.editor, "screen"].concat(args));
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
    // prettier-ignore
  }, {
    key: "_",
    get: function get() {
      return this.vimState._;
    }
    // prettier-ignore
  }], [{
    key: "isCommand",
    value: function isCommand() {
      return this.hasOwnProperty("command") ? this.command : true;
    }

    // Return disposables for vmp commands.
  }, {
    key: "init",
    value: function init() {
      var _this8 = this;

      return require("./command-table.json").map(function (name) {
        return _this8.registerCommandFromSpec(null, { name: name });
      });
    }
  }, {
    key: "getClass",
    value: function getClass(name) {
      if (!(name in this.classTable)) {
        if (!FILE_TABLE) {
          (function () {
            FILE_TABLE = {};
            var namesByFile = require("./file-table.json");
            // convert namesByFile to fileByName(= FILE_TABLE)
            Object.keys(namesByFile).forEach(function (file) {
              return namesByFile[file].forEach(function (name) {
                return FILE_TABLE[name] = file;
              });
            });
          })();
        }
        Object.values(require(FILE_TABLE[name])).forEach(function (klass) {
          return klass.register();
        });

        if (atom.inDevMode() && settings.get("debug")) {
          console.log("lazy-require: " + FILE_TABLE[name] + " for " + name);
        }
      }
      if (name in this.classTable) return this.classTable[name];
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

    // Dont remove this. Public API to register operations to classTable
    // This can be used from vmp-plugin such as vmp-ex-mode.
  }, {
    key: "register",
    value: function register() {
      if (this.name in this.classTable) console.warn("Duplicate constructor " + this.name);
      this.classTable[this.name] = this;
    }
  }, {
    key: "getCommandName",
    value: function getCommandName() {
      var prefix = arguments.length <= 0 || arguments[0] === undefined ? this.commandPrefix : arguments[0];
      var name = arguments.length <= 1 || arguments[1] === undefined ? this.name : arguments[1];

      return prefix + ":" + dasherize(name);
    }
  }, {
    key: "getCommandNameWithoutPrefix",
    value: function getCommandNameWithoutPrefix() {
      return dasherize(this.name);
    }
  }, {
    key: "registerCommand",
    value: function registerCommand() {
      var _this9 = this;

      return this.registerCommandFromSpec(this.name, {
        scope: this.commandScope,
        name: this.getCommandName(),
        getClass: function getClass() {
          return _this9;
        }
      });
    }
  }, {
    key: "registerCommandFromSpec",
    value: function registerCommandFromSpec(klass, _ref2) {
      var scope = _ref2.scope;
      var name = _ref2.name;
      var prefix = _ref2.prefix;
      var getClass = _ref2.getClass;

      if (!name) name = this.getCommandName(prefix, klass);
      return atom.commands.add(scope || "atom-text-editor", name, function (event) {
        var vimState = VimState.get(this.getModel());

        // vimState possibly be undefined See #85
        if (vimState) {
          if (!klass) klass = classify(name.replace("vim-mode-plus:", ""));
          vimState.operationStack.run(getClass ? getClass(klass) : klass);
        }
        event.stopPropagation();
      });
    }
  }, {
    key: "getKindForCommandName",
    value: function getKindForCommandName(command) {
      var commandWithoutPrefix = command.replace(/^vim-mode-plus:/, "");
      var commandClassName = classify(commandWithoutPrefix);
      if (commandClassName in this.classTable) {
        return this.classTable[commandClassName].operationKind;
      }
    }
  }, {
    key: "_",
    get: function get() {
      return VimState._;
    }
  }]);

  return Base;
})();

module.exports = Base;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL2Jhc2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsV0FBVyxDQUFBOzs7Ozs7QUFFWCxJQUFNLFFBQVEsR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUE7QUFDdEMsSUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFBOztBQUV2QyxJQUFJLFVBQVUsWUFBQTtJQUFFLFVBQVUsWUFBQSxDQUFBOztBQUUxQixTQUFTLFFBQVEsQ0FBQyxDQUFDLEVBQUU7QUFDbkIsU0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLFVBQUEsQ0FBQztXQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUU7R0FBQSxDQUFDLENBQUE7Q0FDbEY7O0FBRUQsU0FBUyxTQUFTLENBQUMsQ0FBQyxFQUFFO0FBQ3BCLFNBQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQSxDQUFFLE9BQU8sQ0FBQyxRQUFRLEVBQUUsVUFBQSxDQUFDO1dBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxXQUFXLEVBQUU7R0FBQSxDQUFDLENBQUE7Q0FDdkY7O0lBRUssSUFBSTtlQUFKLElBQUk7O1NBV0EsZUFBRztBQUNULGFBQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUE7S0FDN0I7OztXQVptQixFQUFFOzs7O1dBQ0MsZUFBZTs7OztXQUNoQixJQUFJOzs7O1dBQ0gsSUFBSTs7OztBQVdoQixXQWZQLElBQUksQ0FlSSxRQUFRLEVBQUU7MEJBZmxCLElBQUk7O1NBTVIsVUFBVSxHQUFHLEtBQUs7U0FDbEIsUUFBUSxH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QUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUE7OztBQUc5QyxZQUFJLFFBQVEsRUFBRTtBQUNaLGNBQUksQ0FBQyxLQUFLLEVBQUUsS0FBSyxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLGdCQUFnQixFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUE7QUFDaEUsa0JBQVEsQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUE7U0FDaEU7QUFDRCxhQUFLLENBQUMsZUFBZSxFQUFFLENBQUE7T0FDeEIsQ0FBQyxDQUFBO0tBQ0g7OztXQUUyQiwrQkFBQyxPQUFPLEVBQUU7QUFDcEMsVUFBTSxvQkFBb0IsR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLGlCQUFpQixFQUFFLEVBQUUsQ0FBQyxDQUFBO0FBQ25FLFVBQU0sZ0JBQWdCLEdBQUcsUUFBUSxDQUFDLG9CQUFvQixDQUFDLENBQUE7QUFDdkQsVUFBSSxnQkFBZ0IsSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFO0FBQ3ZDLGVBQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLGFBQWEsQ0FBQTtPQUN2RDtLQUNGOzs7U0FvQlcsZUFBRztBQUFFLGFBQU8sUUFBUSxDQUFDLENBQUMsQ0FBQTtLQUFFOzs7U0E5UmhDLElBQUk7OztBQStVVixNQUFNLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQSIsImZpbGUiOiIvVXNlcnMvdGxhbmRhdS9kb3RmaWxlcy8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi9iYXNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2UgYmFiZWxcIlxuXG5jb25zdCBzZXR0aW5ncyA9IHJlcXVpcmUoXCIuL3NldHRpbmdzXCIpXG5jb25zdCBWaW1TdGF0ZSA9IHJlcXVpcmUoXCIuL3ZpbS1zdGF0ZVwiKVxuXG5sZXQgc2VsZWN0TGlzdCwgRklMRV9UQUJMRVxuXG5mdW5jdGlvbiBjbGFzc2lmeShzKSB7XG4gIHJldHVybiBzWzBdLnRvVXBwZXJDYXNlKCkgKyBzLnNsaWNlKDEpLnJlcGxhY2UoLy0oXFx3KS9nLCBtID0+IG1bMV0udG9VcHBlckNhc2UoKSlcbn1cblxuZnVuY3Rpb24gZGFzaGVyaXplKHMpIHtcbiAgcmV0dXJuIChzWzBdLnRvTG93ZXJDYXNlKCkgKyBzLnNsaWNlKDEpKS5yZXBsYWNlKC9bQS1aXS9nLCBtID0+IFwiLVwiICsgbS50b0xvd2VyQ2FzZSgpKVxufVxuXG5jbGFzcyBCYXNlIHtcbiAgc3RhdGljIGNsYXNzVGFibGUgPSB7fVxuICBzdGF0aWMgY29tbWFuZFByZWZpeCA9IFwidmltLW1vZGUtcGx1c1wiXG4gIHN0YXRpYyBjb21tYW5kU2NvcGUgPSBudWxsXG4gIHN0YXRpYyBvcGVyYXRpb25LaW5kID0gbnVsbFxuXG4gIHJlY29yZGFibGUgPSBmYWxzZVxuICByZXBlYXRlZCA9IGZhbHNlXG4gIGNvdW50ID0gbnVsbFxuICBkZWZhdWx0Q291bnQgPSAxXG5cbiAgZ2V0IG5hbWUoKSB7XG4gICAgcmV0dXJuIHRoaXMuY29uc3RydWN0b3IubmFtZVxuICB9XG5cbiAgY29uc3RydWN0b3IodmltU3RhdGUpIHtcbiAgICB0aGlzLnZpbVN0YXRlID0gdmltU3RhdGVcbiAgfVxuXG4gIGluaXRpYWxpemUoKSB7fVxuXG4gIC8vIENhbGxlZCBib3RoIG9uIGNhbmNlbCBhbmQgc3VjY2Vzc1xuICByZXNldFN0YXRlKCkge31cblxuICAvLyBPcGVyYXRpb25TdGFjayBwb3N0cG9uZSBleGVjdXRpb24gdW50aWxsIGlzUmVhZHkoKSBnZXQgdHJ1ZSwgb3ZlcnJpZGRlbiBvbiBzdWJjbGFzcy5cbiAgaXNSZWFkeSgpIHtcbiAgICByZXR1cm4gdHJ1ZVxuICB9XG5cbiAgLy8gVmlzdWFsTW9kZVNlbGVjdCBpcyBhbm9ybWFsLCBzaW5jZSBpdCBhdXRvIGNvbXBsZW1lbnRlZCBpbiB2aXNpYWwgbW9kZS5cbiAgLy8gSW4gb3RoZXIgd29yZCwgbm9ybWFsLW9wZXJhdG9yIGlzIGV4cGxpY2l0IHdoZXJlYXMgYW5vcm1hbC1vcGVyYXRvciBpcyBpbnBsaWNpdC5cbiAgaXNUYXJnZXRPZk5vcm1hbE9wZXJhdG9yKCkge1xuICAgIHJldHVybiB0aGlzLm9wZXJhdG9yICYmIHRoaXMub3BlcmF0b3IubmFtZSAhPT0gXCJWaXN1YWxNb2RlU2VsZWN0XCJcbiAgfVxuXG4gIGdldENvdW50KCkge1xuICAgIGlmICh0aGlzLmNvdW50ID09IG51bGwpIHtcbiAgICAgIHRoaXMuY291bnQgPSB0aGlzLnZpbVN0YXRlLmhhc0NvdW50KCkgPyB0aGlzLnZpbVN0YXRlLmdldENvdW50KCkgOiB0aGlzLmRlZmF1bHRDb3VudFxuICAgIH1cbiAgICByZXR1cm4gdGhpcy5jb3VudFxuICB9XG5cbiAgLy8gSWRlbnRpY2FsIHRvIHV0aWxzLmxpbWl0TnVtYmVyLiBDb3B5IGhlcmUgdG8gcG9zdHBvbmUgZnVsbCByZXF1aXJlIG9mIHV0aWxzLlxuICBsaW1pdE51bWJlcihudW1iZXIsIHttYXgsIG1pbn0gPSB7fSkge1xuICAgIGlmIChtYXggIT0gbnVsbCkgbnVtYmVyID0gTWF0aC5taW4obnVtYmVyLCBtYXgpXG4gICAgaWYgKG1pbiAhPSBudWxsKSBudW1iZXIgPSBNYXRoLm1heChudW1iZXIsIG1pbilcbiAgICByZXR1cm4gbnVtYmVyXG4gIH1cblxuICByZXNldENvdW50KCkge1xuICAgIHRoaXMuY291bnQgPSBudWxsXG4gIH1cblxuICBjb3VudFRpbWVzKGxhc3QsIGZuKSB7XG4gICAgaWYgKGxhc3QgPCAxKSByZXR1cm5cblxuICAgIGxldCBzdG9wcGVkID0gZmFsc2VcbiAgICBjb25zdCBzdG9wID0gKCkgPT4gKHN0b3BwZWQgPSB0cnVlKVxuICAgIGZvciAobGV0IGNvdW50ID0gMTsgY291bnQgPD0gbGFzdDsgY291bnQrKykge1xuICAgICAgZm4oe2NvdW50LCBpc0ZpbmFsOiBjb3VudCA9PT0gbGFzdCwgc3RvcH0pXG4gICAgICBpZiAoc3RvcHBlZCkgYnJlYWtcbiAgICB9XG4gIH1cblxuICBhY3RpdmF0ZU1vZGUobW9kZSwgc3VibW9kZSkge1xuICAgIHRoaXMub25EaWRGaW5pc2hPcGVyYXRpb24oKCkgPT4gdGhpcy52aW1TdGF0ZS5hY3RpdmF0ZShtb2RlLCBzdWJtb2RlKSlcbiAgfVxuXG4gIGFjdGl2YXRlTW9kZUlmTmVjZXNzYXJ5KG1vZGUsIHN1Ym1vZGUpIHtcbiAgICBpZiAoIXRoaXMudmltU3RhdGUuaXNNb2RlKG1vZGUsIHN1Ym1vZGUpKSB7XG4gICAgICB0aGlzLmFjdGl2YXRlTW9kZShtb2RlLCBzdWJtb2RlKVxuICAgIH1cbiAgfVxuXG4gIGdldEluc3RhbmNlKG5hbWUsIHByb3BlcnRpZXMpIHtcbiAgICByZXR1cm4gdGhpcy5jb25zdHJ1Y3Rvci5nZXRJbnN0YW5jZSh0aGlzLnZpbVN0YXRlLCBuYW1lLCBwcm9wZXJ0aWVzKVxuICB9XG5cbiAgY2FuY2VsT3BlcmF0aW9uKCkge1xuICAgIHRoaXMudmltU3RhdGUub3BlcmF0aW9uU3RhY2suY2FuY2VsKHRoaXMpXG4gIH1cblxuICBwcm9jZXNzT3BlcmF0aW9uKCkge1xuICAgIHRoaXMudmltU3RhdGUub3BlcmF0aW9uU3RhY2sucHJvY2VzcygpXG4gIH1cblxuICBmb2N1c1NlbGVjdExpc3Qob3B0aW9ucyA9IHt9KSB7XG4gICAgdGhpcy5vbkRpZENhbmNlbFNlbGVjdExpc3QoKCkgPT4gdGhpcy5jYW5jZWxPcGVyYXRpb24oKSlcbiAgICBpZiAoIXNlbGVjdExpc3QpIHtcbiAgICAgIHNlbGVjdExpc3QgPSBuZXcgKHJlcXVpcmUoXCIuL3NlbGVjdC1saXN0XCIpKSgpXG4gICAgfVxuICAgIHNlbGVjdExpc3Quc2hvdyh0aGlzLnZpbVN0YXRlLCBvcHRpb25zKVxuICB9XG5cbiAgZm9jdXNJbnB1dChvcHRpb25zID0ge30pIHtcbiAgICBpZiAoIW9wdGlvbnMub25Db25maXJtKSB7XG4gICAgICBvcHRpb25zLm9uQ29uZmlybSA9IGlucHV0ID0+IHtcbiAgICAgICAgdGhpcy5pbnB1dCA9IGlucHV0XG4gICAgICAgIHRoaXMucHJvY2Vzc09wZXJhdGlvbigpXG4gICAgICB9XG4gICAgfVxuICAgIGlmICghb3B0aW9ucy5vbkNhbmNlbCkgb3B0aW9ucy5vbkNhbmNlbCA9ICgpID0+IHRoaXMuY2FuY2VsT3BlcmF0aW9uKClcbiAgICBpZiAoIW9wdGlvbnMub25DaGFuZ2UpIG9wdGlvbnMub25DaGFuZ2UgPSBpbnB1dCA9PiB0aGlzLnZpbVN0YXRlLmhvdmVyLnNldChpbnB1dClcblxuICAgIHRoaXMudmltU3RhdGUuZm9jdXNJbnB1dChvcHRpb25zKVxuICB9XG5cbiAgLy8gUmV0dXJuIHByb21pc2Ugd2hpY2ggcmVzb2x2ZSB3aXRoIGlucHV0IGNoYXIgb3IgYHVuZGVmaW5lZGAgd2hlbiBjYW5jZWxsZWQuXG4gIGZvY3VzSW5wdXRQcm9taXNlZChvcHRpb25zID0ge30pIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgICBjb25zdCBkZWZhdWx0T3B0aW9ucyA9IHtoaWRlQ3Vyc29yOiB0cnVlLCBvbkNoYW5nZTogaW5wdXQgPT4gdGhpcy52aW1TdGF0ZS5ob3Zlci5zZXQoaW5wdXQpfVxuICAgICAgdGhpcy52aW1TdGF0ZS5mb2N1c0lucHV0KE9iamVjdC5hc3NpZ24oZGVmYXVsdE9wdGlvbnMsIG9wdGlvbnMsIHtvbkNvbmZpcm06IHJlc29sdmUsIG9uQ2FuY2VsOiByZXNvbHZlfSkpXG4gICAgfSlcbiAgfVxuXG4gIHJlYWRDaGFyKCkge1xuICAgIHRoaXMudmltU3RhdGUucmVhZENoYXIoe1xuICAgICAgb25Db25maXJtOiBpbnB1dCA9PiB7XG4gICAgICAgIHRoaXMuaW5wdXQgPSBpbnB1dFxuICAgICAgICB0aGlzLnByb2Nlc3NPcGVyYXRpb24oKVxuICAgICAgfSxcbiAgICAgIG9uQ2FuY2VsOiAoKSA9PiB0aGlzLmNhbmNlbE9wZXJhdGlvbigpLFxuICAgIH0pXG4gIH1cblxuICAvLyBSZXR1cm4gcHJvbWlzZSB3aGljaCByZXNvbHZlIHdpdGggcmVhZCBjaGFyIG9yIGB1bmRlZmluZWRgIHdoZW4gY2FuY2VsbGVkLlxuICByZWFkQ2hhclByb21pc2VkKCkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICAgIHRoaXMudmltU3RhdGUucmVhZENoYXIoe29uQ29uZmlybTogcmVzb2x2ZSwgb25DYW5jZWw6IHJlc29sdmV9KVxuICAgIH0pXG4gIH1cblxuICBpbnN0YW5jZW9mKGtsYXNzTmFtZSkge1xuICAgIHJldHVybiB0aGlzIGluc3RhbmNlb2YgQmFzZS5nZXRDbGFzcyhrbGFzc05hbWUpXG4gIH1cblxuICBpc09wZXJhdG9yKCkge1xuICAgIC8vIERvbid0IHVzZSBgaW5zdGFuY2VvZmAgdG8gcG9zdHBvbmUgcmVxdWlyZSBmb3IgZmFzdGVyIGFjdGl2YXRpb24uXG4gICAgcmV0dXJuIHRoaXMuY29uc3RydWN0b3Iub3BlcmF0aW9uS2luZCA9PT0gXCJvcGVyYXRvclwiXG4gIH1cblxuICBpc01vdGlvbigpIHtcbiAgICAvLyBEb24ndCB1c2UgYGluc3RhbmNlb2ZgIHRvIHBvc3Rwb25lIHJlcXVpcmUgZm9yIGZhc3RlciBhY3RpdmF0aW9uLlxuICAgIHJldHVybiB0aGlzLmNvbnN0cnVjdG9yLm9wZXJhdGlvbktpbmQgPT09IFwibW90aW9uXCJcbiAgfVxuXG4gIGlzVGV4dE9iamVjdCgpIHtcbiAgICAvLyBEb24ndCB1c2UgYGluc3RhbmNlb2ZgIHRvIHBvc3Rwb25lIHJlcXVpcmUgZm9yIGZhc3RlciBhY3RpdmF0aW9uLlxuICAgIHJldHVybiB0aGlzLmNvbnN0cnVjdG9yLm9wZXJhdGlvbktpbmQgPT09IFwidGV4dC1vYmplY3RcIlxuICB9XG5cbiAgZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0QnVmZmVyUG9zaXRpb25Gb3JDdXJzb3IodGhpcy5lZGl0b3IuZ2V0TGFzdEN1cnNvcigpKVxuICB9XG5cbiAgZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb25zKCkge1xuICAgIHJldHVybiB0aGlzLmVkaXRvci5nZXRDdXJzb3JzKCkubWFwKGN1cnNvciA9PiB0aGlzLmdldEJ1ZmZlclBvc2l0aW9uRm9yQ3Vyc29yKGN1cnNvcikpXG4gIH1cblxuICBnZXRDdXJzb3JCdWZmZXJQb3NpdGlvbnNPcmRlcmVkKCkge1xuICAgIHJldHVybiB0aGlzLnV0aWxzLnNvcnRQb2ludHModGhpcy5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbnMoKSlcbiAgfVxuXG4gIGdldEJ1ZmZlclBvc2l0aW9uRm9yQ3Vyc29yKGN1cnNvcikge1xuICAgIHJldHVybiB0aGlzLm1vZGUgPT09IFwidmlzdWFsXCIgPyB0aGlzLmdldEN1cnNvclBvc2l0aW9uRm9yU2VsZWN0aW9uKGN1cnNvci5zZWxlY3Rpb24pIDogY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKClcbiAgfVxuXG4gIGdldEN1cnNvclBvc2l0aW9uRm9yU2VsZWN0aW9uKHNlbGVjdGlvbikge1xuICAgIHJldHVybiB0aGlzLnN3cmFwKHNlbGVjdGlvbikuZ2V0QnVmZmVyUG9zaXRpb25Gb3IoXCJoZWFkXCIsIHtmcm9tOiBbXCJwcm9wZXJ0eVwiLCBcInNlbGVjdGlvblwiXX0pXG4gIH1cblxuICBnZXRPcGVyYXRpb25UeXBlQ2hhcigpIHtcbiAgICByZXR1cm4ge29wZXJhdG9yOiBcIk9cIiwgXCJ0ZXh0LW9iamVjdFwiOiBcIlRcIiwgbW90aW9uOiBcIk1cIiwgXCJtaXNjLWNvbW1hbmRcIjogXCJYXCJ9W3RoaXMuY29uc3RydWN0b3Iub3BlcmF0aW9uS2luZF1cbiAgfVxuXG4gIHRvU3RyaW5nKCkge1xuICAgIGNvbnN0IGJhc2UgPSBgJHt0aGlzLm5hbWV9PCR7dGhpcy5nZXRPcGVyYXRpb25UeXBlQ2hhcigpfT5gXG4gICAgcmV0dXJuIHRoaXMudGFyZ2V0ID8gYCR7YmFzZX17dGFyZ2V0ID0gJHt0aGlzLnRhcmdldC50b1N0cmluZygpfX1gIDogYmFzZVxuICB9XG5cbiAgZ2V0Q29tbWFuZE5hbWUoKSB7XG4gICAgcmV0dXJuIHRoaXMuY29uc3RydWN0b3IuZ2V0Q29tbWFuZE5hbWUoKVxuICB9XG5cbiAgZ2V0Q29tbWFuZE5hbWVXaXRob3V0UHJlZml4KCkge1xuICAgIHJldHVybiB0aGlzLmNvbnN0cnVjdG9yLmdldENvbW1hbmROYW1lV2l0aG91dFByZWZpeCgpXG4gIH1cblxuICBzdGF0aWMgaXNDb21tYW5kKCkge1xuICAgIHJldHVybiB0aGlzLmhhc093blByb3BlcnR5KFwiY29tbWFuZFwiKSA/IHRoaXMuY29tbWFuZCA6IHRydWVcbiAgfVxuXG4gIC8vIFJldHVybiBkaXNwb3NhYmxlcyBmb3Igdm1wIGNvbW1hbmRzLlxuICBzdGF0aWMgaW5pdCgpIHtcbiAgICByZXR1cm4gcmVxdWlyZShcIi4vY29tbWFuZC10YWJsZS5qc29uXCIpLm1hcChuYW1lID0+IHRoaXMucmVnaXN0ZXJDb21tYW5kRnJvbVNwZWMobnVsbCwge25hbWV9KSlcbiAgfVxuXG4gIHN0YXRpYyBnZXRDbGFzcyhuYW1lKSB7XG4gICAgaWYgKCEobmFtZSBpbiB0aGlzLmNsYXNzVGFibGUpKSB7XG4gICAgICBpZiAoIUZJTEVfVEFCTEUpIHtcbiAgICAgICAgRklMRV9UQUJMRSA9IHt9XG4gICAgICAgIGNvbnN0IG5hbWVzQnlGaWxlID0gcmVxdWlyZShcIi4vZmlsZS10YWJsZS5qc29uXCIpXG4gICAgICAgIC8vIGNvbnZlcnQgbmFtZXNCeUZpbGUgdG8gZmlsZUJ5TmFtZSg9IEZJTEVfVEFCTEUpXG4gICAgICAgIE9iamVjdC5rZXlzKG5hbWVzQnlGaWxlKS5mb3JFYWNoKGZpbGUgPT4gbmFtZXNCeUZpbGVbZmlsZV0uZm9yRWFjaChuYW1lID0+IChGSUxFX1RBQkxFW25hbWVdID0gZmlsZSkpKVxuICAgICAgfVxuICAgICAgT2JqZWN0LnZhbHVlcyhyZXF1aXJlKEZJTEVfVEFCTEVbbmFtZV0pKS5mb3JFYWNoKGtsYXNzID0+IGtsYXNzLnJlZ2lzdGVyKCkpXG5cbiAgICAgIGlmIChhdG9tLmluRGV2TW9kZSgpICYmIHNldHRpbmdzLmdldChcImRlYnVnXCIpKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGBsYXp5LXJlcXVpcmU6ICR7RklMRV9UQUJMRVtuYW1lXX0gZm9yICR7bmFtZX1gKVxuICAgICAgfVxuICAgIH1cbiAgICBpZiAobmFtZSBpbiB0aGlzLmNsYXNzVGFibGUpIHJldHVybiB0aGlzLmNsYXNzVGFibGVbbmFtZV1cbiAgICB0aHJvdyBuZXcgRXJyb3IoYGNsYXNzICcke25hbWV9JyBub3QgZm91bmRgKVxuICB9XG5cbiAgc3RhdGljIGdldEluc3RhbmNlKHZpbVN0YXRlLCBrbGFzcywgcHJvcGVydGllcykge1xuICAgIGtsYXNzID0gdHlwZW9mIGtsYXNzID09PSBcImZ1bmN0aW9uXCIgPyBrbGFzcyA6IEJhc2UuZ2V0Q2xhc3Moa2xhc3MpXG4gICAgY29uc3Qgb2JqZWN0ID0gbmV3IGtsYXNzKHZpbVN0YXRlKVxuICAgIGlmIChwcm9wZXJ0aWVzKSBPYmplY3QuYXNzaWduKG9iamVjdCwgcHJvcGVydGllcylcbiAgICBvYmplY3QuaW5pdGlhbGl6ZSgpXG4gICAgcmV0dXJuIG9iamVjdFxuICB9XG5cbiAgLy8gRG9udCByZW1vdmUgdGhpcy4gUHVibGljIEFQSSB0byByZWdpc3RlciBvcGVyYXRpb25zIHRvIGNsYXNzVGFibGVcbiAgLy8gVGhpcyBjYW4gYmUgdXNlZCBmcm9tIHZtcC1wbHVnaW4gc3VjaCBhcyB2bXAtZXgtbW9kZS5cbiAgc3RhdGljIHJlZ2lzdGVyKCkge1xuICAgIGlmICh0aGlzLm5hbWUgaW4gdGhpcy5jbGFzc1RhYmxlKSBjb25zb2xlLndhcm4oYER1cGxpY2F0ZSBjb25zdHJ1Y3RvciAke3RoaXMubmFtZX1gKVxuICAgIHRoaXMuY2xhc3NUYWJsZVt0aGlzLm5hbWVdID0gdGhpc1xuICB9XG5cbiAgc3RhdGljIGdldENvbW1hbmROYW1lKHByZWZpeCA9IHRoaXMuY29tbWFuZFByZWZpeCwgbmFtZSA9IHRoaXMubmFtZSkge1xuICAgIHJldHVybiBwcmVmaXggKyBcIjpcIiArIGRhc2hlcml6ZShuYW1lKVxuICB9XG5cbiAgc3RhdGljIGdldENvbW1hbmROYW1lV2l0aG91dFByZWZpeCgpIHtcbiAgICByZXR1cm4gZGFzaGVyaXplKHRoaXMubmFtZSlcbiAgfVxuXG4gIHN0YXRpYyByZWdpc3RlckNvbW1hbmQoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVnaXN0ZXJDb21tYW5kRnJvbVNwZWModGhpcy5uYW1lLCB7XG4gICAgICBzY29wZTogdGhpcy5jb21tYW5kU2NvcGUsXG4gICAgICBuYW1lOiB0aGlzLmdldENvbW1hbmROYW1lKCksXG4gICAgICBnZXRDbGFzczogKCkgPT4gdGhpcyxcbiAgICB9KVxuICB9XG5cbiAgc3RhdGljIHJlZ2lzdGVyQ29tbWFuZEZyb21TcGVjKGtsYXNzLCB7c2NvcGUsIG5hbWUsIHByZWZpeCwgZ2V0Q2xhc3N9KSB7XG4gICAgaWYgKCFuYW1lKSBuYW1lID0gdGhpcy5nZXRDb21tYW5kTmFtZShwcmVmaXgsIGtsYXNzKVxuICAgIHJldHVybiBhdG9tLmNvbW1hbmRzLmFkZChzY29wZSB8fCBcImF0b20tdGV4dC1lZGl0b3JcIiwgbmFtZSwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgIGNvbnN0IHZpbVN0YXRlID0gVmltU3RhdGUuZ2V0KHRoaXMuZ2V0TW9kZWwoKSlcblxuICAgICAgLy8gdmltU3RhdGUgcG9zc2libHkgYmUgdW5kZWZpbmVkIFNlZSAjODVcbiAgICAgIGlmICh2aW1TdGF0ZSkge1xuICAgICAgICBpZiAoIWtsYXNzKSBrbGFzcyA9IGNsYXNzaWZ5KG5hbWUucmVwbGFjZShcInZpbS1tb2RlLXBsdXM6XCIsIFwiXCIpKVxuICAgICAgICB2aW1TdGF0ZS5vcGVyYXRpb25TdGFjay5ydW4oZ2V0Q2xhc3MgPyBnZXRDbGFzcyhrbGFzcykgOiBrbGFzcylcbiAgICAgIH1cbiAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXG4gICAgfSlcbiAgfVxuXG4gIHN0YXRpYyBnZXRLaW5kRm9yQ29tbWFuZE5hbWUoY29tbWFuZCkge1xuICAgIGNvbnN0IGNvbW1hbmRXaXRob3V0UHJlZml4ID0gY29tbWFuZC5yZXBsYWNlKC9edmltLW1vZGUtcGx1czovLCBcIlwiKVxuICAgIGNvbnN0IGNvbW1hbmRDbGFzc05hbWUgPSBjbGFzc2lmeShjb21tYW5kV2l0aG91dFByZWZpeClcbiAgICBpZiAoY29tbWFuZENsYXNzTmFtZSBpbiB0aGlzLmNsYXNzVGFibGUpIHtcbiAgICAgIHJldHVybiB0aGlzLmNsYXNzVGFibGVbY29tbWFuZENsYXNzTmFtZV0ub3BlcmF0aW9uS2luZFxuICAgIH1cbiAgfVxuXG4gIGdldFNtb290aFNjcm9sbER1YXRpb24oa2luZCkge1xuICAgIGNvbnN0IGJhc2UgPSBcInNtb290aFNjcm9sbE9uXCIgKyBraW5kXG4gICAgcmV0dXJuIHRoaXMuZ2V0Q29uZmlnKGJhc2UpID8gdGhpcy5nZXRDb25maWcoYmFzZSArIFwiRHVyYXRpb25cIikgOiAwXG4gIH1cblxuICAvLyBQcm94eSBwcm9wcGVydGllcyBhbmQgbWV0aG9kc1xuICAvLz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICBnZXQgbW9kZSgpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUubW9kZSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBnZXQgc3VibW9kZSgpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUuc3VibW9kZSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBnZXQgc3dyYXAoKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLnN3cmFwIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIGdldCB1dGlscygpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUudXRpbHMgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgZ2V0IGVkaXRvcigpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUuZWRpdG9yIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIGdldCBlZGl0b3JFbGVtZW50KCkgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5lZGl0b3JFbGVtZW50IH0gLy8gcHJldHRpZXItaWdub3JlXG4gIGdldCBnbG9iYWxTdGF0ZSgpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUuZ2xvYmFsU3RhdGUgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgZ2V0IG11dGF0aW9uTWFuYWdlcigpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUubXV0YXRpb25NYW5hZ2VyIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIGdldCBvY2N1cnJlbmNlTWFuYWdlcigpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUub2NjdXJyZW5jZU1hbmFnZXIgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgZ2V0IHBlcnNpc3RlbnRTZWxlY3Rpb24oKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLnBlcnNpc3RlbnRTZWxlY3Rpb24gfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgZ2V0IF8oKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLl8gfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgc3RhdGljIGdldCBfKCkgeyByZXR1cm4gVmltU3RhdGUuXyB9IC8vIHByZXR0aWVyLWlnbm9yZVxuXG4gIG9uRGlkQ2hhbmdlU2VhcmNoKC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUub25EaWRDaGFuZ2VTZWFyY2goLi4uYXJncykgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgb25EaWRDb25maXJtU2VhcmNoKC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUub25EaWRDb25maXJtU2VhcmNoKC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIG9uRGlkQ2FuY2VsU2VhcmNoKC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUub25EaWRDYW5jZWxTZWFyY2goLi4uYXJncykgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgb25EaWRDb21tYW5kU2VhcmNoKC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUub25EaWRDb21tYW5kU2VhcmNoKC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIG9uRGlkU2V0VGFyZ2V0KC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUub25EaWRTZXRUYXJnZXQoLi4uYXJncykgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgZW1pdERpZFNldFRhcmdldCguLi5hcmdzKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLmVtaXREaWRTZXRUYXJnZXQoLi4uYXJncykgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgb25XaWxsU2VsZWN0VGFyZ2V0KC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUub25XaWxsU2VsZWN0VGFyZ2V0KC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIGVtaXRXaWxsU2VsZWN0VGFyZ2V0KC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUuZW1pdFdpbGxTZWxlY3RUYXJnZXQoLi4uYXJncykgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgb25EaWRTZWxlY3RUYXJnZXQoLi4uYXJncykgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5vbkRpZFNlbGVjdFRhcmdldCguLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBlbWl0RGlkU2VsZWN0VGFyZ2V0KC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUuZW1pdERpZFNlbGVjdFRhcmdldCguLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBvbkRpZEZhaWxTZWxlY3RUYXJnZXQoLi4uYXJncykgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5vbkRpZEZhaWxTZWxlY3RUYXJnZXQoLi4uYXJncykgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgZW1pdERpZEZhaWxTZWxlY3RUYXJnZXQoLi4uYXJncykgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5lbWl0RGlkRmFpbFNlbGVjdFRhcmdldCguLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBvbldpbGxGaW5pc2hNdXRhdGlvbiguLi5hcmdzKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLm9uV2lsbEZpbmlzaE11dGF0aW9uKC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIGVtaXRXaWxsRmluaXNoTXV0YXRpb24oLi4uYXJncykgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5lbWl0V2lsbEZpbmlzaE11dGF0aW9uKC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIG9uRGlkRmluaXNoTXV0YXRpb24oLi4uYXJncykgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5vbkRpZEZpbmlzaE11dGF0aW9uKC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIGVtaXREaWRGaW5pc2hNdXRhdGlvbiguLi5hcmdzKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLmVtaXREaWRGaW5pc2hNdXRhdGlvbiguLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBvbkRpZEZpbmlzaE9wZXJhdGlvbiguLi5hcmdzKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLm9uRGlkRmluaXNoT3BlcmF0aW9uKC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIG9uRGlkUmVzZXRPcGVyYXRpb25TdGFjayguLi5hcmdzKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLm9uRGlkUmVzZXRPcGVyYXRpb25TdGFjayguLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBvbkRpZENhbmNlbFNlbGVjdExpc3QoLi4uYXJncykgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5vbkRpZENhbmNlbFNlbGVjdExpc3QoLi4uYXJncykgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgc3Vic2NyaWJlKC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUuc3Vic2NyaWJlKC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIGlzTW9kZSguLi5hcmdzKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLmlzTW9kZSguLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBnZXRCbG9ja3dpc2VTZWxlY3Rpb25zKC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUuZ2V0QmxvY2t3aXNlU2VsZWN0aW9ucyguLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBnZXRMYXN0QmxvY2t3aXNlU2VsZWN0aW9uKC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUuZ2V0TGFzdEJsb2Nrd2lzZVNlbGVjdGlvbiguLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBhZGRUb0NsYXNzTGlzdCguLi5hcmdzKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLmFkZFRvQ2xhc3NMaXN0KC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIGdldENvbmZpZyguLi5hcmdzKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLmdldENvbmZpZyguLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuXG4gIC8vIFdyYXBwZXIgZm9yIHRoaXMudXRpbHNcbiAgLy89PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgZ2V0VmltRW9mQnVmZmVyUG9zaXRpb24oKSB7IHJldHVybiB0aGlzLnV0aWxzLmdldFZpbUVvZkJ1ZmZlclBvc2l0aW9uKHRoaXMuZWRpdG9yKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBnZXRWaW1MYXN0QnVmZmVyUm93KCkgeyByZXR1cm4gdGhpcy51dGlscy5nZXRWaW1MYXN0QnVmZmVyUm93KHRoaXMuZWRpdG9yKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBnZXRWaW1MYXN0U2NyZWVuUm93KCkgeyByZXR1cm4gdGhpcy51dGlscy5nZXRWaW1MYXN0U2NyZWVuUm93KHRoaXMuZWRpdG9yKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBnZXRWYWxpZFZpbUJ1ZmZlclJvdyhyb3cpIHsgcmV0dXJuIHRoaXMudXRpbHMuZ2V0VmFsaWRWaW1CdWZmZXJSb3codGhpcy5lZGl0b3IsIHJvdykgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgZ2V0VmFsaWRWaW1TY3JlZW5Sb3cocm93KSB7IHJldHVybiB0aGlzLnV0aWxzLmdldFZhbGlkVmltU2NyZWVuUm93KHRoaXMuZWRpdG9yLCByb3cpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIGdldFdvcmRCdWZmZXJSYW5nZUFuZEtpbmRBdEJ1ZmZlclBvc2l0aW9uKC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudXRpbHMuZ2V0V29yZEJ1ZmZlclJhbmdlQW5kS2luZEF0QnVmZmVyUG9zaXRpb24odGhpcy5lZGl0b3IsIC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIGdldEZpcnN0Q2hhcmFjdGVyUG9zaXRpb25Gb3JCdWZmZXJSb3cocm93KSB7IHJldHVybiB0aGlzLnV0aWxzLmdldEZpcnN0Q2hhcmFjdGVyUG9zaXRpb25Gb3JCdWZmZXJSb3codGhpcy5lZGl0b3IsIHJvdykgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgZ2V0QnVmZmVyUmFuZ2VGb3JSb3dSYW5nZShyb3dSYW5nZSkgeyByZXR1cm4gdGhpcy51dGlscy5nZXRCdWZmZXJSYW5nZUZvclJvd1JhbmdlKHRoaXMuZWRpdG9yLCByb3dSYW5nZSkgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgc2NhbkVkaXRvciguLi5hcmdzKSB7IHJldHVybiB0aGlzLnV0aWxzLnNjYW5FZGl0b3IodGhpcy5lZGl0b3IsIC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIGZpbmRJbkVkaXRvciguLi5hcmdzKSB7IHJldHVybiB0aGlzLnV0aWxzLmZpbmRJbkVkaXRvcih0aGlzLmVkaXRvciwgLi4uYXJncykgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgZmluZFBvaW50KC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudXRpbHMuZmluZFBvaW50KHRoaXMuZWRpdG9yLCAuLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICB0cmltQnVmZmVyUmFuZ2UoLi4uYXJncykgeyByZXR1cm4gdGhpcy51dGlscy50cmltQnVmZmVyUmFuZ2UodGhpcy5lZGl0b3IsIC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIGlzRW1wdHlSb3coLi4uYXJncykgeyByZXR1cm4gdGhpcy51dGlscy5pc0VtcHR5Um93KHRoaXMuZWRpdG9yLCAuLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBnZXRGb2xkU3RhcnRSb3dGb3JSb3coLi4uYXJncykgeyByZXR1cm4gdGhpcy51dGlscy5nZXRGb2xkU3RhcnRSb3dGb3JSb3codGhpcy5lZGl0b3IsIC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIGdldEZvbGRFbmRSb3dGb3JSb3coLi4uYXJncykgeyByZXR1cm4gdGhpcy51dGlscy5nZXRGb2xkRW5kUm93Rm9yUm93KHRoaXMuZWRpdG9yLCAuLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBnZXRCdWZmZXJSb3dzKC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudXRpbHMuZ2V0Um93cyh0aGlzLmVkaXRvciwgXCJidWZmZXJcIiwgLi4uYXJncykgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgZ2V0U2NyZWVuUm93cyguLi5hcmdzKSB7IHJldHVybiB0aGlzLnV0aWxzLmdldFJvd3ModGhpcy5lZGl0b3IsIFwic2NyZWVuXCIsIC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG59XG5cbm1vZHVsZS5leHBvcnRzID0gQmFzZVxuIl19