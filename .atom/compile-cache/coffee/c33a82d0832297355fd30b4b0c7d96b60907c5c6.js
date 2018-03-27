(function() {
  var TextData, dispatch, getVimState, ref, settings;

  ref = require('./spec-helper'), getVimState = ref.getVimState, dispatch = ref.dispatch, TextData = ref.TextData;

  settings = require('../lib/settings');

  describe("Motion Scroll", function() {
    var editor, editorElement, ensure, keystroke, lines, n, ref1, set, text, vimState;
    ref1 = [], set = ref1[0], ensure = ref1[1], keystroke = ref1[2], editor = ref1[3], editorElement = ref1[4], vimState = ref1[5];
    lines = ((function() {
      var i, results;
      results = [];
      for (n = i = 0; i < 100; n = ++i) {
        results.push(n + " " + 'X'.repeat(10));
      }
      return results;
    })()).join("\n");
    text = new TextData(lines);
    beforeEach(function() {
      getVimState(function(state, _vim) {
        vimState = state;
        editor = vimState.editor, editorElement = vimState.editorElement;
        return set = _vim.set, ensure = _vim.ensure, keystroke = _vim.keystroke, _vim;
      });
      return runs(function() {
        jasmine.attachToDOM(editorElement);
        set({
          text: text.getRaw()
        });
        editorElement.setHeight(20 * 10);
        editorElement.style.lineHeight = "10px";
        if (editorElement.measureDimensions != null) {
          editorElement.measureDimensions();
        } else {
          atom.views.performDocumentPoll();
        }
        editorElement.setScrollTop(40 * 10);
        return set({
          cursor: [42, 0]
        });
      });
    });
    describe("the ctrl-u keybinding", function() {
      it("moves the screen down by half screen size and keeps cursor onscreen", function() {
        return ensure('ctrl-u', {
          scrollTop: 300,
          cursor: [32, 0]
        });
      });
      it("selects on visual mode", function() {
        set({
          cursor: [42, 1]
        });
        return ensure('v ctrl-u', {
          selectedText: text.getLine(32).slice(1) + text.getLines([33, 34, 35, 36, 37, 38, 39, 40, 41]) + "42"
        });
      });
      return it("selects on linewise mode", function() {
        return ensure('V ctrl-u', {
          selectedText: text.getLines([32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42])
        });
      });
    });
    describe("the ctrl-b keybinding", function() {
      it("moves screen up one page", function() {
        return ensure('ctrl-b', {
          scrollTop: 200,
          cursor: [22, 0]
        });
      });
      it("selects on visual mode", function() {
        set({
          cursor: [42, 1]
        });
        return ensure('v ctrl-b', {
          selectedText: text.getLine(22).slice(1) + text.getLines([23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41]) + "42"
        });
      });
      return it("selects on linewise mode", function() {
        return ensure('V ctrl-b', {
          selectedText: text.getLines([22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42])
        });
      });
    });
    describe("the ctrl-d keybinding", function() {
      it("moves the screen down by half screen size and keeps cursor onscreen", function() {
        return ensure('ctrl-d', {
          scrollTop: 500,
          cursor: [52, 0]
        });
      });
      it("selects on visual mode", function() {
        set({
          cursor: [42, 1]
        });
        return ensure('v ctrl-d', {
          selectedText: text.getLines([42, 43, 44, 45, 46, 47, 48, 49, 50, 51]).slice(1) + "52"
        });
      });
      return it("selects on linewise mode", function() {
        return ensure('V ctrl-d', {
          selectedText: text.getLines([42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52])
        });
      });
    });
    describe("the ctrl-f keybinding", function() {
      it("moves screen down one page", function() {
        return ensure('ctrl-f', {
          scrollTop: 600,
          cursor: [62, 0]
        });
      });
      it("selects on visual mode", function() {
        set({
          cursor: [42, 1]
        });
        return ensure('v ctrl-f', {
          selectedText: text.getLines([42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61]).slice(1) + "62"
        });
      });
      return it("selects on linewise mode", function() {
        return ensure('V ctrl-f', {
          selectedText: text.getLines([42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62])
        });
      });
    });
    return describe("ctrl-f, ctrl-b, ctrl-d, ctrl-u", function() {
      beforeEach(function() {
        settings.set('stayOnVerticalMotion', true);
        set({
          cursor: [42, 10]
        });
        return ensure({
          scrollTop: 400
        });
      });
      return it("go to row with keep column and respect cursor.goalColum", function() {
        ensure('ctrl-b', {
          scrollTop: 200,
          cursor: [22, 10]
        });
        ensure('ctrl-f', {
          scrollTop: 400,
          cursor: [42, 10]
        });
        ensure('ctrl-u', {
          scrollTop: 300,
          cursor: [32, 10]
        });
        ensure('ctrl-d', {
          scrollTop: 400,
          cursor: [42, 10]
        });
        ensure('$', {
          cursor: [42, 12]
        });
        expect(editor.getLastCursor().goalColumn).toBe(2e308);
        ensure('ctrl-b', {
          scrollTop: 200,
          cursor: [22, 12]
        });
        ensure('ctrl-b', {
          scrollTop: 0,
          cursor: [2, 11]
        });
        ensure('ctrl-f', {
          scrollTop: 200,
          cursor: [22, 12]
        });
        ensure('ctrl-f', {
          scrollTop: 400,
          cursor: [42, 12]
        });
        ensure('ctrl-u', {
          scrollTop: 300,
          cursor: [32, 12]
        });
        ensure('ctrl-d', {
          scrollTop: 400,
          cursor: [42, 12]
        });
        return expect(editor.getLastCursor().goalColumn).toBe(2e308);
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9zcGVjL21vdGlvbi1zY3JvbGwtc3BlYy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLE1BQW9DLE9BQUEsQ0FBUSxlQUFSLENBQXBDLEVBQUMsNkJBQUQsRUFBYyx1QkFBZCxFQUF3Qjs7RUFDeEIsUUFBQSxHQUFXLE9BQUEsQ0FBUSxpQkFBUjs7RUFFWCxRQUFBLENBQVMsZUFBVCxFQUEwQixTQUFBO0FBQ3hCLFFBQUE7SUFBQSxPQUE0RCxFQUE1RCxFQUFDLGFBQUQsRUFBTSxnQkFBTixFQUFjLG1CQUFkLEVBQXlCLGdCQUF6QixFQUFpQyx1QkFBakMsRUFBZ0Q7SUFDaEQsS0FBQSxHQUFROztBQUFDO1dBQWtDLDJCQUFsQztxQkFBQSxDQUFBLEdBQUksR0FBSixHQUFVLEdBQUcsQ0FBQyxNQUFKLENBQVcsRUFBWDtBQUFWOztRQUFELENBQTZDLENBQUMsSUFBOUMsQ0FBbUQsSUFBbkQ7SUFDUixJQUFBLEdBQVcsSUFBQSxRQUFBLENBQVMsS0FBVDtJQUVYLFVBQUEsQ0FBVyxTQUFBO01BQ1QsV0FBQSxDQUFZLFNBQUMsS0FBRCxFQUFRLElBQVI7UUFDVixRQUFBLEdBQVc7UUFDVix3QkFBRCxFQUFTO2VBQ1IsY0FBRCxFQUFNLG9CQUFOLEVBQWMsMEJBQWQsRUFBMkI7TUFIakIsQ0FBWjthQUtBLElBQUEsQ0FBSyxTQUFBO1FBQ0gsT0FBTyxDQUFDLFdBQVIsQ0FBb0IsYUFBcEI7UUFDQSxHQUFBLENBQUk7VUFBQSxJQUFBLEVBQU0sSUFBSSxDQUFDLE1BQUwsQ0FBQSxDQUFOO1NBQUo7UUFFQSxhQUFhLENBQUMsU0FBZCxDQUF3QixFQUFBLEdBQUssRUFBN0I7UUFDQSxhQUFhLENBQUMsS0FBSyxDQUFDLFVBQXBCLEdBQWlDO1FBRWpDLElBQUcsdUNBQUg7VUFFRSxhQUFhLENB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QWdCLE1BQUEsRUFBUSxDQUFDLEVBQUQsRUFBSyxFQUFMLENBQXhCO1NBQWpCO2VBQ0EsTUFBQSxDQUFPLE1BQU0sQ0FBQyxhQUFQLENBQUEsQ0FBc0IsQ0FBQyxVQUE5QixDQUF5QyxDQUFDLElBQTFDLENBQStDLEtBQS9DO01BYjRELENBQTlEO0lBTnlDLENBQTNDO0VBeEZ3QixDQUExQjtBQUhBIiwic291cmNlc0NvbnRlbnQiOlsie2dldFZpbVN0YXRlLCBkaXNwYXRjaCwgVGV4dERhdGF9ID0gcmVxdWlyZSAnLi9zcGVjLWhlbHBlcidcbnNldHRpbmdzID0gcmVxdWlyZSAnLi4vbGliL3NldHRpbmdzJ1xuXG5kZXNjcmliZSBcIk1vdGlvbiBTY3JvbGxcIiwgLT5cbiAgW3NldCwgZW5zdXJlLCBrZXlzdHJva2UsIGVkaXRvciwgZWRpdG9yRWxlbWVudCwgdmltU3RhdGVdID0gW11cbiAgbGluZXMgPSAobiArIFwiIFwiICsgJ1gnLnJlcGVhdCgxMCkgZm9yIG4gaW4gWzAuLi4xMDBdKS5qb2luKFwiXFxuXCIpXG4gIHRleHQgPSBuZXcgVGV4dERhdGEobGluZXMpXG5cbiAgYmVmb3JlRWFjaCAtPlxuICAgIGdldFZpbVN0YXRlIChzdGF0ZSwgX3ZpbSkgLT5cbiAgICAgIHZpbVN0YXRlID0gc3RhdGUgIyB0byByZWZlciBhcyB2aW1TdGF0ZSBsYXRlci5cbiAgICAgIHtlZGl0b3IsIGVkaXRvckVsZW1lbnR9ID0gdmltU3RhdGVcbiAgICAgIHtzZXQsIGVuc3VyZSwga2V5c3Ryb2tlfSA9IF92aW1cblxuICAgIHJ1bnMgLT5cbiAgICAgIGphc21pbmUuYXR0YWNoVG9ET00oZWRpdG9yRWxlbWVudClcbiAgICAgIHNldCB0ZXh0OiB0ZXh0LmdldFJhdygpXG5cbiAgICAgIGVkaXRvckVsZW1lbnQuc2V0SGVpZ2h0KDIwICogMTApXG4gICAgICBlZGl0b3JFbGVtZW50LnN0eWxlLmxpbmVIZWlnaHQgPSBcIjEwcHhcIlxuXG4gICAgICBpZiBlZGl0b3JFbGVtZW50Lm1lYXN1cmVEaW1lbnNpb25zP1xuICAgICAgICAjIEZvciBBdG9tLXYxLjE5XG4gICAgICAgIGVkaXRvckVsZW1lbnQubWVhc3VyZURpbWVuc2lvbnMoKVxuICAgICAgZWxzZSAjIEZvciBBdG9tLXYxLjE4XG4gICAgICAgICMgW1RPRE9dIFJlbW92ZSB3aGVuIHYuMS4xOSBiZWNvbWUgc3RhYmxlXG4gICAgICAgIGF0b20udmlld3MucGVyZm9ybURvY3VtZW50UG9sbCgpXG5cbiAgICAgIGVkaXRvckVsZW1lbnQuc2V0U2Nyb2xsVG9wKDQwICogMTApXG4gICAgICBzZXQgY3Vyc29yOiBbNDIsIDBdXG5cbiAgZGVzY3JpYmUgXCJ0aGUgY3RybC11IGtleWJpbmRpbmdcIiwgLT5cbiAgICBpdCBcIm1vdmVzIHRoZSBzY3JlZW4gZG93biBieSBoYWxmIHNjcmVlbiBzaXplIGFuZCBrZWVwcyBjdXJzb3Igb25zY3JlZW5cIiwgLT5cbiAgICAgIGVuc3VyZSAnY3RybC11JyxcbiAgICAgICAgc2Nyb2xsVG9wOiAzMDBcbiAgICAgICAgY3Vyc29yOiBbMzIsIDBdXG5cbiAgICBpdCBcInNlbGVjdHMgb24gdmlzdWFsIG1vZGVcIiwgLT5cbiAgICAgIHNldCBjdXJzb3I6IFs0MiwgMV1cbiAgICAgIGVuc3VyZSAndiBjdHJsLXUnLFxuICAgICAgICBzZWxlY3RlZFRleHQ6IHRleHQuZ2V0TGluZSgzMilbMS4uLl0gKyB0ZXh0LmdldExpbmVzKFszMy4uNDFdKSArIFwiNDJcIlxuXG4gICAgaXQgXCJzZWxlY3RzIG9uIGxpbmV3aXNlIG1vZGVcIiwgLT5cbiAgICAgIGVuc3VyZSAnViBjdHJsLXUnLFxuICAgICAgICBzZWxlY3RlZFRleHQ6IHRleHQuZ2V0TGluZXMoWzMyLi40Ml0pXG5cbiAgZGVzY3JpYmUgXCJ0aGUgY3RybC1iIGtleWJpbmRpbmdcIiwgLT5cbiAgICBpdCBcIm1vdmVzIHNjcmVlbiB1cCBvbmUgcGFnZVwiLCAtPlxuICAgICAgZW5zdXJlICdjdHJsLWInLFxuICAgICAgICBzY3JvbGxUb3A6IDIwMFxuICAgICAgICBjdXJzb3I6IFsyMiwgMF1cblxuICAgIGl0IFwic2VsZWN0cyBvbiB2aXN1YWwgbW9kZVwiLCAtPlxuICAgICAgc2V0IGN1cnNvcjogWzQyLCAxXVxuICAgICAgZW5zdXJlICd2IGN0cmwtYicsXG4gICAgICAgIHNlbGVjdGVkVGV4dDogdGV4dC5nZXRMaW5lKDIyKVsxLi4uXSArIHRleHQuZ2V0TGluZXMoWzIzLi40MV0pICsgXCI0MlwiXG5cbiAgICBpdCBcInNlbGVjdHMgb24gbGluZXdpc2UgbW9kZVwiLCAtPlxuICAgICAgZW5zdXJlICdWIGN0cmwtYicsXG4gICAgICAgIHNlbGVjdGVkVGV4dDogdGV4dC5nZXRMaW5lcyhbMjIuLjQyXSlcblxuICBkZXNjcmliZSBcInRoZSBjdHJsLWQga2V5YmluZGluZ1wiLCAtPlxuICAgIGl0IFwibW92ZXMgdGhlIHNjcmVlbiBkb3duIGJ5IGhhbGYgc2NyZWVuIHNpemUgYW5kIGtlZXBzIGN1cnNvciBvbnNjcmVlblwiLCAtPlxuICAgICAgZW5zdXJlICdjdHJsLWQnLFxuICAgICAgICBzY3JvbGxUb3A6IDUwMFxuICAgICAgICBjdXJzb3I6IFs1MiwgMF1cblxuICAgIGl0IFwic2VsZWN0cyBvbiB2aXN1YWwgbW9kZVwiLCAtPlxuICAgICAgc2V0IGN1cnNvcjogWzQyLCAxXVxuICAgICAgZW5zdXJlICd2IGN0cmwtZCcsXG4gICAgICAgIHNlbGVjdGVkVGV4dDogdGV4dC5nZXRMaW5lcyhbNDIuLjUxXSkuc2xpY2UoMSkgKyBcIjUyXCJcblxuICAgIGl0IFwic2VsZWN0cyBvbiBsaW5ld2lzZSBtb2RlXCIsIC0+XG4gICAgICBlbnN1cmUgJ1YgY3RybC1kJyxcbiAgICAgICAgc2VsZWN0ZWRUZXh0OiB0ZXh0LmdldExpbmVzKFs0Mi4uNTJdKVxuXG4gIGRlc2NyaWJlIFwidGhlIGN0cmwtZiBrZXliaW5kaW5nXCIsIC0+XG4gICAgaXQgXCJtb3ZlcyBzY3JlZW4gZG93biBvbmUgcGFnZVwiLCAtPlxuICAgICAgZW5zdXJlICdjdHJsLWYnLFxuICAgICAgICBzY3JvbGxUb3A6IDYwMFxuICAgICAgICBjdXJzb3I6IFs2MiwgMF1cblxuICAgIGl0IFwic2VsZWN0cyBvbiB2aXN1YWwgbW9kZVwiLCAtPlxuICAgICAgc2V0IGN1cnNvcjogWzQyLCAxXVxuICAgICAgZW5zdXJlICd2IGN0cmwtZicsXG4gICAgICAgIHNlbGVjdGVkVGV4dDogdGV4dC5nZXRMaW5lcyhbNDIuLjYxXSkuc2xpY2UoMSkgKyBcIjYyXCJcblxuICAgIGl0IFwic2VsZWN0cyBvbiBsaW5ld2lzZSBtb2RlXCIsIC0+XG4gICAgICBlbnN1cmUgJ1YgY3RybC1mJyxcbiAgICAgICAgc2VsZWN0ZWRUZXh0OiB0ZXh0LmdldExpbmVzKFs0Mi4uNjJdKVxuXG4gIGRlc2NyaWJlIFwiY3RybC1mLCBjdHJsLWIsIGN0cmwtZCwgY3RybC11XCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2V0dGluZ3Muc2V0KCdzdGF5T25WZXJ0aWNhbE1vdGlvbicsIHRydWUpXG4gICAgICBzZXQgY3Vyc29yOiBbNDIsIDEwXVxuICAgICAgZW5zdXJlIHNjcm9sbFRvcDogNDAwXG5cbiAgICBpdCBcImdvIHRvIHJvdyB3aXRoIGtlZXAgY29sdW1uIGFuZCByZXNwZWN0IGN1cnNvci5nb2FsQ29sdW1cIiwgLT5cbiAgICAgIGVuc3VyZSAnY3RybC1iJywgc2Nyb2xsVG9wOiAyMDAsIGN1cnNvcjogWzIyLCAxMF1cbiAgICAgIGVuc3VyZSAnY3RybC1mJywgc2Nyb2xsVG9wOiA0MDAsIGN1cnNvcjogWzQyLCAxMF1cbiAgICAgIGVuc3VyZSAnY3RybC11Jywgc2Nyb2xsVG9wOiAzMDAsIGN1cnNvcjogWzMyLCAxMF1cbiAgICAgIGVuc3VyZSAnY3RybC1kJywgc2Nyb2xsVG9wOiA0MDAsIGN1cnNvcjogWzQyLCAxMF1cbiAgICAgIGVuc3VyZSAnJCcsIGN1cnNvcjogWzQyLCAxMl1cbiAgICAgIGV4cGVjdChlZGl0b3IuZ2V0TGFzdEN1cnNvcigpLmdvYWxDb2x1bW4pLnRvQmUoSW5maW5pdHkpXG4gICAgICBlbnN1cmUgJ2N0cmwtYicsIHNjcm9sbFRvcDogMjAwLCBjdXJzb3I6IFsyMiwgMTJdXG4gICAgICBlbnN1cmUgJ2N0cmwtYicsIHNjcm9sbFRvcDogICAwLCBjdXJzb3I6IFsgMiwgMTFdXG4gICAgICBlbnN1cmUgJ2N0cmwtZicsIHNjcm9sbFRvcDogMjAwLCBjdXJzb3I6IFsyMiwgMTJdXG4gICAgICBlbnN1cmUgJ2N0cmwtZicsIHNjcm9sbFRvcDogNDAwLCBjdXJzb3I6IFs0MiwgMTJdXG4gICAgICBlbnN1cmUgJ2N0cmwtdScsIHNjcm9sbFRvcDogMzAwLCBjdXJzb3I6IFszMiwgMTJdXG4gICAgICBlbnN1cmUgJ2N0cmwtZCcsIHNjcm9sbFRvcDogNDAwLCBjdXJzb3I6IFs0MiwgMTJdXG4gICAgICBleHBlY3QoZWRpdG9yLmdldExhc3RDdXJzb3IoKS5nb2FsQ29sdW1uKS50b0JlKEluZmluaXR5KVxuIl19
