(function() {
  var Point, TextData, dispatch, getView, getVimState, ref, settings;

  Point = require('atom').Point;

  ref = require('./spec-helper'), getVimState = ref.getVimState, dispatch = ref.dispatch, TextData = ref.TextData, getView = ref.getView;

  settings = require('../lib/settings');

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
          text: " ab cde1+- \n xyz\n\nzip }\n last"
        });
      });
      describe("as a motion", function() {
        beforeEach(function() {
          return set({
            cursor: [4, 1]
          });
        });
        return it("moves the cursor to the beginning of the previous word", function() {
          ensure('b', {
            cursor: [3, 4]
          });
          ensure('b', {
            cursor: [3, 0]
          });
          ensure('b', {
            cursor: [2, 0]
          });
          ensure('b', {
            cursor: [1, 1]
          });
          ensure('b', {
            cursor: [0, 8]
          });
          ensure('b', {
            cursor: [0, 4]
          });
          ensure('b', {
            cursor: [0, 1]
          });
          ensure('b', {
            cursor: [0, 0]
          });
          return ensure('b', {
            cursor: [0, 0]
          });
        });
      });
      return describe("as a selection", function() {
        describe("within a word", function() {
          return it("selects to the beginning of the current word", function() {
            set({
              cursor: [0, 2]
            });
            return ensure('y b', {
              cursor: [0, 1],
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
              cursor: [0, 4]
            });
            return ensure('y b', {
              cursor: [0, 1],
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
          text: "  abcde",
          cursor: [0, 4]
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
    describe("the 0 keybinding", function() {
      beforeEach(function() {
        return set({
          text: "  a\n",
          cursor: [0, 2]
        });
      });
      return describe("as a motion", function() {
        return it("moves the cursor to the beginning of the line", function() {
          return ensure('0', {
            cursor: [0, 0]
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
    describe("the gg keybinding", function() {
      beforeEach(function() {
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
    describe("the G keybinding", function() {
      beforeEach(function() {
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
    describe("the H, M, L keybinding", function() {
      var eel;
      eel = [][0];
      beforeEach(function() {
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
    describe("moveToFirstCharacterOnVerticalMotion setting", function() {
      beforeEach(function() {
        settings.set('moveToFirstCharacterOnVerticalMotion', false);
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
      var ensureJumpAndBack, ensureJumpAndBackLinewise, ensureMark;
      ensureMark = function(_keystroke, option) {
        keystroke(_keystroke);
        ensure({
          cursor: option.cursor
        });
        ensure({
          mark: {
            "`": option.mark
          }
        });
        return ensure({
          mark: {
            "'": option.mark
          }
        });
      };
      ensureJumpAndBack = function(keystroke, option) {
        var afterMove, initial;
        initial = editor.getCursorBufferPosition();
        ensureMark(keystroke, {
          cursor: option.cursor,
          mark: initial
        });
        afterMove = editor.getCursorBufferPosition();
        expect(initial.isEqual(afterMove)).toBe(false);
        return ensureMark("` `", {
          cursor: initial,
          mark: option.cursor
        });
      };
      ensureJumpAndBackLinewise = function(keystroke, option) {
        var afterMove, initial;
        initial = editor.getCursorBufferPosition();
        expect(initial.column).not.toBe(0);
        ensureMark(keystroke, {
          cursor: option.cursor,
          mark: initial
        });
        afterMove = editor.getCursorBufferPosition();
        expect(initial.isEqual(afterMove)).toBe(false);
        return ensureMark("' '", {
          cursor: [initial.row, 0],
          mark: option.cursor
        });
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
          jasmine.attachToDOM(getView(atom.workspace));
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
            cursor: [5, 0]
          });
        });
        it("g g jump&back", function() {
          return ensureJumpAndBack("g g", {
            cursor: [0, 0]
          });
        });
        it("100 % jump&back", function() {
          return ensureJumpAndBack("1 0 0 %", {
            cursor: [5, 0]
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
            cursor: [5, 0]
          });
        });
        it("H jump&back", function() {
          return ensureJumpAndBack("H", {
            cursor: [0, 0]
          });
        });
        it("M jump&back", function() {
          return ensureJumpAndBack("M", {
            cursor: [2, 0]
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
          return ensureJumpAndBack([
            "/", {
              search: 'oo'
            }
          ], {
            cursor: [5, 3]
          });
        });
        it("? jump&back", function() {
          return ensureJumpAndBack([
            "?", {
              search: 'oo'
            }
          ], {
            cursor: [0, 3]
          });
        });
        it("n jump&back", function() {
          set({
            cursor: [0, 0]
          });
          ensure([
            '/', {
              search: 'oo'
            }
          ], {
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
          ensure([
            '?', {
              search: 'oo'
            }
          ], {
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
            cursor: [5, 0]
          });
        });
        it("g g jump&back linewise", function() {
          return ensureJumpAndBackLinewise("g g", {
            cursor: [0, 0]
          });
        });
        it("100 % jump&back linewise", function() {
          return ensureJumpAndBackLinewise("1 0 0 %", {
            cursor: [5, 0]
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
            cursor: [5, 0]
          });
        });
        it("H jump&back linewise", function() {
          return ensureJumpAndBackLinewise("H", {
            cursor: [0, 0]
          });
        });
        it("M jump&back linewise", function() {
          return ensureJumpAndBackLinewise("M", {
            cursor: [2, 0]
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9zcGVjL21vdGlvbi1nZW5lcmFsLXNwZWMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQyxRQUFTLE9BQUEsQ0FBUSxNQUFSOztFQUNWLE1BQTZDLE9BQUEsQ0FBUSxlQUFSLENBQTdDLEVBQUMsNkJBQUQsRUFBYyx1QkFBZCxFQUF3Qix1QkFBeEIsRUFBa0M7O0VBQ2xDLFFBQUEsR0FBVyxPQUFBLENBQVEsaUJBQVI7O0VBRVgsUUFBQSxDQUFTLGdCQUFULEVBQTJCLFNBQUE7QUFDekIsUUFBQTtJQUFBLE9BQTRELEVBQTVELEVBQUMsYUFBRCxFQUFNLGdCQUFOLEVBQWMsbUJBQWQsRUFBeUIsZ0JBQXpCLEVBQWlDLHVCQUFqQyxFQUFnRDtJQUVoRCxVQUFBLENBQVcsU0FBQTthQUNULFdBQUEsQ0FBWSxTQUFDLEtBQUQsRUFBUSxJQUFSO1FBQ1YsUUFBQSxHQUFXO1FBQ1Ysd0JBQUQsRUFBUztlQUNSLGNBQUQsRUFBTSxvQkFBTixFQUFjLDBCQUFkLEVBQTJCO01BSGpCLENBQVo7SUFEUyxDQUFYO0lBTUEsUUFBQSxDQUFTLGdCQUFULEVBQTJCLFNBQUE7QUFDekIsVUFBQTtNQUFBLElBQUEsR0FBTztNQUNQLFVBQUEsQ0FBVyxTQUFBO1FBQ1QsSUFBQSxHQUFXLElBQUEsUUFBQSxDQUFTLHNCQUFUO2VBTVgsR0FBQSxDQUNFO1VBQUEsSUFBQSxFQUFNLElBQUksQ0FBQyxNQUFMLENBQUEsQ0FBTjtVQUNBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBRFI7U0FERjtNQVBTLENBQVg7TUFXQSxRQUFBLENBQVMsa0JBQVQsRUFBNkIsU0FBQTtRQUMzQixRQUFBLENBQVMsYUFBVCxFQUF3QixTQUFBO1VBQ3RCLEVBQUEsQ0FBRyxxREFBSCxFQUEwRCxTQUFBO1lBQ3hELE1B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QUEsRUFBTyw0RUFBUDtTQUFaO1FBQ0EsTUFBQSxDQUFPLEdBQVAsRUFBWTtVQUFBLEtBQUEsRUFBTyw0RUFBUDtTQUFaO1FBQ0EsTUFBQSxDQUFPLEdBQVAsRUFBWTtVQUFBLEtBQUEsRUFBTyw0RUFBUDtTQUFaO1FBQ0EsTUFBQSxDQUFPLEdBQVAsRUFBWTtVQUFBLEtBQUEsRUFBTyw0RUFBUDtTQUFaO1FBQ0EsTUFBQSxDQUFPLEdBQVAsRUFBWTtVQUFBLEtBQUEsRUFBTyw0RUFBUDtTQUFaO1FBQ0EsTUFBQSxDQUFPLEdBQVAsRUFBWTtVQUFBLEtBQUEsRUFBTyw0RUFBUDtTQUFaO1FBQ0EsTUFBQSxDQUFPLEdBQVAsRUFBWTtVQUFBLEtBQUEsRUFBTyw0RUFBUDtTQUFaO1FBQ0EsTUFBQSxDQUFPLEdBQVAsRUFBWTtVQUFBLEtBQUEsRUFBTyw0RUFBUDtTQUFaO1FBQ0EsTUFBQSxDQUFPLEdBQVAsRUFBWTtVQUFBLEtBQUEsRUFBTyw0RUFBUDtTQUFaO1FBQ0EsTUFBQSxDQUFPLEdBQVAsRUFBWTtVQUFBLEtBQUEsRUFBTyw0RUFBUDtTQUFaO1FBQ0EsTUFBQSxDQUFPLEdBQVAsRUFBWTtVQUFBLEtBQUEsRUFBTyw0RUFBUDtTQUFaO1FBQ0EsTUFBQSxDQUFPLEdBQVAsRUFBWTtVQUFBLEtBQUEsRUFBTyw0RUFBUDtTQUFaO1FBQ0EsTUFBQSxDQUFPLEdBQVAsRUFBWTtVQUFBLEtBQUEsRUFBTyw0RUFBUDtTQUFaO1FBQ0EsTUFBQSxDQUFPLEdBQVAsRUFBWTtVQUFBLEtBQUEsRUFBTyw0RUFBUDtTQUFaO1FBQ0EsTUFBQSxDQUFPLEdBQVAsRUFBWTtVQUFBLEtBQUEsRUFBTyw0RUFBUDtTQUFaO1FBQ0EsTUFBQSxDQUFPLEdBQVAsRUFBWTtVQUFBLEtBQUEsRUFBTyw0RUFBUDtTQUFaO1FBQ0EsTUFBQSxDQUFPLEdBQVAsRUFBWTtVQUFBLEtBQUEsRUFBTyw0RUFBUDtTQUFaO1FBQ0EsTUFBQSxDQUFPLEdBQVAsRUFBWTtVQUFBLEtBQUEsRUFBTyw0RUFBUDtTQUFaO1FBQ0EsTUFBQSxDQUFPLEdBQVAsRUFBWTtVQUFBLEtBQUEsRUFBTyw0RUFBUDtTQUFaO1FBQ0EsTUFBQSxDQUFPLEdBQVAsRUFBWTtVQUFBLEtBQUEsRUFBTyw0RUFBUDtTQUFaO2VBQ0EsTUFBQSxDQUFPLEdBQVAsRUFBWTtVQUFBLEtBQUEsRUFBTyw0RUFBUDtTQUFaO01BbkNrQyxDQUFwQzthQW9DQSxFQUFBLENBQUcsd0JBQUgsRUFBNkIsU0FBQTtRQUMzQixHQUFBLENBQUk7VUFBQSxLQUFBLEVBQU8sNEVBQVA7U0FBSjtRQUNBLE1BQUEsQ0FBTyxRQUFQLEVBQWlCO1VBQUEsS0FBQSxFQUFPLDRFQUFQO1NBQWpCO1FBQ0EsTUFBQSxDQUFPLFFBQVAsRUFBaUI7VUFBQSxLQUFBLEVBQU8sNEVBQVA7U0FBakI7UUFDQSxNQUFBLENBQU8sUUFBUCxFQUFpQjtVQUFBLEtBQUEsRUFBTyw0RUFBUDtTQUFqQjtRQUNBLE1BQUEsQ0FBTyxRQUFQLEVBQWlCO1VBQUEsS0FBQSxFQUFPLDRFQUFQO1NBQWpCO1FBQ0EsTUFBQSxDQUFPLFFBQVAsRUFBaUI7VUFBQSxLQUFBLEVBQU8sNEVBQVA7U0FBakI7UUFDQSxNQUFBLENBQU8sUUFBUCxFQUFpQjtVQUFBLEtBQUEsRUFBTyw0RUFBUDtTQUFqQjtRQUNBLE1BQUEsQ0FBTyxRQUFQLEVBQWlCO1VBQUEsS0FBQSxFQUFPLDRFQUFQO1NBQWpCO1FBQ0EsTUFBQSxDQUFPLFFBQVAsRUFBaUI7VUFBQSxLQUFBLEVBQU8sNEVBQVA7U0FBakI7UUFDQSxNQUFBLENBQU8sUUFBUCxFQUFpQjtVQUFBLEtBQUEsRUFBTyw0RUFBUDtTQUFqQjtRQUNBLE1BQUEsQ0FBTyxRQUFQLEVBQWlCO1VBQUEsS0FBQSxFQUFPLDRFQUFQO1NBQWpCO1FBQ0EsTUFBQSxDQUFPLFFBQVAsRUFBaUI7VUFBQSxLQUFBLEVBQU8sNEVBQVA7U0FBakI7UUFDQSxNQUFBLENBQU8sUUFBUCxFQUFpQjtVQUFBLEtBQUEsRUFBTyw0RUFBUDtTQUFqQjtRQUNBLE1BQUEsQ0FBTyxRQUFQLEVBQWlCO1VBQUEsS0FBQSxFQUFPLDRFQUFQO1NBQWpCO1FBQ0EsTUFBQSxDQUFPLFFBQVAsRUFBaUI7VUFBQSxLQUFBLEVBQU8sNEVBQVA7U0FBakI7UUFDQSxNQUFBLENBQU8sUUFBUCxFQUFpQjtVQUFBLEtBQUEsRUFBTyw0RUFBUDtTQUFqQjtRQUNBLE1BQUEsQ0FBTyxRQUFQLEVBQWlCO1VBQUEsS0FBQSxFQUFPLDRFQUFQO1NBQWpCO2VBQ0EsTUFBQSxDQUFPLFFBQVAsRUFBaUI7VUFBQSxLQUFBLEVBQU8sNEVBQVA7U0FBakI7TUFsQjJCLENBQTdCO0lBNUN5QixDQUEzQjtFQXg0RHlCLENBQTNCO0FBSkEiLCJzb3VyY2VzQ29udGVudCI6WyJ7UG9pbnR9ID0gcmVxdWlyZSAnYXRvbSdcbntnZXRWaW1TdGF0ZSwgZGlzcGF0Y2gsIFRleHREYXRhLCBnZXRWaWV3fSA9IHJlcXVpcmUgJy4vc3BlYy1oZWxwZXInXG5zZXR0aW5ncyA9IHJlcXVpcmUgJy4uL2xpYi9zZXR0aW5ncydcblxuZGVzY3JpYmUgXCJNb3Rpb24gZ2VuZXJhbFwiLCAtPlxuICBbc2V0LCBlbnN1cmUsIGtleXN0cm9rZSwgZWRpdG9yLCBlZGl0b3JFbGVtZW50LCB2aW1TdGF0ZV0gPSBbXVxuXG4gIGJlZm9yZUVhY2ggLT5cbiAgICBnZXRWaW1TdGF0ZSAoc3RhdGUsIF92aW0pIC0+XG4gICAgICB2aW1TdGF0ZSA9IHN0YXRlICMgdG8gcmVmZXIgYXMgdmltU3RhdGUgbGF0ZXIuXG4gICAgICB7ZWRpdG9yLCBlZGl0b3JFbGVtZW50fSA9IHZpbVN0YXRlXG4gICAgICB7c2V0LCBlbnN1cmUsIGtleXN0cm9rZX0gPSBfdmltXG5cbiAgZGVzY3JpYmUgXCJzaW1wbGUgbW90aW9uc1wiLCAtPlxuICAgIHRleHQgPSBudWxsXG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgdGV4dCA9IG5ldyBUZXh0RGF0YSBcIlwiXCJcbiAgICAgICAgMTIzNDVcbiAgICAgICAgYWJjZFxuICAgICAgICBBQkNERVxcblxuICAgICAgICBcIlwiXCJcblxuICAgICAgc2V0XG4gICAgICAgIHRleHQ6IHRleHQuZ2V0UmF3KClcbiAgICAgICAgY3Vyc29yOiBbMSwgMV1cblxuICAgIGRlc2NyaWJlIFwidGhlIGgga2V5YmluZGluZ1wiLCAtPlxuICAgICAgZGVzY3JpYmUgXCJhcyBhIG1vdGlvblwiLCAtPlxuICAgICAgICBpdCBcIm1vdmVzIHRoZSBjdXJzb3IgbGVmdCwgYnV0IG5vdCB0byB0aGUgcHJldmlvdXMgbGluZVwiLCAtPlxuICAgICAgICAgIGVuc3VyZSAnaCcsIGN1cnNvcjogWzEsIDBdXG4gICAgICAgICAgZW5zdXJlICdoJywgY3Vyc29yOiBbMSwgMF1cblxuICAgICAgICBpdCBcIm1vdmVzIHRoZSBjdXJzb3IgdG8gdGhlIHByZXZpb3VzIGxpbmUgaWYgd3JhcExlZnRSaWdodE1vdGlvbiBpcyB0cnVlXCIsIC0+XG4gICAgICAgICAgc2V0dGluZ3Muc2V0KCd3cmFwTGVmdFJpZ2h0TW90aW9uJywgdHJ1ZSlcbiAgICAgICAgICBlbnN1cmUgJ2ggaCcsIGN1cnNvcjogWzAsIDRdXG5cbiAgICAgIGRlc2NyaWJlIFwiYXMgYSBzZWxlY3Rpb25cIiwgLT5cbiAgICAgICAgaXQgXCJzZWxlY3RzIHRoZSBjaGFyYWN0ZXIgdG8gdGhlIGxlZnRcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJ3kgaCcsXG4gICAgICAgICAgICBjdXJzb3I6IFsxLCAwXVxuICAgICAgICAgICAgcmVnaXN0ZXI6ICdcIic6IHRleHQ6ICdhJ1xuXG4gICAgZGVzY3JpYmUgXCJ0aGUgaiBrZXliaW5kaW5nXCIsIC0+XG4gICAgICBpdCBcIm1vdmVzIHRoZSBjdXJzb3IgZG93biwgYnV0IG5vdCB0byB0aGUgZW5kIG9mIHRoZSBsYXN0IGxpbmVcIiwgLT5cbiAgICAgICAgZW5zdXJlICdqJywgY3Vyc29yOiBbMiwgMV1cbiAgICAgICAgZW5zdXJlICdqJywgY3Vyc29yOiBbMiwgMV1cblxuICAgICAgaXQgXCJtb3ZlcyB0aGUgY3Vyc29yIHRvIHRoZSBlbmQgb2YgdGhlIGxpbmUsIG5vdCBwYXN0IGl0XCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFswLCA0XVxuICAgICAgICBlbnN1cmUgJ2onLCBjdXJzb3I6IFsxLCAzXVxuXG4gICAgICBpdCBcInJlbWVtYmVycyB0aGUgY29sdW1uIGl0IHdhcyBpbiBhZnRlciBtb3ZpbmcgdG8gc2hvcnRlciBsaW5lXCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFswLCA0XVxuICAgICAgICBlbnN1cmUgJ2onLCBjdXJzb3I6IFsxLCAzXVxuICAgICAgICBlbnN1cmUgJ2onLCBjdXJzb3I6IFsyLCA0XVxuXG4gICAgICBpdCBcIm5ldmVyIGdvIHBhc3QgbGFzdCBuZXdsaW5lXCIsIC0+XG4gICAgICAgIGVuc3VyZSAnMSAwIGonLCBjdXJzb3I6IFsyLCAxXVxuXG4gICAgICBkZXNjcmliZSBcIndoZW4gdmlzdWFsIG1vZGVcIiwgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIGVuc3VyZSAndicsIGN1cnNvcjogWzEsIDJdLCBzZWxlY3RlZFRleHQ6ICdiJ1xuXG4gICAgICAgIGl0IFwibW92ZXMgdGhlIGN1cnNvciBkb3duXCIsIC0+XG4gICAgICAgICAgZW5zdXJlICdqJywgY3Vyc29yOiBbMiwgMl0sIHNlbGVjdGVkVGV4dDogXCJiY2RcXG5BQlwiXG5cbiAgICAgICAgaXQgXCJkb2Vzbid0IGdvIG92ZXIgYWZ0ZXIgdGhlIGxhc3QgbGluZVwiLCAtPlxuICAgICAgICAgIGVuc3VyZSAnaicsIGN1cnNvcjogWzIsIDJdLCBzZWxlY3RlZFRleHQ6IFwiYmNkXFxuQUJcIlxuXG4gICAgICAgIGl0IFwia2VlcCBzYW1lIGNvbHVtbihnb2FsQ29sdW1uKSBldmVuIGFmdGVyIGFjcm9zcyB0aGUgZW1wdHkgbGluZVwiLCAtPlxuICAgICAgICAgIGtleXN0cm9rZSAnZXNjYXBlJ1xuICAgICAgICAgIHNldFxuICAgICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICAgIGFiY2RlZmdcblxuICAgICAgICAgICAgICBhYmNkZWZnXG4gICAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgY3Vyc29yOiBbMCwgM11cbiAgICAgICAgICBlbnN1cmUgJ3YnLCBjdXJzb3I6IFswLCA0XVxuICAgICAgICAgIGVuc3VyZSAnaiBqJywgY3Vyc29yOiBbMiwgNF0sIHNlbGVjdGVkVGV4dDogXCJkZWZnXFxuXFxuYWJjZFwiXG5cbiAgICAgICAgIyBbRklYTUVdIHRoZSBwbGFjZSBvZiB0aGlzIHNwZWMgaXMgbm90IGFwcHJvcHJpYXRlLlxuICAgICAgICBpdCBcIm9yaWdpbmFsIHZpc3VhbCBsaW5lIHJlbWFpbnMgd2hlbiBqayBhY3Jvc3Mgb3JpZ25hbCBzZWxlY3Rpb25cIiwgLT5cbiAgICAgICAgICB0ZXh0ID0gbmV3IFRleHREYXRhIFwiXCJcIlxuICAgICAgICAgICAgbGluZTBcbiAgICAgICAgICAgIGxpbmUxXG4gICAgICAgICAgICBsaW5lMlxcblxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgc2V0XG4gICAgICAgICAgICB0ZXh0OiB0ZXh0LmdldFJhdygpXG4gICAgICAgICAgICBjdXJzb3I6IFsxLCAxXVxuXG4gICAgICAgICAgZW5zdXJlICdWJywgc2VsZWN0ZWRUZXh0OiB0ZXh0LmdldExpbmVzKFsxXSlcbiAgICAgICAgICBlbnN1cmUgJ2onLCBzZWxlY3RlZFRleHQ6IHRleHQuZ2V0TGluZXMoWzEsIDJdKVxuICAgICAgICAgIGVuc3VyZSAnaycsIHNlbGVjdGVkVGV4dDogdGV4dC5nZXRMaW5lcyhbMV0pXG4gICAgICAgICAgZW5zdXJlICdrJywgc2VsZWN0ZWRUZXh0OiB0ZXh0LmdldExpbmVzKFswLCAxXSlcbiAgICAgICAgICBlbnN1cmUgJ2onLCBzZWxlY3RlZFRleHQ6IHRleHQuZ2V0TGluZXMoWzFdKVxuICAgICAgICAgIGVuc3VyZSAnaicsIHNlbGVjdGVkVGV4dDogdGV4dC5nZXRMaW5lcyhbMSwgMl0pXG5cbiAgICBkZXNjcmliZSBcIm1vdmUtZG93bi13cmFwLCBtb3ZlLXVwLXdyYXBcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgYXRvbS5rZXltYXBzLmFkZCBcInRlc3RcIixcbiAgICAgICAgICAnYXRvbS10ZXh0LWVkaXRvci52aW0tbW9kZS1wbHVzOm5vdCguaW5zZXJ0LW1vZGUpJzpcbiAgICAgICAgICAgICdrJzogJ3ZpbS1tb2RlLXBsdXM6bW92ZS11cC13cmFwJ1xuICAgICAgICAgICAgJ2onOiAndmltLW1vZGUtcGx1czptb3ZlLWRvd24td3JhcCdcblxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICBoZWxsb1xuICAgICAgICAgIGhlbGxvXG4gICAgICAgICAgaGVsbG9cbiAgICAgICAgICBoZWxsb1xcblxuICAgICAgICAgIFwiXCJcIlxuICAgICAgZGVzY3JpYmUgJ21vdmUtZG93bi13cmFwJywgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFszLCAxXVxuICAgICAgICBpdCBcIm1vdmUgZG93biB3aXRoIHdyYXdwXCIsIC0+IGVuc3VyZSAnaicsIGN1cnNvcjogWzAsIDFdXG4gICAgICAgIGl0IFwibW92ZSBkb3duIHdpdGggd3Jhd3BcIiwgLT4gZW5zdXJlICcyIGonLCBjdXJzb3I6IFsxLCAxXVxuICAgICAgICBpdCBcIm1vdmUgZG93biB3aXRoIHdyYXdwXCIsIC0+IGVuc3VyZSAnNCBqJywgY3Vyc29yOiBbMywgMV1cblxuICAgICAgZGVzY3JpYmUgJ21vdmUtdXAtd3JhcCcsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMV1cblxuICAgICAgICBpdCBcIm1vdmUgZG93biB3aXRoIHdyYXdwXCIsIC0+IGVuc3VyZSAnaycsIGN1cnNvcjogWzMsIDFdXG4gICAgICAgIGl0IFwibW92ZSBkb3duIHdpdGggd3Jhd3BcIiwgLT4gZW5zdXJlICcyIGsnLCBjdXJzb3I6IFsyLCAxXVxuICAgICAgICBpdCBcIm1vdmUgZG93biB3aXRoIHdyYXdwXCIsIC0+IGVuc3VyZSAnNCBrJywgY3Vyc29yOiBbMCwgMV1cblxuXG4gICAgIyBbTk9URV0gU2VlICM1NjBcbiAgICAjIFRoaXMgc3BlYyBpcyBpbnRlbmRlZCB0byBiZSB1c2VkIGluIGxvY2FsIHRlc3QsIG5vdCBhdCBDSSBzZXJ2aWNlLlxuICAgICMgU2FmZSB0byBleGVjdXRlIGlmIGl0IHBhc3NlcywgYnV0IGZyZWV6ZSBlZGl0b3Igd2hlbiBpdCBmYWlsLlxuICAgICMgU28gZXhwbGljaXRseSBkaXNhYmxlZCBiZWNhdXNlIEkgZG9uJ3Qgd2FudCBiZSBiYW5uZWQgYnkgQ0kgc2VydmljZS5cbiAgICAjIEVuYWJsZSB0aGlzIG9uIGRlbW1hbmQgd2hlbiBmcmVlemluZyBoYXBwZW5zIGFnYWluIVxuICAgIHhkZXNjcmliZSBcIndpdGggYmlnIGNvdW50IHdhcyBnaXZlblwiLCAtPlxuICAgICAgQklHX05VTUJFUiA9IE51bWJlci5NQVhfU0FGRV9JTlRFR0VSXG4gICAgICBlbnN1cmVCaWdDb3VudE1vdGlvbiA9IChrZXlzdHJva2VzLCBvcHRpb25zKSAtPlxuICAgICAgICBjb3VudCA9IFN0cmluZyhCSUdfTlVNQkVSKS5zcGxpdCgnJykuam9pbignICcpXG4gICAgICAgIGtleXN0cm9rZXMgPSBrZXlzdHJva2VzLnNwbGl0KCcnKS5qb2luKCcgJylcbiAgICAgICAgZW5zdXJlKFwiI3tjb3VudH0gI3trZXlzdHJva2VzfVwiLCBvcHRpb25zKVxuXG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIGF0b20ua2V5bWFwcy5hZGQgXCJ0ZXN0XCIsXG4gICAgICAgICAgJ2F0b20tdGV4dC1lZGl0b3IudmltLW1vZGUtcGx1czpub3QoLmluc2VydC1tb2RlKSc6XG4gICAgICAgICAgICAnZyB7JzogJ3ZpbS1tb2RlLXBsdXM6bW92ZS10by1wcmV2aW91cy1mb2xkLXN0YXJ0J1xuICAgICAgICAgICAgJ2cgfSc6ICd2aW0tbW9kZS1wbHVzOm1vdmUtdG8tbmV4dC1mb2xkLXN0YXJ0J1xuICAgICAgICAgICAgJywgTic6ICd2aW0tbW9kZS1wbHVzOm1vdmUtdG8tcHJldmlvdXMtbnVtYmVyJ1xuICAgICAgICAgICAgJywgbic6ICd2aW0tbW9kZS1wbHVzOm1vdmUtdG8tbmV4dC1udW1iZXInXG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgIDAwMDBcbiAgICAgICAgICAxMTExXG4gICAgICAgICAgMjIyMlxcblxuICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIGN1cnNvcjogWzEsIDJdXG5cbiAgICAgIGl0IFwiYnkgYGpgXCIsIC0+IGVuc3VyZUJpZ0NvdW50TW90aW9uICdqJywgY3Vyc29yOiBbMiwgMl1cbiAgICAgIGl0IFwiYnkgYGtgXCIsIC0+IGVuc3VyZUJpZ0NvdW50TW90aW9uICdrJywgY3Vyc29yOiBbMCwgMl1cbiAgICAgIGl0IFwiYnkgYGhgXCIsIC0+IGVuc3VyZUJpZ0NvdW50TW90aW9uICdoJywgY3Vyc29yOiBbMSwgMF1cbiAgICAgIGl0IFwiYnkgYGxgXCIsIC0+IGVuc3VyZUJpZ0NvdW50TW90aW9uICdsJywgY3Vyc29yOiBbMSwgM11cbiAgICAgIGl0IFwiYnkgYFtgXCIsIC0+IGVuc3VyZUJpZ0NvdW50TW90aW9uICdbJywgY3Vyc29yOiBbMCwgMl1cbiAgICAgIGl0IFwiYnkgYF1gXCIsIC0+IGVuc3VyZUJpZ0NvdW50TW90aW9uICddJywgY3Vyc29yOiBbMiwgMl1cbiAgICAgIGl0IFwiYnkgYHdgXCIsIC0+IGVuc3VyZUJpZ0NvdW50TW90aW9uICd3JywgY3Vyc29yOiBbMiwgM11cbiAgICAgIGl0IFwiYnkgYFdgXCIsIC0+IGVuc3VyZUJpZ0NvdW50TW90aW9uICdXJywgY3Vyc29yOiBbMiwgM11cbiAgICAgIGl0IFwiYnkgYGJgXCIsIC0+IGVuc3VyZUJpZ0NvdW50TW90aW9uICdiJywgY3Vyc29yOiBbMCwgMF1cbiAgICAgIGl0IFwiYnkgYEJgXCIsIC0+IGVuc3VyZUJpZ0NvdW50TW90aW9uICdCJywgY3Vyc29yOiBbMCwgMF1cbiAgICAgIGl0IFwiYnkgYGVgXCIsIC0+IGVuc3VyZUJpZ0NvdW50TW90aW9uICdlJywgY3Vyc29yOiBbMiwgM11cbiAgICAgIGl0IFwiYnkgYChgXCIsIC0+IGVuc3VyZUJpZ0NvdW50TW90aW9uICcoJywgY3Vyc29yOiBbMCwgMF1cbiAgICAgIGl0IFwiYnkgYClgXCIsIC0+IGVuc3VyZUJpZ0NvdW50TW90aW9uICcpJywgY3Vyc29yOiBbMiwgM11cbiAgICAgIGl0IFwiYnkgYHtgXCIsIC0+IGVuc3VyZUJpZ0NvdW50TW90aW9uICd7JywgY3Vyc29yOiBbMCwgMF1cbiAgICAgIGl0IFwiYnkgYH1gXCIsIC0+IGVuc3VyZUJpZ0NvdW50TW90aW9uICd9JywgY3Vyc29yOiBbMiwgM11cbiAgICAgIGl0IFwiYnkgYC1gXCIsIC0+IGVuc3VyZUJpZ0NvdW50TW90aW9uICctJywgY3Vyc29yOiBbMCwgMF1cbiAgICAgIGl0IFwiYnkgYF9gXCIsIC0+IGVuc3VyZUJpZ0NvdW50TW90aW9uICdfJywgY3Vyc29yOiBbMiwgMF1cbiAgICAgIGl0IFwiYnkgYGcge2BcIiwgLT4gZW5zdXJlQmlnQ291bnRNb3Rpb24gJ2cgeycsIGN1cnNvcjogWzEsIDJdICMgTm8gZm9sZCBubyBtb3ZlIGJ1dCB3b24ndCBmcmVlemUuXG4gICAgICBpdCBcImJ5IGBnIH1gXCIsIC0+IGVuc3VyZUJpZ0NvdW50TW90aW9uICdnIH0nLCBjdXJzb3I6IFsxLCAyXSAjIE5vIGZvbGQgbm8gbW92ZSBidXQgd29uJ3QgZnJlZXplLlxuICAgICAgaXQgXCJieSBgLCBOYFwiLCAtPiBlbnN1cmVCaWdDb3VudE1vdGlvbiAnLCBOJywgY3Vyc29yOiBbMSwgMl0gIyBObyBncmFtbWFyLCBubyBtb3ZlIGJ1dCB3b24ndCBmcmVlemUuXG4gICAgICBpdCBcImJ5IGAsIG5gXCIsIC0+IGVuc3VyZUJpZ0NvdW50TW90aW9uICcsIG4nLCBjdXJzb3I6IFsxLCAyXSAjIE5vIGdyYW1tYXIsIG5vIG1vdmUgYnV0IHdvbid0IGZyZWV6ZS5cblxuICAgIGRlc2NyaWJlIFwidGhlIGsga2V5YmluZGluZ1wiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMiwgMV1cblxuICAgICAgaXQgXCJtb3ZlcyB0aGUgY3Vyc29yIHVwXCIsIC0+XG4gICAgICAgIGVuc3VyZSAnaycsIGN1cnNvcjogWzEsIDFdXG5cbiAgICAgIGl0IFwibW92ZXMgdGhlIGN1cnNvciB1cCBhbmQgcmVtZW1iZXIgY29sdW1uIGl0IHdhcyBpblwiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMiwgNF1cbiAgICAgICAgZW5zdXJlICdrJywgY3Vyc29yOiBbMSwgM11cbiAgICAgICAgZW5zdXJlICdrJywgY3Vyc29yOiBbMCwgNF1cblxuICAgICAgaXQgXCJtb3ZlcyB0aGUgY3Vyc29yIHVwLCBidXQgbm90IHRvIHRoZSBiZWdpbm5pbmcgb2YgdGhlIGZpcnN0IGxpbmVcIiwgLT5cbiAgICAgICAgZW5zdXJlICcxIDAgaycsIGN1cnNvcjogWzAsIDFdXG5cbiAgICAgIGRlc2NyaWJlIFwid2hlbiB2aXN1YWwgbW9kZVwiLCAtPlxuICAgICAgICBpdCBcImtlZXAgc2FtZSBjb2x1bW4oZ29hbENvbHVtbikgZXZlbiBhZnRlciBhY3Jvc3MgdGhlIGVtcHR5IGxpbmVcIiwgLT5cbiAgICAgICAgICBzZXRcbiAgICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgICBhYmNkZWZnXG5cbiAgICAgICAgICAgICAgYWJjZGVmZ1xuICAgICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgIGN1cnNvcjogWzIsIDNdXG4gICAgICAgICAgZW5zdXJlICd2JywgY3Vyc29yOiBbMiwgNF0sIHNlbGVjdGVkVGV4dDogJ2QnXG4gICAgICAgICAgZW5zdXJlICdrIGsnLCBjdXJzb3I6IFswLCAzXSwgc2VsZWN0ZWRUZXh0OiBcImRlZmdcXG5cXG5hYmNkXCJcblxuICAgIGRlc2NyaWJlIFwiZ2ogZ2sgaW4gc29mdHdyYXBcIiwgLT5cbiAgICAgIFt0ZXh0XSA9IFtdXG5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgZWRpdG9yLnNldFNvZnRXcmFwcGVkKHRydWUpXG4gICAgICAgIGVkaXRvci5zZXRFZGl0b3JXaWR0aEluQ2hhcnMoMTApXG4gICAgICAgIGVkaXRvci5zZXREZWZhdWx0Q2hhcldpZHRoKDEpXG4gICAgICAgIHRleHQgPSBuZXcgVGV4dERhdGEgXCJcIlwiXG4gICAgICAgICAgMXN0IGxpbmUgb2YgYnVmZmVyXG4gICAgICAgICAgMm5kIGxpbmUgb2YgYnVmZmVyLCBWZXJ5IGxvbmcgbGluZVxuICAgICAgICAgIDNyZCBsaW5lIG9mIGJ1ZmZlclxuXG4gICAgICAgICAgNXRoIGxpbmUgb2YgYnVmZmVyXFxuXG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgIHNldCB0ZXh0OiB0ZXh0LmdldFJhdygpLCBjdXJzb3I6IFswLCAwXVxuXG4gICAgICBkZXNjcmliZSBcInNlbGVjdGlvbiBpcyBub3QgcmV2ZXJzZWRcIiwgLT5cbiAgICAgICAgaXQgXCJzY3JlZW4gcG9zaXRpb24gYW5kIGJ1ZmZlciBwb3NpdGlvbiBpcyBkaWZmZXJlbnRcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJ2cgaicsIGN1cnNvclNjcmVlbjogWzEsIDBdLCBjdXJzb3I6IFswLCA5XVxuICAgICAgICAgIGVuc3VyZSAnZyBqJywgY3Vyc29yU2NyZWVuOiBbMiwgMF0sIGN1cnNvcjogWzEsIDBdXG4gICAgICAgICAgZW5zdXJlICdnIGonLCBjdXJzb3JTY3JlZW46IFszLCAwXSwgY3Vyc29yOiBbMSwgOV1cbiAgICAgICAgICBlbnN1cmUgJ2cgaicsIGN1cnNvclNjcmVlbjogWzQsIDBdLCBjdXJzb3I6IFsxLCAxMl1cblxuICAgICAgICBpdCBcImprIG1vdmUgc2VsZWN0aW9uIGJ1ZmZlci1saW5lIHdpc2VcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJ1YnLCBzZWxlY3RlZFRleHQ6IHRleHQuZ2V0TGluZXMoWzAuLjBdKVxuICAgICAgICAgIGVuc3VyZSAnaicsIHNlbGVjdGVkVGV4dDogdGV4dC5nZXRMaW5lcyhbMC4uMV0pXG4gICAgICAgICAgZW5zdXJlICdqJywgc2VsZWN0ZWRUZXh0OiB0ZXh0LmdldExpbmVzKFswLi4yXSlcbiAgICAgICAgICBlbnN1cmUgJ2onLCBzZWxlY3RlZFRleHQ6IHRleHQuZ2V0TGluZXMoWzAuLjNdKVxuICAgICAgICAgIGVuc3VyZSAnaicsIHNlbGVjdGVkVGV4dDogdGV4dC5nZXRMaW5lcyhbMC4uNF0pXG4gICAgICAgICAgZW5zdXJlICdrJywgc2VsZWN0ZWRUZXh0OiB0ZXh0LmdldExpbmVzKFswLi4zXSlcbiAgICAgICAgICBlbnN1cmUgJ2snLCBzZWxlY3RlZFRleHQ6IHRleHQuZ2V0TGluZXMoWzAuLjJdKVxuICAgICAgICAgIGVuc3VyZSAnaycsIHNlbGVjdGVkVGV4dDogdGV4dC5nZXRMaW5lcyhbMC4uMV0pXG4gICAgICAgICAgZW5zdXJlICdrJywgc2VsZWN0ZWRUZXh0OiB0ZXh0LmdldExpbmVzKFswLi4wXSlcbiAgICAgICAgICBlbnN1cmUgJ2snLCBzZWxlY3RlZFRleHQ6IHRleHQuZ2V0TGluZXMoWzAuLjBdKSAjIGRvIG5vdGhpbmdcblxuICAgICAgZGVzY3JpYmUgXCJzZWxlY3Rpb24gaXMgcmV2ZXJzZWRcIiwgLT5cbiAgICAgICAgaXQgXCJzY3JlZW4gcG9zaXRpb24gYW5kIGJ1ZmZlciBwb3NpdGlvbiBpcyBkaWZmZXJlbnRcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJ2cgaicsIGN1cnNvclNjcmVlbjogWzEsIDBdLCBjdXJzb3I6IFswLCA5XVxuICAgICAgICAgIGVuc3VyZSAnZyBqJywgY3Vyc29yU2NyZWVuOiBbMiwgMF0sIGN1cnNvcjogWzEsIDBdXG4gICAgICAgICAgZW5zdXJlICdnIGonLCBjdXJzb3JTY3JlZW46IFszLCAwXSwgY3Vyc29yOiBbMSwgOV1cbiAgICAgICAgICBlbnN1cmUgJ2cgaicsIGN1cnNvclNjcmVlbjogWzQsIDBdLCBjdXJzb3I6IFsxLCAxMl1cblxuICAgICAgICBpdCBcImprIG1vdmUgc2VsZWN0aW9uIGJ1ZmZlci1saW5lIHdpc2VcIiwgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbNCwgMF1cbiAgICAgICAgICBlbnN1cmUgJ1YnLCBzZWxlY3RlZFRleHQ6IHRleHQuZ2V0TGluZXMoWzQuLjRdKVxuICAgICAgICAgIGVuc3VyZSAnaycsIHNlbGVjdGVkVGV4dDogdGV4dC5nZXRMaW5lcyhbMy4uNF0pXG4gICAgICAgICAgZW5zdXJlICdrJywgc2VsZWN0ZWRUZXh0OiB0ZXh0LmdldExpbmVzKFsyLi40XSlcbiAgICAgICAgICBlbnN1cmUgJ2snLCBzZWxlY3RlZFRleHQ6IHRleHQuZ2V0TGluZXMoWzEuLjRdKVxuICAgICAgICAgIGVuc3VyZSAnaycsIHNlbGVjdGVkVGV4dDogdGV4dC5nZXRMaW5lcyhbMC4uNF0pXG4gICAgICAgICAgZW5zdXJlICdqJywgc2VsZWN0ZWRUZXh0OiB0ZXh0LmdldExpbmVzKFsxLi40XSlcbiAgICAgICAgICBlbnN1cmUgJ2onLCBzZWxlY3RlZFRleHQ6IHRleHQuZ2V0TGluZXMoWzIuLjRdKVxuICAgICAgICAgIGVuc3VyZSAnaicsIHNlbGVjdGVkVGV4dDogdGV4dC5nZXRMaW5lcyhbMy4uNF0pXG4gICAgICAgICAgZW5zdXJlICdqJywgc2VsZWN0ZWRUZXh0OiB0ZXh0LmdldExpbmVzKFs0Li40XSlcbiAgICAgICAgICBlbnN1cmUgJ2onLCBzZWxlY3RlZFRleHQ6IHRleHQuZ2V0TGluZXMoWzQuLjRdKSAjIGRvIG5vdGhpbmdcblxuICAgIGRlc2NyaWJlIFwidGhlIGwga2V5YmluZGluZ1wiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMSwgMl1cblxuICAgICAgaXQgXCJtb3ZlcyB0aGUgY3Vyc29yIHJpZ2h0LCBidXQgbm90IHRvIHRoZSBuZXh0IGxpbmVcIiwgLT5cbiAgICAgICAgZW5zdXJlICdsJywgY3Vyc29yOiBbMSwgM11cbiAgICAgICAgZW5zdXJlICdsJywgY3Vyc29yOiBbMSwgM11cblxuICAgICAgaXQgXCJtb3ZlcyB0aGUgY3Vyc29yIHRvIHRoZSBuZXh0IGxpbmUgaWYgd3JhcExlZnRSaWdodE1vdGlvbiBpcyB0cnVlXCIsIC0+XG4gICAgICAgIHNldHRpbmdzLnNldCgnd3JhcExlZnRSaWdodE1vdGlvbicsIHRydWUpXG4gICAgICAgIGVuc3VyZSAnbCBsJywgY3Vyc29yOiBbMiwgMF1cblxuICAgICAgZGVzY3JpYmUgXCJvbiBhIGJsYW5rIGxpbmVcIiwgLT5cbiAgICAgICAgaXQgXCJkb2Vzbid0IG1vdmUgdGhlIGN1cnNvclwiLCAtPlxuICAgICAgICAgIHNldCB0ZXh0OiBcIlxcblxcblxcblwiLCBjdXJzb3I6IFsxLCAwXVxuICAgICAgICAgIGVuc3VyZSAnbCcsIGN1cnNvcjogWzEsIDBdXG5cbiAgICBkZXNjcmliZSBcIm1vdmUtKHVwL2Rvd24pLXRvLWVkZ2VcIiwgLT5cbiAgICAgIHRleHQgPSBudWxsXG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHRleHQgPSBuZXcgVGV4dERhdGEgXCJcIlwiXG4gICAgICAgICAgMDogIDQgNjcgIDAxMjM0NTY3ODkwMTIzNDU2Nzg5XG4gICAgICAgICAgMTogICAgICAgICAxMjM0NTY3ODkwMTIzNDU2Nzg5XG4gICAgICAgICAgMjogICAgNiA4OTAgICAgICAgICAwMTIzNDU2Nzg5XG4gICAgICAgICAgMzogICAgNiA4OTAgICAgICAgICAwMTIzNDU2Nzg5XG4gICAgICAgICAgNDogICA1NiA4OTAgICAgICAgICAwMTIzNDU2Nzg5XG4gICAgICAgICAgNTogICAgICAgICAgICAgICAgICAwMTIzNDU2Nzg5XG4gICAgICAgICAgNjogICAgICAgICAgICAgICAgICAwMTIzNDU2Nzg5XG4gICAgICAgICAgNzogIDQgNjcgICAgICAgICAgICAwMTIzNDU2Nzg5XFxuXG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgIHNldCB0ZXh0OiB0ZXh0LmdldFJhdygpLCBjdXJzb3I6IFs0LCAzXVxuXG4gICAgICBkZXNjcmliZSBcImVkZ2VuZXNzIG9mIGZpcnN0LWxpbmUgYW5kIGxhc3QtbGluZVwiLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgc2V0XG4gICAgICAgICAgICB0ZXh0XzogXCJcIlwiXG4gICAgICAgICAgICBfX19fdGhpcyBpcyBsaW5lIDBcbiAgICAgICAgICAgIF9fX190aGlzIGlzIHRleHQgb2YgbGluZSAxXG4gICAgICAgICAgICBfX19fdGhpcyBpcyB0ZXh0IG9mIGxpbmUgMlxuICAgICAgICAgICAgX19fX19faGVsbG8gbGluZSAzXG4gICAgICAgICAgICBfX19fX19oZWxsbyBsaW5lIDRcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgY3Vyc29yOiBbMiwgMl1cblxuICAgICAgICBkZXNjcmliZSBcIndoZW4gY29sdW1uIGlzIGxlYWRpbmcgc3BhY2VzXCIsIC0+XG4gICAgICAgICAgaXQgXCJkb2Vzbid0IG1vdmUgY3Vyc29yXCIsIC0+XG4gICAgICAgICAgICBlbnN1cmUgJ1snLCBjdXJzb3I6IFsyLCAyXVxuICAgICAgICAgICAgZW5zdXJlICddJywgY3Vyc29yOiBbMiwgMl1cblxuICAgICAgICBkZXNjcmliZSBcIndoZW4gY29sdW1uIGlzIHRyYWlsaW5nIHNwYWNlc1wiLCAtPlxuICAgICAgICAgIGl0IFwiZG9lc24ndCBtb3ZlIGN1cnNvclwiLCAtPlxuICAgICAgICAgICAgc2V0IGN1cnNvcjogWzEsIDIwXVxuICAgICAgICAgICAgZW5zdXJlICddJywgY3Vyc29yOiBbMiwgMjBdXG4gICAgICAgICAgICBlbnN1cmUgJ10nLCBjdXJzb3I6IFsyLCAyMF1cbiAgICAgICAgICAgIGVuc3VyZSAnWycsIGN1cnNvcjogWzEsIDIwXVxuICAgICAgICAgICAgZW5zdXJlICdbJywgY3Vyc29yOiBbMSwgMjBdXG5cbiAgICAgIGl0IFwibW92ZSB0byBub24tYmxhbmstY2hhciBvbiBib3RoIGZpcnN0IGFuZCBsYXN0IHJvd1wiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbNCwgNF1cbiAgICAgICAgZW5zdXJlICdbJywgY3Vyc29yOiBbMCwgNF1cbiAgICAgICAgZW5zdXJlICddJywgY3Vyc29yOiBbNywgNF1cbiAgICAgIGl0IFwibW92ZSB0byB3aGl0ZSBzcGFjZSBjaGFyIHdoZW4gYm90aCBzaWRlIGNvbHVtbiBpcyBub24tYmxhbmsgY2hhclwiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbNCwgNV1cbiAgICAgICAgZW5zdXJlICdbJywgY3Vyc29yOiBbMCwgNV1cbiAgICAgICAgZW5zdXJlICddJywgY3Vyc29yOiBbNCwgNV1cbiAgICAgICAgZW5zdXJlICddJywgY3Vyc29yOiBbNywgNV1cbiAgICAgIGl0IFwib25seSBzdG9wcyBvbiByb3cgb25lIG9mIFtmaXJzdCByb3csIGxhc3Qgcm93LCB1cC1vci1kb3duLXJvdyBpcyBibGFua10gY2FzZS0xXCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFs0LCA2XVxuICAgICAgICBlbnN1cmUgJ1snLCBjdXJzb3I6IFsyLCA2XVxuICAgICAgICBlbnN1cmUgJ1snLCBjdXJzb3I6IFswLCA2XVxuICAgICAgICBlbnN1cmUgJ10nLCBjdXJzb3I6IFsyLCA2XVxuICAgICAgICBlbnN1cmUgJ10nLCBjdXJzb3I6IFs0LCA2XVxuICAgICAgICBlbnN1cmUgJ10nLCBjdXJzb3I6IFs3LCA2XVxuICAgICAgaXQgXCJvbmx5IHN0b3BzIG9uIHJvdyBvbmUgb2YgW2ZpcnN0IHJvdywgbGFzdCByb3csIHVwLW9yLWRvd24tcm93IGlzIGJsYW5rXSBjYXNlLTJcIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzQsIDddXG4gICAgICAgIGVuc3VyZSAnWycsIGN1cnNvcjogWzIsIDddXG4gICAgICAgIGVuc3VyZSAnWycsIGN1cnNvcjogWzAsIDddXG4gICAgICAgIGVuc3VyZSAnXScsIGN1cnNvcjogWzIsIDddXG4gICAgICAgIGVuc3VyZSAnXScsIGN1cnNvcjogWzQsIDddXG4gICAgICAgIGVuc3VyZSAnXScsIGN1cnNvcjogWzcsIDddXG4gICAgICBpdCBcInN1cHBvcnQgY291bnRcIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzQsIDZdXG4gICAgICAgIGVuc3VyZSAnMiBbJywgY3Vyc29yOiBbMCwgNl1cbiAgICAgICAgZW5zdXJlICczIF0nLCBjdXJzb3I6IFs3LCA2XVxuXG4gICAgICBkZXNjcmliZSAnZWRpdG9yIGZvciBoYXJkVGFiJywgLT5cbiAgICAgICAgcGFjayA9ICdsYW5ndWFnZS1nbydcbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgICAgICAgYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UocGFjaylcblxuICAgICAgICAgIGdldFZpbVN0YXRlICdzYW1wbGUuZ28nLCAoc3RhdGUsIHZpbUVkaXRvcikgLT5cbiAgICAgICAgICAgIHtlZGl0b3IsIGVkaXRvckVsZW1lbnR9ID0gc3RhdGVcbiAgICAgICAgICAgIHtzZXQsIGVuc3VyZSwga2V5c3Ryb2tlfSA9IHZpbUVkaXRvclxuXG4gICAgICAgICAgcnVucyAtPlxuICAgICAgICAgICAgc2V0IGN1cnNvclNjcmVlbjogWzgsIDJdXG4gICAgICAgICAgICAjIEluIGhhcmRUYWIgaW5kZW50IGJ1ZmZlclBvc2l0aW9uIGlzIG5vdCBzYW1lIGFzIHNjcmVlblBvc2l0aW9uXG4gICAgICAgICAgICBlbnN1cmUgY3Vyc29yOiBbOCwgMV1cblxuICAgICAgICBhZnRlckVhY2ggLT5cbiAgICAgICAgICBhdG9tLnBhY2thZ2VzLmRlYWN0aXZhdGVQYWNrYWdlKHBhY2spXG5cbiAgICAgICAgaXQgXCJtb3ZlIHVwL2Rvd24gdG8gbmV4dCBlZGdlIG9mIHNhbWUgKnNjcmVlbiogY29sdW1uXCIsIC0+XG4gICAgICAgICAgZW5zdXJlICdbJywgY3Vyc29yU2NyZWVuOiBbNSwgMl1cbiAgICAgICAgICBlbnN1cmUgJ1snLCBjdXJzb3JTY3JlZW46IFszLCAyXVxuICAgICAgICAgIGVuc3VyZSAnWycsIGN1cnNvclNjcmVlbjogWzIsIDJdXG4gICAgICAgICAgZW5zdXJlICdbJywgY3Vyc29yU2NyZWVuOiBbMCwgMl1cblxuICAgICAgICAgIGVuc3VyZSAnXScsIGN1cnNvclNjcmVlbjogWzIsIDJdXG4gICAgICAgICAgZW5zdXJlICddJywgY3Vyc29yU2NyZWVuOiBbMywgMl1cbiAgICAgICAgICBlbnN1cmUgJ10nLCBjdXJzb3JTY3JlZW46IFs1LCAyXVxuICAgICAgICAgIGVuc3VyZSAnXScsIGN1cnNvclNjcmVlbjogWzksIDJdXG4gICAgICAgICAgZW5zdXJlICddJywgY3Vyc29yU2NyZWVuOiBbMTEsIDJdXG4gICAgICAgICAgZW5zdXJlICddJywgY3Vyc29yU2NyZWVuOiBbMTQsIDJdXG4gICAgICAgICAgZW5zdXJlICddJywgY3Vyc29yU2NyZWVuOiBbMTcsIDJdXG5cbiAgICAgICAgICBlbnN1cmUgJ1snLCBjdXJzb3JTY3JlZW46IFsxNCwgMl1cbiAgICAgICAgICBlbnN1cmUgJ1snLCBjdXJzb3JTY3JlZW46IFsxMSwgMl1cbiAgICAgICAgICBlbnN1cmUgJ1snLCBjdXJzb3JTY3JlZW46IFs5LCAyXVxuICAgICAgICAgIGVuc3VyZSAnWycsIGN1cnNvclNjcmVlbjogWzUsIDJdXG4gICAgICAgICAgZW5zdXJlICdbJywgY3Vyc29yU2NyZWVuOiBbMywgMl1cbiAgICAgICAgICBlbnN1cmUgJ1snLCBjdXJzb3JTY3JlZW46IFsyLCAyXVxuICAgICAgICAgIGVuc3VyZSAnWycsIGN1cnNvclNjcmVlbjogWzAsIDJdXG5cbiAgZGVzY3JpYmUgJ21vdmVTdWNjZXNzT25MaW5ld2lzZSBiZWhhdmlyYWwgY2hhcmFjdGVyaXN0aWMnLCAtPlxuICAgIG9yaWdpbmFsVGV4dCA9IG51bGxcbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXR0aW5ncy5zZXQoJ3VzZUNsaXBib2FyZEFzRGVmYXVsdFJlZ2lzdGVyJywgZmFsc2UpXG4gICAgICBzZXRcbiAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgMDAwXG4gICAgICAgICAgMTExXG4gICAgICAgICAgMjIyXFxuXG4gICAgICAgICAgXCJcIlwiXG4gICAgICBvcmlnaW5hbFRleHQgPSBlZGl0b3IuZ2V0VGV4dCgpXG4gICAgICBlbnN1cmUgcmVnaXN0ZXI6IHsnXCInOiB0ZXh0OiB1bmRlZmluZWR9XG5cbiAgICBkZXNjcmliZSBcIm1vdmVTdWNjZXNzT25MaW5ld2lzZT1mYWxzZSBtb3Rpb25cIiwgLT5cbiAgICAgIGRlc2NyaWJlIFwid2hlbiBpdCBjYW4gbW92ZVwiLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+IHNldCBjdXJzb3I6IFsxLCAwXVxuICAgICAgICBpdCBcImRlbGV0ZSBieSBqXCIsIC0+IGVuc3VyZSBcImQgalwiLCB0ZXh0OiBcIjAwMFxcblwiLCBtb2RlOiAnbm9ybWFsJ1xuICAgICAgICBpdCBcInlhbmsgYnkgalwiLCAtPiBlbnN1cmUgXCJ5IGpcIiwgdGV4dDogb3JpZ2luYWxUZXh0LCByZWdpc3RlcjogeydcIic6IHRleHQ6IFwiMTExXFxuMjIyXFxuXCJ9LCBtb2RlOiAnbm9ybWFsJ1xuICAgICAgICBpdCBcImNoYW5nZSBieSBqXCIsIC0+IGVuc3VyZSBcImMgalwiLCB0ZXh0QzogXCIwMDBcXG58XFxuXCIsIHJlZ2lzdGVyOiB7J1wiJzogdGV4dDogXCIxMTFcXG4yMjJcXG5cIn0sIG1vZGU6ICdpbnNlcnQnXG5cbiAgICAgICAgaXQgXCJkZWxldGUgYnkga1wiLCAtPiBlbnN1cmUgXCJkIGtcIiwgdGV4dDogXCIyMjJcXG5cIiwgbW9kZTogJ25vcm1hbCdcbiAgICAgICAgaXQgXCJ5YW5rIGJ5IGtcIiwgLT4gZW5zdXJlIFwieSBrXCIsIHRleHQ6IG9yaWdpbmFsVGV4dCwgcmVnaXN0ZXI6IHsnXCInOiB0ZXh0OiBcIjAwMFxcbjExMVxcblwifSwgbW9kZTogJ25vcm1hbCdcbiAgICAgICAgaXQgXCJjaGFuZ2UgYnkga1wiLCAtPiBlbnN1cmUgXCJjIGtcIiwgdGV4dEM6IFwifFxcbjIyMlxcblwiLCByZWdpc3RlcjogeydcIic6IHRleHQ6IFwiMDAwXFxuMTExXFxuXCJ9LCBtb2RlOiAnaW5zZXJ0J1xuXG4gICAgICBkZXNjcmliZSBcIndoZW4gaXQgY2FuIG5vdCBtb3ZlLXVwXCIsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT4gc2V0IGN1cnNvcjogWzAsIDBdXG4gICAgICAgIGl0IFwiZGVsZXRlIGJ5IGRrXCIsIC0+IGVuc3VyZSBcImQga1wiLCB0ZXh0OiBvcmlnaW5hbFRleHQsIG1vZGU6ICdub3JtYWwnXG4gICAgICAgIGl0IFwieWFuayBieSB5a1wiLCAtPiBlbnN1cmUgXCJ5IGtcIiwgdGV4dDogb3JpZ2luYWxUZXh0LCByZWdpc3RlcjogeydcIic6IHRleHQ6IHVuZGVmaW5lZH0sIG1vZGU6ICdub3JtYWwnXG4gICAgICAgIGl0IFwiY2hhbmdlIGJ5IGNrXCIsIC0+IGVuc3VyZSBcImMga1wiLCB0ZXh0QzogXCJ8MDAwXFxuMTExXFxuMjIyXFxuXCIsIHJlZ2lzdGVyOiB7J1wiJzogdGV4dDogXCJcXG5cIn0sIG1vZGU6ICdpbnNlcnQnICMgRklYTUUsIGluY29tcGF0aWJsZTogc2hvdWQgcmVtYWluIGluIG5vcm1hbC5cblxuICAgICAgZGVzY3JpYmUgXCJ3aGVuIGl0IGNhbiBub3QgbW92ZS1kb3duXCIsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT4gc2V0IGN1cnNvcjogWzIsIDBdXG4gICAgICAgIGl0IFwiZGVsZXRlIGJ5IGRqXCIsIC0+IGVuc3VyZSBcImQgalwiLCB0ZXh0OiBvcmlnaW5hbFRleHQsIG1vZGU6ICdub3JtYWwnXG4gICAgICAgIGl0IFwieWFuayBieSB5alwiLCAtPiBlbnN1cmUgXCJ5IGpcIiwgdGV4dDogb3JpZ2luYWxUZXh0LCByZWdpc3RlcjogeydcIic6IHRleHQ6IHVuZGVmaW5lZH0sIG1vZGU6ICdub3JtYWwnXG4gICAgICAgIGl0IFwiY2hhbmdlIGJ5IGNqXCIsIC0+IGVuc3VyZSBcImMgalwiLCB0ZXh0QzogXCIwMDBcXG4xMTFcXG58MjIyXFxuXCIsIHJlZ2lzdGVyOiB7J1wiJzogdGV4dDogXCJcXG5cIn0sIG1vZGU6ICdpbnNlcnQnICMgRklYTUUsIGluY29tcGF0aWJsZTogc2hvdWQgcmVtYWluIGluIG5vcm1hbC5cblxuICAgIGRlc2NyaWJlIFwibW92ZVN1Y2Nlc3NPbkxpbmV3aXNlPXRydWUgbW90aW9uXCIsIC0+XG4gICAgICBkZXNjcmliZSBcIndoZW4gaXQgY2FuIG1vdmVcIiwgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPiBzZXQgY3Vyc29yOiBbMSwgMF1cbiAgICAgICAgaXQgXCJkZWxldGUgYnkgR1wiLCAtPiBlbnN1cmUgXCJkIEdcIiwgdGV4dDogXCIwMDBcXG5cIiwgbW9kZTogJ25vcm1hbCdcbiAgICAgICAgaXQgXCJ5YW5rIGJ5IEdcIiwgLT4gZW5zdXJlIFwieSBHXCIsIHRleHQ6IG9yaWdpbmFsVGV4dCwgcmVnaXN0ZXI6IHsnXCInOiB0ZXh0OiBcIjExMVxcbjIyMlxcblwifSwgbW9kZTogJ25vcm1hbCdcbiAgICAgICAgaXQgXCJjaGFuZ2UgYnkgR1wiLCAtPiBlbnN1cmUgXCJjIEdcIiwgdGV4dEM6IFwiMDAwXFxufFxcblwiLCByZWdpc3RlcjogeydcIic6IHRleHQ6IFwiMTExXFxuMjIyXFxuXCJ9LCBtb2RlOiAnaW5zZXJ0J1xuXG4gICAgICAgIGl0IFwiZGVsZXRlIGJ5IGdnXCIsIC0+IGVuc3VyZSBcImQgZyBnXCIsIHRleHQ6IFwiMjIyXFxuXCIsIG1vZGU6ICdub3JtYWwnXG4gICAgICAgIGl0IFwieWFuayBieSBnZ1wiLCAtPiBlbnN1cmUgXCJ5IGcgZ1wiLCB0ZXh0OiBvcmlnaW5hbFRleHQsIHJlZ2lzdGVyOiB7J1wiJzogdGV4dDogXCIwMDBcXG4xMTFcXG5cIn0sIG1vZGU6ICdub3JtYWwnXG4gICAgICAgIGl0IFwiY2hhbmdlIGJ5IGdnXCIsIC0+IGVuc3VyZSBcImMgZyBnXCIsIHRleHRDOiBcInxcXG4yMjJcXG5cIiwgcmVnaXN0ZXI6IHsnXCInOiB0ZXh0OiBcIjAwMFxcbjExMVxcblwifSwgbW9kZTogJ2luc2VydCdcblxuICAgICAgZGVzY3JpYmUgXCJ3aGVuIGl0IGNhbiBub3QgbW92ZS11cFwiLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+IHNldCBjdXJzb3I6IFswLCAwXVxuICAgICAgICBpdCBcImRlbGV0ZSBieSBnZ1wiLCAtPiBlbnN1cmUgXCJkIGcgZ1wiLCB0ZXh0OiBcIjExMVxcbjIyMlxcblwiLCBtb2RlOiAnbm9ybWFsJ1xuICAgICAgICBpdCBcInlhbmsgYnkgZ2dcIiwgLT4gZW5zdXJlIFwieSBnIGdcIiwgdGV4dDogb3JpZ2luYWxUZXh0LCByZWdpc3RlcjogeydcIic6IHRleHQ6IFwiMDAwXFxuXCJ9LCBtb2RlOiAnbm9ybWFsJ1xuICAgICAgICBpdCBcImNoYW5nZSBieSBnZ1wiLCAtPiBlbnN1cmUgXCJjIGcgZ1wiLCB0ZXh0QzogXCJ8XFxuMTExXFxuMjIyXFxuXCIsIHJlZ2lzdGVyOiB7J1wiJzogdGV4dDogXCIwMDBcXG5cIn0sIG1vZGU6ICdpbnNlcnQnXG4gICAgICBkZXNjcmliZSBcIndoZW4gaXQgY2FuIG5vdCBtb3ZlLWRvd25cIiwgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPiBzZXQgY3Vyc29yOiBbMiwgMF1cbiAgICAgICAgaXQgXCJkZWxldGUgYnkgR1wiLCAtPiBlbnN1cmUgXCJkIEdcIiwgdGV4dDogXCIwMDBcXG4xMTFcXG5cIiwgbW9kZTogJ25vcm1hbCdcbiAgICAgICAgaXQgXCJ5YW5rIGJ5IEdcIiwgLT4gZW5zdXJlIFwieSBHXCIsIHRleHQ6IG9yaWdpbmFsVGV4dCwgcmVnaXN0ZXI6IHsnXCInOiB0ZXh0OiBcIjIyMlxcblwifSwgbW9kZTogJ25vcm1hbCdcbiAgICAgICAgaXQgXCJjaGFuZ2UgYnkgR1wiLCAtPiBlbnN1cmUgXCJjIEdcIiwgdGV4dEM6IFwiMDAwXFxuMTExXFxufFxcblwiLCByZWdpc3RlcjogeydcIic6IHRleHQ6IFwiMjIyXFxuXCJ9LCBtb2RlOiAnaW5zZXJ0J1xuXG4gIGRlc2NyaWJlIFwidGhlIHcga2V5YmluZGluZ1wiLCAtPlxuICAgIGJhc2VUZXh0ID0gXCJcIlwiXG4gICAgICBhYiBjZGUxKy1cbiAgICAgICB4eXpcblxuICAgICAgemlwXG4gICAgICBcIlwiXCJcbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXQgdGV4dDogYmFzZVRleHRcblxuICAgIGRlc2NyaWJlIFwiYXMgYSBtb3Rpb25cIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzAsIDBdXG5cbiAgICAgIGl0IFwibW92ZXMgdGhlIGN1cnNvciB0byB0aGUgYmVnaW5uaW5nIG9mIHRoZSBuZXh0IHdvcmRcIiwgLT5cbiAgICAgICAgZW5zdXJlICd3JywgY3Vyc29yOiBbMCwgM11cbiAgICAgICAgZW5zdXJlICd3JywgY3Vyc29yOiBbMCwgN11cbiAgICAgICAgZW5zdXJlICd3JywgY3Vyc29yOiBbMSwgMV1cbiAgICAgICAgZW5zdXJlICd3JywgY3Vyc29yOiBbMiwgMF1cbiAgICAgICAgZW5zdXJlICd3JywgY3Vyc29yOiBbMywgMF1cbiAgICAgICAgZW5zdXJlICd3JywgY3Vyc29yOiBbMywgMl1cbiAgICAgICAgIyBXaGVuIHRoZSBjdXJzb3IgZ2V0cyB0byB0aGUgRU9GLCBpdCBzaG91bGQgc3RheSB0aGVyZS5cbiAgICAgICAgZW5zdXJlICd3JywgY3Vyc29yOiBbMywgMl1cblxuICAgICAgaXQgXCJtb3ZlcyB0aGUgY3Vyc29yIHRvIHRoZSBlbmQgb2YgdGhlIHdvcmQgaWYgbGFzdCB3b3JkIGluIGZpbGVcIiwgLT5cbiAgICAgICAgc2V0IHRleHQ6ICdhYmMnLCBjdXJzb3I6IFswLCAwXVxuICAgICAgICBlbnN1cmUgJ3cnLCBjdXJzb3I6IFswLCAyXVxuXG4gICAgICBpdCBcIm1vdmUgdG8gbmV4dCB3b3JkIGJ5IHNraXBwaW5nIHRyYWlsaW5nIHdoaXRlIHNwYWNlc1wiLCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0Q186IFwiXCJcIlxuICAgICAgICAgICAgMDEyfF9fX1xuICAgICAgICAgICAgICAyMzRcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICBlbnN1cmUgJ3cnLFxuICAgICAgICAgIHRleHRDXzogXCJcIlwiXG4gICAgICAgICAgICAwMTJfX19cbiAgICAgICAgICAgICAgfDIzNFxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgIGl0IFwibW92ZSB0byBuZXh0IHdvcmQgZnJvbSBFT0xcIiwgLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dENfOiBcIlwiXCJcbiAgICAgICAgICAgIHxcbiAgICAgICAgICAgIF9fMjM0XCJcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICBlbnN1cmUgJ3cnLFxuICAgICAgICAgIHRleHRDXzogXCJcIlwiXG5cbiAgICAgICAgICAgIF9ffDIzNFwiXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgIyBbRklYTUVdIGltcHJvdmUgc3BlYyB0byBsb29wIHNhbWUgc2VjdGlvbiB3aXRoIGRpZmZlcmVudCB0ZXh0XG4gICAgICBkZXNjcmliZSBcImZvciBDUkxGIGJ1ZmZlclwiLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgc2V0IHRleHQ6IGJhc2VUZXh0LnJlcGxhY2UoL1xcbi9nLCBcIlxcclxcblwiKVxuXG4gICAgICAgIGRlc2NyaWJlIFwiYXMgYSBtb3Rpb25cIiwgLT5cbiAgICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMF1cblxuICAgICAgICAgIGl0IFwibW92ZXMgdGhlIGN1cnNvciB0byB0aGUgYmVnaW5uaW5nIG9mIHRoZSBuZXh0IHdvcmRcIiwgLT5cbiAgICAgICAgICAgIGVuc3VyZSAndycsIGN1cnNvcjogWzAsIDNdXG4gICAgICAgICAgICBlbnN1cmUgJ3cnLCBjdXJzb3I6IFswLCA3XVxuICAgICAgICAgICAgZW5zdXJlICd3JywgY3Vyc29yOiBbMSwgMV1cbiAgICAgICAgICAgIGVuc3VyZSAndycsIGN1cnNvcjogWzIsIDBdXG4gICAgICAgICAgICBlbnN1cmUgJ3cnLCBjdXJzb3I6IFszLCAwXVxuICAgICAgICAgICAgZW5zdXJlICd3JywgY3Vyc29yOiBbMywgMl1cbiAgICAgICAgICAgICMgV2hlbiB0aGUgY3Vyc29yIGdldHMgdG8gdGhlIEVPRiwgaXQgc2hvdWxkIHN0YXkgdGhlcmUuXG4gICAgICAgICAgICBlbnN1cmUgJ3cnLCBjdXJzb3I6IFszLCAyXVxuXG4gICAgZGVzY3JpYmUgXCJ3aGVuIHVzZWQgYnkgQ2hhbmdlIG9wZXJhdG9yXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHRfOiBcIlwiXCJcbiAgICAgICAgICBfX3ZhcjEgPSAxXG4gICAgICAgICAgX192YXIyID0gMlxcblxuICAgICAgICAgIFwiXCJcIlxuXG4gICAgICBkZXNjcmliZSBcIndoZW4gY3Vyc29yIGlzIG9uIHdvcmRcIiwgLT5cbiAgICAgICAgaXQgXCJub3QgZWF0IHdoaXRlc3BhY2VcIiwgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMCwgM11cbiAgICAgICAgICBlbnN1cmUgJ2MgdycsXG4gICAgICAgICAgICB0ZXh0XzogXCJcIlwiXG4gICAgICAgICAgICBfX3YgPSAxXG4gICAgICAgICAgICBfX3ZhcjIgPSAyXFxuXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgIGN1cnNvcjogWzAsIDNdXG5cbiAgICAgIGRlc2NyaWJlIFwid2hlbiBjdXJzb3IgaXMgb24gd2hpdGUgc3BhY2VcIiwgLT5cbiAgICAgICAgaXQgXCJvbmx5IGVhdCB3aGl0ZSBzcGFjZVwiLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFswLCAwXVxuICAgICAgICAgIGVuc3VyZSAnYyB3JyxcbiAgICAgICAgICAgIHRleHRfOiBcIlwiXCJcbiAgICAgICAgICAgIHZhcjEgPSAxXG4gICAgICAgICAgICBfX3ZhcjIgPSAyXFxuXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgIGN1cnNvcjogWzAsIDBdXG5cbiAgICAgIGRlc2NyaWJlIFwid2hlbiB0ZXh0IHRvIEVPTCBpcyBhbGwgd2hpdGUgc3BhY2VcIiwgLT5cbiAgICAgICAgaXQgXCJ3b250IGVhdCBuZXcgbGluZSBjaGFyYWN0ZXJcIiwgLT5cbiAgICAgICAgICBzZXRcbiAgICAgICAgICAgIHRleHRfOiBcIlwiXCJcbiAgICAgICAgICAgIGFiY19fXG4gICAgICAgICAgICBkZWZcXG5cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgY3Vyc29yOiBbMCwgM11cbiAgICAgICAgICBlbnN1cmUgJ2MgdycsXG4gICAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIGFiY1xuICAgICAgICAgICAgZGVmXFxuXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgIGN1cnNvcjogWzAsIDNdXG5cbiAgICAgICAgaXQgXCJjYW50IGVhdCBuZXcgbGluZSB3aGVuIGNvdW50IGlzIHNwZWNpZmllZFwiLCAtPlxuICAgICAgICAgIHNldCB0ZXh0OiBcIlxcblxcblxcblxcblxcbmxpbmU2XFxuXCIsIGN1cnNvcjogWzAsIDBdXG4gICAgICAgICAgZW5zdXJlICc1IGMgdycsIHRleHQ6IFwiXFxubGluZTZcXG5cIiwgY3Vyc29yOiBbMCwgMF1cblxuICAgIGRlc2NyaWJlIFwiYXMgYSBzZWxlY3Rpb25cIiwgLT5cbiAgICAgIGRlc2NyaWJlIFwid2l0aGluIGEgd29yZFwiLCAtPlxuICAgICAgICBpdCBcInNlbGVjdHMgdG8gdGhlIGVuZCBvZiB0aGUgd29yZFwiLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFswLCAwXVxuICAgICAgICAgIGVuc3VyZSAneSB3JywgcmVnaXN0ZXI6ICdcIic6IHRleHQ6ICdhYiAnXG5cbiAgICAgIGRlc2NyaWJlIFwiYmV0d2VlbiB3b3Jkc1wiLCAtPlxuICAgICAgICBpdCBcInNlbGVjdHMgdGhlIHdoaXRlc3BhY2VcIiwgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMl1cbiAgICAgICAgICBlbnN1cmUgJ3kgdycsIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiAnICdcblxuICBkZXNjcmliZSBcInRoZSBXIGtleWJpbmRpbmdcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXQgdGV4dDogXCJjZGUxKy0gYWIgXFxuIHh5elxcblxcbnppcFwiXG5cbiAgICBkZXNjcmliZSBcImFzIGEgbW90aW9uXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFswLCAwXVxuXG4gICAgICBpdCBcIm1vdmVzIHRoZSBjdXJzb3IgdG8gdGhlIGJlZ2lubmluZyBvZiB0aGUgbmV4dCB3b3JkXCIsIC0+XG4gICAgICAgIGVuc3VyZSAnVycsIGN1cnNvcjogWzAsIDddXG4gICAgICAgIGVuc3VyZSAnVycsIGN1cnNvcjogWzEsIDFdXG4gICAgICAgIGVuc3VyZSAnVycsIGN1cnNvcjogWzIsIDBdXG4gICAgICAgIGVuc3VyZSAnVycsIGN1cnNvcjogWzMsIDBdXG5cbiAgICAgIGl0IFwibW92ZXMgdGhlIGN1cnNvciB0byBiZWdpbm5pbmcgb2YgdGhlIG5leHQgd29yZCBvZiBuZXh0IGxpbmUgd2hlbiBhbGwgcmVtYWluaW5nIHRleHQgaXMgd2hpdGUgc3BhY2UuXCIsIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHRfOiBcIlwiXCJcbiAgICAgICAgICAgIDAxMl9fX1xuICAgICAgICAgICAgX18yMzRcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIGN1cnNvcjogWzAsIDNdXG4gICAgICAgIGVuc3VyZSAnVycsIGN1cnNvcjogWzEsIDJdXG5cbiAgICAgIGl0IFwibW92ZXMgdGhlIGN1cnNvciB0byBiZWdpbm5pbmcgb2YgdGhlIG5leHQgd29yZCBvZiBuZXh0IGxpbmUgd2hlbiBjdXJzb3IgaXMgYXQgRU9MLlwiLCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0XzogXCJcIlwiXG5cbiAgICAgICAgICBfXzIzNFxuICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIGN1cnNvcjogWzAsIDBdXG4gICAgICAgIGVuc3VyZSAnVycsIGN1cnNvcjogWzEsIDJdXG5cbiAgICAjIFRoaXMgc3BlYyBpcyByZWR1bmRhbnQgc2luY2UgVyhNb3ZlVG9OZXh0V2hvbGVXb3JkKSBpcyBjaGlsZCBvZiB3KE1vdmVUb05leHRXb3JkKS5cbiAgICBkZXNjcmliZSBcIndoZW4gdXNlZCBieSBDaGFuZ2Ugb3BlcmF0b3JcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dF86IFwiXCJcIlxuICAgICAgICAgICAgX192YXIxID0gMVxuICAgICAgICAgICAgX192YXIyID0gMlxcblxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgIGRlc2NyaWJlIFwid2hlbiBjdXJzb3IgaXMgb24gd29yZFwiLCAtPlxuICAgICAgICBpdCBcIm5vdCBlYXQgd2hpdGVzcGFjZVwiLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFswLCAzXVxuICAgICAgICAgIGVuc3VyZSAnYyBXJyxcbiAgICAgICAgICAgIHRleHRfOiBcIlwiXCJcbiAgICAgICAgICAgICAgX192ID0gMVxuICAgICAgICAgICAgICBfX3ZhcjIgPSAyXFxuXG4gICAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgY3Vyc29yOiBbMCwgM11cblxuICAgICAgZGVzY3JpYmUgXCJ3aGVuIGN1cnNvciBpcyBvbiB3aGl0ZSBzcGFjZVwiLCAtPlxuICAgICAgICBpdCBcIm9ubHkgZWF0IHdoaXRlIHNwYWNlXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzAsIDBdXG4gICAgICAgICAgZW5zdXJlICdjIFcnLFxuICAgICAgICAgICAgdGV4dF86IFwiXCJcIlxuICAgICAgICAgICAgICB2YXIxID0gMVxuICAgICAgICAgICAgICBfX3ZhcjIgPSAyXFxuXG4gICAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgY3Vyc29yOiBbMCwgMF1cblxuICAgICAgZGVzY3JpYmUgXCJ3aGVuIHRleHQgdG8gRU9MIGlzIGFsbCB3aGl0ZSBzcGFjZVwiLCAtPlxuICAgICAgICBpdCBcIndvbnQgZWF0IG5ldyBsaW5lIGNoYXJhY3RlclwiLCAtPlxuICAgICAgICAgIHNldCB0ZXh0OiBcImFiYyAgXFxuZGVmXFxuXCIsIGN1cnNvcjogWzAsIDNdXG4gICAgICAgICAgZW5zdXJlICdjIFcnLCB0ZXh0OiBcImFiY1xcbmRlZlxcblwiLCBjdXJzb3I6IFswLCAzXVxuXG4gICAgICAgIGl0IFwiY2FudCBlYXQgbmV3IGxpbmUgd2hlbiBjb3VudCBpcyBzcGVjaWZpZWRcIiwgLT5cbiAgICAgICAgICBzZXQgdGV4dDogXCJcXG5cXG5cXG5cXG5cXG5saW5lNlxcblwiLCBjdXJzb3I6IFswLCAwXVxuICAgICAgICAgIGVuc3VyZSAnNSBjIFcnLCB0ZXh0OiBcIlxcbmxpbmU2XFxuXCIsIGN1cnNvcjogWzAsIDBdXG5cbiAgICBkZXNjcmliZSBcImFzIGEgc2VsZWN0aW9uXCIsIC0+XG4gICAgICBkZXNjcmliZSBcIndpdGhpbiBhIHdvcmRcIiwgLT5cbiAgICAgICAgaXQgXCJzZWxlY3RzIHRvIHRoZSBlbmQgb2YgdGhlIHdob2xlIHdvcmRcIiwgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgICBlbnN1cmUgJ3kgVycsIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiAnY2RlMSstICdcblxuICAgICAgaXQgXCJjb250aW51ZXMgcGFzdCBibGFuayBsaW5lc1wiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMiwgMF1cbiAgICAgICAgZW5zdXJlICdkIFcnLFxuICAgICAgICAgIHRleHRfOiBcIlwiXCJcbiAgICAgICAgICBjZGUxKy0gYWJfXG4gICAgICAgICAgX3h5elxuICAgICAgICAgIHppcFxuICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiBcIlxcblwiXG5cbiAgICAgIGl0IFwiZG9lc24ndCBnbyBwYXN0IHRoZSBlbmQgb2YgdGhlIGZpbGVcIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzMsIDBdXG4gICAgICAgIGVuc3VyZSAnZCBXJyxcbiAgICAgICAgICB0ZXh0XzogXCJcIlwiXG4gICAgICAgICAgY2RlMSstIGFiX1xuICAgICAgICAgIF94eXpcXG5cXG5cbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICByZWdpc3RlcjogJ1wiJzogdGV4dDogJ3ppcCdcblxuICBkZXNjcmliZSBcInRoZSBlIGtleWJpbmRpbmdcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXQgdGV4dF86IFwiXCJcIlxuICAgICAgYWIgY2RlMSstX1xuICAgICAgX3h5elxuXG4gICAgICB6aXBcbiAgICAgIFwiXCJcIlxuXG4gICAgZGVzY3JpYmUgXCJhcyBhIG1vdGlvblwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMF1cblxuICAgICAgaXQgXCJtb3ZlcyB0aGUgY3Vyc29yIHRvIHRoZSBlbmQgb2YgdGhlIGN1cnJlbnQgd29yZFwiLCAtPlxuICAgICAgICBlbnN1cmUgJ2UnLCBjdXJzb3I6IFswLCAxXVxuICAgICAgICBlbnN1cmUgJ2UnLCBjdXJzb3I6IFswLCA2XVxuICAgICAgICBlbnN1cmUgJ2UnLCBjdXJzb3I6IFswLCA4XVxuICAgICAgICBlbnN1cmUgJ2UnLCBjdXJzb3I6IFsxLCAzXVxuICAgICAgICBlbnN1cmUgJ2UnLCBjdXJzb3I6IFszLCAyXVxuXG4gICAgICBpdCBcInNraXBzIHdoaXRlc3BhY2UgdW50aWwgRU9GXCIsIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHQ6IFwiMDEyXFxuXFxuXFxuMDEyXFxuXFxuXCJcbiAgICAgICAgICBjdXJzb3I6IFswLCAwXVxuICAgICAgICBlbnN1cmUgJ2UnLCBjdXJzb3I6IFswLCAyXVxuICAgICAgICBlbnN1cmUgJ2UnLCBjdXJzb3I6IFszLCAyXVxuICAgICAgICBlbnN1cmUgJ2UnLCBjdXJzb3I6IFs0LCAwXVxuXG4gICAgZGVzY3JpYmUgXCJhcyBzZWxlY3Rpb25cIiwgLT5cbiAgICAgIGRlc2NyaWJlIFwid2l0aGluIGEgd29yZFwiLCAtPlxuICAgICAgICBpdCBcInNlbGVjdHMgdG8gdGhlIGVuZCBvZiB0aGUgY3VycmVudCB3b3JkXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzAsIDBdXG4gICAgICAgICAgZW5zdXJlICd5IGUnLCByZWdpc3RlcjogJ1wiJzogdGV4dDogJ2FiJ1xuXG4gICAgICBkZXNjcmliZSBcImJldHdlZW4gd29yZHNcIiwgLT5cbiAgICAgICAgaXQgXCJzZWxlY3RzIHRvIHRoZSBlbmQgb2YgdGhlIG5leHQgd29yZFwiLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFswLCAyXVxuICAgICAgICAgIGVuc3VyZSAneSBlJywgcmVnaXN0ZXI6ICdcIic6IHRleHQ6ICcgY2RlMSdcblxuICBkZXNjcmliZSBcInRoZSBnZSBrZXliaW5kaW5nXCIsIC0+XG4gICAgZGVzY3JpYmUgXCJhcyBhIG1vdGlvblwiLCAtPlxuICAgICAgaXQgXCJtb3ZlcyB0aGUgY3Vyc29yIHRvIHRoZSBlbmQgb2YgdGhlIHByZXZpb3VzIHdvcmRcIiwgLT5cbiAgICAgICAgc2V0IHRleHQ6IFwiMTIzNCA1Njc4IHdvcmR3b3JkXCJcbiAgICAgICAgc2V0IGN1cnNvcjogWzAsIDE2XVxuICAgICAgICBlbnN1cmUgJ2cgZScsIGN1cnNvcjogWzAsIDhdXG4gICAgICAgIGVuc3VyZSAnZyBlJywgY3Vyc29yOiBbMCwgM11cbiAgICAgICAgZW5zdXJlICdnIGUnLCBjdXJzb3I6IFswLCAwXVxuICAgICAgICBlbnN1cmUgJ2cgZScsIGN1cnNvcjogWzAsIDBdXG5cbiAgICAgIGl0IFwibW92ZXMgY29ycmVudGx5IHdoZW4gc3RhcnRpbmcgYmV0d2VlbiB3b3Jkc1wiLCAtPlxuICAgICAgICBzZXQgdGV4dDogXCIxIGxlYWRpbmcgICAgIGVuZFwiXG4gICAgICAgIHNldCBjdXJzb3I6IFswLCAxMl1cbiAgICAgICAgZW5zdXJlICdnIGUnLCBjdXJzb3I6IFswLCA4XVxuXG4gICAgICBpdCBcInRha2VzIGEgY291bnRcIiwgLT5cbiAgICAgICAgc2V0IHRleHQ6IFwidmltIG1vZGUgcGx1cyBpcyBnZXR0aW5nIHRoZXJlXCJcbiAgICAgICAgc2V0IGN1cnNvcjogWzAsIDI4XVxuICAgICAgICBlbnN1cmUgJzUgZyBlJywgY3Vyc29yOiBbMCwgMl1cblxuICAgICAgIyB0ZXN0IHdpbGwgZmFpbCB1bnRpbCB0aGUgY29kZSBpcyBmaXhlZFxuICAgICAgeGl0IFwiaGFuZGxlcyBub24td29yZHMgaW5zaWRlIHdvcmRzIGxpa2UgdmltXCIsIC0+XG4gICAgICAgIHNldCB0ZXh0OiBcIjEyMzQgNTY3OCB3b3JkLXdvcmRcIlxuICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMThdXG4gICAgICAgIGVuc3VyZSAnZyBlJywgY3Vyc29yOiBbMCwgMTRdXG4gICAgICAgIGVuc3VyZSAnZyBlJywgY3Vyc29yOiBbMCwgMTNdXG4gICAgICAgIGVuc3VyZSAnZyBlJywgY3Vyc29yOiBbMCwgOF1cblxuICAgICAgIyB0ZXN0IHdpbGwgZmFpbCB1bnRpbCB0aGUgY29kZSBpcyBmaXhlZFxuICAgICAgeGl0IFwiaGFuZGxlcyBuZXdsaW5lcyBsaWtlIHZpbVwiLCAtPlxuICAgICAgICBzZXQgdGV4dDogXCIxMjM0XFxuXFxuXFxuXFxuNTY3OFwiXG4gICAgICAgIHNldCBjdXJzb3I6IFs1LCAyXVxuICAgICAgICAjIHZpbSBzZWVtcyB0byB0aGluayBhbiBlbmQtb2Ytd29yZCBpcyBhdCBldmVyeSBibGFuayBsaW5lXG4gICAgICAgIGVuc3VyZSAnZyBlJywgY3Vyc29yOiBbNCwgMF1cbiAgICAgICAgZW5zdXJlICdnIGUnLCBjdXJzb3I6IFszLCAwXVxuICAgICAgICBlbnN1cmUgJ2cgZScsIGN1cnNvcjogWzIsIDBdXG4gICAgICAgIGVuc3VyZSAnZyBlJywgY3Vyc29yOiBbMSwgMF1cbiAgICAgICAgZW5zdXJlICdnIGUnLCBjdXJzb3I6IFsxLCAwXVxuICAgICAgICBlbnN1cmUgJ2cgZScsIGN1cnNvcjogWzAsIDNdXG4gICAgICAgIGVuc3VyZSAnZyBlJywgY3Vyc29yOiBbMCwgMF1cblxuICAgIGRlc2NyaWJlIFwid2hlbiB1c2VkIGJ5IENoYW5nZSBvcGVyYXRvclwiLCAtPlxuICAgICAgaXQgXCJjaGFuZ2VzIHdvcmQgZnJhZ21lbnRzXCIsIC0+XG4gICAgICAgIHNldCB0ZXh0OiBcImNldCBkb2N1bWVudFwiXG4gICAgICAgIHNldCBjdXJzb3I6IFswLCA3XVxuICAgICAgICBlbnN1cmUgJ2MgZyBlJywgY3Vyc29yOiBbMCwgMl0sIHRleHQ6IFwiY2VtZW50XCIsIG1vZGU6ICdpbnNlcnQnXG4gICAgICAgICMgVE9ETzogSSdtIG5vdCBzdXJlIGhvdyB0byBjaGVjayB0aGUgcmVnaXN0ZXIgYWZ0ZXIgY2hlY2tpbmcgdGhlIGRvY3VtZW50XG4gICAgICAgICMgZW5zdXJlIHJlZ2lzdGVyOiAnXCInLCB0ZXh0OiAndCBkb2N1J1xuXG4gICAgICBpdCBcImNoYW5nZXMgd2hpdGVzcGFjZSBwcm9wZXJseVwiLCAtPlxuICAgICAgICBzZXQgdGV4dDogXCJjZSAgICBkb2NcIlxuICAgICAgICBzZXQgY3Vyc29yOiBbMCwgNF1cbiAgICAgICAgZW5zdXJlICdjIGcgZScsIGN1cnNvcjogWzAsIDFdLCB0ZXh0OiBcImMgZG9jXCIsIG1vZGU6ICdpbnNlcnQnXG5cbiAgICBkZXNjcmliZSBcImluIGNoYXJhY3Rlcndpc2UgdmlzdWFsIG1vZGVcIiwgLT5cbiAgICAgIGl0IFwic2VsZWN0cyB3b3JkIGZyYWdtZW50c1wiLCAtPlxuICAgICAgICBzZXQgdGV4dDogXCJjZXQgZG9jdW1lbnRcIlxuICAgICAgICBzZXQgY3Vyc29yOiBbMCwgN11cbiAgICAgICAgZW5zdXJlICd2IGcgZScsIGN1cnNvcjogWzAsIDJdLCBzZWxlY3RlZFRleHQ6IFwidCBkb2N1XCJcblxuICBkZXNjcmliZSBcInRoZSBFIGtleWJpbmRpbmdcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXQgdGV4dF86IFwiXCJcIlxuICAgICAgYWIgIGNkZTErLV9cbiAgICAgIF94eXpfXG5cbiAgICAgIHppcFxcblxuICAgICAgXCJcIlwiXG5cbiAgICBkZXNjcmliZSBcImFzIGEgbW90aW9uXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFswLCAwXVxuXG4gICAgICBpdCBcIm1vdmVzIHRoZSBjdXJzb3IgdG8gdGhlIGVuZCBvZiB0aGUgY3VycmVudCB3b3JkXCIsIC0+XG4gICAgICAgIGVuc3VyZSAnRScsIGN1cnNvcjogWzAsIDFdXG4gICAgICAgIGVuc3VyZSAnRScsIGN1cnNvcjogWzAsIDldXG4gICAgICAgIGVuc3VyZSAnRScsIGN1cnNvcjogWzEsIDNdXG4gICAgICAgIGVuc3VyZSAnRScsIGN1cnNvcjogWzMsIDJdXG4gICAgICAgIGVuc3VyZSAnRScsIGN1cnNvcjogWzMsIDJdXG5cbiAgICBkZXNjcmliZSBcImFzIHNlbGVjdGlvblwiLCAtPlxuICAgICAgZGVzY3JpYmUgXCJ3aXRoaW4gYSB3b3JkXCIsIC0+XG4gICAgICAgIGl0IFwic2VsZWN0cyB0byB0aGUgZW5kIG9mIHRoZSBjdXJyZW50IHdvcmRcIiwgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgICBlbnN1cmUgJ3kgRScsIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiAnYWInXG5cbiAgICAgIGRlc2NyaWJlIFwiYmV0d2VlbiB3b3Jkc1wiLCAtPlxuICAgICAgICBpdCBcInNlbGVjdHMgdG8gdGhlIGVuZCBvZiB0aGUgbmV4dCB3b3JkXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzAsIDJdXG4gICAgICAgICAgZW5zdXJlICd5IEUnLCByZWdpc3RlcjogJ1wiJzogdGV4dDogJyAgY2RlMSstJ1xuXG4gICAgICBkZXNjcmliZSBcInByZXNzIG1vcmUgdGhhbiBvbmNlXCIsIC0+XG4gICAgICAgIGl0IFwic2VsZWN0cyB0byB0aGUgZW5kIG9mIHRoZSBjdXJyZW50IHdvcmRcIiwgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgICBlbnN1cmUgJ3YgRSBFIHknLCByZWdpc3RlcjogJ1wiJzogdGV4dDogJ2FiICBjZGUxKy0nXG5cbiAgZGVzY3JpYmUgXCJ0aGUgZ0Uga2V5YmluZGluZ1wiLCAtPlxuICAgIGRlc2NyaWJlIFwiYXMgYSBtb3Rpb25cIiwgLT5cbiAgICAgIGl0IFwibW92ZXMgdGhlIGN1cnNvciB0byB0aGUgZW5kIG9mIHRoZSBwcmV2aW91cyB3b3JkXCIsIC0+XG4gICAgICAgIHNldCB0ZXh0OiBcIjEyLjQgNX43LSB3b3JkLXdvcmRcIlxuICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMTZdXG4gICAgICAgIGVuc3VyZSAnZyBFJywgY3Vyc29yOiBbMCwgOF1cbiAgICAgICAgZW5zdXJlICdnIEUnLCBjdXJzb3I6IFswLCAzXVxuICAgICAgICBlbnN1cmUgJ2cgRScsIGN1cnNvcjogWzAsIDBdXG4gICAgICAgIGVuc3VyZSAnZyBFJywgY3Vyc29yOiBbMCwgMF1cblxuICBkZXNjcmliZSBcInRoZSAoLCkgc2VudGVuY2Uga2V5YmluZGluZ1wiLCAtPlxuICAgIGRlc2NyaWJlIFwiYXMgYSBtb3Rpb25cIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICBzZW50ZW5jZSBvbmUuXSknXCIgICAgc2VuLnRlbmNlIC50d28uXG4gICAgICAgICAgaGVyZS4gIHNlbnRlbmNlIHRocmVlXG4gICAgICAgICAgbW9yZSB0aHJlZVxuXG4gICAgICAgICAgICAgc2VudGVuY2UgZm91clxuXG5cbiAgICAgICAgICBzZW50ZW5jZSBmaXZlLlxuICAgICAgICAgIG1vcmUgZml2ZVxuICAgICAgICAgIG1vcmUgc2l4XG5cbiAgICAgICAgICAgbGFzdCBzZW50ZW5jZVxuICAgICAgICAgIGFsbCBkb25lIHNldmVuXG4gICAgICAgICAgXCJcIlwiXG5cbiAgICAgIGl0IFwibW92ZXMgdGhlIGN1cnNvciB0byB0aGUgZW5kIG9mIHRoZSBzZW50ZW5jZVwiLCAtPlxuICAgICAgICBlbnN1cmUgJyknLCBjdXJzb3I6IFswLCAyMV1cbiAgICAgICAgZW5zdXJlICcpJywgY3Vyc29yOiBbMSwgMF1cbiAgICAgICAgZW5zdXJlICcpJywgY3Vyc29yOiBbMSwgN11cbiAgICAgICAgZW5zdXJlICcpJywgY3Vyc29yOiBbMywgMF1cbiAgICAgICAgZW5zdXJlICcpJywgY3Vyc29yOiBbNCwgM11cbiAgICAgICAgZW5zdXJlICcpJywgY3Vyc29yOiBbNSwgMF0gIyBib3VuZGFyeSBpcyBkaWZmZXJlbnQgYnkgZGlyZWN0aW9uXG4gICAgICAgIGVuc3VyZSAnKScsIGN1cnNvcjogWzcsIDBdXG4gICAgICAgIGVuc3VyZSAnKScsIGN1cnNvcjogWzgsIDBdXG4gICAgICAgIGVuc3VyZSAnKScsIGN1cnNvcjogWzEwLCAwXVxuICAgICAgICBlbnN1cmUgJyknLCBjdXJzb3I6IFsxMSwgMV1cblxuICAgICAgICBlbnN1cmUgJyknLCBjdXJzb3I6IFsxMiwgMTNdXG4gICAgICAgIGVuc3VyZSAnKScsIGN1cnNvcjogWzEyLCAxM11cblxuICAgICAgICBlbnN1cmUgJygnLCBjdXJzb3I6IFsxMSwgMV1cbiAgICAgICAgZW5zdXJlICcoJywgY3Vyc29yOiBbMTAsIDBdXG4gICAgICAgIGVuc3VyZSAnKCcsIGN1cnNvcjogWzgsIDBdXG4gICAgICAgIGVuc3VyZSAnKCcsIGN1cnNvcjogWzcsIDBdXG4gICAgICAgIGVuc3VyZSAnKCcsIGN1cnNvcjogWzYsIDBdICMgYm91bmRhcnkgaXMgZGlmZmVyZW50IGJ5IGRpcmVjdGlvblxuICAgICAgICBlbnN1cmUgJygnLCBjdXJzb3I6IFs0LCAzXVxuICAgICAgICBlbnN1cmUgJygnLCBjdXJzb3I6IFszLCAwXVxuICAgICAgICBlbnN1cmUgJygnLCBjdXJzb3I6IFsxLCA3XVxuICAgICAgICBlbnN1cmUgJygnLCBjdXJzb3I6IFsxLCAwXVxuICAgICAgICBlbnN1cmUgJygnLCBjdXJzb3I6IFswLCAyMV1cblxuICAgICAgICBlbnN1cmUgJygnLCBjdXJzb3I6IFswLCAwXVxuICAgICAgICBlbnN1cmUgJygnLCBjdXJzb3I6IFswLCAwXVxuXG4gICAgICBpdCBcInNraXBzIHRvIGJlZ2lubmluZyBvZiBzZW50ZW5jZVwiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbNCwgMTVdXG4gICAgICAgIGVuc3VyZSAnKCcsIGN1cnNvcjogWzQsIDNdXG5cbiAgICAgIGl0IFwic3VwcG9ydHMgYSBjb3VudFwiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgZW5zdXJlICczICknLCBjdXJzb3I6IFsxLCA3XVxuICAgICAgICBlbnN1cmUgJzMgKCcsIGN1cnNvcjogWzAsIDBdXG5cbiAgICAgIGl0IFwiY2FuIG1vdmUgc3RhcnQgb2YgYnVmZmVyIG9yIGVuZCBvZiBidWZmZXIgYXQgbWF4aW11bVwiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgZW5zdXJlICcyIDAgKScsIGN1cnNvcjogWzEyLCAxM11cbiAgICAgICAgZW5zdXJlICcyIDAgKCcsIGN1cnNvcjogWzAsIDBdXG5cbiAgICAgIGRlc2NyaWJlIFwic2VudGVuY2UgbW90aW9uIHdpdGggc2tpcC1ibGFuay1yb3dcIiwgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIGF0b20ua2V5bWFwcy5hZGQgXCJ0ZXN0XCIsXG4gICAgICAgICAgICAnYXRvbS10ZXh0LWVkaXRvci52aW0tbW9kZS1wbHVzOm5vdCguaW5zZXJ0LW1vZGUpJzpcbiAgICAgICAgICAgICAgJ2cgKSc6ICd2aW0tbW9kZS1wbHVzOm1vdmUtdG8tbmV4dC1zZW50ZW5jZS1za2lwLWJsYW5rLXJvdydcbiAgICAgICAgICAgICAgJ2cgKCc6ICd2aW0tbW9kZS1wbHVzOm1vdmUtdG8tcHJldmlvdXMtc2VudGVuY2Utc2tpcC1ibGFuay1yb3cnXG5cbiAgICAgICAgaXQgXCJtb3ZlcyB0aGUgY3Vyc29yIHRvIHRoZSBlbmQgb2YgdGhlIHNlbnRlbmNlXCIsIC0+XG4gICAgICAgICAgZW5zdXJlICdnICknLCBjdXJzb3I6IFswLCAyMV1cbiAgICAgICAgICBlbnN1cmUgJ2cgKScsIGN1cnNvcjogWzEsIDBdXG4gICAgICAgICAgZW5zdXJlICdnICknLCBjdXJzb3I6IFsxLCA3XVxuICAgICAgICAgIGVuc3VyZSAnZyApJywgY3Vyc29yOiBbNCwgM11cbiAgICAgICAgICBlbnN1cmUgJ2cgKScsIGN1cnNvcjogWzcsIDBdXG4gICAgICAgICAgZW5zdXJlICdnICknLCBjdXJzb3I6IFs4LCAwXVxuICAgICAgICAgIGVuc3VyZSAnZyApJywgY3Vyc29yOiBbMTEsIDFdXG5cbiAgICAgICAgICBlbnN1cmUgJ2cgKScsIGN1cnNvcjogWzEyLCAxM11cbiAgICAgICAgICBlbnN1cmUgJ2cgKScsIGN1cnNvcjogWzEyLCAxM11cblxuICAgICAgICAgIGVuc3VyZSAnZyAoJywgY3Vyc29yOiBbMTEsIDFdXG4gICAgICAgICAgZW5zdXJlICdnICgnLCBjdXJzb3I6IFs4LCAwXVxuICAgICAgICAgIGVuc3VyZSAnZyAoJywgY3Vyc29yOiBbNywgMF1cbiAgICAgICAgICBlbnN1cmUgJ2cgKCcsIGN1cnNvcjogWzQsIDNdXG4gICAgICAgICAgZW5zdXJlICdnICgnLCBjdXJzb3I6IFsxLCA3XVxuICAgICAgICAgIGVuc3VyZSAnZyAoJywgY3Vyc29yOiBbMSwgMF1cbiAgICAgICAgICBlbnN1cmUgJ2cgKCcsIGN1cnNvcjogWzAsIDIxXVxuXG4gICAgICAgICAgZW5zdXJlICdnICgnLCBjdXJzb3I6IFswLCAwXVxuICAgICAgICAgIGVuc3VyZSAnZyAoJywgY3Vyc29yOiBbMCwgMF1cblxuICAgIGRlc2NyaWJlIFwibW92aW5nIGluc2lkZSBhIGJsYW5rIGRvY3VtZW50XCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHRfOiBcIlwiXCJcbiAgICAgICAgICBfX19fX1xuICAgICAgICAgIF9fX19fXG4gICAgICAgICAgXCJcIlwiXG5cbiAgICAgIGl0IFwibW92ZXMgd2l0aG91dCBjcmFzaGluZ1wiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgZW5zdXJlICcpJywgY3Vyc29yOiBbMSwgNF1cbiAgICAgICAgZW5zdXJlICcpJywgY3Vyc29yOiBbMSwgNF1cbiAgICAgICAgZW5zdXJlICcoJywgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgZW5zdXJlICcoJywgY3Vyc29yOiBbMCwgMF1cblxuICAgIGRlc2NyaWJlIFwiYXMgYSBzZWxlY3Rpb25cIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0IHRleHQ6IFwic2VudGVuY2Ugb25lLiBzZW50ZW5jZSB0d28uXFxuICBzZW50ZW5jZSB0aHJlZS5cIlxuXG4gICAgICBpdCAnc2VsZWN0cyB0byB0aGUgZW5kIG9mIHRoZSBjdXJyZW50IHNlbnRlbmNlJywgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzAsIDIwXVxuICAgICAgICBlbnN1cmUgJ3kgKScsIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiBcImNlIHR3by5cXG4gIFwiXG5cbiAgICAgIGl0ICdzZWxlY3RzIHRvIHRoZSBiZWdpbm5pbmcgb2YgdGhlIGN1cnJlbnQgc2VudGVuY2UnLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMjBdXG4gICAgICAgIGVuc3VyZSAneSAoJywgcmVnaXN0ZXI6ICdcIic6IHRleHQ6IFwic2VudGVuXCJcblxuICBkZXNjcmliZSBcInRoZSB7LH0ga2V5YmluZGluZ1wiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNldFxuICAgICAgICB0ZXh0OiBcIlwiXCJcblxuXG5cbiAgICAgICAgMzogcGFyYWdyYXBoLTFcbiAgICAgICAgNDogcGFyYWdyYXBoLTFcblxuXG5cbiAgICAgICAgODogcGFyYWdyYXBoLTJcblxuXG5cbiAgICAgICAgMTI6IHBhcmFncmFwaC0zXG4gICAgICAgIDEzOiBwYXJhZ3JhcGgtM1xuXG5cbiAgICAgICAgMTY6IHBhcmFncHJhaC00XFxuXG4gICAgICAgIFwiXCJcIlxuICAgICAgICBjdXJzb3I6IFswLCAwXVxuXG4gICAgZGVzY3JpYmUgXCJhcyBhIG1vdGlvblwiLCAtPlxuICAgICAgaXQgXCJtb3ZlcyB0aGUgY3Vyc29yIHRvIHRoZSBlbmQgb2YgdGhlIHBhcmFncmFwaFwiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgZW5zdXJlICd9JywgY3Vyc29yOiBbNSwgMF1cbiAgICAgICAgZW5zdXJlICd9JywgY3Vyc29yOiBbOSwgMF1cbiAgICAgICAgZW5zdXJlICd9JywgY3Vyc29yOiBbMTQsIDBdXG4gICAgICAgIGVuc3VyZSAneycsIGN1cnNvcjogWzExLCAwXVxuICAgICAgICBlbnN1cmUgJ3snLCBjdXJzb3I6IFs3LCAwXVxuICAgICAgICBlbnN1cmUgJ3snLCBjdXJzb3I6IFsyLCAwXVxuXG4gICAgICBpdCBcInN1cHBvcnQgY291bnRcIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzAsIDBdXG4gICAgICAgIGVuc3VyZSAnMyB9JywgY3Vyc29yOiBbMTQsIDBdXG4gICAgICAgIGVuc3VyZSAnMyB7JywgY3Vyc29yOiBbMiwgMF1cblxuICAgICAgaXQgXCJjYW4gbW92ZSBzdGFydCBvZiBidWZmZXIgb3IgZW5kIG9mIGJ1ZmZlciBhdCBtYXhpbXVtXCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFswLCAwXVxuICAgICAgICBlbnN1cmUgJzEgMCB9JywgY3Vyc29yOiBbMTYsIDE0XVxuICAgICAgICBlbnN1cmUgJzEgMCB7JywgY3Vyc29yOiBbMCwgMF1cblxuICAgIGRlc2NyaWJlIFwiYXMgYSBzZWxlY3Rpb25cIiwgLT5cbiAgICAgIGl0ICdzZWxlY3RzIHRvIHRoZSBlbmQgb2YgdGhlIGN1cnJlbnQgcGFyYWdyYXBoJywgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzMsIDNdXG4gICAgICAgIGVuc3VyZSAneSB9JywgcmVnaXN0ZXI6ICdcIic6IHRleHQ6IFwicGFyYWdyYXBoLTFcXG40OiBwYXJhZ3JhcGgtMVxcblwiXG4gICAgICBpdCAnc2VsZWN0cyB0byB0aGUgZW5kIG9mIHRoZSBjdXJyZW50IHBhcmFncmFwaCcsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFs0LCAzXVxuICAgICAgICBlbnN1cmUgJ3kgeycsIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiBcIlxcbjM6IHBhcmFncmFwaC0xXFxuNDogXCJcblxuICBkZXNjcmliZSBcInRoZSBiIGtleWJpbmRpbmdcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXQgdGV4dDogXCIgYWIgY2RlMSstIFxcbiB4eXpcXG5cXG56aXAgfVxcbiBsYXN0XCJcblxuICAgIGRlc2NyaWJlIFwiYXMgYSBtb3Rpb25cIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzQsIDFdXG5cbiAgICAgIGl0IFwibW92ZXMgdGhlIGN1cnNvciB0byB0aGUgYmVnaW5uaW5nIG9mIHRoZSBwcmV2aW91cyB3b3JkXCIsIC0+XG4gICAgICAgIGVuc3VyZSAnYicsIGN1cnNvcjogWzMsIDRdXG4gICAgICAgIGVuc3VyZSAnYicsIGN1cnNvcjogWzMsIDBdXG4gICAgICAgIGVuc3VyZSAnYicsIGN1cnNvcjogWzIsIDBdXG4gICAgICAgIGVuc3VyZSAnYicsIGN1cnNvcjogWzEsIDFdXG4gICAgICAgIGVuc3VyZSAnYicsIGN1cnNvcjogWzAsIDhdXG4gICAgICAgIGVuc3VyZSAnYicsIGN1cnNvcjogWzAsIDRdXG4gICAgICAgIGVuc3VyZSAnYicsIGN1cnNvcjogWzAsIDFdXG5cbiAgICAgICAgIyBHbyB0byBzdGFydCBvZiB0aGUgZmlsZSwgYWZ0ZXIgbW92aW5nIHBhc3QgdGhlIGZpcnN0IHdvcmRcbiAgICAgICAgZW5zdXJlICdiJywgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgIyBTdGF5IGF0IHRoZSBzdGFydCBvZiB0aGUgZmlsZVxuICAgICAgICBlbnN1cmUgJ2InLCBjdXJzb3I6IFswLCAwXVxuXG4gICAgZGVzY3JpYmUgXCJhcyBhIHNlbGVjdGlvblwiLCAtPlxuICAgICAgZGVzY3JpYmUgXCJ3aXRoaW4gYSB3b3JkXCIsIC0+XG4gICAgICAgIGl0IFwic2VsZWN0cyB0byB0aGUgYmVnaW5uaW5nIG9mIHRoZSBjdXJyZW50IHdvcmRcIiwgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMl1cbiAgICAgICAgICBlbnN1cmUgJ3kgYicsIGN1cnNvcjogWzAsIDFdLCByZWdpc3RlcjogJ1wiJzogdGV4dDogJ2EnXG5cbiAgICAgIGRlc2NyaWJlIFwiYmV0d2VlbiB3b3Jkc1wiLCAtPlxuICAgICAgICBpdCBcInNlbGVjdHMgdG8gdGhlIGJlZ2lubmluZyBvZiB0aGUgbGFzdCB3b3JkXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzAsIDRdXG4gICAgICAgICAgZW5zdXJlICd5IGInLCBjdXJzb3I6IFswLCAxXSwgcmVnaXN0ZXI6ICdcIic6IHRleHQ6ICdhYiAnXG5cbiAgZGVzY3JpYmUgXCJ0aGUgQiBrZXliaW5kaW5nXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2V0XG4gICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgIGNkZTErLSBhYlxuICAgICAgICAgIFxcdCB4eXotMTIzXG5cbiAgICAgICAgICAgemlwXFxuXG4gICAgICAgICAgXCJcIlwiXG5cbiAgICBkZXNjcmliZSBcImFzIGEgbW90aW9uXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFs0LCAwXVxuXG4gICAgICBpdCBcIm1vdmVzIHRoZSBjdXJzb3IgdG8gdGhlIGJlZ2lubmluZyBvZiB0aGUgcHJldmlvdXMgd29yZFwiLCAtPlxuICAgICAgICBlbnN1cmUgJ0InLCBjdXJzb3I6IFszLCAxXVxuICAgICAgICBlbnN1cmUgJ0InLCBjdXJzb3I6IFsyLCAwXVxuICAgICAgICBlbnN1cmUgJ0InLCBjdXJzb3I6IFsxLCAyXVxuICAgICAgICBlbnN1cmUgJ0InLCBjdXJzb3I6IFswLCA3XVxuICAgICAgICBlbnN1cmUgJ0InLCBjdXJzb3I6IFswLCAwXVxuXG4gICAgZGVzY3JpYmUgXCJhcyBhIHNlbGVjdGlvblwiLCAtPlxuICAgICAgaXQgXCJzZWxlY3RzIHRvIHRoZSBiZWdpbm5pbmcgb2YgdGhlIHdob2xlIHdvcmRcIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzEsIDhdXG4gICAgICAgIGVuc3VyZSAneSBCJywgcmVnaXN0ZXI6ICdcIic6IHRleHQ6ICd4eXotMTInICMgYmVjYXVzZSBjdXJzb3IgaXMgb24gdGhlIGAzYFxuXG4gICAgICBpdCBcImRvZXNuJ3QgZ28gcGFzdCB0aGUgYmVnaW5uaW5nIG9mIHRoZSBmaWxlXCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFswLCAwXSwgcmVnaXN0ZXI6ICdcIic6IHRleHQ6ICdhYmMnXG4gICAgICAgIGVuc3VyZSAneSBCJywgcmVnaXN0ZXI6ICdcIic6IHRleHQ6ICdhYmMnXG5cbiAgZGVzY3JpYmUgXCJ0aGUgXiBrZXliaW5kaW5nXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2V0IHRleHRDOiBcInwgIGFiY2RlXCJcblxuICAgIGRlc2NyaWJlIFwiZnJvbSB0aGUgYmVnaW5uaW5nIG9mIHRoZSBsaW5lXCIsIC0+XG4gICAgICBkZXNjcmliZSBcImFzIGEgbW90aW9uXCIsIC0+XG4gICAgICAgIGl0IFwibW92ZXMgdGhlIGN1cnNvciB0byB0aGUgZmlyc3QgY2hhcmFjdGVyIG9mIHRoZSBsaW5lXCIsIC0+XG4gICAgICAgICAgZW5zdXJlICdeJywgY3Vyc29yOiBbMCwgMl1cblxuICAgICAgZGVzY3JpYmUgXCJhcyBhIHNlbGVjdGlvblwiLCAtPlxuICAgICAgICBpdCAnc2VsZWN0cyB0byB0aGUgZmlyc3QgY2hhcmFjdGVyIG9mIHRoZSBsaW5lJywgLT5cbiAgICAgICAgICBlbnN1cmUgJ2QgXicsXG4gICAgICAgICAgICB0ZXh0OiAnYWJjZGUnXG4gICAgICAgICAgICBjdXJzb3I6IFswLCAwXVxuICAgICAgICBpdCAnc2VsZWN0cyB0byB0aGUgZmlyc3QgY2hhcmFjdGVyIG9mIHRoZSBsaW5lJywgLT5cbiAgICAgICAgICBlbnN1cmUgJ2QgSScsIHRleHQ6ICdhYmNkZScsIGN1cnNvcjogWzAsIDBdXG5cbiAgICBkZXNjcmliZSBcImZyb20gdGhlIGZpcnN0IGNoYXJhY3RlciBvZiB0aGUgbGluZVwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMl1cblxuICAgICAgZGVzY3JpYmUgXCJhcyBhIG1vdGlvblwiLCAtPlxuICAgICAgICBpdCBcInN0YXlzIHB1dFwiLCAtPlxuICAgICAgICAgIGVuc3VyZSAnXicsIGN1cnNvcjogWzAsIDJdXG5cbiAgICAgIGRlc2NyaWJlIFwiYXMgYSBzZWxlY3Rpb25cIiwgLT5cbiAgICAgICAgaXQgXCJkb2VzIG5vdGhpbmdcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJ2QgXicsXG4gICAgICAgICAgICB0ZXh0OiAnICBhYmNkZSdcbiAgICAgICAgICAgIGN1cnNvcjogWzAsIDJdXG5cbiAgICBkZXNjcmliZSBcImZyb20gdGhlIG1pZGRsZSBvZiBhIHdvcmRcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzAsIDRdXG5cbiAgICAgIGRlc2NyaWJlIFwiYXMgYSBtb3Rpb25cIiwgLT5cbiAgICAgICAgaXQgXCJtb3ZlcyB0aGUgY3Vyc29yIHRvIHRoZSBmaXJzdCBjaGFyYWN0ZXIgb2YgdGhlIGxpbmVcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJ14nLCBjdXJzb3I6IFswLCAyXVxuXG4gICAgICBkZXNjcmliZSBcImFzIGEgc2VsZWN0aW9uXCIsIC0+XG4gICAgICAgIGl0ICdzZWxlY3RzIHRvIHRoZSBmaXJzdCBjaGFyYWN0ZXIgb2YgdGhlIGxpbmUnLCAtPlxuICAgICAgICAgIGVuc3VyZSAnZCBeJyxcbiAgICAgICAgICAgIHRleHQ6ICcgIGNkZSdcbiAgICAgICAgICAgIGN1cnNvcjogWzAsIDJdXG4gICAgICAgIGl0ICdzZWxlY3RzIHRvIHRoZSBmaXJzdCBjaGFyYWN0ZXIgb2YgdGhlIGxpbmUnLCAtPlxuICAgICAgICAgIGVuc3VyZSAnZCBJJywgdGV4dDogJyAgY2RlJywgY3Vyc29yOiBbMCwgMl0sXG5cbiAgZGVzY3JpYmUgXCJ0aGUgMCBrZXliaW5kaW5nXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2V0IHRleHQ6IFwiICBhYmNkZVwiLCBjdXJzb3I6IFswLCA0XVxuXG4gICAgZGVzY3JpYmUgXCJhcyBhIG1vdGlvblwiLCAtPlxuICAgICAgaXQgXCJtb3ZlcyB0aGUgY3Vyc29yIHRvIHRoZSBmaXJzdCBjb2x1bW5cIiwgLT5cbiAgICAgICAgZW5zdXJlICcwJywgY3Vyc29yOiBbMCwgMF1cblxuICAgIGRlc2NyaWJlIFwiYXMgYSBzZWxlY3Rpb25cIiwgLT5cbiAgICAgIGl0ICdzZWxlY3RzIHRvIHRoZSBmaXJzdCBjb2x1bW4gb2YgdGhlIGxpbmUnLCAtPlxuICAgICAgICBlbnN1cmUgJ2QgMCcsIHRleHQ6ICdjZGUnLCBjdXJzb3I6IFswLCAwXVxuXG4gIGRlc2NyaWJlIFwidGhlIHwga2V5YmluZGluZ1wiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNldCB0ZXh0OiBcIiAgYWJjZGVcIiwgY3Vyc29yOiBbMCwgNF1cblxuICAgIGRlc2NyaWJlIFwiYXMgYSBtb3Rpb25cIiwgLT5cbiAgICAgIGl0IFwibW92ZXMgdGhlIGN1cnNvciB0byB0aGUgbnVtYmVyIGNvbHVtblwiLCAtPlxuICAgICAgICBlbnN1cmUgJ3wnLCBjdXJzb3I6IFswLCAwXVxuICAgICAgICBlbnN1cmUgJzEgfCcsIGN1cnNvcjogWzAsIDBdXG4gICAgICAgIGVuc3VyZSAnMyB8JywgY3Vyc29yOiBbMCwgMl1cbiAgICAgICAgZW5zdXJlICc0IHwnLCBjdXJzb3I6IFswLCAzXVxuXG4gICAgZGVzY3JpYmUgXCJhcyBvcGVyYXRvcidzIHRhcmdldFwiLCAtPlxuICAgICAgaXQgJ2JlaGF2ZSBleGNsdXNpdmVseScsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFswLCAwXVxuICAgICAgICBlbnN1cmUgJ2QgNCB8JywgdGV4dDogJ2JjZGUnLCBjdXJzb3I6IFswLCAwXVxuXG4gIGRlc2NyaWJlIFwidGhlICQga2V5YmluZGluZ1wiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNldFxuICAgICAgICB0ZXh0OiBcIiAgYWJjZGVcXG5cXG4xMjM0NTY3ODkwXCJcbiAgICAgICAgY3Vyc29yOiBbMCwgNF1cblxuICAgIGRlc2NyaWJlIFwiYXMgYSBtb3Rpb24gZnJvbSBlbXB0eSBsaW5lXCIsIC0+XG4gICAgICBpdCBcIm1vdmVzIHRoZSBjdXJzb3IgdG8gdGhlIGVuZCBvZiB0aGUgbGluZVwiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMSwgMF1cbiAgICAgICAgZW5zdXJlICckJywgY3Vyc29yOiBbMSwgMF1cblxuICAgIGRlc2NyaWJlIFwiYXMgYSBtb3Rpb25cIiwgLT5cbiAgICAgICMgRklYTUU6IFNlZSBhdG9tL3ZpbS1tb2RlIzJcbiAgICAgIGl0IFwibW92ZXMgdGhlIGN1cnNvciB0byB0aGUgZW5kIG9mIHRoZSBsaW5lXCIsIC0+XG4gICAgICAgIGVuc3VyZSAnJCcsIGN1cnNvcjogWzAsIDZdXG5cbiAgICAgIGl0IFwic2V0IGdvYWxDb2x1bW4gSW5maW5pdHlcIiwgLT5cbiAgICAgICAgZXhwZWN0KGVkaXRvci5nZXRMYXN0Q3Vyc29yKCkuZ29hbENvbHVtbikudG9CZShudWxsKVxuICAgICAgICBlbnN1cmUgJyQnLCBjdXJzb3I6IFswLCA2XVxuICAgICAgICBleHBlY3QoZWRpdG9yLmdldExhc3RDdXJzb3IoKS5nb2FsQ29sdW1uKS50b0JlKEluZmluaXR5KVxuXG4gICAgICBpdCBcInNob3VsZCByZW1haW4gaW4gdGhlIGxhc3QgY29sdW1uIHdoZW4gbW92aW5nIGRvd25cIiwgLT5cbiAgICAgICAgZW5zdXJlICckIGonLCBjdXJzb3I6IFsxLCAwXVxuICAgICAgICBlbnN1cmUgJ2onLCBjdXJzb3I6IFsyLCA5XVxuXG4gICAgICBpdCBcInN1cHBvcnQgY291bnRcIiwgLT5cbiAgICAgICAgZW5zdXJlICczICQnLCBjdXJzb3I6IFsyLCA5XVxuXG4gICAgZGVzY3JpYmUgXCJhcyBhIHNlbGVjdGlvblwiLCAtPlxuICAgICAgaXQgXCJzZWxlY3RzIHRvIHRoZSBlbmQgb2YgdGhlIGxpbmVzXCIsIC0+XG4gICAgICAgIGVuc3VyZSAnZCAkJyxcbiAgICAgICAgICB0ZXh0OiBcIiAgYWJcXG5cXG4xMjM0NTY3ODkwXCJcbiAgICAgICAgICBjdXJzb3I6IFswLCAzXVxuXG4gIGRlc2NyaWJlIFwidGhlIDAga2V5YmluZGluZ1wiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNldCB0ZXh0OiBcIiAgYVxcblwiLCBjdXJzb3I6IFswLCAyXSxcblxuICAgIGRlc2NyaWJlIFwiYXMgYSBtb3Rpb25cIiwgLT5cbiAgICAgIGl0IFwibW92ZXMgdGhlIGN1cnNvciB0byB0aGUgYmVnaW5uaW5nIG9mIHRoZSBsaW5lXCIsIC0+XG4gICAgICAgIGVuc3VyZSAnMCcsIGN1cnNvcjogWzAsIDBdXG5cbiAgZGVzY3JpYmUgXCJ0aGUgLSBrZXliaW5kaW5nXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2V0IHRleHQ6IFwiXCJcIlxuICAgICAgICBhYmNkZWZnXG4gICAgICAgICAgYWJjXG4gICAgICAgICAgYWJjXFxuXG4gICAgICAgIFwiXCJcIlxuXG4gICAgZGVzY3JpYmUgXCJmcm9tIHRoZSBtaWRkbGUgb2YgYSBsaW5lXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFsxLCAzXVxuXG4gICAgICBkZXNjcmliZSBcImFzIGEgbW90aW9uXCIsIC0+XG4gICAgICAgIGl0IFwibW92ZXMgdGhlIGN1cnNvciB0byB0aGUgbGFzdCBjaGFyYWN0ZXIgb2YgdGhlIHByZXZpb3VzIGxpbmVcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJy0nLCBjdXJzb3I6IFswLCAwXVxuXG4gICAgICBkZXNjcmliZSBcImFzIGEgc2VsZWN0aW9uXCIsIC0+XG4gICAgICAgIGl0IFwiZGVsZXRlcyB0aGUgY3VycmVudCBhbmQgcHJldmlvdXMgbGluZVwiLCAtPlxuICAgICAgICAgIGVuc3VyZSAnZCAtJywgdGV4dDogXCIgIGFiY1xcblwiLCBjdXJzb3I6IFswLCAyXVxuXG4gICAgZGVzY3JpYmUgXCJmcm9tIHRoZSBmaXJzdCBjaGFyYWN0ZXIgb2YgYSBsaW5lIGluZGVudGVkIHRoZSBzYW1lIGFzIHRoZSBwcmV2aW91cyBvbmVcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzIsIDJdXG5cbiAgICAgIGRlc2NyaWJlIFwiYXMgYSBtb3Rpb25cIiwgLT5cbiAgICAgICAgaXQgXCJtb3ZlcyB0byB0aGUgZmlyc3QgY2hhcmFjdGVyIG9mIHRoZSBwcmV2aW91cyBsaW5lIChkaXJlY3RseSBhYm92ZSlcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJy0nLCBjdXJzb3I6IFsxLCAyXVxuXG4gICAgICBkZXNjcmliZSBcImFzIGEgc2VsZWN0aW9uXCIsIC0+XG4gICAgICAgIGl0IFwic2VsZWN0cyB0byB0aGUgZmlyc3QgY2hhcmFjdGVyIG9mIHRoZSBwcmV2aW91cyBsaW5lIChkaXJlY3RseSBhYm92ZSlcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJ2QgLScsIHRleHQ6IFwiYWJjZGVmZ1xcblwiXG4gICAgICAgICAgIyBjb21tZW50ZWQgb3V0IGJlY2F1c2UgdGhlIGNvbHVtbiBpcyB3cm9uZyBkdWUgdG8gYSBidWcgaW4gYGtgOyByZS1lbmFibGUgd2hlbiBga2AgaXMgZml4ZWRcbiAgICAgICAgICAjZXhwZWN0KGVkaXRvci5nZXRDdXJzb3JTY3JlZW5Qb3NpdGlvbigpKS50b0VxdWFsIFswLCAyXVxuXG4gICAgZGVzY3JpYmUgXCJmcm9tIHRoZSBiZWdpbm5pbmcgb2YgYSBsaW5lIHByZWNlZGVkIGJ5IGFuIGluZGVudGVkIGxpbmVcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzIsIDBdXG5cbiAgICAgIGRlc2NyaWJlIFwiYXMgYSBtb3Rpb25cIiwgLT5cbiAgICAgICAgaXQgXCJtb3ZlcyB0aGUgY3Vyc29yIHRvIHRoZSBmaXJzdCBjaGFyYWN0ZXIgb2YgdGhlIHByZXZpb3VzIGxpbmVcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJy0nLCBjdXJzb3I6IFsxLCAyXVxuXG4gICAgICBkZXNjcmliZSBcImFzIGEgc2VsZWN0aW9uXCIsIC0+XG4gICAgICAgIGl0IFwic2VsZWN0cyB0byB0aGUgZmlyc3QgY2hhcmFjdGVyIG9mIHRoZSBwcmV2aW91cyBsaW5lXCIsIC0+XG4gICAgICAgICAgZW5zdXJlICdkIC0nLCB0ZXh0OiBcImFiY2RlZmdcXG5cIlxuXG4gICAgZGVzY3JpYmUgXCJ3aXRoIGEgY291bnRcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dDogXCIxXFxuMlxcbjNcXG40XFxuNVxcbjZcXG5cIlxuICAgICAgICAgIGN1cnNvcjogWzQsIDBdXG5cbiAgICAgIGRlc2NyaWJlIFwiYXMgYSBtb3Rpb25cIiwgLT5cbiAgICAgICAgaXQgXCJtb3ZlcyB0aGUgY3Vyc29yIHRvIHRoZSBmaXJzdCBjaGFyYWN0ZXIgb2YgdGhhdCBtYW55IGxpbmVzIHByZXZpb3VzXCIsIC0+XG4gICAgICAgICAgZW5zdXJlICczIC0nLCBjdXJzb3I6IFsxLCAwXVxuXG4gICAgICBkZXNjcmliZSBcImFzIGEgc2VsZWN0aW9uXCIsIC0+XG4gICAgICAgIGl0IFwiZGVsZXRlcyB0aGUgY3VycmVudCBsaW5lIHBsdXMgdGhhdCBtYW55IHByZXZpb3VzIGxpbmVzXCIsIC0+XG4gICAgICAgICAgZW5zdXJlICdkIDMgLScsXG4gICAgICAgICAgICB0ZXh0OiBcIjFcXG42XFxuXCIsXG4gICAgICAgICAgICBjdXJzb3I6IFsxLCAwXSxcblxuICBkZXNjcmliZSBcInRoZSArIGtleWJpbmRpbmdcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXQgdGV4dF86IFwiXCJcIlxuICAgICAgX19hYmNcbiAgICAgIF9fYWJjXG4gICAgICBhYmNkZWZnXFxuXG4gICAgICBcIlwiXCJcblxuICAgIGRlc2NyaWJlIFwiZnJvbSB0aGUgbWlkZGxlIG9mIGEgbGluZVwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMSwgM11cblxuICAgICAgZGVzY3JpYmUgXCJhcyBhIG1vdGlvblwiLCAtPlxuICAgICAgICBpdCBcIm1vdmVzIHRoZSBjdXJzb3IgdG8gdGhlIGZpcnN0IGNoYXJhY3RlciBvZiB0aGUgbmV4dCBsaW5lXCIsIC0+XG4gICAgICAgICAgZW5zdXJlICcrJywgY3Vyc29yOiBbMiwgMF1cblxuICAgICAgZGVzY3JpYmUgXCJhcyBhIHNlbGVjdGlvblwiLCAtPlxuICAgICAgICBpdCBcImRlbGV0ZXMgdGhlIGN1cnJlbnQgYW5kIG5leHQgbGluZVwiLCAtPlxuICAgICAgICAgIGVuc3VyZSAnZCArJywgdGV4dDogXCIgIGFiY1xcblwiXG5cbiAgICBkZXNjcmliZSBcImZyb20gdGhlIGZpcnN0IGNoYXJhY3RlciBvZiBhIGxpbmUgaW5kZW50ZWQgdGhlIHNhbWUgYXMgdGhlIG5leHQgb25lXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+IHNldCBjdXJzb3I6IFswLCAyXVxuXG4gICAgICBkZXNjcmliZSBcImFzIGEgbW90aW9uXCIsIC0+XG4gICAgICAgIGl0IFwibW92ZXMgdG8gdGhlIGZpcnN0IGNoYXJhY3RlciBvZiB0aGUgbmV4dCBsaW5lIChkaXJlY3RseSBiZWxvdylcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJysnLCBjdXJzb3I6IFsxLCAyXVxuXG4gICAgICBkZXNjcmliZSBcImFzIGEgc2VsZWN0aW9uXCIsIC0+XG4gICAgICAgIGl0IFwic2VsZWN0cyB0byB0aGUgZmlyc3QgY2hhcmFjdGVyIG9mIHRoZSBuZXh0IGxpbmUgKGRpcmVjdGx5IGJlbG93KVwiLCAtPlxuICAgICAgICAgIGVuc3VyZSAnZCArJywgdGV4dDogXCJhYmNkZWZnXFxuXCJcblxuICAgIGRlc2NyaWJlIFwiZnJvbSB0aGUgYmVnaW5uaW5nIG9mIGEgbGluZSBmb2xsb3dlZCBieSBhbiBpbmRlbnRlZCBsaW5lXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+IHNldCBjdXJzb3I6IFswLCAwXVxuXG4gICAgICBkZXNjcmliZSBcImFzIGEgbW90aW9uXCIsIC0+XG4gICAgICAgIGl0IFwibW92ZXMgdGhlIGN1cnNvciB0byB0aGUgZmlyc3QgY2hhcmFjdGVyIG9mIHRoZSBuZXh0IGxpbmVcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJysnLCBjdXJzb3I6IFsxLCAyXVxuXG4gICAgICBkZXNjcmliZSBcImFzIGEgc2VsZWN0aW9uXCIsIC0+XG4gICAgICAgIGl0IFwic2VsZWN0cyB0byB0aGUgZmlyc3QgY2hhcmFjdGVyIG9mIHRoZSBuZXh0IGxpbmVcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJ2QgKycsXG4gICAgICAgICAgICB0ZXh0OiBcImFiY2RlZmdcXG5cIlxuICAgICAgICAgICAgY3Vyc29yOiBbMCwgMF1cblxuICAgIGRlc2NyaWJlIFwid2l0aCBhIGNvdW50XCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHQ6IFwiMVxcbjJcXG4zXFxuNFxcbjVcXG42XFxuXCJcbiAgICAgICAgICBjdXJzb3I6IFsxLCAwXVxuXG4gICAgICBkZXNjcmliZSBcImFzIGEgbW90aW9uXCIsIC0+XG4gICAgICAgIGl0IFwibW92ZXMgdGhlIGN1cnNvciB0byB0aGUgZmlyc3QgY2hhcmFjdGVyIG9mIHRoYXQgbWFueSBsaW5lcyBmb2xsb3dpbmdcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJzMgKycsIGN1cnNvcjogWzQsIDBdXG5cbiAgICAgIGRlc2NyaWJlIFwiYXMgYSBzZWxlY3Rpb25cIiwgLT5cbiAgICAgICAgaXQgXCJkZWxldGVzIHRoZSBjdXJyZW50IGxpbmUgcGx1cyB0aGF0IG1hbnkgZm9sbG93aW5nIGxpbmVzXCIsIC0+XG4gICAgICAgICAgZW5zdXJlICdkIDMgKycsXG4gICAgICAgICAgICB0ZXh0OiBcIjFcXG42XFxuXCJcbiAgICAgICAgICAgIGN1cnNvcjogWzEsIDBdXG5cbiAgZGVzY3JpYmUgXCJ0aGUgXyBrZXliaW5kaW5nXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2V0IHRleHRfOiBcIlwiXCJcbiAgICAgICAgX19hYmNcbiAgICAgICAgX19hYmNcbiAgICAgICAgYWJjZGVmZ1xcblxuICAgICAgICBcIlwiXCJcblxuICAgIGRlc2NyaWJlIFwiZnJvbSB0aGUgbWlkZGxlIG9mIGEgbGluZVwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPiBzZXQgY3Vyc29yOiBbMSwgM11cblxuICAgICAgZGVzY3JpYmUgXCJhcyBhIG1vdGlvblwiLCAtPlxuICAgICAgICBpdCBcIm1vdmVzIHRoZSBjdXJzb3IgdG8gdGhlIGZpcnN0IGNoYXJhY3RlciBvZiB0aGUgY3VycmVudCBsaW5lXCIsIC0+XG4gICAgICAgICAgZW5zdXJlICdfJywgY3Vyc29yOiBbMSwgMl1cblxuICAgICAgZGVzY3JpYmUgXCJhcyBhIHNlbGVjdGlvblwiLCAtPlxuICAgICAgICBpdCBcImRlbGV0ZXMgdGhlIGN1cnJlbnQgbGluZVwiLCAtPlxuICAgICAgICAgIGVuc3VyZSAnZCBfJyxcbiAgICAgICAgICAgIHRleHRfOiBcIlwiXCJcbiAgICAgICAgICAgIF9fYWJjXG4gICAgICAgICAgICBhYmNkZWZnXFxuXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgIGN1cnNvcjogWzEsIDBdXG5cbiAgICBkZXNjcmliZSBcIndpdGggYSBjb3VudFwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0OiBcIjFcXG4yXFxuM1xcbjRcXG41XFxuNlxcblwiXG4gICAgICAgICAgY3Vyc29yOiBbMSwgMF1cblxuICAgICAgZGVzY3JpYmUgXCJhcyBhIG1vdGlvblwiLCAtPlxuICAgICAgICBpdCBcIm1vdmVzIHRoZSBjdXJzb3IgdG8gdGhlIGZpcnN0IGNoYXJhY3RlciBvZiB0aGF0IG1hbnkgbGluZXMgZm9sbG93aW5nXCIsIC0+XG4gICAgICAgICAgZW5zdXJlICczIF8nLCBjdXJzb3I6IFszLCAwXVxuXG4gICAgICBkZXNjcmliZSBcImFzIGEgc2VsZWN0aW9uXCIsIC0+XG4gICAgICAgIGl0IFwiZGVsZXRlcyB0aGUgY3VycmVudCBsaW5lIHBsdXMgdGhhdCBtYW55IGZvbGxvd2luZyBsaW5lc1wiLCAtPlxuICAgICAgICAgIGVuc3VyZSAnZCAzIF8nLFxuICAgICAgICAgICAgdGV4dDogXCIxXFxuNVxcbjZcXG5cIlxuICAgICAgICAgICAgY3Vyc29yOiBbMSwgMF1cblxuICBkZXNjcmliZSBcInRoZSBlbnRlciBrZXliaW5kaW5nXCIsIC0+XG4gICAgIyBbRklYTUVdIERpcnR5IHRlc3QsIHdoYXRzIHRoaXMhP1xuICAgIHN0YXJ0aW5nVGV4dCA9IFwiICBhYmNcXG4gIGFiY1xcbmFiY2RlZmdcXG5cIlxuXG4gICAgZGVzY3JpYmUgXCJmcm9tIHRoZSBtaWRkbGUgb2YgYSBsaW5lXCIsIC0+XG4gICAgICBzdGFydGluZ0N1cnNvclBvc2l0aW9uID0gWzEsIDNdXG5cbiAgICAgIGRlc2NyaWJlIFwiYXMgYSBtb3Rpb25cIiwgLT5cbiAgICAgICAgaXQgXCJhY3RzIHRoZSBzYW1lIGFzIHRoZSArIGtleWJpbmRpbmdcIiwgLT5cbiAgICAgICAgICAjIGRvIGl0IHdpdGggKyBhbmQgc2F2ZSB0aGUgcmVzdWx0c1xuICAgICAgICAgIHNldFxuICAgICAgICAgICAgdGV4dDogc3RhcnRpbmdUZXh0XG4gICAgICAgICAgICBjdXJzb3I6IHN0YXJ0aW5nQ3Vyc29yUG9zaXRpb25cbiAgICAgICAgICBrZXlzdHJva2UgJysnXG4gICAgICAgICAgcmVmZXJlbmNlQ3Vyc29yUG9zaXRpb24gPSBlZGl0b3IuZ2V0Q3Vyc29yU2NyZWVuUG9zaXRpb24oKVxuICAgICAgICAgIHNldFxuICAgICAgICAgICAgdGV4dDogc3RhcnRpbmdUZXh0XG4gICAgICAgICAgICBjdXJzb3I6IHN0YXJ0aW5nQ3Vyc29yUG9zaXRpb25cbiAgICAgICAgICBlbnN1cmUgJ2VudGVyJyxcbiAgICAgICAgICAgIGN1cnNvcjogcmVmZXJlbmNlQ3Vyc29yUG9zaXRpb25cblxuICAgICAgZGVzY3JpYmUgXCJhcyBhIHNlbGVjdGlvblwiLCAtPlxuICAgICAgICBpdCBcImFjdHMgdGhlIHNhbWUgYXMgdGhlICsga2V5YmluZGluZ1wiLCAtPlxuICAgICAgICAgICMgZG8gaXQgd2l0aCArIGFuZCBzYXZlIHRoZSByZXN1bHRzXG4gICAgICAgICAgc2V0XG4gICAgICAgICAgICB0ZXh0OiBzdGFydGluZ1RleHRcbiAgICAgICAgICAgIGN1cnNvcjogc3RhcnRpbmdDdXJzb3JQb3NpdGlvblxuXG4gICAgICAgICAga2V5c3Ryb2tlICdkICsnXG4gICAgICAgICAgcmVmZXJlbmNlVGV4dCA9IGVkaXRvci5nZXRUZXh0KClcbiAgICAgICAgICByZWZlcmVuY2VDdXJzb3JQb3NpdGlvbiA9IGVkaXRvci5nZXRDdXJzb3JTY3JlZW5Qb3NpdGlvbigpXG5cbiAgICAgICAgICBzZXRcbiAgICAgICAgICAgIHRleHQ6IHN0YXJ0aW5nVGV4dFxuICAgICAgICAgICAgY3Vyc29yOiBzdGFydGluZ0N1cnNvclBvc2l0aW9uXG4gICAgICAgICAgZW5zdXJlICdkIGVudGVyJyxcbiAgICAgICAgICAgIHRleHQ6IHJlZmVyZW5jZVRleHRcbiAgICAgICAgICAgIGN1cnNvcjogcmVmZXJlbmNlQ3Vyc29yUG9zaXRpb25cblxuICBkZXNjcmliZSBcInRoZSBnZyBrZXliaW5kaW5nXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2V0XG4gICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAxYWJjXG4gICAgICAgICAgIDJcbiAgICAgICAgICAzXFxuXG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgIGN1cnNvcjogWzAsIDJdXG5cbiAgICBkZXNjcmliZSBcImFzIGEgbW90aW9uXCIsIC0+XG4gICAgICBkZXNjcmliZSBcImluIG5vcm1hbCBtb2RlXCIsIC0+XG4gICAgICAgIGl0IFwibW92ZXMgdGhlIGN1cnNvciB0byB0aGUgYmVnaW5uaW5nIG9mIHRoZSBmaXJzdCBsaW5lXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzIsIDBdXG4gICAgICAgICAgZW5zdXJlICdnIGcnLCBjdXJzb3I6IFswLCAxXVxuXG4gICAgICAgIGl0IFwibW92ZSB0byBzYW1lIHBvc2l0aW9uIGlmIGl0cyBvbiBmaXJzdCBsaW5lIGFuZCBmaXJzdCBjaGFyXCIsIC0+XG4gICAgICAgICAgZW5zdXJlICdnIGcnLCBjdXJzb3I6IFswLCAxXVxuXG4gICAgICBkZXNjcmliZSBcImluIGxpbmV3aXNlIHZpc3VhbCBtb2RlXCIsIC0+XG4gICAgICAgIGl0IFwic2VsZWN0cyB0byB0aGUgZmlyc3QgbGluZSBpbiB0aGUgZmlsZVwiLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFsxLCAwXVxuICAgICAgICAgIGVuc3VyZSAnViBnIGcnLFxuICAgICAgICAgICAgc2VsZWN0ZWRUZXh0OiBcIiAxYWJjXFxuIDJcXG5cIlxuICAgICAgICAgICAgY3Vyc29yOiBbMCwgMF1cblxuICAgICAgZGVzY3JpYmUgXCJpbiBjaGFyYWN0ZXJ3aXNlIHZpc3VhbCBtb2RlXCIsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMSwgMV1cbiAgICAgICAgaXQgXCJzZWxlY3RzIHRvIHRoZSBmaXJzdCBsaW5lIGluIHRoZSBmaWxlXCIsIC0+XG4gICAgICAgICAgZW5zdXJlICd2IGcgZycsXG4gICAgICAgICAgICBzZWxlY3RlZFRleHQ6IFwiMWFiY1xcbiAyXCJcbiAgICAgICAgICAgIGN1cnNvcjogWzAsIDFdXG5cbiAgICBkZXNjcmliZSBcIndoZW4gY291bnQgc3BlY2lmaWVkXCIsIC0+XG4gICAgICBkZXNjcmliZSBcImluIG5vcm1hbCBtb2RlXCIsIC0+XG4gICAgICAgIGl0IFwibW92ZXMgdGhlIGN1cnNvciB0byBmaXJzdCBjaGFyIG9mIGEgc3BlY2lmaWVkIGxpbmVcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJzIgZyBnJywgY3Vyc29yOiBbMSwgMV1cblxuICAgICAgZGVzY3JpYmUgXCJpbiBsaW5ld2lzZSB2aXN1YWwgbW90aW9uXCIsIC0+XG4gICAgICAgIGl0IFwic2VsZWN0cyB0byBhIHNwZWNpZmllZCBsaW5lXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzIsIDBdXG4gICAgICAgICAgZW5zdXJlICdWIDIgZyBnJyxcbiAgICAgICAgICAgIHNlbGVjdGVkVGV4dDogXCIgMlxcbjNcXG5cIlxuICAgICAgICAgICAgY3Vyc29yOiBbMSwgMF1cblxuICAgICAgZGVzY3JpYmUgXCJpbiBjaGFyYWN0ZXJ3aXNlIHZpc3VhbCBtb3Rpb25cIiwgLT5cbiAgICAgICAgaXQgXCJzZWxlY3RzIHRvIGEgZmlyc3QgY2hhcmFjdGVyIG9mIHNwZWNpZmllZCBsaW5lXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzIsIDBdXG4gICAgICAgICAgZW5zdXJlICd2IDIgZyBnJyxcbiAgICAgICAgICAgIHNlbGVjdGVkVGV4dDogXCIyXFxuM1wiXG4gICAgICAgICAgICBjdXJzb3I6IFsxLCAxXVxuXG4gIGRlc2NyaWJlIFwidGhlIGdfIGtleWJpbmRpbmdcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXQgdGV4dF86IFwiXCJcIlxuICAgICAgICAxX19cbiAgICAgICAgICAgIDJfX1xuICAgICAgICAgM2FiY1xuICAgICAgICBfXG4gICAgICAgIFwiXCJcIlxuXG4gICAgZGVzY3JpYmUgXCJhcyBhIG1vdGlvblwiLCAtPlxuICAgICAgaXQgXCJtb3ZlcyB0aGUgY3Vyc29yIHRvIHRoZSBsYXN0IG5vbmJsYW5rIGNoYXJhY3RlclwiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMSwgMF1cbiAgICAgICAgZW5zdXJlICdnIF8nLCBjdXJzb3I6IFsxLCA0XVxuXG4gICAgICBpdCBcIndpbGwgbW92ZSB0aGUgY3Vyc29yIHRvIHRoZSBiZWdpbm5pbmcgb2YgdGhlIGxpbmUgaWYgbmVjZXNzYXJ5XCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFswLCAyXVxuICAgICAgICBlbnN1cmUgJ2cgXycsIGN1cnNvcjogWzAsIDBdXG5cbiAgICBkZXNjcmliZSBcImFzIGEgcmVwZWF0ZWQgbW90aW9uXCIsIC0+XG4gICAgICBpdCBcIm1vdmVzIHRoZSBjdXJzb3IgZG93bndhcmQgYW5kIG91dHdhcmRcIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzAsIDBdXG4gICAgICAgIGVuc3VyZSAnMiBnIF8nLCBjdXJzb3I6IFsxLCA0XVxuXG4gICAgZGVzY3JpYmUgXCJhcyBhIHNlbGVjdGlvblwiLCAtPlxuICAgICAgaXQgXCJzZWxlY3RzIHRoZSBjdXJyZW50IGxpbmUgZXhjbHVkaW5nIHdoaXRlc3BhY2VcIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzEsIDJdXG4gICAgICAgIGVuc3VyZSAndiAyIGcgXycsXG4gICAgICAgICAgc2VsZWN0ZWRUZXh0OiBcIiAgMiAgXFxuIDNhYmNcIlxuXG4gIGRlc2NyaWJlIFwidGhlIEcga2V5YmluZGluZ1wiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNldFxuICAgICAgICB0ZXh0XzogXCJcIlwiXG4gICAgICAgIDFcbiAgICAgICAgX19fXzJcbiAgICAgICAgXzNhYmNcbiAgICAgICAgX1xuICAgICAgICBcIlwiXCJcbiAgICAgICAgY3Vyc29yOiBbMCwgMl1cblxuICAgIGRlc2NyaWJlIFwiYXMgYSBtb3Rpb25cIiwgLT5cbiAgICAgIGl0IFwibW92ZXMgdGhlIGN1cnNvciB0byB0aGUgbGFzdCBsaW5lIGFmdGVyIHdoaXRlc3BhY2VcIiwgLT5cbiAgICAgICAgZW5zdXJlICdHJywgY3Vyc29yOiBbMywgMF1cblxuICAgIGRlc2NyaWJlIFwiYXMgYSByZXBlYXRlZCBtb3Rpb25cIiwgLT5cbiAgICAgIGl0IFwibW92ZXMgdGhlIGN1cnNvciB0byBhIHNwZWNpZmllZCBsaW5lXCIsIC0+XG4gICAgICAgIGVuc3VyZSAnMiBHJywgY3Vyc29yOiBbMSwgNF1cblxuICAgIGRlc2NyaWJlIFwiYXMgYSBzZWxlY3Rpb25cIiwgLT5cbiAgICAgIGl0IFwic2VsZWN0cyB0byB0aGUgbGFzdCBsaW5lIGluIHRoZSBmaWxlXCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFsxLCAwXVxuICAgICAgICBlbnN1cmUgJ3YgRycsXG4gICAgICAgICAgc2VsZWN0ZWRUZXh0OiBcIiAgICAyXFxuIDNhYmNcXG4gXCJcbiAgICAgICAgICBjdXJzb3I6IFszLCAxXVxuXG4gIGRlc2NyaWJlIFwidGhlIE4lIGtleWJpbmRpbmdcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXRcbiAgICAgICAgdGV4dDogWzAuLjk5OV0uam9pbihcIlxcblwiKVxuICAgICAgICBjdXJzb3I6IFswLCAwXVxuXG4gICAgZGVzY3JpYmUgXCJwdXQgY3Vyc29yIG9uIGxpbmUgc3BlY2lmaWVkIGJ5IHBlcmNlbnRcIiwgLT5cbiAgICAgIGl0IFwiNTAlXCIsIC0+IGVuc3VyZSAnNSAwICUnLCBjdXJzb3I6IFs0OTksIDBdXG4gICAgICBpdCBcIjMwJVwiLCAtPiBlbnN1cmUgJzMgMCAlJywgY3Vyc29yOiBbMjk5LCAwXVxuICAgICAgaXQgXCIxMDAlXCIsIC0+IGVuc3VyZSAnMSAwIDAgJScsIGN1cnNvcjogWzk5OSwgMF1cbiAgICAgIGl0IFwiMTIwJVwiLCAtPiBlbnN1cmUgJzEgMiAwICUnLCBjdXJzb3I6IFs5OTksIDBdXG5cbiAgZGVzY3JpYmUgXCJ0aGUgSCwgTSwgTCBrZXliaW5kaW5nXCIsIC0+XG4gICAgW2VlbF0gPSBbXVxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIGVlbCA9IGVkaXRvckVsZW1lbnRcbiAgICAgIHNldFxuICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIDFcbiAgICAgICAgICAyXG4gICAgICAgICAgM1xuICAgICAgICAgIDRcbiAgICAgICAgICAgIDVcbiAgICAgICAgICA2XG4gICAgICAgICAgN1xuICAgICAgICAgIDhcbiAgICAgICAgICA5XG4gICAgICAgICAgICAxMFxuICAgICAgICAgIFwiXCJcIlxuICAgICAgICBjdXJzb3I6IFs4LCAwXVxuXG4gICAgZGVzY3JpYmUgXCJ0aGUgSCBrZXliaW5kaW5nXCIsIC0+XG4gICAgICBpdCBcIm1vdmVzIHRoZSBjdXJzb3IgdG8gdGhlIG5vbi1ibGFuay1jaGFyIG9uIGZpcnN0IHJvdyBpZiB2aXNpYmxlXCIsIC0+XG4gICAgICAgIHNweU9uKGVlbCwgJ2dldEZpcnN0VmlzaWJsZVNjcmVlblJvdycpLmFuZFJldHVybigwKVxuICAgICAgICBlbnN1cmUgJ0gnLCBjdXJzb3I6IFswLCAyXVxuXG4gICAgICBpdCBcIm1vdmVzIHRoZSBjdXJzb3IgdG8gdGhlIG5vbi1ibGFuay1jaGFyIG9uIGZpcnN0IHZpc2libGUgcm93IHBsdXMgc2Nyb2xsIG9mZnNldFwiLCAtPlxuICAgICAgICBzcHlPbihlZWwsICdnZXRGaXJzdFZpc2libGVTY3JlZW5Sb3cnKS5hbmRSZXR1cm4oMilcbiAgICAgICAgZW5zdXJlICdIJywgY3Vyc29yOiBbNCwgMl1cblxuICAgICAgaXQgXCJyZXNwZWN0cyBjb3VudHNcIiwgLT5cbiAgICAgICAgc3B5T24oZWVsLCAnZ2V0Rmlyc3RWaXNpYmxlU2NyZWVuUm93JykuYW5kUmV0dXJuKDApXG4gICAgICAgIGVuc3VyZSAnNCBIJywgY3Vyc29yOiBbMywgMF1cblxuICAgIGRlc2NyaWJlIFwidGhlIEwga2V5YmluZGluZ1wiLCAtPlxuICAgICAgaXQgXCJtb3ZlcyB0aGUgY3Vyc29yIHRvIG5vbi1ibGFuay1jaGFyIG9uIGxhc3Qgcm93IGlmIHZpc2libGVcIiwgLT5cbiAgICAgICAgc3B5T24oZWRpdG9yLCAnZ2V0TGFzdFZpc2libGVTY3JlZW5Sb3cnKS5hbmRSZXR1cm4oOSlcbiAgICAgICAgZW5zdXJlICdMJywgY3Vyc29yOiBbOSwgMl1cblxuICAgICAgaXQgXCJtb3ZlcyB0aGUgY3Vyc29yIHRvIHRoZSBmaXJzdCB2aXNpYmxlIHJvdyBwbHVzIG9mZnNldFwiLCAtPlxuICAgICAgICBzcHlPbihlZGl0b3IsICdnZXRMYXN0VmlzaWJsZVNjcmVlblJvdycpLmFuZFJldHVybig3KVxuICAgICAgICBlbnN1cmUgJ0wnLCBjdXJzb3I6IFs0LCAyXVxuXG4gICAgICBpdCBcInJlc3BlY3RzIGNvdW50c1wiLCAtPlxuICAgICAgICBzcHlPbihlZGl0b3IsICdnZXRMYXN0VmlzaWJsZVNjcmVlblJvdycpLmFuZFJldHVybig5KVxuICAgICAgICBlbnN1cmUgJzMgTCcsIGN1cnNvcjogWzcsIDBdXG5cbiAgICBkZXNjcmliZSBcInRoZSBNIGtleWJpbmRpbmdcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc3B5T24oZWVsLCAnZ2V0Rmlyc3RWaXNpYmxlU2NyZWVuUm93JykuYW5kUmV0dXJuKDApXG4gICAgICAgIHNweU9uKGVkaXRvciwgJ2dldExhc3RWaXNpYmxlU2NyZWVuUm93JykuYW5kUmV0dXJuKDEwKVxuXG4gICAgICBpdCBcIm1vdmVzIHRoZSBjdXJzb3IgdG8gdGhlIG5vbi1ibGFuay1jaGFyIG9mIG1pZGRsZSBvZiBzY3JlZW5cIiwgLT5cbiAgICAgICAgZW5zdXJlICdNJywgY3Vyc29yOiBbNCwgMl1cblxuICBkZXNjcmliZSBcIm1vdmVUb0ZpcnN0Q2hhcmFjdGVyT25WZXJ0aWNhbE1vdGlvbiBzZXR0aW5nXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2V0dGluZ3Muc2V0KCdtb3ZlVG9GaXJzdENoYXJhY3Rlck9uVmVydGljYWxNb3Rpb24nLCBmYWxzZSlcbiAgICAgIHNldFxuICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAwIDAwMDAwMDAwMDAwMFxuICAgICAgICAgIDEgMTExMTExMTExMTExXG4gICAgICAgIDIgMjIyMjIyMjIyMjIyXFxuXG4gICAgICAgIFwiXCJcIlxuICAgICAgICBjdXJzb3I6IFsyLCAxMF1cblxuICAgIGRlc2NyaWJlIFwiZ2csIEcsIE4lXCIsIC0+XG4gICAgICBpdCBcImdvIHRvIHJvdyB3aXRoIGtlZXAgY29sdW1uIGFuZCByZXNwZWN0IGN1cnNvci5nb2FsQ29sdW1cIiwgLT5cbiAgICAgICAgZW5zdXJlICdnIGcnLCBjdXJzb3I6IFswLCAxMF1cbiAgICAgICAgZW5zdXJlICckJywgY3Vyc29yOiBbMCwgMTVdXG4gICAgICAgIGVuc3VyZSAnRycsIGN1cnNvcjogWzIsIDEzXVxuICAgICAgICBleHBlY3QoZWRpdG9yLmdldExhc3RDdXJzb3IoKS5nb2FsQ29sdW1uKS50b0JlKEluZmluaXR5KVxuICAgICAgICBlbnN1cmUgJzEgJScsIGN1cnNvcjogWzAsIDE1XVxuICAgICAgICBleHBlY3QoZWRpdG9yLmdldExhc3RDdXJzb3IoKS5nb2FsQ29sdW1uKS50b0JlKEluZmluaXR5KVxuICAgICAgICBlbnN1cmUgJzEgMCBoJywgY3Vyc29yOiBbMCwgNV1cbiAgICAgICAgZW5zdXJlICc1IDAgJScsIGN1cnNvcjogWzEsIDVdXG4gICAgICAgIGVuc3VyZSAnMSAwIDAgJScsIGN1cnNvcjogWzIsIDVdXG5cbiAgICBkZXNjcmliZSBcIkgsIE0sIExcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc3B5T24oZWRpdG9yRWxlbWVudCwgJ2dldEZpcnN0VmlzaWJsZVNjcmVlblJvdycpLmFuZFJldHVybigwKVxuICAgICAgICBzcHlPbihlZGl0b3IsICdnZXRMYXN0VmlzaWJsZVNjcmVlblJvdycpLmFuZFJldHVybigzKVxuXG4gICAgICBpdCBcImdvIHRvIHJvdyB3aXRoIGtlZXAgY29sdW1uIGFuZCByZXNwZWN0IGN1cnNvci5nb2FsQ29sdW1cIiwgLT5cbiAgICAgICAgZW5zdXJlICdIJywgY3Vyc29yOiBbMCwgMTBdXG4gICAgICAgIGVuc3VyZSAnTScsIGN1cnNvcjogWzEsIDEwXVxuICAgICAgICBlbnN1cmUgJ0wnLCBjdXJzb3I6IFsyLCAxMF1cbiAgICAgICAgZW5zdXJlICckJywgY3Vyc29yOiBbMiwgMTNdXG4gICAgICAgIGV4cGVjdChlZGl0b3IuZ2V0TGFzdEN1cnNvcigpLmdvYWxDb2x1bW4pLnRvQmUoSW5maW5pdHkpXG4gICAgICAgIGVuc3VyZSAnSCcsIGN1cnNvcjogWzAsIDE1XVxuICAgICAgICBlbnN1cmUgJ00nLCBjdXJzb3I6IFsxLCAxNV1cbiAgICAgICAgZW5zdXJlICdMJywgY3Vyc29yOiBbMiwgMTNdXG4gICAgICAgIGV4cGVjdChlZGl0b3IuZ2V0TGFzdEN1cnNvcigpLmdvYWxDb2x1bW4pLnRvQmUoSW5maW5pdHkpXG5cbiAgZGVzY3JpYmUgJ3RoZSBtYXJrIGtleWJpbmRpbmdzJywgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXRcbiAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgMTJcbiAgICAgICAgICAgIDM0XG4gICAgICAgIDU2XFxuXG4gICAgICAgIFwiXCJcIlxuICAgICAgICBjdXJzb3I6IFswLCAxXVxuXG4gICAgaXQgJ21vdmVzIHRvIHRoZSBiZWdpbm5pbmcgb2YgdGhlIGxpbmUgb2YgYSBtYXJrJywgLT5cbiAgICAgIHNldCBjdXJzb3I6IFsxLCAxXVxuICAgICAga2V5c3Ryb2tlICdtIGEnXG4gICAgICBzZXQgY3Vyc29yOiBbMCwgMF1cbiAgICAgIGVuc3VyZSBcIicgYVwiLCBjdXJzb3I6IFsxLCA0XVxuXG4gICAgaXQgJ21vdmVzIGxpdGVyYWxseSB0byBhIG1hcmsnLCAtPlxuICAgICAgc2V0IGN1cnNvcjogWzEsIDJdXG4gICAgICBrZXlzdHJva2UgJ20gYSdcbiAgICAgIHNldCBjdXJzb3I6IFswLCAwXVxuICAgICAgZW5zdXJlICdgIGEnLCBjdXJzb3I6IFsxLCAyXVxuXG4gICAgaXQgJ2RlbGV0ZXMgdG8gYSBtYXJrIGJ5IGxpbmUnLCAtPlxuICAgICAgc2V0IGN1cnNvcjogWzEsIDVdXG4gICAgICBrZXlzdHJva2UgJ20gYSdcbiAgICAgIHNldCBjdXJzb3I6IFswLCAwXVxuICAgICAgZW5zdXJlIFwiZCAnIGFcIiwgdGV4dDogJzU2XFxuJ1xuXG4gICAgaXQgJ2RlbGV0ZXMgYmVmb3JlIHRvIGEgbWFyayBsaXRlcmFsbHknLCAtPlxuICAgICAgc2V0IGN1cnNvcjogWzEsIDVdXG4gICAgICBrZXlzdHJva2UgJ20gYSdcbiAgICAgIHNldCBjdXJzb3I6IFswLCAyXVxuICAgICAgZW5zdXJlICdkIGAgYScsIHRleHQ6ICcgIDRcXG41NlxcbidcblxuICAgIGl0ICdkZWxldGVzIGFmdGVyIHRvIGEgbWFyayBsaXRlcmFsbHknLCAtPlxuICAgICAgc2V0IGN1cnNvcjogWzEsIDVdXG4gICAgICBrZXlzdHJva2UgJ20gYSdcbiAgICAgIHNldCBjdXJzb3I6IFsyLCAxXVxuICAgICAgZW5zdXJlICdkIGAgYScsIHRleHQ6ICcgIDEyXFxuICAgIDM2XFxuJ1xuXG4gICAgaXQgJ21vdmVzIGJhY2sgdG8gcHJldmlvdXMnLCAtPlxuICAgICAgc2V0IGN1cnNvcjogWzEsIDVdXG4gICAgICBrZXlzdHJva2UgJ2AgYCdcbiAgICAgIHNldCBjdXJzb3I6IFsyLCAxXVxuICAgICAgZW5zdXJlICdgIGAnLCBjdXJzb3I6IFsxLCA1XVxuXG4gIGRlc2NyaWJlIFwianVtcCBjb21tYW5kIHVwZGF0ZSBgIGFuZCAnIG1hcmtcIiwgLT5cbiAgICBlbnN1cmVNYXJrID0gKF9rZXlzdHJva2UsIG9wdGlvbikgLT5cbiAgICAgIGtleXN0cm9rZShfa2V5c3Ryb2tlKVxuICAgICAgZW5zdXJlIGN1cnNvcjogb3B0aW9uLmN1cnNvclxuICAgICAgZW5zdXJlIG1hcms6IFwiYFwiOiBvcHRpb24ubWFya1xuICAgICAgZW5zdXJlIG1hcms6IFwiJ1wiOiBvcHRpb24ubWFya1xuXG4gICAgZW5zdXJlSnVtcEFuZEJhY2sgPSAoa2V5c3Ryb2tlLCBvcHRpb24pIC0+XG4gICAgICBpbml0aWFsID0gZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKClcbiAgICAgIGVuc3VyZU1hcmsga2V5c3Ryb2tlLCBjdXJzb3I6IG9wdGlvbi5jdXJzb3IsIG1hcms6IGluaXRpYWxcbiAgICAgIGFmdGVyTW92ZSA9IGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpXG4gICAgICBleHBlY3QoaW5pdGlhbC5pc0VxdWFsKGFmdGVyTW92ZSkpLnRvQmUoZmFsc2UpXG4gICAgICBlbnN1cmVNYXJrIFwiYCBgXCIsIGN1cnNvcjogaW5pdGlhbCwgbWFyazogb3B0aW9uLmN1cnNvclxuXG4gICAgZW5zdXJlSnVtcEFuZEJhY2tMaW5ld2lzZSA9IChrZXlzdHJva2UsIG9wdGlvbikgLT5cbiAgICAgIGluaXRpYWwgPSBlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKVxuICAgICAgZXhwZWN0KGluaXRpYWwuY29sdW1uKS5ub3QudG9CZSgwKVxuICAgICAgZW5zdXJlTWFyayBrZXlzdHJva2UsIGN1cnNvcjogb3B0aW9uLmN1cnNvciwgbWFyazogaW5pdGlhbFxuICAgICAgYWZ0ZXJNb3ZlID0gZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKClcbiAgICAgIGV4cGVjdChpbml0aWFsLmlzRXF1YWwoYWZ0ZXJNb3ZlKSkudG9CZShmYWxzZSlcbiAgICAgIGVuc3VyZU1hcmsgXCInICdcIiwgY3Vyc29yOiBbaW5pdGlhbC5yb3csIDBdLCBtYXJrOiBvcHRpb24uY3Vyc29yXG5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBmb3IgbWFyayBpbiBcImAnXCJcbiAgICAgICAgdmltU3RhdGUubWFyay5tYXJrc1ttYXJrXT8uZGVzdHJveSgpXG4gICAgICAgIHZpbVN0YXRlLm1hcmsubWFya3NbbWFya10gPSBudWxsXG5cbiAgICAgIHNldFxuICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgMDogb28gMFxuICAgICAgICAxOiAxMTExXG4gICAgICAgIDI6IDIyMjJcbiAgICAgICAgMzogb28gM1xuICAgICAgICA0OiA0NDQ0XG4gICAgICAgIDU6IG9vIDVcbiAgICAgICAgXCJcIlwiXG4gICAgICAgIGN1cnNvcjogWzEsIDBdXG5cbiAgICBkZXNjcmliZSBcImluaXRpYWwgc3RhdGVcIiwgLT5cbiAgICAgIGl0IFwicmV0dXJuIFswLCAwXVwiLCAtPlxuICAgICAgICBlbnN1cmUgbWFyazogXCInXCI6IFswLCAwXVxuICAgICAgICBlbnN1cmUgbWFyazogXCJgXCI6IFswLCAwXVxuXG4gICAgZGVzY3JpYmUgXCJqdW1wIG1vdGlvbiBpbiBub3JtYWwtbW9kZVwiLCAtPlxuICAgICAgaW5pdGlhbCA9IFszLCAzXVxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBqYXNtaW5lLmF0dGFjaFRvRE9NKGdldFZpZXcoYXRvbS53b3Jrc3BhY2UpKSAjIGZvciBMLCBNLCBIXG4gICAgICAgIGVuc3VyZSBtYXJrOiBcIidcIjogWzAsIDBdXG4gICAgICAgIGVuc3VyZSBtYXJrOiBcImBcIjogWzAsIDBdXG4gICAgICAgIHNldCBjdXJzb3I6IGluaXRpYWxcblxuICAgICAgaXQgXCJHIGp1bXAmYmFja1wiLCAtPiBlbnN1cmVKdW1wQW5kQmFjayAnRycsIGN1cnNvcjogWzUsIDBdXG4gICAgICBpdCBcImcgZyBqdW1wJmJhY2tcIiwgLT4gZW5zdXJlSnVtcEFuZEJhY2sgXCJnIGdcIiwgY3Vyc29yOiBbMCwgMF1cbiAgICAgIGl0IFwiMTAwICUganVtcCZiYWNrXCIsIC0+IGVuc3VyZUp1bXBBbmRCYWNrIFwiMSAwIDAgJVwiLCBjdXJzb3I6IFs1LCAwXVxuICAgICAgaXQgXCIpIGp1bXAmYmFja1wiLCAtPiBlbnN1cmVKdW1wQW5kQmFjayBcIilcIiwgY3Vyc29yOiBbNSwgNl1cbiAgICAgIGl0IFwiKCBqdW1wJmJhY2tcIiwgLT4gZW5zdXJlSnVtcEFuZEJhY2sgXCIoXCIsIGN1cnNvcjogWzAsIDBdXG4gICAgICBpdCBcIl0ganVtcCZiYWNrXCIsIC0+IGVuc3VyZUp1bXBBbmRCYWNrIFwiXVwiLCBjdXJzb3I6IFs1LCAzXVxuICAgICAgaXQgXCJbIGp1bXAmYmFja1wiLCAtPiBlbnN1cmVKdW1wQW5kQmFjayBcIltcIiwgY3Vyc29yOiBbMCwgM11cbiAgICAgIGl0IFwifSBqdW1wJmJhY2tcIiwgLT4gZW5zdXJlSnVtcEFuZEJhY2sgXCJ9XCIsIGN1cnNvcjogWzUsIDZdXG4gICAgICBpdCBcInsganVtcCZiYWNrXCIsIC0+IGVuc3VyZUp1bXBBbmRCYWNrIFwie1wiLCBjdXJzb3I6IFswLCAwXVxuICAgICAgaXQgXCJMIGp1bXAmYmFja1wiLCAtPiBlbnN1cmVKdW1wQW5kQmFjayBcIkxcIiwgY3Vyc29yOiBbNSwgMF1cbiAgICAgIGl0IFwiSCBqdW1wJmJhY2tcIiwgLT4gZW5zdXJlSnVtcEFuZEJhY2sgXCJIXCIsIGN1cnNvcjogWzAsIDBdXG4gICAgICBpdCBcIk0ganVtcCZiYWNrXCIsIC0+IGVuc3VyZUp1bXBBbmRCYWNrIFwiTVwiLCBjdXJzb3I6IFsyLCAwXVxuICAgICAgaXQgXCIqIGp1bXAmYmFja1wiLCAtPiBlbnN1cmVKdW1wQW5kQmFjayBcIipcIiwgY3Vyc29yOiBbNSwgM11cblxuICAgICAgIyBbQlVHXSBTdHJhbmdlIGJ1ZyBvZiBqYXNtaW5lIG9yIGF0b20ncyBqYXNtaW5lIGVuaGFuY21lbnQ/XG4gICAgICAjIFVzaW5nIHN1YmplY3QgXCIjIGp1bXAgJiBiYWNrXCIgc2tpcHMgc3BlYy5cbiAgICAgICMgTm90ZSBhdCBBdG9tIHYxLjExLjJcbiAgICAgIGl0IFwiU2hhcnAoIykganVtcCZiYWNrXCIsIC0+IGVuc3VyZUp1bXBBbmRCYWNrKCcjJywgY3Vyc29yOiBbMCwgM10pXG5cbiAgICAgIGl0IFwiLyBqdW1wJmJhY2tcIiwgLT4gZW5zdXJlSnVtcEFuZEJhY2sgW1wiL1wiLCBzZWFyY2g6ICdvbyddLCBjdXJzb3I6IFs1LCAzXVxuICAgICAgaXQgXCI/IGp1bXAmYmFja1wiLCAtPiBlbnN1cmVKdW1wQW5kQmFjayBbXCI/XCIsIHNlYXJjaDogJ29vJ10sIGN1cnNvcjogWzAsIDNdXG5cbiAgICAgIGl0IFwibiBqdW1wJmJhY2tcIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzAsIDBdXG4gICAgICAgIGVuc3VyZSBbJy8nLCBzZWFyY2g6ICdvbyddLCBjdXJzb3I6IFswLCAzXVxuICAgICAgICBlbnN1cmVKdW1wQW5kQmFjayBcIm5cIiwgY3Vyc29yOiBbMywgM11cbiAgICAgICAgZW5zdXJlSnVtcEFuZEJhY2sgXCJOXCIsIGN1cnNvcjogWzUsIDNdXG5cbiAgICAgIGl0IFwiTiBqdW1wJmJhY2tcIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzAsIDBdXG4gICAgICAgIGVuc3VyZSBbJz8nLCBzZWFyY2g6ICdvbyddLCBjdXJzb3I6IFs1LCAzXVxuICAgICAgICBlbnN1cmVKdW1wQW5kQmFjayBcIm5cIiwgY3Vyc29yOiBbMywgM11cbiAgICAgICAgZW5zdXJlSnVtcEFuZEJhY2sgXCJOXCIsIGN1cnNvcjogWzAsIDNdXG5cbiAgICAgIGl0IFwiRyBqdW1wJmJhY2sgbGluZXdpc2VcIiwgLT4gZW5zdXJlSnVtcEFuZEJhY2tMaW5ld2lzZSAnRycsIGN1cnNvcjogWzUsIDBdXG4gICAgICBpdCBcImcgZyBqdW1wJmJhY2sgbGluZXdpc2VcIiwgLT4gZW5zdXJlSnVtcEFuZEJhY2tMaW5ld2lzZSBcImcgZ1wiLCBjdXJzb3I6IFswLCAwXVxuICAgICAgaXQgXCIxMDAgJSBqdW1wJmJhY2sgbGluZXdpc2VcIiwgLT4gZW5zdXJlSnVtcEFuZEJhY2tMaW5ld2lzZSBcIjEgMCAwICVcIiwgY3Vyc29yOiBbNSwgMF1cbiAgICAgIGl0IFwiKSBqdW1wJmJhY2sgbGluZXdpc2VcIiwgLT4gZW5zdXJlSnVtcEFuZEJhY2tMaW5ld2lzZSBcIilcIiwgY3Vyc29yOiBbNSwgNl1cbiAgICAgIGl0IFwiKCBqdW1wJmJhY2sgbGluZXdpc2VcIiwgLT4gZW5zdXJlSnVtcEFuZEJhY2tMaW5ld2lzZSBcIihcIiwgY3Vyc29yOiBbMCwgMF1cbiAgICAgIGl0IFwiXSBqdW1wJmJhY2sgbGluZXdpc2VcIiwgLT4gZW5zdXJlSnVtcEFuZEJhY2tMaW5ld2lzZSBcIl1cIiwgY3Vyc29yOiBbNSwgM11cbiAgICAgIGl0IFwiWyBqdW1wJmJhY2sgbGluZXdpc2VcIiwgLT4gZW5zdXJlSnVtcEFuZEJhY2tMaW5ld2lzZSBcIltcIiwgY3Vyc29yOiBbMCwgM11cbiAgICAgIGl0IFwifSBqdW1wJmJhY2sgbGluZXdpc2VcIiwgLT4gZW5zdXJlSnVtcEFuZEJhY2tMaW5ld2lzZSBcIn1cIiwgY3Vyc29yOiBbNSwgNl1cbiAgICAgIGl0IFwieyBqdW1wJmJhY2sgbGluZXdpc2VcIiwgLT4gZW5zdXJlSnVtcEFuZEJhY2tMaW5ld2lzZSBcIntcIiwgY3Vyc29yOiBbMCwgMF1cbiAgICAgIGl0IFwiTCBqdW1wJmJhY2sgbGluZXdpc2VcIiwgLT4gZW5zdXJlSnVtcEFuZEJhY2tMaW5ld2lzZSBcIkxcIiwgY3Vyc29yOiBbNSwgMF1cbiAgICAgIGl0IFwiSCBqdW1wJmJhY2sgbGluZXdpc2VcIiwgLT4gZW5zdXJlSnVtcEFuZEJhY2tMaW5ld2lzZSBcIkhcIiwgY3Vyc29yOiBbMCwgMF1cbiAgICAgIGl0IFwiTSBqdW1wJmJhY2sgbGluZXdpc2VcIiwgLT4gZW5zdXJlSnVtcEFuZEJhY2tMaW5ld2lzZSBcIk1cIiwgY3Vyc29yOiBbMiwgMF1cbiAgICAgIGl0IFwiKiBqdW1wJmJhY2sgbGluZXdpc2VcIiwgLT4gZW5zdXJlSnVtcEFuZEJhY2tMaW5ld2lzZSBcIipcIiwgY3Vyc29yOiBbNSwgM11cblxuICBkZXNjcmliZSAndGhlIFYga2V5YmluZGluZycsIC0+XG4gICAgW3RleHRdID0gW11cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICB0ZXh0ID0gbmV3IFRleHREYXRhIFwiXCJcIlxuICAgICAgICAwMVxuICAgICAgICAwMDJcbiAgICAgICAgMDAwM1xuICAgICAgICAwMDAwNFxuICAgICAgICAwMDAwMDVcXG5cbiAgICAgICAgXCJcIlwiXG4gICAgICBzZXRcbiAgICAgICAgdGV4dDogdGV4dC5nZXRSYXcoKVxuICAgICAgICBjdXJzb3I6IFsxLCAxXVxuXG4gICAgaXQgXCJzZWxlY3RzIGRvd24gYSBsaW5lXCIsIC0+XG4gICAgICBlbnN1cmUgJ1YgaiBqJywgc2VsZWN0ZWRUZXh0OiB0ZXh0LmdldExpbmVzKFsxLi4zXSlcblxuICAgIGl0IFwic2VsZWN0cyB1cCBhIGxpbmVcIiwgLT5cbiAgICAgIGVuc3VyZSAnViBrJywgc2VsZWN0ZWRUZXh0OiB0ZXh0LmdldExpbmVzKFswLi4xXSlcblxuICBkZXNjcmliZSAnTW92ZVRvKFByZXZpb3VzfE5leHQpRm9sZChTdGFydHxFbmQpJywgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAgICAgYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoJ2xhbmd1YWdlLWNvZmZlZS1zY3JpcHQnKVxuICAgICAgZ2V0VmltU3RhdGUgJ3NhbXBsZS5jb2ZmZWUnLCAoc3RhdGUsIHZpbSkgLT5cbiAgICAgICAge2VkaXRvciwgZWRpdG9yRWxlbWVudH0gPSBzdGF0ZVxuICAgICAgICB7c2V0LCBlbnN1cmUsIGtleXN0cm9rZX0gPSB2aW1cblxuICAgICAgcnVucyAtPlxuICAgICAgICBhdG9tLmtleW1hcHMuYWRkIFwidGVzdFwiLFxuICAgICAgICAgICdhdG9tLXRleHQtZWRpdG9yLnZpbS1tb2RlLXBsdXM6bm90KC5pbnNlcnQtbW9kZSknOlxuICAgICAgICAgICAgJ1sgWyc6ICd2aW0tbW9kZS1wbHVzOm1vdmUtdG8tcHJldmlvdXMtZm9sZC1zdGFydCdcbiAgICAgICAgICAgICddIFsnOiAndmltLW1vZGUtcGx1czptb3ZlLXRvLW5leHQtZm9sZC1zdGFydCdcbiAgICAgICAgICAgICdbIF0nOiAndmltLW1vZGUtcGx1czptb3ZlLXRvLXByZXZpb3VzLWZvbGQtZW5kJ1xuICAgICAgICAgICAgJ10gXSc6ICd2aW0tbW9kZS1wbHVzOm1vdmUtdG8tbmV4dC1mb2xkLWVuZCdcblxuICAgIGFmdGVyRWFjaCAtPlxuICAgICAgYXRvbS5wYWNrYWdlcy5kZWFjdGl2YXRlUGFja2FnZSgnbGFuZ3VhZ2UtY29mZmVlLXNjcmlwdCcpXG5cbiAgICBkZXNjcmliZSBcIk1vdmVUb1ByZXZpb3VzRm9sZFN0YXJ0XCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFszMCwgMF1cbiAgICAgIGl0IFwibW92ZSB0byBmaXJzdCBjaGFyIG9mIHByZXZpb3VzIGZvbGQgc3RhcnQgcm93XCIsIC0+XG4gICAgICAgIGVuc3VyZSAnWyBbJywgY3Vyc29yOiBbMjIsIDZdXG4gICAgICAgIGVuc3VyZSAnWyBbJywgY3Vyc29yOiBbMjAsIDZdXG4gICAgICAgIGVuc3VyZSAnWyBbJywgY3Vyc29yOiBbMTgsIDRdXG4gICAgICAgIGVuc3VyZSAnWyBbJywgY3Vyc29yOiBbOSwgMl1cbiAgICAgICAgZW5zdXJlICdbIFsnLCBjdXJzb3I6IFs4LCAwXVxuXG4gICAgZGVzY3JpYmUgXCJNb3ZlVG9OZXh0Rm9sZFN0YXJ0XCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFswLCAwXVxuICAgICAgaXQgXCJtb3ZlIHRvIGZpcnN0IGNoYXIgb2YgbmV4dCBmb2xkIHN0YXJ0IHJvd1wiLCAtPlxuICAgICAgICBlbnN1cmUgJ10gWycsIGN1cnNvcjogWzgsIDBdXG4gICAgICAgIGVuc3VyZSAnXSBbJywgY3Vyc29yOiBbOSwgMl1cbiAgICAgICAgZW5zdXJlICddIFsnLCBjdXJzb3I6IFsxOCwgNF1cbiAgICAgICAgZW5zdXJlICddIFsnLCBjdXJzb3I6IFsyMCwgNl1cbiAgICAgICAgZW5zdXJlICddIFsnLCBjdXJzb3I6IFsyMiwgNl1cblxuICAgIGRlc2NyaWJlIFwiTW92ZVRvUHJldmlzRm9sZEVuZFwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMzAsIDBdXG4gICAgICBpdCBcIm1vdmUgdG8gZmlyc3QgY2hhciBvZiBwcmV2aW91cyBmb2xkIGVuZCByb3dcIiwgLT5cbiAgICAgICAgZW5zdXJlICdbIF0nLCBjdXJzb3I6IFsyOCwgMl1cbiAgICAgICAgZW5zdXJlICdbIF0nLCBjdXJzb3I6IFsyNSwgNF1cbiAgICAgICAgZW5zdXJlICdbIF0nLCBjdXJzb3I6IFsyMywgOF1cbiAgICAgICAgZW5zdXJlICdbIF0nLCBjdXJzb3I6IFsyMSwgOF1cblxuICAgIGRlc2NyaWJlIFwiTW92ZVRvTmV4dEZvbGRFbmRcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzAsIDBdXG4gICAgICBpdCBcIm1vdmUgdG8gZmlyc3QgY2hhciBvZiBuZXh0IGZvbGQgZW5kIHJvd1wiLCAtPlxuICAgICAgICBlbnN1cmUgJ10gXScsIGN1cnNvcjogWzIxLCA4XVxuICAgICAgICBlbnN1cmUgJ10gXScsIGN1cnNvcjogWzIzLCA4XVxuICAgICAgICBlbnN1cmUgJ10gXScsIGN1cnNvcjogWzI1LCA0XVxuICAgICAgICBlbnN1cmUgJ10gXScsIGN1cnNvcjogWzI4LCAyXVxuXG4gIGRlc2NyaWJlICdNb3ZlVG8oUHJldmlvdXN8TmV4dClTdHJpbmcnLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIGF0b20ua2V5bWFwcy5hZGQgXCJ0ZXN0XCIsXG4gICAgICAgICdhdG9tLXRleHQtZWRpdG9yLnZpbS1tb2RlLXBsdXM6bm90KC5pbnNlcnQtbW9kZSknOlxuICAgICAgICAgICdnIHMnOiAndmltLW1vZGUtcGx1czptb3ZlLXRvLW5leHQtc3RyaW5nJ1xuICAgICAgICAgICdnIFMnOiAndmltLW1vZGUtcGx1czptb3ZlLXRvLXByZXZpb3VzLXN0cmluZydcblxuICAgIGRlc2NyaWJlICdlZGl0b3IgZm9yIHNvZnRUYWInLCAtPlxuICAgICAgcGFjayA9ICdsYW5ndWFnZS1jb2ZmZWUtc2NyaXB0J1xuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAgICAgICBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZShwYWNrKVxuXG4gICAgICAgIHJ1bnMgLT5cbiAgICAgICAgICBzZXRcbiAgICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgZGlzcG9zYWJsZT8uZGlzcG9zZSgpXG4gICAgICAgICAgICBkaXNwb3NhYmxlID0gYXRvbS5jb21tYW5kcy5hZGQgJ2F0b20td29ya3NwYWNlJyxcbiAgICAgICAgICAgICAgJ2NoZWNrLXVwJzogLT4gZnVuKCdiYWNrd2FyZCcpXG4gICAgICAgICAgICAgICdjaGVjay1kb3duJzogLT4gZnVuKCdmb3J3YXJkJylcbiAgICAgICAgICAgIFxcblxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICBncmFtbWFyOiAnc291cmNlLmNvZmZlZSdcblxuICAgICAgYWZ0ZXJFYWNoIC0+XG4gICAgICAgIGF0b20ucGFja2FnZXMuZGVhY3RpdmF0ZVBhY2thZ2UocGFjaylcblxuICAgICAgaXQgXCJtb3ZlIHRvIG5leHQgc3RyaW5nXCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFswLCAwXVxuICAgICAgICBlbnN1cmUgJ2cgcycsIGN1cnNvcjogWzEsIDMxXVxuICAgICAgICBlbnN1cmUgJ2cgcycsIGN1cnNvcjogWzIsIDJdXG4gICAgICAgIGVuc3VyZSAnZyBzJywgY3Vyc29yOiBbMiwgMjFdXG4gICAgICAgIGVuc3VyZSAnZyBzJywgY3Vyc29yOiBbMywgMl1cbiAgICAgICAgZW5zdXJlICdnIHMnLCBjdXJzb3I6IFszLCAyM11cbiAgICAgIGl0IFwibW92ZSB0byBwcmV2aW91cyBzdHJpbmdcIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzQsIDBdXG4gICAgICAgIGVuc3VyZSAnZyBTJywgY3Vyc29yOiBbMywgMjNdXG4gICAgICAgIGVuc3VyZSAnZyBTJywgY3Vyc29yOiBbMywgMl1cbiAgICAgICAgZW5zdXJlICdnIFMnLCBjdXJzb3I6IFsyLCAyMV1cbiAgICAgICAgZW5zdXJlICdnIFMnLCBjdXJzb3I6IFsyLCAyXVxuICAgICAgICBlbnN1cmUgJ2cgUycsIGN1cnNvcjogWzEsIDMxXVxuICAgICAgaXQgXCJzdXBwb3J0IGNvdW50XCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFswLCAwXVxuICAgICAgICBlbnN1cmUgJzMgZyBzJywgY3Vyc29yOiBbMiwgMjFdXG4gICAgICAgIGVuc3VyZSAnMyBnIFMnLCBjdXJzb3I6IFsxLCAzMV1cblxuICAgIGRlc2NyaWJlICdlZGl0b3IgZm9yIGhhcmRUYWInLCAtPlxuICAgICAgcGFjayA9ICdsYW5ndWFnZS1nbydcbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICAgICAgYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UocGFjaylcblxuICAgICAgICBnZXRWaW1TdGF0ZSAnc2FtcGxlLmdvJywgKHN0YXRlLCB2aW1FZGl0b3IpIC0+XG4gICAgICAgICAge2VkaXRvciwgZWRpdG9yRWxlbWVudH0gPSBzdGF0ZVxuICAgICAgICAgIHtzZXQsIGVuc3VyZSwga2V5c3Ryb2tlfSA9IHZpbUVkaXRvclxuXG4gICAgICBhZnRlckVhY2ggLT5cbiAgICAgICAgYXRvbS5wYWNrYWdlcy5kZWFjdGl2YXRlUGFja2FnZShwYWNrKVxuXG4gICAgICBpdCBcIm1vdmUgdG8gbmV4dCBzdHJpbmdcIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvclNjcmVlbjogWzAsIDBdXG4gICAgICAgIGVuc3VyZSAnZyBzJywgY3Vyc29yU2NyZWVuOiBbMiwgN11cbiAgICAgICAgZW5zdXJlICdnIHMnLCBjdXJzb3JTY3JlZW46IFszLCA3XVxuICAgICAgICBlbnN1cmUgJ2cgcycsIGN1cnNvclNjcmVlbjogWzgsIDhdXG4gICAgICAgIGVuc3VyZSAnZyBzJywgY3Vyc29yU2NyZWVuOiBbOSwgOF1cbiAgICAgICAgZW5zdXJlICdnIHMnLCBjdXJzb3JTY3JlZW46IFsxMSwgMjBdXG4gICAgICAgIGVuc3VyZSAnZyBzJywgY3Vyc29yU2NyZWVuOiBbMTIsIDE1XVxuICAgICAgICBlbnN1cmUgJ2cgcycsIGN1cnNvclNjcmVlbjogWzEzLCAxNV1cbiAgICAgICAgZW5zdXJlICdnIHMnLCBjdXJzb3JTY3JlZW46IFsxNSwgMTVdXG4gICAgICAgIGVuc3VyZSAnZyBzJywgY3Vyc29yU2NyZWVuOiBbMTYsIDE1XVxuICAgICAgaXQgXCJtb3ZlIHRvIHByZXZpb3VzIHN0cmluZ1wiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yU2NyZWVuOiBbMTgsIDBdXG4gICAgICAgIGVuc3VyZSAnZyBTJywgY3Vyc29yU2NyZWVuOiBbMTYsIDE1XVxuICAgICAgICBlbnN1cmUgJ2cgUycsIGN1cnNvclNjcmVlbjogWzE1LCAxNV1cbiAgICAgICAgZW5zdXJlICdnIFMnLCBjdXJzb3JTY3JlZW46IFsxMywgMTVdXG4gICAgICAgIGVuc3VyZSAnZyBTJywgY3Vyc29yU2NyZWVuOiBbMTIsIDE1XVxuICAgICAgICBlbnN1cmUgJ2cgUycsIGN1cnNvclNjcmVlbjogWzExLCAyMF1cbiAgICAgICAgZW5zdXJlICdnIFMnLCBjdXJzb3JTY3JlZW46IFs5LCA4XVxuICAgICAgICBlbnN1cmUgJ2cgUycsIGN1cnNvclNjcmVlbjogWzgsIDhdXG4gICAgICAgIGVuc3VyZSAnZyBTJywgY3Vyc29yU2NyZWVuOiBbMywgN11cbiAgICAgICAgZW5zdXJlICdnIFMnLCBjdXJzb3JTY3JlZW46IFsyLCA3XVxuXG4gIGRlc2NyaWJlICdNb3ZlVG8oUHJldmlvdXN8TmV4dClOdW1iZXInLCAtPlxuICAgIHBhY2sgPSAnbGFuZ3VhZ2UtY29mZmVlLXNjcmlwdCdcbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBhdG9tLmtleW1hcHMuYWRkIFwidGVzdFwiLFxuICAgICAgICAnYXRvbS10ZXh0LWVkaXRvci52aW0tbW9kZS1wbHVzOm5vdCguaW5zZXJ0LW1vZGUpJzpcbiAgICAgICAgICAnZyBuJzogJ3ZpbS1tb2RlLXBsdXM6bW92ZS10by1uZXh0LW51bWJlcidcbiAgICAgICAgICAnZyBOJzogJ3ZpbS1tb2RlLXBsdXM6bW92ZS10by1wcmV2aW91cy1udW1iZXInXG5cbiAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgICBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZShwYWNrKVxuXG4gICAgICBydW5zIC0+XG4gICAgICAgIHNldCBncmFtbWFyOiAnc291cmNlLmNvZmZlZSdcblxuICAgICAgc2V0XG4gICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICBudW0xID0gMVxuICAgICAgICBhcnIxID0gWzEsIDEwMSwgMTAwMV1cbiAgICAgICAgYXJyMiA9IFtcIjFcIiwgXCIyXCIsIFwiM1wiXVxuICAgICAgICBudW0yID0gMlxuICAgICAgICBmdW4oXCIxXCIsIDIsIDMpXG4gICAgICAgIFxcblxuICAgICAgICBcIlwiXCJcblxuICAgIGFmdGVyRWFjaCAtPlxuICAgICAgYXRvbS5wYWNrYWdlcy5kZWFjdGl2YXRlUGFja2FnZShwYWNrKVxuXG4gICAgaXQgXCJtb3ZlIHRvIG5leHQgbnVtYmVyXCIsIC0+XG4gICAgICBzZXQgY3Vyc29yOiBbMCwgMF1cbiAgICAgIGVuc3VyZSAnZyBuJywgY3Vyc29yOiBbMCwgN11cbiAgICAgIGVuc3VyZSAnZyBuJywgY3Vyc29yOiBbMSwgOF1cbiAgICAgIGVuc3VyZSAnZyBuJywgY3Vyc29yOiBbMSwgMTFdXG4gICAgICBlbnN1cmUgJ2cgbicsIGN1cnNvcjogWzEsIDE2XVxuICAgICAgZW5zdXJlICdnIG4nLCBjdXJzb3I6IFszLCA3XVxuICAgICAgZW5zdXJlICdnIG4nLCBjdXJzb3I6IFs0LCA5XVxuICAgICAgZW5zdXJlICdnIG4nLCBjdXJzb3I6IFs0LCAxMl1cbiAgICBpdCBcIm1vdmUgdG8gcHJldmlvdXMgbnVtYmVyXCIsIC0+XG4gICAgICBzZXQgY3Vyc29yOiBbNSwgMF1cbiAgICAgIGVuc3VyZSAnZyBOJywgY3Vyc29yOiBbNCwgMTJdXG4gICAgICBlbnN1cmUgJ2cgTicsIGN1cnNvcjogWzQsIDldXG4gICAgICBlbnN1cmUgJ2cgTicsIGN1cnNvcjogWzMsIDddXG4gICAgICBlbnN1cmUgJ2cgTicsIGN1cnNvcjogWzEsIDE2XVxuICAgICAgZW5zdXJlICdnIE4nLCBjdXJzb3I6IFsxLCAxMV1cbiAgICAgIGVuc3VyZSAnZyBOJywgY3Vyc29yOiBbMSwgOF1cbiAgICAgIGVuc3VyZSAnZyBOJywgY3Vyc29yOiBbMCwgN11cbiAgICBpdCBcInN1cHBvcnQgY291bnRcIiwgLT5cbiAgICAgIHNldCBjdXJzb3I6IFswLCAwXVxuICAgICAgZW5zdXJlICc1IGcgbicsIGN1cnNvcjogWzMsIDddXG4gICAgICBlbnN1cmUgJzMgZyBOJywgY3Vyc29yOiBbMSwgOF1cblxuICBkZXNjcmliZSAnc3Vid29yZCBtb3Rpb24nLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIGF0b20ua2V5bWFwcy5hZGQgXCJ0ZXN0XCIsXG4gICAgICAgICdhdG9tLXRleHQtZWRpdG9yLnZpbS1tb2RlLXBsdXM6bm90KC5pbnNlcnQtbW9kZSknOlxuICAgICAgICAgICdxJzogJ3ZpbS1tb2RlLXBsdXM6bW92ZS10by1uZXh0LXN1YndvcmQnXG4gICAgICAgICAgJ1EnOiAndmltLW1vZGUtcGx1czptb3ZlLXRvLXByZXZpb3VzLXN1YndvcmQnXG4gICAgICAgICAgJ2N0cmwtZSc6ICd2aW0tbW9kZS1wbHVzOm1vdmUtdG8tZW5kLW9mLXN1YndvcmQnXG5cbiAgICBpdCBcIm1vdmUgdG8gbmV4dC9wcmV2aW91cyBzdWJ3b3JkXCIsIC0+XG4gICAgICBzZXQgdGV4dEM6IFwifGNhbWVsQ2FzZSA9PiAod2l0aCBzcGVjaWFsKSBDaGFSQWN0ZXJSc1xcblxcbmRhc2gtY2FzZVxcblxcbnNuYWtlX2Nhc2Vfd29yZFxcblwiXG4gICAgICBlbnN1cmUgJ3EnLCB0ZXh0QzogXCJjYW1lbHxDYXNlID0+ICh3aXRoIHNwZWNpYWwpIENoYVJBY3RlclJzXFxuXFxuZGFzaC1jYXNlXFxuXFxuc25ha2VfY2FzZV93b3JkXFxuXCJcbiAgICAgIGVuc3VyZSAncScsIHRleHRDOiBcImNhbWVsQ2FzZXwgPT4gKHdpdGggc3BlY2lhbCkgQ2hhUkFjdGVyUnNcXG5cXG5kYXNoLWNhc2VcXG5cXG5zbmFrZV9jYXNlX3dvcmRcXG5cIlxuICAgICAgZW5zdXJlICdxJywgdGV4dEM6IFwiY2FtZWxDYXNlID0+fCAod2l0aCBzcGVjaWFsKSBDaGFSQWN0ZXJSc1xcblxcbmRhc2gtY2FzZVxcblxcbnNuYWtlX2Nhc2Vfd29yZFxcblwiXG4gICAgICBlbnN1cmUgJ3EnLCB0ZXh0QzogXCJjYW1lbENhc2UgPT4gKHx3aXRoIHNwZWNpYWwpIENoYVJBY3RlclJzXFxuXFxuZGFzaC1jYXNlXFxuXFxuc25ha2VfY2FzZV93b3JkXFxuXCJcbiAgICAgIGVuc3VyZSAncScsIHRleHRDOiBcImNhbWVsQ2FzZSA9PiAod2l0aCB8c3BlY2lhbCkgQ2hhUkFjdGVyUnNcXG5cXG5kYXNoLWNhc2VcXG5cXG5zbmFrZV9jYXNlX3dvcmRcXG5cIlxuICAgICAgZW5zdXJlICdxJywgdGV4dEM6IFwiY2FtZWxDYXNlID0+ICh3aXRoIHNwZWNpYWx8KSBDaGFSQWN0ZXJSc1xcblxcbmRhc2gtY2FzZVxcblxcbnNuYWtlX2Nhc2Vfd29yZFxcblwiXG4gICAgICBlbnN1cmUgJ3EnLCB0ZXh0QzogXCJjYW1lbENhc2UgPT4gKHdpdGggc3BlY2lhbCkgfENoYVJBY3RlclJzXFxuXFxuZGFzaC1jYXNlXFxuXFxuc25ha2VfY2FzZV93b3JkXFxuXCJcbiAgICAgIGVuc3VyZSAncScsIHRleHRDOiBcImNhbWVsQ2FzZSA9PiAod2l0aCBzcGVjaWFsKSBDaGF8UkFjdGVyUnNcXG5cXG5kYXNoLWNhc2VcXG5cXG5zbmFrZV9jYXNlX3dvcmRcXG5cIlxuICAgICAgZW5zdXJlICdxJywgdGV4dEM6IFwiY2FtZWxDYXNlID0+ICh3aXRoIHNwZWNpYWwpIENoYVJ8QWN0ZXJSc1xcblxcbmRhc2gtY2FzZVxcblxcbnNuYWtlX2Nhc2Vfd29yZFxcblwiXG4gICAgICBlbnN1cmUgJ3EnLCB0ZXh0QzogXCJjYW1lbENhc2UgPT4gKHdpdGggc3BlY2lhbCkgQ2hhUkFjdGVyfFJzXFxuXFxuZGFzaC1jYXNlXFxuXFxuc25ha2VfY2FzZV93b3JkXFxuXCJcbiAgICAgIGVuc3VyZSAncScsIHRleHRDOiBcImNhbWVsQ2FzZSA9PiAod2l0aCBzcGVjaWFsKSBDaGFSQWN0ZXJSc1xcblxcbnxkYXNoLWNhc2VcXG5cXG5zbmFrZV9jYXNlX3dvcmRcXG5cIlxuICAgICAgZW5zdXJlICdxJywgdGV4dEM6IFwiY2FtZWxDYXNlID0+ICh3aXRoIHNwZWNpYWwpIENoYVJBY3RlclJzXFxuXFxuZGFzaHwtY2FzZVxcblxcbnNuYWtlX2Nhc2Vfd29yZFxcblwiXG4gICAgICBlbnN1cmUgJ3EnLCB0ZXh0QzogXCJjYW1lbENhc2UgPT4gKHdpdGggc3BlY2lhbCkgQ2hhUkFjdGVyUnNcXG5cXG5kYXNoLXxjYXNlXFxuXFxuc25ha2VfY2FzZV93b3JkXFxuXCJcbiAgICAgIGVuc3VyZSAncScsIHRleHRDOiBcImNhbWVsQ2FzZSA9PiAod2l0aCBzcGVjaWFsKSBDaGFSQWN0ZXJSc1xcblxcbmRhc2gtY2FzZVxcblxcbnxzbmFrZV9jYXNlX3dvcmRcXG5cIlxuICAgICAgZW5zdXJlICdxJywgdGV4dEM6IFwiY2FtZWxDYXNlID0+ICh3aXRoIHNwZWNpYWwpIENoYVJBY3RlclJzXFxuXFxuZGFzaC1jYXNlXFxuXFxuc25ha2V8X2Nhc2Vfd29yZFxcblwiXG4gICAgICBlbnN1cmUgJ3EnLCB0ZXh0QzogXCJjYW1lbENhc2UgPT4gKHdpdGggc3BlY2lhbCkgQ2hhUkFjdGVyUnNcXG5cXG5kYXNoLWNhc2VcXG5cXG5zbmFrZV9jYXNlfF93b3JkXFxuXCJcbiAgICAgIGVuc3VyZSAncScsIHRleHRDOiBcImNhbWVsQ2FzZSA9PiAod2l0aCBzcGVjaWFsKSBDaGFSQWN0ZXJSc1xcblxcbmRhc2gtY2FzZVxcblxcbnNuYWtlX2Nhc2Vfd29yfGRcXG5cIlxuICAgICAgZW5zdXJlICdRJywgdGV4dEM6IFwiY2FtZWxDYXNlID0+ICh3aXRoIHNwZWNpYWwpIENoYVJBY3RlclJzXFxuXFxuZGFzaC1jYXNlXFxuXFxuc25ha2VfY2FzZXxfd29yZFxcblwiXG4gICAgICBlbnN1cmUgJ1EnLCB0ZXh0QzogXCJjYW1lbENhc2UgPT4gKHdpdGggc3BlY2lhbCkgQ2hhUkFjdGVyUnNcXG5cXG5kYXNoLWNhc2VcXG5cXG5zbmFrZXxfY2FzZV93b3JkXFxuXCJcbiAgICAgIGVuc3VyZSAnUScsIHRleHRDOiBcImNhbWVsQ2FzZSA9PiAod2l0aCBzcGVjaWFsKSBDaGFSQWN0ZXJSc1xcblxcbmRhc2gtY2FzZVxcblxcbnxzbmFrZV9jYXNlX3dvcmRcXG5cIlxuICAgICAgZW5zdXJlICdRJywgdGV4dEM6IFwiY2FtZWxDYXNlID0+ICh3aXRoIHNwZWNpYWwpIENoYVJBY3RlclJzXFxuXFxuZGFzaC18Y2FzZVxcblxcbnNuYWtlX2Nhc2Vfd29yZFxcblwiXG4gICAgICBlbnN1cmUgJ1EnLCB0ZXh0QzogXCJjYW1lbENhc2UgPT4gKHdpdGggc3BlY2lhbCkgQ2hhUkFjdGVyUnNcXG5cXG5kYXNofC1jYXNlXFxuXFxuc25ha2VfY2FzZV93b3JkXFxuXCJcbiAgICAgIGVuc3VyZSAnUScsIHRleHRDOiBcImNhbWVsQ2FzZSA9PiAod2l0aCBzcGVjaWFsKSBDaGFSQWN0ZXJSc1xcblxcbnxkYXNoLWNhc2VcXG5cXG5zbmFrZV9jYXNlX3dvcmRcXG5cIlxuICAgICAgZW5zdXJlICdRJywgdGV4dEM6IFwiY2FtZWxDYXNlID0+ICh3aXRoIHNwZWNpYWwpIENoYVJBY3RlcnxSc1xcblxcbmRhc2gtY2FzZVxcblxcbnNuYWtlX2Nhc2Vfd29yZFxcblwiXG4gICAgICBlbnN1cmUgJ1EnLCB0ZXh0QzogXCJjYW1lbENhc2UgPT4gKHdpdGggc3BlY2lhbCkgQ2hhUnxBY3RlclJzXFxuXFxuZGFzaC1jYXNlXFxuXFxuc25ha2VfY2FzZV93b3JkXFxuXCJcbiAgICAgIGVuc3VyZSAnUScsIHRleHRDOiBcImNhbWVsQ2FzZSA9PiAod2l0aCBzcGVjaWFsKSBDaGF8UkFjdGVyUnNcXG5cXG5kYXNoLWNhc2VcXG5cXG5zbmFrZV9jYXNlX3dvcmRcXG5cIlxuICAgICAgZW5zdXJlICdRJywgdGV4dEM6IFwiY2FtZWxDYXNlID0+ICh3aXRoIHNwZWNpYWwpIHxDaGFSQWN0ZXJSc1xcblxcbmRhc2gtY2FzZVxcblxcbnNuYWtlX2Nhc2Vfd29yZFxcblwiXG4gICAgICBlbnN1cmUgJ1EnLCB0ZXh0QzogXCJjYW1lbENhc2UgPT4gKHdpdGggc3BlY2lhbHwpIENoYVJBY3RlclJzXFxuXFxuZGFzaC1jYXNlXFxuXFxuc25ha2VfY2FzZV93b3JkXFxuXCJcbiAgICAgIGVuc3VyZSAnUScsIHRleHRDOiBcImNhbWVsQ2FzZSA9PiAod2l0aCB8c3BlY2lhbCkgQ2hhUkFjdGVyUnNcXG5cXG5kYXNoLWNhc2VcXG5cXG5zbmFrZV9jYXNlX3dvcmRcXG5cIlxuICAgICAgZW5zdXJlICdRJywgdGV4dEM6IFwiY2FtZWxDYXNlID0+ICh8d2l0aCBzcGVjaWFsKSBDaGFSQWN0ZXJSc1xcblxcbmRhc2gtY2FzZVxcblxcbnNuYWtlX2Nhc2Vfd29yZFxcblwiXG4gICAgICBlbnN1cmUgJ1EnLCB0ZXh0QzogXCJjYW1lbENhc2UgPT58ICh3aXRoIHNwZWNpYWwpIENoYVJBY3RlclJzXFxuXFxuZGFzaC1jYXNlXFxuXFxuc25ha2VfY2FzZV93b3JkXFxuXCJcbiAgICAgIGVuc3VyZSAnUScsIHRleHRDOiBcImNhbWVsQ2FzZXwgPT4gKHdpdGggc3BlY2lhbCkgQ2hhUkFjdGVyUnNcXG5cXG5kYXNoLWNhc2VcXG5cXG5zbmFrZV9jYXNlX3dvcmRcXG5cIlxuICAgICAgZW5zdXJlICdRJywgdGV4dEM6IFwiY2FtZWx8Q2FzZSA9PiAod2l0aCBzcGVjaWFsKSBDaGFSQWN0ZXJSc1xcblxcbmRhc2gtY2FzZVxcblxcbnNuYWtlX2Nhc2Vfd29yZFxcblwiXG4gICAgICBlbnN1cmUgJ1EnLCB0ZXh0QzogXCJ8Y2FtZWxDYXNlID0+ICh3aXRoIHNwZWNpYWwpIENoYVJBY3RlclJzXFxuXFxuZGFzaC1jYXNlXFxuXFxuc25ha2VfY2FzZV93b3JkXFxuXCJcbiAgICBpdCBcIm1vdmUtdG8tZW5kLW9mLXN1YndvcmRcIiwgLT5cbiAgICAgIHNldCB0ZXh0QzogXCJ8Y2FtZWxDYXNlID0+ICh3aXRoIHNwZWNpYWwpIENoYVJBY3RlclJzXFxuXFxuZGFzaC1jYXNlXFxuXFxuc25ha2VfY2FzZV93b3JkXFxuXCJcbiAgICAgIGVuc3VyZSAnY3RybC1lJywgdGV4dEM6IFwiY2FtZXxsQ2FzZSA9PiAod2l0aCBzcGVjaWFsKSBDaGFSQWN0ZXJSc1xcblxcbmRhc2gtY2FzZVxcblxcbnNuYWtlX2Nhc2Vfd29yZFxcblwiXG4gICAgICBlbnN1cmUgJ2N0cmwtZScsIHRleHRDOiBcImNhbWVsQ2FzfGUgPT4gKHdpdGggc3BlY2lhbCkgQ2hhUkFjdGVyUnNcXG5cXG5kYXNoLWNhc2VcXG5cXG5zbmFrZV9jYXNlX3dvcmRcXG5cIlxuICAgICAgZW5zdXJlICdjdHJsLWUnLCB0ZXh0QzogXCJjYW1lbENhc2UgPXw+ICh3aXRoIHNwZWNpYWwpIENoYVJBY3RlclJzXFxuXFxuZGFzaC1jYXNlXFxuXFxuc25ha2VfY2FzZV93b3JkXFxuXCJcbiAgICAgIGVuc3VyZSAnY3RybC1lJywgdGV4dEM6IFwiY2FtZWxDYXNlID0+IHwod2l0aCBzcGVjaWFsKSBDaGFSQWN0ZXJSc1xcblxcbmRhc2gtY2FzZVxcblxcbnNuYWtlX2Nhc2Vfd29yZFxcblwiXG4gICAgICBlbnN1cmUgJ2N0cmwtZScsIHRleHRDOiBcImNhbWVsQ2FzZSA9PiAod2l0fGggc3BlY2lhbCkgQ2hhUkFjdGVyUnNcXG5cXG5kYXNoLWNhc2VcXG5cXG5zbmFrZV9jYXNlX3dvcmRcXG5cIlxuICAgICAgZW5zdXJlICdjdHJsLWUnLCB0ZXh0QzogXCJjYW1lbENhc2UgPT4gKHdpdGggc3BlY2lhfGwpIENoYVJBY3RlclJzXFxuXFxuZGFzaC1jYXNlXFxuXFxuc25ha2VfY2FzZV93b3JkXFxuXCJcbiAgICAgIGVuc3VyZSAnY3RybC1lJywgdGV4dEM6IFwiY2FtZWxDYXNlID0+ICh3aXRoIHNwZWNpYWx8KSBDaGFSQWN0ZXJSc1xcblxcbmRhc2gtY2FzZVxcblxcbnNuYWtlX2Nhc2Vfd29yZFxcblwiXG4gICAgICBlbnN1cmUgJ2N0cmwtZScsIHRleHRDOiBcImNhbWVsQ2FzZSA9PiAod2l0aCBzcGVjaWFsKSBDaHxhUkFjdGVyUnNcXG5cXG5kYXNoLWNhc2VcXG5cXG5zbmFrZV9jYXNlX3dvcmRcXG5cIlxuICAgICAgZW5zdXJlICdjdHJsLWUnLCB0ZXh0QzogXCJjYW1lbENhc2UgPT4gKHdpdGggc3BlY2lhbCkgQ2hhfFJBY3RlclJzXFxuXFxuZGFzaC1jYXNlXFxuXFxuc25ha2VfY2FzZV93b3JkXFxuXCJcbiAgICAgIGVuc3VyZSAnY3RybC1lJywgdGV4dEM6IFwiY2FtZWxDYXNlID0+ICh3aXRoIHNwZWNpYWwpIENoYVJBY3RlfHJSc1xcblxcbmRhc2gtY2FzZVxcblxcbnNuYWtlX2Nhc2Vfd29yZFxcblwiXG4gICAgICBlbnN1cmUgJ2N0cmwtZScsIHRleHRDOiBcImNhbWVsQ2FzZSA9PiAod2l0aCBzcGVjaWFsKSBDaGFSQWN0ZXJSfHNcXG5cXG5kYXNoLWNhc2VcXG5cXG5zbmFrZV9jYXNlX3dvcmRcXG5cIlxuICAgICAgZW5zdXJlICdjdHJsLWUnLCB0ZXh0QzogXCJjYW1lbENhc2UgPT4gKHdpdGggc3BlY2lhbCkgQ2hhUkFjdGVyUnNcXG5cXG5kYXN8aC1jYXNlXFxuXFxuc25ha2VfY2FzZV93b3JkXFxuXCJcbiAgICAgIGVuc3VyZSAnY3RybC1lJywgdGV4dEM6IFwiY2FtZWxDYXNlID0+ICh3aXRoIHNwZWNpYWwpIENoYVJBY3RlclJzXFxuXFxuZGFzaHwtY2FzZVxcblxcbnNuYWtlX2Nhc2Vfd29yZFxcblwiXG4gICAgICBlbnN1cmUgJ2N0cmwtZScsIHRleHRDOiBcImNhbWVsQ2FzZSA9PiAod2l0aCBzcGVjaWFsKSBDaGFSQWN0ZXJSc1xcblxcbmRhc2gtY2FzfGVcXG5cXG5zbmFrZV9jYXNlX3dvcmRcXG5cIlxuICAgICAgZW5zdXJlICdjdHJsLWUnLCB0ZXh0QzogXCJjYW1lbENhc2UgPT4gKHdpdGggc3BlY2lhbCkgQ2hhUkFjdGVyUnNcXG5cXG5kYXNoLWNhc2VcXG5cXG5zbmFrfGVfY2FzZV93b3JkXFxuXCJcbiAgICAgIGVuc3VyZSAnY3RybC1lJywgdGV4dEM6IFwiY2FtZWxDYXNlID0+ICh3aXRoIHNwZWNpYWwpIENoYVJBY3RlclJzXFxuXFxuZGFzaC1jYXNlXFxuXFxuc25ha2VfY2FzfGVfd29yZFxcblwiXG4gICAgICBlbnN1cmUgJ2N0cmwtZScsIHRleHRDOiBcImNhbWVsQ2FzZSA9PiAod2l0aCBzcGVjaWFsKSBDaGFSQWN0ZXJSc1xcblxcbmRhc2gtY2FzZVxcblxcbnNuYWtlX2Nhc2Vfd29yfGRcXG5cIlxuIl19
