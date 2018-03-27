(function() {
  var CompositeDisposable, CursorStyleManager, Delegato, Disposable, Point, SupportCursorSetVisible, ref,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  ref = require('atom'), Point = ref.Point, Disposable = ref.Disposable, CompositeDisposable = ref.CompositeDisposable;

  Delegato = require('delegato');

  SupportCursorSetVisible = null;

  module.exports = CursorStyleManager = (function() {
    CursorStyleManager.prototype.lineHeight = null;

    Delegato.includeInto(CursorStyleManager);

    CursorStyleManager.delegatesProperty('mode', 'submode', {
      toProperty: 'vimState'
    });

    function CursorStyleManager(vimState) {
      var ref1;
      this.vimState = vimState;
      this.refresh = bind(this.refresh, this);
      this.destroy = bind(this.destroy, this);
      ref1 = this.vimState, this.editorElement = ref1.editorElement, this.editor = ref1.editor;
      if (SupportCursorSetVisible == null) {
        SupportCursorSetVisible = this.editor.getLastCursor().setVisible != null;
      }
      this.disposables = new CompositeDisposable;
      this.disposables.add(atom.config.observe('editor.lineHeight', this.refresh));
      this.disposables.add(atom.config.observe('editor.fontSize', this.refresh));
      this.vimState.onDidDestroy(this.destroy);
    }

    CursorStyleManager.prototype.destroy = function() {
      var ref1;
      if ((ref1 = this.styleDisposables) != null) {
        ref1.dispose();
      }
      return this.disposables.dispose();
    };

    CursorStyleManager.prototype.updateCursorStyleOld = function() {
      var cursor, cursorIsVisible, cursorsToShow, i, len, ref1, ref2, results;
      if ((ref1 = this.styleDisposables) != null) {
        ref1.dispose();
      }
      this.styleDisposables = new CompositeDisposable;
      if (this.mode !== 'visual') {
        return;
      }
      if (this.submode === 'blockwise') {
        cursorsToShow = this.vimState.getBlockwiseSelections().map(function(bs) {
          return bs.getHeadSelection().cursor;
        });
      } else {
        cursorsToShow = this.editor.getCursors();
      }
      this.editorElement.component.updateSync();
      ref2 = this.editor.getCursors();
      results = [];
      for (i = 0, len = ref2.length; i < len; i++) {
        cursor = ref2[i];
        cursorIsVisible = indexOf.call(cursorsToShow, cursor) >= 0;
        cursor.setVisible(cursorIsVisible);
        if (cursorIsVisible) {
          results.push(this.styleDisposables.add(this.modifyCursorStyle(cursor, this.getCursorStyle(cursor, true))));
        } else {
          results.push(void 0);
        }
      }
      return results;
    };

    CursorStyleManager.prototype.modifyCursorStyle = function(cursor, cursorStyle) {
      var cursorNode;
      cursorStyle = this.getCursorStyle(cursor, true);
      cursorNode = this.editorElement.component.linesComponent.cursorsComponent.cursorNodesById[cursor.id];
      if (cursorNode) {
        cursorNode.style.setProperty('top', cursorStyle.top);
        cursorNode.style.setProperty('left', cursorStyle.left);
        return new Disposable(function() {
          var ref1, ref2;
          if ((ref1 = cursorNode.style) != null) {
            ref1.removeProperty('top');
          }
          return (ref2 = cursorNode.style) != null ? ref2.removeProperty('left') : void 0;
        });
      } else {
        return new Disposable;
      }
    };

    CursorStyleManager.prototype.updateCursorStyleNew = function() {
      var cursor, cursorsToShow, decoration, i, j, len, len1, ref1, ref2, results;
      ref1 = this.editor.getDecorations({
        type: 'cursor',
        "class": 'vim-mode-plus'
      });
      for (i = 0, len = ref1.length; i < len; i++) {
        decoration = ref1[i];
        decoration.destroy();
      }
      if (this.mode !== 'visual') {
        return;
      }
      if (this.submode === 'blockwise') {
        cursorsToShow = this.vimState.getBlockwiseSelections().map(function(bs) {
          return bs.getHeadSelection().cursor;
        });
      } else {
        cursorsToShow = this.editor.getCursors();
      }
      ref2 = this.editor.getCursors();
      results = [];
      for (j = 0, len1 = ref2.length; j < len1; j++) {
        cursor = ref2[j];
        results.push(this.editor.decorateMarker(cursor.getMarker(), {
          type: 'cursor',
          "class": 'vim-mode-plus',
          style: this.getCursorStyle(cursor, indexOf.call(cursorsToShow, cursor) >= 0)
        }));
      }
      return results;
    };

    CursorStyleManager.prototype.refresh = function() {
      if (atom.inSpecMode()) {
        return;
      }
      this.lineHeight = this.editor.getLineHeightInPixels();
      if (SupportCursorSetVisible) {
        return this.updateCursorStyleOld();
      } else {
        return this.updateCursorStyleNew();
      }
    };

    CursorStyleManager.prototype.getCursorBufferPositionToDisplay = function(selection) {
      var bufferPosition, bufferPositionToDisplay, screenPosition;
      bufferPosition = this.vimState.swrap(selection).getBufferPositionFor('head', {
        from: ['property']
      });
      if (this.editor.hasAtomicSoftTabs() && !selection.isReversed()) {
        screenPosition = this.editor.screenPositionForBufferPosition(bufferPosition.translate([0, +1]), {
          clipDirection: 'forward'
        });
        bufferPositionToDisplay = this.editor.bufferPositionForScreenPosition(screenPosition).translate([0, -1]);
        if (bufferPositionToDisplay.isGreaterThan(bufferPosition)) {
          bufferPosition = bufferPositionToDisplay;
        }
      }
      return this.editor.clipBufferPosition(bufferPosition);
    };

    CursorStyleManager.prototype.getCursorStyle = function(cursor, visible) {
      var bufferPosition, column, ref1, ref2, row, screenPosition;
      if (visible) {
        bufferPosition = this.getCursorBufferPositionToDisplay(cursor.selection);
        if (this.submode === 'linewise' && this.editor.isSoftWrapped()) {
          screenPosition = this.editor.screenPositionForBufferPosition(bufferPosition);
          ref1 = screenPosition.traversalFrom(cursor.getScreenPosition()), row = ref1.row, column = ref1.column;
        } else {
          ref2 = bufferPosition.traversalFrom(cursor.getBufferPosition()), row = ref2.row, column = ref2.column;
        }
        return {
          top: this.lineHeight * row + 'px',
          left: column + 'ch',
          visibility: 'visible'
        };
      } else {
        return {
          visibility: 'hidden'
        };
      }
    };

    return CursorStyleManager;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvY3Vyc29yLXN0eWxlLW1hbmFnZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSxrR0FBQTtJQUFBOzs7RUFBQSxNQUEyQyxPQUFBLENBQVEsTUFBUixDQUEzQyxFQUFDLGlCQUFELEVBQVEsMkJBQVIsRUFBb0I7O0VBQ3BCLFFBQUEsR0FBVyxPQUFBLENBQVEsVUFBUjs7RUFDWCx1QkFBQSxHQUEwQjs7RUFJMUIsTUFBTSxDQUFDLE9BQVAsR0FDTTtpQ0FDSixVQUFBLEdBQVk7O0lBRVosUUFBUSxDQUFDLFdBQVQsQ0FBcUIsa0JBQXJCOztJQUNBLGtCQUFDLENBQUEsaUJBQUQsQ0FBbUIsTUFBbkIsRUFBMkIsU0FBM0IsRUFBc0M7TUFBQSxVQUFBLEVBQVksVUFBWjtLQUF0Qzs7SUFFYSw0QkFBQyxRQUFEO0FBQ1gsVUFBQTtNQURZLElBQUMsQ0FBQSxXQUFEOzs7TUFDWixPQUE0QixJQUFDLENBQUEsUUFBN0IsRUFBQyxJQUFDLENBQUEscUJBQUEsYUFBRixFQUFpQixJQUFDLENBQUEsY0FBQTs7UUFDbEIsMEJBQTJCOztNQUMzQixJQUFDLENBQUEsV0FBRCxHQUFlLElBQUk7TUFDbkIsSUFBQyxDQUFBLFdBQVcsQ0FBQyxHQUFiLENBQWlCLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBWixDQUFvQixtQkFBcEIsRUFBeUMsSUFBQyxDQUFBLE9BQTFDLENBQWpCO01BQ0EsSUFBQyxDQUFBLFdBQVcsQ0FBQyxHQUFiLENBQWlCLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBWixDQUFvQixpQkFBcEIsRUFBdUMsSUFBQyxDQUFBLE9BQXhDLENBQWpCO01BQ0EsSUFBQyxDQUFBLFFBQVEsQ0FBQyxZQUFWLENBQXVCLElBQUMsQ0FBQSxPQUF4QjtJQU5XOztpQ0FRYixPQUFBLEdB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QVJnQzs7aUNBVWxDLGNBQUEsR0FBZ0IsU0FBQyxNQUFELEVBQVMsT0FBVDtBQUNkLFVBQUE7TUFBQSxJQUFHLE9BQUg7UUFDRSxjQUFBLEdBQWlCLElBQUMsQ0FBQSxnQ0FBRCxDQUFrQyxNQUFNLENBQUMsU0FBekM7UUFDakIsSUFBRyxJQUFDLENBQUEsT0FBRCxLQUFZLFVBQVosSUFBMkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxhQUFSLENBQUEsQ0FBOUI7VUFDRSxjQUFBLEdBQWlCLElBQUMsQ0FBQSxNQUFNLENBQUMsK0JBQVIsQ0FBd0MsY0FBeEM7VUFDakIsT0FBZ0IsY0FBYyxDQUFDLGFBQWYsQ0FBNkIsTUFBTSxDQUFDLGlCQUFQLENBQUEsQ0FBN0IsQ0FBaEIsRUFBQyxjQUFELEVBQU0scUJBRlI7U0FBQSxNQUFBO1VBSUUsT0FBZ0IsY0FBYyxDQUFDLGFBQWYsQ0FBNkIsTUFBTSxDQUFDLGlCQUFQLENBQUEsQ0FBN0IsQ0FBaEIsRUFBQyxjQUFELEVBQU0scUJBSlI7O0FBTUEsZUFBTztVQUNMLEdBQUEsRUFBSyxJQUFDLENBQUEsVUFBRCxHQUFjLEdBQWQsR0FBb0IsSUFEcEI7VUFFTCxJQUFBLEVBQU0sTUFBQSxHQUFTLElBRlY7VUFHTCxVQUFBLEVBQVksU0FIUDtVQVJUO09BQUEsTUFBQTtBQWNFLGVBQU87VUFBQyxVQUFBLEVBQVksUUFBYjtVQWRUOztJQURjOzs7OztBQXRHbEIiLCJzb3VyY2VzQ29udGVudCI6WyJ7UG9pbnQsIERpc3Bvc2FibGUsIENvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSAnYXRvbSdcbkRlbGVnYXRvID0gcmVxdWlyZSAnZGVsZWdhdG8nXG5TdXBwb3J0Q3Vyc29yU2V0VmlzaWJsZSA9IG51bGxcblxuIyBEaXNwbGF5IGN1cnNvciBpbiB2aXN1YWwtbW9kZVxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBDdXJzb3JTdHlsZU1hbmFnZXJcbiAgbGluZUhlaWdodDogbnVsbFxuXG4gIERlbGVnYXRvLmluY2x1ZGVJbnRvKHRoaXMpXG4gIEBkZWxlZ2F0ZXNQcm9wZXJ0eSgnbW9kZScsICdzdWJtb2RlJywgdG9Qcm9wZXJ0eTogJ3ZpbVN0YXRlJylcblxuICBjb25zdHJ1Y3RvcjogKEB2aW1TdGF0ZSkgLT5cbiAgICB7QGVkaXRvckVsZW1lbnQsIEBlZGl0b3J9ID0gQHZpbVN0YXRlXG4gICAgU3VwcG9ydEN1cnNvclNldFZpc2libGUgPz0gQGVkaXRvci5nZXRMYXN0Q3Vyc29yKCkuc2V0VmlzaWJsZT9cbiAgICBAZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuICAgIEBkaXNwb3NhYmxlcy5hZGQgYXRvbS5jb25maWcub2JzZXJ2ZSgnZWRpdG9yLmxpbmVIZWlnaHQnLCBAcmVmcmVzaClcbiAgICBAZGlzcG9zYWJsZXMuYWRkIGF0b20uY29uZmlnLm9ic2VydmUoJ2VkaXRvci5mb250U2l6ZScsIEByZWZyZXNoKVxuICAgIEB2aW1TdGF0ZS5vbkRpZERlc3Ryb3koQGRlc3Ryb3kpXG5cbiAgZGVzdHJveTogPT5cbiAgICBAc3R5bGVEaXNwb3NhYmxlcz8uZGlzcG9zZSgpXG4gICAgQGRpc3Bvc2FibGVzLmRpc3Bvc2UoKVxuXG4gIHVwZGF0ZUN1cnNvclN0eWxlT2xkOiAtPlxuICAgICMgV2UgbXVzdCBkaXNwb3NlIHByZXZpb3VzIHN0eWxlIG1vZGlmaWNhdGlvbiBmb3Igbm9uLXZpc3VhbC1tb2RlXG4gICAgQHN0eWxlRGlzcG9zYWJsZXM/LmRpc3Bvc2UoKVxuICAgIEBzdHlsZURpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcbiAgICByZXR1cm4gdW5sZXNzIEBtb2RlIGlzICd2aXN1YWwnXG5cbiAgICBpZiBAc3VibW9kZSBpcyAnYmxvY2t3aXNlJ1xuICAgICAgY3Vyc29yc1RvU2hvdyA9IEB2aW1TdGF0ZS5nZXRCbG9ja3dpc2VTZWxlY3Rpb25zKCkubWFwIChicykgLT4gYnMuZ2V0SGVhZFNlbGVjdGlvbigpLmN1cnNvclxuICAgIGVsc2VcbiAgICAgIGN1cnNvcnNUb1Nob3cgPSBAZWRpdG9yLmdldEN1cnNvcnMoKVxuXG4gICAgIyBJbiB2aXN1YWwtbW9kZSBvciBpbiBvY2N1cnJlbmNlIG9wZXJhdGlvbiwgY3Vyc29yIGFyZSBhZGRlZCBkdXJpbmcgb3BlcmF0aW9uIGJ1dCBzZWxlY3Rpb24gaXMgYWRkZWQgYXN5bmNocm9ub3VzbHkuXG4gICAgIyBXZSBoYXZlIHRvIG1ha2Ugc3VyZSB0aGF0IGNvcnJlc3BvbmRpbmcgY3Vyc29yJ3MgZG9tTm9kZSBpcyBhdmFpbGFibGUgYXQgdGhpcyBwb2ludCB0byBkaXJlY3RseSBtb2RpZnkgaXQncyBzdHlsZS5cbiAgICBAZWRpdG9yRWxlbWVudC5jb21wb25lbnQudXBkYXRlU3luYygpXG4gICAgZm9yIGN1cnNvciBpbiBAZWRpdG9yLmdldEN1cnNvcnMoKVxuICAgICAgY3Vyc29ySXNWaXNpYmxlID0gY3Vyc29yIGluIGN1cnNvcnNUb1Nob3dcbiAgICAgIGN1cnNvci5zZXRWaXNpYmxlKGN1cnNvcklzVmlzaWJsZSlcbiAgICAgIGlmIGN1cnNvcklzVmlzaWJsZVxuICAgICAgICBAc3R5bGVEaXNwb3NhYmxlcy5hZGQgQG1vZGlmeUN1cnNvclN0eWxlKGN1cnNvciwgQGdldEN1cnNvclN0eWxlKGN1cnNvciwgdHJ1ZSkpXG5cbiAgbW9kaWZ5Q3Vyc29yU3R5bGU6IChjdXJzb3IsIGN1cnNvclN0eWxlKSAtPlxuICAgIGN1cnNvclN0eWxlID0gQGdldEN1cnNvclN0eWxlKGN1cnNvciwgdHJ1ZSlcbiAgICAjIFtOT1RFXSBVc2luZyBub24tcHVibGljIEFQSVxuICAgIGN1cnNvck5vZGUgPSBAZWRpdG9yRWxlbWVudC5jb21wb25lbnQubGluZXNDb21wb25lbnQuY3Vyc29yc0NvbXBvbmVudC5jdXJzb3JOb2Rlc0J5SWRbY3Vyc29yLmlkXVxuICAgIGlmIGN1cnNvck5vZGVcbiAgICAgIGN1cnNvck5vZGUuc3R5bGUuc2V0UHJvcGVydHkoJ3RvcCcsIGN1cnNvclN0eWxlLnRvcClcbiAgICAgIGN1cnNvck5vZGUuc3R5bGUuc2V0UHJvcGVydHkoJ2xlZnQnLCBjdXJzb3JTdHlsZS5sZWZ0KVxuICAgICAgbmV3IERpc3Bvc2FibGUgLT5cbiAgICAgICAgY3Vyc29yTm9kZS5zdHlsZT8ucmVtb3ZlUHJvcGVydHkoJ3RvcCcpXG4gICAgICAgIGN1cnNvck5vZGUuc3R5bGU/LnJlbW92ZVByb3BlcnR5KCdsZWZ0JylcbiAgICBlbHNlXG4gICAgICBuZXcgRGlzcG9zYWJsZVxuXG4gIHVwZGF0ZUN1cnNvclN0eWxlTmV3OiAtPlxuICAgICMgV2UgbXVzdCBkaXNwb3NlIHByZXZpb3VzIHN0eWxlIG1vZGlmaWNhdGlvbiBmb3Igbm9uLXZpc3VhbC1tb2RlXG4gICAgIyBJbnRlbnRpb25hbGx5IGNvbGxlY3QgYWxsIGRlY29yYXRpb25zIGZyb20gZWRpdG9yIGluc3RlYWQgb2YgbWFuYWdpbmdcbiAgICAjIGRlY29yYXRpb25zIHdlIGNyZWF0ZWQgZXhwbGljaXRseS5cbiAgICAjIFdoeT8gd2hlbiBpbnRlcnNlY3RpbmcgbXVsdGlwbGUgc2VsZWN0aW9ucyBhcmUgYXV0by1tZXJnZWQsIGl0J3MgZ290IHdpcmVkXG4gICAgIyBzdGF0ZSB3aGVyZSBkZWNvcmF0aW9uIGNhbm5vdCBiZSBkaXNwb3NhYmxlKG5vdCBpbnZlc3RpZ2F0ZWQgd2VsbCkuXG4gICAgIyBBbmQgSSB3YW50IHRvIGFzc3VyZSBBTEwgY3Vyc29yIHN0eWxlIG1vZGlmaWNhdGlvbiBkb25lIGJ5IHZtcCBpcyBjbGVhcmVkLlxuICAgIGZvciBkZWNvcmF0aW9uIGluIEBlZGl0b3IuZ2V0RGVjb3JhdGlvbnModHlwZTogJ2N1cnNvcicsIGNsYXNzOiAndmltLW1vZGUtcGx1cycpXG4gICAgICBkZWNvcmF0aW9uLmRlc3Ryb3koKVxuXG4gICAgcmV0dXJuIHVubGVzcyBAbW9kZSBpcyAndmlzdWFsJ1xuXG4gICAgaWYgQHN1Ym1vZGUgaXMgJ2Jsb2Nrd2lzZSdcbiAgICAgIGN1cnNvcnNUb1Nob3cgPSBAdmltU3RhdGUuZ2V0QmxvY2t3aXNlU2VsZWN0aW9ucygpLm1hcCAoYnMpIC0+IGJzLmdldEhlYWRTZWxlY3Rpb24oKS5jdXJzb3JcbiAgICBlbHNlXG4gICAgICBjdXJzb3JzVG9TaG93ID0gQGVkaXRvci5nZXRDdXJzb3JzKClcblxuICAgIGZvciBjdXJzb3IgaW4gQGVkaXRvci5nZXRDdXJzb3JzKClcbiAgICAgIEBlZGl0b3IuZGVjb3JhdGVNYXJrZXIgY3Vyc29yLmdldE1hcmtlcigpLFxuICAgICAgICB0eXBlOiAnY3Vyc29yJ1xuICAgICAgICBjbGFzczogJ3ZpbS1tb2RlLXBsdXMnXG4gICAgICAgIHN0eWxlOiBAZ2V0Q3Vyc29yU3R5bGUoY3Vyc29yLCBjdXJzb3IgaW4gY3Vyc29yc1RvU2hvdylcblxuICByZWZyZXNoOiA9PlxuICAgICMgSW50ZW50aW9uYWxseSBza2lwIGluIHNwZWMgbW9kZSwgc2luY2Ugbm90IGFsbCBzcGVjIGhhdmUgRE9NIGF0dGFjaGVkKCBhbmQgZG9uJ3Qgd2FudCB0byApLlxuICAgIHJldHVybiBpZiBhdG9tLmluU3BlY01vZGUoKVxuXG4gICAgQGxpbmVIZWlnaHQgPSBAZWRpdG9yLmdldExpbmVIZWlnaHRJblBpeGVscygpXG5cbiAgICBpZiBTdXBwb3J0Q3Vyc29yU2V0VmlzaWJsZVxuICAgICAgQHVwZGF0ZUN1cnNvclN0eWxlT2xkKClcbiAgICBlbHNlXG4gICAgICBAdXBkYXRlQ3Vyc29yU3R5bGVOZXcoKVxuXG4gIGdldEN1cnNvckJ1ZmZlclBvc2l0aW9uVG9EaXNwbGF5OiAoc2VsZWN0aW9uKSAtPlxuICAgIGJ1ZmZlclBvc2l0aW9uID0gQHZpbVN0YXRlLnN3cmFwKHNlbGVjdGlvbikuZ2V0QnVmZmVyUG9zaXRpb25Gb3IoJ2hlYWQnLCBmcm9tOiBbJ3Byb3BlcnR5J10pXG4gICAgaWYgQGVkaXRvci5oYXNBdG9taWNTb2Z0VGFicygpIGFuZCBub3Qgc2VsZWN0aW9uLmlzUmV2ZXJzZWQoKVxuICAgICAgc2NyZWVuUG9zaXRpb24gPSBAZWRpdG9yLnNjcmVlblBvc2l0aW9uRm9yQnVmZmVyUG9zaXRpb24oYnVmZmVyUG9zaXRpb24udHJhbnNsYXRlKFswLCArMV0pLCBjbGlwRGlyZWN0aW9uOiAnZm9yd2FyZCcpXG4gICAgICBidWZmZXJQb3NpdGlvblRvRGlzcGxheSA9IEBlZGl0b3IuYnVmZmVyUG9zaXRpb25Gb3JTY3JlZW5Qb3NpdGlvbihzY3JlZW5Qb3NpdGlvbikudHJhbnNsYXRlKFswLCAtMV0pXG4gICAgICBpZiBidWZmZXJQb3NpdGlvblRvRGlzcGxheS5pc0dyZWF0ZXJUaGFuKGJ1ZmZlclBvc2l0aW9uKVxuICAgICAgICBidWZmZXJQb3NpdGlvbiA9IGJ1ZmZlclBvc2l0aW9uVG9EaXNwbGF5XG5cbiAgICBAZWRpdG9yLmNsaXBCdWZmZXJQb3NpdGlvbihidWZmZXJQb3NpdGlvbilcblxuICBnZXRDdXJzb3JTdHlsZTogKGN1cnNvciwgdmlzaWJsZSkgLT5cbiAgICBpZiB2aXNpYmxlXG4gICAgICBidWZmZXJQb3NpdGlvbiA9IEBnZXRDdXJzb3JCdWZmZXJQb3NpdGlvblRvRGlzcGxheShjdXJzb3Iuc2VsZWN0aW9uKVxuICAgICAgaWYgQHN1Ym1vZGUgaXMgJ2xpbmV3aXNlJyBhbmQgQGVkaXRvci5pc1NvZnRXcmFwcGVkKClcbiAgICAgICAgc2NyZWVuUG9zaXRpb24gPSBAZWRpdG9yLnNjcmVlblBvc2l0aW9uRm9yQnVmZmVyUG9zaXRpb24oYnVmZmVyUG9zaXRpb24pXG4gICAgICAgIHtyb3csIGNvbHVtbn0gPSBzY3JlZW5Qb3NpdGlvbi50cmF2ZXJzYWxGcm9tKGN1cnNvci5nZXRTY3JlZW5Qb3NpdGlvbigpKVxuICAgICAgZWxzZVxuICAgICAgICB7cm93LCBjb2x1bW59ID0gYnVmZmVyUG9zaXRpb24udHJhdmVyc2FsRnJvbShjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKSlcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdG9wOiBAbGluZUhlaWdodCAqIHJvdyArICdweCdcbiAgICAgICAgbGVmdDogY29sdW1uICsgJ2NoJ1xuICAgICAgICB2aXNpYmlsaXR5OiAndmlzaWJsZSdcbiAgICAgIH1cbiAgICBlbHNlXG4gICAgICByZXR1cm4ge3Zpc2liaWxpdHk6ICdoaWRkZW4nfVxuIl19
