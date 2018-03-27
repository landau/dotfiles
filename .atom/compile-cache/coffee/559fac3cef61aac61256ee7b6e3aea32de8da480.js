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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvY3Vyc29yLXN0eWxlLW1hbmFnZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSxnRkFBQTtJQUFBOzs7RUFBQSxNQUEyQyxPQUFBLENBQVEsTUFBUixDQUEzQyxFQUFDLGlCQUFELEVBQVEsMkJBQVIsRUFBb0I7O0VBQ3BCLFFBQUEsR0FBVyxPQUFBLENBQVEsVUFBUjs7RUFDWCxLQUFBLEdBQVEsT0FBQSxDQUFRLHFCQUFSOztFQUlGO2lDQUNKLFVBQUEsR0FBWTs7SUFFWixRQUFRLENBQUMsV0FBVCxDQUFxQixrQkFBckI7O0lBQ0Esa0JBQUMsQ0FBQSxpQkFBRCxDQUFtQixNQUFuQixFQUEyQixTQUEzQixFQUFzQztNQUFBLFVBQUEsRUFBWSxVQUFaO0tBQXRDOztJQUVhLDRCQUFDLFFBQUQ7QUFDWCxVQUFBO01BRFksSUFBQyxDQUFBLFdBQUQ7O01BQ1osT0FBNEIsSUFBQyxDQUFBLFFBQTdCLEVBQUMsSUFBQyxDQUFBLHFCQUFBLGFBQUYsRUFBaUIsSUFBQyxDQUFBLGNBQUE7TUFDbEIsSUFBQyxDQUFBLGFBQUQsR0FBaUIsSUFBSTtNQUNyQixJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFaLENBQW9CLG1CQUFwQixFQUF5QyxJQUFDLENBQUEsT0FBMUMsQ0FBbkI7TUFDQSxJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFaLENBQW9CLGlCQUFwQixFQUF1QyxJQUFDLENBQUEsT0FBeEMsQ0FBbkI7SUFKVzs7aUNBTWIsT0FBQSxHQUFTLFNBQUE7QUFDUCxVQUFBOztZQUFpQixDQUFFLE9BQW5CLENBQUE7O2FBQ0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxPQUFmLENBQUE7SUFGTzs7aUNBSVQsT0FBQSxHQUFTLFNBQUE7QUFFUCxVQUFBO01BQUEsSUFBVSxJQUFJLENBQUMsVUFBTCxDQUFBLENBQVY7QUFBQSxlQUFBOztNQUNBLElBQUMsQ0FBQSxVQUFELEdBQWMsSUFBQyxDQUFBLE1BQU0sQ0FBQyxxQkFBUixDQUFBOztZQUdHLENBQUUsT0FBbkIsQ0FBQTs7TUFDQSxJQUFjLElBQUMsQ0FBQSxJQUFELEtBQVMsUUFBdkI7QUFBQSxlQUFBOztNQUVBLElBQUMsQ0FBQSxnQkFBRCxHQUFvQixJQUFJO01BQ3hCLElBQUcsSUFBQyxDQUFBLE9BQUQsS0FBWSxXQUFmO1FBQ0UsYUFBQSxHQUFnQixJQUFDLENBQUEsUUFBUSxDQUFDLHNCQUFWLENBQUEsQ0FBa0MsQ0FBQyxHQUFuQyxDQUF1QyxTQUFDLEVBQUQ7aUJBQVEsRUFBRSxDQUFDLGdCQUFILENBQUEsQ0FBcUIsQ0FBQztRQUE5QixDQUF2QyxFQURsQjtPQUFBLE1BQUE7UUFHRSxhQUFBLEdBQWdCLElBQUMsQ0FBQSxNQUFNLENBQUMsVUFBUixDQUFBLEVBSGxCOztBQU1BO0FBQUEsV0FBQSxzQ0FBQTs7UUFDRSxNQUFNLENBQUMsVUFBUCxDQUFrQixhQUFVLGFBQVYsRUFBQSxNQUFBLE1BQWxCO0FBREY7TUFLQSxJQUFDLENBQUEsYUFBYSxDQUFDLFNBQVMsQ0FBQyxVQUF6QixDQUFBO01BR0EsZUFBQSxHQUFrQixJQUFDLENBQUEsYUFBYSxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUMsZ0JBQWdCLENBQUM7QUFDM0U7V0FBQSxpREFBQTs7WUFBaUMsVUFBQSxHQUFhLGVBQWdCLENBQUEsTUFBTSxDQUFDLEVBQVA7dUJBQzVELElBQUMsQ0FBQSxnQkFBZ0IsQ0FBQyxHQUFsQixDQUFzQixJQUFDLENBQUEsV0FBRCxDQUFhLE1BQWIsRUFBcUIsVUFBckIsQ0FBdEI7O0FBREY7O0lBekJPOztpQ0E0QlQsZ0NBQUEsR0FBa0MsU0FBQyxTQUFEO0FBQ2hDLFVBQUE7TUFBQSxjQUFBLEdBQWlCLEtBQUEsQ0FBTSxTQUFOLENBQWdCLENBQUMsb0JBQWpCLENBQXNDLE1BQXRDLEVBQThDO1FBQUEsSUFBQSxFQUFNLENBQUMsVUFBRCxDQUFOO09BQTlDO01BQ2pCLElBQUcsSUFBQyxDQUFBLE1BQU0sQ0FBQyxpQkFBUixDQUFBLENBQUEsSUFBZ0MsQ0FBSSxTQUFTLENBQUMsVUFBVixDQUFBLENBQXZDO1FBQ0UsY0FBQSxHQUFpQixJQUFDLENBQUEsTUFBTSxDQUFDLCtCQUFSLENBQXdDLGNBQWMsQ0FBQyxTQUFmLENBQXlCLENBQUMsQ0FBRCxFQUFJLENBQUMsQ0FBTCxDQUF6QixDQUF4QyxFQUEyRTtVQUFBLGFBQUEsRUFBZSxTQUFmO1NBQTNFO1FBQ2pCLHVCQUFBLEdBQTBCLElBQUMsQ0FBQSxNQUFNLENBQUMsK0JBQVIsQ0FBd0MsY0FBeEMsQ0FBdUQsQ0FBQyxTQUF4RCxDQUFrRSxDQUFDLENBQUQsRUFBSSxDQUFDLENBQUwsQ0FBbEU7UUFDMUIsSUFBRyx1QkFBdUIsQ0FBQyxhQUF4QixDQUFzQyxjQUF0QyxDQUFIO1VBQ0UsY0FBQSxHQUFpQix3QkFEbkI7U0FIRjs7YUFNQSxJQUFDLENBQUEsTUFBTSxDQUFDLGtCQUFSLENBQTJCLGNBQTNCO0lBUmdDOztpQ0FXbEMsV0FBQSxHQUFhLFNBQUMsTUFBRCxFQUFTLE9BQVQ7QUFDWCxVQUFBO01BQUEsU0FBQSxHQUFZLE1BQU0sQ0FBQztNQUNuQixjQUFBLEdBQWlCLElBQUMsQ0FBQSxnQ0FBRCxDQUFrQyxTQUFsQztNQUVqQixJQUFHLElBQUMsQ0FBQSxPQUFELEtBQVksVUFBWixJQUEyQixJQUFDLENBQUEsTUFBTSxDQUFDLGFBQVIsQ0FBQSxDQUE5QjtRQUNFLGNBQUEsR0FBaUIsSUFBQyxDQUFBLE1BQU0sQ0FBQywrQkFBUixDQUF3QyxjQUF4QztRQUNqQixPQUFnQixjQUFjLENBQUMsYUFBZixDQUE2QixNQUFNLENBQUMsaUJBQVAsQ0FBQSxDQUE3QixDQUFoQixFQUFDLGNBQUQsRUFBTSxxQkFGUjtPQUFBLE1BQUE7UUFJRSxPQUFnQixjQUFjLENBQUMsYUFBZixDQUE2QixNQUFNLENBQUMsaUJBQVAsQ0FBQSxDQUE3QixDQUFoQixFQUFDLGNBQUQsRUFBTSxxQkFKUjs7TUFNQSxLQUFBLEdBQVEsT0FBTyxDQUFDO01BQ2hCLElBQXNELEdBQXREO1FBQUEsS0FBSyxDQUFDLFdBQU4sQ0FBa0IsS0FBbEIsRUFBMkIsQ0FBQyxJQUFDLENBQUEsVUFBRCxHQUFjLEdBQWYsQ0FBQSxHQUFtQixJQUE5QyxFQUFBOztNQUNBLElBQTRDLE1BQTVDO1FBQUEsS0FBSyxDQUFDLFdBQU4sQ0FBa0IsTUFBbEIsRUFBNkIsTUFBRCxHQUFRLElBQXBDLEVBQUE7O2FBQ0ksSUFBQSxVQUFBLENBQVcsU0FBQTtRQUNiLEtBQUssQ0FBQyxjQUFOLENBQXFCLEtBQXJCO2VBQ0EsS0FBSyxDQUFDLGNBQU4sQ0FBcUIsTUFBckI7TUFGYSxDQUFYO0lBYk87Ozs7OztFQWlCZixNQUFNLENBQUMsT0FBUCxHQUFpQjtBQTlFakIiLCJzb3VyY2VzQ29udGVudCI6WyJ7UG9pbnQsIERpc3Bvc2FibGUsIENvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSAnYXRvbSdcbkRlbGVnYXRvID0gcmVxdWlyZSAnZGVsZWdhdG8nXG5zd3JhcCA9IHJlcXVpcmUgJy4vc2VsZWN0aW9uLXdyYXBwZXInXG5cbiMgRGlzcGxheSBjdXJzb3IgaW4gdmlzdWFsLW1vZGVcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgQ3Vyc29yU3R5bGVNYW5hZ2VyXG4gIGxpbmVIZWlnaHQ6IG51bGxcblxuICBEZWxlZ2F0by5pbmNsdWRlSW50byh0aGlzKVxuICBAZGVsZWdhdGVzUHJvcGVydHkoJ21vZGUnLCAnc3VibW9kZScsIHRvUHJvcGVydHk6ICd2aW1TdGF0ZScpXG5cbiAgY29uc3RydWN0b3I6IChAdmltU3RhdGUpIC0+XG4gICAge0BlZGl0b3JFbGVtZW50LCBAZWRpdG9yfSA9IEB2aW1TdGF0ZVxuICAgIEBzdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb25maWcub2JzZXJ2ZSgnZWRpdG9yLmxpbmVIZWlnaHQnLCBAcmVmcmVzaClcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb25maWcub2JzZXJ2ZSgnZWRpdG9yLmZvbnRTaXplJywgQHJlZnJlc2gpXG5cbiAgZGVzdHJveTogLT5cbiAgICBAc3R5bGVEaXNwb3NhYmxlcz8uZGlzcG9zZSgpXG4gICAgQHN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG5cbiAgcmVmcmVzaDogPT5cbiAgICAjIEludGVudGlvbmFsbHkgc2tpcCBpbiBzcGVjIG1vZGUsIHNpbmNlIG5vdCBhbGwgc3BlYyBoYXZlIERPTSBhdHRhY2hlZCggYW5kIGRvbid0IHdhbnQgdG8gKS5cbiAgICByZXR1cm4gaWYgYXRvbS5pblNwZWNNb2RlKClcbiAgICBAbGluZUhlaWdodCA9IEBlZGl0b3IuZ2V0TGluZUhlaWdodEluUGl4ZWxzKClcblxuICAgICMgV2UgbXVzdCBkaXNwb3NlIHByZXZpb3VzIHN0eWxlIG1vZGlmaWNhdGlvbiBmb3Igbm9uLXZpc3VhbC1tb2RlXG4gICAgQHN0eWxlRGlzcG9zYWJsZXM/LmRpc3Bvc2UoKVxuICAgIHJldHVybiB1bmxlc3MgQG1vZGUgaXMgJ3Zpc3VhbCdcblxuICAgIEBzdHlsZURpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcbiAgICBpZiBAc3VibW9kZSBpcyAnYmxvY2t3aXNlJ1xuICAgICAgY3Vyc29yc1RvU2hvdyA9IEB2aW1TdGF0ZS5nZXRCbG9ja3dpc2VTZWxlY3Rpb25zKCkubWFwIChicykgLT4gYnMuZ2V0SGVhZFNlbGVjdGlvbigpLmN1cnNvclxuICAgIGVsc2VcbiAgICAgIGN1cnNvcnNUb1Nob3cgPSBAZWRpdG9yLmdldEN1cnNvcnMoKVxuXG4gICAgIyBJbiBibG9ja3dpc2UsIHNob3cgb25seSBibG9ja3dpc2UtaGVhZCBjdXJzb3JcbiAgICBmb3IgY3Vyc29yIGluIEBlZGl0b3IuZ2V0Q3Vyc29ycygpXG4gICAgICBjdXJzb3Iuc2V0VmlzaWJsZShjdXJzb3IgaW4gY3Vyc29yc1RvU2hvdylcblxuICAgICMgRklYTUU6IGluIG9jY3VycmVuY2UsIGluIHZCLCBtdWx0aS1zZWxlY3Rpb25zIGFyZSBhZGRlZCBkdXJpbmcgb3BlcmF0aW9uIGJ1dCBzZWxlY3Rpb24gaXMgYWRkZWQgYXN5bmNocm9ub3VzbHkuXG4gICAgIyBXZSBuZWVkIHRvIG1ha2Ugc3VyZSB0aGF0IGNvcnJlc3BvbmRpbmcgY3Vyc29yJ3MgZG9tTm9kZSBpcyBhdmFpbGFibGUgdG8gbW9kaWZ5IGl0J3Mgc3R5bGUuXG4gICAgQGVkaXRvckVsZW1lbnQuY29tcG9uZW50LnVwZGF0ZVN5bmMoKVxuXG4gICAgIyBbTk9URV0gVXNpbmcgbm9uLXB1YmxpYyBBUElcbiAgICBjdXJzb3JOb2Rlc0J5SWQgPSBAZWRpdG9yRWxlbWVudC5jb21wb25lbnQubGluZXNDb21wb25lbnQuY3Vyc29yc0NvbXBvbmVudC5jdXJzb3JOb2Rlc0J5SWRcbiAgICBmb3IgY3Vyc29yIGluIGN1cnNvcnNUb1Nob3cgd2hlbiBjdXJzb3JOb2RlID0gY3Vyc29yTm9kZXNCeUlkW2N1cnNvci5pZF1cbiAgICAgIEBzdHlsZURpc3Bvc2FibGVzLmFkZCBAbW9kaWZ5U3R5bGUoY3Vyc29yLCBjdXJzb3JOb2RlKVxuXG4gIGdldEN1cnNvckJ1ZmZlclBvc2l0aW9uVG9EaXNwbGF5OiAoc2VsZWN0aW9uKSAtPlxuICAgIGJ1ZmZlclBvc2l0aW9uID0gc3dyYXAoc2VsZWN0aW9uKS5nZXRCdWZmZXJQb3NpdGlvbkZvcignaGVhZCcsIGZyb206IFsncHJvcGVydHknXSlcbiAgICBpZiBAZWRpdG9yLmhhc0F0b21pY1NvZnRUYWJzKCkgYW5kIG5vdCBzZWxlY3Rpb24uaXNSZXZlcnNlZCgpXG4gICAgICBzY3JlZW5Qb3NpdGlvbiA9IEBlZGl0b3Iuc2NyZWVuUG9zaXRpb25Gb3JCdWZmZXJQb3NpdGlvbihidWZmZXJQb3NpdGlvbi50cmFuc2xhdGUoWzAsICsxXSksIGNsaXBEaXJlY3Rpb246ICdmb3J3YXJkJylcbiAgICAgIGJ1ZmZlclBvc2l0aW9uVG9EaXNwbGF5ID0gQGVkaXRvci5idWZmZXJQb3NpdGlvbkZvclNjcmVlblBvc2l0aW9uKHNjcmVlblBvc2l0aW9uKS50cmFuc2xhdGUoWzAsIC0xXSlcbiAgICAgIGlmIGJ1ZmZlclBvc2l0aW9uVG9EaXNwbGF5LmlzR3JlYXRlclRoYW4oYnVmZmVyUG9zaXRpb24pXG4gICAgICAgIGJ1ZmZlclBvc2l0aW9uID0gYnVmZmVyUG9zaXRpb25Ub0Rpc3BsYXlcblxuICAgIEBlZGl0b3IuY2xpcEJ1ZmZlclBvc2l0aW9uKGJ1ZmZlclBvc2l0aW9uKVxuXG4gICMgQXBwbHkgc2VsZWN0aW9uIHByb3BlcnR5J3MgdHJhdmVyc2FsIGZyb20gYWN0dWFsIGN1cnNvciB0byBjdXJzb3JOb2RlJ3Mgc3R5bGVcbiAgbW9kaWZ5U3R5bGU6IChjdXJzb3IsIGRvbU5vZGUpIC0+XG4gICAgc2VsZWN0aW9uID0gY3Vyc29yLnNlbGVjdGlvblxuICAgIGJ1ZmZlclBvc2l0aW9uID0gQGdldEN1cnNvckJ1ZmZlclBvc2l0aW9uVG9EaXNwbGF5KHNlbGVjdGlvbilcblxuICAgIGlmIEBzdWJtb2RlIGlzICdsaW5ld2lzZScgYW5kIEBlZGl0b3IuaXNTb2Z0V3JhcHBlZCgpXG4gICAgICBzY3JlZW5Qb3NpdGlvbiA9IEBlZGl0b3Iuc2NyZWVuUG9zaXRpb25Gb3JCdWZmZXJQb3NpdGlvbihidWZmZXJQb3NpdGlvbilcbiAgICAgIHtyb3csIGNvbHVtbn0gPSBzY3JlZW5Qb3NpdGlvbi50cmF2ZXJzYWxGcm9tKGN1cnNvci5nZXRTY3JlZW5Qb3NpdGlvbigpKVxuICAgIGVsc2VcbiAgICAgIHtyb3csIGNvbHVtbn0gPSBidWZmZXJQb3NpdGlvbi50cmF2ZXJzYWxGcm9tKGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpKVxuXG4gICAgc3R5bGUgPSBkb21Ob2RlLnN0eWxlXG4gICAgc3R5bGUuc2V0UHJvcGVydHkoJ3RvcCcsIFwiI3tAbGluZUhlaWdodCAqIHJvd31weFwiKSBpZiByb3dcbiAgICBzdHlsZS5zZXRQcm9wZXJ0eSgnbGVmdCcsIFwiI3tjb2x1bW59Y2hcIikgaWYgY29sdW1uXG4gICAgbmV3IERpc3Bvc2FibGUgLT5cbiAgICAgIHN0eWxlLnJlbW92ZVByb3BlcnR5KCd0b3AnKVxuICAgICAgc3R5bGUucmVtb3ZlUHJvcGVydHkoJ2xlZnQnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IEN1cnNvclN0eWxlTWFuYWdlclxuIl19
