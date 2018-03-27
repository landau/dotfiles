(function() {
  var TextData, dispatch, getVimState, ref, settings;

  ref = require('./spec-helper'), getVimState = ref.getVimState, dispatch = ref.dispatch, TextData = ref.TextData;

  settings = require('../lib/settings');

  describe("Motion Find", function() {
    var editor, editorElement, ensure, keystroke, ref1, set, vimState;
    ref1 = [], set = ref1[0], ensure = ref1[1], keystroke = ref1[2], editor = ref1[3], editorElement = ref1[4], vimState = ref1[5];
    beforeEach(function() {
      settings.set('useExperimentalFasterInput', true);
      return getVimState(function(state, _vim) {
        vimState = state;
        editor = vimState.editor, editorElement = vimState.editorElement;
        return set = _vim.set, ensure = _vim.ensure, keystroke = _vim.keystroke, _vim;
      });
    });
    describe('the f/F keybindings', function() {
      beforeEach(function() {
        return set({
          text: "abcabcabcabc\n",
          cursor: [0, 0]
        });
      });
      it('moves to the first specified character it finds', function() {
        return ensure([
          'f', {
            input: 'c'
          }
        ], {
          cursor: [0, 2]
        });
      });
      it('extends visual selection in visual-mode and repetable', function() {
        ensure('v', {
          mode: ['visual', 'characterwise']
        });
        ensure([
          'f', {
            input: 'c'
          }
        ], {
          selectedText: 'abc',
          cursor: [0, 3]
        });
        ensure(';', {
          selectedText: 'abcabc',
          cursor: [0, 6]
        });
        return ensure(',', {
          selectedText: 'abc',
          cursor: [0, 3]
        });
      });
      it('moves backwards to the first specified character it finds', function() {
        set({
          cursor: [0, 2]
        });
        return ensure([
          'F', {
            input: 'a'
          }
        ], {
          cursor: [0, 0]
        });
      });
      it('respects count forward', function() {
        return ensure([
          '2 f', {
            input: 'a'
          }
        ], {
          cursor: [0, 6]
        });
      });
      it('respects count backward', function() {
        ({
          cursor: [0, 6]
        });
        return ensure([
          '2 F', {
            input: 'a'
          }
        ], {
          cursor: [0, 0]
        });
      });
      it("doesn't move if the character specified isn't found", function() {
        return ensure([
          'f', {
            input: 'd'
          }
        ], {
          cursor: [0, 0]
        });
      });
      it("doesn't move if there aren't the specified count of the specified character", function() {
        ensure([
          '1 0 f', {
            input: 'a'
          }
        ], {
          cursor: [0, 0]
        });
        ensure([
          '1 1 f', {
            input: 'a'
          }
        ], {
          cursor: [0, 0]
        });
        set({
          cursor: [0, 6]
        });
        ensure([
          '1 0 F', {
            input: 'a'
          }
        ], {
          cursor: [0, 6]
        });
        return ensure([
          '1 1 F', {
            input: 'a'
          }
        ], {
          cursor: [0, 6]
        });
      });
      it("composes with d", function() {
        set({
          cursor: [0, 3]
        });
        return ensure([
          'd 2 f', {
            input: 'a'
          }
        ], {
          text: 'abcbc\n'
        });
      });
      return it("F behaves exclusively when composes with operator", function() {
        set({
          cursor: [0, 3]
        });
        return ensure([
          'd F', {
            input: 'a'
          }
        ], {
          text: 'abcabcabc\n'
        });
      });
    });
    describe('the t/T keybindings', function() {
      beforeEach(function() {
        return set({
          text: "abcabcabcabc\n",
          cursor: [0, 0]
        });
      });
      it('moves to the character previous to the first specified character it finds', function() {
        ensure([
          't', {
            input: 'a'
          }
        ], {
          cursor: [0, 2]
        });
        return ensure([
          't', {
            input: 'a'
          }
        ], {
          cursor: [0, 2]
        });
      });
      it('moves backwards to the character after the first specified character it finds', function() {
        set({
          cursor: [0, 2]
        });
        return ensure([
          'T', {
            input: 'a'
          }
        ], {
          cursor: [0, 1]
        });
      });
      it('respects count forward', function() {
        return ensure([
          '2 t', {
            input: 'a'
          }
        ], {
          cursor: [0, 5]
        });
      });
      it('respects count backward', function() {
        set({
          cursor: [0, 6]
        });
        return ensure([
          '2 T', {
            input: 'a'
          }
        ], {
          cursor: [0, 1]
        });
      });
      it("doesn't move if the character specified isn't found", function() {
        return ensure([
          't', {
            input: 'd'
          }
        ], {
          cursor: [0, 0]
        });
      });
      it("doesn't move if there aren't the specified count of the specified character", function() {
        ensure([
          '1 0 t', {
            input: 'd'
          }
        ], {
          cursor: [0, 0]
        });
        ensure([
          '1 1 t', {
            input: 'a'
          }
        ], {
          cursor: [0, 0]
        });
        set({
          cursor: [0, 6]
        });
        ensure([
          '1 0 T', {
            input: 'a'
          }
        ], {
          cursor: [0, 6]
        });
        return ensure([
          '1 1 T', {
            input: 'a'
          }
        ], {
          cursor: [0, 6]
        });
      });
      it("composes with d", function() {
        set({
          cursor: [0, 3]
        });
        return ensure([
          'd 2 t', {
            input: 'b'
          }
        ], {
          text: 'abcbcabc\n'
        });
      });
      it("delete char under cursor even when no movement happens since it's inclusive motion", function() {
        set({
          cursor: [0, 0]
        });
        return ensure([
          'd t', {
            input: 'b'
          }
        ], {
          text: 'bcabcabcabc\n'
        });
      });
      it("do nothing when inclusiveness inverted by v operator-modifier", function() {
        ({
          text: "abcabcabcabc\n"
        });
        set({
          cursor: [0, 0]
        });
        return ensure([
          'd v t', {
            input: 'b'
          }
        ], {
          text: 'abcabcabcabc\n'
        });
      });
      it("T behaves exclusively when composes with operator", function() {
        set({
          cursor: [0, 3]
        });
        return ensure([
          'd T', {
            input: 'b'
          }
        ], {
          text: 'ababcabcabc\n'
        });
      });
      return it("T don't delete character under cursor even when no movement happens", function() {
        set({
          cursor: [0, 3]
        });
        return ensure([
          'd T', {
            input: 'c'
          }
        ], {
          text: 'abcabcabcabc\n'
        });
      });
    });
    describe('the ; and , keybindings', function() {
      beforeEach(function() {
        return set({
          text: "abcabcabcabc\n",
          cursor: [0, 0]
        });
      });
      it("repeat f in same direction", function() {
        ensure([
          'f', {
            input: 'c'
          }
        ], {
          cursor: [0, 2]
        });
        ensure(';', {
          cursor: [0, 5]
        });
        return ensure(';', {
          cursor: [0, 8]
        });
      });
      it("repeat F in same direction", function() {
        set({
          cursor: [0, 10]
        });
        ensure([
          'F', {
            input: 'c'
          }
        ], {
          cursor: [0, 8]
        });
        ensure(';', {
          cursor: [0, 5]
        });
        return ensure(';', {
          cursor: [0, 2]
        });
      });
      it("repeat f in opposite direction", function() {
        set({
          cursor: [0, 6]
        });
        ensure([
          'f', {
            input: 'c'
          }
        ], {
          cursor: [0, 8]
        });
        ensure(',', {
          cursor: [0, 5]
        });
        return ensure(',', {
          cursor: [0, 2]
        });
      });
      it("repeat F in opposite direction", function() {
        set({
          cursor: [0, 4]
        });
        ensure([
          'F', {
            input: 'c'
          }
        ], {
          cursor: [0, 2]
        });
        ensure(',', {
          cursor: [0, 5]
        });
        return ensure(',', {
          cursor: [0, 8]
        });
      });
      it("alternate repeat f in same direction and reverse", function() {
        ensure([
          'f', {
            input: 'c'
          }
        ], {
          cursor: [0, 2]
        });
        ensure(';', {
          cursor: [0, 5]
        });
        return ensure(',', {
          cursor: [0, 2]
        });
      });
      it("alternate repeat F in same direction and reverse", function() {
        set({
          cursor: [0, 10]
        });
        ensure([
          'F', {
            input: 'c'
          }
        ], {
          cursor: [0, 8]
        });
        ensure(';', {
          cursor: [0, 5]
        });
        return ensure(',', {
          cursor: [0, 8]
        });
      });
      it("repeat t in same direction", function() {
        ensure([
          't', {
            input: 'c'
          }
        ], {
          cursor: [0, 1]
        });
        return ensure(';', {
          cursor: [0, 4]
        });
      });
      it("repeat T in same direction", function() {
        set({
          cursor: [0, 10]
        });
        ensure([
          'T', {
            input: 'c'
          }
        ], {
          cursor: [0, 9]
        });
        return ensure(';', {
          cursor: [0, 6]
        });
      });
      it("repeat t in opposite direction first, and then reverse", function() {
        set({
          cursor: [0, 3]
        });
        ensure([
          't', {
            input: 'c'
          }
        ], {
          cursor: [0, 4]
        });
        ensure(',', {
          cursor: [0, 3]
        });
        return ensure(';', {
          cursor: [0, 4]
        });
      });
      it("repeat T in opposite direction first, and then reverse", function() {
        set({
          cursor: [0, 4]
        });
        ensure([
          'T', {
            input: 'c'
          }
        ], {
          cursor: [0, 3]
        });
        ensure(',', {
          cursor: [0, 4]
        });
        return ensure(';', {
          cursor: [0, 3]
        });
      });
      it("repeat with count in same direction", function() {
        set({
          cursor: [0, 0]
        });
        ensure([
          'f', {
            input: 'c'
          }
        ], {
          cursor: [0, 2]
        });
        return ensure('2 ;', {
          cursor: [0, 8]
        });
      });
      return it("repeat with count in reverse direction", function() {
        set({
          cursor: [0, 6]
        });
        ensure([
          'f', {
            input: 'c'
          }
        ], {
          cursor: [0, 8]
        });
        return ensure('2 ,', {
          cursor: [0, 2]
        });
      });
    });
    return describe("last find/till is repeatable on other editor", function() {
      var other, otherEditor, pane, ref2;
      ref2 = [], other = ref2[0], otherEditor = ref2[1], pane = ref2[2];
      beforeEach(function() {
        return getVimState(function(otherVimState, _other) {
          set({
            text: "a baz bar\n",
            cursor: [0, 0]
          });
          other = _other;
          other.set({
            text: "foo bar baz",
            cursor: [0, 0]
          });
          otherEditor = otherVimState.editor;
          pane = atom.workspace.getActivePane();
          return pane.activateItem(editor);
        });
      });
      it("shares the most recent find/till command with other editors", function() {
        ensure([
          'f', {
            input: 'b'
          }
        ], {
          cursor: [0, 2]
        });
        other.ensure({
          cursor: [0, 0]
        });
        pane.activateItem(otherEditor);
        other.keystroke(';');
        ensure({
          cursor: [0, 2]
        });
        other.ensure({
          cursor: [0, 4]
        });
        other.keystroke([
          't', {
            input: 'r'
          }
        ]);
        ensure({
          cursor: [0, 2]
        });
        other.ensure({
          cursor: [0, 5]
        });
        pane.activateItem(editor);
        ensure(';', {
          cursor: [0, 7]
        });
        return other.ensure({
          cursor: [0, 5]
        });
      });
      return it("is still repeatable after original editor was destroyed", function() {
        ensure([
          'f', {
            input: 'b'
          }
        ], {
          cursor: [0, 2]
        });
        other.ensure({
          cursor: [0, 0]
        });
        pane.activateItem(otherEditor);
        editor.destroy();
        expect(editor.isAlive()).toBe(false);
        other.ensure(';', {
          cursor: [0, 4]
        });
        other.ensure(';', {
          cursor: [0, 8]
        });
        return other.ensure(',', {
          cursor: [0, 4]
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9zcGVjL21vdGlvbi1maW5kLXNwZWMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxNQUFvQyxPQUFBLENBQVEsZUFBUixDQUFwQyxFQUFDLDZCQUFELEVBQWMsdUJBQWQsRUFBd0I7O0VBQ3hCLFFBQUEsR0FBVyxPQUFBLENBQVEsaUJBQVI7O0VBRVgsUUFBQSxDQUFTLGFBQVQsRUFBd0IsU0FBQTtBQUN0QixRQUFBO0lBQUEsT0FBNEQsRUFBNUQsRUFBQyxhQUFELEVBQU0sZ0JBQU4sRUFBYyxtQkFBZCxFQUF5QixnQkFBekIsRUFBaUMsdUJBQWpDLEVBQWdEO0lBRWhELFVBQUEsQ0FBVyxTQUFBO01BQ1QsUUFBUSxDQUFDLEdBQVQsQ0FBYSw0QkFBYixFQUEyQyxJQUEzQzthQUNBLFdBQUEsQ0FBWSxTQUFDLEtBQUQsRUFBUSxJQUFSO1FBQ1YsUUFBQSxHQUFXO1FBQ1Ysd0JBQUQsRUFBUztlQUNSLGNBQUQsRUFBTSxvQkFBTixFQUFjLDBCQUFkLEVBQTJCO01BSGpCLENBQVo7SUFGUyxDQUFYO0lBT0EsUUFBQSxDQUFTLHFCQUFULEVBQWdDLFNBQUE7TUFDOUIsVUFBQSxDQUFXLFNBQUE7ZUFDVCxHQUFBLENBQ0U7VUFBQSxJQUFBLEVBQU0sZ0JBQU47VUFDQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQURSO1NBREY7TUFEUyxDQUFYO01BS0EsRUFBQSxDQUFHLGlEQUFILEVBQXNELFNBQUE7ZUFDcEQsTUFBQSxDQUFPO1VBQUMsR0FBRCxFQUFNO1lBQUEsS0FBQSxFQUFPLEdBQVA7V0FBTjtTQUFQLEVBQTBCO1VBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtTQUExQjtNQURvRCxDQUF0RDtNQUdBLEVBQUEsQ0FBRyx1REFBSCxFQUE0RCxT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QSxJQUFJLENBQUMsWUFBTCxDQUFrQixNQUFsQjtRQUNBLE1BQUEsQ0FBTyxHQUFQLEVBQVk7VUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO1NBQVo7ZUFDQSxLQUFLLENBQUMsTUFBTixDQUFhO1VBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtTQUFiO01BbEJnRSxDQUFsRTthQW9CQSxFQUFBLENBQUcseURBQUgsRUFBOEQsU0FBQTtRQUM1RCxNQUFBLENBQU87VUFBQyxHQUFELEVBQU07WUFBQSxLQUFBLEVBQU8sR0FBUDtXQUFOO1NBQVAsRUFBMEI7VUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO1NBQTFCO1FBQ0EsS0FBSyxDQUFDLE1BQU4sQ0FBYTtVQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7U0FBYjtRQUVBLElBQUksQ0FBQyxZQUFMLENBQWtCLFdBQWxCO1FBQ0EsTUFBTSxDQUFDLE9BQVAsQ0FBQTtRQUNBLE1BQUEsQ0FBTyxNQUFNLENBQUMsT0FBUCxDQUFBLENBQVAsQ0FBd0IsQ0FBQyxJQUF6QixDQUE4QixLQUE5QjtRQUNBLEtBQUssQ0FBQyxNQUFOLENBQWEsR0FBYixFQUFrQjtVQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7U0FBbEI7UUFDQSxLQUFLLENBQUMsTUFBTixDQUFhLEdBQWIsRUFBa0I7VUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO1NBQWxCO2VBQ0EsS0FBSyxDQUFDLE1BQU4sQ0FBYSxHQUFiLEVBQWtCO1VBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtTQUFsQjtNQVQ0RCxDQUE5RDtJQXJDdUQsQ0FBekQ7RUExTHNCLENBQXhCO0FBSEEiLCJzb3VyY2VzQ29udGVudCI6WyJ7Z2V0VmltU3RhdGUsIGRpc3BhdGNoLCBUZXh0RGF0YX0gPSByZXF1aXJlICcuL3NwZWMtaGVscGVyJ1xuc2V0dGluZ3MgPSByZXF1aXJlICcuLi9saWIvc2V0dGluZ3MnXG5cbmRlc2NyaWJlIFwiTW90aW9uIEZpbmRcIiwgLT5cbiAgW3NldCwgZW5zdXJlLCBrZXlzdHJva2UsIGVkaXRvciwgZWRpdG9yRWxlbWVudCwgdmltU3RhdGVdID0gW11cblxuICBiZWZvcmVFYWNoIC0+XG4gICAgc2V0dGluZ3Muc2V0KCd1c2VFeHBlcmltZW50YWxGYXN0ZXJJbnB1dCcsIHRydWUpXG4gICAgZ2V0VmltU3RhdGUgKHN0YXRlLCBfdmltKSAtPlxuICAgICAgdmltU3RhdGUgPSBzdGF0ZSAjIHRvIHJlZmVyIGFzIHZpbVN0YXRlIGxhdGVyLlxuICAgICAge2VkaXRvciwgZWRpdG9yRWxlbWVudH0gPSB2aW1TdGF0ZVxuICAgICAge3NldCwgZW5zdXJlLCBrZXlzdHJva2V9ID0gX3ZpbVxuXG4gIGRlc2NyaWJlICd0aGUgZi9GIGtleWJpbmRpbmdzJywgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXRcbiAgICAgICAgdGV4dDogXCJhYmNhYmNhYmNhYmNcXG5cIlxuICAgICAgICBjdXJzb3I6IFswLCAwXVxuXG4gICAgaXQgJ21vdmVzIHRvIHRoZSBmaXJzdCBzcGVjaWZpZWQgY2hhcmFjdGVyIGl0IGZpbmRzJywgLT5cbiAgICAgIGVuc3VyZSBbJ2YnLCBpbnB1dDogJ2MnXSwgY3Vyc29yOiBbMCwgMl1cblxuICAgIGl0ICdleHRlbmRzIHZpc3VhbCBzZWxlY3Rpb24gaW4gdmlzdWFsLW1vZGUgYW5kIHJlcGV0YWJsZScsIC0+XG4gICAgICBlbnN1cmUgJ3YnLCBtb2RlOiBbJ3Zpc3VhbCcsICdjaGFyYWN0ZXJ3aXNlJ11cbiAgICAgIGVuc3VyZSBbJ2YnLCBpbnB1dDogJ2MnXSwgc2VsZWN0ZWRUZXh0OiAnYWJjJywgY3Vyc29yOiBbMCwgM11cbiAgICAgIGVuc3VyZSAnOycsIHNlbGVjdGVkVGV4dDogJ2FiY2FiYycsIGN1cnNvcjogWzAsIDZdXG4gICAgICBlbnN1cmUgJywnLCBzZWxlY3RlZFRleHQ6ICdhYmMnLCBjdXJzb3I6IFswLCAzXVxuXG4gICAgaXQgJ21vdmVzIGJhY2t3YXJkcyB0byB0aGUgZmlyc3Qgc3BlY2lmaWVkIGNoYXJhY3RlciBpdCBmaW5kcycsIC0+XG4gICAgICBzZXQgY3Vyc29yOiBbMCwgMl1cbiAgICAgIGVuc3VyZSBbJ0YnLCBpbnB1dDogJ2EnXSwgY3Vyc29yOiBbMCwgMF1cblxuICAgIGl0ICdyZXNwZWN0cyBjb3VudCBmb3J3YXJkJywgLT5cbiAgICAgIGVuc3VyZSBbJzIgZicsIGlucHV0OiAnYSddLCBjdXJzb3I6IFswLCA2XVxuXG4gICAgaXQgJ3Jlc3BlY3RzIGNvdW50IGJhY2t3YXJkJywgLT5cbiAgICAgIGN1cnNvcjogWzAsIDZdXG4gICAgICBlbnN1cmUgWycyIEYnLCBpbnB1dDogJ2EnXSwgY3Vyc29yOiBbMCwgMF1cblxuICAgIGl0IFwiZG9lc24ndCBtb3ZlIGlmIHRoZSBjaGFyYWN0ZXIgc3BlY2lmaWVkIGlzbid0IGZvdW5kXCIsIC0+XG4gICAgICBlbnN1cmUgWydmJywgaW5wdXQ6ICdkJ10sIGN1cnNvcjogWzAsIDBdXG5cbiAgICBpdCBcImRvZXNuJ3QgbW92ZSBpZiB0aGVyZSBhcmVuJ3QgdGhlIHNwZWNpZmllZCBjb3VudCBvZiB0aGUgc3BlY2lmaWVkIGNoYXJhY3RlclwiLCAtPlxuICAgICAgZW5zdXJlIFsnMSAwIGYnLCBpbnB1dDogJ2EnXSwgY3Vyc29yOiBbMCwgMF1cbiAgICAgICMgYSBidWcgd2FzIG1ha2luZyB0aGlzIGJlaGF2aW91ciBkZXBlbmQgb24gdGhlIGNvdW50XG4gICAgICBlbnN1cmUgWycxIDEgZicsIGlucHV0OiAnYSddLCBjdXJzb3I6IFswLCAwXVxuICAgICAgIyBhbmQgYmFja3dhcmRzIG5vd1xuICAgICAgc2V0IGN1cnNvcjogWzAsIDZdXG4gICAgICBlbnN1cmUgWycxIDAgRicsIGlucHV0OiAnYSddLCBjdXJzb3I6IFswLCA2XVxuICAgICAgZW5zdXJlIFsnMSAxIEYnLCBpbnB1dDogJ2EnXSwgY3Vyc29yOiBbMCwgNl1cblxuICAgIGl0IFwiY29tcG9zZXMgd2l0aCBkXCIsIC0+XG4gICAgICBzZXQgY3Vyc29yOiBbMCwgM11cbiAgICAgIGVuc3VyZSBbJ2QgMiBmJywgaW5wdXQ6ICdhJ10sIHRleHQ6ICdhYmNiY1xcbidcblxuICAgIGl0IFwiRiBiZWhhdmVzIGV4Y2x1c2l2ZWx5IHdoZW4gY29tcG9zZXMgd2l0aCBvcGVyYXRvclwiLCAtPlxuICAgICAgc2V0IGN1cnNvcjogWzAsIDNdXG4gICAgICBlbnN1cmUgWydkIEYnLCBpbnB1dDogJ2EnXSwgdGV4dDogJ2FiY2FiY2FiY1xcbidcblxuICBkZXNjcmliZSAndGhlIHQvVCBrZXliaW5kaW5ncycsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2V0XG4gICAgICAgIHRleHQ6IFwiYWJjYWJjYWJjYWJjXFxuXCJcbiAgICAgICAgY3Vyc29yOiBbMCwgMF1cblxuICAgIGl0ICdtb3ZlcyB0byB0aGUgY2hhcmFjdGVyIHByZXZpb3VzIHRvIHRoZSBmaXJzdCBzcGVjaWZpZWQgY2hhcmFjdGVyIGl0IGZpbmRzJywgLT5cbiAgICAgIGVuc3VyZSBbJ3QnLCBpbnB1dDogJ2EnXSwgY3Vyc29yOiBbMCwgMl1cbiAgICAgICMgb3Igc3RheXMgcHV0IHdoZW4gaXQncyBhbHJlYWR5IHRoZXJlXG4gICAgICBlbnN1cmUgWyd0JywgaW5wdXQ6ICdhJ10sIGN1cnNvcjogWzAsIDJdXG5cbiAgICBpdCAnbW92ZXMgYmFja3dhcmRzIHRvIHRoZSBjaGFyYWN0ZXIgYWZ0ZXIgdGhlIGZpcnN0IHNwZWNpZmllZCBjaGFyYWN0ZXIgaXQgZmluZHMnLCAtPlxuICAgICAgc2V0IGN1cnNvcjogWzAsIDJdXG4gICAgICBlbnN1cmUgWydUJywgaW5wdXQ6ICdhJ10sIGN1cnNvcjogWzAsIDFdXG5cbiAgICBpdCAncmVzcGVjdHMgY291bnQgZm9yd2FyZCcsIC0+XG4gICAgICBlbnN1cmUgWycyIHQnLCBpbnB1dDogJ2EnXSwgY3Vyc29yOiBbMCwgNV1cblxuICAgIGl0ICdyZXNwZWN0cyBjb3VudCBiYWNrd2FyZCcsIC0+XG4gICAgICBzZXQgY3Vyc29yOiBbMCwgNl1cbiAgICAgIGVuc3VyZSBbJzIgVCcsIGlucHV0OiAnYSddLCBjdXJzb3I6IFswLCAxXVxuXG4gICAgaXQgXCJkb2Vzbid0IG1vdmUgaWYgdGhlIGNoYXJhY3RlciBzcGVjaWZpZWQgaXNuJ3QgZm91bmRcIiwgLT5cbiAgICAgIGVuc3VyZSBbJ3QnLCBpbnB1dDogJ2QnXSwgY3Vyc29yOiBbMCwgMF1cblxuICAgIGl0IFwiZG9lc24ndCBtb3ZlIGlmIHRoZXJlIGFyZW4ndCB0aGUgc3BlY2lmaWVkIGNvdW50IG9mIHRoZSBzcGVjaWZpZWQgY2hhcmFjdGVyXCIsIC0+XG4gICAgICBlbnN1cmUgWycxIDAgdCcsIGlucHV0OiAnZCddLCBjdXJzb3I6IFswLCAwXVxuICAgICAgIyBhIGJ1ZyB3YXMgbWFraW5nIHRoaXMgYmVoYXZpb3VyIGRlcGVuZCBvbiB0aGUgY291bnRcbiAgICAgIGVuc3VyZSBbJzEgMSB0JywgaW5wdXQ6ICdhJ10sIGN1cnNvcjogWzAsIDBdXG4gICAgICAjIGFuZCBiYWNrd2FyZHMgbm93XG4gICAgICBzZXQgY3Vyc29yOiBbMCwgNl1cbiAgICAgIGVuc3VyZSBbJzEgMCBUJywgaW5wdXQ6ICdhJ10sIGN1cnNvcjogWzAsIDZdXG4gICAgICBlbnN1cmUgWycxIDEgVCcsIGlucHV0OiAnYSddLCBjdXJzb3I6IFswLCA2XVxuXG4gICAgaXQgXCJjb21wb3NlcyB3aXRoIGRcIiwgLT5cbiAgICAgIHNldCBjdXJzb3I6IFswLCAzXVxuICAgICAgZW5zdXJlIFsnZCAyIHQnLCBpbnB1dDogJ2InXSxcbiAgICAgICAgdGV4dDogJ2FiY2JjYWJjXFxuJ1xuXG4gICAgaXQgXCJkZWxldGUgY2hhciB1bmRlciBjdXJzb3IgZXZlbiB3aGVuIG5vIG1vdmVtZW50IGhhcHBlbnMgc2luY2UgaXQncyBpbmNsdXNpdmUgbW90aW9uXCIsIC0+XG4gICAgICBzZXQgY3Vyc29yOiBbMCwgMF1cbiAgICAgIGVuc3VyZSBbJ2QgdCcsIGlucHV0OiAnYiddLFxuICAgICAgICB0ZXh0OiAnYmNhYmNhYmNhYmNcXG4nXG4gICAgaXQgXCJkbyBub3RoaW5nIHdoZW4gaW5jbHVzaXZlbmVzcyBpbnZlcnRlZCBieSB2IG9wZXJhdG9yLW1vZGlmaWVyXCIsIC0+XG4gICAgICB0ZXh0OiBcImFiY2FiY2FiY2FiY1xcblwiXG4gICAgICBzZXQgY3Vyc29yOiBbMCwgMF1cbiAgICAgIGVuc3VyZSBbJ2QgdiB0JywgaW5wdXQ6ICdiJ10sXG4gICAgICAgIHRleHQ6ICdhYmNhYmNhYmNhYmNcXG4nXG5cbiAgICBpdCBcIlQgYmVoYXZlcyBleGNsdXNpdmVseSB3aGVuIGNvbXBvc2VzIHdpdGggb3BlcmF0b3JcIiwgLT5cbiAgICAgIHNldCBjdXJzb3I6IFswLCAzXVxuICAgICAgZW5zdXJlIFsnZCBUJywgaW5wdXQ6ICdiJ10sXG4gICAgICAgIHRleHQ6ICdhYmFiY2FiY2FiY1xcbidcblxuICAgIGl0IFwiVCBkb24ndCBkZWxldGUgY2hhcmFjdGVyIHVuZGVyIGN1cnNvciBldmVuIHdoZW4gbm8gbW92ZW1lbnQgaGFwcGVuc1wiLCAtPlxuICAgICAgc2V0IGN1cnNvcjogWzAsIDNdXG4gICAgICBlbnN1cmUgWydkIFQnLCBpbnB1dDogJ2MnXSxcbiAgICAgICAgdGV4dDogJ2FiY2FiY2FiY2FiY1xcbidcblxuICBkZXNjcmliZSAndGhlIDsgYW5kICwga2V5YmluZGluZ3MnLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNldFxuICAgICAgICB0ZXh0OiBcImFiY2FiY2FiY2FiY1xcblwiXG4gICAgICAgIGN1cnNvcjogWzAsIDBdXG5cbiAgICBpdCBcInJlcGVhdCBmIGluIHNhbWUgZGlyZWN0aW9uXCIsIC0+XG4gICAgICBlbnN1cmUgWydmJywgaW5wdXQ6ICdjJ10sIGN1cnNvcjogWzAsIDJdXG4gICAgICBlbnN1cmUgJzsnLCBjdXJzb3I6IFswLCA1XVxuICAgICAgZW5zdXJlICc7JywgY3Vyc29yOiBbMCwgOF1cblxuICAgIGl0IFwicmVwZWF0IEYgaW4gc2FtZSBkaXJlY3Rpb25cIiwgLT5cbiAgICAgIHNldCBjdXJzb3I6IFswLCAxMF1cbiAgICAgIGVuc3VyZSBbJ0YnLCBpbnB1dDogJ2MnXSwgY3Vyc29yOiBbMCwgOF1cbiAgICAgIGVuc3VyZSAnOycsIGN1cnNvcjogWzAsIDVdXG4gICAgICBlbnN1cmUgJzsnLCBjdXJzb3I6IFswLCAyXVxuXG4gICAgaXQgXCJyZXBlYXQgZiBpbiBvcHBvc2l0ZSBkaXJlY3Rpb25cIiwgLT5cbiAgICAgIHNldCBjdXJzb3I6IFswLCA2XVxuICAgICAgZW5zdXJlIFsnZicsIGlucHV0OiAnYyddLCBjdXJzb3I6IFswLCA4XVxuICAgICAgZW5zdXJlICcsJywgY3Vyc29yOiBbMCwgNV1cbiAgICAgIGVuc3VyZSAnLCcsIGN1cnNvcjogWzAsIDJdXG5cbiAgICBpdCBcInJlcGVhdCBGIGluIG9wcG9zaXRlIGRpcmVjdGlvblwiLCAtPlxuICAgICAgc2V0IGN1cnNvcjogWzAsIDRdXG4gICAgICBlbnN1cmUgWydGJywgaW5wdXQ6ICdjJ10sIGN1cnNvcjogWzAsIDJdXG4gICAgICBlbnN1cmUgJywnLCBjdXJzb3I6IFswLCA1XVxuICAgICAgZW5zdXJlICcsJywgY3Vyc29yOiBbMCwgOF1cblxuICAgIGl0IFwiYWx0ZXJuYXRlIHJlcGVhdCBmIGluIHNhbWUgZGlyZWN0aW9uIGFuZCByZXZlcnNlXCIsIC0+XG4gICAgICBlbnN1cmUgWydmJywgaW5wdXQ6ICdjJ10sIGN1cnNvcjogWzAsIDJdXG4gICAgICBlbnN1cmUgJzsnLCBjdXJzb3I6IFswLCA1XVxuICAgICAgZW5zdXJlICcsJywgY3Vyc29yOiBbMCwgMl1cblxuICAgIGl0IFwiYWx0ZXJuYXRlIHJlcGVhdCBGIGluIHNhbWUgZGlyZWN0aW9uIGFuZCByZXZlcnNlXCIsIC0+XG4gICAgICBzZXQgY3Vyc29yOiBbMCwgMTBdXG4gICAgICBlbnN1cmUgWydGJywgaW5wdXQ6ICdjJ10sIGN1cnNvcjogWzAsIDhdXG4gICAgICBlbnN1cmUgJzsnLCBjdXJzb3I6IFswLCA1XVxuICAgICAgZW5zdXJlICcsJywgY3Vyc29yOiBbMCwgOF1cblxuICAgIGl0IFwicmVwZWF0IHQgaW4gc2FtZSBkaXJlY3Rpb25cIiwgLT5cbiAgICAgIGVuc3VyZSBbJ3QnLCBpbnB1dDogJ2MnXSwgY3Vyc29yOiBbMCwgMV1cbiAgICAgIGVuc3VyZSAnOycsIGN1cnNvcjogWzAsIDRdXG5cbiAgICBpdCBcInJlcGVhdCBUIGluIHNhbWUgZGlyZWN0aW9uXCIsIC0+XG4gICAgICBzZXQgY3Vyc29yOiBbMCwgMTBdXG4gICAgICBlbnN1cmUgWydUJywgaW5wdXQ6ICdjJ10sIGN1cnNvcjogWzAsIDldXG4gICAgICBlbnN1cmUgJzsnLCBjdXJzb3I6IFswLCA2XVxuXG4gICAgaXQgXCJyZXBlYXQgdCBpbiBvcHBvc2l0ZSBkaXJlY3Rpb24gZmlyc3QsIGFuZCB0aGVuIHJldmVyc2VcIiwgLT5cbiAgICAgIHNldCBjdXJzb3I6IFswLCAzXVxuICAgICAgZW5zdXJlIFsndCcsIGlucHV0OiAnYyddLCBjdXJzb3I6IFswLCA0XVxuICAgICAgZW5zdXJlICcsJywgY3Vyc29yOiBbMCwgM11cbiAgICAgIGVuc3VyZSAnOycsIGN1cnNvcjogWzAsIDRdXG5cbiAgICBpdCBcInJlcGVhdCBUIGluIG9wcG9zaXRlIGRpcmVjdGlvbiBmaXJzdCwgYW5kIHRoZW4gcmV2ZXJzZVwiLCAtPlxuICAgICAgc2V0IGN1cnNvcjogWzAsIDRdXG4gICAgICBlbnN1cmUgWydUJywgaW5wdXQ6ICdjJ10sIGN1cnNvcjogWzAsIDNdXG4gICAgICBlbnN1cmUgJywnLCBjdXJzb3I6IFswLCA0XVxuICAgICAgZW5zdXJlICc7JywgY3Vyc29yOiBbMCwgM11cblxuICAgIGl0IFwicmVwZWF0IHdpdGggY291bnQgaW4gc2FtZSBkaXJlY3Rpb25cIiwgLT5cbiAgICAgIHNldCBjdXJzb3I6IFswLCAwXVxuICAgICAgZW5zdXJlIFsnZicsIGlucHV0OiAnYyddLCBjdXJzb3I6IFswLCAyXVxuICAgICAgZW5zdXJlICcyIDsnLCBjdXJzb3I6IFswLCA4XVxuXG4gICAgaXQgXCJyZXBlYXQgd2l0aCBjb3VudCBpbiByZXZlcnNlIGRpcmVjdGlvblwiLCAtPlxuICAgICAgc2V0IGN1cnNvcjogWzAsIDZdXG4gICAgICBlbnN1cmUgWydmJywgaW5wdXQ6ICdjJ10sIGN1cnNvcjogWzAsIDhdXG4gICAgICBlbnN1cmUgJzIgLCcsIGN1cnNvcjogWzAsIDJdXG5cbiAgZGVzY3JpYmUgXCJsYXN0IGZpbmQvdGlsbCBpcyByZXBlYXRhYmxlIG9uIG90aGVyIGVkaXRvclwiLCAtPlxuICAgIFtvdGhlciwgb3RoZXJFZGl0b3IsIHBhbmVdID0gW11cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBnZXRWaW1TdGF0ZSAob3RoZXJWaW1TdGF0ZSwgX290aGVyKSAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0OiBcImEgYmF6IGJhclxcblwiXG4gICAgICAgICAgY3Vyc29yOiBbMCwgMF1cblxuICAgICAgICBvdGhlciA9IF9vdGhlclxuICAgICAgICBvdGhlci5zZXRcbiAgICAgICAgICB0ZXh0OiBcImZvbyBiYXIgYmF6XCIsXG4gICAgICAgICAgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgb3RoZXJFZGl0b3IgPSBvdGhlclZpbVN0YXRlLmVkaXRvclxuXG4gICAgICAgIHBhbmUgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lKClcbiAgICAgICAgcGFuZS5hY3RpdmF0ZUl0ZW0oZWRpdG9yKVxuXG4gICAgaXQgXCJzaGFyZXMgdGhlIG1vc3QgcmVjZW50IGZpbmQvdGlsbCBjb21tYW5kIHdpdGggb3RoZXIgZWRpdG9yc1wiLCAtPlxuICAgICAgZW5zdXJlIFsnZicsIGlucHV0OiAnYiddLCBjdXJzb3I6IFswLCAyXVxuICAgICAgb3RoZXIuZW5zdXJlIGN1cnNvcjogWzAsIDBdXG5cbiAgICAgICMgcmVwbGF5IHNhbWUgZmluZCBpbiB0aGUgb3RoZXIgZWRpdG9yXG4gICAgICBwYW5lLmFjdGl2YXRlSXRlbShvdGhlckVkaXRvcilcbiAgICAgIG90aGVyLmtleXN0cm9rZSAnOydcbiAgICAgIGVuc3VyZSBjdXJzb3I6IFswLCAyXVxuICAgICAgb3RoZXIuZW5zdXJlIGN1cnNvcjogWzAsIDRdXG5cbiAgICAgICMgZG8gYSB0aWxsIGluIHRoZSBvdGhlciBlZGl0b3JcbiAgICAgIG90aGVyLmtleXN0cm9rZSBbJ3QnLCBpbnB1dDogJ3InXVxuICAgICAgZW5zdXJlIGN1cnNvcjogWzAsIDJdXG4gICAgICBvdGhlci5lbnN1cmUgY3Vyc29yOiBbMCwgNV1cblxuICAgICAgIyBhbmQgcmVwbGF5IGluIHRoZSBub3JtYWwgZWRpdG9yXG4gICAgICBwYW5lLmFjdGl2YXRlSXRlbShlZGl0b3IpXG4gICAgICBlbnN1cmUgJzsnLCBjdXJzb3I6IFswLCA3XVxuICAgICAgb3RoZXIuZW5zdXJlIGN1cnNvcjogWzAsIDVdXG5cbiAgICBpdCBcImlzIHN0aWxsIHJlcGVhdGFibGUgYWZ0ZXIgb3JpZ2luYWwgZWRpdG9yIHdhcyBkZXN0cm95ZWRcIiwgLT5cbiAgICAgIGVuc3VyZSBbJ2YnLCBpbnB1dDogJ2InXSwgY3Vyc29yOiBbMCwgMl1cbiAgICAgIG90aGVyLmVuc3VyZSBjdXJzb3I6IFswLCAwXVxuXG4gICAgICBwYW5lLmFjdGl2YXRlSXRlbShvdGhlckVkaXRvcilcbiAgICAgIGVkaXRvci5kZXN0cm95KClcbiAgICAgIGV4cGVjdChlZGl0b3IuaXNBbGl2ZSgpKS50b0JlKGZhbHNlKVxuICAgICAgb3RoZXIuZW5zdXJlICc7JywgY3Vyc29yOiBbMCwgNF1cbiAgICAgIG90aGVyLmVuc3VyZSAnOycsIGN1cnNvcjogWzAsIDhdXG4gICAgICBvdGhlci5lbnN1cmUgJywnLCBjdXJzb3I6IFswLCA0XVxuIl19
