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
          return ensure('" a y t c', {
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
            return ensure('" a p', {
              textC: "anew conten|tbc\ndef"
            });
          });
          return it("but do nothing for z register", function() {
            return ensure('" z p', {
              textC: "|abc\ndef"
            });
          });
        });
        return describe("blockwise-mode paste just use register have no text", function() {
          return it("paste from a register to each selction", function() {
            return ensure('ctrl-v j " a p', {
              textC: "|new contentbc\nnew contentef"
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
      describe("the numbered 0-9 register", function() {
        describe("0", function() {
          return it("keep most recent yank-ed text", function() {
            ensure({
              register: {
                '"': {
                  text: 'initial clipboard content'
                },
                '0': {
                  text: void 0
                }
              }
            });
            set({
              textC: "|000"
            });
            ensure("y w", {
              register: {
                '"': {
                  text: "000"
                },
                '0': {
                  text: "000"
                }
              }
            });
            return ensure("y l", {
              register: {
                '"': {
                  text: "0"
                },
                '0': {
                  text: "0"
                }
              }
            });
          });
        });
        return describe("1-9 and small-delete(-) register", function() {
          beforeEach(function() {
            return set({
              textC: "|0\n1\n2\n3\n4\n5\n6\n7\n8\n9\n10\n"
            });
          });
          it("keep deleted text", function() {
            ensure("d d", {
              textC: "|1\n2\n3\n4\n5\n6\n7\n8\n9\n10\n",
              register: {
                '"': {
                  text: '0\n'
                },
                '-': {
                  text: void 0
                },
                '1': {
                  text: '0\n'
                },
                '2': {
                  text: void 0
                },
                '3': {
                  text: void 0
                },
                '4': {
                  text: void 0
                },
                '5': {
                  text: void 0
                },
                '6': {
                  text: void 0
                },
                '7': {
                  text: void 0
                },
                '8': {
                  text: void 0
                },
                '9': {
                  text: void 0
                }
              }
            });
            ensure(".", {
              textC: "|2\n3\n4\n5\n6\n7\n8\n9\n10\n",
              register: {
                '"': {
                  text: '1\n'
                },
                '-': {
                  text: void 0
                },
                '1': {
                  text: '1\n'
                },
                '2': {
                  text: '0\n'
                },
                '3': {
                  text: void 0
                },
                '4': {
                  text: void 0
                },
                '5': {
                  text: void 0
                },
                '6': {
                  text: void 0
                },
                '7': {
                  text: void 0
                },
                '8': {
                  text: void 0
                },
                '9': {
                  text: void 0
                }
              }
            });
            ensure(".", {
              textC: "|3\n4\n5\n6\n7\n8\n9\n10\n",
              register: {
                '"': {
                  text: '2\n'
                },
                '-': {
                  text: void 0
                },
                '1': {
                  text: '2\n'
                },
                '2': {
                  text: '1\n'
                },
                '3': {
                  text: '0\n'
                },
                '4': {
                  text: void 0
                },
                '5': {
                  text: void 0
                },
                '6': {
                  text: void 0
                },
                '7': {
                  text: void 0
                },
                '8': {
                  text: void 0
                },
                '9': {
                  text: void 0
                }
              }
            });
            ensure(".", {
              textC: "|4\n5\n6\n7\n8\n9\n10\n",
              register: {
                '"': {
                  text: '3\n'
                },
                '-': {
                  text: void 0
                },
                '1': {
                  text: '3\n'
                },
                '2': {
                  text: '2\n'
                },
                '3': {
                  text: '1\n'
                },
                '4': {
                  text: '0\n'
                },
                '5': {
                  text: void 0
                },
                '6': {
                  text: void 0
                },
                '7': {
                  text: void 0
                },
                '8': {
                  text: void 0
                },
                '9': {
                  text: void 0
                }
              }
            });
            ensure(".", {
              textC: "|5\n6\n7\n8\n9\n10\n",
              register: {
                '"': {
                  text: '4\n'
                },
                '-': {
                  text: void 0
                },
                '1': {
                  text: '4\n'
                },
                '2': {
                  text: '3\n'
                },
                '3': {
                  text: '2\n'
                },
                '4': {
                  text: '1\n'
                },
                '5': {
                  text: '0\n'
                },
                '6': {
                  text: void 0
                },
                '7': {
                  text: void 0
                },
                '8': {
                  text: void 0
                },
                '9': {
                  text: void 0
                }
              }
            });
            ensure(".", {
              textC: "|6\n7\n8\n9\n10\n",
              register: {
                '"': {
                  text: '5\n'
                },
                '-': {
                  text: void 0
                },
                '1': {
                  text: '5\n'
                },
                '2': {
                  text: '4\n'
                },
                '3': {
                  text: '3\n'
                },
                '4': {
                  text: '2\n'
                },
                '5': {
                  text: '1\n'
                },
                '6': {
                  text: '0\n'
                },
                '7': {
                  text: void 0
                },
                '8': {
                  text: void 0
                },
                '9': {
                  text: void 0
                }
              }
            });
            ensure(".", {
              textC: "|7\n8\n9\n10\n",
              register: {
                '"': {
                  text: '6\n'
                },
                '-': {
                  text: void 0
                },
                '1': {
                  text: '6\n'
                },
                '2': {
                  text: '5\n'
                },
                '3': {
                  text: '4\n'
                },
                '4': {
                  text: '3\n'
                },
                '5': {
                  text: '2\n'
                },
                '6': {
                  text: '1\n'
                },
                '7': {
                  text: '0\n'
                },
                '8': {
                  text: void 0
                },
                '9': {
                  text: void 0
                }
              }
            });
            ensure(".", {
              textC: "|8\n9\n10\n",
              register: {
                '"': {
                  text: '7\n'
                },
                '-': {
                  text: void 0
                },
                '1': {
                  text: '7\n'
                },
                '2': {
                  text: '6\n'
                },
                '3': {
                  text: '5\n'
                },
                '4': {
                  text: '4\n'
                },
                '5': {
                  text: '3\n'
                },
                '6': {
                  text: '2\n'
                },
                '7': {
                  text: '1\n'
                },
                '8': {
                  text: '0\n'
                },
                '9': {
                  text: void 0
                }
              }
            });
            ensure(".", {
              textC: "|9\n10\n",
              register: {
                '"': {
                  text: '8\n'
                },
                '-': {
                  text: void 0
                },
                '1': {
                  text: '8\n'
                },
                '2': {
                  text: '7\n'
                },
                '3': {
                  text: '6\n'
                },
                '4': {
                  text: '5\n'
                },
                '5': {
                  text: '4\n'
                },
                '6': {
                  text: '3\n'
                },
                '7': {
                  text: '2\n'
                },
                '8': {
                  text: '1\n'
                },
                '9': {
                  text: '0\n'
                }
              }
            });
            return ensure(".", {
              textC: "|10\n",
              register: {
                '"': {
                  text: '9\n'
                },
                '-': {
                  text: void 0
                },
                '1': {
                  text: '9\n'
                },
                '2': {
                  text: '8\n'
                },
                '3': {
                  text: '7\n'
                },
                '4': {
                  text: '6\n'
                },
                '5': {
                  text: '5\n'
                },
                '6': {
                  text: '4\n'
                },
                '7': {
                  text: '3\n'
                },
                '8': {
                  text: '2\n'
                },
                '9': {
                  text: '1\n'
                }
              }
            });
          });
          it("also keeps changed text", function() {
            return ensure("c j", {
              textC: "|\n2\n3\n4\n5\n6\n7\n8\n9\n10\n",
              register: {
                '"': {
                  text: '0\n1\n'
                },
                '-': {
                  text: void 0
                },
                '1': {
                  text: '0\n1\n'
                },
                '2': {
                  text: void 0
                },
                '3': {
                  text: void 0
                },
                '4': {
                  text: void 0
                },
                '5': {
                  text: void 0
                },
                '6': {
                  text: void 0
                },
                '7': {
                  text: void 0
                },
                '8': {
                  text: void 0
                },
                '9': {
                  text: void 0
                }
              }
            });
          });
          return describe("which goes to numbered and which goes to small-delete register", function() {
            beforeEach(function() {
              return set({
                textC: "|{abc}\n"
              });
            });
            it("small-change goes to - register", function() {
              return ensure("c $", {
                textC: "|\n",
                register: {
                  '"': {
                    text: '{abc}'
                  },
                  '-': {
                    text: '{abc}'
                  },
                  '1': {
                    text: void 0
                  },
                  '2': {
                    text: void 0
                  },
                  '3': {
                    text: void 0
                  },
                  '4': {
                    text: void 0
                  },
                  '5': {
                    text: void 0
                  },
                  '6': {
                    text: void 0
                  },
                  '7': {
                    text: void 0
                  },
                  '8': {
                    text: void 0
                  },
                  '9': {
                    text: void 0
                  }
                }
              });
            });
            it("small-delete goes to - register", function() {
              return ensure("d $", {
                textC: "|\n",
                register: {
                  '"': {
                    text: '{abc}'
                  },
                  '-': {
                    text: '{abc}'
                  },
                  '1': {
                    text: void 0
                  },
                  '2': {
                    text: void 0
                  },
                  '3': {
                    text: void 0
                  },
                  '4': {
                    text: void 0
                  },
                  '5': {
                    text: void 0
                  },
                  '6': {
                    text: void 0
                  },
                  '7': {
                    text: void 0
                  },
                  '8': {
                    text: void 0
                  },
                  '9': {
                    text: void 0
                  }
                }
              });
            });
            it("[exception] % motion always save to numbered", function() {
              set({
                textC: "|{abc}\n"
              });
              return ensure("d %", {
                textC: "|\n",
                register: {
                  '"': {
                    text: '{abc}'
                  },
                  '-': {
                    text: void 0
                  },
                  '1': {
                    text: '{abc}'
                  },
                  '2': {
                    text: void 0
                  }
                }
              });
            });
            it("[exception] / motion always save to numbered", function() {
              jasmine.attachToDOM(atom.workspace.getElement());
              set({
                textC: "|{abc}\n"
              });
              return ensure("d / } enter", {
                textC: "|}\n",
                register: {
                  '"': {
                    text: '{abc'
                  },
                  '-': {
                    text: void 0
                  },
                  '1': {
                    text: '{abc'
                  },
                  '2': {
                    text: void 0
                  }
                }
              });
            });
            it("/, n motion always save to numbered", function() {
              jasmine.attachToDOM(atom.workspace.getElement());
              set({
                textC: "|abc axx abc\n"
              });
              ensure("d / a enter", {
                textC: "|axx abc\n",
                register: {
                  '"': {
                    text: 'abc '
                  },
                  '-': {
                    text: void 0
                  },
                  '1': {
                    text: 'abc '
                  },
                  '2': {
                    text: void 0
                  }
                }
              });
              return ensure("d n", {
                textC: "|abc\n",
                register: {
                  '"': {
                    text: 'axx '
                  },
                  '-': {
                    text: void 0
                  },
                  '1': {
                    text: 'axx '
                  },
                  '2': {
                    text: 'abc '
                  }
                }
              });
            });
            return it("?, N motion always save to numbered", function() {
              jasmine.attachToDOM(atom.workspace.getElement());
              set({
                textC: "abc axx |abc\n"
              });
              ensure("d ? a enter", {
                textC: "abc |abc\n",
                register: {
                  '"': {
                    text: 'axx '
                  },
                  '-': {
                    text: void 0
                  },
                  '1': {
                    text: 'axx '
                  },
                  '2': {
                    text: void 0
                  }
                }
              });
              ensure("0", {
                textC: "|abc abc\n"
              });
              return ensure("c N", {
                textC: "|abc\n",
                register: {
                  '"': {
                    text: 'abc '
                  },
                  '-': {
                    text: void 0
                  },
                  '1': {
                    text: 'abc '
                  },
                  '2': {
                    text: "axx "
                  }
                }
              });
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
            return ensure('ctrl-r "', {
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
            return ensure('ctrl-r "', {
              text: '013452\n'
            });
          });
        });
        it("inserts contents of the 'a' register", function() {
          return ensure('ctrl-r a', {
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
            return ensure('ctrl-r "', {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9zcGVjL3ByZWZpeC1zcGVjLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEscUJBQUE7SUFBQTs7RUFBQyxjQUFlLE9BQUEsQ0FBUSxlQUFSOztFQUNoQixRQUFBLEdBQVcsT0FBQSxDQUFRLGlCQUFSOztFQUVYLFFBQUEsQ0FBUyxVQUFULEVBQXFCLFNBQUE7QUFDbkIsUUFBQTtJQUFBLE1BQTRELEVBQTVELEVBQUMsWUFBRCxFQUFNLGVBQU4sRUFBYyxrQkFBZCxFQUF5QixlQUF6QixFQUFpQyxzQkFBakMsRUFBZ0Q7SUFFaEQsVUFBQSxDQUFXLFNBQUE7YUFDVCxXQUFBLENBQVksU0FBQyxLQUFELEVBQVEsR0FBUjtRQUNWLFFBQUEsR0FBVztRQUNWLHdCQUFELEVBQVM7ZUFDUixhQUFELEVBQU0sbUJBQU4sRUFBYyx5QkFBZCxFQUEyQjtNQUhqQixDQUFaO0lBRFMsQ0FBWDtJQU1BLFFBQUEsQ0FBUyxRQUFULEVBQW1CLFNBQUE7TUFDakIsUUFBQSxDQUFTLGlCQUFULEVBQTRCLFNBQUE7UUFDMUIsVUFBQSxDQUFXLFNBQUE7aUJBQ1QsR0FBQSxDQUFJO1lBQUEsSUFBQSxFQUFNLGNBQU47WUFBc0IsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBOUI7V0FBSjtRQURTLENBQVg7UUFHQSxFQUFBLENBQUcsaUJBQUgsRUFBc0IsU0FBQTtpQkFDcEIsTUFBQSxDQUFPLEtBQVAsRUFBYztZQUFBLElBQUEsRUFBTSxXQUFOO1dBQWQ7UUFEb0IsQ0FBdEI7ZUFHQSxFQUFBLENBQUcsa0JBQUgsRUFBdUIsU0FBQTtpQkFDckIsTUFBQSxDQUFPLE9BQVAsRUFBZ0I7WUFBQSxJQUFBLEVBQU0sSUFBTjtXQUFoQjtRQURxQixDQUF2QjtNQVAwQixDQUE1QjtNQVVBLFFBQUEsQ0FBUyxjQUFU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U0FBQTtZQUN0QyxNQUFBLENBQU8sT0FBUCxFQUFnQjtjQUFBLElBQUEsRUFBTSxXQUFOO2FBQWhCO1lBQ0EsTUFBQSxDQUFPLEdBQVAsRUFBWTtjQUFBLElBQUEsRUFBTSxRQUFOO2FBQVo7bUJBQ0EsTUFBQSxDQUFPLFVBQVAsRUFDRTtjQUFBLElBQUEsRUFBTSxvQkFBTjthQURGO1VBSHNDLENBQXhDO1FBRGdDLENBQWxDO01BaEVrQyxDQUFwQztJQTVUbUIsQ0FBckI7V0F1WUEsUUFBQSxDQUFTLGdCQUFULEVBQTJCLFNBQUE7TUFDekIsVUFBQSxDQUFXLFNBQUE7ZUFDVCxHQUFBLENBQ0U7VUFBQSxJQUFBLEVBQU0seUNBQU47VUFDQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQURSO1NBREY7TUFEUyxDQUFYO01BS0EsRUFBQSxDQUFHLGlCQUFILEVBQXNCLFNBQUE7ZUFDcEIsTUFBQSxDQUFPLE9BQVAsRUFBZ0I7VUFBQSxJQUFBLEVBQU0sNkJBQU47U0FBaEI7TUFEb0IsQ0FBdEI7TUFFQSxFQUFBLENBQUcsZUFBSCxFQUFvQixTQUFBO2VBQ2xCLE1BQUEsQ0FBTyxPQUFQLEVBQWdCO1VBQUEsSUFBQSxFQUFNLGlDQUFOO1NBQWhCO01BRGtCLENBQXBCO2FBRUEsRUFBQSxDQUFHLHlDQUFILEVBQThDLFNBQUE7ZUFDNUMsTUFBQSxDQUFPLFNBQVAsRUFBa0I7VUFBQSxJQUFBLEVBQU0saUJBQU47U0FBbEI7TUFENEMsQ0FBOUM7SUFWeUIsQ0FBM0I7RUF6YW1CLENBQXJCO0FBSEEiLCJzb3VyY2VzQ29udGVudCI6WyJ7Z2V0VmltU3RhdGV9ID0gcmVxdWlyZSAnLi9zcGVjLWhlbHBlcidcbnNldHRpbmdzID0gcmVxdWlyZSAnLi4vbGliL3NldHRpbmdzJ1xuXG5kZXNjcmliZSBcIlByZWZpeGVzXCIsIC0+XG4gIFtzZXQsIGVuc3VyZSwga2V5c3Ryb2tlLCBlZGl0b3IsIGVkaXRvckVsZW1lbnQsIHZpbVN0YXRlXSA9IFtdXG5cbiAgYmVmb3JlRWFjaCAtPlxuICAgIGdldFZpbVN0YXRlIChzdGF0ZSwgdmltKSAtPlxuICAgICAgdmltU3RhdGUgPSBzdGF0ZVxuICAgICAge2VkaXRvciwgZWRpdG9yRWxlbWVudH0gPSB2aW1TdGF0ZVxuICAgICAge3NldCwgZW5zdXJlLCBrZXlzdHJva2V9ID0gdmltXG5cbiAgZGVzY3JpYmUgXCJSZXBlYXRcIiwgLT5cbiAgICBkZXNjcmliZSBcIndpdGggb3BlcmF0aW9uc1wiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXQgdGV4dDogXCIxMjM0NTY3ODlhYmNcIiwgY3Vyc29yOiBbMCwgMF1cblxuICAgICAgaXQgXCJyZXBlYXRzIE4gdGltZXNcIiwgLT5cbiAgICAgICAgZW5zdXJlICczIHgnLCB0ZXh0OiAnNDU2Nzg5YWJjJ1xuXG4gICAgICBpdCBcInJlcGVhdHMgTk4gdGltZXNcIiwgLT5cbiAgICAgICAgZW5zdXJlICcxIDAgeCcsIHRleHQ6ICdiYydcblxuICAgIGRlc2NyaWJlIFwid2l0aCBtb3Rpb25zXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldCB0ZXh0OiAnb25lIHR3byB0aHJlZScsIGN1cnNvcjogWzAsIDBdXG5cbiAgICAgIGl0IFwicmVwZWF0cyBOIHRpbWVzXCIsIC0+XG4gICAgICAgIGVuc3VyZSAnZCAyIHcnLCB0ZXh0OiAndGhyZWUnXG5cbiAgICBkZXNjcmliZSBcImluIHZpc3VhbCBtb2RlXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldCB0ZXh0OiAnb25lIHR3byB0aHJlZScsIGN1cnNvcjogWzAsIDBdXG5cbiAgICAgIGl0IFwicmVwZWF0cyBtb3ZlbWVudHMgaW4gdmlzdWFsIG1vZGVcIiwgLT5cbiAgICAgICAgZW5zdXJlICd2IDIgdycsIGN1cnNvcjogWzAsIDldXG5cbiAgZGVzY3JpYmUgXCJSZWdpc3RlclwiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHZpbVN0YXRlLmdsb2JhbFN0YXRlLnJlc2V0KCdyZWdpc3RlcicpXG5cbiAgICBkZXNjcmliZSBcInRoZSBhIHJlZ2lzdGVyXCIsIC0+XG4gICAgICBpdCBcInNhdmVzIGEgdmFsdWUgZm9yIGZ1dHVyZSByZWFkaW5nXCIsIC0+XG4gICAgICAgIHNldCAgICByZWdpc3RlcjogYTogdGV4dDogJ25ldyBjb250ZW50J1xuICAgICAgICBlbnN1cmUgcmVnaXN0ZXI6IGE6IHRleHQ6ICduZXcgY29udGVudCdcblxuICAgICAgaXQgXCJvdmVyd3JpdGVzIGEgdmFsdWUgcHJldmlvdXNseSBpbiB0aGUgcmVnaXN0ZXJcIiwgLT5cbiAgICAgICAgc2V0ICAgIHJlZ2lzdGVyOiBhOiB0ZXh0OiAnY29udGVudCdcbiAgICAgICAgc2V0ICAgIHJlZ2lzdGVyOiBhOiB0ZXh0OiAnbmV3IGNvbnRlbnQnXG4gICAgICAgIGVuc3VyZSByZWdpc3RlcjogYTogdGV4dDogJ25ldyBjb250ZW50J1xuXG4gICAgZGVzY3JpYmUgXCJ3aXRoIHlhbmsgY29tbWFuZFwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICBjdXJzb3I6IFswLCAwXVxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgIGFhYSBiYmIgY2NjXG4gICAgICAgICAgXCJcIlwiXG4gICAgICBpdCBcInNhdmUgdG8gcHJlIHNwZWNpZmllZCByZWdpc3RlclwiLCAtPlxuICAgICAgICBlbnN1cmUgJ1wiIGEgeSBpIHcnLCByZWdpc3RlcjogYTogdGV4dDogJ2FhYSdcbiAgICAgICAgZW5zdXJlICd3IFwiIGIgeSBpIHcnLCByZWdpc3RlcjogYjogdGV4dDogJ2JiYidcbiAgICAgICAgZW5zdXJlICd3IFwiIGMgeSBpIHcnLCByZWdpc3RlcjogYzogdGV4dDogJ2NjYydcblxuICAgICAgaXQgXCJ3b3JrIHdpdGggbW90aW9uIHdoaWNoIGFsc28gcmVxdWlyZSBpbnB1dCBzdWNoIGFzICd0J1wiLCAtPlxuICAgICAgICBlbnN1cmUgJ1wiIGEgeSB0IGMnLCByZWdpc3RlcjogYTogdGV4dDogJ2FhYSBiYmIgJ1xuXG4gICAgZGVzY3JpYmUgXCJXaXRoIHAgY29tbWFuZFwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICB2aW1TdGF0ZS5nbG9iYWxTdGF0ZS5yZXNldCgncmVnaXN0ZXInKVxuICAgICAgICBzZXQgcmVnaXN0ZXI6IGE6IHRleHQ6ICduZXcgY29udGVudCdcbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgYWJjXG4gICAgICAgICAgZGVmXG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgY3Vyc29yOiBbMCwgMF1cblxuICAgICAgZGVzY3JpYmUgXCJ3aGVuIHNwZWNpZmllZCByZWdpc3RlciBoYXZlIG5vIHRleHRcIiwgLT5cbiAgICAgICAgaXQgXCJjYW4gcGFzdGUgZnJvbSBhIHJlZ2lzdGVyXCIsIC0+XG4gICAgICAgICAgZW5zdXJlIG1vZGU6IFwibm9ybWFsXCJcbiAgICAgICAgICBlbnN1cmUgJ1wiIGEgcCcsXG4gICAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICBhbmV3IGNvbnRlbnx0YmNcbiAgICAgICAgICAgIGRlZlxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgaXQgXCJidXQgZG8gbm90aGluZyBmb3IgeiByZWdpc3RlclwiLCAtPlxuICAgICAgICAgIGVuc3VyZSAnXCIgeiBwJyxcbiAgICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAgIHxhYmNcbiAgICAgICAgICAgIGRlZlxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgIGRlc2NyaWJlIFwiYmxvY2t3aXNlLW1vZGUgcGFzdGUganVzdCB1c2UgcmVnaXN0ZXIgaGF2ZSBubyB0ZXh0XCIsIC0+XG4gICAgICAgIGl0IFwicGFzdGUgZnJvbSBhIHJlZ2lzdGVyIHRvIGVhY2ggc2VsY3Rpb25cIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJ2N0cmwtdiBqIFwiIGEgcCcsXG4gICAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICB8bmV3IGNvbnRlbnRiY1xuICAgICAgICAgICAgbmV3IGNvbnRlbnRlZlxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICBkZXNjcmliZSBcInRoZSBCIHJlZ2lzdGVyXCIsIC0+XG4gICAgICBpdCBcInNhdmVzIGEgdmFsdWUgZm9yIGZ1dHVyZSByZWFkaW5nXCIsIC0+XG4gICAgICAgIHNldCAgICByZWdpc3RlcjogQjogdGV4dDogJ25ldyBjb250ZW50J1xuICAgICAgICBlbnN1cmUgcmVnaXN0ZXI6IGI6IHRleHQ6ICduZXcgY29udGVudCdcbiAgICAgICAgZW5zdXJlIHJlZ2lzdGVyOiBCOiB0ZXh0OiAnbmV3IGNvbnRlbnQnXG5cbiAgICAgIGl0IFwiYXBwZW5kcyB0byBhIHZhbHVlIHByZXZpb3VzbHkgaW4gdGhlIHJlZ2lzdGVyXCIsIC0+XG4gICAgICAgIHNldCAgICByZWdpc3RlcjogYjogdGV4dDogJ2NvbnRlbnQnXG4gICAgICAgIHNldCAgICByZWdpc3RlcjogQjogdGV4dDogJ25ldyBjb250ZW50J1xuICAgICAgICBlbnN1cmUgcmVnaXN0ZXI6IGI6IHRleHQ6ICdjb250ZW50bmV3IGNvbnRlbnQnXG5cbiAgICAgIGl0IFwiYXBwZW5kcyBsaW5ld2lzZSB0byBhIGxpbmV3aXNlIHZhbHVlIHByZXZpb3VzbHkgaW4gdGhlIHJlZ2lzdGVyXCIsIC0+XG4gICAgICAgIHNldCAgICByZWdpc3RlcjogYjogdGV4dDogJ2NvbnRlbnRcXG4nLCB0eXBlOiAnbGluZXdpc2UnXG4gICAgICAgIHNldCAgICByZWdpc3RlcjogQjogdGV4dDogJ25ldyBjb250ZW50J1xuICAgICAgICBlbnN1cmUgcmVnaXN0ZXI6IGI6IHRleHQ6ICdjb250ZW50XFxubmV3IGNvbnRlbnRcXG4nXG5cbiAgICAgIGl0IFwiYXBwZW5kcyBsaW5ld2lzZSB0byBhIGNoYXJhY3RlciB2YWx1ZSBwcmV2aW91c2x5IGluIHRoZSByZWdpc3RlclwiLCAtPlxuICAgICAgICBzZXQgICAgcmVnaXN0ZXI6IGI6IHRleHQ6ICdjb250ZW50J1xuICAgICAgICBzZXQgICAgcmVnaXN0ZXI6IEI6IHRleHQ6ICduZXcgY29udGVudFxcbicsIHR5cGU6ICdsaW5ld2lzZSdcbiAgICAgICAgZW5zdXJlIHJlZ2lzdGVyOiBiOiB0ZXh0OiAnY29udGVudFxcbm5ldyBjb250ZW50XFxuJ1xuXG4gICAgZGVzY3JpYmUgXCJ0aGUgKiByZWdpc3RlclwiLCAtPlxuICAgICAgZGVzY3JpYmUgXCJyZWFkaW5nXCIsIC0+XG4gICAgICAgIGl0IFwiaXMgdGhlIHNhbWUgdGhlIHN5c3RlbSBjbGlwYm9hcmRcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgcmVnaXN0ZXI6ICcqJzogdGV4dDogJ2luaXRpYWwgY2xpcGJvYXJkIGNvbnRlbnQnLCB0eXBlOiAnY2hhcmFjdGVyd2lzZSdcblxuICAgICAgZGVzY3JpYmUgXCJ3cml0aW5nXCIsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBzZXQgcmVnaXN0ZXI6ICcqJzogdGV4dDogJ25ldyBjb250ZW50J1xuXG4gICAgICAgIGl0IFwib3ZlcndyaXRlcyB0aGUgY29udGVudHMgb2YgdGhlIHN5c3RlbSBjbGlwYm9hcmRcIiwgLT5cbiAgICAgICAgICBleHBlY3QoYXRvbS5jbGlwYm9hcmQucmVhZCgpKS50b0VxdWFsICduZXcgY29udGVudCdcblxuICAgICMgRklYTUU6IG9uY2UgbGludXggc3VwcG9ydCBjb21lcyBvdXQsIHRoaXMgbmVlZHMgdG8gcmVhZCBmcm9tXG4gICAgIyB0aGUgY29ycmVjdCBjbGlwYm9hcmQuIEZvciBub3cgaXQgYmVoYXZlcyBqdXN0IGxpa2UgdGhlICogcmVnaXN0ZXJcbiAgICAjIFNlZSA6aGVscCB4MTEtY3V0LWJ1ZmZlciBhbmQgOmhlbHAgcmVnaXN0ZXJzIGZvciBtb3JlIGRldGFpbHMgb24gaG93IHRoZXNlXG4gICAgIyByZWdpc3RlcnMgd29yayBvbiBhbiBYMTEgYmFzZWQgc3lzdGVtLlxuICAgIGRlc2NyaWJlIFwidGhlICsgcmVnaXN0ZXJcIiwgLT5cbiAgICAgIGRlc2NyaWJlIFwicmVhZGluZ1wiLCAtPlxuICAgICAgICBpdCBcImlzIHRoZSBzYW1lIHRoZSBzeXN0ZW0gY2xpcGJvYXJkXCIsIC0+XG4gICAgICAgICAgZW5zdXJlIHJlZ2lzdGVyOlxuICAgICAgICAgICAgJyonOiB0ZXh0OiAnaW5pdGlhbCBjbGlwYm9hcmQgY29udGVudCcsIHR5cGU6ICdjaGFyYWN0ZXJ3aXNlJ1xuXG4gICAgICBkZXNjcmliZSBcIndyaXRpbmdcIiwgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIHNldCByZWdpc3RlcjogJyonOiB0ZXh0OiAnbmV3IGNvbnRlbnQnXG5cbiAgICAgICAgaXQgXCJvdmVyd3JpdGVzIHRoZSBjb250ZW50cyBvZiB0aGUgc3lzdGVtIGNsaXBib2FyZFwiLCAtPlxuICAgICAgICAgIGV4cGVjdChhdG9tLmNsaXBib2FyZC5yZWFkKCkpLnRvRXF1YWwgJ25ldyBjb250ZW50J1xuXG4gICAgZGVzY3JpYmUgXCJ0aGUgXyByZWdpc3RlclwiLCAtPlxuICAgICAgZGVzY3JpYmUgXCJyZWFkaW5nXCIsIC0+XG4gICAgICAgIGl0IFwiaXMgYWx3YXlzIHRoZSBlbXB0eSBzdHJpbmdcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgcmVnaXN0ZXI6ICdfJzogdGV4dDogJydcblxuICAgICAgZGVzY3JpYmUgXCJ3cml0aW5nXCIsIC0+XG4gICAgICAgIGl0IFwidGhyb3dzIGF3YXkgYW55dGhpbmcgd3JpdHRlbiB0byBpdFwiLCAtPlxuICAgICAgICAgIHNldCByZWdpc3RlcjogICAgJ18nOiB0ZXh0OiAnbmV3IGNvbnRlbnQnXG4gICAgICAgICAgZW5zdXJlIHJlZ2lzdGVyOiAnXyc6IHRleHQ6ICcnXG5cbiAgICBkZXNjcmliZSBcInRoZSAlIHJlZ2lzdGVyXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNweU9uKGVkaXRvciwgJ2dldFVSSScpLmFuZFJldHVybiAnL1VzZXJzL2F0b20va25vd25fdmFsdWUudHh0J1xuXG4gICAgICBkZXNjcmliZSBcInJlYWRpbmdcIiwgLT5cbiAgICAgICAgaXQgXCJyZXR1cm5zIHRoZSBmaWxlbmFtZSBvZiB0aGUgY3VycmVudCBlZGl0b3JcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgcmVnaXN0ZXI6ICclJzogdGV4dDogJy9Vc2Vycy9hdG9tL2tub3duX3ZhbHVlLnR4dCdcblxuICAgICAgZGVzY3JpYmUgXCJ3cml0aW5nXCIsIC0+XG4gICAgICAgIGl0IFwidGhyb3dzIGF3YXkgYW55dGhpbmcgd3JpdHRlbiB0byBpdFwiLCAtPlxuICAgICAgICAgIHNldCAgICByZWdpc3RlcjogJyUnOiB0ZXh0OiAnbmV3IGNvbnRlbnQnXG4gICAgICAgICAgZW5zdXJlIHJlZ2lzdGVyOiAnJSc6IHRleHQ6ICcvVXNlcnMvYXRvbS9rbm93bl92YWx1ZS50eHQnXG5cbiAgICBkZXNjcmliZSBcInRoZSBudW1iZXJlZCAwLTkgcmVnaXN0ZXJcIiwgLT5cbiAgICAgIGRlc2NyaWJlIFwiMFwiLCAtPlxuICAgICAgICBpdCBcImtlZXAgbW9zdCByZWNlbnQgeWFuay1lZCB0ZXh0XCIsIC0+XG4gICAgICAgICAgZW5zdXJlIHJlZ2lzdGVyOiAnXCInOiB7dGV4dDogJ2luaXRpYWwgY2xpcGJvYXJkIGNvbnRlbnQnfSwgJzAnOiB7dGV4dDogdW5kZWZpbmVkfVxuICAgICAgICAgIHNldCB0ZXh0QzogXCJ8MDAwXCJcbiAgICAgICAgICBlbnN1cmUgXCJ5IHdcIiwgcmVnaXN0ZXI6ICdcIic6IHt0ZXh0OiBcIjAwMFwifSwgJzAnOiB7dGV4dDogXCIwMDBcIn1cbiAgICAgICAgICBlbnN1cmUgXCJ5IGxcIiwgcmVnaXN0ZXI6ICdcIic6IHt0ZXh0OiBcIjBcIn0sICcwJzoge3RleHQ6IFwiMFwifVxuXG4gICAgICBkZXNjcmliZSBcIjEtOSBhbmQgc21hbGwtZGVsZXRlKC0pIHJlZ2lzdGVyXCIsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBzZXQgdGV4dEM6IFwifDBcXG4xXFxuMlxcbjNcXG40XFxuNVxcbjZcXG43XFxuOFxcbjlcXG4xMFxcblwiXG5cbiAgICAgICAgaXQgXCJrZWVwIGRlbGV0ZWQgdGV4dFwiLCAtPlxuICAgICAgICAgIGVuc3VyZSBcImQgZFwiLFxuICAgICAgICAgICAgdGV4dEM6ICBcInwxXFxuMlxcbjNcXG40XFxuNVxcbjZcXG43XFxuOFxcbjlcXG4xMFxcblwiXG4gICAgICAgICAgICByZWdpc3RlcjpcbiAgICAgICAgICAgICAgJ1wiJzoge3RleHQ6ICcwXFxuJ30sICAgICAnLSc6IHt0ZXh0OiB1bmRlZmluZWR9LFxuICAgICAgICAgICAgICAnMSc6IHt0ZXh0OiAnMFxcbid9LCAgICAgJzInOiB7dGV4dDogdW5kZWZpbmVkfSwgJzMnOiB7dGV4dDogdW5kZWZpbmVkfSxcbiAgICAgICAgICAgICAgJzQnOiB7dGV4dDogdW5kZWZpbmVkfSwgJzUnOiB7dGV4dDogdW5kZWZpbmVkfSwgJzYnOiB7dGV4dDogdW5kZWZpbmVkfSxcbiAgICAgICAgICAgICAgJzcnOiB7dGV4dDogdW5kZWZpbmVkfSwgJzgnOiB7dGV4dDogdW5kZWZpbmVkfSwgJzknOiB7dGV4dDogdW5kZWZpbmVkfSxcbiAgICAgICAgICBlbnN1cmUgXCIuXCIsXG4gICAgICAgICAgICB0ZXh0QzogIFwifDJcXG4zXFxuNFxcbjVcXG42XFxuN1xcbjhcXG45XFxuMTBcXG5cIlxuICAgICAgICAgICAgcmVnaXN0ZXI6XG4gICAgICAgICAgICAgICdcIic6IHt0ZXh0OiAnMVxcbid9LCAgICAgJy0nOiB7dGV4dDogdW5kZWZpbmVkfSxcbiAgICAgICAgICAgICAgJzEnOiB7dGV4dDogJzFcXG4nfSwgICAgICcyJzoge3RleHQ6ICcwXFxuJ30sICczJzoge3RleHQ6IHVuZGVmaW5lZH0sXG4gICAgICAgICAgICAgICc0Jzoge3RleHQ6IHVuZGVmaW5lZH0sICc1Jzoge3RleHQ6IHVuZGVmaW5lZH0sICc2Jzoge3RleHQ6IHVuZGVmaW5lZH0sXG4gICAgICAgICAgICAgICc3Jzoge3RleHQ6IHVuZGVmaW5lZH0sICc4Jzoge3RleHQ6IHVuZGVmaW5lZH0sICc5Jzoge3RleHQ6IHVuZGVmaW5lZH0sXG4gICAgICAgICAgZW5zdXJlIFwiLlwiLFxuICAgICAgICAgICAgdGV4dEM6ICBcInwzXFxuNFxcbjVcXG42XFxuN1xcbjhcXG45XFxuMTBcXG5cIlxuICAgICAgICAgICAgcmVnaXN0ZXI6XG4gICAgICAgICAgICAgICdcIic6IHt0ZXh0OiAnMlxcbid9LCAnLSc6IHt0ZXh0OiB1bmRlZmluZWR9LFxuICAgICAgICAgICAgICAnMSc6IHt0ZXh0OiAnMlxcbid9LCAnMic6IHt0ZXh0OiAnMVxcbid9LCAnMyc6IHt0ZXh0OiAnMFxcbid9LFxuICAgICAgICAgICAgICAnNCc6IHt0ZXh0OiB1bmRlZmluZWR9LCAnNSc6IHt0ZXh0OiB1bmRlZmluZWR9LCAnNic6IHt0ZXh0OiB1bmRlZmluZWR9LFxuICAgICAgICAgICAgICAnNyc6IHt0ZXh0OiB1bmRlZmluZWR9LCAnOCc6IHt0ZXh0OiB1bmRlZmluZWR9LCAnOSc6IHt0ZXh0OiB1bmRlZmluZWR9LFxuICAgICAgICAgIGVuc3VyZSBcIi5cIixcbiAgICAgICAgICAgIHRleHRDOiAgXCJ8NFxcbjVcXG42XFxuN1xcbjhcXG45XFxuMTBcXG5cIlxuICAgICAgICAgICAgcmVnaXN0ZXI6XG4gICAgICAgICAgICAgICdcIic6IHt0ZXh0OiAnM1xcbid9LCAnLSc6IHt0ZXh0OiB1bmRlZmluZWR9LFxuICAgICAgICAgICAgICAnMSc6IHt0ZXh0OiAnM1xcbid9LCAnMic6IHt0ZXh0OiAnMlxcbid9LCAnMyc6IHt0ZXh0OiAnMVxcbid9LFxuICAgICAgICAgICAgICAnNCc6IHt0ZXh0OiAnMFxcbid9LCAnNSc6IHt0ZXh0OiB1bmRlZmluZWR9LCAnNic6IHt0ZXh0OiB1bmRlZmluZWR9LFxuICAgICAgICAgICAgICAnNyc6IHt0ZXh0OiB1bmRlZmluZWR9LCAnOCc6IHt0ZXh0OiB1bmRlZmluZWR9LCAnOSc6IHt0ZXh0OiB1bmRlZmluZWR9LFxuICAgICAgICAgIGVuc3VyZSBcIi5cIixcbiAgICAgICAgICAgIHRleHRDOiAgXCJ8NVxcbjZcXG43XFxuOFxcbjlcXG4xMFxcblwiXG4gICAgICAgICAgICByZWdpc3RlcjpcbiAgICAgICAgICAgICAgJ1wiJzoge3RleHQ6ICc0XFxuJ30sICctJzoge3RleHQ6IHVuZGVmaW5lZH0sXG4gICAgICAgICAgICAgICcxJzoge3RleHQ6ICc0XFxuJ30sICAgICAnMic6IHt0ZXh0OiAnM1xcbid9LCAgICAgJzMnOiB7dGV4dDogJzJcXG4nfSxcbiAgICAgICAgICAgICAgJzQnOiB7dGV4dDogJzFcXG4nfSwgICAgICc1Jzoge3RleHQ6ICcwXFxuJ30sICAgICAnNic6IHt0ZXh0OiB1bmRlZmluZWR9LFxuICAgICAgICAgICAgICAnNyc6IHt0ZXh0OiB1bmRlZmluZWR9LCAnOCc6IHt0ZXh0OiB1bmRlZmluZWR9LCAnOSc6IHt0ZXh0OiB1bmRlZmluZWR9LFxuICAgICAgICAgIGVuc3VyZSBcIi5cIixcbiAgICAgICAgICAgIHRleHRDOiAgXCJ8NlxcbjdcXG44XFxuOVxcbjEwXFxuXCJcbiAgICAgICAgICAgIHJlZ2lzdGVyOlxuICAgICAgICAgICAgICAnXCInOiB7dGV4dDogJzVcXG4nfSwgJy0nOiB7dGV4dDogdW5kZWZpbmVkfSxcbiAgICAgICAgICAgICAgJzEnOiB7dGV4dDogJzVcXG4nfSwgICAgICcyJzoge3RleHQ6ICc0XFxuJ30sICAgICAnMyc6IHt0ZXh0OiAnM1xcbid9LFxuICAgICAgICAgICAgICAnNCc6IHt0ZXh0OiAnMlxcbid9LCAgICAgJzUnOiB7dGV4dDogJzFcXG4nfSwgICAgICc2Jzoge3RleHQ6ICcwXFxuJ30sXG4gICAgICAgICAgICAgICc3Jzoge3RleHQ6IHVuZGVmaW5lZH0sICc4Jzoge3RleHQ6IHVuZGVmaW5lZH0sICc5Jzoge3RleHQ6IHVuZGVmaW5lZH0sXG4gICAgICAgICAgZW5zdXJlIFwiLlwiLFxuICAgICAgICAgICAgdGV4dEM6ICBcInw3XFxuOFxcbjlcXG4xMFxcblwiXG4gICAgICAgICAgICByZWdpc3RlcjpcbiAgICAgICAgICAgICAgJ1wiJzoge3RleHQ6ICc2XFxuJ30sICctJzoge3RleHQ6IHVuZGVmaW5lZH0sXG4gICAgICAgICAgICAgICcxJzoge3RleHQ6ICc2XFxuJ30sICcyJzoge3RleHQ6ICc1XFxuJ30sICAgICAnMyc6IHt0ZXh0OiAnNFxcbid9LFxuICAgICAgICAgICAgICAnNCc6IHt0ZXh0OiAnM1xcbid9LCAnNSc6IHt0ZXh0OiAnMlxcbid9LCAgICAgJzYnOiB7dGV4dDogJzFcXG4nfSxcbiAgICAgICAgICAgICAgJzcnOiB7dGV4dDogJzBcXG4nfSwgJzgnOiB7dGV4dDogdW5kZWZpbmVkfSwgJzknOiB7dGV4dDogdW5kZWZpbmVkfSxcbiAgICAgICAgICBlbnN1cmUgXCIuXCIsXG4gICAgICAgICAgICB0ZXh0QzogIFwifDhcXG45XFxuMTBcXG5cIlxuICAgICAgICAgICAgcmVnaXN0ZXI6XG4gICAgICAgICAgICAgICdcIic6IHt0ZXh0OiAnN1xcbid9LCAnLSc6IHt0ZXh0OiB1bmRlZmluZWR9LFxuICAgICAgICAgICAgICAnMSc6IHt0ZXh0OiAnN1xcbid9LCAnMic6IHt0ZXh0OiAnNlxcbid9LCAnMyc6IHt0ZXh0OiAnNVxcbid9LFxuICAgICAgICAgICAgICAnNCc6IHt0ZXh0OiAnNFxcbid9LCAnNSc6IHt0ZXh0OiAnM1xcbid9LCAnNic6IHt0ZXh0OiAnMlxcbid9LFxuICAgICAgICAgICAgICAnNyc6IHt0ZXh0OiAnMVxcbid9LCAnOCc6IHt0ZXh0OiAnMFxcbid9LCAnOSc6IHt0ZXh0OiB1bmRlZmluZWR9LFxuICAgICAgICAgIGVuc3VyZSBcIi5cIixcbiAgICAgICAgICAgIHRleHRDOiAgXCJ8OVxcbjEwXFxuXCJcbiAgICAgICAgICAgIHJlZ2lzdGVyOlxuICAgICAgICAgICAgICAnXCInOiB7dGV4dDogJzhcXG4nfSwgJy0nOiB7dGV4dDogdW5kZWZpbmVkfSxcbiAgICAgICAgICAgICAgJzEnOiB7dGV4dDogJzhcXG4nfSwgJzInOiB7dGV4dDogJzdcXG4nfSwgJzMnOiB7dGV4dDogJzZcXG4nfSxcbiAgICAgICAgICAgICAgJzQnOiB7dGV4dDogJzVcXG4nfSwgJzUnOiB7dGV4dDogJzRcXG4nfSwgJzYnOiB7dGV4dDogJzNcXG4nfSxcbiAgICAgICAgICAgICAgJzcnOiB7dGV4dDogJzJcXG4nfSwgJzgnOiB7dGV4dDogJzFcXG4nfSwgJzknOiB7dGV4dDogJzBcXG4nfSxcbiAgICAgICAgICBlbnN1cmUgXCIuXCIsXG4gICAgICAgICAgICB0ZXh0QzogIFwifDEwXFxuXCJcbiAgICAgICAgICAgIHJlZ2lzdGVyOlxuICAgICAgICAgICAgICAnXCInOiB7dGV4dDogJzlcXG4nfSwgJy0nOiB7dGV4dDogdW5kZWZpbmVkfSxcbiAgICAgICAgICAgICAgJzEnOiB7dGV4dDogJzlcXG4nfSwgJzInOiB7dGV4dDogJzhcXG4nfSwgJzMnOiB7dGV4dDogJzdcXG4nfSxcbiAgICAgICAgICAgICAgJzQnOiB7dGV4dDogJzZcXG4nfSwgJzUnOiB7dGV4dDogJzVcXG4nfSwgJzYnOiB7dGV4dDogJzRcXG4nfSxcbiAgICAgICAgICAgICAgJzcnOiB7dGV4dDogJzNcXG4nfSwgJzgnOiB7dGV4dDogJzJcXG4nfSwgJzknOiB7dGV4dDogJzFcXG4nfVxuICAgICAgICBpdCBcImFsc28ga2VlcHMgY2hhbmdlZCB0ZXh0XCIsIC0+XG4gICAgICAgICAgZW5zdXJlIFwiYyBqXCIsXG4gICAgICAgICAgICB0ZXh0QzogIFwifFxcbjJcXG4zXFxuNFxcbjVcXG42XFxuN1xcbjhcXG45XFxuMTBcXG5cIlxuICAgICAgICAgICAgcmVnaXN0ZXI6XG4gICAgICAgICAgICAgICdcIic6IHt0ZXh0OiAnMFxcbjFcXG4nfSwgJy0nOiB7dGV4dDogdW5kZWZpbmVkfSxcbiAgICAgICAgICAgICAgJzEnOiB7dGV4dDogJzBcXG4xXFxuJ30sICcyJzoge3RleHQ6IHVuZGVmaW5lZH0sICczJzoge3RleHQ6IHVuZGVmaW5lZH0sXG4gICAgICAgICAgICAgICc0Jzoge3RleHQ6IHVuZGVmaW5lZH0sICc1Jzoge3RleHQ6IHVuZGVmaW5lZH0sICc2Jzoge3RleHQ6IHVuZGVmaW5lZH0sXG4gICAgICAgICAgICAgICc3Jzoge3RleHQ6IHVuZGVmaW5lZH0sICc4Jzoge3RleHQ6IHVuZGVmaW5lZH0sICc5Jzoge3RleHQ6IHVuZGVmaW5lZH0sXG5cbiAgICAgICAgZGVzY3JpYmUgXCJ3aGljaCBnb2VzIHRvIG51bWJlcmVkIGFuZCB3aGljaCBnb2VzIHRvIHNtYWxsLWRlbGV0ZSByZWdpc3RlclwiLCAtPlxuICAgICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICAgIHNldCB0ZXh0QzogXCJ8e2FiY31cXG5cIlxuXG4gICAgICAgICAgaXQgXCJzbWFsbC1jaGFuZ2UgZ29lcyB0byAtIHJlZ2lzdGVyXCIsIC0+XG4gICAgICAgICAgICBlbnN1cmUgXCJjICRcIixcbiAgICAgICAgICAgICAgdGV4dEM6IFwifFxcblwiXG4gICAgICAgICAgICAgIHJlZ2lzdGVyOlxuICAgICAgICAgICAgICAgICdcIic6IHt0ZXh0OiAne2FiY30nfSwgJy0nOiB7dGV4dDogJ3thYmN9J30sXG4gICAgICAgICAgICAgICAgJzEnOiB7dGV4dDogdW5kZWZpbmVkfSwgJzInOiB7dGV4dDogdW5kZWZpbmVkfSwgJzMnOiB7dGV4dDogdW5kZWZpbmVkfSxcbiAgICAgICAgICAgICAgICAnNCc6IHt0ZXh0OiB1bmRlZmluZWR9LCAnNSc6IHt0ZXh0OiB1bmRlZmluZWR9LCAnNic6IHt0ZXh0OiB1bmRlZmluZWR9LFxuICAgICAgICAgICAgICAgICc3Jzoge3RleHQ6IHVuZGVmaW5lZH0sICc4Jzoge3RleHQ6IHVuZGVmaW5lZH0sICc5Jzoge3RleHQ6IHVuZGVmaW5lZH0sXG4gICAgICAgICAgaXQgXCJzbWFsbC1kZWxldGUgZ29lcyB0byAtIHJlZ2lzdGVyXCIsIC0+XG4gICAgICAgICAgICBlbnN1cmUgXCJkICRcIixcbiAgICAgICAgICAgICAgdGV4dEM6IFwifFxcblwiXG4gICAgICAgICAgICAgIHJlZ2lzdGVyOlxuICAgICAgICAgICAgICAgICdcIic6IHt0ZXh0OiAne2FiY30nfSwgJy0nOiB7dGV4dDogJ3thYmN9J30sXG4gICAgICAgICAgICAgICAgJzEnOiB7dGV4dDogdW5kZWZpbmVkfSwgJzInOiB7dGV4dDogdW5kZWZpbmVkfSwgJzMnOiB7dGV4dDogdW5kZWZpbmVkfSxcbiAgICAgICAgICAgICAgICAnNCc6IHt0ZXh0OiB1bmRlZmluZWR9LCAnNSc6IHt0ZXh0OiB1bmRlZmluZWR9LCAnNic6IHt0ZXh0OiB1bmRlZmluZWR9LFxuICAgICAgICAgICAgICAgICc3Jzoge3RleHQ6IHVuZGVmaW5lZH0sICc4Jzoge3RleHQ6IHVuZGVmaW5lZH0sICc5Jzoge3RleHQ6IHVuZGVmaW5lZH0sXG4gICAgICAgICAgaXQgXCJbZXhjZXB0aW9uXSAlIG1vdGlvbiBhbHdheXMgc2F2ZSB0byBudW1iZXJlZFwiLCAtPlxuICAgICAgICAgICAgc2V0IHRleHRDOiBcInx7YWJjfVxcblwiXG4gICAgICAgICAgICBlbnN1cmUgXCJkICVcIiwgdGV4dEM6IFwifFxcblwiLCByZWdpc3RlcjogeydcIic6IHt0ZXh0OiAne2FiY30nfSwgJy0nOiB7dGV4dDogdW5kZWZpbmVkfSwgJzEnOiB7dGV4dDogJ3thYmN9J30sICcyJzoge3RleHQ6IHVuZGVmaW5lZH19XG4gICAgICAgICAgaXQgXCJbZXhjZXB0aW9uXSAvIG1vdGlvbiBhbHdheXMgc2F2ZSB0byBudW1iZXJlZFwiLCAtPlxuICAgICAgICAgICAgamFzbWluZS5hdHRhY2hUb0RPTShhdG9tLndvcmtzcGFjZS5nZXRFbGVtZW50KCkpXG4gICAgICAgICAgICBzZXQgdGV4dEM6IFwifHthYmN9XFxuXCJcbiAgICAgICAgICAgIGVuc3VyZSBcImQgLyB9IGVudGVyXCIsXG4gICAgICAgICAgICAgIHRleHRDOiBcInx9XFxuXCIsXG4gICAgICAgICAgICAgIHJlZ2lzdGVyOiB7J1wiJzoge3RleHQ6ICd7YWJjJ30sICctJzoge3RleHQ6IHVuZGVmaW5lZH0sICcxJzoge3RleHQ6ICd7YWJjJ30sICcyJzoge3RleHQ6IHVuZGVmaW5lZH19XG5cbiAgICAgICAgICBpdCBcIi8sIG4gbW90aW9uIGFsd2F5cyBzYXZlIHRvIG51bWJlcmVkXCIsIC0+XG4gICAgICAgICAgICBqYXNtaW5lLmF0dGFjaFRvRE9NKGF0b20ud29ya3NwYWNlLmdldEVsZW1lbnQoKSlcbiAgICAgICAgICAgIHNldCB0ZXh0QzogXCJ8YWJjIGF4eCBhYmNcXG5cIlxuICAgICAgICAgICAgZW5zdXJlIFwiZCAvIGEgZW50ZXJcIixcbiAgICAgICAgICAgICAgdGV4dEM6IFwifGF4eCBhYmNcXG5cIixcbiAgICAgICAgICAgICAgcmVnaXN0ZXI6IHsnXCInOiB7dGV4dDogJ2FiYyAnfSwgJy0nOiB7dGV4dDogdW5kZWZpbmVkfSwgJzEnOiB7dGV4dDogJ2FiYyAnfSwgJzInOiB7dGV4dDogdW5kZWZpbmVkfX1cbiAgICAgICAgICAgIGVuc3VyZSBcImQgblwiLFxuICAgICAgICAgICAgICB0ZXh0QzogXCJ8YWJjXFxuXCIsXG4gICAgICAgICAgICAgIHJlZ2lzdGVyOiB7J1wiJzoge3RleHQ6ICdheHggJ30sICctJzoge3RleHQ6IHVuZGVmaW5lZH0sICcxJzoge3RleHQ6ICdheHggJ30sICcyJzoge3RleHQ6ICdhYmMgJ319XG4gICAgICAgICAgaXQgXCI/LCBOIG1vdGlvbiBhbHdheXMgc2F2ZSB0byBudW1iZXJlZFwiLCAtPlxuICAgICAgICAgICAgamFzbWluZS5hdHRhY2hUb0RPTShhdG9tLndvcmtzcGFjZS5nZXRFbGVtZW50KCkpXG4gICAgICAgICAgICBzZXQgdGV4dEM6IFwiYWJjIGF4eCB8YWJjXFxuXCJcbiAgICAgICAgICAgIGVuc3VyZSBcImQgPyBhIGVudGVyXCIsXG4gICAgICAgICAgICAgIHRleHRDOiBcImFiYyB8YWJjXFxuXCIsXG4gICAgICAgICAgICAgIHJlZ2lzdGVyOiB7J1wiJzoge3RleHQ6ICdheHggJ30sICctJzoge3RleHQ6IHVuZGVmaW5lZH0sICcxJzoge3RleHQ6ICdheHggJ30sICcyJzoge3RleHQ6IHVuZGVmaW5lZH19XG4gICAgICAgICAgICBlbnN1cmUgXCIwXCIsXG4gICAgICAgICAgICAgIHRleHRDOiBcInxhYmMgYWJjXFxuXCIsXG4gICAgICAgICAgICBlbnN1cmUgXCJjIE5cIixcbiAgICAgICAgICAgICAgdGV4dEM6IFwifGFiY1xcblwiLFxuICAgICAgICAgICAgICByZWdpc3RlcjogeydcIic6IHt0ZXh0OiAnYWJjICd9LCAnLSc6IHt0ZXh0OiB1bmRlZmluZWR9LCAnMSc6IHt0ZXh0OiAnYWJjICd9LCAnMic6IHt0ZXh0OiBcImF4eCBcIn19XG5cbiAgICBkZXNjcmliZSBcInRoZSBjdHJsLXIgY29tbWFuZCBpbiBpbnNlcnQgbW9kZVwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXQgcmVnaXN0ZXI6ICdcIic6IHRleHQ6ICczNDUnXG4gICAgICAgIHNldCByZWdpc3RlcjogJ2EnOiB0ZXh0OiAnYWJjJ1xuICAgICAgICBzZXQgcmVnaXN0ZXI6ICcqJzogdGV4dDogJ2FiYydcbiAgICAgICAgYXRvbS5jbGlwYm9hcmQud3JpdGUgXCJjbGlwXCJcbiAgICAgICAgc2V0IHRleHQ6IFwiMDEyXFxuXCIsIGN1cnNvcjogWzAsIDJdXG4gICAgICAgIGVuc3VyZSAnaScsIG1vZGU6ICdpbnNlcnQnXG5cbiAgICAgIGRlc2NyaWJlIFwidXNlQ2xpcGJvYXJkQXNEZWZhdWx0UmVnaXN0ZXIgPSB0cnVlXCIsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBzZXR0aW5ncy5zZXQgJ3VzZUNsaXBib2FyZEFzRGVmYXVsdFJlZ2lzdGVyJywgdHJ1ZVxuICAgICAgICAgIHNldCByZWdpc3RlcjogJ1wiJzogdGV4dDogJzM0NSdcbiAgICAgICAgICBhdG9tLmNsaXBib2FyZC53cml0ZSBcImNsaXBcIlxuXG4gICAgICAgIGl0IFwiaW5zZXJ0cyBjb250ZW50cyBmcm9tIGNsaXBib2FyZCB3aXRoIFxcXCJcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJ2N0cmwtciBcIicsIHRleHQ6ICcwMWNsaXAyXFxuJ1xuXG4gICAgICBkZXNjcmliZSBcInVzZUNsaXBib2FyZEFzRGVmYXVsdFJlZ2lzdGVyID0gZmFsc2VcIiwgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIHNldHRpbmdzLnNldCAndXNlQ2xpcGJvYXJkQXNEZWZhdWx0UmVnaXN0ZXInLCBmYWxzZVxuICAgICAgICAgIHNldCByZWdpc3RlcjogJ1wiJzogdGV4dDogJzM0NSdcbiAgICAgICAgICBhdG9tLmNsaXBib2FyZC53cml0ZSBcImNsaXBcIlxuXG4gICAgICAgIGl0IFwiaW5zZXJ0cyBjb250ZW50cyBmcm9tIFxcXCIgd2l0aCBcXFwiXCIsIC0+XG4gICAgICAgICAgZW5zdXJlICdjdHJsLXIgXCInLCB0ZXh0OiAnMDEzNDUyXFxuJ1xuXG4gICAgICBpdCBcImluc2VydHMgY29udGVudHMgb2YgdGhlICdhJyByZWdpc3RlclwiLCAtPlxuICAgICAgICBlbnN1cmUgJ2N0cmwtciBhJywgdGV4dDogJzAxYWJjMlxcbidcblxuICAgICAgaXQgXCJpcyBjYW5jZWxsZWQgd2l0aCB0aGUgZXNjYXBlIGtleVwiLCAtPlxuICAgICAgICBlbnN1cmUgJ2N0cmwtciBlc2NhcGUnLFxuICAgICAgICAgIHRleHQ6ICcwMTJcXG4nXG4gICAgICAgICAgbW9kZTogJ2luc2VydCdcbiAgICAgICAgICBjdXJzb3I6IFswLCAyXVxuXG4gICAgZGVzY3JpYmUgXCJwZXIgc2VsZWN0aW9uIGNsaXBib2FyZFwiLCAtPlxuICAgICAgZW5zdXJlUGVyU2VsZWN0aW9uUmVnaXN0ZXIgPSAodGV4dHMuLi4pIC0+XG4gICAgICAgIGZvciBzZWxlY3Rpb24sIGkgaW4gZWRpdG9yLmdldFNlbGVjdGlvbnMoKVxuICAgICAgICAgIGVuc3VyZSByZWdpc3RlcjogJyonOiB7dGV4dDogdGV4dHNbaV0sIHNlbGVjdGlvbjogc2VsZWN0aW9ufVxuXG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldHRpbmdzLnNldCAndXNlQ2xpcGJvYXJkQXNEZWZhdWx0UmVnaXN0ZXInLCB0cnVlXG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgMDEyOlxuICAgICAgICAgICAgYWJjOlxuICAgICAgICAgICAgZGVmOlxcblxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgY3Vyc29yOiBbWzAsIDFdLCBbMSwgMV0sIFsyLCAxXV1cblxuICAgICAgZGVzY3JpYmUgXCJvbiBzZWxlY3Rpb24gZGVzdHJveWVcIiwgLT5cbiAgICAgICAgaXQgXCJyZW1vdmUgY29ycmVzcG9uZGluZyBzdWJzY3JpcHRpbiBhbmQgY2xpcGJvYXJkIGVudHJ5XCIsIC0+XG4gICAgICAgICAge2NsaXBib2FyZEJ5U2VsZWN0aW9uLCBzdWJzY3JpcHRpb25CeVNlbGVjdGlvbn0gPSB2aW1TdGF0ZS5yZWdpc3RlclxuICAgICAgICAgIGV4cGVjdChjbGlwYm9hcmRCeVNlbGVjdGlvbi5zaXplKS50b0JlKDApXG4gICAgICAgICAgZXhwZWN0KHN1YnNjcmlwdGlvbkJ5U2VsZWN0aW9uLnNpemUpLnRvQmUoMClcblxuICAgICAgICAgIGtleXN0cm9rZSBcInkgaSB3XCJcbiAgICAgICAgICBlbnN1cmVQZXJTZWxlY3Rpb25SZWdpc3RlcignMDEyJywgJ2FiYycsICdkZWYnKVxuXG4gICAgICAgICAgZXhwZWN0KGNsaXBib2FyZEJ5U2VsZWN0aW9uLnNpemUpLnRvQmUoMylcbiAgICAgICAgICBleHBlY3Qoc3Vic2NyaXB0aW9uQnlTZWxlY3Rpb24uc2l6ZSkudG9CZSgzKVxuICAgICAgICAgIHNlbGVjdGlvbi5kZXN0cm95KCkgZm9yIHNlbGVjdGlvbiBpbiBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpXG4gICAgICAgICAgZXhwZWN0KGNsaXBib2FyZEJ5U2VsZWN0aW9uLnNpemUpLnRvQmUoMClcbiAgICAgICAgICBleHBlY3Qoc3Vic2NyaXB0aW9uQnlTZWxlY3Rpb24uc2l6ZSkudG9CZSgwKVxuXG4gICAgICBkZXNjcmliZSBcIllhbmtcIiwgLT5cbiAgICAgICAgaXQgXCJzYXZlIHRleHQgdG8gcGVyIHNlbGVjdGlvbiByZWdpc3RlclwiLCAtPlxuICAgICAgICAgIGtleXN0cm9rZSBcInkgaSB3XCJcbiAgICAgICAgICBlbnN1cmVQZXJTZWxlY3Rpb25SZWdpc3RlcignMDEyJywgJ2FiYycsICdkZWYnKVxuXG4gICAgICBkZXNjcmliZSBcIkRlbGV0ZSBmYW1pbHlcIiwgLT5cbiAgICAgICAgaXQgXCJkXCIsIC0+XG4gICAgICAgICAgZW5zdXJlIFwiZCBpIHdcIiwgdGV4dDogXCI6XFxuOlxcbjpcXG5cIlxuICAgICAgICAgIGVuc3VyZVBlclNlbGVjdGlvblJlZ2lzdGVyKCcwMTInLCAnYWJjJywgJ2RlZicpXG4gICAgICAgIGl0IFwieFwiLCAtPlxuICAgICAgICAgIGVuc3VyZSBcInhcIiwgdGV4dDogXCIwMjpcXG5hYzpcXG5kZjpcXG5cIlxuICAgICAgICAgIGVuc3VyZVBlclNlbGVjdGlvblJlZ2lzdGVyKCcxJywgJ2InLCAnZScpXG4gICAgICAgIGl0IFwiWFwiLCAtPlxuICAgICAgICAgIGVuc3VyZSBcIlhcIiwgdGV4dDogXCIxMjpcXG5iYzpcXG5lZjpcXG5cIlxuICAgICAgICAgIGVuc3VyZVBlclNlbGVjdGlvblJlZ2lzdGVyKCcwJywgJ2EnLCAnZCcpXG4gICAgICAgIGl0IFwiRFwiLCAtPlxuICAgICAgICAgIGVuc3VyZSBcIkRcIiwgdGV4dDogXCIwXFxuYVxcbmRcXG5cIlxuICAgICAgICAgIGVuc3VyZVBlclNlbGVjdGlvblJlZ2lzdGVyKCcxMjonLCAnYmM6JywgJ2VmOicpXG5cbiAgICAgIGRlc2NyaWJlIFwiUHV0IGZhbWlseVwiLCAtPlxuICAgICAgICBpdCBcInAgcGFzdGUgdGV4dCBmcm9tIHBlciBzZWxlY3Rpb24gcmVnaXN0ZXJcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgXCJ5IGkgdyAkIHBcIixcbiAgICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgICAwMTI6MDEyXG4gICAgICAgICAgICAgIGFiYzphYmNcbiAgICAgICAgICAgICAgZGVmOmRlZlxcblxuICAgICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgaXQgXCJQIHBhc3RlIHRleHQgZnJvbSBwZXIgc2VsZWN0aW9uIHJlZ2lzdGVyXCIsIC0+XG4gICAgICAgICAgZW5zdXJlIFwieSBpIHcgJCBQXCIsXG4gICAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgICAgMDEyMDEyOlxuICAgICAgICAgICAgICBhYmNhYmM6XG4gICAgICAgICAgICAgIGRlZmRlZjpcXG5cbiAgICAgICAgICAgICAgXCJcIlwiXG4gICAgICBkZXNjcmliZSBcImN0cmwtciBpbiBpbnNlcnQgbW9kZVwiLCAtPlxuICAgICAgICBpdCBcImluc2VydCBmcm9tIHBlciBzZWxlY3Rpb24gcmVnaXN0ZVwiLCAtPlxuICAgICAgICAgIGVuc3VyZSBcImQgaSB3XCIsIHRleHQ6IFwiOlxcbjpcXG46XFxuXCJcbiAgICAgICAgICBlbnN1cmUgJ2EnLCBtb2RlOiAnaW5zZXJ0J1xuICAgICAgICAgIGVuc3VyZSAnY3RybC1yIFwiJyxcbiAgICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgICA6MDEyXG4gICAgICAgICAgICAgIDphYmNcbiAgICAgICAgICAgICAgOmRlZlxcblxuICAgICAgICAgICAgICBcIlwiXCJcblxuICBkZXNjcmliZSBcIkNvdW50IG1vZGlmaWVyXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2V0XG4gICAgICAgIHRleHQ6IFwiMDAwIDExMSAyMjIgMzMzIDQ0NCA1NTUgNjY2IDc3NyA4ODggOTk5XCJcbiAgICAgICAgY3Vyc29yOiBbMCwgMF1cblxuICAgIGl0IFwicmVwZWF0IG9wZXJhdG9yXCIsIC0+XG4gICAgICBlbnN1cmUgJzMgZCB3JywgdGV4dDogXCIzMzMgNDQ0IDU1NSA2NjYgNzc3IDg4OCA5OTlcIlxuICAgIGl0IFwicmVwZWF0IG1vdGlvblwiLCAtPlxuICAgICAgZW5zdXJlICdkIDIgdycsIHRleHQ6IFwiMjIyIDMzMyA0NDQgNTU1IDY2NiA3NzcgODg4IDk5OVwiXG4gICAgaXQgXCJyZXBlYXQgb3BlcmF0b3IgYW5kIG1vdGlvbiByZXNwZWN0aXZlbHlcIiwgLT5cbiAgICAgIGVuc3VyZSAnMyBkIDIgdycsIHRleHQ6IFwiNjY2IDc3NyA4ODggOTk5XCJcbiJdfQ==
