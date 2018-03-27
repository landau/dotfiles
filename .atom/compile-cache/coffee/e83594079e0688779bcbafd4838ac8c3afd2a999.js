(function() {
  var CompositeDisposable, Disposable, Emitter, ModeManager, Range, moveCursorLeft, ref;

  ref = require('atom'), Emitter = ref.Emitter, Range = ref.Range, CompositeDisposable = ref.CompositeDisposable, Disposable = ref.Disposable;

  moveCursorLeft = null;

  ModeManager = (function() {
    ModeManager.prototype.mode = 'insert';

    ModeManager.prototype.submode = null;

    ModeManager.prototype.replacedCharsBySelection = null;

    function ModeManager(vimState) {
      var ref1;
      this.vimState = vimState;
      ref1 = this.vimState, this.editor = ref1.editor, this.editorElement = ref1.editorElement;
      this.emitter = new Emitter;
      this.vimState.onDidDestroy(this.destroy.bind(this));
    }

    ModeManager.prototype.destroy = function() {};

    ModeManager.prototype.isMode = function(mode, submode) {
      if (submode == null) {
        submode = null;
      }
      return (mode === this.mode) && (submode === this.submode);
    };

    ModeManager.prototype.onWillActivateMode = function(fn) {
      return this.emitter.on('will-activate-mode', fn);
    };

    ModeManager.prototype.onDidActivateMode = function(fn) {
      return this.emitter.on('did-activate-mode', fn);
    };

    ModeManager.prototype.onWillDeactivateMode = function(fn) {
      return this.emitter.on('will-deactivate-mode', fn);
    };

    ModeManager.prototype.preemptWillDeactivateMode = function(fn) {
      return this.emitter.preempt('will-deactivate-mode', fn);
    };

    ModeManager.prototype.onDidDeactivateMode = function(fn) {
      return this.emitter.on('did-deactivate-mode', fn);
    };

    ModeManager.prototype.activate = function(newMode, newSubmode) {
      var ref1, ref2, ref3, ref4;
      if (newSubmode == null) {
        newSubmode = null;
      }
      if ((newMode === 'visual') && this.editor.isEmpty()) {
        return;
      }
      this.emitter.emit('will-activate-mode', {
        mode: newMode,
        submode: newSubmode
      });
      if ((newMode === 'visual') && (this.submode != null) && (newSubmode === this.submode)) {
        ref1 = ['normal', null], newMode = ref1[0], newSubmode = ref1[1];
      }
      if (newMode !== this.mode) {
        this.deactivate();
      }
      this.deactivator = (function() {
        switch (newMode) {
          case 'normal':
            return this.activateNormalMode();
          case 'operator-pending':
            return this.activateOperatorPendingMode();
          case 'insert':
            return this.activateInsertMode(newSubmode);
          case 'visual':
            return this.activateVisualMode(newSubmode);
        }
      }).call(this);
      this.editorElement.classList.remove(this.mode + "-mode");
      this.editorElement.classList.remove(this.submode);
      ref2 = [newMode, newSubmode], this.mode = ref2[0], this.submode = ref2[1];
      if (this.mode === 'visual') {
        this.updateNarrowedState();
        this.vimState.updatePreviousSelection();
      } else {
        if ((ref3 = this.vimState.getProp('swrap')) != null) {
          ref3.clearProperties(this.editor);
        }
      }
      this.editorElement.classList.add(this.mode + "-mode");
      if (this.submode != null) {
        this.editorElement.classList.add(this.submode);
      }
      this.vimState.statusBarManager.update(this.mode, this.submode);
      if (this.mode === 'visual') {
        this.vimState.cursorStyleManager.refresh();
      } else {
        if ((ref4 = this.vimState.getProp('cursorStyleManager')) != null) {
          ref4.refresh();
        }
      }
      return this.emitter.emit('did-activate-mode', {
        mode: this.mode,
        submode: this.submode
      });
    };

    ModeManager.prototype.deactivate = function() {
      var ref1, ref2;
      if (!((ref1 = this.deactivator) != null ? ref1.disposed : void 0)) {
        this.emitter.emit('will-deactivate-mode', {
          mode: this.mode,
          submode: this.submode
        });
        if ((ref2 = this.deactivator) != null) {
          ref2.dispose();
        }
        this.editorElement.classList.remove(this.mode + "-mode");
        this.editorElement.classList.remove(this.submode);
        return this.emitter.emit('did-deactivate-mode', {
          mode: this.mode,
          submode: this.submode
        });
      }
    };

    ModeManager.prototype.activateNormalMode = function() {
      var cursor, goalColumn, i, len, ref1, ref2;
      this.vimState.reset();
      if ((ref1 = this.editorElement.component) != null) {
        ref1.setInputEnabled(false);
      }
      ref2 = this.editor.getCursors();
      for (i = 0, len = ref2.length; i < len; i++) {
        cursor = ref2[i];
        if (!(cursor.isAtEndOfLine() && !cursor.isAtBeginningOfLine())) {
          continue;
        }
        goalColumn = cursor.goalColumn;
        cursor.moveLeft();
        if (goalColumn != null) {
          cursor.goalColumn = goalColumn;
        }
      }
      return new Disposable;
    };

    ModeManager.prototype.activateOperatorPendingMode = function() {
      return new Disposable;
    };

    ModeManager.prototype.activateInsertMode = function(submode) {
      var replaceModeDeactivator;
      if (submode == null) {
        submode = null;
      }
      this.editorElement.component.setInputEnabled(true);
      if (submode === 'replace') {
        replaceModeDeactivator = this.activateReplaceMode();
      }
      return new Disposable((function(_this) {
        return function() {
          var cursor, i, len, needSpecialCareToPreventWrapLine, ref1, results;
          if (moveCursorLeft == null) {
            moveCursorLeft = require('./utils').moveCursorLeft;
          }
          if (replaceModeDeactivator != null) {
            replaceModeDeactivator.dispose();
          }
          replaceModeDeactivator = null;
          needSpecialCareToPreventWrapLine = _this.editor.hasAtomicSoftTabs();
          ref1 = _this.editor.getCursors();
          results = [];
          for (i = 0, len = ref1.length; i < len; i++) {
            cursor = ref1[i];
            results.push(moveCursorLeft(cursor, {
              needSpecialCareToPreventWrapLine: needSpecialCareToPreventWrapLine
            }));
          }
          return results;
        };
      })(this));
    };

    ModeManager.prototype.activateReplaceMode = function() {
      var subs;
      this.replacedCharsBySelection = new WeakMap;
      subs = new CompositeDisposable;
      subs.add(this.editor.onWillInsertText((function(_this) {
        return function(arg) {
          var cancel, text;
          text = arg.text, cancel = arg.cancel;
          cancel();
          return _this.editor.getSelections().forEach(function(selection) {
            var char, i, len, ref1, ref2, results, selectedText;
            ref2 = (ref1 = text.split('')) != null ? ref1 : [];
            results = [];
            for (i = 0, len = ref2.length; i < len; i++) {
              char = ref2[i];
              if ((char !== "\n") && (!selection.cursor.isAtEndOfLine())) {
                selection.selectRight();
              }
              selectedText = selection.getText();
              selection.insertText(char);
              if (!_this.replacedCharsBySelection.has(selection)) {
                _this.replacedCharsBySelection.set(selection, []);
              }
              results.push(_this.replacedCharsBySelection.get(selection).push(selectedText));
            }
            return results;
          });
        };
      })(this)));
      subs.add(new Disposable((function(_this) {
        return function() {
          return _this.replacedCharsBySelection = null;
        };
      })(this)));
      return subs;
    };

    ModeManager.prototype.getReplacedCharForSelection = function(selection) {
      var ref1;
      return (ref1 = this.replacedCharsBySelection.get(selection)) != null ? ref1.pop() : void 0;
    };

    ModeManager.prototype.activateVisualMode = function(submode) {
      var $selection, i, j, len, len1, ref1, ref2, swrap;
      swrap = this.vimState.swrap;
      ref1 = swrap.getSelections(this.editor);
      for (i = 0, len = ref1.length; i < len; i++) {
        $selection = ref1[i];
        if (!$selection.hasProperties()) {
          $selection.saveProperties();
        }
      }
      swrap.normalize(this.editor);
      ref2 = swrap.getSelections(this.editor);
      for (j = 0, len1 = ref2.length; j < len1; j++) {
        $selection = ref2[j];
        $selection.applyWise(submode);
      }
      if (submode === 'blockwise') {
        this.vimState.getLastBlockwiseSelection().autoscroll();
      }
      return new Disposable((function(_this) {
        return function() {
          var k, len2, ref3, selection;
          swrap.normalize(_this.editor);
          if (_this.submode === 'blockwise') {
            swrap.setReversedState(_this.editor, true);
          }
          ref3 = _this.editor.getSelections();
          for (k = 0, len2 = ref3.length; k < len2; k++) {
            selection = ref3[k];
            selection.clear({
              autoscroll: false
            });
          }
          return _this.updateNarrowedState(false);
        };
      })(this));
    };

    ModeManager.prototype.hasMultiLineSelection = function() {
      var ref1;
      if (this.isMode('visual', 'blockwise')) {
        return !((ref1 = this.vimState.getLastBlockwiseSelection()) != null ? ref1.isSingleRow() : void 0);
      } else {
        return !this.vimState.swrap(this.editor.getLastSelection()).isSingleRow();
      }
    };

    ModeManager.prototype.updateNarrowedState = function(value) {
      if (value == null) {
        value = null;
      }
      return this.editorElement.classList.toggle('is-narrowed', value != null ? value : this.hasMultiLineSelection());
    };

    ModeManager.prototype.isNarrowed = function() {
      return this.editorElement.classList.contains('is-narrowed');
    };

    return ModeManager;

  })();

  module.exports = ModeManager;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvbW9kZS1tYW5hZ2VyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsTUFBb0QsT0FBQSxDQUFRLE1BQVIsQ0FBcEQsRUFBQyxxQkFBRCxFQUFVLGlCQUFWLEVBQWlCLDZDQUFqQixFQUFzQzs7RUFDdEMsY0FBQSxHQUFpQjs7RUFFWDswQkFDSixJQUFBLEdBQU07OzBCQUNOLE9BQUEsR0FBUzs7MEJBQ1Qsd0JBQUEsR0FBMEI7O0lBRWIscUJBQUMsUUFBRDtBQUNYLFVBQUE7TUFEWSxJQUFDLENBQUEsV0FBRDtNQUNaLE9BQTRCLElBQUMsQ0FBQSxRQUE3QixFQUFDLElBQUMsQ0FBQSxjQUFBLE1BQUYsRUFBVSxJQUFDLENBQUEscUJBQUE7TUFFWCxJQUFDLENBQUEsT0FBRCxHQUFXLElBQUk7TUFDZixJQUFDLENBQUEsUUFBUSxDQUFDLFlBQVYsQ0FBdUIsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQWMsSUFBZCxDQUF2QjtJQUpXOzswQkFNYixPQUFBLEdBQVMsU0FBQSxHQUFBOzswQkFFVCxNQUFBLEdBQVEsU0FBQyxJQUFELEVBQU8sT0FBUDs7UUFBTyxVQUFROzthQUNyQixDQUFDLElBQUEsS0FBUSxJQUFDLENBQUEsSUFBVixDQUFBLElBQW9CLENBQUMsT0FBQSxLQUFXLElBQUMsQ0FBQSxPQUFiO0lBRGQ7OzBCQUtSLGtCQUFBLEdBQW9CLFNBQUMsRUFBRDthQUFRLElBQUMsQ0FBQSxPQUFPLENBQUMsRUFBVCxDQUFZLG9CQUFaLEVBQWtDLEVBQWxDO0lBQVI7OzBCQUNwQixpQkFBQSxHQUFtQixTQUFDLEVBQUQ7YUFBUSxJQUFDLENBQUEsT0FBTyxDQUFDLEVBQVQsQ0FBWSxtQkFBWixFQUFpQyxFQUFqQztJQUFSOzswQkFDbkIsb0JBQUEsR0FB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QUcsS0FBQyxDQUFBLE9BQUQsS0FBWSxXQUFmO1lBQ0UsS0FBSyxDQUFDLGdCQUFOLENBQXVCLEtBQUMsQ0FBQSxNQUF4QixFQUFnQyxJQUFoQyxFQURGOztBQUVBO0FBQUEsZUFBQSx3Q0FBQTs7WUFBQSxTQUFTLENBQUMsS0FBVixDQUFnQjtjQUFBLFVBQUEsRUFBWSxLQUFaO2FBQWhCO0FBQUE7aUJBQ0EsS0FBQyxDQUFBLG1CQUFELENBQXFCLEtBQXJCO1FBTmE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVg7SUFYYzs7MEJBcUJwQixxQkFBQSxHQUF1QixTQUFBO0FBQ3JCLFVBQUE7TUFBQSxJQUFHLElBQUMsQ0FBQSxNQUFELENBQVEsUUFBUixFQUFrQixXQUFsQixDQUFIO2VBRUUsbUVBQXlDLENBQUUsV0FBdkMsQ0FBQSxZQUZOO09BQUEsTUFBQTtlQUlFLENBQUksSUFBQyxDQUFBLFFBQVEsQ0FBQyxLQUFWLENBQWdCLElBQUMsQ0FBQSxNQUFNLENBQUMsZ0JBQVIsQ0FBQSxDQUFoQixDQUEyQyxDQUFDLFdBQTVDLENBQUEsRUFKTjs7SUFEcUI7OzBCQU92QixtQkFBQSxHQUFxQixTQUFDLEtBQUQ7O1FBQUMsUUFBTTs7YUFDMUIsSUFBQyxDQUFBLGFBQWEsQ0FBQyxTQUFTLENBQUMsTUFBekIsQ0FBZ0MsYUFBaEMsa0JBQStDLFFBQVEsSUFBQyxDQUFBLHFCQUFELENBQUEsQ0FBdkQ7SUFEbUI7OzBCQUdyQixVQUFBLEdBQVksU0FBQTthQUNWLElBQUMsQ0FBQSxhQUFhLENBQUMsU0FBUyxDQUFDLFFBQXpCLENBQWtDLGFBQWxDO0lBRFU7Ozs7OztFQUdkLE1BQU0sQ0FBQyxPQUFQLEdBQWlCO0FBL0xqQiIsInNvdXJjZXNDb250ZW50IjpbIntFbWl0dGVyLCBSYW5nZSwgQ29tcG9zaXRlRGlzcG9zYWJsZSwgRGlzcG9zYWJsZX0gPSByZXF1aXJlICdhdG9tJ1xubW92ZUN1cnNvckxlZnQgPSBudWxsXG5cbmNsYXNzIE1vZGVNYW5hZ2VyXG4gIG1vZGU6ICdpbnNlcnQnICMgTmF0aXZlIGF0b20gaXMgbm90IG1vZGFsIGVkaXRvciBhbmQgaXRzIGRlZmF1bHQgaXMgJ2luc2VydCdcbiAgc3VibW9kZTogbnVsbFxuICByZXBsYWNlZENoYXJzQnlTZWxlY3Rpb246IG51bGxcblxuICBjb25zdHJ1Y3RvcjogKEB2aW1TdGF0ZSkgLT5cbiAgICB7QGVkaXRvciwgQGVkaXRvckVsZW1lbnR9ID0gQHZpbVN0YXRlXG5cbiAgICBAZW1pdHRlciA9IG5ldyBFbWl0dGVyXG4gICAgQHZpbVN0YXRlLm9uRGlkRGVzdHJveShAZGVzdHJveS5iaW5kKHRoaXMpKVxuXG4gIGRlc3Ryb3k6IC0+XG5cbiAgaXNNb2RlOiAobW9kZSwgc3VibW9kZT1udWxsKSAtPlxuICAgIChtb2RlIGlzIEBtb2RlKSBhbmQgKHN1Ym1vZGUgaXMgQHN1Ym1vZGUpXG5cbiAgIyBFdmVudFxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgb25XaWxsQWN0aXZhdGVNb2RlOiAoZm4pIC0+IEBlbWl0dGVyLm9uKCd3aWxsLWFjdGl2YXRlLW1vZGUnLCBmbilcbiAgb25EaWRBY3RpdmF0ZU1vZGU6IChmbikgLT4gQGVtaXR0ZXIub24oJ2RpZC1hY3RpdmF0ZS1tb2RlJywgZm4pXG4gIG9uV2lsbERlYWN0aXZhdGVNb2RlOiAoZm4pIC0+IEBlbWl0dGVyLm9uKCd3aWxsLWRlYWN0aXZhdGUtbW9kZScsIGZuKVxuICBwcmVlbXB0V2lsbERlYWN0aXZhdGVNb2RlOiAoZm4pIC0+IEBlbWl0dGVyLnByZWVtcHQoJ3dpbGwtZGVhY3RpdmF0ZS1tb2RlJywgZm4pXG4gIG9uRGlkRGVhY3RpdmF0ZU1vZGU6IChmbikgLT4gQGVtaXR0ZXIub24oJ2RpZC1kZWFjdGl2YXRlLW1vZGUnLCBmbilcblxuICAjIGFjdGl2YXRlOiBQdWJsaWNcbiAgIyAgVXNlIHRoaXMgbWV0aG9kIHRvIGNoYW5nZSBtb2RlLCBET05UIHVzZSBvdGhlciBkaXJlY3QgbWV0aG9kLlxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgYWN0aXZhdGU6IChuZXdNb2RlLCBuZXdTdWJtb2RlPW51bGwpIC0+XG4gICAgIyBBdm9pZCBvZGQgc3RhdGUoPXZpc3VhbC1tb2RlIGJ1dCBzZWxlY3Rpb24gaXMgZW1wdHkpXG4gICAgcmV0dXJuIGlmIChuZXdNb2RlIGlzICd2aXN1YWwnKSBhbmQgQGVkaXRvci5pc0VtcHR5KClcblxuICAgIEBlbWl0dGVyLmVtaXQoJ3dpbGwtYWN0aXZhdGUtbW9kZScsIG1vZGU6IG5ld01vZGUsIHN1Ym1vZGU6IG5ld1N1Ym1vZGUpXG5cbiAgICBpZiAobmV3TW9kZSBpcyAndmlzdWFsJykgYW5kIEBzdWJtb2RlPyBhbmQgKG5ld1N1Ym1vZGUgaXMgQHN1Ym1vZGUpXG4gICAgICBbbmV3TW9kZSwgbmV3U3VibW9kZV0gPSBbJ25vcm1hbCcsIG51bGxdXG5cbiAgICBAZGVhY3RpdmF0ZSgpIGlmIChuZXdNb2RlIGlzbnQgQG1vZGUpXG5cbiAgICBAZGVhY3RpdmF0b3IgPSBzd2l0Y2ggbmV3TW9kZVxuICAgICAgd2hlbiAnbm9ybWFsJyB0aGVuIEBhY3RpdmF0ZU5vcm1hbE1vZGUoKVxuICAgICAgd2hlbiAnb3BlcmF0b3ItcGVuZGluZycgdGhlbiBAYWN0aXZhdGVPcGVyYXRvclBlbmRpbmdNb2RlKClcbiAgICAgIHdoZW4gJ2luc2VydCcgdGhlbiBAYWN0aXZhdGVJbnNlcnRNb2RlKG5ld1N1Ym1vZGUpXG4gICAgICB3aGVuICd2aXN1YWwnIHRoZW4gQGFjdGl2YXRlVmlzdWFsTW9kZShuZXdTdWJtb2RlKVxuXG4gICAgQGVkaXRvckVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShcIiN7QG1vZGV9LW1vZGVcIilcbiAgICBAZWRpdG9yRWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKEBzdWJtb2RlKVxuXG4gICAgW0Btb2RlLCBAc3VibW9kZV0gPSBbbmV3TW9kZSwgbmV3U3VibW9kZV1cblxuICAgIGlmIEBtb2RlIGlzICd2aXN1YWwnXG4gICAgICBAdXBkYXRlTmFycm93ZWRTdGF0ZSgpXG4gICAgICBAdmltU3RhdGUudXBkYXRlUHJldmlvdXNTZWxlY3Rpb24oKVxuICAgIGVsc2VcbiAgICAgICMgUHJldmVudCBzd3JhcCBmcm9tIGxvYWRlZCBvbiBpbml0aWFsIG1vZGUtc2V0dXAgb24gc3RhcnR1cC5cbiAgICAgIEB2aW1TdGF0ZS5nZXRQcm9wKCdzd3JhcCcpPy5jbGVhclByb3BlcnRpZXMoQGVkaXRvcilcblxuICAgIEBlZGl0b3JFbGVtZW50LmNsYXNzTGlzdC5hZGQoXCIje0Btb2RlfS1tb2RlXCIpXG4gICAgQGVkaXRvckVsZW1lbnQuY2xhc3NMaXN0LmFkZChAc3VibW9kZSkgaWYgQHN1Ym1vZGU/XG5cbiAgICBAdmltU3RhdGUuc3RhdHVzQmFyTWFuYWdlci51cGRhdGUoQG1vZGUsIEBzdWJtb2RlKVxuICAgIGlmIEBtb2RlIGlzICd2aXN1YWwnXG4gICAgICBAdmltU3RhdGUuY3Vyc29yU3R5bGVNYW5hZ2VyLnJlZnJlc2goKVxuICAgIGVsc2VcbiAgICAgIEB2aW1TdGF0ZS5nZXRQcm9wKCdjdXJzb3JTdHlsZU1hbmFnZXInKT8ucmVmcmVzaCgpXG5cbiAgICBAZW1pdHRlci5lbWl0KCdkaWQtYWN0aXZhdGUtbW9kZScsIHtAbW9kZSwgQHN1Ym1vZGV9KVxuXG4gIGRlYWN0aXZhdGU6IC0+XG4gICAgdW5sZXNzIEBkZWFjdGl2YXRvcj8uZGlzcG9zZWRcbiAgICAgIEBlbWl0dGVyLmVtaXQoJ3dpbGwtZGVhY3RpdmF0ZS1tb2RlJywge0Btb2RlLCBAc3VibW9kZX0pXG4gICAgICBAZGVhY3RpdmF0b3I/LmRpc3Bvc2UoKVxuICAgICAgIyBSZW1vdmUgY3NzIGNsYXNzIGhlcmUgaW4tY2FzZSBAZGVhY3RpdmF0ZSgpIGNhbGxlZCBzb2xlbHkob2NjdXJyZW5jZSBpbiB2aXN1YWwtbW9kZSlcbiAgICAgIEBlZGl0b3JFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoXCIje0Btb2RlfS1tb2RlXCIpXG4gICAgICBAZWRpdG9yRWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKEBzdWJtb2RlKVxuXG4gICAgICBAZW1pdHRlci5lbWl0KCdkaWQtZGVhY3RpdmF0ZS1tb2RlJywge0Btb2RlLCBAc3VibW9kZX0pXG5cbiAgIyBOb3JtYWxcbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIGFjdGl2YXRlTm9ybWFsTW9kZTogLT5cbiAgICBAdmltU3RhdGUucmVzZXQoKVxuICAgICMgQ29tcG9uZW50IGlzIG5vdCBuZWNlc3NhcnkgYXZhaWFibGUgc2VlICM5OC5cbiAgICBAZWRpdG9yRWxlbWVudC5jb21wb25lbnQ/LnNldElucHV0RW5hYmxlZChmYWxzZSlcblxuICAgICMgSW4gdmlzdWFsLW1vZGUsIGN1cnNvciBjYW4gcGxhY2UgYXQgRU9MLiBtb3ZlIGxlZnQgaWYgY3Vyc29yIGlzIGF0IEVPTFxuICAgICMgV2Ugc2hvdWxkIG5vdCBkbyB0aGlzIGluIHZpc3VhbC1tb2RlIGRlYWN0aXZhdGlvbiBwaGFzZS5cbiAgICAjIGUuZy4gYEFgIGRpcmVjdGx5IHNoaWZ0IGZyb20gdmlzdWEtbW9kZSB0byBgaW5zZXJ0LW1vZGVgLCBhbmQgY3Vyc29yIHNob3VsZCByZW1haW4gYXQgRU9MLlxuICAgIGZvciBjdXJzb3IgaW4gQGVkaXRvci5nZXRDdXJzb3JzKCkgd2hlbiBjdXJzb3IuaXNBdEVuZE9mTGluZSgpIGFuZCBub3QgY3Vyc29yLmlzQXRCZWdpbm5pbmdPZkxpbmUoKVxuICAgICAgIyBEb24ndCB1c2UgdXRpbHMgbW92ZUN1cnNvckxlZnQgdG8gc2tpcCByZXF1aXJlKCcuL3V0aWxzJykgZm9yIGZhc3RlciBzdGFydHVwLlxuICAgICAge2dvYWxDb2x1bW59ID0gY3Vyc29yXG4gICAgICBjdXJzb3IubW92ZUxlZnQoKVxuICAgICAgY3Vyc29yLmdvYWxDb2x1bW4gPSBnb2FsQ29sdW1uIGlmIGdvYWxDb2x1bW4/XG4gICAgbmV3IERpc3Bvc2FibGVcblxuICAjIE9wZXJhdG9yIFBlbmRpbmdcbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIGFjdGl2YXRlT3BlcmF0b3JQZW5kaW5nTW9kZTogLT5cbiAgICBuZXcgRGlzcG9zYWJsZVxuXG4gICMgSW5zZXJ0XG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBhY3RpdmF0ZUluc2VydE1vZGU6IChzdWJtb2RlPW51bGwpIC0+XG4gICAgQGVkaXRvckVsZW1lbnQuY29tcG9uZW50LnNldElucHV0RW5hYmxlZCh0cnVlKVxuICAgIHJlcGxhY2VNb2RlRGVhY3RpdmF0b3IgPSBAYWN0aXZhdGVSZXBsYWNlTW9kZSgpIGlmIHN1Ym1vZGUgaXMgJ3JlcGxhY2UnXG5cbiAgICBuZXcgRGlzcG9zYWJsZSA9PlxuICAgICAgbW92ZUN1cnNvckxlZnQgPz0gcmVxdWlyZSgnLi91dGlscycpLm1vdmVDdXJzb3JMZWZ0XG5cbiAgICAgIHJlcGxhY2VNb2RlRGVhY3RpdmF0b3I/LmRpc3Bvc2UoKVxuICAgICAgcmVwbGFjZU1vZGVEZWFjdGl2YXRvciA9IG51bGxcblxuICAgICAgIyBXaGVuIGVzY2FwZSBmcm9tIGluc2VydC1tb2RlLCBjdXJzb3IgbW92ZSBMZWZ0LlxuICAgICAgbmVlZFNwZWNpYWxDYXJlVG9QcmV2ZW50V3JhcExpbmUgPSBAZWRpdG9yLmhhc0F0b21pY1NvZnRUYWJzKClcbiAgICAgIGZvciBjdXJzb3IgaW4gQGVkaXRvci5nZXRDdXJzb3JzKClcbiAgICAgICAgbW92ZUN1cnNvckxlZnQoY3Vyc29yLCB7bmVlZFNwZWNpYWxDYXJlVG9QcmV2ZW50V3JhcExpbmV9KVxuXG4gIGFjdGl2YXRlUmVwbGFjZU1vZGU6IC0+XG4gICAgQHJlcGxhY2VkQ2hhcnNCeVNlbGVjdGlvbiA9IG5ldyBXZWFrTWFwXG4gICAgc3VicyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG4gICAgc3Vicy5hZGQgQGVkaXRvci5vbldpbGxJbnNlcnRUZXh0ICh7dGV4dCwgY2FuY2VsfSkgPT5cbiAgICAgIGNhbmNlbCgpXG4gICAgICBAZWRpdG9yLmdldFNlbGVjdGlvbnMoKS5mb3JFYWNoIChzZWxlY3Rpb24pID0+XG4gICAgICAgIGZvciBjaGFyIGluIHRleHQuc3BsaXQoJycpID8gW11cbiAgICAgICAgICBpZiAoY2hhciBpc250IFwiXFxuXCIpIGFuZCAobm90IHNlbGVjdGlvbi5jdXJzb3IuaXNBdEVuZE9mTGluZSgpKVxuICAgICAgICAgICAgc2VsZWN0aW9uLnNlbGVjdFJpZ2h0KClcbiAgICAgICAgICBzZWxlY3RlZFRleHQgPSBzZWxlY3Rpb24uZ2V0VGV4dCgpXG4gICAgICAgICAgc2VsZWN0aW9uLmluc2VydFRleHQoY2hhcilcblxuICAgICAgICAgIHVubGVzcyBAcmVwbGFjZWRDaGFyc0J5U2VsZWN0aW9uLmhhcyhzZWxlY3Rpb24pXG4gICAgICAgICAgICBAcmVwbGFjZWRDaGFyc0J5U2VsZWN0aW9uLnNldChzZWxlY3Rpb24sIFtdKVxuICAgICAgICAgIEByZXBsYWNlZENoYXJzQnlTZWxlY3Rpb24uZ2V0KHNlbGVjdGlvbikucHVzaChzZWxlY3RlZFRleHQpXG5cbiAgICBzdWJzLmFkZCBuZXcgRGlzcG9zYWJsZSA9PlxuICAgICAgQHJlcGxhY2VkQ2hhcnNCeVNlbGVjdGlvbiA9IG51bGxcbiAgICBzdWJzXG5cbiAgZ2V0UmVwbGFjZWRDaGFyRm9yU2VsZWN0aW9uOiAoc2VsZWN0aW9uKSAtPlxuICAgIEByZXBsYWNlZENoYXJzQnlTZWxlY3Rpb24uZ2V0KHNlbGVjdGlvbik/LnBvcCgpXG5cbiAgIyBWaXN1YWxcbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICMgV2UgdHJlYXQgYWxsIHNlbGVjdGlvbiBpcyBpbml0aWFsbHkgTk9UIG5vcm1hbGl6ZWRcbiAgI1xuICAjIDEuIEZpcnN0IHdlIG5vcm1hbGl6ZSBzZWxlY3Rpb25cbiAgIyAyLiBUaGVuIHVwZGF0ZSBzZWxlY3Rpb24gb3JpZW50YXRpb24oPXdpc2UpLlxuICAjXG4gICMgUmVnYXJkbGVzcyBvZiBzZWxlY3Rpb24gaXMgbW9kaWZpZWQgYnkgdm1wLWNvbW1hbmQgb3Igb3V0ZXItdm1wLWNvbW1hbmQgbGlrZSBgY21kLWxgLlxuICAjIFdoZW4gbm9ybWFsaXplLCB3ZSBtb3ZlIGN1cnNvciB0byBsZWZ0KHNlbGVjdExlZnQgZXF1aXZhbGVudCkuXG4gICMgU2luY2UgVmltJ3MgdmlzdWFsLW1vZGUgaXMgYWx3YXlzIHNlbGVjdFJpZ2h0ZWQuXG4gICNcbiAgIyAtIHVuLW5vcm1hbGl6ZWQgc2VsZWN0aW9uOiBUaGlzIGlzIHRoZSByYW5nZSB3ZSBzZWUgaW4gdmlzdWFsLW1vZGUuKCBTbyBub3JtYWwgdmlzdWFsLW1vZGUgcmFuZ2UgaW4gdXNlciBwZXJzcGVjdGl2ZSApLlxuICAjIC0gbm9ybWFsaXplZCBzZWxlY3Rpb246IE9uZSBjb2x1bW4gbGVmdCBzZWxjdGVkIGF0IHNlbGVjdGlvbiBlbmQgcG9zaXRpb25cbiAgIyAtIFdoZW4gc2VsZWN0UmlnaHQgYXQgZW5kIHBvc2l0aW9uIG9mIG5vcm1hbGl6ZWQtc2VsZWN0aW9uLCBpdCBiZWNvbWUgdW4tbm9ybWFsaXplZCBzZWxlY3Rpb25cbiAgIyAgIHdoaWNoIGlzIHRoZSByYW5nZSBpbiB2aXN1YWwtbW9kZS5cbiAgYWN0aXZhdGVWaXN1YWxNb2RlOiAoc3VibW9kZSkgLT5cbiAgICBzd3JhcCA9IEB2aW1TdGF0ZS5zd3JhcFxuICAgIGZvciAkc2VsZWN0aW9uIGluIHN3cmFwLmdldFNlbGVjdGlvbnMoQGVkaXRvcikgd2hlbiBub3QgJHNlbGVjdGlvbi5oYXNQcm9wZXJ0aWVzKClcbiAgICAgICRzZWxlY3Rpb24uc2F2ZVByb3BlcnRpZXMoKVxuXG4gICAgc3dyYXAubm9ybWFsaXplKEBlZGl0b3IpXG5cbiAgICAkc2VsZWN0aW9uLmFwcGx5V2lzZShzdWJtb2RlKSBmb3IgJHNlbGVjdGlvbiBpbiBzd3JhcC5nZXRTZWxlY3Rpb25zKEBlZGl0b3IpXG5cbiAgICBAdmltU3RhdGUuZ2V0TGFzdEJsb2Nrd2lzZVNlbGVjdGlvbigpLmF1dG9zY3JvbGwoKSBpZiBzdWJtb2RlIGlzICdibG9ja3dpc2UnXG5cbiAgICBuZXcgRGlzcG9zYWJsZSA9PlxuICAgICAgc3dyYXAubm9ybWFsaXplKEBlZGl0b3IpXG5cbiAgICAgIGlmIEBzdWJtb2RlIGlzICdibG9ja3dpc2UnXG4gICAgICAgIHN3cmFwLnNldFJldmVyc2VkU3RhdGUoQGVkaXRvciwgdHJ1ZSlcbiAgICAgIHNlbGVjdGlvbi5jbGVhcihhdXRvc2Nyb2xsOiBmYWxzZSkgZm9yIHNlbGVjdGlvbiBpbiBAZWRpdG9yLmdldFNlbGVjdGlvbnMoKVxuICAgICAgQHVwZGF0ZU5hcnJvd2VkU3RhdGUoZmFsc2UpXG5cbiAgIyBOYXJyb3cgdG8gc2VsZWN0aW9uXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBoYXNNdWx0aUxpbmVTZWxlY3Rpb246IC0+XG4gICAgaWYgQGlzTW9kZSgndmlzdWFsJywgJ2Jsb2Nrd2lzZScpXG4gICAgICAjIFtGSVhNRV0gd2h5IEkgbmVlZCBudWxsIGd1YXJkIGhlcmVcbiAgICAgIG5vdCBAdmltU3RhdGUuZ2V0TGFzdEJsb2Nrd2lzZVNlbGVjdGlvbigpPy5pc1NpbmdsZVJvdygpXG4gICAgZWxzZVxuICAgICAgbm90IEB2aW1TdGF0ZS5zd3JhcChAZWRpdG9yLmdldExhc3RTZWxlY3Rpb24oKSkuaXNTaW5nbGVSb3coKVxuXG4gIHVwZGF0ZU5hcnJvd2VkU3RhdGU6ICh2YWx1ZT1udWxsKSAtPlxuICAgIEBlZGl0b3JFbGVtZW50LmNsYXNzTGlzdC50b2dnbGUoJ2lzLW5hcnJvd2VkJywgdmFsdWUgPyBAaGFzTXVsdGlMaW5lU2VsZWN0aW9uKCkpXG5cbiAgaXNOYXJyb3dlZDogLT5cbiAgICBAZWRpdG9yRWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoJ2lzLW5hcnJvd2VkJylcblxubW9kdWxlLmV4cG9ydHMgPSBNb2RlTWFuYWdlclxuIl19
