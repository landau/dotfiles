(function() {
  var Base, CSON, Delegato, Input, OperationAbortedError, VMP_LOADED_FILES, VMP_LOADING_FILE, __plus, _plus, getEditorState, loadVmpOperationFile, path, ref, selectList, settings, vimStateMethods,
    slice = [].slice,
    hasProp = {}.hasOwnProperty,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  __plus = null;

  _plus = function() {
    return __plus != null ? __plus : __plus = require('underscore-plus');
  };

  Delegato = require('delegato');

  settings = require('./settings');

  ref = [], CSON = ref[0], path = ref[1], Input = ref[2], selectList = ref[3], getEditorState = ref[4];

  VMP_LOADING_FILE = null;

  VMP_LOADED_FILES = [];

  loadVmpOperationFile = function(filename) {
    var loaded;
    VMP_LOADING_FILE = filename;
    loaded = require(filename);
    VMP_LOADING_FILE = null;
    VMP_LOADED_FILES.push(filename);
    return loaded;
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

    Base.prototype.newInputUI = function() {
      if (Input == null) {
        Input = require('./input');
      }
      return new Input(this.vimState);
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
      return this.vimState.operationStack.cancel();
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
        selectList = require('./select-list');
      }
      return selectList.show(this.vimState, options);
    };

    Base.prototype.input = null;

    Base.prototype.focusInput = function(options) {
      var inputUI;
      inputUI = this.newInputUI();
      inputUI.onDidConfirm((function(_this) {
        return function(input) {
          _this.input = input;
          return _this.processOperation();
        };
      })(this));
      if ((options != null ? options.charsMax : void 0) > 1) {
        inputUI.onDidChange((function(_this) {
          return function(input) {
            return _this.vimState.hover.set(input);
          };
        })(this));
      }
      inputUI.onDidCancel(this.cancelOperation.bind(this));
      return inputUI.focus(options);
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
      loadableCSONText = "module.exports =\n" + CSON.stringify(commandTable) + "\n";
      commandTablePath = path.join(__dirname, "command-table.coffee");
      return atom.workspace.open(commandTablePath, {
        activateItem: false
      }).then(function(editor) {
        editor.setText(loadableCSONText);
        editor.save();
        editor.destroy();
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
        throw new Error("Duplicate constructor " + this.name);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvYmFzZS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0E7QUFBQSxNQUFBLDZMQUFBO0lBQUE7Ozs7RUFBQSxNQUFBLEdBQVM7O0VBQ1QsS0FBQSxHQUFRLFNBQUE7NEJBQ04sU0FBQSxTQUFVLE9BQUEsQ0FBUSxpQkFBUjtFQURKOztFQUdSLFFBQUEsR0FBVyxPQUFBLENBQVEsVUFBUjs7RUFDWCxRQUFBLEdBQVcsT0FBQSxDQUFRLFlBQVI7O0VBRVgsTUFNSSxFQU5KLEVBQ0UsYUFERixFQUVFLGFBRkYsRUFHRSxjQUhGLEVBSUUsbUJBSkYsRUFLRTs7RUFHRixnQkFBQSxHQUFtQjs7RUFDbkIsZ0JBQUEsR0FBbUI7O0VBRW5CLG9CQUFBLEdBQXVCLFNBQUMsUUFBRDtBQUNyQixRQUFBO0lBQUEsZ0JBQUEsR0FBbUI7SUFDbkIsTUFBQSxHQUFTLE9BQUEsQ0FBUSxRQUFSO0lBQ1QsZ0JBQUEsR0FBbUI7SUFDbkIsZ0JBQWdCLENBQUMsSUFBakIsQ0FBc0IsUUFBdEI7V0FDQTtFQUxxQjs7RUFPdkIscUJBQUEsR0FBd0I7O0VBRXhCLGVBQUEsR0FBa0IsQ0FDaEIsbUJBRGdCLEVBRWhCLG9CQUZnQixFQUdoQixtQkFIZ0IsRUFJaEIsb0JBSmdCLEVBT2hCLGdCQVBnQixFQU9FLGtCQVBGLEVBUWQsb0JBUmMsRUFRUSxzQkFSUixFQVNkLG1CQVRjLEVBU08scUJBVFAsRUFVZCx1QkFWYyxFQVVXLHlCQVZYLEVBWWQsc0JBWmMsRUFZVSx3QkFaVixFQWFkLHFCQWJjLEVBYVMsdUJBYlQsRUFjaEIsc0JBZGdCLEVBZWhCLDBCQWZnQixFQWlCaEIsMEJBakJnQixFQW1CaEIsb0JBbkJnQixFQW9CaEIsbUJBcEJnQixFQXFCaEIsMkJBckJnQixFQXNCaEIsc0JBdEJnQixFQXVCaEIscUJBdkJnQixF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QUFDLFVBQUYsQ0FBYSxDQUFDLENBQUMsUUFBRixDQUFXLE9BQVgsQ0FBYjtNQUNQLElBQUcsSUFBQSxJQUFRLGFBQVg7ZUFDRSxhQUFjLENBQUEsSUFBQSxDQUFLLENBQUMsY0FEdEI7O0lBSHNCOzs7Ozs7RUFNMUIsTUFBTSxDQUFDLE9BQVAsR0FBaUI7QUF6WGpCIiwic291cmNlc0NvbnRlbnQiOlsiIyBUbyBhdm9pZCBsb2FkaW5nIHVuZGVyc2NvcmUtcGx1cyBhbmQgZGVwZW5kaW5nIHVuZGVyc2NvcmUgb24gc3RhcnR1cFxuX19wbHVzID0gbnVsbFxuX3BsdXMgPSAtPlxuICBfX3BsdXMgPz0gcmVxdWlyZSAndW5kZXJzY29yZS1wbHVzJ1xuXG5EZWxlZ2F0byA9IHJlcXVpcmUgJ2RlbGVnYXRvJ1xuc2V0dGluZ3MgPSByZXF1aXJlICcuL3NldHRpbmdzJ1xuXG5bXG4gIENTT05cbiAgcGF0aFxuICBJbnB1dFxuICBzZWxlY3RMaXN0XG4gIGdldEVkaXRvclN0YXRlICAjIHNldCBieSBCYXNlLmluaXQoKVxuXSA9IFtdICMgc2V0IG51bGxcblxuVk1QX0xPQURJTkdfRklMRSA9IG51bGxcblZNUF9MT0FERURfRklMRVMgPSBbXVxuXG5sb2FkVm1wT3BlcmF0aW9uRmlsZSA9IChmaWxlbmFtZSkgLT5cbiAgVk1QX0xPQURJTkdfRklMRSA9IGZpbGVuYW1lXG4gIGxvYWRlZCA9IHJlcXVpcmUoZmlsZW5hbWUpXG4gIFZNUF9MT0FESU5HX0ZJTEUgPSBudWxsXG4gIFZNUF9MT0FERURfRklMRVMucHVzaChmaWxlbmFtZSlcbiAgbG9hZGVkXG5cbk9wZXJhdGlvbkFib3J0ZWRFcnJvciA9IG51bGxcblxudmltU3RhdGVNZXRob2RzID0gW1xuICBcIm9uRGlkQ2hhbmdlU2VhcmNoXCJcbiAgXCJvbkRpZENvbmZpcm1TZWFyY2hcIlxuICBcIm9uRGlkQ2FuY2VsU2VhcmNoXCJcbiAgXCJvbkRpZENvbW1hbmRTZWFyY2hcIlxuXG4gICMgTGlmZSBjeWNsZSBvZiBvcGVyYXRpb25TdGFja1xuICBcIm9uRGlkU2V0VGFyZ2V0XCIsIFwiZW1pdERpZFNldFRhcmdldFwiXG4gICAgXCJvbldpbGxTZWxlY3RUYXJnZXRcIiwgXCJlbWl0V2lsbFNlbGVjdFRhcmdldFwiXG4gICAgXCJvbkRpZFNlbGVjdFRhcmdldFwiLCBcImVtaXREaWRTZWxlY3RUYXJnZXRcIlxuICAgIFwib25EaWRGYWlsU2VsZWN0VGFyZ2V0XCIsIFwiZW1pdERpZEZhaWxTZWxlY3RUYXJnZXRcIlxuXG4gICAgXCJvbldpbGxGaW5pc2hNdXRhdGlvblwiLCBcImVtaXRXaWxsRmluaXNoTXV0YXRpb25cIlxuICAgIFwib25EaWRGaW5pc2hNdXRhdGlvblwiLCBcImVtaXREaWRGaW5pc2hNdXRhdGlvblwiXG4gIFwib25EaWRGaW5pc2hPcGVyYXRpb25cIlxuICBcIm9uRGlkUmVzZXRPcGVyYXRpb25TdGFja1wiXG5cbiAgXCJvbkRpZFNldE9wZXJhdG9yTW9kaWZpZXJcIlxuXG4gIFwib25XaWxsQWN0aXZhdGVNb2RlXCJcbiAgXCJvbkRpZEFjdGl2YXRlTW9kZVwiXG4gIFwicHJlZW1wdFdpbGxEZWFjdGl2YXRlTW9kZVwiXG4gIFwib25XaWxsRGVhY3RpdmF0ZU1vZGVcIlxuICBcIm9uRGlkRGVhY3RpdmF0ZU1vZGVcIlxuXG4gIFwib25EaWRDYW5jZWxTZWxlY3RMaXN0XCJcbiAgXCJzdWJzY3JpYmVcIlxuICBcImlzTW9kZVwiXG4gIFwiZ2V0QmxvY2t3aXNlU2VsZWN0aW9uc1wiXG4gIFwiZ2V0TGFzdEJsb2Nrd2lzZVNlbGVjdGlvblwiXG4gIFwiYWRkVG9DbGFzc0xpc3RcIlxuICBcImdldENvbmZpZ1wiXG5dXG5cbmNsYXNzIEJhc2VcbiAgRGVsZWdhdG8uaW5jbHVkZUludG8odGhpcylcbiAgQGRlbGVnYXRlc01ldGhvZHModmltU3RhdGVNZXRob2RzLi4uLCB0b1Byb3BlcnR5OiAndmltU3RhdGUnKVxuICBAZGVsZWdhdGVzUHJvcGVydHkoJ21vZGUnLCAnc3VibW9kZScsICdzd3JhcCcsICd1dGlscycsIHRvUHJvcGVydHk6ICd2aW1TdGF0ZScpXG5cbiAgY29uc3RydWN0b3I6IChAdmltU3RhdGUsIHByb3BlcnRpZXM9bnVsbCkgLT5cbiAgICB7QGVkaXRvciwgQGVkaXRvckVsZW1lbnQsIEBnbG9iYWxTdGF0ZSwgQHN3cmFwfSA9IEB2aW1TdGF0ZVxuICAgIEBuYW1lID0gQGNvbnN0cnVjdG9yLm5hbWVcbiAgICBPYmplY3QuYXNzaWduKHRoaXMsIHByb3BlcnRpZXMpIGlmIHByb3BlcnRpZXM/XG5cbiAgIyBUbyBvdmVycmlkZVxuICBpbml0aWFsaXplOiAtPlxuXG4gICMgT3BlcmF0aW9uIHByb2Nlc3NvciBleGVjdXRlIG9ubHkgd2hlbiBpc0NvbXBsZXRlKCkgcmV0dXJuIHRydWUuXG4gICMgSWYgZmFsc2UsIG9wZXJhdGlvbiBwcm9jZXNzb3IgcG9zdHBvbmUgaXRzIGV4ZWN1dGlvbi5cbiAgaXNDb21wbGV0ZTogLT5cbiAgICBpZiBAcmVxdWlyZUlucHV0IGFuZCBub3QgQGlucHV0P1xuICAgICAgZmFsc2VcbiAgICBlbHNlIGlmIEByZXF1aXJlVGFyZ2V0XG4gICAgICAjIFdoZW4gdGhpcyBmdW5jdGlvbiBpcyBjYWxsZWQgaW4gQmFzZTo6Y29uc3RydWN0b3JcbiAgICAgICMgdGFnZXJ0IGlzIHN0aWxsIHN0cmluZyBsaWtlIGBNb3ZlVG9SaWdodGAsIGluIHRoaXMgY2FzZSBpc0NvbXBsZXRlXG4gICAgICAjIGlzIG5vdCBhdmFpbGFibGUuXG4gICAgICBAdGFyZ2V0Py5pc0NvbXBsZXRlPygpXG4gICAgZWxzZVxuICAgICAgdHJ1ZVxuXG4gIHJlcXVpcmVUYXJnZXQ6IGZhbHNlXG4gIHJlcXVpcmVJbnB1dDogZmFsc2VcbiAgcmVjb3JkYWJsZTogZmFsc2VcbiAgcmVwZWF0ZWQ6IGZhbHNlXG4gIHRhcmdldDogbnVsbCAjIFNldCBpbiBPcGVyYXRvclxuICBvcGVyYXRvcjogbnVsbCAjIFNldCBpbiBvcGVyYXRvcidzIHRhcmdldCggTW90aW9uIG9yIFRleHRPYmplY3QgKVxuICBpc0FzVGFyZ2V0RXhjZXB0U2VsZWN0OiAtPlxuICAgIEBvcGVyYXRvcj8gYW5kIG5vdCBAb3BlcmF0b3IuaW5zdGFuY2VvZignU2VsZWN0JylcblxuICBhYm9ydDogLT5cbiAgICBPcGVyYXRpb25BYm9ydGVkRXJyb3IgPz0gcmVxdWlyZSAnLi9lcnJvcnMnXG4gICAgdGhyb3cgbmV3IE9wZXJhdGlvbkFib3J0ZWRFcnJvcignYWJvcnRlZCcpXG5cbiAgIyBDb3VudFxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgY291bnQ6IG51bGxcbiAgZGVmYXVsdENvdW50OiAxXG4gIGdldENvdW50OiAob2Zmc2V0PTApIC0+XG4gICAgQGNvdW50ID89IEB2aW1TdGF0ZS5nZXRDb3VudCgpID8gQGRlZmF1bHRDb3VudFxuICAgIEBjb3VudCArIG9mZnNldFxuXG4gIHJlc2V0Q291bnQ6IC0+XG4gICAgQGNvdW50ID0gbnVsbFxuXG4gIGlzRGVmYXVsdENvdW50OiAtPlxuICAgIEBjb3VudCBpcyBAZGVmYXVsdENvdW50XG5cbiAgIyBNaXNjXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBjb3VudFRpbWVzOiAobGFzdCwgZm4pIC0+XG4gICAgcmV0dXJuIGlmIGxhc3QgPCAxXG5cbiAgICBzdG9wcGVkID0gZmFsc2VcbiAgICBzdG9wID0gLT4gc3RvcHBlZCA9IHRydWVcbiAgICBmb3IgY291bnQgaW4gWzEuLmxhc3RdXG4gICAgICBpc0ZpbmFsID0gY291bnQgaXMgbGFzdFxuICAgICAgZm4oe2NvdW50LCBpc0ZpbmFsLCBzdG9wfSlcbiAgICAgIGJyZWFrIGlmIHN0b3BwZWRcblxuICBhY3RpdmF0ZU1vZGU6IChtb2RlLCBzdWJtb2RlKSAtPlxuICAgIEBvbkRpZEZpbmlzaE9wZXJhdGlvbiA9PlxuICAgICAgQHZpbVN0YXRlLmFjdGl2YXRlKG1vZGUsIHN1Ym1vZGUpXG5cbiAgYWN0aXZhdGVNb2RlSWZOZWNlc3Nhcnk6IChtb2RlLCBzdWJtb2RlKSAtPlxuICAgIHVubGVzcyBAdmltU3RhdGUuaXNNb2RlKG1vZGUsIHN1Ym1vZGUpXG4gICAgICBAYWN0aXZhdGVNb2RlKG1vZGUsIHN1Ym1vZGUpXG5cbiAgbmV3OiAobmFtZSwgcHJvcGVydGllcykgLT5cbiAgICBrbGFzcyA9IEJhc2UuZ2V0Q2xhc3MobmFtZSlcbiAgICBuZXcga2xhc3MoQHZpbVN0YXRlLCBwcm9wZXJ0aWVzKVxuXG4gIG5ld0lucHV0VUk6IC0+XG4gICAgSW5wdXQgPz0gcmVxdWlyZSAnLi9pbnB1dCdcbiAgICBuZXcgSW5wdXQoQHZpbVN0YXRlKVxuXG4gICMgRklYTUU6IFRoaXMgaXMgdXNlZCB0byBjbG9uZSBNb3Rpb246OlNlYXJjaCB0byBzdXBwb3J0IGBuYCBhbmQgYE5gXG4gICMgQnV0IG1hbnVhbCByZXNldGluZyBhbmQgb3ZlcnJpZGluZyBwcm9wZXJ0eSBpcyBidWcgcHJvbmUuXG4gICMgU2hvdWxkIGV4dHJhY3QgYXMgc2VhcmNoIHNwZWMgb2JqZWN0IGFuZCB1c2UgaXQgYnlcbiAgIyBjcmVhdGluZyBjbGVhbiBpbnN0YW5jZSBvZiBTZWFyY2guXG4gIGNsb25lOiAodmltU3RhdGUpIC0+XG4gICAgcHJvcGVydGllcyA9IHt9XG4gICAgZXhjbHVkZVByb3BlcnRpZXMgPSBbJ2VkaXRvcicsICdlZGl0b3JFbGVtZW50JywgJ2dsb2JhbFN0YXRlJywgJ3ZpbVN0YXRlJywgJ29wZXJhdG9yJ11cbiAgICBmb3Igb3duIGtleSwgdmFsdWUgb2YgdGhpcyB3aGVuIGtleSBub3QgaW4gZXhjbHVkZVByb3BlcnRpZXNcbiAgICAgIHByb3BlcnRpZXNba2V5XSA9IHZhbHVlXG4gICAga2xhc3MgPSB0aGlzLmNvbnN0cnVjdG9yXG4gICAgbmV3IGtsYXNzKHZpbVN0YXRlLCBwcm9wZXJ0aWVzKVxuXG4gIGNhbmNlbE9wZXJhdGlvbjogLT5cbiAgICBAdmltU3RhdGUub3BlcmF0aW9uU3RhY2suY2FuY2VsKClcblxuICBwcm9jZXNzT3BlcmF0aW9uOiAtPlxuICAgIEB2aW1TdGF0ZS5vcGVyYXRpb25TdGFjay5wcm9jZXNzKClcblxuICBmb2N1c1NlbGVjdExpc3Q6IChvcHRpb25zPXt9KSAtPlxuICAgIEBvbkRpZENhbmNlbFNlbGVjdExpc3QgPT5cbiAgICAgIEBjYW5jZWxPcGVyYXRpb24oKVxuICAgIHNlbGVjdExpc3QgPz0gcmVxdWlyZSAnLi9zZWxlY3QtbGlzdCdcbiAgICBzZWxlY3RMaXN0LnNob3coQHZpbVN0YXRlLCBvcHRpb25zKVxuXG4gIGlucHV0OiBudWxsXG4gIGZvY3VzSW5wdXQ6IChvcHRpb25zKSAtPlxuICAgIGlucHV0VUkgPSBAbmV3SW5wdXRVSSgpXG4gICAgaW5wdXRVSS5vbkRpZENvbmZpcm0gKGlucHV0KSA9PlxuICAgICAgQGlucHV0ID0gaW5wdXRcbiAgICAgIEBwcm9jZXNzT3BlcmF0aW9uKClcblxuICAgIGlmIG9wdGlvbnM/LmNoYXJzTWF4ID4gMVxuICAgICAgaW5wdXRVSS5vbkRpZENoYW5nZSAoaW5wdXQpID0+XG4gICAgICAgIEB2aW1TdGF0ZS5ob3Zlci5zZXQoaW5wdXQpXG5cbiAgICBpbnB1dFVJLm9uRGlkQ2FuY2VsKEBjYW5jZWxPcGVyYXRpb24uYmluZCh0aGlzKSlcbiAgICBpbnB1dFVJLmZvY3VzKG9wdGlvbnMpXG5cbiAgZ2V0VmltRW9mQnVmZmVyUG9zaXRpb246IC0+XG4gICAgQHV0aWxzLmdldFZpbUVvZkJ1ZmZlclBvc2l0aW9uKEBlZGl0b3IpXG5cbiAgZ2V0VmltTGFzdEJ1ZmZlclJvdzogLT5cbiAgICBAdXRpbHMuZ2V0VmltTGFzdEJ1ZmZlclJvdyhAZWRpdG9yKVxuXG4gIGdldFZpbUxhc3RTY3JlZW5Sb3c6IC0+XG4gICAgQHV0aWxzLmdldFZpbUxhc3RTY3JlZW5Sb3coQGVkaXRvcilcblxuICBnZXRXb3JkQnVmZmVyUmFuZ2VBbmRLaW5kQXRCdWZmZXJQb3NpdGlvbjogKHBvaW50LCBvcHRpb25zKSAtPlxuICAgIEB1dGlscy5nZXRXb3JkQnVmZmVyUmFuZ2VBbmRLaW5kQXRCdWZmZXJQb3NpdGlvbihAZWRpdG9yLCBwb2ludCwgb3B0aW9ucylcblxuICBnZXRGaXJzdENoYXJhY3RlclBvc2l0aW9uRm9yQnVmZmVyUm93OiAocm93KSAtPlxuICAgIEB1dGlscy5nZXRGaXJzdENoYXJhY3RlclBvc2l0aW9uRm9yQnVmZmVyUm93KEBlZGl0b3IsIHJvdylcblxuICBnZXRCdWZmZXJSYW5nZUZvclJvd1JhbmdlOiAocm93UmFuZ2UpIC0+XG4gICAgQHV0aWxzLmdldEJ1ZmZlclJhbmdlRm9yUm93UmFuZ2UoQGVkaXRvciwgcm93UmFuZ2UpXG5cbiAgZ2V0SW5kZW50TGV2ZWxGb3JCdWZmZXJSb3c6IChyb3cpIC0+XG4gICAgQHV0aWxzLmdldEluZGVudExldmVsRm9yQnVmZmVyUm93KEBlZGl0b3IsIHJvdylcblxuICBzY2FuRm9yd2FyZDogKGFyZ3MuLi4pIC0+XG4gICAgQHV0aWxzLnNjYW5FZGl0b3JJbkRpcmVjdGlvbihAZWRpdG9yLCAnZm9yd2FyZCcsIGFyZ3MuLi4pXG5cbiAgc2NhbkJhY2t3YXJkOiAoYXJncy4uLikgLT5cbiAgICBAdXRpbHMuc2NhbkVkaXRvckluRGlyZWN0aW9uKEBlZGl0b3IsICdiYWNrd2FyZCcsIGFyZ3MuLi4pXG5cbiAgaW5zdGFuY2VvZjogKGtsYXNzTmFtZSkgLT5cbiAgICB0aGlzIGluc3RhbmNlb2YgQmFzZS5nZXRDbGFzcyhrbGFzc05hbWUpXG5cbiAgaXM6IChrbGFzc05hbWUpIC0+XG4gICAgdGhpcy5jb25zdHJ1Y3RvciBpcyBCYXNlLmdldENsYXNzKGtsYXNzTmFtZSlcblxuICBpc09wZXJhdG9yOiAtPlxuICAgIEBjb25zdHJ1Y3Rvci5vcGVyYXRpb25LaW5kIGlzICdvcGVyYXRvcidcblxuICBpc01vdGlvbjogLT5cbiAgICBAY29uc3RydWN0b3Iub3BlcmF0aW9uS2luZCBpcyAnbW90aW9uJ1xuXG4gIGlzVGV4dE9iamVjdDogLT5cbiAgICBAY29uc3RydWN0b3Iub3BlcmF0aW9uS2luZCBpcyAndGV4dC1vYmplY3QnXG5cbiAgZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb246IC0+XG4gICAgaWYgQG1vZGUgaXMgJ3Zpc3VhbCdcbiAgICAgIEBnZXRDdXJzb3JQb3NpdGlvbkZvclNlbGVjdGlvbihAZWRpdG9yLmdldExhc3RTZWxlY3Rpb24oKSlcbiAgICBlbHNlXG4gICAgICBAZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKClcblxuICBnZXRDdXJzb3JCdWZmZXJQb3NpdGlvbnM6IC0+XG4gICAgaWYgQG1vZGUgaXMgJ3Zpc3VhbCdcbiAgICAgIEBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpLm1hcChAZ2V0Q3Vyc29yUG9zaXRpb25Gb3JTZWxlY3Rpb24uYmluZCh0aGlzKSlcbiAgICBlbHNlXG4gICAgICBAZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9ucygpXG5cbiAgZ2V0QnVmZmVyUG9zaXRpb25Gb3JDdXJzb3I6IChjdXJzb3IpIC0+XG4gICAgaWYgQG1vZGUgaXMgJ3Zpc3VhbCdcbiAgICAgIEBnZXRDdXJzb3JQb3NpdGlvbkZvclNlbGVjdGlvbihjdXJzb3Iuc2VsZWN0aW9uKVxuICAgIGVsc2VcbiAgICAgIGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXG5cbiAgZ2V0Q3Vyc29yUG9zaXRpb25Gb3JTZWxlY3Rpb246IChzZWxlY3Rpb24pIC0+XG4gICAgQHN3cmFwKHNlbGVjdGlvbikuZ2V0QnVmZmVyUG9zaXRpb25Gb3IoJ2hlYWQnLCBmcm9tOiBbJ3Byb3BlcnR5JywgJ3NlbGVjdGlvbiddKVxuXG4gIHRvU3RyaW5nOiAtPlxuICAgIHN0ciA9IEBuYW1lXG4gICAgaWYgQHRhcmdldD9cbiAgICAgIHN0ciArPSBcIiwgdGFyZ2V0PSN7QHRhcmdldC5uYW1lfSwgdGFyZ2V0Lndpc2U9I3tAdGFyZ2V0Lndpc2V9IFwiXG4gICAgZWxzZSBpZiBAb3BlcmF0b3I/XG4gICAgICBzdHIgKz0gXCIsIHdpc2U9I3tAd2lzZX0gLCBvcGVyYXRvcj0je0BvcGVyYXRvci5uYW1lfVwiXG4gICAgZWxzZVxuICAgICAgc3RyXG5cbiAgIyBDbGFzcyBtZXRob2RzXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBAd3JpdGVDb21tYW5kVGFibGVPbkRpc2s6IC0+XG4gICAgY29tbWFuZFRhYmxlID0gQGdlbmVyYXRlQ29tbWFuZFRhYmxlQnlFYWdlckxvYWQoKVxuICAgIF8gPSBfcGx1cygpXG4gICAgaWYgXy5pc0VxdWFsKEBjb21tYW5kVGFibGUsIGNvbW1hbmRUYWJsZSlcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRJbmZvKFwiTm8gY2hhbmdlIGNvbW1hbmRUYWJsZVwiLCBkaXNtaXNzYWJsZTogdHJ1ZSlcbiAgICAgIHJldHVyblxuXG4gICAgQ1NPTiA/PSByZXF1aXJlICdzZWFzb24nXG4gICAgcGF0aCA/PSByZXF1aXJlKCdwYXRoJylcblxuICAgIGxvYWRhYmxlQ1NPTlRleHQgPSBcIm1vZHVsZS5leHBvcnRzID1cXG5cIiArIENTT04uc3RyaW5naWZ5KGNvbW1hbmRUYWJsZSkgKyBcIlxcblwiXG4gICAgY29tbWFuZFRhYmxlUGF0aCA9IHBhdGguam9pbihfX2Rpcm5hbWUsIFwiY29tbWFuZC10YWJsZS5jb2ZmZWVcIilcbiAgICBhdG9tLndvcmtzcGFjZS5vcGVuKGNvbW1hbmRUYWJsZVBhdGgsIGFjdGl2YXRlSXRlbTogZmFsc2UpLnRoZW4gKGVkaXRvcikgLT5cbiAgICAgIGVkaXRvci5zZXRUZXh0KGxvYWRhYmxlQ1NPTlRleHQpXG4gICAgICBlZGl0b3Iuc2F2ZSgpXG4gICAgICBlZGl0b3IuZGVzdHJveSgpXG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkSW5mbyhcIlVwZGF0ZWQgY29tbWFuZFRhYmxlXCIsIGRpc21pc3NhYmxlOiB0cnVlKVxuXG4gIEBnZW5lcmF0ZUNvbW1hbmRUYWJsZUJ5RWFnZXJMb2FkOiAtPlxuICAgICMgTk9URTogY2hhbmdpbmcgb3JkZXIgYWZmZWN0cyBvdXRwdXQgb2YgbGliL2NvbW1hbmQtdGFibGUuY29mZmVlXG4gICAgZmlsZXNUb0xvYWQgPSBbXG4gICAgICAnLi9vcGVyYXRvcicsICcuL29wZXJhdG9yLWluc2VydCcsICcuL29wZXJhdG9yLXRyYW5zZm9ybS1zdHJpbmcnLFxuICAgICAgJy4vbW90aW9uJywgJy4vbW90aW9uLXNlYXJjaCcsICcuL3RleHQtb2JqZWN0JywgJy4vbWlzYy1jb21tYW5kJ1xuICAgIF1cbiAgICBmaWxlc1RvTG9hZC5mb3JFYWNoKGxvYWRWbXBPcGVyYXRpb25GaWxlKVxuICAgIF8gPSBfcGx1cygpXG4gICAga2xhc3NlcyA9IF8udmFsdWVzKEBnZXRDbGFzc1JlZ2lzdHJ5KCkpXG4gICAga2xhc3Nlc0dyb3VwZWRCeUZpbGUgPSBfLmdyb3VwQnkoa2xhc3NlcywgKGtsYXNzKSAtPiBrbGFzcy5WTVBfTE9BRElOR19GSUxFKVxuXG4gICAgY29tbWFuZFRhYmxlID0ge31cbiAgICBmb3IgZmlsZSBpbiBmaWxlc1RvTG9hZFxuICAgICAgZm9yIGtsYXNzIGluIGtsYXNzZXNHcm91cGVkQnlGaWxlW2ZpbGVdXG4gICAgICAgIGNvbW1hbmRUYWJsZVtrbGFzcy5uYW1lXSA9IGtsYXNzLmdldFNwZWMoKVxuICAgIGNvbW1hbmRUYWJsZVxuXG4gIEBjb21tYW5kVGFibGU6IG51bGxcbiAgQGluaXQ6IChfZ2V0RWRpdG9yU3RhdGUpIC0+XG4gICAgZ2V0RWRpdG9yU3RhdGUgPSBfZ2V0RWRpdG9yU3RhdGVcbiAgICBAY29tbWFuZFRhYmxlID0gcmVxdWlyZSgnLi9jb21tYW5kLXRhYmxlJylcbiAgICBzdWJzY3JpcHRpb25zID0gW11cbiAgICBmb3IgbmFtZSwgc3BlYyBvZiBAY29tbWFuZFRhYmxlIHdoZW4gc3BlYy5jb21tYW5kTmFtZT9cbiAgICAgIHN1YnNjcmlwdGlvbnMucHVzaChAcmVnaXN0ZXJDb21tYW5kRnJvbVNwZWMobmFtZSwgc3BlYykpXG4gICAgcmV0dXJuIHN1YnNjcmlwdGlvbnNcblxuICBjbGFzc1JlZ2lzdHJ5ID0ge0Jhc2V9XG4gIEBleHRlbmQ6IChAY29tbWFuZD10cnVlKSAtPlxuICAgIEBWTVBfTE9BRElOR19GSUxFID0gVk1QX0xPQURJTkdfRklMRVxuICAgIGlmIEBuYW1lIG9mIGNsYXNzUmVnaXN0cnlcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkR1cGxpY2F0ZSBjb25zdHJ1Y3RvciAje0BuYW1lfVwiKVxuICAgIGNsYXNzUmVnaXN0cnlbQG5hbWVdID0gdGhpc1xuXG4gIEBnZXRTcGVjOiAtPlxuICAgIGlmIEBpc0NvbW1hbmQoKVxuICAgICAgZmlsZTogQFZNUF9MT0FESU5HX0ZJTEVcbiAgICAgIGNvbW1hbmROYW1lOiBAZ2V0Q29tbWFuZE5hbWUoKVxuICAgICAgY29tbWFuZFNjb3BlOiBAZ2V0Q29tbWFuZFNjb3BlKClcbiAgICBlbHNlXG4gICAgICBmaWxlOiBAVk1QX0xPQURJTkdfRklMRVxuXG4gIEBnZXRDbGFzczogKG5hbWUpIC0+XG4gICAgcmV0dXJuIGtsYXNzIGlmIChrbGFzcyA9IGNsYXNzUmVnaXN0cnlbbmFtZV0pXG5cbiAgICBmaWxlVG9Mb2FkID0gQGNvbW1hbmRUYWJsZVtuYW1lXS5maWxlXG4gICAgaWYgZmlsZVRvTG9hZCBub3QgaW4gVk1QX0xPQURFRF9GSUxFU1xuICAgICAgaWYgYXRvbS5pbkRldk1vZGUoKSBhbmQgc2V0dGluZ3MuZ2V0KCdkZWJ1ZycpXG4gICAgICAgIGNvbnNvbGUubG9nIFwibGF6eS1yZXF1aXJlOiAje2ZpbGVUb0xvYWR9IGZvciAje25hbWV9XCJcbiAgICAgIGxvYWRWbXBPcGVyYXRpb25GaWxlKGZpbGVUb0xvYWQpXG4gICAgICByZXR1cm4ga2xhc3MgaWYgKGtsYXNzID0gY2xhc3NSZWdpc3RyeVtuYW1lXSlcblxuICAgIHRocm93IG5ldyBFcnJvcihcImNsYXNzICcje25hbWV9JyBub3QgZm91bmRcIilcblxuICBAZ2V0Q2xhc3NSZWdpc3RyeTogLT5cbiAgICBjbGFzc1JlZ2lzdHJ5XG5cbiAgQGlzQ29tbWFuZDogLT5cbiAgICBAY29tbWFuZFxuXG4gIEBjb21tYW5kUHJlZml4OiAndmltLW1vZGUtcGx1cydcbiAgQGdldENvbW1hbmROYW1lOiAtPlxuICAgIEBjb21tYW5kUHJlZml4ICsgJzonICsgX3BsdXMoKS5kYXNoZXJpemUoQG5hbWUpXG5cbiAgQGdldENvbW1hbmROYW1lV2l0aG91dFByZWZpeDogLT5cbiAgICBfcGx1cygpLmRhc2hlcml6ZShAbmFtZSlcblxuICBAY29tbWFuZFNjb3BlOiAnYXRvbS10ZXh0LWVkaXRvcidcbiAgQGdldENvbW1hbmRTY29wZTogLT5cbiAgICBAY29tbWFuZFNjb3BlXG5cbiAgQGdldERlc2N0aXB0aW9uOiAtPlxuICAgIGlmIEBoYXNPd25Qcm9wZXJ0eShcImRlc2NyaXB0aW9uXCIpXG4gICAgICBAZGVzY3JpcHRpb25cbiAgICBlbHNlXG4gICAgICBudWxsXG5cbiAgQHJlZ2lzdGVyQ29tbWFuZDogLT5cbiAgICBrbGFzcyA9IHRoaXNcbiAgICBhdG9tLmNvbW1hbmRzLmFkZCBAZ2V0Q29tbWFuZFNjb3BlKCksIEBnZXRDb21tYW5kTmFtZSgpLCAoZXZlbnQpIC0+XG4gICAgICB2aW1TdGF0ZSA9IGdldEVkaXRvclN0YXRlKEBnZXRNb2RlbCgpKSA/IGdldEVkaXRvclN0YXRlKGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKSlcbiAgICAgIGlmIHZpbVN0YXRlPyAjIFBvc3NpYmx5IHVuZGVmaW5lZCBTZWUgIzg1XG4gICAgICAgIHZpbVN0YXRlLm9wZXJhdGlvblN0YWNrLnJ1bihrbGFzcylcbiAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXG5cbiAgQHJlZ2lzdGVyQ29tbWFuZEZyb21TcGVjOiAobmFtZSwgc3BlYykgLT5cbiAgICB7Y29tbWFuZFNjb3BlLCBjb21tYW5kUHJlZml4LCBjb21tYW5kTmFtZSwgZ2V0Q2xhc3N9ID0gc3BlY1xuICAgIGNvbW1hbmRTY29wZSA/PSAnYXRvbS10ZXh0LWVkaXRvcidcbiAgICBjb21tYW5kTmFtZSA/PSAoY29tbWFuZFByZWZpeCA/ICd2aW0tbW9kZS1wbHVzJykgKyAnOicgKyBfcGx1cygpLmRhc2hlcml6ZShuYW1lKVxuICAgIGF0b20uY29tbWFuZHMuYWRkIGNvbW1hbmRTY29wZSwgY29tbWFuZE5hbWUsIChldmVudCkgLT5cbiAgICAgIHZpbVN0YXRlID0gZ2V0RWRpdG9yU3RhdGUoQGdldE1vZGVsKCkpID8gZ2V0RWRpdG9yU3RhdGUoYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpKVxuICAgICAgaWYgdmltU3RhdGU/ICMgUG9zc2libHkgdW5kZWZpbmVkIFNlZSAjODVcbiAgICAgICAgaWYgZ2V0Q2xhc3M/XG4gICAgICAgICAgdmltU3RhdGUub3BlcmF0aW9uU3RhY2sucnVuKGdldENsYXNzKG5hbWUpKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgdmltU3RhdGUub3BlcmF0aW9uU3RhY2sucnVuKG5hbWUpXG4gICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuXG4gICMgRm9yIGRlbW8tbW9kZSBwa2cgaW50ZWdyYXRpb25cbiAgQG9wZXJhdGlvbktpbmQ6IG51bGxcbiAgQGdldEtpbmRGb3JDb21tYW5kTmFtZTogKGNvbW1hbmQpIC0+XG4gICAgXyA9IF9wbHVzKClcbiAgICBuYW1lID0gXy5jYXBpdGFsaXplKF8uY2FtZWxpemUoY29tbWFuZCkpXG4gICAgaWYgbmFtZSBvZiBjbGFzc1JlZ2lzdHJ5XG4gICAgICBjbGFzc1JlZ2lzdHJ5W25hbWVdLm9wZXJhdGlvbktpbmRcblxubW9kdWxlLmV4cG9ydHMgPSBCYXNlXG4iXX0=
