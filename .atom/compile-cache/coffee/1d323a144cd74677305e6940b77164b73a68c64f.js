(function() {
  var helpers, settings;

  helpers = require('./spec-helper');

  settings = require('../lib/settings');

  describe("Operators", function() {
    var editor, editorElement, keydown, normalModeInputKeydown, vimState, _ref;
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
    normalModeInputKeydown = function(key, opts) {
      if (opts == null) {
        opts = {};
      }
      return editor.normalModeInputView.editorElement.getModel().setText(key);
    };
    describe("cancelling operations", function() {
      it("throws an error when no operation is pending", function() {
        return expect(function() {
          return vimState.pushOperations(new Input(''));
        }).toThrow();
      });
      return it("cancels and cleans up properly", function() {
        keydown('/');
        expect(vimState.isOperatorPending()).toBe(true);
        editor.normalModeInputView.viewModel.cancel();
        expect(vimState.isOperatorPending()).toBe(false);
        return expect(editor.normalModeInputView).toBe(void 0);
      });
    });
    describe("the x keybinding", function() {
      describe("on a line with content", function() {
        describe("without vim-mode.wrapLeftRightMotion", function() {
          beforeEach(function() {
            editor.setText("abc\n012345\n\nxyz");
            return editor.setCursorScreenPosition([1, 4]);
          });
          it("deletes a character", function() {
            keydown('x');
            expect(editor.getText()).toBe('abc\n01235\n\nxyz');
            expect(editor.getCursorScreenPosition()).toEqual([1, 4]);
            expect(vimState.getRegister('"').text).toBe('4');
            keydown('x');
            expect(editor.getText()).toBe('abc\n0123\n\nxyz');
            expect(editor.getCursorScreenPosition()).toEqual([1, 3]);
            expect(vimState.getRegister('"').text).toBe('5');
            keydown('x');
            expect(editor.getText()).toBe('abc\n012\n\nxyz');
            expect(editor.getCursorScreenPosition()).toEqual([1, 2]);
            expect(vimState.getRegister('"').text).toBe('3');
            keydown('x');
            expect(editor.getText()).toBe('abc\n01\n\nxyz');
            expect(editor.getCursorScreenPosition()).toEqual([1, 1]);
            expect(vimState.getRegister('"').text).toBe('2');
            keydown('x');
            expect(editor.getText()).toBe('abc\n0\n\nxyz');
            expect(editor.getCursorScreenPosition()).toEqual([1, 0]);
            expect(vimState.getRegister('"').text).toBe('1');
            keydown('x');
            expect(editor.getText()).toBe('abc\n\n\nxyz');
            expect(editor.getCursorScreenPosition()).toEqual([1, 0]);
            return expect(vimState.getRegister('"').text).toBe('0');
          });
          return it("deletes multiple characters with a count", function() {
            keydown('2');
            keydown('x');
            expect(editor.getText()).toBe('abc\n0123\n\nxyz');
            expect(editor.getCursorScreenPosition()).toEqual([1, 3]);
            expect(vimState.getRegister('"').text).toBe('45');
            editor.setCursorScreenPosition([0, 1]);
            keydown('3');
            keydown('x');
            expect(editor.getText()).toBe('a\n0123\n\nxyz');
            expect(editor.getCursorScreenPosition()).toEqual([0, 0]);
            return expect(vimState.getRegister('"').text).toBe('bc');
          });
        });
        describe("with multiple cursors", function() {
          beforeEach(function() {
            editor.setText("abc\n012345\n\nxyz");
            editor.setCursorScreenPosition([1, 4]);
            return editor.addCursorAtBufferPosition([0, 1]);
          });
          return it("is undone as one operation", function() {
            keydown('x');
            expect(editor.getText()).toBe("ac\n01235\n\nxyz");
            keydown('u');
            return expect(editor.getText()).toBe("abc\n012345\n\nxyz");
          });
        });
        return describe("with vim-mode.wrapLeftRightMotion", function() {
          beforeEach(function() {
            editor.setText("abc\n012345\n\nxyz");
            editor.setCursorScreenPosition([1, 4]);
            return atom.config.set('vim-mode.wrapLeftRightMotion', true);
          });
          it("deletes a character", function() {
            keydown('x');
            expect(editor.getText()).toBe('abc\n01235\n\nxyz');
            expect(editor.getCursorScreenPosition()).toEqual([1, 4]);
            expect(vimState.getRegister('"').text).toBe('4');
            keydown('x');
            expect(editor.getText()).toBe('abc\n0123\n\nxyz');
            expect(editor.getCursorScreenPosition()).toEqual([1, 3]);
            expect(vimState.getRegister('"').text).toBe('5');
            keydown('x');
            expect(editor.getText()).toBe('abc\n012\n\nxyz');
            expect(editor.getCursorScreenPosition()).toEqual([1, 2]);
            expect(vimState.getRegister('"').text).toBe('3');
            keydown('x');
            expect(editor.getText()).toBe('abc\n01\n\nxyz');
            expect(editor.getCursorScreenPosition()).toEqual([1, 1]);
            expect(vimState.getRegister('"').text).toBe('2');
            keydown('x');
            expect(editor.getText()).toBe('abc\n0\n\nxyz');
            expect(editor.getCursorScreenPosition()).toEqual([1, 0]);
            expect(vimState.getRegister('"').text).toBe('1');
            keydown('x');
            expect(editor.getText()).toBe('abc\n\n\nxyz');
            expect(editor.getCursorScreenPosition()).toEqual([1, 0]);
            return expect(vimState.getRegister('"').text).toBe('0');
          });
          return it("deletes multiple characters and newlines with a count", function() {
            atom.config.set('vim-mode.wrapLeftRightMotion', true);
            keydown('2');
            keydown('x');
            expect(editor.getText()).toBe('abc\n0123\n\nxyz');
            expect(editor.getCursorScreenPosition()).toEqual([1, 3]);
            expect(vimState.getRegister('"').text).toBe('45');
            editor.setCursorScreenPosition([0, 1]);
            keydown('3');
            keydown('x');
            expect(editor.getText()).toBe('a0123\n\nxyz');
            expect(editor.getCursorScreenPosition()).toEqual([0, 1]);
            expect(vimState.getRegister('"').text).toBe('bc\n');
            keydown('7');
            keydown('x');
            expect(editor.getText()).toBe('ayz');
            expect(editor.getCursorScreenPosition()).toEqual([0, 1]);
            return expect(vimState.getRegister('"').text).toBe('0123\n\nx');
          });
        });
      });
      return describe("on an empty line", function() {
        beforeEach(function() {
          editor.setText("abc\n012345\n\nxyz");
          return editor.setCursorScreenPosition([2, 0]);
        });
        it("deletes nothing on an empty line when vim-mode.wrapLeftRightMotion is false", function() {
          atom.config.set('vim-mode.wrapLeftRightMotion', false);
          keydown('x');
          expect(editor.getText()).toBe("abc\n012345\n\nxyz");
          return expect(editor.getCursorScreenPosition()).toEqual([2, 0]);
        });
        return it("deletes an empty line when vim-mode.wrapLeftRightMotion is true", function() {
          atom.config.set('vim-mode.wrapLeftRightMotion', true);
          keydown('x');
          expect(editor.getText()).toBe("abc\n012345\nxyz");
          return expect(editor.getCursorScreenPosition()).toEqual([2, 0]);
        });
      });
    });
    describe("the X keybinding", function() {
      describe("on a line with content", function() {
        beforeEach(function() {
          editor.setText("ab\n012345");
          return editor.setCursorScreenPosition([1, 2]);
        });
        return it("deletes a character", function() {
          keydown('X', {
            shift: true
          });
          expect(editor.getText()).toBe('ab\n02345');
          expect(editor.getCursorScreenPosition()).toEqual([1, 1]);
          expect(vimState.getRegister('"').text).toBe('1');
          keydown('X', {
            shift: true
          });
          expect(editor.getText()).toBe('ab\n2345');
          expect(editor.getCursorScreenPosition()).toEqual([1, 0]);
          expect(vimState.getRegister('"').text).toBe('0');
          keydown('X', {
            shift: true
          });
          expect(editor.getText()).toBe('ab\n2345');
          expect(editor.getCursorScreenPosition()).toEqual([1, 0]);
          expect(vimState.getRegister('"').text).toBe('0');
          atom.config.set('vim-mode.wrapLeftRightMotion', true);
          keydown('X', {
            shift: true
          });
          expect(editor.getText()).toBe('ab2345');
          expect(editor.getCursorScreenPosition()).toEqual([0, 2]);
          return expect(vimState.getRegister('"').text).toBe('\n');
        });
      });
      return describe("on an empty line", function() {
        beforeEach(function() {
          editor.setText("012345\n\nabcdef");
          return editor.setCursorScreenPosition([1, 0]);
        });
        it("deletes nothing when vim-mode.wrapLeftRightMotion is false", function() {
          atom.config.set('vim-mode.wrapLeftRightMotion', false);
          keydown('X', {
            shift: true
          });
          expect(editor.getText()).toBe("012345\n\nabcdef");
          return expect(editor.getCursorScreenPosition()).toEqual([1, 0]);
        });
        return it("deletes the newline when wrapLeftRightMotion is true", function() {
          atom.config.set('vim-mode.wrapLeftRightMotion', true);
          keydown('X', {
            shift: true
          });
          expect(editor.getText()).toBe("012345\nabcdef");
          return expect(editor.getCursorScreenPosition()).toEqual([0, 5]);
        });
      });
    });
    describe("the s keybinding", function() {
      beforeEach(function() {
        editor.setText('012345');
        return editor.setCursorScreenPosition([0, 1]);
      });
      it("deletes the character to the right and enters insert mode", function() {
        keydown('s');
        expect(editorElement.classList.contains('insert-mode')).toBe(true);
        expect(editor.getText()).toBe('02345');
        expect(editor.getCursorScreenPosition()).toEqual([0, 1]);
        return expect(vimState.getRegister('"').text).toBe('1');
      });
      it("is repeatable", function() {
        editor.setCursorScreenPosition([0, 0]);
        keydown('3');
        keydown('s');
        editor.insertText("ab");
        keydown('escape');
        expect(editor.getText()).toBe('ab345');
        editor.setCursorScreenPosition([0, 2]);
        keydown('.');
        return expect(editor.getText()).toBe('abab');
      });
      it("is undoable", function() {
        editor.setCursorScreenPosition([0, 0]);
        keydown('3');
        keydown('s');
        editor.insertText("ab");
        keydown('escape');
        expect(editor.getText()).toBe('ab345');
        keydown('u');
        expect(editor.getText()).toBe('012345');
        return expect(editor.getSelectedText()).toBe('');
      });
      return describe("in visual mode", function() {
        beforeEach(function() {
          keydown('v');
          editor.selectRight();
          return keydown('s');
        });
        return it("deletes the selected characters and enters insert mode", function() {
          expect(editorElement.classList.contains('insert-mode')).toBe(true);
          expect(editor.getText()).toBe('0345');
          expect(editor.getCursorScreenPosition()).toEqual([0, 1]);
          return expect(vimState.getRegister('"').text).toBe('12');
        });
      });
    });
    describe("the S keybinding", function() {
      beforeEach(function() {
        editor.setText("12345\nabcde\nABCDE");
        return editor.setCursorScreenPosition([1, 3]);
      });
      it("deletes the entire line and enters insert mode", function() {
        keydown('S', {
          shift: true
        });
        expect(editorElement.classList.contains('insert-mode')).toBe(true);
        expect(editor.getText()).toBe("12345\n\nABCDE");
        expect(editor.getCursorScreenPosition()).toEqual([1, 0]);
        expect(vimState.getRegister('"').text).toBe("abcde\n");
        return expect(vimState.getRegister('"').type).toBe('linewise');
      });
      it("is repeatable", function() {
        keydown('S', {
          shift: true
        });
        editor.insertText("abc");
        keydown('escape');
        expect(editor.getText()).toBe("12345\nabc\nABCDE");
        editor.setCursorScreenPosition([2, 3]);
        keydown('.');
        return expect(editor.getText()).toBe("12345\nabc\nabc\n");
      });
      it("is undoable", function() {
        keydown('S', {
          shift: true
        });
        editor.insertText("abc");
        keydown('escape');
        expect(editor.getText()).toBe("12345\nabc\nABCDE");
        keydown('u');
        expect(editor.getText()).toBe("12345\nabcde\nABCDE");
        return expect(editor.getSelectedText()).toBe('');
      });
      it("works when the cursor's goal column is greater than its current column", function() {
        editor.setText("\n12345");
        editor.setCursorBufferPosition([1, Infinity]);
        editor.moveUp();
        keydown("S", {
          shift: true
        });
        return expect(editor.getText()).toBe("\n12345");
      });
      return xit("respects indentation", function() {});
    });
    describe("the d keybinding", function() {
      it("enters operator-pending mode", function() {
        keydown('d');
        expect(editorElement.classList.contains('operator-pending-mode')).toBe(true);
        return expect(editorElement.classList.contains('normal-mode')).toBe(false);
      });
      describe("when followed by a d", function() {
        it("deletes the current line and exits operator-pending mode", function() {
          editor.setText("12345\nabcde\n\nABCDE");
          editor.setCursorScreenPosition([1, 1]);
          keydown('d');
          keydown('d');
          expect(editor.getText()).toBe("12345\n\nABCDE");
          expect(editor.getCursorScreenPosition()).toEqual([1, 0]);
          expect(vimState.getRegister('"').text).toBe("abcde\n");
          expect(editorElement.classList.contains('operator-pending-mode')).toBe(false);
          return expect(editorElement.classList.contains('normal-mode')).toBe(true);
        });
        it("deletes the last line", function() {
          editor.setText("12345\nabcde\nABCDE");
          editor.setCursorScreenPosition([2, 1]);
          keydown('d');
          keydown('d');
          expect(editor.getText()).toBe("12345\nabcde\n");
          return expect(editor.getCursorScreenPosition()).toEqual([2, 0]);
        });
        return it("leaves the cursor on the first nonblank character", function() {
          editor.setText("12345\n  abcde\n");
          editor.setCursorScreenPosition([0, 4]);
          keydown('d');
          keydown('d');
          expect(editor.getText()).toBe("  abcde\n");
          return expect(editor.getCursorScreenPosition()).toEqual([0, 2]);
        });
      });
      describe("undo behavior", function() {
        beforeEach(function() {
          editor.setText("12345\nabcde\nABCDE\nQWERT");
          return editor.setCursorScreenPosition([1, 1]);
        });
        it("undoes both lines", function() {
          keydown('d');
          keydown('2');
          keydown('d');
          keydown('u');
          expect(editor.getText()).toBe("12345\nabcde\nABCDE\nQWERT");
          return expect(editor.getSelectedText()).toBe('');
        });
        return describe("with multiple cursors", function() {
          beforeEach(function() {
            editor.setCursorBufferPosition([1, 1]);
            return editor.addCursorAtBufferPosition([0, 0]);
          });
          return it("is undone as one operation", function() {
            keydown('d');
            keydown('l');
            keydown('u');
            expect(editor.getText()).toBe("12345\nabcde\nABCDE\nQWERT");
            return expect(editor.getSelectedText()).toBe('');
          });
        });
      });
      describe("when followed by a w", function() {
        it("deletes the next word until the end of the line and exits operator-pending mode", function() {
          editor.setText("abcd efg\nabc");
          editor.setCursorScreenPosition([0, 5]);
          keydown('d');
          keydown('w');
          expect(editor.getText()).toBe("abcd abc");
          expect(editor.getCursorScreenPosition()).toEqual([0, 5]);
          expect(editorElement.classList.contains('operator-pending-mode')).toBe(false);
          return expect(editorElement.classList.contains('normal-mode')).toBe(true);
        });
        return it("deletes to the beginning of the next word", function() {
          editor.setText('abcd efg');
          editor.setCursorScreenPosition([0, 2]);
          keydown('d');
          keydown('w');
          expect(editor.getText()).toBe('abefg');
          expect(editor.getCursorScreenPosition()).toEqual([0, 2]);
          editor.setText('one two three four');
          editor.setCursorScreenPosition([0, 0]);
          keydown('d');
          keydown('3');
          keydown('w');
          expect(editor.getText()).toBe('four');
          return expect(editor.getCursorScreenPosition()).toEqual([0, 0]);
        });
      });
      describe("when followed by an iw", function() {
        return it("deletes the containing word", function() {
          editor.setText("12345 abcde ABCDE");
          editor.setCursorScreenPosition([0, 9]);
          keydown('d');
          expect(editorElement.classList.contains('operator-pending-mode')).toBe(true);
          keydown('i');
          keydown('w');
          expect(editor.getText()).toBe("12345  ABCDE");
          expect(editor.getCursorScreenPosition()).toEqual([0, 6]);
          expect(vimState.getRegister('"').text).toBe("abcde");
          expect(editorElement.classList.contains('operator-pending-mode')).toBe(false);
          return expect(editorElement.classList.contains('normal-mode')).toBe(true);
        });
      });
      describe("when followed by a j", function() {
        var originalText;
        originalText = "12345\nabcde\nABCDE\n";
        beforeEach(function() {
          return editor.setText(originalText);
        });
        describe("on the beginning of the file", function() {
          return it("deletes the next two lines", function() {
            editor.setCursorScreenPosition([0, 0]);
            keydown('d');
            keydown('j');
            return expect(editor.getText()).toBe("ABCDE\n");
          });
        });
        describe("on the end of the file", function() {
          return it("deletes nothing", function() {
            editor.setCursorScreenPosition([4, 0]);
            keydown('d');
            keydown('j');
            return expect(editor.getText()).toBe(originalText);
          });
        });
        return describe("on the middle of second line", function() {
          return it("deletes the last two lines", function() {
            editor.setCursorScreenPosition([1, 2]);
            keydown('d');
            keydown('j');
            return expect(editor.getText()).toBe("12345\n");
          });
        });
      });
      describe("when followed by an k", function() {
        var originalText;
        originalText = "12345\nabcde\nABCDE";
        beforeEach(function() {
          return editor.setText(originalText);
        });
        describe("on the end of the file", function() {
          return it("deletes the bottom two lines", function() {
            editor.setCursorScreenPosition([2, 4]);
            keydown('d');
            keydown('k');
            return expect(editor.getText()).toBe("12345\n");
          });
        });
        describe("on the beginning of the file", function() {
          return xit("deletes nothing", function() {
            editor.setCursorScreenPosition([0, 0]);
            keydown('d');
            keydown('k');
            return expect(editor.getText()).toBe(originalText);
          });
        });
        return describe("when on the middle of second line", function() {
          return it("deletes the first two lines", function() {
            editor.setCursorScreenPosition([1, 2]);
            keydown('d');
            keydown('k');
            return expect(editor.getText()).toBe("ABCDE");
          });
        });
      });
      describe("when followed by a G", function() {
        beforeEach(function() {
          var originalText;
          originalText = "12345\nabcde\nABCDE";
          return editor.setText(originalText);
        });
        describe("on the beginning of the second line", function() {
          return it("deletes the bottom two lines", function() {
            editor.setCursorScreenPosition([1, 0]);
            keydown('d');
            keydown('G', {
              shift: true
            });
            return expect(editor.getText()).toBe("12345\n");
          });
        });
        return describe("on the middle of the second line", function() {
          return it("deletes the bottom two lines", function() {
            editor.setCursorScreenPosition([1, 2]);
            keydown('d');
            keydown('G', {
              shift: true
            });
            return expect(editor.getText()).toBe("12345\n");
          });
        });
      });
      describe("when followed by a goto line G", function() {
        beforeEach(function() {
          var originalText;
          originalText = "12345\nabcde\nABCDE";
          return editor.setText(originalText);
        });
        describe("on the beginning of the second line", function() {
          return it("deletes the bottom two lines", function() {
            editor.setCursorScreenPosition([1, 0]);
            keydown('d');
            keydown('2');
            keydown('G', {
              shift: true
            });
            return expect(editor.getText()).toBe("12345\nABCDE");
          });
        });
        return describe("on the middle of the second line", function() {
          return it("deletes the bottom two lines", function() {
            editor.setCursorScreenPosition([1, 2]);
            keydown('d');
            keydown('2');
            keydown('G', {
              shift: true
            });
            return expect(editor.getText()).toBe("12345\nABCDE");
          });
        });
      });
      describe("when followed by a t)", function() {
        return describe("with the entire line yanked before", function() {
          beforeEach(function() {
            editor.setText("test (xyz)");
            return editor.setCursorScreenPosition([0, 6]);
          });
          return it("deletes until the closing parenthesis", function() {
            keydown('y');
            keydown('y');
            keydown('d');
            keydown('t');
            normalModeInputKeydown(')');
            expect(editor.getText()).toBe("test ()");
            return expect(editor.getCursorScreenPosition()).toEqual([0, 6]);
          });
        });
      });
      return describe("with multiple cursors", function() {
        it("deletes each selection", function() {
          editor.setText("abcd\n1234\nABCD\n");
          editor.setCursorBufferPosition([0, 1]);
          editor.addCursorAtBufferPosition([1, 2]);
          editor.addCursorAtBufferPosition([2, 3]);
          keydown('d');
          keydown('e');
          expect(editor.getText()).toBe("a\n12\nABC");
          return expect(editor.getCursorBufferPositions()).toEqual([[0, 0], [1, 1], [2, 2]]);
        });
        return it("doesn't delete empty selections", function() {
          editor.setText("abcd\nabc\nabd");
          editor.setCursorBufferPosition([0, 0]);
          editor.addCursorAtBufferPosition([1, 0]);
          editor.addCursorAtBufferPosition([2, 0]);
          keydown('d');
          keydown('t');
          normalModeInputKeydown('d');
          expect(editor.getText()).toBe("d\nabc\nd");
          return expect(editor.getCursorBufferPositions()).toEqual([[0, 0], [1, 0], [2, 0]]);
        });
      });
    });
    describe("the D keybinding", function() {
      beforeEach(function() {
        editor.getBuffer().setText("012\n");
        editor.setCursorScreenPosition([0, 1]);
        return keydown('D', {
          shift: true
        });
      });
      return it("deletes the contents until the end of the line", function() {
        return expect(editor.getText()).toBe("0\n");
      });
    });
    describe("the c keybinding", function() {
      beforeEach(function() {
        return editor.setText("12345\nabcde\nABCDE");
      });
      describe("when followed by a c", function() {
        describe("with autoindent", function() {
          beforeEach(function() {
            editor.setText("12345\n  abcde\nABCDE");
            editor.setCursorScreenPosition([1, 1]);
            spyOn(editor, 'shouldAutoIndent').andReturn(true);
            spyOn(editor, 'autoIndentBufferRow').andCallFake(function(line) {
              return editor.indent();
            });
            return spyOn(editor.languageMode, 'suggestedIndentForLineAtBufferRow').andCallFake(function() {
              return 1;
            });
          });
          it("deletes the current line and enters insert mode", function() {
            editor.setCursorScreenPosition([1, 1]);
            keydown('c');
            keydown('c');
            expect(editor.getText()).toBe("12345\n  \nABCDE");
            expect(editor.getCursorScreenPosition()).toEqual([1, 2]);
            expect(editorElement.classList.contains('normal-mode')).toBe(false);
            return expect(editorElement.classList.contains('insert-mode')).toBe(true);
          });
          it("is repeatable", function() {
            keydown('c');
            keydown('c');
            editor.insertText("abc");
            keydown('escape');
            expect(editor.getText()).toBe("12345\n  abc\nABCDE");
            editor.setCursorScreenPosition([2, 3]);
            keydown('.');
            return expect(editor.getText()).toBe("12345\n  abc\n  abc\n");
          });
          return it("is undoable", function() {
            keydown('c');
            keydown('c');
            editor.insertText("abc");
            keydown('escape');
            expect(editor.getText()).toBe("12345\n  abc\nABCDE");
            keydown('u');
            expect(editor.getText()).toBe("12345\n  abcde\nABCDE");
            return expect(editor.getSelectedText()).toBe('');
          });
        });
        describe("when the cursor is on the last line", function() {
          return it("deletes the line's content and enters insert mode on the last line", function() {
            editor.setCursorScreenPosition([2, 1]);
            keydown('c');
            keydown('c');
            expect(editor.getText()).toBe("12345\nabcde\n\n");
            expect(editor.getCursorScreenPosition()).toEqual([2, 0]);
            expect(editorElement.classList.contains('normal-mode')).toBe(false);
            return expect(editorElement.classList.contains('insert-mode')).toBe(true);
          });
        });
        return describe("when the cursor is on the only line", function() {
          return it("deletes the line's content and enters insert mode", function() {
            editor.setText("12345");
            editor.setCursorScreenPosition([0, 2]);
            keydown('c');
            keydown('c');
            expect(editor.getText()).toBe("");
            expect(editor.getCursorScreenPosition()).toEqual([0, 0]);
            expect(editorElement.classList.contains('normal-mode')).toBe(false);
            return expect(editorElement.classList.contains('insert-mode')).toBe(true);
          });
        });
      });
      describe("when followed by i w", function() {
        return it("undo's and redo's completely", function() {
          editor.setCursorScreenPosition([1, 1]);
          keydown('c');
          keydown('i');
          keydown('w');
          expect(editor.getText()).toBe("12345\n\nABCDE");
          expect(editor.getCursorScreenPosition()).toEqual([1, 0]);
          expect(editorElement.classList.contains('insert-mode')).toBe(true);
          editor.setText("12345\nfg\nABCDE");
          keydown('escape');
          expect(editorElement.classList.contains('normal-mode')).toBe(true);
          expect(editor.getText()).toBe("12345\nfg\nABCDE");
          keydown('u');
          expect(editor.getText()).toBe("12345\nabcde\nABCDE");
          keydown('r', {
            ctrl: true
          });
          return expect(editor.getText()).toBe("12345\nfg\nABCDE");
        });
      });
      describe("when followed by a w", function() {
        return it("changes the word", function() {
          editor.setText("word1 word2 word3");
          editor.setCursorBufferPosition([0, "word1 w".length]);
          keydown("c");
          keydown("w");
          keydown("escape");
          return expect(editor.getText()).toBe("word1 w word3");
        });
      });
      describe("when followed by a G", function() {
        beforeEach(function() {
          var originalText;
          originalText = "12345\nabcde\nABCDE";
          return editor.setText(originalText);
        });
        describe("on the beginning of the second line", function() {
          return it("deletes the bottom two lines", function() {
            editor.setCursorScreenPosition([1, 0]);
            keydown('c');
            keydown('G', {
              shift: true
            });
            keydown('escape');
            return expect(editor.getText()).toBe("12345\n\n");
          });
        });
        return describe("on the middle of the second line", function() {
          return it("deletes the bottom two lines", function() {
            editor.setCursorScreenPosition([1, 2]);
            keydown('c');
            keydown('G', {
              shift: true
            });
            keydown('escape');
            return expect(editor.getText()).toBe("12345\n\n");
          });
        });
      });
      describe("when followed by a %", function() {
        beforeEach(function() {
          return editor.setText("12345(67)8\nabc(d)e\nA()BCDE");
        });
        describe("before brackets or on the first one", function() {
          beforeEach(function() {
            editor.setCursorScreenPosition([0, 1]);
            editor.addCursorAtScreenPosition([1, 1]);
            editor.addCursorAtScreenPosition([2, 1]);
            keydown('c');
            keydown('%');
            return editor.insertText('x');
          });
          it("replaces inclusively until matching bracket", function() {
            expect(editor.getText()).toBe("1x8\naxe\nAxBCDE");
            return expect(vimState.mode).toBe("insert");
          });
          return it("undoes correctly with u", function() {
            keydown('escape');
            expect(vimState.mode).toBe("normal");
            keydown('u');
            return expect(editor.getText()).toBe("12345(67)8\nabc(d)e\nA()BCDE");
          });
        });
        describe("inside brackets or on the ending one", function() {
          return it("replaces inclusively backwards until matching bracket", function() {
            editor.setCursorScreenPosition([0, 6]);
            editor.addCursorAtScreenPosition([1, 5]);
            editor.addCursorAtScreenPosition([2, 2]);
            keydown('c');
            keydown('%');
            editor.insertText('x');
            expect(editor.getText()).toBe("12345x7)8\nabcxe\nAxBCDE");
            return expect(vimState.mode).toBe("insert");
          });
        });
        describe("after or without brackets", function() {
          return it("deletes nothing", function() {
            editor.setText("12345(67)8\nabc(d)e\nABCDE");
            editor.setCursorScreenPosition([0, 9]);
            editor.addCursorAtScreenPosition([2, 2]);
            keydown('c');
            keydown('%');
            expect(editor.getText()).toBe("12345(67)8\nabc(d)e\nABCDE");
            return expect(vimState.mode).toBe("normal");
          });
        });
        return describe("repetition with .", function() {
          beforeEach(function() {
            editor.setCursorScreenPosition([0, 1]);
            keydown('c');
            keydown('%');
            editor.insertText('x');
            return keydown('escape');
          });
          it("repeats correctly before a bracket", function() {
            editor.setCursorScreenPosition([1, 0]);
            keydown('.');
            expect(editor.getText()).toBe("1x8\nxe\nA()BCDE");
            return expect(vimState.mode).toBe("normal");
          });
          it("repeats correctly on the opening bracket", function() {
            editor.setCursorScreenPosition([1, 3]);
            keydown('.');
            expect(editor.getText()).toBe("1x8\nabcxe\nA()BCDE");
            return expect(vimState.mode).toBe("normal");
          });
          it("repeats correctly inside brackets", function() {
            editor.setCursorScreenPosition([1, 4]);
            keydown('.');
            expect(editor.getText()).toBe("1x8\nabcx)e\nA()BCDE");
            return expect(vimState.mode).toBe("normal");
          });
          it("repeats correctly on the closing bracket", function() {
            editor.setCursorScreenPosition([1, 5]);
            keydown('.');
            expect(editor.getText()).toBe("1x8\nabcxe\nA()BCDE");
            return expect(vimState.mode).toBe("normal");
          });
          return it("does nothing when repeated after a bracket", function() {
            editor.setCursorScreenPosition([2, 3]);
            keydown('.');
            expect(editor.getText()).toBe("1x8\nabc(d)e\nA()BCDE");
            return expect(vimState.mode).toBe("normal");
          });
        });
      });
      describe("when followed by a goto line G", function() {
        beforeEach(function() {
          return editor.setText("12345\nabcde\nABCDE");
        });
        describe("on the beginning of the second line", function() {
          return it("deletes all the text on the line", function() {
            editor.setCursorScreenPosition([1, 0]);
            keydown('c');
            keydown('2');
            keydown('G', {
              shift: true
            });
            keydown('escape');
            return expect(editor.getText()).toBe("12345\n\nABCDE");
          });
        });
        return describe("on the middle of the second line", function() {
          return it("deletes all the text on the line", function() {
            editor.setCursorScreenPosition([1, 2]);
            keydown('c');
            keydown('2');
            keydown('G', {
              shift: true
            });
            keydown('escape');
            return expect(editor.getText()).toBe("12345\n\nABCDE");
          });
        });
      });
      return describe("in visual mode", function() {
        beforeEach(function() {
          editor.setText("123456789\nabcde\nfghijklmnopq\nuvwxyz");
          return editor.setCursorScreenPosition([1, 1]);
        });
        describe("with characterwise selection on a single line", function() {
          it("repeats with .", function() {
            keydown('v');
            keydown('2');
            keydown('l');
            keydown('c');
            editor.insertText("ab");
            keydown('escape');
            expect(editor.getText()).toBe("123456789\naabe\nfghijklmnopq\nuvwxyz");
            editor.setCursorScreenPosition([0, 1]);
            keydown('.');
            return expect(editor.getText()).toBe("1ab56789\naabe\nfghijklmnopq\nuvwxyz");
          });
          it("repeats shortened with . near the end of the line", function() {
            editor.setCursorScreenPosition([0, 2]);
            keydown('v');
            keydown('4');
            keydown('l');
            keydown('c');
            editor.insertText("ab");
            keydown('escape');
            expect(editor.getText()).toBe("12ab89\nabcde\nfghijklmnopq\nuvwxyz");
            editor.setCursorScreenPosition([1, 3]);
            keydown('.');
            return expect(editor.getText()).toBe("12ab89\nabcab\nfghijklmnopq\nuvwxyz");
          });
          return it("repeats shortened with . near the end of the line regardless of whether motion wrapping is enabled", function() {
            atom.config.set('vim-mode.wrapLeftRightMotion', true);
            editor.setCursorScreenPosition([0, 2]);
            keydown('v');
            keydown('4');
            keydown('l');
            keydown('c');
            editor.insertText("ab");
            keydown('escape');
            expect(editor.getText()).toBe("12ab89\nabcde\nfghijklmnopq\nuvwxyz");
            editor.setCursorScreenPosition([1, 3]);
            keydown('.');
            return expect(editor.getText()).toBe("12ab89\nabcab\nfghijklmnopq\nuvwxyz");
          });
        });
        describe("is repeatable with characterwise selection over multiple lines", function() {
          it("repeats with .", function() {
            keydown('v');
            keydown('j');
            keydown('3');
            keydown('l');
            keydown('c');
            editor.insertText("x");
            keydown('escape');
            expect(editor.getText()).toBe("123456789\naxklmnopq\nuvwxyz");
            editor.setCursorScreenPosition([0, 1]);
            keydown('.');
            return expect(editor.getText()).toBe("1xnopq\nuvwxyz");
          });
          return it("repeats shortened with . near the end of the line", function() {
            keydown('v');
            keydown('j');
            keydown('6');
            keydown('l');
            keydown('c');
            editor.insertText("x");
            keydown('escape');
            expect(editor.getText()).toBe("123456789\naxnopq\nuvwxyz");
            editor.setCursorScreenPosition([0, 1]);
            keydown('.');
            return expect(editor.getText()).toBe("1x\nuvwxyz");
          });
        });
        describe("is repeatable with linewise selection", function() {
          describe("with one line selected", function() {
            return it("repeats with .", function() {
              keydown('V', {
                shift: true
              });
              keydown('c');
              editor.insertText("x");
              keydown('escape');
              expect(editor.getText()).toBe("123456789\nx\nfghijklmnopq\nuvwxyz");
              editor.setCursorScreenPosition([0, 7]);
              keydown('.');
              expect(editor.getText()).toBe("x\nx\nfghijklmnopq\nuvwxyz");
              editor.setCursorScreenPosition([2, 0]);
              keydown('.');
              return expect(editor.getText()).toBe("x\nx\nx\nuvwxyz");
            });
          });
          return describe("with multiple lines selected", function() {
            it("repeats with .", function() {
              keydown('V', {
                shift: true
              });
              keydown('j');
              keydown('c');
              editor.insertText("x");
              keydown('escape');
              expect(editor.getText()).toBe("123456789\nx\nuvwxyz");
              editor.setCursorScreenPosition([0, 7]);
              keydown('.');
              return expect(editor.getText()).toBe("x\nuvwxyz");
            });
            return it("repeats shortened with . near the end of the file", function() {
              keydown('V', {
                shift: true
              });
              keydown('j');
              keydown('c');
              editor.insertText("x");
              keydown('escape');
              expect(editor.getText()).toBe("123456789\nx\nuvwxyz");
              editor.setCursorScreenPosition([1, 7]);
              keydown('.');
              return expect(editor.getText()).toBe("123456789\nx\n");
            });
          });
        });
        return xdescribe("is repeatable with block selection", function() {});
      });
    });
    describe("the C keybinding", function() {
      beforeEach(function() {
        editor.getBuffer().setText("012\n");
        editor.setCursorScreenPosition([0, 1]);
        return keydown('C', {
          shift: true
        });
      });
      return it("deletes the contents until the end of the line and enters insert mode", function() {
        expect(editor.getText()).toBe("0\n");
        expect(editor.getCursorScreenPosition()).toEqual([0, 1]);
        expect(editorElement.classList.contains('normal-mode')).toBe(false);
        return expect(editorElement.classList.contains('insert-mode')).toBe(true);
      });
    });
    describe("the y keybinding", function() {
      beforeEach(function() {
        editor.getBuffer().setText("012 345\nabc\ndefg\n");
        editor.setCursorScreenPosition([0, 4]);
        return vimState.setRegister('"', {
          text: '345'
        });
      });
      describe("when selected lines in visual linewise mode", function() {
        beforeEach(function() {
          keydown('V', {
            shift: true
          });
          keydown('j');
          return keydown('y');
        });
        it("is in linewise motion", function() {
          return expect(vimState.getRegister('"').type).toEqual("linewise");
        });
        it("saves the lines to the default register", function() {
          return expect(vimState.getRegister('"').text).toBe("012 345\nabc\n");
        });
        return it("places the cursor at the beginning of the selection", function() {
          return expect(editor.getCursorBufferPositions()).toEqual([[0, 0]]);
        });
      });
      describe("when followed by a second y ", function() {
        beforeEach(function() {
          keydown('y');
          return keydown('y');
        });
        it("saves the line to the default register", function() {
          return expect(vimState.getRegister('"').text).toBe("012 345\n");
        });
        return it("leaves the cursor at the starting position", function() {
          return expect(editor.getCursorScreenPosition()).toEqual([0, 4]);
        });
      });
      describe("when useClipboardAsDefaultRegister enabled", function() {
        return it("writes to clipboard", function() {
          atom.config.set('vim-mode.useClipboardAsDefaultRegister', true);
          keydown('y');
          keydown('y');
          return expect(atom.clipboard.read()).toBe('012 345\n');
        });
      });
      describe("when followed with a repeated y", function() {
        beforeEach(function() {
          keydown('y');
          keydown('2');
          return keydown('y');
        });
        it("copies n lines, starting from the current", function() {
          return expect(vimState.getRegister('"').text).toBe("012 345\nabc\n");
        });
        return it("leaves the cursor at the starting position", function() {
          return expect(editor.getCursorScreenPosition()).toEqual([0, 4]);
        });
      });
      describe("with a register", function() {
        beforeEach(function() {
          keydown('"');
          keydown('a');
          keydown('y');
          return keydown('y');
        });
        it("saves the line to the a register", function() {
          return expect(vimState.getRegister('a').text).toBe("012 345\n");
        });
        return it("appends the line to the A register", function() {
          keydown('"');
          keydown('A', {
            shift: true
          });
          keydown('y');
          keydown('y');
          return expect(vimState.getRegister('a').text).toBe("012 345\n012 345\n");
        });
      });
      describe("with a forward motion", function() {
        beforeEach(function() {
          keydown('y');
          return keydown('e');
        });
        it("saves the selected text to the default register", function() {
          return expect(vimState.getRegister('"').text).toBe('345');
        });
        it("leaves the cursor at the starting position", function() {
          return expect(editor.getCursorScreenPosition()).toEqual([0, 4]);
        });
        return it("does not yank when motion fails", function() {
          keydown('y');
          keydown('t');
          normalModeInputKeydown('x');
          return expect(vimState.getRegister('"').text).toBe('345');
        });
      });
      describe("with a text object", function() {
        return it("moves the cursor to the beginning of the text object", function() {
          editor.setCursorBufferPosition([0, 5]);
          keydown("y");
          keydown("i");
          keydown("w");
          return expect(editor.getCursorBufferPositions()).toEqual([[0, 4]]);
        });
      });
      describe("with a left motion", function() {
        beforeEach(function() {
          keydown('y');
          return keydown('h');
        });
        it("saves the left letter to the default register", function() {
          return expect(vimState.getRegister('"').text).toBe(" ");
        });
        return it("moves the cursor position to the left", function() {
          return expect(editor.getCursorScreenPosition()).toEqual([0, 3]);
        });
      });
      describe("with a down motion", function() {
        beforeEach(function() {
          keydown('y');
          return keydown('j');
        });
        it("saves both full lines to the default register", function() {
          return expect(vimState.getRegister('"').text).toBe("012 345\nabc\n");
        });
        return it("leaves the cursor at the starting position", function() {
          return expect(editor.getCursorScreenPosition()).toEqual([0, 4]);
        });
      });
      describe("with an up motion", function() {
        beforeEach(function() {
          editor.setCursorScreenPosition([2, 2]);
          keydown('y');
          return keydown('k');
        });
        it("saves both full lines to the default register", function() {
          return expect(vimState.getRegister('"').text).toBe("abc\ndefg\n");
        });
        return it("puts the cursor on the first line and the original column", function() {
          return expect(editor.getCursorScreenPosition()).toEqual([1, 2]);
        });
      });
      describe("when followed by a G", function() {
        beforeEach(function() {
          var originalText;
          originalText = "12345\nabcde\nABCDE";
          return editor.setText(originalText);
        });
        describe("on the beginning of the second line", function() {
          return it("deletes the bottom two lines", function() {
            editor.setCursorScreenPosition([1, 0]);
            keydown('y');
            keydown('G', {
              shift: true
            });
            keydown('P', {
              shift: true
            });
            return expect(editor.getText()).toBe("12345\nabcde\nABCDE\nabcde\nABCDE");
          });
        });
        return describe("on the middle of the second line", function() {
          return it("deletes the bottom two lines", function() {
            editor.setCursorScreenPosition([1, 2]);
            keydown('y');
            keydown('G', {
              shift: true
            });
            keydown('P', {
              shift: true
            });
            return expect(editor.getText()).toBe("12345\nabcde\nABCDE\nabcde\nABCDE");
          });
        });
      });
      describe("when followed by a goto line G", function() {
        beforeEach(function() {
          var originalText;
          originalText = "12345\nabcde\nABCDE";
          return editor.setText(originalText);
        });
        describe("on the beginning of the second line", function() {
          return it("deletes the bottom two lines", function() {
            editor.setCursorScreenPosition([1, 0]);
            keydown('y');
            keydown('2');
            keydown('G', {
              shift: true
            });
            keydown('P', {
              shift: true
            });
            return expect(editor.getText()).toBe("12345\nabcde\nabcde\nABCDE");
          });
        });
        return describe("on the middle of the second line", function() {
          return it("deletes the bottom two lines", function() {
            editor.setCursorScreenPosition([1, 2]);
            keydown('y');
            keydown('2');
            keydown('G', {
              shift: true
            });
            keydown('P', {
              shift: true
            });
            return expect(editor.getText()).toBe("12345\nabcde\nabcde\nABCDE");
          });
        });
      });
      describe("with multiple cursors", function() {
        return it("moves each cursor and copies the last selection's text", function() {
          editor.setText("  abcd\n  1234");
          editor.setCursorBufferPosition([0, 0]);
          editor.addCursorAtBufferPosition([1, 5]);
          keydown("y");
          keydown("^");
          expect(vimState.getRegister('"').text).toBe('123');
          return expect(editor.getCursorBufferPositions()).toEqual([[0, 0], [1, 2]]);
        });
      });
      return describe("in a long file", function() {
        beforeEach(function() {
          var i, text, _i;
          jasmine.attachToDOM(editorElement);
          editorElement.setHeight(400);
          editorElement.style.lineHeight = "10px";
          editorElement.style.font = "16px monospace";
          atom.views.performDocumentPoll();
          text = "";
          for (i = _i = 1; _i <= 200; i = ++_i) {
            text += "" + i + "\n";
          }
          return editor.setText(text);
        });
        describe("yanking many lines forward", function() {
          return it("does not scroll the window", function() {
            var previousScrollTop;
            editor.setCursorBufferPosition([40, 1]);
            previousScrollTop = editorElement.getScrollTop();
            keydown('y');
            keydown('1');
            keydown('6');
            keydown('0');
            keydown('G', {
              shift: true
            });
            expect(editorElement.getScrollTop()).toEqual(previousScrollTop);
            expect(editor.getCursorBufferPosition()).toEqual([40, 1]);
            return expect(vimState.getRegister('"').text.split('\n').length).toBe(121);
          });
        });
        return describe("yanking many lines backwards", function() {
          return it("scrolls the window", function() {
            var previousScrollTop;
            editor.setCursorBufferPosition([140, 1]);
            previousScrollTop = editorElement.getScrollTop();
            keydown('y');
            keydown('6');
            keydown('0');
            keydown('G', {
              shift: true
            });
            expect(editorElement.getScrollTop()).toNotEqual(previousScrollTop);
            expect(editor.getCursorBufferPosition()).toEqual([59, 1]);
            return expect(vimState.getRegister('"').text.split('\n').length).toBe(83);
          });
        });
      });
    });
    describe("the yy keybinding", function() {
      describe("on a single line file", function() {
        beforeEach(function() {
          editor.getBuffer().setText("exclamation!\n");
          return editor.setCursorScreenPosition([0, 0]);
        });
        return it("copies the entire line and pastes it correctly", function() {
          keydown('y');
          keydown('y');
          keydown('p');
          expect(vimState.getRegister('"').text).toBe("exclamation!\n");
          return expect(editor.getText()).toBe("exclamation!\nexclamation!\n");
        });
      });
      return describe("on a single line file with no newline", function() {
        beforeEach(function() {
          editor.getBuffer().setText("no newline!");
          return editor.setCursorScreenPosition([0, 0]);
        });
        it("copies the entire line and pastes it correctly", function() {
          keydown('y');
          keydown('y');
          keydown('p');
          expect(vimState.getRegister('"').text).toBe("no newline!\n");
          return expect(editor.getText()).toBe("no newline!\nno newline!");
        });
        return it("copies the entire line and pastes it respecting count and new lines", function() {
          keydown('y');
          keydown('y');
          keydown('2');
          keydown('p');
          expect(vimState.getRegister('"').text).toBe("no newline!\n");
          return expect(editor.getText()).toBe("no newline!\nno newline!\nno newline!");
        });
      });
    });
    describe("the Y keybinding", function() {
      beforeEach(function() {
        editor.getBuffer().setText("012 345\nabc\n");
        return editor.setCursorScreenPosition([0, 4]);
      });
      return it("saves the line to the default register", function() {
        keydown('Y', {
          shift: true
        });
        expect(vimState.getRegister('"').text).toBe("012 345\n");
        return expect(editor.getCursorScreenPosition()).toEqual([0, 4]);
      });
    });
    describe("the p keybinding", function() {
      describe("with character contents", function() {
        beforeEach(function() {
          editor.getBuffer().setText("012\n");
          editor.setCursorScreenPosition([0, 0]);
          vimState.setRegister('"', {
            text: '345'
          });
          vimState.setRegister('a', {
            text: 'a'
          });
          return atom.clipboard.write("clip");
        });
        describe("from the default register", function() {
          beforeEach(function() {
            return keydown('p');
          });
          return it("inserts the contents", function() {
            expect(editor.getText()).toBe("034512\n");
            return expect(editor.getCursorScreenPosition()).toEqual([0, 3]);
          });
        });
        describe("at the end of a line", function() {
          beforeEach(function() {
            editor.setCursorScreenPosition([0, 2]);
            return keydown('p');
          });
          return it("positions cursor correctly", function() {
            expect(editor.getText()).toBe("012345\n");
            return expect(editor.getCursorScreenPosition()).toEqual([0, 5]);
          });
        });
        describe("when useClipboardAsDefaultRegister enabled", function() {
          return it("inserts contents from clipboard", function() {
            atom.config.set('vim-mode.useClipboardAsDefaultRegister', true);
            keydown('p');
            return expect(editor.getText()).toBe("0clip12\n");
          });
        });
        describe("from a specified register", function() {
          beforeEach(function() {
            keydown('"');
            keydown('a');
            return keydown('p');
          });
          return it("inserts the contents of the 'a' register", function() {
            expect(editor.getText()).toBe("0a12\n");
            return expect(editor.getCursorScreenPosition()).toEqual([0, 1]);
          });
        });
        describe("at the end of a line", function() {
          return it("inserts before the current line's newline", function() {
            editor.setText("abcde\none two three");
            editor.setCursorScreenPosition([1, 4]);
            keydown('d');
            keydown('$');
            keydown('k');
            keydown('$');
            keydown('p');
            return expect(editor.getText()).toBe("abcdetwo three\none ");
          });
        });
        return describe("with a selection", function() {
          beforeEach(function() {
            editor.selectRight();
            return keydown('p');
          });
          return it("replaces the current selection", function() {
            expect(editor.getText()).toBe("34512\n");
            return expect(editor.getCursorScreenPosition()).toEqual([0, 2]);
          });
        });
      });
      describe("with linewise contents", function() {
        describe("on a single line", function() {
          beforeEach(function() {
            editor.getBuffer().setText("012");
            editor.setCursorScreenPosition([0, 1]);
            return vimState.setRegister('"', {
              text: " 345\n",
              type: 'linewise'
            });
          });
          it("inserts the contents of the default register", function() {
            keydown('p');
            expect(editor.getText()).toBe("012\n 345");
            return expect(editor.getCursorScreenPosition()).toEqual([1, 1]);
          });
          return it("replaces the current selection", function() {
            editor.selectRight();
            keydown('p');
            expect(editor.getText()).toBe("0 345\n2");
            return expect(editor.getCursorScreenPosition()).toEqual([1, 0]);
          });
        });
        return describe("on multiple lines", function() {
          beforeEach(function() {
            editor.getBuffer().setText("012\n 345");
            return vimState.setRegister('"', {
              text: " 456\n",
              type: 'linewise'
            });
          });
          it("inserts the contents of the default register at middle line", function() {
            editor.setCursorScreenPosition([0, 1]);
            keydown('p');
            expect(editor.getText()).toBe("012\n 456\n 345");
            return expect(editor.getCursorScreenPosition()).toEqual([1, 1]);
          });
          return it("inserts the contents of the default register at end of line", function() {
            editor.setCursorScreenPosition([1, 1]);
            keydown('p');
            expect(editor.getText()).toBe("012\n 345\n 456");
            return expect(editor.getCursorScreenPosition()).toEqual([2, 1]);
          });
        });
      });
      describe("with multiple linewise contents", function() {
        beforeEach(function() {
          editor.getBuffer().setText("012\nabc");
          editor.setCursorScreenPosition([1, 0]);
          vimState.setRegister('"', {
            text: " 345\n 678\n",
            type: 'linewise'
          });
          return keydown('p');
        });
        return it("inserts the contents of the default register", function() {
          expect(editor.getText()).toBe("012\nabc\n 345\n 678");
          return expect(editor.getCursorScreenPosition()).toEqual([2, 1]);
        });
      });
      return describe("pasting twice", function() {
        beforeEach(function() {
          editor.setText("12345\nabcde\nABCDE\nQWERT");
          editor.setCursorScreenPosition([1, 1]);
          vimState.setRegister('"', {
            text: '123'
          });
          keydown('2');
          return keydown('p');
        });
        it("inserts the same line twice", function() {
          return expect(editor.getText()).toBe("12345\nab123123cde\nABCDE\nQWERT");
        });
        return describe("when undone", function() {
          beforeEach(function() {
            return keydown('u');
          });
          return it("removes both lines", function() {
            return expect(editor.getText()).toBe("12345\nabcde\nABCDE\nQWERT");
          });
        });
      });
    });
    describe("the P keybinding", function() {
      return describe("with character contents", function() {
        beforeEach(function() {
          editor.getBuffer().setText("012\n");
          editor.setCursorScreenPosition([0, 0]);
          vimState.setRegister('"', {
            text: '345'
          });
          vimState.setRegister('a', {
            text: 'a'
          });
          return keydown('P', {
            shift: true
          });
        });
        return it("inserts the contents of the default register above", function() {
          expect(editor.getText()).toBe("345012\n");
          return expect(editor.getCursorScreenPosition()).toEqual([0, 2]);
        });
      });
    });
    describe("the O keybinding", function() {
      beforeEach(function() {
        spyOn(editor, 'shouldAutoIndent').andReturn(true);
        spyOn(editor, 'autoIndentBufferRow').andCallFake(function(line) {
          return editor.indent();
        });
        editor.getBuffer().setText("  abc\n  012\n");
        return editor.setCursorScreenPosition([1, 1]);
      });
      it("switches to insert and adds a newline above the current one", function() {
        keydown('O', {
          shift: true
        });
        expect(editor.getText()).toBe("  abc\n  \n  012\n");
        expect(editor.getCursorScreenPosition()).toEqual([1, 2]);
        return expect(editorElement.classList.contains('insert-mode')).toBe(true);
      });
      it("is repeatable", function() {
        editor.getBuffer().setText("  abc\n  012\n    4spaces\n");
        editor.setCursorScreenPosition([1, 1]);
        keydown('O', {
          shift: true
        });
        editor.insertText("def");
        keydown('escape');
        expect(editor.getText()).toBe("  abc\n  def\n  012\n    4spaces\n");
        editor.setCursorScreenPosition([1, 1]);
        keydown('.');
        expect(editor.getText()).toBe("  abc\n  def\n  def\n  012\n    4spaces\n");
        editor.setCursorScreenPosition([4, 1]);
        keydown('.');
        return expect(editor.getText()).toBe("  abc\n  def\n  def\n  012\n    def\n    4spaces\n");
      });
      return it("is undoable", function() {
        keydown('O', {
          shift: true
        });
        editor.insertText("def");
        keydown('escape');
        expect(editor.getText()).toBe("  abc\n  def\n  012\n");
        keydown('u');
        return expect(editor.getText()).toBe("  abc\n  012\n");
      });
    });
    describe("the o keybinding", function() {
      beforeEach(function() {
        spyOn(editor, 'shouldAutoIndent').andReturn(true);
        spyOn(editor, 'autoIndentBufferRow').andCallFake(function(line) {
          return editor.indent();
        });
        editor.getBuffer().setText("abc\n  012\n");
        return editor.setCursorScreenPosition([1, 2]);
      });
      it("switches to insert and adds a newline above the current one", function() {
        keydown('o');
        expect(editor.getText()).toBe("abc\n  012\n  \n");
        expect(editorElement.classList.contains('insert-mode')).toBe(true);
        return expect(editor.getCursorScreenPosition()).toEqual([2, 2]);
      });
      xit("is repeatable", function() {
        editor.getBuffer().setText("  abc\n  012\n    4spaces\n");
        editor.setCursorScreenPosition([1, 1]);
        keydown('o');
        editor.insertText("def");
        keydown('escape');
        expect(editor.getText()).toBe("  abc\n  012\n  def\n    4spaces\n");
        keydown('.');
        expect(editor.getText()).toBe("  abc\n  012\n  def\n  def\n    4spaces\n");
        editor.setCursorScreenPosition([4, 1]);
        keydown('.');
        return expect(editor.getText()).toBe("  abc\n  def\n  def\n  012\n    4spaces\n    def\n");
      });
      return it("is undoable", function() {
        keydown('o');
        editor.insertText("def");
        keydown('escape');
        expect(editor.getText()).toBe("abc\n  012\n  def\n");
        keydown('u');
        return expect(editor.getText()).toBe("abc\n  012\n");
      });
    });
    describe("the a keybinding", function() {
      beforeEach(function() {
        return editor.getBuffer().setText("012\n");
      });
      describe("at the beginning of the line", function() {
        beforeEach(function() {
          editor.setCursorScreenPosition([0, 0]);
          return keydown('a');
        });
        return it("switches to insert mode and shifts to the right", function() {
          expect(editor.getCursorScreenPosition()).toEqual([0, 1]);
          return expect(editorElement.classList.contains('insert-mode')).toBe(true);
        });
      });
      return describe("at the end of the line", function() {
        beforeEach(function() {
          editor.setCursorScreenPosition([0, 3]);
          return keydown('a');
        });
        return it("doesn't linewrap", function() {
          return expect(editor.getCursorScreenPosition()).toEqual([0, 3]);
        });
      });
    });
    describe("the A keybinding", function() {
      beforeEach(function() {
        return editor.getBuffer().setText("11\n22\n");
      });
      return describe("at the beginning of a line", function() {
        it("switches to insert mode at the end of the line", function() {
          editor.setCursorScreenPosition([0, 0]);
          keydown('A', {
            shift: true
          });
          expect(editorElement.classList.contains('insert-mode')).toBe(true);
          return expect(editor.getCursorScreenPosition()).toEqual([0, 2]);
        });
        return it("repeats always as insert at the end of the line", function() {
          editor.setCursorScreenPosition([0, 0]);
          keydown('A', {
            shift: true
          });
          editor.insertText("abc");
          keydown('escape');
          editor.setCursorScreenPosition([1, 0]);
          keydown('.');
          expect(editor.getText()).toBe("11abc\n22abc\n");
          expect(editorElement.classList.contains('insert-mode')).toBe(false);
          return expect(editor.getCursorScreenPosition()).toEqual([1, 4]);
        });
      });
    });
    describe("the I keybinding", function() {
      beforeEach(function() {
        return editor.getBuffer().setText("11\n  22\n");
      });
      return describe("at the end of a line", function() {
        it("switches to insert mode at the beginning of the line", function() {
          editor.setCursorScreenPosition([0, 2]);
          keydown('I', {
            shift: true
          });
          expect(editorElement.classList.contains('insert-mode')).toBe(true);
          return expect(editor.getCursorScreenPosition()).toEqual([0, 0]);
        });
        it("switches to insert mode after leading whitespace", function() {
          editor.setCursorScreenPosition([1, 4]);
          keydown('I', {
            shift: true
          });
          expect(editorElement.classList.contains('insert-mode')).toBe(true);
          return expect(editor.getCursorScreenPosition()).toEqual([1, 2]);
        });
        return it("repeats always as insert at the first character of the line", function() {
          editor.setCursorScreenPosition([0, 2]);
          keydown('I', {
            shift: true
          });
          editor.insertText("abc");
          keydown('escape');
          expect(editor.getCursorScreenPosition()).toEqual([0, 2]);
          editor.setCursorScreenPosition([1, 4]);
          keydown('.');
          expect(editor.getText()).toBe("abc11\n  abc22\n");
          expect(editorElement.classList.contains('insert-mode')).toBe(false);
          return expect(editor.getCursorScreenPosition()).toEqual([1, 4]);
        });
      });
    });
    describe("the J keybinding", function() {
      beforeEach(function() {
        editor.getBuffer().setText("012\n    456\n");
        return editor.setCursorScreenPosition([0, 1]);
      });
      describe("without repeating", function() {
        beforeEach(function() {
          return keydown('J', {
            shift: true
          });
        });
        return it("joins the contents of the current line with the one below it", function() {
          return expect(editor.getText()).toBe("012 456\n");
        });
      });
      return describe("with repeating", function() {
        beforeEach(function() {
          editor.setText("12345\nabcde\nABCDE\nQWERT");
          editor.setCursorScreenPosition([1, 1]);
          keydown('2');
          return keydown('J', {
            shift: true
          });
        });
        return describe("undo behavior", function() {
          beforeEach(function() {
            return keydown('u');
          });
          return it("handles repeats", function() {
            return expect(editor.getText()).toBe("12345\nabcde\nABCDE\nQWERT");
          });
        });
      });
    });
    describe("the > keybinding", function() {
      beforeEach(function() {
        return editor.setText("12345\nabcde\nABCDE");
      });
      describe("on the last line", function() {
        beforeEach(function() {
          return editor.setCursorScreenPosition([2, 0]);
        });
        return describe("when followed by a >", function() {
          beforeEach(function() {
            keydown('>');
            return keydown('>');
          });
          return it("indents the current line", function() {
            expect(editor.getText()).toBe("12345\nabcde\n  ABCDE");
            return expect(editor.getCursorScreenPosition()).toEqual([2, 2]);
          });
        });
      });
      describe("on the first line", function() {
        beforeEach(function() {
          return editor.setCursorScreenPosition([0, 0]);
        });
        describe("when followed by a >", function() {
          beforeEach(function() {
            keydown('>');
            return keydown('>');
          });
          return it("indents the current line", function() {
            expect(editor.getText()).toBe("  12345\nabcde\nABCDE");
            return expect(editor.getCursorScreenPosition()).toEqual([0, 2]);
          });
        });
        return describe("when followed by a repeating >", function() {
          beforeEach(function() {
            keydown('3');
            keydown('>');
            return keydown('>');
          });
          it("indents multiple lines at once", function() {
            expect(editor.getText()).toBe("  12345\n  abcde\n  ABCDE");
            return expect(editor.getCursorScreenPosition()).toEqual([0, 2]);
          });
          return describe("undo behavior", function() {
            beforeEach(function() {
              return keydown('u');
            });
            return it("outdents all three lines", function() {
              return expect(editor.getText()).toBe("12345\nabcde\nABCDE");
            });
          });
        });
      });
      describe("in visual mode linewise", function() {
        beforeEach(function() {
          editor.setCursorScreenPosition([0, 0]);
          keydown('v', {
            shift: true
          });
          return keydown('j');
        });
        describe("single indent multiple lines", function() {
          beforeEach(function() {
            return keydown('>');
          });
          it("indents both lines once and exits visual mode", function() {
            expect(editorElement.classList.contains('normal-mode')).toBe(true);
            expect(editor.getText()).toBe("  12345\n  abcde\nABCDE");
            return expect(editor.getSelectedBufferRanges()).toEqual([[[0, 2], [0, 2]]]);
          });
          return it("allows repeating the operation", function() {
            keydown('.');
            return expect(editor.getText()).toBe("    12345\n    abcde\nABCDE");
          });
        });
        return describe("multiple indent multiple lines", function() {
          beforeEach(function() {
            keydown('2');
            return keydown('>');
          });
          return it("indents both lines twice and exits visual mode", function() {
            expect(editorElement.classList.contains('normal-mode')).toBe(true);
            expect(editor.getText()).toBe("    12345\n    abcde\nABCDE");
            return expect(editor.getSelectedBufferRanges()).toEqual([[[0, 4], [0, 4]]]);
          });
        });
      });
      return describe("with multiple selections", function() {
        beforeEach(function() {
          editor.setCursorScreenPosition([1, 3]);
          keydown('v');
          keydown('j');
          return editor.addCursorAtScreenPosition([0, 0]);
        });
        return it("indents the lines and keeps the cursors", function() {
          keydown('>');
          expect(editor.getText()).toBe("  12345\n  abcde\n  ABCDE");
          return expect(editor.getCursorScreenPositions()).toEqual([[1, 2], [0, 2]]);
        });
      });
    });
    describe("the < keybinding", function() {
      beforeEach(function() {
        editor.setText("    12345\n    abcde\nABCDE");
        return editor.setCursorScreenPosition([0, 0]);
      });
      describe("when followed by a <", function() {
        beforeEach(function() {
          keydown('<');
          return keydown('<');
        });
        return it("outdents the current line", function() {
          expect(editor.getText()).toBe("  12345\n    abcde\nABCDE");
          return expect(editor.getCursorScreenPosition()).toEqual([0, 2]);
        });
      });
      describe("when followed by a repeating <", function() {
        beforeEach(function() {
          keydown('2');
          keydown('<');
          return keydown('<');
        });
        it("outdents multiple lines at once", function() {
          expect(editor.getText()).toBe("  12345\n  abcde\nABCDE");
          return expect(editor.getCursorScreenPosition()).toEqual([0, 2]);
        });
        return describe("undo behavior", function() {
          beforeEach(function() {
            return keydown('u');
          });
          return it("indents both lines", function() {
            return expect(editor.getText()).toBe("    12345\n    abcde\nABCDE");
          });
        });
      });
      return describe("in visual mode linewise", function() {
        beforeEach(function() {
          keydown('v', {
            shift: true
          });
          return keydown('j');
        });
        describe("single outdent multiple lines", function() {
          beforeEach(function() {
            return keydown('<');
          });
          it("outdents the current line and exits visual mode", function() {
            expect(editorElement.classList.contains('normal-mode')).toBe(true);
            expect(editor.getText()).toBe("  12345\n  abcde\nABCDE");
            return expect(editor.getSelectedBufferRanges()).toEqual([[[0, 2], [0, 2]]]);
          });
          return it("allows repeating the operation", function() {
            keydown('.');
            return expect(editor.getText()).toBe("12345\nabcde\nABCDE");
          });
        });
        return describe("multiple outdent multiple lines", function() {
          beforeEach(function() {
            keydown('2');
            return keydown('<');
          });
          return it("outdents both lines twice and exits visual mode", function() {
            expect(editorElement.classList.contains('normal-mode')).toBe(true);
            expect(editor.getText()).toBe("12345\nabcde\nABCDE");
            return expect(editor.getSelectedBufferRanges()).toEqual([[[0, 0], [0, 0]]]);
          });
        });
      });
    });
    describe("the = keybinding", function() {
      var oldGrammar;
      oldGrammar = [];
      beforeEach(function() {
        waitsForPromise(function() {
          return atom.packages.activatePackage('language-javascript');
        });
        oldGrammar = editor.getGrammar();
        editor.setText("foo\n  bar\n  baz");
        return editor.setCursorScreenPosition([1, 0]);
      });
      return describe("when used in a scope that supports auto-indent", function() {
        beforeEach(function() {
          var jsGrammar;
          jsGrammar = atom.grammars.grammarForScopeName('source.js');
          return editor.setGrammar(jsGrammar);
        });
        afterEach(function() {
          return editor.setGrammar(oldGrammar);
        });
        describe("when followed by a =", function() {
          beforeEach(function() {
            keydown('=');
            return keydown('=');
          });
          return it("indents the current line", function() {
            return expect(editor.indentationForBufferRow(1)).toBe(0);
          });
        });
        describe("when followed by a G", function() {
          beforeEach(function() {
            editor.setCursorScreenPosition([0, 0]);
            keydown('=');
            return keydown('G', {
              shift: true
            });
          });
          return it("uses the default count", function() {
            expect(editor.indentationForBufferRow(1)).toBe(0);
            return expect(editor.indentationForBufferRow(2)).toBe(0);
          });
        });
        return describe("when followed by a repeating =", function() {
          beforeEach(function() {
            keydown('2');
            keydown('=');
            return keydown('=');
          });
          it("autoindents multiple lines at once", function() {
            expect(editor.getText()).toBe("foo\nbar\nbaz");
            return expect(editor.getCursorScreenPosition()).toEqual([1, 0]);
          });
          return describe("undo behavior", function() {
            beforeEach(function() {
              return keydown('u');
            });
            return it("indents both lines", function() {
              return expect(editor.getText()).toBe("foo\n  bar\n  baz");
            });
          });
        });
      });
    });
    describe("the . keybinding", function() {
      beforeEach(function() {
        editor.setText("12\n34\n56\n78");
        return editor.setCursorScreenPosition([0, 0]);
      });
      it("repeats the last operation", function() {
        keydown('2');
        keydown('d');
        keydown('d');
        keydown('.');
        return expect(editor.getText()).toBe("");
      });
      return it("composes with motions", function() {
        keydown('d');
        keydown('d');
        keydown('2');
        keydown('.');
        return expect(editor.getText()).toBe("78");
      });
    });
    describe("the r keybinding", function() {
      beforeEach(function() {
        editor.setText("12\n34\n\n");
        editor.setCursorBufferPosition([0, 0]);
        return editor.addCursorAtBufferPosition([1, 0]);
      });
      it("replaces a single character", function() {
        keydown('r');
        normalModeInputKeydown('x');
        return expect(editor.getText()).toBe('x2\nx4\n\n');
      });
      it("does nothing when cancelled", function() {
        keydown('r');
        expect(editorElement.classList.contains('operator-pending-mode')).toBe(true);
        keydown('escape');
        expect(editor.getText()).toBe('12\n34\n\n');
        return expect(editorElement.classList.contains('normal-mode')).toBe(true);
      });
      it("replaces a single character with a line break", function() {
        keydown('r');
        atom.commands.dispatch(editor.normalModeInputView.editorElement, 'core:confirm');
        expect(editor.getText()).toBe('\n2\n\n4\n\n');
        return expect(editor.getCursorBufferPositions()).toEqual([[1, 0], [3, 0]]);
      });
      it("composes properly with motions", function() {
        keydown('2');
        keydown('r');
        normalModeInputKeydown('x');
        return expect(editor.getText()).toBe('xx\nxx\n\n');
      });
      it("does nothing on an empty line", function() {
        editor.setCursorBufferPosition([2, 0]);
        keydown('r');
        normalModeInputKeydown('x');
        return expect(editor.getText()).toBe('12\n34\n\n');
      });
      it("does nothing if asked to replace more characters than there are on a line", function() {
        keydown('3');
        keydown('r');
        normalModeInputKeydown('x');
        return expect(editor.getText()).toBe('12\n34\n\n');
      });
      describe("when in visual mode", function() {
        beforeEach(function() {
          keydown('v');
          return keydown('e');
        });
        it("replaces the entire selection with the given character", function() {
          keydown('r');
          normalModeInputKeydown('x');
          return expect(editor.getText()).toBe('xx\nxx\n\n');
        });
        return it("leaves the cursor at the beginning of the selection", function() {
          keydown('r');
          normalModeInputKeydown('x');
          return expect(editor.getCursorBufferPositions()).toEqual([[0, 0], [1, 0]]);
        });
      });
      return describe('with accented characters', function() {
        var buildIMECompositionEvent, buildTextInputEvent;
        buildIMECompositionEvent = function(event, _arg) {
          var data, target, _ref1;
          _ref1 = _arg != null ? _arg : {}, data = _ref1.data, target = _ref1.target;
          event = new Event(event);
          event.data = data;
          Object.defineProperty(event, 'target', {
            get: function() {
              return target;
            }
          });
          return event;
        };
        buildTextInputEvent = function(_arg) {
          var data, event, target;
          data = _arg.data, target = _arg.target;
          event = new Event('textInput');
          event.data = data;
          Object.defineProperty(event, 'target', {
            get: function() {
              return target;
            }
          });
          return event;
        };
        return it('works with IME composition', function() {
          var domNode, inputNode, normalModeEditor;
          keydown('r');
          normalModeEditor = editor.normalModeInputView.editorElement;
          jasmine.attachToDOM(normalModeEditor);
          domNode = normalModeEditor.component.domNode;
          inputNode = domNode.querySelector('.hidden-input');
          domNode.dispatchEvent(buildIMECompositionEvent('compositionstart', {
            target: inputNode
          }));
          domNode.dispatchEvent(buildIMECompositionEvent('compositionupdate', {
            data: 's',
            target: inputNode
          }));
          expect(normalModeEditor.getModel().getText()).toEqual('s');
          domNode.dispatchEvent(buildIMECompositionEvent('compositionupdate', {
            data: 'sd',
            target: inputNode
          }));
          expect(normalModeEditor.getModel().getText()).toEqual('sd');
          domNode.dispatchEvent(buildIMECompositionEvent('compositionend', {
            target: inputNode
          }));
          domNode.dispatchEvent(buildTextInputEvent({
            data: '速度',
            target: inputNode
          }));
          return expect(editor.getText()).toBe('速度2\n速度4\n\n');
        });
      });
    });
    describe('the m keybinding', function() {
      beforeEach(function() {
        editor.setText('12\n34\n56\n');
        return editor.setCursorBufferPosition([0, 1]);
      });
      return it('marks a position', function() {
        keydown('m');
        normalModeInputKeydown('a');
        return expect(vimState.getMark('a')).toEqual([0, 1]);
      });
    });
    describe('the ~ keybinding', function() {
      beforeEach(function() {
        editor.setText('aBc\nXyZ');
        editor.setCursorBufferPosition([0, 0]);
        return editor.addCursorAtBufferPosition([1, 0]);
      });
      it('toggles the case and moves right', function() {
        keydown('~');
        expect(editor.getText()).toBe('ABc\nxyZ');
        expect(editor.getCursorScreenPositions()).toEqual([[0, 1], [1, 1]]);
        keydown('~');
        expect(editor.getText()).toBe('Abc\nxYZ');
        expect(editor.getCursorScreenPositions()).toEqual([[0, 2], [1, 2]]);
        keydown('~');
        expect(editor.getText()).toBe('AbC\nxYz');
        return expect(editor.getCursorScreenPositions()).toEqual([[0, 2], [1, 2]]);
      });
      it('takes a count', function() {
        keydown('4');
        keydown('~');
        expect(editor.getText()).toBe('AbC\nxYz');
        return expect(editor.getCursorScreenPositions()).toEqual([[0, 2], [1, 2]]);
      });
      describe("in visual mode", function() {
        return it("toggles the case of the selected text", function() {
          editor.setCursorBufferPosition([0, 0]);
          keydown("V", {
            shift: true
          });
          keydown("~");
          return expect(editor.getText()).toBe('AbC\nXyZ');
        });
      });
      return describe("with g and motion", function() {
        it("toggles the case of text", function() {
          editor.setCursorBufferPosition([0, 0]);
          keydown("g");
          keydown("~");
          keydown("2");
          keydown("l");
          return expect(editor.getText()).toBe('Abc\nXyZ');
        });
        return it("uses default count", function() {
          editor.setCursorBufferPosition([0, 0]);
          keydown("g");
          keydown("~");
          keydown("G", {
            shift: true
          });
          return expect(editor.getText()).toBe('AbC\nxYz');
        });
      });
    });
    describe('the U keybinding', function() {
      beforeEach(function() {
        editor.setText('aBc\nXyZ');
        return editor.setCursorBufferPosition([0, 0]);
      });
      it("makes text uppercase with g and motion", function() {
        keydown("g");
        keydown("U", {
          shift: true
        });
        keydown("l");
        expect(editor.getText()).toBe('ABc\nXyZ');
        keydown("g");
        keydown("U", {
          shift: true
        });
        keydown("e");
        expect(editor.getText()).toBe('ABC\nXyZ');
        editor.setCursorBufferPosition([1, 0]);
        keydown("g");
        keydown("U", {
          shift: true
        });
        keydown("$");
        expect(editor.getText()).toBe('ABC\nXYZ');
        return expect(editor.getCursorScreenPosition()).toEqual([1, 2]);
      });
      it("uses default count", function() {
        editor.setCursorBufferPosition([0, 0]);
        keydown("g");
        keydown("U", {
          shift: true
        });
        keydown("G", {
          shift: true
        });
        return expect(editor.getText()).toBe('ABC\nXYZ');
      });
      return it("makes the selected text uppercase in visual mode", function() {
        keydown("V", {
          shift: true
        });
        keydown("U", {
          shift: true
        });
        return expect(editor.getText()).toBe('ABC\nXyZ');
      });
    });
    describe('the u keybinding', function() {
      beforeEach(function() {
        editor.setText('aBc\nXyZ');
        return editor.setCursorBufferPosition([0, 0]);
      });
      it("makes text lowercase with g and motion", function() {
        keydown("g");
        keydown("u");
        keydown("$");
        expect(editor.getText()).toBe('abc\nXyZ');
        return expect(editor.getCursorScreenPosition()).toEqual([0, 2]);
      });
      it("uses default count", function() {
        editor.setCursorBufferPosition([0, 0]);
        keydown("g");
        keydown("u");
        keydown("G", {
          shift: true
        });
        return expect(editor.getText()).toBe('abc\nxyz');
      });
      return it("makes the selected text lowercase in visual mode", function() {
        keydown("V", {
          shift: true
        });
        keydown("u");
        return expect(editor.getText()).toBe('abc\nXyZ');
      });
    });
    describe("the i keybinding", function() {
      beforeEach(function() {
        editor.setText('123\n4567');
        editor.setCursorBufferPosition([0, 0]);
        return editor.addCursorAtBufferPosition([1, 0]);
      });
      it("allows undoing an entire batch of typing", function() {
        keydown('i');
        editor.insertText("abcXX");
        editor.backspace();
        editor.backspace();
        keydown('escape');
        expect(editor.getText()).toBe("abc123\nabc4567");
        keydown('i');
        editor.insertText("d");
        editor.insertText("e");
        editor.insertText("f");
        keydown('escape');
        expect(editor.getText()).toBe("abdefc123\nabdefc4567");
        keydown('u');
        expect(editor.getText()).toBe("abc123\nabc4567");
        keydown('u');
        return expect(editor.getText()).toBe("123\n4567");
      });
      it("allows repeating typing", function() {
        keydown('i');
        editor.insertText("abcXX");
        editor.backspace();
        editor.backspace();
        keydown('escape');
        expect(editor.getText()).toBe("abc123\nabc4567");
        keydown('.');
        expect(editor.getText()).toBe("ababcc123\nababcc4567");
        keydown('.');
        return expect(editor.getText()).toBe("abababccc123\nabababccc4567");
      });
      return describe('with nonlinear input', function() {
        beforeEach(function() {
          editor.setText('');
          return editor.setCursorBufferPosition([0, 0]);
        });
        it('deals with auto-matched brackets', function() {
          keydown('i');
          editor.insertText('()');
          editor.moveLeft();
          editor.insertText('a');
          editor.moveRight();
          editor.insertText('b\n');
          keydown('escape');
          expect(editor.getCursorScreenPosition()).toEqual([1, 0]);
          keydown('.');
          expect(editor.getText()).toBe('(a)b\n(a)b\n');
          return expect(editor.getCursorScreenPosition()).toEqual([2, 0]);
        });
        return it('deals with autocomplete', function() {
          keydown('i');
          editor.insertText('a');
          editor.insertText('d');
          editor.insertText('d');
          editor.setTextInBufferRange([[0, 0], [0, 3]], 'addFoo');
          keydown('escape');
          expect(editor.getCursorScreenPosition()).toEqual([0, 5]);
          expect(editor.getText()).toBe('addFoo');
          keydown('.');
          expect(editor.getText()).toBe('addFoaddFooo');
          return expect(editor.getCursorScreenPosition()).toEqual([0, 10]);
        });
      });
    });
    describe('the a keybinding', function() {
      beforeEach(function() {
        editor.setText('');
        return editor.setCursorBufferPosition([0, 0]);
      });
      it("can be undone in one go", function() {
        keydown('a');
        editor.insertText("abc");
        keydown('escape');
        expect(editor.getText()).toBe("abc");
        keydown('u');
        return expect(editor.getText()).toBe("");
      });
      return it("repeats correctly", function() {
        keydown('a');
        editor.insertText("abc");
        keydown('escape');
        expect(editor.getText()).toBe("abc");
        expect(editor.getCursorScreenPosition()).toEqual([0, 2]);
        keydown('.');
        expect(editor.getText()).toBe("abcabc");
        return expect(editor.getCursorScreenPosition()).toEqual([0, 5]);
      });
    });
    describe("the ctrl-a/ctrl-x keybindings", function() {
      beforeEach(function() {
        atom.config.set('vim-mode.numberRegex', settings.config.numberRegex["default"]);
        editor.setText('123\nab45\ncd-67ef\nab-5\na-bcdef');
        editor.setCursorBufferPosition([0, 0]);
        editor.addCursorAtBufferPosition([1, 0]);
        editor.addCursorAtBufferPosition([2, 0]);
        editor.addCursorAtBufferPosition([3, 3]);
        return editor.addCursorAtBufferPosition([4, 0]);
      });
      describe("increasing numbers", function() {
        it("increases the next number", function() {
          keydown('a', {
            ctrl: true
          });
          expect(editor.getCursorBufferPositions()).toEqual([[0, 2], [1, 3], [2, 4], [3, 3], [4, 0]]);
          expect(editor.getText()).toBe('124\nab46\ncd-66ef\nab-4\na-bcdef');
          return expect(atom.beep).not.toHaveBeenCalled();
        });
        it("repeats with .", function() {
          keydown('a', {
            ctrl: true
          });
          keydown('.');
          expect(editor.getCursorBufferPositions()).toEqual([[0, 2], [1, 3], [2, 4], [3, 3], [4, 0]]);
          expect(editor.getText()).toBe('125\nab47\ncd-65ef\nab-3\na-bcdef');
          return expect(atom.beep).not.toHaveBeenCalled();
        });
        it("can have a count", function() {
          keydown('5');
          keydown('a', {
            ctrl: true
          });
          expect(editor.getCursorBufferPositions()).toEqual([[0, 2], [1, 3], [2, 4], [3, 2], [4, 0]]);
          expect(editor.getText()).toBe('128\nab50\ncd-62ef\nab0\na-bcdef');
          return expect(atom.beep).not.toHaveBeenCalled();
        });
        it("can make a negative number positive, change number of digits", function() {
          keydown('9');
          keydown('9');
          keydown('a', {
            ctrl: true
          });
          expect(editor.getCursorBufferPositions()).toEqual([[0, 2], [1, 4], [2, 3], [3, 3], [4, 0]]);
          expect(editor.getText()).toBe('222\nab144\ncd32ef\nab94\na-bcdef');
          return expect(atom.beep).not.toHaveBeenCalled();
        });
        it("does nothing when cursor is after the number", function() {
          editor.setCursorBufferPosition([2, 5]);
          keydown('a', {
            ctrl: true
          });
          expect(editor.getCursorBufferPositions()).toEqual([[2, 5]]);
          expect(editor.getText()).toBe('123\nab45\ncd-67ef\nab-5\na-bcdef');
          return expect(atom.beep).toHaveBeenCalled();
        });
        it("does nothing on an empty line", function() {
          editor.setText('\n');
          editor.setCursorBufferPosition([0, 0]);
          editor.addCursorAtBufferPosition([1, 0]);
          keydown('a', {
            ctrl: true
          });
          expect(editor.getCursorBufferPositions()).toEqual([[0, 0], [1, 0]]);
          expect(editor.getText()).toBe('\n');
          return expect(atom.beep).toHaveBeenCalled();
        });
        return it("honours the vim-mode:numberRegex setting", function() {
          editor.setText('123\nab45\ncd -67ef\nab-5\na-bcdef');
          editor.setCursorBufferPosition([0, 0]);
          editor.addCursorAtBufferPosition([1, 0]);
          editor.addCursorAtBufferPosition([2, 0]);
          editor.addCursorAtBufferPosition([3, 3]);
          editor.addCursorAtBufferPosition([4, 0]);
          atom.config.set('vim-mode.numberRegex', '(?:\\B-)?[0-9]+');
          keydown('a', {
            ctrl: true
          });
          expect(editor.getCursorBufferPositions()).toEqual([[0, 2], [1, 3], [2, 5], [3, 3], [4, 0]]);
          expect(editor.getText()).toBe('124\nab46\ncd -66ef\nab-6\na-bcdef');
          return expect(atom.beep).not.toHaveBeenCalled();
        });
      });
      return describe("decreasing numbers", function() {
        it("decreases the next number", function() {
          keydown('x', {
            ctrl: true
          });
          expect(editor.getCursorBufferPositions()).toEqual([[0, 2], [1, 3], [2, 4], [3, 3], [4, 0]]);
          expect(editor.getText()).toBe('122\nab44\ncd-68ef\nab-6\na-bcdef');
          return expect(atom.beep).not.toHaveBeenCalled();
        });
        it("repeats with .", function() {
          keydown('x', {
            ctrl: true
          });
          keydown('.');
          expect(editor.getCursorBufferPositions()).toEqual([[0, 2], [1, 3], [2, 4], [3, 3], [4, 0]]);
          expect(editor.getText()).toBe('121\nab43\ncd-69ef\nab-7\na-bcdef');
          return expect(atom.beep).not.toHaveBeenCalled();
        });
        it("can have a count", function() {
          keydown('5');
          keydown('x', {
            ctrl: true
          });
          expect(editor.getCursorBufferPositions()).toEqual([[0, 2], [1, 3], [2, 4], [3, 4], [4, 0]]);
          expect(editor.getText()).toBe('118\nab40\ncd-72ef\nab-10\na-bcdef');
          return expect(atom.beep).not.toHaveBeenCalled();
        });
        it("can make a positive number negative, change number of digits", function() {
          keydown('9');
          keydown('9');
          keydown('x', {
            ctrl: true
          });
          expect(editor.getCursorBufferPositions()).toEqual([[0, 1], [1, 4], [2, 5], [3, 5], [4, 0]]);
          expect(editor.getText()).toBe('24\nab-54\ncd-166ef\nab-104\na-bcdef');
          return expect(atom.beep).not.toHaveBeenCalled();
        });
        it("does nothing when cursor is after the number", function() {
          editor.setCursorBufferPosition([2, 5]);
          keydown('x', {
            ctrl: true
          });
          expect(editor.getCursorBufferPositions()).toEqual([[2, 5]]);
          expect(editor.getText()).toBe('123\nab45\ncd-67ef\nab-5\na-bcdef');
          return expect(atom.beep).toHaveBeenCalled();
        });
        it("does nothing on an empty line", function() {
          editor.setText('\n');
          editor.setCursorBufferPosition([0, 0]);
          editor.addCursorAtBufferPosition([1, 0]);
          keydown('x', {
            ctrl: true
          });
          expect(editor.getCursorBufferPositions()).toEqual([[0, 0], [1, 0]]);
          expect(editor.getText()).toBe('\n');
          return expect(atom.beep).toHaveBeenCalled();
        });
        return it("honours the vim-mode:numberRegex setting", function() {
          editor.setText('123\nab45\ncd -67ef\nab-5\na-bcdef');
          editor.setCursorBufferPosition([0, 0]);
          editor.addCursorAtBufferPosition([1, 0]);
          editor.addCursorAtBufferPosition([2, 0]);
          editor.addCursorAtBufferPosition([3, 3]);
          editor.addCursorAtBufferPosition([4, 0]);
          atom.config.set('vim-mode.numberRegex', '(?:\\B-)?[0-9]+');
          keydown('x', {
            ctrl: true
          });
          expect(editor.getCursorBufferPositions()).toEqual([[0, 2], [1, 3], [2, 5], [3, 3], [4, 0]]);
          expect(editor.getText()).toBe('122\nab44\ncd -68ef\nab-4\na-bcdef');
          return expect(atom.beep).not.toHaveBeenCalled();
        });
      });
    });
    return describe('the R keybinding', function() {
      beforeEach(function() {
        editor.setText('12345\n67890');
        return editor.setCursorBufferPosition([0, 2]);
      });
      it("enters replace mode and replaces characters", function() {
        keydown("R", {
          shift: true
        });
        expect(editorElement.classList.contains('insert-mode')).toBe(true);
        expect(editorElement.classList.contains('replace-mode')).toBe(true);
        editor.insertText("ab");
        keydown('escape');
        expect(editor.getText()).toBe("12ab5\n67890");
        expect(editor.getCursorScreenPosition()).toEqual([0, 3]);
        expect(editorElement.classList.contains('insert-mode')).toBe(false);
        expect(editorElement.classList.contains('replace-mode')).toBe(false);
        return expect(editorElement.classList.contains('normal-mode')).toBe(true);
      });
      it("continues beyond end of line as insert", function() {
        keydown("R", {
          shift: true
        });
        expect(editorElement.classList.contains('insert-mode')).toBe(true);
        expect(editorElement.classList.contains('replace-mode')).toBe(true);
        editor.insertText("abcde");
        keydown('escape');
        return expect(editor.getText()).toBe("12abcde\n67890");
      });
      it("treats backspace as undo", function() {
        editor.insertText("foo");
        keydown("R", {
          shift: true
        });
        editor.insertText("a");
        editor.insertText("b");
        expect(editor.getText()).toBe("12fooab5\n67890");
        keydown('backspace', {
          raw: true
        });
        expect(editor.getText()).toBe("12fooa45\n67890");
        editor.insertText("c");
        expect(editor.getText()).toBe("12fooac5\n67890");
        keydown('backspace', {
          raw: true
        });
        keydown('backspace', {
          raw: true
        });
        expect(editor.getText()).toBe("12foo345\n67890");
        expect(editor.getSelectedText()).toBe("");
        keydown('backspace', {
          raw: true
        });
        expect(editor.getText()).toBe("12foo345\n67890");
        return expect(editor.getSelectedText()).toBe("");
      });
      it("can be repeated", function() {
        keydown("R", {
          shift: true
        });
        editor.insertText("ab");
        keydown('escape');
        editor.setCursorBufferPosition([1, 2]);
        keydown('.');
        expect(editor.getText()).toBe("12ab5\n67ab0");
        expect(editor.getCursorScreenPosition()).toEqual([1, 3]);
        editor.setCursorBufferPosition([0, 4]);
        keydown('.');
        expect(editor.getText()).toBe("12abab\n67ab0");
        return expect(editor.getCursorScreenPosition()).toEqual([0, 5]);
      });
      it("can be interrupted by arrow keys and behave as insert for repeat", function() {});
      it("repeats correctly when backspace was used in the text", function() {
        keydown("R", {
          shift: true
        });
        editor.insertText("a");
        keydown('backspace', {
          raw: true
        });
        editor.insertText("b");
        keydown('escape');
        editor.setCursorBufferPosition([1, 2]);
        keydown('.');
        expect(editor.getText()).toBe("12b45\n67b90");
        expect(editor.getCursorScreenPosition()).toEqual([1, 2]);
        editor.setCursorBufferPosition([0, 4]);
        keydown('.');
        expect(editor.getText()).toBe("12b4b\n67b90");
        return expect(editor.getCursorScreenPosition()).toEqual([0, 4]);
      });
      return it("doesn't replace a character if newline is entered", function() {
        keydown("R", {
          shift: true
        });
        expect(editorElement.classList.contains('insert-mode')).toBe(true);
        expect(editorElement.classList.contains('replace-mode')).toBe(true);
        editor.insertText("\n");
        keydown('escape');
        return expect(editor.getText()).toBe("12\n345\n67890");
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUvc3BlYy9vcGVyYXRvcnMtc3BlYy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsaUJBQUE7O0FBQUEsRUFBQSxPQUFBLEdBQVUsT0FBQSxDQUFRLGVBQVIsQ0FBVixDQUFBOztBQUFBLEVBQ0EsUUFBQSxHQUFXLE9BQUEsQ0FBUSxpQkFBUixDQURYLENBQUE7O0FBQUEsRUFHQSxRQUFBLENBQVMsV0FBVCxFQUFzQixTQUFBLEdBQUE7QUFDcEIsUUFBQSxzRUFBQTtBQUFBLElBQUEsT0FBb0MsRUFBcEMsRUFBQyxnQkFBRCxFQUFTLHVCQUFULEVBQXdCLGtCQUF4QixDQUFBO0FBQUEsSUFFQSxVQUFBLENBQVcsU0FBQSxHQUFBO0FBQ1QsVUFBQSxPQUFBO0FBQUEsTUFBQSxPQUFBLEdBQVUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFkLENBQTBCLFVBQTFCLENBQVYsQ0FBQTtBQUFBLE1BQ0EsT0FBTyxDQUFDLGlCQUFSLENBQUEsQ0FEQSxDQUFBO2FBR0EsT0FBTyxDQUFDLGdCQUFSLENBQXlCLFNBQUMsT0FBRCxHQUFBO0FBQ3ZCLFFBQUEsYUFBQSxHQUFnQixPQUFoQixDQUFBO0FBQUEsUUFDQSxNQUFBLEdBQVMsYUFBYSxDQUFDLFFBQWQsQ0FBQSxDQURULENBQUE7QUFBQSxRQUVBLFFBQUEsR0FBVyxhQUFhLENBQUMsUUFGekIsQ0FBQTtBQUFBLFFBR0EsUUFBUSxDQUFDLGtCQUFULENBQUEsQ0FIQSxDQUFBO2VBSUEsUUFBUSxDQUFDLGVBQVQsQ0FBQSxFQUx1QjtNQUFBLENBQXpCLEVBSlM7SUFBQSxDQUFYLENBRkEsQ0FBQTtBQUFBLElBYUEsT0FBQSxHQUFVLFNBQUMsR0FBRCxFQUFNLE9BQU4sR0FBQTs7UUFBTSxVQUFR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

//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/vim-mode/spec/operators-spec.coffee
