(function() {
  var TextData, dispatch, getVimState, ref, settings;

  ref = require('./spec-helper'), getVimState = ref.getVimState, dispatch = ref.dispatch, TextData = ref.TextData;

  settings = require('../lib/settings');

  describe("TextObject", function() {
    var editor, editorElement, ensure, getCheckFunctionFor, keystroke, ref1, set, vimState;
    ref1 = [], set = ref1[0], ensure = ref1[1], keystroke = ref1[2], editor = ref1[3], editorElement = ref1[4], vimState = ref1[5];
    getCheckFunctionFor = function(textObject) {
      return function(initialPoint, keystroke, options) {
        set({
          cursor: initialPoint
        });
        return ensure(keystroke + " " + textObject, options);
      };
    };
    beforeEach(function() {
      return getVimState(function(state, vimEditor) {
        vimState = state;
        editor = vimState.editor, editorElement = vimState.editorElement;
        return set = vimEditor.set, ensure = vimEditor.ensure, keystroke = vimEditor.keystroke, vimEditor;
      });
    });
    describe("TextObject", function() {
      beforeEach(function() {
        waitsForPromise(function() {
          return atom.packages.activatePackage('language-coffee-script');
        });
        return getVimState('sample.coffee', function(state, vimEditor) {
          editor = state.editor, editorElement = state.editorElement;
          return set = vimEditor.set, ensure = vimEditor.ensure, keystroke = vimEditor.keystroke, vimEditor;
        });
      });
      afterEach(function() {
        return atom.packages.deactivatePackage('language-coffee-script');
      });
      return describe("when TextObject is excuted directly", function() {
        return it("select that TextObject", function() {
          set({
            cursor: [8, 7]
          });
          dispatch(editorElement, 'vim-mode-plus:inner-word');
          return ensure({
            selectedText: 'QuickSort'
          });
        });
      });
    });
    describe("Word", function() {
      describe("inner-word", function() {
        beforeEach(function() {
          return set({
            text: "12345 abcde ABCDE",
            cursor: [0, 9]
          });
        });
        it("applies operators inside the current word in operator-pending mode", function() {
          return ensure('d i w', {
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
        it("selects inside the current word in visual mode", function() {
          return ensure('v i w', {
            selectedScreenRange: [[0, 6], [0, 11]]
          });
        });
        it("works with multiple cursors", function() {
          set({
            addCursor: [0, 1]
          });
          return ensure('v i w', {
            selectedBufferRange: [[[0, 6], [0, 11]], [[0, 0], [0, 5]]]
          });
        });
        describe("cursor is on next to NonWordCharacter", function() {
          beforeEach(function() {
            return set({
              text: "abc(def)",
              cursor: [0, 4]
            });
          });
          it("change inside word", function() {
            return ensure('c i w', {
              text: "abc()",
              mode: "insert"
            });
          });
          return it("delete inside word", function() {
            return ensure('d i w', {
              text: "abc()",
              mode: "normal"
            });
          });
        });
        return describe("cursor's next char is NonWordCharacter", function() {
          beforeEach(function() {
            return set({
              text: "abc(def)",
              cursor: [0, 6]
            });
          });
          it("change inside word", function() {
            return ensure('c i w', {
              text: "abc()",
              mode: "insert"
            });
          });
          return it("delete inside word", function() {
            return ensure('d i w', {
              text: "abc()",
              mode: "normal"
            });
          });
        });
      });
      return describe("a-word", function() {
        beforeEach(function() {
          return set({
            text: "12345 abcde ABCDE",
            cursor: [0, 9]
          });
        });
        it("select current-word and trailing white space", function() {
          return ensure('d a w', {
            text: "12345 ABCDE",
            cursor: [0, 6],
            register: {
              '"': {
                text: "abcde "
              }
            }
          });
        });
        it("select current-word and leading white space in case trailing white space wasn't there", function() {
          set({
            cursor: [0, 15]
          });
          return ensure('d a w', {
            text: "12345 abcde",
            cursor: [0, 10],
            register: {
              '"': {
                text: " ABCDE"
              }
            }
          });
        });
        it("selects from the start of the current word to the start of the next word in visual mode", function() {
          return ensure('v a w', {
            selectedScreenRange: [[0, 6], [0, 12]]
          });
        });
        it("doesn't span newlines", function() {
          set({
            text: "12345\nabcde ABCDE",
            cursor: [0, 3]
          });
          return ensure('v a w', {
            selectedBufferRange: [[0, 0], [0, 5]]
          });
        });
        return it("doesn't span special characters", function() {
          set({
            text: "1(345\nabcde ABCDE",
            cursor: [0, 3]
          });
          return ensure('v a w', {
            selectedBufferRange: [[0, 2], [0, 5]]
          });
        });
      });
    });
    describe("WholeWord", function() {
      describe("inner-whole-word", function() {
        beforeEach(function() {
          return set({
            text: "12(45 ab'de ABCDE",
            cursor: [0, 9]
          });
        });
        it("applies operators inside the current whole word in operator-pending mode", function() {
          return ensure('d i W', {
            text: "12(45  ABCDE",
            cursor: [0, 6],
            register: {
              '"': {
                text: "ab'de"
              }
            }
          });
        });
        return it("selects inside the current whole word in visual mode", function() {
          return ensure('v i W', {
            selectedScreenRange: [[0, 6], [0, 11]]
          });
        });
      });
      return describe("a-whole-word", function() {
        beforeEach(function() {
          return set({
            text: "12(45 ab'de ABCDE",
            cursor: [0, 9]
          });
        });
        it("select whole-word and trailing white space", function() {
          return ensure('d a W', {
            text: "12(45 ABCDE",
            cursor: [0, 6],
            register: {
              '"': {
                text: "ab'de "
              }
            },
            mode: 'normal'
          });
        });
        it("select whole-word and leading white space in case trailing white space wasn't there", function() {
          set({
            cursor: [0, 15]
          });
          return ensure('d a w', {
            text: "12(45 ab'de",
            cursor: [0, 10],
            register: {
              '"': {
                text: " ABCDE"
              }
            }
          });
        });
        it("selects from the start of the current whole word to the start of the next whole word in visual mode", function() {
          return ensure('v a W', {
            selectedScreenRange: [[0, 6], [0, 12]]
          });
        });
        return it("doesn't span newlines", function() {
          set({
            text: "12(45\nab'de ABCDE",
            cursor: [0, 4]
          });
          return ensure('v a W', {
            selectedBufferRange: [[0, 0], [0, 5]]
          });
        });
      });
    });
    describe("Subword", function() {
      var escape;
      escape = function() {
        return keystroke('escape');
      };
      beforeEach(function() {
        return atom.keymaps.add("test", {
          'atom-text-editor.vim-mode-plus.operator-pending-mode, atom-text-editor.vim-mode-plus.visual-mode': {
            'a q': 'vim-mode-plus:a-subword',
            'i q': 'vim-mode-plus:inner-subword'
          }
        });
      });
      describe("inner-subword", function() {
        return it("select subword", function() {
          set({
            textC: "cam|elCase"
          });
          ensure("v i q", {
            selectedText: "camel"
          });
          escape();
          set({
            textC: "came|lCase"
          });
          ensure("v i q", {
            selectedText: "camel"
          });
          escape();
          set({
            textC: "camel|Case"
          });
          ensure("v i q", {
            selectedText: "Case"
          });
          escape();
          set({
            textC: "camelCas|e"
          });
          ensure("v i q", {
            selectedText: "Case"
          });
          escape();
          set({
            textC: "|_snake__case_"
          });
          ensure("v i q", {
            selectedText: "_snake"
          });
          escape();
          set({
            textC: "_snak|e__case_"
          });
          ensure("v i q", {
            selectedText: "_snake"
          });
          escape();
          set({
            textC: "_snake|__case_"
          });
          ensure("v i q", {
            selectedText: "__case"
          });
          escape();
          set({
            textC: "_snake_|_case_"
          });
          ensure("v i q", {
            selectedText: "__case"
          });
          escape();
          set({
            textC: "_snake__cas|e_"
          });
          ensure("v i q", {
            selectedText: "__case"
          });
          escape();
          set({
            textC: "_snake__case|_"
          });
          ensure("v i q", {
            selectedText: "_"
          });
          return escape();
        });
      });
      return describe("a-subword", function() {
        return it("select subword and spaces", function() {
          set({
            textC: "camelCa|se  NextCamel"
          });
          ensure("v a q", {
            selectedText: "Case  "
          });
          escape();
          set({
            textC: "camelCase  Ne|xtCamel"
          });
          ensure("v a q", {
            selectedText: "  Next"
          });
          escape();
          set({
            textC: "snake_c|ase  next_snake"
          });
          ensure("v a q", {
            selectedText: "_case  "
          });
          escape();
          set({
            textC: "snake_case  ne|xt_snake"
          });
          ensure("v a q", {
            selectedText: "  next"
          });
          return escape();
        });
      });
    });
    describe("AnyPair", function() {
      var complexText, ref2, simpleText;
      ref2 = {}, simpleText = ref2.simpleText, complexText = ref2.complexText;
      beforeEach(function() {
        simpleText = ".... \"abc\" ....\n.... 'abc' ....\n.... `abc` ....\n.... {abc} ....\n.... <abc> ....\n.... [abc] ....\n.... (abc) ....";
        complexText = "[4s\n--{3s\n----\"2s(1s-1e)2e\"\n---3e}-4e\n]";
        return set({
          text: simpleText,
          cursor: [0, 7]
        });
      });
      describe("inner-any-pair", function() {
        it("applies operators any inner-pair and repeatable", function() {
          ensure('d i s', {
            text: ".... \"\" ....\n.... 'abc' ....\n.... `abc` ....\n.... {abc} ....\n.... <abc> ....\n.... [abc] ....\n.... (abc) ...."
          });
          return ensure('j . j . j . j . j . j . j .', {
            text: ".... \"\" ....\n.... '' ....\n.... `` ....\n.... {} ....\n.... <> ....\n.... [] ....\n.... () ...."
          });
        });
        return it("can expand selection", function() {
          set({
            text: complexText,
            cursor: [2, 8]
          });
          keystroke('v');
          ensure('i s', {
            selectedText: "1s-1e"
          });
          ensure('i s', {
            selectedText: "2s(1s-1e)2e"
          });
          ensure('i s', {
            selectedText: "3s\n----\"2s(1s-1e)2e\"\n---3e"
          });
          return ensure('i s', {
            selectedText: "4s\n--{3s\n----\"2s(1s-1e)2e\"\n---3e}-4e"
          });
        });
      });
      return describe("a-any-pair", function() {
        it("applies operators any a-pair and repeatable", function() {
          ensure('d a s', {
            text: "....  ....\n.... 'abc' ....\n.... `abc` ....\n.... {abc} ....\n.... <abc> ....\n.... [abc] ....\n.... (abc) ...."
          });
          return ensure('j . j . j . j . j . j . j .', {
            text: "....  ....\n....  ....\n....  ....\n....  ....\n....  ....\n....  ....\n....  ...."
          });
        });
        return it("can expand selection", function() {
          set({
            text: complexText,
            cursor: [2, 8]
          });
          keystroke('v');
          ensure('a s', {
            selectedText: "(1s-1e)"
          });
          ensure('a s', {
            selectedText: "\"2s(1s-1e)2e\""
          });
          ensure('a s', {
            selectedText: "{3s\n----\"2s(1s-1e)2e\"\n---3e}"
          });
          return ensure('a s', {
            selectedText: "[4s\n--{3s\n----\"2s(1s-1e)2e\"\n---3e}-4e\n]"
          });
        });
      });
    });
    describe("AnyQuote", function() {
      beforeEach(function() {
        return set({
          text: "--\"abc\" `def`  'efg'--",
          cursor: [0, 0]
        });
      });
      describe("inner-any-quote", function() {
        it("applies operators any inner-pair and repeatable", function() {
          ensure('d i q', {
            text: "--\"\" `def`  'efg'--"
          });
          ensure('.', {
            text: "--\"\" ``  'efg'--"
          });
          return ensure('.', {
            text: "--\"\" ``  ''--"
          });
        });
        return it("can select next quote", function() {
          keystroke('v');
          ensure('i q', {
            selectedText: 'abc'
          });
          ensure('i q', {
            selectedText: 'def'
          });
          return ensure('i q', {
            selectedText: 'efg'
          });
        });
      });
      return describe("a-any-quote", function() {
        it("applies operators any a-quote and repeatable", function() {
          ensure('d a q', {
            text: "-- `def`  'efg'--"
          });
          ensure('.', {
            text: "--   'efg'--"
          });
          return ensure('.', {
            text: "--   --"
          });
        });
        return it("can select next quote", function() {
          keystroke('v');
          ensure('a q', {
            selectedText: '"abc"'
          });
          ensure('a q', {
            selectedText: '`def`'
          });
          return ensure('a q', {
            selectedText: "'efg'"
          });
        });
      });
    });
    describe("DoubleQuote", function() {
      describe("issue-635 new behavior of inner-double-quote", function() {
        beforeEach(function() {
          return atom.keymaps.add("test", {
            'atom-text-editor.vim-mode-plus:not(.insert-mode)': {
              'g r': 'vim-mode-plus:replace'
            }
          });
        });
        describe("quote is un-balanced", function() {
          it("case1", function() {
            set({
              textC_: '_|_"____"____"'
            });
            return ensure('g r i " +', {
              textC_: '__"|++++"____"'
            });
          });
          it("case2", function() {
            set({
              textC_: '__"__|__"____"'
            });
            return ensure('g r i " +', {
              textC_: '__"|++++"____"'
            });
          });
          it("case3", function() {
            set({
              textC_: '__"____"__|__"'
            });
            return ensure('g r i " +', {
              textC_: '__"____"|++++"'
            });
          });
          it("case4", function() {
            set({
              textC_: '__|"____"____"'
            });
            return ensure('g r i " +', {
              textC_: '__"|++++"____"'
            });
          });
          it("case5", function() {
            set({
              textC_: '__"____|"____"'
            });
            return ensure('g r i " +', {
              textC_: '__"|++++"____"'
            });
          });
          return it("case6", function() {
            set({
              textC_: '__"____"____|"'
            });
            return ensure('g r i " +', {
              textC_: '__"____"|++++"'
            });
          });
        });
        return describe("quote is balanced", function() {
          it("case1", function() {
            set({
              textC_: '_|_"===="____"==="'
            });
            return ensure('g r i " +', {
              textC_: '__"|++++"____"==="'
            });
          });
          it("case2", function() {
            set({
              textC_: '__"==|=="____"==="'
            });
            return ensure('g r i " +', {
              textC_: '__"|++++"____"==="'
            });
          });
          it("case3", function() {
            set({
              textC_: '__"===="__|__"==="'
            });
            return ensure('g r i " +', {
              textC_: '__"===="|++++"==="'
            });
          });
          it("case4", function() {
            set({
              textC_: '__"===="____"=|=="'
            });
            return ensure('g r i " +', {
              textC_: '__"===="____"|+++"'
            });
          });
          it("case5", function() {
            set({
              textC_: '__|"===="____"==="'
            });
            return ensure('g r i " +', {
              textC_: '__"|++++"____"==="'
            });
          });
          it("case6", function() {
            set({
              textC_: '__"====|"____"==="'
            });
            return ensure('g r i " +', {
              textC_: '__"|++++"____"==="'
            });
          });
          return it("case7", function() {
            set({
              textC_: '__"===="____|"==="'
            });
            return ensure('g r i " +', {
              textC_: '__"===="____"|+++"'
            });
          });
        });
      });
      describe("inner-double-quote", function() {
        beforeEach(function() {
          return set({
            text: '" something in here and in "here" " and over here',
            cursor: [0, 9]
          });
        });
        it("applies operators inside the current string in operator-pending mode", function() {
          return ensure('d i "', {
            text: '""here" " and over here',
            cursor: [0, 1]
          });
        });
        it("applies operators inside the current string in operator-pending mode", function() {
          set({
            cursor: [0, 29]
          });
          return ensure('d i "', {
            text: '" something in here and in "" " and over here',
            cursor: [0, 28]
          });
        });
        it("makes no change if past the last string on a line", function() {
          set({
            cursor: [0, 39]
          });
          return ensure('d i "', {
            text: '" something in here and in "here" " and over here',
            cursor: [0, 39]
          });
        });
        return describe("cursor is on the pair char", function() {
          var check, close, open, selectedText, text, textFinal;
          check = getCheckFunctionFor('i "');
          text = '-"+"-';
          textFinal = '-""-';
          selectedText = '+';
          open = [0, 1];
          close = [0, 3];
          beforeEach(function() {
            return set({
              text: text
            });
          });
          it("case-1 normal", function() {
            return check(open, 'd', {
              text: textFinal,
              cursor: [0, 2]
            });
          });
          it("case-2 normal", function() {
            return check(close, 'd', {
              text: textFinal,
              cursor: [0, 2]
            });
          });
          it("case-3 visual", function() {
            return check(open, 'v', {
              selectedText: selectedText
            });
          });
          return it("case-4 visual", function() {
            return check(close, 'v', {
              selectedText: selectedText
            });
          });
        });
      });
      return describe("a-double-quote", function() {
        var originalText;
        originalText = '" something in here and in "here" "';
        beforeEach(function() {
          return set({
            text: originalText,
            cursor: [0, 9]
          });
        });
        it("applies operators around the current double quotes in operator-pending mode", function() {
          return ensure('d a "', {
            text: 'here" "',
            cursor: [0, 0],
            mode: 'normal'
          });
        });
        it("delete a-double-quote", function() {
          set({
            cursor: [0, 29]
          });
          return ensure('d a "', {
            text: '" something in here and in  "',
            cursor: [0, 27],
            mode: 'normal'
          });
        });
        return describe("cursor is on the pair char", function() {
          var check, close, open, selectedText, text, textFinal;
          check = getCheckFunctionFor('a "');
          text = '-"+"-';
          textFinal = '--';
          selectedText = '"+"';
          open = [0, 1];
          close = [0, 3];
          beforeEach(function() {
            return set({
              text: text
            });
          });
          it("case-1 normal", function() {
            return check(open, 'd', {
              text: textFinal,
              cursor: [0, 1]
            });
          });
          it("case-2 normal", function() {
            return check(close, 'd', {
              text: textFinal,
              cursor: [0, 1]
            });
          });
          it("case-3 visual", function() {
            return check(open, 'v', {
              selectedText: selectedText
            });
          });
          return it("case-4 visual", function() {
            return check(close, 'v', {
              selectedText: selectedText
            });
          });
        });
      });
    });
    describe("SingleQuote", function() {
      describe("inner-single-quote", function() {
        beforeEach(function() {
          return set({
            text: "' something in here and in 'here' ' and over here",
            cursor: [0, 9]
          });
        });
        describe("don't treat literal backslash(double backslash) as escape char", function() {
          beforeEach(function() {
            return set({
              text: "'some-key-here\\\\': 'here-is-the-val'"
            });
          });
          it("case-1", function() {
            set({
              cursor: [0, 2]
            });
            return ensure("d i '", {
              text: "'': 'here-is-the-val'",
              cursor: [0, 1]
            });
          });
          return it("case-2", function() {
            set({
              cursor: [0, 19]
            });
            return ensure("d i '", {
              text: "'some-key-here\\\\': ''",
              cursor: [0, 20]
            });
          });
        });
        describe("treat backslash(single backslash) as escape char", function() {
          beforeEach(function() {
            return set({
              text: "'some-key-here\\'': 'here-is-the-val'"
            });
          });
          it("case-1", function() {
            set({
              cursor: [0, 2]
            });
            return ensure("d i '", {
              text: "'': 'here-is-the-val'",
              cursor: [0, 1]
            });
          });
          return it("case-2", function() {
            set({
              cursor: [0, 17]
            });
            return ensure("d i '", {
              text: "'some-key-here\\'''here-is-the-val'",
              cursor: [0, 17]
            });
          });
        });
        it("applies operators inside the current string in operator-pending mode", function() {
          return ensure("d i '", {
            text: "''here' ' and over here",
            cursor: [0, 1]
          });
        });
        it("applies operators inside the next string in operator-pending mode (if not in a string)", function() {
          set({
            cursor: [0, 26]
          });
          return ensure("d i '", {
            text: "''here' ' and over here",
            cursor: [0, 1]
          });
        });
        it("makes no change if past the last string on a line", function() {
          set({
            cursor: [0, 39]
          });
          return ensure("d i '", {
            text: "' something in here and in 'here' ' and over here",
            cursor: [0, 39]
          });
        });
        return describe("cursor is on the pair char", function() {
          var check, close, open, selectedText, text, textFinal;
          check = getCheckFunctionFor("i '");
          text = "-'+'-";
          textFinal = "-''-";
          selectedText = '+';
          open = [0, 1];
          close = [0, 3];
          beforeEach(function() {
            return set({
              text: text
            });
          });
          it("case-1 normal", function() {
            return check(open, 'd', {
              text: textFinal,
              cursor: [0, 2]
            });
          });
          it("case-2 normal", function() {
            return check(close, 'd', {
              text: textFinal,
              cursor: [0, 2]
            });
          });
          it("case-3 visual", function() {
            return check(open, 'v', {
              selectedText: selectedText
            });
          });
          return it("case-4 visual", function() {
            return check(close, 'v', {
              selectedText: selectedText
            });
          });
        });
      });
      return describe("a-single-quote", function() {
        var originalText;
        originalText = "' something in here and in 'here' '";
        beforeEach(function() {
          return set({
            text: originalText,
            cursor: [0, 9]
          });
        });
        it("applies operators around the current single quotes in operator-pending mode", function() {
          return ensure("d a '", {
            text: "here' '",
            cursor: [0, 0],
            mode: 'normal'
          });
        });
        it("applies operators inside the next string in operator-pending mode (if not in a string)", function() {
          set({
            cursor: [0, 29]
          });
          return ensure("d a '", {
            text: "' something in here and in  '",
            cursor: [0, 27],
            mode: 'normal'
          });
        });
        return describe("cursor is on the pair char", function() {
          var check, close, open, selectedText, text, textFinal;
          check = getCheckFunctionFor("a '");
          text = "-'+'-";
          textFinal = "--";
          selectedText = "'+'";
          open = [0, 1];
          close = [0, 3];
          beforeEach(function() {
            return set({
              text: text
            });
          });
          it("case-1 normal", function() {
            return check(open, 'd', {
              text: textFinal,
              cursor: [0, 1]
            });
          });
          it("case-2 normal", function() {
            return check(close, 'd', {
              text: textFinal,
              cursor: [0, 1]
            });
          });
          it("case-3 visual", function() {
            return check(open, 'v', {
              selectedText: selectedText
            });
          });
          return it("case-4 visual", function() {
            return check(close, 'v', {
              selectedText: selectedText
            });
          });
        });
      });
    });
    describe("BackTick", function() {
      var originalText;
      originalText = "this is `sample` text.";
      beforeEach(function() {
        return set({
          text: originalText,
          cursor: [0, 9]
        });
      });
      describe("inner-back-tick", function() {
        it("applies operators inner-area", function() {
          return ensure("d i `", {
            text: "this is `` text.",
            cursor: [0, 9]
          });
        });
        it("do nothing when pair range is not under cursor", function() {
          set({
            cursor: [0, 16]
          });
          return ensure("d i `", {
            text: originalText,
            cursor: [0, 16]
          });
        });
        return describe("cursor is on the pair char", function() {
          var check, close, open, selectedText, text, textFinal;
          check = getCheckFunctionFor('i `');
          text = '-`+`-';
          textFinal = '-``-';
          selectedText = '+';
          open = [0, 1];
          close = [0, 3];
          beforeEach(function() {
            return set({
              text: text
            });
          });
          it("case-1 normal", function() {
            return check(open, 'd', {
              text: textFinal,
              cursor: [0, 2]
            });
          });
          it("case-2 normal", function() {
            return check(close, 'd', {
              text: textFinal,
              cursor: [0, 2]
            });
          });
          it("case-3 visual", function() {
            return check(open, 'v', {
              selectedText: selectedText
            });
          });
          return it("case-4 visual", function() {
            return check(close, 'v', {
              selectedText: selectedText
            });
          });
        });
      });
      return describe("a-back-tick", function() {
        it("applies operators inner-area", function() {
          return ensure("d a `", {
            text: "this is  text.",
            cursor: [0, 8]
          });
        });
        it("do nothing when pair range is not under cursor", function() {
          set({
            cursor: [0, 16]
          });
          return ensure("d a `", {
            text: originalText,
            cursor: [0, 16]
          });
        });
        return describe("cursor is on the pair char", function() {
          var check, close, open, selectedText, text, textFinal;
          check = getCheckFunctionFor("a `");
          text = "-`+`-";
          textFinal = "--";
          selectedText = "`+`";
          open = [0, 1];
          close = [0, 3];
          beforeEach(function() {
            return set({
              text: text
            });
          });
          it("case-1 normal", function() {
            return check(open, 'd', {
              text: textFinal,
              cursor: [0, 1]
            });
          });
          it("case-2 normal", function() {
            return check(close, 'd', {
              text: textFinal,
              cursor: [0, 1]
            });
          });
          it("case-3 visual", function() {
            return check(open, 'v', {
              selectedText: selectedText
            });
          });
          return it("case-4 visual", function() {
            return check(close, 'v', {
              selectedText: selectedText
            });
          });
        });
      });
    });
    describe("CurlyBracket", function() {
      describe("scope awareness of bracket", function() {
        it("[search from outside of double-quote] skips bracket in within-line-balanced-double-quotes", function() {
          set({
            textC: "{ | \"hello {\" }"
          });
          return ensure("v a {", {
            selectedText: "{  \"hello {\" }"
          });
        });
        it("Not ignore bracket in within-line-not-balanced-double-quotes", function() {
          set({
            textC: "{  \"hello {\" | '\"' }"
          });
          return ensure("v a {", {
            selectedText: "{\"  '\"' }"
          });
        });
        it("[search from inside of double-quote] skips bracket in within-line-balanced-double-quotes", function() {
          set({
            textC: "{  \"h|ello {\" }"
          });
          return ensure("v a {", {
            selectedText: "{  \"hello {\" }"
          });
        });
        return beforeEach(function() {
          return set({
            textC_: ""
          });
        });
      });
      describe("inner-curly-bracket", function() {
        beforeEach(function() {
          return set({
            text: "{ something in here and in {here} }",
            cursor: [0, 9]
          });
        });
        it("applies operators to inner-area in operator-pending mode", function() {
          return ensure('d i {', {
            text: "{}",
            cursor: [0, 1]
          });
        });
        it("applies operators to inner-area in operator-pending mode (second test)", function() {
          set({
            cursor: [0, 29]
          });
          return ensure('d i {', {
            text: "{ something in here and in {} }",
            cursor: [0, 28]
          });
        });
        describe("cursor is on the pair char", function() {
          var check, close, open, selectedText, text, textFinal;
          check = getCheckFunctionFor('i {');
          text = '-{+}-';
          textFinal = '-{}-';
          selectedText = '+';
          open = [0, 1];
          close = [0, 3];
          beforeEach(function() {
            return set({
              text: text
            });
          });
          it("case-1 normal", function() {
            return check(open, 'd', {
              text: textFinal,
              cursor: [0, 2]
            });
          });
          it("case-2 normal", function() {
            return check(close, 'd', {
              text: textFinal,
              cursor: [0, 2]
            });
          });
          it("case-3 visual", function() {
            return check(open, 'v', {
              selectedText: selectedText
            });
          });
          return it("case-4 visual", function() {
            return check(close, 'v', {
              selectedText: selectedText
            });
          });
        });
        return describe("change mode to characterwise", function() {
          var textSelected;
          textSelected = "__1,\n__2,\n__3".replace(/_/g, ' ');
          beforeEach(function() {
            set({
              textC: "{\n  |1,\n  2,\n  3\n}"
            });
            return ensure({
              mode: 'normal'
            });
          });
          it("from vC, final-mode is 'characterwise'", function() {
            ensure('v', {
              selectedText: ['1'],
              mode: ['visual', 'characterwise']
            });
            return ensure('i B', {
              selectedText: textSelected,
              mode: ['visual', 'characterwise']
            });
          });
          it("from vL, final-mode is 'characterwise'", function() {
            ensure('V', {
              selectedText: ["  1,\n"],
              mode: ['visual', 'linewise']
            });
            return ensure('i B', {
              selectedText: textSelected,
              mode: ['visual', 'characterwise']
            });
          });
          it("from vB, final-mode is 'characterwise'", function() {
            ensure('ctrl-v', {
              selectedText: ["1"],
              mode: ['visual', 'blockwise']
            });
            return ensure('i B', {
              selectedText: textSelected,
              mode: ['visual', 'characterwise']
            });
          });
          return describe("as operator target", function() {
            it("change inner-pair", function() {
              return ensure("c i B", {
                textC: "{\n|\n}",
                mode: 'insert'
              });
            });
            return it("delete inner-pair", function() {
              return ensure("d i B", {
                textC: "{\n|}",
                mode: 'normal'
              });
            });
          });
        });
      });
      return describe("a-curly-bracket", function() {
        beforeEach(function() {
          return set({
            text: "{ something in here and in {here} }",
            cursor: [0, 9]
          });
        });
        it("applies operators to a-area in operator-pending mode", function() {
          return ensure('d a {', {
            text: '',
            cursor: [0, 0],
            mode: 'normal'
          });
        });
        it("applies operators to a-area in operator-pending mode (second test)", function() {
          set({
            cursor: [0, 29]
          });
          return ensure('d a {', {
            text: "{ something in here and in  }",
            cursor: [0, 27],
            mode: 'normal'
          });
        });
        describe("cursor is on the pair char", function() {
          var check, close, open, selectedText, text, textFinal;
          check = getCheckFunctionFor("a {");
          text = "-{+}-";
          textFinal = "--";
          selectedText = "{+}";
          open = [0, 1];
          close = [0, 3];
          beforeEach(function() {
            return set({
              text: text
            });
          });
          it("case-1 normal", function() {
            return check(open, 'd', {
              text: textFinal,
              cursor: [0, 1]
            });
          });
          it("case-2 normal", function() {
            return check(close, 'd', {
              text: textFinal,
              cursor: [0, 1]
            });
          });
          it("case-3 visual", function() {
            return check(open, 'v', {
              selectedText: selectedText
            });
          });
          return it("case-4 visual", function() {
            return check(close, 'v', {
              selectedText: selectedText
            });
          });
        });
        return describe("change mode to characterwise", function() {
          var textSelected;
          textSelected = "{\n  1,\n  2,\n  3\n}";
          beforeEach(function() {
            set({
              textC: "{\n  |1,\n  2,\n  3\n}\n\nhello"
            });
            return ensure({
              mode: 'normal'
            });
          });
          it("from vC, final-mode is 'characterwise'", function() {
            ensure('v', {
              selectedText: ['1'],
              mode: ['visual', 'characterwise']
            });
            return ensure('a B', {
              selectedText: textSelected,
              mode: ['visual', 'characterwise']
            });
          });
          it("from vL, final-mode is 'characterwise'", function() {
            ensure('V', {
              selectedText: ["  1,\n"],
              mode: ['visual', 'linewise']
            });
            return ensure('a B', {
              selectedText: textSelected,
              mode: ['visual', 'characterwise']
            });
          });
          it("from vB, final-mode is 'characterwise'", function() {
            ensure('ctrl-v', {
              selectedText: ["1"],
              mode: ['visual', 'blockwise']
            });
            return ensure('a B', {
              selectedText: textSelected,
              mode: ['visual', 'characterwise']
            });
          });
          return describe("as operator target", function() {
            it("change inner-pair", function() {
              return ensure("c a B", {
                textC: "|\n\nhello",
                mode: 'insert'
              });
            });
            return it("delete inner-pair", function() {
              return ensure("d a B", {
                textC: "|\n\nhello",
                mode: 'normal'
              });
            });
          });
        });
      });
    });
    describe("AngleBracket", function() {
      describe("inner-angle-bracket", function() {
        beforeEach(function() {
          return set({
            text: "< something in here and in <here> >",
            cursor: [0, 9]
          });
        });
        it("applies operators inside the current word in operator-pending mode", function() {
          return ensure('d i <', {
            text: "<>",
            cursor: [0, 1]
          });
        });
        it("applies operators inside the current word in operator-pending mode (second test)", function() {
          set({
            cursor: [0, 29]
          });
          return ensure('d i <', {
            text: "< something in here and in <> >",
            cursor: [0, 28]
          });
        });
        return describe("cursor is on the pair char", function() {
          var check, close, open, selectedText, text, textFinal;
          check = getCheckFunctionFor('i <');
          text = '-<+>-';
          textFinal = '-<>-';
          selectedText = '+';
          open = [0, 1];
          close = [0, 3];
          beforeEach(function() {
            return set({
              text: text
            });
          });
          it("case-1 normal", function() {
            return check(open, 'd', {
              text: textFinal,
              cursor: [0, 2]
            });
          });
          it("case-2 normal", function() {
            return check(close, 'd', {
              text: textFinal,
              cursor: [0, 2]
            });
          });
          it("case-3 visual", function() {
            return check(open, 'v', {
              selectedText: selectedText
            });
          });
          return it("case-4 visual", function() {
            return check(close, 'v', {
              selectedText: selectedText
            });
          });
        });
      });
      return describe("a-angle-bracket", function() {
        beforeEach(function() {
          return set({
            text: "< something in here and in <here> >",
            cursor: [0, 9]
          });
        });
        it("applies operators around the current angle brackets in operator-pending mode", function() {
          return ensure('d a <', {
            text: '',
            cursor: [0, 0],
            mode: 'normal'
          });
        });
        it("applies operators around the current angle brackets in operator-pending mode (second test)", function() {
          set({
            cursor: [0, 29]
          });
          return ensure('d a <', {
            text: "< something in here and in  >",
            cursor: [0, 27],
            mode: 'normal'
          });
        });
        return describe("cursor is on the pair char", function() {
          var check, close, open, selectedText, text, textFinal;
          check = getCheckFunctionFor("a <");
          text = "-<+>-";
          textFinal = "--";
          selectedText = "<+>";
          open = [0, 1];
          close = [0, 3];
          beforeEach(function() {
            return set({
              text: text
            });
          });
          it("case-1 normal", function() {
            return check(open, 'd', {
              text: textFinal,
              cursor: [0, 1]
            });
          });
          it("case-2 normal", function() {
            return check(close, 'd', {
              text: textFinal,
              cursor: [0, 1]
            });
          });
          it("case-3 visual", function() {
            return check(open, 'v', {
              selectedText: selectedText
            });
          });
          return it("case-4 visual", function() {
            return check(close, 'v', {
              selectedText: selectedText
            });
          });
        });
      });
    });
    describe("AllowForwarding family", function() {
      beforeEach(function() {
        atom.keymaps.add("test", {
          'atom-text-editor.vim-mode-plus.operator-pending-mode, atom-text-editor.vim-mode-plus.visual-mode': {
            'i }': 'vim-mode-plus:inner-curly-bracket-allow-forwarding',
            'i >': 'vim-mode-plus:inner-angle-bracket-allow-forwarding',
            'i ]': 'vim-mode-plus:inner-square-bracket-allow-forwarding',
            'i )': 'vim-mode-plus:inner-parenthesis-allow-forwarding',
            'a }': 'vim-mode-plus:a-curly-bracket-allow-forwarding',
            'a >': 'vim-mode-plus:a-angle-bracket-allow-forwarding',
            'a ]': 'vim-mode-plus:a-square-bracket-allow-forwarding',
            'a )': 'vim-mode-plus:a-parenthesis-allow-forwarding'
          }
        });
        return set({
          text: "__{000}__\n__<111>__\n__[222]__\n__(333)__"
        });
      });
      describe("inner", function() {
        return it("select forwarding range", function() {
          set({
            cursor: [0, 0]
          });
          ensure('escape v i }', {
            selectedText: "000"
          });
          set({
            cursor: [1, 0]
          });
          ensure('escape v i >', {
            selectedText: "111"
          });
          set({
            cursor: [2, 0]
          });
          ensure('escape v i ]', {
            selectedText: "222"
          });
          set({
            cursor: [3, 0]
          });
          return ensure('escape v i )', {
            selectedText: "333"
          });
        });
      });
      describe("a", function() {
        return it("select forwarding range", function() {
          set({
            cursor: [0, 0]
          });
          ensure('escape v a }', {
            selectedText: "{000}"
          });
          set({
            cursor: [1, 0]
          });
          ensure('escape v a >', {
            selectedText: "<111>"
          });
          set({
            cursor: [2, 0]
          });
          ensure('escape v a ]', {
            selectedText: "[222]"
          });
          set({
            cursor: [3, 0]
          });
          return ensure('escape v a )', {
            selectedText: "(333)"
          });
        });
      });
      return describe("multi line text", function() {
        var ref2, textOneA, textOneInner;
        ref2 = [], textOneInner = ref2[0], textOneA = ref2[1];
        beforeEach(function() {
          set({
            text: "000\n000{11\n111{22}\n111\n111}"
          });
          textOneInner = "11\n111{22}\n111\n111";
          return textOneA = "{11\n111{22}\n111\n111}";
        });
        describe("forwarding inner", function() {
          it("select forwarding range", function() {
            set({
              cursor: [1, 0]
            });
            return ensure("v i }", {
              selectedText: textOneInner
            });
          });
          it("select forwarding range", function() {
            set({
              cursor: [2, 0]
            });
            return ensure("v i }", {
              selectedText: "22"
            });
          });
          it("[case-1] no forwarding open pair, fail to find", function() {
            set({
              cursor: [0, 0]
            });
            return ensure("v i }", {
              selectedText: '0',
              cursor: [0, 1]
            });
          });
          it("[case-2] no forwarding open pair, select enclosed", function() {
            set({
              cursor: [1, 4]
            });
            return ensure("v i }", {
              selectedText: textOneInner
            });
          });
          it("[case-3] no forwarding open pair, select enclosed", function() {
            set({
              cursor: [3, 0]
            });
            return ensure("v i }", {
              selectedText: textOneInner
            });
          });
          return it("[case-3] no forwarding open pair, select enclosed", function() {
            set({
              cursor: [4, 0]
            });
            return ensure("v i }", {
              selectedText: textOneInner
            });
          });
        });
        return describe("forwarding a", function() {
          it("select forwarding range", function() {
            set({
              cursor: [1, 0]
            });
            return ensure("v a }", {
              selectedText: textOneA
            });
          });
          it("select forwarding range", function() {
            set({
              cursor: [2, 0]
            });
            return ensure("v a }", {
              selectedText: "{22}"
            });
          });
          it("[case-1] no forwarding open pair, fail to find", function() {
            set({
              cursor: [0, 0]
            });
            return ensure("v a }", {
              selectedText: '0',
              cursor: [0, 1]
            });
          });
          it("[case-2] no forwarding open pair, select enclosed", function() {
            set({
              cursor: [1, 4]
            });
            return ensure("v a }", {
              selectedText: textOneA
            });
          });
          it("[case-3] no forwarding open pair, select enclosed", function() {
            set({
              cursor: [3, 0]
            });
            return ensure("v a }", {
              selectedText: textOneA
            });
          });
          return it("[case-3] no forwarding open pair, select enclosed", function() {
            set({
              cursor: [4, 0]
            });
            return ensure("v a }", {
              selectedText: textOneA
            });
          });
        });
      });
    });
    describe("AnyPairAllowForwarding", function() {
      beforeEach(function() {
        atom.keymaps.add("text", {
          'atom-text-editor.vim-mode-plus.operator-pending-mode, atom-text-editor.vim-mode-plus.visual-mode': {
            ";": 'vim-mode-plus:inner-any-pair-allow-forwarding',
            ":": 'vim-mode-plus:a-any-pair-allow-forwarding'
          }
        });
        return set({
          text: "00\n00[11\n11\"222\"11{333}11(\n444()444\n)\n111]00{555}"
        });
      });
      describe("inner", function() {
        return it("select forwarding range within enclosed range(if exists)", function() {
          set({
            cursor: [2, 0]
          });
          keystroke('v');
          ensure(';', {
            selectedText: "222"
          });
          ensure(';', {
            selectedText: "333"
          });
          return ensure(';', {
            selectedText: "444()444"
          });
        });
      });
      return describe("a", function() {
        return it("select forwarding range within enclosed range(if exists)", function() {
          set({
            cursor: [2, 0]
          });
          keystroke('v');
          ensure(':', {
            selectedText: '"222"'
          });
          ensure(':', {
            selectedText: "{333}"
          });
          ensure(':', {
            selectedText: "(\n444()444\n)"
          });
          return ensure(':', {
            selectedText: "[11\n11\"222\"11{333}11(\n444()444\n)\n111]"
          });
        });
      });
    });
    describe("Tag", function() {
      var ensureSelectedText;
      ensureSelectedText = [][0];
      ensureSelectedText = function(start, keystroke, selectedText) {
        set({
          cursor: start
        });
        return ensure(keystroke, {
          selectedText: selectedText
        });
      };
      describe("inner-tag", function() {
        describe("precisely select inner", function() {
          var check, innerABC, selectedText, text, textAfterDeleted;
          check = getCheckFunctionFor('i t');
          text = "<abc>\n  <title>TITLE</title>\n</abc>";
          selectedText = "TITLE";
          innerABC = "\n  <title>TITLE</title>\n";
          textAfterDeleted = "<abc>\n  <title></title>\n</abc>";
          beforeEach(function() {
            return set({
              text: text
            });
          });
          it("[1] forwarding", function() {
            return check([1, 0], 'v', {
              selectedText: selectedText
            });
          });
          it("[2] openTag leftmost", function() {
            return check([1, 2], 'v', {
              selectedText: selectedText
            });
          });
          it("[3] openTag rightmost", function() {
            return check([1, 8], 'v', {
              selectedText: selectedText
            });
          });
          it("[4] Inner text", function() {
            return check([1, 10], 'v', {
              selectedText: selectedText
            });
          });
          it("[5] closeTag leftmost", function() {
            return check([1, 14], 'v', {
              selectedText: selectedText
            });
          });
          it("[6] closeTag rightmost", function() {
            return check([1, 21], 'v', {
              selectedText: selectedText
            });
          });
          it("[7] right of closeTag", function() {
            return check([2, 0], 'v', {
              selectedText: innerABC
            });
          });
          it("[8] forwarding", function() {
            return check([1, 0], 'd', {
              text: textAfterDeleted
            });
          });
          it("[9] openTag leftmost", function() {
            return check([1, 2], 'd', {
              text: textAfterDeleted
            });
          });
          it("[10] openTag rightmost", function() {
            return check([1, 8], 'd', {
              text: textAfterDeleted
            });
          });
          it("[11] Inner text", function() {
            return check([1, 10], 'd', {
              text: textAfterDeleted
            });
          });
          it("[12] closeTag leftmost", function() {
            return check([1, 14], 'd', {
              text: textAfterDeleted
            });
          });
          it("[13] closeTag rightmost", function() {
            return check([1, 21], 'd', {
              text: textAfterDeleted
            });
          });
          return it("[14] right of closeTag", function() {
            return check([2, 0], 'd', {
              text: "<abc></abc>"
            });
          });
        });
        describe("expansion and deletion", function() {
          beforeEach(function() {
            var htmlLikeText;
            htmlLikeText = "<DOCTYPE html>\n<html lang=\"en\">\n<head>\n__<meta charset=\"UTF-8\" />\n__<title>Document</title>\n</head>\n<body>\n__<div>\n____<div>\n|______<div>\n________<p><a>\n______</div>\n____</div>\n__</div>\n</body>\n</html>\n";
            return set({
              textC_: htmlLikeText
            });
          });
          it("can expand selection when repeated", function() {
            ensure('v i t', {
              selectedText_: "\n________<p><a>\n______"
            });
            ensure('i t', {
              selectedText_: "\n______<div>\n________<p><a>\n______</div>\n____"
            });
            ensure('i t', {
              selectedText_: "\n____<div>\n______<div>\n________<p><a>\n______</div>\n____</div>\n__"
            });
            ensure('i t', {
              selectedText_: "\n__<div>\n____<div>\n______<div>\n________<p><a>\n______</div>\n____</div>\n__</div>\n"
            });
            return ensure('i t', {
              selectedText_: "\n<head>\n__<meta charset=\"UTF-8\" />\n__<title>Document</title>\n</head>\n<body>\n__<div>\n____<div>\n______<div>\n________<p><a>\n______</div>\n____</div>\n__</div>\n</body>\n"
            });
          });
          return it('delete inner-tag and repatable', function() {
            set({
              cursor: [9, 0]
            });
            ensure("d i t", {
              text_: "<DOCTYPE html>\n<html lang=\"en\">\n<head>\n__<meta charset=\"UTF-8\" />\n__<title>Document</title>\n</head>\n<body>\n__<div>\n____<div>\n______<div></div>\n____</div>\n__</div>\n</body>\n</html>\n"
            });
            ensure("3 .", {
              text_: "<DOCTYPE html>\n<html lang=\"en\">\n<head>\n__<meta charset=\"UTF-8\" />\n__<title>Document</title>\n</head>\n<body></body>\n</html>\n"
            });
            return ensure(".", {
              text_: "<DOCTYPE html>\n<html lang=\"en\"></html>\n"
            });
          });
        });
        return describe("tag's IN-tag/Off-tag recognition", function() {
          describe("When tagStart's row contains NO NON-whitespaece till tagStart", function() {
            return it("[multi-line] select forwarding tag", function() {
              set({
                textC: "<span>\n  |  <span>inner</span>\n</span>"
              });
              return ensure("d i t", {
                text: "<span>\n    <span></span>\n</span>"
              });
            });
          });
          return describe("When tagStart's row contains SOME NON-whitespaece till tagStart", function() {
            it("[multi-line] select enclosing tag", function() {
              set({
                textC: "<span>\nhello | <span>inner</span>\n</span>"
              });
              return ensure("d i t", {
                text: "<span></span>"
              });
            });
            it("[one-line-1] select enclosing tag", function() {
              set({
                textC: "<span> | <span>inner</span></span>"
              });
              return ensure("d i t", {
                text: "<span></span>"
              });
            });
            return it("[one-line-2] select enclosing tag", function() {
              set({
                textC: "<span>h|ello<span>inner</span></span>"
              });
              return ensure("d i t", {
                text: "<span></span>"
              });
            });
          });
        });
      });
      return describe("a-tag", function() {
        return describe("precisely select a", function() {
          var aABC, check, selectedText, text, textAfterDeleted;
          check = getCheckFunctionFor('a t');
          text = "<abc>\n  <title>TITLE</title>\n</abc>";
          selectedText = "<title>TITLE</title>";
          aABC = text;
          textAfterDeleted = "<abc>\n__\n</abc>".replace(/_/g, ' ');
          beforeEach(function() {
            return set({
              text: text
            });
          });
          it("[1] forwarding", function() {
            return check([1, 0], 'v', {
              selectedText: selectedText
            });
          });
          it("[2] openTag leftmost", function() {
            return check([1, 2], 'v', {
              selectedText: selectedText
            });
          });
          it("[3] openTag rightmost", function() {
            return check([1, 8], 'v', {
              selectedText: selectedText
            });
          });
          it("[4] Inner text", function() {
            return check([1, 10], 'v', {
              selectedText: selectedText
            });
          });
          it("[5] closeTag leftmost", function() {
            return check([1, 14], 'v', {
              selectedText: selectedText
            });
          });
          it("[6] closeTag rightmost", function() {
            return check([1, 21], 'v', {
              selectedText: selectedText
            });
          });
          it("[7] right of closeTag", function() {
            return check([2, 0], 'v', {
              selectedText: aABC
            });
          });
          it("[8] forwarding", function() {
            return check([1, 0], 'd', {
              text: textAfterDeleted
            });
          });
          it("[9] openTag leftmost", function() {
            return check([1, 2], 'd', {
              text: textAfterDeleted
            });
          });
          it("[10] openTag rightmost", function() {
            return check([1, 8], 'd', {
              text: textAfterDeleted
            });
          });
          it("[11] Inner text", function() {
            return check([1, 10], 'd', {
              text: textAfterDeleted
            });
          });
          it("[12] closeTag leftmost", function() {
            return check([1, 14], 'd', {
              text: textAfterDeleted
            });
          });
          it("[13] closeTag rightmost", function() {
            return check([1, 21], 'd', {
              text: textAfterDeleted
            });
          });
          return it("[14] right of closeTag", function() {
            return check([2, 0], 'd', {
              text: ""
            });
          });
        });
      });
    });
    describe("SquareBracket", function() {
      describe("inner-square-bracket", function() {
        beforeEach(function() {
          return set({
            text: "[ something in here and in [here] ]",
            cursor: [0, 9]
          });
        });
        it("applies operators inside the current word in operator-pending mode", function() {
          return ensure('d i [', {
            text: "[]",
            cursor: [0, 1]
          });
        });
        return it("applies operators inside the current word in operator-pending mode (second test)", function() {
          set({
            cursor: [0, 29]
          });
          return ensure('d i [', {
            text: "[ something in here and in [] ]",
            cursor: [0, 28]
          });
        });
      });
      return describe("a-square-bracket", function() {
        beforeEach(function() {
          return set({
            text: "[ something in here and in [here] ]",
            cursor: [0, 9]
          });
        });
        it("applies operators around the current square brackets in operator-pending mode", function() {
          return ensure('d a [', {
            text: '',
            cursor: [0, 0],
            mode: 'normal'
          });
        });
        it("applies operators around the current square brackets in operator-pending mode (second test)", function() {
          set({
            cursor: [0, 29]
          });
          return ensure('d a [', {
            text: "[ something in here and in  ]",
            cursor: [0, 27],
            mode: 'normal'
          });
        });
        describe("cursor is on the pair char", function() {
          var check, close, open, selectedText, text, textFinal;
          check = getCheckFunctionFor('i [');
          text = '-[+]-';
          textFinal = '-[]-';
          selectedText = '+';
          open = [0, 1];
          close = [0, 3];
          beforeEach(function() {
            return set({
              text: text
            });
          });
          it("case-1 normal", function() {
            return check(open, 'd', {
              text: textFinal,
              cursor: [0, 2]
            });
          });
          it("case-2 normal", function() {
            return check(close, 'd', {
              text: textFinal,
              cursor: [0, 2]
            });
          });
          it("case-3 visual", function() {
            return check(open, 'v', {
              selectedText: selectedText
            });
          });
          return it("case-4 visual", function() {
            return check(close, 'v', {
              selectedText: selectedText
            });
          });
        });
        return describe("cursor is on the pair char", function() {
          var check, close, open, selectedText, text, textFinal;
          check = getCheckFunctionFor('a [');
          text = '-[+]-';
          textFinal = '--';
          selectedText = '[+]';
          open = [0, 1];
          close = [0, 3];
          beforeEach(function() {
            return set({
              text: text
            });
          });
          it("case-1 normal", function() {
            return check(open, 'd', {
              text: textFinal,
              cursor: [0, 1]
            });
          });
          it("case-2 normal", function() {
            return check(close, 'd', {
              text: textFinal,
              cursor: [0, 1]
            });
          });
          it("case-3 visual", function() {
            return check(open, 'v', {
              selectedText: selectedText
            });
          });
          return it("case-4 visual", function() {
            return check(close, 'v', {
              selectedText: selectedText
            });
          });
        });
      });
    });
    describe("Parenthesis", function() {
      describe("inner-parenthesis", function() {
        beforeEach(function() {
          return set({
            text: "( something in here and in (here) )",
            cursor: [0, 9]
          });
        });
        it("applies operators inside the current word in operator-pending mode", function() {
          return ensure('d i (', {
            text: "()",
            cursor: [0, 1]
          });
        });
        it("applies operators inside the current word in operator-pending mode (second test)", function() {
          set({
            cursor: [0, 29]
          });
          return ensure('d i (', {
            text: "( something in here and in () )",
            cursor: [0, 28]
          });
        });
        it("select inner () by skipping nesting pair", function() {
          set({
            text: 'expect(editor.getScrollTop())',
            cursor: [0, 7]
          });
          return ensure('v i (', {
            selectedText: 'editor.getScrollTop()'
          });
        });
        it("skip escaped pair case-1", function() {
          set({
            text: 'expect(editor.g\\(etScrollTp())',
            cursor: [0, 20]
          });
          return ensure('v i (', {
            selectedText: 'editor.g\\(etScrollTp()'
          });
        });
        it("dont skip literal backslash", function() {
          set({
            text: 'expect(editor.g\\\\(etScrollTp())',
            cursor: [0, 20]
          });
          return ensure('v i (', {
            selectedText: 'etScrollTp()'
          });
        });
        it("skip escaped pair case-2", function() {
          set({
            text: 'expect(editor.getSc\\)rollTp())',
            cursor: [0, 7]
          });
          return ensure('v i (', {
            selectedText: 'editor.getSc\\)rollTp()'
          });
        });
        it("skip escaped pair case-3", function() {
          set({
            text: 'expect(editor.ge\\(tSc\\)rollTp())',
            cursor: [0, 7]
          });
          return ensure('v i (', {
            selectedText: 'editor.ge\\(tSc\\)rollTp()'
          });
        });
        it("works with multiple cursors", function() {
          set({
            text: "( a b ) cde ( f g h ) ijk",
            cursor: [[0, 2], [0, 18]]
          });
          return ensure('v i (', {
            selectedBufferRange: [[[0, 1], [0, 6]], [[0, 13], [0, 20]]]
          });
        });
        return describe("cursor is on the pair char", function() {
          var check, close, open, selectedText, text, textFinal;
          check = getCheckFunctionFor('i (');
          text = '-(+)-';
          textFinal = '-()-';
          selectedText = '+';
          open = [0, 1];
          close = [0, 3];
          beforeEach(function() {
            return set({
              text: text
            });
          });
          it("case-1 normal", function() {
            return check(open, 'd', {
              text: textFinal,
              cursor: [0, 2]
            });
          });
          it("case-2 normal", function() {
            return check(close, 'd', {
              text: textFinal,
              cursor: [0, 2]
            });
          });
          it("case-3 visual", function() {
            return check(open, 'v', {
              selectedText: selectedText
            });
          });
          return it("case-4 visual", function() {
            return check(close, 'v', {
              selectedText: selectedText
            });
          });
        });
      });
      return describe("a-parenthesis", function() {
        beforeEach(function() {
          return set({
            text: "( something in here and in (here) )",
            cursor: [0, 9]
          });
        });
        it("applies operators around the current parentheses in operator-pending mode", function() {
          return ensure('d a (', {
            text: '',
            cursor: [0, 0],
            mode: 'normal'
          });
        });
        it("applies operators around the current parentheses in operator-pending mode (second test)", function() {
          set({
            cursor: [0, 29]
          });
          return ensure('d a (', {
            text: "( something in here and in  )",
            cursor: [0, 27]
          });
        });
        return describe("cursor is on the pair char", function() {
          var check, close, open, selectedText, text, textFinal;
          check = getCheckFunctionFor('a (');
          text = '-(+)-';
          textFinal = '--';
          selectedText = '(+)';
          open = [0, 1];
          close = [0, 3];
          beforeEach(function() {
            return set({
              text: text
            });
          });
          it("case-1 normal", function() {
            return check(open, 'd', {
              text: textFinal,
              cursor: [0, 1]
            });
          });
          it("case-2 normal", function() {
            return check(close, 'd', {
              text: textFinal,
              cursor: [0, 1]
            });
          });
          it("case-3 visual", function() {
            return check(open, 'v', {
              selectedText: selectedText
            });
          });
          return it("case-4 visual", function() {
            return check(close, 'v', {
              selectedText: selectedText
            });
          });
        });
      });
    });
    describe("Paragraph", function() {
      var ensureParagraph, text;
      text = null;
      ensureParagraph = function(keystroke, options) {
        if (!options.setCursor) {
          throw new Errow("no setCursor provided");
        }
        set({
          cursor: options.setCursor
        });
        delete options.setCursor;
        ensure(keystroke, options);
        return ensure('escape', {
          mode: 'normal'
        });
      };
      beforeEach(function() {
        text = new TextData("\n1: P-1\n\n3: P-2\n4: P-2\n\n\n7: P-3\n8: P-3\n9: P-3\n\n");
        return set({
          cursor: [1, 0],
          text: text.getRaw()
        });
      });
      describe("inner-paragraph", function() {
        it("select consequtive blank rows", function() {
          ensureParagraph('v i p', {
            setCursor: [0, 0],
            selectedText: text.getLines([0])
          });
          ensureParagraph('v i p', {
            setCursor: [2, 0],
            selectedText: text.getLines([2])
          });
          return ensureParagraph('v i p', {
            setCursor: [5, 0],
            selectedText: text.getLines([5, 6])
          });
        });
        it("select consequtive non-blank rows", function() {
          ensureParagraph('v i p', {
            setCursor: [1, 0],
            selectedText: text.getLines([1])
          });
          ensureParagraph('v i p', {
            setCursor: [3, 0],
            selectedText: text.getLines([3, 4])
          });
          return ensureParagraph('v i p', {
            setCursor: [7, 0],
            selectedText: text.getLines([7, 8, 9])
          });
        });
        return it("operate on inner paragraph", function() {
          return ensureParagraph('y i p', {
            setCursor: [7, 0],
            register: {
              '"': {
                text: text.getLines([7, 8, 9])
              }
            }
          });
        });
      });
      return describe("a-paragraph", function() {
        it("select two paragraph as one operation", function() {
          ensureParagraph('v a p', {
            setCursor: [0, 0],
            selectedText: text.getLines([0, 1])
          });
          ensureParagraph('v a p', {
            setCursor: [2, 0],
            selectedText: text.getLines([2, 3, 4])
          });
          return ensureParagraph('v a p', {
            setCursor: [5, 0],
            selectedText: text.getLines([5, 6, 7, 8, 9])
          });
        });
        it("select two paragraph as one operation", function() {
          ensureParagraph('v a p', {
            setCursor: [1, 0],
            selectedText: text.getLines([1, 2])
          });
          ensureParagraph('v a p', {
            setCursor: [3, 0],
            selectedText: text.getLines([3, 4, 5, 6])
          });
          return ensureParagraph('v a p', {
            setCursor: [7, 0],
            selectedText: text.getLines([7, 8, 9, 10])
          });
        });
        return it("operate on a paragraph", function() {
          return ensureParagraph('y a p', {
            setCursor: [3, 0],
            register: {
              '"': {
                text: text.getLines([3, 4, 5, 6])
              }
            }
          });
        });
      });
    });
    describe('Comment', function() {
      beforeEach(function() {
        waitsForPromise(function() {
          return atom.packages.activatePackage('language-coffee-script');
        });
        return runs(function() {
          return set({
            grammar: 'source.coffee',
            text: "###\nmultiline comment\n###\n\n# One line comment\n\n# Comment\n# border\nclass QuickSort"
          });
        });
      });
      afterEach(function() {
        return atom.packages.deactivatePackage('language-coffee-script');
      });
      return describe('inner-comment', function() {
        it('select inner comment block', function() {
          set({
            cursor: [0, 0]
          });
          return ensure('v i /', {
            selectedText: '###\nmultiline comment\n###\n',
            selectedBufferRange: [[0, 0], [3, 0]]
          });
        });
        it('select one line comment', function() {
          set({
            cursor: [4, 0]
          });
          return ensure('v i /', {
            selectedText: '# One line comment\n',
            selectedBufferRange: [[4, 0], [5, 0]]
          });
        });
        return it('not select non-comment line', function() {
          set({
            cursor: [6, 0]
          });
          return ensure('v i /', {
            selectedText: '# Comment\n# border\n',
            selectedBufferRange: [[6, 0], [8, 0]]
          });
        });
      });
    });
    describe('Indentation', function() {
      beforeEach(function() {
        waitsForPromise(function() {
          return atom.packages.activatePackage('language-coffee-script');
        });
        return getVimState('sample.coffee', function(vimState, vim) {
          editor = vimState.editor, editorElement = vimState.editorElement;
          return set = vim.set, ensure = vim.ensure, keystroke = vim.keystroke, vim;
        });
      });
      afterEach(function() {
        return atom.packages.deactivatePackage('language-coffee-script');
      });
      describe('inner-indentation', function() {
        return it('select lines with deeper indent-level', function() {
          set({
            cursor: [12, 0]
          });
          return ensure('v i i', {
            selectedBufferRange: [[12, 0], [15, 0]]
          });
        });
      });
      return describe('a-indentation', function() {
        return it('wont stop on blank line when selecting indent', function() {
          set({
            cursor: [12, 0]
          });
          return ensure('v a i', {
            selectedBufferRange: [[10, 0], [27, 0]]
          });
        });
      });
    });
    describe('Fold', function() {
      var rangeForRows;
      rangeForRows = function(startRow, endRow) {
        return [[startRow, 0], [endRow + 1, 0]];
      };
      beforeEach(function() {
        waitsForPromise(function() {
          return atom.packages.activatePackage('language-coffee-script');
        });
        return getVimState('sample.coffee', function(vimState, vim) {
          editor = vimState.editor, editorElement = vimState.editorElement;
          return set = vim.set, ensure = vim.ensure, keystroke = vim.keystroke, vim;
        });
      });
      afterEach(function() {
        return atom.packages.deactivatePackage('language-coffee-script');
      });
      describe('inner-fold', function() {
        it("select inner range of fold", function() {
          set({
            cursor: [13, 0]
          });
          return ensure('v i z', {
            selectedBufferRange: rangeForRows(10, 25)
          });
        });
        it("select inner range of fold", function() {
          set({
            cursor: [19, 0]
          });
          return ensure('v i z', {
            selectedBufferRange: rangeForRows(19, 23)
          });
        });
        it("can expand selection", function() {
          set({
            cursor: [23, 0]
          });
          keystroke('v');
          ensure('i z', {
            selectedBufferRange: rangeForRows(23, 23)
          });
          ensure('i z', {
            selectedBufferRange: rangeForRows(19, 23)
          });
          ensure('i z', {
            selectedBufferRange: rangeForRows(10, 25)
          });
          return ensure('i z', {
            selectedBufferRange: rangeForRows(9, 28)
          });
        });
        describe("when startRow of selection is on fold startRow", function() {
          return it('select inner fold', function() {
            set({
              cursor: [20, 7]
            });
            return ensure('v i z', {
              selectedBufferRange: rangeForRows(21, 21)
            });
          });
        });
        describe("when containing fold are not found", function() {
          return it("do nothing", function() {
            set({
              cursor: [20, 0]
            });
            ensure('V G', {
              selectedBufferRange: rangeForRows(20, 30)
            });
            return ensure('i z', {
              selectedBufferRange: rangeForRows(20, 30)
            });
          });
        });
        return describe("when indent level of fold startRow and endRow is same", function() {
          beforeEach(function() {
            waitsForPromise(function() {
              return atom.packages.activatePackage('language-javascript');
            });
            return getVimState('sample.js', function(state, vimEditor) {
              editor = state.editor, editorElement = state.editorElement;
              return set = vimEditor.set, ensure = vimEditor.ensure, keystroke = vimEditor.keystroke, vimEditor;
            });
          });
          afterEach(function() {
            return atom.packages.deactivatePackage('language-javascript');
          });
          return it("doesn't select fold endRow", function() {
            set({
              cursor: [5, 0]
            });
            ensure('v i z', {
              selectedBufferRange: rangeForRows(5, 6)
            });
            return ensure('a z', {
              selectedBufferRange: rangeForRows(4, 7)
            });
          });
        });
      });
      return describe('a-fold', function() {
        it('select fold row range', function() {
          set({
            cursor: [13, 0]
          });
          return ensure('v a z', {
            selectedBufferRange: rangeForRows(9, 25)
          });
        });
        it('select fold row range', function() {
          set({
            cursor: [19, 0]
          });
          return ensure('v a z', {
            selectedBufferRange: rangeForRows(18, 23)
          });
        });
        it('can expand selection', function() {
          set({
            cursor: [23, 0]
          });
          keystroke('v');
          ensure('a z', {
            selectedBufferRange: rangeForRows(22, 23)
          });
          ensure('a z', {
            selectedBufferRange: rangeForRows(18, 23)
          });
          ensure('a z', {
            selectedBufferRange: rangeForRows(9, 25)
          });
          return ensure('a z', {
            selectedBufferRange: rangeForRows(8, 28)
          });
        });
        describe("when startRow of selection is on fold startRow", function() {
          return it('select fold starting from current row', function() {
            set({
              cursor: [20, 7]
            });
            return ensure('v a z', {
              selectedBufferRange: rangeForRows(20, 21)
            });
          });
        });
        return describe("when containing fold are not found", function() {
          return it("do nothing", function() {
            set({
              cursor: [20, 0]
            });
            ensure('V G', {
              selectedBufferRange: rangeForRows(20, 30)
            });
            return ensure('a z', {
              selectedBufferRange: rangeForRows(20, 30)
            });
          });
        });
      });
    });
    describe('Function', function() {
      describe('coffee', function() {
        var pack, scope;
        pack = 'language-coffee-script';
        scope = 'source.coffee';
        beforeEach(function() {
          waitsForPromise(function() {
            return atom.packages.activatePackage(pack);
          });
          set({
            text: "# Commment\n\nhello = ->\n  a = 1\n  b = 2\n  c = 3\n\n# Commment",
            cursor: [3, 0]
          });
          return runs(function() {
            var grammar;
            grammar = atom.grammars.grammarForScopeName(scope);
            return editor.setGrammar(grammar);
          });
        });
        afterEach(function() {
          return atom.packages.deactivatePackage(pack);
        });
        describe('inner-function for coffee', function() {
          return it('select except start row', function() {
            return ensure('v i f', {
              selectedBufferRange: [[3, 0], [6, 0]]
            });
          });
        });
        return describe('a-function for coffee', function() {
          return it('select function', function() {
            return ensure('v a f', {
              selectedBufferRange: [[2, 0], [6, 0]]
            });
          });
        });
      });
      describe('ruby', function() {
        var pack, scope;
        pack = 'language-ruby';
        scope = 'source.ruby';
        beforeEach(function() {
          waitsForPromise(function() {
            return atom.packages.activatePackage(pack);
          });
          set({
            text: "# Commment\n\ndef hello\n  a = 1\n  b = 2\n  c = 3\nend\n\n# Commment",
            cursor: [3, 0]
          });
          return runs(function() {
            var grammar;
            grammar = atom.grammars.grammarForScopeName(scope);
            return editor.setGrammar(grammar);
          });
        });
        afterEach(function() {
          return atom.packages.deactivatePackage(pack);
        });
        describe('inner-function for ruby', function() {
          return it('select except start row', function() {
            return ensure('v i f', {
              selectedBufferRange: [[3, 0], [6, 0]]
            });
          });
        });
        return describe('a-function for ruby', function() {
          return it('select function', function() {
            return ensure('v a f', {
              selectedBufferRange: [[2, 0], [7, 0]]
            });
          });
        });
      });
      return describe('go', function() {
        var pack, scope;
        pack = 'language-go';
        scope = 'source.go';
        beforeEach(function() {
          waitsForPromise(function() {
            return atom.packages.activatePackage(pack);
          });
          set({
            text: "// Commment\n\nfunc main() {\n  a := 1\n  b := 2\n  c := 3\n}\n\n// Commment",
            cursor: [3, 0]
          });
          return runs(function() {
            var grammar;
            grammar = atom.grammars.grammarForScopeName(scope);
            return editor.setGrammar(grammar);
          });
        });
        afterEach(function() {
          return atom.packages.deactivatePackage(pack);
        });
        describe('inner-function for go', function() {
          return it('select except start row', function() {
            return ensure('v i f', {
              selectedBufferRange: [[3, 0], [6, 0]]
            });
          });
        });
        return describe('a-function for go', function() {
          return it('select function', function() {
            return ensure('v a f', {
              selectedBufferRange: [[2, 0], [7, 0]]
            });
          });
        });
      });
    });
    describe('CurrentLine', function() {
      beforeEach(function() {
        return set({
          text: "This is\n  multi line\ntext"
        });
      });
      describe('inner-current-line', function() {
        it('select current line without including last newline', function() {
          set({
            cursor: [0, 0]
          });
          return ensure('v i l', {
            selectedText: 'This is'
          });
        });
        return it('also skip leading white space', function() {
          set({
            cursor: [1, 0]
          });
          return ensure('v i l', {
            selectedText: 'multi line'
          });
        });
      });
      return describe('a-current-line', function() {
        it('select current line without including last newline as like `vil`', function() {
          set({
            cursor: [0, 0]
          });
          return ensure('v a l', {
            selectedText: 'This is'
          });
        });
        return it('wont skip leading white space not like `vil`', function() {
          set({
            cursor: [1, 0]
          });
          return ensure('v a l', {
            selectedText: '  multi line'
          });
        });
      });
    });
    describe('Arguments', function() {
      describe('auto-detect inner-pair target', function() {
        describe('inner-pair is comma separated', function() {
          it("target inner-paren by auto-detect", function() {
            set({
              textC: "(1|st, 2nd)"
            });
            ensure('d i ,', {
              textC: "(|, 2nd)"
            });
            set({
              textC: "(1|st, 2nd)"
            });
            ensure('d a ,', {
              textC: "(|2nd)"
            });
            set({
              textC: "(1st, 2|nd)"
            });
            ensure('d i ,', {
              textC: "(1st, |)"
            });
            set({
              textC: "(1st, 2|nd)"
            });
            return ensure('d a ,', {
              textC: "(1st|)"
            });
          });
          it("target inner-curly-bracket by auto-detect", function() {
            set({
              textC: "{1|st, 2nd}"
            });
            ensure('d i ,', {
              textC: "{|, 2nd}"
            });
            set({
              textC: "{1|st, 2nd}"
            });
            ensure('d a ,', {
              textC: "{|2nd}"
            });
            set({
              textC: "{1st, 2|nd}"
            });
            ensure('d i ,', {
              textC: "{1st, |}"
            });
            set({
              textC: "{1st, 2|nd}"
            });
            return ensure('d a ,', {
              textC: "{1st|}"
            });
          });
          return it("target inner-square-bracket by auto-detect", function() {
            set({
              textC: "[1|st, 2nd]"
            });
            ensure('d i ,', {
              textC: "[|, 2nd]"
            });
            set({
              textC: "[1|st, 2nd]"
            });
            ensure('d a ,', {
              textC: "[|2nd]"
            });
            set({
              textC: "[1st, 2|nd]"
            });
            ensure('d i ,', {
              textC: "[1st, |]"
            });
            set({
              textC: "[1st, 2|nd]"
            });
            return ensure('d a ,', {
              textC: "[1st|]"
            });
          });
        });
        return describe('inner-pair is space separated', function() {
          it("target inner-paren by auto-detect", function() {
            set({
              textC: "(1|st 2nd)"
            });
            ensure('d i ,', {
              textC: "(| 2nd)"
            });
            set({
              textC: "(1|st 2nd)"
            });
            ensure('d a ,', {
              textC: "(|2nd)"
            });
            set({
              textC: "(1st 2|nd)"
            });
            ensure('d i ,', {
              textC: "(1st |)"
            });
            set({
              textC: "(1st 2|nd)"
            });
            return ensure('d a ,', {
              textC: "(1st|)"
            });
          });
          it("target inner-curly-bracket by auto-detect", function() {
            set({
              textC: "{1|st 2nd}"
            });
            ensure('d i ,', {
              textC: "{| 2nd}"
            });
            set({
              textC: "{1|st 2nd}"
            });
            ensure('d a ,', {
              textC: "{|2nd}"
            });
            set({
              textC: "{1st 2|nd}"
            });
            ensure('d i ,', {
              textC: "{1st |}"
            });
            set({
              textC: "{1st 2|nd}"
            });
            return ensure('d a ,', {
              textC: "{1st|}"
            });
          });
          return it("target inner-square-bracket by auto-detect", function() {
            set({
              textC: "[1|st 2nd]"
            });
            ensure('d i ,', {
              textC: "[| 2nd]"
            });
            set({
              textC: "[1|st 2nd]"
            });
            ensure('d a ,', {
              textC: "[|2nd]"
            });
            set({
              textC: "[1st 2|nd]"
            });
            ensure('d i ,', {
              textC: "[1st |]"
            });
            set({
              textC: "[1st 2|nd]"
            });
            return ensure('d a ,', {
              textC: "[1st|]"
            });
          });
        });
      });
      describe("[fallback] when auto-detect failed, target current-line", function() {
        beforeEach(function() {
          return set({
            text: "if hello(world) and good(bye) {\n  1st;\n  2nd;\n}"
          });
        });
        it("delete 1st elem of inner-curly-bracket when auto-detect succeeded", function() {
          set({
            cursor: [1, 3]
          });
          return ensure('d a ,', {
            textC: "if hello(world) and good(bye) {\n  |2nd;\n}"
          });
        });
        it("delete 2st elem of inner-curly-bracket when auto-detect succeeded", function() {
          set({
            cursor: [2, 3]
          });
          return ensure('d a ,', {
            textC: "if hello(world) and good(bye) {\n  1st|;\n}"
          });
        });
        it("delete 1st elem of current-line when auto-detect failed", function() {
          set({
            cursor: [0, 0]
          });
          return ensure('d a ,', {
            textC: "|hello(world) and good(bye) {\n  1st;\n  2nd;\n}"
          });
        });
        it("delete 2nd elem of current-line when auto-detect failed", function() {
          set({
            cursor: [0, 3]
          });
          return ensure('d a ,', {
            textC: "if |and good(bye) {\n  1st;\n  2nd;\n}"
          });
        });
        it("delete 3rd elem of current-line when auto-detect failed", function() {
          set({
            cursor: [0, 16]
          });
          return ensure('d a ,', {
            textC: "if hello(world) |good(bye) {\n  1st;\n  2nd;\n}"
          });
        });
        return it("delete 4th elem of current-line when auto-detect failed", function() {
          set({
            cursor: [0, 20]
          });
          return ensure('d a ,', {
            textC: "if hello(world) and |{\n  1st;\n  2nd;\n}"
          });
        });
      });
      describe('slingle line comma separated text', function() {
        describe("change 1st arg", function() {
          beforeEach(function() {
            return set({
              textC: "var a = func(f|irst(1, 2, 3), second(), 3)"
            });
          });
          it('change', function() {
            return ensure('c i ,', {
              textC: "var a = func(|, second(), 3)"
            });
          });
          return it('change', function() {
            return ensure('c a ,', {
              textC: "var a = func(|second(), 3)"
            });
          });
        });
        describe('change 2nd arg', function() {
          beforeEach(function() {
            return set({
              textC: "var a = func(first(1, 2, 3),| second(), 3)"
            });
          });
          it('change', function() {
            return ensure('c i ,', {
              textC: "var a = func(first(1, 2, 3), |, 3)"
            });
          });
          return it('change', function() {
            return ensure('c a ,', {
              textC: "var a = func(first(1, 2, 3), |3)"
            });
          });
        });
        describe('change 3rd arg', function() {
          beforeEach(function() {
            return set({
              textC: "var a = func(first(1, 2, 3), second(),| 3)"
            });
          });
          it('change', function() {
            return ensure('c i ,', {
              textC: "var a = func(first(1, 2, 3), second(), |)"
            });
          });
          return it('change', function() {
            return ensure('c a ,', {
              textC: "var a = func(first(1, 2, 3), second()|)"
            });
          });
        });
        describe('when cursor is on-comma-separator, it affects preceeding arg', function() {
          beforeEach(function() {
            return set({
              textC: "var a = func(first(1, 2, 3)|, second(), 3)"
            });
          });
          it('change 1st', function() {
            return ensure('c i ,', {
              textC: "var a = func(|, second(), 3)"
            });
          });
          return it('change 1st', function() {
            return ensure('c a ,', {
              textC: "var a = func(|second(), 3)"
            });
          });
        });
        describe('cursor-is-on-white-space, it affects followed arg', function() {
          beforeEach(function() {
            return set({
              textC: "var a = func(first(1, 2, 3),| second(), 3)"
            });
          });
          it('change 2nd', function() {
            return ensure('c i ,', {
              textC: "var a = func(first(1, 2, 3), |, 3)"
            });
          });
          return it('change 2nd', function() {
            return ensure('c a ,', {
              textC: "var a = func(first(1, 2, 3), |3)"
            });
          });
        });
        describe("cursor-is-on-parehthesis, it wont target inner-parent", function() {
          it('change 1st of outer-paren', function() {
            set({
              textC: "var a = func(first|(1, 2, 3), second(), 3)"
            });
            return ensure('c i ,', {
              textC: "var a = func(|, second(), 3)"
            });
          });
          return it('change 3rd of outer-paren', function() {
            set({
              textC: "var a = func(first(1, 2, 3|), second(), 3)"
            });
            return ensure('c i ,', {
              textC: "var a = func(|, second(), 3)"
            });
          });
        });
        return describe("cursor-is-next-or-before parehthesis, it target inner-parent", function() {
          it('change 1st of inner-paren', function() {
            set({
              textC: "var a = func(first(|1, 2, 3), second(), 3)"
            });
            return ensure('c i ,', {
              textC: "var a = func(first(|, 2, 3), second(), 3)"
            });
          });
          return it('change 3rd of inner-paren', function() {
            set({
              textC: "var a = func(first(1, 2, |3), second(), 3)"
            });
            return ensure('c i ,', {
              textC: "var a = func(first(1, 2, |), second(), 3)"
            });
          });
        });
      });
      describe('slingle line space separated text', function() {
        describe("change 1st arg", function() {
          beforeEach(function() {
            return set({
              textC: "%w(|1st 2nd 3rd)"
            });
          });
          it('change', function() {
            return ensure('c i ,', {
              textC: "%w(| 2nd 3rd)"
            });
          });
          return it('change', function() {
            return ensure('c a ,', {
              textC: "%w(|2nd 3rd)"
            });
          });
        });
        describe("change 2nd arg", function() {
          beforeEach(function() {
            return set({
              textC: "%w(1st |2nd 3rd)"
            });
          });
          it('change', function() {
            return ensure('c i ,', {
              textC: "%w(1st | 3rd)"
            });
          });
          return it('change', function() {
            return ensure('c a ,', {
              textC: "%w(1st |3rd)"
            });
          });
        });
        return describe("change 2nd arg", function() {
          beforeEach(function() {
            return set({
              textC: "%w(1st 2nd |3rd)"
            });
          });
          it('change', function() {
            return ensure('c i ,', {
              textC: "%w(1st 2nd |)"
            });
          });
          return it('change', function() {
            return ensure('c a ,', {
              textC: "%w(1st 2nd|)"
            });
          });
        });
      });
      describe('multi line comma separated text', function() {
        beforeEach(function() {
          return set({
            textC_: "[\n  \"1st elem is string\",\n  () => hello('2nd elm is function'),\n  3rdElmHasTrailingComma,\n]"
          });
        });
        return describe("change 1st arg", function() {
          it('change 1st inner-arg', function() {
            set({
              cursor: [1, 0]
            });
            return ensure('c i ,', {
              textC: "[\n  |,\n  () => hello('2nd elm is function'),\n  3rdElmHasTrailingComma,\n]"
            });
          });
          it('change 1st a-arg', function() {
            set({
              cursor: [1, 0]
            });
            return ensure('c a ,', {
              textC: "[\n  |() => hello('2nd elm is function'),\n  3rdElmHasTrailingComma,\n]"
            });
          });
          it('change 2nd inner-arg', function() {
            set({
              cursor: [2, 0]
            });
            return ensure('c i ,', {
              textC: "[\n  \"1st elem is string\",\n  |,\n  3rdElmHasTrailingComma,\n]"
            });
          });
          it('change 2nd a-arg', function() {
            set({
              cursor: [2, 0]
            });
            return ensure('c a ,', {
              textC: "[\n  \"1st elem is string\",\n  |3rdElmHasTrailingComma,\n]"
            });
          });
          it('change 3rd inner-arg', function() {
            set({
              cursor: [3, 0]
            });
            return ensure('c i ,', {
              textC: "[\n  \"1st elem is string\",\n  () => hello('2nd elm is function'),\n  |,\n]"
            });
          });
          return it('change 3rd a-arg', function() {
            set({
              cursor: [3, 0]
            });
            return ensure('c a ,', {
              textC: "[\n  \"1st elem is string\",\n  () => hello('2nd elm is function')|,\n]"
            });
          });
        });
      });
      return describe('when it coudnt find inner-pair from cursor it target current-line', function() {
        beforeEach(function() {
          return set({
            textC_: "if |isMorning(time, of, the, day) {\n  helllo(\"world\");\n}"
          });
        });
        it("change inner-arg", function() {
          return ensure("c i ,", {
            textC_: "if | {\n  helllo(\"world\");\n}"
          });
        });
        return it("change a-arg", function() {
          return ensure("c a ,", {
            textC_: "if |{\n  helllo(\"world\");\n}"
          });
        });
      });
    });
    describe('Entire', function() {
      var text;
      text = "This is\n  multi line\ntext";
      beforeEach(function() {
        return set({
          text: text,
          cursor: [0, 0]
        });
      });
      describe('inner-entire', function() {
        return it('select entire buffer', function() {
          ensure('escape', {
            selectedText: ''
          });
          ensure('v i e', {
            selectedText: text
          });
          ensure('escape', {
            selectedText: ''
          });
          return ensure('j j v i e', {
            selectedText: text
          });
        });
      });
      return describe('a-entire', function() {
        return it('select entire buffer', function() {
          ensure('escape', {
            selectedText: ''
          });
          ensure('v a e', {
            selectedText: text
          });
          ensure('escape', {
            selectedText: ''
          });
          return ensure('j j v a e', {
            selectedText: text
          });
        });
      });
    });
    return describe('SearchMatchForward, SearchBackwards', function() {
      var text;
      text = "0 xxx\n1 abc xxx\n2   xxx yyy\n3 xxx abc\n4 abc\n";
      beforeEach(function() {
        jasmine.attachToDOM(atom.views.getView(atom.workspace));
        set({
          text: text,
          cursor: [0, 0]
        });
        ensure([
          '/', {
            search: 'abc'
          }
        ], {
          cursor: [1, 2],
          mode: 'normal'
        });
        return expect(vimState.globalState.get('lastSearchPattern')).toEqual(/abc/g);
      });
      describe('gn from normal mode', function() {
        return it('select ranges matches to last search pattern and extend selection', function() {
          ensure('g n', {
            cursor: [1, 5],
            mode: ['visual', 'characterwise'],
            selectionIsReversed: false,
            selectedText: 'abc'
          });
          ensure('g n', {
            selectionIsReversed: false,
            mode: ['visual', 'characterwise'],
            selectedText: "abc xxx\n2   xxx yyy\n3 xxx abc"
          });
          ensure('g n', {
            selectionIsReversed: false,
            mode: ['visual', 'characterwise'],
            selectedText: "abc xxx\n2   xxx yyy\n3 xxx abc\n4 abc"
          });
          return ensure('g n', {
            selectionIsReversed: false,
            mode: ['visual', 'characterwise'],
            selectedText: "abc xxx\n2   xxx yyy\n3 xxx abc\n4 abc"
          });
        });
      });
      describe('gN from normal mode', function() {
        beforeEach(function() {
          return set({
            cursor: [4, 3]
          });
        });
        return it('select ranges matches to last search pattern and extend selection', function() {
          ensure('g N', {
            cursor: [4, 2],
            mode: ['visual', 'characterwise'],
            selectionIsReversed: true,
            selectedText: 'abc'
          });
          ensure('g N', {
            selectionIsReversed: true,
            mode: ['visual', 'characterwise'],
            selectedText: "abc\n4 abc"
          });
          ensure('g N', {
            selectionIsReversed: true,
            mode: ['visual', 'characterwise'],
            selectedText: "abc xxx\n2   xxx yyy\n3 xxx abc\n4 abc"
          });
          return ensure('g N', {
            selectionIsReversed: true,
            mode: ['visual', 'characterwise'],
            selectedText: "abc xxx\n2   xxx yyy\n3 xxx abc\n4 abc"
          });
        });
      });
      return describe('as operator target', function() {
        it('delete next occurrence of last search pattern', function() {
          ensure('d g n', {
            cursor: [1, 2],
            mode: 'normal',
            text: "0 xxx\n1  xxx\n2   xxx yyy\n3 xxx abc\n4 abc\n"
          });
          ensure('.', {
            cursor: [3, 5],
            mode: 'normal',
            text_: "0 xxx\n1  xxx\n2   xxx yyy\n3 xxx_\n4 abc\n"
          });
          return ensure('.', {
            cursor: [4, 1],
            mode: 'normal',
            text_: "0 xxx\n1  xxx\n2   xxx yyy\n3 xxx_\n4 \n"
          });
        });
        return it('change next occurrence of last search pattern', function() {
          ensure('c g n', {
            cursor: [1, 2],
            mode: 'insert',
            text: "0 xxx\n1  xxx\n2   xxx yyy\n3 xxx abc\n4 abc\n"
          });
          keystroke('escape');
          set({
            cursor: [4, 0]
          });
          return ensure('c g N', {
            cursor: [3, 6],
            mode: 'insert',
            text_: "0 xxx\n1  xxx\n2   xxx yyy\n3 xxx_\n4 abc\n"
          });
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9zcGVjL3RleHQtb2JqZWN0LXNwZWMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxNQUFvQyxPQUFBLENBQVEsZUFBUixDQUFwQyxFQUFDLDZCQUFELEVBQWMsdUJBQWQsRUFBd0I7O0VBQ3hCLFFBQUEsR0FBVyxPQUFBLENBQVEsaUJBQVI7O0VBRVgsUUFBQSxDQUFTLFlBQVQsRUFBdUIsU0FBQTtBQUNyQixRQUFBO0lBQUEsT0FBNEQsRUFBNUQsRUFBQyxhQUFELEVBQU0sZ0JBQU4sRUFBYyxtQkFBZCxFQUF5QixnQkFBekIsRUFBaUMsdUJBQWpDLEVBQWdEO0lBRWhELG1CQUFBLEdBQXNCLFNBQUMsVUFBRDthQUNwQixTQUFDLFlBQUQsRUFBZSxTQUFmLEVBQTBCLE9BQTFCO1FBQ0UsR0FBQSxDQUFJO1VBQUEsTUFBQSxFQUFRLFlBQVI7U0FBSjtlQUNBLE1BQUEsQ0FBVSxTQUFELEdBQVcsR0FBWCxHQUFjLFVBQXZCLEVBQXFDLE9BQXJDO01BRkY7SUFEb0I7SUFLdEIsVUFBQSxDQUFXLFNBQUE7YUFDVCxXQUFBLENBQVksU0FBQyxLQUFELEVBQVEsU0FBUjtRQUNWLFFBQUEsR0FBVztRQUNWLHdCQUFELEVBQVM7ZUFDUixtQkFBRCxFQUFNLHlCQUFOLEVBQWMsK0JBQWQsRUFBMkI7TUFIakIsQ0FBWjtJQURTLENBQVg7SUFNQSxRQUFBLENBQVMsWUFBVCxFQUF1QixTQUFBO01BQ3JCLFVBQUEsQ0FBVyxTQUFBO1FBQ1QsZUFBQSxDQUFnQixTQUFBO2lCQUNkLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZCxDQUE4Qix3QkFBOUI7UUFEYyxDQUFoQjtlQUVBLFdBQUEsQ0FBWSxlQUFaLEVBQTZCLFNBQUMsS0FBRCxFQUFRLFNBQVI7VUFDMUIscUJBQUQsRUFBUztpQkFDUixtQkFB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SCxFQUFvRCxTQUFBO1VBQ2xELE1BQUEsQ0FBTyxPQUFQLEVBQ0U7WUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO1lBQ0EsSUFBQSxFQUFNLFFBRE47WUFFQSxJQUFBLEVBQU0sZ0RBRk47V0FERjtVQVVBLE1BQUEsQ0FBTyxHQUFQLEVBQ0U7WUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO1lBQ0EsSUFBQSxFQUFNLFFBRE47WUFFQSxLQUFBLEVBQU8sNkNBRlA7V0FERjtpQkFVQSxNQUFBLENBQU8sR0FBUCxFQUNFO1lBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtZQUNBLElBQUEsRUFBTSxRQUROO1lBRUEsS0FBQSxFQUFPLDBDQUZQO1dBREY7UUFyQmtELENBQXBEO2VBK0JBLEVBQUEsQ0FBRywrQ0FBSCxFQUFvRCxTQUFBO1VBQ2xELE1BQUEsQ0FBTyxPQUFQLEVBQ0U7WUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO1lBQ0EsSUFBQSxFQUFNLFFBRE47WUFFQSxJQUFBLEVBQU0sZ0RBRk47V0FERjtVQVVBLFNBQUEsQ0FBVSxRQUFWO1VBQ0EsR0FBQSxDQUFJO1lBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtXQUFKO2lCQUNBLE1BQUEsQ0FBTyxPQUFQLEVBQ0U7WUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO1lBQ0EsSUFBQSxFQUFNLFFBRE47WUFFQSxLQUFBLEVBQU8sNkNBRlA7V0FERjtRQWJrRCxDQUFwRDtNQWhDNkIsQ0FBL0I7SUFsRjhDLENBQWhEO0VBMzNEcUIsQ0FBdkI7QUFIQSIsInNvdXJjZXNDb250ZW50IjpbIntnZXRWaW1TdGF0ZSwgZGlzcGF0Y2gsIFRleHREYXRhfSA9IHJlcXVpcmUgJy4vc3BlYy1oZWxwZXInXG5zZXR0aW5ncyA9IHJlcXVpcmUgJy4uL2xpYi9zZXR0aW5ncydcblxuZGVzY3JpYmUgXCJUZXh0T2JqZWN0XCIsIC0+XG4gIFtzZXQsIGVuc3VyZSwga2V5c3Ryb2tlLCBlZGl0b3IsIGVkaXRvckVsZW1lbnQsIHZpbVN0YXRlXSA9IFtdXG5cbiAgZ2V0Q2hlY2tGdW5jdGlvbkZvciA9ICh0ZXh0T2JqZWN0KSAtPlxuICAgIChpbml0aWFsUG9pbnQsIGtleXN0cm9rZSwgb3B0aW9ucykgLT5cbiAgICAgIHNldCBjdXJzb3I6IGluaXRpYWxQb2ludFxuICAgICAgZW5zdXJlIFwiI3trZXlzdHJva2V9ICN7dGV4dE9iamVjdH1cIiwgb3B0aW9uc1xuXG4gIGJlZm9yZUVhY2ggLT5cbiAgICBnZXRWaW1TdGF0ZSAoc3RhdGUsIHZpbUVkaXRvcikgLT5cbiAgICAgIHZpbVN0YXRlID0gc3RhdGVcbiAgICAgIHtlZGl0b3IsIGVkaXRvckVsZW1lbnR9ID0gdmltU3RhdGVcbiAgICAgIHtzZXQsIGVuc3VyZSwga2V5c3Ryb2tlfSA9IHZpbUVkaXRvclxuXG4gIGRlc2NyaWJlIFwiVGV4dE9iamVjdFwiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgICBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZSgnbGFuZ3VhZ2UtY29mZmVlLXNjcmlwdCcpXG4gICAgICBnZXRWaW1TdGF0ZSAnc2FtcGxlLmNvZmZlZScsIChzdGF0ZSwgdmltRWRpdG9yKSAtPlxuICAgICAgICB7ZWRpdG9yLCBlZGl0b3JFbGVtZW50fSA9IHN0YXRlXG4gICAgICAgIHtzZXQsIGVuc3VyZSwga2V5c3Ryb2tlfSA9IHZpbUVkaXRvclxuICAgIGFmdGVyRWFjaCAtPlxuICAgICAgYXRvbS5wYWNrYWdlcy5kZWFjdGl2YXRlUGFja2FnZSgnbGFuZ3VhZ2UtY29mZmVlLXNjcmlwdCcpXG5cbiAgICBkZXNjcmliZSBcIndoZW4gVGV4dE9iamVjdCBpcyBleGN1dGVkIGRpcmVjdGx5XCIsIC0+XG4gICAgICBpdCBcInNlbGVjdCB0aGF0IFRleHRPYmplY3RcIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzgsIDddXG4gICAgICAgIGRpc3BhdGNoKGVkaXRvckVsZW1lbnQsICd2aW0tbW9kZS1wbHVzOmlubmVyLXdvcmQnKVxuICAgICAgICBlbnN1cmUgc2VsZWN0ZWRUZXh0OiAnUXVpY2tTb3J0J1xuXG4gIGRlc2NyaWJlIFwiV29yZFwiLCAtPlxuICAgIGRlc2NyaWJlIFwiaW5uZXItd29yZFwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0OiBcIjEyMzQ1IGFiY2RlIEFCQ0RFXCJcbiAgICAgICAgICBjdXJzb3I6IFswLCA5XVxuXG4gICAgICBpdCBcImFwcGxpZXMgb3BlcmF0b3JzIGluc2lkZSB0aGUgY3VycmVudCB3b3JkIGluIG9wZXJhdG9yLXBlbmRpbmcgbW9kZVwiLCAtPlxuICAgICAgICBlbnN1cmUgJ2QgaSB3JyxcbiAgICAgICAgICB0ZXh0OiAgICAgXCIxMjM0NSAgQUJDREVcIlxuICAgICAgICAgIGN1cnNvcjogICBbMCwgNl1cbiAgICAgICAgICByZWdpc3RlcjogJ1wiJzogdGV4dDogJ2FiY2RlJ1xuICAgICAgICAgIG1vZGU6ICdub3JtYWwnXG5cbiAgICAgIGl0IFwic2VsZWN0cyBpbnNpZGUgdGhlIGN1cnJlbnQgd29yZCBpbiB2aXN1YWwgbW9kZVwiLCAtPlxuICAgICAgICBlbnN1cmUgJ3YgaSB3JyxcbiAgICAgICAgICBzZWxlY3RlZFNjcmVlblJhbmdlOiBbWzAsIDZdLCBbMCwgMTFdXVxuXG4gICAgICBpdCBcIndvcmtzIHdpdGggbXVsdGlwbGUgY3Vyc29yc1wiLCAtPlxuICAgICAgICBzZXQgYWRkQ3Vyc29yOiBbMCwgMV1cbiAgICAgICAgZW5zdXJlICd2IGkgdycsXG4gICAgICAgICAgc2VsZWN0ZWRCdWZmZXJSYW5nZTogW1xuICAgICAgICAgICAgW1swLCA2XSwgWzAsIDExXV1cbiAgICAgICAgICAgIFtbMCwgMF0sIFswLCA1XV1cbiAgICAgICAgICBdXG5cbiAgICAgIGRlc2NyaWJlIFwiY3Vyc29yIGlzIG9uIG5leHQgdG8gTm9uV29yZENoYXJhY3RlclwiLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgc2V0XG4gICAgICAgICAgICB0ZXh0OiBcImFiYyhkZWYpXCJcbiAgICAgICAgICAgIGN1cnNvcjogWzAsIDRdXG5cbiAgICAgICAgaXQgXCJjaGFuZ2UgaW5zaWRlIHdvcmRcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJ2MgaSB3JywgdGV4dDogXCJhYmMoKVwiLCBtb2RlOiBcImluc2VydFwiXG5cbiAgICAgICAgaXQgXCJkZWxldGUgaW5zaWRlIHdvcmRcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJ2QgaSB3JywgdGV4dDogXCJhYmMoKVwiLCBtb2RlOiBcIm5vcm1hbFwiXG5cbiAgICAgIGRlc2NyaWJlIFwiY3Vyc29yJ3MgbmV4dCBjaGFyIGlzIE5vbldvcmRDaGFyYWN0ZXJcIiwgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIHNldFxuICAgICAgICAgICAgdGV4dDogXCJhYmMoZGVmKVwiXG4gICAgICAgICAgICBjdXJzb3I6IFswLCA2XVxuXG4gICAgICAgIGl0IFwiY2hhbmdlIGluc2lkZSB3b3JkXCIsIC0+XG4gICAgICAgICAgZW5zdXJlICdjIGkgdycsIHRleHQ6IFwiYWJjKClcIiwgbW9kZTogXCJpbnNlcnRcIlxuXG4gICAgICAgIGl0IFwiZGVsZXRlIGluc2lkZSB3b3JkXCIsIC0+XG4gICAgICAgICAgZW5zdXJlICdkIGkgdycsIHRleHQ6IFwiYWJjKClcIiwgbW9kZTogXCJub3JtYWxcIlxuXG4gICAgZGVzY3JpYmUgXCJhLXdvcmRcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0IHRleHQ6IFwiMTIzNDUgYWJjZGUgQUJDREVcIiwgY3Vyc29yOiBbMCwgOV1cblxuICAgICAgaXQgXCJzZWxlY3QgY3VycmVudC13b3JkIGFuZCB0cmFpbGluZyB3aGl0ZSBzcGFjZVwiLCAtPlxuICAgICAgICBlbnN1cmUgJ2QgYSB3JyxcbiAgICAgICAgICB0ZXh0OiBcIjEyMzQ1IEFCQ0RFXCJcbiAgICAgICAgICBjdXJzb3I6IFswLCA2XVxuICAgICAgICAgIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiBcImFiY2RlIFwiXG5cbiAgICAgIGl0IFwic2VsZWN0IGN1cnJlbnQtd29yZCBhbmQgbGVhZGluZyB3aGl0ZSBzcGFjZSBpbiBjYXNlIHRyYWlsaW5nIHdoaXRlIHNwYWNlIHdhc24ndCB0aGVyZVwiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMTVdXG4gICAgICAgIGVuc3VyZSAnZCBhIHcnLFxuICAgICAgICAgIHRleHQ6IFwiMTIzNDUgYWJjZGVcIlxuICAgICAgICAgIGN1cnNvcjogWzAsIDEwXVxuICAgICAgICAgIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiBcIiBBQkNERVwiXG5cbiAgICAgIGl0IFwic2VsZWN0cyBmcm9tIHRoZSBzdGFydCBvZiB0aGUgY3VycmVudCB3b3JkIHRvIHRoZSBzdGFydCBvZiB0aGUgbmV4dCB3b3JkIGluIHZpc3VhbCBtb2RlXCIsIC0+XG4gICAgICAgIGVuc3VyZSAndiBhIHcnLCBzZWxlY3RlZFNjcmVlblJhbmdlOiBbWzAsIDZdLCBbMCwgMTJdXVxuXG4gICAgICBpdCBcImRvZXNuJ3Qgc3BhbiBuZXdsaW5lc1wiLCAtPlxuICAgICAgICBzZXQgdGV4dDogXCIxMjM0NVxcbmFiY2RlIEFCQ0RFXCIsIGN1cnNvcjogWzAsIDNdXG4gICAgICAgIGVuc3VyZSAndiBhIHcnLCBzZWxlY3RlZEJ1ZmZlclJhbmdlOiBbWzAsIDBdLCBbMCwgNV1dXG5cbiAgICAgIGl0IFwiZG9lc24ndCBzcGFuIHNwZWNpYWwgY2hhcmFjdGVyc1wiLCAtPlxuICAgICAgICBzZXQgdGV4dDogXCIxKDM0NVxcbmFiY2RlIEFCQ0RFXCIsIGN1cnNvcjogWzAsIDNdXG4gICAgICAgIGVuc3VyZSAndiBhIHcnLCBzZWxlY3RlZEJ1ZmZlclJhbmdlOiBbWzAsIDJdLCBbMCwgNV1dXG5cbiAgZGVzY3JpYmUgXCJXaG9sZVdvcmRcIiwgLT5cbiAgICBkZXNjcmliZSBcImlubmVyLXdob2xlLXdvcmRcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0IHRleHQ6IFwiMTIoNDUgYWInZGUgQUJDREVcIiwgY3Vyc29yOiBbMCwgOV1cblxuICAgICAgaXQgXCJhcHBsaWVzIG9wZXJhdG9ycyBpbnNpZGUgdGhlIGN1cnJlbnQgd2hvbGUgd29yZCBpbiBvcGVyYXRvci1wZW5kaW5nIG1vZGVcIiwgLT5cbiAgICAgICAgZW5zdXJlICdkIGkgVycsIHRleHQ6IFwiMTIoNDUgIEFCQ0RFXCIsIGN1cnNvcjogWzAsIDZdLCByZWdpc3RlcjogJ1wiJzogdGV4dDogXCJhYidkZVwiXG5cbiAgICAgIGl0IFwic2VsZWN0cyBpbnNpZGUgdGhlIGN1cnJlbnQgd2hvbGUgd29yZCBpbiB2aXN1YWwgbW9kZVwiLCAtPlxuICAgICAgICBlbnN1cmUgJ3YgaSBXJywgc2VsZWN0ZWRTY3JlZW5SYW5nZTogW1swLCA2XSwgWzAsIDExXV1cbiAgICBkZXNjcmliZSBcImEtd2hvbGUtd29yZFwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXQgdGV4dDogXCIxMig0NSBhYidkZSBBQkNERVwiLCBjdXJzb3I6IFswLCA5XVxuXG4gICAgICBpdCBcInNlbGVjdCB3aG9sZS13b3JkIGFuZCB0cmFpbGluZyB3aGl0ZSBzcGFjZVwiLCAtPlxuICAgICAgICBlbnN1cmUgJ2QgYSBXJyxcbiAgICAgICAgICB0ZXh0OiBcIjEyKDQ1IEFCQ0RFXCJcbiAgICAgICAgICBjdXJzb3I6IFswLCA2XVxuICAgICAgICAgIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiBcImFiJ2RlIFwiXG4gICAgICAgICAgbW9kZTogJ25vcm1hbCdcblxuICAgICAgaXQgXCJzZWxlY3Qgd2hvbGUtd29yZCBhbmQgbGVhZGluZyB3aGl0ZSBzcGFjZSBpbiBjYXNlIHRyYWlsaW5nIHdoaXRlIHNwYWNlIHdhc24ndCB0aGVyZVwiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMTVdXG4gICAgICAgIGVuc3VyZSAnZCBhIHcnLFxuICAgICAgICAgIHRleHQ6IFwiMTIoNDUgYWInZGVcIlxuICAgICAgICAgIGN1cnNvcjogWzAsIDEwXVxuICAgICAgICAgIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiBcIiBBQkNERVwiXG5cbiAgICAgIGl0IFwic2VsZWN0cyBmcm9tIHRoZSBzdGFydCBvZiB0aGUgY3VycmVudCB3aG9sZSB3b3JkIHRvIHRoZSBzdGFydCBvZiB0aGUgbmV4dCB3aG9sZSB3b3JkIGluIHZpc3VhbCBtb2RlXCIsIC0+XG4gICAgICAgIGVuc3VyZSAndiBhIFcnLCBzZWxlY3RlZFNjcmVlblJhbmdlOiBbWzAsIDZdLCBbMCwgMTJdXVxuXG4gICAgICBpdCBcImRvZXNuJ3Qgc3BhbiBuZXdsaW5lc1wiLCAtPlxuICAgICAgICBzZXQgdGV4dDogXCIxMig0NVxcbmFiJ2RlIEFCQ0RFXCIsIGN1cnNvcjogWzAsIDRdXG4gICAgICAgIGVuc3VyZSAndiBhIFcnLCBzZWxlY3RlZEJ1ZmZlclJhbmdlOiBbWzAsIDBdLCBbMCwgNV1dXG5cbiAgZGVzY3JpYmUgXCJTdWJ3b3JkXCIsIC0+XG4gICAgZXNjYXBlID0gLT4ga2V5c3Ryb2tlKCdlc2NhcGUnKVxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIGF0b20ua2V5bWFwcy5hZGQgXCJ0ZXN0XCIsXG4gICAgICAgICdhdG9tLXRleHQtZWRpdG9yLnZpbS1tb2RlLXBsdXMub3BlcmF0b3ItcGVuZGluZy1tb2RlLCBhdG9tLXRleHQtZWRpdG9yLnZpbS1tb2RlLXBsdXMudmlzdWFsLW1vZGUnOlxuICAgICAgICAgICdhIHEnOiAndmltLW1vZGUtcGx1czphLXN1YndvcmQnXG4gICAgICAgICAgJ2kgcSc6ICd2aW0tbW9kZS1wbHVzOmlubmVyLXN1YndvcmQnXG5cbiAgICBkZXNjcmliZSBcImlubmVyLXN1YndvcmRcIiwgLT5cbiAgICAgIGl0IFwic2VsZWN0IHN1YndvcmRcIiwgLT5cbiAgICAgICAgc2V0IHRleHRDOiBcImNhbXxlbENhc2VcIjsgZW5zdXJlIFwidiBpIHFcIiwgc2VsZWN0ZWRUZXh0OiBcImNhbWVsXCI7IGVzY2FwZSgpXG4gICAgICAgIHNldCB0ZXh0QzogXCJjYW1lfGxDYXNlXCI7IGVuc3VyZSBcInYgaSBxXCIsIHNlbGVjdGVkVGV4dDogXCJjYW1lbFwiOyBlc2NhcGUoKVxuICAgICAgICBzZXQgdGV4dEM6IFwiY2FtZWx8Q2FzZVwiOyBlbnN1cmUgXCJ2IGkgcVwiLCBzZWxlY3RlZFRleHQ6IFwiQ2FzZVwiOyBlc2NhcGUoKVxuICAgICAgICBzZXQgdGV4dEM6IFwiY2FtZWxDYXN8ZVwiOyBlbnN1cmUgXCJ2IGkgcVwiLCBzZWxlY3RlZFRleHQ6IFwiQ2FzZVwiOyBlc2NhcGUoKVxuXG4gICAgICAgIHNldCB0ZXh0QzogXCJ8X3NuYWtlX19jYXNlX1wiOyBlbnN1cmUgXCJ2IGkgcVwiLCBzZWxlY3RlZFRleHQ6IFwiX3NuYWtlXCI7IGVzY2FwZSgpXG4gICAgICAgIHNldCB0ZXh0QzogXCJfc25ha3xlX19jYXNlX1wiOyBlbnN1cmUgXCJ2IGkgcVwiLCBzZWxlY3RlZFRleHQ6IFwiX3NuYWtlXCI7IGVzY2FwZSgpXG4gICAgICAgIHNldCB0ZXh0QzogXCJfc25ha2V8X19jYXNlX1wiOyBlbnN1cmUgXCJ2IGkgcVwiLCBzZWxlY3RlZFRleHQ6IFwiX19jYXNlXCI7IGVzY2FwZSgpXG4gICAgICAgIHNldCB0ZXh0QzogXCJfc25ha2VffF9jYXNlX1wiOyBlbnN1cmUgXCJ2IGkgcVwiLCBzZWxlY3RlZFRleHQ6IFwiX19jYXNlXCI7IGVzY2FwZSgpXG4gICAgICAgIHNldCB0ZXh0QzogXCJfc25ha2VfX2Nhc3xlX1wiOyBlbnN1cmUgXCJ2IGkgcVwiLCBzZWxlY3RlZFRleHQ6IFwiX19jYXNlXCI7IGVzY2FwZSgpXG4gICAgICAgIHNldCB0ZXh0QzogXCJfc25ha2VfX2Nhc2V8X1wiOyBlbnN1cmUgXCJ2IGkgcVwiLCBzZWxlY3RlZFRleHQ6IFwiX1wiOyBlc2NhcGUoKVxuXG4gICAgZGVzY3JpYmUgXCJhLXN1YndvcmRcIiwgLT5cbiAgICAgIGl0IFwic2VsZWN0IHN1YndvcmQgYW5kIHNwYWNlc1wiLCAtPlxuICAgICAgICBzZXQgdGV4dEM6IFwiY2FtZWxDYXxzZSAgTmV4dENhbWVsXCI7IGVuc3VyZSBcInYgYSBxXCIsIHNlbGVjdGVkVGV4dDogXCJDYXNlICBcIjsgZXNjYXBlKClcbiAgICAgICAgc2V0IHRleHRDOiBcImNhbWVsQ2FzZSAgTmV8eHRDYW1lbFwiOyBlbnN1cmUgXCJ2IGEgcVwiLCBzZWxlY3RlZFRleHQ6IFwiICBOZXh0XCI7IGVzY2FwZSgpXG4gICAgICAgIHNldCB0ZXh0QzogXCJzbmFrZV9jfGFzZSAgbmV4dF9zbmFrZVwiOyBlbnN1cmUgXCJ2IGEgcVwiLCBzZWxlY3RlZFRleHQ6IFwiX2Nhc2UgIFwiOyBlc2NhcGUoKVxuICAgICAgICBzZXQgdGV4dEM6IFwic25ha2VfY2FzZSAgbmV8eHRfc25ha2VcIjsgZW5zdXJlIFwidiBhIHFcIiwgc2VsZWN0ZWRUZXh0OiBcIiAgbmV4dFwiOyBlc2NhcGUoKVxuXG4gIGRlc2NyaWJlIFwiQW55UGFpclwiLCAtPlxuICAgIHtzaW1wbGVUZXh0LCBjb21wbGV4VGV4dH0gPSB7fVxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNpbXBsZVRleHQgPSBcIlwiXCJcbiAgICAgICAgLi4uLiBcImFiY1wiIC4uLi5cbiAgICAgICAgLi4uLiAnYWJjJyAuLi4uXG4gICAgICAgIC4uLi4gYGFiY2AgLi4uLlxuICAgICAgICAuLi4uIHthYmN9IC4uLi5cbiAgICAgICAgLi4uLiA8YWJjPiAuLi4uXG4gICAgICAgIC4uLi4gW2FiY10gLi4uLlxuICAgICAgICAuLi4uIChhYmMpIC4uLi5cbiAgICAgICAgXCJcIlwiXG4gICAgICBjb21wbGV4VGV4dCA9IFwiXCJcIlxuICAgICAgICBbNHNcbiAgICAgICAgLS17M3NcbiAgICAgICAgLS0tLVwiMnMoMXMtMWUpMmVcIlxuICAgICAgICAtLS0zZX0tNGVcbiAgICAgICAgXVxuICAgICAgICBcIlwiXCJcbiAgICAgIHNldFxuICAgICAgICB0ZXh0OiBzaW1wbGVUZXh0XG4gICAgICAgIGN1cnNvcjogWzAsIDddXG4gICAgZGVzY3JpYmUgXCJpbm5lci1hbnktcGFpclwiLCAtPlxuICAgICAgaXQgXCJhcHBsaWVzIG9wZXJhdG9ycyBhbnkgaW5uZXItcGFpciBhbmQgcmVwZWF0YWJsZVwiLCAtPlxuICAgICAgICBlbnN1cmUgJ2QgaSBzJyxcbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIC4uLi4gXCJcIiAuLi4uXG4gICAgICAgICAgICAuLi4uICdhYmMnIC4uLi5cbiAgICAgICAgICAgIC4uLi4gYGFiY2AgLi4uLlxuICAgICAgICAgICAgLi4uLiB7YWJjfSAuLi4uXG4gICAgICAgICAgICAuLi4uIDxhYmM+IC4uLi5cbiAgICAgICAgICAgIC4uLi4gW2FiY10gLi4uLlxuICAgICAgICAgICAgLi4uLiAoYWJjKSAuLi4uXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgZW5zdXJlICdqIC4gaiAuIGogLiBqIC4gaiAuIGogLiBqIC4nLFxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgLi4uLiBcIlwiIC4uLi5cbiAgICAgICAgICAgIC4uLi4gJycgLi4uLlxuICAgICAgICAgICAgLi4uLiBgYCAuLi4uXG4gICAgICAgICAgICAuLi4uIHt9IC4uLi5cbiAgICAgICAgICAgIC4uLi4gPD4gLi4uLlxuICAgICAgICAgICAgLi4uLiBbXSAuLi4uXG4gICAgICAgICAgICAuLi4uICgpIC4uLi5cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgaXQgXCJjYW4gZXhwYW5kIHNlbGVjdGlvblwiLCAtPlxuICAgICAgICBzZXQgdGV4dDogY29tcGxleFRleHQsIGN1cnNvcjogWzIsIDhdXG4gICAgICAgIGtleXN0cm9rZSAndidcbiAgICAgICAgZW5zdXJlICdpIHMnLCBzZWxlY3RlZFRleHQ6IFwiXCJcIjFzLTFlXCJcIlwiXG4gICAgICAgIGVuc3VyZSAnaSBzJywgc2VsZWN0ZWRUZXh0OiBcIlwiXCIycygxcy0xZSkyZVwiXCJcIlxuICAgICAgICBlbnN1cmUgJ2kgcycsIHNlbGVjdGVkVGV4dDogXCJcIlwiM3NcXG4tLS0tXCIycygxcy0xZSkyZVwiXFxuLS0tM2VcIlwiXCJcbiAgICAgICAgZW5zdXJlICdpIHMnLCBzZWxlY3RlZFRleHQ6IFwiXCJcIjRzXFxuLS17M3NcXG4tLS0tXCIycygxcy0xZSkyZVwiXFxuLS0tM2V9LTRlXCJcIlwiXG4gICAgZGVzY3JpYmUgXCJhLWFueS1wYWlyXCIsIC0+XG4gICAgICBpdCBcImFwcGxpZXMgb3BlcmF0b3JzIGFueSBhLXBhaXIgYW5kIHJlcGVhdGFibGVcIiwgLT5cbiAgICAgICAgZW5zdXJlICdkIGEgcycsXG4gICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICAuLi4uICAuLi4uXG4gICAgICAgICAgICAuLi4uICdhYmMnIC4uLi5cbiAgICAgICAgICAgIC4uLi4gYGFiY2AgLi4uLlxuICAgICAgICAgICAgLi4uLiB7YWJjfSAuLi4uXG4gICAgICAgICAgICAuLi4uIDxhYmM+IC4uLi5cbiAgICAgICAgICAgIC4uLi4gW2FiY10gLi4uLlxuICAgICAgICAgICAgLi4uLiAoYWJjKSAuLi4uXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgZW5zdXJlICdqIC4gaiAuIGogLiBqIC4gaiAuIGogLiBqIC4nLFxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgLi4uLiAgLi4uLlxuICAgICAgICAgICAgLi4uLiAgLi4uLlxuICAgICAgICAgICAgLi4uLiAgLi4uLlxuICAgICAgICAgICAgLi4uLiAgLi4uLlxuICAgICAgICAgICAgLi4uLiAgLi4uLlxuICAgICAgICAgICAgLi4uLiAgLi4uLlxuICAgICAgICAgICAgLi4uLiAgLi4uLlxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICBpdCBcImNhbiBleHBhbmQgc2VsZWN0aW9uXCIsIC0+XG4gICAgICAgIHNldCB0ZXh0OiBjb21wbGV4VGV4dCwgY3Vyc29yOiBbMiwgOF1cbiAgICAgICAga2V5c3Ryb2tlICd2J1xuICAgICAgICBlbnN1cmUgJ2EgcycsIHNlbGVjdGVkVGV4dDogXCJcIlwiKDFzLTFlKVwiXCJcIlxuICAgICAgICBlbnN1cmUgJ2EgcycsIHNlbGVjdGVkVGV4dDogXCJcIlwiXFxcIjJzKDFzLTFlKTJlXFxcIlwiXCJcIlxuICAgICAgICBlbnN1cmUgJ2EgcycsIHNlbGVjdGVkVGV4dDogXCJcIlwiezNzXFxuLS0tLVwiMnMoMXMtMWUpMmVcIlxcbi0tLTNlfVwiXCJcIlxuICAgICAgICBlbnN1cmUgJ2EgcycsIHNlbGVjdGVkVGV4dDogXCJcIlwiWzRzXFxuLS17M3NcXG4tLS0tXCIycygxcy0xZSkyZVwiXFxuLS0tM2V9LTRlXFxuXVwiXCJcIlxuXG4gIGRlc2NyaWJlIFwiQW55UXVvdGVcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXRcbiAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgIC0tXCJhYmNcIiBgZGVmYCAgJ2VmZyctLVxuICAgICAgICBcIlwiXCJcbiAgICAgICAgY3Vyc29yOiBbMCwgMF1cbiAgICBkZXNjcmliZSBcImlubmVyLWFueS1xdW90ZVwiLCAtPlxuICAgICAgaXQgXCJhcHBsaWVzIG9wZXJhdG9ycyBhbnkgaW5uZXItcGFpciBhbmQgcmVwZWF0YWJsZVwiLCAtPlxuICAgICAgICBlbnN1cmUgJ2QgaSBxJywgdGV4dDogXCJcIlwiLS1cIlwiIGBkZWZgICAnZWZnJy0tXCJcIlwiXG4gICAgICAgIGVuc3VyZSAnLicsIHRleHQ6IFwiXCJcIi0tXCJcIiBgYCAgJ2VmZyctLVwiXCJcIlxuICAgICAgICBlbnN1cmUgJy4nLCB0ZXh0OiBcIlwiXCItLVwiXCIgYGAgICcnLS1cIlwiXCJcbiAgICAgIGl0IFwiY2FuIHNlbGVjdCBuZXh0IHF1b3RlXCIsIC0+XG4gICAgICAgIGtleXN0cm9rZSAndidcbiAgICAgICAgZW5zdXJlICdpIHEnLCBzZWxlY3RlZFRleHQ6ICdhYmMnXG4gICAgICAgIGVuc3VyZSAnaSBxJywgc2VsZWN0ZWRUZXh0OiAnZGVmJ1xuICAgICAgICBlbnN1cmUgJ2kgcScsIHNlbGVjdGVkVGV4dDogJ2VmZydcbiAgICBkZXNjcmliZSBcImEtYW55LXF1b3RlXCIsIC0+XG4gICAgICBpdCBcImFwcGxpZXMgb3BlcmF0b3JzIGFueSBhLXF1b3RlIGFuZCByZXBlYXRhYmxlXCIsIC0+XG4gICAgICAgIGVuc3VyZSAnZCBhIHEnLCB0ZXh0OiBcIlwiXCItLSBgZGVmYCAgJ2VmZyctLVwiXCJcIlxuICAgICAgICBlbnN1cmUgJy4nICAsIHRleHQ6IFwiXCJcIi0tICAgJ2VmZyctLVwiXCJcIlxuICAgICAgICBlbnN1cmUgJy4nICAsIHRleHQ6IFwiXCJcIi0tICAgLS1cIlwiXCJcbiAgICAgIGl0IFwiY2FuIHNlbGVjdCBuZXh0IHF1b3RlXCIsIC0+XG4gICAgICAgIGtleXN0cm9rZSAndidcbiAgICAgICAgZW5zdXJlICdhIHEnLCBzZWxlY3RlZFRleHQ6ICdcImFiY1wiJ1xuICAgICAgICBlbnN1cmUgJ2EgcScsIHNlbGVjdGVkVGV4dDogJ2BkZWZgJ1xuICAgICAgICBlbnN1cmUgJ2EgcScsIHNlbGVjdGVkVGV4dDogXCInZWZnJ1wiXG5cbiAgZGVzY3JpYmUgXCJEb3VibGVRdW90ZVwiLCAtPlxuICAgIGRlc2NyaWJlIFwiaXNzdWUtNjM1IG5ldyBiZWhhdmlvciBvZiBpbm5lci1kb3VibGUtcXVvdGVcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgYXRvbS5rZXltYXBzLmFkZCBcInRlc3RcIixcbiAgICAgICAgICAnYXRvbS10ZXh0LWVkaXRvci52aW0tbW9kZS1wbHVzOm5vdCguaW5zZXJ0LW1vZGUpJzpcbiAgICAgICAgICAgICdnIHInOiAndmltLW1vZGUtcGx1czpyZXBsYWNlJ1xuXG4gICAgICBkZXNjcmliZSBcInF1b3RlIGlzIHVuLWJhbGFuY2VkXCIsIC0+XG4gICAgICAgIGl0IFwiY2FzZTFcIiwgLT5cbiAgICAgICAgICBzZXQgICAgICAgICAgICAgICAgIHRleHRDXzogJ198X1wiX19fX1wiX19fX1wiJ1xuICAgICAgICAgIGVuc3VyZSAnZyByIGkgXCIgKycsIHRleHRDXzogJ19fXCJ8KysrK1wiX19fX1wiJ1xuICAgICAgICBpdCBcImNhc2UyXCIsIC0+XG4gICAgICAgICAgc2V0ICAgICAgICAgICAgICAgICB0ZXh0Q186ICdfX1wiX198X19cIl9fX19cIidcbiAgICAgICAgICBlbnN1cmUgJ2cgciBpIFwiICsnLCB0ZXh0Q186ICdfX1wifCsrKytcIl9fX19cIidcbiAgICAgICAgaXQgXCJjYXNlM1wiLCAtPlxuICAgICAgICAgIHNldCAgICAgICAgICAgICAgICAgdGV4dENfOiAnX19cIl9fX19cIl9ffF9fXCInXG4gICAgICAgICAgZW5zdXJlICdnIHIgaSBcIiArJywgdGV4dENfOiAnX19cIl9fX19cInwrKysrXCInXG4gICAgICAgIGl0IFwiY2FzZTRcIiwgLT5cbiAgICAgICAgICBzZXQgICAgICAgICAgICAgICAgIHRleHRDXzogJ19ffFwiX19fX1wiX19fX1wiJ1xuICAgICAgICAgIGVuc3VyZSAnZyByIGkgXCIgKycsIHRleHRDXzogJ19fXCJ8KysrK1wiX19fX1wiJ1xuICAgICAgICBpdCBcImNhc2U1XCIsIC0+XG4gICAgICAgICAgc2V0ICAgICAgICAgICAgICAgICB0ZXh0Q186ICdfX1wiX19fX3xcIl9fX19cIidcbiAgICAgICAgICBlbnN1cmUgJ2cgciBpIFwiICsnLCB0ZXh0Q186ICdfX1wifCsrKytcIl9fX19cIidcbiAgICAgICAgaXQgXCJjYXNlNlwiLCAtPlxuICAgICAgICAgIHNldCAgICAgICAgICAgICAgICAgdGV4dENfOiAnX19cIl9fX19cIl9fX198XCInXG4gICAgICAgICAgZW5zdXJlICdnIHIgaSBcIiArJywgdGV4dENfOiAnX19cIl9fX19cInwrKysrXCInXG5cbiAgICAgIGRlc2NyaWJlIFwicXVvdGUgaXMgYmFsYW5jZWRcIiwgLT5cbiAgICAgICAgaXQgXCJjYXNlMVwiLCAtPlxuICAgICAgICAgIHNldCAgICAgICAgICAgICAgICAgdGV4dENfOiAnX3xfXCI9PT09XCJfX19fXCI9PT1cIidcbiAgICAgICAgICBlbnN1cmUgJ2cgciBpIFwiICsnLCB0ZXh0Q186ICdfX1wifCsrKytcIl9fX19cIj09PVwiJ1xuICAgICAgICBpdCBcImNhc2UyXCIsIC0+XG4gICAgICAgICAgc2V0ICAgICAgICAgICAgICAgICB0ZXh0Q186ICdfX1wiPT18PT1cIl9fX19cIj09PVwiJ1xuICAgICAgICAgIGVuc3VyZSAnZyByIGkgXCIgKycsIHRleHRDXzogJ19fXCJ8KysrK1wiX19fX1wiPT09XCInXG4gICAgICAgIGl0IFwiY2FzZTNcIiwgLT5cbiAgICAgICAgICBzZXQgICAgICAgICAgICAgICAgIHRleHRDXzogJ19fXCI9PT09XCJfX3xfX1wiPT09XCInXG4gICAgICAgICAgZW5zdXJlICdnIHIgaSBcIiArJywgdGV4dENfOiAnX19cIj09PT1cInwrKysrXCI9PT1cIidcbiAgICAgICAgaXQgXCJjYXNlNFwiLCAtPlxuICAgICAgICAgIHNldCAgICAgICAgICAgICAgICAgdGV4dENfOiAnX19cIj09PT1cIl9fX19cIj18PT1cIidcbiAgICAgICAgICBlbnN1cmUgJ2cgciBpIFwiICsnLCB0ZXh0Q186ICdfX1wiPT09PVwiX19fX1wifCsrK1wiJ1xuICAgICAgICBpdCBcImNhc2U1XCIsIC0+XG4gICAgICAgICAgc2V0ICAgICAgICAgICAgICAgICB0ZXh0Q186ICdfX3xcIj09PT1cIl9fX19cIj09PVwiJ1xuICAgICAgICAgIGVuc3VyZSAnZyByIGkgXCIgKycsIHRleHRDXzogJ19fXCJ8KysrK1wiX19fX1wiPT09XCInXG4gICAgICAgIGl0IFwiY2FzZTZcIiwgLT5cbiAgICAgICAgICBzZXQgICAgICAgICAgICAgICAgIHRleHRDXzogJ19fXCI9PT09fFwiX19fX1wiPT09XCInXG4gICAgICAgICAgZW5zdXJlICdnIHIgaSBcIiArJywgdGV4dENfOiAnX19cInwrKysrXCJfX19fXCI9PT1cIidcbiAgICAgICAgaXQgXCJjYXNlN1wiLCAtPlxuICAgICAgICAgIHNldCAgICAgICAgICAgICAgICAgdGV4dENfOiAnX19cIj09PT1cIl9fX198XCI9PT1cIidcbiAgICAgICAgICBlbnN1cmUgJ2cgciBpIFwiICsnLCB0ZXh0Q186ICdfX1wiPT09PVwiX19fX1wifCsrK1wiJ1xuXG4gICAgZGVzY3JpYmUgXCJpbm5lci1kb3VibGUtcXVvdGVcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dDogJ1wiIHNvbWV0aGluZyBpbiBoZXJlIGFuZCBpbiBcImhlcmVcIiBcIiBhbmQgb3ZlciBoZXJlJ1xuICAgICAgICAgIGN1cnNvcjogWzAsIDldXG5cbiAgICAgIGl0IFwiYXBwbGllcyBvcGVyYXRvcnMgaW5zaWRlIHRoZSBjdXJyZW50IHN0cmluZyBpbiBvcGVyYXRvci1wZW5kaW5nIG1vZGVcIiwgLT5cbiAgICAgICAgZW5zdXJlICdkIGkgXCInLFxuICAgICAgICAgIHRleHQ6ICdcIlwiaGVyZVwiIFwiIGFuZCBvdmVyIGhlcmUnXG4gICAgICAgICAgY3Vyc29yOiBbMCwgMV1cblxuICAgICAgaXQgXCJhcHBsaWVzIG9wZXJhdG9ycyBpbnNpZGUgdGhlIGN1cnJlbnQgc3RyaW5nIGluIG9wZXJhdG9yLXBlbmRpbmcgbW9kZVwiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMjldXG4gICAgICAgIGVuc3VyZSAnZCBpIFwiJyxcbiAgICAgICAgICB0ZXh0OiAnXCIgc29tZXRoaW5nIGluIGhlcmUgYW5kIGluIFwiXCIgXCIgYW5kIG92ZXIgaGVyZSdcbiAgICAgICAgICBjdXJzb3I6IFswLCAyOF1cblxuICAgICAgaXQgXCJtYWtlcyBubyBjaGFuZ2UgaWYgcGFzdCB0aGUgbGFzdCBzdHJpbmcgb24gYSBsaW5lXCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFswLCAzOV1cbiAgICAgICAgZW5zdXJlICdkIGkgXCInLFxuICAgICAgICAgIHRleHQ6ICdcIiBzb21ldGhpbmcgaW4gaGVyZSBhbmQgaW4gXCJoZXJlXCIgXCIgYW5kIG92ZXIgaGVyZSdcbiAgICAgICAgICBjdXJzb3I6IFswLCAzOV1cblxuICAgICAgZGVzY3JpYmUgXCJjdXJzb3IgaXMgb24gdGhlIHBhaXIgY2hhclwiLCAtPlxuICAgICAgICBjaGVjayA9IGdldENoZWNrRnVuY3Rpb25Gb3IoJ2kgXCInKVxuICAgICAgICB0ZXh0ID0gJy1cIitcIi0nXG4gICAgICAgIHRleHRGaW5hbCA9ICctXCJcIi0nXG4gICAgICAgIHNlbGVjdGVkVGV4dCA9ICcrJ1xuICAgICAgICBvcGVuID0gWzAsIDFdXG4gICAgICAgIGNsb3NlID0gWzAsIDNdXG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBzZXQge3RleHR9XG4gICAgICAgIGl0IFwiY2FzZS0xIG5vcm1hbFwiLCAtPiBjaGVjayBvcGVuLCAnZCcsIHRleHQ6IHRleHRGaW5hbCwgY3Vyc29yOiBbMCwgMl1cbiAgICAgICAgaXQgXCJjYXNlLTIgbm9ybWFsXCIsIC0+IGNoZWNrIGNsb3NlLCAnZCcsIHRleHQ6IHRleHRGaW5hbCwgY3Vyc29yOiBbMCwgMl1cbiAgICAgICAgaXQgXCJjYXNlLTMgdmlzdWFsXCIsIC0+IGNoZWNrIG9wZW4sICd2Jywge3NlbGVjdGVkVGV4dH1cbiAgICAgICAgaXQgXCJjYXNlLTQgdmlzdWFsXCIsIC0+IGNoZWNrIGNsb3NlLCAndicsIHtzZWxlY3RlZFRleHR9XG4gICAgZGVzY3JpYmUgXCJhLWRvdWJsZS1xdW90ZVwiLCAtPlxuICAgICAgb3JpZ2luYWxUZXh0ID0gJ1wiIHNvbWV0aGluZyBpbiBoZXJlIGFuZCBpbiBcImhlcmVcIiBcIidcbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0IHRleHQ6IG9yaWdpbmFsVGV4dCwgY3Vyc29yOiBbMCwgOV1cblxuICAgICAgaXQgXCJhcHBsaWVzIG9wZXJhdG9ycyBhcm91bmQgdGhlIGN1cnJlbnQgZG91YmxlIHF1b3RlcyBpbiBvcGVyYXRvci1wZW5kaW5nIG1vZGVcIiwgLT5cbiAgICAgICAgZW5zdXJlICdkIGEgXCInLFxuICAgICAgICAgIHRleHQ6ICdoZXJlXCIgXCInXG4gICAgICAgICAgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgICBtb2RlOiAnbm9ybWFsJ1xuXG4gICAgICBpdCBcImRlbGV0ZSBhLWRvdWJsZS1xdW90ZVwiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMjldXG4gICAgICAgIGVuc3VyZSAnZCBhIFwiJyxcbiAgICAgICAgICB0ZXh0OiAnXCIgc29tZXRoaW5nIGluIGhlcmUgYW5kIGluICBcIidcbiAgICAgICAgICBjdXJzb3I6IFswLCAyN11cbiAgICAgICAgICBtb2RlOiAnbm9ybWFsJ1xuICAgICAgZGVzY3JpYmUgXCJjdXJzb3IgaXMgb24gdGhlIHBhaXIgY2hhclwiLCAtPlxuICAgICAgICBjaGVjayA9IGdldENoZWNrRnVuY3Rpb25Gb3IoJ2EgXCInKVxuICAgICAgICB0ZXh0ID0gJy1cIitcIi0nXG4gICAgICAgIHRleHRGaW5hbCA9ICctLSdcbiAgICAgICAgc2VsZWN0ZWRUZXh0ID0gJ1wiK1wiJ1xuICAgICAgICBvcGVuID0gWzAsIDFdXG4gICAgICAgIGNsb3NlID0gWzAsIDNdXG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBzZXQge3RleHR9XG4gICAgICAgIGl0IFwiY2FzZS0xIG5vcm1hbFwiLCAtPiBjaGVjayBvcGVuLCAnZCcsIHRleHQ6IHRleHRGaW5hbCwgY3Vyc29yOiBbMCwgMV1cbiAgICAgICAgaXQgXCJjYXNlLTIgbm9ybWFsXCIsIC0+IGNoZWNrIGNsb3NlLCAnZCcsIHRleHQ6IHRleHRGaW5hbCwgY3Vyc29yOiBbMCwgMV1cbiAgICAgICAgaXQgXCJjYXNlLTMgdmlzdWFsXCIsIC0+IGNoZWNrIG9wZW4sICd2Jywge3NlbGVjdGVkVGV4dH1cbiAgICAgICAgaXQgXCJjYXNlLTQgdmlzdWFsXCIsIC0+IGNoZWNrIGNsb3NlLCAndicsIHtzZWxlY3RlZFRleHR9XG4gIGRlc2NyaWJlIFwiU2luZ2xlUXVvdGVcIiwgLT5cbiAgICBkZXNjcmliZSBcImlubmVyLXNpbmdsZS1xdW90ZVwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0OiBcIicgc29tZXRoaW5nIGluIGhlcmUgYW5kIGluICdoZXJlJyAnIGFuZCBvdmVyIGhlcmVcIlxuICAgICAgICAgIGN1cnNvcjogWzAsIDldXG5cbiAgICAgIGRlc2NyaWJlIFwiZG9uJ3QgdHJlYXQgbGl0ZXJhbCBiYWNrc2xhc2goZG91YmxlIGJhY2tzbGFzaCkgYXMgZXNjYXBlIGNoYXJcIiwgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIHNldFxuICAgICAgICAgICAgdGV4dDogXCInc29tZS1rZXktaGVyZVxcXFxcXFxcJzogJ2hlcmUtaXMtdGhlLXZhbCdcIlxuICAgICAgICBpdCBcImNhc2UtMVwiLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFswLCAyXVxuICAgICAgICAgIGVuc3VyZSBcImQgaSAnXCIsXG4gICAgICAgICAgICB0ZXh0OiBcIicnOiAnaGVyZS1pcy10aGUtdmFsJ1wiXG4gICAgICAgICAgICBjdXJzb3I6IFswLCAxXVxuXG4gICAgICAgIGl0IFwiY2FzZS0yXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzAsIDE5XVxuICAgICAgICAgIGVuc3VyZSBcImQgaSAnXCIsXG4gICAgICAgICAgICB0ZXh0OiBcIidzb21lLWtleS1oZXJlXFxcXFxcXFwnOiAnJ1wiXG4gICAgICAgICAgICBjdXJzb3I6IFswLCAyMF1cblxuICAgICAgZGVzY3JpYmUgXCJ0cmVhdCBiYWNrc2xhc2goc2luZ2xlIGJhY2tzbGFzaCkgYXMgZXNjYXBlIGNoYXJcIiwgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIHNldFxuICAgICAgICAgICAgdGV4dDogXCInc29tZS1rZXktaGVyZVxcXFwnJzogJ2hlcmUtaXMtdGhlLXZhbCdcIlxuXG4gICAgICAgIGl0IFwiY2FzZS0xXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzAsIDJdXG4gICAgICAgICAgZW5zdXJlIFwiZCBpICdcIixcbiAgICAgICAgICAgIHRleHQ6IFwiJyc6ICdoZXJlLWlzLXRoZS12YWwnXCJcbiAgICAgICAgICAgIGN1cnNvcjogWzAsIDFdXG4gICAgICAgIGl0IFwiY2FzZS0yXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzAsIDE3XVxuICAgICAgICAgIGVuc3VyZSBcImQgaSAnXCIsXG4gICAgICAgICAgICB0ZXh0OiBcIidzb21lLWtleS1oZXJlXFxcXCcnJ2hlcmUtaXMtdGhlLXZhbCdcIlxuICAgICAgICAgICAgY3Vyc29yOiBbMCwgMTddXG5cbiAgICAgIGl0IFwiYXBwbGllcyBvcGVyYXRvcnMgaW5zaWRlIHRoZSBjdXJyZW50IHN0cmluZyBpbiBvcGVyYXRvci1wZW5kaW5nIG1vZGVcIiwgLT5cbiAgICAgICAgZW5zdXJlIFwiZCBpICdcIixcbiAgICAgICAgICB0ZXh0OiBcIicnaGVyZScgJyBhbmQgb3ZlciBoZXJlXCJcbiAgICAgICAgICBjdXJzb3I6IFswLCAxXVxuXG4gICAgICAjIFtOT1RFXVxuICAgICAgIyBJIGRvbid0IGxpa2Ugb3JpZ2luYWwgYmVoYXZpb3IsIHRoaXMgaXMgY291bnRlciBpbnR1aXRpdmUuXG4gICAgICAjIFNpbXBseSBzZWxlY3RpbmcgYXJlYSBiZXR3ZWVuIHF1b3RlIGlzIHRoYXQgbm9ybWFsIHVzZXIgZXhwZWN0cy5cbiAgICAgICMgaXQgXCJhcHBsaWVzIG9wZXJhdG9ycyBpbnNpZGUgdGhlIG5leHQgc3RyaW5nIGluIG9wZXJhdG9yLXBlbmRpbmcgbW9kZSAoaWYgbm90IGluIGEgc3RyaW5nKVwiLCAtPlxuICAgICAgIyA9PiBSZXZlcnRlZCB0byBvcmlnaW5hbCBiZWhhdmlvciwgYnV0IG5lZWQgY2FyZWZ1bCBjb25zaWRlcmF0aW9uIHdoYXQgaXMgYmVzdC5cblxuICAgICAgIyBpdCBcIltDaGFuZ2VkIGJlaGF2aW9yXSBhcHBsaWVzIG9wZXJhdG9ycyBpbnNpZGUgYXJlYSBiZXR3ZWVuIHF1b3RlXCIsIC0+XG4gICAgICBpdCBcImFwcGxpZXMgb3BlcmF0b3JzIGluc2lkZSB0aGUgbmV4dCBzdHJpbmcgaW4gb3BlcmF0b3ItcGVuZGluZyBtb2RlIChpZiBub3QgaW4gYSBzdHJpbmcpXCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFswLCAyNl1cbiAgICAgICAgZW5zdXJlIFwiZCBpICdcIixcbiAgICAgICAgICB0ZXh0OiBcIicnaGVyZScgJyBhbmQgb3ZlciBoZXJlXCJcbiAgICAgICAgICBjdXJzb3I6IFswLCAxXVxuXG4gICAgICBpdCBcIm1ha2VzIG5vIGNoYW5nZSBpZiBwYXN0IHRoZSBsYXN0IHN0cmluZyBvbiBhIGxpbmVcIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzAsIDM5XVxuICAgICAgICBlbnN1cmUgXCJkIGkgJ1wiLFxuICAgICAgICAgIHRleHQ6IFwiJyBzb21ldGhpbmcgaW4gaGVyZSBhbmQgaW4gJ2hlcmUnICcgYW5kIG92ZXIgaGVyZVwiXG4gICAgICAgICAgY3Vyc29yOiBbMCwgMzldXG4gICAgICBkZXNjcmliZSBcImN1cnNvciBpcyBvbiB0aGUgcGFpciBjaGFyXCIsIC0+XG4gICAgICAgIGNoZWNrID0gZ2V0Q2hlY2tGdW5jdGlvbkZvcihcImkgJ1wiKVxuICAgICAgICB0ZXh0ID0gXCItJysnLVwiXG4gICAgICAgIHRleHRGaW5hbCA9IFwiLScnLVwiXG4gICAgICAgIHNlbGVjdGVkVGV4dCA9ICcrJ1xuICAgICAgICBvcGVuID0gWzAsIDFdXG4gICAgICAgIGNsb3NlID0gWzAsIDNdXG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBzZXQge3RleHR9XG4gICAgICAgIGl0IFwiY2FzZS0xIG5vcm1hbFwiLCAtPiBjaGVjayBvcGVuLCAnZCcsIHRleHQ6IHRleHRGaW5hbCwgY3Vyc29yOiBbMCwgMl1cbiAgICAgICAgaXQgXCJjYXNlLTIgbm9ybWFsXCIsIC0+IGNoZWNrIGNsb3NlLCAnZCcsIHRleHQ6IHRleHRGaW5hbCwgY3Vyc29yOiBbMCwgMl1cbiAgICAgICAgaXQgXCJjYXNlLTMgdmlzdWFsXCIsIC0+IGNoZWNrIG9wZW4sICd2Jywge3NlbGVjdGVkVGV4dH1cbiAgICAgICAgaXQgXCJjYXNlLTQgdmlzdWFsXCIsIC0+IGNoZWNrIGNsb3NlLCAndicsIHtzZWxlY3RlZFRleHR9XG4gICAgZGVzY3JpYmUgXCJhLXNpbmdsZS1xdW90ZVwiLCAtPlxuICAgICAgb3JpZ2luYWxUZXh0ID0gXCInIHNvbWV0aGluZyBpbiBoZXJlIGFuZCBpbiAnaGVyZScgJ1wiXG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldCB0ZXh0OiBvcmlnaW5hbFRleHQsIGN1cnNvcjogWzAsIDldXG5cbiAgICAgIGl0IFwiYXBwbGllcyBvcGVyYXRvcnMgYXJvdW5kIHRoZSBjdXJyZW50IHNpbmdsZSBxdW90ZXMgaW4gb3BlcmF0b3ItcGVuZGluZyBtb2RlXCIsIC0+XG4gICAgICAgIGVuc3VyZSBcImQgYSAnXCIsXG4gICAgICAgICAgdGV4dDogXCJoZXJlJyAnXCJcbiAgICAgICAgICBjdXJzb3I6IFswLCAwXVxuICAgICAgICAgIG1vZGU6ICdub3JtYWwnXG5cbiAgICAgIGl0IFwiYXBwbGllcyBvcGVyYXRvcnMgaW5zaWRlIHRoZSBuZXh0IHN0cmluZyBpbiBvcGVyYXRvci1wZW5kaW5nIG1vZGUgKGlmIG5vdCBpbiBhIHN0cmluZylcIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzAsIDI5XVxuICAgICAgICBlbnN1cmUgXCJkIGEgJ1wiLFxuICAgICAgICAgIHRleHQ6IFwiJyBzb21ldGhpbmcgaW4gaGVyZSBhbmQgaW4gICdcIlxuICAgICAgICAgIGN1cnNvcjogWzAsIDI3XVxuICAgICAgICAgIG1vZGU6ICdub3JtYWwnXG4gICAgICBkZXNjcmliZSBcImN1cnNvciBpcyBvbiB0aGUgcGFpciBjaGFyXCIsIC0+XG4gICAgICAgIGNoZWNrID0gZ2V0Q2hlY2tGdW5jdGlvbkZvcihcImEgJ1wiKVxuICAgICAgICB0ZXh0ID0gXCItJysnLVwiXG4gICAgICAgIHRleHRGaW5hbCA9IFwiLS1cIlxuICAgICAgICBzZWxlY3RlZFRleHQgPSBcIicrJ1wiXG4gICAgICAgIG9wZW4gPSBbMCwgMV1cbiAgICAgICAgY2xvc2UgPSBbMCwgM11cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIHNldCB7dGV4dH1cbiAgICAgICAgaXQgXCJjYXNlLTEgbm9ybWFsXCIsIC0+IGNoZWNrIG9wZW4sICdkJywgdGV4dDogdGV4dEZpbmFsLCBjdXJzb3I6IFswLCAxXVxuICAgICAgICBpdCBcImNhc2UtMiBub3JtYWxcIiwgLT4gY2hlY2sgY2xvc2UsICdkJywgdGV4dDogdGV4dEZpbmFsLCBjdXJzb3I6IFswLCAxXVxuICAgICAgICBpdCBcImNhc2UtMyB2aXN1YWxcIiwgLT4gY2hlY2sgb3BlbiwgJ3YnLCB7c2VsZWN0ZWRUZXh0fVxuICAgICAgICBpdCBcImNhc2UtNCB2aXN1YWxcIiwgLT4gY2hlY2sgY2xvc2UsICd2Jywge3NlbGVjdGVkVGV4dH1cbiAgZGVzY3JpYmUgXCJCYWNrVGlja1wiLCAtPlxuICAgIG9yaWdpbmFsVGV4dCA9IFwidGhpcyBpcyBgc2FtcGxlYCB0ZXh0LlwiXG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2V0IHRleHQ6IG9yaWdpbmFsVGV4dCwgY3Vyc29yOiBbMCwgOV1cblxuICAgIGRlc2NyaWJlIFwiaW5uZXItYmFjay10aWNrXCIsIC0+XG4gICAgICBpdCBcImFwcGxpZXMgb3BlcmF0b3JzIGlubmVyLWFyZWFcIiwgLT5cbiAgICAgICAgZW5zdXJlIFwiZCBpIGBcIiwgdGV4dDogXCJ0aGlzIGlzIGBgIHRleHQuXCIsIGN1cnNvcjogWzAsIDldXG5cbiAgICAgIGl0IFwiZG8gbm90aGluZyB3aGVuIHBhaXIgcmFuZ2UgaXMgbm90IHVuZGVyIGN1cnNvclwiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMTZdXG4gICAgICAgIGVuc3VyZSBcImQgaSBgXCIsIHRleHQ6IG9yaWdpbmFsVGV4dCwgY3Vyc29yOiBbMCwgMTZdXG4gICAgICBkZXNjcmliZSBcImN1cnNvciBpcyBvbiB0aGUgcGFpciBjaGFyXCIsIC0+XG4gICAgICAgIGNoZWNrID0gZ2V0Q2hlY2tGdW5jdGlvbkZvcignaSBgJylcbiAgICAgICAgdGV4dCA9ICctYCtgLSdcbiAgICAgICAgdGV4dEZpbmFsID0gJy1gYC0nXG4gICAgICAgIHNlbGVjdGVkVGV4dCA9ICcrJ1xuICAgICAgICBvcGVuID0gWzAsIDFdXG4gICAgICAgIGNsb3NlID0gWzAsIDNdXG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBzZXQge3RleHR9XG4gICAgICAgIGl0IFwiY2FzZS0xIG5vcm1hbFwiLCAtPiBjaGVjayBvcGVuLCAnZCcsIHRleHQ6IHRleHRGaW5hbCwgY3Vyc29yOiBbMCwgMl1cbiAgICAgICAgaXQgXCJjYXNlLTIgbm9ybWFsXCIsIC0+IGNoZWNrIGNsb3NlLCAnZCcsIHRleHQ6IHRleHRGaW5hbCwgY3Vyc29yOiBbMCwgMl1cbiAgICAgICAgaXQgXCJjYXNlLTMgdmlzdWFsXCIsIC0+IGNoZWNrIG9wZW4sICd2Jywge3NlbGVjdGVkVGV4dH1cbiAgICAgICAgaXQgXCJjYXNlLTQgdmlzdWFsXCIsIC0+IGNoZWNrIGNsb3NlLCAndicsIHtzZWxlY3RlZFRleHR9XG4gICAgZGVzY3JpYmUgXCJhLWJhY2stdGlja1wiLCAtPlxuICAgICAgaXQgXCJhcHBsaWVzIG9wZXJhdG9ycyBpbm5lci1hcmVhXCIsIC0+XG4gICAgICAgIGVuc3VyZSBcImQgYSBgXCIsIHRleHQ6IFwidGhpcyBpcyAgdGV4dC5cIiwgY3Vyc29yOiBbMCwgOF1cblxuICAgICAgaXQgXCJkbyBub3RoaW5nIHdoZW4gcGFpciByYW5nZSBpcyBub3QgdW5kZXIgY3Vyc29yXCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFswLCAxNl1cbiAgICAgICAgZW5zdXJlIFwiZCBhIGBcIiwgdGV4dDogb3JpZ2luYWxUZXh0LCBjdXJzb3I6IFswLCAxNl1cbiAgICAgIGRlc2NyaWJlIFwiY3Vyc29yIGlzIG9uIHRoZSBwYWlyIGNoYXJcIiwgLT5cbiAgICAgICAgY2hlY2sgPSBnZXRDaGVja0Z1bmN0aW9uRm9yKFwiYSBgXCIpXG4gICAgICAgIHRleHQgPSBcIi1gK2AtXCJcbiAgICAgICAgdGV4dEZpbmFsID0gXCItLVwiXG4gICAgICAgIHNlbGVjdGVkVGV4dCA9IFwiYCtgXCJcbiAgICAgICAgb3BlbiA9IFswLCAxXVxuICAgICAgICBjbG9zZSA9IFswLCAzXVxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgc2V0IHt0ZXh0fVxuICAgICAgICBpdCBcImNhc2UtMSBub3JtYWxcIiwgLT4gY2hlY2sgb3BlbiwgJ2QnLCB0ZXh0OiB0ZXh0RmluYWwsIGN1cnNvcjogWzAsIDFdXG4gICAgICAgIGl0IFwiY2FzZS0yIG5vcm1hbFwiLCAtPiBjaGVjayBjbG9zZSwgJ2QnLCB0ZXh0OiB0ZXh0RmluYWwsIGN1cnNvcjogWzAsIDFdXG4gICAgICAgIGl0IFwiY2FzZS0zIHZpc3VhbFwiLCAtPiBjaGVjayBvcGVuLCAndicsIHtzZWxlY3RlZFRleHR9XG4gICAgICAgIGl0IFwiY2FzZS00IHZpc3VhbFwiLCAtPiBjaGVjayBjbG9zZSwgJ3YnLCB7c2VsZWN0ZWRUZXh0fVxuICBkZXNjcmliZSBcIkN1cmx5QnJhY2tldFwiLCAtPlxuICAgIGRlc2NyaWJlIFwic2NvcGUgYXdhcmVuZXNzIG9mIGJyYWNrZXRcIiwgLT5cbiAgICAgIGl0IFwiW3NlYXJjaCBmcm9tIG91dHNpZGUgb2YgZG91YmxlLXF1b3RlXSBza2lwcyBicmFja2V0IGluIHdpdGhpbi1saW5lLWJhbGFuY2VkLWRvdWJsZS1xdW90ZXNcIiwgLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgIHsgfCBcImhlbGxvIHtcIiB9XG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgIGVuc3VyZSBcInYgYSB7XCIsXG4gICAgICAgICAgc2VsZWN0ZWRUZXh0OiBcIlwiXCJcbiAgICAgICAgICB7ICBcImhlbGxvIHtcIiB9XG4gICAgICAgICAgXCJcIlwiXG5cbiAgICAgIGl0IFwiTm90IGlnbm9yZSBicmFja2V0IGluIHdpdGhpbi1saW5lLW5vdC1iYWxhbmNlZC1kb3VibGUtcXVvdGVzXCIsIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICB7ICBcImhlbGxvIHtcIiB8ICdcIicgfVxuICAgICAgICAgIFwiXCJcIlxuICAgICAgICBlbnN1cmUgXCJ2IGEge1wiLFxuICAgICAgICAgIHNlbGVjdGVkVGV4dDogXCJcIlwiXG4gICAgICAgICAge1wiICAnXCInIH1cbiAgICAgICAgICBcIlwiXCJcbiAgICAgIGl0IFwiW3NlYXJjaCBmcm9tIGluc2lkZSBvZiBkb3VibGUtcXVvdGVdIHNraXBzIGJyYWNrZXQgaW4gd2l0aGluLWxpbmUtYmFsYW5jZWQtZG91YmxlLXF1b3Rlc1wiLCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgeyAgXCJofGVsbG8ge1wiIH1cbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgZW5zdXJlIFwidiBhIHtcIixcbiAgICAgICAgICBzZWxlY3RlZFRleHQ6IFwiXCJcIlxuICAgICAgICAgIHsgIFwiaGVsbG8ge1wiIH1cbiAgICAgICAgICBcIlwiXCJcblxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0Q186IFwiXCJcIlxuXG4gICAgICAgICAgXCJcIlwiXG4gICAgZGVzY3JpYmUgXCJpbm5lci1jdXJseS1icmFja2V0XCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHQ6IFwieyBzb21ldGhpbmcgaW4gaGVyZSBhbmQgaW4ge2hlcmV9IH1cIlxuICAgICAgICAgIGN1cnNvcjogWzAsIDldXG5cbiAgICAgIGl0IFwiYXBwbGllcyBvcGVyYXRvcnMgdG8gaW5uZXItYXJlYSBpbiBvcGVyYXRvci1wZW5kaW5nIG1vZGVcIiwgLT5cbiAgICAgICAgZW5zdXJlICdkIGkgeycsXG4gICAgICAgICAgdGV4dDogXCJ7fVwiXG4gICAgICAgICAgY3Vyc29yOiBbMCwgMV1cblxuICAgICAgaXQgXCJhcHBsaWVzIG9wZXJhdG9ycyB0byBpbm5lci1hcmVhIGluIG9wZXJhdG9yLXBlbmRpbmcgbW9kZSAoc2Vjb25kIHRlc3QpXCIsIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIGN1cnNvcjogWzAsIDI5XVxuICAgICAgICBlbnN1cmUgJ2QgaSB7JyxcbiAgICAgICAgICB0ZXh0OiBcInsgc29tZXRoaW5nIGluIGhlcmUgYW5kIGluIHt9IH1cIlxuICAgICAgICAgIGN1cnNvcjogWzAsIDI4XVxuXG4gICAgICBkZXNjcmliZSBcImN1cnNvciBpcyBvbiB0aGUgcGFpciBjaGFyXCIsIC0+XG4gICAgICAgIGNoZWNrID0gZ2V0Q2hlY2tGdW5jdGlvbkZvcignaSB7JylcbiAgICAgICAgdGV4dCA9ICcteyt9LSdcbiAgICAgICAgdGV4dEZpbmFsID0gJy17fS0nXG4gICAgICAgIHNlbGVjdGVkVGV4dCA9ICcrJ1xuICAgICAgICBvcGVuID0gWzAsIDFdXG4gICAgICAgIGNsb3NlID0gWzAsIDNdXG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBzZXQge3RleHR9XG4gICAgICAgIGl0IFwiY2FzZS0xIG5vcm1hbFwiLCAtPiBjaGVjayBvcGVuLCAnZCcsIHRleHQ6IHRleHRGaW5hbCwgY3Vyc29yOiBbMCwgMl1cbiAgICAgICAgaXQgXCJjYXNlLTIgbm9ybWFsXCIsIC0+IGNoZWNrIGNsb3NlLCAnZCcsIHRleHQ6IHRleHRGaW5hbCwgY3Vyc29yOiBbMCwgMl1cbiAgICAgICAgaXQgXCJjYXNlLTMgdmlzdWFsXCIsIC0+IGNoZWNrIG9wZW4sICd2Jywge3NlbGVjdGVkVGV4dH1cbiAgICAgICAgaXQgXCJjYXNlLTQgdmlzdWFsXCIsIC0+IGNoZWNrIGNsb3NlLCAndicsIHtzZWxlY3RlZFRleHR9XG5cbiAgICAgIGRlc2NyaWJlIFwiY2hhbmdlIG1vZGUgdG8gY2hhcmFjdGVyd2lzZVwiLCAtPlxuICAgICAgICAjIEZJWE1FIGxhc3QgXCJcXG5cIiBzaG91bGQgbm90IGJlIHNlbGVjdGVkXG4gICAgICAgIHRleHRTZWxlY3RlZCA9IFwiXCJcIlxuICAgICAgICBfXzEsXG4gICAgICAgIF9fMixcbiAgICAgICAgX18zXG4gICAgICAgIFwiXCJcIi5yZXBsYWNlKC9fL2csICcgJylcblxuXG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBzZXRcbiAgICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgfDEsXG4gICAgICAgICAgICAgIDIsXG4gICAgICAgICAgICAgIDNcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIGVuc3VyZSBtb2RlOiAnbm9ybWFsJ1xuXG4gICAgICAgIGl0IFwiZnJvbSB2QywgZmluYWwtbW9kZSBpcyAnY2hhcmFjdGVyd2lzZSdcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJ3YnLFxuICAgICAgICAgICAgc2VsZWN0ZWRUZXh0OiBbJzEnXVxuICAgICAgICAgICAgbW9kZTogWyd2aXN1YWwnLCAnY2hhcmFjdGVyd2lzZSddXG4gICAgICAgICAgZW5zdXJlICdpIEInLFxuICAgICAgICAgICAgc2VsZWN0ZWRUZXh0OiB0ZXh0U2VsZWN0ZWRcbiAgICAgICAgICAgIG1vZGU6IFsndmlzdWFsJywgJ2NoYXJhY3Rlcndpc2UnXVxuXG4gICAgICAgIGl0IFwiZnJvbSB2TCwgZmluYWwtbW9kZSBpcyAnY2hhcmFjdGVyd2lzZSdcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJ1YnLFxuICAgICAgICAgICAgc2VsZWN0ZWRUZXh0OiBbXCIgIDEsXFxuXCJdXG4gICAgICAgICAgICBtb2RlOiBbJ3Zpc3VhbCcsICdsaW5ld2lzZSddXG4gICAgICAgICAgZW5zdXJlICdpIEInLFxuICAgICAgICAgICAgc2VsZWN0ZWRUZXh0OiB0ZXh0U2VsZWN0ZWRcbiAgICAgICAgICAgIG1vZGU6IFsndmlzdWFsJywgJ2NoYXJhY3Rlcndpc2UnXVxuXG4gICAgICAgIGl0IFwiZnJvbSB2QiwgZmluYWwtbW9kZSBpcyAnY2hhcmFjdGVyd2lzZSdcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJ2N0cmwtdicsXG4gICAgICAgICAgICBzZWxlY3RlZFRleHQ6IFtcIjFcIl1cbiAgICAgICAgICAgIG1vZGU6IFsndmlzdWFsJywgJ2Jsb2Nrd2lzZSddXG4gICAgICAgICAgZW5zdXJlICdpIEInLFxuICAgICAgICAgICAgc2VsZWN0ZWRUZXh0OiB0ZXh0U2VsZWN0ZWRcbiAgICAgICAgICAgIG1vZGU6IFsndmlzdWFsJywgJ2NoYXJhY3Rlcndpc2UnXVxuXG4gICAgICAgIGRlc2NyaWJlIFwiYXMgb3BlcmF0b3IgdGFyZ2V0XCIsIC0+XG4gICAgICAgICAgaXQgXCJjaGFuZ2UgaW5uZXItcGFpclwiLCAtPlxuICAgICAgICAgICAgZW5zdXJlIFwiYyBpIEJcIixcbiAgICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgIHxcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgICAgbW9kZTogJ2luc2VydCdcbiAgICAgICAgICBpdCBcImRlbGV0ZSBpbm5lci1wYWlyXCIsIC0+XG4gICAgICAgICAgICBlbnN1cmUgXCJkIGkgQlwiLFxuICAgICAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgfH1cbiAgICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICAgIG1vZGU6ICdub3JtYWwnXG5cbiAgICBkZXNjcmliZSBcImEtY3VybHktYnJhY2tldFwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0OiBcInsgc29tZXRoaW5nIGluIGhlcmUgYW5kIGluIHtoZXJlfSB9XCJcbiAgICAgICAgICBjdXJzb3I6IFswLCA5XVxuXG4gICAgICBpdCBcImFwcGxpZXMgb3BlcmF0b3JzIHRvIGEtYXJlYSBpbiBvcGVyYXRvci1wZW5kaW5nIG1vZGVcIiwgLT5cbiAgICAgICAgZW5zdXJlICdkIGEgeycsXG4gICAgICAgICAgdGV4dDogJydcbiAgICAgICAgICBjdXJzb3I6IFswLCAwXVxuICAgICAgICAgIG1vZGU6ICdub3JtYWwnXG5cbiAgICAgIGl0IFwiYXBwbGllcyBvcGVyYXRvcnMgdG8gYS1hcmVhIGluIG9wZXJhdG9yLXBlbmRpbmcgbW9kZSAoc2Vjb25kIHRlc3QpXCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFswLCAyOV1cbiAgICAgICAgZW5zdXJlICdkIGEgeycsXG4gICAgICAgICAgdGV4dDogXCJ7IHNvbWV0aGluZyBpbiBoZXJlIGFuZCBpbiAgfVwiXG4gICAgICAgICAgY3Vyc29yOiBbMCwgMjddXG4gICAgICAgICAgbW9kZTogJ25vcm1hbCdcbiAgICAgIGRlc2NyaWJlIFwiY3Vyc29yIGlzIG9uIHRoZSBwYWlyIGNoYXJcIiwgLT5cbiAgICAgICAgY2hlY2sgPSBnZXRDaGVja0Z1bmN0aW9uRm9yKFwiYSB7XCIpXG4gICAgICAgIHRleHQgPSBcIi17K30tXCJcbiAgICAgICAgdGV4dEZpbmFsID0gXCItLVwiXG4gICAgICAgIHNlbGVjdGVkVGV4dCA9IFwieyt9XCJcbiAgICAgICAgb3BlbiA9IFswLCAxXVxuICAgICAgICBjbG9zZSA9IFswLCAzXVxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgc2V0IHt0ZXh0fVxuICAgICAgICBpdCBcImNhc2UtMSBub3JtYWxcIiwgLT4gY2hlY2sgb3BlbiwgJ2QnLCB0ZXh0OiB0ZXh0RmluYWwsIGN1cnNvcjogWzAsIDFdXG4gICAgICAgIGl0IFwiY2FzZS0yIG5vcm1hbFwiLCAtPiBjaGVjayBjbG9zZSwgJ2QnLCB0ZXh0OiB0ZXh0RmluYWwsIGN1cnNvcjogWzAsIDFdXG4gICAgICAgIGl0IFwiY2FzZS0zIHZpc3VhbFwiLCAtPiBjaGVjayBvcGVuLCAndicsIHtzZWxlY3RlZFRleHR9XG4gICAgICAgIGl0IFwiY2FzZS00IHZpc3VhbFwiLCAtPiBjaGVjayBjbG9zZSwgJ3YnLCB7c2VsZWN0ZWRUZXh0fVxuXG4gICAgICBkZXNjcmliZSBcImNoYW5nZSBtb2RlIHRvIGNoYXJhY3Rlcndpc2VcIiwgLT5cbiAgICAgICAgdGV4dFNlbGVjdGVkID0gXCJcIlwiXG4gICAgICAgICAge1xuICAgICAgICAgICAgMSxcbiAgICAgICAgICAgIDIsXG4gICAgICAgICAgICAzXG4gICAgICAgICAgfVxuICAgICAgICAgIFwiXCJcIlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgc2V0XG4gICAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIHwxLFxuICAgICAgICAgICAgICAyLFxuICAgICAgICAgICAgICAzXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGhlbGxvXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICBlbnN1cmUgbW9kZTogJ25vcm1hbCdcblxuICAgICAgICBpdCBcImZyb20gdkMsIGZpbmFsLW1vZGUgaXMgJ2NoYXJhY3Rlcndpc2UnXCIsIC0+XG4gICAgICAgICAgZW5zdXJlICd2JyxcbiAgICAgICAgICAgIHNlbGVjdGVkVGV4dDogWycxJ11cbiAgICAgICAgICAgIG1vZGU6IFsndmlzdWFsJywgJ2NoYXJhY3Rlcndpc2UnXVxuICAgICAgICAgIGVuc3VyZSAnYSBCJyxcbiAgICAgICAgICAgIHNlbGVjdGVkVGV4dDogdGV4dFNlbGVjdGVkXG4gICAgICAgICAgICBtb2RlOiBbJ3Zpc3VhbCcsICdjaGFyYWN0ZXJ3aXNlJ11cblxuICAgICAgICBpdCBcImZyb20gdkwsIGZpbmFsLW1vZGUgaXMgJ2NoYXJhY3Rlcndpc2UnXCIsIC0+XG4gICAgICAgICAgZW5zdXJlICdWJyxcbiAgICAgICAgICAgIHNlbGVjdGVkVGV4dDogW1wiICAxLFxcblwiXVxuICAgICAgICAgICAgbW9kZTogWyd2aXN1YWwnLCAnbGluZXdpc2UnXVxuICAgICAgICAgIGVuc3VyZSAnYSBCJyxcbiAgICAgICAgICAgIHNlbGVjdGVkVGV4dDogdGV4dFNlbGVjdGVkXG4gICAgICAgICAgICBtb2RlOiBbJ3Zpc3VhbCcsICdjaGFyYWN0ZXJ3aXNlJ11cblxuICAgICAgICBpdCBcImZyb20gdkIsIGZpbmFsLW1vZGUgaXMgJ2NoYXJhY3Rlcndpc2UnXCIsIC0+XG4gICAgICAgICAgZW5zdXJlICdjdHJsLXYnLFxuICAgICAgICAgICAgc2VsZWN0ZWRUZXh0OiBbXCIxXCJdXG4gICAgICAgICAgICBtb2RlOiBbJ3Zpc3VhbCcsICdibG9ja3dpc2UnXVxuICAgICAgICAgIGVuc3VyZSAnYSBCJyxcbiAgICAgICAgICAgIHNlbGVjdGVkVGV4dDogdGV4dFNlbGVjdGVkXG4gICAgICAgICAgICBtb2RlOiBbJ3Zpc3VhbCcsICdjaGFyYWN0ZXJ3aXNlJ11cblxuICAgICAgICBkZXNjcmliZSBcImFzIG9wZXJhdG9yIHRhcmdldFwiLCAtPlxuICAgICAgICAgIGl0IFwiY2hhbmdlIGlubmVyLXBhaXJcIiwgLT5cbiAgICAgICAgICAgIGVuc3VyZSBcImMgYSBCXCIsXG4gICAgICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAgICAgfFxuXG4gICAgICAgICAgICAgIGhlbGxvXG4gICAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgICBtb2RlOiAnaW5zZXJ0J1xuICAgICAgICAgIGl0IFwiZGVsZXRlIGlubmVyLXBhaXJcIiwgLT5cbiAgICAgICAgICAgIGVuc3VyZSBcImQgYSBCXCIsXG4gICAgICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAgICAgfFxuXG4gICAgICAgICAgICAgIGhlbGxvXG4gICAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgICBtb2RlOiAnbm9ybWFsJ1xuXG5cbiAgZGVzY3JpYmUgXCJBbmdsZUJyYWNrZXRcIiwgLT5cbiAgICBkZXNjcmliZSBcImlubmVyLWFuZ2xlLWJyYWNrZXRcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dDogXCI8IHNvbWV0aGluZyBpbiBoZXJlIGFuZCBpbiA8aGVyZT4gPlwiXG4gICAgICAgICAgY3Vyc29yOiBbMCwgOV1cblxuICAgICAgaXQgXCJhcHBsaWVzIG9wZXJhdG9ycyBpbnNpZGUgdGhlIGN1cnJlbnQgd29yZCBpbiBvcGVyYXRvci1wZW5kaW5nIG1vZGVcIiwgLT5cbiAgICAgICAgZW5zdXJlICdkIGkgPCcsXG4gICAgICAgICAgdGV4dDogXCI8PlwiXG4gICAgICAgICAgY3Vyc29yOiBbMCwgMV1cblxuICAgICAgaXQgXCJhcHBsaWVzIG9wZXJhdG9ycyBpbnNpZGUgdGhlIGN1cnJlbnQgd29yZCBpbiBvcGVyYXRvci1wZW5kaW5nIG1vZGUgKHNlY29uZCB0ZXN0KVwiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMjldXG4gICAgICAgIGVuc3VyZSAnZCBpIDwnLFxuICAgICAgICAgIHRleHQ6IFwiPCBzb21ldGhpbmcgaW4gaGVyZSBhbmQgaW4gPD4gPlwiXG4gICAgICAgICAgY3Vyc29yOiBbMCwgMjhdXG4gICAgICBkZXNjcmliZSBcImN1cnNvciBpcyBvbiB0aGUgcGFpciBjaGFyXCIsIC0+XG4gICAgICAgIGNoZWNrID0gZ2V0Q2hlY2tGdW5jdGlvbkZvcignaSA8JylcbiAgICAgICAgdGV4dCA9ICctPCs+LSdcbiAgICAgICAgdGV4dEZpbmFsID0gJy08Pi0nXG4gICAgICAgIHNlbGVjdGVkVGV4dCA9ICcrJ1xuICAgICAgICBvcGVuID0gWzAsIDFdXG4gICAgICAgIGNsb3NlID0gWzAsIDNdXG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBzZXQge3RleHR9XG4gICAgICAgIGl0IFwiY2FzZS0xIG5vcm1hbFwiLCAtPiBjaGVjayBvcGVuLCAnZCcsIHRleHQ6IHRleHRGaW5hbCwgY3Vyc29yOiBbMCwgMl1cbiAgICAgICAgaXQgXCJjYXNlLTIgbm9ybWFsXCIsIC0+IGNoZWNrIGNsb3NlLCAnZCcsIHRleHQ6IHRleHRGaW5hbCwgY3Vyc29yOiBbMCwgMl1cbiAgICAgICAgaXQgXCJjYXNlLTMgdmlzdWFsXCIsIC0+IGNoZWNrIG9wZW4sICd2Jywge3NlbGVjdGVkVGV4dH1cbiAgICAgICAgaXQgXCJjYXNlLTQgdmlzdWFsXCIsIC0+IGNoZWNrIGNsb3NlLCAndicsIHtzZWxlY3RlZFRleHR9XG4gICAgZGVzY3JpYmUgXCJhLWFuZ2xlLWJyYWNrZXRcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dDogXCI8IHNvbWV0aGluZyBpbiBoZXJlIGFuZCBpbiA8aGVyZT4gPlwiXG4gICAgICAgICAgY3Vyc29yOiBbMCwgOV1cblxuICAgICAgaXQgXCJhcHBsaWVzIG9wZXJhdG9ycyBhcm91bmQgdGhlIGN1cnJlbnQgYW5nbGUgYnJhY2tldHMgaW4gb3BlcmF0b3ItcGVuZGluZyBtb2RlXCIsIC0+XG4gICAgICAgIGVuc3VyZSAnZCBhIDwnLFxuICAgICAgICAgIHRleHQ6ICcnXG4gICAgICAgICAgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgICBtb2RlOiAnbm9ybWFsJ1xuXG4gICAgICBpdCBcImFwcGxpZXMgb3BlcmF0b3JzIGFyb3VuZCB0aGUgY3VycmVudCBhbmdsZSBicmFja2V0cyBpbiBvcGVyYXRvci1wZW5kaW5nIG1vZGUgKHNlY29uZCB0ZXN0KVwiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMjldXG4gICAgICAgIGVuc3VyZSAnZCBhIDwnLFxuICAgICAgICAgIHRleHQ6IFwiPCBzb21ldGhpbmcgaW4gaGVyZSBhbmQgaW4gID5cIlxuICAgICAgICAgIGN1cnNvcjogWzAsIDI3XVxuICAgICAgICAgIG1vZGU6ICdub3JtYWwnXG4gICAgICBkZXNjcmliZSBcImN1cnNvciBpcyBvbiB0aGUgcGFpciBjaGFyXCIsIC0+XG4gICAgICAgIGNoZWNrID0gZ2V0Q2hlY2tGdW5jdGlvbkZvcihcImEgPFwiKVxuICAgICAgICB0ZXh0ID0gXCItPCs+LVwiXG4gICAgICAgIHRleHRGaW5hbCA9IFwiLS1cIlxuICAgICAgICBzZWxlY3RlZFRleHQgPSBcIjwrPlwiXG4gICAgICAgIG9wZW4gPSBbMCwgMV1cbiAgICAgICAgY2xvc2UgPSBbMCwgM11cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIHNldCB7dGV4dH1cbiAgICAgICAgaXQgXCJjYXNlLTEgbm9ybWFsXCIsIC0+IGNoZWNrIG9wZW4sICdkJywgdGV4dDogdGV4dEZpbmFsLCBjdXJzb3I6IFswLCAxXVxuICAgICAgICBpdCBcImNhc2UtMiBub3JtYWxcIiwgLT4gY2hlY2sgY2xvc2UsICdkJywgdGV4dDogdGV4dEZpbmFsLCBjdXJzb3I6IFswLCAxXVxuICAgICAgICBpdCBcImNhc2UtMyB2aXN1YWxcIiwgLT4gY2hlY2sgb3BlbiwgJ3YnLCB7c2VsZWN0ZWRUZXh0fVxuICAgICAgICBpdCBcImNhc2UtNCB2aXN1YWxcIiwgLT4gY2hlY2sgY2xvc2UsICd2Jywge3NlbGVjdGVkVGV4dH1cblxuICBkZXNjcmliZSBcIkFsbG93Rm9yd2FyZGluZyBmYW1pbHlcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBhdG9tLmtleW1hcHMuYWRkIFwidGVzdFwiLFxuICAgICAgICAnYXRvbS10ZXh0LWVkaXRvci52aW0tbW9kZS1wbHVzLm9wZXJhdG9yLXBlbmRpbmctbW9kZSwgYXRvbS10ZXh0LWVkaXRvci52aW0tbW9kZS1wbHVzLnZpc3VhbC1tb2RlJzpcbiAgICAgICAgICAnaSB9JzogICd2aW0tbW9kZS1wbHVzOmlubmVyLWN1cmx5LWJyYWNrZXQtYWxsb3ctZm9yd2FyZGluZydcbiAgICAgICAgICAnaSA+JzogICd2aW0tbW9kZS1wbHVzOmlubmVyLWFuZ2xlLWJyYWNrZXQtYWxsb3ctZm9yd2FyZGluZydcbiAgICAgICAgICAnaSBdJzogICd2aW0tbW9kZS1wbHVzOmlubmVyLXNxdWFyZS1icmFja2V0LWFsbG93LWZvcndhcmRpbmcnXG4gICAgICAgICAgJ2kgKSc6ICAndmltLW1vZGUtcGx1czppbm5lci1wYXJlbnRoZXNpcy1hbGxvdy1mb3J3YXJkaW5nJ1xuXG4gICAgICAgICAgJ2EgfSc6ICAndmltLW1vZGUtcGx1czphLWN1cmx5LWJyYWNrZXQtYWxsb3ctZm9yd2FyZGluZydcbiAgICAgICAgICAnYSA+JzogICd2aW0tbW9kZS1wbHVzOmEtYW5nbGUtYnJhY2tldC1hbGxvdy1mb3J3YXJkaW5nJ1xuICAgICAgICAgICdhIF0nOiAgJ3ZpbS1tb2RlLXBsdXM6YS1zcXVhcmUtYnJhY2tldC1hbGxvdy1mb3J3YXJkaW5nJ1xuICAgICAgICAgICdhICknOiAgJ3ZpbS1tb2RlLXBsdXM6YS1wYXJlbnRoZXNpcy1hbGxvdy1mb3J3YXJkaW5nJ1xuXG4gICAgICBzZXRcbiAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgIF9fezAwMH1fX1xuICAgICAgICBfXzwxMTE+X19cbiAgICAgICAgX19bMjIyXV9fXG4gICAgICAgIF9fKDMzMylfX1xuICAgICAgICBcIlwiXCJcbiAgICBkZXNjcmliZSBcImlubmVyXCIsIC0+XG4gICAgICBpdCBcInNlbGVjdCBmb3J3YXJkaW5nIHJhbmdlXCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFswLCAwXTsgZW5zdXJlICdlc2NhcGUgdiBpIH0nLCBzZWxlY3RlZFRleHQ6IFwiMDAwXCJcbiAgICAgICAgc2V0IGN1cnNvcjogWzEsIDBdOyBlbnN1cmUgJ2VzY2FwZSB2IGkgPicsIHNlbGVjdGVkVGV4dDogXCIxMTFcIlxuICAgICAgICBzZXQgY3Vyc29yOiBbMiwgMF07IGVuc3VyZSAnZXNjYXBlIHYgaSBdJywgc2VsZWN0ZWRUZXh0OiBcIjIyMlwiXG4gICAgICAgIHNldCBjdXJzb3I6IFszLCAwXTsgZW5zdXJlICdlc2NhcGUgdiBpICknLCBzZWxlY3RlZFRleHQ6IFwiMzMzXCJcbiAgICBkZXNjcmliZSBcImFcIiwgLT5cbiAgICAgIGl0IFwic2VsZWN0IGZvcndhcmRpbmcgcmFuZ2VcIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzAsIDBdOyBlbnN1cmUgJ2VzY2FwZSB2IGEgfScsIHNlbGVjdGVkVGV4dDogXCJ7MDAwfVwiXG4gICAgICAgIHNldCBjdXJzb3I6IFsxLCAwXTsgZW5zdXJlICdlc2NhcGUgdiBhID4nLCBzZWxlY3RlZFRleHQ6IFwiPDExMT5cIlxuICAgICAgICBzZXQgY3Vyc29yOiBbMiwgMF07IGVuc3VyZSAnZXNjYXBlIHYgYSBdJywgc2VsZWN0ZWRUZXh0OiBcIlsyMjJdXCJcbiAgICAgICAgc2V0IGN1cnNvcjogWzMsIDBdOyBlbnN1cmUgJ2VzY2FwZSB2IGEgKScsIHNlbGVjdGVkVGV4dDogXCIoMzMzKVwiXG4gICAgZGVzY3JpYmUgXCJtdWx0aSBsaW5lIHRleHRcIiwgLT5cbiAgICAgIFt0ZXh0T25lSW5uZXIsIHRleHRPbmVBXSA9IFtdXG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgIDAwMFxuICAgICAgICAgIDAwMHsxMVxuICAgICAgICAgIDExMXsyMn1cbiAgICAgICAgICAxMTFcbiAgICAgICAgICAxMTF9XG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgIHRleHRPbmVJbm5lciA9IFwiXCJcIlxuICAgICAgICAgIDExXG4gICAgICAgICAgMTExezIyfVxuICAgICAgICAgIDExMVxuICAgICAgICAgIDExMVxuICAgICAgICAgIFwiXCJcIlxuICAgICAgICB0ZXh0T25lQSA9IFwiXCJcIlxuICAgICAgICAgIHsxMVxuICAgICAgICAgIDExMXsyMn1cbiAgICAgICAgICAxMTFcbiAgICAgICAgICAxMTF9XG4gICAgICAgICAgXCJcIlwiXG4gICAgICBkZXNjcmliZSBcImZvcndhcmRpbmcgaW5uZXJcIiwgLT5cbiAgICAgICAgaXQgXCJzZWxlY3QgZm9yd2FyZGluZyByYW5nZVwiLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFsxLCAwXTsgZW5zdXJlIFwidiBpIH1cIiwgc2VsZWN0ZWRUZXh0OiB0ZXh0T25lSW5uZXJcbiAgICAgICAgaXQgXCJzZWxlY3QgZm9yd2FyZGluZyByYW5nZVwiLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFsyLCAwXTsgZW5zdXJlIFwidiBpIH1cIiwgc2VsZWN0ZWRUZXh0OiBcIjIyXCJcbiAgICAgICAgaXQgXCJbY2FzZS0xXSBubyBmb3J3YXJkaW5nIG9wZW4gcGFpciwgZmFpbCB0byBmaW5kXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzAsIDBdOyBlbnN1cmUgXCJ2IGkgfVwiLCBzZWxlY3RlZFRleHQ6ICcwJywgY3Vyc29yOiBbMCwgMV1cbiAgICAgICAgaXQgXCJbY2FzZS0yXSBubyBmb3J3YXJkaW5nIG9wZW4gcGFpciwgc2VsZWN0IGVuY2xvc2VkXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzEsIDRdOyBlbnN1cmUgXCJ2IGkgfVwiLCBzZWxlY3RlZFRleHQ6IHRleHRPbmVJbm5lclxuICAgICAgICBpdCBcIltjYXNlLTNdIG5vIGZvcndhcmRpbmcgb3BlbiBwYWlyLCBzZWxlY3QgZW5jbG9zZWRcIiwgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMywgMF07IGVuc3VyZSBcInYgaSB9XCIsIHNlbGVjdGVkVGV4dDogdGV4dE9uZUlubmVyXG4gICAgICAgIGl0IFwiW2Nhc2UtM10gbm8gZm9yd2FyZGluZyBvcGVuIHBhaXIsIHNlbGVjdCBlbmNsb3NlZFwiLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFs0LCAwXTsgZW5zdXJlIFwidiBpIH1cIiwgc2VsZWN0ZWRUZXh0OiB0ZXh0T25lSW5uZXJcbiAgICAgIGRlc2NyaWJlIFwiZm9yd2FyZGluZyBhXCIsIC0+XG4gICAgICAgIGl0IFwic2VsZWN0IGZvcndhcmRpbmcgcmFuZ2VcIiwgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMSwgMF07IGVuc3VyZSBcInYgYSB9XCIsIHNlbGVjdGVkVGV4dDogdGV4dE9uZUFcbiAgICAgICAgaXQgXCJzZWxlY3QgZm9yd2FyZGluZyByYW5nZVwiLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFsyLCAwXTsgZW5zdXJlIFwidiBhIH1cIiwgc2VsZWN0ZWRUZXh0OiBcInsyMn1cIlxuICAgICAgICBpdCBcIltjYXNlLTFdIG5vIGZvcndhcmRpbmcgb3BlbiBwYWlyLCBmYWlsIHRvIGZpbmRcIiwgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMF07IGVuc3VyZSBcInYgYSB9XCIsIHNlbGVjdGVkVGV4dDogJzAnLCBjdXJzb3I6IFswLCAxXVxuICAgICAgICBpdCBcIltjYXNlLTJdIG5vIGZvcndhcmRpbmcgb3BlbiBwYWlyLCBzZWxlY3QgZW5jbG9zZWRcIiwgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMSwgNF07IGVuc3VyZSBcInYgYSB9XCIsIHNlbGVjdGVkVGV4dDogdGV4dE9uZUFcbiAgICAgICAgaXQgXCJbY2FzZS0zXSBubyBmb3J3YXJkaW5nIG9wZW4gcGFpciwgc2VsZWN0IGVuY2xvc2VkXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzMsIDBdOyBlbnN1cmUgXCJ2IGEgfVwiLCBzZWxlY3RlZFRleHQ6IHRleHRPbmVBXG4gICAgICAgIGl0IFwiW2Nhc2UtM10gbm8gZm9yd2FyZGluZyBvcGVuIHBhaXIsIHNlbGVjdCBlbmNsb3NlZFwiLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFs0LCAwXTsgZW5zdXJlIFwidiBhIH1cIiwgc2VsZWN0ZWRUZXh0OiB0ZXh0T25lQVxuXG4gIGRlc2NyaWJlIFwiQW55UGFpckFsbG93Rm9yd2FyZGluZ1wiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIGF0b20ua2V5bWFwcy5hZGQgXCJ0ZXh0XCIsXG4gICAgICAgICdhdG9tLXRleHQtZWRpdG9yLnZpbS1tb2RlLXBsdXMub3BlcmF0b3ItcGVuZGluZy1tb2RlLCBhdG9tLXRleHQtZWRpdG9yLnZpbS1tb2RlLXBsdXMudmlzdWFsLW1vZGUnOlxuICAgICAgICAgIFwiO1wiOiAndmltLW1vZGUtcGx1czppbm5lci1hbnktcGFpci1hbGxvdy1mb3J3YXJkaW5nJ1xuICAgICAgICAgIFwiOlwiOiAndmltLW1vZGUtcGx1czphLWFueS1wYWlyLWFsbG93LWZvcndhcmRpbmcnXG5cbiAgICAgIHNldCB0ZXh0OiBcIlwiXCJcbiAgICAgICAgMDBcbiAgICAgICAgMDBbMTFcbiAgICAgICAgMTFcIjIyMlwiMTF7MzMzfTExKFxuICAgICAgICA0NDQoKTQ0NFxuICAgICAgICApXG4gICAgICAgIDExMV0wMHs1NTV9XG4gICAgICAgIFwiXCJcIlxuICAgIGRlc2NyaWJlIFwiaW5uZXJcIiwgLT5cbiAgICAgIGl0IFwic2VsZWN0IGZvcndhcmRpbmcgcmFuZ2Ugd2l0aGluIGVuY2xvc2VkIHJhbmdlKGlmIGV4aXN0cylcIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzIsIDBdXG4gICAgICAgIGtleXN0cm9rZSAndidcbiAgICAgICAgZW5zdXJlICc7Jywgc2VsZWN0ZWRUZXh0OiBcIjIyMlwiXG4gICAgICAgIGVuc3VyZSAnOycsIHNlbGVjdGVkVGV4dDogXCIzMzNcIlxuICAgICAgICBlbnN1cmUgJzsnLCBzZWxlY3RlZFRleHQ6IFwiNDQ0KCk0NDRcIlxuICAgIGRlc2NyaWJlIFwiYVwiLCAtPlxuICAgICAgaXQgXCJzZWxlY3QgZm9yd2FyZGluZyByYW5nZSB3aXRoaW4gZW5jbG9zZWQgcmFuZ2UoaWYgZXhpc3RzKVwiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMiwgMF1cbiAgICAgICAga2V5c3Ryb2tlICd2J1xuICAgICAgICBlbnN1cmUgJzonLCBzZWxlY3RlZFRleHQ6ICdcIjIyMlwiJ1xuICAgICAgICBlbnN1cmUgJzonLCBzZWxlY3RlZFRleHQ6IFwiezMzM31cIlxuICAgICAgICBlbnN1cmUgJzonLCBzZWxlY3RlZFRleHQ6IFwiKFxcbjQ0NCgpNDQ0XFxuKVwiXG4gICAgICAgIGVuc3VyZSAnOicsIHNlbGVjdGVkVGV4dDogXCJcIlwiXG4gICAgICAgIFsxMVxuICAgICAgICAxMVwiMjIyXCIxMXszMzN9MTEoXG4gICAgICAgIDQ0NCgpNDQ0XG4gICAgICAgIClcbiAgICAgICAgMTExXVxuICAgICAgICBcIlwiXCJcblxuICBkZXNjcmliZSBcIlRhZ1wiLCAtPlxuICAgIFtlbnN1cmVTZWxlY3RlZFRleHRdID0gW11cbiAgICBlbnN1cmVTZWxlY3RlZFRleHQgPSAoc3RhcnQsIGtleXN0cm9rZSwgc2VsZWN0ZWRUZXh0KSAtPlxuICAgICAgc2V0IGN1cnNvcjogc3RhcnRcbiAgICAgIGVuc3VyZSBrZXlzdHJva2UsIHtzZWxlY3RlZFRleHR9XG5cbiAgICBkZXNjcmliZSBcImlubmVyLXRhZ1wiLCAtPlxuICAgICAgZGVzY3JpYmUgXCJwcmVjaXNlbHkgc2VsZWN0IGlubmVyXCIsIC0+XG4gICAgICAgIGNoZWNrID0gZ2V0Q2hlY2tGdW5jdGlvbkZvcignaSB0JylcbiAgICAgICAgdGV4dCA9IFwiXCJcIlxuICAgICAgICAgIDxhYmM+XG4gICAgICAgICAgICA8dGl0bGU+VElUTEU8L3RpdGxlPlxuICAgICAgICAgIDwvYWJjPlxuICAgICAgICAgIFwiXCJcIlxuICAgICAgICBzZWxlY3RlZFRleHQgPSBcIlRJVExFXCJcbiAgICAgICAgaW5uZXJBQkMgPSBcIlxcbiAgPHRpdGxlPlRJVExFPC90aXRsZT5cXG5cIlxuICAgICAgICB0ZXh0QWZ0ZXJEZWxldGVkID0gXCJcIlwiXG4gICAgICAgICAgPGFiYz5cbiAgICAgICAgICAgIDx0aXRsZT48L3RpdGxlPlxuICAgICAgICAgIDwvYWJjPlxuICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBzZXQge3RleHR9XG5cbiAgICAgICAgIyBTZWxlY3RcbiAgICAgICAgaXQgXCJbMV0gZm9yd2FyZGluZ1wiLCAtPiBjaGVjayBbMSwgMF0sICd2Jywge3NlbGVjdGVkVGV4dH1cbiAgICAgICAgaXQgXCJbMl0gb3BlblRhZyBsZWZ0bW9zdFwiLCAtPiBjaGVjayBbMSwgMl0sICd2Jywge3NlbGVjdGVkVGV4dH1cbiAgICAgICAgaXQgXCJbM10gb3BlblRhZyByaWdodG1vc3RcIiwgLT4gY2hlY2sgWzEsIDhdLCAndicsIHtzZWxlY3RlZFRleHR9XG4gICAgICAgIGl0IFwiWzRdIElubmVyIHRleHRcIiwgLT4gY2hlY2sgWzEsIDEwXSwgJ3YnLCB7c2VsZWN0ZWRUZXh0fVxuICAgICAgICBpdCBcIls1XSBjbG9zZVRhZyBsZWZ0bW9zdFwiLCAtPiBjaGVjayBbMSwgMTRdLCAndicsIHtzZWxlY3RlZFRleHR9XG4gICAgICAgIGl0IFwiWzZdIGNsb3NlVGFnIHJpZ2h0bW9zdFwiLCAtPiBjaGVjayBbMSwgMjFdLCAndicsIHtzZWxlY3RlZFRleHR9XG4gICAgICAgIGl0IFwiWzddIHJpZ2h0IG9mIGNsb3NlVGFnXCIsIC0+IGNoZWNrIFsyLCAwXSwgJ3YnLCB7c2VsZWN0ZWRUZXh0OiBpbm5lckFCQ31cblxuICAgICAgICAjIERlbGV0ZVxuICAgICAgICBpdCBcIls4XSBmb3J3YXJkaW5nXCIsIC0+IGNoZWNrIFsxLCAwXSwgJ2QnLCB7dGV4dDogdGV4dEFmdGVyRGVsZXRlZH1cbiAgICAgICAgaXQgXCJbOV0gb3BlblRhZyBsZWZ0bW9zdFwiLCAtPiBjaGVjayBbMSwgMl0sICdkJywge3RleHQ6IHRleHRBZnRlckRlbGV0ZWR9XG4gICAgICAgIGl0IFwiWzEwXSBvcGVuVGFnIHJpZ2h0bW9zdFwiLCAtPiBjaGVjayBbMSwgOF0sICdkJywge3RleHQ6IHRleHRBZnRlckRlbGV0ZWR9XG4gICAgICAgIGl0IFwiWzExXSBJbm5lciB0ZXh0XCIsIC0+IGNoZWNrIFsxLCAxMF0sICdkJywge3RleHQ6IHRleHRBZnRlckRlbGV0ZWR9XG4gICAgICAgIGl0IFwiWzEyXSBjbG9zZVRhZyBsZWZ0bW9zdFwiLCAtPiBjaGVjayBbMSwgMTRdLCAnZCcsIHt0ZXh0OiB0ZXh0QWZ0ZXJEZWxldGVkfVxuICAgICAgICBpdCBcIlsxM10gY2xvc2VUYWcgcmlnaHRtb3N0XCIsIC0+IGNoZWNrIFsxLCAyMV0sICdkJywge3RleHQ6IHRleHRBZnRlckRlbGV0ZWR9XG4gICAgICAgIGl0IFwiWzE0XSByaWdodCBvZiBjbG9zZVRhZ1wiLCAtPiBjaGVjayBbMiwgMF0sICdkJywge3RleHQ6IFwiPGFiYz48L2FiYz5cIn1cblxuICAgICAgZGVzY3JpYmUgXCJleHBhbnNpb24gYW5kIGRlbGV0aW9uXCIsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICAjIFtOT1RFXSBJbnRlbnRpb25hbGx5IG9taXQgYCFgIHByZWZpeCBvZiBET0NUWVBFIHNpbmNlIGl0IHJlcHJlc2VudCBsYXN0IGN1cnNvciBpbiB0ZXh0Qy5cbiAgICAgICAgICBodG1sTGlrZVRleHQgPSBcIlwiXCJcbiAgICAgICAgICA8RE9DVFlQRSBodG1sPlxuICAgICAgICAgIDxodG1sIGxhbmc9XCJlblwiPlxuICAgICAgICAgIDxoZWFkPlxuICAgICAgICAgIF9fPG1ldGEgY2hhcnNldD1cIlVURi04XCIgLz5cbiAgICAgICAgICBfXzx0aXRsZT5Eb2N1bWVudDwvdGl0bGU+XG4gICAgICAgICAgPC9oZWFkPlxuICAgICAgICAgIDxib2R5PlxuICAgICAgICAgIF9fPGRpdj5cbiAgICAgICAgICBfX19fPGRpdj5cbiAgICAgICAgICB8X19fX19fPGRpdj5cbiAgICAgICAgICBfX19fX19fXzxwPjxhPlxuICAgICAgICAgIF9fX19fXzwvZGl2PlxuICAgICAgICAgIF9fX188L2Rpdj5cbiAgICAgICAgICBfXzwvZGl2PlxuICAgICAgICAgIDwvYm9keT5cbiAgICAgICAgICA8L2h0bWw+XFxuXG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgc2V0IHRleHRDXzogaHRtbExpa2VUZXh0XG5cbiAgICAgICAgaXQgXCJjYW4gZXhwYW5kIHNlbGVjdGlvbiB3aGVuIHJlcGVhdGVkXCIsIC0+XG4gICAgICAgICAgZW5zdXJlICd2IGkgdCcsIHNlbGVjdGVkVGV4dF86IFwiXCJcIlxuICAgICAgICAgICAgXFxuX19fX19fX188cD48YT5cbiAgICAgICAgICAgIF9fX19fX1xuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgZW5zdXJlICdpIHQnLCBzZWxlY3RlZFRleHRfOiBcIlwiXCJcbiAgICAgICAgICAgIFxcbl9fX19fXzxkaXY+XG4gICAgICAgICAgICBfX19fX19fXzxwPjxhPlxuICAgICAgICAgICAgX19fX19fPC9kaXY+XG4gICAgICAgICAgICBfX19fXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICBlbnN1cmUgJ2kgdCcsIHNlbGVjdGVkVGV4dF86IFwiXCJcIlxuICAgICAgICAgICAgXFxuX19fXzxkaXY+XG4gICAgICAgICAgICBfX19fX188ZGl2PlxuICAgICAgICAgICAgX19fX19fX188cD48YT5cbiAgICAgICAgICAgIF9fX19fXzwvZGl2PlxuICAgICAgICAgICAgX19fXzwvZGl2PlxuICAgICAgICAgICAgX19cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIGVuc3VyZSAnaSB0Jywgc2VsZWN0ZWRUZXh0XzogXCJcIlwiXG4gICAgICAgICAgICBcXG5fXzxkaXY+XG4gICAgICAgICAgICBfX19fPGRpdj5cbiAgICAgICAgICAgIF9fX19fXzxkaXY+XG4gICAgICAgICAgICBfX19fX19fXzxwPjxhPlxuICAgICAgICAgICAgX19fX19fPC9kaXY+XG4gICAgICAgICAgICBfX19fPC9kaXY+XG4gICAgICAgICAgICBfXzwvZGl2PlxcblxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgZW5zdXJlICdpIHQnLCBzZWxlY3RlZFRleHRfOiBcIlwiXCJcbiAgICAgICAgICAgIFxcbjxoZWFkPlxuICAgICAgICAgICAgX188bWV0YSBjaGFyc2V0PVwiVVRGLThcIiAvPlxuICAgICAgICAgICAgX188dGl0bGU+RG9jdW1lbnQ8L3RpdGxlPlxuICAgICAgICAgICAgPC9oZWFkPlxuICAgICAgICAgICAgPGJvZHk+XG4gICAgICAgICAgICBfXzxkaXY+XG4gICAgICAgICAgICBfX19fPGRpdj5cbiAgICAgICAgICAgIF9fX19fXzxkaXY+XG4gICAgICAgICAgICBfX19fX19fXzxwPjxhPlxuICAgICAgICAgICAgX19fX19fPC9kaXY+XG4gICAgICAgICAgICBfX19fPC9kaXY+XG4gICAgICAgICAgICBfXzwvZGl2PlxuICAgICAgICAgICAgPC9ib2R5PlxcblxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgIGl0ICdkZWxldGUgaW5uZXItdGFnIGFuZCByZXBhdGFibGUnLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFs5LCAwXVxuICAgICAgICAgIGVuc3VyZSBcImQgaSB0XCIsIHRleHRfOiBcIlwiXCJcbiAgICAgICAgICAgIDxET0NUWVBFIGh0bWw+XG4gICAgICAgICAgICA8aHRtbCBsYW5nPVwiZW5cIj5cbiAgICAgICAgICAgIDxoZWFkPlxuICAgICAgICAgICAgX188bWV0YSBjaGFyc2V0PVwiVVRGLThcIiAvPlxuICAgICAgICAgICAgX188dGl0bGU+RG9jdW1lbnQ8L3RpdGxlPlxuICAgICAgICAgICAgPC9oZWFkPlxuICAgICAgICAgICAgPGJvZHk+XG4gICAgICAgICAgICBfXzxkaXY+XG4gICAgICAgICAgICBfX19fPGRpdj5cbiAgICAgICAgICAgIF9fX19fXzxkaXY+PC9kaXY+XG4gICAgICAgICAgICBfX19fPC9kaXY+XG4gICAgICAgICAgICBfXzwvZGl2PlxuICAgICAgICAgICAgPC9ib2R5PlxuICAgICAgICAgICAgPC9odG1sPlxcblxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgZW5zdXJlIFwiMyAuXCIsIHRleHRfOiBcIlwiXCJcbiAgICAgICAgICAgIDxET0NUWVBFIGh0bWw+XG4gICAgICAgICAgICA8aHRtbCBsYW5nPVwiZW5cIj5cbiAgICAgICAgICAgIDxoZWFkPlxuICAgICAgICAgICAgX188bWV0YSBjaGFyc2V0PVwiVVRGLThcIiAvPlxuICAgICAgICAgICAgX188dGl0bGU+RG9jdW1lbnQ8L3RpdGxlPlxuICAgICAgICAgICAgPC9oZWFkPlxuICAgICAgICAgICAgPGJvZHk+PC9ib2R5PlxuICAgICAgICAgICAgPC9odG1sPlxcblxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgZW5zdXJlIFwiLlwiLCB0ZXh0XzogXCJcIlwiXG4gICAgICAgICAgICA8RE9DVFlQRSBodG1sPlxuICAgICAgICAgICAgPGh0bWwgbGFuZz1cImVuXCI+PC9odG1sPlxcblxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgIGRlc2NyaWJlIFwidGFnJ3MgSU4tdGFnL09mZi10YWcgcmVjb2duaXRpb25cIiwgLT5cbiAgICAgICAgZGVzY3JpYmUgXCJXaGVuIHRhZ1N0YXJ0J3Mgcm93IGNvbnRhaW5zIE5PIE5PTi13aGl0ZXNwYWVjZSB0aWxsIHRhZ1N0YXJ0XCIsIC0+XG4gICAgICAgICAgaXQgXCJbbXVsdGktbGluZV0gc2VsZWN0IGZvcndhcmRpbmcgdGFnXCIsIC0+XG4gICAgICAgICAgICBzZXQgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgICA8c3Bhbj5cbiAgICAgICAgICAgICAgICB8ICA8c3Bhbj5pbm5lcjwvc3Bhbj5cbiAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgIGVuc3VyZSBcImQgaSB0XCIsIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgICA8c3Bhbj5cbiAgICAgICAgICAgICAgICAgIDxzcGFuPjwvc3Bhbj5cbiAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBkZXNjcmliZSBcIldoZW4gdGFnU3RhcnQncyByb3cgY29udGFpbnMgU09NRSBOT04td2hpdGVzcGFlY2UgdGlsbCB0YWdTdGFydFwiLCAtPlxuICAgICAgICAgIGl0IFwiW211bHRpLWxpbmVdIHNlbGVjdCBlbmNsb3NpbmcgdGFnXCIsIC0+XG4gICAgICAgICAgICBzZXQgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgPHNwYW4+XG4gICAgICAgICAgICBoZWxsbyB8IDxzcGFuPmlubmVyPC9zcGFuPlxuICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICBlbnN1cmUgXCJkIGkgdFwiLCB0ZXh0OiBcIjxzcGFuPjwvc3Bhbj5cIlxuXG4gICAgICAgICAgaXQgXCJbb25lLWxpbmUtMV0gc2VsZWN0IGVuY2xvc2luZyB0YWdcIiwgLT5cbiAgICAgICAgICAgIHNldCB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICAgIDxzcGFuPiB8IDxzcGFuPmlubmVyPC9zcGFuPjwvc3Bhbj5cbiAgICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgICAgIGVuc3VyZSBcImQgaSB0XCIsIHRleHQ6IFwiPHNwYW4+PC9zcGFuPlwiXG5cbiAgICAgICAgICBpdCBcIltvbmUtbGluZS0yXSBzZWxlY3QgZW5jbG9zaW5nIHRhZ1wiLCAtPlxuICAgICAgICAgICAgc2V0IHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAgICAgPHNwYW4+aHxlbGxvPHNwYW4+aW5uZXI8L3NwYW4+PC9zcGFuPlxuICAgICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICAgICAgZW5zdXJlIFwiZCBpIHRcIiwgdGV4dDogXCI8c3Bhbj48L3NwYW4+XCJcblxuICAgIGRlc2NyaWJlIFwiYS10YWdcIiwgLT5cbiAgICAgIGRlc2NyaWJlIFwicHJlY2lzZWx5IHNlbGVjdCBhXCIsIC0+XG4gICAgICAgIGNoZWNrID0gZ2V0Q2hlY2tGdW5jdGlvbkZvcignYSB0JylcbiAgICAgICAgdGV4dCA9IFwiXCJcIlxuICAgICAgICAgIDxhYmM+XG4gICAgICAgICAgICA8dGl0bGU+VElUTEU8L3RpdGxlPlxuICAgICAgICAgIDwvYWJjPlxuICAgICAgICAgIFwiXCJcIlxuICAgICAgICBzZWxlY3RlZFRleHQgPSBcIjx0aXRsZT5USVRMRTwvdGl0bGU+XCJcbiAgICAgICAgYUFCQyA9IHRleHRcbiAgICAgICAgdGV4dEFmdGVyRGVsZXRlZCA9IFwiXCJcIlxuICAgICAgICAgIDxhYmM+XG4gICAgICAgICAgX19cbiAgICAgICAgICA8L2FiYz5cbiAgICAgICAgICBcIlwiXCIucmVwbGFjZSgvXy9nLCAnICcpXG5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIHNldCB7dGV4dH1cblxuICAgICAgICAjIFNlbGVjdFxuICAgICAgICBpdCBcIlsxXSBmb3J3YXJkaW5nXCIsIC0+IGNoZWNrIFsxLCAwXSwgJ3YnLCB7c2VsZWN0ZWRUZXh0fVxuICAgICAgICBpdCBcIlsyXSBvcGVuVGFnIGxlZnRtb3N0XCIsIC0+IGNoZWNrIFsxLCAyXSwgJ3YnLCB7c2VsZWN0ZWRUZXh0fVxuICAgICAgICBpdCBcIlszXSBvcGVuVGFnIHJpZ2h0bW9zdFwiLCAtPiBjaGVjayBbMSwgOF0sICd2Jywge3NlbGVjdGVkVGV4dH1cbiAgICAgICAgaXQgXCJbNF0gSW5uZXIgdGV4dFwiLCAtPiBjaGVjayBbMSwgMTBdLCAndicsIHtzZWxlY3RlZFRleHR9XG4gICAgICAgIGl0IFwiWzVdIGNsb3NlVGFnIGxlZnRtb3N0XCIsIC0+IGNoZWNrIFsxLCAxNF0sICd2Jywge3NlbGVjdGVkVGV4dH1cbiAgICAgICAgaXQgXCJbNl0gY2xvc2VUYWcgcmlnaHRtb3N0XCIsIC0+IGNoZWNrIFsxLCAyMV0sICd2Jywge3NlbGVjdGVkVGV4dH1cbiAgICAgICAgaXQgXCJbN10gcmlnaHQgb2YgY2xvc2VUYWdcIiwgLT4gY2hlY2sgWzIsIDBdLCAndicsIHtzZWxlY3RlZFRleHQ6IGFBQkN9XG5cbiAgICAgICAgIyBEZWxldGVcbiAgICAgICAgaXQgXCJbOF0gZm9yd2FyZGluZ1wiLCAtPiBjaGVjayBbMSwgMF0sICdkJywge3RleHQ6IHRleHRBZnRlckRlbGV0ZWR9XG4gICAgICAgIGl0IFwiWzldIG9wZW5UYWcgbGVmdG1vc3RcIiwgLT4gY2hlY2sgWzEsIDJdLCAnZCcsIHt0ZXh0OiB0ZXh0QWZ0ZXJEZWxldGVkfVxuICAgICAgICBpdCBcIlsxMF0gb3BlblRhZyByaWdodG1vc3RcIiwgLT4gY2hlY2sgWzEsIDhdLCAnZCcsIHt0ZXh0OiB0ZXh0QWZ0ZXJEZWxldGVkfVxuICAgICAgICBpdCBcIlsxMV0gSW5uZXIgdGV4dFwiLCAtPiBjaGVjayBbMSwgMTBdLCAnZCcsIHt0ZXh0OiB0ZXh0QWZ0ZXJEZWxldGVkfVxuICAgICAgICBpdCBcIlsxMl0gY2xvc2VUYWcgbGVmdG1vc3RcIiwgLT4gY2hlY2sgWzEsIDE0XSwgJ2QnLCB7dGV4dDogdGV4dEFmdGVyRGVsZXRlZH1cbiAgICAgICAgaXQgXCJbMTNdIGNsb3NlVGFnIHJpZ2h0bW9zdFwiLCAtPiBjaGVjayBbMSwgMjFdLCAnZCcsIHt0ZXh0OiB0ZXh0QWZ0ZXJEZWxldGVkfVxuICAgICAgICBpdCBcIlsxNF0gcmlnaHQgb2YgY2xvc2VUYWdcIiwgLT4gY2hlY2sgWzIsIDBdLCAnZCcsIHt0ZXh0OiBcIlwifVxuXG4gIGRlc2NyaWJlIFwiU3F1YXJlQnJhY2tldFwiLCAtPlxuICAgIGRlc2NyaWJlIFwiaW5uZXItc3F1YXJlLWJyYWNrZXRcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dDogXCJbIHNvbWV0aGluZyBpbiBoZXJlIGFuZCBpbiBbaGVyZV0gXVwiXG4gICAgICAgICAgY3Vyc29yOiBbMCwgOV1cblxuICAgICAgaXQgXCJhcHBsaWVzIG9wZXJhdG9ycyBpbnNpZGUgdGhlIGN1cnJlbnQgd29yZCBpbiBvcGVyYXRvci1wZW5kaW5nIG1vZGVcIiwgLT5cbiAgICAgICAgZW5zdXJlICdkIGkgWycsXG4gICAgICAgICAgdGV4dDogXCJbXVwiXG4gICAgICAgICAgY3Vyc29yOiBbMCwgMV1cblxuICAgICAgaXQgXCJhcHBsaWVzIG9wZXJhdG9ycyBpbnNpZGUgdGhlIGN1cnJlbnQgd29yZCBpbiBvcGVyYXRvci1wZW5kaW5nIG1vZGUgKHNlY29uZCB0ZXN0KVwiLCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICBjdXJzb3I6IFswLCAyOV1cbiAgICAgICAgZW5zdXJlICdkIGkgWycsXG4gICAgICAgICAgdGV4dDogXCJbIHNvbWV0aGluZyBpbiBoZXJlIGFuZCBpbiBbXSBdXCJcbiAgICAgICAgICBjdXJzb3I6IFswLCAyOF1cbiAgICBkZXNjcmliZSBcImEtc3F1YXJlLWJyYWNrZXRcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dDogXCJbIHNvbWV0aGluZyBpbiBoZXJlIGFuZCBpbiBbaGVyZV0gXVwiXG4gICAgICAgICAgY3Vyc29yOiBbMCwgOV1cblxuICAgICAgaXQgXCJhcHBsaWVzIG9wZXJhdG9ycyBhcm91bmQgdGhlIGN1cnJlbnQgc3F1YXJlIGJyYWNrZXRzIGluIG9wZXJhdG9yLXBlbmRpbmcgbW9kZVwiLCAtPlxuICAgICAgICBlbnN1cmUgJ2QgYSBbJyxcbiAgICAgICAgICB0ZXh0OiAnJ1xuICAgICAgICAgIGN1cnNvcjogWzAsIDBdXG4gICAgICAgICAgbW9kZTogJ25vcm1hbCdcblxuICAgICAgaXQgXCJhcHBsaWVzIG9wZXJhdG9ycyBhcm91bmQgdGhlIGN1cnJlbnQgc3F1YXJlIGJyYWNrZXRzIGluIG9wZXJhdG9yLXBlbmRpbmcgbW9kZSAoc2Vjb25kIHRlc3QpXCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFswLCAyOV1cbiAgICAgICAgZW5zdXJlICdkIGEgWycsXG4gICAgICAgICAgdGV4dDogXCJbIHNvbWV0aGluZyBpbiBoZXJlIGFuZCBpbiAgXVwiXG4gICAgICAgICAgY3Vyc29yOiBbMCwgMjddXG4gICAgICAgICAgbW9kZTogJ25vcm1hbCdcbiAgICAgIGRlc2NyaWJlIFwiY3Vyc29yIGlzIG9uIHRoZSBwYWlyIGNoYXJcIiwgLT5cbiAgICAgICAgY2hlY2sgPSBnZXRDaGVja0Z1bmN0aW9uRm9yKCdpIFsnKVxuICAgICAgICB0ZXh0ID0gJy1bK10tJ1xuICAgICAgICB0ZXh0RmluYWwgPSAnLVtdLSdcbiAgICAgICAgc2VsZWN0ZWRUZXh0ID0gJysnXG4gICAgICAgIG9wZW4gPSBbMCwgMV1cbiAgICAgICAgY2xvc2UgPSBbMCwgM11cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIHNldCB7dGV4dH1cbiAgICAgICAgaXQgXCJjYXNlLTEgbm9ybWFsXCIsIC0+IGNoZWNrIG9wZW4sICdkJywgdGV4dDogdGV4dEZpbmFsLCBjdXJzb3I6IFswLCAyXVxuICAgICAgICBpdCBcImNhc2UtMiBub3JtYWxcIiwgLT4gY2hlY2sgY2xvc2UsICdkJywgdGV4dDogdGV4dEZpbmFsLCBjdXJzb3I6IFswLCAyXVxuICAgICAgICBpdCBcImNhc2UtMyB2aXN1YWxcIiwgLT4gY2hlY2sgb3BlbiwgJ3YnLCB7c2VsZWN0ZWRUZXh0fVxuICAgICAgICBpdCBcImNhc2UtNCB2aXN1YWxcIiwgLT4gY2hlY2sgY2xvc2UsICd2Jywge3NlbGVjdGVkVGV4dH1cbiAgICAgIGRlc2NyaWJlIFwiY3Vyc29yIGlzIG9uIHRoZSBwYWlyIGNoYXJcIiwgLT5cbiAgICAgICAgY2hlY2sgPSBnZXRDaGVja0Z1bmN0aW9uRm9yKCdhIFsnKVxuICAgICAgICB0ZXh0ID0gJy1bK10tJ1xuICAgICAgICB0ZXh0RmluYWwgPSAnLS0nXG4gICAgICAgIHNlbGVjdGVkVGV4dCA9ICdbK10nXG4gICAgICAgIG9wZW4gPSBbMCwgMV1cbiAgICAgICAgY2xvc2UgPSBbMCwgM11cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIHNldCB7dGV4dH1cbiAgICAgICAgaXQgXCJjYXNlLTEgbm9ybWFsXCIsIC0+IGNoZWNrIG9wZW4sICdkJywgdGV4dDogdGV4dEZpbmFsLCBjdXJzb3I6IFswLCAxXVxuICAgICAgICBpdCBcImNhc2UtMiBub3JtYWxcIiwgLT4gY2hlY2sgY2xvc2UsICdkJywgdGV4dDogdGV4dEZpbmFsLCBjdXJzb3I6IFswLCAxXVxuICAgICAgICBpdCBcImNhc2UtMyB2aXN1YWxcIiwgLT4gY2hlY2sgb3BlbiwgJ3YnLCB7c2VsZWN0ZWRUZXh0fVxuICAgICAgICBpdCBcImNhc2UtNCB2aXN1YWxcIiwgLT4gY2hlY2sgY2xvc2UsICd2Jywge3NlbGVjdGVkVGV4dH1cbiAgZGVzY3JpYmUgXCJQYXJlbnRoZXNpc1wiLCAtPlxuICAgIGRlc2NyaWJlIFwiaW5uZXItcGFyZW50aGVzaXNcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dDogXCIoIHNvbWV0aGluZyBpbiBoZXJlIGFuZCBpbiAoaGVyZSkgKVwiXG4gICAgICAgICAgY3Vyc29yOiBbMCwgOV1cblxuICAgICAgaXQgXCJhcHBsaWVzIG9wZXJhdG9ycyBpbnNpZGUgdGhlIGN1cnJlbnQgd29yZCBpbiBvcGVyYXRvci1wZW5kaW5nIG1vZGVcIiwgLT5cbiAgICAgICAgZW5zdXJlICdkIGkgKCcsXG4gICAgICAgICAgdGV4dDogXCIoKVwiXG4gICAgICAgICAgY3Vyc29yOiBbMCwgMV1cblxuICAgICAgaXQgXCJhcHBsaWVzIG9wZXJhdG9ycyBpbnNpZGUgdGhlIGN1cnJlbnQgd29yZCBpbiBvcGVyYXRvci1wZW5kaW5nIG1vZGUgKHNlY29uZCB0ZXN0KVwiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMjldXG4gICAgICAgIGVuc3VyZSAnZCBpICgnLFxuICAgICAgICAgIHRleHQ6IFwiKCBzb21ldGhpbmcgaW4gaGVyZSBhbmQgaW4gKCkgKVwiXG4gICAgICAgICAgY3Vyc29yOiBbMCwgMjhdXG5cbiAgICAgIGl0IFwic2VsZWN0IGlubmVyICgpIGJ5IHNraXBwaW5nIG5lc3RpbmcgcGFpclwiLCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0OiAnZXhwZWN0KGVkaXRvci5nZXRTY3JvbGxUb3AoKSknXG4gICAgICAgICAgY3Vyc29yOiBbMCwgN11cbiAgICAgICAgZW5zdXJlICd2IGkgKCcsIHNlbGVjdGVkVGV4dDogJ2VkaXRvci5nZXRTY3JvbGxUb3AoKSdcblxuICAgICAgaXQgXCJza2lwIGVzY2FwZWQgcGFpciBjYXNlLTFcIiwgLT5cbiAgICAgICAgc2V0IHRleHQ6ICdleHBlY3QoZWRpdG9yLmdcXFxcKGV0U2Nyb2xsVHAoKSknLCBjdXJzb3I6IFswLCAyMF1cbiAgICAgICAgZW5zdXJlICd2IGkgKCcsIHNlbGVjdGVkVGV4dDogJ2VkaXRvci5nXFxcXChldFNjcm9sbFRwKCknXG5cbiAgICAgIGl0IFwiZG9udCBza2lwIGxpdGVyYWwgYmFja3NsYXNoXCIsIC0+XG4gICAgICAgIHNldCB0ZXh0OiAnZXhwZWN0KGVkaXRvci5nXFxcXFxcXFwoZXRTY3JvbGxUcCgpKScsIGN1cnNvcjogWzAsIDIwXVxuICAgICAgICBlbnN1cmUgJ3YgaSAoJywgc2VsZWN0ZWRUZXh0OiAnZXRTY3JvbGxUcCgpJ1xuXG4gICAgICBpdCBcInNraXAgZXNjYXBlZCBwYWlyIGNhc2UtMlwiLCAtPlxuICAgICAgICBzZXQgdGV4dDogJ2V4cGVjdChlZGl0b3IuZ2V0U2NcXFxcKXJvbGxUcCgpKScsIGN1cnNvcjogWzAsIDddXG4gICAgICAgIGVuc3VyZSAndiBpICgnLCBzZWxlY3RlZFRleHQ6ICdlZGl0b3IuZ2V0U2NcXFxcKXJvbGxUcCgpJ1xuXG4gICAgICBpdCBcInNraXAgZXNjYXBlZCBwYWlyIGNhc2UtM1wiLCAtPlxuICAgICAgICBzZXQgdGV4dDogJ2V4cGVjdChlZGl0b3IuZ2VcXFxcKHRTY1xcXFwpcm9sbFRwKCkpJywgY3Vyc29yOiBbMCwgN11cbiAgICAgICAgZW5zdXJlICd2IGkgKCcsIHNlbGVjdGVkVGV4dDogJ2VkaXRvci5nZVxcXFwodFNjXFxcXClyb2xsVHAoKSdcblxuICAgICAgaXQgXCJ3b3JrcyB3aXRoIG11bHRpcGxlIGN1cnNvcnNcIiwgLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dDogXCIoIGEgYiApIGNkZSAoIGYgZyBoICkgaWprXCJcbiAgICAgICAgICBjdXJzb3I6IFtbMCwgMl0sIFswLCAxOF1dXG4gICAgICAgIGVuc3VyZSAndiBpICgnLFxuICAgICAgICAgIHNlbGVjdGVkQnVmZmVyUmFuZ2U6IFtcbiAgICAgICAgICAgIFtbMCwgMV0sICBbMCwgNl1dXG4gICAgICAgICAgICBbWzAsIDEzXSwgWzAsIDIwXV1cbiAgICAgICAgICBdXG4gICAgICBkZXNjcmliZSBcImN1cnNvciBpcyBvbiB0aGUgcGFpciBjaGFyXCIsIC0+XG4gICAgICAgIGNoZWNrID0gZ2V0Q2hlY2tGdW5jdGlvbkZvcignaSAoJylcbiAgICAgICAgdGV4dCA9ICctKCspLSdcbiAgICAgICAgdGV4dEZpbmFsID0gJy0oKS0nXG4gICAgICAgIHNlbGVjdGVkVGV4dCA9ICcrJ1xuICAgICAgICBvcGVuID0gWzAsIDFdXG4gICAgICAgIGNsb3NlID0gWzAsIDNdXG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBzZXQge3RleHR9XG4gICAgICAgIGl0IFwiY2FzZS0xIG5vcm1hbFwiLCAtPiBjaGVjayBvcGVuLCAnZCcsIHRleHQ6IHRleHRGaW5hbCwgY3Vyc29yOiBbMCwgMl1cbiAgICAgICAgaXQgXCJjYXNlLTIgbm9ybWFsXCIsIC0+IGNoZWNrIGNsb3NlLCAnZCcsIHRleHQ6IHRleHRGaW5hbCwgY3Vyc29yOiBbMCwgMl1cbiAgICAgICAgaXQgXCJjYXNlLTMgdmlzdWFsXCIsIC0+IGNoZWNrIG9wZW4sICd2Jywge3NlbGVjdGVkVGV4dH1cbiAgICAgICAgaXQgXCJjYXNlLTQgdmlzdWFsXCIsIC0+IGNoZWNrIGNsb3NlLCAndicsIHtzZWxlY3RlZFRleHR9XG5cbiAgICBkZXNjcmliZSBcImEtcGFyZW50aGVzaXNcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dDogXCIoIHNvbWV0aGluZyBpbiBoZXJlIGFuZCBpbiAoaGVyZSkgKVwiXG4gICAgICAgICAgY3Vyc29yOiBbMCwgOV1cblxuICAgICAgaXQgXCJhcHBsaWVzIG9wZXJhdG9ycyBhcm91bmQgdGhlIGN1cnJlbnQgcGFyZW50aGVzZXMgaW4gb3BlcmF0b3ItcGVuZGluZyBtb2RlXCIsIC0+XG4gICAgICAgIGVuc3VyZSAnZCBhICgnLFxuICAgICAgICAgIHRleHQ6ICcnXG4gICAgICAgICAgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgICBtb2RlOiAnbm9ybWFsJ1xuXG4gICAgICBpdCBcImFwcGxpZXMgb3BlcmF0b3JzIGFyb3VuZCB0aGUgY3VycmVudCBwYXJlbnRoZXNlcyBpbiBvcGVyYXRvci1wZW5kaW5nIG1vZGUgKHNlY29uZCB0ZXN0KVwiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMjldXG4gICAgICAgIGVuc3VyZSAnZCBhICgnLFxuICAgICAgICAgIHRleHQ6IFwiKCBzb21ldGhpbmcgaW4gaGVyZSBhbmQgaW4gIClcIlxuICAgICAgICAgIGN1cnNvcjogWzAsIDI3XVxuICAgICAgZGVzY3JpYmUgXCJjdXJzb3IgaXMgb24gdGhlIHBhaXIgY2hhclwiLCAtPlxuICAgICAgICBjaGVjayA9IGdldENoZWNrRnVuY3Rpb25Gb3IoJ2EgKCcpXG4gICAgICAgIHRleHQgPSAnLSgrKS0nXG4gICAgICAgIHRleHRGaW5hbCA9ICctLSdcbiAgICAgICAgc2VsZWN0ZWRUZXh0ID0gJygrKSdcbiAgICAgICAgb3BlbiA9IFswLCAxXVxuICAgICAgICBjbG9zZSA9IFswLCAzXVxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgc2V0IHt0ZXh0fVxuICAgICAgICBpdCBcImNhc2UtMSBub3JtYWxcIiwgLT4gY2hlY2sgb3BlbiwgJ2QnLCB0ZXh0OiB0ZXh0RmluYWwsIGN1cnNvcjogWzAsIDFdXG4gICAgICAgIGl0IFwiY2FzZS0yIG5vcm1hbFwiLCAtPiBjaGVjayBjbG9zZSwgJ2QnLCB0ZXh0OiB0ZXh0RmluYWwsIGN1cnNvcjogWzAsIDFdXG4gICAgICAgIGl0IFwiY2FzZS0zIHZpc3VhbFwiLCAtPiBjaGVjayBvcGVuLCAndicsIHtzZWxlY3RlZFRleHR9XG4gICAgICAgIGl0IFwiY2FzZS00IHZpc3VhbFwiLCAtPiBjaGVjayBjbG9zZSwgJ3YnLCB7c2VsZWN0ZWRUZXh0fVxuXG4gIGRlc2NyaWJlIFwiUGFyYWdyYXBoXCIsIC0+XG4gICAgdGV4dCA9IG51bGxcbiAgICBlbnN1cmVQYXJhZ3JhcGggPSAoa2V5c3Ryb2tlLCBvcHRpb25zKSAtPlxuICAgICAgdW5sZXNzIG9wdGlvbnMuc2V0Q3Vyc29yXG4gICAgICAgIHRocm93IG5ldyBFcnJvdyhcIm5vIHNldEN1cnNvciBwcm92aWRlZFwiKVxuICAgICAgc2V0IGN1cnNvcjogb3B0aW9ucy5zZXRDdXJzb3JcbiAgICAgIGRlbGV0ZSBvcHRpb25zLnNldEN1cnNvclxuICAgICAgZW5zdXJlKGtleXN0cm9rZSwgb3B0aW9ucylcbiAgICAgIGVuc3VyZSgnZXNjYXBlJywgbW9kZTogJ25vcm1hbCcpXG5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICB0ZXh0ID0gbmV3IFRleHREYXRhIFwiXCJcIlxuXG4gICAgICAgIDE6IFAtMVxuXG4gICAgICAgIDM6IFAtMlxuICAgICAgICA0OiBQLTJcblxuXG4gICAgICAgIDc6IFAtM1xuICAgICAgICA4OiBQLTNcbiAgICAgICAgOTogUC0zXG5cblxuICAgICAgICBcIlwiXCJcbiAgICAgIHNldFxuICAgICAgICBjdXJzb3I6IFsxLCAwXVxuICAgICAgICB0ZXh0OiB0ZXh0LmdldFJhdygpXG5cbiAgICBkZXNjcmliZSBcImlubmVyLXBhcmFncmFwaFwiLCAtPlxuICAgICAgaXQgXCJzZWxlY3QgY29uc2VxdXRpdmUgYmxhbmsgcm93c1wiLCAtPlxuICAgICAgICBlbnN1cmVQYXJhZ3JhcGggJ3YgaSBwJywgc2V0Q3Vyc29yOiBbMCwgMF0sIHNlbGVjdGVkVGV4dDogdGV4dC5nZXRMaW5lcyhbMF0pXG4gICAgICAgIGVuc3VyZVBhcmFncmFwaCAndiBpIHAnLCBzZXRDdXJzb3I6IFsyLCAwXSwgc2VsZWN0ZWRUZXh0OiB0ZXh0LmdldExpbmVzKFsyXSlcbiAgICAgICAgZW5zdXJlUGFyYWdyYXBoICd2IGkgcCcsIHNldEN1cnNvcjogWzUsIDBdLCBzZWxlY3RlZFRleHQ6IHRleHQuZ2V0TGluZXMoWzUuLjZdKVxuICAgICAgaXQgXCJzZWxlY3QgY29uc2VxdXRpdmUgbm9uLWJsYW5rIHJvd3NcIiwgLT5cbiAgICAgICAgZW5zdXJlUGFyYWdyYXBoICd2IGkgcCcsIHNldEN1cnNvcjogWzEsIDBdLCBzZWxlY3RlZFRleHQ6IHRleHQuZ2V0TGluZXMoWzFdKVxuICAgICAgICBlbnN1cmVQYXJhZ3JhcGggJ3YgaSBwJywgc2V0Q3Vyc29yOiBbMywgMF0sIHNlbGVjdGVkVGV4dDogdGV4dC5nZXRMaW5lcyhbMy4uNF0pXG4gICAgICAgIGVuc3VyZVBhcmFncmFwaCAndiBpIHAnLCBzZXRDdXJzb3I6IFs3LCAwXSwgc2VsZWN0ZWRUZXh0OiB0ZXh0LmdldExpbmVzKFs3Li45XSlcbiAgICAgIGl0IFwib3BlcmF0ZSBvbiBpbm5lciBwYXJhZ3JhcGhcIiwgLT5cbiAgICAgICAgZW5zdXJlUGFyYWdyYXBoICd5IGkgcCcsIHNldEN1cnNvcjogWzcsIDBdLCByZWdpc3RlcjogJ1wiJzogdGV4dDogdGV4dC5nZXRMaW5lcyhbNywgOCwgOV0pXG5cbiAgICBkZXNjcmliZSBcImEtcGFyYWdyYXBoXCIsIC0+XG4gICAgICBpdCBcInNlbGVjdCB0d28gcGFyYWdyYXBoIGFzIG9uZSBvcGVyYXRpb25cIiwgLT5cbiAgICAgICAgZW5zdXJlUGFyYWdyYXBoICd2IGEgcCcsIHNldEN1cnNvcjogWzAsIDBdLCBzZWxlY3RlZFRleHQ6IHRleHQuZ2V0TGluZXMoWzAsIDFdKVxuICAgICAgICBlbnN1cmVQYXJhZ3JhcGggJ3YgYSBwJywgc2V0Q3Vyc29yOiBbMiwgMF0sIHNlbGVjdGVkVGV4dDogdGV4dC5nZXRMaW5lcyhbMi4uNF0pXG4gICAgICAgIGVuc3VyZVBhcmFncmFwaCAndiBhIHAnLCBzZXRDdXJzb3I6IFs1LCAwXSwgc2VsZWN0ZWRUZXh0OiB0ZXh0LmdldExpbmVzKFs1Li45XSlcbiAgICAgIGl0IFwic2VsZWN0IHR3byBwYXJhZ3JhcGggYXMgb25lIG9wZXJhdGlvblwiLCAtPlxuICAgICAgICBlbnN1cmVQYXJhZ3JhcGggJ3YgYSBwJywgc2V0Q3Vyc29yOiBbMSwgMF0sIHNlbGVjdGVkVGV4dDogdGV4dC5nZXRMaW5lcyhbMS4uMl0pXG4gICAgICAgIGVuc3VyZVBhcmFncmFwaCAndiBhIHAnLCBzZXRDdXJzb3I6IFszLCAwXSwgc2VsZWN0ZWRUZXh0OiB0ZXh0LmdldExpbmVzKFszLi42XSlcbiAgICAgICAgZW5zdXJlUGFyYWdyYXBoICd2IGEgcCcsIHNldEN1cnNvcjogWzcsIDBdLCBzZWxlY3RlZFRleHQ6IHRleHQuZ2V0TGluZXMoWzcuLjEwXSlcbiAgICAgIGl0IFwib3BlcmF0ZSBvbiBhIHBhcmFncmFwaFwiLCAtPlxuICAgICAgICBlbnN1cmVQYXJhZ3JhcGggJ3kgYSBwJywgc2V0Q3Vyc29yOiBbMywgMF0sIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiB0ZXh0LmdldExpbmVzKFszLi42XSlcblxuICBkZXNjcmliZSAnQ29tbWVudCcsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICAgIGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKCdsYW5ndWFnZS1jb2ZmZWUtc2NyaXB0JylcbiAgICAgIHJ1bnMgLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgZ3JhbW1hcjogJ3NvdXJjZS5jb2ZmZWUnXG4gICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgIyMjXG4gICAgICAgICAgbXVsdGlsaW5lIGNvbW1lbnRcbiAgICAgICAgICAjIyNcblxuICAgICAgICAgICMgT25lIGxpbmUgY29tbWVudFxuXG4gICAgICAgICAgIyBDb21tZW50XG4gICAgICAgICAgIyBib3JkZXJcbiAgICAgICAgICBjbGFzcyBRdWlja1NvcnRcbiAgICAgICAgICBcIlwiXCJcbiAgICBhZnRlckVhY2ggLT5cbiAgICAgIGF0b20ucGFja2FnZXMuZGVhY3RpdmF0ZVBhY2thZ2UoJ2xhbmd1YWdlLWNvZmZlZS1zY3JpcHQnKVxuXG4gICAgZGVzY3JpYmUgJ2lubmVyLWNvbW1lbnQnLCAtPlxuICAgICAgaXQgJ3NlbGVjdCBpbm5lciBjb21tZW50IGJsb2NrJywgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzAsIDBdXG4gICAgICAgIGVuc3VyZSAndiBpIC8nLFxuICAgICAgICAgIHNlbGVjdGVkVGV4dDogJyMjI1xcbm11bHRpbGluZSBjb21tZW50XFxuIyMjXFxuJ1xuICAgICAgICAgIHNlbGVjdGVkQnVmZmVyUmFuZ2U6IFtbMCwgMF0sIFszLCAwXV1cblxuICAgICAgaXQgJ3NlbGVjdCBvbmUgbGluZSBjb21tZW50JywgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzQsIDBdXG4gICAgICAgIGVuc3VyZSAndiBpIC8nLFxuICAgICAgICAgIHNlbGVjdGVkVGV4dDogJyMgT25lIGxpbmUgY29tbWVudFxcbidcbiAgICAgICAgICBzZWxlY3RlZEJ1ZmZlclJhbmdlOiBbWzQsIDBdLCBbNSwgMF1dXG5cbiAgICAgIGl0ICdub3Qgc2VsZWN0IG5vbi1jb21tZW50IGxpbmUnLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbNiwgMF1cbiAgICAgICAgZW5zdXJlICd2IGkgLycsXG4gICAgICAgICAgc2VsZWN0ZWRUZXh0OiAnIyBDb21tZW50XFxuIyBib3JkZXJcXG4nXG4gICAgICAgICAgc2VsZWN0ZWRCdWZmZXJSYW5nZTogW1s2LCAwXSwgWzgsIDBdXVxuXG4gIGRlc2NyaWJlICdJbmRlbnRhdGlvbicsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICAgIGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKCdsYW5ndWFnZS1jb2ZmZWUtc2NyaXB0JylcbiAgICAgIGdldFZpbVN0YXRlICdzYW1wbGUuY29mZmVlJywgKHZpbVN0YXRlLCB2aW0pIC0+XG4gICAgICAgIHtlZGl0b3IsIGVkaXRvckVsZW1lbnR9ID0gdmltU3RhdGVcbiAgICAgICAge3NldCwgZW5zdXJlLCBrZXlzdHJva2V9ID0gdmltXG4gICAgYWZ0ZXJFYWNoIC0+XG4gICAgICBhdG9tLnBhY2thZ2VzLmRlYWN0aXZhdGVQYWNrYWdlKCdsYW5ndWFnZS1jb2ZmZWUtc2NyaXB0JylcblxuICAgIGRlc2NyaWJlICdpbm5lci1pbmRlbnRhdGlvbicsIC0+XG4gICAgICBpdCAnc2VsZWN0IGxpbmVzIHdpdGggZGVlcGVyIGluZGVudC1sZXZlbCcsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFsxMiwgMF1cbiAgICAgICAgZW5zdXJlICd2IGkgaScsXG4gICAgICAgICAgc2VsZWN0ZWRCdWZmZXJSYW5nZTogW1sxMiwgMF0sIFsxNSwgMF1dXG4gICAgZGVzY3JpYmUgJ2EtaW5kZW50YXRpb24nLCAtPlxuICAgICAgaXQgJ3dvbnQgc3RvcCBvbiBibGFuayBsaW5lIHdoZW4gc2VsZWN0aW5nIGluZGVudCcsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFsxMiwgMF1cbiAgICAgICAgZW5zdXJlICd2IGEgaScsXG4gICAgICAgICAgc2VsZWN0ZWRCdWZmZXJSYW5nZTogW1sxMCwgMF0sIFsyNywgMF1dXG5cbiAgZGVzY3JpYmUgJ0ZvbGQnLCAtPlxuICAgIHJhbmdlRm9yUm93cyA9IChzdGFydFJvdywgZW5kUm93KSAtPlxuICAgICAgW1tzdGFydFJvdywgMF0sIFtlbmRSb3cgKyAxLCAwXV1cblxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgICBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZSgnbGFuZ3VhZ2UtY29mZmVlLXNjcmlwdCcpXG4gICAgICBnZXRWaW1TdGF0ZSAnc2FtcGxlLmNvZmZlZScsICh2aW1TdGF0ZSwgdmltKSAtPlxuICAgICAgICB7ZWRpdG9yLCBlZGl0b3JFbGVtZW50fSA9IHZpbVN0YXRlXG4gICAgICAgIHtzZXQsIGVuc3VyZSwga2V5c3Ryb2tlfSA9IHZpbVxuICAgIGFmdGVyRWFjaCAtPlxuICAgICAgYXRvbS5wYWNrYWdlcy5kZWFjdGl2YXRlUGFja2FnZSgnbGFuZ3VhZ2UtY29mZmVlLXNjcmlwdCcpXG5cbiAgICBkZXNjcmliZSAnaW5uZXItZm9sZCcsIC0+XG4gICAgICBpdCBcInNlbGVjdCBpbm5lciByYW5nZSBvZiBmb2xkXCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFsxMywgMF1cbiAgICAgICAgZW5zdXJlICd2IGkgeicsIHNlbGVjdGVkQnVmZmVyUmFuZ2U6IHJhbmdlRm9yUm93cygxMCwgMjUpXG5cbiAgICAgIGl0IFwic2VsZWN0IGlubmVyIHJhbmdlIG9mIGZvbGRcIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzE5LCAwXVxuICAgICAgICBlbnN1cmUgJ3YgaSB6Jywgc2VsZWN0ZWRCdWZmZXJSYW5nZTogcmFuZ2VGb3JSb3dzKDE5LCAyMylcblxuICAgICAgaXQgXCJjYW4gZXhwYW5kIHNlbGVjdGlvblwiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMjMsIDBdXG4gICAgICAgIGtleXN0cm9rZSAndidcbiAgICAgICAgZW5zdXJlICdpIHonLCBzZWxlY3RlZEJ1ZmZlclJhbmdlOiByYW5nZUZvclJvd3MoMjMsIDIzKVxuICAgICAgICBlbnN1cmUgJ2kgeicsIHNlbGVjdGVkQnVmZmVyUmFuZ2U6IHJhbmdlRm9yUm93cygxOSwgMjMpXG4gICAgICAgIGVuc3VyZSAnaSB6Jywgc2VsZWN0ZWRCdWZmZXJSYW5nZTogcmFuZ2VGb3JSb3dzKDEwLCAyNSlcbiAgICAgICAgZW5zdXJlICdpIHonLCBzZWxlY3RlZEJ1ZmZlclJhbmdlOiByYW5nZUZvclJvd3MoOSwgMjgpXG5cbiAgICAgIGRlc2NyaWJlIFwid2hlbiBzdGFydFJvdyBvZiBzZWxlY3Rpb24gaXMgb24gZm9sZCBzdGFydFJvd1wiLCAtPlxuICAgICAgICBpdCAnc2VsZWN0IGlubmVyIGZvbGQnLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFsyMCwgN11cbiAgICAgICAgICBlbnN1cmUgJ3YgaSB6Jywgc2VsZWN0ZWRCdWZmZXJSYW5nZTogcmFuZ2VGb3JSb3dzKDIxLCAyMSlcblxuICAgICAgZGVzY3JpYmUgXCJ3aGVuIGNvbnRhaW5pbmcgZm9sZCBhcmUgbm90IGZvdW5kXCIsIC0+XG4gICAgICAgIGl0IFwiZG8gbm90aGluZ1wiLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFsyMCwgMF1cbiAgICAgICAgICBlbnN1cmUgJ1YgRycsIHNlbGVjdGVkQnVmZmVyUmFuZ2U6IHJhbmdlRm9yUm93cygyMCwgMzApXG4gICAgICAgICAgZW5zdXJlICdpIHonLCBzZWxlY3RlZEJ1ZmZlclJhbmdlOiByYW5nZUZvclJvd3MoMjAsIDMwKVxuXG4gICAgICBkZXNjcmliZSBcIndoZW4gaW5kZW50IGxldmVsIG9mIGZvbGQgc3RhcnRSb3cgYW5kIGVuZFJvdyBpcyBzYW1lXCIsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAgICAgICAgIGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKCdsYW5ndWFnZS1qYXZhc2NyaXB0JylcbiAgICAgICAgICBnZXRWaW1TdGF0ZSAnc2FtcGxlLmpzJywgKHN0YXRlLCB2aW1FZGl0b3IpIC0+XG4gICAgICAgICAgICB7ZWRpdG9yLCBlZGl0b3JFbGVtZW50fSA9IHN0YXRlXG4gICAgICAgICAgICB7c2V0LCBlbnN1cmUsIGtleXN0cm9rZX0gPSB2aW1FZGl0b3JcbiAgICAgICAgYWZ0ZXJFYWNoIC0+XG4gICAgICAgICAgYXRvbS5wYWNrYWdlcy5kZWFjdGl2YXRlUGFja2FnZSgnbGFuZ3VhZ2UtamF2YXNjcmlwdCcpXG5cbiAgICAgICAgaXQgXCJkb2Vzbid0IHNlbGVjdCBmb2xkIGVuZFJvd1wiLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFs1LCAwXVxuICAgICAgICAgIGVuc3VyZSAndiBpIHonLCBzZWxlY3RlZEJ1ZmZlclJhbmdlOiByYW5nZUZvclJvd3MoNSwgNilcbiAgICAgICAgICBlbnN1cmUgJ2EgeicsIHNlbGVjdGVkQnVmZmVyUmFuZ2U6IHJhbmdlRm9yUm93cyg0LCA3KVxuXG4gICAgZGVzY3JpYmUgJ2EtZm9sZCcsIC0+XG4gICAgICBpdCAnc2VsZWN0IGZvbGQgcm93IHJhbmdlJywgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzEzLCAwXVxuICAgICAgICBlbnN1cmUgJ3YgYSB6Jywgc2VsZWN0ZWRCdWZmZXJSYW5nZTogcmFuZ2VGb3JSb3dzKDksIDI1KVxuXG4gICAgICBpdCAnc2VsZWN0IGZvbGQgcm93IHJhbmdlJywgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzE5LCAwXVxuICAgICAgICBlbnN1cmUgJ3YgYSB6Jywgc2VsZWN0ZWRCdWZmZXJSYW5nZTogcmFuZ2VGb3JSb3dzKDE4LCAyMylcblxuICAgICAgaXQgJ2NhbiBleHBhbmQgc2VsZWN0aW9uJywgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzIzLCAwXVxuICAgICAgICBrZXlzdHJva2UgJ3YnXG4gICAgICAgIGVuc3VyZSAnYSB6Jywgc2VsZWN0ZWRCdWZmZXJSYW5nZTogcmFuZ2VGb3JSb3dzKDIyLCAyMylcbiAgICAgICAgZW5zdXJlICdhIHonLCBzZWxlY3RlZEJ1ZmZlclJhbmdlOiByYW5nZUZvclJvd3MoMTgsIDIzKVxuICAgICAgICBlbnN1cmUgJ2EgeicsIHNlbGVjdGVkQnVmZmVyUmFuZ2U6IHJhbmdlRm9yUm93cyg5LCAyNSlcbiAgICAgICAgZW5zdXJlICdhIHonLCBzZWxlY3RlZEJ1ZmZlclJhbmdlOiByYW5nZUZvclJvd3MoOCwgMjgpXG5cbiAgICAgIGRlc2NyaWJlIFwid2hlbiBzdGFydFJvdyBvZiBzZWxlY3Rpb24gaXMgb24gZm9sZCBzdGFydFJvd1wiLCAtPlxuICAgICAgICBpdCAnc2VsZWN0IGZvbGQgc3RhcnRpbmcgZnJvbSBjdXJyZW50IHJvdycsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzIwLCA3XVxuICAgICAgICAgIGVuc3VyZSAndiBhIHonLCBzZWxlY3RlZEJ1ZmZlclJhbmdlOiByYW5nZUZvclJvd3MoMjAsIDIxKVxuXG4gICAgICBkZXNjcmliZSBcIndoZW4gY29udGFpbmluZyBmb2xkIGFyZSBub3QgZm91bmRcIiwgLT5cbiAgICAgICAgaXQgXCJkbyBub3RoaW5nXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzIwLCAwXVxuICAgICAgICAgIGVuc3VyZSAnViBHJywgc2VsZWN0ZWRCdWZmZXJSYW5nZTogcmFuZ2VGb3JSb3dzKDIwLCAzMClcbiAgICAgICAgICBlbnN1cmUgJ2EgeicsIHNlbGVjdGVkQnVmZmVyUmFuZ2U6IHJhbmdlRm9yUm93cygyMCwgMzApXG5cbiAgIyBBbHRob3VnaCBmb2xsb3dpbmcgdGVzdCBwaWNrcyBzcGVjaWZpYyBsYW5ndWFnZSwgb3RoZXIgbGFuZ2F1YWdlcyBhcmUgYWxzb2Ugc3VwcG9ydGVkLlxuICBkZXNjcmliZSAnRnVuY3Rpb24nLCAtPlxuICAgIGRlc2NyaWJlICdjb2ZmZWUnLCAtPlxuICAgICAgcGFjayA9ICdsYW5ndWFnZS1jb2ZmZWUtc2NyaXB0J1xuICAgICAgc2NvcGUgPSAnc291cmNlLmNvZmZlZSdcbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICAgICAgYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UocGFjaylcblxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgICMgQ29tbW1lbnRcblxuICAgICAgICAgICAgaGVsbG8gPSAtPlxuICAgICAgICAgICAgICBhID0gMVxuICAgICAgICAgICAgICBiID0gMlxuICAgICAgICAgICAgICBjID0gM1xuXG4gICAgICAgICAgICAjIENvbW1tZW50XG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICBjdXJzb3I6IFszLCAwXVxuXG4gICAgICAgIHJ1bnMgLT5cbiAgICAgICAgICBncmFtbWFyID0gYXRvbS5ncmFtbWFycy5ncmFtbWFyRm9yU2NvcGVOYW1lKHNjb3BlKVxuICAgICAgICAgIGVkaXRvci5zZXRHcmFtbWFyKGdyYW1tYXIpXG4gICAgICBhZnRlckVhY2ggLT5cbiAgICAgICAgYXRvbS5wYWNrYWdlcy5kZWFjdGl2YXRlUGFja2FnZShwYWNrKVxuXG4gICAgICBkZXNjcmliZSAnaW5uZXItZnVuY3Rpb24gZm9yIGNvZmZlZScsIC0+XG4gICAgICAgIGl0ICdzZWxlY3QgZXhjZXB0IHN0YXJ0IHJvdycsIC0+XG4gICAgICAgICAgZW5zdXJlICd2IGkgZicsIHNlbGVjdGVkQnVmZmVyUmFuZ2U6IFtbMywgMF0sIFs2LCAwXV1cblxuICAgICAgZGVzY3JpYmUgJ2EtZnVuY3Rpb24gZm9yIGNvZmZlZScsIC0+XG4gICAgICAgIGl0ICdzZWxlY3QgZnVuY3Rpb24nLCAtPlxuICAgICAgICAgIGVuc3VyZSAndiBhIGYnLCBzZWxlY3RlZEJ1ZmZlclJhbmdlOiBbWzIsIDBdLCBbNiwgMF1dXG5cbiAgICBkZXNjcmliZSAncnVieScsIC0+XG4gICAgICBwYWNrID0gJ2xhbmd1YWdlLXJ1YnknXG4gICAgICBzY29wZSA9ICdzb3VyY2UucnVieSdcbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICAgICAgYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UocGFjaylcbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICAjIENvbW1tZW50XG5cbiAgICAgICAgICAgIGRlZiBoZWxsb1xuICAgICAgICAgICAgICBhID0gMVxuICAgICAgICAgICAgICBiID0gMlxuICAgICAgICAgICAgICBjID0gM1xuICAgICAgICAgICAgZW5kXG5cbiAgICAgICAgICAgICMgQ29tbW1lbnRcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIGN1cnNvcjogWzMsIDBdXG4gICAgICAgIHJ1bnMgLT5cbiAgICAgICAgICBncmFtbWFyID0gYXRvbS5ncmFtbWFycy5ncmFtbWFyRm9yU2NvcGVOYW1lKHNjb3BlKVxuICAgICAgICAgIGVkaXRvci5zZXRHcmFtbWFyKGdyYW1tYXIpXG4gICAgICBhZnRlckVhY2ggLT5cbiAgICAgICAgYXRvbS5wYWNrYWdlcy5kZWFjdGl2YXRlUGFja2FnZShwYWNrKVxuXG4gICAgICBkZXNjcmliZSAnaW5uZXItZnVuY3Rpb24gZm9yIHJ1YnknLCAtPlxuICAgICAgICBpdCAnc2VsZWN0IGV4Y2VwdCBzdGFydCByb3cnLCAtPlxuICAgICAgICAgIGVuc3VyZSAndiBpIGYnLCBzZWxlY3RlZEJ1ZmZlclJhbmdlOiBbWzMsIDBdLCBbNiwgMF1dXG4gICAgICBkZXNjcmliZSAnYS1mdW5jdGlvbiBmb3IgcnVieScsIC0+XG4gICAgICAgIGl0ICdzZWxlY3QgZnVuY3Rpb24nLCAtPlxuICAgICAgICAgIGVuc3VyZSAndiBhIGYnLCBzZWxlY3RlZEJ1ZmZlclJhbmdlOiBbWzIsIDBdLCBbNywgMF1dXG5cbiAgICBkZXNjcmliZSAnZ28nLCAtPlxuICAgICAgcGFjayA9ICdsYW5ndWFnZS1nbydcbiAgICAgIHNjb3BlID0gJ3NvdXJjZS5nbydcbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICAgICAgYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UocGFjaylcbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICAvLyBDb21tbWVudFxuXG4gICAgICAgICAgICBmdW5jIG1haW4oKSB7XG4gICAgICAgICAgICAgIGEgOj0gMVxuICAgICAgICAgICAgICBiIDo9IDJcbiAgICAgICAgICAgICAgYyA6PSAzXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIENvbW1tZW50XG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICBjdXJzb3I6IFszLCAwXVxuICAgICAgICBydW5zIC0+XG4gICAgICAgICAgZ3JhbW1hciA9IGF0b20uZ3JhbW1hcnMuZ3JhbW1hckZvclNjb3BlTmFtZShzY29wZSlcbiAgICAgICAgICBlZGl0b3Iuc2V0R3JhbW1hcihncmFtbWFyKVxuICAgICAgYWZ0ZXJFYWNoIC0+XG4gICAgICAgIGF0b20ucGFja2FnZXMuZGVhY3RpdmF0ZVBhY2thZ2UocGFjaylcblxuICAgICAgZGVzY3JpYmUgJ2lubmVyLWZ1bmN0aW9uIGZvciBnbycsIC0+XG4gICAgICAgIGl0ICdzZWxlY3QgZXhjZXB0IHN0YXJ0IHJvdycsIC0+XG4gICAgICAgICAgZW5zdXJlICd2IGkgZicsIHNlbGVjdGVkQnVmZmVyUmFuZ2U6IFtbMywgMF0sIFs2LCAwXV1cblxuICAgICAgZGVzY3JpYmUgJ2EtZnVuY3Rpb24gZm9yIGdvJywgLT5cbiAgICAgICAgaXQgJ3NlbGVjdCBmdW5jdGlvbicsIC0+XG4gICAgICAgICAgZW5zdXJlICd2IGEgZicsIHNlbGVjdGVkQnVmZmVyUmFuZ2U6IFtbMiwgMF0sIFs3LCAwXV1cblxuICBkZXNjcmliZSAnQ3VycmVudExpbmUnLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNldFxuICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICBUaGlzIGlzXG4gICAgICAgICAgICBtdWx0aSBsaW5lXG4gICAgICAgICAgdGV4dFxuICAgICAgICAgIFwiXCJcIlxuXG4gICAgZGVzY3JpYmUgJ2lubmVyLWN1cnJlbnQtbGluZScsIC0+XG4gICAgICBpdCAnc2VsZWN0IGN1cnJlbnQgbGluZSB3aXRob3V0IGluY2x1ZGluZyBsYXN0IG5ld2xpbmUnLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgZW5zdXJlICd2IGkgbCcsIHNlbGVjdGVkVGV4dDogJ1RoaXMgaXMnXG4gICAgICBpdCAnYWxzbyBza2lwIGxlYWRpbmcgd2hpdGUgc3BhY2UnLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMSwgMF1cbiAgICAgICAgZW5zdXJlICd2IGkgbCcsIHNlbGVjdGVkVGV4dDogJ211bHRpIGxpbmUnXG4gICAgZGVzY3JpYmUgJ2EtY3VycmVudC1saW5lJywgLT5cbiAgICAgIGl0ICdzZWxlY3QgY3VycmVudCBsaW5lIHdpdGhvdXQgaW5jbHVkaW5nIGxhc3QgbmV3bGluZSBhcyBsaWtlIGB2aWxgJywgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzAsIDBdXG4gICAgICAgIGVuc3VyZSAndiBhIGwnLCBzZWxlY3RlZFRleHQ6ICdUaGlzIGlzJ1xuICAgICAgaXQgJ3dvbnQgc2tpcCBsZWFkaW5nIHdoaXRlIHNwYWNlIG5vdCBsaWtlIGB2aWxgJywgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzEsIDBdXG4gICAgICAgIGVuc3VyZSAndiBhIGwnLCBzZWxlY3RlZFRleHQ6ICcgIG11bHRpIGxpbmUnXG5cbiAgZGVzY3JpYmUgJ0FyZ3VtZW50cycsIC0+XG4gICAgZGVzY3JpYmUgJ2F1dG8tZGV0ZWN0IGlubmVyLXBhaXIgdGFyZ2V0JywgLT5cbiAgICAgIGRlc2NyaWJlICdpbm5lci1wYWlyIGlzIGNvbW1hIHNlcGFyYXRlZCcsIC0+XG4gICAgICAgIGl0IFwidGFyZ2V0IGlubmVyLXBhcmVuIGJ5IGF1dG8tZGV0ZWN0XCIsIC0+XG4gICAgICAgICAgc2V0IHRleHRDOiBcIigxfHN0LCAybmQpXCI7IGVuc3VyZSAnZCBpICwnLCB0ZXh0QzogXCIofCwgMm5kKVwiXG4gICAgICAgICAgc2V0IHRleHRDOiBcIigxfHN0LCAybmQpXCI7IGVuc3VyZSAnZCBhICwnLCB0ZXh0QzogXCIofDJuZClcIlxuICAgICAgICAgIHNldCB0ZXh0QzogXCIoMXN0LCAyfG5kKVwiOyBlbnN1cmUgJ2QgaSAsJywgdGV4dEM6IFwiKDFzdCwgfClcIlxuICAgICAgICAgIHNldCB0ZXh0QzogXCIoMXN0LCAyfG5kKVwiOyBlbnN1cmUgJ2QgYSAsJywgdGV4dEM6IFwiKDFzdHwpXCJcbiAgICAgICAgaXQgXCJ0YXJnZXQgaW5uZXItY3VybHktYnJhY2tldCBieSBhdXRvLWRldGVjdFwiLCAtPlxuICAgICAgICAgIHNldCB0ZXh0QzogXCJ7MXxzdCwgMm5kfVwiOyBlbnN1cmUgJ2QgaSAsJywgdGV4dEM6IFwie3wsIDJuZH1cIlxuICAgICAgICAgIHNldCB0ZXh0QzogXCJ7MXxzdCwgMm5kfVwiOyBlbnN1cmUgJ2QgYSAsJywgdGV4dEM6IFwie3wybmR9XCJcbiAgICAgICAgICBzZXQgdGV4dEM6IFwiezFzdCwgMnxuZH1cIjsgZW5zdXJlICdkIGkgLCcsIHRleHRDOiBcInsxc3QsIHx9XCJcbiAgICAgICAgICBzZXQgdGV4dEM6IFwiezFzdCwgMnxuZH1cIjsgZW5zdXJlICdkIGEgLCcsIHRleHRDOiBcInsxc3R8fVwiXG4gICAgICAgIGl0IFwidGFyZ2V0IGlubmVyLXNxdWFyZS1icmFja2V0IGJ5IGF1dG8tZGV0ZWN0XCIsIC0+XG4gICAgICAgICAgc2V0IHRleHRDOiBcIlsxfHN0LCAybmRdXCI7IGVuc3VyZSAnZCBpICwnLCB0ZXh0QzogXCJbfCwgMm5kXVwiXG4gICAgICAgICAgc2V0IHRleHRDOiBcIlsxfHN0LCAybmRdXCI7IGVuc3VyZSAnZCBhICwnLCB0ZXh0QzogXCJbfDJuZF1cIlxuICAgICAgICAgIHNldCB0ZXh0QzogXCJbMXN0LCAyfG5kXVwiOyBlbnN1cmUgJ2QgaSAsJywgdGV4dEM6IFwiWzFzdCwgfF1cIlxuICAgICAgICAgIHNldCB0ZXh0QzogXCJbMXN0LCAyfG5kXVwiOyBlbnN1cmUgJ2QgYSAsJywgdGV4dEM6IFwiWzFzdHxdXCJcbiAgICAgIGRlc2NyaWJlICdpbm5lci1wYWlyIGlzIHNwYWNlIHNlcGFyYXRlZCcsIC0+XG4gICAgICAgIGl0IFwidGFyZ2V0IGlubmVyLXBhcmVuIGJ5IGF1dG8tZGV0ZWN0XCIsIC0+XG4gICAgICAgICAgc2V0IHRleHRDOiBcIigxfHN0IDJuZClcIjsgZW5zdXJlICdkIGkgLCcsIHRleHRDOiBcIih8IDJuZClcIlxuICAgICAgICAgIHNldCB0ZXh0QzogXCIoMXxzdCAybmQpXCI7IGVuc3VyZSAnZCBhICwnLCB0ZXh0QzogXCIofDJuZClcIlxuICAgICAgICAgIHNldCB0ZXh0QzogXCIoMXN0IDJ8bmQpXCI7IGVuc3VyZSAnZCBpICwnLCB0ZXh0QzogXCIoMXN0IHwpXCJcbiAgICAgICAgICBzZXQgdGV4dEM6IFwiKDFzdCAyfG5kKVwiOyBlbnN1cmUgJ2QgYSAsJywgdGV4dEM6IFwiKDFzdHwpXCJcbiAgICAgICAgaXQgXCJ0YXJnZXQgaW5uZXItY3VybHktYnJhY2tldCBieSBhdXRvLWRldGVjdFwiLCAtPlxuICAgICAgICAgIHNldCB0ZXh0QzogXCJ7MXxzdCAybmR9XCI7IGVuc3VyZSAnZCBpICwnLCB0ZXh0QzogXCJ7fCAybmR9XCJcbiAgICAgICAgICBzZXQgdGV4dEM6IFwiezF8c3QgMm5kfVwiOyBlbnN1cmUgJ2QgYSAsJywgdGV4dEM6IFwie3wybmR9XCJcbiAgICAgICAgICBzZXQgdGV4dEM6IFwiezFzdCAyfG5kfVwiOyBlbnN1cmUgJ2QgaSAsJywgdGV4dEM6IFwiezFzdCB8fVwiXG4gICAgICAgICAgc2V0IHRleHRDOiBcInsxc3QgMnxuZH1cIjsgZW5zdXJlICdkIGEgLCcsIHRleHRDOiBcInsxc3R8fVwiXG4gICAgICAgIGl0IFwidGFyZ2V0IGlubmVyLXNxdWFyZS1icmFja2V0IGJ5IGF1dG8tZGV0ZWN0XCIsIC0+XG4gICAgICAgICAgc2V0IHRleHRDOiBcIlsxfHN0IDJuZF1cIjsgZW5zdXJlICdkIGkgLCcsIHRleHRDOiBcIlt8IDJuZF1cIlxuICAgICAgICAgIHNldCB0ZXh0QzogXCJbMXxzdCAybmRdXCI7IGVuc3VyZSAnZCBhICwnLCB0ZXh0QzogXCJbfDJuZF1cIlxuICAgICAgICAgIHNldCB0ZXh0QzogXCJbMXN0IDJ8bmRdXCI7IGVuc3VyZSAnZCBpICwnLCB0ZXh0QzogXCJbMXN0IHxdXCJcbiAgICAgICAgICBzZXQgdGV4dEM6IFwiWzFzdCAyfG5kXVwiOyBlbnN1cmUgJ2QgYSAsJywgdGV4dEM6IFwiWzFzdHxdXCJcbiAgICBkZXNjcmliZSBcIltmYWxsYmFja10gd2hlbiBhdXRvLWRldGVjdCBmYWlsZWQsIHRhcmdldCBjdXJyZW50LWxpbmVcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgaWYgaGVsbG8od29ybGQpIGFuZCBnb29kKGJ5ZSkge1xuICAgICAgICAgICAgMXN0O1xuICAgICAgICAgICAgMm5kO1xuICAgICAgICAgIH1cbiAgICAgICAgICBcIlwiXCJcblxuICAgICAgaXQgXCJkZWxldGUgMXN0IGVsZW0gb2YgaW5uZXItY3VybHktYnJhY2tldCB3aGVuIGF1dG8tZGV0ZWN0IHN1Y2NlZWRlZFwiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMSwgM11cbiAgICAgICAgZW5zdXJlICdkIGEgLCcsXG4gICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgIGlmIGhlbGxvKHdvcmxkKSBhbmQgZ29vZChieWUpIHtcbiAgICAgICAgICAgIHwybmQ7XG4gICAgICAgICAgfVxuICAgICAgICAgIFwiXCJcIlxuICAgICAgaXQgXCJkZWxldGUgMnN0IGVsZW0gb2YgaW5uZXItY3VybHktYnJhY2tldCB3aGVuIGF1dG8tZGV0ZWN0IHN1Y2NlZWRlZFwiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMiwgM11cbiAgICAgICAgZW5zdXJlICdkIGEgLCcsXG4gICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgIGlmIGhlbGxvKHdvcmxkKSBhbmQgZ29vZChieWUpIHtcbiAgICAgICAgICAgIDFzdHw7XG4gICAgICAgICAgfVxuICAgICAgICAgIFwiXCJcIlxuICAgICAgaXQgXCJkZWxldGUgMXN0IGVsZW0gb2YgY3VycmVudC1saW5lIHdoZW4gYXV0by1kZXRlY3QgZmFpbGVkXCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFswLCAwXVxuICAgICAgICBlbnN1cmUgJ2QgYSAsJyxcbiAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgfGhlbGxvKHdvcmxkKSBhbmQgZ29vZChieWUpIHtcbiAgICAgICAgICAgIDFzdDtcbiAgICAgICAgICAgIDJuZDtcbiAgICAgICAgICB9XG4gICAgICAgICAgXCJcIlwiXG4gICAgICBpdCBcImRlbGV0ZSAybmQgZWxlbSBvZiBjdXJyZW50LWxpbmUgd2hlbiBhdXRvLWRldGVjdCBmYWlsZWRcIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzAsIDNdXG4gICAgICAgIGVuc3VyZSAnZCBhICwnLFxuICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICBpZiB8YW5kIGdvb2QoYnllKSB7XG4gICAgICAgICAgICAxc3Q7XG4gICAgICAgICAgICAybmQ7XG4gICAgICAgICAgfVxuICAgICAgICAgIFwiXCJcIlxuICAgICAgaXQgXCJkZWxldGUgM3JkIGVsZW0gb2YgY3VycmVudC1saW5lIHdoZW4gYXV0by1kZXRlY3QgZmFpbGVkXCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFswLCAxNl1cbiAgICAgICAgZW5zdXJlICdkIGEgLCcsXG4gICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgIGlmIGhlbGxvKHdvcmxkKSB8Z29vZChieWUpIHtcbiAgICAgICAgICAgIDFzdDtcbiAgICAgICAgICAgIDJuZDtcbiAgICAgICAgICB9XG4gICAgICAgICAgXCJcIlwiXG4gICAgICBpdCBcImRlbGV0ZSA0dGggZWxlbSBvZiBjdXJyZW50LWxpbmUgd2hlbiBhdXRvLWRldGVjdCBmYWlsZWRcIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzAsIDIwXVxuICAgICAgICBlbnN1cmUgJ2QgYSAsJyxcbiAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgaWYgaGVsbG8od29ybGQpIGFuZCB8e1xuICAgICAgICAgICAgMXN0O1xuICAgICAgICAgICAgMm5kO1xuICAgICAgICAgIH1cbiAgICAgICAgICBcIlwiXCJcblxuICAgIGRlc2NyaWJlICdzbGluZ2xlIGxpbmUgY29tbWEgc2VwYXJhdGVkIHRleHQnLCAtPlxuICAgICAgZGVzY3JpYmUgXCJjaGFuZ2UgMXN0IGFyZ1wiLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+ICAgICAgICAgICAgICAgc2V0IHRleHRDOiBcInZhciBhID0gZnVuYyhmfGlyc3QoMSwgMiwgMyksIHNlY29uZCgpLCAzKVwiXG4gICAgICAgIGl0ICdjaGFuZ2UnLCAtPiBlbnN1cmUgJ2MgaSAsJywgdGV4dEM6IFwidmFyIGEgPSBmdW5jKHwsIHNlY29uZCgpLCAzKVwiXG4gICAgICAgIGl0ICdjaGFuZ2UnLCAtPiBlbnN1cmUgJ2MgYSAsJywgdGV4dEM6IFwidmFyIGEgPSBmdW5jKHxzZWNvbmQoKSwgMylcIlxuXG4gICAgICBkZXNjcmliZSAnY2hhbmdlIDJuZCBhcmcnLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+ICAgICAgICAgICAgICAgc2V0IHRleHRDOiBcInZhciBhID0gZnVuYyhmaXJzdCgxLCAyLCAzKSx8IHNlY29uZCgpLCAzKVwiXG4gICAgICAgIGl0ICdjaGFuZ2UnLCAtPiBlbnN1cmUgJ2MgaSAsJywgdGV4dEM6IFwidmFyIGEgPSBmdW5jKGZpcnN0KDEsIDIsIDMpLCB8LCAzKVwiXG4gICAgICAgIGl0ICdjaGFuZ2UnLCAtPiBlbnN1cmUgJ2MgYSAsJywgdGV4dEM6IFwidmFyIGEgPSBmdW5jKGZpcnN0KDEsIDIsIDMpLCB8MylcIlxuXG4gICAgICBkZXNjcmliZSAnY2hhbmdlIDNyZCBhcmcnLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+ICAgICAgICAgICAgICAgc2V0IHRleHRDOiBcInZhciBhID0gZnVuYyhmaXJzdCgxLCAyLCAzKSwgc2Vjb25kKCksfCAzKVwiXG4gICAgICAgIGl0ICdjaGFuZ2UnLCAtPiBlbnN1cmUgJ2MgaSAsJywgdGV4dEM6IFwidmFyIGEgPSBmdW5jKGZpcnN0KDEsIDIsIDMpLCBzZWNvbmQoKSwgfClcIlxuICAgICAgICBpdCAnY2hhbmdlJywgLT4gZW5zdXJlICdjIGEgLCcsIHRleHRDOiBcInZhciBhID0gZnVuYyhmaXJzdCgxLCAyLCAzKSwgc2Vjb25kKCl8KVwiXG5cbiAgICAgIGRlc2NyaWJlICd3aGVuIGN1cnNvciBpcyBvbi1jb21tYS1zZXBhcmF0b3IsIGl0IGFmZmVjdHMgcHJlY2VlZGluZyBhcmcnLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+ICAgICAgICAgICAgICAgICAgIHNldCB0ZXh0QzogXCJ2YXIgYSA9IGZ1bmMoZmlyc3QoMSwgMiwgMyl8LCBzZWNvbmQoKSwgMylcIlxuICAgICAgICBpdCAnY2hhbmdlIDFzdCcsIC0+IGVuc3VyZSAnYyBpICwnLCB0ZXh0QzogXCJ2YXIgYSA9IGZ1bmMofCwgc2Vjb25kKCksIDMpXCJcbiAgICAgICAgaXQgJ2NoYW5nZSAxc3QnLCAtPiBlbnN1cmUgJ2MgYSAsJywgdGV4dEM6IFwidmFyIGEgPSBmdW5jKHxzZWNvbmQoKSwgMylcIlxuXG4gICAgICBkZXNjcmliZSAnY3Vyc29yLWlzLW9uLXdoaXRlLXNwYWNlLCBpdCBhZmZlY3RzIGZvbGxvd2VkIGFyZycsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT4gICAgICAgICAgICAgICAgICAgc2V0IHRleHRDOiBcInZhciBhID0gZnVuYyhmaXJzdCgxLCAyLCAzKSx8IHNlY29uZCgpLCAzKVwiXG4gICAgICAgIGl0ICdjaGFuZ2UgMm5kJywgLT4gZW5zdXJlICdjIGkgLCcsIHRleHRDOiBcInZhciBhID0gZnVuYyhmaXJzdCgxLCAyLCAzKSwgfCwgMylcIlxuICAgICAgICBpdCAnY2hhbmdlIDJuZCcsIC0+IGVuc3VyZSAnYyBhICwnLCB0ZXh0QzogXCJ2YXIgYSA9IGZ1bmMoZmlyc3QoMSwgMiwgMyksIHwzKVwiXG5cbiAgICAgIGRlc2NyaWJlIFwiY3Vyc29yLWlzLW9uLXBhcmVodGhlc2lzLCBpdCB3b250IHRhcmdldCBpbm5lci1wYXJlbnRcIiwgLT5cbiAgICAgICAgaXQgJ2NoYW5nZSAxc3Qgb2Ygb3V0ZXItcGFyZW4nLCAtPlxuICAgICAgICAgIHNldCB0ZXh0QzogXCJ2YXIgYSA9IGZ1bmMoZmlyc3R8KDEsIDIsIDMpLCBzZWNvbmQoKSwgMylcIlxuICAgICAgICAgIGVuc3VyZSAnYyBpICwnLCB0ZXh0QzogXCJ2YXIgYSA9IGZ1bmMofCwgc2Vjb25kKCksIDMpXCJcbiAgICAgICAgaXQgJ2NoYW5nZSAzcmQgb2Ygb3V0ZXItcGFyZW4nLCAtPlxuICAgICAgICAgIHNldCB0ZXh0QzogXCJ2YXIgYSA9IGZ1bmMoZmlyc3QoMSwgMiwgM3wpLCBzZWNvbmQoKSwgMylcIlxuICAgICAgICAgIGVuc3VyZSAnYyBpICwnLCB0ZXh0QzogXCJ2YXIgYSA9IGZ1bmMofCwgc2Vjb25kKCksIDMpXCJcblxuICAgICAgZGVzY3JpYmUgXCJjdXJzb3ItaXMtbmV4dC1vci1iZWZvcmUgcGFyZWh0aGVzaXMsIGl0IHRhcmdldCBpbm5lci1wYXJlbnRcIiwgLT5cbiAgICAgICAgaXQgJ2NoYW5nZSAxc3Qgb2YgaW5uZXItcGFyZW4nLCAtPlxuICAgICAgICAgIHNldCB0ZXh0QzogXCJ2YXIgYSA9IGZ1bmMoZmlyc3QofDEsIDIsIDMpLCBzZWNvbmQoKSwgMylcIlxuICAgICAgICAgIGVuc3VyZSAnYyBpICwnLCB0ZXh0QzogXCJ2YXIgYSA9IGZ1bmMoZmlyc3QofCwgMiwgMyksIHNlY29uZCgpLCAzKVwiXG4gICAgICAgIGl0ICdjaGFuZ2UgM3JkIG9mIGlubmVyLXBhcmVuJywgLT5cbiAgICAgICAgICBzZXQgdGV4dEM6IFwidmFyIGEgPSBmdW5jKGZpcnN0KDEsIDIsIHwzKSwgc2Vjb25kKCksIDMpXCJcbiAgICAgICAgICBlbnN1cmUgJ2MgaSAsJywgdGV4dEM6IFwidmFyIGEgPSBmdW5jKGZpcnN0KDEsIDIsIHwpLCBzZWNvbmQoKSwgMylcIlxuXG4gICAgZGVzY3JpYmUgJ3NsaW5nbGUgbGluZSBzcGFjZSBzZXBhcmF0ZWQgdGV4dCcsIC0+XG4gICAgICBkZXNjcmliZSBcImNoYW5nZSAxc3QgYXJnXCIsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT4gICAgICAgICAgICAgICBzZXQgdGV4dEM6IFwiJXcofDFzdCAybmQgM3JkKVwiXG4gICAgICAgIGl0ICdjaGFuZ2UnLCAtPiBlbnN1cmUgJ2MgaSAsJywgdGV4dEM6IFwiJXcofCAybmQgM3JkKVwiXG4gICAgICAgIGl0ICdjaGFuZ2UnLCAtPiBlbnN1cmUgJ2MgYSAsJywgdGV4dEM6IFwiJXcofDJuZCAzcmQpXCJcbiAgICAgIGRlc2NyaWJlIFwiY2hhbmdlIDJuZCBhcmdcIiwgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPiAgICAgICAgICAgICAgIHNldCB0ZXh0QzogXCIldygxc3QgfDJuZCAzcmQpXCJcbiAgICAgICAgaXQgJ2NoYW5nZScsIC0+IGVuc3VyZSAnYyBpICwnLCB0ZXh0QzogXCIldygxc3QgfCAzcmQpXCJcbiAgICAgICAgaXQgJ2NoYW5nZScsIC0+IGVuc3VyZSAnYyBhICwnLCB0ZXh0QzogXCIldygxc3QgfDNyZClcIlxuICAgICAgZGVzY3JpYmUgXCJjaGFuZ2UgMm5kIGFyZ1wiLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+ICAgICAgICAgICAgICAgc2V0IHRleHRDOiBcIiV3KDFzdCAybmQgfDNyZClcIlxuICAgICAgICBpdCAnY2hhbmdlJywgLT4gZW5zdXJlICdjIGkgLCcsIHRleHRDOiBcIiV3KDFzdCAybmQgfClcIlxuICAgICAgICBpdCAnY2hhbmdlJywgLT4gZW5zdXJlICdjIGEgLCcsIHRleHRDOiBcIiV3KDFzdCAybmR8KVwiXG5cbiAgICBkZXNjcmliZSAnbXVsdGkgbGluZSBjb21tYSBzZXBhcmF0ZWQgdGV4dCcsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHRDXzogXCJcIlwiXG4gICAgICAgICAgW1xuICAgICAgICAgICAgXCIxc3QgZWxlbSBpcyBzdHJpbmdcIixcbiAgICAgICAgICAgICgpID0+IGhlbGxvKCcybmQgZWxtIGlzIGZ1bmN0aW9uJyksXG4gICAgICAgICAgICAzcmRFbG1IYXNUcmFpbGluZ0NvbW1hLFxuICAgICAgICAgIF1cbiAgICAgICAgICBcIlwiXCJcbiAgICAgIGRlc2NyaWJlIFwiY2hhbmdlIDFzdCBhcmdcIiwgLT5cbiAgICAgICAgaXQgJ2NoYW5nZSAxc3QgaW5uZXItYXJnJywgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMSwgMF1cbiAgICAgICAgICBlbnN1cmUgJ2MgaSAsJyxcbiAgICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgfCxcbiAgICAgICAgICAgICAgKCkgPT4gaGVsbG8oJzJuZCBlbG0gaXMgZnVuY3Rpb24nKSxcbiAgICAgICAgICAgICAgM3JkRWxtSGFzVHJhaWxpbmdDb21tYSxcbiAgICAgICAgICAgIF1cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICBpdCAnY2hhbmdlIDFzdCBhLWFyZycsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzEsIDBdXG4gICAgICAgICAgZW5zdXJlICdjIGEgLCcsXG4gICAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICBbXG4gICAgICAgICAgICAgIHwoKSA9PiBoZWxsbygnMm5kIGVsbSBpcyBmdW5jdGlvbicpLFxuICAgICAgICAgICAgICAzcmRFbG1IYXNUcmFpbGluZ0NvbW1hLFxuICAgICAgICAgICAgXVxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgIGl0ICdjaGFuZ2UgMm5kIGlubmVyLWFyZycsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzIsIDBdXG4gICAgICAgICAgZW5zdXJlICdjIGkgLCcsXG4gICAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICBbXG4gICAgICAgICAgICAgIFwiMXN0IGVsZW0gaXMgc3RyaW5nXCIsXG4gICAgICAgICAgICAgIHwsXG4gICAgICAgICAgICAgIDNyZEVsbUhhc1RyYWlsaW5nQ29tbWEsXG4gICAgICAgICAgICBdXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgaXQgJ2NoYW5nZSAybmQgYS1hcmcnLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFsyLCAwXVxuICAgICAgICAgIGVuc3VyZSAnYyBhICwnLFxuICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgW1xuICAgICAgICAgICAgICBcIjFzdCBlbGVtIGlzIHN0cmluZ1wiLFxuICAgICAgICAgICAgICB8M3JkRWxtSGFzVHJhaWxpbmdDb21tYSxcbiAgICAgICAgICAgIF1cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICBpdCAnY2hhbmdlIDNyZCBpbm5lci1hcmcnLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFszLCAwXVxuICAgICAgICAgIGVuc3VyZSAnYyBpICwnLFxuICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgW1xuICAgICAgICAgICAgICBcIjFzdCBlbGVtIGlzIHN0cmluZ1wiLFxuICAgICAgICAgICAgICAoKSA9PiBoZWxsbygnMm5kIGVsbSBpcyBmdW5jdGlvbicpLFxuICAgICAgICAgICAgICB8LFxuICAgICAgICAgICAgXVxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgIGl0ICdjaGFuZ2UgM3JkIGEtYXJnJywgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMywgMF1cbiAgICAgICAgICBlbnN1cmUgJ2MgYSAsJyxcbiAgICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgXCIxc3QgZWxlbSBpcyBzdHJpbmdcIixcbiAgICAgICAgICAgICAgKCkgPT4gaGVsbG8oJzJuZCBlbG0gaXMgZnVuY3Rpb24nKXwsXG4gICAgICAgICAgICBdXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgIGRlc2NyaWJlICd3aGVuIGl0IGNvdWRudCBmaW5kIGlubmVyLXBhaXIgZnJvbSBjdXJzb3IgaXQgdGFyZ2V0IGN1cnJlbnQtbGluZScsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHRDXzogXCJcIlwiXG4gICAgICAgICAgaWYgfGlzTW9ybmluZyh0aW1lLCBvZiwgdGhlLCBkYXkpIHtcbiAgICAgICAgICAgIGhlbGxsbyhcIndvcmxkXCIpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBcIlwiXCJcbiAgICAgIGl0IFwiY2hhbmdlIGlubmVyLWFyZ1wiLCAtPlxuICAgICAgICBlbnN1cmUgXCJjIGkgLFwiLFxuICAgICAgICAgIHRleHRDXzogXCJcIlwiXG4gICAgICAgICAgaWYgfCB7XG4gICAgICAgICAgICBoZWxsbG8oXCJ3b3JsZFwiKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgXCJcIlwiXG4gICAgICBpdCBcImNoYW5nZSBhLWFyZ1wiLCAtPlxuICAgICAgICBlbnN1cmUgXCJjIGEgLFwiLFxuICAgICAgICAgIHRleHRDXzogXCJcIlwiXG4gICAgICAgICAgaWYgfHtcbiAgICAgICAgICAgIGhlbGxsbyhcIndvcmxkXCIpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBcIlwiXCJcblxuICBkZXNjcmliZSAnRW50aXJlJywgLT5cbiAgICB0ZXh0ID0gXCJcIlwiXG4gICAgICBUaGlzIGlzXG4gICAgICAgIG11bHRpIGxpbmVcbiAgICAgIHRleHRcbiAgICAgIFwiXCJcIlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNldCB0ZXh0OiB0ZXh0LCBjdXJzb3I6IFswLCAwXVxuICAgIGRlc2NyaWJlICdpbm5lci1lbnRpcmUnLCAtPlxuICAgICAgaXQgJ3NlbGVjdCBlbnRpcmUgYnVmZmVyJywgLT5cbiAgICAgICAgZW5zdXJlICdlc2NhcGUnLCBzZWxlY3RlZFRleHQ6ICcnXG4gICAgICAgIGVuc3VyZSAndiBpIGUnLCBzZWxlY3RlZFRleHQ6IHRleHRcbiAgICAgICAgZW5zdXJlICdlc2NhcGUnLCBzZWxlY3RlZFRleHQ6ICcnXG4gICAgICAgIGVuc3VyZSAnaiBqIHYgaSBlJywgc2VsZWN0ZWRUZXh0OiB0ZXh0XG4gICAgZGVzY3JpYmUgJ2EtZW50aXJlJywgLT5cbiAgICAgIGl0ICdzZWxlY3QgZW50aXJlIGJ1ZmZlcicsIC0+XG4gICAgICAgIGVuc3VyZSAnZXNjYXBlJywgc2VsZWN0ZWRUZXh0OiAnJ1xuICAgICAgICBlbnN1cmUgJ3YgYSBlJywgc2VsZWN0ZWRUZXh0OiB0ZXh0XG4gICAgICAgIGVuc3VyZSAnZXNjYXBlJywgc2VsZWN0ZWRUZXh0OiAnJ1xuICAgICAgICBlbnN1cmUgJ2ogaiB2IGEgZScsIHNlbGVjdGVkVGV4dDogdGV4dFxuXG4gIGRlc2NyaWJlICdTZWFyY2hNYXRjaEZvcndhcmQsIFNlYXJjaEJhY2t3YXJkcycsIC0+XG4gICAgdGV4dCA9IFwiXCJcIlxuICAgICAgMCB4eHhcbiAgICAgIDEgYWJjIHh4eFxuICAgICAgMiAgIHh4eCB5eXlcbiAgICAgIDMgeHh4IGFiY1xuICAgICAgNCBhYmNcXG5cbiAgICAgIFwiXCJcIlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIGphc21pbmUuYXR0YWNoVG9ET00oYXRvbS52aWV3cy5nZXRWaWV3KGF0b20ud29ya3NwYWNlKSlcblxuICAgICAgc2V0IHRleHQ6IHRleHQsIGN1cnNvcjogWzAsIDBdXG4gICAgICBlbnN1cmUgWycvJywgc2VhcmNoOiAnYWJjJ10sIGN1cnNvcjogWzEsIDJdLCBtb2RlOiAnbm9ybWFsJ1xuICAgICAgZXhwZWN0KHZpbVN0YXRlLmdsb2JhbFN0YXRlLmdldCgnbGFzdFNlYXJjaFBhdHRlcm4nKSkudG9FcXVhbCAvYWJjL2dcblxuICAgIGRlc2NyaWJlICdnbiBmcm9tIG5vcm1hbCBtb2RlJywgLT5cbiAgICAgIGl0ICdzZWxlY3QgcmFuZ2VzIG1hdGNoZXMgdG8gbGFzdCBzZWFyY2ggcGF0dGVybiBhbmQgZXh0ZW5kIHNlbGVjdGlvbicsIC0+XG4gICAgICAgIGVuc3VyZSAnZyBuJyxcbiAgICAgICAgICBjdXJzb3I6IFsxLCA1XVxuICAgICAgICAgIG1vZGU6IFsndmlzdWFsJywgJ2NoYXJhY3Rlcndpc2UnXVxuICAgICAgICAgIHNlbGVjdGlvbklzUmV2ZXJzZWQ6IGZhbHNlXG4gICAgICAgICAgc2VsZWN0ZWRUZXh0OiAnYWJjJ1xuICAgICAgICBlbnN1cmUgJ2cgbicsXG4gICAgICAgICAgc2VsZWN0aW9uSXNSZXZlcnNlZDogZmFsc2VcbiAgICAgICAgICBtb2RlOiBbJ3Zpc3VhbCcsICdjaGFyYWN0ZXJ3aXNlJ11cbiAgICAgICAgICBzZWxlY3RlZFRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgYWJjIHh4eFxuICAgICAgICAgICAgMiAgIHh4eCB5eXlcbiAgICAgICAgICAgIDMgeHh4IGFiY1xuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgIGVuc3VyZSAnZyBuJyxcbiAgICAgICAgICBzZWxlY3Rpb25Jc1JldmVyc2VkOiBmYWxzZVxuICAgICAgICAgIG1vZGU6IFsndmlzdWFsJywgJ2NoYXJhY3Rlcndpc2UnXVxuICAgICAgICAgIHNlbGVjdGVkVGV4dDogXCJcIlwiXG4gICAgICAgICAgICBhYmMgeHh4XG4gICAgICAgICAgICAyICAgeHh4IHl5eVxuICAgICAgICAgICAgMyB4eHggYWJjXG4gICAgICAgICAgICA0IGFiY1xuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgIGVuc3VyZSAnZyBuJywgIyBEbyBub3RoaW5nXG4gICAgICAgICAgc2VsZWN0aW9uSXNSZXZlcnNlZDogZmFsc2VcbiAgICAgICAgICBtb2RlOiBbJ3Zpc3VhbCcsICdjaGFyYWN0ZXJ3aXNlJ11cbiAgICAgICAgICBzZWxlY3RlZFRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgYWJjIHh4eFxuICAgICAgICAgICAgMiAgIHh4eCB5eXlcbiAgICAgICAgICAgIDMgeHh4IGFiY1xuICAgICAgICAgICAgNCBhYmNcbiAgICAgICAgICAgIFwiXCJcIlxuICAgIGRlc2NyaWJlICdnTiBmcm9tIG5vcm1hbCBtb2RlJywgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzQsIDNdXG4gICAgICBpdCAnc2VsZWN0IHJhbmdlcyBtYXRjaGVzIHRvIGxhc3Qgc2VhcmNoIHBhdHRlcm4gYW5kIGV4dGVuZCBzZWxlY3Rpb24nLCAtPlxuICAgICAgICBlbnN1cmUgJ2cgTicsXG4gICAgICAgICAgY3Vyc29yOiBbNCwgMl1cbiAgICAgICAgICBtb2RlOiBbJ3Zpc3VhbCcsICdjaGFyYWN0ZXJ3aXNlJ11cbiAgICAgICAgICBzZWxlY3Rpb25Jc1JldmVyc2VkOiB0cnVlXG4gICAgICAgICAgc2VsZWN0ZWRUZXh0OiAnYWJjJ1xuICAgICAgICBlbnN1cmUgJ2cgTicsXG4gICAgICAgICAgc2VsZWN0aW9uSXNSZXZlcnNlZDogdHJ1ZVxuICAgICAgICAgIG1vZGU6IFsndmlzdWFsJywgJ2NoYXJhY3Rlcndpc2UnXVxuICAgICAgICAgIHNlbGVjdGVkVGV4dDogXCJcIlwiXG4gICAgICAgICAgICBhYmNcbiAgICAgICAgICAgIDQgYWJjXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgZW5zdXJlICdnIE4nLFxuICAgICAgICAgIHNlbGVjdGlvbklzUmV2ZXJzZWQ6IHRydWVcbiAgICAgICAgICBtb2RlOiBbJ3Zpc3VhbCcsICdjaGFyYWN0ZXJ3aXNlJ11cbiAgICAgICAgICBzZWxlY3RlZFRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgYWJjIHh4eFxuICAgICAgICAgICAgMiAgIHh4eCB5eXlcbiAgICAgICAgICAgIDMgeHh4IGFiY1xuICAgICAgICAgICAgNCBhYmNcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICBlbnN1cmUgJ2cgTicsICMgRG8gbm90aGluZ1xuICAgICAgICAgIHNlbGVjdGlvbklzUmV2ZXJzZWQ6IHRydWVcbiAgICAgICAgICBtb2RlOiBbJ3Zpc3VhbCcsICdjaGFyYWN0ZXJ3aXNlJ11cbiAgICAgICAgICBzZWxlY3RlZFRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgYWJjIHh4eFxuICAgICAgICAgICAgMiAgIHh4eCB5eXlcbiAgICAgICAgICAgIDMgeHh4IGFiY1xuICAgICAgICAgICAgNCBhYmNcbiAgICAgICAgICAgIFwiXCJcIlxuICAgIGRlc2NyaWJlICdhcyBvcGVyYXRvciB0YXJnZXQnLCAtPlxuICAgICAgaXQgJ2RlbGV0ZSBuZXh0IG9jY3VycmVuY2Ugb2YgbGFzdCBzZWFyY2ggcGF0dGVybicsIC0+XG4gICAgICAgIGVuc3VyZSAnZCBnIG4nLFxuICAgICAgICAgIGN1cnNvcjogWzEsIDJdXG4gICAgICAgICAgbW9kZTogJ25vcm1hbCdcbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIDAgeHh4XG4gICAgICAgICAgICAxICB4eHhcbiAgICAgICAgICAgIDIgICB4eHggeXl5XG4gICAgICAgICAgICAzIHh4eCBhYmNcbiAgICAgICAgICAgIDQgYWJjXFxuXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgZW5zdXJlICcuJyxcbiAgICAgICAgICBjdXJzb3I6IFszLCA1XVxuICAgICAgICAgIG1vZGU6ICdub3JtYWwnXG4gICAgICAgICAgdGV4dF86IFwiXCJcIlxuICAgICAgICAgICAgMCB4eHhcbiAgICAgICAgICAgIDEgIHh4eFxuICAgICAgICAgICAgMiAgIHh4eCB5eXlcbiAgICAgICAgICAgIDMgeHh4X1xuICAgICAgICAgICAgNCBhYmNcXG5cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICBlbnN1cmUgJy4nLFxuICAgICAgICAgIGN1cnNvcjogWzQsIDFdXG4gICAgICAgICAgbW9kZTogJ25vcm1hbCdcbiAgICAgICAgICB0ZXh0XzogXCJcIlwiXG4gICAgICAgICAgICAwIHh4eFxuICAgICAgICAgICAgMSAgeHh4XG4gICAgICAgICAgICAyICAgeHh4IHl5eVxuICAgICAgICAgICAgMyB4eHhfXG4gICAgICAgICAgICA0IFxcblxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICBpdCAnY2hhbmdlIG5leHQgb2NjdXJyZW5jZSBvZiBsYXN0IHNlYXJjaCBwYXR0ZXJuJywgLT5cbiAgICAgICAgZW5zdXJlICdjIGcgbicsXG4gICAgICAgICAgY3Vyc29yOiBbMSwgMl1cbiAgICAgICAgICBtb2RlOiAnaW5zZXJ0J1xuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgMCB4eHhcbiAgICAgICAgICAgIDEgIHh4eFxuICAgICAgICAgICAgMiAgIHh4eCB5eXlcbiAgICAgICAgICAgIDMgeHh4IGFiY1xuICAgICAgICAgICAgNCBhYmNcXG5cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICBrZXlzdHJva2UgJ2VzY2FwZSdcbiAgICAgICAgc2V0IGN1cnNvcjogWzQsIDBdXG4gICAgICAgIGVuc3VyZSAnYyBnIE4nLFxuICAgICAgICAgIGN1cnNvcjogWzMsIDZdXG4gICAgICAgICAgbW9kZTogJ2luc2VydCdcbiAgICAgICAgICB0ZXh0XzogXCJcIlwiXG4gICAgICAgICAgICAwIHh4eFxuICAgICAgICAgICAgMSAgeHh4XG4gICAgICAgICAgICAyICAgeHh4IHl5eVxuICAgICAgICAgICAgMyB4eHhfXG4gICAgICAgICAgICA0IGFiY1xcblxuICAgICAgICAgICAgXCJcIlwiXG4iXX0=
