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
        if (this.submode === 'linewise' && (this.editor.isSoftWrapped() || this.editor.isFoldedAtBufferRow(bufferPosition.row))) {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvY3Vyc29yLXN0eWxlLW1hbmFnZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSxrR0FBQTtJQUFBOzs7RUFBQSxNQUEyQyxPQUFBLENBQVEsTUFBUixDQUEzQyxFQUFDLGlCQUFELEVBQVEsMkJBQVIsRUFBb0I7O0VBQ3BCLFFBQUEsR0FBVyxPQUFBLENBQVEsVUFBUjs7RUFDWCx1QkFBQSxHQUEwQjs7RUFJMUIsTUFBTSxDQUFDLE9BQVAsR0FDTTtpQ0FDSixVQUFBLEdBQVk7O0lBRVosUUFBUSxDQUFDLFdBQVQsQ0FBcUIsa0JBQXJCOztJQUNBLGtCQUFDLENBQUEsaUJBQUQsQ0FBbUIsTUFBbkIsRUFBMkIsU0FBM0IsRUFBc0M7TUFBQSxVQUFBLEVBQVksVUFBWjtLQUF0Qzs7SUFFYSw0QkFBQyxRQUFEO0FBQ1gsVUFBQTtNQURZLElBQUMsQ0FBQSxXQUFEOzs7TUFDWixPQUE0QixJQUFDLENBQUEsUUFBN0IsRUFBQyxJQUFDLENBQUEscUJBQUEsYUFBRixFQUFpQixJQUFDLENBQUEsY0FBQTs7UUFDbEIsMEJBQTJCOztNQUMzQixJQUFDLENBQUEsV0FBRCxHQUFlLElBQUk7TUFDbkIsSUFBQyxDQUFBLFdBQVcsQ0FBQyxHQUFiLENBQWlCLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBWixDQUFvQixtQkFBcEIsRUFBeUMsSUFBQyxDQUFBLE9BQTFDLENBQWpCO01BQ0EsSUFBQyxDQUFBLFdBQVcsQ0FBQyxHQUFiLENBQWlCLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBWixDQUFvQixpQkFBcEIsRUFBdUMsSUFBQyxDQUFBLE9BQXhDLENBQWpCO01BQ0EsSUFBQyxDQUFBLFFBQVEsQ0FBQyxZQUFWLENBQXVCLElBQUMsQ0FBQSxPQUF4QjtJQU5XOztpQ0FRYixPQUFBLEdBQVMsU0FBQTtB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VWxDLGNBQUEsR0FBZ0IsU0FBQyxNQUFELEVBQVMsT0FBVDtBQUNkLFVBQUE7TUFBQSxJQUFHLE9BQUg7UUFDRSxjQUFBLEdBQWlCLElBQUMsQ0FBQSxnQ0FBRCxDQUFrQyxNQUFNLENBQUMsU0FBekM7UUFDakIsSUFBRyxJQUFDLENBQUEsT0FBRCxLQUFZLFVBQVosSUFBMkIsQ0FBQyxJQUFDLENBQUEsTUFBTSxDQUFDLGFBQVIsQ0FBQSxDQUFBLElBQTJCLElBQUMsQ0FBQSxNQUFNLENBQUMsbUJBQVIsQ0FBNEIsY0FBYyxDQUFDLEdBQTNDLENBQTVCLENBQTlCO1VBQ0UsY0FBQSxHQUFpQixJQUFDLENBQUEsTUFBTSxDQUFDLCtCQUFSLENBQXdDLGNBQXhDO1VBQ2pCLE9BQWdCLGNBQWMsQ0FBQyxhQUFmLENBQTZCLE1BQU0sQ0FBQyxpQkFBUCxDQUFBLENBQTdCLENBQWhCLEVBQUMsY0FBRCxFQUFNLHFCQUZSO1NBQUEsTUFBQTtVQUlFLE9BQWdCLGNBQWMsQ0FBQyxhQUFmLENBQTZCLE1BQU0sQ0FBQyxpQkFBUCxDQUFBLENBQTdCLENBQWhCLEVBQUMsY0FBRCxFQUFNLHFCQUpSOztBQU1BLGVBQU87VUFDTCxHQUFBLEVBQUssSUFBQyxDQUFBLFVBQUQsR0FBYyxHQUFkLEdBQW9CLElBRHBCO1VBRUwsSUFBQSxFQUFNLE1BQUEsR0FBUyxJQUZWO1VBR0wsVUFBQSxFQUFZLFNBSFA7VUFSVDtPQUFBLE1BQUE7QUFjRSxlQUFPO1VBQUMsVUFBQSxFQUFZLFFBQWI7VUFkVDs7SUFEYzs7Ozs7QUF0R2xCIiwic291cmNlc0NvbnRlbnQiOlsie1BvaW50LCBEaXNwb3NhYmxlLCBDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2F0b20nXG5EZWxlZ2F0byA9IHJlcXVpcmUgJ2RlbGVnYXRvJ1xuU3VwcG9ydEN1cnNvclNldFZpc2libGUgPSBudWxsXG5cbiMgRGlzcGxheSBjdXJzb3IgaW4gdmlzdWFsLW1vZGVcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgQ3Vyc29yU3R5bGVNYW5hZ2VyXG4gIGxpbmVIZWlnaHQ6IG51bGxcblxuICBEZWxlZ2F0by5pbmNsdWRlSW50byh0aGlzKVxuICBAZGVsZWdhdGVzUHJvcGVydHkoJ21vZGUnLCAnc3VibW9kZScsIHRvUHJvcGVydHk6ICd2aW1TdGF0ZScpXG5cbiAgY29uc3RydWN0b3I6IChAdmltU3RhdGUpIC0+XG4gICAge0BlZGl0b3JFbGVtZW50LCBAZWRpdG9yfSA9IEB2aW1TdGF0ZVxuICAgIFN1cHBvcnRDdXJzb3JTZXRWaXNpYmxlID89IEBlZGl0b3IuZ2V0TGFzdEN1cnNvcigpLnNldFZpc2libGU/XG4gICAgQGRpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcbiAgICBAZGlzcG9zYWJsZXMuYWRkIGF0b20uY29uZmlnLm9ic2VydmUoJ2VkaXRvci5saW5lSGVpZ2h0JywgQHJlZnJlc2gpXG4gICAgQGRpc3Bvc2FibGVzLmFkZCBhdG9tLmNvbmZpZy5vYnNlcnZlKCdlZGl0b3IuZm9udFNpemUnLCBAcmVmcmVzaClcbiAgICBAdmltU3RhdGUub25EaWREZXN0cm95KEBkZXN0cm95KVxuXG4gIGRlc3Ryb3k6ID0+XG4gICAgQHN0eWxlRGlzcG9zYWJsZXM/LmRpc3Bvc2UoKVxuICAgIEBkaXNwb3NhYmxlcy5kaXNwb3NlKClcblxuICB1cGRhdGVDdXJzb3JTdHlsZU9sZDogLT5cbiAgICAjIFdlIG11c3QgZGlzcG9zZSBwcmV2aW91cyBzdHlsZSBtb2RpZmljYXRpb24gZm9yIG5vbi12aXN1YWwtbW9kZVxuICAgIEBzdHlsZURpc3Bvc2FibGVzPy5kaXNwb3NlKClcbiAgICBAc3R5bGVEaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG4gICAgcmV0dXJuIHVubGVzcyBAbW9kZSBpcyAndmlzdWFsJ1xuXG4gICAgaWYgQHN1Ym1vZGUgaXMgJ2Jsb2Nrd2lzZSdcbiAgICAgIGN1cnNvcnNUb1Nob3cgPSBAdmltU3RhdGUuZ2V0QmxvY2t3aXNlU2VsZWN0aW9ucygpLm1hcCAoYnMpIC0+IGJzLmdldEhlYWRTZWxlY3Rpb24oKS5jdXJzb3JcbiAgICBlbHNlXG4gICAgICBjdXJzb3JzVG9TaG93ID0gQGVkaXRvci5nZXRDdXJzb3JzKClcblxuICAgICMgSW4gdmlzdWFsLW1vZGUgb3IgaW4gb2NjdXJyZW5jZSBvcGVyYXRpb24sIGN1cnNvciBhcmUgYWRkZWQgZHVyaW5nIG9wZXJhdGlvbiBidXQgc2VsZWN0aW9uIGlzIGFkZGVkIGFzeW5jaHJvbm91c2x5LlxuICAgICMgV2UgaGF2ZSB0byBtYWtlIHN1cmUgdGhhdCBjb3JyZXNwb25kaW5nIGN1cnNvcidzIGRvbU5vZGUgaXMgYXZhaWxhYmxlIGF0IHRoaXMgcG9pbnQgdG8gZGlyZWN0bHkgbW9kaWZ5IGl0J3Mgc3R5bGUuXG4gICAgQGVkaXRvckVsZW1lbnQuY29tcG9uZW50LnVwZGF0ZVN5bmMoKVxuICAgIGZvciBjdXJzb3IgaW4gQGVkaXRvci5nZXRDdXJzb3JzKClcbiAgICAgIGN1cnNvcklzVmlzaWJsZSA9IGN1cnNvciBpbiBjdXJzb3JzVG9TaG93XG4gICAgICBjdXJzb3Iuc2V0VmlzaWJsZShjdXJzb3JJc1Zpc2libGUpXG4gICAgICBpZiBjdXJzb3JJc1Zpc2libGVcbiAgICAgICAgQHN0eWxlRGlzcG9zYWJsZXMuYWRkIEBtb2RpZnlDdXJzb3JTdHlsZShjdXJzb3IsIEBnZXRDdXJzb3JTdHlsZShjdXJzb3IsIHRydWUpKVxuXG4gIG1vZGlmeUN1cnNvclN0eWxlOiAoY3Vyc29yLCBjdXJzb3JTdHlsZSkgLT5cbiAgICBjdXJzb3JTdHlsZSA9IEBnZXRDdXJzb3JTdHlsZShjdXJzb3IsIHRydWUpXG4gICAgIyBbTk9URV0gVXNpbmcgbm9uLXB1YmxpYyBBUElcbiAgICBjdXJzb3JOb2RlID0gQGVkaXRvckVsZW1lbnQuY29tcG9uZW50LmxpbmVzQ29tcG9uZW50LmN1cnNvcnNDb21wb25lbnQuY3Vyc29yTm9kZXNCeUlkW2N1cnNvci5pZF1cbiAgICBpZiBjdXJzb3JOb2RlXG4gICAgICBjdXJzb3JOb2RlLnN0eWxlLnNldFByb3BlcnR5KCd0b3AnLCBjdXJzb3JTdHlsZS50b3ApXG4gICAgICBjdXJzb3JOb2RlLnN0eWxlLnNldFByb3BlcnR5KCdsZWZ0JywgY3Vyc29yU3R5bGUubGVmdClcbiAgICAgIG5ldyBEaXNwb3NhYmxlIC0+XG4gICAgICAgIGN1cnNvck5vZGUuc3R5bGU/LnJlbW92ZVByb3BlcnR5KCd0b3AnKVxuICAgICAgICBjdXJzb3JOb2RlLnN0eWxlPy5yZW1vdmVQcm9wZXJ0eSgnbGVmdCcpXG4gICAgZWxzZVxuICAgICAgbmV3IERpc3Bvc2FibGVcblxuICB1cGRhdGVDdXJzb3JTdHlsZU5ldzogLT5cbiAgICAjIFdlIG11c3QgZGlzcG9zZSBwcmV2aW91cyBzdHlsZSBtb2RpZmljYXRpb24gZm9yIG5vbi12aXN1YWwtbW9kZVxuICAgICMgSW50ZW50aW9uYWxseSBjb2xsZWN0IGFsbCBkZWNvcmF0aW9ucyBmcm9tIGVkaXRvciBpbnN0ZWFkIG9mIG1hbmFnaW5nXG4gICAgIyBkZWNvcmF0aW9ucyB3ZSBjcmVhdGVkIGV4cGxpY2l0bHkuXG4gICAgIyBXaHk/IHdoZW4gaW50ZXJzZWN0aW5nIG11bHRpcGxlIHNlbGVjdGlvbnMgYXJlIGF1dG8tbWVyZ2VkLCBpdCdzIGdvdCB3aXJlZFxuICAgICMgc3RhdGUgd2hlcmUgZGVjb3JhdGlvbiBjYW5ub3QgYmUgZGlzcG9zYWJsZShub3QgaW52ZXN0aWdhdGVkIHdlbGwpLlxuICAgICMgQW5kIEkgd2FudCB0byBhc3N1cmUgQUxMIGN1cnNvciBzdHlsZSBtb2RpZmljYXRpb24gZG9uZSBieSB2bXAgaXMgY2xlYXJlZC5cbiAgICBmb3IgZGVjb3JhdGlvbiBpbiBAZWRpdG9yLmdldERlY29yYXRpb25zKHR5cGU6ICdjdXJzb3InLCBjbGFzczogJ3ZpbS1tb2RlLXBsdXMnKVxuICAgICAgZGVjb3JhdGlvbi5kZXN0cm95KClcblxuICAgIHJldHVybiB1bmxlc3MgQG1vZGUgaXMgJ3Zpc3VhbCdcblxuICAgIGlmIEBzdWJtb2RlIGlzICdibG9ja3dpc2UnXG4gICAgICBjdXJzb3JzVG9TaG93ID0gQHZpbVN0YXRlLmdldEJsb2Nrd2lzZVNlbGVjdGlvbnMoKS5tYXAgKGJzKSAtPiBicy5nZXRIZWFkU2VsZWN0aW9uKCkuY3Vyc29yXG4gICAgZWxzZVxuICAgICAgY3Vyc29yc1RvU2hvdyA9IEBlZGl0b3IuZ2V0Q3Vyc29ycygpXG5cbiAgICBmb3IgY3Vyc29yIGluIEBlZGl0b3IuZ2V0Q3Vyc29ycygpXG4gICAgICBAZWRpdG9yLmRlY29yYXRlTWFya2VyIGN1cnNvci5nZXRNYXJrZXIoKSxcbiAgICAgICAgdHlwZTogJ2N1cnNvcidcbiAgICAgICAgY2xhc3M6ICd2aW0tbW9kZS1wbHVzJ1xuICAgICAgICBzdHlsZTogQGdldEN1cnNvclN0eWxlKGN1cnNvciwgY3Vyc29yIGluIGN1cnNvcnNUb1Nob3cpXG5cbiAgcmVmcmVzaDogPT5cbiAgICAjIEludGVudGlvbmFsbHkgc2tpcCBpbiBzcGVjIG1vZGUsIHNpbmNlIG5vdCBhbGwgc3BlYyBoYXZlIERPTSBhdHRhY2hlZCggYW5kIGRvbid0IHdhbnQgdG8gKS5cbiAgICByZXR1cm4gaWYgYXRvbS5pblNwZWNNb2RlKClcblxuICAgIEBsaW5lSGVpZ2h0ID0gQGVkaXRvci5nZXRMaW5lSGVpZ2h0SW5QaXhlbHMoKVxuXG4gICAgaWYgU3VwcG9ydEN1cnNvclNldFZpc2libGVcbiAgICAgIEB1cGRhdGVDdXJzb3JTdHlsZU9sZCgpXG4gICAgZWxzZVxuICAgICAgQHVwZGF0ZUN1cnNvclN0eWxlTmV3KClcblxuICBnZXRDdXJzb3JCdWZmZXJQb3NpdGlvblRvRGlzcGxheTogKHNlbGVjdGlvbikgLT5cbiAgICBidWZmZXJQb3NpdGlvbiA9IEB2aW1TdGF0ZS5zd3JhcChzZWxlY3Rpb24pLmdldEJ1ZmZlclBvc2l0aW9uRm9yKCdoZWFkJywgZnJvbTogWydwcm9wZXJ0eSddKVxuICAgIGlmIEBlZGl0b3IuaGFzQXRvbWljU29mdFRhYnMoKSBhbmQgbm90IHNlbGVjdGlvbi5pc1JldmVyc2VkKClcbiAgICAgIHNjcmVlblBvc2l0aW9uID0gQGVkaXRvci5zY3JlZW5Qb3NpdGlvbkZvckJ1ZmZlclBvc2l0aW9uKGJ1ZmZlclBvc2l0aW9uLnRyYW5zbGF0ZShbMCwgKzFdKSwgY2xpcERpcmVjdGlvbjogJ2ZvcndhcmQnKVxuICAgICAgYnVmZmVyUG9zaXRpb25Ub0Rpc3BsYXkgPSBAZWRpdG9yLmJ1ZmZlclBvc2l0aW9uRm9yU2NyZWVuUG9zaXRpb24oc2NyZWVuUG9zaXRpb24pLnRyYW5zbGF0ZShbMCwgLTFdKVxuICAgICAgaWYgYnVmZmVyUG9zaXRpb25Ub0Rpc3BsYXkuaXNHcmVhdGVyVGhhbihidWZmZXJQb3NpdGlvbilcbiAgICAgICAgYnVmZmVyUG9zaXRpb24gPSBidWZmZXJQb3NpdGlvblRvRGlzcGxheVxuXG4gICAgQGVkaXRvci5jbGlwQnVmZmVyUG9zaXRpb24oYnVmZmVyUG9zaXRpb24pXG5cbiAgZ2V0Q3Vyc29yU3R5bGU6IChjdXJzb3IsIHZpc2libGUpIC0+XG4gICAgaWYgdmlzaWJsZVxuICAgICAgYnVmZmVyUG9zaXRpb24gPSBAZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb25Ub0Rpc3BsYXkoY3Vyc29yLnNlbGVjdGlvbilcbiAgICAgIGlmIEBzdWJtb2RlIGlzICdsaW5ld2lzZScgYW5kIChAZWRpdG9yLmlzU29mdFdyYXBwZWQoKSBvciBAZWRpdG9yLmlzRm9sZGVkQXRCdWZmZXJSb3coYnVmZmVyUG9zaXRpb24ucm93KSlcbiAgICAgICAgc2NyZWVuUG9zaXRpb24gPSBAZWRpdG9yLnNjcmVlblBvc2l0aW9uRm9yQnVmZmVyUG9zaXRpb24oYnVmZmVyUG9zaXRpb24pXG4gICAgICAgIHtyb3csIGNvbHVtbn0gPSBzY3JlZW5Qb3NpdGlvbi50cmF2ZXJzYWxGcm9tKGN1cnNvci5nZXRTY3JlZW5Qb3NpdGlvbigpKVxuICAgICAgZWxzZVxuICAgICAgICB7cm93LCBjb2x1bW59ID0gYnVmZmVyUG9zaXRpb24udHJhdmVyc2FsRnJvbShjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKSlcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdG9wOiBAbGluZUhlaWdodCAqIHJvdyArICdweCdcbiAgICAgICAgbGVmdDogY29sdW1uICsgJ2NoJ1xuICAgICAgICB2aXNpYmlsaXR5OiAndmlzaWJsZSdcbiAgICAgIH1cbiAgICBlbHNlXG4gICAgICByZXR1cm4ge3Zpc2liaWxpdHk6ICdoaWRkZW4nfVxuIl19
