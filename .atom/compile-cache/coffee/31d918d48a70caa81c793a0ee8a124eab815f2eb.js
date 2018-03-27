(function() {
  var Point, TextData, dispatch, getView, getVimState, ref, setEditorWidthInCharacters, settings;

  Point = require('atom').Point;

  ref = require('./spec-helper'), getVimState = ref.getVimState, dispatch = ref.dispatch, TextData = ref.TextData, getView = ref.getView;

  settings = require('../lib/settings');

  setEditorWidthInCharacters = function(editor, widthInCharacters) {
    var component;
    editor.setDefaultCharWidth(1);
    component = editor.component;
    component.element.style.width = component.getGutterContainerWidth() + widthInCharacters * component.measurements.baseCharacterWidth + "px";
    return component.getNextUpdatePromise();
  };

  describe("Motion general", function() {
    var editor, editorElement, ensure, keystroke, ref1, set, vimState;
    ref1 = [], set = ref1[0], ensure = ref1[1], keystroke = ref1[2], editor = ref1[3], editorElement = ref1[4], vimState = ref1[5];
    beforeEach(function() {
      return getVimState(function(state, _vim) {
        vimState = state;
        editor = vimState.editor, editorElement = vimState.editorElement;
        return set = _vim.set, ensure = _vim.ensure, keystroke = _vim.keystroke, _vim;
      });
    });
    describe("simple motions", function() {
      var text;
      text = null;
      beforeEach(function() {
        text = new TextData("12345\nabcd\nABCDE\n");
        return set({
          text: text.getRaw(),
          cursor: [1, 1]
        });
      });
      describe("the h keybinding", function() {
        describe("as a motion", function() {
          it("moves the cursor left, but not to the previous line", function() {
            ensure('h', {
              cursor: [1, 0]
            });
            return ensure('h', {
              cursor: [1, 0]
            });
          });
          return it("moves the cursor to the previous line if wrapLeftRightMotion is true", function() {
            settings.set('wrapLeftRightMotion', true);
            return ensure('h h', {
              cursor: [0, 4]
            });
          });
        });
        return describe("as a selection", function() {
          return it("selects the character to the left", function() {
            return ensure('y h', {
              cursor: [1, 0],
              register: {
                '"': {
                  text: 'a'
                }
              }
            });
          });
        });
      });
      describe("the j keybinding", function() {
        it("moves the cursor down, but not to the end of the last line", function() {
          ensure('j', {
            cursor: [2, 1]
          });
          return ensure('j', {
            cursor: [2, 1]
          });
        });
        it("moves the cursor to the end of the line, not past it", function() {
          set({
            cursor: [0, 4]
          });
          return ensure('j', {
            cursor: [1, 3]
          });
        });
        it("remembers the column it was in after moving to shorter line", function() {
          set({
            cursor: [0, 4]
          });
          ensure('j', {
            cursor: [1, 3]
          });
          return ensure('j', {
            cursor: [2, 4]
          });
        });
        it("never go past last newline", function() {
          return ensure('1 0 j', {
            cursor: [2, 1]
          });
        });
        return describe("when visual mode", function() {
          beforeEach(function() {
            return ensure('v', {
              cursor: [1, 2],
              selectedText: 'b'
            });
          });
          it("moves the cursor down", function() {
            return ensure('j', {
              cursor: [2, 2],
              selectedText: "bcd\nAB"
            });
          });
          it("doesn't go over after the last line", function() {
            return ensure('j', {
              cursor: [2, 2],
              selectedText: "bcd\nAB"
            });
          });
          it("keep same column(goalColumn) even after across the empty line", function() {
            keystroke('escape');
            set({
              text: "abcdefg\n\nabcdefg",
              cursor: [0, 3]
            });
            ensure('v', {
              cursor: [0, 4]
            });
            return ensure('j j', {
              cursor: [2, 4],
              selectedText: "defg\n\nabcd"
            });
          });
          return it("original visual line remains when jk across orignal selection", function() {
            text = new TextData("line0\nline1\nline2\n");
            set({
              text: text.getRaw(),
              cursor: [1, 1]
            });
            ensure('V', {
              selectedText: text.getLines([1])
            });
            ensure('j', {
              selectedText: text.getLines([1, 2])
            });
            ensure('k', {
              selectedText: text.getLines([1])
            });
            ensure('k', {
              selectedText: text.getLines([0, 1])
            });
            ensure('j', {
              selectedText: text.getLines([1])
            });
            return ensure('j', {
              selectedText: text.getLines([1, 2])
            });
          });
        });
      });
      describe("move-down-wrap, move-up-wrap", function() {
        beforeEach(function() {
          atom.keymaps.add("test", {
            'atom-text-editor.vim-mode-plus:not(.insert-mode)': {
              'k': 'vim-mode-plus:move-up-wrap',
              'j': 'vim-mode-plus:move-down-wrap'
            }
          });
          return set({
            text: "hello\nhello\nhello\nhello\n"
          });
        });
        describe('move-down-wrap', function() {
          beforeEach(function() {
            return set({
              cursor: [3, 1]
            });
          });
          it("move down with wrawp", function() {
            return ensure('j', {
              cursor: [0, 1]
            });
          });
          it("move down with wrawp", function() {
            return ensure('2 j', {
              cursor: [1, 1]
            });
          });
          return it("move down with wrawp", function() {
            return ensure('4 j', {
              cursor: [3, 1]
            });
          });
        });
        return describe('move-up-wrap', function() {
          beforeEach(function() {
            return set({
              cursor: [0, 1]
            });
          });
          it("move down with wrawp", function() {
            return ensure('k', {
              cursor: [3, 1]
            });
          });
          it("move down with wrawp", function() {
            return ensure('2 k', {
              cursor: [2, 1]
            });
          });
          return it("move down with wrawp", function() {
            return ensure('4 k', {
              cursor: [0, 1]
            });
          });
        });
      });
      xdescribe("with big count was given", function() {
        var BIG_NUMBER, ensureBigCountMotion;
        BIG_NUMBER = Number.MAX_SAFE_INTEGER;
        ensureBigCountMotion = function(keystrokes, options) {
          var count;
          count = String(BIG_NUMBER).split('').join(' ');
          keystrokes = keystrokes.split('').join(' ');
          return ensure(count + " " + keystrokes, options);
        };
        beforeEach(function() {
          atom.keymaps.add("test", {
            'atom-text-editor.vim-mode-plus:not(.insert-mode)': {
              'g {': 'vim-mode-plus:move-to-previous-fold-start',
              'g }': 'vim-mode-plus:move-to-next-fold-start',
              ', N': 'vim-mode-plus:move-to-previous-number',
              ', n': 'vim-mode-plus:move-to-next-number'
            }
          });
          return set({
            text: "0000\n1111\n2222\n",
            cursor: [1, 2]
          });
        });
        it("by `j`", function() {
          return ensureBigCountMotion('j', {
            cursor: [2, 2]
          });
        });
        it("by `k`", function() {
          return ensureBigCountMotion('k', {
            cursor: [0, 2]
          });
        });
        it("by `h`", function() {
          return ensureBigCountMotion('h', {
            cursor: [1, 0]
          });
        });
        it("by `l`", function() {
          return ensureBigCountMotion('l', {
            cursor: [1, 3]
          });
        });
        it("by `[`", function() {
          return ensureBigCountMotion('[', {
            cursor: [0, 2]
          });
        });
        it("by `]`", function() {
          return ensureBigCountMotion(']', {
            cursor: [2, 2]
          });
        });
        it("by `w`", function() {
          return ensureBigCountMotion('w', {
            cursor: [2, 3]
          });
        });
        it("by `W`", function() {
          return ensureBigCountMotion('W', {
            cursor: [2, 3]
          });
        });
        it("by `b`", function() {
          return ensureBigCountMotion('b', {
            cursor: [0, 0]
          });
        });
        it("by `B`", function() {
          return ensureBigCountMotion('B', {
            cursor: [0, 0]
          });
        });
        it("by `e`", function() {
          return ensureBigCountMotion('e', {
            cursor: [2, 3]
          });
        });
        it("by `(`", function() {
          return ensureBigCountMotion('(', {
            cursor: [0, 0]
          });
        });
        it("by `)`", function() {
          return ensureBigCountMotion(')', {
            cursor: [2, 3]
          });
        });
        it("by `{`", function() {
          return ensureBigCountMotion('{', {
            cursor: [0, 0]
          });
        });
        it("by `}`", function() {
          return ensureBigCountMotion('}', {
            cursor: [2, 3]
          });
        });
        it("by `-`", function() {
          return ensureBigCountMotion('-', {
            cursor: [0, 0]
          });
        });
        it("by `_`", function() {
          return ensureBigCountMotion('_', {
            cursor: [2, 0]
          });
        });
        it("by `g {`", function() {
          return ensureBigCountMotion('g {', {
            cursor: [1, 2]
          });
        });
        it("by `g }`", function() {
          return ensureBigCountMotion('g }', {
            cursor: [1, 2]
          });
        });
        it("by `, N`", function() {
          return ensureBigCountMotion(', N', {
            cursor: [1, 2]
          });
        });
        return it("by `, n`", function() {
          return ensureBigCountMotion(', n', {
            cursor: [1, 2]
          });
        });
      });
      describe("the k keybinding", function() {
        beforeEach(function() {
          return set({
            cursor: [2, 1]
          });
        });
        it("moves the cursor up", function() {
          return ensure('k', {
            cursor: [1, 1]
          });
        });
        it("moves the cursor up and remember column it was in", function() {
          set({
            cursor: [2, 4]
          });
          ensure('k', {
            cursor: [1, 3]
          });
          return ensure('k', {
            cursor: [0, 4]
          });
        });
        it("moves the cursor up, but not to the beginning of the first line", function() {
          return ensure('1 0 k', {
            cursor: [0, 1]
          });
        });
        return describe("when visual mode", function() {
          return it("keep same column(goalColumn) even after across the empty line", function() {
            set({
              text: "abcdefg\n\nabcdefg",
              cursor: [2, 3]
            });
            ensure('v', {
              cursor: [2, 4],
              selectedText: 'd'
            });
            return ensure('k k', {
              cursor: [0, 3],
              selectedText: "defg\n\nabcd"
            });
          });
        });
      });
      describe("gj gk in softwrap", function() {
        text = [][0];
        beforeEach(function() {
          editor.setSoftWrapped(true);
          editor.setEditorWidthInChars(10);
          editor.setDefaultCharWidth(1);
          text = new TextData("1st line of buffer\n2nd line of buffer, Very long line\n3rd line of buffer\n\n5th line of buffer\n");
          return set({
            text: text.getRaw(),
            cursor: [0, 0]
          });
        });
        describe("selection is not reversed", function() {
          it("screen position and buffer position is different", function() {
            ensure('g j', {
              cursorScreen: [1, 0],
              cursor: [0, 9]
            });
            ensure('g j', {
              cursorScreen: [2, 0],
              cursor: [1, 0]
            });
            ensure('g j', {
              cursorScreen: [3, 0],
              cursor: [1, 9]
            });
            return ensure('g j', {
              cursorScreen: [4, 0],
              cursor: [1, 12]
            });
          });
          return it("jk move selection buffer-line wise", function() {
            ensure('V', {
              selectedText: text.getLines([0])
            });
            ensure('j', {
              selectedText: text.getLines([0, 1])
            });
            ensure('j', {
              selectedText: text.getLines([0, 1, 2])
            });
            ensure('j', {
              selectedText: text.getLines([0, 1, 2, 3])
            });
            ensure('j', {
              selectedText: text.getLines([0, 1, 2, 3, 4])
            });
            ensure('k', {
              selectedText: text.getLines([0, 1, 2, 3])
            });
            ensure('k', {
              selectedText: text.getLines([0, 1, 2])
            });
            ensure('k', {
              selectedText: text.getLines([0, 1])
            });
            ensure('k', {
              selectedText: text.getLines([0])
            });
            return ensure('k', {
              selectedText: text.getLines([0])
            });
          });
        });
        return describe("selection is reversed", function() {
          it("screen position and buffer position is different", function() {
            ensure('g j', {
              cursorScreen: [1, 0],
              cursor: [0, 9]
            });
            ensure('g j', {
              cursorScreen: [2, 0],
              cursor: [1, 0]
            });
            ensure('g j', {
              cursorScreen: [3, 0],
              cursor: [1, 9]
            });
            return ensure('g j', {
              cursorScreen: [4, 0],
              cursor: [1, 12]
            });
          });
          return it("jk move selection buffer-line wise", function() {
            set({
              cursor: [4, 0]
            });
            ensure('V', {
              selectedText: text.getLines([4])
            });
            ensure('k', {
              selectedText: text.getLines([3, 4])
            });
            ensure('k', {
              selectedText: text.getLines([2, 3, 4])
            });
            ensure('k', {
              selectedText: text.getLines([1, 2, 3, 4])
            });
            ensure('k', {
              selectedText: text.getLines([0, 1, 2, 3, 4])
            });
            ensure('j', {
              selectedText: text.getLines([1, 2, 3, 4])
            });
            ensure('j', {
              selectedText: text.getLines([2, 3, 4])
            });
            ensure('j', {
              selectedText: text.getLines([3, 4])
            });
            ensure('j', {
              selectedText: text.getLines([4])
            });
            return ensure('j', {
              selectedText: text.getLines([4])
            });
          });
        });
      });
      describe("the l keybinding", function() {
        beforeEach(function() {
          return set({
            cursor: [1, 2]
          });
        });
        it("moves the cursor right, but not to the next line", function() {
          ensure('l', {
            cursor: [1, 3]
          });
          return ensure('l', {
            cursor: [1, 3]
          });
        });
        it("moves the cursor to the next line if wrapLeftRightMotion is true", function() {
          settings.set('wrapLeftRightMotion', true);
          return ensure('l l', {
            cursor: [2, 0]
          });
        });
        return describe("on a blank line", function() {
          return it("doesn't move the cursor", function() {
            set({
              text: "\n\n\n",
              cursor: [1, 0]
            });
            return ensure('l', {
              cursor: [1, 0]
            });
          });
        });
      });
      return describe("move-(up/down)-to-edge", function() {
        text = null;
        beforeEach(function() {
          text = new TextData("0:  4 67  01234567890123456789\n1:         1234567890123456789\n2:    6 890         0123456789\n3:    6 890         0123456789\n4:   56 890         0123456789\n5:                  0123456789\n6:                  0123456789\n7:  4 67            0123456789\n");
          return set({
            text: text.getRaw(),
            cursor: [4, 3]
          });
        });
        describe("edgeness of first-line and last-line", function() {
          beforeEach(function() {
            return set({
              text_: "____this is line 0\n____this is text of line 1\n____this is text of line 2\n______hello line 3\n______hello line 4",
              cursor: [2, 2]
            });
          });
          describe("when column is leading spaces", function() {
            return it("doesn't move cursor", function() {
              ensure('[', {
                cursor: [2, 2]
              });
              return ensure(']', {
                cursor: [2, 2]
              });
            });
          });
          return describe("when column is trailing spaces", function() {
            return it("doesn't move cursor", function() {
              set({
                cursor: [1, 20]
              });
              ensure(']', {
                cursor: [2, 20]
              });
              ensure(']', {
                cursor: [2, 20]
              });
              ensure('[', {
                cursor: [1, 20]
              });
              return ensure('[', {
                cursor: [1, 20]
              });
            });
          });
        });
        it("move to non-blank-char on both first and last row", function() {
          set({
            cursor: [4, 4]
          });
          ensure('[', {
            cursor: [0, 4]
          });
          return ensure(']', {
            cursor: [7, 4]
          });
        });
        it("move to white space char when both side column is non-blank char", function() {
          set({
            cursor: [4, 5]
          });
          ensure('[', {
            cursor: [0, 5]
          });
          ensure(']', {
            cursor: [4, 5]
          });
          return ensure(']', {
            cursor: [7, 5]
          });
        });
        it("only stops on row one of [first row, last row, up-or-down-row is blank] case-1", function() {
          set({
            cursor: [4, 6]
          });
          ensure('[', {
            cursor: [2, 6]
          });
          ensure('[', {
            cursor: [0, 6]
          });
          ensure(']', {
            cursor: [2, 6]
          });
          ensure(']', {
            cursor: [4, 6]
          });
          return ensure(']', {
            cursor: [7, 6]
          });
        });
        it("only stops on row one of [first row, last row, up-or-down-row is blank] case-2", function() {
          set({
            cursor: [4, 7]
          });
          ensure('[', {
            cursor: [2, 7]
          });
          ensure('[', {
            cursor: [0, 7]
          });
          ensure(']', {
            cursor: [2, 7]
          });
          ensure(']', {
            cursor: [4, 7]
          });
          return ensure(']', {
            cursor: [7, 7]
          });
        });
        it("support count", function() {
          set({
            cursor: [4, 6]
          });
          ensure('2 [', {
            cursor: [0, 6]
          });
          return ensure('3 ]', {
            cursor: [7, 6]
          });
        });
        return describe('editor for hardTab', function() {
          var pack;
          pack = 'language-go';
          beforeEach(function() {
            waitsForPromise(function() {
              return atom.packages.activatePackage(pack);
            });
            getVimState('sample.go', function(state, vimEditor) {
              editor = state.editor, editorElement = state.editorElement;
              return set = vimEditor.set, ensure = vimEditor.ensure, keystroke = vimEditor.keystroke, vimEditor;
            });
            return runs(function() {
              set({
                cursorScreen: [8, 2]
              });
              return ensure({
                cursor: [8, 1]
              });
            });
          });
          afterEach(function() {
            return atom.packages.deactivatePackage(pack);
          });
          return it("move up/down to next edge of same *screen* column", function() {
            ensure('[', {
              cursorScreen: [5, 2]
            });
            ensure('[', {
              cursorScreen: [3, 2]
            });
            ensure('[', {
              cursorScreen: [2, 2]
            });
            ensure('[', {
              cursorScreen: [0, 2]
            });
            ensure(']', {
              cursorScreen: [2, 2]
            });
            ensure(']', {
              cursorScreen: [3, 2]
            });
            ensure(']', {
              cursorScreen: [5, 2]
            });
            ensure(']', {
              cursorScreen: [9, 2]
            });
            ensure(']', {
              cursorScreen: [11, 2]
            });
            ensure(']', {
              cursorScreen: [14, 2]
            });
            ensure(']', {
              cursorScreen: [17, 2]
            });
            ensure('[', {
              cursorScreen: [14, 2]
            });
            ensure('[', {
              cursorScreen: [11, 2]
            });
            ensure('[', {
              cursorScreen: [9, 2]
            });
            ensure('[', {
              cursorScreen: [5, 2]
            });
            ensure('[', {
              cursorScreen: [3, 2]
            });
            ensure('[', {
              cursorScreen: [2, 2]
            });
            return ensure('[', {
              cursorScreen: [0, 2]
            });
          });
        });
      });
    });
    describe('moveSuccessOnLinewise behaviral characteristic', function() {
      var originalText;
      originalText = null;
      beforeEach(function() {
        settings.set('useClipboardAsDefaultRegister', false);
        set({
          text: "000\n111\n222\n"
        });
        originalText = editor.getText();
        return ensure({
          register: {
            '"': {
              text: void 0
            }
          }
        });
      });
      describe("moveSuccessOnLinewise=false motion", function() {
        describe("when it can move", function() {
          beforeEach(function() {
            return set({
              cursor: [1, 0]
            });
          });
          it("delete by j", function() {
            return ensure("d j", {
              text: "000\n",
              mode: 'normal'
            });
          });
          it("yank by j", function() {
            return ensure("y j", {
              text: originalText,
              register: {
                '"': {
                  text: "111\n222\n"
                }
              },
              mode: 'normal'
            });
          });
          it("change by j", function() {
            return ensure("c j", {
              textC: "000\n|\n",
              register: {
                '"': {
                  text: "111\n222\n"
                }
              },
              mode: 'insert'
            });
          });
          it("delete by k", function() {
            return ensure("d k", {
              text: "222\n",
              mode: 'normal'
            });
          });
          it("yank by k", function() {
            return ensure("y k", {
              text: originalText,
              register: {
                '"': {
                  text: "000\n111\n"
                }
              },
              mode: 'normal'
            });
          });
          return it("change by k", function() {
            return ensure("c k", {
              textC: "|\n222\n",
              register: {
                '"': {
                  text: "000\n111\n"
                }
              },
              mode: 'insert'
            });
          });
        });
        describe("when it can not move-up", function() {
          beforeEach(function() {
            return set({
              cursor: [0, 0]
            });
          });
          it("delete by dk", function() {
            return ensure("d k", {
              text: originalText,
              mode: 'normal'
            });
          });
          it("yank by yk", function() {
            return ensure("y k", {
              text: originalText,
              register: {
                '"': {
                  text: void 0
                }
              },
              mode: 'normal'
            });
          });
          return it("change by ck", function() {
            return ensure("c k", {
              textC: "|000\n111\n222\n",
              register: {
                '"': {
                  text: "\n"
                }
              },
              mode: 'insert'
            });
          });
        });
        return describe("when it can not move-down", function() {
          beforeEach(function() {
            return set({
              cursor: [2, 0]
            });
          });
          it("delete by dj", function() {
            return ensure("d j", {
              text: originalText,
              mode: 'normal'
            });
          });
          it("yank by yj", function() {
            return ensure("y j", {
              text: originalText,
              register: {
                '"': {
                  text: void 0
                }
              },
              mode: 'normal'
            });
          });
          return it("change by cj", function() {
            return ensure("c j", {
              textC: "000\n111\n|222\n",
              register: {
                '"': {
                  text: "\n"
                }
              },
              mode: 'insert'
            });
          });
        });
      });
      return describe("moveSuccessOnLinewise=true motion", function() {
        describe("when it can move", function() {
          beforeEach(function() {
            return set({
              cursor: [1, 0]
            });
          });
          it("delete by G", function() {
            return ensure("d G", {
              text: "000\n",
              mode: 'normal'
            });
          });
          it("yank by G", function() {
            return ensure("y G", {
              text: originalText,
              register: {
                '"': {
                  text: "111\n222\n"
                }
              },
              mode: 'normal'
            });
          });
          it("change by G", function() {
            return ensure("c G", {
              textC: "000\n|\n",
              register: {
                '"': {
                  text: "111\n222\n"
                }
              },
              mode: 'insert'
            });
          });
          it("delete by gg", function() {
            return ensure("d g g", {
              text: "222\n",
              mode: 'normal'
            });
          });
          it("yank by gg", function() {
            return ensure("y g g", {
              text: originalText,
              register: {
                '"': {
                  text: "000\n111\n"
                }
              },
              mode: 'normal'
            });
          });
          return it("change by gg", function() {
            return ensure("c g g", {
              textC: "|\n222\n",
              register: {
                '"': {
                  text: "000\n111\n"
                }
              },
              mode: 'insert'
            });
          });
        });
        describe("when it can not move-up", function() {
          beforeEach(function() {
            return set({
              cursor: [0, 0]
            });
          });
          it("delete by gg", function() {
            return ensure("d g g", {
              text: "111\n222\n",
              mode: 'normal'
            });
          });
          it("yank by gg", function() {
            return ensure("y g g", {
              text: originalText,
              register: {
                '"': {
                  text: "000\n"
                }
              },
              mode: 'normal'
            });
          });
          return it("change by gg", function() {
            return ensure("c g g", {
              textC: "|\n111\n222\n",
              register: {
                '"': {
                  text: "000\n"
                }
              },
              mode: 'insert'
            });
          });
        });
        return describe("when it can not move-down", function() {
          beforeEach(function() {
            return set({
              cursor: [2, 0]
            });
          });
          it("delete by G", function() {
            return ensure("d G", {
              text: "000\n111\n",
              mode: 'normal'
            });
          });
          it("yank by G", function() {
            return ensure("y G", {
              text: originalText,
              register: {
                '"': {
                  text: "222\n"
                }
              },
              mode: 'normal'
            });
          });
          return it("change by G", function() {
            return ensure("c G", {
              textC: "000\n111\n|\n",
              register: {
                '"': {
                  text: "222\n"
                }
              },
              mode: 'insert'
            });
          });
        });
      });
    });
    describe("the w keybinding", function() {
      var baseText;
      baseText = "ab cde1+-\n xyz\n\nzip";
      beforeEach(function() {
        return set({
          text: baseText
        });
      });
      describe("as a motion", function() {
        beforeEach(function() {
          return set({
            cursor: [0, 0]
          });
        });
        it("moves the cursor to the beginning of the next word", function() {
          ensure('w', {
            cursor: [0, 3]
          });
          ensure('w', {
            cursor: [0, 7]
          });
          ensure('w', {
            cursor: [1, 1]
          });
          ensure('w', {
            cursor: [2, 0]
          });
          ensure('w', {
            cursor: [3, 0]
          });
          ensure('w', {
            cursor: [3, 2]
          });
          return ensure('w', {
            cursor: [3, 2]
          });
        });
        it("moves the cursor to the end of the word if last word in file", function() {
          set({
            text: 'abc',
            cursor: [0, 0]
          });
          return ensure('w', {
            cursor: [0, 2]
          });
        });
        it("move to next word by skipping trailing white spaces", function() {
          set({
            textC_: "012|___\n  234"
          });
          return ensure('w', {
            textC_: "012___\n  |234"
          });
        });
        it("move to next word from EOL", function() {
          set({
            textC_: "|\n__234\""
          });
          return ensure('w', {
            textC_: "\n__|234\""
          });
        });
        return describe("for CRLF buffer", function() {
          beforeEach(function() {
            return set({
              text: baseText.replace(/\n/g, "\r\n")
            });
          });
          return describe("as a motion", function() {
            beforeEach(function() {
              return set({
                cursor: [0, 0]
              });
            });
            return it("moves the cursor to the beginning of the next word", function() {
              ensure('w', {
                cursor: [0, 3]
              });
              ensure('w', {
                cursor: [0, 7]
              });
              ensure('w', {
                cursor: [1, 1]
              });
              ensure('w', {
                cursor: [2, 0]
              });
              ensure('w', {
                cursor: [3, 0]
              });
              ensure('w', {
                cursor: [3, 2]
              });
              return ensure('w', {
                cursor: [3, 2]
              });
            });
          });
        });
      });
      describe("when used by Change operator", function() {
        beforeEach(function() {
          return set({
            text_: "__var1 = 1\n__var2 = 2\n"
          });
        });
        describe("when cursor is on word", function() {
          return it("not eat whitespace", function() {
            set({
              cursor: [0, 3]
            });
            return ensure('c w', {
              text_: "__v = 1\n__var2 = 2\n",
              cursor: [0, 3]
            });
          });
        });
        describe("when cursor is on white space", function() {
          return it("only eat white space", function() {
            set({
              cursor: [0, 0]
            });
            return ensure('c w', {
              text_: "var1 = 1\n__var2 = 2\n",
              cursor: [0, 0]
            });
          });
        });
        return describe("when text to EOL is all white space", function() {
          it("wont eat new line character", function() {
            set({
              text_: "abc__\ndef\n",
              cursor: [0, 3]
            });
            return ensure('c w', {
              text: "abc\ndef\n",
              cursor: [0, 3]
            });
          });
          return it("cant eat new line when count is specified", function() {
            set({
              text: "\n\n\n\n\nline6\n",
              cursor: [0, 0]
            });
            return ensure('5 c w', {
              text: "\nline6\n",
              cursor: [0, 0]
            });
          });
        });
      });
      return describe("as a selection", function() {
        describe("within a word", function() {
          return it("selects to the end of the word", function() {
            set({
              cursor: [0, 0]
            });
            return ensure('y w', {
              register: {
                '"': {
                  text: 'ab '
                }
              }
            });
          });
        });
        return describe("between words", function() {
          return it("selects the whitespace", function() {
            set({
              cursor: [0, 2]
            });
            return ensure('y w', {
              register: {
                '"': {
                  text: ' '
                }
              }
            });
          });
        });
      });
    });
    describe("the W keybinding", function() {
      beforeEach(function() {
        return set({
          text: "cde1+- ab \n xyz\n\nzip"
        });
      });
      describe("as a motion", function() {
        beforeEach(function() {
          return set({
            cursor: [0, 0]
          });
        });
        it("moves the cursor to the beginning of the next word", function() {
          ensure('W', {
            cursor: [0, 7]
          });
          ensure('W', {
            cursor: [1, 1]
          });
          ensure('W', {
            cursor: [2, 0]
          });
          return ensure('W', {
            cursor: [3, 0]
          });
        });
        it("moves the cursor to beginning of the next word of next line when all remaining text is white space.", function() {
          set({
            text_: "012___\n__234",
            cursor: [0, 3]
          });
          return ensure('W', {
            cursor: [1, 2]
          });
        });
        return it("moves the cursor to beginning of the next word of next line when cursor is at EOL.", function() {
          set({
            text_: "\n__234",
            cursor: [0, 0]
          });
          return ensure('W', {
            cursor: [1, 2]
          });
        });
      });
      describe("when used by Change operator", function() {
        beforeEach(function() {
          return set({
            text_: "__var1 = 1\n__var2 = 2\n"
          });
        });
        describe("when cursor is on word", function() {
          return it("not eat whitespace", function() {
            set({
              cursor: [0, 3]
            });
            return ensure('c W', {
              text_: "__v = 1\n__var2 = 2\n",
              cursor: [0, 3]
            });
          });
        });
        describe("when cursor is on white space", function() {
          return it("only eat white space", function() {
            set({
              cursor: [0, 0]
            });
            return ensure('c W', {
              text_: "var1 = 1\n__var2 = 2\n",
              cursor: [0, 0]
            });
          });
        });
        return describe("when text to EOL is all white space", function() {
          it("wont eat new line character", function() {
            set({
              text: "abc  \ndef\n",
              cursor: [0, 3]
            });
            return ensure('c W', {
              text: "abc\ndef\n",
              cursor: [0, 3]
            });
          });
          return it("cant eat new line when count is specified", function() {
            set({
              text: "\n\n\n\n\nline6\n",
              cursor: [0, 0]
            });
            return ensure('5 c W', {
              text: "\nline6\n",
              cursor: [0, 0]
            });
          });
        });
      });
      return describe("as a selection", function() {
        describe("within a word", function() {
          return it("selects to the end of the whole word", function() {
            set({
              cursor: [0, 0]
            });
            return ensure('y W', {
              register: {
                '"': {
                  text: 'cde1+- '
                }
              }
            });
          });
        });
        it("continues past blank lines", function() {
          set({
            cursor: [2, 0]
          });
          return ensure('d W', {
            text_: "cde1+- ab_\n_xyz\nzip",
            register: {
              '"': {
                text: "\n"
              }
            }
          });
        });
        return it("doesn't go past the end of the file", function() {
          set({
            cursor: [3, 0]
          });
          return ensure('d W', {
            text_: "cde1+- ab_\n_xyz\n\n",
            register: {
              '"': {
                text: 'zip'
              }
            }
          });
        });
      });
    });
    describe("the e keybinding", function() {
      beforeEach(function() {
        return set({
          text_: "ab cde1+-_\n_xyz\n\nzip"
        });
      });
      describe("as a motion", function() {
        beforeEach(function() {
          return set({
            cursor: [0, 0]
          });
        });
        it("moves the cursor to the end of the current word", function() {
          ensure('e', {
            cursor: [0, 1]
          });
          ensure('e', {
            cursor: [0, 6]
          });
          ensure('e', {
            cursor: [0, 8]
          });
          ensure('e', {
            cursor: [1, 3]
          });
          return ensure('e', {
            cursor: [3, 2]
          });
        });
        return it("skips whitespace until EOF", function() {
          set({
            text: "012\n\n\n012\n\n",
            cursor: [0, 0]
          });
          ensure('e', {
            cursor: [0, 2]
          });
          ensure('e', {
            cursor: [3, 2]
          });
          return ensure('e', {
            cursor: [4, 0]
          });
        });
      });
      return describe("as selection", function() {
        describe("within a word", function() {
          return it("selects to the end of the current word", function() {
            set({
              cursor: [0, 0]
            });
            return ensure('y e', {
              register: {
                '"': {
                  text: 'ab'
                }
              }
            });
          });
        });
        return describe("between words", function() {
          return it("selects to the end of the next word", function() {
            set({
              cursor: [0, 2]
            });
            return ensure('y e', {
              register: {
                '"': {
                  text: ' cde1'
                }
              }
            });
          });
        });
      });
    });
    describe("the ge keybinding", function() {
      describe("as a motion", function() {
        it("moves the cursor to the end of the previous word", function() {
          set({
            text: "1234 5678 wordword"
          });
          set({
            cursor: [0, 16]
          });
          ensure('g e', {
            cursor: [0, 8]
          });
          ensure('g e', {
            cursor: [0, 3]
          });
          ensure('g e', {
            cursor: [0, 0]
          });
          return ensure('g e', {
            cursor: [0, 0]
          });
        });
        it("moves corrently when starting between words", function() {
          set({
            text: "1 leading     end"
          });
          set({
            cursor: [0, 12]
          });
          return ensure('g e', {
            cursor: [0, 8]
          });
        });
        it("takes a count", function() {
          set({
            text: "vim mode plus is getting there"
          });
          set({
            cursor: [0, 28]
          });
          return ensure('5 g e', {
            cursor: [0, 2]
          });
        });
        xit("handles non-words inside words like vim", function() {
          set({
            text: "1234 5678 word-word"
          });
          set({
            cursor: [0, 18]
          });
          ensure('g e', {
            cursor: [0, 14]
          });
          ensure('g e', {
            cursor: [0, 13]
          });
          return ensure('g e', {
            cursor: [0, 8]
          });
        });
        return xit("handles newlines like vim", function() {
          set({
            text: "1234\n\n\n\n5678"
          });
          set({
            cursor: [5, 2]
          });
          ensure('g e', {
            cursor: [4, 0]
          });
          ensure('g e', {
            cursor: [3, 0]
          });
          ensure('g e', {
            cursor: [2, 0]
          });
          ensure('g e', {
            cursor: [1, 0]
          });
          ensure('g e', {
            cursor: [1, 0]
          });
          ensure('g e', {
            cursor: [0, 3]
          });
          return ensure('g e', {
            cursor: [0, 0]
          });
        });
      });
      describe("when used by Change operator", function() {
        it("changes word fragments", function() {
          set({
            text: "cet document"
          });
          set({
            cursor: [0, 7]
          });
          return ensure('c g e', {
            cursor: [0, 2],
            text: "cement",
            mode: 'insert'
          });
        });
        return it("changes whitespace properly", function() {
          set({
            text: "ce    doc"
          });
          set({
            cursor: [0, 4]
          });
          return ensure('c g e', {
            cursor: [0, 1],
            text: "c doc",
            mode: 'insert'
          });
        });
      });
      return describe("in characterwise visual mode", function() {
        return it("selects word fragments", function() {
          set({
            text: "cet document"
          });
          set({
            cursor: [0, 7]
          });
          return ensure('v g e', {
            cursor: [0, 2],
            selectedText: "t docu"
          });
        });
      });
    });
    describe("the E keybinding", function() {
      beforeEach(function() {
        return set({
          text_: "ab  cde1+-_\n_xyz_\n\nzip\n"
        });
      });
      describe("as a motion", function() {
        beforeEach(function() {
          return set({
            cursor: [0, 0]
          });
        });
        return it("moves the cursor to the end of the current word", function() {
          ensure('E', {
            cursor: [0, 1]
          });
          ensure('E', {
            cursor: [0, 9]
          });
          ensure('E', {
            cursor: [1, 3]
          });
          ensure('E', {
            cursor: [3, 2]
          });
          return ensure('E', {
            cursor: [3, 2]
          });
        });
      });
      return describe("as selection", function() {
        describe("within a word", function() {
          return it("selects to the end of the current word", function() {
            set({
              cursor: [0, 0]
            });
            return ensure('y E', {
              register: {
                '"': {
                  text: 'ab'
                }
              }
            });
          });
        });
        describe("between words", function() {
          return it("selects to the end of the next word", function() {
            set({
              cursor: [0, 2]
            });
            return ensure('y E', {
              register: {
                '"': {
                  text: '  cde1+-'
                }
              }
            });
          });
        });
        return describe("press more than once", function() {
          return it("selects to the end of the current word", function() {
            set({
              cursor: [0, 0]
            });
            return ensure('v E E y', {
              register: {
                '"': {
                  text: 'ab  cde1+-'
                }
              }
            });
          });
        });
      });
    });
    describe("the gE keybinding", function() {
      return describe("as a motion", function() {
        return it("moves the cursor to the end of the previous word", function() {
          set({
            text: "12.4 5~7- word-word"
          });
          set({
            cursor: [0, 16]
          });
          ensure('g E', {
            cursor: [0, 8]
          });
          ensure('g E', {
            cursor: [0, 3]
          });
          ensure('g E', {
            cursor: [0, 0]
          });
          return ensure('g E', {
            cursor: [0, 0]
          });
        });
      });
    });
    describe("the (,) sentence keybinding", function() {
      describe("as a motion", function() {
        beforeEach(function() {
          return set({
            cursor: [0, 0],
            text: "sentence one.])'\"    sen.tence .two.\nhere.  sentence three\nmore three\n\n   sentence four\n\n\nsentence five.\nmore five\nmore six\n\n last sentence\nall done seven"
          });
        });
        it("moves the cursor to the end of the sentence", function() {
          ensure(')', {
            cursor: [0, 21]
          });
          ensure(')', {
            cursor: [1, 0]
          });
          ensure(')', {
            cursor: [1, 7]
          });
          ensure(')', {
            cursor: [3, 0]
          });
          ensure(')', {
            cursor: [4, 3]
          });
          ensure(')', {
            cursor: [5, 0]
          });
          ensure(')', {
            cursor: [7, 0]
          });
          ensure(')', {
            cursor: [8, 0]
          });
          ensure(')', {
            cursor: [10, 0]
          });
          ensure(')', {
            cursor: [11, 1]
          });
          ensure(')', {
            cursor: [12, 13]
          });
          ensure(')', {
            cursor: [12, 13]
          });
          ensure('(', {
            cursor: [11, 1]
          });
          ensure('(', {
            cursor: [10, 0]
          });
          ensure('(', {
            cursor: [8, 0]
          });
          ensure('(', {
            cursor: [7, 0]
          });
          ensure('(', {
            cursor: [6, 0]
          });
          ensure('(', {
            cursor: [4, 3]
          });
          ensure('(', {
            cursor: [3, 0]
          });
          ensure('(', {
            cursor: [1, 7]
          });
          ensure('(', {
            cursor: [1, 0]
          });
          ensure('(', {
            cursor: [0, 21]
          });
          ensure('(', {
            cursor: [0, 0]
          });
          return ensure('(', {
            cursor: [0, 0]
          });
        });
        it("skips to beginning of sentence", function() {
          set({
            cursor: [4, 15]
          });
          return ensure('(', {
            cursor: [4, 3]
          });
        });
        it("supports a count", function() {
          set({
            cursor: [0, 0]
          });
          ensure('3 )', {
            cursor: [1, 7]
          });
          return ensure('3 (', {
            cursor: [0, 0]
          });
        });
        it("can move start of buffer or end of buffer at maximum", function() {
          set({
            cursor: [0, 0]
          });
          ensure('2 0 )', {
            cursor: [12, 13]
          });
          return ensure('2 0 (', {
            cursor: [0, 0]
          });
        });
        return describe("sentence motion with skip-blank-row", function() {
          beforeEach(function() {
            return atom.keymaps.add("test", {
              'atom-text-editor.vim-mode-plus:not(.insert-mode)': {
                'g )': 'vim-mode-plus:move-to-next-sentence-skip-blank-row',
                'g (': 'vim-mode-plus:move-to-previous-sentence-skip-blank-row'
              }
            });
          });
          return it("moves the cursor to the end of the sentence", function() {
            ensure('g )', {
              cursor: [0, 21]
            });
            ensure('g )', {
              cursor: [1, 0]
            });
            ensure('g )', {
              cursor: [1, 7]
            });
            ensure('g )', {
              cursor: [4, 3]
            });
            ensure('g )', {
              cursor: [7, 0]
            });
            ensure('g )', {
              cursor: [8, 0]
            });
            ensure('g )', {
              cursor: [11, 1]
            });
            ensure('g )', {
              cursor: [12, 13]
            });
            ensure('g )', {
              cursor: [12, 13]
            });
            ensure('g (', {
              cursor: [11, 1]
            });
            ensure('g (', {
              cursor: [8, 0]
            });
            ensure('g (', {
              cursor: [7, 0]
            });
            ensure('g (', {
              cursor: [4, 3]
            });
            ensure('g (', {
              cursor: [1, 7]
            });
            ensure('g (', {
              cursor: [1, 0]
            });
            ensure('g (', {
              cursor: [0, 21]
            });
            ensure('g (', {
              cursor: [0, 0]
            });
            return ensure('g (', {
              cursor: [0, 0]
            });
          });
        });
      });
      describe("moving inside a blank document", function() {
        beforeEach(function() {
          return set({
            text_: "_____\n_____"
          });
        });
        return it("moves without crashing", function() {
          set({
            cursor: [0, 0]
          });
          ensure(')', {
            cursor: [1, 4]
          });
          ensure(')', {
            cursor: [1, 4]
          });
          ensure('(', {
            cursor: [0, 0]
          });
          return ensure('(', {
            cursor: [0, 0]
          });
        });
      });
      return describe("as a selection", function() {
        beforeEach(function() {
          return set({
            text: "sentence one. sentence two.\n  sentence three."
          });
        });
        it('selects to the end of the current sentence', function() {
          set({
            cursor: [0, 20]
          });
          return ensure('y )', {
            register: {
              '"': {
                text: "ce two.\n  "
              }
            }
          });
        });
        return it('selects to the beginning of the current sentence', function() {
          set({
            cursor: [0, 20]
          });
          return ensure('y (', {
            register: {
              '"': {
                text: "senten"
              }
            }
          });
        });
      });
    });
    describe("the {,} keybinding", function() {
      beforeEach(function() {
        return set({
          text: "\n\n\n3: paragraph-1\n4: paragraph-1\n\n\n\n8: paragraph-2\n\n\n\n12: paragraph-3\n13: paragraph-3\n\n\n16: paragprah-4\n",
          cursor: [0, 0]
        });
      });
      describe("as a motion", function() {
        it("moves the cursor to the end of the paragraph", function() {
          set({
            cursor: [0, 0]
          });
          ensure('}', {
            cursor: [5, 0]
          });
          ensure('}', {
            cursor: [9, 0]
          });
          ensure('}', {
            cursor: [14, 0]
          });
          ensure('{', {
            cursor: [11, 0]
          });
          ensure('{', {
            cursor: [7, 0]
          });
          return ensure('{', {
            cursor: [2, 0]
          });
        });
        it("support count", function() {
          set({
            cursor: [0, 0]
          });
          ensure('3 }', {
            cursor: [14, 0]
          });
          return ensure('3 {', {
            cursor: [2, 0]
          });
        });
        return it("can move start of buffer or end of buffer at maximum", function() {
          set({
            cursor: [0, 0]
          });
          ensure('1 0 }', {
            cursor: [16, 14]
          });
          return ensure('1 0 {', {
            cursor: [0, 0]
          });
        });
      });
      return describe("as a selection", function() {
        it('selects to the end of the current paragraph', function() {
          set({
            cursor: [3, 3]
          });
          return ensure('y }', {
            register: {
              '"': {
                text: "paragraph-1\n4: paragraph-1\n"
              }
            }
          });
        });
        return it('selects to the end of the current paragraph', function() {
          set({
            cursor: [4, 3]
          });
          return ensure('y {', {
            register: {
              '"': {
                text: "\n3: paragraph-1\n4: "
              }
            }
          });
        });
      });
    });
    describe("the b keybinding", function() {
      beforeEach(function() {
        return set({
          textC_: "_ab cde1+-_\n_xyz\n\nzip }\n_|last"
        });
      });
      describe("as a motion", function() {
        return it("moves the cursor to the beginning of the previous word", function() {
          ensure('b', {
            textC: " ab cde1+- \n xyz\n\nzip |}\n last"
          });
          ensure('b', {
            textC: " ab cde1+- \n xyz\n\n|zip }\n last"
          });
          ensure('b', {
            textC: " ab cde1+- \n xyz\n|\nzip }\n last"
          });
          ensure('b', {
            textC: " ab cde1+- \n |xyz\n\nzip }\n last"
          });
          ensure('b', {
            textC: " ab cde1|+- \n xyz\n\nzip }\n last"
          });
          ensure('b', {
            textC: " ab |cde1+- \n xyz\n\nzip }\n last"
          });
          ensure('b', {
            textC: " |ab cde1+- \n xyz\n\nzip }\n last"
          });
          ensure('b', {
            textC: "| ab cde1+- \n xyz\n\nzip }\n last"
          });
          return ensure('b', {
            textC: "| ab cde1+- \n xyz\n\nzip }\n last"
          });
        });
      });
      return describe("as a selection", function() {
        describe("within a word", function() {
          return it("selects to the beginning of the current word", function() {
            set({
              textC: " a|b cd"
            });
            return ensure('y b', {
              textC: " |ab cd",
              register: {
                '"': {
                  text: 'a'
                }
              }
            });
          });
        });
        return describe("between words", function() {
          return it("selects to the beginning of the last word", function() {
            set({
              textC: " ab |cd"
            });
            return ensure('y b', {
              textC: " |ab cd",
              register: {
                '"': {
                  text: 'ab '
                }
              }
            });
          });
        });
      });
    });
    describe("the B keybinding", function() {
      beforeEach(function() {
        return set({
          text: "cde1+- ab\n\t xyz-123\n\n zip\n"
        });
      });
      describe("as a motion", function() {
        beforeEach(function() {
          return set({
            cursor: [4, 0]
          });
        });
        return it("moves the cursor to the beginning of the previous word", function() {
          ensure('B', {
            cursor: [3, 1]
          });
          ensure('B', {
            cursor: [2, 0]
          });
          ensure('B', {
            cursor: [1, 2]
          });
          ensure('B', {
            cursor: [0, 7]
          });
          return ensure('B', {
            cursor: [0, 0]
          });
        });
      });
      return describe("as a selection", function() {
        it("selects to the beginning of the whole word", function() {
          set({
            cursor: [1, 8]
          });
          return ensure('y B', {
            register: {
              '"': {
                text: 'xyz-12'
              }
            }
          });
        });
        return it("doesn't go past the beginning of the file", function() {
          set({
            cursor: [0, 0],
            register: {
              '"': {
                text: 'abc'
              }
            }
          });
          return ensure('y B', {
            register: {
              '"': {
                text: 'abc'
              }
            }
          });
        });
      });
    });
    describe("the ^ keybinding", function() {
      beforeEach(function() {
        return set({
          textC: "|  abcde"
        });
      });
      describe("from the beginning of the line", function() {
        describe("as a motion", function() {
          return it("moves the cursor to the first character of the line", function() {
            return ensure('^', {
              cursor: [0, 2]
            });
          });
        });
        return describe("as a selection", function() {
          it('selects to the first character of the line', function() {
            return ensure('d ^', {
              text: 'abcde',
              cursor: [0, 0]
            });
          });
          return it('selects to the first character of the line', function() {
            return ensure('d I', {
              text: 'abcde',
              cursor: [0, 0]
            });
          });
        });
      });
      describe("from the first character of the line", function() {
        beforeEach(function() {
          return set({
            cursor: [0, 2]
          });
        });
        describe("as a motion", function() {
          return it("stays put", function() {
            return ensure('^', {
              cursor: [0, 2]
            });
          });
        });
        return describe("as a selection", function() {
          return it("does nothing", function() {
            return ensure('d ^', {
              text: '  abcde',
              cursor: [0, 2]
            });
          });
        });
      });
      return describe("from the middle of a word", function() {
        beforeEach(function() {
          return set({
            cursor: [0, 4]
          });
        });
        describe("as a motion", function() {
          return it("moves the cursor to the first character of the line", function() {
            return ensure('^', {
              cursor: [0, 2]
            });
          });
        });
        return describe("as a selection", function() {
          it('selects to the first character of the line', function() {
            return ensure('d ^', {
              text: '  cde',
              cursor: [0, 2]
            });
          });
          return it('selects to the first character of the line', function() {
            return ensure('d I', {
              text: '  cde',
              cursor: [0, 2]
            });
          });
        });
      });
    });
    describe("the 0 keybinding", function() {
      beforeEach(function() {
        return set({
          textC: "  ab|cde"
        });
      });
      describe("as a motion", function() {
        return it("moves the cursor to the first column", function() {
          return ensure('0', {
            cursor: [0, 0]
          });
        });
      });
      return describe("as a selection", function() {
        return it('selects to the first column of the line', function() {
          return ensure('d 0', {
            text: 'cde',
            cursor: [0, 0]
          });
        });
      });
    });
    describe("g 0, g ^ and g $", function() {
      var enableSoftWrapAndEnsure;
      enableSoftWrapAndEnsure = function() {
        editor.setSoftWrapped(true);
        expect(editor.lineTextForScreenRow(0)).toBe(" 1234567");
        expect(editor.lineTextForScreenRow(1)).toBe(" 89B1234");
        expect(editor.lineTextForScreenRow(2)).toBe(" 56789C1");
        expect(editor.lineTextForScreenRow(3)).toBe(" 2345678");
        return expect(editor.lineTextForScreenRow(4)).toBe(" 9");
      };
      beforeEach(function() {
        var scrollbarStyle;
        scrollbarStyle = document.createElement('style');
        scrollbarStyle.textContent = '::-webkit-scrollbar { -webkit-appearance: none }';
        jasmine.attachToDOM(scrollbarStyle);
        set({
          text_: "_123456789B123456789C123456789"
        });
        jasmine.attachToDOM(getView(atom.workspace));
        return waitsForPromise(function() {
          return setEditorWidthInCharacters(editor, 10);
        });
      });
      describe("the g 0 keybinding", function() {
        describe("allowMoveToOffScreenColumnOnScreenLineMotion = true(default)", function() {
          beforeEach(function() {
            return settings.set('allowMoveToOffScreenColumnOnScreenLineMotion', true);
          });
          describe("softwrap = false, firstColumnIsVisible = true", function() {
            beforeEach(function() {
              return set({
                cursor: [0, 3]
              });
            });
            return it("move to column 0 of screen line", function() {
              return ensure("g 0", {
                cursor: [0, 0]
              });
            });
          });
          describe("softwrap = false, firstColumnIsVisible = false", function() {
            beforeEach(function() {
              set({
                cursor: [0, 15]
              });
              return editor.setFirstVisibleScreenColumn(10);
            });
            return it("move to column 0 of screen line", function() {
              return ensure("g 0", {
                cursor: [0, 0]
              });
            });
          });
          return describe("softwrap = true", function() {
            beforeEach(function() {
              return enableSoftWrapAndEnsure();
            });
            return it("move to column 0 of screen line", function() {
              set({
                cursorScreen: [0, 3]
              });
              ensure("g 0", {
                cursorScreen: [0, 0]
              });
              set({
                cursorScreen: [1, 3]
              });
              return ensure("g 0", {
                cursorScreen: [1, 1]
              });
            });
          });
        });
        return describe("allowMoveToOffScreenColumnOnScreenLineMotion = false", function() {
          beforeEach(function() {
            return settings.set('allowMoveToOffScreenColumnOnScreenLineMotion', false);
          });
          describe("softwrap = false, firstColumnIsVisible = true", function() {
            beforeEach(function() {
              return set({
                cursor: [0, 3]
              });
            });
            return it("move to column 0 of screen line", function() {
              return ensure("g 0", {
                cursor: [0, 0]
              });
            });
          });
          describe("softwrap = false, firstColumnIsVisible = false", function() {
            beforeEach(function() {
              set({
                cursor: [0, 15]
              });
              return editor.setFirstVisibleScreenColumn(10);
            });
            return it("move to first visible colum of screen line", function() {
              return ensure("g 0", {
                cursor: [0, 10]
              });
            });
          });
          return describe("softwrap = true", function() {
            beforeEach(function() {
              return enableSoftWrapAndEnsure();
            });
            return it("move to column 0 of screen line", function() {
              set({
                cursorScreen: [0, 3]
              });
              ensure("g 0", {
                cursorScreen: [0, 0]
              });
              set({
                cursorScreen: [1, 3]
              });
              return ensure("g 0", {
                cursorScreen: [1, 1]
              });
            });
          });
        });
      });
      describe("the g ^ keybinding", function() {
        describe("allowMoveToOffScreenColumnOnScreenLineMotion = true(default)", function() {
          beforeEach(function() {
            return settings.set('allowMoveToOffScreenColumnOnScreenLineMotion', true);
          });
          describe("softwrap = false, firstColumnIsVisible = true", function() {
            beforeEach(function() {
              return set({
                cursor: [0, 3]
              });
            });
            return it("move to first-char of screen line", function() {
              return ensure("g ^", {
                cursor: [0, 1]
              });
            });
          });
          describe("softwrap = false, firstColumnIsVisible = false", function() {
            beforeEach(function() {
              set({
                cursor: [0, 15]
              });
              return editor.setFirstVisibleScreenColumn(10);
            });
            return it("move to first-char of screen line", function() {
              return ensure("g ^", {
                cursor: [0, 1]
              });
            });
          });
          return describe("softwrap = true", function() {
            beforeEach(function() {
              return enableSoftWrapAndEnsure();
            });
            return it("move to first-char of screen line", function() {
              set({
                cursorScreen: [0, 3]
              });
              ensure("g ^", {
                cursorScreen: [0, 1]
              });
              set({
                cursorScreen: [1, 3]
              });
              return ensure("g ^", {
                cursorScreen: [1, 1]
              });
            });
          });
        });
        return describe("allowMoveToOffScreenColumnOnScreenLineMotion = false", function() {
          beforeEach(function() {
            return settings.set('allowMoveToOffScreenColumnOnScreenLineMotion', false);
          });
          describe("softwrap = false, firstColumnIsVisible = true", function() {
            beforeEach(function() {
              return set({
                cursor: [0, 3]
              });
            });
            return it("move to first-char of screen line", function() {
              return ensure("g ^", {
                cursor: [0, 1]
              });
            });
          });
          describe("softwrap = false, firstColumnIsVisible = false", function() {
            beforeEach(function() {
              set({
                cursor: [0, 15]
              });
              return editor.setFirstVisibleScreenColumn(10);
            });
            return it("move to first-char of screen line", function() {
              return ensure("g ^", {
                cursor: [0, 10]
              });
            });
          });
          return describe("softwrap = true", function() {
            beforeEach(function() {
              return enableSoftWrapAndEnsure();
            });
            return it("move to first-char of screen line", function() {
              set({
                cursorScreen: [0, 3]
              });
              ensure("g ^", {
                cursorScreen: [0, 1]
              });
              set({
                cursorScreen: [1, 3]
              });
              return ensure("g ^", {
                cursorScreen: [1, 1]
              });
            });
          });
        });
      });
      return describe("the g $ keybinding", function() {
        describe("allowMoveToOffScreenColumnOnScreenLineMotion = true(default)", function() {
          beforeEach(function() {
            return settings.set('allowMoveToOffScreenColumnOnScreenLineMotion', true);
          });
          describe("softwrap = false, lastColumnIsVisible = true", function() {
            beforeEach(function() {
              return set({
                cursor: [0, 27]
              });
            });
            return it("move to last-char of screen line", function() {
              return ensure("g $", {
                cursor: [0, 29]
              });
            });
          });
          describe("softwrap = false, lastColumnIsVisible = false", function() {
            beforeEach(function() {
              set({
                cursor: [0, 15]
              });
              return editor.setFirstVisibleScreenColumn(10);
            });
            return it("move to last-char of screen line", function() {
              return ensure("g $", {
                cursor: [0, 29]
              });
            });
          });
          return describe("softwrap = true", function() {
            beforeEach(function() {
              return enableSoftWrapAndEnsure();
            });
            return it("move to last-char of screen line", function() {
              set({
                cursorScreen: [0, 3]
              });
              ensure("g $", {
                cursorScreen: [0, 7]
              });
              set({
                cursorScreen: [1, 3]
              });
              return ensure("g $", {
                cursorScreen: [1, 7]
              });
            });
          });
        });
        return describe("allowMoveToOffScreenColumnOnScreenLineMotion = false", function() {
          beforeEach(function() {
            return settings.set('allowMoveToOffScreenColumnOnScreenLineMotion', false);
          });
          describe("softwrap = false, lastColumnIsVisible = true", function() {
            beforeEach(function() {
              return set({
                cursor: [0, 27]
              });
            });
            return it("move to last-char of screen line", function() {
              return ensure("g $", {
                cursor: [0, 29]
              });
            });
          });
          describe("softwrap = false, lastColumnIsVisible = false", function() {
            beforeEach(function() {
              set({
                cursor: [0, 15]
              });
              return editor.setFirstVisibleScreenColumn(10);
            });
            return it("move to last-char in visible screen line", function() {
              return ensure("g $", {
                cursor: [0, 18]
              });
            });
          });
          return describe("softwrap = true", function() {
            beforeEach(function() {
              return enableSoftWrapAndEnsure();
            });
            return it("move to last-char of screen line", function() {
              set({
                cursorScreen: [0, 3]
              });
              ensure("g $", {
                cursorScreen: [0, 7]
              });
              set({
                cursorScreen: [1, 3]
              });
              return ensure("g $", {
                cursorScreen: [1, 7]
              });
            });
          });
        });
      });
    });
    describe("the | keybinding", function() {
      beforeEach(function() {
        return set({
          text: "  abcde",
          cursor: [0, 4]
        });
      });
      describe("as a motion", function() {
        return it("moves the cursor to the number column", function() {
          ensure('|', {
            cursor: [0, 0]
          });
          ensure('1 |', {
            cursor: [0, 0]
          });
          ensure('3 |', {
            cursor: [0, 2]
          });
          return ensure('4 |', {
            cursor: [0, 3]
          });
        });
      });
      return describe("as operator's target", function() {
        return it('behave exclusively', function() {
          set({
            cursor: [0, 0]
          });
          return ensure('d 4 |', {
            text: 'bcde',
            cursor: [0, 0]
          });
        });
      });
    });
    describe("the $ keybinding", function() {
      beforeEach(function() {
        return set({
          text: "  abcde\n\n1234567890",
          cursor: [0, 4]
        });
      });
      describe("as a motion from empty line", function() {
        return it("moves the cursor to the end of the line", function() {
          set({
            cursor: [1, 0]
          });
          return ensure('$', {
            cursor: [1, 0]
          });
        });
      });
      describe("as a motion", function() {
        it("moves the cursor to the end of the line", function() {
          return ensure('$', {
            cursor: [0, 6]
          });
        });
        it("set goalColumn Infinity", function() {
          expect(editor.getLastCursor().goalColumn).toBe(null);
          ensure('$', {
            cursor: [0, 6]
          });
          return expect(editor.getLastCursor().goalColumn).toBe(2e308);
        });
        it("should remain in the last column when moving down", function() {
          ensure('$ j', {
            cursor: [1, 0]
          });
          return ensure('j', {
            cursor: [2, 9]
          });
        });
        return it("support count", function() {
          return ensure('3 $', {
            cursor: [2, 9]
          });
        });
      });
      return describe("as a selection", function() {
        return it("selects to the end of the lines", function() {
          return ensure('d $', {
            text: "  ab\n\n1234567890",
            cursor: [0, 3]
          });
        });
      });
    });
    describe("the - keybinding", function() {
      beforeEach(function() {
        return set({
          text: "abcdefg\n  abc\n  abc\n"
        });
      });
      describe("from the middle of a line", function() {
        beforeEach(function() {
          return set({
            cursor: [1, 3]
          });
        });
        describe("as a motion", function() {
          return it("moves the cursor to the last character of the previous line", function() {
            return ensure('-', {
              cursor: [0, 0]
            });
          });
        });
        return describe("as a selection", function() {
          return it("deletes the current and previous line", function() {
            return ensure('d -', {
              text: "  abc\n",
              cursor: [0, 2]
            });
          });
        });
      });
      describe("from the first character of a line indented the same as the previous one", function() {
        beforeEach(function() {
          return set({
            cursor: [2, 2]
          });
        });
        describe("as a motion", function() {
          return it("moves to the first character of the previous line (directly above)", function() {
            return ensure('-', {
              cursor: [1, 2]
            });
          });
        });
        return describe("as a selection", function() {
          return it("selects to the first character of the previous line (directly above)", function() {
            return ensure('d -', {
              text: "abcdefg\n"
            });
          });
        });
      });
      describe("from the beginning of a line preceded by an indented line", function() {
        beforeEach(function() {
          return set({
            cursor: [2, 0]
          });
        });
        describe("as a motion", function() {
          return it("moves the cursor to the first character of the previous line", function() {
            return ensure('-', {
              cursor: [1, 2]
            });
          });
        });
        return describe("as a selection", function() {
          return it("selects to the first character of the previous line", function() {
            return ensure('d -', {
              text: "abcdefg\n"
            });
          });
        });
      });
      return describe("with a count", function() {
        beforeEach(function() {
          return set({
            text: "1\n2\n3\n4\n5\n6\n",
            cursor: [4, 0]
          });
        });
        describe("as a motion", function() {
          return it("moves the cursor to the first character of that many lines previous", function() {
            return ensure('3 -', {
              cursor: [1, 0]
            });
          });
        });
        return describe("as a selection", function() {
          return it("deletes the current line plus that many previous lines", function() {
            return ensure('d 3 -', {
              text: "1\n6\n",
              cursor: [1, 0]
            });
          });
        });
      });
    });
    describe("the + keybinding", function() {
      beforeEach(function() {
        return set({
          text_: "__abc\n__abc\nabcdefg\n"
        });
      });
      describe("from the middle of a line", function() {
        beforeEach(function() {
          return set({
            cursor: [1, 3]
          });
        });
        describe("as a motion", function() {
          return it("moves the cursor to the first character of the next line", function() {
            return ensure('+', {
              cursor: [2, 0]
            });
          });
        });
        return describe("as a selection", function() {
          return it("deletes the current and next line", function() {
            return ensure('d +', {
              text: "  abc\n"
            });
          });
        });
      });
      describe("from the first character of a line indented the same as the next one", function() {
        beforeEach(function() {
          return set({
            cursor: [0, 2]
          });
        });
        describe("as a motion", function() {
          return it("moves to the first character of the next line (directly below)", function() {
            return ensure('+', {
              cursor: [1, 2]
            });
          });
        });
        return describe("as a selection", function() {
          return it("selects to the first character of the next line (directly below)", function() {
            return ensure('d +', {
              text: "abcdefg\n"
            });
          });
        });
      });
      describe("from the beginning of a line followed by an indented line", function() {
        beforeEach(function() {
          return set({
            cursor: [0, 0]
          });
        });
        describe("as a motion", function() {
          return it("moves the cursor to the first character of the next line", function() {
            return ensure('+', {
              cursor: [1, 2]
            });
          });
        });
        return describe("as a selection", function() {
          return it("selects to the first character of the next line", function() {
            return ensure('d +', {
              text: "abcdefg\n",
              cursor: [0, 0]
            });
          });
        });
      });
      return describe("with a count", function() {
        beforeEach(function() {
          return set({
            text: "1\n2\n3\n4\n5\n6\n",
            cursor: [1, 0]
          });
        });
        describe("as a motion", function() {
          return it("moves the cursor to the first character of that many lines following", function() {
            return ensure('3 +', {
              cursor: [4, 0]
            });
          });
        });
        return describe("as a selection", function() {
          return it("deletes the current line plus that many following lines", function() {
            return ensure('d 3 +', {
              text: "1\n6\n",
              cursor: [1, 0]
            });
          });
        });
      });
    });
    describe("the _ keybinding", function() {
      beforeEach(function() {
        return set({
          text_: "__abc\n__abc\nabcdefg\n"
        });
      });
      describe("from the middle of a line", function() {
        beforeEach(function() {
          return set({
            cursor: [1, 3]
          });
        });
        describe("as a motion", function() {
          return it("moves the cursor to the first character of the current line", function() {
            return ensure('_', {
              cursor: [1, 2]
            });
          });
        });
        return describe("as a selection", function() {
          return it("deletes the current line", function() {
            return ensure('d _', {
              text_: "__abc\nabcdefg\n",
              cursor: [1, 0]
            });
          });
        });
      });
      return describe("with a count", function() {
        beforeEach(function() {
          return set({
            text: "1\n2\n3\n4\n5\n6\n",
            cursor: [1, 0]
          });
        });
        describe("as a motion", function() {
          return it("moves the cursor to the first character of that many lines following", function() {
            return ensure('3 _', {
              cursor: [3, 0]
            });
          });
        });
        return describe("as a selection", function() {
          return it("deletes the current line plus that many following lines", function() {
            return ensure('d 3 _', {
              text: "1\n5\n6\n",
              cursor: [1, 0]
            });
          });
        });
      });
    });
    describe("the enter keybinding", function() {
      var startingText;
      startingText = "  abc\n  abc\nabcdefg\n";
      return describe("from the middle of a line", function() {
        var startingCursorPosition;
        startingCursorPosition = [1, 3];
        describe("as a motion", function() {
          return it("acts the same as the + keybinding", function() {
            var referenceCursorPosition;
            set({
              text: startingText,
              cursor: startingCursorPosition
            });
            keystroke('+');
            referenceCursorPosition = editor.getCursorScreenPosition();
            set({
              text: startingText,
              cursor: startingCursorPosition
            });
            return ensure('enter', {
              cursor: referenceCursorPosition
            });
          });
        });
        return describe("as a selection", function() {
          return it("acts the same as the + keybinding", function() {
            var referenceCursorPosition, referenceText;
            set({
              text: startingText,
              cursor: startingCursorPosition
            });
            keystroke('d +');
            referenceText = editor.getText();
            referenceCursorPosition = editor.getCursorScreenPosition();
            set({
              text: startingText,
              cursor: startingCursorPosition
            });
            return ensure('d enter', {
              text: referenceText,
              cursor: referenceCursorPosition
            });
          });
        });
      });
    });
    describe("the gg keybinding with stayOnVerticalMotion = false", function() {
      beforeEach(function() {
        settings.set('stayOnVerticalMotion', false);
        return set({
          text: " 1abc\n 2\n3\n",
          cursor: [0, 2]
        });
      });
      describe("as a motion", function() {
        describe("in normal mode", function() {
          it("moves the cursor to the beginning of the first line", function() {
            set({
              cursor: [2, 0]
            });
            return ensure('g g', {
              cursor: [0, 1]
            });
          });
          return it("move to same position if its on first line and first char", function() {
            return ensure('g g', {
              cursor: [0, 1]
            });
          });
        });
        describe("in linewise visual mode", function() {
          return it("selects to the first line in the file", function() {
            set({
              cursor: [1, 0]
            });
            return ensure('V g g', {
              selectedText: " 1abc\n 2\n",
              cursor: [0, 0]
            });
          });
        });
        return describe("in characterwise visual mode", function() {
          beforeEach(function() {
            return set({
              cursor: [1, 1]
            });
          });
          return it("selects to the first line in the file", function() {
            return ensure('v g g', {
              selectedText: "1abc\n 2",
              cursor: [0, 1]
            });
          });
        });
      });
      return describe("when count specified", function() {
        describe("in normal mode", function() {
          return it("moves the cursor to first char of a specified line", function() {
            return ensure('2 g g', {
              cursor: [1, 1]
            });
          });
        });
        describe("in linewise visual motion", function() {
          return it("selects to a specified line", function() {
            set({
              cursor: [2, 0]
            });
            return ensure('V 2 g g', {
              selectedText: " 2\n3\n",
              cursor: [1, 0]
            });
          });
        });
        return describe("in characterwise visual motion", function() {
          return it("selects to a first character of specified line", function() {
            set({
              cursor: [2, 0]
            });
            return ensure('v 2 g g', {
              selectedText: "2\n3",
              cursor: [1, 1]
            });
          });
        });
      });
    });
    describe("the g_ keybinding", function() {
      beforeEach(function() {
        return set({
          text_: "1__\n    2__\n 3abc\n_"
        });
      });
      describe("as a motion", function() {
        it("moves the cursor to the last nonblank character", function() {
          set({
            cursor: [1, 0]
          });
          return ensure('g _', {
            cursor: [1, 4]
          });
        });
        return it("will move the cursor to the beginning of the line if necessary", function() {
          set({
            cursor: [0, 2]
          });
          return ensure('g _', {
            cursor: [0, 0]
          });
        });
      });
      describe("as a repeated motion", function() {
        return it("moves the cursor downward and outward", function() {
          set({
            cursor: [0, 0]
          });
          return ensure('2 g _', {
            cursor: [1, 4]
          });
        });
      });
      return describe("as a selection", function() {
        return it("selects the current line excluding whitespace", function() {
          set({
            cursor: [1, 2]
          });
          return ensure('v 2 g _', {
            selectedText: "  2  \n 3abc"
          });
        });
      });
    });
    describe("the G keybinding (stayOnVerticalMotion = false)", function() {
      beforeEach(function() {
        settings.set('stayOnVerticalMotion', false);
        return set({
          text_: "1\n____2\n_3abc\n_",
          cursor: [0, 2]
        });
      });
      describe("as a motion", function() {
        return it("moves the cursor to the last line after whitespace", function() {
          return ensure('G', {
            cursor: [3, 0]
          });
        });
      });
      describe("as a repeated motion", function() {
        return it("moves the cursor to a specified line", function() {
          return ensure('2 G', {
            cursor: [1, 4]
          });
        });
      });
      return describe("as a selection", function() {
        return it("selects to the last line in the file", function() {
          set({
            cursor: [1, 0]
          });
          return ensure('v G', {
            selectedText: "    2\n 3abc\n ",
            cursor: [3, 1]
          });
        });
      });
    });
    describe("the N% keybinding", function() {
      beforeEach(function() {
        var i, results;
        return set({
          text: (function() {
            results = [];
            for (i = 0; i <= 999; i++){ results.push(i); }
            return results;
          }).apply(this).join("\n"),
          cursor: [0, 0]
        });
      });
      return describe("put cursor on line specified by percent", function() {
        it("50%", function() {
          return ensure('5 0 %', {
            cursor: [499, 0]
          });
        });
        it("30%", function() {
          return ensure('3 0 %', {
            cursor: [299, 0]
          });
        });
        it("100%", function() {
          return ensure('1 0 0 %', {
            cursor: [999, 0]
          });
        });
        return it("120%", function() {
          return ensure('1 2 0 %', {
            cursor: [999, 0]
          });
        });
      });
    });
    describe("the H, M, L keybinding( stayOnVerticalMotio = false )", function() {
      var eel;
      eel = [][0];
      beforeEach(function() {
        settings.set('stayOnVerticalMotion', false);
        eel = editorElement;
        return set({
          text: "  1\n2\n3\n4\n  5\n6\n7\n8\n9\n  10",
          cursor: [8, 0]
        });
      });
      describe("the H keybinding", function() {
        it("moves the cursor to the non-blank-char on first row if visible", function() {
          spyOn(eel, 'getFirstVisibleScreenRow').andReturn(0);
          return ensure('H', {
            cursor: [0, 2]
          });
        });
        it("moves the cursor to the non-blank-char on first visible row plus scroll offset", function() {
          spyOn(eel, 'getFirstVisibleScreenRow').andReturn(2);
          return ensure('H', {
            cursor: [4, 2]
          });
        });
        return it("respects counts", function() {
          spyOn(eel, 'getFirstVisibleScreenRow').andReturn(0);
          return ensure('4 H', {
            cursor: [3, 0]
          });
        });
      });
      describe("the L keybinding", function() {
        it("moves the cursor to non-blank-char on last row if visible", function() {
          spyOn(editor, 'getLastVisibleScreenRow').andReturn(9);
          return ensure('L', {
            cursor: [9, 2]
          });
        });
        it("moves the cursor to the first visible row plus offset", function() {
          spyOn(editor, 'getLastVisibleScreenRow').andReturn(7);
          return ensure('L', {
            cursor: [4, 2]
          });
        });
        return it("respects counts", function() {
          spyOn(editor, 'getLastVisibleScreenRow').andReturn(9);
          return ensure('3 L', {
            cursor: [7, 0]
          });
        });
      });
      return describe("the M keybinding", function() {
        beforeEach(function() {
          spyOn(eel, 'getFirstVisibleScreenRow').andReturn(0);
          return spyOn(editor, 'getLastVisibleScreenRow').andReturn(10);
        });
        return it("moves the cursor to the non-blank-char of middle of screen", function() {
          return ensure('M', {
            cursor: [4, 2]
          });
        });
      });
    });
    describe("stayOnVerticalMotion setting", function() {
      beforeEach(function() {
        settings.set('stayOnVerticalMotion', true);
        return set({
          text: "  0 000000000000\n  1 111111111111\n2 222222222222\n",
          cursor: [2, 10]
        });
      });
      describe("gg, G, N%", function() {
        return it("go to row with keep column and respect cursor.goalColum", function() {
          ensure('g g', {
            cursor: [0, 10]
          });
          ensure('$', {
            cursor: [0, 15]
          });
          ensure('G', {
            cursor: [2, 13]
          });
          expect(editor.getLastCursor().goalColumn).toBe(2e308);
          ensure('1 %', {
            cursor: [0, 15]
          });
          expect(editor.getLastCursor().goalColumn).toBe(2e308);
          ensure('1 0 h', {
            cursor: [0, 5]
          });
          ensure('5 0 %', {
            cursor: [1, 5]
          });
          return ensure('1 0 0 %', {
            cursor: [2, 5]
          });
        });
      });
      return describe("H, M, L", function() {
        beforeEach(function() {
          spyOn(editorElement, 'getFirstVisibleScreenRow').andReturn(0);
          return spyOn(editor, 'getLastVisibleScreenRow').andReturn(3);
        });
        return it("go to row with keep column and respect cursor.goalColum", function() {
          ensure('H', {
            cursor: [0, 10]
          });
          ensure('M', {
            cursor: [1, 10]
          });
          ensure('L', {
            cursor: [2, 10]
          });
          ensure('$', {
            cursor: [2, 13]
          });
          expect(editor.getLastCursor().goalColumn).toBe(2e308);
          ensure('H', {
            cursor: [0, 15]
          });
          ensure('M', {
            cursor: [1, 15]
          });
          ensure('L', {
            cursor: [2, 13]
          });
          return expect(editor.getLastCursor().goalColumn).toBe(2e308);
        });
      });
    });
    describe('the mark keybindings', function() {
      beforeEach(function() {
        return set({
          text: "  12\n    34\n56\n",
          cursor: [0, 1]
        });
      });
      it('moves to the beginning of the line of a mark', function() {
        set({
          cursor: [1, 1]
        });
        keystroke('m a');
        set({
          cursor: [0, 0]
        });
        return ensure("' a", {
          cursor: [1, 4]
        });
      });
      it('moves literally to a mark', function() {
        set({
          cursor: [1, 2]
        });
        keystroke('m a');
        set({
          cursor: [0, 0]
        });
        return ensure('` a', {
          cursor: [1, 2]
        });
      });
      it('deletes to a mark by line', function() {
        set({
          cursor: [1, 5]
        });
        keystroke('m a');
        set({
          cursor: [0, 0]
        });
        return ensure("d ' a", {
          text: '56\n'
        });
      });
      it('deletes before to a mark literally', function() {
        set({
          cursor: [1, 5]
        });
        keystroke('m a');
        set({
          cursor: [0, 2]
        });
        return ensure('d ` a', {
          text: '  4\n56\n'
        });
      });
      it('deletes after to a mark literally', function() {
        set({
          cursor: [1, 5]
        });
        keystroke('m a');
        set({
          cursor: [2, 1]
        });
        return ensure('d ` a', {
          text: '  12\n    36\n'
        });
      });
      return it('moves back to previous', function() {
        set({
          cursor: [1, 5]
        });
        keystroke('` `');
        set({
          cursor: [2, 1]
        });
        return ensure('` `', {
          cursor: [1, 5]
        });
      });
    });
    describe("jump command update ` and ' mark", function() {
      var ensureJumpAndBack, ensureJumpAndBackLinewise, ensureJumpMark;
      ensureJumpMark = function(value) {
        ensure({
          mark: {
            "`": value
          }
        });
        return ensure({
          mark: {
            "'": value
          }
        });
      };
      ensureJumpAndBack = function(keystroke, option) {
        var afterMove, beforeMove;
        afterMove = option.cursor;
        beforeMove = editor.getCursorBufferPosition();
        ensure(keystroke, {
          cursor: afterMove
        });
        ensureJumpMark(beforeMove);
        expect(beforeMove.isEqual(afterMove)).toBe(false);
        ensure("` `", {
          cursor: beforeMove
        });
        return ensureJumpMark(afterMove);
      };
      ensureJumpAndBackLinewise = function(keystroke, option) {
        var afterMove, beforeMove;
        afterMove = option.cursor;
        beforeMove = editor.getCursorBufferPosition();
        expect(beforeMove.column).not.toBe(0);
        ensure(keystroke, {
          cursor: afterMove
        });
        ensureJumpMark(beforeMove);
        expect(beforeMove.isEqual(afterMove)).toBe(false);
        ensure("' '", {
          cursor: [beforeMove.row, 0]
        });
        return ensureJumpMark(afterMove);
      };
      beforeEach(function() {
        var i, len, mark, ref2, ref3;
        ref2 = "`'";
        for (i = 0, len = ref2.length; i < len; i++) {
          mark = ref2[i];
          if ((ref3 = vimState.mark.marks[mark]) != null) {
            ref3.destroy();
          }
          vimState.mark.marks[mark] = null;
        }
        return set({
          text: "0: oo 0\n1: 1111\n2: 2222\n3: oo 3\n4: 4444\n5: oo 5",
          cursor: [1, 0]
        });
      });
      describe("initial state", function() {
        return it("return [0, 0]", function() {
          ensure({
            mark: {
              "'": [0, 0]
            }
          });
          return ensure({
            mark: {
              "`": [0, 0]
            }
          });
        });
      });
      return describe("jump motion in normal-mode", function() {
        var initial;
        initial = [3, 3];
        beforeEach(function() {
          var component;
          jasmine.attachToDOM(getView(atom.workspace));
          if (editorElement.measureDimensions != null) {
            component = editor.component;
            component.element.style.height = component.getLineHeight() * editor.getLineCount() + 'px';
            editorElement.measureDimensions();
          }
          ensure({
            mark: {
              "'": [0, 0]
            }
          });
          ensure({
            mark: {
              "`": [0, 0]
            }
          });
          return set({
            cursor: initial
          });
        });
        it("G jump&back", function() {
          return ensureJumpAndBack('G', {
            cursor: [5, 3]
          });
        });
        it("g g jump&back", function() {
          return ensureJumpAndBack("g g", {
            cursor: [0, 3]
          });
        });
        it("100 % jump&back", function() {
          return ensureJumpAndBack("1 0 0 %", {
            cursor: [5, 3]
          });
        });
        it(") jump&back", function() {
          return ensureJumpAndBack(")", {
            cursor: [5, 6]
          });
        });
        it("( jump&back", function() {
          return ensureJumpAndBack("(", {
            cursor: [0, 0]
          });
        });
        it("] jump&back", function() {
          return ensureJumpAndBack("]", {
            cursor: [5, 3]
          });
        });
        it("[ jump&back", function() {
          return ensureJumpAndBack("[", {
            cursor: [0, 3]
          });
        });
        it("} jump&back", function() {
          return ensureJumpAndBack("}", {
            cursor: [5, 6]
          });
        });
        it("{ jump&back", function() {
          return ensureJumpAndBack("{", {
            cursor: [0, 0]
          });
        });
        it("L jump&back", function() {
          return ensureJumpAndBack("L", {
            cursor: [5, 3]
          });
        });
        it("H jump&back", function() {
          return ensureJumpAndBack("H", {
            cursor: [0, 3]
          });
        });
        it("M jump&back", function() {
          return ensureJumpAndBack("M", {
            cursor: [2, 3]
          });
        });
        it("* jump&back", function() {
          return ensureJumpAndBack("*", {
            cursor: [5, 3]
          });
        });
        it("Sharp(#) jump&back", function() {
          return ensureJumpAndBack('#', {
            cursor: [0, 3]
          });
        });
        it("/ jump&back", function() {
          return ensureJumpAndBack('/ oo enter', {
            cursor: [5, 3]
          });
        });
        it("? jump&back", function() {
          return ensureJumpAndBack('? oo enter', {
            cursor: [0, 3]
          });
        });
        it("n jump&back", function() {
          set({
            cursor: [0, 0]
          });
          ensure('/ oo enter', {
            cursor: [0, 3]
          });
          ensureJumpAndBack("n", {
            cursor: [3, 3]
          });
          return ensureJumpAndBack("N", {
            cursor: [5, 3]
          });
        });
        it("N jump&back", function() {
          set({
            cursor: [0, 0]
          });
          ensure('? oo enter', {
            cursor: [5, 3]
          });
          ensureJumpAndBack("n", {
            cursor: [3, 3]
          });
          return ensureJumpAndBack("N", {
            cursor: [0, 3]
          });
        });
        it("G jump&back linewise", function() {
          return ensureJumpAndBackLinewise('G', {
            cursor: [5, 3]
          });
        });
        it("g g jump&back linewise", function() {
          return ensureJumpAndBackLinewise("g g", {
            cursor: [0, 3]
          });
        });
        it("100 % jump&back linewise", function() {
          return ensureJumpAndBackLinewise("1 0 0 %", {
            cursor: [5, 3]
          });
        });
        it(") jump&back linewise", function() {
          return ensureJumpAndBackLinewise(")", {
            cursor: [5, 6]
          });
        });
        it("( jump&back linewise", function() {
          return ensureJumpAndBackLinewise("(", {
            cursor: [0, 0]
          });
        });
        it("] jump&back linewise", function() {
          return ensureJumpAndBackLinewise("]", {
            cursor: [5, 3]
          });
        });
        it("[ jump&back linewise", function() {
          return ensureJumpAndBackLinewise("[", {
            cursor: [0, 3]
          });
        });
        it("} jump&back linewise", function() {
          return ensureJumpAndBackLinewise("}", {
            cursor: [5, 6]
          });
        });
        it("{ jump&back linewise", function() {
          return ensureJumpAndBackLinewise("{", {
            cursor: [0, 0]
          });
        });
        it("L jump&back linewise", function() {
          return ensureJumpAndBackLinewise("L", {
            cursor: [5, 3]
          });
        });
        it("H jump&back linewise", function() {
          return ensureJumpAndBackLinewise("H", {
            cursor: [0, 3]
          });
        });
        it("M jump&back linewise", function() {
          return ensureJumpAndBackLinewise("M", {
            cursor: [2, 3]
          });
        });
        return it("* jump&back linewise", function() {
          return ensureJumpAndBackLinewise("*", {
            cursor: [5, 3]
          });
        });
      });
    });
    describe('the V keybinding', function() {
      var text;
      text = [][0];
      beforeEach(function() {
        text = new TextData("01\n002\n0003\n00004\n000005\n");
        return set({
          text: text.getRaw(),
          cursor: [1, 1]
        });
      });
      it("selects down a line", function() {
        return ensure('V j j', {
          selectedText: text.getLines([1, 2, 3])
        });
      });
      return it("selects up a line", function() {
        return ensure('V k', {
          selectedText: text.getLines([0, 1])
        });
      });
    });
    describe('MoveTo(Previous|Next)Fold(Start|End)', function() {
      beforeEach(function() {
        waitsForPromise(function() {
          return atom.packages.activatePackage('language-coffee-script');
        });
        getVimState('sample.coffee', function(state, vim) {
          editor = state.editor, editorElement = state.editorElement;
          return set = vim.set, ensure = vim.ensure, keystroke = vim.keystroke, vim;
        });
        return runs(function() {
          return atom.keymaps.add("test", {
            'atom-text-editor.vim-mode-plus:not(.insert-mode)': {
              '[ [': 'vim-mode-plus:move-to-previous-fold-start',
              '] [': 'vim-mode-plus:move-to-next-fold-start',
              '[ ]': 'vim-mode-plus:move-to-previous-fold-end',
              '] ]': 'vim-mode-plus:move-to-next-fold-end'
            }
          });
        });
      });
      afterEach(function() {
        return atom.packages.deactivatePackage('language-coffee-script');
      });
      describe("MoveToPreviousFoldStart", function() {
        beforeEach(function() {
          return set({
            cursor: [30, 0]
          });
        });
        return it("move to first char of previous fold start row", function() {
          ensure('[ [', {
            cursor: [22, 6]
          });
          ensure('[ [', {
            cursor: [20, 6]
          });
          ensure('[ [', {
            cursor: [18, 4]
          });
          ensure('[ [', {
            cursor: [9, 2]
          });
          return ensure('[ [', {
            cursor: [8, 0]
          });
        });
      });
      describe("MoveToNextFoldStart", function() {
        beforeEach(function() {
          return set({
            cursor: [0, 0]
          });
        });
        return it("move to first char of next fold start row", function() {
          ensure('] [', {
            cursor: [8, 0]
          });
          ensure('] [', {
            cursor: [9, 2]
          });
          ensure('] [', {
            cursor: [18, 4]
          });
          ensure('] [', {
            cursor: [20, 6]
          });
          return ensure('] [', {
            cursor: [22, 6]
          });
        });
      });
      describe("MoveToPrevisFoldEnd", function() {
        beforeEach(function() {
          return set({
            cursor: [30, 0]
          });
        });
        return it("move to first char of previous fold end row", function() {
          ensure('[ ]', {
            cursor: [28, 2]
          });
          ensure('[ ]', {
            cursor: [25, 4]
          });
          ensure('[ ]', {
            cursor: [23, 8]
          });
          return ensure('[ ]', {
            cursor: [21, 8]
          });
        });
      });
      return describe("MoveToNextFoldEnd", function() {
        beforeEach(function() {
          return set({
            cursor: [0, 0]
          });
        });
        return it("move to first char of next fold end row", function() {
          ensure('] ]', {
            cursor: [21, 8]
          });
          ensure('] ]', {
            cursor: [23, 8]
          });
          ensure('] ]', {
            cursor: [25, 4]
          });
          return ensure('] ]', {
            cursor: [28, 2]
          });
        });
      });
    });
    describe('MoveTo(Previous|Next)String', function() {
      beforeEach(function() {
        return atom.keymaps.add("test", {
          'atom-text-editor.vim-mode-plus:not(.insert-mode)': {
            'g s': 'vim-mode-plus:move-to-next-string',
            'g S': 'vim-mode-plus:move-to-previous-string'
          }
        });
      });
      describe('editor for softTab', function() {
        var pack;
        pack = 'language-coffee-script';
        beforeEach(function() {
          waitsForPromise(function() {
            return atom.packages.activatePackage(pack);
          });
          return runs(function() {
            return set({
              text: "disposable?.dispose()\ndisposable = atom.commands.add 'atom-workspace',\n  'check-up': -> fun('backward')\n  'check-down': -> fun('forward')\n\n",
              grammar: 'source.coffee'
            });
          });
        });
        afterEach(function() {
          return atom.packages.deactivatePackage(pack);
        });
        it("move to next string", function() {
          set({
            cursor: [0, 0]
          });
          ensure('g s', {
            cursor: [1, 31]
          });
          ensure('g s', {
            cursor: [2, 2]
          });
          ensure('g s', {
            cursor: [2, 21]
          });
          ensure('g s', {
            cursor: [3, 2]
          });
          return ensure('g s', {
            cursor: [3, 23]
          });
        });
        it("move to previous string", function() {
          set({
            cursor: [4, 0]
          });
          ensure('g S', {
            cursor: [3, 23]
          });
          ensure('g S', {
            cursor: [3, 2]
          });
          ensure('g S', {
            cursor: [2, 21]
          });
          ensure('g S', {
            cursor: [2, 2]
          });
          return ensure('g S', {
            cursor: [1, 31]
          });
        });
        return it("support count", function() {
          set({
            cursor: [0, 0]
          });
          ensure('3 g s', {
            cursor: [2, 21]
          });
          return ensure('3 g S', {
            cursor: [1, 31]
          });
        });
      });
      return describe('editor for hardTab', function() {
        var pack;
        pack = 'language-go';
        beforeEach(function() {
          waitsForPromise(function() {
            return atom.packages.activatePackage(pack);
          });
          return getVimState('sample.go', function(state, vimEditor) {
            editor = state.editor, editorElement = state.editorElement;
            return set = vimEditor.set, ensure = vimEditor.ensure, keystroke = vimEditor.keystroke, vimEditor;
          });
        });
        afterEach(function() {
          return atom.packages.deactivatePackage(pack);
        });
        it("move to next string", function() {
          set({
            cursorScreen: [0, 0]
          });
          ensure('g s', {
            cursorScreen: [2, 7]
          });
          ensure('g s', {
            cursorScreen: [3, 7]
          });
          ensure('g s', {
            cursorScreen: [8, 8]
          });
          ensure('g s', {
            cursorScreen: [9, 8]
          });
          ensure('g s', {
            cursorScreen: [11, 20]
          });
          ensure('g s', {
            cursorScreen: [12, 15]
          });
          ensure('g s', {
            cursorScreen: [13, 15]
          });
          ensure('g s', {
            cursorScreen: [15, 15]
          });
          return ensure('g s', {
            cursorScreen: [16, 15]
          });
        });
        return it("move to previous string", function() {
          set({
            cursorScreen: [18, 0]
          });
          ensure('g S', {
            cursorScreen: [16, 15]
          });
          ensure('g S', {
            cursorScreen: [15, 15]
          });
          ensure('g S', {
            cursorScreen: [13, 15]
          });
          ensure('g S', {
            cursorScreen: [12, 15]
          });
          ensure('g S', {
            cursorScreen: [11, 20]
          });
          ensure('g S', {
            cursorScreen: [9, 8]
          });
          ensure('g S', {
            cursorScreen: [8, 8]
          });
          ensure('g S', {
            cursorScreen: [3, 7]
          });
          return ensure('g S', {
            cursorScreen: [2, 7]
          });
        });
      });
    });
    describe('MoveTo(Previous|Next)Number', function() {
      var pack;
      pack = 'language-coffee-script';
      beforeEach(function() {
        atom.keymaps.add("test", {
          'atom-text-editor.vim-mode-plus:not(.insert-mode)': {
            'g n': 'vim-mode-plus:move-to-next-number',
            'g N': 'vim-mode-plus:move-to-previous-number'
          }
        });
        waitsForPromise(function() {
          return atom.packages.activatePackage(pack);
        });
        runs(function() {
          return set({
            grammar: 'source.coffee'
          });
        });
        return set({
          text: "num1 = 1\narr1 = [1, 101, 1001]\narr2 = [\"1\", \"2\", \"3\"]\nnum2 = 2\nfun(\"1\", 2, 3)\n\n"
        });
      });
      afterEach(function() {
        return atom.packages.deactivatePackage(pack);
      });
      it("move to next number", function() {
        set({
          cursor: [0, 0]
        });
        ensure('g n', {
          cursor: [0, 7]
        });
        ensure('g n', {
          cursor: [1, 8]
        });
        ensure('g n', {
          cursor: [1, 11]
        });
        ensure('g n', {
          cursor: [1, 16]
        });
        ensure('g n', {
          cursor: [3, 7]
        });
        ensure('g n', {
          cursor: [4, 9]
        });
        return ensure('g n', {
          cursor: [4, 12]
        });
      });
      it("move to previous number", function() {
        set({
          cursor: [5, 0]
        });
        ensure('g N', {
          cursor: [4, 12]
        });
        ensure('g N', {
          cursor: [4, 9]
        });
        ensure('g N', {
          cursor: [3, 7]
        });
        ensure('g N', {
          cursor: [1, 16]
        });
        ensure('g N', {
          cursor: [1, 11]
        });
        ensure('g N', {
          cursor: [1, 8]
        });
        return ensure('g N', {
          cursor: [0, 7]
        });
      });
      return it("support count", function() {
        set({
          cursor: [0, 0]
        });
        ensure('5 g n', {
          cursor: [3, 7]
        });
        return ensure('3 g N', {
          cursor: [1, 8]
        });
      });
    });
    return describe('subword motion', function() {
      beforeEach(function() {
        return atom.keymaps.add("test", {
          'atom-text-editor.vim-mode-plus:not(.insert-mode)': {
            'q': 'vim-mode-plus:move-to-next-subword',
            'Q': 'vim-mode-plus:move-to-previous-subword',
            'ctrl-e': 'vim-mode-plus:move-to-end-of-subword'
          }
        });
      });
      it("move to next/previous subword", function() {
        set({
          textC: "|camelCase => (with special) ChaRActerRs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('q', {
          textC: "camel|Case => (with special) ChaRActerRs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('q', {
          textC: "camelCase| => (with special) ChaRActerRs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('q', {
          textC: "camelCase =>| (with special) ChaRActerRs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('q', {
          textC: "camelCase => (|with special) ChaRActerRs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('q', {
          textC: "camelCase => (with |special) ChaRActerRs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('q', {
          textC: "camelCase => (with special|) ChaRActerRs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('q', {
          textC: "camelCase => (with special) |ChaRActerRs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('q', {
          textC: "camelCase => (with special) Cha|RActerRs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('q', {
          textC: "camelCase => (with special) ChaR|ActerRs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('q', {
          textC: "camelCase => (with special) ChaRActer|Rs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('q', {
          textC: "camelCase => (with special) ChaRActerRs\n\n|dash-case\n\nsnake_case_word\n"
        });
        ensure('q', {
          textC: "camelCase => (with special) ChaRActerRs\n\ndash|-case\n\nsnake_case_word\n"
        });
        ensure('q', {
          textC: "camelCase => (with special) ChaRActerRs\n\ndash-|case\n\nsnake_case_word\n"
        });
        ensure('q', {
          textC: "camelCase => (with special) ChaRActerRs\n\ndash-case\n\n|snake_case_word\n"
        });
        ensure('q', {
          textC: "camelCase => (with special) ChaRActerRs\n\ndash-case\n\nsnake|_case_word\n"
        });
        ensure('q', {
          textC: "camelCase => (with special) ChaRActerRs\n\ndash-case\n\nsnake_case|_word\n"
        });
        ensure('q', {
          textC: "camelCase => (with special) ChaRActerRs\n\ndash-case\n\nsnake_case_wor|d\n"
        });
        ensure('Q', {
          textC: "camelCase => (with special) ChaRActerRs\n\ndash-case\n\nsnake_case|_word\n"
        });
        ensure('Q', {
          textC: "camelCase => (with special) ChaRActerRs\n\ndash-case\n\nsnake|_case_word\n"
        });
        ensure('Q', {
          textC: "camelCase => (with special) ChaRActerRs\n\ndash-case\n\n|snake_case_word\n"
        });
        ensure('Q', {
          textC: "camelCase => (with special) ChaRActerRs\n\ndash-|case\n\nsnake_case_word\n"
        });
        ensure('Q', {
          textC: "camelCase => (with special) ChaRActerRs\n\ndash|-case\n\nsnake_case_word\n"
        });
        ensure('Q', {
          textC: "camelCase => (with special) ChaRActerRs\n\n|dash-case\n\nsnake_case_word\n"
        });
        ensure('Q', {
          textC: "camelCase => (with special) ChaRActer|Rs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('Q', {
          textC: "camelCase => (with special) ChaR|ActerRs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('Q', {
          textC: "camelCase => (with special) Cha|RActerRs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('Q', {
          textC: "camelCase => (with special) |ChaRActerRs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('Q', {
          textC: "camelCase => (with special|) ChaRActerRs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('Q', {
          textC: "camelCase => (with |special) ChaRActerRs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('Q', {
          textC: "camelCase => (|with special) ChaRActerRs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('Q', {
          textC: "camelCase =>| (with special) ChaRActerRs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('Q', {
          textC: "camelCase| => (with special) ChaRActerRs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('Q', {
          textC: "camel|Case => (with special) ChaRActerRs\n\ndash-case\n\nsnake_case_word\n"
        });
        return ensure('Q', {
          textC: "|camelCase => (with special) ChaRActerRs\n\ndash-case\n\nsnake_case_word\n"
        });
      });
      return it("move-to-end-of-subword", function() {
        set({
          textC: "|camelCase => (with special) ChaRActerRs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('ctrl-e', {
          textC: "came|lCase => (with special) ChaRActerRs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('ctrl-e', {
          textC: "camelCas|e => (with special) ChaRActerRs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('ctrl-e', {
          textC: "camelCase =|> (with special) ChaRActerRs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('ctrl-e', {
          textC: "camelCase => |(with special) ChaRActerRs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('ctrl-e', {
          textC: "camelCase => (wit|h special) ChaRActerRs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('ctrl-e', {
          textC: "camelCase => (with specia|l) ChaRActerRs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('ctrl-e', {
          textC: "camelCase => (with special|) ChaRActerRs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('ctrl-e', {
          textC: "camelCase => (with special) Ch|aRActerRs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('ctrl-e', {
          textC: "camelCase => (with special) Cha|RActerRs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('ctrl-e', {
          textC: "camelCase => (with special) ChaRActe|rRs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('ctrl-e', {
          textC: "camelCase => (with special) ChaRActerR|s\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('ctrl-e', {
          textC: "camelCase => (with special) ChaRActerRs\n\ndas|h-case\n\nsnake_case_word\n"
        });
        ensure('ctrl-e', {
          textC: "camelCase => (with special) ChaRActerRs\n\ndash|-case\n\nsnake_case_word\n"
        });
        ensure('ctrl-e', {
          textC: "camelCase => (with special) ChaRActerRs\n\ndash-cas|e\n\nsnake_case_word\n"
        });
        ensure('ctrl-e', {
          textC: "camelCase => (with special) ChaRActerRs\n\ndash-case\n\nsnak|e_case_word\n"
        });
        ensure('ctrl-e', {
          textC: "camelCase => (with special) ChaRActerRs\n\ndash-case\n\nsnake_cas|e_word\n"
        });
        return ensure('ctrl-e', {
          textC: "camelCase => (with special) ChaRActerRs\n\ndash-case\n\nsnake_case_wor|d\n"
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9zcGVjL21vdGlvbi1nZW5lcmFsLXNwZWMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQyxRQUFTLE9BQUEsQ0FBUSxNQUFSOztFQUNWLE1BQTZDLE9BQUEsQ0FBUSxlQUFSLENBQTdDLEVBQUMsNkJBQUQsRUFBYyx1QkFBZCxFQUF3Qix1QkFBeEIsRUFBa0M7O0VBQ2xDLFFBQUEsR0FBVyxPQUFBLENBQVEsaUJBQVI7O0VBRVgsMEJBQUEsR0FBNkIsU0FBQyxNQUFELEVBQVMsaUJBQVQ7QUFDM0IsUUFBQTtJQUFBLE1BQU0sQ0FBQyxtQkFBUCxDQUEyQixDQUEzQjtJQUNBLFNBQUEsR0FBWSxNQUFNLENBQUM7SUFDbkIsU0FBUyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBeEIsR0FDRSxTQUFTLENBQUMsdUJBQVYsQ0FBQSxDQUFBLEdBQXNDLGlCQUFBLEdBQW9CLFNBQVMsQ0FBQyxZQUFZLENBQUMsa0JBQWpGLEdBQXNHO0FBQ3hHLFdBQU8sU0FBUyxDQUFDLG9CQUFWLENBQUE7RUFMb0I7O0VBTzdCLFFBQUEsQ0FBUyxnQkFBVCxFQUEyQixTQUFBO0FBQ3pCLFFBQUE7SUFBQSxPQUE0RCxFQUE1RCxFQUFDLGFBQUQsRUFBTSxnQkFBTixFQUFjLG1CQUFkLEVBQXlCLGdCQUF6QixFQUFpQyx1QkFBakMsRUFBZ0Q7SUFFaEQsVUFBQSxDQUFXLFNBQUE7YUFDVCxXQUFBLENBQVksU0FBQyxLQUFELEVBQVEsSUFBUjtRQUNWLFFBQUEsR0FBVztRQUNWLHdCQUFELEVBQVM7ZUFDUixjQUFELEVBQU0sb0JBQU4sRUFBYywwQkFBZCxFQUEyQjtNQUhqQixDQUFaO0lBRFMsQ0FBWDtJQU1BLFFBQUEsQ0FBUyxnQkFBVCxFQUEyQixTQUFBO0FBQ3pCLFVBQUE7TUFBQSxJQUFBLEdBQU87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LDRFQUFQO1NBQVo7UUFDQSxNQUFBLENBQU8sR0FBUCxFQUFZO1VBQUEsS0FBQSxFQUFPLDRFQUFQO1NBQVo7UUFDQSxNQUFBLENBQU8sR0FBUCxFQUFZO1VBQUEsS0FBQSxFQUFPLDRFQUFQO1NBQVo7UUFDQSxNQUFBLENBQU8sR0FBUCxFQUFZO1VBQUEsS0FBQSxFQUFPLDRFQUFQO1NBQVo7UUFDQSxNQUFBLENBQU8sR0FBUCxFQUFZO1VBQUEsS0FBQSxFQUFPLDRFQUFQO1NBQVo7UUFDQSxNQUFBLENBQU8sR0FBUCxFQUFZO1VBQUEsS0FBQSxFQUFPLDRFQUFQO1NBQVo7UUFDQSxNQUFBLENBQU8sR0FBUCxFQUFZO1VBQUEsS0FBQSxFQUFPLDRFQUFQO1NBQVo7UUFDQSxNQUFBLENBQU8sR0FBUCxFQUFZO1VBQUEsS0FBQSxFQUFPLDRFQUFQO1NBQVo7UUFDQSxNQUFBLENBQU8sR0FBUCxFQUFZO1VBQUEsS0FBQSxFQUFPLDRFQUFQO1NBQVo7UUFDQSxNQUFBLENBQU8sR0FBUCxFQUFZO1VBQUEsS0FBQSxFQUFPLDRFQUFQO1NBQVo7UUFDQSxNQUFBLENBQU8sR0FBUCxFQUFZO1VBQUEsS0FBQSxFQUFPLDRFQUFQO1NBQVo7UUFDQSxNQUFBLENBQU8sR0FBUCxFQUFZO1VBQUEsS0FBQSxFQUFPLDRFQUFQO1NBQVo7UUFDQSxNQUFBLENBQU8sR0FBUCxFQUFZO1VBQUEsS0FBQSxFQUFPLDRFQUFQO1NBQVo7UUFDQSxNQUFBLENBQU8sR0FBUCxFQUFZO1VBQUEsS0FBQSxFQUFPLDRFQUFQO1NBQVo7UUFDQSxNQUFBLENBQU8sR0FBUCxFQUFZO1VBQUEsS0FBQSxFQUFPLDRFQUFQO1NBQVo7UUFDQSxNQUFBLENBQU8sR0FBUCxFQUFZO1VBQUEsS0FBQSxFQUFPLDRFQUFQO1NBQVo7UUFDQSxNQUFBLENBQU8sR0FBUCxFQUFZO1VBQUEsS0FBQSxFQUFPLDRFQUFQO1NBQVo7UUFDQSxNQUFBLENBQU8sR0FBUCxFQUFZO1VBQUEsS0FBQSxFQUFPLDRFQUFQO1NBQVo7UUFDQSxNQUFBLENBQU8sR0FBUCxFQUFZO1VBQUEsS0FBQSxFQUFPLDRFQUFQO1NBQVo7UUFDQSxNQUFBLENBQU8sR0FBUCxFQUFZO1VBQUEsS0FBQSxFQUFPLDRFQUFQO1NBQVo7UUFDQSxNQUFBLENBQU8sR0FBUCxFQUFZO1VBQUEsS0FBQSxFQUFPLDRFQUFQO1NBQVo7UUFDQSxNQUFBLENBQU8sR0FBUCxFQUFZO1VBQUEsS0FBQSxFQUFPLDRFQUFQO1NBQVo7UUFDQSxNQUFBLENBQU8sR0FBUCxFQUFZO1VBQUEsS0FBQSxFQUFPLDRFQUFQO1NBQVo7UUFDQSxNQUFBLENBQU8sR0FBUCxFQUFZO1VBQUEsS0FBQSxFQUFPLDRFQUFQO1NBQVo7UUFDQSxNQUFBLENBQU8sR0FBUCxFQUFZO1VBQUEsS0FBQSxFQUFPLDRFQUFQO1NBQVo7UUFDQSxNQUFBLENBQU8sR0FBUCxFQUFZO1VBQUEsS0FBQSxFQUFPLDRFQUFQO1NBQVo7UUFDQSxNQUFBLENBQU8sR0FBUCxFQUFZO1VBQUEsS0FBQSxFQUFPLDRFQUFQO1NBQVo7UUFDQSxNQUFBLENBQU8sR0FBUCxFQUFZO1VBQUEsS0FBQSxFQUFPLDRFQUFQO1NBQVo7UUFDQSxNQUFBLENBQU8sR0FBUCxFQUFZO1VBQUEsS0FBQSxFQUFPLDRFQUFQO1NBQVo7UUFDQSxNQUFBLENBQU8sR0FBUCxFQUFZO1VBQUEsS0FBQSxFQUFPLDRFQUFQO1NBQVo7UUFDQSxNQUFBLENBQU8sR0FBUCxFQUFZO1VBQUEsS0FBQSxFQUFPLDRFQUFQO1NBQVo7UUFDQSxNQUFBLENBQU8sR0FBUCxFQUFZO1VBQUEsS0FBQSxFQUFPLDRFQUFQO1NBQVo7ZUFDQSxNQUFBLENBQU8sR0FBUCxFQUFZO1VBQUEsS0FBQSxFQUFPLDRFQUFQO1NBQVo7TUFuQ2tDLENBQXBDO2FBb0NBLEVBQUEsQ0FBRyx3QkFBSCxFQUE2QixTQUFBO1FBQzNCLEdBQUEsQ0FBSTtVQUFBLEtBQUEsRUFBTyw0RUFBUDtTQUFKO1FBQ0EsTUFBQSxDQUFPLFFBQVAsRUFBaUI7VUFBQSxLQUFBLEVBQU8sNEVBQVA7U0FBakI7UUFDQSxNQUFBLENBQU8sUUFBUCxFQUFpQjtVQUFBLEtBQUEsRUFBTyw0RUFBUDtTQUFqQjtRQUNBLE1BQUEsQ0FBTyxRQUFQLEVBQWlCO1VBQUEsS0FBQSxFQUFPLDRFQUFQO1NBQWpCO1FBQ0EsTUFBQSxDQUFPLFFBQVAsRUFBaUI7VUFBQSxLQUFBLEVBQU8sNEVBQVA7U0FBakI7UUFDQSxNQUFBLENBQU8sUUFBUCxFQUFpQjtVQUFBLEtBQUEsRUFBTyw0RUFBUDtTQUFqQjtRQUNBLE1BQUEsQ0FBTyxRQUFQLEVBQWlCO1VBQUEsS0FBQSxFQUFPLDRFQUFQO1NBQWpCO1FBQ0EsTUFBQSxDQUFPLFFBQVAsRUFBaUI7VUFBQSxLQUFBLEVBQU8sNEVBQVA7U0FBakI7UUFDQSxNQUFBLENBQU8sUUFBUCxFQUFpQjtVQUFBLEtBQUEsRUFBTyw0RUFBUDtTQUFqQjtRQUNBLE1BQUEsQ0FBTyxRQUFQLEVBQWlCO1VBQUEsS0FBQSxFQUFPLDRFQUFQO1NBQWpCO1FBQ0EsTUFBQSxDQUFPLFFBQVAsRUFBaUI7VUFBQSxLQUFBLEVBQU8sNEVBQVA7U0FBakI7UUFDQSxNQUFBLENBQU8sUUFBUCxFQUFpQjtVQUFBLEtBQUEsRUFBTyw0RUFBUDtTQUFqQjtRQUNBLE1BQUEsQ0FBTyxRQUFQLEVBQWlCO1VBQUEsS0FBQSxFQUFPLDRFQUFQO1NBQWpCO1FBQ0EsTUFBQSxDQUFPLFFBQVAsRUFBaUI7VUFBQSxLQUFBLEVBQU8sNEVBQVA7U0FBakI7UUFDQSxNQUFBLENBQU8sUUFBUCxFQUFpQjtVQUFBLEtBQUEsRUFBTyw0RUFBUDtTQUFqQjtRQUNBLE1BQUEsQ0FBTyxRQUFQLEVBQWlCO1VBQUEsS0FBQSxFQUFPLDRFQUFQO1NBQWpCO1FBQ0EsTUFBQSxDQUFPLFFBQVAsRUFBaUI7VUFBQSxLQUFBLEVBQU8sNEVBQVA7U0FBakI7ZUFDQSxNQUFBLENBQU8sUUFBUCxFQUFpQjtVQUFBLEtBQUEsRUFBTyw0RUFBUDtTQUFqQjtNQWxCMkIsQ0FBN0I7SUE1Q3lCLENBQTNCO0VBcmhFeUIsQ0FBM0I7QUFYQSIsInNvdXJjZXNDb250ZW50IjpbIntQb2ludH0gPSByZXF1aXJlICdhdG9tJ1xue2dldFZpbVN0YXRlLCBkaXNwYXRjaCwgVGV4dERhdGEsIGdldFZpZXd9ID0gcmVxdWlyZSAnLi9zcGVjLWhlbHBlcidcbnNldHRpbmdzID0gcmVxdWlyZSAnLi4vbGliL3NldHRpbmdzJ1xuXG5zZXRFZGl0b3JXaWR0aEluQ2hhcmFjdGVycyA9IChlZGl0b3IsIHdpZHRoSW5DaGFyYWN0ZXJzKSAtPlxuICBlZGl0b3Iuc2V0RGVmYXVsdENoYXJXaWR0aCgxKVxuICBjb21wb25lbnQgPSBlZGl0b3IuY29tcG9uZW50XG4gIGNvbXBvbmVudC5lbGVtZW50LnN0eWxlLndpZHRoID1cbiAgICBjb21wb25lbnQuZ2V0R3V0dGVyQ29udGFpbmVyV2lkdGgoKSArIHdpZHRoSW5DaGFyYWN0ZXJzICogY29tcG9uZW50Lm1lYXN1cmVtZW50cy5iYXNlQ2hhcmFjdGVyV2lkdGggKyBcInB4XCJcbiAgcmV0dXJuIGNvbXBvbmVudC5nZXROZXh0VXBkYXRlUHJvbWlzZSgpXG5cbmRlc2NyaWJlIFwiTW90aW9uIGdlbmVyYWxcIiwgLT5cbiAgW3NldCwgZW5zdXJlLCBrZXlzdHJva2UsIGVkaXRvciwgZWRpdG9yRWxlbWVudCwgdmltU3RhdGVdID0gW11cblxuICBiZWZvcmVFYWNoIC0+XG4gICAgZ2V0VmltU3RhdGUgKHN0YXRlLCBfdmltKSAtPlxuICAgICAgdmltU3RhdGUgPSBzdGF0ZSAjIHRvIHJlZmVyIGFzIHZpbVN0YXRlIGxhdGVyLlxuICAgICAge2VkaXRvciwgZWRpdG9yRWxlbWVudH0gPSB2aW1TdGF0ZVxuICAgICAge3NldCwgZW5zdXJlLCBrZXlzdHJva2V9ID0gX3ZpbVxuXG4gIGRlc2NyaWJlIFwic2ltcGxlIG1vdGlvbnNcIiwgLT5cbiAgICB0ZXh0ID0gbnVsbFxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHRleHQgPSBuZXcgVGV4dERhdGEgXCJcIlwiXG4gICAgICAgIDEyMzQ1XG4gICAgICAgIGFiY2RcbiAgICAgICAgQUJDREVcXG5cbiAgICAgICAgXCJcIlwiXG5cbiAgICAgIHNldFxuICAgICAgICB0ZXh0OiB0ZXh0LmdldFJhdygpXG4gICAgICAgIGN1cnNvcjogWzEsIDFdXG5cbiAgICBkZXNjcmliZSBcInRoZSBoIGtleWJpbmRpbmdcIiwgLT5cbiAgICAgIGRlc2NyaWJlIFwiYXMgYSBtb3Rpb25cIiwgLT5cbiAgICAgICAgaXQgXCJtb3ZlcyB0aGUgY3Vyc29yIGxlZnQsIGJ1dCBub3QgdG8gdGhlIHByZXZpb3VzIGxpbmVcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJ2gnLCBjdXJzb3I6IFsxLCAwXVxuICAgICAgICAgIGVuc3VyZSAnaCcsIGN1cnNvcjogWzEsIDBdXG5cbiAgICAgICAgaXQgXCJtb3ZlcyB0aGUgY3Vyc29yIHRvIHRoZSBwcmV2aW91cyBsaW5lIGlmIHdyYXBMZWZ0UmlnaHRNb3Rpb24gaXMgdHJ1ZVwiLCAtPlxuICAgICAgICAgIHNldHRpbmdzLnNldCgnd3JhcExlZnRSaWdodE1vdGlvbicsIHRydWUpXG4gICAgICAgICAgZW5zdXJlICdoIGgnLCBjdXJzb3I6IFswLCA0XVxuXG4gICAgICBkZXNjcmliZSBcImFzIGEgc2VsZWN0aW9uXCIsIC0+XG4gICAgICAgIGl0IFwic2VsZWN0cyB0aGUgY2hhcmFjdGVyIHRvIHRoZSBsZWZ0XCIsIC0+XG4gICAgICAgICAgZW5zdXJlICd5IGgnLFxuICAgICAgICAgICAgY3Vyc29yOiBbMSwgMF1cbiAgICAgICAgICAgIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiAnYSdcblxuICAgIGRlc2NyaWJlIFwidGhlIGoga2V5YmluZGluZ1wiLCAtPlxuICAgICAgaXQgXCJtb3ZlcyB0aGUgY3Vyc29yIGRvd24sIGJ1dCBub3QgdG8gdGhlIGVuZCBvZiB0aGUgbGFzdCBsaW5lXCIsIC0+XG4gICAgICAgIGVuc3VyZSAnaicsIGN1cnNvcjogWzIsIDFdXG4gICAgICAgIGVuc3VyZSAnaicsIGN1cnNvcjogWzIsIDFdXG5cbiAgICAgIGl0IFwibW92ZXMgdGhlIGN1cnNvciB0byB0aGUgZW5kIG9mIHRoZSBsaW5lLCBub3QgcGFzdCBpdFwiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMCwgNF1cbiAgICAgICAgZW5zdXJlICdqJywgY3Vyc29yOiBbMSwgM11cblxuICAgICAgaXQgXCJyZW1lbWJlcnMgdGhlIGNvbHVtbiBpdCB3YXMgaW4gYWZ0ZXIgbW92aW5nIHRvIHNob3J0ZXIgbGluZVwiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMCwgNF1cbiAgICAgICAgZW5zdXJlICdqJywgY3Vyc29yOiBbMSwgM11cbiAgICAgICAgZW5zdXJlICdqJywgY3Vyc29yOiBbMiwgNF1cblxuICAgICAgaXQgXCJuZXZlciBnbyBwYXN0IGxhc3QgbmV3bGluZVwiLCAtPlxuICAgICAgICBlbnN1cmUgJzEgMCBqJywgY3Vyc29yOiBbMiwgMV1cblxuICAgICAgZGVzY3JpYmUgXCJ3aGVuIHZpc3VhbCBtb2RlXCIsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBlbnN1cmUgJ3YnLCBjdXJzb3I6IFsxLCAyXSwgc2VsZWN0ZWRUZXh0OiAnYidcblxuICAgICAgICBpdCBcIm1vdmVzIHRoZSBjdXJzb3IgZG93blwiLCAtPlxuICAgICAgICAgIGVuc3VyZSAnaicsIGN1cnNvcjogWzIsIDJdLCBzZWxlY3RlZFRleHQ6IFwiYmNkXFxuQUJcIlxuXG4gICAgICAgIGl0IFwiZG9lc24ndCBnbyBvdmVyIGFmdGVyIHRoZSBsYXN0IGxpbmVcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJ2onLCBjdXJzb3I6IFsyLCAyXSwgc2VsZWN0ZWRUZXh0OiBcImJjZFxcbkFCXCJcblxuICAgICAgICBpdCBcImtlZXAgc2FtZSBjb2x1bW4oZ29hbENvbHVtbikgZXZlbiBhZnRlciBhY3Jvc3MgdGhlIGVtcHR5IGxpbmVcIiwgLT5cbiAgICAgICAgICBrZXlzdHJva2UgJ2VzY2FwZSdcbiAgICAgICAgICBzZXRcbiAgICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgICBhYmNkZWZnXG5cbiAgICAgICAgICAgICAgYWJjZGVmZ1xuICAgICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgIGN1cnNvcjogWzAsIDNdXG4gICAgICAgICAgZW5zdXJlICd2JywgY3Vyc29yOiBbMCwgNF1cbiAgICAgICAgICBlbnN1cmUgJ2ogaicsIGN1cnNvcjogWzIsIDRdLCBzZWxlY3RlZFRleHQ6IFwiZGVmZ1xcblxcbmFiY2RcIlxuXG4gICAgICAgICMgW0ZJWE1FXSB0aGUgcGxhY2Ugb2YgdGhpcyBzcGVjIGlzIG5vdCBhcHByb3ByaWF0ZS5cbiAgICAgICAgaXQgXCJvcmlnaW5hbCB2aXN1YWwgbGluZSByZW1haW5zIHdoZW4gamsgYWNyb3NzIG9yaWduYWwgc2VsZWN0aW9uXCIsIC0+XG4gICAgICAgICAgdGV4dCA9IG5ldyBUZXh0RGF0YSBcIlwiXCJcbiAgICAgICAgICAgIGxpbmUwXG4gICAgICAgICAgICBsaW5lMVxuICAgICAgICAgICAgbGluZTJcXG5cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIHNldFxuICAgICAgICAgICAgdGV4dDogdGV4dC5nZXRSYXcoKVxuICAgICAgICAgICAgY3Vyc29yOiBbMSwgMV1cblxuICAgICAgICAgIGVuc3VyZSAnVicsIHNlbGVjdGVkVGV4dDogdGV4dC5nZXRMaW5lcyhbMV0pXG4gICAgICAgICAgZW5zdXJlICdqJywgc2VsZWN0ZWRUZXh0OiB0ZXh0LmdldExpbmVzKFsxLCAyXSlcbiAgICAgICAgICBlbnN1cmUgJ2snLCBzZWxlY3RlZFRleHQ6IHRleHQuZ2V0TGluZXMoWzFdKVxuICAgICAgICAgIGVuc3VyZSAnaycsIHNlbGVjdGVkVGV4dDogdGV4dC5nZXRMaW5lcyhbMCwgMV0pXG4gICAgICAgICAgZW5zdXJlICdqJywgc2VsZWN0ZWRUZXh0OiB0ZXh0LmdldExpbmVzKFsxXSlcbiAgICAgICAgICBlbnN1cmUgJ2onLCBzZWxlY3RlZFRleHQ6IHRleHQuZ2V0TGluZXMoWzEsIDJdKVxuXG4gICAgZGVzY3JpYmUgXCJtb3ZlLWRvd24td3JhcCwgbW92ZS11cC13cmFwXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIGF0b20ua2V5bWFwcy5hZGQgXCJ0ZXN0XCIsXG4gICAgICAgICAgJ2F0b20tdGV4dC1lZGl0b3IudmltLW1vZGUtcGx1czpub3QoLmluc2VydC1tb2RlKSc6XG4gICAgICAgICAgICAnayc6ICd2aW0tbW9kZS1wbHVzOm1vdmUtdXAtd3JhcCdcbiAgICAgICAgICAgICdqJzogJ3ZpbS1tb2RlLXBsdXM6bW92ZS1kb3duLXdyYXAnXG5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgaGVsbG9cbiAgICAgICAgICBoZWxsb1xuICAgICAgICAgIGhlbGxvXG4gICAgICAgICAgaGVsbG9cXG5cbiAgICAgICAgICBcIlwiXCJcbiAgICAgIGRlc2NyaWJlICdtb3ZlLWRvd24td3JhcCcsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMywgMV1cbiAgICAgICAgaXQgXCJtb3ZlIGRvd24gd2l0aCB3cmF3cFwiLCAtPiBlbnN1cmUgJ2onLCBjdXJzb3I6IFswLCAxXVxuICAgICAgICBpdCBcIm1vdmUgZG93biB3aXRoIHdyYXdwXCIsIC0+IGVuc3VyZSAnMiBqJywgY3Vyc29yOiBbMSwgMV1cbiAgICAgICAgaXQgXCJtb3ZlIGRvd24gd2l0aCB3cmF3cFwiLCAtPiBlbnN1cmUgJzQgaicsIGN1cnNvcjogWzMsIDFdXG5cbiAgICAgIGRlc2NyaWJlICdtb3ZlLXVwLXdyYXAnLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzAsIDFdXG5cbiAgICAgICAgaXQgXCJtb3ZlIGRvd24gd2l0aCB3cmF3cFwiLCAtPiBlbnN1cmUgJ2snLCBjdXJzb3I6IFszLCAxXVxuICAgICAgICBpdCBcIm1vdmUgZG93biB3aXRoIHdyYXdwXCIsIC0+IGVuc3VyZSAnMiBrJywgY3Vyc29yOiBbMiwgMV1cbiAgICAgICAgaXQgXCJtb3ZlIGRvd24gd2l0aCB3cmF3cFwiLCAtPiBlbnN1cmUgJzQgaycsIGN1cnNvcjogWzAsIDFdXG5cblxuICAgICMgW05PVEVdIFNlZSAjNTYwXG4gICAgIyBUaGlzIHNwZWMgaXMgaW50ZW5kZWQgdG8gYmUgdXNlZCBpbiBsb2NhbCB0ZXN0LCBub3QgYXQgQ0kgc2VydmljZS5cbiAgICAjIFNhZmUgdG8gZXhlY3V0ZSBpZiBpdCBwYXNzZXMsIGJ1dCBmcmVlemUgZWRpdG9yIHdoZW4gaXQgZmFpbC5cbiAgICAjIFNvIGV4cGxpY2l0bHkgZGlzYWJsZWQgYmVjYXVzZSBJIGRvbid0IHdhbnQgYmUgYmFubmVkIGJ5IENJIHNlcnZpY2UuXG4gICAgIyBFbmFibGUgdGhpcyBvbiBkZW1tYW5kIHdoZW4gZnJlZXppbmcgaGFwcGVucyBhZ2FpbiFcbiAgICB4ZGVzY3JpYmUgXCJ3aXRoIGJpZyBjb3VudCB3YXMgZ2l2ZW5cIiwgLT5cbiAgICAgIEJJR19OVU1CRVIgPSBOdW1iZXIuTUFYX1NBRkVfSU5URUdFUlxuICAgICAgZW5zdXJlQmlnQ291bnRNb3Rpb24gPSAoa2V5c3Ryb2tlcywgb3B0aW9ucykgLT5cbiAgICAgICAgY291bnQgPSBTdHJpbmcoQklHX05VTUJFUikuc3BsaXQoJycpLmpvaW4oJyAnKVxuICAgICAgICBrZXlzdHJva2VzID0ga2V5c3Ryb2tlcy5zcGxpdCgnJykuam9pbignICcpXG4gICAgICAgIGVuc3VyZShcIiN7Y291bnR9ICN7a2V5c3Ryb2tlc31cIiwgb3B0aW9ucylcblxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBhdG9tLmtleW1hcHMuYWRkIFwidGVzdFwiLFxuICAgICAgICAgICdhdG9tLXRleHQtZWRpdG9yLnZpbS1tb2RlLXBsdXM6bm90KC5pbnNlcnQtbW9kZSknOlxuICAgICAgICAgICAgJ2cgeyc6ICd2aW0tbW9kZS1wbHVzOm1vdmUtdG8tcHJldmlvdXMtZm9sZC1zdGFydCdcbiAgICAgICAgICAgICdnIH0nOiAndmltLW1vZGUtcGx1czptb3ZlLXRvLW5leHQtZm9sZC1zdGFydCdcbiAgICAgICAgICAgICcsIE4nOiAndmltLW1vZGUtcGx1czptb3ZlLXRvLXByZXZpb3VzLW51bWJlcidcbiAgICAgICAgICAgICcsIG4nOiAndmltLW1vZGUtcGx1czptb3ZlLXRvLW5leHQtbnVtYmVyJ1xuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAwMDAwXG4gICAgICAgICAgMTExMVxuICAgICAgICAgIDIyMjJcXG5cbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICBjdXJzb3I6IFsxLCAyXVxuXG4gICAgICBpdCBcImJ5IGBqYFwiLCAtPiBlbnN1cmVCaWdDb3VudE1vdGlvbiAnaicsIGN1cnNvcjogWzIsIDJdXG4gICAgICBpdCBcImJ5IGBrYFwiLCAtPiBlbnN1cmVCaWdDb3VudE1vdGlvbiAnaycsIGN1cnNvcjogWzAsIDJdXG4gICAgICBpdCBcImJ5IGBoYFwiLCAtPiBlbnN1cmVCaWdDb3VudE1vdGlvbiAnaCcsIGN1cnNvcjogWzEsIDBdXG4gICAgICBpdCBcImJ5IGBsYFwiLCAtPiBlbnN1cmVCaWdDb3VudE1vdGlvbiAnbCcsIGN1cnNvcjogWzEsIDNdXG4gICAgICBpdCBcImJ5IGBbYFwiLCAtPiBlbnN1cmVCaWdDb3VudE1vdGlvbiAnWycsIGN1cnNvcjogWzAsIDJdXG4gICAgICBpdCBcImJ5IGBdYFwiLCAtPiBlbnN1cmVCaWdDb3VudE1vdGlvbiAnXScsIGN1cnNvcjogWzIsIDJdXG4gICAgICBpdCBcImJ5IGB3YFwiLCAtPiBlbnN1cmVCaWdDb3VudE1vdGlvbiAndycsIGN1cnNvcjogWzIsIDNdXG4gICAgICBpdCBcImJ5IGBXYFwiLCAtPiBlbnN1cmVCaWdDb3VudE1vdGlvbiAnVycsIGN1cnNvcjogWzIsIDNdXG4gICAgICBpdCBcImJ5IGBiYFwiLCAtPiBlbnN1cmVCaWdDb3VudE1vdGlvbiAnYicsIGN1cnNvcjogWzAsIDBdXG4gICAgICBpdCBcImJ5IGBCYFwiLCAtPiBlbnN1cmVCaWdDb3VudE1vdGlvbiAnQicsIGN1cnNvcjogWzAsIDBdXG4gICAgICBpdCBcImJ5IGBlYFwiLCAtPiBlbnN1cmVCaWdDb3VudE1vdGlvbiAnZScsIGN1cnNvcjogWzIsIDNdXG4gICAgICBpdCBcImJ5IGAoYFwiLCAtPiBlbnN1cmVCaWdDb3VudE1vdGlvbiAnKCcsIGN1cnNvcjogWzAsIDBdXG4gICAgICBpdCBcImJ5IGApYFwiLCAtPiBlbnN1cmVCaWdDb3VudE1vdGlvbiAnKScsIGN1cnNvcjogWzIsIDNdXG4gICAgICBpdCBcImJ5IGB7YFwiLCAtPiBlbnN1cmVCaWdDb3VudE1vdGlvbiAneycsIGN1cnNvcjogWzAsIDBdXG4gICAgICBpdCBcImJ5IGB9YFwiLCAtPiBlbnN1cmVCaWdDb3VudE1vdGlvbiAnfScsIGN1cnNvcjogWzIsIDNdXG4gICAgICBpdCBcImJ5IGAtYFwiLCAtPiBlbnN1cmVCaWdDb3VudE1vdGlvbiAnLScsIGN1cnNvcjogWzAsIDBdXG4gICAgICBpdCBcImJ5IGBfYFwiLCAtPiBlbnN1cmVCaWdDb3VudE1vdGlvbiAnXycsIGN1cnNvcjogWzIsIDBdXG4gICAgICBpdCBcImJ5IGBnIHtgXCIsIC0+IGVuc3VyZUJpZ0NvdW50TW90aW9uICdnIHsnLCBjdXJzb3I6IFsxLCAyXSAjIE5vIGZvbGQgbm8gbW92ZSBidXQgd29uJ3QgZnJlZXplLlxuICAgICAgaXQgXCJieSBgZyB9YFwiLCAtPiBlbnN1cmVCaWdDb3VudE1vdGlvbiAnZyB9JywgY3Vyc29yOiBbMSwgMl0gIyBObyBmb2xkIG5vIG1vdmUgYnV0IHdvbid0IGZyZWV6ZS5cbiAgICAgIGl0IFwiYnkgYCwgTmBcIiwgLT4gZW5zdXJlQmlnQ291bnRNb3Rpb24gJywgTicsIGN1cnNvcjogWzEsIDJdICMgTm8gZ3JhbW1hciwgbm8gbW92ZSBidXQgd29uJ3QgZnJlZXplLlxuICAgICAgaXQgXCJieSBgLCBuYFwiLCAtPiBlbnN1cmVCaWdDb3VudE1vdGlvbiAnLCBuJywgY3Vyc29yOiBbMSwgMl0gIyBObyBncmFtbWFyLCBubyBtb3ZlIGJ1dCB3b24ndCBmcmVlemUuXG5cbiAgICBkZXNjcmliZSBcInRoZSBrIGtleWJpbmRpbmdcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzIsIDFdXG5cbiAgICAgIGl0IFwibW92ZXMgdGhlIGN1cnNvciB1cFwiLCAtPlxuICAgICAgICBlbnN1cmUgJ2snLCBjdXJzb3I6IFsxLCAxXVxuXG4gICAgICBpdCBcIm1vdmVzIHRoZSBjdXJzb3IgdXAgYW5kIHJlbWVtYmVyIGNvbHVtbiBpdCB3YXMgaW5cIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzIsIDRdXG4gICAgICAgIGVuc3VyZSAnaycsIGN1cnNvcjogWzEsIDNdXG4gICAgICAgIGVuc3VyZSAnaycsIGN1cnNvcjogWzAsIDRdXG5cbiAgICAgIGl0IFwibW92ZXMgdGhlIGN1cnNvciB1cCwgYnV0IG5vdCB0byB0aGUgYmVnaW5uaW5nIG9mIHRoZSBmaXJzdCBsaW5lXCIsIC0+XG4gICAgICAgIGVuc3VyZSAnMSAwIGsnLCBjdXJzb3I6IFswLCAxXVxuXG4gICAgICBkZXNjcmliZSBcIndoZW4gdmlzdWFsIG1vZGVcIiwgLT5cbiAgICAgICAgaXQgXCJrZWVwIHNhbWUgY29sdW1uKGdvYWxDb2x1bW4pIGV2ZW4gYWZ0ZXIgYWNyb3NzIHRoZSBlbXB0eSBsaW5lXCIsIC0+XG4gICAgICAgICAgc2V0XG4gICAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgICAgYWJjZGVmZ1xuXG4gICAgICAgICAgICAgIGFiY2RlZmdcbiAgICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICBjdXJzb3I6IFsyLCAzXVxuICAgICAgICAgIGVuc3VyZSAndicsIGN1cnNvcjogWzIsIDRdLCBzZWxlY3RlZFRleHQ6ICdkJ1xuICAgICAgICAgIGVuc3VyZSAnayBrJywgY3Vyc29yOiBbMCwgM10sIHNlbGVjdGVkVGV4dDogXCJkZWZnXFxuXFxuYWJjZFwiXG5cbiAgICBkZXNjcmliZSBcImdqIGdrIGluIHNvZnR3cmFwXCIsIC0+XG4gICAgICBbdGV4dF0gPSBbXVxuXG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIGVkaXRvci5zZXRTb2Z0V3JhcHBlZCh0cnVlKVxuICAgICAgICBlZGl0b3Iuc2V0RWRpdG9yV2lkdGhJbkNoYXJzKDEwKVxuICAgICAgICBlZGl0b3Iuc2V0RGVmYXVsdENoYXJXaWR0aCgxKVxuICAgICAgICB0ZXh0ID0gbmV3IFRleHREYXRhIFwiXCJcIlxuICAgICAgICAgIDFzdCBsaW5lIG9mIGJ1ZmZlclxuICAgICAgICAgIDJuZCBsaW5lIG9mIGJ1ZmZlciwgVmVyeSBsb25nIGxpbmVcbiAgICAgICAgICAzcmQgbGluZSBvZiBidWZmZXJcblxuICAgICAgICAgIDV0aCBsaW5lIG9mIGJ1ZmZlclxcblxuICAgICAgICAgIFwiXCJcIlxuICAgICAgICBzZXQgdGV4dDogdGV4dC5nZXRSYXcoKSwgY3Vyc29yOiBbMCwgMF1cblxuICAgICAgZGVzY3JpYmUgXCJzZWxlY3Rpb24gaXMgbm90IHJldmVyc2VkXCIsIC0+XG4gICAgICAgIGl0IFwic2NyZWVuIHBvc2l0aW9uIGFuZCBidWZmZXIgcG9zaXRpb24gaXMgZGlmZmVyZW50XCIsIC0+XG4gICAgICAgICAgZW5zdXJlICdnIGonLCBjdXJzb3JTY3JlZW46IFsxLCAwXSwgY3Vyc29yOiBbMCwgOV1cbiAgICAgICAgICBlbnN1cmUgJ2cgaicsIGN1cnNvclNjcmVlbjogWzIsIDBdLCBjdXJzb3I6IFsxLCAwXVxuICAgICAgICAgIGVuc3VyZSAnZyBqJywgY3Vyc29yU2NyZWVuOiBbMywgMF0sIGN1cnNvcjogWzEsIDldXG4gICAgICAgICAgZW5zdXJlICdnIGonLCBjdXJzb3JTY3JlZW46IFs0LCAwXSwgY3Vyc29yOiBbMSwgMTJdXG5cbiAgICAgICAgaXQgXCJqayBtb3ZlIHNlbGVjdGlvbiBidWZmZXItbGluZSB3aXNlXCIsIC0+XG4gICAgICAgICAgZW5zdXJlICdWJywgc2VsZWN0ZWRUZXh0OiB0ZXh0LmdldExpbmVzKFswLi4wXSlcbiAgICAgICAgICBlbnN1cmUgJ2onLCBzZWxlY3RlZFRleHQ6IHRleHQuZ2V0TGluZXMoWzAuLjFdKVxuICAgICAgICAgIGVuc3VyZSAnaicsIHNlbGVjdGVkVGV4dDogdGV4dC5nZXRMaW5lcyhbMC4uMl0pXG4gICAgICAgICAgZW5zdXJlICdqJywgc2VsZWN0ZWRUZXh0OiB0ZXh0LmdldExpbmVzKFswLi4zXSlcbiAgICAgICAgICBlbnN1cmUgJ2onLCBzZWxlY3RlZFRleHQ6IHRleHQuZ2V0TGluZXMoWzAuLjRdKVxuICAgICAgICAgIGVuc3VyZSAnaycsIHNlbGVjdGVkVGV4dDogdGV4dC5nZXRMaW5lcyhbMC4uM10pXG4gICAgICAgICAgZW5zdXJlICdrJywgc2VsZWN0ZWRUZXh0OiB0ZXh0LmdldExpbmVzKFswLi4yXSlcbiAgICAgICAgICBlbnN1cmUgJ2snLCBzZWxlY3RlZFRleHQ6IHRleHQuZ2V0TGluZXMoWzAuLjFdKVxuICAgICAgICAgIGVuc3VyZSAnaycsIHNlbGVjdGVkVGV4dDogdGV4dC5nZXRMaW5lcyhbMC4uMF0pXG4gICAgICAgICAgZW5zdXJlICdrJywgc2VsZWN0ZWRUZXh0OiB0ZXh0LmdldExpbmVzKFswLi4wXSkgIyBkbyBub3RoaW5nXG5cbiAgICAgIGRlc2NyaWJlIFwic2VsZWN0aW9uIGlzIHJldmVyc2VkXCIsIC0+XG4gICAgICAgIGl0IFwic2NyZWVuIHBvc2l0aW9uIGFuZCBidWZmZXIgcG9zaXRpb24gaXMgZGlmZmVyZW50XCIsIC0+XG4gICAgICAgICAgZW5zdXJlICdnIGonLCBjdXJzb3JTY3JlZW46IFsxLCAwXSwgY3Vyc29yOiBbMCwgOV1cbiAgICAgICAgICBlbnN1cmUgJ2cgaicsIGN1cnNvclNjcmVlbjogWzIsIDBdLCBjdXJzb3I6IFsxLCAwXVxuICAgICAgICAgIGVuc3VyZSAnZyBqJywgY3Vyc29yU2NyZWVuOiBbMywgMF0sIGN1cnNvcjogWzEsIDldXG4gICAgICAgICAgZW5zdXJlICdnIGonLCBjdXJzb3JTY3JlZW46IFs0LCAwXSwgY3Vyc29yOiBbMSwgMTJdXG5cbiAgICAgICAgaXQgXCJqayBtb3ZlIHNlbGVjdGlvbiBidWZmZXItbGluZSB3aXNlXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzQsIDBdXG4gICAgICAgICAgZW5zdXJlICdWJywgc2VsZWN0ZWRUZXh0OiB0ZXh0LmdldExpbmVzKFs0Li40XSlcbiAgICAgICAgICBlbnN1cmUgJ2snLCBzZWxlY3RlZFRleHQ6IHRleHQuZ2V0TGluZXMoWzMuLjRdKVxuICAgICAgICAgIGVuc3VyZSAnaycsIHNlbGVjdGVkVGV4dDogdGV4dC5nZXRMaW5lcyhbMi4uNF0pXG4gICAgICAgICAgZW5zdXJlICdrJywgc2VsZWN0ZWRUZXh0OiB0ZXh0LmdldExpbmVzKFsxLi40XSlcbiAgICAgICAgICBlbnN1cmUgJ2snLCBzZWxlY3RlZFRleHQ6IHRleHQuZ2V0TGluZXMoWzAuLjRdKVxuICAgICAgICAgIGVuc3VyZSAnaicsIHNlbGVjdGVkVGV4dDogdGV4dC5nZXRMaW5lcyhbMS4uNF0pXG4gICAgICAgICAgZW5zdXJlICdqJywgc2VsZWN0ZWRUZXh0OiB0ZXh0LmdldExpbmVzKFsyLi40XSlcbiAgICAgICAgICBlbnN1cmUgJ2onLCBzZWxlY3RlZFRleHQ6IHRleHQuZ2V0TGluZXMoWzMuLjRdKVxuICAgICAgICAgIGVuc3VyZSAnaicsIHNlbGVjdGVkVGV4dDogdGV4dC5nZXRMaW5lcyhbNC4uNF0pXG4gICAgICAgICAgZW5zdXJlICdqJywgc2VsZWN0ZWRUZXh0OiB0ZXh0LmdldExpbmVzKFs0Li40XSkgIyBkbyBub3RoaW5nXG5cbiAgICBkZXNjcmliZSBcInRoZSBsIGtleWJpbmRpbmdcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzEsIDJdXG5cbiAgICAgIGl0IFwibW92ZXMgdGhlIGN1cnNvciByaWdodCwgYnV0IG5vdCB0byB0aGUgbmV4dCBsaW5lXCIsIC0+XG4gICAgICAgIGVuc3VyZSAnbCcsIGN1cnNvcjogWzEsIDNdXG4gICAgICAgIGVuc3VyZSAnbCcsIGN1cnNvcjogWzEsIDNdXG5cbiAgICAgIGl0IFwibW92ZXMgdGhlIGN1cnNvciB0byB0aGUgbmV4dCBsaW5lIGlmIHdyYXBMZWZ0UmlnaHRNb3Rpb24gaXMgdHJ1ZVwiLCAtPlxuICAgICAgICBzZXR0aW5ncy5zZXQoJ3dyYXBMZWZ0UmlnaHRNb3Rpb24nLCB0cnVlKVxuICAgICAgICBlbnN1cmUgJ2wgbCcsIGN1cnNvcjogWzIsIDBdXG5cbiAgICAgIGRlc2NyaWJlIFwib24gYSBibGFuayBsaW5lXCIsIC0+XG4gICAgICAgIGl0IFwiZG9lc24ndCBtb3ZlIHRoZSBjdXJzb3JcIiwgLT5cbiAgICAgICAgICBzZXQgdGV4dDogXCJcXG5cXG5cXG5cIiwgY3Vyc29yOiBbMSwgMF1cbiAgICAgICAgICBlbnN1cmUgJ2wnLCBjdXJzb3I6IFsxLCAwXVxuXG4gICAgZGVzY3JpYmUgXCJtb3ZlLSh1cC9kb3duKS10by1lZGdlXCIsIC0+XG4gICAgICB0ZXh0ID0gbnVsbFxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICB0ZXh0ID0gbmV3IFRleHREYXRhIFwiXCJcIlxuICAgICAgICAgIDA6ICA0IDY3ICAwMTIzNDU2Nzg5MDEyMzQ1Njc4OVxuICAgICAgICAgIDE6ICAgICAgICAgMTIzNDU2Nzg5MDEyMzQ1Njc4OVxuICAgICAgICAgIDI6ICAgIDYgODkwICAgICAgICAgMDEyMzQ1Njc4OVxuICAgICAgICAgIDM6ICAgIDYgODkwICAgICAgICAgMDEyMzQ1Njc4OVxuICAgICAgICAgIDQ6ICAgNTYgODkwICAgICAgICAgMDEyMzQ1Njc4OVxuICAgICAgICAgIDU6ICAgICAgICAgICAgICAgICAgMDEyMzQ1Njc4OVxuICAgICAgICAgIDY6ICAgICAgICAgICAgICAgICAgMDEyMzQ1Njc4OVxuICAgICAgICAgIDc6ICA0IDY3ICAgICAgICAgICAgMDEyMzQ1Njc4OVxcblxuICAgICAgICAgIFwiXCJcIlxuICAgICAgICBzZXQgdGV4dDogdGV4dC5nZXRSYXcoKSwgY3Vyc29yOiBbNCwgM11cblxuICAgICAgZGVzY3JpYmUgXCJlZGdlbmVzcyBvZiBmaXJzdC1saW5lIGFuZCBsYXN0LWxpbmVcIiwgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIHNldFxuICAgICAgICAgICAgdGV4dF86IFwiXCJcIlxuICAgICAgICAgICAgX19fX3RoaXMgaXMgbGluZSAwXG4gICAgICAgICAgICBfX19fdGhpcyBpcyB0ZXh0IG9mIGxpbmUgMVxuICAgICAgICAgICAgX19fX3RoaXMgaXMgdGV4dCBvZiBsaW5lIDJcbiAgICAgICAgICAgIF9fX19fX2hlbGxvIGxpbmUgM1xuICAgICAgICAgICAgX19fX19faGVsbG8gbGluZSA0XG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgIGN1cnNvcjogWzIsIDJdXG5cbiAgICAgICAgZGVzY3JpYmUgXCJ3aGVuIGNvbHVtbiBpcyBsZWFkaW5nIHNwYWNlc1wiLCAtPlxuICAgICAgICAgIGl0IFwiZG9lc24ndCBtb3ZlIGN1cnNvclwiLCAtPlxuICAgICAgICAgICAgZW5zdXJlICdbJywgY3Vyc29yOiBbMiwgMl1cbiAgICAgICAgICAgIGVuc3VyZSAnXScsIGN1cnNvcjogWzIsIDJdXG5cbiAgICAgICAgZGVzY3JpYmUgXCJ3aGVuIGNvbHVtbiBpcyB0cmFpbGluZyBzcGFjZXNcIiwgLT5cbiAgICAgICAgICBpdCBcImRvZXNuJ3QgbW92ZSBjdXJzb3JcIiwgLT5cbiAgICAgICAgICAgIHNldCBjdXJzb3I6IFsxLCAyMF1cbiAgICAgICAgICAgIGVuc3VyZSAnXScsIGN1cnNvcjogWzIsIDIwXVxuICAgICAgICAgICAgZW5zdXJlICddJywgY3Vyc29yOiBbMiwgMjBdXG4gICAgICAgICAgICBlbnN1cmUgJ1snLCBjdXJzb3I6IFsxLCAyMF1cbiAgICAgICAgICAgIGVuc3VyZSAnWycsIGN1cnNvcjogWzEsIDIwXVxuXG4gICAgICBpdCBcIm1vdmUgdG8gbm9uLWJsYW5rLWNoYXIgb24gYm90aCBmaXJzdCBhbmQgbGFzdCByb3dcIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzQsIDRdXG4gICAgICAgIGVuc3VyZSAnWycsIGN1cnNvcjogWzAsIDRdXG4gICAgICAgIGVuc3VyZSAnXScsIGN1cnNvcjogWzcsIDRdXG4gICAgICBpdCBcIm1vdmUgdG8gd2hpdGUgc3BhY2UgY2hhciB3aGVuIGJvdGggc2lkZSBjb2x1bW4gaXMgbm9uLWJsYW5rIGNoYXJcIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzQsIDVdXG4gICAgICAgIGVuc3VyZSAnWycsIGN1cnNvcjogWzAsIDVdXG4gICAgICAgIGVuc3VyZSAnXScsIGN1cnNvcjogWzQsIDVdXG4gICAgICAgIGVuc3VyZSAnXScsIGN1cnNvcjogWzcsIDVdXG4gICAgICBpdCBcIm9ubHkgc3RvcHMgb24gcm93IG9uZSBvZiBbZmlyc3Qgcm93LCBsYXN0IHJvdywgdXAtb3ItZG93bi1yb3cgaXMgYmxhbmtdIGNhc2UtMVwiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbNCwgNl1cbiAgICAgICAgZW5zdXJlICdbJywgY3Vyc29yOiBbMiwgNl1cbiAgICAgICAgZW5zdXJlICdbJywgY3Vyc29yOiBbMCwgNl1cbiAgICAgICAgZW5zdXJlICddJywgY3Vyc29yOiBbMiwgNl1cbiAgICAgICAgZW5zdXJlICddJywgY3Vyc29yOiBbNCwgNl1cbiAgICAgICAgZW5zdXJlICddJywgY3Vyc29yOiBbNywgNl1cbiAgICAgIGl0IFwib25seSBzdG9wcyBvbiByb3cgb25lIG9mIFtmaXJzdCByb3csIGxhc3Qgcm93LCB1cC1vci1kb3duLXJvdyBpcyBibGFua10gY2FzZS0yXCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFs0LCA3XVxuICAgICAgICBlbnN1cmUgJ1snLCBjdXJzb3I6IFsyLCA3XVxuICAgICAgICBlbnN1cmUgJ1snLCBjdXJzb3I6IFswLCA3XVxuICAgICAgICBlbnN1cmUgJ10nLCBjdXJzb3I6IFsyLCA3XVxuICAgICAgICBlbnN1cmUgJ10nLCBjdXJzb3I6IFs0LCA3XVxuICAgICAgICBlbnN1cmUgJ10nLCBjdXJzb3I6IFs3LCA3XVxuICAgICAgaXQgXCJzdXBwb3J0IGNvdW50XCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFs0LCA2XVxuICAgICAgICBlbnN1cmUgJzIgWycsIGN1cnNvcjogWzAsIDZdXG4gICAgICAgIGVuc3VyZSAnMyBdJywgY3Vyc29yOiBbNywgNl1cblxuICAgICAgZGVzY3JpYmUgJ2VkaXRvciBmb3IgaGFyZFRhYicsIC0+XG4gICAgICAgIHBhY2sgPSAnbGFuZ3VhZ2UtZ28nXG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAgICAgICAgIGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKHBhY2spXG5cbiAgICAgICAgICBnZXRWaW1TdGF0ZSAnc2FtcGxlLmdvJywgKHN0YXRlLCB2aW1FZGl0b3IpIC0+XG4gICAgICAgICAgICB7ZWRpdG9yLCBlZGl0b3JFbGVtZW50fSA9IHN0YXRlXG4gICAgICAgICAgICB7c2V0LCBlbnN1cmUsIGtleXN0cm9rZX0gPSB2aW1FZGl0b3JcblxuICAgICAgICAgIHJ1bnMgLT5cbiAgICAgICAgICAgIHNldCBjdXJzb3JTY3JlZW46IFs4LCAyXVxuICAgICAgICAgICAgIyBJbiBoYXJkVGFiIGluZGVudCBidWZmZXJQb3NpdGlvbiBpcyBub3Qgc2FtZSBhcyBzY3JlZW5Qb3NpdGlvblxuICAgICAgICAgICAgZW5zdXJlIGN1cnNvcjogWzgsIDFdXG5cbiAgICAgICAgYWZ0ZXJFYWNoIC0+XG4gICAgICAgICAgYXRvbS5wYWNrYWdlcy5kZWFjdGl2YXRlUGFja2FnZShwYWNrKVxuXG4gICAgICAgIGl0IFwibW92ZSB1cC9kb3duIHRvIG5leHQgZWRnZSBvZiBzYW1lICpzY3JlZW4qIGNvbHVtblwiLCAtPlxuICAgICAgICAgIGVuc3VyZSAnWycsIGN1cnNvclNjcmVlbjogWzUsIDJdXG4gICAgICAgICAgZW5zdXJlICdbJywgY3Vyc29yU2NyZWVuOiBbMywgMl1cbiAgICAgICAgICBlbnN1cmUgJ1snLCBjdXJzb3JTY3JlZW46IFsyLCAyXVxuICAgICAgICAgIGVuc3VyZSAnWycsIGN1cnNvclNjcmVlbjogWzAsIDJdXG5cbiAgICAgICAgICBlbnN1cmUgJ10nLCBjdXJzb3JTY3JlZW46IFsyLCAyXVxuICAgICAgICAgIGVuc3VyZSAnXScsIGN1cnNvclNjcmVlbjogWzMsIDJdXG4gICAgICAgICAgZW5zdXJlICddJywgY3Vyc29yU2NyZWVuOiBbNSwgMl1cbiAgICAgICAgICBlbnN1cmUgJ10nLCBjdXJzb3JTY3JlZW46IFs5LCAyXVxuICAgICAgICAgIGVuc3VyZSAnXScsIGN1cnNvclNjcmVlbjogWzExLCAyXVxuICAgICAgICAgIGVuc3VyZSAnXScsIGN1cnNvclNjcmVlbjogWzE0LCAyXVxuICAgICAgICAgIGVuc3VyZSAnXScsIGN1cnNvclNjcmVlbjogWzE3LCAyXVxuXG4gICAgICAgICAgZW5zdXJlICdbJywgY3Vyc29yU2NyZWVuOiBbMTQsIDJdXG4gICAgICAgICAgZW5zdXJlICdbJywgY3Vyc29yU2NyZWVuOiBbMTEsIDJdXG4gICAgICAgICAgZW5zdXJlICdbJywgY3Vyc29yU2NyZWVuOiBbOSwgMl1cbiAgICAgICAgICBlbnN1cmUgJ1snLCBjdXJzb3JTY3JlZW46IFs1LCAyXVxuICAgICAgICAgIGVuc3VyZSAnWycsIGN1cnNvclNjcmVlbjogWzMsIDJdXG4gICAgICAgICAgZW5zdXJlICdbJywgY3Vyc29yU2NyZWVuOiBbMiwgMl1cbiAgICAgICAgICBlbnN1cmUgJ1snLCBjdXJzb3JTY3JlZW46IFswLCAyXVxuXG4gIGRlc2NyaWJlICdtb3ZlU3VjY2Vzc09uTGluZXdpc2UgYmVoYXZpcmFsIGNoYXJhY3RlcmlzdGljJywgLT5cbiAgICBvcmlnaW5hbFRleHQgPSBudWxsXG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2V0dGluZ3Muc2V0KCd1c2VDbGlwYm9hcmRBc0RlZmF1bHRSZWdpc3RlcicsIGZhbHNlKVxuICAgICAgc2V0XG4gICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgIDAwMFxuICAgICAgICAgIDExMVxuICAgICAgICAgIDIyMlxcblxuICAgICAgICAgIFwiXCJcIlxuICAgICAgb3JpZ2luYWxUZXh0ID0gZWRpdG9yLmdldFRleHQoKVxuICAgICAgZW5zdXJlIHJlZ2lzdGVyOiB7J1wiJzogdGV4dDogdW5kZWZpbmVkfVxuXG4gICAgZGVzY3JpYmUgXCJtb3ZlU3VjY2Vzc09uTGluZXdpc2U9ZmFsc2UgbW90aW9uXCIsIC0+XG4gICAgICBkZXNjcmliZSBcIndoZW4gaXQgY2FuIG1vdmVcIiwgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPiBzZXQgY3Vyc29yOiBbMSwgMF1cbiAgICAgICAgaXQgXCJkZWxldGUgYnkgalwiLCAtPiBlbnN1cmUgXCJkIGpcIiwgdGV4dDogXCIwMDBcXG5cIiwgbW9kZTogJ25vcm1hbCdcbiAgICAgICAgaXQgXCJ5YW5rIGJ5IGpcIiwgLT4gZW5zdXJlIFwieSBqXCIsIHRleHQ6IG9yaWdpbmFsVGV4dCwgcmVnaXN0ZXI6IHsnXCInOiB0ZXh0OiBcIjExMVxcbjIyMlxcblwifSwgbW9kZTogJ25vcm1hbCdcbiAgICAgICAgaXQgXCJjaGFuZ2UgYnkgalwiLCAtPiBlbnN1cmUgXCJjIGpcIiwgdGV4dEM6IFwiMDAwXFxufFxcblwiLCByZWdpc3RlcjogeydcIic6IHRleHQ6IFwiMTExXFxuMjIyXFxuXCJ9LCBtb2RlOiAnaW5zZXJ0J1xuXG4gICAgICAgIGl0IFwiZGVsZXRlIGJ5IGtcIiwgLT4gZW5zdXJlIFwiZCBrXCIsIHRleHQ6IFwiMjIyXFxuXCIsIG1vZGU6ICdub3JtYWwnXG4gICAgICAgIGl0IFwieWFuayBieSBrXCIsIC0+IGVuc3VyZSBcInkga1wiLCB0ZXh0OiBvcmlnaW5hbFRleHQsIHJlZ2lzdGVyOiB7J1wiJzogdGV4dDogXCIwMDBcXG4xMTFcXG5cIn0sIG1vZGU6ICdub3JtYWwnXG4gICAgICAgIGl0IFwiY2hhbmdlIGJ5IGtcIiwgLT4gZW5zdXJlIFwiYyBrXCIsIHRleHRDOiBcInxcXG4yMjJcXG5cIiwgcmVnaXN0ZXI6IHsnXCInOiB0ZXh0OiBcIjAwMFxcbjExMVxcblwifSwgbW9kZTogJ2luc2VydCdcblxuICAgICAgZGVzY3JpYmUgXCJ3aGVuIGl0IGNhbiBub3QgbW92ZS11cFwiLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+IHNldCBjdXJzb3I6IFswLCAwXVxuICAgICAgICBpdCBcImRlbGV0ZSBieSBka1wiLCAtPiBlbnN1cmUgXCJkIGtcIiwgdGV4dDogb3JpZ2luYWxUZXh0LCBtb2RlOiAnbm9ybWFsJ1xuICAgICAgICBpdCBcInlhbmsgYnkgeWtcIiwgLT4gZW5zdXJlIFwieSBrXCIsIHRleHQ6IG9yaWdpbmFsVGV4dCwgcmVnaXN0ZXI6IHsnXCInOiB0ZXh0OiB1bmRlZmluZWR9LCBtb2RlOiAnbm9ybWFsJ1xuICAgICAgICBpdCBcImNoYW5nZSBieSBja1wiLCAtPiBlbnN1cmUgXCJjIGtcIiwgdGV4dEM6IFwifDAwMFxcbjExMVxcbjIyMlxcblwiLCByZWdpc3RlcjogeydcIic6IHRleHQ6IFwiXFxuXCJ9LCBtb2RlOiAnaW5zZXJ0JyAjIEZJWE1FLCBpbmNvbXBhdGlibGU6IHNob3VkIHJlbWFpbiBpbiBub3JtYWwuXG5cbiAgICAgIGRlc2NyaWJlIFwid2hlbiBpdCBjYW4gbm90IG1vdmUtZG93blwiLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+IHNldCBjdXJzb3I6IFsyLCAwXVxuICAgICAgICBpdCBcImRlbGV0ZSBieSBkalwiLCAtPiBlbnN1cmUgXCJkIGpcIiwgdGV4dDogb3JpZ2luYWxUZXh0LCBtb2RlOiAnbm9ybWFsJ1xuICAgICAgICBpdCBcInlhbmsgYnkgeWpcIiwgLT4gZW5zdXJlIFwieSBqXCIsIHRleHQ6IG9yaWdpbmFsVGV4dCwgcmVnaXN0ZXI6IHsnXCInOiB0ZXh0OiB1bmRlZmluZWR9LCBtb2RlOiAnbm9ybWFsJ1xuICAgICAgICBpdCBcImNoYW5nZSBieSBjalwiLCAtPiBlbnN1cmUgXCJjIGpcIiwgdGV4dEM6IFwiMDAwXFxuMTExXFxufDIyMlxcblwiLCByZWdpc3RlcjogeydcIic6IHRleHQ6IFwiXFxuXCJ9LCBtb2RlOiAnaW5zZXJ0JyAjIEZJWE1FLCBpbmNvbXBhdGlibGU6IHNob3VkIHJlbWFpbiBpbiBub3JtYWwuXG5cbiAgICBkZXNjcmliZSBcIm1vdmVTdWNjZXNzT25MaW5ld2lzZT10cnVlIG1vdGlvblwiLCAtPlxuICAgICAgZGVzY3JpYmUgXCJ3aGVuIGl0IGNhbiBtb3ZlXCIsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT4gc2V0IGN1cnNvcjogWzEsIDBdXG4gICAgICAgIGl0IFwiZGVsZXRlIGJ5IEdcIiwgLT4gZW5zdXJlIFwiZCBHXCIsIHRleHQ6IFwiMDAwXFxuXCIsIG1vZGU6ICdub3JtYWwnXG4gICAgICAgIGl0IFwieWFuayBieSBHXCIsIC0+IGVuc3VyZSBcInkgR1wiLCB0ZXh0OiBvcmlnaW5hbFRleHQsIHJlZ2lzdGVyOiB7J1wiJzogdGV4dDogXCIxMTFcXG4yMjJcXG5cIn0sIG1vZGU6ICdub3JtYWwnXG4gICAgICAgIGl0IFwiY2hhbmdlIGJ5IEdcIiwgLT4gZW5zdXJlIFwiYyBHXCIsIHRleHRDOiBcIjAwMFxcbnxcXG5cIiwgcmVnaXN0ZXI6IHsnXCInOiB0ZXh0OiBcIjExMVxcbjIyMlxcblwifSwgbW9kZTogJ2luc2VydCdcblxuICAgICAgICBpdCBcImRlbGV0ZSBieSBnZ1wiLCAtPiBlbnN1cmUgXCJkIGcgZ1wiLCB0ZXh0OiBcIjIyMlxcblwiLCBtb2RlOiAnbm9ybWFsJ1xuICAgICAgICBpdCBcInlhbmsgYnkgZ2dcIiwgLT4gZW5zdXJlIFwieSBnIGdcIiwgdGV4dDogb3JpZ2luYWxUZXh0LCByZWdpc3RlcjogeydcIic6IHRleHQ6IFwiMDAwXFxuMTExXFxuXCJ9LCBtb2RlOiAnbm9ybWFsJ1xuICAgICAgICBpdCBcImNoYW5nZSBieSBnZ1wiLCAtPiBlbnN1cmUgXCJjIGcgZ1wiLCB0ZXh0QzogXCJ8XFxuMjIyXFxuXCIsIHJlZ2lzdGVyOiB7J1wiJzogdGV4dDogXCIwMDBcXG4xMTFcXG5cIn0sIG1vZGU6ICdpbnNlcnQnXG5cbiAgICAgIGRlc2NyaWJlIFwid2hlbiBpdCBjYW4gbm90IG1vdmUtdXBcIiwgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPiBzZXQgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgaXQgXCJkZWxldGUgYnkgZ2dcIiwgLT4gZW5zdXJlIFwiZCBnIGdcIiwgdGV4dDogXCIxMTFcXG4yMjJcXG5cIiwgbW9kZTogJ25vcm1hbCdcbiAgICAgICAgaXQgXCJ5YW5rIGJ5IGdnXCIsIC0+IGVuc3VyZSBcInkgZyBnXCIsIHRleHQ6IG9yaWdpbmFsVGV4dCwgcmVnaXN0ZXI6IHsnXCInOiB0ZXh0OiBcIjAwMFxcblwifSwgbW9kZTogJ25vcm1hbCdcbiAgICAgICAgaXQgXCJjaGFuZ2UgYnkgZ2dcIiwgLT4gZW5zdXJlIFwiYyBnIGdcIiwgdGV4dEM6IFwifFxcbjExMVxcbjIyMlxcblwiLCByZWdpc3RlcjogeydcIic6IHRleHQ6IFwiMDAwXFxuXCJ9LCBtb2RlOiAnaW5zZXJ0J1xuICAgICAgZGVzY3JpYmUgXCJ3aGVuIGl0IGNhbiBub3QgbW92ZS1kb3duXCIsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT4gc2V0IGN1cnNvcjogWzIsIDBdXG4gICAgICAgIGl0IFwiZGVsZXRlIGJ5IEdcIiwgLT4gZW5zdXJlIFwiZCBHXCIsIHRleHQ6IFwiMDAwXFxuMTExXFxuXCIsIG1vZGU6ICdub3JtYWwnXG4gICAgICAgIGl0IFwieWFuayBieSBHXCIsIC0+IGVuc3VyZSBcInkgR1wiLCB0ZXh0OiBvcmlnaW5hbFRleHQsIHJlZ2lzdGVyOiB7J1wiJzogdGV4dDogXCIyMjJcXG5cIn0sIG1vZGU6ICdub3JtYWwnXG4gICAgICAgIGl0IFwiY2hhbmdlIGJ5IEdcIiwgLT4gZW5zdXJlIFwiYyBHXCIsIHRleHRDOiBcIjAwMFxcbjExMVxcbnxcXG5cIiwgcmVnaXN0ZXI6IHsnXCInOiB0ZXh0OiBcIjIyMlxcblwifSwgbW9kZTogJ2luc2VydCdcblxuICBkZXNjcmliZSBcInRoZSB3IGtleWJpbmRpbmdcIiwgLT5cbiAgICBiYXNlVGV4dCA9IFwiXCJcIlxuICAgICAgYWIgY2RlMSstXG4gICAgICAgeHl6XG5cbiAgICAgIHppcFxuICAgICAgXCJcIlwiXG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2V0IHRleHQ6IGJhc2VUZXh0XG5cbiAgICBkZXNjcmliZSBcImFzIGEgbW90aW9uXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFswLCAwXVxuXG4gICAgICBpdCBcIm1vdmVzIHRoZSBjdXJzb3IgdG8gdGhlIGJlZ2lubmluZyBvZiB0aGUgbmV4dCB3b3JkXCIsIC0+XG4gICAgICAgIGVuc3VyZSAndycsIGN1cnNvcjogWzAsIDNdXG4gICAgICAgIGVuc3VyZSAndycsIGN1cnNvcjogWzAsIDddXG4gICAgICAgIGVuc3VyZSAndycsIGN1cnNvcjogWzEsIDFdXG4gICAgICAgIGVuc3VyZSAndycsIGN1cnNvcjogWzIsIDBdXG4gICAgICAgIGVuc3VyZSAndycsIGN1cnNvcjogWzMsIDBdXG4gICAgICAgIGVuc3VyZSAndycsIGN1cnNvcjogWzMsIDJdXG4gICAgICAgICMgV2hlbiB0aGUgY3Vyc29yIGdldHMgdG8gdGhlIEVPRiwgaXQgc2hvdWxkIHN0YXkgdGhlcmUuXG4gICAgICAgIGVuc3VyZSAndycsIGN1cnNvcjogWzMsIDJdXG5cbiAgICAgIGl0IFwibW92ZXMgdGhlIGN1cnNvciB0byB0aGUgZW5kIG9mIHRoZSB3b3JkIGlmIGxhc3Qgd29yZCBpbiBmaWxlXCIsIC0+XG4gICAgICAgIHNldCB0ZXh0OiAnYWJjJywgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgZW5zdXJlICd3JywgY3Vyc29yOiBbMCwgMl1cblxuICAgICAgaXQgXCJtb3ZlIHRvIG5leHQgd29yZCBieSBza2lwcGluZyB0cmFpbGluZyB3aGl0ZSBzcGFjZXNcIiwgLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dENfOiBcIlwiXCJcbiAgICAgICAgICAgIDAxMnxfX19cbiAgICAgICAgICAgICAgMjM0XG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgZW5zdXJlICd3JyxcbiAgICAgICAgICB0ZXh0Q186IFwiXCJcIlxuICAgICAgICAgICAgMDEyX19fXG4gICAgICAgICAgICAgIHwyMzRcbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICBpdCBcIm1vdmUgdG8gbmV4dCB3b3JkIGZyb20gRU9MXCIsIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHRDXzogXCJcIlwiXG4gICAgICAgICAgICB8XG4gICAgICAgICAgICBfXzIzNFwiXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgZW5zdXJlICd3JyxcbiAgICAgICAgICB0ZXh0Q186IFwiXCJcIlxuXG4gICAgICAgICAgICBfX3wyMzRcIlxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICMgW0ZJWE1FXSBpbXByb3ZlIHNwZWMgdG8gbG9vcCBzYW1lIHNlY3Rpb24gd2l0aCBkaWZmZXJlbnQgdGV4dFxuICAgICAgZGVzY3JpYmUgXCJmb3IgQ1JMRiBidWZmZXJcIiwgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIHNldCB0ZXh0OiBiYXNlVGV4dC5yZXBsYWNlKC9cXG4vZywgXCJcXHJcXG5cIilcblxuICAgICAgICBkZXNjcmliZSBcImFzIGEgbW90aW9uXCIsIC0+XG4gICAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgICAgc2V0IGN1cnNvcjogWzAsIDBdXG5cbiAgICAgICAgICBpdCBcIm1vdmVzIHRoZSBjdXJzb3IgdG8gdGhlIGJlZ2lubmluZyBvZiB0aGUgbmV4dCB3b3JkXCIsIC0+XG4gICAgICAgICAgICBlbnN1cmUgJ3cnLCBjdXJzb3I6IFswLCAzXVxuICAgICAgICAgICAgZW5zdXJlICd3JywgY3Vyc29yOiBbMCwgN11cbiAgICAgICAgICAgIGVuc3VyZSAndycsIGN1cnNvcjogWzEsIDFdXG4gICAgICAgICAgICBlbnN1cmUgJ3cnLCBjdXJzb3I6IFsyLCAwXVxuICAgICAgICAgICAgZW5zdXJlICd3JywgY3Vyc29yOiBbMywgMF1cbiAgICAgICAgICAgIGVuc3VyZSAndycsIGN1cnNvcjogWzMsIDJdXG4gICAgICAgICAgICAjIFdoZW4gdGhlIGN1cnNvciBnZXRzIHRvIHRoZSBFT0YsIGl0IHNob3VsZCBzdGF5IHRoZXJlLlxuICAgICAgICAgICAgZW5zdXJlICd3JywgY3Vyc29yOiBbMywgMl1cblxuICAgIGRlc2NyaWJlIFwid2hlbiB1c2VkIGJ5IENoYW5nZSBvcGVyYXRvclwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0XzogXCJcIlwiXG4gICAgICAgICAgX192YXIxID0gMVxuICAgICAgICAgIF9fdmFyMiA9IDJcXG5cbiAgICAgICAgICBcIlwiXCJcblxuICAgICAgZGVzY3JpYmUgXCJ3aGVuIGN1cnNvciBpcyBvbiB3b3JkXCIsIC0+XG4gICAgICAgIGl0IFwibm90IGVhdCB3aGl0ZXNwYWNlXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzAsIDNdXG4gICAgICAgICAgZW5zdXJlICdjIHcnLFxuICAgICAgICAgICAgdGV4dF86IFwiXCJcIlxuICAgICAgICAgICAgX192ID0gMVxuICAgICAgICAgICAgX192YXIyID0gMlxcblxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICBjdXJzb3I6IFswLCAzXVxuXG4gICAgICBkZXNjcmliZSBcIndoZW4gY3Vyc29yIGlzIG9uIHdoaXRlIHNwYWNlXCIsIC0+XG4gICAgICAgIGl0IFwib25seSBlYXQgd2hpdGUgc3BhY2VcIiwgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgICBlbnN1cmUgJ2MgdycsXG4gICAgICAgICAgICB0ZXh0XzogXCJcIlwiXG4gICAgICAgICAgICB2YXIxID0gMVxuICAgICAgICAgICAgX192YXIyID0gMlxcblxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICBjdXJzb3I6IFswLCAwXVxuXG4gICAgICBkZXNjcmliZSBcIndoZW4gdGV4dCB0byBFT0wgaXMgYWxsIHdoaXRlIHNwYWNlXCIsIC0+XG4gICAgICAgIGl0IFwid29udCBlYXQgbmV3IGxpbmUgY2hhcmFjdGVyXCIsIC0+XG4gICAgICAgICAgc2V0XG4gICAgICAgICAgICB0ZXh0XzogXCJcIlwiXG4gICAgICAgICAgICBhYmNfX1xuICAgICAgICAgICAgZGVmXFxuXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgIGN1cnNvcjogWzAsIDNdXG4gICAgICAgICAgZW5zdXJlICdjIHcnLFxuICAgICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICBhYmNcbiAgICAgICAgICAgIGRlZlxcblxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICBjdXJzb3I6IFswLCAzXVxuXG4gICAgICAgIGl0IFwiY2FudCBlYXQgbmV3IGxpbmUgd2hlbiBjb3VudCBpcyBzcGVjaWZpZWRcIiwgLT5cbiAgICAgICAgICBzZXQgdGV4dDogXCJcXG5cXG5cXG5cXG5cXG5saW5lNlxcblwiLCBjdXJzb3I6IFswLCAwXVxuICAgICAgICAgIGVuc3VyZSAnNSBjIHcnLCB0ZXh0OiBcIlxcbmxpbmU2XFxuXCIsIGN1cnNvcjogWzAsIDBdXG5cbiAgICBkZXNjcmliZSBcImFzIGEgc2VsZWN0aW9uXCIsIC0+XG4gICAgICBkZXNjcmliZSBcIndpdGhpbiBhIHdvcmRcIiwgLT5cbiAgICAgICAgaXQgXCJzZWxlY3RzIHRvIHRoZSBlbmQgb2YgdGhlIHdvcmRcIiwgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgICBlbnN1cmUgJ3kgdycsIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiAnYWIgJ1xuXG4gICAgICBkZXNjcmliZSBcImJldHdlZW4gd29yZHNcIiwgLT5cbiAgICAgICAgaXQgXCJzZWxlY3RzIHRoZSB3aGl0ZXNwYWNlXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzAsIDJdXG4gICAgICAgICAgZW5zdXJlICd5IHcnLCByZWdpc3RlcjogJ1wiJzogdGV4dDogJyAnXG5cbiAgZGVzY3JpYmUgXCJ0aGUgVyBrZXliaW5kaW5nXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2V0IHRleHQ6IFwiY2RlMSstIGFiIFxcbiB4eXpcXG5cXG56aXBcIlxuXG4gICAgZGVzY3JpYmUgXCJhcyBhIG1vdGlvblwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMF1cblxuICAgICAgaXQgXCJtb3ZlcyB0aGUgY3Vyc29yIHRvIHRoZSBiZWdpbm5pbmcgb2YgdGhlIG5leHQgd29yZFwiLCAtPlxuICAgICAgICBlbnN1cmUgJ1cnLCBjdXJzb3I6IFswLCA3XVxuICAgICAgICBlbnN1cmUgJ1cnLCBjdXJzb3I6IFsxLCAxXVxuICAgICAgICBlbnN1cmUgJ1cnLCBjdXJzb3I6IFsyLCAwXVxuICAgICAgICBlbnN1cmUgJ1cnLCBjdXJzb3I6IFszLCAwXVxuXG4gICAgICBpdCBcIm1vdmVzIHRoZSBjdXJzb3IgdG8gYmVnaW5uaW5nIG9mIHRoZSBuZXh0IHdvcmQgb2YgbmV4dCBsaW5lIHdoZW4gYWxsIHJlbWFpbmluZyB0ZXh0IGlzIHdoaXRlIHNwYWNlLlwiLCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0XzogXCJcIlwiXG4gICAgICAgICAgICAwMTJfX19cbiAgICAgICAgICAgIF9fMjM0XG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICBjdXJzb3I6IFswLCAzXVxuICAgICAgICBlbnN1cmUgJ1cnLCBjdXJzb3I6IFsxLCAyXVxuXG4gICAgICBpdCBcIm1vdmVzIHRoZSBjdXJzb3IgdG8gYmVnaW5uaW5nIG9mIHRoZSBuZXh0IHdvcmQgb2YgbmV4dCBsaW5lIHdoZW4gY3Vyc29yIGlzIGF0IEVPTC5cIiwgLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dF86IFwiXCJcIlxuXG4gICAgICAgICAgX18yMzRcbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICBjdXJzb3I6IFswLCAwXVxuICAgICAgICBlbnN1cmUgJ1cnLCBjdXJzb3I6IFsxLCAyXVxuXG4gICAgIyBUaGlzIHNwZWMgaXMgcmVkdW5kYW50IHNpbmNlIFcoTW92ZVRvTmV4dFdob2xlV29yZCkgaXMgY2hpbGQgb2YgdyhNb3ZlVG9OZXh0V29yZCkuXG4gICAgZGVzY3JpYmUgXCJ3aGVuIHVzZWQgYnkgQ2hhbmdlIG9wZXJhdG9yXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHRfOiBcIlwiXCJcbiAgICAgICAgICAgIF9fdmFyMSA9IDFcbiAgICAgICAgICAgIF9fdmFyMiA9IDJcXG5cbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICBkZXNjcmliZSBcIndoZW4gY3Vyc29yIGlzIG9uIHdvcmRcIiwgLT5cbiAgICAgICAgaXQgXCJub3QgZWF0IHdoaXRlc3BhY2VcIiwgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMCwgM11cbiAgICAgICAgICBlbnN1cmUgJ2MgVycsXG4gICAgICAgICAgICB0ZXh0XzogXCJcIlwiXG4gICAgICAgICAgICAgIF9fdiA9IDFcbiAgICAgICAgICAgICAgX192YXIyID0gMlxcblxuICAgICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgIGN1cnNvcjogWzAsIDNdXG5cbiAgICAgIGRlc2NyaWJlIFwid2hlbiBjdXJzb3IgaXMgb24gd2hpdGUgc3BhY2VcIiwgLT5cbiAgICAgICAgaXQgXCJvbmx5IGVhdCB3aGl0ZSBzcGFjZVwiLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFswLCAwXVxuICAgICAgICAgIGVuc3VyZSAnYyBXJyxcbiAgICAgICAgICAgIHRleHRfOiBcIlwiXCJcbiAgICAgICAgICAgICAgdmFyMSA9IDFcbiAgICAgICAgICAgICAgX192YXIyID0gMlxcblxuICAgICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgIGN1cnNvcjogWzAsIDBdXG5cbiAgICAgIGRlc2NyaWJlIFwid2hlbiB0ZXh0IHRvIEVPTCBpcyBhbGwgd2hpdGUgc3BhY2VcIiwgLT5cbiAgICAgICAgaXQgXCJ3b250IGVhdCBuZXcgbGluZSBjaGFyYWN0ZXJcIiwgLT5cbiAgICAgICAgICBzZXQgdGV4dDogXCJhYmMgIFxcbmRlZlxcblwiLCBjdXJzb3I6IFswLCAzXVxuICAgICAgICAgIGVuc3VyZSAnYyBXJywgdGV4dDogXCJhYmNcXG5kZWZcXG5cIiwgY3Vyc29yOiBbMCwgM11cblxuICAgICAgICBpdCBcImNhbnQgZWF0IG5ldyBsaW5lIHdoZW4gY291bnQgaXMgc3BlY2lmaWVkXCIsIC0+XG4gICAgICAgICAgc2V0IHRleHQ6IFwiXFxuXFxuXFxuXFxuXFxubGluZTZcXG5cIiwgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgICBlbnN1cmUgJzUgYyBXJywgdGV4dDogXCJcXG5saW5lNlxcblwiLCBjdXJzb3I6IFswLCAwXVxuXG4gICAgZGVzY3JpYmUgXCJhcyBhIHNlbGVjdGlvblwiLCAtPlxuICAgICAgZGVzY3JpYmUgXCJ3aXRoaW4gYSB3b3JkXCIsIC0+XG4gICAgICAgIGl0IFwic2VsZWN0cyB0byB0aGUgZW5kIG9mIHRoZSB3aG9sZSB3b3JkXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzAsIDBdXG4gICAgICAgICAgZW5zdXJlICd5IFcnLCByZWdpc3RlcjogJ1wiJzogdGV4dDogJ2NkZTErLSAnXG5cbiAgICAgIGl0IFwiY29udGludWVzIHBhc3QgYmxhbmsgbGluZXNcIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzIsIDBdXG4gICAgICAgIGVuc3VyZSAnZCBXJyxcbiAgICAgICAgICB0ZXh0XzogXCJcIlwiXG4gICAgICAgICAgY2RlMSstIGFiX1xuICAgICAgICAgIF94eXpcbiAgICAgICAgICB6aXBcbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICByZWdpc3RlcjogJ1wiJzogdGV4dDogXCJcXG5cIlxuXG4gICAgICBpdCBcImRvZXNuJ3QgZ28gcGFzdCB0aGUgZW5kIG9mIHRoZSBmaWxlXCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFszLCAwXVxuICAgICAgICBlbnN1cmUgJ2QgVycsXG4gICAgICAgICAgdGV4dF86IFwiXCJcIlxuICAgICAgICAgIGNkZTErLSBhYl9cbiAgICAgICAgICBfeHl6XFxuXFxuXG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgcmVnaXN0ZXI6ICdcIic6IHRleHQ6ICd6aXAnXG5cbiAgZGVzY3JpYmUgXCJ0aGUgZSBrZXliaW5kaW5nXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2V0IHRleHRfOiBcIlwiXCJcbiAgICAgIGFiIGNkZTErLV9cbiAgICAgIF94eXpcblxuICAgICAgemlwXG4gICAgICBcIlwiXCJcblxuICAgIGRlc2NyaWJlIFwiYXMgYSBtb3Rpb25cIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzAsIDBdXG5cbiAgICAgIGl0IFwibW92ZXMgdGhlIGN1cnNvciB0byB0aGUgZW5kIG9mIHRoZSBjdXJyZW50IHdvcmRcIiwgLT5cbiAgICAgICAgZW5zdXJlICdlJywgY3Vyc29yOiBbMCwgMV1cbiAgICAgICAgZW5zdXJlICdlJywgY3Vyc29yOiBbMCwgNl1cbiAgICAgICAgZW5zdXJlICdlJywgY3Vyc29yOiBbMCwgOF1cbiAgICAgICAgZW5zdXJlICdlJywgY3Vyc29yOiBbMSwgM11cbiAgICAgICAgZW5zdXJlICdlJywgY3Vyc29yOiBbMywgMl1cblxuICAgICAgaXQgXCJza2lwcyB3aGl0ZXNwYWNlIHVudGlsIEVPRlwiLCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0OiBcIjAxMlxcblxcblxcbjAxMlxcblxcblwiXG4gICAgICAgICAgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgZW5zdXJlICdlJywgY3Vyc29yOiBbMCwgMl1cbiAgICAgICAgZW5zdXJlICdlJywgY3Vyc29yOiBbMywgMl1cbiAgICAgICAgZW5zdXJlICdlJywgY3Vyc29yOiBbNCwgMF1cblxuICAgIGRlc2NyaWJlIFwiYXMgc2VsZWN0aW9uXCIsIC0+XG4gICAgICBkZXNjcmliZSBcIndpdGhpbiBhIHdvcmRcIiwgLT5cbiAgICAgICAgaXQgXCJzZWxlY3RzIHRvIHRoZSBlbmQgb2YgdGhlIGN1cnJlbnQgd29yZFwiLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFswLCAwXVxuICAgICAgICAgIGVuc3VyZSAneSBlJywgcmVnaXN0ZXI6ICdcIic6IHRleHQ6ICdhYidcblxuICAgICAgZGVzY3JpYmUgXCJiZXR3ZWVuIHdvcmRzXCIsIC0+XG4gICAgICAgIGl0IFwic2VsZWN0cyB0byB0aGUgZW5kIG9mIHRoZSBuZXh0IHdvcmRcIiwgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMl1cbiAgICAgICAgICBlbnN1cmUgJ3kgZScsIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiAnIGNkZTEnXG5cbiAgZGVzY3JpYmUgXCJ0aGUgZ2Uga2V5YmluZGluZ1wiLCAtPlxuICAgIGRlc2NyaWJlIFwiYXMgYSBtb3Rpb25cIiwgLT5cbiAgICAgIGl0IFwibW92ZXMgdGhlIGN1cnNvciB0byB0aGUgZW5kIG9mIHRoZSBwcmV2aW91cyB3b3JkXCIsIC0+XG4gICAgICAgIHNldCB0ZXh0OiBcIjEyMzQgNTY3OCB3b3Jkd29yZFwiXG4gICAgICAgIHNldCBjdXJzb3I6IFswLCAxNl1cbiAgICAgICAgZW5zdXJlICdnIGUnLCBjdXJzb3I6IFswLCA4XVxuICAgICAgICBlbnN1cmUgJ2cgZScsIGN1cnNvcjogWzAsIDNdXG4gICAgICAgIGVuc3VyZSAnZyBlJywgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgZW5zdXJlICdnIGUnLCBjdXJzb3I6IFswLCAwXVxuXG4gICAgICBpdCBcIm1vdmVzIGNvcnJlbnRseSB3aGVuIHN0YXJ0aW5nIGJldHdlZW4gd29yZHNcIiwgLT5cbiAgICAgICAgc2V0IHRleHQ6IFwiMSBsZWFkaW5nICAgICBlbmRcIlxuICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMTJdXG4gICAgICAgIGVuc3VyZSAnZyBlJywgY3Vyc29yOiBbMCwgOF1cblxuICAgICAgaXQgXCJ0YWtlcyBhIGNvdW50XCIsIC0+XG4gICAgICAgIHNldCB0ZXh0OiBcInZpbSBtb2RlIHBsdXMgaXMgZ2V0dGluZyB0aGVyZVwiXG4gICAgICAgIHNldCBjdXJzb3I6IFswLCAyOF1cbiAgICAgICAgZW5zdXJlICc1IGcgZScsIGN1cnNvcjogWzAsIDJdXG5cbiAgICAgICMgdGVzdCB3aWxsIGZhaWwgdW50aWwgdGhlIGNvZGUgaXMgZml4ZWRcbiAgICAgIHhpdCBcImhhbmRsZXMgbm9uLXdvcmRzIGluc2lkZSB3b3JkcyBsaWtlIHZpbVwiLCAtPlxuICAgICAgICBzZXQgdGV4dDogXCIxMjM0IDU2Nzggd29yZC13b3JkXCJcbiAgICAgICAgc2V0IGN1cnNvcjogWzAsIDE4XVxuICAgICAgICBlbnN1cmUgJ2cgZScsIGN1cnNvcjogWzAsIDE0XVxuICAgICAgICBlbnN1cmUgJ2cgZScsIGN1cnNvcjogWzAsIDEzXVxuICAgICAgICBlbnN1cmUgJ2cgZScsIGN1cnNvcjogWzAsIDhdXG5cbiAgICAgICMgdGVzdCB3aWxsIGZhaWwgdW50aWwgdGhlIGNvZGUgaXMgZml4ZWRcbiAgICAgIHhpdCBcImhhbmRsZXMgbmV3bGluZXMgbGlrZSB2aW1cIiwgLT5cbiAgICAgICAgc2V0IHRleHQ6IFwiMTIzNFxcblxcblxcblxcbjU2NzhcIlxuICAgICAgICBzZXQgY3Vyc29yOiBbNSwgMl1cbiAgICAgICAgIyB2aW0gc2VlbXMgdG8gdGhpbmsgYW4gZW5kLW9mLXdvcmQgaXMgYXQgZXZlcnkgYmxhbmsgbGluZVxuICAgICAgICBlbnN1cmUgJ2cgZScsIGN1cnNvcjogWzQsIDBdXG4gICAgICAgIGVuc3VyZSAnZyBlJywgY3Vyc29yOiBbMywgMF1cbiAgICAgICAgZW5zdXJlICdnIGUnLCBjdXJzb3I6IFsyLCAwXVxuICAgICAgICBlbnN1cmUgJ2cgZScsIGN1cnNvcjogWzEsIDBdXG4gICAgICAgIGVuc3VyZSAnZyBlJywgY3Vyc29yOiBbMSwgMF1cbiAgICAgICAgZW5zdXJlICdnIGUnLCBjdXJzb3I6IFswLCAzXVxuICAgICAgICBlbnN1cmUgJ2cgZScsIGN1cnNvcjogWzAsIDBdXG5cbiAgICBkZXNjcmliZSBcIndoZW4gdXNlZCBieSBDaGFuZ2Ugb3BlcmF0b3JcIiwgLT5cbiAgICAgIGl0IFwiY2hhbmdlcyB3b3JkIGZyYWdtZW50c1wiLCAtPlxuICAgICAgICBzZXQgdGV4dDogXCJjZXQgZG9jdW1lbnRcIlxuICAgICAgICBzZXQgY3Vyc29yOiBbMCwgN11cbiAgICAgICAgZW5zdXJlICdjIGcgZScsIGN1cnNvcjogWzAsIDJdLCB0ZXh0OiBcImNlbWVudFwiLCBtb2RlOiAnaW5zZXJ0J1xuICAgICAgICAjIFRPRE86IEknbSBub3Qgc3VyZSBob3cgdG8gY2hlY2sgdGhlIHJlZ2lzdGVyIGFmdGVyIGNoZWNraW5nIHRoZSBkb2N1bWVudFxuICAgICAgICAjIGVuc3VyZSByZWdpc3RlcjogJ1wiJywgdGV4dDogJ3QgZG9jdSdcblxuICAgICAgaXQgXCJjaGFuZ2VzIHdoaXRlc3BhY2UgcHJvcGVybHlcIiwgLT5cbiAgICAgICAgc2V0IHRleHQ6IFwiY2UgICAgZG9jXCJcbiAgICAgICAgc2V0IGN1cnNvcjogWzAsIDRdXG4gICAgICAgIGVuc3VyZSAnYyBnIGUnLCBjdXJzb3I6IFswLCAxXSwgdGV4dDogXCJjIGRvY1wiLCBtb2RlOiAnaW5zZXJ0J1xuXG4gICAgZGVzY3JpYmUgXCJpbiBjaGFyYWN0ZXJ3aXNlIHZpc3VhbCBtb2RlXCIsIC0+XG4gICAgICBpdCBcInNlbGVjdHMgd29yZCBmcmFnbWVudHNcIiwgLT5cbiAgICAgICAgc2V0IHRleHQ6IFwiY2V0IGRvY3VtZW50XCJcbiAgICAgICAgc2V0IGN1cnNvcjogWzAsIDddXG4gICAgICAgIGVuc3VyZSAndiBnIGUnLCBjdXJzb3I6IFswLCAyXSwgc2VsZWN0ZWRUZXh0OiBcInQgZG9jdVwiXG5cbiAgZGVzY3JpYmUgXCJ0aGUgRSBrZXliaW5kaW5nXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2V0IHRleHRfOiBcIlwiXCJcbiAgICAgIGFiICBjZGUxKy1fXG4gICAgICBfeHl6X1xuXG4gICAgICB6aXBcXG5cbiAgICAgIFwiXCJcIlxuXG4gICAgZGVzY3JpYmUgXCJhcyBhIG1vdGlvblwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMF1cblxuICAgICAgaXQgXCJtb3ZlcyB0aGUgY3Vyc29yIHRvIHRoZSBlbmQgb2YgdGhlIGN1cnJlbnQgd29yZFwiLCAtPlxuICAgICAgICBlbnN1cmUgJ0UnLCBjdXJzb3I6IFswLCAxXVxuICAgICAgICBlbnN1cmUgJ0UnLCBjdXJzb3I6IFswLCA5XVxuICAgICAgICBlbnN1cmUgJ0UnLCBjdXJzb3I6IFsxLCAzXVxuICAgICAgICBlbnN1cmUgJ0UnLCBjdXJzb3I6IFszLCAyXVxuICAgICAgICBlbnN1cmUgJ0UnLCBjdXJzb3I6IFszLCAyXVxuXG4gICAgZGVzY3JpYmUgXCJhcyBzZWxlY3Rpb25cIiwgLT5cbiAgICAgIGRlc2NyaWJlIFwid2l0aGluIGEgd29yZFwiLCAtPlxuICAgICAgICBpdCBcInNlbGVjdHMgdG8gdGhlIGVuZCBvZiB0aGUgY3VycmVudCB3b3JkXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzAsIDBdXG4gICAgICAgICAgZW5zdXJlICd5IEUnLCByZWdpc3RlcjogJ1wiJzogdGV4dDogJ2FiJ1xuXG4gICAgICBkZXNjcmliZSBcImJldHdlZW4gd29yZHNcIiwgLT5cbiAgICAgICAgaXQgXCJzZWxlY3RzIHRvIHRoZSBlbmQgb2YgdGhlIG5leHQgd29yZFwiLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFswLCAyXVxuICAgICAgICAgIGVuc3VyZSAneSBFJywgcmVnaXN0ZXI6ICdcIic6IHRleHQ6ICcgIGNkZTErLSdcblxuICAgICAgZGVzY3JpYmUgXCJwcmVzcyBtb3JlIHRoYW4gb25jZVwiLCAtPlxuICAgICAgICBpdCBcInNlbGVjdHMgdG8gdGhlIGVuZCBvZiB0aGUgY3VycmVudCB3b3JkXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzAsIDBdXG4gICAgICAgICAgZW5zdXJlICd2IEUgRSB5JywgcmVnaXN0ZXI6ICdcIic6IHRleHQ6ICdhYiAgY2RlMSstJ1xuXG4gIGRlc2NyaWJlIFwidGhlIGdFIGtleWJpbmRpbmdcIiwgLT5cbiAgICBkZXNjcmliZSBcImFzIGEgbW90aW9uXCIsIC0+XG4gICAgICBpdCBcIm1vdmVzIHRoZSBjdXJzb3IgdG8gdGhlIGVuZCBvZiB0aGUgcHJldmlvdXMgd29yZFwiLCAtPlxuICAgICAgICBzZXQgdGV4dDogXCIxMi40IDV+Ny0gd29yZC13b3JkXCJcbiAgICAgICAgc2V0IGN1cnNvcjogWzAsIDE2XVxuICAgICAgICBlbnN1cmUgJ2cgRScsIGN1cnNvcjogWzAsIDhdXG4gICAgICAgIGVuc3VyZSAnZyBFJywgY3Vyc29yOiBbMCwgM11cbiAgICAgICAgZW5zdXJlICdnIEUnLCBjdXJzb3I6IFswLCAwXVxuICAgICAgICBlbnN1cmUgJ2cgRScsIGN1cnNvcjogWzAsIDBdXG5cbiAgZGVzY3JpYmUgXCJ0aGUgKCwpIHNlbnRlbmNlIGtleWJpbmRpbmdcIiwgLT5cbiAgICBkZXNjcmliZSBcImFzIGEgbW90aW9uXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIGN1cnNvcjogWzAsIDBdXG4gICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgc2VudGVuY2Ugb25lLl0pJ1wiICAgIHNlbi50ZW5jZSAudHdvLlxuICAgICAgICAgIGhlcmUuICBzZW50ZW5jZSB0aHJlZVxuICAgICAgICAgIG1vcmUgdGhyZWVcblxuICAgICAgICAgICAgIHNlbnRlbmNlIGZvdXJcblxuXG4gICAgICAgICAgc2VudGVuY2UgZml2ZS5cbiAgICAgICAgICBtb3JlIGZpdmVcbiAgICAgICAgICBtb3JlIHNpeFxuXG4gICAgICAgICAgIGxhc3Qgc2VudGVuY2VcbiAgICAgICAgICBhbGwgZG9uZSBzZXZlblxuICAgICAgICAgIFwiXCJcIlxuXG4gICAgICBpdCBcIm1vdmVzIHRoZSBjdXJzb3IgdG8gdGhlIGVuZCBvZiB0aGUgc2VudGVuY2VcIiwgLT5cbiAgICAgICAgZW5zdXJlICcpJywgY3Vyc29yOiBbMCwgMjFdXG4gICAgICAgIGVuc3VyZSAnKScsIGN1cnNvcjogWzEsIDBdXG4gICAgICAgIGVuc3VyZSAnKScsIGN1cnNvcjogWzEsIDddXG4gICAgICAgIGVuc3VyZSAnKScsIGN1cnNvcjogWzMsIDBdXG4gICAgICAgIGVuc3VyZSAnKScsIGN1cnNvcjogWzQsIDNdXG4gICAgICAgIGVuc3VyZSAnKScsIGN1cnNvcjogWzUsIDBdICMgYm91bmRhcnkgaXMgZGlmZmVyZW50IGJ5IGRpcmVjdGlvblxuICAgICAgICBlbnN1cmUgJyknLCBjdXJzb3I6IFs3LCAwXVxuICAgICAgICBlbnN1cmUgJyknLCBjdXJzb3I6IFs4LCAwXVxuICAgICAgICBlbnN1cmUgJyknLCBjdXJzb3I6IFsxMCwgMF1cbiAgICAgICAgZW5zdXJlICcpJywgY3Vyc29yOiBbMTEsIDFdXG5cbiAgICAgICAgZW5zdXJlICcpJywgY3Vyc29yOiBbMTIsIDEzXVxuICAgICAgICBlbnN1cmUgJyknLCBjdXJzb3I6IFsxMiwgMTNdXG5cbiAgICAgICAgZW5zdXJlICcoJywgY3Vyc29yOiBbMTEsIDFdXG4gICAgICAgIGVuc3VyZSAnKCcsIGN1cnNvcjogWzEwLCAwXVxuICAgICAgICBlbnN1cmUgJygnLCBjdXJzb3I6IFs4LCAwXVxuICAgICAgICBlbnN1cmUgJygnLCBjdXJzb3I6IFs3LCAwXVxuICAgICAgICBlbnN1cmUgJygnLCBjdXJzb3I6IFs2LCAwXSAjIGJvdW5kYXJ5IGlzIGRpZmZlcmVudCBieSBkaXJlY3Rpb25cbiAgICAgICAgZW5zdXJlICcoJywgY3Vyc29yOiBbNCwgM11cbiAgICAgICAgZW5zdXJlICcoJywgY3Vyc29yOiBbMywgMF1cbiAgICAgICAgZW5zdXJlICcoJywgY3Vyc29yOiBbMSwgN11cbiAgICAgICAgZW5zdXJlICcoJywgY3Vyc29yOiBbMSwgMF1cbiAgICAgICAgZW5zdXJlICcoJywgY3Vyc29yOiBbMCwgMjFdXG5cbiAgICAgICAgZW5zdXJlICcoJywgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgZW5zdXJlICcoJywgY3Vyc29yOiBbMCwgMF1cblxuICAgICAgaXQgXCJza2lwcyB0byBiZWdpbm5pbmcgb2Ygc2VudGVuY2VcIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzQsIDE1XVxuICAgICAgICBlbnN1cmUgJygnLCBjdXJzb3I6IFs0LCAzXVxuXG4gICAgICBpdCBcInN1cHBvcnRzIGEgY291bnRcIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzAsIDBdXG4gICAgICAgIGVuc3VyZSAnMyApJywgY3Vyc29yOiBbMSwgN11cbiAgICAgICAgZW5zdXJlICczICgnLCBjdXJzb3I6IFswLCAwXVxuXG4gICAgICBpdCBcImNhbiBtb3ZlIHN0YXJ0IG9mIGJ1ZmZlciBvciBlbmQgb2YgYnVmZmVyIGF0IG1heGltdW1cIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzAsIDBdXG4gICAgICAgIGVuc3VyZSAnMiAwICknLCBjdXJzb3I6IFsxMiwgMTNdXG4gICAgICAgIGVuc3VyZSAnMiAwICgnLCBjdXJzb3I6IFswLCAwXVxuXG4gICAgICBkZXNjcmliZSBcInNlbnRlbmNlIG1vdGlvbiB3aXRoIHNraXAtYmxhbmstcm93XCIsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBhdG9tLmtleW1hcHMuYWRkIFwidGVzdFwiLFxuICAgICAgICAgICAgJ2F0b20tdGV4dC1lZGl0b3IudmltLW1vZGUtcGx1czpub3QoLmluc2VydC1tb2RlKSc6XG4gICAgICAgICAgICAgICdnICknOiAndmltLW1vZGUtcGx1czptb3ZlLXRvLW5leHQtc2VudGVuY2Utc2tpcC1ibGFuay1yb3cnXG4gICAgICAgICAgICAgICdnICgnOiAndmltLW1vZGUtcGx1czptb3ZlLXRvLXByZXZpb3VzLXNlbnRlbmNlLXNraXAtYmxhbmstcm93J1xuXG4gICAgICAgIGl0IFwibW92ZXMgdGhlIGN1cnNvciB0byB0aGUgZW5kIG9mIHRoZSBzZW50ZW5jZVwiLCAtPlxuICAgICAgICAgIGVuc3VyZSAnZyApJywgY3Vyc29yOiBbMCwgMjFdXG4gICAgICAgICAgZW5zdXJlICdnICknLCBjdXJzb3I6IFsxLCAwXVxuICAgICAgICAgIGVuc3VyZSAnZyApJywgY3Vyc29yOiBbMSwgN11cbiAgICAgICAgICBlbnN1cmUgJ2cgKScsIGN1cnNvcjogWzQsIDNdXG4gICAgICAgICAgZW5zdXJlICdnICknLCBjdXJzb3I6IFs3LCAwXVxuICAgICAgICAgIGVuc3VyZSAnZyApJywgY3Vyc29yOiBbOCwgMF1cbiAgICAgICAgICBlbnN1cmUgJ2cgKScsIGN1cnNvcjogWzExLCAxXVxuXG4gICAgICAgICAgZW5zdXJlICdnICknLCBjdXJzb3I6IFsxMiwgMTNdXG4gICAgICAgICAgZW5zdXJlICdnICknLCBjdXJzb3I6IFsxMiwgMTNdXG5cbiAgICAgICAgICBlbnN1cmUgJ2cgKCcsIGN1cnNvcjogWzExLCAxXVxuICAgICAgICAgIGVuc3VyZSAnZyAoJywgY3Vyc29yOiBbOCwgMF1cbiAgICAgICAgICBlbnN1cmUgJ2cgKCcsIGN1cnNvcjogWzcsIDBdXG4gICAgICAgICAgZW5zdXJlICdnICgnLCBjdXJzb3I6IFs0LCAzXVxuICAgICAgICAgIGVuc3VyZSAnZyAoJywgY3Vyc29yOiBbMSwgN11cbiAgICAgICAgICBlbnN1cmUgJ2cgKCcsIGN1cnNvcjogWzEsIDBdXG4gICAgICAgICAgZW5zdXJlICdnICgnLCBjdXJzb3I6IFswLCAyMV1cblxuICAgICAgICAgIGVuc3VyZSAnZyAoJywgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgICBlbnN1cmUgJ2cgKCcsIGN1cnNvcjogWzAsIDBdXG5cbiAgICBkZXNjcmliZSBcIm1vdmluZyBpbnNpZGUgYSBibGFuayBkb2N1bWVudFwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0XzogXCJcIlwiXG4gICAgICAgICAgX19fX19cbiAgICAgICAgICBfX19fX1xuICAgICAgICAgIFwiXCJcIlxuXG4gICAgICBpdCBcIm1vdmVzIHdpdGhvdXQgY3Jhc2hpbmdcIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzAsIDBdXG4gICAgICAgIGVuc3VyZSAnKScsIGN1cnNvcjogWzEsIDRdXG4gICAgICAgIGVuc3VyZSAnKScsIGN1cnNvcjogWzEsIDRdXG4gICAgICAgIGVuc3VyZSAnKCcsIGN1cnNvcjogWzAsIDBdXG4gICAgICAgIGVuc3VyZSAnKCcsIGN1cnNvcjogWzAsIDBdXG5cbiAgICBkZXNjcmliZSBcImFzIGEgc2VsZWN0aW9uXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldCB0ZXh0OiBcInNlbnRlbmNlIG9uZS4gc2VudGVuY2UgdHdvLlxcbiAgc2VudGVuY2UgdGhyZWUuXCJcblxuICAgICAgaXQgJ3NlbGVjdHMgdG8gdGhlIGVuZCBvZiB0aGUgY3VycmVudCBzZW50ZW5jZScsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFswLCAyMF1cbiAgICAgICAgZW5zdXJlICd5ICknLCByZWdpc3RlcjogJ1wiJzogdGV4dDogXCJjZSB0d28uXFxuICBcIlxuXG4gICAgICBpdCAnc2VsZWN0cyB0byB0aGUgYmVnaW5uaW5nIG9mIHRoZSBjdXJyZW50IHNlbnRlbmNlJywgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzAsIDIwXVxuICAgICAgICBlbnN1cmUgJ3kgKCcsIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiBcInNlbnRlblwiXG5cbiAgZGVzY3JpYmUgXCJ0aGUgeyx9IGtleWJpbmRpbmdcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXRcbiAgICAgICAgdGV4dDogXCJcIlwiXG5cblxuXG4gICAgICAgIDM6IHBhcmFncmFwaC0xXG4gICAgICAgIDQ6IHBhcmFncmFwaC0xXG5cblxuXG4gICAgICAgIDg6IHBhcmFncmFwaC0yXG5cblxuXG4gICAgICAgIDEyOiBwYXJhZ3JhcGgtM1xuICAgICAgICAxMzogcGFyYWdyYXBoLTNcblxuXG4gICAgICAgIDE2OiBwYXJhZ3ByYWgtNFxcblxuICAgICAgICBcIlwiXCJcbiAgICAgICAgY3Vyc29yOiBbMCwgMF1cblxuICAgIGRlc2NyaWJlIFwiYXMgYSBtb3Rpb25cIiwgLT5cbiAgICAgIGl0IFwibW92ZXMgdGhlIGN1cnNvciB0byB0aGUgZW5kIG9mIHRoZSBwYXJhZ3JhcGhcIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzAsIDBdXG4gICAgICAgIGVuc3VyZSAnfScsIGN1cnNvcjogWzUsIDBdXG4gICAgICAgIGVuc3VyZSAnfScsIGN1cnNvcjogWzksIDBdXG4gICAgICAgIGVuc3VyZSAnfScsIGN1cnNvcjogWzE0LCAwXVxuICAgICAgICBlbnN1cmUgJ3snLCBjdXJzb3I6IFsxMSwgMF1cbiAgICAgICAgZW5zdXJlICd7JywgY3Vyc29yOiBbNywgMF1cbiAgICAgICAgZW5zdXJlICd7JywgY3Vyc29yOiBbMiwgMF1cblxuICAgICAgaXQgXCJzdXBwb3J0IGNvdW50XCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFswLCAwXVxuICAgICAgICBlbnN1cmUgJzMgfScsIGN1cnNvcjogWzE0LCAwXVxuICAgICAgICBlbnN1cmUgJzMgeycsIGN1cnNvcjogWzIsIDBdXG5cbiAgICAgIGl0IFwiY2FuIG1vdmUgc3RhcnQgb2YgYnVmZmVyIG9yIGVuZCBvZiBidWZmZXIgYXQgbWF4aW11bVwiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgZW5zdXJlICcxIDAgfScsIGN1cnNvcjogWzE2LCAxNF1cbiAgICAgICAgZW5zdXJlICcxIDAgeycsIGN1cnNvcjogWzAsIDBdXG5cbiAgICBkZXNjcmliZSBcImFzIGEgc2VsZWN0aW9uXCIsIC0+XG4gICAgICBpdCAnc2VsZWN0cyB0byB0aGUgZW5kIG9mIHRoZSBjdXJyZW50IHBhcmFncmFwaCcsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFszLCAzXVxuICAgICAgICBlbnN1cmUgJ3kgfScsIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiBcInBhcmFncmFwaC0xXFxuNDogcGFyYWdyYXBoLTFcXG5cIlxuICAgICAgaXQgJ3NlbGVjdHMgdG8gdGhlIGVuZCBvZiB0aGUgY3VycmVudCBwYXJhZ3JhcGgnLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbNCwgM11cbiAgICAgICAgZW5zdXJlICd5IHsnLCByZWdpc3RlcjogJ1wiJzogdGV4dDogXCJcXG4zOiBwYXJhZ3JhcGgtMVxcbjQ6IFwiXG5cbiAgZGVzY3JpYmUgXCJ0aGUgYiBrZXliaW5kaW5nXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2V0XG4gICAgICAgIHRleHRDXzogXCJcIlwiXG4gICAgICAgIF9hYiBjZGUxKy1fXG4gICAgICAgIF94eXpcblxuICAgICAgICB6aXAgfVxuICAgICAgICBffGxhc3RcbiAgICAgICAgXCJcIlwiXG5cbiAgICBkZXNjcmliZSBcImFzIGEgbW90aW9uXCIsIC0+XG4gICAgICBpdCBcIm1vdmVzIHRoZSBjdXJzb3IgdG8gdGhlIGJlZ2lubmluZyBvZiB0aGUgcHJldmlvdXMgd29yZFwiLCAtPlxuICAgICAgICBlbnN1cmUgJ2InLCB0ZXh0QzogXCIgYWIgY2RlMSstIFxcbiB4eXpcXG5cXG56aXAgfH1cXG4gbGFzdFwiXG4gICAgICAgIGVuc3VyZSAnYicsIHRleHRDOiBcIiBhYiBjZGUxKy0gXFxuIHh5elxcblxcbnx6aXAgfVxcbiBsYXN0XCJcbiAgICAgICAgZW5zdXJlICdiJywgdGV4dEM6IFwiIGFiIGNkZTErLSBcXG4geHl6XFxufFxcbnppcCB9XFxuIGxhc3RcIlxuICAgICAgICBlbnN1cmUgJ2InLCB0ZXh0QzogXCIgYWIgY2RlMSstIFxcbiB8eHl6XFxuXFxuemlwIH1cXG4gbGFzdFwiXG4gICAgICAgIGVuc3VyZSAnYicsIHRleHRDOiBcIiBhYiBjZGUxfCstIFxcbiB4eXpcXG5cXG56aXAgfVxcbiBsYXN0XCJcbiAgICAgICAgZW5zdXJlICdiJywgdGV4dEM6IFwiIGFiIHxjZGUxKy0gXFxuIHh5elxcblxcbnppcCB9XFxuIGxhc3RcIlxuICAgICAgICBlbnN1cmUgJ2InLCB0ZXh0QzogXCIgfGFiIGNkZTErLSBcXG4geHl6XFxuXFxuemlwIH1cXG4gbGFzdFwiXG5cbiAgICAgICAgIyBHbyB0byBzdGFydCBvZiB0aGUgZmlsZSwgYWZ0ZXIgbW92aW5nIHBhc3QgdGhlIGZpcnN0IHdvcmRcbiAgICAgICAgZW5zdXJlICdiJywgdGV4dEM6IFwifCBhYiBjZGUxKy0gXFxuIHh5elxcblxcbnppcCB9XFxuIGxhc3RcIlxuICAgICAgICAjIERvIG5vdGhpbmdcbiAgICAgICAgZW5zdXJlICdiJywgdGV4dEM6IFwifCBhYiBjZGUxKy0gXFxuIHh5elxcblxcbnppcCB9XFxuIGxhc3RcIlxuXG4gICAgZGVzY3JpYmUgXCJhcyBhIHNlbGVjdGlvblwiLCAtPlxuICAgICAgZGVzY3JpYmUgXCJ3aXRoaW4gYSB3b3JkXCIsIC0+XG4gICAgICAgIGl0IFwic2VsZWN0cyB0byB0aGUgYmVnaW5uaW5nIG9mIHRoZSBjdXJyZW50IHdvcmRcIiwgLT5cbiAgICAgICAgICBzZXQgdGV4dEM6IFwiIGF8YiBjZFwiOyBlbnN1cmUgJ3kgYicsIHRleHRDOiBcIiB8YWIgY2RcIiwgcmVnaXN0ZXI6ICdcIic6IHRleHQ6ICdhJ1xuXG4gICAgICBkZXNjcmliZSBcImJldHdlZW4gd29yZHNcIiwgLT5cbiAgICAgICAgaXQgXCJzZWxlY3RzIHRvIHRoZSBiZWdpbm5pbmcgb2YgdGhlIGxhc3Qgd29yZFwiLCAtPlxuICAgICAgICAgIHNldCB0ZXh0QzogXCIgYWIgfGNkXCI7IGVuc3VyZSAneSBiJywgdGV4dEM6IFwiIHxhYiBjZFwiLCByZWdpc3RlcjogJ1wiJzogdGV4dDogJ2FiICdcblxuICBkZXNjcmliZSBcInRoZSBCIGtleWJpbmRpbmdcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXRcbiAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgY2RlMSstIGFiXG4gICAgICAgICAgXFx0IHh5ei0xMjNcblxuICAgICAgICAgICB6aXBcXG5cbiAgICAgICAgICBcIlwiXCJcblxuICAgIGRlc2NyaWJlIFwiYXMgYSBtb3Rpb25cIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzQsIDBdXG5cbiAgICAgIGl0IFwibW92ZXMgdGhlIGN1cnNvciB0byB0aGUgYmVnaW5uaW5nIG9mIHRoZSBwcmV2aW91cyB3b3JkXCIsIC0+XG4gICAgICAgIGVuc3VyZSAnQicsIGN1cnNvcjogWzMsIDFdXG4gICAgICAgIGVuc3VyZSAnQicsIGN1cnNvcjogWzIsIDBdXG4gICAgICAgIGVuc3VyZSAnQicsIGN1cnNvcjogWzEsIDJdXG4gICAgICAgIGVuc3VyZSAnQicsIGN1cnNvcjogWzAsIDddXG4gICAgICAgIGVuc3VyZSAnQicsIGN1cnNvcjogWzAsIDBdXG5cbiAgICBkZXNjcmliZSBcImFzIGEgc2VsZWN0aW9uXCIsIC0+XG4gICAgICBpdCBcInNlbGVjdHMgdG8gdGhlIGJlZ2lubmluZyBvZiB0aGUgd2hvbGUgd29yZFwiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMSwgOF1cbiAgICAgICAgZW5zdXJlICd5IEInLCByZWdpc3RlcjogJ1wiJzogdGV4dDogJ3h5ei0xMicgIyBiZWNhdXNlIGN1cnNvciBpcyBvbiB0aGUgYDNgXG5cbiAgICAgIGl0IFwiZG9lc24ndCBnbyBwYXN0IHRoZSBiZWdpbm5pbmcgb2YgdGhlIGZpbGVcIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzAsIDBdLCByZWdpc3RlcjogJ1wiJzogdGV4dDogJ2FiYydcbiAgICAgICAgZW5zdXJlICd5IEInLCByZWdpc3RlcjogJ1wiJzogdGV4dDogJ2FiYydcblxuICBkZXNjcmliZSBcInRoZSBeIGtleWJpbmRpbmdcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXQgdGV4dEM6IFwifCAgYWJjZGVcIlxuXG4gICAgZGVzY3JpYmUgXCJmcm9tIHRoZSBiZWdpbm5pbmcgb2YgdGhlIGxpbmVcIiwgLT5cbiAgICAgIGRlc2NyaWJlIFwiYXMgYSBtb3Rpb25cIiwgLT5cbiAgICAgICAgaXQgXCJtb3ZlcyB0aGUgY3Vyc29yIHRvIHRoZSBmaXJzdCBjaGFyYWN0ZXIgb2YgdGhlIGxpbmVcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJ14nLCBjdXJzb3I6IFswLCAyXVxuXG4gICAgICBkZXNjcmliZSBcImFzIGEgc2VsZWN0aW9uXCIsIC0+XG4gICAgICAgIGl0ICdzZWxlY3RzIHRvIHRoZSBmaXJzdCBjaGFyYWN0ZXIgb2YgdGhlIGxpbmUnLCAtPlxuICAgICAgICAgIGVuc3VyZSAnZCBeJyxcbiAgICAgICAgICAgIHRleHQ6ICdhYmNkZSdcbiAgICAgICAgICAgIGN1cnNvcjogWzAsIDBdXG4gICAgICAgIGl0ICdzZWxlY3RzIHRvIHRoZSBmaXJzdCBjaGFyYWN0ZXIgb2YgdGhlIGxpbmUnLCAtPlxuICAgICAgICAgIGVuc3VyZSAnZCBJJywgdGV4dDogJ2FiY2RlJywgY3Vyc29yOiBbMCwgMF1cblxuICAgIGRlc2NyaWJlIFwiZnJvbSB0aGUgZmlyc3QgY2hhcmFjdGVyIG9mIHRoZSBsaW5lXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFswLCAyXVxuXG4gICAgICBkZXNjcmliZSBcImFzIGEgbW90aW9uXCIsIC0+XG4gICAgICAgIGl0IFwic3RheXMgcHV0XCIsIC0+XG4gICAgICAgICAgZW5zdXJlICdeJywgY3Vyc29yOiBbMCwgMl1cblxuICAgICAgZGVzY3JpYmUgXCJhcyBhIHNlbGVjdGlvblwiLCAtPlxuICAgICAgICBpdCBcImRvZXMgbm90aGluZ1wiLCAtPlxuICAgICAgICAgIGVuc3VyZSAnZCBeJyxcbiAgICAgICAgICAgIHRleHQ6ICcgIGFiY2RlJ1xuICAgICAgICAgICAgY3Vyc29yOiBbMCwgMl1cblxuICAgIGRlc2NyaWJlIFwiZnJvbSB0aGUgbWlkZGxlIG9mIGEgd29yZFwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMCwgNF1cblxuICAgICAgZGVzY3JpYmUgXCJhcyBhIG1vdGlvblwiLCAtPlxuICAgICAgICBpdCBcIm1vdmVzIHRoZSBjdXJzb3IgdG8gdGhlIGZpcnN0IGNoYXJhY3RlciBvZiB0aGUgbGluZVwiLCAtPlxuICAgICAgICAgIGVuc3VyZSAnXicsIGN1cnNvcjogWzAsIDJdXG5cbiAgICAgIGRlc2NyaWJlIFwiYXMgYSBzZWxlY3Rpb25cIiwgLT5cbiAgICAgICAgaXQgJ3NlbGVjdHMgdG8gdGhlIGZpcnN0IGNoYXJhY3RlciBvZiB0aGUgbGluZScsIC0+XG4gICAgICAgICAgZW5zdXJlICdkIF4nLFxuICAgICAgICAgICAgdGV4dDogJyAgY2RlJ1xuICAgICAgICAgICAgY3Vyc29yOiBbMCwgMl1cbiAgICAgICAgaXQgJ3NlbGVjdHMgdG8gdGhlIGZpcnN0IGNoYXJhY3RlciBvZiB0aGUgbGluZScsIC0+XG4gICAgICAgICAgZW5zdXJlICdkIEknLCB0ZXh0OiAnICBjZGUnLCBjdXJzb3I6IFswLCAyXSxcblxuICBkZXNjcmliZSBcInRoZSAwIGtleWJpbmRpbmdcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXQgdGV4dEM6IFwiICBhYnxjZGVcIlxuXG4gICAgZGVzY3JpYmUgXCJhcyBhIG1vdGlvblwiLCAtPlxuICAgICAgaXQgXCJtb3ZlcyB0aGUgY3Vyc29yIHRvIHRoZSBmaXJzdCBjb2x1bW5cIiwgLT5cbiAgICAgICAgZW5zdXJlICcwJywgY3Vyc29yOiBbMCwgMF1cblxuICAgIGRlc2NyaWJlIFwiYXMgYSBzZWxlY3Rpb25cIiwgLT5cbiAgICAgIGl0ICdzZWxlY3RzIHRvIHRoZSBmaXJzdCBjb2x1bW4gb2YgdGhlIGxpbmUnLCAtPlxuICAgICAgICBlbnN1cmUgJ2QgMCcsIHRleHQ6ICdjZGUnLCBjdXJzb3I6IFswLCAwXVxuXG4gIGRlc2NyaWJlIFwiZyAwLCBnIF4gYW5kIGcgJFwiLCAtPlxuICAgIGVuYWJsZVNvZnRXcmFwQW5kRW5zdXJlID0gLT5cbiAgICAgIGVkaXRvci5zZXRTb2Z0V3JhcHBlZCh0cnVlKVxuICAgICAgZXhwZWN0KGVkaXRvci5saW5lVGV4dEZvclNjcmVlblJvdygwKSkudG9CZShcIiAxMjM0NTY3XCIpXG4gICAgICBleHBlY3QoZWRpdG9yLmxpbmVUZXh0Rm9yU2NyZWVuUm93KDEpKS50b0JlKFwiIDg5QjEyMzRcIikgIyBmaXJzdCBzcGFjZSBpcyBzb2Z0d3JhcCBpbmRlbnRhdGlvblxuICAgICAgZXhwZWN0KGVkaXRvci5saW5lVGV4dEZvclNjcmVlblJvdygyKSkudG9CZShcIiA1Njc4OUMxXCIpICMgZmlyc3Qgc3BhY2UgaXMgc29mdHdyYXAgaW5kZW50YXRpb25cbiAgICAgIGV4cGVjdChlZGl0b3IubGluZVRleHRGb3JTY3JlZW5Sb3coMykpLnRvQmUoXCIgMjM0NTY3OFwiKSAjIGZpcnN0IHNwYWNlIGlzIHNvZnR3cmFwIGluZGVudGF0aW9uXG4gICAgICBleHBlY3QoZWRpdG9yLmxpbmVUZXh0Rm9yU2NyZWVuUm93KDQpKS50b0JlKFwiIDlcIikgIyBmaXJzdCBzcGFjZSBpcyBzb2Z0d3JhcCBpbmRlbnRhdGlvblxuXG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgIyBGb3JjZSBzY3JvbGxiYXJzIHRvIGJlIHZpc2libGUgcmVnYXJkbGVzcyBvZiBsb2NhbCBzeXN0ZW0gY29uZmlndXJhdGlvblxuICAgICAgc2Nyb2xsYmFyU3R5bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpXG4gICAgICBzY3JvbGxiYXJTdHlsZS50ZXh0Q29udGVudCA9ICc6Oi13ZWJraXQtc2Nyb2xsYmFyIHsgLXdlYmtpdC1hcHBlYXJhbmNlOiBub25lIH0nXG4gICAgICBqYXNtaW5lLmF0dGFjaFRvRE9NKHNjcm9sbGJhclN0eWxlKVxuXG5cbiAgICAgIHNldCB0ZXh0XzogXCJcIlwiXG4gICAgICBfMTIzNDU2Nzg5QjEyMzQ1Njc4OUMxMjM0NTY3ODlcbiAgICAgIFwiXCJcIlxuICAgICAgamFzbWluZS5hdHRhY2hUb0RPTShnZXRWaWV3KGF0b20ud29ya3NwYWNlKSlcbiAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgICBzZXRFZGl0b3JXaWR0aEluQ2hhcmFjdGVycyhlZGl0b3IsIDEwKVxuXG4gICAgZGVzY3JpYmUgXCJ0aGUgZyAwIGtleWJpbmRpbmdcIiwgLT5cbiAgICAgIGRlc2NyaWJlIFwiYWxsb3dNb3ZlVG9PZmZTY3JlZW5Db2x1bW5PblNjcmVlbkxpbmVNb3Rpb24gPSB0cnVlKGRlZmF1bHQpXCIsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT4gc2V0dGluZ3Muc2V0KCdhbGxvd01vdmVUb09mZlNjcmVlbkNvbHVtbk9uU2NyZWVuTGluZU1vdGlvbicsIHRydWUpXG5cbiAgICAgICAgZGVzY3JpYmUgXCJzb2Z0d3JhcCA9IGZhbHNlLCBmaXJzdENvbHVtbklzVmlzaWJsZSA9IHRydWVcIiwgLT5cbiAgICAgICAgICBiZWZvcmVFYWNoIC0+IHNldCBjdXJzb3I6IFswLCAzXVxuICAgICAgICAgIGl0IFwibW92ZSB0byBjb2x1bW4gMCBvZiBzY3JlZW4gbGluZVwiLCAtPiBlbnN1cmUgXCJnIDBcIiwgY3Vyc29yOiBbMCwgMF1cblxuICAgICAgICBkZXNjcmliZSBcInNvZnR3cmFwID0gZmFsc2UsIGZpcnN0Q29sdW1uSXNWaXNpYmxlID0gZmFsc2VcIiwgLT5cbiAgICAgICAgICBiZWZvcmVFYWNoIC0+IHNldCBjdXJzb3I6IFswLCAxNV07IGVkaXRvci5zZXRGaXJzdFZpc2libGVTY3JlZW5Db2x1bW4oMTApXG4gICAgICAgICAgaXQgXCJtb3ZlIHRvIGNvbHVtbiAwIG9mIHNjcmVlbiBsaW5lXCIsIC0+IGVuc3VyZSBcImcgMFwiLCBjdXJzb3I6IFswLCAwXVxuXG4gICAgICAgIGRlc2NyaWJlIFwic29mdHdyYXAgPSB0cnVlXCIsIC0+XG4gICAgICAgICAgYmVmb3JlRWFjaCAtPiBlbmFibGVTb2Z0V3JhcEFuZEVuc3VyZSgpXG4gICAgICAgICAgaXQgXCJtb3ZlIHRvIGNvbHVtbiAwIG9mIHNjcmVlbiBsaW5lXCIsIC0+XG4gICAgICAgICAgICBzZXQgY3Vyc29yU2NyZWVuOiBbMCwgM107IGVuc3VyZSBcImcgMFwiLCBjdXJzb3JTY3JlZW46IFswLCAwXVxuICAgICAgICAgICAgc2V0IGN1cnNvclNjcmVlbjogWzEsIDNdOyBlbnN1cmUgXCJnIDBcIiwgY3Vyc29yU2NyZWVuOiBbMSwgMV0gIyBza2lwIHNvZnR3cmFwIGluZGVudGF0aW9uLlxuXG4gICAgICBkZXNjcmliZSBcImFsbG93TW92ZVRvT2ZmU2NyZWVuQ29sdW1uT25TY3JlZW5MaW5lTW90aW9uID0gZmFsc2VcIiwgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPiBzZXR0aW5ncy5zZXQoJ2FsbG93TW92ZVRvT2ZmU2NyZWVuQ29sdW1uT25TY3JlZW5MaW5lTW90aW9uJywgZmFsc2UpXG5cbiAgICAgICAgZGVzY3JpYmUgXCJzb2Z0d3JhcCA9IGZhbHNlLCBmaXJzdENvbHVtbklzVmlzaWJsZSA9IHRydWVcIiwgLT5cbiAgICAgICAgICBiZWZvcmVFYWNoIC0+IHNldCBjdXJzb3I6IFswLCAzXVxuICAgICAgICAgIGl0IFwibW92ZSB0byBjb2x1bW4gMCBvZiBzY3JlZW4gbGluZVwiLCAtPiBlbnN1cmUgXCJnIDBcIiwgY3Vyc29yOiBbMCwgMF1cblxuICAgICAgICBkZXNjcmliZSBcInNvZnR3cmFwID0gZmFsc2UsIGZpcnN0Q29sdW1uSXNWaXNpYmxlID0gZmFsc2VcIiwgLT5cbiAgICAgICAgICBiZWZvcmVFYWNoIC0+IHNldCBjdXJzb3I6IFswLCAxNV07IGVkaXRvci5zZXRGaXJzdFZpc2libGVTY3JlZW5Db2x1bW4oMTApXG4gICAgICAgICAgaXQgXCJtb3ZlIHRvIGZpcnN0IHZpc2libGUgY29sdW0gb2Ygc2NyZWVuIGxpbmVcIiwgLT4gZW5zdXJlIFwiZyAwXCIsIGN1cnNvcjogWzAsIDEwXVxuXG4gICAgICAgIGRlc2NyaWJlIFwic29mdHdyYXAgPSB0cnVlXCIsIC0+XG4gICAgICAgICAgYmVmb3JlRWFjaCAtPiBlbmFibGVTb2Z0V3JhcEFuZEVuc3VyZSgpXG4gICAgICAgICAgaXQgXCJtb3ZlIHRvIGNvbHVtbiAwIG9mIHNjcmVlbiBsaW5lXCIsIC0+XG4gICAgICAgICAgICBzZXQgY3Vyc29yU2NyZWVuOiBbMCwgM107IGVuc3VyZSBcImcgMFwiLCBjdXJzb3JTY3JlZW46IFswLCAwXVxuICAgICAgICAgICAgc2V0IGN1cnNvclNjcmVlbjogWzEsIDNdOyBlbnN1cmUgXCJnIDBcIiwgY3Vyc29yU2NyZWVuOiBbMSwgMV0gIyBza2lwIHNvZnR3cmFwIGluZGVudGF0aW9uLlxuXG4gICAgZGVzY3JpYmUgXCJ0aGUgZyBeIGtleWJpbmRpbmdcIiwgLT5cbiAgICAgIGRlc2NyaWJlIFwiYWxsb3dNb3ZlVG9PZmZTY3JlZW5Db2x1bW5PblNjcmVlbkxpbmVNb3Rpb24gPSB0cnVlKGRlZmF1bHQpXCIsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT4gc2V0dGluZ3Muc2V0KCdhbGxvd01vdmVUb09mZlNjcmVlbkNvbHVtbk9uU2NyZWVuTGluZU1vdGlvbicsIHRydWUpXG5cbiAgICAgICAgZGVzY3JpYmUgXCJzb2Z0d3JhcCA9IGZhbHNlLCBmaXJzdENvbHVtbklzVmlzaWJsZSA9IHRydWVcIiwgLT5cbiAgICAgICAgICBiZWZvcmVFYWNoIC0+IHNldCBjdXJzb3I6IFswLCAzXVxuICAgICAgICAgIGl0IFwibW92ZSB0byBmaXJzdC1jaGFyIG9mIHNjcmVlbiBsaW5lXCIsIC0+IGVuc3VyZSBcImcgXlwiLCBjdXJzb3I6IFswLCAxXVxuXG4gICAgICAgIGRlc2NyaWJlIFwic29mdHdyYXAgPSBmYWxzZSwgZmlyc3RDb2x1bW5Jc1Zpc2libGUgPSBmYWxzZVwiLCAtPlxuICAgICAgICAgIGJlZm9yZUVhY2ggLT4gc2V0IGN1cnNvcjogWzAsIDE1XTsgZWRpdG9yLnNldEZpcnN0VmlzaWJsZVNjcmVlbkNvbHVtbigxMClcbiAgICAgICAgICBpdCBcIm1vdmUgdG8gZmlyc3QtY2hhciBvZiBzY3JlZW4gbGluZVwiLCAtPiBlbnN1cmUgXCJnIF5cIiwgY3Vyc29yOiBbMCwgMV1cblxuICAgICAgICBkZXNjcmliZSBcInNvZnR3cmFwID0gdHJ1ZVwiLCAtPlxuICAgICAgICAgIGJlZm9yZUVhY2ggLT4gZW5hYmxlU29mdFdyYXBBbmRFbnN1cmUoKVxuICAgICAgICAgIGl0IFwibW92ZSB0byBmaXJzdC1jaGFyIG9mIHNjcmVlbiBsaW5lXCIsIC0+XG4gICAgICAgICAgICBzZXQgY3Vyc29yU2NyZWVuOiBbMCwgM107IGVuc3VyZSBcImcgXlwiLCBjdXJzb3JTY3JlZW46IFswLCAxXVxuICAgICAgICAgICAgc2V0IGN1cnNvclNjcmVlbjogWzEsIDNdOyBlbnN1cmUgXCJnIF5cIiwgY3Vyc29yU2NyZWVuOiBbMSwgMV0gIyBza2lwIHNvZnR3cmFwIGluZGVudGF0aW9uLlxuXG4gICAgICBkZXNjcmliZSBcImFsbG93TW92ZVRvT2ZmU2NyZWVuQ29sdW1uT25TY3JlZW5MaW5lTW90aW9uID0gZmFsc2VcIiwgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPiBzZXR0aW5ncy5zZXQoJ2FsbG93TW92ZVRvT2ZmU2NyZWVuQ29sdW1uT25TY3JlZW5MaW5lTW90aW9uJywgZmFsc2UpXG5cbiAgICAgICAgZGVzY3JpYmUgXCJzb2Z0d3JhcCA9IGZhbHNlLCBmaXJzdENvbHVtbklzVmlzaWJsZSA9IHRydWVcIiwgLT5cbiAgICAgICAgICBiZWZvcmVFYWNoIC0+IHNldCBjdXJzb3I6IFswLCAzXVxuICAgICAgICAgIGl0IFwibW92ZSB0byBmaXJzdC1jaGFyIG9mIHNjcmVlbiBsaW5lXCIsIC0+IGVuc3VyZSBcImcgXlwiLCBjdXJzb3I6IFswLCAxXVxuXG4gICAgICAgIGRlc2NyaWJlIFwic29mdHdyYXAgPSBmYWxzZSwgZmlyc3RDb2x1bW5Jc1Zpc2libGUgPSBmYWxzZVwiLCAtPlxuICAgICAgICAgIGJlZm9yZUVhY2ggLT4gc2V0IGN1cnNvcjogWzAsIDE1XTsgZWRpdG9yLnNldEZpcnN0VmlzaWJsZVNjcmVlbkNvbHVtbigxMClcbiAgICAgICAgICBpdCBcIm1vdmUgdG8gZmlyc3QtY2hhciBvZiBzY3JlZW4gbGluZVwiLCAtPiBlbnN1cmUgXCJnIF5cIiwgY3Vyc29yOiBbMCwgMTBdXG5cbiAgICAgICAgZGVzY3JpYmUgXCJzb2Z0d3JhcCA9IHRydWVcIiwgLT5cbiAgICAgICAgICBiZWZvcmVFYWNoIC0+IGVuYWJsZVNvZnRXcmFwQW5kRW5zdXJlKClcbiAgICAgICAgICBpdCBcIm1vdmUgdG8gZmlyc3QtY2hhciBvZiBzY3JlZW4gbGluZVwiLCAtPlxuICAgICAgICAgICAgc2V0IGN1cnNvclNjcmVlbjogWzAsIDNdOyBlbnN1cmUgXCJnIF5cIiwgY3Vyc29yU2NyZWVuOiBbMCwgMV1cbiAgICAgICAgICAgIHNldCBjdXJzb3JTY3JlZW46IFsxLCAzXTsgZW5zdXJlIFwiZyBeXCIsIGN1cnNvclNjcmVlbjogWzEsIDFdICMgc2tpcCBzb2Z0d3JhcCBpbmRlbnRhdGlvbi5cblxuICAgIGRlc2NyaWJlIFwidGhlIGcgJCBrZXliaW5kaW5nXCIsIC0+XG4gICAgICBkZXNjcmliZSBcImFsbG93TW92ZVRvT2ZmU2NyZWVuQ29sdW1uT25TY3JlZW5MaW5lTW90aW9uID0gdHJ1ZShkZWZhdWx0KVwiLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+IHNldHRpbmdzLnNldCgnYWxsb3dNb3ZlVG9PZmZTY3JlZW5Db2x1bW5PblNjcmVlbkxpbmVNb3Rpb24nLCB0cnVlKVxuXG4gICAgICAgIGRlc2NyaWJlIFwic29mdHdyYXAgPSBmYWxzZSwgbGFzdENvbHVtbklzVmlzaWJsZSA9IHRydWVcIiwgLT5cbiAgICAgICAgICBiZWZvcmVFYWNoIC0+IHNldCBjdXJzb3I6IFswLCAyN11cbiAgICAgICAgICBpdCBcIm1vdmUgdG8gbGFzdC1jaGFyIG9mIHNjcmVlbiBsaW5lXCIsIC0+IGVuc3VyZSBcImcgJFwiLCBjdXJzb3I6IFswLCAyOV1cblxuICAgICAgICBkZXNjcmliZSBcInNvZnR3cmFwID0gZmFsc2UsIGxhc3RDb2x1bW5Jc1Zpc2libGUgPSBmYWxzZVwiLCAtPlxuICAgICAgICAgIGJlZm9yZUVhY2ggLT4gc2V0IGN1cnNvcjogWzAsIDE1XTsgZWRpdG9yLnNldEZpcnN0VmlzaWJsZVNjcmVlbkNvbHVtbigxMClcbiAgICAgICAgICBpdCBcIm1vdmUgdG8gbGFzdC1jaGFyIG9mIHNjcmVlbiBsaW5lXCIsIC0+IGVuc3VyZSBcImcgJFwiLCBjdXJzb3I6IFswLCAyOV1cblxuICAgICAgICBkZXNjcmliZSBcInNvZnR3cmFwID0gdHJ1ZVwiLCAtPlxuICAgICAgICAgIGJlZm9yZUVhY2ggLT4gZW5hYmxlU29mdFdyYXBBbmRFbnN1cmUoKVxuICAgICAgICAgIGl0IFwibW92ZSB0byBsYXN0LWNoYXIgb2Ygc2NyZWVuIGxpbmVcIiwgLT5cbiAgICAgICAgICAgIHNldCBjdXJzb3JTY3JlZW46IFswLCAzXTsgZW5zdXJlIFwiZyAkXCIsIGN1cnNvclNjcmVlbjogWzAsIDddXG4gICAgICAgICAgICBzZXQgY3Vyc29yU2NyZWVuOiBbMSwgM107IGVuc3VyZSBcImcgJFwiLCBjdXJzb3JTY3JlZW46IFsxLCA3XVxuXG4gICAgICBkZXNjcmliZSBcImFsbG93TW92ZVRvT2ZmU2NyZWVuQ29sdW1uT25TY3JlZW5MaW5lTW90aW9uID0gZmFsc2VcIiwgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPiBzZXR0aW5ncy5zZXQoJ2FsbG93TW92ZVRvT2ZmU2NyZWVuQ29sdW1uT25TY3JlZW5MaW5lTW90aW9uJywgZmFsc2UpXG5cbiAgICAgICAgZGVzY3JpYmUgXCJzb2Z0d3JhcCA9IGZhbHNlLCBsYXN0Q29sdW1uSXNWaXNpYmxlID0gdHJ1ZVwiLCAtPlxuICAgICAgICAgIGJlZm9yZUVhY2ggLT4gc2V0IGN1cnNvcjogWzAsIDI3XVxuICAgICAgICAgIGl0IFwibW92ZSB0byBsYXN0LWNoYXIgb2Ygc2NyZWVuIGxpbmVcIiwgLT4gZW5zdXJlIFwiZyAkXCIsIGN1cnNvcjogWzAsIDI5XVxuXG4gICAgICAgIGRlc2NyaWJlIFwic29mdHdyYXAgPSBmYWxzZSwgbGFzdENvbHVtbklzVmlzaWJsZSA9IGZhbHNlXCIsIC0+XG4gICAgICAgICAgYmVmb3JlRWFjaCAtPiBzZXQgY3Vyc29yOiBbMCwgMTVdOyBlZGl0b3Iuc2V0Rmlyc3RWaXNpYmxlU2NyZWVuQ29sdW1uKDEwKVxuICAgICAgICAgIGl0IFwibW92ZSB0byBsYXN0LWNoYXIgaW4gdmlzaWJsZSBzY3JlZW4gbGluZVwiLCAtPiBlbnN1cmUgXCJnICRcIiwgY3Vyc29yOiBbMCwgMThdXG5cbiAgICAgICAgZGVzY3JpYmUgXCJzb2Z0d3JhcCA9IHRydWVcIiwgLT5cbiAgICAgICAgICBiZWZvcmVFYWNoIC0+IGVuYWJsZVNvZnRXcmFwQW5kRW5zdXJlKClcbiAgICAgICAgICBpdCBcIm1vdmUgdG8gbGFzdC1jaGFyIG9mIHNjcmVlbiBsaW5lXCIsIC0+XG4gICAgICAgICAgICBzZXQgY3Vyc29yU2NyZWVuOiBbMCwgM107IGVuc3VyZSBcImcgJFwiLCBjdXJzb3JTY3JlZW46IFswLCA3XVxuICAgICAgICAgICAgc2V0IGN1cnNvclNjcmVlbjogWzEsIDNdOyBlbnN1cmUgXCJnICRcIiwgY3Vyc29yU2NyZWVuOiBbMSwgN11cblxuICBkZXNjcmliZSBcInRoZSB8IGtleWJpbmRpbmdcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXQgdGV4dDogXCIgIGFiY2RlXCIsIGN1cnNvcjogWzAsIDRdXG5cbiAgICBkZXNjcmliZSBcImFzIGEgbW90aW9uXCIsIC0+XG4gICAgICBpdCBcIm1vdmVzIHRoZSBjdXJzb3IgdG8gdGhlIG51bWJlciBjb2x1bW5cIiwgLT5cbiAgICAgICAgZW5zdXJlICd8JywgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgZW5zdXJlICcxIHwnLCBjdXJzb3I6IFswLCAwXVxuICAgICAgICBlbnN1cmUgJzMgfCcsIGN1cnNvcjogWzAsIDJdXG4gICAgICAgIGVuc3VyZSAnNCB8JywgY3Vyc29yOiBbMCwgM11cblxuICAgIGRlc2NyaWJlIFwiYXMgb3BlcmF0b3IncyB0YXJnZXRcIiwgLT5cbiAgICAgIGl0ICdiZWhhdmUgZXhjbHVzaXZlbHknLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgZW5zdXJlICdkIDQgfCcsIHRleHQ6ICdiY2RlJywgY3Vyc29yOiBbMCwgMF1cblxuICBkZXNjcmliZSBcInRoZSAkIGtleWJpbmRpbmdcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXRcbiAgICAgICAgdGV4dDogXCIgIGFiY2RlXFxuXFxuMTIzNDU2Nzg5MFwiXG4gICAgICAgIGN1cnNvcjogWzAsIDRdXG5cbiAgICBkZXNjcmliZSBcImFzIGEgbW90aW9uIGZyb20gZW1wdHkgbGluZVwiLCAtPlxuICAgICAgaXQgXCJtb3ZlcyB0aGUgY3Vyc29yIHRvIHRoZSBlbmQgb2YgdGhlIGxpbmVcIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzEsIDBdXG4gICAgICAgIGVuc3VyZSAnJCcsIGN1cnNvcjogWzEsIDBdXG5cbiAgICBkZXNjcmliZSBcImFzIGEgbW90aW9uXCIsIC0+XG4gICAgICAjIEZJWE1FOiBTZWUgYXRvbS92aW0tbW9kZSMyXG4gICAgICBpdCBcIm1vdmVzIHRoZSBjdXJzb3IgdG8gdGhlIGVuZCBvZiB0aGUgbGluZVwiLCAtPlxuICAgICAgICBlbnN1cmUgJyQnLCBjdXJzb3I6IFswLCA2XVxuXG4gICAgICBpdCBcInNldCBnb2FsQ29sdW1uIEluZmluaXR5XCIsIC0+XG4gICAgICAgIGV4cGVjdChlZGl0b3IuZ2V0TGFzdEN1cnNvcigpLmdvYWxDb2x1bW4pLnRvQmUobnVsbClcbiAgICAgICAgZW5zdXJlICckJywgY3Vyc29yOiBbMCwgNl1cbiAgICAgICAgZXhwZWN0KGVkaXRvci5nZXRMYXN0Q3Vyc29yKCkuZ29hbENvbHVtbikudG9CZShJbmZpbml0eSlcblxuICAgICAgaXQgXCJzaG91bGQgcmVtYWluIGluIHRoZSBsYXN0IGNvbHVtbiB3aGVuIG1vdmluZyBkb3duXCIsIC0+XG4gICAgICAgIGVuc3VyZSAnJCBqJywgY3Vyc29yOiBbMSwgMF1cbiAgICAgICAgZW5zdXJlICdqJywgY3Vyc29yOiBbMiwgOV1cblxuICAgICAgaXQgXCJzdXBwb3J0IGNvdW50XCIsIC0+XG4gICAgICAgIGVuc3VyZSAnMyAkJywgY3Vyc29yOiBbMiwgOV1cblxuICAgIGRlc2NyaWJlIFwiYXMgYSBzZWxlY3Rpb25cIiwgLT5cbiAgICAgIGl0IFwic2VsZWN0cyB0byB0aGUgZW5kIG9mIHRoZSBsaW5lc1wiLCAtPlxuICAgICAgICBlbnN1cmUgJ2QgJCcsXG4gICAgICAgICAgdGV4dDogXCIgIGFiXFxuXFxuMTIzNDU2Nzg5MFwiXG4gICAgICAgICAgY3Vyc29yOiBbMCwgM11cblxuICBkZXNjcmliZSBcInRoZSAtIGtleWJpbmRpbmdcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXQgdGV4dDogXCJcIlwiXG4gICAgICAgIGFiY2RlZmdcbiAgICAgICAgICBhYmNcbiAgICAgICAgICBhYmNcXG5cbiAgICAgICAgXCJcIlwiXG5cbiAgICBkZXNjcmliZSBcImZyb20gdGhlIG1pZGRsZSBvZiBhIGxpbmVcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzEsIDNdXG4gICAgICBkZXNjcmliZSBcImFzIGEgbW90aW9uXCIsIC0+XG4gICAgICAgIGl0IFwibW92ZXMgdGhlIGN1cnNvciB0byB0aGUgbGFzdCBjaGFyYWN0ZXIgb2YgdGhlIHByZXZpb3VzIGxpbmVcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJy0nLCBjdXJzb3I6IFswLCAwXVxuXG4gICAgICBkZXNjcmliZSBcImFzIGEgc2VsZWN0aW9uXCIsIC0+XG4gICAgICAgIGl0IFwiZGVsZXRlcyB0aGUgY3VycmVudCBhbmQgcHJldmlvdXMgbGluZVwiLCAtPlxuICAgICAgICAgIGVuc3VyZSAnZCAtJywgdGV4dDogXCIgIGFiY1xcblwiLCBjdXJzb3I6IFswLCAyXVxuXG4gICAgZGVzY3JpYmUgXCJmcm9tIHRoZSBmaXJzdCBjaGFyYWN0ZXIgb2YgYSBsaW5lIGluZGVudGVkIHRoZSBzYW1lIGFzIHRoZSBwcmV2aW91cyBvbmVcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzIsIDJdXG5cbiAgICAgIGRlc2NyaWJlIFwiYXMgYSBtb3Rpb25cIiwgLT5cbiAgICAgICAgaXQgXCJtb3ZlcyB0byB0aGUgZmlyc3QgY2hhcmFjdGVyIG9mIHRoZSBwcmV2aW91cyBsaW5lIChkaXJlY3RseSBhYm92ZSlcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJy0nLCBjdXJzb3I6IFsxLCAyXVxuXG4gICAgICBkZXNjcmliZSBcImFzIGEgc2VsZWN0aW9uXCIsIC0+XG4gICAgICAgIGl0IFwic2VsZWN0cyB0byB0aGUgZmlyc3QgY2hhcmFjdGVyIG9mIHRoZSBwcmV2aW91cyBsaW5lIChkaXJlY3RseSBhYm92ZSlcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJ2QgLScsIHRleHQ6IFwiYWJjZGVmZ1xcblwiXG4gICAgICAgICAgIyBGSVhNRSBjb21tZW50ZWQgb3V0IGJlY2F1c2UgdGhlIGNvbHVtbiBpcyB3cm9uZyBkdWUgdG8gYSBidWcgaW4gYGtgOyByZS1lbmFibGUgd2hlbiBga2AgaXMgZml4ZWRcbiAgICAgICAgICAjIGVuc3VyZSBjdXJzb3I6IFswLCAyXVxuXG4gICAgZGVzY3JpYmUgXCJmcm9tIHRoZSBiZWdpbm5pbmcgb2YgYSBsaW5lIHByZWNlZGVkIGJ5IGFuIGluZGVudGVkIGxpbmVcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzIsIDBdXG5cbiAgICAgIGRlc2NyaWJlIFwiYXMgYSBtb3Rpb25cIiwgLT5cbiAgICAgICAgaXQgXCJtb3ZlcyB0aGUgY3Vyc29yIHRvIHRoZSBmaXJzdCBjaGFyYWN0ZXIgb2YgdGhlIHByZXZpb3VzIGxpbmVcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJy0nLCBjdXJzb3I6IFsxLCAyXVxuXG4gICAgICBkZXNjcmliZSBcImFzIGEgc2VsZWN0aW9uXCIsIC0+XG4gICAgICAgIGl0IFwic2VsZWN0cyB0byB0aGUgZmlyc3QgY2hhcmFjdGVyIG9mIHRoZSBwcmV2aW91cyBsaW5lXCIsIC0+XG4gICAgICAgICAgZW5zdXJlICdkIC0nLCB0ZXh0OiBcImFiY2RlZmdcXG5cIlxuXG4gICAgZGVzY3JpYmUgXCJ3aXRoIGEgY291bnRcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dDogXCIxXFxuMlxcbjNcXG40XFxuNVxcbjZcXG5cIlxuICAgICAgICAgIGN1cnNvcjogWzQsIDBdXG5cbiAgICAgIGRlc2NyaWJlIFwiYXMgYSBtb3Rpb25cIiwgLT5cbiAgICAgICAgaXQgXCJtb3ZlcyB0aGUgY3Vyc29yIHRvIHRoZSBmaXJzdCBjaGFyYWN0ZXIgb2YgdGhhdCBtYW55IGxpbmVzIHByZXZpb3VzXCIsIC0+XG4gICAgICAgICAgZW5zdXJlICczIC0nLCBjdXJzb3I6IFsxLCAwXVxuXG4gICAgICBkZXNjcmliZSBcImFzIGEgc2VsZWN0aW9uXCIsIC0+XG4gICAgICAgIGl0IFwiZGVsZXRlcyB0aGUgY3VycmVudCBsaW5lIHBsdXMgdGhhdCBtYW55IHByZXZpb3VzIGxpbmVzXCIsIC0+XG4gICAgICAgICAgZW5zdXJlICdkIDMgLScsXG4gICAgICAgICAgICB0ZXh0OiBcIjFcXG42XFxuXCIsXG4gICAgICAgICAgICBjdXJzb3I6IFsxLCAwXSxcblxuICBkZXNjcmliZSBcInRoZSArIGtleWJpbmRpbmdcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXQgdGV4dF86IFwiXCJcIlxuICAgICAgX19hYmNcbiAgICAgIF9fYWJjXG4gICAgICBhYmNkZWZnXFxuXG4gICAgICBcIlwiXCJcblxuICAgIGRlc2NyaWJlIFwiZnJvbSB0aGUgbWlkZGxlIG9mIGEgbGluZVwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMSwgM11cblxuICAgICAgZGVzY3JpYmUgXCJhcyBhIG1vdGlvblwiLCAtPlxuICAgICAgICBpdCBcIm1vdmVzIHRoZSBjdXJzb3IgdG8gdGhlIGZpcnN0IGNoYXJhY3RlciBvZiB0aGUgbmV4dCBsaW5lXCIsIC0+XG4gICAgICAgICAgZW5zdXJlICcrJywgY3Vyc29yOiBbMiwgMF1cblxuICAgICAgZGVzY3JpYmUgXCJhcyBhIHNlbGVjdGlvblwiLCAtPlxuICAgICAgICBpdCBcImRlbGV0ZXMgdGhlIGN1cnJlbnQgYW5kIG5leHQgbGluZVwiLCAtPlxuICAgICAgICAgIGVuc3VyZSAnZCArJywgdGV4dDogXCIgIGFiY1xcblwiXG5cbiAgICBkZXNjcmliZSBcImZyb20gdGhlIGZpcnN0IGNoYXJhY3RlciBvZiBhIGxpbmUgaW5kZW50ZWQgdGhlIHNhbWUgYXMgdGhlIG5leHQgb25lXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+IHNldCBjdXJzb3I6IFswLCAyXVxuXG4gICAgICBkZXNjcmliZSBcImFzIGEgbW90aW9uXCIsIC0+XG4gICAgICAgIGl0IFwibW92ZXMgdG8gdGhlIGZpcnN0IGNoYXJhY3RlciBvZiB0aGUgbmV4dCBsaW5lIChkaXJlY3RseSBiZWxvdylcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJysnLCBjdXJzb3I6IFsxLCAyXVxuXG4gICAgICBkZXNjcmliZSBcImFzIGEgc2VsZWN0aW9uXCIsIC0+XG4gICAgICAgIGl0IFwic2VsZWN0cyB0byB0aGUgZmlyc3QgY2hhcmFjdGVyIG9mIHRoZSBuZXh0IGxpbmUgKGRpcmVjdGx5IGJlbG93KVwiLCAtPlxuICAgICAgICAgIGVuc3VyZSAnZCArJywgdGV4dDogXCJhYmNkZWZnXFxuXCJcblxuICAgIGRlc2NyaWJlIFwiZnJvbSB0aGUgYmVnaW5uaW5nIG9mIGEgbGluZSBmb2xsb3dlZCBieSBhbiBpbmRlbnRlZCBsaW5lXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+IHNldCBjdXJzb3I6IFswLCAwXVxuXG4gICAgICBkZXNjcmliZSBcImFzIGEgbW90aW9uXCIsIC0+XG4gICAgICAgIGl0IFwibW92ZXMgdGhlIGN1cnNvciB0byB0aGUgZmlyc3QgY2hhcmFjdGVyIG9mIHRoZSBuZXh0IGxpbmVcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJysnLCBjdXJzb3I6IFsxLCAyXVxuXG4gICAgICBkZXNjcmliZSBcImFzIGEgc2VsZWN0aW9uXCIsIC0+XG4gICAgICAgIGl0IFwic2VsZWN0cyB0byB0aGUgZmlyc3QgY2hhcmFjdGVyIG9mIHRoZSBuZXh0IGxpbmVcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJ2QgKycsXG4gICAgICAgICAgICB0ZXh0OiBcImFiY2RlZmdcXG5cIlxuICAgICAgICAgICAgY3Vyc29yOiBbMCwgMF1cblxuICAgIGRlc2NyaWJlIFwid2l0aCBhIGNvdW50XCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHQ6IFwiMVxcbjJcXG4zXFxuNFxcbjVcXG42XFxuXCJcbiAgICAgICAgICBjdXJzb3I6IFsxLCAwXVxuXG4gICAgICBkZXNjcmliZSBcImFzIGEgbW90aW9uXCIsIC0+XG4gICAgICAgIGl0IFwibW92ZXMgdGhlIGN1cnNvciB0byB0aGUgZmlyc3QgY2hhcmFjdGVyIG9mIHRoYXQgbWFueSBsaW5lcyBmb2xsb3dpbmdcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJzMgKycsIGN1cnNvcjogWzQsIDBdXG5cbiAgICAgIGRlc2NyaWJlIFwiYXMgYSBzZWxlY3Rpb25cIiwgLT5cbiAgICAgICAgaXQgXCJkZWxldGVzIHRoZSBjdXJyZW50IGxpbmUgcGx1cyB0aGF0IG1hbnkgZm9sbG93aW5nIGxpbmVzXCIsIC0+XG4gICAgICAgICAgZW5zdXJlICdkIDMgKycsXG4gICAgICAgICAgICB0ZXh0OiBcIjFcXG42XFxuXCJcbiAgICAgICAgICAgIGN1cnNvcjogWzEsIDBdXG5cbiAgZGVzY3JpYmUgXCJ0aGUgXyBrZXliaW5kaW5nXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2V0IHRleHRfOiBcIlwiXCJcbiAgICAgICAgX19hYmNcbiAgICAgICAgX19hYmNcbiAgICAgICAgYWJjZGVmZ1xcblxuICAgICAgICBcIlwiXCJcblxuICAgIGRlc2NyaWJlIFwiZnJvbSB0aGUgbWlkZGxlIG9mIGEgbGluZVwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPiBzZXQgY3Vyc29yOiBbMSwgM11cblxuICAgICAgZGVzY3JpYmUgXCJhcyBhIG1vdGlvblwiLCAtPlxuICAgICAgICBpdCBcIm1vdmVzIHRoZSBjdXJzb3IgdG8gdGhlIGZpcnN0IGNoYXJhY3RlciBvZiB0aGUgY3VycmVudCBsaW5lXCIsIC0+XG4gICAgICAgICAgZW5zdXJlICdfJywgY3Vyc29yOiBbMSwgMl1cblxuICAgICAgZGVzY3JpYmUgXCJhcyBhIHNlbGVjdGlvblwiLCAtPlxuICAgICAgICBpdCBcImRlbGV0ZXMgdGhlIGN1cnJlbnQgbGluZVwiLCAtPlxuICAgICAgICAgIGVuc3VyZSAnZCBfJyxcbiAgICAgICAgICAgIHRleHRfOiBcIlwiXCJcbiAgICAgICAgICAgIF9fYWJjXG4gICAgICAgICAgICBhYmNkZWZnXFxuXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgIGN1cnNvcjogWzEsIDBdXG5cbiAgICBkZXNjcmliZSBcIndpdGggYSBjb3VudFwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0OiBcIjFcXG4yXFxuM1xcbjRcXG41XFxuNlxcblwiXG4gICAgICAgICAgY3Vyc29yOiBbMSwgMF1cblxuICAgICAgZGVzY3JpYmUgXCJhcyBhIG1vdGlvblwiLCAtPlxuICAgICAgICBpdCBcIm1vdmVzIHRoZSBjdXJzb3IgdG8gdGhlIGZpcnN0IGNoYXJhY3RlciBvZiB0aGF0IG1hbnkgbGluZXMgZm9sbG93aW5nXCIsIC0+XG4gICAgICAgICAgZW5zdXJlICczIF8nLCBjdXJzb3I6IFszLCAwXVxuXG4gICAgICBkZXNjcmliZSBcImFzIGEgc2VsZWN0aW9uXCIsIC0+XG4gICAgICAgIGl0IFwiZGVsZXRlcyB0aGUgY3VycmVudCBsaW5lIHBsdXMgdGhhdCBtYW55IGZvbGxvd2luZyBsaW5lc1wiLCAtPlxuICAgICAgICAgIGVuc3VyZSAnZCAzIF8nLFxuICAgICAgICAgICAgdGV4dDogXCIxXFxuNVxcbjZcXG5cIlxuICAgICAgICAgICAgY3Vyc29yOiBbMSwgMF1cblxuICBkZXNjcmliZSBcInRoZSBlbnRlciBrZXliaW5kaW5nXCIsIC0+XG4gICAgIyBbRklYTUVdIERpcnR5IHRlc3QsIHdoYXRzIHRoaXMhP1xuICAgIHN0YXJ0aW5nVGV4dCA9IFwiICBhYmNcXG4gIGFiY1xcbmFiY2RlZmdcXG5cIlxuXG4gICAgZGVzY3JpYmUgXCJmcm9tIHRoZSBtaWRkbGUgb2YgYSBsaW5lXCIsIC0+XG4gICAgICBzdGFydGluZ0N1cnNvclBvc2l0aW9uID0gWzEsIDNdXG5cbiAgICAgIGRlc2NyaWJlIFwiYXMgYSBtb3Rpb25cIiwgLT5cbiAgICAgICAgaXQgXCJhY3RzIHRoZSBzYW1lIGFzIHRoZSArIGtleWJpbmRpbmdcIiwgLT5cbiAgICAgICAgICAjIGRvIGl0IHdpdGggKyBhbmQgc2F2ZSB0aGUgcmVzdWx0c1xuICAgICAgICAgIHNldFxuICAgICAgICAgICAgdGV4dDogc3RhcnRpbmdUZXh0XG4gICAgICAgICAgICBjdXJzb3I6IHN0YXJ0aW5nQ3Vyc29yUG9zaXRpb25cbiAgICAgICAgICBrZXlzdHJva2UgJysnXG4gICAgICAgICAgcmVmZXJlbmNlQ3Vyc29yUG9zaXRpb24gPSBlZGl0b3IuZ2V0Q3Vyc29yU2NyZWVuUG9zaXRpb24oKVxuICAgICAgICAgIHNldFxuICAgICAgICAgICAgdGV4dDogc3RhcnRpbmdUZXh0XG4gICAgICAgICAgICBjdXJzb3I6IHN0YXJ0aW5nQ3Vyc29yUG9zaXRpb25cbiAgICAgICAgICBlbnN1cmUgJ2VudGVyJyxcbiAgICAgICAgICAgIGN1cnNvcjogcmVmZXJlbmNlQ3Vyc29yUG9zaXRpb25cblxuICAgICAgZGVzY3JpYmUgXCJhcyBhIHNlbGVjdGlvblwiLCAtPlxuICAgICAgICBpdCBcImFjdHMgdGhlIHNhbWUgYXMgdGhlICsga2V5YmluZGluZ1wiLCAtPlxuICAgICAgICAgICMgZG8gaXQgd2l0aCArIGFuZCBzYXZlIHRoZSByZXN1bHRzXG4gICAgICAgICAgc2V0XG4gICAgICAgICAgICB0ZXh0OiBzdGFydGluZ1RleHRcbiAgICAgICAgICAgIGN1cnNvcjogc3RhcnRpbmdDdXJzb3JQb3NpdGlvblxuXG4gICAgICAgICAga2V5c3Ryb2tlICdkICsnXG4gICAgICAgICAgcmVmZXJlbmNlVGV4dCA9IGVkaXRvci5nZXRUZXh0KClcbiAgICAgICAgICByZWZlcmVuY2VDdXJzb3JQb3NpdGlvbiA9IGVkaXRvci5nZXRDdXJzb3JTY3JlZW5Qb3NpdGlvbigpXG5cbiAgICAgICAgICBzZXRcbiAgICAgICAgICAgIHRleHQ6IHN0YXJ0aW5nVGV4dFxuICAgICAgICAgICAgY3Vyc29yOiBzdGFydGluZ0N1cnNvclBvc2l0aW9uXG4gICAgICAgICAgZW5zdXJlICdkIGVudGVyJyxcbiAgICAgICAgICAgIHRleHQ6IHJlZmVyZW5jZVRleHRcbiAgICAgICAgICAgIGN1cnNvcjogcmVmZXJlbmNlQ3Vyc29yUG9zaXRpb25cblxuICBkZXNjcmliZSBcInRoZSBnZyBrZXliaW5kaW5nIHdpdGggc3RheU9uVmVydGljYWxNb3Rpb24gPSBmYWxzZVwiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNldHRpbmdzLnNldCgnc3RheU9uVmVydGljYWxNb3Rpb24nLCBmYWxzZSlcbiAgICAgIHNldFxuICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgMWFiY1xuICAgICAgICAgICAyXG4gICAgICAgICAgM1xcblxuICAgICAgICAgIFwiXCJcIlxuICAgICAgICBjdXJzb3I6IFswLCAyXVxuXG4gICAgZGVzY3JpYmUgXCJhcyBhIG1vdGlvblwiLCAtPlxuICAgICAgZGVzY3JpYmUgXCJpbiBub3JtYWwgbW9kZVwiLCAtPlxuICAgICAgICBpdCBcIm1vdmVzIHRoZSBjdXJzb3IgdG8gdGhlIGJlZ2lubmluZyBvZiB0aGUgZmlyc3QgbGluZVwiLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFsyLCAwXVxuICAgICAgICAgIGVuc3VyZSAnZyBnJywgY3Vyc29yOiBbMCwgMV1cblxuICAgICAgICBpdCBcIm1vdmUgdG8gc2FtZSBwb3NpdGlvbiBpZiBpdHMgb24gZmlyc3QgbGluZSBhbmQgZmlyc3QgY2hhclwiLCAtPlxuICAgICAgICAgIGVuc3VyZSAnZyBnJywgY3Vyc29yOiBbMCwgMV1cblxuICAgICAgZGVzY3JpYmUgXCJpbiBsaW5ld2lzZSB2aXN1YWwgbW9kZVwiLCAtPlxuICAgICAgICBpdCBcInNlbGVjdHMgdG8gdGhlIGZpcnN0IGxpbmUgaW4gdGhlIGZpbGVcIiwgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMSwgMF1cbiAgICAgICAgICBlbnN1cmUgJ1YgZyBnJyxcbiAgICAgICAgICAgIHNlbGVjdGVkVGV4dDogXCIgMWFiY1xcbiAyXFxuXCJcbiAgICAgICAgICAgIGN1cnNvcjogWzAsIDBdXG5cbiAgICAgIGRlc2NyaWJlIFwiaW4gY2hhcmFjdGVyd2lzZSB2aXN1YWwgbW9kZVwiLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzEsIDFdXG4gICAgICAgIGl0IFwic2VsZWN0cyB0byB0aGUgZmlyc3QgbGluZSBpbiB0aGUgZmlsZVwiLCAtPlxuICAgICAgICAgIGVuc3VyZSAndiBnIGcnLFxuICAgICAgICAgICAgc2VsZWN0ZWRUZXh0OiBcIjFhYmNcXG4gMlwiXG4gICAgICAgICAgICBjdXJzb3I6IFswLCAxXVxuXG4gICAgZGVzY3JpYmUgXCJ3aGVuIGNvdW50IHNwZWNpZmllZFwiLCAtPlxuICAgICAgZGVzY3JpYmUgXCJpbiBub3JtYWwgbW9kZVwiLCAtPlxuICAgICAgICBpdCBcIm1vdmVzIHRoZSBjdXJzb3IgdG8gZmlyc3QgY2hhciBvZiBhIHNwZWNpZmllZCBsaW5lXCIsIC0+XG4gICAgICAgICAgZW5zdXJlICcyIGcgZycsIGN1cnNvcjogWzEsIDFdXG5cbiAgICAgIGRlc2NyaWJlIFwiaW4gbGluZXdpc2UgdmlzdWFsIG1vdGlvblwiLCAtPlxuICAgICAgICBpdCBcInNlbGVjdHMgdG8gYSBzcGVjaWZpZWQgbGluZVwiLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFsyLCAwXVxuICAgICAgICAgIGVuc3VyZSAnViAyIGcgZycsXG4gICAgICAgICAgICBzZWxlY3RlZFRleHQ6IFwiIDJcXG4zXFxuXCJcbiAgICAgICAgICAgIGN1cnNvcjogWzEsIDBdXG5cbiAgICAgIGRlc2NyaWJlIFwiaW4gY2hhcmFjdGVyd2lzZSB2aXN1YWwgbW90aW9uXCIsIC0+XG4gICAgICAgIGl0IFwic2VsZWN0cyB0byBhIGZpcnN0IGNoYXJhY3RlciBvZiBzcGVjaWZpZWQgbGluZVwiLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFsyLCAwXVxuICAgICAgICAgIGVuc3VyZSAndiAyIGcgZycsXG4gICAgICAgICAgICBzZWxlY3RlZFRleHQ6IFwiMlxcbjNcIlxuICAgICAgICAgICAgY3Vyc29yOiBbMSwgMV1cblxuICBkZXNjcmliZSBcInRoZSBnXyBrZXliaW5kaW5nXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2V0IHRleHRfOiBcIlwiXCJcbiAgICAgICAgMV9fXG4gICAgICAgICAgICAyX19cbiAgICAgICAgIDNhYmNcbiAgICAgICAgX1xuICAgICAgICBcIlwiXCJcblxuICAgIGRlc2NyaWJlIFwiYXMgYSBtb3Rpb25cIiwgLT5cbiAgICAgIGl0IFwibW92ZXMgdGhlIGN1cnNvciB0byB0aGUgbGFzdCBub25ibGFuayBjaGFyYWN0ZXJcIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzEsIDBdXG4gICAgICAgIGVuc3VyZSAnZyBfJywgY3Vyc29yOiBbMSwgNF1cblxuICAgICAgaXQgXCJ3aWxsIG1vdmUgdGhlIGN1cnNvciB0byB0aGUgYmVnaW5uaW5nIG9mIHRoZSBsaW5lIGlmIG5lY2Vzc2FyeVwiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMl1cbiAgICAgICAgZW5zdXJlICdnIF8nLCBjdXJzb3I6IFswLCAwXVxuXG4gICAgZGVzY3JpYmUgXCJhcyBhIHJlcGVhdGVkIG1vdGlvblwiLCAtPlxuICAgICAgaXQgXCJtb3ZlcyB0aGUgY3Vyc29yIGRvd253YXJkIGFuZCBvdXR3YXJkXCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFswLCAwXVxuICAgICAgICBlbnN1cmUgJzIgZyBfJywgY3Vyc29yOiBbMSwgNF1cblxuICAgIGRlc2NyaWJlIFwiYXMgYSBzZWxlY3Rpb25cIiwgLT5cbiAgICAgIGl0IFwic2VsZWN0cyB0aGUgY3VycmVudCBsaW5lIGV4Y2x1ZGluZyB3aGl0ZXNwYWNlXCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFsxLCAyXVxuICAgICAgICBlbnN1cmUgJ3YgMiBnIF8nLFxuICAgICAgICAgIHNlbGVjdGVkVGV4dDogXCIgIDIgIFxcbiAzYWJjXCJcblxuICBkZXNjcmliZSBcInRoZSBHIGtleWJpbmRpbmcgKHN0YXlPblZlcnRpY2FsTW90aW9uID0gZmFsc2UpXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2V0dGluZ3Muc2V0KCdzdGF5T25WZXJ0aWNhbE1vdGlvbicsIGZhbHNlKVxuICAgICAgc2V0XG4gICAgICAgIHRleHRfOiBcIlwiXCJcbiAgICAgICAgMVxuICAgICAgICBfX19fMlxuICAgICAgICBfM2FiY1xuICAgICAgICBfXG4gICAgICAgIFwiXCJcIlxuICAgICAgICBjdXJzb3I6IFswLCAyXVxuXG4gICAgZGVzY3JpYmUgXCJhcyBhIG1vdGlvblwiLCAtPlxuICAgICAgaXQgXCJtb3ZlcyB0aGUgY3Vyc29yIHRvIHRoZSBsYXN0IGxpbmUgYWZ0ZXIgd2hpdGVzcGFjZVwiLCAtPlxuICAgICAgICBlbnN1cmUgJ0cnLCBjdXJzb3I6IFszLCAwXVxuXG4gICAgZGVzY3JpYmUgXCJhcyBhIHJlcGVhdGVkIG1vdGlvblwiLCAtPlxuICAgICAgaXQgXCJtb3ZlcyB0aGUgY3Vyc29yIHRvIGEgc3BlY2lmaWVkIGxpbmVcIiwgLT5cbiAgICAgICAgZW5zdXJlICcyIEcnLCBjdXJzb3I6IFsxLCA0XVxuXG4gICAgZGVzY3JpYmUgXCJhcyBhIHNlbGVjdGlvblwiLCAtPlxuICAgICAgaXQgXCJzZWxlY3RzIHRvIHRoZSBsYXN0IGxpbmUgaW4gdGhlIGZpbGVcIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzEsIDBdXG4gICAgICAgIGVuc3VyZSAndiBHJyxcbiAgICAgICAgICBzZWxlY3RlZFRleHQ6IFwiICAgIDJcXG4gM2FiY1xcbiBcIlxuICAgICAgICAgIGN1cnNvcjogWzMsIDFdXG5cbiAgZGVzY3JpYmUgXCJ0aGUgTiUga2V5YmluZGluZ1wiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNldFxuICAgICAgICB0ZXh0OiBbMC4uOTk5XS5qb2luKFwiXFxuXCIpXG4gICAgICAgIGN1cnNvcjogWzAsIDBdXG5cbiAgICBkZXNjcmliZSBcInB1dCBjdXJzb3Igb24gbGluZSBzcGVjaWZpZWQgYnkgcGVyY2VudFwiLCAtPlxuICAgICAgaXQgXCI1MCVcIiwgLT4gZW5zdXJlICc1IDAgJScsIGN1cnNvcjogWzQ5OSwgMF1cbiAgICAgIGl0IFwiMzAlXCIsIC0+IGVuc3VyZSAnMyAwICUnLCBjdXJzb3I6IFsyOTksIDBdXG4gICAgICBpdCBcIjEwMCVcIiwgLT4gZW5zdXJlICcxIDAgMCAlJywgY3Vyc29yOiBbOTk5LCAwXVxuICAgICAgaXQgXCIxMjAlXCIsIC0+IGVuc3VyZSAnMSAyIDAgJScsIGN1cnNvcjogWzk5OSwgMF1cblxuICBkZXNjcmliZSBcInRoZSBILCBNLCBMIGtleWJpbmRpbmcoIHN0YXlPblZlcnRpY2FsTW90aW8gPSBmYWxzZSApXCIsIC0+XG4gICAgW2VlbF0gPSBbXVxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNldHRpbmdzLnNldCgnc3RheU9uVmVydGljYWxNb3Rpb24nLCBmYWxzZSlcblxuICAgICAgZWVsID0gZWRpdG9yRWxlbWVudFxuICAgICAgc2V0XG4gICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgMVxuICAgICAgICAgIDJcbiAgICAgICAgICAzXG4gICAgICAgICAgNFxuICAgICAgICAgICAgNVxuICAgICAgICAgIDZcbiAgICAgICAgICA3XG4gICAgICAgICAgOFxuICAgICAgICAgIDlcbiAgICAgICAgICAgIDEwXG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgIGN1cnNvcjogWzgsIDBdXG5cbiAgICBkZXNjcmliZSBcInRoZSBIIGtleWJpbmRpbmdcIiwgLT5cbiAgICAgIGl0IFwibW92ZXMgdGhlIGN1cnNvciB0byB0aGUgbm9uLWJsYW5rLWNoYXIgb24gZmlyc3Qgcm93IGlmIHZpc2libGVcIiwgLT5cbiAgICAgICAgc3B5T24oZWVsLCAnZ2V0Rmlyc3RWaXNpYmxlU2NyZWVuUm93JykuYW5kUmV0dXJuKDApXG4gICAgICAgIGVuc3VyZSAnSCcsIGN1cnNvcjogWzAsIDJdXG5cbiAgICAgIGl0IFwibW92ZXMgdGhlIGN1cnNvciB0byB0aGUgbm9uLWJsYW5rLWNoYXIgb24gZmlyc3QgdmlzaWJsZSByb3cgcGx1cyBzY3JvbGwgb2Zmc2V0XCIsIC0+XG4gICAgICAgIHNweU9uKGVlbCwgJ2dldEZpcnN0VmlzaWJsZVNjcmVlblJvdycpLmFuZFJldHVybigyKVxuICAgICAgICBlbnN1cmUgJ0gnLCBjdXJzb3I6IFs0LCAyXVxuXG4gICAgICBpdCBcInJlc3BlY3RzIGNvdW50c1wiLCAtPlxuICAgICAgICBzcHlPbihlZWwsICdnZXRGaXJzdFZpc2libGVTY3JlZW5Sb3cnKS5hbmRSZXR1cm4oMClcbiAgICAgICAgZW5zdXJlICc0IEgnLCBjdXJzb3I6IFszLCAwXVxuXG4gICAgZGVzY3JpYmUgXCJ0aGUgTCBrZXliaW5kaW5nXCIsIC0+XG4gICAgICBpdCBcIm1vdmVzIHRoZSBjdXJzb3IgdG8gbm9uLWJsYW5rLWNoYXIgb24gbGFzdCByb3cgaWYgdmlzaWJsZVwiLCAtPlxuICAgICAgICBzcHlPbihlZGl0b3IsICdnZXRMYXN0VmlzaWJsZVNjcmVlblJvdycpLmFuZFJldHVybig5KVxuICAgICAgICBlbnN1cmUgJ0wnLCBjdXJzb3I6IFs5LCAyXVxuXG4gICAgICBpdCBcIm1vdmVzIHRoZSBjdXJzb3IgdG8gdGhlIGZpcnN0IHZpc2libGUgcm93IHBsdXMgb2Zmc2V0XCIsIC0+XG4gICAgICAgIHNweU9uKGVkaXRvciwgJ2dldExhc3RWaXNpYmxlU2NyZWVuUm93JykuYW5kUmV0dXJuKDcpXG4gICAgICAgIGVuc3VyZSAnTCcsIGN1cnNvcjogWzQsIDJdXG5cbiAgICAgIGl0IFwicmVzcGVjdHMgY291bnRzXCIsIC0+XG4gICAgICAgIHNweU9uKGVkaXRvciwgJ2dldExhc3RWaXNpYmxlU2NyZWVuUm93JykuYW5kUmV0dXJuKDkpXG4gICAgICAgIGVuc3VyZSAnMyBMJywgY3Vyc29yOiBbNywgMF1cblxuICAgIGRlc2NyaWJlIFwidGhlIE0ga2V5YmluZGluZ1wiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzcHlPbihlZWwsICdnZXRGaXJzdFZpc2libGVTY3JlZW5Sb3cnKS5hbmRSZXR1cm4oMClcbiAgICAgICAgc3B5T24oZWRpdG9yLCAnZ2V0TGFzdFZpc2libGVTY3JlZW5Sb3cnKS5hbmRSZXR1cm4oMTApXG5cbiAgICAgIGl0IFwibW92ZXMgdGhlIGN1cnNvciB0byB0aGUgbm9uLWJsYW5rLWNoYXIgb2YgbWlkZGxlIG9mIHNjcmVlblwiLCAtPlxuICAgICAgICBlbnN1cmUgJ00nLCBjdXJzb3I6IFs0LCAyXVxuXG4gIGRlc2NyaWJlIFwic3RheU9uVmVydGljYWxNb3Rpb24gc2V0dGluZ1wiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNldHRpbmdzLnNldCgnc3RheU9uVmVydGljYWxNb3Rpb24nLCB0cnVlKVxuICAgICAgc2V0XG4gICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgIDAgMDAwMDAwMDAwMDAwXG4gICAgICAgICAgMSAxMTExMTExMTExMTFcbiAgICAgICAgMiAyMjIyMjIyMjIyMjJcXG5cbiAgICAgICAgXCJcIlwiXG4gICAgICAgIGN1cnNvcjogWzIsIDEwXVxuXG4gICAgZGVzY3JpYmUgXCJnZywgRywgTiVcIiwgLT5cbiAgICAgIGl0IFwiZ28gdG8gcm93IHdpdGgga2VlcCBjb2x1bW4gYW5kIHJlc3BlY3QgY3Vyc29yLmdvYWxDb2x1bVwiLCAtPlxuICAgICAgICBlbnN1cmUgJ2cgZycsIGN1cnNvcjogWzAsIDEwXVxuICAgICAgICBlbnN1cmUgJyQnLCBjdXJzb3I6IFswLCAxNV1cbiAgICAgICAgZW5zdXJlICdHJywgY3Vyc29yOiBbMiwgMTNdXG4gICAgICAgIGV4cGVjdChlZGl0b3IuZ2V0TGFzdEN1cnNvcigpLmdvYWxDb2x1bW4pLnRvQmUoSW5maW5pdHkpXG4gICAgICAgIGVuc3VyZSAnMSAlJywgY3Vyc29yOiBbMCwgMTVdXG4gICAgICAgIGV4cGVjdChlZGl0b3IuZ2V0TGFzdEN1cnNvcigpLmdvYWxDb2x1bW4pLnRvQmUoSW5maW5pdHkpXG4gICAgICAgIGVuc3VyZSAnMSAwIGgnLCBjdXJzb3I6IFswLCA1XVxuICAgICAgICBlbnN1cmUgJzUgMCAlJywgY3Vyc29yOiBbMSwgNV1cbiAgICAgICAgZW5zdXJlICcxIDAgMCAlJywgY3Vyc29yOiBbMiwgNV1cblxuICAgIGRlc2NyaWJlIFwiSCwgTSwgTFwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzcHlPbihlZGl0b3JFbGVtZW50LCAnZ2V0Rmlyc3RWaXNpYmxlU2NyZWVuUm93JykuYW5kUmV0dXJuKDApXG4gICAgICAgIHNweU9uKGVkaXRvciwgJ2dldExhc3RWaXNpYmxlU2NyZWVuUm93JykuYW5kUmV0dXJuKDMpXG5cbiAgICAgIGl0IFwiZ28gdG8gcm93IHdpdGgga2VlcCBjb2x1bW4gYW5kIHJlc3BlY3QgY3Vyc29yLmdvYWxDb2x1bVwiLCAtPlxuICAgICAgICBlbnN1cmUgJ0gnLCBjdXJzb3I6IFswLCAxMF1cbiAgICAgICAgZW5zdXJlICdNJywgY3Vyc29yOiBbMSwgMTBdXG4gICAgICAgIGVuc3VyZSAnTCcsIGN1cnNvcjogWzIsIDEwXVxuICAgICAgICBlbnN1cmUgJyQnLCBjdXJzb3I6IFsyLCAxM11cbiAgICAgICAgZXhwZWN0KGVkaXRvci5nZXRMYXN0Q3Vyc29yKCkuZ29hbENvbHVtbikudG9CZShJbmZpbml0eSlcbiAgICAgICAgZW5zdXJlICdIJywgY3Vyc29yOiBbMCwgMTVdXG4gICAgICAgIGVuc3VyZSAnTScsIGN1cnNvcjogWzEsIDE1XVxuICAgICAgICBlbnN1cmUgJ0wnLCBjdXJzb3I6IFsyLCAxM11cbiAgICAgICAgZXhwZWN0KGVkaXRvci5nZXRMYXN0Q3Vyc29yKCkuZ29hbENvbHVtbikudG9CZShJbmZpbml0eSlcblxuICBkZXNjcmliZSAndGhlIG1hcmsga2V5YmluZGluZ3MnLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNldFxuICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAxMlxuICAgICAgICAgICAgMzRcbiAgICAgICAgNTZcXG5cbiAgICAgICAgXCJcIlwiXG4gICAgICAgIGN1cnNvcjogWzAsIDFdXG5cbiAgICBpdCAnbW92ZXMgdG8gdGhlIGJlZ2lubmluZyBvZiB0aGUgbGluZSBvZiBhIG1hcmsnLCAtPlxuICAgICAgc2V0IGN1cnNvcjogWzEsIDFdXG4gICAgICBrZXlzdHJva2UgJ20gYSdcbiAgICAgIHNldCBjdXJzb3I6IFswLCAwXVxuICAgICAgZW5zdXJlIFwiJyBhXCIsIGN1cnNvcjogWzEsIDRdXG5cbiAgICBpdCAnbW92ZXMgbGl0ZXJhbGx5IHRvIGEgbWFyaycsIC0+XG4gICAgICBzZXQgY3Vyc29yOiBbMSwgMl1cbiAgICAgIGtleXN0cm9rZSAnbSBhJ1xuICAgICAgc2V0IGN1cnNvcjogWzAsIDBdXG4gICAgICBlbnN1cmUgJ2AgYScsIGN1cnNvcjogWzEsIDJdXG5cbiAgICBpdCAnZGVsZXRlcyB0byBhIG1hcmsgYnkgbGluZScsIC0+XG4gICAgICBzZXQgY3Vyc29yOiBbMSwgNV1cbiAgICAgIGtleXN0cm9rZSAnbSBhJ1xuICAgICAgc2V0IGN1cnNvcjogWzAsIDBdXG4gICAgICBlbnN1cmUgXCJkICcgYVwiLCB0ZXh0OiAnNTZcXG4nXG5cbiAgICBpdCAnZGVsZXRlcyBiZWZvcmUgdG8gYSBtYXJrIGxpdGVyYWxseScsIC0+XG4gICAgICBzZXQgY3Vyc29yOiBbMSwgNV1cbiAgICAgIGtleXN0cm9rZSAnbSBhJ1xuICAgICAgc2V0IGN1cnNvcjogWzAsIDJdXG4gICAgICBlbnN1cmUgJ2QgYCBhJywgdGV4dDogJyAgNFxcbjU2XFxuJ1xuXG4gICAgaXQgJ2RlbGV0ZXMgYWZ0ZXIgdG8gYSBtYXJrIGxpdGVyYWxseScsIC0+XG4gICAgICBzZXQgY3Vyc29yOiBbMSwgNV1cbiAgICAgIGtleXN0cm9rZSAnbSBhJ1xuICAgICAgc2V0IGN1cnNvcjogWzIsIDFdXG4gICAgICBlbnN1cmUgJ2QgYCBhJywgdGV4dDogJyAgMTJcXG4gICAgMzZcXG4nXG5cbiAgICBpdCAnbW92ZXMgYmFjayB0byBwcmV2aW91cycsIC0+XG4gICAgICBzZXQgY3Vyc29yOiBbMSwgNV1cbiAgICAgIGtleXN0cm9rZSAnYCBgJ1xuICAgICAgc2V0IGN1cnNvcjogWzIsIDFdXG4gICAgICBlbnN1cmUgJ2AgYCcsIGN1cnNvcjogWzEsIDVdXG5cbiAgZGVzY3JpYmUgXCJqdW1wIGNvbW1hbmQgdXBkYXRlIGAgYW5kICcgbWFya1wiLCAtPlxuICAgIGVuc3VyZUp1bXBNYXJrID0gKHZhbHVlKSAtPlxuICAgICAgZW5zdXJlIG1hcms6IFwiYFwiOiB2YWx1ZVxuICAgICAgZW5zdXJlIG1hcms6IFwiJ1wiOiB2YWx1ZVxuXG4gICAgZW5zdXJlSnVtcEFuZEJhY2sgPSAoa2V5c3Ryb2tlLCBvcHRpb24pIC0+XG4gICAgICBhZnRlck1vdmUgPSBvcHRpb24uY3Vyc29yXG4gICAgICBiZWZvcmVNb3ZlID0gZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKClcblxuICAgICAgZW5zdXJlIGtleXN0cm9rZSwgY3Vyc29yOiBhZnRlck1vdmVcbiAgICAgIGVuc3VyZUp1bXBNYXJrKGJlZm9yZU1vdmUpXG5cbiAgICAgIGV4cGVjdChiZWZvcmVNb3ZlLmlzRXF1YWwoYWZ0ZXJNb3ZlKSkudG9CZShmYWxzZSlcblxuICAgICAgZW5zdXJlIFwiYCBgXCIsIGN1cnNvcjogYmVmb3JlTW92ZVxuICAgICAgZW5zdXJlSnVtcE1hcmsoYWZ0ZXJNb3ZlKVxuXG4gICAgZW5zdXJlSnVtcEFuZEJhY2tMaW5ld2lzZSA9IChrZXlzdHJva2UsIG9wdGlvbikgLT5cbiAgICAgIGFmdGVyTW92ZSA9IG9wdGlvbi5jdXJzb3JcbiAgICAgIGJlZm9yZU1vdmUgPSBlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKVxuXG4gICAgICBleHBlY3QoYmVmb3JlTW92ZS5jb2x1bW4pLm5vdC50b0JlKDApXG5cbiAgICAgIGVuc3VyZSBrZXlzdHJva2UsIGN1cnNvcjogYWZ0ZXJNb3ZlXG4gICAgICBlbnN1cmVKdW1wTWFyayhiZWZvcmVNb3ZlKVxuXG4gICAgICBleHBlY3QoYmVmb3JlTW92ZS5pc0VxdWFsKGFmdGVyTW92ZSkpLnRvQmUoZmFsc2UpXG5cbiAgICAgIGVuc3VyZSBcIicgJ1wiLCBjdXJzb3I6IFtiZWZvcmVNb3ZlLnJvdywgMF1cbiAgICAgIGVuc3VyZUp1bXBNYXJrKGFmdGVyTW92ZSlcblxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIGZvciBtYXJrIGluIFwiYCdcIlxuICAgICAgICB2aW1TdGF0ZS5tYXJrLm1hcmtzW21hcmtdPy5kZXN0cm95KClcbiAgICAgICAgdmltU3RhdGUubWFyay5tYXJrc1ttYXJrXSA9IG51bGxcblxuICAgICAgc2V0XG4gICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAwOiBvbyAwXG4gICAgICAgIDE6IDExMTFcbiAgICAgICAgMjogMjIyMlxuICAgICAgICAzOiBvbyAzXG4gICAgICAgIDQ6IDQ0NDRcbiAgICAgICAgNTogb28gNVxuICAgICAgICBcIlwiXCJcbiAgICAgICAgY3Vyc29yOiBbMSwgMF1cblxuICAgIGRlc2NyaWJlIFwiaW5pdGlhbCBzdGF0ZVwiLCAtPlxuICAgICAgaXQgXCJyZXR1cm4gWzAsIDBdXCIsIC0+XG4gICAgICAgIGVuc3VyZSBtYXJrOiBcIidcIjogWzAsIDBdXG4gICAgICAgIGVuc3VyZSBtYXJrOiBcImBcIjogWzAsIDBdXG5cbiAgICBkZXNjcmliZSBcImp1bXAgbW90aW9uIGluIG5vcm1hbC1tb2RlXCIsIC0+XG4gICAgICBpbml0aWFsID0gWzMsIDNdXG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIGphc21pbmUuYXR0YWNoVG9ET00oZ2V0VmlldyhhdG9tLndvcmtzcGFjZSkpICMgZm9yIEwsIE0sIEhcblxuICAgICAgICAjIFRPRE86IHJlbW92ZSB3aGVuIDEuMTkgYmVjb21lIHN0YWJsZVxuICAgICAgICBpZiBlZGl0b3JFbGVtZW50Lm1lYXN1cmVEaW1lbnNpb25zP1xuICAgICAgICAgIHtjb21wb25lbnR9ID0gZWRpdG9yXG4gICAgICAgICAgY29tcG9uZW50LmVsZW1lbnQuc3R5bGUuaGVpZ2h0ID0gY29tcG9uZW50LmdldExpbmVIZWlnaHQoKSAqIGVkaXRvci5nZXRMaW5lQ291bnQoKSArICdweCdcbiAgICAgICAgICBlZGl0b3JFbGVtZW50Lm1lYXN1cmVEaW1lbnNpb25zKClcblxuICAgICAgICBlbnN1cmUgbWFyazogXCInXCI6IFswLCAwXVxuICAgICAgICBlbnN1cmUgbWFyazogXCJgXCI6IFswLCAwXVxuICAgICAgICBzZXQgY3Vyc29yOiBpbml0aWFsXG5cbiAgICAgIGl0IFwiRyBqdW1wJmJhY2tcIiwgLT4gZW5zdXJlSnVtcEFuZEJhY2sgJ0cnLCBjdXJzb3I6IFs1LCAzXVxuICAgICAgaXQgXCJnIGcganVtcCZiYWNrXCIsIC0+IGVuc3VyZUp1bXBBbmRCYWNrIFwiZyBnXCIsIGN1cnNvcjogWzAsIDNdXG4gICAgICBpdCBcIjEwMCAlIGp1bXAmYmFja1wiLCAtPiBlbnN1cmVKdW1wQW5kQmFjayBcIjEgMCAwICVcIiwgY3Vyc29yOiBbNSwgM11cbiAgICAgIGl0IFwiKSBqdW1wJmJhY2tcIiwgLT4gZW5zdXJlSnVtcEFuZEJhY2sgXCIpXCIsIGN1cnNvcjogWzUsIDZdXG4gICAgICBpdCBcIigganVtcCZiYWNrXCIsIC0+IGVuc3VyZUp1bXBBbmRCYWNrIFwiKFwiLCBjdXJzb3I6IFswLCAwXVxuICAgICAgaXQgXCJdIGp1bXAmYmFja1wiLCAtPiBlbnN1cmVKdW1wQW5kQmFjayBcIl1cIiwgY3Vyc29yOiBbNSwgM11cbiAgICAgIGl0IFwiWyBqdW1wJmJhY2tcIiwgLT4gZW5zdXJlSnVtcEFuZEJhY2sgXCJbXCIsIGN1cnNvcjogWzAsIDNdXG4gICAgICBpdCBcIn0ganVtcCZiYWNrXCIsIC0+IGVuc3VyZUp1bXBBbmRCYWNrIFwifVwiLCBjdXJzb3I6IFs1LCA2XVxuICAgICAgaXQgXCJ7IGp1bXAmYmFja1wiLCAtPiBlbnN1cmVKdW1wQW5kQmFjayBcIntcIiwgY3Vyc29yOiBbMCwgMF1cbiAgICAgIGl0IFwiTCBqdW1wJmJhY2tcIiwgLT4gZW5zdXJlSnVtcEFuZEJhY2sgXCJMXCIsIGN1cnNvcjogWzUsIDNdXG4gICAgICBpdCBcIkgganVtcCZiYWNrXCIsIC0+IGVuc3VyZUp1bXBBbmRCYWNrIFwiSFwiLCBjdXJzb3I6IFswLCAzXVxuICAgICAgaXQgXCJNIGp1bXAmYmFja1wiLCAtPiBlbnN1cmVKdW1wQW5kQmFjayBcIk1cIiwgY3Vyc29yOiBbMiwgM11cbiAgICAgIGl0IFwiKiBqdW1wJmJhY2tcIiwgLT4gZW5zdXJlSnVtcEFuZEJhY2sgXCIqXCIsIGN1cnNvcjogWzUsIDNdXG5cbiAgICAgICMgW0JVR10gU3RyYW5nZSBidWcgb2YgamFzbWluZSBvciBhdG9tJ3MgamFzbWluZSBlbmhhbmNtZW50P1xuICAgICAgIyBVc2luZyBzdWJqZWN0IFwiIyBqdW1wICYgYmFja1wiIHNraXBzIHNwZWMuXG4gICAgICAjIE5vdGUgYXQgQXRvbSB2MS4xMS4yXG4gICAgICBpdCBcIlNoYXJwKCMpIGp1bXAmYmFja1wiLCAtPiBlbnN1cmVKdW1wQW5kQmFjaygnIycsIGN1cnNvcjogWzAsIDNdKVxuXG4gICAgICBpdCBcIi8ganVtcCZiYWNrXCIsIC0+IGVuc3VyZUp1bXBBbmRCYWNrICcvIG9vIGVudGVyJywgY3Vyc29yOiBbNSwgM11cbiAgICAgIGl0IFwiPyBqdW1wJmJhY2tcIiwgLT4gZW5zdXJlSnVtcEFuZEJhY2sgJz8gb28gZW50ZXInLCBjdXJzb3I6IFswLCAzXVxuXG4gICAgICBpdCBcIm4ganVtcCZiYWNrXCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFswLCAwXVxuICAgICAgICBlbnN1cmUgJy8gb28gZW50ZXInLCBjdXJzb3I6IFswLCAzXVxuICAgICAgICBlbnN1cmVKdW1wQW5kQmFjayBcIm5cIiwgY3Vyc29yOiBbMywgM11cbiAgICAgICAgZW5zdXJlSnVtcEFuZEJhY2sgXCJOXCIsIGN1cnNvcjogWzUsIDNdXG5cbiAgICAgIGl0IFwiTiBqdW1wJmJhY2tcIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzAsIDBdXG4gICAgICAgIGVuc3VyZSAnPyBvbyBlbnRlcicsIGN1cnNvcjogWzUsIDNdXG4gICAgICAgIGVuc3VyZUp1bXBBbmRCYWNrIFwiblwiLCBjdXJzb3I6IFszLCAzXVxuICAgICAgICBlbnN1cmVKdW1wQW5kQmFjayBcIk5cIiwgY3Vyc29yOiBbMCwgM11cblxuICAgICAgaXQgXCJHIGp1bXAmYmFjayBsaW5ld2lzZVwiLCAtPiBlbnN1cmVKdW1wQW5kQmFja0xpbmV3aXNlICdHJywgY3Vyc29yOiBbNSwgM11cbiAgICAgIGl0IFwiZyBnIGp1bXAmYmFjayBsaW5ld2lzZVwiLCAtPiBlbnN1cmVKdW1wQW5kQmFja0xpbmV3aXNlIFwiZyBnXCIsIGN1cnNvcjogWzAsIDNdXG4gICAgICBpdCBcIjEwMCAlIGp1bXAmYmFjayBsaW5ld2lzZVwiLCAtPiBlbnN1cmVKdW1wQW5kQmFja0xpbmV3aXNlIFwiMSAwIDAgJVwiLCBjdXJzb3I6IFs1LCAzXVxuICAgICAgaXQgXCIpIGp1bXAmYmFjayBsaW5ld2lzZVwiLCAtPiBlbnN1cmVKdW1wQW5kQmFja0xpbmV3aXNlIFwiKVwiLCBjdXJzb3I6IFs1LCA2XVxuICAgICAgaXQgXCIoIGp1bXAmYmFjayBsaW5ld2lzZVwiLCAtPiBlbnN1cmVKdW1wQW5kQmFja0xpbmV3aXNlIFwiKFwiLCBjdXJzb3I6IFswLCAwXVxuICAgICAgaXQgXCJdIGp1bXAmYmFjayBsaW5ld2lzZVwiLCAtPiBlbnN1cmVKdW1wQW5kQmFja0xpbmV3aXNlIFwiXVwiLCBjdXJzb3I6IFs1LCAzXVxuICAgICAgaXQgXCJbIGp1bXAmYmFjayBsaW5ld2lzZVwiLCAtPiBlbnN1cmVKdW1wQW5kQmFja0xpbmV3aXNlIFwiW1wiLCBjdXJzb3I6IFswLCAzXVxuICAgICAgaXQgXCJ9IGp1bXAmYmFjayBsaW5ld2lzZVwiLCAtPiBlbnN1cmVKdW1wQW5kQmFja0xpbmV3aXNlIFwifVwiLCBjdXJzb3I6IFs1LCA2XVxuICAgICAgaXQgXCJ7IGp1bXAmYmFjayBsaW5ld2lzZVwiLCAtPiBlbnN1cmVKdW1wQW5kQmFja0xpbmV3aXNlIFwie1wiLCBjdXJzb3I6IFswLCAwXVxuICAgICAgaXQgXCJMIGp1bXAmYmFjayBsaW5ld2lzZVwiLCAtPiBlbnN1cmVKdW1wQW5kQmFja0xpbmV3aXNlIFwiTFwiLCBjdXJzb3I6IFs1LCAzXVxuICAgICAgaXQgXCJIIGp1bXAmYmFjayBsaW5ld2lzZVwiLCAtPiBlbnN1cmVKdW1wQW5kQmFja0xpbmV3aXNlIFwiSFwiLCBjdXJzb3I6IFswLCAzXVxuICAgICAgaXQgXCJNIGp1bXAmYmFjayBsaW5ld2lzZVwiLCAtPiBlbnN1cmVKdW1wQW5kQmFja0xpbmV3aXNlIFwiTVwiLCBjdXJzb3I6IFsyLCAzXVxuICAgICAgaXQgXCIqIGp1bXAmYmFjayBsaW5ld2lzZVwiLCAtPiBlbnN1cmVKdW1wQW5kQmFja0xpbmV3aXNlIFwiKlwiLCBjdXJzb3I6IFs1LCAzXVxuXG4gIGRlc2NyaWJlICd0aGUgViBrZXliaW5kaW5nJywgLT5cbiAgICBbdGV4dF0gPSBbXVxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHRleHQgPSBuZXcgVGV4dERhdGEgXCJcIlwiXG4gICAgICAgIDAxXG4gICAgICAgIDAwMlxuICAgICAgICAwMDAzXG4gICAgICAgIDAwMDA0XG4gICAgICAgIDAwMDAwNVxcblxuICAgICAgICBcIlwiXCJcbiAgICAgIHNldFxuICAgICAgICB0ZXh0OiB0ZXh0LmdldFJhdygpXG4gICAgICAgIGN1cnNvcjogWzEsIDFdXG5cbiAgICBpdCBcInNlbGVjdHMgZG93biBhIGxpbmVcIiwgLT5cbiAgICAgIGVuc3VyZSAnViBqIGonLCBzZWxlY3RlZFRleHQ6IHRleHQuZ2V0TGluZXMoWzEuLjNdKVxuXG4gICAgaXQgXCJzZWxlY3RzIHVwIGEgbGluZVwiLCAtPlxuICAgICAgZW5zdXJlICdWIGsnLCBzZWxlY3RlZFRleHQ6IHRleHQuZ2V0TGluZXMoWzAuLjFdKVxuXG4gIGRlc2NyaWJlICdNb3ZlVG8oUHJldmlvdXN8TmV4dClGb2xkKFN0YXJ0fEVuZCknLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgICBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZSgnbGFuZ3VhZ2UtY29mZmVlLXNjcmlwdCcpXG4gICAgICBnZXRWaW1TdGF0ZSAnc2FtcGxlLmNvZmZlZScsIChzdGF0ZSwgdmltKSAtPlxuICAgICAgICB7ZWRpdG9yLCBlZGl0b3JFbGVtZW50fSA9IHN0YXRlXG4gICAgICAgIHtzZXQsIGVuc3VyZSwga2V5c3Ryb2tlfSA9IHZpbVxuXG4gICAgICBydW5zIC0+XG4gICAgICAgIGF0b20ua2V5bWFwcy5hZGQgXCJ0ZXN0XCIsXG4gICAgICAgICAgJ2F0b20tdGV4dC1lZGl0b3IudmltLW1vZGUtcGx1czpub3QoLmluc2VydC1tb2RlKSc6XG4gICAgICAgICAgICAnWyBbJzogJ3ZpbS1tb2RlLXBsdXM6bW92ZS10by1wcmV2aW91cy1mb2xkLXN0YXJ0J1xuICAgICAgICAgICAgJ10gWyc6ICd2aW0tbW9kZS1wbHVzOm1vdmUtdG8tbmV4dC1mb2xkLXN0YXJ0J1xuICAgICAgICAgICAgJ1sgXSc6ICd2aW0tbW9kZS1wbHVzOm1vdmUtdG8tcHJldmlvdXMtZm9sZC1lbmQnXG4gICAgICAgICAgICAnXSBdJzogJ3ZpbS1tb2RlLXBsdXM6bW92ZS10by1uZXh0LWZvbGQtZW5kJ1xuXG4gICAgYWZ0ZXJFYWNoIC0+XG4gICAgICBhdG9tLnBhY2thZ2VzLmRlYWN0aXZhdGVQYWNrYWdlKCdsYW5ndWFnZS1jb2ZmZWUtc2NyaXB0JylcblxuICAgIGRlc2NyaWJlIFwiTW92ZVRvUHJldmlvdXNGb2xkU3RhcnRcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzMwLCAwXVxuICAgICAgaXQgXCJtb3ZlIHRvIGZpcnN0IGNoYXIgb2YgcHJldmlvdXMgZm9sZCBzdGFydCByb3dcIiwgLT5cbiAgICAgICAgZW5zdXJlICdbIFsnLCBjdXJzb3I6IFsyMiwgNl1cbiAgICAgICAgZW5zdXJlICdbIFsnLCBjdXJzb3I6IFsyMCwgNl1cbiAgICAgICAgZW5zdXJlICdbIFsnLCBjdXJzb3I6IFsxOCwgNF1cbiAgICAgICAgZW5zdXJlICdbIFsnLCBjdXJzb3I6IFs5LCAyXVxuICAgICAgICBlbnN1cmUgJ1sgWycsIGN1cnNvcjogWzgsIDBdXG5cbiAgICBkZXNjcmliZSBcIk1vdmVUb05leHRGb2xkU3RhcnRcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzAsIDBdXG4gICAgICBpdCBcIm1vdmUgdG8gZmlyc3QgY2hhciBvZiBuZXh0IGZvbGQgc3RhcnQgcm93XCIsIC0+XG4gICAgICAgIGVuc3VyZSAnXSBbJywgY3Vyc29yOiBbOCwgMF1cbiAgICAgICAgZW5zdXJlICddIFsnLCBjdXJzb3I6IFs5LCAyXVxuICAgICAgICBlbnN1cmUgJ10gWycsIGN1cnNvcjogWzE4LCA0XVxuICAgICAgICBlbnN1cmUgJ10gWycsIGN1cnNvcjogWzIwLCA2XVxuICAgICAgICBlbnN1cmUgJ10gWycsIGN1cnNvcjogWzIyLCA2XVxuXG4gICAgZGVzY3JpYmUgXCJNb3ZlVG9QcmV2aXNGb2xkRW5kXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFszMCwgMF1cbiAgICAgIGl0IFwibW92ZSB0byBmaXJzdCBjaGFyIG9mIHByZXZpb3VzIGZvbGQgZW5kIHJvd1wiLCAtPlxuICAgICAgICBlbnN1cmUgJ1sgXScsIGN1cnNvcjogWzI4LCAyXVxuICAgICAgICBlbnN1cmUgJ1sgXScsIGN1cnNvcjogWzI1LCA0XVxuICAgICAgICBlbnN1cmUgJ1sgXScsIGN1cnNvcjogWzIzLCA4XVxuICAgICAgICBlbnN1cmUgJ1sgXScsIGN1cnNvcjogWzIxLCA4XVxuXG4gICAgZGVzY3JpYmUgXCJNb3ZlVG9OZXh0Rm9sZEVuZFwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMF1cbiAgICAgIGl0IFwibW92ZSB0byBmaXJzdCBjaGFyIG9mIG5leHQgZm9sZCBlbmQgcm93XCIsIC0+XG4gICAgICAgIGVuc3VyZSAnXSBdJywgY3Vyc29yOiBbMjEsIDhdXG4gICAgICAgIGVuc3VyZSAnXSBdJywgY3Vyc29yOiBbMjMsIDhdXG4gICAgICAgIGVuc3VyZSAnXSBdJywgY3Vyc29yOiBbMjUsIDRdXG4gICAgICAgIGVuc3VyZSAnXSBdJywgY3Vyc29yOiBbMjgsIDJdXG5cbiAgZGVzY3JpYmUgJ01vdmVUbyhQcmV2aW91c3xOZXh0KVN0cmluZycsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgYXRvbS5rZXltYXBzLmFkZCBcInRlc3RcIixcbiAgICAgICAgJ2F0b20tdGV4dC1lZGl0b3IudmltLW1vZGUtcGx1czpub3QoLmluc2VydC1tb2RlKSc6XG4gICAgICAgICAgJ2cgcyc6ICd2aW0tbW9kZS1wbHVzOm1vdmUtdG8tbmV4dC1zdHJpbmcnXG4gICAgICAgICAgJ2cgUyc6ICd2aW0tbW9kZS1wbHVzOm1vdmUtdG8tcHJldmlvdXMtc3RyaW5nJ1xuXG4gICAgZGVzY3JpYmUgJ2VkaXRvciBmb3Igc29mdFRhYicsIC0+XG4gICAgICBwYWNrID0gJ2xhbmd1YWdlLWNvZmZlZS1zY3JpcHQnXG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgICAgIGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKHBhY2spXG5cbiAgICAgICAgcnVucyAtPlxuICAgICAgICAgIHNldFxuICAgICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICBkaXNwb3NhYmxlPy5kaXNwb3NlKClcbiAgICAgICAgICAgIGRpc3Bvc2FibGUgPSBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS13b3Jrc3BhY2UnLFxuICAgICAgICAgICAgICAnY2hlY2stdXAnOiAtPiBmdW4oJ2JhY2t3YXJkJylcbiAgICAgICAgICAgICAgJ2NoZWNrLWRvd24nOiAtPiBmdW4oJ2ZvcndhcmQnKVxuICAgICAgICAgICAgXFxuXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgIGdyYW1tYXI6ICdzb3VyY2UuY29mZmVlJ1xuXG4gICAgICBhZnRlckVhY2ggLT5cbiAgICAgICAgYXRvbS5wYWNrYWdlcy5kZWFjdGl2YXRlUGFja2FnZShwYWNrKVxuXG4gICAgICBpdCBcIm1vdmUgdG8gbmV4dCBzdHJpbmdcIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzAsIDBdXG4gICAgICAgIGVuc3VyZSAnZyBzJywgY3Vyc29yOiBbMSwgMzFdXG4gICAgICAgIGVuc3VyZSAnZyBzJywgY3Vyc29yOiBbMiwgMl1cbiAgICAgICAgZW5zdXJlICdnIHMnLCBjdXJzb3I6IFsyLCAyMV1cbiAgICAgICAgZW5zdXJlICdnIHMnLCBjdXJzb3I6IFszLCAyXVxuICAgICAgICBlbnN1cmUgJ2cgcycsIGN1cnNvcjogWzMsIDIzXVxuICAgICAgaXQgXCJtb3ZlIHRvIHByZXZpb3VzIHN0cmluZ1wiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbNCwgMF1cbiAgICAgICAgZW5zdXJlICdnIFMnLCBjdXJzb3I6IFszLCAyM11cbiAgICAgICAgZW5zdXJlICdnIFMnLCBjdXJzb3I6IFszLCAyXVxuICAgICAgICBlbnN1cmUgJ2cgUycsIGN1cnNvcjogWzIsIDIxXVxuICAgICAgICBlbnN1cmUgJ2cgUycsIGN1cnNvcjogWzIsIDJdXG4gICAgICAgIGVuc3VyZSAnZyBTJywgY3Vyc29yOiBbMSwgMzFdXG4gICAgICBpdCBcInN1cHBvcnQgY291bnRcIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzAsIDBdXG4gICAgICAgIGVuc3VyZSAnMyBnIHMnLCBjdXJzb3I6IFsyLCAyMV1cbiAgICAgICAgZW5zdXJlICczIGcgUycsIGN1cnNvcjogWzEsIDMxXVxuXG4gICAgZGVzY3JpYmUgJ2VkaXRvciBmb3IgaGFyZFRhYicsIC0+XG4gICAgICBwYWNrID0gJ2xhbmd1YWdlLWdvJ1xuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAgICAgICBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZShwYWNrKVxuXG4gICAgICAgIGdldFZpbVN0YXRlICdzYW1wbGUuZ28nLCAoc3RhdGUsIHZpbUVkaXRvcikgLT5cbiAgICAgICAgICB7ZWRpdG9yLCBlZGl0b3JFbGVtZW50fSA9IHN0YXRlXG4gICAgICAgICAge3NldCwgZW5zdXJlLCBrZXlzdHJva2V9ID0gdmltRWRpdG9yXG5cbiAgICAgIGFmdGVyRWFjaCAtPlxuICAgICAgICBhdG9tLnBhY2thZ2VzLmRlYWN0aXZhdGVQYWNrYWdlKHBhY2spXG5cbiAgICAgIGl0IFwibW92ZSB0byBuZXh0IHN0cmluZ1wiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yU2NyZWVuOiBbMCwgMF1cbiAgICAgICAgZW5zdXJlICdnIHMnLCBjdXJzb3JTY3JlZW46IFsyLCA3XVxuICAgICAgICBlbnN1cmUgJ2cgcycsIGN1cnNvclNjcmVlbjogWzMsIDddXG4gICAgICAgIGVuc3VyZSAnZyBzJywgY3Vyc29yU2NyZWVuOiBbOCwgOF1cbiAgICAgICAgZW5zdXJlICdnIHMnLCBjdXJzb3JTY3JlZW46IFs5LCA4XVxuICAgICAgICBlbnN1cmUgJ2cgcycsIGN1cnNvclNjcmVlbjogWzExLCAyMF1cbiAgICAgICAgZW5zdXJlICdnIHMnLCBjdXJzb3JTY3JlZW46IFsxMiwgMTVdXG4gICAgICAgIGVuc3VyZSAnZyBzJywgY3Vyc29yU2NyZWVuOiBbMTMsIDE1XVxuICAgICAgICBlbnN1cmUgJ2cgcycsIGN1cnNvclNjcmVlbjogWzE1LCAxNV1cbiAgICAgICAgZW5zdXJlICdnIHMnLCBjdXJzb3JTY3JlZW46IFsxNiwgMTVdXG4gICAgICBpdCBcIm1vdmUgdG8gcHJldmlvdXMgc3RyaW5nXCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3JTY3JlZW46IFsxOCwgMF1cbiAgICAgICAgZW5zdXJlICdnIFMnLCBjdXJzb3JTY3JlZW46IFsxNiwgMTVdXG4gICAgICAgIGVuc3VyZSAnZyBTJywgY3Vyc29yU2NyZWVuOiBbMTUsIDE1XVxuICAgICAgICBlbnN1cmUgJ2cgUycsIGN1cnNvclNjcmVlbjogWzEzLCAxNV1cbiAgICAgICAgZW5zdXJlICdnIFMnLCBjdXJzb3JTY3JlZW46IFsxMiwgMTVdXG4gICAgICAgIGVuc3VyZSAnZyBTJywgY3Vyc29yU2NyZWVuOiBbMTEsIDIwXVxuICAgICAgICBlbnN1cmUgJ2cgUycsIGN1cnNvclNjcmVlbjogWzksIDhdXG4gICAgICAgIGVuc3VyZSAnZyBTJywgY3Vyc29yU2NyZWVuOiBbOCwgOF1cbiAgICAgICAgZW5zdXJlICdnIFMnLCBjdXJzb3JTY3JlZW46IFszLCA3XVxuICAgICAgICBlbnN1cmUgJ2cgUycsIGN1cnNvclNjcmVlbjogWzIsIDddXG5cbiAgZGVzY3JpYmUgJ01vdmVUbyhQcmV2aW91c3xOZXh0KU51bWJlcicsIC0+XG4gICAgcGFjayA9ICdsYW5ndWFnZS1jb2ZmZWUtc2NyaXB0J1xuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIGF0b20ua2V5bWFwcy5hZGQgXCJ0ZXN0XCIsXG4gICAgICAgICdhdG9tLXRleHQtZWRpdG9yLnZpbS1tb2RlLXBsdXM6bm90KC5pbnNlcnQtbW9kZSknOlxuICAgICAgICAgICdnIG4nOiAndmltLW1vZGUtcGx1czptb3ZlLXRvLW5leHQtbnVtYmVyJ1xuICAgICAgICAgICdnIE4nOiAndmltLW1vZGUtcGx1czptb3ZlLXRvLXByZXZpb3VzLW51bWJlcidcblxuICAgICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICAgIGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKHBhY2spXG5cbiAgICAgIHJ1bnMgLT5cbiAgICAgICAgc2V0IGdyYW1tYXI6ICdzb3VyY2UuY29mZmVlJ1xuXG4gICAgICBzZXRcbiAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgIG51bTEgPSAxXG4gICAgICAgIGFycjEgPSBbMSwgMTAxLCAxMDAxXVxuICAgICAgICBhcnIyID0gW1wiMVwiLCBcIjJcIiwgXCIzXCJdXG4gICAgICAgIG51bTIgPSAyXG4gICAgICAgIGZ1bihcIjFcIiwgMiwgMylcbiAgICAgICAgXFxuXG4gICAgICAgIFwiXCJcIlxuXG4gICAgYWZ0ZXJFYWNoIC0+XG4gICAgICBhdG9tLnBhY2thZ2VzLmRlYWN0aXZhdGVQYWNrYWdlKHBhY2spXG5cbiAgICBpdCBcIm1vdmUgdG8gbmV4dCBudW1iZXJcIiwgLT5cbiAgICAgIHNldCBjdXJzb3I6IFswLCAwXVxuICAgICAgZW5zdXJlICdnIG4nLCBjdXJzb3I6IFswLCA3XVxuICAgICAgZW5zdXJlICdnIG4nLCBjdXJzb3I6IFsxLCA4XVxuICAgICAgZW5zdXJlICdnIG4nLCBjdXJzb3I6IFsxLCAxMV1cbiAgICAgIGVuc3VyZSAnZyBuJywgY3Vyc29yOiBbMSwgMTZdXG4gICAgICBlbnN1cmUgJ2cgbicsIGN1cnNvcjogWzMsIDddXG4gICAgICBlbnN1cmUgJ2cgbicsIGN1cnNvcjogWzQsIDldXG4gICAgICBlbnN1cmUgJ2cgbicsIGN1cnNvcjogWzQsIDEyXVxuICAgIGl0IFwibW92ZSB0byBwcmV2aW91cyBudW1iZXJcIiwgLT5cbiAgICAgIHNldCBjdXJzb3I6IFs1LCAwXVxuICAgICAgZW5zdXJlICdnIE4nLCBjdXJzb3I6IFs0LCAxMl1cbiAgICAgIGVuc3VyZSAnZyBOJywgY3Vyc29yOiBbNCwgOV1cbiAgICAgIGVuc3VyZSAnZyBOJywgY3Vyc29yOiBbMywgN11cbiAgICAgIGVuc3VyZSAnZyBOJywgY3Vyc29yOiBbMSwgMTZdXG4gICAgICBlbnN1cmUgJ2cgTicsIGN1cnNvcjogWzEsIDExXVxuICAgICAgZW5zdXJlICdnIE4nLCBjdXJzb3I6IFsxLCA4XVxuICAgICAgZW5zdXJlICdnIE4nLCBjdXJzb3I6IFswLCA3XVxuICAgIGl0IFwic3VwcG9ydCBjb3VudFwiLCAtPlxuICAgICAgc2V0IGN1cnNvcjogWzAsIDBdXG4gICAgICBlbnN1cmUgJzUgZyBuJywgY3Vyc29yOiBbMywgN11cbiAgICAgIGVuc3VyZSAnMyBnIE4nLCBjdXJzb3I6IFsxLCA4XVxuXG4gIGRlc2NyaWJlICdzdWJ3b3JkIG1vdGlvbicsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgYXRvbS5rZXltYXBzLmFkZCBcInRlc3RcIixcbiAgICAgICAgJ2F0b20tdGV4dC1lZGl0b3IudmltLW1vZGUtcGx1czpub3QoLmluc2VydC1tb2RlKSc6XG4gICAgICAgICAgJ3EnOiAndmltLW1vZGUtcGx1czptb3ZlLXRvLW5leHQtc3Vid29yZCdcbiAgICAgICAgICAnUSc6ICd2aW0tbW9kZS1wbHVzOm1vdmUtdG8tcHJldmlvdXMtc3Vid29yZCdcbiAgICAgICAgICAnY3RybC1lJzogJ3ZpbS1tb2RlLXBsdXM6bW92ZS10by1lbmQtb2Ytc3Vid29yZCdcblxuICAgIGl0IFwibW92ZSB0byBuZXh0L3ByZXZpb3VzIHN1YndvcmRcIiwgLT5cbiAgICAgIHNldCB0ZXh0QzogXCJ8Y2FtZWxDYXNlID0+ICh3aXRoIHNwZWNpYWwpIENoYVJBY3RlclJzXFxuXFxuZGFzaC1jYXNlXFxuXFxuc25ha2VfY2FzZV93b3JkXFxuXCJcbiAgICAgIGVuc3VyZSAncScsIHRleHRDOiBcImNhbWVsfENhc2UgPT4gKHdpdGggc3BlY2lhbCkgQ2hhUkFjdGVyUnNcXG5cXG5kYXNoLWNhc2VcXG5cXG5zbmFrZV9jYXNlX3dvcmRcXG5cIlxuICAgICAgZW5zdXJlICdxJywgdGV4dEM6IFwiY2FtZWxDYXNlfCA9PiAod2l0aCBzcGVjaWFsKSBDaGFSQWN0ZXJSc1xcblxcbmRhc2gtY2FzZVxcblxcbnNuYWtlX2Nhc2Vfd29yZFxcblwiXG4gICAgICBlbnN1cmUgJ3EnLCB0ZXh0QzogXCJjYW1lbENhc2UgPT58ICh3aXRoIHNwZWNpYWwpIENoYVJBY3RlclJzXFxuXFxuZGFzaC1jYXNlXFxuXFxuc25ha2VfY2FzZV93b3JkXFxuXCJcbiAgICAgIGVuc3VyZSAncScsIHRleHRDOiBcImNhbWVsQ2FzZSA9PiAofHdpdGggc3BlY2lhbCkgQ2hhUkFjdGVyUnNcXG5cXG5kYXNoLWNhc2VcXG5cXG5zbmFrZV9jYXNlX3dvcmRcXG5cIlxuICAgICAgZW5zdXJlICdxJywgdGV4dEM6IFwiY2FtZWxDYXNlID0+ICh3aXRoIHxzcGVjaWFsKSBDaGFSQWN0ZXJSc1xcblxcbmRhc2gtY2FzZVxcblxcbnNuYWtlX2Nhc2Vfd29yZFxcblwiXG4gICAgICBlbnN1cmUgJ3EnLCB0ZXh0QzogXCJjYW1lbENhc2UgPT4gKHdpdGggc3BlY2lhbHwpIENoYVJBY3RlclJzXFxuXFxuZGFzaC1jYXNlXFxuXFxuc25ha2VfY2FzZV93b3JkXFxuXCJcbiAgICAgIGVuc3VyZSAncScsIHRleHRDOiBcImNhbWVsQ2FzZSA9PiAod2l0aCBzcGVjaWFsKSB8Q2hhUkFjdGVyUnNcXG5cXG5kYXNoLWNhc2VcXG5cXG5zbmFrZV9jYXNlX3dvcmRcXG5cIlxuICAgICAgZW5zdXJlICdxJywgdGV4dEM6IFwiY2FtZWxDYXNlID0+ICh3aXRoIHNwZWNpYWwpIENoYXxSQWN0ZXJSc1xcblxcbmRhc2gtY2FzZVxcblxcbnNuYWtlX2Nhc2Vfd29yZFxcblwiXG4gICAgICBlbnN1cmUgJ3EnLCB0ZXh0QzogXCJjYW1lbENhc2UgPT4gKHdpdGggc3BlY2lhbCkgQ2hhUnxBY3RlclJzXFxuXFxuZGFzaC1jYXNlXFxuXFxuc25ha2VfY2FzZV93b3JkXFxuXCJcbiAgICAgIGVuc3VyZSAncScsIHRleHRDOiBcImNhbWVsQ2FzZSA9PiAod2l0aCBzcGVjaWFsKSBDaGFSQWN0ZXJ8UnNcXG5cXG5kYXNoLWNhc2VcXG5cXG5zbmFrZV9jYXNlX3dvcmRcXG5cIlxuICAgICAgZW5zdXJlICdxJywgdGV4dEM6IFwiY2FtZWxDYXNlID0+ICh3aXRoIHNwZWNpYWwpIENoYVJBY3RlclJzXFxuXFxufGRhc2gtY2FzZVxcblxcbnNuYWtlX2Nhc2Vfd29yZFxcblwiXG4gICAgICBlbnN1cmUgJ3EnLCB0ZXh0QzogXCJjYW1lbENhc2UgPT4gKHdpdGggc3BlY2lhbCkgQ2hhUkFjdGVyUnNcXG5cXG5kYXNofC1jYXNlXFxuXFxuc25ha2VfY2FzZV93b3JkXFxuXCJcbiAgICAgIGVuc3VyZSAncScsIHRleHRDOiBcImNhbWVsQ2FzZSA9PiAod2l0aCBzcGVjaWFsKSBDaGFSQWN0ZXJSc1xcblxcbmRhc2gtfGNhc2VcXG5cXG5zbmFrZV9jYXNlX3dvcmRcXG5cIlxuICAgICAgZW5zdXJlICdxJywgdGV4dEM6IFwiY2FtZWxDYXNlID0+ICh3aXRoIHNwZWNpYWwpIENoYVJBY3RlclJzXFxuXFxuZGFzaC1jYXNlXFxuXFxufHNuYWtlX2Nhc2Vfd29yZFxcblwiXG4gICAgICBlbnN1cmUgJ3EnLCB0ZXh0QzogXCJjYW1lbENhc2UgPT4gKHdpdGggc3BlY2lhbCkgQ2hhUkFjdGVyUnNcXG5cXG5kYXNoLWNhc2VcXG5cXG5zbmFrZXxfY2FzZV93b3JkXFxuXCJcbiAgICAgIGVuc3VyZSAncScsIHRleHRDOiBcImNhbWVsQ2FzZSA9PiAod2l0aCBzcGVjaWFsKSBDaGFSQWN0ZXJSc1xcblxcbmRhc2gtY2FzZVxcblxcbnNuYWtlX2Nhc2V8X3dvcmRcXG5cIlxuICAgICAgZW5zdXJlICdxJywgdGV4dEM6IFwiY2FtZWxDYXNlID0+ICh3aXRoIHNwZWNpYWwpIENoYVJBY3RlclJzXFxuXFxuZGFzaC1jYXNlXFxuXFxuc25ha2VfY2FzZV93b3J8ZFxcblwiXG4gICAgICBlbnN1cmUgJ1EnLCB0ZXh0QzogXCJjYW1lbENhc2UgPT4gKHdpdGggc3BlY2lhbCkgQ2hhUkFjdGVyUnNcXG5cXG5kYXNoLWNhc2VcXG5cXG5zbmFrZV9jYXNlfF93b3JkXFxuXCJcbiAgICAgIGVuc3VyZSAnUScsIHRleHRDOiBcImNhbWVsQ2FzZSA9PiAod2l0aCBzcGVjaWFsKSBDaGFSQWN0ZXJSc1xcblxcbmRhc2gtY2FzZVxcblxcbnNuYWtlfF9jYXNlX3dvcmRcXG5cIlxuICAgICAgZW5zdXJlICdRJywgdGV4dEM6IFwiY2FtZWxDYXNlID0+ICh3aXRoIHNwZWNpYWwpIENoYVJBY3RlclJzXFxuXFxuZGFzaC1jYXNlXFxuXFxufHNuYWtlX2Nhc2Vfd29yZFxcblwiXG4gICAgICBlbnN1cmUgJ1EnLCB0ZXh0QzogXCJjYW1lbENhc2UgPT4gKHdpdGggc3BlY2lhbCkgQ2hhUkFjdGVyUnNcXG5cXG5kYXNoLXxjYXNlXFxuXFxuc25ha2VfY2FzZV93b3JkXFxuXCJcbiAgICAgIGVuc3VyZSAnUScsIHRleHRDOiBcImNhbWVsQ2FzZSA9PiAod2l0aCBzcGVjaWFsKSBDaGFSQWN0ZXJSc1xcblxcbmRhc2h8LWNhc2VcXG5cXG5zbmFrZV9jYXNlX3dvcmRcXG5cIlxuICAgICAgZW5zdXJlICdRJywgdGV4dEM6IFwiY2FtZWxDYXNlID0+ICh3aXRoIHNwZWNpYWwpIENoYVJBY3RlclJzXFxuXFxufGRhc2gtY2FzZVxcblxcbnNuYWtlX2Nhc2Vfd29yZFxcblwiXG4gICAgICBlbnN1cmUgJ1EnLCB0ZXh0QzogXCJjYW1lbENhc2UgPT4gKHdpdGggc3BlY2lhbCkgQ2hhUkFjdGVyfFJzXFxuXFxuZGFzaC1jYXNlXFxuXFxuc25ha2VfY2FzZV93b3JkXFxuXCJcbiAgICAgIGVuc3VyZSAnUScsIHRleHRDOiBcImNhbWVsQ2FzZSA9PiAod2l0aCBzcGVjaWFsKSBDaGFSfEFjdGVyUnNcXG5cXG5kYXNoLWNhc2VcXG5cXG5zbmFrZV9jYXNlX3dvcmRcXG5cIlxuICAgICAgZW5zdXJlICdRJywgdGV4dEM6IFwiY2FtZWxDYXNlID0+ICh3aXRoIHNwZWNpYWwpIENoYXxSQWN0ZXJSc1xcblxcbmRhc2gtY2FzZVxcblxcbnNuYWtlX2Nhc2Vfd29yZFxcblwiXG4gICAgICBlbnN1cmUgJ1EnLCB0ZXh0QzogXCJjYW1lbENhc2UgPT4gKHdpdGggc3BlY2lhbCkgfENoYVJBY3RlclJzXFxuXFxuZGFzaC1jYXNlXFxuXFxuc25ha2VfY2FzZV93b3JkXFxuXCJcbiAgICAgIGVuc3VyZSAnUScsIHRleHRDOiBcImNhbWVsQ2FzZSA9PiAod2l0aCBzcGVjaWFsfCkgQ2hhUkFjdGVyUnNcXG5cXG5kYXNoLWNhc2VcXG5cXG5zbmFrZV9jYXNlX3dvcmRcXG5cIlxuICAgICAgZW5zdXJlICdRJywgdGV4dEM6IFwiY2FtZWxDYXNlID0+ICh3aXRoIHxzcGVjaWFsKSBDaGFSQWN0ZXJSc1xcblxcbmRhc2gtY2FzZVxcblxcbnNuYWtlX2Nhc2Vfd29yZFxcblwiXG4gICAgICBlbnN1cmUgJ1EnLCB0ZXh0QzogXCJjYW1lbENhc2UgPT4gKHx3aXRoIHNwZWNpYWwpIENoYVJBY3RlclJzXFxuXFxuZGFzaC1jYXNlXFxuXFxuc25ha2VfY2FzZV93b3JkXFxuXCJcbiAgICAgIGVuc3VyZSAnUScsIHRleHRDOiBcImNhbWVsQ2FzZSA9PnwgKHdpdGggc3BlY2lhbCkgQ2hhUkFjdGVyUnNcXG5cXG5kYXNoLWNhc2VcXG5cXG5zbmFrZV9jYXNlX3dvcmRcXG5cIlxuICAgICAgZW5zdXJlICdRJywgdGV4dEM6IFwiY2FtZWxDYXNlfCA9PiAod2l0aCBzcGVjaWFsKSBDaGFSQWN0ZXJSc1xcblxcbmRhc2gtY2FzZVxcblxcbnNuYWtlX2Nhc2Vfd29yZFxcblwiXG4gICAgICBlbnN1cmUgJ1EnLCB0ZXh0QzogXCJjYW1lbHxDYXNlID0+ICh3aXRoIHNwZWNpYWwpIENoYVJBY3RlclJzXFxuXFxuZGFzaC1jYXNlXFxuXFxuc25ha2VfY2FzZV93b3JkXFxuXCJcbiAgICAgIGVuc3VyZSAnUScsIHRleHRDOiBcInxjYW1lbENhc2UgPT4gKHdpdGggc3BlY2lhbCkgQ2hhUkFjdGVyUnNcXG5cXG5kYXNoLWNhc2VcXG5cXG5zbmFrZV9jYXNlX3dvcmRcXG5cIlxuICAgIGl0IFwibW92ZS10by1lbmQtb2Ytc3Vid29yZFwiLCAtPlxuICAgICAgc2V0IHRleHRDOiBcInxjYW1lbENhc2UgPT4gKHdpdGggc3BlY2lhbCkgQ2hhUkFjdGVyUnNcXG5cXG5kYXNoLWNhc2VcXG5cXG5zbmFrZV9jYXNlX3dvcmRcXG5cIlxuICAgICAgZW5zdXJlICdjdHJsLWUnLCB0ZXh0QzogXCJjYW1lfGxDYXNlID0+ICh3aXRoIHNwZWNpYWwpIENoYVJBY3RlclJzXFxuXFxuZGFzaC1jYXNlXFxuXFxuc25ha2VfY2FzZV93b3JkXFxuXCJcbiAgICAgIGVuc3VyZSAnY3RybC1lJywgdGV4dEM6IFwiY2FtZWxDYXN8ZSA9PiAod2l0aCBzcGVjaWFsKSBDaGFSQWN0ZXJSc1xcblxcbmRhc2gtY2FzZVxcblxcbnNuYWtlX2Nhc2Vfd29yZFxcblwiXG4gICAgICBlbnN1cmUgJ2N0cmwtZScsIHRleHRDOiBcImNhbWVsQ2FzZSA9fD4gKHdpdGggc3BlY2lhbCkgQ2hhUkFjdGVyUnNcXG5cXG5kYXNoLWNhc2VcXG5cXG5zbmFrZV9jYXNlX3dvcmRcXG5cIlxuICAgICAgZW5zdXJlICdjdHJsLWUnLCB0ZXh0QzogXCJjYW1lbENhc2UgPT4gfCh3aXRoIHNwZWNpYWwpIENoYVJBY3RlclJzXFxuXFxuZGFzaC1jYXNlXFxuXFxuc25ha2VfY2FzZV93b3JkXFxuXCJcbiAgICAgIGVuc3VyZSAnY3RybC1lJywgdGV4dEM6IFwiY2FtZWxDYXNlID0+ICh3aXR8aCBzcGVjaWFsKSBDaGFSQWN0ZXJSc1xcblxcbmRhc2gtY2FzZVxcblxcbnNuYWtlX2Nhc2Vfd29yZFxcblwiXG4gICAgICBlbnN1cmUgJ2N0cmwtZScsIHRleHRDOiBcImNhbWVsQ2FzZSA9PiAod2l0aCBzcGVjaWF8bCkgQ2hhUkFjdGVyUnNcXG5cXG5kYXNoLWNhc2VcXG5cXG5zbmFrZV9jYXNlX3dvcmRcXG5cIlxuICAgICAgZW5zdXJlICdjdHJsLWUnLCB0ZXh0QzogXCJjYW1lbENhc2UgPT4gKHdpdGggc3BlY2lhbHwpIENoYVJBY3RlclJzXFxuXFxuZGFzaC1jYXNlXFxuXFxuc25ha2VfY2FzZV93b3JkXFxuXCJcbiAgICAgIGVuc3VyZSAnY3RybC1lJywgdGV4dEM6IFwiY2FtZWxDYXNlID0+ICh3aXRoIHNwZWNpYWwpIENofGFSQWN0ZXJSc1xcblxcbmRhc2gtY2FzZVxcblxcbnNuYWtlX2Nhc2Vfd29yZFxcblwiXG4gICAgICBlbnN1cmUgJ2N0cmwtZScsIHRleHRDOiBcImNhbWVsQ2FzZSA9PiAod2l0aCBzcGVjaWFsKSBDaGF8UkFjdGVyUnNcXG5cXG5kYXNoLWNhc2VcXG5cXG5zbmFrZV9jYXNlX3dvcmRcXG5cIlxuICAgICAgZW5zdXJlICdjdHJsLWUnLCB0ZXh0QzogXCJjYW1lbENhc2UgPT4gKHdpdGggc3BlY2lhbCkgQ2hhUkFjdGV8clJzXFxuXFxuZGFzaC1jYXNlXFxuXFxuc25ha2VfY2FzZV93b3JkXFxuXCJcbiAgICAgIGVuc3VyZSAnY3RybC1lJywgdGV4dEM6IFwiY2FtZWxDYXNlID0+ICh3aXRoIHNwZWNpYWwpIENoYVJBY3RlclJ8c1xcblxcbmRhc2gtY2FzZVxcblxcbnNuYWtlX2Nhc2Vfd29yZFxcblwiXG4gICAgICBlbnN1cmUgJ2N0cmwtZScsIHRleHRDOiBcImNhbWVsQ2FzZSA9PiAod2l0aCBzcGVjaWFsKSBDaGFSQWN0ZXJSc1xcblxcbmRhc3xoLWNhc2VcXG5cXG5zbmFrZV9jYXNlX3dvcmRcXG5cIlxuICAgICAgZW5zdXJlICdjdHJsLWUnLCB0ZXh0QzogXCJjYW1lbENhc2UgPT4gKHdpdGggc3BlY2lhbCkgQ2hhUkFjdGVyUnNcXG5cXG5kYXNofC1jYXNlXFxuXFxuc25ha2VfY2FzZV93b3JkXFxuXCJcbiAgICAgIGVuc3VyZSAnY3RybC1lJywgdGV4dEM6IFwiY2FtZWxDYXNlID0+ICh3aXRoIHNwZWNpYWwpIENoYVJBY3RlclJzXFxuXFxuZGFzaC1jYXN8ZVxcblxcbnNuYWtlX2Nhc2Vfd29yZFxcblwiXG4gICAgICBlbnN1cmUgJ2N0cmwtZScsIHRleHRDOiBcImNhbWVsQ2FzZSA9PiAod2l0aCBzcGVjaWFsKSBDaGFSQWN0ZXJSc1xcblxcbmRhc2gtY2FzZVxcblxcbnNuYWt8ZV9jYXNlX3dvcmRcXG5cIlxuICAgICAgZW5zdXJlICdjdHJsLWUnLCB0ZXh0QzogXCJjYW1lbENhc2UgPT4gKHdpdGggc3BlY2lhbCkgQ2hhUkFjdGVyUnNcXG5cXG5kYXNoLWNhc2VcXG5cXG5zbmFrZV9jYXN8ZV93b3JkXFxuXCJcbiAgICAgIGVuc3VyZSAnY3RybC1lJywgdGV4dEM6IFwiY2FtZWxDYXNlID0+ICh3aXRoIHNwZWNpYWwpIENoYVJBY3RlclJzXFxuXFxuZGFzaC1jYXNlXFxuXFxuc25ha2VfY2FzZV93b3J8ZFxcblwiXG4iXX0=
