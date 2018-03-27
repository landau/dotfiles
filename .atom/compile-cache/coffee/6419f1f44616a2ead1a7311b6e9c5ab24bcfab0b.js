(function() {
  var dispatch, getVimState, inspect, ref, settings;

  ref = require('./spec-helper'), getVimState = ref.getVimState, dispatch = ref.dispatch;

  settings = require('../lib/settings');

  inspect = require('util').inspect;

  describe("Operator ActivateInsertMode family", function() {
    var bindEnsureOption, editor, editorElement, ensure, keystroke, ref1, set, vimState;
    ref1 = [], set = ref1[0], ensure = ref1[1], bindEnsureOption = ref1[2], keystroke = ref1[3], editor = ref1[4], editorElement = ref1[5], vimState = ref1[6];
    beforeEach(function() {
      return getVimState(function(state, vim) {
        vimState = state;
        editor = vimState.editor, editorElement = vimState.editorElement;
        return set = vim.set, ensure = vim.ensure, keystroke = vim.keystroke, bindEnsureOption = vim.bindEnsureOption, vim;
      });
    });
    describe("the s keybinding", function() {
      beforeEach(function() {
        return set({
          text: '012345',
          cursor: [0, 1]
        });
      });
      it("deletes the character to the right and enters insert mode", function() {
        return ensure('s', {
          mode: 'insert',
          text: '02345',
          cursor: [0, 1],
          register: {
            '"': {
              text: '1'
            }
          }
        });
      });
      it("is repeatable", function() {
        set({
          cursor: [0, 0]
        });
        keystroke('3 s');
        editor.insertText('ab');
        ensure('escape', {
          text: 'ab345'
        });
        set({
          cursor: [0, 2]
        });
        return ensure('.', {
          text: 'abab'
        });
      });
      it("is undoable", function() {
        set({
          cursor: [0, 0]
        });
        keystroke('3 s');
        editor.insertText('ab');
        ensure('escape', {
          text: 'ab345'
        });
        return ensure('u', {
          text: '012345',
          selectedText: ''
        });
      });
      return describe("in visual mode", function() {
        beforeEach(function() {
          return keystroke('v l s');
        });
        return it("deletes the selected characters and enters insert mode", function() {
          return ensure({
            mode: 'insert',
            text: '0345',
            cursor: [0, 1],
            register: {
              '"': {
                text: '12'
              }
            }
          });
        });
      });
    });
    describe("the S keybinding", function() {
      beforeEach(function() {
        return set({
          text: "12345\nabcde\nABCDE",
          cursor: [1, 3]
        });
      });
      it("deletes the entire line and enters insert mode", function() {
        return ensure('S', {
          mode: 'insert',
          text: "12345\n\nABCDE",
          register: {
            '"': {
              text: 'abcde\n',
              type: 'linewise'
            }
          }
        });
      });
      it("is repeatable", function() {
        keystroke('S');
        editor.insertText('abc');
        ensure('escape', {
          text: '12345\nabc\nABCDE'
        });
        set({
          cursor: [2, 3]
        });
        return ensure('.', {
          text: '12345\nabc\nabc'
        });
      });
      it("is undoable", function() {
        keystroke('S');
        editor.insertText('abc');
        ensure('escape', {
          text: '12345\nabc\nABCDE'
        });
        return ensure('u', {
          text: "12345\nabcde\nABCDE",
          selectedText: ''
        });
      });
      it("works when the cursor's goal column is greater than its current column", function() {
        set({
          text: "\n12345",
          cursor: [1, 2e308]
        });
        return ensure('k S', {
          text: '\n12345'
        });
      });
      return xit("respects indentation", function() {});
    });
    describe("the c keybinding", function() {
      beforeEach(function() {
        return set({
          text: "12345\nabcde\nABCDE"
        });
      });
      describe("when followed by a c", function() {
        describe("with autoindent", function() {
          beforeEach(function() {
            set({
              text: "12345\n  abcde\nABCDE\n"
            });
            set({
              cursor: [1, 1]
            });
            spyOn(editor, 'shouldAutoIndent').andReturn(true);
            spyOn(editor, 'autoIndentBufferRow').andCallFake(function(line) {
              return editor.indent();
            });
            return spyOn(editor.languageMode, 'suggestedIndentForLineAtBufferRow').andCallFake(function() {
              return 1;
            });
          });
          it("deletes the current line and enters insert mode", function() {
            set({
              cursor: [1, 1]
            });
            return ensure('c c', {
              text: "12345\n  \nABCDE\n",
              cursor: [1, 2],
              mode: 'insert'
            });
          });
          it("is repeatable", function() {
            keystroke('c c');
            editor.insertText("abc");
            ensure('escape', {
              text: "12345\n  abc\nABCDE\n"
            });
            set({
              cursor: [2, 3]
            });
            return ensure('.', {
              text: "12345\n  abc\n  abc\n"
            });
          });
          return it("is undoable", function() {
            keystroke('c c');
            editor.insertText("abc");
            ensure('escape', {
              text: "12345\n  abc\nABCDE\n"
            });
            return ensure('u', {
              text: "12345\n  abcde\nABCDE\n",
              selectedText: ''
            });
          });
        });
        describe("when the cursor is on the last line", function() {
          return it("deletes the line's content and enters insert mode on the last line", function() {
            set({
              cursor: [2, 1]
            });
            return ensure('c c', {
              text: "12345\nabcde\n",
              cursor: [2, 0],
              mode: 'insert'
            });
          });
        });
        return describe("when the cursor is on the only line", function() {
          return it("deletes the line's content and enters insert mode", function() {
            set({
              text: "12345",
              cursor: [0, 2]
            });
            return ensure('c c', {
              text: "",
              cursor: [0, 0],
              mode: 'insert'
            });
          });
        });
      });
      describe("when followed by i w", function() {
        it("undo's and redo's completely", function() {
          set({
            cursor: [1, 1]
          });
          ensure('c i w', {
            text: "12345\n\nABCDE",
            cursor: [1, 0],
            mode: 'insert'
          });
          set({
            text: "12345\nfg\nABCDE"
          });
          ensure('escape', {
            text: "12345\nfg\nABCDE",
            mode: 'normal'
          });
          ensure('u', {
            text: "12345\nabcde\nABCDE"
          });
          return ensure('ctrl-r', {
            text: "12345\nfg\nABCDE"
          });
        });
        return it("repeatable", function() {
          set({
            cursor: [1, 1]
          });
          ensure('c i w', {
            text: "12345\n\nABCDE",
            cursor: [1, 0],
            mode: 'insert'
          });
          return ensure('escape j .', {
            text: "12345\n\n",
            cursor: [2, 0],
            mode: 'normal'
          });
        });
      });
      describe("when followed by a w", function() {
        return it("changes the word", function() {
          set({
            text: "word1 word2 word3",
            cursor: [0, 7]
          });
          return ensure('c w escape', {
            text: "word1 w word3"
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
        describe("on the beginning of the second line", function() {
          return it("deletes the bottom two lines", function() {
            set({
              cursor: [1, 0]
            });
            return ensure('c G escape', {
              text: '12345\n\n'
            });
          });
        });
        return describe("on the middle of the second line", function() {
          return it("deletes the bottom two lines", function() {
            set({
              cursor: [1, 2]
            });
            return ensure('c G escape', {
              text: '12345\n\n'
            });
          });
        });
      });
      return describe("when followed by a goto line G", function() {
        beforeEach(function() {
          return set({
            text: "12345\nabcde\nABCDE"
          });
        });
        describe("on the beginning of the second line", function() {
          return it("deletes all the text on the line", function() {
            set({
              cursor: [1, 0]
            });
            return ensure('c 2 G escape', {
              text: '12345\n\nABCDE'
            });
          });
        });
        return describe("on the middle of the second line", function() {
          return it("deletes all the text on the line", function() {
            set({
              cursor: [1, 2]
            });
            return ensure('c 2 G escape', {
              text: '12345\n\nABCDE'
            });
          });
        });
      });
    });
    describe("the C keybinding", function() {
      beforeEach(function() {
        return set({
          cursor: [1, 2],
          text: "0!!!!!!\n1!!!!!!\n2!!!!!!\n3!!!!!!\n"
        });
      });
      describe("in normal-mode", function() {
        return it("deletes till the EOL then enter insert-mode", function() {
          return ensure('C', {
            cursor: [1, 2],
            mode: 'insert',
            text: "0!!!!!!\n1!\n2!!!!!!\n3!!!!!!\n"
          });
        });
      });
      return describe("in visual-mode.characterwise", function() {
        return it("delete whole lines and enter insert-mode", function() {
          return ensure('v j C', {
            cursor: [1, 0],
            mode: 'insert',
            text: "0!!!!!!\n\n3!!!!!!\n"
          });
        });
      });
    });
    describe("dontUpdateRegisterOnChangeOrSubstitute settings", function() {
      var resultTextC;
      resultTextC = null;
      beforeEach(function() {
        set({
          register: {
            '"': {
              text: 'initial-value'
            }
          },
          textC: "0abc\n1|def\n2ghi\n"
        });
        return resultTextC = {
          cl: "0abc\n1|ef\n2ghi\n",
          C: "0abc\n1|\n2ghi\n",
          s: "0abc\n1|ef\n2ghi\n",
          S: "0abc\n|\n2ghi\n"
        };
      });
      describe("when dontUpdateRegisterOnChangeOrSubstitute=false", function() {
        var ensure_;
        ensure_ = null;
        beforeEach(function() {
          ensure_ = bindEnsureOption({
            mode: 'insert'
          });
          return settings.set("dontUpdateRegisterOnChangeOrSubstitute", false);
        });
        it('c mutate register', function() {
          return ensure_('c l', {
            textC: resultTextC.cl,
            register: {
              '"': {
                text: 'd'
              }
            }
          });
        });
        it('C mutate register', function() {
          return ensure_('C', {
            textC: resultTextC.C,
            register: {
              '"': {
                text: 'def'
              }
            }
          });
        });
        it('s mutate register', function() {
          return ensure_('s', {
            textC: resultTextC.s,
            register: {
              '"': {
                text: 'd'
              }
            }
          });
        });
        return it('S mutate register', function() {
          return ensure_('S', {
            textC: resultTextC.S,
            register: {
              '"': {
                text: '1def\n'
              }
            }
          });
        });
      });
      return describe("when dontUpdateRegisterOnChangeOrSubstitute=true", function() {
        var ensure_;
        ensure_ = null;
        beforeEach(function() {
          ensure_ = bindEnsureOption({
            mode: 'insert',
            register: {
              '"': {
                text: 'initial-value'
              }
            }
          });
          return settings.set("dontUpdateRegisterOnChangeOrSubstitute", true);
        });
        it('c mutate register', function() {
          return ensure_('c l', {
            textC: resultTextC.cl
          });
        });
        it('C mutate register', function() {
          return ensure_('C', {
            textC: resultTextC.C
          });
        });
        it('s mutate register', function() {
          return ensure_('s', {
            textC: resultTextC.s
          });
        });
        return it('S mutate register', function() {
          return ensure_('S', {
            textC: resultTextC.S
          });
        });
      });
    });
    describe("the O keybinding", function() {
      beforeEach(function() {
        spyOn(editor, 'shouldAutoIndent').andReturn(true);
        spyOn(editor, 'autoIndentBufferRow').andCallFake(function(line) {
          return editor.indent();
        });
        return set({
          textC_: "__abc\n_|_012\n"
        });
      });
      it("switches to insert and adds a newline above the current one", function() {
        keystroke('O');
        return ensure({
          textC_: "__abc\n__|\n__012\n",
          mode: 'insert'
        });
      });
      it("is repeatable", function() {
        set({
          textC_: "__abc\n__|012\n____4spaces\n"
        });
        keystroke('O');
        editor.insertText("def");
        ensure('escape', {
          textC_: "__abc\n__de|f\n__012\n____4spaces\n"
        });
        ensure('.', {
          textC_: "__abc\n__de|f\n__def\n__012\n____4spaces\n"
        });
        set({
          cursor: [4, 0]
        });
        return ensure('.', {
          textC_: "__abc\n__def\n__def\n__012\n____de|f\n____4spaces\n"
        });
      });
      return it("is undoable", function() {
        keystroke('O');
        editor.insertText("def");
        ensure('escape', {
          textC_: "__abc\n__def\n__012\n"
        });
        return ensure('u', {
          textC_: "__abc\n__012\n"
        });
      });
    });
    describe("the o keybinding", function() {
      beforeEach(function() {
        spyOn(editor, 'shouldAutoIndent').andReturn(true);
        spyOn(editor, 'autoIndentBufferRow').andCallFake(function(line) {
          return editor.indent();
        });
        return set({
          text: "abc\n  012\n",
          cursor: [1, 2]
        });
      });
      it("switches to insert and adds a newline above the current one", function() {
        return ensure('o', {
          text: "abc\n  012\n  \n",
          mode: 'insert',
          cursor: [2, 2]
        });
      });
      xit("is repeatable", function() {
        set({
          text: "  abc\n  012\n    4spaces\n",
          cursor: [1, 1]
        });
        keystroke('o');
        editor.insertText("def");
        ensure('escape', {
          text: "  abc\n  012\n  def\n    4spaces\n"
        });
        ensure('.', {
          text: "  abc\n  012\n  def\n  def\n    4spaces\n"
        });
        set({
          cursor: [4, 1]
        });
        return ensure('.', {
          text: "  abc\n  def\n  def\n  012\n    4spaces\n    def\n"
        });
      });
      return it("is undoable", function() {
        keystroke('o');
        editor.insertText("def");
        ensure('escape', {
          text: "abc\n  012\n  def\n"
        });
        return ensure('u', {
          text: "abc\n  012\n"
        });
      });
    });
    describe("undo/redo for `o` and `O`", function() {
      beforeEach(function() {
        return set({
          textC: "----|=="
        });
      });
      it("undo and redo by keeping cursor at o started position", function() {
        ensure('o', {
          mode: 'insert'
        });
        editor.insertText('@@');
        ensure("escape", {
          textC: "----==\n@|@"
        });
        ensure("u", {
          textC: "----|=="
        });
        return ensure("ctrl-r", {
          textC: "----|==\n@@"
        });
      });
      return it("undo and redo by keeping cursor at O started position", function() {
        ensure('O', {
          mode: 'insert'
        });
        editor.insertText('@@');
        ensure("escape", {
          textC: "@|@\n----=="
        });
        ensure("u", {
          textC: "----|=="
        });
        return ensure("ctrl-r", {
          textC: "@@\n----|=="
        });
      });
    });
    describe("the a keybinding", function() {
      beforeEach(function() {
        return set({
          text: "012\n"
        });
      });
      describe("at the beginning of the line", function() {
        beforeEach(function() {
          set({
            cursor: [0, 0]
          });
          return keystroke('a');
        });
        return it("switches to insert mode and shifts to the right", function() {
          return ensure({
            cursor: [0, 1],
            mode: 'insert'
          });
        });
      });
      return describe("at the end of the line", function() {
        beforeEach(function() {
          set({
            cursor: [0, 3]
          });
          return keystroke('a');
        });
        return it("doesn't linewrap", function() {
          return ensure({
            cursor: [0, 3]
          });
        });
      });
    });
    describe("the A keybinding", function() {
      beforeEach(function() {
        return set({
          text: "11\n22\n"
        });
      });
      return describe("at the beginning of a line", function() {
        it("switches to insert mode at the end of the line", function() {
          set({
            cursor: [0, 0]
          });
          return ensure('A', {
            mode: 'insert',
            cursor: [0, 2]
          });
        });
        return it("repeats always as insert at the end of the line", function() {
          set({
            cursor: [0, 0]
          });
          keystroke('A');
          editor.insertText("abc");
          keystroke('escape');
          set({
            cursor: [1, 0]
          });
          return ensure('.', {
            text: "11abc\n22abc\n",
            mode: 'normal',
            cursor: [1, 4]
          });
        });
      });
    });
    describe("the I keybinding", function() {
      beforeEach(function() {
        return set({
          text_: "__0: 3456 890\n1: 3456 890\n__2: 3456 890\n____3: 3456 890"
        });
      });
      describe("in normal-mode", function() {
        describe("I", function() {
          return it("insert at first char of line", function() {
            set({
              cursor: [0, 5]
            });
            ensure('I', {
              cursor: [0, 2],
              mode: 'insert'
            });
            ensure("escape", {
              mode: 'normal'
            });
            set({
              cursor: [1, 5]
            });
            ensure('I', {
              cursor: [1, 0],
              mode: 'insert'
            });
            ensure("escape", {
              mode: 'normal'
            });
            set({
              cursor: [1, 0]
            });
            ensure('I', {
              cursor: [1, 0],
              mode: 'insert'
            });
            return ensure("escape", {
              mode: 'normal'
            });
          });
        });
        return describe("A", function() {
          return it("insert at end of line", function() {
            set({
              cursor: [0, 5]
            });
            ensure('A', {
              cursor: [0, 13],
              mode: 'insert'
            });
            ensure("escape", {
              mode: 'normal'
            });
            set({
              cursor: [1, 5]
            });
            ensure('A', {
              cursor: [1, 11],
              mode: 'insert'
            });
            ensure("escape", {
              mode: 'normal'
            });
            set({
              cursor: [1, 11]
            });
            ensure('A', {
              cursor: [1, 11],
              mode: 'insert'
            });
            return ensure("escape", {
              mode: 'normal'
            });
          });
        });
      });
      describe("visual-mode.linewise", function() {
        beforeEach(function() {
          set({
            cursor: [1, 3]
          });
          return ensure("V 2 j", {
            selectedText: "1: 3456 890\n  2: 3456 890\n    3: 3456 890",
            mode: ['visual', 'linewise']
          });
        });
        describe("I", function() {
          return it("insert at first char of line *of each selected line*", function() {
            return ensure("I", {
              cursor: [[1, 0], [2, 2], [3, 4]],
              mode: "insert"
            });
          });
        });
        return describe("A", function() {
          return it("insert at end of line *of each selected line*", function() {
            return ensure("A", {
              cursor: [[1, 11], [2, 13], [3, 15]],
              mode: "insert"
            });
          });
        });
      });
      describe("visual-mode.blockwise", function() {
        beforeEach(function() {
          set({
            cursor: [1, 4]
          });
          return ensure("ctrl-v 2 j", {
            selectedText: ["4", " ", "3"],
            mode: ['visual', 'blockwise']
          });
        });
        describe("I", function() {
          it("insert at column of start of selection for *each selection*", function() {
            return ensure("I", {
              cursor: [[1, 4], [2, 4], [3, 4]],
              mode: "insert"
            });
          });
          return it("can repeat after insert AFTER clearing multiple cursor", function() {
            ensure("escape", {
              mode: 'normal'
            });
            set({
              textC: "|line0\nline1\nline2"
            });
            ensure("ctrl-v j I", {
              textC: "|line0\n|line1\nline2",
              mode: 'insert'
            });
            editor.insertText("ABC");
            ensure("escape", {
              textC: "AB|Cline0\nAB!Cline1\nline2",
              mode: 'normal'
            });
            ensure("escape k", {
              textC: "AB!Cline0\nABCline1\nline2",
              mode: 'normal'
            });
            return ensure("l .", {
              textC: "ABCAB|Cline0\nABCAB!Cline1\nline2",
              mode: 'normal'
            });
          });
        });
        return describe("A", function() {
          return it("insert at column of end of selection for *each selection*", function() {
            return ensure("A", {
              cursor: [[1, 5], [2, 5], [3, 5]],
              mode: "insert"
            });
          });
        });
      });
      describe("visual-mode.characterwise", function() {
        beforeEach(function() {
          set({
            cursor: [1, 4]
          });
          return ensure("v 2 j", {
            selectedText: "456 890\n  2: 3456 890\n    3",
            mode: ['visual', 'characterwise']
          });
        });
        describe("I is short hand of `ctrl-v I`", function() {
          return it("insert at colum of start of selection for *each selected lines*", function() {
            return ensure("I", {
              cursor: [[1, 4], [2, 4], [3, 4]],
              mode: "insert"
            });
          });
        });
        return describe("A is short hand of `ctrl-v A`", function() {
          return it("insert at column of end of selection for *each selected lines*", function() {
            return ensure("A", {
              cursor: [[1, 5], [2, 5], [3, 5]],
              mode: "insert"
            });
          });
        });
      });
      return describe("when occurrence marker interselcts I and A no longer behave blockwise in vC/vL", function() {
        beforeEach(function() {
          jasmine.attachToDOM(editorElement);
          set({
            cursor: [1, 3]
          });
          return ensure('g o', {
            occurrenceText: ['3456', '3456', '3456', '3456'],
            cursor: [1, 3]
          });
        });
        describe("vC", function() {
          return describe("I and A NOT behave as `ctrl-v I`", function() {
            it("I insert at start of each vsually selected occurrence", function() {
              return ensure("v j j I", {
                mode: 'insert',
                textC_: "__0: 3456 890\n1: !3456 890\n__2: |3456 890\n____3: 3456 890"
              });
            });
            return it("A insert at end of each vsually selected occurrence", function() {
              return ensure("v j j A", {
                mode: 'insert',
                textC_: "__0: 3456 890\n1: 3456! 890\n__2: 3456| 890\n____3: 3456 890"
              });
            });
          });
        });
        return describe("vL", function() {
          return describe("I and A NOT behave as `ctrl-v I`", function() {
            it("I insert at start of each vsually selected occurrence", function() {
              return ensure("V j j I", {
                mode: 'insert',
                textC_: "__0: 3456 890\n1: |3456 890\n _2: |3456 890\n____3: !3456 890"
              });
            });
            return it("A insert at end of each vsually selected occurrence", function() {
              return ensure("V j j A", {
                mode: 'insert',
                textC_: "__0: 3456 890\n1: 3456| 890\n__2: 3456| 890\n____3: 3456! 890"
              });
            });
          });
        });
      });
    });
    describe("the gI keybinding", function() {
      beforeEach(function() {
        return set({
          text: "__this is text"
        });
      });
      describe("in normal-mode.", function() {
        return it("start at insert at column 0 regardless of current column", function() {
          set({
            cursor: [0, 5]
          });
          ensure("g I", {
            cursor: [0, 0],
            mode: 'insert'
          });
          ensure("escape", {
            mode: 'normal'
          });
          set({
            cursor: [0, 0]
          });
          ensure("g I", {
            cursor: [0, 0],
            mode: 'insert'
          });
          ensure("escape", {
            mode: 'normal'
          });
          set({
            cursor: [0, 13]
          });
          return ensure("g I", {
            cursor: [0, 0],
            mode: 'insert'
          });
        });
      });
      return describe("in visual-mode", function() {
        beforeEach(function() {
          return set({
            text_: "__0: 3456 890\n1: 3456 890\n__2: 3456 890\n____3: 3456 890"
          });
        });
        it("[characterwise]", function() {
          set({
            cursor: [1, 4]
          });
          ensure("v 2 j", {
            selectedText: "456 890\n  2: 3456 890\n    3",
            mode: ['visual', 'characterwise']
          });
          return ensure("g I", {
            cursor: [[1, 0], [2, 0], [3, 0]],
            mode: "insert"
          });
        });
        it("[linewise]", function() {
          set({
            cursor: [1, 3]
          });
          ensure("V 2 j", {
            selectedText: "1: 3456 890\n  2: 3456 890\n    3: 3456 890",
            mode: ['visual', 'linewise']
          });
          return ensure("g I", {
            cursor: [[1, 0], [2, 0], [3, 0]],
            mode: "insert"
          });
        });
        return it("[blockwise]", function() {
          set({
            cursor: [1, 4]
          });
          ensure("ctrl-v 2 j", {
            selectedText: ["4", " ", "3"],
            mode: ['visual', 'blockwise']
          });
          return ensure("g I", {
            cursor: [[1, 0], [2, 0], [3, 0]],
            mode: "insert"
          });
        });
      });
    });
    describe("InsertAtPreviousFoldStart and Next", function() {
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
            'atom-text-editor.vim-mode-plus.normal-mode': {
              'g [': 'vim-mode-plus:insert-at-previous-fold-start',
              'g ]': 'vim-mode-plus:insert-at-next-fold-start'
            }
          });
        });
      });
      afterEach(function() {
        return atom.packages.deactivatePackage('language-coffee-script');
      });
      describe("when cursor is not at fold start row", function() {
        beforeEach(function() {
          return set({
            cursor: [16, 0]
          });
        });
        it("insert at previous fold start row", function() {
          return ensure('g [', {
            cursor: [9, 2],
            mode: 'insert'
          });
        });
        return it("insert at next fold start row", function() {
          return ensure('g ]', {
            cursor: [18, 4],
            mode: 'insert'
          });
        });
      });
      return describe("when cursor is at fold start row", function() {
        beforeEach(function() {
          return set({
            cursor: [20, 6]
          });
        });
        it("insert at previous fold start row", function() {
          return ensure('g [', {
            cursor: [18, 4],
            mode: 'insert'
          });
        });
        return it("insert at next fold start row", function() {
          return ensure('g ]', {
            cursor: [22, 6],
            mode: 'insert'
          });
        });
      });
    });
    describe("the i keybinding", function() {
      beforeEach(function() {
        return set({
          textC: "|123\n|4567"
        });
      });
      it("allows undoing an entire batch of typing", function() {
        keystroke('i');
        editor.insertText("abcXX");
        editor.backspace();
        editor.backspace();
        ensure('escape', {
          text: "abc123\nabc4567"
        });
        keystroke('i');
        editor.insertText("d");
        editor.insertText("e");
        editor.insertText("f");
        ensure('escape', {
          text: "abdefc123\nabdefc4567"
        });
        ensure('u', {
          text: "abc123\nabc4567"
        });
        return ensure('u', {
          text: "123\n4567"
        });
      });
      it("allows repeating typing", function() {
        keystroke('i');
        editor.insertText("abcXX");
        editor.backspace();
        editor.backspace();
        ensure('escape', {
          text: "abc123\nabc4567"
        });
        ensure('.', {
          text: "ababcc123\nababcc4567"
        });
        return ensure('.', {
          text: "abababccc123\nabababccc4567"
        });
      });
      return describe('with nonlinear input', function() {
        beforeEach(function() {
          return set({
            text: '',
            cursor: [0, 0]
          });
        });
        it('deals with auto-matched brackets', function() {
          keystroke('i');
          editor.insertText('()');
          editor.moveLeft();
          editor.insertText('a');
          editor.moveRight();
          editor.insertText('b\n');
          ensure('escape', {
            cursor: [1, 0]
          });
          return ensure('.', {
            text: '(a)b\n(a)b\n',
            cursor: [2, 0]
          });
        });
        return it('deals with autocomplete', function() {
          keystroke('i');
          editor.insertText('a');
          editor.insertText('d');
          editor.insertText('d');
          editor.setTextInBufferRange([[0, 0], [0, 3]], 'addFoo');
          ensure('escape', {
            cursor: [0, 5],
            text: 'addFoo'
          });
          return ensure('.', {
            text: 'addFoaddFooo',
            cursor: [0, 10]
          });
        });
      });
    });
    describe('the a keybinding', function() {
      beforeEach(function() {
        return set({
          text: '',
          cursor: [0, 0]
        });
      });
      it("can be undone in one go", function() {
        keystroke('a');
        editor.insertText("abc");
        ensure('escape', {
          text: "abc"
        });
        return ensure('u', {
          text: ""
        });
      });
      return it("repeats correctly", function() {
        keystroke('a');
        editor.insertText("abc");
        ensure('escape', {
          text: "abc",
          cursor: [0, 2]
        });
        return ensure('.', {
          text: "abcabc",
          cursor: [0, 5]
        });
      });
    });
    describe('preserve inserted text', function() {
      var ensureDotRegister;
      ensureDotRegister = null;
      beforeEach(function() {
        ensureDotRegister = function(key, arg) {
          var text;
          text = arg.text;
          ensure(key, {
            mode: 'insert'
          });
          editor.insertText(text);
          return ensure("escape", {
            register: {
              '.': {
                text: text
              }
            }
          });
        };
        return set({
          text: "\n\n",
          cursor: [0, 0]
        });
      });
      it("[case-i]", function() {
        return ensureDotRegister('i', {
          text: 'iabc'
        });
      });
      it("[case-o]", function() {
        return ensureDotRegister('o', {
          text: 'oabc'
        });
      });
      it("[case-c]", function() {
        return ensureDotRegister('c l', {
          text: 'cabc'
        });
      });
      it("[case-C]", function() {
        return ensureDotRegister('C', {
          text: 'Cabc'
        });
      });
      return it("[case-s]", function() {
        return ensureDotRegister('s', {
          text: 'sabc'
        });
      });
    });
    describe("repeat backspace/delete happened in insert-mode", function() {
      describe("single cursor operation", function() {
        beforeEach(function() {
          return set({
            cursor: [0, 0],
            text: "123\n123"
          });
        });
        it("can repeat backspace only mutation: case-i", function() {
          set({
            cursor: [0, 1]
          });
          keystroke('i');
          editor.backspace();
          ensure('escape', {
            text: "23\n123",
            cursor: [0, 0]
          });
          ensure('j .', {
            text: "23\n123"
          });
          return ensure('l .', {
            text: "23\n23"
          });
        });
        it("can repeat backspace only mutation: case-a", function() {
          keystroke('a');
          editor.backspace();
          ensure('escape', {
            text: "23\n123",
            cursor: [0, 0]
          });
          ensure('.', {
            text: "3\n123",
            cursor: [0, 0]
          });
          return ensure('j . .', {
            text: "3\n3"
          });
        });
        it("can repeat delete only mutation: case-i", function() {
          keystroke('i');
          editor["delete"]();
          ensure('escape', {
            text: "23\n123"
          });
          return ensure('j .', {
            text: "23\n23"
          });
        });
        it("can repeat delete only mutation: case-a", function() {
          keystroke('a');
          editor["delete"]();
          ensure('escape', {
            text: "13\n123"
          });
          return ensure('j .', {
            text: "13\n13"
          });
        });
        it("can repeat backspace and insert mutation: case-i", function() {
          set({
            cursor: [0, 1]
          });
          keystroke('i');
          editor.backspace();
          editor.insertText("!!!");
          ensure('escape', {
            text: "!!!23\n123"
          });
          set({
            cursor: [1, 1]
          });
          return ensure('.', {
            text: "!!!23\n!!!23"
          });
        });
        it("can repeat backspace and insert mutation: case-a", function() {
          keystroke('a');
          editor.backspace();
          editor.insertText("!!!");
          ensure('escape', {
            text: "!!!23\n123"
          });
          return ensure('j 0 .', {
            text: "!!!23\n!!!23"
          });
        });
        it("can repeat delete and insert mutation: case-i", function() {
          keystroke('i');
          editor["delete"]();
          editor.insertText("!!!");
          ensure('escape', {
            text: "!!!23\n123"
          });
          return ensure('j 0 .', {
            text: "!!!23\n!!!23"
          });
        });
        return it("can repeat delete and insert mutation: case-a", function() {
          keystroke('a');
          editor["delete"]();
          editor.insertText("!!!");
          ensure('escape', {
            text: "1!!!3\n123"
          });
          return ensure('j 0 .', {
            text: "1!!!3\n1!!!3"
          });
        });
      });
      return describe("multi-cursors operation", function() {
        beforeEach(function() {
          return set({
            textC: "|123\n\n|1234\n\n|12345"
          });
        });
        it("can repeat backspace only mutation: case-multi-cursors", function() {
          ensure('A', {
            cursor: [[0, 3], [2, 4], [4, 5]],
            mode: 'insert'
          });
          editor.backspace();
          ensure('escape', {
            text: "12\n\n123\n\n1234",
            cursor: [[0, 1], [2, 2], [4, 3]]
          });
          return ensure('.', {
            text: "1\n\n12\n\n123",
            cursor: [[0, 0], [2, 1], [4, 2]]
          });
        });
        return it("can repeat delete only mutation: case-multi-cursors", function() {
          var cursors;
          ensure('I', {
            mode: 'insert'
          });
          editor["delete"]();
          cursors = [[0, 0], [2, 0], [4, 0]];
          ensure('escape', {
            text: "23\n\n234\n\n2345",
            cursor: cursors
          });
          ensure('.', {
            text: "3\n\n34\n\n345",
            cursor: cursors
          });
          ensure('.', {
            text: "\n\n4\n\n45",
            cursor: cursors
          });
          ensure('.', {
            text: "\n\n\n\n5",
            cursor: cursors
          });
          return ensure('.', {
            text: "\n\n\n\n",
            cursor: cursors
          });
        });
      });
    });
    return describe('specify insertion count', function() {
      var ensureInsertionCount;
      ensureInsertionCount = function(key, arg) {
        var cursor, insert, text;
        insert = arg.insert, text = arg.text, cursor = arg.cursor;
        keystroke(key);
        editor.insertText(insert);
        return ensure("escape", {
          text: text,
          cursor: cursor
        });
      };
      beforeEach(function() {
        var initialText;
        initialText = "*\n*\n";
        set({
          text: "",
          cursor: [0, 0]
        });
        keystroke('i');
        editor.insertText(initialText);
        return ensure("escape g g", {
          text: initialText,
          cursor: [0, 0]
        });
      });
      describe("repeat insertion count times", function() {
        it("[case-i]", function() {
          return ensureInsertionCount('3 i', {
            insert: '=',
            text: "===*\n*\n",
            cursor: [0, 2]
          });
        });
        it("[case-o]", function() {
          return ensureInsertionCount('3 o', {
            insert: '=',
            text: "*\n=\n=\n=\n*\n",
            cursor: [3, 0]
          });
        });
        it("[case-O]", function() {
          return ensureInsertionCount('3 O', {
            insert: '=',
            text: "=\n=\n=\n*\n*\n",
            cursor: [2, 0]
          });
        });
        return describe("children of Change operation won't repeate insertion count times", function() {
          beforeEach(function() {
            set({
              text: "",
              cursor: [0, 0]
            });
            keystroke('i');
            editor.insertText('*');
            return ensure('escape g g', {
              text: '*',
              cursor: [0, 0]
            });
          });
          it("[case-c]", function() {
            return ensureInsertionCount('3 c w', {
              insert: '=',
              text: "=",
              cursor: [0, 0]
            });
          });
          it("[case-C]", function() {
            return ensureInsertionCount('3 C', {
              insert: '=',
              text: "=",
              cursor: [0, 0]
            });
          });
          it("[case-s]", function() {
            return ensureInsertionCount('3 s', {
              insert: '=',
              text: "=",
              cursor: [0, 0]
            });
          });
          return it("[case-S]", function() {
            return ensureInsertionCount('3 S', {
              insert: '=',
              text: "=",
              cursor: [0, 0]
            });
          });
        });
      });
      return describe("throttoling intertion count to 100 at maximum", function() {
        return it("insert 100 times at maximum even if big count was given", function() {
          set({
            text: ''
          });
          expect(editor.getLastBufferRow()).toBe(0);
          ensure('5 5 5 5 5 5 5 i', {
            mode: 'insert'
          });
          editor.insertText("a\n");
          ensure('escape', {
            mode: 'normal'
          });
          return expect(editor.getLastBufferRow()).toBe(101);
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9zcGVjL29wZXJhdG9yLWFjdGl2YXRlLWluc2VydC1tb2RlLXNwZWMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxNQUEwQixPQUFBLENBQVEsZUFBUixDQUExQixFQUFDLDZCQUFELEVBQWM7O0VBQ2QsUUFBQSxHQUFXLE9BQUEsQ0FBUSxpQkFBUjs7RUFDVixVQUFXLE9BQUEsQ0FBUSxNQUFSOztFQUVaLFFBQUEsQ0FBUyxvQ0FBVCxFQUErQyxTQUFBO0FBQzdDLFFBQUE7SUFBQSxPQUE4RSxFQUE5RSxFQUFDLGFBQUQsRUFBTSxnQkFBTixFQUFjLDBCQUFkLEVBQWdDLG1CQUFoQyxFQUEyQyxnQkFBM0MsRUFBbUQsdUJBQW5ELEVBQWtFO0lBRWxFLFVBQUEsQ0FBVyxTQUFBO2FBQ1QsV0FBQSxDQUFZLFNBQUMsS0FBRCxFQUFRLEdBQVI7UUFDVixRQUFBLEdBQVc7UUFDVix3QkFBRCxFQUFTO2VBQ1IsYUFBRCxFQUFNLG1CQUFOLEVBQWMseUJBQWQsRUFBeUIsdUNBQXpCLEVBQTZDO01BSG5DLENBQVo7SUFEUyxDQUFYO0lBTUEsUUFBQSxDQUFTLGtCQUFULEVBQTZCLFNBQUE7TUFDM0IsVUFBQSxDQUFXLFNBQUE7ZUFDVCxHQUFBLENBQUk7VUFBQSxJQUFBLEVBQU0sUUFBTjtVQUFnQixNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUF4QjtTQUFKO01BRFMsQ0FBWDtNQUdBLEVBQUEsQ0FBRywyREFBSCxFQUFnRSxTQUFBO2VBQzlELE1BQUEsQ0FBTyxHQUFQLEVBQ0U7VUFBQSxJQUFBLEVBQU0sUUFBTjtVQUNBLElBQUEsRUFBTSxPQUROO1VBRUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FGUjtVQUdBLFFBQUEsRUFBVTtZQUFBLEdBQUEsRUFBSztj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QUFSO2NBQWEsSUFBQSxFQUFNLEdBQW5CO2NBQXdCLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQWhDO2FBQTVCO1VBQUgsQ0FBZjtpQkFDQSxFQUFBLENBQUcsVUFBSCxFQUFlLFNBQUE7bUJBQUcsb0JBQUEsQ0FBcUIsS0FBckIsRUFBNEI7Y0FBQSxNQUFBLEVBQVEsR0FBUjtjQUFhLElBQUEsRUFBTSxHQUFuQjtjQUF3QixNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFoQzthQUE1QjtVQUFILENBQWY7UUFWMkUsQ0FBN0U7TUFMdUMsQ0FBekM7YUFpQkEsUUFBQSxDQUFTLCtDQUFULEVBQTBELFNBQUE7ZUFDeEQsRUFBQSxDQUFHLHlEQUFILEVBQThELFNBQUE7VUFDNUQsR0FBQSxDQUFJO1lBQUEsSUFBQSxFQUFNLEVBQU47V0FBSjtVQUNBLE1BQUEsQ0FBTyxNQUFNLENBQUMsZ0JBQVAsQ0FBQSxDQUFQLENBQWlDLENBQUMsSUFBbEMsQ0FBdUMsQ0FBdkM7VUFDQSxNQUFBLENBQU8saUJBQVAsRUFBMEI7WUFBQSxJQUFBLEVBQU0sUUFBTjtXQUExQjtVQUNBLE1BQU0sQ0FBQyxVQUFQLENBQWtCLEtBQWxCO1VBQ0EsTUFBQSxDQUFPLFFBQVAsRUFBaUI7WUFBQSxJQUFBLEVBQU0sUUFBTjtXQUFqQjtpQkFDQSxNQUFBLENBQU8sTUFBTSxDQUFDLGdCQUFQLENBQUEsQ0FBUCxDQUFpQyxDQUFDLElBQWxDLENBQXVDLEdBQXZDO1FBTjRELENBQTlEO01BRHdELENBQTFEO0lBOUJrQyxDQUFwQztFQXA2QjZDLENBQS9DO0FBSkEiLCJzb3VyY2VzQ29udGVudCI6WyJ7Z2V0VmltU3RhdGUsIGRpc3BhdGNofSA9IHJlcXVpcmUgJy4vc3BlYy1oZWxwZXInXG5zZXR0aW5ncyA9IHJlcXVpcmUgJy4uL2xpYi9zZXR0aW5ncydcbntpbnNwZWN0fSA9IHJlcXVpcmUgJ3V0aWwnXG5cbmRlc2NyaWJlIFwiT3BlcmF0b3IgQWN0aXZhdGVJbnNlcnRNb2RlIGZhbWlseVwiLCAtPlxuICBbc2V0LCBlbnN1cmUsIGJpbmRFbnN1cmVPcHRpb24sIGtleXN0cm9rZSwgZWRpdG9yLCBlZGl0b3JFbGVtZW50LCB2aW1TdGF0ZV0gPSBbXVxuXG4gIGJlZm9yZUVhY2ggLT5cbiAgICBnZXRWaW1TdGF0ZSAoc3RhdGUsIHZpbSkgLT5cbiAgICAgIHZpbVN0YXRlID0gc3RhdGVcbiAgICAgIHtlZGl0b3IsIGVkaXRvckVsZW1lbnR9ID0gdmltU3RhdGVcbiAgICAgIHtzZXQsIGVuc3VyZSwga2V5c3Ryb2tlLCBiaW5kRW5zdXJlT3B0aW9ufSA9IHZpbVxuXG4gIGRlc2NyaWJlIFwidGhlIHMga2V5YmluZGluZ1wiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNldCB0ZXh0OiAnMDEyMzQ1JywgY3Vyc29yOiBbMCwgMV1cblxuICAgIGl0IFwiZGVsZXRlcyB0aGUgY2hhcmFjdGVyIHRvIHRoZSByaWdodCBhbmQgZW50ZXJzIGluc2VydCBtb2RlXCIsIC0+XG4gICAgICBlbnN1cmUgJ3MnLFxuICAgICAgICBtb2RlOiAnaW5zZXJ0J1xuICAgICAgICB0ZXh0OiAnMDIzNDUnXG4gICAgICAgIGN1cnNvcjogWzAsIDFdXG4gICAgICAgIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiAnMSdcblxuICAgIGl0IFwiaXMgcmVwZWF0YWJsZVwiLCAtPlxuICAgICAgc2V0IGN1cnNvcjogWzAsIDBdXG4gICAgICBrZXlzdHJva2UgJzMgcydcbiAgICAgIGVkaXRvci5pbnNlcnRUZXh0ICdhYidcbiAgICAgIGVuc3VyZSAnZXNjYXBlJywgdGV4dDogJ2FiMzQ1J1xuICAgICAgc2V0IGN1cnNvcjogWzAsIDJdXG4gICAgICBlbnN1cmUgJy4nLCB0ZXh0OiAnYWJhYidcblxuICAgIGl0IFwiaXMgdW5kb2FibGVcIiwgLT5cbiAgICAgIHNldCBjdXJzb3I6IFswLCAwXVxuICAgICAga2V5c3Ryb2tlICczIHMnXG4gICAgICBlZGl0b3IuaW5zZXJ0VGV4dCAnYWInXG4gICAgICBlbnN1cmUgJ2VzY2FwZScsIHRleHQ6ICdhYjM0NSdcbiAgICAgIGVuc3VyZSAndScsIHRleHQ6ICcwMTIzNDUnLCBzZWxlY3RlZFRleHQ6ICcnXG5cbiAgICBkZXNjcmliZSBcImluIHZpc3VhbCBtb2RlXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIGtleXN0cm9rZSAndiBsIHMnXG5cbiAgICAgIGl0IFwiZGVsZXRlcyB0aGUgc2VsZWN0ZWQgY2hhcmFjdGVycyBhbmQgZW50ZXJzIGluc2VydCBtb2RlXCIsIC0+XG4gICAgICAgIGVuc3VyZVxuICAgICAgICAgIG1vZGU6ICdpbnNlcnQnXG4gICAgICAgICAgdGV4dDogJzAzNDUnXG4gICAgICAgICAgY3Vyc29yOiBbMCwgMV1cbiAgICAgICAgICByZWdpc3RlcjogJ1wiJzogdGV4dDogJzEyJ1xuXG4gIGRlc2NyaWJlIFwidGhlIFMga2V5YmluZGluZ1wiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNldFxuICAgICAgICB0ZXh0OiBcIjEyMzQ1XFxuYWJjZGVcXG5BQkNERVwiXG4gICAgICAgIGN1cnNvcjogWzEsIDNdXG5cbiAgICBpdCBcImRlbGV0ZXMgdGhlIGVudGlyZSBsaW5lIGFuZCBlbnRlcnMgaW5zZXJ0IG1vZGVcIiwgLT5cbiAgICAgIGVuc3VyZSAnUycsXG4gICAgICAgIG1vZGU6ICdpbnNlcnQnXG4gICAgICAgIHRleHQ6IFwiMTIzNDVcXG5cXG5BQkNERVwiXG4gICAgICAgIHJlZ2lzdGVyOiB7J1wiJzogdGV4dDogJ2FiY2RlXFxuJywgdHlwZTogJ2xpbmV3aXNlJ31cblxuICAgIGl0IFwiaXMgcmVwZWF0YWJsZVwiLCAtPlxuICAgICAga2V5c3Ryb2tlICdTJ1xuICAgICAgZWRpdG9yLmluc2VydFRleHQgJ2FiYydcbiAgICAgIGVuc3VyZSAnZXNjYXBlJywgdGV4dDogJzEyMzQ1XFxuYWJjXFxuQUJDREUnXG4gICAgICBzZXQgY3Vyc29yOiBbMiwgM11cbiAgICAgIGVuc3VyZSAnLicsIHRleHQ6ICcxMjM0NVxcbmFiY1xcbmFiYydcblxuICAgIGl0IFwiaXMgdW5kb2FibGVcIiwgLT5cbiAgICAgIGtleXN0cm9rZSAnUydcbiAgICAgIGVkaXRvci5pbnNlcnRUZXh0ICdhYmMnXG4gICAgICBlbnN1cmUgJ2VzY2FwZScsIHRleHQ6ICcxMjM0NVxcbmFiY1xcbkFCQ0RFJ1xuICAgICAgZW5zdXJlICd1JywgdGV4dDogXCIxMjM0NVxcbmFiY2RlXFxuQUJDREVcIiwgc2VsZWN0ZWRUZXh0OiAnJ1xuXG4gICAgIyBIZXJlIGlzIG9yaWdpbmFsIHNwZWMgSSBiZWxpZXZlIGl0cyBub3QgY29ycmVjdCwgaWYgaXQgc2F5cyAnd29ya3MnXG4gICAgIyB0ZXh0IHJlc3VsdCBzaG91bGQgYmUgJ1xcbicgc2luY2UgUyBkZWxldGUgY3VycmVudCBsaW5lLlxuICAgICMgSXRzIG9yaWduYWxseSBhZGRlZCBpbiBmb2xsb3dpbmcgY29tbWl0LCBhcyBmaXggb2YgUyhmcm9tIGRlc2NyaXB0aW9uKS5cbiAgICAjIEJ1dCBvcmlnaW5hbCBTdWJzdGl0dXRlTGluZSByZXBsYWNlZCB3aXRoIENoYW5nZSBhbmQgTW92ZVRvUmVsYXRpdmVMaW5lIGNvbWJvLlxuICAgICMgSSBiZWxpZXZlIHRoaXMgc3BlYyBzaG91bGQgaGF2ZSBiZWVuIGZhaWxlZCBhdCB0aGF0IHRpbWUsIGJ1dCBoYXZlbnQnLlxuICAgICMgaHR0cHM6Ly9naXRodWIuY29tL2F0b20vdmltLW1vZGUvY29tbWl0LzZhY2ZmZDI1NTllNTZmN2MxOGE0ZDc2NmYwYWQ5MmM5ZWQ2MjEyYWVcbiAgICAjXG4gICAgIyBpdCBcIndvcmtzIHdoZW4gdGhlIGN1cnNvcidzIGdvYWwgY29sdW1uIGlzIGdyZWF0ZXIgdGhhbiBpdHMgY3VycmVudCBjb2x1bW5cIiwgLT5cbiAgICAjICAgc2V0IHRleHQ6IFwiXFxuMTIzNDVcIiwgY3Vyc29yOiBbMSwgSW5maW5pdHldXG4gICAgIyAgIGVuc3VyZSAna1MnLCB0ZXh0OiAnXFxuMTIzNDUnXG5cbiAgICBpdCBcIndvcmtzIHdoZW4gdGhlIGN1cnNvcidzIGdvYWwgY29sdW1uIGlzIGdyZWF0ZXIgdGhhbiBpdHMgY3VycmVudCBjb2x1bW5cIiwgLT5cbiAgICAgIHNldCB0ZXh0OiBcIlxcbjEyMzQ1XCIsIGN1cnNvcjogWzEsIEluZmluaXR5XVxuICAgICAgIyBTaG91bGQgYmUgaGVyZSwgYnV0IEkgY29tbWVudGVkIG91dCBiZWZvcmUgSSBoYXZlIGNvbmZpZGVuY2UuXG4gICAgICAjIGVuc3VyZSAna1MnLCB0ZXh0OiAnXFxuJ1xuICAgICAgIyBGb2xvd2luZyBsaW5lIGluY2x1ZGUgQnVnIGliZWxpZXZlLlxuICAgICAgZW5zdXJlICdrIFMnLCB0ZXh0OiAnXFxuMTIzNDUnXG4gICAgIyBDYW4ndCBiZSB0ZXN0ZWQgd2l0aG91dCBzZXR0aW5nIGdyYW1tYXIgb2YgdGVzdCBidWZmZXJcbiAgICB4aXQgXCJyZXNwZWN0cyBpbmRlbnRhdGlvblwiLCAtPlxuXG4gIGRlc2NyaWJlIFwidGhlIGMga2V5YmluZGluZ1wiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNldCB0ZXh0OiBcIlwiXCJcbiAgICAgICAgMTIzNDVcbiAgICAgICAgYWJjZGVcbiAgICAgICAgQUJDREVcbiAgICAgICAgXCJcIlwiXG5cbiAgICBkZXNjcmliZSBcIndoZW4gZm9sbG93ZWQgYnkgYSBjXCIsIC0+XG4gICAgICBkZXNjcmliZSBcIndpdGggYXV0b2luZGVudFwiLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgc2V0IHRleHQ6IFwiMTIzNDVcXG4gIGFiY2RlXFxuQUJDREVcXG5cIlxuICAgICAgICAgIHNldCBjdXJzb3I6IFsxLCAxXVxuICAgICAgICAgIHNweU9uKGVkaXRvciwgJ3Nob3VsZEF1dG9JbmRlbnQnKS5hbmRSZXR1cm4odHJ1ZSlcbiAgICAgICAgICBzcHlPbihlZGl0b3IsICdhdXRvSW5kZW50QnVmZmVyUm93JykuYW5kQ2FsbEZha2UgKGxpbmUpIC0+XG4gICAgICAgICAgICBlZGl0b3IuaW5kZW50KClcbiAgICAgICAgICBzcHlPbihlZGl0b3IubGFuZ3VhZ2VNb2RlLCAnc3VnZ2VzdGVkSW5kZW50Rm9yTGluZUF0QnVmZmVyUm93JykuYW5kQ2FsbEZha2UgLT4gMVxuXG4gICAgICAgIGl0IFwiZGVsZXRlcyB0aGUgY3VycmVudCBsaW5lIGFuZCBlbnRlcnMgaW5zZXJ0IG1vZGVcIiwgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMSwgMV1cbiAgICAgICAgICBlbnN1cmUgJ2MgYycsXG4gICAgICAgICAgICB0ZXh0OiBcIjEyMzQ1XFxuICBcXG5BQkNERVxcblwiXG4gICAgICAgICAgICBjdXJzb3I6IFsxLCAyXVxuICAgICAgICAgICAgbW9kZTogJ2luc2VydCdcblxuICAgICAgICBpdCBcImlzIHJlcGVhdGFibGVcIiwgLT5cbiAgICAgICAgICBrZXlzdHJva2UgJ2MgYydcbiAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dChcImFiY1wiKVxuICAgICAgICAgIGVuc3VyZSAnZXNjYXBlJywgdGV4dDogXCIxMjM0NVxcbiAgYWJjXFxuQUJDREVcXG5cIlxuICAgICAgICAgIHNldCBjdXJzb3I6IFsyLCAzXVxuICAgICAgICAgIGVuc3VyZSAnLicsIHRleHQ6IFwiMTIzNDVcXG4gIGFiY1xcbiAgYWJjXFxuXCJcblxuICAgICAgICBpdCBcImlzIHVuZG9hYmxlXCIsIC0+XG4gICAgICAgICAga2V5c3Ryb2tlICdjIGMnXG4gICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoXCJhYmNcIilcbiAgICAgICAgICBlbnN1cmUgJ2VzY2FwZScsIHRleHQ6IFwiMTIzNDVcXG4gIGFiY1xcbkFCQ0RFXFxuXCJcbiAgICAgICAgICBlbnN1cmUgJ3UnLCB0ZXh0OiBcIjEyMzQ1XFxuICBhYmNkZVxcbkFCQ0RFXFxuXCIsIHNlbGVjdGVkVGV4dDogJydcblxuICAgICAgZGVzY3JpYmUgXCJ3aGVuIHRoZSBjdXJzb3IgaXMgb24gdGhlIGxhc3QgbGluZVwiLCAtPlxuICAgICAgICBpdCBcImRlbGV0ZXMgdGhlIGxpbmUncyBjb250ZW50IGFuZCBlbnRlcnMgaW5zZXJ0IG1vZGUgb24gdGhlIGxhc3QgbGluZVwiLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFsyLCAxXVxuICAgICAgICAgIGVuc3VyZSAnYyBjJyxcbiAgICAgICAgICAgIHRleHQ6IFwiMTIzNDVcXG5hYmNkZVxcblwiXG4gICAgICAgICAgICBjdXJzb3I6IFsyLCAwXVxuICAgICAgICAgICAgbW9kZTogJ2luc2VydCdcblxuICAgICAgZGVzY3JpYmUgXCJ3aGVuIHRoZSBjdXJzb3IgaXMgb24gdGhlIG9ubHkgbGluZVwiLCAtPlxuICAgICAgICBpdCBcImRlbGV0ZXMgdGhlIGxpbmUncyBjb250ZW50IGFuZCBlbnRlcnMgaW5zZXJ0IG1vZGVcIiwgLT5cbiAgICAgICAgICBzZXQgdGV4dDogXCIxMjM0NVwiLCBjdXJzb3I6IFswLCAyXVxuICAgICAgICAgIGVuc3VyZSAnYyBjJyxcbiAgICAgICAgICAgIHRleHQ6IFwiXCJcbiAgICAgICAgICAgIGN1cnNvcjogWzAsIDBdXG4gICAgICAgICAgICBtb2RlOiAnaW5zZXJ0J1xuXG4gICAgZGVzY3JpYmUgXCJ3aGVuIGZvbGxvd2VkIGJ5IGkgd1wiLCAtPlxuICAgICAgaXQgXCJ1bmRvJ3MgYW5kIHJlZG8ncyBjb21wbGV0ZWx5XCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFsxLCAxXVxuICAgICAgICBlbnN1cmUgJ2MgaSB3JyxcbiAgICAgICAgICB0ZXh0OiBcIjEyMzQ1XFxuXFxuQUJDREVcIlxuICAgICAgICAgIGN1cnNvcjogWzEsIDBdXG4gICAgICAgICAgbW9kZTogJ2luc2VydCdcblxuICAgICAgICAjIEp1c3QgY2Fubm90IGdldCBcInR5cGluZ1wiIHRvIHdvcmsgY29ycmVjdGx5IGluIHRlc3QuXG4gICAgICAgIHNldCB0ZXh0OiBcIjEyMzQ1XFxuZmdcXG5BQkNERVwiXG4gICAgICAgIGVuc3VyZSAnZXNjYXBlJyxcbiAgICAgICAgICB0ZXh0OiBcIjEyMzQ1XFxuZmdcXG5BQkNERVwiXG4gICAgICAgICAgbW9kZTogJ25vcm1hbCdcbiAgICAgICAgZW5zdXJlICd1JywgdGV4dDogXCIxMjM0NVxcbmFiY2RlXFxuQUJDREVcIlxuICAgICAgICBlbnN1cmUgJ2N0cmwtcicsIHRleHQ6IFwiMTIzNDVcXG5mZ1xcbkFCQ0RFXCJcblxuICAgICAgaXQgXCJyZXBlYXRhYmxlXCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFsxLCAxXVxuICAgICAgICBlbnN1cmUgJ2MgaSB3JyxcbiAgICAgICAgICB0ZXh0OiBcIjEyMzQ1XFxuXFxuQUJDREVcIlxuICAgICAgICAgIGN1cnNvcjogWzEsIDBdXG4gICAgICAgICAgbW9kZTogJ2luc2VydCdcblxuICAgICAgICBlbnN1cmUgJ2VzY2FwZSBqIC4nLFxuICAgICAgICAgIHRleHQ6IFwiMTIzNDVcXG5cXG5cIlxuICAgICAgICAgIGN1cnNvcjogWzIsIDBdXG4gICAgICAgICAgbW9kZTogJ25vcm1hbCdcblxuICAgIGRlc2NyaWJlIFwid2hlbiBmb2xsb3dlZCBieSBhIHdcIiwgLT5cbiAgICAgIGl0IFwiY2hhbmdlcyB0aGUgd29yZFwiLCAtPlxuICAgICAgICBzZXQgdGV4dDogXCJ3b3JkMSB3b3JkMiB3b3JkM1wiLCBjdXJzb3I6IFswLCA3XVxuICAgICAgICBlbnN1cmUgJ2MgdyBlc2NhcGUnLCB0ZXh0OiBcIndvcmQxIHcgd29yZDNcIlxuXG4gICAgZGVzY3JpYmUgXCJ3aGVuIGZvbGxvd2VkIGJ5IGEgR1wiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBvcmlnaW5hbFRleHQgPSBcIjEyMzQ1XFxuYWJjZGVcXG5BQkNERVxcblwiXG4gICAgICAgIHNldCB0ZXh0OiBvcmlnaW5hbFRleHRcblxuICAgICAgZGVzY3JpYmUgXCJvbiB0aGUgYmVnaW5uaW5nIG9mIHRoZSBzZWNvbmQgbGluZVwiLCAtPlxuICAgICAgICBpdCBcImRlbGV0ZXMgdGhlIGJvdHRvbSB0d28gbGluZXNcIiwgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMSwgMF1cbiAgICAgICAgICBlbnN1cmUgJ2MgRyBlc2NhcGUnLCB0ZXh0OiAnMTIzNDVcXG5cXG4nXG5cbiAgICAgIGRlc2NyaWJlIFwib24gdGhlIG1pZGRsZSBvZiB0aGUgc2Vjb25kIGxpbmVcIiwgLT5cbiAgICAgICAgaXQgXCJkZWxldGVzIHRoZSBib3R0b20gdHdvIGxpbmVzXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzEsIDJdXG4gICAgICAgICAgZW5zdXJlICdjIEcgZXNjYXBlJywgdGV4dDogJzEyMzQ1XFxuXFxuJ1xuXG4gICAgZGVzY3JpYmUgXCJ3aGVuIGZvbGxvd2VkIGJ5IGEgZ290byBsaW5lIEdcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0IHRleHQ6IFwiMTIzNDVcXG5hYmNkZVxcbkFCQ0RFXCJcblxuICAgICAgZGVzY3JpYmUgXCJvbiB0aGUgYmVnaW5uaW5nIG9mIHRoZSBzZWNvbmQgbGluZVwiLCAtPlxuICAgICAgICBpdCBcImRlbGV0ZXMgYWxsIHRoZSB0ZXh0IG9uIHRoZSBsaW5lXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzEsIDBdXG4gICAgICAgICAgZW5zdXJlICdjIDIgRyBlc2NhcGUnLCB0ZXh0OiAnMTIzNDVcXG5cXG5BQkNERSdcblxuICAgICAgZGVzY3JpYmUgXCJvbiB0aGUgbWlkZGxlIG9mIHRoZSBzZWNvbmQgbGluZVwiLCAtPlxuICAgICAgICBpdCBcImRlbGV0ZXMgYWxsIHRoZSB0ZXh0IG9uIHRoZSBsaW5lXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzEsIDJdXG4gICAgICAgICAgZW5zdXJlICdjIDIgRyBlc2NhcGUnLCB0ZXh0OiAnMTIzNDVcXG5cXG5BQkNERSdcblxuICBkZXNjcmliZSBcInRoZSBDIGtleWJpbmRpbmdcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXRcbiAgICAgICAgY3Vyc29yOiBbMSwgMl1cbiAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgIDAhISEhISFcbiAgICAgICAgMSEhISEhIVxuICAgICAgICAyISEhISEhXG4gICAgICAgIDMhISEhISFcXG5cbiAgICAgICAgXCJcIlwiXG4gICAgZGVzY3JpYmUgXCJpbiBub3JtYWwtbW9kZVwiLCAtPlxuICAgICAgaXQgXCJkZWxldGVzIHRpbGwgdGhlIEVPTCB0aGVuIGVudGVyIGluc2VydC1tb2RlXCIsIC0+XG4gICAgICAgIGVuc3VyZSAnQycsXG4gICAgICAgICAgY3Vyc29yOiBbMSwgMl1cbiAgICAgICAgICBtb2RlOiAnaW5zZXJ0J1xuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgMCEhISEhIVxuICAgICAgICAgICAgMSFcbiAgICAgICAgICAgIDIhISEhISFcbiAgICAgICAgICAgIDMhISEhISFcXG5cbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgZGVzY3JpYmUgXCJpbiB2aXN1YWwtbW9kZS5jaGFyYWN0ZXJ3aXNlXCIsIC0+XG4gICAgICBpdCBcImRlbGV0ZSB3aG9sZSBsaW5lcyBhbmQgZW50ZXIgaW5zZXJ0LW1vZGVcIiwgLT5cbiAgICAgICAgZW5zdXJlICd2IGogQycsXG4gICAgICAgICAgY3Vyc29yOiBbMSwgMF1cbiAgICAgICAgICBtb2RlOiAnaW5zZXJ0J1xuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgMCEhISEhIVxuXG4gICAgICAgICAgICAzISEhISEhXFxuXG4gICAgICAgICAgICBcIlwiXCJcblxuICBkZXNjcmliZSBcImRvbnRVcGRhdGVSZWdpc3Rlck9uQ2hhbmdlT3JTdWJzdGl0dXRlIHNldHRpbmdzXCIsIC0+XG4gICAgcmVzdWx0VGV4dEMgPSBudWxsXG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2V0XG4gICAgICAgIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiAnaW5pdGlhbC12YWx1ZSdcbiAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAwYWJjXG4gICAgICAgIDF8ZGVmXG4gICAgICAgIDJnaGlcXG5cbiAgICAgICAgXCJcIlwiXG4gICAgICByZXN1bHRUZXh0QyA9XG4gICAgICAgIGNsOiBcIlwiXCJcbiAgICAgICAgICAwYWJjXG4gICAgICAgICAgMXxlZlxuICAgICAgICAgIDJnaGlcXG5cbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgQzogXCJcIlwiXG4gICAgICAgICAgMGFiY1xuICAgICAgICAgIDF8XG4gICAgICAgICAgMmdoaVxcblxuICAgICAgICAgIFwiXCJcIlxuICAgICAgICBzOiBcIlwiXCJcbiAgICAgICAgICAwYWJjXG4gICAgICAgICAgMXxlZlxuICAgICAgICAgIDJnaGlcXG5cbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgUzogXCJcIlwiXG4gICAgICAgICAgMGFiY1xuICAgICAgICAgIHxcbiAgICAgICAgICAyZ2hpXFxuXG4gICAgICAgICAgXCJcIlwiXG4gICAgZGVzY3JpYmUgXCJ3aGVuIGRvbnRVcGRhdGVSZWdpc3Rlck9uQ2hhbmdlT3JTdWJzdGl0dXRlPWZhbHNlXCIsIC0+XG4gICAgICBlbnN1cmVfID0gbnVsbFxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBlbnN1cmVfID0gYmluZEVuc3VyZU9wdGlvbihtb2RlOiAnaW5zZXJ0JylcbiAgICAgICAgc2V0dGluZ3Muc2V0KFwiZG9udFVwZGF0ZVJlZ2lzdGVyT25DaGFuZ2VPclN1YnN0aXR1dGVcIiwgZmFsc2UpXG4gICAgICBpdCAnYyBtdXRhdGUgcmVnaXN0ZXInLCAtPiBlbnN1cmVfICdjIGwnLCB0ZXh0QzogcmVzdWx0VGV4dEMuY2wsIHJlZ2lzdGVyOiB7J1wiJzogdGV4dDogJ2QnfVxuICAgICAgaXQgJ0MgbXV0YXRlIHJlZ2lzdGVyJywgLT4gZW5zdXJlXyAnQycsIHRleHRDOiByZXN1bHRUZXh0Qy5DLCByZWdpc3RlcjogeydcIic6IHRleHQ6ICdkZWYnfVxuICAgICAgaXQgJ3MgbXV0YXRlIHJlZ2lzdGVyJywgLT4gZW5zdXJlXyAncycsIHRleHRDOiByZXN1bHRUZXh0Qy5zLCByZWdpc3RlcjogeydcIic6IHRleHQ6ICdkJ31cbiAgICAgIGl0ICdTIG11dGF0ZSByZWdpc3RlcicsIC0+IGVuc3VyZV8gJ1MnLCB0ZXh0QzogcmVzdWx0VGV4dEMuUywgcmVnaXN0ZXI6IHsnXCInOiB0ZXh0OiAnMWRlZlxcbid9XG4gICAgZGVzY3JpYmUgXCJ3aGVuIGRvbnRVcGRhdGVSZWdpc3Rlck9uQ2hhbmdlT3JTdWJzdGl0dXRlPXRydWVcIiwgLT5cbiAgICAgIGVuc3VyZV8gPSBudWxsXG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIGVuc3VyZV8gPSBiaW5kRW5zdXJlT3B0aW9uKG1vZGU6ICdpbnNlcnQnLCByZWdpc3RlcjogeydcIic6IHRleHQ6ICdpbml0aWFsLXZhbHVlJ30pXG4gICAgICAgIHNldHRpbmdzLnNldChcImRvbnRVcGRhdGVSZWdpc3Rlck9uQ2hhbmdlT3JTdWJzdGl0dXRlXCIsIHRydWUpXG4gICAgICBpdCAnYyBtdXRhdGUgcmVnaXN0ZXInLCAtPiBlbnN1cmVfICdjIGwnLCB0ZXh0QzogcmVzdWx0VGV4dEMuY2xcbiAgICAgIGl0ICdDIG11dGF0ZSByZWdpc3RlcicsIC0+IGVuc3VyZV8gJ0MnLCB0ZXh0QzogcmVzdWx0VGV4dEMuQ1xuICAgICAgaXQgJ3MgbXV0YXRlIHJlZ2lzdGVyJywgLT4gZW5zdXJlXyAncycsIHRleHRDOiByZXN1bHRUZXh0Qy5zXG4gICAgICBpdCAnUyBtdXRhdGUgcmVnaXN0ZXInLCAtPiBlbnN1cmVfICdTJywgdGV4dEM6IHJlc3VsdFRleHRDLlNcblxuICBkZXNjcmliZSBcInRoZSBPIGtleWJpbmRpbmdcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzcHlPbihlZGl0b3IsICdzaG91bGRBdXRvSW5kZW50JykuYW5kUmV0dXJuKHRydWUpXG4gICAgICBzcHlPbihlZGl0b3IsICdhdXRvSW5kZW50QnVmZmVyUm93JykuYW5kQ2FsbEZha2UgKGxpbmUpIC0+XG4gICAgICAgIGVkaXRvci5pbmRlbnQoKVxuXG4gICAgICBzZXRcbiAgICAgICAgdGV4dENfOiBcIlwiXCJcbiAgICAgICAgX19hYmNcbiAgICAgICAgX3xfMDEyXFxuXG4gICAgICAgIFwiXCJcIlxuXG4gICAgaXQgXCJzd2l0Y2hlcyB0byBpbnNlcnQgYW5kIGFkZHMgYSBuZXdsaW5lIGFib3ZlIHRoZSBjdXJyZW50IG9uZVwiLCAtPlxuICAgICAga2V5c3Ryb2tlICdPJ1xuICAgICAgZW5zdXJlXG4gICAgICAgIHRleHRDXzogXCJcIlwiXG4gICAgICAgIF9fYWJjXG4gICAgICAgIF9ffFxuICAgICAgICBfXzAxMlxcblxuICAgICAgICBcIlwiXCJcbiAgICAgICAgbW9kZTogJ2luc2VydCdcblxuICAgIGl0IFwiaXMgcmVwZWF0YWJsZVwiLCAtPlxuICAgICAgc2V0XG4gICAgICAgIHRleHRDXzogXCJcIlwiXG4gICAgICAgICAgX19hYmNcbiAgICAgICAgICBfX3wwMTJcbiAgICAgICAgICBfX19fNHNwYWNlc1xcblxuICAgICAgICAgIFwiXCJcIlxuICAgICAgIyBzZXRcbiAgICAgICMgICB0ZXh0OiBcIiAgYWJjXFxuICAwMTJcXG4gICAgNHNwYWNlc1xcblwiLCBjdXJzb3I6IFsxLCAxXVxuICAgICAga2V5c3Ryb2tlICdPJ1xuICAgICAgZWRpdG9yLmluc2VydFRleHQgXCJkZWZcIlxuICAgICAgZW5zdXJlICdlc2NhcGUnLFxuICAgICAgICB0ZXh0Q186IFwiXCJcIlxuICAgICAgICAgIF9fYWJjXG4gICAgICAgICAgX19kZXxmXG4gICAgICAgICAgX18wMTJcbiAgICAgICAgICBfX19fNHNwYWNlc1xcblxuICAgICAgICAgIFwiXCJcIlxuICAgICAgZW5zdXJlICcuJyxcbiAgICAgICAgdGV4dENfOiBcIlwiXCJcbiAgICAgICAgX19hYmNcbiAgICAgICAgX19kZXxmXG4gICAgICAgIF9fZGVmXG4gICAgICAgIF9fMDEyXG4gICAgICAgIF9fX180c3BhY2VzXFxuXG4gICAgICAgIFwiXCJcIlxuICAgICAgc2V0IGN1cnNvcjogWzQsIDBdXG4gICAgICBlbnN1cmUgJy4nLFxuICAgICAgICB0ZXh0Q186IFwiXCJcIlxuICAgICAgICBfX2FiY1xuICAgICAgICBfX2RlZlxuICAgICAgICBfX2RlZlxuICAgICAgICBfXzAxMlxuICAgICAgICBfX19fZGV8ZlxuICAgICAgICBfX19fNHNwYWNlc1xcblxuICAgICAgICBcIlwiXCJcblxuICAgIGl0IFwiaXMgdW5kb2FibGVcIiwgLT5cbiAgICAgIGtleXN0cm9rZSAnTydcbiAgICAgIGVkaXRvci5pbnNlcnRUZXh0IFwiZGVmXCJcbiAgICAgIGVuc3VyZSAnZXNjYXBlJyxcbiAgICAgICAgdGV4dENfOiBcIlwiXCJcbiAgICAgICAgX19hYmNcbiAgICAgICAgX19kZWZcbiAgICAgICAgX18wMTJcXG5cbiAgICAgICAgXCJcIlwiXG4gICAgICBlbnN1cmUgJ3UnLFxuICAgICAgICB0ZXh0Q186IFwiXCJcIlxuICAgICAgICBfX2FiY1xuICAgICAgICBfXzAxMlxcblxuICAgICAgICBcIlwiXCJcblxuICBkZXNjcmliZSBcInRoZSBvIGtleWJpbmRpbmdcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzcHlPbihlZGl0b3IsICdzaG91bGRBdXRvSW5kZW50JykuYW5kUmV0dXJuKHRydWUpXG4gICAgICBzcHlPbihlZGl0b3IsICdhdXRvSW5kZW50QnVmZmVyUm93JykuYW5kQ2FsbEZha2UgKGxpbmUpIC0+XG4gICAgICAgIGVkaXRvci5pbmRlbnQoKVxuXG4gICAgICBzZXQgdGV4dDogXCJhYmNcXG4gIDAxMlxcblwiLCBjdXJzb3I6IFsxLCAyXVxuXG4gICAgaXQgXCJzd2l0Y2hlcyB0byBpbnNlcnQgYW5kIGFkZHMgYSBuZXdsaW5lIGFib3ZlIHRoZSBjdXJyZW50IG9uZVwiLCAtPlxuICAgICAgZW5zdXJlICdvJyxcbiAgICAgICAgdGV4dDogXCJhYmNcXG4gIDAxMlxcbiAgXFxuXCJcbiAgICAgICAgbW9kZTogJ2luc2VydCdcbiAgICAgICAgY3Vyc29yOiBbMiwgMl1cblxuICAgICMgVGhpcyB3b3JrcyBpbiBwcmFjdGljZSwgYnV0IHRoZSBlZGl0b3IgZG9lc24ndCByZXNwZWN0IHRoZSBpbmRlbnRhdGlvblxuICAgICMgcnVsZXMgd2l0aG91dCBhIHN5bnRheCBncmFtbWFyLiBOZWVkIHRvIHNldCB0aGUgZWRpdG9yJ3MgZ3JhbW1hclxuICAgICMgdG8gZml4IGl0LlxuICAgIHhpdCBcImlzIHJlcGVhdGFibGVcIiwgLT5cbiAgICAgIHNldCB0ZXh0OiBcIiAgYWJjXFxuICAwMTJcXG4gICAgNHNwYWNlc1xcblwiLCBjdXJzb3I6IFsxLCAxXVxuICAgICAga2V5c3Ryb2tlICdvJ1xuICAgICAgZWRpdG9yLmluc2VydFRleHQgXCJkZWZcIlxuICAgICAgZW5zdXJlICdlc2NhcGUnLCB0ZXh0OiBcIiAgYWJjXFxuICAwMTJcXG4gIGRlZlxcbiAgICA0c3BhY2VzXFxuXCJcbiAgICAgIGVuc3VyZSAnLicsIHRleHQ6IFwiICBhYmNcXG4gIDAxMlxcbiAgZGVmXFxuICBkZWZcXG4gICAgNHNwYWNlc1xcblwiXG4gICAgICBzZXQgY3Vyc29yOiBbNCwgMV1cbiAgICAgIGVuc3VyZSAnLicsIHRleHQ6IFwiICBhYmNcXG4gIGRlZlxcbiAgZGVmXFxuICAwMTJcXG4gICAgNHNwYWNlc1xcbiAgICBkZWZcXG5cIlxuXG4gICAgaXQgXCJpcyB1bmRvYWJsZVwiLCAtPlxuICAgICAga2V5c3Ryb2tlICdvJ1xuICAgICAgZWRpdG9yLmluc2VydFRleHQgXCJkZWZcIlxuICAgICAgZW5zdXJlICdlc2NhcGUnLCB0ZXh0OiBcImFiY1xcbiAgMDEyXFxuICBkZWZcXG5cIlxuICAgICAgZW5zdXJlICd1JywgdGV4dDogXCJhYmNcXG4gIDAxMlxcblwiXG5cbiAgZGVzY3JpYmUgXCJ1bmRvL3JlZG8gZm9yIGBvYCBhbmQgYE9gXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2V0IHRleHRDOiBcIi0tLS18PT1cIlxuICAgIGl0IFwidW5kbyBhbmQgcmVkbyBieSBrZWVwaW5nIGN1cnNvciBhdCBvIHN0YXJ0ZWQgcG9zaXRpb25cIiwgLT5cbiAgICAgIGVuc3VyZSAnbycsIG1vZGU6ICdpbnNlcnQnXG4gICAgICBlZGl0b3IuaW5zZXJ0VGV4dCgnQEAnKVxuICAgICAgZW5zdXJlIFwiZXNjYXBlXCIsIHRleHRDOiBcIi0tLS09PVxcbkB8QFwiXG4gICAgICBlbnN1cmUgXCJ1XCIsIHRleHRDOiBcIi0tLS18PT1cIlxuICAgICAgZW5zdXJlIFwiY3RybC1yXCIsIHRleHRDOiBcIi0tLS18PT1cXG5AQFwiXG4gICAgaXQgXCJ1bmRvIGFuZCByZWRvIGJ5IGtlZXBpbmcgY3Vyc29yIGF0IE8gc3RhcnRlZCBwb3NpdGlvblwiLCAtPlxuICAgICAgZW5zdXJlICdPJywgbW9kZTogJ2luc2VydCdcbiAgICAgIGVkaXRvci5pbnNlcnRUZXh0KCdAQCcpXG4gICAgICBlbnN1cmUgXCJlc2NhcGVcIiwgdGV4dEM6IFwiQHxAXFxuLS0tLT09XCJcbiAgICAgIGVuc3VyZSBcInVcIiwgdGV4dEM6IFwiLS0tLXw9PVwiXG4gICAgICBlbnN1cmUgXCJjdHJsLXJcIiwgdGV4dEM6IFwiQEBcXG4tLS0tfD09XCJcblxuICBkZXNjcmliZSBcInRoZSBhIGtleWJpbmRpbmdcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXQgdGV4dDogXCIwMTJcXG5cIlxuXG4gICAgZGVzY3JpYmUgXCJhdCB0aGUgYmVnaW5uaW5nIG9mIHRoZSBsaW5lXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFswLCAwXVxuICAgICAgICBrZXlzdHJva2UgJ2EnXG5cbiAgICAgIGl0IFwic3dpdGNoZXMgdG8gaW5zZXJ0IG1vZGUgYW5kIHNoaWZ0cyB0byB0aGUgcmlnaHRcIiwgLT5cbiAgICAgICAgZW5zdXJlIGN1cnNvcjogWzAsIDFdLCBtb2RlOiAnaW5zZXJ0J1xuXG4gICAgZGVzY3JpYmUgXCJhdCB0aGUgZW5kIG9mIHRoZSBsaW5lXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFswLCAzXVxuICAgICAgICBrZXlzdHJva2UgJ2EnXG5cbiAgICAgIGl0IFwiZG9lc24ndCBsaW5ld3JhcFwiLCAtPlxuICAgICAgICBlbnN1cmUgY3Vyc29yOiBbMCwgM11cblxuICBkZXNjcmliZSBcInRoZSBBIGtleWJpbmRpbmdcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXQgdGV4dDogXCIxMVxcbjIyXFxuXCJcblxuICAgIGRlc2NyaWJlIFwiYXQgdGhlIGJlZ2lubmluZyBvZiBhIGxpbmVcIiwgLT5cbiAgICAgIGl0IFwic3dpdGNoZXMgdG8gaW5zZXJ0IG1vZGUgYXQgdGhlIGVuZCBvZiB0aGUgbGluZVwiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgZW5zdXJlICdBJyxcbiAgICAgICAgICBtb2RlOiAnaW5zZXJ0J1xuICAgICAgICAgIGN1cnNvcjogWzAsIDJdXG5cbiAgICAgIGl0IFwicmVwZWF0cyBhbHdheXMgYXMgaW5zZXJ0IGF0IHRoZSBlbmQgb2YgdGhlIGxpbmVcIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzAsIDBdXG4gICAgICAgIGtleXN0cm9rZSAnQSdcbiAgICAgICAgZWRpdG9yLmluc2VydFRleHQoXCJhYmNcIilcbiAgICAgICAga2V5c3Ryb2tlICdlc2NhcGUnXG4gICAgICAgIHNldCBjdXJzb3I6IFsxLCAwXVxuXG4gICAgICAgIGVuc3VyZSAnLicsXG4gICAgICAgICAgdGV4dDogXCIxMWFiY1xcbjIyYWJjXFxuXCJcbiAgICAgICAgICBtb2RlOiAnbm9ybWFsJ1xuICAgICAgICAgIGN1cnNvcjogWzEsIDRdXG5cbiAgZGVzY3JpYmUgXCJ0aGUgSSBrZXliaW5kaW5nXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2V0XG4gICAgICAgIHRleHRfOiBcIlwiXCJcbiAgICAgICAgX18wOiAzNDU2IDg5MFxuICAgICAgICAxOiAzNDU2IDg5MFxuICAgICAgICBfXzI6IDM0NTYgODkwXG4gICAgICAgIF9fX18zOiAzNDU2IDg5MFxuICAgICAgICBcIlwiXCJcblxuICAgIGRlc2NyaWJlIFwiaW4gbm9ybWFsLW1vZGVcIiwgLT5cbiAgICAgIGRlc2NyaWJlIFwiSVwiLCAtPlxuICAgICAgICBpdCBcImluc2VydCBhdCBmaXJzdCBjaGFyIG9mIGxpbmVcIiwgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMCwgNV1cbiAgICAgICAgICBlbnN1cmUgJ0knLCBjdXJzb3I6IFswLCAyXSwgbW9kZTogJ2luc2VydCdcbiAgICAgICAgICBlbnN1cmUgXCJlc2NhcGVcIiwgbW9kZTogJ25vcm1hbCdcblxuICAgICAgICAgIHNldCBjdXJzb3I6IFsxLCA1XVxuICAgICAgICAgIGVuc3VyZSAnSScsIGN1cnNvcjogWzEsIDBdLCBtb2RlOiAnaW5zZXJ0J1xuICAgICAgICAgIGVuc3VyZSBcImVzY2FwZVwiLCBtb2RlOiAnbm9ybWFsJ1xuXG4gICAgICAgICAgc2V0IGN1cnNvcjogWzEsIDBdXG4gICAgICAgICAgZW5zdXJlICdJJywgY3Vyc29yOiBbMSwgMF0sIG1vZGU6ICdpbnNlcnQnXG4gICAgICAgICAgZW5zdXJlIFwiZXNjYXBlXCIsIG1vZGU6ICdub3JtYWwnXG5cbiAgICAgIGRlc2NyaWJlIFwiQVwiLCAtPlxuICAgICAgICBpdCBcImluc2VydCBhdCBlbmQgb2YgbGluZVwiLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFswLCA1XVxuICAgICAgICAgIGVuc3VyZSAnQScsIGN1cnNvcjogWzAsIDEzXSwgbW9kZTogJ2luc2VydCdcbiAgICAgICAgICBlbnN1cmUgXCJlc2NhcGVcIiwgbW9kZTogJ25vcm1hbCdcblxuICAgICAgICAgIHNldCBjdXJzb3I6IFsxLCA1XVxuICAgICAgICAgIGVuc3VyZSAnQScsIGN1cnNvcjogWzEsIDExXSwgbW9kZTogJ2luc2VydCdcbiAgICAgICAgICBlbnN1cmUgXCJlc2NhcGVcIiwgbW9kZTogJ25vcm1hbCdcblxuICAgICAgICAgIHNldCBjdXJzb3I6IFsxLCAxMV1cbiAgICAgICAgICBlbnN1cmUgJ0EnLCBjdXJzb3I6IFsxLCAxMV0sIG1vZGU6ICdpbnNlcnQnXG4gICAgICAgICAgZW5zdXJlIFwiZXNjYXBlXCIsIG1vZGU6ICdub3JtYWwnXG5cbiAgICBkZXNjcmliZSBcInZpc3VhbC1tb2RlLmxpbmV3aXNlXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFsxLCAzXVxuICAgICAgICBlbnN1cmUgXCJWIDIgalwiLFxuICAgICAgICAgIHNlbGVjdGVkVGV4dDogXCJcIlwiXG4gICAgICAgICAgMTogMzQ1NiA4OTBcbiAgICAgICAgICAgIDI6IDM0NTYgODkwXG4gICAgICAgICAgICAgIDM6IDM0NTYgODkwXG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgbW9kZTogWyd2aXN1YWwnLCAnbGluZXdpc2UnXVxuXG4gICAgICBkZXNjcmliZSBcIklcIiwgLT5cbiAgICAgICAgaXQgXCJpbnNlcnQgYXQgZmlyc3QgY2hhciBvZiBsaW5lICpvZiBlYWNoIHNlbGVjdGVkIGxpbmUqXCIsIC0+XG4gICAgICAgICAgZW5zdXJlIFwiSVwiLCBjdXJzb3I6IFtbMSwgMF0sIFsyLCAyXSwgWzMsIDRdXSwgbW9kZTogXCJpbnNlcnRcIlxuICAgICAgZGVzY3JpYmUgXCJBXCIsIC0+XG4gICAgICAgIGl0IFwiaW5zZXJ0IGF0IGVuZCBvZiBsaW5lICpvZiBlYWNoIHNlbGVjdGVkIGxpbmUqXCIsIC0+XG4gICAgICAgICAgZW5zdXJlIFwiQVwiLCBjdXJzb3I6IFtbMSwgMTFdLCBbMiwgMTNdLCBbMywgMTVdXSwgbW9kZTogXCJpbnNlcnRcIlxuXG4gICAgZGVzY3JpYmUgXCJ2aXN1YWwtbW9kZS5ibG9ja3dpc2VcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzEsIDRdXG4gICAgICAgIGVuc3VyZSBcImN0cmwtdiAyIGpcIixcbiAgICAgICAgICBzZWxlY3RlZFRleHQ6IFtcIjRcIiwgXCIgXCIsIFwiM1wiXVxuICAgICAgICAgIG1vZGU6IFsndmlzdWFsJywgJ2Jsb2Nrd2lzZSddXG5cbiAgICAgIGRlc2NyaWJlIFwiSVwiLCAtPlxuICAgICAgICBpdCBcImluc2VydCBhdCBjb2x1bW4gb2Ygc3RhcnQgb2Ygc2VsZWN0aW9uIGZvciAqZWFjaCBzZWxlY3Rpb24qXCIsIC0+XG4gICAgICAgICAgZW5zdXJlIFwiSVwiLCBjdXJzb3I6IFtbMSwgNF0sIFsyLCA0XSwgWzMsIDRdXSwgbW9kZTogXCJpbnNlcnRcIlxuXG4gICAgICAgIGl0IFwiY2FuIHJlcGVhdCBhZnRlciBpbnNlcnQgQUZURVIgY2xlYXJpbmcgbXVsdGlwbGUgY3Vyc29yXCIsIC0+XG4gICAgICAgICAgZW5zdXJlIFwiZXNjYXBlXCIsIG1vZGU6ICdub3JtYWwnXG4gICAgICAgICAgc2V0XG4gICAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICB8bGluZTBcbiAgICAgICAgICAgIGxpbmUxXG4gICAgICAgICAgICBsaW5lMlxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgICBlbnN1cmUgXCJjdHJsLXYgaiBJXCIsXG4gICAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICB8bGluZTBcbiAgICAgICAgICAgIHxsaW5lMVxuICAgICAgICAgICAgbGluZTJcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgbW9kZTogJ2luc2VydCdcblxuICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KFwiQUJDXCIpXG5cbiAgICAgICAgICBlbnN1cmUgXCJlc2NhcGVcIixcbiAgICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAgIEFCfENsaW5lMFxuICAgICAgICAgICAgQUIhQ2xpbmUxXG4gICAgICAgICAgICBsaW5lMlxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICBtb2RlOiAnbm9ybWFsJ1xuXG4gICAgICAgICAgIyBGSVhNRSBzaG91bGQgcHV0IGxhc3QtY3Vyc29yIHBvc2l0aW9uIGF0IHRvcCBvZiBibG9ja1NlbGVjdGlvblxuICAgICAgICAgICMgIHRvIHJlbW92ZSBga2AgbW90aW9uXG4gICAgICAgICAgZW5zdXJlIFwiZXNjYXBlIGtcIixcbiAgICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAgIEFCIUNsaW5lMFxuICAgICAgICAgICAgQUJDbGluZTFcbiAgICAgICAgICAgIGxpbmUyXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgIG1vZGU6ICdub3JtYWwnXG5cbiAgICAgICAgICAjIFRoaXMgc2hvdWxkIHN1Y2Nlc3NcbiAgICAgICAgICBlbnN1cmUgXCJsIC5cIixcbiAgICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAgIEFCQ0FCfENsaW5lMFxuICAgICAgICAgICAgQUJDQUIhQ2xpbmUxXG4gICAgICAgICAgICBsaW5lMlxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICBtb2RlOiAnbm9ybWFsJ1xuXG4gICAgICBkZXNjcmliZSBcIkFcIiwgLT5cbiAgICAgICAgaXQgXCJpbnNlcnQgYXQgY29sdW1uIG9mIGVuZCBvZiBzZWxlY3Rpb24gZm9yICplYWNoIHNlbGVjdGlvbipcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgXCJBXCIsIGN1cnNvcjogW1sxLCA1XSwgWzIsIDVdLCBbMywgNV1dLCBtb2RlOiBcImluc2VydFwiXG5cbiAgICBkZXNjcmliZSBcInZpc3VhbC1tb2RlLmNoYXJhY3Rlcndpc2VcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzEsIDRdXG4gICAgICAgIGVuc3VyZSBcInYgMiBqXCIsXG4gICAgICAgICAgc2VsZWN0ZWRUZXh0OiBcIlwiXCJcbiAgICAgICAgICA0NTYgODkwXG4gICAgICAgICAgICAyOiAzNDU2IDg5MFxuICAgICAgICAgICAgICAzXG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgbW9kZTogWyd2aXN1YWwnLCAnY2hhcmFjdGVyd2lzZSddXG5cbiAgICAgIGRlc2NyaWJlIFwiSSBpcyBzaG9ydCBoYW5kIG9mIGBjdHJsLXYgSWBcIiwgLT5cbiAgICAgICAgaXQgXCJpbnNlcnQgYXQgY29sdW0gb2Ygc3RhcnQgb2Ygc2VsZWN0aW9uIGZvciAqZWFjaCBzZWxlY3RlZCBsaW5lcypcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgXCJJXCIsIGN1cnNvcjogW1sxLCA0XSwgWzIsIDRdLCBbMywgNF1dLCBtb2RlOiBcImluc2VydFwiXG4gICAgICBkZXNjcmliZSBcIkEgaXMgc2hvcnQgaGFuZCBvZiBgY3RybC12IEFgXCIsIC0+XG4gICAgICAgIGl0IFwiaW5zZXJ0IGF0IGNvbHVtbiBvZiBlbmQgb2Ygc2VsZWN0aW9uIGZvciAqZWFjaCBzZWxlY3RlZCBsaW5lcypcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgXCJBXCIsIGN1cnNvcjogW1sxLCA1XSwgWzIsIDVdLCBbMywgNV1dLCBtb2RlOiBcImluc2VydFwiXG5cbiAgICBkZXNjcmliZSBcIndoZW4gb2NjdXJyZW5jZSBtYXJrZXIgaW50ZXJzZWxjdHMgSSBhbmQgQSBubyBsb25nZXIgYmVoYXZlIGJsb2Nrd2lzZSBpbiB2Qy92TFwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBqYXNtaW5lLmF0dGFjaFRvRE9NKGVkaXRvckVsZW1lbnQpXG4gICAgICAgIHNldCBjdXJzb3I6IFsxLCAzXVxuICAgICAgICBlbnN1cmUgJ2cgbycsIG9jY3VycmVuY2VUZXh0OiBbJzM0NTYnLCAnMzQ1NicsICczNDU2JywgJzM0NTYnXSwgY3Vyc29yOiBbMSwgM11cbiAgICAgIGRlc2NyaWJlIFwidkNcIiwgLT5cbiAgICAgICAgZGVzY3JpYmUgXCJJIGFuZCBBIE5PVCBiZWhhdmUgYXMgYGN0cmwtdiBJYFwiLCAtPlxuICAgICAgICAgIGl0IFwiSSBpbnNlcnQgYXQgc3RhcnQgb2YgZWFjaCB2c3VhbGx5IHNlbGVjdGVkIG9jY3VycmVuY2VcIiwgLT5cbiAgICAgICAgICAgIGVuc3VyZSBcInYgaiBqIElcIixcbiAgICAgICAgICAgICAgbW9kZTogJ2luc2VydCdcbiAgICAgICAgICAgICAgdGV4dENfOiBcIlwiXCJcbiAgICAgICAgICAgICAgICBfXzA6IDM0NTYgODkwXG4gICAgICAgICAgICAgICAgMTogITM0NTYgODkwXG4gICAgICAgICAgICAgICAgX18yOiB8MzQ1NiA4OTBcbiAgICAgICAgICAgICAgICBfX19fMzogMzQ1NiA4OTBcbiAgICAgICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICBpdCBcIkEgaW5zZXJ0IGF0IGVuZCBvZiBlYWNoIHZzdWFsbHkgc2VsZWN0ZWQgb2NjdXJyZW5jZVwiLCAtPlxuICAgICAgICAgICAgZW5zdXJlIFwidiBqIGogQVwiLFxuICAgICAgICAgICAgICBtb2RlOiAnaW5zZXJ0J1xuICAgICAgICAgICAgICB0ZXh0Q186IFwiXCJcIlxuICAgICAgICAgICAgICAgIF9fMDogMzQ1NiA4OTBcbiAgICAgICAgICAgICAgICAxOiAzNDU2ISA4OTBcbiAgICAgICAgICAgICAgICBfXzI6IDM0NTZ8IDg5MFxuICAgICAgICAgICAgICAgIF9fX18zOiAzNDU2IDg5MFxuICAgICAgICAgICAgICAgIFwiXCJcIlxuICAgICAgZGVzY3JpYmUgXCJ2TFwiLCAtPlxuICAgICAgICBkZXNjcmliZSBcIkkgYW5kIEEgTk9UIGJlaGF2ZSBhcyBgY3RybC12IElgXCIsIC0+XG4gICAgICAgICAgaXQgXCJJIGluc2VydCBhdCBzdGFydCBvZiBlYWNoIHZzdWFsbHkgc2VsZWN0ZWQgb2NjdXJyZW5jZVwiLCAtPlxuICAgICAgICAgICAgZW5zdXJlIFwiViBqIGogSVwiLFxuICAgICAgICAgICAgICBtb2RlOiAnaW5zZXJ0J1xuICAgICAgICAgICAgICB0ZXh0Q186IFwiXCJcIlxuICAgICAgICAgICAgICAgIF9fMDogMzQ1NiA4OTBcbiAgICAgICAgICAgICAgICAxOiB8MzQ1NiA4OTBcbiAgICAgICAgICAgICAgICAgXzI6IHwzNDU2IDg5MFxuICAgICAgICAgICAgICAgIF9fX18zOiAhMzQ1NiA4OTBcbiAgICAgICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICBpdCBcIkEgaW5zZXJ0IGF0IGVuZCBvZiBlYWNoIHZzdWFsbHkgc2VsZWN0ZWQgb2NjdXJyZW5jZVwiLCAtPlxuICAgICAgICAgICAgZW5zdXJlIFwiViBqIGogQVwiLFxuICAgICAgICAgICAgICBtb2RlOiAnaW5zZXJ0J1xuICAgICAgICAgICAgICB0ZXh0Q186IFwiXCJcIlxuICAgICAgICAgICAgICAgIF9fMDogMzQ1NiA4OTBcbiAgICAgICAgICAgICAgICAxOiAzNDU2fCA4OTBcbiAgICAgICAgICAgICAgICBfXzI6IDM0NTZ8IDg5MFxuICAgICAgICAgICAgICAgIF9fX18zOiAzNDU2ISA4OTBcbiAgICAgICAgICAgICAgICBcIlwiXCJcblxuICBkZXNjcmliZSBcInRoZSBnSSBrZXliaW5kaW5nXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2V0XG4gICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICBfX3RoaXMgaXMgdGV4dFxuICAgICAgICBcIlwiXCJcblxuICAgIGRlc2NyaWJlIFwiaW4gbm9ybWFsLW1vZGUuXCIsIC0+XG4gICAgICBpdCBcInN0YXJ0IGF0IGluc2VydCBhdCBjb2x1bW4gMCByZWdhcmRsZXNzIG9mIGN1cnJlbnQgY29sdW1uXCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFswLCA1XVxuICAgICAgICBlbnN1cmUgXCJnIElcIiwgY3Vyc29yOiBbMCwgMF0sIG1vZGU6ICdpbnNlcnQnXG4gICAgICAgIGVuc3VyZSBcImVzY2FwZVwiLCBtb2RlOiAnbm9ybWFsJ1xuXG4gICAgICAgIHNldCBjdXJzb3I6IFswLCAwXVxuICAgICAgICBlbnN1cmUgXCJnIElcIiwgY3Vyc29yOiBbMCwgMF0sIG1vZGU6ICdpbnNlcnQnXG4gICAgICAgIGVuc3VyZSBcImVzY2FwZVwiLCBtb2RlOiAnbm9ybWFsJ1xuXG4gICAgICAgIHNldCBjdXJzb3I6IFswLCAxM11cbiAgICAgICAgZW5zdXJlIFwiZyBJXCIsIGN1cnNvcjogWzAsIDBdLCBtb2RlOiAnaW5zZXJ0J1xuXG4gICAgZGVzY3JpYmUgXCJpbiB2aXN1YWwtbW9kZVwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0XzogXCJcIlwiXG4gICAgICAgICAgX18wOiAzNDU2IDg5MFxuICAgICAgICAgIDE6IDM0NTYgODkwXG4gICAgICAgICAgX18yOiAzNDU2IDg5MFxuICAgICAgICAgIF9fX18zOiAzNDU2IDg5MFxuICAgICAgICAgIFwiXCJcIlxuXG4gICAgICBpdCBcIltjaGFyYWN0ZXJ3aXNlXVwiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMSwgNF1cbiAgICAgICAgZW5zdXJlIFwidiAyIGpcIixcbiAgICAgICAgICBzZWxlY3RlZFRleHQ6IFwiXCJcIlxuICAgICAgICAgIDQ1NiA4OTBcbiAgICAgICAgICAgIDI6IDM0NTYgODkwXG4gICAgICAgICAgICAgIDNcbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICBtb2RlOiBbJ3Zpc3VhbCcsICdjaGFyYWN0ZXJ3aXNlJ11cbiAgICAgICAgZW5zdXJlIFwiZyBJXCIsXG4gICAgICAgICAgY3Vyc29yOiBbWzEsIDBdLCBbMiwgMF0sIFszLCAwXV0sIG1vZGU6IFwiaW5zZXJ0XCJcblxuICAgICAgaXQgXCJbbGluZXdpc2VdXCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFsxLCAzXVxuICAgICAgICBlbnN1cmUgXCJWIDIgalwiLFxuICAgICAgICAgIHNlbGVjdGVkVGV4dDogXCJcIlwiXG4gICAgICAgICAgMTogMzQ1NiA4OTBcbiAgICAgICAgICAgIDI6IDM0NTYgODkwXG4gICAgICAgICAgICAgIDM6IDM0NTYgODkwXG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgbW9kZTogWyd2aXN1YWwnLCAnbGluZXdpc2UnXVxuICAgICAgICBlbnN1cmUgXCJnIElcIixcbiAgICAgICAgICBjdXJzb3I6IFtbMSwgMF0sIFsyLCAwXSwgWzMsIDBdXSwgbW9kZTogXCJpbnNlcnRcIlxuXG4gICAgICBpdCBcIltibG9ja3dpc2VdXCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFsxLCA0XVxuICAgICAgICBlbnN1cmUgXCJjdHJsLXYgMiBqXCIsXG4gICAgICAgICAgc2VsZWN0ZWRUZXh0OiBbXCI0XCIsIFwiIFwiLCBcIjNcIl1cbiAgICAgICAgICBtb2RlOiBbJ3Zpc3VhbCcsICdibG9ja3dpc2UnXVxuICAgICAgICBlbnN1cmUgXCJnIElcIixcbiAgICAgICAgICBjdXJzb3I6IFtbMSwgMF0sIFsyLCAwXSwgWzMsIDBdXSwgbW9kZTogXCJpbnNlcnRcIlxuXG4gIGRlc2NyaWJlIFwiSW5zZXJ0QXRQcmV2aW91c0ZvbGRTdGFydCBhbmQgTmV4dFwiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgICBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZSgnbGFuZ3VhZ2UtY29mZmVlLXNjcmlwdCcpXG4gICAgICBnZXRWaW1TdGF0ZSAnc2FtcGxlLmNvZmZlZScsIChzdGF0ZSwgdmltKSAtPlxuICAgICAgICB7ZWRpdG9yLCBlZGl0b3JFbGVtZW50fSA9IHN0YXRlXG4gICAgICAgIHtzZXQsIGVuc3VyZSwga2V5c3Ryb2tlfSA9IHZpbVxuXG4gICAgICBydW5zIC0+XG4gICAgICAgIGF0b20ua2V5bWFwcy5hZGQgXCJ0ZXN0XCIsXG4gICAgICAgICAgJ2F0b20tdGV4dC1lZGl0b3IudmltLW1vZGUtcGx1cy5ub3JtYWwtbW9kZSc6XG4gICAgICAgICAgICAnZyBbJzogJ3ZpbS1tb2RlLXBsdXM6aW5zZXJ0LWF0LXByZXZpb3VzLWZvbGQtc3RhcnQnXG4gICAgICAgICAgICAnZyBdJzogJ3ZpbS1tb2RlLXBsdXM6aW5zZXJ0LWF0LW5leHQtZm9sZC1zdGFydCdcblxuICAgIGFmdGVyRWFjaCAtPlxuICAgICAgYXRvbS5wYWNrYWdlcy5kZWFjdGl2YXRlUGFja2FnZSgnbGFuZ3VhZ2UtY29mZmVlLXNjcmlwdCcpXG5cbiAgICBkZXNjcmliZSBcIndoZW4gY3Vyc29yIGlzIG5vdCBhdCBmb2xkIHN0YXJ0IHJvd1wiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMTYsIDBdXG4gICAgICBpdCBcImluc2VydCBhdCBwcmV2aW91cyBmb2xkIHN0YXJ0IHJvd1wiLCAtPlxuICAgICAgICBlbnN1cmUgJ2cgWycsIGN1cnNvcjogWzksIDJdLCBtb2RlOiAnaW5zZXJ0J1xuICAgICAgaXQgXCJpbnNlcnQgYXQgbmV4dCBmb2xkIHN0YXJ0IHJvd1wiLCAtPlxuICAgICAgICBlbnN1cmUgJ2cgXScsIGN1cnNvcjogWzE4LCA0XSwgbW9kZTogJ2luc2VydCdcblxuICAgIGRlc2NyaWJlIFwid2hlbiBjdXJzb3IgaXMgYXQgZm9sZCBzdGFydCByb3dcIiwgLT5cbiAgICAgICMgTm90aGluZyBzcGVjaWFsIHdoZW4gY3Vyc29yIGlzIGF0IGZvbGQgc3RhcnQgcm93LFxuICAgICAgIyBvbmx5IGZvciB0ZXN0IHNjZW5hcmlvIHRocm91Z2huZXNzLlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMjAsIDZdXG4gICAgICBpdCBcImluc2VydCBhdCBwcmV2aW91cyBmb2xkIHN0YXJ0IHJvd1wiLCAtPlxuICAgICAgICBlbnN1cmUgJ2cgWycsIGN1cnNvcjogWzE4LCA0XSwgbW9kZTogJ2luc2VydCdcbiAgICAgIGl0IFwiaW5zZXJ0IGF0IG5leHQgZm9sZCBzdGFydCByb3dcIiwgLT5cbiAgICAgICAgZW5zdXJlICdnIF0nLCBjdXJzb3I6IFsyMiwgNl0sIG1vZGU6ICdpbnNlcnQnXG5cbiAgZGVzY3JpYmUgXCJ0aGUgaSBrZXliaW5kaW5nXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2V0XG4gICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICB8MTIzXG4gICAgICAgICAgfDQ1NjdcbiAgICAgICAgICBcIlwiXCJcblxuICAgIGl0IFwiYWxsb3dzIHVuZG9pbmcgYW4gZW50aXJlIGJhdGNoIG9mIHR5cGluZ1wiLCAtPlxuICAgICAga2V5c3Ryb2tlICdpJ1xuICAgICAgZWRpdG9yLmluc2VydFRleHQoXCJhYmNYWFwiKVxuICAgICAgZWRpdG9yLmJhY2tzcGFjZSgpXG4gICAgICBlZGl0b3IuYmFja3NwYWNlKClcbiAgICAgIGVuc3VyZSAnZXNjYXBlJywgdGV4dDogXCJhYmMxMjNcXG5hYmM0NTY3XCJcblxuICAgICAga2V5c3Ryb2tlICdpJ1xuICAgICAgZWRpdG9yLmluc2VydFRleHQgXCJkXCJcbiAgICAgIGVkaXRvci5pbnNlcnRUZXh0IFwiZVwiXG4gICAgICBlZGl0b3IuaW5zZXJ0VGV4dCBcImZcIlxuICAgICAgZW5zdXJlICdlc2NhcGUnLCB0ZXh0OiBcImFiZGVmYzEyM1xcbmFiZGVmYzQ1NjdcIlxuICAgICAgZW5zdXJlICd1JywgdGV4dDogXCJhYmMxMjNcXG5hYmM0NTY3XCJcbiAgICAgIGVuc3VyZSAndScsIHRleHQ6IFwiMTIzXFxuNDU2N1wiXG5cbiAgICBpdCBcImFsbG93cyByZXBlYXRpbmcgdHlwaW5nXCIsIC0+XG4gICAgICBrZXlzdHJva2UgJ2knXG4gICAgICBlZGl0b3IuaW5zZXJ0VGV4dChcImFiY1hYXCIpXG4gICAgICBlZGl0b3IuYmFja3NwYWNlKClcbiAgICAgIGVkaXRvci5iYWNrc3BhY2UoKVxuICAgICAgZW5zdXJlICdlc2NhcGUnLCB0ZXh0OiBcImFiYzEyM1xcbmFiYzQ1NjdcIlxuICAgICAgZW5zdXJlICcuJywgICAgICB0ZXh0OiBcImFiYWJjYzEyM1xcbmFiYWJjYzQ1NjdcIlxuICAgICAgZW5zdXJlICcuJywgICAgICB0ZXh0OiBcImFiYWJhYmNjYzEyM1xcbmFiYWJhYmNjYzQ1NjdcIlxuXG4gICAgZGVzY3JpYmUgJ3dpdGggbm9ubGluZWFyIGlucHV0JywgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0IHRleHQ6ICcnLCBjdXJzb3I6IFswLCAwXVxuXG4gICAgICBpdCAnZGVhbHMgd2l0aCBhdXRvLW1hdGNoZWQgYnJhY2tldHMnLCAtPlxuICAgICAgICBrZXlzdHJva2UgJ2knXG4gICAgICAgICMgdGhpcyBzZXF1ZW5jZSBzaW11bGF0ZXMgd2hhdCB0aGUgYnJhY2tldC1tYXRjaGVyIHBhY2thZ2UgZG9lc1xuICAgICAgICAjIHdoZW4gdGhlIHVzZXIgdHlwZXMgKGEpYjxlbnRlcj5cbiAgICAgICAgZWRpdG9yLmluc2VydFRleHQgJygpJ1xuICAgICAgICBlZGl0b3IubW92ZUxlZnQoKVxuICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dCAnYSdcbiAgICAgICAgZWRpdG9yLm1vdmVSaWdodCgpXG4gICAgICAgIGVkaXRvci5pbnNlcnRUZXh0ICdiXFxuJ1xuICAgICAgICBlbnN1cmUgJ2VzY2FwZScsIGN1cnNvcjogWzEsICAwXVxuICAgICAgICBlbnN1cmUgJy4nLFxuICAgICAgICAgIHRleHQ6ICcoYSliXFxuKGEpYlxcbidcbiAgICAgICAgICBjdXJzb3I6IFsyLCAgMF1cblxuICAgICAgaXQgJ2RlYWxzIHdpdGggYXV0b2NvbXBsZXRlJywgLT5cbiAgICAgICAga2V5c3Ryb2tlICdpJ1xuICAgICAgICAjIHRoaXMgc2VxdWVuY2Ugc2ltdWxhdGVzIGF1dG9jb21wbGV0aW9uIG9mICdhZGQnIHRvICdhZGRGb28nXG4gICAgICAgIGVkaXRvci5pbnNlcnRUZXh0ICdhJ1xuICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dCAnZCdcbiAgICAgICAgZWRpdG9yLmluc2VydFRleHQgJ2QnXG4gICAgICAgIGVkaXRvci5zZXRUZXh0SW5CdWZmZXJSYW5nZSBbWzAsIDBdLCBbMCwgM11dLCAnYWRkRm9vJ1xuICAgICAgICBlbnN1cmUgJ2VzY2FwZScsXG4gICAgICAgICAgY3Vyc29yOiBbMCwgIDVdXG4gICAgICAgICAgdGV4dDogJ2FkZEZvbydcbiAgICAgICAgZW5zdXJlICcuJyxcbiAgICAgICAgICB0ZXh0OiAnYWRkRm9hZGRGb29vJ1xuICAgICAgICAgIGN1cnNvcjogWzAsICAxMF1cblxuICBkZXNjcmliZSAndGhlIGEga2V5YmluZGluZycsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2V0XG4gICAgICAgIHRleHQ6ICcnXG4gICAgICAgIGN1cnNvcjogWzAsIDBdXG5cbiAgICBpdCBcImNhbiBiZSB1bmRvbmUgaW4gb25lIGdvXCIsIC0+XG4gICAgICBrZXlzdHJva2UgJ2EnXG4gICAgICBlZGl0b3IuaW5zZXJ0VGV4dChcImFiY1wiKVxuICAgICAgZW5zdXJlICdlc2NhcGUnLCB0ZXh0OiBcImFiY1wiXG4gICAgICBlbnN1cmUgJ3UnLCB0ZXh0OiBcIlwiXG5cbiAgICBpdCBcInJlcGVhdHMgY29ycmVjdGx5XCIsIC0+XG4gICAgICBrZXlzdHJva2UgJ2EnXG4gICAgICBlZGl0b3IuaW5zZXJ0VGV4dChcImFiY1wiKVxuICAgICAgZW5zdXJlICdlc2NhcGUnLFxuICAgICAgICB0ZXh0OiBcImFiY1wiXG4gICAgICAgIGN1cnNvcjogWzAsIDJdXG4gICAgICBlbnN1cmUgJy4nLFxuICAgICAgICB0ZXh0OiBcImFiY2FiY1wiXG4gICAgICAgIGN1cnNvcjogWzAsIDVdXG5cbiAgZGVzY3JpYmUgJ3ByZXNlcnZlIGluc2VydGVkIHRleHQnLCAtPlxuICAgIGVuc3VyZURvdFJlZ2lzdGVyID0gbnVsbFxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIGVuc3VyZURvdFJlZ2lzdGVyID0gKGtleSwge3RleHR9KSAtPlxuICAgICAgICBlbnN1cmUga2V5LCBtb2RlOiAnaW5zZXJ0J1xuICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dCh0ZXh0KVxuICAgICAgICBlbnN1cmUgXCJlc2NhcGVcIiwgcmVnaXN0ZXI6ICcuJzogdGV4dDogdGV4dFxuXG4gICAgICBzZXRcbiAgICAgICAgdGV4dDogXCJcXG5cXG5cIlxuICAgICAgICBjdXJzb3I6IFswLCAwXVxuXG4gICAgaXQgXCJbY2FzZS1pXVwiLCAtPiBlbnN1cmVEb3RSZWdpc3RlciAnaScsIHRleHQ6ICdpYWJjJ1xuICAgIGl0IFwiW2Nhc2Utb11cIiwgLT4gZW5zdXJlRG90UmVnaXN0ZXIgJ28nLCB0ZXh0OiAnb2FiYydcbiAgICBpdCBcIltjYXNlLWNdXCIsIC0+IGVuc3VyZURvdFJlZ2lzdGVyICdjIGwnLCB0ZXh0OiAnY2FiYydcbiAgICBpdCBcIltjYXNlLUNdXCIsIC0+IGVuc3VyZURvdFJlZ2lzdGVyICdDJywgdGV4dDogJ0NhYmMnXG4gICAgaXQgXCJbY2FzZS1zXVwiLCAtPiBlbnN1cmVEb3RSZWdpc3RlciAncycsIHRleHQ6ICdzYWJjJ1xuXG4gIGRlc2NyaWJlIFwicmVwZWF0IGJhY2tzcGFjZS9kZWxldGUgaGFwcGVuZWQgaW4gaW5zZXJ0LW1vZGVcIiwgLT5cbiAgICBkZXNjcmliZSBcInNpbmdsZSBjdXJzb3Igb3BlcmF0aW9uXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIGN1cnNvcjogWzAsIDBdXG4gICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgMTIzXG4gICAgICAgICAgMTIzXG4gICAgICAgICAgXCJcIlwiXG5cbiAgICAgIGl0IFwiY2FuIHJlcGVhdCBiYWNrc3BhY2Ugb25seSBtdXRhdGlvbjogY2FzZS1pXCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFswLCAxXVxuICAgICAgICBrZXlzdHJva2UgJ2knXG4gICAgICAgIGVkaXRvci5iYWNrc3BhY2UoKVxuICAgICAgICBlbnN1cmUgJ2VzY2FwZScsIHRleHQ6IFwiMjNcXG4xMjNcIiwgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgZW5zdXJlICdqIC4nLCB0ZXh0OiBcIjIzXFxuMTIzXCIgIyBub3RoaW5nIGhhcHBlblxuICAgICAgICBlbnN1cmUgJ2wgLicsIHRleHQ6IFwiMjNcXG4yM1wiXG5cbiAgICAgIGl0IFwiY2FuIHJlcGVhdCBiYWNrc3BhY2Ugb25seSBtdXRhdGlvbjogY2FzZS1hXCIsIC0+XG4gICAgICAgIGtleXN0cm9rZSAnYSdcbiAgICAgICAgZWRpdG9yLmJhY2tzcGFjZSgpXG4gICAgICAgIGVuc3VyZSAnZXNjYXBlJywgdGV4dDogXCIyM1xcbjEyM1wiLCBjdXJzb3I6IFswLCAwXVxuICAgICAgICBlbnN1cmUgJy4nLCB0ZXh0OiBcIjNcXG4xMjNcIiwgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgZW5zdXJlICdqIC4gLicsIHRleHQ6IFwiM1xcbjNcIlxuXG4gICAgICBpdCBcImNhbiByZXBlYXQgZGVsZXRlIG9ubHkgbXV0YXRpb246IGNhc2UtaVwiLCAtPlxuICAgICAgICBrZXlzdHJva2UgJ2knXG4gICAgICAgIGVkaXRvci5kZWxldGUoKVxuICAgICAgICBlbnN1cmUgJ2VzY2FwZScsIHRleHQ6IFwiMjNcXG4xMjNcIlxuICAgICAgICBlbnN1cmUgJ2ogLicsIHRleHQ6IFwiMjNcXG4yM1wiXG5cbiAgICAgIGl0IFwiY2FuIHJlcGVhdCBkZWxldGUgb25seSBtdXRhdGlvbjogY2FzZS1hXCIsIC0+XG4gICAgICAgIGtleXN0cm9rZSAnYSdcbiAgICAgICAgZWRpdG9yLmRlbGV0ZSgpXG4gICAgICAgIGVuc3VyZSAnZXNjYXBlJywgdGV4dDogXCIxM1xcbjEyM1wiXG4gICAgICAgIGVuc3VyZSAnaiAuJywgdGV4dDogXCIxM1xcbjEzXCJcblxuICAgICAgaXQgXCJjYW4gcmVwZWF0IGJhY2tzcGFjZSBhbmQgaW5zZXJ0IG11dGF0aW9uOiBjYXNlLWlcIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzAsIDFdXG4gICAgICAgIGtleXN0cm9rZSAnaSdcbiAgICAgICAgZWRpdG9yLmJhY2tzcGFjZSgpXG4gICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KFwiISEhXCIpXG4gICAgICAgIGVuc3VyZSAnZXNjYXBlJywgdGV4dDogXCIhISEyM1xcbjEyM1wiXG4gICAgICAgIHNldCBjdXJzb3I6IFsxLCAxXVxuICAgICAgICBlbnN1cmUgJy4nLCB0ZXh0OiBcIiEhITIzXFxuISEhMjNcIlxuXG4gICAgICBpdCBcImNhbiByZXBlYXQgYmFja3NwYWNlIGFuZCBpbnNlcnQgbXV0YXRpb246IGNhc2UtYVwiLCAtPlxuICAgICAgICBrZXlzdHJva2UgJ2EnXG4gICAgICAgIGVkaXRvci5iYWNrc3BhY2UoKVxuICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dChcIiEhIVwiKVxuICAgICAgICBlbnN1cmUgJ2VzY2FwZScsIHRleHQ6IFwiISEhMjNcXG4xMjNcIlxuICAgICAgICBlbnN1cmUgJ2ogMCAuJywgdGV4dDogXCIhISEyM1xcbiEhITIzXCJcblxuICAgICAgaXQgXCJjYW4gcmVwZWF0IGRlbGV0ZSBhbmQgaW5zZXJ0IG11dGF0aW9uOiBjYXNlLWlcIiwgLT5cbiAgICAgICAga2V5c3Ryb2tlICdpJ1xuICAgICAgICBlZGl0b3IuZGVsZXRlKClcbiAgICAgICAgZWRpdG9yLmluc2VydFRleHQoXCIhISFcIilcbiAgICAgICAgZW5zdXJlICdlc2NhcGUnLCB0ZXh0OiBcIiEhITIzXFxuMTIzXCJcbiAgICAgICAgZW5zdXJlICdqIDAgLicsIHRleHQ6IFwiISEhMjNcXG4hISEyM1wiXG5cbiAgICAgIGl0IFwiY2FuIHJlcGVhdCBkZWxldGUgYW5kIGluc2VydCBtdXRhdGlvbjogY2FzZS1hXCIsIC0+XG4gICAgICAgIGtleXN0cm9rZSAnYSdcbiAgICAgICAgZWRpdG9yLmRlbGV0ZSgpXG4gICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KFwiISEhXCIpXG4gICAgICAgIGVuc3VyZSAnZXNjYXBlJywgdGV4dDogXCIxISEhM1xcbjEyM1wiXG4gICAgICAgIGVuc3VyZSAnaiAwIC4nLCB0ZXh0OiBcIjEhISEzXFxuMSEhITNcIlxuXG4gICAgZGVzY3JpYmUgXCJtdWx0aS1jdXJzb3JzIG9wZXJhdGlvblwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgfDEyM1xuXG4gICAgICAgICAgfDEyMzRcblxuICAgICAgICAgIHwxMjM0NVxuICAgICAgICAgIFwiXCJcIlxuXG4gICAgICBpdCBcImNhbiByZXBlYXQgYmFja3NwYWNlIG9ubHkgbXV0YXRpb246IGNhc2UtbXVsdGktY3Vyc29yc1wiLCAtPlxuICAgICAgICBlbnN1cmUgJ0EnLCBjdXJzb3I6IFtbMCwgM10sIFsyLCA0XSwgWzQsIDVdXSwgbW9kZTogJ2luc2VydCdcbiAgICAgICAgZWRpdG9yLmJhY2tzcGFjZSgpXG4gICAgICAgIGVuc3VyZSAnZXNjYXBlJywgdGV4dDogXCIxMlxcblxcbjEyM1xcblxcbjEyMzRcIiwgY3Vyc29yOiBbWzAsIDFdLCBbMiwgMl0sIFs0LCAzXV1cbiAgICAgICAgZW5zdXJlICcuJywgdGV4dDogXCIxXFxuXFxuMTJcXG5cXG4xMjNcIiwgY3Vyc29yOiBbWzAsIDBdLCBbMiwgMV0sIFs0LCAyXV1cblxuICAgICAgaXQgXCJjYW4gcmVwZWF0IGRlbGV0ZSBvbmx5IG11dGF0aW9uOiBjYXNlLW11bHRpLWN1cnNvcnNcIiwgLT5cbiAgICAgICAgZW5zdXJlICdJJywgbW9kZTogJ2luc2VydCdcbiAgICAgICAgZWRpdG9yLmRlbGV0ZSgpXG4gICAgICAgIGN1cnNvcnMgPSBbWzAsIDBdLCBbMiwgMF0sIFs0LCAwXV1cbiAgICAgICAgZW5zdXJlICdlc2NhcGUnLCB0ZXh0OiBcIjIzXFxuXFxuMjM0XFxuXFxuMjM0NVwiLCBjdXJzb3I6IGN1cnNvcnNcbiAgICAgICAgZW5zdXJlICcuJywgdGV4dDogXCIzXFxuXFxuMzRcXG5cXG4zNDVcIiwgY3Vyc29yOiBjdXJzb3JzXG4gICAgICAgIGVuc3VyZSAnLicsIHRleHQ6IFwiXFxuXFxuNFxcblxcbjQ1XCIsIGN1cnNvcjogY3Vyc29yc1xuICAgICAgICBlbnN1cmUgJy4nLCB0ZXh0OiBcIlxcblxcblxcblxcbjVcIiwgY3Vyc29yOiBjdXJzb3JzXG4gICAgICAgIGVuc3VyZSAnLicsIHRleHQ6IFwiXFxuXFxuXFxuXFxuXCIsIGN1cnNvcjogY3Vyc29yc1xuXG4gIGRlc2NyaWJlICdzcGVjaWZ5IGluc2VydGlvbiBjb3VudCcsIC0+XG4gICAgZW5zdXJlSW5zZXJ0aW9uQ291bnQgPSAoa2V5LCB7aW5zZXJ0LCB0ZXh0LCBjdXJzb3J9KSAtPlxuICAgICAga2V5c3Ryb2tlIGtleVxuICAgICAgZWRpdG9yLmluc2VydFRleHQoaW5zZXJ0KVxuICAgICAgZW5zdXJlIFwiZXNjYXBlXCIsIHRleHQ6IHRleHQsIGN1cnNvcjogY3Vyc29yXG5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBpbml0aWFsVGV4dCA9IFwiKlxcbipcXG5cIlxuICAgICAgc2V0IHRleHQ6IFwiXCIsIGN1cnNvcjogWzAsIDBdXG4gICAgICBrZXlzdHJva2UgJ2knXG4gICAgICBlZGl0b3IuaW5zZXJ0VGV4dChpbml0aWFsVGV4dClcbiAgICAgIGVuc3VyZSBcImVzY2FwZSBnIGdcIiwgdGV4dDogaW5pdGlhbFRleHQsIGN1cnNvcjogWzAsIDBdXG5cbiAgICBkZXNjcmliZSBcInJlcGVhdCBpbnNlcnRpb24gY291bnQgdGltZXNcIiwgLT5cbiAgICAgIGl0IFwiW2Nhc2UtaV1cIiwgLT4gZW5zdXJlSW5zZXJ0aW9uQ291bnQgJzMgaScsIGluc2VydDogJz0nLCB0ZXh0OiBcIj09PSpcXG4qXFxuXCIsIGN1cnNvcjogWzAsIDJdXG4gICAgICBpdCBcIltjYXNlLW9dXCIsIC0+IGVuc3VyZUluc2VydGlvbkNvdW50ICczIG8nLCBpbnNlcnQ6ICc9JywgdGV4dDogXCIqXFxuPVxcbj1cXG49XFxuKlxcblwiLCBjdXJzb3I6IFszLCAwXVxuICAgICAgaXQgXCJbY2FzZS1PXVwiLCAtPiBlbnN1cmVJbnNlcnRpb25Db3VudCAnMyBPJywgaW5zZXJ0OiAnPScsIHRleHQ6IFwiPVxcbj1cXG49XFxuKlxcbipcXG5cIiwgY3Vyc29yOiBbMiwgMF1cblxuICAgICAgZGVzY3JpYmUgXCJjaGlsZHJlbiBvZiBDaGFuZ2Ugb3BlcmF0aW9uIHdvbid0IHJlcGVhdGUgaW5zZXJ0aW9uIGNvdW50IHRpbWVzXCIsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBzZXQgdGV4dDogXCJcIiwgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgICBrZXlzdHJva2UgJ2knXG4gICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoJyonKVxuICAgICAgICAgIGVuc3VyZSAnZXNjYXBlIGcgZycsIHRleHQ6ICcqJywgY3Vyc29yOiBbMCwgMF1cblxuICAgICAgICBpdCBcIltjYXNlLWNdXCIsIC0+IGVuc3VyZUluc2VydGlvbkNvdW50ICczIGMgdycsIGluc2VydDogJz0nLCB0ZXh0OiBcIj1cIiwgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgaXQgXCJbY2FzZS1DXVwiLCAtPiBlbnN1cmVJbnNlcnRpb25Db3VudCAnMyBDJywgaW5zZXJ0OiAnPScsIHRleHQ6IFwiPVwiLCBjdXJzb3I6IFswLCAwXVxuICAgICAgICBpdCBcIltjYXNlLXNdXCIsIC0+IGVuc3VyZUluc2VydGlvbkNvdW50ICczIHMnLCBpbnNlcnQ6ICc9JywgdGV4dDogXCI9XCIsIGN1cnNvcjogWzAsIDBdXG4gICAgICAgIGl0IFwiW2Nhc2UtU11cIiwgLT4gZW5zdXJlSW5zZXJ0aW9uQ291bnQgJzMgUycsIGluc2VydDogJz0nLCB0ZXh0OiBcIj1cIiwgY3Vyc29yOiBbMCwgMF1cblxuICAgIGRlc2NyaWJlIFwidGhyb3R0b2xpbmcgaW50ZXJ0aW9uIGNvdW50IHRvIDEwMCBhdCBtYXhpbXVtXCIsIC0+XG4gICAgICBpdCBcImluc2VydCAxMDAgdGltZXMgYXQgbWF4aW11bSBldmVuIGlmIGJpZyBjb3VudCB3YXMgZ2l2ZW5cIiwgLT5cbiAgICAgICAgc2V0IHRleHQ6ICcnXG4gICAgICAgIGV4cGVjdChlZGl0b3IuZ2V0TGFzdEJ1ZmZlclJvdygpKS50b0JlKDApXG4gICAgICAgIGVuc3VyZSAnNSA1IDUgNSA1IDUgNSBpJywgbW9kZTogJ2luc2VydCdcbiAgICAgICAgZWRpdG9yLmluc2VydFRleHQoXCJhXFxuXCIpXG4gICAgICAgIGVuc3VyZSAnZXNjYXBlJywgbW9kZTogJ25vcm1hbCdcbiAgICAgICAgZXhwZWN0KGVkaXRvci5nZXRMYXN0QnVmZmVyUm93KCkpLnRvQmUoMTAxKVxuIl19
