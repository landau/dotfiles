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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvYmFzZS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0E7QUFBQSxNQUFBLDZMQUFBO0lBQUE7Ozs7RUFBQSxNQUFBLEdBQVM7O0VBQ1QsS0FBQSxHQUFRLFNBQUE7NEJBQ04sU0FBQSxTQUFVLE9BQUEsQ0FBUSxpQkFBUjtFQURKOztFQUdSLFFBQUEsR0FBVyxPQUFBLENBQVEsVUFBUjs7RUFDWCxRQUFBLEdBQVcsT0FBQSxDQUFRLFlBQVI7O0VBRVgsTUFNSSxFQU5KLEVBQ0UsYUFERixFQUVFLGFBRkYsRUFHRSxjQUhGLEVBSUUsbUJBSkYsRUFLRTs7RUFHRixnQkFBQSxHQUFtQjs7RUFDbkIsZ0JBQUEsR0FBbUI7O0VBRW5CLG9CQUFBLEdBQXVCLFNBQUMsUUFBRDtBQUNyQixRQUFBO0lBQUEsZ0JBQUEsR0FBbUI7SUFDbkIsTUFBQSxHQUFTLE9BQUEsQ0FBUSxRQUFSO0lBQ1QsZ0JBQUEsR0FBbUI7SUFDbkIsZ0JBQWdCLENBQUMsSUFBakIsQ0FBc0IsUUFBdEI7V0FDQTtFQUxxQjs7RUFPdkIscUJBQUEsR0FBd0I7O0VBRXhCLGVBQUEsR0FBa0IsQ0FDaEIsbUJBRGdCLEVBRWhCLG9CQUZnQixFQUdoQixtQkFIZ0IsRUFJaEIsb0JBSmdCLEVBT2hCLGdCQVBnQixFQU9FLGtCQVBGLEVBUWQsb0JBUmMsRUFRUSxzQkFSUixFQVNkLG1CQVRjLEVBU08scUJBVFAsRUFVZCx1QkFWYyxFQVVXLHlCQVZYLEVBWWQsc0JBWmMsRUFZVSx3QkFaVixFQWFkLHFCQWJjLEVBYVMsdUJBYlQsRUFjaEIsc0JBZGdCLEVBZWhCLDBCQWZnQixFQWlCaEIsMEJBakJnQixFQW1CaEIsb0JBbkJnQixFQW9CaEIsbUJBcEJnQixFQXFCaEIsMkJBckJnQixFQXNCaEIsc0JBdEJnQixFQXVCaEIscUJBdkJnQixFQXlCaEIsdUJB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QyxDQUFBLHFCQUFELEdBQXdCLFNBQUMsT0FBRDtBQUN0QixVQUFBO01BQUEsQ0FBQSxHQUFJLEtBQUEsQ0FBQTtNQUNKLElBQUEsR0FBTyxDQUFDLENBQUMsVUFBRixDQUFhLENBQUMsQ0FBQyxRQUFGLENBQVcsT0FBWCxDQUFiO01BQ1AsSUFBRyxJQUFBLElBQVEsYUFBWDtlQUNFLGFBQWMsQ0FBQSxJQUFBLENBQUssQ0FBQyxjQUR0Qjs7SUFIc0I7Ozs7OztFQU0xQixNQUFNLENBQUMsT0FBUCxHQUFpQjtBQWhZakIiLCJzb3VyY2VzQ29udGVudCI6WyIjIFRvIGF2b2lkIGxvYWRpbmcgdW5kZXJzY29yZS1wbHVzIGFuZCBkZXBlbmRpbmcgdW5kZXJzY29yZSBvbiBzdGFydHVwXG5fX3BsdXMgPSBudWxsXG5fcGx1cyA9IC0+XG4gIF9fcGx1cyA/PSByZXF1aXJlICd1bmRlcnNjb3JlLXBsdXMnXG5cbkRlbGVnYXRvID0gcmVxdWlyZSAnZGVsZWdhdG8nXG5zZXR0aW5ncyA9IHJlcXVpcmUgJy4vc2V0dGluZ3MnXG5cbltcbiAgQ1NPTlxuICBwYXRoXG4gIElucHV0XG4gIHNlbGVjdExpc3RcbiAgZ2V0RWRpdG9yU3RhdGUgICMgc2V0IGJ5IEJhc2UuaW5pdCgpXG5dID0gW10gIyBzZXQgbnVsbFxuXG5WTVBfTE9BRElOR19GSUxFID0gbnVsbFxuVk1QX0xPQURFRF9GSUxFUyA9IFtdXG5cbmxvYWRWbXBPcGVyYXRpb25GaWxlID0gKGZpbGVuYW1lKSAtPlxuICBWTVBfTE9BRElOR19GSUxFID0gZmlsZW5hbWVcbiAgbG9hZGVkID0gcmVxdWlyZShmaWxlbmFtZSlcbiAgVk1QX0xPQURJTkdfRklMRSA9IG51bGxcbiAgVk1QX0xPQURFRF9GSUxFUy5wdXNoKGZpbGVuYW1lKVxuICBsb2FkZWRcblxuT3BlcmF0aW9uQWJvcnRlZEVycm9yID0gbnVsbFxuXG52aW1TdGF0ZU1ldGhvZHMgPSBbXG4gIFwib25EaWRDaGFuZ2VTZWFyY2hcIlxuICBcIm9uRGlkQ29uZmlybVNlYXJjaFwiXG4gIFwib25EaWRDYW5jZWxTZWFyY2hcIlxuICBcIm9uRGlkQ29tbWFuZFNlYXJjaFwiXG5cbiAgIyBMaWZlIGN5Y2xlIG9mIG9wZXJhdGlvblN0YWNrXG4gIFwib25EaWRTZXRUYXJnZXRcIiwgXCJlbWl0RGlkU2V0VGFyZ2V0XCJcbiAgICBcIm9uV2lsbFNlbGVjdFRhcmdldFwiLCBcImVtaXRXaWxsU2VsZWN0VGFyZ2V0XCJcbiAgICBcIm9uRGlkU2VsZWN0VGFyZ2V0XCIsIFwiZW1pdERpZFNlbGVjdFRhcmdldFwiXG4gICAgXCJvbkRpZEZhaWxTZWxlY3RUYXJnZXRcIiwgXCJlbWl0RGlkRmFpbFNlbGVjdFRhcmdldFwiXG5cbiAgICBcIm9uV2lsbEZpbmlzaE11dGF0aW9uXCIsIFwiZW1pdFdpbGxGaW5pc2hNdXRhdGlvblwiXG4gICAgXCJvbkRpZEZpbmlzaE11dGF0aW9uXCIsIFwiZW1pdERpZEZpbmlzaE11dGF0aW9uXCJcbiAgXCJvbkRpZEZpbmlzaE9wZXJhdGlvblwiXG4gIFwib25EaWRSZXNldE9wZXJhdGlvblN0YWNrXCJcblxuICBcIm9uRGlkU2V0T3BlcmF0b3JNb2RpZmllclwiXG5cbiAgXCJvbldpbGxBY3RpdmF0ZU1vZGVcIlxuICBcIm9uRGlkQWN0aXZhdGVNb2RlXCJcbiAgXCJwcmVlbXB0V2lsbERlYWN0aXZhdGVNb2RlXCJcbiAgXCJvbldpbGxEZWFjdGl2YXRlTW9kZVwiXG4gIFwib25EaWREZWFjdGl2YXRlTW9kZVwiXG5cbiAgXCJvbkRpZENhbmNlbFNlbGVjdExpc3RcIlxuICBcInN1YnNjcmliZVwiXG4gIFwiaXNNb2RlXCJcbiAgXCJnZXRCbG9ja3dpc2VTZWxlY3Rpb25zXCJcbiAgXCJnZXRMYXN0QmxvY2t3aXNlU2VsZWN0aW9uXCJcbiAgXCJhZGRUb0NsYXNzTGlzdFwiXG4gIFwiZ2V0Q29uZmlnXCJcbl1cblxuY2xhc3MgQmFzZVxuICBEZWxlZ2F0by5pbmNsdWRlSW50byh0aGlzKVxuICBAZGVsZWdhdGVzTWV0aG9kcyh2aW1TdGF0ZU1ldGhvZHMuLi4sIHRvUHJvcGVydHk6ICd2aW1TdGF0ZScpXG4gIEBkZWxlZ2F0ZXNQcm9wZXJ0eSgnbW9kZScsICdzdWJtb2RlJywgJ3N3cmFwJywgJ3V0aWxzJywgdG9Qcm9wZXJ0eTogJ3ZpbVN0YXRlJylcblxuICBjb25zdHJ1Y3RvcjogKEB2aW1TdGF0ZSwgcHJvcGVydGllcz1udWxsKSAtPlxuICAgIHtAZWRpdG9yLCBAZWRpdG9yRWxlbWVudCwgQGdsb2JhbFN0YXRlLCBAc3dyYXB9ID0gQHZpbVN0YXRlXG4gICAgQG5hbWUgPSBAY29uc3RydWN0b3IubmFtZVxuICAgIE9iamVjdC5hc3NpZ24odGhpcywgcHJvcGVydGllcykgaWYgcHJvcGVydGllcz9cblxuICAjIFRvIG92ZXJyaWRlXG4gIGluaXRpYWxpemU6IC0+XG5cbiAgIyBPcGVyYXRpb24gcHJvY2Vzc29yIGV4ZWN1dGUgb25seSB3aGVuIGlzQ29tcGxldGUoKSByZXR1cm4gdHJ1ZS5cbiAgIyBJZiBmYWxzZSwgb3BlcmF0aW9uIHByb2Nlc3NvciBwb3N0cG9uZSBpdHMgZXhlY3V0aW9uLlxuICBpc0NvbXBsZXRlOiAtPlxuICAgIGlmIEByZXF1aXJlSW5wdXQgYW5kIG5vdCBAaW5wdXQ/XG4gICAgICBmYWxzZVxuICAgIGVsc2UgaWYgQHJlcXVpcmVUYXJnZXRcbiAgICAgICMgV2hlbiB0aGlzIGZ1bmN0aW9uIGlzIGNhbGxlZCBpbiBCYXNlOjpjb25zdHJ1Y3RvclxuICAgICAgIyB0YWdlcnQgaXMgc3RpbGwgc3RyaW5nIGxpa2UgYE1vdmVUb1JpZ2h0YCwgaW4gdGhpcyBjYXNlIGlzQ29tcGxldGVcbiAgICAgICMgaXMgbm90IGF2YWlsYWJsZS5cbiAgICAgIEB0YXJnZXQ/LmlzQ29tcGxldGU/KClcbiAgICBlbHNlXG4gICAgICB0cnVlXG5cbiAgcmVxdWlyZVRhcmdldDogZmFsc2VcbiAgcmVxdWlyZUlucHV0OiBmYWxzZVxuICByZWNvcmRhYmxlOiBmYWxzZVxuICByZXBlYXRlZDogZmFsc2VcbiAgdGFyZ2V0OiBudWxsICMgU2V0IGluIE9wZXJhdG9yXG4gIG9wZXJhdG9yOiBudWxsICMgU2V0IGluIG9wZXJhdG9yJ3MgdGFyZ2V0KCBNb3Rpb24gb3IgVGV4dE9iamVjdCApXG4gIGlzQXNUYXJnZXRFeGNlcHRTZWxlY3Q6IC0+XG4gICAgQG9wZXJhdG9yPyBhbmQgbm90IEBvcGVyYXRvci5pbnN0YW5jZW9mKCdTZWxlY3QnKVxuXG4gIGFib3J0OiAtPlxuICAgIE9wZXJhdGlvbkFib3J0ZWRFcnJvciA/PSByZXF1aXJlICcuL2Vycm9ycydcbiAgICB0aHJvdyBuZXcgT3BlcmF0aW9uQWJvcnRlZEVycm9yKCdhYm9ydGVkJylcblxuICAjIENvdW50XG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBjb3VudDogbnVsbFxuICBkZWZhdWx0Q291bnQ6IDFcbiAgZ2V0Q291bnQ6IChvZmZzZXQ9MCkgLT5cbiAgICBAY291bnQgPz0gQHZpbVN0YXRlLmdldENvdW50KCkgPyBAZGVmYXVsdENvdW50XG4gICAgQGNvdW50ICsgb2Zmc2V0XG5cbiAgcmVzZXRDb3VudDogLT5cbiAgICBAY291bnQgPSBudWxsXG5cbiAgaXNEZWZhdWx0Q291bnQ6IC0+XG4gICAgQGNvdW50IGlzIEBkZWZhdWx0Q291bnRcblxuICAjIE1pc2NcbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIGNvdW50VGltZXM6IChsYXN0LCBmbikgLT5cbiAgICByZXR1cm4gaWYgbGFzdCA8IDFcblxuICAgIHN0b3BwZWQgPSBmYWxzZVxuICAgIHN0b3AgPSAtPiBzdG9wcGVkID0gdHJ1ZVxuICAgIGZvciBjb3VudCBpbiBbMS4ubGFzdF1cbiAgICAgIGlzRmluYWwgPSBjb3VudCBpcyBsYXN0XG4gICAgICBmbih7Y291bnQsIGlzRmluYWwsIHN0b3B9KVxuICAgICAgYnJlYWsgaWYgc3RvcHBlZFxuXG4gIGFjdGl2YXRlTW9kZTogKG1vZGUsIHN1Ym1vZGUpIC0+XG4gICAgQG9uRGlkRmluaXNoT3BlcmF0aW9uID0+XG4gICAgICBAdmltU3RhdGUuYWN0aXZhdGUobW9kZSwgc3VibW9kZSlcblxuICBhY3RpdmF0ZU1vZGVJZk5lY2Vzc2FyeTogKG1vZGUsIHN1Ym1vZGUpIC0+XG4gICAgdW5sZXNzIEB2aW1TdGF0ZS5pc01vZGUobW9kZSwgc3VibW9kZSlcbiAgICAgIEBhY3RpdmF0ZU1vZGUobW9kZSwgc3VibW9kZSlcblxuICBuZXc6IChuYW1lLCBwcm9wZXJ0aWVzKSAtPlxuICAgIGtsYXNzID0gQmFzZS5nZXRDbGFzcyhuYW1lKVxuICAgIG5ldyBrbGFzcyhAdmltU3RhdGUsIHByb3BlcnRpZXMpXG5cbiAgbmV3SW5wdXRVSTogLT5cbiAgICBJbnB1dCA/PSByZXF1aXJlICcuL2lucHV0J1xuICAgIG5ldyBJbnB1dChAdmltU3RhdGUpXG5cbiAgIyBGSVhNRTogVGhpcyBpcyB1c2VkIHRvIGNsb25lIE1vdGlvbjo6U2VhcmNoIHRvIHN1cHBvcnQgYG5gIGFuZCBgTmBcbiAgIyBCdXQgbWFudWFsIHJlc2V0aW5nIGFuZCBvdmVycmlkaW5nIHByb3BlcnR5IGlzIGJ1ZyBwcm9uZS5cbiAgIyBTaG91bGQgZXh0cmFjdCBhcyBzZWFyY2ggc3BlYyBvYmplY3QgYW5kIHVzZSBpdCBieVxuICAjIGNyZWF0aW5nIGNsZWFuIGluc3RhbmNlIG9mIFNlYXJjaC5cbiAgY2xvbmU6ICh2aW1TdGF0ZSkgLT5cbiAgICBwcm9wZXJ0aWVzID0ge31cbiAgICBleGNsdWRlUHJvcGVydGllcyA9IFsnZWRpdG9yJywgJ2VkaXRvckVsZW1lbnQnLCAnZ2xvYmFsU3RhdGUnLCAndmltU3RhdGUnLCAnb3BlcmF0b3InXVxuICAgIGZvciBvd24ga2V5LCB2YWx1ZSBvZiB0aGlzIHdoZW4ga2V5IG5vdCBpbiBleGNsdWRlUHJvcGVydGllc1xuICAgICAgcHJvcGVydGllc1trZXldID0gdmFsdWVcbiAgICBrbGFzcyA9IHRoaXMuY29uc3RydWN0b3JcbiAgICBuZXcga2xhc3ModmltU3RhdGUsIHByb3BlcnRpZXMpXG5cbiAgY2FuY2VsT3BlcmF0aW9uOiAtPlxuICAgIEB2aW1TdGF0ZS5vcGVyYXRpb25TdGFjay5jYW5jZWwoKVxuXG4gIHByb2Nlc3NPcGVyYXRpb246IC0+XG4gICAgQHZpbVN0YXRlLm9wZXJhdGlvblN0YWNrLnByb2Nlc3MoKVxuXG4gIGZvY3VzU2VsZWN0TGlzdDogKG9wdGlvbnM9e30pIC0+XG4gICAgQG9uRGlkQ2FuY2VsU2VsZWN0TGlzdCA9PlxuICAgICAgQGNhbmNlbE9wZXJhdGlvbigpXG4gICAgc2VsZWN0TGlzdCA/PSByZXF1aXJlICcuL3NlbGVjdC1saXN0J1xuICAgIHNlbGVjdExpc3Quc2hvdyhAdmltU3RhdGUsIG9wdGlvbnMpXG5cbiAgaW5wdXQ6IG51bGxcbiAgZm9jdXNJbnB1dDogKG9wdGlvbnMpIC0+XG4gICAgaW5wdXRVSSA9IEBuZXdJbnB1dFVJKClcbiAgICBpbnB1dFVJLm9uRGlkQ29uZmlybSAoaW5wdXQpID0+XG4gICAgICBAaW5wdXQgPSBpbnB1dFxuICAgICAgQHByb2Nlc3NPcGVyYXRpb24oKVxuXG4gICAgaWYgb3B0aW9ucz8uY2hhcnNNYXggPiAxXG4gICAgICBpbnB1dFVJLm9uRGlkQ2hhbmdlIChpbnB1dCkgPT5cbiAgICAgICAgQHZpbVN0YXRlLmhvdmVyLnNldChpbnB1dClcblxuICAgIGlucHV0VUkub25EaWRDYW5jZWwoQGNhbmNlbE9wZXJhdGlvbi5iaW5kKHRoaXMpKVxuICAgIGlucHV0VUkuZm9jdXMob3B0aW9ucylcblxuICBnZXRWaW1Fb2ZCdWZmZXJQb3NpdGlvbjogLT5cbiAgICBAdXRpbHMuZ2V0VmltRW9mQnVmZmVyUG9zaXRpb24oQGVkaXRvcilcblxuICBnZXRWaW1MYXN0QnVmZmVyUm93OiAtPlxuICAgIEB1dGlscy5nZXRWaW1MYXN0QnVmZmVyUm93KEBlZGl0b3IpXG5cbiAgZ2V0VmltTGFzdFNjcmVlblJvdzogLT5cbiAgICBAdXRpbHMuZ2V0VmltTGFzdFNjcmVlblJvdyhAZWRpdG9yKVxuXG4gIGdldFdvcmRCdWZmZXJSYW5nZUFuZEtpbmRBdEJ1ZmZlclBvc2l0aW9uOiAocG9pbnQsIG9wdGlvbnMpIC0+XG4gICAgQHV0aWxzLmdldFdvcmRCdWZmZXJSYW5nZUFuZEtpbmRBdEJ1ZmZlclBvc2l0aW9uKEBlZGl0b3IsIHBvaW50LCBvcHRpb25zKVxuXG4gIGdldEZpcnN0Q2hhcmFjdGVyUG9zaXRpb25Gb3JCdWZmZXJSb3c6IChyb3cpIC0+XG4gICAgQHV0aWxzLmdldEZpcnN0Q2hhcmFjdGVyUG9zaXRpb25Gb3JCdWZmZXJSb3coQGVkaXRvciwgcm93KVxuXG4gIGdldEJ1ZmZlclJhbmdlRm9yUm93UmFuZ2U6IChyb3dSYW5nZSkgLT5cbiAgICBAdXRpbHMuZ2V0QnVmZmVyUmFuZ2VGb3JSb3dSYW5nZShAZWRpdG9yLCByb3dSYW5nZSlcblxuICBnZXRJbmRlbnRMZXZlbEZvckJ1ZmZlclJvdzogKHJvdykgLT5cbiAgICBAdXRpbHMuZ2V0SW5kZW50TGV2ZWxGb3JCdWZmZXJSb3coQGVkaXRvciwgcm93KVxuXG4gIHNjYW5Gb3J3YXJkOiAoYXJncy4uLikgLT5cbiAgICBAdXRpbHMuc2NhbkVkaXRvckluRGlyZWN0aW9uKEBlZGl0b3IsICdmb3J3YXJkJywgYXJncy4uLilcblxuICBzY2FuQmFja3dhcmQ6IChhcmdzLi4uKSAtPlxuICAgIEB1dGlscy5zY2FuRWRpdG9ySW5EaXJlY3Rpb24oQGVkaXRvciwgJ2JhY2t3YXJkJywgYXJncy4uLilcblxuICBnZXRGb2xkRW5kUm93Rm9yUm93OiAoYXJncy4uLikgLT5cbiAgICBAdXRpbHMuZ2V0Rm9sZEVuZFJvd0ZvclJvdyhAZWRpdG9yLCBhcmdzLi4uKVxuXG4gIGluc3RhbmNlb2Y6IChrbGFzc05hbWUpIC0+XG4gICAgdGhpcyBpbnN0YW5jZW9mIEJhc2UuZ2V0Q2xhc3Moa2xhc3NOYW1lKVxuXG4gIGlzOiAoa2xhc3NOYW1lKSAtPlxuICAgIHRoaXMuY29uc3RydWN0b3IgaXMgQmFzZS5nZXRDbGFzcyhrbGFzc05hbWUpXG5cbiAgaXNPcGVyYXRvcjogLT5cbiAgICBAY29uc3RydWN0b3Iub3BlcmF0aW9uS2luZCBpcyAnb3BlcmF0b3InXG5cbiAgaXNNb3Rpb246IC0+XG4gICAgQGNvbnN0cnVjdG9yLm9wZXJhdGlvbktpbmQgaXMgJ21vdGlvbidcblxuICBpc1RleHRPYmplY3Q6IC0+XG4gICAgQGNvbnN0cnVjdG9yLm9wZXJhdGlvbktpbmQgaXMgJ3RleHQtb2JqZWN0J1xuXG4gIGdldEN1cnNvckJ1ZmZlclBvc2l0aW9uOiAtPlxuICAgIGlmIEBtb2RlIGlzICd2aXN1YWwnXG4gICAgICBAZ2V0Q3Vyc29yUG9zaXRpb25Gb3JTZWxlY3Rpb24oQGVkaXRvci5nZXRMYXN0U2VsZWN0aW9uKCkpXG4gICAgZWxzZVxuICAgICAgQGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpXG5cbiAgZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb25zOiAtPlxuICAgIGlmIEBtb2RlIGlzICd2aXN1YWwnXG4gICAgICBAZWRpdG9yLmdldFNlbGVjdGlvbnMoKS5tYXAoQGdldEN1cnNvclBvc2l0aW9uRm9yU2VsZWN0aW9uLmJpbmQodGhpcykpXG4gICAgZWxzZVxuICAgICAgQGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbnMoKVxuXG4gIGdldEJ1ZmZlclBvc2l0aW9uRm9yQ3Vyc29yOiAoY3Vyc29yKSAtPlxuICAgIGlmIEBtb2RlIGlzICd2aXN1YWwnXG4gICAgICBAZ2V0Q3Vyc29yUG9zaXRpb25Gb3JTZWxlY3Rpb24oY3Vyc29yLnNlbGVjdGlvbilcbiAgICBlbHNlXG4gICAgICBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuXG4gIGdldEN1cnNvclBvc2l0aW9uRm9yU2VsZWN0aW9uOiAoc2VsZWN0aW9uKSAtPlxuICAgIEBzd3JhcChzZWxlY3Rpb24pLmdldEJ1ZmZlclBvc2l0aW9uRm9yKCdoZWFkJywgZnJvbTogWydwcm9wZXJ0eScsICdzZWxlY3Rpb24nXSlcblxuICB0b1N0cmluZzogLT5cbiAgICBzdHIgPSBAbmFtZVxuICAgIGlmIEB0YXJnZXQ/XG4gICAgICBzdHIgKz0gXCIsIHRhcmdldD0je0B0YXJnZXQubmFtZX0sIHRhcmdldC53aXNlPSN7QHRhcmdldC53aXNlfSBcIlxuICAgIGVsc2UgaWYgQG9wZXJhdG9yP1xuICAgICAgc3RyICs9IFwiLCB3aXNlPSN7QHdpc2V9ICwgb3BlcmF0b3I9I3tAb3BlcmF0b3IubmFtZX1cIlxuICAgIGVsc2VcbiAgICAgIHN0clxuXG4gICMgQ2xhc3MgbWV0aG9kc1xuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgQHdyaXRlQ29tbWFuZFRhYmxlT25EaXNrOiAtPlxuICAgIGNvbW1hbmRUYWJsZSA9IEBnZW5lcmF0ZUNvbW1hbmRUYWJsZUJ5RWFnZXJMb2FkKClcbiAgICBfID0gX3BsdXMoKVxuICAgIGlmIF8uaXNFcXVhbChAY29tbWFuZFRhYmxlLCBjb21tYW5kVGFibGUpXG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkSW5mbyhcIk5vIGNoYW5nZSBjb21tYW5kVGFibGVcIiwgZGlzbWlzc2FibGU6IHRydWUpXG4gICAgICByZXR1cm5cblxuICAgIENTT04gPz0gcmVxdWlyZSAnc2Vhc29uJ1xuICAgIHBhdGggPz0gcmVxdWlyZSgncGF0aCcpXG5cbiAgICBsb2FkYWJsZUNTT05UZXh0ID0gXCJcIlwiXG4gICAgICAjIFRoaXMgZmlsZSBpcyBhdXRvIGdlbmVyYXRlZCBieSBgdmltLW1vZGUtcGx1czp3cml0ZS1jb21tYW5kLXRhYmxlLW9uLWRpc2tgIGNvbW1hbmQuXG4gICAgICAjIERPTlQgZWRpdCBtYW51YWxseS5cbiAgICAgIG1vZHVsZS5leHBvcnRzID1cbiAgICAgICN7Q1NPTi5zdHJpbmdpZnkoY29tbWFuZFRhYmxlKX1cXG5cbiAgICAgIFwiXCJcIlxuICAgIGNvbW1hbmRUYWJsZVBhdGggPSBwYXRoLmpvaW4oX19kaXJuYW1lLCBcImNvbW1hbmQtdGFibGUuY29mZmVlXCIpXG4gICAgYXRvbS53b3Jrc3BhY2Uub3Blbihjb21tYW5kVGFibGVQYXRoKS50aGVuIChlZGl0b3IpIC0+XG4gICAgICBlZGl0b3Iuc2V0VGV4dChsb2FkYWJsZUNTT05UZXh0KVxuICAgICAgZWRpdG9yLnNhdmUoKVxuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEluZm8oXCJVcGRhdGVkIGNvbW1hbmRUYWJsZVwiLCBkaXNtaXNzYWJsZTogdHJ1ZSlcblxuICBAZ2VuZXJhdGVDb21tYW5kVGFibGVCeUVhZ2VyTG9hZDogLT5cbiAgICAjIE5PVEU6IGNoYW5naW5nIG9yZGVyIGFmZmVjdHMgb3V0cHV0IG9mIGxpYi9jb21tYW5kLXRhYmxlLmNvZmZlZVxuICAgIGZpbGVzVG9Mb2FkID0gW1xuICAgICAgJy4vb3BlcmF0b3InLCAnLi9vcGVyYXRvci1pbnNlcnQnLCAnLi9vcGVyYXRvci10cmFuc2Zvcm0tc3RyaW5nJyxcbiAgICAgICcuL21vdGlvbicsICcuL21vdGlvbi1zZWFyY2gnLCAnLi90ZXh0LW9iamVjdCcsICcuL21pc2MtY29tbWFuZCdcbiAgICBdXG4gICAgZmlsZXNUb0xvYWQuZm9yRWFjaChsb2FkVm1wT3BlcmF0aW9uRmlsZSlcbiAgICBfID0gX3BsdXMoKVxuICAgIGtsYXNzZXMgPSBfLnZhbHVlcyhAZ2V0Q2xhc3NSZWdpc3RyeSgpKVxuICAgIGtsYXNzZXNHcm91cGVkQnlGaWxlID0gXy5ncm91cEJ5KGtsYXNzZXMsIChrbGFzcykgLT4ga2xhc3MuVk1QX0xPQURJTkdfRklMRSlcblxuICAgIGNvbW1hbmRUYWJsZSA9IHt9XG4gICAgZm9yIGZpbGUgaW4gZmlsZXNUb0xvYWRcbiAgICAgIGZvciBrbGFzcyBpbiBrbGFzc2VzR3JvdXBlZEJ5RmlsZVtmaWxlXVxuICAgICAgICBjb21tYW5kVGFibGVba2xhc3MubmFtZV0gPSBrbGFzcy5nZXRTcGVjKClcbiAgICBjb21tYW5kVGFibGVcblxuICBAY29tbWFuZFRhYmxlOiBudWxsXG4gIEBpbml0OiAoX2dldEVkaXRvclN0YXRlKSAtPlxuICAgIGdldEVkaXRvclN0YXRlID0gX2dldEVkaXRvclN0YXRlXG4gICAgQGNvbW1hbmRUYWJsZSA9IHJlcXVpcmUoJy4vY29tbWFuZC10YWJsZScpXG4gICAgc3Vic2NyaXB0aW9ucyA9IFtdXG4gICAgZm9yIG5hbWUsIHNwZWMgb2YgQGNvbW1hbmRUYWJsZSB3aGVuIHNwZWMuY29tbWFuZE5hbWU/XG4gICAgICBzdWJzY3JpcHRpb25zLnB1c2goQHJlZ2lzdGVyQ29tbWFuZEZyb21TcGVjKG5hbWUsIHNwZWMpKVxuICAgIHJldHVybiBzdWJzY3JpcHRpb25zXG5cbiAgY2xhc3NSZWdpc3RyeSA9IHtCYXNlfVxuICBAZXh0ZW5kOiAoQGNvbW1hbmQ9dHJ1ZSkgLT5cbiAgICBAVk1QX0xPQURJTkdfRklMRSA9IFZNUF9MT0FESU5HX0ZJTEVcbiAgICBpZiBAbmFtZSBvZiBjbGFzc1JlZ2lzdHJ5XG4gICAgICBjb25zb2xlLndhcm4oXCJEdXBsaWNhdGUgY29uc3RydWN0b3IgI3tAbmFtZX1cIilcbiAgICBjbGFzc1JlZ2lzdHJ5W0BuYW1lXSA9IHRoaXNcblxuICBAZ2V0U3BlYzogLT5cbiAgICBpZiBAaXNDb21tYW5kKClcbiAgICAgIGZpbGU6IEBWTVBfTE9BRElOR19GSUxFXG4gICAgICBjb21tYW5kTmFtZTogQGdldENvbW1hbmROYW1lKClcbiAgICAgIGNvbW1hbmRTY29wZTogQGdldENvbW1hbmRTY29wZSgpXG4gICAgZWxzZVxuICAgICAgZmlsZTogQFZNUF9MT0FESU5HX0ZJTEVcblxuICBAZ2V0Q2xhc3M6IChuYW1lKSAtPlxuICAgIHJldHVybiBrbGFzcyBpZiAoa2xhc3MgPSBjbGFzc1JlZ2lzdHJ5W25hbWVdKVxuXG4gICAgZmlsZVRvTG9hZCA9IEBjb21tYW5kVGFibGVbbmFtZV0uZmlsZVxuICAgIGlmIGZpbGVUb0xvYWQgbm90IGluIFZNUF9MT0FERURfRklMRVNcbiAgICAgIGlmIGF0b20uaW5EZXZNb2RlKCkgYW5kIHNldHRpbmdzLmdldCgnZGVidWcnKVxuICAgICAgICBjb25zb2xlLmxvZyBcImxhenktcmVxdWlyZTogI3tmaWxlVG9Mb2FkfSBmb3IgI3tuYW1lfVwiXG4gICAgICBsb2FkVm1wT3BlcmF0aW9uRmlsZShmaWxlVG9Mb2FkKVxuICAgICAgcmV0dXJuIGtsYXNzIGlmIChrbGFzcyA9IGNsYXNzUmVnaXN0cnlbbmFtZV0pXG5cbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJjbGFzcyAnI3tuYW1lfScgbm90IGZvdW5kXCIpXG5cbiAgQGdldENsYXNzUmVnaXN0cnk6IC0+XG4gICAgY2xhc3NSZWdpc3RyeVxuXG4gIEBpc0NvbW1hbmQ6IC0+XG4gICAgQGNvbW1hbmRcblxuICBAY29tbWFuZFByZWZpeDogJ3ZpbS1tb2RlLXBsdXMnXG4gIEBnZXRDb21tYW5kTmFtZTogLT5cbiAgICBAY29tbWFuZFByZWZpeCArICc6JyArIF9wbHVzKCkuZGFzaGVyaXplKEBuYW1lKVxuXG4gIEBnZXRDb21tYW5kTmFtZVdpdGhvdXRQcmVmaXg6IC0+XG4gICAgX3BsdXMoKS5kYXNoZXJpemUoQG5hbWUpXG5cbiAgQGNvbW1hbmRTY29wZTogJ2F0b20tdGV4dC1lZGl0b3InXG4gIEBnZXRDb21tYW5kU2NvcGU6IC0+XG4gICAgQGNvbW1hbmRTY29wZVxuXG4gIEBnZXREZXNjdGlwdGlvbjogLT5cbiAgICBpZiBAaGFzT3duUHJvcGVydHkoXCJkZXNjcmlwdGlvblwiKVxuICAgICAgQGRlc2NyaXB0aW9uXG4gICAgZWxzZVxuICAgICAgbnVsbFxuXG4gIEByZWdpc3RlckNvbW1hbmQ6IC0+XG4gICAga2xhc3MgPSB0aGlzXG4gICAgYXRvbS5jb21tYW5kcy5hZGQgQGdldENvbW1hbmRTY29wZSgpLCBAZ2V0Q29tbWFuZE5hbWUoKSwgKGV2ZW50KSAtPlxuICAgICAgdmltU3RhdGUgPSBnZXRFZGl0b3JTdGF0ZShAZ2V0TW9kZWwoKSkgPyBnZXRFZGl0b3JTdGF0ZShhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCkpXG4gICAgICBpZiB2aW1TdGF0ZT8gIyBQb3NzaWJseSB1bmRlZmluZWQgU2VlICM4NVxuICAgICAgICB2aW1TdGF0ZS5vcGVyYXRpb25TdGFjay5ydW4oa2xhc3MpXG4gICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuXG4gIEByZWdpc3RlckNvbW1hbmRGcm9tU3BlYzogKG5hbWUsIHNwZWMpIC0+XG4gICAge2NvbW1hbmRTY29wZSwgY29tbWFuZFByZWZpeCwgY29tbWFuZE5hbWUsIGdldENsYXNzfSA9IHNwZWNcbiAgICBjb21tYW5kU2NvcGUgPz0gJ2F0b20tdGV4dC1lZGl0b3InXG4gICAgY29tbWFuZE5hbWUgPz0gKGNvbW1hbmRQcmVmaXggPyAndmltLW1vZGUtcGx1cycpICsgJzonICsgX3BsdXMoKS5kYXNoZXJpemUobmFtZSlcbiAgICBhdG9tLmNvbW1hbmRzLmFkZCBjb21tYW5kU2NvcGUsIGNvbW1hbmROYW1lLCAoZXZlbnQpIC0+XG4gICAgICB2aW1TdGF0ZSA9IGdldEVkaXRvclN0YXRlKEBnZXRNb2RlbCgpKSA/IGdldEVkaXRvclN0YXRlKGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKSlcbiAgICAgIGlmIHZpbVN0YXRlPyAjIFBvc3NpYmx5IHVuZGVmaW5lZCBTZWUgIzg1XG4gICAgICAgIGlmIGdldENsYXNzP1xuICAgICAgICAgIHZpbVN0YXRlLm9wZXJhdGlvblN0YWNrLnJ1bihnZXRDbGFzcyhuYW1lKSlcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHZpbVN0YXRlLm9wZXJhdGlvblN0YWNrLnJ1bihuYW1lKVxuICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcblxuICAjIEZvciBkZW1vLW1vZGUgcGtnIGludGVncmF0aW9uXG4gIEBvcGVyYXRpb25LaW5kOiBudWxsXG4gIEBnZXRLaW5kRm9yQ29tbWFuZE5hbWU6IChjb21tYW5kKSAtPlxuICAgIF8gPSBfcGx1cygpXG4gICAgbmFtZSA9IF8uY2FwaXRhbGl6ZShfLmNhbWVsaXplKGNvbW1hbmQpKVxuICAgIGlmIG5hbWUgb2YgY2xhc3NSZWdpc3RyeVxuICAgICAgY2xhc3NSZWdpc3RyeVtuYW1lXS5vcGVyYXRpb25LaW5kXG5cbm1vZHVsZS5leHBvcnRzID0gQmFzZVxuIl19
