(function() {
  var TextData, dispatch, getVimState, ref, settings,
    slice = [].slice;

  ref = require('./spec-helper'), getVimState = ref.getVimState, dispatch = ref.dispatch, TextData = ref.TextData;

  settings = require('../lib/settings');

  describe("Operator general", function() {
    var editor, editorElement, ensure, ensureByDispatch, keystroke, ref1, set, vimState;
    ref1 = [], set = ref1[0], ensure = ref1[1], ensureByDispatch = ref1[2], keystroke = ref1[3], editor = ref1[4], editorElement = ref1[5], vimState = ref1[6];
    beforeEach(function() {
      return getVimState(function(state, vim) {
        vimState = state;
        editor = vimState.editor, editorElement = vimState.editorElement;
        return set = vim.set, ensure = vim.ensure, ensureByDispatch = vim.ensureByDispatch, keystroke = vim.keystroke, vim;
      });
    });
    describe("cancelling operations", function() {
      return it("clear pending operation", function() {
        keystroke('/');
        expect(vimState.operationStack.isEmpty()).toBe(false);
        vimState.searchInput.cancel();
        expect(vimState.operationStack.isEmpty()).toBe(true);
        return expect(function() {
          return vimState.searchInput.cancel();
        }).not.toThrow();
      });
    });
    describe("the x keybinding", function() {
      describe("on a line with content", function() {
        describe("without vim-mode-plus.wrapLeftRightMotion", function() {
          beforeEach(function() {
            return set({
              text: "abc\n012345\n\nxyz",
              cursor: [1, 4]
            });
          });
          it("deletes a character", function() {
            ensure('x', {
              text: 'abc\n01235\n\nxyz',
              cursor: [1, 4],
              register: {
                '"': {
                  text: '4'
                }
              }
            });
            ensure('x', {
              text: 'abc\n0123\n\nxyz',
              cursor: [1, 3],
              register: {
                '"': {
                  text: '5'
                }
              }
            });
            ensure('x', {
              text: 'abc\n012\n\nxyz',
              cursor: [1, 2],
              register: {
                '"': {
                  text: '3'
                }
              }
            });
            ensure('x', {
              text: 'abc\n01\n\nxyz',
              cursor: [1, 1],
              register: {
                '"': {
                  text: '2'
                }
              }
            });
            ensure('x', {
              text: 'abc\n0\n\nxyz',
              cursor: [1, 0],
              register: {
                '"': {
                  text: '1'
                }
              }
            });
            return ensure('x', {
              text: 'abc\n\n\nxyz',
              cursor: [1, 0],
              register: {
                '"': {
                  text: '0'
                }
              }
            });
          });
          return it("deletes multiple characters with a count", function() {
            ensure('2 x', {
              text: 'abc\n0123\n\nxyz',
              cursor: [1, 3],
              register: {
                '"': {
                  text: '45'
                }
              }
            });
            set({
              cursor: [0, 1]
            });
            return ensure('3 x', {
              text: 'a\n0123\n\nxyz',
              cursor: [0, 0],
              register: {
                '"': {
                  text: 'bc'
                }
              }
            });
          });
        });
        describe("with multiple cursors", function() {
          beforeEach(function() {
            return set({
              text: "abc\n012345\n\nxyz",
              cursor: [[1, 4], [0, 1]]
            });
          });
          return it("is undone as one operation", function() {
            ensure('x', {
              text: "ac\n01235\n\nxyz"
            });
            return ensure('u', {
              text: 'abc\n012345\n\nxyz'
            });
          });
        });
        return describe("with vim-mode-plus.wrapLeftRightMotion", function() {
          beforeEach(function() {
            set({
              text: 'abc\n012345\n\nxyz',
              cursor: [1, 4]
            });
            return settings.set('wrapLeftRightMotion', true);
          });
          it("deletes a character", function() {
            ensure('x', {
              text: 'abc\n01235\n\nxyz',
              cursor: [1, 4],
              register: {
                '"': {
                  text: '4'
                }
              }
            });
            ensure('x', {
              text: 'abc\n0123\n\nxyz',
              cursor: [1, 3],
              register: {
                '"': {
                  text: '5'
                }
              }
            });
            ensure('x', {
              text: 'abc\n012\n\nxyz',
              cursor: [1, 2],
              register: {
                '"': {
                  text: '3'
                }
              }
            });
            ensure('x', {
              text: 'abc\n01\n\nxyz',
              cursor: [1, 1],
              register: {
                '"': {
                  text: '2'
                }
              }
            });
            ensure('x', {
              text: 'abc\n0\n\nxyz',
              cursor: [1, 0],
              register: {
                '"': {
                  text: '1'
                }
              }
            });
            return ensure('x', {
              text: 'abc\n\n\nxyz',
              cursor: [1, 0],
              register: {
                '"': {
                  text: '0'
                }
              }
            });
          });
          return it("deletes multiple characters and newlines with a count", function() {
            settings.set('wrapLeftRightMotion', true);
            ensure('2 x', {
              text: 'abc\n0123\n\nxyz',
              cursor: [1, 3],
              register: {
                '"': {
                  text: '45'
                }
              }
            });
            set({
              cursor: [0, 1]
            });
            ensure('3 x', {
              text: 'a0123\n\nxyz',
              cursor: [0, 1],
              register: {
                '"': {
                  text: 'bc\n'
                }
              }
            });
            return ensure('7 x', {
              text: 'ayz',
              cursor: [0, 1],
              register: {
                '"': {
                  text: '0123\n\nx'
                }
              }
            });
          });
        });
      });
      return describe("on an empty line", function() {
        beforeEach(function() {
          return set({
            text: "abc\n012345\n\nxyz",
            cursor: [2, 0]
          });
        });
        it("deletes nothing on an empty line when vim-mode-plus.wrapLeftRightMotion is false", function() {
          settings.set('wrapLeftRightMotion', false);
          return ensure('x', {
            text: "abc\n012345\n\nxyz",
            cursor: [2, 0]
          });
        });
        return it("deletes an empty line when vim-mode-plus.wrapLeftRightMotion is true", function() {
          settings.set('wrapLeftRightMotion', true);
          return ensure('x', {
            text: "abc\n012345\nxyz",
            cursor: [2, 0]
          });
        });
      });
    });
    describe("the X keybinding", function() {
      describe("on a line with content", function() {
        beforeEach(function() {
          return set({
            text: "ab\n012345",
            cursor: [1, 2]
          });
        });
        return it("deletes a character", function() {
          ensure('X', {
            text: 'ab\n02345',
            cursor: [1, 1],
            register: {
              '"': {
                text: '1'
              }
            }
          });
          ensure('X', {
            text: 'ab\n2345',
            cursor: [1, 0],
            register: {
              '"': {
                text: '0'
              }
            }
          });
          ensure('X', {
            text: 'ab\n2345',
            cursor: [1, 0],
            register: {
              '"': {
                text: '0'
              }
            }
          });
          settings.set('wrapLeftRightMotion', true);
          return ensure('X', {
            text: 'ab2345',
            cursor: [0, 2],
            register: {
              '"': {
                text: '\n'
              }
            }
          });
        });
      });
      return describe("on an empty line", function() {
        beforeEach(function() {
          return set({
            text: "012345\n\nabcdef",
            cursor: [1, 0]
          });
        });
        it("deletes nothing when vim-mode-plus.wrapLeftRightMotion is false", function() {
          settings.set('wrapLeftRightMotion', false);
          return ensure('X', {
            text: "012345\n\nabcdef",
            cursor: [1, 0]
          });
        });
        return it("deletes the newline when wrapLeftRightMotion is true", function() {
          settings.set('wrapLeftRightMotion', true);
          return ensure('X', {
            text: "012345\nabcdef",
            cursor: [0, 5]
          });
        });
      });
    });
    describe("the d keybinding", function() {
      beforeEach(function() {
        return set({
          text: "12345\nabcde\n\nABCDE\n",
          cursor: [1, 1]
        });
      });
      it("enters operator-pending mode", function() {
        return ensure('d', {
          mode: 'operator-pending'
        });
      });
      describe("when followed by a d", function() {
        it("deletes the current line and exits operator-pending mode", function() {
          set({
            cursor: [1, 1]
          });
          return ensure('d d', {
            text: "12345\n\nABCDE\n",
            cursor: [1, 0],
            register: {
              '"': {
                text: "abcde\n"
              }
            },
            mode: 'normal'
          });
        });
        it("deletes the last line and always make non-blank-line last line", function() {
          set({
            cursor: [2, 0]
          });
          return ensure('2 d d', {
            text: "12345\nabcde\n",
            cursor: [1, 0]
          });
        });
        return it("leaves the cursor on the first nonblank character", function() {
          set({
            textC: "1234|5\n  abcde\n"
          });
          return ensure('d d', {
            textC: "  |abcde\n"
          });
        });
      });
      describe("undo behavior", function() {
        var initialTextC, originalText, ref2;
        ref2 = [], originalText = ref2[0], initialTextC = ref2[1];
        beforeEach(function() {
          initialTextC = "12345\na|bcde\nABCDE\nQWERT";
          set({
            textC: initialTextC
          });
          return originalText = editor.getText();
        });
        it("undoes both lines", function() {
          ensure('d 2 d', {
            textC: "12345\n|QWERT"
          });
          return ensure('u', {
            textC: initialTextC,
            selectedText: ""
          });
        });
        return describe("with multiple cursors", function() {
          describe("setCursorToStartOfChangeOnUndoRedo is true(default)", function() {
            it("clear multiple cursors and set cursor to start of changes of last cursor", function() {
              set({
                text: originalText,
                cursor: [[0, 0], [1, 1]]
              });
              ensure('d l', {
                textC: "|2345\na|cde\nABCDE\nQWERT"
              });
              ensure('u', {
                textC: "12345\na|bcde\nABCDE\nQWERT",
                selectedText: ''
              });
              return ensure('ctrl-r', {
                textC: "2345\na|cde\nABCDE\nQWERT",
                selectedText: ''
              });
            });
            return it("clear multiple cursors and set cursor to start of changes of last cursor", function() {
              set({
                text: originalText,
                cursor: [[1, 1], [0, 0]]
              });
              ensure('d l', {
                text: "2345\nacde\nABCDE\nQWERT",
                cursor: [[1, 1], [0, 0]]
              });
              ensure('u', {
                textC: "|12345\nabcde\nABCDE\nQWERT",
                selectedText: ''
              });
              return ensure('ctrl-r', {
                textC: "|2345\nacde\nABCDE\nQWERT",
                selectedText: ''
              });
            });
          });
          return describe("setCursorToStartOfChangeOnUndoRedo is false", function() {
            initialTextC = null;
            beforeEach(function() {
              initialTextC = "|12345\na|bcde\nABCDE\nQWERT";
              settings.set('setCursorToStartOfChangeOnUndoRedo', false);
              set({
                textC: initialTextC
              });
              return ensure('d l', {
                textC: "|2345\na|cde\nABCDE\nQWERT"
              });
            });
            return it("put cursor to end of change (works in same way of atom's core:undo)", function() {
              return ensure('u', {
                textC: initialTextC,
                selectedText: ['', '']
              });
            });
          });
        });
      });
      describe("when followed by a w", function() {
        it("deletes the next word until the end of the line and exits operator-pending mode", function() {
          set({
            text: 'abcd efg\nabc',
            cursor: [0, 5]
          });
          return ensure('d w', {
            text: "abcd \nabc",
            cursor: [0, 4],
            mode: 'normal'
          });
        });
        return it("deletes to the beginning of the next word", function() {
          set({
            text: 'abcd efg',
            cursor: [0, 2]
          });
          ensure('d w', {
            text: 'abefg',
            cursor: [0, 2]
          });
          set({
            text: 'one two three four',
            cursor: [0, 0]
          });
          return ensure('d 3 w', {
            text: 'four',
            cursor: [0, 0]
          });
        });
      });
      describe("when followed by an iw", function() {
        return it("deletes the containing word", function() {
          set({
            text: "12345 abcde ABCDE",
            cursor: [0, 9]
          });
          ensure('d', {
            mode: 'operator-pending'
          });
          return ensure('i w', {
            text: "12345  ABCDE",
            cursor: [0, 6],
            register: {
              '"': {
                text: 'abcde'
              }
            },
            mode: 'normal'
          });
        });
      });
      describe("when followed by a j", function() {
        var originalText;
        originalText = "12345\nabcde\nABCDE\n";
        beforeEach(function() {
          return set({
            text: originalText
          });
        });
        describe("on the beginning of the file", function() {
          return it("deletes the next two lines", function() {
            set({
              cursor: [0, 0]
            });
            return ensure('d j', {
              text: 'ABCDE\n'
            });
          });
        });
        describe("on the middle of second line", function() {
          return it("deletes the last two lines", function() {
            set({
              cursor: [1, 2]
            });
            return ensure('d j', {
              text: '12345\n'
            });
          });
        });
        return describe("when cursor is on blank line", function() {
          beforeEach(function() {
            return set({
              text: "a\n\n\nb\n",
              cursor: [1, 0]
            });
          });
          return it("deletes both lines", function() {
            return ensure('d j', {
              text: "a\nb\n",
              cursor: [1, 0]
            });
          });
        });
      });
      describe("when followed by an k", function() {
        var originalText;
        originalText = "12345\nabcde\nABCDE";
        beforeEach(function() {
          return set({
            text: originalText
          });
        });
        describe("on the end of the file", function() {
          return it("deletes the bottom two lines", function() {
            set({
              cursor: [2, 4]
            });
            return ensure('d k', {
              text: '12345\n'
            });
          });
        });
        describe("on the beginning of the file", function() {
          return xit("deletes nothing", function() {
            set({
              cursor: [0, 0]
            });
            return ensure('d k', {
              text: originalText
            });
          });
        });
        describe("when on the middle of second line", function() {
          return it("deletes the first two lines", function() {
            set({
              cursor: [1, 2]
            });
            return ensure('d k', {
              text: 'ABCDE'
            });
          });
        });
        return describe("when cursor is on blank line", function() {
          beforeEach(function() {
            return set({
              text: "a\n\n\nb\n",
              cursor: [2, 0]
            });
          });
          return it("deletes both lines", function() {
            return ensure('d k', {
              text: "a\nb\n",
              cursor: [1, 0]
            });
          });
        });
      });
      describe("when followed by a G", function() {
        beforeEach(function() {
          var originalText;
          originalText = "12345\nabcde\nABCDE";
          return set({
            text: originalText
          });
        });
        describe("on the beginning of the second line", function() {
          return it("deletes the bottom two lines", function() {
            set({
              cursor: [1, 0]
            });
            return ensure('d G', {
              text: '12345\n'
            });
          });
        });
        return describe("on the middle of the second line", function() {
          return it("deletes the bottom two lines", function() {
            set({
              cursor: [1, 2]
            });
            return ensure('d G', {
              text: '12345\n'
            });
          });
        });
      });
      describe("when followed by a goto line G", function() {
        beforeEach(function() {
          var originalText;
          originalText = "12345\nabcde\nABCDE";
          return set({
            text: originalText
          });
        });
        describe("on the beginning of the second line", function() {
          return it("deletes the bottom two lines", function() {
            set({
              cursor: [1, 0]
            });
            return ensure('d 2 G', {
              text: '12345\nABCDE'
            });
          });
        });
        return describe("on the middle of the second line", function() {
          return it("deletes the bottom two lines", function() {
            set({
              cursor: [1, 2]
            });
            return ensure('d 2 G', {
              text: '12345\nABCDE'
            });
          });
        });
      });
      describe("when followed by a t)", function() {
        return describe("with the entire line yanked before", function() {
          beforeEach(function() {
            return set({
              text: "test (xyz)",
              cursor: [0, 6]
            });
          });
          return it("deletes until the closing parenthesis", function() {
            return ensure('d t )', {
              text: 'test ()',
              cursor: [0, 6]
            });
          });
        });
      });
      describe("with multiple cursors", function() {
        it("deletes each selection", function() {
          set({
            text: "abcd\n1234\nABCD\n",
            cursor: [[0, 1], [1, 2], [2, 3]]
          });
          return ensure('d e', {
            text: "a\n12\nABC",
            cursor: [[0, 0], [1, 1], [2, 2]]
          });
        });
        return it("doesn't delete empty selections", function() {
          set({
            text: "abcd\nabc\nabd",
            cursor: [[0, 0], [1, 0], [2, 0]]
          });
          return ensure('d t d', {
            text: "d\nabc\nd",
            cursor: [[0, 0], [1, 0], [2, 0]]
          });
        });
      });
      return describe("stayOnDelete setting", function() {
        beforeEach(function() {
          settings.set('stayOnDelete', true);
          return set({
            text_: "___3333\n__2222\n_1111\n__2222\n___3333\n",
            cursor: [0, 3]
          });
        });
        describe("target range is linewise range", function() {
          it("keep original column after delete", function() {
            ensure("d d", {
              cursor: [0, 3],
              text_: "__2222\n_1111\n__2222\n___3333\n"
            });
            ensure(".", {
              cursor: [0, 3],
              text_: "_1111\n__2222\n___3333\n"
            });
            ensure(".", {
              cursor: [0, 3],
              text_: "__2222\n___3333\n"
            });
            return ensure(".", {
              cursor: [0, 3],
              text_: "___3333\n"
            });
          });
          return it("v_D also keep original column after delete", function() {
            return ensure("v 2 j D", {
              cursor: [0, 3],
              text_: "__2222\n___3333\n"
            });
          });
        });
        return describe("target range is text object", function() {
          describe("target is indent", function() {
            var indentText, textData;
            indentText = "0000000000000000\n  22222222222222\n  22222222222222\n  22222222222222\n0000000000000000\n";
            textData = new TextData(indentText);
            beforeEach(function() {
              return set({
                text: textData.getRaw()
              });
            });
            it("[from top] keep column", function() {
              set({
                cursor: [1, 10]
              });
              return ensure('d i i', {
                cursor: [1, 10],
                text: textData.getLines([0, 4])
              });
            });
            it("[from middle] keep column", function() {
              set({
                cursor: [2, 10]
              });
              return ensure('d i i', {
                cursor: [1, 10],
                text: textData.getLines([0, 4])
              });
            });
            return it("[from bottom] keep column", function() {
              set({
                cursor: [3, 10]
              });
              return ensure('d i i', {
                cursor: [1, 10],
                text: textData.getLines([0, 4])
              });
            });
          });
          return describe("target is paragraph", function() {
            var B1, B2, B3, P1, P2, P3, paragraphText, textData;
            paragraphText = "p1---------------\np1---------------\np1---------------\n\np2---------------\np2---------------\np2---------------\n\np3---------------\np3---------------\np3---------------\n";
            textData = new TextData(paragraphText);
            P1 = [0, 1, 2];
            B1 = 3;
            P2 = [4, 5, 6];
            B2 = 7;
            P3 = [8, 9, 10];
            B3 = 11;
            beforeEach(function() {
              return set({
                text: textData.getRaw()
              });
            });
            it("set cursor to start of deletion after delete [from bottom of paragraph]", function() {
              var i, results;
              set({
                cursor: [0, 0]
              });
              ensure('d i p', {
                cursor: [0, 0],
                text: textData.getLines((function() {
                  results = [];
                  for (var i = B1; B1 <= B3 ? i <= B3 : i >= B3; B1 <= B3 ? i++ : i--){ results.push(i); }
                  return results;
                }).apply(this), {
                  chomp: true
                })
              });
              ensure('j .', {
                cursor: [1, 0],
                text: textData.getLines([B1, B2].concat(slice.call(P3), [B3]), {
                  chomp: true
                })
              });
              return ensure('j .', {
                cursor: [1, 0],
                text: textData.getLines([B1, B2, B3], {
                  chomp: true
                })
              });
            });
            it("set cursor to start of deletion after delete [from middle of paragraph]", function() {
              var i, results;
              set({
                cursor: [1, 0]
              });
              ensure('d i p', {
                cursor: [0, 0],
                text: textData.getLines((function() {
                  results = [];
                  for (var i = B1; B1 <= B3 ? i <= B3 : i >= B3; B1 <= B3 ? i++ : i--){ results.push(i); }
                  return results;
                }).apply(this), {
                  chomp: true
                })
              });
              ensure('2 j .', {
                cursor: [1, 0],
                text: textData.getLines([B1, B2].concat(slice.call(P3), [B3]), {
                  chomp: true
                })
              });
              return ensure('2 j .', {
                cursor: [1, 0],
                text: textData.getLines([B1, B2, B3], {
                  chomp: true
                })
              });
            });
            return it("set cursor to start of deletion after delete [from bottom of paragraph]", function() {
              var i, results;
              set({
                cursor: [1, 0]
              });
              ensure('d i p', {
                cursor: [0, 0],
                text: textData.getLines((function() {
                  results = [];
                  for (var i = B1; B1 <= B3 ? i <= B3 : i >= B3; B1 <= B3 ? i++ : i--){ results.push(i); }
                  return results;
                }).apply(this), {
                  chomp: true
                })
              });
              ensure('3 j .', {
                cursor: [1, 0],
                text: textData.getLines([B1, B2].concat(slice.call(P3), [B3]), {
                  chomp: true
                })
              });
              return ensure('3 j .', {
                cursor: [1, 0],
                text: textData.getLines([B1, B2, B3], {
                  chomp: true
                })
              });
            });
          });
        });
      });
    });
    describe("the D keybinding", function() {
      beforeEach(function() {
        return set({
          text: "0000\n1111\n2222\n3333",
          cursor: [0, 1]
        });
      });
      it("deletes the contents until the end of the line", function() {
        return ensure('D', {
          text: "0\n1111\n2222\n3333"
        });
      });
      return it("in visual-mode, it delete whole line", function() {
        ensure('v D', {
          text: "1111\n2222\n3333"
        });
        return ensure("v j D", {
          text: "3333"
        });
      });
    });
    describe("the y keybinding", function() {
      beforeEach(function() {
        return set({
          textC: "012 |345\nabc\n"
        });
      });
      describe("when useClipboardAsDefaultRegister enabled", function() {
        beforeEach(function() {
          settings.set('useClipboardAsDefaultRegister', true);
          atom.clipboard.write('___________');
          return ensure({
            register: {
              '"': {
                text: '___________'
              }
            }
          });
        });
        return describe("read/write to clipboard through register", function() {
          return it("writes to clipboard with default register", function() {
            var savedText;
            savedText = '012 345\n';
            ensure('y y', {
              register: {
                '"': {
                  text: savedText
                }
              }
            });
            return expect(atom.clipboard.read()).toBe(savedText);
          });
        });
      });
      describe("visual-mode.linewise", function() {
        beforeEach(function() {
          return set({
            textC: "0000|00\n111111\n222222\n"
          });
        });
        describe("selection not reversed", function() {
          return it("saves to register(type=linewise), cursor move to start of target", function() {
            return ensure("V j y", {
              cursor: [0, 0],
              register: {
                '"': {
                  text: "000000\n111111\n",
                  type: 'linewise'
                }
              }
            });
          });
        });
        return describe("selection is reversed", function() {
          return it("saves to register(type=linewise), cursor doesn't move", function() {
            set({
              cursor: [2, 2]
            });
            return ensure("V k y", {
              cursor: [1, 2],
              register: {
                '"': {
                  text: "111111\n222222\n",
                  type: 'linewise'
                }
              }
            });
          });
        });
      });
      describe("visual-mode.blockwise", function() {
        beforeEach(function() {
          set({
            textC_: "000000\n1!11111\n222222\n333333\n4|44444\n555555\n"
          });
          return ensure("ctrl-v l l j", {
            selectedTextOrdered: ["111", "222", "444", "555"],
            mode: ['visual', 'blockwise']
          });
        });
        describe("when stayOnYank = false", function() {
          return it("place cursor at start of block after yank", function() {
            return ensure("y", {
              mode: 'normal',
              textC_: "000000\n1!11111\n222222\n333333\n4|44444\n555555\n"
            });
          });
        });
        return describe("when stayOnYank = true", function() {
          beforeEach(function() {
            return settings.set('stayOnYank', true);
          });
          return it("place cursor at head of block after yank", function() {
            return ensure("y", {
              mode: 'normal',
              textC_: "000000\n111111\n222!222\n333333\n444444\n555|555\n"
            });
          });
        });
      });
      describe("y y", function() {
        it("saves to register(type=linewise), cursor stay at same position", function() {
          return ensure('y y', {
            cursor: [0, 4],
            register: {
              '"': {
                text: "012 345\n",
                type: 'linewise'
              }
            }
          });
        });
        it("[N y y] yank N line, starting from the current", function() {
          return ensure('y 2 y', {
            cursor: [0, 4],
            register: {
              '"': {
                text: "012 345\nabc\n"
              }
            }
          });
        });
        return it("[y N y] yank N line, starting from the current", function() {
          return ensure('2 y y', {
            cursor: [0, 4],
            register: {
              '"': {
                text: "012 345\nabc\n"
              }
            }
          });
        });
      });
      describe("with a register", function() {
        return it("saves the line to the a register", function() {
          return ensure('" a y y', {
            register: {
              a: {
                text: "012 345\n"
              }
            }
          });
        });
      });
      describe("with A register", function() {
        return it("append to existing value of lowercase-named register", function() {
          ensure('" a y y', {
            register: {
              a: {
                text: "012 345\n"
              }
            }
          });
          return ensure('" A y y', {
            register: {
              a: {
                text: "012 345\n012 345\n"
              }
            }
          });
        });
      });
      describe("with a motion", function() {
        beforeEach(function() {
          return settings.set('useClipboardAsDefaultRegister', false);
        });
        it("yank from here to destnation of motion", function() {
          return ensure('y e', {
            cursor: [0, 4],
            register: {
              '"': {
                text: '345'
              }
            }
          });
        });
        it("does not yank when motion failed", function() {
          return ensure('y t x', {
            register: {
              '"': {
                text: void 0
              }
            }
          });
        });
        it("yank and move cursor to start of target", function() {
          return ensure('y h', {
            cursor: [0, 3],
            register: {
              '"': {
                text: ' '
              }
            }
          });
        });
        return it("[with linewise motion] yank and desn't move cursor", function() {
          return ensure('y j', {
            cursor: [0, 4],
            register: {
              '"': {
                text: "012 345\nabc\n",
                type: 'linewise'
              }
            }
          });
        });
      });
      describe("with a text-obj", function() {
        beforeEach(function() {
          return set({
            cursor: [2, 8],
            text: "\n1st paragraph\n1st paragraph\n\n2n paragraph\n2n paragraph\n"
          });
        });
        it("inner-word and move cursor to start of target", function() {
          return ensure('y i w', {
            register: {
              '"': {
                text: "paragraph"
              }
            },
            cursor: [2, 4]
          });
        });
        return it("yank text-object inner-paragraph and move cursor to start of target", function() {
          return ensure('y i p', {
            cursor: [1, 0],
            register: {
              '"': {
                text: "1st paragraph\n1st paragraph\n"
              }
            }
          });
        });
      });
      describe("when followed by a G", function() {
        beforeEach(function() {
          var originalText;
          originalText = "12345\nabcde\nABCDE\n";
          return set({
            text: originalText
          });
        });
        it("yank and doesn't move cursor", function() {
          set({
            cursor: [1, 0]
          });
          return ensure('y G', {
            register: {
              '"': {
                text: "abcde\nABCDE\n",
                type: 'linewise'
              }
            },
            cursor: [1, 0]
          });
        });
        return it("yank and doesn't move cursor", function() {
          set({
            cursor: [1, 2]
          });
          return ensure('y G', {
            register: {
              '"': {
                text: "abcde\nABCDE\n",
                type: 'linewise'
              }
            },
            cursor: [1, 2]
          });
        });
      });
      describe("when followed by a goto line G", function() {
        beforeEach(function() {
          var originalText;
          originalText = "12345\nabcde\nABCDE";
          return set({
            text: originalText
          });
        });
        describe("on the beginning of the second line", function() {
          return it("deletes the bottom two lines", function() {
            set({
              cursor: [1, 0]
            });
            return ensure('y 2 G P', {
              text: '12345\nabcde\nabcde\nABCDE'
            });
          });
        });
        return describe("on the middle of the second line", function() {
          return it("deletes the bottom two lines", function() {
            set({
              cursor: [1, 2]
            });
            return ensure('y 2 G P', {
              text: '12345\nabcde\nabcde\nABCDE'
            });
          });
        });
      });
      describe("with multiple cursors", function() {
        return it("moves each cursor and copies the last selection's text", function() {
          set({
            text: "  abcd\n  1234",
            cursor: [[0, 0], [1, 5]]
          });
          return ensure('y ^', {
            register: {
              '"': {
                text: '123'
              }
            },
            cursor: [[0, 0], [1, 2]]
          });
        });
      });
      return describe("stayOnYank setting", function() {
        var text;
        text = null;
        beforeEach(function() {
          settings.set('stayOnYank', true);
          text = new TextData("0_234567\n1_234567\n2_234567\n\n4_234567\n");
          return set({
            text: text.getRaw(),
            cursor: [1, 2]
          });
        });
        it("don't move cursor after yank from normal-mode", function() {
          ensure("y i p", {
            cursor: [1, 2],
            register: {
              '"': {
                text: text.getLines([0, 1, 2])
              }
            }
          });
          ensure("j y y", {
            cursor: [2, 2],
            register: {
              '"': {
                text: text.getLines([2])
              }
            }
          });
          ensure("k .", {
            cursor: [1, 2],
            register: {
              '"': {
                text: text.getLines([1])
              }
            }
          });
          ensure("y h", {
            cursor: [1, 2],
            register: {
              '"': {
                text: "_"
              }
            }
          });
          return ensure("y b", {
            cursor: [1, 2],
            register: {
              '"': {
                text: "1_"
              }
            }
          });
        });
        it("don't move cursor after yank from visual-linewise", function() {
          ensure("V y", {
            cursor: [1, 2],
            register: {
              '"': {
                text: text.getLines([1])
              }
            }
          });
          return ensure("V j y", {
            cursor: [2, 2],
            register: {
              '"': {
                text: text.getLines([1, 2])
              }
            }
          });
        });
        return it("don't move cursor after yank from visual-characterwise", function() {
          ensure("v l l y", {
            cursor: [1, 4],
            register: {
              '"': {
                text: "234"
              }
            }
          });
          ensure("v h h y", {
            cursor: [1, 2],
            register: {
              '"': {
                text: "234"
              }
            }
          });
          ensure("v j y", {
            cursor: [2, 2],
            register: {
              '"': {
                text: "234567\n2_2"
              }
            }
          });
          return ensure("v 2 k y", {
            cursor: [0, 2],
            register: {
              '"': {
                text: "234567\n1_234567\n2_2"
              }
            }
          });
        });
      });
    });
    describe("the yy keybinding", function() {
      describe("on a single line file", function() {
        beforeEach(function() {
          return set({
            text: "exclamation!\n",
            cursor: [0, 0]
          });
        });
        return it("copies the entire line and pastes it correctly", function() {
          return ensure('y y p', {
            register: {
              '"': {
                text: "exclamation!\n"
              }
            },
            text: "exclamation!\nexclamation!\n"
          });
        });
      });
      return describe("on a single line file with no newline", function() {
        beforeEach(function() {
          return set({
            text: "no newline!",
            cursor: [0, 0]
          });
        });
        it("copies the entire line and pastes it correctly", function() {
          return ensure('y y p', {
            register: {
              '"': {
                text: "no newline!\n"
              }
            },
            text: "no newline!\nno newline!\n"
          });
        });
        return it("copies the entire line and pastes it respecting count and new lines", function() {
          return ensure('y y 2 p', {
            register: {
              '"': {
                text: "no newline!\n"
              }
            },
            text: "no newline!\nno newline!\nno newline!\n"
          });
        });
      });
    });
    describe("the Y keybinding", function() {
      var text;
      text = null;
      beforeEach(function() {
        text = "012 345\nabc\n";
        return set({
          text: text,
          cursor: [0, 4]
        });
      });
      it("saves the line to the default register", function() {
        return ensure('Y', {
          cursor: [0, 4],
          register: {
            '"': {
              text: "012 345\n"
            }
          }
        });
      });
      return it("yank the whole lines to the default register", function() {
        return ensure('v j Y', {
          cursor: [0, 0],
          register: {
            '"': {
              text: text
            }
          }
        });
      });
    });
    describe("the p keybinding", function() {
      describe("with single line character contents", function() {
        beforeEach(function() {
          settings.set('useClipboardAsDefaultRegister', false);
          set({
            textC: "|012\n"
          });
          set({
            register: {
              '"': {
                text: '345'
              }
            }
          });
          set({
            register: {
              'a': {
                text: 'a'
              }
            }
          });
          return atom.clipboard.write("clip");
        });
        describe("from the default register", function() {
          return it("inserts the contents", function() {
            return ensure("p", {
              textC: "034|512\n"
            });
          });
        });
        describe("at the end of a line", function() {
          beforeEach(function() {
            return set({
              textC: "01|2\n"
            });
          });
          return it("positions cursor correctly", function() {
            return ensure("p", {
              textC: "01234|5\n"
            });
          });
        });
        describe("paste to empty line", function() {
          return it("paste content to that empty line", function() {
            set({
              textC: "1st\n|\n3rd",
              register: {
                '"': {
                  text: '2nd'
                }
              }
            });
            return ensure('p', {
              textC: "1st\n2n|d\n3rd"
            });
          });
        });
        describe("when useClipboardAsDefaultRegister enabled", function() {
          return it("inserts contents from clipboard", function() {
            settings.set('useClipboardAsDefaultRegister', true);
            return ensure('p', {
              textC: "0cli|p12\n"
            });
          });
        });
        describe("from a specified register", function() {
          return it("inserts the contents of the 'a' register", function() {
            return ensure('" a p', {
              textC: "0|a12\n"
            });
          });
        });
        return describe("at the end of a line", function() {
          return it("inserts before the current line's newline", function() {
            set({
              textC: "abcde\none |two three"
            });
            return ensure('d $ k $ p', {
              textC_: "abcdetwo thre|e\none_"
            });
          });
        });
      });
      describe("with multiline character contents", function() {
        beforeEach(function() {
          set({
            textC: "|012\n"
          });
          return set({
            register: {
              '"': {
                text: '345\n678'
              }
            }
          });
        });
        it("p place cursor at start of mutation", function() {
          return ensure("p", {
            textC: "0|345\n67812\n"
          });
        });
        return it("P place cursor at start of mutation", function() {
          return ensure("P", {
            textC: "|345\n678012\n"
          });
        });
      });
      describe("with linewise contents", function() {
        describe("on a single line", function() {
          beforeEach(function() {
            return set({
              textC: '0|12',
              register: {
                '"': {
                  text: " 345\n",
                  type: 'linewise'
                }
              }
            });
          });
          it("inserts the contents of the default register", function() {
            return ensure('p', {
              textC_: "012\n_|345\n"
            });
          });
          return it("replaces the current selection and put cursor to the first char of line", function() {
            return ensure('v p', {
              textC_: "0\n_|345\n2"
            });
          });
        });
        return describe("on multiple lines", function() {
          beforeEach(function() {
            return set({
              text: "012\n 345",
              register: {
                '"': {
                  text: " 456\n",
                  type: 'linewise'
                }
              }
            });
          });
          it("inserts the contents of the default register at middle line", function() {
            set({
              cursor: [0, 1]
            });
            return ensure("p", {
              textC: "012\n |456\n 345"
            });
          });
          return it("inserts the contents of the default register at end of line", function() {
            set({
              cursor: [1, 1]
            });
            return ensure('p', {
              textC: "012\n 345\n |456\n"
            });
          });
        });
      });
      describe("with multiple linewise contents", function() {
        beforeEach(function() {
          return set({
            textC: "012\n|abc",
            register: {
              '"': {
                text: " 345\n 678\n",
                type: 'linewise'
              }
            }
          });
        });
        return it("inserts the contents of the default register", function() {
          return ensure('p', {
            textC: "012\nabc\n |345\n 678\n"
          });
        });
      });
      describe("put-after-with-auto-indent command", function() {
        beforeEach(function() {
          waitsForPromise(function() {
            settings.set('useClipboardAsDefaultRegister', false);
            return atom.packages.activatePackage('language-javascript');
          });
          return runs(function() {
            return set({
              grammar: 'source.js'
            });
          });
        });
        describe("paste with auto-indent", function() {
          it("inserts the contents of the default register", function() {
            set({
              register: {
                '"': {
                  text: " 345\n",
                  type: 'linewise'
                }
              },
              textC_: "if| () {\n}"
            });
            return ensureByDispatch('vim-mode-plus:put-after-with-auto-indent', {
              textC_: "if () {\n  |345\n}"
            });
          });
          return it("multi-line register contents with auto indent", function() {
            var registerContent;
            registerContent = "if(3) {\n  if(4) {}\n}";
            set({
              register: {
                '"': {
                  text: registerContent,
                  type: 'linewise'
                }
              },
              textC: "if (1) {\n  |if (2) {\n  }\n}"
            });
            return ensureByDispatch('vim-mode-plus:put-after-with-auto-indent', {
              textC: "if (1) {\n  if (2) {\n    |if(3) {\n      if(4) {}\n    }\n  }\n}"
            });
          });
        });
        return describe("when pasting already indented multi-lines register content", function() {
          beforeEach(function() {
            return set({
              textC: "if (1) {\n  |if (2) {\n  }\n}"
            });
          });
          it("keep original layout", function() {
            var registerContent;
            registerContent = "   a: 123,\nbbbb: 456,";
            set({
              register: {
                '"': {
                  text: registerContent,
                  type: 'linewise'
                }
              }
            });
            return ensureByDispatch('vim-mode-plus:put-after-with-auto-indent', {
              textC: "if (1) {\n  if (2) {\n       |a: 123,\n    bbbb: 456,\n  }\n}"
            });
          });
          return it("keep original layout [register content have blank row]", function() {
            var registerContent;
            registerContent = "if(3) {\n__abc\n\n__def\n}".replace(/_/g, ' ');
            set({
              register: {
                '"': {
                  text: registerContent,
                  type: 'linewise'
                }
              }
            });
            return ensureByDispatch('vim-mode-plus:put-after-with-auto-indent', {
              textC_: "if (1) {\n  if (2) {\n    |if(3) {\n      abc\n\n      def\n    }\n  }\n}"
            });
          });
        });
      });
      describe("pasting twice", function() {
        beforeEach(function() {
          set({
            text: "12345\nabcde\nABCDE\nQWERT",
            cursor: [1, 1],
            register: {
              '"': {
                text: '123'
              }
            }
          });
          return keystroke('2 p');
        });
        it("inserts the same line twice", function() {
          return ensure({
            text: "12345\nab123123cde\nABCDE\nQWERT"
          });
        });
        return describe("when undone", function() {
          return it("removes both lines", function() {
            return ensure('u', {
              text: "12345\nabcde\nABCDE\nQWERT"
            });
          });
        });
      });
      describe("support multiple cursors", function() {
        return it("paste text for each cursors", function() {
          set({
            text: "12345\nabcde\nABCDE\nQWERT",
            cursor: [[1, 0], [2, 0]],
            register: {
              '"': {
                text: 'ZZZ'
              }
            }
          });
          return ensure('p', {
            text: "12345\naZZZbcde\nAZZZBCDE\nQWERT",
            cursor: [[1, 3], [2, 3]]
          });
        });
      });
      return describe("with a selection", function() {
        beforeEach(function() {
          return set({
            text: '012\n',
            cursor: [0, 1]
          });
        });
        describe("with characterwise selection", function() {
          it("replaces selection with charwise content", function() {
            set({
              register: {
                '"': {
                  text: "345"
                }
              }
            });
            return ensure('v p', {
              text: "03452\n",
              cursor: [0, 3]
            });
          });
          return it("replaces selection with linewise content", function() {
            set({
              register: {
                '"': {
                  text: "345\n"
                }
              }
            });
            return ensure('v p', {
              text: "0\n345\n2\n",
              cursor: [1, 0]
            });
          });
        });
        return describe("with linewise selection", function() {
          it("replaces selection with charwise content", function() {
            set({
              text: "012\nabc",
              cursor: [0, 1]
            });
            set({
              register: {
                '"': {
                  text: "345"
                }
              }
            });
            return ensure('V p', {
              text: "345\nabc",
              cursor: [0, 0]
            });
          });
          return it("replaces selection with linewise content", function() {
            set({
              register: {
                '"': {
                  text: "345\n"
                }
              }
            });
            return ensure('V p', {
              text: "345\n",
              cursor: [0, 0]
            });
          });
        });
      });
    });
    describe("the P keybinding", function() {
      return describe("with character contents", function() {
        beforeEach(function() {
          set({
            text: "012\n",
            cursor: [0, 0]
          });
          set({
            register: {
              '"': {
                text: '345'
              }
            }
          });
          set({
            register: {
              a: {
                text: 'a'
              }
            }
          });
          return keystroke('P');
        });
        return it("inserts the contents of the default register above", function() {
          return ensure({
            text: "345012\n",
            cursor: [0, 2]
          });
        });
      });
    });
    describe("the . keybinding", function() {
      beforeEach(function() {
        return set({
          text: "12\n34\n56\n78",
          cursor: [0, 0]
        });
      });
      it("repeats the last operation", function() {
        return ensure('2 d d .', {
          text: ""
        });
      });
      return it("composes with motions", function() {
        return ensure('d d 2 .', {
          text: "78"
        });
      });
    });
    describe("the r keybinding", function() {
      beforeEach(function() {
        return set({
          text: "12\n34\n\n",
          cursor: [[0, 0], [1, 0]]
        });
      });
      it("replaces a single character", function() {
        return ensure('r x', {
          text: 'x2\nx4\n\n'
        });
      });
      it("remain visual-mode when cancelled", function() {
        return ensure('v r escape', {
          text: '12\n34\n\n',
          mode: ['visual', 'characterwise']
        });
      });
      it("replaces a single character with a line break", function() {
        return ensure('r enter', {
          text: '\n2\n\n4\n\n',
          cursor: [[1, 0], [3, 0]]
        });
      });
      it("auto indent when replaced with singe new line", function() {
        set({
          textC_: "__a|bc"
        });
        return ensure('r enter', {
          textC_: "__a\n__|c"
        });
      });
      it("composes properly with motions", function() {
        return ensure('2 r x', {
          text: 'xx\nxx\n\n'
        });
      });
      it("does nothing on an empty line", function() {
        set({
          cursor: [2, 0]
        });
        return ensure('r x', {
          text: '12\n34\n\n'
        });
      });
      it("does nothing if asked to replace more characters than there are on a line", function() {
        return ensure('3 r x', {
          text: '12\n34\n\n'
        });
      });
      describe("cancellation", function() {
        it("does nothing when cancelled", function() {
          return ensure('r escape', {
            text: '12\n34\n\n',
            mode: 'normal'
          });
        });
        it("keep multi-cursor on cancelled", function() {
          set({
            textC: "|    a\n!    a\n|    a\n"
          });
          return ensure("r escape", {
            textC: "|    a\n!    a\n|    a\n",
            mode: "normal"
          });
        });
        return it("keep multi-cursor on cancelled", function() {
          set({
            textC: "|**a\n!**a\n|**a\n"
          });
          ensure("v l", {
            textC: "**|a\n**!a\n**|a\n",
            selectedText: ["**", "**", "**"],
            mode: ["visual", "characterwise"]
          });
          return ensure("r escape", {
            textC: "**|a\n**!a\n**|a\n",
            selectedText: ["**", "**", "**"],
            mode: ["visual", "characterwise"]
          });
        });
      });
      describe("when in visual mode", function() {
        beforeEach(function() {
          return keystroke('v e');
        });
        it("replaces the entire selection with the given character", function() {
          return ensure('r x', {
            text: 'xx\nxx\n\n'
          });
        });
        return it("leaves the cursor at the beginning of the selection", function() {
          return ensure('r x', {
            cursor: [[0, 0], [1, 0]]
          });
        });
      });
      return describe("when in visual-block mode", function() {
        beforeEach(function() {
          set({
            cursor: [1, 4],
            text: "0:2345\n1: o11o\n2: o22o\n3: o33o\n4: o44o\n"
          });
          return ensure('ctrl-v l 3 j', {
            mode: ['visual', 'blockwise'],
            selectedTextOrdered: ['11', '22', '33', '44']
          });
        });
        return it("replaces each selection and put cursor on start of top selection", function() {
          ensure('r x', {
            mode: 'normal',
            cursor: [1, 4],
            text: "0:2345\n1: oxxo\n2: oxxo\n3: oxxo\n4: oxxo\n"
          });
          set({
            cursor: [1, 0]
          });
          return ensure('.', {
            mode: 'normal',
            cursor: [1, 0],
            text: "0:2345\nxx oxxo\nxx oxxo\nxx oxxo\nxx oxxo\n"
          });
        });
      });
    });
    describe('the m keybinding', function() {
      beforeEach(function() {
        return set({
          text: '12\n34\n56\n',
          cursor: [0, 1]
        });
      });
      return it('marks a position', function() {
        keystroke('m a');
        return expect(vimState.mark.get('a')).toEqual([0, 1]);
      });
    });
    describe('the R keybinding', function() {
      beforeEach(function() {
        return set({
          text: "12345\n67890",
          cursor: [0, 2]
        });
      });
      it("enters replace mode and replaces characters", function() {
        ensure('R', {
          mode: ['insert', 'replace']
        });
        editor.insertText("ab");
        return ensure('escape', {
          text: "12ab5\n67890",
          cursor: [0, 3],
          mode: 'normal'
        });
      });
      it("continues beyond end of line as insert", function() {
        ensure('R', {
          mode: ['insert', 'replace']
        });
        editor.insertText("abcde");
        return ensure('escape', {
          text: '12abcde\n67890'
        });
      });
      it('treats backspace as undo', function() {
        editor.insertText("foo");
        keystroke('R');
        editor.insertText("a");
        editor.insertText("b");
        ensure({
          text: "12fooab5\n67890"
        });
        ensure('backspace', {
          text: "12fooa45\n67890"
        });
        editor.insertText("c");
        ensure({
          text: "12fooac5\n67890"
        });
        ensure('backspace backspace', {
          text: "12foo345\n67890",
          selectedText: ''
        });
        return ensure('backspace', {
          text: "12foo345\n67890",
          selectedText: ''
        });
      });
      it("can be repeated", function() {
        keystroke('R');
        editor.insertText("ab");
        keystroke('escape');
        set({
          cursor: [1, 2]
        });
        ensure('.', {
          text: "12ab5\n67ab0",
          cursor: [1, 3]
        });
        set({
          cursor: [0, 4]
        });
        return ensure('.', {
          text: "12abab\n67ab0",
          cursor: [0, 5]
        });
      });
      it("can be interrupted by arrow keys and behave as insert for repeat", function() {});
      it("repeats correctly when backspace was used in the text", function() {
        keystroke('R');
        editor.insertText("a");
        keystroke('backspace');
        editor.insertText("b");
        keystroke('escape');
        set({
          cursor: [1, 2]
        });
        ensure('.', {
          text: "12b45\n67b90",
          cursor: [1, 2]
        });
        set({
          cursor: [0, 4]
        });
        return ensure('.', {
          text: "12b4b\n67b90",
          cursor: [0, 4]
        });
      });
      it("doesn't replace a character if newline is entered", function() {
        ensure('R', {
          mode: ['insert', 'replace']
        });
        editor.insertText("\n");
        return ensure('escape', {
          text: "12\n345\n67890"
        });
      });
      return describe("multiline situation", function() {
        var textOriginal;
        textOriginal = "01234\n56789";
        beforeEach(function() {
          return set({
            text: textOriginal,
            cursor: [0, 0]
          });
        });
        it("replace character unless input isnt new line(\\n)", function() {
          ensure('R', {
            mode: ['insert', 'replace']
          });
          editor.insertText("a\nb\nc");
          return ensure({
            text: "a\nb\nc34\n56789",
            cursor: [2, 1]
          });
        });
        it("handle backspace", function() {
          ensure('R', {
            mode: ['insert', 'replace']
          });
          set({
            cursor: [0, 1]
          });
          editor.insertText("a\nb\nc");
          ensure({
            text: "0a\nb\nc4\n56789",
            cursor: [2, 1]
          });
          ensure('backspace', {
            text: "0a\nb\n34\n56789",
            cursor: [2, 0]
          });
          ensure('backspace', {
            text: "0a\nb34\n56789",
            cursor: [1, 1]
          });
          ensure('backspace', {
            text: "0a\n234\n56789",
            cursor: [1, 0]
          });
          ensure('backspace', {
            text: "0a234\n56789",
            cursor: [0, 2]
          });
          ensure('backspace', {
            text: "01234\n56789",
            cursor: [0, 1]
          });
          ensure('backspace', {
            text: "01234\n56789",
            cursor: [0, 1]
          });
          return ensure('escape', {
            text: "01234\n56789",
            cursor: [0, 0],
            mode: 'normal'
          });
        });
        it("repeate multiline text case-1", function() {
          ensure('R', {
            mode: ['insert', 'replace']
          });
          editor.insertText("abc\ndef");
          ensure({
            text: "abc\ndef\n56789",
            cursor: [1, 3]
          });
          ensure('escape', {
            cursor: [1, 2],
            mode: 'normal'
          });
          ensure('u', {
            text: textOriginal
          });
          ensure('.', {
            text: "abc\ndef\n56789",
            cursor: [1, 2],
            mode: 'normal'
          });
          return ensure('j .', {
            text: "abc\ndef\n56abc\ndef",
            cursor: [3, 2],
            mode: 'normal'
          });
        });
        return it("repeate multiline text case-2", function() {
          ensure('R', {
            mode: ['insert', 'replace']
          });
          editor.insertText("abc\nd");
          ensure({
            text: "abc\nd4\n56789",
            cursor: [1, 1]
          });
          ensure('escape', {
            cursor: [1, 0],
            mode: 'normal'
          });
          return ensure('j .', {
            text: "abc\nd4\nabc\nd9",
            cursor: [3, 0],
            mode: 'normal'
          });
        });
      });
    });
    return describe('AddBlankLineBelow, AddBlankLineAbove', function() {
      beforeEach(function() {
        set({
          textC: "line0\nli|ne1\nline2\nline3"
        });
        return atom.keymaps.add("test", {
          'atom-text-editor.vim-mode-plus.normal-mode': {
            'enter': 'vim-mode-plus:add-blank-line-below',
            'shift-enter': 'vim-mode-plus:add-blank-line-above'
          }
        });
      });
      it("insert blank line below/above", function() {
        ensure("enter", {
          textC: "line0\nli|ne1\n\nline2\nline3"
        });
        return ensure("shift-enter", {
          textC: "line0\n\nli|ne1\n\nline2\nline3"
        });
      });
      return it("[with-count] insert blank line below/above", function() {
        ensure("2 enter", {
          textC: "line0\nli|ne1\n\n\nline2\nline3"
        });
        return ensure("2 shift-enter", {
          textC: "line0\n\n\nli|ne1\n\n\nline2\nline3"
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9zcGVjL29wZXJhdG9yLWdlbmVyYWwtc3BlYy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLDhDQUFBO0lBQUE7O0VBQUEsTUFBb0MsT0FBQSxDQUFRLGVBQVIsQ0FBcEMsRUFBQyw2QkFBRCxFQUFjLHVCQUFkLEVBQXdCOztFQUN4QixRQUFBLEdBQVcsT0FBQSxDQUFRLGlCQUFSOztFQUVYLFFBQUEsQ0FBUyxrQkFBVCxFQUE2QixTQUFBO0FBQzNCLFFBQUE7SUFBQSxPQUE4RSxFQUE5RSxFQUFDLGFBQUQsRUFBTSxnQkFBTixFQUFjLDBCQUFkLEVBQWdDLG1CQUFoQyxFQUEyQyxnQkFBM0MsRUFBbUQsdUJBQW5ELEVBQWtFO0lBRWxFLFVBQUEsQ0FBVyxTQUFBO2FBQ1QsV0FBQSxDQUFZLFNBQUMsS0FBRCxFQUFRLEdBQVI7UUFDVixRQUFBLEdBQVc7UUFDVix3QkFBRCxFQUFTO2VBQ1IsYUFBRCxFQUFNLG1CQUFOLEVBQWMsdUNBQWQsRUFBZ0MseUJBQWhDLEVBQTZDO01BSG5DLENBQVo7SUFEUyxDQUFYO0lBTUEsUUFBQSxDQUFTLHVCQUFULEVBQWtDLFNBQUE7YUFDaEMsRUFBQSxDQUFHLHlCQUFILEVBQThCLFNBQUE7UUFDNUIsU0FBQSxDQUFVLEdBQVY7UUFDQSxNQUFBLENBQU8sUUFBUSxDQUFDLGNBQWMsQ0FBQyxPQUF4QixDQUFBLENBQVAsQ0FBeUMsQ0FBQyxJQUExQyxDQUErQyxLQUEvQztRQUNBLFFBQVEsQ0FBQyxXQUFXLENBQUMsTUFBckIsQ0FBQTtRQUNBLE1BQUEsQ0FBTyxRQUFRLENBQUMsY0FBYyxDQUFDLE9BQXhCLENBQUEsQ0FBUCxDQUF5QyxDQUFDLElBQTFDLENBQStDLElBQS9DO2VBQ0EsTUFBQSxDQUFPLFNBQUE7aUJBQUcsUUFBUSxDQUFDLFdBQVcsQ0FBQyxN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Q0FBTyxhQUFQLEVBQ0U7VUFBQSxLQUFBLEVBQU8saUNBQVA7U0FERjtNQVRrQyxDQUFwQzthQW1CQSxFQUFBLENBQUcsNENBQUgsRUFBaUQsU0FBQTtRQUMvQyxNQUFBLENBQU8sU0FBUCxFQUNFO1VBQUEsS0FBQSxFQUFPLGlDQUFQO1NBREY7ZUFTQSxNQUFBLENBQU8sZUFBUCxFQUNFO1VBQUEsS0FBQSxFQUFPLHFDQUFQO1NBREY7TUFWK0MsQ0FBakQ7SUFsQytDLENBQWpEO0VBdDRDMkIsQ0FBN0I7QUFIQSIsInNvdXJjZXNDb250ZW50IjpbIntnZXRWaW1TdGF0ZSwgZGlzcGF0Y2gsIFRleHREYXRhfSA9IHJlcXVpcmUgJy4vc3BlYy1oZWxwZXInXG5zZXR0aW5ncyA9IHJlcXVpcmUgJy4uL2xpYi9zZXR0aW5ncydcblxuZGVzY3JpYmUgXCJPcGVyYXRvciBnZW5lcmFsXCIsIC0+XG4gIFtzZXQsIGVuc3VyZSwgZW5zdXJlQnlEaXNwYXRjaCwga2V5c3Ryb2tlLCBlZGl0b3IsIGVkaXRvckVsZW1lbnQsIHZpbVN0YXRlXSA9IFtdXG5cbiAgYmVmb3JlRWFjaCAtPlxuICAgIGdldFZpbVN0YXRlIChzdGF0ZSwgdmltKSAtPlxuICAgICAgdmltU3RhdGUgPSBzdGF0ZVxuICAgICAge2VkaXRvciwgZWRpdG9yRWxlbWVudH0gPSB2aW1TdGF0ZVxuICAgICAge3NldCwgZW5zdXJlLCBlbnN1cmVCeURpc3BhdGNoLCBrZXlzdHJva2V9ID0gdmltXG5cbiAgZGVzY3JpYmUgXCJjYW5jZWxsaW5nIG9wZXJhdGlvbnNcIiwgLT5cbiAgICBpdCBcImNsZWFyIHBlbmRpbmcgb3BlcmF0aW9uXCIsIC0+XG4gICAgICBrZXlzdHJva2UgJy8nXG4gICAgICBleHBlY3QodmltU3RhdGUub3BlcmF0aW9uU3RhY2suaXNFbXB0eSgpKS50b0JlIGZhbHNlXG4gICAgICB2aW1TdGF0ZS5zZWFyY2hJbnB1dC5jYW5jZWwoKVxuICAgICAgZXhwZWN0KHZpbVN0YXRlLm9wZXJhdGlvblN0YWNrLmlzRW1wdHkoKSkudG9CZSB0cnVlXG4gICAgICBleHBlY3QoLT4gdmltU3RhdGUuc2VhcmNoSW5wdXQuY2FuY2VsKCkpLm5vdC50b1Rocm93KClcblxuICBkZXNjcmliZSBcInRoZSB4IGtleWJpbmRpbmdcIiwgLT5cbiAgICBkZXNjcmliZSBcIm9uIGEgbGluZSB3aXRoIGNvbnRlbnRcIiwgLT5cbiAgICAgIGRlc2NyaWJlIFwid2l0aG91dCB2aW0tbW9kZS1wbHVzLndyYXBMZWZ0UmlnaHRNb3Rpb25cIiwgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIHNldFxuICAgICAgICAgICAgdGV4dDogXCJhYmNcXG4wMTIzNDVcXG5cXG54eXpcIlxuICAgICAgICAgICAgY3Vyc29yOiBbMSwgNF1cblxuICAgICAgICBpdCBcImRlbGV0ZXMgYSBjaGFyYWN0ZXJcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJ3gnLCB0ZXh0OiAnYWJjXFxuMDEyMzVcXG5cXG54eXonLCBjdXJzb3I6IFsxLCA0XSwgcmVnaXN0ZXI6ICdcIic6IHRleHQ6ICc0J1xuICAgICAgICAgIGVuc3VyZSAneCcsIHRleHQ6ICdhYmNcXG4wMTIzXFxuXFxueHl6JyAsIGN1cnNvcjogWzEsIDNdLCByZWdpc3RlcjogJ1wiJzogdGV4dDogJzUnXG4gICAgICAgICAgZW5zdXJlICd4JywgdGV4dDogJ2FiY1xcbjAxMlxcblxcbnh5eicgICwgY3Vyc29yOiBbMSwgMl0sIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiAnMydcbiAgICAgICAgICBlbnN1cmUgJ3gnLCB0ZXh0OiAnYWJjXFxuMDFcXG5cXG54eXonICAgLCBjdXJzb3I6IFsxLCAxXSwgcmVnaXN0ZXI6ICdcIic6IHRleHQ6ICcyJ1xuICAgICAgICAgIGVuc3VyZSAneCcsIHRleHQ6ICdhYmNcXG4wXFxuXFxueHl6JyAgICAsIGN1cnNvcjogWzEsIDBdLCByZWdpc3RlcjogJ1wiJzogdGV4dDogJzEnXG4gICAgICAgICAgZW5zdXJlICd4JywgdGV4dDogJ2FiY1xcblxcblxcbnh5eicgICAgICwgY3Vyc29yOiBbMSwgMF0sIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiAnMCdcblxuICAgICAgICBpdCBcImRlbGV0ZXMgbXVsdGlwbGUgY2hhcmFjdGVycyB3aXRoIGEgY291bnRcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJzIgeCcsIHRleHQ6ICdhYmNcXG4wMTIzXFxuXFxueHl6JywgY3Vyc29yOiBbMSwgM10sIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiAnNDUnXG4gICAgICAgICAgc2V0IGN1cnNvcjogWzAsIDFdXG4gICAgICAgICAgZW5zdXJlICczIHgnLFxuICAgICAgICAgICAgdGV4dDogJ2FcXG4wMTIzXFxuXFxueHl6J1xuICAgICAgICAgICAgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgICAgIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiAnYmMnXG5cbiAgICAgIGRlc2NyaWJlIFwid2l0aCBtdWx0aXBsZSBjdXJzb3JzXCIsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBzZXRcbiAgICAgICAgICAgIHRleHQ6IFwiYWJjXFxuMDEyMzQ1XFxuXFxueHl6XCJcbiAgICAgICAgICAgIGN1cnNvcjogW1sxLCA0XSwgWzAsIDFdXVxuXG4gICAgICAgIGl0IFwiaXMgdW5kb25lIGFzIG9uZSBvcGVyYXRpb25cIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJ3gnLCB0ZXh0OiBcImFjXFxuMDEyMzVcXG5cXG54eXpcIlxuICAgICAgICAgIGVuc3VyZSAndScsIHRleHQ6ICdhYmNcXG4wMTIzNDVcXG5cXG54eXonXG5cbiAgICAgIGRlc2NyaWJlIFwid2l0aCB2aW0tbW9kZS1wbHVzLndyYXBMZWZ0UmlnaHRNb3Rpb25cIiwgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIHNldCB0ZXh0OiAnYWJjXFxuMDEyMzQ1XFxuXFxueHl6JywgY3Vyc29yOiBbMSwgNF1cbiAgICAgICAgICBzZXR0aW5ncy5zZXQoJ3dyYXBMZWZ0UmlnaHRNb3Rpb24nLCB0cnVlKVxuXG4gICAgICAgIGl0IFwiZGVsZXRlcyBhIGNoYXJhY3RlclwiLCAtPlxuICAgICAgICAgICMgY29weSBvZiB0aGUgZWFybGllciB0ZXN0IGJlY2F1c2Ugd3JhcExlZnRSaWdodE1vdGlvbiBzaG91bGQgbm90IGFmZmVjdCBpdFxuICAgICAgICAgIGVuc3VyZSAneCcsIHRleHQ6ICdhYmNcXG4wMTIzNVxcblxcbnh5eicsIGN1cnNvcjogWzEsIDRdLCByZWdpc3RlcjogJ1wiJzogdGV4dDogJzQnXG4gICAgICAgICAgZW5zdXJlICd4JywgdGV4dDogJ2FiY1xcbjAxMjNcXG5cXG54eXonICwgY3Vyc29yOiBbMSwgM10sIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiAnNSdcbiAgICAgICAgICBlbnN1cmUgJ3gnLCB0ZXh0OiAnYWJjXFxuMDEyXFxuXFxueHl6JyAgLCBjdXJzb3I6IFsxLCAyXSwgcmVnaXN0ZXI6ICdcIic6IHRleHQ6ICczJ1xuICAgICAgICAgIGVuc3VyZSAneCcsIHRleHQ6ICdhYmNcXG4wMVxcblxcbnh5eicgICAsIGN1cnNvcjogWzEsIDFdLCByZWdpc3RlcjogJ1wiJzogdGV4dDogJzInXG4gICAgICAgICAgZW5zdXJlICd4JywgdGV4dDogJ2FiY1xcbjBcXG5cXG54eXonICAgICwgY3Vyc29yOiBbMSwgMF0sIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiAnMSdcbiAgICAgICAgICBlbnN1cmUgJ3gnLCB0ZXh0OiAnYWJjXFxuXFxuXFxueHl6JyAgICAgLCBjdXJzb3I6IFsxLCAwXSwgcmVnaXN0ZXI6ICdcIic6IHRleHQ6ICcwJ1xuXG4gICAgICAgIGl0IFwiZGVsZXRlcyBtdWx0aXBsZSBjaGFyYWN0ZXJzIGFuZCBuZXdsaW5lcyB3aXRoIGEgY291bnRcIiwgLT5cbiAgICAgICAgICBzZXR0aW5ncy5zZXQoJ3dyYXBMZWZ0UmlnaHRNb3Rpb24nLCB0cnVlKVxuICAgICAgICAgIGVuc3VyZSAnMiB4JywgdGV4dDogJ2FiY1xcbjAxMjNcXG5cXG54eXonLCBjdXJzb3I6IFsxLCAzXSwgcmVnaXN0ZXI6ICdcIic6IHRleHQ6ICc0NSdcbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMV1cbiAgICAgICAgICBlbnN1cmUgJzMgeCcsIHRleHQ6ICdhMDEyM1xcblxcbnh5eicsIGN1cnNvcjogWzAsIDFdLCByZWdpc3RlcjogJ1wiJzogdGV4dDogJ2JjXFxuJ1xuICAgICAgICAgIGVuc3VyZSAnNyB4JywgdGV4dDogJ2F5eicsIGN1cnNvcjogWzAsIDFdLCByZWdpc3RlcjogJ1wiJzogdGV4dDogJzAxMjNcXG5cXG54J1xuXG4gICAgZGVzY3JpYmUgXCJvbiBhbiBlbXB0eSBsaW5lXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldCB0ZXh0OiBcImFiY1xcbjAxMjM0NVxcblxcbnh5elwiLCBjdXJzb3I6IFsyLCAwXVxuXG4gICAgICBpdCBcImRlbGV0ZXMgbm90aGluZyBvbiBhbiBlbXB0eSBsaW5lIHdoZW4gdmltLW1vZGUtcGx1cy53cmFwTGVmdFJpZ2h0TW90aW9uIGlzIGZhbHNlXCIsIC0+XG4gICAgICAgIHNldHRpbmdzLnNldCgnd3JhcExlZnRSaWdodE1vdGlvbicsIGZhbHNlKVxuICAgICAgICBlbnN1cmUgJ3gnLCB0ZXh0OiBcImFiY1xcbjAxMjM0NVxcblxcbnh5elwiLCBjdXJzb3I6IFsyLCAwXVxuXG4gICAgICBpdCBcImRlbGV0ZXMgYW4gZW1wdHkgbGluZSB3aGVuIHZpbS1tb2RlLXBsdXMud3JhcExlZnRSaWdodE1vdGlvbiBpcyB0cnVlXCIsIC0+XG4gICAgICAgIHNldHRpbmdzLnNldCgnd3JhcExlZnRSaWdodE1vdGlvbicsIHRydWUpXG4gICAgICAgIGVuc3VyZSAneCcsIHRleHQ6IFwiYWJjXFxuMDEyMzQ1XFxueHl6XCIsIGN1cnNvcjogWzIsIDBdXG5cbiAgZGVzY3JpYmUgXCJ0aGUgWCBrZXliaW5kaW5nXCIsIC0+XG4gICAgZGVzY3JpYmUgXCJvbiBhIGxpbmUgd2l0aCBjb250ZW50XCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldCB0ZXh0OiBcImFiXFxuMDEyMzQ1XCIsIGN1cnNvcjogWzEsIDJdXG5cbiAgICAgIGl0IFwiZGVsZXRlcyBhIGNoYXJhY3RlclwiLCAtPlxuICAgICAgICBlbnN1cmUgJ1gnLCB0ZXh0OiAnYWJcXG4wMjM0NScsIGN1cnNvcjogWzEsIDFdLCByZWdpc3RlcjogJ1wiJzogdGV4dDogJzEnXG4gICAgICAgIGVuc3VyZSAnWCcsIHRleHQ6ICdhYlxcbjIzNDUnLCBjdXJzb3I6IFsxLCAwXSwgcmVnaXN0ZXI6ICdcIic6IHRleHQ6ICcwJ1xuICAgICAgICBlbnN1cmUgJ1gnLCB0ZXh0OiAnYWJcXG4yMzQ1JywgY3Vyc29yOiBbMSwgMF0sIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiAnMCdcbiAgICAgICAgc2V0dGluZ3Muc2V0KCd3cmFwTGVmdFJpZ2h0TW90aW9uJywgdHJ1ZSlcbiAgICAgICAgZW5zdXJlICdYJywgdGV4dDogJ2FiMjM0NScsIGN1cnNvcjogWzAsIDJdLCByZWdpc3RlcjogJ1wiJzogdGV4dDogJ1xcbidcblxuICAgIGRlc2NyaWJlIFwib24gYW4gZW1wdHkgbGluZVwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0OiBcIjAxMjM0NVxcblxcbmFiY2RlZlwiXG4gICAgICAgICAgY3Vyc29yOiBbMSwgMF1cblxuICAgICAgaXQgXCJkZWxldGVzIG5vdGhpbmcgd2hlbiB2aW0tbW9kZS1wbHVzLndyYXBMZWZ0UmlnaHRNb3Rpb24gaXMgZmFsc2VcIiwgLT5cbiAgICAgICAgc2V0dGluZ3Muc2V0KCd3cmFwTGVmdFJpZ2h0TW90aW9uJywgZmFsc2UpXG4gICAgICAgIGVuc3VyZSAnWCcsIHRleHQ6IFwiMDEyMzQ1XFxuXFxuYWJjZGVmXCIsIGN1cnNvcjogWzEsIDBdXG5cbiAgICAgIGl0IFwiZGVsZXRlcyB0aGUgbmV3bGluZSB3aGVuIHdyYXBMZWZ0UmlnaHRNb3Rpb24gaXMgdHJ1ZVwiLCAtPlxuICAgICAgICBzZXR0aW5ncy5zZXQoJ3dyYXBMZWZ0UmlnaHRNb3Rpb24nLCB0cnVlKVxuICAgICAgICBlbnN1cmUgJ1gnLCB0ZXh0OiBcIjAxMjM0NVxcbmFiY2RlZlwiLCBjdXJzb3I6IFswLCA1XVxuXG4gIGRlc2NyaWJlIFwidGhlIGQga2V5YmluZGluZ1wiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNldFxuICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAxMjM0NVxuICAgICAgICAgIGFiY2RlXG5cbiAgICAgICAgICBBQkNERVxcblxuICAgICAgICAgIFwiXCJcIlxuICAgICAgICBjdXJzb3I6IFsxLCAxXVxuXG4gICAgaXQgXCJlbnRlcnMgb3BlcmF0b3ItcGVuZGluZyBtb2RlXCIsIC0+XG4gICAgICBlbnN1cmUgJ2QnLCBtb2RlOiAnb3BlcmF0b3ItcGVuZGluZydcblxuICAgIGRlc2NyaWJlIFwid2hlbiBmb2xsb3dlZCBieSBhIGRcIiwgLT5cbiAgICAgIGl0IFwiZGVsZXRlcyB0aGUgY3VycmVudCBsaW5lIGFuZCBleGl0cyBvcGVyYXRvci1wZW5kaW5nIG1vZGVcIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzEsIDFdXG4gICAgICAgIGVuc3VyZSAnZCBkJyxcbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIDEyMzQ1XG5cbiAgICAgICAgICAgIEFCQ0RFXFxuXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICBjdXJzb3I6IFsxLCAwXVxuICAgICAgICAgIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiBcImFiY2RlXFxuXCJcbiAgICAgICAgICBtb2RlOiAnbm9ybWFsJ1xuXG4gICAgICBpdCBcImRlbGV0ZXMgdGhlIGxhc3QgbGluZSBhbmQgYWx3YXlzIG1ha2Ugbm9uLWJsYW5rLWxpbmUgbGFzdCBsaW5lXCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFsyLCAwXVxuICAgICAgICBlbnN1cmUgJzIgZCBkJyxcbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIDEyMzQ1XG4gICAgICAgICAgICBhYmNkZVxcblxuICAgICAgICAgICAgXCJcIlwiLFxuICAgICAgICAgIGN1cnNvcjogWzEsIDBdXG5cbiAgICAgIGl0IFwibGVhdmVzIHRoZSBjdXJzb3Igb24gdGhlIGZpcnN0IG5vbmJsYW5rIGNoYXJhY3RlclwiLCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgMTIzNHw1XG4gICAgICAgICAgICBhYmNkZVxcblxuICAgICAgICAgIFwiXCJcIlxuICAgICAgICBlbnN1cmUgJ2QgZCcsXG4gICAgICAgICAgdGV4dEM6IFwiICB8YWJjZGVcXG5cIlxuXG4gICAgZGVzY3JpYmUgXCJ1bmRvIGJlaGF2aW9yXCIsIC0+XG4gICAgICBbb3JpZ2luYWxUZXh0LCBpbml0aWFsVGV4dENdID0gW11cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgaW5pdGlhbFRleHRDID0gXCJcIlwiXG4gICAgICAgICAgMTIzNDVcbiAgICAgICAgICBhfGJjZGVcbiAgICAgICAgICBBQkNERVxuICAgICAgICAgIFFXRVJUXG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgIHNldCB0ZXh0QzogaW5pdGlhbFRleHRDXG4gICAgICAgIG9yaWdpbmFsVGV4dCA9IGVkaXRvci5nZXRUZXh0KClcblxuICAgICAgaXQgXCJ1bmRvZXMgYm90aCBsaW5lc1wiLCAtPlxuICAgICAgICBlbnN1cmUgJ2QgMiBkJyxcbiAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgMTIzNDVcbiAgICAgICAgICB8UVdFUlRcbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgZW5zdXJlICd1JyxcbiAgICAgICAgICB0ZXh0QzogaW5pdGlhbFRleHRDXG4gICAgICAgICAgc2VsZWN0ZWRUZXh0OiBcIlwiXG5cbiAgICAgIGRlc2NyaWJlIFwid2l0aCBtdWx0aXBsZSBjdXJzb3JzXCIsIC0+XG4gICAgICAgIGRlc2NyaWJlIFwic2V0Q3Vyc29yVG9TdGFydE9mQ2hhbmdlT25VbmRvUmVkbyBpcyB0cnVlKGRlZmF1bHQpXCIsIC0+XG4gICAgICAgICAgaXQgXCJjbGVhciBtdWx0aXBsZSBjdXJzb3JzIGFuZCBzZXQgY3Vyc29yIHRvIHN0YXJ0IG9mIGNoYW5nZXMgb2YgbGFzdCBjdXJzb3JcIiwgLT5cbiAgICAgICAgICAgIHNldFxuICAgICAgICAgICAgICB0ZXh0OiBvcmlnaW5hbFRleHRcbiAgICAgICAgICAgICAgY3Vyc29yOiBbWzAsIDBdLCBbMSwgMV1dXG5cbiAgICAgICAgICAgIGVuc3VyZSAnZCBsJyxcbiAgICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgICB8MjM0NVxuICAgICAgICAgICAgICBhfGNkZVxuICAgICAgICAgICAgICBBQkNERVxuICAgICAgICAgICAgICBRV0VSVFxuICAgICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICAgICAgZW5zdXJlICd1JyxcbiAgICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgICAxMjM0NVxuICAgICAgICAgICAgICBhfGJjZGVcbiAgICAgICAgICAgICAgQUJDREVcbiAgICAgICAgICAgICAgUVdFUlRcbiAgICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICAgIHNlbGVjdGVkVGV4dDogJydcblxuICAgICAgICAgICAgZW5zdXJlICdjdHJsLXInLFxuICAgICAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICAgIDIzNDVcbiAgICAgICAgICAgICAgYXxjZGVcbiAgICAgICAgICAgICAgQUJDREVcbiAgICAgICAgICAgICAgUVdFUlRcbiAgICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICAgIHNlbGVjdGVkVGV4dDogJydcblxuICAgICAgICAgIGl0IFwiY2xlYXIgbXVsdGlwbGUgY3Vyc29ycyBhbmQgc2V0IGN1cnNvciB0byBzdGFydCBvZiBjaGFuZ2VzIG9mIGxhc3QgY3Vyc29yXCIsIC0+XG4gICAgICAgICAgICBzZXRcbiAgICAgICAgICAgICAgdGV4dDogb3JpZ2luYWxUZXh0XG4gICAgICAgICAgICAgIGN1cnNvcjogW1sxLCAxXSwgWzAsIDBdXVxuXG4gICAgICAgICAgICBlbnN1cmUgJ2QgbCcsXG4gICAgICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgICAyMzQ1XG4gICAgICAgICAgICAgIGFjZGVcbiAgICAgICAgICAgICAgQUJDREVcbiAgICAgICAgICAgICAgUVdFUlRcbiAgICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICAgIGN1cnNvcjogW1sxLCAxXSwgWzAsIDBdXVxuXG4gICAgICAgICAgICBlbnN1cmUgJ3UnLFxuICAgICAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICAgIHwxMjM0NVxuICAgICAgICAgICAgICBhYmNkZVxuICAgICAgICAgICAgICBBQkNERVxuICAgICAgICAgICAgICBRV0VSVFxuICAgICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgICAgc2VsZWN0ZWRUZXh0OiAnJ1xuXG4gICAgICAgICAgICBlbnN1cmUgJ2N0cmwtcicsXG4gICAgICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAgICAgfDIzNDVcbiAgICAgICAgICAgICAgYWNkZVxuICAgICAgICAgICAgICBBQkNERVxuICAgICAgICAgICAgICBRV0VSVFxuICAgICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgICAgc2VsZWN0ZWRUZXh0OiAnJ1xuXG4gICAgICAgIGRlc2NyaWJlIFwic2V0Q3Vyc29yVG9TdGFydE9mQ2hhbmdlT25VbmRvUmVkbyBpcyBmYWxzZVwiLCAtPlxuICAgICAgICAgIGluaXRpYWxUZXh0QyA9IG51bGxcblxuICAgICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICAgIGluaXRpYWxUZXh0QyA9IFwiXCJcIlxuICAgICAgICAgICAgICB8MTIzNDVcbiAgICAgICAgICAgICAgYXxiY2RlXG4gICAgICAgICAgICAgIEFCQ0RFXG4gICAgICAgICAgICAgIFFXRVJUXG4gICAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgICAgICBzZXR0aW5ncy5zZXQoJ3NldEN1cnNvclRvU3RhcnRPZkNoYW5nZU9uVW5kb1JlZG8nLCBmYWxzZSlcbiAgICAgICAgICAgIHNldCB0ZXh0QzogaW5pdGlhbFRleHRDXG4gICAgICAgICAgICBlbnN1cmUgJ2QgbCcsXG4gICAgICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAgICAgfDIzNDVcbiAgICAgICAgICAgICAgYXxjZGVcbiAgICAgICAgICAgICAgQUJDREVcbiAgICAgICAgICAgICAgUVdFUlRcbiAgICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgICBpdCBcInB1dCBjdXJzb3IgdG8gZW5kIG9mIGNoYW5nZSAod29ya3MgaW4gc2FtZSB3YXkgb2YgYXRvbSdzIGNvcmU6dW5kbylcIiwgLT5cbiAgICAgICAgICAgIGVuc3VyZSAndScsXG4gICAgICAgICAgICAgIHRleHRDOiBpbml0aWFsVGV4dENcbiAgICAgICAgICAgICAgc2VsZWN0ZWRUZXh0OiBbJycsICcnXVxuXG4gICAgZGVzY3JpYmUgXCJ3aGVuIGZvbGxvd2VkIGJ5IGEgd1wiLCAtPlxuICAgICAgaXQgXCJkZWxldGVzIHRoZSBuZXh0IHdvcmQgdW50aWwgdGhlIGVuZCBvZiB0aGUgbGluZSBhbmQgZXhpdHMgb3BlcmF0b3ItcGVuZGluZyBtb2RlXCIsIC0+XG4gICAgICAgIHNldCB0ZXh0OiAnYWJjZCBlZmdcXG5hYmMnLCBjdXJzb3I6IFswLCA1XVxuICAgICAgICBlbnN1cmUgJ2QgdycsXG4gICAgICAgICAgdGV4dDogXCJhYmNkIFxcbmFiY1wiXG4gICAgICAgICAgY3Vyc29yOiBbMCwgNF1cbiAgICAgICAgICBtb2RlOiAnbm9ybWFsJ1xuXG4gICAgICBpdCBcImRlbGV0ZXMgdG8gdGhlIGJlZ2lubmluZyBvZiB0aGUgbmV4dCB3b3JkXCIsIC0+XG4gICAgICAgIHNldCB0ZXh0OiAnYWJjZCBlZmcnLCBjdXJzb3I6IFswLCAyXVxuICAgICAgICBlbnN1cmUgJ2QgdycsIHRleHQ6ICdhYmVmZycsIGN1cnNvcjogWzAsIDJdXG4gICAgICAgIHNldCB0ZXh0OiAnb25lIHR3byB0aHJlZSBmb3VyJywgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgZW5zdXJlICdkIDMgdycsIHRleHQ6ICdmb3VyJywgY3Vyc29yOiBbMCwgMF1cblxuICAgIGRlc2NyaWJlIFwid2hlbiBmb2xsb3dlZCBieSBhbiBpd1wiLCAtPlxuICAgICAgaXQgXCJkZWxldGVzIHRoZSBjb250YWluaW5nIHdvcmRcIiwgLT5cbiAgICAgICAgc2V0IHRleHQ6IFwiMTIzNDUgYWJjZGUgQUJDREVcIiwgY3Vyc29yOiBbMCwgOV1cblxuICAgICAgICBlbnN1cmUgJ2QnLCBtb2RlOiAnb3BlcmF0b3ItcGVuZGluZydcblxuICAgICAgICBlbnN1cmUgJ2kgdycsXG4gICAgICAgICAgdGV4dDogXCIxMjM0NSAgQUJDREVcIlxuICAgICAgICAgIGN1cnNvcjogWzAsIDZdXG4gICAgICAgICAgcmVnaXN0ZXI6ICdcIic6IHRleHQ6ICdhYmNkZSdcbiAgICAgICAgICBtb2RlOiAnbm9ybWFsJ1xuXG4gICAgZGVzY3JpYmUgXCJ3aGVuIGZvbGxvd2VkIGJ5IGEgalwiLCAtPlxuICAgICAgb3JpZ2luYWxUZXh0ID0gXCJcIlwiXG4gICAgICAgIDEyMzQ1XG4gICAgICAgIGFiY2RlXG4gICAgICAgIEFCQ0RFXFxuXG4gICAgICAgIFwiXCJcIlxuXG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldCB0ZXh0OiBvcmlnaW5hbFRleHRcblxuICAgICAgZGVzY3JpYmUgXCJvbiB0aGUgYmVnaW5uaW5nIG9mIHRoZSBmaWxlXCIsIC0+XG4gICAgICAgIGl0IFwiZGVsZXRlcyB0aGUgbmV4dCB0d28gbGluZXNcIiwgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgICBlbnN1cmUgJ2QgaicsIHRleHQ6ICdBQkNERVxcbidcblxuICAgICAgZGVzY3JpYmUgXCJvbiB0aGUgbWlkZGxlIG9mIHNlY29uZCBsaW5lXCIsIC0+XG4gICAgICAgIGl0IFwiZGVsZXRlcyB0aGUgbGFzdCB0d28gbGluZXNcIiwgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMSwgMl1cbiAgICAgICAgICBlbnN1cmUgJ2QgaicsIHRleHQ6ICcxMjM0NVxcbidcblxuICAgICAgZGVzY3JpYmUgXCJ3aGVuIGN1cnNvciBpcyBvbiBibGFuayBsaW5lXCIsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBzZXRcbiAgICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgICBhXG5cblxuICAgICAgICAgICAgICBiXFxuXG4gICAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgY3Vyc29yOiBbMSwgMF1cbiAgICAgICAgaXQgXCJkZWxldGVzIGJvdGggbGluZXNcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJ2QgaicsIHRleHQ6IFwiYVxcbmJcXG5cIiwgY3Vyc29yOiBbMSwgMF1cblxuICAgIGRlc2NyaWJlIFwid2hlbiBmb2xsb3dlZCBieSBhbiBrXCIsIC0+XG4gICAgICBvcmlnaW5hbFRleHQgPSBcIlwiXCJcbiAgICAgICAgMTIzNDVcbiAgICAgICAgYWJjZGVcbiAgICAgICAgQUJDREVcbiAgICAgICAgXCJcIlwiXG5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0IHRleHQ6IG9yaWdpbmFsVGV4dFxuXG4gICAgICBkZXNjcmliZSBcIm9uIHRoZSBlbmQgb2YgdGhlIGZpbGVcIiwgLT5cbiAgICAgICAgaXQgXCJkZWxldGVzIHRoZSBib3R0b20gdHdvIGxpbmVzXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzIsIDRdXG4gICAgICAgICAgZW5zdXJlICdkIGsnLCB0ZXh0OiAnMTIzNDVcXG4nXG5cbiAgICAgIGRlc2NyaWJlIFwib24gdGhlIGJlZ2lubmluZyBvZiB0aGUgZmlsZVwiLCAtPlxuICAgICAgICB4aXQgXCJkZWxldGVzIG5vdGhpbmdcIiwgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgICBlbnN1cmUgJ2QgaycsIHRleHQ6IG9yaWdpbmFsVGV4dFxuXG4gICAgICBkZXNjcmliZSBcIndoZW4gb24gdGhlIG1pZGRsZSBvZiBzZWNvbmQgbGluZVwiLCAtPlxuICAgICAgICBpdCBcImRlbGV0ZXMgdGhlIGZpcnN0IHR3byBsaW5lc1wiLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFsxLCAyXVxuICAgICAgICAgIGVuc3VyZSAnZCBrJywgdGV4dDogJ0FCQ0RFJ1xuXG4gICAgICBkZXNjcmliZSBcIndoZW4gY3Vyc29yIGlzIG9uIGJsYW5rIGxpbmVcIiwgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIHNldFxuICAgICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICAgIGFcblxuXG4gICAgICAgICAgICAgIGJcXG5cbiAgICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICBjdXJzb3I6IFsyLCAwXVxuICAgICAgICBpdCBcImRlbGV0ZXMgYm90aCBsaW5lc1wiLCAtPlxuICAgICAgICAgIGVuc3VyZSAnZCBrJywgdGV4dDogXCJhXFxuYlxcblwiLCBjdXJzb3I6IFsxLCAwXVxuXG4gICAgZGVzY3JpYmUgXCJ3aGVuIGZvbGxvd2VkIGJ5IGEgR1wiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBvcmlnaW5hbFRleHQgPSBcIjEyMzQ1XFxuYWJjZGVcXG5BQkNERVwiXG4gICAgICAgIHNldCB0ZXh0OiBvcmlnaW5hbFRleHRcblxuICAgICAgZGVzY3JpYmUgXCJvbiB0aGUgYmVnaW5uaW5nIG9mIHRoZSBzZWNvbmQgbGluZVwiLCAtPlxuICAgICAgICBpdCBcImRlbGV0ZXMgdGhlIGJvdHRvbSB0d28gbGluZXNcIiwgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMSwgMF1cbiAgICAgICAgICBlbnN1cmUgJ2QgRycsIHRleHQ6ICcxMjM0NVxcbidcblxuICAgICAgZGVzY3JpYmUgXCJvbiB0aGUgbWlkZGxlIG9mIHRoZSBzZWNvbmQgbGluZVwiLCAtPlxuICAgICAgICBpdCBcImRlbGV0ZXMgdGhlIGJvdHRvbSB0d28gbGluZXNcIiwgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMSwgMl1cbiAgICAgICAgICBlbnN1cmUgJ2QgRycsIHRleHQ6ICcxMjM0NVxcbidcblxuICAgIGRlc2NyaWJlIFwid2hlbiBmb2xsb3dlZCBieSBhIGdvdG8gbGluZSBHXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIG9yaWdpbmFsVGV4dCA9IFwiMTIzNDVcXG5hYmNkZVxcbkFCQ0RFXCJcbiAgICAgICAgc2V0IHRleHQ6IG9yaWdpbmFsVGV4dFxuXG4gICAgICBkZXNjcmliZSBcIm9uIHRoZSBiZWdpbm5pbmcgb2YgdGhlIHNlY29uZCBsaW5lXCIsIC0+XG4gICAgICAgIGl0IFwiZGVsZXRlcyB0aGUgYm90dG9tIHR3byBsaW5lc1wiLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFsxLCAwXVxuICAgICAgICAgIGVuc3VyZSAnZCAyIEcnLCB0ZXh0OiAnMTIzNDVcXG5BQkNERSdcblxuICAgICAgZGVzY3JpYmUgXCJvbiB0aGUgbWlkZGxlIG9mIHRoZSBzZWNvbmQgbGluZVwiLCAtPlxuICAgICAgICBpdCBcImRlbGV0ZXMgdGhlIGJvdHRvbSB0d28gbGluZXNcIiwgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMSwgMl1cbiAgICAgICAgICBlbnN1cmUgJ2QgMiBHJywgdGV4dDogJzEyMzQ1XFxuQUJDREUnXG5cbiAgICBkZXNjcmliZSBcIndoZW4gZm9sbG93ZWQgYnkgYSB0KVwiLCAtPlxuICAgICAgZGVzY3JpYmUgXCJ3aXRoIHRoZSBlbnRpcmUgbGluZSB5YW5rZWQgYmVmb3JlXCIsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBzZXQgdGV4dDogXCJ0ZXN0ICh4eXopXCIsIGN1cnNvcjogWzAsIDZdXG5cbiAgICAgICAgaXQgXCJkZWxldGVzIHVudGlsIHRoZSBjbG9zaW5nIHBhcmVudGhlc2lzXCIsIC0+XG4gICAgICAgICAgZW5zdXJlICdkIHQgKScsXG4gICAgICAgICAgICB0ZXh0OiAndGVzdCAoKSdcbiAgICAgICAgICAgIGN1cnNvcjogWzAsIDZdXG5cbiAgICBkZXNjcmliZSBcIndpdGggbXVsdGlwbGUgY3Vyc29yc1wiLCAtPlxuICAgICAgaXQgXCJkZWxldGVzIGVhY2ggc2VsZWN0aW9uXCIsIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgYWJjZFxuICAgICAgICAgICAgMTIzNFxuICAgICAgICAgICAgQUJDRFxcblxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgY3Vyc29yOiBbWzAsIDFdLCBbMSwgMl0sIFsyLCAzXV1cblxuICAgICAgICBlbnN1cmUgJ2QgZScsXG4gICAgICAgICAgdGV4dDogXCJhXFxuMTJcXG5BQkNcIlxuICAgICAgICAgIGN1cnNvcjogW1swLCAwXSwgWzEsIDFdLCBbMiwgMl1dXG5cbiAgICAgIGl0IFwiZG9lc24ndCBkZWxldGUgZW1wdHkgc2VsZWN0aW9uc1wiLCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0OiBcImFiY2RcXG5hYmNcXG5hYmRcIlxuICAgICAgICAgIGN1cnNvcjogW1swLCAwXSwgWzEsIDBdLCBbMiwgMF1dXG5cbiAgICAgICAgZW5zdXJlICdkIHQgZCcsXG4gICAgICAgICAgdGV4dDogXCJkXFxuYWJjXFxuZFwiXG4gICAgICAgICAgY3Vyc29yOiBbWzAsIDBdLCBbMSwgMF0sIFsyLCAwXV1cblxuICAgIGRlc2NyaWJlIFwic3RheU9uRGVsZXRlIHNldHRpbmdcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0dGluZ3Muc2V0KCdzdGF5T25EZWxldGUnLCB0cnVlKVxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0XzogXCJcIlwiXG4gICAgICAgICAgX19fMzMzM1xuICAgICAgICAgIF9fMjIyMlxuICAgICAgICAgIF8xMTExXG4gICAgICAgICAgX18yMjIyXG4gICAgICAgICAgX19fMzMzM1xcblxuICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIGN1cnNvcjogWzAsIDNdXG5cbiAgICAgIGRlc2NyaWJlIFwidGFyZ2V0IHJhbmdlIGlzIGxpbmV3aXNlIHJhbmdlXCIsIC0+XG4gICAgICAgIGl0IFwia2VlcCBvcmlnaW5hbCBjb2x1bW4gYWZ0ZXIgZGVsZXRlXCIsIC0+XG4gICAgICAgICAgZW5zdXJlIFwiZCBkXCIsIGN1cnNvcjogWzAsIDNdLCB0ZXh0XzogXCJfXzIyMjJcXG5fMTExMVxcbl9fMjIyMlxcbl9fXzMzMzNcXG5cIlxuICAgICAgICAgIGVuc3VyZSBcIi5cIiwgY3Vyc29yOiBbMCwgM10sIHRleHRfOiBcIl8xMTExXFxuX18yMjIyXFxuX19fMzMzM1xcblwiXG4gICAgICAgICAgZW5zdXJlIFwiLlwiLCBjdXJzb3I6IFswLCAzXSwgdGV4dF86IFwiX18yMjIyXFxuX19fMzMzM1xcblwiXG4gICAgICAgICAgZW5zdXJlIFwiLlwiLCBjdXJzb3I6IFswLCAzXSwgdGV4dF86IFwiX19fMzMzM1xcblwiXG5cbiAgICAgICAgaXQgXCJ2X0QgYWxzbyBrZWVwIG9yaWdpbmFsIGNvbHVtbiBhZnRlciBkZWxldGVcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgXCJ2IDIgaiBEXCIsIGN1cnNvcjogWzAsIDNdLCB0ZXh0XzogXCJfXzIyMjJcXG5fX18zMzMzXFxuXCJcblxuICAgICAgZGVzY3JpYmUgXCJ0YXJnZXQgcmFuZ2UgaXMgdGV4dCBvYmplY3RcIiwgLT5cbiAgICAgICAgZGVzY3JpYmUgXCJ0YXJnZXQgaXMgaW5kZW50XCIsIC0+XG4gICAgICAgICAgaW5kZW50VGV4dCA9IFwiXCJcIlxuICAgICAgICAgIDAwMDAwMDAwMDAwMDAwMDBcbiAgICAgICAgICAgIDIyMjIyMjIyMjIyMjIyXG4gICAgICAgICAgICAyMjIyMjIyMjIyMjIyMlxuICAgICAgICAgICAgMjIyMjIyMjIyMjIyMjJcbiAgICAgICAgICAwMDAwMDAwMDAwMDAwMDAwXFxuXG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgdGV4dERhdGEgPSBuZXcgVGV4dERhdGEoaW5kZW50VGV4dClcbiAgICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgICBzZXRcbiAgICAgICAgICAgICAgdGV4dDogdGV4dERhdGEuZ2V0UmF3KClcblxuICAgICAgICAgIGl0IFwiW2Zyb20gdG9wXSBrZWVwIGNvbHVtblwiLCAtPlxuICAgICAgICAgICAgc2V0IGN1cnNvcjogWzEsIDEwXVxuICAgICAgICAgICAgZW5zdXJlICdkIGkgaScsIGN1cnNvcjogWzEsIDEwXSwgdGV4dDogdGV4dERhdGEuZ2V0TGluZXMoWzAsIDRdKVxuICAgICAgICAgIGl0IFwiW2Zyb20gbWlkZGxlXSBrZWVwIGNvbHVtblwiLCAtPlxuICAgICAgICAgICAgc2V0IGN1cnNvcjogWzIsIDEwXVxuICAgICAgICAgICAgZW5zdXJlICdkIGkgaScsIGN1cnNvcjogWzEsIDEwXSwgdGV4dDogdGV4dERhdGEuZ2V0TGluZXMoWzAsIDRdKVxuICAgICAgICAgIGl0IFwiW2Zyb20gYm90dG9tXSBrZWVwIGNvbHVtblwiLCAtPlxuICAgICAgICAgICAgc2V0IGN1cnNvcjogWzMsIDEwXVxuICAgICAgICAgICAgZW5zdXJlICdkIGkgaScsIGN1cnNvcjogWzEsIDEwXSwgdGV4dDogdGV4dERhdGEuZ2V0TGluZXMoWzAsIDRdKVxuXG4gICAgICAgIGRlc2NyaWJlIFwidGFyZ2V0IGlzIHBhcmFncmFwaFwiLCAtPlxuICAgICAgICAgIHBhcmFncmFwaFRleHQgPSBcIlwiXCJcbiAgICAgICAgICAgIHAxLS0tLS0tLS0tLS0tLS0tXG4gICAgICAgICAgICBwMS0tLS0tLS0tLS0tLS0tLVxuICAgICAgICAgICAgcDEtLS0tLS0tLS0tLS0tLS1cblxuICAgICAgICAgICAgcDItLS0tLS0tLS0tLS0tLS1cbiAgICAgICAgICAgIHAyLS0tLS0tLS0tLS0tLS0tXG4gICAgICAgICAgICBwMi0tLS0tLS0tLS0tLS0tLVxuXG4gICAgICAgICAgICBwMy0tLS0tLS0tLS0tLS0tLVxuICAgICAgICAgICAgcDMtLS0tLS0tLS0tLS0tLS1cbiAgICAgICAgICAgIHAzLS0tLS0tLS0tLS0tLS0tXFxuXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICAgIHRleHREYXRhID0gbmV3IFRleHREYXRhKHBhcmFncmFwaFRleHQpXG4gICAgICAgICAgUDEgPSBbMCwgMSwgMl1cbiAgICAgICAgICBCMSA9IDNcbiAgICAgICAgICBQMiA9IFs0LCA1LCA2XVxuICAgICAgICAgIEIyID0gN1xuICAgICAgICAgIFAzID0gWzgsIDksIDEwXVxuICAgICAgICAgIEIzID0gMTFcblxuICAgICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICAgIHNldFxuICAgICAgICAgICAgICB0ZXh0OiB0ZXh0RGF0YS5nZXRSYXcoKVxuXG4gICAgICAgICAgaXQgXCJzZXQgY3Vyc29yIHRvIHN0YXJ0IG9mIGRlbGV0aW9uIGFmdGVyIGRlbGV0ZSBbZnJvbSBib3R0b20gb2YgcGFyYWdyYXBoXVwiLCAtPlxuICAgICAgICAgICAgc2V0IGN1cnNvcjogWzAsIDBdXG4gICAgICAgICAgICBlbnN1cmUgJ2QgaSBwJywgY3Vyc29yOiBbMCwgMF0sIHRleHQ6IHRleHREYXRhLmdldExpbmVzKFtCMS4uQjNdLCBjaG9tcDogdHJ1ZSlcbiAgICAgICAgICAgIGVuc3VyZSAnaiAuJywgY3Vyc29yOiBbMSwgMF0sIHRleHQ6IHRleHREYXRhLmdldExpbmVzKFtCMSwgQjIsIFAzLi4uLCBCM10sIGNob21wOiB0cnVlKVxuICAgICAgICAgICAgZW5zdXJlICdqIC4nLCBjdXJzb3I6IFsxLCAwXSwgdGV4dDogdGV4dERhdGEuZ2V0TGluZXMoW0IxLCBCMiwgQjNdLCBjaG9tcDogdHJ1ZSlcbiAgICAgICAgICBpdCBcInNldCBjdXJzb3IgdG8gc3RhcnQgb2YgZGVsZXRpb24gYWZ0ZXIgZGVsZXRlIFtmcm9tIG1pZGRsZSBvZiBwYXJhZ3JhcGhdXCIsIC0+XG4gICAgICAgICAgICBzZXQgY3Vyc29yOiBbMSwgMF1cbiAgICAgICAgICAgIGVuc3VyZSAnZCBpIHAnLCBjdXJzb3I6IFswLCAwXSwgdGV4dDogdGV4dERhdGEuZ2V0TGluZXMoW0IxLi5CM10sIGNob21wOiB0cnVlKVxuICAgICAgICAgICAgZW5zdXJlICcyIGogLicsIGN1cnNvcjogWzEsIDBdLCB0ZXh0OiB0ZXh0RGF0YS5nZXRMaW5lcyhbQjEsIEIyLCBQMy4uLiwgQjNdLCBjaG9tcDogdHJ1ZSlcbiAgICAgICAgICAgIGVuc3VyZSAnMiBqIC4nLCBjdXJzb3I6IFsxLCAwXSwgdGV4dDogdGV4dERhdGEuZ2V0TGluZXMoW0IxLCBCMiwgQjNdLCBjaG9tcDogdHJ1ZSlcbiAgICAgICAgICBpdCBcInNldCBjdXJzb3IgdG8gc3RhcnQgb2YgZGVsZXRpb24gYWZ0ZXIgZGVsZXRlIFtmcm9tIGJvdHRvbSBvZiBwYXJhZ3JhcGhdXCIsIC0+XG4gICAgICAgICAgICBzZXQgY3Vyc29yOiBbMSwgMF1cbiAgICAgICAgICAgIGVuc3VyZSAnZCBpIHAnLCBjdXJzb3I6IFswLCAwXSwgdGV4dDogdGV4dERhdGEuZ2V0TGluZXMoW0IxLi5CM10sIGNob21wOiB0cnVlKVxuICAgICAgICAgICAgZW5zdXJlICczIGogLicsIGN1cnNvcjogWzEsIDBdLCB0ZXh0OiB0ZXh0RGF0YS5nZXRMaW5lcyhbQjEsIEIyLCBQMy4uLiwgQjNdLCBjaG9tcDogdHJ1ZSlcbiAgICAgICAgICAgIGVuc3VyZSAnMyBqIC4nLCBjdXJzb3I6IFsxLCAwXSwgdGV4dDogdGV4dERhdGEuZ2V0TGluZXMoW0IxLCBCMiwgQjNdLCBjaG9tcDogdHJ1ZSlcblxuICBkZXNjcmliZSBcInRoZSBEIGtleWJpbmRpbmdcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXRcbiAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgIDAwMDBcbiAgICAgICAgMTExMVxuICAgICAgICAyMjIyXG4gICAgICAgIDMzMzNcbiAgICAgICAgXCJcIlwiXG4gICAgICAgIGN1cnNvcjogWzAsIDFdXG5cbiAgICBpdCBcImRlbGV0ZXMgdGhlIGNvbnRlbnRzIHVudGlsIHRoZSBlbmQgb2YgdGhlIGxpbmVcIiwgLT5cbiAgICAgIGVuc3VyZSAnRCcsIHRleHQ6IFwiMFxcbjExMTFcXG4yMjIyXFxuMzMzM1wiXG5cbiAgICBpdCBcImluIHZpc3VhbC1tb2RlLCBpdCBkZWxldGUgd2hvbGUgbGluZVwiLCAtPlxuICAgICAgZW5zdXJlICd2IEQnLCB0ZXh0OiBcIjExMTFcXG4yMjIyXFxuMzMzM1wiXG4gICAgICBlbnN1cmUgXCJ2IGogRFwiLCB0ZXh0OiBcIjMzMzNcIlxuXG4gIGRlc2NyaWJlIFwidGhlIHkga2V5YmluZGluZ1wiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNldFxuICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgIDAxMiB8MzQ1XG4gICAgICAgIGFiY1xcblxuICAgICAgICBcIlwiXCJcblxuICAgIGRlc2NyaWJlIFwid2hlbiB1c2VDbGlwYm9hcmRBc0RlZmF1bHRSZWdpc3RlciBlbmFibGVkXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldHRpbmdzLnNldCgndXNlQ2xpcGJvYXJkQXNEZWZhdWx0UmVnaXN0ZXInLCB0cnVlKVxuICAgICAgICBhdG9tLmNsaXBib2FyZC53cml0ZSgnX19fX19fX19fX18nKVxuICAgICAgICBlbnN1cmUgcmVnaXN0ZXI6ICdcIic6IHRleHQ6ICdfX19fX19fX19fXydcblxuICAgICAgZGVzY3JpYmUgXCJyZWFkL3dyaXRlIHRvIGNsaXBib2FyZCB0aHJvdWdoIHJlZ2lzdGVyXCIsIC0+XG4gICAgICAgIGl0IFwid3JpdGVzIHRvIGNsaXBib2FyZCB3aXRoIGRlZmF1bHQgcmVnaXN0ZXJcIiwgLT5cbiAgICAgICAgICBzYXZlZFRleHQgPSAnMDEyIDM0NVxcbidcbiAgICAgICAgICBlbnN1cmUgJ3kgeScsIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiBzYXZlZFRleHRcbiAgICAgICAgICBleHBlY3QoYXRvbS5jbGlwYm9hcmQucmVhZCgpKS50b0JlKHNhdmVkVGV4dClcblxuICAgIGRlc2NyaWJlIFwidmlzdWFsLW1vZGUubGluZXdpc2VcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgMDAwMHwwMFxuICAgICAgICAgICAgMTExMTExXG4gICAgICAgICAgICAyMjIyMjJcXG5cbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICBkZXNjcmliZSBcInNlbGVjdGlvbiBub3QgcmV2ZXJzZWRcIiwgLT5cbiAgICAgICAgaXQgXCJzYXZlcyB0byByZWdpc3Rlcih0eXBlPWxpbmV3aXNlKSwgY3Vyc29yIG1vdmUgdG8gc3RhcnQgb2YgdGFyZ2V0XCIsIC0+XG4gICAgICAgICAgZW5zdXJlIFwiViBqIHlcIixcbiAgICAgICAgICAgIGN1cnNvcjogWzAsIDBdXG4gICAgICAgICAgICByZWdpc3RlcjogJ1wiJzogdGV4dDogXCIwMDAwMDBcXG4xMTExMTFcXG5cIiwgdHlwZTogJ2xpbmV3aXNlJ1xuXG4gICAgICBkZXNjcmliZSBcInNlbGVjdGlvbiBpcyByZXZlcnNlZFwiLCAtPlxuICAgICAgICBpdCBcInNhdmVzIHRvIHJlZ2lzdGVyKHR5cGU9bGluZXdpc2UpLCBjdXJzb3IgZG9lc24ndCBtb3ZlXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzIsIDJdXG4gICAgICAgICAgZW5zdXJlIFwiViBrIHlcIixcbiAgICAgICAgICAgIGN1cnNvcjogWzEsIDJdXG4gICAgICAgICAgICByZWdpc3RlcjogJ1wiJzogdGV4dDogXCIxMTExMTFcXG4yMjIyMjJcXG5cIiwgdHlwZTogJ2xpbmV3aXNlJ1xuXG4gICAgZGVzY3JpYmUgXCJ2aXN1YWwtbW9kZS5ibG9ja3dpc2VcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dENfOiBcIlwiXCJcbiAgICAgICAgICAwMDAwMDBcbiAgICAgICAgICAxITExMTExXG4gICAgICAgICAgMjIyMjIyXG4gICAgICAgICAgMzMzMzMzXG4gICAgICAgICAgNHw0NDQ0NFxuICAgICAgICAgIDU1NTU1NVxcblxuICAgICAgICAgIFwiXCJcIlxuICAgICAgICBlbnN1cmUgXCJjdHJsLXYgbCBsIGpcIixcbiAgICAgICAgICBzZWxlY3RlZFRleHRPcmRlcmVkOiBbXCIxMTFcIiwgXCIyMjJcIiwgXCI0NDRcIiwgXCI1NTVcIl1cbiAgICAgICAgICBtb2RlOiBbJ3Zpc3VhbCcsICdibG9ja3dpc2UnXVxuXG4gICAgICBkZXNjcmliZSBcIndoZW4gc3RheU9uWWFuayA9IGZhbHNlXCIsIC0+XG4gICAgICAgIGl0IFwicGxhY2UgY3Vyc29yIGF0IHN0YXJ0IG9mIGJsb2NrIGFmdGVyIHlhbmtcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgXCJ5XCIsXG4gICAgICAgICAgICBtb2RlOiAnbm9ybWFsJ1xuICAgICAgICAgICAgdGV4dENfOiBcIlwiXCJcbiAgICAgICAgICAgICAgMDAwMDAwXG4gICAgICAgICAgICAgIDEhMTExMTFcbiAgICAgICAgICAgICAgMjIyMjIyXG4gICAgICAgICAgICAgIDMzMzMzM1xuICAgICAgICAgICAgICA0fDQ0NDQ0XG4gICAgICAgICAgICAgIDU1NTU1NVxcblxuICAgICAgICAgICAgICBcIlwiXCJcbiAgICAgIGRlc2NyaWJlIFwid2hlbiBzdGF5T25ZYW5rID0gdHJ1ZVwiLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgc2V0dGluZ3Muc2V0KCdzdGF5T25ZYW5rJywgdHJ1ZSlcbiAgICAgICAgaXQgXCJwbGFjZSBjdXJzb3IgYXQgaGVhZCBvZiBibG9jayBhZnRlciB5YW5rXCIsIC0+XG4gICAgICAgICAgZW5zdXJlIFwieVwiLFxuICAgICAgICAgICAgbW9kZTogJ25vcm1hbCdcbiAgICAgICAgICAgIHRleHRDXzogXCJcIlwiXG4gICAgICAgICAgICAgIDAwMDAwMFxuICAgICAgICAgICAgICAxMTExMTFcbiAgICAgICAgICAgICAgMjIyITIyMlxuICAgICAgICAgICAgICAzMzMzMzNcbiAgICAgICAgICAgICAgNDQ0NDQ0XG4gICAgICAgICAgICAgIDU1NXw1NTVcXG5cbiAgICAgICAgICAgICAgXCJcIlwiXG5cbiAgICBkZXNjcmliZSBcInkgeVwiLCAtPlxuICAgICAgaXQgXCJzYXZlcyB0byByZWdpc3Rlcih0eXBlPWxpbmV3aXNlKSwgY3Vyc29yIHN0YXkgYXQgc2FtZSBwb3NpdGlvblwiLCAtPlxuICAgICAgICBlbnN1cmUgJ3kgeScsXG4gICAgICAgICAgY3Vyc29yOiBbMCwgNF1cbiAgICAgICAgICByZWdpc3RlcjogJ1wiJzogdGV4dDogXCIwMTIgMzQ1XFxuXCIsIHR5cGU6ICdsaW5ld2lzZSdcbiAgICAgIGl0IFwiW04geSB5XSB5YW5rIE4gbGluZSwgc3RhcnRpbmcgZnJvbSB0aGUgY3VycmVudFwiLCAtPlxuICAgICAgICBlbnN1cmUgJ3kgMiB5JyxcbiAgICAgICAgICBjdXJzb3I6IFswLCA0XVxuICAgICAgICAgIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiBcIjAxMiAzNDVcXG5hYmNcXG5cIlxuICAgICAgaXQgXCJbeSBOIHldIHlhbmsgTiBsaW5lLCBzdGFydGluZyBmcm9tIHRoZSBjdXJyZW50XCIsIC0+XG4gICAgICAgIGVuc3VyZSAnMiB5IHknLFxuICAgICAgICAgIGN1cnNvcjogWzAsIDRdXG4gICAgICAgICAgcmVnaXN0ZXI6ICdcIic6IHRleHQ6IFwiMDEyIDM0NVxcbmFiY1xcblwiXG5cbiAgICBkZXNjcmliZSBcIndpdGggYSByZWdpc3RlclwiLCAtPlxuICAgICAgaXQgXCJzYXZlcyB0aGUgbGluZSB0byB0aGUgYSByZWdpc3RlclwiLCAtPlxuICAgICAgICBlbnN1cmUgJ1wiIGEgeSB5JyxcbiAgICAgICAgICByZWdpc3RlcjogYTogdGV4dDogXCIwMTIgMzQ1XFxuXCJcblxuICAgIGRlc2NyaWJlIFwid2l0aCBBIHJlZ2lzdGVyXCIsIC0+XG4gICAgICBpdCBcImFwcGVuZCB0byBleGlzdGluZyB2YWx1ZSBvZiBsb3dlcmNhc2UtbmFtZWQgcmVnaXN0ZXJcIiwgLT5cbiAgICAgICAgZW5zdXJlICdcIiBhIHkgeScsIHJlZ2lzdGVyOiBhOiB0ZXh0OiBcIjAxMiAzNDVcXG5cIlxuICAgICAgICBlbnN1cmUgJ1wiIEEgeSB5JywgcmVnaXN0ZXI6IGE6IHRleHQ6IFwiMDEyIDM0NVxcbjAxMiAzNDVcXG5cIlxuXG4gICAgZGVzY3JpYmUgXCJ3aXRoIGEgbW90aW9uXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldHRpbmdzLnNldCgndXNlQ2xpcGJvYXJkQXNEZWZhdWx0UmVnaXN0ZXInLCBmYWxzZSlcblxuICAgICAgaXQgXCJ5YW5rIGZyb20gaGVyZSB0byBkZXN0bmF0aW9uIG9mIG1vdGlvblwiLCAtPlxuICAgICAgICBlbnN1cmUgJ3kgZScsIGN1cnNvcjogWzAsIDRdLCByZWdpc3RlcjogeydcIic6IHRleHQ6ICczNDUnfVxuXG4gICAgICBpdCBcImRvZXMgbm90IHlhbmsgd2hlbiBtb3Rpb24gZmFpbGVkXCIsIC0+XG4gICAgICAgIGVuc3VyZSAneSB0IHgnLCByZWdpc3RlcjogeydcIic6IHRleHQ6IHVuZGVmaW5lZH1cblxuICAgICAgaXQgXCJ5YW5rIGFuZCBtb3ZlIGN1cnNvciB0byBzdGFydCBvZiB0YXJnZXRcIiwgLT5cbiAgICAgICAgZW5zdXJlICd5IGgnLFxuICAgICAgICAgIGN1cnNvcjogWzAsIDNdXG4gICAgICAgICAgcmVnaXN0ZXI6ICdcIic6IHRleHQ6ICcgJ1xuXG4gICAgICBpdCBcIlt3aXRoIGxpbmV3aXNlIG1vdGlvbl0geWFuayBhbmQgZGVzbid0IG1vdmUgY3Vyc29yXCIsIC0+XG4gICAgICAgIGVuc3VyZSAneSBqJyxcbiAgICAgICAgICBjdXJzb3I6IFswLCA0XVxuICAgICAgICAgIHJlZ2lzdGVyOiB7J1wiJzogdGV4dDogXCIwMTIgMzQ1XFxuYWJjXFxuXCIsIHR5cGU6ICdsaW5ld2lzZSd9XG5cbiAgICBkZXNjcmliZSBcIndpdGggYSB0ZXh0LW9ialwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICBjdXJzb3I6IFsyLCA4XVxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuXG4gICAgICAgICAgMXN0IHBhcmFncmFwaFxuICAgICAgICAgIDFzdCBwYXJhZ3JhcGhcblxuICAgICAgICAgIDJuIHBhcmFncmFwaFxuICAgICAgICAgIDJuIHBhcmFncmFwaFxcblxuICAgICAgICAgIFwiXCJcIlxuICAgICAgaXQgXCJpbm5lci13b3JkIGFuZCBtb3ZlIGN1cnNvciB0byBzdGFydCBvZiB0YXJnZXRcIiwgLT5cbiAgICAgICAgZW5zdXJlICd5IGkgdycsXG4gICAgICAgICAgcmVnaXN0ZXI6ICdcIic6IHRleHQ6IFwicGFyYWdyYXBoXCJcbiAgICAgICAgICBjdXJzb3I6IFsyLCA0XVxuXG4gICAgICBpdCBcInlhbmsgdGV4dC1vYmplY3QgaW5uZXItcGFyYWdyYXBoIGFuZCBtb3ZlIGN1cnNvciB0byBzdGFydCBvZiB0YXJnZXRcIiwgLT5cbiAgICAgICAgZW5zdXJlICd5IGkgcCcsXG4gICAgICAgICAgY3Vyc29yOiBbMSwgMF1cbiAgICAgICAgICByZWdpc3RlcjogJ1wiJzogdGV4dDogXCIxc3QgcGFyYWdyYXBoXFxuMXN0IHBhcmFncmFwaFxcblwiXG5cbiAgICBkZXNjcmliZSBcIndoZW4gZm9sbG93ZWQgYnkgYSBHXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIG9yaWdpbmFsVGV4dCA9IFwiXCJcIlxuICAgICAgICAxMjM0NVxuICAgICAgICBhYmNkZVxuICAgICAgICBBQkNERVxcblxuICAgICAgICBcIlwiXCJcbiAgICAgICAgc2V0IHRleHQ6IG9yaWdpbmFsVGV4dFxuXG4gICAgICBpdCBcInlhbmsgYW5kIGRvZXNuJ3QgbW92ZSBjdXJzb3JcIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzEsIDBdXG4gICAgICAgIGVuc3VyZSAneSBHJyxcbiAgICAgICAgICByZWdpc3RlcjogeydcIic6IHRleHQ6IFwiYWJjZGVcXG5BQkNERVxcblwiLCB0eXBlOiAnbGluZXdpc2UnfVxuICAgICAgICAgIGN1cnNvcjogWzEsIDBdXG5cbiAgICAgIGl0IFwieWFuayBhbmQgZG9lc24ndCBtb3ZlIGN1cnNvclwiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMSwgMl1cbiAgICAgICAgZW5zdXJlICd5IEcnLFxuICAgICAgICAgIHJlZ2lzdGVyOiB7J1wiJzogdGV4dDogXCJhYmNkZVxcbkFCQ0RFXFxuXCIsIHR5cGU6ICdsaW5ld2lzZSd9XG4gICAgICAgICAgY3Vyc29yOiBbMSwgMl1cblxuICAgIGRlc2NyaWJlIFwid2hlbiBmb2xsb3dlZCBieSBhIGdvdG8gbGluZSBHXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIG9yaWdpbmFsVGV4dCA9IFwiMTIzNDVcXG5hYmNkZVxcbkFCQ0RFXCJcbiAgICAgICAgc2V0IHRleHQ6IG9yaWdpbmFsVGV4dFxuXG4gICAgICBkZXNjcmliZSBcIm9uIHRoZSBiZWdpbm5pbmcgb2YgdGhlIHNlY29uZCBsaW5lXCIsIC0+XG4gICAgICAgIGl0IFwiZGVsZXRlcyB0aGUgYm90dG9tIHR3byBsaW5lc1wiLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFsxLCAwXVxuICAgICAgICAgIGVuc3VyZSAneSAyIEcgUCcsIHRleHQ6ICcxMjM0NVxcbmFiY2RlXFxuYWJjZGVcXG5BQkNERSdcblxuICAgICAgZGVzY3JpYmUgXCJvbiB0aGUgbWlkZGxlIG9mIHRoZSBzZWNvbmQgbGluZVwiLCAtPlxuICAgICAgICBpdCBcImRlbGV0ZXMgdGhlIGJvdHRvbSB0d28gbGluZXNcIiwgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMSwgMl1cbiAgICAgICAgICBlbnN1cmUgJ3kgMiBHIFAnLCB0ZXh0OiAnMTIzNDVcXG5hYmNkZVxcbmFiY2RlXFxuQUJDREUnXG5cbiAgICBkZXNjcmliZSBcIndpdGggbXVsdGlwbGUgY3Vyc29yc1wiLCAtPlxuICAgICAgaXQgXCJtb3ZlcyBlYWNoIGN1cnNvciBhbmQgY29waWVzIHRoZSBsYXN0IHNlbGVjdGlvbidzIHRleHRcIiwgLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dDogXCIgIGFiY2RcXG4gIDEyMzRcIlxuICAgICAgICAgIGN1cnNvcjogW1swLCAwXSwgWzEsIDVdXVxuICAgICAgICBlbnN1cmUgJ3kgXicsXG4gICAgICAgICAgcmVnaXN0ZXI6ICdcIic6IHRleHQ6ICcxMjMnXG4gICAgICAgICAgY3Vyc29yOiBbWzAsIDBdLCBbMSwgMl1dXG5cbiAgICBkZXNjcmliZSBcInN0YXlPbllhbmsgc2V0dGluZ1wiLCAtPlxuICAgICAgdGV4dCA9IG51bGxcbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0dGluZ3Muc2V0KCdzdGF5T25ZYW5rJywgdHJ1ZSlcblxuICAgICAgICB0ZXh0ID0gbmV3IFRleHREYXRhIFwiXCJcIlxuICAgICAgICAgIDBfMjM0NTY3XG4gICAgICAgICAgMV8yMzQ1NjdcbiAgICAgICAgICAyXzIzNDU2N1xuXG4gICAgICAgICAgNF8yMzQ1NjdcXG5cbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgc2V0IHRleHQ6IHRleHQuZ2V0UmF3KCksIGN1cnNvcjogWzEsIDJdXG5cbiAgICAgIGl0IFwiZG9uJ3QgbW92ZSBjdXJzb3IgYWZ0ZXIgeWFuayBmcm9tIG5vcm1hbC1tb2RlXCIsIC0+XG4gICAgICAgIGVuc3VyZSBcInkgaSBwXCIsIGN1cnNvcjogWzEsIDJdLCByZWdpc3RlcjogJ1wiJzogdGV4dDogdGV4dC5nZXRMaW5lcyhbMC4uMl0pXG4gICAgICAgIGVuc3VyZSBcImogeSB5XCIsIGN1cnNvcjogWzIsIDJdLCByZWdpc3RlcjogJ1wiJzogdGV4dDogdGV4dC5nZXRMaW5lcyhbMl0pXG4gICAgICAgIGVuc3VyZSBcImsgLlwiLCBjdXJzb3I6IFsxLCAyXSwgcmVnaXN0ZXI6ICdcIic6IHRleHQ6IHRleHQuZ2V0TGluZXMoWzFdKVxuICAgICAgICBlbnN1cmUgXCJ5IGhcIiwgY3Vyc29yOiBbMSwgMl0sIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiBcIl9cIlxuICAgICAgICBlbnN1cmUgXCJ5IGJcIiwgY3Vyc29yOiBbMSwgMl0sIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiBcIjFfXCJcblxuICAgICAgaXQgXCJkb24ndCBtb3ZlIGN1cnNvciBhZnRlciB5YW5rIGZyb20gdmlzdWFsLWxpbmV3aXNlXCIsIC0+XG4gICAgICAgIGVuc3VyZSBcIlYgeVwiLCBjdXJzb3I6IFsxLCAyXSwgcmVnaXN0ZXI6ICdcIic6IHRleHQ6IHRleHQuZ2V0TGluZXMoWzFdKVxuICAgICAgICBlbnN1cmUgXCJWIGogeVwiLCBjdXJzb3I6IFsyLCAyXSwgcmVnaXN0ZXI6ICdcIic6IHRleHQ6IHRleHQuZ2V0TGluZXMoWzEuLjJdKVxuXG4gICAgICBpdCBcImRvbid0IG1vdmUgY3Vyc29yIGFmdGVyIHlhbmsgZnJvbSB2aXN1YWwtY2hhcmFjdGVyd2lzZVwiLCAtPlxuICAgICAgICBlbnN1cmUgXCJ2IGwgbCB5XCIsIGN1cnNvcjogWzEsIDRdLCByZWdpc3RlcjogJ1wiJzogdGV4dDogXCIyMzRcIlxuICAgICAgICBlbnN1cmUgXCJ2IGggaCB5XCIsIGN1cnNvcjogWzEsIDJdLCByZWdpc3RlcjogJ1wiJzogdGV4dDogXCIyMzRcIlxuICAgICAgICBlbnN1cmUgXCJ2IGogeVwiLCBjdXJzb3I6IFsyLCAyXSwgcmVnaXN0ZXI6ICdcIic6IHRleHQ6IFwiMjM0NTY3XFxuMl8yXCJcbiAgICAgICAgZW5zdXJlIFwidiAyIGsgeVwiLCBjdXJzb3I6IFswLCAyXSwgcmVnaXN0ZXI6ICdcIic6IHRleHQ6IFwiMjM0NTY3XFxuMV8yMzQ1NjdcXG4yXzJcIlxuXG4gIGRlc2NyaWJlIFwidGhlIHl5IGtleWJpbmRpbmdcIiwgLT5cbiAgICBkZXNjcmliZSBcIm9uIGEgc2luZ2xlIGxpbmUgZmlsZVwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXQgdGV4dDogXCJleGNsYW1hdGlvbiFcXG5cIiwgY3Vyc29yOiBbMCwgMF1cblxuICAgICAgaXQgXCJjb3BpZXMgdGhlIGVudGlyZSBsaW5lIGFuZCBwYXN0ZXMgaXQgY29ycmVjdGx5XCIsIC0+XG4gICAgICAgIGVuc3VyZSAneSB5IHAnLFxuICAgICAgICAgIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiBcImV4Y2xhbWF0aW9uIVxcblwiXG4gICAgICAgICAgdGV4dDogXCJleGNsYW1hdGlvbiFcXG5leGNsYW1hdGlvbiFcXG5cIlxuXG4gICAgZGVzY3JpYmUgXCJvbiBhIHNpbmdsZSBsaW5lIGZpbGUgd2l0aCBubyBuZXdsaW5lXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldCB0ZXh0OiBcIm5vIG5ld2xpbmUhXCIsIGN1cnNvcjogWzAsIDBdXG5cbiAgICAgIGl0IFwiY29waWVzIHRoZSBlbnRpcmUgbGluZSBhbmQgcGFzdGVzIGl0IGNvcnJlY3RseVwiLCAtPlxuICAgICAgICBlbnN1cmUgJ3kgeSBwJyxcbiAgICAgICAgICByZWdpc3RlcjogJ1wiJzogdGV4dDogXCJubyBuZXdsaW5lIVxcblwiXG4gICAgICAgICAgdGV4dDogXCJubyBuZXdsaW5lIVxcbm5vIG5ld2xpbmUhXFxuXCJcblxuICAgICAgaXQgXCJjb3BpZXMgdGhlIGVudGlyZSBsaW5lIGFuZCBwYXN0ZXMgaXQgcmVzcGVjdGluZyBjb3VudCBhbmQgbmV3IGxpbmVzXCIsIC0+XG4gICAgICAgIGVuc3VyZSAneSB5IDIgcCcsXG4gICAgICAgICAgcmVnaXN0ZXI6ICdcIic6IHRleHQ6IFwibm8gbmV3bGluZSFcXG5cIlxuICAgICAgICAgIHRleHQ6IFwibm8gbmV3bGluZSFcXG5ubyBuZXdsaW5lIVxcbm5vIG5ld2xpbmUhXFxuXCJcblxuICBkZXNjcmliZSBcInRoZSBZIGtleWJpbmRpbmdcIiwgLT5cbiAgICB0ZXh0ID0gbnVsbFxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHRleHQgPSBcIlwiXCJcbiAgICAgIDAxMiAzNDVcbiAgICAgIGFiY1xcblxuICAgICAgXCJcIlwiXG4gICAgICBzZXQgdGV4dDogdGV4dCwgY3Vyc29yOiBbMCwgNF1cblxuICAgIGl0IFwic2F2ZXMgdGhlIGxpbmUgdG8gdGhlIGRlZmF1bHQgcmVnaXN0ZXJcIiwgLT5cbiAgICAgIGVuc3VyZSAnWScsIGN1cnNvcjogWzAsIDRdLCByZWdpc3RlcjogJ1wiJzogdGV4dDogXCIwMTIgMzQ1XFxuXCJcblxuICAgIGl0IFwieWFuayB0aGUgd2hvbGUgbGluZXMgdG8gdGhlIGRlZmF1bHQgcmVnaXN0ZXJcIiwgLT5cbiAgICAgIGVuc3VyZSAndiBqIFknLCBjdXJzb3I6IFswLCAwXSwgcmVnaXN0ZXI6ICdcIic6IHRleHQ6IHRleHRcblxuICBkZXNjcmliZSBcInRoZSBwIGtleWJpbmRpbmdcIiwgLT5cbiAgICBkZXNjcmliZSBcIndpdGggc2luZ2xlIGxpbmUgY2hhcmFjdGVyIGNvbnRlbnRzXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldHRpbmdzLnNldCgndXNlQ2xpcGJvYXJkQXNEZWZhdWx0UmVnaXN0ZXInLCBmYWxzZSlcblxuICAgICAgICBzZXQgdGV4dEM6IFwifDAxMlxcblwiXG4gICAgICAgIHNldCByZWdpc3RlcjogJ1wiJzogdGV4dDogJzM0NSdcbiAgICAgICAgc2V0IHJlZ2lzdGVyOiAnYSc6IHRleHQ6ICdhJ1xuICAgICAgICBhdG9tLmNsaXBib2FyZC53cml0ZShcImNsaXBcIilcblxuICAgICAgZGVzY3JpYmUgXCJmcm9tIHRoZSBkZWZhdWx0IHJlZ2lzdGVyXCIsIC0+XG4gICAgICAgIGl0IFwiaW5zZXJ0cyB0aGUgY29udGVudHNcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgXCJwXCIsIHRleHRDOiBcIjAzNHw1MTJcXG5cIlxuXG4gICAgICBkZXNjcmliZSBcImF0IHRoZSBlbmQgb2YgYSBsaW5lXCIsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBzZXQgdGV4dEM6IFwiMDF8MlxcblwiXG4gICAgICAgIGl0IFwicG9zaXRpb25zIGN1cnNvciBjb3JyZWN0bHlcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgXCJwXCIsIHRleHRDOiBcIjAxMjM0fDVcXG5cIlxuXG4gICAgICBkZXNjcmliZSBcInBhc3RlIHRvIGVtcHR5IGxpbmVcIiwgLT5cbiAgICAgICAgaXQgXCJwYXN0ZSBjb250ZW50IHRvIHRoYXQgZW1wdHkgbGluZVwiLCAtPlxuICAgICAgICAgIHNldFxuICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgMXN0XG4gICAgICAgICAgICB8XG4gICAgICAgICAgICAzcmRcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgcmVnaXN0ZXI6ICdcIic6IHRleHQ6ICcybmQnXG5cbiAgICAgICAgICBlbnN1cmUgJ3AnLFxuICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgMXN0XG4gICAgICAgICAgICAybnxkXG4gICAgICAgICAgICAzcmRcbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICBkZXNjcmliZSBcIndoZW4gdXNlQ2xpcGJvYXJkQXNEZWZhdWx0UmVnaXN0ZXIgZW5hYmxlZFwiLCAtPlxuICAgICAgICBpdCBcImluc2VydHMgY29udGVudHMgZnJvbSBjbGlwYm9hcmRcIiwgLT5cbiAgICAgICAgICBzZXR0aW5ncy5zZXQoJ3VzZUNsaXBib2FyZEFzRGVmYXVsdFJlZ2lzdGVyJywgdHJ1ZSlcbiAgICAgICAgICBlbnN1cmUgJ3AnLCB0ZXh0QzogXCIwY2xpfHAxMlxcblwiXG5cbiAgICAgIGRlc2NyaWJlIFwiZnJvbSBhIHNwZWNpZmllZCByZWdpc3RlclwiLCAtPlxuICAgICAgICBpdCBcImluc2VydHMgdGhlIGNvbnRlbnRzIG9mIHRoZSAnYScgcmVnaXN0ZXJcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJ1wiIGEgcCcsIHRleHRDOiBcIjB8YTEyXFxuXCIsXG5cbiAgICAgIGRlc2NyaWJlIFwiYXQgdGhlIGVuZCBvZiBhIGxpbmVcIiwgLT5cbiAgICAgICAgaXQgXCJpbnNlcnRzIGJlZm9yZSB0aGUgY3VycmVudCBsaW5lJ3MgbmV3bGluZVwiLCAtPlxuICAgICAgICAgIHNldFxuICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgYWJjZGVcbiAgICAgICAgICAgIG9uZSB8dHdvIHRocmVlXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICBlbnN1cmUgJ2QgJCBrICQgcCcsXG4gICAgICAgICAgICB0ZXh0Q186IFwiXCJcIlxuICAgICAgICAgICAgYWJjZGV0d28gdGhyZXxlXG4gICAgICAgICAgICBvbmVfXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgIGRlc2NyaWJlIFwid2l0aCBtdWx0aWxpbmUgY2hhcmFjdGVyIGNvbnRlbnRzXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldCB0ZXh0QzogXCJ8MDEyXFxuXCJcbiAgICAgICAgc2V0IHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiAnMzQ1XFxuNjc4J1xuXG4gICAgICBpdCBcInAgcGxhY2UgY3Vyc29yIGF0IHN0YXJ0IG9mIG11dGF0aW9uXCIsIC0+IGVuc3VyZSBcInBcIiwgdGV4dEM6IFwiMHwzNDVcXG42NzgxMlxcblwiXG4gICAgICBpdCBcIlAgcGxhY2UgY3Vyc29yIGF0IHN0YXJ0IG9mIG11dGF0aW9uXCIsIC0+IGVuc3VyZSBcIlBcIiwgdGV4dEM6IFwifDM0NVxcbjY3ODAxMlxcblwiXG5cbiAgICBkZXNjcmliZSBcIndpdGggbGluZXdpc2UgY29udGVudHNcIiwgLT5cbiAgICAgIGRlc2NyaWJlIFwib24gYSBzaW5nbGUgbGluZVwiLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgc2V0XG4gICAgICAgICAgICB0ZXh0QzogJzB8MTInXG4gICAgICAgICAgICByZWdpc3RlcjogJ1wiJzoge3RleHQ6IFwiIDM0NVxcblwiLCB0eXBlOiAnbGluZXdpc2UnfVxuXG4gICAgICAgIGl0IFwiaW5zZXJ0cyB0aGUgY29udGVudHMgb2YgdGhlIGRlZmF1bHQgcmVnaXN0ZXJcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJ3AnLFxuICAgICAgICAgICAgdGV4dENfOiBcIlwiXCJcbiAgICAgICAgICAgIDAxMlxuICAgICAgICAgICAgX3wzNDVcXG5cbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGl0IFwicmVwbGFjZXMgdGhlIGN1cnJlbnQgc2VsZWN0aW9uIGFuZCBwdXQgY3Vyc29yIHRvIHRoZSBmaXJzdCBjaGFyIG9mIGxpbmVcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJ3YgcCcsICMgJzEnIHdhcyByZXBsYWNlZFxuICAgICAgICAgICAgdGV4dENfOiBcIlwiXCJcbiAgICAgICAgICAgIDBcbiAgICAgICAgICAgIF98MzQ1XG4gICAgICAgICAgICAyXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgZGVzY3JpYmUgXCJvbiBtdWx0aXBsZSBsaW5lc1wiLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgc2V0XG4gICAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIDAxMlxuICAgICAgICAgICAgIDM0NVxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICByZWdpc3RlcjogJ1wiJzoge3RleHQ6IFwiIDQ1NlxcblwiLCB0eXBlOiAnbGluZXdpc2UnfVxuXG4gICAgICAgIGl0IFwiaW5zZXJ0cyB0aGUgY29udGVudHMgb2YgdGhlIGRlZmF1bHQgcmVnaXN0ZXIgYXQgbWlkZGxlIGxpbmVcIiwgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMV1cbiAgICAgICAgICBlbnN1cmUgXCJwXCIsXG4gICAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICAwMTJcbiAgICAgICAgICAgICB8NDU2XG4gICAgICAgICAgICAgMzQ1XG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBpdCBcImluc2VydHMgdGhlIGNvbnRlbnRzIG9mIHRoZSBkZWZhdWx0IHJlZ2lzdGVyIGF0IGVuZCBvZiBsaW5lXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzEsIDFdXG4gICAgICAgICAgZW5zdXJlICdwJyxcbiAgICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAgIDAxMlxuICAgICAgICAgICAgIDM0NVxuICAgICAgICAgICAgIHw0NTZcXG5cbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgZGVzY3JpYmUgXCJ3aXRoIG11bHRpcGxlIGxpbmV3aXNlIGNvbnRlbnRzXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAwMTJcbiAgICAgICAgICB8YWJjXG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgcmVnaXN0ZXI6ICdcIic6IHt0ZXh0OiBcIiAzNDVcXG4gNjc4XFxuXCIsIHR5cGU6ICdsaW5ld2lzZSd9XG5cbiAgICAgIGl0IFwiaW5zZXJ0cyB0aGUgY29udGVudHMgb2YgdGhlIGRlZmF1bHQgcmVnaXN0ZXJcIiwgLT5cbiAgICAgICAgZW5zdXJlICdwJyxcbiAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgMDEyXG4gICAgICAgICAgYWJjXG4gICAgICAgICAgIHwzNDVcbiAgICAgICAgICAgNjc4XFxuXG4gICAgICAgICAgXCJcIlwiXG5cbiAgICBkZXNjcmliZSBcInB1dC1hZnRlci13aXRoLWF1dG8taW5kZW50IGNvbW1hbmRcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICAgICAgc2V0dGluZ3Muc2V0KCd1c2VDbGlwYm9hcmRBc0RlZmF1bHRSZWdpc3RlcicsIGZhbHNlKVxuICAgICAgICAgIGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKCdsYW5ndWFnZS1qYXZhc2NyaXB0JylcbiAgICAgICAgcnVucyAtPlxuICAgICAgICAgIHNldCBncmFtbWFyOiAnc291cmNlLmpzJ1xuXG4gICAgICBkZXNjcmliZSBcInBhc3RlIHdpdGggYXV0by1pbmRlbnRcIiwgLT5cbiAgICAgICAgaXQgXCJpbnNlcnRzIHRoZSBjb250ZW50cyBvZiB0aGUgZGVmYXVsdCByZWdpc3RlclwiLCAtPlxuICAgICAgICAgIHNldFxuICAgICAgICAgICAgcmVnaXN0ZXI6ICdcIic6IHt0ZXh0OiBcIiAzNDVcXG5cIiwgdHlwZTogJ2xpbmV3aXNlJ31cbiAgICAgICAgICAgIHRleHRDXzogXCJcIlwiXG4gICAgICAgICAgICBpZnwgKCkge1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgZW5zdXJlQnlEaXNwYXRjaCAndmltLW1vZGUtcGx1czpwdXQtYWZ0ZXItd2l0aC1hdXRvLWluZGVudCcsXG4gICAgICAgICAgICB0ZXh0Q186IFwiXCJcIlxuICAgICAgICAgICAgaWYgKCkge1xuICAgICAgICAgICAgICB8MzQ1XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBpdCBcIm11bHRpLWxpbmUgcmVnaXN0ZXIgY29udGVudHMgd2l0aCBhdXRvIGluZGVudFwiLCAtPlxuICAgICAgICAgIHJlZ2lzdGVyQ29udGVudCA9IFwiXCJcIlxuICAgICAgICAgICAgaWYoMykge1xuICAgICAgICAgICAgICBpZig0KSB7fVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgc2V0XG4gICAgICAgICAgICByZWdpc3RlcjogJ1wiJzoge3RleHQ6IHJlZ2lzdGVyQ29udGVudCwgdHlwZTogJ2xpbmV3aXNlJ31cbiAgICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAgIGlmICgxKSB7XG4gICAgICAgICAgICAgIHxpZiAoMikge1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICBlbnN1cmVCeURpc3BhdGNoICd2aW0tbW9kZS1wbHVzOnB1dC1hZnRlci13aXRoLWF1dG8taW5kZW50JyxcbiAgICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAgIGlmICgxKSB7XG4gICAgICAgICAgICAgIGlmICgyKSB7XG4gICAgICAgICAgICAgICAgfGlmKDMpIHtcbiAgICAgICAgICAgICAgICAgIGlmKDQpIHt9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgZGVzY3JpYmUgXCJ3aGVuIHBhc3RpbmcgYWxyZWFkeSBpbmRlbnRlZCBtdWx0aS1saW5lcyByZWdpc3RlciBjb250ZW50XCIsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBzZXRcbiAgICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAgIGlmICgxKSB7XG4gICAgICAgICAgICAgIHxpZiAoMikge1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBpdCBcImtlZXAgb3JpZ2luYWwgbGF5b3V0XCIsIC0+XG4gICAgICAgICAgcmVnaXN0ZXJDb250ZW50ID0gXCJcIlwiXG4gICAgICAgICAgICAgICBhOiAxMjMsXG4gICAgICAgICAgICBiYmJiOiA0NTYsXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICAgIHNldCByZWdpc3RlcjogJ1wiJzoge3RleHQ6IHJlZ2lzdGVyQ29udGVudCwgdHlwZTogJ2xpbmV3aXNlJ31cbiAgICAgICAgICBlbnN1cmVCeURpc3BhdGNoICd2aW0tbW9kZS1wbHVzOnB1dC1hZnRlci13aXRoLWF1dG8taW5kZW50JyxcbiAgICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAgIGlmICgxKSB7XG4gICAgICAgICAgICAgIGlmICgyKSB7XG4gICAgICAgICAgICAgICAgICAgfGE6IDEyMyxcbiAgICAgICAgICAgICAgICBiYmJiOiA0NTYsXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGl0IFwia2VlcCBvcmlnaW5hbCBsYXlvdXQgW3JlZ2lzdGVyIGNvbnRlbnQgaGF2ZSBibGFuayByb3ddXCIsIC0+XG4gICAgICAgICAgcmVnaXN0ZXJDb250ZW50ID0gXCJcIlwiXG4gICAgICAgICAgICBpZigzKSB7XG4gICAgICAgICAgICBfX2FiY1xuXG4gICAgICAgICAgICBfX2RlZlxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXCJcIlwiLnJlcGxhY2UoL18vZywgJyAnKVxuXG4gICAgICAgICAgc2V0IHJlZ2lzdGVyOiAnXCInOiB7dGV4dDogcmVnaXN0ZXJDb250ZW50LCB0eXBlOiAnbGluZXdpc2UnfVxuICAgICAgICAgIGVuc3VyZUJ5RGlzcGF0Y2ggJ3ZpbS1tb2RlLXBsdXM6cHV0LWFmdGVyLXdpdGgtYXV0by1pbmRlbnQnLFxuICAgICAgICAgICAgdGV4dENfOiBcIlwiXCJcbiAgICAgICAgICAgIGlmICgxKSB7XG4gICAgICAgICAgICAgIGlmICgyKSB7XG4gICAgICAgICAgICAgICAgfGlmKDMpIHtcbiAgICAgICAgICAgICAgICAgIGFiY1xuXG4gICAgICAgICAgICAgICAgICBkZWZcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICMgSEVSRVxuICAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5cbiAgICBkZXNjcmliZSBcInBhc3RpbmcgdHdpY2VcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dDogXCIxMjM0NVxcbmFiY2RlXFxuQUJDREVcXG5RV0VSVFwiXG4gICAgICAgICAgY3Vyc29yOiBbMSwgMV1cbiAgICAgICAgICByZWdpc3RlcjogJ1wiJzogdGV4dDogJzEyMydcbiAgICAgICAga2V5c3Ryb2tlICcyIHAnXG5cbiAgICAgIGl0IFwiaW5zZXJ0cyB0aGUgc2FtZSBsaW5lIHR3aWNlXCIsIC0+XG4gICAgICAgIGVuc3VyZSB0ZXh0OiBcIjEyMzQ1XFxuYWIxMjMxMjNjZGVcXG5BQkNERVxcblFXRVJUXCJcblxuICAgICAgZGVzY3JpYmUgXCJ3aGVuIHVuZG9uZVwiLCAtPlxuICAgICAgICBpdCBcInJlbW92ZXMgYm90aCBsaW5lc1wiLCAtPlxuICAgICAgICAgIGVuc3VyZSAndScsIHRleHQ6IFwiMTIzNDVcXG5hYmNkZVxcbkFCQ0RFXFxuUVdFUlRcIlxuXG4gICAgZGVzY3JpYmUgXCJzdXBwb3J0IG11bHRpcGxlIGN1cnNvcnNcIiwgLT5cbiAgICAgIGl0IFwicGFzdGUgdGV4dCBmb3IgZWFjaCBjdXJzb3JzXCIsIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHQ6IFwiMTIzNDVcXG5hYmNkZVxcbkFCQ0RFXFxuUVdFUlRcIlxuICAgICAgICAgIGN1cnNvcjogW1sxLCAwXSwgWzIsIDBdXVxuICAgICAgICAgIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiAnWlpaJ1xuICAgICAgICBlbnN1cmUgJ3AnLFxuICAgICAgICAgIHRleHQ6IFwiMTIzNDVcXG5hWlpaYmNkZVxcbkFaWlpCQ0RFXFxuUVdFUlRcIlxuICAgICAgICAgIGN1cnNvcjogW1sxLCAzXSwgWzIsIDNdXVxuXG4gICAgZGVzY3JpYmUgXCJ3aXRoIGEgc2VsZWN0aW9uXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHQ6ICcwMTJcXG4nXG4gICAgICAgICAgY3Vyc29yOiBbMCwgMV1cbiAgICAgIGRlc2NyaWJlIFwid2l0aCBjaGFyYWN0ZXJ3aXNlIHNlbGVjdGlvblwiLCAtPlxuICAgICAgICBpdCBcInJlcGxhY2VzIHNlbGVjdGlvbiB3aXRoIGNoYXJ3aXNlIGNvbnRlbnRcIiwgLT5cbiAgICAgICAgICBzZXQgcmVnaXN0ZXI6ICdcIic6IHRleHQ6IFwiMzQ1XCJcbiAgICAgICAgICBlbnN1cmUgJ3YgcCcsIHRleHQ6IFwiMDM0NTJcXG5cIiwgY3Vyc29yOiBbMCwgM11cbiAgICAgICAgaXQgXCJyZXBsYWNlcyBzZWxlY3Rpb24gd2l0aCBsaW5ld2lzZSBjb250ZW50XCIsIC0+XG4gICAgICAgICAgc2V0IHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiBcIjM0NVxcblwiXG4gICAgICAgICAgZW5zdXJlICd2IHAnLCB0ZXh0OiBcIjBcXG4zNDVcXG4yXFxuXCIsIGN1cnNvcjogWzEsIDBdXG5cbiAgICAgIGRlc2NyaWJlIFwid2l0aCBsaW5ld2lzZSBzZWxlY3Rpb25cIiwgLT5cbiAgICAgICAgaXQgXCJyZXBsYWNlcyBzZWxlY3Rpb24gd2l0aCBjaGFyd2lzZSBjb250ZW50XCIsIC0+XG4gICAgICAgICAgc2V0IHRleHQ6IFwiMDEyXFxuYWJjXCIsIGN1cnNvcjogWzAsIDFdXG4gICAgICAgICAgc2V0IHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiBcIjM0NVwiXG4gICAgICAgICAgZW5zdXJlICdWIHAnLCB0ZXh0OiBcIjM0NVxcbmFiY1wiLCBjdXJzb3I6IFswLCAwXVxuICAgICAgICBpdCBcInJlcGxhY2VzIHNlbGVjdGlvbiB3aXRoIGxpbmV3aXNlIGNvbnRlbnRcIiwgLT5cbiAgICAgICAgICBzZXQgcmVnaXN0ZXI6ICdcIic6IHRleHQ6IFwiMzQ1XFxuXCJcbiAgICAgICAgICBlbnN1cmUgJ1YgcCcsIHRleHQ6IFwiMzQ1XFxuXCIsIGN1cnNvcjogWzAsIDBdXG5cbiAgZGVzY3JpYmUgXCJ0aGUgUCBrZXliaW5kaW5nXCIsIC0+XG4gICAgZGVzY3JpYmUgXCJ3aXRoIGNoYXJhY3RlciBjb250ZW50c1wiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXQgdGV4dDogXCIwMTJcXG5cIiwgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgc2V0IHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiAnMzQ1J1xuICAgICAgICBzZXQgcmVnaXN0ZXI6IGE6IHRleHQ6ICdhJ1xuICAgICAgICBrZXlzdHJva2UgJ1AnXG5cbiAgICAgIGl0IFwiaW5zZXJ0cyB0aGUgY29udGVudHMgb2YgdGhlIGRlZmF1bHQgcmVnaXN0ZXIgYWJvdmVcIiwgLT5cbiAgICAgICAgZW5zdXJlIHRleHQ6IFwiMzQ1MDEyXFxuXCIsIGN1cnNvcjogWzAsIDJdXG5cbiAgZGVzY3JpYmUgXCJ0aGUgLiBrZXliaW5kaW5nXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2V0IHRleHQ6IFwiMTJcXG4zNFxcbjU2XFxuNzhcIiwgY3Vyc29yOiBbMCwgMF1cblxuICAgIGl0IFwicmVwZWF0cyB0aGUgbGFzdCBvcGVyYXRpb25cIiwgLT5cbiAgICAgIGVuc3VyZSAnMiBkIGQgLicsIHRleHQ6IFwiXCJcblxuICAgIGl0IFwiY29tcG9zZXMgd2l0aCBtb3Rpb25zXCIsIC0+XG4gICAgICBlbnN1cmUgJ2QgZCAyIC4nLCB0ZXh0OiBcIjc4XCJcblxuICBkZXNjcmliZSBcInRoZSByIGtleWJpbmRpbmdcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXRcbiAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgIDEyXG4gICAgICAgIDM0XG4gICAgICAgIFxcblxuICAgICAgICBcIlwiXCJcbiAgICAgICAgY3Vyc29yOiBbWzAsIDBdLCBbMSwgMF1dXG5cbiAgICBpdCBcInJlcGxhY2VzIGEgc2luZ2xlIGNoYXJhY3RlclwiLCAtPlxuICAgICAgZW5zdXJlICdyIHgnLCB0ZXh0OiAneDJcXG54NFxcblxcbidcblxuICAgIGl0IFwicmVtYWluIHZpc3VhbC1tb2RlIHdoZW4gY2FuY2VsbGVkXCIsIC0+XG4gICAgICBlbnN1cmUgJ3YgciBlc2NhcGUnLFxuICAgICAgICB0ZXh0OiAnMTJcXG4zNFxcblxcbidcbiAgICAgICAgbW9kZTogWyd2aXN1YWwnLCAnY2hhcmFjdGVyd2lzZSddXG5cbiAgICBpdCBcInJlcGxhY2VzIGEgc2luZ2xlIGNoYXJhY3RlciB3aXRoIGEgbGluZSBicmVha1wiLCAtPlxuICAgICAgZW5zdXJlICdyIGVudGVyJyxcbiAgICAgICAgdGV4dDogJ1xcbjJcXG5cXG40XFxuXFxuJ1xuICAgICAgICBjdXJzb3I6IFtbMSwgMF0sIFszLCAwXV1cblxuICAgIGl0IFwiYXV0byBpbmRlbnQgd2hlbiByZXBsYWNlZCB3aXRoIHNpbmdlIG5ldyBsaW5lXCIsIC0+XG4gICAgICBzZXRcbiAgICAgICAgdGV4dENfOiBcIlwiXCJcbiAgICAgICAgX19hfGJjXG4gICAgICAgIFwiXCJcIlxuICAgICAgZW5zdXJlICdyIGVudGVyJyxcbiAgICAgICAgdGV4dENfOiBcIlwiXCJcbiAgICAgICAgX19hXG4gICAgICAgIF9ffGNcbiAgICAgICAgXCJcIlwiXG5cbiAgICBpdCBcImNvbXBvc2VzIHByb3Blcmx5IHdpdGggbW90aW9uc1wiLCAtPlxuICAgICAgZW5zdXJlICcyIHIgeCcsIHRleHQ6ICd4eFxcbnh4XFxuXFxuJ1xuXG4gICAgaXQgXCJkb2VzIG5vdGhpbmcgb24gYW4gZW1wdHkgbGluZVwiLCAtPlxuICAgICAgc2V0IGN1cnNvcjogWzIsIDBdXG4gICAgICBlbnN1cmUgJ3IgeCcsIHRleHQ6ICcxMlxcbjM0XFxuXFxuJ1xuXG4gICAgaXQgXCJkb2VzIG5vdGhpbmcgaWYgYXNrZWQgdG8gcmVwbGFjZSBtb3JlIGNoYXJhY3RlcnMgdGhhbiB0aGVyZSBhcmUgb24gYSBsaW5lXCIsIC0+XG4gICAgICBlbnN1cmUgJzMgciB4JywgdGV4dDogJzEyXFxuMzRcXG5cXG4nXG5cbiAgICBkZXNjcmliZSBcImNhbmNlbGxhdGlvblwiLCAtPlxuICAgICAgaXQgXCJkb2VzIG5vdGhpbmcgd2hlbiBjYW5jZWxsZWRcIiwgLT5cbiAgICAgICAgZW5zdXJlICdyIGVzY2FwZScsIHRleHQ6ICcxMlxcbjM0XFxuXFxuJywgbW9kZTogJ25vcm1hbCdcblxuICAgICAgaXQgXCJrZWVwIG11bHRpLWN1cnNvciBvbiBjYW5jZWxsZWRcIiwgLT5cbiAgICAgICAgc2V0ICAgICAgICAgICAgICAgIHRleHRDOiBcInwgICAgYVxcbiEgICAgYVxcbnwgICAgYVxcblwiXG4gICAgICAgIGVuc3VyZSBcInIgZXNjYXBlXCIsIHRleHRDOiBcInwgICAgYVxcbiEgICAgYVxcbnwgICAgYVxcblwiLCBtb2RlOiBcIm5vcm1hbFwiXG5cbiAgICAgIGl0IFwia2VlcCBtdWx0aS1jdXJzb3Igb24gY2FuY2VsbGVkXCIsIC0+XG4gICAgICAgIHNldCAgICAgICAgICAgICAgICB0ZXh0QzogXCJ8KiphXFxuISoqYVxcbnwqKmFcXG5cIlxuICAgICAgICBlbnN1cmUgXCJ2IGxcIiwgICAgICB0ZXh0QzogXCIqKnxhXFxuKiohYVxcbioqfGFcXG5cIiwgc2VsZWN0ZWRUZXh0OiBbXCIqKlwiLCBcIioqXCIsIFwiKipcIl0sIG1vZGU6IFtcInZpc3VhbFwiLCBcImNoYXJhY3Rlcndpc2VcIl1cbiAgICAgICAgZW5zdXJlIFwiciBlc2NhcGVcIiwgdGV4dEM6IFwiKip8YVxcbioqIWFcXG4qKnxhXFxuXCIsIHNlbGVjdGVkVGV4dDogW1wiKipcIiwgXCIqKlwiLCBcIioqXCJdLCBtb2RlOiBbXCJ2aXN1YWxcIiwgXCJjaGFyYWN0ZXJ3aXNlXCJdXG5cbiAgICBkZXNjcmliZSBcIndoZW4gaW4gdmlzdWFsIG1vZGVcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAga2V5c3Ryb2tlICd2IGUnXG5cbiAgICAgIGl0IFwicmVwbGFjZXMgdGhlIGVudGlyZSBzZWxlY3Rpb24gd2l0aCB0aGUgZ2l2ZW4gY2hhcmFjdGVyXCIsIC0+XG4gICAgICAgIGVuc3VyZSAnciB4JywgdGV4dDogJ3h4XFxueHhcXG5cXG4nXG5cbiAgICAgIGl0IFwibGVhdmVzIHRoZSBjdXJzb3IgYXQgdGhlIGJlZ2lubmluZyBvZiB0aGUgc2VsZWN0aW9uXCIsIC0+XG4gICAgICAgIGVuc3VyZSAnciB4JywgY3Vyc29yOiBbWzAsIDBdLCBbMSwgMF1dXG5cbiAgICBkZXNjcmliZSBcIndoZW4gaW4gdmlzdWFsLWJsb2NrIG1vZGVcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgY3Vyc29yOiBbMSwgNF1cbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIDA6MjM0NVxuICAgICAgICAgICAgMTogbzExb1xuICAgICAgICAgICAgMjogbzIyb1xuICAgICAgICAgICAgMzogbzMzb1xuICAgICAgICAgICAgNDogbzQ0b1xcblxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgIGVuc3VyZSAnY3RybC12IGwgMyBqJyxcbiAgICAgICAgICBtb2RlOiBbJ3Zpc3VhbCcsICdibG9ja3dpc2UnXVxuICAgICAgICAgIHNlbGVjdGVkVGV4dE9yZGVyZWQ6IFsnMTEnLCAnMjInLCAnMzMnLCAnNDQnXSxcblxuICAgICAgaXQgXCJyZXBsYWNlcyBlYWNoIHNlbGVjdGlvbiBhbmQgcHV0IGN1cnNvciBvbiBzdGFydCBvZiB0b3Agc2VsZWN0aW9uXCIsIC0+XG4gICAgICAgIGVuc3VyZSAnciB4JyxcbiAgICAgICAgICBtb2RlOiAnbm9ybWFsJ1xuICAgICAgICAgIGN1cnNvcjogWzEsIDRdXG4gICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICAwOjIzNDVcbiAgICAgICAgICAgIDE6IG94eG9cbiAgICAgICAgICAgIDI6IG94eG9cbiAgICAgICAgICAgIDM6IG94eG9cbiAgICAgICAgICAgIDQ6IG94eG9cXG5cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICBzZXQgY3Vyc29yOiBbMSwgMF1cbiAgICAgICAgZW5zdXJlICcuJyxcbiAgICAgICAgICBtb2RlOiAnbm9ybWFsJ1xuICAgICAgICAgIGN1cnNvcjogWzEsIDBdXG4gICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICAwOjIzNDVcbiAgICAgICAgICAgIHh4IG94eG9cbiAgICAgICAgICAgIHh4IG94eG9cbiAgICAgICAgICAgIHh4IG94eG9cbiAgICAgICAgICAgIHh4IG94eG9cXG5cbiAgICAgICAgICAgIFwiXCJcIlxuXG4gIGRlc2NyaWJlICd0aGUgbSBrZXliaW5kaW5nJywgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXQgdGV4dDogJzEyXFxuMzRcXG41NlxcbicsIGN1cnNvcjogWzAsIDFdXG5cbiAgICBpdCAnbWFya3MgYSBwb3NpdGlvbicsIC0+XG4gICAgICBrZXlzdHJva2UgJ20gYSdcbiAgICAgIGV4cGVjdCh2aW1TdGF0ZS5tYXJrLmdldCgnYScpKS50b0VxdWFsIFswLCAxXVxuXG4gIGRlc2NyaWJlICd0aGUgUiBrZXliaW5kaW5nJywgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXRcbiAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgMTIzNDVcbiAgICAgICAgICA2Nzg5MFxuICAgICAgICAgIFwiXCJcIlxuICAgICAgICBjdXJzb3I6IFswLCAyXVxuXG4gICAgaXQgXCJlbnRlcnMgcmVwbGFjZSBtb2RlIGFuZCByZXBsYWNlcyBjaGFyYWN0ZXJzXCIsIC0+XG4gICAgICBlbnN1cmUgJ1InLFxuICAgICAgICBtb2RlOiBbJ2luc2VydCcsICdyZXBsYWNlJ11cbiAgICAgIGVkaXRvci5pbnNlcnRUZXh0IFwiYWJcIlxuICAgICAgZW5zdXJlICdlc2NhcGUnLFxuICAgICAgICB0ZXh0OiBcIjEyYWI1XFxuNjc4OTBcIlxuICAgICAgICBjdXJzb3I6IFswLCAzXVxuICAgICAgICBtb2RlOiAnbm9ybWFsJ1xuXG4gICAgaXQgXCJjb250aW51ZXMgYmV5b25kIGVuZCBvZiBsaW5lIGFzIGluc2VydFwiLCAtPlxuICAgICAgZW5zdXJlICdSJyxcbiAgICAgICAgbW9kZTogWydpbnNlcnQnLCAncmVwbGFjZSddXG4gICAgICBlZGl0b3IuaW5zZXJ0VGV4dCBcImFiY2RlXCJcbiAgICAgIGVuc3VyZSAnZXNjYXBlJywgdGV4dDogJzEyYWJjZGVcXG42Nzg5MCdcblxuICAgIGl0ICd0cmVhdHMgYmFja3NwYWNlIGFzIHVuZG8nLCAtPlxuICAgICAgZWRpdG9yLmluc2VydFRleHQgXCJmb29cIlxuICAgICAga2V5c3Ryb2tlICdSJ1xuICAgICAgZWRpdG9yLmluc2VydFRleHQgXCJhXCJcbiAgICAgIGVkaXRvci5pbnNlcnRUZXh0IFwiYlwiXG4gICAgICBlbnN1cmUgdGV4dDogXCIxMmZvb2FiNVxcbjY3ODkwXCJcblxuICAgICAgZW5zdXJlICdiYWNrc3BhY2UnLCB0ZXh0OiBcIjEyZm9vYTQ1XFxuNjc4OTBcIlxuICAgICAgZWRpdG9yLmluc2VydFRleHQgXCJjXCJcbiAgICAgIGVuc3VyZSB0ZXh0OiBcIjEyZm9vYWM1XFxuNjc4OTBcIlxuICAgICAgZW5zdXJlICdiYWNrc3BhY2UgYmFja3NwYWNlJyxcbiAgICAgICAgdGV4dDogXCIxMmZvbzM0NVxcbjY3ODkwXCJcbiAgICAgICAgc2VsZWN0ZWRUZXh0OiAnJ1xuXG4gICAgICBlbnN1cmUgJ2JhY2tzcGFjZScsXG4gICAgICAgIHRleHQ6IFwiMTJmb28zNDVcXG42Nzg5MFwiXG4gICAgICAgIHNlbGVjdGVkVGV4dDogJydcblxuICAgIGl0IFwiY2FuIGJlIHJlcGVhdGVkXCIsIC0+XG4gICAgICBrZXlzdHJva2UgJ1InXG4gICAgICBlZGl0b3IuaW5zZXJ0VGV4dCBcImFiXCJcbiAgICAgIGtleXN0cm9rZSAnZXNjYXBlJ1xuICAgICAgc2V0IGN1cnNvcjogWzEsIDJdXG4gICAgICBlbnN1cmUgJy4nLCB0ZXh0OiBcIjEyYWI1XFxuNjdhYjBcIiwgY3Vyc29yOiBbMSwgM11cbiAgICAgIHNldCBjdXJzb3I6IFswLCA0XVxuICAgICAgZW5zdXJlICcuJywgdGV4dDogXCIxMmFiYWJcXG42N2FiMFwiLCBjdXJzb3I6IFswLCA1XVxuXG4gICAgaXQgXCJjYW4gYmUgaW50ZXJydXB0ZWQgYnkgYXJyb3cga2V5cyBhbmQgYmVoYXZlIGFzIGluc2VydCBmb3IgcmVwZWF0XCIsIC0+XG4gICAgICAjIEZJWE1FIGRvbid0IGtub3cgaG93IHRvIHRlc3QgdGhpcyAoYWxzbywgZGVwZW5kcyBvbiBQUiAjNTY4KVxuXG4gICAgaXQgXCJyZXBlYXRzIGNvcnJlY3RseSB3aGVuIGJhY2tzcGFjZSB3YXMgdXNlZCBpbiB0aGUgdGV4dFwiLCAtPlxuICAgICAga2V5c3Ryb2tlICdSJ1xuICAgICAgZWRpdG9yLmluc2VydFRleHQgXCJhXCJcbiAgICAgIGtleXN0cm9rZSAnYmFja3NwYWNlJ1xuICAgICAgZWRpdG9yLmluc2VydFRleHQgXCJiXCJcbiAgICAgIGtleXN0cm9rZSAnZXNjYXBlJ1xuICAgICAgc2V0IGN1cnNvcjogWzEsIDJdXG4gICAgICBlbnN1cmUgJy4nLCB0ZXh0OiBcIjEyYjQ1XFxuNjdiOTBcIiwgY3Vyc29yOiBbMSwgMl1cbiAgICAgIHNldCBjdXJzb3I6IFswLCA0XVxuICAgICAgZW5zdXJlICcuJywgdGV4dDogXCIxMmI0YlxcbjY3YjkwXCIsIGN1cnNvcjogWzAsIDRdXG5cbiAgICBpdCBcImRvZXNuJ3QgcmVwbGFjZSBhIGNoYXJhY3RlciBpZiBuZXdsaW5lIGlzIGVudGVyZWRcIiwgLT5cbiAgICAgIGVuc3VyZSAnUicsIG1vZGU6IFsnaW5zZXJ0JywgJ3JlcGxhY2UnXVxuICAgICAgZWRpdG9yLmluc2VydFRleHQgXCJcXG5cIlxuICAgICAgZW5zdXJlICdlc2NhcGUnLCB0ZXh0OiBcIjEyXFxuMzQ1XFxuNjc4OTBcIlxuXG4gICAgZGVzY3JpYmUgXCJtdWx0aWxpbmUgc2l0dWF0aW9uXCIsIC0+XG4gICAgICB0ZXh0T3JpZ2luYWwgPSBcIlwiXCJcbiAgICAgICAgMDEyMzRcbiAgICAgICAgNTY3ODlcbiAgICAgICAgXCJcIlwiXG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldCB0ZXh0OiB0ZXh0T3JpZ2luYWwsIGN1cnNvcjogWzAsIDBdXG4gICAgICBpdCBcInJlcGxhY2UgY2hhcmFjdGVyIHVubGVzcyBpbnB1dCBpc250IG5ldyBsaW5lKFxcXFxuKVwiLCAtPlxuICAgICAgICBlbnN1cmUgJ1InLCBtb2RlOiBbJ2luc2VydCcsICdyZXBsYWNlJ11cbiAgICAgICAgZWRpdG9yLmluc2VydFRleHQgXCJhXFxuYlxcbmNcIlxuICAgICAgICBlbnN1cmVcbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIGFcbiAgICAgICAgICAgIGJcbiAgICAgICAgICAgIGMzNFxuICAgICAgICAgICAgNTY3ODlcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIGN1cnNvcjogWzIsIDFdXG4gICAgICBpdCBcImhhbmRsZSBiYWNrc3BhY2VcIiwgLT5cbiAgICAgICAgZW5zdXJlICdSJywgbW9kZTogWydpbnNlcnQnLCAncmVwbGFjZSddXG4gICAgICAgIHNldCBjdXJzb3I6IFswLCAxXVxuICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dCBcImFcXG5iXFxuY1wiXG4gICAgICAgIGVuc3VyZVxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgMGFcbiAgICAgICAgICAgIGJcbiAgICAgICAgICAgIGM0XG4gICAgICAgICAgICA1Njc4OVxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgY3Vyc29yOiBbMiwgMV1cbiAgICAgICAgZW5zdXJlICdiYWNrc3BhY2UnLFxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgMGFcbiAgICAgICAgICAgIGJcbiAgICAgICAgICAgIDM0XG4gICAgICAgICAgICA1Njc4OVxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgY3Vyc29yOiBbMiwgMF1cbiAgICAgICAgZW5zdXJlICdiYWNrc3BhY2UnLFxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgMGFcbiAgICAgICAgICAgIGIzNFxuICAgICAgICAgICAgNTY3ODlcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIGN1cnNvcjogWzEsIDFdXG4gICAgICAgIGVuc3VyZSAnYmFja3NwYWNlJyxcbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIDBhXG4gICAgICAgICAgICAyMzRcbiAgICAgICAgICAgIDU2Nzg5XG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICBjdXJzb3I6IFsxLCAwXVxuICAgICAgICBlbnN1cmUgJ2JhY2tzcGFjZScsXG4gICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICAwYTIzNFxuICAgICAgICAgICAgNTY3ODlcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIGN1cnNvcjogWzAsIDJdXG4gICAgICAgIGVuc3VyZSAnYmFja3NwYWNlJyxcbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIDAxMjM0XG4gICAgICAgICAgICA1Njc4OVxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgY3Vyc29yOiBbMCwgMV1cbiAgICAgICAgZW5zdXJlICdiYWNrc3BhY2UnLCAjIGRvIG5vdGhpbmdcbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIDAxMjM0XG4gICAgICAgICAgICA1Njc4OVxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgY3Vyc29yOiBbMCwgMV1cbiAgICAgICAgZW5zdXJlICdlc2NhcGUnLFxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgMDEyMzRcbiAgICAgICAgICAgIDU2Nzg5XG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICBjdXJzb3I6IFswLCAwXVxuICAgICAgICAgIG1vZGU6ICdub3JtYWwnXG4gICAgICBpdCBcInJlcGVhdGUgbXVsdGlsaW5lIHRleHQgY2FzZS0xXCIsIC0+XG4gICAgICAgIGVuc3VyZSAnUicsIG1vZGU6IFsnaW5zZXJ0JywgJ3JlcGxhY2UnXVxuICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dCBcImFiY1xcbmRlZlwiXG4gICAgICAgIGVuc3VyZVxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgYWJjXG4gICAgICAgICAgICBkZWZcbiAgICAgICAgICAgIDU2Nzg5XG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICBjdXJzb3I6IFsxLCAzXVxuICAgICAgICBlbnN1cmUgJ2VzY2FwZScsIGN1cnNvcjogWzEsIDJdLCBtb2RlOiAnbm9ybWFsJ1xuICAgICAgICBlbnN1cmUgJ3UnLCB0ZXh0OiB0ZXh0T3JpZ2luYWxcbiAgICAgICAgZW5zdXJlICcuJyxcbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIGFiY1xuICAgICAgICAgICAgZGVmXG4gICAgICAgICAgICA1Njc4OVxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgY3Vyc29yOiBbMSwgMl1cbiAgICAgICAgICBtb2RlOiAnbm9ybWFsJ1xuICAgICAgICBlbnN1cmUgJ2ogLicsXG4gICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICBhYmNcbiAgICAgICAgICAgIGRlZlxuICAgICAgICAgICAgNTZhYmNcbiAgICAgICAgICAgIGRlZlxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgY3Vyc29yOiBbMywgMl1cbiAgICAgICAgICBtb2RlOiAnbm9ybWFsJ1xuICAgICAgaXQgXCJyZXBlYXRlIG11bHRpbGluZSB0ZXh0IGNhc2UtMlwiLCAtPlxuICAgICAgICBlbnN1cmUgJ1InLCBtb2RlOiBbJ2luc2VydCcsICdyZXBsYWNlJ11cbiAgICAgICAgZWRpdG9yLmluc2VydFRleHQgXCJhYmNcXG5kXCJcbiAgICAgICAgZW5zdXJlXG4gICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICBhYmNcbiAgICAgICAgICAgIGQ0XG4gICAgICAgICAgICA1Njc4OVxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgY3Vyc29yOiBbMSwgMV1cbiAgICAgICAgZW5zdXJlICdlc2NhcGUnLCBjdXJzb3I6IFsxLCAwXSwgbW9kZTogJ25vcm1hbCdcbiAgICAgICAgZW5zdXJlICdqIC4nLFxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgIGFiY1xuICAgICAgICAgIGQ0XG4gICAgICAgICAgYWJjXG4gICAgICAgICAgZDlcbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICBjdXJzb3I6IFszLCAwXVxuICAgICAgICAgIG1vZGU6ICdub3JtYWwnXG5cbiAgZGVzY3JpYmUgJ0FkZEJsYW5rTGluZUJlbG93LCBBZGRCbGFua0xpbmVBYm92ZScsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2V0XG4gICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgbGluZTBcbiAgICAgICAgbGl8bmUxXG4gICAgICAgIGxpbmUyXG4gICAgICAgIGxpbmUzXG4gICAgICAgIFwiXCJcIlxuXG4gICAgICBhdG9tLmtleW1hcHMuYWRkIFwidGVzdFwiLFxuICAgICAgICAnYXRvbS10ZXh0LWVkaXRvci52aW0tbW9kZS1wbHVzLm5vcm1hbC1tb2RlJzpcbiAgICAgICAgICAnZW50ZXInOiAndmltLW1vZGUtcGx1czphZGQtYmxhbmstbGluZS1iZWxvdydcbiAgICAgICAgICAnc2hpZnQtZW50ZXInOiAndmltLW1vZGUtcGx1czphZGQtYmxhbmstbGluZS1hYm92ZSdcblxuICAgIGl0IFwiaW5zZXJ0IGJsYW5rIGxpbmUgYmVsb3cvYWJvdmVcIiwgLT5cbiAgICAgIGVuc3VyZSBcImVudGVyXCIsXG4gICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgbGluZTBcbiAgICAgICAgbGl8bmUxXG5cbiAgICAgICAgbGluZTJcbiAgICAgICAgbGluZTNcbiAgICAgICAgXCJcIlwiXG4gICAgICBlbnN1cmUgXCJzaGlmdC1lbnRlclwiLFxuICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgIGxpbmUwXG5cbiAgICAgICAgbGl8bmUxXG5cbiAgICAgICAgbGluZTJcbiAgICAgICAgbGluZTNcbiAgICAgICAgXCJcIlwiXG5cbiAgICBpdCBcIlt3aXRoLWNvdW50XSBpbnNlcnQgYmxhbmsgbGluZSBiZWxvdy9hYm92ZVwiLCAtPlxuICAgICAgZW5zdXJlIFwiMiBlbnRlclwiLFxuICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgIGxpbmUwXG4gICAgICAgIGxpfG5lMVxuXG5cbiAgICAgICAgbGluZTJcbiAgICAgICAgbGluZTNcbiAgICAgICAgXCJcIlwiXG4gICAgICBlbnN1cmUgXCIyIHNoaWZ0LWVudGVyXCIsXG4gICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgbGluZTBcblxuXG4gICAgICAgIGxpfG5lMVxuXG5cbiAgICAgICAgbGluZTJcbiAgICAgICAgbGluZTNcbiAgICAgICAgXCJcIlwiXG4iXX0=
