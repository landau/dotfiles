(function() {
  describe("VimMode", function() {
    var editor, editorElement, workspaceElement, _ref;
    _ref = [], editor = _ref[0], editorElement = _ref[1], workspaceElement = _ref[2];
    beforeEach(function() {
      workspaceElement = atom.views.getView(atom.workspace);
      waitsForPromise(function() {
        return atom.workspace.open();
      });
      waitsForPromise(function() {
        return atom.packages.activatePackage('vim-mode');
      });
      waitsForPromise(function() {
        return atom.packages.activatePackage('status-bar');
      });
      return runs(function() {
        editor = atom.workspace.getActiveTextEditor();
        return editorElement = atom.views.getView(editor);
      });
    });
    describe(".activate", function() {
      it("puts the editor in normal-mode initially by default", function() {
        expect(editorElement.classList.contains('vim-mode')).toBe(true);
        return expect(editorElement.classList.contains('normal-mode')).toBe(true);
      });
      it("shows the current vim mode in the status bar", function() {
        var statusBarTile;
        statusBarTile = null;
        waitsFor(function() {
          return statusBarTile = workspaceElement.querySelector("#status-bar-vim-mode");
        });
        return runs(function() {
          expect(statusBarTile.textContent).toBe("Normal");
          atom.commands.dispatch(editorElement, "vim-mode:activate-insert-mode");
          return expect(statusBarTile.textContent).toBe("Insert");
        });
      });
      return it("doesn't register duplicate command listeners for editors", function() {
        var newPane, pane;
        editor.setText("12345");
        editor.setCursorBufferPosition([0, 0]);
        pane = atom.workspace.getActivePane();
        newPane = pane.splitRight();
        pane.removeItem(editor);
        newPane.addItem(editor);
        atom.commands.dispatch(editorElement, "vim-mode:move-right");
        return expect(editor.getCursorBufferPosition()).toEqual([0, 1]);
      });
    });
    return describe(".deactivate", function() {
      it("removes the vim classes from the editor", function() {
        atom.packages.deactivatePackage('vim-mode');
        expect(editorElement.classList.contains("vim-mode")).toBe(false);
        return expect(editorElement.classList.contains("normal-mode")).toBe(false);
      });
      return it("removes the vim commands from the editor element", function() {
        var vimCommands;
        vimCommands = function() {
          return atom.commands.findCommands({
            target: editorElement
          }).filter(function(cmd) {
            return cmd.name.startsWith("vim-mode:");
          });
        };
        expect(vimCommands().length).toBeGreaterThan(0);
        atom.packages.deactivatePackage('vim-mode');
        return expect(vimCommands().length).toBe(0);
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUvc3BlYy92aW0tbW9kZS1zcGVjLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsRUFBQSxRQUFBLENBQVMsU0FBVCxFQUFvQixTQUFBLEdBQUE7QUFDbEIsUUFBQSw2Q0FBQTtBQUFBLElBQUEsT0FBNEMsRUFBNUMsRUFBQyxnQkFBRCxFQUFTLHVCQUFULEVBQXdCLDBCQUF4QixDQUFBO0FBQUEsSUFFQSxVQUFBLENBQVcsU0FBQSxHQUFBO0FBQ1QsTUFBQSxnQkFBQSxHQUFtQixJQUFJLENBQUMsS0FBSyxDQUFDLE9BQVgsQ0FBbUIsSUFBSSxDQUFDLFNBQXhCLENBQW5CLENBQUE7QUFBQSxNQUVBLGVBQUEsQ0FBZ0IsU0FBQSxHQUFBO2VBQ2QsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFmLENBQUEsRUFEYztNQUFBLENBQWhCLENBRkEsQ0FBQTtBQUFBLE1BS0EsZUFBQSxDQUFnQixTQUFBLEdBQUE7ZUFDZCxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWQsQ0FBOEIsVUFBOUIsRUFEYztNQUFBLENBQWhCLENBTEEsQ0FBQTtBQUFBLE1BUUEsZUFBQSxDQUFnQixTQUFBLEdBQUE7ZUFDZCxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWQsQ0FBOEIsWUFBOUIsRUFEYztNQUFBLENBQWhCLENBUkEsQ0FBQTthQVdBLElBQUEsQ0FBSyxTQUFBLEdBQUE7QUFDSCxRQUFBLE1BQUEsR0FBUyxJQUFJLENBQUMsU0FBUyxDQUFDLG1CQUFmLENBQUEsQ0FBVCxDQUFBO2VBQ0EsYUFBQSxHQUFnQixJQUFJLENBQUMsS0FBSyxDQUFDLE9BQVgsQ0FBbUIsTUFBbkIsRUFGYjtNQUFBLENBQUwsRUFaUztJQUFBLENBQVgsQ0FGQSxDQUFBO0FBQUEsSUFrQkEsUUFB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

//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/vim-mode/spec/vim-mode-spec.coffee
