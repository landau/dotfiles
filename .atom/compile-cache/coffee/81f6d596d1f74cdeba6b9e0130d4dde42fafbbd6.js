(function() {
  var getVimState;

  getVimState = require('./spec-helper').getVimState;

  describe("Insert mode commands", function() {
    var editor, editorElement, ensure, keystroke, ref, set, vimState;
    ref = [], set = ref[0], ensure = ref[1], keystroke = ref[2], editor = ref[3], editorElement = ref[4], vimState = ref[5];
    beforeEach(function() {
      return getVimState(function(_vimState, vim) {
        vimState = _vimState;
        editor = _vimState.editor, editorElement = _vimState.editorElement;
        return set = vim.set, ensure = vim.ensure, keystroke = vim.keystroke, vim;
      });
    });
    return describe("Copy from line above/below", function() {
      beforeEach(function() {
        set({
          text: "12345\n\nabcd\nefghi",
          cursor: [[1, 0], [3, 0]]
        });
        return keystroke('i');
      });
      describe("the ctrl-y command", function() {
        it("copies from the line above", function() {
          ensure('ctrl-y', {
            text: "12345\n1\nabcd\naefghi"
          });
          editor.insertText(' ');
          return ensure('ctrl-y', {
            text: "12345\n1 3\nabcd\na cefghi"
          });
        });
        it("does nothing if there's nothing above the cursor", function() {
          editor.insertText('fill');
          ensure('ctrl-y', {
            text: "12345\nfill5\nabcd\nfillefghi"
          });
          return ensure('ctrl-y', {
            text: "12345\nfill5\nabcd\nfillefghi"
          });
        });
        return it("does nothing on the first line", function() {
          set({
            textC: "12|345\n\nabcd\nef!ghi"
          });
          editor.insertText('a');
          ensure({
            textC: "12a|345\n\nabcd\nefa!ghi"
          });
          return ensure('ctrl-y', {
            textC: "12a|345\n\nabcd\nefad!ghi"
          });
        });
      });
      describe("the ctrl-e command", function() {
        beforeEach(function() {
          return atom.keymaps.add("test", {
            'atom-text-editor.vim-mode-plus.insert-mode': {
              'ctrl-e': 'vim-mode-plus:copy-from-line-below'
            }
          });
        });
        it("copies from the line below", function() {
          ensure('ctrl-e', {
            text: "12345\na\nabcd\nefghi"
          });
          editor.insertText(' ');
          return ensure('ctrl-e', {
            text: "12345\na c\nabcd\n efghi"
          });
        });
        return it("does nothing if there's nothing below the cursor", function() {
          editor.insertText('foo');
          ensure('ctrl-e', {
            text: "12345\nfood\nabcd\nfooefghi"
          });
          return ensure('ctrl-e', {
            text: "12345\nfood\nabcd\nfooefghi"
          });
        });
      });
      return describe("InsertLastInserted", function() {
        var ensureInsertLastInserted;
        ensureInsertLastInserted = function(key, options) {
          var finalText, insert, text;
          insert = options.insert, text = options.text, finalText = options.finalText;
          keystroke(key);
          editor.insertText(insert);
          ensure("escape", {
            text: text
          });
          return ensure("G I ctrl-a", {
            text: finalText
          });
        };
        beforeEach(function() {
          var initialText;
          atom.keymaps.add("test", {
            'atom-text-editor.vim-mode-plus.insert-mode': {
              'ctrl-a': 'vim-mode-plus:insert-last-inserted'
            }
          });
          initialText = "abc\ndef\n";
          set({
            text: "",
            cursor: [0, 0]
          });
          keystroke('i');
          editor.insertText(initialText);
          return ensure("escape g g", {
            text: initialText,
            cursor: [0, 0]
          });
        });
        it("case-i: single-line", function() {
          return ensureInsertLastInserted('i', {
            insert: 'xxx',
            text: "xxxabc\ndef\n",
            finalText: "xxxabc\nxxxdef\n"
          });
        });
        it("case-o: single-line", function() {
          return ensureInsertLastInserted('o', {
            insert: 'xxx',
            text: "abc\nxxx\ndef\n",
            finalText: "abc\nxxx\nxxxdef\n"
          });
        });
        it("case-O: single-line", function() {
          return ensureInsertLastInserted('O', {
            insert: 'xxx',
            text: "xxx\nabc\ndef\n",
            finalText: "xxx\nabc\nxxxdef\n"
          });
        });
        it("case-i: multi-line", function() {
          return ensureInsertLastInserted('i', {
            insert: 'xxx\nyyy\n',
            text: "xxx\nyyy\nabc\ndef\n",
            finalText: "xxx\nyyy\nabc\nxxx\nyyy\ndef\n"
          });
        });
        it("case-o: multi-line", function() {
          return ensureInsertLastInserted('o', {
            insert: 'xxx\nyyy\n',
            text: "abc\nxxx\nyyy\n\ndef\n",
            finalText: "abc\nxxx\nyyy\n\nxxx\nyyy\ndef\n"
          });
        });
        return it("case-O: multi-line", function() {
          return ensureInsertLastInserted('O', {
            insert: 'xxx\nyyy\n',
            text: "xxx\nyyy\n\nabc\ndef\n",
            finalText: "xxx\nyyy\n\nabc\nxxx\nyyy\ndef\n"
          });
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9zcGVjL2luc2VydC1tb2RlLXNwZWMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQyxjQUFlLE9BQUEsQ0FBUSxlQUFSOztFQUVoQixRQUFBLENBQVMsc0JBQVQsRUFBaUMsU0FBQTtBQUMvQixRQUFBO0lBQUEsTUFBNEQsRUFBNUQsRUFBQyxZQUFELEVBQU0sZUFBTixFQUFjLGtCQUFkLEVBQXlCLGVBQXpCLEVBQWlDLHNCQUFqQyxFQUFnRDtJQUVoRCxVQUFBLENBQVcsU0FBQTthQUNULFdBQUEsQ0FBWSxTQUFDLFNBQUQsRUFBWSxHQUFaO1FBQ1YsUUFBQSxHQUFXO1FBQ1YseUJBQUQsRUFBUztlQUNSLGFBQUQsRUFBTSxtQkFBTixFQUFjLHlCQUFkLEVBQTJCO01BSGpCLENBQVo7SUFEUyxDQUFYO1dBTUEsUUFBQSxDQUFTLDRCQUFULEVBQXVDLFNBQUE7TUFDckMsVUFBQSxDQUFXLFNBQUE7UUFDVCxHQUFBLENBQ0U7VUFBQSxJQUFBLEVBQU0sc0JBQU47VUFNQSxNQUFBLEVBQVEsQ0FBQyxDQUFDLENBQUQsRUFBSSxDQUFKLENBQUQsRUFBUyxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVQsQ0FOUjtTQURGO2VBUUEsU0FBQSxDQUFVLEdBQVY7TUFUUyxDQUFYO01BV0EsUUFBQSxDQUFTLG9CQUFULEVBQStCLFNBQUE7UUFDN0IsRUFBQSxDQUFHLDRCQUFILEVBQWlDLFNBQUE7VUFDL0IsTUFBQSxDQUFPLFFBQVAsRUFDRTtZQUFBLElBQUEsRUFBTSx3QkFBTjtXQURGO1VBT0EsTUFBTSxDQUFDLFVBQVAsQ0FBa0IsR0FBbEI7aUJBQ0EsTUFBQSxDQUFPLFFBQVAsRUFDRTtZQUFBLElBQUEsRUFBTSw0QkFBTjtXQURGO1FBVCtCLENBQWpDO1FBaUJBLEVBQUEsQ0FBRyxrREFBSCxF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LElBQUEsRUFBTSxpQkFETjtZQUVBLFNBQUEsRUFBVyxvQkFGWDtXQURGO1FBRHdCLENBQTFCO1FBS0EsRUFBQSxDQUFHLHFCQUFILEVBQTBCLFNBQUE7aUJBQ3hCLHdCQUFBLENBQXlCLEdBQXpCLEVBQ0U7WUFBQSxNQUFBLEVBQVEsS0FBUjtZQUNBLElBQUEsRUFBTSxpQkFETjtZQUVBLFNBQUEsRUFBVyxvQkFGWDtXQURGO1FBRHdCLENBQTFCO1FBTUEsRUFBQSxDQUFHLG9CQUFILEVBQXlCLFNBQUE7aUJBQ3ZCLHdCQUFBLENBQXlCLEdBQXpCLEVBQ0U7WUFBQSxNQUFBLEVBQVEsWUFBUjtZQUNBLElBQUEsRUFBTSxzQkFETjtZQUVBLFNBQUEsRUFBVyxnQ0FGWDtXQURGO1FBRHVCLENBQXpCO1FBS0EsRUFBQSxDQUFHLG9CQUFILEVBQXlCLFNBQUE7aUJBQ3ZCLHdCQUFBLENBQXlCLEdBQXpCLEVBQ0U7WUFBQSxNQUFBLEVBQVEsWUFBUjtZQUNBLElBQUEsRUFBTSx3QkFETjtZQUVBLFNBQUEsRUFBVyxrQ0FGWDtXQURGO1FBRHVCLENBQXpCO2VBS0EsRUFBQSxDQUFHLG9CQUFILEVBQXlCLFNBQUE7aUJBQ3ZCLHdCQUFBLENBQXlCLEdBQXpCLEVBQ0U7WUFBQSxNQUFBLEVBQVEsWUFBUjtZQUNBLElBQUEsRUFBTSx3QkFETjtZQUVBLFNBQUEsRUFBVyxrQ0FGWDtXQURGO1FBRHVCLENBQXpCO01BbEQ2QixDQUEvQjtJQWhIcUMsQ0FBdkM7RUFUK0IsQ0FBakM7QUFGQSIsInNvdXJjZXNDb250ZW50IjpbIntnZXRWaW1TdGF0ZX0gPSByZXF1aXJlICcuL3NwZWMtaGVscGVyJ1xuXG5kZXNjcmliZSBcIkluc2VydCBtb2RlIGNvbW1hbmRzXCIsIC0+XG4gIFtzZXQsIGVuc3VyZSwga2V5c3Ryb2tlLCBlZGl0b3IsIGVkaXRvckVsZW1lbnQsIHZpbVN0YXRlXSA9IFtdXG5cbiAgYmVmb3JlRWFjaCAtPlxuICAgIGdldFZpbVN0YXRlIChfdmltU3RhdGUsIHZpbSkgLT5cbiAgICAgIHZpbVN0YXRlID0gX3ZpbVN0YXRlXG4gICAgICB7ZWRpdG9yLCBlZGl0b3JFbGVtZW50fSA9IF92aW1TdGF0ZVxuICAgICAge3NldCwgZW5zdXJlLCBrZXlzdHJva2V9ID0gdmltXG5cbiAgZGVzY3JpYmUgXCJDb3B5IGZyb20gbGluZSBhYm92ZS9iZWxvd1wiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNldFxuICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAxMjM0NVxuXG4gICAgICAgICAgYWJjZFxuICAgICAgICAgIGVmZ2hpXG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgIGN1cnNvcjogW1sxLCAwXSwgWzMsIDBdXVxuICAgICAga2V5c3Ryb2tlICdpJ1xuXG4gICAgZGVzY3JpYmUgXCJ0aGUgY3RybC15IGNvbW1hbmRcIiwgLT5cbiAgICAgIGl0IFwiY29waWVzIGZyb20gdGhlIGxpbmUgYWJvdmVcIiwgLT5cbiAgICAgICAgZW5zdXJlICdjdHJsLXknLFxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgMTIzNDVcbiAgICAgICAgICAgIDFcbiAgICAgICAgICAgIGFiY2RcbiAgICAgICAgICAgIGFlZmdoaVxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgIGVkaXRvci5pbnNlcnRUZXh0ICcgJ1xuICAgICAgICBlbnN1cmUgJ2N0cmwteScsXG4gICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICAxMjM0NVxuICAgICAgICAgICAgMSAzXG4gICAgICAgICAgICBhYmNkXG4gICAgICAgICAgICBhIGNlZmdoaVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgIGl0IFwiZG9lcyBub3RoaW5nIGlmIHRoZXJlJ3Mgbm90aGluZyBhYm92ZSB0aGUgY3Vyc29yXCIsIC0+XG4gICAgICAgIGVkaXRvci5pbnNlcnRUZXh0ICdmaWxsJ1xuICAgICAgICBlbnN1cmUgJ2N0cmwteScsXG4gICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICAxMjM0NVxuICAgICAgICAgICAgZmlsbDVcbiAgICAgICAgICAgIGFiY2RcbiAgICAgICAgICAgIGZpbGxlZmdoaVxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgIGVuc3VyZSAnY3RybC15JyxcbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIDEyMzQ1XG4gICAgICAgICAgICBmaWxsNVxuICAgICAgICAgICAgYWJjZFxuICAgICAgICAgICAgZmlsbGVmZ2hpXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgaXQgXCJkb2VzIG5vdGhpbmcgb24gdGhlIGZpcnN0IGxpbmVcIiwgLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgIDEyfDM0NVxuXG4gICAgICAgICAgYWJjZFxuICAgICAgICAgIGVmIWdoaVxuICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGVkaXRvci5pbnNlcnRUZXh0ICdhJ1xuICAgICAgICBlbnN1cmVcbiAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICAxMmF8MzQ1XG5cbiAgICAgICAgICAgIGFiY2RcbiAgICAgICAgICAgIGVmYSFnaGlcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICBlbnN1cmUgJ2N0cmwteScsXG4gICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgMTJhfDM0NVxuXG4gICAgICAgICAgICBhYmNkXG4gICAgICAgICAgICBlZmFkIWdoaVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICBkZXNjcmliZSBcInRoZSBjdHJsLWUgY29tbWFuZFwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBhdG9tLmtleW1hcHMuYWRkIFwidGVzdFwiLFxuICAgICAgICAgICdhdG9tLXRleHQtZWRpdG9yLnZpbS1tb2RlLXBsdXMuaW5zZXJ0LW1vZGUnOlxuICAgICAgICAgICAgJ2N0cmwtZSc6ICd2aW0tbW9kZS1wbHVzOmNvcHktZnJvbS1saW5lLWJlbG93J1xuXG4gICAgICBpdCBcImNvcGllcyBmcm9tIHRoZSBsaW5lIGJlbG93XCIsIC0+XG4gICAgICAgIGVuc3VyZSAnY3RybC1lJyxcbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIDEyMzQ1XG4gICAgICAgICAgICBhXG4gICAgICAgICAgICBhYmNkXG4gICAgICAgICAgICBlZmdoaVxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgIGVkaXRvci5pbnNlcnRUZXh0ICcgJ1xuICAgICAgICBlbnN1cmUgJ2N0cmwtZScsXG4gICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICAxMjM0NVxuICAgICAgICAgICAgYSBjXG4gICAgICAgICAgICBhYmNkXG4gICAgICAgICAgICAgZWZnaGlcbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICBpdCBcImRvZXMgbm90aGluZyBpZiB0aGVyZSdzIG5vdGhpbmcgYmVsb3cgdGhlIGN1cnNvclwiLCAtPlxuICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dCAnZm9vJ1xuICAgICAgICBlbnN1cmUgJ2N0cmwtZScsXG4gICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICAxMjM0NVxuICAgICAgICAgICAgZm9vZFxuICAgICAgICAgICAgYWJjZFxuICAgICAgICAgICAgZm9vZWZnaGlcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICBlbnN1cmUgJ2N0cmwtZScsXG4gICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICAxMjM0NVxuICAgICAgICAgICAgZm9vZFxuICAgICAgICAgICAgYWJjZFxuICAgICAgICAgICAgZm9vZWZnaGlcbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgZGVzY3JpYmUgXCJJbnNlcnRMYXN0SW5zZXJ0ZWRcIiwgLT5cbiAgICAgIGVuc3VyZUluc2VydExhc3RJbnNlcnRlZCA9IChrZXksIG9wdGlvbnMpIC0+XG4gICAgICAgIHtpbnNlcnQsIHRleHQsIGZpbmFsVGV4dH0gPSBvcHRpb25zXG4gICAgICAgIGtleXN0cm9rZSBrZXlcbiAgICAgICAgZWRpdG9yLmluc2VydFRleHQoaW5zZXJ0KVxuICAgICAgICBlbnN1cmUgXCJlc2NhcGVcIiwgdGV4dDogdGV4dFxuICAgICAgICBlbnN1cmUgXCJHIEkgY3RybC1hXCIsIHRleHQ6IGZpbmFsVGV4dFxuXG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIGF0b20ua2V5bWFwcy5hZGQgXCJ0ZXN0XCIsXG4gICAgICAgICAgJ2F0b20tdGV4dC1lZGl0b3IudmltLW1vZGUtcGx1cy5pbnNlcnQtbW9kZSc6XG4gICAgICAgICAgICAnY3RybC1hJzogJ3ZpbS1tb2RlLXBsdXM6aW5zZXJ0LWxhc3QtaW5zZXJ0ZWQnXG5cbiAgICAgICAgaW5pdGlhbFRleHQgPSBcIlwiXCJcbiAgICAgICAgICBhYmNcbiAgICAgICAgICBkZWZcXG5cbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgc2V0IHRleHQ6IFwiXCIsIGN1cnNvcjogWzAsIDBdXG4gICAgICAgIGtleXN0cm9rZSAnaSdcbiAgICAgICAgZWRpdG9yLmluc2VydFRleHQoaW5pdGlhbFRleHQpXG4gICAgICAgIGVuc3VyZSBcImVzY2FwZSBnIGdcIixcbiAgICAgICAgICB0ZXh0OiBpbml0aWFsVGV4dFxuICAgICAgICAgIGN1cnNvcjogWzAsIDBdXG5cbiAgICAgIGl0IFwiY2FzZS1pOiBzaW5nbGUtbGluZVwiLCAtPlxuICAgICAgICBlbnN1cmVJbnNlcnRMYXN0SW5zZXJ0ZWQgJ2knLFxuICAgICAgICAgIGluc2VydDogJ3h4eCdcbiAgICAgICAgICB0ZXh0OiBcInh4eGFiY1xcbmRlZlxcblwiXG4gICAgICAgICAgZmluYWxUZXh0OiBcInh4eGFiY1xcbnh4eGRlZlxcblwiXG4gICAgICBpdCBcImNhc2Utbzogc2luZ2xlLWxpbmVcIiwgLT5cbiAgICAgICAgZW5zdXJlSW5zZXJ0TGFzdEluc2VydGVkICdvJyxcbiAgICAgICAgICBpbnNlcnQ6ICd4eHgnXG4gICAgICAgICAgdGV4dDogXCJhYmNcXG54eHhcXG5kZWZcXG5cIlxuICAgICAgICAgIGZpbmFsVGV4dDogXCJhYmNcXG54eHhcXG54eHhkZWZcXG5cIlxuICAgICAgaXQgXCJjYXNlLU86IHNpbmdsZS1saW5lXCIsIC0+XG4gICAgICAgIGVuc3VyZUluc2VydExhc3RJbnNlcnRlZCAnTycsXG4gICAgICAgICAgaW5zZXJ0OiAneHh4J1xuICAgICAgICAgIHRleHQ6IFwieHh4XFxuYWJjXFxuZGVmXFxuXCJcbiAgICAgICAgICBmaW5hbFRleHQ6IFwieHh4XFxuYWJjXFxueHh4ZGVmXFxuXCJcblxuICAgICAgaXQgXCJjYXNlLWk6IG11bHRpLWxpbmVcIiwgLT5cbiAgICAgICAgZW5zdXJlSW5zZXJ0TGFzdEluc2VydGVkICdpJyxcbiAgICAgICAgICBpbnNlcnQ6ICd4eHhcXG55eXlcXG4nXG4gICAgICAgICAgdGV4dDogXCJ4eHhcXG55eXlcXG5hYmNcXG5kZWZcXG5cIlxuICAgICAgICAgIGZpbmFsVGV4dDogXCJ4eHhcXG55eXlcXG5hYmNcXG54eHhcXG55eXlcXG5kZWZcXG5cIlxuICAgICAgaXQgXCJjYXNlLW86IG11bHRpLWxpbmVcIiwgLT5cbiAgICAgICAgZW5zdXJlSW5zZXJ0TGFzdEluc2VydGVkICdvJyxcbiAgICAgICAgICBpbnNlcnQ6ICd4eHhcXG55eXlcXG4nXG4gICAgICAgICAgdGV4dDogXCJhYmNcXG54eHhcXG55eXlcXG5cXG5kZWZcXG5cIlxuICAgICAgICAgIGZpbmFsVGV4dDogXCJhYmNcXG54eHhcXG55eXlcXG5cXG54eHhcXG55eXlcXG5kZWZcXG5cIlxuICAgICAgaXQgXCJjYXNlLU86IG11bHRpLWxpbmVcIiwgLT5cbiAgICAgICAgZW5zdXJlSW5zZXJ0TGFzdEluc2VydGVkICdPJyxcbiAgICAgICAgICBpbnNlcnQ6ICd4eHhcXG55eXlcXG4nXG4gICAgICAgICAgdGV4dDogXCJ4eHhcXG55eXlcXG5cXG5hYmNcXG5kZWZcXG5cIlxuICAgICAgICAgIGZpbmFsVGV4dDogXCJ4eHhcXG55eXlcXG5cXG5hYmNcXG54eHhcXG55eXlcXG5kZWZcXG5cIlxuIl19
