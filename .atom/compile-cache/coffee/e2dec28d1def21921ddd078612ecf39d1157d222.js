(function() {
  var helpers;

  helpers = require('./spec-helper');

  describe("Prefixes", function() {
    var editor, editorElement, keydown, vimState, _ref;
    _ref = [], editor = _ref[0], editorElement = _ref[1], vimState = _ref[2];
    beforeEach(function() {
      var vimMode;
      vimMode = atom.packages.loadPackage('vim-mode');
      vimMode.activateResources();
      return helpers.getEditorElement(function(element) {
        editorElement = element;
        editor = editorElement.getModel();
        vimState = editorElement.vimState;
        vimState.activateNormalMode();
        return vimState.resetNormalMode();
      });
    });
    keydown = function(key, options) {
      if (options == null) {
        options = {};
      }
      if (options.element == null) {
        options.element = editorElement;
      }
      return helpers.keydown(key, options);
    };
    describe("Repeat", function() {
      describe("with operations", function() {
        beforeEach(function() {
          editor.setText("123456789abc");
          return editor.setCursorScreenPosition([0, 0]);
        });
        it("repeats N times", function() {
          keydown('3');
          keydown('x');
          return expect(editor.getText()).toBe('456789abc');
        });
        return it("repeats NN times", function() {
          keydown('1');
          keydown('0');
          keydown('x');
          return expect(editor.getText()).toBe('bc');
        });
      });
      describe("with motions", function() {
        beforeEach(function() {
          editor.setText('one two three');
          return editor.setCursorScreenPosition([0, 0]);
        });
        return it("repeats N times", function() {
          keydown('d');
          keydown('2');
          keydown('w');
          return expect(editor.getText()).toBe('three');
        });
      });
      return describe("in visual mode", function() {
        beforeEach(function() {
          editor.setText('one two three');
          return editor.setCursorScreenPosition([0, 0]);
        });
        return it("repeats movements in visual mode", function() {
          keydown("v");
          keydown("2");
          keydown("w");
          return expect(editor.getCursorScreenPosition()).toEqual([0, 9]);
        });
      });
    });
    return describe("Register", function() {
      describe("the a register", function() {
        it("saves a value for future reading", function() {
          vimState.setRegister('a', {
            text: 'new content'
          });
          return expect(vimState.getRegister("a").text).toEqual('new content');
        });
        return it("overwrites a value previously in the register", function() {
          vimState.setRegister('a', {
            text: 'content'
          });
          vimState.setRegister('a', {
            text: 'new content'
          });
          return expect(vimState.getRegister("a").text).toEqual('new content');
        });
      });
      describe("the B register", function() {
        it("saves a value for future reading", function() {
          vimState.setRegister('B', {
            text: 'new content'
          });
          expect(vimState.getRegister("b").text).toEqual('new content');
          return expect(vimState.getRegister("B").text).toEqual('new content');
        });
        it("appends to a value previously in the register", function() {
          vimState.setRegister('b', {
            text: 'content'
          });
          vimState.setRegister('B', {
            text: 'new content'
          });
          return expect(vimState.getRegister("b").text).toEqual('contentnew content');
        });
        it("appends linewise to a linewise value previously in the register", function() {
          vimState.setRegister('b', {
            type: 'linewise',
            text: 'content\n'
          });
          vimState.setRegister('B', {
            text: 'new content'
          });
          return expect(vimState.getRegister("b").text).toEqual('content\nnew content\n');
        });
        return it("appends linewise to a character value previously in the register", function() {
          vimState.setRegister('b', {
            text: 'content'
          });
          vimState.setRegister('B', {
            type: 'linewise',
            text: 'new content\n'
          });
          return expect(vimState.getRegister("b").text).toEqual('content\nnew content\n');
        });
      });
      describe("the * register", function() {
        describe("reading", function() {
          return it("is the same the system clipboard", function() {
            expect(vimState.getRegister('*').text).toEqual('initial clipboard content');
            return expect(vimState.getRegister('*').type).toEqual('character');
          });
        });
        return describe("writing", function() {
          beforeEach(function() {
            return vimState.setRegister('*', {
              text: 'new content'
            });
          });
          return it("overwrites the contents of the system clipboard", function() {
            return expect(atom.clipboard.read()).toEqual('new content');
          });
        });
      });
      describe("the + register", function() {
        describe("reading", function() {
          return it("is the same the system clipboard", function() {
            expect(vimState.getRegister('*').text).toEqual('initial clipboard content');
            return expect(vimState.getRegister('*').type).toEqual('character');
          });
        });
        return describe("writing", function() {
          beforeEach(function() {
            return vimState.setRegister('*', {
              text: 'new content'
            });
          });
          return it("overwrites the contents of the system clipboard", function() {
            return expect(atom.clipboard.read()).toEqual('new content');
          });
        });
      });
      describe("the _ register", function() {
        describe("reading", function() {
          return it("is always the empty string", function() {
            return expect(vimState.getRegister("_").text).toEqual('');
          });
        });
        return describe("writing", function() {
          return it("throws away anything written to it", function() {
            vimState.setRegister('_', {
              text: 'new content'
            });
            return expect(vimState.getRegister("_").text).toEqual('');
          });
        });
      });
      describe("the % register", function() {
        beforeEach(function() {
          return spyOn(editor, 'getURI').andReturn('/Users/atom/known_value.txt');
        });
        describe("reading", function() {
          return it("returns the filename of the current editor", function() {
            return expect(vimState.getRegister('%').text).toEqual('/Users/atom/known_value.txt');
          });
        });
        return describe("writing", function() {
          return it("throws away anything written to it", function() {
            vimState.setRegister('%', "new content");
            return expect(vimState.getRegister('%').text).toEqual('/Users/atom/known_value.txt');
          });
        });
      });
      return describe("the ctrl-r command in insert mode", function() {
        beforeEach(function() {
          editor.setText("02\n");
          editor.setCursorScreenPosition([0, 0]);
          vimState.setRegister('"', {
            text: '345'
          });
          vimState.setRegister('a', {
            text: 'abc'
          });
          atom.clipboard.write("clip");
          keydown('a');
          return editor.insertText('1');
        });
        it("inserts contents of the unnamed register with \"", function() {
          keydown('r', {
            ctrl: true
          });
          keydown('"');
          return expect(editor.getText()).toBe('013452\n');
        });
        describe("when useClipboardAsDefaultRegister enabled", function() {
          return it("inserts contents from clipboard with \"", function() {
            atom.config.set('vim-mode.useClipboardAsDefaultRegister', true);
            keydown('r', {
              ctrl: true
            });
            keydown('"');
            return expect(editor.getText()).toBe('01clip2\n');
          });
        });
        it("inserts contents of the 'a' register", function() {
          keydown('r', {
            ctrl: true
          });
          keydown('a');
          return expect(editor.getText()).toBe('01abc2\n');
        });
        return it("is cancelled with the escape key", function() {
          keydown('r', {
            ctrl: true
          });
          keydown('escape');
          expect(editor.getText()).toBe('012\n');
          expect(vimState.mode).toBe("insert");
          return expect(editor.getCursorScreenPosition()).toEqual([0, 2]);
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUvc3BlYy9wcmVmaXhlcy1zcGVjLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxPQUFBOztBQUFBLEVBQUEsT0FBQSxHQUFVLE9BQUEsQ0FBUSxlQUFSLENBQVYsQ0FBQTs7QUFBQSxFQUVBLFFBQUEsQ0FBUyxVQUFULEVBQXFCLFNBQUEsR0FBQTtBQUNuQixRQUFBLDhDQUFBO0FBQUEsSUFBQSxPQUFvQyxFQUFwQyxFQUFDLGdCQUFELEVBQVMsdUJBQVQsRUFBd0Isa0JBQXhCLENBQUE7QUFBQSxJQUVBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7QUFDVCxVQUFBLE9BQUE7QUFBQSxNQUFBLE9BQUEsR0FBVSxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQWQsQ0FBMEIsVUFBMUIsQ0FBVixDQUFBO0FBQUEsTUFDQSxPQUFPLENBQUMsaUJBQVIsQ0FBQSxDQURBLENBQUE7YUFHQSxPQUFPLENBQUMsZ0JBQVIsQ0FBeUIsU0FBQyxPQUFELEdBQUE7QUFDdkIsUUFBQSxhQUFBLEdBQWdCLE9BQWhCLENBQUE7QUFBQSxRQUNBLE1BQUEsR0FBUyxhQUFhLENBQUMsUUFBZCxDQUFBLENBRFQsQ0FBQTtBQUFBLFFBRUEsUUFBQSxHQUFXLGFBQWEsQ0FBQyxRQUZ6QixDQUFBO0FBQUEsUUFHQSxRQUFRLENBQUMsa0JBQVQsQ0FBQSxDQUhBLENBQUE7ZUFJQSxRQUFRLENBQUMsZUFBVCxDQUFBLEVBTHVCO01BQUEsQ0FBekIsRUFKUztJQUFBLENBQVgsQ0FGQSxDQUFBO0FBQUEsSUFhQSxPQUFBLEdBQVUsU0FBQyxHQUFELEVBQU0sT0FBTixHQUFBOztRQUFNLFVBQVE7T0FDdEI7O1FBQUEsT0FBTyxDQUFDLFVBQVc7T0FBbkI7YUFDQSxPQUFPLENBQUMs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

//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/vim-mode/spec/prefixes-spec.coffee
