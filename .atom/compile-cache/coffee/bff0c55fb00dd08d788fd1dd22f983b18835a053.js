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
            cursor: [[0, 2], [3, 2]]
          });
          editor.insertText('a');
          ensure({
            text: "12a345\n\nabcd\nefaghi"
          });
          return ensure('ctrl-y', {
            text: "12a345\n\nabcd\nefadghi"
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9zcGVjL2luc2VydC1tb2RlLXNwZWMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQyxjQUFlLE9BQUEsQ0FBUSxlQUFSOztFQUVoQixRQUFBLENBQVMsc0JBQVQsRUFBaUMsU0FBQTtBQUMvQixRQUFBO0lBQUEsTUFBNEQsRUFBNUQsRUFBQyxZQUFELEVBQU0sZUFBTixFQUFjLGtCQUFkLEVBQXlCLGVBQXpCLEVBQWlDLHNCQUFqQyxFQUFnRDtJQUVoRCxVQUFBLENBQVcsU0FBQTthQUNULFdBQUEsQ0FBWSxTQUFDLFNBQUQsRUFBWSxHQUFaO1FBQ1YsUUFBQSxHQUFXO1FBQ1YseUJBQUQsRUFBUztlQUNSLGFBQUQsRUFBTSxtQkFBTixFQUFjLHlCQUFkLEVBQTJCO01BSGpCLENBQVo7SUFEUyxDQUFYO1dBTUEsUUFBQSxDQUFTLDRCQUFULEVBQXVDLFNBQUE7TUFDckMsVUFBQSxDQUFXLFNBQUE7UUFDVCxHQUFBLENBQ0U7VUFBQSxJQUFBLEVBQU0sc0JBQU47VUFNQSxNQUFBLEVBQVEsQ0FBQyxDQUFDLENBQUQsRUFBSSxDQUFKLENBQUQsRUFBUyxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVQsQ0FOUjtTQURGO2VBUUEsU0FBQSxDQUFVLEdBQVY7TUFUUyxDQUFYO01BV0EsUUFBQSxDQUFTLG9CQUFULEVBQStCLFNBQUE7UUFDN0IsRUFBQSxDQUFHLDRCQUFILEVBQWlDLFNBQUE7VUFDL0IsTUFBQSxDQUFPLFFBQVAsRUFDRTtZQUFBLElBQUEsRUFBTSx3QkFBTjtXQURGO1VBT0EsTUFBTSxDQUFDLFVBQVAsQ0FBa0IsR0FBbEI7aUJBQ0EsTUFBQSxDQUFPLFFBQVAsRUFDRTtZQUFBLElBQUEsRUFBTSw0QkFBTjtXQURGO1FBVCtCLENBQWpDO1FBaUJBLEVBQUEsQ0FBRyxrREFBSCxF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QUFBO2lCQUN4Qix3QkFBQSxDQUF5QixHQUF6QixFQUNFO1lBQUEsTUFBQSxFQUFRLEtBQVI7WUFDQSxJQUFBLEVBQU0saUJBRE47WUFFQSxTQUFBLEVBQVcsb0JBRlg7V0FERjtRQUR3QixDQUExQjtRQUtBLEVBQUEsQ0FBRyxxQkFBSCxFQUEwQixTQUFBO2lCQUN4Qix3QkFBQSxDQUF5QixHQUF6QixFQUNFO1lBQUEsTUFBQSxFQUFRLEtBQVI7WUFDQSxJQUFBLEVBQU0saUJBRE47WUFFQSxTQUFBLEVBQVcsb0JBRlg7V0FERjtRQUR3QixDQUExQjtRQU1BLEVBQUEsQ0FBRyxvQkFBSCxFQUF5QixTQUFBO2lCQUN2Qix3QkFBQSxDQUF5QixHQUF6QixFQUNFO1lBQUEsTUFBQSxFQUFRLFlBQVI7WUFDQSxJQUFBLEVBQU0sc0JBRE47WUFFQSxTQUFBLEVBQVcsZ0NBRlg7V0FERjtRQUR1QixDQUF6QjtRQUtBLEVBQUEsQ0FBRyxvQkFBSCxFQUF5QixTQUFBO2lCQUN2Qix3QkFBQSxDQUF5QixHQUF6QixFQUNFO1lBQUEsTUFBQSxFQUFRLFlBQVI7WUFDQSxJQUFBLEVBQU0sd0JBRE47WUFFQSxTQUFBLEVBQVcsa0NBRlg7V0FERjtRQUR1QixDQUF6QjtlQUtBLEVBQUEsQ0FBRyxvQkFBSCxFQUF5QixTQUFBO2lCQUN2Qix3QkFBQSxDQUF5QixHQUF6QixFQUNFO1lBQUEsTUFBQSxFQUFRLFlBQVI7WUFDQSxJQUFBLEVBQU0sd0JBRE47WUFFQSxTQUFBLEVBQVcsa0NBRlg7V0FERjtRQUR1QixDQUF6QjtNQWxENkIsQ0FBL0I7SUExR3FDLENBQXZDO0VBVCtCLENBQWpDO0FBRkEiLCJzb3VyY2VzQ29udGVudCI6WyJ7Z2V0VmltU3RhdGV9ID0gcmVxdWlyZSAnLi9zcGVjLWhlbHBlcidcblxuZGVzY3JpYmUgXCJJbnNlcnQgbW9kZSBjb21tYW5kc1wiLCAtPlxuICBbc2V0LCBlbnN1cmUsIGtleXN0cm9rZSwgZWRpdG9yLCBlZGl0b3JFbGVtZW50LCB2aW1TdGF0ZV0gPSBbXVxuXG4gIGJlZm9yZUVhY2ggLT5cbiAgICBnZXRWaW1TdGF0ZSAoX3ZpbVN0YXRlLCB2aW0pIC0+XG4gICAgICB2aW1TdGF0ZSA9IF92aW1TdGF0ZVxuICAgICAge2VkaXRvciwgZWRpdG9yRWxlbWVudH0gPSBfdmltU3RhdGVcbiAgICAgIHtzZXQsIGVuc3VyZSwga2V5c3Ryb2tlfSA9IHZpbVxuXG4gIGRlc2NyaWJlIFwiQ29weSBmcm9tIGxpbmUgYWJvdmUvYmVsb3dcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXRcbiAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgMTIzNDVcblxuICAgICAgICAgIGFiY2RcbiAgICAgICAgICBlZmdoaVxuICAgICAgICAgIFwiXCJcIlxuICAgICAgICBjdXJzb3I6IFtbMSwgMF0sIFszLCAwXV1cbiAgICAgIGtleXN0cm9rZSAnaSdcblxuICAgIGRlc2NyaWJlIFwidGhlIGN0cmwteSBjb21tYW5kXCIsIC0+XG4gICAgICBpdCBcImNvcGllcyBmcm9tIHRoZSBsaW5lIGFib3ZlXCIsIC0+XG4gICAgICAgIGVuc3VyZSAnY3RybC15JyxcbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIDEyMzQ1XG4gICAgICAgICAgICAxXG4gICAgICAgICAgICBhYmNkXG4gICAgICAgICAgICBhZWZnaGlcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dCAnICdcbiAgICAgICAgZW5zdXJlICdjdHJsLXknLFxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgMTIzNDVcbiAgICAgICAgICAgIDEgM1xuICAgICAgICAgICAgYWJjZFxuICAgICAgICAgICAgYSBjZWZnaGlcbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICBpdCBcImRvZXMgbm90aGluZyBpZiB0aGVyZSdzIG5vdGhpbmcgYWJvdmUgdGhlIGN1cnNvclwiLCAtPlxuICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dCAnZmlsbCdcbiAgICAgICAgZW5zdXJlICdjdHJsLXknLFxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgMTIzNDVcbiAgICAgICAgICAgIGZpbGw1XG4gICAgICAgICAgICBhYmNkXG4gICAgICAgICAgICBmaWxsZWZnaGlcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICBlbnN1cmUgJ2N0cmwteScsXG4gICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICAxMjM0NVxuICAgICAgICAgICAgZmlsbDVcbiAgICAgICAgICAgIGFiY2RcbiAgICAgICAgICAgIGZpbGxlZmdoaVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgIGl0IFwiZG9lcyBub3RoaW5nIG9uIHRoZSBmaXJzdCBsaW5lXCIsIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIGN1cnNvcjogW1swLCAyXSwgWzMsIDJdXVxuICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dCAnYSdcbiAgICAgICAgZW5zdXJlXG4gICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICAxMmEzNDVcblxuICAgICAgICAgICAgYWJjZFxuICAgICAgICAgICAgZWZhZ2hpXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgZW5zdXJlICdjdHJsLXknLFxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgMTJhMzQ1XG5cbiAgICAgICAgICAgIGFiY2RcbiAgICAgICAgICAgIGVmYWRnaGlcbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgZGVzY3JpYmUgXCJ0aGUgY3RybC1lIGNvbW1hbmRcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgYXRvbS5rZXltYXBzLmFkZCBcInRlc3RcIixcbiAgICAgICAgICAnYXRvbS10ZXh0LWVkaXRvci52aW0tbW9kZS1wbHVzLmluc2VydC1tb2RlJzpcbiAgICAgICAgICAgICdjdHJsLWUnOiAndmltLW1vZGUtcGx1czpjb3B5LWZyb20tbGluZS1iZWxvdydcblxuICAgICAgaXQgXCJjb3BpZXMgZnJvbSB0aGUgbGluZSBiZWxvd1wiLCAtPlxuICAgICAgICBlbnN1cmUgJ2N0cmwtZScsXG4gICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICAxMjM0NVxuICAgICAgICAgICAgYVxuICAgICAgICAgICAgYWJjZFxuICAgICAgICAgICAgZWZnaGlcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dCAnICdcbiAgICAgICAgZW5zdXJlICdjdHJsLWUnLFxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgMTIzNDVcbiAgICAgICAgICAgIGEgY1xuICAgICAgICAgICAgYWJjZFxuICAgICAgICAgICAgIGVmZ2hpXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgaXQgXCJkb2VzIG5vdGhpbmcgaWYgdGhlcmUncyBub3RoaW5nIGJlbG93IHRoZSBjdXJzb3JcIiwgLT5cbiAgICAgICAgZWRpdG9yLmluc2VydFRleHQgJ2ZvbydcbiAgICAgICAgZW5zdXJlICdjdHJsLWUnLFxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgMTIzNDVcbiAgICAgICAgICAgIGZvb2RcbiAgICAgICAgICAgIGFiY2RcbiAgICAgICAgICAgIGZvb2VmZ2hpXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgZW5zdXJlICdjdHJsLWUnLFxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgMTIzNDVcbiAgICAgICAgICAgIGZvb2RcbiAgICAgICAgICAgIGFiY2RcbiAgICAgICAgICAgIGZvb2VmZ2hpXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgIGRlc2NyaWJlIFwiSW5zZXJ0TGFzdEluc2VydGVkXCIsIC0+XG4gICAgICBlbnN1cmVJbnNlcnRMYXN0SW5zZXJ0ZWQgPSAoa2V5LCBvcHRpb25zKSAtPlxuICAgICAgICB7aW5zZXJ0LCB0ZXh0LCBmaW5hbFRleHR9ID0gb3B0aW9uc1xuICAgICAgICBrZXlzdHJva2Uga2V5XG4gICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KGluc2VydClcbiAgICAgICAgZW5zdXJlIFwiZXNjYXBlXCIsIHRleHQ6IHRleHRcbiAgICAgICAgZW5zdXJlIFwiRyBJIGN0cmwtYVwiLCB0ZXh0OiBmaW5hbFRleHRcblxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBhdG9tLmtleW1hcHMuYWRkIFwidGVzdFwiLFxuICAgICAgICAgICdhdG9tLXRleHQtZWRpdG9yLnZpbS1tb2RlLXBsdXMuaW5zZXJ0LW1vZGUnOlxuICAgICAgICAgICAgJ2N0cmwtYSc6ICd2aW0tbW9kZS1wbHVzOmluc2VydC1sYXN0LWluc2VydGVkJ1xuXG4gICAgICAgIGluaXRpYWxUZXh0ID0gXCJcIlwiXG4gICAgICAgICAgYWJjXG4gICAgICAgICAgZGVmXFxuXG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgIHNldCB0ZXh0OiBcIlwiLCBjdXJzb3I6IFswLCAwXVxuICAgICAgICBrZXlzdHJva2UgJ2knXG4gICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KGluaXRpYWxUZXh0KVxuICAgICAgICBlbnN1cmUgXCJlc2NhcGUgZyBnXCIsXG4gICAgICAgICAgdGV4dDogaW5pdGlhbFRleHRcbiAgICAgICAgICBjdXJzb3I6IFswLCAwXVxuXG4gICAgICBpdCBcImNhc2UtaTogc2luZ2xlLWxpbmVcIiwgLT5cbiAgICAgICAgZW5zdXJlSW5zZXJ0TGFzdEluc2VydGVkICdpJyxcbiAgICAgICAgICBpbnNlcnQ6ICd4eHgnXG4gICAgICAgICAgdGV4dDogXCJ4eHhhYmNcXG5kZWZcXG5cIlxuICAgICAgICAgIGZpbmFsVGV4dDogXCJ4eHhhYmNcXG54eHhkZWZcXG5cIlxuICAgICAgaXQgXCJjYXNlLW86IHNpbmdsZS1saW5lXCIsIC0+XG4gICAgICAgIGVuc3VyZUluc2VydExhc3RJbnNlcnRlZCAnbycsXG4gICAgICAgICAgaW5zZXJ0OiAneHh4J1xuICAgICAgICAgIHRleHQ6IFwiYWJjXFxueHh4XFxuZGVmXFxuXCJcbiAgICAgICAgICBmaW5hbFRleHQ6IFwiYWJjXFxueHh4XFxueHh4ZGVmXFxuXCJcbiAgICAgIGl0IFwiY2FzZS1POiBzaW5nbGUtbGluZVwiLCAtPlxuICAgICAgICBlbnN1cmVJbnNlcnRMYXN0SW5zZXJ0ZWQgJ08nLFxuICAgICAgICAgIGluc2VydDogJ3h4eCdcbiAgICAgICAgICB0ZXh0OiBcInh4eFxcbmFiY1xcbmRlZlxcblwiXG4gICAgICAgICAgZmluYWxUZXh0OiBcInh4eFxcbmFiY1xcbnh4eGRlZlxcblwiXG5cbiAgICAgIGl0IFwiY2FzZS1pOiBtdWx0aS1saW5lXCIsIC0+XG4gICAgICAgIGVuc3VyZUluc2VydExhc3RJbnNlcnRlZCAnaScsXG4gICAgICAgICAgaW5zZXJ0OiAneHh4XFxueXl5XFxuJ1xuICAgICAgICAgIHRleHQ6IFwieHh4XFxueXl5XFxuYWJjXFxuZGVmXFxuXCJcbiAgICAgICAgICBmaW5hbFRleHQ6IFwieHh4XFxueXl5XFxuYWJjXFxueHh4XFxueXl5XFxuZGVmXFxuXCJcbiAgICAgIGl0IFwiY2FzZS1vOiBtdWx0aS1saW5lXCIsIC0+XG4gICAgICAgIGVuc3VyZUluc2VydExhc3RJbnNlcnRlZCAnbycsXG4gICAgICAgICAgaW5zZXJ0OiAneHh4XFxueXl5XFxuJ1xuICAgICAgICAgIHRleHQ6IFwiYWJjXFxueHh4XFxueXl5XFxuXFxuZGVmXFxuXCJcbiAgICAgICAgICBmaW5hbFRleHQ6IFwiYWJjXFxueHh4XFxueXl5XFxuXFxueHh4XFxueXl5XFxuZGVmXFxuXCJcbiAgICAgIGl0IFwiY2FzZS1POiBtdWx0aS1saW5lXCIsIC0+XG4gICAgICAgIGVuc3VyZUluc2VydExhc3RJbnNlcnRlZCAnTycsXG4gICAgICAgICAgaW5zZXJ0OiAneHh4XFxueXl5XFxuJ1xuICAgICAgICAgIHRleHQ6IFwieHh4XFxueXl5XFxuXFxuYWJjXFxuZGVmXFxuXCJcbiAgICAgICAgICBmaW5hbFRleHQ6IFwieHh4XFxueXl5XFxuXFxuYWJjXFxueHh4XFxueXl5XFxuZGVmXFxuXCJcbiJdfQ==
