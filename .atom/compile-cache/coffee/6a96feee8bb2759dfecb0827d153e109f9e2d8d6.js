(function() {
  var Base, CSON, Delegato, OperationAbortedError, VMP_LOADED_FILES, VMP_LOADING_FILE, __plus, _plus, getEditorState, loadVmpOperationFile, path, ref, selectList, settings, vimStateMethods,
    slice = [].slice,
    hasProp = {}.hasOwnProperty,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  __plus = null;

  _plus = function() {
    return __plus != null ? __plus : __plus = require('underscore-plus');
  };

  Delegato = require('delegato');

  settings = require('./settings');

  ref = [], CSON = ref[0], path = ref[1], selectList = ref[2], getEditorState = ref[3];

  VMP_LOADING_FILE = null;

  VMP_LOADED_FILES = [];

  loadVmpOperationFile = function(filename) {
    var vmpLoadingFileOriginal;
    vmpLoadingFileOriginal = VMP_LOADING_FILE;
    VMP_LOADING_FILE = filename;
    require(filename);
    VMP_LOADING_FILE = vmpLoadingFileOriginal;
    return VMP_LOADED_FILES.push(filename);
  };

  OperationAbortedError = null;

  vimStateMethods = ["onDidChangeSearch", "onDidConfirmSearch", "onDidCancelSearch", "onDidCommandSearch", "onDidSetTarget", "emitDidSetTarget", "onWillSelectTarget", "emitWillSelectTarget", "onDidSelectTarget", "emitDidSelectTarget", "onDidFailSelectTarget", "emitDidFailSelectTarget", "onWillFinishMutation", "emitWillFinishMutation", "onDidFinishMutation", "emitDidFinishMutation", "onDidFinishOperation", "onDidResetOperationStack", "onDidSetOperatorModifier", "onWillActivateMode", "onDidActivateMode", "preemptWillDeactivateMode", "onWillDeactivateMode", "onDidDeactivateMode", "onDidCancelSelectList", "subscribe", "isMode", "getBlockwiseSelections", "getLastBlockwiseSelection", "addToClassList", "getConfig"];

  Base = (function() {
    var classRegistry;

    Delegato.includeInto(Base);

    Base.delegatesMethods.apply(Base, slice.call(vimStateMethods).concat([{
      toProperty: 'vimState'
    }]));

    Base.delegatesProperty('mode', 'submode', 'swrap', 'utils', {
      toProperty: 'vimState'
    });

    function Base(vimState1, properties) {
      var ref1;
      this.vimState = vimState1;
      if (properties == null) {
        properties = null;
      }
      ref1 = this.vimState, this.editor = ref1.editor, this.editorElement = ref1.editorElement, this.globalState = ref1.globalState, this.swrap = ref1.swrap;
      this.name = this.constructor.name;
      if (properties != null) {
        Object.assign(this, properties);
      }
    }

    Base.prototype.initialize = function() {};

    Base.prototype.isComplete = function() {
      var ref1;
      if (this.requireInput && (this.input == null)) {
        return false;
      } else if (this.requireTarget) {
        return (ref1 = this.target) != null ? typeof ref1.isComplete === "function" ? ref1.isComplete() : void 0 : void 0;
      } else {
        return true;
      }
    };

    Base.prototype.requireTarget = false;

    Base.prototype.requireInput = false;

    Base.prototype.recordable = false;

    Base.prototype.repeated = false;

    Base.prototype.target = null;

    Base.prototype.operator = null;

    Base.prototype.isAsTargetExceptSelect = function() {
      return (this.operator != null) && !this.operator["instanceof"]('Select');
    };

    Base.prototype.abort = function() {
      if (OperationAbortedError == null) {
        OperationAbortedError = require('./errors');
      }
      throw new OperationAbortedError('aborted');
    };

    Base.prototype.count = null;

    Base.prototype.defaultCount = 1;

    Base.prototype.getCount = function(offset) {
      var ref1;
      if (offset == null) {
        offset = 0;
      }
      if (this.count == null) {
        this.count = (ref1 = this.vimState.getCount()) != null ? ref1 : this.defaultCount;
      }
      return this.count + offset;
    };

    Base.prototype.resetCount = function() {
      return this.count = null;
    };

    Base.prototype.isDefaultCount = function() {
      return this.count === this.defaultCount;
    };

    Base.prototype.countTimes = function(last, fn) {
      var count, i, isFinal, ref1, results, stop, stopped;
      if (last < 1) {
        return;
      }
      stopped = false;
      stop = function() {
        return stopped = true;
      };
      results = [];
      for (count = i = 1, ref1 = last; 1 <= ref1 ? i <= ref1 : i >= ref1; count = 1 <= ref1 ? ++i : --i) {
        isFinal = count === last;
        fn({
          count: count,
          isFinal: isFinal,
          stop: stop
        });
        if (stopped) {
          break;
        } else {
          results.push(void 0);
        }
      }
      return results;
    };

    Base.prototype.activateMode = function(mode, submode) {
      return this.onDidFinishOperation((function(_this) {
        return function() {
          return _this.vimState.activate(mode, submode);
        };
      })(this));
    };

    Base.prototype.activateModeIfNecessary = function(mode, submode) {
      if (!this.vimState.isMode(mode, submode)) {
        return this.activateMode(mode, submode);
      }
    };

    Base.prototype["new"] = function(name, properties) {
      var klass;
      klass = Base.getClass(name);
      return new klass(this.vimState, properties);
    };

    Base.prototype.clone = function(vimState) {
      var excludeProperties, key, klass, properties, ref1, value;
      properties = {};
      excludeProperties = ['editor', 'editorElement', 'globalState', 'vimState', 'operator'];
      ref1 = this;
      for (key in ref1) {
        if (!hasProp.call(ref1, key)) continue;
        value = ref1[key];
        if (indexOf.call(excludeProperties, key) < 0) {
          properties[key] = value;
        }
      }
      klass = this.constructor;
      return new klass(vimState, properties);
    };

    Base.prototype.cancelOperation = function() {
      return this.vimState.operationStack.cancel(this);
    };

    Base.prototype.processOperation = function() {
      return this.vimState.operationStack.process();
    };

    Base.prototype.focusSelectList = function(options) {
      if (options == null) {
        options = {};
      }
      this.onDidCancelSelectList((function(_this) {
        return function() {
          return _this.cancelOperation();
        };
      })(this));
      if (selectList == null) {
        selectList = new (require('./select-list'));
      }
      return selectList.show(this.vimState, options);
    };

    Base.prototype.input = null;

    Base.prototype.focusInput = function(options) {
      if (options == null) {
        options = {};
      }
      if (options.onConfirm == null) {
        options.onConfirm = (function(_this) {
          return function(input1) {
            _this.input = input1;
            return _this.processOperation();
          };
        })(this);
      }
      if (options.onCancel == null) {
        options.onCancel = (function(_this) {
          return function() {
            return _this.cancelOperation();
          };
        })(this);
      }
      if (options.onChange == null) {
        options.onChange = (function(_this) {
          return function(input) {
            return _this.vimState.hover.set(input);
          };
        })(this);
      }
      return this.vimState.focusInput(options);
    };

    Base.prototype.readChar = function() {
      return this.vimState.readChar({
        onConfirm: (function(_this) {
          return function(input1) {
            _this.input = input1;
            return _this.processOperation();
          };
        })(this),
        onCancel: (function(_this) {
          return function() {
            return _this.cancelOperation();
          };
        })(this)
      });
    };

    Base.prototype.getVimEofBufferPosition = function() {
      return this.utils.getVimEofBufferPosition(this.editor);
    };

    Base.prototype.getVimLastBufferRow = function() {
      return this.utils.getVimLastBufferRow(this.editor);
    };

    Base.prototype.getVimLastScreenRow = function() {
      return this.utils.getVimLastScreenRow(this.editor);
    };

    Base.prototype.getWordBufferRangeAndKindAtBufferPosition = function(point, options) {
      return this.utils.getWordBufferRangeAndKindAtBufferPosition(this.editor, point, options);
    };

    Base.prototype.getFirstCharacterPositionForBufferRow = function(row) {
      return this.utils.getFirstCharacterPositionForBufferRow(this.editor, row);
    };

    Base.prototype.getBufferRangeForRowRange = function(rowRange) {
      return this.utils.getBufferRangeForRowRange(this.editor, rowRange);
    };

    Base.prototype.getIndentLevelForBufferRow = function(row) {
      return this.utils.getIndentLevelForBufferRow(this.editor, row);
    };

    Base.prototype.scanForward = function() {
      var args, ref1;
      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      return (ref1 = this.utils).scanEditorInDirection.apply(ref1, [this.editor, 'forward'].concat(slice.call(args)));
    };

    Base.prototype.scanBackward = function() {
      var args, ref1;
      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      return (ref1 = this.utils).scanEditorInDirection.apply(ref1, [this.editor, 'backward'].concat(slice.call(args)));
    };

    Base.prototype.getFoldEndRowForRow = function() {
      var args, ref1;
      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      return (ref1 = this.utils).getFoldEndRowForRow.apply(ref1, [this.editor].concat(slice.call(args)));
    };

    Base.prototype["instanceof"] = function(klassName) {
      return this instanceof Base.getClass(klassName);
    };

    Base.prototype.is = function(klassName) {
      return this.constructor === Base.getClass(klassName);
    };

    Base.prototype.isOperator = function() {
      return this.constructor.operationKind === 'operator';
    };

    Base.prototype.isMotion = function() {
      return this.constructor.operationKind === 'motion';
    };

    Base.prototype.isTextObject = function() {
      return this.constructor.operationKind === 'text-object';
    };

    Base.prototype.getCursorBufferPosition = function() {
      if (this.mode === 'visual') {
        return this.getCursorPositionForSelection(this.editor.getLastSelection());
      } else {
        return this.editor.getCursorBufferPosition();
      }
    };

    Base.prototype.getCursorBufferPositions = function() {
      if (this.mode === 'visual') {
        return this.editor.getSelections().map(this.getCursorPositionForSelection.bind(this));
      } else {
        return this.editor.getCursorBufferPositions();
      }
    };

    Base.prototype.getBufferPositionForCursor = function(cursor) {
      if (this.mode === 'visual') {
        return this.getCursorPositionForSelection(cursor.selection);
      } else {
        return cursor.getBufferPosition();
      }
    };

    Base.prototype.getCursorPositionForSelection = function(selection) {
      return this.swrap(selection).getBufferPositionFor('head', {
        from: ['property', 'selection']
      });
    };

    Base.prototype.toString = function() {
      var str;
      str = this.name;
      if (this.target != null) {
        return str += ", target=" + this.target.name + ", target.wise=" + this.target.wise + " ";
      } else if (this.operator != null) {
        return str += ", wise=" + this.wise + " , operator=" + this.operator.name;
      } else {
        return str;
      }
    };

    Base.writeCommandTableOnDisk = function() {
      var _, commandTable, commandTablePath, loadableCSONText;
      commandTable = this.generateCommandTableByEagerLoad();
      _ = _plus();
      if (_.isEqual(this.commandTable, commandTable)) {
        atom.notifications.addInfo("No change commandTable", {
          dismissable: true
        });
        return;
      }
      if (CSON == null) {
        CSON = require('season');
      }
      if (path == null) {
        path = require('path');
      }
      loadableCSONText = "# This file is auto generated by `vim-mode-plus:write-command-table-on-disk` command.\n# DONT edit manually.\nmodule.exports =\n" + (CSON.stringify(commandTable)) + "\n";
      commandTablePath = path.join(__dirname, "command-table.coffee");
      return atom.workspace.open(commandTablePath).then(function(editor) {
        editor.setText(loadableCSONText);
        editor.save();
        return atom.notifications.addInfo("Updated commandTable", {
          dismissable: true
        });
      });
    };

    Base.generateCommandTableByEagerLoad = function() {
      var _, commandTable, file, filesToLoad, i, j, klass, klasses, klassesGroupedByFile, len, len1, ref1;
      filesToLoad = ['./operator', './operator-insert', './operator-transform-string', './motion', './motion-search', './text-object', './misc-command'];
      filesToLoad.forEach(loadVmpOperationFile);
      _ = _plus();
      klasses = _.values(this.getClassRegistry());
      klassesGroupedByFile = _.groupBy(klasses, function(klass) {
        return klass.VMP_LOADING_FILE;
      });
      commandTable = {};
      for (i = 0, len = filesToLoad.length; i < len; i++) {
        file = filesToLoad[i];
        ref1 = klassesGroupedByFile[file];
        for (j = 0, len1 = ref1.length; j < len1; j++) {
          klass = ref1[j];
          commandTable[klass.name] = klass.getSpec();
        }
      }
      return commandTable;
    };

    Base.commandTable = null;

    Base.init = function(_getEditorState) {
      var name, ref1, spec, subscriptions;
      getEditorState = _getEditorState;
      this.commandTable = require('./command-table');
      subscriptions = [];
      ref1 = this.commandTable;
      for (name in ref1) {
        spec = ref1[name];
        if (spec.commandName != null) {
          subscriptions.push(this.registerCommandFromSpec(name, spec));
        }
      }
      return subscriptions;
    };

    classRegistry = {
      Base: Base
    };

    Base.extend = function(command1) {
      this.command = command1 != null ? command1 : true;
      this.VMP_LOADING_FILE = VMP_LOADING_FILE;
      if (this.name in classRegistry) {
        console.warn("Duplicate constructor " + this.name);
      }
      return classRegistry[this.name] = this;
    };

    Base.getSpec = function() {
      if (this.isCommand()) {
        return {
          file: this.VMP_LOADING_FILE,
          commandName: this.getCommandName(),
          commandScope: this.getCommandScope()
        };
      } else {
        return {
          file: this.VMP_LOADING_FILE
        };
      }
    };

    Base.getClass = function(name) {
      var fileToLoad, klass;
      if ((klass = classRegistry[name])) {
        return klass;
      }
      fileToLoad = this.commandTable[name].file;
      if (indexOf.call(VMP_LOADED_FILES, fileToLoad) < 0) {
        if (atom.inDevMode() && settings.get('debug')) {
          console.log("lazy-require: " + fileToLoad + " for " + name);
        }
        loadVmpOperationFile(fileToLoad);
        if ((klass = classRegistry[name])) {
          return klass;
        }
      }
      throw new Error("class '" + name + "' not found");
    };

    Base.getClassRegistry = function() {
      return classRegistry;
    };

    Base.isCommand = function() {
      return this.command;
    };

    Base.commandPrefix = 'vim-mode-plus';

    Base.getCommandName = function() {
      return this.commandPrefix + ':' + _plus().dasherize(this.name);
    };

    Base.getCommandNameWithoutPrefix = function() {
      return _plus().dasherize(this.name);
    };

    Base.commandScope = 'atom-text-editor';

    Base.getCommandScope = function() {
      return this.commandScope;
    };

    Base.getDesctiption = function() {
      if (this.hasOwnProperty("description")) {
        return this.description;
      } else {
        return null;
      }
    };

    Base.registerCommand = function() {
      var klass;
      klass = this;
      return atom.commands.add(this.getCommandScope(), this.getCommandName(), function(event) {
        var ref1, vimState;
        vimState = (ref1 = getEditorState(this.getModel())) != null ? ref1 : getEditorState(atom.workspace.getActiveTextEditor());
        if (vimState != null) {
          vimState.operationStack.run(klass);
        }
        return event.stopPropagation();
      });
    };

    Base.registerCommandFromSpec = function(name, spec) {
      var commandName, commandPrefix, commandScope, getClass;
      commandScope = spec.commandScope, commandPrefix = spec.commandPrefix, commandName = spec.commandName, getClass = spec.getClass;
      if (commandScope == null) {
        commandScope = 'atom-text-editor';
      }
      if (commandName == null) {
        commandName = (commandPrefix != null ? commandPrefix : 'vim-mode-plus') + ':' + _plus().dasherize(name);
      }
      return atom.commands.add(commandScope, commandName, function(event) {
        var ref1, vimState;
        vimState = (ref1 = getEditorState(this.getModel())) != null ? ref1 : getEditorState(atom.workspace.getActiveTextEditor());
        if (vimState != null) {
          if (getClass != null) {
            vimState.operationStack.run(getClass(name));
          } else {
            vimState.operationStack.run(name);
          }
        }
        return event.stopPropagation();
      });
    };

    Base.operationKind = null;

    Base.getKindForCommandName = function(command) {
      var _, name;
      command = command.replace(/^vim-mode-plus:/, "");
      _ = _plus();
      name = _.capitalize(_.camelize(command));
      if (name in classRegistry) {
        return classRegistry[name].operationKind;
      }
    };

    return Base;

  })();

  module.exports = Base;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvYmFzZS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0E7QUFBQSxNQUFBLHNMQUFBO0lBQUE7Ozs7RUFBQSxNQUFBLEdBQVM7O0VBQ1QsS0FBQSxHQUFRLFNBQUE7NEJBQ04sU0FBQSxTQUFVLE9BQUEsQ0FBUSxpQkFBUjtFQURKOztFQUdSLFFBQUEsR0FBVyxPQUFBLENBQVEsVUFBUjs7RUFDWCxRQUFBLEdBQVcsT0FBQSxDQUFRLFlBQVI7O0VBRVgsTUFLSSxFQUxKLEVBQ0UsYUFERixFQUVFLGFBRkYsRUFHRSxtQkFIRixFQUlFOztFQUdGLGdCQUFBLEdBQW1COztFQUNuQixnQkFBQSxHQUFtQjs7RUFFbkIsb0JBQUEsR0FBdUIsU0FBQyxRQUFEO0FBS3JCLFFBQUE7SUFBQSxzQkFBQSxHQUF5QjtJQUN6QixnQkFBQSxHQUFtQjtJQUNuQixPQUFBLENBQVEsUUFBUjtJQUNBLGdCQUFBLEdBQW1CO1dBRW5CLGdCQUFnQixDQUFDLElBQWpCLENBQXNCLFFBQXRCO0VBVnFCOztFQVl2QixxQkFBQSxHQUF3Qjs7RUFFeEIsZUFBQSxHQUFrQixDQUNoQixtQkFEZ0IsRUFFaEIsb0JBRmdCLEVBR2hCLG1CQUhnQixFQUloQixvQkFKZ0IsRUFPaEIsZ0JBUGdCLEVBT0Usa0JBUEYsRUFRZCxvQkFSYyxFQVFRLHNCQVJSLEVBU2QsbUJBVGMsRUFTTyxxQkFUUCxFQVVkLHVCQVZjLEVBVVcseUJBVlgsRUFZZCxzQkFaYyxFQVlVLHdCQVpWLEVBYWQscUJBYmMsRUFhUyx1QkFiVCxFQWNoQixzQkFkZ0IsRUFlaEIsMEJBZmdCLEVBaUJoQiwwQkFqQmdCLEVBbUJoQixvQkFuQmdCLEVBb0JoQixtQkFwQmdCLEVBcUJoQiwyQkFyQmdCLEVBc0JoQixzQkF0QmdCLEVBdUJoQixxQkF2QmdCLEVBeUJoQix1QkF6QmdCLEVB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QSxDQUFTLElBQVQsQ0FBNUIsRUFERjtXQUFBLE1BQUE7WUFHRSxRQUFRLENBQUMsY0FBYyxDQUFDLEdBQXhCLENBQTRCLElBQTVCLEVBSEY7V0FERjs7ZUFLQSxLQUFLLENBQUMsZUFBTixDQUFBO01BUDJDLENBQTdDO0lBSndCOztJQWMxQixJQUFDLENBQUEsYUFBRCxHQUFnQjs7SUFDaEIsSUFBQyxDQUFBLHFCQUFELEdBQXdCLFNBQUMsT0FBRDtBQUN0QixVQUFBO01BQUEsT0FBQSxHQUFVLE9BQU8sQ0FBQyxPQUFSLENBQWdCLGlCQUFoQixFQUFtQyxFQUFuQztNQUNWLENBQUEsR0FBSSxLQUFBLENBQUE7TUFDSixJQUFBLEdBQU8sQ0FBQyxDQUFDLFVBQUYsQ0FBYSxDQUFDLENBQUMsUUFBRixDQUFXLE9BQVgsQ0FBYjtNQUNQLElBQUcsSUFBQSxJQUFRLGFBQVg7ZUFDRSxhQUFjLENBQUEsSUFBQSxDQUFLLENBQUMsY0FEdEI7O0lBSnNCOzs7Ozs7RUFPMUIsTUFBTSxDQUFDLE9BQVAsR0FBaUI7QUEvWGpCIiwic291cmNlc0NvbnRlbnQiOlsiIyBUbyBhdm9pZCBsb2FkaW5nIHVuZGVyc2NvcmUtcGx1cyBhbmQgZGVwZW5kaW5nIHVuZGVyc2NvcmUgb24gc3RhcnR1cFxuX19wbHVzID0gbnVsbFxuX3BsdXMgPSAtPlxuICBfX3BsdXMgPz0gcmVxdWlyZSAndW5kZXJzY29yZS1wbHVzJ1xuXG5EZWxlZ2F0byA9IHJlcXVpcmUgJ2RlbGVnYXRvJ1xuc2V0dGluZ3MgPSByZXF1aXJlICcuL3NldHRpbmdzJ1xuXG5bXG4gIENTT05cbiAgcGF0aFxuICBzZWxlY3RMaXN0XG4gIGdldEVkaXRvclN0YXRlICAjIHNldCBieSBCYXNlLmluaXQoKVxuXSA9IFtdICMgc2V0IG51bGxcblxuVk1QX0xPQURJTkdfRklMRSA9IG51bGxcblZNUF9MT0FERURfRklMRVMgPSBbXVxuXG5sb2FkVm1wT3BlcmF0aW9uRmlsZSA9IChmaWxlbmFtZSkgLT5cbiAgIyBDYWxsIHRvIGxvYWRWbXBPcGVyYXRpb25GaWxlIGNhbiBiZSBuZXN0ZWQuXG4gICMgMS4gcmVxdWlyZShcIi4vb3BlcmF0b3ItdHJhbnNmb3JtLXN0cmluZ1wiKVxuICAjIDIuIGluIG9wZXJhdG9yLXRyYW5zZm9ybS1zdHJpbmcuY29mZmVlIGNhbGwgQmFzZS5nZXRDbGFzcyhcIk9wZXJhdG9yXCIpIGNhdXNlIG9wZXJhdG9yLmNvZmZlZSByZXF1aXJlZC5cbiAgIyBTbyB3ZSBoYXZlIHRvIHNhdmUgb3JpZ2luYWwgVk1QX0xPQURJTkdfRklMRSBhbmQgcmVzdG9yZSBpdCBhZnRlciByZXF1aXJlIGZpbmlzaGVkLlxuICB2bXBMb2FkaW5nRmlsZU9yaWdpbmFsID0gVk1QX0xPQURJTkdfRklMRVxuICBWTVBfTE9BRElOR19GSUxFID0gZmlsZW5hbWVcbiAgcmVxdWlyZShmaWxlbmFtZSlcbiAgVk1QX0xPQURJTkdfRklMRSA9IHZtcExvYWRpbmdGaWxlT3JpZ2luYWxcblxuICBWTVBfTE9BREVEX0ZJTEVTLnB1c2goZmlsZW5hbWUpXG5cbk9wZXJhdGlvbkFib3J0ZWRFcnJvciA9IG51bGxcblxudmltU3RhdGVNZXRob2RzID0gW1xuICBcIm9uRGlkQ2hhbmdlU2VhcmNoXCJcbiAgXCJvbkRpZENvbmZpcm1TZWFyY2hcIlxuICBcIm9uRGlkQ2FuY2VsU2VhcmNoXCJcbiAgXCJvbkRpZENvbW1hbmRTZWFyY2hcIlxuXG4gICMgTGlmZSBjeWNsZSBvZiBvcGVyYXRpb25TdGFja1xuICBcIm9uRGlkU2V0VGFyZ2V0XCIsIFwiZW1pdERpZFNldFRhcmdldFwiXG4gICAgXCJvbldpbGxTZWxlY3RUYXJnZXRcIiwgXCJlbWl0V2lsbFNlbGVjdFRhcmdldFwiXG4gICAgXCJvbkRpZFNlbGVjdFRhcmdldFwiLCBcImVtaXREaWRTZWxlY3RUYXJnZXRcIlxuICAgIFwib25EaWRGYWlsU2VsZWN0VGFyZ2V0XCIsIFwiZW1pdERpZEZhaWxTZWxlY3RUYXJnZXRcIlxuXG4gICAgXCJvbldpbGxGaW5pc2hNdXRhdGlvblwiLCBcImVtaXRXaWxsRmluaXNoTXV0YXRpb25cIlxuICAgIFwib25EaWRGaW5pc2hNdXRhdGlvblwiLCBcImVtaXREaWRGaW5pc2hNdXRhdGlvblwiXG4gIFwib25EaWRGaW5pc2hPcGVyYXRpb25cIlxuICBcIm9uRGlkUmVzZXRPcGVyYXRpb25TdGFja1wiXG5cbiAgXCJvbkRpZFNldE9wZXJhdG9yTW9kaWZpZXJcIlxuXG4gIFwib25XaWxsQWN0aXZhdGVNb2RlXCJcbiAgXCJvbkRpZEFjdGl2YXRlTW9kZVwiXG4gIFwicHJlZW1wdFdpbGxEZWFjdGl2YXRlTW9kZVwiXG4gIFwib25XaWxsRGVhY3RpdmF0ZU1vZGVcIlxuICBcIm9uRGlkRGVhY3RpdmF0ZU1vZGVcIlxuXG4gIFwib25EaWRDYW5jZWxTZWxlY3RMaXN0XCJcbiAgXCJzdWJzY3JpYmVcIlxuICBcImlzTW9kZVwiXG4gIFwiZ2V0QmxvY2t3aXNlU2VsZWN0aW9uc1wiXG4gIFwiZ2V0TGFzdEJsb2Nrd2lzZVNlbGVjdGlvblwiXG4gIFwiYWRkVG9DbGFzc0xpc3RcIlxuICBcImdldENvbmZpZ1wiXG5dXG5cbmNsYXNzIEJhc2VcbiAgRGVsZWdhdG8uaW5jbHVkZUludG8odGhpcylcbiAgQGRlbGVnYXRlc01ldGhvZHModmltU3RhdGVNZXRob2RzLi4uLCB0b1Byb3BlcnR5OiAndmltU3RhdGUnKVxuICBAZGVsZWdhdGVzUHJvcGVydHkoJ21vZGUnLCAnc3VibW9kZScsICdzd3JhcCcsICd1dGlscycsIHRvUHJvcGVydHk6ICd2aW1TdGF0ZScpXG5cbiAgY29uc3RydWN0b3I6IChAdmltU3RhdGUsIHByb3BlcnRpZXM9bnVsbCkgLT5cbiAgICB7QGVkaXRvciwgQGVkaXRvckVsZW1lbnQsIEBnbG9iYWxTdGF0ZSwgQHN3cmFwfSA9IEB2aW1TdGF0ZVxuICAgIEBuYW1lID0gQGNvbnN0cnVjdG9yLm5hbWVcbiAgICBPYmplY3QuYXNzaWduKHRoaXMsIHByb3BlcnRpZXMpIGlmIHByb3BlcnRpZXM/XG5cbiAgIyBUbyBvdmVycmlkZVxuICBpbml0aWFsaXplOiAtPlxuXG4gICMgT3BlcmF0aW9uIHByb2Nlc3NvciBleGVjdXRlIG9ubHkgd2hlbiBpc0NvbXBsZXRlKCkgcmV0dXJuIHRydWUuXG4gICMgSWYgZmFsc2UsIG9wZXJhdGlvbiBwcm9jZXNzb3IgcG9zdHBvbmUgaXRzIGV4ZWN1dGlvbi5cbiAgaXNDb21wbGV0ZTogLT5cbiAgICBpZiBAcmVxdWlyZUlucHV0IGFuZCBub3QgQGlucHV0P1xuICAgICAgZmFsc2VcbiAgICBlbHNlIGlmIEByZXF1aXJlVGFyZ2V0XG4gICAgICAjIFdoZW4gdGhpcyBmdW5jdGlvbiBpcyBjYWxsZWQgaW4gQmFzZTo6Y29uc3RydWN0b3JcbiAgICAgICMgdGFnZXJ0IGlzIHN0aWxsIHN0cmluZyBsaWtlIGBNb3ZlVG9SaWdodGAsIGluIHRoaXMgY2FzZSBpc0NvbXBsZXRlXG4gICAgICAjIGlzIG5vdCBhdmFpbGFibGUuXG4gICAgICBAdGFyZ2V0Py5pc0NvbXBsZXRlPygpXG4gICAgZWxzZVxuICAgICAgdHJ1ZVxuXG4gIHJlcXVpcmVUYXJnZXQ6IGZhbHNlXG4gIHJlcXVpcmVJbnB1dDogZmFsc2VcbiAgcmVjb3JkYWJsZTogZmFsc2VcbiAgcmVwZWF0ZWQ6IGZhbHNlXG4gIHRhcmdldDogbnVsbCAjIFNldCBpbiBPcGVyYXRvclxuICBvcGVyYXRvcjogbnVsbCAjIFNldCBpbiBvcGVyYXRvcidzIHRhcmdldCggTW90aW9uIG9yIFRleHRPYmplY3QgKVxuICBpc0FzVGFyZ2V0RXhjZXB0U2VsZWN0OiAtPlxuICAgIEBvcGVyYXRvcj8gYW5kIG5vdCBAb3BlcmF0b3IuaW5zdGFuY2VvZignU2VsZWN0JylcblxuICBhYm9ydDogLT5cbiAgICBPcGVyYXRpb25BYm9ydGVkRXJyb3IgPz0gcmVxdWlyZSAnLi9lcnJvcnMnXG4gICAgdGhyb3cgbmV3IE9wZXJhdGlvbkFib3J0ZWRFcnJvcignYWJvcnRlZCcpXG5cbiAgIyBDb3VudFxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgY291bnQ6IG51bGxcbiAgZGVmYXVsdENvdW50OiAxXG4gIGdldENvdW50OiAob2Zmc2V0PTApIC0+XG4gICAgQGNvdW50ID89IEB2aW1TdGF0ZS5nZXRDb3VudCgpID8gQGRlZmF1bHRDb3VudFxuICAgIEBjb3VudCArIG9mZnNldFxuXG4gIHJlc2V0Q291bnQ6IC0+XG4gICAgQGNvdW50ID0gbnVsbFxuXG4gIGlzRGVmYXVsdENvdW50OiAtPlxuICAgIEBjb3VudCBpcyBAZGVmYXVsdENvdW50XG5cbiAgIyBNaXNjXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBjb3VudFRpbWVzOiAobGFzdCwgZm4pIC0+XG4gICAgcmV0dXJuIGlmIGxhc3QgPCAxXG5cbiAgICBzdG9wcGVkID0gZmFsc2VcbiAgICBzdG9wID0gLT4gc3RvcHBlZCA9IHRydWVcbiAgICBmb3IgY291bnQgaW4gWzEuLmxhc3RdXG4gICAgICBpc0ZpbmFsID0gY291bnQgaXMgbGFzdFxuICAgICAgZm4oe2NvdW50LCBpc0ZpbmFsLCBzdG9wfSlcbiAgICAgIGJyZWFrIGlmIHN0b3BwZWRcblxuICBhY3RpdmF0ZU1vZGU6IChtb2RlLCBzdWJtb2RlKSAtPlxuICAgIEBvbkRpZEZpbmlzaE9wZXJhdGlvbiA9PlxuICAgICAgQHZpbVN0YXRlLmFjdGl2YXRlKG1vZGUsIHN1Ym1vZGUpXG5cbiAgYWN0aXZhdGVNb2RlSWZOZWNlc3Nhcnk6IChtb2RlLCBzdWJtb2RlKSAtPlxuICAgIHVubGVzcyBAdmltU3RhdGUuaXNNb2RlKG1vZGUsIHN1Ym1vZGUpXG4gICAgICBAYWN0aXZhdGVNb2RlKG1vZGUsIHN1Ym1vZGUpXG5cbiAgbmV3OiAobmFtZSwgcHJvcGVydGllcykgLT5cbiAgICBrbGFzcyA9IEJhc2UuZ2V0Q2xhc3MobmFtZSlcbiAgICBuZXcga2xhc3MoQHZpbVN0YXRlLCBwcm9wZXJ0aWVzKVxuXG4gICMgRklYTUU6IFRoaXMgaXMgdXNlZCB0byBjbG9uZSBNb3Rpb246OlNlYXJjaCB0byBzdXBwb3J0IGBuYCBhbmQgYE5gXG4gICMgQnV0IG1hbnVhbCByZXNldGluZyBhbmQgb3ZlcnJpZGluZyBwcm9wZXJ0eSBpcyBidWcgcHJvbmUuXG4gICMgU2hvdWxkIGV4dHJhY3QgYXMgc2VhcmNoIHNwZWMgb2JqZWN0IGFuZCB1c2UgaXQgYnlcbiAgIyBjcmVhdGluZyBjbGVhbiBpbnN0YW5jZSBvZiBTZWFyY2guXG4gIGNsb25lOiAodmltU3RhdGUpIC0+XG4gICAgcHJvcGVydGllcyA9IHt9XG4gICAgZXhjbHVkZVByb3BlcnRpZXMgPSBbJ2VkaXRvcicsICdlZGl0b3JFbGVtZW50JywgJ2dsb2JhbFN0YXRlJywgJ3ZpbVN0YXRlJywgJ29wZXJhdG9yJ11cbiAgICBmb3Igb3duIGtleSwgdmFsdWUgb2YgdGhpcyB3aGVuIGtleSBub3QgaW4gZXhjbHVkZVByb3BlcnRpZXNcbiAgICAgIHByb3BlcnRpZXNba2V5XSA9IHZhbHVlXG4gICAga2xhc3MgPSB0aGlzLmNvbnN0cnVjdG9yXG4gICAgbmV3IGtsYXNzKHZpbVN0YXRlLCBwcm9wZXJ0aWVzKVxuXG4gIGNhbmNlbE9wZXJhdGlvbjogLT5cbiAgICBAdmltU3RhdGUub3BlcmF0aW9uU3RhY2suY2FuY2VsKHRoaXMpXG5cbiAgcHJvY2Vzc09wZXJhdGlvbjogLT5cbiAgICBAdmltU3RhdGUub3BlcmF0aW9uU3RhY2sucHJvY2VzcygpXG5cbiAgZm9jdXNTZWxlY3RMaXN0OiAob3B0aW9ucz17fSkgLT5cbiAgICBAb25EaWRDYW5jZWxTZWxlY3RMaXN0ID0+XG4gICAgICBAY2FuY2VsT3BlcmF0aW9uKClcbiAgICBzZWxlY3RMaXN0ID89IG5ldyAocmVxdWlyZSAnLi9zZWxlY3QtbGlzdCcpXG4gICAgc2VsZWN0TGlzdC5zaG93KEB2aW1TdGF0ZSwgb3B0aW9ucylcblxuICBpbnB1dDogbnVsbFxuICBmb2N1c0lucHV0OiAob3B0aW9ucyA9IHt9KSAtPlxuICAgIG9wdGlvbnMub25Db25maXJtID89IChAaW5wdXQpID0+IEBwcm9jZXNzT3BlcmF0aW9uKClcbiAgICBvcHRpb25zLm9uQ2FuY2VsID89ID0+IEBjYW5jZWxPcGVyYXRpb24oKVxuICAgIG9wdGlvbnMub25DaGFuZ2UgPz0gKGlucHV0KSA9PiBAdmltU3RhdGUuaG92ZXIuc2V0KGlucHV0KVxuICAgIEB2aW1TdGF0ZS5mb2N1c0lucHV0KG9wdGlvbnMpXG5cbiAgcmVhZENoYXI6IC0+XG4gICAgQHZpbVN0YXRlLnJlYWRDaGFyXG4gICAgICBvbkNvbmZpcm06IChAaW5wdXQpID0+IEBwcm9jZXNzT3BlcmF0aW9uKClcbiAgICAgIG9uQ2FuY2VsOiA9PiBAY2FuY2VsT3BlcmF0aW9uKClcblxuICBnZXRWaW1Fb2ZCdWZmZXJQb3NpdGlvbjogLT5cbiAgICBAdXRpbHMuZ2V0VmltRW9mQnVmZmVyUG9zaXRpb24oQGVkaXRvcilcblxuICBnZXRWaW1MYXN0QnVmZmVyUm93OiAtPlxuICAgIEB1dGlscy5nZXRWaW1MYXN0QnVmZmVyUm93KEBlZGl0b3IpXG5cbiAgZ2V0VmltTGFzdFNjcmVlblJvdzogLT5cbiAgICBAdXRpbHMuZ2V0VmltTGFzdFNjcmVlblJvdyhAZWRpdG9yKVxuXG4gIGdldFdvcmRCdWZmZXJSYW5nZUFuZEtpbmRBdEJ1ZmZlclBvc2l0aW9uOiAocG9pbnQsIG9wdGlvbnMpIC0+XG4gICAgQHV0aWxzLmdldFdvcmRCdWZmZXJSYW5nZUFuZEtpbmRBdEJ1ZmZlclBvc2l0aW9uKEBlZGl0b3IsIHBvaW50LCBvcHRpb25zKVxuXG4gIGdldEZpcnN0Q2hhcmFjdGVyUG9zaXRpb25Gb3JCdWZmZXJSb3c6IChyb3cpIC0+XG4gICAgQHV0aWxzLmdldEZpcnN0Q2hhcmFjdGVyUG9zaXRpb25Gb3JCdWZmZXJSb3coQGVkaXRvciwgcm93KVxuXG4gIGdldEJ1ZmZlclJhbmdlRm9yUm93UmFuZ2U6IChyb3dSYW5nZSkgLT5cbiAgICBAdXRpbHMuZ2V0QnVmZmVyUmFuZ2VGb3JSb3dSYW5nZShAZWRpdG9yLCByb3dSYW5nZSlcblxuICBnZXRJbmRlbnRMZXZlbEZvckJ1ZmZlclJvdzogKHJvdykgLT5cbiAgICBAdXRpbHMuZ2V0SW5kZW50TGV2ZWxGb3JCdWZmZXJSb3coQGVkaXRvciwgcm93KVxuXG4gIHNjYW5Gb3J3YXJkOiAoYXJncy4uLikgLT5cbiAgICBAdXRpbHMuc2NhbkVkaXRvckluRGlyZWN0aW9uKEBlZGl0b3IsICdmb3J3YXJkJywgYXJncy4uLilcblxuICBzY2FuQmFja3dhcmQ6IChhcmdzLi4uKSAtPlxuICAgIEB1dGlscy5zY2FuRWRpdG9ySW5EaXJlY3Rpb24oQGVkaXRvciwgJ2JhY2t3YXJkJywgYXJncy4uLilcblxuICBnZXRGb2xkRW5kUm93Rm9yUm93OiAoYXJncy4uLikgLT5cbiAgICBAdXRpbHMuZ2V0Rm9sZEVuZFJvd0ZvclJvdyhAZWRpdG9yLCBhcmdzLi4uKVxuXG4gIGluc3RhbmNlb2Y6IChrbGFzc05hbWUpIC0+XG4gICAgdGhpcyBpbnN0YW5jZW9mIEJhc2UuZ2V0Q2xhc3Moa2xhc3NOYW1lKVxuXG4gIGlzOiAoa2xhc3NOYW1lKSAtPlxuICAgIHRoaXMuY29uc3RydWN0b3IgaXMgQmFzZS5nZXRDbGFzcyhrbGFzc05hbWUpXG5cbiAgaXNPcGVyYXRvcjogLT5cbiAgICBAY29uc3RydWN0b3Iub3BlcmF0aW9uS2luZCBpcyAnb3BlcmF0b3InXG5cbiAgaXNNb3Rpb246IC0+XG4gICAgQGNvbnN0cnVjdG9yLm9wZXJhdGlvbktpbmQgaXMgJ21vdGlvbidcblxuICBpc1RleHRPYmplY3Q6IC0+XG4gICAgQGNvbnN0cnVjdG9yLm9wZXJhdGlvbktpbmQgaXMgJ3RleHQtb2JqZWN0J1xuXG4gIGdldEN1cnNvckJ1ZmZlclBvc2l0aW9uOiAtPlxuICAgIGlmIEBtb2RlIGlzICd2aXN1YWwnXG4gICAgICBAZ2V0Q3Vyc29yUG9zaXRpb25Gb3JTZWxlY3Rpb24oQGVkaXRvci5nZXRMYXN0U2VsZWN0aW9uKCkpXG4gICAgZWxzZVxuICAgICAgQGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpXG5cbiAgZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb25zOiAtPlxuICAgIGlmIEBtb2RlIGlzICd2aXN1YWwnXG4gICAgICBAZWRpdG9yLmdldFNlbGVjdGlvbnMoKS5tYXAoQGdldEN1cnNvclBvc2l0aW9uRm9yU2VsZWN0aW9uLmJpbmQodGhpcykpXG4gICAgZWxzZVxuICAgICAgQGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbnMoKVxuXG4gIGdldEJ1ZmZlclBvc2l0aW9uRm9yQ3Vyc29yOiAoY3Vyc29yKSAtPlxuICAgIGlmIEBtb2RlIGlzICd2aXN1YWwnXG4gICAgICBAZ2V0Q3Vyc29yUG9zaXRpb25Gb3JTZWxlY3Rpb24oY3Vyc29yLnNlbGVjdGlvbilcbiAgICBlbHNlXG4gICAgICBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuXG4gIGdldEN1cnNvclBvc2l0aW9uRm9yU2VsZWN0aW9uOiAoc2VsZWN0aW9uKSAtPlxuICAgIEBzd3JhcChzZWxlY3Rpb24pLmdldEJ1ZmZlclBvc2l0aW9uRm9yKCdoZWFkJywgZnJvbTogWydwcm9wZXJ0eScsICdzZWxlY3Rpb24nXSlcblxuICB0b1N0cmluZzogLT5cbiAgICBzdHIgPSBAbmFtZVxuICAgIGlmIEB0YXJnZXQ/XG4gICAgICBzdHIgKz0gXCIsIHRhcmdldD0je0B0YXJnZXQubmFtZX0sIHRhcmdldC53aXNlPSN7QHRhcmdldC53aXNlfSBcIlxuICAgIGVsc2UgaWYgQG9wZXJhdG9yP1xuICAgICAgc3RyICs9IFwiLCB3aXNlPSN7QHdpc2V9ICwgb3BlcmF0b3I9I3tAb3BlcmF0b3IubmFtZX1cIlxuICAgIGVsc2VcbiAgICAgIHN0clxuXG4gICMgQ2xhc3MgbWV0aG9kc1xuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgQHdyaXRlQ29tbWFuZFRhYmxlT25EaXNrOiAtPlxuICAgIGNvbW1hbmRUYWJsZSA9IEBnZW5lcmF0ZUNvbW1hbmRUYWJsZUJ5RWFnZXJMb2FkKClcbiAgICBfID0gX3BsdXMoKVxuICAgIGlmIF8uaXNFcXVhbChAY29tbWFuZFRhYmxlLCBjb21tYW5kVGFibGUpXG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkSW5mbyhcIk5vIGNoYW5nZSBjb21tYW5kVGFibGVcIiwgZGlzbWlzc2FibGU6IHRydWUpXG4gICAgICByZXR1cm5cblxuICAgIENTT04gPz0gcmVxdWlyZSAnc2Vhc29uJ1xuICAgIHBhdGggPz0gcmVxdWlyZSgncGF0aCcpXG5cbiAgICBsb2FkYWJsZUNTT05UZXh0ID0gXCJcIlwiXG4gICAgICAjIFRoaXMgZmlsZSBpcyBhdXRvIGdlbmVyYXRlZCBieSBgdmltLW1vZGUtcGx1czp3cml0ZS1jb21tYW5kLXRhYmxlLW9uLWRpc2tgIGNvbW1hbmQuXG4gICAgICAjIERPTlQgZWRpdCBtYW51YWxseS5cbiAgICAgIG1vZHVsZS5leHBvcnRzID1cbiAgICAgICN7Q1NPTi5zdHJpbmdpZnkoY29tbWFuZFRhYmxlKX1cXG5cbiAgICAgIFwiXCJcIlxuICAgIGNvbW1hbmRUYWJsZVBhdGggPSBwYXRoLmpvaW4oX19kaXJuYW1lLCBcImNvbW1hbmQtdGFibGUuY29mZmVlXCIpXG4gICAgYXRvbS53b3Jrc3BhY2Uub3Blbihjb21tYW5kVGFibGVQYXRoKS50aGVuIChlZGl0b3IpIC0+XG4gICAgICBlZGl0b3Iuc2V0VGV4dChsb2FkYWJsZUNTT05UZXh0KVxuICAgICAgZWRpdG9yLnNhdmUoKVxuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEluZm8oXCJVcGRhdGVkIGNvbW1hbmRUYWJsZVwiLCBkaXNtaXNzYWJsZTogdHJ1ZSlcblxuICBAZ2VuZXJhdGVDb21tYW5kVGFibGVCeUVhZ2VyTG9hZDogLT5cbiAgICAjIE5PVEU6IGNoYW5naW5nIG9yZGVyIGFmZmVjdHMgb3V0cHV0IG9mIGxpYi9jb21tYW5kLXRhYmxlLmNvZmZlZVxuICAgIGZpbGVzVG9Mb2FkID0gW1xuICAgICAgJy4vb3BlcmF0b3InLCAnLi9vcGVyYXRvci1pbnNlcnQnLCAnLi9vcGVyYXRvci10cmFuc2Zvcm0tc3RyaW5nJyxcbiAgICAgICcuL21vdGlvbicsICcuL21vdGlvbi1zZWFyY2gnLCAnLi90ZXh0LW9iamVjdCcsICcuL21pc2MtY29tbWFuZCdcbiAgICBdXG4gICAgZmlsZXNUb0xvYWQuZm9yRWFjaChsb2FkVm1wT3BlcmF0aW9uRmlsZSlcbiAgICBfID0gX3BsdXMoKVxuICAgIGtsYXNzZXMgPSBfLnZhbHVlcyhAZ2V0Q2xhc3NSZWdpc3RyeSgpKVxuICAgIGtsYXNzZXNHcm91cGVkQnlGaWxlID0gXy5ncm91cEJ5KGtsYXNzZXMsIChrbGFzcykgLT4ga2xhc3MuVk1QX0xPQURJTkdfRklMRSlcblxuICAgIGNvbW1hbmRUYWJsZSA9IHt9XG4gICAgZm9yIGZpbGUgaW4gZmlsZXNUb0xvYWRcbiAgICAgIGZvciBrbGFzcyBpbiBrbGFzc2VzR3JvdXBlZEJ5RmlsZVtmaWxlXVxuICAgICAgICBjb21tYW5kVGFibGVba2xhc3MubmFtZV0gPSBrbGFzcy5nZXRTcGVjKClcbiAgICBjb21tYW5kVGFibGVcblxuICBAY29tbWFuZFRhYmxlOiBudWxsXG4gIEBpbml0OiAoX2dldEVkaXRvclN0YXRlKSAtPlxuICAgIGdldEVkaXRvclN0YXRlID0gX2dldEVkaXRvclN0YXRlXG4gICAgQGNvbW1hbmRUYWJsZSA9IHJlcXVpcmUoJy4vY29tbWFuZC10YWJsZScpXG4gICAgc3Vic2NyaXB0aW9ucyA9IFtdXG4gICAgZm9yIG5hbWUsIHNwZWMgb2YgQGNvbW1hbmRUYWJsZSB3aGVuIHNwZWMuY29tbWFuZE5hbWU/XG4gICAgICBzdWJzY3JpcHRpb25zLnB1c2goQHJlZ2lzdGVyQ29tbWFuZEZyb21TcGVjKG5hbWUsIHNwZWMpKVxuICAgIHJldHVybiBzdWJzY3JpcHRpb25zXG5cbiAgY2xhc3NSZWdpc3RyeSA9IHtCYXNlfVxuICBAZXh0ZW5kOiAoQGNvbW1hbmQ9dHJ1ZSkgLT5cbiAgICBAVk1QX0xPQURJTkdfRklMRSA9IFZNUF9MT0FESU5HX0ZJTEVcbiAgICBpZiBAbmFtZSBvZiBjbGFzc1JlZ2lzdHJ5XG4gICAgICBjb25zb2xlLndhcm4oXCJEdXBsaWNhdGUgY29uc3RydWN0b3IgI3tAbmFtZX1cIilcbiAgICBjbGFzc1JlZ2lzdHJ5W0BuYW1lXSA9IHRoaXNcblxuICBAZ2V0U3BlYzogLT5cbiAgICBpZiBAaXNDb21tYW5kKClcbiAgICAgIGZpbGU6IEBWTVBfTE9BRElOR19GSUxFXG4gICAgICBjb21tYW5kTmFtZTogQGdldENvbW1hbmROYW1lKClcbiAgICAgIGNvbW1hbmRTY29wZTogQGdldENvbW1hbmRTY29wZSgpXG4gICAgZWxzZVxuICAgICAgZmlsZTogQFZNUF9MT0FESU5HX0ZJTEVcblxuICBAZ2V0Q2xhc3M6IChuYW1lKSAtPlxuICAgIHJldHVybiBrbGFzcyBpZiAoa2xhc3MgPSBjbGFzc1JlZ2lzdHJ5W25hbWVdKVxuXG4gICAgZmlsZVRvTG9hZCA9IEBjb21tYW5kVGFibGVbbmFtZV0uZmlsZVxuICAgIGlmIGZpbGVUb0xvYWQgbm90IGluIFZNUF9MT0FERURfRklMRVNcbiAgICAgIGlmIGF0b20uaW5EZXZNb2RlKCkgYW5kIHNldHRpbmdzLmdldCgnZGVidWcnKVxuICAgICAgICBjb25zb2xlLmxvZyBcImxhenktcmVxdWlyZTogI3tmaWxlVG9Mb2FkfSBmb3IgI3tuYW1lfVwiXG4gICAgICBsb2FkVm1wT3BlcmF0aW9uRmlsZShmaWxlVG9Mb2FkKVxuICAgICAgcmV0dXJuIGtsYXNzIGlmIChrbGFzcyA9IGNsYXNzUmVnaXN0cnlbbmFtZV0pXG5cbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJjbGFzcyAnI3tuYW1lfScgbm90IGZvdW5kXCIpXG5cbiAgQGdldENsYXNzUmVnaXN0cnk6IC0+XG4gICAgY2xhc3NSZWdpc3RyeVxuXG4gIEBpc0NvbW1hbmQ6IC0+XG4gICAgQGNvbW1hbmRcblxuICBAY29tbWFuZFByZWZpeDogJ3ZpbS1tb2RlLXBsdXMnXG4gIEBnZXRDb21tYW5kTmFtZTogLT5cbiAgICBAY29tbWFuZFByZWZpeCArICc6JyArIF9wbHVzKCkuZGFzaGVyaXplKEBuYW1lKVxuXG4gIEBnZXRDb21tYW5kTmFtZVdpdGhvdXRQcmVmaXg6IC0+XG4gICAgX3BsdXMoKS5kYXNoZXJpemUoQG5hbWUpXG5cbiAgQGNvbW1hbmRTY29wZTogJ2F0b20tdGV4dC1lZGl0b3InXG4gIEBnZXRDb21tYW5kU2NvcGU6IC0+XG4gICAgQGNvbW1hbmRTY29wZVxuXG4gIEBnZXREZXNjdGlwdGlvbjogLT5cbiAgICBpZiBAaGFzT3duUHJvcGVydHkoXCJkZXNjcmlwdGlvblwiKVxuICAgICAgQGRlc2NyaXB0aW9uXG4gICAgZWxzZVxuICAgICAgbnVsbFxuXG4gIEByZWdpc3RlckNvbW1hbmQ6IC0+XG4gICAga2xhc3MgPSB0aGlzXG4gICAgYXRvbS5jb21tYW5kcy5hZGQgQGdldENvbW1hbmRTY29wZSgpLCBAZ2V0Q29tbWFuZE5hbWUoKSwgKGV2ZW50KSAtPlxuICAgICAgdmltU3RhdGUgPSBnZXRFZGl0b3JTdGF0ZShAZ2V0TW9kZWwoKSkgPyBnZXRFZGl0b3JTdGF0ZShhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCkpXG4gICAgICBpZiB2aW1TdGF0ZT8gIyBQb3NzaWJseSB1bmRlZmluZWQgU2VlICM4NVxuICAgICAgICB2aW1TdGF0ZS5vcGVyYXRpb25TdGFjay5ydW4oa2xhc3MpXG4gICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuXG4gIEByZWdpc3RlckNvbW1hbmRGcm9tU3BlYzogKG5hbWUsIHNwZWMpIC0+XG4gICAge2NvbW1hbmRTY29wZSwgY29tbWFuZFByZWZpeCwgY29tbWFuZE5hbWUsIGdldENsYXNzfSA9IHNwZWNcbiAgICBjb21tYW5kU2NvcGUgPz0gJ2F0b20tdGV4dC1lZGl0b3InXG4gICAgY29tbWFuZE5hbWUgPz0gKGNvbW1hbmRQcmVmaXggPyAndmltLW1vZGUtcGx1cycpICsgJzonICsgX3BsdXMoKS5kYXNoZXJpemUobmFtZSlcbiAgICBhdG9tLmNvbW1hbmRzLmFkZCBjb21tYW5kU2NvcGUsIGNvbW1hbmROYW1lLCAoZXZlbnQpIC0+XG4gICAgICB2aW1TdGF0ZSA9IGdldEVkaXRvclN0YXRlKEBnZXRNb2RlbCgpKSA/IGdldEVkaXRvclN0YXRlKGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKSlcbiAgICAgIGlmIHZpbVN0YXRlPyAjIFBvc3NpYmx5IHVuZGVmaW5lZCBTZWUgIzg1XG4gICAgICAgIGlmIGdldENsYXNzP1xuICAgICAgICAgIHZpbVN0YXRlLm9wZXJhdGlvblN0YWNrLnJ1bihnZXRDbGFzcyhuYW1lKSlcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHZpbVN0YXRlLm9wZXJhdGlvblN0YWNrLnJ1bihuYW1lKVxuICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcblxuICAjIEZvciBkZW1vLW1vZGUgcGtnIGludGVncmF0aW9uXG4gIEBvcGVyYXRpb25LaW5kOiBudWxsXG4gIEBnZXRLaW5kRm9yQ29tbWFuZE5hbWU6IChjb21tYW5kKSAtPlxuICAgIGNvbW1hbmQgPSBjb21tYW5kLnJlcGxhY2UoL152aW0tbW9kZS1wbHVzOi8sIFwiXCIpXG4gICAgXyA9IF9wbHVzKClcbiAgICBuYW1lID0gXy5jYXBpdGFsaXplKF8uY2FtZWxpemUoY29tbWFuZCkpXG4gICAgaWYgbmFtZSBvZiBjbGFzc1JlZ2lzdHJ5XG4gICAgICBjbGFzc1JlZ2lzdHJ5W25hbWVdLm9wZXJhdGlvbktpbmRcblxubW9kdWxlLmV4cG9ydHMgPSBCYXNlXG4iXX0=
