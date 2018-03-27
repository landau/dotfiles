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

  vimStateMethods = ["onDidChangeSearch", "onDidConfirmSearch", "onDidCancelSearch", "onDidCommandSearch", "onDidSetTarget", "emitDidSetTarget", "onWillSelectTarget", "emitWillSelectTarget", "onDidSelectTarget", "emitDidSelectTarget", "onDidFailSelectTarget", "emitDidFailSelectTarget", "onWillFinishMutation", "emitWillFinishMutation", "onDidFinishMutation", "emitDidFinishMutation", "onDidFinishOperation", "onDidResetOperationStack", "onDidSetOperatorModifier", "onWillActivateMode", "onDidActivateMode", "preemptWillDeactivateMode", "onWillDeactivateMode", "onDidDeactivateMode", "onDidCancelSelectList", "subscribe", "isMode", "getBlockwiseSelections", "getLastBlockwiseSelection", "addToClassList", "getConfig"];

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
      this.name = this.constructor.name;
      if (properties != null) {
        _.extend(this, properties);
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

    Base.prototype.focusInput = function(charsMax, hideCursor) {
      var inputUI;
      inputUI = this.newInputUI();
      inputUI.onDidConfirm((function(_this) {
        return function(input) {
          _this.input = input;
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
      return inputUI.focus(charsMax, hideCursor);
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
      str = this.name;
      if (this.target != null) {
        return str += ", target=" + this.target.name + ", target.wise=" + this.target.wise + " ";
      } else if (this.operator != null) {
        return str += ", wise=" + this.wise + " , operator=" + this.operator.name;
      } else {
        return str;
      }
    };

    Base.init = function(service) {
      var __, klass, ref1;
      getEditorState = service.getEditorState;
      this.subscriptions = new CompositeDisposable();
      ['./operator', './operator-insert', './operator-transform-string', './motion', './motion-search', './text-object', './misc-command'].forEach(require);
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

    Base.extend = function(command1) {
      this.command = command1 != null ? command1 : true;
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

    Base.operationKind = null;

    Base.getKindForCommandName = function(command) {
      var name;
      name = _.capitalize(_.camelize(command));
      if (name in registries) {
        return registries[name].operationKind;
      }
    };

    return Base;

  })();

  module.exports = Base;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvYmFzZS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLGdXQUFBO0lBQUE7Ozs7RUFBQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSOztFQUNKLFFBQUEsR0FBVyxPQUFBLENBQVEsVUFBUjs7RUFDVixzQkFBdUIsT0FBQSxDQUFRLE1BQVI7O0VBQ3hCLE1BU0ksT0FBQSxDQUFRLFNBQVIsQ0FUSixFQUNFLHFEQURGLEVBRUUsNkNBRkYsRUFHRSw2Q0FIRixFQUlFLHlGQUpGLEVBS0UsaUZBTEYsRUFNRSx5REFORixFQU9FLDJEQVBGLEVBUUU7O0VBRUYsS0FBQSxHQUFRLE9BQUEsQ0FBUSxxQkFBUjs7RUFDUixLQUFBLEdBQVEsT0FBQSxDQUFRLFNBQVI7O0VBQ1IsVUFBQSxHQUFhOztFQUNiLGNBQUEsR0FBaUI7O0VBQ2hCLHdCQUF5QixPQUFBLENBQVEsVUFBUjs7RUFFMUIsZUFBQSxHQUFrQixDQUNoQixtQkFEZ0IsRUFFaEIsb0JBRmdCLEVBR2hCLG1CQUhnQixFQUloQixvQkFKZ0IsRUFPaEIsZ0JBUGdCLEVBUWhCLGtCQVJnQixFQVNaLG9CQVRZLEVBVVosc0JBVlksRUFXWixtQkFYWSxFQVlaLHFCQVpZLEVBY1osdUJBZFksRUFlWix5QkFmWSxFQWlCZCxzQkFqQmMsRUFrQmQsd0JBbEJjLEVBbUJkLHFCQW5CYyxFQW9CZCx1QkFwQmMsRUFxQmhCLHNCQXJCZ0IsRUFzQmhCLDBCQXRCZ0IsRUF3QmhCLDBCQXhCZ0IsRUEwQmhCLG9CQTFCZ0IsRUEyQmhCLG1CQTNCZ0IsRUE0QmhCLDJCQTVCZ0IsRUE2QmhCLHNCQTdCZ0IsRUE4QmhCLHFCQTlCZ0IsRUFnQ2hCLHVCQWhDZ0IsRUFpQ2hCLFdBakNnQixFQWtDaEIsUUFsQ2dCLEVBbUNoQix3QkFuQ2dCLEVBb0No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QUFlLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQWYsQ0FBQSxDQUFmO1FBQ3pDLElBQUcsZ0JBQUg7VUFDRSxRQUFRLENBQUMsTUFBVCxHQUFrQjtVQUNsQixRQUFRLENBQUMsY0FBYyxDQUFDLEdBQXhCLENBQTRCLEtBQTVCLEVBRkY7O2VBR0EsS0FBSyxDQUFDLGVBQU4sQ0FBQTtNQUx1RCxDQUF6RDtJQUZnQjs7SUFVbEIsSUFBQyxDQUFBLGFBQUQsR0FBZ0I7O0lBQ2hCLElBQUMsQ0FBQSxxQkFBRCxHQUF3QixTQUFDLE9BQUQ7QUFDdEIsVUFBQTtNQUFBLElBQUEsR0FBTyxDQUFDLENBQUMsVUFBRixDQUFhLENBQUMsQ0FBQyxRQUFGLENBQVcsT0FBWCxDQUFiO01BQ1AsSUFBRyxJQUFBLElBQVEsVUFBWDtlQUNFLFVBQVcsQ0FBQSxJQUFBLENBQUssQ0FBQyxjQURuQjs7SUFGc0I7Ozs7OztFQUsxQixNQUFNLENBQUMsT0FBUCxHQUFpQjtBQWxVakIiLCJzb3VyY2VzQ29udGVudCI6WyJfID0gcmVxdWlyZSAndW5kZXJzY29yZS1wbHVzJ1xuRGVsZWdhdG8gPSByZXF1aXJlICdkZWxlZ2F0bydcbntDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2F0b20nXG57XG4gIGdldFZpbUVvZkJ1ZmZlclBvc2l0aW9uXG4gIGdldFZpbUxhc3RCdWZmZXJSb3dcbiAgZ2V0VmltTGFzdFNjcmVlblJvd1xuICBnZXRXb3JkQnVmZmVyUmFuZ2VBbmRLaW5kQXRCdWZmZXJQb3NpdGlvblxuICBnZXRGaXJzdENoYXJhY3RlclBvc2l0aW9uRm9yQnVmZmVyUm93XG4gIGdldEJ1ZmZlclJhbmdlRm9yUm93UmFuZ2VcbiAgZ2V0SW5kZW50TGV2ZWxGb3JCdWZmZXJSb3dcbiAgc2NhbkVkaXRvckluRGlyZWN0aW9uXG59ID0gcmVxdWlyZSAnLi91dGlscydcbnN3cmFwID0gcmVxdWlyZSAnLi9zZWxlY3Rpb24td3JhcHBlcidcbklucHV0ID0gcmVxdWlyZSAnLi9pbnB1dCdcbnNlbGVjdExpc3QgPSBudWxsXG5nZXRFZGl0b3JTdGF0ZSA9IG51bGwgIyBzZXQgYnkgQmFzZS5pbml0KClcbntPcGVyYXRpb25BYm9ydGVkRXJyb3J9ID0gcmVxdWlyZSAnLi9lcnJvcnMnXG5cbnZpbVN0YXRlTWV0aG9kcyA9IFtcbiAgXCJvbkRpZENoYW5nZVNlYXJjaFwiXG4gIFwib25EaWRDb25maXJtU2VhcmNoXCJcbiAgXCJvbkRpZENhbmNlbFNlYXJjaFwiXG4gIFwib25EaWRDb21tYW5kU2VhcmNoXCJcblxuICAjIExpZmUgY3ljbGVcbiAgXCJvbkRpZFNldFRhcmdldFwiXG4gIFwiZW1pdERpZFNldFRhcmdldFwiXG4gICAgICBcIm9uV2lsbFNlbGVjdFRhcmdldFwiXG4gICAgICBcImVtaXRXaWxsU2VsZWN0VGFyZ2V0XCJcbiAgICAgIFwib25EaWRTZWxlY3RUYXJnZXRcIlxuICAgICAgXCJlbWl0RGlkU2VsZWN0VGFyZ2V0XCJcblxuICAgICAgXCJvbkRpZEZhaWxTZWxlY3RUYXJnZXRcIlxuICAgICAgXCJlbWl0RGlkRmFpbFNlbGVjdFRhcmdldFwiXG5cbiAgICBcIm9uV2lsbEZpbmlzaE11dGF0aW9uXCJcbiAgICBcImVtaXRXaWxsRmluaXNoTXV0YXRpb25cIlxuICAgIFwib25EaWRGaW5pc2hNdXRhdGlvblwiXG4gICAgXCJlbWl0RGlkRmluaXNoTXV0YXRpb25cIlxuICBcIm9uRGlkRmluaXNoT3BlcmF0aW9uXCJcbiAgXCJvbkRpZFJlc2V0T3BlcmF0aW9uU3RhY2tcIlxuXG4gIFwib25EaWRTZXRPcGVyYXRvck1vZGlmaWVyXCJcblxuICBcIm9uV2lsbEFjdGl2YXRlTW9kZVwiXG4gIFwib25EaWRBY3RpdmF0ZU1vZGVcIlxuICBcInByZWVtcHRXaWxsRGVhY3RpdmF0ZU1vZGVcIlxuICBcIm9uV2lsbERlYWN0aXZhdGVNb2RlXCJcbiAgXCJvbkRpZERlYWN0aXZhdGVNb2RlXCJcblxuICBcIm9uRGlkQ2FuY2VsU2VsZWN0TGlzdFwiXG4gIFwic3Vic2NyaWJlXCJcbiAgXCJpc01vZGVcIlxuICBcImdldEJsb2Nrd2lzZVNlbGVjdGlvbnNcIlxuICBcImdldExhc3RCbG9ja3dpc2VTZWxlY3Rpb25cIlxuICBcImFkZFRvQ2xhc3NMaXN0XCJcbiAgXCJnZXRDb25maWdcIlxuXVxuXG5jbGFzcyBCYXNlXG4gIERlbGVnYXRvLmluY2x1ZGVJbnRvKHRoaXMpXG4gIEBkZWxlZ2F0ZXNNZXRob2RzKHZpbVN0YXRlTWV0aG9kcy4uLiwgdG9Qcm9wZXJ0eTogJ3ZpbVN0YXRlJylcbiAgQGRlbGVnYXRlc1Byb3BlcnR5KCdtb2RlJywgJ3N1Ym1vZGUnLCB0b1Byb3BlcnR5OiAndmltU3RhdGUnKVxuXG4gIGNvbnN0cnVjdG9yOiAoQHZpbVN0YXRlLCBwcm9wZXJ0aWVzPW51bGwpIC0+XG4gICAge0BlZGl0b3IsIEBlZGl0b3JFbGVtZW50LCBAZ2xvYmFsU3RhdGV9ID0gQHZpbVN0YXRlXG4gICAgQG5hbWUgPSBAY29uc3RydWN0b3IubmFtZVxuICAgIF8uZXh0ZW5kKHRoaXMsIHByb3BlcnRpZXMpIGlmIHByb3BlcnRpZXM/XG5cbiAgIyBUbyBvdmVycmlkZVxuICBpbml0aWFsaXplOiAtPlxuXG4gICMgT3BlcmF0aW9uIHByb2Nlc3NvciBleGVjdXRlIG9ubHkgd2hlbiBpc0NvbXBsZXRlKCkgcmV0dXJuIHRydWUuXG4gICMgSWYgZmFsc2UsIG9wZXJhdGlvbiBwcm9jZXNzb3IgcG9zdHBvbmUgaXRzIGV4ZWN1dGlvbi5cbiAgaXNDb21wbGV0ZTogLT5cbiAgICBpZiBAcmVxdWlyZUlucHV0IGFuZCBub3QgQGlucHV0P1xuICAgICAgZmFsc2VcbiAgICBlbHNlIGlmIEByZXF1aXJlVGFyZ2V0XG4gICAgICAjIFdoZW4gdGhpcyBmdW5jdGlvbiBpcyBjYWxsZWQgaW4gQmFzZTo6Y29uc3RydWN0b3JcbiAgICAgICMgdGFnZXJ0IGlzIHN0aWxsIHN0cmluZyBsaWtlIGBNb3ZlVG9SaWdodGAsIGluIHRoaXMgY2FzZSBpc0NvbXBsZXRlXG4gICAgICAjIGlzIG5vdCBhdmFpbGFibGUuXG4gICAgICBAdGFyZ2V0Py5pc0NvbXBsZXRlPygpXG4gICAgZWxzZVxuICAgICAgdHJ1ZVxuXG4gIHJlcXVpcmVUYXJnZXQ6IGZhbHNlXG4gIHJlcXVpcmVJbnB1dDogZmFsc2VcbiAgcmVjb3JkYWJsZTogZmFsc2VcbiAgcmVwZWF0ZWQ6IGZhbHNlXG4gIHRhcmdldDogbnVsbCAjIFNldCBpbiBPcGVyYXRvclxuICBvcGVyYXRvcjogbnVsbCAjIFNldCBpbiBvcGVyYXRvcidzIHRhcmdldCggTW90aW9uIG9yIFRleHRPYmplY3QgKVxuICBpc0FzVGFyZ2V0RXhjZXB0U2VsZWN0OiAtPlxuICAgIEBvcGVyYXRvcj8gYW5kIG5vdCBAb3BlcmF0b3IuaW5zdGFuY2VvZignU2VsZWN0JylcblxuICBhYm9ydDogLT5cbiAgICB0aHJvdyBuZXcgT3BlcmF0aW9uQWJvcnRlZEVycm9yKCdhYm9ydGVkJylcblxuICAjIENvdW50XG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBjb3VudDogbnVsbFxuICBkZWZhdWx0Q291bnQ6IDFcbiAgZ2V0Q291bnQ6IChvZmZzZXQ9MCkgLT5cbiAgICBAY291bnQgPz0gQHZpbVN0YXRlLmdldENvdW50KCkgPyBAZGVmYXVsdENvdW50XG4gICAgQGNvdW50ICsgb2Zmc2V0XG5cbiAgcmVzZXRDb3VudDogLT5cbiAgICBAY291bnQgPSBudWxsXG5cbiAgaXNEZWZhdWx0Q291bnQ6IC0+XG4gICAgQGNvdW50IGlzIEBkZWZhdWx0Q291bnRcblxuICAjIE1pc2NcbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIGNvdW50VGltZXM6IChsYXN0LCBmbikgLT5cbiAgICByZXR1cm4gaWYgbGFzdCA8IDFcblxuICAgIHN0b3BwZWQgPSBmYWxzZVxuICAgIHN0b3AgPSAtPiBzdG9wcGVkID0gdHJ1ZVxuICAgIGZvciBjb3VudCBpbiBbMS4ubGFzdF1cbiAgICAgIGlzRmluYWwgPSBjb3VudCBpcyBsYXN0XG4gICAgICBmbih7Y291bnQsIGlzRmluYWwsIHN0b3B9KVxuICAgICAgYnJlYWsgaWYgc3RvcHBlZFxuXG4gIGFjdGl2YXRlTW9kZTogKG1vZGUsIHN1Ym1vZGUpIC0+XG4gICAgQG9uRGlkRmluaXNoT3BlcmF0aW9uID0+XG4gICAgICBAdmltU3RhdGUuYWN0aXZhdGUobW9kZSwgc3VibW9kZSlcblxuICBhY3RpdmF0ZU1vZGVJZk5lY2Vzc2FyeTogKG1vZGUsIHN1Ym1vZGUpIC0+XG4gICAgdW5sZXNzIEB2aW1TdGF0ZS5pc01vZGUobW9kZSwgc3VibW9kZSlcbiAgICAgIEBhY3RpdmF0ZU1vZGUobW9kZSwgc3VibW9kZSlcblxuICBuZXc6IChuYW1lLCBwcm9wZXJ0aWVzKSAtPlxuICAgIGtsYXNzID0gQmFzZS5nZXRDbGFzcyhuYW1lKVxuICAgIG5ldyBrbGFzcyhAdmltU3RhdGUsIHByb3BlcnRpZXMpXG5cbiAgbmV3SW5wdXRVSTogLT5cbiAgICBuZXcgSW5wdXQoQHZpbVN0YXRlKVxuXG4gICMgRklYTUU6IFRoaXMgaXMgdXNlZCB0byBjbG9uZSBNb3Rpb246OlNlYXJjaCB0byBzdXBwb3J0IGBuYCBhbmQgYE5gXG4gICMgQnV0IG1hbnVhbCByZXNldGluZyBhbmQgb3ZlcnJpZGluZyBwcm9wZXJ0eSBpcyBidWcgcHJvbmUuXG4gICMgU2hvdWxkIGV4dHJhY3QgYXMgc2VhcmNoIHNwZWMgb2JqZWN0IGFuZCB1c2UgaXQgYnlcbiAgIyBjcmVhdGluZyBjbGVhbiBpbnN0YW5jZSBvZiBTZWFyY2guXG4gIGNsb25lOiAodmltU3RhdGUpIC0+XG4gICAgcHJvcGVydGllcyA9IHt9XG4gICAgZXhjbHVkZVByb3BlcnRpZXMgPSBbJ2VkaXRvcicsICdlZGl0b3JFbGVtZW50JywgJ2dsb2JhbFN0YXRlJywgJ3ZpbVN0YXRlJywgJ29wZXJhdG9yJ11cbiAgICBmb3Igb3duIGtleSwgdmFsdWUgb2YgdGhpcyB3aGVuIGtleSBub3QgaW4gZXhjbHVkZVByb3BlcnRpZXNcbiAgICAgIHByb3BlcnRpZXNba2V5XSA9IHZhbHVlXG4gICAga2xhc3MgPSB0aGlzLmNvbnN0cnVjdG9yXG4gICAgbmV3IGtsYXNzKHZpbVN0YXRlLCBwcm9wZXJ0aWVzKVxuXG4gIGNhbmNlbE9wZXJhdGlvbjogLT5cbiAgICBAdmltU3RhdGUub3BlcmF0aW9uU3RhY2suY2FuY2VsKClcblxuICBwcm9jZXNzT3BlcmF0aW9uOiAtPlxuICAgIEB2aW1TdGF0ZS5vcGVyYXRpb25TdGFjay5wcm9jZXNzKClcblxuICBmb2N1c1NlbGVjdExpc3Q6IChvcHRpb25zPXt9KSAtPlxuICAgIEBvbkRpZENhbmNlbFNlbGVjdExpc3QgPT5cbiAgICAgIEBjYW5jZWxPcGVyYXRpb24oKVxuICAgIHNlbGVjdExpc3QgPz0gcmVxdWlyZSAnLi9zZWxlY3QtbGlzdCdcbiAgICBzZWxlY3RMaXN0LnNob3coQHZpbVN0YXRlLCBvcHRpb25zKVxuXG4gIGlucHV0OiBudWxsXG4gIGZvY3VzSW5wdXQ6IChjaGFyc01heCwgaGlkZUN1cnNvcikgLT5cbiAgICBpbnB1dFVJID0gQG5ld0lucHV0VUkoKVxuICAgIGlucHV0VUkub25EaWRDb25maXJtIChpbnB1dCkgPT5cbiAgICAgIEBpbnB1dCA9IGlucHV0XG4gICAgICBAcHJvY2Vzc09wZXJhdGlvbigpXG5cbiAgICBpZiBjaGFyc01heCA+IDFcbiAgICAgIGlucHV0VUkub25EaWRDaGFuZ2UgKGlucHV0KSA9PlxuICAgICAgICBAdmltU3RhdGUuaG92ZXIuc2V0KGlucHV0KVxuXG4gICAgaW5wdXRVSS5vbkRpZENhbmNlbChAY2FuY2VsT3BlcmF0aW9uLmJpbmQodGhpcykpXG4gICAgaW5wdXRVSS5mb2N1cyhjaGFyc01heCwgaGlkZUN1cnNvcilcblxuICBnZXRWaW1Fb2ZCdWZmZXJQb3NpdGlvbjogLT5cbiAgICBnZXRWaW1Fb2ZCdWZmZXJQb3NpdGlvbihAZWRpdG9yKVxuXG4gIGdldFZpbUxhc3RCdWZmZXJSb3c6IC0+XG4gICAgZ2V0VmltTGFzdEJ1ZmZlclJvdyhAZWRpdG9yKVxuXG4gIGdldFZpbUxhc3RTY3JlZW5Sb3c6IC0+XG4gICAgZ2V0VmltTGFzdFNjcmVlblJvdyhAZWRpdG9yKVxuXG4gIGdldFdvcmRCdWZmZXJSYW5nZUFuZEtpbmRBdEJ1ZmZlclBvc2l0aW9uOiAocG9pbnQsIG9wdGlvbnMpIC0+XG4gICAgZ2V0V29yZEJ1ZmZlclJhbmdlQW5kS2luZEF0QnVmZmVyUG9zaXRpb24oQGVkaXRvciwgcG9pbnQsIG9wdGlvbnMpXG5cbiAgZ2V0Rmlyc3RDaGFyYWN0ZXJQb3NpdGlvbkZvckJ1ZmZlclJvdzogKHJvdykgLT5cbiAgICBnZXRGaXJzdENoYXJhY3RlclBvc2l0aW9uRm9yQnVmZmVyUm93KEBlZGl0b3IsIHJvdylcblxuICBnZXRCdWZmZXJSYW5nZUZvclJvd1JhbmdlOiAocm93UmFuZ2UpIC0+XG4gICAgZ2V0QnVmZmVyUmFuZ2VGb3JSb3dSYW5nZShAZWRpdG9yLCByb3dSYW5nZSlcblxuICBnZXRJbmRlbnRMZXZlbEZvckJ1ZmZlclJvdzogKHJvdykgLT5cbiAgICBnZXRJbmRlbnRMZXZlbEZvckJ1ZmZlclJvdyhAZWRpdG9yLCByb3cpXG5cbiAgc2NhbkZvcndhcmQ6IChhcmdzLi4uKSAtPlxuICAgIHNjYW5FZGl0b3JJbkRpcmVjdGlvbihAZWRpdG9yLCAnZm9yd2FyZCcsIGFyZ3MuLi4pXG5cbiAgc2NhbkJhY2t3YXJkOiAoYXJncy4uLikgLT5cbiAgICBzY2FuRWRpdG9ySW5EaXJlY3Rpb24oQGVkaXRvciwgJ2JhY2t3YXJkJywgYXJncy4uLilcblxuICBpbnN0YW5jZW9mOiAoa2xhc3NOYW1lKSAtPlxuICAgIHRoaXMgaW5zdGFuY2VvZiBCYXNlLmdldENsYXNzKGtsYXNzTmFtZSlcblxuICBpczogKGtsYXNzTmFtZSkgLT5cbiAgICB0aGlzLmNvbnN0cnVjdG9yIGlzIEJhc2UuZ2V0Q2xhc3Moa2xhc3NOYW1lKVxuXG4gIGlzT3BlcmF0b3I6IC0+XG4gICAgQGluc3RhbmNlb2YoJ09wZXJhdG9yJylcblxuICBpc01vdGlvbjogLT5cbiAgICBAaW5zdGFuY2VvZignTW90aW9uJylcblxuICBpc1RleHRPYmplY3Q6IC0+XG4gICAgQGluc3RhbmNlb2YoJ1RleHRPYmplY3QnKVxuXG4gIGdldEN1cnNvckJ1ZmZlclBvc2l0aW9uOiAtPlxuICAgIGlmIEBtb2RlIGlzICd2aXN1YWwnXG4gICAgICBAZ2V0Q3Vyc29yUG9zaXRpb25Gb3JTZWxlY3Rpb24oQGVkaXRvci5nZXRMYXN0U2VsZWN0aW9uKCkpXG4gICAgZWxzZVxuICAgICAgQGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpXG5cbiAgZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb25zOiAtPlxuICAgIGlmIEBtb2RlIGlzICd2aXN1YWwnXG4gICAgICBAZWRpdG9yLmdldFNlbGVjdGlvbnMoKS5tYXAoQGdldEN1cnNvclBvc2l0aW9uRm9yU2VsZWN0aW9uLmJpbmQodGhpcykpXG4gICAgZWxzZVxuICAgICAgQGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbnMoKVxuXG4gIGdldEJ1ZmZlclBvc2l0aW9uRm9yQ3Vyc29yOiAoY3Vyc29yKSAtPlxuICAgIGlmIEBtb2RlIGlzICd2aXN1YWwnXG4gICAgICBAZ2V0Q3Vyc29yUG9zaXRpb25Gb3JTZWxlY3Rpb24oY3Vyc29yLnNlbGVjdGlvbilcbiAgICBlbHNlXG4gICAgICBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuXG4gIGdldEN1cnNvclBvc2l0aW9uRm9yU2VsZWN0aW9uOiAoc2VsZWN0aW9uKSAtPlxuICAgIHN3cmFwKHNlbGVjdGlvbikuZ2V0QnVmZmVyUG9zaXRpb25Gb3IoJ2hlYWQnLCBmcm9tOiBbJ3Byb3BlcnR5JywgJ3NlbGVjdGlvbiddKVxuXG4gIHRvU3RyaW5nOiAtPlxuICAgIHN0ciA9IEBuYW1lXG4gICAgaWYgQHRhcmdldD9cbiAgICAgIHN0ciArPSBcIiwgdGFyZ2V0PSN7QHRhcmdldC5uYW1lfSwgdGFyZ2V0Lndpc2U9I3tAdGFyZ2V0Lndpc2V9IFwiXG4gICAgZWxzZSBpZiBAb3BlcmF0b3I/XG4gICAgICBzdHIgKz0gXCIsIHdpc2U9I3tAd2lzZX0gLCBvcGVyYXRvcj0je0BvcGVyYXRvci5uYW1lfVwiXG4gICAgZWxzZVxuICAgICAgc3RyXG5cbiAgIyBDbGFzcyBtZXRob2RzXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBAaW5pdDogKHNlcnZpY2UpIC0+XG4gICAge2dldEVkaXRvclN0YXRlfSA9IHNlcnZpY2VcbiAgICBAc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcblxuICAgIFtcbiAgICAgICcuL29wZXJhdG9yJywgJy4vb3BlcmF0b3ItaW5zZXJ0JywgJy4vb3BlcmF0b3ItdHJhbnNmb3JtLXN0cmluZycsXG4gICAgICAnLi9tb3Rpb24nLCAnLi9tb3Rpb24tc2VhcmNoJywgJy4vdGV4dC1vYmplY3QnLCAnLi9taXNjLWNvbW1hbmQnXG4gICAgXS5mb3JFYWNoKHJlcXVpcmUpXG5cbiAgICBmb3IgX18sIGtsYXNzIG9mIEBnZXRSZWdpc3RyaWVzKCkgd2hlbiBrbGFzcy5pc0NvbW1hbmQoKVxuICAgICAgQHN1YnNjcmlwdGlvbnMuYWRkKGtsYXNzLnJlZ2lzdGVyQ29tbWFuZCgpKVxuICAgIEBzdWJzY3JpcHRpb25zXG5cbiAgIyBGb3IgZGV2ZWxvcG1lbnQgZWFzaW5lc3Mgd2l0aG91dCByZWxvYWRpbmcgdmltLW1vZGUtcGx1c1xuICBAcmVzZXQ6IC0+XG4gICAgQHN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG4gICAgQHN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG4gICAgZm9yIF9fLCBrbGFzcyBvZiBAZ2V0UmVnaXN0cmllcygpIHdoZW4ga2xhc3MuaXNDb21tYW5kKClcbiAgICAgIEBzdWJzY3JpcHRpb25zLmFkZChrbGFzcy5yZWdpc3RlckNvbW1hbmQoKSlcblxuICByZWdpc3RyaWVzID0ge0Jhc2V9XG4gIEBleHRlbmQ6IChAY29tbWFuZD10cnVlKSAtPlxuICAgIGlmIChAbmFtZSBvZiByZWdpc3RyaWVzKSBhbmQgKG5vdCBAc3VwcHJlc3NXYXJuaW5nKVxuICAgICAgY29uc29sZS53YXJuKFwiRHVwbGljYXRlIGNvbnN0cnVjdG9yICN7QG5hbWV9XCIpXG4gICAgcmVnaXN0cmllc1tAbmFtZV0gPSB0aGlzXG5cbiAgQGdldENsYXNzOiAobmFtZSkgLT5cbiAgICBpZiAoa2xhc3MgPSByZWdpc3RyaWVzW25hbWVdKT9cbiAgICAgIGtsYXNzXG4gICAgZWxzZVxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiY2xhc3MgJyN7bmFtZX0nIG5vdCBmb3VuZFwiKVxuXG4gIEBnZXRSZWdpc3RyaWVzOiAtPlxuICAgIHJlZ2lzdHJpZXNcblxuICBAaXNDb21tYW5kOiAtPlxuICAgIEBjb21tYW5kXG5cbiAgQGNvbW1hbmRQcmVmaXg6ICd2aW0tbW9kZS1wbHVzJ1xuICBAZ2V0Q29tbWFuZE5hbWU6IC0+XG4gICAgQGNvbW1hbmRQcmVmaXggKyAnOicgKyBfLmRhc2hlcml6ZShAbmFtZSlcblxuICBAZ2V0Q29tbWFuZE5hbWVXaXRob3V0UHJlZml4OiAtPlxuICAgIF8uZGFzaGVyaXplKEBuYW1lKVxuXG4gIEBjb21tYW5kU2NvcGU6ICdhdG9tLXRleHQtZWRpdG9yJ1xuICBAZ2V0Q29tbWFuZFNjb3BlOiAtPlxuICAgIEBjb21tYW5kU2NvcGVcblxuICBAZ2V0RGVzY3RpcHRpb246IC0+XG4gICAgaWYgQGhhc093blByb3BlcnR5KFwiZGVzY3JpcHRpb25cIilcbiAgICAgIEBkZXNjcmlwdGlvblxuICAgIGVsc2VcbiAgICAgIG51bGxcblxuICBAcmVnaXN0ZXJDb21tYW5kOiAtPlxuICAgIGtsYXNzID0gdGhpc1xuICAgIGF0b20uY29tbWFuZHMuYWRkIEBnZXRDb21tYW5kU2NvcGUoKSwgQGdldENvbW1hbmROYW1lKCksIChldmVudCkgLT5cbiAgICAgIHZpbVN0YXRlID0gZ2V0RWRpdG9yU3RhdGUoQGdldE1vZGVsKCkpID8gZ2V0RWRpdG9yU3RhdGUoYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpKVxuICAgICAgaWYgdmltU3RhdGU/ICMgUG9zc2libHkgdW5kZWZpbmVkIFNlZSAjODVcbiAgICAgICAgdmltU3RhdGUuX2V2ZW50ID0gZXZlbnRcbiAgICAgICAgdmltU3RhdGUub3BlcmF0aW9uU3RhY2sucnVuKGtsYXNzKVxuICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcblxuICAjIEZvciBkZW1vLW1vZGUgcGtnIGludGVncmF0aW9uXG4gIEBvcGVyYXRpb25LaW5kOiBudWxsXG4gIEBnZXRLaW5kRm9yQ29tbWFuZE5hbWU6IChjb21tYW5kKSAtPlxuICAgIG5hbWUgPSBfLmNhcGl0YWxpemUoXy5jYW1lbGl6ZShjb21tYW5kKSlcbiAgICBpZiBuYW1lIG9mIHJlZ2lzdHJpZXNcbiAgICAgIHJlZ2lzdHJpZXNbbmFtZV0ub3BlcmF0aW9uS2luZFxuXG5tb2R1bGUuZXhwb3J0cyA9IEJhc2VcbiJdfQ==
