(function() {
  var Base, CompositeDisposable, Disposable, Emitter, ModeManager, Range, _, moveCursorLeft, ref, settings, swrap,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  _ = require('underscore-plus');

  ref = require('atom'), Emitter = ref.Emitter, Range = ref.Range, CompositeDisposable = ref.CompositeDisposable, Disposable = ref.Disposable;

  Base = require('./base');

  swrap = require('./selection-wrapper');

  moveCursorLeft = require('./utils').moveCursorLeft;

  settings = require('./settings');

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
      if ((newMode === 'visual') && (newSubmode === this.submode)) {
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
      this.replacedCharsBySelection = {};
      subs = new CompositeDisposable;
      subs.add(this.editor.onWillInsertText((function(_this) {
        return function(arg) {
          var cancel, text;
          text = arg.text, cancel = arg.cancel;
          cancel();
          return _this.editor.getSelections().forEach(function(selection) {
            var base, char, i, len, name, ref1, ref2, results;
            ref2 = (ref1 = text.split('')) != null ? ref1 : [];
            results = [];
            for (i = 0, len = ref2.length; i < len; i++) {
              char = ref2[i];
              if ((char !== "\n") && (!selection.cursor.isAtEndOfLine())) {
                selection.selectRight();
              }
              if ((base = _this.replacedCharsBySelection)[name = selection.id] == null) {
                base[name] = [];
              }
              results.push(_this.replacedCharsBySelection[selection.id].push(swrap(selection).replace(char)));
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
      return (ref1 = this.replacedCharsBySelection[selection.id]) != null ? ref1.pop() : void 0;
    };

    ModeManager.prototype.activateVisualMode = function(newSubmode) {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvbW9kZS1tYW5hZ2VyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsMkdBQUE7SUFBQTs7RUFBQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSOztFQUNKLE1BQW9ELE9BQUEsQ0FBUSxNQUFSLENBQXBELEVBQUMscUJBQUQsRUFBVSxpQkFBVixFQUFpQiw2Q0FBakIsRUFBc0M7O0VBQ3RDLElBQUEsR0FBTyxPQUFBLENBQVEsUUFBUjs7RUFDUCxLQUFBLEdBQVEsT0FBQSxDQUFRLHFCQUFSOztFQUNQLGlCQUFrQixPQUFBLENBQVEsU0FBUjs7RUFDbkIsUUFBQSxHQUFXLE9BQUEsQ0FBUSxZQUFSOztFQUVMOzBCQUNKLElBQUEsR0FBTTs7MEJBQ04sT0FBQSxHQUFTOzswQkFDVCx3QkFBQSxHQUEwQjs7SUFFYixxQkFBQyxRQUFEO0FBQ1gsVUFBQTtNQURZLElBQUMsQ0FBQSxXQUFEO01BQ1osT0FBNEIsSUFBQyxDQUFBLFFBQTdCLEVBQUMsSUFBQyxDQUFBLGNBQUEsTUFBRixFQUFVLElBQUMsQ0FBQSxxQkFBQTtNQUNYLElBQUMsQ0FBQSxJQUFELEdBQVE7TUFDUixJQUFDLENBQUEsT0FBRCxHQUFXLElBQUk7TUFDZixJQUFDLENBQUEsYUFBRCxHQUFpQixJQUFJO01BQ3JCLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFDLENBQUEsUUFBUSxDQUFDLFlBQVYsQ0FBdUIsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQWMsSUFBZCxDQUF2QixDQUFuQjtJQUxXOzswQkFPYixPQUFBLEdBQVMsU0FBQTthQUNQLElBQUMsQ0FBQSxhQUFhLENBQUMsT0FBZixDQUFBO0lBRE87OzBCQUdULE1BQUEsR0FBUSxTQUFDLElBQUQsRUFBTyxRQUFQO0FBQ04sVUFB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LENBQUMsd0JBQVYsQ0FBQSxFQUhGOzthQUtBLEtBQUssQ0FBQyxTQUFOLENBQWdCLElBQUMsQ0FBQSxNQUFqQjtJQU5tQjs7MEJBVXJCLHFCQUFBLEdBQXVCLFNBQUE7QUFDckIsVUFBQTtNQUFBLElBQUcsSUFBQyxDQUFBLE1BQUQsQ0FBUSxRQUFSLEVBQWtCLFdBQWxCLENBQUg7ZUFFRSxtRUFBeUMsQ0FBRSxXQUF2QyxDQUFBLFlBRk47T0FBQSxNQUFBO2VBSUUsQ0FBSSxLQUFBLENBQU0sSUFBQyxDQUFBLE1BQU0sQ0FBQyxnQkFBUixDQUFBLENBQU4sQ0FBaUMsQ0FBQyxXQUFsQyxDQUFBLEVBSk47O0lBRHFCOzswQkFPdkIsbUJBQUEsR0FBcUIsU0FBQyxLQUFEOztRQUFDLFFBQU07O2FBQzFCLElBQUMsQ0FBQSxhQUFhLENBQUMsU0FBUyxDQUFDLE1BQXpCLENBQWdDLGFBQWhDLGtCQUErQyxRQUFRLElBQUMsQ0FBQSxxQkFBRCxDQUFBLENBQXZEO0lBRG1COzswQkFHckIsVUFBQSxHQUFZLFNBQUE7YUFDVixJQUFDLENBQUEsYUFBYSxDQUFDLFNBQVMsQ0FBQyxRQUF6QixDQUFrQyxhQUFsQztJQURVOzs7Ozs7RUFHZCxNQUFNLENBQUMsT0FBUCxHQUFpQjtBQXhMakIiLCJzb3VyY2VzQ29udGVudCI6WyJfID0gcmVxdWlyZSAndW5kZXJzY29yZS1wbHVzJ1xue0VtaXR0ZXIsIFJhbmdlLCBDb21wb3NpdGVEaXNwb3NhYmxlLCBEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2F0b20nXG5CYXNlID0gcmVxdWlyZSAnLi9iYXNlJ1xuc3dyYXAgPSByZXF1aXJlICcuL3NlbGVjdGlvbi13cmFwcGVyJ1xue21vdmVDdXJzb3JMZWZ0fSA9IHJlcXVpcmUgJy4vdXRpbHMnXG5zZXR0aW5ncyA9IHJlcXVpcmUgJy4vc2V0dGluZ3MnXG5cbmNsYXNzIE1vZGVNYW5hZ2VyXG4gIG1vZGU6ICdpbnNlcnQnICMgTmF0aXZlIGF0b20gaXMgbm90IG1vZGFsIGVkaXRvciBhbmQgaXRzIGRlZmF1bHQgaXMgJ2luc2VydCdcbiAgc3VibW9kZTogbnVsbFxuICByZXBsYWNlZENoYXJzQnlTZWxlY3Rpb246IG51bGxcblxuICBjb25zdHJ1Y3RvcjogKEB2aW1TdGF0ZSkgLT5cbiAgICB7QGVkaXRvciwgQGVkaXRvckVsZW1lbnR9ID0gQHZpbVN0YXRlXG4gICAgQG1vZGUgPSAnaW5zZXJ0J1xuICAgIEBlbWl0dGVyID0gbmV3IEVtaXR0ZXJcbiAgICBAc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIEB2aW1TdGF0ZS5vbkRpZERlc3Ryb3koQGRlc3Ryb3kuYmluZCh0aGlzKSlcblxuICBkZXN0cm95OiAtPlxuICAgIEBzdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuXG4gIGlzTW9kZTogKG1vZGUsIHN1Ym1vZGVzKSAtPlxuICAgIGlmIHN1Ym1vZGVzP1xuICAgICAgKEBtb2RlIGlzIG1vZGUpIGFuZCAoQHN1Ym1vZGUgaW4gW10uY29uY2F0KHN1Ym1vZGVzKSlcbiAgICBlbHNlXG4gICAgICBAbW9kZSBpcyBtb2RlXG5cbiAgIyBFdmVudFxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgb25XaWxsQWN0aXZhdGVNb2RlOiAoZm4pIC0+IEBlbWl0dGVyLm9uKCd3aWxsLWFjdGl2YXRlLW1vZGUnLCBmbilcbiAgb25EaWRBY3RpdmF0ZU1vZGU6IChmbikgLT4gQGVtaXR0ZXIub24oJ2RpZC1hY3RpdmF0ZS1tb2RlJywgZm4pXG4gIG9uV2lsbERlYWN0aXZhdGVNb2RlOiAoZm4pIC0+IEBlbWl0dGVyLm9uKCd3aWxsLWRlYWN0aXZhdGUtbW9kZScsIGZuKVxuICBwcmVlbXB0V2lsbERlYWN0aXZhdGVNb2RlOiAoZm4pIC0+IEBlbWl0dGVyLnByZWVtcHQoJ3dpbGwtZGVhY3RpdmF0ZS1tb2RlJywgZm4pXG4gIG9uRGlkRGVhY3RpdmF0ZU1vZGU6IChmbikgLT4gQGVtaXR0ZXIub24oJ2RpZC1kZWFjdGl2YXRlLW1vZGUnLCBmbilcblxuICAjIGFjdGl2YXRlOiBQdWJsaWNcbiAgIyAgVXNlIHRoaXMgbWV0aG9kIHRvIGNoYW5nZSBtb2RlLCBET05UIHVzZSBvdGhlciBkaXJlY3QgbWV0aG9kLlxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgYWN0aXZhdGU6IChuZXdNb2RlLCBuZXdTdWJtb2RlPW51bGwpIC0+XG4gICAgIyBBdm9pZCBvZGQgc3RhdGUoPXZpc3VhbC1tb2RlIGJ1dCBzZWxlY3Rpb24gaXMgZW1wdHkpXG4gICAgcmV0dXJuIGlmIChuZXdNb2RlIGlzICd2aXN1YWwnKSBhbmQgQGVkaXRvci5pc0VtcHR5KClcblxuICAgIEBlbWl0dGVyLmVtaXQoJ3dpbGwtYWN0aXZhdGUtbW9kZScsIG1vZGU6IG5ld01vZGUsIHN1Ym1vZGU6IG5ld1N1Ym1vZGUpXG5cbiAgICBpZiAobmV3TW9kZSBpcyAndmlzdWFsJykgYW5kIChuZXdTdWJtb2RlIGlzIEBzdWJtb2RlKVxuICAgICAgW25ld01vZGUsIG5ld1N1Ym1vZGVdID0gWydub3JtYWwnLCBudWxsXVxuXG4gICAgQGRlYWN0aXZhdGUoKSBpZiAobmV3TW9kZSBpc250IEBtb2RlKVxuXG4gICAgQGRlYWN0aXZhdG9yID0gc3dpdGNoIG5ld01vZGVcbiAgICAgIHdoZW4gJ25vcm1hbCcgdGhlbiBAYWN0aXZhdGVOb3JtYWxNb2RlKClcbiAgICAgIHdoZW4gJ29wZXJhdG9yLXBlbmRpbmcnIHRoZW4gQGFjdGl2YXRlT3BlcmF0b3JQZW5kaW5nTW9kZSgpXG4gICAgICB3aGVuICdpbnNlcnQnIHRoZW4gQGFjdGl2YXRlSW5zZXJ0TW9kZShuZXdTdWJtb2RlKVxuICAgICAgd2hlbiAndmlzdWFsJyB0aGVuIEBhY3RpdmF0ZVZpc3VhbE1vZGUobmV3U3VibW9kZSlcblxuICAgIEBlZGl0b3JFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoXCIje0Btb2RlfS1tb2RlXCIpXG4gICAgQGVkaXRvckVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShAc3VibW9kZSlcblxuICAgIFtAbW9kZSwgQHN1Ym1vZGVdID0gW25ld01vZGUsIG5ld1N1Ym1vZGVdXG5cbiAgICBAZWRpdG9yRWxlbWVudC5jbGFzc0xpc3QuYWRkKFwiI3tAbW9kZX0tbW9kZVwiKVxuICAgIEBlZGl0b3JFbGVtZW50LmNsYXNzTGlzdC5hZGQoQHN1Ym1vZGUpIGlmIEBzdWJtb2RlP1xuXG4gICAgaWYgQG1vZGUgaXMgJ3Zpc3VhbCdcbiAgICAgIEB1cGRhdGVOYXJyb3dlZFN0YXRlKClcbiAgICAgIEB2aW1TdGF0ZS51cGRhdGVQcmV2aW91c1NlbGVjdGlvbigpXG5cbiAgICBAdmltU3RhdGUuc3RhdHVzQmFyTWFuYWdlci51cGRhdGUoQG1vZGUsIEBzdWJtb2RlKVxuICAgIEB2aW1TdGF0ZS51cGRhdGVDdXJzb3JzVmlzaWJpbGl0eSgpXG5cbiAgICBAZW1pdHRlci5lbWl0KCdkaWQtYWN0aXZhdGUtbW9kZScsIHtAbW9kZSwgQHN1Ym1vZGV9KVxuXG4gIGRlYWN0aXZhdGU6IC0+XG4gICAgdW5sZXNzIEBkZWFjdGl2YXRvcj8uZGlzcG9zZWRcbiAgICAgIEBlbWl0dGVyLmVtaXQoJ3dpbGwtZGVhY3RpdmF0ZS1tb2RlJywge0Btb2RlLCBAc3VibW9kZX0pXG4gICAgICBAZGVhY3RpdmF0b3I/LmRpc3Bvc2UoKVxuICAgICAgIyBSZW1vdmUgY3NzIGNsYXNzIGhlcmUgaW4tY2FzZSBAZGVhY3RpdmF0ZSgpIGNhbGxlZCBzb2xlbHkob2NjdXJyZW5jZSBpbiB2aXN1YWwtbW9kZSlcbiAgICAgIEBlZGl0b3JFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoXCIje0Btb2RlfS1tb2RlXCIpXG4gICAgICBAZWRpdG9yRWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKEBzdWJtb2RlKVxuXG4gICAgICBAZW1pdHRlci5lbWl0KCdkaWQtZGVhY3RpdmF0ZS1tb2RlJywge0Btb2RlLCBAc3VibW9kZX0pXG5cbiAgIyBOb3JtYWxcbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIGFjdGl2YXRlTm9ybWFsTW9kZTogLT5cbiAgICBAdmltU3RhdGUucmVzZXQoKVxuICAgICMgW0ZJWE1FXSBDb21wb25lbnQgaXMgbm90IG5lY2Vzc2FyeSBhdmFpYWJsZSBzZWUgIzk4LlxuICAgIEBlZGl0b3JFbGVtZW50LmNvbXBvbmVudD8uc2V0SW5wdXRFbmFibGVkKGZhbHNlKVxuICAgIG5ldyBEaXNwb3NhYmxlXG5cbiAgIyBPcGVyYXRvciBQZW5kaW5nXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBhY3RpdmF0ZU9wZXJhdG9yUGVuZGluZ01vZGU6IC0+XG4gICAgbmV3IERpc3Bvc2FibGVcblxuICAjIEluc2VydFxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgYWN0aXZhdGVJbnNlcnRNb2RlOiAoc3VibW9kZT1udWxsKSAtPlxuICAgIEBlZGl0b3JFbGVtZW50LmNvbXBvbmVudC5zZXRJbnB1dEVuYWJsZWQodHJ1ZSlcbiAgICByZXBsYWNlTW9kZURlYWN0aXZhdG9yID0gQGFjdGl2YXRlUmVwbGFjZU1vZGUoKSBpZiBzdWJtb2RlIGlzICdyZXBsYWNlJ1xuXG4gICAgbmV3IERpc3Bvc2FibGUgPT5cbiAgICAgIHJlcGxhY2VNb2RlRGVhY3RpdmF0b3I/LmRpc3Bvc2UoKVxuICAgICAgcmVwbGFjZU1vZGVEZWFjdGl2YXRvciA9IG51bGxcblxuICAgICAgIyBXaGVuIGVzY2FwZSBmcm9tIGluc2VydC1tb2RlLCBjdXJzb3IgbW92ZSBMZWZ0LlxuICAgICAgbmVlZFNwZWNpYWxDYXJlVG9QcmV2ZW50V3JhcExpbmUgPSBhdG9tLmNvbmZpZy5nZXQoJ2VkaXRvci5hdG9taWNTb2Z0VGFicycpID8gdHJ1ZVxuICAgICAgZm9yIGN1cnNvciBpbiBAZWRpdG9yLmdldEN1cnNvcnMoKVxuICAgICAgICBtb3ZlQ3Vyc29yTGVmdChjdXJzb3IsIHtuZWVkU3BlY2lhbENhcmVUb1ByZXZlbnRXcmFwTGluZX0pXG5cbiAgYWN0aXZhdGVSZXBsYWNlTW9kZTogLT5cbiAgICBAcmVwbGFjZWRDaGFyc0J5U2VsZWN0aW9uID0ge31cbiAgICBzdWJzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcbiAgICBzdWJzLmFkZCBAZWRpdG9yLm9uV2lsbEluc2VydFRleHQgKHt0ZXh0LCBjYW5jZWx9KSA9PlxuICAgICAgY2FuY2VsKClcbiAgICAgIEBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpLmZvckVhY2ggKHNlbGVjdGlvbikgPT5cbiAgICAgICAgZm9yIGNoYXIgaW4gdGV4dC5zcGxpdCgnJykgPyBbXVxuICAgICAgICAgIGlmIChjaGFyIGlzbnQgXCJcXG5cIikgYW5kIChub3Qgc2VsZWN0aW9uLmN1cnNvci5pc0F0RW5kT2ZMaW5lKCkpXG4gICAgICAgICAgICBzZWxlY3Rpb24uc2VsZWN0UmlnaHQoKVxuICAgICAgICAgIEByZXBsYWNlZENoYXJzQnlTZWxlY3Rpb25bc2VsZWN0aW9uLmlkXSA/PSBbXVxuICAgICAgICAgIEByZXBsYWNlZENoYXJzQnlTZWxlY3Rpb25bc2VsZWN0aW9uLmlkXS5wdXNoKHN3cmFwKHNlbGVjdGlvbikucmVwbGFjZShjaGFyKSlcblxuICAgIHN1YnMuYWRkIG5ldyBEaXNwb3NhYmxlID0+XG4gICAgICBAcmVwbGFjZWRDaGFyc0J5U2VsZWN0aW9uID0gbnVsbFxuICAgIHN1YnNcblxuICBnZXRSZXBsYWNlZENoYXJGb3JTZWxlY3Rpb246IChzZWxlY3Rpb24pIC0+XG4gICAgQHJlcGxhY2VkQ2hhcnNCeVNlbGVjdGlvbltzZWxlY3Rpb24uaWRdPy5wb3AoKVxuXG4gICMgVmlzdWFsXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAjIFdlIHRyZWF0IGFsbCBzZWxlY3Rpb24gaXMgaW5pdGlhbGx5IE5PVCBub3JtYWxpemVkXG4gICNcbiAgIyAxLiBGaXJzdCB3ZSBub3JtYWxpemUgc2VsZWN0aW9uXG4gICMgMi4gVGhlbiB1cGRhdGUgc2VsZWN0aW9uIG9yaWVudGF0aW9uKD13aXNlKS5cbiAgI1xuICAjIFJlZ2FyZGxlc3Mgb2Ygc2VsZWN0aW9uIGlzIG1vZGlmaWVkIGJ5IHZtcC1jb21tYW5kIG9yIG91dGVyLXZtcC1jb21tYW5kIGxpa2UgYGNtZC1sYC5cbiAgIyBXaGVuIG5vcm1hbGl6ZSwgd2UgbW92ZSBjdXJzb3IgdG8gbGVmdChzZWxlY3RMZWZ0IGVxdWl2YWxlbnQpLlxuICAjIFNpbmNlIFZpbSdzIHZpc3VhbC1tb2RlIGlzIGFsd2F5cyBzZWxlY3RSaWdodGVkLlxuICAjXG4gICMgLSB1bi1ub3JtYWxpemVkIHNlbGVjdGlvbjogVGhpcyBpcyB0aGUgcmFuZ2Ugd2Ugc2VlIGluIHZpc3VhbC1tb2RlLiggU28gbm9ybWFsIHZpc3VhbC1tb2RlIHJhbmdlIGluIHVzZXIgcGVyc3BlY3RpdmUgKS5cbiAgIyAtIG5vcm1hbGl6ZWQgc2VsZWN0aW9uOiBPbmUgY29sdW1uIGxlZnQgc2VsY3RlZCBhdCBzZWxlY3Rpb24gZW5kIHBvc2l0aW9uXG4gICMgLSBXaGVuIHNlbGVjdFJpZ2h0IGF0IGVuZCBwb3NpdGlvbiBvZiBub3JtYWxpemVkLXNlbGVjdGlvbiwgaXQgYmVjb21lIHVuLW5vcm1hbGl6ZWQgc2VsZWN0aW9uXG4gICMgICB3aGljaCBpcyB0aGUgcmFuZ2UgaW4gdmlzdWFsLW1vZGUuXG4gICNcbiAgYWN0aXZhdGVWaXN1YWxNb2RlOiAobmV3U3VibW9kZSkgLT5cbiAgICBAbm9ybWFsaXplU2VsZWN0aW9ucygpXG4gICAgc3dyYXAuYXBwbHlXaXNlKEBlZGl0b3IsICdjaGFyYWN0ZXJ3aXNlJylcblxuICAgIHN3aXRjaCBuZXdTdWJtb2RlXG4gICAgICB3aGVuICdsaW5ld2lzZSdcbiAgICAgICAgc3dyYXAuYXBwbHlXaXNlKEBlZGl0b3IsICdsaW5ld2lzZScpXG4gICAgICB3aGVuICdibG9ja3dpc2UnXG4gICAgICAgIEB2aW1TdGF0ZS5zZWxlY3RCbG9ja3dpc2UoKVxuXG4gICAgbmV3IERpc3Bvc2FibGUgPT5cbiAgICAgIEBub3JtYWxpemVTZWxlY3Rpb25zKClcbiAgICAgIHNlbGVjdGlvbi5jbGVhcihhdXRvc2Nyb2xsOiBmYWxzZSkgZm9yIHNlbGVjdGlvbiBpbiBAZWRpdG9yLmdldFNlbGVjdGlvbnMoKVxuICAgICAgQHVwZGF0ZU5hcnJvd2VkU3RhdGUoZmFsc2UpXG5cbiAgbm9ybWFsaXplU2VsZWN0aW9uczogLT5cbiAgICBpZiBAc3VibW9kZSBpcyAnYmxvY2t3aXNlJ1xuICAgICAgZm9yIGJzIGluIEB2aW1TdGF0ZS5nZXRCbG9ja3dpc2VTZWxlY3Rpb25zKClcbiAgICAgICAgYnMucmVzdG9yZUNoYXJhY3Rlcndpc2UoKVxuICAgICAgQHZpbVN0YXRlLmNsZWFyQmxvY2t3aXNlU2VsZWN0aW9ucygpXG5cbiAgICBzd3JhcC5ub3JtYWxpemUoQGVkaXRvcilcblxuICAjIE5hcnJvdyB0byBzZWxlY3Rpb25cbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIGhhc011bHRpTGluZVNlbGVjdGlvbjogLT5cbiAgICBpZiBAaXNNb2RlKCd2aXN1YWwnLCAnYmxvY2t3aXNlJylcbiAgICAgICMgW0ZJWE1FXSB3aHkgSSBuZWVkIG51bGwgZ3VhcmQgaGVyZVxuICAgICAgbm90IEB2aW1TdGF0ZS5nZXRMYXN0QmxvY2t3aXNlU2VsZWN0aW9uKCk/LmlzU2luZ2xlUm93KClcbiAgICBlbHNlXG4gICAgICBub3Qgc3dyYXAoQGVkaXRvci5nZXRMYXN0U2VsZWN0aW9uKCkpLmlzU2luZ2xlUm93KClcblxuICB1cGRhdGVOYXJyb3dlZFN0YXRlOiAodmFsdWU9bnVsbCkgLT5cbiAgICBAZWRpdG9yRWxlbWVudC5jbGFzc0xpc3QudG9nZ2xlKCdpcy1uYXJyb3dlZCcsIHZhbHVlID8gQGhhc011bHRpTGluZVNlbGVjdGlvbigpKVxuXG4gIGlzTmFycm93ZWQ6IC0+XG4gICAgQGVkaXRvckVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKCdpcy1uYXJyb3dlZCcpXG5cbm1vZHVsZS5leHBvcnRzID0gTW9kZU1hbmFnZXJcbiJdfQ==
