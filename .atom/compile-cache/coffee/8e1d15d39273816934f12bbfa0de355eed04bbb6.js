(function() {
  var getVimState, settings,
    slice = [].slice;

  getVimState = require('./spec-helper').getVimState;

  settings = require('../lib/settings');

  describe("Prefixes", function() {
    var editor, editorElement, ensure, keystroke, ref, set, vimState;
    ref = [], set = ref[0], ensure = ref[1], keystroke = ref[2], editor = ref[3], editorElement = ref[4], vimState = ref[5];
    beforeEach(function() {
      return getVimState(function(state, vim) {
        vimState = state;
        editor = vimState.editor, editorElement = vimState.editorElement;
        return set = vim.set, ensure = vim.ensure, keystroke = vim.keystroke, vim;
      });
    });
    describe("Repeat", function() {
      describe("with operations", function() {
        beforeEach(function() {
          return set({
            text: "123456789abc",
            cursor: [0, 0]
          });
        });
        it("repeats N times", function() {
          return ensure('3 x', {
            text: '456789abc'
          });
        });
        return it("repeats NN times", function() {
          return ensure('1 0 x', {
            text: 'bc'
          });
        });
      });
      describe("with motions", function() {
        beforeEach(function() {
          return set({
            text: 'one two three',
            cursor: [0, 0]
          });
        });
        return it("repeats N times", function() {
          return ensure('d 2 w', {
            text: 'three'
          });
        });
      });
      return describe("in visual mode", function() {
        beforeEach(function() {
          return set({
            text: 'one two three',
            cursor: [0, 0]
          });
        });
        return it("repeats movements in visual mode", function() {
          return ensure('v 2 w', {
            cursor: [0, 9]
          });
        });
      });
    });
    describe("Register", function() {
      beforeEach(function() {
        return vimState.globalState.reset('register');
      });
      describe("the a register", function() {
        it("saves a value for future reading", function() {
          set({
            register: {
              a: {
                text: 'new content'
              }
            }
          });
          return ensure({
            register: {
              a: {
                text: 'new content'
              }
            }
          });
        });
        return it("overwrites a value previously in the register", function() {
          set({
            register: {
              a: {
                text: 'content'
              }
            }
          });
          set({
            register: {
              a: {
                text: 'new content'
              }
            }
          });
          return ensure({
            register: {
              a: {
                text: 'new content'
              }
            }
          });
        });
      });
      describe("with yank command", function() {
        beforeEach(function() {
          return set({
            cursor: [0, 0],
            text: "aaa bbb ccc"
          });
        });
        it("save to pre specified register", function() {
          ensure('" a y i w', {
            register: {
              a: {
                text: 'aaa'
              }
            }
          });
          ensure('w " b y i w', {
            register: {
              b: {
                text: 'bbb'
              }
            }
          });
          return ensure('w " c y i w', {
            register: {
              c: {
                text: 'ccc'
              }
            }
          });
        });
        return it("work with motion which also require input such as 't'", function() {
          return ensure([
            '" a y t', {
              input: 'c'
            }
          ], {
            register: {
              a: {
                text: 'aaa bbb '
              }
            }
          });
        });
      });
      describe("With p command", function() {
        beforeEach(function() {
          vimState.globalState.reset('register');
          set({
            register: {
              a: {
                text: 'new content'
              }
            }
          });
          return set({
            text: "abc\ndef",
            cursor: [0, 0]
          });
        });
        describe("when specified register have no text", function() {
          it("can paste from a register", function() {
            ensure({
              mode: "normal"
            });
            return ensure([
              '"', {
                input: 'a'
              }, 'p'
            ], {
              text: "anew contentbc\ndef",
              cursor: [0, 11]
            });
          });
          return it("but do nothing for z register", function() {
            return ensure([
              '"', {
                input: 'z'
              }, 'p'
            ], {
              text: "abc\ndef",
              cursor: [0, 0]
            });
          });
        });
        return describe("blockwise-mode paste just use register have no text", function() {
          return it("paste from a register to each selction", function() {
            return ensure([
              'ctrl-v j "', {
                input: 'a'
              }, 'p'
            ], {
              textC: "!new contentbc\nnew contentef"
            });
          });
        });
      });
      describe("the B register", function() {
        it("saves a value for future reading", function() {
          set({
            register: {
              B: {
                text: 'new content'
              }
            }
          });
          ensure({
            register: {
              b: {
                text: 'new content'
              }
            }
          });
          return ensure({
            register: {
              B: {
                text: 'new content'
              }
            }
          });
        });
        it("appends to a value previously in the register", function() {
          set({
            register: {
              b: {
                text: 'content'
              }
            }
          });
          set({
            register: {
              B: {
                text: 'new content'
              }
            }
          });
          return ensure({
            register: {
              b: {
                text: 'contentnew content'
              }
            }
          });
        });
        it("appends linewise to a linewise value previously in the register", function() {
          set({
            register: {
              b: {
                text: 'content\n',
                type: 'linewise'
              }
            }
          });
          set({
            register: {
              B: {
                text: 'new content'
              }
            }
          });
          return ensure({
            register: {
              b: {
                text: 'content\nnew content\n'
              }
            }
          });
        });
        return it("appends linewise to a character value previously in the register", function() {
          set({
            register: {
              b: {
                text: 'content'
              }
            }
          });
          set({
            register: {
              B: {
                text: 'new content\n',
                type: 'linewise'
              }
            }
          });
          return ensure({
            register: {
              b: {
                text: 'content\nnew content\n'
              }
            }
          });
        });
      });
      describe("the * register", function() {
        describe("reading", function() {
          return it("is the same the system clipboard", function() {
            return ensure({
              register: {
                '*': {
                  text: 'initial clipboard content',
                  type: 'characterwise'
                }
              }
            });
          });
        });
        return describe("writing", function() {
          beforeEach(function() {
            return set({
              register: {
                '*': {
                  text: 'new content'
                }
              }
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
            return ensure({
              register: {
                '*': {
                  text: 'initial clipboard content',
                  type: 'characterwise'
                }
              }
            });
          });
        });
        return describe("writing", function() {
          beforeEach(function() {
            return set({
              register: {
                '*': {
                  text: 'new content'
                }
              }
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
            return ensure({
              register: {
                '_': {
                  text: ''
                }
              }
            });
          });
        });
        return describe("writing", function() {
          return it("throws away anything written to it", function() {
            set({
              register: {
                '_': {
                  text: 'new content'
                }
              }
            });
            return ensure({
              register: {
                '_': {
                  text: ''
                }
              }
            });
          });
        });
      });
      describe("the % register", function() {
        beforeEach(function() {
          return spyOn(editor, 'getURI').andReturn('/Users/atom/known_value.txt');
        });
        describe("reading", function() {
          return it("returns the filename of the current editor", function() {
            return ensure({
              register: {
                '%': {
                  text: '/Users/atom/known_value.txt'
                }
              }
            });
          });
        });
        return describe("writing", function() {
          return it("throws away anything written to it", function() {
            set({
              register: {
                '%': {
                  text: 'new content'
                }
              }
            });
            return ensure({
              register: {
                '%': {
                  text: '/Users/atom/known_value.txt'
                }
              }
            });
          });
        });
      });
      describe("the ctrl-r command in insert mode", function() {
        beforeEach(function() {
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
                text: 'abc'
              }
            }
          });
          set({
            register: {
              '*': {
                text: 'abc'
              }
            }
          });
          atom.clipboard.write("clip");
          set({
            text: "012\n",
            cursor: [0, 2]
          });
          return ensure('i', {
            mode: 'insert'
          });
        });
        describe("useClipboardAsDefaultRegister = true", function() {
          beforeEach(function() {
            settings.set('useClipboardAsDefaultRegister', true);
            set({
              register: {
                '"': {
                  text: '345'
                }
              }
            });
            return atom.clipboard.write("clip");
          });
          return it("inserts contents from clipboard with \"", function() {
            return ensure([
              'ctrl-r', {
                input: '"'
              }
            ], {
              text: '01clip2\n'
            });
          });
        });
        describe("useClipboardAsDefaultRegister = false", function() {
          beforeEach(function() {
            settings.set('useClipboardAsDefaultRegister', false);
            set({
              register: {
                '"': {
                  text: '345'
                }
              }
            });
            return atom.clipboard.write("clip");
          });
          return it("inserts contents from \" with \"", function() {
            return ensure([
              'ctrl-r', {
                input: '"'
              }
            ], {
              text: '013452\n'
            });
          });
        });
        it("inserts contents of the 'a' register", function() {
          return ensure([
            'ctrl-r', {
              input: 'a'
            }
          ], {
            text: '01abc2\n'
          });
        });
        return it("is cancelled with the escape key", function() {
          return ensure('ctrl-r escape', {
            text: '012\n',
            mode: 'insert',
            cursor: [0, 2]
          });
        });
      });
      return describe("per selection clipboard", function() {
        var ensurePerSelectionRegister;
        ensurePerSelectionRegister = function() {
          var i, j, len, ref1, results, selection, texts;
          texts = 1 <= arguments.length ? slice.call(arguments, 0) : [];
          ref1 = editor.getSelections();
          results = [];
          for (i = j = 0, len = ref1.length; j < len; i = ++j) {
            selection = ref1[i];
            results.push(ensure({
              register: {
                '*': {
                  text: texts[i],
                  selection: selection
                }
              }
            }));
          }
          return results;
        };
        beforeEach(function() {
          settings.set('useClipboardAsDefaultRegister', true);
          return set({
            text: "012:\nabc:\ndef:\n",
            cursor: [[0, 1], [1, 1], [2, 1]]
          });
        });
        describe("on selection destroye", function() {
          return it("remove corresponding subscriptin and clipboard entry", function() {
            var clipboardBySelection, j, len, ref1, ref2, selection, subscriptionBySelection;
            ref1 = vimState.register, clipboardBySelection = ref1.clipboardBySelection, subscriptionBySelection = ref1.subscriptionBySelection;
            expect(clipboardBySelection.size).toBe(0);
            expect(subscriptionBySelection.size).toBe(0);
            keystroke("y i w");
            ensurePerSelectionRegister('012', 'abc', 'def');
            expect(clipboardBySelection.size).toBe(3);
            expect(subscriptionBySelection.size).toBe(3);
            ref2 = editor.getSelections();
            for (j = 0, len = ref2.length; j < len; j++) {
              selection = ref2[j];
              selection.destroy();
            }
            expect(clipboardBySelection.size).toBe(0);
            return expect(subscriptionBySelection.size).toBe(0);
          });
        });
        describe("Yank", function() {
          return it("save text to per selection register", function() {
            keystroke("y i w");
            return ensurePerSelectionRegister('012', 'abc', 'def');
          });
        });
        describe("Delete family", function() {
          it("d", function() {
            ensure("d i w", {
              text: ":\n:\n:\n"
            });
            return ensurePerSelectionRegister('012', 'abc', 'def');
          });
          it("x", function() {
            ensure("x", {
              text: "02:\nac:\ndf:\n"
            });
            return ensurePerSelectionRegister('1', 'b', 'e');
          });
          it("X", function() {
            ensure("X", {
              text: "12:\nbc:\nef:\n"
            });
            return ensurePerSelectionRegister('0', 'a', 'd');
          });
          return it("D", function() {
            ensure("D", {
              text: "0\na\nd\n"
            });
            return ensurePerSelectionRegister('12:', 'bc:', 'ef:');
          });
        });
        describe("Put family", function() {
          it("p paste text from per selection register", function() {
            return ensure("y i w $ p", {
              text: "012:012\nabc:abc\ndef:def\n"
            });
          });
          return it("P paste text from per selection register", function() {
            return ensure("y i w $ P", {
              text: "012012:\nabcabc:\ndefdef:\n"
            });
          });
        });
        return describe("ctrl-r in insert mode", function() {
          return it("insert from per selection registe", function() {
            ensure("d i w", {
              text: ":\n:\n:\n"
            });
            ensure('a', {
              mode: 'insert'
            });
            return ensure([
              'ctrl-r', {
                input: '"'
              }
            ], {
              text: ":012\n:abc\n:def\n"
            });
          });
        });
      });
    });
    return describe("Count modifier", function() {
      beforeEach(function() {
        return set({
          text: "000 111 222 333 444 555 666 777 888 999",
          cursor: [0, 0]
        });
      });
      it("repeat operator", function() {
        return ensure('3 d w', {
          text: "333 444 555 666 777 888 999"
        });
      });
      it("repeat motion", function() {
        return ensure('d 2 w', {
          text: "222 333 444 555 666 777 888 999"
        });
      });
      return it("repeat operator and motion respectively", function() {
        return ensure('3 d 2 w', {
          text: "666 777 888 999"
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9zcGVjL3ByZWZpeC1zcGVjLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEscUJBQUE7SUFBQTs7RUFBQyxjQUFlLE9BQUEsQ0FBUSxlQUFSOztFQUNoQixRQUFBLEdBQVcsT0FBQSxDQUFRLGlCQUFSOztFQUVYLFFBQUEsQ0FBUyxVQUFULEVBQXFCLFNBQUE7QUFDbkIsUUFBQTtJQUFBLE1BQTRELEVBQTVELEVBQUMsWUFBRCxFQUFNLGVBQU4sRUFBYyxrQkFBZCxFQUF5QixlQUF6QixFQUFpQyxzQkFBakMsRUFBZ0Q7SUFFaEQsVUFBQSxDQUFXLFNBQUE7YUFDVCxXQUFBLENBQVksU0FBQyxLQUFELEVBQVEsR0FBUjtRQUNWLFFBQUEsR0FBVztRQUNWLHdCQUFELEVBQVM7ZUFDUixhQUFELEVBQU0sbUJBQU4sRUFBYyx5QkFBZCxFQUEyQjtNQUhqQixDQUFaO0lBRFMsQ0FBWDtJQU1BLFFBQUEsQ0FBUyxRQUFULEVBQW1CLFNBQUE7TUFDakIsUUFBQSxDQUFTLGlCQUFULEVBQTRCLFNBQUE7UUFDMUIsVUFBQSxDQUFXLFNBQUE7aUJBQ1QsR0FBQSxDQUFJO1lBQUEsSUFBQSxFQUFNLGNBQU47WUFBc0IsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBOUI7V0FBSjtRQURTLENBQVg7UUFHQSxFQUFBLENBQUcsaUJBQUgsRUFBc0IsU0FBQTtpQkFDcEIsTUFBQSxDQUFPLEtBQVAsRUFBYztZQUFBLElBQUEsRUFBTSxXQUFOO1dBQWQ7UUFEb0IsQ0FBdEI7ZUFHQSxFQUFBLENBQUcsa0JBQUgsRUFBdUIsU0FBQTtpQkFDckIsTUFBQSxDQUFPLE9BQVAsRUFBZ0I7WUFBQSxJQUFBLEVBQU0sSUFBTjtXQUFoQjtRQURxQixDQUF2QjtNQVAwQixDQUE1QjtNQVVBLFFBQUEsQ0FBUyxjQUFULEVBQXlCLFNBQUE7UUFDdkIsVUFBQSxDQUFXLFNBQUE7aUJBQ1QsR0FBQSxDQUFJO1lBQUEsSUFBQSxFQUFNLGVBQU47WUFBdUIsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBL0I7V0FBSjtRQURTLENBQVg7ZUFHQSxFQUFBLENBQUcsaUJBQUgsRUFBc0IsU0FBQTtpQkFDcEIsTUFBQSxDQUFPLE9BQVAsRUFBZ0I7WUFBQSxJQUFBLEVBQU0sT0FBTjtXQUFoQjtRQURvQixDQUF0QjtNQUp1QixDQUF6QjthQU9BLFFBQUEsQ0FBUyxnQkFBVCxFQUEyQixTQUFBO1FBQ3pCLFVBQUEsQ0FBVyxTQUFBO2lCQUNULEdBQUEsQ0FBSTtZQUFBLElBQUEsRUFBTSxlQUFOO1lBQXVCLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQS9CO1dBQUo7UUFEUyxDQUFYO2VBR0EsRUFBQSxDQUFHLGtDQUFILEVBQXVDLFNBQUE7aUJBQ3JDLE1BQUEsQ0FBTyxPQUFQLEVBQWdCO1lBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtXQUFoQjtRQURxQyxDQUF2QztNQUp5QixDQUEzQjtJQWxCaUIsQ0FBbkI7SUF5QkEsUUFBQSxDQUFTLFVBQVQsRUFBcUIsU0FBQTtNQUNuQixVQUFBLENBQVcsU0FBQTtlQUNULFFBQVEsQ0FBQyxXQUFXLENBQUMsS0FBckIsQ0FBMkIsVUFBM0I7TUFEUyxDQUFYO01BR0EsUUFBQSxDQUFTLGdCQUFULEVBQTJCLFNBQUE7UUFDekIsRUFBQSxDQUFHLGtDQUFILEVBQXVDLFNBQUE7VUFDckMsR0FBQSxDQUFPO1lBQUEsUUFBQSxFQUFVO2NBQUEsQ0FBQSxFQUFHO2dCQUFBLElBQUEsRUFBTSxhQUFOO2VBQUg7YUFBVjtXQUFQO2lCQUNBLE1BQUEsQ0FBTztZQUFBLFFBQUEsRUFBVTtjQUFBLENBQUEsRUFBRztnQkFBQSxJQUFBLEVBQU0sYUFBTjtlQUFIO2FBQVY7V0FBUDtRQUZxQyxDQUF2QztlQUlBLEVBQUEsQ0FBRywrQ0FBSCxFQUFvRCxTQUFBO1VBQ2xELEdBQUEsQ0FBTztZQUFBLFFBQUEsRUFBVTtjQUFBLENBQUEsRUFBRztnQkFBQSxJQUFBLEVBQU0sU0FBTjtlQUFIO2FBQVY7V0FBUDtVQUNBLEdBQUEsQ0FBTztZQUFBLFFBQUEsRUFBVTtjQUFBLENBQUEsRUFBRztnQkFBQSxJQUFBLEVBQU0sYUFBTjtlQUFIO2FBQVY7V0FBUDtpQkFDQSxNQUFBLENBQU87WUFBQSxRQUFBLEVBQVU7Y0FBQSxDQUFBLEVBQUc7Z0JBQUEsSUFBQSxFQUFNLGFBQU47ZUFBSDthQUFWO1dBQVA7UUFIa0QsQ0FBcEQ7TUFMeUIsQ0FBM0I7TUFVQSxRQUFBLENBQVMsbUJBQVQsRUFBOEIsU0FBQTtRQUM1QixVQUFBLENBQVcsU0FBQTtpQkFDVCxHQUFBLENBQ0U7WUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO1lBQ0EsSUFBQSxFQUFNLGFBRE47V0FERjtRQURTLENBQVg7UUFNQSxFQUFBLENBQUcsZ0NBQUgsRUFBcUMsU0FBQTtVQUNuQyxNQUFBLENBQU8sV0FBUCxFQUFvQjtZQUFBLFFBQUEsRUFBVTtjQUFBLENBQUEsRUFBRztnQkFBQSxJQUFBLEVBQU0sS0FBTjtlQUFIO2FBQVY7V0FBcEI7VUFDQSxNQUFBLENBQU8sYUFBUCxFQUFzQjtZQUFBLFFBQUEsRUFBVTtjQUFBLENBQUEsRUFBRztnQkFBQSxJQUFBLEVBQU0sS0FBTjtlQUFIO2FBQVY7V0FBdEI7aUJBQ0EsTUFBQSxDQUFPLGFBQVAsRUFBc0I7WUFBQSxRQUFBLEVBQVU7Y0FBQSxDQUFBLEVBQUc7Z0JBQUEsSUFBQSxFQUFNLEtBQU47ZUFBSDthQUFWO1dBQXRCO1FBSG1DLENBQXJDO2VBS0EsRUFBQSxDQUFHLHVEQUFILEVBQTRELFNBQUE7aUJBQzFELE1BQUEsQ0FBTztZQUFDLFNBQUQsRUFBWTtjQUFDLEtBQUEsRUFBTyxHQUFSO2FBQVo7V0FBUCxFQUFrQztZQUFBLFFBQUEsRUFBVTtjQUFBLENBQUEsRUFBRztnQkFBQSxJQUFBLEVBQU0sVUFBTjtlQUFIO2FBQVY7V0FBbEM7UUFEMEQsQ0FBNUQ7TUFaNEIsQ0FBOUI7TUFlQSxRQUFBLENBQVMsZ0JBQVQsRUFBMkIsU0FBQTtRQUN6QixVQUFBLENBQVcsU0FBQTtVQUNULFFBQVEsQ0FBQyxXQUFXLENBQUMsS0FBckIsQ0FBMkIsVUFBM0I7VUFDQSxHQUFBLENBQUk7WUFBQSxRQUFBLEVBQVU7Y0FBQSxDQUFBLEVBQUc7Z0JBQUEsSUFBQSxFQUFNLGFBQU47ZUFBSDthQUFWO1dBQUo7aUJBQ0EsR0FBQSxDQUNFO1lBQUEsSUFBQSxFQUFNLFVBQU47WUFJQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUpSO1dBREY7UUFIUyxDQUFYO1FBVUEsUUFBQSxDQUFTLHNDQUFULEVBQWlELFNBQUE7VUFDL0MsRUFBQSxDQUFHLDJCQUFILEVBQWdDLFNBQUE7WUFDOUIsTUFBQSxDQUFPO2NBQUEsSUFBQSxFQUFNLFFBQU47YUFBUDttQkFDQSxNQUFBLENBQU87Y0FBQyxHQUFELEVBQU07Z0JBQUEsS0FBQSxFQUFPLEdBQVA7ZUFBTixFQUFrQixHQUFsQjthQUFQLEVBQ0U7Y0FBQSxJQUFBLEVBQU0scUJBQU47Y0FJQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksRUFBSixDQUpSO2FBREY7VUFGOEIsQ0FBaEM7aUJBU0EsRUFBQSxDQUFHLCtCQUFILEVBQW9DLFNBQUE7bUJBQ2xDLE1BQUEsQ0FBTztjQUFDLEdBQUQsRUFBTTtnQkFBQSxLQUFBLEVBQU8sR0FBUDtlQUFOLEVBQWtCLEdBQWxCO2FBQVAsRUFDRTtjQUFBLElBQUEsRUFBTSxVQUFOO2NBSUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FKUjthQURGO1VBRGtDLENBQXBDO1FBVitDLENBQWpEO2VBa0JBLFFBQUEsQ0FBUyxxREFBVCxFQUFnRSxTQUFBO2lCQUM5RCxFQUFBLENBQUcsd0NBQUgsRUFBNkMsU0FBQTttQkFDM0MsTUFBQSxDQUFPO2NBQUMsWUFBRCxFQUFlO2dCQUFBLEtBQUEsRUFBTyxHQUFQO2VBQWYsRUFBMkIsR0FBM0I7YUFBUCxFQUNFO2NBQUEsS0FBQSxFQUFPLCtCQUFQO2FBREY7VUFEMkMsQ0FBN0M7UUFEOEQsQ0FBaEU7TUE3QnlCLENBQTNCO01BcUNBLFFBQUEsQ0FBUyxnQkFBVCxFQUEyQixTQUFBO1FBQ3pCLEVBQUEsQ0FBRyxrQ0FBSCxFQUF1QyxTQUFBO1VBQ3JDLEdBQUEsQ0FBTztZQUFBLFFBQUEsRUFBVTtjQUFBLENBQUEsRUFBRztnQkFBQSxJQUFBLEVBQU0sYUFBTjtlQUFIO2FBQVY7V0FBUDtVQUNBLE1BQUEsQ0FBTztZQUFBLFFBQUEsRUFBVTtjQUFBLENBQUEsRUFBRztnQkFBQSxJQUFBLEVBQU0sYUFBTjtlQUFIO2FBQVY7V0FBUDtpQkFDQSxNQUFBLENBQU87WUFBQSxRQUFBLEVBQVU7Y0FBQSxDQUFBLEVBQUc7Z0JBQUEsSUFBQSxFQUFNLGFBQU47ZUFBSDthQUFWO1dBQVA7UUFIcUMsQ0FBdkM7UUFLQSxFQUFBLENBQUcsK0NBQUgsRUFBb0QsU0FBQTtVQUNsRCxHQUFBLENBQU87WUFBQSxRQUFBLEVBQVU7Y0FBQSxDQUFBLEVBQUc7Z0JBQUEsSUFBQSxFQUFNLFNBQU47ZUFBSDthQUFWO1dBQVA7VUFDQSxHQUFBLENBQU87WUFBQSxRQUFBLEVBQVU7Y0FBQSxDQUFBLEVBQUc7Z0JBQUEsSUFBQSxFQUFNLGFBQU47ZUFBSDthQUFWO1dBQVA7aUJBQ0EsTUFBQSxDQUFPO1lBQUEsUUFBQSxFQUFVO2NBQUEsQ0FBQSxFQUFHO2dCQUFBLElBQUEsRUFBTSxvQkFBTjtlQUFIO2FBQVY7V0FBUDtRQUhrRCxDQUFwRDtRQUtBLEVBQUEsQ0FBRyxpRUFBSCxFQUFzRSxTQUFBO1VBQ3BFLEdBQUEsQ0FBTztZQUFBLFFBQUEsRUFBVTtjQUFBLENBQUEsRUFBRztnQkFBQSxJQUFBLEVBQU0sV0FBTjtnQkFBbUIsSUFBQSxFQUFNLFVBQXpCO2VBQUg7YUFBVjtXQUFQO1VBQ0EsR0FBQSxDQUFPO1lBQUEsUUFBQSxFQUFVO2NBQUEsQ0FBQSxFQUFHO2dCQUFBLElBQUEsRUFBTSxhQUFOO2VBQUg7YUFBVjtXQUFQO2lCQUNBLE1BQUEsQ0FBTztZQUFBLFFBQUEsRUFBVTtjQUFBLENBQUEsRUFBRztnQkFBQSxJQUFBLEVBQU0sd0JBQU47ZUFBSDthQUFWO1dBQVA7UUFIb0UsQ0FBdEU7ZUFLQSxFQUFBLENBQUcsa0VBQUgsRUFBdUUsU0FBQTtVQUNyRSxHQUFBLENBQU87WUFBQSxRQUFBLEVBQVU7Y0FBQSxDQUFBLEVBQUc7Z0JBQUEsSUFBQSxFQUFNLFNBQU47ZUFBSDthQUFWO1dBQVA7VUFDQSxHQUFBLENBQU87WUFBQSxRQUFBLEVBQVU7Y0FBQSxDQUFBLEVBQUc7Z0JBQUEsSUFBQSxFQUFNLGVBQU47Z0JBQXVCLElBQUEsRUFBTSxVQUE3QjtlQUFIO2FBQVY7V0FBUDtpQkFDQSxNQUFBLENBQU87WUFBQSxRQUFBLEVBQVU7Y0FBQSxDQUFBLEVBQUc7Z0JBQUEsSUFBQSxFQUFNLHdCQUFOO2VBQUg7YUFBVjtXQUFQO1FBSHFFLENBQXZFO01BaEJ5QixDQUEzQjtNQXFCQSxRQUFBLENBQVMsZ0JBQVQsRUFBMkIsU0FBQTtRQUN6QixRQUFBLENBQVMsU0FBVCxFQUFvQixTQUFBO2lCQUNsQixFQUFBLENBQUcsa0NBQUgsRUFBdUMsU0FBQTttQkFDckMsTUFBQSxDQUFPO2NBQUEsUUFBQSxFQUFVO2dCQUFBLEdBQUEsRUFBSztrQkFBQSxJQUFBLEVBQU0sMkJBQU47a0JBQW1DLElBQUEsRUFBTSxlQUF6QztpQkFBTDtlQUFWO2FBQVA7VUFEcUMsQ0FBdkM7UUFEa0IsQ0FBcEI7ZUFJQSxRQUFBLENBQVMsU0FBVCxFQUFvQixTQUFBO1VBQ2xCLFVBQUEsQ0FBVyxTQUFBO21CQUNULEdBQUEsQ0FBSTtjQUFBLFFBQUEsRUFBVTtnQkFBQSxHQUFBLEVBQUs7a0JBQUEsSUFBQSxFQUFNLGFBQU47aUJBQUw7ZUFBVjthQUFKO1VBRFMsQ0FBWDtpQkFHQSxFQUFBLENBQUcsaURBQUgsRUFBc0QsU0FBQTttQkFDcEQsTUFBQSxDQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBZixDQUFBLENBQVAsQ0FBNkIsQ0FBQyxPQUE5QixDQUFzQyxhQUF0QztVQURvRCxDQUF0RDtRQUprQixDQUFwQjtNQUx5QixDQUEzQjtNQWdCQSxRQUFBLENBQVMsZ0JBQVQsRUFBMkIsU0FBQTtRQUN6QixRQUFBLENBQVMsU0FBVCxFQUFvQixTQUFBO2lCQUNsQixFQUFBLENBQUcsa0NBQUgsRUFBdUMsU0FBQTttQkFDckMsTUFBQSxDQUFPO2NBQUEsUUFBQSxFQUNMO2dCQUFBLEdBQUEsRUFBSztrQkFBQSxJQUFBLEVBQU0sMkJBQU47a0JBQW1DLElBQUEsRUFBTSxlQUF6QztpQkFBTDtlQURLO2FBQVA7VUFEcUMsQ0FBdkM7UUFEa0IsQ0FBcEI7ZUFLQSxRQUFBLENBQVMsU0FBVCxFQUFvQixTQUFBO1VBQ2xCLFVBQUEsQ0FBVyxTQUFBO21CQUNULEdBQUEsQ0FBSTtjQUFBLFFBQUEsRUFBVTtnQkFBQSxHQUFBLEVBQUs7a0JBQUEsSUFBQSxFQUFNLGFBQU47aUJBQUw7ZUFBVjthQUFKO1VBRFMsQ0FBWDtpQkFHQSxFQUFBLENBQUcsaURBQUgsRUFBc0QsU0FBQTttQkFDcEQsTUFBQSxDQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBZixDQUFBLENBQVAsQ0FBNkIsQ0FBQyxPQUE5QixDQUFzQyxhQUF0QztVQURvRCxDQUF0RDtRQUprQixDQUFwQjtNQU55QixDQUEzQjtNQWFBLFFBQUEsQ0FBUyxnQkFBVCxFQUEyQixTQUFBO1FBQ3pCLFFBQUEsQ0FBUyxTQUFULEVBQW9CLFNBQUE7aUJBQ2xCLEVBQUEsQ0FBRyw0QkFBSCxFQUFpQyxTQUFBO21CQUMvQixNQUFBLENBQU87Y0FBQSxRQUFBLEVBQVU7Z0JBQUEsR0FBQSxFQUFLO2tCQUFBLElBQUEsRUFBTSxFQUFOO2lCQUFMO2VBQVY7YUFBUDtVQUQrQixDQUFqQztRQURrQixDQUFwQjtlQUlBLFFBQUEsQ0FBUyxTQUFULEVBQW9CLFNBQUE7aUJBQ2xCLEVBQUEsQ0FBRyxvQ0FBSCxFQUF5QyxTQUFBO1lBQ3ZDLEdBQUEsQ0FBSTtjQUFBLFFBQUEsRUFBYTtnQkFBQSxHQUFBLEVBQUs7a0JBQUEsSUFBQSxFQUFNLGFBQU47aUJBQUw7ZUFBYjthQUFKO21CQUNBLE1BQUEsQ0FBTztjQUFBLFFBQUEsRUFBVTtnQkFBQSxHQUFBLEVBQUs7a0JBQUEsSUFBQSxFQUFNLEVBQU47aUJBQUw7ZUFBVjthQUFQO1VBRnVDLENBQXpDO1FBRGtCLENBQXBCO01BTHlCLENBQTNCO01BVUEsUUFBQSxDQUFTLGdCQUFULEVBQTJCLFNBQUE7UUFDekIsVUFBQSxDQUFXLFNBQUE7aUJBQ1QsS0FBQSxDQUFNLE1BQU4sRUFBYyxRQUFkLENBQXVCLENBQUMsU0FBeEIsQ0FBa0MsNkJBQWxDO1FBRFMsQ0FBWDtRQUdBLFFBQUEsQ0FBUyxTQUFULEVBQW9CLFNBQUE7aUJBQ2xCLEVBQUEsQ0FBRyw0Q0FBSCxFQUFpRCxTQUFBO21CQUMvQyxNQUFBLENBQU87Y0FBQSxRQUFBLEVBQVU7Z0JBQUEsR0FBQSxFQUFLO2tCQUFBLElBQUEsRUFBTSw2QkFBTjtpQkFBTDtlQUFWO2FBQVA7VUFEK0MsQ0FBakQ7UUFEa0IsQ0FBcEI7ZUFJQSxRQUFBLENBQVMsU0FBVCxFQUFvQixTQUFBO2lCQUNsQixFQUFBLENBQUcsb0NBQUgsRUFBeUMsU0FBQTtZQUN2QyxHQUFBLENBQU87Y0FBQSxRQUFBLEVBQVU7Z0JBQUEsR0FBQSxFQUFLO2tCQUFBLElBQUEsRUFBTSxhQUFOO2lCQUFMO2VBQVY7YUFBUDttQkFDQSxNQUFBLENBQU87Y0FBQSxRQUFBLEVBQVU7Z0JBQUEsR0FBQSxFQUFLO2tCQUFBLElBQUEsRUFBTSw2QkFBTjtpQkFBTDtlQUFWO2FBQVA7VUFGdUMsQ0FBekM7UUFEa0IsQ0FBcEI7TUFSeUIsQ0FBM0I7TUFhQSxRQUFBLENBQVMsbUNBQVQsRUFBOEMsU0FBQTtRQUM1QyxVQUFBLENBQVcsU0FBQTtVQUNULEdBQUEsQ0FBSTtZQUFBLFFBQUEsRUFBVTtjQUFBLEdBQUEsRUFBSztnQkFBQSxJQUFBLEVBQU0sS0FBTjtlQUFMO2FBQVY7V0FBSjtVQUNBLEdBQUEsQ0FBSTtZQUFBLFFBQUEsRUFBVTtjQUFBLEdBQUEsRUFBSztnQkFBQSxJQUFBLEVBQU0sS0FBTjtlQUFMO2FBQVY7V0FBSjtVQUNBLEdBQUEsQ0FBSTtZQUFBLFFBQUEsRUFBVTtjQUFBLEdBQUEsRUFBSztnQkFBQSxJQUFBLEVBQU0sS0FBTjtlQUFMO2FBQVY7V0FBSjtVQUNBLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBZixDQUFxQixNQUFyQjtVQUNBLEdBQUEsQ0FBSTtZQUFBLElBQUEsRUFBTSxPQUFOO1lBQWUsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBdkI7V0FBSjtpQkFDQSxNQUFBLENBQU8sR0FBUCxFQUFZO1lBQUEsSUFBQSxFQUFNLFFBQU47V0FBWjtRQU5TLENBQVg7UUFRQSxRQUFBLENBQVMsc0NBQVQsRUFBaUQsU0FBQTtVQUMvQyxVQUFBLENBQVcsU0FBQTtZQUNULFFBQVEsQ0FBQyxHQUFULENBQWEsK0JBQWIsRUFBOEMsSUFBOUM7WUFDQSxHQUFBLENBQUk7Y0FBQSxRQUFBLEVBQVU7Z0JBQUEsR0FBQSxFQUFLO2tCQUFBLElBQUEsRUFBTSxLQUFOO2lCQUFMO2VBQVY7YUFBSjttQkFDQSxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQWYsQ0FBcUIsTUFBckI7VUFIUyxDQUFYO2lCQUtBLEVBQUEsQ0FBRyx5Q0FBSCxFQUE4QyxTQUFBO21CQUM1QyxNQUFBLENBQU87Y0FBQyxRQUFELEVBQVc7Z0JBQUEsS0FBQSxFQUFPLEdBQVA7ZUFBWDthQUFQLEVBQStCO2NBQUEsSUFBQSxFQUFNLFdBQU47YUFBL0I7VUFENEMsQ0FBOUM7UUFOK0MsQ0FBakQ7UUFTQSxRQUFBLENBQVMsdUNBQVQsRUFBa0QsU0FBQTtVQUNoRCxVQUFBLENBQVcsU0FBQTtZQUNULFFBQVEsQ0FBQyxHQUFULENBQWEsK0JBQWIsRUFBOEMsS0FBOUM7WUFDQSxHQUFBLENBQUk7Y0FBQSxRQUFBLEVBQVU7Z0JBQUEsR0FBQSxFQUFLO2tCQUFBLElBQUEsRUFBTSxLQUFOO2lCQUFMO2VBQVY7YUFBSjttQkFDQSxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQWYsQ0FBcUIsTUFBckI7VUFIUyxDQUFYO2lCQUtBLEVBQUEsQ0FBRyxrQ0FBSCxFQUF1QyxTQUFBO21CQUNyQyxNQUFBLENBQU87Y0FBQyxRQUFELEVBQVc7Z0JBQUEsS0FBQSxFQUFPLEdBQVA7ZUFBWDthQUFQLEVBQStCO2NBQUEsSUFBQSxFQUFNLFVBQU47YUFBL0I7VUFEcUMsQ0FBdkM7UUFOZ0QsQ0FBbEQ7UUFTQSxFQUFBLENBQUcsc0NBQUgsRUFBMkMsU0FBQTtpQkFDekMsTUFBQSxDQUFPO1lBQUMsUUFBRCxFQUFXO2NBQUEsS0FBQSxFQUFPLEdBQVA7YUFBWDtXQUFQLEVBQStCO1lBQUEsSUFBQSxFQUFNLFVBQU47V0FBL0I7UUFEeUMsQ0FBM0M7ZUFHQSxFQUFBLENBQUcsa0NBQUgsRUFBdUMsU0FBQTtpQkFDckMsTUFBQSxDQUFPLGVBQVAsRUFDRTtZQUFBLElBQUEsRUFBTSxPQUFOO1lBQ0EsSUFBQSxFQUFNLFFBRE47WUFFQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUZSO1dBREY7UUFEcUMsQ0FBdkM7TUE5QjRDLENBQTlDO2FBb0NBLFFBQUEsQ0FBUyx5QkFBVCxFQUFvQyxTQUFBO0FBQ2xDLFlBQUE7UUFBQSwwQkFBQSxHQUE2QixTQUFBO0FBQzNCLGNBQUE7VUFENEI7QUFDNUI7QUFBQTtlQUFBLDhDQUFBOzt5QkFDRSxNQUFBLENBQU87Y0FBQSxRQUFBLEVBQVU7Z0JBQUEsR0FBQSxFQUFLO2tCQUFDLElBQUEsRUFBTSxLQUFNLENBQUEsQ0FBQSxDQUFiO2tCQUFpQixTQUFBLEVBQVcsU0FBNUI7aUJBQUw7ZUFBVjthQUFQO0FBREY7O1FBRDJCO1FBSTdCLFVBQUEsQ0FBVyxTQUFBO1VBQ1QsUUFBUSxDQUFDLEdBQVQsQ0FBYSwrQkFBYixFQUE4QyxJQUE5QztpQkFDQSxHQUFBLENBQ0U7WUFBQSxJQUFBLEVBQU0sb0JBQU47WUFLQSxNQUFBLEVBQVEsQ0FBQyxDQUFDLENBQUQsRUFBSSxDQUFKLENBQUQsRUFBUyxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVQsRUFBaUIsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFqQixDQUxSO1dBREY7UUFGUyxDQUFYO1FBVUEsUUFBQSxDQUFTLHVCQUFULEVBQWtDLFNBQUE7aUJBQ2hDLEVBQUEsQ0FBRyxzREFBSCxFQUEyRCxTQUFBO0FBQ3pELGdCQUFBO1lBQUEsT0FBa0QsUUFBUSxDQUFDLFFBQTNELEVBQUMsZ0RBQUQsRUFBdUI7WUFDdkIsTUFBQSxDQUFPLG9CQUFvQixDQUFDLElBQTVCLENBQWlDLENBQUMsSUFBbEMsQ0FBdUMsQ0FBdkM7WUFDQSxNQUFBLENBQU8sdUJBQXVCLENBQUMsSUFBL0IsQ0FBb0MsQ0FBQyxJQUFyQyxDQUEwQyxDQUExQztZQUVBLFNBQUEsQ0FBVSxPQUFWO1lBQ0EsMEJBQUEsQ0FBMkIsS0FBM0IsRUFBa0MsS0FBbEMsRUFBeUMsS0FBekM7WUFFQSxNQUFBLENBQU8sb0JBQW9CLENBQUMsSUFBNUIsQ0FBaUMsQ0FBQyxJQUFsQyxDQUF1QyxDQUF2QztZQUNBLE1BQUEsQ0FBTyx1QkFBdUIsQ0FBQyxJQUEvQixDQUFvQyxDQUFDLElBQXJDLENBQTBDLENBQTFDO0FBQ0E7QUFBQSxpQkFBQSxzQ0FBQTs7Y0FBQSxTQUFTLENBQUMsT0FBVixDQUFBO0FBQUE7WUFDQSxNQUFBLENBQU8sb0JBQW9CLENBQUMsSUFBNUIsQ0FBaUMsQ0FBQyxJQUFsQyxDQUF1QyxDQUF2QzttQkFDQSxNQUFBLENBQU8sdUJBQXVCLENBQUMsSUFBL0IsQ0FBb0MsQ0FBQyxJQUFyQyxDQUEwQyxDQUExQztVQVp5RCxDQUEzRDtRQURnQyxDQUFsQztRQWVBLFFBQUEsQ0FBUyxNQUFULEVBQWlCLFNBQUE7aUJBQ2YsRUFBQSxDQUFHLHFDQUFILEVBQTBDLFNBQUE7WUFDeEMsU0FBQSxDQUFVLE9BQVY7bUJBQ0EsMEJBQUEsQ0FBMkIsS0FBM0IsRUFBa0MsS0FBbEMsRUFBeUMsS0FBekM7VUFGd0MsQ0FBMUM7UUFEZSxDQUFqQjtRQUtBLFFBQUEsQ0FBUyxlQUFULEVBQTBCLFNBQUE7VUFDeEIsRUFBQSxDQUFHLEdBQUgsRUFBUSxTQUFBO1lBQ04sTUFBQSxDQUFPLE9BQVAsRUFBZ0I7Y0FBQSxJQUFBLEVBQU0sV0FBTjthQUFoQjttQkFDQSwwQkFBQSxDQUEyQixLQUEzQixFQUFrQyxLQUFsQyxFQUF5QyxLQUF6QztVQUZNLENBQVI7VUFHQSxFQUFBLENBQUcsR0FBSCxFQUFRLFNBQUE7WUFDTixNQUFBLENBQU8sR0FBUCxFQUFZO2NBQUEsSUFBQSxFQUFNLGlCQUFOO2FBQVo7bUJBQ0EsMEJBQUEsQ0FBMkIsR0FBM0IsRUFBZ0MsR0FBaEMsRUFBcUMsR0FBckM7VUFGTSxDQUFSO1VBR0EsRUFBQSxDQUFHLEdBQUgsRUFBUSxTQUFBO1lBQ04sTUFBQSxDQUFPLEdBQVAsRUFBWTtjQUFBLElBQUEsRUFBTSxpQkFBTjthQUFaO21CQUNBLDBCQUFBLENBQTJCLEdBQTNCLEVBQWdDLEdBQWhDLEVBQXFDLEdBQXJDO1VBRk0sQ0FBUjtpQkFHQSxFQUFBLENBQUcsR0FBSCxFQUFRLFNBQUE7WUFDTixNQUFBLENBQU8sR0FBUCxFQUFZO2NBQUEsSUFBQSxFQUFNLFdBQU47YUFBWjttQkFDQSwwQkFBQSxDQUEyQixLQUEzQixFQUFrQyxLQUFsQyxFQUF5QyxLQUF6QztVQUZNLENBQVI7UUFWd0IsQ0FBMUI7UUFjQSxRQUFBLENBQVMsWUFBVCxFQUF1QixTQUFBO1VBQ3JCLEVBQUEsQ0FBRywwQ0FBSCxFQUErQyxTQUFBO21CQUM3QyxNQUFBLENBQU8sV0FBUCxFQUNFO2NBQUEsSUFBQSxFQUFNLDZCQUFOO2FBREY7VUFENkMsQ0FBL0M7aUJBT0EsRUFBQSxDQUFHLDBDQUFILEVBQStDLFNBQUE7bUJBQzdDLE1BQUEsQ0FBTyxXQUFQLEVBQ0U7Y0FBQSxJQUFBLEVBQU0sNkJBQU47YUFERjtVQUQ2QyxDQUEvQztRQVJxQixDQUF2QjtlQWVBLFFBQUEsQ0FBUyx1QkFBVCxFQUFrQyxTQUFBO2lCQUNoQyxFQUFBLENBQUcsbUNBQUgsRUFBd0MsU0FBQTtZQUN0QyxNQUFBLENBQU8sT0FBUCxFQUFnQjtjQUFBLElBQUEsRUFBTSxXQUFOO2FBQWhCO1lBQ0EsTUFBQSxDQUFPLEdBQVAsRUFBWTtjQUFBLElBQUEsRUFBTSxRQUFOO2FBQVo7bUJBQ0EsTUFBQSxDQUFPO2NBQUMsUUFBRCxFQUFXO2dCQUFBLEtBQUEsRUFBTyxHQUFQO2VBQVg7YUFBUCxFQUNFO2NBQUEsSUFBQSxFQUFNLG9CQUFOO2FBREY7VUFIc0MsQ0FBeEM7UUFEZ0MsQ0FBbEM7TUFoRWtDLENBQXBDO0lBL0ttQixDQUFyQjtXQTBQQSxRQUFBLENBQVMsZ0JBQVQsRUFBMkIsU0FBQTtNQUN6QixVQUFBLENBQVcsU0FBQTtlQUNULEdBQUEsQ0FDRTtVQUFBLElBQUEsRUFBTSx5Q0FBTjtVQUNBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBRFI7U0FERjtNQURTLENBQVg7TUFLQSxFQUFBLENBQUcsaUJBQUgsRUFBc0IsU0FBQTtlQUNwQixNQUFBLENBQU8sT0FBUCxFQUFnQjtVQUFBLElBQUEsRUFBTSw2QkFBTjtTQUFoQjtNQURvQixDQUF0QjtNQUVBLEVBQUEsQ0FBRyxlQUFILEVBQW9CLFNBQUE7ZUFDbEIsTUFBQSxDQUFPLE9BQVAsRUFBZ0I7VUFBQSxJQUFBLEVBQU0saUNBQU47U0FBaEI7TUFEa0IsQ0FBcEI7YUFFQSxFQUFBLENBQUcseUNBQUgsRUFBOEMsU0FBQTtlQUM1QyxNQUFBLENBQU8sU0FBUCxFQUFrQjtVQUFBLElBQUEsRUFBTSxpQkFBTjtTQUFsQjtNQUQ0QyxDQUE5QztJQVZ5QixDQUEzQjtFQTVSbUIsQ0FBckI7QUFIQSIsInNvdXJjZXNDb250ZW50IjpbIntnZXRWaW1TdGF0ZX0gPSByZXF1aXJlICcuL3NwZWMtaGVscGVyJ1xuc2V0dGluZ3MgPSByZXF1aXJlICcuLi9saWIvc2V0dGluZ3MnXG5cbmRlc2NyaWJlIFwiUHJlZml4ZXNcIiwgLT5cbiAgW3NldCwgZW5zdXJlLCBrZXlzdHJva2UsIGVkaXRvciwgZWRpdG9yRWxlbWVudCwgdmltU3RhdGVdID0gW11cblxuICBiZWZvcmVFYWNoIC0+XG4gICAgZ2V0VmltU3RhdGUgKHN0YXRlLCB2aW0pIC0+XG4gICAgICB2aW1TdGF0ZSA9IHN0YXRlXG4gICAgICB7ZWRpdG9yLCBlZGl0b3JFbGVtZW50fSA9IHZpbVN0YXRlXG4gICAgICB7c2V0LCBlbnN1cmUsIGtleXN0cm9rZX0gPSB2aW1cblxuICBkZXNjcmliZSBcIlJlcGVhdFwiLCAtPlxuICAgIGRlc2NyaWJlIFwid2l0aCBvcGVyYXRpb25zXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldCB0ZXh0OiBcIjEyMzQ1Njc4OWFiY1wiLCBjdXJzb3I6IFswLCAwXVxuXG4gICAgICBpdCBcInJlcGVhdHMgTiB0aW1lc1wiLCAtPlxuICAgICAgICBlbnN1cmUgJzMgeCcsIHRleHQ6ICc0NTY3ODlhYmMnXG5cbiAgICAgIGl0IFwicmVwZWF0cyBOTiB0aW1lc1wiLCAtPlxuICAgICAgICBlbnN1cmUgJzEgMCB4JywgdGV4dDogJ2JjJ1xuXG4gICAgZGVzY3JpYmUgXCJ3aXRoIG1vdGlvbnNcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0IHRleHQ6ICdvbmUgdHdvIHRocmVlJywgY3Vyc29yOiBbMCwgMF1cblxuICAgICAgaXQgXCJyZXBlYXRzIE4gdGltZXNcIiwgLT5cbiAgICAgICAgZW5zdXJlICdkIDIgdycsIHRleHQ6ICd0aHJlZSdcblxuICAgIGRlc2NyaWJlIFwiaW4gdmlzdWFsIG1vZGVcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0IHRleHQ6ICdvbmUgdHdvIHRocmVlJywgY3Vyc29yOiBbMCwgMF1cblxuICAgICAgaXQgXCJyZXBlYXRzIG1vdmVtZW50cyBpbiB2aXN1YWwgbW9kZVwiLCAtPlxuICAgICAgICBlbnN1cmUgJ3YgMiB3JywgY3Vyc29yOiBbMCwgOV1cblxuICBkZXNjcmliZSBcIlJlZ2lzdGVyXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgdmltU3RhdGUuZ2xvYmFsU3RhdGUucmVzZXQoJ3JlZ2lzdGVyJylcblxuICAgIGRlc2NyaWJlIFwidGhlIGEgcmVnaXN0ZXJcIiwgLT5cbiAgICAgIGl0IFwic2F2ZXMgYSB2YWx1ZSBmb3IgZnV0dXJlIHJlYWRpbmdcIiwgLT5cbiAgICAgICAgc2V0ICAgIHJlZ2lzdGVyOiBhOiB0ZXh0OiAnbmV3IGNvbnRlbnQnXG4gICAgICAgIGVuc3VyZSByZWdpc3RlcjogYTogdGV4dDogJ25ldyBjb250ZW50J1xuXG4gICAgICBpdCBcIm92ZXJ3cml0ZXMgYSB2YWx1ZSBwcmV2aW91c2x5IGluIHRoZSByZWdpc3RlclwiLCAtPlxuICAgICAgICBzZXQgICAgcmVnaXN0ZXI6IGE6IHRleHQ6ICdjb250ZW50J1xuICAgICAgICBzZXQgICAgcmVnaXN0ZXI6IGE6IHRleHQ6ICduZXcgY29udGVudCdcbiAgICAgICAgZW5zdXJlIHJlZ2lzdGVyOiBhOiB0ZXh0OiAnbmV3IGNvbnRlbnQnXG5cbiAgICBkZXNjcmliZSBcIndpdGggeWFuayBjb21tYW5kXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIGN1cnNvcjogWzAsIDBdXG4gICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgYWFhIGJiYiBjY2NcbiAgICAgICAgICBcIlwiXCJcbiAgICAgIGl0IFwic2F2ZSB0byBwcmUgc3BlY2lmaWVkIHJlZ2lzdGVyXCIsIC0+XG4gICAgICAgIGVuc3VyZSAnXCIgYSB5IGkgdycsIHJlZ2lzdGVyOiBhOiB0ZXh0OiAnYWFhJ1xuICAgICAgICBlbnN1cmUgJ3cgXCIgYiB5IGkgdycsIHJlZ2lzdGVyOiBiOiB0ZXh0OiAnYmJiJ1xuICAgICAgICBlbnN1cmUgJ3cgXCIgYyB5IGkgdycsIHJlZ2lzdGVyOiBjOiB0ZXh0OiAnY2NjJ1xuXG4gICAgICBpdCBcIndvcmsgd2l0aCBtb3Rpb24gd2hpY2ggYWxzbyByZXF1aXJlIGlucHV0IHN1Y2ggYXMgJ3QnXCIsIC0+XG4gICAgICAgIGVuc3VyZSBbJ1wiIGEgeSB0Jywge2lucHV0OiAnYyd9XSwgcmVnaXN0ZXI6IGE6IHRleHQ6ICdhYWEgYmJiICdcblxuICAgIGRlc2NyaWJlIFwiV2l0aCBwIGNvbW1hbmRcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgdmltU3RhdGUuZ2xvYmFsU3RhdGUucmVzZXQoJ3JlZ2lzdGVyJylcbiAgICAgICAgc2V0IHJlZ2lzdGVyOiBhOiB0ZXh0OiAnbmV3IGNvbnRlbnQnXG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgIGFiY1xuICAgICAgICAgIGRlZlxuICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIGN1cnNvcjogWzAsIDBdXG5cbiAgICAgIGRlc2NyaWJlIFwid2hlbiBzcGVjaWZpZWQgcmVnaXN0ZXIgaGF2ZSBubyB0ZXh0XCIsIC0+XG4gICAgICAgIGl0IFwiY2FuIHBhc3RlIGZyb20gYSByZWdpc3RlclwiLCAtPlxuICAgICAgICAgIGVuc3VyZSBtb2RlOiBcIm5vcm1hbFwiXG4gICAgICAgICAgZW5zdXJlIFsnXCInLCBpbnB1dDogJ2EnLCAncCddLFxuICAgICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICBhbmV3IGNvbnRlbnRiY1xuICAgICAgICAgICAgZGVmXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgIGN1cnNvcjogWzAsIDExXVxuXG4gICAgICAgIGl0IFwiYnV0IGRvIG5vdGhpbmcgZm9yIHogcmVnaXN0ZXJcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgWydcIicsIGlucHV0OiAneicsICdwJ10sXG4gICAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIGFiY1xuICAgICAgICAgICAgZGVmXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgIGN1cnNvcjogWzAsIDBdXG5cbiAgICAgIGRlc2NyaWJlIFwiYmxvY2t3aXNlLW1vZGUgcGFzdGUganVzdCB1c2UgcmVnaXN0ZXIgaGF2ZSBubyB0ZXh0XCIsIC0+XG4gICAgICAgIGl0IFwicGFzdGUgZnJvbSBhIHJlZ2lzdGVyIHRvIGVhY2ggc2VsY3Rpb25cIiwgLT5cbiAgICAgICAgICBlbnN1cmUgWydjdHJsLXYgaiBcIicsIGlucHV0OiAnYScsICdwJ10sXG4gICAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICAhbmV3IGNvbnRlbnRiY1xuICAgICAgICAgICAgbmV3IGNvbnRlbnRlZlxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICBkZXNjcmliZSBcInRoZSBCIHJlZ2lzdGVyXCIsIC0+XG4gICAgICBpdCBcInNhdmVzIGEgdmFsdWUgZm9yIGZ1dHVyZSByZWFkaW5nXCIsIC0+XG4gICAgICAgIHNldCAgICByZWdpc3RlcjogQjogdGV4dDogJ25ldyBjb250ZW50J1xuICAgICAgICBlbnN1cmUgcmVnaXN0ZXI6IGI6IHRleHQ6ICduZXcgY29udGVudCdcbiAgICAgICAgZW5zdXJlIHJlZ2lzdGVyOiBCOiB0ZXh0OiAnbmV3IGNvbnRlbnQnXG5cbiAgICAgIGl0IFwiYXBwZW5kcyB0byBhIHZhbHVlIHByZXZpb3VzbHkgaW4gdGhlIHJlZ2lzdGVyXCIsIC0+XG4gICAgICAgIHNldCAgICByZWdpc3RlcjogYjogdGV4dDogJ2NvbnRlbnQnXG4gICAgICAgIHNldCAgICByZWdpc3RlcjogQjogdGV4dDogJ25ldyBjb250ZW50J1xuICAgICAgICBlbnN1cmUgcmVnaXN0ZXI6IGI6IHRleHQ6ICdjb250ZW50bmV3IGNvbnRlbnQnXG5cbiAgICAgIGl0IFwiYXBwZW5kcyBsaW5ld2lzZSB0byBhIGxpbmV3aXNlIHZhbHVlIHByZXZpb3VzbHkgaW4gdGhlIHJlZ2lzdGVyXCIsIC0+XG4gICAgICAgIHNldCAgICByZWdpc3RlcjogYjogdGV4dDogJ2NvbnRlbnRcXG4nLCB0eXBlOiAnbGluZXdpc2UnXG4gICAgICAgIHNldCAgICByZWdpc3RlcjogQjogdGV4dDogJ25ldyBjb250ZW50J1xuICAgICAgICBlbnN1cmUgcmVnaXN0ZXI6IGI6IHRleHQ6ICdjb250ZW50XFxubmV3IGNvbnRlbnRcXG4nXG5cbiAgICAgIGl0IFwiYXBwZW5kcyBsaW5ld2lzZSB0byBhIGNoYXJhY3RlciB2YWx1ZSBwcmV2aW91c2x5IGluIHRoZSByZWdpc3RlclwiLCAtPlxuICAgICAgICBzZXQgICAgcmVnaXN0ZXI6IGI6IHRleHQ6ICdjb250ZW50J1xuICAgICAgICBzZXQgICAgcmVnaXN0ZXI6IEI6IHRleHQ6ICduZXcgY29udGVudFxcbicsIHR5cGU6ICdsaW5ld2lzZSdcbiAgICAgICAgZW5zdXJlIHJlZ2lzdGVyOiBiOiB0ZXh0OiAnY29udGVudFxcbm5ldyBjb250ZW50XFxuJ1xuXG4gICAgZGVzY3JpYmUgXCJ0aGUgKiByZWdpc3RlclwiLCAtPlxuICAgICAgZGVzY3JpYmUgXCJyZWFkaW5nXCIsIC0+XG4gICAgICAgIGl0IFwiaXMgdGhlIHNhbWUgdGhlIHN5c3RlbSBjbGlwYm9hcmRcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgcmVnaXN0ZXI6ICcqJzogdGV4dDogJ2luaXRpYWwgY2xpcGJvYXJkIGNvbnRlbnQnLCB0eXBlOiAnY2hhcmFjdGVyd2lzZSdcblxuICAgICAgZGVzY3JpYmUgXCJ3cml0aW5nXCIsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBzZXQgcmVnaXN0ZXI6ICcqJzogdGV4dDogJ25ldyBjb250ZW50J1xuXG4gICAgICAgIGl0IFwib3ZlcndyaXRlcyB0aGUgY29udGVudHMgb2YgdGhlIHN5c3RlbSBjbGlwYm9hcmRcIiwgLT5cbiAgICAgICAgICBleHBlY3QoYXRvbS5jbGlwYm9hcmQucmVhZCgpKS50b0VxdWFsICduZXcgY29udGVudCdcblxuICAgICMgRklYTUU6IG9uY2UgbGludXggc3VwcG9ydCBjb21lcyBvdXQsIHRoaXMgbmVlZHMgdG8gcmVhZCBmcm9tXG4gICAgIyB0aGUgY29ycmVjdCBjbGlwYm9hcmQuIEZvciBub3cgaXQgYmVoYXZlcyBqdXN0IGxpa2UgdGhlICogcmVnaXN0ZXJcbiAgICAjIFNlZSA6aGVscCB4MTEtY3V0LWJ1ZmZlciBhbmQgOmhlbHAgcmVnaXN0ZXJzIGZvciBtb3JlIGRldGFpbHMgb24gaG93IHRoZXNlXG4gICAgIyByZWdpc3RlcnMgd29yayBvbiBhbiBYMTEgYmFzZWQgc3lzdGVtLlxuICAgIGRlc2NyaWJlIFwidGhlICsgcmVnaXN0ZXJcIiwgLT5cbiAgICAgIGRlc2NyaWJlIFwicmVhZGluZ1wiLCAtPlxuICAgICAgICBpdCBcImlzIHRoZSBzYW1lIHRoZSBzeXN0ZW0gY2xpcGJvYXJkXCIsIC0+XG4gICAgICAgICAgZW5zdXJlIHJlZ2lzdGVyOlxuICAgICAgICAgICAgJyonOiB0ZXh0OiAnaW5pdGlhbCBjbGlwYm9hcmQgY29udGVudCcsIHR5cGU6ICdjaGFyYWN0ZXJ3aXNlJ1xuXG4gICAgICBkZXNjcmliZSBcIndyaXRpbmdcIiwgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIHNldCByZWdpc3RlcjogJyonOiB0ZXh0OiAnbmV3IGNvbnRlbnQnXG5cbiAgICAgICAgaXQgXCJvdmVyd3JpdGVzIHRoZSBjb250ZW50cyBvZiB0aGUgc3lzdGVtIGNsaXBib2FyZFwiLCAtPlxuICAgICAgICAgIGV4cGVjdChhdG9tLmNsaXBib2FyZC5yZWFkKCkpLnRvRXF1YWwgJ25ldyBjb250ZW50J1xuXG4gICAgZGVzY3JpYmUgXCJ0aGUgXyByZWdpc3RlclwiLCAtPlxuICAgICAgZGVzY3JpYmUgXCJyZWFkaW5nXCIsIC0+XG4gICAgICAgIGl0IFwiaXMgYWx3YXlzIHRoZSBlbXB0eSBzdHJpbmdcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgcmVnaXN0ZXI6ICdfJzogdGV4dDogJydcblxuICAgICAgZGVzY3JpYmUgXCJ3cml0aW5nXCIsIC0+XG4gICAgICAgIGl0IFwidGhyb3dzIGF3YXkgYW55dGhpbmcgd3JpdHRlbiB0byBpdFwiLCAtPlxuICAgICAgICAgIHNldCByZWdpc3RlcjogICAgJ18nOiB0ZXh0OiAnbmV3IGNvbnRlbnQnXG4gICAgICAgICAgZW5zdXJlIHJlZ2lzdGVyOiAnXyc6IHRleHQ6ICcnXG5cbiAgICBkZXNjcmliZSBcInRoZSAlIHJlZ2lzdGVyXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNweU9uKGVkaXRvciwgJ2dldFVSSScpLmFuZFJldHVybiAnL1VzZXJzL2F0b20va25vd25fdmFsdWUudHh0J1xuXG4gICAgICBkZXNjcmliZSBcInJlYWRpbmdcIiwgLT5cbiAgICAgICAgaXQgXCJyZXR1cm5zIHRoZSBmaWxlbmFtZSBvZiB0aGUgY3VycmVudCBlZGl0b3JcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgcmVnaXN0ZXI6ICclJzogdGV4dDogJy9Vc2Vycy9hdG9tL2tub3duX3ZhbHVlLnR4dCdcblxuICAgICAgZGVzY3JpYmUgXCJ3cml0aW5nXCIsIC0+XG4gICAgICAgIGl0IFwidGhyb3dzIGF3YXkgYW55dGhpbmcgd3JpdHRlbiB0byBpdFwiLCAtPlxuICAgICAgICAgIHNldCAgICByZWdpc3RlcjogJyUnOiB0ZXh0OiAnbmV3IGNvbnRlbnQnXG4gICAgICAgICAgZW5zdXJlIHJlZ2lzdGVyOiAnJSc6IHRleHQ6ICcvVXNlcnMvYXRvbS9rbm93bl92YWx1ZS50eHQnXG5cbiAgICBkZXNjcmliZSBcInRoZSBjdHJsLXIgY29tbWFuZCBpbiBpbnNlcnQgbW9kZVwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXQgcmVnaXN0ZXI6ICdcIic6IHRleHQ6ICczNDUnXG4gICAgICAgIHNldCByZWdpc3RlcjogJ2EnOiB0ZXh0OiAnYWJjJ1xuICAgICAgICBzZXQgcmVnaXN0ZXI6ICcqJzogdGV4dDogJ2FiYydcbiAgICAgICAgYXRvbS5jbGlwYm9hcmQud3JpdGUgXCJjbGlwXCJcbiAgICAgICAgc2V0IHRleHQ6IFwiMDEyXFxuXCIsIGN1cnNvcjogWzAsIDJdXG4gICAgICAgIGVuc3VyZSAnaScsIG1vZGU6ICdpbnNlcnQnXG5cbiAgICAgIGRlc2NyaWJlIFwidXNlQ2xpcGJvYXJkQXNEZWZhdWx0UmVnaXN0ZXIgPSB0cnVlXCIsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBzZXR0aW5ncy5zZXQgJ3VzZUNsaXBib2FyZEFzRGVmYXVsdFJlZ2lzdGVyJywgdHJ1ZVxuICAgICAgICAgIHNldCByZWdpc3RlcjogJ1wiJzogdGV4dDogJzM0NSdcbiAgICAgICAgICBhdG9tLmNsaXBib2FyZC53cml0ZSBcImNsaXBcIlxuXG4gICAgICAgIGl0IFwiaW5zZXJ0cyBjb250ZW50cyBmcm9tIGNsaXBib2FyZCB3aXRoIFxcXCJcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgWydjdHJsLXInLCBpbnB1dDogJ1wiJ10sIHRleHQ6ICcwMWNsaXAyXFxuJ1xuXG4gICAgICBkZXNjcmliZSBcInVzZUNsaXBib2FyZEFzRGVmYXVsdFJlZ2lzdGVyID0gZmFsc2VcIiwgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIHNldHRpbmdzLnNldCAndXNlQ2xpcGJvYXJkQXNEZWZhdWx0UmVnaXN0ZXInLCBmYWxzZVxuICAgICAgICAgIHNldCByZWdpc3RlcjogJ1wiJzogdGV4dDogJzM0NSdcbiAgICAgICAgICBhdG9tLmNsaXBib2FyZC53cml0ZSBcImNsaXBcIlxuXG4gICAgICAgIGl0IFwiaW5zZXJ0cyBjb250ZW50cyBmcm9tIFxcXCIgd2l0aCBcXFwiXCIsIC0+XG4gICAgICAgICAgZW5zdXJlIFsnY3RybC1yJywgaW5wdXQ6ICdcIiddLCB0ZXh0OiAnMDEzNDUyXFxuJ1xuXG4gICAgICBpdCBcImluc2VydHMgY29udGVudHMgb2YgdGhlICdhJyByZWdpc3RlclwiLCAtPlxuICAgICAgICBlbnN1cmUgWydjdHJsLXInLCBpbnB1dDogJ2EnXSwgdGV4dDogJzAxYWJjMlxcbidcblxuICAgICAgaXQgXCJpcyBjYW5jZWxsZWQgd2l0aCB0aGUgZXNjYXBlIGtleVwiLCAtPlxuICAgICAgICBlbnN1cmUgJ2N0cmwtciBlc2NhcGUnLFxuICAgICAgICAgIHRleHQ6ICcwMTJcXG4nXG4gICAgICAgICAgbW9kZTogJ2luc2VydCdcbiAgICAgICAgICBjdXJzb3I6IFswLCAyXVxuXG4gICAgZGVzY3JpYmUgXCJwZXIgc2VsZWN0aW9uIGNsaXBib2FyZFwiLCAtPlxuICAgICAgZW5zdXJlUGVyU2VsZWN0aW9uUmVnaXN0ZXIgPSAodGV4dHMuLi4pIC0+XG4gICAgICAgIGZvciBzZWxlY3Rpb24sIGkgaW4gZWRpdG9yLmdldFNlbGVjdGlvbnMoKVxuICAgICAgICAgIGVuc3VyZSByZWdpc3RlcjogJyonOiB7dGV4dDogdGV4dHNbaV0sIHNlbGVjdGlvbjogc2VsZWN0aW9ufVxuXG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldHRpbmdzLnNldCAndXNlQ2xpcGJvYXJkQXNEZWZhdWx0UmVnaXN0ZXInLCB0cnVlXG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgMDEyOlxuICAgICAgICAgICAgYWJjOlxuICAgICAgICAgICAgZGVmOlxcblxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgY3Vyc29yOiBbWzAsIDFdLCBbMSwgMV0sIFsyLCAxXV1cblxuICAgICAgZGVzY3JpYmUgXCJvbiBzZWxlY3Rpb24gZGVzdHJveWVcIiwgLT5cbiAgICAgICAgaXQgXCJyZW1vdmUgY29ycmVzcG9uZGluZyBzdWJzY3JpcHRpbiBhbmQgY2xpcGJvYXJkIGVudHJ5XCIsIC0+XG4gICAgICAgICAge2NsaXBib2FyZEJ5U2VsZWN0aW9uLCBzdWJzY3JpcHRpb25CeVNlbGVjdGlvbn0gPSB2aW1TdGF0ZS5yZWdpc3RlclxuICAgICAgICAgIGV4cGVjdChjbGlwYm9hcmRCeVNlbGVjdGlvbi5zaXplKS50b0JlKDApXG4gICAgICAgICAgZXhwZWN0KHN1YnNjcmlwdGlvbkJ5U2VsZWN0aW9uLnNpemUpLnRvQmUoMClcblxuICAgICAgICAgIGtleXN0cm9rZSBcInkgaSB3XCJcbiAgICAgICAgICBlbnN1cmVQZXJTZWxlY3Rpb25SZWdpc3RlcignMDEyJywgJ2FiYycsICdkZWYnKVxuXG4gICAgICAgICAgZXhwZWN0KGNsaXBib2FyZEJ5U2VsZWN0aW9uLnNpemUpLnRvQmUoMylcbiAgICAgICAgICBleHBlY3Qoc3Vic2NyaXB0aW9uQnlTZWxlY3Rpb24uc2l6ZSkudG9CZSgzKVxuICAgICAgICAgIHNlbGVjdGlvbi5kZXN0cm95KCkgZm9yIHNlbGVjdGlvbiBpbiBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpXG4gICAgICAgICAgZXhwZWN0KGNsaXBib2FyZEJ5U2VsZWN0aW9uLnNpemUpLnRvQmUoMClcbiAgICAgICAgICBleHBlY3Qoc3Vic2NyaXB0aW9uQnlTZWxlY3Rpb24uc2l6ZSkudG9CZSgwKVxuXG4gICAgICBkZXNjcmliZSBcIllhbmtcIiwgLT5cbiAgICAgICAgaXQgXCJzYXZlIHRleHQgdG8gcGVyIHNlbGVjdGlvbiByZWdpc3RlclwiLCAtPlxuICAgICAgICAgIGtleXN0cm9rZSBcInkgaSB3XCJcbiAgICAgICAgICBlbnN1cmVQZXJTZWxlY3Rpb25SZWdpc3RlcignMDEyJywgJ2FiYycsICdkZWYnKVxuXG4gICAgICBkZXNjcmliZSBcIkRlbGV0ZSBmYW1pbHlcIiwgLT5cbiAgICAgICAgaXQgXCJkXCIsIC0+XG4gICAgICAgICAgZW5zdXJlIFwiZCBpIHdcIiwgdGV4dDogXCI6XFxuOlxcbjpcXG5cIlxuICAgICAgICAgIGVuc3VyZVBlclNlbGVjdGlvblJlZ2lzdGVyKCcwMTInLCAnYWJjJywgJ2RlZicpXG4gICAgICAgIGl0IFwieFwiLCAtPlxuICAgICAgICAgIGVuc3VyZSBcInhcIiwgdGV4dDogXCIwMjpcXG5hYzpcXG5kZjpcXG5cIlxuICAgICAgICAgIGVuc3VyZVBlclNlbGVjdGlvblJlZ2lzdGVyKCcxJywgJ2InLCAnZScpXG4gICAgICAgIGl0IFwiWFwiLCAtPlxuICAgICAgICAgIGVuc3VyZSBcIlhcIiwgdGV4dDogXCIxMjpcXG5iYzpcXG5lZjpcXG5cIlxuICAgICAgICAgIGVuc3VyZVBlclNlbGVjdGlvblJlZ2lzdGVyKCcwJywgJ2EnLCAnZCcpXG4gICAgICAgIGl0IFwiRFwiLCAtPlxuICAgICAgICAgIGVuc3VyZSBcIkRcIiwgdGV4dDogXCIwXFxuYVxcbmRcXG5cIlxuICAgICAgICAgIGVuc3VyZVBlclNlbGVjdGlvblJlZ2lzdGVyKCcxMjonLCAnYmM6JywgJ2VmOicpXG5cbiAgICAgIGRlc2NyaWJlIFwiUHV0IGZhbWlseVwiLCAtPlxuICAgICAgICBpdCBcInAgcGFzdGUgdGV4dCBmcm9tIHBlciBzZWxlY3Rpb24gcmVnaXN0ZXJcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgXCJ5IGkgdyAkIHBcIixcbiAgICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgICAwMTI6MDEyXG4gICAgICAgICAgICAgIGFiYzphYmNcbiAgICAgICAgICAgICAgZGVmOmRlZlxcblxuICAgICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgaXQgXCJQIHBhc3RlIHRleHQgZnJvbSBwZXIgc2VsZWN0aW9uIHJlZ2lzdGVyXCIsIC0+XG4gICAgICAgICAgZW5zdXJlIFwieSBpIHcgJCBQXCIsXG4gICAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgICAgMDEyMDEyOlxuICAgICAgICAgICAgICBhYmNhYmM6XG4gICAgICAgICAgICAgIGRlZmRlZjpcXG5cbiAgICAgICAgICAgICAgXCJcIlwiXG4gICAgICBkZXNjcmliZSBcImN0cmwtciBpbiBpbnNlcnQgbW9kZVwiLCAtPlxuICAgICAgICBpdCBcImluc2VydCBmcm9tIHBlciBzZWxlY3Rpb24gcmVnaXN0ZVwiLCAtPlxuICAgICAgICAgIGVuc3VyZSBcImQgaSB3XCIsIHRleHQ6IFwiOlxcbjpcXG46XFxuXCJcbiAgICAgICAgICBlbnN1cmUgJ2EnLCBtb2RlOiAnaW5zZXJ0J1xuICAgICAgICAgIGVuc3VyZSBbJ2N0cmwtcicsIGlucHV0OiAnXCInXSxcbiAgICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgICA6MDEyXG4gICAgICAgICAgICAgIDphYmNcbiAgICAgICAgICAgICAgOmRlZlxcblxuICAgICAgICAgICAgICBcIlwiXCJcblxuICBkZXNjcmliZSBcIkNvdW50IG1vZGlmaWVyXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2V0XG4gICAgICAgIHRleHQ6IFwiMDAwIDExMSAyMjIgMzMzIDQ0NCA1NTUgNjY2IDc3NyA4ODggOTk5XCJcbiAgICAgICAgY3Vyc29yOiBbMCwgMF1cblxuICAgIGl0IFwicmVwZWF0IG9wZXJhdG9yXCIsIC0+XG4gICAgICBlbnN1cmUgJzMgZCB3JywgdGV4dDogXCIzMzMgNDQ0IDU1NSA2NjYgNzc3IDg4OCA5OTlcIlxuICAgIGl0IFwicmVwZWF0IG1vdGlvblwiLCAtPlxuICAgICAgZW5zdXJlICdkIDIgdycsIHRleHQ6IFwiMjIyIDMzMyA0NDQgNTU1IDY2NiA3NzcgODg4IDk5OVwiXG4gICAgaXQgXCJyZXBlYXQgb3BlcmF0b3IgYW5kIG1vdGlvbiByZXNwZWN0aXZlbHlcIiwgLT5cbiAgICAgIGVuc3VyZSAnMyBkIDIgdycsIHRleHQ6IFwiNjY2IDc3NyA4ODggOTk5XCJcbiJdfQ==
