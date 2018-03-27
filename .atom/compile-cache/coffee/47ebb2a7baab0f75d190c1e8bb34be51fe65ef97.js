(function() {
  var Base, CompositeDisposable, Disposable, MoveToRelativeLine, OperationAbortedError, OperationStack, Select, assertWithException, haveSomeNonEmptySelection, moveCursorLeft, ref, ref1, ref2, swrap;

  ref = require('atom'), Disposable = ref.Disposable, CompositeDisposable = ref.CompositeDisposable;

  Base = require('./base');

  ref1 = require('./utils'), moveCursorLeft = ref1.moveCursorLeft, haveSomeNonEmptySelection = ref1.haveSomeNonEmptySelection, assertWithException = ref1.assertWithException;

  ref2 = {}, Select = ref2.Select, MoveToRelativeLine = ref2.MoveToRelativeLine;

  OperationAbortedError = require('./errors').OperationAbortedError;

  swrap = require('./selection-wrapper');

  OperationStack = (function() {
    Object.defineProperty(OperationStack.prototype, 'mode', {
      get: function() {
        return this.modeManager.mode;
      }
    });

    Object.defineProperty(OperationStack.prototype, 'submode', {
      get: function() {
        return this.modeManager.submode;
      }
    });

    function OperationStack(vimState) {
      var ref3;
      this.vimState = vimState;
      ref3 = this.vimState, this.editor = ref3.editor, this.editorElement = ref3.editorElement, this.modeManager = ref3.modeManager;
      this.subscriptions = new CompositeDisposable;
      this.subscriptions.add(this.vimState.onDidDestroy(this.destroy.bind(this)));
      if (Select == null) {
        Select = Base.getClass('Select');
      }
      if (MoveToRelativeLine == null) {
        MoveToRelativeLine = Base.getClass('MoveToRelativeLine');
      }
      this.reset();
    }

    OperationStack.prototype.subscribe = function(handler) {
      this.operationSubscriptions.add(handler);
      return handler;
    };

    OperationStack.prototype.reset = function() {
      var ref3;
      this.resetCount();
      this.stack = [];
      this.processing = false;
      this.vimState.emitDidResetOperationStack();
      if ((ref3 = this.operationSubscriptions) != null) {
        ref3.dispose();
      }
      return this.operationSubscriptions = new CompositeDisposable;
    };

    OperationStack.prototype.destroy = function() {
      var ref3, ref4;
      this.subscriptions.dispose();
      if ((ref3 = this.operationSubscriptions) != null) {
        ref3.dispose();
      }
      return ref4 = {}, this.stack = ref4.stack, this.operationSubscriptions = ref4.operationSubscriptions, ref4;
    };

    OperationStack.prototype.peekTop = function() {
      return this.stack[this.stack.length - 1];
    };

    OperationStack.prototype.isEmpty = function() {
      return this.stack.length === 0;
    };

    OperationStack.prototype.run = function(klass, properties) {
      var $selection, error, i, len, operation, ref3, ref4, type;
      if (this.mode === 'visual') {
        ref3 = swrap.getSelections(this.editor);
        for (i = 0, len = ref3.length; i < len; i++) {
          $selection = ref3[i];
          if (!$selection.hasProperties()) {
            $selection.saveProperties();
          }
        }
      }
      try {
        if (this.isEmpty()) {
          this.vimState.init();
        }
        type = typeof klass;
        if (type === 'object') {
          operation = klass;
        } else {
          if (type === 'string') {
            klass = Base.getClass(klass);
          }
          if (((ref4 = this.peekTop()) != null ? ref4.constructor : void 0) === klass) {
            operation = new MoveToRelativeLine(this.vimState);
          } else {
            operation = new klass(this.vimState, properties);
          }
        }
        switch (false) {
          case !this.isEmpty():
            if ((this.mode === 'visual' && operation.isMotion()) || operation.isTextObject()) {
              operation = new Select(this.vimState).setTarget(operation);
            }
            this.stack.push(operation);
            return this.process();
          case !(this.peekTop().isOperator() && (operation.isMotion() || operation.isTextObject())):
            this.stack.push(operation);
            return this.process();
          default:
            this.vimState.emitDidFailToPushToOperationStack();
            return this.vimState.resetNormalMode();
        }
      } catch (error1) {
        error = error1;
        return this.handleError(error);
      }
    };

    OperationStack.prototype.runRecorded = function() {
      var count, operation, ref3;
      if (operation = this.recordedOperation) {
        operation.repeated = true;
        if (this.hasCount()) {
          count = this.getCount();
          operation.count = count;
          if ((ref3 = operation.target) != null) {
            ref3.count = count;
          }
        }
        operation.subscribeResetOccurrencePatternIfNeeded();
        return this.run(operation);
      }
    };

    OperationStack.prototype.runRecordedMotion = function(key, arg) {
      var operation, reverse;
      reverse = (arg != null ? arg : {}).reverse;
      if (!(operation = this.vimState.globalState.get(key))) {
        return;
      }
      operation = operation.clone(this.vimState);
      operation.repeated = true;
      operation.resetCount();
      if (reverse) {
        operation.backwards = !operation.backwards;
      }
      return this.run(operation);
    };

    OperationStack.prototype.runCurrentFind = function(options) {
      return this.runRecordedMotion('currentFind', options);
    };

    OperationStack.prototype.runCurrentSearch = function(options) {
      return this.runRecordedMotion('currentSearch', options);
    };

    OperationStack.prototype.handleError = function(error) {
      this.vimState.reset();
      if (!(error instanceof OperationAbortedError)) {
        throw error;
      }
    };

    OperationStack.prototype.isProcessing = function() {
      return this.processing;
    };

    OperationStack.prototype.process = function() {
      var base, commandName, operation, top;
      this.processing = true;
      if (this.stack.length === 2) {
        if (!this.peekTop().isComplete()) {
          return;
        }
        operation = this.stack.pop();
        this.peekTop().setTarget(operation);
      }
      top = this.peekTop();
      if (top.isComplete()) {
        return this.execute(this.stack.pop());
      } else {
        if (this.mode === 'normal' && top.isOperator()) {
          this.modeManager.activate('operator-pending');
        }
        if (commandName = typeof (base = top.constructor).getCommandNameWithoutPrefix === "function" ? base.getCommandNameWithoutPrefix() : void 0) {
          return this.addToClassList(commandName + "-pending");
        }
      }
    };

    OperationStack.prototype.execute = function(operation) {
      var execution;
      execution = operation.execute();
      if (execution instanceof Promise) {
        return execution.then((function(_this) {
          return function() {
            return _this.finish(operation);
          };
        })(this))["catch"]((function(_this) {
          return function() {
            return _this.handleError();
          };
        })(this));
      } else {
        return this.finish(operation);
      }
    };

    OperationStack.prototype.cancel = function() {
      var ref3;
      if ((ref3 = this.mode) !== 'visual' && ref3 !== 'insert') {
        this.vimState.resetNormalMode();
        this.vimState.restoreOriginalCursorPosition();
      }
      return this.finish();
    };

    OperationStack.prototype.finish = function(operation) {
      if (operation == null) {
        operation = null;
      }
      if (operation != null ? operation.recordable : void 0) {
        this.recordedOperation = operation;
      }
      this.vimState.emitDidFinishOperation();
      if (operation != null ? operation.isOperator() : void 0) {
        operation.resetState();
      }
      if (this.mode === 'normal') {
        this.ensureAllSelectionsAreEmpty(operation);
        this.ensureAllCursorsAreNotAtEndOfLine();
      } else if (this.mode === 'visual') {
        this.modeManager.updateNarrowedState();
        this.vimState.updatePreviousSelection();
      }
      this.vimState.updateCursorsVisibility();
      return this.vimState.reset();
    };

    OperationStack.prototype.ensureAllSelectionsAreEmpty = function(operation) {
      this.vimState.clearBlockwiseSelections();
      if (haveSomeNonEmptySelection(this.editor)) {
        if (this.vimState.getConfig('strictAssertion')) {
          assertWithException(false, "Have some non-empty selection in normal-mode: " + (operation.toString()));
        }
        return this.vimState.clearSelections();
      }
    };

    OperationStack.prototype.ensureAllCursorsAreNotAtEndOfLine = function() {
      var cursor, i, len, ref3, results;
      ref3 = this.editor.getCursors();
      results = [];
      for (i = 0, len = ref3.length; i < len; i++) {
        cursor = ref3[i];
        if (cursor.isAtEndOfLine()) {
          results.push(moveCursorLeft(cursor, {
            preserveGoalColumn: true
          }));
        }
      }
      return results;
    };

    OperationStack.prototype.addToClassList = function(className) {
      this.editorElement.classList.add(className);
      return this.subscribe(new Disposable((function(_this) {
        return function() {
          return _this.editorElement.classList.remove(className);
        };
      })(this)));
    };

    OperationStack.prototype.hasCount = function() {
      return (this.count['normal'] != null) || (this.count['operator-pending'] != null);
    };

    OperationStack.prototype.getCount = function() {
      var ref3, ref4;
      if (this.hasCount()) {
        return ((ref3 = this.count['normal']) != null ? ref3 : 1) * ((ref4 = this.count['operator-pending']) != null ? ref4 : 1);
      } else {
        return null;
      }
    };

    OperationStack.prototype.setCount = function(number) {
      var base, mode;
      mode = 'normal';
      if (this.mode === 'operator-pending') {
        mode = this.mode;
      }
      if ((base = this.count)[mode] == null) {
        base[mode] = 0;
      }
      this.count[mode] = (this.count[mode] * 10) + number;
      this.vimState.hover.set(this.buildCountString());
      return this.vimState.toggleClassList('with-count', true);
    };

    OperationStack.prototype.buildCountString = function() {
      return [this.count['normal'], this.count['operator-pending']].filter(function(count) {
        return count != null;
      }).map(function(count) {
        return String(count);
      }).join('x');
    };

    OperationStack.prototype.resetCount = function() {
      this.count = {};
      return this.vimState.toggleClassList('with-count', false);
    };

    return OperationStack;

  })();

  module.exports = OperationStack;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvb3BlcmF0aW9uLXN0YWNrLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsTUFBb0MsT0FBQSxDQUFRLE1BQVIsQ0FBcEMsRUFBQywyQkFBRCxFQUFhOztFQUNiLElBQUEsR0FBTyxPQUFBLENBQVEsUUFBUjs7RUFDUCxPQUFtRSxPQUFBLENBQVEsU0FBUixDQUFuRSxFQUFDLG9DQUFELEVBQWlCLDBEQUFqQixFQUE0Qzs7RUFDNUMsT0FBK0IsRUFBL0IsRUFBQyxvQkFBRCxFQUFTOztFQUNSLHdCQUF5QixPQUFBLENBQVEsVUFBUjs7RUFDMUIsS0FBQSxHQUFRLE9BQUEsQ0FBUSxxQkFBUjs7RUFZRjtJQUNKLE1BQU0sQ0FBQyxjQUFQLENBQXNCLGNBQUMsQ0FBQSxTQUF2QixFQUFrQyxNQUFsQyxFQUEwQztNQUFBLEdBQUEsRUFBSyxTQUFBO2VBQUcsSUFBQyxDQUFBLFdBQVcsQ0FBQztNQUFoQixDQUFMO0tBQTFDOztJQUNBLE1BQU0sQ0FBQyxjQUFQLENBQXNCLGNBQUMsQ0FBQSxTQUF2QixFQUFrQyxTQUFsQyxFQUE2QztNQUFBLEdBQUEsRUFBSyxTQUFBO2VBQUcsSUFBQyxDQUFBLFdBQVcsQ0FBQztNQUFoQixDQUFMO0tBQTdDOztJQUVhLHdCQUFDLFFBQUQ7QUFDWCxVQUFBO01BRFksSUFBQyxDQUFBLFdBQUQ7TUFDWixPQUEwQyxJQUFDLENBQUEsUUFBM0MsRUFBQyxJQUFDLENBQUEsY0FBQSxNQUFGLEVBQVUsSUFBQyxDQUFBLHFCQUFBLGFBQVgsRUFBMEIsSUFBQyxDQUFBLG1CQUFBO01BRTNCLElBQUMsQ0FBQSxhQUFELEdBQWlCLElBQUk7TUFDckIsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUMsQ0FBQSxRQUFRLENBQUMsWUFB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O0lBRlU7Ozs7OztFQUlkLE1BQU0sQ0FBQyxPQUFQLEdBQWlCO0FBNU9qQiIsInNvdXJjZXNDb250ZW50IjpbIntEaXNwb3NhYmxlLCBDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2F0b20nXG5CYXNlID0gcmVxdWlyZSAnLi9iYXNlJ1xue21vdmVDdXJzb3JMZWZ0LCBoYXZlU29tZU5vbkVtcHR5U2VsZWN0aW9uLCBhc3NlcnRXaXRoRXhjZXB0aW9ufSA9IHJlcXVpcmUgJy4vdXRpbHMnXG57U2VsZWN0LCBNb3ZlVG9SZWxhdGl2ZUxpbmV9ID0ge31cbntPcGVyYXRpb25BYm9ydGVkRXJyb3J9ID0gcmVxdWlyZSAnLi9lcnJvcnMnXG5zd3JhcCA9IHJlcXVpcmUgJy4vc2VsZWN0aW9uLXdyYXBwZXInXG5cbiMgb3ByYXRpb24gbGlmZSBpbiBvcGVyYXRpb25TdGFja1xuIyAxLiBydW5cbiMgICAgaW5zdGFudGlhdGVkIGJ5IG5ldy5cbiMgICAgY29tcGxpbWVudCBpbXBsaWNpdCBPcGVyYXRvci5TZWxlY3Qgb3BlcmF0b3IgaWYgbmVjZXNzYXJ5LlxuIyAgICBwdXNoIG9wZXJhdGlvbiB0byBzdGFjay5cbiMgMi4gcHJvY2Vzc1xuIyAgICByZWR1Y2Ugc3RhY2sgYnksIHBvcHBpbmcgdG9wIG9mIHN0YWNrIHRoZW4gc2V0IGl0IGFzIHRhcmdldCBvZiBuZXcgdG9wLlxuIyAgICBjaGVjayBpZiByZW1haW5pbmcgdG9wIG9mIHN0YWNrIGlzIGV4ZWN1dGFibGUgYnkgY2FsbGluZyBpc0NvbXBsZXRlKClcbiMgICAgaWYgZXhlY3V0YWJsZSwgdGhlbiBwb3Agc3RhY2sgdGhlbiBleGVjdXRlKHBvcHBlZE9wZXJhdGlvbilcbiMgICAgaWYgbm90IGV4ZWN1dGFibGUsIGVudGVyIFwib3BlcmF0b3ItcGVuZGluZy1tb2RlXCJcbmNsYXNzIE9wZXJhdGlvblN0YWNrXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSBAcHJvdG90eXBlLCAnbW9kZScsIGdldDogLT4gQG1vZGVNYW5hZ2VyLm1vZGVcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5IEBwcm90b3R5cGUsICdzdWJtb2RlJywgZ2V0OiAtPiBAbW9kZU1hbmFnZXIuc3VibW9kZVxuXG4gIGNvbnN0cnVjdG9yOiAoQHZpbVN0YXRlKSAtPlxuICAgIHtAZWRpdG9yLCBAZWRpdG9yRWxlbWVudCwgQG1vZGVNYW5hZ2VyfSA9IEB2aW1TdGF0ZVxuXG4gICAgQHN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBAdmltU3RhdGUub25EaWREZXN0cm95KEBkZXN0cm95LmJpbmQodGhpcykpXG5cbiAgICBTZWxlY3QgPz0gQmFzZS5nZXRDbGFzcygnU2VsZWN0JylcbiAgICBNb3ZlVG9SZWxhdGl2ZUxpbmUgPz0gQmFzZS5nZXRDbGFzcygnTW92ZVRvUmVsYXRpdmVMaW5lJylcblxuICAgIEByZXNldCgpXG5cbiAgIyBSZXR1cm4gaGFuZGxlclxuICBzdWJzY3JpYmU6IChoYW5kbGVyKSAtPlxuICAgIEBvcGVyYXRpb25TdWJzY3JpcHRpb25zLmFkZChoYW5kbGVyKVxuICAgIHJldHVybiBoYW5kbGVyICMgRE9OVCBSRU1PVkVcblxuICByZXNldDogLT5cbiAgICBAcmVzZXRDb3VudCgpXG4gICAgQHN0YWNrID0gW11cbiAgICBAcHJvY2Vzc2luZyA9IGZhbHNlXG5cbiAgICAjIHRoaXMgaGFzIHRvIGJlIEJFRk9SRSBAb3BlcmF0aW9uU3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiAgICBAdmltU3RhdGUuZW1pdERpZFJlc2V0T3BlcmF0aW9uU3RhY2soKVxuXG4gICAgQG9wZXJhdGlvblN1YnNjcmlwdGlvbnM/LmRpc3Bvc2UoKVxuICAgIEBvcGVyYXRpb25TdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcblxuICBkZXN0cm95OiAtPlxuICAgIEBzdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICAgIEBvcGVyYXRpb25TdWJzY3JpcHRpb25zPy5kaXNwb3NlKClcbiAgICB7QHN0YWNrLCBAb3BlcmF0aW9uU3Vic2NyaXB0aW9uc30gPSB7fVxuXG4gIHBlZWtUb3A6IC0+XG4gICAgQHN0YWNrW0BzdGFjay5sZW5ndGggLSAxXVxuXG4gIGlzRW1wdHk6IC0+XG4gICAgQHN0YWNrLmxlbmd0aCBpcyAwXG5cbiAgIyBNYWluXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBydW46IChrbGFzcywgcHJvcGVydGllcykgLT5cbiAgICBpZiBAbW9kZSBpcyAndmlzdWFsJ1xuICAgICAgZm9yICRzZWxlY3Rpb24gaW4gc3dyYXAuZ2V0U2VsZWN0aW9ucyhAZWRpdG9yKSB3aGVuIG5vdCAkc2VsZWN0aW9uLmhhc1Byb3BlcnRpZXMoKVxuICAgICAgICAkc2VsZWN0aW9uLnNhdmVQcm9wZXJ0aWVzKClcblxuICAgIHRyeVxuICAgICAgQHZpbVN0YXRlLmluaXQoKSBpZiBAaXNFbXB0eSgpXG4gICAgICB0eXBlID0gdHlwZW9mKGtsYXNzKVxuICAgICAgaWYgdHlwZSBpcyAnb2JqZWN0JyAjIC4gcmVwZWF0IGNhc2Ugd2UgY2FuIGV4ZWN1dGUgYXMtaXQtaXMuXG4gICAgICAgIG9wZXJhdGlvbiA9IGtsYXNzXG4gICAgICBlbHNlXG4gICAgICAgIGtsYXNzID0gQmFzZS5nZXRDbGFzcyhrbGFzcykgaWYgdHlwZSBpcyAnc3RyaW5nJ1xuICAgICAgICAjIFJlcGxhY2Ugb3BlcmF0b3Igd2hlbiBpZGVudGljYWwgb25lIHJlcGVhdGVkLCBlLmcuIGBkZGAsIGBjY2AsIGBnVWdVYFxuICAgICAgICBpZiBAcGVla1RvcCgpPy5jb25zdHJ1Y3RvciBpcyBrbGFzc1xuICAgICAgICAgIG9wZXJhdGlvbiA9IG5ldyBNb3ZlVG9SZWxhdGl2ZUxpbmUoQHZpbVN0YXRlKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgb3BlcmF0aW9uID0gbmV3IGtsYXNzKEB2aW1TdGF0ZSwgcHJvcGVydGllcylcblxuICAgICAgc3dpdGNoXG4gICAgICAgIHdoZW4gQGlzRW1wdHkoKVxuICAgICAgICAgIGlmIChAbW9kZSBpcyAndmlzdWFsJyBhbmQgb3BlcmF0aW9uLmlzTW90aW9uKCkpIG9yIG9wZXJhdGlvbi5pc1RleHRPYmplY3QoKVxuICAgICAgICAgICAgb3BlcmF0aW9uID0gbmV3IFNlbGVjdChAdmltU3RhdGUpLnNldFRhcmdldChvcGVyYXRpb24pXG4gICAgICAgICAgQHN0YWNrLnB1c2gob3BlcmF0aW9uKVxuICAgICAgICAgIEBwcm9jZXNzKClcbiAgICAgICAgd2hlbiBAcGVla1RvcCgpLmlzT3BlcmF0b3IoKSBhbmQgKG9wZXJhdGlvbi5pc01vdGlvbigpIG9yIG9wZXJhdGlvbi5pc1RleHRPYmplY3QoKSlcbiAgICAgICAgICBAc3RhY2sucHVzaChvcGVyYXRpb24pXG4gICAgICAgICAgQHByb2Nlc3MoKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgQHZpbVN0YXRlLmVtaXREaWRGYWlsVG9QdXNoVG9PcGVyYXRpb25TdGFjaygpXG4gICAgICAgICAgQHZpbVN0YXRlLnJlc2V0Tm9ybWFsTW9kZSgpXG4gICAgY2F0Y2ggZXJyb3JcbiAgICAgIEBoYW5kbGVFcnJvcihlcnJvcilcblxuICBydW5SZWNvcmRlZDogLT5cbiAgICBpZiBvcGVyYXRpb24gPSBAcmVjb3JkZWRPcGVyYXRpb25cbiAgICAgIG9wZXJhdGlvbi5yZXBlYXRlZCA9IHRydWVcbiAgICAgIGlmIEBoYXNDb3VudCgpXG4gICAgICAgIGNvdW50ID0gQGdldENvdW50KClcbiAgICAgICAgb3BlcmF0aW9uLmNvdW50ID0gY291bnRcbiAgICAgICAgb3BlcmF0aW9uLnRhcmdldD8uY291bnQgPSBjb3VudCAjIFNvbWUgb3BlYXJ0b3IgaGF2ZSBubyB0YXJnZXQgbGlrZSBjdHJsLWEoaW5jcmVhc2UpLlxuXG4gICAgICBvcGVyYXRpb24uc3Vic2NyaWJlUmVzZXRPY2N1cnJlbmNlUGF0dGVybklmTmVlZGVkKClcbiAgICAgIEBydW4ob3BlcmF0aW9uKVxuXG4gIHJ1blJlY29yZGVkTW90aW9uOiAoa2V5LCB7cmV2ZXJzZX09e30pIC0+XG4gICAgcmV0dXJuIHVubGVzcyBvcGVyYXRpb24gPSBAdmltU3RhdGUuZ2xvYmFsU3RhdGUuZ2V0KGtleSlcblxuICAgIG9wZXJhdGlvbiA9IG9wZXJhdGlvbi5jbG9uZShAdmltU3RhdGUpXG4gICAgb3BlcmF0aW9uLnJlcGVhdGVkID0gdHJ1ZVxuICAgIG9wZXJhdGlvbi5yZXNldENvdW50KClcbiAgICBpZiByZXZlcnNlXG4gICAgICBvcGVyYXRpb24uYmFja3dhcmRzID0gbm90IG9wZXJhdGlvbi5iYWNrd2FyZHNcbiAgICBAcnVuKG9wZXJhdGlvbilcblxuICBydW5DdXJyZW50RmluZDogKG9wdGlvbnMpIC0+XG4gICAgQHJ1blJlY29yZGVkTW90aW9uKCdjdXJyZW50RmluZCcsIG9wdGlvbnMpXG5cbiAgcnVuQ3VycmVudFNlYXJjaDogKG9wdGlvbnMpIC0+XG4gICAgQHJ1blJlY29yZGVkTW90aW9uKCdjdXJyZW50U2VhcmNoJywgb3B0aW9ucylcblxuICBoYW5kbGVFcnJvcjogKGVycm9yKSAtPlxuICAgIEB2aW1TdGF0ZS5yZXNldCgpXG4gICAgdW5sZXNzIGVycm9yIGluc3RhbmNlb2YgT3BlcmF0aW9uQWJvcnRlZEVycm9yXG4gICAgICB0aHJvdyBlcnJvclxuXG4gIGlzUHJvY2Vzc2luZzogLT5cbiAgICBAcHJvY2Vzc2luZ1xuXG4gIHByb2Nlc3M6IC0+XG4gICAgQHByb2Nlc3NpbmcgPSB0cnVlXG4gICAgaWYgQHN0YWNrLmxlbmd0aCBpcyAyXG4gICAgICAjIFtGSVhNRSBpZGVhbGx5XVxuICAgICAgIyBJZiB0YXJnZXQgaXMgbm90IGNvbXBsZXRlLCB3ZSBwb3N0cG9uZSBjb21wb3NpbmcgdGFyZ2V0IHdpdGggb3BlcmF0b3IgdG8ga2VlcCBzaXR1YXRpb24gc2ltcGxlLlxuICAgICAgIyBTbyB0aGF0IHdlIGNhbiBhc3N1bWUgd2hlbiB0YXJnZXQgaXMgc2V0IHRvIG9wZXJhdG9yIGl0J3MgY29tcGxldGUuXG4gICAgICAjIGUuZy4gYHkgcyB0IGEnKHN1cnJvdW5kIGZvciByYW5nZSBmcm9tIGhlcmUgdG8gdGlsbCBhKVxuICAgICAgcmV0dXJuIHVubGVzcyBAcGVla1RvcCgpLmlzQ29tcGxldGUoKVxuXG4gICAgICBvcGVyYXRpb24gPSBAc3RhY2sucG9wKClcbiAgICAgIEBwZWVrVG9wKCkuc2V0VGFyZ2V0KG9wZXJhdGlvbilcblxuICAgIHRvcCA9IEBwZWVrVG9wKClcblxuICAgIGlmIHRvcC5pc0NvbXBsZXRlKClcbiAgICAgIEBleGVjdXRlKEBzdGFjay5wb3AoKSlcbiAgICBlbHNlXG4gICAgICBpZiBAbW9kZSBpcyAnbm9ybWFsJyBhbmQgdG9wLmlzT3BlcmF0b3IoKVxuICAgICAgICBAbW9kZU1hbmFnZXIuYWN0aXZhdGUoJ29wZXJhdG9yLXBlbmRpbmcnKVxuXG4gICAgICAjIFRlbXBvcmFyeSBzZXQgd2hpbGUgY29tbWFuZCBpcyBydW5uaW5nXG4gICAgICBpZiBjb21tYW5kTmFtZSA9IHRvcC5jb25zdHJ1Y3Rvci5nZXRDb21tYW5kTmFtZVdpdGhvdXRQcmVmaXg/KClcbiAgICAgICAgQGFkZFRvQ2xhc3NMaXN0KGNvbW1hbmROYW1lICsgXCItcGVuZGluZ1wiKVxuXG4gIGV4ZWN1dGU6IChvcGVyYXRpb24pIC0+XG4gICAgZXhlY3V0aW9uID0gb3BlcmF0aW9uLmV4ZWN1dGUoKVxuICAgIGlmIGV4ZWN1dGlvbiBpbnN0YW5jZW9mIFByb21pc2VcbiAgICAgIGV4ZWN1dGlvblxuICAgICAgICAudGhlbiA9PiBAZmluaXNoKG9wZXJhdGlvbilcbiAgICAgICAgLmNhdGNoID0+IEBoYW5kbGVFcnJvcigpXG4gICAgZWxzZVxuICAgICAgQGZpbmlzaChvcGVyYXRpb24pXG5cbiAgY2FuY2VsOiAtPlxuICAgIGlmIEBtb2RlIG5vdCBpbiBbJ3Zpc3VhbCcsICdpbnNlcnQnXVxuICAgICAgQHZpbVN0YXRlLnJlc2V0Tm9ybWFsTW9kZSgpXG4gICAgICBAdmltU3RhdGUucmVzdG9yZU9yaWdpbmFsQ3Vyc29yUG9zaXRpb24oKVxuICAgIEBmaW5pc2goKVxuXG4gIGZpbmlzaDogKG9wZXJhdGlvbj1udWxsKSAtPlxuICAgIEByZWNvcmRlZE9wZXJhdGlvbiA9IG9wZXJhdGlvbiBpZiBvcGVyYXRpb24/LnJlY29yZGFibGVcbiAgICBAdmltU3RhdGUuZW1pdERpZEZpbmlzaE9wZXJhdGlvbigpXG4gICAgaWYgb3BlcmF0aW9uPy5pc09wZXJhdG9yKClcbiAgICAgIG9wZXJhdGlvbi5yZXNldFN0YXRlKClcblxuICAgIGlmIEBtb2RlIGlzICdub3JtYWwnXG4gICAgICBAZW5zdXJlQWxsU2VsZWN0aW9uc0FyZUVtcHR5KG9wZXJhdGlvbilcbiAgICAgIEBlbnN1cmVBbGxDdXJzb3JzQXJlTm90QXRFbmRPZkxpbmUoKVxuICAgIGVsc2UgaWYgQG1vZGUgaXMgJ3Zpc3VhbCdcbiAgICAgIEBtb2RlTWFuYWdlci51cGRhdGVOYXJyb3dlZFN0YXRlKClcbiAgICAgIEB2aW1TdGF0ZS51cGRhdGVQcmV2aW91c1NlbGVjdGlvbigpXG5cbiAgICBAdmltU3RhdGUudXBkYXRlQ3Vyc29yc1Zpc2liaWxpdHkoKVxuICAgIEB2aW1TdGF0ZS5yZXNldCgpXG5cbiAgZW5zdXJlQWxsU2VsZWN0aW9uc0FyZUVtcHR5OiAob3BlcmF0aW9uKSAtPlxuICAgICMgV2hlbiBAdmltU3RhdGUuc2VsZWN0QmxvY2t3aXNlKCkgaXMgY2FsbGVkIGluIG5vbi12aXN1YWwtbW9kZS5cbiAgICAjIGUuZy4gYC5gIHJlcGVhdCBvZiBvcGVyYXRpb24gdGFyZ2V0ZWQgYmxvY2t3aXNlIGBDdXJyZW50U2VsZWN0aW9uYC5cbiAgICAjIFdlIG5lZWQgdG8gbWFudWFsbHkgY2xlYXIgYmxvY2t3aXNlU2VsZWN0aW9uLlxuICAgICMgU2VlICM2NDdcbiAgICBAdmltU3RhdGUuY2xlYXJCbG9ja3dpc2VTZWxlY3Rpb25zKCkgIyBGSVhNRSwgc2hvdWxkIGJlIHJlbW92ZWRcbiAgICBpZiBoYXZlU29tZU5vbkVtcHR5U2VsZWN0aW9uKEBlZGl0b3IpXG4gICAgICBpZiBAdmltU3RhdGUuZ2V0Q29uZmlnKCdzdHJpY3RBc3NlcnRpb24nKVxuICAgICAgICBhc3NlcnRXaXRoRXhjZXB0aW9uKGZhbHNlLCBcIkhhdmUgc29tZSBub24tZW1wdHkgc2VsZWN0aW9uIGluIG5vcm1hbC1tb2RlOiAje29wZXJhdGlvbi50b1N0cmluZygpfVwiKVxuICAgICAgQHZpbVN0YXRlLmNsZWFyU2VsZWN0aW9ucygpXG5cbiAgZW5zdXJlQWxsQ3Vyc29yc0FyZU5vdEF0RW5kT2ZMaW5lOiAtPlxuICAgIGZvciBjdXJzb3IgaW4gQGVkaXRvci5nZXRDdXJzb3JzKCkgd2hlbiBjdXJzb3IuaXNBdEVuZE9mTGluZSgpXG4gICAgICBtb3ZlQ3Vyc29yTGVmdChjdXJzb3IsIHByZXNlcnZlR29hbENvbHVtbjogdHJ1ZSlcblxuICBhZGRUb0NsYXNzTGlzdDogKGNsYXNzTmFtZSkgLT5cbiAgICBAZWRpdG9yRWxlbWVudC5jbGFzc0xpc3QuYWRkKGNsYXNzTmFtZSlcbiAgICBAc3Vic2NyaWJlIG5ldyBEaXNwb3NhYmxlID0+XG4gICAgICBAZWRpdG9yRWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKGNsYXNzTmFtZSlcblxuICAjIENvdW50XG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAjIGtleXN0cm9rZSBgM2Qyd2AgZGVsZXRlIDYoMyoyKSB3b3Jkcy5cbiAgIyAgMm5kIG51bWJlcigyIGluIHRoaXMgY2FzZSkgaXMgYWx3YXlzIGVudGVyZCBpbiBvcGVyYXRvci1wZW5kaW5nLW1vZGUuXG4gICMgIFNvIGNvdW50IGhhdmUgdHdvIHRpbWluZyB0byBiZSBlbnRlcmVkLiB0aGF0J3Mgd2h5IGhlcmUgd2UgbWFuYWdlIGNvdW50ZXIgYnkgbW9kZS5cbiAgaGFzQ291bnQ6IC0+XG4gICAgQGNvdW50Wydub3JtYWwnXT8gb3IgQGNvdW50WydvcGVyYXRvci1wZW5kaW5nJ10/XG5cbiAgZ2V0Q291bnQ6IC0+XG4gICAgaWYgQGhhc0NvdW50KClcbiAgICAgIChAY291bnRbJ25vcm1hbCddID8gMSkgKiAoQGNvdW50WydvcGVyYXRvci1wZW5kaW5nJ10gPyAxKVxuICAgIGVsc2VcbiAgICAgIG51bGxcblxuICBzZXRDb3VudDogKG51bWJlcikgLT5cbiAgICBtb2RlID0gJ25vcm1hbCdcbiAgICBtb2RlID0gQG1vZGUgaWYgQG1vZGUgaXMgJ29wZXJhdG9yLXBlbmRpbmcnXG4gICAgQGNvdW50W21vZGVdID89IDBcbiAgICBAY291bnRbbW9kZV0gPSAoQGNvdW50W21vZGVdICogMTApICsgbnVtYmVyXG4gICAgQHZpbVN0YXRlLmhvdmVyLnNldChAYnVpbGRDb3VudFN0cmluZygpKVxuICAgIEB2aW1TdGF0ZS50b2dnbGVDbGFzc0xpc3QoJ3dpdGgtY291bnQnLCB0cnVlKVxuXG4gIGJ1aWxkQ291bnRTdHJpbmc6IC0+XG4gICAgW0Bjb3VudFsnbm9ybWFsJ10sIEBjb3VudFsnb3BlcmF0b3ItcGVuZGluZyddXVxuICAgICAgLmZpbHRlciAoY291bnQpIC0+IGNvdW50P1xuICAgICAgLm1hcCAoY291bnQpIC0+IFN0cmluZyhjb3VudClcbiAgICAgIC5qb2luKCd4JylcblxuICByZXNldENvdW50OiAtPlxuICAgIEBjb3VudCA9IHt9XG4gICAgQHZpbVN0YXRlLnRvZ2dsZUNsYXNzTGlzdCgnd2l0aC1jb3VudCcsIGZhbHNlKVxuXG5tb2R1bGUuZXhwb3J0cyA9IE9wZXJhdGlvblN0YWNrXG4iXX0=
