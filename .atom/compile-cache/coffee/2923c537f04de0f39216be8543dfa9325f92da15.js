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

    Base.prototype.focusInput = function(arg) {
      var charsMax, hideCursor, ref1;
      ref1 = arg != null ? arg : {}, charsMax = ref1.charsMax, hideCursor = ref1.hideCursor;
      return this.vimState.focusInput({
        charsMax: charsMax,
        hideCursor: hideCursor,
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
        })(this),
        onChange: (function(_this) {
          return function(input) {
            return _this.vimState.hover.set(input);
          };
        })(this)
      });
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvYmFzZS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0E7QUFBQSxNQUFBLHNMQUFBO0lBQUE7Ozs7RUFBQSxNQUFBLEdBQVM7O0VBQ1QsS0FBQSxHQUFRLFNBQUE7NEJBQ04sU0FBQSxTQUFVLE9BQUEsQ0FBUSxpQkFBUjtFQURKOztFQUdSLFFBQUEsR0FBVyxPQUFBLENBQVEsVUFBUjs7RUFDWCxRQUFBLEdBQVcsT0FBQSxDQUFRLFlBQVI7O0VBRVgsTUFLSSxFQUxKLEVBQ0UsYUFERixFQUVFLGFBRkYsRUFHRSxtQkFIRixFQUlFOztFQUdGLGdCQUFBLEdBQW1COztFQUNuQixnQkFBQSxHQUFtQjs7RUFFbkIsb0JBQUEsR0FBdUIsU0FBQyxRQUFEO0FBS3JCLFFBQUE7SUFBQSxzQkFBQSxHQUF5QjtJQUN6QixnQkFBQSxHQUFtQjtJQUNuQixPQUFBLENBQVEsUUFBUjtJQUNBLGdCQUFBLEdBQW1CO1dBRW5CLGdCQUFnQixDQUFDLElBQWpCLENBQXNCLFFBQXRCO0VBVnFCOztFQVl2QixxQkFBQSxHQUF3Qjs7RUFFeEIsZUFBQSxHQUFrQixDQUNoQixtQkFEZ0IsRUFFaEIsb0JBRmdCLEVBR2hCLG1CQUhnQixFQUloQixvQkFKZ0IsRUFPaEIsZ0JBUGdCLEVBT0Usa0JBUEYsRUFRZCxvQkFSYyxFQVFRLHNCQVJSLEVBU2QsbUJBVGMsRUFTTyxxQkFUUCxFQVVkLHVCQVZjLEVBVVcseUJBVlgsRUFZZCxzQkFaYyxFQVlVLHdCQVpWLEVBYWQscUJBYmMsRUFhUyx1QkFiVCxFQWNoQixzQkFkZ0IsRUFlaEIsMEJBZmdCLEVBaUJoQiwwQkFqQmdCLEVBbUJoQixvQkFuQmdCLEVBb0JoQixtQkFwQmdCLEVBcUJoQiwyQkFyQmdCLEVBc0JoQixzQkF0QmdCLEVBdUJoQixxQkF2QmdCLEVBeUJoQix1QkF6QmdCLEVB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QUFIO1lBQ0UsUUFBUSxDQUFDLGNBQWMsQ0FBQyxHQUF4QixDQUE0QixRQUFBLENBQVMsSUFBVCxDQUE1QixFQURGO1dBQUEsTUFBQTtZQUdFLFFBQVEsQ0FBQyxjQUFjLENBQUMsR0FBeEIsQ0FBNEIsSUFBNUIsRUFIRjtXQURGOztlQUtBLEtBQUssQ0FBQyxlQUFOLENBQUE7TUFQMkMsQ0FBN0M7SUFKd0I7O0lBYzFCLElBQUMsQ0FBQSxhQUFELEdBQWdCOztJQUNoQixJQUFDLENBQUEscUJBQUQsR0FBd0IsU0FBQyxPQUFEO0FBQ3RCLFVBQUE7TUFBQSxPQUFBLEdBQVUsT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsaUJBQWhCLEVBQW1DLEVBQW5DO01BQ1YsQ0FBQSxHQUFJLEtBQUEsQ0FBQTtNQUNKLElBQUEsR0FBTyxDQUFDLENBQUMsVUFBRixDQUFhLENBQUMsQ0FBQyxRQUFGLENBQVcsT0FBWCxDQUFiO01BQ1AsSUFBRyxJQUFBLElBQVEsYUFBWDtlQUNFLGFBQWMsQ0FBQSxJQUFBLENBQUssQ0FBQyxjQUR0Qjs7SUFKc0I7Ozs7OztFQU8xQixNQUFNLENBQUMsT0FBUCxHQUFpQjtBQWpZakIiLCJzb3VyY2VzQ29udGVudCI6WyIjIFRvIGF2b2lkIGxvYWRpbmcgdW5kZXJzY29yZS1wbHVzIGFuZCBkZXBlbmRpbmcgdW5kZXJzY29yZSBvbiBzdGFydHVwXG5fX3BsdXMgPSBudWxsXG5fcGx1cyA9IC0+XG4gIF9fcGx1cyA/PSByZXF1aXJlICd1bmRlcnNjb3JlLXBsdXMnXG5cbkRlbGVnYXRvID0gcmVxdWlyZSAnZGVsZWdhdG8nXG5zZXR0aW5ncyA9IHJlcXVpcmUgJy4vc2V0dGluZ3MnXG5cbltcbiAgQ1NPTlxuICBwYXRoXG4gIHNlbGVjdExpc3RcbiAgZ2V0RWRpdG9yU3RhdGUgICMgc2V0IGJ5IEJhc2UuaW5pdCgpXG5dID0gW10gIyBzZXQgbnVsbFxuXG5WTVBfTE9BRElOR19GSUxFID0gbnVsbFxuVk1QX0xPQURFRF9GSUxFUyA9IFtdXG5cbmxvYWRWbXBPcGVyYXRpb25GaWxlID0gKGZpbGVuYW1lKSAtPlxuICAjIENhbGwgdG8gbG9hZFZtcE9wZXJhdGlvbkZpbGUgY2FuIGJlIG5lc3RlZC5cbiAgIyAxLiByZXF1aXJlKFwiLi9vcGVyYXRvci10cmFuc2Zvcm0tc3RyaW5nXCIpXG4gICMgMi4gaW4gb3BlcmF0b3ItdHJhbnNmb3JtLXN0cmluZy5jb2ZmZWUgY2FsbCBCYXNlLmdldENsYXNzKFwiT3BlcmF0b3JcIikgY2F1c2Ugb3BlcmF0b3IuY29mZmVlIHJlcXVpcmVkLlxuICAjIFNvIHdlIGhhdmUgdG8gc2F2ZSBvcmlnaW5hbCBWTVBfTE9BRElOR19GSUxFIGFuZCByZXN0b3JlIGl0IGFmdGVyIHJlcXVpcmUgZmluaXNoZWQuXG4gIHZtcExvYWRpbmdGaWxlT3JpZ2luYWwgPSBWTVBfTE9BRElOR19GSUxFXG4gIFZNUF9MT0FESU5HX0ZJTEUgPSBmaWxlbmFtZVxuICByZXF1aXJlKGZpbGVuYW1lKVxuICBWTVBfTE9BRElOR19GSUxFID0gdm1wTG9hZGluZ0ZpbGVPcmlnaW5hbFxuXG4gIFZNUF9MT0FERURfRklMRVMucHVzaChmaWxlbmFtZSlcblxuT3BlcmF0aW9uQWJvcnRlZEVycm9yID0gbnVsbFxuXG52aW1TdGF0ZU1ldGhvZHMgPSBbXG4gIFwib25EaWRDaGFuZ2VTZWFyY2hcIlxuICBcIm9uRGlkQ29uZmlybVNlYXJjaFwiXG4gIFwib25EaWRDYW5jZWxTZWFyY2hcIlxuICBcIm9uRGlkQ29tbWFuZFNlYXJjaFwiXG5cbiAgIyBMaWZlIGN5Y2xlIG9mIG9wZXJhdGlvblN0YWNrXG4gIFwib25EaWRTZXRUYXJnZXRcIiwgXCJlbWl0RGlkU2V0VGFyZ2V0XCJcbiAgICBcIm9uV2lsbFNlbGVjdFRhcmdldFwiLCBcImVtaXRXaWxsU2VsZWN0VGFyZ2V0XCJcbiAgICBcIm9uRGlkU2VsZWN0VGFyZ2V0XCIsIFwiZW1pdERpZFNlbGVjdFRhcmdldFwiXG4gICAgXCJvbkRpZEZhaWxTZWxlY3RUYXJnZXRcIiwgXCJlbWl0RGlkRmFpbFNlbGVjdFRhcmdldFwiXG5cbiAgICBcIm9uV2lsbEZpbmlzaE11dGF0aW9uXCIsIFwiZW1pdFdpbGxGaW5pc2hNdXRhdGlvblwiXG4gICAgXCJvbkRpZEZpbmlzaE11dGF0aW9uXCIsIFwiZW1pdERpZEZpbmlzaE11dGF0aW9uXCJcbiAgXCJvbkRpZEZpbmlzaE9wZXJhdGlvblwiXG4gIFwib25EaWRSZXNldE9wZXJhdGlvblN0YWNrXCJcblxuICBcIm9uRGlkU2V0T3BlcmF0b3JNb2RpZmllclwiXG5cbiAgXCJvbldpbGxBY3RpdmF0ZU1vZGVcIlxuICBcIm9uRGlkQWN0aXZhdGVNb2RlXCJcbiAgXCJwcmVlbXB0V2lsbERlYWN0aXZhdGVNb2RlXCJcbiAgXCJvbldpbGxEZWFjdGl2YXRlTW9kZVwiXG4gIFwib25EaWREZWFjdGl2YXRlTW9kZVwiXG5cbiAgXCJvbkRpZENhbmNlbFNlbGVjdExpc3RcIlxuICBcInN1YnNjcmliZVwiXG4gIFwiaXNNb2RlXCJcbiAgXCJnZXRCbG9ja3dpc2VTZWxlY3Rpb25zXCJcbiAgXCJnZXRMYXN0QmxvY2t3aXNlU2VsZWN0aW9uXCJcbiAgXCJhZGRUb0NsYXNzTGlzdFwiXG4gIFwiZ2V0Q29uZmlnXCJcbl1cblxuY2xhc3MgQmFzZVxuICBEZWxlZ2F0by5pbmNsdWRlSW50byh0aGlzKVxuICBAZGVsZWdhdGVzTWV0aG9kcyh2aW1TdGF0ZU1ldGhvZHMuLi4sIHRvUHJvcGVydHk6ICd2aW1TdGF0ZScpXG4gIEBkZWxlZ2F0ZXNQcm9wZXJ0eSgnbW9kZScsICdzdWJtb2RlJywgJ3N3cmFwJywgJ3V0aWxzJywgdG9Qcm9wZXJ0eTogJ3ZpbVN0YXRlJylcblxuICBjb25zdHJ1Y3RvcjogKEB2aW1TdGF0ZSwgcHJvcGVydGllcz1udWxsKSAtPlxuICAgIHtAZWRpdG9yLCBAZWRpdG9yRWxlbWVudCwgQGdsb2JhbFN0YXRlLCBAc3dyYXB9ID0gQHZpbVN0YXRlXG4gICAgQG5hbWUgPSBAY29uc3RydWN0b3IubmFtZVxuICAgIE9iamVjdC5hc3NpZ24odGhpcywgcHJvcGVydGllcykgaWYgcHJvcGVydGllcz9cblxuICAjIFRvIG92ZXJyaWRlXG4gIGluaXRpYWxpemU6IC0+XG5cbiAgIyBPcGVyYXRpb24gcHJvY2Vzc29yIGV4ZWN1dGUgb25seSB3aGVuIGlzQ29tcGxldGUoKSByZXR1cm4gdHJ1ZS5cbiAgIyBJZiBmYWxzZSwgb3BlcmF0aW9uIHByb2Nlc3NvciBwb3N0cG9uZSBpdHMgZXhlY3V0aW9uLlxuICBpc0NvbXBsZXRlOiAtPlxuICAgIGlmIEByZXF1aXJlSW5wdXQgYW5kIG5vdCBAaW5wdXQ/XG4gICAgICBmYWxzZVxuICAgIGVsc2UgaWYgQHJlcXVpcmVUYXJnZXRcbiAgICAgICMgV2hlbiB0aGlzIGZ1bmN0aW9uIGlzIGNhbGxlZCBpbiBCYXNlOjpjb25zdHJ1Y3RvclxuICAgICAgIyB0YWdlcnQgaXMgc3RpbGwgc3RyaW5nIGxpa2UgYE1vdmVUb1JpZ2h0YCwgaW4gdGhpcyBjYXNlIGlzQ29tcGxldGVcbiAgICAgICMgaXMgbm90IGF2YWlsYWJsZS5cbiAgICAgIEB0YXJnZXQ/LmlzQ29tcGxldGU/KClcbiAgICBlbHNlXG4gICAgICB0cnVlXG5cbiAgcmVxdWlyZVRhcmdldDogZmFsc2VcbiAgcmVxdWlyZUlucHV0OiBmYWxzZVxuICByZWNvcmRhYmxlOiBmYWxzZVxuICByZXBlYXRlZDogZmFsc2VcbiAgdGFyZ2V0OiBudWxsICMgU2V0IGluIE9wZXJhdG9yXG4gIG9wZXJhdG9yOiBudWxsICMgU2V0IGluIG9wZXJhdG9yJ3MgdGFyZ2V0KCBNb3Rpb24gb3IgVGV4dE9iamVjdCApXG4gIGlzQXNUYXJnZXRFeGNlcHRTZWxlY3Q6IC0+XG4gICAgQG9wZXJhdG9yPyBhbmQgbm90IEBvcGVyYXRvci5pbnN0YW5jZW9mKCdTZWxlY3QnKVxuXG4gIGFib3J0OiAtPlxuICAgIE9wZXJhdGlvbkFib3J0ZWRFcnJvciA/PSByZXF1aXJlICcuL2Vycm9ycydcbiAgICB0aHJvdyBuZXcgT3BlcmF0aW9uQWJvcnRlZEVycm9yKCdhYm9ydGVkJylcblxuICAjIENvdW50XG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBjb3VudDogbnVsbFxuICBkZWZhdWx0Q291bnQ6IDFcbiAgZ2V0Q291bnQ6IChvZmZzZXQ9MCkgLT5cbiAgICBAY291bnQgPz0gQHZpbVN0YXRlLmdldENvdW50KCkgPyBAZGVmYXVsdENvdW50XG4gICAgQGNvdW50ICsgb2Zmc2V0XG5cbiAgcmVzZXRDb3VudDogLT5cbiAgICBAY291bnQgPSBudWxsXG5cbiAgaXNEZWZhdWx0Q291bnQ6IC0+XG4gICAgQGNvdW50IGlzIEBkZWZhdWx0Q291bnRcblxuICAjIE1pc2NcbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIGNvdW50VGltZXM6IChsYXN0LCBmbikgLT5cbiAgICByZXR1cm4gaWYgbGFzdCA8IDFcblxuICAgIHN0b3BwZWQgPSBmYWxzZVxuICAgIHN0b3AgPSAtPiBzdG9wcGVkID0gdHJ1ZVxuICAgIGZvciBjb3VudCBpbiBbMS4ubGFzdF1cbiAgICAgIGlzRmluYWwgPSBjb3VudCBpcyBsYXN0XG4gICAgICBmbih7Y291bnQsIGlzRmluYWwsIHN0b3B9KVxuICAgICAgYnJlYWsgaWYgc3RvcHBlZFxuXG4gIGFjdGl2YXRlTW9kZTogKG1vZGUsIHN1Ym1vZGUpIC0+XG4gICAgQG9uRGlkRmluaXNoT3BlcmF0aW9uID0+XG4gICAgICBAdmltU3RhdGUuYWN0aXZhdGUobW9kZSwgc3VibW9kZSlcblxuICBhY3RpdmF0ZU1vZGVJZk5lY2Vzc2FyeTogKG1vZGUsIHN1Ym1vZGUpIC0+XG4gICAgdW5sZXNzIEB2aW1TdGF0ZS5pc01vZGUobW9kZSwgc3VibW9kZSlcbiAgICAgIEBhY3RpdmF0ZU1vZGUobW9kZSwgc3VibW9kZSlcblxuICBuZXc6IChuYW1lLCBwcm9wZXJ0aWVzKSAtPlxuICAgIGtsYXNzID0gQmFzZS5nZXRDbGFzcyhuYW1lKVxuICAgIG5ldyBrbGFzcyhAdmltU3RhdGUsIHByb3BlcnRpZXMpXG5cbiAgIyBGSVhNRTogVGhpcyBpcyB1c2VkIHRvIGNsb25lIE1vdGlvbjo6U2VhcmNoIHRvIHN1cHBvcnQgYG5gIGFuZCBgTmBcbiAgIyBCdXQgbWFudWFsIHJlc2V0aW5nIGFuZCBvdmVycmlkaW5nIHByb3BlcnR5IGlzIGJ1ZyBwcm9uZS5cbiAgIyBTaG91bGQgZXh0cmFjdCBhcyBzZWFyY2ggc3BlYyBvYmplY3QgYW5kIHVzZSBpdCBieVxuICAjIGNyZWF0aW5nIGNsZWFuIGluc3RhbmNlIG9mIFNlYXJjaC5cbiAgY2xvbmU6ICh2aW1TdGF0ZSkgLT5cbiAgICBwcm9wZXJ0aWVzID0ge31cbiAgICBleGNsdWRlUHJvcGVydGllcyA9IFsnZWRpdG9yJywgJ2VkaXRvckVsZW1lbnQnLCAnZ2xvYmFsU3RhdGUnLCAndmltU3RhdGUnLCAnb3BlcmF0b3InXVxuICAgIGZvciBvd24ga2V5LCB2YWx1ZSBvZiB0aGlzIHdoZW4ga2V5IG5vdCBpbiBleGNsdWRlUHJvcGVydGllc1xuICAgICAgcHJvcGVydGllc1trZXldID0gdmFsdWVcbiAgICBrbGFzcyA9IHRoaXMuY29uc3RydWN0b3JcbiAgICBuZXcga2xhc3ModmltU3RhdGUsIHByb3BlcnRpZXMpXG5cbiAgY2FuY2VsT3BlcmF0aW9uOiAtPlxuICAgIEB2aW1TdGF0ZS5vcGVyYXRpb25TdGFjay5jYW5jZWwoKVxuXG4gIHByb2Nlc3NPcGVyYXRpb246IC0+XG4gICAgQHZpbVN0YXRlLm9wZXJhdGlvblN0YWNrLnByb2Nlc3MoKVxuXG4gIGZvY3VzU2VsZWN0TGlzdDogKG9wdGlvbnM9e30pIC0+XG4gICAgQG9uRGlkQ2FuY2VsU2VsZWN0TGlzdCA9PlxuICAgICAgQGNhbmNlbE9wZXJhdGlvbigpXG4gICAgc2VsZWN0TGlzdCA/PSBuZXcgKHJlcXVpcmUgJy4vc2VsZWN0LWxpc3QnKVxuICAgIHNlbGVjdExpc3Quc2hvdyhAdmltU3RhdGUsIG9wdGlvbnMpXG5cbiAgaW5wdXQ6IG51bGxcbiAgZm9jdXNJbnB1dDogKHtjaGFyc01heCwgaGlkZUN1cnNvcn0gPSB7fSkgLT5cbiAgICBAdmltU3RhdGUuZm9jdXNJbnB1dFxuICAgICAgY2hhcnNNYXg6IGNoYXJzTWF4XG4gICAgICBoaWRlQ3Vyc29yOiBoaWRlQ3Vyc29yXG4gICAgICBvbkNvbmZpcm06IChAaW5wdXQpID0+IEBwcm9jZXNzT3BlcmF0aW9uKClcbiAgICAgIG9uQ2FuY2VsOiA9PiBAY2FuY2VsT3BlcmF0aW9uKClcbiAgICAgIG9uQ2hhbmdlOiAoaW5wdXQpID0+IEB2aW1TdGF0ZS5ob3Zlci5zZXQoaW5wdXQpXG5cbiAgcmVhZENoYXI6IC0+XG4gICAgQHZpbVN0YXRlLnJlYWRDaGFyXG4gICAgICBvbkNvbmZpcm06IChAaW5wdXQpID0+IEBwcm9jZXNzT3BlcmF0aW9uKClcbiAgICAgIG9uQ2FuY2VsOiA9PiBAY2FuY2VsT3BlcmF0aW9uKClcblxuICBnZXRWaW1Fb2ZCdWZmZXJQb3NpdGlvbjogLT5cbiAgICBAdXRpbHMuZ2V0VmltRW9mQnVmZmVyUG9zaXRpb24oQGVkaXRvcilcblxuICBnZXRWaW1MYXN0QnVmZmVyUm93OiAtPlxuICAgIEB1dGlscy5nZXRWaW1MYXN0QnVmZmVyUm93KEBlZGl0b3IpXG5cbiAgZ2V0VmltTGFzdFNjcmVlblJvdzogLT5cbiAgICBAdXRpbHMuZ2V0VmltTGFzdFNjcmVlblJvdyhAZWRpdG9yKVxuXG4gIGdldFdvcmRCdWZmZXJSYW5nZUFuZEtpbmRBdEJ1ZmZlclBvc2l0aW9uOiAocG9pbnQsIG9wdGlvbnMpIC0+XG4gICAgQHV0aWxzLmdldFdvcmRCdWZmZXJSYW5nZUFuZEtpbmRBdEJ1ZmZlclBvc2l0aW9uKEBlZGl0b3IsIHBvaW50LCBvcHRpb25zKVxuXG4gIGdldEZpcnN0Q2hhcmFjdGVyUG9zaXRpb25Gb3JCdWZmZXJSb3c6IChyb3cpIC0+XG4gICAgQHV0aWxzLmdldEZpcnN0Q2hhcmFjdGVyUG9zaXRpb25Gb3JCdWZmZXJSb3coQGVkaXRvciwgcm93KVxuXG4gIGdldEJ1ZmZlclJhbmdlRm9yUm93UmFuZ2U6IChyb3dSYW5nZSkgLT5cbiAgICBAdXRpbHMuZ2V0QnVmZmVyUmFuZ2VGb3JSb3dSYW5nZShAZWRpdG9yLCByb3dSYW5nZSlcblxuICBnZXRJbmRlbnRMZXZlbEZvckJ1ZmZlclJvdzogKHJvdykgLT5cbiAgICBAdXRpbHMuZ2V0SW5kZW50TGV2ZWxGb3JCdWZmZXJSb3coQGVkaXRvciwgcm93KVxuXG4gIHNjYW5Gb3J3YXJkOiAoYXJncy4uLikgLT5cbiAgICBAdXRpbHMuc2NhbkVkaXRvckluRGlyZWN0aW9uKEBlZGl0b3IsICdmb3J3YXJkJywgYXJncy4uLilcblxuICBzY2FuQmFja3dhcmQ6IChhcmdzLi4uKSAtPlxuICAgIEB1dGlscy5zY2FuRWRpdG9ySW5EaXJlY3Rpb24oQGVkaXRvciwgJ2JhY2t3YXJkJywgYXJncy4uLilcblxuICBnZXRGb2xkRW5kUm93Rm9yUm93OiAoYXJncy4uLikgLT5cbiAgICBAdXRpbHMuZ2V0Rm9sZEVuZFJvd0ZvclJvdyhAZWRpdG9yLCBhcmdzLi4uKVxuXG4gIGluc3RhbmNlb2Y6IChrbGFzc05hbWUpIC0+XG4gICAgdGhpcyBpbnN0YW5jZW9mIEJhc2UuZ2V0Q2xhc3Moa2xhc3NOYW1lKVxuXG4gIGlzOiAoa2xhc3NOYW1lKSAtPlxuICAgIHRoaXMuY29uc3RydWN0b3IgaXMgQmFzZS5nZXRDbGFzcyhrbGFzc05hbWUpXG5cbiAgaXNPcGVyYXRvcjogLT5cbiAgICBAY29uc3RydWN0b3Iub3BlcmF0aW9uS2luZCBpcyAnb3BlcmF0b3InXG5cbiAgaXNNb3Rpb246IC0+XG4gICAgQGNvbnN0cnVjdG9yLm9wZXJhdGlvbktpbmQgaXMgJ21vdGlvbidcblxuICBpc1RleHRPYmplY3Q6IC0+XG4gICAgQGNvbnN0cnVjdG9yLm9wZXJhdGlvbktpbmQgaXMgJ3RleHQtb2JqZWN0J1xuXG4gIGdldEN1cnNvckJ1ZmZlclBvc2l0aW9uOiAtPlxuICAgIGlmIEBtb2RlIGlzICd2aXN1YWwnXG4gICAgICBAZ2V0Q3Vyc29yUG9zaXRpb25Gb3JTZWxlY3Rpb24oQGVkaXRvci5nZXRMYXN0U2VsZWN0aW9uKCkpXG4gICAgZWxzZVxuICAgICAgQGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpXG5cbiAgZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb25zOiAtPlxuICAgIGlmIEBtb2RlIGlzICd2aXN1YWwnXG4gICAgICBAZWRpdG9yLmdldFNlbGVjdGlvbnMoKS5tYXAoQGdldEN1cnNvclBvc2l0aW9uRm9yU2VsZWN0aW9uLmJpbmQodGhpcykpXG4gICAgZWxzZVxuICAgICAgQGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbnMoKVxuXG4gIGdldEJ1ZmZlclBvc2l0aW9uRm9yQ3Vyc29yOiAoY3Vyc29yKSAtPlxuICAgIGlmIEBtb2RlIGlzICd2aXN1YWwnXG4gICAgICBAZ2V0Q3Vyc29yUG9zaXRpb25Gb3JTZWxlY3Rpb24oY3Vyc29yLnNlbGVjdGlvbilcbiAgICBlbHNlXG4gICAgICBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuXG4gIGdldEN1cnNvclBvc2l0aW9uRm9yU2VsZWN0aW9uOiAoc2VsZWN0aW9uKSAtPlxuICAgIEBzd3JhcChzZWxlY3Rpb24pLmdldEJ1ZmZlclBvc2l0aW9uRm9yKCdoZWFkJywgZnJvbTogWydwcm9wZXJ0eScsICdzZWxlY3Rpb24nXSlcblxuICB0b1N0cmluZzogLT5cbiAgICBzdHIgPSBAbmFtZVxuICAgIGlmIEB0YXJnZXQ/XG4gICAgICBzdHIgKz0gXCIsIHRhcmdldD0je0B0YXJnZXQubmFtZX0sIHRhcmdldC53aXNlPSN7QHRhcmdldC53aXNlfSBcIlxuICAgIGVsc2UgaWYgQG9wZXJhdG9yP1xuICAgICAgc3RyICs9IFwiLCB3aXNlPSN7QHdpc2V9ICwgb3BlcmF0b3I9I3tAb3BlcmF0b3IubmFtZX1cIlxuICAgIGVsc2VcbiAgICAgIHN0clxuXG4gICMgQ2xhc3MgbWV0aG9kc1xuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgQHdyaXRlQ29tbWFuZFRhYmxlT25EaXNrOiAtPlxuICAgIGNvbW1hbmRUYWJsZSA9IEBnZW5lcmF0ZUNvbW1hbmRUYWJsZUJ5RWFnZXJMb2FkKClcbiAgICBfID0gX3BsdXMoKVxuICAgIGlmIF8uaXNFcXVhbChAY29tbWFuZFRhYmxlLCBjb21tYW5kVGFibGUpXG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkSW5mbyhcIk5vIGNoYW5nZSBjb21tYW5kVGFibGVcIiwgZGlzbWlzc2FibGU6IHRydWUpXG4gICAgICByZXR1cm5cblxuICAgIENTT04gPz0gcmVxdWlyZSAnc2Vhc29uJ1xuICAgIHBhdGggPz0gcmVxdWlyZSgncGF0aCcpXG5cbiAgICBsb2FkYWJsZUNTT05UZXh0ID0gXCJcIlwiXG4gICAgICAjIFRoaXMgZmlsZSBpcyBhdXRvIGdlbmVyYXRlZCBieSBgdmltLW1vZGUtcGx1czp3cml0ZS1jb21tYW5kLXRhYmxlLW9uLWRpc2tgIGNvbW1hbmQuXG4gICAgICAjIERPTlQgZWRpdCBtYW51YWxseS5cbiAgICAgIG1vZHVsZS5leHBvcnRzID1cbiAgICAgICN7Q1NPTi5zdHJpbmdpZnkoY29tbWFuZFRhYmxlKX1cXG5cbiAgICAgIFwiXCJcIlxuICAgIGNvbW1hbmRUYWJsZVBhdGggPSBwYXRoLmpvaW4oX19kaXJuYW1lLCBcImNvbW1hbmQtdGFibGUuY29mZmVlXCIpXG4gICAgYXRvbS53b3Jrc3BhY2Uub3Blbihjb21tYW5kVGFibGVQYXRoKS50aGVuIChlZGl0b3IpIC0+XG4gICAgICBlZGl0b3Iuc2V0VGV4dChsb2FkYWJsZUNTT05UZXh0KVxuICAgICAgZWRpdG9yLnNhdmUoKVxuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEluZm8oXCJVcGRhdGVkIGNvbW1hbmRUYWJsZVwiLCBkaXNtaXNzYWJsZTogdHJ1ZSlcblxuICBAZ2VuZXJhdGVDb21tYW5kVGFibGVCeUVhZ2VyTG9hZDogLT5cbiAgICAjIE5PVEU6IGNoYW5naW5nIG9yZGVyIGFmZmVjdHMgb3V0cHV0IG9mIGxpYi9jb21tYW5kLXRhYmxlLmNvZmZlZVxuICAgIGZpbGVzVG9Mb2FkID0gW1xuICAgICAgJy4vb3BlcmF0b3InLCAnLi9vcGVyYXRvci1pbnNlcnQnLCAnLi9vcGVyYXRvci10cmFuc2Zvcm0tc3RyaW5nJyxcbiAgICAgICcuL21vdGlvbicsICcuL21vdGlvbi1zZWFyY2gnLCAnLi90ZXh0LW9iamVjdCcsICcuL21pc2MtY29tbWFuZCdcbiAgICBdXG4gICAgZmlsZXNUb0xvYWQuZm9yRWFjaChsb2FkVm1wT3BlcmF0aW9uRmlsZSlcbiAgICBfID0gX3BsdXMoKVxuICAgIGtsYXNzZXMgPSBfLnZhbHVlcyhAZ2V0Q2xhc3NSZWdpc3RyeSgpKVxuICAgIGtsYXNzZXNHcm91cGVkQnlGaWxlID0gXy5ncm91cEJ5KGtsYXNzZXMsIChrbGFzcykgLT4ga2xhc3MuVk1QX0xPQURJTkdfRklMRSlcblxuICAgIGNvbW1hbmRUYWJsZSA9IHt9XG4gICAgZm9yIGZpbGUgaW4gZmlsZXNUb0xvYWRcbiAgICAgIGZvciBrbGFzcyBpbiBrbGFzc2VzR3JvdXBlZEJ5RmlsZVtmaWxlXVxuICAgICAgICBjb21tYW5kVGFibGVba2xhc3MubmFtZV0gPSBrbGFzcy5nZXRTcGVjKClcbiAgICBjb21tYW5kVGFibGVcblxuICBAY29tbWFuZFRhYmxlOiBudWxsXG4gIEBpbml0OiAoX2dldEVkaXRvclN0YXRlKSAtPlxuICAgIGdldEVkaXRvclN0YXRlID0gX2dldEVkaXRvclN0YXRlXG4gICAgQGNvbW1hbmRUYWJsZSA9IHJlcXVpcmUoJy4vY29tbWFuZC10YWJsZScpXG4gICAgc3Vic2NyaXB0aW9ucyA9IFtdXG4gICAgZm9yIG5hbWUsIHNwZWMgb2YgQGNvbW1hbmRUYWJsZSB3aGVuIHNwZWMuY29tbWFuZE5hbWU/XG4gICAgICBzdWJzY3JpcHRpb25zLnB1c2goQHJlZ2lzdGVyQ29tbWFuZEZyb21TcGVjKG5hbWUsIHNwZWMpKVxuICAgIHJldHVybiBzdWJzY3JpcHRpb25zXG5cbiAgY2xhc3NSZWdpc3RyeSA9IHtCYXNlfVxuICBAZXh0ZW5kOiAoQGNvbW1hbmQ9dHJ1ZSkgLT5cbiAgICBAVk1QX0xPQURJTkdfRklMRSA9IFZNUF9MT0FESU5HX0ZJTEVcbiAgICBpZiBAbmFtZSBvZiBjbGFzc1JlZ2lzdHJ5XG4gICAgICBjb25zb2xlLndhcm4oXCJEdXBsaWNhdGUgY29uc3RydWN0b3IgI3tAbmFtZX1cIilcbiAgICBjbGFzc1JlZ2lzdHJ5W0BuYW1lXSA9IHRoaXNcblxuICBAZ2V0U3BlYzogLT5cbiAgICBpZiBAaXNDb21tYW5kKClcbiAgICAgIGZpbGU6IEBWTVBfTE9BRElOR19GSUxFXG4gICAgICBjb21tYW5kTmFtZTogQGdldENvbW1hbmROYW1lKClcbiAgICAgIGNvbW1hbmRTY29wZTogQGdldENvbW1hbmRTY29wZSgpXG4gICAgZWxzZVxuICAgICAgZmlsZTogQFZNUF9MT0FESU5HX0ZJTEVcblxuICBAZ2V0Q2xhc3M6IChuYW1lKSAtPlxuICAgIHJldHVybiBrbGFzcyBpZiAoa2xhc3MgPSBjbGFzc1JlZ2lzdHJ5W25hbWVdKVxuXG4gICAgZmlsZVRvTG9hZCA9IEBjb21tYW5kVGFibGVbbmFtZV0uZmlsZVxuICAgIGlmIGZpbGVUb0xvYWQgbm90IGluIFZNUF9MT0FERURfRklMRVNcbiAgICAgIGlmIGF0b20uaW5EZXZNb2RlKCkgYW5kIHNldHRpbmdzLmdldCgnZGVidWcnKVxuICAgICAgICBjb25zb2xlLmxvZyBcImxhenktcmVxdWlyZTogI3tmaWxlVG9Mb2FkfSBmb3IgI3tuYW1lfVwiXG4gICAgICBsb2FkVm1wT3BlcmF0aW9uRmlsZShmaWxlVG9Mb2FkKVxuICAgICAgcmV0dXJuIGtsYXNzIGlmIChrbGFzcyA9IGNsYXNzUmVnaXN0cnlbbmFtZV0pXG5cbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJjbGFzcyAnI3tuYW1lfScgbm90IGZvdW5kXCIpXG5cbiAgQGdldENsYXNzUmVnaXN0cnk6IC0+XG4gICAgY2xhc3NSZWdpc3RyeVxuXG4gIEBpc0NvbW1hbmQ6IC0+XG4gICAgQGNvbW1hbmRcblxuICBAY29tbWFuZFByZWZpeDogJ3ZpbS1tb2RlLXBsdXMnXG4gIEBnZXRDb21tYW5kTmFtZTogLT5cbiAgICBAY29tbWFuZFByZWZpeCArICc6JyArIF9wbHVzKCkuZGFzaGVyaXplKEBuYW1lKVxuXG4gIEBnZXRDb21tYW5kTmFtZVdpdGhvdXRQcmVmaXg6IC0+XG4gICAgX3BsdXMoKS5kYXNoZXJpemUoQG5hbWUpXG5cbiAgQGNvbW1hbmRTY29wZTogJ2F0b20tdGV4dC1lZGl0b3InXG4gIEBnZXRDb21tYW5kU2NvcGU6IC0+XG4gICAgQGNvbW1hbmRTY29wZVxuXG4gIEBnZXREZXNjdGlwdGlvbjogLT5cbiAgICBpZiBAaGFzT3duUHJvcGVydHkoXCJkZXNjcmlwdGlvblwiKVxuICAgICAgQGRlc2NyaXB0aW9uXG4gICAgZWxzZVxuICAgICAgbnVsbFxuXG4gIEByZWdpc3RlckNvbW1hbmQ6IC0+XG4gICAga2xhc3MgPSB0aGlzXG4gICAgYXRvbS5jb21tYW5kcy5hZGQgQGdldENvbW1hbmRTY29wZSgpLCBAZ2V0Q29tbWFuZE5hbWUoKSwgKGV2ZW50KSAtPlxuICAgICAgdmltU3RhdGUgPSBnZXRFZGl0b3JTdGF0ZShAZ2V0TW9kZWwoKSkgPyBnZXRFZGl0b3JTdGF0ZShhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCkpXG4gICAgICBpZiB2aW1TdGF0ZT8gIyBQb3NzaWJseSB1bmRlZmluZWQgU2VlICM4NVxuICAgICAgICB2aW1TdGF0ZS5vcGVyYXRpb25TdGFjay5ydW4oa2xhc3MpXG4gICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuXG4gIEByZWdpc3RlckNvbW1hbmRGcm9tU3BlYzogKG5hbWUsIHNwZWMpIC0+XG4gICAge2NvbW1hbmRTY29wZSwgY29tbWFuZFByZWZpeCwgY29tbWFuZE5hbWUsIGdldENsYXNzfSA9IHNwZWNcbiAgICBjb21tYW5kU2NvcGUgPz0gJ2F0b20tdGV4dC1lZGl0b3InXG4gICAgY29tbWFuZE5hbWUgPz0gKGNvbW1hbmRQcmVmaXggPyAndmltLW1vZGUtcGx1cycpICsgJzonICsgX3BsdXMoKS5kYXNoZXJpemUobmFtZSlcbiAgICBhdG9tLmNvbW1hbmRzLmFkZCBjb21tYW5kU2NvcGUsIGNvbW1hbmROYW1lLCAoZXZlbnQpIC0+XG4gICAgICB2aW1TdGF0ZSA9IGdldEVkaXRvclN0YXRlKEBnZXRNb2RlbCgpKSA/IGdldEVkaXRvclN0YXRlKGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKSlcbiAgICAgIGlmIHZpbVN0YXRlPyAjIFBvc3NpYmx5IHVuZGVmaW5lZCBTZWUgIzg1XG4gICAgICAgIGlmIGdldENsYXNzP1xuICAgICAgICAgIHZpbVN0YXRlLm9wZXJhdGlvblN0YWNrLnJ1bihnZXRDbGFzcyhuYW1lKSlcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHZpbVN0YXRlLm9wZXJhdGlvblN0YWNrLnJ1bihuYW1lKVxuICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcblxuICAjIEZvciBkZW1vLW1vZGUgcGtnIGludGVncmF0aW9uXG4gIEBvcGVyYXRpb25LaW5kOiBudWxsXG4gIEBnZXRLaW5kRm9yQ29tbWFuZE5hbWU6IChjb21tYW5kKSAtPlxuICAgIGNvbW1hbmQgPSBjb21tYW5kLnJlcGxhY2UoL152aW0tbW9kZS1wbHVzOi8sIFwiXCIpXG4gICAgXyA9IF9wbHVzKClcbiAgICBuYW1lID0gXy5jYXBpdGFsaXplKF8uY2FtZWxpemUoY29tbWFuZCkpXG4gICAgaWYgbmFtZSBvZiBjbGFzc1JlZ2lzdHJ5XG4gICAgICBjbGFzc1JlZ2lzdHJ5W25hbWVdLm9wZXJhdGlvbktpbmRcblxubW9kdWxlLmV4cG9ydHMgPSBCYXNlXG4iXX0=
