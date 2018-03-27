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
        editor.setLineHeightInPixels(10);
        editorElement.setHeight(50);
        atom.views.performDocumentPoll();
        set({
          cursor: [1, 2],
          text: "100\n200\n300\n400\n500\n600\n700\n800\n900\n1000"
        });
        return expect(editorElement.getVisibleRowRange()).toEqual([0, 4]);
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
        editorElement.component.sampleFontStyling();
        editorElement.setHeight(20 * 10);
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
        atom.views.performDocumentPoll();
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9zcGVjL3Njcm9sbC1zcGVjLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUMsY0FBZSxPQUFBLENBQVEsZUFBUjs7RUFFaEIsUUFBQSxDQUFTLFdBQVQsRUFBc0IsU0FBQTtBQUNwQixRQUFBO0lBQUEsTUFBNEQsRUFBNUQsRUFBQyxZQUFELEVBQU0sZUFBTixFQUFjLGtCQUFkLEVBQXlCLGVBQXpCLEVBQWlDLHNCQUFqQyxFQUFnRDtJQUVoRCxVQUFBLENBQVcsU0FBQTthQUNULFdBQUEsQ0FBWSxTQUFDLEtBQUQsRUFBUSxHQUFSO1FBQ1YsUUFBQSxHQUFXO1FBQ1Ysd0JBQUQsRUFBUztRQUNSLGFBQUQsRUFBTSxtQkFBTixFQUFjO2VBQ2QsT0FBTyxDQUFDLFdBQVIsQ0FBb0IsYUFBcEI7TUFKVSxDQUFaO0lBRFMsQ0FBWDtJQU9BLFFBQUEsQ0FBUyx1QkFBVCxFQUFrQyxTQUFBO01BQ2hDLFVBQUEsQ0FBVyxTQUFBO1FBQ1QsTUFBTSxDQUFDLHFCQUFQLENBQTZCLEVBQTdCO1FBQ0EsYUFBYSxDQUFDLFNBQWQsQ0FBd0IsRUFBeEI7UUFDQSxJQUFJLENBQUMsS0FBSyxDQUFDLG1CQUFYLENBQUE7UUFDQSxHQUFBLENBQ0U7VUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO1VBQ0EsSUFBQSxFQUFNLG1EQUROO1NBREY7ZUFjQSxNQUFBLENBQU8sYUFBYSxDQUFDLGtCQUFkLENBQUEsQ0FBUCxDQUEwQyxDQUFDLE9BQTNDLENBQW1ELENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBbkQ7TUFsQlMsQ0FBWDthQW9CQSxRQUFBLENBQVMsbUNBQVQsRUFBOEMsU0FBQTtlQUM1QyxFQUFBLENBQUcsK0RBQUgsRUFBb0UsU0FBQTtVQUNsRSxNQUFBLENBQU8sUUFBUCxFQUFp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ZixDQUE0QixNQUE1QjtVQUNBLE1BQUEsQ0FBTyxNQUFNLENBQUMsdUJBQVAsQ0FBQSxDQUFQLENBQXdDLENBQUMsT0FBekMsQ0FBaUQsQ0FBQyxDQUFELEVBQUksR0FBSixDQUFqRDtVQUVBLE1BQUEsR0FBUyxLQUFBLENBQU0sR0FBTjtVQUNULE1BQUEsQ0FBTyxNQUFQLENBQWMsQ0FBQyxZQUFmLENBQTRCLE1BQTVCO1VBRUEsTUFBQSxHQUFTLEtBQUEsQ0FBTSxHQUFOO2lCQUNULE1BQUEsQ0FBTyxNQUFBLEdBQVMsTUFBaEIsQ0FBdUIsQ0FBQyxPQUF4QixDQUFnQyxFQUFoQztRQVpvRCxDQUF0RDtlQWNBLEVBQUEsQ0FBRyxxQ0FBSCxFQUEwQyxTQUFBO0FBQ3hDLGNBQUE7VUFBQSxNQUFNLENBQUMsT0FBUCxDQUFlLE9BQWY7VUFDQSxhQUFBLEdBQWdCLGFBQWEsQ0FBQyxhQUFkLENBQUE7VUFDaEIsSUFBQSxHQUFPLEtBQUEsQ0FBTSxDQUFOO1VBQ1AsTUFBQSxDQUFPLElBQVAsQ0FBWSxDQUFDLE9BQWIsQ0FBcUIsYUFBckI7VUFDQSxNQUFBLENBQU8sTUFBTSxDQUFDLHVCQUFQLENBQUEsQ0FBUCxDQUF3QyxDQUFDLE9BQXpDLENBQWlELENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBakQ7VUFDQSxLQUFBLEdBQVEsS0FBQSxDQUFNLEVBQU47VUFDUixNQUFBLENBQU8sS0FBUCxDQUFhLENBQUMsT0FBZCxDQUFzQixhQUF0QjtpQkFDQSxNQUFBLENBQU8sTUFBTSxDQUFDLHVCQUFQLENBQUEsQ0FBUCxDQUF3QyxDQUFDLE9BQXpDLENBQWlELENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBakQ7UUFSd0MsQ0FBMUM7TUF4QzRCLENBQTlCO0lBeEQrQyxDQUFqRDtFQTdGb0IsQ0FBdEI7QUFGQSIsInNvdXJjZXNDb250ZW50IjpbIntnZXRWaW1TdGF0ZX0gPSByZXF1aXJlICcuL3NwZWMtaGVscGVyJ1xuXG5kZXNjcmliZSBcIlNjcm9sbGluZ1wiLCAtPlxuICBbc2V0LCBlbnN1cmUsIGtleXN0cm9rZSwgZWRpdG9yLCBlZGl0b3JFbGVtZW50LCB2aW1TdGF0ZV0gPSBbXVxuXG4gIGJlZm9yZUVhY2ggLT5cbiAgICBnZXRWaW1TdGF0ZSAoc3RhdGUsIHZpbSkgLT5cbiAgICAgIHZpbVN0YXRlID0gc3RhdGVcbiAgICAgIHtlZGl0b3IsIGVkaXRvckVsZW1lbnR9ID0gdmltU3RhdGVcbiAgICAgIHtzZXQsIGVuc3VyZSwga2V5c3Ryb2tlfSA9IHZpbVxuICAgICAgamFzbWluZS5hdHRhY2hUb0RPTShlZGl0b3JFbGVtZW50KVxuXG4gIGRlc2NyaWJlIFwic2Nyb2xsaW5nIGtleWJpbmRpbmdzXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgZWRpdG9yLnNldExpbmVIZWlnaHRJblBpeGVscygxMClcbiAgICAgIGVkaXRvckVsZW1lbnQuc2V0SGVpZ2h0KDUwKVxuICAgICAgYXRvbS52aWV3cy5wZXJmb3JtRG9jdW1lbnRQb2xsKClcbiAgICAgIHNldFxuICAgICAgICBjdXJzb3I6IFsxLCAyXVxuICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAxMDBcbiAgICAgICAgICAyMDBcbiAgICAgICAgICAzMDBcbiAgICAgICAgICA0MDBcbiAgICAgICAgICA1MDBcbiAgICAgICAgICA2MDBcbiAgICAgICAgICA3MDBcbiAgICAgICAgICA4MDBcbiAgICAgICAgICA5MDBcbiAgICAgICAgICAxMDAwXG4gICAgICAgIFwiXCJcIlxuICAgICAgZXhwZWN0KGVkaXRvckVsZW1lbnQuZ2V0VmlzaWJsZVJvd1JhbmdlKCkpLnRvRXF1YWwgWzAsIDRdXG5cbiAgICBkZXNjcmliZSBcInRoZSBjdHJsLWUgYW5kIGN0cmwteSBrZXliaW5kaW5nc1wiLCAtPlxuICAgICAgaXQgXCJtb3ZlcyB0aGUgc2NyZWVuIHVwIGFuZCBkb3duIGJ5IG9uZSBhbmQga2VlcHMgY3Vyc29yIG9uc2NyZWVuXCIsIC0+XG4gICAgICAgIGVuc3VyZSAnY3RybC1lJywgY3Vyc29yOiBbMiwgMl1cbiAgICAgICAgZXhwZWN0KGVkaXRvci5nZXRGaXJzdFZpc2libGVTY3JlZW5Sb3coKSkudG9CZSAxXG4gICAgICAgIGV4cGVjdChlZGl0b3IuZ2V0TGFzdFZpc2libGVTY3JlZW5Sb3coKSkudG9CZSA2XG5cbiAgICAgICAgZW5zdXJlICcyIGN0cmwtZScsIGN1cnNvcjogWzQsIDJdXG4gICAgICAgIGV4cGVjdChlZGl0b3IuZ2V0Rmlyc3RWaXNpYmxlU2NyZWVuUm93KCkpLnRvQmUgM1xuICAgICAgICBleHBlY3QoZWRpdG9yLmdldExhc3RWaXNpYmxlU2NyZWVuUm93KCkpLnRvQmUgOFxuXG4gICAgICAgIGVuc3VyZSAnMiBjdHJsLXknLCBjdXJzb3I6IFsyLCAyXVxuICAgICAgICBleHBlY3QoZWRpdG9yLmdldEZpcnN0VmlzaWJsZVNjcmVlblJvdygpKS50b0JlIDFcbiAgICAgICAgZXhwZWN0KGVkaXRvci5nZXRMYXN0VmlzaWJsZVNjcmVlblJvdygpKS50b0JlIDZcblxuICBkZXNjcmliZSBcInNjcm9sbCBjdXJzb3Iga2V5YmluZGluZ3NcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBlZGl0b3Iuc2V0VGV4dCBbMS4uMjAwXS5qb2luKFwiXFxuXCIpXG4gICAgICBlZGl0b3JFbGVtZW50LnN0eWxlLmxpbmVIZWlnaHQgPSBcIjIwcHhcIlxuICAgICAgZWRpdG9yRWxlbWVudC5jb21wb25lbnQuc2FtcGxlRm9udFN0eWxpbmcoKVxuICAgICAgZWRpdG9yRWxlbWVudC5zZXRIZWlnaHQoMjAgKiAxMClcbiAgICAgIHNweU9uKGVkaXRvciwgJ21vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lJylcbiAgICAgIHNweU9uKGVkaXRvckVsZW1lbnQsICdzZXRTY3JvbGxUb3AnKVxuICAgICAgc3B5T24oZWRpdG9yRWxlbWVudCwgJ2dldEZpcnN0VmlzaWJsZVNjcmVlblJvdycpLmFuZFJldHVybig5MClcbiAgICAgIHNweU9uKGVkaXRvckVsZW1lbnQsICdnZXRMYXN0VmlzaWJsZVNjcmVlblJvdycpLmFuZFJldHVybigxMTApXG4gICAgICBzcHlPbihlZGl0b3JFbGVtZW50LCAncGl4ZWxQb3NpdGlvbkZvclNjcmVlblBvc2l0aW9uJykuYW5kUmV0dXJuKHt0b3A6IDEwMDAsIGxlZnQ6IDB9KVxuXG4gICAgZGVzY3JpYmUgXCJ0aGUgejxDUj4ga2V5YmluZGluZ1wiLCAtPlxuICAgICAgaXQgXCJtb3ZlcyB0aGUgc2NyZWVuIHRvIHBvc2l0aW9uIGN1cnNvciBhdCB0aGUgdG9wIG9mIHRoZSB3aW5kb3cgYW5kIG1vdmVzIGN1cnNvciB0byBmaXJzdCBub24tYmxhbmsgaW4gdGhlIGxpbmVcIiwgLT5cbiAgICAgICAga2V5c3Ryb2tlICd6IGVudGVyJ1xuICAgICAgICBleHBlY3QoZWRpdG9yRWxlbWVudC5zZXRTY3JvbGxUb3ApLnRvSGF2ZUJlZW5DYWxsZWRXaXRoKDk2MClcbiAgICAgICAgZXhwZWN0KGVkaXRvci5tb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZSkudG9IYXZlQmVlbkNhbGxlZCgpXG5cbiAgICBkZXNjcmliZSBcInRoZSB6dCBrZXliaW5kaW5nXCIsIC0+XG4gICAgICBpdCBcIm1vdmVzIHRoZSBzY3JlZW4gdG8gcG9zaXRpb24gY3Vyc29yIGF0IHRoZSB0b3Agb2YgdGhlIHdpbmRvdyBhbmQgbGVhdmUgY3Vyc29yIGluIHRoZSBzYW1lIGNvbHVtblwiLCAtPlxuICAgICAgICBrZXlzdHJva2UgJ3ogdCdcbiAgICAgICAgZXhwZWN0KGVkaXRvckVsZW1lbnQuc2V0U2Nyb2xsVG9wKS50b0hhdmVCZWVuQ2FsbGVkV2l0aCg5NjApXG4gICAgICAgIGV4cGVjdChlZGl0b3IubW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmUpLm5vdC50b0hhdmVCZWVuQ2FsbGVkKClcblxuICAgIGRlc2NyaWJlIFwidGhlIHouIGtleWJpbmRpbmdcIiwgLT5cbiAgICAgIGl0IFwibW92ZXMgdGhlIHNjcmVlbiB0byBwb3NpdGlvbiBjdXJzb3IgYXQgdGhlIGNlbnRlciBvZiB0aGUgd2luZG93IGFuZCBtb3ZlcyBjdXJzb3IgdG8gZmlyc3Qgbm9uLWJsYW5rIGluIHRoZSBsaW5lXCIsIC0+XG4gICAgICAgIGtleXN0cm9rZSAneiAuJ1xuICAgICAgICBleHBlY3QoZWRpdG9yRWxlbWVudC5zZXRTY3JvbGxUb3ApLnRvSGF2ZUJlZW5DYWxsZWRXaXRoKDkwMClcbiAgICAgICAgZXhwZWN0KGVkaXRvci5tb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZSkudG9IYXZlQmVlbkNhbGxlZCgpXG5cbiAgICBkZXNjcmliZSBcInRoZSB6eiBrZXliaW5kaW5nXCIsIC0+XG4gICAgICBpdCBcIm1vdmVzIHRoZSBzY3JlZW4gdG8gcG9zaXRpb24gY3Vyc29yIGF0IHRoZSBjZW50ZXIgb2YgdGhlIHdpbmRvdyBhbmQgbGVhdmUgY3Vyc29yIGluIHRoZSBzYW1lIGNvbHVtblwiLCAtPlxuICAgICAgICBrZXlzdHJva2UgJ3ogeidcbiAgICAgICAgZXhwZWN0KGVkaXRvckVsZW1lbnQuc2V0U2Nyb2xsVG9wKS50b0hhdmVCZWVuQ2FsbGVkV2l0aCg5MDApXG4gICAgICAgIGV4cGVjdChlZGl0b3IubW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmUpLm5vdC50b0hhdmVCZWVuQ2FsbGVkKClcblxuICAgIGRlc2NyaWJlIFwidGhlIHotIGtleWJpbmRpbmdcIiwgLT5cbiAgICAgIGl0IFwibW92ZXMgdGhlIHNjcmVlbiB0byBwb3NpdGlvbiBjdXJzb3IgYXQgdGhlIGJvdHRvbSBvZiB0aGUgd2luZG93IGFuZCBtb3ZlcyBjdXJzb3IgdG8gZmlyc3Qgbm9uLWJsYW5rIGluIHRoZSBsaW5lXCIsIC0+XG4gICAgICAgIGtleXN0cm9rZSAneiAtJ1xuICAgICAgICBleHBlY3QoZWRpdG9yRWxlbWVudC5zZXRTY3JvbGxUb3ApLnRvSGF2ZUJlZW5DYWxsZWRXaXRoKDg2MClcbiAgICAgICAgZXhwZWN0KGVkaXRvci5tb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZSkudG9IYXZlQmVlbkNhbGxlZCgpXG5cbiAgICBkZXNjcmliZSBcInRoZSB6YiBrZXliaW5kaW5nXCIsIC0+XG4gICAgICBpdCBcIm1vdmVzIHRoZSBzY3JlZW4gdG8gcG9zaXRpb24gY3Vyc29yIGF0IHRoZSBib3R0b20gb2YgdGhlIHdpbmRvdyBhbmQgbGVhdmUgY3Vyc29yIGluIHRoZSBzYW1lIGNvbHVtblwiLCAtPlxuICAgICAgICBrZXlzdHJva2UgJ3ogYidcbiAgICAgICAgZXhwZWN0KGVkaXRvckVsZW1lbnQuc2V0U2Nyb2xsVG9wKS50b0hhdmVCZWVuQ2FsbGVkV2l0aCg4NjApXG4gICAgICAgIGV4cGVjdChlZGl0b3IubW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmUpLm5vdC50b0hhdmVCZWVuQ2FsbGVkKClcblxuICBkZXNjcmliZSBcImhvcml6b250YWwgc2Nyb2xsIGN1cnNvciBrZXliaW5kaW5nc1wiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIGVkaXRvckVsZW1lbnQuc2V0V2lkdGgoNjAwKVxuICAgICAgZWRpdG9yRWxlbWVudC5zZXRIZWlnaHQoNjAwKVxuICAgICAgZWRpdG9yRWxlbWVudC5zdHlsZS5saW5lSGVpZ2h0ID0gXCIxMHB4XCJcbiAgICAgIGVkaXRvckVsZW1lbnQuc3R5bGUuZm9udCA9IFwiMTZweCBtb25vc3BhY2VcIlxuICAgICAgYXRvbS52aWV3cy5wZXJmb3JtRG9jdW1lbnRQb2xsKClcbiAgICAgIHRleHQgPSBcIlwiXG4gICAgICBmb3IgaSBpbiBbMTAwLi4xOTldXG4gICAgICAgIHRleHQgKz0gXCIje2l9IFwiXG4gICAgICBlZGl0b3Iuc2V0VGV4dCh0ZXh0KVxuICAgICAgZWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKFswLCAwXSlcblxuICAgIGRlc2NyaWJlIFwidGhlIHpzIGtleWJpbmRpbmdcIiwgLT5cbiAgICAgIHpzUG9zID0gKHBvcykgLT5cbiAgICAgICAgZWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKFswLCBwb3NdKVxuICAgICAgICBrZXlzdHJva2UgJ3ogcydcbiAgICAgICAgZWRpdG9yRWxlbWVudC5nZXRTY3JvbGxMZWZ0KClcblxuICAgICAgc3RhcnRQb3NpdGlvbiA9IE5hTlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzdGFydFBvc2l0aW9uID0gZWRpdG9yRWxlbWVudC5nZXRTY3JvbGxMZWZ0KClcblxuICAgICAgIyBGSVhNRTogcmVtb3ZlIGluIGZ1dHVyZVxuICAgICAgeGl0IFwiZG9lcyBub3RoaW5nIG5lYXIgdGhlIHN0YXJ0IG9mIHRoZSBsaW5lXCIsIC0+XG4gICAgICAgIHBvczEgPSB6c1BvcygxKVxuICAgICAgICBleHBlY3QocG9zMSkudG9FcXVhbChzdGFydFBvc2l0aW9uKVxuXG4gICAgICBpdCBcIm1vdmVzIHRoZSBjdXJzb3IgdGhlIG5lYXJlc3QgaXQgY2FuIHRvIHRoZSBsZWZ0IGVkZ2Ugb2YgdGhlIGVkaXRvclwiLCAtPlxuICAgICAgICBwb3MxMCA9IHpzUG9zKDEwKVxuICAgICAgICBleHBlY3QocG9zMTApLnRvQmVHcmVhdGVyVGhhbihzdGFydFBvc2l0aW9uKVxuXG4gICAgICAgIHBvczExID0genNQb3MoMTEpXG4gICAgICAgIGV4cGVjdChwb3MxMSAtIHBvczEwKS50b0VxdWFsKDEwKVxuXG4gICAgICBpdCBcImRvZXMgbm90aGluZyBuZWFyIHRoZSBlbmQgb2YgdGhlIGxpbmVcIiwgLT5cbiAgICAgICAgcG9zRW5kID0genNQb3MoMzk5KVxuICAgICAgICBleHBlY3QoZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCkpLnRvRXF1YWwgWzAsIDM5OV1cblxuICAgICAgICBwb3MzOTAgPSB6c1BvcygzOTApXG4gICAgICAgIGV4cGVjdChwb3MzOTApLnRvRXF1YWwocG9zRW5kKVxuICAgICAgICBleHBlY3QoZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCkpLnRvRXF1YWwgWzAsIDM5MF1cblxuICAgICAgICBwb3MzNDAgPSB6c1BvcygzNDApXG4gICAgICAgIGV4cGVjdChwb3MzNDApLnRvRXF1YWwocG9zRW5kKVxuXG4gICAgICBpdCBcImRvZXMgbm90aGluZyBpZiBhbGwgbGluZXMgYXJlIHNob3J0XCIsIC0+XG4gICAgICAgIGVkaXRvci5zZXRUZXh0KCdzaG9ydCcpXG4gICAgICAgIHN0YXJ0UG9zaXRpb24gPSBlZGl0b3JFbGVtZW50LmdldFNjcm9sbExlZnQoKVxuICAgICAgICBwb3MxID0genNQb3MoMSlcbiAgICAgICAgZXhwZWN0KHBvczEpLnRvRXF1YWwoc3RhcnRQb3NpdGlvbilcbiAgICAgICAgZXhwZWN0KGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpKS50b0VxdWFsIFswLCAxXVxuICAgICAgICBwb3MxMCA9IHpzUG9zKDEwKVxuICAgICAgICBleHBlY3QocG9zMTApLnRvRXF1YWwoc3RhcnRQb3NpdGlvbilcbiAgICAgICAgZXhwZWN0KGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpKS50b0VxdWFsIFswLCA0XVxuXG4gICAgZGVzY3JpYmUgXCJ0aGUgemUga2V5YmluZGluZ1wiLCAtPlxuICAgICAgemVQb3MgPSAocG9zKSAtPlxuICAgICAgICBlZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oWzAsIHBvc10pXG4gICAgICAgIGtleXN0cm9rZSAneiBlJ1xuICAgICAgICBlZGl0b3JFbGVtZW50LmdldFNjcm9sbExlZnQoKVxuXG4gICAgICBzdGFydFBvc2l0aW9uID0gTmFOXG5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc3RhcnRQb3NpdGlvbiA9IGVkaXRvckVsZW1lbnQuZ2V0U2Nyb2xsTGVmdCgpXG5cbiAgICAgIGl0IFwiZG9lcyBub3RoaW5nIG5lYXIgdGhlIHN0YXJ0IG9mIHRoZSBsaW5lXCIsIC0+XG4gICAgICAgIHBvczEgPSB6ZVBvcygxKVxuICAgICAgICBleHBlY3QocG9zMSkudG9FcXVhbChzdGFydFBvc2l0aW9uKVxuXG4gICAgICAgIHBvczQwID0gemVQb3MoNDApXG4gICAgICAgIGV4cGVjdChwb3M0MCkudG9FcXVhbChzdGFydFBvc2l0aW9uKVxuXG4gICAgICBpdCBcIm1vdmVzIHRoZSBjdXJzb3IgdGhlIG5lYXJlc3QgaXQgY2FuIHRvIHRoZSByaWdodCBlZGdlIG9mIHRoZSBlZGl0b3JcIiwgLT5cbiAgICAgICAgcG9zMTEwID0gemVQb3MoMTEwKVxuICAgICAgICBleHBlY3QocG9zMTEwKS50b0JlR3JlYXRlclRoYW4oc3RhcnRQb3NpdGlvbilcblxuICAgICAgICBwb3MxMDkgPSB6ZVBvcygxMDkpXG4gICAgICAgIGV4cGVjdChwb3MxMTAgLSBwb3MxMDkpLnRvRXF1YWwoOSlcblxuICAgICAgIyBGSVhNRSBkZXNjcmlwdGlvbiBpcyBubyBsb25nZXIgYXBwcm9wcmlhdGVcbiAgICAgIGl0IFwiZG9lcyBub3RoaW5nIHdoZW4gdmVyeSBuZWFyIHRoZSBlbmQgb2YgdGhlIGxpbmVcIiwgLT5cbiAgICAgICAgcG9zRW5kID0gemVQb3MoMzk5KVxuICAgICAgICBleHBlY3QoZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCkpLnRvRXF1YWwgWzAsIDM5OV1cblxuICAgICAgICBwb3MzOTcgPSB6ZVBvcygzOTcpXG4gICAgICAgIGV4cGVjdChwb3MzOTcpLnRvQmVMZXNzVGhhbihwb3NFbmQpXG4gICAgICAgIGV4cGVjdChlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKSkudG9FcXVhbCBbMCwgMzk3XVxuXG4gICAgICAgIHBvczM4MCA9IHplUG9zKDM4MClcbiAgICAgICAgZXhwZWN0KHBvczM4MCkudG9CZUxlc3NUaGFuKHBvc0VuZClcblxuICAgICAgICBwb3MzODIgPSB6ZVBvcygzODIpXG4gICAgICAgIGV4cGVjdChwb3MzODIgLSBwb3MzODApLnRvRXF1YWwoMTkpXG5cbiAgICAgIGl0IFwiZG9lcyBub3RoaW5nIGlmIGFsbCBsaW5lcyBhcmUgc2hvcnRcIiwgLT5cbiAgICAgICAgZWRpdG9yLnNldFRleHQoJ3Nob3J0JylcbiAgICAgICAgc3RhcnRQb3NpdGlvbiA9IGVkaXRvckVsZW1lbnQuZ2V0U2Nyb2xsTGVmdCgpXG4gICAgICAgIHBvczEgPSB6ZVBvcygxKVxuICAgICAgICBleHBlY3QocG9zMSkudG9FcXVhbChzdGFydFBvc2l0aW9uKVxuICAgICAgICBleHBlY3QoZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCkpLnRvRXF1YWwgWzAsIDFdXG4gICAgICAgIHBvczEwID0gemVQb3MoMTApXG4gICAgICAgIGV4cGVjdChwb3MxMCkudG9FcXVhbChzdGFydFBvc2l0aW9uKVxuICAgICAgICBleHBlY3QoZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCkpLnRvRXF1YWwgWzAsIDRdXG4iXX0=
