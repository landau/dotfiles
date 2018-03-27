(function() {
  var Base, CompositeDisposable, Delegato, Input, OperationAbortedError, _, getBufferRangeForRowRange, getEditorState, getFirstCharacterPositionForBufferRow, getIndentLevelForBufferRow, getVimEofBufferPosition, getVimLastBufferRow, getVimLastScreenRow, getWordBufferRangeAndKindAtBufferPosition, ref, scanEditorInDirection, selectList, swrap, vimStateMethods,
    slice = [].slice,
    hasProp = {}.hasOwnProperty,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  _ = require('underscore-plus');

  Delegato = require('delegato');

  CompositeDisposable = require('atom').CompositeDisposable;

  ref = require('./utils'), getVimEofBufferPosition = ref.getVimEofBufferPosition, getVimLastBufferRow = ref.getVimLastBufferRow, getVimLastScreenRow = ref.getVimLastScreenRow, getWordBufferRangeAndKindAtBufferPosition = ref.getWordBufferRangeAndKindAtBufferPosition, getFirstCharacterPositionForBufferRow = ref.getFirstCharacterPositionForBufferRow, getBufferRangeForRowRange = ref.getBufferRangeForRowRange, getIndentLevelForBufferRow = ref.getIndentLevelForBufferRow, scanEditorInDirection = ref.scanEditorInDirection;

  swrap = require('./selection-wrapper');

  Input = require('./input');

  selectList = null;

  getEditorState = null;

  OperationAbortedError = require('./errors').OperationAbortedError;

  vimStateMethods = ["assert", "assertWithException", "onDidChangeSearch", "onDidConfirmSearch", "onDidCancelSearch", "onDidCommandSearch", "onDidSetTarget", "emitDidSetTarget", "onWillSelectTarget", "emitWillSelectTarget", "onDidSelectTarget", "emitDidSelectTarget", "onDidFailSelectTarget", "emitDidFailSelectTarget", "onDidRestoreCursorPositions", "emitDidRestoreCursorPositions", "onWillFinishMutation", "emitWillFinishMutation", "onDidFinishMutation", "emitDidFinishMutation", "onDidFinishOperation", "onDidResetOperationStack", "onDidSetOperatorModifier", "onWillActivateMode", "onDidActivateMode", "preemptWillDeactivateMode", "onWillDeactivateMode", "onDidDeactivateMode", "onDidCancelSelectList", "subscribe", "isMode", "getBlockwiseSelections", "getLastBlockwiseSelection", "addToClassList", "getConfig"];

  Base = (function() {
    var registries;

    Delegato.includeInto(Base);

    Base.delegatesMethods.apply(Base, slice.call(vimStateMethods).concat([{
      toProperty: 'vimState'
    }]));

    Base.delegatesProperty('mode', 'submode', {
      toProperty: 'vimState'
    });

    function Base(vimState1, properties) {
      var ref1;
      this.vimState = vimState1;
      if (properties == null) {
        properties = null;
      }
      ref1 = this.vimState, this.editor = ref1.editor, this.editorElement = ref1.editorElement, this.globalState = ref1.globalState;
      if (properties != null) {
        _.extend(this, properties);
      }
    }

    Base.prototype.initialize = function() {};

    Base.prototype.isComplete = function() {
      var ref1;
      if (this.isRequireInput() && !this.hasInput()) {
        return false;
      } else if (this.isRequireTarget()) {
        return (ref1 = this.getTarget()) != null ? typeof ref1.isComplete === "function" ? ref1.isComplete() : void 0 : void 0;
      } else {
        return true;
      }
    };

    Base.prototype.target = null;

    Base.prototype.hasTarget = function() {
      return this.target != null;
    };

    Base.prototype.getTarget = function() {
      return this.target;
    };

    Base.prototype.requireTarget = false;

    Base.prototype.isRequireTarget = function() {
      return this.requireTarget;
    };

    Base.prototype.requireInput = false;

    Base.prototype.isRequireInput = function() {
      return this.requireInput;
    };

    Base.prototype.recordable = false;

    Base.prototype.isRecordable = function() {
      return this.recordable;
    };

    Base.prototype.repeated = false;

    Base.prototype.isRepeated = function() {
      return this.repeated;
    };

    Base.prototype.setRepeated = function() {
      return this.repeated = true;
    };

    Base.prototype.operator = null;

    Base.prototype.getOperator = function() {
      return this.operator;
    };

    Base.prototype.setOperator = function(operator) {
      this.operator = operator;
      return this.operator;
    };

    Base.prototype.isAsTargetExceptSelect = function() {
      return (this.operator != null) && !this.operator["instanceof"]('Select');
    };

    Base.prototype.abort = function() {
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

    Base.prototype.hasInput = function() {
      return this.input != null;
    };

    Base.prototype.getInput = function() {
      return this.input;
    };

    Base.prototype.focusInput = function(charsMax) {
      var inputUI;
      inputUI = this.newInputUI();
      inputUI.onDidConfirm((function(_this) {
        return function(input1) {
          _this.input = input1;
          return _this.processOperation();
        };
      })(this));
      if (charsMax > 1) {
        inputUI.onDidChange((function(_this) {
          return function(input) {
            return _this.vimState.hover.set(input);
          };
        })(this));
      }
      inputUI.onDidCancel(this.cancelOperation.bind(this));
      return inputUI.focus(charsMax);
    };

    Base.prototype.getVimEofBufferPosition = function() {
      return getVimEofBufferPosition(this.editor);
    };

    Base.prototype.getVimLastBufferRow = function() {
      return getVimLastBufferRow(this.editor);
    };

    Base.prototype.getVimLastScreenRow = function() {
      return getVimLastScreenRow(this.editor);
    };

    Base.prototype.getWordBufferRangeAndKindAtBufferPosition = function(point, options) {
      return getWordBufferRangeAndKindAtBufferPosition(this.editor, point, options);
    };

    Base.prototype.getFirstCharacterPositionForBufferRow = function(row) {
      return getFirstCharacterPositionForBufferRow(this.editor, row);
    };

    Base.prototype.getBufferRangeForRowRange = function(rowRange) {
      return getBufferRangeForRowRange(this.editor, rowRange);
    };

    Base.prototype.getIndentLevelForBufferRow = function(row) {
      return getIndentLevelForBufferRow(this.editor, row);
    };

    Base.prototype.scanForward = function() {
      var args;
      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      return scanEditorInDirection.apply(null, [this.editor, 'forward'].concat(slice.call(args)));
    };

    Base.prototype.scanBackward = function() {
      var args;
      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      return scanEditorInDirection.apply(null, [this.editor, 'backward'].concat(slice.call(args)));
    };

    Base.prototype["instanceof"] = function(klassName) {
      return this instanceof Base.getClass(klassName);
    };

    Base.prototype.is = function(klassName) {
      return this.constructor === Base.getClass(klassName);
    };

    Base.prototype.isOperator = function() {
      return this["instanceof"]('Operator');
    };

    Base.prototype.isMotion = function() {
      return this["instanceof"]('Motion');
    };

    Base.prototype.isTextObject = function() {
      return this["instanceof"]('TextObject');
    };

    Base.prototype.getName = function() {
      return this.constructor.name;
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
      return swrap(selection).getBufferPositionFor('head', {
        from: ['property', 'selection']
      });
    };

    Base.prototype.toString = function() {
      var str;
      str = this.getName();
      if (this.hasTarget()) {
        return str += ", target=" + (this.target.getName()) + ", target.wise=" + this.target.wise + " ";
      } else if (this.operator != null) {
        return str += ", wise=" + this.wise + " , operator=" + (this.operator.getName());
      } else {
        return str;
      }
    };

    Base.init = function(service) {
      var __, klass, ref1;
      getEditorState = service.getEditorState;
      this.subscriptions = new CompositeDisposable();
      ['./operator', './operator-insert', './operator-transform-string', './motion', './motion-search', './text-object', './insert-mode', './misc-command'].forEach(require);
      ref1 = this.getRegistries();
      for (__ in ref1) {
        klass = ref1[__];
        if (klass.isCommand()) {
          this.subscriptions.add(klass.registerCommand());
        }
      }
      return this.subscriptions;
    };

    Base.reset = function() {
      var __, klass, ref1, results;
      this.subscriptions.dispose();
      this.subscriptions = new CompositeDisposable();
      ref1 = this.getRegistries();
      results = [];
      for (__ in ref1) {
        klass = ref1[__];
        if (klass.isCommand()) {
          results.push(this.subscriptions.add(klass.registerCommand()));
        }
      }
      return results;
    };

    registries = {
      Base: Base
    };

    Base.extend = function(command) {
      this.command = command != null ? command : true;
      if ((this.name in registries) && (!this.suppressWarning)) {
        console.warn("Duplicate constructor " + this.name);
      }
      return registries[this.name] = this;
    };

    Base.getClass = function(name) {
      var klass;
      if ((klass = registries[name]) != null) {
        return klass;
      } else {
        throw new Error("class '" + name + "' not found");
      }
    };

    Base.getRegistries = function() {
      return registries;
    };

    Base.isCommand = function() {
      return this.command;
    };

    Base.commandPrefix = 'vim-mode-plus';

    Base.getCommandName = function() {
      return this.commandPrefix + ':' + _.dasherize(this.name);
    };

    Base.getCommandNameWithoutPrefix = function() {
      return _.dasherize(this.name);
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
          vimState._event = event;
          vimState.operationStack.run(klass);
        }
        return event.stopPropagation();
      });
    };

    return Base;

  })();

  module.exports = Base;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvYmFzZS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLGdXQUFBO0lBQUE7Ozs7RUFBQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSOztFQUNKLFFBQUEsR0FBVyxPQUFBLENBQVEsVUFBUjs7RUFDVixzQkFBdUIsT0FBQSxDQUFRLE1BQVI7O0VBQ3hCLE1BU0ksT0FBQSxDQUFRLFNBQVIsQ0FUSixFQUNFLHFEQURGLEVBRUUsNkNBRkYsRUFHRSw2Q0FIRixFQUlFLHlGQUpGLEVBS0UsaUZBTEYsRUFNRSx5REFORixFQU9FLDJEQVBGLEVBUUU7O0VBRUYsS0FBQSxHQUFRLE9BQUEsQ0FBUSxxQkFBUjs7RUFDUixLQUFBLEdBQVEsT0FBQSxDQUFRLFNBQVI7O0VBQ1IsVUFBQSxHQUFhOztFQUNiLGNBQUEsR0FBaUI7O0VBQ2hCLHdCQUF5QixPQUFBLENBQVEsVUFBUjs7RUFFMUIsZUFBQSxHQUFrQixDQUNoQixRQURnQixFQUVoQixxQkFGZ0IsRUFHaEIsbUJBSGdCLEVBSWhCLG9CQUpnQixFQUtoQixtQkFMZ0IsRUFNaEIsb0JBTmdCLEVBU2hCLGdCQVRnQixFQVVoQixrQkFWZ0IsRUFXWixvQkFYWSxFQVlaLHNCQVpZLEVBYVosbUJBYlksRUFjWixxQkFkWSxFQWdCWix1QkFoQlksRUFpQloseUJBakJZLEVBbUJaLDZCQW5CWSxFQW9CWiwrQkFwQlksRUFxQmQsc0JBckJjLEVBc0JkLHdCQXRCYyxFQXVCZCxxQkF2QmMsRUF3QmQsdUJBeEJjLEVBeUJoQixzQkF6QmdCLEVBMEJoQiwwQkExQmdCLEVBNEJoQiwwQkE1QmdCLEVBOEJoQixvQkE5QmdCLEVBK0JoQixtQkEvQmdCLEVBZ0NoQiwyQkFoQ2dCLEVBaUNoQixzQkFqQ2dCLEVBa0NoQixxQkFsQ2dCLEVBb0NoQix1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J1xuRGVsZWdhdG8gPSByZXF1aXJlICdkZWxlZ2F0bydcbntDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2F0b20nXG57XG4gIGdldFZpbUVvZkJ1ZmZlclBvc2l0aW9uXG4gIGdldFZpbUxhc3RCdWZmZXJSb3dcbiAgZ2V0VmltTGFzdFNjcmVlblJvd1xuICBnZXRXb3JkQnVmZmVyUmFuZ2VBbmRLaW5kQXRCdWZmZXJQb3NpdGlvblxuICBnZXRGaXJzdENoYXJhY3RlclBvc2l0aW9uRm9yQnVmZmVyUm93XG4gIGdldEJ1ZmZlclJhbmdlRm9yUm93UmFuZ2VcbiAgZ2V0SW5kZW50TGV2ZWxGb3JCdWZmZXJSb3dcbiAgc2NhbkVkaXRvckluRGlyZWN0aW9uXG59ID0gcmVxdWlyZSAnLi91dGlscydcbnN3cmFwID0gcmVxdWlyZSAnLi9zZWxlY3Rpb24td3JhcHBlcidcbklucHV0ID0gcmVxdWlyZSAnLi9pbnB1dCdcbnNlbGVjdExpc3QgPSBudWxsXG5nZXRFZGl0b3JTdGF0ZSA9IG51bGwgIyBzZXQgYnkgQmFzZS5pbml0KClcbntPcGVyYXRpb25BYm9ydGVkRXJyb3J9ID0gcmVxdWlyZSAnLi9lcnJvcnMnXG5cbnZpbVN0YXRlTWV0aG9kcyA9IFtcbiAgXCJhc3NlcnRcIlxuICBcImFzc2VydFdpdGhFeGNlcHRpb25cIlxuICBcIm9uRGlkQ2hhbmdlU2VhcmNoXCJcbiAgXCJvbkRpZENvbmZpcm1TZWFyY2hcIlxuICBcIm9uRGlkQ2FuY2VsU2VhcmNoXCJcbiAgXCJvbkRpZENvbW1hbmRTZWFyY2hcIlxuXG4gICMgTGlmZSBjeWNsZVxuICBcIm9uRGlkU2V0VGFyZ2V0XCJcbiAgXCJlbWl0RGlkU2V0VGFyZ2V0XCJcbiAgICAgIFwib25XaWxsU2VsZWN0VGFyZ2V0XCJcbiAgICAgIFwiZW1pdFdpbGxTZWxlY3RUYXJnZXRcIlxuICAgICAgXCJvbkRpZFNlbGVjdFRhcmdldFwiXG4gICAgICBcImVtaXREaWRTZWxlY3RUYXJnZXRcIlxuXG4gICAgICBcIm9uRGlkRmFpbFNlbGVjdFRhcmdldFwiXG4gICAgICBcImVtaXREaWRGYWlsU2VsZWN0VGFyZ2V0XCJcblxuICAgICAgXCJvbkRpZFJlc3RvcmVDdXJzb3JQb3NpdGlvbnNcIlxuICAgICAgXCJlbWl0RGlkUmVzdG9yZUN1cnNvclBvc2l0aW9uc1wiXG4gICAgXCJvbldpbGxGaW5pc2hNdXRhdGlvblwiXG4gICAgXCJlbWl0V2lsbEZpbmlzaE11dGF0aW9uXCJcbiAgICBcIm9uRGlkRmluaXNoTXV0YXRpb25cIlxuICAgIFwiZW1pdERpZEZpbmlzaE11dGF0aW9uXCJcbiAgXCJvbkRpZEZpbmlzaE9wZXJhdGlvblwiXG4gIFwib25EaWRSZXNldE9wZXJhdGlvblN0YWNrXCJcblxuICBcIm9uRGlkU2V0T3BlcmF0b3JNb2RpZmllclwiXG5cbiAgXCJvbldpbGxBY3RpdmF0ZU1vZGVcIlxuICBcIm9uRGlkQWN0aXZhdGVNb2RlXCJcbiAgXCJwcmVlbXB0V2lsbERlYWN0aXZhdGVNb2RlXCJcbiAgXCJvbldpbGxEZWFjdGl2YXRlTW9kZVwiXG4gIFwib25EaWREZWFjdGl2YXRlTW9kZVwiXG5cbiAgXCJvbkRpZENhbmNlbFNlbGVjdExpc3RcIlxuICBcInN1YnNjcmliZVwiXG4gIFwiaXNNb2RlXCJcbiAgXCJnZXRCbG9ja3dpc2VTZWxlY3Rpb25zXCJcbiAgXCJnZXRMYXN0QmxvY2t3aXNlU2VsZWN0aW9uXCJcbiAgXCJhZGRUb0NsYXNzTGlzdFwiXG4gIFwiZ2V0Q29uZmlnXCJcbl1cblxuY2xhc3MgQmFzZVxuICBEZWxlZ2F0by5pbmNsdWRlSW50byh0aGlzKVxuICBAZGVsZWdhdGVzTWV0aG9kcyh2aW1TdGF0ZU1ldGhvZHMuLi4sIHRvUHJvcGVydHk6ICd2aW1TdGF0ZScpXG4gIEBkZWxlZ2F0ZXNQcm9wZXJ0eSgnbW9kZScsICdzdWJtb2RlJywgdG9Qcm9wZXJ0eTogJ3ZpbVN0YXRlJylcblxuICBjb25zdHJ1Y3RvcjogKEB2aW1TdGF0ZSwgcHJvcGVydGllcz1udWxsKSAtPlxuICAgIHtAZWRpdG9yLCBAZWRpdG9yRWxlbWVudCwgQGdsb2JhbFN0YXRlfSA9IEB2aW1TdGF0ZVxuICAgIF8uZXh0ZW5kKHRoaXMsIHByb3BlcnRpZXMpIGlmIHByb3BlcnRpZXM/XG5cbiAgIyBUbyBvdmVycmlkZVxuICBpbml0aWFsaXplOiAtPlxuXG4gICMgT3BlcmF0aW9uIHByb2Nlc3NvciBleGVjdXRlIG9ubHkgd2hlbiBpc0NvbXBsZXRlKCkgcmV0dXJuIHRydWUuXG4gICMgSWYgZmFsc2UsIG9wZXJhdGlvbiBwcm9jZXNzb3IgcG9zdHBvbmUgaXRzIGV4ZWN1dGlvbi5cbiAgaXNDb21wbGV0ZTogLT5cbiAgICBpZiBAaXNSZXF1aXJlSW5wdXQoKSBhbmQgbm90IEBoYXNJbnB1dCgpXG4gICAgICBmYWxzZVxuICAgIGVsc2UgaWYgQGlzUmVxdWlyZVRhcmdldCgpXG4gICAgICAjIFdoZW4gdGhpcyBmdW5jdGlvbiBpcyBjYWxsZWQgaW4gQmFzZTo6Y29uc3RydWN0b3JcbiAgICAgICMgdGFnZXJ0IGlzIHN0aWxsIHN0cmluZyBsaWtlIGBNb3ZlVG9SaWdodGAsIGluIHRoaXMgY2FzZSBpc0NvbXBsZXRlXG4gICAgICAjIGlzIG5vdCBhdmFpbGFibGUuXG4gICAgICBAZ2V0VGFyZ2V0KCk/LmlzQ29tcGxldGU/KClcbiAgICBlbHNlXG4gICAgICB0cnVlXG5cbiAgdGFyZ2V0OiBudWxsXG4gIGhhc1RhcmdldDogLT4gQHRhcmdldD9cbiAgZ2V0VGFyZ2V0OiAtPiBAdGFyZ2V0XG5cbiAgcmVxdWlyZVRhcmdldDogZmFsc2VcbiAgaXNSZXF1aXJlVGFyZ2V0OiAtPiBAcmVxdWlyZVRhcmdldFxuXG4gIHJlcXVpcmVJbnB1dDogZmFsc2VcbiAgaXNSZXF1aXJlSW5wdXQ6IC0+IEByZXF1aXJlSW5wdXRcblxuICByZWNvcmRhYmxlOiBmYWxzZVxuICBpc1JlY29yZGFibGU6IC0+IEByZWNvcmRhYmxlXG5cbiAgcmVwZWF0ZWQ6IGZhbHNlXG4gIGlzUmVwZWF0ZWQ6IC0+IEByZXBlYXRlZFxuICBzZXRSZXBlYXRlZDogLT4gQHJlcGVhdGVkID0gdHJ1ZVxuXG4gICMgSW50ZW5kZWQgdG8gYmUgdXNlZCBieSBUZXh0T2JqZWN0IG9yIE1vdGlvblxuICBvcGVyYXRvcjogbnVsbFxuICBnZXRPcGVyYXRvcjogLT4gQG9wZXJhdG9yXG4gIHNldE9wZXJhdG9yOiAoQG9wZXJhdG9yKSAtPiBAb3BlcmF0b3JcbiAgaXNBc1RhcmdldEV4Y2VwdFNlbGVjdDogLT5cbiAgICBAb3BlcmF0b3I/IGFuZCBub3QgQG9wZXJhdG9yLmluc3RhbmNlb2YoJ1NlbGVjdCcpXG5cbiAgYWJvcnQ6IC0+XG4gICAgdGhyb3cgbmV3IE9wZXJhdGlvbkFib3J0ZWRFcnJvcignYWJvcnRlZCcpXG5cbiAgIyBDb3VudFxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgY291bnQ6IG51bGxcbiAgZGVmYXVsdENvdW50OiAxXG4gIGdldENvdW50OiAob2Zmc2V0PTApIC0+XG4gICAgQGNvdW50ID89IEB2aW1TdGF0ZS5nZXRDb3VudCgpID8gQGRlZmF1bHRDb3VudFxuICAgIEBjb3VudCArIG9mZnNldFxuXG4gIHJlc2V0Q291bnQ6IC0+XG4gICAgQGNvdW50ID0gbnVsbFxuXG4gIGlzRGVmYXVsdENvdW50OiAtPlxuICAgIEBjb3VudCBpcyBAZGVmYXVsdENvdW50XG5cbiAgIyBNaXNjXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBjb3VudFRpbWVzOiAobGFzdCwgZm4pIC0+XG4gICAgcmV0dXJuIGlmIGxhc3QgPCAxXG5cbiAgICBzdG9wcGVkID0gZmFsc2VcbiAgICBzdG9wID0gLT4gc3RvcHBlZCA9IHRydWVcbiAgICBmb3IgY291bnQgaW4gWzEuLmxhc3RdXG4gICAgICBpc0ZpbmFsID0gY291bnQgaXMgbGFzdFxuICAgICAgZm4oe2NvdW50LCBpc0ZpbmFsLCBzdG9wfSlcbiAgICAgIGJyZWFrIGlmIHN0b3BwZWRcblxuICBhY3RpdmF0ZU1vZGU6IChtb2RlLCBzdWJtb2RlKSAtPlxuICAgIEBvbkRpZEZpbmlzaE9wZXJhdGlvbiA9PlxuICAgICAgQHZpbVN0YXRlLmFjdGl2YXRlKG1vZGUsIHN1Ym1vZGUpXG5cbiAgYWN0aXZhdGVNb2RlSWZOZWNlc3Nhcnk6IChtb2RlLCBzdWJtb2RlKSAtPlxuICAgIHVubGVzcyBAdmltU3RhdGUuaXNNb2RlKG1vZGUsIHN1Ym1vZGUpXG4gICAgICBAYWN0aXZhdGVNb2RlKG1vZGUsIHN1Ym1vZGUpXG5cbiAgbmV3OiAobmFtZSwgcHJvcGVydGllcykgLT5cbiAgICBrbGFzcyA9IEJhc2UuZ2V0Q2xhc3MobmFtZSlcbiAgICBuZXcga2xhc3MoQHZpbVN0YXRlLCBwcm9wZXJ0aWVzKVxuXG4gIG5ld0lucHV0VUk6IC0+XG4gICAgbmV3IElucHV0KEB2aW1TdGF0ZSlcblxuICAjIEZJWE1FOiBUaGlzIGlzIHVzZWQgdG8gY2xvbmUgTW90aW9uOjpTZWFyY2ggdG8gc3VwcG9ydCBgbmAgYW5kIGBOYFxuICAjIEJ1dCBtYW51YWwgcmVzZXRpbmcgYW5kIG92ZXJyaWRpbmcgcHJvcGVydHkgaXMgYnVnIHByb25lLlxuICAjIFNob3VsZCBleHRyYWN0IGFzIHNlYXJjaCBzcGVjIG9iamVjdCBhbmQgdXNlIGl0IGJ5XG4gICMgY3JlYXRpbmcgY2xlYW4gaW5zdGFuY2Ugb2YgU2VhcmNoLlxuICBjbG9uZTogKHZpbVN0YXRlKSAtPlxuICAgIHByb3BlcnRpZXMgPSB7fVxuICAgIGV4Y2x1ZGVQcm9wZXJ0aWVzID0gWydlZGl0b3InLCAnZWRpdG9yRWxlbWVudCcsICdnbG9iYWxTdGF0ZScsICd2aW1TdGF0ZScsICdvcGVyYXRvciddXG4gICAgZm9yIG93biBrZXksIHZhbHVlIG9mIHRoaXMgd2hlbiBrZXkgbm90IGluIGV4Y2x1ZGVQcm9wZXJ0aWVzXG4gICAgICBwcm9wZXJ0aWVzW2tleV0gPSB2YWx1ZVxuICAgIGtsYXNzID0gdGhpcy5jb25zdHJ1Y3RvclxuICAgIG5ldyBrbGFzcyh2aW1TdGF0ZSwgcHJvcGVydGllcylcblxuICBjYW5jZWxPcGVyYXRpb246IC0+XG4gICAgQHZpbVN0YXRlLm9wZXJhdGlvblN0YWNrLmNhbmNlbCgpXG5cbiAgcHJvY2Vzc09wZXJhdGlvbjogLT5cbiAgICBAdmltU3RhdGUub3BlcmF0aW9uU3RhY2sucHJvY2VzcygpXG5cbiAgZm9jdXNTZWxlY3RMaXN0OiAob3B0aW9ucz17fSkgLT5cbiAgICBAb25EaWRDYW5jZWxTZWxlY3RMaXN0ID0+XG4gICAgICBAY2FuY2VsT3BlcmF0aW9uKClcbiAgICBzZWxlY3RMaXN0ID89IHJlcXVpcmUgJy4vc2VsZWN0LWxpc3QnXG4gICAgc2VsZWN0TGlzdC5zaG93KEB2aW1TdGF0ZSwgb3B0aW9ucylcblxuICBpbnB1dDogbnVsbFxuICBoYXNJbnB1dDogLT4gQGlucHV0P1xuICBnZXRJbnB1dDogLT4gQGlucHV0XG5cbiAgZm9jdXNJbnB1dDogKGNoYXJzTWF4KSAtPlxuICAgIGlucHV0VUkgPSBAbmV3SW5wdXRVSSgpXG4gICAgaW5wdXRVSS5vbkRpZENvbmZpcm0gKEBpbnB1dCkgPT5cbiAgICAgIEBwcm9jZXNzT3BlcmF0aW9uKClcblxuICAgIGlmIGNoYXJzTWF4ID4gMVxuICAgICAgaW5wdXRVSS5vbkRpZENoYW5nZSAoaW5wdXQpID0+XG4gICAgICAgIEB2aW1TdGF0ZS5ob3Zlci5zZXQoaW5wdXQpXG5cbiAgICBpbnB1dFVJLm9uRGlkQ2FuY2VsKEBjYW5jZWxPcGVyYXRpb24uYmluZCh0aGlzKSlcbiAgICBpbnB1dFVJLmZvY3VzKGNoYXJzTWF4KVxuXG4gIGdldFZpbUVvZkJ1ZmZlclBvc2l0aW9uOiAtPlxuICAgIGdldFZpbUVvZkJ1ZmZlclBvc2l0aW9uKEBlZGl0b3IpXG5cbiAgZ2V0VmltTGFzdEJ1ZmZlclJvdzogLT5cbiAgICBnZXRWaW1MYXN0QnVmZmVyUm93KEBlZGl0b3IpXG5cbiAgZ2V0VmltTGFzdFNjcmVlblJvdzogLT5cbiAgICBnZXRWaW1MYXN0U2NyZWVuUm93KEBlZGl0b3IpXG5cbiAgZ2V0V29yZEJ1ZmZlclJhbmdlQW5kS2luZEF0QnVmZmVyUG9zaXRpb246IChwb2ludCwgb3B0aW9ucykgLT5cbiAgICBnZXRXb3JkQnVmZmVyUmFuZ2VBbmRLaW5kQXRCdWZmZXJQb3NpdGlvbihAZWRpdG9yLCBwb2ludCwgb3B0aW9ucylcblxuICBnZXRGaXJzdENoYXJhY3RlclBvc2l0aW9uRm9yQnVmZmVyUm93OiAocm93KSAtPlxuICAgIGdldEZpcnN0Q2hhcmFjdGVyUG9zaXRpb25Gb3JCdWZmZXJSb3coQGVkaXRvciwgcm93KVxuXG4gIGdldEJ1ZmZlclJhbmdlRm9yUm93UmFuZ2U6IChyb3dSYW5nZSkgLT5cbiAgICBnZXRCdWZmZXJSYW5nZUZvclJvd1JhbmdlKEBlZGl0b3IsIHJvd1JhbmdlKVxuXG4gIGdldEluZGVudExldmVsRm9yQnVmZmVyUm93OiAocm93KSAtPlxuICAgIGdldEluZGVudExldmVsRm9yQnVmZmVyUm93KEBlZGl0b3IsIHJvdylcblxuICBzY2FuRm9yd2FyZDogKGFyZ3MuLi4pIC0+XG4gICAgc2NhbkVkaXRvckluRGlyZWN0aW9uKEBlZGl0b3IsICdmb3J3YXJkJywgYXJncy4uLilcblxuICBzY2FuQmFja3dhcmQ6IChhcmdzLi4uKSAtPlxuICAgIHNjYW5FZGl0b3JJbkRpcmVjdGlvbihAZWRpdG9yLCAnYmFja3dhcmQnLCBhcmdzLi4uKVxuXG4gIGluc3RhbmNlb2Y6IChrbGFzc05hbWUpIC0+XG4gICAgdGhpcyBpbnN0YW5jZW9mIEJhc2UuZ2V0Q2xhc3Moa2xhc3NOYW1lKVxuXG4gIGlzOiAoa2xhc3NOYW1lKSAtPlxuICAgIHRoaXMuY29uc3RydWN0b3IgaXMgQmFzZS5nZXRDbGFzcyhrbGFzc05hbWUpXG5cbiAgaXNPcGVyYXRvcjogLT5cbiAgICBAaW5zdGFuY2VvZignT3BlcmF0b3InKVxuXG4gIGlzTW90aW9uOiAtPlxuICAgIEBpbnN0YW5jZW9mKCdNb3Rpb24nKVxuXG4gIGlzVGV4dE9iamVjdDogLT5cbiAgICBAaW5zdGFuY2VvZignVGV4dE9iamVjdCcpXG5cbiAgZ2V0TmFtZTogLT5cbiAgICBAY29uc3RydWN0b3IubmFtZVxuXG4gIGdldEN1cnNvckJ1ZmZlclBvc2l0aW9uOiAtPlxuICAgIGlmIEBtb2RlIGlzICd2aXN1YWwnXG4gICAgICBAZ2V0Q3Vyc29yUG9zaXRpb25Gb3JTZWxlY3Rpb24oQGVkaXRvci5nZXRMYXN0U2VsZWN0aW9uKCkpXG4gICAgZWxzZVxuICAgICAgQGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpXG5cbiAgZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb25zOiAtPlxuICAgIGlmIEBtb2RlIGlzICd2aXN1YWwnXG4gICAgICBAZWRpdG9yLmdldFNlbGVjdGlvbnMoKS5tYXAoQGdldEN1cnNvclBvc2l0aW9uRm9yU2VsZWN0aW9uLmJpbmQodGhpcykpXG4gICAgZWxzZVxuICAgICAgQGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbnMoKVxuXG4gIGdldEJ1ZmZlclBvc2l0aW9uRm9yQ3Vyc29yOiAoY3Vyc29yKSAtPlxuICAgIGlmIEBtb2RlIGlzICd2aXN1YWwnXG4gICAgICBAZ2V0Q3Vyc29yUG9zaXRpb25Gb3JTZWxlY3Rpb24oY3Vyc29yLnNlbGVjdGlvbilcbiAgICBlbHNlXG4gICAgICBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuXG4gIGdldEN1cnNvclBvc2l0aW9uRm9yU2VsZWN0aW9uOiAoc2VsZWN0aW9uKSAtPlxuICAgIHN3cmFwKHNlbGVjdGlvbikuZ2V0QnVmZmVyUG9zaXRpb25Gb3IoJ2hlYWQnLCBmcm9tOiBbJ3Byb3BlcnR5JywgJ3NlbGVjdGlvbiddKVxuXG4gIHRvU3RyaW5nOiAtPlxuICAgIHN0ciA9IEBnZXROYW1lKClcbiAgICBpZiBAaGFzVGFyZ2V0KClcbiAgICAgIHN0ciArPSBcIiwgdGFyZ2V0PSN7QHRhcmdldC5nZXROYW1lKCl9LCB0YXJnZXQud2lzZT0je0B0YXJnZXQud2lzZX0gXCJcbiAgICBlbHNlIGlmIEBvcGVyYXRvcj9cbiAgICAgIHN0ciArPSBcIiwgd2lzZT0je0B3aXNlfSAsIG9wZXJhdG9yPSN7QG9wZXJhdG9yLmdldE5hbWUoKX1cIlxuICAgIGVsc2VcbiAgICAgIHN0clxuXG4gICMgQ2xhc3MgbWV0aG9kc1xuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgQGluaXQ6IChzZXJ2aWNlKSAtPlxuICAgIHtnZXRFZGl0b3JTdGF0ZX0gPSBzZXJ2aWNlXG4gICAgQHN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG5cbiAgICBbXG4gICAgICAnLi9vcGVyYXRvcicsICcuL29wZXJhdG9yLWluc2VydCcsICcuL29wZXJhdG9yLXRyYW5zZm9ybS1zdHJpbmcnLFxuICAgICAgJy4vbW90aW9uJywgJy4vbW90aW9uLXNlYXJjaCcsXG4gICAgICAnLi90ZXh0LW9iamVjdCcsXG4gICAgICAnLi9pbnNlcnQtbW9kZScsICcuL21pc2MtY29tbWFuZCdcbiAgICBdLmZvckVhY2gocmVxdWlyZSlcblxuICAgIGZvciBfXywga2xhc3Mgb2YgQGdldFJlZ2lzdHJpZXMoKSB3aGVuIGtsYXNzLmlzQ29tbWFuZCgpXG4gICAgICBAc3Vic2NyaXB0aW9ucy5hZGQoa2xhc3MucmVnaXN0ZXJDb21tYW5kKCkpXG4gICAgQHN1YnNjcmlwdGlvbnNcblxuICAjIEZvciBkZXZlbG9wbWVudCBlYXNpbmVzcyB3aXRob3V0IHJlbG9hZGluZyB2aW0tbW9kZS1wbHVzXG4gIEByZXNldDogLT5cbiAgICBAc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiAgICBAc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcbiAgICBmb3IgX18sIGtsYXNzIG9mIEBnZXRSZWdpc3RyaWVzKCkgd2hlbiBrbGFzcy5pc0NvbW1hbmQoKVxuICAgICAgQHN1YnNjcmlwdGlvbnMuYWRkKGtsYXNzLnJlZ2lzdGVyQ29tbWFuZCgpKVxuXG4gIHJlZ2lzdHJpZXMgPSB7QmFzZX1cbiAgQGV4dGVuZDogKEBjb21tYW5kPXRydWUpIC0+XG4gICAgaWYgKEBuYW1lIG9mIHJlZ2lzdHJpZXMpIGFuZCAobm90IEBzdXBwcmVzc1dhcm5pbmcpXG4gICAgICBjb25zb2xlLndhcm4oXCJEdXBsaWNhdGUgY29uc3RydWN0b3IgI3tAbmFtZX1cIilcbiAgICByZWdpc3RyaWVzW0BuYW1lXSA9IHRoaXNcblxuICBAZ2V0Q2xhc3M6IChuYW1lKSAtPlxuICAgIGlmIChrbGFzcyA9IHJlZ2lzdHJpZXNbbmFtZV0pP1xuICAgICAga2xhc3NcbiAgICBlbHNlXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJjbGFzcyAnI3tuYW1lfScgbm90IGZvdW5kXCIpXG5cbiAgQGdldFJlZ2lzdHJpZXM6IC0+XG4gICAgcmVnaXN0cmllc1xuXG4gIEBpc0NvbW1hbmQ6IC0+XG4gICAgQGNvbW1hbmRcblxuICBAY29tbWFuZFByZWZpeDogJ3ZpbS1tb2RlLXBsdXMnXG4gIEBnZXRDb21tYW5kTmFtZTogLT5cbiAgICBAY29tbWFuZFByZWZpeCArICc6JyArIF8uZGFzaGVyaXplKEBuYW1lKVxuXG4gIEBnZXRDb21tYW5kTmFtZVdpdGhvdXRQcmVmaXg6IC0+XG4gICAgXy5kYXNoZXJpemUoQG5hbWUpXG5cbiAgQGNvbW1hbmRTY29wZTogJ2F0b20tdGV4dC1lZGl0b3InXG4gIEBnZXRDb21tYW5kU2NvcGU6IC0+XG4gICAgQGNvbW1hbmRTY29wZVxuXG4gIEBnZXREZXNjdGlwdGlvbjogLT5cbiAgICBpZiBAaGFzT3duUHJvcGVydHkoXCJkZXNjcmlwdGlvblwiKVxuICAgICAgQGRlc2NyaXB0aW9uXG4gICAgZWxzZVxuICAgICAgbnVsbFxuXG4gIEByZWdpc3RlckNvbW1hbmQ6IC0+XG4gICAga2xhc3MgPSB0aGlzXG4gICAgYXRvbS5jb21tYW5kcy5hZGQgQGdldENvbW1hbmRTY29wZSgpLCBAZ2V0Q29tbWFuZE5hbWUoKSwgKGV2ZW50KSAtPlxuICAgICAgdmltU3RhdGUgPSBnZXRFZGl0b3JTdGF0ZShAZ2V0TW9kZWwoKSkgPyBnZXRFZGl0b3JTdGF0ZShhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCkpXG4gICAgICBpZiB2aW1TdGF0ZT8gIyBQb3NzaWJseSB1bmRlZmluZWQgU2VlICM4NVxuICAgICAgICB2aW1TdGF0ZS5fZXZlbnQgPSBldmVudFxuICAgICAgICB2aW1TdGF0ZS5vcGVyYXRpb25TdGFjay5ydW4oa2xhc3MpXG4gICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuXG5tb2R1bGUuZXhwb3J0cyA9IEJhc2VcbiJdfQ==
