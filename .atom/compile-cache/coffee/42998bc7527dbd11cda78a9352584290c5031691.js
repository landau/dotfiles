(function() {
  var Base, CompositeDisposable, Disposable, Emitter, ModeManager, Range, _, moveCursorLeft, ref, swrap;

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
      if (newMode !== 'visual') {
        swrap.clearProperties(this.editor);
      }
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
      var cursor, i, len, ref1, ref2;
      this.vimState.reset();
      if ((ref1 = this.editorElement.component) != null) {
        ref1.setInputEnabled(false);
      }
      ref2 = this.editor.getCursors();
      for (i = 0, len = ref2.length; i < len; i++) {
        cursor = ref2[i];
        if (cursor.isAtEndOfLine()) {
          moveCursorLeft(cursor, {
            preserveGoalColumn: true
          });
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

    ModeManager.prototype.activateVisualMode = function(newSubmode) {
      var $selection, i, j, len, len1, ref1, ref2;
      this.vimState.assertWithException(newSubmode != null, "activate visual-mode without submode");
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
        $selection.applyWise(newSubmode);
      }
      if (newSubmode === 'blockwise') {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvbW9kZS1tYW5hZ2VyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUjs7RUFDSixNQUFvRCxPQUFBLENBQVEsTUFBUixDQUFwRCxFQUFDLHFCQUFELEVBQVUsaUJBQVYsRUFBaUIsNkNBQWpCLEVBQXNDOztFQUN0QyxJQUFBLEdBQU8sT0FBQSxDQUFRLFFBQVI7O0VBQ1AsS0FBQSxHQUFRLE9BQUEsQ0FBUSxxQkFBUjs7RUFDUCxpQkFBa0IsT0FBQSxDQUFRLFNBQVI7O0VBRWI7MEJBQ0osSUFBQSxHQUFNOzswQkFDTixPQUFBLEdBQVM7OzBCQUNULHdCQUFBLEdBQTBCOztJQUViLHFCQUFDLFFBQUQ7QUFDWCxVQUFBO01BRFksSUFBQyxDQUFBLFdBQUQ7TUFDWixPQUE0QixJQUFDLENBQUEsUUFBN0IsRUFBQyxJQUFDLENBQUEsY0FBQSxNQUFGLEVBQVUsSUFBQyxDQUFBLHFCQUFBO01BQ1gsSUFBQyxDQUFBLElBQUQsR0FBUTtNQUNSLElBQUMsQ0FBQSxPQUFELEdBQVcsSUFBSTtNQUNmLElBQUMsQ0FBQSxhQUFELEdBQWlCLElBQUk7TUFDckIsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUMsQ0FBQSxRQUFRLENBQUMsWUFBVixDQUF1QixJQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsQ0FBYyxJQUFkLENBQXZCLENBQW5CO0lBTFc7OzBCQU9iLE9BQUEsR0FBUyxTQUFBO2FBQ1AsSUFBQyxDQUFBLGFBQWEsQ0FBQyxPQUFmLENBQUE7SUFETzs7MEJBR1QsTUFBQSxHQUFRLFNBQUMsSUFBRCxFQUFPLE9BQVA7O1FBQU8sVUFBUTs7YUFDckIsQ0FBQyxJQUFBLEtBQVEsSUFBQyxDQUFBLElBQVYsQ0FB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QUFBO2VBQUEsU0FBQTtBQUNiLGNBQUE7VUFBQSxLQUFLLENBQUMsU0FBTixDQUFnQixLQUFDLENBQUEsTUFBakI7VUFFQSxJQUFHLEtBQUMsQ0FBQSxPQUFELEtBQVksV0FBZjtZQUNFLEtBQUssQ0FBQyxnQkFBTixDQUF1QixLQUFDLENBQUEsTUFBeEIsRUFBZ0MsSUFBaEMsRUFERjs7QUFFQTtBQUFBLGVBQUEsd0NBQUE7O1lBQUEsU0FBUyxDQUFDLEtBQVYsQ0FBZ0I7Y0FBQSxVQUFBLEVBQVksS0FBWjthQUFoQjtBQUFBO2lCQUNBLEtBQUMsQ0FBQSxtQkFBRCxDQUFxQixLQUFyQjtRQU5hO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFYO0lBWmM7OzBCQXNCcEIscUJBQUEsR0FBdUIsU0FBQTtBQUNyQixVQUFBO01BQUEsSUFBRyxJQUFDLENBQUEsTUFBRCxDQUFRLFFBQVIsRUFBa0IsV0FBbEIsQ0FBSDtlQUVFLG1FQUF5QyxDQUFFLFdBQXZDLENBQUEsWUFGTjtPQUFBLE1BQUE7ZUFJRSxDQUFJLEtBQUEsQ0FBTSxJQUFDLENBQUEsTUFBTSxDQUFDLGdCQUFSLENBQUEsQ0FBTixDQUFpQyxDQUFDLFdBQWxDLENBQUEsRUFKTjs7SUFEcUI7OzBCQU92QixtQkFBQSxHQUFxQixTQUFDLEtBQUQ7O1FBQUMsUUFBTTs7YUFDMUIsSUFBQyxDQUFBLGFBQWEsQ0FBQyxTQUFTLENBQUMsTUFBekIsQ0FBZ0MsYUFBaEMsa0JBQStDLFFBQVEsSUFBQyxDQUFBLHFCQUFELENBQUEsQ0FBdkQ7SUFEbUI7OzBCQUdyQixVQUFBLEdBQVksU0FBQTthQUNWLElBQUMsQ0FBQSxhQUFhLENBQUMsU0FBUyxDQUFDLFFBQXpCLENBQWtDLGFBQWxDO0lBRFU7Ozs7OztFQUdkLE1BQU0sQ0FBQyxPQUFQLEdBQWlCO0FBN0xqQiIsInNvdXJjZXNDb250ZW50IjpbIl8gPSByZXF1aXJlICd1bmRlcnNjb3JlLXBsdXMnXG57RW1pdHRlciwgUmFuZ2UsIENvbXBvc2l0ZURpc3Bvc2FibGUsIERpc3Bvc2FibGV9ID0gcmVxdWlyZSAnYXRvbSdcbkJhc2UgPSByZXF1aXJlICcuL2Jhc2UnXG5zd3JhcCA9IHJlcXVpcmUgJy4vc2VsZWN0aW9uLXdyYXBwZXInXG57bW92ZUN1cnNvckxlZnR9ID0gcmVxdWlyZSAnLi91dGlscydcblxuY2xhc3MgTW9kZU1hbmFnZXJcbiAgbW9kZTogJ2luc2VydCcgIyBOYXRpdmUgYXRvbSBpcyBub3QgbW9kYWwgZWRpdG9yIGFuZCBpdHMgZGVmYXVsdCBpcyAnaW5zZXJ0J1xuICBzdWJtb2RlOiBudWxsXG4gIHJlcGxhY2VkQ2hhcnNCeVNlbGVjdGlvbjogbnVsbFxuXG4gIGNvbnN0cnVjdG9yOiAoQHZpbVN0YXRlKSAtPlxuICAgIHtAZWRpdG9yLCBAZWRpdG9yRWxlbWVudH0gPSBAdmltU3RhdGVcbiAgICBAbW9kZSA9ICdpbnNlcnQnXG4gICAgQGVtaXR0ZXIgPSBuZXcgRW1pdHRlclxuICAgIEBzdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgQHZpbVN0YXRlLm9uRGlkRGVzdHJveShAZGVzdHJveS5iaW5kKHRoaXMpKVxuXG4gIGRlc3Ryb3k6IC0+XG4gICAgQHN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG5cbiAgaXNNb2RlOiAobW9kZSwgc3VibW9kZT1udWxsKSAtPlxuICAgIChtb2RlIGlzIEBtb2RlKSBhbmQgKHN1Ym1vZGUgaXMgQHN1Ym1vZGUpXG5cbiAgIyBFdmVudFxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgb25XaWxsQWN0aXZhdGVNb2RlOiAoZm4pIC0+IEBlbWl0dGVyLm9uKCd3aWxsLWFjdGl2YXRlLW1vZGUnLCBmbilcbiAgb25EaWRBY3RpdmF0ZU1vZGU6IChmbikgLT4gQGVtaXR0ZXIub24oJ2RpZC1hY3RpdmF0ZS1tb2RlJywgZm4pXG4gIG9uV2lsbERlYWN0aXZhdGVNb2RlOiAoZm4pIC0+IEBlbWl0dGVyLm9uKCd3aWxsLWRlYWN0aXZhdGUtbW9kZScsIGZuKVxuICBwcmVlbXB0V2lsbERlYWN0aXZhdGVNb2RlOiAoZm4pIC0+IEBlbWl0dGVyLnByZWVtcHQoJ3dpbGwtZGVhY3RpdmF0ZS1tb2RlJywgZm4pXG4gIG9uRGlkRGVhY3RpdmF0ZU1vZGU6IChmbikgLT4gQGVtaXR0ZXIub24oJ2RpZC1kZWFjdGl2YXRlLW1vZGUnLCBmbilcblxuICAjIGFjdGl2YXRlOiBQdWJsaWNcbiAgIyAgVXNlIHRoaXMgbWV0aG9kIHRvIGNoYW5nZSBtb2RlLCBET05UIHVzZSBvdGhlciBkaXJlY3QgbWV0aG9kLlxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgYWN0aXZhdGU6IChuZXdNb2RlLCBuZXdTdWJtb2RlPW51bGwpIC0+XG4gICAgIyBBdm9pZCBvZGQgc3RhdGUoPXZpc3VhbC1tb2RlIGJ1dCBzZWxlY3Rpb24gaXMgZW1wdHkpXG4gICAgcmV0dXJuIGlmIChuZXdNb2RlIGlzICd2aXN1YWwnKSBhbmQgQGVkaXRvci5pc0VtcHR5KClcblxuICAgIEBlbWl0dGVyLmVtaXQoJ3dpbGwtYWN0aXZhdGUtbW9kZScsIG1vZGU6IG5ld01vZGUsIHN1Ym1vZGU6IG5ld1N1Ym1vZGUpXG5cbiAgICBpZiAobmV3TW9kZSBpcyAndmlzdWFsJykgYW5kIEBzdWJtb2RlPyBhbmQgKG5ld1N1Ym1vZGUgaXMgQHN1Ym1vZGUpXG4gICAgICBbbmV3TW9kZSwgbmV3U3VibW9kZV0gPSBbJ25vcm1hbCcsIG51bGxdXG5cbiAgICBAZGVhY3RpdmF0ZSgpIGlmIChuZXdNb2RlIGlzbnQgQG1vZGUpXG5cbiAgICBAZGVhY3RpdmF0b3IgPSBzd2l0Y2ggbmV3TW9kZVxuICAgICAgd2hlbiAnbm9ybWFsJyB0aGVuIEBhY3RpdmF0ZU5vcm1hbE1vZGUoKVxuICAgICAgd2hlbiAnb3BlcmF0b3ItcGVuZGluZycgdGhlbiBAYWN0aXZhdGVPcGVyYXRvclBlbmRpbmdNb2RlKClcbiAgICAgIHdoZW4gJ2luc2VydCcgdGhlbiBAYWN0aXZhdGVJbnNlcnRNb2RlKG5ld1N1Ym1vZGUpXG4gICAgICB3aGVuICd2aXN1YWwnIHRoZW4gQGFjdGl2YXRlVmlzdWFsTW9kZShuZXdTdWJtb2RlKVxuXG4gICAgdW5sZXNzIG5ld01vZGUgaXMgJ3Zpc3VhbCdcbiAgICAgIHN3cmFwLmNsZWFyUHJvcGVydGllcyhAZWRpdG9yKVxuXG4gICAgQGVkaXRvckVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShcIiN7QG1vZGV9LW1vZGVcIilcbiAgICBAZWRpdG9yRWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKEBzdWJtb2RlKVxuXG4gICAgW0Btb2RlLCBAc3VibW9kZV0gPSBbbmV3TW9kZSwgbmV3U3VibW9kZV1cblxuICAgIEBlZGl0b3JFbGVtZW50LmNsYXNzTGlzdC5hZGQoXCIje0Btb2RlfS1tb2RlXCIpXG4gICAgQGVkaXRvckVsZW1lbnQuY2xhc3NMaXN0LmFkZChAc3VibW9kZSkgaWYgQHN1Ym1vZGU/XG5cbiAgICBpZiBAbW9kZSBpcyAndmlzdWFsJ1xuICAgICAgQHVwZGF0ZU5hcnJvd2VkU3RhdGUoKVxuICAgICAgQHZpbVN0YXRlLnVwZGF0ZVByZXZpb3VzU2VsZWN0aW9uKClcblxuICAgIEB2aW1TdGF0ZS5zdGF0dXNCYXJNYW5hZ2VyLnVwZGF0ZShAbW9kZSwgQHN1Ym1vZGUpXG4gICAgQHZpbVN0YXRlLnVwZGF0ZUN1cnNvcnNWaXNpYmlsaXR5KClcblxuICAgIEBlbWl0dGVyLmVtaXQoJ2RpZC1hY3RpdmF0ZS1tb2RlJywge0Btb2RlLCBAc3VibW9kZX0pXG5cbiAgZGVhY3RpdmF0ZTogLT5cbiAgICB1bmxlc3MgQGRlYWN0aXZhdG9yPy5kaXNwb3NlZFxuICAgICAgQGVtaXR0ZXIuZW1pdCgnd2lsbC1kZWFjdGl2YXRlLW1vZGUnLCB7QG1vZGUsIEBzdWJtb2RlfSlcbiAgICAgIEBkZWFjdGl2YXRvcj8uZGlzcG9zZSgpXG4gICAgICAjIFJlbW92ZSBjc3MgY2xhc3MgaGVyZSBpbi1jYXNlIEBkZWFjdGl2YXRlKCkgY2FsbGVkIHNvbGVseShvY2N1cnJlbmNlIGluIHZpc3VhbC1tb2RlKVxuICAgICAgQGVkaXRvckVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShcIiN7QG1vZGV9LW1vZGVcIilcbiAgICAgIEBlZGl0b3JFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoQHN1Ym1vZGUpXG5cbiAgICAgIEBlbWl0dGVyLmVtaXQoJ2RpZC1kZWFjdGl2YXRlLW1vZGUnLCB7QG1vZGUsIEBzdWJtb2RlfSlcblxuICAjIE5vcm1hbFxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgYWN0aXZhdGVOb3JtYWxNb2RlOiAtPlxuICAgIEB2aW1TdGF0ZS5yZXNldCgpXG4gICAgIyBDb21wb25lbnQgaXMgbm90IG5lY2Vzc2FyeSBhdmFpYWJsZSBzZWUgIzk4LlxuICAgIEBlZGl0b3JFbGVtZW50LmNvbXBvbmVudD8uc2V0SW5wdXRFbmFibGVkKGZhbHNlKVxuXG4gICAgIyBJbiB2aXN1YWwtbW9kZSwgY3Vyc29yIGNhbiBwbGFjZSBhdCBFT0wuIG1vdmUgbGVmdCBpZiBjdXJzb3IgaXMgYXQgRU9MXG4gICAgIyBXZSBzaG91bGQgbm90IGRvIHRoaXMgaW4gdmlzdWFsLW1vZGUgZGVhY3RpdmF0aW9uIHBoYXNlLlxuICAgICMgZS5nLiBgQWAgZGlyZWN0bHkgc2hpZnQgZnJvbSB2aXN1YS1tb2RlIHRvIGBpbnNlcnQtbW9kZWAsIGFuZCBjdXJzb3Igc2hvdWxkIHJlbWFpbiBhdCBFT0wuXG4gICAgZm9yIGN1cnNvciBpbiBAZWRpdG9yLmdldEN1cnNvcnMoKSB3aGVuIGN1cnNvci5pc0F0RW5kT2ZMaW5lKClcbiAgICAgIG1vdmVDdXJzb3JMZWZ0KGN1cnNvciwgcHJlc2VydmVHb2FsQ29sdW1uOiB0cnVlKVxuICAgIG5ldyBEaXNwb3NhYmxlXG5cbiAgIyBPcGVyYXRvciBQZW5kaW5nXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBhY3RpdmF0ZU9wZXJhdG9yUGVuZGluZ01vZGU6IC0+XG4gICAgbmV3IERpc3Bvc2FibGVcblxuICAjIEluc2VydFxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgYWN0aXZhdGVJbnNlcnRNb2RlOiAoc3VibW9kZT1udWxsKSAtPlxuICAgIEBlZGl0b3JFbGVtZW50LmNvbXBvbmVudC5zZXRJbnB1dEVuYWJsZWQodHJ1ZSlcbiAgICByZXBsYWNlTW9kZURlYWN0aXZhdG9yID0gQGFjdGl2YXRlUmVwbGFjZU1vZGUoKSBpZiBzdWJtb2RlIGlzICdyZXBsYWNlJ1xuXG4gICAgbmV3IERpc3Bvc2FibGUgPT5cbiAgICAgIHJlcGxhY2VNb2RlRGVhY3RpdmF0b3I/LmRpc3Bvc2UoKVxuICAgICAgcmVwbGFjZU1vZGVEZWFjdGl2YXRvciA9IG51bGxcblxuICAgICAgIyBXaGVuIGVzY2FwZSBmcm9tIGluc2VydC1tb2RlLCBjdXJzb3IgbW92ZSBMZWZ0LlxuICAgICAgbmVlZFNwZWNpYWxDYXJlVG9QcmV2ZW50V3JhcExpbmUgPSBAZWRpdG9yLmhhc0F0b21pY1NvZnRUYWJzKClcbiAgICAgIGZvciBjdXJzb3IgaW4gQGVkaXRvci5nZXRDdXJzb3JzKClcbiAgICAgICAgbW92ZUN1cnNvckxlZnQoY3Vyc29yLCB7bmVlZFNwZWNpYWxDYXJlVG9QcmV2ZW50V3JhcExpbmV9KVxuXG4gIGFjdGl2YXRlUmVwbGFjZU1vZGU6IC0+XG4gICAgQHJlcGxhY2VkQ2hhcnNCeVNlbGVjdGlvbiA9IG5ldyBXZWFrTWFwXG4gICAgc3VicyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG4gICAgc3Vicy5hZGQgQGVkaXRvci5vbldpbGxJbnNlcnRUZXh0ICh7dGV4dCwgY2FuY2VsfSkgPT5cbiAgICAgIGNhbmNlbCgpXG4gICAgICBAZWRpdG9yLmdldFNlbGVjdGlvbnMoKS5mb3JFYWNoIChzZWxlY3Rpb24pID0+XG4gICAgICAgIGZvciBjaGFyIGluIHRleHQuc3BsaXQoJycpID8gW11cbiAgICAgICAgICBpZiAoY2hhciBpc250IFwiXFxuXCIpIGFuZCAobm90IHNlbGVjdGlvbi5jdXJzb3IuaXNBdEVuZE9mTGluZSgpKVxuICAgICAgICAgICAgc2VsZWN0aW9uLnNlbGVjdFJpZ2h0KClcbiAgICAgICAgICBzZWxlY3RlZFRleHQgPSBzZWxlY3Rpb24uZ2V0VGV4dCgpXG4gICAgICAgICAgc2VsZWN0aW9uLmluc2VydFRleHQoY2hhcilcblxuICAgICAgICAgIHVubGVzcyBAcmVwbGFjZWRDaGFyc0J5U2VsZWN0aW9uLmhhcyhzZWxlY3Rpb24pXG4gICAgICAgICAgICBAcmVwbGFjZWRDaGFyc0J5U2VsZWN0aW9uLnNldChzZWxlY3Rpb24sIFtdKVxuICAgICAgICAgIEByZXBsYWNlZENoYXJzQnlTZWxlY3Rpb24uZ2V0KHNlbGVjdGlvbikucHVzaChzZWxlY3RlZFRleHQpXG5cbiAgICBzdWJzLmFkZCBuZXcgRGlzcG9zYWJsZSA9PlxuICAgICAgQHJlcGxhY2VkQ2hhcnNCeVNlbGVjdGlvbiA9IG51bGxcbiAgICBzdWJzXG5cbiAgZ2V0UmVwbGFjZWRDaGFyRm9yU2VsZWN0aW9uOiAoc2VsZWN0aW9uKSAtPlxuICAgIEByZXBsYWNlZENoYXJzQnlTZWxlY3Rpb24uZ2V0KHNlbGVjdGlvbik/LnBvcCgpXG5cbiAgIyBWaXN1YWxcbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICMgV2UgdHJlYXQgYWxsIHNlbGVjdGlvbiBpcyBpbml0aWFsbHkgTk9UIG5vcm1hbGl6ZWRcbiAgI1xuICAjIDEuIEZpcnN0IHdlIG5vcm1hbGl6ZSBzZWxlY3Rpb25cbiAgIyAyLiBUaGVuIHVwZGF0ZSBzZWxlY3Rpb24gb3JpZW50YXRpb24oPXdpc2UpLlxuICAjXG4gICMgUmVnYXJkbGVzcyBvZiBzZWxlY3Rpb24gaXMgbW9kaWZpZWQgYnkgdm1wLWNvbW1hbmQgb3Igb3V0ZXItdm1wLWNvbW1hbmQgbGlrZSBgY21kLWxgLlxuICAjIFdoZW4gbm9ybWFsaXplLCB3ZSBtb3ZlIGN1cnNvciB0byBsZWZ0KHNlbGVjdExlZnQgZXF1aXZhbGVudCkuXG4gICMgU2luY2UgVmltJ3MgdmlzdWFsLW1vZGUgaXMgYWx3YXlzIHNlbGVjdFJpZ2h0ZWQuXG4gICNcbiAgIyAtIHVuLW5vcm1hbGl6ZWQgc2VsZWN0aW9uOiBUaGlzIGlzIHRoZSByYW5nZSB3ZSBzZWUgaW4gdmlzdWFsLW1vZGUuKCBTbyBub3JtYWwgdmlzdWFsLW1vZGUgcmFuZ2UgaW4gdXNlciBwZXJzcGVjdGl2ZSApLlxuICAjIC0gbm9ybWFsaXplZCBzZWxlY3Rpb246IE9uZSBjb2x1bW4gbGVmdCBzZWxjdGVkIGF0IHNlbGVjdGlvbiBlbmQgcG9zaXRpb25cbiAgIyAtIFdoZW4gc2VsZWN0UmlnaHQgYXQgZW5kIHBvc2l0aW9uIG9mIG5vcm1hbGl6ZWQtc2VsZWN0aW9uLCBpdCBiZWNvbWUgdW4tbm9ybWFsaXplZCBzZWxlY3Rpb25cbiAgIyAgIHdoaWNoIGlzIHRoZSByYW5nZSBpbiB2aXN1YWwtbW9kZS5cbiAgYWN0aXZhdGVWaXN1YWxNb2RlOiAobmV3U3VibW9kZSkgLT5cbiAgICBAdmltU3RhdGUuYXNzZXJ0V2l0aEV4Y2VwdGlvbihuZXdTdWJtb2RlPywgXCJhY3RpdmF0ZSB2aXN1YWwtbW9kZSB3aXRob3V0IHN1Ym1vZGVcIilcblxuICAgIGZvciAkc2VsZWN0aW9uIGluIHN3cmFwLmdldFNlbGVjdGlvbnMoQGVkaXRvcikgd2hlbiBub3QgJHNlbGVjdGlvbi5oYXNQcm9wZXJ0aWVzKClcbiAgICAgICRzZWxlY3Rpb24uc2F2ZVByb3BlcnRpZXMoKVxuXG4gICAgc3dyYXAubm9ybWFsaXplKEBlZGl0b3IpXG5cbiAgICAkc2VsZWN0aW9uLmFwcGx5V2lzZShuZXdTdWJtb2RlKSBmb3IgJHNlbGVjdGlvbiBpbiBzd3JhcC5nZXRTZWxlY3Rpb25zKEBlZGl0b3IpXG5cbiAgICBAdmltU3RhdGUuZ2V0TGFzdEJsb2Nrd2lzZVNlbGVjdGlvbigpLmF1dG9zY3JvbGwoKSBpZiBuZXdTdWJtb2RlIGlzICdibG9ja3dpc2UnXG5cbiAgICBuZXcgRGlzcG9zYWJsZSA9PlxuICAgICAgc3dyYXAubm9ybWFsaXplKEBlZGl0b3IpXG5cbiAgICAgIGlmIEBzdWJtb2RlIGlzICdibG9ja3dpc2UnXG4gICAgICAgIHN3cmFwLnNldFJldmVyc2VkU3RhdGUoQGVkaXRvciwgdHJ1ZSlcbiAgICAgIHNlbGVjdGlvbi5jbGVhcihhdXRvc2Nyb2xsOiBmYWxzZSkgZm9yIHNlbGVjdGlvbiBpbiBAZWRpdG9yLmdldFNlbGVjdGlvbnMoKVxuICAgICAgQHVwZGF0ZU5hcnJvd2VkU3RhdGUoZmFsc2UpXG5cbiAgIyBOYXJyb3cgdG8gc2VsZWN0aW9uXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBoYXNNdWx0aUxpbmVTZWxlY3Rpb246IC0+XG4gICAgaWYgQGlzTW9kZSgndmlzdWFsJywgJ2Jsb2Nrd2lzZScpXG4gICAgICAjIFtGSVhNRV0gd2h5IEkgbmVlZCBudWxsIGd1YXJkIGhlcmVcbiAgICAgIG5vdCBAdmltU3RhdGUuZ2V0TGFzdEJsb2Nrd2lzZVNlbGVjdGlvbigpPy5pc1NpbmdsZVJvdygpXG4gICAgZWxzZVxuICAgICAgbm90IHN3cmFwKEBlZGl0b3IuZ2V0TGFzdFNlbGVjdGlvbigpKS5pc1NpbmdsZVJvdygpXG5cbiAgdXBkYXRlTmFycm93ZWRTdGF0ZTogKHZhbHVlPW51bGwpIC0+XG4gICAgQGVkaXRvckVsZW1lbnQuY2xhc3NMaXN0LnRvZ2dsZSgnaXMtbmFycm93ZWQnLCB2YWx1ZSA/IEBoYXNNdWx0aUxpbmVTZWxlY3Rpb24oKSlcblxuICBpc05hcnJvd2VkOiAtPlxuICAgIEBlZGl0b3JFbGVtZW50LmNsYXNzTGlzdC5jb250YWlucygnaXMtbmFycm93ZWQnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IE1vZGVNYW5hZ2VyXG4iXX0=
