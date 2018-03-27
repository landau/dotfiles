(function() {
  var CompositeDisposable, CursorStyleManager, Disposable, Point, getCursorNode, getOffset, isSpecMode, lineHeight, ref, setStyle, settings, swrap,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  ref = require('atom'), Point = ref.Point, Disposable = ref.Disposable, CompositeDisposable = ref.CompositeDisposable;

  settings = require('./settings');

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
          fromProperty: true
        });
        editor = cursor.editor;
        if (selection.isReversed()) {
          bufferPoint.row = selection.getBufferRange().start.row;
        }
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
      if (!(mode === 'visual' && settings.get('showCursorInVisualMode'))) {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvY3Vyc29yLXN0eWxlLW1hbmFnZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSw0SUFBQTtJQUFBOztFQUFBLE1BQTJDLE9BQUEsQ0FBUSxNQUFSLENBQTNDLEVBQUMsaUJBQUQsRUFBUSwyQkFBUixFQUFvQjs7RUFFcEIsUUFBQSxHQUFXLE9BQUEsQ0FBUSxZQUFSOztFQUNYLEtBQUEsR0FBUSxPQUFBLENBQVEscUJBQVI7O0VBQ1IsVUFBQSxHQUFhLElBQUksQ0FBQyxVQUFMLENBQUE7O0VBQ2IsVUFBQSxHQUFhOztFQUViLGFBQUEsR0FBZ0IsU0FBQyxhQUFELEVBQWdCLE1BQWhCO0FBQ2QsUUFBQTtJQUFBLGdCQUFBLEdBQW1CLGFBQWEsQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDO1dBQzFELGdCQUFnQixDQUFDLGVBQWdCLENBQUEsTUFBTSxDQUFDLEVBQVA7RUFGbkI7O0VBTWhCLFNBQUEsR0FBWSxTQUFDLE9BQUQsRUFBVSxNQUFWO0FBQ1YsUUFBQTtJQUFDLFlBQWE7QUFDZCxZQUFPLE9BQVA7QUFBQSxXQUNPLGVBRFA7UUFFSSxJQUFVLFNBQVMsQ0FBQyxVQUFWLENBQUEsQ0FBVjtBQUFBLGlCQUFBOztRQUNBLElBQUcsTUFBTSxDQUFDLG1CQUFQLENBQUEsQ0FBSDtpQkFDTSxJQUFBLEtBQUEsQ0FBTSxDQUFDLENBQVAsRUFBVSxDQUFWLEVBRE47U0FBQSxNQUFBO2lCQUdNLElBQUEsS0FBQSxDQUFNLENBQU4sRUFBUyxDQUFDLENBQVYsRUFITjs7QUFGRztBQURQLFdBUU8sV0FSUDtRQVNJLElBQVUsTUFBTSxDQUFDLG1CQUFQLENBQUEsQ0FBQSxJQUFnQyxTQUFTLENBQUMsVUFBVixDQUFBLENBQTFDO0FBQUEsaUJBQUE7O2VBQ0ksSUFBQSxLQUFBLENB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QUFWLENBQUEsQ0FBa0MsQ0FBQyxHQUFuQyxDQUF1QyxTQUFDLEVBQUQ7aUJBQVEsRUFBRSxDQUFDLGdCQUFILENBQUEsQ0FBcUIsQ0FBQztRQUE5QixDQUF2QyxFQURsQjs7QUFJQSxXQUFBLHlDQUFBOztRQUNFLElBQUcsYUFBVSxhQUFWLEVBQUEsTUFBQSxNQUFIO1VBQ0UsSUFBQSxDQUErQixNQUFNLENBQUMsU0FBUCxDQUFBLENBQS9CO1lBQUEsTUFBTSxDQUFDLFVBQVAsQ0FBa0IsSUFBbEIsRUFBQTtXQURGO1NBQUEsTUFBQTtVQUdFLElBQTRCLE1BQU0sQ0FBQyxTQUFQLENBQUEsQ0FBNUI7WUFBQSxNQUFNLENBQUMsVUFBUCxDQUFrQixLQUFsQixFQUFBO1dBSEY7O0FBREY7TUFPQSxJQUFVLFVBQVY7QUFBQSxlQUFBOztNQVNBLElBQUMsQ0FBQSxhQUFhLENBQUMsU0FBUyxDQUFDLFVBQXpCLENBQUE7QUFFQTtXQUFBLGlEQUFBOztZQUFpQyxNQUFBLEdBQVMsU0FBQSxDQUFVLE9BQVYsRUFBbUIsTUFBbkI7VUFDeEMsSUFBRyxVQUFBLEdBQWEsYUFBQSxDQUFjLElBQUMsQ0FBQSxhQUFmLEVBQThCLE1BQTlCLENBQWhCO3lCQUNFLElBQUMsQ0FBQSxjQUFjLENBQUMsR0FBaEIsQ0FBb0IsUUFBQSxDQUFTLFVBQVUsQ0FBQyxLQUFwQixFQUEyQixNQUEzQixDQUFwQixHQURGO1dBQUEsTUFBQTtpQ0FBQTs7O0FBREY7O0lBN0JPOzs7Ozs7RUFpQ1gsTUFBTSxDQUFDLE9BQVAsR0FBaUI7QUFsR2pCIiwic291cmNlc0NvbnRlbnQiOlsie1BvaW50LCBEaXNwb3NhYmxlLCBDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2F0b20nXG5cbnNldHRpbmdzID0gcmVxdWlyZSAnLi9zZXR0aW5ncydcbnN3cmFwID0gcmVxdWlyZSAnLi9zZWxlY3Rpb24td3JhcHBlcidcbmlzU3BlY01vZGUgPSBhdG9tLmluU3BlY01vZGUoKVxubGluZUhlaWdodCA9IG51bGxcblxuZ2V0Q3Vyc29yTm9kZSA9IChlZGl0b3JFbGVtZW50LCBjdXJzb3IpIC0+XG4gIGN1cnNvcnNDb21wb25lbnQgPSBlZGl0b3JFbGVtZW50LmNvbXBvbmVudC5saW5lc0NvbXBvbmVudC5jdXJzb3JzQ29tcG9uZW50XG4gIGN1cnNvcnNDb21wb25lbnQuY3Vyc29yTm9kZXNCeUlkW2N1cnNvci5pZF1cblxuIyBSZXR1cm4gY3Vyc29yIHN0eWxlIG9mZnNldCh0b3AsIGxlZnQpXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuZ2V0T2Zmc2V0ID0gKHN1Ym1vZGUsIGN1cnNvcikgLT5cbiAge3NlbGVjdGlvbn0gPSBjdXJzb3JcbiAgc3dpdGNoIHN1Ym1vZGVcbiAgICB3aGVuICdjaGFyYWN0ZXJ3aXNlJ1xuICAgICAgcmV0dXJuIGlmIHNlbGVjdGlvbi5pc1JldmVyc2VkKClcbiAgICAgIGlmIGN1cnNvci5pc0F0QmVnaW5uaW5nT2ZMaW5lKClcbiAgICAgICAgbmV3IFBvaW50KC0xLCAwKVxuICAgICAgZWxzZVxuICAgICAgICBuZXcgUG9pbnQoMCwgLTEpXG5cbiAgICB3aGVuICdibG9ja3dpc2UnXG4gICAgICByZXR1cm4gaWYgY3Vyc29yLmlzQXRCZWdpbm5pbmdPZkxpbmUoKSBvciBzZWxlY3Rpb24uaXNSZXZlcnNlZCgpXG4gICAgICBuZXcgUG9pbnQoMCwgLTEpXG5cbiAgICB3aGVuICdsaW5ld2lzZSdcbiAgICAgIGJ1ZmZlclBvaW50ID0gc3dyYXAoc2VsZWN0aW9uKS5nZXRCdWZmZXJQb3NpdGlvbkZvcignaGVhZCcsIGZyb21Qcm9wZXJ0eTogdHJ1ZSlcbiAgICAgIGVkaXRvciA9IGN1cnNvci5lZGl0b3JcblxuICAgICAgIyBGSVhNRTogVGhpcyBhZGp1c3RtZW50IHNob3VsZCBub3QgbmVjZXNzYXJ5IGlmIHNlbGVjdGlvbiBwcm9wZXJ0eSBpcyBhbHdheXMgYmVsaWV2YWJsZS5cbiAgICAgIGlmIHNlbGVjdGlvbi5pc1JldmVyc2VkKClcbiAgICAgICAgYnVmZmVyUG9pbnQucm93ID0gc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKCkuc3RhcnQucm93XG5cbiAgICAgIGlmIGVkaXRvci5pc1NvZnRXcmFwcGVkKClcbiAgICAgICAgc2NyZWVuUG9pbnQgPSBlZGl0b3Iuc2NyZWVuUG9zaXRpb25Gb3JCdWZmZXJQb3NpdGlvbihidWZmZXJQb2ludClcbiAgICAgICAgb2Zmc2V0ID0gc2NyZWVuUG9pbnQudHJhdmVyc2FsRnJvbShjdXJzb3IuZ2V0U2NyZWVuUG9zaXRpb24oKSlcbiAgICAgIGVsc2VcbiAgICAgICAgb2Zmc2V0ID0gYnVmZmVyUG9pbnQudHJhdmVyc2FsRnJvbShjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKSlcbiAgICAgIGlmIG5vdCBzZWxlY3Rpb24uaXNSZXZlcnNlZCgpIGFuZCBjdXJzb3IuaXNBdEJlZ2lubmluZ09mTGluZSgpXG4gICAgICAgIG9mZnNldC5yb3cgPSAtMVxuICAgICAgb2Zmc2V0XG5cbnNldFN0eWxlID0gKHN0eWxlLCB7cm93LCBjb2x1bW59KSAtPlxuICBzdHlsZS5zZXRQcm9wZXJ0eSgndG9wJywgXCIje3JvdyAqIGxpbmVIZWlnaHR9ZW1cIikgdW5sZXNzIHJvdyBpcyAwXG4gIHN0eWxlLnNldFByb3BlcnR5KCdsZWZ0JywgXCIje2NvbHVtbn1jaFwiKSB1bmxlc3MgY29sdW1uIGlzIDBcbiAgbmV3IERpc3Bvc2FibGUgLT5cbiAgICBzdHlsZS5yZW1vdmVQcm9wZXJ0eSgndG9wJylcbiAgICBzdHlsZS5yZW1vdmVQcm9wZXJ0eSgnbGVmdCcpXG5cbiMgRGlzcGxheSBjdXJzb3IgaW4gdmlzdWFsIG1vZGUuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIEN1cnNvclN0eWxlTWFuYWdlclxuICBjb25zdHJ1Y3RvcjogKEB2aW1TdGF0ZSkgLT5cbiAgICB7QGVkaXRvckVsZW1lbnQsIEBlZGl0b3J9ID0gQHZpbVN0YXRlXG4gICAgQGxpbmVIZWlnaHRPYnNlcnZlciA9IGF0b20uY29uZmlnLm9ic2VydmUgJ2VkaXRvci5saW5lSGVpZ2h0JywgKG5ld1ZhbHVlKSA9PlxuICAgICAgbGluZUhlaWdodCA9IG5ld1ZhbHVlXG4gICAgICBAcmVmcmVzaCgpXG5cbiAgZGVzdHJveTogLT5cbiAgICBAc3R5bGVEaXNwb3JzZXI/LmRpc3Bvc2UoKVxuICAgIEBsaW5lSGVpZ2h0T2JzZXJ2ZXIuZGlzcG9zZSgpXG4gICAge0BzdHlsZURpc3BvcnNlciwgQGxpbmVIZWlnaHRPYnNlcnZlcn0gPSB7fVxuXG4gIHJlZnJlc2g6IC0+XG4gICAge21vZGUsIHN1Ym1vZGV9ID0gQHZpbVN0YXRlXG4gICAgQHN0eWxlRGlzcG9yc2VyPy5kaXNwb3NlKClcbiAgICBAc3R5bGVEaXNwb3JzZXIgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuICAgIHJldHVybiB1bmxlc3MgbW9kZSBpcyAndmlzdWFsJyBhbmQgc2V0dGluZ3MuZ2V0KCdzaG93Q3Vyc29ySW5WaXN1YWxNb2RlJylcblxuICAgIGN1cnNvcnMgPSBjdXJzb3JzVG9TaG93ID0gQGVkaXRvci5nZXRDdXJzb3JzKClcbiAgICBpZiBzdWJtb2RlIGlzICdibG9ja3dpc2UnXG4gICAgICBjdXJzb3JzVG9TaG93ID0gQHZpbVN0YXRlLmdldEJsb2Nrd2lzZVNlbGVjdGlvbnMoKS5tYXAgKGJzKSAtPiBicy5nZXRIZWFkU2VsZWN0aW9uKCkuY3Vyc29yXG5cbiAgICAjIHVwZGF0ZSB2aXNpYmlsaXR5XG4gICAgZm9yIGN1cnNvciBpbiBjdXJzb3JzXG4gICAgICBpZiBjdXJzb3IgaW4gY3Vyc29yc1RvU2hvd1xuICAgICAgICBjdXJzb3Iuc2V0VmlzaWJsZSh0cnVlKSB1bmxlc3MgY3Vyc29yLmlzVmlzaWJsZSgpXG4gICAgICBlbHNlXG4gICAgICAgIGN1cnNvci5zZXRWaXNpYmxlKGZhbHNlKSBpZiBjdXJzb3IuaXNWaXNpYmxlKClcblxuICAgICMgW0ZJWE1FXSBJbiBzcGVjIG1vZGUsIHdlIHNraXAgaGVyZSBzaW5jZSBub3QgYWxsIHNwZWMgaGF2ZSBkb20gYXR0YWNoZWQuXG4gICAgcmV0dXJuIGlmIGlzU3BlY01vZGVcblxuICAgICMgW05PVEVdIEluIEJsb2Nrd2lzZVNlbGVjdCB3ZSBhZGQgc2VsZWN0aW9ucyhhbmQgY29ycmVzcG9uZGluZyBjdXJzb3JzKSBpbiBibHVrLlxuICAgICMgQnV0IGNvcnJlc3BvbmRpbmcgY3Vyc29yc0NvbXBvbmVudChIVE1MIGVsZW1lbnQpIGlzIGFkZGVkIGluIHN5bmMuXG4gICAgIyBTbyB0byBtb2RpZnkgc3R5bGUgb2YgY3Vyc29yc0NvbXBvbmVudCwgd2UgaGF2ZSB0byBtYWtlIHN1cmUgY29ycmVzcG9uZGluZyBjdXJzb3JzQ29tcG9uZW50XG4gICAgIyBpcyBhdmFpbGFibGUgYnkgY29tcG9uZW50IGluIHN5bmMgdG8gbW9kZWwuXG4gICAgIyBbRklYTUVdXG4gICAgIyBXaGVuIGN0cmwtZiwgYiwgZCwgdSBpbiB2TCBtb2RlLCBJIGhhZCB0byBjYWxsIHVwZGF0ZVN5bmMgdG8gc2hvdyBjdXJzb3IgY29ycmVjdGx5XG4gICAgIyBCdXQgaXQgd2Fzbid0IG5lY2Vzc2FyeSBiZWZvcmUgSSBpaW50cm9kdWNlIGBtb3ZlVG9GaXJzdENoYXJhY3Rlck9uVmVydGljYWxNb3Rpb25gIGZvciBgY3RybC1mYFxuICAgIEBlZGl0b3JFbGVtZW50LmNvbXBvbmVudC51cGRhdGVTeW5jKClcblxuICAgIGZvciBjdXJzb3IgaW4gY3Vyc29yc1RvU2hvdyB3aGVuIG9mZnNldCA9IGdldE9mZnNldChzdWJtb2RlLCBjdXJzb3IpXG4gICAgICBpZiBjdXJzb3JOb2RlID0gZ2V0Q3Vyc29yTm9kZShAZWRpdG9yRWxlbWVudCwgY3Vyc29yKVxuICAgICAgICBAc3R5bGVEaXNwb3JzZXIuYWRkIHNldFN0eWxlKGN1cnNvck5vZGUuc3R5bGUsIG9mZnNldClcblxubW9kdWxlLmV4cG9ydHMgPSBDdXJzb3JTdHlsZU1hbmFnZXJcbiJdfQ==
