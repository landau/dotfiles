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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9zcGVjL3RleHQtb2JqZWN0LXNwZWMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxNQUFvQyxPQUFBLENBQVEsZUFBUixDQUFwQyxFQUFDLDZCQUFELEVBQWMsdUJBQWQsRUFBd0I7O0VBQ3hCLFFBQUEsR0FBVyxPQUFBLENBQVEsaUJBQVI7O0VBRVgsUUFBQSxDQUFTLFlBQVQsRUFBdUIsU0FBQTtBQUNyQixRQUFBO0lBQUEsT0FBNEQsRUFBNUQsRUFBQyxhQUFELEVBQU0sZ0JBQU4sRUFBYyxtQkFBZCxFQUF5QixnQkFBekIsRUFBaUMsdUJBQWpDLEVBQWdEO0lBRWhELG1CQUFBLEdBQXNCLFNBQUMsVUFBRDthQUNwQixTQUFDLFlBQUQsRUFBZSxTQUFmLEVBQTBCLE9BQTFCO1FBQ0UsR0FBQSxDQUFJO1VBQUEsTUFBQSxFQUFRLFlBQVI7U0FBSjtlQUNBLE1BQUEsQ0FBVSxTQUFELEdBQVcsR0FBWCxHQUFjLFVBQXZCLEVBQXFDLE9BQXJDO01BRkY7SUFEb0I7SUFLdEIsVUFBQSxDQUFXLFNBQUE7YUFDVCxXQUFBLENBQVksU0FBQyxLQUFELEVBQVEsU0FBUjtRQUNWLFFBQUEsR0FBVztRQUNWLHdCQUFELEVBQVM7ZUFDUixtQkFBRCxFQUFNLHlCQUFOLEVBQWMsK0JBQWQsRUFBMkI7TUFIakIsQ0FBWjtJQURTLENBQVg7SUFNQSxRQUFBLENBQVMsWUFBVCxFQUF1QixTQUFBO01BQ3JCLFVBQUEsQ0FBVyxTQUFBO1FBQ1QsZUFBQSxDQUFnQixTQUFBO2lCQUNkLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZCxDQUE4Qix3QkFBOUI7UUFEYyxDQUFoQjtlQUVBLFdBQUEsQ0FBWSxlQUFaLEVBQTZCLFNBQUMsS0FBRCxFQUFRLFNBQVI7VUFDMUIscUJBQUQsRUFBUztpQkFDUixtQkFB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WUFDQSxJQUFBLEVBQU0sUUFETjtZQUVBLElBQUEsRUFBTSxnREFGTjtXQURGO1VBVUEsTUFBQSxDQUFPLEdBQVAsRUFDRTtZQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7WUFDQSxJQUFBLEVBQU0sUUFETjtZQUVBLEtBQUEsRUFBTyw2Q0FGUDtXQURGO2lCQVVBLE1BQUEsQ0FBTyxHQUFQLEVBQ0U7WUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO1lBQ0EsSUFBQSxFQUFNLFFBRE47WUFFQSxLQUFBLEVBQU8sMENBRlA7V0FERjtRQXJCa0QsQ0FBcEQ7ZUErQkEsRUFBQSxDQUFHLCtDQUFILEVBQW9ELFNBQUE7VUFDbEQsTUFBQSxDQUFPLE9BQVAsRUFDRTtZQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7WUFDQSxJQUFBLEVBQU0sUUFETjtZQUVBLElBQUEsRUFBTSxnREFGTjtXQURGO1VBVUEsU0FBQSxDQUFVLFFBQVY7VUFDQSxHQUFBLENBQUk7WUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO1dBQUo7aUJBQ0EsTUFBQSxDQUFPLE9BQVAsRUFDRTtZQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7WUFDQSxJQUFBLEVBQU0sUUFETjtZQUVBLEtBQUEsRUFBTyw2Q0FGUDtXQURGO1FBYmtELENBQXBEO01BaEM2QixDQUEvQjtJQWhGOEMsQ0FBaEQ7RUEzM0RxQixDQUF2QjtBQUhBIiwic291cmNlc0NvbnRlbnQiOlsie2dldFZpbVN0YXRlLCBkaXNwYXRjaCwgVGV4dERhdGF9ID0gcmVxdWlyZSAnLi9zcGVjLWhlbHBlcidcbnNldHRpbmdzID0gcmVxdWlyZSAnLi4vbGliL3NldHRpbmdzJ1xuXG5kZXNjcmliZSBcIlRleHRPYmplY3RcIiwgLT5cbiAgW3NldCwgZW5zdXJlLCBrZXlzdHJva2UsIGVkaXRvciwgZWRpdG9yRWxlbWVudCwgdmltU3RhdGVdID0gW11cblxuICBnZXRDaGVja0Z1bmN0aW9uRm9yID0gKHRleHRPYmplY3QpIC0+XG4gICAgKGluaXRpYWxQb2ludCwga2V5c3Ryb2tlLCBvcHRpb25zKSAtPlxuICAgICAgc2V0IGN1cnNvcjogaW5pdGlhbFBvaW50XG4gICAgICBlbnN1cmUgXCIje2tleXN0cm9rZX0gI3t0ZXh0T2JqZWN0fVwiLCBvcHRpb25zXG5cbiAgYmVmb3JlRWFjaCAtPlxuICAgIGdldFZpbVN0YXRlIChzdGF0ZSwgdmltRWRpdG9yKSAtPlxuICAgICAgdmltU3RhdGUgPSBzdGF0ZVxuICAgICAge2VkaXRvciwgZWRpdG9yRWxlbWVudH0gPSB2aW1TdGF0ZVxuICAgICAge3NldCwgZW5zdXJlLCBrZXlzdHJva2V9ID0gdmltRWRpdG9yXG5cbiAgZGVzY3JpYmUgXCJUZXh0T2JqZWN0XCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICAgIGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKCdsYW5ndWFnZS1jb2ZmZWUtc2NyaXB0JylcbiAgICAgIGdldFZpbVN0YXRlICdzYW1wbGUuY29mZmVlJywgKHN0YXRlLCB2aW1FZGl0b3IpIC0+XG4gICAgICAgIHtlZGl0b3IsIGVkaXRvckVsZW1lbnR9ID0gc3RhdGVcbiAgICAgICAge3NldCwgZW5zdXJlLCBrZXlzdHJva2V9ID0gdmltRWRpdG9yXG4gICAgYWZ0ZXJFYWNoIC0+XG4gICAgICBhdG9tLnBhY2thZ2VzLmRlYWN0aXZhdGVQYWNrYWdlKCdsYW5ndWFnZS1jb2ZmZWUtc2NyaXB0JylcblxuICAgIGRlc2NyaWJlIFwid2hlbiBUZXh0T2JqZWN0IGlzIGV4Y3V0ZWQgZGlyZWN0bHlcIiwgLT5cbiAgICAgIGl0IFwic2VsZWN0IHRoYXQgVGV4dE9iamVjdFwiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbOCwgN11cbiAgICAgICAgZGlzcGF0Y2goZWRpdG9yRWxlbWVudCwgJ3ZpbS1tb2RlLXBsdXM6aW5uZXItd29yZCcpXG4gICAgICAgIGVuc3VyZSBzZWxlY3RlZFRleHQ6ICdRdWlja1NvcnQnXG5cbiAgZGVzY3JpYmUgXCJXb3JkXCIsIC0+XG4gICAgZGVzY3JpYmUgXCJpbm5lci13b3JkXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHQ6IFwiMTIzNDUgYWJjZGUgQUJDREVcIlxuICAgICAgICAgIGN1cnNvcjogWzAsIDldXG5cbiAgICAgIGl0IFwiYXBwbGllcyBvcGVyYXRvcnMgaW5zaWRlIHRoZSBjdXJyZW50IHdvcmQgaW4gb3BlcmF0b3ItcGVuZGluZyBtb2RlXCIsIC0+XG4gICAgICAgIGVuc3VyZSAnZCBpIHcnLFxuICAgICAgICAgIHRleHQ6ICAgICBcIjEyMzQ1ICBBQkNERVwiXG4gICAgICAgICAgY3Vyc29yOiAgIFswLCA2XVxuICAgICAgICAgIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiAnYWJjZGUnXG4gICAgICAgICAgbW9kZTogJ25vcm1hbCdcblxuICAgICAgaXQgXCJzZWxlY3RzIGluc2lkZSB0aGUgY3VycmVudCB3b3JkIGluIHZpc3VhbCBtb2RlXCIsIC0+XG4gICAgICAgIGVuc3VyZSAndiBpIHcnLFxuICAgICAgICAgIHNlbGVjdGVkU2NyZWVuUmFuZ2U6IFtbMCwgNl0sIFswLCAxMV1dXG5cbiAgICAgIGl0IFwid29ya3Mgd2l0aCBtdWx0aXBsZSBjdXJzb3JzXCIsIC0+XG4gICAgICAgIHNldCBhZGRDdXJzb3I6IFswLCAxXVxuICAgICAgICBlbnN1cmUgJ3YgaSB3JyxcbiAgICAgICAgICBzZWxlY3RlZEJ1ZmZlclJhbmdlOiBbXG4gICAgICAgICAgICBbWzAsIDZdLCBbMCwgMTFdXVxuICAgICAgICAgICAgW1swLCAwXSwgWzAsIDVdXVxuICAgICAgICAgIF1cblxuICAgICAgZGVzY3JpYmUgXCJjdXJzb3IgaXMgb24gbmV4dCB0byBOb25Xb3JkQ2hhcmFjdGVyXCIsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBzZXRcbiAgICAgICAgICAgIHRleHQ6IFwiYWJjKGRlZilcIlxuICAgICAgICAgICAgY3Vyc29yOiBbMCwgNF1cblxuICAgICAgICBpdCBcImNoYW5nZSBpbnNpZGUgd29yZFwiLCAtPlxuICAgICAgICAgIGVuc3VyZSAnYyBpIHcnLCB0ZXh0OiBcImFiYygpXCIsIG1vZGU6IFwiaW5zZXJ0XCJcblxuICAgICAgICBpdCBcImRlbGV0ZSBpbnNpZGUgd29yZFwiLCAtPlxuICAgICAgICAgIGVuc3VyZSAnZCBpIHcnLCB0ZXh0OiBcImFiYygpXCIsIG1vZGU6IFwibm9ybWFsXCJcblxuICAgICAgZGVzY3JpYmUgXCJjdXJzb3IncyBuZXh0IGNoYXIgaXMgTm9uV29yZENoYXJhY3RlclwiLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgc2V0XG4gICAgICAgICAgICB0ZXh0OiBcImFiYyhkZWYpXCJcbiAgICAgICAgICAgIGN1cnNvcjogWzAsIDZdXG5cbiAgICAgICAgaXQgXCJjaGFuZ2UgaW5zaWRlIHdvcmRcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJ2MgaSB3JywgdGV4dDogXCJhYmMoKVwiLCBtb2RlOiBcImluc2VydFwiXG5cbiAgICAgICAgaXQgXCJkZWxldGUgaW5zaWRlIHdvcmRcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJ2QgaSB3JywgdGV4dDogXCJhYmMoKVwiLCBtb2RlOiBcIm5vcm1hbFwiXG5cbiAgICBkZXNjcmliZSBcImEtd29yZFwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXQgdGV4dDogXCIxMjM0NSBhYmNkZSBBQkNERVwiLCBjdXJzb3I6IFswLCA5XVxuXG4gICAgICBpdCBcInNlbGVjdCBjdXJyZW50LXdvcmQgYW5kIHRyYWlsaW5nIHdoaXRlIHNwYWNlXCIsIC0+XG4gICAgICAgIGVuc3VyZSAnZCBhIHcnLFxuICAgICAgICAgIHRleHQ6IFwiMTIzNDUgQUJDREVcIlxuICAgICAgICAgIGN1cnNvcjogWzAsIDZdXG4gICAgICAgICAgcmVnaXN0ZXI6ICdcIic6IHRleHQ6IFwiYWJjZGUgXCJcblxuICAgICAgaXQgXCJzZWxlY3QgY3VycmVudC13b3JkIGFuZCBsZWFkaW5nIHdoaXRlIHNwYWNlIGluIGNhc2UgdHJhaWxpbmcgd2hpdGUgc3BhY2Ugd2Fzbid0IHRoZXJlXCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFswLCAxNV1cbiAgICAgICAgZW5zdXJlICdkIGEgdycsXG4gICAgICAgICAgdGV4dDogXCIxMjM0NSBhYmNkZVwiXG4gICAgICAgICAgY3Vyc29yOiBbMCwgMTBdXG4gICAgICAgICAgcmVnaXN0ZXI6ICdcIic6IHRleHQ6IFwiIEFCQ0RFXCJcblxuICAgICAgaXQgXCJzZWxlY3RzIGZyb20gdGhlIHN0YXJ0IG9mIHRoZSBjdXJyZW50IHdvcmQgdG8gdGhlIHN0YXJ0IG9mIHRoZSBuZXh0IHdvcmQgaW4gdmlzdWFsIG1vZGVcIiwgLT5cbiAgICAgICAgZW5zdXJlICd2IGEgdycsIHNlbGVjdGVkU2NyZWVuUmFuZ2U6IFtbMCwgNl0sIFswLCAxMl1dXG5cbiAgICAgIGl0IFwiZG9lc24ndCBzcGFuIG5ld2xpbmVzXCIsIC0+XG4gICAgICAgIHNldCB0ZXh0OiBcIjEyMzQ1XFxuYWJjZGUgQUJDREVcIiwgY3Vyc29yOiBbMCwgM11cbiAgICAgICAgZW5zdXJlICd2IGEgdycsIHNlbGVjdGVkQnVmZmVyUmFuZ2U6IFtbMCwgMF0sIFswLCA1XV1cblxuICAgICAgaXQgXCJkb2Vzbid0IHNwYW4gc3BlY2lhbCBjaGFyYWN0ZXJzXCIsIC0+XG4gICAgICAgIHNldCB0ZXh0OiBcIjEoMzQ1XFxuYWJjZGUgQUJDREVcIiwgY3Vyc29yOiBbMCwgM11cbiAgICAgICAgZW5zdXJlICd2IGEgdycsIHNlbGVjdGVkQnVmZmVyUmFuZ2U6IFtbMCwgMl0sIFswLCA1XV1cblxuICBkZXNjcmliZSBcIldob2xlV29yZFwiLCAtPlxuICAgIGRlc2NyaWJlIFwiaW5uZXItd2hvbGUtd29yZFwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXQgdGV4dDogXCIxMig0NSBhYidkZSBBQkNERVwiLCBjdXJzb3I6IFswLCA5XVxuXG4gICAgICBpdCBcImFwcGxpZXMgb3BlcmF0b3JzIGluc2lkZSB0aGUgY3VycmVudCB3aG9sZSB3b3JkIGluIG9wZXJhdG9yLXBlbmRpbmcgbW9kZVwiLCAtPlxuICAgICAgICBlbnN1cmUgJ2QgaSBXJywgdGV4dDogXCIxMig0NSAgQUJDREVcIiwgY3Vyc29yOiBbMCwgNl0sIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiBcImFiJ2RlXCJcblxuICAgICAgaXQgXCJzZWxlY3RzIGluc2lkZSB0aGUgY3VycmVudCB3aG9sZSB3b3JkIGluIHZpc3VhbCBtb2RlXCIsIC0+XG4gICAgICAgIGVuc3VyZSAndiBpIFcnLCBzZWxlY3RlZFNjcmVlblJhbmdlOiBbWzAsIDZdLCBbMCwgMTFdXVxuICAgIGRlc2NyaWJlIFwiYS13aG9sZS13b3JkXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldCB0ZXh0OiBcIjEyKDQ1IGFiJ2RlIEFCQ0RFXCIsIGN1cnNvcjogWzAsIDldXG5cbiAgICAgIGl0IFwic2VsZWN0IHdob2xlLXdvcmQgYW5kIHRyYWlsaW5nIHdoaXRlIHNwYWNlXCIsIC0+XG4gICAgICAgIGVuc3VyZSAnZCBhIFcnLFxuICAgICAgICAgIHRleHQ6IFwiMTIoNDUgQUJDREVcIlxuICAgICAgICAgIGN1cnNvcjogWzAsIDZdXG4gICAgICAgICAgcmVnaXN0ZXI6ICdcIic6IHRleHQ6IFwiYWInZGUgXCJcbiAgICAgICAgICBtb2RlOiAnbm9ybWFsJ1xuXG4gICAgICBpdCBcInNlbGVjdCB3aG9sZS13b3JkIGFuZCBsZWFkaW5nIHdoaXRlIHNwYWNlIGluIGNhc2UgdHJhaWxpbmcgd2hpdGUgc3BhY2Ugd2Fzbid0IHRoZXJlXCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFswLCAxNV1cbiAgICAgICAgZW5zdXJlICdkIGEgdycsXG4gICAgICAgICAgdGV4dDogXCIxMig0NSBhYidkZVwiXG4gICAgICAgICAgY3Vyc29yOiBbMCwgMTBdXG4gICAgICAgICAgcmVnaXN0ZXI6ICdcIic6IHRleHQ6IFwiIEFCQ0RFXCJcblxuICAgICAgaXQgXCJzZWxlY3RzIGZyb20gdGhlIHN0YXJ0IG9mIHRoZSBjdXJyZW50IHdob2xlIHdvcmQgdG8gdGhlIHN0YXJ0IG9mIHRoZSBuZXh0IHdob2xlIHdvcmQgaW4gdmlzdWFsIG1vZGVcIiwgLT5cbiAgICAgICAgZW5zdXJlICd2IGEgVycsIHNlbGVjdGVkU2NyZWVuUmFuZ2U6IFtbMCwgNl0sIFswLCAxMl1dXG5cbiAgICAgIGl0IFwiZG9lc24ndCBzcGFuIG5ld2xpbmVzXCIsIC0+XG4gICAgICAgIHNldCB0ZXh0OiBcIjEyKDQ1XFxuYWInZGUgQUJDREVcIiwgY3Vyc29yOiBbMCwgNF1cbiAgICAgICAgZW5zdXJlICd2IGEgVycsIHNlbGVjdGVkQnVmZmVyUmFuZ2U6IFtbMCwgMF0sIFswLCA1XV1cblxuICBkZXNjcmliZSBcIlN1YndvcmRcIiwgLT5cbiAgICBlc2NhcGUgPSAtPiBrZXlzdHJva2UoJ2VzY2FwZScpXG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgYXRvbS5rZXltYXBzLmFkZCBcInRlc3RcIixcbiAgICAgICAgJ2F0b20tdGV4dC1lZGl0b3IudmltLW1vZGUtcGx1cy5vcGVyYXRvci1wZW5kaW5nLW1vZGUsIGF0b20tdGV4dC1lZGl0b3IudmltLW1vZGUtcGx1cy52aXN1YWwtbW9kZSc6XG4gICAgICAgICAgJ2EgcSc6ICd2aW0tbW9kZS1wbHVzOmEtc3Vid29yZCdcbiAgICAgICAgICAnaSBxJzogJ3ZpbS1tb2RlLXBsdXM6aW5uZXItc3Vid29yZCdcblxuICAgIGRlc2NyaWJlIFwiaW5uZXItc3Vid29yZFwiLCAtPlxuICAgICAgaXQgXCJzZWxlY3Qgc3Vid29yZFwiLCAtPlxuICAgICAgICBzZXQgdGV4dEM6IFwiY2FtfGVsQ2FzZVwiOyBlbnN1cmUgXCJ2IGkgcVwiLCBzZWxlY3RlZFRleHQ6IFwiY2FtZWxcIjsgZXNjYXBlKClcbiAgICAgICAgc2V0IHRleHRDOiBcImNhbWV8bENhc2VcIjsgZW5zdXJlIFwidiBpIHFcIiwgc2VsZWN0ZWRUZXh0OiBcImNhbWVsXCI7IGVzY2FwZSgpXG4gICAgICAgIHNldCB0ZXh0QzogXCJjYW1lbHxDYXNlXCI7IGVuc3VyZSBcInYgaSBxXCIsIHNlbGVjdGVkVGV4dDogXCJDYXNlXCI7IGVzY2FwZSgpXG4gICAgICAgIHNldCB0ZXh0QzogXCJjYW1lbENhc3xlXCI7IGVuc3VyZSBcInYgaSBxXCIsIHNlbGVjdGVkVGV4dDogXCJDYXNlXCI7IGVzY2FwZSgpXG5cbiAgICAgICAgc2V0IHRleHRDOiBcInxfc25ha2VfX2Nhc2VfXCI7IGVuc3VyZSBcInYgaSBxXCIsIHNlbGVjdGVkVGV4dDogXCJfc25ha2VcIjsgZXNjYXBlKClcbiAgICAgICAgc2V0IHRleHRDOiBcIl9zbmFrfGVfX2Nhc2VfXCI7IGVuc3VyZSBcInYgaSBxXCIsIHNlbGVjdGVkVGV4dDogXCJfc25ha2VcIjsgZXNjYXBlKClcbiAgICAgICAgc2V0IHRleHRDOiBcIl9zbmFrZXxfX2Nhc2VfXCI7IGVuc3VyZSBcInYgaSBxXCIsIHNlbGVjdGVkVGV4dDogXCJfX2Nhc2VcIjsgZXNjYXBlKClcbiAgICAgICAgc2V0IHRleHRDOiBcIl9zbmFrZV98X2Nhc2VfXCI7IGVuc3VyZSBcInYgaSBxXCIsIHNlbGVjdGVkVGV4dDogXCJfX2Nhc2VcIjsgZXNjYXBlKClcbiAgICAgICAgc2V0IHRleHRDOiBcIl9zbmFrZV9fY2FzfGVfXCI7IGVuc3VyZSBcInYgaSBxXCIsIHNlbGVjdGVkVGV4dDogXCJfX2Nhc2VcIjsgZXNjYXBlKClcbiAgICAgICAgc2V0IHRleHRDOiBcIl9zbmFrZV9fY2FzZXxfXCI7IGVuc3VyZSBcInYgaSBxXCIsIHNlbGVjdGVkVGV4dDogXCJfXCI7IGVzY2FwZSgpXG5cbiAgICBkZXNjcmliZSBcImEtc3Vid29yZFwiLCAtPlxuICAgICAgaXQgXCJzZWxlY3Qgc3Vid29yZCBhbmQgc3BhY2VzXCIsIC0+XG4gICAgICAgIHNldCB0ZXh0QzogXCJjYW1lbENhfHNlICBOZXh0Q2FtZWxcIjsgZW5zdXJlIFwidiBhIHFcIiwgc2VsZWN0ZWRUZXh0OiBcIkNhc2UgIFwiOyBlc2NhcGUoKVxuICAgICAgICBzZXQgdGV4dEM6IFwiY2FtZWxDYXNlICBOZXx4dENhbWVsXCI7IGVuc3VyZSBcInYgYSBxXCIsIHNlbGVjdGVkVGV4dDogXCIgIE5leHRcIjsgZXNjYXBlKClcbiAgICAgICAgc2V0IHRleHRDOiBcInNuYWtlX2N8YXNlICBuZXh0X3NuYWtlXCI7IGVuc3VyZSBcInYgYSBxXCIsIHNlbGVjdGVkVGV4dDogXCJfY2FzZSAgXCI7IGVzY2FwZSgpXG4gICAgICAgIHNldCB0ZXh0QzogXCJzbmFrZV9jYXNlICBuZXx4dF9zbmFrZVwiOyBlbnN1cmUgXCJ2IGEgcVwiLCBzZWxlY3RlZFRleHQ6IFwiICBuZXh0XCI7IGVzY2FwZSgpXG5cbiAgZGVzY3JpYmUgXCJBbnlQYWlyXCIsIC0+XG4gICAge3NpbXBsZVRleHQsIGNvbXBsZXhUZXh0fSA9IHt9XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2ltcGxlVGV4dCA9IFwiXCJcIlxuICAgICAgICAuLi4uIFwiYWJjXCIgLi4uLlxuICAgICAgICAuLi4uICdhYmMnIC4uLi5cbiAgICAgICAgLi4uLiBgYWJjYCAuLi4uXG4gICAgICAgIC4uLi4ge2FiY30gLi4uLlxuICAgICAgICAuLi4uIDxhYmM+IC4uLi5cbiAgICAgICAgLi4uLiBbYWJjXSAuLi4uXG4gICAgICAgIC4uLi4gKGFiYykgLi4uLlxuICAgICAgICBcIlwiXCJcbiAgICAgIGNvbXBsZXhUZXh0ID0gXCJcIlwiXG4gICAgICAgIFs0c1xuICAgICAgICAtLXszc1xuICAgICAgICAtLS0tXCIycygxcy0xZSkyZVwiXG4gICAgICAgIC0tLTNlfS00ZVxuICAgICAgICBdXG4gICAgICAgIFwiXCJcIlxuICAgICAgc2V0XG4gICAgICAgIHRleHQ6IHNpbXBsZVRleHRcbiAgICAgICAgY3Vyc29yOiBbMCwgN11cbiAgICBkZXNjcmliZSBcImlubmVyLWFueS1wYWlyXCIsIC0+XG4gICAgICBpdCBcImFwcGxpZXMgb3BlcmF0b3JzIGFueSBpbm5lci1wYWlyIGFuZCByZXBlYXRhYmxlXCIsIC0+XG4gICAgICAgIGVuc3VyZSAnZCBpIHMnLFxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgLi4uLiBcIlwiIC4uLi5cbiAgICAgICAgICAgIC4uLi4gJ2FiYycgLi4uLlxuICAgICAgICAgICAgLi4uLiBgYWJjYCAuLi4uXG4gICAgICAgICAgICAuLi4uIHthYmN9IC4uLi5cbiAgICAgICAgICAgIC4uLi4gPGFiYz4gLi4uLlxuICAgICAgICAgICAgLi4uLiBbYWJjXSAuLi4uXG4gICAgICAgICAgICAuLi4uIChhYmMpIC4uLi5cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICBlbnN1cmUgJ2ogLiBqIC4gaiAuIGogLiBqIC4gaiAuIGogLicsXG4gICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICAuLi4uIFwiXCIgLi4uLlxuICAgICAgICAgICAgLi4uLiAnJyAuLi4uXG4gICAgICAgICAgICAuLi4uIGBgIC4uLi5cbiAgICAgICAgICAgIC4uLi4ge30gLi4uLlxuICAgICAgICAgICAgLi4uLiA8PiAuLi4uXG4gICAgICAgICAgICAuLi4uIFtdIC4uLi5cbiAgICAgICAgICAgIC4uLi4gKCkgLi4uLlxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICBpdCBcImNhbiBleHBhbmQgc2VsZWN0aW9uXCIsIC0+XG4gICAgICAgIHNldCB0ZXh0OiBjb21wbGV4VGV4dCwgY3Vyc29yOiBbMiwgOF1cbiAgICAgICAga2V5c3Ryb2tlICd2J1xuICAgICAgICBlbnN1cmUgJ2kgcycsIHNlbGVjdGVkVGV4dDogXCJcIlwiMXMtMWVcIlwiXCJcbiAgICAgICAgZW5zdXJlICdpIHMnLCBzZWxlY3RlZFRleHQ6IFwiXCJcIjJzKDFzLTFlKTJlXCJcIlwiXG4gICAgICAgIGVuc3VyZSAnaSBzJywgc2VsZWN0ZWRUZXh0OiBcIlwiXCIzc1xcbi0tLS1cIjJzKDFzLTFlKTJlXCJcXG4tLS0zZVwiXCJcIlxuICAgICAgICBlbnN1cmUgJ2kgcycsIHNlbGVjdGVkVGV4dDogXCJcIlwiNHNcXG4tLXszc1xcbi0tLS1cIjJzKDFzLTFlKTJlXCJcXG4tLS0zZX0tNGVcIlwiXCJcbiAgICBkZXNjcmliZSBcImEtYW55LXBhaXJcIiwgLT5cbiAgICAgIGl0IFwiYXBwbGllcyBvcGVyYXRvcnMgYW55IGEtcGFpciBhbmQgcmVwZWF0YWJsZVwiLCAtPlxuICAgICAgICBlbnN1cmUgJ2QgYSBzJyxcbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIC4uLi4gIC4uLi5cbiAgICAgICAgICAgIC4uLi4gJ2FiYycgLi4uLlxuICAgICAgICAgICAgLi4uLiBgYWJjYCAuLi4uXG4gICAgICAgICAgICAuLi4uIHthYmN9IC4uLi5cbiAgICAgICAgICAgIC4uLi4gPGFiYz4gLi4uLlxuICAgICAgICAgICAgLi4uLiBbYWJjXSAuLi4uXG4gICAgICAgICAgICAuLi4uIChhYmMpIC4uLi5cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICBlbnN1cmUgJ2ogLiBqIC4gaiAuIGogLiBqIC4gaiAuIGogLicsXG4gICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICAuLi4uICAuLi4uXG4gICAgICAgICAgICAuLi4uICAuLi4uXG4gICAgICAgICAgICAuLi4uICAuLi4uXG4gICAgICAgICAgICAuLi4uICAuLi4uXG4gICAgICAgICAgICAuLi4uICAuLi4uXG4gICAgICAgICAgICAuLi4uICAuLi4uXG4gICAgICAgICAgICAuLi4uICAuLi4uXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgIGl0IFwiY2FuIGV4cGFuZCBzZWxlY3Rpb25cIiwgLT5cbiAgICAgICAgc2V0IHRleHQ6IGNvbXBsZXhUZXh0LCBjdXJzb3I6IFsyLCA4XVxuICAgICAgICBrZXlzdHJva2UgJ3YnXG4gICAgICAgIGVuc3VyZSAnYSBzJywgc2VsZWN0ZWRUZXh0OiBcIlwiXCIoMXMtMWUpXCJcIlwiXG4gICAgICAgIGVuc3VyZSAnYSBzJywgc2VsZWN0ZWRUZXh0OiBcIlwiXCJcXFwiMnMoMXMtMWUpMmVcXFwiXCJcIlwiXG4gICAgICAgIGVuc3VyZSAnYSBzJywgc2VsZWN0ZWRUZXh0OiBcIlwiXCJ7M3NcXG4tLS0tXCIycygxcy0xZSkyZVwiXFxuLS0tM2V9XCJcIlwiXG4gICAgICAgIGVuc3VyZSAnYSBzJywgc2VsZWN0ZWRUZXh0OiBcIlwiXCJbNHNcXG4tLXszc1xcbi0tLS1cIjJzKDFzLTFlKTJlXCJcXG4tLS0zZX0tNGVcXG5dXCJcIlwiXG5cbiAgZGVzY3JpYmUgXCJBbnlRdW90ZVwiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNldFxuICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgLS1cImFiY1wiIGBkZWZgICAnZWZnJy0tXG4gICAgICAgIFwiXCJcIlxuICAgICAgICBjdXJzb3I6IFswLCAwXVxuICAgIGRlc2NyaWJlIFwiaW5uZXItYW55LXF1b3RlXCIsIC0+XG4gICAgICBpdCBcImFwcGxpZXMgb3BlcmF0b3JzIGFueSBpbm5lci1wYWlyIGFuZCByZXBlYXRhYmxlXCIsIC0+XG4gICAgICAgIGVuc3VyZSAnZCBpIHEnLCB0ZXh0OiBcIlwiXCItLVwiXCIgYGRlZmAgICdlZmcnLS1cIlwiXCJcbiAgICAgICAgZW5zdXJlICcuJywgdGV4dDogXCJcIlwiLS1cIlwiIGBgICAnZWZnJy0tXCJcIlwiXG4gICAgICAgIGVuc3VyZSAnLicsIHRleHQ6IFwiXCJcIi0tXCJcIiBgYCAgJyctLVwiXCJcIlxuICAgICAgaXQgXCJjYW4gc2VsZWN0IG5leHQgcXVvdGVcIiwgLT5cbiAgICAgICAga2V5c3Ryb2tlICd2J1xuICAgICAgICBlbnN1cmUgJ2kgcScsIHNlbGVjdGVkVGV4dDogJ2FiYydcbiAgICAgICAgZW5zdXJlICdpIHEnLCBzZWxlY3RlZFRleHQ6ICdkZWYnXG4gICAgICAgIGVuc3VyZSAnaSBxJywgc2VsZWN0ZWRUZXh0OiAnZWZnJ1xuICAgIGRlc2NyaWJlIFwiYS1hbnktcXVvdGVcIiwgLT5cbiAgICAgIGl0IFwiYXBwbGllcyBvcGVyYXRvcnMgYW55IGEtcXVvdGUgYW5kIHJlcGVhdGFibGVcIiwgLT5cbiAgICAgICAgZW5zdXJlICdkIGEgcScsIHRleHQ6IFwiXCJcIi0tIGBkZWZgICAnZWZnJy0tXCJcIlwiXG4gICAgICAgIGVuc3VyZSAnLicgICwgdGV4dDogXCJcIlwiLS0gICAnZWZnJy0tXCJcIlwiXG4gICAgICAgIGVuc3VyZSAnLicgICwgdGV4dDogXCJcIlwiLS0gICAtLVwiXCJcIlxuICAgICAgaXQgXCJjYW4gc2VsZWN0IG5leHQgcXVvdGVcIiwgLT5cbiAgICAgICAga2V5c3Ryb2tlICd2J1xuICAgICAgICBlbnN1cmUgJ2EgcScsIHNlbGVjdGVkVGV4dDogJ1wiYWJjXCInXG4gICAgICAgIGVuc3VyZSAnYSBxJywgc2VsZWN0ZWRUZXh0OiAnYGRlZmAnXG4gICAgICAgIGVuc3VyZSAnYSBxJywgc2VsZWN0ZWRUZXh0OiBcIidlZmcnXCJcblxuICBkZXNjcmliZSBcIkRvdWJsZVF1b3RlXCIsIC0+XG4gICAgZGVzY3JpYmUgXCJpc3N1ZS02MzUgbmV3IGJlaGF2aW9yIG9mIGlubmVyLWRvdWJsZS1xdW90ZVwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBhdG9tLmtleW1hcHMuYWRkIFwidGVzdFwiLFxuICAgICAgICAgICdhdG9tLXRleHQtZWRpdG9yLnZpbS1tb2RlLXBsdXM6bm90KC5pbnNlcnQtbW9kZSknOlxuICAgICAgICAgICAgJ2cgcic6ICd2aW0tbW9kZS1wbHVzOnJlcGxhY2UnXG5cbiAgICAgIGRlc2NyaWJlIFwicXVvdGUgaXMgdW4tYmFsYW5jZWRcIiwgLT5cbiAgICAgICAgaXQgXCJjYXNlMVwiLCAtPlxuICAgICAgICAgIHNldCAgICAgICAgICAgICAgICAgdGV4dENfOiAnX3xfXCJfX19fXCJfX19fXCInXG4gICAgICAgICAgZW5zdXJlICdnIHIgaSBcIiArJywgdGV4dENfOiAnX19cInwrKysrXCJfX19fXCInXG4gICAgICAgIGl0IFwiY2FzZTJcIiwgLT5cbiAgICAgICAgICBzZXQgICAgICAgICAgICAgICAgIHRleHRDXzogJ19fXCJfX3xfX1wiX19fX1wiJ1xuICAgICAgICAgIGVuc3VyZSAnZyByIGkgXCIgKycsIHRleHRDXzogJ19fXCJ8KysrK1wiX19fX1wiJ1xuICAgICAgICBpdCBcImNhc2UzXCIsIC0+XG4gICAgICAgICAgc2V0ICAgICAgICAgICAgICAgICB0ZXh0Q186ICdfX1wiX19fX1wiX198X19cIidcbiAgICAgICAgICBlbnN1cmUgJ2cgciBpIFwiICsnLCB0ZXh0Q186ICdfX1wiX19fX1wifCsrKytcIidcbiAgICAgICAgaXQgXCJjYXNlNFwiLCAtPlxuICAgICAgICAgIHNldCAgICAgICAgICAgICAgICAgdGV4dENfOiAnX198XCJfX19fXCJfX19fXCInXG4gICAgICAgICAgZW5zdXJlICdnIHIgaSBcIiArJywgdGV4dENfOiAnX19cInwrKysrXCJfX19fXCInXG4gICAgICAgIGl0IFwiY2FzZTVcIiwgLT5cbiAgICAgICAgICBzZXQgICAgICAgICAgICAgICAgIHRleHRDXzogJ19fXCJfX19ffFwiX19fX1wiJ1xuICAgICAgICAgIGVuc3VyZSAnZyByIGkgXCIgKycsIHRleHRDXzogJ19fXCJ8KysrK1wiX19fX1wiJ1xuICAgICAgICBpdCBcImNhc2U2XCIsIC0+XG4gICAgICAgICAgc2V0ICAgICAgICAgICAgICAgICB0ZXh0Q186ICdfX1wiX19fX1wiX19fX3xcIidcbiAgICAgICAgICBlbnN1cmUgJ2cgciBpIFwiICsnLCB0ZXh0Q186ICdfX1wiX19fX1wifCsrKytcIidcblxuICAgICAgZGVzY3JpYmUgXCJxdW90ZSBpcyBiYWxhbmNlZFwiLCAtPlxuICAgICAgICBpdCBcImNhc2UxXCIsIC0+XG4gICAgICAgICAgc2V0ICAgICAgICAgICAgICAgICB0ZXh0Q186ICdffF9cIj09PT1cIl9fX19cIj09PVwiJ1xuICAgICAgICAgIGVuc3VyZSAnZyByIGkgXCIgKycsIHRleHRDXzogJ19fXCJ8KysrK1wiX19fX1wiPT09XCInXG4gICAgICAgIGl0IFwiY2FzZTJcIiwgLT5cbiAgICAgICAgICBzZXQgICAgICAgICAgICAgICAgIHRleHRDXzogJ19fXCI9PXw9PVwiX19fX1wiPT09XCInXG4gICAgICAgICAgZW5zdXJlICdnIHIgaSBcIiArJywgdGV4dENfOiAnX19cInwrKysrXCJfX19fXCI9PT1cIidcbiAgICAgICAgaXQgXCJjYXNlM1wiLCAtPlxuICAgICAgICAgIHNldCAgICAgICAgICAgICAgICAgdGV4dENfOiAnX19cIj09PT1cIl9ffF9fXCI9PT1cIidcbiAgICAgICAgICBlbnN1cmUgJ2cgciBpIFwiICsnLCB0ZXh0Q186ICdfX1wiPT09PVwifCsrKytcIj09PVwiJ1xuICAgICAgICBpdCBcImNhc2U0XCIsIC0+XG4gICAgICAgICAgc2V0ICAgICAgICAgICAgICAgICB0ZXh0Q186ICdfX1wiPT09PVwiX19fX1wiPXw9PVwiJ1xuICAgICAgICAgIGVuc3VyZSAnZyByIGkgXCIgKycsIHRleHRDXzogJ19fXCI9PT09XCJfX19fXCJ8KysrXCInXG4gICAgICAgIGl0IFwiY2FzZTVcIiwgLT5cbiAgICAgICAgICBzZXQgICAgICAgICAgICAgICAgIHRleHRDXzogJ19ffFwiPT09PVwiX19fX1wiPT09XCInXG4gICAgICAgICAgZW5zdXJlICdnIHIgaSBcIiArJywgdGV4dENfOiAnX19cInwrKysrXCJfX19fXCI9PT1cIidcbiAgICAgICAgaXQgXCJjYXNlNlwiLCAtPlxuICAgICAgICAgIHNldCAgICAgICAgICAgICAgICAgdGV4dENfOiAnX19cIj09PT18XCJfX19fXCI9PT1cIidcbiAgICAgICAgICBlbnN1cmUgJ2cgciBpIFwiICsnLCB0ZXh0Q186ICdfX1wifCsrKytcIl9fX19cIj09PVwiJ1xuICAgICAgICBpdCBcImNhc2U3XCIsIC0+XG4gICAgICAgICAgc2V0ICAgICAgICAgICAgICAgICB0ZXh0Q186ICdfX1wiPT09PVwiX19fX3xcIj09PVwiJ1xuICAgICAgICAgIGVuc3VyZSAnZyByIGkgXCIgKycsIHRleHRDXzogJ19fXCI9PT09XCJfX19fXCJ8KysrXCInXG5cbiAgICBkZXNjcmliZSBcImlubmVyLWRvdWJsZS1xdW90ZVwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0OiAnXCIgc29tZXRoaW5nIGluIGhlcmUgYW5kIGluIFwiaGVyZVwiIFwiIGFuZCBvdmVyIGhlcmUnXG4gICAgICAgICAgY3Vyc29yOiBbMCwgOV1cblxuICAgICAgaXQgXCJhcHBsaWVzIG9wZXJhdG9ycyBpbnNpZGUgdGhlIGN1cnJlbnQgc3RyaW5nIGluIG9wZXJhdG9yLXBlbmRpbmcgbW9kZVwiLCAtPlxuICAgICAgICBlbnN1cmUgJ2QgaSBcIicsXG4gICAgICAgICAgdGV4dDogJ1wiXCJoZXJlXCIgXCIgYW5kIG92ZXIgaGVyZSdcbiAgICAgICAgICBjdXJzb3I6IFswLCAxXVxuXG4gICAgICBpdCBcImFwcGxpZXMgb3BlcmF0b3JzIGluc2lkZSB0aGUgY3VycmVudCBzdHJpbmcgaW4gb3BlcmF0b3ItcGVuZGluZyBtb2RlXCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFswLCAyOV1cbiAgICAgICAgZW5zdXJlICdkIGkgXCInLFxuICAgICAgICAgIHRleHQ6ICdcIiBzb21ldGhpbmcgaW4gaGVyZSBhbmQgaW4gXCJcIiBcIiBhbmQgb3ZlciBoZXJlJ1xuICAgICAgICAgIGN1cnNvcjogWzAsIDI4XVxuXG4gICAgICBpdCBcIm1ha2VzIG5vIGNoYW5nZSBpZiBwYXN0IHRoZSBsYXN0IHN0cmluZyBvbiBhIGxpbmVcIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzAsIDM5XVxuICAgICAgICBlbnN1cmUgJ2QgaSBcIicsXG4gICAgICAgICAgdGV4dDogJ1wiIHNvbWV0aGluZyBpbiBoZXJlIGFuZCBpbiBcImhlcmVcIiBcIiBhbmQgb3ZlciBoZXJlJ1xuICAgICAgICAgIGN1cnNvcjogWzAsIDM5XVxuXG4gICAgICBkZXNjcmliZSBcImN1cnNvciBpcyBvbiB0aGUgcGFpciBjaGFyXCIsIC0+XG4gICAgICAgIGNoZWNrID0gZ2V0Q2hlY2tGdW5jdGlvbkZvcignaSBcIicpXG4gICAgICAgIHRleHQgPSAnLVwiK1wiLSdcbiAgICAgICAgdGV4dEZpbmFsID0gJy1cIlwiLSdcbiAgICAgICAgc2VsZWN0ZWRUZXh0ID0gJysnXG4gICAgICAgIG9wZW4gPSBbMCwgMV1cbiAgICAgICAgY2xvc2UgPSBbMCwgM11cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIHNldCB7dGV4dH1cbiAgICAgICAgaXQgXCJjYXNlLTEgbm9ybWFsXCIsIC0+IGNoZWNrIG9wZW4sICdkJywgdGV4dDogdGV4dEZpbmFsLCBjdXJzb3I6IFswLCAyXVxuICAgICAgICBpdCBcImNhc2UtMiBub3JtYWxcIiwgLT4gY2hlY2sgY2xvc2UsICdkJywgdGV4dDogdGV4dEZpbmFsLCBjdXJzb3I6IFswLCAyXVxuICAgICAgICBpdCBcImNhc2UtMyB2aXN1YWxcIiwgLT4gY2hlY2sgb3BlbiwgJ3YnLCB7c2VsZWN0ZWRUZXh0fVxuICAgICAgICBpdCBcImNhc2UtNCB2aXN1YWxcIiwgLT4gY2hlY2sgY2xvc2UsICd2Jywge3NlbGVjdGVkVGV4dH1cbiAgICBkZXNjcmliZSBcImEtZG91YmxlLXF1b3RlXCIsIC0+XG4gICAgICBvcmlnaW5hbFRleHQgPSAnXCIgc29tZXRoaW5nIGluIGhlcmUgYW5kIGluIFwiaGVyZVwiIFwiJ1xuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXQgdGV4dDogb3JpZ2luYWxUZXh0LCBjdXJzb3I6IFswLCA5XVxuXG4gICAgICBpdCBcImFwcGxpZXMgb3BlcmF0b3JzIGFyb3VuZCB0aGUgY3VycmVudCBkb3VibGUgcXVvdGVzIGluIG9wZXJhdG9yLXBlbmRpbmcgbW9kZVwiLCAtPlxuICAgICAgICBlbnN1cmUgJ2QgYSBcIicsXG4gICAgICAgICAgdGV4dDogJ2hlcmVcIiBcIidcbiAgICAgICAgICBjdXJzb3I6IFswLCAwXVxuICAgICAgICAgIG1vZGU6ICdub3JtYWwnXG5cbiAgICAgIGl0IFwiZGVsZXRlIGEtZG91YmxlLXF1b3RlXCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFswLCAyOV1cbiAgICAgICAgZW5zdXJlICdkIGEgXCInLFxuICAgICAgICAgIHRleHQ6ICdcIiBzb21ldGhpbmcgaW4gaGVyZSBhbmQgaW4gIFwiJ1xuICAgICAgICAgIGN1cnNvcjogWzAsIDI3XVxuICAgICAgICAgIG1vZGU6ICdub3JtYWwnXG4gICAgICBkZXNjcmliZSBcImN1cnNvciBpcyBvbiB0aGUgcGFpciBjaGFyXCIsIC0+XG4gICAgICAgIGNoZWNrID0gZ2V0Q2hlY2tGdW5jdGlvbkZvcignYSBcIicpXG4gICAgICAgIHRleHQgPSAnLVwiK1wiLSdcbiAgICAgICAgdGV4dEZpbmFsID0gJy0tJ1xuICAgICAgICBzZWxlY3RlZFRleHQgPSAnXCIrXCInXG4gICAgICAgIG9wZW4gPSBbMCwgMV1cbiAgICAgICAgY2xvc2UgPSBbMCwgM11cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIHNldCB7dGV4dH1cbiAgICAgICAgaXQgXCJjYXNlLTEgbm9ybWFsXCIsIC0+IGNoZWNrIG9wZW4sICdkJywgdGV4dDogdGV4dEZpbmFsLCBjdXJzb3I6IFswLCAxXVxuICAgICAgICBpdCBcImNhc2UtMiBub3JtYWxcIiwgLT4gY2hlY2sgY2xvc2UsICdkJywgdGV4dDogdGV4dEZpbmFsLCBjdXJzb3I6IFswLCAxXVxuICAgICAgICBpdCBcImNhc2UtMyB2aXN1YWxcIiwgLT4gY2hlY2sgb3BlbiwgJ3YnLCB7c2VsZWN0ZWRUZXh0fVxuICAgICAgICBpdCBcImNhc2UtNCB2aXN1YWxcIiwgLT4gY2hlY2sgY2xvc2UsICd2Jywge3NlbGVjdGVkVGV4dH1cbiAgZGVzY3JpYmUgXCJTaW5nbGVRdW90ZVwiLCAtPlxuICAgIGRlc2NyaWJlIFwiaW5uZXItc2luZ2xlLXF1b3RlXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHQ6IFwiJyBzb21ldGhpbmcgaW4gaGVyZSBhbmQgaW4gJ2hlcmUnICcgYW5kIG92ZXIgaGVyZVwiXG4gICAgICAgICAgY3Vyc29yOiBbMCwgOV1cblxuICAgICAgZGVzY3JpYmUgXCJkb24ndCB0cmVhdCBsaXRlcmFsIGJhY2tzbGFzaChkb3VibGUgYmFja3NsYXNoKSBhcyBlc2NhcGUgY2hhclwiLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgc2V0XG4gICAgICAgICAgICB0ZXh0OiBcIidzb21lLWtleS1oZXJlXFxcXFxcXFwnOiAnaGVyZS1pcy10aGUtdmFsJ1wiXG4gICAgICAgIGl0IFwiY2FzZS0xXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzAsIDJdXG4gICAgICAgICAgZW5zdXJlIFwiZCBpICdcIixcbiAgICAgICAgICAgIHRleHQ6IFwiJyc6ICdoZXJlLWlzLXRoZS12YWwnXCJcbiAgICAgICAgICAgIGN1cnNvcjogWzAsIDFdXG5cbiAgICAgICAgaXQgXCJjYXNlLTJcIiwgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMTldXG4gICAgICAgICAgZW5zdXJlIFwiZCBpICdcIixcbiAgICAgICAgICAgIHRleHQ6IFwiJ3NvbWUta2V5LWhlcmVcXFxcXFxcXCc6ICcnXCJcbiAgICAgICAgICAgIGN1cnNvcjogWzAsIDIwXVxuXG4gICAgICBkZXNjcmliZSBcInRyZWF0IGJhY2tzbGFzaChzaW5nbGUgYmFja3NsYXNoKSBhcyBlc2NhcGUgY2hhclwiLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgc2V0XG4gICAgICAgICAgICB0ZXh0OiBcIidzb21lLWtleS1oZXJlXFxcXCcnOiAnaGVyZS1pcy10aGUtdmFsJ1wiXG5cbiAgICAgICAgaXQgXCJjYXNlLTFcIiwgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMl1cbiAgICAgICAgICBlbnN1cmUgXCJkIGkgJ1wiLFxuICAgICAgICAgICAgdGV4dDogXCInJzogJ2hlcmUtaXMtdGhlLXZhbCdcIlxuICAgICAgICAgICAgY3Vyc29yOiBbMCwgMV1cbiAgICAgICAgaXQgXCJjYXNlLTJcIiwgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMTddXG4gICAgICAgICAgZW5zdXJlIFwiZCBpICdcIixcbiAgICAgICAgICAgIHRleHQ6IFwiJ3NvbWUta2V5LWhlcmVcXFxcJycnaGVyZS1pcy10aGUtdmFsJ1wiXG4gICAgICAgICAgICBjdXJzb3I6IFswLCAxN11cblxuICAgICAgaXQgXCJhcHBsaWVzIG9wZXJhdG9ycyBpbnNpZGUgdGhlIGN1cnJlbnQgc3RyaW5nIGluIG9wZXJhdG9yLXBlbmRpbmcgbW9kZVwiLCAtPlxuICAgICAgICBlbnN1cmUgXCJkIGkgJ1wiLFxuICAgICAgICAgIHRleHQ6IFwiJydoZXJlJyAnIGFuZCBvdmVyIGhlcmVcIlxuICAgICAgICAgIGN1cnNvcjogWzAsIDFdXG5cbiAgICAgICMgW05PVEVdXG4gICAgICAjIEkgZG9uJ3QgbGlrZSBvcmlnaW5hbCBiZWhhdmlvciwgdGhpcyBpcyBjb3VudGVyIGludHVpdGl2ZS5cbiAgICAgICMgU2ltcGx5IHNlbGVjdGluZyBhcmVhIGJldHdlZW4gcXVvdGUgaXMgdGhhdCBub3JtYWwgdXNlciBleHBlY3RzLlxuICAgICAgIyBpdCBcImFwcGxpZXMgb3BlcmF0b3JzIGluc2lkZSB0aGUgbmV4dCBzdHJpbmcgaW4gb3BlcmF0b3ItcGVuZGluZyBtb2RlIChpZiBub3QgaW4gYSBzdHJpbmcpXCIsIC0+XG4gICAgICAjID0+IFJldmVydGVkIHRvIG9yaWdpbmFsIGJlaGF2aW9yLCBidXQgbmVlZCBjYXJlZnVsIGNvbnNpZGVyYXRpb24gd2hhdCBpcyBiZXN0LlxuXG4gICAgICAjIGl0IFwiW0NoYW5nZWQgYmVoYXZpb3JdIGFwcGxpZXMgb3BlcmF0b3JzIGluc2lkZSBhcmVhIGJldHdlZW4gcXVvdGVcIiwgLT5cbiAgICAgIGl0IFwiYXBwbGllcyBvcGVyYXRvcnMgaW5zaWRlIHRoZSBuZXh0IHN0cmluZyBpbiBvcGVyYXRvci1wZW5kaW5nIG1vZGUgKGlmIG5vdCBpbiBhIHN0cmluZylcIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzAsIDI2XVxuICAgICAgICBlbnN1cmUgXCJkIGkgJ1wiLFxuICAgICAgICAgIHRleHQ6IFwiJydoZXJlJyAnIGFuZCBvdmVyIGhlcmVcIlxuICAgICAgICAgIGN1cnNvcjogWzAsIDFdXG5cbiAgICAgIGl0IFwibWFrZXMgbm8gY2hhbmdlIGlmIHBhc3QgdGhlIGxhc3Qgc3RyaW5nIG9uIGEgbGluZVwiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMzldXG4gICAgICAgIGVuc3VyZSBcImQgaSAnXCIsXG4gICAgICAgICAgdGV4dDogXCInIHNvbWV0aGluZyBpbiBoZXJlIGFuZCBpbiAnaGVyZScgJyBhbmQgb3ZlciBoZXJlXCJcbiAgICAgICAgICBjdXJzb3I6IFswLCAzOV1cbiAgICAgIGRlc2NyaWJlIFwiY3Vyc29yIGlzIG9uIHRoZSBwYWlyIGNoYXJcIiwgLT5cbiAgICAgICAgY2hlY2sgPSBnZXRDaGVja0Z1bmN0aW9uRm9yKFwiaSAnXCIpXG4gICAgICAgIHRleHQgPSBcIi0nKyctXCJcbiAgICAgICAgdGV4dEZpbmFsID0gXCItJyctXCJcbiAgICAgICAgc2VsZWN0ZWRUZXh0ID0gJysnXG4gICAgICAgIG9wZW4gPSBbMCwgMV1cbiAgICAgICAgY2xvc2UgPSBbMCwgM11cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIHNldCB7dGV4dH1cbiAgICAgICAgaXQgXCJjYXNlLTEgbm9ybWFsXCIsIC0+IGNoZWNrIG9wZW4sICdkJywgdGV4dDogdGV4dEZpbmFsLCBjdXJzb3I6IFswLCAyXVxuICAgICAgICBpdCBcImNhc2UtMiBub3JtYWxcIiwgLT4gY2hlY2sgY2xvc2UsICdkJywgdGV4dDogdGV4dEZpbmFsLCBjdXJzb3I6IFswLCAyXVxuICAgICAgICBpdCBcImNhc2UtMyB2aXN1YWxcIiwgLT4gY2hlY2sgb3BlbiwgJ3YnLCB7c2VsZWN0ZWRUZXh0fVxuICAgICAgICBpdCBcImNhc2UtNCB2aXN1YWxcIiwgLT4gY2hlY2sgY2xvc2UsICd2Jywge3NlbGVjdGVkVGV4dH1cbiAgICBkZXNjcmliZSBcImEtc2luZ2xlLXF1b3RlXCIsIC0+XG4gICAgICBvcmlnaW5hbFRleHQgPSBcIicgc29tZXRoaW5nIGluIGhlcmUgYW5kIGluICdoZXJlJyAnXCJcbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0IHRleHQ6IG9yaWdpbmFsVGV4dCwgY3Vyc29yOiBbMCwgOV1cblxuICAgICAgaXQgXCJhcHBsaWVzIG9wZXJhdG9ycyBhcm91bmQgdGhlIGN1cnJlbnQgc2luZ2xlIHF1b3RlcyBpbiBvcGVyYXRvci1wZW5kaW5nIG1vZGVcIiwgLT5cbiAgICAgICAgZW5zdXJlIFwiZCBhICdcIixcbiAgICAgICAgICB0ZXh0OiBcImhlcmUnICdcIlxuICAgICAgICAgIGN1cnNvcjogWzAsIDBdXG4gICAgICAgICAgbW9kZTogJ25vcm1hbCdcblxuICAgICAgaXQgXCJhcHBsaWVzIG9wZXJhdG9ycyBpbnNpZGUgdGhlIG5leHQgc3RyaW5nIGluIG9wZXJhdG9yLXBlbmRpbmcgbW9kZSAoaWYgbm90IGluIGEgc3RyaW5nKVwiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMjldXG4gICAgICAgIGVuc3VyZSBcImQgYSAnXCIsXG4gICAgICAgICAgdGV4dDogXCInIHNvbWV0aGluZyBpbiBoZXJlIGFuZCBpbiAgJ1wiXG4gICAgICAgICAgY3Vyc29yOiBbMCwgMjddXG4gICAgICAgICAgbW9kZTogJ25vcm1hbCdcbiAgICAgIGRlc2NyaWJlIFwiY3Vyc29yIGlzIG9uIHRoZSBwYWlyIGNoYXJcIiwgLT5cbiAgICAgICAgY2hlY2sgPSBnZXRDaGVja0Z1bmN0aW9uRm9yKFwiYSAnXCIpXG4gICAgICAgIHRleHQgPSBcIi0nKyctXCJcbiAgICAgICAgdGV4dEZpbmFsID0gXCItLVwiXG4gICAgICAgIHNlbGVjdGVkVGV4dCA9IFwiJysnXCJcbiAgICAgICAgb3BlbiA9IFswLCAxXVxuICAgICAgICBjbG9zZSA9IFswLCAzXVxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgc2V0IHt0ZXh0fVxuICAgICAgICBpdCBcImNhc2UtMSBub3JtYWxcIiwgLT4gY2hlY2sgb3BlbiwgJ2QnLCB0ZXh0OiB0ZXh0RmluYWwsIGN1cnNvcjogWzAsIDFdXG4gICAgICAgIGl0IFwiY2FzZS0yIG5vcm1hbFwiLCAtPiBjaGVjayBjbG9zZSwgJ2QnLCB0ZXh0OiB0ZXh0RmluYWwsIGN1cnNvcjogWzAsIDFdXG4gICAgICAgIGl0IFwiY2FzZS0zIHZpc3VhbFwiLCAtPiBjaGVjayBvcGVuLCAndicsIHtzZWxlY3RlZFRleHR9XG4gICAgICAgIGl0IFwiY2FzZS00IHZpc3VhbFwiLCAtPiBjaGVjayBjbG9zZSwgJ3YnLCB7c2VsZWN0ZWRUZXh0fVxuICBkZXNjcmliZSBcIkJhY2tUaWNrXCIsIC0+XG4gICAgb3JpZ2luYWxUZXh0ID0gXCJ0aGlzIGlzIGBzYW1wbGVgIHRleHQuXCJcbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXQgdGV4dDogb3JpZ2luYWxUZXh0LCBjdXJzb3I6IFswLCA5XVxuXG4gICAgZGVzY3JpYmUgXCJpbm5lci1iYWNrLXRpY2tcIiwgLT5cbiAgICAgIGl0IFwiYXBwbGllcyBvcGVyYXRvcnMgaW5uZXItYXJlYVwiLCAtPlxuICAgICAgICBlbnN1cmUgXCJkIGkgYFwiLCB0ZXh0OiBcInRoaXMgaXMgYGAgdGV4dC5cIiwgY3Vyc29yOiBbMCwgOV1cblxuICAgICAgaXQgXCJkbyBub3RoaW5nIHdoZW4gcGFpciByYW5nZSBpcyBub3QgdW5kZXIgY3Vyc29yXCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFswLCAxNl1cbiAgICAgICAgZW5zdXJlIFwiZCBpIGBcIiwgdGV4dDogb3JpZ2luYWxUZXh0LCBjdXJzb3I6IFswLCAxNl1cbiAgICAgIGRlc2NyaWJlIFwiY3Vyc29yIGlzIG9uIHRoZSBwYWlyIGNoYXJcIiwgLT5cbiAgICAgICAgY2hlY2sgPSBnZXRDaGVja0Z1bmN0aW9uRm9yKCdpIGAnKVxuICAgICAgICB0ZXh0ID0gJy1gK2AtJ1xuICAgICAgICB0ZXh0RmluYWwgPSAnLWBgLSdcbiAgICAgICAgc2VsZWN0ZWRUZXh0ID0gJysnXG4gICAgICAgIG9wZW4gPSBbMCwgMV1cbiAgICAgICAgY2xvc2UgPSBbMCwgM11cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIHNldCB7dGV4dH1cbiAgICAgICAgaXQgXCJjYXNlLTEgbm9ybWFsXCIsIC0+IGNoZWNrIG9wZW4sICdkJywgdGV4dDogdGV4dEZpbmFsLCBjdXJzb3I6IFswLCAyXVxuICAgICAgICBpdCBcImNhc2UtMiBub3JtYWxcIiwgLT4gY2hlY2sgY2xvc2UsICdkJywgdGV4dDogdGV4dEZpbmFsLCBjdXJzb3I6IFswLCAyXVxuICAgICAgICBpdCBcImNhc2UtMyB2aXN1YWxcIiwgLT4gY2hlY2sgb3BlbiwgJ3YnLCB7c2VsZWN0ZWRUZXh0fVxuICAgICAgICBpdCBcImNhc2UtNCB2aXN1YWxcIiwgLT4gY2hlY2sgY2xvc2UsICd2Jywge3NlbGVjdGVkVGV4dH1cbiAgICBkZXNjcmliZSBcImEtYmFjay10aWNrXCIsIC0+XG4gICAgICBpdCBcImFwcGxpZXMgb3BlcmF0b3JzIGlubmVyLWFyZWFcIiwgLT5cbiAgICAgICAgZW5zdXJlIFwiZCBhIGBcIiwgdGV4dDogXCJ0aGlzIGlzICB0ZXh0LlwiLCBjdXJzb3I6IFswLCA4XVxuXG4gICAgICBpdCBcImRvIG5vdGhpbmcgd2hlbiBwYWlyIHJhbmdlIGlzIG5vdCB1bmRlciBjdXJzb3JcIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzAsIDE2XVxuICAgICAgICBlbnN1cmUgXCJkIGEgYFwiLCB0ZXh0OiBvcmlnaW5hbFRleHQsIGN1cnNvcjogWzAsIDE2XVxuICAgICAgZGVzY3JpYmUgXCJjdXJzb3IgaXMgb24gdGhlIHBhaXIgY2hhclwiLCAtPlxuICAgICAgICBjaGVjayA9IGdldENoZWNrRnVuY3Rpb25Gb3IoXCJhIGBcIilcbiAgICAgICAgdGV4dCA9IFwiLWArYC1cIlxuICAgICAgICB0ZXh0RmluYWwgPSBcIi0tXCJcbiAgICAgICAgc2VsZWN0ZWRUZXh0ID0gXCJgK2BcIlxuICAgICAgICBvcGVuID0gWzAsIDFdXG4gICAgICAgIGNsb3NlID0gWzAsIDNdXG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBzZXQge3RleHR9XG4gICAgICAgIGl0IFwiY2FzZS0xIG5vcm1hbFwiLCAtPiBjaGVjayBvcGVuLCAnZCcsIHRleHQ6IHRleHRGaW5hbCwgY3Vyc29yOiBbMCwgMV1cbiAgICAgICAgaXQgXCJjYXNlLTIgbm9ybWFsXCIsIC0+IGNoZWNrIGNsb3NlLCAnZCcsIHRleHQ6IHRleHRGaW5hbCwgY3Vyc29yOiBbMCwgMV1cbiAgICAgICAgaXQgXCJjYXNlLTMgdmlzdWFsXCIsIC0+IGNoZWNrIG9wZW4sICd2Jywge3NlbGVjdGVkVGV4dH1cbiAgICAgICAgaXQgXCJjYXNlLTQgdmlzdWFsXCIsIC0+IGNoZWNrIGNsb3NlLCAndicsIHtzZWxlY3RlZFRleHR9XG4gIGRlc2NyaWJlIFwiQ3VybHlCcmFja2V0XCIsIC0+XG4gICAgZGVzY3JpYmUgXCJzY29wZSBhd2FyZW5lc3Mgb2YgYnJhY2tldFwiLCAtPlxuICAgICAgaXQgXCJbc2VhcmNoIGZyb20gb3V0c2lkZSBvZiBkb3VibGUtcXVvdGVdIHNraXBzIGJyYWNrZXQgaW4gd2l0aGluLWxpbmUtYmFsYW5jZWQtZG91YmxlLXF1b3Rlc1wiLCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgeyB8IFwiaGVsbG8ge1wiIH1cbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgZW5zdXJlIFwidiBhIHtcIixcbiAgICAgICAgICBzZWxlY3RlZFRleHQ6IFwiXCJcIlxuICAgICAgICAgIHsgIFwiaGVsbG8ge1wiIH1cbiAgICAgICAgICBcIlwiXCJcblxuICAgICAgaXQgXCJOb3QgaWdub3JlIGJyYWNrZXQgaW4gd2l0aGluLWxpbmUtbm90LWJhbGFuY2VkLWRvdWJsZS1xdW90ZXNcIiwgLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgIHsgIFwiaGVsbG8ge1wiIHwgJ1wiJyB9XG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgIGVuc3VyZSBcInYgYSB7XCIsXG4gICAgICAgICAgc2VsZWN0ZWRUZXh0OiBcIlwiXCJcbiAgICAgICAgICB7XCIgICdcIicgfVxuICAgICAgICAgIFwiXCJcIlxuICAgICAgaXQgXCJbc2VhcmNoIGZyb20gaW5zaWRlIG9mIGRvdWJsZS1xdW90ZV0gc2tpcHMgYnJhY2tldCBpbiB3aXRoaW4tbGluZS1iYWxhbmNlZC1kb3VibGUtcXVvdGVzXCIsIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICB7ICBcImh8ZWxsbyB7XCIgfVxuICAgICAgICAgIFwiXCJcIlxuICAgICAgICBlbnN1cmUgXCJ2IGEge1wiLFxuICAgICAgICAgIHNlbGVjdGVkVGV4dDogXCJcIlwiXG4gICAgICAgICAgeyAgXCJoZWxsbyB7XCIgfVxuICAgICAgICAgIFwiXCJcIlxuXG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHRDXzogXCJcIlwiXG5cbiAgICAgICAgICBcIlwiXCJcbiAgICBkZXNjcmliZSBcImlubmVyLWN1cmx5LWJyYWNrZXRcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dDogXCJ7IHNvbWV0aGluZyBpbiBoZXJlIGFuZCBpbiB7aGVyZX0gfVwiXG4gICAgICAgICAgY3Vyc29yOiBbMCwgOV1cblxuICAgICAgaXQgXCJhcHBsaWVzIG9wZXJhdG9ycyB0byBpbm5lci1hcmVhIGluIG9wZXJhdG9yLXBlbmRpbmcgbW9kZVwiLCAtPlxuICAgICAgICBlbnN1cmUgJ2QgaSB7JyxcbiAgICAgICAgICB0ZXh0OiBcInt9XCJcbiAgICAgICAgICBjdXJzb3I6IFswLCAxXVxuXG4gICAgICBpdCBcImFwcGxpZXMgb3BlcmF0b3JzIHRvIGlubmVyLWFyZWEgaW4gb3BlcmF0b3ItcGVuZGluZyBtb2RlIChzZWNvbmQgdGVzdClcIiwgLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgY3Vyc29yOiBbMCwgMjldXG4gICAgICAgIGVuc3VyZSAnZCBpIHsnLFxuICAgICAgICAgIHRleHQ6IFwieyBzb21ldGhpbmcgaW4gaGVyZSBhbmQgaW4ge30gfVwiXG4gICAgICAgICAgY3Vyc29yOiBbMCwgMjhdXG5cbiAgICAgIGRlc2NyaWJlIFwiY3Vyc29yIGlzIG9uIHRoZSBwYWlyIGNoYXJcIiwgLT5cbiAgICAgICAgY2hlY2sgPSBnZXRDaGVja0Z1bmN0aW9uRm9yKCdpIHsnKVxuICAgICAgICB0ZXh0ID0gJy17K30tJ1xuICAgICAgICB0ZXh0RmluYWwgPSAnLXt9LSdcbiAgICAgICAgc2VsZWN0ZWRUZXh0ID0gJysnXG4gICAgICAgIG9wZW4gPSBbMCwgMV1cbiAgICAgICAgY2xvc2UgPSBbMCwgM11cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIHNldCB7dGV4dH1cbiAgICAgICAgaXQgXCJjYXNlLTEgbm9ybWFsXCIsIC0+IGNoZWNrIG9wZW4sICdkJywgdGV4dDogdGV4dEZpbmFsLCBjdXJzb3I6IFswLCAyXVxuICAgICAgICBpdCBcImNhc2UtMiBub3JtYWxcIiwgLT4gY2hlY2sgY2xvc2UsICdkJywgdGV4dDogdGV4dEZpbmFsLCBjdXJzb3I6IFswLCAyXVxuICAgICAgICBpdCBcImNhc2UtMyB2aXN1YWxcIiwgLT4gY2hlY2sgb3BlbiwgJ3YnLCB7c2VsZWN0ZWRUZXh0fVxuICAgICAgICBpdCBcImNhc2UtNCB2aXN1YWxcIiwgLT4gY2hlY2sgY2xvc2UsICd2Jywge3NlbGVjdGVkVGV4dH1cblxuICAgICAgZGVzY3JpYmUgXCJjaGFuZ2UgbW9kZSB0byBjaGFyYWN0ZXJ3aXNlXCIsIC0+XG4gICAgICAgICMgRklYTUUgbGFzdCBcIlxcblwiIHNob3VsZCBub3QgYmUgc2VsZWN0ZWRcbiAgICAgICAgdGV4dFNlbGVjdGVkID0gXCJcIlwiXG4gICAgICAgIF9fMSxcbiAgICAgICAgX18yLFxuICAgICAgICBfXzNcbiAgICAgICAgXCJcIlwiLnJlcGxhY2UoL18vZywgJyAnKVxuXG5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIHNldFxuICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICB8MSxcbiAgICAgICAgICAgICAgMixcbiAgICAgICAgICAgICAgM1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgZW5zdXJlIG1vZGU6ICdub3JtYWwnXG5cbiAgICAgICAgaXQgXCJmcm9tIHZDLCBmaW5hbC1tb2RlIGlzICdjaGFyYWN0ZXJ3aXNlJ1wiLCAtPlxuICAgICAgICAgIGVuc3VyZSAndicsXG4gICAgICAgICAgICBzZWxlY3RlZFRleHQ6IFsnMSddXG4gICAgICAgICAgICBtb2RlOiBbJ3Zpc3VhbCcsICdjaGFyYWN0ZXJ3aXNlJ11cbiAgICAgICAgICBlbnN1cmUgJ2kgQicsXG4gICAgICAgICAgICBzZWxlY3RlZFRleHQ6IHRleHRTZWxlY3RlZFxuICAgICAgICAgICAgbW9kZTogWyd2aXN1YWwnLCAnY2hhcmFjdGVyd2lzZSddXG5cbiAgICAgICAgaXQgXCJmcm9tIHZMLCBmaW5hbC1tb2RlIGlzICdjaGFyYWN0ZXJ3aXNlJ1wiLCAtPlxuICAgICAgICAgIGVuc3VyZSAnVicsXG4gICAgICAgICAgICBzZWxlY3RlZFRleHQ6IFtcIiAgMSxcXG5cIl1cbiAgICAgICAgICAgIG1vZGU6IFsndmlzdWFsJywgJ2xpbmV3aXNlJ11cbiAgICAgICAgICBlbnN1cmUgJ2kgQicsXG4gICAgICAgICAgICBzZWxlY3RlZFRleHQ6IHRleHRTZWxlY3RlZFxuICAgICAgICAgICAgbW9kZTogWyd2aXN1YWwnLCAnY2hhcmFjdGVyd2lzZSddXG5cbiAgICAgICAgaXQgXCJmcm9tIHZCLCBmaW5hbC1tb2RlIGlzICdjaGFyYWN0ZXJ3aXNlJ1wiLCAtPlxuICAgICAgICAgIGVuc3VyZSAnY3RybC12JyxcbiAgICAgICAgICAgIHNlbGVjdGVkVGV4dDogW1wiMVwiXVxuICAgICAgICAgICAgbW9kZTogWyd2aXN1YWwnLCAnYmxvY2t3aXNlJ11cbiAgICAgICAgICBlbnN1cmUgJ2kgQicsXG4gICAgICAgICAgICBzZWxlY3RlZFRleHQ6IHRleHRTZWxlY3RlZFxuICAgICAgICAgICAgbW9kZTogWyd2aXN1YWwnLCAnY2hhcmFjdGVyd2lzZSddXG5cbiAgICAgICAgZGVzY3JpYmUgXCJhcyBvcGVyYXRvciB0YXJnZXRcIiwgLT5cbiAgICAgICAgICBpdCBcImNoYW5nZSBpbm5lci1wYWlyXCIsIC0+XG4gICAgICAgICAgICBlbnN1cmUgXCJjIGkgQlwiLFxuICAgICAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgfFxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgICBtb2RlOiAnaW5zZXJ0J1xuICAgICAgICAgIGl0IFwiZGVsZXRlIGlubmVyLXBhaXJcIiwgLT5cbiAgICAgICAgICAgIGVuc3VyZSBcImQgaSBCXCIsXG4gICAgICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICB8fVxuICAgICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgICAgbW9kZTogJ25vcm1hbCdcblxuICAgIGRlc2NyaWJlIFwiYS1jdXJseS1icmFja2V0XCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHQ6IFwieyBzb21ldGhpbmcgaW4gaGVyZSBhbmQgaW4ge2hlcmV9IH1cIlxuICAgICAgICAgIGN1cnNvcjogWzAsIDldXG5cbiAgICAgIGl0IFwiYXBwbGllcyBvcGVyYXRvcnMgdG8gYS1hcmVhIGluIG9wZXJhdG9yLXBlbmRpbmcgbW9kZVwiLCAtPlxuICAgICAgICBlbnN1cmUgJ2QgYSB7JyxcbiAgICAgICAgICB0ZXh0OiAnJ1xuICAgICAgICAgIGN1cnNvcjogWzAsIDBdXG4gICAgICAgICAgbW9kZTogJ25vcm1hbCdcblxuICAgICAgaXQgXCJhcHBsaWVzIG9wZXJhdG9ycyB0byBhLWFyZWEgaW4gb3BlcmF0b3ItcGVuZGluZyBtb2RlIChzZWNvbmQgdGVzdClcIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzAsIDI5XVxuICAgICAgICBlbnN1cmUgJ2QgYSB7JyxcbiAgICAgICAgICB0ZXh0OiBcInsgc29tZXRoaW5nIGluIGhlcmUgYW5kIGluICB9XCJcbiAgICAgICAgICBjdXJzb3I6IFswLCAyN11cbiAgICAgICAgICBtb2RlOiAnbm9ybWFsJ1xuICAgICAgZGVzY3JpYmUgXCJjdXJzb3IgaXMgb24gdGhlIHBhaXIgY2hhclwiLCAtPlxuICAgICAgICBjaGVjayA9IGdldENoZWNrRnVuY3Rpb25Gb3IoXCJhIHtcIilcbiAgICAgICAgdGV4dCA9IFwiLXsrfS1cIlxuICAgICAgICB0ZXh0RmluYWwgPSBcIi0tXCJcbiAgICAgICAgc2VsZWN0ZWRUZXh0ID0gXCJ7K31cIlxuICAgICAgICBvcGVuID0gWzAsIDFdXG4gICAgICAgIGNsb3NlID0gWzAsIDNdXG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBzZXQge3RleHR9XG4gICAgICAgIGl0IFwiY2FzZS0xIG5vcm1hbFwiLCAtPiBjaGVjayBvcGVuLCAnZCcsIHRleHQ6IHRleHRGaW5hbCwgY3Vyc29yOiBbMCwgMV1cbiAgICAgICAgaXQgXCJjYXNlLTIgbm9ybWFsXCIsIC0+IGNoZWNrIGNsb3NlLCAnZCcsIHRleHQ6IHRleHRGaW5hbCwgY3Vyc29yOiBbMCwgMV1cbiAgICAgICAgaXQgXCJjYXNlLTMgdmlzdWFsXCIsIC0+IGNoZWNrIG9wZW4sICd2Jywge3NlbGVjdGVkVGV4dH1cbiAgICAgICAgaXQgXCJjYXNlLTQgdmlzdWFsXCIsIC0+IGNoZWNrIGNsb3NlLCAndicsIHtzZWxlY3RlZFRleHR9XG5cbiAgICAgIGRlc2NyaWJlIFwiY2hhbmdlIG1vZGUgdG8gY2hhcmFjdGVyd2lzZVwiLCAtPlxuICAgICAgICB0ZXh0U2VsZWN0ZWQgPSBcIlwiXCJcbiAgICAgICAgICB7XG4gICAgICAgICAgICAxLFxuICAgICAgICAgICAgMixcbiAgICAgICAgICAgIDNcbiAgICAgICAgICB9XG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBzZXRcbiAgICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgfDEsXG4gICAgICAgICAgICAgIDIsXG4gICAgICAgICAgICAgIDNcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaGVsbG9cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIGVuc3VyZSBtb2RlOiAnbm9ybWFsJ1xuXG4gICAgICAgIGl0IFwiZnJvbSB2QywgZmluYWwtbW9kZSBpcyAnY2hhcmFjdGVyd2lzZSdcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJ3YnLFxuICAgICAgICAgICAgc2VsZWN0ZWRUZXh0OiBbJzEnXVxuICAgICAgICAgICAgbW9kZTogWyd2aXN1YWwnLCAnY2hhcmFjdGVyd2lzZSddXG4gICAgICAgICAgZW5zdXJlICdhIEInLFxuICAgICAgICAgICAgc2VsZWN0ZWRUZXh0OiB0ZXh0U2VsZWN0ZWRcbiAgICAgICAgICAgIG1vZGU6IFsndmlzdWFsJywgJ2NoYXJhY3Rlcndpc2UnXVxuXG4gICAgICAgIGl0IFwiZnJvbSB2TCwgZmluYWwtbW9kZSBpcyAnY2hhcmFjdGVyd2lzZSdcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJ1YnLFxuICAgICAgICAgICAgc2VsZWN0ZWRUZXh0OiBbXCIgIDEsXFxuXCJdXG4gICAgICAgICAgICBtb2RlOiBbJ3Zpc3VhbCcsICdsaW5ld2lzZSddXG4gICAgICAgICAgZW5zdXJlICdhIEInLFxuICAgICAgICAgICAgc2VsZWN0ZWRUZXh0OiB0ZXh0U2VsZWN0ZWRcbiAgICAgICAgICAgIG1vZGU6IFsndmlzdWFsJywgJ2NoYXJhY3Rlcndpc2UnXVxuXG4gICAgICAgIGl0IFwiZnJvbSB2QiwgZmluYWwtbW9kZSBpcyAnY2hhcmFjdGVyd2lzZSdcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJ2N0cmwtdicsXG4gICAgICAgICAgICBzZWxlY3RlZFRleHQ6IFtcIjFcIl1cbiAgICAgICAgICAgIG1vZGU6IFsndmlzdWFsJywgJ2Jsb2Nrd2lzZSddXG4gICAgICAgICAgZW5zdXJlICdhIEInLFxuICAgICAgICAgICAgc2VsZWN0ZWRUZXh0OiB0ZXh0U2VsZWN0ZWRcbiAgICAgICAgICAgIG1vZGU6IFsndmlzdWFsJywgJ2NoYXJhY3Rlcndpc2UnXVxuXG4gICAgICAgIGRlc2NyaWJlIFwiYXMgb3BlcmF0b3IgdGFyZ2V0XCIsIC0+XG4gICAgICAgICAgaXQgXCJjaGFuZ2UgaW5uZXItcGFpclwiLCAtPlxuICAgICAgICAgICAgZW5zdXJlIFwiYyBhIEJcIixcbiAgICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgICB8XG5cbiAgICAgICAgICAgICAgaGVsbG9cbiAgICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICAgIG1vZGU6ICdpbnNlcnQnXG4gICAgICAgICAgaXQgXCJkZWxldGUgaW5uZXItcGFpclwiLCAtPlxuICAgICAgICAgICAgZW5zdXJlIFwiZCBhIEJcIixcbiAgICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgICB8XG5cbiAgICAgICAgICAgICAgaGVsbG9cbiAgICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICAgIG1vZGU6ICdub3JtYWwnXG5cblxuICBkZXNjcmliZSBcIkFuZ2xlQnJhY2tldFwiLCAtPlxuICAgIGRlc2NyaWJlIFwiaW5uZXItYW5nbGUtYnJhY2tldFwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0OiBcIjwgc29tZXRoaW5nIGluIGhlcmUgYW5kIGluIDxoZXJlPiA+XCJcbiAgICAgICAgICBjdXJzb3I6IFswLCA5XVxuXG4gICAgICBpdCBcImFwcGxpZXMgb3BlcmF0b3JzIGluc2lkZSB0aGUgY3VycmVudCB3b3JkIGluIG9wZXJhdG9yLXBlbmRpbmcgbW9kZVwiLCAtPlxuICAgICAgICBlbnN1cmUgJ2QgaSA8JyxcbiAgICAgICAgICB0ZXh0OiBcIjw+XCJcbiAgICAgICAgICBjdXJzb3I6IFswLCAxXVxuXG4gICAgICBpdCBcImFwcGxpZXMgb3BlcmF0b3JzIGluc2lkZSB0aGUgY3VycmVudCB3b3JkIGluIG9wZXJhdG9yLXBlbmRpbmcgbW9kZSAoc2Vjb25kIHRlc3QpXCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFswLCAyOV1cbiAgICAgICAgZW5zdXJlICdkIGkgPCcsXG4gICAgICAgICAgdGV4dDogXCI8IHNvbWV0aGluZyBpbiBoZXJlIGFuZCBpbiA8PiA+XCJcbiAgICAgICAgICBjdXJzb3I6IFswLCAyOF1cbiAgICAgIGRlc2NyaWJlIFwiY3Vyc29yIGlzIG9uIHRoZSBwYWlyIGNoYXJcIiwgLT5cbiAgICAgICAgY2hlY2sgPSBnZXRDaGVja0Z1bmN0aW9uRm9yKCdpIDwnKVxuICAgICAgICB0ZXh0ID0gJy08Kz4tJ1xuICAgICAgICB0ZXh0RmluYWwgPSAnLTw+LSdcbiAgICAgICAgc2VsZWN0ZWRUZXh0ID0gJysnXG4gICAgICAgIG9wZW4gPSBbMCwgMV1cbiAgICAgICAgY2xvc2UgPSBbMCwgM11cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIHNldCB7dGV4dH1cbiAgICAgICAgaXQgXCJjYXNlLTEgbm9ybWFsXCIsIC0+IGNoZWNrIG9wZW4sICdkJywgdGV4dDogdGV4dEZpbmFsLCBjdXJzb3I6IFswLCAyXVxuICAgICAgICBpdCBcImNhc2UtMiBub3JtYWxcIiwgLT4gY2hlY2sgY2xvc2UsICdkJywgdGV4dDogdGV4dEZpbmFsLCBjdXJzb3I6IFswLCAyXVxuICAgICAgICBpdCBcImNhc2UtMyB2aXN1YWxcIiwgLT4gY2hlY2sgb3BlbiwgJ3YnLCB7c2VsZWN0ZWRUZXh0fVxuICAgICAgICBpdCBcImNhc2UtNCB2aXN1YWxcIiwgLT4gY2hlY2sgY2xvc2UsICd2Jywge3NlbGVjdGVkVGV4dH1cbiAgICBkZXNjcmliZSBcImEtYW5nbGUtYnJhY2tldFwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0OiBcIjwgc29tZXRoaW5nIGluIGhlcmUgYW5kIGluIDxoZXJlPiA+XCJcbiAgICAgICAgICBjdXJzb3I6IFswLCA5XVxuXG4gICAgICBpdCBcImFwcGxpZXMgb3BlcmF0b3JzIGFyb3VuZCB0aGUgY3VycmVudCBhbmdsZSBicmFja2V0cyBpbiBvcGVyYXRvci1wZW5kaW5nIG1vZGVcIiwgLT5cbiAgICAgICAgZW5zdXJlICdkIGEgPCcsXG4gICAgICAgICAgdGV4dDogJydcbiAgICAgICAgICBjdXJzb3I6IFswLCAwXVxuICAgICAgICAgIG1vZGU6ICdub3JtYWwnXG5cbiAgICAgIGl0IFwiYXBwbGllcyBvcGVyYXRvcnMgYXJvdW5kIHRoZSBjdXJyZW50IGFuZ2xlIGJyYWNrZXRzIGluIG9wZXJhdG9yLXBlbmRpbmcgbW9kZSAoc2Vjb25kIHRlc3QpXCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFswLCAyOV1cbiAgICAgICAgZW5zdXJlICdkIGEgPCcsXG4gICAgICAgICAgdGV4dDogXCI8IHNvbWV0aGluZyBpbiBoZXJlIGFuZCBpbiAgPlwiXG4gICAgICAgICAgY3Vyc29yOiBbMCwgMjddXG4gICAgICAgICAgbW9kZTogJ25vcm1hbCdcbiAgICAgIGRlc2NyaWJlIFwiY3Vyc29yIGlzIG9uIHRoZSBwYWlyIGNoYXJcIiwgLT5cbiAgICAgICAgY2hlY2sgPSBnZXRDaGVja0Z1bmN0aW9uRm9yKFwiYSA8XCIpXG4gICAgICAgIHRleHQgPSBcIi08Kz4tXCJcbiAgICAgICAgdGV4dEZpbmFsID0gXCItLVwiXG4gICAgICAgIHNlbGVjdGVkVGV4dCA9IFwiPCs+XCJcbiAgICAgICAgb3BlbiA9IFswLCAxXVxuICAgICAgICBjbG9zZSA9IFswLCAzXVxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgc2V0IHt0ZXh0fVxuICAgICAgICBpdCBcImNhc2UtMSBub3JtYWxcIiwgLT4gY2hlY2sgb3BlbiwgJ2QnLCB0ZXh0OiB0ZXh0RmluYWwsIGN1cnNvcjogWzAsIDFdXG4gICAgICAgIGl0IFwiY2FzZS0yIG5vcm1hbFwiLCAtPiBjaGVjayBjbG9zZSwgJ2QnLCB0ZXh0OiB0ZXh0RmluYWwsIGN1cnNvcjogWzAsIDFdXG4gICAgICAgIGl0IFwiY2FzZS0zIHZpc3VhbFwiLCAtPiBjaGVjayBvcGVuLCAndicsIHtzZWxlY3RlZFRleHR9XG4gICAgICAgIGl0IFwiY2FzZS00IHZpc3VhbFwiLCAtPiBjaGVjayBjbG9zZSwgJ3YnLCB7c2VsZWN0ZWRUZXh0fVxuXG4gIGRlc2NyaWJlIFwiQWxsb3dGb3J3YXJkaW5nIGZhbWlseVwiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIGF0b20ua2V5bWFwcy5hZGQgXCJ0ZXN0XCIsXG4gICAgICAgICdhdG9tLXRleHQtZWRpdG9yLnZpbS1tb2RlLXBsdXMub3BlcmF0b3ItcGVuZGluZy1tb2RlLCBhdG9tLXRleHQtZWRpdG9yLnZpbS1tb2RlLXBsdXMudmlzdWFsLW1vZGUnOlxuICAgICAgICAgICdpIH0nOiAgJ3ZpbS1tb2RlLXBsdXM6aW5uZXItY3VybHktYnJhY2tldC1hbGxvdy1mb3J3YXJkaW5nJ1xuICAgICAgICAgICdpID4nOiAgJ3ZpbS1tb2RlLXBsdXM6aW5uZXItYW5nbGUtYnJhY2tldC1hbGxvdy1mb3J3YXJkaW5nJ1xuICAgICAgICAgICdpIF0nOiAgJ3ZpbS1tb2RlLXBsdXM6aW5uZXItc3F1YXJlLWJyYWNrZXQtYWxsb3ctZm9yd2FyZGluZydcbiAgICAgICAgICAnaSApJzogICd2aW0tbW9kZS1wbHVzOmlubmVyLXBhcmVudGhlc2lzLWFsbG93LWZvcndhcmRpbmcnXG5cbiAgICAgICAgICAnYSB9JzogICd2aW0tbW9kZS1wbHVzOmEtY3VybHktYnJhY2tldC1hbGxvdy1mb3J3YXJkaW5nJ1xuICAgICAgICAgICdhID4nOiAgJ3ZpbS1tb2RlLXBsdXM6YS1hbmdsZS1icmFja2V0LWFsbG93LWZvcndhcmRpbmcnXG4gICAgICAgICAgJ2EgXSc6ICAndmltLW1vZGUtcGx1czphLXNxdWFyZS1icmFja2V0LWFsbG93LWZvcndhcmRpbmcnXG4gICAgICAgICAgJ2EgKSc6ICAndmltLW1vZGUtcGx1czphLXBhcmVudGhlc2lzLWFsbG93LWZvcndhcmRpbmcnXG5cbiAgICAgIHNldFxuICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgX197MDAwfV9fXG4gICAgICAgIF9fPDExMT5fX1xuICAgICAgICBfX1syMjJdX19cbiAgICAgICAgX18oMzMzKV9fXG4gICAgICAgIFwiXCJcIlxuICAgIGRlc2NyaWJlIFwiaW5uZXJcIiwgLT5cbiAgICAgIGl0IFwic2VsZWN0IGZvcndhcmRpbmcgcmFuZ2VcIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzAsIDBdOyBlbnN1cmUgJ2VzY2FwZSB2IGkgfScsIHNlbGVjdGVkVGV4dDogXCIwMDBcIlxuICAgICAgICBzZXQgY3Vyc29yOiBbMSwgMF07IGVuc3VyZSAnZXNjYXBlIHYgaSA+Jywgc2VsZWN0ZWRUZXh0OiBcIjExMVwiXG4gICAgICAgIHNldCBjdXJzb3I6IFsyLCAwXTsgZW5zdXJlICdlc2NhcGUgdiBpIF0nLCBzZWxlY3RlZFRleHQ6IFwiMjIyXCJcbiAgICAgICAgc2V0IGN1cnNvcjogWzMsIDBdOyBlbnN1cmUgJ2VzY2FwZSB2IGkgKScsIHNlbGVjdGVkVGV4dDogXCIzMzNcIlxuICAgIGRlc2NyaWJlIFwiYVwiLCAtPlxuICAgICAgaXQgXCJzZWxlY3QgZm9yd2FyZGluZyByYW5nZVwiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMF07IGVuc3VyZSAnZXNjYXBlIHYgYSB9Jywgc2VsZWN0ZWRUZXh0OiBcInswMDB9XCJcbiAgICAgICAgc2V0IGN1cnNvcjogWzEsIDBdOyBlbnN1cmUgJ2VzY2FwZSB2IGEgPicsIHNlbGVjdGVkVGV4dDogXCI8MTExPlwiXG4gICAgICAgIHNldCBjdXJzb3I6IFsyLCAwXTsgZW5zdXJlICdlc2NhcGUgdiBhIF0nLCBzZWxlY3RlZFRleHQ6IFwiWzIyMl1cIlxuICAgICAgICBzZXQgY3Vyc29yOiBbMywgMF07IGVuc3VyZSAnZXNjYXBlIHYgYSApJywgc2VsZWN0ZWRUZXh0OiBcIigzMzMpXCJcbiAgICBkZXNjcmliZSBcIm11bHRpIGxpbmUgdGV4dFwiLCAtPlxuICAgICAgW3RleHRPbmVJbm5lciwgdGV4dE9uZUFdID0gW11cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgMDAwXG4gICAgICAgICAgMDAwezExXG4gICAgICAgICAgMTExezIyfVxuICAgICAgICAgIDExMVxuICAgICAgICAgIDExMX1cbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgdGV4dE9uZUlubmVyID0gXCJcIlwiXG4gICAgICAgICAgMTFcbiAgICAgICAgICAxMTF7MjJ9XG4gICAgICAgICAgMTExXG4gICAgICAgICAgMTExXG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgIHRleHRPbmVBID0gXCJcIlwiXG4gICAgICAgICAgezExXG4gICAgICAgICAgMTExezIyfVxuICAgICAgICAgIDExMVxuICAgICAgICAgIDExMX1cbiAgICAgICAgICBcIlwiXCJcbiAgICAgIGRlc2NyaWJlIFwiZm9yd2FyZGluZyBpbm5lclwiLCAtPlxuICAgICAgICBpdCBcInNlbGVjdCBmb3J3YXJkaW5nIHJhbmdlXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzEsIDBdOyBlbnN1cmUgXCJ2IGkgfVwiLCBzZWxlY3RlZFRleHQ6IHRleHRPbmVJbm5lclxuICAgICAgICBpdCBcInNlbGVjdCBmb3J3YXJkaW5nIHJhbmdlXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzIsIDBdOyBlbnN1cmUgXCJ2IGkgfVwiLCBzZWxlY3RlZFRleHQ6IFwiMjJcIlxuICAgICAgICBpdCBcIltjYXNlLTFdIG5vIGZvcndhcmRpbmcgb3BlbiBwYWlyLCBmYWlsIHRvIGZpbmRcIiwgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMF07IGVuc3VyZSBcInYgaSB9XCIsIHNlbGVjdGVkVGV4dDogJzAnLCBjdXJzb3I6IFswLCAxXVxuICAgICAgICBpdCBcIltjYXNlLTJdIG5vIGZvcndhcmRpbmcgb3BlbiBwYWlyLCBzZWxlY3QgZW5jbG9zZWRcIiwgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMSwgNF07IGVuc3VyZSBcInYgaSB9XCIsIHNlbGVjdGVkVGV4dDogdGV4dE9uZUlubmVyXG4gICAgICAgIGl0IFwiW2Nhc2UtM10gbm8gZm9yd2FyZGluZyBvcGVuIHBhaXIsIHNlbGVjdCBlbmNsb3NlZFwiLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFszLCAwXTsgZW5zdXJlIFwidiBpIH1cIiwgc2VsZWN0ZWRUZXh0OiB0ZXh0T25lSW5uZXJcbiAgICAgICAgaXQgXCJbY2FzZS0zXSBubyBmb3J3YXJkaW5nIG9wZW4gcGFpciwgc2VsZWN0IGVuY2xvc2VkXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzQsIDBdOyBlbnN1cmUgXCJ2IGkgfVwiLCBzZWxlY3RlZFRleHQ6IHRleHRPbmVJbm5lclxuICAgICAgZGVzY3JpYmUgXCJmb3J3YXJkaW5nIGFcIiwgLT5cbiAgICAgICAgaXQgXCJzZWxlY3QgZm9yd2FyZGluZyByYW5nZVwiLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFsxLCAwXTsgZW5zdXJlIFwidiBhIH1cIiwgc2VsZWN0ZWRUZXh0OiB0ZXh0T25lQVxuICAgICAgICBpdCBcInNlbGVjdCBmb3J3YXJkaW5nIHJhbmdlXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzIsIDBdOyBlbnN1cmUgXCJ2IGEgfVwiLCBzZWxlY3RlZFRleHQ6IFwiezIyfVwiXG4gICAgICAgIGl0IFwiW2Nhc2UtMV0gbm8gZm9yd2FyZGluZyBvcGVuIHBhaXIsIGZhaWwgdG8gZmluZFwiLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFswLCAwXTsgZW5zdXJlIFwidiBhIH1cIiwgc2VsZWN0ZWRUZXh0OiAnMCcsIGN1cnNvcjogWzAsIDFdXG4gICAgICAgIGl0IFwiW2Nhc2UtMl0gbm8gZm9yd2FyZGluZyBvcGVuIHBhaXIsIHNlbGVjdCBlbmNsb3NlZFwiLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFsxLCA0XTsgZW5zdXJlIFwidiBhIH1cIiwgc2VsZWN0ZWRUZXh0OiB0ZXh0T25lQVxuICAgICAgICBpdCBcIltjYXNlLTNdIG5vIGZvcndhcmRpbmcgb3BlbiBwYWlyLCBzZWxlY3QgZW5jbG9zZWRcIiwgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMywgMF07IGVuc3VyZSBcInYgYSB9XCIsIHNlbGVjdGVkVGV4dDogdGV4dE9uZUFcbiAgICAgICAgaXQgXCJbY2FzZS0zXSBubyBmb3J3YXJkaW5nIG9wZW4gcGFpciwgc2VsZWN0IGVuY2xvc2VkXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzQsIDBdOyBlbnN1cmUgXCJ2IGEgfVwiLCBzZWxlY3RlZFRleHQ6IHRleHRPbmVBXG5cbiAgZGVzY3JpYmUgXCJBbnlQYWlyQWxsb3dGb3J3YXJkaW5nXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgYXRvbS5rZXltYXBzLmFkZCBcInRleHRcIixcbiAgICAgICAgJ2F0b20tdGV4dC1lZGl0b3IudmltLW1vZGUtcGx1cy5vcGVyYXRvci1wZW5kaW5nLW1vZGUsIGF0b20tdGV4dC1lZGl0b3IudmltLW1vZGUtcGx1cy52aXN1YWwtbW9kZSc6XG4gICAgICAgICAgXCI7XCI6ICd2aW0tbW9kZS1wbHVzOmlubmVyLWFueS1wYWlyLWFsbG93LWZvcndhcmRpbmcnXG4gICAgICAgICAgXCI6XCI6ICd2aW0tbW9kZS1wbHVzOmEtYW55LXBhaXItYWxsb3ctZm9yd2FyZGluZydcblxuICAgICAgc2V0IHRleHQ6IFwiXCJcIlxuICAgICAgICAwMFxuICAgICAgICAwMFsxMVxuICAgICAgICAxMVwiMjIyXCIxMXszMzN9MTEoXG4gICAgICAgIDQ0NCgpNDQ0XG4gICAgICAgIClcbiAgICAgICAgMTExXTAwezU1NX1cbiAgICAgICAgXCJcIlwiXG4gICAgZGVzY3JpYmUgXCJpbm5lclwiLCAtPlxuICAgICAgaXQgXCJzZWxlY3QgZm9yd2FyZGluZyByYW5nZSB3aXRoaW4gZW5jbG9zZWQgcmFuZ2UoaWYgZXhpc3RzKVwiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMiwgMF1cbiAgICAgICAga2V5c3Ryb2tlICd2J1xuICAgICAgICBlbnN1cmUgJzsnLCBzZWxlY3RlZFRleHQ6IFwiMjIyXCJcbiAgICAgICAgZW5zdXJlICc7Jywgc2VsZWN0ZWRUZXh0OiBcIjMzM1wiXG4gICAgICAgIGVuc3VyZSAnOycsIHNlbGVjdGVkVGV4dDogXCI0NDQoKTQ0NFwiXG4gICAgZGVzY3JpYmUgXCJhXCIsIC0+XG4gICAgICBpdCBcInNlbGVjdCBmb3J3YXJkaW5nIHJhbmdlIHdpdGhpbiBlbmNsb3NlZCByYW5nZShpZiBleGlzdHMpXCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFsyLCAwXVxuICAgICAgICBrZXlzdHJva2UgJ3YnXG4gICAgICAgIGVuc3VyZSAnOicsIHNlbGVjdGVkVGV4dDogJ1wiMjIyXCInXG4gICAgICAgIGVuc3VyZSAnOicsIHNlbGVjdGVkVGV4dDogXCJ7MzMzfVwiXG4gICAgICAgIGVuc3VyZSAnOicsIHNlbGVjdGVkVGV4dDogXCIoXFxuNDQ0KCk0NDRcXG4pXCJcbiAgICAgICAgZW5zdXJlICc6Jywgc2VsZWN0ZWRUZXh0OiBcIlwiXCJcbiAgICAgICAgWzExXG4gICAgICAgIDExXCIyMjJcIjExezMzM30xMShcbiAgICAgICAgNDQ0KCk0NDRcbiAgICAgICAgKVxuICAgICAgICAxMTFdXG4gICAgICAgIFwiXCJcIlxuXG4gIGRlc2NyaWJlIFwiVGFnXCIsIC0+XG4gICAgW2Vuc3VyZVNlbGVjdGVkVGV4dF0gPSBbXVxuICAgIGVuc3VyZVNlbGVjdGVkVGV4dCA9IChzdGFydCwga2V5c3Ryb2tlLCBzZWxlY3RlZFRleHQpIC0+XG4gICAgICBzZXQgY3Vyc29yOiBzdGFydFxuICAgICAgZW5zdXJlIGtleXN0cm9rZSwge3NlbGVjdGVkVGV4dH1cblxuICAgIGRlc2NyaWJlIFwiaW5uZXItdGFnXCIsIC0+XG4gICAgICBkZXNjcmliZSBcInByZWNpc2VseSBzZWxlY3QgaW5uZXJcIiwgLT5cbiAgICAgICAgY2hlY2sgPSBnZXRDaGVja0Z1bmN0aW9uRm9yKCdpIHQnKVxuICAgICAgICB0ZXh0ID0gXCJcIlwiXG4gICAgICAgICAgPGFiYz5cbiAgICAgICAgICAgIDx0aXRsZT5USVRMRTwvdGl0bGU+XG4gICAgICAgICAgPC9hYmM+XG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgIHNlbGVjdGVkVGV4dCA9IFwiVElUTEVcIlxuICAgICAgICBpbm5lckFCQyA9IFwiXFxuICA8dGl0bGU+VElUTEU8L3RpdGxlPlxcblwiXG4gICAgICAgIHRleHRBZnRlckRlbGV0ZWQgPSBcIlwiXCJcbiAgICAgICAgICA8YWJjPlxuICAgICAgICAgICAgPHRpdGxlPjwvdGl0bGU+XG4gICAgICAgICAgPC9hYmM+XG4gICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIHNldCB7dGV4dH1cblxuICAgICAgICAjIFNlbGVjdFxuICAgICAgICBpdCBcIlsxXSBmb3J3YXJkaW5nXCIsIC0+IGNoZWNrIFsxLCAwXSwgJ3YnLCB7c2VsZWN0ZWRUZXh0fVxuICAgICAgICBpdCBcIlsyXSBvcGVuVGFnIGxlZnRtb3N0XCIsIC0+IGNoZWNrIFsxLCAyXSwgJ3YnLCB7c2VsZWN0ZWRUZXh0fVxuICAgICAgICBpdCBcIlszXSBvcGVuVGFnIHJpZ2h0bW9zdFwiLCAtPiBjaGVjayBbMSwgOF0sICd2Jywge3NlbGVjdGVkVGV4dH1cbiAgICAgICAgaXQgXCJbNF0gSW5uZXIgdGV4dFwiLCAtPiBjaGVjayBbMSwgMTBdLCAndicsIHtzZWxlY3RlZFRleHR9XG4gICAgICAgIGl0IFwiWzVdIGNsb3NlVGFnIGxlZnRtb3N0XCIsIC0+IGNoZWNrIFsxLCAxNF0sICd2Jywge3NlbGVjdGVkVGV4dH1cbiAgICAgICAgaXQgXCJbNl0gY2xvc2VUYWcgcmlnaHRtb3N0XCIsIC0+IGNoZWNrIFsxLCAyMV0sICd2Jywge3NlbGVjdGVkVGV4dH1cbiAgICAgICAgaXQgXCJbN10gcmlnaHQgb2YgY2xvc2VUYWdcIiwgLT4gY2hlY2sgWzIsIDBdLCAndicsIHtzZWxlY3RlZFRleHQ6IGlubmVyQUJDfVxuXG4gICAgICAgICMgRGVsZXRlXG4gICAgICAgIGl0IFwiWzhdIGZvcndhcmRpbmdcIiwgLT4gY2hlY2sgWzEsIDBdLCAnZCcsIHt0ZXh0OiB0ZXh0QWZ0ZXJEZWxldGVkfVxuICAgICAgICBpdCBcIls5XSBvcGVuVGFnIGxlZnRtb3N0XCIsIC0+IGNoZWNrIFsxLCAyXSwgJ2QnLCB7dGV4dDogdGV4dEFmdGVyRGVsZXRlZH1cbiAgICAgICAgaXQgXCJbMTBdIG9wZW5UYWcgcmlnaHRtb3N0XCIsIC0+IGNoZWNrIFsxLCA4XSwgJ2QnLCB7dGV4dDogdGV4dEFmdGVyRGVsZXRlZH1cbiAgICAgICAgaXQgXCJbMTFdIElubmVyIHRleHRcIiwgLT4gY2hlY2sgWzEsIDEwXSwgJ2QnLCB7dGV4dDogdGV4dEFmdGVyRGVsZXRlZH1cbiAgICAgICAgaXQgXCJbMTJdIGNsb3NlVGFnIGxlZnRtb3N0XCIsIC0+IGNoZWNrIFsxLCAxNF0sICdkJywge3RleHQ6IHRleHRBZnRlckRlbGV0ZWR9XG4gICAgICAgIGl0IFwiWzEzXSBjbG9zZVRhZyByaWdodG1vc3RcIiwgLT4gY2hlY2sgWzEsIDIxXSwgJ2QnLCB7dGV4dDogdGV4dEFmdGVyRGVsZXRlZH1cbiAgICAgICAgaXQgXCJbMTRdIHJpZ2h0IG9mIGNsb3NlVGFnXCIsIC0+IGNoZWNrIFsyLCAwXSwgJ2QnLCB7dGV4dDogXCI8YWJjPjwvYWJjPlwifVxuXG4gICAgICBkZXNjcmliZSBcImV4cGFuc2lvbiBhbmQgZGVsZXRpb25cIiwgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgICMgW05PVEVdIEludGVudGlvbmFsbHkgb21pdCBgIWAgcHJlZml4IG9mIERPQ1RZUEUgc2luY2UgaXQgcmVwcmVzZW50IGxhc3QgY3Vyc29yIGluIHRleHRDLlxuICAgICAgICAgIGh0bWxMaWtlVGV4dCA9IFwiXCJcIlxuICAgICAgICAgIDxET0NUWVBFIGh0bWw+XG4gICAgICAgICAgPGh0bWwgbGFuZz1cImVuXCI+XG4gICAgICAgICAgPGhlYWQ+XG4gICAgICAgICAgX188bWV0YSBjaGFyc2V0PVwiVVRGLThcIiAvPlxuICAgICAgICAgIF9fPHRpdGxlPkRvY3VtZW50PC90aXRsZT5cbiAgICAgICAgICA8L2hlYWQ+XG4gICAgICAgICAgPGJvZHk+XG4gICAgICAgICAgX188ZGl2PlxuICAgICAgICAgIF9fX188ZGl2PlxuICAgICAgICAgIHxfX19fX188ZGl2PlxuICAgICAgICAgIF9fX19fX19fPHA+PGE+XG4gICAgICAgICAgX19fX19fPC9kaXY+XG4gICAgICAgICAgX19fXzwvZGl2PlxuICAgICAgICAgIF9fPC9kaXY+XG4gICAgICAgICAgPC9ib2R5PlxuICAgICAgICAgIDwvaHRtbD5cXG5cbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICBzZXQgdGV4dENfOiBodG1sTGlrZVRleHRcblxuICAgICAgICBpdCBcImNhbiBleHBhbmQgc2VsZWN0aW9uIHdoZW4gcmVwZWF0ZWRcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJ3YgaSB0Jywgc2VsZWN0ZWRUZXh0XzogXCJcIlwiXG4gICAgICAgICAgICBcXG5fX19fX19fXzxwPjxhPlxuICAgICAgICAgICAgX19fX19fXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICBlbnN1cmUgJ2kgdCcsIHNlbGVjdGVkVGV4dF86IFwiXCJcIlxuICAgICAgICAgICAgXFxuX19fX19fPGRpdj5cbiAgICAgICAgICAgIF9fX19fX19fPHA+PGE+XG4gICAgICAgICAgICBfX19fX188L2Rpdj5cbiAgICAgICAgICAgIF9fX19cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIGVuc3VyZSAnaSB0Jywgc2VsZWN0ZWRUZXh0XzogXCJcIlwiXG4gICAgICAgICAgICBcXG5fX19fPGRpdj5cbiAgICAgICAgICAgIF9fX19fXzxkaXY+XG4gICAgICAgICAgICBfX19fX19fXzxwPjxhPlxuICAgICAgICAgICAgX19fX19fPC9kaXY+XG4gICAgICAgICAgICBfX19fPC9kaXY+XG4gICAgICAgICAgICBfX1xuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgZW5zdXJlICdpIHQnLCBzZWxlY3RlZFRleHRfOiBcIlwiXCJcbiAgICAgICAgICAgIFxcbl9fPGRpdj5cbiAgICAgICAgICAgIF9fX188ZGl2PlxuICAgICAgICAgICAgX19fX19fPGRpdj5cbiAgICAgICAgICAgIF9fX19fX19fPHA+PGE+XG4gICAgICAgICAgICBfX19fX188L2Rpdj5cbiAgICAgICAgICAgIF9fX188L2Rpdj5cbiAgICAgICAgICAgIF9fPC9kaXY+XFxuXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICBlbnN1cmUgJ2kgdCcsIHNlbGVjdGVkVGV4dF86IFwiXCJcIlxuICAgICAgICAgICAgXFxuPGhlYWQ+XG4gICAgICAgICAgICBfXzxtZXRhIGNoYXJzZXQ9XCJVVEYtOFwiIC8+XG4gICAgICAgICAgICBfXzx0aXRsZT5Eb2N1bWVudDwvdGl0bGU+XG4gICAgICAgICAgICA8L2hlYWQ+XG4gICAgICAgICAgICA8Ym9keT5cbiAgICAgICAgICAgIF9fPGRpdj5cbiAgICAgICAgICAgIF9fX188ZGl2PlxuICAgICAgICAgICAgX19fX19fPGRpdj5cbiAgICAgICAgICAgIF9fX19fX19fPHA+PGE+XG4gICAgICAgICAgICBfX19fX188L2Rpdj5cbiAgICAgICAgICAgIF9fX188L2Rpdj5cbiAgICAgICAgICAgIF9fPC9kaXY+XG4gICAgICAgICAgICA8L2JvZHk+XFxuXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgaXQgJ2RlbGV0ZSBpbm5lci10YWcgYW5kIHJlcGF0YWJsZScsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzksIDBdXG4gICAgICAgICAgZW5zdXJlIFwiZCBpIHRcIiwgdGV4dF86IFwiXCJcIlxuICAgICAgICAgICAgPERPQ1RZUEUgaHRtbD5cbiAgICAgICAgICAgIDxodG1sIGxhbmc9XCJlblwiPlxuICAgICAgICAgICAgPGhlYWQ+XG4gICAgICAgICAgICBfXzxtZXRhIGNoYXJzZXQ9XCJVVEYtOFwiIC8+XG4gICAgICAgICAgICBfXzx0aXRsZT5Eb2N1bWVudDwvdGl0bGU+XG4gICAgICAgICAgICA8L2hlYWQ+XG4gICAgICAgICAgICA8Ym9keT5cbiAgICAgICAgICAgIF9fPGRpdj5cbiAgICAgICAgICAgIF9fX188ZGl2PlxuICAgICAgICAgICAgX19fX19fPGRpdj48L2Rpdj5cbiAgICAgICAgICAgIF9fX188L2Rpdj5cbiAgICAgICAgICAgIF9fPC9kaXY+XG4gICAgICAgICAgICA8L2JvZHk+XG4gICAgICAgICAgICA8L2h0bWw+XFxuXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICBlbnN1cmUgXCIzIC5cIiwgdGV4dF86IFwiXCJcIlxuICAgICAgICAgICAgPERPQ1RZUEUgaHRtbD5cbiAgICAgICAgICAgIDxodG1sIGxhbmc9XCJlblwiPlxuICAgICAgICAgICAgPGhlYWQ+XG4gICAgICAgICAgICBfXzxtZXRhIGNoYXJzZXQ9XCJVVEYtOFwiIC8+XG4gICAgICAgICAgICBfXzx0aXRsZT5Eb2N1bWVudDwvdGl0bGU+XG4gICAgICAgICAgICA8L2hlYWQ+XG4gICAgICAgICAgICA8Ym9keT48L2JvZHk+XG4gICAgICAgICAgICA8L2h0bWw+XFxuXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICBlbnN1cmUgXCIuXCIsIHRleHRfOiBcIlwiXCJcbiAgICAgICAgICAgIDxET0NUWVBFIGh0bWw+XG4gICAgICAgICAgICA8aHRtbCBsYW5nPVwiZW5cIj48L2h0bWw+XFxuXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgZGVzY3JpYmUgXCJ0YWcncyBJTi10YWcvT2ZmLXRhZyByZWNvZ25pdGlvblwiLCAtPlxuICAgICAgICBkZXNjcmliZSBcIldoZW4gdGFnU3RhcnQncyByb3cgY29udGFpbnMgTk8gTk9OLXdoaXRlc3BhZWNlIHRpbGwgdGFnU3RhcnRcIiwgLT5cbiAgICAgICAgICBpdCBcIlttdWx0aS1saW5lXSBzZWxlY3QgZm9yd2FyZGluZyB0YWdcIiwgLT5cbiAgICAgICAgICAgIHNldCB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICAgIDxzcGFuPlxuICAgICAgICAgICAgICAgIHwgIDxzcGFuPmlubmVyPC9zcGFuPlxuICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgZW5zdXJlIFwiZCBpIHRcIiwgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICAgIDxzcGFuPlxuICAgICAgICAgICAgICAgICAgPHNwYW4+PC9zcGFuPlxuICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGRlc2NyaWJlIFwiV2hlbiB0YWdTdGFydCdzIHJvdyBjb250YWlucyBTT01FIE5PTi13aGl0ZXNwYWVjZSB0aWxsIHRhZ1N0YXJ0XCIsIC0+XG4gICAgICAgICAgaXQgXCJbbXVsdGktbGluZV0gc2VsZWN0IGVuY2xvc2luZyB0YWdcIiwgLT5cbiAgICAgICAgICAgIHNldCB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICA8c3Bhbj5cbiAgICAgICAgICAgIGhlbGxvIHwgPHNwYW4+aW5uZXI8L3NwYW4+XG4gICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgIGVuc3VyZSBcImQgaSB0XCIsIHRleHQ6IFwiPHNwYW4+PC9zcGFuPlwiXG5cbiAgICAgICAgICBpdCBcIltvbmUtbGluZS0xXSBzZWxlY3QgZW5jbG9zaW5nIHRhZ1wiLCAtPlxuICAgICAgICAgICAgc2V0IHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAgICAgPHNwYW4+IHwgPHNwYW4+aW5uZXI8L3NwYW4+PC9zcGFuPlxuICAgICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICAgICAgZW5zdXJlIFwiZCBpIHRcIiwgdGV4dDogXCI8c3Bhbj48L3NwYW4+XCJcblxuICAgICAgICAgIGl0IFwiW29uZS1saW5lLTJdIHNlbGVjdCBlbmNsb3NpbmcgdGFnXCIsIC0+XG4gICAgICAgICAgICBzZXQgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgICA8c3Bhbj5ofGVsbG88c3Bhbj5pbm5lcjwvc3Bhbj48L3NwYW4+XG4gICAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgICAgICBlbnN1cmUgXCJkIGkgdFwiLCB0ZXh0OiBcIjxzcGFuPjwvc3Bhbj5cIlxuXG4gICAgZGVzY3JpYmUgXCJhLXRhZ1wiLCAtPlxuICAgICAgZGVzY3JpYmUgXCJwcmVjaXNlbHkgc2VsZWN0IGFcIiwgLT5cbiAgICAgICAgY2hlY2sgPSBnZXRDaGVja0Z1bmN0aW9uRm9yKCdhIHQnKVxuICAgICAgICB0ZXh0ID0gXCJcIlwiXG4gICAgICAgICAgPGFiYz5cbiAgICAgICAgICAgIDx0aXRsZT5USVRMRTwvdGl0bGU+XG4gICAgICAgICAgPC9hYmM+XG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgIHNlbGVjdGVkVGV4dCA9IFwiPHRpdGxlPlRJVExFPC90aXRsZT5cIlxuICAgICAgICBhQUJDID0gdGV4dFxuICAgICAgICB0ZXh0QWZ0ZXJEZWxldGVkID0gXCJcIlwiXG4gICAgICAgICAgPGFiYz5cbiAgICAgICAgICBfX1xuICAgICAgICAgIDwvYWJjPlxuICAgICAgICAgIFwiXCJcIi5yZXBsYWNlKC9fL2csICcgJylcblxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgc2V0IHt0ZXh0fVxuXG4gICAgICAgICMgU2VsZWN0XG4gICAgICAgIGl0IFwiWzFdIGZvcndhcmRpbmdcIiwgLT4gY2hlY2sgWzEsIDBdLCAndicsIHtzZWxlY3RlZFRleHR9XG4gICAgICAgIGl0IFwiWzJdIG9wZW5UYWcgbGVmdG1vc3RcIiwgLT4gY2hlY2sgWzEsIDJdLCAndicsIHtzZWxlY3RlZFRleHR9XG4gICAgICAgIGl0IFwiWzNdIG9wZW5UYWcgcmlnaHRtb3N0XCIsIC0+IGNoZWNrIFsxLCA4XSwgJ3YnLCB7c2VsZWN0ZWRUZXh0fVxuICAgICAgICBpdCBcIls0XSBJbm5lciB0ZXh0XCIsIC0+IGNoZWNrIFsxLCAxMF0sICd2Jywge3NlbGVjdGVkVGV4dH1cbiAgICAgICAgaXQgXCJbNV0gY2xvc2VUYWcgbGVmdG1vc3RcIiwgLT4gY2hlY2sgWzEsIDE0XSwgJ3YnLCB7c2VsZWN0ZWRUZXh0fVxuICAgICAgICBpdCBcIls2XSBjbG9zZVRhZyByaWdodG1vc3RcIiwgLT4gY2hlY2sgWzEsIDIxXSwgJ3YnLCB7c2VsZWN0ZWRUZXh0fVxuICAgICAgICBpdCBcIls3XSByaWdodCBvZiBjbG9zZVRhZ1wiLCAtPiBjaGVjayBbMiwgMF0sICd2Jywge3NlbGVjdGVkVGV4dDogYUFCQ31cblxuICAgICAgICAjIERlbGV0ZVxuICAgICAgICBpdCBcIls4XSBmb3J3YXJkaW5nXCIsIC0+IGNoZWNrIFsxLCAwXSwgJ2QnLCB7dGV4dDogdGV4dEFmdGVyRGVsZXRlZH1cbiAgICAgICAgaXQgXCJbOV0gb3BlblRhZyBsZWZ0bW9zdFwiLCAtPiBjaGVjayBbMSwgMl0sICdkJywge3RleHQ6IHRleHRBZnRlckRlbGV0ZWR9XG4gICAgICAgIGl0IFwiWzEwXSBvcGVuVGFnIHJpZ2h0bW9zdFwiLCAtPiBjaGVjayBbMSwgOF0sICdkJywge3RleHQ6IHRleHRBZnRlckRlbGV0ZWR9XG4gICAgICAgIGl0IFwiWzExXSBJbm5lciB0ZXh0XCIsIC0+IGNoZWNrIFsxLCAxMF0sICdkJywge3RleHQ6IHRleHRBZnRlckRlbGV0ZWR9XG4gICAgICAgIGl0IFwiWzEyXSBjbG9zZVRhZyBsZWZ0bW9zdFwiLCAtPiBjaGVjayBbMSwgMTRdLCAnZCcsIHt0ZXh0OiB0ZXh0QWZ0ZXJEZWxldGVkfVxuICAgICAgICBpdCBcIlsxM10gY2xvc2VUYWcgcmlnaHRtb3N0XCIsIC0+IGNoZWNrIFsxLCAyMV0sICdkJywge3RleHQ6IHRleHRBZnRlckRlbGV0ZWR9XG4gICAgICAgIGl0IFwiWzE0XSByaWdodCBvZiBjbG9zZVRhZ1wiLCAtPiBjaGVjayBbMiwgMF0sICdkJywge3RleHQ6IFwiXCJ9XG5cbiAgZGVzY3JpYmUgXCJTcXVhcmVCcmFja2V0XCIsIC0+XG4gICAgZGVzY3JpYmUgXCJpbm5lci1zcXVhcmUtYnJhY2tldFwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0OiBcIlsgc29tZXRoaW5nIGluIGhlcmUgYW5kIGluIFtoZXJlXSBdXCJcbiAgICAgICAgICBjdXJzb3I6IFswLCA5XVxuXG4gICAgICBpdCBcImFwcGxpZXMgb3BlcmF0b3JzIGluc2lkZSB0aGUgY3VycmVudCB3b3JkIGluIG9wZXJhdG9yLXBlbmRpbmcgbW9kZVwiLCAtPlxuICAgICAgICBlbnN1cmUgJ2QgaSBbJyxcbiAgICAgICAgICB0ZXh0OiBcIltdXCJcbiAgICAgICAgICBjdXJzb3I6IFswLCAxXVxuXG4gICAgICBpdCBcImFwcGxpZXMgb3BlcmF0b3JzIGluc2lkZSB0aGUgY3VycmVudCB3b3JkIGluIG9wZXJhdG9yLXBlbmRpbmcgbW9kZSAoc2Vjb25kIHRlc3QpXCIsIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIGN1cnNvcjogWzAsIDI5XVxuICAgICAgICBlbnN1cmUgJ2QgaSBbJyxcbiAgICAgICAgICB0ZXh0OiBcIlsgc29tZXRoaW5nIGluIGhlcmUgYW5kIGluIFtdIF1cIlxuICAgICAgICAgIGN1cnNvcjogWzAsIDI4XVxuICAgIGRlc2NyaWJlIFwiYS1zcXVhcmUtYnJhY2tldFwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0OiBcIlsgc29tZXRoaW5nIGluIGhlcmUgYW5kIGluIFtoZXJlXSBdXCJcbiAgICAgICAgICBjdXJzb3I6IFswLCA5XVxuXG4gICAgICBpdCBcImFwcGxpZXMgb3BlcmF0b3JzIGFyb3VuZCB0aGUgY3VycmVudCBzcXVhcmUgYnJhY2tldHMgaW4gb3BlcmF0b3ItcGVuZGluZyBtb2RlXCIsIC0+XG4gICAgICAgIGVuc3VyZSAnZCBhIFsnLFxuICAgICAgICAgIHRleHQ6ICcnXG4gICAgICAgICAgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgICBtb2RlOiAnbm9ybWFsJ1xuXG4gICAgICBpdCBcImFwcGxpZXMgb3BlcmF0b3JzIGFyb3VuZCB0aGUgY3VycmVudCBzcXVhcmUgYnJhY2tldHMgaW4gb3BlcmF0b3ItcGVuZGluZyBtb2RlIChzZWNvbmQgdGVzdClcIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzAsIDI5XVxuICAgICAgICBlbnN1cmUgJ2QgYSBbJyxcbiAgICAgICAgICB0ZXh0OiBcIlsgc29tZXRoaW5nIGluIGhlcmUgYW5kIGluICBdXCJcbiAgICAgICAgICBjdXJzb3I6IFswLCAyN11cbiAgICAgICAgICBtb2RlOiAnbm9ybWFsJ1xuICAgICAgZGVzY3JpYmUgXCJjdXJzb3IgaXMgb24gdGhlIHBhaXIgY2hhclwiLCAtPlxuICAgICAgICBjaGVjayA9IGdldENoZWNrRnVuY3Rpb25Gb3IoJ2kgWycpXG4gICAgICAgIHRleHQgPSAnLVsrXS0nXG4gICAgICAgIHRleHRGaW5hbCA9ICctW10tJ1xuICAgICAgICBzZWxlY3RlZFRleHQgPSAnKydcbiAgICAgICAgb3BlbiA9IFswLCAxXVxuICAgICAgICBjbG9zZSA9IFswLCAzXVxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgc2V0IHt0ZXh0fVxuICAgICAgICBpdCBcImNhc2UtMSBub3JtYWxcIiwgLT4gY2hlY2sgb3BlbiwgJ2QnLCB0ZXh0OiB0ZXh0RmluYWwsIGN1cnNvcjogWzAsIDJdXG4gICAgICAgIGl0IFwiY2FzZS0yIG5vcm1hbFwiLCAtPiBjaGVjayBjbG9zZSwgJ2QnLCB0ZXh0OiB0ZXh0RmluYWwsIGN1cnNvcjogWzAsIDJdXG4gICAgICAgIGl0IFwiY2FzZS0zIHZpc3VhbFwiLCAtPiBjaGVjayBvcGVuLCAndicsIHtzZWxlY3RlZFRleHR9XG4gICAgICAgIGl0IFwiY2FzZS00IHZpc3VhbFwiLCAtPiBjaGVjayBjbG9zZSwgJ3YnLCB7c2VsZWN0ZWRUZXh0fVxuICAgICAgZGVzY3JpYmUgXCJjdXJzb3IgaXMgb24gdGhlIHBhaXIgY2hhclwiLCAtPlxuICAgICAgICBjaGVjayA9IGdldENoZWNrRnVuY3Rpb25Gb3IoJ2EgWycpXG4gICAgICAgIHRleHQgPSAnLVsrXS0nXG4gICAgICAgIHRleHRGaW5hbCA9ICctLSdcbiAgICAgICAgc2VsZWN0ZWRUZXh0ID0gJ1srXSdcbiAgICAgICAgb3BlbiA9IFswLCAxXVxuICAgICAgICBjbG9zZSA9IFswLCAzXVxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgc2V0IHt0ZXh0fVxuICAgICAgICBpdCBcImNhc2UtMSBub3JtYWxcIiwgLT4gY2hlY2sgb3BlbiwgJ2QnLCB0ZXh0OiB0ZXh0RmluYWwsIGN1cnNvcjogWzAsIDFdXG4gICAgICAgIGl0IFwiY2FzZS0yIG5vcm1hbFwiLCAtPiBjaGVjayBjbG9zZSwgJ2QnLCB0ZXh0OiB0ZXh0RmluYWwsIGN1cnNvcjogWzAsIDFdXG4gICAgICAgIGl0IFwiY2FzZS0zIHZpc3VhbFwiLCAtPiBjaGVjayBvcGVuLCAndicsIHtzZWxlY3RlZFRleHR9XG4gICAgICAgIGl0IFwiY2FzZS00IHZpc3VhbFwiLCAtPiBjaGVjayBjbG9zZSwgJ3YnLCB7c2VsZWN0ZWRUZXh0fVxuICBkZXNjcmliZSBcIlBhcmVudGhlc2lzXCIsIC0+XG4gICAgZGVzY3JpYmUgXCJpbm5lci1wYXJlbnRoZXNpc1wiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0OiBcIiggc29tZXRoaW5nIGluIGhlcmUgYW5kIGluIChoZXJlKSApXCJcbiAgICAgICAgICBjdXJzb3I6IFswLCA5XVxuXG4gICAgICBpdCBcImFwcGxpZXMgb3BlcmF0b3JzIGluc2lkZSB0aGUgY3VycmVudCB3b3JkIGluIG9wZXJhdG9yLXBlbmRpbmcgbW9kZVwiLCAtPlxuICAgICAgICBlbnN1cmUgJ2QgaSAoJyxcbiAgICAgICAgICB0ZXh0OiBcIigpXCJcbiAgICAgICAgICBjdXJzb3I6IFswLCAxXVxuXG4gICAgICBpdCBcImFwcGxpZXMgb3BlcmF0b3JzIGluc2lkZSB0aGUgY3VycmVudCB3b3JkIGluIG9wZXJhdG9yLXBlbmRpbmcgbW9kZSAoc2Vjb25kIHRlc3QpXCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFswLCAyOV1cbiAgICAgICAgZW5zdXJlICdkIGkgKCcsXG4gICAgICAgICAgdGV4dDogXCIoIHNvbWV0aGluZyBpbiBoZXJlIGFuZCBpbiAoKSApXCJcbiAgICAgICAgICBjdXJzb3I6IFswLCAyOF1cblxuICAgICAgaXQgXCJzZWxlY3QgaW5uZXIgKCkgYnkgc2tpcHBpbmcgbmVzdGluZyBwYWlyXCIsIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHQ6ICdleHBlY3QoZWRpdG9yLmdldFNjcm9sbFRvcCgpKSdcbiAgICAgICAgICBjdXJzb3I6IFswLCA3XVxuICAgICAgICBlbnN1cmUgJ3YgaSAoJywgc2VsZWN0ZWRUZXh0OiAnZWRpdG9yLmdldFNjcm9sbFRvcCgpJ1xuXG4gICAgICBpdCBcInNraXAgZXNjYXBlZCBwYWlyIGNhc2UtMVwiLCAtPlxuICAgICAgICBzZXQgdGV4dDogJ2V4cGVjdChlZGl0b3IuZ1xcXFwoZXRTY3JvbGxUcCgpKScsIGN1cnNvcjogWzAsIDIwXVxuICAgICAgICBlbnN1cmUgJ3YgaSAoJywgc2VsZWN0ZWRUZXh0OiAnZWRpdG9yLmdcXFxcKGV0U2Nyb2xsVHAoKSdcblxuICAgICAgaXQgXCJkb250IHNraXAgbGl0ZXJhbCBiYWNrc2xhc2hcIiwgLT5cbiAgICAgICAgc2V0IHRleHQ6ICdleHBlY3QoZWRpdG9yLmdcXFxcXFxcXChldFNjcm9sbFRwKCkpJywgY3Vyc29yOiBbMCwgMjBdXG4gICAgICAgIGVuc3VyZSAndiBpICgnLCBzZWxlY3RlZFRleHQ6ICdldFNjcm9sbFRwKCknXG5cbiAgICAgIGl0IFwic2tpcCBlc2NhcGVkIHBhaXIgY2FzZS0yXCIsIC0+XG4gICAgICAgIHNldCB0ZXh0OiAnZXhwZWN0KGVkaXRvci5nZXRTY1xcXFwpcm9sbFRwKCkpJywgY3Vyc29yOiBbMCwgN11cbiAgICAgICAgZW5zdXJlICd2IGkgKCcsIHNlbGVjdGVkVGV4dDogJ2VkaXRvci5nZXRTY1xcXFwpcm9sbFRwKCknXG5cbiAgICAgIGl0IFwic2tpcCBlc2NhcGVkIHBhaXIgY2FzZS0zXCIsIC0+XG4gICAgICAgIHNldCB0ZXh0OiAnZXhwZWN0KGVkaXRvci5nZVxcXFwodFNjXFxcXClyb2xsVHAoKSknLCBjdXJzb3I6IFswLCA3XVxuICAgICAgICBlbnN1cmUgJ3YgaSAoJywgc2VsZWN0ZWRUZXh0OiAnZWRpdG9yLmdlXFxcXCh0U2NcXFxcKXJvbGxUcCgpJ1xuXG4gICAgICBpdCBcIndvcmtzIHdpdGggbXVsdGlwbGUgY3Vyc29yc1wiLCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0OiBcIiggYSBiICkgY2RlICggZiBnIGggKSBpamtcIlxuICAgICAgICAgIGN1cnNvcjogW1swLCAyXSwgWzAsIDE4XV1cbiAgICAgICAgZW5zdXJlICd2IGkgKCcsXG4gICAgICAgICAgc2VsZWN0ZWRCdWZmZXJSYW5nZTogW1xuICAgICAgICAgICAgW1swLCAxXSwgIFswLCA2XV1cbiAgICAgICAgICAgIFtbMCwgMTNdLCBbMCwgMjBdXVxuICAgICAgICAgIF1cbiAgICAgIGRlc2NyaWJlIFwiY3Vyc29yIGlzIG9uIHRoZSBwYWlyIGNoYXJcIiwgLT5cbiAgICAgICAgY2hlY2sgPSBnZXRDaGVja0Z1bmN0aW9uRm9yKCdpICgnKVxuICAgICAgICB0ZXh0ID0gJy0oKyktJ1xuICAgICAgICB0ZXh0RmluYWwgPSAnLSgpLSdcbiAgICAgICAgc2VsZWN0ZWRUZXh0ID0gJysnXG4gICAgICAgIG9wZW4gPSBbMCwgMV1cbiAgICAgICAgY2xvc2UgPSBbMCwgM11cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIHNldCB7dGV4dH1cbiAgICAgICAgaXQgXCJjYXNlLTEgbm9ybWFsXCIsIC0+IGNoZWNrIG9wZW4sICdkJywgdGV4dDogdGV4dEZpbmFsLCBjdXJzb3I6IFswLCAyXVxuICAgICAgICBpdCBcImNhc2UtMiBub3JtYWxcIiwgLT4gY2hlY2sgY2xvc2UsICdkJywgdGV4dDogdGV4dEZpbmFsLCBjdXJzb3I6IFswLCAyXVxuICAgICAgICBpdCBcImNhc2UtMyB2aXN1YWxcIiwgLT4gY2hlY2sgb3BlbiwgJ3YnLCB7c2VsZWN0ZWRUZXh0fVxuICAgICAgICBpdCBcImNhc2UtNCB2aXN1YWxcIiwgLT4gY2hlY2sgY2xvc2UsICd2Jywge3NlbGVjdGVkVGV4dH1cblxuICAgIGRlc2NyaWJlIFwiYS1wYXJlbnRoZXNpc1wiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0OiBcIiggc29tZXRoaW5nIGluIGhlcmUgYW5kIGluIChoZXJlKSApXCJcbiAgICAgICAgICBjdXJzb3I6IFswLCA5XVxuXG4gICAgICBpdCBcImFwcGxpZXMgb3BlcmF0b3JzIGFyb3VuZCB0aGUgY3VycmVudCBwYXJlbnRoZXNlcyBpbiBvcGVyYXRvci1wZW5kaW5nIG1vZGVcIiwgLT5cbiAgICAgICAgZW5zdXJlICdkIGEgKCcsXG4gICAgICAgICAgdGV4dDogJydcbiAgICAgICAgICBjdXJzb3I6IFswLCAwXVxuICAgICAgICAgIG1vZGU6ICdub3JtYWwnXG5cbiAgICAgIGl0IFwiYXBwbGllcyBvcGVyYXRvcnMgYXJvdW5kIHRoZSBjdXJyZW50IHBhcmVudGhlc2VzIGluIG9wZXJhdG9yLXBlbmRpbmcgbW9kZSAoc2Vjb25kIHRlc3QpXCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFswLCAyOV1cbiAgICAgICAgZW5zdXJlICdkIGEgKCcsXG4gICAgICAgICAgdGV4dDogXCIoIHNvbWV0aGluZyBpbiBoZXJlIGFuZCBpbiAgKVwiXG4gICAgICAgICAgY3Vyc29yOiBbMCwgMjddXG4gICAgICBkZXNjcmliZSBcImN1cnNvciBpcyBvbiB0aGUgcGFpciBjaGFyXCIsIC0+XG4gICAgICAgIGNoZWNrID0gZ2V0Q2hlY2tGdW5jdGlvbkZvcignYSAoJylcbiAgICAgICAgdGV4dCA9ICctKCspLSdcbiAgICAgICAgdGV4dEZpbmFsID0gJy0tJ1xuICAgICAgICBzZWxlY3RlZFRleHQgPSAnKCspJ1xuICAgICAgICBvcGVuID0gWzAsIDFdXG4gICAgICAgIGNsb3NlID0gWzAsIDNdXG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBzZXQge3RleHR9XG4gICAgICAgIGl0IFwiY2FzZS0xIG5vcm1hbFwiLCAtPiBjaGVjayBvcGVuLCAnZCcsIHRleHQ6IHRleHRGaW5hbCwgY3Vyc29yOiBbMCwgMV1cbiAgICAgICAgaXQgXCJjYXNlLTIgbm9ybWFsXCIsIC0+IGNoZWNrIGNsb3NlLCAnZCcsIHRleHQ6IHRleHRGaW5hbCwgY3Vyc29yOiBbMCwgMV1cbiAgICAgICAgaXQgXCJjYXNlLTMgdmlzdWFsXCIsIC0+IGNoZWNrIG9wZW4sICd2Jywge3NlbGVjdGVkVGV4dH1cbiAgICAgICAgaXQgXCJjYXNlLTQgdmlzdWFsXCIsIC0+IGNoZWNrIGNsb3NlLCAndicsIHtzZWxlY3RlZFRleHR9XG5cbiAgZGVzY3JpYmUgXCJQYXJhZ3JhcGhcIiwgLT5cbiAgICB0ZXh0ID0gbnVsbFxuICAgIGVuc3VyZVBhcmFncmFwaCA9IChrZXlzdHJva2UsIG9wdGlvbnMpIC0+XG4gICAgICB1bmxlc3Mgb3B0aW9ucy5zZXRDdXJzb3JcbiAgICAgICAgdGhyb3cgbmV3IEVycm93KFwibm8gc2V0Q3Vyc29yIHByb3ZpZGVkXCIpXG4gICAgICBzZXQgY3Vyc29yOiBvcHRpb25zLnNldEN1cnNvclxuICAgICAgZGVsZXRlIG9wdGlvbnMuc2V0Q3Vyc29yXG4gICAgICBlbnN1cmUoa2V5c3Ryb2tlLCBvcHRpb25zKVxuICAgICAgZW5zdXJlKCdlc2NhcGUnLCBtb2RlOiAnbm9ybWFsJylcblxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHRleHQgPSBuZXcgVGV4dERhdGEgXCJcIlwiXG5cbiAgICAgICAgMTogUC0xXG5cbiAgICAgICAgMzogUC0yXG4gICAgICAgIDQ6IFAtMlxuXG5cbiAgICAgICAgNzogUC0zXG4gICAgICAgIDg6IFAtM1xuICAgICAgICA5OiBQLTNcblxuXG4gICAgICAgIFwiXCJcIlxuICAgICAgc2V0XG4gICAgICAgIGN1cnNvcjogWzEsIDBdXG4gICAgICAgIHRleHQ6IHRleHQuZ2V0UmF3KClcblxuICAgIGRlc2NyaWJlIFwiaW5uZXItcGFyYWdyYXBoXCIsIC0+XG4gICAgICBpdCBcInNlbGVjdCBjb25zZXF1dGl2ZSBibGFuayByb3dzXCIsIC0+XG4gICAgICAgIGVuc3VyZVBhcmFncmFwaCAndiBpIHAnLCBzZXRDdXJzb3I6IFswLCAwXSwgc2VsZWN0ZWRUZXh0OiB0ZXh0LmdldExpbmVzKFswXSlcbiAgICAgICAgZW5zdXJlUGFyYWdyYXBoICd2IGkgcCcsIHNldEN1cnNvcjogWzIsIDBdLCBzZWxlY3RlZFRleHQ6IHRleHQuZ2V0TGluZXMoWzJdKVxuICAgICAgICBlbnN1cmVQYXJhZ3JhcGggJ3YgaSBwJywgc2V0Q3Vyc29yOiBbNSwgMF0sIHNlbGVjdGVkVGV4dDogdGV4dC5nZXRMaW5lcyhbNS4uNl0pXG4gICAgICBpdCBcInNlbGVjdCBjb25zZXF1dGl2ZSBub24tYmxhbmsgcm93c1wiLCAtPlxuICAgICAgICBlbnN1cmVQYXJhZ3JhcGggJ3YgaSBwJywgc2V0Q3Vyc29yOiBbMSwgMF0sIHNlbGVjdGVkVGV4dDogdGV4dC5nZXRMaW5lcyhbMV0pXG4gICAgICAgIGVuc3VyZVBhcmFncmFwaCAndiBpIHAnLCBzZXRDdXJzb3I6IFszLCAwXSwgc2VsZWN0ZWRUZXh0OiB0ZXh0LmdldExpbmVzKFszLi40XSlcbiAgICAgICAgZW5zdXJlUGFyYWdyYXBoICd2IGkgcCcsIHNldEN1cnNvcjogWzcsIDBdLCBzZWxlY3RlZFRleHQ6IHRleHQuZ2V0TGluZXMoWzcuLjldKVxuICAgICAgaXQgXCJvcGVyYXRlIG9uIGlubmVyIHBhcmFncmFwaFwiLCAtPlxuICAgICAgICBlbnN1cmVQYXJhZ3JhcGggJ3kgaSBwJywgc2V0Q3Vyc29yOiBbNywgMF0sIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiB0ZXh0LmdldExpbmVzKFs3LCA4LCA5XSlcblxuICAgIGRlc2NyaWJlIFwiYS1wYXJhZ3JhcGhcIiwgLT5cbiAgICAgIGl0IFwic2VsZWN0IHR3byBwYXJhZ3JhcGggYXMgb25lIG9wZXJhdGlvblwiLCAtPlxuICAgICAgICBlbnN1cmVQYXJhZ3JhcGggJ3YgYSBwJywgc2V0Q3Vyc29yOiBbMCwgMF0sIHNlbGVjdGVkVGV4dDogdGV4dC5nZXRMaW5lcyhbMCwgMV0pXG4gICAgICAgIGVuc3VyZVBhcmFncmFwaCAndiBhIHAnLCBzZXRDdXJzb3I6IFsyLCAwXSwgc2VsZWN0ZWRUZXh0OiB0ZXh0LmdldExpbmVzKFsyLi40XSlcbiAgICAgICAgZW5zdXJlUGFyYWdyYXBoICd2IGEgcCcsIHNldEN1cnNvcjogWzUsIDBdLCBzZWxlY3RlZFRleHQ6IHRleHQuZ2V0TGluZXMoWzUuLjldKVxuICAgICAgaXQgXCJzZWxlY3QgdHdvIHBhcmFncmFwaCBhcyBvbmUgb3BlcmF0aW9uXCIsIC0+XG4gICAgICAgIGVuc3VyZVBhcmFncmFwaCAndiBhIHAnLCBzZXRDdXJzb3I6IFsxLCAwXSwgc2VsZWN0ZWRUZXh0OiB0ZXh0LmdldExpbmVzKFsxLi4yXSlcbiAgICAgICAgZW5zdXJlUGFyYWdyYXBoICd2IGEgcCcsIHNldEN1cnNvcjogWzMsIDBdLCBzZWxlY3RlZFRleHQ6IHRleHQuZ2V0TGluZXMoWzMuLjZdKVxuICAgICAgICBlbnN1cmVQYXJhZ3JhcGggJ3YgYSBwJywgc2V0Q3Vyc29yOiBbNywgMF0sIHNlbGVjdGVkVGV4dDogdGV4dC5nZXRMaW5lcyhbNy4uMTBdKVxuICAgICAgaXQgXCJvcGVyYXRlIG9uIGEgcGFyYWdyYXBoXCIsIC0+XG4gICAgICAgIGVuc3VyZVBhcmFncmFwaCAneSBhIHAnLCBzZXRDdXJzb3I6IFszLCAwXSwgcmVnaXN0ZXI6ICdcIic6IHRleHQ6IHRleHQuZ2V0TGluZXMoWzMuLjZdKVxuXG4gIGRlc2NyaWJlICdDb21tZW50JywgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAgICAgYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoJ2xhbmd1YWdlLWNvZmZlZS1zY3JpcHQnKVxuICAgICAgcnVucyAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICBncmFtbWFyOiAnc291cmNlLmNvZmZlZSdcbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAjIyNcbiAgICAgICAgICBtdWx0aWxpbmUgY29tbWVudFxuICAgICAgICAgICMjI1xuXG4gICAgICAgICAgIyBPbmUgbGluZSBjb21tZW50XG5cbiAgICAgICAgICAjIENvbW1lbnRcbiAgICAgICAgICAjIGJvcmRlclxuICAgICAgICAgIGNsYXNzIFF1aWNrU29ydFxuICAgICAgICAgIFwiXCJcIlxuICAgIGFmdGVyRWFjaCAtPlxuICAgICAgYXRvbS5wYWNrYWdlcy5kZWFjdGl2YXRlUGFja2FnZSgnbGFuZ3VhZ2UtY29mZmVlLXNjcmlwdCcpXG5cbiAgICBkZXNjcmliZSAnaW5uZXItY29tbWVudCcsIC0+XG4gICAgICBpdCAnc2VsZWN0IGlubmVyIGNvbW1lbnQgYmxvY2snLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgZW5zdXJlICd2IGkgLycsXG4gICAgICAgICAgc2VsZWN0ZWRUZXh0OiAnIyMjXFxubXVsdGlsaW5lIGNvbW1lbnRcXG4jIyNcXG4nXG4gICAgICAgICAgc2VsZWN0ZWRCdWZmZXJSYW5nZTogW1swLCAwXSwgWzMsIDBdXVxuXG4gICAgICBpdCAnc2VsZWN0IG9uZSBsaW5lIGNvbW1lbnQnLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbNCwgMF1cbiAgICAgICAgZW5zdXJlICd2IGkgLycsXG4gICAgICAgICAgc2VsZWN0ZWRUZXh0OiAnIyBPbmUgbGluZSBjb21tZW50XFxuJ1xuICAgICAgICAgIHNlbGVjdGVkQnVmZmVyUmFuZ2U6IFtbNCwgMF0sIFs1LCAwXV1cblxuICAgICAgaXQgJ25vdCBzZWxlY3Qgbm9uLWNvbW1lbnQgbGluZScsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFs2LCAwXVxuICAgICAgICBlbnN1cmUgJ3YgaSAvJyxcbiAgICAgICAgICBzZWxlY3RlZFRleHQ6ICcjIENvbW1lbnRcXG4jIGJvcmRlclxcbidcbiAgICAgICAgICBzZWxlY3RlZEJ1ZmZlclJhbmdlOiBbWzYsIDBdLCBbOCwgMF1dXG5cbiAgZGVzY3JpYmUgJ0luZGVudGF0aW9uJywgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAgICAgYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoJ2xhbmd1YWdlLWNvZmZlZS1zY3JpcHQnKVxuICAgICAgZ2V0VmltU3RhdGUgJ3NhbXBsZS5jb2ZmZWUnLCAodmltU3RhdGUsIHZpbSkgLT5cbiAgICAgICAge2VkaXRvciwgZWRpdG9yRWxlbWVudH0gPSB2aW1TdGF0ZVxuICAgICAgICB7c2V0LCBlbnN1cmUsIGtleXN0cm9rZX0gPSB2aW1cbiAgICBhZnRlckVhY2ggLT5cbiAgICAgIGF0b20ucGFja2FnZXMuZGVhY3RpdmF0ZVBhY2thZ2UoJ2xhbmd1YWdlLWNvZmZlZS1zY3JpcHQnKVxuXG4gICAgZGVzY3JpYmUgJ2lubmVyLWluZGVudGF0aW9uJywgLT5cbiAgICAgIGl0ICdzZWxlY3QgbGluZXMgd2l0aCBkZWVwZXIgaW5kZW50LWxldmVsJywgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzEyLCAwXVxuICAgICAgICBlbnN1cmUgJ3YgaSBpJyxcbiAgICAgICAgICBzZWxlY3RlZEJ1ZmZlclJhbmdlOiBbWzEyLCAwXSwgWzE1LCAwXV1cbiAgICBkZXNjcmliZSAnYS1pbmRlbnRhdGlvbicsIC0+XG4gICAgICBpdCAnd29udCBzdG9wIG9uIGJsYW5rIGxpbmUgd2hlbiBzZWxlY3RpbmcgaW5kZW50JywgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzEyLCAwXVxuICAgICAgICBlbnN1cmUgJ3YgYSBpJyxcbiAgICAgICAgICBzZWxlY3RlZEJ1ZmZlclJhbmdlOiBbWzEwLCAwXSwgWzI3LCAwXV1cblxuICBkZXNjcmliZSAnRm9sZCcsIC0+XG4gICAgcmFuZ2VGb3JSb3dzID0gKHN0YXJ0Um93LCBlbmRSb3cpIC0+XG4gICAgICBbW3N0YXJ0Um93LCAwXSwgW2VuZFJvdyArIDEsIDBdXVxuXG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICAgIGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKCdsYW5ndWFnZS1jb2ZmZWUtc2NyaXB0JylcbiAgICAgIGdldFZpbVN0YXRlICdzYW1wbGUuY29mZmVlJywgKHZpbVN0YXRlLCB2aW0pIC0+XG4gICAgICAgIHtlZGl0b3IsIGVkaXRvckVsZW1lbnR9ID0gdmltU3RhdGVcbiAgICAgICAge3NldCwgZW5zdXJlLCBrZXlzdHJva2V9ID0gdmltXG4gICAgYWZ0ZXJFYWNoIC0+XG4gICAgICBhdG9tLnBhY2thZ2VzLmRlYWN0aXZhdGVQYWNrYWdlKCdsYW5ndWFnZS1jb2ZmZWUtc2NyaXB0JylcblxuICAgIGRlc2NyaWJlICdpbm5lci1mb2xkJywgLT5cbiAgICAgIGl0IFwic2VsZWN0IGlubmVyIHJhbmdlIG9mIGZvbGRcIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzEzLCAwXVxuICAgICAgICBlbnN1cmUgJ3YgaSB6Jywgc2VsZWN0ZWRCdWZmZXJSYW5nZTogcmFuZ2VGb3JSb3dzKDEwLCAyNSlcblxuICAgICAgaXQgXCJzZWxlY3QgaW5uZXIgcmFuZ2Ugb2YgZm9sZFwiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMTksIDBdXG4gICAgICAgIGVuc3VyZSAndiBpIHonLCBzZWxlY3RlZEJ1ZmZlclJhbmdlOiByYW5nZUZvclJvd3MoMTksIDIzKVxuXG4gICAgICBpdCBcImNhbiBleHBhbmQgc2VsZWN0aW9uXCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFsyMywgMF1cbiAgICAgICAga2V5c3Ryb2tlICd2J1xuICAgICAgICBlbnN1cmUgJ2kgeicsIHNlbGVjdGVkQnVmZmVyUmFuZ2U6IHJhbmdlRm9yUm93cygyMywgMjMpXG4gICAgICAgIGVuc3VyZSAnaSB6Jywgc2VsZWN0ZWRCdWZmZXJSYW5nZTogcmFuZ2VGb3JSb3dzKDE5LCAyMylcbiAgICAgICAgZW5zdXJlICdpIHonLCBzZWxlY3RlZEJ1ZmZlclJhbmdlOiByYW5nZUZvclJvd3MoMTAsIDI1KVxuICAgICAgICBlbnN1cmUgJ2kgeicsIHNlbGVjdGVkQnVmZmVyUmFuZ2U6IHJhbmdlRm9yUm93cyg5LCAyOClcblxuICAgICAgZGVzY3JpYmUgXCJ3aGVuIHN0YXJ0Um93IG9mIHNlbGVjdGlvbiBpcyBvbiBmb2xkIHN0YXJ0Um93XCIsIC0+XG4gICAgICAgIGl0ICdzZWxlY3QgaW5uZXIgZm9sZCcsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzIwLCA3XVxuICAgICAgICAgIGVuc3VyZSAndiBpIHonLCBzZWxlY3RlZEJ1ZmZlclJhbmdlOiByYW5nZUZvclJvd3MoMjEsIDIxKVxuXG4gICAgICBkZXNjcmliZSBcIndoZW4gY29udGFpbmluZyBmb2xkIGFyZSBub3QgZm91bmRcIiwgLT5cbiAgICAgICAgaXQgXCJkbyBub3RoaW5nXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzIwLCAwXVxuICAgICAgICAgIGVuc3VyZSAnViBHJywgc2VsZWN0ZWRCdWZmZXJSYW5nZTogcmFuZ2VGb3JSb3dzKDIwLCAzMClcbiAgICAgICAgICBlbnN1cmUgJ2kgeicsIHNlbGVjdGVkQnVmZmVyUmFuZ2U6IHJhbmdlRm9yUm93cygyMCwgMzApXG5cbiAgICAgIGRlc2NyaWJlIFwid2hlbiBpbmRlbnQgbGV2ZWwgb2YgZm9sZCBzdGFydFJvdyBhbmQgZW5kUm93IGlzIHNhbWVcIiwgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgICAgICAgYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoJ2xhbmd1YWdlLWphdmFzY3JpcHQnKVxuICAgICAgICAgIGdldFZpbVN0YXRlICdzYW1wbGUuanMnLCAoc3RhdGUsIHZpbUVkaXRvcikgLT5cbiAgICAgICAgICAgIHtlZGl0b3IsIGVkaXRvckVsZW1lbnR9ID0gc3RhdGVcbiAgICAgICAgICAgIHtzZXQsIGVuc3VyZSwga2V5c3Ryb2tlfSA9IHZpbUVkaXRvclxuICAgICAgICBhZnRlckVhY2ggLT5cbiAgICAgICAgICBhdG9tLnBhY2thZ2VzLmRlYWN0aXZhdGVQYWNrYWdlKCdsYW5ndWFnZS1qYXZhc2NyaXB0JylcblxuICAgICAgICBpdCBcImRvZXNuJ3Qgc2VsZWN0IGZvbGQgZW5kUm93XCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzUsIDBdXG4gICAgICAgICAgZW5zdXJlICd2IGkgeicsIHNlbGVjdGVkQnVmZmVyUmFuZ2U6IHJhbmdlRm9yUm93cyg1LCA2KVxuICAgICAgICAgIGVuc3VyZSAnYSB6Jywgc2VsZWN0ZWRCdWZmZXJSYW5nZTogcmFuZ2VGb3JSb3dzKDQsIDcpXG5cbiAgICBkZXNjcmliZSAnYS1mb2xkJywgLT5cbiAgICAgIGl0ICdzZWxlY3QgZm9sZCByb3cgcmFuZ2UnLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMTMsIDBdXG4gICAgICAgIGVuc3VyZSAndiBhIHonLCBzZWxlY3RlZEJ1ZmZlclJhbmdlOiByYW5nZUZvclJvd3MoOSwgMjUpXG5cbiAgICAgIGl0ICdzZWxlY3QgZm9sZCByb3cgcmFuZ2UnLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMTksIDBdXG4gICAgICAgIGVuc3VyZSAndiBhIHonLCBzZWxlY3RlZEJ1ZmZlclJhbmdlOiByYW5nZUZvclJvd3MoMTgsIDIzKVxuXG4gICAgICBpdCAnY2FuIGV4cGFuZCBzZWxlY3Rpb24nLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMjMsIDBdXG4gICAgICAgIGtleXN0cm9rZSAndidcbiAgICAgICAgZW5zdXJlICdhIHonLCBzZWxlY3RlZEJ1ZmZlclJhbmdlOiByYW5nZUZvclJvd3MoMjIsIDIzKVxuICAgICAgICBlbnN1cmUgJ2EgeicsIHNlbGVjdGVkQnVmZmVyUmFuZ2U6IHJhbmdlRm9yUm93cygxOCwgMjMpXG4gICAgICAgIGVuc3VyZSAnYSB6Jywgc2VsZWN0ZWRCdWZmZXJSYW5nZTogcmFuZ2VGb3JSb3dzKDksIDI1KVxuICAgICAgICBlbnN1cmUgJ2EgeicsIHNlbGVjdGVkQnVmZmVyUmFuZ2U6IHJhbmdlRm9yUm93cyg4LCAyOClcblxuICAgICAgZGVzY3JpYmUgXCJ3aGVuIHN0YXJ0Um93IG9mIHNlbGVjdGlvbiBpcyBvbiBmb2xkIHN0YXJ0Um93XCIsIC0+XG4gICAgICAgIGl0ICdzZWxlY3QgZm9sZCBzdGFydGluZyBmcm9tIGN1cnJlbnQgcm93JywgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMjAsIDddXG4gICAgICAgICAgZW5zdXJlICd2IGEgeicsIHNlbGVjdGVkQnVmZmVyUmFuZ2U6IHJhbmdlRm9yUm93cygyMCwgMjEpXG5cbiAgICAgIGRlc2NyaWJlIFwid2hlbiBjb250YWluaW5nIGZvbGQgYXJlIG5vdCBmb3VuZFwiLCAtPlxuICAgICAgICBpdCBcImRvIG5vdGhpbmdcIiwgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMjAsIDBdXG4gICAgICAgICAgZW5zdXJlICdWIEcnLCBzZWxlY3RlZEJ1ZmZlclJhbmdlOiByYW5nZUZvclJvd3MoMjAsIDMwKVxuICAgICAgICAgIGVuc3VyZSAnYSB6Jywgc2VsZWN0ZWRCdWZmZXJSYW5nZTogcmFuZ2VGb3JSb3dzKDIwLCAzMClcblxuICAjIEFsdGhvdWdoIGZvbGxvd2luZyB0ZXN0IHBpY2tzIHNwZWNpZmljIGxhbmd1YWdlLCBvdGhlciBsYW5nYXVhZ2VzIGFyZSBhbHNvZSBzdXBwb3J0ZWQuXG4gIGRlc2NyaWJlICdGdW5jdGlvbicsIC0+XG4gICAgZGVzY3JpYmUgJ2NvZmZlZScsIC0+XG4gICAgICBwYWNrID0gJ2xhbmd1YWdlLWNvZmZlZS1zY3JpcHQnXG4gICAgICBzY29wZSA9ICdzb3VyY2UuY29mZmVlJ1xuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAgICAgICBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZShwYWNrKVxuXG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgIyBDb21tbWVudFxuXG4gICAgICAgICAgICBoZWxsbyA9IC0+XG4gICAgICAgICAgICAgIGEgPSAxXG4gICAgICAgICAgICAgIGIgPSAyXG4gICAgICAgICAgICAgIGMgPSAzXG5cbiAgICAgICAgICAgICMgQ29tbW1lbnRcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIGN1cnNvcjogWzMsIDBdXG5cbiAgICAgICAgcnVucyAtPlxuICAgICAgICAgIGdyYW1tYXIgPSBhdG9tLmdyYW1tYXJzLmdyYW1tYXJGb3JTY29wZU5hbWUoc2NvcGUpXG4gICAgICAgICAgZWRpdG9yLnNldEdyYW1tYXIoZ3JhbW1hcilcbiAgICAgIGFmdGVyRWFjaCAtPlxuICAgICAgICBhdG9tLnBhY2thZ2VzLmRlYWN0aXZhdGVQYWNrYWdlKHBhY2spXG5cbiAgICAgIGRlc2NyaWJlICdpbm5lci1mdW5jdGlvbiBmb3IgY29mZmVlJywgLT5cbiAgICAgICAgaXQgJ3NlbGVjdCBleGNlcHQgc3RhcnQgcm93JywgLT5cbiAgICAgICAgICBlbnN1cmUgJ3YgaSBmJywgc2VsZWN0ZWRCdWZmZXJSYW5nZTogW1szLCAwXSwgWzYsIDBdXVxuXG4gICAgICBkZXNjcmliZSAnYS1mdW5jdGlvbiBmb3IgY29mZmVlJywgLT5cbiAgICAgICAgaXQgJ3NlbGVjdCBmdW5jdGlvbicsIC0+XG4gICAgICAgICAgZW5zdXJlICd2IGEgZicsIHNlbGVjdGVkQnVmZmVyUmFuZ2U6IFtbMiwgMF0sIFs2LCAwXV1cblxuICAgIGRlc2NyaWJlICdydWJ5JywgLT5cbiAgICAgIHBhY2sgPSAnbGFuZ3VhZ2UtcnVieSdcbiAgICAgIHNjb3BlID0gJ3NvdXJjZS5ydWJ5J1xuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAgICAgICBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZShwYWNrKVxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgICMgQ29tbW1lbnRcblxuICAgICAgICAgICAgZGVmIGhlbGxvXG4gICAgICAgICAgICAgIGEgPSAxXG4gICAgICAgICAgICAgIGIgPSAyXG4gICAgICAgICAgICAgIGMgPSAzXG4gICAgICAgICAgICBlbmRcblxuICAgICAgICAgICAgIyBDb21tbWVudFxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgY3Vyc29yOiBbMywgMF1cbiAgICAgICAgcnVucyAtPlxuICAgICAgICAgIGdyYW1tYXIgPSBhdG9tLmdyYW1tYXJzLmdyYW1tYXJGb3JTY29wZU5hbWUoc2NvcGUpXG4gICAgICAgICAgZWRpdG9yLnNldEdyYW1tYXIoZ3JhbW1hcilcbiAgICAgIGFmdGVyRWFjaCAtPlxuICAgICAgICBhdG9tLnBhY2thZ2VzLmRlYWN0aXZhdGVQYWNrYWdlKHBhY2spXG5cbiAgICAgIGRlc2NyaWJlICdpbm5lci1mdW5jdGlvbiBmb3IgcnVieScsIC0+XG4gICAgICAgIGl0ICdzZWxlY3QgZXhjZXB0IHN0YXJ0IHJvdycsIC0+XG4gICAgICAgICAgZW5zdXJlICd2IGkgZicsIHNlbGVjdGVkQnVmZmVyUmFuZ2U6IFtbMywgMF0sIFs2LCAwXV1cbiAgICAgIGRlc2NyaWJlICdhLWZ1bmN0aW9uIGZvciBydWJ5JywgLT5cbiAgICAgICAgaXQgJ3NlbGVjdCBmdW5jdGlvbicsIC0+XG4gICAgICAgICAgZW5zdXJlICd2IGEgZicsIHNlbGVjdGVkQnVmZmVyUmFuZ2U6IFtbMiwgMF0sIFs3LCAwXV1cblxuICAgIGRlc2NyaWJlICdnbycsIC0+XG4gICAgICBwYWNrID0gJ2xhbmd1YWdlLWdvJ1xuICAgICAgc2NvcGUgPSAnc291cmNlLmdvJ1xuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAgICAgICBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZShwYWNrKVxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIC8vIENvbW1tZW50XG5cbiAgICAgICAgICAgIGZ1bmMgbWFpbigpIHtcbiAgICAgICAgICAgICAgYSA6PSAxXG4gICAgICAgICAgICAgIGIgOj0gMlxuICAgICAgICAgICAgICBjIDo9IDNcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gQ29tbW1lbnRcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIGN1cnNvcjogWzMsIDBdXG4gICAgICAgIHJ1bnMgLT5cbiAgICAgICAgICBncmFtbWFyID0gYXRvbS5ncmFtbWFycy5ncmFtbWFyRm9yU2NvcGVOYW1lKHNjb3BlKVxuICAgICAgICAgIGVkaXRvci5zZXRHcmFtbWFyKGdyYW1tYXIpXG4gICAgICBhZnRlckVhY2ggLT5cbiAgICAgICAgYXRvbS5wYWNrYWdlcy5kZWFjdGl2YXRlUGFja2FnZShwYWNrKVxuXG4gICAgICBkZXNjcmliZSAnaW5uZXItZnVuY3Rpb24gZm9yIGdvJywgLT5cbiAgICAgICAgaXQgJ3NlbGVjdCBleGNlcHQgc3RhcnQgcm93JywgLT5cbiAgICAgICAgICBlbnN1cmUgJ3YgaSBmJywgc2VsZWN0ZWRCdWZmZXJSYW5nZTogW1szLCAwXSwgWzYsIDBdXVxuXG4gICAgICBkZXNjcmliZSAnYS1mdW5jdGlvbiBmb3IgZ28nLCAtPlxuICAgICAgICBpdCAnc2VsZWN0IGZ1bmN0aW9uJywgLT5cbiAgICAgICAgICBlbnN1cmUgJ3YgYSBmJywgc2VsZWN0ZWRCdWZmZXJSYW5nZTogW1syLCAwXSwgWzcsIDBdXVxuXG4gIGRlc2NyaWJlICdDdXJyZW50TGluZScsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2V0XG4gICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgIFRoaXMgaXNcbiAgICAgICAgICAgIG11bHRpIGxpbmVcbiAgICAgICAgICB0ZXh0XG4gICAgICAgICAgXCJcIlwiXG5cbiAgICBkZXNjcmliZSAnaW5uZXItY3VycmVudC1saW5lJywgLT5cbiAgICAgIGl0ICdzZWxlY3QgY3VycmVudCBsaW5lIHdpdGhvdXQgaW5jbHVkaW5nIGxhc3QgbmV3bGluZScsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFswLCAwXVxuICAgICAgICBlbnN1cmUgJ3YgaSBsJywgc2VsZWN0ZWRUZXh0OiAnVGhpcyBpcydcbiAgICAgIGl0ICdhbHNvIHNraXAgbGVhZGluZyB3aGl0ZSBzcGFjZScsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFsxLCAwXVxuICAgICAgICBlbnN1cmUgJ3YgaSBsJywgc2VsZWN0ZWRUZXh0OiAnbXVsdGkgbGluZSdcbiAgICBkZXNjcmliZSAnYS1jdXJyZW50LWxpbmUnLCAtPlxuICAgICAgaXQgJ3NlbGVjdCBjdXJyZW50IGxpbmUgd2l0aG91dCBpbmNsdWRpbmcgbGFzdCBuZXdsaW5lIGFzIGxpa2UgYHZpbGAnLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgZW5zdXJlICd2IGEgbCcsIHNlbGVjdGVkVGV4dDogJ1RoaXMgaXMnXG4gICAgICBpdCAnd29udCBza2lwIGxlYWRpbmcgd2hpdGUgc3BhY2Ugbm90IGxpa2UgYHZpbGAnLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMSwgMF1cbiAgICAgICAgZW5zdXJlICd2IGEgbCcsIHNlbGVjdGVkVGV4dDogJyAgbXVsdGkgbGluZSdcblxuICBkZXNjcmliZSAnQXJndW1lbnRzJywgLT5cbiAgICBkZXNjcmliZSAnYXV0by1kZXRlY3QgaW5uZXItcGFpciB0YXJnZXQnLCAtPlxuICAgICAgZGVzY3JpYmUgJ2lubmVyLXBhaXIgaXMgY29tbWEgc2VwYXJhdGVkJywgLT5cbiAgICAgICAgaXQgXCJ0YXJnZXQgaW5uZXItcGFyZW4gYnkgYXV0by1kZXRlY3RcIiwgLT5cbiAgICAgICAgICBzZXQgdGV4dEM6IFwiKDF8c3QsIDJuZClcIjsgZW5zdXJlICdkIGkgLCcsIHRleHRDOiBcIih8LCAybmQpXCJcbiAgICAgICAgICBzZXQgdGV4dEM6IFwiKDF8c3QsIDJuZClcIjsgZW5zdXJlICdkIGEgLCcsIHRleHRDOiBcIih8Mm5kKVwiXG4gICAgICAgICAgc2V0IHRleHRDOiBcIigxc3QsIDJ8bmQpXCI7IGVuc3VyZSAnZCBpICwnLCB0ZXh0QzogXCIoMXN0LCB8KVwiXG4gICAgICAgICAgc2V0IHRleHRDOiBcIigxc3QsIDJ8bmQpXCI7IGVuc3VyZSAnZCBhICwnLCB0ZXh0QzogXCIoMXN0fClcIlxuICAgICAgICBpdCBcInRhcmdldCBpbm5lci1jdXJseS1icmFja2V0IGJ5IGF1dG8tZGV0ZWN0XCIsIC0+XG4gICAgICAgICAgc2V0IHRleHRDOiBcInsxfHN0LCAybmR9XCI7IGVuc3VyZSAnZCBpICwnLCB0ZXh0QzogXCJ7fCwgMm5kfVwiXG4gICAgICAgICAgc2V0IHRleHRDOiBcInsxfHN0LCAybmR9XCI7IGVuc3VyZSAnZCBhICwnLCB0ZXh0QzogXCJ7fDJuZH1cIlxuICAgICAgICAgIHNldCB0ZXh0QzogXCJ7MXN0LCAyfG5kfVwiOyBlbnN1cmUgJ2QgaSAsJywgdGV4dEM6IFwiezFzdCwgfH1cIlxuICAgICAgICAgIHNldCB0ZXh0QzogXCJ7MXN0LCAyfG5kfVwiOyBlbnN1cmUgJ2QgYSAsJywgdGV4dEM6IFwiezFzdHx9XCJcbiAgICAgICAgaXQgXCJ0YXJnZXQgaW5uZXItc3F1YXJlLWJyYWNrZXQgYnkgYXV0by1kZXRlY3RcIiwgLT5cbiAgICAgICAgICBzZXQgdGV4dEM6IFwiWzF8c3QsIDJuZF1cIjsgZW5zdXJlICdkIGkgLCcsIHRleHRDOiBcIlt8LCAybmRdXCJcbiAgICAgICAgICBzZXQgdGV4dEM6IFwiWzF8c3QsIDJuZF1cIjsgZW5zdXJlICdkIGEgLCcsIHRleHRDOiBcIlt8Mm5kXVwiXG4gICAgICAgICAgc2V0IHRleHRDOiBcIlsxc3QsIDJ8bmRdXCI7IGVuc3VyZSAnZCBpICwnLCB0ZXh0QzogXCJbMXN0LCB8XVwiXG4gICAgICAgICAgc2V0IHRleHRDOiBcIlsxc3QsIDJ8bmRdXCI7IGVuc3VyZSAnZCBhICwnLCB0ZXh0QzogXCJbMXN0fF1cIlxuICAgICAgZGVzY3JpYmUgJ2lubmVyLXBhaXIgaXMgc3BhY2Ugc2VwYXJhdGVkJywgLT5cbiAgICAgICAgaXQgXCJ0YXJnZXQgaW5uZXItcGFyZW4gYnkgYXV0by1kZXRlY3RcIiwgLT5cbiAgICAgICAgICBzZXQgdGV4dEM6IFwiKDF8c3QgMm5kKVwiOyBlbnN1cmUgJ2QgaSAsJywgdGV4dEM6IFwiKHwgMm5kKVwiXG4gICAgICAgICAgc2V0IHRleHRDOiBcIigxfHN0IDJuZClcIjsgZW5zdXJlICdkIGEgLCcsIHRleHRDOiBcIih8Mm5kKVwiXG4gICAgICAgICAgc2V0IHRleHRDOiBcIigxc3QgMnxuZClcIjsgZW5zdXJlICdkIGkgLCcsIHRleHRDOiBcIigxc3QgfClcIlxuICAgICAgICAgIHNldCB0ZXh0QzogXCIoMXN0IDJ8bmQpXCI7IGVuc3VyZSAnZCBhICwnLCB0ZXh0QzogXCIoMXN0fClcIlxuICAgICAgICBpdCBcInRhcmdldCBpbm5lci1jdXJseS1icmFja2V0IGJ5IGF1dG8tZGV0ZWN0XCIsIC0+XG4gICAgICAgICAgc2V0IHRleHRDOiBcInsxfHN0IDJuZH1cIjsgZW5zdXJlICdkIGkgLCcsIHRleHRDOiBcInt8IDJuZH1cIlxuICAgICAgICAgIHNldCB0ZXh0QzogXCJ7MXxzdCAybmR9XCI7IGVuc3VyZSAnZCBhICwnLCB0ZXh0QzogXCJ7fDJuZH1cIlxuICAgICAgICAgIHNldCB0ZXh0QzogXCJ7MXN0IDJ8bmR9XCI7IGVuc3VyZSAnZCBpICwnLCB0ZXh0QzogXCJ7MXN0IHx9XCJcbiAgICAgICAgICBzZXQgdGV4dEM6IFwiezFzdCAyfG5kfVwiOyBlbnN1cmUgJ2QgYSAsJywgdGV4dEM6IFwiezFzdHx9XCJcbiAgICAgICAgaXQgXCJ0YXJnZXQgaW5uZXItc3F1YXJlLWJyYWNrZXQgYnkgYXV0by1kZXRlY3RcIiwgLT5cbiAgICAgICAgICBzZXQgdGV4dEM6IFwiWzF8c3QgMm5kXVwiOyBlbnN1cmUgJ2QgaSAsJywgdGV4dEM6IFwiW3wgMm5kXVwiXG4gICAgICAgICAgc2V0IHRleHRDOiBcIlsxfHN0IDJuZF1cIjsgZW5zdXJlICdkIGEgLCcsIHRleHRDOiBcIlt8Mm5kXVwiXG4gICAgICAgICAgc2V0IHRleHRDOiBcIlsxc3QgMnxuZF1cIjsgZW5zdXJlICdkIGkgLCcsIHRleHRDOiBcIlsxc3QgfF1cIlxuICAgICAgICAgIHNldCB0ZXh0QzogXCJbMXN0IDJ8bmRdXCI7IGVuc3VyZSAnZCBhICwnLCB0ZXh0QzogXCJbMXN0fF1cIlxuICAgIGRlc2NyaWJlIFwiW2ZhbGxiYWNrXSB3aGVuIGF1dG8tZGV0ZWN0IGZhaWxlZCwgdGFyZ2V0IGN1cnJlbnQtbGluZVwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICBpZiBoZWxsbyh3b3JsZCkgYW5kIGdvb2QoYnllKSB7XG4gICAgICAgICAgICAxc3Q7XG4gICAgICAgICAgICAybmQ7XG4gICAgICAgICAgfVxuICAgICAgICAgIFwiXCJcIlxuXG4gICAgICBpdCBcImRlbGV0ZSAxc3QgZWxlbSBvZiBpbm5lci1jdXJseS1icmFja2V0IHdoZW4gYXV0by1kZXRlY3Qgc3VjY2VlZGVkXCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFsxLCAzXVxuICAgICAgICBlbnN1cmUgJ2QgYSAsJyxcbiAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgaWYgaGVsbG8od29ybGQpIGFuZCBnb29kKGJ5ZSkge1xuICAgICAgICAgICAgfDJuZDtcbiAgICAgICAgICB9XG4gICAgICAgICAgXCJcIlwiXG4gICAgICBpdCBcImRlbGV0ZSAyc3QgZWxlbSBvZiBpbm5lci1jdXJseS1icmFja2V0IHdoZW4gYXV0by1kZXRlY3Qgc3VjY2VlZGVkXCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFsyLCAzXVxuICAgICAgICBlbnN1cmUgJ2QgYSAsJyxcbiAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgaWYgaGVsbG8od29ybGQpIGFuZCBnb29kKGJ5ZSkge1xuICAgICAgICAgICAgMXN0fDtcbiAgICAgICAgICB9XG4gICAgICAgICAgXCJcIlwiXG4gICAgICBpdCBcImRlbGV0ZSAxc3QgZWxlbSBvZiBjdXJyZW50LWxpbmUgd2hlbiBhdXRvLWRldGVjdCBmYWlsZWRcIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzAsIDBdXG4gICAgICAgIGVuc3VyZSAnZCBhICwnLFxuICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICB8aGVsbG8od29ybGQpIGFuZCBnb29kKGJ5ZSkge1xuICAgICAgICAgICAgMXN0O1xuICAgICAgICAgICAgMm5kO1xuICAgICAgICAgIH1cbiAgICAgICAgICBcIlwiXCJcbiAgICAgIGl0IFwiZGVsZXRlIDJuZCBlbGVtIG9mIGN1cnJlbnQtbGluZSB3aGVuIGF1dG8tZGV0ZWN0IGZhaWxlZFwiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMCwgM11cbiAgICAgICAgZW5zdXJlICdkIGEgLCcsXG4gICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgIGlmIHxhbmQgZ29vZChieWUpIHtcbiAgICAgICAgICAgIDFzdDtcbiAgICAgICAgICAgIDJuZDtcbiAgICAgICAgICB9XG4gICAgICAgICAgXCJcIlwiXG4gICAgICBpdCBcImRlbGV0ZSAzcmQgZWxlbSBvZiBjdXJyZW50LWxpbmUgd2hlbiBhdXRvLWRldGVjdCBmYWlsZWRcIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzAsIDE2XVxuICAgICAgICBlbnN1cmUgJ2QgYSAsJyxcbiAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgaWYgaGVsbG8od29ybGQpIHxnb29kKGJ5ZSkge1xuICAgICAgICAgICAgMXN0O1xuICAgICAgICAgICAgMm5kO1xuICAgICAgICAgIH1cbiAgICAgICAgICBcIlwiXCJcbiAgICAgIGl0IFwiZGVsZXRlIDR0aCBlbGVtIG9mIGN1cnJlbnQtbGluZSB3aGVuIGF1dG8tZGV0ZWN0IGZhaWxlZFwiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMjBdXG4gICAgICAgIGVuc3VyZSAnZCBhICwnLFxuICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICBpZiBoZWxsbyh3b3JsZCkgYW5kIHx7XG4gICAgICAgICAgICAxc3Q7XG4gICAgICAgICAgICAybmQ7XG4gICAgICAgICAgfVxuICAgICAgICAgIFwiXCJcIlxuXG4gICAgZGVzY3JpYmUgJ3NsaW5nbGUgbGluZSBjb21tYSBzZXBhcmF0ZWQgdGV4dCcsIC0+XG4gICAgICBkZXNjcmliZSBcImNoYW5nZSAxc3QgYXJnXCIsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT4gICAgICAgICAgICAgICBzZXQgdGV4dEM6IFwidmFyIGEgPSBmdW5jKGZ8aXJzdCgxLCAyLCAzKSwgc2Vjb25kKCksIDMpXCJcbiAgICAgICAgaXQgJ2NoYW5nZScsIC0+IGVuc3VyZSAnYyBpICwnLCB0ZXh0QzogXCJ2YXIgYSA9IGZ1bmMofCwgc2Vjb25kKCksIDMpXCJcbiAgICAgICAgaXQgJ2NoYW5nZScsIC0+IGVuc3VyZSAnYyBhICwnLCB0ZXh0QzogXCJ2YXIgYSA9IGZ1bmMofHNlY29uZCgpLCAzKVwiXG5cbiAgICAgIGRlc2NyaWJlICdjaGFuZ2UgMm5kIGFyZycsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT4gICAgICAgICAgICAgICBzZXQgdGV4dEM6IFwidmFyIGEgPSBmdW5jKGZpcnN0KDEsIDIsIDMpLHwgc2Vjb25kKCksIDMpXCJcbiAgICAgICAgaXQgJ2NoYW5nZScsIC0+IGVuc3VyZSAnYyBpICwnLCB0ZXh0QzogXCJ2YXIgYSA9IGZ1bmMoZmlyc3QoMSwgMiwgMyksIHwsIDMpXCJcbiAgICAgICAgaXQgJ2NoYW5nZScsIC0+IGVuc3VyZSAnYyBhICwnLCB0ZXh0QzogXCJ2YXIgYSA9IGZ1bmMoZmlyc3QoMSwgMiwgMyksIHwzKVwiXG5cbiAgICAgIGRlc2NyaWJlICdjaGFuZ2UgM3JkIGFyZycsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT4gICAgICAgICAgICAgICBzZXQgdGV4dEM6IFwidmFyIGEgPSBmdW5jKGZpcnN0KDEsIDIsIDMpLCBzZWNvbmQoKSx8IDMpXCJcbiAgICAgICAgaXQgJ2NoYW5nZScsIC0+IGVuc3VyZSAnYyBpICwnLCB0ZXh0QzogXCJ2YXIgYSA9IGZ1bmMoZmlyc3QoMSwgMiwgMyksIHNlY29uZCgpLCB8KVwiXG4gICAgICAgIGl0ICdjaGFuZ2UnLCAtPiBlbnN1cmUgJ2MgYSAsJywgdGV4dEM6IFwidmFyIGEgPSBmdW5jKGZpcnN0KDEsIDIsIDMpLCBzZWNvbmQoKXwpXCJcblxuICAgICAgZGVzY3JpYmUgJ3doZW4gY3Vyc29yIGlzIG9uLWNvbW1hLXNlcGFyYXRvciwgaXQgYWZmZWN0cyBwcmVjZWVkaW5nIGFyZycsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT4gICAgICAgICAgICAgICAgICAgc2V0IHRleHRDOiBcInZhciBhID0gZnVuYyhmaXJzdCgxLCAyLCAzKXwsIHNlY29uZCgpLCAzKVwiXG4gICAgICAgIGl0ICdjaGFuZ2UgMXN0JywgLT4gZW5zdXJlICdjIGkgLCcsIHRleHRDOiBcInZhciBhID0gZnVuYyh8LCBzZWNvbmQoKSwgMylcIlxuICAgICAgICBpdCAnY2hhbmdlIDFzdCcsIC0+IGVuc3VyZSAnYyBhICwnLCB0ZXh0QzogXCJ2YXIgYSA9IGZ1bmMofHNlY29uZCgpLCAzKVwiXG5cbiAgICAgIGRlc2NyaWJlICdjdXJzb3ItaXMtb24td2hpdGUtc3BhY2UsIGl0IGFmZmVjdHMgZm9sbG93ZWQgYXJnJywgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPiAgICAgICAgICAgICAgICAgICBzZXQgdGV4dEM6IFwidmFyIGEgPSBmdW5jKGZpcnN0KDEsIDIsIDMpLHwgc2Vjb25kKCksIDMpXCJcbiAgICAgICAgaXQgJ2NoYW5nZSAybmQnLCAtPiBlbnN1cmUgJ2MgaSAsJywgdGV4dEM6IFwidmFyIGEgPSBmdW5jKGZpcnN0KDEsIDIsIDMpLCB8LCAzKVwiXG4gICAgICAgIGl0ICdjaGFuZ2UgMm5kJywgLT4gZW5zdXJlICdjIGEgLCcsIHRleHRDOiBcInZhciBhID0gZnVuYyhmaXJzdCgxLCAyLCAzKSwgfDMpXCJcblxuICAgICAgZGVzY3JpYmUgXCJjdXJzb3ItaXMtb24tcGFyZWh0aGVzaXMsIGl0IHdvbnQgdGFyZ2V0IGlubmVyLXBhcmVudFwiLCAtPlxuICAgICAgICBpdCAnY2hhbmdlIDFzdCBvZiBvdXRlci1wYXJlbicsIC0+XG4gICAgICAgICAgc2V0IHRleHRDOiBcInZhciBhID0gZnVuYyhmaXJzdHwoMSwgMiwgMyksIHNlY29uZCgpLCAzKVwiXG4gICAgICAgICAgZW5zdXJlICdjIGkgLCcsIHRleHRDOiBcInZhciBhID0gZnVuYyh8LCBzZWNvbmQoKSwgMylcIlxuICAgICAgICBpdCAnY2hhbmdlIDNyZCBvZiBvdXRlci1wYXJlbicsIC0+XG4gICAgICAgICAgc2V0IHRleHRDOiBcInZhciBhID0gZnVuYyhmaXJzdCgxLCAyLCAzfCksIHNlY29uZCgpLCAzKVwiXG4gICAgICAgICAgZW5zdXJlICdjIGkgLCcsIHRleHRDOiBcInZhciBhID0gZnVuYyh8LCBzZWNvbmQoKSwgMylcIlxuXG4gICAgICBkZXNjcmliZSBcImN1cnNvci1pcy1uZXh0LW9yLWJlZm9yZSBwYXJlaHRoZXNpcywgaXQgdGFyZ2V0IGlubmVyLXBhcmVudFwiLCAtPlxuICAgICAgICBpdCAnY2hhbmdlIDFzdCBvZiBpbm5lci1wYXJlbicsIC0+XG4gICAgICAgICAgc2V0IHRleHRDOiBcInZhciBhID0gZnVuYyhmaXJzdCh8MSwgMiwgMyksIHNlY29uZCgpLCAzKVwiXG4gICAgICAgICAgZW5zdXJlICdjIGkgLCcsIHRleHRDOiBcInZhciBhID0gZnVuYyhmaXJzdCh8LCAyLCAzKSwgc2Vjb25kKCksIDMpXCJcbiAgICAgICAgaXQgJ2NoYW5nZSAzcmQgb2YgaW5uZXItcGFyZW4nLCAtPlxuICAgICAgICAgIHNldCB0ZXh0QzogXCJ2YXIgYSA9IGZ1bmMoZmlyc3QoMSwgMiwgfDMpLCBzZWNvbmQoKSwgMylcIlxuICAgICAgICAgIGVuc3VyZSAnYyBpICwnLCB0ZXh0QzogXCJ2YXIgYSA9IGZ1bmMoZmlyc3QoMSwgMiwgfCksIHNlY29uZCgpLCAzKVwiXG5cbiAgICBkZXNjcmliZSAnc2xpbmdsZSBsaW5lIHNwYWNlIHNlcGFyYXRlZCB0ZXh0JywgLT5cbiAgICAgIGRlc2NyaWJlIFwiY2hhbmdlIDFzdCBhcmdcIiwgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPiAgICAgICAgICAgICAgIHNldCB0ZXh0QzogXCIldyh8MXN0IDJuZCAzcmQpXCJcbiAgICAgICAgaXQgJ2NoYW5nZScsIC0+IGVuc3VyZSAnYyBpICwnLCB0ZXh0QzogXCIldyh8IDJuZCAzcmQpXCJcbiAgICAgICAgaXQgJ2NoYW5nZScsIC0+IGVuc3VyZSAnYyBhICwnLCB0ZXh0QzogXCIldyh8Mm5kIDNyZClcIlxuICAgICAgZGVzY3JpYmUgXCJjaGFuZ2UgMm5kIGFyZ1wiLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+ICAgICAgICAgICAgICAgc2V0IHRleHRDOiBcIiV3KDFzdCB8Mm5kIDNyZClcIlxuICAgICAgICBpdCAnY2hhbmdlJywgLT4gZW5zdXJlICdjIGkgLCcsIHRleHRDOiBcIiV3KDFzdCB8IDNyZClcIlxuICAgICAgICBpdCAnY2hhbmdlJywgLT4gZW5zdXJlICdjIGEgLCcsIHRleHRDOiBcIiV3KDFzdCB8M3JkKVwiXG4gICAgICBkZXNjcmliZSBcImNoYW5nZSAybmQgYXJnXCIsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT4gICAgICAgICAgICAgICBzZXQgdGV4dEM6IFwiJXcoMXN0IDJuZCB8M3JkKVwiXG4gICAgICAgIGl0ICdjaGFuZ2UnLCAtPiBlbnN1cmUgJ2MgaSAsJywgdGV4dEM6IFwiJXcoMXN0IDJuZCB8KVwiXG4gICAgICAgIGl0ICdjaGFuZ2UnLCAtPiBlbnN1cmUgJ2MgYSAsJywgdGV4dEM6IFwiJXcoMXN0IDJuZHwpXCJcblxuICAgIGRlc2NyaWJlICdtdWx0aSBsaW5lIGNvbW1hIHNlcGFyYXRlZCB0ZXh0JywgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dENfOiBcIlwiXCJcbiAgICAgICAgICBbXG4gICAgICAgICAgICBcIjFzdCBlbGVtIGlzIHN0cmluZ1wiLFxuICAgICAgICAgICAgKCkgPT4gaGVsbG8oJzJuZCBlbG0gaXMgZnVuY3Rpb24nKSxcbiAgICAgICAgICAgIDNyZEVsbUhhc1RyYWlsaW5nQ29tbWEsXG4gICAgICAgICAgXVxuICAgICAgICAgIFwiXCJcIlxuICAgICAgZGVzY3JpYmUgXCJjaGFuZ2UgMXN0IGFyZ1wiLCAtPlxuICAgICAgICBpdCAnY2hhbmdlIDFzdCBpbm5lci1hcmcnLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFsxLCAwXVxuICAgICAgICAgIGVuc3VyZSAnYyBpICwnLFxuICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgW1xuICAgICAgICAgICAgICB8LFxuICAgICAgICAgICAgICAoKSA9PiBoZWxsbygnMm5kIGVsbSBpcyBmdW5jdGlvbicpLFxuICAgICAgICAgICAgICAzcmRFbG1IYXNUcmFpbGluZ0NvbW1hLFxuICAgICAgICAgICAgXVxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgIGl0ICdjaGFuZ2UgMXN0IGEtYXJnJywgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMSwgMF1cbiAgICAgICAgICBlbnN1cmUgJ2MgYSAsJyxcbiAgICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgfCgpID0+IGhlbGxvKCcybmQgZWxtIGlzIGZ1bmN0aW9uJyksXG4gICAgICAgICAgICAgIDNyZEVsbUhhc1RyYWlsaW5nQ29tbWEsXG4gICAgICAgICAgICBdXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgaXQgJ2NoYW5nZSAybmQgaW5uZXItYXJnJywgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMiwgMF1cbiAgICAgICAgICBlbnN1cmUgJ2MgaSAsJyxcbiAgICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgXCIxc3QgZWxlbSBpcyBzdHJpbmdcIixcbiAgICAgICAgICAgICAgfCxcbiAgICAgICAgICAgICAgM3JkRWxtSGFzVHJhaWxpbmdDb21tYSxcbiAgICAgICAgICAgIF1cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICBpdCAnY2hhbmdlIDJuZCBhLWFyZycsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzIsIDBdXG4gICAgICAgICAgZW5zdXJlICdjIGEgLCcsXG4gICAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICBbXG4gICAgICAgICAgICAgIFwiMXN0IGVsZW0gaXMgc3RyaW5nXCIsXG4gICAgICAgICAgICAgIHwzcmRFbG1IYXNUcmFpbGluZ0NvbW1hLFxuICAgICAgICAgICAgXVxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgIGl0ICdjaGFuZ2UgM3JkIGlubmVyLWFyZycsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzMsIDBdXG4gICAgICAgICAgZW5zdXJlICdjIGkgLCcsXG4gICAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICBbXG4gICAgICAgICAgICAgIFwiMXN0IGVsZW0gaXMgc3RyaW5nXCIsXG4gICAgICAgICAgICAgICgpID0+IGhlbGxvKCcybmQgZWxtIGlzIGZ1bmN0aW9uJyksXG4gICAgICAgICAgICAgIHwsXG4gICAgICAgICAgICBdXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgaXQgJ2NoYW5nZSAzcmQgYS1hcmcnLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFszLCAwXVxuICAgICAgICAgIGVuc3VyZSAnYyBhICwnLFxuICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgW1xuICAgICAgICAgICAgICBcIjFzdCBlbGVtIGlzIHN0cmluZ1wiLFxuICAgICAgICAgICAgICAoKSA9PiBoZWxsbygnMm5kIGVsbSBpcyBmdW5jdGlvbicpfCxcbiAgICAgICAgICAgIF1cbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgZGVzY3JpYmUgJ3doZW4gaXQgY291ZG50IGZpbmQgaW5uZXItcGFpciBmcm9tIGN1cnNvciBpdCB0YXJnZXQgY3VycmVudC1saW5lJywgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dENfOiBcIlwiXCJcbiAgICAgICAgICBpZiB8aXNNb3JuaW5nKHRpbWUsIG9mLCB0aGUsIGRheSkge1xuICAgICAgICAgICAgaGVsbGxvKFwid29ybGRcIik7XG4gICAgICAgICAgfVxuICAgICAgICAgIFwiXCJcIlxuICAgICAgaXQgXCJjaGFuZ2UgaW5uZXItYXJnXCIsIC0+XG4gICAgICAgIGVuc3VyZSBcImMgaSAsXCIsXG4gICAgICAgICAgdGV4dENfOiBcIlwiXCJcbiAgICAgICAgICBpZiB8IHtcbiAgICAgICAgICAgIGhlbGxsbyhcIndvcmxkXCIpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBcIlwiXCJcbiAgICAgIGl0IFwiY2hhbmdlIGEtYXJnXCIsIC0+XG4gICAgICAgIGVuc3VyZSBcImMgYSAsXCIsXG4gICAgICAgICAgdGV4dENfOiBcIlwiXCJcbiAgICAgICAgICBpZiB8e1xuICAgICAgICAgICAgaGVsbGxvKFwid29ybGRcIik7XG4gICAgICAgICAgfVxuICAgICAgICAgIFwiXCJcIlxuXG4gIGRlc2NyaWJlICdFbnRpcmUnLCAtPlxuICAgIHRleHQgPSBcIlwiXCJcbiAgICAgIFRoaXMgaXNcbiAgICAgICAgbXVsdGkgbGluZVxuICAgICAgdGV4dFxuICAgICAgXCJcIlwiXG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2V0IHRleHQ6IHRleHQsIGN1cnNvcjogWzAsIDBdXG4gICAgZGVzY3JpYmUgJ2lubmVyLWVudGlyZScsIC0+XG4gICAgICBpdCAnc2VsZWN0IGVudGlyZSBidWZmZXInLCAtPlxuICAgICAgICBlbnN1cmUgJ2VzY2FwZScsIHNlbGVjdGVkVGV4dDogJydcbiAgICAgICAgZW5zdXJlICd2IGkgZScsIHNlbGVjdGVkVGV4dDogdGV4dFxuICAgICAgICBlbnN1cmUgJ2VzY2FwZScsIHNlbGVjdGVkVGV4dDogJydcbiAgICAgICAgZW5zdXJlICdqIGogdiBpIGUnLCBzZWxlY3RlZFRleHQ6IHRleHRcbiAgICBkZXNjcmliZSAnYS1lbnRpcmUnLCAtPlxuICAgICAgaXQgJ3NlbGVjdCBlbnRpcmUgYnVmZmVyJywgLT5cbiAgICAgICAgZW5zdXJlICdlc2NhcGUnLCBzZWxlY3RlZFRleHQ6ICcnXG4gICAgICAgIGVuc3VyZSAndiBhIGUnLCBzZWxlY3RlZFRleHQ6IHRleHRcbiAgICAgICAgZW5zdXJlICdlc2NhcGUnLCBzZWxlY3RlZFRleHQ6ICcnXG4gICAgICAgIGVuc3VyZSAnaiBqIHYgYSBlJywgc2VsZWN0ZWRUZXh0OiB0ZXh0XG5cbiAgZGVzY3JpYmUgJ1NlYXJjaE1hdGNoRm9yd2FyZCwgU2VhcmNoQmFja3dhcmRzJywgLT5cbiAgICB0ZXh0ID0gXCJcIlwiXG4gICAgICAwIHh4eFxuICAgICAgMSBhYmMgeHh4XG4gICAgICAyICAgeHh4IHl5eVxuICAgICAgMyB4eHggYWJjXG4gICAgICA0IGFiY1xcblxuICAgICAgXCJcIlwiXG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2V0IHRleHQ6IHRleHQsIGN1cnNvcjogWzAsIDBdXG4gICAgICBlbnN1cmUgWycvJywgc2VhcmNoOiAnYWJjJ10sIGN1cnNvcjogWzEsIDJdLCBtb2RlOiAnbm9ybWFsJ1xuICAgICAgZXhwZWN0KHZpbVN0YXRlLmdsb2JhbFN0YXRlLmdldCgnbGFzdFNlYXJjaFBhdHRlcm4nKSkudG9FcXVhbCAvYWJjL2dcblxuICAgIGRlc2NyaWJlICdnbiBmcm9tIG5vcm1hbCBtb2RlJywgLT5cbiAgICAgIGl0ICdzZWxlY3QgcmFuZ2VzIG1hdGNoZXMgdG8gbGFzdCBzZWFyY2ggcGF0dGVybiBhbmQgZXh0ZW5kIHNlbGVjdGlvbicsIC0+XG4gICAgICAgIGVuc3VyZSAnZyBuJyxcbiAgICAgICAgICBjdXJzb3I6IFsxLCA1XVxuICAgICAgICAgIG1vZGU6IFsndmlzdWFsJywgJ2NoYXJhY3Rlcndpc2UnXVxuICAgICAgICAgIHNlbGVjdGlvbklzUmV2ZXJzZWQ6IGZhbHNlXG4gICAgICAgICAgc2VsZWN0ZWRUZXh0OiAnYWJjJ1xuICAgICAgICBlbnN1cmUgJ2cgbicsXG4gICAgICAgICAgc2VsZWN0aW9uSXNSZXZlcnNlZDogZmFsc2VcbiAgICAgICAgICBtb2RlOiBbJ3Zpc3VhbCcsICdjaGFyYWN0ZXJ3aXNlJ11cbiAgICAgICAgICBzZWxlY3RlZFRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgYWJjIHh4eFxuICAgICAgICAgICAgMiAgIHh4eCB5eXlcbiAgICAgICAgICAgIDMgeHh4IGFiY1xuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgIGVuc3VyZSAnZyBuJyxcbiAgICAgICAgICBzZWxlY3Rpb25Jc1JldmVyc2VkOiBmYWxzZVxuICAgICAgICAgIG1vZGU6IFsndmlzdWFsJywgJ2NoYXJhY3Rlcndpc2UnXVxuICAgICAgICAgIHNlbGVjdGVkVGV4dDogXCJcIlwiXG4gICAgICAgICAgICBhYmMgeHh4XG4gICAgICAgICAgICAyICAgeHh4IHl5eVxuICAgICAgICAgICAgMyB4eHggYWJjXG4gICAgICAgICAgICA0IGFiY1xuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgIGVuc3VyZSAnZyBuJywgIyBEbyBub3RoaW5nXG4gICAgICAgICAgc2VsZWN0aW9uSXNSZXZlcnNlZDogZmFsc2VcbiAgICAgICAgICBtb2RlOiBbJ3Zpc3VhbCcsICdjaGFyYWN0ZXJ3aXNlJ11cbiAgICAgICAgICBzZWxlY3RlZFRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgYWJjIHh4eFxuICAgICAgICAgICAgMiAgIHh4eCB5eXlcbiAgICAgICAgICAgIDMgeHh4IGFiY1xuICAgICAgICAgICAgNCBhYmNcbiAgICAgICAgICAgIFwiXCJcIlxuICAgIGRlc2NyaWJlICdnTiBmcm9tIG5vcm1hbCBtb2RlJywgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzQsIDNdXG4gICAgICBpdCAnc2VsZWN0IHJhbmdlcyBtYXRjaGVzIHRvIGxhc3Qgc2VhcmNoIHBhdHRlcm4gYW5kIGV4dGVuZCBzZWxlY3Rpb24nLCAtPlxuICAgICAgICBlbnN1cmUgJ2cgTicsXG4gICAgICAgICAgY3Vyc29yOiBbNCwgMl1cbiAgICAgICAgICBtb2RlOiBbJ3Zpc3VhbCcsICdjaGFyYWN0ZXJ3aXNlJ11cbiAgICAgICAgICBzZWxlY3Rpb25Jc1JldmVyc2VkOiB0cnVlXG4gICAgICAgICAgc2VsZWN0ZWRUZXh0OiAnYWJjJ1xuICAgICAgICBlbnN1cmUgJ2cgTicsXG4gICAgICAgICAgc2VsZWN0aW9uSXNSZXZlcnNlZDogdHJ1ZVxuICAgICAgICAgIG1vZGU6IFsndmlzdWFsJywgJ2NoYXJhY3Rlcndpc2UnXVxuICAgICAgICAgIHNlbGVjdGVkVGV4dDogXCJcIlwiXG4gICAgICAgICAgICBhYmNcbiAgICAgICAgICAgIDQgYWJjXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgZW5zdXJlICdnIE4nLFxuICAgICAgICAgIHNlbGVjdGlvbklzUmV2ZXJzZWQ6IHRydWVcbiAgICAgICAgICBtb2RlOiBbJ3Zpc3VhbCcsICdjaGFyYWN0ZXJ3aXNlJ11cbiAgICAgICAgICBzZWxlY3RlZFRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgYWJjIHh4eFxuICAgICAgICAgICAgMiAgIHh4eCB5eXlcbiAgICAgICAgICAgIDMgeHh4IGFiY1xuICAgICAgICAgICAgNCBhYmNcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICBlbnN1cmUgJ2cgTicsICMgRG8gbm90aGluZ1xuICAgICAgICAgIHNlbGVjdGlvbklzUmV2ZXJzZWQ6IHRydWVcbiAgICAgICAgICBtb2RlOiBbJ3Zpc3VhbCcsICdjaGFyYWN0ZXJ3aXNlJ11cbiAgICAgICAgICBzZWxlY3RlZFRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgYWJjIHh4eFxuICAgICAgICAgICAgMiAgIHh4eCB5eXlcbiAgICAgICAgICAgIDMgeHh4IGFiY1xuICAgICAgICAgICAgNCBhYmNcbiAgICAgICAgICAgIFwiXCJcIlxuICAgIGRlc2NyaWJlICdhcyBvcGVyYXRvciB0YXJnZXQnLCAtPlxuICAgICAgaXQgJ2RlbGV0ZSBuZXh0IG9jY3VycmVuY2Ugb2YgbGFzdCBzZWFyY2ggcGF0dGVybicsIC0+XG4gICAgICAgIGVuc3VyZSAnZCBnIG4nLFxuICAgICAgICAgIGN1cnNvcjogWzEsIDJdXG4gICAgICAgICAgbW9kZTogJ25vcm1hbCdcbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIDAgeHh4XG4gICAgICAgICAgICAxICB4eHhcbiAgICAgICAgICAgIDIgICB4eHggeXl5XG4gICAgICAgICAgICAzIHh4eCBhYmNcbiAgICAgICAgICAgIDQgYWJjXFxuXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgZW5zdXJlICcuJyxcbiAgICAgICAgICBjdXJzb3I6IFszLCA1XVxuICAgICAgICAgIG1vZGU6ICdub3JtYWwnXG4gICAgICAgICAgdGV4dF86IFwiXCJcIlxuICAgICAgICAgICAgMCB4eHhcbiAgICAgICAgICAgIDEgIHh4eFxuICAgICAgICAgICAgMiAgIHh4eCB5eXlcbiAgICAgICAgICAgIDMgeHh4X1xuICAgICAgICAgICAgNCBhYmNcXG5cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICBlbnN1cmUgJy4nLFxuICAgICAgICAgIGN1cnNvcjogWzQsIDFdXG4gICAgICAgICAgbW9kZTogJ25vcm1hbCdcbiAgICAgICAgICB0ZXh0XzogXCJcIlwiXG4gICAgICAgICAgICAwIHh4eFxuICAgICAgICAgICAgMSAgeHh4XG4gICAgICAgICAgICAyICAgeHh4IHl5eVxuICAgICAgICAgICAgMyB4eHhfXG4gICAgICAgICAgICA0IFxcblxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICBpdCAnY2hhbmdlIG5leHQgb2NjdXJyZW5jZSBvZiBsYXN0IHNlYXJjaCBwYXR0ZXJuJywgLT5cbiAgICAgICAgZW5zdXJlICdjIGcgbicsXG4gICAgICAgICAgY3Vyc29yOiBbMSwgMl1cbiAgICAgICAgICBtb2RlOiAnaW5zZXJ0J1xuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgMCB4eHhcbiAgICAgICAgICAgIDEgIHh4eFxuICAgICAgICAgICAgMiAgIHh4eCB5eXlcbiAgICAgICAgICAgIDMgeHh4IGFiY1xuICAgICAgICAgICAgNCBhYmNcXG5cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICBrZXlzdHJva2UgJ2VzY2FwZSdcbiAgICAgICAgc2V0IGN1cnNvcjogWzQsIDBdXG4gICAgICAgIGVuc3VyZSAnYyBnIE4nLFxuICAgICAgICAgIGN1cnNvcjogWzMsIDZdXG4gICAgICAgICAgbW9kZTogJ2luc2VydCdcbiAgICAgICAgICB0ZXh0XzogXCJcIlwiXG4gICAgICAgICAgICAwIHh4eFxuICAgICAgICAgICAgMSAgeHh4XG4gICAgICAgICAgICAyICAgeHh4IHl5eVxuICAgICAgICAgICAgMyB4eHhfXG4gICAgICAgICAgICA0IGFiY1xcblxuICAgICAgICAgICAgXCJcIlwiXG4iXX0=
