(function() {
  var dispatch, getVimState, ref, settings;

  ref = require('./spec-helper'), getVimState = ref.getVimState, dispatch = ref.dispatch;

  settings = require('../lib/settings');

  describe("Operator TransformString", function() {
    var editor, editorElement, ensure, keystroke, ref1, set, vimState;
    ref1 = [], set = ref1[0], ensure = ref1[1], keystroke = ref1[2], editor = ref1[3], editorElement = ref1[4], vimState = ref1[5];
    beforeEach(function() {
      return getVimState(function(state, vim) {
        vimState = state;
        editor = vimState.editor, editorElement = vimState.editorElement;
        return set = vim.set, ensure = vim.ensure, keystroke = vim.keystroke, vim;
      });
    });
    describe('the ~ keybinding', function() {
      beforeEach(function() {
        return set({
          textC: "|aBc\n|XyZ"
        });
      });
      it('toggles the case and moves right', function() {
        ensure('~', {
          textC: "A|Bc\nx|yZ"
        });
        ensure('~', {
          textC: "Ab|c\nxY|Z"
        });
        return ensure('~', {
          textC: "Ab|C\nxY|z"
        });
      });
      it('takes a count', function() {
        return ensure('4 ~', {
          textC: "Ab|C\nxY|z"
        });
      });
      describe("in visual mode", function() {
        return it("toggles the case of the selected text", function() {
          set({
            cursor: [0, 0]
          });
          return ensure('V ~', {
            text: 'AbC\nXyZ'
          });
        });
      });
      return describe("with g and motion", function() {
        it("toggles the case of text, won't move cursor", function() {
          set({
            textC: "|aBc\nXyZ"
          });
          return ensure('g ~ 2 l', {
            textC: '|Abc\nXyZ'
          });
        });
        it("g~~ toggles the line of text, won't move cursor", function() {
          set({
            textC: "a|Bc\nXyZ"
          });
          return ensure('g ~ ~', {
            textC: 'A|bC\nXyZ'
          });
        });
        return it("g~g~ toggles the line of text, won't move cursor", function() {
          set({
            textC: "a|Bc\nXyZ"
          });
          return ensure('g ~ g ~', {
            textC: 'A|bC\nXyZ'
          });
        });
      });
    });
    describe('the U keybinding', function() {
      beforeEach(function() {
        return set({
          text: 'aBc\nXyZ',
          cursor: [0, 0]
        });
      });
      it("makes text uppercase with g and motion, and won't move cursor", function() {
        ensure('g U l', {
          text: 'ABc\nXyZ',
          cursor: [0, 0]
        });
        ensure('g U e', {
          text: 'ABC\nXyZ',
          cursor: [0, 0]
        });
        set({
          cursor: [1, 0]
        });
        return ensure('g U $', {
          text: 'ABC\nXYZ',
          cursor: [1, 0]
        });
      });
      it("makes the selected text uppercase in visual mode", function() {
        return ensure('V U', {
          text: 'ABC\nXyZ'
        });
      });
      it("gUU upcase the line of text, won't move cursor", function() {
        set({
          cursor: [0, 1]
        });
        return ensure('g U U', {
          text: 'ABC\nXyZ',
          cursor: [0, 1]
        });
      });
      return it("gUgU upcase the line of text, won't move cursor", function() {
        set({
          cursor: [0, 1]
        });
        return ensure('g U g U', {
          text: 'ABC\nXyZ',
          cursor: [0, 1]
        });
      });
    });
    describe('the u keybinding', function() {
      beforeEach(function() {
        return set({
          text: 'aBc\nXyZ',
          cursor: [0, 0]
        });
      });
      it("makes text lowercase with g and motion, and won't move cursor", function() {
        return ensure('g u $', {
          text: 'abc\nXyZ',
          cursor: [0, 0]
        });
      });
      it("makes the selected text lowercase in visual mode", function() {
        return ensure('V u', {
          text: 'abc\nXyZ'
        });
      });
      it("guu downcase the line of text, won't move cursor", function() {
        set({
          cursor: [0, 1]
        });
        return ensure('g u u', {
          text: 'abc\nXyZ',
          cursor: [0, 1]
        });
      });
      return it("gugu downcase the line of text, won't move cursor", function() {
        set({
          cursor: [0, 1]
        });
        return ensure('g u g u', {
          text: 'abc\nXyZ',
          cursor: [0, 1]
        });
      });
    });
    describe("the > keybinding", function() {
      beforeEach(function() {
        return set({
          text: "12345\nabcde\nABCDE"
        });
      });
      describe("> >", function() {
        describe("from first line", function() {
          it("indents the current line", function() {
            set({
              cursor: [0, 0]
            });
            return ensure('> >', {
              textC: "  |12345\nabcde\nABCDE"
            });
          });
          return it("count means N line indents and undoable, repeatable", function() {
            set({
              cursor: [0, 0]
            });
            ensure('3 > >', {
              textC_: "__|12345\n__abcde\n__ABCDE"
            });
            ensure('u', {
              textC: "|12345\nabcde\nABCDE"
            });
            return ensure('. .', {
              textC_: "____|12345\n____abcde\n____ABCDE"
            });
          });
        });
        return describe("from last line", function() {
          return it("indents the current line", function() {
            set({
              cursor: [2, 0]
            });
            return ensure('> >', {
              textC: "12345\nabcde\n  |ABCDE"
            });
          });
        });
      });
      describe("in visual mode", function() {
        beforeEach(function() {
          return set({
            cursor: [0, 0]
          });
        });
        it("[vC] indent selected lines", function() {
          return ensure("v j >", {
            mode: 'normal',
            textC_: "__|12345\n__abcde\nABCDE"
          });
        });
        it("[vL] indent selected lines", function() {
          ensure("V >", {
            mode: 'normal',
            textC_: "__|12345\nabcde\nABCDE"
          });
          return ensure('.', {
            textC_: "____|12345\nabcde\nABCDE"
          });
        });
        return it("[vL] count means N times indent", function() {
          ensure("V 3 >", {
            mode: 'normal',
            textC_: "______|12345\nabcde\nABCDE"
          });
          return ensure('.', {
            textC_: "____________|12345\nabcde\nABCDE"
          });
        });
      });
      return describe("in visual mode and stayOnTransformString enabled", function() {
        beforeEach(function() {
          settings.set('stayOnTransformString', true);
          return set({
            cursor: [0, 0]
          });
        });
        it("indents the currrent selection and exits visual mode", function() {
          return ensure('v j >', {
            mode: 'normal',
            textC: "  12345\n  |abcde\nABCDE"
          });
        });
        it("when repeated, operate on same range when cursor was not moved", function() {
          ensure('v j >', {
            mode: 'normal',
            textC: "  12345\n  |abcde\nABCDE"
          });
          return ensure('.', {
            mode: 'normal',
            textC: "    12345\n    |abcde\nABCDE"
          });
        });
        return it("when repeated, operate on relative range from cursor position with same extent when cursor was moved", function() {
          ensure('v j >', {
            mode: 'normal',
            textC: "  12345\n  |abcde\nABCDE"
          });
          return ensure('l .', {
            mode: 'normal',
            textC_: "__12345\n____a|bcde\n__ABCDE"
          });
        });
      });
    });
    describe("the < keybinding", function() {
      beforeEach(function() {
        return set({
          textC_: "|__12345\n__abcde\nABCDE"
        });
      });
      describe("when followed by a <", function() {
        return it("indents the current line", function() {
          return ensure('< <', {
            textC_: "|12345\n__abcde\nABCDE"
          });
        });
      });
      describe("when followed by a repeating <", function() {
        return it("indents multiple lines at once and undoable", function() {
          ensure('2 < <', {
            textC_: "|12345\nabcde\nABCDE"
          });
          return ensure('u', {
            textC_: "|__12345\n__abcde\nABCDE"
          });
        });
      });
      return describe("in visual mode", function() {
        beforeEach(function() {
          return set({
            textC_: "|______12345\n______abcde\nABCDE"
          });
        });
        return it("count means N times outdent", function() {
          ensure('V j 2 <', {
            textC_: "__|12345\n__abcde\nABCDE"
          });
          return ensure('u', {
            textC_: "______12345\n|______abcde\nABCDE"
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
        return set({
          text: "foo\n  bar\n  baz",
          cursor: [1, 0]
        });
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
            return keystroke('= =');
          });
          return it("indents the current line", function() {
            return expect(editor.indentationForBufferRow(1)).toBe(0);
          });
        });
        return describe("when followed by a repeating =", function() {
          beforeEach(function() {
            return keystroke('2 = =');
          });
          it("autoindents multiple lines at once", function() {
            return ensure({
              text: "foo\nbar\nbaz",
              cursor: [1, 0]
            });
          });
          return describe("undo behavior", function() {
            return it("indents both lines", function() {
              return ensure('u', {
                text: "foo\n  bar\n  baz"
              });
            });
          });
        });
      });
    });
    describe('CamelCase', function() {
      beforeEach(function() {
        return set({
          text: 'vim-mode\natom-text-editor\n',
          cursor: [0, 0]
        });
      });
      it("transform text by motion and repeatable", function() {
        ensure('g C $', {
          text: 'vimMode\natom-text-editor\n',
          cursor: [0, 0]
        });
        return ensure('j .', {
          text: 'vimMode\natomTextEditor\n',
          cursor: [1, 0]
        });
      });
      it("transform selection", function() {
        return ensure('V j g C', {
          text: 'vimMode\natomTextEditor\n',
          cursor: [0, 0]
        });
      });
      return it("repeating twice works on current-line and won't move cursor", function() {
        return ensure('l g C g C', {
          text: 'vimMode\natom-text-editor\n',
          cursor: [0, 1]
        });
      });
    });
    describe('PascalCase', function() {
      beforeEach(function() {
        atom.keymaps.add("test", {
          'atom-text-editor.vim-mode-plus:not(.insert-mode)': {
            'g C': 'vim-mode-plus:pascal-case'
          }
        });
        return set({
          text: 'vim-mode\natom-text-editor\n',
          cursor: [0, 0]
        });
      });
      it("transform text by motion and repeatable", function() {
        ensure('g C $', {
          text: 'VimMode\natom-text-editor\n',
          cursor: [0, 0]
        });
        return ensure('j .', {
          text: 'VimMode\nAtomTextEditor\n',
          cursor: [1, 0]
        });
      });
      it("transform selection", function() {
        return ensure('V j g C', {
          text: 'VimMode\natomTextEditor\n',
          cursor: [0, 0]
        });
      });
      return it("repeating twice works on current-line and won't move cursor", function() {
        return ensure('l g C g C', {
          text: 'VimMode\natom-text-editor\n',
          cursor: [0, 1]
        });
      });
    });
    describe('SnakeCase', function() {
      beforeEach(function() {
        set({
          text: 'vim-mode\natom-text-editor\n',
          cursor: [0, 0]
        });
        return atom.keymaps.add("g_", {
          'atom-text-editor.vim-mode-plus:not(.insert-mode)': {
            'g _': 'vim-mode-plus:snake-case'
          }
        });
      });
      it("transform text by motion and repeatable", function() {
        ensure('g _ $', {
          text: 'vim_mode\natom-text-editor\n',
          cursor: [0, 0]
        });
        return ensure('j .', {
          text: 'vim_mode\natom_text_editor\n',
          cursor: [1, 0]
        });
      });
      it("transform selection", function() {
        return ensure('V j g _', {
          text: 'vim_mode\natom_text_editor\n',
          cursor: [0, 0]
        });
      });
      return it("repeating twice works on current-line and won't move cursor", function() {
        return ensure('l g _ g _', {
          text: 'vim_mode\natom-text-editor\n',
          cursor: [0, 1]
        });
      });
    });
    describe('DashCase', function() {
      beforeEach(function() {
        return set({
          text: 'vimMode\natom_text_editor\n',
          cursor: [0, 0]
        });
      });
      it("transform text by motion and repeatable", function() {
        ensure('g - $', {
          text: 'vim-mode\natom_text_editor\n',
          cursor: [0, 0]
        });
        return ensure('j .', {
          text: 'vim-mode\natom-text-editor\n',
          cursor: [1, 0]
        });
      });
      it("transform selection", function() {
        return ensure('V j g -', {
          text: 'vim-mode\natom-text-editor\n',
          cursor: [0, 0]
        });
      });
      return it("repeating twice works on current-line and won't move cursor", function() {
        return ensure('l g - g -', {
          text: 'vim-mode\natom_text_editor\n',
          cursor: [0, 1]
        });
      });
    });
    describe('ConvertToSoftTab', function() {
      beforeEach(function() {
        return atom.keymaps.add("test", {
          'atom-text-editor.vim-mode-plus:not(.insert-mode)': {
            'g tab': 'vim-mode-plus:convert-to-soft-tab'
          }
        });
      });
      return describe("basic behavior", function() {
        return it("convert tabs to spaces", function() {
          expect(editor.getTabLength()).toBe(2);
          set({
            text: "\tvar10 =\t\t0;",
            cursor: [0, 0]
          });
          return ensure('g tab $', {
            text: "  var10 =   0;"
          });
        });
      });
    });
    describe('ConvertToHardTab', function() {
      beforeEach(function() {
        return atom.keymaps.add("test", {
          'atom-text-editor.vim-mode-plus:not(.insert-mode)': {
            'g shift-tab': 'vim-mode-plus:convert-to-hard-tab'
          }
        });
      });
      return describe("basic behavior", function() {
        return it("convert spaces to tabs", function() {
          expect(editor.getTabLength()).toBe(2);
          set({
            text: "  var10 =    0;",
            cursor: [0, 0]
          });
          return ensure('g shift-tab $', {
            text: "\tvar10\t=\t\t 0;"
          });
        });
      });
    });
    describe('CompactSpaces', function() {
      beforeEach(function() {
        return set({
          cursor: [0, 0]
        });
      });
      return describe("basic behavior", function() {
        it("compats multiple space into one", function() {
          set({
            text: 'var0   =   0; var10   =   10',
            cursor: [0, 0]
          });
          return ensure('g space $', {
            text: 'var0 = 0; var10 = 10'
          });
        });
        it("don't apply compaction for leading and trailing space", function() {
          set({
            text_: "___var0   =   0; var10   =   10___\n___var1   =   1; var11   =   11___\n___var2   =   2; var12   =   12___\n\n___var4   =   4; var14   =   14___",
            cursor: [0, 0]
          });
          return ensure('g space i p', {
            text_: "___var0 = 0; var10 = 10___\n___var1 = 1; var11 = 11___\n___var2 = 2; var12 = 12___\n\n___var4   =   4; var14   =   14___"
          });
        });
        return it("but it compact spaces when target all text is spaces", function() {
          set({
            text: '01234    90',
            cursor: [0, 5]
          });
          return ensure('g space w', {
            text: '01234 90'
          });
        });
      });
    });
    describe('TrimString', function() {
      beforeEach(function() {
        return set({
          text: " text = @getNewText( selection.getText(), selection )  ",
          cursor: [0, 42]
        });
      });
      return describe("basic behavior", function() {
        it("trim string for a-line text object", function() {
          set({
            text_: "___abc___\n___def___",
            cursor: [0, 0]
          });
          ensure('g | a l', {
            text_: "abc\n___def___"
          });
          return ensure('j .', {
            text_: "abc\ndef"
          });
        });
        it("trim string for inner-parenthesis text object", function() {
          set({
            text_: "(  abc  )\n(  def  )",
            cursor: [0, 0]
          });
          ensure('g | i (', {
            text_: "(abc)\n(  def  )"
          });
          return ensure('j .', {
            text_: "(abc)\n(def)"
          });
        });
        return it("trim string for inner-any-pair text object", function() {
          atom.keymaps.add("test", {
            'atom-text-editor.vim-mode-plus.operator-pending-mode, atom-text-editor.vim-mode-plus.visual-mode': {
              'i ;': 'vim-mode-plus:inner-any-pair'
            }
          });
          set({
            text_: "( [ {  abc  } ] )",
            cursor: [0, 8]
          });
          ensure('g | i ;', {
            text_: "( [ {abc} ] )"
          });
          ensure('2 h .', {
            text_: "( [{abc}] )"
          });
          return ensure('2 h .', {
            text_: "([{abc}])"
          });
        });
      });
    });
    describe('surround', function() {
      beforeEach(function() {
        var keymapsForSurround;
        keymapsForSurround = {
          'atom-text-editor.vim-mode-plus.normal-mode': {
            'y s': 'vim-mode-plus:surround',
            'd s': 'vim-mode-plus:delete-surround-any-pair',
            'd S': 'vim-mode-plus:delete-surround',
            'c s': 'vim-mode-plus:change-surround-any-pair',
            'c S': 'vim-mode-plus:change-surround'
          },
          'atom-text-editor.vim-mode-plus.operator-pending-mode.surround-pending': {
            's': 'vim-mode-plus:inner-current-line'
          },
          'atom-text-editor.vim-mode-plus.visual-mode': {
            'S': 'vim-mode-plus:surround'
          }
        };
        atom.keymaps.add("keymaps-for-surround", keymapsForSurround);
        return set({
          textC: "|apple\npairs: [brackets]\npairs: [brackets]\n( multi\n  line )"
        });
      });
      describe('alias keymap for surround, change-surround, delete-surround', function() {
        it("surround by aliased char", function() {
          set({
            textC: "|abc"
          });
          ensure([
            'y s i w', {
              input: 'b'
            }
          ], {
            text: "(abc)"
          });
          set({
            textC: "|abc"
          });
          ensure([
            'y s i w', {
              input: 'B'
            }
          ], {
            text: "{abc}"
          });
          set({
            textC: "|abc"
          });
          ensure([
            'y s i w', {
              input: 'r'
            }
          ], {
            text: "[abc]"
          });
          set({
            textC: "|abc"
          });
          return ensure([
            'y s i w', {
              input: 'a'
            }
          ], {
            text: "<abc>"
          });
        });
        it("delete surround by aliased char", function() {
          set({
            textC: "|(abc)"
          });
          ensure([
            'd S', {
              input: 'b'
            }
          ], {
            text: "abc"
          });
          set({
            textC: "|{abc}"
          });
          ensure([
            'd S', {
              input: 'B'
            }
          ], {
            text: "abc"
          });
          set({
            textC: "|[abc]"
          });
          ensure([
            'd S', {
              input: 'r'
            }
          ], {
            text: "abc"
          });
          set({
            textC: "|<abc>"
          });
          return ensure([
            'd S', {
              input: 'a'
            }
          ], {
            text: "abc"
          });
        });
        return it("change surround by aliased char", function() {
          set({
            textC: "|(abc)"
          });
          ensure([
            'c S', {
              input: 'bB'
            }
          ], {
            text: "{abc}"
          });
          set({
            textC: "|(abc)"
          });
          ensure([
            'c S', {
              input: 'br'
            }
          ], {
            text: "[abc]"
          });
          set({
            textC: "|(abc)"
          });
          ensure([
            'c S', {
              input: 'ba'
            }
          ], {
            text: "<abc>"
          });
          set({
            textC: "|{abc}"
          });
          ensure([
            'c S', {
              input: 'Bb'
            }
          ], {
            text: "(abc)"
          });
          set({
            textC: "|{abc}"
          });
          ensure([
            'c S', {
              input: 'Br'
            }
          ], {
            text: "[abc]"
          });
          set({
            textC: "|{abc}"
          });
          ensure([
            'c S', {
              input: 'Ba'
            }
          ], {
            text: "<abc>"
          });
          set({
            textC: "|[abc]"
          });
          ensure([
            'c S', {
              input: 'rb'
            }
          ], {
            text: "(abc)"
          });
          set({
            textC: "|[abc]"
          });
          ensure([
            'c S', {
              input: 'rB'
            }
          ], {
            text: "{abc}"
          });
          set({
            textC: "|[abc]"
          });
          ensure([
            'c S', {
              input: 'ra'
            }
          ], {
            text: "<abc>"
          });
          set({
            textC: "|<abc>"
          });
          ensure([
            'c S', {
              input: 'ab'
            }
          ], {
            text: "(abc)"
          });
          set({
            textC: "|<abc>"
          });
          ensure([
            'c S', {
              input: 'aB'
            }
          ], {
            text: "{abc}"
          });
          set({
            textC: "|<abc>"
          });
          return ensure([
            'c S', {
              input: 'ar'
            }
          ], {
            text: "[abc]"
          });
        });
      });
      describe('surround', function() {
        it("surround text object with ( and repeatable", function() {
          ensure([
            'y s i w', {
              input: '('
            }
          ], {
            textC: "|(apple)\npairs: [brackets]\npairs: [brackets]\n( multi\n  line )"
          });
          return ensure('j .', {
            text: "(apple)\n(pairs): [brackets]\npairs: [brackets]\n( multi\n  line )"
          });
        });
        it("surround text object with { and repeatable", function() {
          ensure([
            'y s i w', {
              input: '{'
            }
          ], {
            textC: "|{apple}\npairs: [brackets]\npairs: [brackets]\n( multi\n  line )"
          });
          return ensure('j .', {
            textC: "{apple}\n|{pairs}: [brackets]\npairs: [brackets]\n( multi\n  line )"
          });
        });
        it("surround current-line", function() {
          ensure([
            'y s s', {
              input: '{'
            }
          ], {
            textC: "|{apple}\npairs: [brackets]\npairs: [brackets]\n( multi\n  line )"
          });
          return ensure('j .', {
            textC: "{apple}\n|{pairs: [brackets]}\npairs: [brackets]\n( multi\n  line )"
          });
        });
        describe('adjustIndentation when surround linewise target', function() {
          beforeEach(function() {
            waitsForPromise(function() {
              return atom.packages.activatePackage('language-javascript');
            });
            return runs(function() {
              return set({
                textC: "hello = () => {\n  if true {\n  |  console.log('hello');\n  }\n}",
                grammar: 'source.js'
              });
            });
          });
          return it("adjustIndentation surrounded text ", function() {
            return ensure([
              'y s i f', {
                input: '{'
              }
            ], {
              textC: "hello = () => {\n|  {\n    if true {\n      console.log('hello');\n    }\n  }\n}"
            });
          });
        });
        describe('with motion which takes user-input', function() {
          beforeEach(function() {
            return set({
              text: "s _____ e",
              cursor: [0, 0]
            });
          });
          describe("with 'f' motion", function() {
            return it("surround with 'f' motion", function() {
              return ensure([
                'y s f', {
                  input: 'e('
                }
              ], {
                text: "(s _____ e)",
                cursor: [0, 0]
              });
            });
          });
          return describe("with '`' motion", function() {
            beforeEach(function() {
              set({
                cursor: [0, 8]
              });
              ensure('m a', {
                mark: {
                  'a': [0, 8]
                }
              });
              return set({
                cursor: [0, 0]
              });
            });
            return it("surround with '`' motion", function() {
              return ensure([
                'y s `', {
                  input: 'a('
                }
              ], {
                text: "(s _____ )e",
                cursor: [0, 0]
              });
            });
          });
        });
        return describe('charactersToAddSpaceOnSurround setting', function() {
          beforeEach(function() {
            settings.set('charactersToAddSpaceOnSurround', ['(', '{', '[']);
            return set({
              textC: "|apple\norange\nlemmon"
            });
          });
          describe("char is in charactersToAddSpaceOnSurround", function() {
            return it("add additional space inside pair char when surround", function() {
              ensure([
                'y s i w', {
                  input: '('
                }
              ], {
                text: "( apple )\norange\nlemmon"
              });
              keystroke('j');
              ensure([
                'y s i w', {
                  input: '{'
                }
              ], {
                text: "( apple )\n{ orange }\nlemmon"
              });
              keystroke('j');
              return ensure([
                'y s i w', {
                  input: '['
                }
              ], {
                text: "( apple )\n{ orange }\n[ lemmon ]"
              });
            });
          });
          describe("char is not in charactersToAddSpaceOnSurround", function() {
            return it("add additional space inside pair char when surround", function() {
              ensure([
                'y s i w', {
                  input: ')'
                }
              ], {
                text: "(apple)\norange\nlemmon"
              });
              keystroke('j');
              ensure([
                'y s i w', {
                  input: '}'
                }
              ], {
                text: "(apple)\n{orange}\nlemmon"
              });
              keystroke('j');
              return ensure([
                'y s i w', {
                  input: ']'
                }
              ], {
                text: "(apple)\n{orange}\n[lemmon]"
              });
            });
          });
          return describe("it distinctively handle aliased keymap", function() {
            describe("normal pair-chars are set to add space", function() {
              beforeEach(function() {
                return settings.set('charactersToAddSpaceOnSurround', ['(', '{', '[', '<']);
              });
              return it("distinctively handle", function() {
                set({
                  textC: "|abc"
                });
                ensure([
                  'y s i w', {
                    input: '('
                  }
                ], {
                  text: "( abc )"
                });
                set({
                  textC: "|abc"
                });
                ensure([
                  'y s i w', {
                    input: 'b'
                  }
                ], {
                  text: "(abc)"
                });
                set({
                  textC: "|abc"
                });
                ensure([
                  'y s i w', {
                    input: '{'
                  }
                ], {
                  text: "{ abc }"
                });
                set({
                  textC: "|abc"
                });
                ensure([
                  'y s i w', {
                    input: 'B'
                  }
                ], {
                  text: "{abc}"
                });
                set({
                  textC: "|abc"
                });
                ensure([
                  'y s i w', {
                    input: '['
                  }
                ], {
                  text: "[ abc ]"
                });
                set({
                  textC: "|abc"
                });
                ensure([
                  'y s i w', {
                    input: 'r'
                  }
                ], {
                  text: "[abc]"
                });
                set({
                  textC: "|abc"
                });
                ensure([
                  'y s i w', {
                    input: '<'
                  }
                ], {
                  text: "< abc >"
                });
                set({
                  textC: "|abc"
                });
                return ensure([
                  'y s i w', {
                    input: 'a'
                  }
                ], {
                  text: "<abc>"
                });
              });
            });
            return describe("aliased pair-chars are set to add space", function() {
              beforeEach(function() {
                return settings.set('charactersToAddSpaceOnSurround', ['b', 'B', 'r', 'a']);
              });
              return it("distinctively handle", function() {
                set({
                  textC: "|abc"
                });
                ensure([
                  'y s i w', {
                    input: '('
                  }
                ], {
                  text: "(abc)"
                });
                set({
                  textC: "|abc"
                });
                ensure([
                  'y s i w', {
                    input: 'b'
                  }
                ], {
                  text: "( abc )"
                });
                set({
                  textC: "|abc"
                });
                ensure([
                  'y s i w', {
                    input: '{'
                  }
                ], {
                  text: "{abc}"
                });
                set({
                  textC: "|abc"
                });
                ensure([
                  'y s i w', {
                    input: 'B'
                  }
                ], {
                  text: "{ abc }"
                });
                set({
                  textC: "|abc"
                });
                ensure([
                  'y s i w', {
                    input: '['
                  }
                ], {
                  text: "[abc]"
                });
                set({
                  textC: "|abc"
                });
                ensure([
                  'y s i w', {
                    input: 'r'
                  }
                ], {
                  text: "[ abc ]"
                });
                set({
                  textC: "|abc"
                });
                ensure([
                  'y s i w', {
                    input: '<'
                  }
                ], {
                  text: "<abc>"
                });
                set({
                  textC: "|abc"
                });
                return ensure([
                  'y s i w', {
                    input: 'a'
                  }
                ], {
                  text: "< abc >"
                });
              });
            });
          });
        });
      });
      describe('map-surround', function() {
        beforeEach(function() {
          jasmine.attachToDOM(editorElement);
          set({
            textC: "\n|apple\npairs tomato\norange\nmilk\n"
          });
          return atom.keymaps.add("ms", {
            'atom-text-editor.vim-mode-plus:not(.insert-mode)': {
              'm s': 'vim-mode-plus:map-surround'
            },
            'atom-text-editor.vim-mode-plus.visual-mode': {
              'm s': 'vim-mode-plus:map-surround'
            }
          });
        });
        it("surround text for each word in target case-1", function() {
          return ensure('m s i p (', {
            textC: "\n|(apple)\n(pairs) (tomato)\n(orange)\n(milk)\n"
          });
        });
        it("surround text for each word in target case-2", function() {
          set({
            cursor: [2, 1]
          });
          return ensure('m s i l <', {
            textC: "\napple\n<|pairs> <tomato>\norange\nmilk\n"
          });
        });
        return it("surround text for each word in visual selection", function() {
          return ensure('v i p m s "', {
            textC: "\n\"apple\"\n\"pairs\" \"tomato\"\n\"orange\"\n\"mil|k\"\n"
          });
        });
      });
      describe('delete surround', function() {
        beforeEach(function() {
          return set({
            cursor: [1, 8]
          });
        });
        it("delete surrounded chars and repeatable", function() {
          ensure([
            'd S', {
              input: '['
            }
          ], {
            text: "apple\npairs: brackets\npairs: [brackets]\n( multi\n  line )"
          });
          return ensure('j l .', {
            text: "apple\npairs: brackets\npairs: brackets\n( multi\n  line )"
          });
        });
        it("delete surrounded chars expanded to multi-line", function() {
          set({
            cursor: [3, 1]
          });
          return ensure([
            'd S', {
              input: '('
            }
          ], {
            text: "apple\npairs: [brackets]\npairs: [brackets]\n multi\n  line "
          });
        });
        it("delete surrounded chars and trim padding spaces for non-identical pair-char", function() {
          set({
            text: "( apple )\n{  orange   }\n",
            cursor: [0, 0]
          });
          ensure([
            'd S', {
              input: '('
            }
          ], {
            text: "apple\n{  orange   }\n"
          });
          return ensure([
            'j d S', {
              input: '{'
            }
          ], {
            text: "apple\norange\n"
          });
        });
        it("delete surrounded chars and NOT trim padding spaces for identical pair-char", function() {
          set({
            text: "` apple `\n\"  orange   \"\n",
            cursor: [0, 0]
          });
          ensure([
            'd S', {
              input: '`'
            }
          ], {
            text_: '_apple_\n"__orange___"\n'
          });
          return ensure([
            'j d S', {
              input: '"'
            }
          ], {
            text_: "_apple_\n__orange___\n"
          });
        });
        return it("delete surrounded for multi-line but dont affect code layout", function() {
          set({
            cursor: [0, 34],
            text: "highlightRanges @editor, range, {\n  timeout: timeout\n  hello: world\n}"
          });
          return ensure([
            'd S', {
              input: '{'
            }
          ], {
            text: ["highlightRanges @editor, range, ", "  timeout: timeout", "  hello: world", ""].join("\n")
          });
        });
      });
      describe('change surround', function() {
        beforeEach(function() {
          return set({
            text: "(apple)\n(grape)\n<lemmon>\n{orange}",
            cursor: [0, 1]
          });
        });
        it("change surrounded chars and repeatable", function() {
          ensure([
            'c S', {
              input: '(['
            }
          ], {
            text: "[apple]\n(grape)\n<lemmon>\n{orange}"
          });
          return ensure('j l .', {
            text: "[apple]\n[grape]\n<lemmon>\n{orange}"
          });
        });
        it("change surrounded chars", function() {
          ensure([
            'j j c S', {
              input: '<"'
            }
          ], {
            text: "(apple)\n(grape)\n\"lemmon\"\n{orange}"
          });
          return ensure([
            'j l c S', {
              input: '{!'
            }
          ], {
            text: "(apple)\n(grape)\n\"lemmon\"\n!orange!"
          });
        });
        it("change surrounded for multi-line but dont affect code layout", function() {
          set({
            cursor: [0, 34],
            text: "highlightRanges @editor, range, {\n  timeout: timeout\n  hello: world\n}"
          });
          return ensure([
            'c S', {
              input: '{('
            }
          ], {
            text: "highlightRanges @editor, range, (\n  timeout: timeout\n  hello: world\n)"
          });
        });
        return describe('charactersToAddSpaceOnSurround setting', function() {
          var ensureChangeSurround;
          ensureChangeSurround = function(inputKeystrokes, options) {
            var keystrokes;
            set({
              text: options.initialText,
              cursor: [0, 0]
            });
            delete options.initialText;
            keystrokes = ['c S'].concat({
              input: inputKeystrokes
            });
            return ensure(keystrokes, options);
          };
          beforeEach(function() {
            return settings.set('charactersToAddSpaceOnSurround', ['(', '{', '[']);
          });
          describe('when input char is in charactersToAddSpaceOnSurround', function() {
            describe('single line text', function() {
              return it("add single space around pair regardless of exsiting inner text", function() {
                ensureChangeSurround('({', {
                  initialText: "(apple)",
                  text: "{ apple }"
                });
                ensureChangeSurround('({', {
                  initialText: "( apple )",
                  text: "{ apple }"
                });
                return ensureChangeSurround('({', {
                  initialText: "(  apple  )",
                  text: "{ apple }"
                });
              });
            });
            return describe('multi line text', function() {
              return it("don't sadd single space around pair", function() {
                return ensureChangeSurround('({', {
                  initialText: "(\napple\n)",
                  text: "{\napple\n}"
                });
              });
            });
          });
          return describe('when first input char is not in charactersToAddSpaceOnSurround', function() {
            it("remove surrounding space of inner text for identical pair-char", function() {
              ensureChangeSurround('(}', {
                initialText: "(apple)",
                text: "{apple}"
              });
              ensureChangeSurround('(}', {
                initialText: "( apple )",
                text: "{apple}"
              });
              return ensureChangeSurround('(}', {
                initialText: "(  apple  )",
                text: "{apple}"
              });
            });
            return it("doesn't remove surrounding space of inner text for non-identical pair-char", function() {
              ensureChangeSurround('"`', {
                initialText: '"apple"',
                text: "`apple`"
              });
              ensureChangeSurround('"`', {
                initialText: '"  apple  "',
                text: "`  apple  `"
              });
              return ensureChangeSurround("\"'", {
                initialText: '"  apple  "',
                text: "'  apple  '"
              });
            });
          });
        });
      });
      describe('surround-word', function() {
        beforeEach(function() {
          return atom.keymaps.add("surround-test", {
            'atom-text-editor.vim-mode-plus.normal-mode': {
              'y s w': 'vim-mode-plus:surround-word'
            }
          });
        });
        it("surround a word with ( and repeatable", function() {
          ensure([
            'y s w', {
              input: '('
            }
          ], {
            textC: "|(apple)\npairs: [brackets]\npairs: [brackets]\n( multi\n  line )"
          });
          return ensure('j .', {
            textC: "(apple)\n|(pairs): [brackets]\npairs: [brackets]\n( multi\n  line )"
          });
        });
        return it("surround a word with { and repeatable", function() {
          ensure([
            'y s w', {
              input: '{'
            }
          ], {
            textC: "|{apple}\npairs: [brackets]\npairs: [brackets]\n( multi\n  line )"
          });
          return ensure('j .', {
            textC: "{apple}\n|{pairs}: [brackets]\npairs: [brackets]\n( multi\n  line )"
          });
        });
      });
      describe('delete-surround-any-pair', function() {
        beforeEach(function() {
          return set({
            textC: "apple\n(pairs: [|brackets])\n{pairs \"s\" [brackets]}\n( multi\n  line )"
          });
        });
        it("delete surrounded any pair found and repeatable", function() {
          ensure('d s', {
            text: 'apple\n(pairs: brackets)\n{pairs "s" [brackets]}\n( multi\n  line )'
          });
          return ensure('.', {
            text: 'apple\npairs: brackets\n{pairs "s" [brackets]}\n( multi\n  line )'
          });
        });
        it("delete surrounded any pair found with skip pair out of cursor and repeatable", function() {
          set({
            cursor: [2, 14]
          });
          ensure('d s', {
            text: 'apple\n(pairs: [brackets])\n{pairs "s" brackets}\n( multi\n  line )'
          });
          ensure('.', {
            text: 'apple\n(pairs: [brackets])\npairs "s" brackets\n( multi\n  line )'
          });
          return ensure('.', {
            text: 'apple\n(pairs: [brackets])\npairs "s" brackets\n( multi\n  line )'
          });
        });
        return it("delete surrounded chars expanded to multi-line", function() {
          set({
            cursor: [3, 1]
          });
          return ensure('d s', {
            text: 'apple\n(pairs: [brackets])\n{pairs "s" [brackets]}\n multi\n  line '
          });
        });
      });
      describe('delete-surround-any-pair-allow-forwarding', function() {
        beforeEach(function() {
          atom.keymaps.add("keymaps-for-surround", {
            'atom-text-editor.vim-mode-plus.normal-mode': {
              'd s': 'vim-mode-plus:delete-surround-any-pair-allow-forwarding'
            }
          });
          return settings.set('stayOnTransformString', true);
        });
        return it("[1] single line", function() {
          set({
            textC: "|___(inner)\n___(inner)"
          });
          ensure('d s', {
            textC: "|___inner\n___(inner)"
          });
          return ensure('j .', {
            textC: "___inner\n|___inner"
          });
        });
      });
      describe('change-surround-any-pair', function() {
        beforeEach(function() {
          return set({
            textC: "(|apple)\n(grape)\n<lemmon>\n{orange}"
          });
        });
        return it("change any surrounded pair found and repeatable", function() {
          ensure([
            'c s', {
              input: '<'
            }
          ], {
            textC: "|<apple>\n(grape)\n<lemmon>\n{orange}"
          });
          ensure('j .', {
            textC: "<apple>\n|<grape>\n<lemmon>\n{orange}"
          });
          return ensure('j j .', {
            textC: "<apple>\n<grape>\n<lemmon>\n|<orange>"
          });
        });
      });
      return describe('change-surround-any-pair-allow-forwarding', function() {
        beforeEach(function() {
          atom.keymaps.add("keymaps-for-surround", {
            'atom-text-editor.vim-mode-plus.normal-mode': {
              'c s': 'vim-mode-plus:change-surround-any-pair-allow-forwarding'
            }
          });
          return settings.set('stayOnTransformString', true);
        });
        return it("[1] single line", function() {
          set({
            textC: "|___(inner)\n___(inner)"
          });
          ensure([
            'c s', {
              input: '<'
            }
          ], {
            textC: "|___<inner>\n___(inner)"
          });
          return ensure('j .', {
            textC: "___<inner>\n|___<inner>"
          });
        });
      });
    });
    describe('ReplaceWithRegister', function() {
      var originalText;
      originalText = null;
      beforeEach(function() {
        atom.keymaps.add("test", {
          'atom-text-editor.vim-mode-plus:not(.insert-mode)': {
            '_': 'vim-mode-plus:replace-with-register'
          }
        });
        originalText = "abc def 'aaa'\nhere (parenthesis)\nhere (parenthesis)";
        set({
          text: originalText,
          cursor: [0, 9]
        });
        set({
          register: {
            '"': {
              text: 'default register',
              type: 'characterwise'
            }
          }
        });
        return set({
          register: {
            'a': {
              text: 'A register',
              type: 'characterwise'
            }
          }
        });
      });
      it("replace selection with regisgter's content", function() {
        ensure('v i w', {
          selectedText: 'aaa'
        });
        return ensure('_', {
          mode: 'normal',
          text: originalText.replace('aaa', 'default register')
        });
      });
      it("replace text object with regisgter's content", function() {
        set({
          cursor: [1, 6]
        });
        return ensure('_ i (', {
          mode: 'normal',
          text: originalText.replace('parenthesis', 'default register')
        });
      });
      it("can repeat", function() {
        set({
          cursor: [1, 6]
        });
        return ensure('_ i ( j .', {
          mode: 'normal',
          text: originalText.replace(/parenthesis/g, 'default register')
        });
      });
      return it("can use specified register to replace with", function() {
        set({
          cursor: [1, 6]
        });
        return ensure([
          '"', {
            input: 'a'
          }, '_ i ('
        ], {
          mode: 'normal',
          text: originalText.replace('parenthesis', 'A register')
        });
      });
    });
    describe('SwapWithRegister', function() {
      var originalText;
      originalText = null;
      beforeEach(function() {
        atom.keymaps.add("test", {
          'atom-text-editor.vim-mode-plus:not(.insert-mode)': {
            'g p': 'vim-mode-plus:swap-with-register'
          }
        });
        originalText = "abc def 'aaa'\nhere (111)\nhere (222)";
        set({
          text: originalText,
          cursor: [0, 9]
        });
        set({
          register: {
            '"': {
              text: 'default register',
              type: 'characterwise'
            }
          }
        });
        return set({
          register: {
            'a': {
              text: 'A register',
              type: 'characterwise'
            }
          }
        });
      });
      it("swap selection with regisgter's content", function() {
        ensure('v i w', {
          selectedText: 'aaa'
        });
        return ensure('g p', {
          mode: 'normal',
          text: originalText.replace('aaa', 'default register'),
          register: {
            '"': {
              text: 'aaa'
            }
          }
        });
      });
      it("swap text object with regisgter's content", function() {
        set({
          cursor: [1, 6]
        });
        return ensure('g p i (', {
          mode: 'normal',
          text: originalText.replace('111', 'default register'),
          register: {
            '"': {
              text: '111'
            }
          }
        });
      });
      it("can repeat", function() {
        var updatedText;
        set({
          cursor: [1, 6]
        });
        updatedText = "abc def 'aaa'\nhere (default register)\nhere (111)";
        return ensure('g p i ( j .', {
          mode: 'normal',
          text: updatedText,
          register: {
            '"': {
              text: '222'
            }
          }
        });
      });
      return it("can use specified register to swap with", function() {
        set({
          cursor: [1, 6]
        });
        return ensure([
          '"', {
            input: 'a'
          }, 'g p i ('
        ], {
          mode: 'normal',
          text: originalText.replace('111', 'A register'),
          register: {
            'a': {
              text: '111'
            }
          }
        });
      });
    });
    describe("Join and it's family", function() {
      beforeEach(function() {
        return set({
          textC_: "__0|12\n__345\n__678\n__9ab\n"
        });
      });
      describe("Join", function() {
        it("joins lines with triming leading whitespace", function() {
          ensure('J', {
            textC_: "__012| 345\n__678\n__9ab\n"
          });
          ensure('.', {
            textC_: "__012 345| 678\n__9ab\n"
          });
          ensure('.', {
            textC_: "__012 345 678| 9ab\n"
          });
          ensure('u', {
            textC_: "__012 345| 678\n__9ab\n"
          });
          ensure('u', {
            textC_: "__012| 345\n__678\n__9ab\n"
          });
          return ensure('u', {
            textC_: "__0|12\n__345\n__678\n__9ab\n"
          });
        });
        it("joins do nothing when it cannot join any more", function() {
          return ensure('1 0 0 J', {
            textC_: "  012 345 678 9a|b\n"
          });
        });
        return it("joins do nothing when it cannot join any more", function() {
          ensure('J J J', {
            textC_: "  012 345 678| 9ab\n"
          });
          ensure('J', {
            textC_: "  012 345 678 9a|b"
          });
          return ensure('J', {
            textC_: "  012 345 678 9a|b"
          });
        });
      });
      describe("JoinWithKeepingSpace", function() {
        beforeEach(function() {
          return atom.keymaps.add("test", {
            'atom-text-editor.vim-mode-plus:not(.insert-mode)': {
              'g J': 'vim-mode-plus:join-with-keeping-space'
            }
          });
        });
        return it("joins lines without triming leading whitespace", function() {
          ensure('g J', {
            textC_: "__0|12__345\n__678\n__9ab\n"
          });
          ensure('.', {
            textC_: "__0|12__345__678\n__9ab\n"
          });
          ensure('u u', {
            textC_: "__0|12\n__345\n__678\n__9ab\n"
          });
          return ensure('4 g J', {
            textC_: "__0|12__345__678__9ab\n"
          });
        });
      });
      describe("JoinByInput", function() {
        beforeEach(function() {
          return atom.keymaps.add("test", {
            'atom-text-editor.vim-mode-plus:not(.insert-mode)': {
              'g J': 'vim-mode-plus:join-by-input'
            }
          });
        });
        return it("joins lines by char from user with triming leading whitespace", function() {
          ensure('g J : : enter', {
            textC_: "__0|12::345\n__678\n__9ab\n"
          });
          ensure('.', {
            textC_: "__0|12::345::678\n__9ab\n"
          });
          ensure('u u', {
            textC_: "__0|12\n__345\n__678\n__9ab\n"
          });
          return ensure('4 g J : : enter', {
            textC_: "__0|12::345::678::9ab\n"
          });
        });
      });
      return describe("JoinByInputWithKeepingSpace", function() {
        beforeEach(function() {
          return atom.keymaps.add("test", {
            'atom-text-editor.vim-mode-plus:not(.insert-mode)': {
              'g J': 'vim-mode-plus:join-by-input-with-keeping-space'
            }
          });
        });
        return it("joins lines by char from user without triming leading whitespace", function() {
          ensure('g J : : enter', {
            textC_: "__0|12::__345\n__678\n__9ab\n"
          });
          ensure('.', {
            textC_: "__0|12::__345::__678\n__9ab\n"
          });
          ensure('u u', {
            textC_: "__0|12\n__345\n__678\n__9ab\n"
          });
          return ensure('4 g J : : enter', {
            textC_: "__0|12::__345::__678::__9ab\n"
          });
        });
      });
    });
    describe('ToggleLineComments', function() {
      var oldGrammar, originalText, ref2;
      ref2 = [], oldGrammar = ref2[0], originalText = ref2[1];
      beforeEach(function() {
        waitsForPromise(function() {
          return atom.packages.activatePackage('language-coffee-script');
        });
        return runs(function() {
          var grammar;
          oldGrammar = editor.getGrammar();
          grammar = atom.grammars.grammarForScopeName('source.coffee');
          editor.setGrammar(grammar);
          originalText = "class Base\n  constructor: (args) ->\n    pivot = items.shift()\n    left = []\n    right = []\n\nconsole.log \"hello\"";
          return set({
            text: originalText
          });
        });
      });
      afterEach(function() {
        return editor.setGrammar(oldGrammar);
      });
      it('toggle comment for textobject for indent and repeatable', function() {
        set({
          cursor: [2, 0]
        });
        ensure('g / i i', {
          text: "class Base\n  constructor: (args) ->\n    # pivot = items.shift()\n    # left = []\n    # right = []\n\nconsole.log \"hello\""
        });
        return ensure('.', {
          text: originalText
        });
      });
      return it('toggle comment for textobject for paragraph and repeatable', function() {
        set({
          cursor: [2, 0]
        });
        ensure('g / i p', {
          text: "# class Base\n#   constructor: (args) ->\n#     pivot = items.shift()\n#     left = []\n#     right = []\n\nconsole.log \"hello\""
        });
        return ensure('.', {
          text: originalText
        });
      });
    });
    describe("SplitString, SplitStringWithKeepingSplitter", function() {
      beforeEach(function() {
        atom.keymaps.add("test", {
          'atom-text-editor.vim-mode-plus:not(.insert-mode)': {
            'g /': 'vim-mode-plus:split-string',
            'g ?': 'vim-mode-plus:split-string-with-keeping-splitter'
          }
        });
        return set({
          textC: "|a:b:c\nd:e:f\n"
        });
      });
      describe("SplitString", function() {
        return it("split string into lines", function() {
          ensure("g / : enter", {
            textC: "|a\nb\nc\nd:e:f\n"
          });
          return ensure("G .", {
            textC: "a\nb\nc\n|d\ne\nf\n"
          });
        });
      });
      return describe("SplitStringWithKeepingSplitter", function() {
        return it("split string into lines without removing spliter char", function() {
          ensure("g ? : enter", {
            textC: "|a:\nb:\nc\nd:e:f\n"
          });
          return ensure("G .", {
            textC: "a:\nb:\nc\n|d:\ne:\nf\n"
          });
        });
      });
    });
    describe("SplitArguments, SplitArgumentsWithRemoveSeparator", function() {
      beforeEach(function() {
        atom.keymaps.add("test", {
          'atom-text-editor.vim-mode-plus:not(.insert-mode)': {
            'g ,': 'vim-mode-plus:split-arguments',
            'g !': 'vim-mode-plus:split-arguments-with-remove-separator'
          }
        });
        waitsForPromise(function() {
          return atom.packages.activatePackage('language-javascript');
        });
        return runs(function() {
          return set({
            grammar: 'source.js',
            text: "hello = () => {\n  {f1, f2, f3} = require('hello')\n  f1(f2(1, \"a, b, c\"), 2, (arg) => console.log(arg))\n  s = `abc def hij`\n}"
          });
        });
      });
      describe("SplitArguments", function() {
        it("split by commma with adjust indent", function() {
          set({
            cursor: [1, 3]
          });
          return ensure('g , i {', {
            textC: "hello = () => {\n  |{\n    f1,\n    f2,\n    f3\n  } = require('hello')\n  f1(f2(1, \"a, b, c\"), 2, (arg) => console.log(arg))\n  s = `abc def hij`\n}"
          });
        });
        it("split by commma with adjust indent", function() {
          set({
            cursor: [2, 5]
          });
          ensure('g , i (', {
            textC: "hello = () => {\n  {f1, f2, f3} = require('hello')\n  f1|(\n    f2(1, \"a, b, c\"),\n    2,\n    (arg) => console.log(arg)\n  )\n  s = `abc def hij`\n}"
          });
          keystroke('j w');
          return ensure('g , i (', {
            textC: "hello = () => {\n  {f1, f2, f3} = require('hello')\n  f1(\n    f2|(\n      1,\n      \"a, b, c\"\n    ),\n    2,\n    (arg) => console.log(arg)\n  )\n  s = `abc def hij`\n}"
          });
        });
        return it("split by white-space with adjust indent", function() {
          set({
            cursor: [3, 10]
          });
          return ensure('g , i `', {
            textC: "hello = () => {\n  {f1, f2, f3} = require('hello')\n  f1(f2(1, \"a, b, c\"), 2, (arg) => console.log(arg))\n  s = |`\n  abc\n  def\n  hij\n  `\n}"
          });
        });
      });
      return describe("SplitByArgumentsWithRemoveSeparator", function() {
        beforeEach(function() {});
        return it("remove splitter when split", function() {
          set({
            cursor: [1, 3]
          });
          return ensure('g ! i {', {
            textC: "hello = () => {\n  |{\n    f1\n    f2\n    f3\n  } = require('hello')\n  f1(f2(1, \"a, b, c\"), 2, (arg) => console.log(arg))\n  s = `abc def hij`\n}"
          });
        });
      });
    });
    return describe("Change Order faimliy: Reverse, Sort, SortCaseInsensitively, SortByNumber", function() {
      beforeEach(function() {
        return atom.keymaps.add("test", {
          'atom-text-editor.vim-mode-plus:not(.insert-mode)': {
            'g r': 'vim-mode-plus:reverse',
            'g s': 'vim-mode-plus:sort',
            'g S': 'vim-mode-plus:sort-by-number'
          }
        });
      });
      describe("characterwise target", function() {
        describe("Reverse", function() {
          it("[comma separated] reverse text", function() {
            set({
              textC: "   ( dog, ca|t, fish, rabbit, duck, gopher, squid )"
            });
            return ensure('g r i (', {
              textC_: "   (| squid, gopher, duck, rabbit, fish, cat, dog )"
            });
          });
          it("[comma sparated] reverse text", function() {
            set({
              textC: "   ( 'dog ca|t', 'fish rabbit', 'duck gopher squid' )"
            });
            return ensure('g r i (', {
              textC_: "   (| 'duck gopher squid', 'fish rabbit', 'dog cat' )"
            });
          });
          it("[space sparated] reverse text", function() {
            set({
              textC: "   ( dog ca|t fish rabbit duck gopher squid )"
            });
            return ensure('g r i (', {
              textC_: "   (| squid gopher duck rabbit fish cat dog )"
            });
          });
          it("[comma sparated multi-line] reverse text", function() {
            set({
              textC: "{\n  |1, 2, 3, 4,\n  5, 6,\n  7,\n  8, 9\n}"
            });
            return ensure('g r i {', {
              textC: "{\n|  9, 8, 7, 6,\n  5, 4,\n  3,\n  2, 1\n}"
            });
          });
          it("[comma sparated multi-line] keep comma followed to last entry", function() {
            set({
              textC: "[\n  |1, 2, 3, 4,\n  5, 6,\n]"
            });
            return ensure('g r i [', {
              textC: "[\n|  6, 5, 4, 3,\n  2, 1,\n]"
            });
          });
          it("[comma sparated multi-line] aware of nexted pair and quotes and escaped quote", function() {
            set({
              textC: "(\n  |\"(a, b, c)\", \"[( d e f\", test(g, h, i),\n  \"\\\"j, k, l\",\n  '\\'m, n', test(o, p),\n)"
            });
            return ensure('g r i (', {
              textC: "(\n|  test(o, p), '\\'m, n', \"\\\"j, k, l\",\n  test(g, h, i),\n  \"[( d e f\", \"(a, b, c)\",\n)"
            });
          });
          return it("[space sparated multi-line] aware of nexted pair and quotes and escaped quote", function() {
            set({
              textC_: "(\n  |\"(a, b, c)\" \"[( d e f\"      test(g, h, i)\n  \"\\\"j, k, l\"___\n  '\\'m, n'    test(o, p)\n)"
            });
            return ensure('g r i (', {
              textC_: "(\n|  test(o, p) '\\'m, n'      \"\\\"j, k, l\"\n  test(g, h, i)___\n  \"[( d e f\"    \"(a, b, c)\"\n)"
            });
          });
        });
        describe("Sort", function() {
          return it("[comma separated] sort text", function() {
            set({
              textC: "   ( dog, ca|t, fish, rabbit, duck, gopher, squid )"
            });
            return ensure('g s i (', {
              textC: "   (| cat, dog, duck, fish, gopher, rabbit, squid )"
            });
          });
        });
        return describe("SortByNumber", function() {
          return it("[comma separated] sort by number", function() {
            set({
              textC_: "___(9, 1, |10, 5)"
            });
            return ensure('g S i (', {
              textC_: "___(|1, 5, 9, 10)"
            });
          });
        });
      });
      return describe("linewise target", function() {
        beforeEach(function() {
          return set({
            textC: "|z\n\n10a\nb\na\n\n5\n1\n"
          });
        });
        describe("Reverse", function() {
          return it("reverse rows", function() {
            return ensure('g r G', {
              textC: "|1\n5\n\na\nb\n10a\n\nz\n"
            });
          });
        });
        describe("Sort", function() {
          return it("sort rows", function() {
            return ensure('g s G', {
              textC: "|\n\n1\n10a\n5\na\nb\nz\n"
            });
          });
        });
        describe("SortByNumber", function() {
          return it("sort rows numerically", function() {
            return ensure("g S G", {
              textC: "|1\n5\n10a\nz\n\nb\na\n\n"
            });
          });
        });
        return describe("SortCaseInsensitively", function() {
          beforeEach(function() {
            return atom.keymaps.add("test", {
              'atom-text-editor.vim-mode-plus:not(.insert-mode)': {
                'g s': 'vim-mode-plus:sort-case-insensitively'
              }
            });
          });
          return it("Sort rows case-insensitively", function() {
            set({
              textC: "|apple\nBeef\nAPPLE\nDOG\nbeef\nApple\nBEEF\nDog\ndog\n"
            });
            return ensure("g s G", {
              text: "apple\nApple\nAPPLE\nbeef\nBeef\nBEEF\ndog\nDog\nDOG\n"
            });
          });
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9zcGVjL29wZXJhdG9yLXRyYW5zZm9ybS1zdHJpbmctc3BlYy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLE1BQTBCLE9BQUEsQ0FBUSxlQUFSLENBQTFCLEVBQUMsNkJBQUQsRUFBYzs7RUFDZCxRQUFBLEdBQVcsT0FBQSxDQUFRLGlCQUFSOztFQUVYLFFBQUEsQ0FBUywwQkFBVCxFQUFxQyxTQUFBO0FBQ25DLFFBQUE7SUFBQSxPQUE0RCxFQUE1RCxFQUFDLGFBQUQsRUFBTSxnQkFBTixFQUFjLG1CQUFkLEVBQXlCLGdCQUF6QixFQUFpQyx1QkFBakMsRUFBZ0Q7SUFFaEQsVUFBQSxDQUFXLFNBQUE7YUFDVCxXQUFBLENBQVksU0FBQyxLQUFELEVBQVEsR0FBUjtRQUNWLFFBQUEsR0FBVztRQUNWLHdCQUFELEVBQVM7ZUFDUixhQUFELEVBQU0sbUJBQU4sRUFBYyx5QkFBZCxFQUEyQjtNQUhqQixDQUFaO0lBRFMsQ0FBWDtJQU1BLFFBQUEsQ0FBUyxrQkFBVCxFQUE2QixTQUFBO01BQzNCLFVBQUEsQ0FBVyxTQUFBO2VBQ1QsR0FBQSxDQUNFO1VBQUEsS0FBQSxFQUFPLFlBQVA7U0FERjtNQURTLENBQVg7TUFPQSxFQUFBLENBQUcsa0NBQUgsRUFBdUMsU0FBQTtRQUNyQyxNQUFBLENBQU8sR0FBUCxFQUNFO1VBQUEsS0FBQSxFQUFPLFlBQVA7U0FERjtRQUtBLE1BQUEsQ0FBTyxHQUFQLEVBQ0U7VUFBQSxLQUFBLEVBQU8sWUFBUDtTQURGO2VBTUEsTUFBQSxDQUFRLEdBQVIsRUFDRTtVQUFBLEtBQUEsRUFBTyxZQUFQO1NBREY7TUFacUMsQ0FBdkM7TUFrQkEsRUFBQSxDQUFHLGVBQUgsRUFBb0IsU0FBQTtlQUNsQixNQUFBLENBQU8sS0FBUCxFQUNFO1VBQUEsS0FBQSxFQUFP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QVQsRUFBa0MsU0FBQTtVQUNoQyxVQUFBLENBQVcsU0FBQTttQkFDVCxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQWIsQ0FBaUIsTUFBakIsRUFDRTtjQUFBLGtEQUFBLEVBQ0U7Z0JBQUEsS0FBQSxFQUFPLHVDQUFQO2VBREY7YUFERjtVQURTLENBQVg7aUJBSUEsRUFBQSxDQUFHLDhCQUFILEVBQW1DLFNBQUE7WUFDakMsR0FBQSxDQUNFO2NBQUEsS0FBQSxFQUFPLHlEQUFQO2FBREY7bUJBYUEsTUFBQSxDQUFPLE9BQVAsRUFDRTtjQUFBLElBQUEsRUFBTSx3REFBTjthQURGO1VBZGlDLENBQW5DO1FBTGdDLENBQWxDO01BcEQwQixDQUE1QjtJQTNGbUYsQ0FBckY7RUFuNUNtQyxDQUFyQztBQUhBIiwic291cmNlc0NvbnRlbnQiOlsie2dldFZpbVN0YXRlLCBkaXNwYXRjaH0gPSByZXF1aXJlICcuL3NwZWMtaGVscGVyJ1xuc2V0dGluZ3MgPSByZXF1aXJlICcuLi9saWIvc2V0dGluZ3MnXG5cbmRlc2NyaWJlIFwiT3BlcmF0b3IgVHJhbnNmb3JtU3RyaW5nXCIsIC0+XG4gIFtzZXQsIGVuc3VyZSwga2V5c3Ryb2tlLCBlZGl0b3IsIGVkaXRvckVsZW1lbnQsIHZpbVN0YXRlXSA9IFtdXG5cbiAgYmVmb3JlRWFjaCAtPlxuICAgIGdldFZpbVN0YXRlIChzdGF0ZSwgdmltKSAtPlxuICAgICAgdmltU3RhdGUgPSBzdGF0ZVxuICAgICAge2VkaXRvciwgZWRpdG9yRWxlbWVudH0gPSB2aW1TdGF0ZVxuICAgICAge3NldCwgZW5zdXJlLCBrZXlzdHJva2V9ID0gdmltXG5cbiAgZGVzY3JpYmUgJ3RoZSB+IGtleWJpbmRpbmcnLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNldFxuICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgIHxhQmNcbiAgICAgICAgfFh5WlxuICAgICAgICBcIlwiXCJcblxuICAgIGl0ICd0b2dnbGVzIHRoZSBjYXNlIGFuZCBtb3ZlcyByaWdodCcsIC0+XG4gICAgICBlbnN1cmUgJ34nLFxuICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgIEF8QmNcbiAgICAgICAgeHx5WlxuICAgICAgICBcIlwiXCJcbiAgICAgIGVuc3VyZSAnficsXG4gICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgQWJ8Y1xuICAgICAgICB4WXxaXG4gICAgICAgIFwiXCJcIlxuXG4gICAgICBlbnN1cmUgICd+JyxcbiAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICBBYnxDXG4gICAgICAgIHhZfHpcbiAgICAgICAgXCJcIlwiXG5cbiAgICBpdCAndGFrZXMgYSBjb3VudCcsIC0+XG4gICAgICBlbnN1cmUgJzQgficsXG4gICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgQWJ8Q1xuICAgICAgICB4WXx6XG4gICAgICAgIFwiXCJcIlxuXG4gICAgZGVzY3JpYmUgXCJpbiB2aXN1YWwgbW9kZVwiLCAtPlxuICAgICAgaXQgXCJ0b2dnbGVzIHRoZSBjYXNlIG9mIHRoZSBzZWxlY3RlZCB0ZXh0XCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFswLCAwXVxuICAgICAgICBlbnN1cmUgJ1YgficsIHRleHQ6ICdBYkNcXG5YeVonXG5cbiAgICBkZXNjcmliZSBcIndpdGggZyBhbmQgbW90aW9uXCIsIC0+XG4gICAgICBpdCBcInRvZ2dsZXMgdGhlIGNhc2Ugb2YgdGV4dCwgd29uJ3QgbW92ZSBjdXJzb3JcIiwgLT5cbiAgICAgICAgc2V0IHRleHRDOiBcInxhQmNcXG5YeVpcIlxuICAgICAgICBlbnN1cmUgJ2cgfiAyIGwnLCB0ZXh0QzogJ3xBYmNcXG5YeVonXG5cbiAgICAgIGl0IFwiZ35+IHRvZ2dsZXMgdGhlIGxpbmUgb2YgdGV4dCwgd29uJ3QgbW92ZSBjdXJzb3JcIiwgLT5cbiAgICAgICAgc2V0IHRleHRDOiBcImF8QmNcXG5YeVpcIlxuICAgICAgICBlbnN1cmUgJ2cgfiB+JywgdGV4dEM6ICdBfGJDXFxuWHlaJ1xuXG4gICAgICBpdCBcImd+Z34gdG9nZ2xlcyB0aGUgbGluZSBvZiB0ZXh0LCB3b24ndCBtb3ZlIGN1cnNvclwiLCAtPlxuICAgICAgICBzZXQgdGV4dEM6IFwiYXxCY1xcblh5WlwiXG4gICAgICAgIGVuc3VyZSAnZyB+IGcgficsIHRleHRDOiAnQXxiQ1xcblh5WidcblxuICBkZXNjcmliZSAndGhlIFUga2V5YmluZGluZycsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2V0XG4gICAgICAgIHRleHQ6ICdhQmNcXG5YeVonXG4gICAgICAgIGN1cnNvcjogWzAsIDBdXG5cbiAgICBpdCBcIm1ha2VzIHRleHQgdXBwZXJjYXNlIHdpdGggZyBhbmQgbW90aW9uLCBhbmQgd29uJ3QgbW92ZSBjdXJzb3JcIiwgLT5cbiAgICAgIGVuc3VyZSAnZyBVIGwnLCB0ZXh0OiAnQUJjXFxuWHlaJywgY3Vyc29yOiBbMCwgMF1cbiAgICAgIGVuc3VyZSAnZyBVIGUnLCB0ZXh0OiAnQUJDXFxuWHlaJywgY3Vyc29yOiBbMCwgMF1cbiAgICAgIHNldCBjdXJzb3I6IFsxLCAwXVxuICAgICAgZW5zdXJlICdnIFUgJCcsIHRleHQ6ICdBQkNcXG5YWVonLCBjdXJzb3I6IFsxLCAwXVxuXG4gICAgaXQgXCJtYWtlcyB0aGUgc2VsZWN0ZWQgdGV4dCB1cHBlcmNhc2UgaW4gdmlzdWFsIG1vZGVcIiwgLT5cbiAgICAgIGVuc3VyZSAnViBVJywgdGV4dDogJ0FCQ1xcblh5WidcblxuICAgIGl0IFwiZ1VVIHVwY2FzZSB0aGUgbGluZSBvZiB0ZXh0LCB3b24ndCBtb3ZlIGN1cnNvclwiLCAtPlxuICAgICAgc2V0IGN1cnNvcjogWzAsIDFdXG4gICAgICBlbnN1cmUgJ2cgVSBVJywgdGV4dDogJ0FCQ1xcblh5WicsIGN1cnNvcjogWzAsIDFdXG5cbiAgICBpdCBcImdVZ1UgdXBjYXNlIHRoZSBsaW5lIG9mIHRleHQsIHdvbid0IG1vdmUgY3Vyc29yXCIsIC0+XG4gICAgICBzZXQgY3Vyc29yOiBbMCwgMV1cbiAgICAgIGVuc3VyZSAnZyBVIGcgVScsIHRleHQ6ICdBQkNcXG5YeVonLCBjdXJzb3I6IFswLCAxXVxuXG4gIGRlc2NyaWJlICd0aGUgdSBrZXliaW5kaW5nJywgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXQgdGV4dDogJ2FCY1xcblh5WicsIGN1cnNvcjogWzAsIDBdXG5cbiAgICBpdCBcIm1ha2VzIHRleHQgbG93ZXJjYXNlIHdpdGggZyBhbmQgbW90aW9uLCBhbmQgd29uJ3QgbW92ZSBjdXJzb3JcIiwgLT5cbiAgICAgIGVuc3VyZSAnZyB1ICQnLCB0ZXh0OiAnYWJjXFxuWHlaJywgY3Vyc29yOiBbMCwgMF1cblxuICAgIGl0IFwibWFrZXMgdGhlIHNlbGVjdGVkIHRleHQgbG93ZXJjYXNlIGluIHZpc3VhbCBtb2RlXCIsIC0+XG4gICAgICBlbnN1cmUgJ1YgdScsIHRleHQ6ICdhYmNcXG5YeVonXG5cbiAgICBpdCBcImd1dSBkb3duY2FzZSB0aGUgbGluZSBvZiB0ZXh0LCB3b24ndCBtb3ZlIGN1cnNvclwiLCAtPlxuICAgICAgc2V0IGN1cnNvcjogWzAsIDFdXG4gICAgICBlbnN1cmUgJ2cgdSB1JywgdGV4dDogJ2FiY1xcblh5WicsIGN1cnNvcjogWzAsIDFdXG5cbiAgICBpdCBcImd1Z3UgZG93bmNhc2UgdGhlIGxpbmUgb2YgdGV4dCwgd29uJ3QgbW92ZSBjdXJzb3JcIiwgLT5cbiAgICAgIHNldCBjdXJzb3I6IFswLCAxXVxuICAgICAgZW5zdXJlICdnIHUgZyB1JywgdGV4dDogJ2FiY1xcblh5WicsIGN1cnNvcjogWzAsIDFdXG5cbiAgZGVzY3JpYmUgXCJ0aGUgPiBrZXliaW5kaW5nXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2V0IHRleHQ6IFwiXCJcIlxuICAgICAgICAxMjM0NVxuICAgICAgICBhYmNkZVxuICAgICAgICBBQkNERVxuICAgICAgICBcIlwiXCJcblxuICAgIGRlc2NyaWJlIFwiPiA+XCIsIC0+XG4gICAgICBkZXNjcmliZSBcImZyb20gZmlyc3QgbGluZVwiLCAtPlxuICAgICAgICBpdCBcImluZGVudHMgdGhlIGN1cnJlbnQgbGluZVwiLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFswLCAwXVxuICAgICAgICAgIGVuc3VyZSAnPiA+JyxcbiAgICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAgICAgfDEyMzQ1XG4gICAgICAgICAgICBhYmNkZVxuICAgICAgICAgICAgQUJDREVcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICBpdCBcImNvdW50IG1lYW5zIE4gbGluZSBpbmRlbnRzIGFuZCB1bmRvYWJsZSwgcmVwZWF0YWJsZVwiLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFswLCAwXVxuICAgICAgICAgIGVuc3VyZSAnMyA+ID4nLFxuICAgICAgICAgICAgdGV4dENfOiBcIlwiXCJcbiAgICAgICAgICAgIF9ffDEyMzQ1XG4gICAgICAgICAgICBfX2FiY2RlXG4gICAgICAgICAgICBfX0FCQ0RFXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICAgIGVuc3VyZSAndScsXG4gICAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICB8MTIzNDVcbiAgICAgICAgICAgIGFiY2RlXG4gICAgICAgICAgICBBQkNERVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgICBlbnN1cmUgJy4gLicsXG4gICAgICAgICAgICB0ZXh0Q186IFwiXCJcIlxuICAgICAgICAgICAgX19fX3wxMjM0NVxuICAgICAgICAgICAgX19fX2FiY2RlXG4gICAgICAgICAgICBfX19fQUJDREVcbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICBkZXNjcmliZSBcImZyb20gbGFzdCBsaW5lXCIsIC0+XG4gICAgICAgIGl0IFwiaW5kZW50cyB0aGUgY3VycmVudCBsaW5lXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzIsIDBdXG4gICAgICAgICAgZW5zdXJlICc+ID4nLFxuICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgMTIzNDVcbiAgICAgICAgICAgIGFiY2RlXG4gICAgICAgICAgICAgIHxBQkNERVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICBkZXNjcmliZSBcImluIHZpc3VhbCBtb2RlXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFswLCAwXVxuXG4gICAgICBpdCBcIlt2Q10gaW5kZW50IHNlbGVjdGVkIGxpbmVzXCIsIC0+XG4gICAgICAgIGVuc3VyZSBcInYgaiA+XCIsXG4gICAgICAgICAgbW9kZTogJ25vcm1hbCdcbiAgICAgICAgICB0ZXh0Q186IFwiXCJcIlxuICAgICAgICAgIF9ffDEyMzQ1XG4gICAgICAgICAgX19hYmNkZVxuICAgICAgICAgIEFCQ0RFXG4gICAgICAgICAgXCJcIlwiXG4gICAgICBpdCBcIlt2TF0gaW5kZW50IHNlbGVjdGVkIGxpbmVzXCIsIC0+XG4gICAgICAgIGVuc3VyZSBcIlYgPlwiLFxuICAgICAgICAgIG1vZGU6ICdub3JtYWwnXG4gICAgICAgICAgdGV4dENfOiBcIlwiXCJcbiAgICAgICAgICBfX3wxMjM0NVxuICAgICAgICAgIGFiY2RlXG4gICAgICAgICAgQUJDREVcbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgZW5zdXJlICcuJyxcbiAgICAgICAgICB0ZXh0Q186IFwiXCJcIlxuICAgICAgICAgIF9fX198MTIzNDVcbiAgICAgICAgICBhYmNkZVxuICAgICAgICAgIEFCQ0RFXG4gICAgICAgICAgXCJcIlwiXG4gICAgICBpdCBcIlt2TF0gY291bnQgbWVhbnMgTiB0aW1lcyBpbmRlbnRcIiwgLT5cbiAgICAgICAgZW5zdXJlIFwiViAzID5cIixcbiAgICAgICAgICBtb2RlOiAnbm9ybWFsJ1xuICAgICAgICAgIHRleHRDXzogXCJcIlwiXG4gICAgICAgICAgX19fX19ffDEyMzQ1XG4gICAgICAgICAgYWJjZGVcbiAgICAgICAgICBBQkNERVxuICAgICAgICAgIFwiXCJcIlxuICAgICAgICBlbnN1cmUgJy4nLFxuICAgICAgICAgIHRleHRDXzogXCJcIlwiXG4gICAgICAgICAgX19fX19fX19fX19ffDEyMzQ1XG4gICAgICAgICAgYWJjZGVcbiAgICAgICAgICBBQkNERVxuICAgICAgICAgIFwiXCJcIlxuXG4gICAgZGVzY3JpYmUgXCJpbiB2aXN1YWwgbW9kZSBhbmQgc3RheU9uVHJhbnNmb3JtU3RyaW5nIGVuYWJsZWRcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0dGluZ3Muc2V0KCdzdGF5T25UcmFuc2Zvcm1TdHJpbmcnLCB0cnVlKVxuICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMF1cblxuICAgICAgaXQgXCJpbmRlbnRzIHRoZSBjdXJycmVudCBzZWxlY3Rpb24gYW5kIGV4aXRzIHZpc3VhbCBtb2RlXCIsIC0+XG4gICAgICAgIGVuc3VyZSAndiBqID4nLFxuICAgICAgICAgIG1vZGU6ICdub3JtYWwnXG4gICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgMTIzNDVcbiAgICAgICAgICAgIHxhYmNkZVxuICAgICAgICAgIEFCQ0RFXG4gICAgICAgICAgXCJcIlwiXG4gICAgICBpdCBcIndoZW4gcmVwZWF0ZWQsIG9wZXJhdGUgb24gc2FtZSByYW5nZSB3aGVuIGN1cnNvciB3YXMgbm90IG1vdmVkXCIsIC0+XG4gICAgICAgIGVuc3VyZSAndiBqID4nLFxuICAgICAgICAgIG1vZGU6ICdub3JtYWwnXG4gICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgMTIzNDVcbiAgICAgICAgICAgIHxhYmNkZVxuICAgICAgICAgIEFCQ0RFXG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgIGVuc3VyZSAnLicsXG4gICAgICAgICAgbW9kZTogJ25vcm1hbCdcbiAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICAgIDEyMzQ1XG4gICAgICAgICAgICAgIHxhYmNkZVxuICAgICAgICAgIEFCQ0RFXG4gICAgICAgICAgXCJcIlwiXG4gICAgICBpdCBcIndoZW4gcmVwZWF0ZWQsIG9wZXJhdGUgb24gcmVsYXRpdmUgcmFuZ2UgZnJvbSBjdXJzb3IgcG9zaXRpb24gd2l0aCBzYW1lIGV4dGVudCB3aGVuIGN1cnNvciB3YXMgbW92ZWRcIiwgLT5cbiAgICAgICAgZW5zdXJlICd2IGogPicsXG4gICAgICAgICAgbW9kZTogJ25vcm1hbCdcbiAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICAxMjM0NVxuICAgICAgICAgICAgfGFiY2RlXG4gICAgICAgICAgQUJDREVcbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgZW5zdXJlICdsIC4nLFxuICAgICAgICAgIG1vZGU6ICdub3JtYWwnXG4gICAgICAgICAgdGV4dENfOiBcIlwiXCJcbiAgICAgICAgICBfXzEyMzQ1XG4gICAgICAgICAgX19fX2F8YmNkZVxuICAgICAgICAgIF9fQUJDREVcbiAgICAgICAgICBcIlwiXCJcblxuICBkZXNjcmliZSBcInRoZSA8IGtleWJpbmRpbmdcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXRcbiAgICAgICAgdGV4dENfOiBcIlwiXCJcbiAgICAgICAgfF9fMTIzNDVcbiAgICAgICAgX19hYmNkZVxuICAgICAgICBBQkNERVxuICAgICAgICBcIlwiXCJcblxuICAgIGRlc2NyaWJlIFwid2hlbiBmb2xsb3dlZCBieSBhIDxcIiwgLT5cbiAgICAgIGl0IFwiaW5kZW50cyB0aGUgY3VycmVudCBsaW5lXCIsIC0+XG4gICAgICAgIGVuc3VyZSAnPCA8JyxcbiAgICAgICAgICB0ZXh0Q186IFwiXCJcIlxuICAgICAgICAgIHwxMjM0NVxuICAgICAgICAgIF9fYWJjZGVcbiAgICAgICAgICBBQkNERVxuICAgICAgICAgIFwiXCJcIlxuXG4gICAgZGVzY3JpYmUgXCJ3aGVuIGZvbGxvd2VkIGJ5IGEgcmVwZWF0aW5nIDxcIiwgLT5cbiAgICAgIGl0IFwiaW5kZW50cyBtdWx0aXBsZSBsaW5lcyBhdCBvbmNlIGFuZCB1bmRvYWJsZVwiLCAtPlxuICAgICAgICBlbnN1cmUgJzIgPCA8JyxcbiAgICAgICAgICB0ZXh0Q186IFwiXCJcIlxuICAgICAgICAgIHwxMjM0NVxuICAgICAgICAgIGFiY2RlXG4gICAgICAgICAgQUJDREVcbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgZW5zdXJlICd1JyxcbiAgICAgICAgICB0ZXh0Q186IFwiXCJcIlxuICAgICAgICAgIHxfXzEyMzQ1XG4gICAgICAgICAgX19hYmNkZVxuICAgICAgICAgIEFCQ0RFXG4gICAgICAgICAgXCJcIlwiXG5cbiAgICBkZXNjcmliZSBcImluIHZpc3VhbCBtb2RlXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHRDXzogXCJcIlwiXG4gICAgICAgICAgfF9fX19fXzEyMzQ1XG4gICAgICAgICAgX19fX19fYWJjZGVcbiAgICAgICAgICBBQkNERVxuICAgICAgICAgIFwiXCJcIlxuXG4gICAgICBpdCBcImNvdW50IG1lYW5zIE4gdGltZXMgb3V0ZGVudFwiLCAtPlxuICAgICAgICBlbnN1cmUgJ1YgaiAyIDwnLFxuICAgICAgICAgIHRleHRDXzogXCJcIlwiXG4gICAgICAgICAgX198MTIzNDVcbiAgICAgICAgICBfX2FiY2RlXG4gICAgICAgICAgQUJDREVcbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgIyBUaGlzIGlzIG5vdCBpZGVhbCBjdXJzb3IgcG9zaXRpb24sIGJ1dCBjdXJyZW50IGxpbWl0YXRpb24uXG4gICAgICAgICMgU2luY2UgaW5kZW50IGRlcGVuZGluZyBvbiBBdG9tJ3Mgc2VsZWN0aW9uLmluZGVudFNlbGVjdGVkUm93cygpXG4gICAgICAgICMgSW1wbGVtZW50aW5nIGl0IHZtcCBpbmRlcGVuZGVudGx5IHNvbHZlIGlzc3VlLCBidXQgSSBoYXZlIGFub3RoZXIgaWRlYSBhbmQgd2FudCB0byB1c2UgQXRvbSdzIG9uZSBub3cuXG4gICAgICAgIGVuc3VyZSAndScsXG4gICAgICAgICAgdGV4dENfOiBcIlwiXCJcbiAgICAgICAgICBfX19fX18xMjM0NVxuICAgICAgICAgIHxfX19fX19hYmNkZVxuICAgICAgICAgIEFCQ0RFXG4gICAgICAgICAgXCJcIlwiXG5cbiAgZGVzY3JpYmUgXCJ0aGUgPSBrZXliaW5kaW5nXCIsIC0+XG4gICAgb2xkR3JhbW1hciA9IFtdXG5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAgICAgYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoJ2xhbmd1YWdlLWphdmFzY3JpcHQnKVxuXG4gICAgICBvbGRHcmFtbWFyID0gZWRpdG9yLmdldEdyYW1tYXIoKVxuICAgICAgc2V0IHRleHQ6IFwiZm9vXFxuICBiYXJcXG4gIGJhelwiLCBjdXJzb3I6IFsxLCAwXVxuXG5cbiAgICBkZXNjcmliZSBcIndoZW4gdXNlZCBpbiBhIHNjb3BlIHRoYXQgc3VwcG9ydHMgYXV0by1pbmRlbnRcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAganNHcmFtbWFyID0gYXRvbS5ncmFtbWFycy5ncmFtbWFyRm9yU2NvcGVOYW1lKCdzb3VyY2UuanMnKVxuICAgICAgICBlZGl0b3Iuc2V0R3JhbW1hcihqc0dyYW1tYXIpXG5cbiAgICAgIGFmdGVyRWFjaCAtPlxuICAgICAgICBlZGl0b3Iuc2V0R3JhbW1hcihvbGRHcmFtbWFyKVxuXG4gICAgICBkZXNjcmliZSBcIndoZW4gZm9sbG93ZWQgYnkgYSA9XCIsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBrZXlzdHJva2UgJz0gPSdcblxuICAgICAgICBpdCBcImluZGVudHMgdGhlIGN1cnJlbnQgbGluZVwiLCAtPlxuICAgICAgICAgIGV4cGVjdChlZGl0b3IuaW5kZW50YXRpb25Gb3JCdWZmZXJSb3coMSkpLnRvQmUgMFxuXG4gICAgICBkZXNjcmliZSBcIndoZW4gZm9sbG93ZWQgYnkgYSByZXBlYXRpbmcgPVwiLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAga2V5c3Ryb2tlICcyID0gPSdcblxuICAgICAgICBpdCBcImF1dG9pbmRlbnRzIG11bHRpcGxlIGxpbmVzIGF0IG9uY2VcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgdGV4dDogXCJmb29cXG5iYXJcXG5iYXpcIiwgY3Vyc29yOiBbMSwgMF1cblxuICAgICAgICBkZXNjcmliZSBcInVuZG8gYmVoYXZpb3JcIiwgLT5cbiAgICAgICAgICBpdCBcImluZGVudHMgYm90aCBsaW5lc1wiLCAtPlxuICAgICAgICAgICAgZW5zdXJlICd1JywgdGV4dDogXCJmb29cXG4gIGJhclxcbiAgYmF6XCJcblxuICBkZXNjcmliZSAnQ2FtZWxDYXNlJywgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXRcbiAgICAgICAgdGV4dDogJ3ZpbS1tb2RlXFxuYXRvbS10ZXh0LWVkaXRvclxcbidcbiAgICAgICAgY3Vyc29yOiBbMCwgMF1cblxuICAgIGl0IFwidHJhbnNmb3JtIHRleHQgYnkgbW90aW9uIGFuZCByZXBlYXRhYmxlXCIsIC0+XG4gICAgICBlbnN1cmUgJ2cgQyAkJywgdGV4dDogJ3ZpbU1vZGVcXG5hdG9tLXRleHQtZWRpdG9yXFxuJywgY3Vyc29yOiBbMCwgMF1cbiAgICAgIGVuc3VyZSAnaiAuJywgdGV4dDogJ3ZpbU1vZGVcXG5hdG9tVGV4dEVkaXRvclxcbicsIGN1cnNvcjogWzEsIDBdXG5cbiAgICBpdCBcInRyYW5zZm9ybSBzZWxlY3Rpb25cIiwgLT5cbiAgICAgIGVuc3VyZSAnViBqIGcgQycsIHRleHQ6ICd2aW1Nb2RlXFxuYXRvbVRleHRFZGl0b3JcXG4nLCBjdXJzb3I6IFswLCAwXVxuXG4gICAgaXQgXCJyZXBlYXRpbmcgdHdpY2Ugd29ya3Mgb24gY3VycmVudC1saW5lIGFuZCB3b24ndCBtb3ZlIGN1cnNvclwiLCAtPlxuICAgICAgZW5zdXJlICdsIGcgQyBnIEMnLCB0ZXh0OiAndmltTW9kZVxcbmF0b20tdGV4dC1lZGl0b3JcXG4nLCBjdXJzb3I6IFswLCAxXVxuXG4gIGRlc2NyaWJlICdQYXNjYWxDYXNlJywgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBhdG9tLmtleW1hcHMuYWRkIFwidGVzdFwiLFxuICAgICAgICAnYXRvbS10ZXh0LWVkaXRvci52aW0tbW9kZS1wbHVzOm5vdCguaW5zZXJ0LW1vZGUpJzpcbiAgICAgICAgICAnZyBDJzogJ3ZpbS1tb2RlLXBsdXM6cGFzY2FsLWNhc2UnXG5cbiAgICAgIHNldFxuICAgICAgICB0ZXh0OiAndmltLW1vZGVcXG5hdG9tLXRleHQtZWRpdG9yXFxuJ1xuICAgICAgICBjdXJzb3I6IFswLCAwXVxuXG4gICAgaXQgXCJ0cmFuc2Zvcm0gdGV4dCBieSBtb3Rpb24gYW5kIHJlcGVhdGFibGVcIiwgLT5cbiAgICAgIGVuc3VyZSAnZyBDICQnLCB0ZXh0OiAnVmltTW9kZVxcbmF0b20tdGV4dC1lZGl0b3JcXG4nLCBjdXJzb3I6IFswLCAwXVxuICAgICAgZW5zdXJlICdqIC4nLCB0ZXh0OiAnVmltTW9kZVxcbkF0b21UZXh0RWRpdG9yXFxuJywgY3Vyc29yOiBbMSwgMF1cblxuICAgIGl0IFwidHJhbnNmb3JtIHNlbGVjdGlvblwiLCAtPlxuICAgICAgZW5zdXJlICdWIGogZyBDJywgdGV4dDogJ1ZpbU1vZGVcXG5hdG9tVGV4dEVkaXRvclxcbicsIGN1cnNvcjogWzAsIDBdXG5cbiAgICBpdCBcInJlcGVhdGluZyB0d2ljZSB3b3JrcyBvbiBjdXJyZW50LWxpbmUgYW5kIHdvbid0IG1vdmUgY3Vyc29yXCIsIC0+XG4gICAgICBlbnN1cmUgJ2wgZyBDIGcgQycsIHRleHQ6ICdWaW1Nb2RlXFxuYXRvbS10ZXh0LWVkaXRvclxcbicsIGN1cnNvcjogWzAsIDFdXG5cbiAgZGVzY3JpYmUgJ1NuYWtlQ2FzZScsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2V0XG4gICAgICAgIHRleHQ6ICd2aW0tbW9kZVxcbmF0b20tdGV4dC1lZGl0b3JcXG4nXG4gICAgICAgIGN1cnNvcjogWzAsIDBdXG4gICAgICBhdG9tLmtleW1hcHMuYWRkIFwiZ19cIixcbiAgICAgICAgJ2F0b20tdGV4dC1lZGl0b3IudmltLW1vZGUtcGx1czpub3QoLmluc2VydC1tb2RlKSc6XG4gICAgICAgICAgJ2cgXyc6ICd2aW0tbW9kZS1wbHVzOnNuYWtlLWNhc2UnXG5cbiAgICBpdCBcInRyYW5zZm9ybSB0ZXh0IGJ5IG1vdGlvbiBhbmQgcmVwZWF0YWJsZVwiLCAtPlxuICAgICAgZW5zdXJlICdnIF8gJCcsIHRleHQ6ICd2aW1fbW9kZVxcbmF0b20tdGV4dC1lZGl0b3JcXG4nLCBjdXJzb3I6IFswLCAwXVxuICAgICAgZW5zdXJlICdqIC4nLCB0ZXh0OiAndmltX21vZGVcXG5hdG9tX3RleHRfZWRpdG9yXFxuJywgY3Vyc29yOiBbMSwgMF1cblxuICAgIGl0IFwidHJhbnNmb3JtIHNlbGVjdGlvblwiLCAtPlxuICAgICAgZW5zdXJlICdWIGogZyBfJywgdGV4dDogJ3ZpbV9tb2RlXFxuYXRvbV90ZXh0X2VkaXRvclxcbicsIGN1cnNvcjogWzAsIDBdXG5cbiAgICBpdCBcInJlcGVhdGluZyB0d2ljZSB3b3JrcyBvbiBjdXJyZW50LWxpbmUgYW5kIHdvbid0IG1vdmUgY3Vyc29yXCIsIC0+XG4gICAgICBlbnN1cmUgJ2wgZyBfIGcgXycsIHRleHQ6ICd2aW1fbW9kZVxcbmF0b20tdGV4dC1lZGl0b3JcXG4nLCBjdXJzb3I6IFswLCAxXVxuXG4gIGRlc2NyaWJlICdEYXNoQ2FzZScsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2V0XG4gICAgICAgIHRleHQ6ICd2aW1Nb2RlXFxuYXRvbV90ZXh0X2VkaXRvclxcbidcbiAgICAgICAgY3Vyc29yOiBbMCwgMF1cblxuICAgIGl0IFwidHJhbnNmb3JtIHRleHQgYnkgbW90aW9uIGFuZCByZXBlYXRhYmxlXCIsIC0+XG4gICAgICBlbnN1cmUgJ2cgLSAkJywgdGV4dDogJ3ZpbS1tb2RlXFxuYXRvbV90ZXh0X2VkaXRvclxcbicsIGN1cnNvcjogWzAsIDBdXG4gICAgICBlbnN1cmUgJ2ogLicsIHRleHQ6ICd2aW0tbW9kZVxcbmF0b20tdGV4dC1lZGl0b3JcXG4nLCBjdXJzb3I6IFsxLCAwXVxuXG4gICAgaXQgXCJ0cmFuc2Zvcm0gc2VsZWN0aW9uXCIsIC0+XG4gICAgICBlbnN1cmUgJ1YgaiBnIC0nLCB0ZXh0OiAndmltLW1vZGVcXG5hdG9tLXRleHQtZWRpdG9yXFxuJywgY3Vyc29yOiBbMCwgMF1cblxuICAgIGl0IFwicmVwZWF0aW5nIHR3aWNlIHdvcmtzIG9uIGN1cnJlbnQtbGluZSBhbmQgd29uJ3QgbW92ZSBjdXJzb3JcIiwgLT5cbiAgICAgIGVuc3VyZSAnbCBnIC0gZyAtJywgdGV4dDogJ3ZpbS1tb2RlXFxuYXRvbV90ZXh0X2VkaXRvclxcbicsIGN1cnNvcjogWzAsIDFdXG5cbiAgZGVzY3JpYmUgJ0NvbnZlcnRUb1NvZnRUYWInLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIGF0b20ua2V5bWFwcy5hZGQgXCJ0ZXN0XCIsXG4gICAgICAgICdhdG9tLXRleHQtZWRpdG9yLnZpbS1tb2RlLXBsdXM6bm90KC5pbnNlcnQtbW9kZSknOlxuICAgICAgICAgICdnIHRhYic6ICd2aW0tbW9kZS1wbHVzOmNvbnZlcnQtdG8tc29mdC10YWInXG5cbiAgICBkZXNjcmliZSBcImJhc2ljIGJlaGF2aW9yXCIsIC0+XG4gICAgICBpdCBcImNvbnZlcnQgdGFicyB0byBzcGFjZXNcIiwgLT5cbiAgICAgICAgZXhwZWN0KGVkaXRvci5nZXRUYWJMZW5ndGgoKSkudG9CZSgyKVxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0OiBcIlxcdHZhcjEwID1cXHRcXHQwO1wiXG4gICAgICAgICAgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgZW5zdXJlICdnIHRhYiAkJyxcbiAgICAgICAgICB0ZXh0OiBcIiAgdmFyMTAgPSAgIDA7XCJcblxuICBkZXNjcmliZSAnQ29udmVydFRvSGFyZFRhYicsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgYXRvbS5rZXltYXBzLmFkZCBcInRlc3RcIixcbiAgICAgICAgJ2F0b20tdGV4dC1lZGl0b3IudmltLW1vZGUtcGx1czpub3QoLmluc2VydC1tb2RlKSc6XG4gICAgICAgICAgJ2cgc2hpZnQtdGFiJzogJ3ZpbS1tb2RlLXBsdXM6Y29udmVydC10by1oYXJkLXRhYidcblxuICAgIGRlc2NyaWJlIFwiYmFzaWMgYmVoYXZpb3JcIiwgLT5cbiAgICAgIGl0IFwiY29udmVydCBzcGFjZXMgdG8gdGFic1wiLCAtPlxuICAgICAgICBleHBlY3QoZWRpdG9yLmdldFRhYkxlbmd0aCgpKS50b0JlKDIpXG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHQ6IFwiICB2YXIxMCA9ICAgIDA7XCJcbiAgICAgICAgICBjdXJzb3I6IFswLCAwXVxuICAgICAgICBlbnN1cmUgJ2cgc2hpZnQtdGFiICQnLFxuICAgICAgICAgIHRleHQ6IFwiXFx0dmFyMTBcXHQ9XFx0XFx0IDA7XCJcblxuICBkZXNjcmliZSAnQ29tcGFjdFNwYWNlcycsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2V0XG4gICAgICAgIGN1cnNvcjogWzAsIDBdXG5cbiAgICBkZXNjcmliZSBcImJhc2ljIGJlaGF2aW9yXCIsIC0+XG4gICAgICBpdCBcImNvbXBhdHMgbXVsdGlwbGUgc3BhY2UgaW50byBvbmVcIiwgLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dDogJ3ZhcjAgICA9ICAgMDsgdmFyMTAgICA9ICAgMTAnXG4gICAgICAgICAgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgZW5zdXJlICdnIHNwYWNlICQnLFxuICAgICAgICAgIHRleHQ6ICd2YXIwID0gMDsgdmFyMTAgPSAxMCdcbiAgICAgIGl0IFwiZG9uJ3QgYXBwbHkgY29tcGFjdGlvbiBmb3IgbGVhZGluZyBhbmQgdHJhaWxpbmcgc3BhY2VcIiwgLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dF86IFwiXCJcIlxuICAgICAgICAgIF9fX3ZhcjAgICA9ICAgMDsgdmFyMTAgICA9ICAgMTBfX19cbiAgICAgICAgICBfX192YXIxICAgPSAgIDE7IHZhcjExICAgPSAgIDExX19fXG4gICAgICAgICAgX19fdmFyMiAgID0gICAyOyB2YXIxMiAgID0gICAxMl9fX1xuXG4gICAgICAgICAgX19fdmFyNCAgID0gICA0OyB2YXIxNCAgID0gICAxNF9fX1xuICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIGN1cnNvcjogWzAsIDBdXG4gICAgICAgIGVuc3VyZSAnZyBzcGFjZSBpIHAnLFxuICAgICAgICAgIHRleHRfOiBcIlwiXCJcbiAgICAgICAgICBfX192YXIwID0gMDsgdmFyMTAgPSAxMF9fX1xuICAgICAgICAgIF9fX3ZhcjEgPSAxOyB2YXIxMSA9IDExX19fXG4gICAgICAgICAgX19fdmFyMiA9IDI7IHZhcjEyID0gMTJfX19cblxuICAgICAgICAgIF9fX3ZhcjQgICA9ICAgNDsgdmFyMTQgICA9ICAgMTRfX19cbiAgICAgICAgICBcIlwiXCJcbiAgICAgIGl0IFwiYnV0IGl0IGNvbXBhY3Qgc3BhY2VzIHdoZW4gdGFyZ2V0IGFsbCB0ZXh0IGlzIHNwYWNlc1wiLCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0OiAnMDEyMzQgICAgOTAnXG4gICAgICAgICAgY3Vyc29yOiBbMCwgNV1cbiAgICAgICAgZW5zdXJlICdnIHNwYWNlIHcnLFxuICAgICAgICAgIHRleHQ6ICcwMTIzNCA5MCdcblxuICBkZXNjcmliZSAnVHJpbVN0cmluZycsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2V0XG4gICAgICAgIHRleHQ6IFwiIHRleHQgPSBAZ2V0TmV3VGV4dCggc2VsZWN0aW9uLmdldFRleHQoKSwgc2VsZWN0aW9uICkgIFwiXG4gICAgICAgIGN1cnNvcjogWzAsIDQyXVxuXG4gICAgZGVzY3JpYmUgXCJiYXNpYyBiZWhhdmlvclwiLCAtPlxuICAgICAgaXQgXCJ0cmltIHN0cmluZyBmb3IgYS1saW5lIHRleHQgb2JqZWN0XCIsIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHRfOiBcIlwiXCJcbiAgICAgICAgICBfX19hYmNfX19cbiAgICAgICAgICBfX19kZWZfX19cbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICBjdXJzb3I6IFswLCAwXVxuICAgICAgICBlbnN1cmUgJ2cgfCBhIGwnLFxuICAgICAgICAgIHRleHRfOiBcIlwiXCJcbiAgICAgICAgICBhYmNcbiAgICAgICAgICBfX19kZWZfX19cbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgZW5zdXJlICdqIC4nLFxuICAgICAgICAgIHRleHRfOiBcIlwiXCJcbiAgICAgICAgICBhYmNcbiAgICAgICAgICBkZWZcbiAgICAgICAgICBcIlwiXCJcbiAgICAgIGl0IFwidHJpbSBzdHJpbmcgZm9yIGlubmVyLXBhcmVudGhlc2lzIHRleHQgb2JqZWN0XCIsIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHRfOiBcIlwiXCJcbiAgICAgICAgICAoICBhYmMgIClcbiAgICAgICAgICAoICBkZWYgIClcbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICBjdXJzb3I6IFswLCAwXVxuICAgICAgICBlbnN1cmUgJ2cgfCBpICgnLFxuICAgICAgICAgIHRleHRfOiBcIlwiXCJcbiAgICAgICAgICAoYWJjKVxuICAgICAgICAgICggIGRlZiAgKVxuICAgICAgICAgIFwiXCJcIlxuICAgICAgICBlbnN1cmUgJ2ogLicsXG4gICAgICAgICAgdGV4dF86IFwiXCJcIlxuICAgICAgICAgIChhYmMpXG4gICAgICAgICAgKGRlZilcbiAgICAgICAgICBcIlwiXCJcbiAgICAgIGl0IFwidHJpbSBzdHJpbmcgZm9yIGlubmVyLWFueS1wYWlyIHRleHQgb2JqZWN0XCIsIC0+XG4gICAgICAgIGF0b20ua2V5bWFwcy5hZGQgXCJ0ZXN0XCIsXG4gICAgICAgICAgJ2F0b20tdGV4dC1lZGl0b3IudmltLW1vZGUtcGx1cy5vcGVyYXRvci1wZW5kaW5nLW1vZGUsIGF0b20tdGV4dC1lZGl0b3IudmltLW1vZGUtcGx1cy52aXN1YWwtbW9kZSc6XG4gICAgICAgICAgICAnaSA7JzogICd2aW0tbW9kZS1wbHVzOmlubmVyLWFueS1wYWlyJ1xuXG4gICAgICAgIHNldCB0ZXh0XzogXCIoIFsgeyAgYWJjICB9IF0gKVwiLCBjdXJzb3I6IFswLCA4XVxuICAgICAgICBlbnN1cmUgJ2cgfCBpIDsnLCB0ZXh0XzogXCIoIFsge2FiY30gXSApXCJcbiAgICAgICAgZW5zdXJlICcyIGggLicsIHRleHRfOiBcIiggW3thYmN9XSApXCJcbiAgICAgICAgZW5zdXJlICcyIGggLicsIHRleHRfOiBcIihbe2FiY31dKVwiXG5cbiAgZGVzY3JpYmUgJ3N1cnJvdW5kJywgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBrZXltYXBzRm9yU3Vycm91bmQgPSB7XG4gICAgICAgICdhdG9tLXRleHQtZWRpdG9yLnZpbS1tb2RlLXBsdXMubm9ybWFsLW1vZGUnOlxuICAgICAgICAgICd5IHMnOiAndmltLW1vZGUtcGx1czpzdXJyb3VuZCdcbiAgICAgICAgICAnZCBzJzogJ3ZpbS1tb2RlLXBsdXM6ZGVsZXRlLXN1cnJvdW5kLWFueS1wYWlyJ1xuICAgICAgICAgICdkIFMnOiAndmltLW1vZGUtcGx1czpkZWxldGUtc3Vycm91bmQnXG4gICAgICAgICAgJ2Mgcyc6ICd2aW0tbW9kZS1wbHVzOmNoYW5nZS1zdXJyb3VuZC1hbnktcGFpcidcbiAgICAgICAgICAnYyBTJzogJ3ZpbS1tb2RlLXBsdXM6Y2hhbmdlLXN1cnJvdW5kJ1xuXG4gICAgICAgICdhdG9tLXRleHQtZWRpdG9yLnZpbS1tb2RlLXBsdXMub3BlcmF0b3ItcGVuZGluZy1tb2RlLnN1cnJvdW5kLXBlbmRpbmcnOlxuICAgICAgICAgICdzJzogJ3ZpbS1tb2RlLXBsdXM6aW5uZXItY3VycmVudC1saW5lJ1xuXG4gICAgICAgICdhdG9tLXRleHQtZWRpdG9yLnZpbS1tb2RlLXBsdXMudmlzdWFsLW1vZGUnOlxuICAgICAgICAgICdTJzogJ3ZpbS1tb2RlLXBsdXM6c3Vycm91bmQnXG4gICAgICB9XG5cbiAgICAgIGF0b20ua2V5bWFwcy5hZGQoXCJrZXltYXBzLWZvci1zdXJyb3VuZFwiLCBrZXltYXBzRm9yU3Vycm91bmQpXG5cbiAgICAgIHNldFxuICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgfGFwcGxlXG4gICAgICAgICAgcGFpcnM6IFticmFja2V0c11cbiAgICAgICAgICBwYWlyczogW2JyYWNrZXRzXVxuICAgICAgICAgICggbXVsdGlcbiAgICAgICAgICAgIGxpbmUgKVxuICAgICAgICAgIFwiXCJcIlxuXG4gICAgZGVzY3JpYmUgJ2FsaWFzIGtleW1hcCBmb3Igc3Vycm91bmQsIGNoYW5nZS1zdXJyb3VuZCwgZGVsZXRlLXN1cnJvdW5kJywgLT5cbiAgICAgIGl0IFwic3Vycm91bmQgYnkgYWxpYXNlZCBjaGFyXCIsIC0+XG4gICAgICAgIHNldCB0ZXh0QzogXCJ8YWJjXCI7IGVuc3VyZSBbJ3kgcyBpIHcnLCBpbnB1dDogJ2InXSwgdGV4dDogXCIoYWJjKVwiXG4gICAgICAgIHNldCB0ZXh0QzogXCJ8YWJjXCI7IGVuc3VyZSBbJ3kgcyBpIHcnLCBpbnB1dDogJ0InXSwgdGV4dDogXCJ7YWJjfVwiXG4gICAgICAgIHNldCB0ZXh0QzogXCJ8YWJjXCI7IGVuc3VyZSBbJ3kgcyBpIHcnLCBpbnB1dDogJ3InXSwgdGV4dDogXCJbYWJjXVwiXG4gICAgICAgIHNldCB0ZXh0QzogXCJ8YWJjXCI7IGVuc3VyZSBbJ3kgcyBpIHcnLCBpbnB1dDogJ2EnXSwgdGV4dDogXCI8YWJjPlwiXG4gICAgICBpdCBcImRlbGV0ZSBzdXJyb3VuZCBieSBhbGlhc2VkIGNoYXJcIiwgLT5cbiAgICAgICAgc2V0IHRleHRDOiBcInwoYWJjKVwiOyBlbnN1cmUgWydkIFMnLCBpbnB1dDogJ2InXSwgdGV4dDogXCJhYmNcIlxuICAgICAgICBzZXQgdGV4dEM6IFwifHthYmN9XCI7IGVuc3VyZSBbJ2QgUycsIGlucHV0OiAnQiddLCB0ZXh0OiBcImFiY1wiXG4gICAgICAgIHNldCB0ZXh0QzogXCJ8W2FiY11cIjsgZW5zdXJlIFsnZCBTJywgaW5wdXQ6ICdyJ10sIHRleHQ6IFwiYWJjXCJcbiAgICAgICAgc2V0IHRleHRDOiBcInw8YWJjPlwiOyBlbnN1cmUgWydkIFMnLCBpbnB1dDogJ2EnXSwgdGV4dDogXCJhYmNcIlxuICAgICAgaXQgXCJjaGFuZ2Ugc3Vycm91bmQgYnkgYWxpYXNlZCBjaGFyXCIsIC0+XG4gICAgICAgIHNldCB0ZXh0QzogXCJ8KGFiYylcIjsgZW5zdXJlIFsnYyBTJywgaW5wdXQ6ICdiQiddLCB0ZXh0OiBcInthYmN9XCJcbiAgICAgICAgc2V0IHRleHRDOiBcInwoYWJjKVwiOyBlbnN1cmUgWydjIFMnLCBpbnB1dDogJ2JyJ10sIHRleHQ6IFwiW2FiY11cIlxuICAgICAgICBzZXQgdGV4dEM6IFwifChhYmMpXCI7IGVuc3VyZSBbJ2MgUycsIGlucHV0OiAnYmEnXSwgdGV4dDogXCI8YWJjPlwiXG5cbiAgICAgICAgc2V0IHRleHRDOiBcInx7YWJjfVwiOyBlbnN1cmUgWydjIFMnLCBpbnB1dDogJ0JiJ10sIHRleHQ6IFwiKGFiYylcIlxuICAgICAgICBzZXQgdGV4dEM6IFwifHthYmN9XCI7IGVuc3VyZSBbJ2MgUycsIGlucHV0OiAnQnInXSwgdGV4dDogXCJbYWJjXVwiXG4gICAgICAgIHNldCB0ZXh0QzogXCJ8e2FiY31cIjsgZW5zdXJlIFsnYyBTJywgaW5wdXQ6ICdCYSddLCB0ZXh0OiBcIjxhYmM+XCJcblxuICAgICAgICBzZXQgdGV4dEM6IFwifFthYmNdXCI7IGVuc3VyZSBbJ2MgUycsIGlucHV0OiAncmInXSwgdGV4dDogXCIoYWJjKVwiXG4gICAgICAgIHNldCB0ZXh0QzogXCJ8W2FiY11cIjsgZW5zdXJlIFsnYyBTJywgaW5wdXQ6ICdyQiddLCB0ZXh0OiBcInthYmN9XCJcbiAgICAgICAgc2V0IHRleHRDOiBcInxbYWJjXVwiOyBlbnN1cmUgWydjIFMnLCBpbnB1dDogJ3JhJ10sIHRleHQ6IFwiPGFiYz5cIlxuXG4gICAgICAgIHNldCB0ZXh0QzogXCJ8PGFiYz5cIjsgZW5zdXJlIFsnYyBTJywgaW5wdXQ6ICdhYiddLCB0ZXh0OiBcIihhYmMpXCJcbiAgICAgICAgc2V0IHRleHRDOiBcInw8YWJjPlwiOyBlbnN1cmUgWydjIFMnLCBpbnB1dDogJ2FCJ10sIHRleHQ6IFwie2FiY31cIlxuICAgICAgICBzZXQgdGV4dEM6IFwifDxhYmM+XCI7IGVuc3VyZSBbJ2MgUycsIGlucHV0OiAnYXInXSwgdGV4dDogXCJbYWJjXVwiXG5cbiAgICBkZXNjcmliZSAnc3Vycm91bmQnLCAtPlxuICAgICAgaXQgXCJzdXJyb3VuZCB0ZXh0IG9iamVjdCB3aXRoICggYW5kIHJlcGVhdGFibGVcIiwgLT5cbiAgICAgICAgZW5zdXJlIFsneSBzIGkgdycsIGlucHV0OiAnKCddLFxuICAgICAgICAgIHRleHRDOiBcInwoYXBwbGUpXFxucGFpcnM6IFticmFja2V0c11cXG5wYWlyczogW2JyYWNrZXRzXVxcbiggbXVsdGlcXG4gIGxpbmUgKVwiXG4gICAgICAgIGVuc3VyZSAnaiAuJyxcbiAgICAgICAgICB0ZXh0OiBcIihhcHBsZSlcXG4ocGFpcnMpOiBbYnJhY2tldHNdXFxucGFpcnM6IFticmFja2V0c11cXG4oIG11bHRpXFxuICBsaW5lIClcIlxuICAgICAgaXQgXCJzdXJyb3VuZCB0ZXh0IG9iamVjdCB3aXRoIHsgYW5kIHJlcGVhdGFibGVcIiwgLT5cbiAgICAgICAgZW5zdXJlIFsneSBzIGkgdycsIGlucHV0OiAneyddLFxuICAgICAgICAgIHRleHRDOiBcInx7YXBwbGV9XFxucGFpcnM6IFticmFja2V0c11cXG5wYWlyczogW2JyYWNrZXRzXVxcbiggbXVsdGlcXG4gIGxpbmUgKVwiXG4gICAgICAgIGVuc3VyZSAnaiAuJyxcbiAgICAgICAgICB0ZXh0QzogXCJ7YXBwbGV9XFxufHtwYWlyc306IFticmFja2V0c11cXG5wYWlyczogW2JyYWNrZXRzXVxcbiggbXVsdGlcXG4gIGxpbmUgKVwiXG4gICAgICBpdCBcInN1cnJvdW5kIGN1cnJlbnQtbGluZVwiLCAtPlxuICAgICAgICBlbnN1cmUgWyd5IHMgcycsIGlucHV0OiAneyddLFxuICAgICAgICAgIHRleHRDOiBcInx7YXBwbGV9XFxucGFpcnM6IFticmFja2V0c11cXG5wYWlyczogW2JyYWNrZXRzXVxcbiggbXVsdGlcXG4gIGxpbmUgKVwiXG4gICAgICAgIGVuc3VyZSAnaiAuJyxcbiAgICAgICAgICB0ZXh0QzogXCJ7YXBwbGV9XFxufHtwYWlyczogW2JyYWNrZXRzXX1cXG5wYWlyczogW2JyYWNrZXRzXVxcbiggbXVsdGlcXG4gIGxpbmUgKVwiXG5cbiAgICAgIGRlc2NyaWJlICdhZGp1c3RJbmRlbnRhdGlvbiB3aGVuIHN1cnJvdW5kIGxpbmV3aXNlIHRhcmdldCcsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAgICAgICAgIGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKCdsYW5ndWFnZS1qYXZhc2NyaXB0JylcbiAgICAgICAgICBydW5zIC0+XG4gICAgICAgICAgICBzZXRcbiAgICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgICAgIGhlbGxvID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgaWYgdHJ1ZSB7XG4gICAgICAgICAgICAgICAgICB8ICBjb25zb2xlLmxvZygnaGVsbG8nKTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICAgIGdyYW1tYXI6ICdzb3VyY2UuanMnXG5cbiAgICAgICAgaXQgXCJhZGp1c3RJbmRlbnRhdGlvbiBzdXJyb3VuZGVkIHRleHQgXCIsIC0+XG4gICAgICAgICAgZW5zdXJlIFsneSBzIGkgZicsIGlucHV0OiAneyddLFxuICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgICBoZWxsbyA9ICgpID0+IHtcbiAgICAgICAgICAgICAgfCAge1xuICAgICAgICAgICAgICAgICAgaWYgdHJ1ZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdoZWxsbycpO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBcIlwiXCJcblxuICAgICAgZGVzY3JpYmUgJ3dpdGggbW90aW9uIHdoaWNoIHRha2VzIHVzZXItaW5wdXQnLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgc2V0IHRleHQ6IFwicyBfX19fXyBlXCIsIGN1cnNvcjogWzAsIDBdXG4gICAgICAgIGRlc2NyaWJlIFwid2l0aCAnZicgbW90aW9uXCIsIC0+XG4gICAgICAgICAgaXQgXCJzdXJyb3VuZCB3aXRoICdmJyBtb3Rpb25cIiwgLT5cbiAgICAgICAgICAgIGVuc3VyZSBbJ3kgcyBmJywgaW5wdXQ6ICdlKCddLCB0ZXh0OiBcIihzIF9fX19fIGUpXCIsIGN1cnNvcjogWzAsIDBdXG5cbiAgICAgICAgZGVzY3JpYmUgXCJ3aXRoICdgJyBtb3Rpb25cIiwgLT5cbiAgICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgICBzZXQgY3Vyc29yOiBbMCwgOF0gIyBzdGFydCBhdCBgZWAgY2hhclxuICAgICAgICAgICAgZW5zdXJlICdtIGEnLCBtYXJrOiAnYSc6IFswLCA4XVxuICAgICAgICAgICAgc2V0IGN1cnNvcjogWzAsIDBdXG5cbiAgICAgICAgICBpdCBcInN1cnJvdW5kIHdpdGggJ2AnIG1vdGlvblwiLCAtPlxuICAgICAgICAgICAgZW5zdXJlIFsneSBzIGAnLCBpbnB1dDogJ2EoJ10sIHRleHQ6IFwiKHMgX19fX18gKWVcIiwgY3Vyc29yOiBbMCwgMF1cblxuICAgICAgZGVzY3JpYmUgJ2NoYXJhY3RlcnNUb0FkZFNwYWNlT25TdXJyb3VuZCBzZXR0aW5nJywgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIHNldHRpbmdzLnNldCgnY2hhcmFjdGVyc1RvQWRkU3BhY2VPblN1cnJvdW5kJywgWycoJywgJ3snLCAnWyddKVxuICAgICAgICAgIHNldFxuICAgICAgICAgICAgdGV4dEM6IFwifGFwcGxlXFxub3JhbmdlXFxubGVtbW9uXCJcblxuICAgICAgICBkZXNjcmliZSBcImNoYXIgaXMgaW4gY2hhcmFjdGVyc1RvQWRkU3BhY2VPblN1cnJvdW5kXCIsIC0+XG4gICAgICAgICAgaXQgXCJhZGQgYWRkaXRpb25hbCBzcGFjZSBpbnNpZGUgcGFpciBjaGFyIHdoZW4gc3Vycm91bmRcIiwgLT5cbiAgICAgICAgICAgIGVuc3VyZSBbJ3kgcyBpIHcnLCBpbnB1dDogJygnXSwgdGV4dDogXCIoIGFwcGxlIClcXG5vcmFuZ2VcXG5sZW1tb25cIlxuICAgICAgICAgICAga2V5c3Ryb2tlICdqJ1xuICAgICAgICAgICAgZW5zdXJlIFsneSBzIGkgdycsIGlucHV0OiAneyddLCB0ZXh0OiBcIiggYXBwbGUgKVxcbnsgb3JhbmdlIH1cXG5sZW1tb25cIlxuICAgICAgICAgICAga2V5c3Ryb2tlICdqJ1xuICAgICAgICAgICAgZW5zdXJlIFsneSBzIGkgdycsIGlucHV0OiAnWyddLCB0ZXh0OiBcIiggYXBwbGUgKVxcbnsgb3JhbmdlIH1cXG5bIGxlbW1vbiBdXCJcblxuICAgICAgICBkZXNjcmliZSBcImNoYXIgaXMgbm90IGluIGNoYXJhY3RlcnNUb0FkZFNwYWNlT25TdXJyb3VuZFwiLCAtPlxuICAgICAgICAgIGl0IFwiYWRkIGFkZGl0aW9uYWwgc3BhY2UgaW5zaWRlIHBhaXIgY2hhciB3aGVuIHN1cnJvdW5kXCIsIC0+XG4gICAgICAgICAgICBlbnN1cmUgWyd5IHMgaSB3JywgaW5wdXQ6ICcpJ10sIHRleHQ6IFwiKGFwcGxlKVxcbm9yYW5nZVxcbmxlbW1vblwiXG4gICAgICAgICAgICBrZXlzdHJva2UgJ2onXG4gICAgICAgICAgICBlbnN1cmUgWyd5IHMgaSB3JywgaW5wdXQ6ICd9J10sIHRleHQ6IFwiKGFwcGxlKVxcbntvcmFuZ2V9XFxubGVtbW9uXCJcbiAgICAgICAgICAgIGtleXN0cm9rZSAnaidcbiAgICAgICAgICAgIGVuc3VyZSBbJ3kgcyBpIHcnLCBpbnB1dDogJ10nXSwgdGV4dDogXCIoYXBwbGUpXFxue29yYW5nZX1cXG5bbGVtbW9uXVwiXG5cbiAgICAgICAgZGVzY3JpYmUgXCJpdCBkaXN0aW5jdGl2ZWx5IGhhbmRsZSBhbGlhc2VkIGtleW1hcFwiLCAtPlxuICAgICAgICAgIGRlc2NyaWJlIFwibm9ybWFsIHBhaXItY2hhcnMgYXJlIHNldCB0byBhZGQgc3BhY2VcIiwgLT5cbiAgICAgICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICAgICAgc2V0dGluZ3Muc2V0KCdjaGFyYWN0ZXJzVG9BZGRTcGFjZU9uU3Vycm91bmQnLCBbJygnLCAneycsICdbJywgJzwnXSlcbiAgICAgICAgICAgIGl0IFwiZGlzdGluY3RpdmVseSBoYW5kbGVcIiwgLT5cbiAgICAgICAgICAgICAgc2V0IHRleHRDOiBcInxhYmNcIjsgZW5zdXJlIFsneSBzIGkgdycsIGlucHV0OiAnKCddLCB0ZXh0OiBcIiggYWJjIClcIlxuICAgICAgICAgICAgICBzZXQgdGV4dEM6IFwifGFiY1wiOyBlbnN1cmUgWyd5IHMgaSB3JywgaW5wdXQ6ICdiJ10sIHRleHQ6IFwiKGFiYylcIlxuICAgICAgICAgICAgICBzZXQgdGV4dEM6IFwifGFiY1wiOyBlbnN1cmUgWyd5IHMgaSB3JywgaW5wdXQ6ICd7J10sIHRleHQ6IFwieyBhYmMgfVwiXG4gICAgICAgICAgICAgIHNldCB0ZXh0QzogXCJ8YWJjXCI7IGVuc3VyZSBbJ3kgcyBpIHcnLCBpbnB1dDogJ0InXSwgdGV4dDogXCJ7YWJjfVwiXG4gICAgICAgICAgICAgIHNldCB0ZXh0QzogXCJ8YWJjXCI7IGVuc3VyZSBbJ3kgcyBpIHcnLCBpbnB1dDogJ1snXSwgdGV4dDogXCJbIGFiYyBdXCJcbiAgICAgICAgICAgICAgc2V0IHRleHRDOiBcInxhYmNcIjsgZW5zdXJlIFsneSBzIGkgdycsIGlucHV0OiAnciddLCB0ZXh0OiBcIlthYmNdXCJcbiAgICAgICAgICAgICAgc2V0IHRleHRDOiBcInxhYmNcIjsgZW5zdXJlIFsneSBzIGkgdycsIGlucHV0OiAnPCddLCB0ZXh0OiBcIjwgYWJjID5cIlxuICAgICAgICAgICAgICBzZXQgdGV4dEM6IFwifGFiY1wiOyBlbnN1cmUgWyd5IHMgaSB3JywgaW5wdXQ6ICdhJ10sIHRleHQ6IFwiPGFiYz5cIlxuICAgICAgICAgIGRlc2NyaWJlIFwiYWxpYXNlZCBwYWlyLWNoYXJzIGFyZSBzZXQgdG8gYWRkIHNwYWNlXCIsIC0+XG4gICAgICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgICAgIHNldHRpbmdzLnNldCgnY2hhcmFjdGVyc1RvQWRkU3BhY2VPblN1cnJvdW5kJywgWydiJywgJ0InLCAncicsICdhJ10pXG4gICAgICAgICAgICBpdCBcImRpc3RpbmN0aXZlbHkgaGFuZGxlXCIsIC0+XG4gICAgICAgICAgICAgIHNldCB0ZXh0QzogXCJ8YWJjXCI7IGVuc3VyZSBbJ3kgcyBpIHcnLCBpbnB1dDogJygnXSwgdGV4dDogXCIoYWJjKVwiXG4gICAgICAgICAgICAgIHNldCB0ZXh0QzogXCJ8YWJjXCI7IGVuc3VyZSBbJ3kgcyBpIHcnLCBpbnB1dDogJ2InXSwgdGV4dDogXCIoIGFiYyApXCJcbiAgICAgICAgICAgICAgc2V0IHRleHRDOiBcInxhYmNcIjsgZW5zdXJlIFsneSBzIGkgdycsIGlucHV0OiAneyddLCB0ZXh0OiBcInthYmN9XCJcbiAgICAgICAgICAgICAgc2V0IHRleHRDOiBcInxhYmNcIjsgZW5zdXJlIFsneSBzIGkgdycsIGlucHV0OiAnQiddLCB0ZXh0OiBcInsgYWJjIH1cIlxuICAgICAgICAgICAgICBzZXQgdGV4dEM6IFwifGFiY1wiOyBlbnN1cmUgWyd5IHMgaSB3JywgaW5wdXQ6ICdbJ10sIHRleHQ6IFwiW2FiY11cIlxuICAgICAgICAgICAgICBzZXQgdGV4dEM6IFwifGFiY1wiOyBlbnN1cmUgWyd5IHMgaSB3JywgaW5wdXQ6ICdyJ10sIHRleHQ6IFwiWyBhYmMgXVwiXG4gICAgICAgICAgICAgIHNldCB0ZXh0QzogXCJ8YWJjXCI7IGVuc3VyZSBbJ3kgcyBpIHcnLCBpbnB1dDogJzwnXSwgdGV4dDogXCI8YWJjPlwiXG4gICAgICAgICAgICAgIHNldCB0ZXh0QzogXCJ8YWJjXCI7IGVuc3VyZSBbJ3kgcyBpIHcnLCBpbnB1dDogJ2EnXSwgdGV4dDogXCI8IGFiYyA+XCJcblxuICAgIGRlc2NyaWJlICdtYXAtc3Vycm91bmQnLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBqYXNtaW5lLmF0dGFjaFRvRE9NKGVkaXRvckVsZW1lbnQpXG5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dEM6IFwiXCJcIlxuXG4gICAgICAgICAgICB8YXBwbGVcbiAgICAgICAgICAgIHBhaXJzIHRvbWF0b1xuICAgICAgICAgICAgb3JhbmdlXG4gICAgICAgICAgICBtaWxrXG5cbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGF0b20ua2V5bWFwcy5hZGQgXCJtc1wiLFxuICAgICAgICAgICdhdG9tLXRleHQtZWRpdG9yLnZpbS1tb2RlLXBsdXM6bm90KC5pbnNlcnQtbW9kZSknOlxuICAgICAgICAgICAgJ20gcyc6ICd2aW0tbW9kZS1wbHVzOm1hcC1zdXJyb3VuZCdcbiAgICAgICAgICAnYXRvbS10ZXh0LWVkaXRvci52aW0tbW9kZS1wbHVzLnZpc3VhbC1tb2RlJzpcbiAgICAgICAgICAgICdtIHMnOiAgJ3ZpbS1tb2RlLXBsdXM6bWFwLXN1cnJvdW5kJ1xuXG4gICAgICBpdCBcInN1cnJvdW5kIHRleHQgZm9yIGVhY2ggd29yZCBpbiB0YXJnZXQgY2FzZS0xXCIsIC0+XG4gICAgICAgIGVuc3VyZSAnbSBzIGkgcCAoJyxcbiAgICAgICAgICB0ZXh0QzogXCJcIlwiXG5cbiAgICAgICAgICB8KGFwcGxlKVxuICAgICAgICAgIChwYWlycykgKHRvbWF0bylcbiAgICAgICAgICAob3JhbmdlKVxuICAgICAgICAgIChtaWxrKVxuXG4gICAgICAgICAgXCJcIlwiXG4gICAgICBpdCBcInN1cnJvdW5kIHRleHQgZm9yIGVhY2ggd29yZCBpbiB0YXJnZXQgY2FzZS0yXCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFsyLCAxXVxuICAgICAgICBlbnN1cmUgJ20gcyBpIGwgPCcsXG4gICAgICAgICAgdGV4dEM6IFwiXCJcIlxuXG4gICAgICAgICAgYXBwbGVcbiAgICAgICAgICA8fHBhaXJzPiA8dG9tYXRvPlxuICAgICAgICAgIG9yYW5nZVxuICAgICAgICAgIG1pbGtcblxuICAgICAgICAgIFwiXCJcIlxuICAgICAgIyBUT0RPIzY5OCBGSVggd2hlbiBmaW5pc2hlZFxuICAgICAgaXQgXCJzdXJyb3VuZCB0ZXh0IGZvciBlYWNoIHdvcmQgaW4gdmlzdWFsIHNlbGVjdGlvblwiLCAtPlxuICAgICAgICBlbnN1cmUgJ3YgaSBwIG0gcyBcIicsXG4gICAgICAgICAgdGV4dEM6IFwiXCJcIlxuXG4gICAgICAgICAgXCJhcHBsZVwiXG4gICAgICAgICAgXCJwYWlyc1wiIFwidG9tYXRvXCJcbiAgICAgICAgICBcIm9yYW5nZVwiXG4gICAgICAgICAgXCJtaWx8a1wiXG5cbiAgICAgICAgICBcIlwiXCJcblxuICAgIGRlc2NyaWJlICdkZWxldGUgc3Vycm91bmQnLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMSwgOF1cblxuICAgICAgaXQgXCJkZWxldGUgc3Vycm91bmRlZCBjaGFycyBhbmQgcmVwZWF0YWJsZVwiLCAtPlxuICAgICAgICBlbnN1cmUgWydkIFMnLCBpbnB1dDogJ1snXSxcbiAgICAgICAgICB0ZXh0OiBcImFwcGxlXFxucGFpcnM6IGJyYWNrZXRzXFxucGFpcnM6IFticmFja2V0c11cXG4oIG11bHRpXFxuICBsaW5lIClcIlxuICAgICAgICBlbnN1cmUgJ2ogbCAuJyxcbiAgICAgICAgICB0ZXh0OiBcImFwcGxlXFxucGFpcnM6IGJyYWNrZXRzXFxucGFpcnM6IGJyYWNrZXRzXFxuKCBtdWx0aVxcbiAgbGluZSApXCJcbiAgICAgIGl0IFwiZGVsZXRlIHN1cnJvdW5kZWQgY2hhcnMgZXhwYW5kZWQgdG8gbXVsdGktbGluZVwiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMywgMV1cbiAgICAgICAgZW5zdXJlIFsnZCBTJywgaW5wdXQ6ICcoJ10sXG4gICAgICAgICAgdGV4dDogXCJhcHBsZVxcbnBhaXJzOiBbYnJhY2tldHNdXFxucGFpcnM6IFticmFja2V0c11cXG4gbXVsdGlcXG4gIGxpbmUgXCJcbiAgICAgIGl0IFwiZGVsZXRlIHN1cnJvdW5kZWQgY2hhcnMgYW5kIHRyaW0gcGFkZGluZyBzcGFjZXMgZm9yIG5vbi1pZGVudGljYWwgcGFpci1jaGFyXCIsIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgKCBhcHBsZSApXG4gICAgICAgICAgICB7ICBvcmFuZ2UgICB9XFxuXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICBjdXJzb3I6IFswLCAwXVxuICAgICAgICBlbnN1cmUgWydkIFMnLCBpbnB1dDogJygnXSwgdGV4dDogXCJhcHBsZVxcbnsgIG9yYW5nZSAgIH1cXG5cIlxuICAgICAgICBlbnN1cmUgWydqIGQgUycsIGlucHV0OiAneyddLCB0ZXh0OiBcImFwcGxlXFxub3JhbmdlXFxuXCJcbiAgICAgIGl0IFwiZGVsZXRlIHN1cnJvdW5kZWQgY2hhcnMgYW5kIE5PVCB0cmltIHBhZGRpbmcgc3BhY2VzIGZvciBpZGVudGljYWwgcGFpci1jaGFyXCIsIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgYCBhcHBsZSBgXG4gICAgICAgICAgICBcIiAgb3JhbmdlICAgXCJcXG5cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIGN1cnNvcjogWzAsIDBdXG4gICAgICAgIGVuc3VyZSBbJ2QgUycsIGlucHV0OiAnYCddLCB0ZXh0XzogJ19hcHBsZV9cXG5cIl9fb3JhbmdlX19fXCJcXG4nXG4gICAgICAgIGVuc3VyZSBbJ2ogZCBTJywgaW5wdXQ6ICdcIiddLCB0ZXh0XzogXCJfYXBwbGVfXFxuX19vcmFuZ2VfX19cXG5cIlxuICAgICAgaXQgXCJkZWxldGUgc3Vycm91bmRlZCBmb3IgbXVsdGktbGluZSBidXQgZG9udCBhZmZlY3QgY29kZSBsYXlvdXRcIiwgLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgY3Vyc29yOiBbMCwgMzRdXG4gICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICBoaWdobGlnaHRSYW5nZXMgQGVkaXRvciwgcmFuZ2UsIHtcbiAgICAgICAgICAgICAgdGltZW91dDogdGltZW91dFxuICAgICAgICAgICAgICBoZWxsbzogd29ybGRcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICBlbnN1cmUgWydkIFMnLCBpbnB1dDogJ3snXSxcbiAgICAgICAgICB0ZXh0OiBbXG4gICAgICAgICAgICAgIFwiaGlnaGxpZ2h0UmFuZ2VzIEBlZGl0b3IsIHJhbmdlLCBcIlxuICAgICAgICAgICAgICBcIiAgdGltZW91dDogdGltZW91dFwiXG4gICAgICAgICAgICAgIFwiICBoZWxsbzogd29ybGRcIlxuICAgICAgICAgICAgICBcIlwiXG4gICAgICAgICAgICBdLmpvaW4oXCJcXG5cIilcblxuICAgIGRlc2NyaWJlICdjaGFuZ2Ugc3Vycm91bmQnLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIChhcHBsZSlcbiAgICAgICAgICAgIChncmFwZSlcbiAgICAgICAgICAgIDxsZW1tb24+XG4gICAgICAgICAgICB7b3JhbmdlfVxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgY3Vyc29yOiBbMCwgMV1cbiAgICAgIGl0IFwiY2hhbmdlIHN1cnJvdW5kZWQgY2hhcnMgYW5kIHJlcGVhdGFibGVcIiwgLT5cbiAgICAgICAgZW5zdXJlIFsnYyBTJywgaW5wdXQ6ICcoWyddLFxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgW2FwcGxlXVxuICAgICAgICAgICAgKGdyYXBlKVxuICAgICAgICAgICAgPGxlbW1vbj5cbiAgICAgICAgICAgIHtvcmFuZ2V9XG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgZW5zdXJlICdqIGwgLicsXG4gICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICBbYXBwbGVdXG4gICAgICAgICAgICBbZ3JhcGVdXG4gICAgICAgICAgICA8bGVtbW9uPlxuICAgICAgICAgICAge29yYW5nZX1cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgaXQgXCJjaGFuZ2Ugc3Vycm91bmRlZCBjaGFyc1wiLCAtPlxuICAgICAgICBlbnN1cmUgWydqIGogYyBTJywgaW5wdXQ6ICc8XCInXSxcbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIChhcHBsZSlcbiAgICAgICAgICAgIChncmFwZSlcbiAgICAgICAgICAgIFwibGVtbW9uXCJcbiAgICAgICAgICAgIHtvcmFuZ2V9XG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgZW5zdXJlIFsnaiBsIGMgUycsIGlucHV0OiAneyEnXSxcbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIChhcHBsZSlcbiAgICAgICAgICAgIChncmFwZSlcbiAgICAgICAgICAgIFwibGVtbW9uXCJcbiAgICAgICAgICAgICFvcmFuZ2UhXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgaXQgXCJjaGFuZ2Ugc3Vycm91bmRlZCBmb3IgbXVsdGktbGluZSBidXQgZG9udCBhZmZlY3QgY29kZSBsYXlvdXRcIiwgLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgY3Vyc29yOiBbMCwgMzRdXG4gICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICBoaWdobGlnaHRSYW5nZXMgQGVkaXRvciwgcmFuZ2UsIHtcbiAgICAgICAgICAgICAgdGltZW91dDogdGltZW91dFxuICAgICAgICAgICAgICBoZWxsbzogd29ybGRcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICBlbnN1cmUgWydjIFMnLCBpbnB1dDogJ3soJ10sXG4gICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICBoaWdobGlnaHRSYW5nZXMgQGVkaXRvciwgcmFuZ2UsIChcbiAgICAgICAgICAgICAgdGltZW91dDogdGltZW91dFxuICAgICAgICAgICAgICBoZWxsbzogd29ybGRcbiAgICAgICAgICAgIClcbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICBkZXNjcmliZSAnY2hhcmFjdGVyc1RvQWRkU3BhY2VPblN1cnJvdW5kIHNldHRpbmcnLCAtPlxuICAgICAgICBlbnN1cmVDaGFuZ2VTdXJyb3VuZCA9IChpbnB1dEtleXN0cm9rZXMsIG9wdGlvbnMpIC0+XG4gICAgICAgICAgc2V0KHRleHQ6IG9wdGlvbnMuaW5pdGlhbFRleHQsIGN1cnNvcjogWzAsIDBdKVxuICAgICAgICAgIGRlbGV0ZSBvcHRpb25zLmluaXRpYWxUZXh0XG4gICAgICAgICAga2V5c3Ryb2tlcyA9IFsnYyBTJ10uY29uY2F0KHtpbnB1dDogaW5wdXRLZXlzdHJva2VzfSlcbiAgICAgICAgICBlbnN1cmUoa2V5c3Ryb2tlcywgb3B0aW9ucylcblxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgc2V0dGluZ3Muc2V0KCdjaGFyYWN0ZXJzVG9BZGRTcGFjZU9uU3Vycm91bmQnLCBbJygnLCAneycsICdbJ10pXG5cbiAgICAgICAgZGVzY3JpYmUgJ3doZW4gaW5wdXQgY2hhciBpcyBpbiBjaGFyYWN0ZXJzVG9BZGRTcGFjZU9uU3Vycm91bmQnLCAtPlxuICAgICAgICAgIGRlc2NyaWJlICdzaW5nbGUgbGluZSB0ZXh0JywgLT5cbiAgICAgICAgICAgIGl0IFwiYWRkIHNpbmdsZSBzcGFjZSBhcm91bmQgcGFpciByZWdhcmRsZXNzIG9mIGV4c2l0aW5nIGlubmVyIHRleHRcIiwgLT5cbiAgICAgICAgICAgICAgZW5zdXJlQ2hhbmdlU3Vycm91bmQgJyh7JywgaW5pdGlhbFRleHQ6IFwiKGFwcGxlKVwiLCB0ZXh0OiBcInsgYXBwbGUgfVwiXG4gICAgICAgICAgICAgIGVuc3VyZUNoYW5nZVN1cnJvdW5kICcoeycsIGluaXRpYWxUZXh0OiBcIiggYXBwbGUgKVwiLCB0ZXh0OiBcInsgYXBwbGUgfVwiXG4gICAgICAgICAgICAgIGVuc3VyZUNoYW5nZVN1cnJvdW5kICcoeycsIGluaXRpYWxUZXh0OiBcIiggIGFwcGxlICApXCIsIHRleHQ6IFwieyBhcHBsZSB9XCJcblxuICAgICAgICAgIGRlc2NyaWJlICdtdWx0aSBsaW5lIHRleHQnLCAtPlxuICAgICAgICAgICAgaXQgXCJkb24ndCBzYWRkIHNpbmdsZSBzcGFjZSBhcm91bmQgcGFpclwiLCAtPlxuICAgICAgICAgICAgICBlbnN1cmVDaGFuZ2VTdXJyb3VuZCAnKHsnLCBpbml0aWFsVGV4dDogXCIoXFxuYXBwbGVcXG4pXCIsIHRleHQ6IFwie1xcbmFwcGxlXFxufVwiXG5cbiAgICAgICAgZGVzY3JpYmUgJ3doZW4gZmlyc3QgaW5wdXQgY2hhciBpcyBub3QgaW4gY2hhcmFjdGVyc1RvQWRkU3BhY2VPblN1cnJvdW5kJywgLT5cbiAgICAgICAgICBpdCBcInJlbW92ZSBzdXJyb3VuZGluZyBzcGFjZSBvZiBpbm5lciB0ZXh0IGZvciBpZGVudGljYWwgcGFpci1jaGFyXCIsIC0+XG4gICAgICAgICAgICBlbnN1cmVDaGFuZ2VTdXJyb3VuZCAnKH0nLCBpbml0aWFsVGV4dDogXCIoYXBwbGUpXCIsIHRleHQ6IFwie2FwcGxlfVwiXG4gICAgICAgICAgICBlbnN1cmVDaGFuZ2VTdXJyb3VuZCAnKH0nLCBpbml0aWFsVGV4dDogXCIoIGFwcGxlIClcIiwgdGV4dDogXCJ7YXBwbGV9XCJcbiAgICAgICAgICAgIGVuc3VyZUNoYW5nZVN1cnJvdW5kICcofScsIGluaXRpYWxUZXh0OiBcIiggIGFwcGxlICApXCIsIHRleHQ6IFwie2FwcGxlfVwiXG4gICAgICAgICAgaXQgXCJkb2Vzbid0IHJlbW92ZSBzdXJyb3VuZGluZyBzcGFjZSBvZiBpbm5lciB0ZXh0IGZvciBub24taWRlbnRpY2FsIHBhaXItY2hhclwiLCAtPlxuICAgICAgICAgICAgZW5zdXJlQ2hhbmdlU3Vycm91bmQgJ1wiYCcsIGluaXRpYWxUZXh0OiAnXCJhcHBsZVwiJywgdGV4dDogXCJgYXBwbGVgXCJcbiAgICAgICAgICAgIGVuc3VyZUNoYW5nZVN1cnJvdW5kICdcImAnLCBpbml0aWFsVGV4dDogJ1wiICBhcHBsZSAgXCInLCB0ZXh0OiBcImAgIGFwcGxlICBgXCJcbiAgICAgICAgICAgIGVuc3VyZUNoYW5nZVN1cnJvdW5kIFwiXFxcIidcIiwgaW5pdGlhbFRleHQ6ICdcIiAgYXBwbGUgIFwiJywgdGV4dDogXCInICBhcHBsZSAgJ1wiXG5cbiAgICBkZXNjcmliZSAnc3Vycm91bmQtd29yZCcsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIGF0b20ua2V5bWFwcy5hZGQgXCJzdXJyb3VuZC10ZXN0XCIsXG4gICAgICAgICAgJ2F0b20tdGV4dC1lZGl0b3IudmltLW1vZGUtcGx1cy5ub3JtYWwtbW9kZSc6XG4gICAgICAgICAgICAneSBzIHcnOiAndmltLW1vZGUtcGx1czpzdXJyb3VuZC13b3JkJ1xuXG4gICAgICBpdCBcInN1cnJvdW5kIGEgd29yZCB3aXRoICggYW5kIHJlcGVhdGFibGVcIiwgLT5cbiAgICAgICAgZW5zdXJlIFsneSBzIHcnLCBpbnB1dDogJygnXSxcbiAgICAgICAgICB0ZXh0QzogXCJ8KGFwcGxlKVxcbnBhaXJzOiBbYnJhY2tldHNdXFxucGFpcnM6IFticmFja2V0c11cXG4oIG11bHRpXFxuICBsaW5lIClcIlxuICAgICAgICBlbnN1cmUgJ2ogLicsXG4gICAgICAgICAgdGV4dEM6IFwiKGFwcGxlKVxcbnwocGFpcnMpOiBbYnJhY2tldHNdXFxucGFpcnM6IFticmFja2V0c11cXG4oIG11bHRpXFxuICBsaW5lIClcIlxuICAgICAgaXQgXCJzdXJyb3VuZCBhIHdvcmQgd2l0aCB7IGFuZCByZXBlYXRhYmxlXCIsIC0+XG4gICAgICAgIGVuc3VyZSBbJ3kgcyB3JywgaW5wdXQ6ICd7J10sXG4gICAgICAgICAgdGV4dEM6IFwifHthcHBsZX1cXG5wYWlyczogW2JyYWNrZXRzXVxcbnBhaXJzOiBbYnJhY2tldHNdXFxuKCBtdWx0aVxcbiAgbGluZSApXCJcbiAgICAgICAgZW5zdXJlICdqIC4nLFxuICAgICAgICAgIHRleHRDOiBcInthcHBsZX1cXG58e3BhaXJzfTogW2JyYWNrZXRzXVxcbnBhaXJzOiBbYnJhY2tldHNdXFxuKCBtdWx0aVxcbiAgbGluZSApXCJcblxuICAgIGRlc2NyaWJlICdkZWxldGUtc3Vycm91bmQtYW55LXBhaXInLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICBhcHBsZVxuICAgICAgICAgICAgKHBhaXJzOiBbfGJyYWNrZXRzXSlcbiAgICAgICAgICAgIHtwYWlycyBcInNcIiBbYnJhY2tldHNdfVxuICAgICAgICAgICAgKCBtdWx0aVxuICAgICAgICAgICAgICBsaW5lIClcbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICBpdCBcImRlbGV0ZSBzdXJyb3VuZGVkIGFueSBwYWlyIGZvdW5kIGFuZCByZXBlYXRhYmxlXCIsIC0+XG4gICAgICAgIGVuc3VyZSAnZCBzJyxcbiAgICAgICAgICB0ZXh0OiAnYXBwbGVcXG4ocGFpcnM6IGJyYWNrZXRzKVxcbntwYWlycyBcInNcIiBbYnJhY2tldHNdfVxcbiggbXVsdGlcXG4gIGxpbmUgKSdcbiAgICAgICAgZW5zdXJlICcuJyxcbiAgICAgICAgICB0ZXh0OiAnYXBwbGVcXG5wYWlyczogYnJhY2tldHNcXG57cGFpcnMgXCJzXCIgW2JyYWNrZXRzXX1cXG4oIG11bHRpXFxuICBsaW5lICknXG5cbiAgICAgIGl0IFwiZGVsZXRlIHN1cnJvdW5kZWQgYW55IHBhaXIgZm91bmQgd2l0aCBza2lwIHBhaXIgb3V0IG9mIGN1cnNvciBhbmQgcmVwZWF0YWJsZVwiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMiwgMTRdXG4gICAgICAgIGVuc3VyZSAnZCBzJyxcbiAgICAgICAgICB0ZXh0OiAnYXBwbGVcXG4ocGFpcnM6IFticmFja2V0c10pXFxue3BhaXJzIFwic1wiIGJyYWNrZXRzfVxcbiggbXVsdGlcXG4gIGxpbmUgKSdcbiAgICAgICAgZW5zdXJlICcuJyxcbiAgICAgICAgICB0ZXh0OiAnYXBwbGVcXG4ocGFpcnM6IFticmFja2V0c10pXFxucGFpcnMgXCJzXCIgYnJhY2tldHNcXG4oIG11bHRpXFxuICBsaW5lICknXG4gICAgICAgIGVuc3VyZSAnLicsICMgZG8gbm90aGluZyBhbnkgbW9yZVxuICAgICAgICAgIHRleHQ6ICdhcHBsZVxcbihwYWlyczogW2JyYWNrZXRzXSlcXG5wYWlycyBcInNcIiBicmFja2V0c1xcbiggbXVsdGlcXG4gIGxpbmUgKSdcblxuICAgICAgaXQgXCJkZWxldGUgc3Vycm91bmRlZCBjaGFycyBleHBhbmRlZCB0byBtdWx0aS1saW5lXCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFszLCAxXVxuICAgICAgICBlbnN1cmUgJ2QgcycsXG4gICAgICAgICAgdGV4dDogJ2FwcGxlXFxuKHBhaXJzOiBbYnJhY2tldHNdKVxcbntwYWlycyBcInNcIiBbYnJhY2tldHNdfVxcbiBtdWx0aVxcbiAgbGluZSAnXG5cbiAgICBkZXNjcmliZSAnZGVsZXRlLXN1cnJvdW5kLWFueS1wYWlyLWFsbG93LWZvcndhcmRpbmcnLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBhdG9tLmtleW1hcHMuYWRkIFwia2V5bWFwcy1mb3Itc3Vycm91bmRcIixcbiAgICAgICAgICAnYXRvbS10ZXh0LWVkaXRvci52aW0tbW9kZS1wbHVzLm5vcm1hbC1tb2RlJzpcbiAgICAgICAgICAgICdkIHMnOiAndmltLW1vZGUtcGx1czpkZWxldGUtc3Vycm91bmQtYW55LXBhaXItYWxsb3ctZm9yd2FyZGluZydcblxuICAgICAgICBzZXR0aW5ncy5zZXQoJ3N0YXlPblRyYW5zZm9ybVN0cmluZycsIHRydWUpXG5cbiAgICAgIGl0IFwiWzFdIHNpbmdsZSBsaW5lXCIsIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICB8X19fKGlubmVyKVxuICAgICAgICAgIF9fXyhpbm5lcilcbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgZW5zdXJlICdkIHMnLFxuICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICB8X19faW5uZXJcbiAgICAgICAgICBfX18oaW5uZXIpXG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgIGVuc3VyZSAnaiAuJyxcbiAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgX19faW5uZXJcbiAgICAgICAgICB8X19faW5uZXJcbiAgICAgICAgICBcIlwiXCJcblxuICAgIGRlc2NyaWJlICdjaGFuZ2Utc3Vycm91bmQtYW55LXBhaXInLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICAofGFwcGxlKVxuICAgICAgICAgICAgKGdyYXBlKVxuICAgICAgICAgICAgPGxlbW1vbj5cbiAgICAgICAgICAgIHtvcmFuZ2V9XG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgaXQgXCJjaGFuZ2UgYW55IHN1cnJvdW5kZWQgcGFpciBmb3VuZCBhbmQgcmVwZWF0YWJsZVwiLCAtPlxuICAgICAgICBlbnN1cmUgWydjIHMnLCBpbnB1dDogJzwnXSwgdGV4dEM6IFwifDxhcHBsZT5cXG4oZ3JhcGUpXFxuPGxlbW1vbj5cXG57b3JhbmdlfVwiXG4gICAgICAgIGVuc3VyZSAnaiAuJywgdGV4dEM6IFwiPGFwcGxlPlxcbnw8Z3JhcGU+XFxuPGxlbW1vbj5cXG57b3JhbmdlfVwiXG4gICAgICAgIGVuc3VyZSAnaiBqIC4nLCB0ZXh0QzogXCI8YXBwbGU+XFxuPGdyYXBlPlxcbjxsZW1tb24+XFxufDxvcmFuZ2U+XCJcblxuICAgIGRlc2NyaWJlICdjaGFuZ2Utc3Vycm91bmQtYW55LXBhaXItYWxsb3ctZm9yd2FyZGluZycsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIGF0b20ua2V5bWFwcy5hZGQgXCJrZXltYXBzLWZvci1zdXJyb3VuZFwiLFxuICAgICAgICAgICdhdG9tLXRleHQtZWRpdG9yLnZpbS1tb2RlLXBsdXMubm9ybWFsLW1vZGUnOlxuICAgICAgICAgICAgJ2Mgcyc6ICd2aW0tbW9kZS1wbHVzOmNoYW5nZS1zdXJyb3VuZC1hbnktcGFpci1hbGxvdy1mb3J3YXJkaW5nJ1xuICAgICAgICBzZXR0aW5ncy5zZXQoJ3N0YXlPblRyYW5zZm9ybVN0cmluZycsIHRydWUpXG4gICAgICBpdCBcIlsxXSBzaW5nbGUgbGluZVwiLCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgfF9fXyhpbm5lcilcbiAgICAgICAgICBfX18oaW5uZXIpXG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgIGVuc3VyZSBbJ2MgcycsIGlucHV0OiAnPCddLFxuICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICB8X19fPGlubmVyPlxuICAgICAgICAgIF9fXyhpbm5lcilcbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgZW5zdXJlICdqIC4nLFxuICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICBfX188aW5uZXI+XG4gICAgICAgICAgfF9fXzxpbm5lcj5cbiAgICAgICAgICBcIlwiXCJcblxuICBkZXNjcmliZSAnUmVwbGFjZVdpdGhSZWdpc3RlcicsIC0+XG4gICAgb3JpZ2luYWxUZXh0ID0gbnVsbFxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIGF0b20ua2V5bWFwcy5hZGQgXCJ0ZXN0XCIsXG4gICAgICAgICdhdG9tLXRleHQtZWRpdG9yLnZpbS1tb2RlLXBsdXM6bm90KC5pbnNlcnQtbW9kZSknOlxuICAgICAgICAgICdfJzogJ3ZpbS1tb2RlLXBsdXM6cmVwbGFjZS13aXRoLXJlZ2lzdGVyJ1xuXG4gICAgICBvcmlnaW5hbFRleHQgPSBcIlwiXCJcbiAgICAgIGFiYyBkZWYgJ2FhYSdcbiAgICAgIGhlcmUgKHBhcmVudGhlc2lzKVxuICAgICAgaGVyZSAocGFyZW50aGVzaXMpXG4gICAgICBcIlwiXCJcbiAgICAgIHNldFxuICAgICAgICB0ZXh0OiBvcmlnaW5hbFRleHRcbiAgICAgICAgY3Vyc29yOiBbMCwgOV1cblxuICAgICAgc2V0IHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiAnZGVmYXVsdCByZWdpc3RlcicsIHR5cGU6ICdjaGFyYWN0ZXJ3aXNlJ1xuICAgICAgc2V0IHJlZ2lzdGVyOiAnYSc6IHRleHQ6ICdBIHJlZ2lzdGVyJywgdHlwZTogJ2NoYXJhY3Rlcndpc2UnXG5cbiAgICBpdCBcInJlcGxhY2Ugc2VsZWN0aW9uIHdpdGggcmVnaXNndGVyJ3MgY29udGVudFwiLCAtPlxuICAgICAgZW5zdXJlICd2IGkgdycsXG4gICAgICAgIHNlbGVjdGVkVGV4dDogJ2FhYSdcbiAgICAgIGVuc3VyZSAnXycsXG4gICAgICAgIG1vZGU6ICdub3JtYWwnXG4gICAgICAgIHRleHQ6IG9yaWdpbmFsVGV4dC5yZXBsYWNlKCdhYWEnLCAnZGVmYXVsdCByZWdpc3RlcicpXG5cbiAgICBpdCBcInJlcGxhY2UgdGV4dCBvYmplY3Qgd2l0aCByZWdpc2d0ZXIncyBjb250ZW50XCIsIC0+XG4gICAgICBzZXQgY3Vyc29yOiBbMSwgNl1cbiAgICAgIGVuc3VyZSAnXyBpICgnLFxuICAgICAgICBtb2RlOiAnbm9ybWFsJ1xuICAgICAgICB0ZXh0OiBvcmlnaW5hbFRleHQucmVwbGFjZSgncGFyZW50aGVzaXMnLCAnZGVmYXVsdCByZWdpc3RlcicpXG5cbiAgICBpdCBcImNhbiByZXBlYXRcIiwgLT5cbiAgICAgIHNldCBjdXJzb3I6IFsxLCA2XVxuICAgICAgZW5zdXJlICdfIGkgKCBqIC4nLFxuICAgICAgICBtb2RlOiAnbm9ybWFsJ1xuICAgICAgICB0ZXh0OiBvcmlnaW5hbFRleHQucmVwbGFjZSgvcGFyZW50aGVzaXMvZywgJ2RlZmF1bHQgcmVnaXN0ZXInKVxuXG4gICAgaXQgXCJjYW4gdXNlIHNwZWNpZmllZCByZWdpc3RlciB0byByZXBsYWNlIHdpdGhcIiwgLT5cbiAgICAgIHNldCBjdXJzb3I6IFsxLCA2XVxuICAgICAgZW5zdXJlIFsnXCInLCBpbnB1dDogJ2EnLCAnXyBpICgnXSxcbiAgICAgICAgbW9kZTogJ25vcm1hbCdcbiAgICAgICAgdGV4dDogb3JpZ2luYWxUZXh0LnJlcGxhY2UoJ3BhcmVudGhlc2lzJywgJ0EgcmVnaXN0ZXInKVxuXG4gIGRlc2NyaWJlICdTd2FwV2l0aFJlZ2lzdGVyJywgLT5cbiAgICBvcmlnaW5hbFRleHQgPSBudWxsXG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgYXRvbS5rZXltYXBzLmFkZCBcInRlc3RcIixcbiAgICAgICAgJ2F0b20tdGV4dC1lZGl0b3IudmltLW1vZGUtcGx1czpub3QoLmluc2VydC1tb2RlKSc6XG4gICAgICAgICAgJ2cgcCc6ICd2aW0tbW9kZS1wbHVzOnN3YXAtd2l0aC1yZWdpc3RlcidcblxuICAgICAgb3JpZ2luYWxUZXh0ID0gXCJcIlwiXG4gICAgICBhYmMgZGVmICdhYWEnXG4gICAgICBoZXJlICgxMTEpXG4gICAgICBoZXJlICgyMjIpXG4gICAgICBcIlwiXCJcbiAgICAgIHNldFxuICAgICAgICB0ZXh0OiBvcmlnaW5hbFRleHRcbiAgICAgICAgY3Vyc29yOiBbMCwgOV1cblxuICAgICAgc2V0IHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiAnZGVmYXVsdCByZWdpc3RlcicsIHR5cGU6ICdjaGFyYWN0ZXJ3aXNlJ1xuICAgICAgc2V0IHJlZ2lzdGVyOiAnYSc6IHRleHQ6ICdBIHJlZ2lzdGVyJywgdHlwZTogJ2NoYXJhY3Rlcndpc2UnXG5cbiAgICBpdCBcInN3YXAgc2VsZWN0aW9uIHdpdGggcmVnaXNndGVyJ3MgY29udGVudFwiLCAtPlxuICAgICAgZW5zdXJlICd2IGkgdycsIHNlbGVjdGVkVGV4dDogJ2FhYSdcbiAgICAgIGVuc3VyZSAnZyBwJyxcbiAgICAgICAgbW9kZTogJ25vcm1hbCdcbiAgICAgICAgdGV4dDogb3JpZ2luYWxUZXh0LnJlcGxhY2UoJ2FhYScsICdkZWZhdWx0IHJlZ2lzdGVyJylcbiAgICAgICAgcmVnaXN0ZXI6ICdcIic6IHRleHQ6ICdhYWEnXG5cbiAgICBpdCBcInN3YXAgdGV4dCBvYmplY3Qgd2l0aCByZWdpc2d0ZXIncyBjb250ZW50XCIsIC0+XG4gICAgICBzZXQgY3Vyc29yOiBbMSwgNl1cbiAgICAgIGVuc3VyZSAnZyBwIGkgKCcsXG4gICAgICAgIG1vZGU6ICdub3JtYWwnXG4gICAgICAgIHRleHQ6IG9yaWdpbmFsVGV4dC5yZXBsYWNlKCcxMTEnLCAnZGVmYXVsdCByZWdpc3RlcicpXG4gICAgICAgIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiAnMTExJ1xuXG4gICAgaXQgXCJjYW4gcmVwZWF0XCIsIC0+XG4gICAgICBzZXQgY3Vyc29yOiBbMSwgNl1cbiAgICAgIHVwZGF0ZWRUZXh0ID0gXCJcIlwiXG4gICAgICAgIGFiYyBkZWYgJ2FhYSdcbiAgICAgICAgaGVyZSAoZGVmYXVsdCByZWdpc3RlcilcbiAgICAgICAgaGVyZSAoMTExKVxuICAgICAgICBcIlwiXCJcbiAgICAgIGVuc3VyZSAnZyBwIGkgKCBqIC4nLFxuICAgICAgICBtb2RlOiAnbm9ybWFsJ1xuICAgICAgICB0ZXh0OiB1cGRhdGVkVGV4dFxuICAgICAgICByZWdpc3RlcjogJ1wiJzogdGV4dDogJzIyMidcblxuICAgIGl0IFwiY2FuIHVzZSBzcGVjaWZpZWQgcmVnaXN0ZXIgdG8gc3dhcCB3aXRoXCIsIC0+XG4gICAgICBzZXQgY3Vyc29yOiBbMSwgNl1cbiAgICAgIGVuc3VyZSBbJ1wiJywgaW5wdXQ6ICdhJywgJ2cgcCBpICgnXSxcbiAgICAgICAgbW9kZTogJ25vcm1hbCdcbiAgICAgICAgdGV4dDogb3JpZ2luYWxUZXh0LnJlcGxhY2UoJzExMScsICdBIHJlZ2lzdGVyJylcbiAgICAgICAgcmVnaXN0ZXI6ICdhJzogdGV4dDogJzExMSdcblxuICBkZXNjcmliZSBcIkpvaW4gYW5kIGl0J3MgZmFtaWx5XCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2V0XG4gICAgICAgIHRleHRDXzogXCJcIlwiXG4gICAgICAgIF9fMHwxMlxuICAgICAgICBfXzM0NVxuICAgICAgICBfXzY3OFxuICAgICAgICBfXzlhYlxcblxuICAgICAgICBcIlwiXCJcblxuICAgIGRlc2NyaWJlIFwiSm9pblwiLCAtPlxuICAgICAgaXQgXCJqb2lucyBsaW5lcyB3aXRoIHRyaW1pbmcgbGVhZGluZyB3aGl0ZXNwYWNlXCIsIC0+XG4gICAgICAgIGVuc3VyZSAnSicsXG4gICAgICAgICAgdGV4dENfOiBcIlwiXCJcbiAgICAgICAgICBfXzAxMnwgMzQ1XG4gICAgICAgICAgX182NzhcbiAgICAgICAgICBfXzlhYlxcblxuICAgICAgICAgIFwiXCJcIlxuICAgICAgICBlbnN1cmUgJy4nLFxuICAgICAgICAgIHRleHRDXzogXCJcIlwiXG4gICAgICAgICAgX18wMTIgMzQ1fCA2NzhcbiAgICAgICAgICBfXzlhYlxcblxuICAgICAgICAgIFwiXCJcIlxuICAgICAgICBlbnN1cmUgJy4nLFxuICAgICAgICAgIHRleHRDXzogXCJcIlwiXG4gICAgICAgICAgX18wMTIgMzQ1IDY3OHwgOWFiXFxuXG4gICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgZW5zdXJlICd1JyxcbiAgICAgICAgICB0ZXh0Q186IFwiXCJcIlxuICAgICAgICAgIF9fMDEyIDM0NXwgNjc4XG4gICAgICAgICAgX185YWJcXG5cbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgZW5zdXJlICd1JyxcbiAgICAgICAgICB0ZXh0Q186IFwiXCJcIlxuICAgICAgICAgIF9fMDEyfCAzNDVcbiAgICAgICAgICBfXzY3OFxuICAgICAgICAgIF9fOWFiXFxuXG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgIGVuc3VyZSAndScsXG4gICAgICAgICAgdGV4dENfOiBcIlwiXCJcbiAgICAgICAgICBfXzB8MTJcbiAgICAgICAgICBfXzM0NVxuICAgICAgICAgIF9fNjc4XG4gICAgICAgICAgX185YWJcXG5cbiAgICAgICAgICBcIlwiXCJcblxuICAgICAgaXQgXCJqb2lucyBkbyBub3RoaW5nIHdoZW4gaXQgY2Fubm90IGpvaW4gYW55IG1vcmVcIiwgLT5cbiAgICAgICAgIyBGSVhNRTogXCJcXG5cIiByZW1haW4gaXQncyBpbmNvbnNpc3RlbnQgd2l0aCBtdWx0aS10aW1lIEpcbiAgICAgICAgZW5zdXJlICcxIDAgMCBKJywgdGV4dENfOiBcIiAgMDEyIDM0NSA2NzggOWF8YlxcblwiXG5cbiAgICAgIGl0IFwiam9pbnMgZG8gbm90aGluZyB3aGVuIGl0IGNhbm5vdCBqb2luIGFueSBtb3JlXCIsIC0+XG4gICAgICAgIGVuc3VyZSAnSiBKIEonLCB0ZXh0Q186IFwiICAwMTIgMzQ1IDY3OHwgOWFiXFxuXCJcbiAgICAgICAgZW5zdXJlICdKJywgdGV4dENfOiBcIiAgMDEyIDM0NSA2NzggOWF8YlwiXG4gICAgICAgIGVuc3VyZSAnSicsIHRleHRDXzogXCIgIDAxMiAzNDUgNjc4IDlhfGJcIlxuXG4gICAgZGVzY3JpYmUgXCJKb2luV2l0aEtlZXBpbmdTcGFjZVwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBhdG9tLmtleW1hcHMuYWRkIFwidGVzdFwiLFxuICAgICAgICAgICdhdG9tLXRleHQtZWRpdG9yLnZpbS1tb2RlLXBsdXM6bm90KC5pbnNlcnQtbW9kZSknOlxuICAgICAgICAgICAgJ2cgSic6ICd2aW0tbW9kZS1wbHVzOmpvaW4td2l0aC1rZWVwaW5nLXNwYWNlJ1xuXG4gICAgICBpdCBcImpvaW5zIGxpbmVzIHdpdGhvdXQgdHJpbWluZyBsZWFkaW5nIHdoaXRlc3BhY2VcIiwgLT5cbiAgICAgICAgZW5zdXJlICdnIEonLFxuICAgICAgICAgIHRleHRDXzogXCJcIlwiXG4gICAgICAgICAgX18wfDEyX18zNDVcbiAgICAgICAgICBfXzY3OFxuICAgICAgICAgIF9fOWFiXFxuXG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgIGVuc3VyZSAnLicsXG4gICAgICAgICAgdGV4dENfOiBcIlwiXCJcbiAgICAgICAgICBfXzB8MTJfXzM0NV9fNjc4XG4gICAgICAgICAgX185YWJcXG5cbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgZW5zdXJlICd1IHUnLFxuICAgICAgICAgIHRleHRDXzogXCJcIlwiXG4gICAgICAgICAgX18wfDEyXG4gICAgICAgICAgX18zNDVcbiAgICAgICAgICBfXzY3OFxuICAgICAgICAgIF9fOWFiXFxuXG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgIGVuc3VyZSAnNCBnIEonLFxuICAgICAgICAgIHRleHRDXzogXCJcIlwiXG4gICAgICAgICAgX18wfDEyX18zNDVfXzY3OF9fOWFiXFxuXG4gICAgICAgICAgXCJcIlwiXG5cbiAgICBkZXNjcmliZSBcIkpvaW5CeUlucHV0XCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIGF0b20ua2V5bWFwcy5hZGQgXCJ0ZXN0XCIsXG4gICAgICAgICAgJ2F0b20tdGV4dC1lZGl0b3IudmltLW1vZGUtcGx1czpub3QoLmluc2VydC1tb2RlKSc6XG4gICAgICAgICAgICAnZyBKJzogJ3ZpbS1tb2RlLXBsdXM6am9pbi1ieS1pbnB1dCdcblxuICAgICAgaXQgXCJqb2lucyBsaW5lcyBieSBjaGFyIGZyb20gdXNlciB3aXRoIHRyaW1pbmcgbGVhZGluZyB3aGl0ZXNwYWNlXCIsIC0+XG4gICAgICAgIGVuc3VyZSAnZyBKIDogOiBlbnRlcicsXG4gICAgICAgICAgdGV4dENfOiBcIlwiXCJcbiAgICAgICAgICBfXzB8MTI6OjM0NVxuICAgICAgICAgIF9fNjc4XG4gICAgICAgICAgX185YWJcXG5cbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgZW5zdXJlICcuJyxcbiAgICAgICAgICB0ZXh0Q186IFwiXCJcIlxuICAgICAgICAgIF9fMHwxMjo6MzQ1Ojo2NzhcbiAgICAgICAgICBfXzlhYlxcblxuICAgICAgICAgIFwiXCJcIlxuICAgICAgICBlbnN1cmUgJ3UgdScsXG4gICAgICAgICAgdGV4dENfOiBcIlwiXCJcbiAgICAgICAgICBfXzB8MTJcbiAgICAgICAgICBfXzM0NVxuICAgICAgICAgIF9fNjc4XG4gICAgICAgICAgX185YWJcXG5cbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgZW5zdXJlICc0IGcgSiA6IDogZW50ZXInLFxuICAgICAgICAgIHRleHRDXzogXCJcIlwiXG4gICAgICAgICAgX18wfDEyOjozNDU6OjY3ODo6OWFiXFxuXG4gICAgICAgICAgXCJcIlwiXG5cbiAgICBkZXNjcmliZSBcIkpvaW5CeUlucHV0V2l0aEtlZXBpbmdTcGFjZVwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBhdG9tLmtleW1hcHMuYWRkIFwidGVzdFwiLFxuICAgICAgICAgICdhdG9tLXRleHQtZWRpdG9yLnZpbS1tb2RlLXBsdXM6bm90KC5pbnNlcnQtbW9kZSknOlxuICAgICAgICAgICAgJ2cgSic6ICd2aW0tbW9kZS1wbHVzOmpvaW4tYnktaW5wdXQtd2l0aC1rZWVwaW5nLXNwYWNlJ1xuXG4gICAgICBpdCBcImpvaW5zIGxpbmVzIGJ5IGNoYXIgZnJvbSB1c2VyIHdpdGhvdXQgdHJpbWluZyBsZWFkaW5nIHdoaXRlc3BhY2VcIiwgLT5cbiAgICAgICAgZW5zdXJlICdnIEogOiA6IGVudGVyJyxcbiAgICAgICAgICB0ZXh0Q186IFwiXCJcIlxuICAgICAgICAgIF9fMHwxMjo6X18zNDVcbiAgICAgICAgICBfXzY3OFxuICAgICAgICAgIF9fOWFiXFxuXG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgIGVuc3VyZSAnLicsXG4gICAgICAgICAgdGV4dENfOiBcIlwiXCJcbiAgICAgICAgICBfXzB8MTI6Ol9fMzQ1OjpfXzY3OFxuICAgICAgICAgIF9fOWFiXFxuXG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgIGVuc3VyZSAndSB1JyxcbiAgICAgICAgICB0ZXh0Q186IFwiXCJcIlxuICAgICAgICAgIF9fMHwxMlxuICAgICAgICAgIF9fMzQ1XG4gICAgICAgICAgX182NzhcbiAgICAgICAgICBfXzlhYlxcblxuICAgICAgICAgIFwiXCJcIlxuICAgICAgICBlbnN1cmUgJzQgZyBKIDogOiBlbnRlcicsXG4gICAgICAgICAgdGV4dENfOiBcIlwiXCJcbiAgICAgICAgICBfXzB8MTI6Ol9fMzQ1OjpfXzY3ODo6X185YWJcXG5cbiAgICAgICAgICBcIlwiXCJcblxuICBkZXNjcmliZSAnVG9nZ2xlTGluZUNvbW1lbnRzJywgLT5cbiAgICBbb2xkR3JhbW1hciwgb3JpZ2luYWxUZXh0XSA9IFtdXG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICAgIGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKCdsYW5ndWFnZS1jb2ZmZWUtc2NyaXB0JylcblxuICAgICAgcnVucyAtPlxuICAgICAgICBvbGRHcmFtbWFyID0gZWRpdG9yLmdldEdyYW1tYXIoKVxuICAgICAgICBncmFtbWFyID0gYXRvbS5ncmFtbWFycy5ncmFtbWFyRm9yU2NvcGVOYW1lKCdzb3VyY2UuY29mZmVlJylcbiAgICAgICAgZWRpdG9yLnNldEdyYW1tYXIoZ3JhbW1hcilcbiAgICAgICAgb3JpZ2luYWxUZXh0ID0gXCJcIlwiXG4gICAgICAgICAgY2xhc3MgQmFzZVxuICAgICAgICAgICAgY29uc3RydWN0b3I6IChhcmdzKSAtPlxuICAgICAgICAgICAgICBwaXZvdCA9IGl0ZW1zLnNoaWZ0KClcbiAgICAgICAgICAgICAgbGVmdCA9IFtdXG4gICAgICAgICAgICAgIHJpZ2h0ID0gW11cblxuICAgICAgICAgIGNvbnNvbGUubG9nIFwiaGVsbG9cIlxuICAgICAgICBcIlwiXCJcbiAgICAgICAgc2V0IHRleHQ6IG9yaWdpbmFsVGV4dFxuXG4gICAgYWZ0ZXJFYWNoIC0+XG4gICAgICBlZGl0b3Iuc2V0R3JhbW1hcihvbGRHcmFtbWFyKVxuXG4gICAgaXQgJ3RvZ2dsZSBjb21tZW50IGZvciB0ZXh0b2JqZWN0IGZvciBpbmRlbnQgYW5kIHJlcGVhdGFibGUnLCAtPlxuICAgICAgc2V0IGN1cnNvcjogWzIsIDBdXG4gICAgICBlbnN1cmUgJ2cgLyBpIGknLFxuICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICBjbGFzcyBCYXNlXG4gICAgICAgICAgICBjb25zdHJ1Y3RvcjogKGFyZ3MpIC0+XG4gICAgICAgICAgICAgICMgcGl2b3QgPSBpdGVtcy5zaGlmdCgpXG4gICAgICAgICAgICAgICMgbGVmdCA9IFtdXG4gICAgICAgICAgICAgICMgcmlnaHQgPSBbXVxuXG4gICAgICAgICAgY29uc29sZS5sb2cgXCJoZWxsb1wiXG4gICAgICAgIFwiXCJcIlxuICAgICAgZW5zdXJlICcuJywgdGV4dDogb3JpZ2luYWxUZXh0XG5cbiAgICBpdCAndG9nZ2xlIGNvbW1lbnQgZm9yIHRleHRvYmplY3QgZm9yIHBhcmFncmFwaCBhbmQgcmVwZWF0YWJsZScsIC0+XG4gICAgICBzZXQgY3Vyc29yOiBbMiwgMF1cbiAgICAgIGVuc3VyZSAnZyAvIGkgcCcsXG4gICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICMgY2xhc3MgQmFzZVxuICAgICAgICAgICMgICBjb25zdHJ1Y3RvcjogKGFyZ3MpIC0+XG4gICAgICAgICAgIyAgICAgcGl2b3QgPSBpdGVtcy5zaGlmdCgpXG4gICAgICAgICAgIyAgICAgbGVmdCA9IFtdXG4gICAgICAgICAgIyAgICAgcmlnaHQgPSBbXVxuXG4gICAgICAgICAgY29uc29sZS5sb2cgXCJoZWxsb1wiXG4gICAgICAgIFwiXCJcIlxuXG4gICAgICBlbnN1cmUgJy4nLCB0ZXh0OiBvcmlnaW5hbFRleHRcblxuICBkZXNjcmliZSBcIlNwbGl0U3RyaW5nLCBTcGxpdFN0cmluZ1dpdGhLZWVwaW5nU3BsaXR0ZXJcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBhdG9tLmtleW1hcHMuYWRkIFwidGVzdFwiLFxuICAgICAgICAnYXRvbS10ZXh0LWVkaXRvci52aW0tbW9kZS1wbHVzOm5vdCguaW5zZXJ0LW1vZGUpJzpcbiAgICAgICAgICAnZyAvJzogJ3ZpbS1tb2RlLXBsdXM6c3BsaXQtc3RyaW5nJ1xuICAgICAgICAgICdnID8nOiAndmltLW1vZGUtcGx1czpzcGxpdC1zdHJpbmctd2l0aC1rZWVwaW5nLXNwbGl0dGVyJ1xuICAgICAgc2V0XG4gICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgfGE6YjpjXG4gICAgICAgIGQ6ZTpmXFxuXG4gICAgICAgIFwiXCJcIlxuICAgIGRlc2NyaWJlIFwiU3BsaXRTdHJpbmdcIiwgLT5cbiAgICAgIGl0IFwic3BsaXQgc3RyaW5nIGludG8gbGluZXNcIiwgLT5cbiAgICAgICAgZW5zdXJlIFwiZyAvIDogZW50ZXJcIixcbiAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgfGFcbiAgICAgICAgICBiXG4gICAgICAgICAgY1xuICAgICAgICAgIGQ6ZTpmXFxuXG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgIGVuc3VyZSBcIkcgLlwiLFxuICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICBhXG4gICAgICAgICAgYlxuICAgICAgICAgIGNcbiAgICAgICAgICB8ZFxuICAgICAgICAgIGVcbiAgICAgICAgICBmXFxuXG4gICAgICAgICAgXCJcIlwiXG4gICAgZGVzY3JpYmUgXCJTcGxpdFN0cmluZ1dpdGhLZWVwaW5nU3BsaXR0ZXJcIiwgLT5cbiAgICAgIGl0IFwic3BsaXQgc3RyaW5nIGludG8gbGluZXMgd2l0aG91dCByZW1vdmluZyBzcGxpdGVyIGNoYXJcIiwgLT5cbiAgICAgICAgZW5zdXJlIFwiZyA/IDogZW50ZXJcIixcbiAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgfGE6XG4gICAgICAgICAgYjpcbiAgICAgICAgICBjXG4gICAgICAgICAgZDplOmZcXG5cbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgZW5zdXJlIFwiRyAuXCIsXG4gICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgIGE6XG4gICAgICAgICAgYjpcbiAgICAgICAgICBjXG4gICAgICAgICAgfGQ6XG4gICAgICAgICAgZTpcbiAgICAgICAgICBmXFxuXG4gICAgICAgICAgXCJcIlwiXG5cbiAgZGVzY3JpYmUgXCJTcGxpdEFyZ3VtZW50cywgU3BsaXRBcmd1bWVudHNXaXRoUmVtb3ZlU2VwYXJhdG9yXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgYXRvbS5rZXltYXBzLmFkZCBcInRlc3RcIixcbiAgICAgICAgJ2F0b20tdGV4dC1lZGl0b3IudmltLW1vZGUtcGx1czpub3QoLmluc2VydC1tb2RlKSc6XG4gICAgICAgICAgJ2cgLCc6ICd2aW0tbW9kZS1wbHVzOnNwbGl0LWFyZ3VtZW50cydcbiAgICAgICAgICAnZyAhJzogJ3ZpbS1tb2RlLXBsdXM6c3BsaXQtYXJndW1lbnRzLXdpdGgtcmVtb3ZlLXNlcGFyYXRvcidcblxuICAgICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICAgIGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKCdsYW5ndWFnZS1qYXZhc2NyaXB0JylcbiAgICAgIHJ1bnMgLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgZ3JhbW1hcjogJ3NvdXJjZS5qcydcbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIGhlbGxvID0gKCkgPT4ge1xuICAgICAgICAgICAgICB7ZjEsIGYyLCBmM30gPSByZXF1aXJlKCdoZWxsbycpXG4gICAgICAgICAgICAgIGYxKGYyKDEsIFwiYSwgYiwgY1wiKSwgMiwgKGFyZykgPT4gY29uc29sZS5sb2coYXJnKSlcbiAgICAgICAgICAgICAgcyA9IGBhYmMgZGVmIGhpamBcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgZGVzY3JpYmUgXCJTcGxpdEFyZ3VtZW50c1wiLCAtPlxuICAgICAgaXQgXCJzcGxpdCBieSBjb21tbWEgd2l0aCBhZGp1c3QgaW5kZW50XCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFsxLCAzXVxuICAgICAgICBlbnN1cmUgJ2cgLCBpIHsnLFxuICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAgIGhlbGxvID0gKCkgPT4ge1xuICAgICAgICAgICAgICB8e1xuICAgICAgICAgICAgICAgIGYxLFxuICAgICAgICAgICAgICAgIGYyLFxuICAgICAgICAgICAgICAgIGYzXG4gICAgICAgICAgICAgIH0gPSByZXF1aXJlKCdoZWxsbycpXG4gICAgICAgICAgICAgIGYxKGYyKDEsIFwiYSwgYiwgY1wiKSwgMiwgKGFyZykgPT4gY29uc29sZS5sb2coYXJnKSlcbiAgICAgICAgICAgICAgcyA9IGBhYmMgZGVmIGhpamBcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgaXQgXCJzcGxpdCBieSBjb21tbWEgd2l0aCBhZGp1c3QgaW5kZW50XCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFsyLCA1XVxuICAgICAgICBlbnN1cmUgJ2cgLCBpICgnLFxuICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAgIGhlbGxvID0gKCkgPT4ge1xuICAgICAgICAgICAgICB7ZjEsIGYyLCBmM30gPSByZXF1aXJlKCdoZWxsbycpXG4gICAgICAgICAgICAgIGYxfChcbiAgICAgICAgICAgICAgICBmMigxLCBcImEsIGIsIGNcIiksXG4gICAgICAgICAgICAgICAgMixcbiAgICAgICAgICAgICAgICAoYXJnKSA9PiBjb25zb2xlLmxvZyhhcmcpXG4gICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgcyA9IGBhYmMgZGVmIGhpamBcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICBrZXlzdHJva2UgJ2ogdydcbiAgICAgICAgZW5zdXJlICdnICwgaSAoJyxcbiAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICBoZWxsbyA9ICgpID0+IHtcbiAgICAgICAgICAgICAge2YxLCBmMiwgZjN9ID0gcmVxdWlyZSgnaGVsbG8nKVxuICAgICAgICAgICAgICBmMShcbiAgICAgICAgICAgICAgICBmMnwoXG4gICAgICAgICAgICAgICAgICAxLFxuICAgICAgICAgICAgICAgICAgXCJhLCBiLCBjXCJcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIDIsXG4gICAgICAgICAgICAgICAgKGFyZykgPT4gY29uc29sZS5sb2coYXJnKVxuICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgIHMgPSBgYWJjIGRlZiBoaWpgXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgIGl0IFwic3BsaXQgYnkgd2hpdGUtc3BhY2Ugd2l0aCBhZGp1c3QgaW5kZW50XCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFszLCAxMF1cbiAgICAgICAgZW5zdXJlICdnICwgaSBgJyxcbiAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICBoZWxsbyA9ICgpID0+IHtcbiAgICAgICAgICAgICAge2YxLCBmMiwgZjN9ID0gcmVxdWlyZSgnaGVsbG8nKVxuICAgICAgICAgICAgICBmMShmMigxLCBcImEsIGIsIGNcIiksIDIsIChhcmcpID0+IGNvbnNvbGUubG9nKGFyZykpXG4gICAgICAgICAgICAgIHMgPSB8YFxuICAgICAgICAgICAgICBhYmNcbiAgICAgICAgICAgICAgZGVmXG4gICAgICAgICAgICAgIGhpalxuICAgICAgICAgICAgICBgXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcIlwiXCJcblxuICAgIGRlc2NyaWJlIFwiU3BsaXRCeUFyZ3VtZW50c1dpdGhSZW1vdmVTZXBhcmF0b3JcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIGl0IFwicmVtb3ZlIHNwbGl0dGVyIHdoZW4gc3BsaXRcIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzEsIDNdXG4gICAgICAgIGVuc3VyZSAnZyAhIGkgeycsXG4gICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgIGhlbGxvID0gKCkgPT4ge1xuICAgICAgICAgICAgfHtcbiAgICAgICAgICAgICAgZjFcbiAgICAgICAgICAgICAgZjJcbiAgICAgICAgICAgICAgZjNcbiAgICAgICAgICAgIH0gPSByZXF1aXJlKCdoZWxsbycpXG4gICAgICAgICAgICBmMShmMigxLCBcImEsIGIsIGNcIiksIDIsIChhcmcpID0+IGNvbnNvbGUubG9nKGFyZykpXG4gICAgICAgICAgICBzID0gYGFiYyBkZWYgaGlqYFxuICAgICAgICAgIH1cbiAgICAgICAgICBcIlwiXCJcblxuICBkZXNjcmliZSBcIkNoYW5nZSBPcmRlciBmYWltbGl5OiBSZXZlcnNlLCBTb3J0LCBTb3J0Q2FzZUluc2Vuc2l0aXZlbHksIFNvcnRCeU51bWJlclwiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIGF0b20ua2V5bWFwcy5hZGQgXCJ0ZXN0XCIsXG4gICAgICAgICdhdG9tLXRleHQtZWRpdG9yLnZpbS1tb2RlLXBsdXM6bm90KC5pbnNlcnQtbW9kZSknOlxuICAgICAgICAgICdnIHInOiAndmltLW1vZGUtcGx1czpyZXZlcnNlJ1xuICAgICAgICAgICdnIHMnOiAndmltLW1vZGUtcGx1czpzb3J0J1xuICAgICAgICAgICdnIFMnOiAndmltLW1vZGUtcGx1czpzb3J0LWJ5LW51bWJlcidcbiAgICBkZXNjcmliZSBcImNoYXJhY3Rlcndpc2UgdGFyZ2V0XCIsIC0+XG4gICAgICBkZXNjcmliZSBcIlJldmVyc2VcIiwgLT5cbiAgICAgICAgaXQgXCJbY29tbWEgc2VwYXJhdGVkXSByZXZlcnNlIHRleHRcIiwgLT5cbiAgICAgICAgICBzZXQgdGV4dEM6IFwiICAgKCBkb2csIGNhfHQsIGZpc2gsIHJhYmJpdCwgZHVjaywgZ29waGVyLCBzcXVpZCApXCJcbiAgICAgICAgICBlbnN1cmUgJ2cgciBpICgnLCB0ZXh0Q186IFwiICAgKHwgc3F1aWQsIGdvcGhlciwgZHVjaywgcmFiYml0LCBmaXNoLCBjYXQsIGRvZyApXCJcbiAgICAgICAgaXQgXCJbY29tbWEgc3BhcmF0ZWRdIHJldmVyc2UgdGV4dFwiLCAtPlxuICAgICAgICAgIHNldCB0ZXh0QzogXCIgICAoICdkb2cgY2F8dCcsICdmaXNoIHJhYmJpdCcsICdkdWNrIGdvcGhlciBzcXVpZCcgKVwiXG4gICAgICAgICAgZW5zdXJlICdnIHIgaSAoJywgdGV4dENfOiBcIiAgICh8ICdkdWNrIGdvcGhlciBzcXVpZCcsICdmaXNoIHJhYmJpdCcsICdkb2cgY2F0JyApXCJcbiAgICAgICAgaXQgXCJbc3BhY2Ugc3BhcmF0ZWRdIHJldmVyc2UgdGV4dFwiLCAtPlxuICAgICAgICAgIHNldCB0ZXh0QzogXCIgICAoIGRvZyBjYXx0IGZpc2ggcmFiYml0IGR1Y2sgZ29waGVyIHNxdWlkIClcIlxuICAgICAgICAgIGVuc3VyZSAnZyByIGkgKCcsIHRleHRDXzogXCIgICAofCBzcXVpZCBnb3BoZXIgZHVjayByYWJiaXQgZmlzaCBjYXQgZG9nIClcIlxuICAgICAgICBpdCBcIltjb21tYSBzcGFyYXRlZCBtdWx0aS1saW5lXSByZXZlcnNlIHRleHRcIiwgLT5cbiAgICAgICAgICBzZXQgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICB8MSwgMiwgMywgNCxcbiAgICAgICAgICAgICAgNSwgNixcbiAgICAgICAgICAgICAgNyxcbiAgICAgICAgICAgICAgOCwgOVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgZW5zdXJlICdnIHIgaSB7JyxcbiAgICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgIHwgIDksIDgsIDcsIDYsXG4gICAgICAgICAgICAgIDUsIDQsXG4gICAgICAgICAgICAgIDMsXG4gICAgICAgICAgICAgIDIsIDFcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICBpdCBcIltjb21tYSBzcGFyYXRlZCBtdWx0aS1saW5lXSBrZWVwIGNvbW1hIGZvbGxvd2VkIHRvIGxhc3QgZW50cnlcIiwgLT5cbiAgICAgICAgICBzZXQgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgW1xuICAgICAgICAgICAgICB8MSwgMiwgMywgNCxcbiAgICAgICAgICAgICAgNSwgNixcbiAgICAgICAgICAgIF1cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIGVuc3VyZSAnZyByIGkgWycsXG4gICAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICBbXG4gICAgICAgICAgICB8ICA2LCA1LCA0LCAzLFxuICAgICAgICAgICAgICAyLCAxLFxuICAgICAgICAgICAgXVxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgIGl0IFwiW2NvbW1hIHNwYXJhdGVkIG11bHRpLWxpbmVdIGF3YXJlIG9mIG5leHRlZCBwYWlyIGFuZCBxdW90ZXMgYW5kIGVzY2FwZWQgcXVvdGVcIiwgLT5cbiAgICAgICAgICBzZXQgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgKFxuICAgICAgICAgICAgICB8XCIoYSwgYiwgYylcIiwgXCJbKCBkIGUgZlwiLCB0ZXN0KGcsIGgsIGkpLFxuICAgICAgICAgICAgICBcIlxcXFxcImosIGssIGxcIixcbiAgICAgICAgICAgICAgJ1xcXFwnbSwgbicsIHRlc3QobywgcCksXG4gICAgICAgICAgICApXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICBlbnN1cmUgJ2cgciBpICgnLFxuICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgKFxuICAgICAgICAgICAgfCAgdGVzdChvLCBwKSwgJ1xcXFwnbSwgbicsIFwiXFxcXFwiaiwgaywgbFwiLFxuICAgICAgICAgICAgICB0ZXN0KGcsIGgsIGkpLFxuICAgICAgICAgICAgICBcIlsoIGQgZSBmXCIsIFwiKGEsIGIsIGMpXCIsXG4gICAgICAgICAgICApXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgaXQgXCJbc3BhY2Ugc3BhcmF0ZWQgbXVsdGktbGluZV0gYXdhcmUgb2YgbmV4dGVkIHBhaXIgYW5kIHF1b3RlcyBhbmQgZXNjYXBlZCBxdW90ZVwiLCAtPlxuICAgICAgICAgIHNldCB0ZXh0Q186IFwiXCJcIlxuICAgICAgICAgICAgKFxuICAgICAgICAgICAgICB8XCIoYSwgYiwgYylcIiBcIlsoIGQgZSBmXCIgICAgICB0ZXN0KGcsIGgsIGkpXG4gICAgICAgICAgICAgIFwiXFxcXFwiaiwgaywgbFwiX19fXG4gICAgICAgICAgICAgICdcXFxcJ20sIG4nICAgIHRlc3QobywgcClcbiAgICAgICAgICAgIClcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIGVuc3VyZSAnZyByIGkgKCcsXG4gICAgICAgICAgICB0ZXh0Q186IFwiXCJcIlxuICAgICAgICAgICAgKFxuICAgICAgICAgICAgfCAgdGVzdChvLCBwKSAnXFxcXCdtLCBuJyAgICAgIFwiXFxcXFwiaiwgaywgbFwiXG4gICAgICAgICAgICAgIHRlc3QoZywgaCwgaSlfX19cbiAgICAgICAgICAgICAgXCJbKCBkIGUgZlwiICAgIFwiKGEsIGIsIGMpXCJcbiAgICAgICAgICAgIClcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgZGVzY3JpYmUgXCJTb3J0XCIsIC0+XG4gICAgICAgIGl0IFwiW2NvbW1hIHNlcGFyYXRlZF0gc29ydCB0ZXh0XCIsIC0+XG4gICAgICAgICAgc2V0IHRleHRDOiBcIiAgICggZG9nLCBjYXx0LCBmaXNoLCByYWJiaXQsIGR1Y2ssIGdvcGhlciwgc3F1aWQgKVwiXG4gICAgICAgICAgZW5zdXJlICdnIHMgaSAoJywgdGV4dEM6IFwiICAgKHwgY2F0LCBkb2csIGR1Y2ssIGZpc2gsIGdvcGhlciwgcmFiYml0LCBzcXVpZCApXCJcbiAgICAgIGRlc2NyaWJlIFwiU29ydEJ5TnVtYmVyXCIsIC0+XG4gICAgICAgIGl0IFwiW2NvbW1hIHNlcGFyYXRlZF0gc29ydCBieSBudW1iZXJcIiwgLT5cbiAgICAgICAgICBzZXQgdGV4dENfOiBcIl9fXyg5LCAxLCB8MTAsIDUpXCJcbiAgICAgICAgICBlbnN1cmUgJ2cgUyBpICgnLCB0ZXh0Q186IFwiX19fKHwxLCA1LCA5LCAxMClcIlxuXG4gICAgZGVzY3JpYmUgXCJsaW5ld2lzZSB0YXJnZXRcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgIHx6XG5cbiAgICAgICAgICAxMGFcbiAgICAgICAgICBiXG4gICAgICAgICAgYVxuXG4gICAgICAgICAgNVxuICAgICAgICAgIDFcXG5cbiAgICAgICAgICBcIlwiXCJcbiAgICAgIGRlc2NyaWJlIFwiUmV2ZXJzZVwiLCAtPlxuICAgICAgICBpdCBcInJldmVyc2Ugcm93c1wiLCAtPlxuICAgICAgICAgIGVuc3VyZSAnZyByIEcnLFxuICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgfDFcbiAgICAgICAgICAgIDVcblxuICAgICAgICAgICAgYVxuICAgICAgICAgICAgYlxuICAgICAgICAgICAgMTBhXG5cbiAgICAgICAgICAgIHpcXG5cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgZGVzY3JpYmUgXCJTb3J0XCIsIC0+XG4gICAgICAgIGl0IFwic29ydCByb3dzXCIsIC0+XG4gICAgICAgICAgZW5zdXJlICdnIHMgRycsXG4gICAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICB8XG5cbiAgICAgICAgICAgIDFcbiAgICAgICAgICAgIDEwYVxuICAgICAgICAgICAgNVxuICAgICAgICAgICAgYVxuICAgICAgICAgICAgYlxuICAgICAgICAgICAgelxcblxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICBkZXNjcmliZSBcIlNvcnRCeU51bWJlclwiLCAtPlxuICAgICAgICBpdCBcInNvcnQgcm93cyBudW1lcmljYWxseVwiLCAtPlxuICAgICAgICAgIGVuc3VyZSBcImcgUyBHXCIsXG4gICAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICB8MVxuICAgICAgICAgICAgNVxuICAgICAgICAgICAgMTBhXG4gICAgICAgICAgICB6XG5cbiAgICAgICAgICAgIGJcbiAgICAgICAgICAgIGFcbiAgICAgICAgICAgIFxcblxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICBkZXNjcmliZSBcIlNvcnRDYXNlSW5zZW5zaXRpdmVseVwiLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgYXRvbS5rZXltYXBzLmFkZCBcInRlc3RcIixcbiAgICAgICAgICAgICdhdG9tLXRleHQtZWRpdG9yLnZpbS1tb2RlLXBsdXM6bm90KC5pbnNlcnQtbW9kZSknOlxuICAgICAgICAgICAgICAnZyBzJzogJ3ZpbS1tb2RlLXBsdXM6c29ydC1jYXNlLWluc2Vuc2l0aXZlbHknXG4gICAgICAgIGl0IFwiU29ydCByb3dzIGNhc2UtaW5zZW5zaXRpdmVseVwiLCAtPlxuICAgICAgICAgIHNldFxuICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgfGFwcGxlXG4gICAgICAgICAgICBCZWVmXG4gICAgICAgICAgICBBUFBMRVxuICAgICAgICAgICAgRE9HXG4gICAgICAgICAgICBiZWVmXG4gICAgICAgICAgICBBcHBsZVxuICAgICAgICAgICAgQkVFRlxuICAgICAgICAgICAgRG9nXG4gICAgICAgICAgICBkb2dcXG5cbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgICAgZW5zdXJlIFwiZyBzIEdcIixcbiAgICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgYXBwbGVcbiAgICAgICAgICAgIEFwcGxlXG4gICAgICAgICAgICBBUFBMRVxuICAgICAgICAgICAgYmVlZlxuICAgICAgICAgICAgQmVlZlxuICAgICAgICAgICAgQkVFRlxuICAgICAgICAgICAgZG9nXG4gICAgICAgICAgICBEb2dcbiAgICAgICAgICAgIERPR1xcblxuICAgICAgICAgICAgXCJcIlwiXG4iXX0=
