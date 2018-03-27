(function() {
  var getVimState;

  getVimState = require('./spec-helper').getVimState;

  describe("Scrolling", function() {
    var editor, editorElement, ensure, keystroke, ref, set, vimState;
    ref = [], set = ref[0], ensure = ref[1], keystroke = ref[2], editor = ref[3], editorElement = ref[4], vimState = ref[5];
    beforeEach(function() {
      return getVimState(function(state, vim) {
        vimState = state;
        editor = vimState.editor, editorElement = vimState.editorElement;
        set = vim.set, ensure = vim.ensure, keystroke = vim.keystroke;
        return jasmine.attachToDOM(editorElement);
      });
    });
    describe("scrolling keybindings", function() {
      beforeEach(function() {
        var component, initialRowRange;
        if (editorElement.measureDimensions != null) {
          component = editor.component;
          component.element.style.height = component.getLineHeight() * 5 + 'px';
          editorElement.measureDimensions();
          initialRowRange = [0, 5];
        } else {
          editor.setLineHeightInPixels(10);
          editorElement.setHeight(10 * 5);
          atom.views.performDocumentPoll();
          initialRowRange = [0, 4];
        }
        set({
          cursor: [1, 2],
          text: "100\n200\n300\n400\n500\n600\n700\n800\n900\n1000"
        });
        return expect(editorElement.getVisibleRowRange()).toEqual(initialRowRange);
      });
      return describe("the ctrl-e and ctrl-y keybindings", function() {
        return it("moves the screen up and down by one and keeps cursor onscreen", function() {
          ensure('ctrl-e', {
            cursor: [2, 2]
          });
          expect(editor.getFirstVisibleScreenRow()).toBe(1);
          expect(editor.getLastVisibleScreenRow()).toBe(6);
          ensure('2 ctrl-e', {
            cursor: [4, 2]
          });
          expect(editor.getFirstVisibleScreenRow()).toBe(3);
          expect(editor.getLastVisibleScreenRow()).toBe(8);
          ensure('2 ctrl-y', {
            cursor: [2, 2]
          });
          expect(editor.getFirstVisibleScreenRow()).toBe(1);
          return expect(editor.getLastVisibleScreenRow()).toBe(6);
        });
      });
    });
    describe("scroll cursor keybindings", function() {
      beforeEach(function() {
        var j, results;
        editor.setText((function() {
          results = [];
          for (j = 1; j <= 200; j++){ results.push(j); }
          return results;
        }).apply(this).join("\n"));
        editorElement.style.lineHeight = "20px";
        editorElement.setHeight(20 * 10);
        if (editorElement.measureDimensions != null) {
          editorElement.measureDimensions();
        } else {
          editorElement.component.sampleFontStyling();
        }
        spyOn(editor, 'moveToFirstCharacterOfLine');
        spyOn(editorElement, 'setScrollTop');
        spyOn(editorElement, 'getFirstVisibleScreenRow').andReturn(90);
        spyOn(editorElement, 'getLastVisibleScreenRow').andReturn(110);
        return spyOn(editorElement, 'pixelPositionForScreenPosition').andReturn({
          top: 1000,
          left: 0
        });
      });
      describe("the z<CR> keybinding", function() {
        return it("moves the screen to position cursor at the top of the window and moves cursor to first non-blank in the line", function() {
          keystroke('z enter');
          expect(editorElement.setScrollTop).toHaveBeenCalledWith(960);
          return expect(editor.moveToFirstCharacterOfLine).toHaveBeenCalled();
        });
      });
      describe("the zt keybinding", function() {
        return it("moves the screen to position cursor at the top of the window and leave cursor in the same column", function() {
          keystroke('z t');
          expect(editorElement.setScrollTop).toHaveBeenCalledWith(960);
          return expect(editor.moveToFirstCharacterOfLine).not.toHaveBeenCalled();
        });
      });
      describe("the z. keybinding", function() {
        return it("moves the screen to position cursor at the center of the window and moves cursor to first non-blank in the line", function() {
          keystroke('z .');
          expect(editorElement.setScrollTop).toHaveBeenCalledWith(900);
          return expect(editor.moveToFirstCharacterOfLine).toHaveBeenCalled();
        });
      });
      describe("the zz keybinding", function() {
        return it("moves the screen to position cursor at the center of the window and leave cursor in the same column", function() {
          keystroke('z z');
          expect(editorElement.setScrollTop).toHaveBeenCalledWith(900);
          return expect(editor.moveToFirstCharacterOfLine).not.toHaveBeenCalled();
        });
      });
      describe("the z- keybinding", function() {
        return it("moves the screen to position cursor at the bottom of the window and moves cursor to first non-blank in the line", function() {
          keystroke('z -');
          expect(editorElement.setScrollTop).toHaveBeenCalledWith(860);
          return expect(editor.moveToFirstCharacterOfLine).toHaveBeenCalled();
        });
      });
      return describe("the zb keybinding", function() {
        return it("moves the screen to position cursor at the bottom of the window and leave cursor in the same column", function() {
          keystroke('z b');
          expect(editorElement.setScrollTop).toHaveBeenCalledWith(860);
          return expect(editor.moveToFirstCharacterOfLine).not.toHaveBeenCalled();
        });
      });
    });
    return describe("horizontal scroll cursor keybindings", function() {
      beforeEach(function() {
        var i, j, text;
        editorElement.setWidth(600);
        editorElement.setHeight(600);
        editorElement.style.lineHeight = "10px";
        editorElement.style.font = "16px monospace";
        if (editorElement.measureDimensions != null) {
          editorElement.measureDimensions();
        } else {
          atom.views.performDocumentPoll();
        }
        text = "";
        for (i = j = 100; j <= 199; i = ++j) {
          text += i + " ";
        }
        editor.setText(text);
        return editor.setCursorBufferPosition([0, 0]);
      });
      describe("the zs keybinding", function() {
        var startPosition, zsPos;
        zsPos = function(pos) {
          editor.setCursorBufferPosition([0, pos]);
          keystroke('z s');
          return editorElement.getScrollLeft();
        };
        startPosition = 0/0;
        beforeEach(function() {
          return startPosition = editorElement.getScrollLeft();
        });
        xit("does nothing near the start of the line", function() {
          var pos1;
          pos1 = zsPos(1);
          return expect(pos1).toEqual(startPosition);
        });
        it("moves the cursor the nearest it can to the left edge of the editor", function() {
          var pos10, pos11;
          pos10 = zsPos(10);
          expect(pos10).toBeGreaterThan(startPosition);
          pos11 = zsPos(11);
          return expect(pos11 - pos10).toEqual(10);
        });
        it("does nothing near the end of the line", function() {
          var pos340, pos390, posEnd;
          posEnd = zsPos(399);
          expect(editor.getCursorBufferPosition()).toEqual([0, 399]);
          pos390 = zsPos(390);
          expect(pos390).toEqual(posEnd);
          expect(editor.getCursorBufferPosition()).toEqual([0, 390]);
          pos340 = zsPos(340);
          return expect(pos340).toEqual(posEnd);
        });
        return it("does nothing if all lines are short", function() {
          var pos1, pos10;
          editor.setText('short');
          startPosition = editorElement.getScrollLeft();
          pos1 = zsPos(1);
          expect(pos1).toEqual(startPosition);
          expect(editor.getCursorBufferPosition()).toEqual([0, 1]);
          pos10 = zsPos(10);
          expect(pos10).toEqual(startPosition);
          return expect(editor.getCursorBufferPosition()).toEqual([0, 4]);
        });
      });
      return describe("the ze keybinding", function() {
        var startPosition, zePos;
        zePos = function(pos) {
          editor.setCursorBufferPosition([0, pos]);
          keystroke('z e');
          return editorElement.getScrollLeft();
        };
        startPosition = 0/0;
        beforeEach(function() {
          return startPosition = editorElement.getScrollLeft();
        });
        it("does nothing near the start of the line", function() {
          var pos1, pos40;
          pos1 = zePos(1);
          expect(pos1).toEqual(startPosition);
          pos40 = zePos(40);
          return expect(pos40).toEqual(startPosition);
        });
        it("moves the cursor the nearest it can to the right edge of the editor", function() {
          var pos109, pos110;
          pos110 = zePos(110);
          expect(pos110).toBeGreaterThan(startPosition);
          pos109 = zePos(109);
          return expect(pos110 - pos109).toEqual(9);
        });
        it("does nothing when very near the end of the line", function() {
          var pos380, pos382, pos397, posEnd;
          posEnd = zePos(399);
          expect(editor.getCursorBufferPosition()).toEqual([0, 399]);
          pos397 = zePos(397);
          expect(pos397).toBeLessThan(posEnd);
          expect(editor.getCursorBufferPosition()).toEqual([0, 397]);
          pos380 = zePos(380);
          expect(pos380).toBeLessThan(posEnd);
          pos382 = zePos(382);
          return expect(pos382 - pos380).toEqual(19);
        });
        return it("does nothing if all lines are short", function() {
          var pos1, pos10;
          editor.setText('short');
          startPosition = editorElement.getScrollLeft();
          pos1 = zePos(1);
          expect(pos1).toEqual(startPosition);
          expect(editor.getCursorBufferPosition()).toEqual([0, 1]);
          pos10 = zePos(10);
          expect(pos10).toEqual(startPosition);
          return expect(editor.getCursorBufferPosition()).toEqual([0, 4]);
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9zcGVjL3Njcm9sbC1zcGVjLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUMsY0FBZSxPQUFBLENBQVEsZUFBUjs7RUFFaEIsUUFBQSxDQUFTLFdBQVQsRUFBc0IsU0FBQTtBQUNwQixRQUFBO0lBQUEsTUFBNEQsRUFBNUQsRUFBQyxZQUFELEVBQU0sZUFBTixFQUFjLGtCQUFkLEVBQXlCLGVBQXpCLEVBQWlDLHNCQUFqQyxFQUFnRDtJQUVoRCxVQUFBLENBQVcsU0FBQTthQUNULFdBQUEsQ0FBWSxTQUFDLEtBQUQsRUFBUSxHQUFSO1FBQ1YsUUFBQSxHQUFXO1FBQ1Ysd0JBQUQsRUFBUztRQUNSLGFBQUQsRUFBTSxtQkFBTixFQUFjO2VBQ2QsT0FBTyxDQUFDLFdBQVIsQ0FBb0IsYUFBcEI7TUFKVSxDQUFaO0lBRFMsQ0FBWDtJQU9BLFFBQUEsQ0FBUyx1QkFBVCxFQUFrQyxTQUFBO01BQ2hDLFVBQUEsQ0FBVyxTQUFBO0FBQ1QsWUFBQTtRQUFBLElBQUcsdUNBQUg7VUFFRyxZQUFhO1VBQ2QsU0FBUyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBeEIsR0FBaUMsU0FBUyxDQUFDLGFBQVYsQ0FBQSxDQUFBLEdBQTRCLENBQTVCLEdBQWdDO1VBQ2pFLGFBQWEsQ0FBQyxpQkFBZCxDQUFBO1VBQ0EsZUFBQSxHQUFrQixDQUFDLENBQUQsRUFBSSxDQUFKLEVBTHBCO1NBQUEsTUFBQTtVQVNFLE1BQU0sQ0FBQyxxQkFBUCxDQUE2QixFQUE3QjtVQUNBLGFBQWEsQ0FBQyxTQUFkLENBQXdCLEVBQUEsR0FBSyxDQUE3QjtVQUNBLElBQUksQ0FBQyxLQUFLLENBQUMsbUJBQVgsQ0FBQTtVQUNBLGVBQUEsR0FBa0IsQ0FBQyxDQUFELEVBQUksQ0FBSixFQVpwQjs7UUFjQSxHQUFBLENBQ0U7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aUQsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFqRDtVQUNBLEtBQUEsR0FBUSxLQUFBLENBQU0sRUFBTjtVQUNSLE1BQUEsQ0FBTyxLQUFQLENBQWEsQ0FBQyxPQUFkLENBQXNCLGFBQXRCO2lCQUNBLE1BQUEsQ0FBTyxNQUFNLENBQUMsdUJBQVAsQ0FBQSxDQUFQLENBQXdDLENBQUMsT0FBekMsQ0FBaUQsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFqRDtRQVJ3QyxDQUExQztNQXhDNEIsQ0FBOUI7SUEvRCtDLENBQWpEO0VBaEhvQixDQUF0QjtBQUZBIiwic291cmNlc0NvbnRlbnQiOlsie2dldFZpbVN0YXRlfSA9IHJlcXVpcmUgJy4vc3BlYy1oZWxwZXInXG5cbmRlc2NyaWJlIFwiU2Nyb2xsaW5nXCIsIC0+XG4gIFtzZXQsIGVuc3VyZSwga2V5c3Ryb2tlLCBlZGl0b3IsIGVkaXRvckVsZW1lbnQsIHZpbVN0YXRlXSA9IFtdXG5cbiAgYmVmb3JlRWFjaCAtPlxuICAgIGdldFZpbVN0YXRlIChzdGF0ZSwgdmltKSAtPlxuICAgICAgdmltU3RhdGUgPSBzdGF0ZVxuICAgICAge2VkaXRvciwgZWRpdG9yRWxlbWVudH0gPSB2aW1TdGF0ZVxuICAgICAge3NldCwgZW5zdXJlLCBrZXlzdHJva2V9ID0gdmltXG4gICAgICBqYXNtaW5lLmF0dGFjaFRvRE9NKGVkaXRvckVsZW1lbnQpXG5cbiAgZGVzY3JpYmUgXCJzY3JvbGxpbmcga2V5YmluZGluZ3NcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBpZiBlZGl0b3JFbGVtZW50Lm1lYXN1cmVEaW1lbnNpb25zP1xuICAgICAgICAjIEZvciBBdG9tLXYxLjE5XG4gICAgICAgIHtjb21wb25lbnR9ID0gZWRpdG9yXG4gICAgICAgIGNvbXBvbmVudC5lbGVtZW50LnN0eWxlLmhlaWdodCA9IGNvbXBvbmVudC5nZXRMaW5lSGVpZ2h0KCkgKiA1ICsgJ3B4J1xuICAgICAgICBlZGl0b3JFbGVtZW50Lm1lYXN1cmVEaW1lbnNpb25zKClcbiAgICAgICAgaW5pdGlhbFJvd1JhbmdlID0gWzAsIDVdXG5cbiAgICAgIGVsc2UgIyBGb3IgQXRvbS12MS4xOFxuICAgICAgICAjIFtUT0RPXSBSZW1vdmUgd2hlbiB2LjEuMTkgYmVjb21lIHN0YWJsZVxuICAgICAgICBlZGl0b3Iuc2V0TGluZUhlaWdodEluUGl4ZWxzKDEwKVxuICAgICAgICBlZGl0b3JFbGVtZW50LnNldEhlaWdodCgxMCAqIDUpXG4gICAgICAgIGF0b20udmlld3MucGVyZm9ybURvY3VtZW50UG9sbCgpXG4gICAgICAgIGluaXRpYWxSb3dSYW5nZSA9IFswLCA0XVxuXG4gICAgICBzZXRcbiAgICAgICAgY3Vyc29yOiBbMSwgMl1cbiAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgMTAwXG4gICAgICAgICAgMjAwXG4gICAgICAgICAgMzAwXG4gICAgICAgICAgNDAwXG4gICAgICAgICAgNTAwXG4gICAgICAgICAgNjAwXG4gICAgICAgICAgNzAwXG4gICAgICAgICAgODAwXG4gICAgICAgICAgOTAwXG4gICAgICAgICAgMTAwMFxuICAgICAgICBcIlwiXCJcbiAgICAgIGV4cGVjdChlZGl0b3JFbGVtZW50LmdldFZpc2libGVSb3dSYW5nZSgpKS50b0VxdWFsKGluaXRpYWxSb3dSYW5nZSlcblxuICAgIGRlc2NyaWJlIFwidGhlIGN0cmwtZSBhbmQgY3RybC15IGtleWJpbmRpbmdzXCIsIC0+XG4gICAgICBpdCBcIm1vdmVzIHRoZSBzY3JlZW4gdXAgYW5kIGRvd24gYnkgb25lIGFuZCBrZWVwcyBjdXJzb3Igb25zY3JlZW5cIiwgLT5cbiAgICAgICAgZW5zdXJlICdjdHJsLWUnLCBjdXJzb3I6IFsyLCAyXVxuICAgICAgICBleHBlY3QoZWRpdG9yLmdldEZpcnN0VmlzaWJsZVNjcmVlblJvdygpKS50b0JlIDFcbiAgICAgICAgZXhwZWN0KGVkaXRvci5nZXRMYXN0VmlzaWJsZVNjcmVlblJvdygpKS50b0JlIDZcblxuICAgICAgICBlbnN1cmUgJzIgY3RybC1lJywgY3Vyc29yOiBbNCwgMl1cbiAgICAgICAgZXhwZWN0KGVkaXRvci5nZXRGaXJzdFZpc2libGVTY3JlZW5Sb3coKSkudG9CZSAzXG4gICAgICAgIGV4cGVjdChlZGl0b3IuZ2V0TGFzdFZpc2libGVTY3JlZW5Sb3coKSkudG9CZSA4XG5cbiAgICAgICAgZW5zdXJlICcyIGN0cmwteScsIGN1cnNvcjogWzIsIDJdXG4gICAgICAgIGV4cGVjdChlZGl0b3IuZ2V0Rmlyc3RWaXNpYmxlU2NyZWVuUm93KCkpLnRvQmUgMVxuICAgICAgICBleHBlY3QoZWRpdG9yLmdldExhc3RWaXNpYmxlU2NyZWVuUm93KCkpLnRvQmUgNlxuXG4gIGRlc2NyaWJlIFwic2Nyb2xsIGN1cnNvciBrZXliaW5kaW5nc1wiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIGVkaXRvci5zZXRUZXh0IFsxLi4yMDBdLmpvaW4oXCJcXG5cIilcbiAgICAgIGVkaXRvckVsZW1lbnQuc3R5bGUubGluZUhlaWdodCA9IFwiMjBweFwiXG5cbiAgICAgIGVkaXRvckVsZW1lbnQuc2V0SGVpZ2h0KDIwICogMTApXG5cbiAgICAgIGlmIGVkaXRvckVsZW1lbnQubWVhc3VyZURpbWVuc2lvbnM/XG4gICAgICAgICMgRm9yIEF0b20tdjEuMTlcbiAgICAgICAgZWRpdG9yRWxlbWVudC5tZWFzdXJlRGltZW5zaW9ucygpXG4gICAgICBlbHNlICMgRm9yIEF0b20tdjEuMThcbiAgICAgICAgIyBbVE9ET10gUmVtb3ZlIHdoZW4gdi4xLjE5IGJlY29tZSBzdGFibGVcbiAgICAgICAgZWRpdG9yRWxlbWVudC5jb21wb25lbnQuc2FtcGxlRm9udFN0eWxpbmcoKVxuXG4gICAgICBzcHlPbihlZGl0b3IsICdtb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZScpXG4gICAgICBzcHlPbihlZGl0b3JFbGVtZW50LCAnc2V0U2Nyb2xsVG9wJylcbiAgICAgIHNweU9uKGVkaXRvckVsZW1lbnQsICdnZXRGaXJzdFZpc2libGVTY3JlZW5Sb3cnKS5hbmRSZXR1cm4oOTApXG4gICAgICBzcHlPbihlZGl0b3JFbGVtZW50LCAnZ2V0TGFzdFZpc2libGVTY3JlZW5Sb3cnKS5hbmRSZXR1cm4oMTEwKVxuICAgICAgc3B5T24oZWRpdG9yRWxlbWVudCwgJ3BpeGVsUG9zaXRpb25Gb3JTY3JlZW5Qb3NpdGlvbicpLmFuZFJldHVybih7dG9wOiAxMDAwLCBsZWZ0OiAwfSlcblxuICAgIGRlc2NyaWJlIFwidGhlIHo8Q1I+IGtleWJpbmRpbmdcIiwgLT5cbiAgICAgIGl0IFwibW92ZXMgdGhlIHNjcmVlbiB0byBwb3NpdGlvbiBjdXJzb3IgYXQgdGhlIHRvcCBvZiB0aGUgd2luZG93IGFuZCBtb3ZlcyBjdXJzb3IgdG8gZmlyc3Qgbm9uLWJsYW5rIGluIHRoZSBsaW5lXCIsIC0+XG4gICAgICAgIGtleXN0cm9rZSAneiBlbnRlcidcbiAgICAgICAgZXhwZWN0KGVkaXRvckVsZW1lbnQuc2V0U2Nyb2xsVG9wKS50b0hhdmVCZWVuQ2FsbGVkV2l0aCg5NjApXG4gICAgICAgIGV4cGVjdChlZGl0b3IubW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmUpLnRvSGF2ZUJlZW5DYWxsZWQoKVxuXG4gICAgZGVzY3JpYmUgXCJ0aGUgenQga2V5YmluZGluZ1wiLCAtPlxuICAgICAgaXQgXCJtb3ZlcyB0aGUgc2NyZWVuIHRvIHBvc2l0aW9uIGN1cnNvciBhdCB0aGUgdG9wIG9mIHRoZSB3aW5kb3cgYW5kIGxlYXZlIGN1cnNvciBpbiB0aGUgc2FtZSBjb2x1bW5cIiwgLT5cbiAgICAgICAga2V5c3Ryb2tlICd6IHQnXG4gICAgICAgIGV4cGVjdChlZGl0b3JFbGVtZW50LnNldFNjcm9sbFRvcCkudG9IYXZlQmVlbkNhbGxlZFdpdGgoOTYwKVxuICAgICAgICBleHBlY3QoZWRpdG9yLm1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lKS5ub3QudG9IYXZlQmVlbkNhbGxlZCgpXG5cbiAgICBkZXNjcmliZSBcInRoZSB6LiBrZXliaW5kaW5nXCIsIC0+XG4gICAgICBpdCBcIm1vdmVzIHRoZSBzY3JlZW4gdG8gcG9zaXRpb24gY3Vyc29yIGF0IHRoZSBjZW50ZXIgb2YgdGhlIHdpbmRvdyBhbmQgbW92ZXMgY3Vyc29yIHRvIGZpcnN0IG5vbi1ibGFuayBpbiB0aGUgbGluZVwiLCAtPlxuICAgICAgICBrZXlzdHJva2UgJ3ogLidcbiAgICAgICAgZXhwZWN0KGVkaXRvckVsZW1lbnQuc2V0U2Nyb2xsVG9wKS50b0hhdmVCZWVuQ2FsbGVkV2l0aCg5MDApXG4gICAgICAgIGV4cGVjdChlZGl0b3IubW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmUpLnRvSGF2ZUJlZW5DYWxsZWQoKVxuXG4gICAgZGVzY3JpYmUgXCJ0aGUgenoga2V5YmluZGluZ1wiLCAtPlxuICAgICAgaXQgXCJtb3ZlcyB0aGUgc2NyZWVuIHRvIHBvc2l0aW9uIGN1cnNvciBhdCB0aGUgY2VudGVyIG9mIHRoZSB3aW5kb3cgYW5kIGxlYXZlIGN1cnNvciBpbiB0aGUgc2FtZSBjb2x1bW5cIiwgLT5cbiAgICAgICAga2V5c3Ryb2tlICd6IHonXG4gICAgICAgIGV4cGVjdChlZGl0b3JFbGVtZW50LnNldFNjcm9sbFRvcCkudG9IYXZlQmVlbkNhbGxlZFdpdGgoOTAwKVxuICAgICAgICBleHBlY3QoZWRpdG9yLm1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lKS5ub3QudG9IYXZlQmVlbkNhbGxlZCgpXG5cbiAgICBkZXNjcmliZSBcInRoZSB6LSBrZXliaW5kaW5nXCIsIC0+XG4gICAgICBpdCBcIm1vdmVzIHRoZSBzY3JlZW4gdG8gcG9zaXRpb24gY3Vyc29yIGF0IHRoZSBib3R0b20gb2YgdGhlIHdpbmRvdyBhbmQgbW92ZXMgY3Vyc29yIHRvIGZpcnN0IG5vbi1ibGFuayBpbiB0aGUgbGluZVwiLCAtPlxuICAgICAgICBrZXlzdHJva2UgJ3ogLSdcbiAgICAgICAgZXhwZWN0KGVkaXRvckVsZW1lbnQuc2V0U2Nyb2xsVG9wKS50b0hhdmVCZWVuQ2FsbGVkV2l0aCg4NjApXG4gICAgICAgIGV4cGVjdChlZGl0b3IubW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmUpLnRvSGF2ZUJlZW5DYWxsZWQoKVxuXG4gICAgZGVzY3JpYmUgXCJ0aGUgemIga2V5YmluZGluZ1wiLCAtPlxuICAgICAgaXQgXCJtb3ZlcyB0aGUgc2NyZWVuIHRvIHBvc2l0aW9uIGN1cnNvciBhdCB0aGUgYm90dG9tIG9mIHRoZSB3aW5kb3cgYW5kIGxlYXZlIGN1cnNvciBpbiB0aGUgc2FtZSBjb2x1bW5cIiwgLT5cbiAgICAgICAga2V5c3Ryb2tlICd6IGInXG4gICAgICAgIGV4cGVjdChlZGl0b3JFbGVtZW50LnNldFNjcm9sbFRvcCkudG9IYXZlQmVlbkNhbGxlZFdpdGgoODYwKVxuICAgICAgICBleHBlY3QoZWRpdG9yLm1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lKS5ub3QudG9IYXZlQmVlbkNhbGxlZCgpXG5cbiAgZGVzY3JpYmUgXCJob3Jpem9udGFsIHNjcm9sbCBjdXJzb3Iga2V5YmluZGluZ3NcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBlZGl0b3JFbGVtZW50LnNldFdpZHRoKDYwMClcbiAgICAgIGVkaXRvckVsZW1lbnQuc2V0SGVpZ2h0KDYwMClcbiAgICAgIGVkaXRvckVsZW1lbnQuc3R5bGUubGluZUhlaWdodCA9IFwiMTBweFwiXG4gICAgICBlZGl0b3JFbGVtZW50LnN0eWxlLmZvbnQgPSBcIjE2cHggbW9ub3NwYWNlXCJcblxuICAgICAgaWYgZWRpdG9yRWxlbWVudC5tZWFzdXJlRGltZW5zaW9ucz9cbiAgICAgICAgIyBGb3IgQXRvbS12MS4xOVxuICAgICAgICBlZGl0b3JFbGVtZW50Lm1lYXN1cmVEaW1lbnNpb25zKClcbiAgICAgIGVsc2UgIyBGb3IgQXRvbS12MS4xOFxuICAgICAgICAjIFtUT0RPXSBSZW1vdmUgd2hlbiB2LjEuMTkgYmVjb21lIHN0YWJsZVxuICAgICAgICBhdG9tLnZpZXdzLnBlcmZvcm1Eb2N1bWVudFBvbGwoKVxuXG4gICAgICB0ZXh0ID0gXCJcIlxuICAgICAgZm9yIGkgaW4gWzEwMC4uMTk5XVxuICAgICAgICB0ZXh0ICs9IFwiI3tpfSBcIlxuICAgICAgZWRpdG9yLnNldFRleHQodGV4dClcbiAgICAgIGVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihbMCwgMF0pXG5cbiAgICBkZXNjcmliZSBcInRoZSB6cyBrZXliaW5kaW5nXCIsIC0+XG4gICAgICB6c1BvcyA9IChwb3MpIC0+XG4gICAgICAgIGVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihbMCwgcG9zXSlcbiAgICAgICAga2V5c3Ryb2tlICd6IHMnXG4gICAgICAgIGVkaXRvckVsZW1lbnQuZ2V0U2Nyb2xsTGVmdCgpXG5cbiAgICAgIHN0YXJ0UG9zaXRpb24gPSBOYU5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc3RhcnRQb3NpdGlvbiA9IGVkaXRvckVsZW1lbnQuZ2V0U2Nyb2xsTGVmdCgpXG5cbiAgICAgICMgRklYTUU6IHJlbW92ZSBpbiBmdXR1cmVcbiAgICAgIHhpdCBcImRvZXMgbm90aGluZyBuZWFyIHRoZSBzdGFydCBvZiB0aGUgbGluZVwiLCAtPlxuICAgICAgICBwb3MxID0genNQb3MoMSlcbiAgICAgICAgZXhwZWN0KHBvczEpLnRvRXF1YWwoc3RhcnRQb3NpdGlvbilcblxuICAgICAgaXQgXCJtb3ZlcyB0aGUgY3Vyc29yIHRoZSBuZWFyZXN0IGl0IGNhbiB0byB0aGUgbGVmdCBlZGdlIG9mIHRoZSBlZGl0b3JcIiwgLT5cbiAgICAgICAgcG9zMTAgPSB6c1BvcygxMClcbiAgICAgICAgZXhwZWN0KHBvczEwKS50b0JlR3JlYXRlclRoYW4oc3RhcnRQb3NpdGlvbilcblxuICAgICAgICBwb3MxMSA9IHpzUG9zKDExKVxuICAgICAgICBleHBlY3QocG9zMTEgLSBwb3MxMCkudG9FcXVhbCgxMClcblxuICAgICAgaXQgXCJkb2VzIG5vdGhpbmcgbmVhciB0aGUgZW5kIG9mIHRoZSBsaW5lXCIsIC0+XG4gICAgICAgIHBvc0VuZCA9IHpzUG9zKDM5OSlcbiAgICAgICAgZXhwZWN0KGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpKS50b0VxdWFsIFswLCAzOTldXG5cbiAgICAgICAgcG9zMzkwID0genNQb3MoMzkwKVxuICAgICAgICBleHBlY3QocG9zMzkwKS50b0VxdWFsKHBvc0VuZClcbiAgICAgICAgZXhwZWN0KGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpKS50b0VxdWFsIFswLCAzOTBdXG5cbiAgICAgICAgcG9zMzQwID0genNQb3MoMzQwKVxuICAgICAgICBleHBlY3QocG9zMzQwKS50b0VxdWFsKHBvc0VuZClcblxuICAgICAgaXQgXCJkb2VzIG5vdGhpbmcgaWYgYWxsIGxpbmVzIGFyZSBzaG9ydFwiLCAtPlxuICAgICAgICBlZGl0b3Iuc2V0VGV4dCgnc2hvcnQnKVxuICAgICAgICBzdGFydFBvc2l0aW9uID0gZWRpdG9yRWxlbWVudC5nZXRTY3JvbGxMZWZ0KClcbiAgICAgICAgcG9zMSA9IHpzUG9zKDEpXG4gICAgICAgIGV4cGVjdChwb3MxKS50b0VxdWFsKHN0YXJ0UG9zaXRpb24pXG4gICAgICAgIGV4cGVjdChlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKSkudG9FcXVhbCBbMCwgMV1cbiAgICAgICAgcG9zMTAgPSB6c1BvcygxMClcbiAgICAgICAgZXhwZWN0KHBvczEwKS50b0VxdWFsKHN0YXJ0UG9zaXRpb24pXG4gICAgICAgIGV4cGVjdChlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKSkudG9FcXVhbCBbMCwgNF1cblxuICAgIGRlc2NyaWJlIFwidGhlIHplIGtleWJpbmRpbmdcIiwgLT5cbiAgICAgIHplUG9zID0gKHBvcykgLT5cbiAgICAgICAgZWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKFswLCBwb3NdKVxuICAgICAgICBrZXlzdHJva2UgJ3ogZSdcbiAgICAgICAgZWRpdG9yRWxlbWVudC5nZXRTY3JvbGxMZWZ0KClcblxuICAgICAgc3RhcnRQb3NpdGlvbiA9IE5hTlxuXG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHN0YXJ0UG9zaXRpb24gPSBlZGl0b3JFbGVtZW50LmdldFNjcm9sbExlZnQoKVxuXG4gICAgICBpdCBcImRvZXMgbm90aGluZyBuZWFyIHRoZSBzdGFydCBvZiB0aGUgbGluZVwiLCAtPlxuICAgICAgICBwb3MxID0gemVQb3MoMSlcbiAgICAgICAgZXhwZWN0KHBvczEpLnRvRXF1YWwoc3RhcnRQb3NpdGlvbilcblxuICAgICAgICBwb3M0MCA9IHplUG9zKDQwKVxuICAgICAgICBleHBlY3QocG9zNDApLnRvRXF1YWwoc3RhcnRQb3NpdGlvbilcblxuICAgICAgaXQgXCJtb3ZlcyB0aGUgY3Vyc29yIHRoZSBuZWFyZXN0IGl0IGNhbiB0byB0aGUgcmlnaHQgZWRnZSBvZiB0aGUgZWRpdG9yXCIsIC0+XG4gICAgICAgIHBvczExMCA9IHplUG9zKDExMClcbiAgICAgICAgZXhwZWN0KHBvczExMCkudG9CZUdyZWF0ZXJUaGFuKHN0YXJ0UG9zaXRpb24pXG5cbiAgICAgICAgcG9zMTA5ID0gemVQb3MoMTA5KVxuICAgICAgICBleHBlY3QocG9zMTEwIC0gcG9zMTA5KS50b0VxdWFsKDkpXG5cbiAgICAgICMgRklYTUUgZGVzY3JpcHRpb24gaXMgbm8gbG9uZ2VyIGFwcHJvcHJpYXRlXG4gICAgICBpdCBcImRvZXMgbm90aGluZyB3aGVuIHZlcnkgbmVhciB0aGUgZW5kIG9mIHRoZSBsaW5lXCIsIC0+XG4gICAgICAgIHBvc0VuZCA9IHplUG9zKDM5OSlcbiAgICAgICAgZXhwZWN0KGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpKS50b0VxdWFsIFswLCAzOTldXG5cbiAgICAgICAgcG9zMzk3ID0gemVQb3MoMzk3KVxuICAgICAgICBleHBlY3QocG9zMzk3KS50b0JlTGVzc1RoYW4ocG9zRW5kKVxuICAgICAgICBleHBlY3QoZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCkpLnRvRXF1YWwgWzAsIDM5N11cblxuICAgICAgICBwb3MzODAgPSB6ZVBvcygzODApXG4gICAgICAgIGV4cGVjdChwb3MzODApLnRvQmVMZXNzVGhhbihwb3NFbmQpXG5cbiAgICAgICAgcG9zMzgyID0gemVQb3MoMzgyKVxuICAgICAgICBleHBlY3QocG9zMzgyIC0gcG9zMzgwKS50b0VxdWFsKDE5KVxuXG4gICAgICBpdCBcImRvZXMgbm90aGluZyBpZiBhbGwgbGluZXMgYXJlIHNob3J0XCIsIC0+XG4gICAgICAgIGVkaXRvci5zZXRUZXh0KCdzaG9ydCcpXG4gICAgICAgIHN0YXJ0UG9zaXRpb24gPSBlZGl0b3JFbGVtZW50LmdldFNjcm9sbExlZnQoKVxuICAgICAgICBwb3MxID0gemVQb3MoMSlcbiAgICAgICAgZXhwZWN0KHBvczEpLnRvRXF1YWwoc3RhcnRQb3NpdGlvbilcbiAgICAgICAgZXhwZWN0KGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpKS50b0VxdWFsIFswLCAxXVxuICAgICAgICBwb3MxMCA9IHplUG9zKDEwKVxuICAgICAgICBleHBlY3QocG9zMTApLnRvRXF1YWwoc3RhcnRQb3NpdGlvbilcbiAgICAgICAgZXhwZWN0KGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpKS50b0VxdWFsIFswLCA0XVxuIl19
