(function() {
  var Base, CompositeDisposable, Disposable, MoveToRelativeLine, OperationAbortedError, OperationStack, Select, ref, ref1;

  ref = require('atom'), Disposable = ref.Disposable, CompositeDisposable = ref.CompositeDisposable;

  Base = require('./base');

  ref1 = [], OperationAbortedError = ref1[0], Select = ref1[1], MoveToRelativeLine = ref1[2];

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
      ref2 = this.vimState, this.editor = ref2.editor, this.editorElement = ref2.editorElement, this.modeManager = ref2.modeManager, this.swrap = ref2.swrap;
      this.subscriptions = new CompositeDisposable;
      this.subscriptions.add(this.vimState.onDidDestroy(this.destroy.bind(this)));
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

    OperationStack.prototype.newMoveToRelativeLine = function() {
      if (MoveToRelativeLine == null) {
        MoveToRelativeLine = Base.getClass('MoveToRelativeLine');
      }
      return new MoveToRelativeLine(this.vimState);
    };

    OperationStack.prototype.newSelectWithTarget = function(target) {
      if (Select == null) {
        Select = Base.getClass('Select');
      }
      return new Select(this.vimState).setTarget(target);
    };

    OperationStack.prototype.run = function(klass, properties) {
      var $selection, error, i, len, operation, ref2, ref3, type;
      if (this.mode === 'visual') {
        ref2 = this.swrap.getSelections(this.editor);
        for (i = 0, len = ref2.length; i < len; i++) {
          $selection = ref2[i];
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
          if (((ref3 = this.peekTop()) != null ? ref3.constructor : void 0) === klass) {
            operation = this.newMoveToRelativeLine();
          } else {
            operation = new klass(this.vimState, properties);
          }
        }
        switch (false) {
          case !this.isEmpty():
            if ((this.mode === 'visual' && operation.isMotion()) || operation.isTextObject()) {
              operation = this.newSelectWithTarget(operation);
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
      var count, operation, ref2;
      if (operation = this.recordedOperation) {
        operation.repeated = true;
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
      if (OperationAbortedError == null) {
        OperationAbortedError = require('./errors');
      }
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
      this.vimState.cursorStyleManager.refresh();
      return this.vimState.reset();
    };

    OperationStack.prototype.ensureAllSelectionsAreEmpty = function(operation) {
      this.vimState.clearBlockwiseSelections();
      if (this.vimState.haveSomeNonEmptySelection()) {
        if (this.vimState.getConfig('strictAssertion')) {
          this.vimState.utils.assertWithException(false, "Have some non-empty selection in normal-mode: " + (operation.toString()));
        }
        return this.vimState.clearSelections();
      }
    };

    OperationStack.prototype.ensureAllCursorsAreNotAtEndOfLine = function() {
      var cursor, i, len, ref2, results;
      ref2 = this.editor.getCursors();
      results = [];
      for (i = 0, len = ref2.length; i < len; i++) {
        cursor = ref2[i];
        if (cursor.isAtEndOfLine()) {
          results.push(this.vimState.utils.moveCursorLeft(cursor, {
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
      return this.editorElement.classList.toggle('with-count', true);
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
      return this.editorElement.classList.remove('with-count');
    };

    return OperationStack;

  })();

  module.exports = OperationStack;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvb3BlcmF0aW9uLXN0YWNrLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsTUFBb0MsT0FBQSxDQUFRLE1BQVIsQ0FBcEMsRUFBQywyQkFBRCxFQUFhOztFQUNiLElBQUEsR0FBTyxPQUFBLENBQVEsUUFBUjs7RUFFUCxPQUFzRCxFQUF0RCxFQUFDLCtCQUFELEVBQXdCLGdCQUF4QixFQUFnQzs7RUFZMUI7SUFDSixNQUFNLENBQUMsY0FBUCxDQUFzQixjQUFDLENBQUEsU0FBdkIsRUFBa0MsTUFBbEMsRUFBMEM7TUFBQSxHQUFBLEVBQUssU0FBQTtlQUFHLElBQUMsQ0FBQSxXQUFXLENBQUM7TUFBaEIsQ0FBTDtLQUExQzs7SUFDQSxNQUFNLENBQUMsY0FBUCxDQUFzQixjQUFDLENBQUEsU0FBdkIsRUFBa0MsU0FBbEMsRUFBNkM7TUFBQSxHQUFBLEVBQUssU0FBQTtlQUFHLElBQUMsQ0FBQSxXQUFXLENBQUM7TUFBaEIsQ0FBTDtLQUE3Qzs7SUFFYSx3QkFBQyxRQUFEO0FBQ1gsVUFBQTtNQURZLElBQUMsQ0FBQSxXQUFEO01BQ1osT0FBa0QsSUFBQyxDQUFBLFFBQW5ELEVBQUMsSUFBQyxDQUFBLGNBQUEsTUFBRixFQUFVLElBQUMsQ0FBQSxxQkFBQSxhQUFYLEVBQTBCLElBQUMsQ0FBQSxtQkFBQSxXQUEzQixFQUF3QyxJQUFDLENBQUEsYUFBQTtNQUV6QyxJQUFDLENBQUEsYUFBRCxHQUFpQixJQUFJO01BQ3JCLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFDLENBQUEsUUFBUSxDQUFDLFlBQVYsQ0FBdUIsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQWMsSUFBZCxDQUF2QixDQUFuQjtNQUVBLElBQUMsQ0FBQSxLQUFELENBQUE7SUFO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QVcsTUFBQSxDQUFPLEtBQVA7TUFBWCxDQUZQLENBR0UsQ0FBQyxJQUhILENBR1EsR0FIUjtJQURnQjs7NkJBTWxCLFVBQUEsR0FBWSxTQUFBO01BQ1YsSUFBQyxDQUFBLEtBQUQsR0FBUzthQUNULElBQUMsQ0FBQSxhQUFhLENBQUMsU0FBUyxDQUFDLE1BQXpCLENBQWdDLFlBQWhDO0lBRlU7Ozs7OztFQUlkLE1BQU0sQ0FBQyxPQUFQLEdBQWlCO0FBalBqQiIsInNvdXJjZXNDb250ZW50IjpbIntEaXNwb3NhYmxlLCBDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2F0b20nXG5CYXNlID0gcmVxdWlyZSAnLi9iYXNlJ1xuXG5bT3BlcmF0aW9uQWJvcnRlZEVycm9yLCBTZWxlY3QsIE1vdmVUb1JlbGF0aXZlTGluZV0gPSBbXVxuXG4jIG9wcmF0aW9uIGxpZmUgaW4gb3BlcmF0aW9uU3RhY2tcbiMgMS4gcnVuXG4jICAgIGluc3RhbnRpYXRlZCBieSBuZXcuXG4jICAgIGNvbXBsaW1lbnQgaW1wbGljaXQgT3BlcmF0b3IuU2VsZWN0IG9wZXJhdG9yIGlmIG5lY2Vzc2FyeS5cbiMgICAgcHVzaCBvcGVyYXRpb24gdG8gc3RhY2suXG4jIDIuIHByb2Nlc3NcbiMgICAgcmVkdWNlIHN0YWNrIGJ5LCBwb3BwaW5nIHRvcCBvZiBzdGFjayB0aGVuIHNldCBpdCBhcyB0YXJnZXQgb2YgbmV3IHRvcC5cbiMgICAgY2hlY2sgaWYgcmVtYWluaW5nIHRvcCBvZiBzdGFjayBpcyBleGVjdXRhYmxlIGJ5IGNhbGxpbmcgaXNDb21wbGV0ZSgpXG4jICAgIGlmIGV4ZWN1dGFibGUsIHRoZW4gcG9wIHN0YWNrIHRoZW4gZXhlY3V0ZShwb3BwZWRPcGVyYXRpb24pXG4jICAgIGlmIG5vdCBleGVjdXRhYmxlLCBlbnRlciBcIm9wZXJhdG9yLXBlbmRpbmctbW9kZVwiXG5jbGFzcyBPcGVyYXRpb25TdGFja1xuICBPYmplY3QuZGVmaW5lUHJvcGVydHkgQHByb3RvdHlwZSwgJ21vZGUnLCBnZXQ6IC0+IEBtb2RlTWFuYWdlci5tb2RlXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSBAcHJvdG90eXBlLCAnc3VibW9kZScsIGdldDogLT4gQG1vZGVNYW5hZ2VyLnN1Ym1vZGVcblxuICBjb25zdHJ1Y3RvcjogKEB2aW1TdGF0ZSkgLT5cbiAgICB7QGVkaXRvciwgQGVkaXRvckVsZW1lbnQsIEBtb2RlTWFuYWdlciwgQHN3cmFwfSA9IEB2aW1TdGF0ZVxuXG4gICAgQHN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBAdmltU3RhdGUub25EaWREZXN0cm95KEBkZXN0cm95LmJpbmQodGhpcykpXG5cbiAgICBAcmVzZXQoKVxuXG4gICMgUmV0dXJuIGhhbmRsZXJcbiAgc3Vic2NyaWJlOiAoaGFuZGxlcikgLT5cbiAgICBAb3BlcmF0aW9uU3Vic2NyaXB0aW9ucy5hZGQoaGFuZGxlcilcbiAgICByZXR1cm4gaGFuZGxlciAjIERPTlQgUkVNT1ZFXG5cbiAgcmVzZXQ6IC0+XG4gICAgQHJlc2V0Q291bnQoKVxuICAgIEBzdGFjayA9IFtdXG4gICAgQHByb2Nlc3NpbmcgPSBmYWxzZVxuXG4gICAgIyB0aGlzIGhhcyB0byBiZSBCRUZPUkUgQG9wZXJhdGlvblN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG4gICAgQHZpbVN0YXRlLmVtaXREaWRSZXNldE9wZXJhdGlvblN0YWNrKClcblxuICAgIEBvcGVyYXRpb25TdWJzY3JpcHRpb25zPy5kaXNwb3NlKClcbiAgICBAb3BlcmF0aW9uU3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG5cbiAgZGVzdHJveTogLT5cbiAgICBAc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiAgICBAb3BlcmF0aW9uU3Vic2NyaXB0aW9ucz8uZGlzcG9zZSgpXG4gICAge0BzdGFjaywgQG9wZXJhdGlvblN1YnNjcmlwdGlvbnN9ID0ge31cblxuICBwZWVrVG9wOiAtPlxuICAgIEBzdGFja1tAc3RhY2subGVuZ3RoIC0gMV1cblxuICBpc0VtcHR5OiAtPlxuICAgIEBzdGFjay5sZW5ndGggaXMgMFxuXG4gIG5ld01vdmVUb1JlbGF0aXZlTGluZTogLT5cbiAgICBNb3ZlVG9SZWxhdGl2ZUxpbmUgPz0gQmFzZS5nZXRDbGFzcygnTW92ZVRvUmVsYXRpdmVMaW5lJylcbiAgICBuZXcgTW92ZVRvUmVsYXRpdmVMaW5lKEB2aW1TdGF0ZSlcblxuICBuZXdTZWxlY3RXaXRoVGFyZ2V0OiAodGFyZ2V0KSAtPlxuICAgIFNlbGVjdCA/PSBCYXNlLmdldENsYXNzKCdTZWxlY3QnKVxuICAgIG5ldyBTZWxlY3QoQHZpbVN0YXRlKS5zZXRUYXJnZXQodGFyZ2V0KVxuXG4gICMgTWFpblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgcnVuOiAoa2xhc3MsIHByb3BlcnRpZXMpIC0+XG4gICAgaWYgQG1vZGUgaXMgJ3Zpc3VhbCdcbiAgICAgIGZvciAkc2VsZWN0aW9uIGluIEBzd3JhcC5nZXRTZWxlY3Rpb25zKEBlZGl0b3IpIHdoZW4gbm90ICRzZWxlY3Rpb24uaGFzUHJvcGVydGllcygpXG4gICAgICAgICRzZWxlY3Rpb24uc2F2ZVByb3BlcnRpZXMoKVxuXG4gICAgdHJ5XG4gICAgICBAdmltU3RhdGUuaW5pdCgpIGlmIEBpc0VtcHR5KClcbiAgICAgIHR5cGUgPSB0eXBlb2Yoa2xhc3MpXG4gICAgICBpZiB0eXBlIGlzICdvYmplY3QnICMgLiByZXBlYXQgY2FzZSB3ZSBjYW4gZXhlY3V0ZSBhcy1pdC1pcy5cbiAgICAgICAgb3BlcmF0aW9uID0ga2xhc3NcbiAgICAgIGVsc2VcbiAgICAgICAga2xhc3MgPSBCYXNlLmdldENsYXNzKGtsYXNzKSBpZiB0eXBlIGlzICdzdHJpbmcnXG5cbiAgICAgICAgIyBSZXBsYWNlIG9wZXJhdG9yIHdoZW4gaWRlbnRpY2FsIG9uZSByZXBlYXRlZCwgZS5nLiBgZGRgLCBgY2NgLCBgZ1VnVWBcbiAgICAgICAgaWYgQHBlZWtUb3AoKT8uY29uc3RydWN0b3IgaXMga2xhc3NcbiAgICAgICAgICBvcGVyYXRpb24gPSBAbmV3TW92ZVRvUmVsYXRpdmVMaW5lKClcbiAgICAgICAgZWxzZVxuICAgICAgICAgIG9wZXJhdGlvbiA9IG5ldyBrbGFzcyhAdmltU3RhdGUsIHByb3BlcnRpZXMpXG5cbiAgICAgIHN3aXRjaFxuICAgICAgICB3aGVuIEBpc0VtcHR5KClcbiAgICAgICAgICBpZiAoQG1vZGUgaXMgJ3Zpc3VhbCcgYW5kIG9wZXJhdGlvbi5pc01vdGlvbigpKSBvciBvcGVyYXRpb24uaXNUZXh0T2JqZWN0KClcbiAgICAgICAgICAgIG9wZXJhdGlvbiA9IEBuZXdTZWxlY3RXaXRoVGFyZ2V0KG9wZXJhdGlvbilcbiAgICAgICAgICBAc3RhY2sucHVzaChvcGVyYXRpb24pXG4gICAgICAgICAgQHByb2Nlc3MoKVxuICAgICAgICB3aGVuIEBwZWVrVG9wKCkuaXNPcGVyYXRvcigpIGFuZCAob3BlcmF0aW9uLmlzTW90aW9uKCkgb3Igb3BlcmF0aW9uLmlzVGV4dE9iamVjdCgpKVxuICAgICAgICAgIEBzdGFjay5wdXNoKG9wZXJhdGlvbilcbiAgICAgICAgICBAcHJvY2VzcygpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBAdmltU3RhdGUuZW1pdERpZEZhaWxUb1B1c2hUb09wZXJhdGlvblN0YWNrKClcbiAgICAgICAgICBAdmltU3RhdGUucmVzZXROb3JtYWxNb2RlKClcbiAgICBjYXRjaCBlcnJvclxuICAgICAgQGhhbmRsZUVycm9yKGVycm9yKVxuXG4gIHJ1blJlY29yZGVkOiAtPlxuICAgIGlmIG9wZXJhdGlvbiA9IEByZWNvcmRlZE9wZXJhdGlvblxuICAgICAgb3BlcmF0aW9uLnJlcGVhdGVkID0gdHJ1ZVxuICAgICAgaWYgQGhhc0NvdW50KClcbiAgICAgICAgY291bnQgPSBAZ2V0Q291bnQoKVxuICAgICAgICBvcGVyYXRpb24uY291bnQgPSBjb3VudFxuICAgICAgICBvcGVyYXRpb24udGFyZ2V0Py5jb3VudCA9IGNvdW50ICMgU29tZSBvcGVhcnRvciBoYXZlIG5vIHRhcmdldCBsaWtlIGN0cmwtYShpbmNyZWFzZSkuXG5cbiAgICAgIG9wZXJhdGlvbi5zdWJzY3JpYmVSZXNldE9jY3VycmVuY2VQYXR0ZXJuSWZOZWVkZWQoKVxuICAgICAgQHJ1bihvcGVyYXRpb24pXG5cbiAgcnVuUmVjb3JkZWRNb3Rpb246IChrZXksIHtyZXZlcnNlfT17fSkgLT5cbiAgICByZXR1cm4gdW5sZXNzIG9wZXJhdGlvbiA9IEB2aW1TdGF0ZS5nbG9iYWxTdGF0ZS5nZXQoa2V5KVxuXG4gICAgb3BlcmF0aW9uID0gb3BlcmF0aW9uLmNsb25lKEB2aW1TdGF0ZSlcbiAgICBvcGVyYXRpb24ucmVwZWF0ZWQgPSB0cnVlXG4gICAgb3BlcmF0aW9uLnJlc2V0Q291bnQoKVxuICAgIGlmIHJldmVyc2VcbiAgICAgIG9wZXJhdGlvbi5iYWNrd2FyZHMgPSBub3Qgb3BlcmF0aW9uLmJhY2t3YXJkc1xuICAgIEBydW4ob3BlcmF0aW9uKVxuXG4gIHJ1bkN1cnJlbnRGaW5kOiAob3B0aW9ucykgLT5cbiAgICBAcnVuUmVjb3JkZWRNb3Rpb24oJ2N1cnJlbnRGaW5kJywgb3B0aW9ucylcblxuICBydW5DdXJyZW50U2VhcmNoOiAob3B0aW9ucykgLT5cbiAgICBAcnVuUmVjb3JkZWRNb3Rpb24oJ2N1cnJlbnRTZWFyY2gnLCBvcHRpb25zKVxuXG4gIGhhbmRsZUVycm9yOiAoZXJyb3IpIC0+XG4gICAgQHZpbVN0YXRlLnJlc2V0KClcbiAgICBPcGVyYXRpb25BYm9ydGVkRXJyb3IgPz0gcmVxdWlyZSAnLi9lcnJvcnMnXG4gICAgdW5sZXNzIGVycm9yIGluc3RhbmNlb2YgT3BlcmF0aW9uQWJvcnRlZEVycm9yXG4gICAgICB0aHJvdyBlcnJvclxuXG4gIGlzUHJvY2Vzc2luZzogLT5cbiAgICBAcHJvY2Vzc2luZ1xuXG4gIHByb2Nlc3M6IC0+XG4gICAgQHByb2Nlc3NpbmcgPSB0cnVlXG4gICAgaWYgQHN0YWNrLmxlbmd0aCBpcyAyXG4gICAgICAjIFtGSVhNRSBpZGVhbGx5XVxuICAgICAgIyBJZiB0YXJnZXQgaXMgbm90IGNvbXBsZXRlLCB3ZSBwb3N0cG9uZSBjb21wb3NpbmcgdGFyZ2V0IHdpdGggb3BlcmF0b3IgdG8ga2VlcCBzaXR1YXRpb24gc2ltcGxlLlxuICAgICAgIyBTbyB0aGF0IHdlIGNhbiBhc3N1bWUgd2hlbiB0YXJnZXQgaXMgc2V0IHRvIG9wZXJhdG9yIGl0J3MgY29tcGxldGUuXG4gICAgICAjIGUuZy4gYHkgcyB0IGEnKHN1cnJvdW5kIGZvciByYW5nZSBmcm9tIGhlcmUgdG8gdGlsbCBhKVxuICAgICAgcmV0dXJuIHVubGVzcyBAcGVla1RvcCgpLmlzQ29tcGxldGUoKVxuXG4gICAgICBvcGVyYXRpb24gPSBAc3RhY2sucG9wKClcbiAgICAgIEBwZWVrVG9wKCkuc2V0VGFyZ2V0KG9wZXJhdGlvbilcblxuICAgIHRvcCA9IEBwZWVrVG9wKClcblxuICAgIGlmIHRvcC5pc0NvbXBsZXRlKClcbiAgICAgIEBleGVjdXRlKEBzdGFjay5wb3AoKSlcbiAgICBlbHNlXG4gICAgICBpZiBAbW9kZSBpcyAnbm9ybWFsJyBhbmQgdG9wLmlzT3BlcmF0b3IoKVxuICAgICAgICBAbW9kZU1hbmFnZXIuYWN0aXZhdGUoJ29wZXJhdG9yLXBlbmRpbmcnKVxuXG4gICAgICAjIFRlbXBvcmFyeSBzZXQgd2hpbGUgY29tbWFuZCBpcyBydW5uaW5nXG4gICAgICBpZiBjb21tYW5kTmFtZSA9IHRvcC5jb25zdHJ1Y3Rvci5nZXRDb21tYW5kTmFtZVdpdGhvdXRQcmVmaXg/KClcbiAgICAgICAgQGFkZFRvQ2xhc3NMaXN0KGNvbW1hbmROYW1lICsgXCItcGVuZGluZ1wiKVxuXG4gIGV4ZWN1dGU6IChvcGVyYXRpb24pIC0+XG4gICAgZXhlY3V0aW9uID0gb3BlcmF0aW9uLmV4ZWN1dGUoKVxuICAgIGlmIGV4ZWN1dGlvbiBpbnN0YW5jZW9mIFByb21pc2VcbiAgICAgIGV4ZWN1dGlvblxuICAgICAgICAudGhlbiA9PiBAZmluaXNoKG9wZXJhdGlvbilcbiAgICAgICAgLmNhdGNoID0+IEBoYW5kbGVFcnJvcigpXG4gICAgZWxzZVxuICAgICAgQGZpbmlzaChvcGVyYXRpb24pXG5cbiAgY2FuY2VsOiAtPlxuICAgIGlmIEBtb2RlIG5vdCBpbiBbJ3Zpc3VhbCcsICdpbnNlcnQnXVxuICAgICAgQHZpbVN0YXRlLnJlc2V0Tm9ybWFsTW9kZSgpXG4gICAgICBAdmltU3RhdGUucmVzdG9yZU9yaWdpbmFsQ3Vyc29yUG9zaXRpb24oKVxuICAgIEBmaW5pc2goKVxuXG4gIGZpbmlzaDogKG9wZXJhdGlvbj1udWxsKSAtPlxuICAgIEByZWNvcmRlZE9wZXJhdGlvbiA9IG9wZXJhdGlvbiBpZiBvcGVyYXRpb24/LnJlY29yZGFibGVcbiAgICBAdmltU3RhdGUuZW1pdERpZEZpbmlzaE9wZXJhdGlvbigpXG4gICAgaWYgb3BlcmF0aW9uPy5pc09wZXJhdG9yKClcbiAgICAgIG9wZXJhdGlvbi5yZXNldFN0YXRlKClcblxuICAgIGlmIEBtb2RlIGlzICdub3JtYWwnXG4gICAgICBAZW5zdXJlQWxsU2VsZWN0aW9uc0FyZUVtcHR5KG9wZXJhdGlvbilcbiAgICAgIEBlbnN1cmVBbGxDdXJzb3JzQXJlTm90QXRFbmRPZkxpbmUoKVxuICAgIGVsc2UgaWYgQG1vZGUgaXMgJ3Zpc3VhbCdcbiAgICAgIEBtb2RlTWFuYWdlci51cGRhdGVOYXJyb3dlZFN0YXRlKClcbiAgICAgIEB2aW1TdGF0ZS51cGRhdGVQcmV2aW91c1NlbGVjdGlvbigpXG5cbiAgICBAdmltU3RhdGUuY3Vyc29yU3R5bGVNYW5hZ2VyLnJlZnJlc2goKVxuICAgIEB2aW1TdGF0ZS5yZXNldCgpXG5cbiAgZW5zdXJlQWxsU2VsZWN0aW9uc0FyZUVtcHR5OiAob3BlcmF0aW9uKSAtPlxuICAgICMgV2hlbiBAdmltU3RhdGUuc2VsZWN0QmxvY2t3aXNlKCkgaXMgY2FsbGVkIGluIG5vbi12aXN1YWwtbW9kZS5cbiAgICAjIGUuZy4gYC5gIHJlcGVhdCBvZiBvcGVyYXRpb24gdGFyZ2V0ZWQgYmxvY2t3aXNlIGBDdXJyZW50U2VsZWN0aW9uYC5cbiAgICAjIFdlIG5lZWQgdG8gbWFudWFsbHkgY2xlYXIgYmxvY2t3aXNlU2VsZWN0aW9uLlxuICAgICMgU2VlICM2NDdcbiAgICBAdmltU3RhdGUuY2xlYXJCbG9ja3dpc2VTZWxlY3Rpb25zKCkgIyBGSVhNRSwgc2hvdWxkIGJlIHJlbW92ZWRcbiAgICBpZiBAdmltU3RhdGUuaGF2ZVNvbWVOb25FbXB0eVNlbGVjdGlvbigpXG4gICAgICBpZiBAdmltU3RhdGUuZ2V0Q29uZmlnKCdzdHJpY3RBc3NlcnRpb24nKVxuICAgICAgICBAdmltU3RhdGUudXRpbHMuYXNzZXJ0V2l0aEV4Y2VwdGlvbihmYWxzZSwgXCJIYXZlIHNvbWUgbm9uLWVtcHR5IHNlbGVjdGlvbiBpbiBub3JtYWwtbW9kZTogI3tvcGVyYXRpb24udG9TdHJpbmcoKX1cIilcbiAgICAgIEB2aW1TdGF0ZS5jbGVhclNlbGVjdGlvbnMoKVxuXG4gIGVuc3VyZUFsbEN1cnNvcnNBcmVOb3RBdEVuZE9mTGluZTogLT5cbiAgICBmb3IgY3Vyc29yIGluIEBlZGl0b3IuZ2V0Q3Vyc29ycygpIHdoZW4gY3Vyc29yLmlzQXRFbmRPZkxpbmUoKVxuICAgICAgQHZpbVN0YXRlLnV0aWxzLm1vdmVDdXJzb3JMZWZ0KGN1cnNvciwgcHJlc2VydmVHb2FsQ29sdW1uOiB0cnVlKVxuXG4gIGFkZFRvQ2xhc3NMaXN0OiAoY2xhc3NOYW1lKSAtPlxuICAgIEBlZGl0b3JFbGVtZW50LmNsYXNzTGlzdC5hZGQoY2xhc3NOYW1lKVxuICAgIEBzdWJzY3JpYmUgbmV3IERpc3Bvc2FibGUgPT5cbiAgICAgIEBlZGl0b3JFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoY2xhc3NOYW1lKVxuXG4gICMgQ291bnRcbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICMga2V5c3Ryb2tlIGAzZDJ3YCBkZWxldGUgNigzKjIpIHdvcmRzLlxuICAjICAybmQgbnVtYmVyKDIgaW4gdGhpcyBjYXNlKSBpcyBhbHdheXMgZW50ZXJkIGluIG9wZXJhdG9yLXBlbmRpbmctbW9kZS5cbiAgIyAgU28gY291bnQgaGF2ZSB0d28gdGltaW5nIHRvIGJlIGVudGVyZWQuIHRoYXQncyB3aHkgaGVyZSB3ZSBtYW5hZ2UgY291bnRlciBieSBtb2RlLlxuICBoYXNDb3VudDogLT5cbiAgICBAY291bnRbJ25vcm1hbCddPyBvciBAY291bnRbJ29wZXJhdG9yLXBlbmRpbmcnXT9cblxuICBnZXRDb3VudDogLT5cbiAgICBpZiBAaGFzQ291bnQoKVxuICAgICAgKEBjb3VudFsnbm9ybWFsJ10gPyAxKSAqIChAY291bnRbJ29wZXJhdG9yLXBlbmRpbmcnXSA/IDEpXG4gICAgZWxzZVxuICAgICAgbnVsbFxuXG4gIHNldENvdW50OiAobnVtYmVyKSAtPlxuICAgIG1vZGUgPSAnbm9ybWFsJ1xuICAgIG1vZGUgPSBAbW9kZSBpZiBAbW9kZSBpcyAnb3BlcmF0b3ItcGVuZGluZydcbiAgICBAY291bnRbbW9kZV0gPz0gMFxuICAgIEBjb3VudFttb2RlXSA9IChAY291bnRbbW9kZV0gKiAxMCkgKyBudW1iZXJcbiAgICBAdmltU3RhdGUuaG92ZXIuc2V0KEBidWlsZENvdW50U3RyaW5nKCkpXG4gICAgQGVkaXRvckVsZW1lbnQuY2xhc3NMaXN0LnRvZ2dsZSgnd2l0aC1jb3VudCcsIHRydWUpXG5cbiAgYnVpbGRDb3VudFN0cmluZzogLT5cbiAgICBbQGNvdW50Wydub3JtYWwnXSwgQGNvdW50WydvcGVyYXRvci1wZW5kaW5nJ11dXG4gICAgICAuZmlsdGVyIChjb3VudCkgLT4gY291bnQ/XG4gICAgICAubWFwIChjb3VudCkgLT4gU3RyaW5nKGNvdW50KVxuICAgICAgLmpvaW4oJ3gnKVxuXG4gIHJlc2V0Q291bnQ6IC0+XG4gICAgQGNvdW50ID0ge31cbiAgICBAZWRpdG9yRWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCd3aXRoLWNvdW50JylcblxubW9kdWxlLmV4cG9ydHMgPSBPcGVyYXRpb25TdGFja1xuIl19
