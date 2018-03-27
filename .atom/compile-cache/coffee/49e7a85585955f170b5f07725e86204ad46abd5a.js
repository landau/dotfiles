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
            text: "12345\n  abcde\n",
            cursor: [0, 4]
          });
          return ensure('d d', {
            text: "  abcde\n",
            cursor: [0, 2]
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
            return ensure([
              'd t', {
                input: ')'
              }
            ], {
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
          return ensure([
            'd t', {
              input: 'd'
            }
          ], {
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
          cursor: [0, 4],
          text: "012 345\nabc\n"
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
            cursor: [0, 4],
            text: "000000\n111111\n222222\n"
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
          return ensure([
            '"', {
              input: 'a'
            }, 'y y'
          ], {
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
          ensure([
            '"', {
              input: 'a'
            }, 'y y'
          ], {
            register: {
              a: {
                text: "012 345\n"
              }
            }
          });
          return ensure([
            '"', {
              input: 'A'
            }, 'y y'
          ], {
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
          return ensure([
            'y t', {
              input: 'x'
            }
          ], {
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
        return ensure([
          'r', {
            input: 'x'
          }
        ], {
          text: 'x2\nx4\n\n'
        });
      });
      it("does nothing when cancelled", function() {
        return ensure('r escape', {
          text: '12\n34\n\n',
          mode: 'normal'
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
        return ensure([
          '2 r', {
            input: 'x'
          }
        ], {
          text: 'xx\nxx\n\n'
        });
      });
      it("does nothing on an empty line", function() {
        set({
          cursor: [2, 0]
        });
        return ensure([
          'r', {
            input: 'x'
          }
        ], {
          text: '12\n34\n\n'
        });
      });
      it("does nothing if asked to replace more characters than there are on a line", function() {
        return ensure([
          '3 r', {
            input: 'x'
          }
        ], {
          text: '12\n34\n\n'
        });
      });
      describe("when in visual mode", function() {
        beforeEach(function() {
          return keystroke('v e');
        });
        it("replaces the entire selection with the given character", function() {
          return ensure([
            'r', {
              input: 'x'
            }
          ], {
            text: 'xx\nxx\n\n'
          });
        });
        return it("leaves the cursor at the beginning of the selection", function() {
          return ensure([
            'r', {
              input: 'x'
            }
          ], {
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
          ensure([
            'r', {
              input: 'x'
            }
          ], {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9zcGVjL29wZXJhdG9yLWdlbmVyYWwtc3BlYy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLDhDQUFBO0lBQUE7O0VBQUEsTUFBb0MsT0FBQSxDQUFRLGVBQVIsQ0FBcEMsRUFBQyw2QkFBRCxFQUFjLHVCQUFkLEVBQXdCOztFQUN4QixRQUFBLEdBQVcsT0FBQSxDQUFRLGlCQUFSOztFQUVYLFFBQUEsQ0FBUyxrQkFBVCxFQUE2QixTQUFBO0FBQzNCLFFBQUE7SUFBQSxPQUE4RSxFQUE5RSxFQUFDLGFBQUQsRUFBTSxnQkFBTixFQUFjLDBCQUFkLEVBQWdDLG1CQUFoQyxFQUEyQyxnQkFBM0MsRUFBbUQsdUJBQW5ELEVBQWtFO0lBRWxFLFVBQUEsQ0FBVyxTQUFBO2FBQ1QsV0FBQSxDQUFZLFNBQUMsS0FBRCxFQUFRLEdBQVI7UUFDVixRQUFBLEdBQVc7UUFDVix3QkFBRCxFQUFTO2VBQ1IsYUFBRCxFQUFNLG1CQUFOLEVBQWMsdUNBQWQsRUFBZ0MseUJBQWhDLEVBQTZDO01BSG5DLENBQVo7SUFEUyxDQUFYO0lBTUEsUUFBQSxDQUFTLHVCQUFULEVBQWtDLFNBQUE7YUFDaEMsRUFBQSxDQUFHLHlCQUFILEVBQThCLFNBQUE7UUFDNUIsU0FBQSxDQUFVLEdBQVY7UUFDQSxNQUFBLENBQU8sUUFBUSxDQUFDLGNBQWMsQ0FBQyxPQUF4QixDQUFBLENBQVAsQ0FBeUMsQ0FBQyxJQUExQyxDQUErQyxLQUEvQztRQUNBLFFBQVEsQ0FBQyxXQUFXLENBQUMsTUFBckIsQ0FBQTtRQUNBLE1BQUEsQ0FBTyxRQUFRLENBQUMsY0FBYyxDQUFDLE9BQXhCLENBQUEsQ0FBUCxDQUF5QyxDQUFDLElBQTFDLENBQStDLElBQS9DO2VBQ0EsTUFBQSxDQUFPLFNBQUE7aUJBQUcsUUFBUSxDQUFDLFdBQVcsQ0FBQyxN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YUFBQSxFQUFlLG9DQURmO1dBREY7U0FERjtNQVRTLENBQVg7TUFjQSxFQUFBLENBQUcsK0JBQUgsRUFBb0MsU0FBQTtRQUNsQyxNQUFBLENBQU8sT0FBUCxFQUNFO1VBQUEsS0FBQSxFQUFPLCtCQUFQO1NBREY7ZUFRQSxNQUFBLENBQU8sYUFBUCxFQUNFO1VBQUEsS0FBQSxFQUFPLGlDQUFQO1NBREY7TUFUa0MsQ0FBcEM7YUFtQkEsRUFBQSxDQUFHLDRDQUFILEVBQWlELFNBQUE7UUFDL0MsTUFBQSxDQUFPLFNBQVAsRUFDRTtVQUFBLEtBQUEsRUFBTyxpQ0FBUDtTQURGO2VBU0EsTUFBQSxDQUFPLGVBQVAsRUFDRTtVQUFBLEtBQUEsRUFBTyxxQ0FBUDtTQURGO01BVitDLENBQWpEO0lBbEMrQyxDQUFqRDtFQWw0QzJCLENBQTdCO0FBSEEiLCJzb3VyY2VzQ29udGVudCI6WyJ7Z2V0VmltU3RhdGUsIGRpc3BhdGNoLCBUZXh0RGF0YX0gPSByZXF1aXJlICcuL3NwZWMtaGVscGVyJ1xuc2V0dGluZ3MgPSByZXF1aXJlICcuLi9saWIvc2V0dGluZ3MnXG5cbmRlc2NyaWJlIFwiT3BlcmF0b3IgZ2VuZXJhbFwiLCAtPlxuICBbc2V0LCBlbnN1cmUsIGVuc3VyZUJ5RGlzcGF0Y2gsIGtleXN0cm9rZSwgZWRpdG9yLCBlZGl0b3JFbGVtZW50LCB2aW1TdGF0ZV0gPSBbXVxuXG4gIGJlZm9yZUVhY2ggLT5cbiAgICBnZXRWaW1TdGF0ZSAoc3RhdGUsIHZpbSkgLT5cbiAgICAgIHZpbVN0YXRlID0gc3RhdGVcbiAgICAgIHtlZGl0b3IsIGVkaXRvckVsZW1lbnR9ID0gdmltU3RhdGVcbiAgICAgIHtzZXQsIGVuc3VyZSwgZW5zdXJlQnlEaXNwYXRjaCwga2V5c3Ryb2tlfSA9IHZpbVxuXG4gIGRlc2NyaWJlIFwiY2FuY2VsbGluZyBvcGVyYXRpb25zXCIsIC0+XG4gICAgaXQgXCJjbGVhciBwZW5kaW5nIG9wZXJhdGlvblwiLCAtPlxuICAgICAga2V5c3Ryb2tlICcvJ1xuICAgICAgZXhwZWN0KHZpbVN0YXRlLm9wZXJhdGlvblN0YWNrLmlzRW1wdHkoKSkudG9CZSBmYWxzZVxuICAgICAgdmltU3RhdGUuc2VhcmNoSW5wdXQuY2FuY2VsKClcbiAgICAgIGV4cGVjdCh2aW1TdGF0ZS5vcGVyYXRpb25TdGFjay5pc0VtcHR5KCkpLnRvQmUgdHJ1ZVxuICAgICAgZXhwZWN0KC0+IHZpbVN0YXRlLnNlYXJjaElucHV0LmNhbmNlbCgpKS5ub3QudG9UaHJvdygpXG5cbiAgZGVzY3JpYmUgXCJ0aGUgeCBrZXliaW5kaW5nXCIsIC0+XG4gICAgZGVzY3JpYmUgXCJvbiBhIGxpbmUgd2l0aCBjb250ZW50XCIsIC0+XG4gICAgICBkZXNjcmliZSBcIndpdGhvdXQgdmltLW1vZGUtcGx1cy53cmFwTGVmdFJpZ2h0TW90aW9uXCIsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBzZXRcbiAgICAgICAgICAgIHRleHQ6IFwiYWJjXFxuMDEyMzQ1XFxuXFxueHl6XCJcbiAgICAgICAgICAgIGN1cnNvcjogWzEsIDRdXG5cbiAgICAgICAgaXQgXCJkZWxldGVzIGEgY2hhcmFjdGVyXCIsIC0+XG4gICAgICAgICAgZW5zdXJlICd4JywgdGV4dDogJ2FiY1xcbjAxMjM1XFxuXFxueHl6JywgY3Vyc29yOiBbMSwgNF0sIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiAnNCdcbiAgICAgICAgICBlbnN1cmUgJ3gnLCB0ZXh0OiAnYWJjXFxuMDEyM1xcblxcbnh5eicgLCBjdXJzb3I6IFsxLCAzXSwgcmVnaXN0ZXI6ICdcIic6IHRleHQ6ICc1J1xuICAgICAgICAgIGVuc3VyZSAneCcsIHRleHQ6ICdhYmNcXG4wMTJcXG5cXG54eXonICAsIGN1cnNvcjogWzEsIDJdLCByZWdpc3RlcjogJ1wiJzogdGV4dDogJzMnXG4gICAgICAgICAgZW5zdXJlICd4JywgdGV4dDogJ2FiY1xcbjAxXFxuXFxueHl6JyAgICwgY3Vyc29yOiBbMSwgMV0sIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiAnMidcbiAgICAgICAgICBlbnN1cmUgJ3gnLCB0ZXh0OiAnYWJjXFxuMFxcblxcbnh5eicgICAgLCBjdXJzb3I6IFsxLCAwXSwgcmVnaXN0ZXI6ICdcIic6IHRleHQ6ICcxJ1xuICAgICAgICAgIGVuc3VyZSAneCcsIHRleHQ6ICdhYmNcXG5cXG5cXG54eXonICAgICAsIGN1cnNvcjogWzEsIDBdLCByZWdpc3RlcjogJ1wiJzogdGV4dDogJzAnXG5cbiAgICAgICAgaXQgXCJkZWxldGVzIG11bHRpcGxlIGNoYXJhY3RlcnMgd2l0aCBhIGNvdW50XCIsIC0+XG4gICAgICAgICAgZW5zdXJlICcyIHgnLCB0ZXh0OiAnYWJjXFxuMDEyM1xcblxcbnh5eicsIGN1cnNvcjogWzEsIDNdLCByZWdpc3RlcjogJ1wiJzogdGV4dDogJzQ1J1xuICAgICAgICAgIHNldCBjdXJzb3I6IFswLCAxXVxuICAgICAgICAgIGVuc3VyZSAnMyB4JyxcbiAgICAgICAgICAgIHRleHQ6ICdhXFxuMDEyM1xcblxcbnh5eidcbiAgICAgICAgICAgIGN1cnNvcjogWzAsIDBdXG4gICAgICAgICAgICByZWdpc3RlcjogJ1wiJzogdGV4dDogJ2JjJ1xuXG4gICAgICBkZXNjcmliZSBcIndpdGggbXVsdGlwbGUgY3Vyc29yc1wiLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgc2V0XG4gICAgICAgICAgICB0ZXh0OiBcImFiY1xcbjAxMjM0NVxcblxcbnh5elwiXG4gICAgICAgICAgICBjdXJzb3I6IFtbMSwgNF0sIFswLCAxXV1cblxuICAgICAgICBpdCBcImlzIHVuZG9uZSBhcyBvbmUgb3BlcmF0aW9uXCIsIC0+XG4gICAgICAgICAgZW5zdXJlICd4JywgdGV4dDogXCJhY1xcbjAxMjM1XFxuXFxueHl6XCJcbiAgICAgICAgICBlbnN1cmUgJ3UnLCB0ZXh0OiAnYWJjXFxuMDEyMzQ1XFxuXFxueHl6J1xuXG4gICAgICBkZXNjcmliZSBcIndpdGggdmltLW1vZGUtcGx1cy53cmFwTGVmdFJpZ2h0TW90aW9uXCIsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBzZXQgdGV4dDogJ2FiY1xcbjAxMjM0NVxcblxcbnh5eicsIGN1cnNvcjogWzEsIDRdXG4gICAgICAgICAgc2V0dGluZ3Muc2V0KCd3cmFwTGVmdFJpZ2h0TW90aW9uJywgdHJ1ZSlcblxuICAgICAgICBpdCBcImRlbGV0ZXMgYSBjaGFyYWN0ZXJcIiwgLT5cbiAgICAgICAgICAjIGNvcHkgb2YgdGhlIGVhcmxpZXIgdGVzdCBiZWNhdXNlIHdyYXBMZWZ0UmlnaHRNb3Rpb24gc2hvdWxkIG5vdCBhZmZlY3QgaXRcbiAgICAgICAgICBlbnN1cmUgJ3gnLCB0ZXh0OiAnYWJjXFxuMDEyMzVcXG5cXG54eXonLCBjdXJzb3I6IFsxLCA0XSwgcmVnaXN0ZXI6ICdcIic6IHRleHQ6ICc0J1xuICAgICAgICAgIGVuc3VyZSAneCcsIHRleHQ6ICdhYmNcXG4wMTIzXFxuXFxueHl6JyAsIGN1cnNvcjogWzEsIDNdLCByZWdpc3RlcjogJ1wiJzogdGV4dDogJzUnXG4gICAgICAgICAgZW5zdXJlICd4JywgdGV4dDogJ2FiY1xcbjAxMlxcblxcbnh5eicgICwgY3Vyc29yOiBbMSwgMl0sIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiAnMydcbiAgICAgICAgICBlbnN1cmUgJ3gnLCB0ZXh0OiAnYWJjXFxuMDFcXG5cXG54eXonICAgLCBjdXJzb3I6IFsxLCAxXSwgcmVnaXN0ZXI6ICdcIic6IHRleHQ6ICcyJ1xuICAgICAgICAgIGVuc3VyZSAneCcsIHRleHQ6ICdhYmNcXG4wXFxuXFxueHl6JyAgICAsIGN1cnNvcjogWzEsIDBdLCByZWdpc3RlcjogJ1wiJzogdGV4dDogJzEnXG4gICAgICAgICAgZW5zdXJlICd4JywgdGV4dDogJ2FiY1xcblxcblxcbnh5eicgICAgICwgY3Vyc29yOiBbMSwgMF0sIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiAnMCdcblxuICAgICAgICBpdCBcImRlbGV0ZXMgbXVsdGlwbGUgY2hhcmFjdGVycyBhbmQgbmV3bGluZXMgd2l0aCBhIGNvdW50XCIsIC0+XG4gICAgICAgICAgc2V0dGluZ3Muc2V0KCd3cmFwTGVmdFJpZ2h0TW90aW9uJywgdHJ1ZSlcbiAgICAgICAgICBlbnN1cmUgJzIgeCcsIHRleHQ6ICdhYmNcXG4wMTIzXFxuXFxueHl6JywgY3Vyc29yOiBbMSwgM10sIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiAnNDUnXG4gICAgICAgICAgc2V0IGN1cnNvcjogWzAsIDFdXG4gICAgICAgICAgZW5zdXJlICczIHgnLCB0ZXh0OiAnYTAxMjNcXG5cXG54eXonLCBjdXJzb3I6IFswLCAxXSwgcmVnaXN0ZXI6ICdcIic6IHRleHQ6ICdiY1xcbidcbiAgICAgICAgICBlbnN1cmUgJzcgeCcsIHRleHQ6ICdheXonLCBjdXJzb3I6IFswLCAxXSwgcmVnaXN0ZXI6ICdcIic6IHRleHQ6ICcwMTIzXFxuXFxueCdcblxuICAgIGRlc2NyaWJlIFwib24gYW4gZW1wdHkgbGluZVwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXQgdGV4dDogXCJhYmNcXG4wMTIzNDVcXG5cXG54eXpcIiwgY3Vyc29yOiBbMiwgMF1cblxuICAgICAgaXQgXCJkZWxldGVzIG5vdGhpbmcgb24gYW4gZW1wdHkgbGluZSB3aGVuIHZpbS1tb2RlLXBsdXMud3JhcExlZnRSaWdodE1vdGlvbiBpcyBmYWxzZVwiLCAtPlxuICAgICAgICBzZXR0aW5ncy5zZXQoJ3dyYXBMZWZ0UmlnaHRNb3Rpb24nLCBmYWxzZSlcbiAgICAgICAgZW5zdXJlICd4JywgdGV4dDogXCJhYmNcXG4wMTIzNDVcXG5cXG54eXpcIiwgY3Vyc29yOiBbMiwgMF1cblxuICAgICAgaXQgXCJkZWxldGVzIGFuIGVtcHR5IGxpbmUgd2hlbiB2aW0tbW9kZS1wbHVzLndyYXBMZWZ0UmlnaHRNb3Rpb24gaXMgdHJ1ZVwiLCAtPlxuICAgICAgICBzZXR0aW5ncy5zZXQoJ3dyYXBMZWZ0UmlnaHRNb3Rpb24nLCB0cnVlKVxuICAgICAgICBlbnN1cmUgJ3gnLCB0ZXh0OiBcImFiY1xcbjAxMjM0NVxcbnh5elwiLCBjdXJzb3I6IFsyLCAwXVxuXG4gIGRlc2NyaWJlIFwidGhlIFgga2V5YmluZGluZ1wiLCAtPlxuICAgIGRlc2NyaWJlIFwib24gYSBsaW5lIHdpdGggY29udGVudFwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXQgdGV4dDogXCJhYlxcbjAxMjM0NVwiLCBjdXJzb3I6IFsxLCAyXVxuXG4gICAgICBpdCBcImRlbGV0ZXMgYSBjaGFyYWN0ZXJcIiwgLT5cbiAgICAgICAgZW5zdXJlICdYJywgdGV4dDogJ2FiXFxuMDIzNDUnLCBjdXJzb3I6IFsxLCAxXSwgcmVnaXN0ZXI6ICdcIic6IHRleHQ6ICcxJ1xuICAgICAgICBlbnN1cmUgJ1gnLCB0ZXh0OiAnYWJcXG4yMzQ1JywgY3Vyc29yOiBbMSwgMF0sIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiAnMCdcbiAgICAgICAgZW5zdXJlICdYJywgdGV4dDogJ2FiXFxuMjM0NScsIGN1cnNvcjogWzEsIDBdLCByZWdpc3RlcjogJ1wiJzogdGV4dDogJzAnXG4gICAgICAgIHNldHRpbmdzLnNldCgnd3JhcExlZnRSaWdodE1vdGlvbicsIHRydWUpXG4gICAgICAgIGVuc3VyZSAnWCcsIHRleHQ6ICdhYjIzNDUnLCBjdXJzb3I6IFswLCAyXSwgcmVnaXN0ZXI6ICdcIic6IHRleHQ6ICdcXG4nXG5cbiAgICBkZXNjcmliZSBcIm9uIGFuIGVtcHR5IGxpbmVcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dDogXCIwMTIzNDVcXG5cXG5hYmNkZWZcIlxuICAgICAgICAgIGN1cnNvcjogWzEsIDBdXG5cbiAgICAgIGl0IFwiZGVsZXRlcyBub3RoaW5nIHdoZW4gdmltLW1vZGUtcGx1cy53cmFwTGVmdFJpZ2h0TW90aW9uIGlzIGZhbHNlXCIsIC0+XG4gICAgICAgIHNldHRpbmdzLnNldCgnd3JhcExlZnRSaWdodE1vdGlvbicsIGZhbHNlKVxuICAgICAgICBlbnN1cmUgJ1gnLCB0ZXh0OiBcIjAxMjM0NVxcblxcbmFiY2RlZlwiLCBjdXJzb3I6IFsxLCAwXVxuXG4gICAgICBpdCBcImRlbGV0ZXMgdGhlIG5ld2xpbmUgd2hlbiB3cmFwTGVmdFJpZ2h0TW90aW9uIGlzIHRydWVcIiwgLT5cbiAgICAgICAgc2V0dGluZ3Muc2V0KCd3cmFwTGVmdFJpZ2h0TW90aW9uJywgdHJ1ZSlcbiAgICAgICAgZW5zdXJlICdYJywgdGV4dDogXCIwMTIzNDVcXG5hYmNkZWZcIiwgY3Vyc29yOiBbMCwgNV1cblxuICBkZXNjcmliZSBcInRoZSBkIGtleWJpbmRpbmdcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXRcbiAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgMTIzNDVcbiAgICAgICAgICBhYmNkZVxuXG4gICAgICAgICAgQUJDREVcXG5cbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgY3Vyc29yOiBbMSwgMV1cblxuICAgIGl0IFwiZW50ZXJzIG9wZXJhdG9yLXBlbmRpbmcgbW9kZVwiLCAtPlxuICAgICAgZW5zdXJlICdkJywgbW9kZTogJ29wZXJhdG9yLXBlbmRpbmcnXG5cbiAgICBkZXNjcmliZSBcIndoZW4gZm9sbG93ZWQgYnkgYSBkXCIsIC0+XG4gICAgICBpdCBcImRlbGV0ZXMgdGhlIGN1cnJlbnQgbGluZSBhbmQgZXhpdHMgb3BlcmF0b3ItcGVuZGluZyBtb2RlXCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFsxLCAxXVxuICAgICAgICBlbnN1cmUgJ2QgZCcsXG4gICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICAxMjM0NVxuXG4gICAgICAgICAgICBBQkNERVxcblxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgY3Vyc29yOiBbMSwgMF1cbiAgICAgICAgICByZWdpc3RlcjogJ1wiJzogdGV4dDogXCJhYmNkZVxcblwiXG4gICAgICAgICAgbW9kZTogJ25vcm1hbCdcblxuICAgICAgaXQgXCJkZWxldGVzIHRoZSBsYXN0IGxpbmUgYW5kIGFsd2F5cyBtYWtlIG5vbi1ibGFuay1saW5lIGxhc3QgbGluZVwiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMiwgMF1cbiAgICAgICAgZW5zdXJlICcyIGQgZCcsXG4gICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICAxMjM0NVxuICAgICAgICAgICAgYWJjZGVcXG5cbiAgICAgICAgICAgIFwiXCJcIixcbiAgICAgICAgICBjdXJzb3I6IFsxLCAwXVxuXG4gICAgICBpdCBcImxlYXZlcyB0aGUgY3Vyc29yIG9uIHRoZSBmaXJzdCBub25ibGFuayBjaGFyYWN0ZXJcIiwgLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgMTIzNDVcbiAgICAgICAgICAgIGFiY2RlXFxuXG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgY3Vyc29yOiBbMCwgNF1cbiAgICAgICAgZW5zdXJlICdkIGQnLFxuICAgICAgICAgIHRleHQ6IFwiICBhYmNkZVxcblwiXG4gICAgICAgICAgY3Vyc29yOiBbMCwgMl1cblxuICAgIGRlc2NyaWJlIFwidW5kbyBiZWhhdmlvclwiLCAtPlxuICAgICAgW29yaWdpbmFsVGV4dCwgaW5pdGlhbFRleHRDXSA9IFtdXG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIGluaXRpYWxUZXh0QyA9IFwiXCJcIlxuICAgICAgICAgIDEyMzQ1XG4gICAgICAgICAgYXxiY2RlXG4gICAgICAgICAgQUJDREVcbiAgICAgICAgICBRV0VSVFxuICAgICAgICAgIFwiXCJcIlxuICAgICAgICBzZXQgdGV4dEM6IGluaXRpYWxUZXh0Q1xuICAgICAgICBvcmlnaW5hbFRleHQgPSBlZGl0b3IuZ2V0VGV4dCgpXG5cbiAgICAgIGl0IFwidW5kb2VzIGJvdGggbGluZXNcIiwgLT5cbiAgICAgICAgZW5zdXJlICdkIDIgZCcsXG4gICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgIDEyMzQ1XG4gICAgICAgICAgfFFXRVJUXG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgIGVuc3VyZSAndScsXG4gICAgICAgICAgdGV4dEM6IGluaXRpYWxUZXh0Q1xuICAgICAgICAgIHNlbGVjdGVkVGV4dDogXCJcIlxuXG4gICAgICBkZXNjcmliZSBcIndpdGggbXVsdGlwbGUgY3Vyc29yc1wiLCAtPlxuICAgICAgICBkZXNjcmliZSBcInNldEN1cnNvclRvU3RhcnRPZkNoYW5nZU9uVW5kb1JlZG8gaXMgdHJ1ZShkZWZhdWx0KVwiLCAtPlxuICAgICAgICAgIGl0IFwiY2xlYXIgbXVsdGlwbGUgY3Vyc29ycyBhbmQgc2V0IGN1cnNvciB0byBzdGFydCBvZiBjaGFuZ2VzIG9mIGxhc3QgY3Vyc29yXCIsIC0+XG4gICAgICAgICAgICBzZXRcbiAgICAgICAgICAgICAgdGV4dDogb3JpZ2luYWxUZXh0XG4gICAgICAgICAgICAgIGN1cnNvcjogW1swLCAwXSwgWzEsIDFdXVxuXG4gICAgICAgICAgICBlbnN1cmUgJ2QgbCcsXG4gICAgICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAgICAgfDIzNDVcbiAgICAgICAgICAgICAgYXxjZGVcbiAgICAgICAgICAgICAgQUJDREVcbiAgICAgICAgICAgICAgUVdFUlRcbiAgICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgICAgIGVuc3VyZSAndScsXG4gICAgICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAgICAgMTIzNDVcbiAgICAgICAgICAgICAgYXxiY2RlXG4gICAgICAgICAgICAgIEFCQ0RFXG4gICAgICAgICAgICAgIFFXRVJUXG4gICAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgICBzZWxlY3RlZFRleHQ6ICcnXG5cbiAgICAgICAgICAgIGVuc3VyZSAnY3RybC1yJyxcbiAgICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgICAyMzQ1XG4gICAgICAgICAgICAgIGF8Y2RlXG4gICAgICAgICAgICAgIEFCQ0RFXG4gICAgICAgICAgICAgIFFXRVJUXG4gICAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgICBzZWxlY3RlZFRleHQ6ICcnXG5cbiAgICAgICAgICBpdCBcImNsZWFyIG11bHRpcGxlIGN1cnNvcnMgYW5kIHNldCBjdXJzb3IgdG8gc3RhcnQgb2YgY2hhbmdlcyBvZiBsYXN0IGN1cnNvclwiLCAtPlxuICAgICAgICAgICAgc2V0XG4gICAgICAgICAgICAgIHRleHQ6IG9yaWdpbmFsVGV4dFxuICAgICAgICAgICAgICBjdXJzb3I6IFtbMSwgMV0sIFswLCAwXV1cblxuICAgICAgICAgICAgZW5zdXJlICdkIGwnLFxuICAgICAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgICAgMjM0NVxuICAgICAgICAgICAgICBhY2RlXG4gICAgICAgICAgICAgIEFCQ0RFXG4gICAgICAgICAgICAgIFFXRVJUXG4gICAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgICBjdXJzb3I6IFtbMSwgMV0sIFswLCAwXV1cblxuICAgICAgICAgICAgZW5zdXJlICd1JyxcbiAgICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgICB8MTIzNDVcbiAgICAgICAgICAgICAgYWJjZGVcbiAgICAgICAgICAgICAgQUJDREVcbiAgICAgICAgICAgICAgUVdFUlRcbiAgICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICAgIHNlbGVjdGVkVGV4dDogJydcblxuICAgICAgICAgICAgZW5zdXJlICdjdHJsLXInLFxuICAgICAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICAgIHwyMzQ1XG4gICAgICAgICAgICAgIGFjZGVcbiAgICAgICAgICAgICAgQUJDREVcbiAgICAgICAgICAgICAgUVdFUlRcbiAgICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICAgIHNlbGVjdGVkVGV4dDogJydcblxuICAgICAgICBkZXNjcmliZSBcInNldEN1cnNvclRvU3RhcnRPZkNoYW5nZU9uVW5kb1JlZG8gaXMgZmFsc2VcIiwgLT5cbiAgICAgICAgICBpbml0aWFsVGV4dEMgPSBudWxsXG5cbiAgICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgICBpbml0aWFsVGV4dEMgPSBcIlwiXCJcbiAgICAgICAgICAgICAgfDEyMzQ1XG4gICAgICAgICAgICAgIGF8YmNkZVxuICAgICAgICAgICAgICBBQkNERVxuICAgICAgICAgICAgICBRV0VSVFxuICAgICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICAgICAgc2V0dGluZ3Muc2V0KCdzZXRDdXJzb3JUb1N0YXJ0T2ZDaGFuZ2VPblVuZG9SZWRvJywgZmFsc2UpXG4gICAgICAgICAgICBzZXQgdGV4dEM6IGluaXRpYWxUZXh0Q1xuICAgICAgICAgICAgZW5zdXJlICdkIGwnLFxuICAgICAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICAgIHwyMzQ1XG4gICAgICAgICAgICAgIGF8Y2RlXG4gICAgICAgICAgICAgIEFCQ0RFXG4gICAgICAgICAgICAgIFFXRVJUXG4gICAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgICAgaXQgXCJwdXQgY3Vyc29yIHRvIGVuZCBvZiBjaGFuZ2UgKHdvcmtzIGluIHNhbWUgd2F5IG9mIGF0b20ncyBjb3JlOnVuZG8pXCIsIC0+XG4gICAgICAgICAgICBlbnN1cmUgJ3UnLFxuICAgICAgICAgICAgICB0ZXh0QzogaW5pdGlhbFRleHRDXG4gICAgICAgICAgICAgIHNlbGVjdGVkVGV4dDogWycnLCAnJ11cblxuICAgIGRlc2NyaWJlIFwid2hlbiBmb2xsb3dlZCBieSBhIHdcIiwgLT5cbiAgICAgIGl0IFwiZGVsZXRlcyB0aGUgbmV4dCB3b3JkIHVudGlsIHRoZSBlbmQgb2YgdGhlIGxpbmUgYW5kIGV4aXRzIG9wZXJhdG9yLXBlbmRpbmcgbW9kZVwiLCAtPlxuICAgICAgICBzZXQgdGV4dDogJ2FiY2QgZWZnXFxuYWJjJywgY3Vyc29yOiBbMCwgNV1cbiAgICAgICAgZW5zdXJlICdkIHcnLFxuICAgICAgICAgIHRleHQ6IFwiYWJjZCBcXG5hYmNcIlxuICAgICAgICAgIGN1cnNvcjogWzAsIDRdXG4gICAgICAgICAgbW9kZTogJ25vcm1hbCdcblxuICAgICAgaXQgXCJkZWxldGVzIHRvIHRoZSBiZWdpbm5pbmcgb2YgdGhlIG5leHQgd29yZFwiLCAtPlxuICAgICAgICBzZXQgdGV4dDogJ2FiY2QgZWZnJywgY3Vyc29yOiBbMCwgMl1cbiAgICAgICAgZW5zdXJlICdkIHcnLCB0ZXh0OiAnYWJlZmcnLCBjdXJzb3I6IFswLCAyXVxuICAgICAgICBzZXQgdGV4dDogJ29uZSB0d28gdGhyZWUgZm91cicsIGN1cnNvcjogWzAsIDBdXG4gICAgICAgIGVuc3VyZSAnZCAzIHcnLCB0ZXh0OiAnZm91cicsIGN1cnNvcjogWzAsIDBdXG5cbiAgICBkZXNjcmliZSBcIndoZW4gZm9sbG93ZWQgYnkgYW4gaXdcIiwgLT5cbiAgICAgIGl0IFwiZGVsZXRlcyB0aGUgY29udGFpbmluZyB3b3JkXCIsIC0+XG4gICAgICAgIHNldCB0ZXh0OiBcIjEyMzQ1IGFiY2RlIEFCQ0RFXCIsIGN1cnNvcjogWzAsIDldXG5cbiAgICAgICAgZW5zdXJlICdkJywgbW9kZTogJ29wZXJhdG9yLXBlbmRpbmcnXG5cbiAgICAgICAgZW5zdXJlICdpIHcnLFxuICAgICAgICAgIHRleHQ6IFwiMTIzNDUgIEFCQ0RFXCJcbiAgICAgICAgICBjdXJzb3I6IFswLCA2XVxuICAgICAgICAgIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiAnYWJjZGUnXG4gICAgICAgICAgbW9kZTogJ25vcm1hbCdcblxuICAgIGRlc2NyaWJlIFwid2hlbiBmb2xsb3dlZCBieSBhIGpcIiwgLT5cbiAgICAgIG9yaWdpbmFsVGV4dCA9IFwiXCJcIlxuICAgICAgICAxMjM0NVxuICAgICAgICBhYmNkZVxuICAgICAgICBBQkNERVxcblxuICAgICAgICBcIlwiXCJcblxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXQgdGV4dDogb3JpZ2luYWxUZXh0XG5cbiAgICAgIGRlc2NyaWJlIFwib24gdGhlIGJlZ2lubmluZyBvZiB0aGUgZmlsZVwiLCAtPlxuICAgICAgICBpdCBcImRlbGV0ZXMgdGhlIG5leHQgdHdvIGxpbmVzXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzAsIDBdXG4gICAgICAgICAgZW5zdXJlICdkIGonLCB0ZXh0OiAnQUJDREVcXG4nXG5cbiAgICAgIGRlc2NyaWJlIFwib24gdGhlIG1pZGRsZSBvZiBzZWNvbmQgbGluZVwiLCAtPlxuICAgICAgICBpdCBcImRlbGV0ZXMgdGhlIGxhc3QgdHdvIGxpbmVzXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzEsIDJdXG4gICAgICAgICAgZW5zdXJlICdkIGonLCB0ZXh0OiAnMTIzNDVcXG4nXG5cbiAgICAgIGRlc2NyaWJlIFwid2hlbiBjdXJzb3IgaXMgb24gYmxhbmsgbGluZVwiLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgc2V0XG4gICAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgICAgYVxuXG5cbiAgICAgICAgICAgICAgYlxcblxuICAgICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgIGN1cnNvcjogWzEsIDBdXG4gICAgICAgIGl0IFwiZGVsZXRlcyBib3RoIGxpbmVzXCIsIC0+XG4gICAgICAgICAgZW5zdXJlICdkIGonLCB0ZXh0OiBcImFcXG5iXFxuXCIsIGN1cnNvcjogWzEsIDBdXG5cbiAgICBkZXNjcmliZSBcIndoZW4gZm9sbG93ZWQgYnkgYW4ga1wiLCAtPlxuICAgICAgb3JpZ2luYWxUZXh0ID0gXCJcIlwiXG4gICAgICAgIDEyMzQ1XG4gICAgICAgIGFiY2RlXG4gICAgICAgIEFCQ0RFXG4gICAgICAgIFwiXCJcIlxuXG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldCB0ZXh0OiBvcmlnaW5hbFRleHRcblxuICAgICAgZGVzY3JpYmUgXCJvbiB0aGUgZW5kIG9mIHRoZSBmaWxlXCIsIC0+XG4gICAgICAgIGl0IFwiZGVsZXRlcyB0aGUgYm90dG9tIHR3byBsaW5lc1wiLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFsyLCA0XVxuICAgICAgICAgIGVuc3VyZSAnZCBrJywgdGV4dDogJzEyMzQ1XFxuJ1xuXG4gICAgICBkZXNjcmliZSBcIm9uIHRoZSBiZWdpbm5pbmcgb2YgdGhlIGZpbGVcIiwgLT5cbiAgICAgICAgeGl0IFwiZGVsZXRlcyBub3RoaW5nXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzAsIDBdXG4gICAgICAgICAgZW5zdXJlICdkIGsnLCB0ZXh0OiBvcmlnaW5hbFRleHRcblxuICAgICAgZGVzY3JpYmUgXCJ3aGVuIG9uIHRoZSBtaWRkbGUgb2Ygc2Vjb25kIGxpbmVcIiwgLT5cbiAgICAgICAgaXQgXCJkZWxldGVzIHRoZSBmaXJzdCB0d28gbGluZXNcIiwgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMSwgMl1cbiAgICAgICAgICBlbnN1cmUgJ2QgaycsIHRleHQ6ICdBQkNERSdcblxuICAgICAgZGVzY3JpYmUgXCJ3aGVuIGN1cnNvciBpcyBvbiBibGFuayBsaW5lXCIsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBzZXRcbiAgICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgICBhXG5cblxuICAgICAgICAgICAgICBiXFxuXG4gICAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgY3Vyc29yOiBbMiwgMF1cbiAgICAgICAgaXQgXCJkZWxldGVzIGJvdGggbGluZXNcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJ2QgaycsIHRleHQ6IFwiYVxcbmJcXG5cIiwgY3Vyc29yOiBbMSwgMF1cblxuICAgIGRlc2NyaWJlIFwid2hlbiBmb2xsb3dlZCBieSBhIEdcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgb3JpZ2luYWxUZXh0ID0gXCIxMjM0NVxcbmFiY2RlXFxuQUJDREVcIlxuICAgICAgICBzZXQgdGV4dDogb3JpZ2luYWxUZXh0XG5cbiAgICAgIGRlc2NyaWJlIFwib24gdGhlIGJlZ2lubmluZyBvZiB0aGUgc2Vjb25kIGxpbmVcIiwgLT5cbiAgICAgICAgaXQgXCJkZWxldGVzIHRoZSBib3R0b20gdHdvIGxpbmVzXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzEsIDBdXG4gICAgICAgICAgZW5zdXJlICdkIEcnLCB0ZXh0OiAnMTIzNDVcXG4nXG5cbiAgICAgIGRlc2NyaWJlIFwib24gdGhlIG1pZGRsZSBvZiB0aGUgc2Vjb25kIGxpbmVcIiwgLT5cbiAgICAgICAgaXQgXCJkZWxldGVzIHRoZSBib3R0b20gdHdvIGxpbmVzXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzEsIDJdXG4gICAgICAgICAgZW5zdXJlICdkIEcnLCB0ZXh0OiAnMTIzNDVcXG4nXG5cbiAgICBkZXNjcmliZSBcIndoZW4gZm9sbG93ZWQgYnkgYSBnb3RvIGxpbmUgR1wiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBvcmlnaW5hbFRleHQgPSBcIjEyMzQ1XFxuYWJjZGVcXG5BQkNERVwiXG4gICAgICAgIHNldCB0ZXh0OiBvcmlnaW5hbFRleHRcblxuICAgICAgZGVzY3JpYmUgXCJvbiB0aGUgYmVnaW5uaW5nIG9mIHRoZSBzZWNvbmQgbGluZVwiLCAtPlxuICAgICAgICBpdCBcImRlbGV0ZXMgdGhlIGJvdHRvbSB0d28gbGluZXNcIiwgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMSwgMF1cbiAgICAgICAgICBlbnN1cmUgJ2QgMiBHJywgdGV4dDogJzEyMzQ1XFxuQUJDREUnXG5cbiAgICAgIGRlc2NyaWJlIFwib24gdGhlIG1pZGRsZSBvZiB0aGUgc2Vjb25kIGxpbmVcIiwgLT5cbiAgICAgICAgaXQgXCJkZWxldGVzIHRoZSBib3R0b20gdHdvIGxpbmVzXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzEsIDJdXG4gICAgICAgICAgZW5zdXJlICdkIDIgRycsIHRleHQ6ICcxMjM0NVxcbkFCQ0RFJ1xuXG4gICAgZGVzY3JpYmUgXCJ3aGVuIGZvbGxvd2VkIGJ5IGEgdClcIiwgLT5cbiAgICAgIGRlc2NyaWJlIFwid2l0aCB0aGUgZW50aXJlIGxpbmUgeWFua2VkIGJlZm9yZVwiLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgc2V0IHRleHQ6IFwidGVzdCAoeHl6KVwiLCBjdXJzb3I6IFswLCA2XVxuXG4gICAgICAgIGl0IFwiZGVsZXRlcyB1bnRpbCB0aGUgY2xvc2luZyBwYXJlbnRoZXNpc1wiLCAtPlxuICAgICAgICAgIGVuc3VyZSBbJ2QgdCcsIGlucHV0OiAnKSddLFxuICAgICAgICAgICAgdGV4dDogJ3Rlc3QgKCknXG4gICAgICAgICAgICBjdXJzb3I6IFswLCA2XVxuXG4gICAgZGVzY3JpYmUgXCJ3aXRoIG11bHRpcGxlIGN1cnNvcnNcIiwgLT5cbiAgICAgIGl0IFwiZGVsZXRlcyBlYWNoIHNlbGVjdGlvblwiLCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIGFiY2RcbiAgICAgICAgICAgIDEyMzRcbiAgICAgICAgICAgIEFCQ0RcXG5cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIGN1cnNvcjogW1swLCAxXSwgWzEsIDJdLCBbMiwgM11dXG5cbiAgICAgICAgZW5zdXJlICdkIGUnLFxuICAgICAgICAgIHRleHQ6IFwiYVxcbjEyXFxuQUJDXCJcbiAgICAgICAgICBjdXJzb3I6IFtbMCwgMF0sIFsxLCAxXSwgWzIsIDJdXVxuXG4gICAgICBpdCBcImRvZXNuJ3QgZGVsZXRlIGVtcHR5IHNlbGVjdGlvbnNcIiwgLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dDogXCJhYmNkXFxuYWJjXFxuYWJkXCJcbiAgICAgICAgICBjdXJzb3I6IFtbMCwgMF0sIFsxLCAwXSwgWzIsIDBdXVxuXG4gICAgICAgIGVuc3VyZSBbJ2QgdCcsIGlucHV0OiAnZCddLFxuICAgICAgICAgIHRleHQ6IFwiZFxcbmFiY1xcbmRcIlxuICAgICAgICAgIGN1cnNvcjogW1swLCAwXSwgWzEsIDBdLCBbMiwgMF1dXG5cbiAgICBkZXNjcmliZSBcInN0YXlPbkRlbGV0ZSBzZXR0aW5nXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldHRpbmdzLnNldCgnc3RheU9uRGVsZXRlJywgdHJ1ZSlcbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dF86IFwiXCJcIlxuICAgICAgICAgIF9fXzMzMzNcbiAgICAgICAgICBfXzIyMjJcbiAgICAgICAgICBfMTExMVxuICAgICAgICAgIF9fMjIyMlxuICAgICAgICAgIF9fXzMzMzNcXG5cbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICBjdXJzb3I6IFswLCAzXVxuXG4gICAgICBkZXNjcmliZSBcInRhcmdldCByYW5nZSBpcyBsaW5ld2lzZSByYW5nZVwiLCAtPlxuICAgICAgICBpdCBcImtlZXAgb3JpZ2luYWwgY29sdW1uIGFmdGVyIGRlbGV0ZVwiLCAtPlxuICAgICAgICAgIGVuc3VyZSBcImQgZFwiLCBjdXJzb3I6IFswLCAzXSwgdGV4dF86IFwiX18yMjIyXFxuXzExMTFcXG5fXzIyMjJcXG5fX18zMzMzXFxuXCJcbiAgICAgICAgICBlbnN1cmUgXCIuXCIsIGN1cnNvcjogWzAsIDNdLCB0ZXh0XzogXCJfMTExMVxcbl9fMjIyMlxcbl9fXzMzMzNcXG5cIlxuICAgICAgICAgIGVuc3VyZSBcIi5cIiwgY3Vyc29yOiBbMCwgM10sIHRleHRfOiBcIl9fMjIyMlxcbl9fXzMzMzNcXG5cIlxuICAgICAgICAgIGVuc3VyZSBcIi5cIiwgY3Vyc29yOiBbMCwgM10sIHRleHRfOiBcIl9fXzMzMzNcXG5cIlxuXG4gICAgICAgIGl0IFwidl9EIGFsc28ga2VlcCBvcmlnaW5hbCBjb2x1bW4gYWZ0ZXIgZGVsZXRlXCIsIC0+XG4gICAgICAgICAgZW5zdXJlIFwidiAyIGogRFwiLCBjdXJzb3I6IFswLCAzXSwgdGV4dF86IFwiX18yMjIyXFxuX19fMzMzM1xcblwiXG5cbiAgICAgIGRlc2NyaWJlIFwidGFyZ2V0IHJhbmdlIGlzIHRleHQgb2JqZWN0XCIsIC0+XG4gICAgICAgIGRlc2NyaWJlIFwidGFyZ2V0IGlzIGluZGVudFwiLCAtPlxuICAgICAgICAgIGluZGVudFRleHQgPSBcIlwiXCJcbiAgICAgICAgICAwMDAwMDAwMDAwMDAwMDAwXG4gICAgICAgICAgICAyMjIyMjIyMjIyMjIyMlxuICAgICAgICAgICAgMjIyMjIyMjIyMjIyMjJcbiAgICAgICAgICAgIDIyMjIyMjIyMjIyMjIyXG4gICAgICAgICAgMDAwMDAwMDAwMDAwMDAwMFxcblxuICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIHRleHREYXRhID0gbmV3IFRleHREYXRhKGluZGVudFRleHQpXG4gICAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgICAgc2V0XG4gICAgICAgICAgICAgIHRleHQ6IHRleHREYXRhLmdldFJhdygpXG5cbiAgICAgICAgICBpdCBcIltmcm9tIHRvcF0ga2VlcCBjb2x1bW5cIiwgLT5cbiAgICAgICAgICAgIHNldCBjdXJzb3I6IFsxLCAxMF1cbiAgICAgICAgICAgIGVuc3VyZSAnZCBpIGknLCBjdXJzb3I6IFsxLCAxMF0sIHRleHQ6IHRleHREYXRhLmdldExpbmVzKFswLCA0XSlcbiAgICAgICAgICBpdCBcIltmcm9tIG1pZGRsZV0ga2VlcCBjb2x1bW5cIiwgLT5cbiAgICAgICAgICAgIHNldCBjdXJzb3I6IFsyLCAxMF1cbiAgICAgICAgICAgIGVuc3VyZSAnZCBpIGknLCBjdXJzb3I6IFsxLCAxMF0sIHRleHQ6IHRleHREYXRhLmdldExpbmVzKFswLCA0XSlcbiAgICAgICAgICBpdCBcIltmcm9tIGJvdHRvbV0ga2VlcCBjb2x1bW5cIiwgLT5cbiAgICAgICAgICAgIHNldCBjdXJzb3I6IFszLCAxMF1cbiAgICAgICAgICAgIGVuc3VyZSAnZCBpIGknLCBjdXJzb3I6IFsxLCAxMF0sIHRleHQ6IHRleHREYXRhLmdldExpbmVzKFswLCA0XSlcblxuICAgICAgICBkZXNjcmliZSBcInRhcmdldCBpcyBwYXJhZ3JhcGhcIiwgLT5cbiAgICAgICAgICBwYXJhZ3JhcGhUZXh0ID0gXCJcIlwiXG4gICAgICAgICAgICBwMS0tLS0tLS0tLS0tLS0tLVxuICAgICAgICAgICAgcDEtLS0tLS0tLS0tLS0tLS1cbiAgICAgICAgICAgIHAxLS0tLS0tLS0tLS0tLS0tXG5cbiAgICAgICAgICAgIHAyLS0tLS0tLS0tLS0tLS0tXG4gICAgICAgICAgICBwMi0tLS0tLS0tLS0tLS0tLVxuICAgICAgICAgICAgcDItLS0tLS0tLS0tLS0tLS1cblxuICAgICAgICAgICAgcDMtLS0tLS0tLS0tLS0tLS1cbiAgICAgICAgICAgIHAzLS0tLS0tLS0tLS0tLS0tXG4gICAgICAgICAgICBwMy0tLS0tLS0tLS0tLS0tLVxcblxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgICB0ZXh0RGF0YSA9IG5ldyBUZXh0RGF0YShwYXJhZ3JhcGhUZXh0KVxuICAgICAgICAgIFAxID0gWzAsIDEsIDJdXG4gICAgICAgICAgQjEgPSAzXG4gICAgICAgICAgUDIgPSBbNCwgNSwgNl1cbiAgICAgICAgICBCMiA9IDdcbiAgICAgICAgICBQMyA9IFs4LCA5LCAxMF1cbiAgICAgICAgICBCMyA9IDExXG5cbiAgICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgICBzZXRcbiAgICAgICAgICAgICAgdGV4dDogdGV4dERhdGEuZ2V0UmF3KClcblxuICAgICAgICAgIGl0IFwic2V0IGN1cnNvciB0byBzdGFydCBvZiBkZWxldGlvbiBhZnRlciBkZWxldGUgW2Zyb20gYm90dG9tIG9mIHBhcmFncmFwaF1cIiwgLT5cbiAgICAgICAgICAgIHNldCBjdXJzb3I6IFswLCAwXVxuICAgICAgICAgICAgZW5zdXJlICdkIGkgcCcsIGN1cnNvcjogWzAsIDBdLCB0ZXh0OiB0ZXh0RGF0YS5nZXRMaW5lcyhbQjEuLkIzXSwgY2hvbXA6IHRydWUpXG4gICAgICAgICAgICBlbnN1cmUgJ2ogLicsIGN1cnNvcjogWzEsIDBdLCB0ZXh0OiB0ZXh0RGF0YS5nZXRMaW5lcyhbQjEsIEIyLCBQMy4uLiwgQjNdLCBjaG9tcDogdHJ1ZSlcbiAgICAgICAgICAgIGVuc3VyZSAnaiAuJywgY3Vyc29yOiBbMSwgMF0sIHRleHQ6IHRleHREYXRhLmdldExpbmVzKFtCMSwgQjIsIEIzXSwgY2hvbXA6IHRydWUpXG4gICAgICAgICAgaXQgXCJzZXQgY3Vyc29yIHRvIHN0YXJ0IG9mIGRlbGV0aW9uIGFmdGVyIGRlbGV0ZSBbZnJvbSBtaWRkbGUgb2YgcGFyYWdyYXBoXVwiLCAtPlxuICAgICAgICAgICAgc2V0IGN1cnNvcjogWzEsIDBdXG4gICAgICAgICAgICBlbnN1cmUgJ2QgaSBwJywgY3Vyc29yOiBbMCwgMF0sIHRleHQ6IHRleHREYXRhLmdldExpbmVzKFtCMS4uQjNdLCBjaG9tcDogdHJ1ZSlcbiAgICAgICAgICAgIGVuc3VyZSAnMiBqIC4nLCBjdXJzb3I6IFsxLCAwXSwgdGV4dDogdGV4dERhdGEuZ2V0TGluZXMoW0IxLCBCMiwgUDMuLi4sIEIzXSwgY2hvbXA6IHRydWUpXG4gICAgICAgICAgICBlbnN1cmUgJzIgaiAuJywgY3Vyc29yOiBbMSwgMF0sIHRleHQ6IHRleHREYXRhLmdldExpbmVzKFtCMSwgQjIsIEIzXSwgY2hvbXA6IHRydWUpXG4gICAgICAgICAgaXQgXCJzZXQgY3Vyc29yIHRvIHN0YXJ0IG9mIGRlbGV0aW9uIGFmdGVyIGRlbGV0ZSBbZnJvbSBib3R0b20gb2YgcGFyYWdyYXBoXVwiLCAtPlxuICAgICAgICAgICAgc2V0IGN1cnNvcjogWzEsIDBdXG4gICAgICAgICAgICBlbnN1cmUgJ2QgaSBwJywgY3Vyc29yOiBbMCwgMF0sIHRleHQ6IHRleHREYXRhLmdldExpbmVzKFtCMS4uQjNdLCBjaG9tcDogdHJ1ZSlcbiAgICAgICAgICAgIGVuc3VyZSAnMyBqIC4nLCBjdXJzb3I6IFsxLCAwXSwgdGV4dDogdGV4dERhdGEuZ2V0TGluZXMoW0IxLCBCMiwgUDMuLi4sIEIzXSwgY2hvbXA6IHRydWUpXG4gICAgICAgICAgICBlbnN1cmUgJzMgaiAuJywgY3Vyc29yOiBbMSwgMF0sIHRleHQ6IHRleHREYXRhLmdldExpbmVzKFtCMSwgQjIsIEIzXSwgY2hvbXA6IHRydWUpXG5cbiAgZGVzY3JpYmUgXCJ0aGUgRCBrZXliaW5kaW5nXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2V0XG4gICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAwMDAwXG4gICAgICAgIDExMTFcbiAgICAgICAgMjIyMlxuICAgICAgICAzMzMzXG4gICAgICAgIFwiXCJcIlxuICAgICAgICBjdXJzb3I6IFswLCAxXVxuXG4gICAgaXQgXCJkZWxldGVzIHRoZSBjb250ZW50cyB1bnRpbCB0aGUgZW5kIG9mIHRoZSBsaW5lXCIsIC0+XG4gICAgICBlbnN1cmUgJ0QnLCB0ZXh0OiBcIjBcXG4xMTExXFxuMjIyMlxcbjMzMzNcIlxuXG4gICAgaXQgXCJpbiB2aXN1YWwtbW9kZSwgaXQgZGVsZXRlIHdob2xlIGxpbmVcIiwgLT5cbiAgICAgIGVuc3VyZSAndiBEJywgdGV4dDogXCIxMTExXFxuMjIyMlxcbjMzMzNcIlxuICAgICAgZW5zdXJlIFwidiBqIERcIiwgdGV4dDogXCIzMzMzXCJcblxuICBkZXNjcmliZSBcInRoZSB5IGtleWJpbmRpbmdcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXRcbiAgICAgICAgY3Vyc29yOiBbMCwgNF1cbiAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgIDAxMiAzNDVcbiAgICAgICAgYWJjXFxuXG4gICAgICAgIFwiXCJcIlxuXG4gICAgZGVzY3JpYmUgXCJ3aGVuIHVzZUNsaXBib2FyZEFzRGVmYXVsdFJlZ2lzdGVyIGVuYWJsZWRcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0dGluZ3Muc2V0KCd1c2VDbGlwYm9hcmRBc0RlZmF1bHRSZWdpc3RlcicsIHRydWUpXG4gICAgICAgIGF0b20uY2xpcGJvYXJkLndyaXRlKCdfX19fX19fX19fXycpXG4gICAgICAgIGVuc3VyZSByZWdpc3RlcjogJ1wiJzogdGV4dDogJ19fX19fX19fX19fJ1xuXG4gICAgICBkZXNjcmliZSBcInJlYWQvd3JpdGUgdG8gY2xpcGJvYXJkIHRocm91Z2ggcmVnaXN0ZXJcIiwgLT5cbiAgICAgICAgaXQgXCJ3cml0ZXMgdG8gY2xpcGJvYXJkIHdpdGggZGVmYXVsdCByZWdpc3RlclwiLCAtPlxuICAgICAgICAgIHNhdmVkVGV4dCA9ICcwMTIgMzQ1XFxuJ1xuICAgICAgICAgIGVuc3VyZSAneSB5JywgcmVnaXN0ZXI6ICdcIic6IHRleHQ6IHNhdmVkVGV4dFxuICAgICAgICAgIGV4cGVjdChhdG9tLmNsaXBib2FyZC5yZWFkKCkpLnRvQmUoc2F2ZWRUZXh0KVxuXG4gICAgZGVzY3JpYmUgXCJ2aXN1YWwtbW9kZS5saW5ld2lzZVwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICBjdXJzb3I6IFswLCA0XVxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgMDAwMDAwXG4gICAgICAgICAgICAxMTExMTFcbiAgICAgICAgICAgIDIyMjIyMlxcblxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgIGRlc2NyaWJlIFwic2VsZWN0aW9uIG5vdCByZXZlcnNlZFwiLCAtPlxuICAgICAgICBpdCBcInNhdmVzIHRvIHJlZ2lzdGVyKHR5cGU9bGluZXdpc2UpLCBjdXJzb3IgbW92ZSB0byBzdGFydCBvZiB0YXJnZXRcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgXCJWIGogeVwiLFxuICAgICAgICAgICAgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgICAgIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiBcIjAwMDAwMFxcbjExMTExMVxcblwiLCB0eXBlOiAnbGluZXdpc2UnXG5cbiAgICAgIGRlc2NyaWJlIFwic2VsZWN0aW9uIGlzIHJldmVyc2VkXCIsIC0+XG4gICAgICAgIGl0IFwic2F2ZXMgdG8gcmVnaXN0ZXIodHlwZT1saW5ld2lzZSksIGN1cnNvciBkb2Vzbid0IG1vdmVcIiwgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMiwgMl1cbiAgICAgICAgICBlbnN1cmUgXCJWIGsgeVwiLFxuICAgICAgICAgICAgY3Vyc29yOiBbMSwgMl1cbiAgICAgICAgICAgIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiBcIjExMTExMVxcbjIyMjIyMlxcblwiLCB0eXBlOiAnbGluZXdpc2UnXG5cbiAgICBkZXNjcmliZSBcInZpc3VhbC1tb2RlLmJsb2Nrd2lzZVwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0Q186IFwiXCJcIlxuICAgICAgICAgIDAwMDAwMFxuICAgICAgICAgIDEhMTExMTFcbiAgICAgICAgICAyMjIyMjJcbiAgICAgICAgICAzMzMzMzNcbiAgICAgICAgICA0fDQ0NDQ0XG4gICAgICAgICAgNTU1NTU1XFxuXG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgIGVuc3VyZSBcImN0cmwtdiBsIGwgalwiLFxuICAgICAgICAgIHNlbGVjdGVkVGV4dE9yZGVyZWQ6IFtcIjExMVwiLCBcIjIyMlwiLCBcIjQ0NFwiLCBcIjU1NVwiXVxuICAgICAgICAgIG1vZGU6IFsndmlzdWFsJywgJ2Jsb2Nrd2lzZSddXG5cbiAgICAgIGRlc2NyaWJlIFwid2hlbiBzdGF5T25ZYW5rID0gZmFsc2VcIiwgLT5cbiAgICAgICAgaXQgXCJwbGFjZSBjdXJzb3IgYXQgc3RhcnQgb2YgYmxvY2sgYWZ0ZXIgeWFua1wiLCAtPlxuICAgICAgICAgIGVuc3VyZSBcInlcIixcbiAgICAgICAgICAgIG1vZGU6ICdub3JtYWwnXG4gICAgICAgICAgICB0ZXh0Q186IFwiXCJcIlxuICAgICAgICAgICAgICAwMDAwMDBcbiAgICAgICAgICAgICAgMSExMTExMVxuICAgICAgICAgICAgICAyMjIyMjJcbiAgICAgICAgICAgICAgMzMzMzMzXG4gICAgICAgICAgICAgIDR8NDQ0NDRcbiAgICAgICAgICAgICAgNTU1NTU1XFxuXG4gICAgICAgICAgICAgIFwiXCJcIlxuICAgICAgZGVzY3JpYmUgXCJ3aGVuIHN0YXlPbllhbmsgPSB0cnVlXCIsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBzZXR0aW5ncy5zZXQoJ3N0YXlPbllhbmsnLCB0cnVlKVxuICAgICAgICBpdCBcInBsYWNlIGN1cnNvciBhdCBoZWFkIG9mIGJsb2NrIGFmdGVyIHlhbmtcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgXCJ5XCIsXG4gICAgICAgICAgICBtb2RlOiAnbm9ybWFsJ1xuICAgICAgICAgICAgdGV4dENfOiBcIlwiXCJcbiAgICAgICAgICAgICAgMDAwMDAwXG4gICAgICAgICAgICAgIDExMTExMVxuICAgICAgICAgICAgICAyMjIhMjIyXG4gICAgICAgICAgICAgIDMzMzMzM1xuICAgICAgICAgICAgICA0NDQ0NDRcbiAgICAgICAgICAgICAgNTU1fDU1NVxcblxuICAgICAgICAgICAgICBcIlwiXCJcblxuICAgIGRlc2NyaWJlIFwieSB5XCIsIC0+XG4gICAgICBpdCBcInNhdmVzIHRvIHJlZ2lzdGVyKHR5cGU9bGluZXdpc2UpLCBjdXJzb3Igc3RheSBhdCBzYW1lIHBvc2l0aW9uXCIsIC0+XG4gICAgICAgIGVuc3VyZSAneSB5JyxcbiAgICAgICAgICBjdXJzb3I6IFswLCA0XVxuICAgICAgICAgIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiBcIjAxMiAzNDVcXG5cIiwgdHlwZTogJ2xpbmV3aXNlJ1xuICAgICAgaXQgXCJbTiB5IHldIHlhbmsgTiBsaW5lLCBzdGFydGluZyBmcm9tIHRoZSBjdXJyZW50XCIsIC0+XG4gICAgICAgIGVuc3VyZSAneSAyIHknLFxuICAgICAgICAgIGN1cnNvcjogWzAsIDRdXG4gICAgICAgICAgcmVnaXN0ZXI6ICdcIic6IHRleHQ6IFwiMDEyIDM0NVxcbmFiY1xcblwiXG4gICAgICBpdCBcIlt5IE4geV0geWFuayBOIGxpbmUsIHN0YXJ0aW5nIGZyb20gdGhlIGN1cnJlbnRcIiwgLT5cbiAgICAgICAgZW5zdXJlICcyIHkgeScsXG4gICAgICAgICAgY3Vyc29yOiBbMCwgNF1cbiAgICAgICAgICByZWdpc3RlcjogJ1wiJzogdGV4dDogXCIwMTIgMzQ1XFxuYWJjXFxuXCJcblxuICAgIGRlc2NyaWJlIFwid2l0aCBhIHJlZ2lzdGVyXCIsIC0+XG4gICAgICBpdCBcInNhdmVzIHRoZSBsaW5lIHRvIHRoZSBhIHJlZ2lzdGVyXCIsIC0+XG4gICAgICAgIGVuc3VyZSBbJ1wiJywgaW5wdXQ6ICdhJywgJ3kgeSddLFxuICAgICAgICAgIHJlZ2lzdGVyOiBhOiB0ZXh0OiBcIjAxMiAzNDVcXG5cIlxuXG4gICAgZGVzY3JpYmUgXCJ3aXRoIEEgcmVnaXN0ZXJcIiwgLT5cbiAgICAgIGl0IFwiYXBwZW5kIHRvIGV4aXN0aW5nIHZhbHVlIG9mIGxvd2VyY2FzZS1uYW1lZCByZWdpc3RlclwiLCAtPlxuICAgICAgICBlbnN1cmUgWydcIicsIGlucHV0OiAnYScsICd5IHknXSwgcmVnaXN0ZXI6IGE6IHRleHQ6IFwiMDEyIDM0NVxcblwiXG4gICAgICAgIGVuc3VyZSBbJ1wiJywgaW5wdXQ6ICdBJywgJ3kgeSddLCByZWdpc3RlcjogYTogdGV4dDogXCIwMTIgMzQ1XFxuMDEyIDM0NVxcblwiXG5cbiAgICBkZXNjcmliZSBcIndpdGggYSBtb3Rpb25cIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0dGluZ3Muc2V0KCd1c2VDbGlwYm9hcmRBc0RlZmF1bHRSZWdpc3RlcicsIGZhbHNlKVxuXG4gICAgICBpdCBcInlhbmsgZnJvbSBoZXJlIHRvIGRlc3RuYXRpb24gb2YgbW90aW9uXCIsIC0+XG4gICAgICAgIGVuc3VyZSAneSBlJywgY3Vyc29yOiBbMCwgNF0sIHJlZ2lzdGVyOiB7J1wiJzogdGV4dDogJzM0NSd9XG5cbiAgICAgIGl0IFwiZG9lcyBub3QgeWFuayB3aGVuIG1vdGlvbiBmYWlsZWRcIiwgLT5cbiAgICAgICAgZW5zdXJlIFsneSB0JywgaW5wdXQ6ICd4J10sIHJlZ2lzdGVyOiB7J1wiJzogdGV4dDogdW5kZWZpbmVkfVxuXG4gICAgICBpdCBcInlhbmsgYW5kIG1vdmUgY3Vyc29yIHRvIHN0YXJ0IG9mIHRhcmdldFwiLCAtPlxuICAgICAgICBlbnN1cmUgJ3kgaCcsXG4gICAgICAgICAgY3Vyc29yOiBbMCwgM11cbiAgICAgICAgICByZWdpc3RlcjogJ1wiJzogdGV4dDogJyAnXG5cbiAgICAgIGl0IFwiW3dpdGggbGluZXdpc2UgbW90aW9uXSB5YW5rIGFuZCBkZXNuJ3QgbW92ZSBjdXJzb3JcIiwgLT5cbiAgICAgICAgZW5zdXJlICd5IGonLFxuICAgICAgICAgIGN1cnNvcjogWzAsIDRdXG4gICAgICAgICAgcmVnaXN0ZXI6IHsnXCInOiB0ZXh0OiBcIjAxMiAzNDVcXG5hYmNcXG5cIiwgdHlwZTogJ2xpbmV3aXNlJ31cblxuICAgIGRlc2NyaWJlIFwid2l0aCBhIHRleHQtb2JqXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIGN1cnNvcjogWzIsIDhdXG4gICAgICAgICAgdGV4dDogXCJcIlwiXG5cbiAgICAgICAgICAxc3QgcGFyYWdyYXBoXG4gICAgICAgICAgMXN0IHBhcmFncmFwaFxuXG4gICAgICAgICAgMm4gcGFyYWdyYXBoXG4gICAgICAgICAgMm4gcGFyYWdyYXBoXFxuXG4gICAgICAgICAgXCJcIlwiXG4gICAgICBpdCBcImlubmVyLXdvcmQgYW5kIG1vdmUgY3Vyc29yIHRvIHN0YXJ0IG9mIHRhcmdldFwiLCAtPlxuICAgICAgICBlbnN1cmUgJ3kgaSB3JyxcbiAgICAgICAgICByZWdpc3RlcjogJ1wiJzogdGV4dDogXCJwYXJhZ3JhcGhcIlxuICAgICAgICAgIGN1cnNvcjogWzIsIDRdXG5cbiAgICAgIGl0IFwieWFuayB0ZXh0LW9iamVjdCBpbm5lci1wYXJhZ3JhcGggYW5kIG1vdmUgY3Vyc29yIHRvIHN0YXJ0IG9mIHRhcmdldFwiLCAtPlxuICAgICAgICBlbnN1cmUgJ3kgaSBwJyxcbiAgICAgICAgICBjdXJzb3I6IFsxLCAwXVxuICAgICAgICAgIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiBcIjFzdCBwYXJhZ3JhcGhcXG4xc3QgcGFyYWdyYXBoXFxuXCJcblxuICAgIGRlc2NyaWJlIFwid2hlbiBmb2xsb3dlZCBieSBhIEdcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgb3JpZ2luYWxUZXh0ID0gXCJcIlwiXG4gICAgICAgIDEyMzQ1XG4gICAgICAgIGFiY2RlXG4gICAgICAgIEFCQ0RFXFxuXG4gICAgICAgIFwiXCJcIlxuICAgICAgICBzZXQgdGV4dDogb3JpZ2luYWxUZXh0XG5cbiAgICAgIGl0IFwieWFuayBhbmQgZG9lc24ndCBtb3ZlIGN1cnNvclwiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMSwgMF1cbiAgICAgICAgZW5zdXJlICd5IEcnLFxuICAgICAgICAgIHJlZ2lzdGVyOiB7J1wiJzogdGV4dDogXCJhYmNkZVxcbkFCQ0RFXFxuXCIsIHR5cGU6ICdsaW5ld2lzZSd9XG4gICAgICAgICAgY3Vyc29yOiBbMSwgMF1cblxuICAgICAgaXQgXCJ5YW5rIGFuZCBkb2Vzbid0IG1vdmUgY3Vyc29yXCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFsxLCAyXVxuICAgICAgICBlbnN1cmUgJ3kgRycsXG4gICAgICAgICAgcmVnaXN0ZXI6IHsnXCInOiB0ZXh0OiBcImFiY2RlXFxuQUJDREVcXG5cIiwgdHlwZTogJ2xpbmV3aXNlJ31cbiAgICAgICAgICBjdXJzb3I6IFsxLCAyXVxuXG4gICAgZGVzY3JpYmUgXCJ3aGVuIGZvbGxvd2VkIGJ5IGEgZ290byBsaW5lIEdcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgb3JpZ2luYWxUZXh0ID0gXCIxMjM0NVxcbmFiY2RlXFxuQUJDREVcIlxuICAgICAgICBzZXQgdGV4dDogb3JpZ2luYWxUZXh0XG5cbiAgICAgIGRlc2NyaWJlIFwib24gdGhlIGJlZ2lubmluZyBvZiB0aGUgc2Vjb25kIGxpbmVcIiwgLT5cbiAgICAgICAgaXQgXCJkZWxldGVzIHRoZSBib3R0b20gdHdvIGxpbmVzXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzEsIDBdXG4gICAgICAgICAgZW5zdXJlICd5IDIgRyBQJywgdGV4dDogJzEyMzQ1XFxuYWJjZGVcXG5hYmNkZVxcbkFCQ0RFJ1xuXG4gICAgICBkZXNjcmliZSBcIm9uIHRoZSBtaWRkbGUgb2YgdGhlIHNlY29uZCBsaW5lXCIsIC0+XG4gICAgICAgIGl0IFwiZGVsZXRlcyB0aGUgYm90dG9tIHR3byBsaW5lc1wiLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFsxLCAyXVxuICAgICAgICAgIGVuc3VyZSAneSAyIEcgUCcsIHRleHQ6ICcxMjM0NVxcbmFiY2RlXFxuYWJjZGVcXG5BQkNERSdcblxuICAgIGRlc2NyaWJlIFwid2l0aCBtdWx0aXBsZSBjdXJzb3JzXCIsIC0+XG4gICAgICBpdCBcIm1vdmVzIGVhY2ggY3Vyc29yIGFuZCBjb3BpZXMgdGhlIGxhc3Qgc2VsZWN0aW9uJ3MgdGV4dFwiLCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0OiBcIiAgYWJjZFxcbiAgMTIzNFwiXG4gICAgICAgICAgY3Vyc29yOiBbWzAsIDBdLCBbMSwgNV1dXG4gICAgICAgIGVuc3VyZSAneSBeJyxcbiAgICAgICAgICByZWdpc3RlcjogJ1wiJzogdGV4dDogJzEyMydcbiAgICAgICAgICBjdXJzb3I6IFtbMCwgMF0sIFsxLCAyXV1cblxuICAgIGRlc2NyaWJlIFwic3RheU9uWWFuayBzZXR0aW5nXCIsIC0+XG4gICAgICB0ZXh0ID0gbnVsbFxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXR0aW5ncy5zZXQoJ3N0YXlPbllhbmsnLCB0cnVlKVxuXG4gICAgICAgIHRleHQgPSBuZXcgVGV4dERhdGEgXCJcIlwiXG4gICAgICAgICAgMF8yMzQ1NjdcbiAgICAgICAgICAxXzIzNDU2N1xuICAgICAgICAgIDJfMjM0NTY3XG5cbiAgICAgICAgICA0XzIzNDU2N1xcblxuICAgICAgICAgIFwiXCJcIlxuICAgICAgICBzZXQgdGV4dDogdGV4dC5nZXRSYXcoKSwgY3Vyc29yOiBbMSwgMl1cblxuICAgICAgaXQgXCJkb24ndCBtb3ZlIGN1cnNvciBhZnRlciB5YW5rIGZyb20gbm9ybWFsLW1vZGVcIiwgLT5cbiAgICAgICAgZW5zdXJlIFwieSBpIHBcIiwgY3Vyc29yOiBbMSwgMl0sIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiB0ZXh0LmdldExpbmVzKFswLi4yXSlcbiAgICAgICAgZW5zdXJlIFwiaiB5IHlcIiwgY3Vyc29yOiBbMiwgMl0sIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiB0ZXh0LmdldExpbmVzKFsyXSlcbiAgICAgICAgZW5zdXJlIFwiayAuXCIsIGN1cnNvcjogWzEsIDJdLCByZWdpc3RlcjogJ1wiJzogdGV4dDogdGV4dC5nZXRMaW5lcyhbMV0pXG4gICAgICAgIGVuc3VyZSBcInkgaFwiLCBjdXJzb3I6IFsxLCAyXSwgcmVnaXN0ZXI6ICdcIic6IHRleHQ6IFwiX1wiXG4gICAgICAgIGVuc3VyZSBcInkgYlwiLCBjdXJzb3I6IFsxLCAyXSwgcmVnaXN0ZXI6ICdcIic6IHRleHQ6IFwiMV9cIlxuXG4gICAgICBpdCBcImRvbid0IG1vdmUgY3Vyc29yIGFmdGVyIHlhbmsgZnJvbSB2aXN1YWwtbGluZXdpc2VcIiwgLT5cbiAgICAgICAgZW5zdXJlIFwiViB5XCIsIGN1cnNvcjogWzEsIDJdLCByZWdpc3RlcjogJ1wiJzogdGV4dDogdGV4dC5nZXRMaW5lcyhbMV0pXG4gICAgICAgIGVuc3VyZSBcIlYgaiB5XCIsIGN1cnNvcjogWzIsIDJdLCByZWdpc3RlcjogJ1wiJzogdGV4dDogdGV4dC5nZXRMaW5lcyhbMS4uMl0pXG5cbiAgICAgIGl0IFwiZG9uJ3QgbW92ZSBjdXJzb3IgYWZ0ZXIgeWFuayBmcm9tIHZpc3VhbC1jaGFyYWN0ZXJ3aXNlXCIsIC0+XG4gICAgICAgIGVuc3VyZSBcInYgbCBsIHlcIiwgY3Vyc29yOiBbMSwgNF0sIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiBcIjIzNFwiXG4gICAgICAgIGVuc3VyZSBcInYgaCBoIHlcIiwgY3Vyc29yOiBbMSwgMl0sIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiBcIjIzNFwiXG4gICAgICAgIGVuc3VyZSBcInYgaiB5XCIsIGN1cnNvcjogWzIsIDJdLCByZWdpc3RlcjogJ1wiJzogdGV4dDogXCIyMzQ1NjdcXG4yXzJcIlxuICAgICAgICBlbnN1cmUgXCJ2IDIgayB5XCIsIGN1cnNvcjogWzAsIDJdLCByZWdpc3RlcjogJ1wiJzogdGV4dDogXCIyMzQ1NjdcXG4xXzIzNDU2N1xcbjJfMlwiXG5cbiAgZGVzY3JpYmUgXCJ0aGUgeXkga2V5YmluZGluZ1wiLCAtPlxuICAgIGRlc2NyaWJlIFwib24gYSBzaW5nbGUgbGluZSBmaWxlXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldCB0ZXh0OiBcImV4Y2xhbWF0aW9uIVxcblwiLCBjdXJzb3I6IFswLCAwXVxuXG4gICAgICBpdCBcImNvcGllcyB0aGUgZW50aXJlIGxpbmUgYW5kIHBhc3RlcyBpdCBjb3JyZWN0bHlcIiwgLT5cbiAgICAgICAgZW5zdXJlICd5IHkgcCcsXG4gICAgICAgICAgcmVnaXN0ZXI6ICdcIic6IHRleHQ6IFwiZXhjbGFtYXRpb24hXFxuXCJcbiAgICAgICAgICB0ZXh0OiBcImV4Y2xhbWF0aW9uIVxcbmV4Y2xhbWF0aW9uIVxcblwiXG5cbiAgICBkZXNjcmliZSBcIm9uIGEgc2luZ2xlIGxpbmUgZmlsZSB3aXRoIG5vIG5ld2xpbmVcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0IHRleHQ6IFwibm8gbmV3bGluZSFcIiwgY3Vyc29yOiBbMCwgMF1cblxuICAgICAgaXQgXCJjb3BpZXMgdGhlIGVudGlyZSBsaW5lIGFuZCBwYXN0ZXMgaXQgY29ycmVjdGx5XCIsIC0+XG4gICAgICAgIGVuc3VyZSAneSB5IHAnLFxuICAgICAgICAgIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiBcIm5vIG5ld2xpbmUhXFxuXCJcbiAgICAgICAgICB0ZXh0OiBcIm5vIG5ld2xpbmUhXFxubm8gbmV3bGluZSFcXG5cIlxuXG4gICAgICBpdCBcImNvcGllcyB0aGUgZW50aXJlIGxpbmUgYW5kIHBhc3RlcyBpdCByZXNwZWN0aW5nIGNvdW50IGFuZCBuZXcgbGluZXNcIiwgLT5cbiAgICAgICAgZW5zdXJlICd5IHkgMiBwJyxcbiAgICAgICAgICByZWdpc3RlcjogJ1wiJzogdGV4dDogXCJubyBuZXdsaW5lIVxcblwiXG4gICAgICAgICAgdGV4dDogXCJubyBuZXdsaW5lIVxcbm5vIG5ld2xpbmUhXFxubm8gbmV3bGluZSFcXG5cIlxuXG4gIGRlc2NyaWJlIFwidGhlIFkga2V5YmluZGluZ1wiLCAtPlxuICAgIHRleHQgPSBudWxsXG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgdGV4dCA9IFwiXCJcIlxuICAgICAgMDEyIDM0NVxuICAgICAgYWJjXFxuXG4gICAgICBcIlwiXCJcbiAgICAgIHNldCB0ZXh0OiB0ZXh0LCBjdXJzb3I6IFswLCA0XVxuXG4gICAgaXQgXCJzYXZlcyB0aGUgbGluZSB0byB0aGUgZGVmYXVsdCByZWdpc3RlclwiLCAtPlxuICAgICAgZW5zdXJlICdZJywgY3Vyc29yOiBbMCwgNF0sIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiBcIjAxMiAzNDVcXG5cIlxuXG4gICAgaXQgXCJ5YW5rIHRoZSB3aG9sZSBsaW5lcyB0byB0aGUgZGVmYXVsdCByZWdpc3RlclwiLCAtPlxuICAgICAgZW5zdXJlICd2IGogWScsIGN1cnNvcjogWzAsIDBdLCByZWdpc3RlcjogJ1wiJzogdGV4dDogdGV4dFxuXG4gIGRlc2NyaWJlIFwidGhlIHAga2V5YmluZGluZ1wiLCAtPlxuICAgIGRlc2NyaWJlIFwid2l0aCBzaW5nbGUgbGluZSBjaGFyYWN0ZXIgY29udGVudHNcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0dGluZ3Muc2V0KCd1c2VDbGlwYm9hcmRBc0RlZmF1bHRSZWdpc3RlcicsIGZhbHNlKVxuXG4gICAgICAgIHNldCB0ZXh0QzogXCJ8MDEyXFxuXCJcbiAgICAgICAgc2V0IHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiAnMzQ1J1xuICAgICAgICBzZXQgcmVnaXN0ZXI6ICdhJzogdGV4dDogJ2EnXG4gICAgICAgIGF0b20uY2xpcGJvYXJkLndyaXRlKFwiY2xpcFwiKVxuXG4gICAgICBkZXNjcmliZSBcImZyb20gdGhlIGRlZmF1bHQgcmVnaXN0ZXJcIiwgLT5cbiAgICAgICAgaXQgXCJpbnNlcnRzIHRoZSBjb250ZW50c1wiLCAtPlxuICAgICAgICAgIGVuc3VyZSBcInBcIiwgdGV4dEM6IFwiMDM0fDUxMlxcblwiXG5cbiAgICAgIGRlc2NyaWJlIFwiYXQgdGhlIGVuZCBvZiBhIGxpbmVcIiwgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIHNldCB0ZXh0QzogXCIwMXwyXFxuXCJcbiAgICAgICAgaXQgXCJwb3NpdGlvbnMgY3Vyc29yIGNvcnJlY3RseVwiLCAtPlxuICAgICAgICAgIGVuc3VyZSBcInBcIiwgdGV4dEM6IFwiMDEyMzR8NVxcblwiXG5cbiAgICAgIGRlc2NyaWJlIFwicGFzdGUgdG8gZW1wdHkgbGluZVwiLCAtPlxuICAgICAgICBpdCBcInBhc3RlIGNvbnRlbnQgdG8gdGhhdCBlbXB0eSBsaW5lXCIsIC0+XG4gICAgICAgICAgc2V0XG4gICAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICAxc3RcbiAgICAgICAgICAgIHxcbiAgICAgICAgICAgIDNyZFxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICByZWdpc3RlcjogJ1wiJzogdGV4dDogJzJuZCdcblxuICAgICAgICAgIGVuc3VyZSAncCcsXG4gICAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICAxc3RcbiAgICAgICAgICAgIDJufGRcbiAgICAgICAgICAgIDNyZFxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgIGRlc2NyaWJlIFwid2hlbiB1c2VDbGlwYm9hcmRBc0RlZmF1bHRSZWdpc3RlciBlbmFibGVkXCIsIC0+XG4gICAgICAgIGl0IFwiaW5zZXJ0cyBjb250ZW50cyBmcm9tIGNsaXBib2FyZFwiLCAtPlxuICAgICAgICAgIHNldHRpbmdzLnNldCgndXNlQ2xpcGJvYXJkQXNEZWZhdWx0UmVnaXN0ZXInLCB0cnVlKVxuICAgICAgICAgIGVuc3VyZSAncCcsIHRleHRDOiBcIjBjbGl8cDEyXFxuXCJcblxuICAgICAgZGVzY3JpYmUgXCJmcm9tIGEgc3BlY2lmaWVkIHJlZ2lzdGVyXCIsIC0+XG4gICAgICAgIGl0IFwiaW5zZXJ0cyB0aGUgY29udGVudHMgb2YgdGhlICdhJyByZWdpc3RlclwiLCAtPlxuICAgICAgICAgIGVuc3VyZSAnXCIgYSBwJywgdGV4dEM6IFwiMHxhMTJcXG5cIixcblxuICAgICAgZGVzY3JpYmUgXCJhdCB0aGUgZW5kIG9mIGEgbGluZVwiLCAtPlxuICAgICAgICBpdCBcImluc2VydHMgYmVmb3JlIHRoZSBjdXJyZW50IGxpbmUncyBuZXdsaW5lXCIsIC0+XG4gICAgICAgICAgc2V0XG4gICAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICBhYmNkZVxuICAgICAgICAgICAgb25lIHx0d28gdGhyZWVcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIGVuc3VyZSAnZCAkIGsgJCBwJyxcbiAgICAgICAgICAgIHRleHRDXzogXCJcIlwiXG4gICAgICAgICAgICBhYmNkZXR3byB0aHJlfGVcbiAgICAgICAgICAgIG9uZV9cbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgZGVzY3JpYmUgXCJ3aXRoIG11bHRpbGluZSBjaGFyYWN0ZXIgY29udGVudHNcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0IHRleHRDOiBcInwwMTJcXG5cIlxuICAgICAgICBzZXQgcmVnaXN0ZXI6ICdcIic6IHRleHQ6ICczNDVcXG42NzgnXG5cbiAgICAgIGl0IFwicCBwbGFjZSBjdXJzb3IgYXQgc3RhcnQgb2YgbXV0YXRpb25cIiwgLT4gZW5zdXJlIFwicFwiLCB0ZXh0QzogXCIwfDM0NVxcbjY3ODEyXFxuXCJcbiAgICAgIGl0IFwiUCBwbGFjZSBjdXJzb3IgYXQgc3RhcnQgb2YgbXV0YXRpb25cIiwgLT4gZW5zdXJlIFwiUFwiLCB0ZXh0QzogXCJ8MzQ1XFxuNjc4MDEyXFxuXCJcblxuICAgIGRlc2NyaWJlIFwid2l0aCBsaW5ld2lzZSBjb250ZW50c1wiLCAtPlxuICAgICAgZGVzY3JpYmUgXCJvbiBhIHNpbmdsZSBsaW5lXCIsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBzZXRcbiAgICAgICAgICAgIHRleHRDOiAnMHwxMidcbiAgICAgICAgICAgIHJlZ2lzdGVyOiAnXCInOiB7dGV4dDogXCIgMzQ1XFxuXCIsIHR5cGU6ICdsaW5ld2lzZSd9XG5cbiAgICAgICAgaXQgXCJpbnNlcnRzIHRoZSBjb250ZW50cyBvZiB0aGUgZGVmYXVsdCByZWdpc3RlclwiLCAtPlxuICAgICAgICAgIGVuc3VyZSAncCcsXG4gICAgICAgICAgICB0ZXh0Q186IFwiXCJcIlxuICAgICAgICAgICAgMDEyXG4gICAgICAgICAgICBffDM0NVxcblxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgaXQgXCJyZXBsYWNlcyB0aGUgY3VycmVudCBzZWxlY3Rpb24gYW5kIHB1dCBjdXJzb3IgdG8gdGhlIGZpcnN0IGNoYXIgb2YgbGluZVwiLCAtPlxuICAgICAgICAgIGVuc3VyZSAndiBwJywgIyAnMScgd2FzIHJlcGxhY2VkXG4gICAgICAgICAgICB0ZXh0Q186IFwiXCJcIlxuICAgICAgICAgICAgMFxuICAgICAgICAgICAgX3wzNDVcbiAgICAgICAgICAgIDJcbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICBkZXNjcmliZSBcIm9uIG11bHRpcGxlIGxpbmVzXCIsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBzZXRcbiAgICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgMDEyXG4gICAgICAgICAgICAgMzQ1XG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgIHJlZ2lzdGVyOiAnXCInOiB7dGV4dDogXCIgNDU2XFxuXCIsIHR5cGU6ICdsaW5ld2lzZSd9XG5cbiAgICAgICAgaXQgXCJpbnNlcnRzIHRoZSBjb250ZW50cyBvZiB0aGUgZGVmYXVsdCByZWdpc3RlciBhdCBtaWRkbGUgbGluZVwiLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFswLCAxXVxuICAgICAgICAgIGVuc3VyZSBcInBcIixcbiAgICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAgIDAxMlxuICAgICAgICAgICAgIHw0NTZcbiAgICAgICAgICAgICAzNDVcbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGl0IFwiaW5zZXJ0cyB0aGUgY29udGVudHMgb2YgdGhlIGRlZmF1bHQgcmVnaXN0ZXIgYXQgZW5kIG9mIGxpbmVcIiwgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMSwgMV1cbiAgICAgICAgICBlbnN1cmUgJ3AnLFxuICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgMDEyXG4gICAgICAgICAgICAgMzQ1XG4gICAgICAgICAgICAgfDQ1NlxcblxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICBkZXNjcmliZSBcIndpdGggbXVsdGlwbGUgbGluZXdpc2UgY29udGVudHNcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgIDAxMlxuICAgICAgICAgIHxhYmNcbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICByZWdpc3RlcjogJ1wiJzoge3RleHQ6IFwiIDM0NVxcbiA2NzhcXG5cIiwgdHlwZTogJ2xpbmV3aXNlJ31cblxuICAgICAgaXQgXCJpbnNlcnRzIHRoZSBjb250ZW50cyBvZiB0aGUgZGVmYXVsdCByZWdpc3RlclwiLCAtPlxuICAgICAgICBlbnN1cmUgJ3AnLFxuICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAwMTJcbiAgICAgICAgICBhYmNcbiAgICAgICAgICAgfDM0NVxuICAgICAgICAgICA2NzhcXG5cbiAgICAgICAgICBcIlwiXCJcblxuICAgIGRlc2NyaWJlIFwicHV0LWFmdGVyLXdpdGgtYXV0by1pbmRlbnQgY29tbWFuZFwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAgICAgICBzZXR0aW5ncy5zZXQoJ3VzZUNsaXBib2FyZEFzRGVmYXVsdFJlZ2lzdGVyJywgZmFsc2UpXG4gICAgICAgICAgYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoJ2xhbmd1YWdlLWphdmFzY3JpcHQnKVxuICAgICAgICBydW5zIC0+XG4gICAgICAgICAgc2V0IGdyYW1tYXI6ICdzb3VyY2UuanMnXG5cbiAgICAgIGRlc2NyaWJlIFwicGFzdGUgd2l0aCBhdXRvLWluZGVudFwiLCAtPlxuICAgICAgICBpdCBcImluc2VydHMgdGhlIGNvbnRlbnRzIG9mIHRoZSBkZWZhdWx0IHJlZ2lzdGVyXCIsIC0+XG4gICAgICAgICAgc2V0XG4gICAgICAgICAgICByZWdpc3RlcjogJ1wiJzoge3RleHQ6IFwiIDM0NVxcblwiLCB0eXBlOiAnbGluZXdpc2UnfVxuICAgICAgICAgICAgdGV4dENfOiBcIlwiXCJcbiAgICAgICAgICAgIGlmfCAoKSB7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICBlbnN1cmVCeURpc3BhdGNoICd2aW0tbW9kZS1wbHVzOnB1dC1hZnRlci13aXRoLWF1dG8taW5kZW50JyxcbiAgICAgICAgICAgIHRleHRDXzogXCJcIlwiXG4gICAgICAgICAgICBpZiAoKSB7XG4gICAgICAgICAgICAgIHwzNDVcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGl0IFwibXVsdGktbGluZSByZWdpc3RlciBjb250ZW50cyB3aXRoIGF1dG8gaW5kZW50XCIsIC0+XG4gICAgICAgICAgcmVnaXN0ZXJDb250ZW50ID0gXCJcIlwiXG4gICAgICAgICAgICBpZigzKSB7XG4gICAgICAgICAgICAgIGlmKDQpIHt9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICBzZXRcbiAgICAgICAgICAgIHJlZ2lzdGVyOiAnXCInOiB7dGV4dDogcmVnaXN0ZXJDb250ZW50LCB0eXBlOiAnbGluZXdpc2UnfVxuICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgaWYgKDEpIHtcbiAgICAgICAgICAgICAgfGlmICgyKSB7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIGVuc3VyZUJ5RGlzcGF0Y2ggJ3ZpbS1tb2RlLXBsdXM6cHV0LWFmdGVyLXdpdGgtYXV0by1pbmRlbnQnLFxuICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgaWYgKDEpIHtcbiAgICAgICAgICAgICAgaWYgKDIpIHtcbiAgICAgICAgICAgICAgICB8aWYoMykge1xuICAgICAgICAgICAgICAgICAgaWYoNCkge31cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICBkZXNjcmliZSBcIndoZW4gcGFzdGluZyBhbHJlYWR5IGluZGVudGVkIG11bHRpLWxpbmVzIHJlZ2lzdGVyIGNvbnRlbnRcIiwgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIHNldFxuICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgaWYgKDEpIHtcbiAgICAgICAgICAgICAgfGlmICgyKSB7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGl0IFwia2VlcCBvcmlnaW5hbCBsYXlvdXRcIiwgLT5cbiAgICAgICAgICByZWdpc3RlckNvbnRlbnQgPSBcIlwiXCJcbiAgICAgICAgICAgICAgIGE6IDEyMyxcbiAgICAgICAgICAgIGJiYmI6IDQ1NixcbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgICAgc2V0IHJlZ2lzdGVyOiAnXCInOiB7dGV4dDogcmVnaXN0ZXJDb250ZW50LCB0eXBlOiAnbGluZXdpc2UnfVxuICAgICAgICAgIGVuc3VyZUJ5RGlzcGF0Y2ggJ3ZpbS1tb2RlLXBsdXM6cHV0LWFmdGVyLXdpdGgtYXV0by1pbmRlbnQnLFxuICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgaWYgKDEpIHtcbiAgICAgICAgICAgICAgaWYgKDIpIHtcbiAgICAgICAgICAgICAgICAgICB8YTogMTIzLFxuICAgICAgICAgICAgICAgIGJiYmI6IDQ1NixcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgaXQgXCJrZWVwIG9yaWdpbmFsIGxheW91dCBbcmVnaXN0ZXIgY29udGVudCBoYXZlIGJsYW5rIHJvd11cIiwgLT5cbiAgICAgICAgICByZWdpc3RlckNvbnRlbnQgPSBcIlwiXCJcbiAgICAgICAgICAgIGlmKDMpIHtcbiAgICAgICAgICAgIF9fYWJjXG5cbiAgICAgICAgICAgIF9fZGVmXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcIlwiXCIucmVwbGFjZSgvXy9nLCAnICcpXG5cbiAgICAgICAgICBzZXQgcmVnaXN0ZXI6ICdcIic6IHt0ZXh0OiByZWdpc3RlckNvbnRlbnQsIHR5cGU6ICdsaW5ld2lzZSd9XG4gICAgICAgICAgZW5zdXJlQnlEaXNwYXRjaCAndmltLW1vZGUtcGx1czpwdXQtYWZ0ZXItd2l0aC1hdXRvLWluZGVudCcsXG4gICAgICAgICAgICB0ZXh0Q186IFwiXCJcIlxuICAgICAgICAgICAgaWYgKDEpIHtcbiAgICAgICAgICAgICAgaWYgKDIpIHtcbiAgICAgICAgICAgICAgICB8aWYoMykge1xuICAgICAgICAgICAgICAgICAgYWJjXG5cbiAgICAgICAgICAgICAgICAgIGRlZlxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXCJcIlwiXG4gICAgIyBIRVJFXG4gICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cblxuICAgIGRlc2NyaWJlIFwicGFzdGluZyB0d2ljZVwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0OiBcIjEyMzQ1XFxuYWJjZGVcXG5BQkNERVxcblFXRVJUXCJcbiAgICAgICAgICBjdXJzb3I6IFsxLCAxXVxuICAgICAgICAgIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiAnMTIzJ1xuICAgICAgICBrZXlzdHJva2UgJzIgcCdcblxuICAgICAgaXQgXCJpbnNlcnRzIHRoZSBzYW1lIGxpbmUgdHdpY2VcIiwgLT5cbiAgICAgICAgZW5zdXJlIHRleHQ6IFwiMTIzNDVcXG5hYjEyMzEyM2NkZVxcbkFCQ0RFXFxuUVdFUlRcIlxuXG4gICAgICBkZXNjcmliZSBcIndoZW4gdW5kb25lXCIsIC0+XG4gICAgICAgIGl0IFwicmVtb3ZlcyBib3RoIGxpbmVzXCIsIC0+XG4gICAgICAgICAgZW5zdXJlICd1JywgdGV4dDogXCIxMjM0NVxcbmFiY2RlXFxuQUJDREVcXG5RV0VSVFwiXG5cbiAgICBkZXNjcmliZSBcInN1cHBvcnQgbXVsdGlwbGUgY3Vyc29yc1wiLCAtPlxuICAgICAgaXQgXCJwYXN0ZSB0ZXh0IGZvciBlYWNoIGN1cnNvcnNcIiwgLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dDogXCIxMjM0NVxcbmFiY2RlXFxuQUJDREVcXG5RV0VSVFwiXG4gICAgICAgICAgY3Vyc29yOiBbWzEsIDBdLCBbMiwgMF1dXG4gICAgICAgICAgcmVnaXN0ZXI6ICdcIic6IHRleHQ6ICdaWlonXG4gICAgICAgIGVuc3VyZSAncCcsXG4gICAgICAgICAgdGV4dDogXCIxMjM0NVxcbmFaWlpiY2RlXFxuQVpaWkJDREVcXG5RV0VSVFwiXG4gICAgICAgICAgY3Vyc29yOiBbWzEsIDNdLCBbMiwgM11dXG5cbiAgICBkZXNjcmliZSBcIndpdGggYSBzZWxlY3Rpb25cIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dDogJzAxMlxcbidcbiAgICAgICAgICBjdXJzb3I6IFswLCAxXVxuICAgICAgZGVzY3JpYmUgXCJ3aXRoIGNoYXJhY3Rlcndpc2Ugc2VsZWN0aW9uXCIsIC0+XG4gICAgICAgIGl0IFwicmVwbGFjZXMgc2VsZWN0aW9uIHdpdGggY2hhcndpc2UgY29udGVudFwiLCAtPlxuICAgICAgICAgIHNldCByZWdpc3RlcjogJ1wiJzogdGV4dDogXCIzNDVcIlxuICAgICAgICAgIGVuc3VyZSAndiBwJywgdGV4dDogXCIwMzQ1MlxcblwiLCBjdXJzb3I6IFswLCAzXVxuICAgICAgICBpdCBcInJlcGxhY2VzIHNlbGVjdGlvbiB3aXRoIGxpbmV3aXNlIGNvbnRlbnRcIiwgLT5cbiAgICAgICAgICBzZXQgcmVnaXN0ZXI6ICdcIic6IHRleHQ6IFwiMzQ1XFxuXCJcbiAgICAgICAgICBlbnN1cmUgJ3YgcCcsIHRleHQ6IFwiMFxcbjM0NVxcbjJcXG5cIiwgY3Vyc29yOiBbMSwgMF1cblxuICAgICAgZGVzY3JpYmUgXCJ3aXRoIGxpbmV3aXNlIHNlbGVjdGlvblwiLCAtPlxuICAgICAgICBpdCBcInJlcGxhY2VzIHNlbGVjdGlvbiB3aXRoIGNoYXJ3aXNlIGNvbnRlbnRcIiwgLT5cbiAgICAgICAgICBzZXQgdGV4dDogXCIwMTJcXG5hYmNcIiwgY3Vyc29yOiBbMCwgMV1cbiAgICAgICAgICBzZXQgcmVnaXN0ZXI6ICdcIic6IHRleHQ6IFwiMzQ1XCJcbiAgICAgICAgICBlbnN1cmUgJ1YgcCcsIHRleHQ6IFwiMzQ1XFxuYWJjXCIsIGN1cnNvcjogWzAsIDBdXG4gICAgICAgIGl0IFwicmVwbGFjZXMgc2VsZWN0aW9uIHdpdGggbGluZXdpc2UgY29udGVudFwiLCAtPlxuICAgICAgICAgIHNldCByZWdpc3RlcjogJ1wiJzogdGV4dDogXCIzNDVcXG5cIlxuICAgICAgICAgIGVuc3VyZSAnViBwJywgdGV4dDogXCIzNDVcXG5cIiwgY3Vyc29yOiBbMCwgMF1cblxuICBkZXNjcmliZSBcInRoZSBQIGtleWJpbmRpbmdcIiwgLT5cbiAgICBkZXNjcmliZSBcIndpdGggY2hhcmFjdGVyIGNvbnRlbnRzXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldCB0ZXh0OiBcIjAxMlxcblwiLCBjdXJzb3I6IFswLCAwXVxuICAgICAgICBzZXQgcmVnaXN0ZXI6ICdcIic6IHRleHQ6ICczNDUnXG4gICAgICAgIHNldCByZWdpc3RlcjogYTogdGV4dDogJ2EnXG4gICAgICAgIGtleXN0cm9rZSAnUCdcblxuICAgICAgaXQgXCJpbnNlcnRzIHRoZSBjb250ZW50cyBvZiB0aGUgZGVmYXVsdCByZWdpc3RlciBhYm92ZVwiLCAtPlxuICAgICAgICBlbnN1cmUgdGV4dDogXCIzNDUwMTJcXG5cIiwgY3Vyc29yOiBbMCwgMl1cblxuICBkZXNjcmliZSBcInRoZSAuIGtleWJpbmRpbmdcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXQgdGV4dDogXCIxMlxcbjM0XFxuNTZcXG43OFwiLCBjdXJzb3I6IFswLCAwXVxuXG4gICAgaXQgXCJyZXBlYXRzIHRoZSBsYXN0IG9wZXJhdGlvblwiLCAtPlxuICAgICAgZW5zdXJlICcyIGQgZCAuJywgdGV4dDogXCJcIlxuXG4gICAgaXQgXCJjb21wb3NlcyB3aXRoIG1vdGlvbnNcIiwgLT5cbiAgICAgIGVuc3VyZSAnZCBkIDIgLicsIHRleHQ6IFwiNzhcIlxuXG4gIGRlc2NyaWJlIFwidGhlIHIga2V5YmluZGluZ1wiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNldFxuICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgMTJcbiAgICAgICAgMzRcbiAgICAgICAgXFxuXG4gICAgICAgIFwiXCJcIlxuICAgICAgICBjdXJzb3I6IFtbMCwgMF0sIFsxLCAwXV1cblxuICAgIGl0IFwicmVwbGFjZXMgYSBzaW5nbGUgY2hhcmFjdGVyXCIsIC0+XG4gICAgICBlbnN1cmUgWydyJywgaW5wdXQ6ICd4J10sIHRleHQ6ICd4Mlxcbng0XFxuXFxuJ1xuXG4gICAgaXQgXCJkb2VzIG5vdGhpbmcgd2hlbiBjYW5jZWxsZWRcIiwgLT5cbiAgICAgIGVuc3VyZSAnciBlc2NhcGUnLFxuICAgICAgICB0ZXh0OiAnMTJcXG4zNFxcblxcbidcbiAgICAgICAgbW9kZTogJ25vcm1hbCdcblxuICAgIGl0IFwicmVtYWluIHZpc3VhbC1tb2RlIHdoZW4gY2FuY2VsbGVkXCIsIC0+XG4gICAgICBlbnN1cmUgJ3YgciBlc2NhcGUnLFxuICAgICAgICB0ZXh0OiAnMTJcXG4zNFxcblxcbidcbiAgICAgICAgbW9kZTogWyd2aXN1YWwnLCAnY2hhcmFjdGVyd2lzZSddXG5cbiAgICBpdCBcInJlcGxhY2VzIGEgc2luZ2xlIGNoYXJhY3RlciB3aXRoIGEgbGluZSBicmVha1wiLCAtPlxuICAgICAgZW5zdXJlICdyIGVudGVyJyxcbiAgICAgICAgdGV4dDogJ1xcbjJcXG5cXG40XFxuXFxuJ1xuICAgICAgICBjdXJzb3I6IFtbMSwgMF0sIFszLCAwXV1cblxuICAgIGl0IFwiYXV0byBpbmRlbnQgd2hlbiByZXBsYWNlZCB3aXRoIHNpbmdlIG5ldyBsaW5lXCIsIC0+XG4gICAgICBzZXRcbiAgICAgICAgdGV4dENfOiBcIlwiXCJcbiAgICAgICAgX19hfGJjXG4gICAgICAgIFwiXCJcIlxuICAgICAgZW5zdXJlICdyIGVudGVyJyxcbiAgICAgICAgdGV4dENfOiBcIlwiXCJcbiAgICAgICAgX19hXG4gICAgICAgIF9ffGNcbiAgICAgICAgXCJcIlwiXG5cbiAgICBpdCBcImNvbXBvc2VzIHByb3Blcmx5IHdpdGggbW90aW9uc1wiLCAtPlxuICAgICAgZW5zdXJlIFsnMiByJywgaW5wdXQ6ICd4J10sIHRleHQ6ICd4eFxcbnh4XFxuXFxuJ1xuXG4gICAgaXQgXCJkb2VzIG5vdGhpbmcgb24gYW4gZW1wdHkgbGluZVwiLCAtPlxuICAgICAgc2V0IGN1cnNvcjogWzIsIDBdXG4gICAgICBlbnN1cmUgWydyJywgaW5wdXQ6ICd4J10sIHRleHQ6ICcxMlxcbjM0XFxuXFxuJ1xuXG4gICAgaXQgXCJkb2VzIG5vdGhpbmcgaWYgYXNrZWQgdG8gcmVwbGFjZSBtb3JlIGNoYXJhY3RlcnMgdGhhbiB0aGVyZSBhcmUgb24gYSBsaW5lXCIsIC0+XG4gICAgICBlbnN1cmUgWyczIHInLCBpbnB1dDogJ3gnXSwgdGV4dDogJzEyXFxuMzRcXG5cXG4nXG5cbiAgICBkZXNjcmliZSBcIndoZW4gaW4gdmlzdWFsIG1vZGVcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAga2V5c3Ryb2tlICd2IGUnXG5cbiAgICAgIGl0IFwicmVwbGFjZXMgdGhlIGVudGlyZSBzZWxlY3Rpb24gd2l0aCB0aGUgZ2l2ZW4gY2hhcmFjdGVyXCIsIC0+XG4gICAgICAgIGVuc3VyZSBbJ3InLCBpbnB1dDogJ3gnXSwgdGV4dDogJ3h4XFxueHhcXG5cXG4nXG5cbiAgICAgIGl0IFwibGVhdmVzIHRoZSBjdXJzb3IgYXQgdGhlIGJlZ2lubmluZyBvZiB0aGUgc2VsZWN0aW9uXCIsIC0+XG4gICAgICAgIGVuc3VyZSBbJ3InLCBpbnB1dDogJ3gnIF0sIGN1cnNvcjogW1swLCAwXSwgWzEsIDBdXVxuXG4gICAgZGVzY3JpYmUgXCJ3aGVuIGluIHZpc3VhbC1ibG9jayBtb2RlXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIGN1cnNvcjogWzEsIDRdXG4gICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICAwOjIzNDVcbiAgICAgICAgICAgIDE6IG8xMW9cbiAgICAgICAgICAgIDI6IG8yMm9cbiAgICAgICAgICAgIDM6IG8zM29cbiAgICAgICAgICAgIDQ6IG80NG9cXG5cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICBlbnN1cmUgJ2N0cmwtdiBsIDMgaicsXG4gICAgICAgICAgbW9kZTogWyd2aXN1YWwnLCAnYmxvY2t3aXNlJ11cbiAgICAgICAgICBzZWxlY3RlZFRleHRPcmRlcmVkOiBbJzExJywgJzIyJywgJzMzJywgJzQ0J10sXG5cbiAgICAgIGl0IFwicmVwbGFjZXMgZWFjaCBzZWxlY3Rpb24gYW5kIHB1dCBjdXJzb3Igb24gc3RhcnQgb2YgdG9wIHNlbGVjdGlvblwiLCAtPlxuICAgICAgICBlbnN1cmUgWydyJywgaW5wdXQ6ICd4J10sXG4gICAgICAgICAgbW9kZTogJ25vcm1hbCdcbiAgICAgICAgICBjdXJzb3I6IFsxLCA0XVxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgMDoyMzQ1XG4gICAgICAgICAgICAxOiBveHhvXG4gICAgICAgICAgICAyOiBveHhvXG4gICAgICAgICAgICAzOiBveHhvXG4gICAgICAgICAgICA0OiBveHhvXFxuXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgc2V0IGN1cnNvcjogWzEsIDBdXG4gICAgICAgIGVuc3VyZSAnLicsXG4gICAgICAgICAgbW9kZTogJ25vcm1hbCdcbiAgICAgICAgICBjdXJzb3I6IFsxLCAwXVxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgMDoyMzQ1XG4gICAgICAgICAgICB4eCBveHhvXG4gICAgICAgICAgICB4eCBveHhvXG4gICAgICAgICAgICB4eCBveHhvXG4gICAgICAgICAgICB4eCBveHhvXFxuXG4gICAgICAgICAgICBcIlwiXCJcblxuICBkZXNjcmliZSAndGhlIG0ga2V5YmluZGluZycsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2V0IHRleHQ6ICcxMlxcbjM0XFxuNTZcXG4nLCBjdXJzb3I6IFswLCAxXVxuXG4gICAgaXQgJ21hcmtzIGEgcG9zaXRpb24nLCAtPlxuICAgICAga2V5c3Ryb2tlICdtIGEnXG4gICAgICBleHBlY3QodmltU3RhdGUubWFyay5nZXQoJ2EnKSkudG9FcXVhbCBbMCwgMV1cblxuICBkZXNjcmliZSAndGhlIFIga2V5YmluZGluZycsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2V0XG4gICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgIDEyMzQ1XG4gICAgICAgICAgNjc4OTBcbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgY3Vyc29yOiBbMCwgMl1cblxuICAgIGl0IFwiZW50ZXJzIHJlcGxhY2UgbW9kZSBhbmQgcmVwbGFjZXMgY2hhcmFjdGVyc1wiLCAtPlxuICAgICAgZW5zdXJlICdSJyxcbiAgICAgICAgbW9kZTogWydpbnNlcnQnLCAncmVwbGFjZSddXG4gICAgICBlZGl0b3IuaW5zZXJ0VGV4dCBcImFiXCJcbiAgICAgIGVuc3VyZSAnZXNjYXBlJyxcbiAgICAgICAgdGV4dDogXCIxMmFiNVxcbjY3ODkwXCJcbiAgICAgICAgY3Vyc29yOiBbMCwgM11cbiAgICAgICAgbW9kZTogJ25vcm1hbCdcblxuICAgIGl0IFwiY29udGludWVzIGJleW9uZCBlbmQgb2YgbGluZSBhcyBpbnNlcnRcIiwgLT5cbiAgICAgIGVuc3VyZSAnUicsXG4gICAgICAgIG1vZGU6IFsnaW5zZXJ0JywgJ3JlcGxhY2UnXVxuICAgICAgZWRpdG9yLmluc2VydFRleHQgXCJhYmNkZVwiXG4gICAgICBlbnN1cmUgJ2VzY2FwZScsIHRleHQ6ICcxMmFiY2RlXFxuNjc4OTAnXG5cbiAgICBpdCAndHJlYXRzIGJhY2tzcGFjZSBhcyB1bmRvJywgLT5cbiAgICAgIGVkaXRvci5pbnNlcnRUZXh0IFwiZm9vXCJcbiAgICAgIGtleXN0cm9rZSAnUidcbiAgICAgIGVkaXRvci5pbnNlcnRUZXh0IFwiYVwiXG4gICAgICBlZGl0b3IuaW5zZXJ0VGV4dCBcImJcIlxuICAgICAgZW5zdXJlIHRleHQ6IFwiMTJmb29hYjVcXG42Nzg5MFwiXG5cbiAgICAgIGVuc3VyZSAnYmFja3NwYWNlJywgdGV4dDogXCIxMmZvb2E0NVxcbjY3ODkwXCJcbiAgICAgIGVkaXRvci5pbnNlcnRUZXh0IFwiY1wiXG4gICAgICBlbnN1cmUgdGV4dDogXCIxMmZvb2FjNVxcbjY3ODkwXCJcbiAgICAgIGVuc3VyZSAnYmFja3NwYWNlIGJhY2tzcGFjZScsXG4gICAgICAgIHRleHQ6IFwiMTJmb28zNDVcXG42Nzg5MFwiXG4gICAgICAgIHNlbGVjdGVkVGV4dDogJydcblxuICAgICAgZW5zdXJlICdiYWNrc3BhY2UnLFxuICAgICAgICB0ZXh0OiBcIjEyZm9vMzQ1XFxuNjc4OTBcIlxuICAgICAgICBzZWxlY3RlZFRleHQ6ICcnXG5cbiAgICBpdCBcImNhbiBiZSByZXBlYXRlZFwiLCAtPlxuICAgICAga2V5c3Ryb2tlICdSJ1xuICAgICAgZWRpdG9yLmluc2VydFRleHQgXCJhYlwiXG4gICAgICBrZXlzdHJva2UgJ2VzY2FwZSdcbiAgICAgIHNldCBjdXJzb3I6IFsxLCAyXVxuICAgICAgZW5zdXJlICcuJywgdGV4dDogXCIxMmFiNVxcbjY3YWIwXCIsIGN1cnNvcjogWzEsIDNdXG4gICAgICBzZXQgY3Vyc29yOiBbMCwgNF1cbiAgICAgIGVuc3VyZSAnLicsIHRleHQ6IFwiMTJhYmFiXFxuNjdhYjBcIiwgY3Vyc29yOiBbMCwgNV1cblxuICAgIGl0IFwiY2FuIGJlIGludGVycnVwdGVkIGJ5IGFycm93IGtleXMgYW5kIGJlaGF2ZSBhcyBpbnNlcnQgZm9yIHJlcGVhdFwiLCAtPlxuICAgICAgIyBGSVhNRSBkb24ndCBrbm93IGhvdyB0byB0ZXN0IHRoaXMgKGFsc28sIGRlcGVuZHMgb24gUFIgIzU2OClcblxuICAgIGl0IFwicmVwZWF0cyBjb3JyZWN0bHkgd2hlbiBiYWNrc3BhY2Ugd2FzIHVzZWQgaW4gdGhlIHRleHRcIiwgLT5cbiAgICAgIGtleXN0cm9rZSAnUidcbiAgICAgIGVkaXRvci5pbnNlcnRUZXh0IFwiYVwiXG4gICAgICBrZXlzdHJva2UgJ2JhY2tzcGFjZSdcbiAgICAgIGVkaXRvci5pbnNlcnRUZXh0IFwiYlwiXG4gICAgICBrZXlzdHJva2UgJ2VzY2FwZSdcbiAgICAgIHNldCBjdXJzb3I6IFsxLCAyXVxuICAgICAgZW5zdXJlICcuJywgdGV4dDogXCIxMmI0NVxcbjY3YjkwXCIsIGN1cnNvcjogWzEsIDJdXG4gICAgICBzZXQgY3Vyc29yOiBbMCwgNF1cbiAgICAgIGVuc3VyZSAnLicsIHRleHQ6IFwiMTJiNGJcXG42N2I5MFwiLCBjdXJzb3I6IFswLCA0XVxuXG4gICAgaXQgXCJkb2Vzbid0IHJlcGxhY2UgYSBjaGFyYWN0ZXIgaWYgbmV3bGluZSBpcyBlbnRlcmVkXCIsIC0+XG4gICAgICBlbnN1cmUgJ1InLCBtb2RlOiBbJ2luc2VydCcsICdyZXBsYWNlJ11cbiAgICAgIGVkaXRvci5pbnNlcnRUZXh0IFwiXFxuXCJcbiAgICAgIGVuc3VyZSAnZXNjYXBlJywgdGV4dDogXCIxMlxcbjM0NVxcbjY3ODkwXCJcblxuICAgIGRlc2NyaWJlIFwibXVsdGlsaW5lIHNpdHVhdGlvblwiLCAtPlxuICAgICAgdGV4dE9yaWdpbmFsID0gXCJcIlwiXG4gICAgICAgIDAxMjM0XG4gICAgICAgIDU2Nzg5XG4gICAgICAgIFwiXCJcIlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXQgdGV4dDogdGV4dE9yaWdpbmFsLCBjdXJzb3I6IFswLCAwXVxuICAgICAgaXQgXCJyZXBsYWNlIGNoYXJhY3RlciB1bmxlc3MgaW5wdXQgaXNudCBuZXcgbGluZShcXFxcbilcIiwgLT5cbiAgICAgICAgZW5zdXJlICdSJywgbW9kZTogWydpbnNlcnQnLCAncmVwbGFjZSddXG4gICAgICAgIGVkaXRvci5pbnNlcnRUZXh0IFwiYVxcbmJcXG5jXCJcbiAgICAgICAgZW5zdXJlXG4gICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICBhXG4gICAgICAgICAgICBiXG4gICAgICAgICAgICBjMzRcbiAgICAgICAgICAgIDU2Nzg5XG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICBjdXJzb3I6IFsyLCAxXVxuICAgICAgaXQgXCJoYW5kbGUgYmFja3NwYWNlXCIsIC0+XG4gICAgICAgIGVuc3VyZSAnUicsIG1vZGU6IFsnaW5zZXJ0JywgJ3JlcGxhY2UnXVxuICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMV1cbiAgICAgICAgZWRpdG9yLmluc2VydFRleHQgXCJhXFxuYlxcbmNcIlxuICAgICAgICBlbnN1cmVcbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIDBhXG4gICAgICAgICAgICBiXG4gICAgICAgICAgICBjNFxuICAgICAgICAgICAgNTY3ODlcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIGN1cnNvcjogWzIsIDFdXG4gICAgICAgIGVuc3VyZSAnYmFja3NwYWNlJyxcbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIDBhXG4gICAgICAgICAgICBiXG4gICAgICAgICAgICAzNFxuICAgICAgICAgICAgNTY3ODlcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIGN1cnNvcjogWzIsIDBdXG4gICAgICAgIGVuc3VyZSAnYmFja3NwYWNlJyxcbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIDBhXG4gICAgICAgICAgICBiMzRcbiAgICAgICAgICAgIDU2Nzg5XG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICBjdXJzb3I6IFsxLCAxXVxuICAgICAgICBlbnN1cmUgJ2JhY2tzcGFjZScsXG4gICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICAwYVxuICAgICAgICAgICAgMjM0XG4gICAgICAgICAgICA1Njc4OVxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgY3Vyc29yOiBbMSwgMF1cbiAgICAgICAgZW5zdXJlICdiYWNrc3BhY2UnLFxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgMGEyMzRcbiAgICAgICAgICAgIDU2Nzg5XG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICBjdXJzb3I6IFswLCAyXVxuICAgICAgICBlbnN1cmUgJ2JhY2tzcGFjZScsXG4gICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICAwMTIzNFxuICAgICAgICAgICAgNTY3ODlcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIGN1cnNvcjogWzAsIDFdXG4gICAgICAgIGVuc3VyZSAnYmFja3NwYWNlJywgIyBkbyBub3RoaW5nXG4gICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICAwMTIzNFxuICAgICAgICAgICAgNTY3ODlcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIGN1cnNvcjogWzAsIDFdXG4gICAgICAgIGVuc3VyZSAnZXNjYXBlJyxcbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIDAxMjM0XG4gICAgICAgICAgICA1Njc4OVxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgICBtb2RlOiAnbm9ybWFsJ1xuICAgICAgaXQgXCJyZXBlYXRlIG11bHRpbGluZSB0ZXh0IGNhc2UtMVwiLCAtPlxuICAgICAgICBlbnN1cmUgJ1InLCBtb2RlOiBbJ2luc2VydCcsICdyZXBsYWNlJ11cbiAgICAgICAgZWRpdG9yLmluc2VydFRleHQgXCJhYmNcXG5kZWZcIlxuICAgICAgICBlbnN1cmVcbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIGFiY1xuICAgICAgICAgICAgZGVmXG4gICAgICAgICAgICA1Njc4OVxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgY3Vyc29yOiBbMSwgM11cbiAgICAgICAgZW5zdXJlICdlc2NhcGUnLCBjdXJzb3I6IFsxLCAyXSwgbW9kZTogJ25vcm1hbCdcbiAgICAgICAgZW5zdXJlICd1JywgdGV4dDogdGV4dE9yaWdpbmFsXG4gICAgICAgIGVuc3VyZSAnLicsXG4gICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICBhYmNcbiAgICAgICAgICAgIGRlZlxuICAgICAgICAgICAgNTY3ODlcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIGN1cnNvcjogWzEsIDJdXG4gICAgICAgICAgbW9kZTogJ25vcm1hbCdcbiAgICAgICAgZW5zdXJlICdqIC4nLFxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgYWJjXG4gICAgICAgICAgICBkZWZcbiAgICAgICAgICAgIDU2YWJjXG4gICAgICAgICAgICBkZWZcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIGN1cnNvcjogWzMsIDJdXG4gICAgICAgICAgbW9kZTogJ25vcm1hbCdcbiAgICAgIGl0IFwicmVwZWF0ZSBtdWx0aWxpbmUgdGV4dCBjYXNlLTJcIiwgLT5cbiAgICAgICAgZW5zdXJlICdSJywgbW9kZTogWydpbnNlcnQnLCAncmVwbGFjZSddXG4gICAgICAgIGVkaXRvci5pbnNlcnRUZXh0IFwiYWJjXFxuZFwiXG4gICAgICAgIGVuc3VyZVxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgYWJjXG4gICAgICAgICAgICBkNFxuICAgICAgICAgICAgNTY3ODlcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIGN1cnNvcjogWzEsIDFdXG4gICAgICAgIGVuc3VyZSAnZXNjYXBlJywgY3Vyc29yOiBbMSwgMF0sIG1vZGU6ICdub3JtYWwnXG4gICAgICAgIGVuc3VyZSAnaiAuJyxcbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICBhYmNcbiAgICAgICAgICBkNFxuICAgICAgICAgIGFiY1xuICAgICAgICAgIGQ5XG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgY3Vyc29yOiBbMywgMF1cbiAgICAgICAgICBtb2RlOiAnbm9ybWFsJ1xuXG4gIGRlc2NyaWJlICdBZGRCbGFua0xpbmVCZWxvdywgQWRkQmxhbmtMaW5lQWJvdmUnLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNldFxuICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgIGxpbmUwXG4gICAgICAgIGxpfG5lMVxuICAgICAgICBsaW5lMlxuICAgICAgICBsaW5lM1xuICAgICAgICBcIlwiXCJcblxuICAgICAgYXRvbS5rZXltYXBzLmFkZCBcInRlc3RcIixcbiAgICAgICAgJ2F0b20tdGV4dC1lZGl0b3IudmltLW1vZGUtcGx1cy5ub3JtYWwtbW9kZSc6XG4gICAgICAgICAgJ2VudGVyJzogJ3ZpbS1tb2RlLXBsdXM6YWRkLWJsYW5rLWxpbmUtYmVsb3cnXG4gICAgICAgICAgJ3NoaWZ0LWVudGVyJzogJ3ZpbS1tb2RlLXBsdXM6YWRkLWJsYW5rLWxpbmUtYWJvdmUnXG5cbiAgICBpdCBcImluc2VydCBibGFuayBsaW5lIGJlbG93L2Fib3ZlXCIsIC0+XG4gICAgICBlbnN1cmUgXCJlbnRlclwiLFxuICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgIGxpbmUwXG4gICAgICAgIGxpfG5lMVxuXG4gICAgICAgIGxpbmUyXG4gICAgICAgIGxpbmUzXG4gICAgICAgIFwiXCJcIlxuICAgICAgZW5zdXJlIFwic2hpZnQtZW50ZXJcIixcbiAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICBsaW5lMFxuXG4gICAgICAgIGxpfG5lMVxuXG4gICAgICAgIGxpbmUyXG4gICAgICAgIGxpbmUzXG4gICAgICAgIFwiXCJcIlxuXG4gICAgaXQgXCJbd2l0aC1jb3VudF0gaW5zZXJ0IGJsYW5rIGxpbmUgYmVsb3cvYWJvdmVcIiwgLT5cbiAgICAgIGVuc3VyZSBcIjIgZW50ZXJcIixcbiAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICBsaW5lMFxuICAgICAgICBsaXxuZTFcblxuXG4gICAgICAgIGxpbmUyXG4gICAgICAgIGxpbmUzXG4gICAgICAgIFwiXCJcIlxuICAgICAgZW5zdXJlIFwiMiBzaGlmdC1lbnRlclwiLFxuICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgIGxpbmUwXG5cblxuICAgICAgICBsaXxuZTFcblxuXG4gICAgICAgIGxpbmUyXG4gICAgICAgIGxpbmUzXG4gICAgICAgIFwiXCJcIlxuIl19
