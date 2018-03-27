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
      var $selection, error, i, isValidOperation, len, operation, ref3, ref4, type;
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvb3BlcmF0aW9uLXN0YWNrLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsTUFBb0MsT0FBQSxDQUFRLE1BQVIsQ0FBcEMsRUFBQywyQkFBRCxFQUFhOztFQUNiLElBQUEsR0FBTyxPQUFBLENBQVEsUUFBUjs7RUFDUCxPQUFtRSxPQUFBLENBQVEsU0FBUixDQUFuRSxFQUFDLG9DQUFELEVBQWlCLDBEQUFqQixFQUE0Qzs7RUFDNUMsT0FBK0IsRUFBL0IsRUFBQyxvQkFBRCxFQUFTOztFQUNSLHdCQUF5QixPQUFBLENBQVEsVUFBUjs7RUFDMUIsS0FBQSxHQUFRLE9BQUEsQ0FBUSxxQkFBUjs7RUFZRjtJQUNKLE1BQU0sQ0FBQyxjQUFQLENBQXNCLGNBQUMsQ0FBQSxTQUF2QixFQUFrQyxNQUFsQyxFQUEwQztNQUFBLEdBQUEsRUFBSyxTQUFBO2VBQUcsSUFBQyxDQUFBLFdBQVcsQ0FBQztNQUFoQixDQUFMO0tBQTFDOztJQUNBLE1BQU0sQ0FBQyxjQUFQLENBQXNCLGNBQUMsQ0FBQSxTQUF2QixFQUFrQyxTQUFsQyxFQUE2QztNQUFBLEdBQUEsRUFBSyxTQUFBO2VBQUcsSUFBQyxDQUFBLFdBQVcsQ0FBQztNQUFoQixDQUFMO0tBQTdDOztJQUVhLHdCQUFDLFFBQUQ7QUFDWCxVQUFBO01BRFksSUFBQyxDQUFBLFdBQUQ7TUFDWixPQUEwQyxJQUFDLENBQUEsUUFBM0MsRUFBQyxJQUFDLENBQUEsY0FBQSxNQUFGLEVBQVUsSUFBQyxDQUFBLHFCQUFBLGFBQVgsRUFBMEIsSUFBQyxDQUFBLG1CQUFBO01BRTNCLElBQUMsQ0FBQSxhQUFELEdBQWlCLElBQUk7TUFDckIsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUMsQ0FBQSxRQUFRLENBQUMsWUFB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QUFNLENBQUMsT0FBUCxHQUFpQjtBQTdPakIiLCJzb3VyY2VzQ29udGVudCI6WyJ7RGlzcG9zYWJsZSwgQ29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlICdhdG9tJ1xuQmFzZSA9IHJlcXVpcmUgJy4vYmFzZSdcbnttb3ZlQ3Vyc29yTGVmdCwgaGF2ZVNvbWVOb25FbXB0eVNlbGVjdGlvbiwgYXNzZXJ0V2l0aEV4Y2VwdGlvbn0gPSByZXF1aXJlICcuL3V0aWxzJ1xue1NlbGVjdCwgTW92ZVRvUmVsYXRpdmVMaW5lfSA9IHt9XG57T3BlcmF0aW9uQWJvcnRlZEVycm9yfSA9IHJlcXVpcmUgJy4vZXJyb3JzJ1xuc3dyYXAgPSByZXF1aXJlICcuL3NlbGVjdGlvbi13cmFwcGVyJ1xuXG4jIG9wcmF0aW9uIGxpZmUgaW4gb3BlcmF0aW9uU3RhY2tcbiMgMS4gcnVuXG4jICAgIGluc3RhbnRpYXRlZCBieSBuZXcuXG4jICAgIGNvbXBsaW1lbnQgaW1wbGljaXQgT3BlcmF0b3IuU2VsZWN0IG9wZXJhdG9yIGlmIG5lY2Vzc2FyeS5cbiMgICAgcHVzaCBvcGVyYXRpb24gdG8gc3RhY2suXG4jIDIuIHByb2Nlc3NcbiMgICAgcmVkdWNlIHN0YWNrIGJ5LCBwb3BwaW5nIHRvcCBvZiBzdGFjayB0aGVuIHNldCBpdCBhcyB0YXJnZXQgb2YgbmV3IHRvcC5cbiMgICAgY2hlY2sgaWYgcmVtYWluaW5nIHRvcCBvZiBzdGFjayBpcyBleGVjdXRhYmxlIGJ5IGNhbGxpbmcgaXNDb21wbGV0ZSgpXG4jICAgIGlmIGV4ZWN1dGFibGUsIHRoZW4gcG9wIHN0YWNrIHRoZW4gZXhlY3V0ZShwb3BwZWRPcGVyYXRpb24pXG4jICAgIGlmIG5vdCBleGVjdXRhYmxlLCBlbnRlciBcIm9wZXJhdG9yLXBlbmRpbmctbW9kZVwiXG5jbGFzcyBPcGVyYXRpb25TdGFja1xuICBPYmplY3QuZGVmaW5lUHJvcGVydHkgQHByb3RvdHlwZSwgJ21vZGUnLCBnZXQ6IC0+IEBtb2RlTWFuYWdlci5tb2RlXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSBAcHJvdG90eXBlLCAnc3VibW9kZScsIGdldDogLT4gQG1vZGVNYW5hZ2VyLnN1Ym1vZGVcblxuICBjb25zdHJ1Y3RvcjogKEB2aW1TdGF0ZSkgLT5cbiAgICB7QGVkaXRvciwgQGVkaXRvckVsZW1lbnQsIEBtb2RlTWFuYWdlcn0gPSBAdmltU3RhdGVcblxuICAgIEBzdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgQHZpbVN0YXRlLm9uRGlkRGVzdHJveShAZGVzdHJveS5iaW5kKHRoaXMpKVxuXG4gICAgU2VsZWN0ID89IEJhc2UuZ2V0Q2xhc3MoJ1NlbGVjdCcpXG4gICAgTW92ZVRvUmVsYXRpdmVMaW5lID89IEJhc2UuZ2V0Q2xhc3MoJ01vdmVUb1JlbGF0aXZlTGluZScpXG5cbiAgICBAcmVzZXQoKVxuXG4gICMgUmV0dXJuIGhhbmRsZXJcbiAgc3Vic2NyaWJlOiAoaGFuZGxlcikgLT5cbiAgICBAb3BlcmF0aW9uU3Vic2NyaXB0aW9ucy5hZGQoaGFuZGxlcilcbiAgICByZXR1cm4gaGFuZGxlciAjIERPTlQgUkVNT1ZFXG5cbiAgcmVzZXQ6IC0+XG4gICAgQHJlc2V0Q291bnQoKVxuICAgIEBzdGFjayA9IFtdXG4gICAgQHByb2Nlc3NpbmcgPSBmYWxzZVxuXG4gICAgIyB0aGlzIGhhcyB0byBiZSBCRUZPUkUgQG9wZXJhdGlvblN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG4gICAgQHZpbVN0YXRlLmVtaXREaWRSZXNldE9wZXJhdGlvblN0YWNrKClcblxuICAgIEBvcGVyYXRpb25TdWJzY3JpcHRpb25zPy5kaXNwb3NlKClcbiAgICBAb3BlcmF0aW9uU3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG5cbiAgZGVzdHJveTogLT5cbiAgICBAc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiAgICBAb3BlcmF0aW9uU3Vic2NyaXB0aW9ucz8uZGlzcG9zZSgpXG4gICAge0BzdGFjaywgQG9wZXJhdGlvblN1YnNjcmlwdGlvbnN9ID0ge31cblxuICBwZWVrVG9wOiAtPlxuICAgIEBzdGFja1tAc3RhY2subGVuZ3RoIC0gMV1cblxuICBpc0VtcHR5OiAtPlxuICAgIEBzdGFjay5sZW5ndGggaXMgMFxuXG4gICMgTWFpblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgcnVuOiAoa2xhc3MsIHByb3BlcnRpZXMpIC0+XG4gICAgaWYgQG1vZGUgaXMgJ3Zpc3VhbCdcbiAgICAgIGZvciAkc2VsZWN0aW9uIGluIHN3cmFwLmdldFNlbGVjdGlvbnMoQGVkaXRvcikgd2hlbiBub3QgJHNlbGVjdGlvbi5oYXNQcm9wZXJ0aWVzKClcbiAgICAgICAgJHNlbGVjdGlvbi5zYXZlUHJvcGVydGllcygpXG5cbiAgICB0cnlcbiAgICAgIEB2aW1TdGF0ZS5pbml0KCkgaWYgQGlzRW1wdHkoKVxuICAgICAgdHlwZSA9IHR5cGVvZihrbGFzcylcbiAgICAgIGlmIHR5cGUgaXMgJ29iamVjdCcgIyAuIHJlcGVhdCBjYXNlIHdlIGNhbiBleGVjdXRlIGFzLWl0LWlzLlxuICAgICAgICBvcGVyYXRpb24gPSBrbGFzc1xuICAgICAgZWxzZVxuICAgICAgICBrbGFzcyA9IEJhc2UuZ2V0Q2xhc3Moa2xhc3MpIGlmIHR5cGUgaXMgJ3N0cmluZydcbiAgICAgICAgIyBSZXBsYWNlIG9wZXJhdG9yIHdoZW4gaWRlbnRpY2FsIG9uZSByZXBlYXRlZCwgZS5nLiBgZGRgLCBgY2NgLCBgZ1VnVWBcbiAgICAgICAgaWYgQHBlZWtUb3AoKT8uY29uc3RydWN0b3IgaXMga2xhc3NcbiAgICAgICAgICBvcGVyYXRpb24gPSBuZXcgTW92ZVRvUmVsYXRpdmVMaW5lKEB2aW1TdGF0ZSlcbiAgICAgICAgZWxzZVxuICAgICAgICAgIG9wZXJhdGlvbiA9IG5ldyBrbGFzcyhAdmltU3RhdGUsIHByb3BlcnRpZXMpXG5cbiAgICAgIGlmIEBpc0VtcHR5KClcbiAgICAgICAgaXNWYWxpZE9wZXJhdGlvbiA9IHRydWVcbiAgICAgICAgaWYgKEBtb2RlIGlzICd2aXN1YWwnIGFuZCBvcGVyYXRpb24uaXNNb3Rpb24oKSkgb3Igb3BlcmF0aW9uLmlzVGV4dE9iamVjdCgpXG4gICAgICAgICAgb3BlcmF0aW9uID0gbmV3IFNlbGVjdChAdmltU3RhdGUpLnNldFRhcmdldChvcGVyYXRpb24pXG4gICAgICBlbHNlXG4gICAgICAgIGlzVmFsaWRPcGVyYXRpb24gPSBAcGVla1RvcCgpLmlzT3BlcmF0b3IoKSBhbmQgKG9wZXJhdGlvbi5pc01vdGlvbigpIG9yIG9wZXJhdGlvbi5pc1RleHRPYmplY3QoKSlcblxuICAgICAgaWYgaXNWYWxpZE9wZXJhdGlvblxuICAgICAgICBAc3RhY2sucHVzaChvcGVyYXRpb24pXG4gICAgICAgIEBwcm9jZXNzKClcbiAgICAgIGVsc2VcbiAgICAgICAgQHZpbVN0YXRlLmVtaXREaWRGYWlsVG9QdXNoVG9PcGVyYXRpb25TdGFjaygpXG4gICAgICAgIEB2aW1TdGF0ZS5yZXNldE5vcm1hbE1vZGUoKVxuICAgIGNhdGNoIGVycm9yXG4gICAgICBAaGFuZGxlRXJyb3IoZXJyb3IpXG5cbiAgcnVuUmVjb3JkZWQ6IC0+XG4gICAgaWYgb3BlcmF0aW9uID0gQHJlY29yZGVkT3BlcmF0aW9uXG4gICAgICBvcGVyYXRpb24ucmVwZWF0ZWQgPSB0cnVlXG4gICAgICBpZiBAaGFzQ291bnQoKVxuICAgICAgICBjb3VudCA9IEBnZXRDb3VudCgpXG4gICAgICAgIG9wZXJhdGlvbi5jb3VudCA9IGNvdW50XG4gICAgICAgIG9wZXJhdGlvbi50YXJnZXQ/LmNvdW50ID0gY291bnQgIyBTb21lIG9wZWFydG9yIGhhdmUgbm8gdGFyZ2V0IGxpa2UgY3RybC1hKGluY3JlYXNlKS5cblxuICAgICAgb3BlcmF0aW9uLnN1YnNjcmliZVJlc2V0T2NjdXJyZW5jZVBhdHRlcm5JZk5lZWRlZCgpXG4gICAgICBAcnVuKG9wZXJhdGlvbilcblxuICBydW5SZWNvcmRlZE1vdGlvbjogKGtleSwge3JldmVyc2V9PXt9KSAtPlxuICAgIHJldHVybiB1bmxlc3Mgb3BlcmF0aW9uID0gQHZpbVN0YXRlLmdsb2JhbFN0YXRlLmdldChrZXkpXG5cbiAgICBvcGVyYXRpb24gPSBvcGVyYXRpb24uY2xvbmUoQHZpbVN0YXRlKVxuICAgIG9wZXJhdGlvbi5yZXBlYXRlZCA9IHRydWVcbiAgICBvcGVyYXRpb24ucmVzZXRDb3VudCgpXG4gICAgaWYgcmV2ZXJzZVxuICAgICAgb3BlcmF0aW9uLmJhY2t3YXJkcyA9IG5vdCBvcGVyYXRpb24uYmFja3dhcmRzXG4gICAgQHJ1bihvcGVyYXRpb24pXG5cbiAgcnVuQ3VycmVudEZpbmQ6IChvcHRpb25zKSAtPlxuICAgIEBydW5SZWNvcmRlZE1vdGlvbignY3VycmVudEZpbmQnLCBvcHRpb25zKVxuXG4gIHJ1bkN1cnJlbnRTZWFyY2g6IChvcHRpb25zKSAtPlxuICAgIEBydW5SZWNvcmRlZE1vdGlvbignY3VycmVudFNlYXJjaCcsIG9wdGlvbnMpXG5cbiAgaGFuZGxlRXJyb3I6IChlcnJvcikgLT5cbiAgICBAdmltU3RhdGUucmVzZXQoKVxuICAgIHVubGVzcyBlcnJvciBpbnN0YW5jZW9mIE9wZXJhdGlvbkFib3J0ZWRFcnJvclxuICAgICAgdGhyb3cgZXJyb3JcblxuICBpc1Byb2Nlc3Npbmc6IC0+XG4gICAgQHByb2Nlc3NpbmdcblxuICBwcm9jZXNzOiAtPlxuICAgIEBwcm9jZXNzaW5nID0gdHJ1ZVxuICAgIGlmIEBzdGFjay5sZW5ndGggaXMgMlxuICAgICAgIyBbRklYTUUgaWRlYWxseV1cbiAgICAgICMgSWYgdGFyZ2V0IGlzIG5vdCBjb21wbGV0ZSwgd2UgcG9zdHBvbmUgY29tcG9zaW5nIHRhcmdldCB3aXRoIG9wZXJhdG9yIHRvIGtlZXAgc2l0dWF0aW9uIHNpbXBsZS5cbiAgICAgICMgU28gdGhhdCB3ZSBjYW4gYXNzdW1lIHdoZW4gdGFyZ2V0IGlzIHNldCB0byBvcGVyYXRvciBpdCdzIGNvbXBsZXRlLlxuICAgICAgIyBlLmcuIGB5IHMgdCBhJyhzdXJyb3VuZCBmb3IgcmFuZ2UgZnJvbSBoZXJlIHRvIHRpbGwgYSlcbiAgICAgIHJldHVybiB1bmxlc3MgQHBlZWtUb3AoKS5pc0NvbXBsZXRlKClcblxuICAgICAgb3BlcmF0aW9uID0gQHN0YWNrLnBvcCgpXG4gICAgICBAcGVla1RvcCgpLnNldFRhcmdldChvcGVyYXRpb24pXG5cbiAgICB0b3AgPSBAcGVla1RvcCgpXG5cbiAgICBpZiB0b3AuaXNDb21wbGV0ZSgpXG4gICAgICBAZXhlY3V0ZShAc3RhY2sucG9wKCkpXG4gICAgZWxzZVxuICAgICAgaWYgQG1vZGUgaXMgJ25vcm1hbCcgYW5kIHRvcC5pc09wZXJhdG9yKClcbiAgICAgICAgQG1vZGVNYW5hZ2VyLmFjdGl2YXRlKCdvcGVyYXRvci1wZW5kaW5nJylcblxuICAgICAgIyBUZW1wb3Jhcnkgc2V0IHdoaWxlIGNvbW1hbmQgaXMgcnVubmluZ1xuICAgICAgaWYgY29tbWFuZE5hbWUgPSB0b3AuY29uc3RydWN0b3IuZ2V0Q29tbWFuZE5hbWVXaXRob3V0UHJlZml4PygpXG4gICAgICAgIEBhZGRUb0NsYXNzTGlzdChjb21tYW5kTmFtZSArIFwiLXBlbmRpbmdcIilcblxuICBleGVjdXRlOiAob3BlcmF0aW9uKSAtPlxuICAgIGV4ZWN1dGlvbiA9IG9wZXJhdGlvbi5leGVjdXRlKClcbiAgICBpZiBleGVjdXRpb24gaW5zdGFuY2VvZiBQcm9taXNlXG4gICAgICBleGVjdXRpb25cbiAgICAgICAgLnRoZW4gPT4gQGZpbmlzaChvcGVyYXRpb24pXG4gICAgICAgIC5jYXRjaCA9PiBAaGFuZGxlRXJyb3IoKVxuICAgIGVsc2VcbiAgICAgIEBmaW5pc2gob3BlcmF0aW9uKVxuXG4gIGNhbmNlbDogLT5cbiAgICBpZiBAbW9kZSBub3QgaW4gWyd2aXN1YWwnLCAnaW5zZXJ0J11cbiAgICAgIEB2aW1TdGF0ZS5yZXNldE5vcm1hbE1vZGUoKVxuICAgICAgQHZpbVN0YXRlLnJlc3RvcmVPcmlnaW5hbEN1cnNvclBvc2l0aW9uKClcbiAgICBAZmluaXNoKClcblxuICBmaW5pc2g6IChvcGVyYXRpb249bnVsbCkgLT5cbiAgICBAcmVjb3JkZWRPcGVyYXRpb24gPSBvcGVyYXRpb24gaWYgb3BlcmF0aW9uPy5yZWNvcmRhYmxlXG4gICAgQHZpbVN0YXRlLmVtaXREaWRGaW5pc2hPcGVyYXRpb24oKVxuICAgIGlmIG9wZXJhdGlvbj8uaXNPcGVyYXRvcigpXG4gICAgICBvcGVyYXRpb24ucmVzZXRTdGF0ZSgpXG5cbiAgICBpZiBAbW9kZSBpcyAnbm9ybWFsJ1xuICAgICAgQGVuc3VyZUFsbFNlbGVjdGlvbnNBcmVFbXB0eShvcGVyYXRpb24pXG4gICAgICBAZW5zdXJlQWxsQ3Vyc29yc0FyZU5vdEF0RW5kT2ZMaW5lKClcbiAgICBlbHNlIGlmIEBtb2RlIGlzICd2aXN1YWwnXG4gICAgICBAbW9kZU1hbmFnZXIudXBkYXRlTmFycm93ZWRTdGF0ZSgpXG4gICAgICBAdmltU3RhdGUudXBkYXRlUHJldmlvdXNTZWxlY3Rpb24oKVxuXG4gICAgQHZpbVN0YXRlLnVwZGF0ZUN1cnNvcnNWaXNpYmlsaXR5KClcbiAgICBAdmltU3RhdGUucmVzZXQoKVxuXG4gIGVuc3VyZUFsbFNlbGVjdGlvbnNBcmVFbXB0eTogKG9wZXJhdGlvbikgLT5cbiAgICAjIFdoZW4gQHZpbVN0YXRlLnNlbGVjdEJsb2Nrd2lzZSgpIGlzIGNhbGxlZCBpbiBub24tdmlzdWFsLW1vZGUuXG4gICAgIyBlLmcuIGAuYCByZXBlYXQgb2Ygb3BlcmF0aW9uIHRhcmdldGVkIGJsb2Nrd2lzZSBgQ3VycmVudFNlbGVjdGlvbmAuXG4gICAgIyBXZSBuZWVkIHRvIG1hbnVhbGx5IGNsZWFyIGJsb2Nrd2lzZVNlbGVjdGlvbi5cbiAgICAjIFNlZSAjNjQ3XG4gICAgQHZpbVN0YXRlLmNsZWFyQmxvY2t3aXNlU2VsZWN0aW9ucygpICMgRklYTUUsIHNob3VsZCBiZSByZW1vdmVkXG4gICAgaWYgaGF2ZVNvbWVOb25FbXB0eVNlbGVjdGlvbihAZWRpdG9yKVxuICAgICAgaWYgQHZpbVN0YXRlLmdldENvbmZpZygnc3RyaWN0QXNzZXJ0aW9uJylcbiAgICAgICAgYXNzZXJ0V2l0aEV4Y2VwdGlvbihmYWxzZSwgXCJIYXZlIHNvbWUgbm9uLWVtcHR5IHNlbGVjdGlvbiBpbiBub3JtYWwtbW9kZTogI3tvcGVyYXRpb24udG9TdHJpbmcoKX1cIilcbiAgICAgIEB2aW1TdGF0ZS5jbGVhclNlbGVjdGlvbnMoKVxuXG4gIGVuc3VyZUFsbEN1cnNvcnNBcmVOb3RBdEVuZE9mTGluZTogLT5cbiAgICBmb3IgY3Vyc29yIGluIEBlZGl0b3IuZ2V0Q3Vyc29ycygpIHdoZW4gY3Vyc29yLmlzQXRFbmRPZkxpbmUoKVxuICAgICAgbW92ZUN1cnNvckxlZnQoY3Vyc29yLCBwcmVzZXJ2ZUdvYWxDb2x1bW46IHRydWUpXG5cbiAgYWRkVG9DbGFzc0xpc3Q6IChjbGFzc05hbWUpIC0+XG4gICAgQGVkaXRvckVsZW1lbnQuY2xhc3NMaXN0LmFkZChjbGFzc05hbWUpXG4gICAgQHN1YnNjcmliZSBuZXcgRGlzcG9zYWJsZSA9PlxuICAgICAgQGVkaXRvckVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShjbGFzc05hbWUpXG5cbiAgIyBDb3VudFxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgIyBrZXlzdHJva2UgYDNkMndgIGRlbGV0ZSA2KDMqMikgd29yZHMuXG4gICMgIDJuZCBudW1iZXIoMiBpbiB0aGlzIGNhc2UpIGlzIGFsd2F5cyBlbnRlcmQgaW4gb3BlcmF0b3ItcGVuZGluZy1tb2RlLlxuICAjICBTbyBjb3VudCBoYXZlIHR3byB0aW1pbmcgdG8gYmUgZW50ZXJlZC4gdGhhdCdzIHdoeSBoZXJlIHdlIG1hbmFnZSBjb3VudGVyIGJ5IG1vZGUuXG4gIGhhc0NvdW50OiAtPlxuICAgIEBjb3VudFsnbm9ybWFsJ10/IG9yIEBjb3VudFsnb3BlcmF0b3ItcGVuZGluZyddP1xuXG4gIGdldENvdW50OiAtPlxuICAgIGlmIEBoYXNDb3VudCgpXG4gICAgICAoQGNvdW50Wydub3JtYWwnXSA/IDEpICogKEBjb3VudFsnb3BlcmF0b3ItcGVuZGluZyddID8gMSlcbiAgICBlbHNlXG4gICAgICBudWxsXG5cbiAgc2V0Q291bnQ6IChudW1iZXIpIC0+XG4gICAgbW9kZSA9ICdub3JtYWwnXG4gICAgbW9kZSA9IEBtb2RlIGlmIEBtb2RlIGlzICdvcGVyYXRvci1wZW5kaW5nJ1xuICAgIEBjb3VudFttb2RlXSA/PSAwXG4gICAgQGNvdW50W21vZGVdID0gKEBjb3VudFttb2RlXSAqIDEwKSArIG51bWJlclxuICAgIEB2aW1TdGF0ZS5ob3Zlci5zZXQoQGJ1aWxkQ291bnRTdHJpbmcoKSlcbiAgICBAdmltU3RhdGUudG9nZ2xlQ2xhc3NMaXN0KCd3aXRoLWNvdW50JywgdHJ1ZSlcblxuICBidWlsZENvdW50U3RyaW5nOiAtPlxuICAgIFtAY291bnRbJ25vcm1hbCddLCBAY291bnRbJ29wZXJhdG9yLXBlbmRpbmcnXV1cbiAgICAgIC5maWx0ZXIgKGNvdW50KSAtPiBjb3VudD9cbiAgICAgIC5tYXAgKGNvdW50KSAtPiBTdHJpbmcoY291bnQpXG4gICAgICAuam9pbigneCcpXG5cbiAgcmVzZXRDb3VudDogLT5cbiAgICBAY291bnQgPSB7fVxuICAgIEB2aW1TdGF0ZS50b2dnbGVDbGFzc0xpc3QoJ3dpdGgtY291bnQnLCBmYWxzZSlcblxubW9kdWxlLmV4cG9ydHMgPSBPcGVyYXRpb25TdGFja1xuIl19
