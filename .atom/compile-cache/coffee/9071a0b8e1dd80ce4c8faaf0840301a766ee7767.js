(function() {
  var CompositeDisposable, CursorStyleManager, Delegato, Disposable, Point, ref, swrap,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  ref = require('atom'), Point = ref.Point, Disposable = ref.Disposable, CompositeDisposable = ref.CompositeDisposable;

  Delegato = require('delegato');

  swrap = require('./selection-wrapper');

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
      ref1 = this.vimState, this.editorElement = ref1.editorElement, this.editor = ref1.editor;
      this.subscriptions = new CompositeDisposable;
      this.subscriptions.add(atom.config.observe('editor.lineHeight', this.refresh));
      this.subscriptions.add(atom.config.observe('editor.fontSize', this.refresh));
    }

    CursorStyleManager.prototype.destroy = function() {
      var ref1;
      if ((ref1 = this.styleDisposables) != null) {
        ref1.dispose();
      }
      return this.subscriptions.dispose();
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
      if (!(this.mode === 'visual' && this.vimState.getConfig('showCursorInVisualMode'))) {
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
      bufferPosition = swrap(selection).getBufferPositionFor('head', {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvY3Vyc29yLXN0eWxlLW1hbmFnZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSxnRkFBQTtJQUFBOzs7RUFBQSxNQUEyQyxPQUFBLENBQVEsTUFBUixDQUEzQyxFQUFDLGlCQUFELEVBQVEsMkJBQVIsRUFBb0I7O0VBQ3BCLFFBQUEsR0FBVyxPQUFBLENBQVEsVUFBUjs7RUFDWCxLQUFBLEdBQVEsT0FBQSxDQUFRLHFCQUFSOztFQUlGO2lDQUNKLFVBQUEsR0FBWTs7SUFFWixRQUFRLENBQUMsV0FBVCxDQUFxQixrQkFBckI7O0lBQ0Esa0JBQUMsQ0FBQSxpQkFBRCxDQUFtQixNQUFuQixFQUEyQixTQUEzQixFQUFzQztNQUFBLFVBQUEsRUFBWSxVQUFaO0tBQXRDOztJQUVhLDRCQUFDLFFBQUQ7QUFDWCxVQUFBO01BRFksSUFBQyxDQUFBLFdBQUQ7O01BQ1osT0FBNEIsSUFBQyxDQUFBLFFBQTdCLEVBQUMsSUFBQyxDQUFBLHFCQUFBLGFBQUYsRUFBaUIsSUFBQyxDQUFBLGNBQUE7TUFDbEIsSUFBQyxDQUFBLGFBQUQsR0FBaUIsSUFBSTtNQUNyQixJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFaLENBQW9CLG1CQUFwQixFQUF5QyxJQUFDLENBQUEsT0FBMUMsQ0FBbkI7TUFDQSxJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFaLENBQW9CLGlCQUFwQixFQUF1QyxJQUFDLENBQUEsT0FBeEMsQ0FBbkI7SUFKVzs7aUNBTWIsT0FBQSxHQUFTLFNBQUE7QUFDUCxVQUFBOztZQUFpQixDQUFFLE9BQW5CLENBQUE7O2FBQ0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxPQUFmLENB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N0IsQ0FBaEIsRUFBQyxjQUFELEVBQU0scUJBRlI7T0FBQSxNQUFBO1FBSUUsT0FBZ0IsY0FBYyxDQUFDLGFBQWYsQ0FBNkIsTUFBTSxDQUFDLGlCQUFQLENBQUEsQ0FBN0IsQ0FBaEIsRUFBQyxjQUFELEVBQU0scUJBSlI7O01BTUEsS0FBQSxHQUFRLE9BQU8sQ0FBQztNQUNoQixJQUFzRCxHQUF0RDtRQUFBLEtBQUssQ0FBQyxXQUFOLENBQWtCLEtBQWxCLEVBQTJCLENBQUMsSUFBQyxDQUFBLFVBQUQsR0FBYyxHQUFmLENBQUEsR0FBbUIsSUFBOUMsRUFBQTs7TUFDQSxJQUE0QyxNQUE1QztRQUFBLEtBQUssQ0FBQyxXQUFOLENBQWtCLE1BQWxCLEVBQTZCLE1BQUQsR0FBUSxJQUFwQyxFQUFBOzthQUNJLElBQUEsVUFBQSxDQUFXLFNBQUE7UUFDYixLQUFLLENBQUMsY0FBTixDQUFxQixLQUFyQjtlQUNBLEtBQUssQ0FBQyxjQUFOLENBQXFCLE1BQXJCO01BRmEsQ0FBWDtJQWJPOzs7Ozs7RUFpQmYsTUFBTSxDQUFDLE9BQVAsR0FBaUI7QUE5RWpCIiwic291cmNlc0NvbnRlbnQiOlsie1BvaW50LCBEaXNwb3NhYmxlLCBDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2F0b20nXG5EZWxlZ2F0byA9IHJlcXVpcmUgJ2RlbGVnYXRvJ1xuc3dyYXAgPSByZXF1aXJlICcuL3NlbGVjdGlvbi13cmFwcGVyJ1xuXG4jIERpc3BsYXkgY3Vyc29yIGluIHZpc3VhbC1tb2RlXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIEN1cnNvclN0eWxlTWFuYWdlclxuICBsaW5lSGVpZ2h0OiBudWxsXG5cbiAgRGVsZWdhdG8uaW5jbHVkZUludG8odGhpcylcbiAgQGRlbGVnYXRlc1Byb3BlcnR5KCdtb2RlJywgJ3N1Ym1vZGUnLCB0b1Byb3BlcnR5OiAndmltU3RhdGUnKVxuXG4gIGNvbnN0cnVjdG9yOiAoQHZpbVN0YXRlKSAtPlxuICAgIHtAZWRpdG9yRWxlbWVudCwgQGVkaXRvcn0gPSBAdmltU3RhdGVcbiAgICBAc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29uZmlnLm9ic2VydmUoJ2VkaXRvci5saW5lSGVpZ2h0JywgQHJlZnJlc2gpXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29uZmlnLm9ic2VydmUoJ2VkaXRvci5mb250U2l6ZScsIEByZWZyZXNoKVxuXG4gIGRlc3Ryb3k6IC0+XG4gICAgQHN0eWxlRGlzcG9zYWJsZXM/LmRpc3Bvc2UoKVxuICAgIEBzdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuXG4gIHJlZnJlc2g6ID0+XG4gICAgIyBJbnRlbnRpb25hbGx5IHNraXAgaW4gc3BlYyBtb2RlLCBzaW5jZSBub3QgYWxsIHNwZWMgaGF2ZSBET00gYXR0YWNoZWQoIGFuZCBkb24ndCB3YW50IHRvICkuXG4gICAgcmV0dXJuIGlmIGF0b20uaW5TcGVjTW9kZSgpXG4gICAgQGxpbmVIZWlnaHQgPSBAZWRpdG9yLmdldExpbmVIZWlnaHRJblBpeGVscygpXG5cbiAgICAjIFdlIG11c3QgZGlzcG9zZSBwcmV2aW91cyBzdHlsZSBtb2RpZmljYXRpb24gZm9yIG5vbi12aXN1YWwtbW9kZVxuICAgIEBzdHlsZURpc3Bvc2FibGVzPy5kaXNwb3NlKClcbiAgICByZXR1cm4gdW5sZXNzIChAbW9kZSBpcyAndmlzdWFsJyBhbmQgQHZpbVN0YXRlLmdldENvbmZpZygnc2hvd0N1cnNvckluVmlzdWFsTW9kZScpKVxuXG4gICAgQHN0eWxlRGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuICAgIGlmIEBzdWJtb2RlIGlzICdibG9ja3dpc2UnXG4gICAgICBjdXJzb3JzVG9TaG93ID0gQHZpbVN0YXRlLmdldEJsb2Nrd2lzZVNlbGVjdGlvbnMoKS5tYXAgKGJzKSAtPiBicy5nZXRIZWFkU2VsZWN0aW9uKCkuY3Vyc29yXG4gICAgZWxzZVxuICAgICAgY3Vyc29yc1RvU2hvdyA9IEBlZGl0b3IuZ2V0Q3Vyc29ycygpXG5cbiAgICAjIEluIGJsb2Nrd2lzZSwgc2hvdyBvbmx5IGJsb2Nrd2lzZS1oZWFkIGN1cnNvclxuICAgIGZvciBjdXJzb3IgaW4gQGVkaXRvci5nZXRDdXJzb3JzKClcbiAgICAgIGN1cnNvci5zZXRWaXNpYmxlKGN1cnNvciBpbiBjdXJzb3JzVG9TaG93KVxuXG4gICAgIyBGSVhNRTogaW4gb2NjdXJyZW5jZSwgaW4gdkIsIG11bHRpLXNlbGVjdGlvbnMgYXJlIGFkZGVkIGR1cmluZyBvcGVyYXRpb24gYnV0IHNlbGVjdGlvbiBpcyBhZGRlZCBhc3luY2hyb25vdXNseS5cbiAgICAjIFdlIG5lZWQgdG8gbWFrZSBzdXJlIHRoYXQgY29ycmVzcG9uZGluZyBjdXJzb3IncyBkb21Ob2RlIGlzIGF2YWlsYWJsZSB0byBtb2RpZnkgaXQncyBzdHlsZS5cbiAgICBAZWRpdG9yRWxlbWVudC5jb21wb25lbnQudXBkYXRlU3luYygpXG5cbiAgICAjIFtOT1RFXSBVc2luZyBub24tcHVibGljIEFQSVxuICAgIGN1cnNvck5vZGVzQnlJZCA9IEBlZGl0b3JFbGVtZW50LmNvbXBvbmVudC5saW5lc0NvbXBvbmVudC5jdXJzb3JzQ29tcG9uZW50LmN1cnNvck5vZGVzQnlJZFxuICAgIGZvciBjdXJzb3IgaW4gY3Vyc29yc1RvU2hvdyB3aGVuIGN1cnNvck5vZGUgPSBjdXJzb3JOb2Rlc0J5SWRbY3Vyc29yLmlkXVxuICAgICAgQHN0eWxlRGlzcG9zYWJsZXMuYWRkIEBtb2RpZnlTdHlsZShjdXJzb3IsIGN1cnNvck5vZGUpXG5cbiAgZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb25Ub0Rpc3BsYXk6IChzZWxlY3Rpb24pIC0+XG4gICAgYnVmZmVyUG9zaXRpb24gPSBzd3JhcChzZWxlY3Rpb24pLmdldEJ1ZmZlclBvc2l0aW9uRm9yKCdoZWFkJywgZnJvbTogWydwcm9wZXJ0eSddKVxuICAgIGlmIEBlZGl0b3IuaGFzQXRvbWljU29mdFRhYnMoKSBhbmQgbm90IHNlbGVjdGlvbi5pc1JldmVyc2VkKClcbiAgICAgIHNjcmVlblBvc2l0aW9uID0gQGVkaXRvci5zY3JlZW5Qb3NpdGlvbkZvckJ1ZmZlclBvc2l0aW9uKGJ1ZmZlclBvc2l0aW9uLnRyYW5zbGF0ZShbMCwgKzFdKSwgY2xpcERpcmVjdGlvbjogJ2ZvcndhcmQnKVxuICAgICAgYnVmZmVyUG9zaXRpb25Ub0Rpc3BsYXkgPSBAZWRpdG9yLmJ1ZmZlclBvc2l0aW9uRm9yU2NyZWVuUG9zaXRpb24oc2NyZWVuUG9zaXRpb24pLnRyYW5zbGF0ZShbMCwgLTFdKVxuICAgICAgaWYgYnVmZmVyUG9zaXRpb25Ub0Rpc3BsYXkuaXNHcmVhdGVyVGhhbihidWZmZXJQb3NpdGlvbilcbiAgICAgICAgYnVmZmVyUG9zaXRpb24gPSBidWZmZXJQb3NpdGlvblRvRGlzcGxheVxuXG4gICAgQGVkaXRvci5jbGlwQnVmZmVyUG9zaXRpb24oYnVmZmVyUG9zaXRpb24pXG5cbiAgIyBBcHBseSBzZWxlY3Rpb24gcHJvcGVydHkncyB0cmF2ZXJzYWwgZnJvbSBhY3R1YWwgY3Vyc29yIHRvIGN1cnNvck5vZGUncyBzdHlsZVxuICBtb2RpZnlTdHlsZTogKGN1cnNvciwgZG9tTm9kZSkgLT5cbiAgICBzZWxlY3Rpb24gPSBjdXJzb3Iuc2VsZWN0aW9uXG4gICAgYnVmZmVyUG9zaXRpb24gPSBAZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb25Ub0Rpc3BsYXkoc2VsZWN0aW9uKVxuXG4gICAgaWYgQHN1Ym1vZGUgaXMgJ2xpbmV3aXNlJyBhbmQgQGVkaXRvci5pc1NvZnRXcmFwcGVkKClcbiAgICAgIHNjcmVlblBvc2l0aW9uID0gQGVkaXRvci5zY3JlZW5Qb3NpdGlvbkZvckJ1ZmZlclBvc2l0aW9uKGJ1ZmZlclBvc2l0aW9uKVxuICAgICAge3JvdywgY29sdW1ufSA9IHNjcmVlblBvc2l0aW9uLnRyYXZlcnNhbEZyb20oY3Vyc29yLmdldFNjcmVlblBvc2l0aW9uKCkpXG4gICAgZWxzZVxuICAgICAge3JvdywgY29sdW1ufSA9IGJ1ZmZlclBvc2l0aW9uLnRyYXZlcnNhbEZyb20oY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKCkpXG5cbiAgICBzdHlsZSA9IGRvbU5vZGUuc3R5bGVcbiAgICBzdHlsZS5zZXRQcm9wZXJ0eSgndG9wJywgXCIje0BsaW5lSGVpZ2h0ICogcm93fXB4XCIpIGlmIHJvd1xuICAgIHN0eWxlLnNldFByb3BlcnR5KCdsZWZ0JywgXCIje2NvbHVtbn1jaFwiKSBpZiBjb2x1bW5cbiAgICBuZXcgRGlzcG9zYWJsZSAtPlxuICAgICAgc3R5bGUucmVtb3ZlUHJvcGVydHkoJ3RvcCcpXG4gICAgICBzdHlsZS5yZW1vdmVQcm9wZXJ0eSgnbGVmdCcpXG5cbm1vZHVsZS5leHBvcnRzID0gQ3Vyc29yU3R5bGVNYW5hZ2VyXG4iXX0=
