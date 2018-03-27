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
        it("indents the current selection and exits visual mode", function() {
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
          ensure('y s i w b', {
            text: "(abc)"
          });
          set({
            textC: "|abc"
          });
          ensure('y s i w B', {
            text: "{abc}"
          });
          set({
            textC: "|abc"
          });
          ensure('y s i w r', {
            text: "[abc]"
          });
          set({
            textC: "|abc"
          });
          return ensure('y s i w a', {
            text: "<abc>"
          });
        });
        it("delete surround by aliased char", function() {
          set({
            textC: "|(abc)"
          });
          ensure('d S b', {
            text: "abc"
          });
          set({
            textC: "|{abc}"
          });
          ensure('d S B', {
            text: "abc"
          });
          set({
            textC: "|[abc]"
          });
          ensure('d S r', {
            text: "abc"
          });
          set({
            textC: "|<abc>"
          });
          return ensure('d S a', {
            text: "abc"
          });
        });
        return it("change surround by aliased char", function() {
          set({
            textC: "|(abc)"
          });
          ensure('c S b B', {
            text: "{abc}"
          });
          set({
            textC: "|(abc)"
          });
          ensure('c S b r', {
            text: "[abc]"
          });
          set({
            textC: "|(abc)"
          });
          ensure('c S b a', {
            text: "<abc>"
          });
          set({
            textC: "|{abc}"
          });
          ensure('c S B b', {
            text: "(abc)"
          });
          set({
            textC: "|{abc}"
          });
          ensure('c S B r', {
            text: "[abc]"
          });
          set({
            textC: "|{abc}"
          });
          ensure('c S B a', {
            text: "<abc>"
          });
          set({
            textC: "|[abc]"
          });
          ensure('c S r b', {
            text: "(abc)"
          });
          set({
            textC: "|[abc]"
          });
          ensure('c S r B', {
            text: "{abc}"
          });
          set({
            textC: "|[abc]"
          });
          ensure('c S r a', {
            text: "<abc>"
          });
          set({
            textC: "|<abc>"
          });
          ensure('c S a b', {
            text: "(abc)"
          });
          set({
            textC: "|<abc>"
          });
          ensure('c S a B', {
            text: "{abc}"
          });
          set({
            textC: "|<abc>"
          });
          return ensure('c S a r', {
            text: "[abc]"
          });
        });
      });
      describe('surround', function() {
        it("surround text object with ( and repeatable", function() {
          ensure('y s i w (', {
            textC: "|(apple)\npairs: [brackets]\npairs: [brackets]\n( multi\n  line )"
          });
          return ensure('j .', {
            text: "(apple)\n(pairs): [brackets]\npairs: [brackets]\n( multi\n  line )"
          });
        });
        it("surround text object with { and repeatable", function() {
          ensure('y s i w {', {
            textC: "|{apple}\npairs: [brackets]\npairs: [brackets]\n( multi\n  line )"
          });
          return ensure('j .', {
            textC: "{apple}\n|{pairs}: [brackets]\npairs: [brackets]\n( multi\n  line )"
          });
        });
        it("surround current-line", function() {
          ensure('y s s {', {
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
            return ensure('y s i f {', {
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
              return ensure('y s f e (', {
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
              return ensure('y s ` a (', {
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
              ensure('y s i w (', {
                text: "( apple )\norange\nlemmon"
              });
              keystroke('j');
              ensure('y s i w {', {
                text: "( apple )\n{ orange }\nlemmon"
              });
              keystroke('j');
              return ensure('y s i w [', {
                text: "( apple )\n{ orange }\n[ lemmon ]"
              });
            });
          });
          describe("char is not in charactersToAddSpaceOnSurround", function() {
            return it("add additional space inside pair char when surround", function() {
              ensure('y s i w )', {
                text: "(apple)\norange\nlemmon"
              });
              keystroke('j');
              ensure('y s i w }', {
                text: "(apple)\n{orange}\nlemmon"
              });
              keystroke('j');
              return ensure('y s i w ]', {
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
                ensure('y s i w (', {
                  text: "( abc )"
                });
                set({
                  textC: "|abc"
                });
                ensure('y s i w b', {
                  text: "(abc)"
                });
                set({
                  textC: "|abc"
                });
                ensure('y s i w {', {
                  text: "{ abc }"
                });
                set({
                  textC: "|abc"
                });
                ensure('y s i w B', {
                  text: "{abc}"
                });
                set({
                  textC: "|abc"
                });
                ensure('y s i w [', {
                  text: "[ abc ]"
                });
                set({
                  textC: "|abc"
                });
                ensure('y s i w r', {
                  text: "[abc]"
                });
                set({
                  textC: "|abc"
                });
                ensure('y s i w <', {
                  text: "< abc >"
                });
                set({
                  textC: "|abc"
                });
                return ensure('y s i w a', {
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
                ensure('y s i w (', {
                  text: "(abc)"
                });
                set({
                  textC: "|abc"
                });
                ensure('y s i w b', {
                  text: "( abc )"
                });
                set({
                  textC: "|abc"
                });
                ensure('y s i w {', {
                  text: "{abc}"
                });
                set({
                  textC: "|abc"
                });
                ensure('y s i w B', {
                  text: "{ abc }"
                });
                set({
                  textC: "|abc"
                });
                ensure('y s i w [', {
                  text: "[abc]"
                });
                set({
                  textC: "|abc"
                });
                ensure('y s i w r', {
                  text: "[ abc ]"
                });
                set({
                  textC: "|abc"
                });
                ensure('y s i w <', {
                  text: "<abc>"
                });
                set({
                  textC: "|abc"
                });
                return ensure('y s i w a', {
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
            textC: "\n\"apple\"\n\"pairs\" \"tomato\"\n\"orange\"\n|\"milk\"\n"
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
          ensure('d S [', {
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
          return ensure('d S (', {
            text: "apple\npairs: [brackets]\npairs: [brackets]\n multi\n  line "
          });
        });
        it("delete surrounded chars and trim padding spaces for non-identical pair-char", function() {
          set({
            text: "( apple )\n{  orange   }\n",
            cursor: [0, 0]
          });
          ensure('d S (', {
            text: "apple\n{  orange   }\n"
          });
          return ensure('j d S {', {
            text: "apple\norange\n"
          });
        });
        it("delete surrounded chars and NOT trim padding spaces for identical pair-char", function() {
          set({
            text: "` apple `\n\"  orange   \"\n",
            cursor: [0, 0]
          });
          ensure('d S `', {
            text_: '_apple_\n"__orange___"\n'
          });
          return ensure('j d S "', {
            text_: "_apple_\n__orange___\n"
          });
        });
        return it("delete surrounded for multi-line but dont affect code layout", function() {
          set({
            cursor: [0, 34],
            text: "highlightRanges @editor, range, {\n  timeout: timeout\n  hello: world\n}"
          });
          return ensure('d S {', {
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
          ensure('c S ( [', {
            text: "[apple]\n(grape)\n<lemmon>\n{orange}"
          });
          return ensure('j l .', {
            text: "[apple]\n[grape]\n<lemmon>\n{orange}"
          });
        });
        it("change surrounded chars", function() {
          ensure('j j c S < "', {
            text: "(apple)\n(grape)\n\"lemmon\"\n{orange}"
          });
          return ensure('j l c S { !', {
            text: "(apple)\n(grape)\n\"lemmon\"\n!orange!"
          });
        });
        it("change surrounded for multi-line but dont affect code layout", function() {
          set({
            cursor: [0, 34],
            text: "highlightRanges @editor, range, {\n  timeout: timeout\n  hello: world\n}"
          });
          return ensure('c S { (', {
            text: "highlightRanges @editor, range, (\n  timeout: timeout\n  hello: world\n)"
          });
        });
        return describe('charactersToAddSpaceOnSurround setting', function() {
          beforeEach(function() {
            return settings.set('charactersToAddSpaceOnSurround', ['(', '{', '[']);
          });
          describe('when input char is in charactersToAddSpaceOnSurround', function() {
            describe('single line text', function() {
              return it("add single space around pair regardless of exsiting inner text", function() {
                set({
                  textC: "|(apple)"
                });
                ensure('c S ( {', {
                  text: "{ apple }"
                });
                set({
                  textC: "|( apple )"
                });
                ensure('c S ( {', {
                  text: "{ apple }"
                });
                set({
                  textC: "|(  apple  )"
                });
                return ensure('c S ( {', {
                  text: "{ apple }"
                });
              });
            });
            return describe('multi line text', function() {
              return it("don't sadd single space around pair", function() {
                set({
                  textC: "|(\napple\n)"
                });
                return ensure("c S ( {", {
                  text: "{\napple\n}"
                });
              });
            });
          });
          return describe('when first input char is not in charactersToAddSpaceOnSurround', function() {
            it("remove surrounding space of inner text for identical pair-char", function() {
              set({
                textC: "|(apple)"
              });
              ensure("c S ( }", {
                text: "{apple}"
              });
              set({
                textC: "|( apple )"
              });
              ensure("c S ( }", {
                text: "{apple}"
              });
              set({
                textC: "|(  apple  )"
              });
              return ensure("c S ( }", {
                text: "{apple}"
              });
            });
            return it("doesn't remove surrounding space of inner text for non-identical pair-char", function() {
              set({
                textC: '|"apple"'
              });
              ensure('c S " `', {
                text: "`apple`"
              });
              set({
                textC: '|"  apple  "'
              });
              ensure('c S " `', {
                text: "`  apple  `"
              });
              set({
                textC: '|"  apple  "'
              });
              return ensure('c S " \'', {
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
          ensure('y s w (', {
            textC: "|(apple)\npairs: [brackets]\npairs: [brackets]\n( multi\n  line )"
          });
          return ensure('j .', {
            textC: "(apple)\n|(pairs): [brackets]\npairs: [brackets]\n( multi\n  line )"
          });
        });
        return it("surround a word with { and repeatable", function() {
          ensure('y s w {', {
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
          ensure('c s <', {
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
          ensure('c s <', {
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
        return ensure('" a _ i (', {
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
        return ensure('" a g p i (', {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9zcGVjL29wZXJhdG9yLXRyYW5zZm9ybS1zdHJpbmctc3BlYy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLE1BQTBCLE9BQUEsQ0FBUSxlQUFSLENBQTFCLEVBQUMsNkJBQUQsRUFBYzs7RUFDZCxRQUFBLEdBQVcsT0FBQSxDQUFRLGlCQUFSOztFQUVYLFFBQUEsQ0FBUywwQkFBVCxFQUFxQyxTQUFBO0FBQ25DLFFBQUE7SUFBQSxPQUE0RCxFQUE1RCxFQUFDLGFBQUQsRUFBTSxnQkFBTixFQUFjLG1CQUFkLEVBQXlCLGdCQUF6QixFQUFpQyx1QkFBakMsRUFBZ0Q7SUFFaEQsVUFBQSxDQUFXLFNBQUE7YUFDVCxXQUFBLENBQVksU0FBQyxLQUFELEVBQVEsR0FBUjtRQUNWLFFBQUEsR0FBVztRQUNWLHdCQUFELEVBQVM7ZUFDUixhQUFELEVBQU0sbUJBQU4sRUFBYyx5QkFBZCxFQUEyQjtNQUhqQixDQUFaO0lBRFMsQ0FBWDtJQU1BLFFBQUEsQ0FBUyxrQkFBVCxFQUE2QixTQUFBO01BQzNCLFVBQUEsQ0FBVyxTQUFBO2VBQ1QsR0FBQSxDQUNFO1VBQUEsS0FBQSxFQUFPLFlBQVA7U0FERjtNQURTLENBQVg7TUFPQSxFQUFBLENBQUcsa0NBQUgsRUFBdUMsU0FBQTtRQUNyQyxNQUFBLENBQU8sR0FBUCxFQUNFO1VBQUEsS0FBQSxFQUFPLFlBQVA7U0FERjtRQUtBLE1BQUEsQ0FBTyxHQUFQLEVBQ0U7VUFBQSxLQUFBLEVBQU8sWUFBUDtTQURGO2VBTUEsTUFBQSxDQUFRLEdBQVIsRUFDRTtVQUFBLEtBQUEsRUFBTyxZQUFQO1NBREY7TUFacUMsQ0FBdkM7TUFrQkEsRUFBQSxDQUFHLGVBQUgsRUFBb0IsU0FBQTtlQUNsQixNQUFBLENBQU8sS0FBUCxFQUNFO1VBQUEsS0FBQSxFQUFP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RjthQURGO1VBRFMsQ0FBWDtpQkFJQSxFQUFBLENBQUcsOEJBQUgsRUFBbUMsU0FBQTtZQUNqQyxHQUFBLENBQ0U7Y0FBQSxLQUFBLEVBQU8seURBQVA7YUFERjttQkFhQSxNQUFBLENBQU8sT0FBUCxFQUNFO2NBQUEsSUFBQSxFQUFNLHdEQUFOO2FBREY7VUFkaUMsQ0FBbkM7UUFMZ0MsQ0FBbEM7TUFwRDBCLENBQTVCO0lBM0ZtRixDQUFyRjtFQTc0Q21DLENBQXJDO0FBSEEiLCJzb3VyY2VzQ29udGVudCI6WyJ7Z2V0VmltU3RhdGUsIGRpc3BhdGNofSA9IHJlcXVpcmUgJy4vc3BlYy1oZWxwZXInXG5zZXR0aW5ncyA9IHJlcXVpcmUgJy4uL2xpYi9zZXR0aW5ncydcblxuZGVzY3JpYmUgXCJPcGVyYXRvciBUcmFuc2Zvcm1TdHJpbmdcIiwgLT5cbiAgW3NldCwgZW5zdXJlLCBrZXlzdHJva2UsIGVkaXRvciwgZWRpdG9yRWxlbWVudCwgdmltU3RhdGVdID0gW11cblxuICBiZWZvcmVFYWNoIC0+XG4gICAgZ2V0VmltU3RhdGUgKHN0YXRlLCB2aW0pIC0+XG4gICAgICB2aW1TdGF0ZSA9IHN0YXRlXG4gICAgICB7ZWRpdG9yLCBlZGl0b3JFbGVtZW50fSA9IHZpbVN0YXRlXG4gICAgICB7c2V0LCBlbnN1cmUsIGtleXN0cm9rZX0gPSB2aW1cblxuICBkZXNjcmliZSAndGhlIH4ga2V5YmluZGluZycsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2V0XG4gICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgfGFCY1xuICAgICAgICB8WHlaXG4gICAgICAgIFwiXCJcIlxuXG4gICAgaXQgJ3RvZ2dsZXMgdGhlIGNhc2UgYW5kIG1vdmVzIHJpZ2h0JywgLT5cbiAgICAgIGVuc3VyZSAnficsXG4gICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgQXxCY1xuICAgICAgICB4fHlaXG4gICAgICAgIFwiXCJcIlxuICAgICAgZW5zdXJlICd+JyxcbiAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICBBYnxjXG4gICAgICAgIHhZfFpcbiAgICAgICAgXCJcIlwiXG5cbiAgICAgIGVuc3VyZSAgJ34nLFxuICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgIEFifENcbiAgICAgICAgeFl8elxuICAgICAgICBcIlwiXCJcblxuICAgIGl0ICd0YWtlcyBhIGNvdW50JywgLT5cbiAgICAgIGVuc3VyZSAnNCB+JyxcbiAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICBBYnxDXG4gICAgICAgIHhZfHpcbiAgICAgICAgXCJcIlwiXG5cbiAgICBkZXNjcmliZSBcImluIHZpc3VhbCBtb2RlXCIsIC0+XG4gICAgICBpdCBcInRvZ2dsZXMgdGhlIGNhc2Ugb2YgdGhlIHNlbGVjdGVkIHRleHRcIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzAsIDBdXG4gICAgICAgIGVuc3VyZSAnViB+JywgdGV4dDogJ0FiQ1xcblh5WidcblxuICAgIGRlc2NyaWJlIFwid2l0aCBnIGFuZCBtb3Rpb25cIiwgLT5cbiAgICAgIGl0IFwidG9nZ2xlcyB0aGUgY2FzZSBvZiB0ZXh0LCB3b24ndCBtb3ZlIGN1cnNvclwiLCAtPlxuICAgICAgICBzZXQgdGV4dEM6IFwifGFCY1xcblh5WlwiXG4gICAgICAgIGVuc3VyZSAnZyB+IDIgbCcsIHRleHRDOiAnfEFiY1xcblh5WidcblxuICAgICAgaXQgXCJnfn4gdG9nZ2xlcyB0aGUgbGluZSBvZiB0ZXh0LCB3b24ndCBtb3ZlIGN1cnNvclwiLCAtPlxuICAgICAgICBzZXQgdGV4dEM6IFwiYXxCY1xcblh5WlwiXG4gICAgICAgIGVuc3VyZSAnZyB+IH4nLCB0ZXh0QzogJ0F8YkNcXG5YeVonXG5cbiAgICAgIGl0IFwiZ35nfiB0b2dnbGVzIHRoZSBsaW5lIG9mIHRleHQsIHdvbid0IG1vdmUgY3Vyc29yXCIsIC0+XG4gICAgICAgIHNldCB0ZXh0QzogXCJhfEJjXFxuWHlaXCJcbiAgICAgICAgZW5zdXJlICdnIH4gZyB+JywgdGV4dEM6ICdBfGJDXFxuWHlaJ1xuXG4gIGRlc2NyaWJlICd0aGUgVSBrZXliaW5kaW5nJywgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXRcbiAgICAgICAgdGV4dDogJ2FCY1xcblh5WidcbiAgICAgICAgY3Vyc29yOiBbMCwgMF1cblxuICAgIGl0IFwibWFrZXMgdGV4dCB1cHBlcmNhc2Ugd2l0aCBnIGFuZCBtb3Rpb24sIGFuZCB3b24ndCBtb3ZlIGN1cnNvclwiLCAtPlxuICAgICAgZW5zdXJlICdnIFUgbCcsIHRleHQ6ICdBQmNcXG5YeVonLCBjdXJzb3I6IFswLCAwXVxuICAgICAgZW5zdXJlICdnIFUgZScsIHRleHQ6ICdBQkNcXG5YeVonLCBjdXJzb3I6IFswLCAwXVxuICAgICAgc2V0IGN1cnNvcjogWzEsIDBdXG4gICAgICBlbnN1cmUgJ2cgVSAkJywgdGV4dDogJ0FCQ1xcblhZWicsIGN1cnNvcjogWzEsIDBdXG5cbiAgICBpdCBcIm1ha2VzIHRoZSBzZWxlY3RlZCB0ZXh0IHVwcGVyY2FzZSBpbiB2aXN1YWwgbW9kZVwiLCAtPlxuICAgICAgZW5zdXJlICdWIFUnLCB0ZXh0OiAnQUJDXFxuWHlaJ1xuXG4gICAgaXQgXCJnVVUgdXBjYXNlIHRoZSBsaW5lIG9mIHRleHQsIHdvbid0IG1vdmUgY3Vyc29yXCIsIC0+XG4gICAgICBzZXQgY3Vyc29yOiBbMCwgMV1cbiAgICAgIGVuc3VyZSAnZyBVIFUnLCB0ZXh0OiAnQUJDXFxuWHlaJywgY3Vyc29yOiBbMCwgMV1cblxuICAgIGl0IFwiZ1VnVSB1cGNhc2UgdGhlIGxpbmUgb2YgdGV4dCwgd29uJ3QgbW92ZSBjdXJzb3JcIiwgLT5cbiAgICAgIHNldCBjdXJzb3I6IFswLCAxXVxuICAgICAgZW5zdXJlICdnIFUgZyBVJywgdGV4dDogJ0FCQ1xcblh5WicsIGN1cnNvcjogWzAsIDFdXG5cbiAgZGVzY3JpYmUgJ3RoZSB1IGtleWJpbmRpbmcnLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNldCB0ZXh0OiAnYUJjXFxuWHlaJywgY3Vyc29yOiBbMCwgMF1cblxuICAgIGl0IFwibWFrZXMgdGV4dCBsb3dlcmNhc2Ugd2l0aCBnIGFuZCBtb3Rpb24sIGFuZCB3b24ndCBtb3ZlIGN1cnNvclwiLCAtPlxuICAgICAgZW5zdXJlICdnIHUgJCcsIHRleHQ6ICdhYmNcXG5YeVonLCBjdXJzb3I6IFswLCAwXVxuXG4gICAgaXQgXCJtYWtlcyB0aGUgc2VsZWN0ZWQgdGV4dCBsb3dlcmNhc2UgaW4gdmlzdWFsIG1vZGVcIiwgLT5cbiAgICAgIGVuc3VyZSAnViB1JywgdGV4dDogJ2FiY1xcblh5WidcblxuICAgIGl0IFwiZ3V1IGRvd25jYXNlIHRoZSBsaW5lIG9mIHRleHQsIHdvbid0IG1vdmUgY3Vyc29yXCIsIC0+XG4gICAgICBzZXQgY3Vyc29yOiBbMCwgMV1cbiAgICAgIGVuc3VyZSAnZyB1IHUnLCB0ZXh0OiAnYWJjXFxuWHlaJywgY3Vyc29yOiBbMCwgMV1cblxuICAgIGl0IFwiZ3VndSBkb3duY2FzZSB0aGUgbGluZSBvZiB0ZXh0LCB3b24ndCBtb3ZlIGN1cnNvclwiLCAtPlxuICAgICAgc2V0IGN1cnNvcjogWzAsIDFdXG4gICAgICBlbnN1cmUgJ2cgdSBnIHUnLCB0ZXh0OiAnYWJjXFxuWHlaJywgY3Vyc29yOiBbMCwgMV1cblxuICBkZXNjcmliZSBcInRoZSA+IGtleWJpbmRpbmdcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXQgdGV4dDogXCJcIlwiXG4gICAgICAgIDEyMzQ1XG4gICAgICAgIGFiY2RlXG4gICAgICAgIEFCQ0RFXG4gICAgICAgIFwiXCJcIlxuXG4gICAgZGVzY3JpYmUgXCI+ID5cIiwgLT5cbiAgICAgIGRlc2NyaWJlIFwiZnJvbSBmaXJzdCBsaW5lXCIsIC0+XG4gICAgICAgIGl0IFwiaW5kZW50cyB0aGUgY3VycmVudCBsaW5lXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzAsIDBdXG4gICAgICAgICAgZW5zdXJlICc+ID4nLFxuICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgICB8MTIzNDVcbiAgICAgICAgICAgIGFiY2RlXG4gICAgICAgICAgICBBQkNERVxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgIGl0IFwiY291bnQgbWVhbnMgTiBsaW5lIGluZGVudHMgYW5kIHVuZG9hYmxlLCByZXBlYXRhYmxlXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzAsIDBdXG4gICAgICAgICAgZW5zdXJlICczID4gPicsXG4gICAgICAgICAgICB0ZXh0Q186IFwiXCJcIlxuICAgICAgICAgICAgX198MTIzNDVcbiAgICAgICAgICAgIF9fYWJjZGVcbiAgICAgICAgICAgIF9fQUJDREVcbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgICAgZW5zdXJlICd1JyxcbiAgICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAgIHwxMjM0NVxuICAgICAgICAgICAgYWJjZGVcbiAgICAgICAgICAgIEFCQ0RFXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICAgIGVuc3VyZSAnLiAuJyxcbiAgICAgICAgICAgIHRleHRDXzogXCJcIlwiXG4gICAgICAgICAgICBfX19ffDEyMzQ1XG4gICAgICAgICAgICBfX19fYWJjZGVcbiAgICAgICAgICAgIF9fX19BQkNERVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgIGRlc2NyaWJlIFwiZnJvbSBsYXN0IGxpbmVcIiwgLT5cbiAgICAgICAgaXQgXCJpbmRlbnRzIHRoZSBjdXJyZW50IGxpbmVcIiwgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMiwgMF1cbiAgICAgICAgICBlbnN1cmUgJz4gPicsXG4gICAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICAxMjM0NVxuICAgICAgICAgICAgYWJjZGVcbiAgICAgICAgICAgICAgfEFCQ0RFXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgIGRlc2NyaWJlIFwiaW4gdmlzdWFsIG1vZGVcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzAsIDBdXG5cbiAgICAgIGl0IFwiW3ZDXSBpbmRlbnQgc2VsZWN0ZWQgbGluZXNcIiwgLT5cbiAgICAgICAgZW5zdXJlIFwidiBqID5cIixcbiAgICAgICAgICBtb2RlOiAnbm9ybWFsJ1xuICAgICAgICAgIHRleHRDXzogXCJcIlwiXG4gICAgICAgICAgX198MTIzNDVcbiAgICAgICAgICBfX2FiY2RlXG4gICAgICAgICAgQUJDREVcbiAgICAgICAgICBcIlwiXCJcbiAgICAgIGl0IFwiW3ZMXSBpbmRlbnQgc2VsZWN0ZWQgbGluZXNcIiwgLT5cbiAgICAgICAgZW5zdXJlIFwiViA+XCIsXG4gICAgICAgICAgbW9kZTogJ25vcm1hbCdcbiAgICAgICAgICB0ZXh0Q186IFwiXCJcIlxuICAgICAgICAgIF9ffDEyMzQ1XG4gICAgICAgICAgYWJjZGVcbiAgICAgICAgICBBQkNERVxuICAgICAgICAgIFwiXCJcIlxuICAgICAgICBlbnN1cmUgJy4nLFxuICAgICAgICAgIHRleHRDXzogXCJcIlwiXG4gICAgICAgICAgX19fX3wxMjM0NVxuICAgICAgICAgIGFiY2RlXG4gICAgICAgICAgQUJDREVcbiAgICAgICAgICBcIlwiXCJcbiAgICAgIGl0IFwiW3ZMXSBjb3VudCBtZWFucyBOIHRpbWVzIGluZGVudFwiLCAtPlxuICAgICAgICBlbnN1cmUgXCJWIDMgPlwiLFxuICAgICAgICAgIG1vZGU6ICdub3JtYWwnXG4gICAgICAgICAgdGV4dENfOiBcIlwiXCJcbiAgICAgICAgICBfX19fX198MTIzNDVcbiAgICAgICAgICBhYmNkZVxuICAgICAgICAgIEFCQ0RFXG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgIGVuc3VyZSAnLicsXG4gICAgICAgICAgdGV4dENfOiBcIlwiXCJcbiAgICAgICAgICBfX19fX19fX19fX198MTIzNDVcbiAgICAgICAgICBhYmNkZVxuICAgICAgICAgIEFCQ0RFXG4gICAgICAgICAgXCJcIlwiXG5cbiAgICBkZXNjcmliZSBcImluIHZpc3VhbCBtb2RlIGFuZCBzdGF5T25UcmFuc2Zvcm1TdHJpbmcgZW5hYmxlZFwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXR0aW5ncy5zZXQoJ3N0YXlPblRyYW5zZm9ybVN0cmluZycsIHRydWUpXG4gICAgICAgIHNldCBjdXJzb3I6IFswLCAwXVxuXG4gICAgICBpdCBcImluZGVudHMgdGhlIGN1cnJlbnQgc2VsZWN0aW9uIGFuZCBleGl0cyB2aXN1YWwgbW9kZVwiLCAtPlxuICAgICAgICBlbnN1cmUgJ3YgaiA+JyxcbiAgICAgICAgICBtb2RlOiAnbm9ybWFsJ1xuICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAgIDEyMzQ1XG4gICAgICAgICAgICB8YWJjZGVcbiAgICAgICAgICBBQkNERVxuICAgICAgICAgIFwiXCJcIlxuICAgICAgaXQgXCJ3aGVuIHJlcGVhdGVkLCBvcGVyYXRlIG9uIHNhbWUgcmFuZ2Ugd2hlbiBjdXJzb3Igd2FzIG5vdCBtb3ZlZFwiLCAtPlxuICAgICAgICBlbnN1cmUgJ3YgaiA+JyxcbiAgICAgICAgICBtb2RlOiAnbm9ybWFsJ1xuICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAgIDEyMzQ1XG4gICAgICAgICAgICB8YWJjZGVcbiAgICAgICAgICBBQkNERVxuICAgICAgICAgIFwiXCJcIlxuICAgICAgICBlbnN1cmUgJy4nLFxuICAgICAgICAgIG1vZGU6ICdub3JtYWwnXG4gICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgICAxMjM0NVxuICAgICAgICAgICAgICB8YWJjZGVcbiAgICAgICAgICBBQkNERVxuICAgICAgICAgIFwiXCJcIlxuICAgICAgaXQgXCJ3aGVuIHJlcGVhdGVkLCBvcGVyYXRlIG9uIHJlbGF0aXZlIHJhbmdlIGZyb20gY3Vyc29yIHBvc2l0aW9uIHdpdGggc2FtZSBleHRlbnQgd2hlbiBjdXJzb3Igd2FzIG1vdmVkXCIsIC0+XG4gICAgICAgIGVuc3VyZSAndiBqID4nLFxuICAgICAgICAgIG1vZGU6ICdub3JtYWwnXG4gICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgMTIzNDVcbiAgICAgICAgICAgIHxhYmNkZVxuICAgICAgICAgIEFCQ0RFXG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgIGVuc3VyZSAnbCAuJyxcbiAgICAgICAgICBtb2RlOiAnbm9ybWFsJ1xuICAgICAgICAgIHRleHRDXzogXCJcIlwiXG4gICAgICAgICAgX18xMjM0NVxuICAgICAgICAgIF9fX19hfGJjZGVcbiAgICAgICAgICBfX0FCQ0RFXG4gICAgICAgICAgXCJcIlwiXG5cbiAgZGVzY3JpYmUgXCJ0aGUgPCBrZXliaW5kaW5nXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2V0XG4gICAgICAgIHRleHRDXzogXCJcIlwiXG4gICAgICAgIHxfXzEyMzQ1XG4gICAgICAgIF9fYWJjZGVcbiAgICAgICAgQUJDREVcbiAgICAgICAgXCJcIlwiXG5cbiAgICBkZXNjcmliZSBcIndoZW4gZm9sbG93ZWQgYnkgYSA8XCIsIC0+XG4gICAgICBpdCBcImluZGVudHMgdGhlIGN1cnJlbnQgbGluZVwiLCAtPlxuICAgICAgICBlbnN1cmUgJzwgPCcsXG4gICAgICAgICAgdGV4dENfOiBcIlwiXCJcbiAgICAgICAgICB8MTIzNDVcbiAgICAgICAgICBfX2FiY2RlXG4gICAgICAgICAgQUJDREVcbiAgICAgICAgICBcIlwiXCJcblxuICAgIGRlc2NyaWJlIFwid2hlbiBmb2xsb3dlZCBieSBhIHJlcGVhdGluZyA8XCIsIC0+XG4gICAgICBpdCBcImluZGVudHMgbXVsdGlwbGUgbGluZXMgYXQgb25jZSBhbmQgdW5kb2FibGVcIiwgLT5cbiAgICAgICAgZW5zdXJlICcyIDwgPCcsXG4gICAgICAgICAgdGV4dENfOiBcIlwiXCJcbiAgICAgICAgICB8MTIzNDVcbiAgICAgICAgICBhYmNkZVxuICAgICAgICAgIEFCQ0RFXG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgIGVuc3VyZSAndScsXG4gICAgICAgICAgdGV4dENfOiBcIlwiXCJcbiAgICAgICAgICB8X18xMjM0NVxuICAgICAgICAgIF9fYWJjZGVcbiAgICAgICAgICBBQkNERVxuICAgICAgICAgIFwiXCJcIlxuXG4gICAgZGVzY3JpYmUgXCJpbiB2aXN1YWwgbW9kZVwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0Q186IFwiXCJcIlxuICAgICAgICAgIHxfX19fX18xMjM0NVxuICAgICAgICAgIF9fX19fX2FiY2RlXG4gICAgICAgICAgQUJDREVcbiAgICAgICAgICBcIlwiXCJcblxuICAgICAgaXQgXCJjb3VudCBtZWFucyBOIHRpbWVzIG91dGRlbnRcIiwgLT5cbiAgICAgICAgZW5zdXJlICdWIGogMiA8JyxcbiAgICAgICAgICB0ZXh0Q186IFwiXCJcIlxuICAgICAgICAgIF9ffDEyMzQ1XG4gICAgICAgICAgX19hYmNkZVxuICAgICAgICAgIEFCQ0RFXG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgICMgVGhpcyBpcyBub3QgaWRlYWwgY3Vyc29yIHBvc2l0aW9uLCBidXQgY3VycmVudCBsaW1pdGF0aW9uLlxuICAgICAgICAjIFNpbmNlIGluZGVudCBkZXBlbmRpbmcgb24gQXRvbSdzIHNlbGVjdGlvbi5pbmRlbnRTZWxlY3RlZFJvd3MoKVxuICAgICAgICAjIEltcGxlbWVudGluZyBpdCB2bXAgaW5kZXBlbmRlbnRseSBzb2x2ZSBpc3N1ZSwgYnV0IEkgaGF2ZSBhbm90aGVyIGlkZWEgYW5kIHdhbnQgdG8gdXNlIEF0b20ncyBvbmUgbm93LlxuICAgICAgICBlbnN1cmUgJ3UnLFxuICAgICAgICAgIHRleHRDXzogXCJcIlwiXG4gICAgICAgICAgX19fX19fMTIzNDVcbiAgICAgICAgICB8X19fX19fYWJjZGVcbiAgICAgICAgICBBQkNERVxuICAgICAgICAgIFwiXCJcIlxuXG4gIGRlc2NyaWJlIFwidGhlID0ga2V5YmluZGluZ1wiLCAtPlxuICAgIG9sZEdyYW1tYXIgPSBbXVxuXG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICAgIGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKCdsYW5ndWFnZS1qYXZhc2NyaXB0JylcblxuICAgICAgb2xkR3JhbW1hciA9IGVkaXRvci5nZXRHcmFtbWFyKClcbiAgICAgIHNldCB0ZXh0OiBcImZvb1xcbiAgYmFyXFxuICBiYXpcIiwgY3Vyc29yOiBbMSwgMF1cblxuXG4gICAgZGVzY3JpYmUgXCJ3aGVuIHVzZWQgaW4gYSBzY29wZSB0aGF0IHN1cHBvcnRzIGF1dG8taW5kZW50XCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIGpzR3JhbW1hciA9IGF0b20uZ3JhbW1hcnMuZ3JhbW1hckZvclNjb3BlTmFtZSgnc291cmNlLmpzJylcbiAgICAgICAgZWRpdG9yLnNldEdyYW1tYXIoanNHcmFtbWFyKVxuXG4gICAgICBhZnRlckVhY2ggLT5cbiAgICAgICAgZWRpdG9yLnNldEdyYW1tYXIob2xkR3JhbW1hcilcblxuICAgICAgZGVzY3JpYmUgXCJ3aGVuIGZvbGxvd2VkIGJ5IGEgPVwiLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAga2V5c3Ryb2tlICc9ID0nXG5cbiAgICAgICAgaXQgXCJpbmRlbnRzIHRoZSBjdXJyZW50IGxpbmVcIiwgLT5cbiAgICAgICAgICBleHBlY3QoZWRpdG9yLmluZGVudGF0aW9uRm9yQnVmZmVyUm93KDEpKS50b0JlIDBcblxuICAgICAgZGVzY3JpYmUgXCJ3aGVuIGZvbGxvd2VkIGJ5IGEgcmVwZWF0aW5nID1cIiwgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIGtleXN0cm9rZSAnMiA9ID0nXG5cbiAgICAgICAgaXQgXCJhdXRvaW5kZW50cyBtdWx0aXBsZSBsaW5lcyBhdCBvbmNlXCIsIC0+XG4gICAgICAgICAgZW5zdXJlIHRleHQ6IFwiZm9vXFxuYmFyXFxuYmF6XCIsIGN1cnNvcjogWzEsIDBdXG5cbiAgICAgICAgZGVzY3JpYmUgXCJ1bmRvIGJlaGF2aW9yXCIsIC0+XG4gICAgICAgICAgaXQgXCJpbmRlbnRzIGJvdGggbGluZXNcIiwgLT5cbiAgICAgICAgICAgIGVuc3VyZSAndScsIHRleHQ6IFwiZm9vXFxuICBiYXJcXG4gIGJhelwiXG5cbiAgZGVzY3JpYmUgJ0NhbWVsQ2FzZScsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2V0XG4gICAgICAgIHRleHQ6ICd2aW0tbW9kZVxcbmF0b20tdGV4dC1lZGl0b3JcXG4nXG4gICAgICAgIGN1cnNvcjogWzAsIDBdXG5cbiAgICBpdCBcInRyYW5zZm9ybSB0ZXh0IGJ5IG1vdGlvbiBhbmQgcmVwZWF0YWJsZVwiLCAtPlxuICAgICAgZW5zdXJlICdnIEMgJCcsIHRleHQ6ICd2aW1Nb2RlXFxuYXRvbS10ZXh0LWVkaXRvclxcbicsIGN1cnNvcjogWzAsIDBdXG4gICAgICBlbnN1cmUgJ2ogLicsIHRleHQ6ICd2aW1Nb2RlXFxuYXRvbVRleHRFZGl0b3JcXG4nLCBjdXJzb3I6IFsxLCAwXVxuXG4gICAgaXQgXCJ0cmFuc2Zvcm0gc2VsZWN0aW9uXCIsIC0+XG4gICAgICBlbnN1cmUgJ1YgaiBnIEMnLCB0ZXh0OiAndmltTW9kZVxcbmF0b21UZXh0RWRpdG9yXFxuJywgY3Vyc29yOiBbMCwgMF1cblxuICAgIGl0IFwicmVwZWF0aW5nIHR3aWNlIHdvcmtzIG9uIGN1cnJlbnQtbGluZSBhbmQgd29uJ3QgbW92ZSBjdXJzb3JcIiwgLT5cbiAgICAgIGVuc3VyZSAnbCBnIEMgZyBDJywgdGV4dDogJ3ZpbU1vZGVcXG5hdG9tLXRleHQtZWRpdG9yXFxuJywgY3Vyc29yOiBbMCwgMV1cblxuICBkZXNjcmliZSAnUGFzY2FsQ2FzZScsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgYXRvbS5rZXltYXBzLmFkZCBcInRlc3RcIixcbiAgICAgICAgJ2F0b20tdGV4dC1lZGl0b3IudmltLW1vZGUtcGx1czpub3QoLmluc2VydC1tb2RlKSc6XG4gICAgICAgICAgJ2cgQyc6ICd2aW0tbW9kZS1wbHVzOnBhc2NhbC1jYXNlJ1xuXG4gICAgICBzZXRcbiAgICAgICAgdGV4dDogJ3ZpbS1tb2RlXFxuYXRvbS10ZXh0LWVkaXRvclxcbidcbiAgICAgICAgY3Vyc29yOiBbMCwgMF1cblxuICAgIGl0IFwidHJhbnNmb3JtIHRleHQgYnkgbW90aW9uIGFuZCByZXBlYXRhYmxlXCIsIC0+XG4gICAgICBlbnN1cmUgJ2cgQyAkJywgdGV4dDogJ1ZpbU1vZGVcXG5hdG9tLXRleHQtZWRpdG9yXFxuJywgY3Vyc29yOiBbMCwgMF1cbiAgICAgIGVuc3VyZSAnaiAuJywgdGV4dDogJ1ZpbU1vZGVcXG5BdG9tVGV4dEVkaXRvclxcbicsIGN1cnNvcjogWzEsIDBdXG5cbiAgICBpdCBcInRyYW5zZm9ybSBzZWxlY3Rpb25cIiwgLT5cbiAgICAgIGVuc3VyZSAnViBqIGcgQycsIHRleHQ6ICdWaW1Nb2RlXFxuYXRvbVRleHRFZGl0b3JcXG4nLCBjdXJzb3I6IFswLCAwXVxuXG4gICAgaXQgXCJyZXBlYXRpbmcgdHdpY2Ugd29ya3Mgb24gY3VycmVudC1saW5lIGFuZCB3b24ndCBtb3ZlIGN1cnNvclwiLCAtPlxuICAgICAgZW5zdXJlICdsIGcgQyBnIEMnLCB0ZXh0OiAnVmltTW9kZVxcbmF0b20tdGV4dC1lZGl0b3JcXG4nLCBjdXJzb3I6IFswLCAxXVxuXG4gIGRlc2NyaWJlICdTbmFrZUNhc2UnLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNldFxuICAgICAgICB0ZXh0OiAndmltLW1vZGVcXG5hdG9tLXRleHQtZWRpdG9yXFxuJ1xuICAgICAgICBjdXJzb3I6IFswLCAwXVxuICAgICAgYXRvbS5rZXltYXBzLmFkZCBcImdfXCIsXG4gICAgICAgICdhdG9tLXRleHQtZWRpdG9yLnZpbS1tb2RlLXBsdXM6bm90KC5pbnNlcnQtbW9kZSknOlxuICAgICAgICAgICdnIF8nOiAndmltLW1vZGUtcGx1czpzbmFrZS1jYXNlJ1xuXG4gICAgaXQgXCJ0cmFuc2Zvcm0gdGV4dCBieSBtb3Rpb24gYW5kIHJlcGVhdGFibGVcIiwgLT5cbiAgICAgIGVuc3VyZSAnZyBfICQnLCB0ZXh0OiAndmltX21vZGVcXG5hdG9tLXRleHQtZWRpdG9yXFxuJywgY3Vyc29yOiBbMCwgMF1cbiAgICAgIGVuc3VyZSAnaiAuJywgdGV4dDogJ3ZpbV9tb2RlXFxuYXRvbV90ZXh0X2VkaXRvclxcbicsIGN1cnNvcjogWzEsIDBdXG5cbiAgICBpdCBcInRyYW5zZm9ybSBzZWxlY3Rpb25cIiwgLT5cbiAgICAgIGVuc3VyZSAnViBqIGcgXycsIHRleHQ6ICd2aW1fbW9kZVxcbmF0b21fdGV4dF9lZGl0b3JcXG4nLCBjdXJzb3I6IFswLCAwXVxuXG4gICAgaXQgXCJyZXBlYXRpbmcgdHdpY2Ugd29ya3Mgb24gY3VycmVudC1saW5lIGFuZCB3b24ndCBtb3ZlIGN1cnNvclwiLCAtPlxuICAgICAgZW5zdXJlICdsIGcgXyBnIF8nLCB0ZXh0OiAndmltX21vZGVcXG5hdG9tLXRleHQtZWRpdG9yXFxuJywgY3Vyc29yOiBbMCwgMV1cblxuICBkZXNjcmliZSAnRGFzaENhc2UnLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNldFxuICAgICAgICB0ZXh0OiAndmltTW9kZVxcbmF0b21fdGV4dF9lZGl0b3JcXG4nXG4gICAgICAgIGN1cnNvcjogWzAsIDBdXG5cbiAgICBpdCBcInRyYW5zZm9ybSB0ZXh0IGJ5IG1vdGlvbiBhbmQgcmVwZWF0YWJsZVwiLCAtPlxuICAgICAgZW5zdXJlICdnIC0gJCcsIHRleHQ6ICd2aW0tbW9kZVxcbmF0b21fdGV4dF9lZGl0b3JcXG4nLCBjdXJzb3I6IFswLCAwXVxuICAgICAgZW5zdXJlICdqIC4nLCB0ZXh0OiAndmltLW1vZGVcXG5hdG9tLXRleHQtZWRpdG9yXFxuJywgY3Vyc29yOiBbMSwgMF1cblxuICAgIGl0IFwidHJhbnNmb3JtIHNlbGVjdGlvblwiLCAtPlxuICAgICAgZW5zdXJlICdWIGogZyAtJywgdGV4dDogJ3ZpbS1tb2RlXFxuYXRvbS10ZXh0LWVkaXRvclxcbicsIGN1cnNvcjogWzAsIDBdXG5cbiAgICBpdCBcInJlcGVhdGluZyB0d2ljZSB3b3JrcyBvbiBjdXJyZW50LWxpbmUgYW5kIHdvbid0IG1vdmUgY3Vyc29yXCIsIC0+XG4gICAgICBlbnN1cmUgJ2wgZyAtIGcgLScsIHRleHQ6ICd2aW0tbW9kZVxcbmF0b21fdGV4dF9lZGl0b3JcXG4nLCBjdXJzb3I6IFswLCAxXVxuXG4gIGRlc2NyaWJlICdDb252ZXJ0VG9Tb2Z0VGFiJywgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBhdG9tLmtleW1hcHMuYWRkIFwidGVzdFwiLFxuICAgICAgICAnYXRvbS10ZXh0LWVkaXRvci52aW0tbW9kZS1wbHVzOm5vdCguaW5zZXJ0LW1vZGUpJzpcbiAgICAgICAgICAnZyB0YWInOiAndmltLW1vZGUtcGx1czpjb252ZXJ0LXRvLXNvZnQtdGFiJ1xuXG4gICAgZGVzY3JpYmUgXCJiYXNpYyBiZWhhdmlvclwiLCAtPlxuICAgICAgaXQgXCJjb252ZXJ0IHRhYnMgdG8gc3BhY2VzXCIsIC0+XG4gICAgICAgIGV4cGVjdChlZGl0b3IuZ2V0VGFiTGVuZ3RoKCkpLnRvQmUoMilcbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dDogXCJcXHR2YXIxMCA9XFx0XFx0MDtcIlxuICAgICAgICAgIGN1cnNvcjogWzAsIDBdXG4gICAgICAgIGVuc3VyZSAnZyB0YWIgJCcsXG4gICAgICAgICAgdGV4dDogXCIgIHZhcjEwID0gICAwO1wiXG5cbiAgZGVzY3JpYmUgJ0NvbnZlcnRUb0hhcmRUYWInLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIGF0b20ua2V5bWFwcy5hZGQgXCJ0ZXN0XCIsXG4gICAgICAgICdhdG9tLXRleHQtZWRpdG9yLnZpbS1tb2RlLXBsdXM6bm90KC5pbnNlcnQtbW9kZSknOlxuICAgICAgICAgICdnIHNoaWZ0LXRhYic6ICd2aW0tbW9kZS1wbHVzOmNvbnZlcnQtdG8taGFyZC10YWInXG5cbiAgICBkZXNjcmliZSBcImJhc2ljIGJlaGF2aW9yXCIsIC0+XG4gICAgICBpdCBcImNvbnZlcnQgc3BhY2VzIHRvIHRhYnNcIiwgLT5cbiAgICAgICAgZXhwZWN0KGVkaXRvci5nZXRUYWJMZW5ndGgoKSkudG9CZSgyKVxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0OiBcIiAgdmFyMTAgPSAgICAwO1wiXG4gICAgICAgICAgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgZW5zdXJlICdnIHNoaWZ0LXRhYiAkJyxcbiAgICAgICAgICB0ZXh0OiBcIlxcdHZhcjEwXFx0PVxcdFxcdCAwO1wiXG5cbiAgZGVzY3JpYmUgJ0NvbXBhY3RTcGFjZXMnLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNldFxuICAgICAgICBjdXJzb3I6IFswLCAwXVxuXG4gICAgZGVzY3JpYmUgXCJiYXNpYyBiZWhhdmlvclwiLCAtPlxuICAgICAgaXQgXCJjb21wYXRzIG11bHRpcGxlIHNwYWNlIGludG8gb25lXCIsIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHQ6ICd2YXIwICAgPSAgIDA7IHZhcjEwICAgPSAgIDEwJ1xuICAgICAgICAgIGN1cnNvcjogWzAsIDBdXG4gICAgICAgIGVuc3VyZSAnZyBzcGFjZSAkJyxcbiAgICAgICAgICB0ZXh0OiAndmFyMCA9IDA7IHZhcjEwID0gMTAnXG4gICAgICBpdCBcImRvbid0IGFwcGx5IGNvbXBhY3Rpb24gZm9yIGxlYWRpbmcgYW5kIHRyYWlsaW5nIHNwYWNlXCIsIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHRfOiBcIlwiXCJcbiAgICAgICAgICBfX192YXIwICAgPSAgIDA7IHZhcjEwICAgPSAgIDEwX19fXG4gICAgICAgICAgX19fdmFyMSAgID0gICAxOyB2YXIxMSAgID0gICAxMV9fX1xuICAgICAgICAgIF9fX3ZhcjIgICA9ICAgMjsgdmFyMTIgICA9ICAgMTJfX19cblxuICAgICAgICAgIF9fX3ZhcjQgICA9ICAgNDsgdmFyMTQgICA9ICAgMTRfX19cbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICBjdXJzb3I6IFswLCAwXVxuICAgICAgICBlbnN1cmUgJ2cgc3BhY2UgaSBwJyxcbiAgICAgICAgICB0ZXh0XzogXCJcIlwiXG4gICAgICAgICAgX19fdmFyMCA9IDA7IHZhcjEwID0gMTBfX19cbiAgICAgICAgICBfX192YXIxID0gMTsgdmFyMTEgPSAxMV9fX1xuICAgICAgICAgIF9fX3ZhcjIgPSAyOyB2YXIxMiA9IDEyX19fXG5cbiAgICAgICAgICBfX192YXI0ICAgPSAgIDQ7IHZhcjE0ICAgPSAgIDE0X19fXG4gICAgICAgICAgXCJcIlwiXG4gICAgICBpdCBcImJ1dCBpdCBjb21wYWN0IHNwYWNlcyB3aGVuIHRhcmdldCBhbGwgdGV4dCBpcyBzcGFjZXNcIiwgLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dDogJzAxMjM0ICAgIDkwJ1xuICAgICAgICAgIGN1cnNvcjogWzAsIDVdXG4gICAgICAgIGVuc3VyZSAnZyBzcGFjZSB3JyxcbiAgICAgICAgICB0ZXh0OiAnMDEyMzQgOTAnXG5cbiAgZGVzY3JpYmUgJ1RyaW1TdHJpbmcnLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNldFxuICAgICAgICB0ZXh0OiBcIiB0ZXh0ID0gQGdldE5ld1RleHQoIHNlbGVjdGlvbi5nZXRUZXh0KCksIHNlbGVjdGlvbiApICBcIlxuICAgICAgICBjdXJzb3I6IFswLCA0Ml1cblxuICAgIGRlc2NyaWJlIFwiYmFzaWMgYmVoYXZpb3JcIiwgLT5cbiAgICAgIGl0IFwidHJpbSBzdHJpbmcgZm9yIGEtbGluZSB0ZXh0IG9iamVjdFwiLCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0XzogXCJcIlwiXG4gICAgICAgICAgX19fYWJjX19fXG4gICAgICAgICAgX19fZGVmX19fXG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgZW5zdXJlICdnIHwgYSBsJyxcbiAgICAgICAgICB0ZXh0XzogXCJcIlwiXG4gICAgICAgICAgYWJjXG4gICAgICAgICAgX19fZGVmX19fXG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgIGVuc3VyZSAnaiAuJyxcbiAgICAgICAgICB0ZXh0XzogXCJcIlwiXG4gICAgICAgICAgYWJjXG4gICAgICAgICAgZGVmXG4gICAgICAgICAgXCJcIlwiXG4gICAgICBpdCBcInRyaW0gc3RyaW5nIGZvciBpbm5lci1wYXJlbnRoZXNpcyB0ZXh0IG9iamVjdFwiLCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0XzogXCJcIlwiXG4gICAgICAgICAgKCAgYWJjICApXG4gICAgICAgICAgKCAgZGVmICApXG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgZW5zdXJlICdnIHwgaSAoJyxcbiAgICAgICAgICB0ZXh0XzogXCJcIlwiXG4gICAgICAgICAgKGFiYylcbiAgICAgICAgICAoICBkZWYgIClcbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgZW5zdXJlICdqIC4nLFxuICAgICAgICAgIHRleHRfOiBcIlwiXCJcbiAgICAgICAgICAoYWJjKVxuICAgICAgICAgIChkZWYpXG4gICAgICAgICAgXCJcIlwiXG4gICAgICBpdCBcInRyaW0gc3RyaW5nIGZvciBpbm5lci1hbnktcGFpciB0ZXh0IG9iamVjdFwiLCAtPlxuICAgICAgICBhdG9tLmtleW1hcHMuYWRkIFwidGVzdFwiLFxuICAgICAgICAgICdhdG9tLXRleHQtZWRpdG9yLnZpbS1tb2RlLXBsdXMub3BlcmF0b3ItcGVuZGluZy1tb2RlLCBhdG9tLXRleHQtZWRpdG9yLnZpbS1tb2RlLXBsdXMudmlzdWFsLW1vZGUnOlxuICAgICAgICAgICAgJ2kgOyc6ICAndmltLW1vZGUtcGx1czppbm5lci1hbnktcGFpcidcblxuICAgICAgICBzZXQgdGV4dF86IFwiKCBbIHsgIGFiYyAgfSBdIClcIiwgY3Vyc29yOiBbMCwgOF1cbiAgICAgICAgZW5zdXJlICdnIHwgaSA7JywgdGV4dF86IFwiKCBbIHthYmN9IF0gKVwiXG4gICAgICAgIGVuc3VyZSAnMiBoIC4nLCB0ZXh0XzogXCIoIFt7YWJjfV0gKVwiXG4gICAgICAgIGVuc3VyZSAnMiBoIC4nLCB0ZXh0XzogXCIoW3thYmN9XSlcIlxuXG4gIGRlc2NyaWJlICdzdXJyb3VuZCcsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAga2V5bWFwc0ZvclN1cnJvdW5kID0ge1xuICAgICAgICAnYXRvbS10ZXh0LWVkaXRvci52aW0tbW9kZS1wbHVzLm5vcm1hbC1tb2RlJzpcbiAgICAgICAgICAneSBzJzogJ3ZpbS1tb2RlLXBsdXM6c3Vycm91bmQnXG4gICAgICAgICAgJ2Qgcyc6ICd2aW0tbW9kZS1wbHVzOmRlbGV0ZS1zdXJyb3VuZC1hbnktcGFpcidcbiAgICAgICAgICAnZCBTJzogJ3ZpbS1tb2RlLXBsdXM6ZGVsZXRlLXN1cnJvdW5kJ1xuICAgICAgICAgICdjIHMnOiAndmltLW1vZGUtcGx1czpjaGFuZ2Utc3Vycm91bmQtYW55LXBhaXInXG4gICAgICAgICAgJ2MgUyc6ICd2aW0tbW9kZS1wbHVzOmNoYW5nZS1zdXJyb3VuZCdcblxuICAgICAgICAnYXRvbS10ZXh0LWVkaXRvci52aW0tbW9kZS1wbHVzLm9wZXJhdG9yLXBlbmRpbmctbW9kZS5zdXJyb3VuZC1wZW5kaW5nJzpcbiAgICAgICAgICAncyc6ICd2aW0tbW9kZS1wbHVzOmlubmVyLWN1cnJlbnQtbGluZSdcblxuICAgICAgICAnYXRvbS10ZXh0LWVkaXRvci52aW0tbW9kZS1wbHVzLnZpc3VhbC1tb2RlJzpcbiAgICAgICAgICAnUyc6ICd2aW0tbW9kZS1wbHVzOnN1cnJvdW5kJ1xuICAgICAgfVxuXG4gICAgICBhdG9tLmtleW1hcHMuYWRkKFwia2V5bWFwcy1mb3Itc3Vycm91bmRcIiwga2V5bWFwc0ZvclN1cnJvdW5kKVxuXG4gICAgICBzZXRcbiAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgIHxhcHBsZVxuICAgICAgICAgIHBhaXJzOiBbYnJhY2tldHNdXG4gICAgICAgICAgcGFpcnM6IFticmFja2V0c11cbiAgICAgICAgICAoIG11bHRpXG4gICAgICAgICAgICBsaW5lIClcbiAgICAgICAgICBcIlwiXCJcblxuICAgIGRlc2NyaWJlICdhbGlhcyBrZXltYXAgZm9yIHN1cnJvdW5kLCBjaGFuZ2Utc3Vycm91bmQsIGRlbGV0ZS1zdXJyb3VuZCcsIC0+XG4gICAgICBpdCBcInN1cnJvdW5kIGJ5IGFsaWFzZWQgY2hhclwiLCAtPlxuICAgICAgICBzZXQgdGV4dEM6IFwifGFiY1wiOyBlbnN1cmUgJ3kgcyBpIHcgYicsIHRleHQ6IFwiKGFiYylcIlxuICAgICAgICBzZXQgdGV4dEM6IFwifGFiY1wiOyBlbnN1cmUgJ3kgcyBpIHcgQicsIHRleHQ6IFwie2FiY31cIlxuICAgICAgICBzZXQgdGV4dEM6IFwifGFiY1wiOyBlbnN1cmUgJ3kgcyBpIHcgcicsIHRleHQ6IFwiW2FiY11cIlxuICAgICAgICBzZXQgdGV4dEM6IFwifGFiY1wiOyBlbnN1cmUgJ3kgcyBpIHcgYScsIHRleHQ6IFwiPGFiYz5cIlxuICAgICAgaXQgXCJkZWxldGUgc3Vycm91bmQgYnkgYWxpYXNlZCBjaGFyXCIsIC0+XG4gICAgICAgIHNldCB0ZXh0QzogXCJ8KGFiYylcIjsgZW5zdXJlICdkIFMgYicsIHRleHQ6IFwiYWJjXCJcbiAgICAgICAgc2V0IHRleHRDOiBcInx7YWJjfVwiOyBlbnN1cmUgJ2QgUyBCJywgdGV4dDogXCJhYmNcIlxuICAgICAgICBzZXQgdGV4dEM6IFwifFthYmNdXCI7IGVuc3VyZSAnZCBTIHInLCB0ZXh0OiBcImFiY1wiXG4gICAgICAgIHNldCB0ZXh0QzogXCJ8PGFiYz5cIjsgZW5zdXJlICdkIFMgYScsIHRleHQ6IFwiYWJjXCJcbiAgICAgIGl0IFwiY2hhbmdlIHN1cnJvdW5kIGJ5IGFsaWFzZWQgY2hhclwiLCAtPlxuICAgICAgICBzZXQgdGV4dEM6IFwifChhYmMpXCI7IGVuc3VyZSAnYyBTIGIgQicsIHRleHQ6IFwie2FiY31cIlxuICAgICAgICBzZXQgdGV4dEM6IFwifChhYmMpXCI7IGVuc3VyZSAnYyBTIGIgcicsIHRleHQ6IFwiW2FiY11cIlxuICAgICAgICBzZXQgdGV4dEM6IFwifChhYmMpXCI7IGVuc3VyZSAnYyBTIGIgYScsIHRleHQ6IFwiPGFiYz5cIlxuXG4gICAgICAgIHNldCB0ZXh0QzogXCJ8e2FiY31cIjsgZW5zdXJlICdjIFMgQiBiJywgdGV4dDogXCIoYWJjKVwiXG4gICAgICAgIHNldCB0ZXh0QzogXCJ8e2FiY31cIjsgZW5zdXJlICdjIFMgQiByJywgdGV4dDogXCJbYWJjXVwiXG4gICAgICAgIHNldCB0ZXh0QzogXCJ8e2FiY31cIjsgZW5zdXJlICdjIFMgQiBhJywgdGV4dDogXCI8YWJjPlwiXG5cbiAgICAgICAgc2V0IHRleHRDOiBcInxbYWJjXVwiOyBlbnN1cmUgJ2MgUyByIGInLCB0ZXh0OiBcIihhYmMpXCJcbiAgICAgICAgc2V0IHRleHRDOiBcInxbYWJjXVwiOyBlbnN1cmUgJ2MgUyByIEInLCB0ZXh0OiBcInthYmN9XCJcbiAgICAgICAgc2V0IHRleHRDOiBcInxbYWJjXVwiOyBlbnN1cmUgJ2MgUyByIGEnLCB0ZXh0OiBcIjxhYmM+XCJcblxuICAgICAgICBzZXQgdGV4dEM6IFwifDxhYmM+XCI7IGVuc3VyZSAnYyBTIGEgYicsIHRleHQ6IFwiKGFiYylcIlxuICAgICAgICBzZXQgdGV4dEM6IFwifDxhYmM+XCI7IGVuc3VyZSAnYyBTIGEgQicsIHRleHQ6IFwie2FiY31cIlxuICAgICAgICBzZXQgdGV4dEM6IFwifDxhYmM+XCI7IGVuc3VyZSAnYyBTIGEgcicsIHRleHQ6IFwiW2FiY11cIlxuXG4gICAgZGVzY3JpYmUgJ3N1cnJvdW5kJywgLT5cbiAgICAgIGl0IFwic3Vycm91bmQgdGV4dCBvYmplY3Qgd2l0aCAoIGFuZCByZXBlYXRhYmxlXCIsIC0+XG4gICAgICAgIGVuc3VyZSAneSBzIGkgdyAoJyxcbiAgICAgICAgICB0ZXh0QzogXCJ8KGFwcGxlKVxcbnBhaXJzOiBbYnJhY2tldHNdXFxucGFpcnM6IFticmFja2V0c11cXG4oIG11bHRpXFxuICBsaW5lIClcIlxuICAgICAgICBlbnN1cmUgJ2ogLicsXG4gICAgICAgICAgdGV4dDogXCIoYXBwbGUpXFxuKHBhaXJzKTogW2JyYWNrZXRzXVxcbnBhaXJzOiBbYnJhY2tldHNdXFxuKCBtdWx0aVxcbiAgbGluZSApXCJcbiAgICAgIGl0IFwic3Vycm91bmQgdGV4dCBvYmplY3Qgd2l0aCB7IGFuZCByZXBlYXRhYmxlXCIsIC0+XG4gICAgICAgIGVuc3VyZSAneSBzIGkgdyB7JyxcbiAgICAgICAgICB0ZXh0QzogXCJ8e2FwcGxlfVxcbnBhaXJzOiBbYnJhY2tldHNdXFxucGFpcnM6IFticmFja2V0c11cXG4oIG11bHRpXFxuICBsaW5lIClcIlxuICAgICAgICBlbnN1cmUgJ2ogLicsXG4gICAgICAgICAgdGV4dEM6IFwie2FwcGxlfVxcbnx7cGFpcnN9OiBbYnJhY2tldHNdXFxucGFpcnM6IFticmFja2V0c11cXG4oIG11bHRpXFxuICBsaW5lIClcIlxuICAgICAgaXQgXCJzdXJyb3VuZCBjdXJyZW50LWxpbmVcIiwgLT5cbiAgICAgICAgZW5zdXJlICd5IHMgcyB7JyxcbiAgICAgICAgICB0ZXh0QzogXCJ8e2FwcGxlfVxcbnBhaXJzOiBbYnJhY2tldHNdXFxucGFpcnM6IFticmFja2V0c11cXG4oIG11bHRpXFxuICBsaW5lIClcIlxuICAgICAgICBlbnN1cmUgJ2ogLicsXG4gICAgICAgICAgdGV4dEM6IFwie2FwcGxlfVxcbnx7cGFpcnM6IFticmFja2V0c119XFxucGFpcnM6IFticmFja2V0c11cXG4oIG11bHRpXFxuICBsaW5lIClcIlxuXG4gICAgICBkZXNjcmliZSAnYWRqdXN0SW5kZW50YXRpb24gd2hlbiBzdXJyb3VuZCBsaW5ld2lzZSB0YXJnZXQnLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICAgICAgICBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZSgnbGFuZ3VhZ2UtamF2YXNjcmlwdCcpXG4gICAgICAgICAgcnVucyAtPlxuICAgICAgICAgICAgc2V0XG4gICAgICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAgICAgICBoZWxsbyA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgIGlmIHRydWUge1xuICAgICAgICAgICAgICAgICAgfCAgY29uc29sZS5sb2coJ2hlbGxvJyk7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgICBncmFtbWFyOiAnc291cmNlLmpzJ1xuXG4gICAgICAgIGl0IFwiYWRqdXN0SW5kZW50YXRpb24gc3Vycm91bmRlZCB0ZXh0IFwiLCAtPlxuICAgICAgICAgIGVuc3VyZSAneSBzIGkgZiB7JyxcbiAgICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAgICAgaGVsbG8gPSAoKSA9PiB7XG4gICAgICAgICAgICAgIHwgIHtcbiAgICAgICAgICAgICAgICAgIGlmIHRydWUge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnaGVsbG8nKTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgIGRlc2NyaWJlICd3aXRoIG1vdGlvbiB3aGljaCB0YWtlcyB1c2VyLWlucHV0JywgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIHNldCB0ZXh0OiBcInMgX19fX18gZVwiLCBjdXJzb3I6IFswLCAwXVxuICAgICAgICBkZXNjcmliZSBcIndpdGggJ2YnIG1vdGlvblwiLCAtPlxuICAgICAgICAgIGl0IFwic3Vycm91bmQgd2l0aCAnZicgbW90aW9uXCIsIC0+XG4gICAgICAgICAgICBlbnN1cmUgJ3kgcyBmIGUgKCcsIHRleHQ6IFwiKHMgX19fX18gZSlcIiwgY3Vyc29yOiBbMCwgMF1cblxuICAgICAgICBkZXNjcmliZSBcIndpdGggJ2AnIG1vdGlvblwiLCAtPlxuICAgICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICAgIHNldCBjdXJzb3I6IFswLCA4XSAjIHN0YXJ0IGF0IGBlYCBjaGFyXG4gICAgICAgICAgICBlbnN1cmUgJ20gYScsIG1hcms6ICdhJzogWzAsIDhdXG4gICAgICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMF1cblxuICAgICAgICAgIGl0IFwic3Vycm91bmQgd2l0aCAnYCcgbW90aW9uXCIsIC0+XG4gICAgICAgICAgICBlbnN1cmUgJ3kgcyBgIGEgKCcsIHRleHQ6IFwiKHMgX19fX18gKWVcIiwgY3Vyc29yOiBbMCwgMF1cblxuICAgICAgZGVzY3JpYmUgJ2NoYXJhY3RlcnNUb0FkZFNwYWNlT25TdXJyb3VuZCBzZXR0aW5nJywgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIHNldHRpbmdzLnNldCgnY2hhcmFjdGVyc1RvQWRkU3BhY2VPblN1cnJvdW5kJywgWycoJywgJ3snLCAnWyddKVxuICAgICAgICAgIHNldFxuICAgICAgICAgICAgdGV4dEM6IFwifGFwcGxlXFxub3JhbmdlXFxubGVtbW9uXCJcblxuICAgICAgICBkZXNjcmliZSBcImNoYXIgaXMgaW4gY2hhcmFjdGVyc1RvQWRkU3BhY2VPblN1cnJvdW5kXCIsIC0+XG4gICAgICAgICAgaXQgXCJhZGQgYWRkaXRpb25hbCBzcGFjZSBpbnNpZGUgcGFpciBjaGFyIHdoZW4gc3Vycm91bmRcIiwgLT5cbiAgICAgICAgICAgIGVuc3VyZSAneSBzIGkgdyAoJywgdGV4dDogXCIoIGFwcGxlIClcXG5vcmFuZ2VcXG5sZW1tb25cIlxuICAgICAgICAgICAga2V5c3Ryb2tlICdqJ1xuICAgICAgICAgICAgZW5zdXJlICd5IHMgaSB3IHsnLCB0ZXh0OiBcIiggYXBwbGUgKVxcbnsgb3JhbmdlIH1cXG5sZW1tb25cIlxuICAgICAgICAgICAga2V5c3Ryb2tlICdqJ1xuICAgICAgICAgICAgZW5zdXJlICd5IHMgaSB3IFsnLCB0ZXh0OiBcIiggYXBwbGUgKVxcbnsgb3JhbmdlIH1cXG5bIGxlbW1vbiBdXCJcblxuICAgICAgICBkZXNjcmliZSBcImNoYXIgaXMgbm90IGluIGNoYXJhY3RlcnNUb0FkZFNwYWNlT25TdXJyb3VuZFwiLCAtPlxuICAgICAgICAgIGl0IFwiYWRkIGFkZGl0aW9uYWwgc3BhY2UgaW5zaWRlIHBhaXIgY2hhciB3aGVuIHN1cnJvdW5kXCIsIC0+XG4gICAgICAgICAgICBlbnN1cmUgJ3kgcyBpIHcgKScsIHRleHQ6IFwiKGFwcGxlKVxcbm9yYW5nZVxcbmxlbW1vblwiXG4gICAgICAgICAgICBrZXlzdHJva2UgJ2onXG4gICAgICAgICAgICBlbnN1cmUgJ3kgcyBpIHcgfScsIHRleHQ6IFwiKGFwcGxlKVxcbntvcmFuZ2V9XFxubGVtbW9uXCJcbiAgICAgICAgICAgIGtleXN0cm9rZSAnaidcbiAgICAgICAgICAgIGVuc3VyZSAneSBzIGkgdyBdJywgdGV4dDogXCIoYXBwbGUpXFxue29yYW5nZX1cXG5bbGVtbW9uXVwiXG5cbiAgICAgICAgZGVzY3JpYmUgXCJpdCBkaXN0aW5jdGl2ZWx5IGhhbmRsZSBhbGlhc2VkIGtleW1hcFwiLCAtPlxuICAgICAgICAgIGRlc2NyaWJlIFwibm9ybWFsIHBhaXItY2hhcnMgYXJlIHNldCB0byBhZGQgc3BhY2VcIiwgLT5cbiAgICAgICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICAgICAgc2V0dGluZ3Muc2V0KCdjaGFyYWN0ZXJzVG9BZGRTcGFjZU9uU3Vycm91bmQnLCBbJygnLCAneycsICdbJywgJzwnXSlcbiAgICAgICAgICAgIGl0IFwiZGlzdGluY3RpdmVseSBoYW5kbGVcIiwgLT5cbiAgICAgICAgICAgICAgc2V0IHRleHRDOiBcInxhYmNcIjsgZW5zdXJlICd5IHMgaSB3ICgnLCB0ZXh0OiBcIiggYWJjIClcIlxuICAgICAgICAgICAgICBzZXQgdGV4dEM6IFwifGFiY1wiOyBlbnN1cmUgJ3kgcyBpIHcgYicsIHRleHQ6IFwiKGFiYylcIlxuICAgICAgICAgICAgICBzZXQgdGV4dEM6IFwifGFiY1wiOyBlbnN1cmUgJ3kgcyBpIHcgeycsIHRleHQ6IFwieyBhYmMgfVwiXG4gICAgICAgICAgICAgIHNldCB0ZXh0QzogXCJ8YWJjXCI7IGVuc3VyZSAneSBzIGkgdyBCJywgdGV4dDogXCJ7YWJjfVwiXG4gICAgICAgICAgICAgIHNldCB0ZXh0QzogXCJ8YWJjXCI7IGVuc3VyZSAneSBzIGkgdyBbJywgdGV4dDogXCJbIGFiYyBdXCJcbiAgICAgICAgICAgICAgc2V0IHRleHRDOiBcInxhYmNcIjsgZW5zdXJlICd5IHMgaSB3IHInLCB0ZXh0OiBcIlthYmNdXCJcbiAgICAgICAgICAgICAgc2V0IHRleHRDOiBcInxhYmNcIjsgZW5zdXJlICd5IHMgaSB3IDwnLCB0ZXh0OiBcIjwgYWJjID5cIlxuICAgICAgICAgICAgICBzZXQgdGV4dEM6IFwifGFiY1wiOyBlbnN1cmUgJ3kgcyBpIHcgYScsIHRleHQ6IFwiPGFiYz5cIlxuICAgICAgICAgIGRlc2NyaWJlIFwiYWxpYXNlZCBwYWlyLWNoYXJzIGFyZSBzZXQgdG8gYWRkIHNwYWNlXCIsIC0+XG4gICAgICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgICAgIHNldHRpbmdzLnNldCgnY2hhcmFjdGVyc1RvQWRkU3BhY2VPblN1cnJvdW5kJywgWydiJywgJ0InLCAncicsICdhJ10pXG4gICAgICAgICAgICBpdCBcImRpc3RpbmN0aXZlbHkgaGFuZGxlXCIsIC0+XG4gICAgICAgICAgICAgIHNldCB0ZXh0QzogXCJ8YWJjXCI7IGVuc3VyZSAneSBzIGkgdyAoJywgdGV4dDogXCIoYWJjKVwiXG4gICAgICAgICAgICAgIHNldCB0ZXh0QzogXCJ8YWJjXCI7IGVuc3VyZSAneSBzIGkgdyBiJywgdGV4dDogXCIoIGFiYyApXCJcbiAgICAgICAgICAgICAgc2V0IHRleHRDOiBcInxhYmNcIjsgZW5zdXJlICd5IHMgaSB3IHsnLCB0ZXh0OiBcInthYmN9XCJcbiAgICAgICAgICAgICAgc2V0IHRleHRDOiBcInxhYmNcIjsgZW5zdXJlICd5IHMgaSB3IEInLCB0ZXh0OiBcInsgYWJjIH1cIlxuICAgICAgICAgICAgICBzZXQgdGV4dEM6IFwifGFiY1wiOyBlbnN1cmUgJ3kgcyBpIHcgWycsIHRleHQ6IFwiW2FiY11cIlxuICAgICAgICAgICAgICBzZXQgdGV4dEM6IFwifGFiY1wiOyBlbnN1cmUgJ3kgcyBpIHcgcicsIHRleHQ6IFwiWyBhYmMgXVwiXG4gICAgICAgICAgICAgIHNldCB0ZXh0QzogXCJ8YWJjXCI7IGVuc3VyZSAneSBzIGkgdyA8JywgdGV4dDogXCI8YWJjPlwiXG4gICAgICAgICAgICAgIHNldCB0ZXh0QzogXCJ8YWJjXCI7IGVuc3VyZSAneSBzIGkgdyBhJywgdGV4dDogXCI8IGFiYyA+XCJcblxuICAgIGRlc2NyaWJlICdtYXAtc3Vycm91bmQnLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBqYXNtaW5lLmF0dGFjaFRvRE9NKGVkaXRvckVsZW1lbnQpXG5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dEM6IFwiXCJcIlxuXG4gICAgICAgICAgICB8YXBwbGVcbiAgICAgICAgICAgIHBhaXJzIHRvbWF0b1xuICAgICAgICAgICAgb3JhbmdlXG4gICAgICAgICAgICBtaWxrXG5cbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGF0b20ua2V5bWFwcy5hZGQgXCJtc1wiLFxuICAgICAgICAgICdhdG9tLXRleHQtZWRpdG9yLnZpbS1tb2RlLXBsdXM6bm90KC5pbnNlcnQtbW9kZSknOlxuICAgICAgICAgICAgJ20gcyc6ICd2aW0tbW9kZS1wbHVzOm1hcC1zdXJyb3VuZCdcbiAgICAgICAgICAnYXRvbS10ZXh0LWVkaXRvci52aW0tbW9kZS1wbHVzLnZpc3VhbC1tb2RlJzpcbiAgICAgICAgICAgICdtIHMnOiAgJ3ZpbS1tb2RlLXBsdXM6bWFwLXN1cnJvdW5kJ1xuXG4gICAgICBpdCBcInN1cnJvdW5kIHRleHQgZm9yIGVhY2ggd29yZCBpbiB0YXJnZXQgY2FzZS0xXCIsIC0+XG4gICAgICAgIGVuc3VyZSAnbSBzIGkgcCAoJyxcbiAgICAgICAgICB0ZXh0QzogXCJcIlwiXG5cbiAgICAgICAgICB8KGFwcGxlKVxuICAgICAgICAgIChwYWlycykgKHRvbWF0bylcbiAgICAgICAgICAob3JhbmdlKVxuICAgICAgICAgIChtaWxrKVxuXG4gICAgICAgICAgXCJcIlwiXG4gICAgICBpdCBcInN1cnJvdW5kIHRleHQgZm9yIGVhY2ggd29yZCBpbiB0YXJnZXQgY2FzZS0yXCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFsyLCAxXVxuICAgICAgICBlbnN1cmUgJ20gcyBpIGwgPCcsXG4gICAgICAgICAgdGV4dEM6IFwiXCJcIlxuXG4gICAgICAgICAgYXBwbGVcbiAgICAgICAgICA8fHBhaXJzPiA8dG9tYXRvPlxuICAgICAgICAgIG9yYW5nZVxuICAgICAgICAgIG1pbGtcblxuICAgICAgICAgIFwiXCJcIlxuICAgICAgIyBUT0RPIzY5OCBGSVggd2hlbiBmaW5pc2hlZFxuICAgICAgaXQgXCJzdXJyb3VuZCB0ZXh0IGZvciBlYWNoIHdvcmQgaW4gdmlzdWFsIHNlbGVjdGlvblwiLCAtPlxuICAgICAgICBlbnN1cmUgJ3YgaSBwIG0gcyBcIicsXG4gICAgICAgICAgdGV4dEM6IFwiXCJcIlxuXG4gICAgICAgICAgXCJhcHBsZVwiXG4gICAgICAgICAgXCJwYWlyc1wiIFwidG9tYXRvXCJcbiAgICAgICAgICBcIm9yYW5nZVwiXG4gICAgICAgICAgfFwibWlsa1wiXG5cbiAgICAgICAgICBcIlwiXCJcblxuICAgIGRlc2NyaWJlICdkZWxldGUgc3Vycm91bmQnLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMSwgOF1cblxuICAgICAgaXQgXCJkZWxldGUgc3Vycm91bmRlZCBjaGFycyBhbmQgcmVwZWF0YWJsZVwiLCAtPlxuICAgICAgICBlbnN1cmUgJ2QgUyBbJyxcbiAgICAgICAgICB0ZXh0OiBcImFwcGxlXFxucGFpcnM6IGJyYWNrZXRzXFxucGFpcnM6IFticmFja2V0c11cXG4oIG11bHRpXFxuICBsaW5lIClcIlxuICAgICAgICBlbnN1cmUgJ2ogbCAuJyxcbiAgICAgICAgICB0ZXh0OiBcImFwcGxlXFxucGFpcnM6IGJyYWNrZXRzXFxucGFpcnM6IGJyYWNrZXRzXFxuKCBtdWx0aVxcbiAgbGluZSApXCJcbiAgICAgIGl0IFwiZGVsZXRlIHN1cnJvdW5kZWQgY2hhcnMgZXhwYW5kZWQgdG8gbXVsdGktbGluZVwiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMywgMV1cbiAgICAgICAgZW5zdXJlICdkIFMgKCcsXG4gICAgICAgICAgdGV4dDogXCJhcHBsZVxcbnBhaXJzOiBbYnJhY2tldHNdXFxucGFpcnM6IFticmFja2V0c11cXG4gbXVsdGlcXG4gIGxpbmUgXCJcbiAgICAgIGl0IFwiZGVsZXRlIHN1cnJvdW5kZWQgY2hhcnMgYW5kIHRyaW0gcGFkZGluZyBzcGFjZXMgZm9yIG5vbi1pZGVudGljYWwgcGFpci1jaGFyXCIsIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgKCBhcHBsZSApXG4gICAgICAgICAgICB7ICBvcmFuZ2UgICB9XFxuXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICBjdXJzb3I6IFswLCAwXVxuICAgICAgICBlbnN1cmUgJ2QgUyAoJywgdGV4dDogXCJhcHBsZVxcbnsgIG9yYW5nZSAgIH1cXG5cIlxuICAgICAgICBlbnN1cmUgJ2ogZCBTIHsnLCB0ZXh0OiBcImFwcGxlXFxub3JhbmdlXFxuXCJcbiAgICAgIGl0IFwiZGVsZXRlIHN1cnJvdW5kZWQgY2hhcnMgYW5kIE5PVCB0cmltIHBhZGRpbmcgc3BhY2VzIGZvciBpZGVudGljYWwgcGFpci1jaGFyXCIsIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgYCBhcHBsZSBgXG4gICAgICAgICAgICBcIiAgb3JhbmdlICAgXCJcXG5cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIGN1cnNvcjogWzAsIDBdXG4gICAgICAgIGVuc3VyZSAnZCBTIGAnLCB0ZXh0XzogJ19hcHBsZV9cXG5cIl9fb3JhbmdlX19fXCJcXG4nXG4gICAgICAgIGVuc3VyZSAnaiBkIFMgXCInLCB0ZXh0XzogXCJfYXBwbGVfXFxuX19vcmFuZ2VfX19cXG5cIlxuICAgICAgaXQgXCJkZWxldGUgc3Vycm91bmRlZCBmb3IgbXVsdGktbGluZSBidXQgZG9udCBhZmZlY3QgY29kZSBsYXlvdXRcIiwgLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgY3Vyc29yOiBbMCwgMzRdXG4gICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICBoaWdobGlnaHRSYW5nZXMgQGVkaXRvciwgcmFuZ2UsIHtcbiAgICAgICAgICAgICAgdGltZW91dDogdGltZW91dFxuICAgICAgICAgICAgICBoZWxsbzogd29ybGRcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICBlbnN1cmUgJ2QgUyB7JyxcbiAgICAgICAgICB0ZXh0OiBbXG4gICAgICAgICAgICAgIFwiaGlnaGxpZ2h0UmFuZ2VzIEBlZGl0b3IsIHJhbmdlLCBcIlxuICAgICAgICAgICAgICBcIiAgdGltZW91dDogdGltZW91dFwiXG4gICAgICAgICAgICAgIFwiICBoZWxsbzogd29ybGRcIlxuICAgICAgICAgICAgICBcIlwiXG4gICAgICAgICAgICBdLmpvaW4oXCJcXG5cIilcblxuICAgIGRlc2NyaWJlICdjaGFuZ2Ugc3Vycm91bmQnLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIChhcHBsZSlcbiAgICAgICAgICAgIChncmFwZSlcbiAgICAgICAgICAgIDxsZW1tb24+XG4gICAgICAgICAgICB7b3JhbmdlfVxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgY3Vyc29yOiBbMCwgMV1cbiAgICAgIGl0IFwiY2hhbmdlIHN1cnJvdW5kZWQgY2hhcnMgYW5kIHJlcGVhdGFibGVcIiwgLT5cbiAgICAgICAgZW5zdXJlICdjIFMgKCBbJyxcbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIFthcHBsZV1cbiAgICAgICAgICAgIChncmFwZSlcbiAgICAgICAgICAgIDxsZW1tb24+XG4gICAgICAgICAgICB7b3JhbmdlfVxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgIGVuc3VyZSAnaiBsIC4nLFxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgW2FwcGxlXVxuICAgICAgICAgICAgW2dyYXBlXVxuICAgICAgICAgICAgPGxlbW1vbj5cbiAgICAgICAgICAgIHtvcmFuZ2V9XG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgIGl0IFwiY2hhbmdlIHN1cnJvdW5kZWQgY2hhcnNcIiwgLT5cbiAgICAgICAgZW5zdXJlICdqIGogYyBTIDwgXCInLFxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgKGFwcGxlKVxuICAgICAgICAgICAgKGdyYXBlKVxuICAgICAgICAgICAgXCJsZW1tb25cIlxuICAgICAgICAgICAge29yYW5nZX1cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICBlbnN1cmUgJ2ogbCBjIFMgeyAhJyxcbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIChhcHBsZSlcbiAgICAgICAgICAgIChncmFwZSlcbiAgICAgICAgICAgIFwibGVtbW9uXCJcbiAgICAgICAgICAgICFvcmFuZ2UhXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgaXQgXCJjaGFuZ2Ugc3Vycm91bmRlZCBmb3IgbXVsdGktbGluZSBidXQgZG9udCBhZmZlY3QgY29kZSBsYXlvdXRcIiwgLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgY3Vyc29yOiBbMCwgMzRdXG4gICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICBoaWdobGlnaHRSYW5nZXMgQGVkaXRvciwgcmFuZ2UsIHtcbiAgICAgICAgICAgICAgdGltZW91dDogdGltZW91dFxuICAgICAgICAgICAgICBoZWxsbzogd29ybGRcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICBlbnN1cmUgJ2MgUyB7ICgnLFxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgaGlnaGxpZ2h0UmFuZ2VzIEBlZGl0b3IsIHJhbmdlLCAoXG4gICAgICAgICAgICAgIHRpbWVvdXQ6IHRpbWVvdXRcbiAgICAgICAgICAgICAgaGVsbG86IHdvcmxkXG4gICAgICAgICAgICApXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgZGVzY3JpYmUgJ2NoYXJhY3RlcnNUb0FkZFNwYWNlT25TdXJyb3VuZCBzZXR0aW5nJywgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIHNldHRpbmdzLnNldCgnY2hhcmFjdGVyc1RvQWRkU3BhY2VPblN1cnJvdW5kJywgWycoJywgJ3snLCAnWyddKVxuXG4gICAgICAgIGRlc2NyaWJlICd3aGVuIGlucHV0IGNoYXIgaXMgaW4gY2hhcmFjdGVyc1RvQWRkU3BhY2VPblN1cnJvdW5kJywgLT5cbiAgICAgICAgICBkZXNjcmliZSAnc2luZ2xlIGxpbmUgdGV4dCcsIC0+XG4gICAgICAgICAgICBpdCBcImFkZCBzaW5nbGUgc3BhY2UgYXJvdW5kIHBhaXIgcmVnYXJkbGVzcyBvZiBleHNpdGluZyBpbm5lciB0ZXh0XCIsIC0+XG4gICAgICAgICAgICAgIHNldCB0ZXh0QzogXCJ8KGFwcGxlKVwiOyAgICAgZW5zdXJlICdjIFMgKCB7JywgdGV4dDogXCJ7IGFwcGxlIH1cIlxuICAgICAgICAgICAgICBzZXQgdGV4dEM6IFwifCggYXBwbGUgKVwiOyAgIGVuc3VyZSAnYyBTICggeycsIHRleHQ6IFwieyBhcHBsZSB9XCJcbiAgICAgICAgICAgICAgc2V0IHRleHRDOiBcInwoICBhcHBsZSAgKVwiOyBlbnN1cmUgJ2MgUyAoIHsnLCB0ZXh0OiBcInsgYXBwbGUgfVwiXG5cbiAgICAgICAgICBkZXNjcmliZSAnbXVsdGkgbGluZSB0ZXh0JywgLT5cbiAgICAgICAgICAgIGl0IFwiZG9uJ3Qgc2FkZCBzaW5nbGUgc3BhY2UgYXJvdW5kIHBhaXJcIiwgLT5cbiAgICAgICAgICAgICAgc2V0IHRleHRDOiBcInwoXFxuYXBwbGVcXG4pXCI7IGVuc3VyZSBcImMgUyAoIHtcIiwgdGV4dDogXCJ7XFxuYXBwbGVcXG59XCJcblxuICAgICAgICBkZXNjcmliZSAnd2hlbiBmaXJzdCBpbnB1dCBjaGFyIGlzIG5vdCBpbiBjaGFyYWN0ZXJzVG9BZGRTcGFjZU9uU3Vycm91bmQnLCAtPlxuICAgICAgICAgIGl0IFwicmVtb3ZlIHN1cnJvdW5kaW5nIHNwYWNlIG9mIGlubmVyIHRleHQgZm9yIGlkZW50aWNhbCBwYWlyLWNoYXJcIiwgLT5cbiAgICAgICAgICAgIHNldCB0ZXh0QzogXCJ8KGFwcGxlKVwiOyAgICAgZW5zdXJlIFwiYyBTICggfVwiLCB0ZXh0OiBcInthcHBsZX1cIlxuICAgICAgICAgICAgc2V0IHRleHRDOiBcInwoIGFwcGxlIClcIjsgICBlbnN1cmUgXCJjIFMgKCB9XCIsIHRleHQ6IFwie2FwcGxlfVwiXG4gICAgICAgICAgICBzZXQgdGV4dEM6IFwifCggIGFwcGxlICApXCI7IGVuc3VyZSBcImMgUyAoIH1cIiwgdGV4dDogXCJ7YXBwbGV9XCJcbiAgICAgICAgICBpdCBcImRvZXNuJ3QgcmVtb3ZlIHN1cnJvdW5kaW5nIHNwYWNlIG9mIGlubmVyIHRleHQgZm9yIG5vbi1pZGVudGljYWwgcGFpci1jaGFyXCIsIC0+XG4gICAgICAgICAgICBzZXQgdGV4dEM6ICd8XCJhcHBsZVwiJzsgICAgIGVuc3VyZSAnYyBTIFwiIGAnLCB0ZXh0OiBcImBhcHBsZWBcIlxuICAgICAgICAgICAgc2V0IHRleHRDOiAnfFwiICBhcHBsZSAgXCInOyBlbnN1cmUgJ2MgUyBcIiBgJywgdGV4dDogXCJgICBhcHBsZSAgYFwiXG4gICAgICAgICAgICBzZXQgdGV4dEM6ICd8XCIgIGFwcGxlICBcIic7IGVuc3VyZSAnYyBTIFwiIFxcJycsIHRleHQ6IFwiJyAgYXBwbGUgICdcIlxuXG4gICAgZGVzY3JpYmUgJ3N1cnJvdW5kLXdvcmQnLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBhdG9tLmtleW1hcHMuYWRkIFwic3Vycm91bmQtdGVzdFwiLFxuICAgICAgICAgICdhdG9tLXRleHQtZWRpdG9yLnZpbS1tb2RlLXBsdXMubm9ybWFsLW1vZGUnOlxuICAgICAgICAgICAgJ3kgcyB3JzogJ3ZpbS1tb2RlLXBsdXM6c3Vycm91bmQtd29yZCdcblxuICAgICAgaXQgXCJzdXJyb3VuZCBhIHdvcmQgd2l0aCAoIGFuZCByZXBlYXRhYmxlXCIsIC0+XG4gICAgICAgIGVuc3VyZSAneSBzIHcgKCcsXG4gICAgICAgICAgdGV4dEM6IFwifChhcHBsZSlcXG5wYWlyczogW2JyYWNrZXRzXVxcbnBhaXJzOiBbYnJhY2tldHNdXFxuKCBtdWx0aVxcbiAgbGluZSApXCJcbiAgICAgICAgZW5zdXJlICdqIC4nLFxuICAgICAgICAgIHRleHRDOiBcIihhcHBsZSlcXG58KHBhaXJzKTogW2JyYWNrZXRzXVxcbnBhaXJzOiBbYnJhY2tldHNdXFxuKCBtdWx0aVxcbiAgbGluZSApXCJcbiAgICAgIGl0IFwic3Vycm91bmQgYSB3b3JkIHdpdGggeyBhbmQgcmVwZWF0YWJsZVwiLCAtPlxuICAgICAgICBlbnN1cmUgJ3kgcyB3IHsnLFxuICAgICAgICAgIHRleHRDOiBcInx7YXBwbGV9XFxucGFpcnM6IFticmFja2V0c11cXG5wYWlyczogW2JyYWNrZXRzXVxcbiggbXVsdGlcXG4gIGxpbmUgKVwiXG4gICAgICAgIGVuc3VyZSAnaiAuJyxcbiAgICAgICAgICB0ZXh0QzogXCJ7YXBwbGV9XFxufHtwYWlyc306IFticmFja2V0c11cXG5wYWlyczogW2JyYWNrZXRzXVxcbiggbXVsdGlcXG4gIGxpbmUgKVwiXG5cbiAgICBkZXNjcmliZSAnZGVsZXRlLXN1cnJvdW5kLWFueS1wYWlyJywgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgYXBwbGVcbiAgICAgICAgICAgIChwYWlyczogW3xicmFja2V0c10pXG4gICAgICAgICAgICB7cGFpcnMgXCJzXCIgW2JyYWNrZXRzXX1cbiAgICAgICAgICAgICggbXVsdGlcbiAgICAgICAgICAgICAgbGluZSApXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgaXQgXCJkZWxldGUgc3Vycm91bmRlZCBhbnkgcGFpciBmb3VuZCBhbmQgcmVwZWF0YWJsZVwiLCAtPlxuICAgICAgICBlbnN1cmUgJ2QgcycsXG4gICAgICAgICAgdGV4dDogJ2FwcGxlXFxuKHBhaXJzOiBicmFja2V0cylcXG57cGFpcnMgXCJzXCIgW2JyYWNrZXRzXX1cXG4oIG11bHRpXFxuICBsaW5lICknXG4gICAgICAgIGVuc3VyZSAnLicsXG4gICAgICAgICAgdGV4dDogJ2FwcGxlXFxucGFpcnM6IGJyYWNrZXRzXFxue3BhaXJzIFwic1wiIFticmFja2V0c119XFxuKCBtdWx0aVxcbiAgbGluZSApJ1xuXG4gICAgICBpdCBcImRlbGV0ZSBzdXJyb3VuZGVkIGFueSBwYWlyIGZvdW5kIHdpdGggc2tpcCBwYWlyIG91dCBvZiBjdXJzb3IgYW5kIHJlcGVhdGFibGVcIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzIsIDE0XVxuICAgICAgICBlbnN1cmUgJ2QgcycsXG4gICAgICAgICAgdGV4dDogJ2FwcGxlXFxuKHBhaXJzOiBbYnJhY2tldHNdKVxcbntwYWlycyBcInNcIiBicmFja2V0c31cXG4oIG11bHRpXFxuICBsaW5lICknXG4gICAgICAgIGVuc3VyZSAnLicsXG4gICAgICAgICAgdGV4dDogJ2FwcGxlXFxuKHBhaXJzOiBbYnJhY2tldHNdKVxcbnBhaXJzIFwic1wiIGJyYWNrZXRzXFxuKCBtdWx0aVxcbiAgbGluZSApJ1xuICAgICAgICBlbnN1cmUgJy4nLCAjIGRvIG5vdGhpbmcgYW55IG1vcmVcbiAgICAgICAgICB0ZXh0OiAnYXBwbGVcXG4ocGFpcnM6IFticmFja2V0c10pXFxucGFpcnMgXCJzXCIgYnJhY2tldHNcXG4oIG11bHRpXFxuICBsaW5lICknXG5cbiAgICAgIGl0IFwiZGVsZXRlIHN1cnJvdW5kZWQgY2hhcnMgZXhwYW5kZWQgdG8gbXVsdGktbGluZVwiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMywgMV1cbiAgICAgICAgZW5zdXJlICdkIHMnLFxuICAgICAgICAgIHRleHQ6ICdhcHBsZVxcbihwYWlyczogW2JyYWNrZXRzXSlcXG57cGFpcnMgXCJzXCIgW2JyYWNrZXRzXX1cXG4gbXVsdGlcXG4gIGxpbmUgJ1xuXG4gICAgZGVzY3JpYmUgJ2RlbGV0ZS1zdXJyb3VuZC1hbnktcGFpci1hbGxvdy1mb3J3YXJkaW5nJywgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgYXRvbS5rZXltYXBzLmFkZCBcImtleW1hcHMtZm9yLXN1cnJvdW5kXCIsXG4gICAgICAgICAgJ2F0b20tdGV4dC1lZGl0b3IudmltLW1vZGUtcGx1cy5ub3JtYWwtbW9kZSc6XG4gICAgICAgICAgICAnZCBzJzogJ3ZpbS1tb2RlLXBsdXM6ZGVsZXRlLXN1cnJvdW5kLWFueS1wYWlyLWFsbG93LWZvcndhcmRpbmcnXG5cbiAgICAgICAgc2V0dGluZ3Muc2V0KCdzdGF5T25UcmFuc2Zvcm1TdHJpbmcnLCB0cnVlKVxuXG4gICAgICBpdCBcIlsxXSBzaW5nbGUgbGluZVwiLCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgfF9fXyhpbm5lcilcbiAgICAgICAgICBfX18oaW5uZXIpXG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgIGVuc3VyZSAnZCBzJyxcbiAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgfF9fX2lubmVyXG4gICAgICAgICAgX19fKGlubmVyKVxuICAgICAgICAgIFwiXCJcIlxuICAgICAgICBlbnN1cmUgJ2ogLicsXG4gICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgIF9fX2lubmVyXG4gICAgICAgICAgfF9fX2lubmVyXG4gICAgICAgICAgXCJcIlwiXG5cbiAgICBkZXNjcmliZSAnY2hhbmdlLXN1cnJvdW5kLWFueS1wYWlyJywgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgKHxhcHBsZSlcbiAgICAgICAgICAgIChncmFwZSlcbiAgICAgICAgICAgIDxsZW1tb24+XG4gICAgICAgICAgICB7b3JhbmdlfVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgIGl0IFwiY2hhbmdlIGFueSBzdXJyb3VuZGVkIHBhaXIgZm91bmQgYW5kIHJlcGVhdGFibGVcIiwgLT5cbiAgICAgICAgZW5zdXJlICdjIHMgPCcsIHRleHRDOiBcInw8YXBwbGU+XFxuKGdyYXBlKVxcbjxsZW1tb24+XFxue29yYW5nZX1cIlxuICAgICAgICBlbnN1cmUgJ2ogLicsIHRleHRDOiBcIjxhcHBsZT5cXG58PGdyYXBlPlxcbjxsZW1tb24+XFxue29yYW5nZX1cIlxuICAgICAgICBlbnN1cmUgJ2ogaiAuJywgdGV4dEM6IFwiPGFwcGxlPlxcbjxncmFwZT5cXG48bGVtbW9uPlxcbnw8b3JhbmdlPlwiXG5cbiAgICBkZXNjcmliZSAnY2hhbmdlLXN1cnJvdW5kLWFueS1wYWlyLWFsbG93LWZvcndhcmRpbmcnLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBhdG9tLmtleW1hcHMuYWRkIFwia2V5bWFwcy1mb3Itc3Vycm91bmRcIixcbiAgICAgICAgICAnYXRvbS10ZXh0LWVkaXRvci52aW0tbW9kZS1wbHVzLm5vcm1hbC1tb2RlJzpcbiAgICAgICAgICAgICdjIHMnOiAndmltLW1vZGUtcGx1czpjaGFuZ2Utc3Vycm91bmQtYW55LXBhaXItYWxsb3ctZm9yd2FyZGluZydcbiAgICAgICAgc2V0dGluZ3Muc2V0KCdzdGF5T25UcmFuc2Zvcm1TdHJpbmcnLCB0cnVlKVxuICAgICAgaXQgXCJbMV0gc2luZ2xlIGxpbmVcIiwgLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgIHxfX18oaW5uZXIpXG4gICAgICAgICAgX19fKGlubmVyKVxuICAgICAgICAgIFwiXCJcIlxuICAgICAgICBlbnN1cmUgJ2MgcyA8JyxcbiAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgfF9fXzxpbm5lcj5cbiAgICAgICAgICBfX18oaW5uZXIpXG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgIGVuc3VyZSAnaiAuJyxcbiAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgX19fPGlubmVyPlxuICAgICAgICAgIHxfX188aW5uZXI+XG4gICAgICAgICAgXCJcIlwiXG5cbiAgZGVzY3JpYmUgJ1JlcGxhY2VXaXRoUmVnaXN0ZXInLCAtPlxuICAgIG9yaWdpbmFsVGV4dCA9IG51bGxcbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBhdG9tLmtleW1hcHMuYWRkIFwidGVzdFwiLFxuICAgICAgICAnYXRvbS10ZXh0LWVkaXRvci52aW0tbW9kZS1wbHVzOm5vdCguaW5zZXJ0LW1vZGUpJzpcbiAgICAgICAgICAnXyc6ICd2aW0tbW9kZS1wbHVzOnJlcGxhY2Utd2l0aC1yZWdpc3RlcidcblxuICAgICAgb3JpZ2luYWxUZXh0ID0gXCJcIlwiXG4gICAgICBhYmMgZGVmICdhYWEnXG4gICAgICBoZXJlIChwYXJlbnRoZXNpcylcbiAgICAgIGhlcmUgKHBhcmVudGhlc2lzKVxuICAgICAgXCJcIlwiXG4gICAgICBzZXRcbiAgICAgICAgdGV4dDogb3JpZ2luYWxUZXh0XG4gICAgICAgIGN1cnNvcjogWzAsIDldXG5cbiAgICAgIHNldCByZWdpc3RlcjogJ1wiJzogdGV4dDogJ2RlZmF1bHQgcmVnaXN0ZXInLCB0eXBlOiAnY2hhcmFjdGVyd2lzZSdcbiAgICAgIHNldCByZWdpc3RlcjogJ2EnOiB0ZXh0OiAnQSByZWdpc3RlcicsIHR5cGU6ICdjaGFyYWN0ZXJ3aXNlJ1xuXG4gICAgaXQgXCJyZXBsYWNlIHNlbGVjdGlvbiB3aXRoIHJlZ2lzZ3RlcidzIGNvbnRlbnRcIiwgLT5cbiAgICAgIGVuc3VyZSAndiBpIHcnLFxuICAgICAgICBzZWxlY3RlZFRleHQ6ICdhYWEnXG4gICAgICBlbnN1cmUgJ18nLFxuICAgICAgICBtb2RlOiAnbm9ybWFsJ1xuICAgICAgICB0ZXh0OiBvcmlnaW5hbFRleHQucmVwbGFjZSgnYWFhJywgJ2RlZmF1bHQgcmVnaXN0ZXInKVxuXG4gICAgaXQgXCJyZXBsYWNlIHRleHQgb2JqZWN0IHdpdGggcmVnaXNndGVyJ3MgY29udGVudFwiLCAtPlxuICAgICAgc2V0IGN1cnNvcjogWzEsIDZdXG4gICAgICBlbnN1cmUgJ18gaSAoJyxcbiAgICAgICAgbW9kZTogJ25vcm1hbCdcbiAgICAgICAgdGV4dDogb3JpZ2luYWxUZXh0LnJlcGxhY2UoJ3BhcmVudGhlc2lzJywgJ2RlZmF1bHQgcmVnaXN0ZXInKVxuXG4gICAgaXQgXCJjYW4gcmVwZWF0XCIsIC0+XG4gICAgICBzZXQgY3Vyc29yOiBbMSwgNl1cbiAgICAgIGVuc3VyZSAnXyBpICggaiAuJyxcbiAgICAgICAgbW9kZTogJ25vcm1hbCdcbiAgICAgICAgdGV4dDogb3JpZ2luYWxUZXh0LnJlcGxhY2UoL3BhcmVudGhlc2lzL2csICdkZWZhdWx0IHJlZ2lzdGVyJylcblxuICAgIGl0IFwiY2FuIHVzZSBzcGVjaWZpZWQgcmVnaXN0ZXIgdG8gcmVwbGFjZSB3aXRoXCIsIC0+XG4gICAgICBzZXQgY3Vyc29yOiBbMSwgNl1cbiAgICAgIGVuc3VyZSAnXCIgYSBfIGkgKCcsXG4gICAgICAgIG1vZGU6ICdub3JtYWwnXG4gICAgICAgIHRleHQ6IG9yaWdpbmFsVGV4dC5yZXBsYWNlKCdwYXJlbnRoZXNpcycsICdBIHJlZ2lzdGVyJylcblxuICBkZXNjcmliZSAnU3dhcFdpdGhSZWdpc3RlcicsIC0+XG4gICAgb3JpZ2luYWxUZXh0ID0gbnVsbFxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIGF0b20ua2V5bWFwcy5hZGQgXCJ0ZXN0XCIsXG4gICAgICAgICdhdG9tLXRleHQtZWRpdG9yLnZpbS1tb2RlLXBsdXM6bm90KC5pbnNlcnQtbW9kZSknOlxuICAgICAgICAgICdnIHAnOiAndmltLW1vZGUtcGx1czpzd2FwLXdpdGgtcmVnaXN0ZXInXG5cbiAgICAgIG9yaWdpbmFsVGV4dCA9IFwiXCJcIlxuICAgICAgYWJjIGRlZiAnYWFhJ1xuICAgICAgaGVyZSAoMTExKVxuICAgICAgaGVyZSAoMjIyKVxuICAgICAgXCJcIlwiXG4gICAgICBzZXRcbiAgICAgICAgdGV4dDogb3JpZ2luYWxUZXh0XG4gICAgICAgIGN1cnNvcjogWzAsIDldXG5cbiAgICAgIHNldCByZWdpc3RlcjogJ1wiJzogdGV4dDogJ2RlZmF1bHQgcmVnaXN0ZXInLCB0eXBlOiAnY2hhcmFjdGVyd2lzZSdcbiAgICAgIHNldCByZWdpc3RlcjogJ2EnOiB0ZXh0OiAnQSByZWdpc3RlcicsIHR5cGU6ICdjaGFyYWN0ZXJ3aXNlJ1xuXG4gICAgaXQgXCJzd2FwIHNlbGVjdGlvbiB3aXRoIHJlZ2lzZ3RlcidzIGNvbnRlbnRcIiwgLT5cbiAgICAgIGVuc3VyZSAndiBpIHcnLCBzZWxlY3RlZFRleHQ6ICdhYWEnXG4gICAgICBlbnN1cmUgJ2cgcCcsXG4gICAgICAgIG1vZGU6ICdub3JtYWwnXG4gICAgICAgIHRleHQ6IG9yaWdpbmFsVGV4dC5yZXBsYWNlKCdhYWEnLCAnZGVmYXVsdCByZWdpc3RlcicpXG4gICAgICAgIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiAnYWFhJ1xuXG4gICAgaXQgXCJzd2FwIHRleHQgb2JqZWN0IHdpdGggcmVnaXNndGVyJ3MgY29udGVudFwiLCAtPlxuICAgICAgc2V0IGN1cnNvcjogWzEsIDZdXG4gICAgICBlbnN1cmUgJ2cgcCBpICgnLFxuICAgICAgICBtb2RlOiAnbm9ybWFsJ1xuICAgICAgICB0ZXh0OiBvcmlnaW5hbFRleHQucmVwbGFjZSgnMTExJywgJ2RlZmF1bHQgcmVnaXN0ZXInKVxuICAgICAgICByZWdpc3RlcjogJ1wiJzogdGV4dDogJzExMSdcblxuICAgIGl0IFwiY2FuIHJlcGVhdFwiLCAtPlxuICAgICAgc2V0IGN1cnNvcjogWzEsIDZdXG4gICAgICB1cGRhdGVkVGV4dCA9IFwiXCJcIlxuICAgICAgICBhYmMgZGVmICdhYWEnXG4gICAgICAgIGhlcmUgKGRlZmF1bHQgcmVnaXN0ZXIpXG4gICAgICAgIGhlcmUgKDExMSlcbiAgICAgICAgXCJcIlwiXG4gICAgICBlbnN1cmUgJ2cgcCBpICggaiAuJyxcbiAgICAgICAgbW9kZTogJ25vcm1hbCdcbiAgICAgICAgdGV4dDogdXBkYXRlZFRleHRcbiAgICAgICAgcmVnaXN0ZXI6ICdcIic6IHRleHQ6ICcyMjInXG5cbiAgICBpdCBcImNhbiB1c2Ugc3BlY2lmaWVkIHJlZ2lzdGVyIHRvIHN3YXAgd2l0aFwiLCAtPlxuICAgICAgc2V0IGN1cnNvcjogWzEsIDZdXG4gICAgICBlbnN1cmUgJ1wiIGEgZyBwIGkgKCcsXG4gICAgICAgIG1vZGU6ICdub3JtYWwnXG4gICAgICAgIHRleHQ6IG9yaWdpbmFsVGV4dC5yZXBsYWNlKCcxMTEnLCAnQSByZWdpc3RlcicpXG4gICAgICAgIHJlZ2lzdGVyOiAnYSc6IHRleHQ6ICcxMTEnXG5cbiAgZGVzY3JpYmUgXCJKb2luIGFuZCBpdCdzIGZhbWlseVwiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNldFxuICAgICAgICB0ZXh0Q186IFwiXCJcIlxuICAgICAgICBfXzB8MTJcbiAgICAgICAgX18zNDVcbiAgICAgICAgX182NzhcbiAgICAgICAgX185YWJcXG5cbiAgICAgICAgXCJcIlwiXG5cbiAgICBkZXNjcmliZSBcIkpvaW5cIiwgLT5cbiAgICAgIGl0IFwiam9pbnMgbGluZXMgd2l0aCB0cmltaW5nIGxlYWRpbmcgd2hpdGVzcGFjZVwiLCAtPlxuICAgICAgICBlbnN1cmUgJ0onLFxuICAgICAgICAgIHRleHRDXzogXCJcIlwiXG4gICAgICAgICAgX18wMTJ8IDM0NVxuICAgICAgICAgIF9fNjc4XG4gICAgICAgICAgX185YWJcXG5cbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgZW5zdXJlICcuJyxcbiAgICAgICAgICB0ZXh0Q186IFwiXCJcIlxuICAgICAgICAgIF9fMDEyIDM0NXwgNjc4XG4gICAgICAgICAgX185YWJcXG5cbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgZW5zdXJlICcuJyxcbiAgICAgICAgICB0ZXh0Q186IFwiXCJcIlxuICAgICAgICAgIF9fMDEyIDM0NSA2Nzh8IDlhYlxcblxuICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGVuc3VyZSAndScsXG4gICAgICAgICAgdGV4dENfOiBcIlwiXCJcbiAgICAgICAgICBfXzAxMiAzNDV8IDY3OFxuICAgICAgICAgIF9fOWFiXFxuXG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgIGVuc3VyZSAndScsXG4gICAgICAgICAgdGV4dENfOiBcIlwiXCJcbiAgICAgICAgICBfXzAxMnwgMzQ1XG4gICAgICAgICAgX182NzhcbiAgICAgICAgICBfXzlhYlxcblxuICAgICAgICAgIFwiXCJcIlxuICAgICAgICBlbnN1cmUgJ3UnLFxuICAgICAgICAgIHRleHRDXzogXCJcIlwiXG4gICAgICAgICAgX18wfDEyXG4gICAgICAgICAgX18zNDVcbiAgICAgICAgICBfXzY3OFxuICAgICAgICAgIF9fOWFiXFxuXG4gICAgICAgICAgXCJcIlwiXG5cbiAgICAgIGl0IFwiam9pbnMgZG8gbm90aGluZyB3aGVuIGl0IGNhbm5vdCBqb2luIGFueSBtb3JlXCIsIC0+XG4gICAgICAgICMgRklYTUU6IFwiXFxuXCIgcmVtYWluIGl0J3MgaW5jb25zaXN0ZW50IHdpdGggbXVsdGktdGltZSBKXG4gICAgICAgIGVuc3VyZSAnMSAwIDAgSicsIHRleHRDXzogXCIgIDAxMiAzNDUgNjc4IDlhfGJcXG5cIlxuXG4gICAgICBpdCBcImpvaW5zIGRvIG5vdGhpbmcgd2hlbiBpdCBjYW5ub3Qgam9pbiBhbnkgbW9yZVwiLCAtPlxuICAgICAgICBlbnN1cmUgJ0ogSiBKJywgdGV4dENfOiBcIiAgMDEyIDM0NSA2Nzh8IDlhYlxcblwiXG4gICAgICAgIGVuc3VyZSAnSicsIHRleHRDXzogXCIgIDAxMiAzNDUgNjc4IDlhfGJcIlxuICAgICAgICBlbnN1cmUgJ0onLCB0ZXh0Q186IFwiICAwMTIgMzQ1IDY3OCA5YXxiXCJcblxuICAgIGRlc2NyaWJlIFwiSm9pbldpdGhLZWVwaW5nU3BhY2VcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgYXRvbS5rZXltYXBzLmFkZCBcInRlc3RcIixcbiAgICAgICAgICAnYXRvbS10ZXh0LWVkaXRvci52aW0tbW9kZS1wbHVzOm5vdCguaW5zZXJ0LW1vZGUpJzpcbiAgICAgICAgICAgICdnIEonOiAndmltLW1vZGUtcGx1czpqb2luLXdpdGgta2VlcGluZy1zcGFjZSdcblxuICAgICAgaXQgXCJqb2lucyBsaW5lcyB3aXRob3V0IHRyaW1pbmcgbGVhZGluZyB3aGl0ZXNwYWNlXCIsIC0+XG4gICAgICAgIGVuc3VyZSAnZyBKJyxcbiAgICAgICAgICB0ZXh0Q186IFwiXCJcIlxuICAgICAgICAgIF9fMHwxMl9fMzQ1XG4gICAgICAgICAgX182NzhcbiAgICAgICAgICBfXzlhYlxcblxuICAgICAgICAgIFwiXCJcIlxuICAgICAgICBlbnN1cmUgJy4nLFxuICAgICAgICAgIHRleHRDXzogXCJcIlwiXG4gICAgICAgICAgX18wfDEyX18zNDVfXzY3OFxuICAgICAgICAgIF9fOWFiXFxuXG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgIGVuc3VyZSAndSB1JyxcbiAgICAgICAgICB0ZXh0Q186IFwiXCJcIlxuICAgICAgICAgIF9fMHwxMlxuICAgICAgICAgIF9fMzQ1XG4gICAgICAgICAgX182NzhcbiAgICAgICAgICBfXzlhYlxcblxuICAgICAgICAgIFwiXCJcIlxuICAgICAgICBlbnN1cmUgJzQgZyBKJyxcbiAgICAgICAgICB0ZXh0Q186IFwiXCJcIlxuICAgICAgICAgIF9fMHwxMl9fMzQ1X182NzhfXzlhYlxcblxuICAgICAgICAgIFwiXCJcIlxuXG4gICAgZGVzY3JpYmUgXCJKb2luQnlJbnB1dFwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBhdG9tLmtleW1hcHMuYWRkIFwidGVzdFwiLFxuICAgICAgICAgICdhdG9tLXRleHQtZWRpdG9yLnZpbS1tb2RlLXBsdXM6bm90KC5pbnNlcnQtbW9kZSknOlxuICAgICAgICAgICAgJ2cgSic6ICd2aW0tbW9kZS1wbHVzOmpvaW4tYnktaW5wdXQnXG5cbiAgICAgIGl0IFwiam9pbnMgbGluZXMgYnkgY2hhciBmcm9tIHVzZXIgd2l0aCB0cmltaW5nIGxlYWRpbmcgd2hpdGVzcGFjZVwiLCAtPlxuICAgICAgICBlbnN1cmUgJ2cgSiA6IDogZW50ZXInLFxuICAgICAgICAgIHRleHRDXzogXCJcIlwiXG4gICAgICAgICAgX18wfDEyOjozNDVcbiAgICAgICAgICBfXzY3OFxuICAgICAgICAgIF9fOWFiXFxuXG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgIGVuc3VyZSAnLicsXG4gICAgICAgICAgdGV4dENfOiBcIlwiXCJcbiAgICAgICAgICBfXzB8MTI6OjM0NTo6Njc4XG4gICAgICAgICAgX185YWJcXG5cbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgZW5zdXJlICd1IHUnLFxuICAgICAgICAgIHRleHRDXzogXCJcIlwiXG4gICAgICAgICAgX18wfDEyXG4gICAgICAgICAgX18zNDVcbiAgICAgICAgICBfXzY3OFxuICAgICAgICAgIF9fOWFiXFxuXG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgIGVuc3VyZSAnNCBnIEogOiA6IGVudGVyJyxcbiAgICAgICAgICB0ZXh0Q186IFwiXCJcIlxuICAgICAgICAgIF9fMHwxMjo6MzQ1Ojo2Nzg6OjlhYlxcblxuICAgICAgICAgIFwiXCJcIlxuXG4gICAgZGVzY3JpYmUgXCJKb2luQnlJbnB1dFdpdGhLZWVwaW5nU3BhY2VcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgYXRvbS5rZXltYXBzLmFkZCBcInRlc3RcIixcbiAgICAgICAgICAnYXRvbS10ZXh0LWVkaXRvci52aW0tbW9kZS1wbHVzOm5vdCguaW5zZXJ0LW1vZGUpJzpcbiAgICAgICAgICAgICdnIEonOiAndmltLW1vZGUtcGx1czpqb2luLWJ5LWlucHV0LXdpdGgta2VlcGluZy1zcGFjZSdcblxuICAgICAgaXQgXCJqb2lucyBsaW5lcyBieSBjaGFyIGZyb20gdXNlciB3aXRob3V0IHRyaW1pbmcgbGVhZGluZyB3aGl0ZXNwYWNlXCIsIC0+XG4gICAgICAgIGVuc3VyZSAnZyBKIDogOiBlbnRlcicsXG4gICAgICAgICAgdGV4dENfOiBcIlwiXCJcbiAgICAgICAgICBfXzB8MTI6Ol9fMzQ1XG4gICAgICAgICAgX182NzhcbiAgICAgICAgICBfXzlhYlxcblxuICAgICAgICAgIFwiXCJcIlxuICAgICAgICBlbnN1cmUgJy4nLFxuICAgICAgICAgIHRleHRDXzogXCJcIlwiXG4gICAgICAgICAgX18wfDEyOjpfXzM0NTo6X182NzhcbiAgICAgICAgICBfXzlhYlxcblxuICAgICAgICAgIFwiXCJcIlxuICAgICAgICBlbnN1cmUgJ3UgdScsXG4gICAgICAgICAgdGV4dENfOiBcIlwiXCJcbiAgICAgICAgICBfXzB8MTJcbiAgICAgICAgICBfXzM0NVxuICAgICAgICAgIF9fNjc4XG4gICAgICAgICAgX185YWJcXG5cbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgZW5zdXJlICc0IGcgSiA6IDogZW50ZXInLFxuICAgICAgICAgIHRleHRDXzogXCJcIlwiXG4gICAgICAgICAgX18wfDEyOjpfXzM0NTo6X182Nzg6Ol9fOWFiXFxuXG4gICAgICAgICAgXCJcIlwiXG5cbiAgZGVzY3JpYmUgJ1RvZ2dsZUxpbmVDb21tZW50cycsIC0+XG4gICAgW29sZEdyYW1tYXIsIG9yaWdpbmFsVGV4dF0gPSBbXVxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgICBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZSgnbGFuZ3VhZ2UtY29mZmVlLXNjcmlwdCcpXG5cbiAgICAgIHJ1bnMgLT5cbiAgICAgICAgb2xkR3JhbW1hciA9IGVkaXRvci5nZXRHcmFtbWFyKClcbiAgICAgICAgZ3JhbW1hciA9IGF0b20uZ3JhbW1hcnMuZ3JhbW1hckZvclNjb3BlTmFtZSgnc291cmNlLmNvZmZlZScpXG4gICAgICAgIGVkaXRvci5zZXRHcmFtbWFyKGdyYW1tYXIpXG4gICAgICAgIG9yaWdpbmFsVGV4dCA9IFwiXCJcIlxuICAgICAgICAgIGNsYXNzIEJhc2VcbiAgICAgICAgICAgIGNvbnN0cnVjdG9yOiAoYXJncykgLT5cbiAgICAgICAgICAgICAgcGl2b3QgPSBpdGVtcy5zaGlmdCgpXG4gICAgICAgICAgICAgIGxlZnQgPSBbXVxuICAgICAgICAgICAgICByaWdodCA9IFtdXG5cbiAgICAgICAgICBjb25zb2xlLmxvZyBcImhlbGxvXCJcbiAgICAgICAgXCJcIlwiXG4gICAgICAgIHNldCB0ZXh0OiBvcmlnaW5hbFRleHRcblxuICAgIGFmdGVyRWFjaCAtPlxuICAgICAgZWRpdG9yLnNldEdyYW1tYXIob2xkR3JhbW1hcilcblxuICAgIGl0ICd0b2dnbGUgY29tbWVudCBmb3IgdGV4dG9iamVjdCBmb3IgaW5kZW50IGFuZCByZXBlYXRhYmxlJywgLT5cbiAgICAgIHNldCBjdXJzb3I6IFsyLCAwXVxuICAgICAgZW5zdXJlICdnIC8gaSBpJyxcbiAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgY2xhc3MgQmFzZVxuICAgICAgICAgICAgY29uc3RydWN0b3I6IChhcmdzKSAtPlxuICAgICAgICAgICAgICAjIHBpdm90ID0gaXRlbXMuc2hpZnQoKVxuICAgICAgICAgICAgICAjIGxlZnQgPSBbXVxuICAgICAgICAgICAgICAjIHJpZ2h0ID0gW11cblxuICAgICAgICAgIGNvbnNvbGUubG9nIFwiaGVsbG9cIlxuICAgICAgICBcIlwiXCJcbiAgICAgIGVuc3VyZSAnLicsIHRleHQ6IG9yaWdpbmFsVGV4dFxuXG4gICAgaXQgJ3RvZ2dsZSBjb21tZW50IGZvciB0ZXh0b2JqZWN0IGZvciBwYXJhZ3JhcGggYW5kIHJlcGVhdGFibGUnLCAtPlxuICAgICAgc2V0IGN1cnNvcjogWzIsIDBdXG4gICAgICBlbnN1cmUgJ2cgLyBpIHAnLFxuICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAjIGNsYXNzIEJhc2VcbiAgICAgICAgICAjICAgY29uc3RydWN0b3I6IChhcmdzKSAtPlxuICAgICAgICAgICMgICAgIHBpdm90ID0gaXRlbXMuc2hpZnQoKVxuICAgICAgICAgICMgICAgIGxlZnQgPSBbXVxuICAgICAgICAgICMgICAgIHJpZ2h0ID0gW11cblxuICAgICAgICAgIGNvbnNvbGUubG9nIFwiaGVsbG9cIlxuICAgICAgICBcIlwiXCJcblxuICAgICAgZW5zdXJlICcuJywgdGV4dDogb3JpZ2luYWxUZXh0XG5cbiAgZGVzY3JpYmUgXCJTcGxpdFN0cmluZywgU3BsaXRTdHJpbmdXaXRoS2VlcGluZ1NwbGl0dGVyXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgYXRvbS5rZXltYXBzLmFkZCBcInRlc3RcIixcbiAgICAgICAgJ2F0b20tdGV4dC1lZGl0b3IudmltLW1vZGUtcGx1czpub3QoLmluc2VydC1tb2RlKSc6XG4gICAgICAgICAgJ2cgLyc6ICd2aW0tbW9kZS1wbHVzOnNwbGl0LXN0cmluZydcbiAgICAgICAgICAnZyA/JzogJ3ZpbS1tb2RlLXBsdXM6c3BsaXQtc3RyaW5nLXdpdGgta2VlcGluZy1zcGxpdHRlcidcbiAgICAgIHNldFxuICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgIHxhOmI6Y1xuICAgICAgICBkOmU6ZlxcblxuICAgICAgICBcIlwiXCJcbiAgICBkZXNjcmliZSBcIlNwbGl0U3RyaW5nXCIsIC0+XG4gICAgICBpdCBcInNwbGl0IHN0cmluZyBpbnRvIGxpbmVzXCIsIC0+XG4gICAgICAgIGVuc3VyZSBcImcgLyA6IGVudGVyXCIsXG4gICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgIHxhXG4gICAgICAgICAgYlxuICAgICAgICAgIGNcbiAgICAgICAgICBkOmU6ZlxcblxuICAgICAgICAgIFwiXCJcIlxuICAgICAgICBlbnN1cmUgXCJHIC5cIixcbiAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgYVxuICAgICAgICAgIGJcbiAgICAgICAgICBjXG4gICAgICAgICAgfGRcbiAgICAgICAgICBlXG4gICAgICAgICAgZlxcblxuICAgICAgICAgIFwiXCJcIlxuICAgIGRlc2NyaWJlIFwiU3BsaXRTdHJpbmdXaXRoS2VlcGluZ1NwbGl0dGVyXCIsIC0+XG4gICAgICBpdCBcInNwbGl0IHN0cmluZyBpbnRvIGxpbmVzIHdpdGhvdXQgcmVtb3Zpbmcgc3BsaXRlciBjaGFyXCIsIC0+XG4gICAgICAgIGVuc3VyZSBcImcgPyA6IGVudGVyXCIsXG4gICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgIHxhOlxuICAgICAgICAgIGI6XG4gICAgICAgICAgY1xuICAgICAgICAgIGQ6ZTpmXFxuXG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgIGVuc3VyZSBcIkcgLlwiLFxuICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICBhOlxuICAgICAgICAgIGI6XG4gICAgICAgICAgY1xuICAgICAgICAgIHxkOlxuICAgICAgICAgIGU6XG4gICAgICAgICAgZlxcblxuICAgICAgICAgIFwiXCJcIlxuXG4gIGRlc2NyaWJlIFwiU3BsaXRBcmd1bWVudHMsIFNwbGl0QXJndW1lbnRzV2l0aFJlbW92ZVNlcGFyYXRvclwiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIGF0b20ua2V5bWFwcy5hZGQgXCJ0ZXN0XCIsXG4gICAgICAgICdhdG9tLXRleHQtZWRpdG9yLnZpbS1tb2RlLXBsdXM6bm90KC5pbnNlcnQtbW9kZSknOlxuICAgICAgICAgICdnICwnOiAndmltLW1vZGUtcGx1czpzcGxpdC1hcmd1bWVudHMnXG4gICAgICAgICAgJ2cgISc6ICd2aW0tbW9kZS1wbHVzOnNwbGl0LWFyZ3VtZW50cy13aXRoLXJlbW92ZS1zZXBhcmF0b3InXG5cbiAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgICBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZSgnbGFuZ3VhZ2UtamF2YXNjcmlwdCcpXG4gICAgICBydW5zIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIGdyYW1tYXI6ICdzb3VyY2UuanMnXG4gICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICBoZWxsbyA9ICgpID0+IHtcbiAgICAgICAgICAgICAge2YxLCBmMiwgZjN9ID0gcmVxdWlyZSgnaGVsbG8nKVxuICAgICAgICAgICAgICBmMShmMigxLCBcImEsIGIsIGNcIiksIDIsIChhcmcpID0+IGNvbnNvbGUubG9nKGFyZykpXG4gICAgICAgICAgICAgIHMgPSBgYWJjIGRlZiBoaWpgXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcIlwiXCJcblxuICAgIGRlc2NyaWJlIFwiU3BsaXRBcmd1bWVudHNcIiwgLT5cbiAgICAgIGl0IFwic3BsaXQgYnkgY29tbW1hIHdpdGggYWRqdXN0IGluZGVudFwiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMSwgM11cbiAgICAgICAgZW5zdXJlICdnICwgaSB7JyxcbiAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICBoZWxsbyA9ICgpID0+IHtcbiAgICAgICAgICAgICAgfHtcbiAgICAgICAgICAgICAgICBmMSxcbiAgICAgICAgICAgICAgICBmMixcbiAgICAgICAgICAgICAgICBmM1xuICAgICAgICAgICAgICB9ID0gcmVxdWlyZSgnaGVsbG8nKVxuICAgICAgICAgICAgICBmMShmMigxLCBcImEsIGIsIGNcIiksIDIsIChhcmcpID0+IGNvbnNvbGUubG9nKGFyZykpXG4gICAgICAgICAgICAgIHMgPSBgYWJjIGRlZiBoaWpgXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgIGl0IFwic3BsaXQgYnkgY29tbW1hIHdpdGggYWRqdXN0IGluZGVudFwiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMiwgNV1cbiAgICAgICAgZW5zdXJlICdnICwgaSAoJyxcbiAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICBoZWxsbyA9ICgpID0+IHtcbiAgICAgICAgICAgICAge2YxLCBmMiwgZjN9ID0gcmVxdWlyZSgnaGVsbG8nKVxuICAgICAgICAgICAgICBmMXwoXG4gICAgICAgICAgICAgICAgZjIoMSwgXCJhLCBiLCBjXCIpLFxuICAgICAgICAgICAgICAgIDIsXG4gICAgICAgICAgICAgICAgKGFyZykgPT4gY29uc29sZS5sb2coYXJnKVxuICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgIHMgPSBgYWJjIGRlZiBoaWpgXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAga2V5c3Ryb2tlICdqIHcnXG4gICAgICAgIGVuc3VyZSAnZyAsIGkgKCcsXG4gICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgaGVsbG8gPSAoKSA9PiB7XG4gICAgICAgICAgICAgIHtmMSwgZjIsIGYzfSA9IHJlcXVpcmUoJ2hlbGxvJylcbiAgICAgICAgICAgICAgZjEoXG4gICAgICAgICAgICAgICAgZjJ8KFxuICAgICAgICAgICAgICAgICAgMSxcbiAgICAgICAgICAgICAgICAgIFwiYSwgYiwgY1wiXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAyLFxuICAgICAgICAgICAgICAgIChhcmcpID0+IGNvbnNvbGUubG9nKGFyZylcbiAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICBzID0gYGFiYyBkZWYgaGlqYFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICBpdCBcInNwbGl0IGJ5IHdoaXRlLXNwYWNlIHdpdGggYWRqdXN0IGluZGVudFwiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMywgMTBdXG4gICAgICAgIGVuc3VyZSAnZyAsIGkgYCcsXG4gICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgaGVsbG8gPSAoKSA9PiB7XG4gICAgICAgICAgICAgIHtmMSwgZjIsIGYzfSA9IHJlcXVpcmUoJ2hlbGxvJylcbiAgICAgICAgICAgICAgZjEoZjIoMSwgXCJhLCBiLCBjXCIpLCAyLCAoYXJnKSA9PiBjb25zb2xlLmxvZyhhcmcpKVxuICAgICAgICAgICAgICBzID0gfGBcbiAgICAgICAgICAgICAgYWJjXG4gICAgICAgICAgICAgIGRlZlxuICAgICAgICAgICAgICBoaWpcbiAgICAgICAgICAgICAgYFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICBkZXNjcmliZSBcIlNwbGl0QnlBcmd1bWVudHNXaXRoUmVtb3ZlU2VwYXJhdG9yXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBpdCBcInJlbW92ZSBzcGxpdHRlciB3aGVuIHNwbGl0XCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFsxLCAzXVxuICAgICAgICBlbnN1cmUgJ2cgISBpIHsnLFxuICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICBoZWxsbyA9ICgpID0+IHtcbiAgICAgICAgICAgIHx7XG4gICAgICAgICAgICAgIGYxXG4gICAgICAgICAgICAgIGYyXG4gICAgICAgICAgICAgIGYzXG4gICAgICAgICAgICB9ID0gcmVxdWlyZSgnaGVsbG8nKVxuICAgICAgICAgICAgZjEoZjIoMSwgXCJhLCBiLCBjXCIpLCAyLCAoYXJnKSA9PiBjb25zb2xlLmxvZyhhcmcpKVxuICAgICAgICAgICAgcyA9IGBhYmMgZGVmIGhpamBcbiAgICAgICAgICB9XG4gICAgICAgICAgXCJcIlwiXG5cbiAgZGVzY3JpYmUgXCJDaGFuZ2UgT3JkZXIgZmFpbWxpeTogUmV2ZXJzZSwgU29ydCwgU29ydENhc2VJbnNlbnNpdGl2ZWx5LCBTb3J0QnlOdW1iZXJcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBhdG9tLmtleW1hcHMuYWRkIFwidGVzdFwiLFxuICAgICAgICAnYXRvbS10ZXh0LWVkaXRvci52aW0tbW9kZS1wbHVzOm5vdCguaW5zZXJ0LW1vZGUpJzpcbiAgICAgICAgICAnZyByJzogJ3ZpbS1tb2RlLXBsdXM6cmV2ZXJzZSdcbiAgICAgICAgICAnZyBzJzogJ3ZpbS1tb2RlLXBsdXM6c29ydCdcbiAgICAgICAgICAnZyBTJzogJ3ZpbS1tb2RlLXBsdXM6c29ydC1ieS1udW1iZXInXG4gICAgZGVzY3JpYmUgXCJjaGFyYWN0ZXJ3aXNlIHRhcmdldFwiLCAtPlxuICAgICAgZGVzY3JpYmUgXCJSZXZlcnNlXCIsIC0+XG4gICAgICAgIGl0IFwiW2NvbW1hIHNlcGFyYXRlZF0gcmV2ZXJzZSB0ZXh0XCIsIC0+XG4gICAgICAgICAgc2V0IHRleHRDOiBcIiAgICggZG9nLCBjYXx0LCBmaXNoLCByYWJiaXQsIGR1Y2ssIGdvcGhlciwgc3F1aWQgKVwiXG4gICAgICAgICAgZW5zdXJlICdnIHIgaSAoJywgdGV4dENfOiBcIiAgICh8IHNxdWlkLCBnb3BoZXIsIGR1Y2ssIHJhYmJpdCwgZmlzaCwgY2F0LCBkb2cgKVwiXG4gICAgICAgIGl0IFwiW2NvbW1hIHNwYXJhdGVkXSByZXZlcnNlIHRleHRcIiwgLT5cbiAgICAgICAgICBzZXQgdGV4dEM6IFwiICAgKCAnZG9nIGNhfHQnLCAnZmlzaCByYWJiaXQnLCAnZHVjayBnb3BoZXIgc3F1aWQnIClcIlxuICAgICAgICAgIGVuc3VyZSAnZyByIGkgKCcsIHRleHRDXzogXCIgICAofCAnZHVjayBnb3BoZXIgc3F1aWQnLCAnZmlzaCByYWJiaXQnLCAnZG9nIGNhdCcgKVwiXG4gICAgICAgIGl0IFwiW3NwYWNlIHNwYXJhdGVkXSByZXZlcnNlIHRleHRcIiwgLT5cbiAgICAgICAgICBzZXQgdGV4dEM6IFwiICAgKCBkb2cgY2F8dCBmaXNoIHJhYmJpdCBkdWNrIGdvcGhlciBzcXVpZCApXCJcbiAgICAgICAgICBlbnN1cmUgJ2cgciBpICgnLCB0ZXh0Q186IFwiICAgKHwgc3F1aWQgZ29waGVyIGR1Y2sgcmFiYml0IGZpc2ggY2F0IGRvZyApXCJcbiAgICAgICAgaXQgXCJbY29tbWEgc3BhcmF0ZWQgbXVsdGktbGluZV0gcmV2ZXJzZSB0ZXh0XCIsIC0+XG4gICAgICAgICAgc2V0IHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgfDEsIDIsIDMsIDQsXG4gICAgICAgICAgICAgIDUsIDYsXG4gICAgICAgICAgICAgIDcsXG4gICAgICAgICAgICAgIDgsIDlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIGVuc3VyZSAnZyByIGkgeycsXG4gICAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICB8ICA5LCA4LCA3LCA2LFxuICAgICAgICAgICAgICA1LCA0LFxuICAgICAgICAgICAgICAzLFxuICAgICAgICAgICAgICAyLCAxXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgaXQgXCJbY29tbWEgc3BhcmF0ZWQgbXVsdGktbGluZV0ga2VlcCBjb21tYSBmb2xsb3dlZCB0byBsYXN0IGVudHJ5XCIsIC0+XG4gICAgICAgICAgc2V0IHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgfDEsIDIsIDMsIDQsXG4gICAgICAgICAgICAgIDUsIDYsXG4gICAgICAgICAgICBdXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICBlbnN1cmUgJ2cgciBpIFsnLFxuICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgW1xuICAgICAgICAgICAgfCAgNiwgNSwgNCwgMyxcbiAgICAgICAgICAgICAgMiwgMSxcbiAgICAgICAgICAgIF1cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICBpdCBcIltjb21tYSBzcGFyYXRlZCBtdWx0aS1saW5lXSBhd2FyZSBvZiBuZXh0ZWQgcGFpciBhbmQgcXVvdGVzIGFuZCBlc2NhcGVkIHF1b3RlXCIsIC0+XG4gICAgICAgICAgc2V0IHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAgIChcbiAgICAgICAgICAgICAgfFwiKGEsIGIsIGMpXCIsIFwiWyggZCBlIGZcIiwgdGVzdChnLCBoLCBpKSxcbiAgICAgICAgICAgICAgXCJcXFxcXCJqLCBrLCBsXCIsXG4gICAgICAgICAgICAgICdcXFxcJ20sIG4nLCB0ZXN0KG8sIHApLFxuICAgICAgICAgICAgKVxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgZW5zdXJlICdnIHIgaSAoJyxcbiAgICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAgIChcbiAgICAgICAgICAgIHwgIHRlc3QobywgcCksICdcXFxcJ20sIG4nLCBcIlxcXFxcImosIGssIGxcIixcbiAgICAgICAgICAgICAgdGVzdChnLCBoLCBpKSxcbiAgICAgICAgICAgICAgXCJbKCBkIGUgZlwiLCBcIihhLCBiLCBjKVwiLFxuICAgICAgICAgICAgKVxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgIGl0IFwiW3NwYWNlIHNwYXJhdGVkIG11bHRpLWxpbmVdIGF3YXJlIG9mIG5leHRlZCBwYWlyIGFuZCBxdW90ZXMgYW5kIGVzY2FwZWQgcXVvdGVcIiwgLT5cbiAgICAgICAgICBzZXQgdGV4dENfOiBcIlwiXCJcbiAgICAgICAgICAgIChcbiAgICAgICAgICAgICAgfFwiKGEsIGIsIGMpXCIgXCJbKCBkIGUgZlwiICAgICAgdGVzdChnLCBoLCBpKVxuICAgICAgICAgICAgICBcIlxcXFxcImosIGssIGxcIl9fX1xuICAgICAgICAgICAgICAnXFxcXCdtLCBuJyAgICB0ZXN0KG8sIHApXG4gICAgICAgICAgICApXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICBlbnN1cmUgJ2cgciBpICgnLFxuICAgICAgICAgICAgdGV4dENfOiBcIlwiXCJcbiAgICAgICAgICAgIChcbiAgICAgICAgICAgIHwgIHRlc3QobywgcCkgJ1xcXFwnbSwgbicgICAgICBcIlxcXFxcImosIGssIGxcIlxuICAgICAgICAgICAgICB0ZXN0KGcsIGgsIGkpX19fXG4gICAgICAgICAgICAgIFwiWyggZCBlIGZcIiAgICBcIihhLCBiLCBjKVwiXG4gICAgICAgICAgICApXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgIGRlc2NyaWJlIFwiU29ydFwiLCAtPlxuICAgICAgICBpdCBcIltjb21tYSBzZXBhcmF0ZWRdIHNvcnQgdGV4dFwiLCAtPlxuICAgICAgICAgIHNldCB0ZXh0QzogXCIgICAoIGRvZywgY2F8dCwgZmlzaCwgcmFiYml0LCBkdWNrLCBnb3BoZXIsIHNxdWlkIClcIlxuICAgICAgICAgIGVuc3VyZSAnZyBzIGkgKCcsIHRleHRDOiBcIiAgICh8IGNhdCwgZG9nLCBkdWNrLCBmaXNoLCBnb3BoZXIsIHJhYmJpdCwgc3F1aWQgKVwiXG4gICAgICBkZXNjcmliZSBcIlNvcnRCeU51bWJlclwiLCAtPlxuICAgICAgICBpdCBcIltjb21tYSBzZXBhcmF0ZWRdIHNvcnQgYnkgbnVtYmVyXCIsIC0+XG4gICAgICAgICAgc2V0IHRleHRDXzogXCJfX18oOSwgMSwgfDEwLCA1KVwiXG4gICAgICAgICAgZW5zdXJlICdnIFMgaSAoJywgdGV4dENfOiBcIl9fXyh8MSwgNSwgOSwgMTApXCJcblxuICAgIGRlc2NyaWJlIFwibGluZXdpc2UgdGFyZ2V0XCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICB8elxuXG4gICAgICAgICAgMTBhXG4gICAgICAgICAgYlxuICAgICAgICAgIGFcblxuICAgICAgICAgIDVcbiAgICAgICAgICAxXFxuXG4gICAgICAgICAgXCJcIlwiXG4gICAgICBkZXNjcmliZSBcIlJldmVyc2VcIiwgLT5cbiAgICAgICAgaXQgXCJyZXZlcnNlIHJvd3NcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJ2cgciBHJyxcbiAgICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAgIHwxXG4gICAgICAgICAgICA1XG5cbiAgICAgICAgICAgIGFcbiAgICAgICAgICAgIGJcbiAgICAgICAgICAgIDEwYVxuXG4gICAgICAgICAgICB6XFxuXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgIGRlc2NyaWJlIFwiU29ydFwiLCAtPlxuICAgICAgICBpdCBcInNvcnQgcm93c1wiLCAtPlxuICAgICAgICAgIGVuc3VyZSAnZyBzIEcnLFxuICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgfFxuXG4gICAgICAgICAgICAxXG4gICAgICAgICAgICAxMGFcbiAgICAgICAgICAgIDVcbiAgICAgICAgICAgIGFcbiAgICAgICAgICAgIGJcbiAgICAgICAgICAgIHpcXG5cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgZGVzY3JpYmUgXCJTb3J0QnlOdW1iZXJcIiwgLT5cbiAgICAgICAgaXQgXCJzb3J0IHJvd3MgbnVtZXJpY2FsbHlcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgXCJnIFMgR1wiLFxuICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgfDFcbiAgICAgICAgICAgIDVcbiAgICAgICAgICAgIDEwYVxuICAgICAgICAgICAgelxuXG4gICAgICAgICAgICBiXG4gICAgICAgICAgICBhXG4gICAgICAgICAgICBcXG5cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgZGVzY3JpYmUgXCJTb3J0Q2FzZUluc2Vuc2l0aXZlbHlcIiwgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIGF0b20ua2V5bWFwcy5hZGQgXCJ0ZXN0XCIsXG4gICAgICAgICAgICAnYXRvbS10ZXh0LWVkaXRvci52aW0tbW9kZS1wbHVzOm5vdCguaW5zZXJ0LW1vZGUpJzpcbiAgICAgICAgICAgICAgJ2cgcyc6ICd2aW0tbW9kZS1wbHVzOnNvcnQtY2FzZS1pbnNlbnNpdGl2ZWx5J1xuICAgICAgICBpdCBcIlNvcnQgcm93cyBjYXNlLWluc2Vuc2l0aXZlbHlcIiwgLT5cbiAgICAgICAgICBzZXRcbiAgICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAgIHxhcHBsZVxuICAgICAgICAgICAgQmVlZlxuICAgICAgICAgICAgQVBQTEVcbiAgICAgICAgICAgIERPR1xuICAgICAgICAgICAgYmVlZlxuICAgICAgICAgICAgQXBwbGVcbiAgICAgICAgICAgIEJFRUZcbiAgICAgICAgICAgIERvZ1xuICAgICAgICAgICAgZG9nXFxuXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICAgIGVuc3VyZSBcImcgcyBHXCIsXG4gICAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIGFwcGxlXG4gICAgICAgICAgICBBcHBsZVxuICAgICAgICAgICAgQVBQTEVcbiAgICAgICAgICAgIGJlZWZcbiAgICAgICAgICAgIEJlZWZcbiAgICAgICAgICAgIEJFRUZcbiAgICAgICAgICAgIGRvZ1xuICAgICAgICAgICAgRG9nXG4gICAgICAgICAgICBET0dcXG5cbiAgICAgICAgICAgIFwiXCJcIlxuIl19
