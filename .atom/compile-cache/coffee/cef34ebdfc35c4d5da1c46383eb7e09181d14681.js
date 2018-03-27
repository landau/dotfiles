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
    describe('the f performance', function() {
      var measureWithPerformanceNow, measureWithTimeEnd, timesToExecute;
      timesToExecute = 500;
      measureWithTimeEnd = function(fn) {
        console.time(fn.name);
        fn();
        return console.timeEnd(fn.name);
      };
      measureWithPerformanceNow = function(fn) {
        var t0, t1;
        t0 = performance.now();
        fn();
        t1 = performance.now();
        return console.log("[performance.now] took " + (t1 - t0) + " msec");
      };
      beforeEach(function() {
        return set({
          text: "  " + "l".repeat(timesToExecute),
          cursor: [0, 0]
        });
      });
      xdescribe('the f read-char-via-keybinding performance', function() {
        beforeEach(function() {
          return vimState.useMiniEditor = false;
        });
        return it('[with keybind] moves to l char', function() {
          var testPerformanceOfKeybind;
          testPerformanceOfKeybind = function() {
            var i, n, ref2;
            for (n = i = 1, ref2 = timesToExecute; 1 <= ref2 ? i <= ref2 : i >= ref2; n = 1 <= ref2 ? ++i : --i) {
              keystroke("f l");
            }
            return ensure({
              cursor: [0, timesToExecute + 1]
            });
          };
          console.log("== keybind");
          ensure("f l", {
            cursor: [0, 2]
          });
          set({
            cursor: [0, 0]
          });
          return measureWithTimeEnd(testPerformanceOfKeybind);
        });
      });
      return describe('[with hidden-input] moves to l char', function() {
        return it('[with hidden-input] moves to l char', function() {
          var testPerformanceOfHiddenInput;
          testPerformanceOfHiddenInput = function() {
            var i, n, ref2;
            for (n = i = 1, ref2 = timesToExecute; 1 <= ref2 ? i <= ref2 : i >= ref2; n = 1 <= ref2 ? ++i : --i) {
              keystroke('f l');
            }
            return ensure({
              cursor: [0, timesToExecute + 1]
            });
          };
          console.log("== hidden");
          ensure('f l', {
            cursor: [0, 2]
          });
          set({
            cursor: [0, 0]
          });
          return measureWithTimeEnd(testPerformanceOfHiddenInput);
        });
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
        return ensure('f c', {
          cursor: [0, 2]
        });
      });
      it('extends visual selection in visual-mode and repetable', function() {
        ensure('v', {
          mode: ['visual', 'characterwise']
        });
        ensure('f c', {
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
        return ensure('F a', {
          cursor: [0, 0]
        });
      });
      it('respects count forward', function() {
        return ensure('2 f a', {
          cursor: [0, 6]
        });
      });
      it('respects count backward', function() {
        ({
          cursor: [0, 6]
        });
        return ensure('2 F a', {
          cursor: [0, 0]
        });
      });
      it("doesn't move if the character specified isn't found", function() {
        return ensure('f d', {
          cursor: [0, 0]
        });
      });
      it("doesn't move if there aren't the specified count of the specified character", function() {
        ensure('1 0 f a', {
          cursor: [0, 0]
        });
        ensure('1 1 f a', {
          cursor: [0, 0]
        });
        set({
          cursor: [0, 6]
        });
        ensure('1 0 F a', {
          cursor: [0, 6]
        });
        return ensure('1 1 F a', {
          cursor: [0, 6]
        });
      });
      it("composes with d", function() {
        set({
          cursor: [0, 3]
        });
        return ensure('d 2 f a', {
          text: 'abcbc\n'
        });
      });
      return it("F behaves exclusively when composes with operator", function() {
        set({
          cursor: [0, 3]
        });
        return ensure('d F a', {
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
        ensure('t a', {
          cursor: [0, 2]
        });
        return ensure('t a', {
          cursor: [0, 2]
        });
      });
      it('moves backwards to the character after the first specified character it finds', function() {
        set({
          cursor: [0, 2]
        });
        return ensure('T a', {
          cursor: [0, 1]
        });
      });
      it('respects count forward', function() {
        return ensure('2 t a', {
          cursor: [0, 5]
        });
      });
      it('respects count backward', function() {
        set({
          cursor: [0, 6]
        });
        return ensure('2 T a', {
          cursor: [0, 1]
        });
      });
      it("doesn't move if the character specified isn't found", function() {
        return ensure('t d', {
          cursor: [0, 0]
        });
      });
      it("doesn't move if there aren't the specified count of the specified character", function() {
        ensure('1 0 t d', {
          cursor: [0, 0]
        });
        ensure('1 1 t a', {
          cursor: [0, 0]
        });
        set({
          cursor: [0, 6]
        });
        ensure('1 0 T a', {
          cursor: [0, 6]
        });
        return ensure('1 1 T a', {
          cursor: [0, 6]
        });
      });
      it("composes with d", function() {
        set({
          cursor: [0, 3]
        });
        return ensure('d 2 t b', {
          text: 'abcbcabc\n'
        });
      });
      it("delete char under cursor even when no movement happens since it's inclusive motion", function() {
        set({
          cursor: [0, 0]
        });
        return ensure('d t b', {
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
        return ensure('d v t b', {
          text: 'abcabcabcabc\n'
        });
      });
      it("T behaves exclusively when composes with operator", function() {
        set({
          cursor: [0, 3]
        });
        return ensure('d T b', {
          text: 'ababcabcabc\n'
        });
      });
      return it("T don't delete character under cursor even when no movement happens", function() {
        set({
          cursor: [0, 3]
        });
        return ensure('d T c', {
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
        ensure('f c', {
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
        ensure('F c', {
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
        ensure('f c', {
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
        ensure('F c', {
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
        ensure('f c', {
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
        ensure('F c', {
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
        ensure('t c', {
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
        ensure('T c', {
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
        ensure('t c', {
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
        ensure('T c', {
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
        ensure('f c', {
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
        ensure('f c', {
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
        ensure('f b', {
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
        other.keystroke('t r');
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
        ensure('f b', {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9zcGVjL21vdGlvbi1maW5kLXNwZWMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxNQUFvQyxPQUFBLENBQVEsZUFBUixDQUFwQyxFQUFDLDZCQUFELEVBQWMsdUJBQWQsRUFBd0I7O0VBQ3hCLFFBQUEsR0FBVyxPQUFBLENBQVEsaUJBQVI7O0VBRVgsUUFBQSxDQUFTLGFBQVQsRUFBd0IsU0FBQTtBQUN0QixRQUFBO0lBQUEsT0FBNEQsRUFBNUQsRUFBQyxhQUFELEVBQU0sZ0JBQU4sRUFBYyxtQkFBZCxFQUF5QixnQkFBekIsRUFBaUMsdUJBQWpDLEVBQWdEO0lBRWhELFVBQUEsQ0FBVyxTQUFBO01BQ1QsUUFBUSxDQUFDLEdBQVQsQ0FBYSw0QkFBYixFQUEyQyxJQUEzQzthQUdBLFdBQUEsQ0FBWSxTQUFDLEtBQUQsRUFBUSxJQUFSO1FBQ1YsUUFBQSxHQUFXO1FBQ1Ysd0JBQUQsRUFBUztlQUNSLGNBQUQsRUFBTSxvQkFBTixFQUFjLDBCQUFkLEVBQTJCO01BSGpCLENBQVo7SUFKUyxDQUFYO0lBU0EsUUFBQSxDQUFTLG1CQUFULEVBQThCLFNBQUE7QUFDNUIsVUFBQTtNQUFBLGNBQUEsR0FBaUI7TUFFakIsa0JBQUEsR0FBcUIsU0FBQyxFQUFEO1FBQ25CLE9BQU8sQ0FBQyxJQUFSLENBQWEsRUFBRSxDQUFDLElBQWhCO1FBQ0EsRUFBQSxDQUFBO2VBRUEsT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsRUFBRSxDQUFDLElBQW5CO01BSm1CO01BTXJCLHlCQUFBLEdBQTRCLFNBQUMsRUFBRDtBQUMxQixZQUFBO1FBQUEsRUFBQSxHQUFLLFdBQVcsQ0FBQyxHQUFaLENBQUE7UUFDTCxFQUFBLENBQUE7UUFDQSxFQUFBLEdBQUssV0FBVyxDQUFDLEdBQVosQ0FBQTtlQUNMLE9BQU8sQ0FB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bEU7YUFvQkEsRUFBQSxDQUFHLHlEQUFILEVBQThELFNBQUE7UUFDNUQsTUFBQSxDQUFPLEtBQVAsRUFBYztVQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7U0FBZDtRQUNBLEtBQUssQ0FBQyxNQUFOLENBQWE7VUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO1NBQWI7UUFFQSxJQUFJLENBQUMsWUFBTCxDQUFrQixXQUFsQjtRQUNBLE1BQU0sQ0FBQyxPQUFQLENBQUE7UUFDQSxNQUFBLENBQU8sTUFBTSxDQUFDLE9BQVAsQ0FBQSxDQUFQLENBQXdCLENBQUMsSUFBekIsQ0FBOEIsS0FBOUI7UUFDQSxLQUFLLENBQUMsTUFBTixDQUFhLEdBQWIsRUFBa0I7VUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO1NBQWxCO1FBQ0EsS0FBSyxDQUFDLE1BQU4sQ0FBYSxHQUFiLEVBQWtCO1VBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtTQUFsQjtlQUNBLEtBQUssQ0FBQyxNQUFOLENBQWEsR0FBYixFQUFrQjtVQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7U0FBbEI7TUFUNEQsQ0FBOUQ7SUF0Q3VELENBQXpEO0VBOU9zQixDQUF4QjtBQUhBIiwic291cmNlc0NvbnRlbnQiOlsie2dldFZpbVN0YXRlLCBkaXNwYXRjaCwgVGV4dERhdGF9ID0gcmVxdWlyZSAnLi9zcGVjLWhlbHBlcidcbnNldHRpbmdzID0gcmVxdWlyZSAnLi4vbGliL3NldHRpbmdzJ1xuXG5kZXNjcmliZSBcIk1vdGlvbiBGaW5kXCIsIC0+XG4gIFtzZXQsIGVuc3VyZSwga2V5c3Ryb2tlLCBlZGl0b3IsIGVkaXRvckVsZW1lbnQsIHZpbVN0YXRlXSA9IFtdXG5cbiAgYmVmb3JlRWFjaCAtPlxuICAgIHNldHRpbmdzLnNldCgndXNlRXhwZXJpbWVudGFsRmFzdGVySW5wdXQnLCB0cnVlKVxuICAgICMgamFzbWluZS5hdHRhY2hUb0RPTShhdG9tLndvcmtzcGFjZS5nZXRFbGVtZW50KCkpXG5cbiAgICBnZXRWaW1TdGF0ZSAoc3RhdGUsIF92aW0pIC0+XG4gICAgICB2aW1TdGF0ZSA9IHN0YXRlICMgdG8gcmVmZXIgYXMgdmltU3RhdGUgbGF0ZXIuXG4gICAgICB7ZWRpdG9yLCBlZGl0b3JFbGVtZW50fSA9IHZpbVN0YXRlXG4gICAgICB7c2V0LCBlbnN1cmUsIGtleXN0cm9rZX0gPSBfdmltXG5cbiAgZGVzY3JpYmUgJ3RoZSBmIHBlcmZvcm1hbmNlJywgLT5cbiAgICB0aW1lc1RvRXhlY3V0ZSA9IDUwMFxuICAgICMgdGltZXNUb0V4ZWN1dGUgPSAxXG4gICAgbWVhc3VyZVdpdGhUaW1lRW5kID0gKGZuKSAtPlxuICAgICAgY29uc29sZS50aW1lKGZuLm5hbWUpXG4gICAgICBmbigpXG4gICAgICAjIGNvbnNvbGUubG9nIFwiW3RpbWUtZW5kXVwiXG4gICAgICBjb25zb2xlLnRpbWVFbmQoZm4ubmFtZSlcblxuICAgIG1lYXN1cmVXaXRoUGVyZm9ybWFuY2VOb3cgPSAoZm4pIC0+XG4gICAgICB0MCA9IHBlcmZvcm1hbmNlLm5vdygpXG4gICAgICBmbigpXG4gICAgICB0MSA9IHBlcmZvcm1hbmNlLm5vdygpXG4gICAgICBjb25zb2xlLmxvZyBcIltwZXJmb3JtYW5jZS5ub3ddIHRvb2sgI3t0MSAtIHQwfSBtc2VjXCJcblxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNldFxuICAgICAgICB0ZXh0OiBcIiAgXCIgKyBcImxcIi5yZXBlYXQodGltZXNUb0V4ZWN1dGUpXG4gICAgICAgIGN1cnNvcjogWzAsIDBdXG5cbiAgICB4ZGVzY3JpYmUgJ3RoZSBmIHJlYWQtY2hhci12aWEta2V5YmluZGluZyBwZXJmb3JtYW5jZScsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHZpbVN0YXRlLnVzZU1pbmlFZGl0b3IgPSBmYWxzZVxuXG4gICAgICBpdCAnW3dpdGgga2V5YmluZF0gbW92ZXMgdG8gbCBjaGFyJywgLT5cbiAgICAgICAgdGVzdFBlcmZvcm1hbmNlT2ZLZXliaW5kID0gLT5cbiAgICAgICAgICBrZXlzdHJva2UgXCJmIGxcIiBmb3IgbiBpbiBbMS4udGltZXNUb0V4ZWN1dGVdXG4gICAgICAgICAgZW5zdXJlIGN1cnNvcjogWzAsIHRpbWVzVG9FeGVjdXRlICsgMV1cblxuICAgICAgICBjb25zb2xlLmxvZyBcIj09IGtleWJpbmRcIlxuICAgICAgICBlbnN1cmUgXCJmIGxcIiwgY3Vyc29yOiBbMCwgMl1cbiAgICAgICAgc2V0IGN1cnNvcjogWzAsIDBdXG4gICAgICAgIG1lYXN1cmVXaXRoVGltZUVuZCh0ZXN0UGVyZm9ybWFuY2VPZktleWJpbmQpXG4gICAgICAgICMgc2V0IGN1cnNvcjogWzAsIDBdXG4gICAgICAgICMgbWVhc3VyZVdpdGhQZXJmb3JtYW5jZU5vdyh0ZXN0UGVyZm9ybWFuY2VPZktleWJpbmQpXG5cbiAgICBkZXNjcmliZSAnW3dpdGggaGlkZGVuLWlucHV0XSBtb3ZlcyB0byBsIGNoYXInLCAtPlxuICAgICAgaXQgJ1t3aXRoIGhpZGRlbi1pbnB1dF0gbW92ZXMgdG8gbCBjaGFyJywgLT5cbiAgICAgICAgdGVzdFBlcmZvcm1hbmNlT2ZIaWRkZW5JbnB1dCA9IC0+XG4gICAgICAgICAga2V5c3Ryb2tlICdmIGwnIGZvciBuIGluIFsxLi50aW1lc1RvRXhlY3V0ZV1cbiAgICAgICAgICBlbnN1cmUgY3Vyc29yOiBbMCwgdGltZXNUb0V4ZWN1dGUgKyAxXVxuXG4gICAgICAgIGNvbnNvbGUubG9nIFwiPT0gaGlkZGVuXCJcbiAgICAgICAgZW5zdXJlICdmIGwnLCBjdXJzb3I6IFswLCAyXVxuXG4gICAgICAgIHNldCBjdXJzb3I6IFswLCAwXVxuICAgICAgICBtZWFzdXJlV2l0aFRpbWVFbmQodGVzdFBlcmZvcm1hbmNlT2ZIaWRkZW5JbnB1dClcbiAgICAgICAgIyBzZXQgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgIyBtZWFzdXJlV2l0aFBlcmZvcm1hbmNlTm93KHRlc3RQZXJmb3JtYW5jZU9mSGlkZGVuSW5wdXQpXG5cbiAgZGVzY3JpYmUgJ3RoZSBmL0Yga2V5YmluZGluZ3MnLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNldFxuICAgICAgICB0ZXh0OiBcImFiY2FiY2FiY2FiY1xcblwiXG4gICAgICAgIGN1cnNvcjogWzAsIDBdXG5cbiAgICBpdCAnbW92ZXMgdG8gdGhlIGZpcnN0IHNwZWNpZmllZCBjaGFyYWN0ZXIgaXQgZmluZHMnLCAtPlxuICAgICAgZW5zdXJlICdmIGMnLCBjdXJzb3I6IFswLCAyXVxuXG4gICAgaXQgJ2V4dGVuZHMgdmlzdWFsIHNlbGVjdGlvbiBpbiB2aXN1YWwtbW9kZSBhbmQgcmVwZXRhYmxlJywgLT5cbiAgICAgIGVuc3VyZSAndicsIG1vZGU6IFsndmlzdWFsJywgJ2NoYXJhY3Rlcndpc2UnXVxuICAgICAgZW5zdXJlICdmIGMnLCBzZWxlY3RlZFRleHQ6ICdhYmMnLCBjdXJzb3I6IFswLCAzXVxuICAgICAgZW5zdXJlICc7Jywgc2VsZWN0ZWRUZXh0OiAnYWJjYWJjJywgY3Vyc29yOiBbMCwgNl1cbiAgICAgIGVuc3VyZSAnLCcsIHNlbGVjdGVkVGV4dDogJ2FiYycsIGN1cnNvcjogWzAsIDNdXG5cbiAgICBpdCAnbW92ZXMgYmFja3dhcmRzIHRvIHRoZSBmaXJzdCBzcGVjaWZpZWQgY2hhcmFjdGVyIGl0IGZpbmRzJywgLT5cbiAgICAgIHNldCBjdXJzb3I6IFswLCAyXVxuICAgICAgZW5zdXJlICdGIGEnLCBjdXJzb3I6IFswLCAwXVxuXG4gICAgaXQgJ3Jlc3BlY3RzIGNvdW50IGZvcndhcmQnLCAtPlxuICAgICAgZW5zdXJlICcyIGYgYScsIGN1cnNvcjogWzAsIDZdXG5cbiAgICBpdCAncmVzcGVjdHMgY291bnQgYmFja3dhcmQnLCAtPlxuICAgICAgY3Vyc29yOiBbMCwgNl1cbiAgICAgIGVuc3VyZSAnMiBGIGEnLCBjdXJzb3I6IFswLCAwXVxuXG4gICAgaXQgXCJkb2Vzbid0IG1vdmUgaWYgdGhlIGNoYXJhY3RlciBzcGVjaWZpZWQgaXNuJ3QgZm91bmRcIiwgLT5cbiAgICAgIGVuc3VyZSAnZiBkJywgY3Vyc29yOiBbMCwgMF1cblxuICAgIGl0IFwiZG9lc24ndCBtb3ZlIGlmIHRoZXJlIGFyZW4ndCB0aGUgc3BlY2lmaWVkIGNvdW50IG9mIHRoZSBzcGVjaWZpZWQgY2hhcmFjdGVyXCIsIC0+XG4gICAgICBlbnN1cmUgJzEgMCBmIGEnLCBjdXJzb3I6IFswLCAwXVxuICAgICAgIyBhIGJ1ZyB3YXMgbWFraW5nIHRoaXMgYmVoYXZpb3VyIGRlcGVuZCBvbiB0aGUgY291bnRcbiAgICAgIGVuc3VyZSAnMSAxIGYgYScsIGN1cnNvcjogWzAsIDBdXG4gICAgICAjIGFuZCBiYWNrd2FyZHMgbm93XG4gICAgICBzZXQgY3Vyc29yOiBbMCwgNl1cbiAgICAgIGVuc3VyZSAnMSAwIEYgYScsIGN1cnNvcjogWzAsIDZdXG4gICAgICBlbnN1cmUgJzEgMSBGIGEnLCBjdXJzb3I6IFswLCA2XVxuXG4gICAgaXQgXCJjb21wb3NlcyB3aXRoIGRcIiwgLT5cbiAgICAgIHNldCBjdXJzb3I6IFswLCAzXVxuICAgICAgZW5zdXJlICdkIDIgZiBhJywgdGV4dDogJ2FiY2JjXFxuJ1xuXG4gICAgaXQgXCJGIGJlaGF2ZXMgZXhjbHVzaXZlbHkgd2hlbiBjb21wb3NlcyB3aXRoIG9wZXJhdG9yXCIsIC0+XG4gICAgICBzZXQgY3Vyc29yOiBbMCwgM11cbiAgICAgIGVuc3VyZSAnZCBGIGEnLCB0ZXh0OiAnYWJjYWJjYWJjXFxuJ1xuXG4gIGRlc2NyaWJlICd0aGUgdC9UIGtleWJpbmRpbmdzJywgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXRcbiAgICAgICAgdGV4dDogXCJhYmNhYmNhYmNhYmNcXG5cIlxuICAgICAgICBjdXJzb3I6IFswLCAwXVxuXG4gICAgaXQgJ21vdmVzIHRvIHRoZSBjaGFyYWN0ZXIgcHJldmlvdXMgdG8gdGhlIGZpcnN0IHNwZWNpZmllZCBjaGFyYWN0ZXIgaXQgZmluZHMnLCAtPlxuICAgICAgZW5zdXJlICd0IGEnLCBjdXJzb3I6IFswLCAyXVxuICAgICAgIyBvciBzdGF5cyBwdXQgd2hlbiBpdCdzIGFscmVhZHkgdGhlcmVcbiAgICAgIGVuc3VyZSAndCBhJywgY3Vyc29yOiBbMCwgMl1cblxuICAgIGl0ICdtb3ZlcyBiYWNrd2FyZHMgdG8gdGhlIGNoYXJhY3RlciBhZnRlciB0aGUgZmlyc3Qgc3BlY2lmaWVkIGNoYXJhY3RlciBpdCBmaW5kcycsIC0+XG4gICAgICBzZXQgY3Vyc29yOiBbMCwgMl1cbiAgICAgIGVuc3VyZSAnVCBhJywgY3Vyc29yOiBbMCwgMV1cblxuICAgIGl0ICdyZXNwZWN0cyBjb3VudCBmb3J3YXJkJywgLT5cbiAgICAgIGVuc3VyZSAnMiB0IGEnLCBjdXJzb3I6IFswLCA1XVxuXG4gICAgaXQgJ3Jlc3BlY3RzIGNvdW50IGJhY2t3YXJkJywgLT5cbiAgICAgIHNldCBjdXJzb3I6IFswLCA2XVxuICAgICAgZW5zdXJlICcyIFQgYScsIGN1cnNvcjogWzAsIDFdXG5cbiAgICBpdCBcImRvZXNuJ3QgbW92ZSBpZiB0aGUgY2hhcmFjdGVyIHNwZWNpZmllZCBpc24ndCBmb3VuZFwiLCAtPlxuICAgICAgZW5zdXJlICd0IGQnLCBjdXJzb3I6IFswLCAwXVxuXG4gICAgaXQgXCJkb2Vzbid0IG1vdmUgaWYgdGhlcmUgYXJlbid0IHRoZSBzcGVjaWZpZWQgY291bnQgb2YgdGhlIHNwZWNpZmllZCBjaGFyYWN0ZXJcIiwgLT5cbiAgICAgIGVuc3VyZSAnMSAwIHQgZCcsIGN1cnNvcjogWzAsIDBdXG4gICAgICAjIGEgYnVnIHdhcyBtYWtpbmcgdGhpcyBiZWhhdmlvdXIgZGVwZW5kIG9uIHRoZSBjb3VudFxuICAgICAgZW5zdXJlICcxIDEgdCBhJywgY3Vyc29yOiBbMCwgMF1cbiAgICAgICMgYW5kIGJhY2t3YXJkcyBub3dcbiAgICAgIHNldCBjdXJzb3I6IFswLCA2XVxuICAgICAgZW5zdXJlICcxIDAgVCBhJywgY3Vyc29yOiBbMCwgNl1cbiAgICAgIGVuc3VyZSAnMSAxIFQgYScsIGN1cnNvcjogWzAsIDZdXG5cbiAgICBpdCBcImNvbXBvc2VzIHdpdGggZFwiLCAtPlxuICAgICAgc2V0IGN1cnNvcjogWzAsIDNdXG4gICAgICBlbnN1cmUgJ2QgMiB0IGInLFxuICAgICAgICB0ZXh0OiAnYWJjYmNhYmNcXG4nXG5cbiAgICBpdCBcImRlbGV0ZSBjaGFyIHVuZGVyIGN1cnNvciBldmVuIHdoZW4gbm8gbW92ZW1lbnQgaGFwcGVucyBzaW5jZSBpdCdzIGluY2x1c2l2ZSBtb3Rpb25cIiwgLT5cbiAgICAgIHNldCBjdXJzb3I6IFswLCAwXVxuICAgICAgZW5zdXJlICdkIHQgYicsXG4gICAgICAgIHRleHQ6ICdiY2FiY2FiY2FiY1xcbidcbiAgICBpdCBcImRvIG5vdGhpbmcgd2hlbiBpbmNsdXNpdmVuZXNzIGludmVydGVkIGJ5IHYgb3BlcmF0b3ItbW9kaWZpZXJcIiwgLT5cbiAgICAgIHRleHQ6IFwiYWJjYWJjYWJjYWJjXFxuXCJcbiAgICAgIHNldCBjdXJzb3I6IFswLCAwXVxuICAgICAgZW5zdXJlICdkIHYgdCBiJyxcbiAgICAgICAgdGV4dDogJ2FiY2FiY2FiY2FiY1xcbidcblxuICAgIGl0IFwiVCBiZWhhdmVzIGV4Y2x1c2l2ZWx5IHdoZW4gY29tcG9zZXMgd2l0aCBvcGVyYXRvclwiLCAtPlxuICAgICAgc2V0IGN1cnNvcjogWzAsIDNdXG4gICAgICBlbnN1cmUgJ2QgVCBiJyxcbiAgICAgICAgdGV4dDogJ2FiYWJjYWJjYWJjXFxuJ1xuXG4gICAgaXQgXCJUIGRvbid0IGRlbGV0ZSBjaGFyYWN0ZXIgdW5kZXIgY3Vyc29yIGV2ZW4gd2hlbiBubyBtb3ZlbWVudCBoYXBwZW5zXCIsIC0+XG4gICAgICBzZXQgY3Vyc29yOiBbMCwgM11cbiAgICAgIGVuc3VyZSAnZCBUIGMnLFxuICAgICAgICB0ZXh0OiAnYWJjYWJjYWJjYWJjXFxuJ1xuXG4gIGRlc2NyaWJlICd0aGUgOyBhbmQgLCBrZXliaW5kaW5ncycsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2V0XG4gICAgICAgIHRleHQ6IFwiYWJjYWJjYWJjYWJjXFxuXCJcbiAgICAgICAgY3Vyc29yOiBbMCwgMF1cblxuICAgIGl0IFwicmVwZWF0IGYgaW4gc2FtZSBkaXJlY3Rpb25cIiwgLT5cbiAgICAgIGVuc3VyZSAnZiBjJywgY3Vyc29yOiBbMCwgMl1cbiAgICAgIGVuc3VyZSAnOycsIGN1cnNvcjogWzAsIDVdXG4gICAgICBlbnN1cmUgJzsnLCBjdXJzb3I6IFswLCA4XVxuXG4gICAgaXQgXCJyZXBlYXQgRiBpbiBzYW1lIGRpcmVjdGlvblwiLCAtPlxuICAgICAgc2V0IGN1cnNvcjogWzAsIDEwXVxuICAgICAgZW5zdXJlICdGIGMnLCBjdXJzb3I6IFswLCA4XVxuICAgICAgZW5zdXJlICc7JywgY3Vyc29yOiBbMCwgNV1cbiAgICAgIGVuc3VyZSAnOycsIGN1cnNvcjogWzAsIDJdXG5cbiAgICBpdCBcInJlcGVhdCBmIGluIG9wcG9zaXRlIGRpcmVjdGlvblwiLCAtPlxuICAgICAgc2V0IGN1cnNvcjogWzAsIDZdXG4gICAgICBlbnN1cmUgJ2YgYycsIGN1cnNvcjogWzAsIDhdXG4gICAgICBlbnN1cmUgJywnLCBjdXJzb3I6IFswLCA1XVxuICAgICAgZW5zdXJlICcsJywgY3Vyc29yOiBbMCwgMl1cblxuICAgIGl0IFwicmVwZWF0IEYgaW4gb3Bwb3NpdGUgZGlyZWN0aW9uXCIsIC0+XG4gICAgICBzZXQgY3Vyc29yOiBbMCwgNF1cbiAgICAgIGVuc3VyZSAnRiBjJywgY3Vyc29yOiBbMCwgMl1cbiAgICAgIGVuc3VyZSAnLCcsIGN1cnNvcjogWzAsIDVdXG4gICAgICBlbnN1cmUgJywnLCBjdXJzb3I6IFswLCA4XVxuXG4gICAgaXQgXCJhbHRlcm5hdGUgcmVwZWF0IGYgaW4gc2FtZSBkaXJlY3Rpb24gYW5kIHJldmVyc2VcIiwgLT5cbiAgICAgIGVuc3VyZSAnZiBjJywgY3Vyc29yOiBbMCwgMl1cbiAgICAgIGVuc3VyZSAnOycsIGN1cnNvcjogWzAsIDVdXG4gICAgICBlbnN1cmUgJywnLCBjdXJzb3I6IFswLCAyXVxuXG4gICAgaXQgXCJhbHRlcm5hdGUgcmVwZWF0IEYgaW4gc2FtZSBkaXJlY3Rpb24gYW5kIHJldmVyc2VcIiwgLT5cbiAgICAgIHNldCBjdXJzb3I6IFswLCAxMF1cbiAgICAgIGVuc3VyZSAnRiBjJywgY3Vyc29yOiBbMCwgOF1cbiAgICAgIGVuc3VyZSAnOycsIGN1cnNvcjogWzAsIDVdXG4gICAgICBlbnN1cmUgJywnLCBjdXJzb3I6IFswLCA4XVxuXG4gICAgaXQgXCJyZXBlYXQgdCBpbiBzYW1lIGRpcmVjdGlvblwiLCAtPlxuICAgICAgZW5zdXJlICd0IGMnLCBjdXJzb3I6IFswLCAxXVxuICAgICAgZW5zdXJlICc7JywgY3Vyc29yOiBbMCwgNF1cblxuICAgIGl0IFwicmVwZWF0IFQgaW4gc2FtZSBkaXJlY3Rpb25cIiwgLT5cbiAgICAgIHNldCBjdXJzb3I6IFswLCAxMF1cbiAgICAgIGVuc3VyZSAnVCBjJywgY3Vyc29yOiBbMCwgOV1cbiAgICAgIGVuc3VyZSAnOycsIGN1cnNvcjogWzAsIDZdXG5cbiAgICBpdCBcInJlcGVhdCB0IGluIG9wcG9zaXRlIGRpcmVjdGlvbiBmaXJzdCwgYW5kIHRoZW4gcmV2ZXJzZVwiLCAtPlxuICAgICAgc2V0IGN1cnNvcjogWzAsIDNdXG4gICAgICBlbnN1cmUgJ3QgYycsIGN1cnNvcjogWzAsIDRdXG4gICAgICBlbnN1cmUgJywnLCBjdXJzb3I6IFswLCAzXVxuICAgICAgZW5zdXJlICc7JywgY3Vyc29yOiBbMCwgNF1cblxuICAgIGl0IFwicmVwZWF0IFQgaW4gb3Bwb3NpdGUgZGlyZWN0aW9uIGZpcnN0LCBhbmQgdGhlbiByZXZlcnNlXCIsIC0+XG4gICAgICBzZXQgY3Vyc29yOiBbMCwgNF1cbiAgICAgIGVuc3VyZSAnVCBjJywgY3Vyc29yOiBbMCwgM11cbiAgICAgIGVuc3VyZSAnLCcsIGN1cnNvcjogWzAsIDRdXG4gICAgICBlbnN1cmUgJzsnLCBjdXJzb3I6IFswLCAzXVxuXG4gICAgaXQgXCJyZXBlYXQgd2l0aCBjb3VudCBpbiBzYW1lIGRpcmVjdGlvblwiLCAtPlxuICAgICAgc2V0IGN1cnNvcjogWzAsIDBdXG4gICAgICBlbnN1cmUgJ2YgYycsIGN1cnNvcjogWzAsIDJdXG4gICAgICBlbnN1cmUgJzIgOycsIGN1cnNvcjogWzAsIDhdXG5cbiAgICBpdCBcInJlcGVhdCB3aXRoIGNvdW50IGluIHJldmVyc2UgZGlyZWN0aW9uXCIsIC0+XG4gICAgICBzZXQgY3Vyc29yOiBbMCwgNl1cbiAgICAgIGVuc3VyZSAnZiBjJywgY3Vyc29yOiBbMCwgOF1cbiAgICAgIGVuc3VyZSAnMiAsJywgY3Vyc29yOiBbMCwgMl1cblxuICBkZXNjcmliZSBcImxhc3QgZmluZC90aWxsIGlzIHJlcGVhdGFibGUgb24gb3RoZXIgZWRpdG9yXCIsIC0+XG4gICAgW290aGVyLCBvdGhlckVkaXRvciwgcGFuZV0gPSBbXVxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIGdldFZpbVN0YXRlIChvdGhlclZpbVN0YXRlLCBfb3RoZXIpIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHQ6IFwiYSBiYXogYmFyXFxuXCJcbiAgICAgICAgICBjdXJzb3I6IFswLCAwXVxuXG4gICAgICAgIG90aGVyID0gX290aGVyXG4gICAgICAgIG90aGVyLnNldFxuICAgICAgICAgIHRleHQ6IFwiZm9vIGJhciBiYXpcIixcbiAgICAgICAgICBjdXJzb3I6IFswLCAwXVxuICAgICAgICBvdGhlckVkaXRvciA9IG90aGVyVmltU3RhdGUuZWRpdG9yXG4gICAgICAgICMgamFzbWluZS5hdHRhY2hUb0RPTShvdGhlckVkaXRvci5lbGVtZW50KVxuXG4gICAgICAgIHBhbmUgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lKClcbiAgICAgICAgcGFuZS5hY3RpdmF0ZUl0ZW0oZWRpdG9yKVxuXG4gICAgaXQgXCJzaGFyZXMgdGhlIG1vc3QgcmVjZW50IGZpbmQvdGlsbCBjb21tYW5kIHdpdGggb3RoZXIgZWRpdG9yc1wiLCAtPlxuICAgICAgZW5zdXJlICdmIGInLCBjdXJzb3I6IFswLCAyXVxuICAgICAgb3RoZXIuZW5zdXJlIGN1cnNvcjogWzAsIDBdXG5cbiAgICAgICMgcmVwbGF5IHNhbWUgZmluZCBpbiB0aGUgb3RoZXIgZWRpdG9yXG4gICAgICBwYW5lLmFjdGl2YXRlSXRlbShvdGhlckVkaXRvcilcbiAgICAgIG90aGVyLmtleXN0cm9rZSAnOydcbiAgICAgIGVuc3VyZSBjdXJzb3I6IFswLCAyXVxuICAgICAgb3RoZXIuZW5zdXJlIGN1cnNvcjogWzAsIDRdXG5cbiAgICAgICMgZG8gYSB0aWxsIGluIHRoZSBvdGhlciBlZGl0b3JcbiAgICAgIG90aGVyLmtleXN0cm9rZSAndCByJ1xuICAgICAgZW5zdXJlIGN1cnNvcjogWzAsIDJdXG4gICAgICBvdGhlci5lbnN1cmUgY3Vyc29yOiBbMCwgNV1cblxuICAgICAgIyBhbmQgcmVwbGF5IGluIHRoZSBub3JtYWwgZWRpdG9yXG4gICAgICBwYW5lLmFjdGl2YXRlSXRlbShlZGl0b3IpXG4gICAgICBlbnN1cmUgJzsnLCBjdXJzb3I6IFswLCA3XVxuICAgICAgb3RoZXIuZW5zdXJlIGN1cnNvcjogWzAsIDVdXG5cbiAgICBpdCBcImlzIHN0aWxsIHJlcGVhdGFibGUgYWZ0ZXIgb3JpZ2luYWwgZWRpdG9yIHdhcyBkZXN0cm95ZWRcIiwgLT5cbiAgICAgIGVuc3VyZSAnZiBiJywgY3Vyc29yOiBbMCwgMl1cbiAgICAgIG90aGVyLmVuc3VyZSBjdXJzb3I6IFswLCAwXVxuXG4gICAgICBwYW5lLmFjdGl2YXRlSXRlbShvdGhlckVkaXRvcilcbiAgICAgIGVkaXRvci5kZXN0cm95KClcbiAgICAgIGV4cGVjdChlZGl0b3IuaXNBbGl2ZSgpKS50b0JlKGZhbHNlKVxuICAgICAgb3RoZXIuZW5zdXJlICc7JywgY3Vyc29yOiBbMCwgNF1cbiAgICAgIG90aGVyLmVuc3VyZSAnOycsIGN1cnNvcjogWzAsIDhdXG4gICAgICBvdGhlci5lbnN1cmUgJywnLCBjdXJzb3I6IFswLCA0XVxuIl19
