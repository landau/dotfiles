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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvYmFzZS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0E7QUFBQSxNQUFBLHNMQUFBO0lBQUE7Ozs7RUFBQSxNQUFBLEdBQVM7O0VBQ1QsS0FBQSxHQUFRLFNBQUE7NEJBQ04sU0FBQSxTQUFVLE9BQUEsQ0FBUSxpQkFBUjtFQURKOztFQUdSLFFBQUEsR0FBVyxPQUFBLENBQVEsVUFBUjs7RUFDWCxRQUFBLEdBQVcsT0FBQSxDQUFRLFlBQVI7O0VBRVgsTUFLSSxFQUxKLEVBQ0UsYUFERixFQUVFLGFBRkYsRUFHRSxtQkFIRixFQUlFOztFQUdGLGdCQUFBLEdBQW1COztFQUNuQixnQkFBQSxHQUFtQjs7RUFFbkIsb0JBQUEsR0FBdUIsU0FBQyxRQUFEO0FBS3JCLFFBQUE7SUFBQSxzQkFBQSxHQUF5QjtJQUN6QixnQkFBQSxHQUFtQjtJQUNuQixPQUFBLENBQVEsUUFBUjtJQUNBLGdCQUFBLEdBQW1CO1dBRW5CLGdCQUFnQixDQUFDLElBQWpCLENBQXNCLFFBQXRCO0VBVnFCOztFQVl2QixxQkFBQSxHQUF3Qjs7RUFFeEIsZUFBQSxHQUFrQixDQUNoQixtQkFEZ0IsRUFFaEIsb0JBRmdCLEVBR2hCLG1CQUhnQixFQUloQixvQkFKZ0IsRUFPaEIsZ0JBUGdCLEVBT0Usa0JBUEYsRUFRZCxvQkFSYyxFQVFRLHNCQVJSLEVBU2QsbUJBVGMsRUFTTyxxQkFUUCxFQVVkLHVCQVZjLEVBVVcseUJBVlgsRUFZZCxzQkFaYyxFQVlVLHdCQVpWLEVBYWQscUJBYmMsRUFhUyx1QkFiVCxFQWNoQixzQkFkZ0IsRUFlaEIsMEJBZmdCLEVBaUJoQiwwQkFqQmdCLEVBbUJoQixvQkFuQmdCLEVBb0JoQixtQkFwQmdCLEVBcUJoQiwyQkFyQmdCLEVBc0JoQixzQkF0QmdCLEVBdUJoQixxQkF2QmdCLEVBeUJoQix1QkF6QmdCLEVB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SUFBVCxDQUE1QixFQURGO1dBQUEsTUFBQTtZQUdFLFFBQVEsQ0FBQyxjQUFjLENBQUMsR0FBeEIsQ0FBNEIsSUFBNUIsRUFIRjtXQURGOztlQUtBLEtBQUssQ0FBQyxlQUFOLENBQUE7TUFQMkMsQ0FBN0M7SUFKd0I7O0lBYzFCLElBQUMsQ0FBQSxhQUFELEdBQWdCOztJQUNoQixJQUFDLENBQUEscUJBQUQsR0FBd0IsU0FBQyxPQUFEO0FBQ3RCLFVBQUE7TUFBQSxPQUFBLEdBQVUsT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsaUJBQWhCLEVBQW1DLEVBQW5DO01BQ1YsQ0FBQSxHQUFJLEtBQUEsQ0FBQTtNQUNKLElBQUEsR0FBTyxDQUFDLENBQUMsVUFBRixDQUFhLENBQUMsQ0FBQyxRQUFGLENBQVcsT0FBWCxDQUFiO01BQ1AsSUFBRyxJQUFBLElBQVEsYUFBWDtlQUNFLGFBQWMsQ0FBQSxJQUFBLENBQUssQ0FBQyxjQUR0Qjs7SUFKc0I7Ozs7OztFQU8xQixNQUFNLENBQUMsT0FBUCxHQUFpQjtBQS9YakIiLCJzb3VyY2VzQ29udGVudCI6WyIjIFRvIGF2b2lkIGxvYWRpbmcgdW5kZXJzY29yZS1wbHVzIGFuZCBkZXBlbmRpbmcgdW5kZXJzY29yZSBvbiBzdGFydHVwXG5fX3BsdXMgPSBudWxsXG5fcGx1cyA9IC0+XG4gIF9fcGx1cyA/PSByZXF1aXJlICd1bmRlcnNjb3JlLXBsdXMnXG5cbkRlbGVnYXRvID0gcmVxdWlyZSAnZGVsZWdhdG8nXG5zZXR0aW5ncyA9IHJlcXVpcmUgJy4vc2V0dGluZ3MnXG5cbltcbiAgQ1NPTlxuICBwYXRoXG4gIHNlbGVjdExpc3RcbiAgZ2V0RWRpdG9yU3RhdGUgICMgc2V0IGJ5IEJhc2UuaW5pdCgpXG5dID0gW10gIyBzZXQgbnVsbFxuXG5WTVBfTE9BRElOR19GSUxFID0gbnVsbFxuVk1QX0xPQURFRF9GSUxFUyA9IFtdXG5cbmxvYWRWbXBPcGVyYXRpb25GaWxlID0gKGZpbGVuYW1lKSAtPlxuICAjIENhbGwgdG8gbG9hZFZtcE9wZXJhdGlvbkZpbGUgY2FuIGJlIG5lc3RlZC5cbiAgIyAxLiByZXF1aXJlKFwiLi9vcGVyYXRvci10cmFuc2Zvcm0tc3RyaW5nXCIpXG4gICMgMi4gaW4gb3BlcmF0b3ItdHJhbnNmb3JtLXN0cmluZy5jb2ZmZWUgY2FsbCBCYXNlLmdldENsYXNzKFwiT3BlcmF0b3JcIikgY2F1c2Ugb3BlcmF0b3IuY29mZmVlIHJlcXVpcmVkLlxuICAjIFNvIHdlIGhhdmUgdG8gc2F2ZSBvcmlnaW5hbCBWTVBfTE9BRElOR19GSUxFIGFuZCByZXN0b3JlIGl0IGFmdGVyIHJlcXVpcmUgZmluaXNoZWQuXG4gIHZtcExvYWRpbmdGaWxlT3JpZ2luYWwgPSBWTVBfTE9BRElOR19GSUxFXG4gIFZNUF9MT0FESU5HX0ZJTEUgPSBmaWxlbmFtZVxuICByZXF1aXJlKGZpbGVuYW1lKVxuICBWTVBfTE9BRElOR19GSUxFID0gdm1wTG9hZGluZ0ZpbGVPcmlnaW5hbFxuXG4gIFZNUF9MT0FERURfRklMRVMucHVzaChmaWxlbmFtZSlcblxuT3BlcmF0aW9uQWJvcnRlZEVycm9yID0gbnVsbFxuXG52aW1TdGF0ZU1ldGhvZHMgPSBbXG4gIFwib25EaWRDaGFuZ2VTZWFyY2hcIlxuICBcIm9uRGlkQ29uZmlybVNlYXJjaFwiXG4gIFwib25EaWRDYW5jZWxTZWFyY2hcIlxuICBcIm9uRGlkQ29tbWFuZFNlYXJjaFwiXG5cbiAgIyBMaWZlIGN5Y2xlIG9mIG9wZXJhdGlvblN0YWNrXG4gIFwib25EaWRTZXRUYXJnZXRcIiwgXCJlbWl0RGlkU2V0VGFyZ2V0XCJcbiAgICBcIm9uV2lsbFNlbGVjdFRhcmdldFwiLCBcImVtaXRXaWxsU2VsZWN0VGFyZ2V0XCJcbiAgICBcIm9uRGlkU2VsZWN0VGFyZ2V0XCIsIFwiZW1pdERpZFNlbGVjdFRhcmdldFwiXG4gICAgXCJvbkRpZEZhaWxTZWxlY3RUYXJnZXRcIiwgXCJlbWl0RGlkRmFpbFNlbGVjdFRhcmdldFwiXG5cbiAgICBcIm9uV2lsbEZpbmlzaE11dGF0aW9uXCIsIFwiZW1pdFdpbGxGaW5pc2hNdXRhdGlvblwiXG4gICAgXCJvbkRpZEZpbmlzaE11dGF0aW9uXCIsIFwiZW1pdERpZEZpbmlzaE11dGF0aW9uXCJcbiAgXCJvbkRpZEZpbmlzaE9wZXJhdGlvblwiXG4gIFwib25EaWRSZXNldE9wZXJhdGlvblN0YWNrXCJcblxuICBcIm9uRGlkU2V0T3BlcmF0b3JNb2RpZmllclwiXG5cbiAgXCJvbldpbGxBY3RpdmF0ZU1vZGVcIlxuICBcIm9uRGlkQWN0aXZhdGVNb2RlXCJcbiAgXCJwcmVlbXB0V2lsbERlYWN0aXZhdGVNb2RlXCJcbiAgXCJvbldpbGxEZWFjdGl2YXRlTW9kZVwiXG4gIFwib25EaWREZWFjdGl2YXRlTW9kZVwiXG5cbiAgXCJvbkRpZENhbmNlbFNlbGVjdExpc3RcIlxuICBcInN1YnNjcmliZVwiXG4gIFwiaXNNb2RlXCJcbiAgXCJnZXRCbG9ja3dpc2VTZWxlY3Rpb25zXCJcbiAgXCJnZXRMYXN0QmxvY2t3aXNlU2VsZWN0aW9uXCJcbiAgXCJhZGRUb0NsYXNzTGlzdFwiXG4gIFwiZ2V0Q29uZmlnXCJcbl1cblxuY2xhc3MgQmFzZVxuICBEZWxlZ2F0by5pbmNsdWRlSW50byh0aGlzKVxuICBAZGVsZWdhdGVzTWV0aG9kcyh2aW1TdGF0ZU1ldGhvZHMuLi4sIHRvUHJvcGVydHk6ICd2aW1TdGF0ZScpXG4gIEBkZWxlZ2F0ZXNQcm9wZXJ0eSgnbW9kZScsICdzdWJtb2RlJywgJ3N3cmFwJywgJ3V0aWxzJywgdG9Qcm9wZXJ0eTogJ3ZpbVN0YXRlJylcblxuICBjb25zdHJ1Y3RvcjogKEB2aW1TdGF0ZSwgcHJvcGVydGllcz1udWxsKSAtPlxuICAgIHtAZWRpdG9yLCBAZWRpdG9yRWxlbWVudCwgQGdsb2JhbFN0YXRlLCBAc3dyYXB9ID0gQHZpbVN0YXRlXG4gICAgQG5hbWUgPSBAY29uc3RydWN0b3IubmFtZVxuICAgIE9iamVjdC5hc3NpZ24odGhpcywgcHJvcGVydGllcykgaWYgcHJvcGVydGllcz9cblxuICAjIFRvIG92ZXJyaWRlXG4gIGluaXRpYWxpemU6IC0+XG5cbiAgIyBPcGVyYXRpb24gcHJvY2Vzc29yIGV4ZWN1dGUgb25seSB3aGVuIGlzQ29tcGxldGUoKSByZXR1cm4gdHJ1ZS5cbiAgIyBJZiBmYWxzZSwgb3BlcmF0aW9uIHByb2Nlc3NvciBwb3N0cG9uZSBpdHMgZXhlY3V0aW9uLlxuICBpc0NvbXBsZXRlOiAtPlxuICAgIGlmIEByZXF1aXJlSW5wdXQgYW5kIG5vdCBAaW5wdXQ/XG4gICAgICBmYWxzZVxuICAgIGVsc2UgaWYgQHJlcXVpcmVUYXJnZXRcbiAgICAgICMgV2hlbiB0aGlzIGZ1bmN0aW9uIGlzIGNhbGxlZCBpbiBCYXNlOjpjb25zdHJ1Y3RvclxuICAgICAgIyB0YWdlcnQgaXMgc3RpbGwgc3RyaW5nIGxpa2UgYE1vdmVUb1JpZ2h0YCwgaW4gdGhpcyBjYXNlIGlzQ29tcGxldGVcbiAgICAgICMgaXMgbm90IGF2YWlsYWJsZS5cbiAgICAgIEB0YXJnZXQ/LmlzQ29tcGxldGU/KClcbiAgICBlbHNlXG4gICAgICB0cnVlXG5cbiAgcmVxdWlyZVRhcmdldDogZmFsc2VcbiAgcmVxdWlyZUlucHV0OiBmYWxzZVxuICByZWNvcmRhYmxlOiBmYWxzZVxuICByZXBlYXRlZDogZmFsc2VcbiAgdGFyZ2V0OiBudWxsICMgU2V0IGluIE9wZXJhdG9yXG4gIG9wZXJhdG9yOiBudWxsICMgU2V0IGluIG9wZXJhdG9yJ3MgdGFyZ2V0KCBNb3Rpb24gb3IgVGV4dE9iamVjdCApXG4gIGlzQXNUYXJnZXRFeGNlcHRTZWxlY3Q6IC0+XG4gICAgQG9wZXJhdG9yPyBhbmQgbm90IEBvcGVyYXRvci5pbnN0YW5jZW9mKCdTZWxlY3QnKVxuXG4gIGFib3J0OiAtPlxuICAgIE9wZXJhdGlvbkFib3J0ZWRFcnJvciA/PSByZXF1aXJlICcuL2Vycm9ycydcbiAgICB0aHJvdyBuZXcgT3BlcmF0aW9uQWJvcnRlZEVycm9yKCdhYm9ydGVkJylcblxuICAjIENvdW50XG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBjb3VudDogbnVsbFxuICBkZWZhdWx0Q291bnQ6IDFcbiAgZ2V0Q291bnQ6IChvZmZzZXQ9MCkgLT5cbiAgICBAY291bnQgPz0gQHZpbVN0YXRlLmdldENvdW50KCkgPyBAZGVmYXVsdENvdW50XG4gICAgQGNvdW50ICsgb2Zmc2V0XG5cbiAgcmVzZXRDb3VudDogLT5cbiAgICBAY291bnQgPSBudWxsXG5cbiAgaXNEZWZhdWx0Q291bnQ6IC0+XG4gICAgQGNvdW50IGlzIEBkZWZhdWx0Q291bnRcblxuICAjIE1pc2NcbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIGNvdW50VGltZXM6IChsYXN0LCBmbikgLT5cbiAgICByZXR1cm4gaWYgbGFzdCA8IDFcblxuICAgIHN0b3BwZWQgPSBmYWxzZVxuICAgIHN0b3AgPSAtPiBzdG9wcGVkID0gdHJ1ZVxuICAgIGZvciBjb3VudCBpbiBbMS4ubGFzdF1cbiAgICAgIGlzRmluYWwgPSBjb3VudCBpcyBsYXN0XG4gICAgICBmbih7Y291bnQsIGlzRmluYWwsIHN0b3B9KVxuICAgICAgYnJlYWsgaWYgc3RvcHBlZFxuXG4gIGFjdGl2YXRlTW9kZTogKG1vZGUsIHN1Ym1vZGUpIC0+XG4gICAgQG9uRGlkRmluaXNoT3BlcmF0aW9uID0+XG4gICAgICBAdmltU3RhdGUuYWN0aXZhdGUobW9kZSwgc3VibW9kZSlcblxuICBhY3RpdmF0ZU1vZGVJZk5lY2Vzc2FyeTogKG1vZGUsIHN1Ym1vZGUpIC0+XG4gICAgdW5sZXNzIEB2aW1TdGF0ZS5pc01vZGUobW9kZSwgc3VibW9kZSlcbiAgICAgIEBhY3RpdmF0ZU1vZGUobW9kZSwgc3VibW9kZSlcblxuICBuZXc6IChuYW1lLCBwcm9wZXJ0aWVzKSAtPlxuICAgIGtsYXNzID0gQmFzZS5nZXRDbGFzcyhuYW1lKVxuICAgIG5ldyBrbGFzcyhAdmltU3RhdGUsIHByb3BlcnRpZXMpXG5cbiAgIyBGSVhNRTogVGhpcyBpcyB1c2VkIHRvIGNsb25lIE1vdGlvbjo6U2VhcmNoIHRvIHN1cHBvcnQgYG5gIGFuZCBgTmBcbiAgIyBCdXQgbWFudWFsIHJlc2V0aW5nIGFuZCBvdmVycmlkaW5nIHByb3BlcnR5IGlzIGJ1ZyBwcm9uZS5cbiAgIyBTaG91bGQgZXh0cmFjdCBhcyBzZWFyY2ggc3BlYyBvYmplY3QgYW5kIHVzZSBpdCBieVxuICAjIGNyZWF0aW5nIGNsZWFuIGluc3RhbmNlIG9mIFNlYXJjaC5cbiAgY2xvbmU6ICh2aW1TdGF0ZSkgLT5cbiAgICBwcm9wZXJ0aWVzID0ge31cbiAgICBleGNsdWRlUHJvcGVydGllcyA9IFsnZWRpdG9yJywgJ2VkaXRvckVsZW1lbnQnLCAnZ2xvYmFsU3RhdGUnLCAndmltU3RhdGUnLCAnb3BlcmF0b3InXVxuICAgIGZvciBvd24ga2V5LCB2YWx1ZSBvZiB0aGlzIHdoZW4ga2V5IG5vdCBpbiBleGNsdWRlUHJvcGVydGllc1xuICAgICAgcHJvcGVydGllc1trZXldID0gdmFsdWVcbiAgICBrbGFzcyA9IHRoaXMuY29uc3RydWN0b3JcbiAgICBuZXcga2xhc3ModmltU3RhdGUsIHByb3BlcnRpZXMpXG5cbiAgY2FuY2VsT3BlcmF0aW9uOiAtPlxuICAgIEB2aW1TdGF0ZS5vcGVyYXRpb25TdGFjay5jYW5jZWwoKVxuXG4gIHByb2Nlc3NPcGVyYXRpb246IC0+XG4gICAgQHZpbVN0YXRlLm9wZXJhdGlvblN0YWNrLnByb2Nlc3MoKVxuXG4gIGZvY3VzU2VsZWN0TGlzdDogKG9wdGlvbnM9e30pIC0+XG4gICAgQG9uRGlkQ2FuY2VsU2VsZWN0TGlzdCA9PlxuICAgICAgQGNhbmNlbE9wZXJhdGlvbigpXG4gICAgc2VsZWN0TGlzdCA/PSBuZXcgKHJlcXVpcmUgJy4vc2VsZWN0LWxpc3QnKVxuICAgIHNlbGVjdExpc3Quc2hvdyhAdmltU3RhdGUsIG9wdGlvbnMpXG5cbiAgaW5wdXQ6IG51bGxcbiAgZm9jdXNJbnB1dDogKG9wdGlvbnMgPSB7fSkgLT5cbiAgICBvcHRpb25zLm9uQ29uZmlybSA/PSAoQGlucHV0KSA9PiBAcHJvY2Vzc09wZXJhdGlvbigpXG4gICAgb3B0aW9ucy5vbkNhbmNlbCA/PSA9PiBAY2FuY2VsT3BlcmF0aW9uKClcbiAgICBvcHRpb25zLm9uQ2hhbmdlID89IChpbnB1dCkgPT4gQHZpbVN0YXRlLmhvdmVyLnNldChpbnB1dClcbiAgICBAdmltU3RhdGUuZm9jdXNJbnB1dChvcHRpb25zKVxuXG4gIHJlYWRDaGFyOiAtPlxuICAgIEB2aW1TdGF0ZS5yZWFkQ2hhclxuICAgICAgb25Db25maXJtOiAoQGlucHV0KSA9PiBAcHJvY2Vzc09wZXJhdGlvbigpXG4gICAgICBvbkNhbmNlbDogPT4gQGNhbmNlbE9wZXJhdGlvbigpXG5cbiAgZ2V0VmltRW9mQnVmZmVyUG9zaXRpb246IC0+XG4gICAgQHV0aWxzLmdldFZpbUVvZkJ1ZmZlclBvc2l0aW9uKEBlZGl0b3IpXG5cbiAgZ2V0VmltTGFzdEJ1ZmZlclJvdzogLT5cbiAgICBAdXRpbHMuZ2V0VmltTGFzdEJ1ZmZlclJvdyhAZWRpdG9yKVxuXG4gIGdldFZpbUxhc3RTY3JlZW5Sb3c6IC0+XG4gICAgQHV0aWxzLmdldFZpbUxhc3RTY3JlZW5Sb3coQGVkaXRvcilcblxuICBnZXRXb3JkQnVmZmVyUmFuZ2VBbmRLaW5kQXRCdWZmZXJQb3NpdGlvbjogKHBvaW50LCBvcHRpb25zKSAtPlxuICAgIEB1dGlscy5nZXRXb3JkQnVmZmVyUmFuZ2VBbmRLaW5kQXRCdWZmZXJQb3NpdGlvbihAZWRpdG9yLCBwb2ludCwgb3B0aW9ucylcblxuICBnZXRGaXJzdENoYXJhY3RlclBvc2l0aW9uRm9yQnVmZmVyUm93OiAocm93KSAtPlxuICAgIEB1dGlscy5nZXRGaXJzdENoYXJhY3RlclBvc2l0aW9uRm9yQnVmZmVyUm93KEBlZGl0b3IsIHJvdylcblxuICBnZXRCdWZmZXJSYW5nZUZvclJvd1JhbmdlOiAocm93UmFuZ2UpIC0+XG4gICAgQHV0aWxzLmdldEJ1ZmZlclJhbmdlRm9yUm93UmFuZ2UoQGVkaXRvciwgcm93UmFuZ2UpXG5cbiAgZ2V0SW5kZW50TGV2ZWxGb3JCdWZmZXJSb3c6IChyb3cpIC0+XG4gICAgQHV0aWxzLmdldEluZGVudExldmVsRm9yQnVmZmVyUm93KEBlZGl0b3IsIHJvdylcblxuICBzY2FuRm9yd2FyZDogKGFyZ3MuLi4pIC0+XG4gICAgQHV0aWxzLnNjYW5FZGl0b3JJbkRpcmVjdGlvbihAZWRpdG9yLCAnZm9yd2FyZCcsIGFyZ3MuLi4pXG5cbiAgc2NhbkJhY2t3YXJkOiAoYXJncy4uLikgLT5cbiAgICBAdXRpbHMuc2NhbkVkaXRvckluRGlyZWN0aW9uKEBlZGl0b3IsICdiYWNrd2FyZCcsIGFyZ3MuLi4pXG5cbiAgZ2V0Rm9sZEVuZFJvd0ZvclJvdzogKGFyZ3MuLi4pIC0+XG4gICAgQHV0aWxzLmdldEZvbGRFbmRSb3dGb3JSb3coQGVkaXRvciwgYXJncy4uLilcblxuICBpbnN0YW5jZW9mOiAoa2xhc3NOYW1lKSAtPlxuICAgIHRoaXMgaW5zdGFuY2VvZiBCYXNlLmdldENsYXNzKGtsYXNzTmFtZSlcblxuICBpczogKGtsYXNzTmFtZSkgLT5cbiAgICB0aGlzLmNvbnN0cnVjdG9yIGlzIEJhc2UuZ2V0Q2xhc3Moa2xhc3NOYW1lKVxuXG4gIGlzT3BlcmF0b3I6IC0+XG4gICAgQGNvbnN0cnVjdG9yLm9wZXJhdGlvbktpbmQgaXMgJ29wZXJhdG9yJ1xuXG4gIGlzTW90aW9uOiAtPlxuICAgIEBjb25zdHJ1Y3Rvci5vcGVyYXRpb25LaW5kIGlzICdtb3Rpb24nXG5cbiAgaXNUZXh0T2JqZWN0OiAtPlxuICAgIEBjb25zdHJ1Y3Rvci5vcGVyYXRpb25LaW5kIGlzICd0ZXh0LW9iamVjdCdcblxuICBnZXRDdXJzb3JCdWZmZXJQb3NpdGlvbjogLT5cbiAgICBpZiBAbW9kZSBpcyAndmlzdWFsJ1xuICAgICAgQGdldEN1cnNvclBvc2l0aW9uRm9yU2VsZWN0aW9uKEBlZGl0b3IuZ2V0TGFzdFNlbGVjdGlvbigpKVxuICAgIGVsc2VcbiAgICAgIEBlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKVxuXG4gIGdldEN1cnNvckJ1ZmZlclBvc2l0aW9uczogLT5cbiAgICBpZiBAbW9kZSBpcyAndmlzdWFsJ1xuICAgICAgQGVkaXRvci5nZXRTZWxlY3Rpb25zKCkubWFwKEBnZXRDdXJzb3JQb3NpdGlvbkZvclNlbGVjdGlvbi5iaW5kKHRoaXMpKVxuICAgIGVsc2VcbiAgICAgIEBlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb25zKClcblxuICBnZXRCdWZmZXJQb3NpdGlvbkZvckN1cnNvcjogKGN1cnNvcikgLT5cbiAgICBpZiBAbW9kZSBpcyAndmlzdWFsJ1xuICAgICAgQGdldEN1cnNvclBvc2l0aW9uRm9yU2VsZWN0aW9uKGN1cnNvci5zZWxlY3Rpb24pXG4gICAgZWxzZVxuICAgICAgY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKClcblxuICBnZXRDdXJzb3JQb3NpdGlvbkZvclNlbGVjdGlvbjogKHNlbGVjdGlvbikgLT5cbiAgICBAc3dyYXAoc2VsZWN0aW9uKS5nZXRCdWZmZXJQb3NpdGlvbkZvcignaGVhZCcsIGZyb206IFsncHJvcGVydHknLCAnc2VsZWN0aW9uJ10pXG5cbiAgdG9TdHJpbmc6IC0+XG4gICAgc3RyID0gQG5hbWVcbiAgICBpZiBAdGFyZ2V0P1xuICAgICAgc3RyICs9IFwiLCB0YXJnZXQ9I3tAdGFyZ2V0Lm5hbWV9LCB0YXJnZXQud2lzZT0je0B0YXJnZXQud2lzZX0gXCJcbiAgICBlbHNlIGlmIEBvcGVyYXRvcj9cbiAgICAgIHN0ciArPSBcIiwgd2lzZT0je0B3aXNlfSAsIG9wZXJhdG9yPSN7QG9wZXJhdG9yLm5hbWV9XCJcbiAgICBlbHNlXG4gICAgICBzdHJcblxuICAjIENsYXNzIG1ldGhvZHNcbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIEB3cml0ZUNvbW1hbmRUYWJsZU9uRGlzazogLT5cbiAgICBjb21tYW5kVGFibGUgPSBAZ2VuZXJhdGVDb21tYW5kVGFibGVCeUVhZ2VyTG9hZCgpXG4gICAgXyA9IF9wbHVzKClcbiAgICBpZiBfLmlzRXF1YWwoQGNvbW1hbmRUYWJsZSwgY29tbWFuZFRhYmxlKVxuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEluZm8oXCJObyBjaGFuZ2UgY29tbWFuZFRhYmxlXCIsIGRpc21pc3NhYmxlOiB0cnVlKVxuICAgICAgcmV0dXJuXG5cbiAgICBDU09OID89IHJlcXVpcmUgJ3NlYXNvbidcbiAgICBwYXRoID89IHJlcXVpcmUoJ3BhdGgnKVxuXG4gICAgbG9hZGFibGVDU09OVGV4dCA9IFwiXCJcIlxuICAgICAgIyBUaGlzIGZpbGUgaXMgYXV0byBnZW5lcmF0ZWQgYnkgYHZpbS1tb2RlLXBsdXM6d3JpdGUtY29tbWFuZC10YWJsZS1vbi1kaXNrYCBjb21tYW5kLlxuICAgICAgIyBET05UIGVkaXQgbWFudWFsbHkuXG4gICAgICBtb2R1bGUuZXhwb3J0cyA9XG4gICAgICAje0NTT04uc3RyaW5naWZ5KGNvbW1hbmRUYWJsZSl9XFxuXG4gICAgICBcIlwiXCJcbiAgICBjb21tYW5kVGFibGVQYXRoID0gcGF0aC5qb2luKF9fZGlybmFtZSwgXCJjb21tYW5kLXRhYmxlLmNvZmZlZVwiKVxuICAgIGF0b20ud29ya3NwYWNlLm9wZW4oY29tbWFuZFRhYmxlUGF0aCkudGhlbiAoZWRpdG9yKSAtPlxuICAgICAgZWRpdG9yLnNldFRleHQobG9hZGFibGVDU09OVGV4dClcbiAgICAgIGVkaXRvci5zYXZlKClcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRJbmZvKFwiVXBkYXRlZCBjb21tYW5kVGFibGVcIiwgZGlzbWlzc2FibGU6IHRydWUpXG5cbiAgQGdlbmVyYXRlQ29tbWFuZFRhYmxlQnlFYWdlckxvYWQ6IC0+XG4gICAgIyBOT1RFOiBjaGFuZ2luZyBvcmRlciBhZmZlY3RzIG91dHB1dCBvZiBsaWIvY29tbWFuZC10YWJsZS5jb2ZmZWVcbiAgICBmaWxlc1RvTG9hZCA9IFtcbiAgICAgICcuL29wZXJhdG9yJywgJy4vb3BlcmF0b3ItaW5zZXJ0JywgJy4vb3BlcmF0b3ItdHJhbnNmb3JtLXN0cmluZycsXG4gICAgICAnLi9tb3Rpb24nLCAnLi9tb3Rpb24tc2VhcmNoJywgJy4vdGV4dC1vYmplY3QnLCAnLi9taXNjLWNvbW1hbmQnXG4gICAgXVxuICAgIGZpbGVzVG9Mb2FkLmZvckVhY2gobG9hZFZtcE9wZXJhdGlvbkZpbGUpXG4gICAgXyA9IF9wbHVzKClcbiAgICBrbGFzc2VzID0gXy52YWx1ZXMoQGdldENsYXNzUmVnaXN0cnkoKSlcbiAgICBrbGFzc2VzR3JvdXBlZEJ5RmlsZSA9IF8uZ3JvdXBCeShrbGFzc2VzLCAoa2xhc3MpIC0+IGtsYXNzLlZNUF9MT0FESU5HX0ZJTEUpXG5cbiAgICBjb21tYW5kVGFibGUgPSB7fVxuICAgIGZvciBmaWxlIGluIGZpbGVzVG9Mb2FkXG4gICAgICBmb3Iga2xhc3MgaW4ga2xhc3Nlc0dyb3VwZWRCeUZpbGVbZmlsZV1cbiAgICAgICAgY29tbWFuZFRhYmxlW2tsYXNzLm5hbWVdID0ga2xhc3MuZ2V0U3BlYygpXG4gICAgY29tbWFuZFRhYmxlXG5cbiAgQGNvbW1hbmRUYWJsZTogbnVsbFxuICBAaW5pdDogKF9nZXRFZGl0b3JTdGF0ZSkgLT5cbiAgICBnZXRFZGl0b3JTdGF0ZSA9IF9nZXRFZGl0b3JTdGF0ZVxuICAgIEBjb21tYW5kVGFibGUgPSByZXF1aXJlKCcuL2NvbW1hbmQtdGFibGUnKVxuICAgIHN1YnNjcmlwdGlvbnMgPSBbXVxuICAgIGZvciBuYW1lLCBzcGVjIG9mIEBjb21tYW5kVGFibGUgd2hlbiBzcGVjLmNvbW1hbmROYW1lP1xuICAgICAgc3Vic2NyaXB0aW9ucy5wdXNoKEByZWdpc3RlckNvbW1hbmRGcm9tU3BlYyhuYW1lLCBzcGVjKSlcbiAgICByZXR1cm4gc3Vic2NyaXB0aW9uc1xuXG4gIGNsYXNzUmVnaXN0cnkgPSB7QmFzZX1cbiAgQGV4dGVuZDogKEBjb21tYW5kPXRydWUpIC0+XG4gICAgQFZNUF9MT0FESU5HX0ZJTEUgPSBWTVBfTE9BRElOR19GSUxFXG4gICAgaWYgQG5hbWUgb2YgY2xhc3NSZWdpc3RyeVxuICAgICAgY29uc29sZS53YXJuKFwiRHVwbGljYXRlIGNvbnN0cnVjdG9yICN7QG5hbWV9XCIpXG4gICAgY2xhc3NSZWdpc3RyeVtAbmFtZV0gPSB0aGlzXG5cbiAgQGdldFNwZWM6IC0+XG4gICAgaWYgQGlzQ29tbWFuZCgpXG4gICAgICBmaWxlOiBAVk1QX0xPQURJTkdfRklMRVxuICAgICAgY29tbWFuZE5hbWU6IEBnZXRDb21tYW5kTmFtZSgpXG4gICAgICBjb21tYW5kU2NvcGU6IEBnZXRDb21tYW5kU2NvcGUoKVxuICAgIGVsc2VcbiAgICAgIGZpbGU6IEBWTVBfTE9BRElOR19GSUxFXG5cbiAgQGdldENsYXNzOiAobmFtZSkgLT5cbiAgICByZXR1cm4ga2xhc3MgaWYgKGtsYXNzID0gY2xhc3NSZWdpc3RyeVtuYW1lXSlcblxuICAgIGZpbGVUb0xvYWQgPSBAY29tbWFuZFRhYmxlW25hbWVdLmZpbGVcbiAgICBpZiBmaWxlVG9Mb2FkIG5vdCBpbiBWTVBfTE9BREVEX0ZJTEVTXG4gICAgICBpZiBhdG9tLmluRGV2TW9kZSgpIGFuZCBzZXR0aW5ncy5nZXQoJ2RlYnVnJylcbiAgICAgICAgY29uc29sZS5sb2cgXCJsYXp5LXJlcXVpcmU6ICN7ZmlsZVRvTG9hZH0gZm9yICN7bmFtZX1cIlxuICAgICAgbG9hZFZtcE9wZXJhdGlvbkZpbGUoZmlsZVRvTG9hZClcbiAgICAgIHJldHVybiBrbGFzcyBpZiAoa2xhc3MgPSBjbGFzc1JlZ2lzdHJ5W25hbWVdKVxuXG4gICAgdGhyb3cgbmV3IEVycm9yKFwiY2xhc3MgJyN7bmFtZX0nIG5vdCBmb3VuZFwiKVxuXG4gIEBnZXRDbGFzc1JlZ2lzdHJ5OiAtPlxuICAgIGNsYXNzUmVnaXN0cnlcblxuICBAaXNDb21tYW5kOiAtPlxuICAgIEBjb21tYW5kXG5cbiAgQGNvbW1hbmRQcmVmaXg6ICd2aW0tbW9kZS1wbHVzJ1xuICBAZ2V0Q29tbWFuZE5hbWU6IC0+XG4gICAgQGNvbW1hbmRQcmVmaXggKyAnOicgKyBfcGx1cygpLmRhc2hlcml6ZShAbmFtZSlcblxuICBAZ2V0Q29tbWFuZE5hbWVXaXRob3V0UHJlZml4OiAtPlxuICAgIF9wbHVzKCkuZGFzaGVyaXplKEBuYW1lKVxuXG4gIEBjb21tYW5kU2NvcGU6ICdhdG9tLXRleHQtZWRpdG9yJ1xuICBAZ2V0Q29tbWFuZFNjb3BlOiAtPlxuICAgIEBjb21tYW5kU2NvcGVcblxuICBAZ2V0RGVzY3RpcHRpb246IC0+XG4gICAgaWYgQGhhc093blByb3BlcnR5KFwiZGVzY3JpcHRpb25cIilcbiAgICAgIEBkZXNjcmlwdGlvblxuICAgIGVsc2VcbiAgICAgIG51bGxcblxuICBAcmVnaXN0ZXJDb21tYW5kOiAtPlxuICAgIGtsYXNzID0gdGhpc1xuICAgIGF0b20uY29tbWFuZHMuYWRkIEBnZXRDb21tYW5kU2NvcGUoKSwgQGdldENvbW1hbmROYW1lKCksIChldmVudCkgLT5cbiAgICAgIHZpbVN0YXRlID0gZ2V0RWRpdG9yU3RhdGUoQGdldE1vZGVsKCkpID8gZ2V0RWRpdG9yU3RhdGUoYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpKVxuICAgICAgaWYgdmltU3RhdGU/ICMgUG9zc2libHkgdW5kZWZpbmVkIFNlZSAjODVcbiAgICAgICAgdmltU3RhdGUub3BlcmF0aW9uU3RhY2sucnVuKGtsYXNzKVxuICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcblxuICBAcmVnaXN0ZXJDb21tYW5kRnJvbVNwZWM6IChuYW1lLCBzcGVjKSAtPlxuICAgIHtjb21tYW5kU2NvcGUsIGNvbW1hbmRQcmVmaXgsIGNvbW1hbmROYW1lLCBnZXRDbGFzc30gPSBzcGVjXG4gICAgY29tbWFuZFNjb3BlID89ICdhdG9tLXRleHQtZWRpdG9yJ1xuICAgIGNvbW1hbmROYW1lID89IChjb21tYW5kUHJlZml4ID8gJ3ZpbS1tb2RlLXBsdXMnKSArICc6JyArIF9wbHVzKCkuZGFzaGVyaXplKG5hbWUpXG4gICAgYXRvbS5jb21tYW5kcy5hZGQgY29tbWFuZFNjb3BlLCBjb21tYW5kTmFtZSwgKGV2ZW50KSAtPlxuICAgICAgdmltU3RhdGUgPSBnZXRFZGl0b3JTdGF0ZShAZ2V0TW9kZWwoKSkgPyBnZXRFZGl0b3JTdGF0ZShhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCkpXG4gICAgICBpZiB2aW1TdGF0ZT8gIyBQb3NzaWJseSB1bmRlZmluZWQgU2VlICM4NVxuICAgICAgICBpZiBnZXRDbGFzcz9cbiAgICAgICAgICB2aW1TdGF0ZS5vcGVyYXRpb25TdGFjay5ydW4oZ2V0Q2xhc3MobmFtZSkpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICB2aW1TdGF0ZS5vcGVyYXRpb25TdGFjay5ydW4obmFtZSlcbiAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXG5cbiAgIyBGb3IgZGVtby1tb2RlIHBrZyBpbnRlZ3JhdGlvblxuICBAb3BlcmF0aW9uS2luZDogbnVsbFxuICBAZ2V0S2luZEZvckNvbW1hbmROYW1lOiAoY29tbWFuZCkgLT5cbiAgICBjb21tYW5kID0gY29tbWFuZC5yZXBsYWNlKC9edmltLW1vZGUtcGx1czovLCBcIlwiKVxuICAgIF8gPSBfcGx1cygpXG4gICAgbmFtZSA9IF8uY2FwaXRhbGl6ZShfLmNhbWVsaXplKGNvbW1hbmQpKVxuICAgIGlmIG5hbWUgb2YgY2xhc3NSZWdpc3RyeVxuICAgICAgY2xhc3NSZWdpc3RyeVtuYW1lXS5vcGVyYXRpb25LaW5kXG5cbm1vZHVsZS5leHBvcnRzID0gQmFzZVxuIl19
