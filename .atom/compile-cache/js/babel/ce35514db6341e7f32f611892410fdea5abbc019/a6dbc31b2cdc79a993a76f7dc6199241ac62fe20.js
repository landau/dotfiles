"use babel";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, "next"); var callThrow = step.bind(null, "throw"); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

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

    // # How vmp commands become available?
    // #========================================
    // Vmp have many commands, loading full commands at startup slow down pkg activation.
    // So vmp load summary command table only at startup then lazy require command body on-used timing.
    // Here is how vmp commands are registerd and invoked.
    // Initially introduced in PR #758
    //
    // 1. [On dev]: Preparation done by developer
    //   - Invoking `Vim Mode Plus:Write Command Table And File Table To Disk`. it does following.
    //   - "./command-table.json" and "./file-table.json". are updated.
    //
    // 2. [On atom/vmp startup]
    //   - Register commands(e.g. `move-down`) from "./command-table.json".
    //
    // 3. [On run time]: e.g. Invoke `move-down` by `j` keystroke
    //   - Fire `move-down` command.
    //   - It execute `vimState.operationStack.run("MoveDown")`
    //   - Determine files to require from "./file-table.json".
    //   - Load `MoveDown` class by require('./motions') and run it!
    //
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
  }], [{
    key: "writeCommandTableAndFileTableToDisk",
    value: _asyncToGenerator(function* () {
      var path = require("path");
      var commandTablePath = path.join(__dirname, "command-table.json");
      var fileTablePath = path.join(__dirname, "file-table.json");

      var _buildCommandTableAndFileTable = this.buildCommandTableAndFileTable();

      var commandTable = _buildCommandTableAndFileTable.commandTable;
      var fileTable = _buildCommandTableAndFileTable.fileTable;

      var _ = require("underscore-plus");
      delete require.cache[commandTablePath]; // invalidate cache
      delete require.cache[fileTablePath]; // invalidate cache
      var needUpdateCommandTable = !_.isEqual(require(commandTablePath), commandTable);
      var needUpdateFileTable = !_.isEqual(require(fileTablePath), fileTable);

      if (!needUpdateCommandTable && !needUpdateFileTable) {
        atom.notifications.addInfo("No changfes in commandTable and fileTable", { dismissable: true });
        return;
      }

      var writeJSON = function writeJSON(filePath, object) {
        return atom.workspace.open(filePath, { activatePane: false, activateItem: false }).then(function (editor) {
          editor.setText(JSON.stringify(object));
          var baseName = path.basename(filePath);
          return editor.save().then(function () {
            return atom.notifications.addInfo("Updated " + baseName, { dismissable: true });
          });
        });
      };

      if (needUpdateCommandTable) yield writeJSON(commandTablePath, commandTable);
      if (needUpdateFileTable) yield writeJSON(fileTablePath, fileTable);
    })
  }, {
    key: "isCommand",
    value: function isCommand() {
      return this.hasOwnProperty("command") ? this.command : true;
    }
  }, {
    key: "buildCommandTableAndFileTable",
    value: function buildCommandTableAndFileTable() {
      // NOTE: changing order affects output of lib/command-table.json
      var filesToLoad = ["./operator", "./operator-insert", "./operator-transform-string", "./motion", "./motion-search", "./text-object", "./misc-command"];

      var fileTable = {};
      var commandTable = [];

      for (var file of filesToLoad) {
        fileTable[file] = [];

        for (var klass of Object.values(require(file))) {
          if (klass.name in fileTable) {
            throw new Error("Duplicate operation class " + klass.name + " in \"" + file + "\" and \"" + fileTable[klass.name] + "\"");
          }
          fileTable[file].push(klass.name);
          if (klass.isCommand()) commandTable.push(klass.getCommandName());
        }
      }
      return { commandTable: commandTable, fileTable: fileTable };
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
            var loaded = require("./file-table.json");
            Object.keys(loaded).forEach(function (file) {
              return loaded[file].forEach(function (name) {
                return FILE_TABLE[name] = file;
              });
            });
          })();
        }
        if (atom.inDevMode() && settings.get("debug")) {
          console.log("lazy-require: " + FILE_TABLE[name] + " for " + name);
        }
        Object.values(require(FILE_TABLE[name])).forEach(function (klass) {
          return klass.register();
        });
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
    value: function registerCommandFromSpec(klass, _ref) {
      var scope = _ref.scope;
      var name = _ref.name;
      var prefix = _ref.prefix;
      var getClass = _ref.getClass;

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
  }]);

  return Base;
})();

