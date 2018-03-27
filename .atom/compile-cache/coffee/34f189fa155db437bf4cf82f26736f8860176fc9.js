(function() {
  var getView, getVimState, packageName, ref;

  ref = require('./spec-helper'), getVimState = ref.getVimState, getView = ref.getView;

  packageName = 'vim-mode-plus';

  describe("vim-mode-plus", function() {
    var editor, editorElement, ensure, keystroke, ref1, set, vimState, workspaceElement;
    ref1 = [], set = ref1[0], ensure = ref1[1], keystroke = ref1[2], editor = ref1[3], editorElement = ref1[4], vimState = ref1[5], workspaceElement = ref1[6];
    beforeEach(function() {
      getVimState(function(_vimState, vim) {
        vimState = _vimState;
        editor = _vimState.editor, editorElement = _vimState.editorElement;
        return set = vim.set, ensure = vim.ensure, keystroke = vim.keystroke, vim;
      });
      workspaceElement = getView(atom.workspace);
      return waitsForPromise(function() {
        return atom.packages.activatePackage('status-bar');
      });
    });
    describe(".activate", function() {
      it("puts the editor in normal-mode initially by default", function() {
        return ensure({
          mode: 'normal'
        });
      });
      return it("shows the current vim mode in the status bar", function() {
        var statusBarTile;
        statusBarTile = null;
        waitsFor(function() {
          return statusBarTile = workspaceElement.querySelector("#status-bar-vim-mode-plus");
        });
        return runs(function() {
          expect(statusBarTile.textContent).toBe("N");
          ensure('i', {
            mode: 'insert'
          });
          return expect(statusBarTile.textContent).toBe("I");
        });
      });
    });
    return describe(".deactivate", function() {
      it("removes the vim classes from the editor", function() {
        atom.packages.deactivatePackage(packageName);
        expect(editorElement.classList.contains("vim-mode-plus")).toBe(false);
        return expect(editorElement.classList.contains("normal-mode")).toBe(false);
      });
      return it("removes the vim commands from the editor element", function() {
        var vimCommands;
        vimCommands = function() {
          return atom.commands.findCommands({
            target: editorElement
          }).filter(function(cmd) {
            return cmd.name.startsWith("vim-mode-plus:");
          });
        };
        expect(vimCommands().length).toBeGreaterThan(0);
        atom.packages.deactivatePackage(packageName);
        return expect(vimCommands().length).toBe(0);
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9zcGVjL3ZpbS1tb2RlLXBsdXMtc3BlYy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLE1BQXlCLE9BQUEsQ0FBUSxlQUFSLENBQXpCLEVBQUMsNkJBQUQsRUFBYzs7RUFFZCxXQUFBLEdBQWM7O0VBQ2QsUUFBQSxDQUFTLGVBQVQsRUFBMEIsU0FBQTtBQUN4QixRQUFBO0lBQUEsT0FBOEUsRUFBOUUsRUFBQyxhQUFELEVBQU0sZ0JBQU4sRUFBYyxtQkFBZCxFQUF5QixnQkFBekIsRUFBaUMsdUJBQWpDLEVBQWdELGtCQUFoRCxFQUEwRDtJQUUxRCxVQUFBLENBQVcsU0FBQTtNQUNULFdBQUEsQ0FBWSxTQUFDLFNBQUQsRUFBWSxHQUFaO1FBQ1YsUUFBQSxHQUFXO1FBQ1YseUJBQUQsRUFBUztlQUNSLGFBQUQsRUFBTSxtQkFBTixFQUFjLHlCQUFkLEVBQTJCO01BSGpCLENBQVo7TUFLQSxnQkFBQSxHQUFtQixPQUFBLENBQVEsSUFBSSxDQUFDLFNBQWI7YUFFbkIsZUFBQSxDQUFnQixTQUFBO2VBQ2QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFkLENBQThCLFlBQTlCO01BRGMsQ0FBaEI7SUFSUyxDQUFYO0lBV0EsUUFBQSxDQUFTLFdBQVQsRUFBc0IsU0FBQTtNQUNwQixFQUFBLENBQUcscURBQUgsRUFBMEQsU0FBQTtlQUN4RCxNQUFBLENBQU87VUFBQSxJQUFBLEVBQU0sUUFBTjtTQUFQO01BRHdELENBQTFEO2FBR0EsRUFBQSxDQUFHLDhDQUFILEVBQW1ELFNBQUE7QUFDakQsWUFBQTtRQUFBLGFBQUEsR0FBZ0I7UUFFaEIsUUFBQSxDQUFTLFNBQUE7aUJBQ1AsYUFBQSxHQUFnQixnQkFBZ0IsQ0FBQyxhQUFqQixDQUErQiwyQkFBL0I7UUFEVCxDQUFUO2VBR0EsSUFBQSxDQUFLLFNBQUE7VUFDSCxNQUFBLENBQU8sYUFBYSxDQUFDLFdBQXJCLENBQWlDLENBQUMsSUFBbEMsQ0FBdUMsR0FBdkM7VUFDQSxNQUFBLENBQU8sR0FBUCxFQUFZO1lBQUEsSUFBQSxFQUFNLFFBQU47V0FBWjtpQkFDQSxNQUFBLENBQU8sYUFBYSxDQUFDLFdBQXJCLENBQWlDLENBQUMsSUFBbEMsQ0FBdUMsR0FBdkM7UUFIRyxDQUFMO01BTmlELENBQW5EO0lBSm9CLENBQXRCO1dBZUEsUUFBQSxDQUFTLGFBQVQsRUFBd0IsU0FBQTtNQUN0QixFQUFBLENBQUcseUNBQUgsRUFBOEMsU0FBQTtRQUM1QyxJQUFJLENBQUMsUUFBUSxDQUFDLGlCQUFkLENBQWdDLFdBQWhDO1FBQ0EsTUFBQSxDQUFPLGFBQWEsQ0FBQyxTQUFTLENBQUMsUUFBeEIsQ0FBaUMsZUFBakMsQ0FBUCxDQUF5RCxDQUFDLElBQTFELENBQStELEtBQS9EO2VBQ0EsTUFBQSxDQUFPLGFBQWEsQ0FBQyxTQUFTLENBQUMsUUFBeEIsQ0FBaUMsYUFBakMsQ0FBUCxDQUF1RCxDQUFDLElBQXhELENBQTZELEtBQTdEO01BSDRDLENBQTlDO2FBS0EsRUFBQSxDQUFHLGtEQUFILEVBQXVELFNBQUE7QUFDckQsWUFBQTtRQUFBLFdBQUEsR0FBYyxTQUFBO2lCQUNaLElBQUksQ0FBQyxRQUFRLENBQUMsWUFBZCxDQUEyQjtZQUFBLE1BQUEsRUFBUSxhQUFSO1dBQTNCLENBQWlELENBQUMsTUFBbEQsQ0FBeUQsU0FBQyxHQUFEO21CQUN2RCxHQUFHLENBQUMsSUFBSSxDQUFDLFVBQVQsQ0FBb0IsZ0JBQXBCO1VBRHVELENBQXpEO1FBRFk7UUFJZCxNQUFBLENBQU8sV0FBQSxDQUFBLENBQWEsQ0FBQyxNQUFyQixDQUE0QixDQUFDLGVBQTdCLENBQTZDLENBQTdDO1FBQ0EsSUFBSSxDQUFDLFFBQVEsQ0FBQyxpQkFBZCxDQUFnQyxXQUFoQztlQUNBLE1BQUEsQ0FBTyxXQUFBLENBQUEsQ0FBYSxDQUFDLE1BQXJCLENBQTRCLENBQUMsSUFBN0IsQ0FBa0MsQ0FBbEM7TUFQcUQsQ0FBdkQ7SUFOc0IsQ0FBeEI7RUE3QndCLENBQTFCO0FBSEEiLCJzb3VyY2VzQ29udGVudCI6WyJ7Z2V0VmltU3RhdGUsIGdldFZpZXd9ID0gcmVxdWlyZSAnLi9zcGVjLWhlbHBlcidcblxucGFja2FnZU5hbWUgPSAndmltLW1vZGUtcGx1cydcbmRlc2NyaWJlIFwidmltLW1vZGUtcGx1c1wiLCAtPlxuICBbc2V0LCBlbnN1cmUsIGtleXN0cm9rZSwgZWRpdG9yLCBlZGl0b3JFbGVtZW50LCB2aW1TdGF0ZSwgd29ya3NwYWNlRWxlbWVudF0gPSBbXVxuXG4gIGJlZm9yZUVhY2ggLT5cbiAgICBnZXRWaW1TdGF0ZSAoX3ZpbVN0YXRlLCB2aW0pIC0+XG4gICAgICB2aW1TdGF0ZSA9IF92aW1TdGF0ZVxuICAgICAge2VkaXRvciwgZWRpdG9yRWxlbWVudH0gPSBfdmltU3RhdGVcbiAgICAgIHtzZXQsIGVuc3VyZSwga2V5c3Ryb2tlfSA9IHZpbVxuXG4gICAgd29ya3NwYWNlRWxlbWVudCA9IGdldFZpZXcoYXRvbS53b3Jrc3BhY2UpXG5cbiAgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAgIGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKCdzdGF0dXMtYmFyJylcblxuICBkZXNjcmliZSBcIi5hY3RpdmF0ZVwiLCAtPlxuICAgIGl0IFwicHV0cyB0aGUgZWRpdG9yIGluIG5vcm1hbC1tb2RlIGluaXRpYWxseSBieSBkZWZhdWx0XCIsIC0+XG4gICAgICBlbnN1cmUgbW9kZTogJ25vcm1hbCdcblxuICAgIGl0IFwic2hvd3MgdGhlIGN1cnJlbnQgdmltIG1vZGUgaW4gdGhlIHN0YXR1cyBiYXJcIiwgLT5cbiAgICAgIHN0YXR1c0JhclRpbGUgPSBudWxsXG5cbiAgICAgIHdhaXRzRm9yIC0+XG4gICAgICAgIHN0YXR1c0JhclRpbGUgPSB3b3Jrc3BhY2VFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjc3RhdHVzLWJhci12aW0tbW9kZS1wbHVzXCIpXG5cbiAgICAgIHJ1bnMgLT5cbiAgICAgICAgZXhwZWN0KHN0YXR1c0JhclRpbGUudGV4dENvbnRlbnQpLnRvQmUoXCJOXCIpXG4gICAgICAgIGVuc3VyZSAnaScsIG1vZGU6ICdpbnNlcnQnXG4gICAgICAgIGV4cGVjdChzdGF0dXNCYXJUaWxlLnRleHRDb250ZW50KS50b0JlKFwiSVwiKVxuXG4gIGRlc2NyaWJlIFwiLmRlYWN0aXZhdGVcIiwgLT5cbiAgICBpdCBcInJlbW92ZXMgdGhlIHZpbSBjbGFzc2VzIGZyb20gdGhlIGVkaXRvclwiLCAtPlxuICAgICAgYXRvbS5wYWNrYWdlcy5kZWFjdGl2YXRlUGFja2FnZShwYWNrYWdlTmFtZSlcbiAgICAgIGV4cGVjdChlZGl0b3JFbGVtZW50LmNsYXNzTGlzdC5jb250YWlucyhcInZpbS1tb2RlLXBsdXNcIikpLnRvQmUoZmFsc2UpXG4gICAgICBleHBlY3QoZWRpdG9yRWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoXCJub3JtYWwtbW9kZVwiKSkudG9CZShmYWxzZSlcblxuICAgIGl0IFwicmVtb3ZlcyB0aGUgdmltIGNvbW1hbmRzIGZyb20gdGhlIGVkaXRvciBlbGVtZW50XCIsIC0+XG4gICAgICB2aW1Db21tYW5kcyA9IC0+XG4gICAgICAgIGF0b20uY29tbWFuZHMuZmluZENvbW1hbmRzKHRhcmdldDogZWRpdG9yRWxlbWVudCkuZmlsdGVyIChjbWQpIC0+XG4gICAgICAgICAgY21kLm5hbWUuc3RhcnRzV2l0aChcInZpbS1tb2RlLXBsdXM6XCIpXG5cbiAgICAgIGV4cGVjdCh2aW1Db21tYW5kcygpLmxlbmd0aCkudG9CZUdyZWF0ZXJUaGFuKDApXG4gICAgICBhdG9tLnBhY2thZ2VzLmRlYWN0aXZhdGVQYWNrYWdlKHBhY2thZ2VOYW1lKVxuICAgICAgZXhwZWN0KHZpbUNvbW1hbmRzKCkubGVuZ3RoKS50b0JlKDApXG4iXX0=
