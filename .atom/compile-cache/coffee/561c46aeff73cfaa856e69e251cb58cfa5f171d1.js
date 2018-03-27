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
        selectList = new (require('./select-list'));
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvYmFzZS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0E7QUFBQSxNQUFBLDZMQUFBO0lBQUE7Ozs7RUFBQSxNQUFBLEdBQVM7O0VBQ1QsS0FBQSxHQUFRLFNBQUE7NEJBQ04sU0FBQSxTQUFVLE9BQUEsQ0FBUSxpQkFBUjtFQURKOztFQUdSLFFBQUEsR0FBVyxPQUFBLENBQVEsVUFBUjs7RUFDWCxRQUFBLEdBQVcsT0FBQSxDQUFRLFlBQVI7O0VBRVgsTUFNSSxFQU5KLEVBQ0UsYUFERixFQUVFLGFBRkYsRUFHRSxjQUhGLEVBSUUsbUJBSkYsRUFLRTs7RUFHRixnQkFBQSxHQUFtQjs7RUFDbkIsZ0JBQUEsR0FBbUI7O0VBRW5CLG9CQUFBLEdBQXVCLFNBQUMsUUFBRDtBQUtyQixRQUFBO0lBQUEsc0JBQUEsR0FBeUI7SUFDekIsZ0JBQUEsR0FBbUI7SUFDbkIsT0FBQSxDQUFRLFFBQVI7SUFDQSxnQkFBQSxHQUFtQjtXQUVuQixnQkFBZ0IsQ0FBQyxJQUFqQixDQUFzQixRQUF0QjtFQVZxQjs7RUFZdkIscUJBQUEsR0FBd0I7O0VBRXhCLGVBQUEsR0FBa0IsQ0FDaEIsbUJBRGdCLEVBRWhCLG9CQUZnQixFQUdoQixtQkFIZ0IsRUFJaEIsb0JBSmdCLEVBT2hCLGdCQVBnQixFQU9FLGtCQVBGLEVBUWQsb0JBUmMsRUFRUSxzQkFSUixFQVNkLG1CQVRjLEVBU08scUJBVFAsRUFVZCx1QkFWYyxFQVVXLHlCQVZYLEVBWWQsc0JBWmMsRUFZVSx3QkFaVixFQWFkLHFCQWJjLEVBYVMsdUJBYlQsRUFjaEIsc0JBZGdCLEVBZWhCLDBCQWZnQixFQWlCaEIsMEJBakJnQixFQW1CaEIsb0JBbkJnQixFQW9CaEIsbUJBcEJnQixFQXFCaEIsMkJBckJnQixFQXNCaEIsc0JBdEJnQixFQXVCaEIscUJBdkJnQixFQXlCaEIs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QUQsR0FBZ0I7O0lBQ2hCLElBQUMsQ0FBQSxxQkFBRCxHQUF3QixTQUFDLE9BQUQ7QUFDdEIsVUFBQTtNQUFBLE9BQUEsR0FBVSxPQUFPLENBQUMsT0FBUixDQUFnQixpQkFBaEIsRUFBbUMsRUFBbkM7TUFDVixDQUFBLEdBQUksS0FBQSxDQUFBO01BQ0osSUFBQSxHQUFPLENBQUMsQ0FBQyxVQUFGLENBQWEsQ0FBQyxDQUFDLFFBQUYsQ0FBVyxPQUFYLENBQWI7TUFDUCxJQUFHLElBQUEsSUFBUSxhQUFYO2VBQ0UsYUFBYyxDQUFBLElBQUEsQ0FBSyxDQUFDLGNBRHRCOztJQUpzQjs7Ozs7O0VBTzFCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCO0FBdFlqQiIsInNvdXJjZXNDb250ZW50IjpbIiMgVG8gYXZvaWQgbG9hZGluZyB1bmRlcnNjb3JlLXBsdXMgYW5kIGRlcGVuZGluZyB1bmRlcnNjb3JlIG9uIHN0YXJ0dXBcbl9fcGx1cyA9IG51bGxcbl9wbHVzID0gLT5cbiAgX19wbHVzID89IHJlcXVpcmUgJ3VuZGVyc2NvcmUtcGx1cydcblxuRGVsZWdhdG8gPSByZXF1aXJlICdkZWxlZ2F0bydcbnNldHRpbmdzID0gcmVxdWlyZSAnLi9zZXR0aW5ncydcblxuW1xuICBDU09OXG4gIHBhdGhcbiAgSW5wdXRcbiAgc2VsZWN0TGlzdFxuICBnZXRFZGl0b3JTdGF0ZSAgIyBzZXQgYnkgQmFzZS5pbml0KClcbl0gPSBbXSAjIHNldCBudWxsXG5cblZNUF9MT0FESU5HX0ZJTEUgPSBudWxsXG5WTVBfTE9BREVEX0ZJTEVTID0gW11cblxubG9hZFZtcE9wZXJhdGlvbkZpbGUgPSAoZmlsZW5hbWUpIC0+XG4gICMgQ2FsbCB0byBsb2FkVm1wT3BlcmF0aW9uRmlsZSBjYW4gYmUgbmVzdGVkLlxuICAjIDEuIHJlcXVpcmUoXCIuL29wZXJhdG9yLXRyYW5zZm9ybS1zdHJpbmdcIilcbiAgIyAyLiBpbiBvcGVyYXRvci10cmFuc2Zvcm0tc3RyaW5nLmNvZmZlZSBjYWxsIEJhc2UuZ2V0Q2xhc3MoXCJPcGVyYXRvclwiKSBjYXVzZSBvcGVyYXRvci5jb2ZmZWUgcmVxdWlyZWQuXG4gICMgU28gd2UgaGF2ZSB0byBzYXZlIG9yaWdpbmFsIFZNUF9MT0FESU5HX0ZJTEUgYW5kIHJlc3RvcmUgaXQgYWZ0ZXIgcmVxdWlyZSBmaW5pc2hlZC5cbiAgdm1wTG9hZGluZ0ZpbGVPcmlnaW5hbCA9IFZNUF9MT0FESU5HX0ZJTEVcbiAgVk1QX0xPQURJTkdfRklMRSA9IGZpbGVuYW1lXG4gIHJlcXVpcmUoZmlsZW5hbWUpXG4gIFZNUF9MT0FESU5HX0ZJTEUgPSB2bXBMb2FkaW5nRmlsZU9yaWdpbmFsXG5cbiAgVk1QX0xPQURFRF9GSUxFUy5wdXNoKGZpbGVuYW1lKVxuXG5PcGVyYXRpb25BYm9ydGVkRXJyb3IgPSBudWxsXG5cbnZpbVN0YXRlTWV0aG9kcyA9IFtcbiAgXCJvbkRpZENoYW5nZVNlYXJjaFwiXG4gIFwib25EaWRDb25maXJtU2VhcmNoXCJcbiAgXCJvbkRpZENhbmNlbFNlYXJjaFwiXG4gIFwib25EaWRDb21tYW5kU2VhcmNoXCJcblxuICAjIExpZmUgY3ljbGUgb2Ygb3BlcmF0aW9uU3RhY2tcbiAgXCJvbkRpZFNldFRhcmdldFwiLCBcImVtaXREaWRTZXRUYXJnZXRcIlxuICAgIFwib25XaWxsU2VsZWN0VGFyZ2V0XCIsIFwiZW1pdFdpbGxTZWxlY3RUYXJnZXRcIlxuICAgIFwib25EaWRTZWxlY3RUYXJnZXRcIiwgXCJlbWl0RGlkU2VsZWN0VGFyZ2V0XCJcbiAgICBcIm9uRGlkRmFpbFNlbGVjdFRhcmdldFwiLCBcImVtaXREaWRGYWlsU2VsZWN0VGFyZ2V0XCJcblxuICAgIFwib25XaWxsRmluaXNoTXV0YXRpb25cIiwgXCJlbWl0V2lsbEZpbmlzaE11dGF0aW9uXCJcbiAgICBcIm9uRGlkRmluaXNoTXV0YXRpb25cIiwgXCJlbWl0RGlkRmluaXNoTXV0YXRpb25cIlxuICBcIm9uRGlkRmluaXNoT3BlcmF0aW9uXCJcbiAgXCJvbkRpZFJlc2V0T3BlcmF0aW9uU3RhY2tcIlxuXG4gIFwib25EaWRTZXRPcGVyYXRvck1vZGlmaWVyXCJcblxuICBcIm9uV2lsbEFjdGl2YXRlTW9kZVwiXG4gIFwib25EaWRBY3RpdmF0ZU1vZGVcIlxuICBcInByZWVtcHRXaWxsRGVhY3RpdmF0ZU1vZGVcIlxuICBcIm9uV2lsbERlYWN0aXZhdGVNb2RlXCJcbiAgXCJvbkRpZERlYWN0aXZhdGVNb2RlXCJcblxuICBcIm9uRGlkQ2FuY2VsU2VsZWN0TGlzdFwiXG4gIFwic3Vic2NyaWJlXCJcbiAgXCJpc01vZGVcIlxuICBcImdldEJsb2Nrd2lzZVNlbGVjdGlvbnNcIlxuICBcImdldExhc3RCbG9ja3dpc2VTZWxlY3Rpb25cIlxuICBcImFkZFRvQ2xhc3NMaXN0XCJcbiAgXCJnZXRDb25maWdcIlxuXVxuXG5jbGFzcyBCYXNlXG4gIERlbGVnYXRvLmluY2x1ZGVJbnRvKHRoaXMpXG4gIEBkZWxlZ2F0ZXNNZXRob2RzKHZpbVN0YXRlTWV0aG9kcy4uLiwgdG9Qcm9wZXJ0eTogJ3ZpbVN0YXRlJylcbiAgQGRlbGVnYXRlc1Byb3BlcnR5KCdtb2RlJywgJ3N1Ym1vZGUnLCAnc3dyYXAnLCAndXRpbHMnLCB0b1Byb3BlcnR5OiAndmltU3RhdGUnKVxuXG4gIGNvbnN0cnVjdG9yOiAoQHZpbVN0YXRlLCBwcm9wZXJ0aWVzPW51bGwpIC0+XG4gICAge0BlZGl0b3IsIEBlZGl0b3JFbGVtZW50LCBAZ2xvYmFsU3RhdGUsIEBzd3JhcH0gPSBAdmltU3RhdGVcbiAgICBAbmFtZSA9IEBjb25zdHJ1Y3Rvci5uYW1lXG4gICAgT2JqZWN0LmFzc2lnbih0aGlzLCBwcm9wZXJ0aWVzKSBpZiBwcm9wZXJ0aWVzP1xuXG4gICMgVG8gb3ZlcnJpZGVcbiAgaW5pdGlhbGl6ZTogLT5cblxuICAjIE9wZXJhdGlvbiBwcm9jZXNzb3IgZXhlY3V0ZSBvbmx5IHdoZW4gaXNDb21wbGV0ZSgpIHJldHVybiB0cnVlLlxuICAjIElmIGZhbHNlLCBvcGVyYXRpb24gcHJvY2Vzc29yIHBvc3Rwb25lIGl0cyBleGVjdXRpb24uXG4gIGlzQ29tcGxldGU6IC0+XG4gICAgaWYgQHJlcXVpcmVJbnB1dCBhbmQgbm90IEBpbnB1dD9cbiAgICAgIGZhbHNlXG4gICAgZWxzZSBpZiBAcmVxdWlyZVRhcmdldFxuICAgICAgIyBXaGVuIHRoaXMgZnVuY3Rpb24gaXMgY2FsbGVkIGluIEJhc2U6OmNvbnN0cnVjdG9yXG4gICAgICAjIHRhZ2VydCBpcyBzdGlsbCBzdHJpbmcgbGlrZSBgTW92ZVRvUmlnaHRgLCBpbiB0aGlzIGNhc2UgaXNDb21wbGV0ZVxuICAgICAgIyBpcyBub3QgYXZhaWxhYmxlLlxuICAgICAgQHRhcmdldD8uaXNDb21wbGV0ZT8oKVxuICAgIGVsc2VcbiAgICAgIHRydWVcblxuICByZXF1aXJlVGFyZ2V0OiBmYWxzZVxuICByZXF1aXJlSW5wdXQ6IGZhbHNlXG4gIHJlY29yZGFibGU6IGZhbHNlXG4gIHJlcGVhdGVkOiBmYWxzZVxuICB0YXJnZXQ6IG51bGwgIyBTZXQgaW4gT3BlcmF0b3JcbiAgb3BlcmF0b3I6IG51bGwgIyBTZXQgaW4gb3BlcmF0b3IncyB0YXJnZXQoIE1vdGlvbiBvciBUZXh0T2JqZWN0IClcbiAgaXNBc1RhcmdldEV4Y2VwdFNlbGVjdDogLT5cbiAgICBAb3BlcmF0b3I/IGFuZCBub3QgQG9wZXJhdG9yLmluc3RhbmNlb2YoJ1NlbGVjdCcpXG5cbiAgYWJvcnQ6IC0+XG4gICAgT3BlcmF0aW9uQWJvcnRlZEVycm9yID89IHJlcXVpcmUgJy4vZXJyb3JzJ1xuICAgIHRocm93IG5ldyBPcGVyYXRpb25BYm9ydGVkRXJyb3IoJ2Fib3J0ZWQnKVxuXG4gICMgQ291bnRcbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIGNvdW50OiBudWxsXG4gIGRlZmF1bHRDb3VudDogMVxuICBnZXRDb3VudDogKG9mZnNldD0wKSAtPlxuICAgIEBjb3VudCA/PSBAdmltU3RhdGUuZ2V0Q291bnQoKSA/IEBkZWZhdWx0Q291bnRcbiAgICBAY291bnQgKyBvZmZzZXRcblxuICByZXNldENvdW50OiAtPlxuICAgIEBjb3VudCA9IG51bGxcblxuICBpc0RlZmF1bHRDb3VudDogLT5cbiAgICBAY291bnQgaXMgQGRlZmF1bHRDb3VudFxuXG4gICMgTWlzY1xuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgY291bnRUaW1lczogKGxhc3QsIGZuKSAtPlxuICAgIHJldHVybiBpZiBsYXN0IDwgMVxuXG4gICAgc3RvcHBlZCA9IGZhbHNlXG4gICAgc3RvcCA9IC0+IHN0b3BwZWQgPSB0cnVlXG4gICAgZm9yIGNvdW50IGluIFsxLi5sYXN0XVxuICAgICAgaXNGaW5hbCA9IGNvdW50IGlzIGxhc3RcbiAgICAgIGZuKHtjb3VudCwgaXNGaW5hbCwgc3RvcH0pXG4gICAgICBicmVhayBpZiBzdG9wcGVkXG5cbiAgYWN0aXZhdGVNb2RlOiAobW9kZSwgc3VibW9kZSkgLT5cbiAgICBAb25EaWRGaW5pc2hPcGVyYXRpb24gPT5cbiAgICAgIEB2aW1TdGF0ZS5hY3RpdmF0ZShtb2RlLCBzdWJtb2RlKVxuXG4gIGFjdGl2YXRlTW9kZUlmTmVjZXNzYXJ5OiAobW9kZSwgc3VibW9kZSkgLT5cbiAgICB1bmxlc3MgQHZpbVN0YXRlLmlzTW9kZShtb2RlLCBzdWJtb2RlKVxuICAgICAgQGFjdGl2YXRlTW9kZShtb2RlLCBzdWJtb2RlKVxuXG4gIG5ldzogKG5hbWUsIHByb3BlcnRpZXMpIC0+XG4gICAga2xhc3MgPSBCYXNlLmdldENsYXNzKG5hbWUpXG4gICAgbmV3IGtsYXNzKEB2aW1TdGF0ZSwgcHJvcGVydGllcylcblxuICBuZXdJbnB1dFVJOiAtPlxuICAgIElucHV0ID89IHJlcXVpcmUgJy4vaW5wdXQnXG4gICAgbmV3IElucHV0KEB2aW1TdGF0ZSlcblxuICAjIEZJWE1FOiBUaGlzIGlzIHVzZWQgdG8gY2xvbmUgTW90aW9uOjpTZWFyY2ggdG8gc3VwcG9ydCBgbmAgYW5kIGBOYFxuICAjIEJ1dCBtYW51YWwgcmVzZXRpbmcgYW5kIG92ZXJyaWRpbmcgcHJvcGVydHkgaXMgYnVnIHByb25lLlxuICAjIFNob3VsZCBleHRyYWN0IGFzIHNlYXJjaCBzcGVjIG9iamVjdCBhbmQgdXNlIGl0IGJ5XG4gICMgY3JlYXRpbmcgY2xlYW4gaW5zdGFuY2Ugb2YgU2VhcmNoLlxuICBjbG9uZTogKHZpbVN0YXRlKSAtPlxuICAgIHByb3BlcnRpZXMgPSB7fVxuICAgIGV4Y2x1ZGVQcm9wZXJ0aWVzID0gWydlZGl0b3InLCAnZWRpdG9yRWxlbWVudCcsICdnbG9iYWxTdGF0ZScsICd2aW1TdGF0ZScsICdvcGVyYXRvciddXG4gICAgZm9yIG93biBrZXksIHZhbHVlIG9mIHRoaXMgd2hlbiBrZXkgbm90IGluIGV4Y2x1ZGVQcm9wZXJ0aWVzXG4gICAgICBwcm9wZXJ0aWVzW2tleV0gPSB2YWx1ZVxuICAgIGtsYXNzID0gdGhpcy5jb25zdHJ1Y3RvclxuICAgIG5ldyBrbGFzcyh2aW1TdGF0ZSwgcHJvcGVydGllcylcblxuICBjYW5jZWxPcGVyYXRpb246IC0+XG4gICAgQHZpbVN0YXRlLm9wZXJhdGlvblN0YWNrLmNhbmNlbCgpXG5cbiAgcHJvY2Vzc09wZXJhdGlvbjogLT5cbiAgICBAdmltU3RhdGUub3BlcmF0aW9uU3RhY2sucHJvY2VzcygpXG5cbiAgZm9jdXNTZWxlY3RMaXN0OiAob3B0aW9ucz17fSkgLT5cbiAgICBAb25EaWRDYW5jZWxTZWxlY3RMaXN0ID0+XG4gICAgICBAY2FuY2VsT3BlcmF0aW9uKClcbiAgICBzZWxlY3RMaXN0ID89IG5ldyAocmVxdWlyZSAnLi9zZWxlY3QtbGlzdCcpXG4gICAgc2VsZWN0TGlzdC5zaG93KEB2aW1TdGF0ZSwgb3B0aW9ucylcblxuICBpbnB1dDogbnVsbFxuICBmb2N1c0lucHV0OiAob3B0aW9ucykgLT5cbiAgICBpbnB1dFVJID0gQG5ld0lucHV0VUkoKVxuICAgIGlucHV0VUkub25EaWRDb25maXJtIChpbnB1dCkgPT5cbiAgICAgIEBpbnB1dCA9IGlucHV0XG4gICAgICBAcHJvY2Vzc09wZXJhdGlvbigpXG5cbiAgICBpZiBvcHRpb25zPy5jaGFyc01heCA+IDFcbiAgICAgIGlucHV0VUkub25EaWRDaGFuZ2UgKGlucHV0KSA9PlxuICAgICAgICBAdmltU3RhdGUuaG92ZXIuc2V0KGlucHV0KVxuXG4gICAgaW5wdXRVSS5vbkRpZENhbmNlbChAY2FuY2VsT3BlcmF0aW9uLmJpbmQodGhpcykpXG4gICAgaW5wdXRVSS5mb2N1cyhvcHRpb25zKVxuXG4gIGdldFZpbUVvZkJ1ZmZlclBvc2l0aW9uOiAtPlxuICAgIEB1dGlscy5nZXRWaW1Fb2ZCdWZmZXJQb3NpdGlvbihAZWRpdG9yKVxuXG4gIGdldFZpbUxhc3RCdWZmZXJSb3c6IC0+XG4gICAgQHV0aWxzLmdldFZpbUxhc3RCdWZmZXJSb3coQGVkaXRvcilcblxuICBnZXRWaW1MYXN0U2NyZWVuUm93OiAtPlxuICAgIEB1dGlscy5nZXRWaW1MYXN0U2NyZWVuUm93KEBlZGl0b3IpXG5cbiAgZ2V0V29yZEJ1ZmZlclJhbmdlQW5kS2luZEF0QnVmZmVyUG9zaXRpb246IChwb2ludCwgb3B0aW9ucykgLT5cbiAgICBAdXRpbHMuZ2V0V29yZEJ1ZmZlclJhbmdlQW5kS2luZEF0QnVmZmVyUG9zaXRpb24oQGVkaXRvciwgcG9pbnQsIG9wdGlvbnMpXG5cbiAgZ2V0Rmlyc3RDaGFyYWN0ZXJQb3NpdGlvbkZvckJ1ZmZlclJvdzogKHJvdykgLT5cbiAgICBAdXRpbHMuZ2V0Rmlyc3RDaGFyYWN0ZXJQb3NpdGlvbkZvckJ1ZmZlclJvdyhAZWRpdG9yLCByb3cpXG5cbiAgZ2V0QnVmZmVyUmFuZ2VGb3JSb3dSYW5nZTogKHJvd1JhbmdlKSAtPlxuICAgIEB1dGlscy5nZXRCdWZmZXJSYW5nZUZvclJvd1JhbmdlKEBlZGl0b3IsIHJvd1JhbmdlKVxuXG4gIGdldEluZGVudExldmVsRm9yQnVmZmVyUm93OiAocm93KSAtPlxuICAgIEB1dGlscy5nZXRJbmRlbnRMZXZlbEZvckJ1ZmZlclJvdyhAZWRpdG9yLCByb3cpXG5cbiAgc2NhbkZvcndhcmQ6IChhcmdzLi4uKSAtPlxuICAgIEB1dGlscy5zY2FuRWRpdG9ySW5EaXJlY3Rpb24oQGVkaXRvciwgJ2ZvcndhcmQnLCBhcmdzLi4uKVxuXG4gIHNjYW5CYWNrd2FyZDogKGFyZ3MuLi4pIC0+XG4gICAgQHV0aWxzLnNjYW5FZGl0b3JJbkRpcmVjdGlvbihAZWRpdG9yLCAnYmFja3dhcmQnLCBhcmdzLi4uKVxuXG4gIGdldEZvbGRFbmRSb3dGb3JSb3c6IChhcmdzLi4uKSAtPlxuICAgIEB1dGlscy5nZXRGb2xkRW5kUm93Rm9yUm93KEBlZGl0b3IsIGFyZ3MuLi4pXG5cbiAgaW5zdGFuY2VvZjogKGtsYXNzTmFtZSkgLT5cbiAgICB0aGlzIGluc3RhbmNlb2YgQmFzZS5nZXRDbGFzcyhrbGFzc05hbWUpXG5cbiAgaXM6IChrbGFzc05hbWUpIC0+XG4gICAgdGhpcy5jb25zdHJ1Y3RvciBpcyBCYXNlLmdldENsYXNzKGtsYXNzTmFtZSlcblxuICBpc09wZXJhdG9yOiAtPlxuICAgIEBjb25zdHJ1Y3Rvci5vcGVyYXRpb25LaW5kIGlzICdvcGVyYXRvcidcblxuICBpc01vdGlvbjogLT5cbiAgICBAY29uc3RydWN0b3Iub3BlcmF0aW9uS2luZCBpcyAnbW90aW9uJ1xuXG4gIGlzVGV4dE9iamVjdDogLT5cbiAgICBAY29uc3RydWN0b3Iub3BlcmF0aW9uS2luZCBpcyAndGV4dC1vYmplY3QnXG5cbiAgZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb246IC0+XG4gICAgaWYgQG1vZGUgaXMgJ3Zpc3VhbCdcbiAgICAgIEBnZXRDdXJzb3JQb3NpdGlvbkZvclNlbGVjdGlvbihAZWRpdG9yLmdldExhc3RTZWxlY3Rpb24oKSlcbiAgICBlbHNlXG4gICAgICBAZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKClcblxuICBnZXRDdXJzb3JCdWZmZXJQb3NpdGlvbnM6IC0+XG4gICAgaWYgQG1vZGUgaXMgJ3Zpc3VhbCdcbiAgICAgIEBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpLm1hcChAZ2V0Q3Vyc29yUG9zaXRpb25Gb3JTZWxlY3Rpb24uYmluZCh0aGlzKSlcbiAgICBlbHNlXG4gICAgICBAZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9ucygpXG5cbiAgZ2V0QnVmZmVyUG9zaXRpb25Gb3JDdXJzb3I6IChjdXJzb3IpIC0+XG4gICAgaWYgQG1vZGUgaXMgJ3Zpc3VhbCdcbiAgICAgIEBnZXRDdXJzb3JQb3NpdGlvbkZvclNlbGVjdGlvbihjdXJzb3Iuc2VsZWN0aW9uKVxuICAgIGVsc2VcbiAgICAgIGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXG5cbiAgZ2V0Q3Vyc29yUG9zaXRpb25Gb3JTZWxlY3Rpb246IChzZWxlY3Rpb24pIC0+XG4gICAgQHN3cmFwKHNlbGVjdGlvbikuZ2V0QnVmZmVyUG9zaXRpb25Gb3IoJ2hlYWQnLCBmcm9tOiBbJ3Byb3BlcnR5JywgJ3NlbGVjdGlvbiddKVxuXG4gIHRvU3RyaW5nOiAtPlxuICAgIHN0ciA9IEBuYW1lXG4gICAgaWYgQHRhcmdldD9cbiAgICAgIHN0ciArPSBcIiwgdGFyZ2V0PSN7QHRhcmdldC5uYW1lfSwgdGFyZ2V0Lndpc2U9I3tAdGFyZ2V0Lndpc2V9IFwiXG4gICAgZWxzZSBpZiBAb3BlcmF0b3I/XG4gICAgICBzdHIgKz0gXCIsIHdpc2U9I3tAd2lzZX0gLCBvcGVyYXRvcj0je0BvcGVyYXRvci5uYW1lfVwiXG4gICAgZWxzZVxuICAgICAgc3RyXG5cbiAgIyBDbGFzcyBtZXRob2RzXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBAd3JpdGVDb21tYW5kVGFibGVPbkRpc2s6IC0+XG4gICAgY29tbWFuZFRhYmxlID0gQGdlbmVyYXRlQ29tbWFuZFRhYmxlQnlFYWdlckxvYWQoKVxuICAgIF8gPSBfcGx1cygpXG4gICAgaWYgXy5pc0VxdWFsKEBjb21tYW5kVGFibGUsIGNvbW1hbmRUYWJsZSlcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRJbmZvKFwiTm8gY2hhbmdlIGNvbW1hbmRUYWJsZVwiLCBkaXNtaXNzYWJsZTogdHJ1ZSlcbiAgICAgIHJldHVyblxuXG4gICAgQ1NPTiA/PSByZXF1aXJlICdzZWFzb24nXG4gICAgcGF0aCA/PSByZXF1aXJlKCdwYXRoJylcblxuICAgIGxvYWRhYmxlQ1NPTlRleHQgPSBcIlwiXCJcbiAgICAgICMgVGhpcyBmaWxlIGlzIGF1dG8gZ2VuZXJhdGVkIGJ5IGB2aW0tbW9kZS1wbHVzOndyaXRlLWNvbW1hbmQtdGFibGUtb24tZGlza2AgY29tbWFuZC5cbiAgICAgICMgRE9OVCBlZGl0IG1hbnVhbGx5LlxuICAgICAgbW9kdWxlLmV4cG9ydHMgPVxuICAgICAgI3tDU09OLnN0cmluZ2lmeShjb21tYW5kVGFibGUpfVxcblxuICAgICAgXCJcIlwiXG4gICAgY29tbWFuZFRhYmxlUGF0aCA9IHBhdGguam9pbihfX2Rpcm5hbWUsIFwiY29tbWFuZC10YWJsZS5jb2ZmZWVcIilcbiAgICBhdG9tLndvcmtzcGFjZS5vcGVuKGNvbW1hbmRUYWJsZVBhdGgpLnRoZW4gKGVkaXRvcikgLT5cbiAgICAgIGVkaXRvci5zZXRUZXh0KGxvYWRhYmxlQ1NPTlRleHQpXG4gICAgICBlZGl0b3Iuc2F2ZSgpXG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkSW5mbyhcIlVwZGF0ZWQgY29tbWFuZFRhYmxlXCIsIGRpc21pc3NhYmxlOiB0cnVlKVxuXG4gIEBnZW5lcmF0ZUNvbW1hbmRUYWJsZUJ5RWFnZXJMb2FkOiAtPlxuICAgICMgTk9URTogY2hhbmdpbmcgb3JkZXIgYWZmZWN0cyBvdXRwdXQgb2YgbGliL2NvbW1hbmQtdGFibGUuY29mZmVlXG4gICAgZmlsZXNUb0xvYWQgPSBbXG4gICAgICAnLi9vcGVyYXRvcicsICcuL29wZXJhdG9yLWluc2VydCcsICcuL29wZXJhdG9yLXRyYW5zZm9ybS1zdHJpbmcnLFxuICAgICAgJy4vbW90aW9uJywgJy4vbW90aW9uLXNlYXJjaCcsICcuL3RleHQtb2JqZWN0JywgJy4vbWlzYy1jb21tYW5kJ1xuICAgIF1cbiAgICBmaWxlc1RvTG9hZC5mb3JFYWNoKGxvYWRWbXBPcGVyYXRpb25GaWxlKVxuICAgIF8gPSBfcGx1cygpXG4gICAga2xhc3NlcyA9IF8udmFsdWVzKEBnZXRDbGFzc1JlZ2lzdHJ5KCkpXG4gICAga2xhc3Nlc0dyb3VwZWRCeUZpbGUgPSBfLmdyb3VwQnkoa2xhc3NlcywgKGtsYXNzKSAtPiBrbGFzcy5WTVBfTE9BRElOR19GSUxFKVxuXG4gICAgY29tbWFuZFRhYmxlID0ge31cbiAgICBmb3IgZmlsZSBpbiBmaWxlc1RvTG9hZFxuICAgICAgZm9yIGtsYXNzIGluIGtsYXNzZXNHcm91cGVkQnlGaWxlW2ZpbGVdXG4gICAgICAgIGNvbW1hbmRUYWJsZVtrbGFzcy5uYW1lXSA9IGtsYXNzLmdldFNwZWMoKVxuICAgIGNvbW1hbmRUYWJsZVxuXG4gIEBjb21tYW5kVGFibGU6IG51bGxcbiAgQGluaXQ6IChfZ2V0RWRpdG9yU3RhdGUpIC0+XG4gICAgZ2V0RWRpdG9yU3RhdGUgPSBfZ2V0RWRpdG9yU3RhdGVcbiAgICBAY29tbWFuZFRhYmxlID0gcmVxdWlyZSgnLi9jb21tYW5kLXRhYmxlJylcbiAgICBzdWJzY3JpcHRpb25zID0gW11cbiAgICBmb3IgbmFtZSwgc3BlYyBvZiBAY29tbWFuZFRhYmxlIHdoZW4gc3BlYy5jb21tYW5kTmFtZT9cbiAgICAgIHN1YnNjcmlwdGlvbnMucHVzaChAcmVnaXN0ZXJDb21tYW5kRnJvbVNwZWMobmFtZSwgc3BlYykpXG4gICAgcmV0dXJuIHN1YnNjcmlwdGlvbnNcblxuICBjbGFzc1JlZ2lzdHJ5ID0ge0Jhc2V9XG4gIEBleHRlbmQ6IChAY29tbWFuZD10cnVlKSAtPlxuICAgIEBWTVBfTE9BRElOR19GSUxFID0gVk1QX0xPQURJTkdfRklMRVxuICAgIGlmIEBuYW1lIG9mIGNsYXNzUmVnaXN0cnlcbiAgICAgIGNvbnNvbGUud2FybihcIkR1cGxpY2F0ZSBjb25zdHJ1Y3RvciAje0BuYW1lfVwiKVxuICAgIGNsYXNzUmVnaXN0cnlbQG5hbWVdID0gdGhpc1xuXG4gIEBnZXRTcGVjOiAtPlxuICAgIGlmIEBpc0NvbW1hbmQoKVxuICAgICAgZmlsZTogQFZNUF9MT0FESU5HX0ZJTEVcbiAgICAgIGNvbW1hbmROYW1lOiBAZ2V0Q29tbWFuZE5hbWUoKVxuICAgICAgY29tbWFuZFNjb3BlOiBAZ2V0Q29tbWFuZFNjb3BlKClcbiAgICBlbHNlXG4gICAgICBmaWxlOiBAVk1QX0xPQURJTkdfRklMRVxuXG4gIEBnZXRDbGFzczogKG5hbWUpIC0+XG4gICAgcmV0dXJuIGtsYXNzIGlmIChrbGFzcyA9IGNsYXNzUmVnaXN0cnlbbmFtZV0pXG5cbiAgICBmaWxlVG9Mb2FkID0gQGNvbW1hbmRUYWJsZVtuYW1lXS5maWxlXG4gICAgaWYgZmlsZVRvTG9hZCBub3QgaW4gVk1QX0xPQURFRF9GSUxFU1xuICAgICAgaWYgYXRvbS5pbkRldk1vZGUoKSBhbmQgc2V0dGluZ3MuZ2V0KCdkZWJ1ZycpXG4gICAgICAgIGNvbnNvbGUubG9nIFwibGF6eS1yZXF1aXJlOiAje2ZpbGVUb0xvYWR9IGZvciAje25hbWV9XCJcbiAgICAgIGxvYWRWbXBPcGVyYXRpb25GaWxlKGZpbGVUb0xvYWQpXG4gICAgICByZXR1cm4ga2xhc3MgaWYgKGtsYXNzID0gY2xhc3NSZWdpc3RyeVtuYW1lXSlcblxuICAgIHRocm93IG5ldyBFcnJvcihcImNsYXNzICcje25hbWV9JyBub3QgZm91bmRcIilcblxuICBAZ2V0Q2xhc3NSZWdpc3RyeTogLT5cbiAgICBjbGFzc1JlZ2lzdHJ5XG5cbiAgQGlzQ29tbWFuZDogLT5cbiAgICBAY29tbWFuZFxuXG4gIEBjb21tYW5kUHJlZml4OiAndmltLW1vZGUtcGx1cydcbiAgQGdldENvbW1hbmROYW1lOiAtPlxuICAgIEBjb21tYW5kUHJlZml4ICsgJzonICsgX3BsdXMoKS5kYXNoZXJpemUoQG5hbWUpXG5cbiAgQGdldENvbW1hbmROYW1lV2l0aG91dFByZWZpeDogLT5cbiAgICBfcGx1cygpLmRhc2hlcml6ZShAbmFtZSlcblxuICBAY29tbWFuZFNjb3BlOiAnYXRvbS10ZXh0LWVkaXRvcidcbiAgQGdldENvbW1hbmRTY29wZTogLT5cbiAgICBAY29tbWFuZFNjb3BlXG5cbiAgQGdldERlc2N0aXB0aW9uOiAtPlxuICAgIGlmIEBoYXNPd25Qcm9wZXJ0eShcImRlc2NyaXB0aW9uXCIpXG4gICAgICBAZGVzY3JpcHRpb25cbiAgICBlbHNlXG4gICAgICBudWxsXG5cbiAgQHJlZ2lzdGVyQ29tbWFuZDogLT5cbiAgICBrbGFzcyA9IHRoaXNcbiAgICBhdG9tLmNvbW1hbmRzLmFkZCBAZ2V0Q29tbWFuZFNjb3BlKCksIEBnZXRDb21tYW5kTmFtZSgpLCAoZXZlbnQpIC0+XG4gICAgICB2aW1TdGF0ZSA9IGdldEVkaXRvclN0YXRlKEBnZXRNb2RlbCgpKSA/IGdldEVkaXRvclN0YXRlKGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKSlcbiAgICAgIGlmIHZpbVN0YXRlPyAjIFBvc3NpYmx5IHVuZGVmaW5lZCBTZWUgIzg1XG4gICAgICAgIHZpbVN0YXRlLm9wZXJhdGlvblN0YWNrLnJ1bihrbGFzcylcbiAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXG5cbiAgQHJlZ2lzdGVyQ29tbWFuZEZyb21TcGVjOiAobmFtZSwgc3BlYykgLT5cbiAgICB7Y29tbWFuZFNjb3BlLCBjb21tYW5kUHJlZml4LCBjb21tYW5kTmFtZSwgZ2V0Q2xhc3N9ID0gc3BlY1xuICAgIGNvbW1hbmRTY29wZSA/PSAnYXRvbS10ZXh0LWVkaXRvcidcbiAgICBjb21tYW5kTmFtZSA/PSAoY29tbWFuZFByZWZpeCA/ICd2aW0tbW9kZS1wbHVzJykgKyAnOicgKyBfcGx1cygpLmRhc2hlcml6ZShuYW1lKVxuICAgIGF0b20uY29tbWFuZHMuYWRkIGNvbW1hbmRTY29wZSwgY29tbWFuZE5hbWUsIChldmVudCkgLT5cbiAgICAgIHZpbVN0YXRlID0gZ2V0RWRpdG9yU3RhdGUoQGdldE1vZGVsKCkpID8gZ2V0RWRpdG9yU3RhdGUoYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpKVxuICAgICAgaWYgdmltU3RhdGU/ICMgUG9zc2libHkgdW5kZWZpbmVkIFNlZSAjODVcbiAgICAgICAgaWYgZ2V0Q2xhc3M/XG4gICAgICAgICAgdmltU3RhdGUub3BlcmF0aW9uU3RhY2sucnVuKGdldENsYXNzKG5hbWUpKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgdmltU3RhdGUub3BlcmF0aW9uU3RhY2sucnVuKG5hbWUpXG4gICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuXG4gICMgRm9yIGRlbW8tbW9kZSBwa2cgaW50ZWdyYXRpb25cbiAgQG9wZXJhdGlvbktpbmQ6IG51bGxcbiAgQGdldEtpbmRGb3JDb21tYW5kTmFtZTogKGNvbW1hbmQpIC0+XG4gICAgY29tbWFuZCA9IGNvbW1hbmQucmVwbGFjZSgvXnZpbS1tb2RlLXBsdXM6LywgXCJcIilcbiAgICBfID0gX3BsdXMoKVxuICAgIG5hbWUgPSBfLmNhcGl0YWxpemUoXy5jYW1lbGl6ZShjb21tYW5kKSlcbiAgICBpZiBuYW1lIG9mIGNsYXNzUmVnaXN0cnlcbiAgICAgIGNsYXNzUmVnaXN0cnlbbmFtZV0ub3BlcmF0aW9uS2luZFxuXG5tb2R1bGUuZXhwb3J0cyA9IEJhc2VcbiJdfQ==
