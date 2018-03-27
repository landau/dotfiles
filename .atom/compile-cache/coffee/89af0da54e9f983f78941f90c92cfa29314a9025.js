(function() {
  var CompositeDisposable, CursorStyleManager, Disposable, Point, getCursorNode, getOffset, isSpecMode, lineHeight, ref, setStyle, swrap,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  ref = require('atom'), Point = ref.Point, Disposable = ref.Disposable, CompositeDisposable = ref.CompositeDisposable;

  swrap = require('./selection-wrapper');

  isSpecMode = atom.inSpecMode();

  lineHeight = null;

  getCursorNode = function(editorElement, cursor) {
    var cursorsComponent;
    cursorsComponent = editorElement.component.linesComponent.cursorsComponent;
    return cursorsComponent.cursorNodesById[cursor.id];
  };

  getOffset = function(submode, cursor) {
    var bufferPoint, editor, offset, screenPoint, selection;
    selection = cursor.selection;
    switch (submode) {
      case 'characterwise':
        if (selection.isReversed()) {
          return;
        }
        if (cursor.isAtBeginningOfLine()) {
          return new Point(-1, 0);
        } else {
          return new Point(0, -1);
        }
        break;
      case 'blockwise':
        if (cursor.isAtBeginningOfLine() || selection.isReversed()) {
          return;
        }
        return new Point(0, -1);
      case 'linewise':
        bufferPoint = swrap(selection).getBufferPositionFor('head', {
          from: ['property']
        });
        editor = cursor.editor;
        if (editor.isSoftWrapped()) {
          screenPoint = editor.screenPositionForBufferPosition(bufferPoint);
          offset = screenPoint.traversalFrom(cursor.getScreenPosition());
        } else {
          offset = bufferPoint.traversalFrom(cursor.getBufferPosition());
        }
        if (!selection.isReversed() && cursor.isAtBeginningOfLine()) {
          offset.row = -1;
        }
        return offset;
    }
  };

  setStyle = function(style, arg) {
    var column, row;
    row = arg.row, column = arg.column;
    if (row !== 0) {
      style.setProperty('top', (row * lineHeight) + "em");
    }
    if (column !== 0) {
      style.setProperty('left', column + "ch");
    }
    return new Disposable(function() {
      style.removeProperty('top');
      return style.removeProperty('left');
    });
  };

  CursorStyleManager = (function() {
    function CursorStyleManager(vimState) {
      var ref1;
      this.vimState = vimState;
      ref1 = this.vimState, this.editorElement = ref1.editorElement, this.editor = ref1.editor;
      this.lineHeightObserver = atom.config.observe('editor.lineHeight', (function(_this) {
        return function(newValue) {
          lineHeight = newValue;
          return _this.refresh();
        };
      })(this));
    }

    CursorStyleManager.prototype.destroy = function() {
      var ref1, ref2;
      if ((ref1 = this.styleDisporser) != null) {
        ref1.dispose();
      }
      this.lineHeightObserver.dispose();
      return ref2 = {}, this.styleDisporser = ref2.styleDisporser, this.lineHeightObserver = ref2.lineHeightObserver, ref2;
    };

    CursorStyleManager.prototype.refresh = function() {
      var cursor, cursorNode, cursors, cursorsToShow, i, j, len, len1, mode, offset, ref1, ref2, results, submode;
      ref1 = this.vimState, mode = ref1.mode, submode = ref1.submode;
      if ((ref2 = this.styleDisporser) != null) {
        ref2.dispose();
      }
      this.styleDisporser = new CompositeDisposable;
      if (!(mode === 'visual' && this.vimState.getConfig('showCursorInVisualMode'))) {
        return;
      }
      cursors = cursorsToShow = this.editor.getCursors();
      if (submode === 'blockwise') {
        cursorsToShow = this.vimState.getBlockwiseSelections().map(function(bs) {
          return bs.getHeadSelection().cursor;
        });
      }
      for (i = 0, len = cursors.length; i < len; i++) {
        cursor = cursors[i];
        if (indexOf.call(cursorsToShow, cursor) >= 0) {
          if (!cursor.isVisible()) {
            cursor.setVisible(true);
          }
        } else {
          if (cursor.isVisible()) {
            cursor.setVisible(false);
          }
        }
      }
      if (isSpecMode) {
        return;
      }
      this.editorElement.component.updateSync();
      results = [];
      for (j = 0, len1 = cursorsToShow.length; j < len1; j++) {
        cursor = cursorsToShow[j];
        if (offset = getOffset(submode, cursor)) {
          if (cursorNode = getCursorNode(this.editorElement, cursor)) {
            results.push(this.styleDisporser.add(setStyle(cursorNode.style, offset)));
          } else {
            results.push(void 0);
          }
        }
      }
      return results;
    };

    return CursorStyleManager;

  })();

  module.exports = CursorStyleManager;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvY3Vyc29yLXN0eWxlLW1hbmFnZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSxrSUFBQTtJQUFBOztFQUFBLE1BQTJDLE9BQUEsQ0FBUSxNQUFSLENBQTNDLEVBQUMsaUJBQUQsRUFBUSwyQkFBUixFQUFvQjs7RUFFcEIsS0FBQSxHQUFRLE9BQUEsQ0FBUSxxQkFBUjs7RUFDUixVQUFBLEdBQWEsSUFBSSxDQUFDLFVBQUwsQ0FBQTs7RUFDYixVQUFBLEdBQWE7O0VBRWIsYUFBQSxHQUFnQixTQUFDLGFBQUQsRUFBZ0IsTUFBaEI7QUFDZCxRQUFBO0lBQUEsZ0JBQUEsR0FBbUIsYUFBYSxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUM7V0FDMUQsZ0JBQWdCLENBQUMsZUFBZ0IsQ0FBQSxNQUFNLENBQUMsRUFBUDtFQUZuQjs7RUFNaEIsU0FBQSxHQUFZLFNBQUMsT0FBRCxFQUFVLE1BQVY7QUFDVixRQUFBO0lBQUMsWUFBYTtBQUNkLFlBQU8sT0FBUDtBQUFBLFdBQ08sZUFEUDtRQUVJLElBQVUsU0FBUyxDQUFDLFVBQVYsQ0FBQSxDQUFWO0FBQUEsaUJBQUE7O1FBQ0EsSUFBRyxNQUFNLENBQUMsbUJBQVAsQ0FBQSxDQUFIO2lCQUNNLElBQUEsS0FBQSxDQUFNLENBQUMsQ0FBUCxFQUFVLENBQVYsRUFETjtTQUFBLE1BQUE7aUJBR00sSUFBQSxLQUFBLENBQU0sQ0FBTixFQUFTLENBQUMsQ0FBVixFQUhOOztBQUZHO0FBRFAsV0FRTyxXQVJQO1FBU0ksSUFBVSxNQUFNLENBQUMsbUJBQVAsQ0FBQSxDQUFBLElBQWdDLFNBQVMsQ0FBQyxVQUFWLENBQUEsQ0FBMUM7QUFBQSxpQkFBQTs7ZUFDSSxJQUFBLEtBQUEsQ0FBTSxDQUFOLEVBQVMsQ0FBQyxDQUFWO0FBVlIsV0FZ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Q0UsSUFBRyxhQUFVLGFBQVYsRUFBQSxNQUFBLE1BQUg7VUFDRSxJQUFBLENBQStCLE1BQU0sQ0FBQyxTQUFQLENBQUEsQ0FBL0I7WUFBQSxNQUFNLENBQUMsVUFBUCxDQUFrQixJQUFsQixFQUFBO1dBREY7U0FBQSxNQUFBO1VBR0UsSUFBNEIsTUFBTSxDQUFDLFNBQVAsQ0FBQSxDQUE1QjtZQUFBLE1BQU0sQ0FBQyxVQUFQLENBQWtCLEtBQWxCLEVBQUE7V0FIRjs7QUFERjtNQU9BLElBQVUsVUFBVjtBQUFBLGVBQUE7O01BU0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxTQUFTLENBQUMsVUFBekIsQ0FBQTtBQUVBO1dBQUEsaURBQUE7O1lBQWlDLE1BQUEsR0FBUyxTQUFBLENBQVUsT0FBVixFQUFtQixNQUFuQjtVQUN4QyxJQUFHLFVBQUEsR0FBYSxhQUFBLENBQWMsSUFBQyxDQUFBLGFBQWYsRUFBOEIsTUFBOUIsQ0FBaEI7eUJBQ0UsSUFBQyxDQUFBLGNBQWMsQ0FBQyxHQUFoQixDQUFvQixRQUFBLENBQVMsVUFBVSxDQUFDLEtBQXBCLEVBQTJCLE1BQTNCLENBQXBCLEdBREY7V0FBQSxNQUFBO2lDQUFBOzs7QUFERjs7SUE3Qk87Ozs7OztFQWlDWCxNQUFNLENBQUMsT0FBUCxHQUFpQjtBQTdGakIiLCJzb3VyY2VzQ29udGVudCI6WyJ7UG9pbnQsIERpc3Bvc2FibGUsIENvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSAnYXRvbSdcblxuc3dyYXAgPSByZXF1aXJlICcuL3NlbGVjdGlvbi13cmFwcGVyJ1xuaXNTcGVjTW9kZSA9IGF0b20uaW5TcGVjTW9kZSgpXG5saW5lSGVpZ2h0ID0gbnVsbFxuXG5nZXRDdXJzb3JOb2RlID0gKGVkaXRvckVsZW1lbnQsIGN1cnNvcikgLT5cbiAgY3Vyc29yc0NvbXBvbmVudCA9IGVkaXRvckVsZW1lbnQuY29tcG9uZW50LmxpbmVzQ29tcG9uZW50LmN1cnNvcnNDb21wb25lbnRcbiAgY3Vyc29yc0NvbXBvbmVudC5jdXJzb3JOb2Rlc0J5SWRbY3Vyc29yLmlkXVxuXG4jIFJldHVybiBjdXJzb3Igc3R5bGUgb2Zmc2V0KHRvcCwgbGVmdClcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5nZXRPZmZzZXQgPSAoc3VibW9kZSwgY3Vyc29yKSAtPlxuICB7c2VsZWN0aW9ufSA9IGN1cnNvclxuICBzd2l0Y2ggc3VibW9kZVxuICAgIHdoZW4gJ2NoYXJhY3Rlcndpc2UnXG4gICAgICByZXR1cm4gaWYgc2VsZWN0aW9uLmlzUmV2ZXJzZWQoKVxuICAgICAgaWYgY3Vyc29yLmlzQXRCZWdpbm5pbmdPZkxpbmUoKVxuICAgICAgICBuZXcgUG9pbnQoLTEsIDApXG4gICAgICBlbHNlXG4gICAgICAgIG5ldyBQb2ludCgwLCAtMSlcblxuICAgIHdoZW4gJ2Jsb2Nrd2lzZSdcbiAgICAgIHJldHVybiBpZiBjdXJzb3IuaXNBdEJlZ2lubmluZ09mTGluZSgpIG9yIHNlbGVjdGlvbi5pc1JldmVyc2VkKClcbiAgICAgIG5ldyBQb2ludCgwLCAtMSlcblxuICAgIHdoZW4gJ2xpbmV3aXNlJ1xuICAgICAgYnVmZmVyUG9pbnQgPSBzd3JhcChzZWxlY3Rpb24pLmdldEJ1ZmZlclBvc2l0aW9uRm9yKCdoZWFkJywgZnJvbTogWydwcm9wZXJ0eSddKVxuICAgICAgZWRpdG9yID0gY3Vyc29yLmVkaXRvclxuXG4gICAgICBpZiBlZGl0b3IuaXNTb2Z0V3JhcHBlZCgpXG4gICAgICAgIHNjcmVlblBvaW50ID0gZWRpdG9yLnNjcmVlblBvc2l0aW9uRm9yQnVmZmVyUG9zaXRpb24oYnVmZmVyUG9pbnQpXG4gICAgICAgIG9mZnNldCA9IHNjcmVlblBvaW50LnRyYXZlcnNhbEZyb20oY3Vyc29yLmdldFNjcmVlblBvc2l0aW9uKCkpXG4gICAgICBlbHNlXG4gICAgICAgIG9mZnNldCA9IGJ1ZmZlclBvaW50LnRyYXZlcnNhbEZyb20oY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKCkpXG4gICAgICBpZiBub3Qgc2VsZWN0aW9uLmlzUmV2ZXJzZWQoKSBhbmQgY3Vyc29yLmlzQXRCZWdpbm5pbmdPZkxpbmUoKVxuICAgICAgICBvZmZzZXQucm93ID0gLTFcbiAgICAgIG9mZnNldFxuXG5zZXRTdHlsZSA9IChzdHlsZSwge3JvdywgY29sdW1ufSkgLT5cbiAgc3R5bGUuc2V0UHJvcGVydHkoJ3RvcCcsIFwiI3tyb3cgKiBsaW5lSGVpZ2h0fWVtXCIpIHVubGVzcyByb3cgaXMgMFxuICBzdHlsZS5zZXRQcm9wZXJ0eSgnbGVmdCcsIFwiI3tjb2x1bW59Y2hcIikgdW5sZXNzIGNvbHVtbiBpcyAwXG4gIG5ldyBEaXNwb3NhYmxlIC0+XG4gICAgc3R5bGUucmVtb3ZlUHJvcGVydHkoJ3RvcCcpXG4gICAgc3R5bGUucmVtb3ZlUHJvcGVydHkoJ2xlZnQnKVxuXG4jIERpc3BsYXkgY3Vyc29yIGluIHZpc3VhbCBtb2RlLlxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBDdXJzb3JTdHlsZU1hbmFnZXJcbiAgY29uc3RydWN0b3I6IChAdmltU3RhdGUpIC0+XG4gICAge0BlZGl0b3JFbGVtZW50LCBAZWRpdG9yfSA9IEB2aW1TdGF0ZVxuICAgIEBsaW5lSGVpZ2h0T2JzZXJ2ZXIgPSBhdG9tLmNvbmZpZy5vYnNlcnZlICdlZGl0b3IubGluZUhlaWdodCcsIChuZXdWYWx1ZSkgPT5cbiAgICAgIGxpbmVIZWlnaHQgPSBuZXdWYWx1ZVxuICAgICAgQHJlZnJlc2goKVxuXG4gIGRlc3Ryb3k6IC0+XG4gICAgQHN0eWxlRGlzcG9yc2VyPy5kaXNwb3NlKClcbiAgICBAbGluZUhlaWdodE9ic2VydmVyLmRpc3Bvc2UoKVxuICAgIHtAc3R5bGVEaXNwb3JzZXIsIEBsaW5lSGVpZ2h0T2JzZXJ2ZXJ9ID0ge31cblxuICByZWZyZXNoOiAtPlxuICAgIHttb2RlLCBzdWJtb2RlfSA9IEB2aW1TdGF0ZVxuICAgIEBzdHlsZURpc3BvcnNlcj8uZGlzcG9zZSgpXG4gICAgQHN0eWxlRGlzcG9yc2VyID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcbiAgICByZXR1cm4gdW5sZXNzIG1vZGUgaXMgJ3Zpc3VhbCcgYW5kIEB2aW1TdGF0ZS5nZXRDb25maWcoJ3Nob3dDdXJzb3JJblZpc3VhbE1vZGUnKVxuXG4gICAgY3Vyc29ycyA9IGN1cnNvcnNUb1Nob3cgPSBAZWRpdG9yLmdldEN1cnNvcnMoKVxuICAgIGlmIHN1Ym1vZGUgaXMgJ2Jsb2Nrd2lzZSdcbiAgICAgIGN1cnNvcnNUb1Nob3cgPSBAdmltU3RhdGUuZ2V0QmxvY2t3aXNlU2VsZWN0aW9ucygpLm1hcCAoYnMpIC0+IGJzLmdldEhlYWRTZWxlY3Rpb24oKS5jdXJzb3JcblxuICAgICMgdXBkYXRlIHZpc2liaWxpdHlcbiAgICBmb3IgY3Vyc29yIGluIGN1cnNvcnNcbiAgICAgIGlmIGN1cnNvciBpbiBjdXJzb3JzVG9TaG93XG4gICAgICAgIGN1cnNvci5zZXRWaXNpYmxlKHRydWUpIHVubGVzcyBjdXJzb3IuaXNWaXNpYmxlKClcbiAgICAgIGVsc2VcbiAgICAgICAgY3Vyc29yLnNldFZpc2libGUoZmFsc2UpIGlmIGN1cnNvci5pc1Zpc2libGUoKVxuXG4gICAgIyBbRklYTUVdIEluIHNwZWMgbW9kZSwgd2Ugc2tpcCBoZXJlIHNpbmNlIG5vdCBhbGwgc3BlYyBoYXZlIGRvbSBhdHRhY2hlZC5cbiAgICByZXR1cm4gaWYgaXNTcGVjTW9kZVxuXG4gICAgIyBbTk9URV0gSW4gQmxvY2t3aXNlU2VsZWN0IHdlIGFkZCBzZWxlY3Rpb25zKGFuZCBjb3JyZXNwb25kaW5nIGN1cnNvcnMpIGluIGJsdWsuXG4gICAgIyBCdXQgY29ycmVzcG9uZGluZyBjdXJzb3JzQ29tcG9uZW50KEhUTUwgZWxlbWVudCkgaXMgYWRkZWQgaW4gc3luYy5cbiAgICAjIFNvIHRvIG1vZGlmeSBzdHlsZSBvZiBjdXJzb3JzQ29tcG9uZW50LCB3ZSBoYXZlIHRvIG1ha2Ugc3VyZSBjb3JyZXNwb25kaW5nIGN1cnNvcnNDb21wb25lbnRcbiAgICAjIGlzIGF2YWlsYWJsZSBieSBjb21wb25lbnQgaW4gc3luYyB0byBtb2RlbC5cbiAgICAjIFtGSVhNRV1cbiAgICAjIFdoZW4gY3RybC1mLCBiLCBkLCB1IGluIHZMIG1vZGUsIEkgaGFkIHRvIGNhbGwgdXBkYXRlU3luYyB0byBzaG93IGN1cnNvciBjb3JyZWN0bHlcbiAgICAjIEJ1dCBpdCB3YXNuJ3QgbmVjZXNzYXJ5IGJlZm9yZSBJIGlpbnRyb2R1Y2UgYG1vdmVUb0ZpcnN0Q2hhcmFjdGVyT25WZXJ0aWNhbE1vdGlvbmAgZm9yIGBjdHJsLWZgXG4gICAgQGVkaXRvckVsZW1lbnQuY29tcG9uZW50LnVwZGF0ZVN5bmMoKVxuXG4gICAgZm9yIGN1cnNvciBpbiBjdXJzb3JzVG9TaG93IHdoZW4gb2Zmc2V0ID0gZ2V0T2Zmc2V0KHN1Ym1vZGUsIGN1cnNvcilcbiAgICAgIGlmIGN1cnNvck5vZGUgPSBnZXRDdXJzb3JOb2RlKEBlZGl0b3JFbGVtZW50LCBjdXJzb3IpXG4gICAgICAgIEBzdHlsZURpc3BvcnNlci5hZGQgc2V0U3R5bGUoY3Vyc29yTm9kZS5zdHlsZSwgb2Zmc2V0KVxuXG5tb2R1bGUuZXhwb3J0cyA9IEN1cnNvclN0eWxlTWFuYWdlclxuIl19
