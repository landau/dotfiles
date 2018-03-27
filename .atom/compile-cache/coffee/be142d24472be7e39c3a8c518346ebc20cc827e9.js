(function() {
  var CompositeDisposable, CursorStyleManager, Delegato, Disposable, Point, ref,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  ref = require('atom'), Point = ref.Point, Disposable = ref.Disposable, CompositeDisposable = ref.CompositeDisposable;

  Delegato = require('delegato');

  CursorStyleManager = (function() {
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

    CursorStyleManager.prototype.refresh = function() {
      var cursor, cursorNode, cursorNodesById, cursorsToShow, i, j, len, len1, ref1, ref2, results;
      if (atom.inSpecMode()) {
        return;
      }
      this.lineHeight = this.editor.getLineHeightInPixels();
      if ((ref1 = this.styleDisposables) != null) {
        ref1.dispose();
      }
      if (this.mode !== 'visual') {
        return;
      }
      this.styleDisposables = new CompositeDisposable;
      if (this.submode === 'blockwise') {
        cursorsToShow = this.vimState.getBlockwiseSelections().map(function(bs) {
          return bs.getHeadSelection().cursor;
        });
      } else {
        cursorsToShow = this.editor.getCursors();
      }
      ref2 = this.editor.getCursors();
      for (i = 0, len = ref2.length; i < len; i++) {
        cursor = ref2[i];
        cursor.setVisible(indexOf.call(cursorsToShow, cursor) >= 0);
      }
      this.editorElement.component.updateSync();
      cursorNodesById = this.editorElement.component.linesComponent.cursorsComponent.cursorNodesById;
      results = [];
      for (j = 0, len1 = cursorsToShow.length; j < len1; j++) {
        cursor = cursorsToShow[j];
        if (cursorNode = cursorNodesById[cursor.id]) {
          results.push(this.styleDisposables.add(this.modifyStyle(cursor, cursorNode)));
        }
      }
      return results;
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

    CursorStyleManager.prototype.modifyStyle = function(cursor, domNode) {
      var bufferPosition, column, ref1, ref2, row, screenPosition, selection, style;
      selection = cursor.selection;
      bufferPosition = this.getCursorBufferPositionToDisplay(selection);
      if (this.submode === 'linewise' && this.editor.isSoftWrapped()) {
        screenPosition = this.editor.screenPositionForBufferPosition(bufferPosition);
        ref1 = screenPosition.traversalFrom(cursor.getScreenPosition()), row = ref1.row, column = ref1.column;
      } else {
        ref2 = bufferPosition.traversalFrom(cursor.getBufferPosition()), row = ref2.row, column = ref2.column;
      }
      style = domNode.style;
      if (row) {
        style.setProperty('top', (this.lineHeight * row) + "px");
      }
      if (column) {
        style.setProperty('left', column + "ch");
      }
      return new Disposable(function() {
        style.removeProperty('top');
        return style.removeProperty('left');
      });
    };

    return CursorStyleManager;

  })();

  module.exports = CursorStyleManager;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvY3Vyc29yLXN0eWxlLW1hbmFnZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSx5RUFBQTtJQUFBOzs7RUFBQSxNQUEyQyxPQUFBLENBQVEsTUFBUixDQUEzQyxFQUFDLGlCQUFELEVBQVEsMkJBQVIsRUFBb0I7O0VBQ3BCLFFBQUEsR0FBVyxPQUFBLENBQVEsVUFBUjs7RUFJTDtpQ0FDSixVQUFBLEdBQVk7O0lBRVosUUFBUSxDQUFDLFdBQVQsQ0FBcUIsa0JBQXJCOztJQUNBLGtCQUFDLENBQUEsaUJBQUQsQ0FBbUIsTUFBbkIsRUFBMkIsU0FBM0IsRUFBc0M7TUFBQSxVQUFBLEVBQVksVUFBWjtLQUF0Qzs7SUFFYSw0QkFBQyxRQUFEO0FBQ1gsVUFBQTtNQURZLElBQUMsQ0FBQSxXQUFEOzs7TUFDWixPQUE0QixJQUFDLENBQUEsUUFBN0IsRUFBQyxJQUFDLENBQUEscUJBQUEsYUFBRixFQUFpQixJQUFDLENBQUEsY0FBQTtNQUNsQixJQUFDLENBQUEsV0FBRCxHQUFlLElBQUk7TUFDbkIsSUFBQyxDQUFBLFdBQVcsQ0FBQyxHQUFiLENBQWlCLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBWixDQUFvQixtQkFBcEIsRUFBeUMsSUFBQyxDQUFBLE9BQTFDLENBQWpCO01BQ0EsSUFBQyxDQUFBLFdBQVcsQ0FBQyxHQUFiLENBQWlCLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBWixDQUFvQixpQkFBcEIsRUFBdUMsSUFBQyxDQUFBLE9BQXhDLENBQWpCO01BQ0EsSUFBQyxDQUFBLFFBQVEsQ0FBQyxZQUFWLENBQXVCLElBQUMsQ0FBQSxPQUF4QjtJQUxXOztpQ0FPYixPQUFBLEdBQVMsU0FBQTtBQUNQLFVBQUE7O1lBQWlCLENBQUUsT0FBbkIsQ0FBQTs7YUFDQSxJQUFDLENB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TSxxQkFGUjtPQUFBLE1BQUE7UUFJRSxPQUFnQixjQUFjLENBQUMsYUFBZixDQUE2QixNQUFNLENBQUMsaUJBQVAsQ0FBQSxDQUE3QixDQUFoQixFQUFDLGNBQUQsRUFBTSxxQkFKUjs7TUFNQSxLQUFBLEdBQVEsT0FBTyxDQUFDO01BQ2hCLElBQXNELEdBQXREO1FBQUEsS0FBSyxDQUFDLFdBQU4sQ0FBa0IsS0FBbEIsRUFBMkIsQ0FBQyxJQUFDLENBQUEsVUFBRCxHQUFjLEdBQWYsQ0FBQSxHQUFtQixJQUE5QyxFQUFBOztNQUNBLElBQTRDLE1BQTVDO1FBQUEsS0FBSyxDQUFDLFdBQU4sQ0FBa0IsTUFBbEIsRUFBNkIsTUFBRCxHQUFRLElBQXBDLEVBQUE7O2FBQ0ksSUFBQSxVQUFBLENBQVcsU0FBQTtRQUNiLEtBQUssQ0FBQyxjQUFOLENBQXFCLEtBQXJCO2VBQ0EsS0FBSyxDQUFDLGNBQU4sQ0FBcUIsTUFBckI7TUFGYSxDQUFYO0lBYk87Ozs7OztFQWlCZixNQUFNLENBQUMsT0FBUCxHQUFpQjtBQTlFakIiLCJzb3VyY2VzQ29udGVudCI6WyJ7UG9pbnQsIERpc3Bvc2FibGUsIENvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSAnYXRvbSdcbkRlbGVnYXRvID0gcmVxdWlyZSAnZGVsZWdhdG8nXG5cbiMgRGlzcGxheSBjdXJzb3IgaW4gdmlzdWFsLW1vZGVcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgQ3Vyc29yU3R5bGVNYW5hZ2VyXG4gIGxpbmVIZWlnaHQ6IG51bGxcblxuICBEZWxlZ2F0by5pbmNsdWRlSW50byh0aGlzKVxuICBAZGVsZWdhdGVzUHJvcGVydHkoJ21vZGUnLCAnc3VibW9kZScsIHRvUHJvcGVydHk6ICd2aW1TdGF0ZScpXG5cbiAgY29uc3RydWN0b3I6IChAdmltU3RhdGUpIC0+XG4gICAge0BlZGl0b3JFbGVtZW50LCBAZWRpdG9yfSA9IEB2aW1TdGF0ZVxuICAgIEBkaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG4gICAgQGRpc3Bvc2FibGVzLmFkZCBhdG9tLmNvbmZpZy5vYnNlcnZlKCdlZGl0b3IubGluZUhlaWdodCcsIEByZWZyZXNoKVxuICAgIEBkaXNwb3NhYmxlcy5hZGQgYXRvbS5jb25maWcub2JzZXJ2ZSgnZWRpdG9yLmZvbnRTaXplJywgQHJlZnJlc2gpXG4gICAgQHZpbVN0YXRlLm9uRGlkRGVzdHJveShAZGVzdHJveSlcblxuICBkZXN0cm95OiA9PlxuICAgIEBzdHlsZURpc3Bvc2FibGVzPy5kaXNwb3NlKClcbiAgICBAZGlzcG9zYWJsZXMuZGlzcG9zZSgpXG5cbiAgcmVmcmVzaDogPT5cbiAgICAjIEludGVudGlvbmFsbHkgc2tpcCBpbiBzcGVjIG1vZGUsIHNpbmNlIG5vdCBhbGwgc3BlYyBoYXZlIERPTSBhdHRhY2hlZCggYW5kIGRvbid0IHdhbnQgdG8gKS5cbiAgICByZXR1cm4gaWYgYXRvbS5pblNwZWNNb2RlKClcbiAgICBAbGluZUhlaWdodCA9IEBlZGl0b3IuZ2V0TGluZUhlaWdodEluUGl4ZWxzKClcblxuICAgICMgV2UgbXVzdCBkaXNwb3NlIHByZXZpb3VzIHN0eWxlIG1vZGlmaWNhdGlvbiBmb3Igbm9uLXZpc3VhbC1tb2RlXG4gICAgQHN0eWxlRGlzcG9zYWJsZXM/LmRpc3Bvc2UoKVxuICAgIHJldHVybiB1bmxlc3MgQG1vZGUgaXMgJ3Zpc3VhbCdcblxuICAgIEBzdHlsZURpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcbiAgICBpZiBAc3VibW9kZSBpcyAnYmxvY2t3aXNlJ1xuICAgICAgY3Vyc29yc1RvU2hvdyA9IEB2aW1TdGF0ZS5nZXRCbG9ja3dpc2VTZWxlY3Rpb25zKCkubWFwIChicykgLT4gYnMuZ2V0SGVhZFNlbGVjdGlvbigpLmN1cnNvclxuICAgIGVsc2VcbiAgICAgIGN1cnNvcnNUb1Nob3cgPSBAZWRpdG9yLmdldEN1cnNvcnMoKVxuXG4gICAgIyBJbiBibG9ja3dpc2UsIHNob3cgb25seSBibG9ja3dpc2UtaGVhZCBjdXJzb3JcbiAgICBmb3IgY3Vyc29yIGluIEBlZGl0b3IuZ2V0Q3Vyc29ycygpXG4gICAgICBjdXJzb3Iuc2V0VmlzaWJsZShjdXJzb3IgaW4gY3Vyc29yc1RvU2hvdylcblxuICAgICMgRklYTUU6IGluIG9jY3VycmVuY2UsIGluIHZCLCBtdWx0aS1zZWxlY3Rpb25zIGFyZSBhZGRlZCBkdXJpbmcgb3BlcmF0aW9uIGJ1dCBzZWxlY3Rpb24gaXMgYWRkZWQgYXN5bmNocm9ub3VzbHkuXG4gICAgIyBXZSBuZWVkIHRvIG1ha2Ugc3VyZSB0aGF0IGNvcnJlc3BvbmRpbmcgY3Vyc29yJ3MgZG9tTm9kZSBpcyBhdmFpbGFibGUgdG8gbW9kaWZ5IGl0J3Mgc3R5bGUuXG4gICAgQGVkaXRvckVsZW1lbnQuY29tcG9uZW50LnVwZGF0ZVN5bmMoKVxuXG4gICAgIyBbTk9URV0gVXNpbmcgbm9uLXB1YmxpYyBBUElcbiAgICBjdXJzb3JOb2Rlc0J5SWQgPSBAZWRpdG9yRWxlbWVudC5jb21wb25lbnQubGluZXNDb21wb25lbnQuY3Vyc29yc0NvbXBvbmVudC5jdXJzb3JOb2Rlc0J5SWRcbiAgICBmb3IgY3Vyc29yIGluIGN1cnNvcnNUb1Nob3cgd2hlbiBjdXJzb3JOb2RlID0gY3Vyc29yTm9kZXNCeUlkW2N1cnNvci5pZF1cbiAgICAgIEBzdHlsZURpc3Bvc2FibGVzLmFkZCBAbW9kaWZ5U3R5bGUoY3Vyc29yLCBjdXJzb3JOb2RlKVxuXG4gIGdldEN1cnNvckJ1ZmZlclBvc2l0aW9uVG9EaXNwbGF5OiAoc2VsZWN0aW9uKSAtPlxuICAgIGJ1ZmZlclBvc2l0aW9uID0gQHZpbVN0YXRlLnN3cmFwKHNlbGVjdGlvbikuZ2V0QnVmZmVyUG9zaXRpb25Gb3IoJ2hlYWQnLCBmcm9tOiBbJ3Byb3BlcnR5J10pXG4gICAgaWYgQGVkaXRvci5oYXNBdG9taWNTb2Z0VGFicygpIGFuZCBub3Qgc2VsZWN0aW9uLmlzUmV2ZXJzZWQoKVxuICAgICAgc2NyZWVuUG9zaXRpb24gPSBAZWRpdG9yLnNjcmVlblBvc2l0aW9uRm9yQnVmZmVyUG9zaXRpb24oYnVmZmVyUG9zaXRpb24udHJhbnNsYXRlKFswLCArMV0pLCBjbGlwRGlyZWN0aW9uOiAnZm9yd2FyZCcpXG4gICAgICBidWZmZXJQb3NpdGlvblRvRGlzcGxheSA9IEBlZGl0b3IuYnVmZmVyUG9zaXRpb25Gb3JTY3JlZW5Qb3NpdGlvbihzY3JlZW5Qb3NpdGlvbikudHJhbnNsYXRlKFswLCAtMV0pXG4gICAgICBpZiBidWZmZXJQb3NpdGlvblRvRGlzcGxheS5pc0dyZWF0ZXJUaGFuKGJ1ZmZlclBvc2l0aW9uKVxuICAgICAgICBidWZmZXJQb3NpdGlvbiA9IGJ1ZmZlclBvc2l0aW9uVG9EaXNwbGF5XG5cbiAgICBAZWRpdG9yLmNsaXBCdWZmZXJQb3NpdGlvbihidWZmZXJQb3NpdGlvbilcblxuICAjIEFwcGx5IHNlbGVjdGlvbiBwcm9wZXJ0eSdzIHRyYXZlcnNhbCBmcm9tIGFjdHVhbCBjdXJzb3IgdG8gY3Vyc29yTm9kZSdzIHN0eWxlXG4gIG1vZGlmeVN0eWxlOiAoY3Vyc29yLCBkb21Ob2RlKSAtPlxuICAgIHNlbGVjdGlvbiA9IGN1cnNvci5zZWxlY3Rpb25cbiAgICBidWZmZXJQb3NpdGlvbiA9IEBnZXRDdXJzb3JCdWZmZXJQb3NpdGlvblRvRGlzcGxheShzZWxlY3Rpb24pXG5cbiAgICBpZiBAc3VibW9kZSBpcyAnbGluZXdpc2UnIGFuZCBAZWRpdG9yLmlzU29mdFdyYXBwZWQoKVxuICAgICAgc2NyZWVuUG9zaXRpb24gPSBAZWRpdG9yLnNjcmVlblBvc2l0aW9uRm9yQnVmZmVyUG9zaXRpb24oYnVmZmVyUG9zaXRpb24pXG4gICAgICB7cm93LCBjb2x1bW59ID0gc2NyZWVuUG9zaXRpb24udHJhdmVyc2FsRnJvbShjdXJzb3IuZ2V0U2NyZWVuUG9zaXRpb24oKSlcbiAgICBlbHNlXG4gICAgICB7cm93LCBjb2x1bW59ID0gYnVmZmVyUG9zaXRpb24udHJhdmVyc2FsRnJvbShjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKSlcblxuICAgIHN0eWxlID0gZG9tTm9kZS5zdHlsZVxuICAgIHN0eWxlLnNldFByb3BlcnR5KCd0b3AnLCBcIiN7QGxpbmVIZWlnaHQgKiByb3d9cHhcIikgaWYgcm93XG4gICAgc3R5bGUuc2V0UHJvcGVydHkoJ2xlZnQnLCBcIiN7Y29sdW1ufWNoXCIpIGlmIGNvbHVtblxuICAgIG5ldyBEaXNwb3NhYmxlIC0+XG4gICAgICBzdHlsZS5yZW1vdmVQcm9wZXJ0eSgndG9wJylcbiAgICAgIHN0eWxlLnJlbW92ZVByb3BlcnR5KCdsZWZ0JylcblxubW9kdWxlLmV4cG9ydHMgPSBDdXJzb3JTdHlsZU1hbmFnZXJcbiJdfQ==
