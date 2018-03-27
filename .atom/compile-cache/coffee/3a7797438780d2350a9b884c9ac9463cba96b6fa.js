(function() {
  var Base, CompositeDisposable, Disposable, MoveToRelativeLine, OperationAbortedError, OperationStack, Select, moveCursorLeft, ref, ref1, swrap;

  ref = require('atom'), Disposable = ref.Disposable, CompositeDisposable = ref.CompositeDisposable;

  Base = require('./base');

  moveCursorLeft = require('./utils').moveCursorLeft;

  ref1 = {}, Select = ref1.Select, MoveToRelativeLine = ref1.MoveToRelativeLine;

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
      var ref2;
      this.vimState = vimState;
      ref2 = this.vimState, this.editor = ref2.editor, this.editorElement = ref2.editorElement, this.modeManager = ref2.modeManager;
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
      var ref2;
      this.resetCount();
      this.stack = [];
      this.processing = false;
      this.vimState.emitDidResetOperationStack();
      if ((ref2 = this.operationSubscriptions) != null) {
        ref2.dispose();
      }
      return this.operationSubscriptions = new CompositeDisposable;
    };

    OperationStack.prototype.destroy = function() {
      var ref2, ref3;
      this.subscriptions.dispose();
      if ((ref2 = this.operationSubscriptions) != null) {
        ref2.dispose();
      }
      return ref3 = {}, this.stack = ref3.stack, this.operationSubscriptions = ref3.operationSubscriptions, ref3;
    };

    OperationStack.prototype.peekTop = function() {
      return this.stack[this.stack.length - 1];
    };

    OperationStack.prototype.isEmpty = function() {
      return this.stack.length === 0;
    };

    OperationStack.prototype.run = function(klass, properties) {
      var error, isValidOperation, operation, ref2, type;
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
          if (((ref2 = this.peekTop()) != null ? ref2.constructor : void 0) === klass) {
            operation = new MoveToRelativeLine(this.vimState);
          } else {
            operation = new klass(this.vimState, properties);
          }
        }
        if (this.isEmpty()) {
          isValidOperation = true;
          if ((this.mode === 'visual' && operation.isMotion()) || operation.isTextObject()) {
            operation = new Select(this.vimState).setTarget(operation);
          }
        } else {
          isValidOperation = this.peekTop().isOperator() && (operation.isMotion() || operation.isTextObject());
        }
        if (isValidOperation) {
          this.stack.push(operation);
          return this.process();
        } else {
          this.vimState.emitDidFailToPushToOperationStack();
          return this.vimState.resetNormalMode();
        }
      } catch (error1) {
        error = error1;
        return this.handleError(error);
      }
    };

    OperationStack.prototype.runRecorded = function() {
      var count, operation, ref2;
      if (operation = this.recordedOperation) {
        operation.setRepeated();
        if (this.hasCount()) {
          count = this.getCount();
          operation.count = count;
          if ((ref2 = operation.target) != null) {
            ref2.count = count;
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
      operation.setRepeated();
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
      if (this.mode === 'visual') {
        this.vimState.updatePreviousSelection();
      }
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
      var ref2;
      if ((ref2 = this.mode) !== 'visual' && ref2 !== 'insert') {
        this.vimState.resetNormalMode();
        this.vimState.restoreOriginalCursorPosition();
      }
      return this.finish();
    };

    OperationStack.prototype.finish = function(operation) {
      if (operation == null) {
        operation = null;
      }
      if (operation != null ? operation.isRecordable() : void 0) {
        this.recordedOperation = operation;
      }
      this.vimState.emitDidFinishOperation();
      if (operation != null ? operation.isOperator() : void 0) {
        operation.resetState();
      }
      if (this.mode === 'normal') {
        swrap.clearProperties(this.editor);
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
      if (!this.editor.getLastSelection().isEmpty()) {
        if (this.vimState.getConfig('devThrowErrorOnNonEmptySelectionInNormalMode')) {
          throw new Error("Selection is not empty in normal-mode: " + (operation.toString()));
        } else {
          return this.vimState.clearSelections();
        }
      }
    };

    OperationStack.prototype.ensureAllCursorsAreNotAtEndOfLine = function() {
      var cursor, i, len, ref2, results;
      ref2 = this.editor.getCursors();
      results = [];
      for (i = 0, len = ref2.length; i < len; i++) {
        cursor = ref2[i];
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
      var ref2, ref3;
      if (this.hasCount()) {
        return ((ref2 = this.count['normal']) != null ? ref2 : 1) * ((ref3 = this.count['operator-pending']) != null ? ref3 : 1);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvb3BlcmF0aW9uLXN0YWNrLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsTUFBb0MsT0FBQSxDQUFRLE1BQVIsQ0FBcEMsRUFBQywyQkFBRCxFQUFhOztFQUNiLElBQUEsR0FBTyxPQUFBLENBQVEsUUFBUjs7RUFDTixpQkFBa0IsT0FBQSxDQUFRLFNBQVI7O0VBQ25CLE9BQStCLEVBQS9CLEVBQUMsb0JBQUQsRUFBUzs7RUFDUix3QkFBeUIsT0FBQSxDQUFRLFVBQVI7O0VBQzFCLEtBQUEsR0FBUSxPQUFBLENBQVEscUJBQVI7O0VBWUY7SUFDSixNQUFNLENBQUMsY0FBUCxDQUFzQixjQUFDLENBQUEsU0FBdkIsRUFBa0MsTUFBbEMsRUFBMEM7TUFBQSxHQUFBLEVBQUssU0FBQTtlQUFHLElBQUMsQ0FBQSxXQUFXLENBQUM7TUFBaEIsQ0FBTDtLQUExQzs7SUFDQSxNQUFNLENBQUMsY0FBUCxDQUFzQixjQUFDLENBQUEsU0FBdkIsRUFBa0MsU0FBbEMsRUFBNkM7TUFBQSxHQUFBLEVBQUssU0FBQTtlQUFHLElBQUMsQ0FBQSxXQUFXLENBQUM7TUFBaEIsQ0FBTDtLQUE3Qzs7SUFFYSx3QkFBQyxRQUFEO0FBQ1gsVUFBQTtNQURZLElBQUMsQ0FBQSxXQUFEO01BQ1osT0FBMEMsSUFBQyxDQUFBLFFBQTNDLEVBQUMsSUFBQyxDQUFBLGNBQUEsTUFBRixFQUFVLElBQUMsQ0FBQSxxQkFBQSxhQUFYLEVBQTBCLElBQUMsQ0FBQSxtQkFBQTtNQUUzQixJQUFDLENBQUEsYUFBRCxHQUFpQixJQUFJO01BQ3JCLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFDLENBQUEsUUFBUSxDQUFDLFlBQVYsQ0FBdUIsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENB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O0VBSWQsTUFBTSxDQUFDLE9BQVAsR0FBaUI7QUE1T2pCIiwic291cmNlc0NvbnRlbnQiOlsie0Rpc3Bvc2FibGUsIENvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSAnYXRvbSdcbkJhc2UgPSByZXF1aXJlICcuL2Jhc2UnXG57bW92ZUN1cnNvckxlZnR9ID0gcmVxdWlyZSAnLi91dGlscydcbntTZWxlY3QsIE1vdmVUb1JlbGF0aXZlTGluZX0gPSB7fVxue09wZXJhdGlvbkFib3J0ZWRFcnJvcn0gPSByZXF1aXJlICcuL2Vycm9ycydcbnN3cmFwID0gcmVxdWlyZSAnLi9zZWxlY3Rpb24td3JhcHBlcidcblxuIyBvcHJhdGlvbiBsaWZlIGluIG9wZXJhdGlvblN0YWNrXG4jIDEuIHJ1blxuIyAgICBpbnN0YW50aWF0ZWQgYnkgbmV3LlxuIyAgICBjb21wbGltZW50IGltcGxpY2l0IE9wZXJhdG9yLlNlbGVjdCBvcGVyYXRvciBpZiBuZWNlc3NhcnkuXG4jICAgIHB1c2ggb3BlcmF0aW9uIHRvIHN0YWNrLlxuIyAyLiBwcm9jZXNzXG4jICAgIHJlZHVjZSBzdGFjayBieSwgcG9wcGluZyB0b3Agb2Ygc3RhY2sgdGhlbiBzZXQgaXQgYXMgdGFyZ2V0IG9mIG5ldyB0b3AuXG4jICAgIGNoZWNrIGlmIHJlbWFpbmluZyB0b3Agb2Ygc3RhY2sgaXMgZXhlY3V0YWJsZSBieSBjYWxsaW5nIGlzQ29tcGxldGUoKVxuIyAgICBpZiBleGVjdXRhYmxlLCB0aGVuIHBvcCBzdGFjayB0aGVuIGV4ZWN1dGUocG9wcGVkT3BlcmF0aW9uKVxuIyAgICBpZiBub3QgZXhlY3V0YWJsZSwgZW50ZXIgXCJvcGVyYXRvci1wZW5kaW5nLW1vZGVcIlxuY2xhc3MgT3BlcmF0aW9uU3RhY2tcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5IEBwcm90b3R5cGUsICdtb2RlJywgZ2V0OiAtPiBAbW9kZU1hbmFnZXIubW9kZVxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkgQHByb3RvdHlwZSwgJ3N1Ym1vZGUnLCBnZXQ6IC0+IEBtb2RlTWFuYWdlci5zdWJtb2RlXG5cbiAgY29uc3RydWN0b3I6IChAdmltU3RhdGUpIC0+XG4gICAge0BlZGl0b3IsIEBlZGl0b3JFbGVtZW50LCBAbW9kZU1hbmFnZXJ9ID0gQHZpbVN0YXRlXG5cbiAgICBAc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIEB2aW1TdGF0ZS5vbkRpZERlc3Ryb3koQGRlc3Ryb3kuYmluZCh0aGlzKSlcblxuICAgIFNlbGVjdCA/PSBCYXNlLmdldENsYXNzKCdTZWxlY3QnKVxuICAgIE1vdmVUb1JlbGF0aXZlTGluZSA/PSBCYXNlLmdldENsYXNzKCdNb3ZlVG9SZWxhdGl2ZUxpbmUnKVxuXG4gICAgQHJlc2V0KClcblxuICAjIFJldHVybiBoYW5kbGVyXG4gIHN1YnNjcmliZTogKGhhbmRsZXIpIC0+XG4gICAgQG9wZXJhdGlvblN1YnNjcmlwdGlvbnMuYWRkKGhhbmRsZXIpXG4gICAgcmV0dXJuIGhhbmRsZXIgIyBET05UIFJFTU9WRVxuXG4gIHJlc2V0OiAtPlxuICAgIEByZXNldENvdW50KClcbiAgICBAc3RhY2sgPSBbXVxuICAgIEBwcm9jZXNzaW5nID0gZmFsc2VcblxuICAgICMgdGhpcyBoYXMgdG8gYmUgQkVGT1JFIEBvcGVyYXRpb25TdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICAgIEB2aW1TdGF0ZS5lbWl0RGlkUmVzZXRPcGVyYXRpb25TdGFjaygpXG5cbiAgICBAb3BlcmF0aW9uU3Vic2NyaXB0aW9ucz8uZGlzcG9zZSgpXG4gICAgQG9wZXJhdGlvblN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuXG4gIGRlc3Ryb3k6IC0+XG4gICAgQHN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG4gICAgQG9wZXJhdGlvblN1YnNjcmlwdGlvbnM/LmRpc3Bvc2UoKVxuICAgIHtAc3RhY2ssIEBvcGVyYXRpb25TdWJzY3JpcHRpb25zfSA9IHt9XG5cbiAgcGVla1RvcDogLT5cbiAgICBAc3RhY2tbQHN0YWNrLmxlbmd0aCAtIDFdXG5cbiAgaXNFbXB0eTogLT5cbiAgICBAc3RhY2subGVuZ3RoIGlzIDBcblxuICAjIE1haW5cbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIHJ1bjogKGtsYXNzLCBwcm9wZXJ0aWVzKSAtPlxuICAgIHRyeVxuICAgICAgQHZpbVN0YXRlLmluaXQoKSBpZiBAaXNFbXB0eSgpXG4gICAgICB0eXBlID0gdHlwZW9mKGtsYXNzKVxuICAgICAgaWYgdHlwZSBpcyAnb2JqZWN0JyAjIC4gcmVwZWF0IGNhc2Ugd2UgY2FuIGV4ZWN1dGUgYXMtaXQtaXMuXG4gICAgICAgIG9wZXJhdGlvbiA9IGtsYXNzXG4gICAgICBlbHNlXG4gICAgICAgIGtsYXNzID0gQmFzZS5nZXRDbGFzcyhrbGFzcykgaWYgdHlwZSBpcyAnc3RyaW5nJ1xuICAgICAgICAjIFJlcGxhY2Ugb3BlcmF0b3Igd2hlbiBpZGVudGljYWwgb25lIHJlcGVhdGVkLCBlLmcuIGBkZGAsIGBjY2AsIGBnVWdVYFxuICAgICAgICBpZiBAcGVla1RvcCgpPy5jb25zdHJ1Y3RvciBpcyBrbGFzc1xuICAgICAgICAgIG9wZXJhdGlvbiA9IG5ldyBNb3ZlVG9SZWxhdGl2ZUxpbmUoQHZpbVN0YXRlKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgb3BlcmF0aW9uID0gbmV3IGtsYXNzKEB2aW1TdGF0ZSwgcHJvcGVydGllcylcblxuICAgICAgaWYgQGlzRW1wdHkoKVxuICAgICAgICBpc1ZhbGlkT3BlcmF0aW9uID0gdHJ1ZVxuICAgICAgICBpZiAoQG1vZGUgaXMgJ3Zpc3VhbCcgYW5kIG9wZXJhdGlvbi5pc01vdGlvbigpKSBvciBvcGVyYXRpb24uaXNUZXh0T2JqZWN0KClcbiAgICAgICAgICBvcGVyYXRpb24gPSBuZXcgU2VsZWN0KEB2aW1TdGF0ZSkuc2V0VGFyZ2V0KG9wZXJhdGlvbilcbiAgICAgIGVsc2VcbiAgICAgICAgaXNWYWxpZE9wZXJhdGlvbiA9IEBwZWVrVG9wKCkuaXNPcGVyYXRvcigpIGFuZCAob3BlcmF0aW9uLmlzTW90aW9uKCkgb3Igb3BlcmF0aW9uLmlzVGV4dE9iamVjdCgpKVxuXG4gICAgICBpZiBpc1ZhbGlkT3BlcmF0aW9uXG4gICAgICAgIEBzdGFjay5wdXNoKG9wZXJhdGlvbilcbiAgICAgICAgQHByb2Nlc3MoKVxuICAgICAgZWxzZVxuICAgICAgICBAdmltU3RhdGUuZW1pdERpZEZhaWxUb1B1c2hUb09wZXJhdGlvblN0YWNrKClcbiAgICAgICAgQHZpbVN0YXRlLnJlc2V0Tm9ybWFsTW9kZSgpXG4gICAgY2F0Y2ggZXJyb3JcbiAgICAgIEBoYW5kbGVFcnJvcihlcnJvcilcblxuICBydW5SZWNvcmRlZDogLT5cbiAgICBpZiBvcGVyYXRpb24gPSBAcmVjb3JkZWRPcGVyYXRpb25cbiAgICAgIG9wZXJhdGlvbi5zZXRSZXBlYXRlZCgpXG4gICAgICBpZiBAaGFzQ291bnQoKVxuICAgICAgICBjb3VudCA9IEBnZXRDb3VudCgpXG4gICAgICAgIG9wZXJhdGlvbi5jb3VudCA9IGNvdW50XG4gICAgICAgIG9wZXJhdGlvbi50YXJnZXQ/LmNvdW50ID0gY291bnQgIyBTb21lIG9wZWFydG9yIGhhdmUgbm8gdGFyZ2V0IGxpa2UgY3RybC1hKGluY3JlYXNlKS5cblxuICAgICAgb3BlcmF0aW9uLnN1YnNjcmliZVJlc2V0T2NjdXJyZW5jZVBhdHRlcm5JZk5lZWRlZCgpXG4gICAgICBAcnVuKG9wZXJhdGlvbilcblxuICBydW5SZWNvcmRlZE1vdGlvbjogKGtleSwge3JldmVyc2V9PXt9KSAtPlxuICAgIHJldHVybiB1bmxlc3Mgb3BlcmF0aW9uID0gQHZpbVN0YXRlLmdsb2JhbFN0YXRlLmdldChrZXkpXG5cbiAgICBvcGVyYXRpb24gPSBvcGVyYXRpb24uY2xvbmUoQHZpbVN0YXRlKVxuICAgIG9wZXJhdGlvbi5zZXRSZXBlYXRlZCgpXG4gICAgb3BlcmF0aW9uLnJlc2V0Q291bnQoKVxuICAgIGlmIHJldmVyc2VcbiAgICAgIG9wZXJhdGlvbi5iYWNrd2FyZHMgPSBub3Qgb3BlcmF0aW9uLmJhY2t3YXJkc1xuICAgIEBydW4ob3BlcmF0aW9uKVxuXG4gIHJ1bkN1cnJlbnRGaW5kOiAob3B0aW9ucykgLT5cbiAgICBAcnVuUmVjb3JkZWRNb3Rpb24oJ2N1cnJlbnRGaW5kJywgb3B0aW9ucylcblxuICBydW5DdXJyZW50U2VhcmNoOiAob3B0aW9ucykgLT5cbiAgICBAcnVuUmVjb3JkZWRNb3Rpb24oJ2N1cnJlbnRTZWFyY2gnLCBvcHRpb25zKVxuXG4gIGhhbmRsZUVycm9yOiAoZXJyb3IpIC0+XG4gICAgQHZpbVN0YXRlLnJlc2V0KClcbiAgICB1bmxlc3MgZXJyb3IgaW5zdGFuY2VvZiBPcGVyYXRpb25BYm9ydGVkRXJyb3JcbiAgICAgIHRocm93IGVycm9yXG5cbiAgaXNQcm9jZXNzaW5nOiAtPlxuICAgIEBwcm9jZXNzaW5nXG5cbiAgcHJvY2VzczogLT5cbiAgICBAcHJvY2Vzc2luZyA9IHRydWVcbiAgICBpZiBAc3RhY2subGVuZ3RoIGlzIDJcbiAgICAgICMgW0ZJWE1FIGlkZWFsbHldXG4gICAgICAjIElmIHRhcmdldCBpcyBub3QgY29tcGxldGUsIHdlIHBvc3Rwb25lIGNvbXBvc2luZyB0YXJnZXQgd2l0aCBvcGVyYXRvciB0byBrZWVwIHNpdHVhdGlvbiBzaW1wbGUuXG4gICAgICAjIFNvIHRoYXQgd2UgY2FuIGFzc3VtZSB3aGVuIHRhcmdldCBpcyBzZXQgdG8gb3BlcmF0b3IgaXQncyBjb21wbGV0ZS5cbiAgICAgICMgZS5nLiBgeSBzIHQgYScoc3Vycm91bmQgZm9yIHJhbmdlIGZyb20gaGVyZSB0byB0aWxsIGEpXG4gICAgICByZXR1cm4gdW5sZXNzIEBwZWVrVG9wKCkuaXNDb21wbGV0ZSgpXG5cbiAgICAgIG9wZXJhdGlvbiA9IEBzdGFjay5wb3AoKVxuICAgICAgQHBlZWtUb3AoKS5zZXRUYXJnZXQob3BlcmF0aW9uKVxuXG4gICAgdG9wID0gQHBlZWtUb3AoKVxuXG4gICAgaWYgdG9wLmlzQ29tcGxldGUoKVxuICAgICAgQGV4ZWN1dGUoQHN0YWNrLnBvcCgpKVxuICAgIGVsc2VcbiAgICAgIGlmIEBtb2RlIGlzICdub3JtYWwnIGFuZCB0b3AuaXNPcGVyYXRvcigpXG4gICAgICAgIEBtb2RlTWFuYWdlci5hY3RpdmF0ZSgnb3BlcmF0b3ItcGVuZGluZycpXG5cbiAgICAgICMgVGVtcG9yYXJ5IHNldCB3aGlsZSBjb21tYW5kIGlzIHJ1bm5pbmdcbiAgICAgIGlmIGNvbW1hbmROYW1lID0gdG9wLmNvbnN0cnVjdG9yLmdldENvbW1hbmROYW1lV2l0aG91dFByZWZpeD8oKVxuICAgICAgICBAYWRkVG9DbGFzc0xpc3QoY29tbWFuZE5hbWUgKyBcIi1wZW5kaW5nXCIpXG5cbiAgZXhlY3V0ZTogKG9wZXJhdGlvbikgLT5cbiAgICBAdmltU3RhdGUudXBkYXRlUHJldmlvdXNTZWxlY3Rpb24oKSBpZiBAbW9kZSBpcyAndmlzdWFsJ1xuICAgIGV4ZWN1dGlvbiA9IG9wZXJhdGlvbi5leGVjdXRlKClcbiAgICBpZiBleGVjdXRpb24gaW5zdGFuY2VvZiBQcm9taXNlXG4gICAgICBleGVjdXRpb25cbiAgICAgICAgLnRoZW4gPT4gQGZpbmlzaChvcGVyYXRpb24pXG4gICAgICAgIC5jYXRjaCA9PiBAaGFuZGxlRXJyb3IoKVxuICAgIGVsc2VcbiAgICAgIEBmaW5pc2gob3BlcmF0aW9uKVxuXG4gIGNhbmNlbDogLT5cbiAgICBpZiBAbW9kZSBub3QgaW4gWyd2aXN1YWwnLCAnaW5zZXJ0J11cbiAgICAgIEB2aW1TdGF0ZS5yZXNldE5vcm1hbE1vZGUoKVxuICAgICAgQHZpbVN0YXRlLnJlc3RvcmVPcmlnaW5hbEN1cnNvclBvc2l0aW9uKClcbiAgICBAZmluaXNoKClcblxuICBmaW5pc2g6IChvcGVyYXRpb249bnVsbCkgLT5cbiAgICBAcmVjb3JkZWRPcGVyYXRpb24gPSBvcGVyYXRpb24gaWYgb3BlcmF0aW9uPy5pc1JlY29yZGFibGUoKVxuICAgIEB2aW1TdGF0ZS5lbWl0RGlkRmluaXNoT3BlcmF0aW9uKClcbiAgICBpZiBvcGVyYXRpb24/LmlzT3BlcmF0b3IoKVxuICAgICAgb3BlcmF0aW9uLnJlc2V0U3RhdGUoKVxuXG4gICAgaWYgQG1vZGUgaXMgJ25vcm1hbCdcbiAgICAgIHN3cmFwLmNsZWFyUHJvcGVydGllcyhAZWRpdG9yKVxuICAgICAgQGVuc3VyZUFsbFNlbGVjdGlvbnNBcmVFbXB0eShvcGVyYXRpb24pXG4gICAgICBAZW5zdXJlQWxsQ3Vyc29yc0FyZU5vdEF0RW5kT2ZMaW5lKClcbiAgICBlbHNlIGlmIEBtb2RlIGlzICd2aXN1YWwnXG4gICAgICBAbW9kZU1hbmFnZXIudXBkYXRlTmFycm93ZWRTdGF0ZSgpXG4gICAgICBAdmltU3RhdGUudXBkYXRlUHJldmlvdXNTZWxlY3Rpb24oKVxuICAgIEB2aW1TdGF0ZS51cGRhdGVDdXJzb3JzVmlzaWJpbGl0eSgpXG4gICAgQHZpbVN0YXRlLnJlc2V0KClcblxuICBlbnN1cmVBbGxTZWxlY3Rpb25zQXJlRW1wdHk6IChvcGVyYXRpb24pIC0+XG4gICAgIyBXaGVuIEB2aW1TdGF0ZS5zZWxlY3RCbG9ja3dpc2UoKSBpcyBjYWxsZWQgaW4gbm9uLXZpc3VhbC1tb2RlLlxuICAgICMgZS5nLiBgLmAgcmVwZWF0IG9mIG9wZXJhdGlvbiB0YXJnZXRlZCBibG9ja3dpc2UgYEN1cnJlbnRTZWxlY3Rpb25gLlxuICAgICMgV2UgbmVlZCB0byBtYW51YWxseSBjbGVhciBibG9ja3dpc2VTZWxlY3Rpb24uXG4gICAgIyBTZWUgIzY0N1xuICAgIEB2aW1TdGF0ZS5jbGVhckJsb2Nrd2lzZVNlbGVjdGlvbnMoKVxuXG4gICAgdW5sZXNzIEBlZGl0b3IuZ2V0TGFzdFNlbGVjdGlvbigpLmlzRW1wdHkoKVxuICAgICAgaWYgQHZpbVN0YXRlLmdldENvbmZpZygnZGV2VGhyb3dFcnJvck9uTm9uRW1wdHlTZWxlY3Rpb25Jbk5vcm1hbE1vZGUnKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTZWxlY3Rpb24gaXMgbm90IGVtcHR5IGluIG5vcm1hbC1tb2RlOiAje29wZXJhdGlvbi50b1N0cmluZygpfVwiKVxuICAgICAgZWxzZVxuICAgICAgICBAdmltU3RhdGUuY2xlYXJTZWxlY3Rpb25zKClcblxuICBlbnN1cmVBbGxDdXJzb3JzQXJlTm90QXRFbmRPZkxpbmU6IC0+XG4gICAgZm9yIGN1cnNvciBpbiBAZWRpdG9yLmdldEN1cnNvcnMoKSB3aGVuIGN1cnNvci5pc0F0RW5kT2ZMaW5lKClcbiAgICAgIG1vdmVDdXJzb3JMZWZ0KGN1cnNvciwge3ByZXNlcnZlR29hbENvbHVtbjogdHJ1ZX0pXG5cbiAgYWRkVG9DbGFzc0xpc3Q6IChjbGFzc05hbWUpIC0+XG4gICAgQGVkaXRvckVsZW1lbnQuY2xhc3NMaXN0LmFkZChjbGFzc05hbWUpXG4gICAgQHN1YnNjcmliZSBuZXcgRGlzcG9zYWJsZSA9PlxuICAgICAgQGVkaXRvckVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShjbGFzc05hbWUpXG5cbiAgIyBDb3VudFxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgIyBrZXlzdHJva2UgYDNkMndgIGRlbGV0ZSA2KDMqMikgd29yZHMuXG4gICMgIDJuZCBudW1iZXIoMiBpbiB0aGlzIGNhc2UpIGlzIGFsd2F5cyBlbnRlcmQgaW4gb3BlcmF0b3ItcGVuZGluZy1tb2RlLlxuICAjICBTbyBjb3VudCBoYXZlIHR3byB0aW1pbmcgdG8gYmUgZW50ZXJlZC4gdGhhdCdzIHdoeSBoZXJlIHdlIG1hbmFnZSBjb3VudGVyIGJ5IG1vZGUuXG4gIGhhc0NvdW50OiAtPlxuICAgIEBjb3VudFsnbm9ybWFsJ10/IG9yIEBjb3VudFsnb3BlcmF0b3ItcGVuZGluZyddP1xuXG4gIGdldENvdW50OiAtPlxuICAgIGlmIEBoYXNDb3VudCgpXG4gICAgICAoQGNvdW50Wydub3JtYWwnXSA/IDEpICogKEBjb3VudFsnb3BlcmF0b3ItcGVuZGluZyddID8gMSlcbiAgICBlbHNlXG4gICAgICBudWxsXG5cbiAgc2V0Q291bnQ6IChudW1iZXIpIC0+XG4gICAgbW9kZSA9ICdub3JtYWwnXG4gICAgbW9kZSA9IEBtb2RlIGlmIEBtb2RlIGlzICdvcGVyYXRvci1wZW5kaW5nJ1xuICAgIEBjb3VudFttb2RlXSA/PSAwXG4gICAgQGNvdW50W21vZGVdID0gKEBjb3VudFttb2RlXSAqIDEwKSArIG51bWJlclxuICAgIEB2aW1TdGF0ZS5ob3Zlci5zZXQoQGJ1aWxkQ291bnRTdHJpbmcoKSlcbiAgICBAdmltU3RhdGUudG9nZ2xlQ2xhc3NMaXN0KCd3aXRoLWNvdW50JywgdHJ1ZSlcblxuICBidWlsZENvdW50U3RyaW5nOiAtPlxuICAgIFtAY291bnRbJ25vcm1hbCddLCBAY291bnRbJ29wZXJhdG9yLXBlbmRpbmcnXV1cbiAgICAgIC5maWx0ZXIgKGNvdW50KSAtPiBjb3VudD9cbiAgICAgIC5tYXAgKGNvdW50KSAtPiBTdHJpbmcoY291bnQpXG4gICAgICAuam9pbigneCcpXG5cbiAgcmVzZXRDb3VudDogLT5cbiAgICBAY291bnQgPSB7fVxuICAgIEB2aW1TdGF0ZS50b2dnbGVDbGFzc0xpc3QoJ3dpdGgtY291bnQnLCBmYWxzZSlcblxubW9kdWxlLmV4cG9ydHMgPSBPcGVyYXRpb25TdGFja1xuIl19
