(function() {
  var Base, CompositeDisposable, Disposable, Emitter, ModeManager, Range, _, moveCursorLeft, ref, swrap,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  _ = require('underscore-plus');

  ref = require('atom'), Emitter = ref.Emitter, Range = ref.Range, CompositeDisposable = ref.CompositeDisposable, Disposable = ref.Disposable;

  Base = require('./base');

  swrap = require('./selection-wrapper');

  moveCursorLeft = require('./utils').moveCursorLeft;

  ModeManager = (function() {
    ModeManager.prototype.mode = 'insert';

    ModeManager.prototype.submode = null;

    ModeManager.prototype.replacedCharsBySelection = null;

    function ModeManager(vimState) {
      var ref1;
      this.vimState = vimState;
      ref1 = this.vimState, this.editor = ref1.editor, this.editorElement = ref1.editorElement;
      this.mode = 'insert';
      this.emitter = new Emitter;
      this.subscriptions = new CompositeDisposable;
      this.subscriptions.add(this.vimState.onDidDestroy(this.destroy.bind(this)));
    }

    ModeManager.prototype.destroy = function() {
      return this.subscriptions.dispose();
    };

    ModeManager.prototype.isMode = function(mode, submodes) {
      var ref1;
      if (submodes != null) {
        return (this.mode === mode) && (ref1 = this.submode, indexOf.call([].concat(submodes), ref1) >= 0);
      } else {
        return this.mode === mode;
      }
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
      var ref1, ref2;
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
      this.editorElement.classList.add(this.mode + "-mode");
      if (this.submode != null) {
        this.editorElement.classList.add(this.submode);
      }
      if (this.mode === 'visual') {
        this.updateNarrowedState();
        this.vimState.updatePreviousSelection();
      }
      this.vimState.statusBarManager.update(this.mode, this.submode);
      this.vimState.updateCursorsVisibility();
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
      var ref1;
      this.vimState.reset();
      if ((ref1 = this.editorElement.component) != null) {
        ref1.setInputEnabled(false);
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
          var cursor, i, len, needSpecialCareToPreventWrapLine, ref1, ref2, results;
          if (replaceModeDeactivator != null) {
            replaceModeDeactivator.dispose();
          }
          replaceModeDeactivator = null;
          needSpecialCareToPreventWrapLine = (ref1 = atom.config.get('editor.atomicSoftTabs')) != null ? ref1 : true;
          ref2 = _this.editor.getCursors();
          results = [];
          for (i = 0, len = ref2.length; i < len; i++) {
            cursor = ref2[i];
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

    ModeManager.prototype.activateVisualMode = function(newSubmode) {
      this.vimState.assertWithException(newSubmode != null, "activate visual-mode without submode");
      this.normalizeSelections();
      swrap.applyWise(this.editor, 'characterwise');
      switch (newSubmode) {
        case 'linewise':
          swrap.applyWise(this.editor, 'linewise');
          break;
        case 'blockwise':
          this.vimState.selectBlockwise();
      }
      return new Disposable((function(_this) {
        return function() {
          var i, len, ref1, selection;
          _this.normalizeSelections();
          ref1 = _this.editor.getSelections();
          for (i = 0, len = ref1.length; i < len; i++) {
            selection = ref1[i];
            selection.clear({
              autoscroll: false
            });
          }
          return _this.updateNarrowedState(false);
        };
      })(this));
    };

    ModeManager.prototype.normalizeSelections = function() {
      var bs, i, len, ref1;
      if (this.submode === 'blockwise') {
        ref1 = this.vimState.getBlockwiseSelections();
        for (i = 0, len = ref1.length; i < len; i++) {
          bs = ref1[i];
          bs.restoreCharacterwise();
        }
        this.vimState.clearBlockwiseSelections();
      }
      return swrap.normalize(this.editor);
    };

    ModeManager.prototype.hasMultiLineSelection = function() {
      var ref1;
      if (this.isMode('visual', 'blockwise')) {
        return !((ref1 = this.vimState.getLastBlockwiseSelection()) != null ? ref1.isSingleRow() : void 0);
      } else {
        return !swrap(this.editor.getLastSelection()).isSingleRow();
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvbW9kZS1tYW5hZ2VyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsaUdBQUE7SUFBQTs7RUFBQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSOztFQUNKLE1BQW9ELE9BQUEsQ0FBUSxNQUFSLENBQXBELEVBQUMscUJBQUQsRUFBVSxpQkFBVixFQUFpQiw2Q0FBakIsRUFBc0M7O0VBQ3RDLElBQUEsR0FBTyxPQUFBLENBQVEsUUFBUjs7RUFDUCxLQUFBLEdBQVEsT0FBQSxDQUFRLHFCQUFSOztFQUNQLGlCQUFrQixPQUFBLENBQVEsU0FBUjs7RUFFYjswQkFDSixJQUFBLEdBQU07OzBCQUNOLE9BQUEsR0FBUzs7MEJBQ1Qsd0JBQUEsR0FBMEI7O0lBRWIscUJBQUMsUUFBRDtBQUNYLFVBQUE7TUFEWSxJQUFDLENBQUEsV0FBRDtNQUNaLE9BQTRCLElBQUMsQ0FBQSxRQUE3QixFQUFDLElBQUMsQ0FBQSxjQUFBLE1BQUYsRUFBVSxJQUFDLENBQUEscUJBQUE7TUFDWCxJQUFDLENBQUEsSUFBRCxHQUFRO01BQ1IsSUFBQyxDQUFBLE9BQUQsR0FBVyxJQUFJO01BQ2YsSUFBQyxDQUFBLGFBQUQsR0FBaUIsSUFBSTtNQUNyQixJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBQyxDQUFBLFFBQVEsQ0FBQyxZQUFWLENBQXVCLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFjLElBQWQsQ0FBdkIsQ0FBbkI7SUFMVzs7MEJBT2IsT0FBQSxHQUFTLFNBQUE7YUFDUCxJQUFDLENBQUEsYUFBYSxDQUFDLE9BQWYsQ0FBQTtJQURPOzswQkFHVCxNQUFBLEdBQVEsU0FBQyxJQUFELEVBQU8sUUFBUDtBQUNOLFVBQUE7TUFBQSxJQUFHLGdCQUFIO2VBQ0UsQ0FBQyxJQUFD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QjtRQUhhO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFYO0lBWGM7OzBCQWdCcEIsbUJBQUEsR0FBcUIsU0FBQTtBQUNuQixVQUFBO01BQUEsSUFBRyxJQUFDLENBQUEsT0FBRCxLQUFZLFdBQWY7QUFDRTtBQUFBLGFBQUEsc0NBQUE7O1VBQ0UsRUFBRSxDQUFDLG9CQUFILENBQUE7QUFERjtRQUVBLElBQUMsQ0FBQSxRQUFRLENBQUMsd0JBQVYsQ0FBQSxFQUhGOzthQUtBLEtBQUssQ0FBQyxTQUFOLENBQWdCLElBQUMsQ0FBQSxNQUFqQjtJQU5tQjs7MEJBVXJCLHFCQUFBLEdBQXVCLFNBQUE7QUFDckIsVUFBQTtNQUFBLElBQUcsSUFBQyxDQUFBLE1BQUQsQ0FBUSxRQUFSLEVBQWtCLFdBQWxCLENBQUg7ZUFFRSxtRUFBeUMsQ0FBRSxXQUF2QyxDQUFBLFlBRk47T0FBQSxNQUFBO2VBSUUsQ0FBSSxLQUFBLENBQU0sSUFBQyxDQUFBLE1BQU0sQ0FBQyxnQkFBUixDQUFBLENBQU4sQ0FBaUMsQ0FBQyxXQUFsQyxDQUFBLEVBSk47O0lBRHFCOzswQkFPdkIsbUJBQUEsR0FBcUIsU0FBQyxLQUFEOztRQUFDLFFBQU07O2FBQzFCLElBQUMsQ0FBQSxhQUFhLENBQUMsU0FBUyxDQUFDLE1BQXpCLENBQWdDLGFBQWhDLGtCQUErQyxRQUFRLElBQUMsQ0FBQSxxQkFBRCxDQUFBLENBQXZEO0lBRG1COzswQkFHckIsVUFBQSxHQUFZLFNBQUE7YUFDVixJQUFDLENBQUEsYUFBYSxDQUFDLFNBQVMsQ0FBQyxRQUF6QixDQUFrQyxhQUFsQztJQURVOzs7Ozs7RUFHZCxNQUFNLENBQUMsT0FBUCxHQUFpQjtBQTVMakIiLCJzb3VyY2VzQ29udGVudCI6WyJfID0gcmVxdWlyZSAndW5kZXJzY29yZS1wbHVzJ1xue0VtaXR0ZXIsIFJhbmdlLCBDb21wb3NpdGVEaXNwb3NhYmxlLCBEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2F0b20nXG5CYXNlID0gcmVxdWlyZSAnLi9iYXNlJ1xuc3dyYXAgPSByZXF1aXJlICcuL3NlbGVjdGlvbi13cmFwcGVyJ1xue21vdmVDdXJzb3JMZWZ0fSA9IHJlcXVpcmUgJy4vdXRpbHMnXG5cbmNsYXNzIE1vZGVNYW5hZ2VyXG4gIG1vZGU6ICdpbnNlcnQnICMgTmF0aXZlIGF0b20gaXMgbm90IG1vZGFsIGVkaXRvciBhbmQgaXRzIGRlZmF1bHQgaXMgJ2luc2VydCdcbiAgc3VibW9kZTogbnVsbFxuICByZXBsYWNlZENoYXJzQnlTZWxlY3Rpb246IG51bGxcblxuICBjb25zdHJ1Y3RvcjogKEB2aW1TdGF0ZSkgLT5cbiAgICB7QGVkaXRvciwgQGVkaXRvckVsZW1lbnR9ID0gQHZpbVN0YXRlXG4gICAgQG1vZGUgPSAnaW5zZXJ0J1xuICAgIEBlbWl0dGVyID0gbmV3IEVtaXR0ZXJcbiAgICBAc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIEB2aW1TdGF0ZS5vbkRpZERlc3Ryb3koQGRlc3Ryb3kuYmluZCh0aGlzKSlcblxuICBkZXN0cm95OiAtPlxuICAgIEBzdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuXG4gIGlzTW9kZTogKG1vZGUsIHN1Ym1vZGVzKSAtPlxuICAgIGlmIHN1Ym1vZGVzP1xuICAgICAgKEBtb2RlIGlzIG1vZGUpIGFuZCAoQHN1Ym1vZGUgaW4gW10uY29uY2F0KHN1Ym1vZGVzKSlcbiAgICBlbHNlXG4gICAgICBAbW9kZSBpcyBtb2RlXG5cbiAgIyBFdmVudFxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgb25XaWxsQWN0aXZhdGVNb2RlOiAoZm4pIC0+IEBlbWl0dGVyLm9uKCd3aWxsLWFjdGl2YXRlLW1vZGUnLCBmbilcbiAgb25EaWRBY3RpdmF0ZU1vZGU6IChmbikgLT4gQGVtaXR0ZXIub24oJ2RpZC1hY3RpdmF0ZS1tb2RlJywgZm4pXG4gIG9uV2lsbERlYWN0aXZhdGVNb2RlOiAoZm4pIC0+IEBlbWl0dGVyLm9uKCd3aWxsLWRlYWN0aXZhdGUtbW9kZScsIGZuKVxuICBwcmVlbXB0V2lsbERlYWN0aXZhdGVNb2RlOiAoZm4pIC0+IEBlbWl0dGVyLnByZWVtcHQoJ3dpbGwtZGVhY3RpdmF0ZS1tb2RlJywgZm4pXG4gIG9uRGlkRGVhY3RpdmF0ZU1vZGU6IChmbikgLT4gQGVtaXR0ZXIub24oJ2RpZC1kZWFjdGl2YXRlLW1vZGUnLCBmbilcblxuICAjIGFjdGl2YXRlOiBQdWJsaWNcbiAgIyAgVXNlIHRoaXMgbWV0aG9kIHRvIGNoYW5nZSBtb2RlLCBET05UIHVzZSBvdGhlciBkaXJlY3QgbWV0aG9kLlxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgYWN0aXZhdGU6IChuZXdNb2RlLCBuZXdTdWJtb2RlPW51bGwpIC0+XG4gICAgIyBBdm9pZCBvZGQgc3RhdGUoPXZpc3VhbC1tb2RlIGJ1dCBzZWxlY3Rpb24gaXMgZW1wdHkpXG4gICAgcmV0dXJuIGlmIChuZXdNb2RlIGlzICd2aXN1YWwnKSBhbmQgQGVkaXRvci5pc0VtcHR5KClcblxuICAgIEBlbWl0dGVyLmVtaXQoJ3dpbGwtYWN0aXZhdGUtbW9kZScsIG1vZGU6IG5ld01vZGUsIHN1Ym1vZGU6IG5ld1N1Ym1vZGUpXG5cbiAgICBpZiAobmV3TW9kZSBpcyAndmlzdWFsJykgYW5kIEBzdWJtb2RlPyBhbmQgKG5ld1N1Ym1vZGUgaXMgQHN1Ym1vZGUpXG4gICAgICBbbmV3TW9kZSwgbmV3U3VibW9kZV0gPSBbJ25vcm1hbCcsIG51bGxdXG5cbiAgICBAZGVhY3RpdmF0ZSgpIGlmIChuZXdNb2RlIGlzbnQgQG1vZGUpXG5cbiAgICBAZGVhY3RpdmF0b3IgPSBzd2l0Y2ggbmV3TW9kZVxuICAgICAgd2hlbiAnbm9ybWFsJyB0aGVuIEBhY3RpdmF0ZU5vcm1hbE1vZGUoKVxuICAgICAgd2hlbiAnb3BlcmF0b3ItcGVuZGluZycgdGhlbiBAYWN0aXZhdGVPcGVyYXRvclBlbmRpbmdNb2RlKClcbiAgICAgIHdoZW4gJ2luc2VydCcgdGhlbiBAYWN0aXZhdGVJbnNlcnRNb2RlKG5ld1N1Ym1vZGUpXG4gICAgICB3aGVuICd2aXN1YWwnIHRoZW4gQGFjdGl2YXRlVmlzdWFsTW9kZShuZXdTdWJtb2RlKVxuXG4gICAgQGVkaXRvckVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShcIiN7QG1vZGV9LW1vZGVcIilcbiAgICBAZWRpdG9yRWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKEBzdWJtb2RlKVxuXG4gICAgW0Btb2RlLCBAc3VibW9kZV0gPSBbbmV3TW9kZSwgbmV3U3VibW9kZV1cblxuICAgIEBlZGl0b3JFbGVtZW50LmNsYXNzTGlzdC5hZGQoXCIje0Btb2RlfS1tb2RlXCIpXG4gICAgQGVkaXRvckVsZW1lbnQuY2xhc3NMaXN0LmFkZChAc3VibW9kZSkgaWYgQHN1Ym1vZGU/XG5cbiAgICBpZiBAbW9kZSBpcyAndmlzdWFsJ1xuICAgICAgQHVwZGF0ZU5hcnJvd2VkU3RhdGUoKVxuICAgICAgQHZpbVN0YXRlLnVwZGF0ZVByZXZpb3VzU2VsZWN0aW9uKClcblxuICAgIEB2aW1TdGF0ZS5zdGF0dXNCYXJNYW5hZ2VyLnVwZGF0ZShAbW9kZSwgQHN1Ym1vZGUpXG4gICAgQHZpbVN0YXRlLnVwZGF0ZUN1cnNvcnNWaXNpYmlsaXR5KClcblxuICAgIEBlbWl0dGVyLmVtaXQoJ2RpZC1hY3RpdmF0ZS1tb2RlJywge0Btb2RlLCBAc3VibW9kZX0pXG5cbiAgZGVhY3RpdmF0ZTogLT5cbiAgICB1bmxlc3MgQGRlYWN0aXZhdG9yPy5kaXNwb3NlZFxuICAgICAgQGVtaXR0ZXIuZW1pdCgnd2lsbC1kZWFjdGl2YXRlLW1vZGUnLCB7QG1vZGUsIEBzdWJtb2RlfSlcbiAgICAgIEBkZWFjdGl2YXRvcj8uZGlzcG9zZSgpXG4gICAgICAjIFJlbW92ZSBjc3MgY2xhc3MgaGVyZSBpbi1jYXNlIEBkZWFjdGl2YXRlKCkgY2FsbGVkIHNvbGVseShvY2N1cnJlbmNlIGluIHZpc3VhbC1tb2RlKVxuICAgICAgQGVkaXRvckVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShcIiN7QG1vZGV9LW1vZGVcIilcbiAgICAgIEBlZGl0b3JFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoQHN1Ym1vZGUpXG5cbiAgICAgIEBlbWl0dGVyLmVtaXQoJ2RpZC1kZWFjdGl2YXRlLW1vZGUnLCB7QG1vZGUsIEBzdWJtb2RlfSlcblxuICAjIE5vcm1hbFxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgYWN0aXZhdGVOb3JtYWxNb2RlOiAtPlxuICAgIEB2aW1TdGF0ZS5yZXNldCgpXG4gICAgIyBDb21wb25lbnQgaXMgbm90IG5lY2Vzc2FyeSBhdmFpYWJsZSBzZWUgIzk4LlxuICAgIEBlZGl0b3JFbGVtZW50LmNvbXBvbmVudD8uc2V0SW5wdXRFbmFibGVkKGZhbHNlKVxuICAgIG5ldyBEaXNwb3NhYmxlXG5cbiAgIyBPcGVyYXRvciBQZW5kaW5nXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBhY3RpdmF0ZU9wZXJhdG9yUGVuZGluZ01vZGU6IC0+XG4gICAgbmV3IERpc3Bvc2FibGVcblxuICAjIEluc2VydFxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgYWN0aXZhdGVJbnNlcnRNb2RlOiAoc3VibW9kZT1udWxsKSAtPlxuICAgIEBlZGl0b3JFbGVtZW50LmNvbXBvbmVudC5zZXRJbnB1dEVuYWJsZWQodHJ1ZSlcbiAgICByZXBsYWNlTW9kZURlYWN0aXZhdG9yID0gQGFjdGl2YXRlUmVwbGFjZU1vZGUoKSBpZiBzdWJtb2RlIGlzICdyZXBsYWNlJ1xuXG4gICAgbmV3IERpc3Bvc2FibGUgPT5cbiAgICAgIHJlcGxhY2VNb2RlRGVhY3RpdmF0b3I/LmRpc3Bvc2UoKVxuICAgICAgcmVwbGFjZU1vZGVEZWFjdGl2YXRvciA9IG51bGxcblxuICAgICAgIyBXaGVuIGVzY2FwZSBmcm9tIGluc2VydC1tb2RlLCBjdXJzb3IgbW92ZSBMZWZ0LlxuICAgICAgbmVlZFNwZWNpYWxDYXJlVG9QcmV2ZW50V3JhcExpbmUgPSBhdG9tLmNvbmZpZy5nZXQoJ2VkaXRvci5hdG9taWNTb2Z0VGFicycpID8gdHJ1ZVxuICAgICAgZm9yIGN1cnNvciBpbiBAZWRpdG9yLmdldEN1cnNvcnMoKVxuICAgICAgICBtb3ZlQ3Vyc29yTGVmdChjdXJzb3IsIHtuZWVkU3BlY2lhbENhcmVUb1ByZXZlbnRXcmFwTGluZX0pXG5cbiAgYWN0aXZhdGVSZXBsYWNlTW9kZTogLT5cbiAgICBAcmVwbGFjZWRDaGFyc0J5U2VsZWN0aW9uID0gbmV3IFdlYWtNYXBcbiAgICBzdWJzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcbiAgICBzdWJzLmFkZCBAZWRpdG9yLm9uV2lsbEluc2VydFRleHQgKHt0ZXh0LCBjYW5jZWx9KSA9PlxuICAgICAgY2FuY2VsKClcbiAgICAgIEBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpLmZvckVhY2ggKHNlbGVjdGlvbikgPT5cbiAgICAgICAgZm9yIGNoYXIgaW4gdGV4dC5zcGxpdCgnJykgPyBbXVxuICAgICAgICAgIGlmIChjaGFyIGlzbnQgXCJcXG5cIikgYW5kIChub3Qgc2VsZWN0aW9uLmN1cnNvci5pc0F0RW5kT2ZMaW5lKCkpXG4gICAgICAgICAgICBzZWxlY3Rpb24uc2VsZWN0UmlnaHQoKVxuICAgICAgICAgIHNlbGVjdGVkVGV4dCA9IHNlbGVjdGlvbi5nZXRUZXh0KClcbiAgICAgICAgICBzZWxlY3Rpb24uaW5zZXJ0VGV4dChjaGFyKVxuXG4gICAgICAgICAgdW5sZXNzIEByZXBsYWNlZENoYXJzQnlTZWxlY3Rpb24uaGFzKHNlbGVjdGlvbilcbiAgICAgICAgICAgIEByZXBsYWNlZENoYXJzQnlTZWxlY3Rpb24uc2V0KHNlbGVjdGlvbiwgW10pXG4gICAgICAgICAgQHJlcGxhY2VkQ2hhcnNCeVNlbGVjdGlvbi5nZXQoc2VsZWN0aW9uKS5wdXNoKHNlbGVjdGVkVGV4dClcblxuICAgIHN1YnMuYWRkIG5ldyBEaXNwb3NhYmxlID0+XG4gICAgICBAcmVwbGFjZWRDaGFyc0J5U2VsZWN0aW9uID0gbnVsbFxuICAgIHN1YnNcblxuICBnZXRSZXBsYWNlZENoYXJGb3JTZWxlY3Rpb246IChzZWxlY3Rpb24pIC0+XG4gICAgQHJlcGxhY2VkQ2hhcnNCeVNlbGVjdGlvbi5nZXQoc2VsZWN0aW9uKT8ucG9wKClcblxuICAjIFZpc3VhbFxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgIyBXZSB0cmVhdCBhbGwgc2VsZWN0aW9uIGlzIGluaXRpYWxseSBOT1Qgbm9ybWFsaXplZFxuICAjXG4gICMgMS4gRmlyc3Qgd2Ugbm9ybWFsaXplIHNlbGVjdGlvblxuICAjIDIuIFRoZW4gdXBkYXRlIHNlbGVjdGlvbiBvcmllbnRhdGlvbig9d2lzZSkuXG4gICNcbiAgIyBSZWdhcmRsZXNzIG9mIHNlbGVjdGlvbiBpcyBtb2RpZmllZCBieSB2bXAtY29tbWFuZCBvciBvdXRlci12bXAtY29tbWFuZCBsaWtlIGBjbWQtbGAuXG4gICMgV2hlbiBub3JtYWxpemUsIHdlIG1vdmUgY3Vyc29yIHRvIGxlZnQoc2VsZWN0TGVmdCBlcXVpdmFsZW50KS5cbiAgIyBTaW5jZSBWaW0ncyB2aXN1YWwtbW9kZSBpcyBhbHdheXMgc2VsZWN0UmlnaHRlZC5cbiAgI1xuICAjIC0gdW4tbm9ybWFsaXplZCBzZWxlY3Rpb246IFRoaXMgaXMgdGhlIHJhbmdlIHdlIHNlZSBpbiB2aXN1YWwtbW9kZS4oIFNvIG5vcm1hbCB2aXN1YWwtbW9kZSByYW5nZSBpbiB1c2VyIHBlcnNwZWN0aXZlICkuXG4gICMgLSBub3JtYWxpemVkIHNlbGVjdGlvbjogT25lIGNvbHVtbiBsZWZ0IHNlbGN0ZWQgYXQgc2VsZWN0aW9uIGVuZCBwb3NpdGlvblxuICAjIC0gV2hlbiBzZWxlY3RSaWdodCBhdCBlbmQgcG9zaXRpb24gb2Ygbm9ybWFsaXplZC1zZWxlY3Rpb24sIGl0IGJlY29tZSB1bi1ub3JtYWxpemVkIHNlbGVjdGlvblxuICAjICAgd2hpY2ggaXMgdGhlIHJhbmdlIGluIHZpc3VhbC1tb2RlLlxuICAjXG4gIGFjdGl2YXRlVmlzdWFsTW9kZTogKG5ld1N1Ym1vZGUpIC0+XG4gICAgQHZpbVN0YXRlLmFzc2VydFdpdGhFeGNlcHRpb24obmV3U3VibW9kZT8sIFwiYWN0aXZhdGUgdmlzdWFsLW1vZGUgd2l0aG91dCBzdWJtb2RlXCIpXG4gICAgQG5vcm1hbGl6ZVNlbGVjdGlvbnMoKVxuICAgIHN3cmFwLmFwcGx5V2lzZShAZWRpdG9yLCAnY2hhcmFjdGVyd2lzZScpXG5cbiAgICBzd2l0Y2ggbmV3U3VibW9kZVxuICAgICAgd2hlbiAnbGluZXdpc2UnXG4gICAgICAgIHN3cmFwLmFwcGx5V2lzZShAZWRpdG9yLCAnbGluZXdpc2UnKVxuICAgICAgd2hlbiAnYmxvY2t3aXNlJ1xuICAgICAgICBAdmltU3RhdGUuc2VsZWN0QmxvY2t3aXNlKClcblxuICAgIG5ldyBEaXNwb3NhYmxlID0+XG4gICAgICBAbm9ybWFsaXplU2VsZWN0aW9ucygpXG4gICAgICBzZWxlY3Rpb24uY2xlYXIoYXV0b3Njcm9sbDogZmFsc2UpIGZvciBzZWxlY3Rpb24gaW4gQGVkaXRvci5nZXRTZWxlY3Rpb25zKClcbiAgICAgIEB1cGRhdGVOYXJyb3dlZFN0YXRlKGZhbHNlKVxuXG4gIG5vcm1hbGl6ZVNlbGVjdGlvbnM6IC0+XG4gICAgaWYgQHN1Ym1vZGUgaXMgJ2Jsb2Nrd2lzZSdcbiAgICAgIGZvciBicyBpbiBAdmltU3RhdGUuZ2V0QmxvY2t3aXNlU2VsZWN0aW9ucygpXG4gICAgICAgIGJzLnJlc3RvcmVDaGFyYWN0ZXJ3aXNlKClcbiAgICAgIEB2aW1TdGF0ZS5jbGVhckJsb2Nrd2lzZVNlbGVjdGlvbnMoKVxuXG4gICAgc3dyYXAubm9ybWFsaXplKEBlZGl0b3IpXG5cbiAgIyBOYXJyb3cgdG8gc2VsZWN0aW9uXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBoYXNNdWx0aUxpbmVTZWxlY3Rpb246IC0+XG4gICAgaWYgQGlzTW9kZSgndmlzdWFsJywgJ2Jsb2Nrd2lzZScpXG4gICAgICAjIFtGSVhNRV0gd2h5IEkgbmVlZCBudWxsIGd1YXJkIGhlcmVcbiAgICAgIG5vdCBAdmltU3RhdGUuZ2V0TGFzdEJsb2Nrd2lzZVNlbGVjdGlvbigpPy5pc1NpbmdsZVJvdygpXG4gICAgZWxzZVxuICAgICAgbm90IHN3cmFwKEBlZGl0b3IuZ2V0TGFzdFNlbGVjdGlvbigpKS5pc1NpbmdsZVJvdygpXG5cbiAgdXBkYXRlTmFycm93ZWRTdGF0ZTogKHZhbHVlPW51bGwpIC0+XG4gICAgQGVkaXRvckVsZW1lbnQuY2xhc3NMaXN0LnRvZ2dsZSgnaXMtbmFycm93ZWQnLCB2YWx1ZSA/IEBoYXNNdWx0aUxpbmVTZWxlY3Rpb24oKSlcblxuICBpc05hcnJvd2VkOiAtPlxuICAgIEBlZGl0b3JFbGVtZW50LmNsYXNzTGlzdC5jb250YWlucygnaXMtbmFycm93ZWQnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IE1vZGVNYW5hZ2VyXG4iXX0=
