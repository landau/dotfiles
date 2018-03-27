(function() {
  var Base, CompositeDisposable, Disposable, MoveToRelativeLine, OperationAbortedError, OperationStack, Select, moveCursorLeft, ref, ref1, settings, swrap;

  ref = require('atom'), Disposable = ref.Disposable, CompositeDisposable = ref.CompositeDisposable;

  Base = require('./base');

  moveCursorLeft = require('./utils').moveCursorLeft;

  settings = require('./settings');

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
      var error, operation, ref2, type;
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
        if (operation.isTextObject() && this.mode !== 'operator-pending' || operation.isMotion() && this.mode === 'visual') {
          operation = new Select(this.vimState).setTarget(operation);
        }
        if (this.isEmpty() || (this.peekTop().isOperator() && operation.isTarget())) {
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
        if (settings.get('throwErrorOnNonEmptySelectionInNormalMode')) {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvb3BlcmF0aW9uLXN0YWNrLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsTUFBb0MsT0FBQSxDQUFRLE1BQVIsQ0FBcEMsRUFBQywyQkFBRCxFQUFhOztFQUNiLElBQUEsR0FBTyxPQUFBLENBQVEsUUFBUjs7RUFDTixpQkFBa0IsT0FBQSxDQUFRLFNBQVI7O0VBQ25CLFFBQUEsR0FBVyxPQUFBLENBQVEsWUFBUjs7RUFDWCxPQUErQixFQUEvQixFQUFDLG9CQUFELEVBQVM7O0VBQ1Isd0JBQXlCLE9BQUEsQ0FBUSxVQUFSOztFQUMxQixLQUFBLEdBQVEsT0FBQSxDQUFRLHFCQUFSOztFQVlGO0lBQ0osTUFBTSxDQUFDLGNBQVAsQ0FBc0IsY0FBQyxDQUFBLFNBQXZCLEVBQWtDLE1BQWxDLEVBQTBDO01BQUEsR0FBQSxFQUFLLFNBQUE7ZUFBRyxJQUFDLENBQUEsV0FBVyxDQUFDO01BQWhCLENBQUw7S0FBMUM7O0lBQ0EsTUFBTSxDQUFDLGNBQVAsQ0FBc0IsY0FBQyxDQUFBLFNBQXZCLEVBQWtDLFNBQWxDLEVBQTZDO01BQUEsR0FBQSxFQUFLLFNBQUE7ZUFBRyxJQUFDLENBQUEsV0FBVyxDQUFDO01BQWhCLENBQUw7S0FBN0M7O0lBRWEsd0JBQUMsUUFBRDtBQUNYLFVBQUE7TUFEWSxJQUFDLENBQUEsV0FBRDtNQUNaLE9BQTBDLElBQUMsQ0FBQSxRQUEzQyxFQUFDLElBQUMsQ0FBQSxjQUFBLE1BQUYsRUFBVSxJQUFDLENBQUEscUJBQUEsYUFBWCxFQUEwQixJQUFDLENBQUEsbUJBQUE7TUFFM0IsSUFBQyxDQUFBLGFBQUQsR0FBaUIsSUFBSTtNQUNyQixJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBQyxDQUFBLFFBQVEsQ0FBQyxZQUFWLENB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RGlzcG9zYWJsZSwgQ29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlICdhdG9tJ1xuQmFzZSA9IHJlcXVpcmUgJy4vYmFzZSdcbnttb3ZlQ3Vyc29yTGVmdH0gPSByZXF1aXJlICcuL3V0aWxzJ1xuc2V0dGluZ3MgPSByZXF1aXJlICcuL3NldHRpbmdzJ1xue1NlbGVjdCwgTW92ZVRvUmVsYXRpdmVMaW5lfSA9IHt9XG57T3BlcmF0aW9uQWJvcnRlZEVycm9yfSA9IHJlcXVpcmUgJy4vZXJyb3JzJ1xuc3dyYXAgPSByZXF1aXJlICcuL3NlbGVjdGlvbi13cmFwcGVyJ1xuXG4jIG9wcmF0aW9uIGxpZmUgaW4gb3BlcmF0aW9uU3RhY2tcbiMgMS4gcnVuXG4jICAgIGluc3RhbnRpYXRlZCBieSBuZXcuXG4jICAgIGNvbXBsaW1lbnQgaW1wbGljaXQgT3BlcmF0b3IuU2VsZWN0IG9wZXJhdG9yIGlmIG5lY2Vzc2FyeS5cbiMgICAgcHVzaCBvcGVyYXRpb24gdG8gc3RhY2suXG4jIDIuIHByb2Nlc3NcbiMgICAgcmVkdWNlIHN0YWNrIGJ5LCBwb3BwaW5nIHRvcCBvZiBzdGFjayB0aGVuIHNldCBpdCBhcyB0YXJnZXQgb2YgbmV3IHRvcC5cbiMgICAgY2hlY2sgaWYgcmVtYWluaW5nIHRvcCBvZiBzdGFjayBpcyBleGVjdXRhYmxlIGJ5IGNhbGxpbmcgaXNDb21wbGV0ZSgpXG4jICAgIGlmIGV4ZWN1dGFibGUsIHRoZW4gcG9wIHN0YWNrIHRoZW4gZXhlY3V0ZShwb3BwZWRPcGVyYXRpb24pXG4jICAgIGlmIG5vdCBleGVjdXRhYmxlLCBlbnRlciBcIm9wZXJhdG9yLXBlbmRpbmctbW9kZVwiXG5jbGFzcyBPcGVyYXRpb25TdGFja1xuICBPYmplY3QuZGVmaW5lUHJvcGVydHkgQHByb3RvdHlwZSwgJ21vZGUnLCBnZXQ6IC0+IEBtb2RlTWFuYWdlci5tb2RlXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSBAcHJvdG90eXBlLCAnc3VibW9kZScsIGdldDogLT4gQG1vZGVNYW5hZ2VyLnN1Ym1vZGVcblxuICBjb25zdHJ1Y3RvcjogKEB2aW1TdGF0ZSkgLT5cbiAgICB7QGVkaXRvciwgQGVkaXRvckVsZW1lbnQsIEBtb2RlTWFuYWdlcn0gPSBAdmltU3RhdGVcblxuICAgIEBzdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgQHZpbVN0YXRlLm9uRGlkRGVzdHJveShAZGVzdHJveS5iaW5kKHRoaXMpKVxuXG4gICAgU2VsZWN0ID89IEJhc2UuZ2V0Q2xhc3MoJ1NlbGVjdCcpXG4gICAgTW92ZVRvUmVsYXRpdmVMaW5lID89IEJhc2UuZ2V0Q2xhc3MoJ01vdmVUb1JlbGF0aXZlTGluZScpXG5cbiAgICBAcmVzZXQoKVxuXG4gICMgUmV0dXJuIGhhbmRsZXJcbiAgc3Vic2NyaWJlOiAoaGFuZGxlcikgLT5cbiAgICBAb3BlcmF0aW9uU3Vic2NyaXB0aW9ucy5hZGQoaGFuZGxlcilcbiAgICBoYW5kbGVyICMgRE9OVCBSRU1PVkVcblxuICByZXNldDogLT5cbiAgICBAcmVzZXRDb3VudCgpXG4gICAgQHN0YWNrID0gW11cbiAgICBAcHJvY2Vzc2luZyA9IGZhbHNlXG5cbiAgICAjIHRoaXMgaGFzIHRvIGJlIEJFRk9SRSBAb3BlcmF0aW9uU3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiAgICBAdmltU3RhdGUuZW1pdERpZFJlc2V0T3BlcmF0aW9uU3RhY2soKVxuXG4gICAgQG9wZXJhdGlvblN1YnNjcmlwdGlvbnM/LmRpc3Bvc2UoKVxuICAgIEBvcGVyYXRpb25TdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcblxuICBkZXN0cm95OiAtPlxuICAgIEBzdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICAgIEBvcGVyYXRpb25TdWJzY3JpcHRpb25zPy5kaXNwb3NlKClcbiAgICB7QHN0YWNrLCBAb3BlcmF0aW9uU3Vic2NyaXB0aW9uc30gPSB7fVxuXG4gIHBlZWtUb3A6IC0+XG4gICAgQHN0YWNrW0BzdGFjay5sZW5ndGggLSAxXVxuXG4gIGlzRW1wdHk6IC0+XG4gICAgQHN0YWNrLmxlbmd0aCBpcyAwXG5cbiAgIyBNYWluXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBydW46IChrbGFzcywgcHJvcGVydGllcykgLT5cbiAgICB0cnlcbiAgICAgIEB2aW1TdGF0ZS5pbml0KCkgaWYgQGlzRW1wdHkoKVxuICAgICAgdHlwZSA9IHR5cGVvZihrbGFzcylcbiAgICAgIGlmIHR5cGUgaXMgJ29iamVjdCcgIyAuIHJlcGVhdCBjYXNlIHdlIGNhbiBleGVjdXRlIGFzLWl0LWlzLlxuICAgICAgICBvcGVyYXRpb24gPSBrbGFzc1xuICAgICAgZWxzZVxuICAgICAgICBrbGFzcyA9IEJhc2UuZ2V0Q2xhc3Moa2xhc3MpIGlmIHR5cGUgaXMgJ3N0cmluZydcbiAgICAgICAgIyBSZXBsYWNlIG9wZXJhdG9yIHdoZW4gaWRlbnRpY2FsIG9uZSByZXBlYXRlZCwgZS5nLiBgZGRgLCBgY2NgLCBgZ1VnVWBcbiAgICAgICAgaWYgQHBlZWtUb3AoKT8uY29uc3RydWN0b3IgaXMga2xhc3NcbiAgICAgICAgICBvcGVyYXRpb24gPSBuZXcgTW92ZVRvUmVsYXRpdmVMaW5lKEB2aW1TdGF0ZSlcbiAgICAgICAgZWxzZVxuICAgICAgICAgIG9wZXJhdGlvbiA9IG5ldyBrbGFzcyhAdmltU3RhdGUsIHByb3BlcnRpZXMpXG5cbiAgICAgICMgQ29tcGxpbWVudCBpbXBsaWNpdCBTZWxlY3Qgb3BlcmF0b3JcbiAgICAgIGlmIG9wZXJhdGlvbi5pc1RleHRPYmplY3QoKSBhbmQgQG1vZGUgaXNudCAnb3BlcmF0b3ItcGVuZGluZycgb3Igb3BlcmF0aW9uLmlzTW90aW9uKCkgYW5kIEBtb2RlIGlzICd2aXN1YWwnXG4gICAgICAgIG9wZXJhdGlvbiA9IG5ldyBTZWxlY3QoQHZpbVN0YXRlKS5zZXRUYXJnZXQob3BlcmF0aW9uKVxuXG4gICAgICBpZiBAaXNFbXB0eSgpIG9yIChAcGVla1RvcCgpLmlzT3BlcmF0b3IoKSBhbmQgb3BlcmF0aW9uLmlzVGFyZ2V0KCkpXG4gICAgICAgIEBzdGFjay5wdXNoKG9wZXJhdGlvbilcbiAgICAgICAgQHByb2Nlc3MoKVxuICAgICAgZWxzZVxuICAgICAgICBAdmltU3RhdGUuZW1pdERpZEZhaWxUb1B1c2hUb09wZXJhdGlvblN0YWNrKClcbiAgICAgICAgQHZpbVN0YXRlLnJlc2V0Tm9ybWFsTW9kZSgpXG4gICAgY2F0Y2ggZXJyb3JcbiAgICAgIEBoYW5kbGVFcnJvcihlcnJvcilcblxuICBydW5SZWNvcmRlZDogLT5cbiAgICBpZiBvcGVyYXRpb24gPSBAcmVjb3JkZWRPcGVyYXRpb25cbiAgICAgIG9wZXJhdGlvbi5zZXRSZXBlYXRlZCgpXG4gICAgICBpZiBAaGFzQ291bnQoKVxuICAgICAgICBjb3VudCA9IEBnZXRDb3VudCgpXG4gICAgICAgIG9wZXJhdGlvbi5jb3VudCA9IGNvdW50XG4gICAgICAgIG9wZXJhdGlvbi50YXJnZXQ/LmNvdW50ID0gY291bnQgIyBTb21lIG9wZWFydG9yIGhhdmUgbm8gdGFyZ2V0IGxpa2UgY3RybC1hKGluY3JlYXNlKS5cblxuICAgICAgb3BlcmF0aW9uLnN1YnNjcmliZVJlc2V0T2NjdXJyZW5jZVBhdHRlcm5JZk5lZWRlZCgpXG4gICAgICBAcnVuKG9wZXJhdGlvbilcblxuICBydW5SZWNvcmRlZE1vdGlvbjogKGtleSwge3JldmVyc2V9PXt9KSAtPlxuICAgIHJldHVybiB1bmxlc3Mgb3BlcmF0aW9uID0gQHZpbVN0YXRlLmdsb2JhbFN0YXRlLmdldChrZXkpXG5cbiAgICBvcGVyYXRpb24gPSBvcGVyYXRpb24uY2xvbmUoQHZpbVN0YXRlKVxuICAgIG9wZXJhdGlvbi5zZXRSZXBlYXRlZCgpXG4gICAgb3BlcmF0aW9uLnJlc2V0Q291bnQoKVxuICAgIGlmIHJldmVyc2VcbiAgICAgIG9wZXJhdGlvbi5iYWNrd2FyZHMgPSBub3Qgb3BlcmF0aW9uLmJhY2t3YXJkc1xuICAgIEBydW4ob3BlcmF0aW9uKVxuXG4gIHJ1bkN1cnJlbnRGaW5kOiAob3B0aW9ucykgLT5cbiAgICBAcnVuUmVjb3JkZWRNb3Rpb24oJ2N1cnJlbnRGaW5kJywgb3B0aW9ucylcblxuICBydW5DdXJyZW50U2VhcmNoOiAob3B0aW9ucykgLT5cbiAgICBAcnVuUmVjb3JkZWRNb3Rpb24oJ2N1cnJlbnRTZWFyY2gnLCBvcHRpb25zKVxuXG4gIGhhbmRsZUVycm9yOiAoZXJyb3IpIC0+XG4gICAgQHZpbVN0YXRlLnJlc2V0KClcbiAgICB1bmxlc3MgZXJyb3IgaW5zdGFuY2VvZiBPcGVyYXRpb25BYm9ydGVkRXJyb3JcbiAgICAgIHRocm93IGVycm9yXG5cbiAgaXNQcm9jZXNzaW5nOiAtPlxuICAgIEBwcm9jZXNzaW5nXG5cbiAgcHJvY2VzczogLT5cbiAgICBAcHJvY2Vzc2luZyA9IHRydWVcbiAgICBpZiBAc3RhY2subGVuZ3RoIGlzIDJcbiAgICAgICMgW0ZJWE1FIGlkZWFsbHldXG4gICAgICAjIElmIHRhcmdldCBpcyBub3QgY29tcGxldGUsIHdlIHBvc3Rwb25lIGNvbXBzaW5nIHRhcmdldCB3aXRoIG9wZXJhdG9yIHRvIGtlZXAgc2l0dWF0aW9uIHNpbXBsZS5cbiAgICAgICMgU28gdGhhdCB3ZSBjYW4gYXNzdW1lIHdoZW4gdGFyZ2V0IGlzIHNldCB0byBvcGVyYXRvciBpdCdzIGNvbXBsZXRlLlxuICAgICAgIyBlLmcuIGB5IHMgdCBhJyhzdXJyb3VuZCBmb3IgcmFuZ2UgZnJvbSBoZXJlIHRvIHRpbGwgYSlcbiAgICAgIHJldHVybiB1bmxlc3MgQHBlZWtUb3AoKS5pc0NvbXBsZXRlKClcblxuICAgICAgb3BlcmF0aW9uID0gQHN0YWNrLnBvcCgpXG4gICAgICBAcGVla1RvcCgpLnNldFRhcmdldChvcGVyYXRpb24pXG5cbiAgICB0b3AgPSBAcGVla1RvcCgpXG5cbiAgICBpZiB0b3AuaXNDb21wbGV0ZSgpXG4gICAgICBAZXhlY3V0ZShAc3RhY2sucG9wKCkpXG4gICAgZWxzZVxuICAgICAgaWYgQG1vZGUgaXMgJ25vcm1hbCcgYW5kIHRvcC5pc09wZXJhdG9yKClcbiAgICAgICAgQG1vZGVNYW5hZ2VyLmFjdGl2YXRlKCdvcGVyYXRvci1wZW5kaW5nJylcblxuICAgICAgIyBUZW1wb3Jhcnkgc2V0IHdoaWxlIGNvbW1hbmQgaXMgcnVubmluZ1xuICAgICAgaWYgY29tbWFuZE5hbWUgPSB0b3AuY29uc3RydWN0b3IuZ2V0Q29tbWFuZE5hbWVXaXRob3V0UHJlZml4PygpXG4gICAgICAgIEBhZGRUb0NsYXNzTGlzdChjb21tYW5kTmFtZSArIFwiLXBlbmRpbmdcIilcblxuICBleGVjdXRlOiAob3BlcmF0aW9uKSAtPlxuICAgIEB2aW1TdGF0ZS51cGRhdGVQcmV2aW91c1NlbGVjdGlvbigpIGlmIEBtb2RlIGlzICd2aXN1YWwnXG4gICAgZXhlY3V0aW9uID0gb3BlcmF0aW9uLmV4ZWN1dGUoKVxuICAgIGlmIGV4ZWN1dGlvbiBpbnN0YW5jZW9mIFByb21pc2VcbiAgICAgIGV4ZWN1dGlvblxuICAgICAgICAudGhlbiA9PiBAZmluaXNoKG9wZXJhdGlvbilcbiAgICAgICAgLmNhdGNoID0+IEBoYW5kbGVFcnJvcigpXG4gICAgZWxzZVxuICAgICAgQGZpbmlzaChvcGVyYXRpb24pXG5cbiAgY2FuY2VsOiAtPlxuICAgIGlmIEBtb2RlIG5vdCBpbiBbJ3Zpc3VhbCcsICdpbnNlcnQnXVxuICAgICAgQHZpbVN0YXRlLnJlc2V0Tm9ybWFsTW9kZSgpXG4gICAgICBAdmltU3RhdGUucmVzdG9yZU9yaWdpbmFsQ3Vyc29yUG9zaXRpb24oKVxuICAgIEBmaW5pc2goKVxuXG4gIGZpbmlzaDogKG9wZXJhdGlvbj1udWxsKSAtPlxuICAgIEByZWNvcmRlZE9wZXJhdGlvbiA9IG9wZXJhdGlvbiBpZiBvcGVyYXRpb24/LmlzUmVjb3JkYWJsZSgpXG4gICAgQHZpbVN0YXRlLmVtaXREaWRGaW5pc2hPcGVyYXRpb24oKVxuICAgIGlmIG9wZXJhdGlvbj8uaXNPcGVyYXRvcigpXG4gICAgICBvcGVyYXRpb24ucmVzZXRTdGF0ZSgpXG5cbiAgICBpZiBAbW9kZSBpcyAnbm9ybWFsJ1xuICAgICAgc3dyYXAuY2xlYXJQcm9wZXJ0aWVzKEBlZGl0b3IpXG4gICAgICBAZW5zdXJlQWxsU2VsZWN0aW9uc0FyZUVtcHR5KG9wZXJhdGlvbilcbiAgICAgIEBlbnN1cmVBbGxDdXJzb3JzQXJlTm90QXRFbmRPZkxpbmUoKVxuICAgIGVsc2UgaWYgQG1vZGUgaXMgJ3Zpc3VhbCdcbiAgICAgIEBtb2RlTWFuYWdlci51cGRhdGVOYXJyb3dlZFN0YXRlKClcbiAgICAgIEB2aW1TdGF0ZS51cGRhdGVQcmV2aW91c1NlbGVjdGlvbigpXG4gICAgQHZpbVN0YXRlLnVwZGF0ZUN1cnNvcnNWaXNpYmlsaXR5KClcbiAgICBAdmltU3RhdGUucmVzZXQoKVxuXG4gIGVuc3VyZUFsbFNlbGVjdGlvbnNBcmVFbXB0eTogKG9wZXJhdGlvbikgLT5cbiAgICAjIFdoZW4gQHZpbVN0YXRlLnNlbGVjdEJsb2Nrd2lzZSgpIGlzIGNhbGxlZCBpbiBub24tdmlzdWFsLW1vZGUuXG4gICAgIyBlLmcuIGAuYCByZXBlYXQgb2Ygb3BlcmF0aW9uIHRhcmdldGVkIGJsb2Nrd2lzZSBgQ3VycmVudFNlbGVjdGlvbmAuXG4gICAgIyBXZSBuZWVkIHRvIG1hbnVhbGx5IGNsZWFyIGJsb2Nrd2lzZVNlbGVjdGlvbi5cbiAgICAjIFNlZSAjNjQ3XG4gICAgQHZpbVN0YXRlLmNsZWFyQmxvY2t3aXNlU2VsZWN0aW9ucygpXG5cbiAgICB1bmxlc3MgQGVkaXRvci5nZXRMYXN0U2VsZWN0aW9uKCkuaXNFbXB0eSgpXG4gICAgICBpZiBzZXR0aW5ncy5nZXQoJ3Rocm93RXJyb3JPbk5vbkVtcHR5U2VsZWN0aW9uSW5Ob3JtYWxNb2RlJylcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiU2VsZWN0aW9uIGlzIG5vdCBlbXB0eSBpbiBub3JtYWwtbW9kZTogI3tvcGVyYXRpb24udG9TdHJpbmcoKX1cIilcbiAgICAgIGVsc2VcbiAgICAgICAgQHZpbVN0YXRlLmNsZWFyU2VsZWN0aW9ucygpXG5cbiAgZW5zdXJlQWxsQ3Vyc29yc0FyZU5vdEF0RW5kT2ZMaW5lOiAtPlxuICAgIGZvciBjdXJzb3IgaW4gQGVkaXRvci5nZXRDdXJzb3JzKCkgd2hlbiBjdXJzb3IuaXNBdEVuZE9mTGluZSgpXG4gICAgICBtb3ZlQ3Vyc29yTGVmdChjdXJzb3IsIHtwcmVzZXJ2ZUdvYWxDb2x1bW46IHRydWV9KVxuXG4gIGFkZFRvQ2xhc3NMaXN0OiAoY2xhc3NOYW1lKSAtPlxuICAgIEBlZGl0b3JFbGVtZW50LmNsYXNzTGlzdC5hZGQoY2xhc3NOYW1lKVxuICAgIEBzdWJzY3JpYmUgbmV3IERpc3Bvc2FibGUgPT5cbiAgICAgIEBlZGl0b3JFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoY2xhc3NOYW1lKVxuXG4gICMgQ291bnRcbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICMga2V5c3Ryb2tlIGAzZDJ3YCBkZWxldGUgNigzKjIpIHdvcmRzLlxuICAjICAybmQgbnVtYmVyKDIgaW4gdGhpcyBjYXNlKSBpcyBhbHdheXMgZW50ZXJkIGluIG9wZXJhdG9yLXBlbmRpbmctbW9kZS5cbiAgIyAgU28gY291bnQgaGF2ZSB0d28gdGltaW5nIHRvIGJlIGVudGVyZWQuIHRoYXQncyB3aHkgaGVyZSB3ZSBtYW5hZ2UgY291bnRlciBieSBtb2RlLlxuICBoYXNDb3VudDogLT5cbiAgICBAY291bnRbJ25vcm1hbCddPyBvciBAY291bnRbJ29wZXJhdG9yLXBlbmRpbmcnXT9cblxuICBnZXRDb3VudDogLT5cbiAgICBpZiBAaGFzQ291bnQoKVxuICAgICAgKEBjb3VudFsnbm9ybWFsJ10gPyAxKSAqIChAY291bnRbJ29wZXJhdG9yLXBlbmRpbmcnXSA/IDEpXG4gICAgZWxzZVxuICAgICAgbnVsbFxuXG4gIHNldENvdW50OiAobnVtYmVyKSAtPlxuICAgIG1vZGUgPSAnbm9ybWFsJ1xuICAgIG1vZGUgPSBAbW9kZSBpZiBAbW9kZSBpcyAnb3BlcmF0b3ItcGVuZGluZydcbiAgICBAY291bnRbbW9kZV0gPz0gMFxuICAgIEBjb3VudFttb2RlXSA9IChAY291bnRbbW9kZV0gKiAxMCkgKyBudW1iZXJcbiAgICBAdmltU3RhdGUuaG92ZXIuc2V0KEBidWlsZENvdW50U3RyaW5nKCkpXG4gICAgQHZpbVN0YXRlLnRvZ2dsZUNsYXNzTGlzdCgnd2l0aC1jb3VudCcsIHRydWUpXG5cbiAgYnVpbGRDb3VudFN0cmluZzogLT5cbiAgICBbQGNvdW50Wydub3JtYWwnXSwgQGNvdW50WydvcGVyYXRvci1wZW5kaW5nJ11dXG4gICAgICAuZmlsdGVyIChjb3VudCkgLT4gY291bnQ/XG4gICAgICAubWFwIChjb3VudCkgLT4gU3RyaW5nKGNvdW50KVxuICAgICAgLmpvaW4oJ3gnKVxuXG4gIHJlc2V0Q291bnQ6IC0+XG4gICAgQGNvdW50ID0ge31cbiAgICBAdmltU3RhdGUudG9nZ2xlQ2xhc3NMaXN0KCd3aXRoLWNvdW50JywgZmFsc2UpXG5cbm1vZHVsZS5leHBvcnRzID0gT3BlcmF0aW9uU3RhY2tcbiJdfQ==
