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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvb3BlcmF0aW9uLXN0YWNrLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsTUFBb0MsT0FBQSxDQUFRLE1BQVIsQ0FBcEMsRUFBQywyQkFBRCxFQUFhOztFQUNiLElBQUEsR0FBTyxPQUFBLENBQVEsUUFBUjs7RUFDTixpQkFBa0IsT0FBQSxDQUFRLFNBQVI7O0VBQ25CLE9BQStCLEVBQS9CLEVBQUMsb0JBQUQsRUFBUzs7RUFDUix3QkFBeUIsT0FBQSxDQUFRLFVBQVI7O0VBQzFCLEtBQUEsR0FBUSxPQUFBLENBQVEscUJBQVI7O0VBWUY7SUFDSixNQUFNLENBQUMsY0FBUCxDQUFzQixjQUFDLENBQUEsU0FBdkIsRUFBa0MsTUFBbEMsRUFBMEM7TUFBQSxHQUFBLEVBQUssU0FBQTtlQUFHLElBQUMsQ0FBQSxXQUFXLENBQUM7TUFBaEIsQ0FBTDtLQUExQzs7SUFDQSxNQUFNLENBQUMsY0FBUCxDQUFzQixjQUFDLENBQUEsU0FBdkIsRUFBa0MsU0FBbEMsRUFBNkM7TUFBQSxHQUFBLEVBQUssU0FBQTtlQUFHLElBQUMsQ0FBQSxXQUFXLENBQUM7TUFBaEIsQ0FBTDtLQUE3Qzs7SUFFYSx3QkFBQyxRQUFEO0FBQ1gsVUFBQTtNQURZLElBQUMsQ0FBQSxXQUFEO01BQ1osT0FBMEMsSUFBQyxDQUFBLFFBQTNDLEVBQUMsSUFBQyxDQUFBLGNBQUEsTUFBRixFQUFVLElBQUMsQ0FBQSxxQkFBQSxhQUFYLEVBQTBCLElBQUMsQ0FBQSxtQkFBQTtNQUUzQixJQUFDLENBQUEsYUFBRCxHQUFpQixJQUFJO01BQ3JCLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFDLENBQUEsUUFBUSxDQUFDLFlBQVYsQ0FBdUIsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENB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QUEsR0FBeUIsMERBQThCLENBQTlCLEVBRDNCO09BQUEsTUFBQTtlQUdFLEtBSEY7O0lBRFE7OzZCQU1WLFFBQUEsR0FBVSxTQUFDLE1BQUQ7QUFDUixVQUFBO01BQUEsSUFBQSxHQUFPO01BQ1AsSUFBZ0IsSUFBQyxDQUFBLElBQUQsS0FBUyxrQkFBekI7UUFBQSxJQUFBLEdBQU8sSUFBQyxDQUFBLEtBQVI7OztZQUNPLENBQUEsSUFBQSxJQUFTOztNQUNoQixJQUFDLENBQUEsS0FBTSxDQUFBLElBQUEsQ0FBUCxHQUFlLENBQUMsSUFBQyxDQUFBLEtBQU0sQ0FBQSxJQUFBLENBQVAsR0FBZSxFQUFoQixDQUFBLEdBQXNCO01BQ3JDLElBQUMsQ0FBQSxRQUFRLENBQUMsS0FBSyxDQUFDLEdBQWhCLENBQW9CLElBQUMsQ0FBQSxnQkFBRCxDQUFBLENBQXBCO2FBQ0EsSUFBQyxDQUFBLFFBQVEsQ0FBQyxlQUFWLENBQTBCLFlBQTFCLEVBQXdDLElBQXhDO0lBTlE7OzZCQVFWLGdCQUFBLEdBQWtCLFNBQUE7YUFDaEIsQ0FBQyxJQUFDLENBQUEsS0FBTSxDQUFBLFFBQUEsQ0FBUixFQUFtQixJQUFDLENBQUEsS0FBTSxDQUFBLGtCQUFBLENBQTFCLENBQ0UsQ0FBQyxNQURILENBQ1UsU0FBQyxLQUFEO2VBQVc7TUFBWCxDQURWLENBRUUsQ0FBQyxHQUZILENBRU8sU0FBQyxLQUFEO2VBQVcsTUFBQSxDQUFPLEtBQVA7TUFBWCxDQUZQLENBR0UsQ0FBQyxJQUhILENBR1EsR0FIUjtJQURnQjs7NkJBTWxCLFVBQUEsR0FBWSxTQUFBO01BQ1YsSUFBQyxDQUFBLEtBQUQsR0FBUzthQUNULElBQUMsQ0FBQSxRQUFRLENBQUMsZUFBVixDQUEwQixZQUExQixFQUF3QyxLQUF4QztJQUZVOzs7Ozs7RUFJZCxNQUFNLENBQUMsT0FBUCxHQUFpQjtBQTdPakIiLCJzb3VyY2VzQ29udGVudCI6WyJ7RGlzcG9zYWJsZSwgQ29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlICdhdG9tJ1xuQmFzZSA9IHJlcXVpcmUgJy4vYmFzZSdcbnttb3ZlQ3Vyc29yTGVmdH0gPSByZXF1aXJlICcuL3V0aWxzJ1xue1NlbGVjdCwgTW92ZVRvUmVsYXRpdmVMaW5lfSA9IHt9XG57T3BlcmF0aW9uQWJvcnRlZEVycm9yfSA9IHJlcXVpcmUgJy4vZXJyb3JzJ1xuc3dyYXAgPSByZXF1aXJlICcuL3NlbGVjdGlvbi13cmFwcGVyJ1xuXG4jIG9wcmF0aW9uIGxpZmUgaW4gb3BlcmF0aW9uU3RhY2tcbiMgMS4gcnVuXG4jICAgIGluc3RhbnRpYXRlZCBieSBuZXcuXG4jICAgIGNvbXBsaW1lbnQgaW1wbGljaXQgT3BlcmF0b3IuU2VsZWN0IG9wZXJhdG9yIGlmIG5lY2Vzc2FyeS5cbiMgICAgcHVzaCBvcGVyYXRpb24gdG8gc3RhY2suXG4jIDIuIHByb2Nlc3NcbiMgICAgcmVkdWNlIHN0YWNrIGJ5LCBwb3BwaW5nIHRvcCBvZiBzdGFjayB0aGVuIHNldCBpdCBhcyB0YXJnZXQgb2YgbmV3IHRvcC5cbiMgICAgY2hlY2sgaWYgcmVtYWluaW5nIHRvcCBvZiBzdGFjayBpcyBleGVjdXRhYmxlIGJ5IGNhbGxpbmcgaXNDb21wbGV0ZSgpXG4jICAgIGlmIGV4ZWN1dGFibGUsIHRoZW4gcG9wIHN0YWNrIHRoZW4gZXhlY3V0ZShwb3BwZWRPcGVyYXRpb24pXG4jICAgIGlmIG5vdCBleGVjdXRhYmxlLCBlbnRlciBcIm9wZXJhdG9yLXBlbmRpbmctbW9kZVwiXG5jbGFzcyBPcGVyYXRpb25TdGFja1xuICBPYmplY3QuZGVmaW5lUHJvcGVydHkgQHByb3RvdHlwZSwgJ21vZGUnLCBnZXQ6IC0+IEBtb2RlTWFuYWdlci5tb2RlXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSBAcHJvdG90eXBlLCAnc3VibW9kZScsIGdldDogLT4gQG1vZGVNYW5hZ2VyLnN1Ym1vZGVcblxuICBjb25zdHJ1Y3RvcjogKEB2aW1TdGF0ZSkgLT5cbiAgICB7QGVkaXRvciwgQGVkaXRvckVsZW1lbnQsIEBtb2RlTWFuYWdlcn0gPSBAdmltU3RhdGVcblxuICAgIEBzdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgQHZpbVN0YXRlLm9uRGlkRGVzdHJveShAZGVzdHJveS5iaW5kKHRoaXMpKVxuXG4gICAgU2VsZWN0ID89IEJhc2UuZ2V0Q2xhc3MoJ1NlbGVjdCcpXG4gICAgTW92ZVRvUmVsYXRpdmVMaW5lID89IEJhc2UuZ2V0Q2xhc3MoJ01vdmVUb1JlbGF0aXZlTGluZScpXG5cbiAgICBAcmVzZXQoKVxuXG4gICMgUmV0dXJuIGhhbmRsZXJcbiAgc3Vic2NyaWJlOiAoaGFuZGxlcikgLT5cbiAgICBAb3BlcmF0aW9uU3Vic2NyaXB0aW9ucy5hZGQoaGFuZGxlcilcbiAgICByZXR1cm4gaGFuZGxlciAjIERPTlQgUkVNT1ZFXG5cbiAgcmVzZXQ6IC0+XG4gICAgQHJlc2V0Q291bnQoKVxuICAgIEBzdGFjayA9IFtdXG4gICAgQHByb2Nlc3NpbmcgPSBmYWxzZVxuXG4gICAgIyB0aGlzIGhhcyB0byBiZSBCRUZPUkUgQG9wZXJhdGlvblN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG4gICAgQHZpbVN0YXRlLmVtaXREaWRSZXNldE9wZXJhdGlvblN0YWNrKClcblxuICAgIEBvcGVyYXRpb25TdWJzY3JpcHRpb25zPy5kaXNwb3NlKClcbiAgICBAb3BlcmF0aW9uU3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG5cbiAgZGVzdHJveTogLT5cbiAgICBAc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiAgICBAb3BlcmF0aW9uU3Vic2NyaXB0aW9ucz8uZGlzcG9zZSgpXG4gICAge0BzdGFjaywgQG9wZXJhdGlvblN1YnNjcmlwdGlvbnN9ID0ge31cblxuICBwZWVrVG9wOiAtPlxuICAgIEBzdGFja1tAc3RhY2subGVuZ3RoIC0gMV1cblxuICBpc0VtcHR5OiAtPlxuICAgIEBzdGFjay5sZW5ndGggaXMgMFxuXG4gICMgTWFpblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgcnVuOiAoa2xhc3MsIHByb3BlcnRpZXMpIC0+XG4gICAgIyBjb25zb2xlLmxvZyBAdmltU3RhdGUuZ2V0QmxvY2t3aXNlU2VsZWN0aW9ucygpLmxlbmd0aFxuICAgICMgY29uc29sZS5sb2cgc3dyYXAuZ2V0UHJvcGVydHlTdG9yZSgpLnNpemVcbiAgICB0cnlcbiAgICAgIEB2aW1TdGF0ZS5pbml0KCkgaWYgQGlzRW1wdHkoKVxuICAgICAgdHlwZSA9IHR5cGVvZihrbGFzcylcbiAgICAgIGlmIHR5cGUgaXMgJ29iamVjdCcgIyAuIHJlcGVhdCBjYXNlIHdlIGNhbiBleGVjdXRlIGFzLWl0LWlzLlxuICAgICAgICBvcGVyYXRpb24gPSBrbGFzc1xuICAgICAgZWxzZVxuICAgICAgICBrbGFzcyA9IEJhc2UuZ2V0Q2xhc3Moa2xhc3MpIGlmIHR5cGUgaXMgJ3N0cmluZydcbiAgICAgICAgIyBSZXBsYWNlIG9wZXJhdG9yIHdoZW4gaWRlbnRpY2FsIG9uZSByZXBlYXRlZCwgZS5nLiBgZGRgLCBgY2NgLCBgZ1VnVWBcbiAgICAgICAgaWYgQHBlZWtUb3AoKT8uY29uc3RydWN0b3IgaXMga2xhc3NcbiAgICAgICAgICBvcGVyYXRpb24gPSBuZXcgTW92ZVRvUmVsYXRpdmVMaW5lKEB2aW1TdGF0ZSlcbiAgICAgICAgZWxzZVxuICAgICAgICAgIG9wZXJhdGlvbiA9IG5ldyBrbGFzcyhAdmltU3RhdGUsIHByb3BlcnRpZXMpXG5cbiAgICAgIGlmIEBpc0VtcHR5KClcbiAgICAgICAgaXNWYWxpZE9wZXJhdGlvbiA9IHRydWVcbiAgICAgICAgaWYgKEBtb2RlIGlzICd2aXN1YWwnIGFuZCBvcGVyYXRpb24uaXNNb3Rpb24oKSkgb3Igb3BlcmF0aW9uLmlzVGV4dE9iamVjdCgpXG4gICAgICAgICAgb3BlcmF0aW9uID0gbmV3IFNlbGVjdChAdmltU3RhdGUpLnNldFRhcmdldChvcGVyYXRpb24pXG4gICAgICBlbHNlXG4gICAgICAgIGlzVmFsaWRPcGVyYXRpb24gPSBAcGVla1RvcCgpLmlzT3BlcmF0b3IoKSBhbmQgKG9wZXJhdGlvbi5pc01vdGlvbigpIG9yIG9wZXJhdGlvbi5pc1RleHRPYmplY3QoKSlcblxuICAgICAgaWYgaXNWYWxpZE9wZXJhdGlvblxuICAgICAgICBAc3RhY2sucHVzaChvcGVyYXRpb24pXG4gICAgICAgIEBwcm9jZXNzKClcbiAgICAgIGVsc2VcbiAgICAgICAgQHZpbVN0YXRlLmVtaXREaWRGYWlsVG9QdXNoVG9PcGVyYXRpb25TdGFjaygpXG4gICAgICAgIEB2aW1TdGF0ZS5yZXNldE5vcm1hbE1vZGUoKVxuICAgIGNhdGNoIGVycm9yXG4gICAgICBAaGFuZGxlRXJyb3IoZXJyb3IpXG5cbiAgcnVuUmVjb3JkZWQ6IC0+XG4gICAgaWYgb3BlcmF0aW9uID0gQHJlY29yZGVkT3BlcmF0aW9uXG4gICAgICBvcGVyYXRpb24uc2V0UmVwZWF0ZWQoKVxuICAgICAgaWYgQGhhc0NvdW50KClcbiAgICAgICAgY291bnQgPSBAZ2V0Q291bnQoKVxuICAgICAgICBvcGVyYXRpb24uY291bnQgPSBjb3VudFxuICAgICAgICBvcGVyYXRpb24udGFyZ2V0Py5jb3VudCA9IGNvdW50ICMgU29tZSBvcGVhcnRvciBoYXZlIG5vIHRhcmdldCBsaWtlIGN0cmwtYShpbmNyZWFzZSkuXG5cbiAgICAgIG9wZXJhdGlvbi5zdWJzY3JpYmVSZXNldE9jY3VycmVuY2VQYXR0ZXJuSWZOZWVkZWQoKVxuICAgICAgQHJ1bihvcGVyYXRpb24pXG5cbiAgcnVuUmVjb3JkZWRNb3Rpb246IChrZXksIHtyZXZlcnNlfT17fSkgLT5cbiAgICByZXR1cm4gdW5sZXNzIG9wZXJhdGlvbiA9IEB2aW1TdGF0ZS5nbG9iYWxTdGF0ZS5nZXQoa2V5KVxuXG4gICAgb3BlcmF0aW9uID0gb3BlcmF0aW9uLmNsb25lKEB2aW1TdGF0ZSlcbiAgICBvcGVyYXRpb24uc2V0UmVwZWF0ZWQoKVxuICAgIG9wZXJhdGlvbi5yZXNldENvdW50KClcbiAgICBpZiByZXZlcnNlXG4gICAgICBvcGVyYXRpb24uYmFja3dhcmRzID0gbm90IG9wZXJhdGlvbi5iYWNrd2FyZHNcbiAgICBAcnVuKG9wZXJhdGlvbilcblxuICBydW5DdXJyZW50RmluZDogKG9wdGlvbnMpIC0+XG4gICAgQHJ1blJlY29yZGVkTW90aW9uKCdjdXJyZW50RmluZCcsIG9wdGlvbnMpXG5cbiAgcnVuQ3VycmVudFNlYXJjaDogKG9wdGlvbnMpIC0+XG4gICAgQHJ1blJlY29yZGVkTW90aW9uKCdjdXJyZW50U2VhcmNoJywgb3B0aW9ucylcblxuICBoYW5kbGVFcnJvcjogKGVycm9yKSAtPlxuICAgIEB2aW1TdGF0ZS5yZXNldCgpXG4gICAgdW5sZXNzIGVycm9yIGluc3RhbmNlb2YgT3BlcmF0aW9uQWJvcnRlZEVycm9yXG4gICAgICB0aHJvdyBlcnJvclxuXG4gIGlzUHJvY2Vzc2luZzogLT5cbiAgICBAcHJvY2Vzc2luZ1xuXG4gIHByb2Nlc3M6IC0+XG4gICAgQHByb2Nlc3NpbmcgPSB0cnVlXG4gICAgaWYgQHN0YWNrLmxlbmd0aCBpcyAyXG4gICAgICAjIFtGSVhNRSBpZGVhbGx5XVxuICAgICAgIyBJZiB0YXJnZXQgaXMgbm90IGNvbXBsZXRlLCB3ZSBwb3N0cG9uZSBjb21wb3NpbmcgdGFyZ2V0IHdpdGggb3BlcmF0b3IgdG8ga2VlcCBzaXR1YXRpb24gc2ltcGxlLlxuICAgICAgIyBTbyB0aGF0IHdlIGNhbiBhc3N1bWUgd2hlbiB0YXJnZXQgaXMgc2V0IHRvIG9wZXJhdG9yIGl0J3MgY29tcGxldGUuXG4gICAgICAjIGUuZy4gYHkgcyB0IGEnKHN1cnJvdW5kIGZvciByYW5nZSBmcm9tIGhlcmUgdG8gdGlsbCBhKVxuICAgICAgcmV0dXJuIHVubGVzcyBAcGVla1RvcCgpLmlzQ29tcGxldGUoKVxuXG4gICAgICBvcGVyYXRpb24gPSBAc3RhY2sucG9wKClcbiAgICAgIEBwZWVrVG9wKCkuc2V0VGFyZ2V0KG9wZXJhdGlvbilcblxuICAgIHRvcCA9IEBwZWVrVG9wKClcblxuICAgIGlmIHRvcC5pc0NvbXBsZXRlKClcbiAgICAgIEBleGVjdXRlKEBzdGFjay5wb3AoKSlcbiAgICBlbHNlXG4gICAgICBpZiBAbW9kZSBpcyAnbm9ybWFsJyBhbmQgdG9wLmlzT3BlcmF0b3IoKVxuICAgICAgICBAbW9kZU1hbmFnZXIuYWN0aXZhdGUoJ29wZXJhdG9yLXBlbmRpbmcnKVxuXG4gICAgICAjIFRlbXBvcmFyeSBzZXQgd2hpbGUgY29tbWFuZCBpcyBydW5uaW5nXG4gICAgICBpZiBjb21tYW5kTmFtZSA9IHRvcC5jb25zdHJ1Y3Rvci5nZXRDb21tYW5kTmFtZVdpdGhvdXRQcmVmaXg/KClcbiAgICAgICAgQGFkZFRvQ2xhc3NMaXN0KGNvbW1hbmROYW1lICsgXCItcGVuZGluZ1wiKVxuXG4gIGV4ZWN1dGU6IChvcGVyYXRpb24pIC0+XG4gICAgZXhlY3V0aW9uID0gb3BlcmF0aW9uLmV4ZWN1dGUoKVxuICAgIGlmIGV4ZWN1dGlvbiBpbnN0YW5jZW9mIFByb21pc2VcbiAgICAgIGV4ZWN1dGlvblxuICAgICAgICAudGhlbiA9PiBAZmluaXNoKG9wZXJhdGlvbilcbiAgICAgICAgLmNhdGNoID0+IEBoYW5kbGVFcnJvcigpXG4gICAgZWxzZVxuICAgICAgQGZpbmlzaChvcGVyYXRpb24pXG5cbiAgY2FuY2VsOiAtPlxuICAgIGlmIEBtb2RlIG5vdCBpbiBbJ3Zpc3VhbCcsICdpbnNlcnQnXVxuICAgICAgQHZpbVN0YXRlLnJlc2V0Tm9ybWFsTW9kZSgpXG4gICAgICBAdmltU3RhdGUucmVzdG9yZU9yaWdpbmFsQ3Vyc29yUG9zaXRpb24oKVxuICAgIEBmaW5pc2goKVxuXG4gIGZpbmlzaDogKG9wZXJhdGlvbj1udWxsKSAtPlxuICAgIEByZWNvcmRlZE9wZXJhdGlvbiA9IG9wZXJhdGlvbiBpZiBvcGVyYXRpb24/LmlzUmVjb3JkYWJsZSgpXG4gICAgQHZpbVN0YXRlLmVtaXREaWRGaW5pc2hPcGVyYXRpb24oKVxuICAgIGlmIG9wZXJhdGlvbj8uaXNPcGVyYXRvcigpXG4gICAgICBvcGVyYXRpb24ucmVzZXRTdGF0ZSgpXG5cbiAgICBpZiBAbW9kZSBpcyAnbm9ybWFsJ1xuICAgICAgQGVuc3VyZUFsbFNlbGVjdGlvbnNBcmVFbXB0eShvcGVyYXRpb24pXG4gICAgICBAZW5zdXJlQWxsQ3Vyc29yc0FyZU5vdEF0RW5kT2ZMaW5lKClcbiAgICBlbHNlIGlmIEBtb2RlIGlzICd2aXN1YWwnXG4gICAgICBAbW9kZU1hbmFnZXIudXBkYXRlTmFycm93ZWRTdGF0ZSgpXG4gICAgICBAdmltU3RhdGUudXBkYXRlUHJldmlvdXNTZWxlY3Rpb24oKVxuXG4gICAgQHZpbVN0YXRlLnVwZGF0ZUN1cnNvcnNWaXNpYmlsaXR5KClcbiAgICBAdmltU3RhdGUucmVzZXQoKVxuXG4gIGVuc3VyZUFsbFNlbGVjdGlvbnNBcmVFbXB0eTogKG9wZXJhdGlvbikgLT5cbiAgICAjIFdoZW4gQHZpbVN0YXRlLnNlbGVjdEJsb2Nrd2lzZSgpIGlzIGNhbGxlZCBpbiBub24tdmlzdWFsLW1vZGUuXG4gICAgIyBlLmcuIGAuYCByZXBlYXQgb2Ygb3BlcmF0aW9uIHRhcmdldGVkIGJsb2Nrd2lzZSBgQ3VycmVudFNlbGVjdGlvbmAuXG4gICAgIyBXZSBuZWVkIHRvIG1hbnVhbGx5IGNsZWFyIGJsb2Nrd2lzZVNlbGVjdGlvbi5cbiAgICAjIFNlZSAjNjQ3XG4gICAgQHZpbVN0YXRlLmNsZWFyQmxvY2t3aXNlU2VsZWN0aW9ucygpICMgRklYTUUsIHNob3VsZCBiZSByZW1vdmVkXG5cbiAgICB1bmxlc3MgQGVkaXRvci5nZXRMYXN0U2VsZWN0aW9uKCkuaXNFbXB0eSgpXG4gICAgICBpZiBAdmltU3RhdGUuZ2V0Q29uZmlnKCdkZXZUaHJvd0Vycm9yT25Ob25FbXB0eVNlbGVjdGlvbkluTm9ybWFsTW9kZScpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlNlbGVjdGlvbiBpcyBub3QgZW1wdHkgaW4gbm9ybWFsLW1vZGU6ICN7b3BlcmF0aW9uLnRvU3RyaW5nKCl9XCIpXG4gICAgICBlbHNlXG4gICAgICAgIEB2aW1TdGF0ZS5jbGVhclNlbGVjdGlvbnMoKVxuXG4gIGVuc3VyZUFsbEN1cnNvcnNBcmVOb3RBdEVuZE9mTGluZTogLT5cbiAgICBmb3IgY3Vyc29yIGluIEBlZGl0b3IuZ2V0Q3Vyc29ycygpIHdoZW4gY3Vyc29yLmlzQXRFbmRPZkxpbmUoKVxuICAgICAgbW92ZUN1cnNvckxlZnQoY3Vyc29yLCBwcmVzZXJ2ZUdvYWxDb2x1bW46IHRydWUpXG5cbiAgYWRkVG9DbGFzc0xpc3Q6IChjbGFzc05hbWUpIC0+XG4gICAgQGVkaXRvckVsZW1lbnQuY2xhc3NMaXN0LmFkZChjbGFzc05hbWUpXG4gICAgQHN1YnNjcmliZSBuZXcgRGlzcG9zYWJsZSA9PlxuICAgICAgQGVkaXRvckVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShjbGFzc05hbWUpXG5cbiAgIyBDb3VudFxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgIyBrZXlzdHJva2UgYDNkMndgIGRlbGV0ZSA2KDMqMikgd29yZHMuXG4gICMgIDJuZCBudW1iZXIoMiBpbiB0aGlzIGNhc2UpIGlzIGFsd2F5cyBlbnRlcmQgaW4gb3BlcmF0b3ItcGVuZGluZy1tb2RlLlxuICAjICBTbyBjb3VudCBoYXZlIHR3byB0aW1pbmcgdG8gYmUgZW50ZXJlZC4gdGhhdCdzIHdoeSBoZXJlIHdlIG1hbmFnZSBjb3VudGVyIGJ5IG1vZGUuXG4gIGhhc0NvdW50OiAtPlxuICAgIEBjb3VudFsnbm9ybWFsJ10/IG9yIEBjb3VudFsnb3BlcmF0b3ItcGVuZGluZyddP1xuXG4gIGdldENvdW50OiAtPlxuICAgIGlmIEBoYXNDb3VudCgpXG4gICAgICAoQGNvdW50Wydub3JtYWwnXSA/IDEpICogKEBjb3VudFsnb3BlcmF0b3ItcGVuZGluZyddID8gMSlcbiAgICBlbHNlXG4gICAgICBudWxsXG5cbiAgc2V0Q291bnQ6IChudW1iZXIpIC0+XG4gICAgbW9kZSA9ICdub3JtYWwnXG4gICAgbW9kZSA9IEBtb2RlIGlmIEBtb2RlIGlzICdvcGVyYXRvci1wZW5kaW5nJ1xuICAgIEBjb3VudFttb2RlXSA/PSAwXG4gICAgQGNvdW50W21vZGVdID0gKEBjb3VudFttb2RlXSAqIDEwKSArIG51bWJlclxuICAgIEB2aW1TdGF0ZS5ob3Zlci5zZXQoQGJ1aWxkQ291bnRTdHJpbmcoKSlcbiAgICBAdmltU3RhdGUudG9nZ2xlQ2xhc3NMaXN0KCd3aXRoLWNvdW50JywgdHJ1ZSlcblxuICBidWlsZENvdW50U3RyaW5nOiAtPlxuICAgIFtAY291bnRbJ25vcm1hbCddLCBAY291bnRbJ29wZXJhdG9yLXBlbmRpbmcnXV1cbiAgICAgIC5maWx0ZXIgKGNvdW50KSAtPiBjb3VudD9cbiAgICAgIC5tYXAgKGNvdW50KSAtPiBTdHJpbmcoY291bnQpXG4gICAgICAuam9pbigneCcpXG5cbiAgcmVzZXRDb3VudDogLT5cbiAgICBAY291bnQgPSB7fVxuICAgIEB2aW1TdGF0ZS50b2dnbGVDbGFzc0xpc3QoJ3dpdGgtY291bnQnLCBmYWxzZSlcblxubW9kdWxlLmV4cG9ydHMgPSBPcGVyYXRpb25TdGFja1xuIl19