module.exports = Base;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL2Jhc2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsV0FBVyxDQUFBOzs7Ozs7OztBQUVYLElBQU0sUUFBUSxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQTtBQUN0QyxJQUFNLFFBQVEsR0FBRyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUE7O0FBRXZDLElBQUksVUFBVSxZQUFBO0lBQUUsVUFBVSxZQUFBLENBQUE7O0FBRTFCLFNBQVMsUUFBUSxDQUFDLENBQUMsRUFBRTtBQUNuQixTQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsVUFBQSxDQUFDO1dBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRTtHQUFBLENBQUMsQ0FBQTtDQUNsRjs7QUFFRCxTQUFTLFNBQVMsQ0FBQyxDQUFDLEVBQUU7QUFDcEIsU0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFBLENBQUUsT0FBTyxDQUFDLFFBQVEsRUFBRSxVQUFBLENBQUM7V0FBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLFdBQVcsRUFBRTtHQUFBLENBQUMsQ0FBQTtDQUN2Rjs7SUFFSyxJQUFJO2VBQUosSUFBSTs7U0FZQSxlQUFHO0FBQ1QsYUFBTyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQTtLQUM3Qjs7O1dBYm1CLEVBQUU7Ozs7V0FFQyxlQUFlOzs7O1dBQ2hCLElBQUk7Ozs7V0FDSCxJQUFJOzs7O0FBV2hCLFdBaEJQLElBQUksQ0FnQkksUUFBUSxFQUFFOzBCQWhCbEIsSUFBSTs7U0FPUixVQUFVLEdBQUcsS0FBSztTQUNsQixR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LEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQTs7O0FBRzlDLFlBQUksUUFBUSxFQUFFO0FBQ1osY0FBSSxDQUFDLEtBQUssRUFBRSxLQUFLLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQTtBQUNoRSxrQkFBUSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQTtTQUNoRTtBQUNELGFBQUssQ0FBQyxlQUFlLEVBQUUsQ0FBQTtPQUN4QixDQUFDLENBQUE7S0FDSDs7O1dBRTJCLCtCQUFDLE9BQU8sRUFBRTtBQUNwQyxVQUFNLG9CQUFvQixHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsaUJBQWlCLEVBQUUsRUFBRSxDQUFDLENBQUE7QUFDbkUsVUFBTSxnQkFBZ0IsR0FBRyxRQUFRLENBQUMsb0JBQW9CLENBQUMsQ0FBQTtBQUN2RCxVQUFJLGdCQUFnQixJQUFJLElBQUksQ0FBQyxVQUFVLEVBQUU7QUFDdkMsZUFBTyxJQUFJLENBQUMsVUFBVSxDQUFDLGdCQUFnQixDQUFDLENBQUMsYUFBYSxDQUFBO09BQ3ZEO0tBQ0Y7OztTQWhWRyxJQUFJOzs7QUFtWlYsTUFBTSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUEiLCJmaWxlIjoiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvYmFzZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIlwidXNlIGJhYmVsXCJcblxuY29uc3Qgc2V0dGluZ3MgPSByZXF1aXJlKFwiLi9zZXR0aW5nc1wiKVxuY29uc3QgVmltU3RhdGUgPSByZXF1aXJlKFwiLi92aW0tc3RhdGVcIilcblxubGV0IHNlbGVjdExpc3QsIEZJTEVfVEFCTEVcblxuZnVuY3Rpb24gY2xhc3NpZnkocykge1xuICByZXR1cm4gc1swXS50b1VwcGVyQ2FzZSgpICsgcy5zbGljZSgxKS5yZXBsYWNlKC8tKFxcdykvZywgbSA9PiBtWzFdLnRvVXBwZXJDYXNlKCkpXG59XG5cbmZ1bmN0aW9uIGRhc2hlcml6ZShzKSB7XG4gIHJldHVybiAoc1swXS50b0xvd2VyQ2FzZSgpICsgcy5zbGljZSgxKSkucmVwbGFjZSgvW0EtWl0vZywgbSA9PiBcIi1cIiArIG0udG9Mb3dlckNhc2UoKSlcbn1cblxuY2xhc3MgQmFzZSB7XG4gIHN0YXRpYyBjbGFzc1RhYmxlID0ge31cblxuICBzdGF0aWMgY29tbWFuZFByZWZpeCA9IFwidmltLW1vZGUtcGx1c1wiXG4gIHN0YXRpYyBjb21tYW5kU2NvcGUgPSBudWxsXG4gIHN0YXRpYyBvcGVyYXRpb25LaW5kID0gbnVsbFxuXG4gIHJlY29yZGFibGUgPSBmYWxzZVxuICByZXBlYXRlZCA9IGZhbHNlXG4gIGNvdW50ID0gbnVsbFxuICBkZWZhdWx0Q291bnQgPSAxXG5cbiAgZ2V0IG5hbWUoKSB7XG4gICAgcmV0dXJuIHRoaXMuY29uc3RydWN0b3IubmFtZVxuICB9XG5cbiAgY29uc3RydWN0b3IodmltU3RhdGUpIHtcbiAgICB0aGlzLnZpbVN0YXRlID0gdmltU3RhdGVcbiAgfVxuXG4gIGluaXRpYWxpemUoKSB7fVxuXG4gIC8vIENhbGxlZCBib3RoIG9uIGNhbmNlbCBhbmQgc3VjY2Vzc1xuICByZXNldFN0YXRlKCkge31cblxuICAvLyBPcGVyYXRpb25TdGFjayBwb3N0cG9uZSBleGVjdXRpb24gdW50aWxsIGlzUmVhZHkoKSBnZXQgdHJ1ZSwgb3ZlcnJpZGRlbiBvbiBzdWJjbGFzcy5cbiAgaXNSZWFkeSgpIHtcbiAgICByZXR1cm4gdHJ1ZVxuICB9XG5cbiAgLy8gVmlzdWFsTW9kZVNlbGVjdCBpcyBhbm9ybWFsLCBzaW5jZSBpdCBhdXRvIGNvbXBsZW1lbnRlZCBpbiB2aXNpYWwgbW9kZS5cbiAgLy8gSW4gb3RoZXIgd29yZCwgbm9ybWFsLW9wZXJhdG9yIGlzIGV4cGxpY2l0IHdoZXJlYXMgYW5vcm1hbC1vcGVyYXRvciBpcyBpbnBsaWNpdC5cbiAgaXNUYXJnZXRPZk5vcm1hbE9wZXJhdG9yKCkge1xuICAgIHJldHVybiB0aGlzLm9wZXJhdG9yICYmIHRoaXMub3BlcmF0b3IubmFtZSAhPT0gXCJWaXN1YWxNb2RlU2VsZWN0XCJcbiAgfVxuXG4gIGdldENvdW50KG9mZnNldCA9IDApIHtcbiAgICBpZiAodGhpcy5jb3VudCA9PSBudWxsKSB7XG4gICAgICB0aGlzLmNvdW50ID0gdGhpcy52aW1TdGF0ZS5oYXNDb3VudCgpID8gdGhpcy52aW1TdGF0ZS5nZXRDb3VudCgpIDogdGhpcy5kZWZhdWx0Q291bnRcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuY291bnQgKyBvZmZzZXRcbiAgfVxuXG4gIHJlc2V0Q291bnQoKSB7XG4gICAgdGhpcy5jb3VudCA9IG51bGxcbiAgfVxuXG4gIGNvdW50VGltZXMobGFzdCwgZm4pIHtcbiAgICBpZiAobGFzdCA8IDEpIHJldHVyblxuXG4gICAgbGV0IHN0b3BwZWQgPSBmYWxzZVxuICAgIGNvbnN0IHN0b3AgPSAoKSA9PiAoc3RvcHBlZCA9IHRydWUpXG4gICAgZm9yIChsZXQgY291bnQgPSAxOyBjb3VudCA8PSBsYXN0OyBjb3VudCsrKSB7XG4gICAgICBmbih7Y291bnQsIGlzRmluYWw6IGNvdW50ID09PSBsYXN0LCBzdG9wfSlcbiAgICAgIGlmIChzdG9wcGVkKSBicmVha1xuICAgIH1cbiAgfVxuXG4gIGFjdGl2YXRlTW9kZShtb2RlLCBzdWJtb2RlKSB7XG4gICAgdGhpcy5vbkRpZEZpbmlzaE9wZXJhdGlvbigoKSA9PiB0aGlzLnZpbVN0YXRlLmFjdGl2YXRlKG1vZGUsIHN1Ym1vZGUpKVxuICB9XG5cbiAgYWN0aXZhdGVNb2RlSWZOZWNlc3NhcnkobW9kZSwgc3VibW9kZSkge1xuICAgIGlmICghdGhpcy52aW1TdGF0ZS5pc01vZGUobW9kZSwgc3VibW9kZSkpIHtcbiAgICAgIHRoaXMuYWN0aXZhdGVNb2RlKG1vZGUsIHN1Ym1vZGUpXG4gICAgfVxuICB9XG5cbiAgZ2V0SW5zdGFuY2UobmFtZSwgcHJvcGVydGllcykge1xuICAgIHJldHVybiB0aGlzLmNvbnN0cnVjdG9yLmdldEluc3RhbmNlKHRoaXMudmltU3RhdGUsIG5hbWUsIHByb3BlcnRpZXMpXG4gIH1cblxuICBjYW5jZWxPcGVyYXRpb24oKSB7XG4gICAgdGhpcy52aW1TdGF0ZS5vcGVyYXRpb25TdGFjay5jYW5jZWwodGhpcylcbiAgfVxuXG4gIHByb2Nlc3NPcGVyYXRpb24oKSB7XG4gICAgdGhpcy52aW1TdGF0ZS5vcGVyYXRpb25TdGFjay5wcm9jZXNzKClcbiAgfVxuXG4gIGZvY3VzU2VsZWN0TGlzdChvcHRpb25zID0ge30pIHtcbiAgICB0aGlzLm9uRGlkQ2FuY2VsU2VsZWN0TGlzdCgoKSA9PiB0aGlzLmNhbmNlbE9wZXJhdGlvbigpKVxuICAgIGlmICghc2VsZWN0TGlzdCkge1xuICAgICAgc2VsZWN0TGlzdCA9IG5ldyAocmVxdWlyZShcIi4vc2VsZWN0LWxpc3RcIikpKClcbiAgICB9XG4gICAgc2VsZWN0TGlzdC5zaG93KHRoaXMudmltU3RhdGUsIG9wdGlvbnMpXG4gIH1cblxuICBmb2N1c0lucHV0KG9wdGlvbnMgPSB7fSkge1xuICAgIGlmICghb3B0aW9ucy5vbkNvbmZpcm0pIHtcbiAgICAgIG9wdGlvbnMub25Db25maXJtID0gaW5wdXQgPT4ge1xuICAgICAgICB0aGlzLmlucHV0ID0gaW5wdXRcbiAgICAgICAgdGhpcy5wcm9jZXNzT3BlcmF0aW9uKClcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKCFvcHRpb25zLm9uQ2FuY2VsKSBvcHRpb25zLm9uQ2FuY2VsID0gKCkgPT4gdGhpcy5jYW5jZWxPcGVyYXRpb24oKVxuICAgIGlmICghb3B0aW9ucy5vbkNoYW5nZSkgb3B0aW9ucy5vbkNoYW5nZSA9IGlucHV0ID0+IHRoaXMudmltU3RhdGUuaG92ZXIuc2V0KGlucHV0KVxuXG4gICAgdGhpcy52aW1TdGF0ZS5mb2N1c0lucHV0KG9wdGlvbnMpXG4gIH1cblxuICAvLyBSZXR1cm4gcHJvbWlzZSB3aGljaCByZXNvbHZlIHdpdGggaW5wdXQgY2hhciBvciBgdW5kZWZpbmVkYCB3aGVuIGNhbmNlbGxlZC5cbiAgZm9jdXNJbnB1dFByb21pc2VkKG9wdGlvbnMgPSB7fSkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICAgIGNvbnN0IGRlZmF1bHRPcHRpb25zID0ge2hpZGVDdXJzb3I6IHRydWUsIG9uQ2hhbmdlOiBpbnB1dCA9PiB0aGlzLnZpbVN0YXRlLmhvdmVyLnNldChpbnB1dCl9XG4gICAgICB0aGlzLnZpbVN0YXRlLmZvY3VzSW5wdXQoT2JqZWN0LmFzc2lnbihkZWZhdWx0T3B0aW9ucywgb3B0aW9ucywge29uQ29uZmlybTogcmVzb2x2ZSwgb25DYW5jZWw6IHJlc29sdmV9KSlcbiAgICB9KVxuICB9XG5cbiAgcmVhZENoYXIoKSB7XG4gICAgdGhpcy52aW1TdGF0ZS5yZWFkQ2hhcih7XG4gICAgICBvbkNvbmZpcm06IGlucHV0ID0+IHtcbiAgICAgICAgdGhpcy5pbnB1dCA9IGlucHV0XG4gICAgICAgIHRoaXMucHJvY2Vzc09wZXJhdGlvbigpXG4gICAgICB9LFxuICAgICAgb25DYW5jZWw6ICgpID0+IHRoaXMuY2FuY2VsT3BlcmF0aW9uKCksXG4gICAgfSlcbiAgfVxuXG4gIC8vIFJldHVybiBwcm9taXNlIHdoaWNoIHJlc29sdmUgd2l0aCByZWFkIGNoYXIgb3IgYHVuZGVmaW5lZGAgd2hlbiBjYW5jZWxsZWQuXG4gIHJlYWRDaGFyUHJvbWlzZWQoKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgICAgdGhpcy52aW1TdGF0ZS5yZWFkQ2hhcih7b25Db25maXJtOiByZXNvbHZlLCBvbkNhbmNlbDogcmVzb2x2ZX0pXG4gICAgfSlcbiAgfVxuXG4gIGluc3RhbmNlb2Yoa2xhc3NOYW1lKSB7XG4gICAgcmV0dXJuIHRoaXMgaW5zdGFuY2VvZiBCYXNlLmdldENsYXNzKGtsYXNzTmFtZSlcbiAgfVxuXG4gIGlzT3BlcmF0b3IoKSB7XG4gICAgLy8gRG9uJ3QgdXNlIGBpbnN0YW5jZW9mYCB0byBwb3N0cG9uZSByZXF1aXJlIGZvciBmYXN0ZXIgYWN0aXZhdGlvbi5cbiAgICByZXR1cm4gdGhpcy5jb25zdHJ1Y3Rvci5vcGVyYXRpb25LaW5kID09PSBcIm9wZXJhdG9yXCJcbiAgfVxuXG4gIGlzTW90aW9uKCkge1xuICAgIC8vIERvbid0IHVzZSBgaW5zdGFuY2VvZmAgdG8gcG9zdHBvbmUgcmVxdWlyZSBmb3IgZmFzdGVyIGFjdGl2YXRpb24uXG4gICAgcmV0dXJuIHRoaXMuY29uc3RydWN0b3Iub3BlcmF0aW9uS2luZCA9PT0gXCJtb3Rpb25cIlxuICB9XG5cbiAgaXNUZXh0T2JqZWN0KCkge1xuICAgIC8vIERvbid0IHVzZSBgaW5zdGFuY2VvZmAgdG8gcG9zdHBvbmUgcmVxdWlyZSBmb3IgZmFzdGVyIGFjdGl2YXRpb24uXG4gICAgcmV0dXJuIHRoaXMuY29uc3RydWN0b3Iub3BlcmF0aW9uS2luZCA9PT0gXCJ0ZXh0LW9iamVjdFwiXG4gIH1cblxuICBnZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRCdWZmZXJQb3NpdGlvbkZvckN1cnNvcih0aGlzLmVkaXRvci5nZXRMYXN0Q3Vyc29yKCkpXG4gIH1cblxuICBnZXRDdXJzb3JCdWZmZXJQb3NpdGlvbnMoKSB7XG4gICAgcmV0dXJuIHRoaXMuZWRpdG9yLmdldEN1cnNvcnMoKS5tYXAoY3Vyc29yID0+IHRoaXMuZ2V0QnVmZmVyUG9zaXRpb25Gb3JDdXJzb3IoY3Vyc29yKSlcbiAgfVxuXG4gIGdldEN1cnNvckJ1ZmZlclBvc2l0aW9uc09yZGVyZWQoKSB7XG4gICAgcmV0dXJuIHRoaXMudXRpbHMuc29ydFBvaW50cyh0aGlzLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9ucygpKVxuICB9XG5cbiAgZ2V0QnVmZmVyUG9zaXRpb25Gb3JDdXJzb3IoY3Vyc29yKSB7XG4gICAgcmV0dXJuIHRoaXMubW9kZSA9PT0gXCJ2aXN1YWxcIiA/IHRoaXMuZ2V0Q3Vyc29yUG9zaXRpb25Gb3JTZWxlY3Rpb24oY3Vyc29yLnNlbGVjdGlvbikgOiBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuICB9XG5cbiAgZ2V0Q3Vyc29yUG9zaXRpb25Gb3JTZWxlY3Rpb24oc2VsZWN0aW9uKSB7XG4gICAgcmV0dXJuIHRoaXMuc3dyYXAoc2VsZWN0aW9uKS5nZXRCdWZmZXJQb3NpdGlvbkZvcihcImhlYWRcIiwge2Zyb206IFtcInByb3BlcnR5XCIsIFwic2VsZWN0aW9uXCJdfSlcbiAgfVxuXG4gIGdldE9wZXJhdGlvblR5cGVDaGFyKCkge1xuICAgIHJldHVybiB7b3BlcmF0b3I6IFwiT1wiLCBcInRleHQtb2JqZWN0XCI6IFwiVFwiLCBtb3Rpb246IFwiTVwiLCBcIm1pc2MtY29tbWFuZFwiOiBcIlhcIn1bdGhpcy5jb25zdHJ1Y3Rvci5vcGVyYXRpb25LaW5kXVxuICB9XG5cbiAgdG9TdHJpbmcoKSB7XG4gICAgY29uc3QgYmFzZSA9IGAke3RoaXMubmFtZX08JHt0aGlzLmdldE9wZXJhdGlvblR5cGVDaGFyKCl9PmBcbiAgICByZXR1cm4gdGhpcy50YXJnZXQgPyBgJHtiYXNlfXt0YXJnZXQgPSAke3RoaXMudGFyZ2V0LnRvU3RyaW5nKCl9fWAgOiBiYXNlXG4gIH1cblxuICBnZXRDb21tYW5kTmFtZSgpIHtcbiAgICByZXR1cm4gdGhpcy5jb25zdHJ1Y3Rvci5nZXRDb21tYW5kTmFtZSgpXG4gIH1cblxuICBnZXRDb21tYW5kTmFtZVdpdGhvdXRQcmVmaXgoKSB7XG4gICAgcmV0dXJuIHRoaXMuY29uc3RydWN0b3IuZ2V0Q29tbWFuZE5hbWVXaXRob3V0UHJlZml4KClcbiAgfVxuXG4gIC8vICMgSG93IHZtcCBjb21tYW5kcyBiZWNvbWUgYXZhaWxhYmxlP1xuICAvLyAjPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAvLyBWbXAgaGF2ZSBtYW55IGNvbW1hbmRzLCBsb2FkaW5nIGZ1bGwgY29tbWFuZHMgYXQgc3RhcnR1cCBzbG93IGRvd24gcGtnIGFjdGl2YXRpb24uXG4gIC8vIFNvIHZtcCBsb2FkIHN1bW1hcnkgY29tbWFuZCB0YWJsZSBvbmx5IGF0IHN0YXJ0dXAgdGhlbiBsYXp5IHJlcXVpcmUgY29tbWFuZCBib2R5IG9uLXVzZWQgdGltaW5nLlxuICAvLyBIZXJlIGlzIGhvdyB2bXAgY29tbWFuZHMgYXJlIHJlZ2lzdGVyZCBhbmQgaW52b2tlZC5cbiAgLy8gSW5pdGlhbGx5IGludHJvZHVjZWQgaW4gUFIgIzc1OFxuICAvL1xuICAvLyAxLiBbT24gZGV2XTogUHJlcGFyYXRpb24gZG9uZSBieSBkZXZlbG9wZXJcbiAgLy8gICAtIEludm9raW5nIGBWaW0gTW9kZSBQbHVzOldyaXRlIENvbW1hbmQgVGFibGUgQW5kIEZpbGUgVGFibGUgVG8gRGlza2AuIGl0IGRvZXMgZm9sbG93aW5nLlxuICAvLyAgIC0gXCIuL2NvbW1hbmQtdGFibGUuanNvblwiIGFuZCBcIi4vZmlsZS10YWJsZS5qc29uXCIuIGFyZSB1cGRhdGVkLlxuICAvL1xuICAvLyAyLiBbT24gYXRvbS92bXAgc3RhcnR1cF1cbiAgLy8gICAtIFJlZ2lzdGVyIGNvbW1hbmRzKGUuZy4gYG1vdmUtZG93bmApIGZyb20gXCIuL2NvbW1hbmQtdGFibGUuanNvblwiLlxuICAvL1xuICAvLyAzLiBbT24gcnVuIHRpbWVdOiBlLmcuIEludm9rZSBgbW92ZS1kb3duYCBieSBgamAga2V5c3Ryb2tlXG4gIC8vICAgLSBGaXJlIGBtb3ZlLWRvd25gIGNvbW1hbmQuXG4gIC8vICAgLSBJdCBleGVjdXRlIGB2aW1TdGF0ZS5vcGVyYXRpb25TdGFjay5ydW4oXCJNb3ZlRG93blwiKWBcbiAgLy8gICAtIERldGVybWluZSBmaWxlcyB0byByZXF1aXJlIGZyb20gXCIuL2ZpbGUtdGFibGUuanNvblwiLlxuICAvLyAgIC0gTG9hZCBgTW92ZURvd25gIGNsYXNzIGJ5IHJlcXVpcmUoJy4vbW90aW9ucycpIGFuZCBydW4gaXQhXG4gIC8vXG4gIHN0YXRpYyBhc3luYyB3cml0ZUNvbW1hbmRUYWJsZUFuZEZpbGVUYWJsZVRvRGlzaygpIHtcbiAgICBjb25zdCBwYXRoID0gcmVxdWlyZShcInBhdGhcIilcbiAgICBjb25zdCBjb21tYW5kVGFibGVQYXRoID0gcGF0aC5qb2luKF9fZGlybmFtZSwgXCJjb21tYW5kLXRhYmxlLmpzb25cIilcbiAgICBjb25zdCBmaWxlVGFibGVQYXRoID0gcGF0aC5qb2luKF9fZGlybmFtZSwgXCJmaWxlLXRhYmxlLmpzb25cIilcblxuICAgIGNvbnN0IHtjb21tYW5kVGFibGUsIGZpbGVUYWJsZX0gPSB0aGlzLmJ1aWxkQ29tbWFuZFRhYmxlQW5kRmlsZVRhYmxlKClcbiAgICBjb25zdCBfID0gcmVxdWlyZShcInVuZGVyc2NvcmUtcGx1c1wiKVxuICAgIGRlbGV0ZSByZXF1aXJlLmNhY2hlW2NvbW1hbmRUYWJsZVBhdGhdIC8vIGludmFsaWRhdGUgY2FjaGVcbiAgICBkZWxldGUgcmVxdWlyZS5jYWNoZVtmaWxlVGFibGVQYXRoXSAvLyBpbnZhbGlkYXRlIGNhY2hlXG4gICAgY29uc3QgbmVlZFVwZGF0ZUNvbW1hbmRUYWJsZSA9ICFfLmlzRXF1YWwocmVxdWlyZShjb21tYW5kVGFibGVQYXRoKSwgY29tbWFuZFRhYmxlKVxuICAgIGNvbnN0IG5lZWRVcGRhdGVGaWxlVGFibGUgPSAhXy5pc0VxdWFsKHJlcXVpcmUoZmlsZVRhYmxlUGF0aCksIGZpbGVUYWJsZSlcblxuICAgIGlmICghbmVlZFVwZGF0ZUNvbW1hbmRUYWJsZSAmJiAhbmVlZFVwZGF0ZUZpbGVUYWJsZSkge1xuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEluZm8oXCJObyBjaGFuZ2ZlcyBpbiBjb21tYW5kVGFibGUgYW5kIGZpbGVUYWJsZVwiLCB7ZGlzbWlzc2FibGU6IHRydWV9KVxuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgY29uc3Qgd3JpdGVKU09OID0gKGZpbGVQYXRoLCBvYmplY3QpID0+IHtcbiAgICAgIHJldHVybiBhdG9tLndvcmtzcGFjZS5vcGVuKGZpbGVQYXRoLCB7YWN0aXZhdGVQYW5lOiBmYWxzZSwgYWN0aXZhdGVJdGVtOiBmYWxzZX0pLnRoZW4oZWRpdG9yID0+IHtcbiAgICAgICAgZWRpdG9yLnNldFRleHQoSlNPTi5zdHJpbmdpZnkob2JqZWN0KSlcbiAgICAgICAgY29uc3QgYmFzZU5hbWUgPSBwYXRoLmJhc2VuYW1lKGZpbGVQYXRoKVxuICAgICAgICByZXR1cm4gZWRpdG9yLnNhdmUoKS50aGVuKCgpID0+IGF0b20ubm90aWZpY2F0aW9ucy5hZGRJbmZvKGBVcGRhdGVkICR7YmFzZU5hbWV9YCwge2Rpc21pc3NhYmxlOiB0cnVlfSkpXG4gICAgICB9KVxuICAgIH1cblxuICAgIGlmIChuZWVkVXBkYXRlQ29tbWFuZFRhYmxlKSBhd2FpdCB3cml0ZUpTT04oY29tbWFuZFRhYmxlUGF0aCwgY29tbWFuZFRhYmxlKVxuICAgIGlmIChuZWVkVXBkYXRlRmlsZVRhYmxlKSBhd2FpdCB3cml0ZUpTT04oZmlsZVRhYmxlUGF0aCwgZmlsZVRhYmxlKVxuICB9XG5cbiAgc3RhdGljIGlzQ29tbWFuZCgpIHtcbiAgICByZXR1cm4gdGhpcy5oYXNPd25Qcm9wZXJ0eShcImNvbW1hbmRcIikgPyB0aGlzLmNvbW1hbmQgOiB0cnVlXG4gIH1cblxuICBzdGF0aWMgYnVpbGRDb21tYW5kVGFibGVBbmRGaWxlVGFibGUoKSB7XG4gICAgLy8gTk9URTogY2hhbmdpbmcgb3JkZXIgYWZmZWN0cyBvdXRwdXQgb2YgbGliL2NvbW1hbmQtdGFibGUuanNvblxuICAgIGNvbnN0IGZpbGVzVG9Mb2FkID0gW1xuICAgICAgXCIuL29wZXJhdG9yXCIsXG4gICAgICBcIi4vb3BlcmF0b3ItaW5zZXJ0XCIsXG4gICAgICBcIi4vb3BlcmF0b3ItdHJhbnNmb3JtLXN0cmluZ1wiLFxuICAgICAgXCIuL21vdGlvblwiLFxuICAgICAgXCIuL21vdGlvbi1zZWFyY2hcIixcbiAgICAgIFwiLi90ZXh0LW9iamVjdFwiLFxuICAgICAgXCIuL21pc2MtY29tbWFuZFwiLFxuICAgIF1cblxuICAgIGNvbnN0IGZpbGVUYWJsZSA9IHt9XG4gICAgY29uc3QgY29tbWFuZFRhYmxlID0gW11cblxuICAgIGZvciAoY29uc3QgZmlsZSBvZiBmaWxlc1RvTG9hZCkge1xuICAgICAgZmlsZVRhYmxlW2ZpbGVdID0gW11cblxuICAgICAgZm9yIChjb25zdCBrbGFzcyBvZiBPYmplY3QudmFsdWVzKHJlcXVpcmUoZmlsZSkpKSB7XG4gICAgICAgIGlmIChrbGFzcy5uYW1lIGluIGZpbGVUYWJsZSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgRHVwbGljYXRlIG9wZXJhdGlvbiBjbGFzcyAke2tsYXNzLm5hbWV9IGluIFwiJHtmaWxlfVwiIGFuZCBcIiR7ZmlsZVRhYmxlW2tsYXNzLm5hbWVdfVwiYClcbiAgICAgICAgfVxuICAgICAgICBmaWxlVGFibGVbZmlsZV0ucHVzaChrbGFzcy5uYW1lKVxuICAgICAgICBpZiAoa2xhc3MuaXNDb21tYW5kKCkpIGNvbW1hbmRUYWJsZS5wdXNoKGtsYXNzLmdldENvbW1hbmROYW1lKCkpXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB7Y29tbWFuZFRhYmxlLCBmaWxlVGFibGV9XG4gIH1cblxuICAvLyBSZXR1cm4gZGlzcG9zYWJsZXMgZm9yIHZtcCBjb21tYW5kcy5cbiAgc3RhdGljIGluaXQoKSB7XG4gICAgcmV0dXJuIHJlcXVpcmUoXCIuL2NvbW1hbmQtdGFibGUuanNvblwiKS5tYXAobmFtZSA9PiB0aGlzLnJlZ2lzdGVyQ29tbWFuZEZyb21TcGVjKG51bGwsIHtuYW1lfSkpXG4gIH1cblxuICBzdGF0aWMgZ2V0Q2xhc3MobmFtZSkge1xuICAgIGlmICghKG5hbWUgaW4gdGhpcy5jbGFzc1RhYmxlKSkge1xuICAgICAgaWYgKCFGSUxFX1RBQkxFKSB7XG4gICAgICAgIEZJTEVfVEFCTEUgPSB7fVxuICAgICAgICBjb25zdCBsb2FkZWQgPSByZXF1aXJlKFwiLi9maWxlLXRhYmxlLmpzb25cIilcbiAgICAgICAgT2JqZWN0LmtleXMobG9hZGVkKS5mb3JFYWNoKGZpbGUgPT4gbG9hZGVkW2ZpbGVdLmZvckVhY2gobmFtZSA9PiAoRklMRV9UQUJMRVtuYW1lXSA9IGZpbGUpKSlcbiAgICAgIH1cbiAgICAgIGlmIChhdG9tLmluRGV2TW9kZSgpICYmIHNldHRpbmdzLmdldChcImRlYnVnXCIpKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGBsYXp5LXJlcXVpcmU6ICR7RklMRV9UQUJMRVtuYW1lXX0gZm9yICR7bmFtZX1gKVxuICAgICAgfVxuICAgICAgT2JqZWN0LnZhbHVlcyhyZXF1aXJlKEZJTEVfVEFCTEVbbmFtZV0pKS5mb3JFYWNoKGtsYXNzID0+IGtsYXNzLnJlZ2lzdGVyKCkpXG4gICAgfVxuICAgIGlmIChuYW1lIGluIHRoaXMuY2xhc3NUYWJsZSkgcmV0dXJuIHRoaXMuY2xhc3NUYWJsZVtuYW1lXVxuICAgIHRocm93IG5ldyBFcnJvcihgY2xhc3MgJyR7bmFtZX0nIG5vdCBmb3VuZGApXG4gIH1cblxuICBzdGF0aWMgZ2V0SW5zdGFuY2UodmltU3RhdGUsIGtsYXNzLCBwcm9wZXJ0aWVzKSB7XG4gICAga2xhc3MgPSB0eXBlb2Yga2xhc3MgPT09IFwiZnVuY3Rpb25cIiA/IGtsYXNzIDogQmFzZS5nZXRDbGFzcyhrbGFzcylcbiAgICBjb25zdCBvYmplY3QgPSBuZXcga2xhc3ModmltU3RhdGUpXG4gICAgaWYgKHByb3BlcnRpZXMpIE9iamVjdC5hc3NpZ24ob2JqZWN0LCBwcm9wZXJ0aWVzKVxuICAgIG9iamVjdC5pbml0aWFsaXplKClcbiAgICByZXR1cm4gb2JqZWN0XG4gIH1cblxuICAvLyBEb250IHJlbW92ZSB0aGlzLiBQdWJsaWMgQVBJIHRvIHJlZ2lzdGVyIG9wZXJhdGlvbnMgdG8gY2xhc3NUYWJsZVxuICAvLyBUaGlzIGNhbiBiZSB1c2VkIGZyb20gdm1wLXBsdWdpbiBzdWNoIGFzIHZtcC1leC1tb2RlLlxuICBzdGF0aWMgcmVnaXN0ZXIoKSB7XG4gICAgaWYgKHRoaXMubmFtZSBpbiB0aGlzLmNsYXNzVGFibGUpIGNvbnNvbGUud2FybihgRHVwbGljYXRlIGNvbnN0cnVjdG9yICR7dGhpcy5uYW1lfWApXG4gICAgdGhpcy5jbGFzc1RhYmxlW3RoaXMubmFtZV0gPSB0aGlzXG4gIH1cblxuICBzdGF0aWMgZ2V0Q29tbWFuZE5hbWUocHJlZml4ID0gdGhpcy5jb21tYW5kUHJlZml4LCBuYW1lID0gdGhpcy5uYW1lKSB7XG4gICAgcmV0dXJuIHByZWZpeCArIFwiOlwiICsgZGFzaGVyaXplKG5hbWUpXG4gIH1cblxuICBzdGF0aWMgZ2V0Q29tbWFuZE5hbWVXaXRob3V0UHJlZml4KCkge1xuICAgIHJldHVybiBkYXNoZXJpemUodGhpcy5uYW1lKVxuICB9XG5cbiAgc3RhdGljIHJlZ2lzdGVyQ29tbWFuZCgpIHtcbiAgICByZXR1cm4gdGhpcy5yZWdpc3RlckNvbW1hbmRGcm9tU3BlYyh0aGlzLm5hbWUsIHtcbiAgICAgIHNjb3BlOiB0aGlzLmNvbW1hbmRTY29wZSxcbiAgICAgIG5hbWU6IHRoaXMuZ2V0Q29tbWFuZE5hbWUoKSxcbiAgICAgIGdldENsYXNzOiAoKSA9PiB0aGlzLFxuICAgIH0pXG4gIH1cblxuICBzdGF0aWMgcmVnaXN0ZXJDb21tYW5kRnJvbVNwZWMoa2xhc3MsIHtzY29wZSwgbmFtZSwgcHJlZml4LCBnZXRDbGFzc30pIHtcbiAgICBpZiAoIW5hbWUpIG5hbWUgPSB0aGlzLmdldENvbW1hbmROYW1lKHByZWZpeCwga2xhc3MpXG4gICAgcmV0dXJuIGF0b20uY29tbWFuZHMuYWRkKHNjb3BlIHx8IFwiYXRvbS10ZXh0LWVkaXRvclwiLCBuYW1lLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgY29uc3QgdmltU3RhdGUgPSBWaW1TdGF0ZS5nZXQodGhpcy5nZXRNb2RlbCgpKVxuXG4gICAgICAvLyB2aW1TdGF0ZSBwb3NzaWJseSBiZSB1bmRlZmluZWQgU2VlICM4NVxuICAgICAgaWYgKHZpbVN0YXRlKSB7XG4gICAgICAgIGlmICgha2xhc3MpIGtsYXNzID0gY2xhc3NpZnkobmFtZS5yZXBsYWNlKFwidmltLW1vZGUtcGx1czpcIiwgXCJcIikpXG4gICAgICAgIHZpbVN0YXRlLm9wZXJhdGlvblN0YWNrLnJ1bihnZXRDbGFzcyA/IGdldENsYXNzKGtsYXNzKSA6IGtsYXNzKVxuICAgICAgfVxuICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcbiAgICB9KVxuICB9XG5cbiAgc3RhdGljIGdldEtpbmRGb3JDb21tYW5kTmFtZShjb21tYW5kKSB7XG4gICAgY29uc3QgY29tbWFuZFdpdGhvdXRQcmVmaXggPSBjb21tYW5kLnJlcGxhY2UoL152aW0tbW9kZS1wbHVzOi8sIFwiXCIpXG4gICAgY29uc3QgY29tbWFuZENsYXNzTmFtZSA9IGNsYXNzaWZ5KGNvbW1hbmRXaXRob3V0UHJlZml4KVxuICAgIGlmIChjb21tYW5kQ2xhc3NOYW1lIGluIHRoaXMuY2xhc3NUYWJsZSkge1xuICAgICAgcmV0dXJuIHRoaXMuY2xhc3NUYWJsZVtjb21tYW5kQ2xhc3NOYW1lXS5vcGVyYXRpb25LaW5kXG4gICAgfVxuICB9XG5cbiAgZ2V0U21vb3RoU2Nyb2xsRHVhdGlvbihraW5kKSB7XG4gICAgY29uc3QgYmFzZSA9IFwic21vb3RoU2Nyb2xsT25cIiArIGtpbmRcbiAgICByZXR1cm4gdGhpcy5nZXRDb25maWcoYmFzZSkgPyB0aGlzLmdldENvbmZpZyhiYXNlICsgXCJEdXJhdGlvblwiKSA6IDBcbiAgfVxuXG4gIC8vIFByb3h5IHByb3BwZXJ0aWVzIGFuZCBtZXRob2RzXG4gIC8vPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gIGdldCBtb2RlKCkgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5tb2RlIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIGdldCBzdWJtb2RlKCkgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5zdWJtb2RlIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIGdldCBzd3JhcCgpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUuc3dyYXAgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgZ2V0IHV0aWxzKCkgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS51dGlscyB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBnZXQgZWRpdG9yKCkgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5lZGl0b3IgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgZ2V0IGVkaXRvckVsZW1lbnQoKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLmVkaXRvckVsZW1lbnQgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgZ2V0IGdsb2JhbFN0YXRlKCkgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5nbG9iYWxTdGF0ZSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBnZXQgbXV0YXRpb25NYW5hZ2VyKCkgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5tdXRhdGlvbk1hbmFnZXIgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgZ2V0IG9jY3VycmVuY2VNYW5hZ2VyKCkgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5vY2N1cnJlbmNlTWFuYWdlciB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBnZXQgcGVyc2lzdGVudFNlbGVjdGlvbigpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUucGVyc2lzdGVudFNlbGVjdGlvbiB9IC8vIHByZXR0aWVyLWlnbm9yZVxuXG4gIG9uRGlkQ2hhbmdlU2VhcmNoKC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUub25EaWRDaGFuZ2VTZWFyY2goLi4uYXJncykgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgb25EaWRDb25maXJtU2VhcmNoKC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUub25EaWRDb25maXJtU2VhcmNoKC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIG9uRGlkQ2FuY2VsU2VhcmNoKC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUub25EaWRDYW5jZWxTZWFyY2goLi4uYXJncykgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgb25EaWRDb21tYW5kU2VhcmNoKC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUub25EaWRDb21tYW5kU2VhcmNoKC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIG9uRGlkU2V0VGFyZ2V0KC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUub25EaWRTZXRUYXJnZXQoLi4uYXJncykgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgZW1pdERpZFNldFRhcmdldCguLi5hcmdzKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLmVtaXREaWRTZXRUYXJnZXQoLi4uYXJncykgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgb25XaWxsU2VsZWN0VGFyZ2V0KC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUub25XaWxsU2VsZWN0VGFyZ2V0KC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIGVtaXRXaWxsU2VsZWN0VGFyZ2V0KC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUuZW1pdFdpbGxTZWxlY3RUYXJnZXQoLi4uYXJncykgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgb25EaWRTZWxlY3RUYXJnZXQoLi4uYXJncykgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5vbkRpZFNlbGVjdFRhcmdldCguLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBlbWl0RGlkU2VsZWN0VGFyZ2V0KC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUuZW1pdERpZFNlbGVjdFRhcmdldCguLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBvbkRpZEZhaWxTZWxlY3RUYXJnZXQoLi4uYXJncykgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5vbkRpZEZhaWxTZWxlY3RUYXJnZXQoLi4uYXJncykgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgZW1pdERpZEZhaWxTZWxlY3RUYXJnZXQoLi4uYXJncykgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5lbWl0RGlkRmFpbFNlbGVjdFRhcmdldCguLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBvbldpbGxGaW5pc2hNdXRhdGlvbiguLi5hcmdzKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLm9uV2lsbEZpbmlzaE11dGF0aW9uKC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIGVtaXRXaWxsRmluaXNoTXV0YXRpb24oLi4uYXJncykgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5lbWl0V2lsbEZpbmlzaE11dGF0aW9uKC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIG9uRGlkRmluaXNoTXV0YXRpb24oLi4uYXJncykgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5vbkRpZEZpbmlzaE11dGF0aW9uKC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIGVtaXREaWRGaW5pc2hNdXRhdGlvbiguLi5hcmdzKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLmVtaXREaWRGaW5pc2hNdXRhdGlvbiguLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBvbkRpZEZpbmlzaE9wZXJhdGlvbiguLi5hcmdzKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLm9uRGlkRmluaXNoT3BlcmF0aW9uKC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIG9uRGlkUmVzZXRPcGVyYXRpb25TdGFjayguLi5hcmdzKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLm9uRGlkUmVzZXRPcGVyYXRpb25TdGFjayguLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBvbkRpZENhbmNlbFNlbGVjdExpc3QoLi4uYXJncykgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5vbkRpZENhbmNlbFNlbGVjdExpc3QoLi4uYXJncykgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgc3Vic2NyaWJlKC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUuc3Vic2NyaWJlKC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIGlzTW9kZSguLi5hcmdzKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLmlzTW9kZSguLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBnZXRCbG9ja3dpc2VTZWxlY3Rpb25zKC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUuZ2V0QmxvY2t3aXNlU2VsZWN0aW9ucyguLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBnZXRMYXN0QmxvY2t3aXNlU2VsZWN0aW9uKC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUuZ2V0TGFzdEJsb2Nrd2lzZVNlbGVjdGlvbiguLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBhZGRUb0NsYXNzTGlzdCguLi5hcmdzKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLmFkZFRvQ2xhc3NMaXN0KC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIGdldENvbmZpZyguLi5hcmdzKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLmdldENvbmZpZyguLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuXG4gIC8vIFdyYXBwZXIgZm9yIHRoaXMudXRpbHNcbiAgLy89PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgZ2V0VmltRW9mQnVmZmVyUG9zaXRpb24oKSB7IHJldHVybiB0aGlzLnV0aWxzLmdldFZpbUVvZkJ1ZmZlclBvc2l0aW9uKHRoaXMuZWRpdG9yKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBnZXRWaW1MYXN0QnVmZmVyUm93KCkgeyByZXR1cm4gdGhpcy51dGlscy5nZXRWaW1MYXN0QnVmZmVyUm93KHRoaXMuZWRpdG9yKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBnZXRWaW1MYXN0U2NyZWVuUm93KCkgeyByZXR1cm4gdGhpcy51dGlscy5nZXRWaW1MYXN0U2NyZWVuUm93KHRoaXMuZWRpdG9yKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBnZXRWYWxpZFZpbUJ1ZmZlclJvdyhyb3cpIHsgcmV0dXJuIHRoaXMudXRpbHMuZ2V0VmFsaWRWaW1CdWZmZXJSb3codGhpcy5lZGl0b3IsIHJvdykgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgZ2V0VmFsaWRWaW1TY3JlZW5Sb3cocm93KSB7IHJldHVybiB0aGlzLnV0aWxzLmdldFZhbGlkVmltU2NyZWVuUm93KHRoaXMuZWRpdG9yLCByb3cpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIGdldFdvcmRCdWZmZXJSYW5nZUFuZEtpbmRBdEJ1ZmZlclBvc2l0aW9uKC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudXRpbHMuZ2V0V29yZEJ1ZmZlclJhbmdlQW5kS2luZEF0QnVmZmVyUG9zaXRpb24odGhpcy5lZGl0b3IsIC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIGdldEZpcnN0Q2hhcmFjdGVyUG9zaXRpb25Gb3JCdWZmZXJSb3cocm93KSB7IHJldHVybiB0aGlzLnV0aWxzLmdldEZpcnN0Q2hhcmFjdGVyUG9zaXRpb25Gb3JCdWZmZXJSb3codGhpcy5lZGl0b3IsIHJvdykgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgZ2V0QnVmZmVyUmFuZ2VGb3JSb3dSYW5nZShyb3dSYW5nZSkgeyByZXR1cm4gdGhpcy51dGlscy5nZXRCdWZmZXJSYW5nZUZvclJvd1JhbmdlKHRoaXMuZWRpdG9yLCByb3dSYW5nZSkgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgc2NhbkVkaXRvciguLi5hcmdzKSB7IHJldHVybiB0aGlzLnV0aWxzLnNjYW5FZGl0b3IodGhpcy5lZGl0b3IsIC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIGZpbmRJbkVkaXRvciguLi5hcmdzKSB7IHJldHVybiB0aGlzLnV0aWxzLmZpbmRJbkVkaXRvcih0aGlzLmVkaXRvciwgLi4uYXJncykgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgZmluZFBvaW50KC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudXRpbHMuZmluZFBvaW50KHRoaXMuZWRpdG9yLCAuLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICB0cmltQnVmZmVyUmFuZ2UoLi4uYXJncykgeyByZXR1cm4gdGhpcy51dGlscy50cmltQnVmZmVyUmFuZ2UodGhpcy5lZGl0b3IsIC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIGlzRW1wdHlSb3coLi4uYXJncykgeyByZXR1cm4gdGhpcy51dGlscy5pc0VtcHR5Um93KHRoaXMuZWRpdG9yLCAuLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBnZXRGb2xkU3RhcnRSb3dGb3JSb3coLi4uYXJncykgeyByZXR1cm4gdGhpcy51dGlscy5nZXRGb2xkU3RhcnRSb3dGb3JSb3codGhpcy5lZGl0b3IsIC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIGdldEZvbGRFbmRSb3dGb3JSb3coLi4uYXJncykgeyByZXR1cm4gdGhpcy51dGlscy5nZXRGb2xkRW5kUm93Rm9yUm93KHRoaXMuZWRpdG9yLCAuLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBnZXRCdWZmZXJSb3dzKC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudXRpbHMuZ2V0Um93cyh0aGlzLmVkaXRvciwgXCJidWZmZXJcIiwgLi4uYXJncykgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgZ2V0U2NyZWVuUm93cyguLi5hcmdzKSB7IHJldHVybiB0aGlzLnV0aWxzLmdldFJvd3ModGhpcy5lZGl0b3IsIFwic2NyZWVuXCIsIC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG59XG5cbm1vZHVsZS5leHBvcnRzID0gQmFzZVxuIl19