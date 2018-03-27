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
          selectedText: text.getLines([32, 33, 34, 35, 36, 37, 38, 39, 40, 41]) + "42"
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
          selectedText: text.getLines([22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41]) + "42"
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
          selectedText: text.getLines([42, 43, 44, 45, 46, 47, 48, 49, 50, 51]).slice(1) + "5"
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
          selectedText: text.getLines([42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61]).slice(1) + "6"
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
        settings.set('moveToFirstCharacterOnVerticalMotion', false);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9zcGVjL21vdGlvbi1zY3JvbGwtc3BlYy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLE1BQW9DLE9BQUEsQ0FBUSxlQUFSLENBQXBDLEVBQUMsNkJBQUQsRUFBYyx1QkFBZCxFQUF3Qjs7RUFDeEIsUUFBQSxHQUFXLE9BQUEsQ0FBUSxpQkFBUjs7RUFFWCxRQUFBLENBQVMsZUFBVCxFQUEwQixTQUFBO0FBQ3hCLFFBQUE7SUFBQSxPQUE0RCxFQUE1RCxFQUFDLGFBQUQsRUFBTSxnQkFBTixFQUFjLG1CQUFkLEVBQXlCLGdCQUF6QixFQUFpQyx1QkFBakMsRUFBZ0Q7SUFDaEQsS0FBQSxHQUFROztBQUFDO1dBQWtDLDJCQUFsQztxQkFBQSxDQUFBLEdBQUksR0FBSixHQUFVLEdBQUcsQ0FBQyxNQUFKLENBQVcsRUFBWDtBQUFWOztRQUFELENBQTZDLENBQUMsSUFBOUMsQ0FBbUQsSUFBbkQ7SUFDUixJQUFBLEdBQVcsSUFBQSxRQUFBLENBQVMsS0FBVDtJQUVYLFVBQUEsQ0FBVyxTQUFBO01BQ1QsV0FBQSxDQUFZLFNBQUMsS0FBRCxFQUFRLElBQVI7UUFDVixRQUFBLEdBQVc7UUFDVix3QkFBRCxFQUFTO2VBQ1IsY0FBRCxFQUFNLG9CQUFOLEVBQWMsMEJBQWQsRUFBMkI7TUFIakIsQ0FBWjthQUtBLElBQUEsQ0FBSyxTQUFBO1FBQ0gsT0FBTyxDQUFDLFdBQVIsQ0FBb0IsYUFBcEI7UUFDQSxHQUFBLENBQUk7VUFBQSxJQUFBLEVBQU0sSUFBSSxDQUFDLE1BQUwsQ0FBQSxDQUFOO1NBQUo7UUFFQSxhQUFhLENBQUMsU0FBZCxDQUF3QixFQUFBLEdBQUssRUFBN0I7UUFDQSxhQUFhLENBQUMsS0FBSyxDQUFDLFVBQXBCLEdBQWlDO1FBRWpDLElBQUcsdUNBQUg7VUFFRSxhQUFhLENB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QUFDLFVBQTlCLENBQXlDLENBQUMsSUFBMUMsQ0FBK0MsS0FBL0M7TUFiNEQsQ0FBOUQ7SUFOeUMsQ0FBM0M7RUF4RndCLENBQTFCO0FBSEEiLCJzb3VyY2VzQ29udGVudCI6WyJ7Z2V0VmltU3RhdGUsIGRpc3BhdGNoLCBUZXh0RGF0YX0gPSByZXF1aXJlICcuL3NwZWMtaGVscGVyJ1xuc2V0dGluZ3MgPSByZXF1aXJlICcuLi9saWIvc2V0dGluZ3MnXG5cbmRlc2NyaWJlIFwiTW90aW9uIFNjcm9sbFwiLCAtPlxuICBbc2V0LCBlbnN1cmUsIGtleXN0cm9rZSwgZWRpdG9yLCBlZGl0b3JFbGVtZW50LCB2aW1TdGF0ZV0gPSBbXVxuICBsaW5lcyA9IChuICsgXCIgXCIgKyAnWCcucmVwZWF0KDEwKSBmb3IgbiBpbiBbMC4uLjEwMF0pLmpvaW4oXCJcXG5cIilcbiAgdGV4dCA9IG5ldyBUZXh0RGF0YShsaW5lcylcblxuICBiZWZvcmVFYWNoIC0+XG4gICAgZ2V0VmltU3RhdGUgKHN0YXRlLCBfdmltKSAtPlxuICAgICAgdmltU3RhdGUgPSBzdGF0ZSAjIHRvIHJlZmVyIGFzIHZpbVN0YXRlIGxhdGVyLlxuICAgICAge2VkaXRvciwgZWRpdG9yRWxlbWVudH0gPSB2aW1TdGF0ZVxuICAgICAge3NldCwgZW5zdXJlLCBrZXlzdHJva2V9ID0gX3ZpbVxuXG4gICAgcnVucyAtPlxuICAgICAgamFzbWluZS5hdHRhY2hUb0RPTShlZGl0b3JFbGVtZW50KVxuICAgICAgc2V0IHRleHQ6IHRleHQuZ2V0UmF3KClcblxuICAgICAgZWRpdG9yRWxlbWVudC5zZXRIZWlnaHQoMjAgKiAxMClcbiAgICAgIGVkaXRvckVsZW1lbnQuc3R5bGUubGluZUhlaWdodCA9IFwiMTBweFwiXG5cbiAgICAgIGlmIGVkaXRvckVsZW1lbnQubWVhc3VyZURpbWVuc2lvbnM/XG4gICAgICAgICMgRm9yIEF0b20tdjEuMTlcbiAgICAgICAgZWRpdG9yRWxlbWVudC5tZWFzdXJlRGltZW5zaW9ucygpXG4gICAgICBlbHNlICMgRm9yIEF0b20tdjEuMThcbiAgICAgICAgIyBbVE9ET10gUmVtb3ZlIHdoZW4gdi4xLjE5IGJlY29tZSBzdGFibGVcbiAgICAgICAgYXRvbS52aWV3cy5wZXJmb3JtRG9jdW1lbnRQb2xsKClcblxuICAgICAgZWRpdG9yRWxlbWVudC5zZXRTY3JvbGxUb3AoNDAgKiAxMClcbiAgICAgIHNldCBjdXJzb3I6IFs0MiwgMF1cblxuICBkZXNjcmliZSBcInRoZSBjdHJsLXUga2V5YmluZGluZ1wiLCAtPlxuICAgIGl0IFwibW92ZXMgdGhlIHNjcmVlbiBkb3duIGJ5IGhhbGYgc2NyZWVuIHNpemUgYW5kIGtlZXBzIGN1cnNvciBvbnNjcmVlblwiLCAtPlxuICAgICAgZW5zdXJlICdjdHJsLXUnLFxuICAgICAgICBzY3JvbGxUb3A6IDMwMFxuICAgICAgICBjdXJzb3I6IFszMiwgMF1cblxuICAgIGl0IFwic2VsZWN0cyBvbiB2aXN1YWwgbW9kZVwiLCAtPlxuICAgICAgc2V0IGN1cnNvcjogWzQyLCAxXVxuICAgICAgZW5zdXJlICd2IGN0cmwtdScsXG4gICAgICAgIHNlbGVjdGVkVGV4dDogdGV4dC5nZXRMaW5lcyhbMzIuLjQxXSkgKyBcIjQyXCJcblxuICAgIGl0IFwic2VsZWN0cyBvbiBsaW5ld2lzZSBtb2RlXCIsIC0+XG4gICAgICBlbnN1cmUgJ1YgY3RybC11JyxcbiAgICAgICAgc2VsZWN0ZWRUZXh0OiB0ZXh0LmdldExpbmVzKFszMi4uNDJdKVxuXG4gIGRlc2NyaWJlIFwidGhlIGN0cmwtYiBrZXliaW5kaW5nXCIsIC0+XG4gICAgaXQgXCJtb3ZlcyBzY3JlZW4gdXAgb25lIHBhZ2VcIiwgLT5cbiAgICAgIGVuc3VyZSAnY3RybC1iJyxcbiAgICAgICAgc2Nyb2xsVG9wOiAyMDBcbiAgICAgICAgY3Vyc29yOiBbMjIsIDBdXG5cbiAgICBpdCBcInNlbGVjdHMgb24gdmlzdWFsIG1vZGVcIiwgLT5cbiAgICAgIHNldCBjdXJzb3I6IFs0MiwgMV1cbiAgICAgIGVuc3VyZSAndiBjdHJsLWInLFxuICAgICAgICBzZWxlY3RlZFRleHQ6IHRleHQuZ2V0TGluZXMoWzIyLi40MV0pICsgXCI0MlwiXG5cbiAgICBpdCBcInNlbGVjdHMgb24gbGluZXdpc2UgbW9kZVwiLCAtPlxuICAgICAgZW5zdXJlICdWIGN0cmwtYicsXG4gICAgICAgIHNlbGVjdGVkVGV4dDogdGV4dC5nZXRMaW5lcyhbMjIuLjQyXSlcblxuICBkZXNjcmliZSBcInRoZSBjdHJsLWQga2V5YmluZGluZ1wiLCAtPlxuICAgIGl0IFwibW92ZXMgdGhlIHNjcmVlbiBkb3duIGJ5IGhhbGYgc2NyZWVuIHNpemUgYW5kIGtlZXBzIGN1cnNvciBvbnNjcmVlblwiLCAtPlxuICAgICAgZW5zdXJlICdjdHJsLWQnLFxuICAgICAgICBzY3JvbGxUb3A6IDUwMFxuICAgICAgICBjdXJzb3I6IFs1MiwgMF1cblxuICAgIGl0IFwic2VsZWN0cyBvbiB2aXN1YWwgbW9kZVwiLCAtPlxuICAgICAgc2V0IGN1cnNvcjogWzQyLCAxXVxuICAgICAgZW5zdXJlICd2IGN0cmwtZCcsXG4gICAgICAgIHNlbGVjdGVkVGV4dDogdGV4dC5nZXRMaW5lcyhbNDIuLjUxXSkuc2xpY2UoMSkgKyBcIjVcIlxuXG4gICAgaXQgXCJzZWxlY3RzIG9uIGxpbmV3aXNlIG1vZGVcIiwgLT5cbiAgICAgIGVuc3VyZSAnViBjdHJsLWQnLFxuICAgICAgICBzZWxlY3RlZFRleHQ6IHRleHQuZ2V0TGluZXMoWzQyLi41Ml0pXG5cbiAgZGVzY3JpYmUgXCJ0aGUgY3RybC1mIGtleWJpbmRpbmdcIiwgLT5cbiAgICBpdCBcIm1vdmVzIHNjcmVlbiBkb3duIG9uZSBwYWdlXCIsIC0+XG4gICAgICBlbnN1cmUgJ2N0cmwtZicsXG4gICAgICAgIHNjcm9sbFRvcDogNjAwXG4gICAgICAgIGN1cnNvcjogWzYyLCAwXVxuXG4gICAgaXQgXCJzZWxlY3RzIG9uIHZpc3VhbCBtb2RlXCIsIC0+XG4gICAgICBzZXQgY3Vyc29yOiBbNDIsIDFdXG4gICAgICBlbnN1cmUgJ3YgY3RybC1mJyxcbiAgICAgICAgc2VsZWN0ZWRUZXh0OiB0ZXh0LmdldExpbmVzKFs0Mi4uNjFdKS5zbGljZSgxKSArIFwiNlwiXG5cbiAgICBpdCBcInNlbGVjdHMgb24gbGluZXdpc2UgbW9kZVwiLCAtPlxuICAgICAgZW5zdXJlICdWIGN0cmwtZicsXG4gICAgICAgIHNlbGVjdGVkVGV4dDogdGV4dC5nZXRMaW5lcyhbNDIuLjYyXSlcblxuICBkZXNjcmliZSBcImN0cmwtZiwgY3RybC1iLCBjdHJsLWQsIGN0cmwtdVwiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNldHRpbmdzLnNldCgnbW92ZVRvRmlyc3RDaGFyYWN0ZXJPblZlcnRpY2FsTW90aW9uJywgZmFsc2UpXG4gICAgICBzZXQgY3Vyc29yOiBbNDIsIDEwXVxuICAgICAgZW5zdXJlIHNjcm9sbFRvcDogNDAwXG5cbiAgICBpdCBcImdvIHRvIHJvdyB3aXRoIGtlZXAgY29sdW1uIGFuZCByZXNwZWN0IGN1cnNvci5nb2FsQ29sdW1cIiwgLT5cbiAgICAgIGVuc3VyZSAnY3RybC1iJywgc2Nyb2xsVG9wOiAyMDAsIGN1cnNvcjogWzIyLCAxMF1cbiAgICAgIGVuc3VyZSAnY3RybC1mJywgc2Nyb2xsVG9wOiA0MDAsIGN1cnNvcjogWzQyLCAxMF1cbiAgICAgIGVuc3VyZSAnY3RybC11Jywgc2Nyb2xsVG9wOiAzMDAsIGN1cnNvcjogWzMyLCAxMF1cbiAgICAgIGVuc3VyZSAnY3RybC1kJywgc2Nyb2xsVG9wOiA0MDAsIGN1cnNvcjogWzQyLCAxMF1cbiAgICAgIGVuc3VyZSAnJCcsIGN1cnNvcjogWzQyLCAxMl1cbiAgICAgIGV4cGVjdChlZGl0b3IuZ2V0TGFzdEN1cnNvcigpLmdvYWxDb2x1bW4pLnRvQmUoSW5maW5pdHkpXG4gICAgICBlbnN1cmUgJ2N0cmwtYicsIHNjcm9sbFRvcDogMjAwLCBjdXJzb3I6IFsyMiwgMTJdXG4gICAgICBlbnN1cmUgJ2N0cmwtYicsIHNjcm9sbFRvcDogICAwLCBjdXJzb3I6IFsgMiwgMTFdXG4gICAgICBlbnN1cmUgJ2N0cmwtZicsIHNjcm9sbFRvcDogMjAwLCBjdXJzb3I6IFsyMiwgMTJdXG4gICAgICBlbnN1cmUgJ2N0cmwtZicsIHNjcm9sbFRvcDogNDAwLCBjdXJzb3I6IFs0MiwgMTJdXG4gICAgICBlbnN1cmUgJ2N0cmwtdScsIHNjcm9sbFRvcDogMzAwLCBjdXJzb3I6IFszMiwgMTJdXG4gICAgICBlbnN1cmUgJ2N0cmwtZCcsIHNjcm9sbFRvcDogNDAwLCBjdXJzb3I6IFs0MiwgMTJdXG4gICAgICBleHBlY3QoZWRpdG9yLmdldExhc3RDdXJzb3IoKS5nb2FsQ29sdW1uKS50b0JlKEluZmluaXR5KVxuIl19
