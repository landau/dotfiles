(function() {
  var TextData, getVimState, ref,
    slice = [].slice;

  ref = require('./spec-helper'), getVimState = ref.getVimState, TextData = ref.TextData;

  describe("Visual Blockwise", function() {
    var blockTexts, editor, editorElement, ensure, ensureBlockwiseSelection, keystroke, ref1, selectBlockwise, selectBlockwiseReversely, set, textAfterDeleted, textAfterInserted, textData, textInitial, vimState;
    ref1 = [], set = ref1[0], ensure = ref1[1], keystroke = ref1[2], editor = ref1[3], editorElement = ref1[4], vimState = ref1[5];
    textInitial = "01234567890123456789\n1-------------------\n2----A---------B----\n3----***********---\n4----+++++++++++--\n5----C---------D-\n6-------------------";
    textAfterDeleted = "01234567890123456789\n1-------------------\n2----\n3----\n4----\n5----\n6-------------------";
    textAfterInserted = "01234567890123456789\n1-------------------\n2----!!!\n3----!!!\n4----!!!\n5----!!!\n6-------------------";
    blockTexts = ['56789012345', '-----------', 'A---------B', '***********', '+++++++++++', 'C---------D', '-----------'];
    textData = new TextData(textInitial);
    selectBlockwise = function() {
      set({
        cursor: [2, 5]
      });
      return ensure('v 3 j 1 0 l ctrl-v', {
        mode: ['visual', 'blockwise'],
        selectedBufferRange: [[[2, 5], [2, 16]], [[3, 5], [3, 16]], [[4, 5], [4, 16]], [[5, 5], [5, 16]]],
        selectedText: blockTexts.slice(2, 6)
      });
    };
    selectBlockwiseReversely = function() {
      set({
        cursor: [2, 15]
      });
      return ensure('v 3 j 1 0 h ctrl-v', {
        mode: ['visual', 'blockwise'],
        selectedBufferRange: [[[2, 5], [2, 16]], [[3, 5], [3, 16]], [[4, 5], [4, 16]], [[5, 5], [5, 16]]],
        selectedText: blockTexts.slice(2, 6)
      });
    };
    ensureBlockwiseSelection = function(o) {
      var bs, first, head, i, j, k, last, len, len1, others, ref2, results, s, selections, tail;
      selections = editor.getSelectionsOrderedByBufferPosition();
      if (selections.length === 1) {
        first = last = selections[0];
      } else {
        first = selections[0], others = 3 <= selections.length ? slice.call(selections, 1, i = selections.length - 1) : (i = 1, []), last = selections[i++];
      }
      head = (function() {
        switch (o.head) {
          case 'top':
            return first;
          case 'bottom':
            return last;
        }
      })();
      bs = vimState.getLastBlockwiseSelection();
      expect(bs.getHeadSelection()).toBe(head);
      tail = (function() {
        switch (o.tail) {
          case 'top':
            return first;
          case 'bottom':
            return last;
        }
      })();
      expect(bs.getTailSelection()).toBe(tail);
      ref2 = others != null ? others : [];
      for (j = 0, len = ref2.length; j < len; j++) {
        s = ref2[j];
        expect(bs.getHeadSelection()).not.toBe(s);
        expect(bs.getTailSelection()).not.toBe(s);
      }
      if (o.reversed != null) {
        expect(bs.isReversed()).toBe(o.reversed);
      }
      if (o.headReversed != null) {
        results = [];
        for (k = 0, len1 = selections.length; k < len1; k++) {
          s = selections[k];
          results.push(expect(s.isReversed()).toBe(o.headReversed));
        }
        return results;
      }
    };
    beforeEach(function() {
      getVimState(function(state, vimEditor) {
        vimState = state;
        editor = vimState.editor, editorElement = vimState.editorElement;
        return set = vimEditor.set, ensure = vimEditor.ensure, keystroke = vimEditor.keystroke, vimEditor;
      });
      return runs(function() {
        return set({
          text: textInitial
        });
      });
    });
    describe("j", function() {
      beforeEach(function() {
        set({
          cursor: [3, 5]
        });
        return ensure('v 1 0 l ctrl-v', {
          selectedText: blockTexts[3],
          mode: ['visual', 'blockwise']
        });
      });
      it("add selection to down direction", function() {
        ensure('j', {
          selectedText: blockTexts.slice(3, 5)
        });
        return ensure('j', {
          selectedText: blockTexts.slice(3, 6)
        });
      });
      it("delete selection when blocwise is reversed", function() {
        ensure('3 k', {
          selectedTextOrdered: blockTexts.slice(0, 4)
        });
        ensure('j', {
          selectedTextOrdered: blockTexts.slice(1, 4)
        });
        return ensure('2 j', {
          selectedTextOrdered: blockTexts[3]
        });
      });
      return it("keep tail row when reversed status changed", function() {
        ensure('j', {
          selectedText: blockTexts.slice(3, 5)
        });
        return ensure('2 k', {
          selectedTextOrdered: blockTexts.slice(2, 4)
        });
      });
    });
    describe("k", function() {
      beforeEach(function() {
        set({
          cursor: [3, 5]
        });
        return ensure('v 1 0 l ctrl-v', {
          selectedText: blockTexts[3],
          mode: ['visual', 'blockwise']
        });
      });
      it("add selection to up direction", function() {
        ensure('k', {
          selectedTextOrdered: blockTexts.slice(2, 4)
        });
        return ensure('k', {
          selectedTextOrdered: blockTexts.slice(1, 4)
        });
      });
      return it("delete selection when blocwise is reversed", function() {
        ensure('3 j', {
          selectedTextOrdered: blockTexts.slice(3, 7)
        });
        ensure('k', {
          selectedTextOrdered: blockTexts.slice(3, 6)
        });
        return ensure('2 k', {
          selectedTextOrdered: blockTexts[3]
        });
      });
    });
    describe("C", function() {
      var ensureChange;
      ensureChange = function() {
        ensure('C', {
          mode: 'insert',
          cursor: [[2, 5], [3, 5], [4, 5], [5, 5]],
          text: textAfterDeleted
        });
        editor.insertText("!!!");
        return ensure({
          mode: 'insert',
          cursor: [[2, 8], [3, 8], [4, 8], [5, 8]],
          text: textAfterInserted
        });
      };
      it("change-to-last-character-of-line for each selection", function() {
        selectBlockwise();
        return ensureChange();
      });
      return it("[selection reversed] change-to-last-character-of-line for each selection", function() {
        selectBlockwiseReversely();
        return ensureChange();
      });
    });
    describe("D", function() {
      var ensureDelete;
      ensureDelete = function() {
        return ensure('D', {
          text: textAfterDeleted,
          cursor: [2, 4],
          mode: 'normal'
        });
      };
      it("delete-to-last-character-of-line for each selection", function() {
        selectBlockwise();
        return ensureDelete();
      });
      return it("[selection reversed] delete-to-last-character-of-line for each selection", function() {
        selectBlockwiseReversely();
        return ensureDelete();
      });
    });
    describe("I", function() {
      beforeEach(function() {
        return selectBlockwise();
      });
      return it("enter insert mode with each cursors position set to start of selection", function() {
        keystroke('I');
        editor.insertText("!!!");
        return ensure({
          text: "01234567890123456789\n1-------------------\n2----!!!A---------B----\n3----!!!***********---\n4----!!!+++++++++++--\n5----!!!C---------D-\n6-------------------",
          cursor: [[2, 8], [3, 8], [4, 8], [5, 8]],
          mode: 'insert'
        });
      });
    });
    describe("A", function() {
      beforeEach(function() {
        return selectBlockwise();
      });
      return it("enter insert mode with each cursors position set to end of selection", function() {
        keystroke('A');
        editor.insertText("!!!");
        return ensure({
          text: "01234567890123456789\n1-------------------\n2----A---------B!!!----\n3----***********!!!---\n4----+++++++++++!!!--\n5----C---------D!!!-\n6-------------------",
          cursor: [[2, 19], [3, 19], [4, 19], [5, 19]]
        });
      });
    });
    describe("o and O keybinding", function() {
      beforeEach(function() {
        return selectBlockwise();
      });
      describe('o', function() {
        return it("change blockwiseHead to opposite side and reverse selection", function() {
          keystroke('o');
          ensureBlockwiseSelection({
            head: 'top',
            tail: 'bottom',
            headReversed: true
          });
          keystroke('o');
          return ensureBlockwiseSelection({
            head: 'bottom',
            tail: 'top',
            headReversed: false
          });
        });
      });
      return describe('capital O', function() {
        return it("reverse each selection", function() {
          keystroke('O');
          ensureBlockwiseSelection({
            head: 'bottom',
            tail: 'top',
            headReversed: true
          });
          keystroke('O');
          return ensureBlockwiseSelection({
            head: 'bottom',
            tail: 'top',
            headReversed: false
          });
        });
      });
    });
    describe("shift from characterwise to blockwise", function() {
      describe("when selection is not reversed", function() {
        beforeEach(function() {
          set({
            cursor: [2, 5]
          });
          return ensure('v', {
            selectedText: 'A',
            mode: ['visual', 'characterwise']
          });
        });
        it('case-1', function() {
          ensure('3 j ctrl-v', {
            mode: ['visual', 'blockwise'],
            selectedTextOrdered: ['A', '*', '+', 'C']
          });
          return ensureBlockwiseSelection({
            head: 'bottom',
            tail: 'top',
            headReversed: false
          });
        });
        it('case-2', function() {
          ensure('h 3 j ctrl-v', {
            mode: ['visual', 'blockwise'],
            selectedTextOrdered: ['-A', '-*', '-+', '-C']
          });
          return ensureBlockwiseSelection({
            head: 'bottom',
            tail: 'top',
            headReversed: true
          });
        });
        it('case-3', function() {
          ensure('2 h 3 j ctrl-v', {
            mode: ['visual', 'blockwise'],
            selectedTextOrdered: ['--A', '--*', '--+', '--C']
          });
          return ensureBlockwiseSelection({
            head: 'bottom',
            tail: 'top',
            headReversed: true
          });
        });
        it('case-4', function() {
          ensure('l 3 j ctrl-v', {
            mode: ['visual', 'blockwise'],
            selectedTextOrdered: ['A-', '**', '++', 'C-']
          });
          return ensureBlockwiseSelection({
            head: 'bottom',
            tail: 'top',
            headReversed: false
          });
        });
        return it('case-5', function() {
          ensure('2 l 3 j ctrl-v', {
            mode: ['visual', 'blockwise'],
            selectedTextOrdered: ['A--', '***', '+++', 'C--']
          });
          return ensureBlockwiseSelection({
            head: 'bottom',
            tail: 'top',
            headReversed: false
          });
        });
      });
      return describe("when selection is reversed", function() {
        beforeEach(function() {
          set({
            cursor: [5, 5]
          });
          return ensure('v', {
            selectedText: 'C',
            mode: ['visual', 'characterwise']
          });
        });
        it('case-1', function() {
          ensure('3 k ctrl-v', {
            mode: ['visual', 'blockwise'],
            selectedTextOrdered: ['A', '*', '+', 'C']
          });
          return ensureBlockwiseSelection({
            head: 'top',
            tail: 'bottom',
            headReversed: true
          });
        });
        it('case-2', function() {
          ensure('h 3 k ctrl-v', {
            mode: ['visual', 'blockwise'],
            selectedTextOrdered: ['-A', '-*', '-+', '-C']
          });
          return ensureBlockwiseSelection({
            head: 'top',
            tail: 'bottom',
            headReversed: true
          });
        });
        it('case-3', function() {
          ensure('2 h 3 k ctrl-v', {
            mode: ['visual', 'blockwise'],
            selectedTextOrdered: ['--A', '--*', '--+', '--C']
          });
          return ensureBlockwiseSelection({
            head: 'top',
            tail: 'bottom',
            headReversed: true
          });
        });
        it('case-4', function() {
          ensure('l 3 k ctrl-v', {
            mode: ['visual', 'blockwise'],
            selectedTextOrdered: ['A-', '**', '++', 'C-']
          });
          return ensureBlockwiseSelection({
            head: 'top',
            tail: 'bottom',
            headReversed: false
          });
        });
        return it('case-5', function() {
          ensure('2 l 3 k ctrl-v', {
            mode: ['visual', 'blockwise'],
            selectedTextOrdered: ['A--', '***', '+++', 'C--']
          });
          return ensureBlockwiseSelection({
            head: 'top',
            tail: 'bottom',
            headReversed: false
          });
        });
      });
    });
    describe("shift from blockwise to characterwise", function() {
      var ensureCharacterwiseWasRestored, preserveSelection;
      preserveSelection = function() {
        var cursor, mode, selectedBufferRange, selectedText;
        selectedText = editor.getSelectedText();
        selectedBufferRange = editor.getSelectedBufferRange();
        cursor = editor.getCursorBufferPosition();
        mode = [vimState.mode, vimState.submode];
        return {
          selectedText: selectedText,
          selectedBufferRange: selectedBufferRange,
          cursor: cursor,
          mode: mode
        };
      };
      ensureCharacterwiseWasRestored = function(keystroke) {
        var characterwiseState;
        ensure(keystroke, {
          mode: ['visual', 'characterwise']
        });
        characterwiseState = preserveSelection();
        ensure('ctrl-v', {
          mode: ['visual', 'blockwise']
        });
        return ensure('v', characterwiseState);
      };
      describe("when selection is not reversed", function() {
        beforeEach(function() {
          return set({
            cursor: [2, 5]
          });
        });
        it('case-1', function() {
          return ensureCharacterwiseWasRestored('v');
        });
        it('case-2', function() {
          return ensureCharacterwiseWasRestored('v 3 j');
        });
        it('case-3', function() {
          return ensureCharacterwiseWasRestored('v h 3 j');
        });
        it('case-4', function() {
          return ensureCharacterwiseWasRestored('v 2 h 3 j');
        });
        it('case-5', function() {
          return ensureCharacterwiseWasRestored('v l 3 j');
        });
        return it('case-6', function() {
          return ensureCharacterwiseWasRestored('v 2 l 3 j');
        });
      });
      return describe("when selection is reversed", function() {
        beforeEach(function() {
          return set({
            cursor: [5, 5]
          });
        });
        it('case-1', function() {
          return ensureCharacterwiseWasRestored('v');
        });
        it('case-2', function() {
          return ensureCharacterwiseWasRestored('v 3 k');
        });
        it('case-3', function() {
          return ensureCharacterwiseWasRestored('v h 3 k');
        });
        it('case-4', function() {
          return ensureCharacterwiseWasRestored('v 2 h 3 k');
        });
        it('case-5', function() {
          return ensureCharacterwiseWasRestored('v l 3 k');
        });
        it('case-6', function() {
          return ensureCharacterwiseWasRestored('v 2 l 3 k');
        });
        return it('case-7', function() {
          set({
            cursor: [5, 0]
          });
          return ensureCharacterwiseWasRestored('v 5 l 3 k');
        });
      });
    });
    describe("keep goalColumn", function() {
      describe("when passing through blank row", function() {
        beforeEach(function() {
          return set({
            text: "012345678\n\nABCDEFGHI\n"
          });
        });
        it("when [reversed = false, headReversed = false]", function() {
          set({
            cursor: [0, 3]
          });
          ensure("ctrl-v l l l", {
            cursor: [[0, 7]],
            selectedTextOrdered: ["3456"]
          });
          ensureBlockwiseSelection({
            head: 'bottom',
            tail: 'top',
            reversed: false,
            headReversed: false
          });
          ensure("j", {
            cursor: [[0, 0], [1, 0]],
            selectedTextOrdered: ["0123", ""]
          });
          ensureBlockwiseSelection({
            head: 'bottom',
            tail: 'top',
            reversed: false,
            headReversed: true
          });
          ensure("j", {
            cursor: [[0, 7], [1, 0], [2, 7]],
            selectedTextOrdered: ["3456", "", "DEFG"]
          });
          return ensureBlockwiseSelection({
            head: 'bottom',
            tail: 'top',
            reversed: false,
            headReversed: false
          });
        });
        it("when [reversed = true, headReversed = true]", function() {
          set({
            cursor: [2, 6]
          });
          ensure("ctrl-v h h h", {
            cursor: [[2, 3]],
            selectedTextOrdered: ["DEFG"]
          });
          ensureBlockwiseSelection({
            head: 'top',
            tail: 'bottom',
            reversed: true,
            headReversed: true
          });
          ensure("k", {
            cursor: [[1, 0], [2, 0]],
            selectedTextOrdered: ["", "ABCDEFG"]
          });
          ensureBlockwiseSelection({
            head: 'top',
            tail: 'bottom',
            reversed: true,
            headReversed: true
          });
          ensure("k", {
            cursor: [[0, 3], [1, 0], [2, 3]],
            selectedTextOrdered: ["3456", "", "DEFG"]
          });
          return ensureBlockwiseSelection({
            head: 'top',
            tail: 'bottom',
            reversed: true,
            headReversed: true
          });
        });
        it("when [reversed = false, headReversed = true]", function() {
          set({
            cursor: [0, 6]
          });
          ensure("ctrl-v h h h", {
            cursor: [[0, 3]],
            selectedTextOrdered: ["3456"]
          });
          ensureBlockwiseSelection({
            head: 'bottom',
            tail: 'top',
            reversed: true,
            headReversed: true
          });
          ensure("j", {
            cursor: [[0, 0], [1, 0]],
            selectedTextOrdered: ["0123456", ""]
          });
          ensureBlockwiseSelection({
            head: 'bottom',
            tail: 'top',
            reversed: false,
            headReversed: true
          });
          ensure("j", {
            cursor: [[0, 3], [1, 0], [2, 3]],
            selectedTextOrdered: ["3456", "", "DEFG"]
          });
          return ensureBlockwiseSelection({
            head: 'bottom',
            tail: 'top',
            reversed: false,
            headReversed: true
          });
        });
        return it("when [reversed = true, headReversed = false]", function() {
          set({
            cursor: [2, 3]
          });
          ensure("ctrl-v l l l", {
            cursor: [[2, 7]],
            selectedTextOrdered: ["DEFG"]
          });
          ensureBlockwiseSelection({
            head: 'top',
            tail: 'bottom',
            reversed: false,
            headReversed: false
          });
          ensure("k", {
            cursor: [[1, 0], [2, 0]],
            selectedTextOrdered: ["", "ABCD"]
          });
          ensureBlockwiseSelection({
            head: 'top',
            tail: 'bottom',
            reversed: true,
            headReversed: true
          });
          ensure("k", {
            cursor: [[0, 7], [1, 0], [2, 7]],
            selectedTextOrdered: ["3456", "", "DEFG"]
          });
          return ensureBlockwiseSelection({
            head: 'top',
            tail: 'bottom',
            reversed: true,
            headReversed: false
          });
        });
      });
      return describe("when head cursor position is less than original goal column", function() {
        beforeEach(function() {
          return set({
            text: "012345678901234567890123\n       xxx01234\n012345678901234567890123\n"
          });
        });
        describe("[tailColumn < headColum], goalColumn isnt Infinity", function() {
          it("shrinks block till head column by keeping goalColumn", function() {
            set({
              cursor: [0, 10]
            });
            ensure("ctrl-v 1 0 l", {
              selectedTextOrdered: ["01234567890"],
              cursor: [[0, 21]]
            });
            ensure("j", {
              selectedTextOrdered: ["012345", "01234"],
              cursor: [[0, 16], [1, 15]]
            });
            return ensure("j", {
              selectedTextOrdered: ["01234567890", "01234", "01234567890"],
              cursor: [[0, 21], [1, 15], [2, 21]]
            });
          });
          return it("shrinks block till head column by keeping goalColumn", function() {
            set({
              cursor: [2, 10]
            });
            ensure("ctrl-v 1 0 l", {
              selectedTextOrdered: ["01234567890"],
              cursor: [[2, 21]]
            });
            ensure("k", {
              selectedTextOrdered: ["01234", "012345"],
              cursor: [[1, 15], [2, 16]]
            });
            return ensure("k", {
              selectedTextOrdered: ["01234567890", "01234", "01234567890"],
              cursor: [[0, 21], [1, 15], [2, 21]]
            });
          });
        });
        describe("[tailColumn < headColum], goalColumn is Infinity", function() {
          it("keep each member selection selected till end-of-line( No shrink )", function() {
            set({
              cursor: [0, 10]
            });
            ensure("ctrl-v $", {
              selectedTextOrdered: ["01234567890123"],
              cursor: [[0, 24]]
            });
            ensure("j", {
              selectedTextOrdered: ["01234567890123", "01234"],
              cursor: [[0, 24], [1, 15]]
            });
            return ensure("j", {
              selectedTextOrdered: ["01234567890123", "01234", "01234567890123"],
              cursor: [[0, 24], [1, 15], [2, 24]]
            });
          });
          return it("keep each member selection selected till end-of-line( No shrink )", function() {
            set({
              cursor: [2, 10]
            });
            ensure("ctrl-v $", {
              selectedTextOrdered: ["01234567890123"],
              cursor: [[2, 24]]
            });
            ensure("k", {
              selectedTextOrdered: ["01234", "01234567890123"],
              cursor: [[1, 15], [2, 24]]
            });
            return ensure("k", {
              selectedTextOrdered: ["01234567890123", "01234", "01234567890123"],
              cursor: [[0, 24], [1, 15], [2, 24]]
            });
          });
        });
        describe("[tailColumn > headColum], goalColumn isnt Infinity", function() {
          it("Respect actual head column over goalColumn", function() {
            set({
              cursor: [0, 20]
            });
            ensure("ctrl-v l l", {
              selectedTextOrdered: ["012"],
              cursor: [[0, 23]]
            });
            ensure("j", {
              selectedTextOrdered: ["567890", ""],
              cursor: [[0, 15], [1, 15]]
            });
            return ensure("j", {
              selectedTextOrdered: ["012", "", "012"],
              cursor: [[0, 23], [1, 15], [2, 23]]
            });
          });
          return it("Respect actual head column over goalColumn", function() {
            set({
              cursor: [2, 20]
            });
            ensure("ctrl-v l l", {
              selectedTextOrdered: ["012"],
              cursor: [[2, 23]]
            });
            ensure("k", {
              selectedTextOrdered: ["", "567890"],
              cursor: [[1, 15], [2, 15]]
            });
            return ensure("k", {
              selectedTextOrdered: ["012", "", "012"],
              cursor: [[0, 23], [1, 15], [2, 23]]
            });
          });
        });
        return describe("[tailColumn > headColum], goalColumn is Infinity", function() {
          it("Respect actual head column over goalColumn", function() {
            set({
              cursor: [0, 20]
            });
            ensure("ctrl-v $", {
              selectedTextOrdered: ["0123"],
              cursor: [[0, 24]]
            });
            ensure("j", {
              selectedTextOrdered: ["567890", ""],
              cursor: [[0, 15], [1, 15]]
            });
            return ensure("j", {
              selectedTextOrdered: ["0123", "", "0123"],
              cursor: [[0, 24], [1, 15], [2, 24]]
            });
          });
          return it("Respect actual head column over goalColumn", function() {
            set({
              cursor: [2, 20]
            });
            ensure("ctrl-v $", {
              selectedTextOrdered: ["0123"],
              cursor: [[2, 24]]
            });
            ensure("k", {
              selectedTextOrdered: ["", "567890"],
              cursor: [[1, 15], [2, 15]]
            });
            return ensure("k", {
              selectedTextOrdered: ["0123", "", "0123"],
              cursor: [[0, 24], [1, 15], [2, 24]]
            });
          });
        });
      });
    });
    return describe("gv feature", function() {
      var ensureRestored, preserveSelection;
      preserveSelection = function() {
        var cursor, mode, s, selectedBufferRangeOrdered, selectedTextOrdered, selections;
        selections = editor.getSelectionsOrderedByBufferPosition();
        selectedTextOrdered = (function() {
          var i, len, results;
          results = [];
          for (i = 0, len = selections.length; i < len; i++) {
            s = selections[i];
            results.push(s.getText());
          }
          return results;
        })();
        selectedBufferRangeOrdered = (function() {
          var i, len, results;
          results = [];
          for (i = 0, len = selections.length; i < len; i++) {
            s = selections[i];
            results.push(s.getBufferRange());
          }
          return results;
        })();
        cursor = (function() {
          var i, len, results;
          results = [];
          for (i = 0, len = selections.length; i < len; i++) {
            s = selections[i];
            results.push(s.getHeadScreenPosition());
          }
          return results;
        })();
        mode = [vimState.mode, vimState.submode];
        return {
          selectedTextOrdered: selectedTextOrdered,
          selectedBufferRangeOrdered: selectedBufferRangeOrdered,
          cursor: cursor,
          mode: mode
        };
      };
      ensureRestored = function(keystroke, spec) {
        var preserved;
        ensure(keystroke, spec);
        preserved = preserveSelection();
        ensure('escape j j', {
          mode: 'normal',
          selectedText: ''
        });
        return ensure('g v', preserved);
      };
      describe("linewise selection", function() {
        beforeEach(function() {
          return set({
            cursor: [2, 0]
          });
        });
        describe("immediately after V", function() {
          return it('restore previous selection', function() {
            return ensureRestored('V', {
              selectedText: textData.getLines([2]),
              mode: ['visual', 'linewise']
            });
          });
        });
        describe("selection is not reversed", function() {
          return it('restore previous selection', function() {
            return ensureRestored('V j', {
              selectedText: textData.getLines([2, 3]),
              mode: ['visual', 'linewise']
            });
          });
        });
        return describe("selection is reversed", function() {
          return it('restore previous selection', function() {
            return ensureRestored('V k', {
              selectedText: textData.getLines([1, 2]),
              mode: ['visual', 'linewise']
            });
          });
        });
      });
      describe("characterwise selection", function() {
        beforeEach(function() {
          return set({
            cursor: [2, 0]
          });
        });
        describe("immediately after v", function() {
          return it('restore previous selection', function() {
            return ensureRestored('v', {
              selectedText: "2",
              mode: ['visual', 'characterwise']
            });
          });
        });
        describe("selection is not reversed", function() {
          return it('restore previous selection', function() {
            return ensureRestored('v j', {
              selectedText: "2----A---------B----\n3",
              mode: ['visual', 'characterwise']
            });
          });
        });
        return describe("selection is reversed", function() {
          return it('restore previous selection', function() {
            return ensureRestored('v k', {
              selectedText: "1-------------------\n2",
              mode: ['visual', 'characterwise']
            });
          });
        });
      });
      return describe("blockwise selection", function() {
        describe("immediately after ctrl-v", function() {
          beforeEach(function() {
            return set({
              cursor: [2, 0]
            });
          });
          return it('restore previous selection', function() {
            return ensureRestored('ctrl-v', {
              selectedText: "2",
              mode: ['visual', 'blockwise']
            });
          });
        });
        describe("selection is not reversed", function() {
          it('restore previous selection case-1', function() {
            set({
              cursor: [2, 5]
            });
            keystroke('ctrl-v 1 0 l');
            return ensureRestored('3 j', {
              selectedText: blockTexts.slice(2, 6),
              mode: ['visual', 'blockwise']
            });
          });
          return it('restore previous selection case-2', function() {
            set({
              cursor: [5, 5]
            });
            keystroke('ctrl-v 1 0 l');
            return ensureRestored('3 k', {
              selectedTextOrdered: blockTexts.slice(2, 6),
              mode: ['visual', 'blockwise']
            });
          });
        });
        return describe("selection is reversed", function() {
          it('restore previous selection case-1', function() {
            set({
              cursor: [2, 15]
            });
            keystroke('ctrl-v 1 0 h');
            return ensureRestored('3 j', {
              selectedText: blockTexts.slice(2, 6),
              mode: ['visual', 'blockwise']
            });
          });
          return it('restore previous selection case-2', function() {
            set({
              cursor: [5, 15]
            });
            keystroke('ctrl-v 1 0 h');
            return ensureRestored('3 k', {
              selectedTextOrdered: blockTexts.slice(2, 6),
              mode: ['visual', 'blockwise']
            });
          });
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9zcGVjL3Zpc3VhbC1ibG9ja3dpc2Utc3BlYy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLDBCQUFBO0lBQUE7O0VBQUEsTUFBMEIsT0FBQSxDQUFRLGVBQVIsQ0FBMUIsRUFBQyw2QkFBRCxFQUFjOztFQUVkLFFBQUEsQ0FBUyxrQkFBVCxFQUE2QixTQUFBO0FBQzNCLFFBQUE7SUFBQSxPQUE0RCxFQUE1RCxFQUFDLGFBQUQsRUFBTSxnQkFBTixFQUFjLG1CQUFkLEVBQXlCLGdCQUF6QixFQUFpQyx1QkFBakMsRUFBZ0Q7SUFDaEQsV0FBQSxHQUFjO0lBVWQsZ0JBQUEsR0FBbUI7SUFVbkIsaUJBQUEsR0FBb0I7SUFVcEIsVUFBQSxHQUFhLENBQ1gsYUFEVyxFQUVYLGFBRlcsRUFHWCxhQUhXLEVBSVgsYUFKVyxFQUtYLGFBTFcsRUFNWCxhQU5XLEVBT1gsYUFQVztJQVViLFFBQUEsR0FBZSxJQUFBLFFBQUEsQ0FBUyxXQUFUO0lBRWYsZUFBQSxHQUFrQixTQUFBO01BQ2hCLEdBQUEsQ0FBSTtRQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7T0FBSjthQUNBLE1BQUEsQ0FBTyxvQkFBUCxFQUNFO1FBQUEsSUFBQSxFQUFNLENBQUMsUUFBRCxFQUFXLFdBQVgsQ0FBTjtRQUNBLG1CQUFBLEVBQXFCLENBQ25CLENBQUMsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFELEVBQVMsQ0FBQyxDQUFELEVBQUksRUFBSixDQUFULENBRG1CLEVBRW5CLENBQUMsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFELEVBQVMsQ0FBQyxDQUFELEVBQUksRUFBSixDQUFULENBRm1CLEVBR25CLENBQUMsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFELEVBQVMsQ0FBQyxDQUFELEVBQUksRUFBSixDQUFU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QUhzQyxDQUF4QztpQkFNQSxFQUFBLENBQUcsbUNBQUgsRUFBd0MsU0FBQTtZQUN0QyxHQUFBLENBQUk7Y0FBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksRUFBSixDQUFSO2FBQUo7WUFDQSxTQUFBLENBQVUsY0FBVjttQkFDQSxjQUFBLENBQWUsS0FBZixFQUNFO2NBQUEsbUJBQUEsRUFBcUIsVUFBVyxZQUFoQztjQUNBLElBQUEsRUFBTSxDQUFDLFFBQUQsRUFBVyxXQUFYLENBRE47YUFERjtVQUhzQyxDQUF4QztRQVBnQyxDQUFsQztNQXJCOEIsQ0FBaEM7SUEzRHFCLENBQXZCO0VBN2YyQixDQUE3QjtBQUZBIiwic291cmNlc0NvbnRlbnQiOlsie2dldFZpbVN0YXRlLCBUZXh0RGF0YX0gPSByZXF1aXJlICcuL3NwZWMtaGVscGVyJ1xuXG5kZXNjcmliZSBcIlZpc3VhbCBCbG9ja3dpc2VcIiwgLT5cbiAgW3NldCwgZW5zdXJlLCBrZXlzdHJva2UsIGVkaXRvciwgZWRpdG9yRWxlbWVudCwgdmltU3RhdGVdID0gW11cbiAgdGV4dEluaXRpYWwgPSBcIlwiXCJcbiAgICAwMTIzNDU2Nzg5MDEyMzQ1Njc4OVxuICAgIDEtLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgMi0tLS1BLS0tLS0tLS0tQi0tLS1cbiAgICAzLS0tLSoqKioqKioqKioqLS0tXG4gICAgNC0tLS0rKysrKysrKysrKy0tXG4gICAgNS0tLS1DLS0tLS0tLS0tRC1cbiAgICA2LS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIFwiXCJcIlxuXG4gIHRleHRBZnRlckRlbGV0ZWQgPSBcIlwiXCJcbiAgICAwMTIzNDU2Nzg5MDEyMzQ1Njc4OVxuICAgIDEtLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgMi0tLS1cbiAgICAzLS0tLVxuICAgIDQtLS0tXG4gICAgNS0tLS1cbiAgICA2LS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIFwiXCJcIlxuXG4gIHRleHRBZnRlckluc2VydGVkID0gXCJcIlwiXG4gICAgMDEyMzQ1Njc4OTAxMjM0NTY3ODlcbiAgICAxLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIDItLS0tISEhXG4gICAgMy0tLS0hISFcbiAgICA0LS0tLSEhIVxuICAgIDUtLS0tISEhXG4gICAgNi0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICBcIlwiXCJcblxuICBibG9ja1RleHRzID0gW1xuICAgICc1Njc4OTAxMjM0NScgIyAwXG4gICAgJy0tLS0tLS0tLS0tJyAjIDFcbiAgICAnQS0tLS0tLS0tLUInICMgMlxuICAgICcqKioqKioqKioqKicgIyAzXG4gICAgJysrKysrKysrKysrJyAjIDRcbiAgICAnQy0tLS0tLS0tLUQnICMgNVxuICAgICctLS0tLS0tLS0tLScgIyA2XG4gIF1cblxuICB0ZXh0RGF0YSA9IG5ldyBUZXh0RGF0YSh0ZXh0SW5pdGlhbClcblxuICBzZWxlY3RCbG9ja3dpc2UgPSAtPlxuICAgIHNldCBjdXJzb3I6IFsyLCA1XVxuICAgIGVuc3VyZSAndiAzIGogMSAwIGwgY3RybC12JyxcbiAgICAgIG1vZGU6IFsndmlzdWFsJywgJ2Jsb2Nrd2lzZSddXG4gICAgICBzZWxlY3RlZEJ1ZmZlclJhbmdlOiBbXG4gICAgICAgIFtbMiwgNV0sIFsyLCAxNl1dXG4gICAgICAgIFtbMywgNV0sIFszLCAxNl1dXG4gICAgICAgIFtbNCwgNV0sIFs0LCAxNl1dXG4gICAgICAgIFtbNSwgNV0sIFs1LCAxNl1dXG4gICAgICBdXG4gICAgICBzZWxlY3RlZFRleHQ6IGJsb2NrVGV4dHNbMi4uNV1cblxuICBzZWxlY3RCbG9ja3dpc2VSZXZlcnNlbHkgPSAtPlxuICAgIHNldCBjdXJzb3I6IFsyLCAxNV1cbiAgICBlbnN1cmUgJ3YgMyBqIDEgMCBoIGN0cmwtdicsXG4gICAgICBtb2RlOiBbJ3Zpc3VhbCcsICdibG9ja3dpc2UnXVxuICAgICAgc2VsZWN0ZWRCdWZmZXJSYW5nZTogW1xuICAgICAgICBbWzIsIDVdLCBbMiwgMTZdXVxuICAgICAgICBbWzMsIDVdLCBbMywgMTZdXVxuICAgICAgICBbWzQsIDVdLCBbNCwgMTZdXVxuICAgICAgICBbWzUsIDVdLCBbNSwgMTZdXVxuICAgICAgXVxuICAgICAgc2VsZWN0ZWRUZXh0OiBibG9ja1RleHRzWzIuLjVdXG5cbiAgZW5zdXJlQmxvY2t3aXNlU2VsZWN0aW9uID0gKG8pIC0+XG4gICAgc2VsZWN0aW9ucyA9IGVkaXRvci5nZXRTZWxlY3Rpb25zT3JkZXJlZEJ5QnVmZmVyUG9zaXRpb24oKVxuICAgIGlmIHNlbGVjdGlvbnMubGVuZ3RoIGlzIDFcbiAgICAgIGZpcnN0ID0gbGFzdCA9IHNlbGVjdGlvbnNbMF1cbiAgICBlbHNlXG4gICAgICBbZmlyc3QsIG90aGVycy4uLiwgbGFzdF0gPSBzZWxlY3Rpb25zXG5cbiAgICBoZWFkID0gc3dpdGNoIG8uaGVhZFxuICAgICAgd2hlbiAndG9wJyB0aGVuIGZpcnN0XG4gICAgICB3aGVuICdib3R0b20nIHRoZW4gbGFzdFxuICAgIGJzID0gdmltU3RhdGUuZ2V0TGFzdEJsb2Nrd2lzZVNlbGVjdGlvbigpXG5cbiAgICBleHBlY3QoYnMuZ2V0SGVhZFNlbGVjdGlvbigpKS50b0JlIGhlYWRcbiAgICB0YWlsID0gc3dpdGNoIG8udGFpbFxuICAgICAgd2hlbiAndG9wJyB0aGVuIGZpcnN0XG4gICAgICB3aGVuICdib3R0b20nIHRoZW4gbGFzdFxuICAgIGV4cGVjdChicy5nZXRUYWlsU2VsZWN0aW9uKCkpLnRvQmUgdGFpbFxuXG4gICAgZm9yIHMgaW4gb3RoZXJzID8gW11cbiAgICAgIGV4cGVjdChicy5nZXRIZWFkU2VsZWN0aW9uKCkpLm5vdC50b0JlIHNcbiAgICAgIGV4cGVjdChicy5nZXRUYWlsU2VsZWN0aW9uKCkpLm5vdC50b0JlIHNcblxuICAgIGlmIG8ucmV2ZXJzZWQ/XG4gICAgICBleHBlY3QoYnMuaXNSZXZlcnNlZCgpKS50b0JlIG8ucmV2ZXJzZWRcblxuICAgIGlmIG8uaGVhZFJldmVyc2VkP1xuICAgICAgZm9yIHMgaW4gc2VsZWN0aW9uc1xuICAgICAgICBleHBlY3Qocy5pc1JldmVyc2VkKCkpLnRvQmUgby5oZWFkUmV2ZXJzZWRcblxuICBiZWZvcmVFYWNoIC0+XG4gICAgZ2V0VmltU3RhdGUgKHN0YXRlLCB2aW1FZGl0b3IpIC0+XG4gICAgICB2aW1TdGF0ZSA9IHN0YXRlXG4gICAgICB7ZWRpdG9yLCBlZGl0b3JFbGVtZW50fSA9IHZpbVN0YXRlXG4gICAgICB7c2V0LCBlbnN1cmUsIGtleXN0cm9rZX0gPSB2aW1FZGl0b3JcblxuICAgIHJ1bnMgLT5cbiAgICAgIHNldCB0ZXh0OiB0ZXh0SW5pdGlhbFxuXG4gIGRlc2NyaWJlIFwialwiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNldCBjdXJzb3I6IFszLCA1XVxuICAgICAgZW5zdXJlICd2IDEgMCBsIGN0cmwtdicsXG4gICAgICAgIHNlbGVjdGVkVGV4dDogYmxvY2tUZXh0c1szXVxuICAgICAgICBtb2RlOiBbJ3Zpc3VhbCcsICdibG9ja3dpc2UnXVxuXG4gICAgaXQgXCJhZGQgc2VsZWN0aW9uIHRvIGRvd24gZGlyZWN0aW9uXCIsIC0+XG4gICAgICBlbnN1cmUgJ2onLCBzZWxlY3RlZFRleHQ6IGJsb2NrVGV4dHNbMy4uNF1cbiAgICAgIGVuc3VyZSAnaicsIHNlbGVjdGVkVGV4dDogYmxvY2tUZXh0c1szLi41XVxuXG4gICAgaXQgXCJkZWxldGUgc2VsZWN0aW9uIHdoZW4gYmxvY3dpc2UgaXMgcmV2ZXJzZWRcIiwgLT5cbiAgICAgIGVuc3VyZSAnMyBrJywgc2VsZWN0ZWRUZXh0T3JkZXJlZDogYmxvY2tUZXh0c1swLi4zXVxuICAgICAgZW5zdXJlICdqJywgc2VsZWN0ZWRUZXh0T3JkZXJlZDogYmxvY2tUZXh0c1sxLi4zXVxuICAgICAgZW5zdXJlICcyIGonLCBzZWxlY3RlZFRleHRPcmRlcmVkOiBibG9ja1RleHRzWzNdXG5cbiAgICBpdCBcImtlZXAgdGFpbCByb3cgd2hlbiByZXZlcnNlZCBzdGF0dXMgY2hhbmdlZFwiLCAtPlxuICAgICAgZW5zdXJlICdqJywgc2VsZWN0ZWRUZXh0OiBibG9ja1RleHRzWzMuLjRdXG4gICAgICBlbnN1cmUgJzIgaycsIHNlbGVjdGVkVGV4dE9yZGVyZWQ6IGJsb2NrVGV4dHNbMi4uM11cblxuICBkZXNjcmliZSBcImtcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXQgY3Vyc29yOiBbMywgNV1cbiAgICAgIGVuc3VyZSAndiAxIDAgbCBjdHJsLXYnLFxuICAgICAgICBzZWxlY3RlZFRleHQ6IGJsb2NrVGV4dHNbM11cbiAgICAgICAgbW9kZTogWyd2aXN1YWwnLCAnYmxvY2t3aXNlJ11cblxuICAgIGl0IFwiYWRkIHNlbGVjdGlvbiB0byB1cCBkaXJlY3Rpb25cIiwgLT5cbiAgICAgIGVuc3VyZSAnaycsIHNlbGVjdGVkVGV4dE9yZGVyZWQ6IGJsb2NrVGV4dHNbMi4uM11cbiAgICAgIGVuc3VyZSAnaycsIHNlbGVjdGVkVGV4dE9yZGVyZWQ6IGJsb2NrVGV4dHNbMS4uM11cblxuICAgIGl0IFwiZGVsZXRlIHNlbGVjdGlvbiB3aGVuIGJsb2N3aXNlIGlzIHJldmVyc2VkXCIsIC0+XG4gICAgICBlbnN1cmUgJzMgaicsIHNlbGVjdGVkVGV4dE9yZGVyZWQ6IGJsb2NrVGV4dHNbMy4uNl1cbiAgICAgIGVuc3VyZSAnaycsIHNlbGVjdGVkVGV4dE9yZGVyZWQ6IGJsb2NrVGV4dHNbMy4uNV1cbiAgICAgIGVuc3VyZSAnMiBrJywgc2VsZWN0ZWRUZXh0T3JkZXJlZDogYmxvY2tUZXh0c1szXVxuXG4gICMgRklYTUUgYWRkIEMsIEQgc3BlYyBmb3Igc2VsZWN0QmxvY2t3aXNlUmV2ZXJzZWx5KCkgc2l0dWF0aW9uXG4gIGRlc2NyaWJlIFwiQ1wiLCAtPlxuICAgIGVuc3VyZUNoYW5nZSA9IC0+XG4gICAgICBlbnN1cmUgJ0MnLFxuICAgICAgICBtb2RlOiAnaW5zZXJ0J1xuICAgICAgICBjdXJzb3I6IFtbMiwgNV0sIFszLCA1XSwgWzQsIDVdLCBbNSwgNV0gXVxuICAgICAgICB0ZXh0OiB0ZXh0QWZ0ZXJEZWxldGVkXG4gICAgICBlZGl0b3IuaW5zZXJ0VGV4dChcIiEhIVwiKVxuICAgICAgZW5zdXJlXG4gICAgICAgIG1vZGU6ICdpbnNlcnQnXG4gICAgICAgIGN1cnNvcjogW1syLCA4XSwgWzMsIDhdLCBbNCwgOF0sIFs1LCA4XV1cbiAgICAgICAgdGV4dDogdGV4dEFmdGVySW5zZXJ0ZWRcblxuICAgIGl0IFwiY2hhbmdlLXRvLWxhc3QtY2hhcmFjdGVyLW9mLWxpbmUgZm9yIGVhY2ggc2VsZWN0aW9uXCIsIC0+XG4gICAgICBzZWxlY3RCbG9ja3dpc2UoKVxuICAgICAgZW5zdXJlQ2hhbmdlKClcblxuICAgIGl0IFwiW3NlbGVjdGlvbiByZXZlcnNlZF0gY2hhbmdlLXRvLWxhc3QtY2hhcmFjdGVyLW9mLWxpbmUgZm9yIGVhY2ggc2VsZWN0aW9uXCIsIC0+XG4gICAgICBzZWxlY3RCbG9ja3dpc2VSZXZlcnNlbHkoKVxuICAgICAgZW5zdXJlQ2hhbmdlKClcblxuICBkZXNjcmliZSBcIkRcIiwgLT5cbiAgICBlbnN1cmVEZWxldGUgPSAtPlxuICAgICAgZW5zdXJlICdEJyxcbiAgICAgICAgdGV4dDogdGV4dEFmdGVyRGVsZXRlZFxuICAgICAgICBjdXJzb3I6IFsyLCA0XVxuICAgICAgICBtb2RlOiAnbm9ybWFsJ1xuXG4gICAgaXQgXCJkZWxldGUtdG8tbGFzdC1jaGFyYWN0ZXItb2YtbGluZSBmb3IgZWFjaCBzZWxlY3Rpb25cIiwgLT5cbiAgICAgIHNlbGVjdEJsb2Nrd2lzZSgpXG4gICAgICBlbnN1cmVEZWxldGUoKVxuICAgIGl0IFwiW3NlbGVjdGlvbiByZXZlcnNlZF0gZGVsZXRlLXRvLWxhc3QtY2hhcmFjdGVyLW9mLWxpbmUgZm9yIGVhY2ggc2VsZWN0aW9uXCIsIC0+XG4gICAgICBzZWxlY3RCbG9ja3dpc2VSZXZlcnNlbHkoKVxuICAgICAgZW5zdXJlRGVsZXRlKClcblxuICBkZXNjcmliZSBcIklcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZWxlY3RCbG9ja3dpc2UoKVxuICAgIGl0IFwiZW50ZXIgaW5zZXJ0IG1vZGUgd2l0aCBlYWNoIGN1cnNvcnMgcG9zaXRpb24gc2V0IHRvIHN0YXJ0IG9mIHNlbGVjdGlvblwiLCAtPlxuICAgICAga2V5c3Ryb2tlICdJJ1xuICAgICAgZWRpdG9yLmluc2VydFRleHQgXCIhISFcIlxuICAgICAgZW5zdXJlXG4gICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgIDAxMjM0NTY3ODkwMTIzNDU2Nzg5XG4gICAgICAgICAgMS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgICAgICAyLS0tLSEhIUEtLS0tLS0tLS1CLS0tLVxuICAgICAgICAgIDMtLS0tISEhKioqKioqKioqKiotLS1cbiAgICAgICAgICA0LS0tLSEhISsrKysrKysrKysrLS1cbiAgICAgICAgICA1LS0tLSEhIUMtLS0tLS0tLS1ELVxuICAgICAgICAgIDYtLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgIGN1cnNvcjogW1xuICAgICAgICAgICAgWzIsIDhdLFxuICAgICAgICAgICAgWzMsIDhdLFxuICAgICAgICAgICAgWzQsIDhdLFxuICAgICAgICAgICAgWzUsIDhdLFxuICAgICAgICAgIF1cbiAgICAgICAgbW9kZTogJ2luc2VydCdcblxuICBkZXNjcmliZSBcIkFcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZWxlY3RCbG9ja3dpc2UoKVxuICAgIGl0IFwiZW50ZXIgaW5zZXJ0IG1vZGUgd2l0aCBlYWNoIGN1cnNvcnMgcG9zaXRpb24gc2V0IHRvIGVuZCBvZiBzZWxlY3Rpb25cIiwgLT5cbiAgICAgIGtleXN0cm9rZSAnQSdcbiAgICAgIGVkaXRvci5pbnNlcnRUZXh0IFwiISEhXCJcbiAgICAgIGVuc3VyZVxuICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAwMTIzNDU2Nzg5MDEyMzQ1Njc4OVxuICAgICAgICAgIDEtLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAgICAgMi0tLS1BLS0tLS0tLS0tQiEhIS0tLS1cbiAgICAgICAgICAzLS0tLSoqKioqKioqKioqISEhLS0tXG4gICAgICAgICAgNC0tLS0rKysrKysrKysrKyEhIS0tXG4gICAgICAgICAgNS0tLS1DLS0tLS0tLS0tRCEhIS1cbiAgICAgICAgICA2LS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgICAgIFwiXCJcIlxuICAgICAgICBjdXJzb3I6IFtcbiAgICAgICAgICAgIFsyLCAxOV0sXG4gICAgICAgICAgICBbMywgMTldLFxuICAgICAgICAgICAgWzQsIDE5XSxcbiAgICAgICAgICAgIFs1LCAxOV0sXG4gICAgICAgICAgXVxuXG4gIGRlc2NyaWJlIFwibyBhbmQgTyBrZXliaW5kaW5nXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2VsZWN0QmxvY2t3aXNlKClcblxuICAgIGRlc2NyaWJlICdvJywgLT5cbiAgICAgIGl0IFwiY2hhbmdlIGJsb2Nrd2lzZUhlYWQgdG8gb3Bwb3NpdGUgc2lkZSBhbmQgcmV2ZXJzZSBzZWxlY3Rpb25cIiwgLT5cbiAgICAgICAga2V5c3Ryb2tlICdvJ1xuICAgICAgICBlbnN1cmVCbG9ja3dpc2VTZWxlY3Rpb24gaGVhZDogJ3RvcCcsIHRhaWw6ICdib3R0b20nLCBoZWFkUmV2ZXJzZWQ6IHRydWVcblxuICAgICAgICBrZXlzdHJva2UgJ28nXG4gICAgICAgIGVuc3VyZUJsb2Nrd2lzZVNlbGVjdGlvbiBoZWFkOiAnYm90dG9tJywgdGFpbDogJ3RvcCcsIGhlYWRSZXZlcnNlZDogZmFsc2VcbiAgICBkZXNjcmliZSAnY2FwaXRhbCBPJywgLT5cbiAgICAgIGl0IFwicmV2ZXJzZSBlYWNoIHNlbGVjdGlvblwiLCAtPlxuICAgICAgICBrZXlzdHJva2UgJ08nXG4gICAgICAgIGVuc3VyZUJsb2Nrd2lzZVNlbGVjdGlvbiBoZWFkOiAnYm90dG9tJywgdGFpbDogJ3RvcCcsIGhlYWRSZXZlcnNlZDogdHJ1ZVxuICAgICAgICBrZXlzdHJva2UgJ08nXG4gICAgICAgIGVuc3VyZUJsb2Nrd2lzZVNlbGVjdGlvbiBoZWFkOiAnYm90dG9tJywgdGFpbDogJ3RvcCcsIGhlYWRSZXZlcnNlZDogZmFsc2VcblxuICBkZXNjcmliZSBcInNoaWZ0IGZyb20gY2hhcmFjdGVyd2lzZSB0byBibG9ja3dpc2VcIiwgLT5cbiAgICBkZXNjcmliZSBcIndoZW4gc2VsZWN0aW9uIGlzIG5vdCByZXZlcnNlZFwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMiwgNV1cbiAgICAgICAgZW5zdXJlICd2JyxcbiAgICAgICAgICBzZWxlY3RlZFRleHQ6ICdBJ1xuICAgICAgICAgIG1vZGU6IFsndmlzdWFsJywgJ2NoYXJhY3Rlcndpc2UnXVxuXG4gICAgICBpdCAnY2FzZS0xJywgLT5cbiAgICAgICAgZW5zdXJlICczIGogY3RybC12JyxcbiAgICAgICAgICBtb2RlOiBbJ3Zpc3VhbCcsICdibG9ja3dpc2UnXVxuICAgICAgICAgIHNlbGVjdGVkVGV4dE9yZGVyZWQ6IFtcbiAgICAgICAgICAgICdBJ1xuICAgICAgICAgICAgJyonXG4gICAgICAgICAgICAnKydcbiAgICAgICAgICAgICdDJ1xuICAgICAgICAgIF1cbiAgICAgICAgZW5zdXJlQmxvY2t3aXNlU2VsZWN0aW9uIGhlYWQ6ICdib3R0b20nLCB0YWlsOiAndG9wJywgaGVhZFJldmVyc2VkOiBmYWxzZVxuXG4gICAgICBpdCAnY2FzZS0yJywgLT5cbiAgICAgICAgZW5zdXJlICdoIDMgaiBjdHJsLXYnLFxuICAgICAgICAgIG1vZGU6IFsndmlzdWFsJywgJ2Jsb2Nrd2lzZSddXG4gICAgICAgICAgc2VsZWN0ZWRUZXh0T3JkZXJlZDogW1xuICAgICAgICAgICAgJy1BJ1xuICAgICAgICAgICAgJy0qJ1xuICAgICAgICAgICAgJy0rJ1xuICAgICAgICAgICAgJy1DJ1xuICAgICAgICAgIF1cbiAgICAgICAgZW5zdXJlQmxvY2t3aXNlU2VsZWN0aW9uIGhlYWQ6ICdib3R0b20nLCB0YWlsOiAndG9wJywgaGVhZFJldmVyc2VkOiB0cnVlXG5cbiAgICAgIGl0ICdjYXNlLTMnLCAtPlxuICAgICAgICBlbnN1cmUgJzIgaCAzIGogY3RybC12JyxcbiAgICAgICAgICBtb2RlOiBbJ3Zpc3VhbCcsICdibG9ja3dpc2UnXVxuICAgICAgICAgIHNlbGVjdGVkVGV4dE9yZGVyZWQ6IFtcbiAgICAgICAgICAgICctLUEnXG4gICAgICAgICAgICAnLS0qJ1xuICAgICAgICAgICAgJy0tKydcbiAgICAgICAgICAgICctLUMnXG4gICAgICAgICAgXVxuICAgICAgICBlbnN1cmVCbG9ja3dpc2VTZWxlY3Rpb24gaGVhZDogJ2JvdHRvbScsIHRhaWw6ICd0b3AnLCBoZWFkUmV2ZXJzZWQ6IHRydWVcblxuICAgICAgaXQgJ2Nhc2UtNCcsIC0+XG4gICAgICAgIGVuc3VyZSAnbCAzIGogY3RybC12JyxcbiAgICAgICAgICBtb2RlOiBbJ3Zpc3VhbCcsICdibG9ja3dpc2UnXVxuICAgICAgICAgIHNlbGVjdGVkVGV4dE9yZGVyZWQ6IFtcbiAgICAgICAgICAgICdBLSdcbiAgICAgICAgICAgICcqKidcbiAgICAgICAgICAgICcrKydcbiAgICAgICAgICAgICdDLSdcbiAgICAgICAgICBdXG4gICAgICAgIGVuc3VyZUJsb2Nrd2lzZVNlbGVjdGlvbiBoZWFkOiAnYm90dG9tJywgdGFpbDogJ3RvcCcsIGhlYWRSZXZlcnNlZDogZmFsc2VcbiAgICAgIGl0ICdjYXNlLTUnLCAtPlxuICAgICAgICBlbnN1cmUgJzIgbCAzIGogY3RybC12JyxcbiAgICAgICAgICBtb2RlOiBbJ3Zpc3VhbCcsICdibG9ja3dpc2UnXVxuICAgICAgICAgIHNlbGVjdGVkVGV4dE9yZGVyZWQ6IFtcbiAgICAgICAgICAgICdBLS0nXG4gICAgICAgICAgICAnKioqJ1xuICAgICAgICAgICAgJysrKydcbiAgICAgICAgICAgICdDLS0nXG4gICAgICAgICAgXVxuICAgICAgICBlbnN1cmVCbG9ja3dpc2VTZWxlY3Rpb24gaGVhZDogJ2JvdHRvbScsIHRhaWw6ICd0b3AnLCBoZWFkUmV2ZXJzZWQ6IGZhbHNlXG5cbiAgICBkZXNjcmliZSBcIndoZW4gc2VsZWN0aW9uIGlzIHJldmVyc2VkXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFs1LCA1XVxuICAgICAgICBlbnN1cmUgJ3YnLFxuICAgICAgICAgIHNlbGVjdGVkVGV4dDogJ0MnXG4gICAgICAgICAgbW9kZTogWyd2aXN1YWwnLCAnY2hhcmFjdGVyd2lzZSddXG5cbiAgICAgIGl0ICdjYXNlLTEnLCAtPlxuICAgICAgICBlbnN1cmUgJzMgayBjdHJsLXYnLFxuICAgICAgICAgIG1vZGU6IFsndmlzdWFsJywgJ2Jsb2Nrd2lzZSddXG4gICAgICAgICAgc2VsZWN0ZWRUZXh0T3JkZXJlZDogW1xuICAgICAgICAgICAgJ0EnXG4gICAgICAgICAgICAnKidcbiAgICAgICAgICAgICcrJ1xuICAgICAgICAgICAgJ0MnXG4gICAgICAgICAgXVxuICAgICAgICBlbnN1cmVCbG9ja3dpc2VTZWxlY3Rpb24gaGVhZDogJ3RvcCcsIHRhaWw6ICdib3R0b20nLCBoZWFkUmV2ZXJzZWQ6IHRydWVcblxuICAgICAgaXQgJ2Nhc2UtMicsIC0+XG4gICAgICAgIGVuc3VyZSAnaCAzIGsgY3RybC12JyxcbiAgICAgICAgICBtb2RlOiBbJ3Zpc3VhbCcsICdibG9ja3dpc2UnXVxuICAgICAgICAgIHNlbGVjdGVkVGV4dE9yZGVyZWQ6IFtcbiAgICAgICAgICAgICctQSdcbiAgICAgICAgICAgICctKidcbiAgICAgICAgICAgICctKydcbiAgICAgICAgICAgICctQydcbiAgICAgICAgICBdXG4gICAgICAgIGVuc3VyZUJsb2Nrd2lzZVNlbGVjdGlvbiBoZWFkOiAndG9wJywgdGFpbDogJ2JvdHRvbScsIGhlYWRSZXZlcnNlZDogdHJ1ZVxuXG4gICAgICBpdCAnY2FzZS0zJywgLT5cbiAgICAgICAgZW5zdXJlICcyIGggMyBrIGN0cmwtdicsXG4gICAgICAgICAgbW9kZTogWyd2aXN1YWwnLCAnYmxvY2t3aXNlJ11cbiAgICAgICAgICBzZWxlY3RlZFRleHRPcmRlcmVkOiBbXG4gICAgICAgICAgICAnLS1BJ1xuICAgICAgICAgICAgJy0tKidcbiAgICAgICAgICAgICctLSsnXG4gICAgICAgICAgICAnLS1DJ1xuICAgICAgICAgIF1cbiAgICAgICAgZW5zdXJlQmxvY2t3aXNlU2VsZWN0aW9uIGhlYWQ6ICd0b3AnLCB0YWlsOiAnYm90dG9tJywgaGVhZFJldmVyc2VkOiB0cnVlXG5cbiAgICAgIGl0ICdjYXNlLTQnLCAtPlxuICAgICAgICBlbnN1cmUgJ2wgMyBrIGN0cmwtdicsXG4gICAgICAgICAgbW9kZTogWyd2aXN1YWwnLCAnYmxvY2t3aXNlJ11cbiAgICAgICAgICBzZWxlY3RlZFRleHRPcmRlcmVkOiBbXG4gICAgICAgICAgICAnQS0nXG4gICAgICAgICAgICAnKionXG4gICAgICAgICAgICAnKysnXG4gICAgICAgICAgICAnQy0nXG4gICAgICAgICAgXVxuICAgICAgICBlbnN1cmVCbG9ja3dpc2VTZWxlY3Rpb24gaGVhZDogJ3RvcCcsIHRhaWw6ICdib3R0b20nLCBoZWFkUmV2ZXJzZWQ6IGZhbHNlXG5cbiAgICAgIGl0ICdjYXNlLTUnLCAtPlxuICAgICAgICBlbnN1cmUgJzIgbCAzIGsgY3RybC12JyxcbiAgICAgICAgICBtb2RlOiBbJ3Zpc3VhbCcsICdibG9ja3dpc2UnXVxuICAgICAgICAgIHNlbGVjdGVkVGV4dE9yZGVyZWQ6IFtcbiAgICAgICAgICAgICdBLS0nXG4gICAgICAgICAgICAnKioqJ1xuICAgICAgICAgICAgJysrKydcbiAgICAgICAgICAgICdDLS0nXG4gICAgICAgICAgXVxuICAgICAgICBlbnN1cmVCbG9ja3dpc2VTZWxlY3Rpb24gaGVhZDogJ3RvcCcsIHRhaWw6ICdib3R0b20nLCBoZWFkUmV2ZXJzZWQ6IGZhbHNlXG5cbiAgZGVzY3JpYmUgXCJzaGlmdCBmcm9tIGJsb2Nrd2lzZSB0byBjaGFyYWN0ZXJ3aXNlXCIsIC0+XG4gICAgcHJlc2VydmVTZWxlY3Rpb24gPSAtPlxuICAgICAgc2VsZWN0ZWRUZXh0ID0gZWRpdG9yLmdldFNlbGVjdGVkVGV4dCgpXG4gICAgICBzZWxlY3RlZEJ1ZmZlclJhbmdlID0gZWRpdG9yLmdldFNlbGVjdGVkQnVmZmVyUmFuZ2UoKVxuICAgICAgY3Vyc29yID0gZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKClcbiAgICAgIG1vZGUgPSBbdmltU3RhdGUubW9kZSwgdmltU3RhdGUuc3VibW9kZV1cbiAgICAgIHtzZWxlY3RlZFRleHQsIHNlbGVjdGVkQnVmZmVyUmFuZ2UsIGN1cnNvciwgbW9kZX1cblxuICAgIGVuc3VyZUNoYXJhY3Rlcndpc2VXYXNSZXN0b3JlZCA9IChrZXlzdHJva2UpIC0+XG4gICAgICBlbnN1cmUga2V5c3Ryb2tlLCBtb2RlOiBbJ3Zpc3VhbCcsICdjaGFyYWN0ZXJ3aXNlJ11cbiAgICAgIGNoYXJhY3Rlcndpc2VTdGF0ZSA9IHByZXNlcnZlU2VsZWN0aW9uKClcbiAgICAgIGVuc3VyZSAnY3RybC12JywgbW9kZTogWyd2aXN1YWwnLCAnYmxvY2t3aXNlJ11cbiAgICAgIGVuc3VyZSAndicsIGNoYXJhY3Rlcndpc2VTdGF0ZVxuXG4gICAgZGVzY3JpYmUgXCJ3aGVuIHNlbGVjdGlvbiBpcyBub3QgcmV2ZXJzZWRcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzIsIDVdXG4gICAgICBpdCAnY2FzZS0xJywgLT4gZW5zdXJlQ2hhcmFjdGVyd2lzZVdhc1Jlc3RvcmVkKCd2JylcbiAgICAgIGl0ICdjYXNlLTInLCAtPiBlbnN1cmVDaGFyYWN0ZXJ3aXNlV2FzUmVzdG9yZWQoJ3YgMyBqJylcbiAgICAgIGl0ICdjYXNlLTMnLCAtPiBlbnN1cmVDaGFyYWN0ZXJ3aXNlV2FzUmVzdG9yZWQoJ3YgaCAzIGonKVxuICAgICAgaXQgJ2Nhc2UtNCcsIC0+IGVuc3VyZUNoYXJhY3Rlcndpc2VXYXNSZXN0b3JlZCgndiAyIGggMyBqJylcbiAgICAgIGl0ICdjYXNlLTUnLCAtPiBlbnN1cmVDaGFyYWN0ZXJ3aXNlV2FzUmVzdG9yZWQoJ3YgbCAzIGonKVxuICAgICAgaXQgJ2Nhc2UtNicsIC0+IGVuc3VyZUNoYXJhY3Rlcndpc2VXYXNSZXN0b3JlZCgndiAyIGwgMyBqJylcbiAgICBkZXNjcmliZSBcIndoZW4gc2VsZWN0aW9uIGlzIHJldmVyc2VkXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFs1LCA1XVxuICAgICAgaXQgJ2Nhc2UtMScsIC0+IGVuc3VyZUNoYXJhY3Rlcndpc2VXYXNSZXN0b3JlZCgndicpXG4gICAgICBpdCAnY2FzZS0yJywgLT4gZW5zdXJlQ2hhcmFjdGVyd2lzZVdhc1Jlc3RvcmVkKCd2IDMgaycpXG4gICAgICBpdCAnY2FzZS0zJywgLT4gZW5zdXJlQ2hhcmFjdGVyd2lzZVdhc1Jlc3RvcmVkKCd2IGggMyBrJylcbiAgICAgIGl0ICdjYXNlLTQnLCAtPiBlbnN1cmVDaGFyYWN0ZXJ3aXNlV2FzUmVzdG9yZWQoJ3YgMiBoIDMgaycpXG4gICAgICBpdCAnY2FzZS01JywgLT4gZW5zdXJlQ2hhcmFjdGVyd2lzZVdhc1Jlc3RvcmVkKCd2IGwgMyBrJylcbiAgICAgIGl0ICdjYXNlLTYnLCAtPiBlbnN1cmVDaGFyYWN0ZXJ3aXNlV2FzUmVzdG9yZWQoJ3YgMiBsIDMgaycpXG4gICAgICBpdCAnY2FzZS03JywgLT4gc2V0IGN1cnNvcjogWzUsIDBdOyBlbnN1cmVDaGFyYWN0ZXJ3aXNlV2FzUmVzdG9yZWQoJ3YgNSBsIDMgaycpXG5cbiAgZGVzY3JpYmUgXCJrZWVwIGdvYWxDb2x1bW5cIiwgLT5cbiAgICBkZXNjcmliZSBcIndoZW4gcGFzc2luZyB0aHJvdWdoIGJsYW5rIHJvd1wiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAwMTIzNDU2NzhcblxuICAgICAgICAgIEFCQ0RFRkdISVxcblxuICAgICAgICAgIFwiXCJcIlxuXG4gICAgICBpdCBcIndoZW4gW3JldmVyc2VkID0gZmFsc2UsIGhlYWRSZXZlcnNlZCA9IGZhbHNlXVwiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMCwgM11cbiAgICAgICAgZW5zdXJlIFwiY3RybC12IGwgbCBsXCIsIGN1cnNvcjogW1swLCA3XV0sIHNlbGVjdGVkVGV4dE9yZGVyZWQ6IFtcIjM0NTZcIl1cbiAgICAgICAgZW5zdXJlQmxvY2t3aXNlU2VsZWN0aW9uIGhlYWQ6ICdib3R0b20nLCB0YWlsOiAndG9wJywgcmV2ZXJzZWQ6IGZhbHNlLCBoZWFkUmV2ZXJzZWQ6IGZhbHNlXG5cbiAgICAgICAgZW5zdXJlIFwialwiLCBjdXJzb3I6IFtbMCwgMF0sIFsxLCAwXV0sIHNlbGVjdGVkVGV4dE9yZGVyZWQ6IFtcIjAxMjNcIiwgXCJcIl1cbiAgICAgICAgZW5zdXJlQmxvY2t3aXNlU2VsZWN0aW9uIGhlYWQ6ICdib3R0b20nLCB0YWlsOiAndG9wJywgcmV2ZXJzZWQ6IGZhbHNlLCBoZWFkUmV2ZXJzZWQ6IHRydWVcblxuICAgICAgICBlbnN1cmUgXCJqXCIsIGN1cnNvcjogW1swLCA3XSwgWzEsIDBdLCBbMiwgN11dLCBzZWxlY3RlZFRleHRPcmRlcmVkOiBbXCIzNDU2XCIsIFwiXCIsIFwiREVGR1wiXVxuICAgICAgICBlbnN1cmVCbG9ja3dpc2VTZWxlY3Rpb24gaGVhZDogJ2JvdHRvbScsIHRhaWw6ICd0b3AnLCByZXZlcnNlZDogZmFsc2UsIGhlYWRSZXZlcnNlZDogZmFsc2VcblxuICAgICAgaXQgXCJ3aGVuIFtyZXZlcnNlZCA9IHRydWUsIGhlYWRSZXZlcnNlZCA9IHRydWVdXCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFsyLCA2XVxuICAgICAgICBlbnN1cmUgXCJjdHJsLXYgaCBoIGhcIiwgY3Vyc29yOiBbWzIsIDNdXSwgc2VsZWN0ZWRUZXh0T3JkZXJlZDogW1wiREVGR1wiXVxuICAgICAgICBlbnN1cmVCbG9ja3dpc2VTZWxlY3Rpb24gaGVhZDogJ3RvcCcsIHRhaWw6ICdib3R0b20nLCByZXZlcnNlZDogdHJ1ZSwgaGVhZFJldmVyc2VkOiB0cnVlXG5cbiAgICAgICAgZW5zdXJlIFwia1wiLCBjdXJzb3I6IFtbMSwgMF0sIFsyLCAwXV0sIHNlbGVjdGVkVGV4dE9yZGVyZWQ6IFtcIlwiLCBcIkFCQ0RFRkdcIl1cbiAgICAgICAgZW5zdXJlQmxvY2t3aXNlU2VsZWN0aW9uIGhlYWQ6ICd0b3AnLCB0YWlsOiAnYm90dG9tJywgcmV2ZXJzZWQ6IHRydWUsIGhlYWRSZXZlcnNlZDogdHJ1ZVxuXG4gICAgICAgIGVuc3VyZSBcImtcIiwgY3Vyc29yOiBbWzAsIDNdLCBbMSwgMF0sIFsyLCAzXV0sIHNlbGVjdGVkVGV4dE9yZGVyZWQ6IFtcIjM0NTZcIiwgXCJcIiwgXCJERUZHXCJdXG4gICAgICAgIGVuc3VyZUJsb2Nrd2lzZVNlbGVjdGlvbiBoZWFkOiAndG9wJywgdGFpbDogJ2JvdHRvbScsIHJldmVyc2VkOiB0cnVlLCBoZWFkUmV2ZXJzZWQ6IHRydWVcblxuICAgICAgaXQgXCJ3aGVuIFtyZXZlcnNlZCA9IGZhbHNlLCBoZWFkUmV2ZXJzZWQgPSB0cnVlXVwiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMCwgNl1cbiAgICAgICAgZW5zdXJlIFwiY3RybC12IGggaCBoXCIsIGN1cnNvcjogW1swLCAzXV0sIHNlbGVjdGVkVGV4dE9yZGVyZWQ6IFtcIjM0NTZcIl1cbiAgICAgICAgZW5zdXJlQmxvY2t3aXNlU2VsZWN0aW9uIGhlYWQ6ICdib3R0b20nLCB0YWlsOiAndG9wJywgcmV2ZXJzZWQ6IHRydWUsIGhlYWRSZXZlcnNlZDogdHJ1ZVxuXG4gICAgICAgIGVuc3VyZSBcImpcIiwgY3Vyc29yOiBbWzAsIDBdLCBbMSwgMF1dLCBzZWxlY3RlZFRleHRPcmRlcmVkOiBbXCIwMTIzNDU2XCIsIFwiXCJdXG4gICAgICAgIGVuc3VyZUJsb2Nrd2lzZVNlbGVjdGlvbiBoZWFkOiAnYm90dG9tJywgdGFpbDogJ3RvcCcsIHJldmVyc2VkOiBmYWxzZSwgaGVhZFJldmVyc2VkOiB0cnVlXG5cbiAgICAgICAgZW5zdXJlIFwialwiLCBjdXJzb3I6IFtbMCwgM10sIFsxLCAwXSwgWzIsIDNdXSwgc2VsZWN0ZWRUZXh0T3JkZXJlZDogW1wiMzQ1NlwiLCBcIlwiLCBcIkRFRkdcIl1cbiAgICAgICAgZW5zdXJlQmxvY2t3aXNlU2VsZWN0aW9uIGhlYWQ6ICdib3R0b20nLCB0YWlsOiAndG9wJywgcmV2ZXJzZWQ6IGZhbHNlLCBoZWFkUmV2ZXJzZWQ6IHRydWVcblxuICAgICAgaXQgXCJ3aGVuIFtyZXZlcnNlZCA9IHRydWUsIGhlYWRSZXZlcnNlZCA9IGZhbHNlXVwiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMiwgM11cbiAgICAgICAgZW5zdXJlIFwiY3RybC12IGwgbCBsXCIsIGN1cnNvcjogW1syLCA3XV0sIHNlbGVjdGVkVGV4dE9yZGVyZWQ6IFtcIkRFRkdcIl1cbiAgICAgICAgZW5zdXJlQmxvY2t3aXNlU2VsZWN0aW9uIGhlYWQ6ICd0b3AnLCB0YWlsOiAnYm90dG9tJywgcmV2ZXJzZWQ6IGZhbHNlLCBoZWFkUmV2ZXJzZWQ6IGZhbHNlXG5cbiAgICAgICAgZW5zdXJlIFwia1wiLCBjdXJzb3I6IFtbMSwgMF0sIFsyLCAwXV0sIHNlbGVjdGVkVGV4dE9yZGVyZWQ6IFtcIlwiLCBcIkFCQ0RcIl1cbiAgICAgICAgZW5zdXJlQmxvY2t3aXNlU2VsZWN0aW9uIGhlYWQ6ICd0b3AnLCB0YWlsOiAnYm90dG9tJywgcmV2ZXJzZWQ6IHRydWUsIGhlYWRSZXZlcnNlZDogdHJ1ZVxuXG4gICAgICAgIGVuc3VyZSBcImtcIiwgY3Vyc29yOiBbWzAsIDddLCBbMSwgMF0sIFsyLCA3XV0sIHNlbGVjdGVkVGV4dE9yZGVyZWQ6ICBbXCIzNDU2XCIsIFwiXCIsIFwiREVGR1wiXVxuICAgICAgICBlbnN1cmVCbG9ja3dpc2VTZWxlY3Rpb24gaGVhZDogJ3RvcCcsIHRhaWw6ICdib3R0b20nLCByZXZlcnNlZDogdHJ1ZSwgaGVhZFJldmVyc2VkOiBmYWxzZVxuXG4gICAgZGVzY3JpYmUgXCJ3aGVuIGhlYWQgY3Vyc29yIHBvc2l0aW9uIGlzIGxlc3MgdGhhbiBvcmlnaW5hbCBnb2FsIGNvbHVtblwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAwMTIzNDU2Nzg5MDEyMzQ1Njc4OTAxMjNcbiAgICAgICAgICAgICAgICAgeHh4MDEyMzRcbiAgICAgICAgICAwMTIzNDU2Nzg5MDEyMzQ1Njc4OTAxMjNcXG5cbiAgICAgICAgICBcIlwiXCJcblxuICAgICAgZGVzY3JpYmUgXCJbdGFpbENvbHVtbiA8IGhlYWRDb2x1bV0sIGdvYWxDb2x1bW4gaXNudCBJbmZpbml0eVwiLCAtPlxuICAgICAgICBpdCBcInNocmlua3MgYmxvY2sgdGlsbCBoZWFkIGNvbHVtbiBieSBrZWVwaW5nIGdvYWxDb2x1bW5cIiwgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMTBdICMgaiwgayBtb3Rpb24ga2VlcCBnb2FsQ29sdW1uIHNvIHN0YXJ0aW5nIGAxMGAgY29sdW1uIG1lYW5zIGdvYWxDb2x1bW4gaXMgMTAuXG4gICAgICAgICAgZW5zdXJlIFwiY3RybC12IDEgMCBsXCIsIHNlbGVjdGVkVGV4dE9yZGVyZWQ6IFtcIjAxMjM0NTY3ODkwXCJdLCBjdXJzb3I6IFtbMCwgMjFdXVxuICAgICAgICAgIGVuc3VyZSBcImpcIiwgc2VsZWN0ZWRUZXh0T3JkZXJlZDogW1wiMDEyMzQ1XCIsIFwiMDEyMzRcIl0sIGN1cnNvcjogW1swLCAxNl0sIFsxLCAxNV1dXG4gICAgICAgICAgZW5zdXJlIFwialwiLCBzZWxlY3RlZFRleHRPcmRlcmVkOiBbXCIwMTIzNDU2Nzg5MFwiLCBcIjAxMjM0XCIsIFwiMDEyMzQ1Njc4OTBcIl0sIGN1cnNvcjogW1swLCAyMV0sIFsxLCAxNV0sIFsyLCAyMV1dXG4gICAgICAgIGl0IFwic2hyaW5rcyBibG9jayB0aWxsIGhlYWQgY29sdW1uIGJ5IGtlZXBpbmcgZ29hbENvbHVtblwiLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFsyLCAxMF1cbiAgICAgICAgICBlbnN1cmUgXCJjdHJsLXYgMSAwIGxcIiwgc2VsZWN0ZWRUZXh0T3JkZXJlZDogW1wiMDEyMzQ1Njc4OTBcIl0sIGN1cnNvcjogW1syLCAyMV1dXG4gICAgICAgICAgZW5zdXJlIFwia1wiLCBzZWxlY3RlZFRleHRPcmRlcmVkOiBbXCIwMTIzNFwiLCBcIjAxMjM0NVwiXSwgY3Vyc29yOiBbWzEsIDE1XSwgWzIsIDE2XV1cbiAgICAgICAgICBlbnN1cmUgXCJrXCIsIHNlbGVjdGVkVGV4dE9yZGVyZWQ6IFtcIjAxMjM0NTY3ODkwXCIsIFwiMDEyMzRcIiwgXCIwMTIzNDU2Nzg5MFwiXSwgY3Vyc29yOiBbWzAsIDIxXSwgWzEsIDE1XSwgWzIsIDIxXV1cbiAgICAgIGRlc2NyaWJlIFwiW3RhaWxDb2x1bW4gPCBoZWFkQ29sdW1dLCBnb2FsQ29sdW1uIGlzIEluZmluaXR5XCIsIC0+XG4gICAgICAgIGl0IFwia2VlcCBlYWNoIG1lbWJlciBzZWxlY3Rpb24gc2VsZWN0ZWQgdGlsbCBlbmQtb2YtbGluZSggTm8gc2hyaW5rIClcIiwgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMTBdICMgJCBtb3Rpb24gc2V0IGdvYWxDb2x1bW4gdG8gSW5maW5pdHlcbiAgICAgICAgICBlbnN1cmUgXCJjdHJsLXYgJFwiLCBzZWxlY3RlZFRleHRPcmRlcmVkOiBbXCIwMTIzNDU2Nzg5MDEyM1wiXSwgY3Vyc29yOiBbWzAsIDI0XV1cbiAgICAgICAgICBlbnN1cmUgXCJqXCIsIHNlbGVjdGVkVGV4dE9yZGVyZWQ6IFtcIjAxMjM0NTY3ODkwMTIzXCIsIFwiMDEyMzRcIl0sIGN1cnNvcjogW1swLCAyNF0sIFsxLCAxNV1dXG4gICAgICAgICAgZW5zdXJlIFwialwiLCBzZWxlY3RlZFRleHRPcmRlcmVkOiBbXCIwMTIzNDU2Nzg5MDEyM1wiLCBcIjAxMjM0XCIsIFwiMDEyMzQ1Njc4OTAxMjNcIl0sIGN1cnNvcjogW1swLCAyNF0sIFsxLCAxNV0sIFsyLCAyNF1dXG4gICAgICAgIGl0IFwia2VlcCBlYWNoIG1lbWJlciBzZWxlY3Rpb24gc2VsZWN0ZWQgdGlsbCBlbmQtb2YtbGluZSggTm8gc2hyaW5rIClcIiwgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMiwgMTBdXG4gICAgICAgICAgZW5zdXJlIFwiY3RybC12ICRcIiwgc2VsZWN0ZWRUZXh0T3JkZXJlZDogW1wiMDEyMzQ1Njc4OTAxMjNcIl0sIGN1cnNvcjogW1syLCAyNF1dXG4gICAgICAgICAgZW5zdXJlIFwia1wiLCBzZWxlY3RlZFRleHRPcmRlcmVkOiBbXCIwMTIzNFwiLCBcIjAxMjM0NTY3ODkwMTIzXCJdLCBjdXJzb3I6IFtbMSwgMTVdLCBbMiwgMjRdXVxuICAgICAgICAgIGVuc3VyZSBcImtcIiwgc2VsZWN0ZWRUZXh0T3JkZXJlZDogW1wiMDEyMzQ1Njc4OTAxMjNcIiwgXCIwMTIzNFwiLCBcIjAxMjM0NTY3ODkwMTIzXCJdLCBjdXJzb3I6IFtbMCwgMjRdLCBbMSwgMTVdLCBbMiwgMjRdXVxuICAgICAgZGVzY3JpYmUgXCJbdGFpbENvbHVtbiA+IGhlYWRDb2x1bV0sIGdvYWxDb2x1bW4gaXNudCBJbmZpbml0eVwiLCAtPlxuICAgICAgICBpdCBcIlJlc3BlY3QgYWN0dWFsIGhlYWQgY29sdW1uIG92ZXIgZ29hbENvbHVtblwiLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFswLCAyMF0gIyBqLCBrIG1vdGlvbiBrZWVwIGdvYWxDb2x1bW4gc28gc3RhcnRpbmcgYDEwYCBjb2x1bW4gbWVhbnMgZ29hbENvbHVtbiBpcyAxMC5cbiAgICAgICAgICBlbnN1cmUgXCJjdHJsLXYgbCBsXCIsIHNlbGVjdGVkVGV4dE9yZGVyZWQ6IFtcIjAxMlwiXSwgY3Vyc29yOiBbWzAsIDIzXV1cbiAgICAgICAgICBlbnN1cmUgXCJqXCIsIHNlbGVjdGVkVGV4dE9yZGVyZWQ6IFtcIjU2Nzg5MFwiLCBcIlwiXSwgY3Vyc29yOiBbWzAsIDE1XSwgWzEsIDE1XV1cbiAgICAgICAgICBlbnN1cmUgXCJqXCIsIHNlbGVjdGVkVGV4dE9yZGVyZWQ6IFtcIjAxMlwiLCBcIlwiLCBcIjAxMlwiXSwgY3Vyc29yOiBbWzAsIDIzXSwgWzEsIDE1XSwgWzIsIDIzXV1cbiAgICAgICAgaXQgXCJSZXNwZWN0IGFjdHVhbCBoZWFkIGNvbHVtbiBvdmVyIGdvYWxDb2x1bW5cIiwgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMiwgMjBdICMgaiwgayBtb3Rpb24ga2VlcCBnb2FsQ29sdW1uIHNvIHN0YXJ0aW5nIGAxMGAgY29sdW1uIG1lYW5zIGdvYWxDb2x1bW4gaXMgMTAuXG4gICAgICAgICAgZW5zdXJlIFwiY3RybC12IGwgbFwiLCBzZWxlY3RlZFRleHRPcmRlcmVkOiBbXCIwMTJcIl0sIGN1cnNvcjogW1syLCAyM11dXG4gICAgICAgICAgZW5zdXJlIFwia1wiLCBzZWxlY3RlZFRleHRPcmRlcmVkOiBbXCJcIiwgXCI1Njc4OTBcIl0sIGN1cnNvcjogW1sxLCAxNV0sIFsyLCAxNV1dXG4gICAgICAgICAgZW5zdXJlIFwia1wiLCBzZWxlY3RlZFRleHRPcmRlcmVkOiBbXCIwMTJcIiwgXCJcIiwgXCIwMTJcIl0sIGN1cnNvcjogW1swLCAyM10sIFsxLCAxNV0sIFsyLCAyM11dXG4gICAgICBkZXNjcmliZSBcIlt0YWlsQ29sdW1uID4gaGVhZENvbHVtXSwgZ29hbENvbHVtbiBpcyBJbmZpbml0eVwiLCAtPlxuICAgICAgICBpdCBcIlJlc3BlY3QgYWN0dWFsIGhlYWQgY29sdW1uIG92ZXIgZ29hbENvbHVtblwiLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFswLCAyMF0gIyBqLCBrIG1vdGlvbiBrZWVwIGdvYWxDb2x1bW4gc28gc3RhcnRpbmcgYDEwYCBjb2x1bW4gbWVhbnMgZ29hbENvbHVtbiBpcyAxMC5cbiAgICAgICAgICBlbnN1cmUgXCJjdHJsLXYgJFwiLCBzZWxlY3RlZFRleHRPcmRlcmVkOiBbXCIwMTIzXCJdLCBjdXJzb3I6IFtbMCwgMjRdXVxuICAgICAgICAgIGVuc3VyZSBcImpcIiwgc2VsZWN0ZWRUZXh0T3JkZXJlZDogW1wiNTY3ODkwXCIsIFwiXCJdLCBjdXJzb3I6IFtbMCwgMTVdLCBbMSwgMTVdXVxuICAgICAgICAgIGVuc3VyZSBcImpcIiwgc2VsZWN0ZWRUZXh0T3JkZXJlZDogW1wiMDEyM1wiLCBcIlwiLCBcIjAxMjNcIl0sIGN1cnNvcjogW1swLCAyNF0sIFsxLCAxNV0sIFsyLCAyNF1dXG4gICAgICAgIGl0IFwiUmVzcGVjdCBhY3R1YWwgaGVhZCBjb2x1bW4gb3ZlciBnb2FsQ29sdW1uXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzIsIDIwXSAjIGosIGsgbW90aW9uIGtlZXAgZ29hbENvbHVtbiBzbyBzdGFydGluZyBgMTBgIGNvbHVtbiBtZWFucyBnb2FsQ29sdW1uIGlzIDEwLlxuICAgICAgICAgIGVuc3VyZSBcImN0cmwtdiAkXCIsIHNlbGVjdGVkVGV4dE9yZGVyZWQ6IFtcIjAxMjNcIl0sIGN1cnNvcjogW1syLCAyNF1dXG4gICAgICAgICAgZW5zdXJlIFwia1wiLCBzZWxlY3RlZFRleHRPcmRlcmVkOiBbXCJcIiwgXCI1Njc4OTBcIl0sIGN1cnNvcjogW1sxLCAxNV0sIFsyLCAxNV1dXG4gICAgICAgICAgZW5zdXJlIFwia1wiLCBzZWxlY3RlZFRleHRPcmRlcmVkOiBbXCIwMTIzXCIsIFwiXCIsIFwiMDEyM1wiXSwgY3Vyc29yOiBbWzAsIDI0XSwgWzEsIDE1XSwgWzIsIDI0XV1cblxuICAjIFtGSVhNRV0gbm90IGFwcHJvcHJpYXRlIHB1dCBoZXJlLCByZS1jb25zaWRlciBhbGwgc3BlYyBmaWxlIGxheW91dCBsYXRlci5cbiAgZGVzY3JpYmUgXCJndiBmZWF0dXJlXCIsIC0+XG4gICAgcHJlc2VydmVTZWxlY3Rpb24gPSAtPlxuICAgICAgc2VsZWN0aW9ucyA9IGVkaXRvci5nZXRTZWxlY3Rpb25zT3JkZXJlZEJ5QnVmZmVyUG9zaXRpb24oKVxuICAgICAgc2VsZWN0ZWRUZXh0T3JkZXJlZCA9IChzLmdldFRleHQoKSBmb3IgcyBpbiBzZWxlY3Rpb25zKVxuICAgICAgc2VsZWN0ZWRCdWZmZXJSYW5nZU9yZGVyZWQgPSAocy5nZXRCdWZmZXJSYW5nZSgpIGZvciBzIGluIHNlbGVjdGlvbnMpXG4gICAgICBjdXJzb3IgPSAocy5nZXRIZWFkU2NyZWVuUG9zaXRpb24oKSBmb3IgcyBpbiBzZWxlY3Rpb25zKVxuICAgICAgbW9kZSA9IFt2aW1TdGF0ZS5tb2RlLCB2aW1TdGF0ZS5zdWJtb2RlXVxuICAgICAge3NlbGVjdGVkVGV4dE9yZGVyZWQsIHNlbGVjdGVkQnVmZmVyUmFuZ2VPcmRlcmVkLCBjdXJzb3IsIG1vZGV9XG5cbiAgICBlbnN1cmVSZXN0b3JlZCA9IChrZXlzdHJva2UsIHNwZWMpIC0+XG4gICAgICBlbnN1cmUga2V5c3Ryb2tlLCBzcGVjXG4gICAgICBwcmVzZXJ2ZWQgPSBwcmVzZXJ2ZVNlbGVjdGlvbigpXG4gICAgICBlbnN1cmUgJ2VzY2FwZSBqIGonLCBtb2RlOiAnbm9ybWFsJywgc2VsZWN0ZWRUZXh0OiAnJ1xuICAgICAgZW5zdXJlICdnIHYnLCBwcmVzZXJ2ZWRcblxuICAgIGRlc2NyaWJlIFwibGluZXdpc2Ugc2VsZWN0aW9uXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFsyLCAwXVxuICAgICAgZGVzY3JpYmUgXCJpbW1lZGlhdGVseSBhZnRlciBWXCIsIC0+XG4gICAgICAgIGl0ICdyZXN0b3JlIHByZXZpb3VzIHNlbGVjdGlvbicsIC0+XG4gICAgICAgICAgZW5zdXJlUmVzdG9yZWQgJ1YnLFxuICAgICAgICAgICAgc2VsZWN0ZWRUZXh0OiB0ZXh0RGF0YS5nZXRMaW5lcyhbMl0pXG4gICAgICAgICAgICBtb2RlOiBbJ3Zpc3VhbCcsICdsaW5ld2lzZSddXG4gICAgICBkZXNjcmliZSBcInNlbGVjdGlvbiBpcyBub3QgcmV2ZXJzZWRcIiwgLT5cbiAgICAgICAgaXQgJ3Jlc3RvcmUgcHJldmlvdXMgc2VsZWN0aW9uJywgLT5cbiAgICAgICAgICBlbnN1cmVSZXN0b3JlZCAnViBqJyxcbiAgICAgICAgICAgIHNlbGVjdGVkVGV4dDogdGV4dERhdGEuZ2V0TGluZXMoWzIsIDNdKVxuICAgICAgICAgICAgbW9kZTogWyd2aXN1YWwnLCAnbGluZXdpc2UnXVxuICAgICAgZGVzY3JpYmUgXCJzZWxlY3Rpb24gaXMgcmV2ZXJzZWRcIiwgLT5cbiAgICAgICAgaXQgJ3Jlc3RvcmUgcHJldmlvdXMgc2VsZWN0aW9uJywgLT5cbiAgICAgICAgICBlbnN1cmVSZXN0b3JlZCAnViBrJyxcbiAgICAgICAgICAgIHNlbGVjdGVkVGV4dDogdGV4dERhdGEuZ2V0TGluZXMoWzEsIDJdKVxuICAgICAgICAgICAgbW9kZTogWyd2aXN1YWwnLCAnbGluZXdpc2UnXVxuXG4gICAgZGVzY3JpYmUgXCJjaGFyYWN0ZXJ3aXNlIHNlbGVjdGlvblwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMiwgMF1cbiAgICAgIGRlc2NyaWJlIFwiaW1tZWRpYXRlbHkgYWZ0ZXIgdlwiLCAtPlxuICAgICAgICBpdCAncmVzdG9yZSBwcmV2aW91cyBzZWxlY3Rpb24nLCAtPlxuICAgICAgICAgIGVuc3VyZVJlc3RvcmVkICd2JyxcbiAgICAgICAgICAgIHNlbGVjdGVkVGV4dDogXCIyXCJcbiAgICAgICAgICAgIG1vZGU6IFsndmlzdWFsJywgJ2NoYXJhY3Rlcndpc2UnXVxuICAgICAgZGVzY3JpYmUgXCJzZWxlY3Rpb24gaXMgbm90IHJldmVyc2VkXCIsIC0+XG4gICAgICAgIGl0ICdyZXN0b3JlIHByZXZpb3VzIHNlbGVjdGlvbicsIC0+XG4gICAgICAgICAgZW5zdXJlUmVzdG9yZWQgJ3YgaicsXG4gICAgICAgICAgICBzZWxlY3RlZFRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgMi0tLS1BLS0tLS0tLS0tQi0tLS1cbiAgICAgICAgICAgIDNcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgbW9kZTogWyd2aXN1YWwnLCAnY2hhcmFjdGVyd2lzZSddXG4gICAgICBkZXNjcmliZSBcInNlbGVjdGlvbiBpcyByZXZlcnNlZFwiLCAtPlxuICAgICAgICBpdCAncmVzdG9yZSBwcmV2aW91cyBzZWxlY3Rpb24nLCAtPlxuICAgICAgICAgIGVuc3VyZVJlc3RvcmVkICd2IGsnLFxuICAgICAgICAgICAgc2VsZWN0ZWRUZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIDEtLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAgICAgICAyXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgIG1vZGU6IFsndmlzdWFsJywgJ2NoYXJhY3Rlcndpc2UnXVxuXG4gICAgZGVzY3JpYmUgXCJibG9ja3dpc2Ugc2VsZWN0aW9uXCIsIC0+XG4gICAgICBkZXNjcmliZSBcImltbWVkaWF0ZWx5IGFmdGVyIGN0cmwtdlwiLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzIsIDBdXG4gICAgICAgIGl0ICdyZXN0b3JlIHByZXZpb3VzIHNlbGVjdGlvbicsIC0+XG4gICAgICAgICAgZW5zdXJlUmVzdG9yZWQgJ2N0cmwtdicsXG4gICAgICAgICAgICBzZWxlY3RlZFRleHQ6IFwiMlwiXG4gICAgICAgICAgICBtb2RlOiBbJ3Zpc3VhbCcsICdibG9ja3dpc2UnXVxuICAgICAgZGVzY3JpYmUgXCJzZWxlY3Rpb24gaXMgbm90IHJldmVyc2VkXCIsIC0+XG4gICAgICAgIGl0ICdyZXN0b3JlIHByZXZpb3VzIHNlbGVjdGlvbiBjYXNlLTEnLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFsyLCA1XVxuICAgICAgICAgIGtleXN0cm9rZSAnY3RybC12IDEgMCBsJ1xuICAgICAgICAgIGVuc3VyZVJlc3RvcmVkICczIGonLFxuICAgICAgICAgICAgc2VsZWN0ZWRUZXh0OiBibG9ja1RleHRzWzIuLjVdXG4gICAgICAgICAgICBtb2RlOiBbJ3Zpc3VhbCcsICdibG9ja3dpc2UnXVxuICAgICAgICBpdCAncmVzdG9yZSBwcmV2aW91cyBzZWxlY3Rpb24gY2FzZS0yJywgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbNSwgNV1cbiAgICAgICAgICBrZXlzdHJva2UgJ2N0cmwtdiAxIDAgbCdcbiAgICAgICAgICBlbnN1cmVSZXN0b3JlZCAnMyBrJyxcbiAgICAgICAgICAgIHNlbGVjdGVkVGV4dE9yZGVyZWQ6IGJsb2NrVGV4dHNbMi4uNV1cbiAgICAgICAgICAgIG1vZGU6IFsndmlzdWFsJywgJ2Jsb2Nrd2lzZSddXG4gICAgICBkZXNjcmliZSBcInNlbGVjdGlvbiBpcyByZXZlcnNlZFwiLCAtPlxuICAgICAgICBpdCAncmVzdG9yZSBwcmV2aW91cyBzZWxlY3Rpb24gY2FzZS0xJywgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMiwgMTVdXG4gICAgICAgICAga2V5c3Ryb2tlICdjdHJsLXYgMSAwIGgnXG4gICAgICAgICAgZW5zdXJlUmVzdG9yZWQgJzMgaicsXG4gICAgICAgICAgICBzZWxlY3RlZFRleHQ6IGJsb2NrVGV4dHNbMi4uNV1cbiAgICAgICAgICAgIG1vZGU6IFsndmlzdWFsJywgJ2Jsb2Nrd2lzZSddXG4gICAgICAgIGl0ICdyZXN0b3JlIHByZXZpb3VzIHNlbGVjdGlvbiBjYXNlLTInLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFs1LCAxNV1cbiAgICAgICAgICBrZXlzdHJva2UgJ2N0cmwtdiAxIDAgaCdcbiAgICAgICAgICBlbnN1cmVSZXN0b3JlZCAnMyBrJyxcbiAgICAgICAgICAgIHNlbGVjdGVkVGV4dE9yZGVyZWQ6IGJsb2NrVGV4dHNbMi4uNV1cbiAgICAgICAgICAgIG1vZGU6IFsndmlzdWFsJywgJ2Jsb2Nrd2lzZSddXG4iXX0=
