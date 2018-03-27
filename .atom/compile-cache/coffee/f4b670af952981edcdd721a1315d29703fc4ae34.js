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
    xdescribe('the f performance', function() {
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
    describe("last find/till is repeatable on other editor", function() {
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
    return describe("vmp unique feature of `f` family", function() {
      describe("ignoreCaseForFind", function() {
        beforeEach(function() {
          return settings.set("ignoreCaseForFind", true);
        });
        return it("ignore case to find", function() {
          set({
            textC: "|    A    ab    a    Ab    a"
          });
          ensure("f a", {
            textC: "    |A    ab    a    Ab    a"
          });
          ensure(";", {
            textC: "    A    |ab    a    Ab    a"
          });
          ensure(";", {
            textC: "    A    ab    |a    Ab    a"
          });
          return ensure(";", {
            textC: "    A    ab    a    |Ab    a"
          });
        });
      });
      describe("useSmartcaseForFind", function() {
        beforeEach(function() {
          return settings.set("useSmartcaseForFind", true);
        });
        it("ignore case when input is lower char", function() {
          set({
            textC: "|    A    ab    a    Ab    a"
          });
          ensure("f a", {
            textC: "    |A    ab    a    Ab    a"
          });
          ensure(";", {
            textC: "    A    |ab    a    Ab    a"
          });
          ensure(";", {
            textC: "    A    ab    |a    Ab    a"
          });
          return ensure(";", {
            textC: "    A    ab    a    |Ab    a"
          });
        });
        return it("find case-sensitively when input is lager char", function() {
          set({
            textC: "|    A    ab    a    Ab    a"
          });
          ensure("f A", {
            textC: "    |A    ab    a    Ab    a"
          });
          ensure("f A", {
            textC: "    A    ab    a    |Ab    a"
          });
          ensure(",", {
            textC: "    |A    ab    a    Ab    a"
          });
          return ensure(";", {
            textC: "    A    ab    a    |Ab    a"
          });
        });
      });
      describe("reuseFindForRepeatFind", function() {
        beforeEach(function() {
          return settings.set("reuseFindForRepeatFind", true);
        });
        return it("can reuse f and t as ;, F and T as ',' respectively", function() {
          set({
            textC: "|    A    ab    a    Ab    a"
          });
          ensure("f a", {
            textC: "    A    |ab    a    Ab    a"
          });
          ensure("f", {
            textC: "    A    ab    |a    Ab    a"
          });
          ensure("f", {
            textC: "    A    ab    a    Ab    |a"
          });
          ensure("F", {
            textC: "    A    ab    |a    Ab    a"
          });
          ensure("F", {
            textC: "    A    |ab    a    Ab    a"
          });
          ensure("t", {
            textC: "    A    ab   | a    Ab    a"
          });
          ensure("t", {
            textC: "    A    ab    a    Ab   | a"
          });
          ensure("T", {
            textC: "    A    ab    a|    Ab    a"
          });
          return ensure("T", {
            textC: "    A    a|b    a    Ab    a"
          });
        });
      });
      describe("findAcrossLines", function() {
        beforeEach(function() {
          return settings.set("findAcrossLines", true);
        });
        return it("searches across multiple lines", function() {
          set({
            textC: "|0:    a    a\n1:    a    a\n2:    a    a\n"
          });
          ensure("f a", {
            textC: "0:    |a    a\n1:    a    a\n2:    a    a\n"
          });
          ensure(";", {
            textC: "0:    a    |a\n1:    a    a\n2:    a    a\n"
          });
          ensure(";", {
            textC: "0:    a    a\n1:    |a    a\n2:    a    a\n"
          });
          ensure(";", {
            textC: "0:    a    a\n1:    a    |a\n2:    a    a\n"
          });
          ensure(";", {
            textC: "0:    a    a\n1:    a    a\n2:    |a    a\n"
          });
          ensure("F a", {
            textC: "0:    a    a\n1:    a    |a\n2:    a    a\n"
          });
          ensure("t a", {
            textC: "0:    a    a\n1:    a    a\n2:   | a    a\n"
          });
          ensure("T a", {
            textC: "0:    a    a\n1:    a    |a\n2:    a    a\n"
          });
          return ensure("T a", {
            textC: "0:    a    a\n1:    a|    a\n2:    a    a\n"
          });
        });
      });
      return describe("findCharsMax", function() {
        beforeEach(function() {
          return jasmine.attachToDOM(atom.workspace.getElement());
        });
        describe("with 2 length", function() {
          beforeEach(function() {
            return settings.set("findCharsMax", 2);
          });
          return describe("can find one or two char", function() {
            it("can find by two char", function() {
              set({
                textC: "|    a    ab    a    cd    a"
              });
              ensure("f a b", {
                textC: "    a    |ab    a    cd    a"
              });
              return ensure("f c d", {
                textC: "    a    ab    a    |cd    a"
              });
            });
            return it("can find by one-char by confirming explicitly", function() {
              set({
                textC: "|    a    ab    a    cd    a"
              });
              ensure("f a enter", {
                textC: "    |a    ab    a    cd    a"
              });
              return ensure("f c enter", {
                textC: "    a    ab    a    |cd    a"
              });
            });
          });
        });
        describe("with 3 length", function() {
          beforeEach(function() {
            return settings.set("findCharsMax", 3);
          });
          return describe("can find 3 at maximum", function() {
            return it("can find by one or two or three char", function() {
              set({
                textC: "|    a    ab    a    cd    efg"
              });
              ensure("f a b enter", {
                textC: "    a    |ab    a    cd    efg"
              });
              ensure("f a enter", {
                textC: "    a    ab    |a    cd    efg"
              });
              ensure("f c d enter", {
                textC: "    a    ab    a    |cd    efg"
              });
              return ensure("f e f g", {
                textC: "    a    ab    a    cd    |efg"
              });
            });
          });
        });
        return describe("autoConfirmTimeout", function() {
          beforeEach(function() {
            settings.set("findCharsMax", 2);
            return settings.set("findConfirmByTimeout", 500);
          });
          return it("auto-confirm single-char input on timeout", function() {
            set({
              textC: "|    a    ab    a    cd    a"
            });
            ensure("f a", {
              textC: "|    a    ab    a    cd    a"
            });
            advanceClock(500);
            ensure({
              textC: "    |a    ab    a    cd    a"
            });
            ensure("f c d", {
              textC: "    a    ab    a    |cd    a"
            });
            ensure("f a", {
              textC: "    a    ab    a    |cd    a"
            });
            advanceClock(500);
            ensure({
              textC: "    a    ab    a    cd    |a"
            });
            ensure("F b", {
              textC: "    a    ab    a    cd    |a"
            });
            advanceClock(500);
            return ensure({
              textC: "    a    a|b    a    cd    a"
            });
          });
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9zcGVjL21vdGlvbi1maW5kLXNwZWMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxNQUFvQyxPQUFBLENBQVEsZUFBUixDQUFwQyxFQUFDLDZCQUFELEVBQWMsdUJBQWQsRUFBd0I7O0VBQ3hCLFFBQUEsR0FBVyxPQUFBLENBQVEsaUJBQVI7O0VBRVgsUUFBQSxDQUFTLGFBQVQsRUFBd0IsU0FBQTtBQUN0QixRQUFBO0lBQUEsT0FBNEQsRUFBNUQsRUFBQyxhQUFELEVBQU0sZ0JBQU4sRUFBYyxtQkFBZCxFQUF5QixnQkFBekIsRUFBaUMsdUJBQWpDLEVBQWdEO0lBRWhELFVBQUEsQ0FBVyxTQUFBO01BQ1QsUUFBUSxDQUFDLEdBQVQsQ0FBYSw0QkFBYixFQUEyQyxJQUEzQzthQUdBLFdBQUEsQ0FBWSxTQUFDLEtBQUQsRUFBUSxJQUFSO1FBQ1YsUUFBQSxHQUFXO1FBQ1Ysd0JBQUQsRUFBUztlQUNSLGNBQUQsRUFBTSxvQkFBTixFQUFjLDBCQUFkLEVBQTJCO01BSGpCLENBQVo7SUFKUyxDQUFYO0lBU0EsU0FBQSxDQUFVLG1CQUFWLEVBQStCLFNBQUE7QUFDN0IsVUFBQTtNQUFBLGNBQUEsR0FBaUI7TUFFakIsa0JBQUEsR0FBcUIsU0FBQyxFQUFEO1FBQ25CLE9BQU8sQ0FBQyxJQUFSLENBQWEsRUFBRSxDQUFDLElBQWhCO1FBQ0EsRUFBQSxDQUFBO2VBRUEsT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsRUFBRSxDQUFDLElBQW5CO01BSm1CO01BTXJCLHlCQUFBLEdBQTRCLFNBQUMsRUFBRDtBQUMxQixZQUFBO1FBQUEsRUFBQSxHQUFLLFdBQVcsQ0FBQyxHQUFaLENBQUE7UUFDTCxFQUFBLENBQUE7UUFDQSxFQUFBLEdBQUssV0FBVyxDQUFDLEdBQVosQ0FBQTtlQUNMLE9BQU8sQ0FB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LEdBQWI7WUFDQSxNQUFBLENBQWdCO2NBQUEsS0FBQSxFQUFPLDhCQUFQO2FBQWhCO1lBRUEsTUFBQSxDQUFPLE9BQVAsRUFBZ0I7Y0FBQSxLQUFBLEVBQU8sOEJBQVA7YUFBaEI7WUFFQSxNQUFBLENBQU8sS0FBUCxFQUFnQjtjQUFBLEtBQUEsRUFBTyw4QkFBUDthQUFoQjtZQUNBLFlBQUEsQ0FBYSxHQUFiO1lBQ0EsTUFBQSxDQUFnQjtjQUFBLEtBQUEsRUFBTyw4QkFBUDthQUFoQjtZQUVBLE1BQUEsQ0FBTyxLQUFQLEVBQWdCO2NBQUEsS0FBQSxFQUFPLDhCQUFQO2FBQWhCO1lBQ0EsWUFBQSxDQUFhLEdBQWI7bUJBQ0EsTUFBQSxDQUFnQjtjQUFBLEtBQUEsRUFBTyw4QkFBUDthQUFoQjtVQWY4QyxDQUFoRDtRQUw2QixDQUEvQjtNQWhDdUIsQ0FBekI7SUE5RDJDLENBQTdDO0VBL1JzQixDQUF4QjtBQUhBIiwic291cmNlc0NvbnRlbnQiOlsie2dldFZpbVN0YXRlLCBkaXNwYXRjaCwgVGV4dERhdGF9ID0gcmVxdWlyZSAnLi9zcGVjLWhlbHBlcidcbnNldHRpbmdzID0gcmVxdWlyZSAnLi4vbGliL3NldHRpbmdzJ1xuXG5kZXNjcmliZSBcIk1vdGlvbiBGaW5kXCIsIC0+XG4gIFtzZXQsIGVuc3VyZSwga2V5c3Ryb2tlLCBlZGl0b3IsIGVkaXRvckVsZW1lbnQsIHZpbVN0YXRlXSA9IFtdXG5cbiAgYmVmb3JlRWFjaCAtPlxuICAgIHNldHRpbmdzLnNldCgndXNlRXhwZXJpbWVudGFsRmFzdGVySW5wdXQnLCB0cnVlKVxuICAgICMgamFzbWluZS5hdHRhY2hUb0RPTShhdG9tLndvcmtzcGFjZS5nZXRFbGVtZW50KCkpXG5cbiAgICBnZXRWaW1TdGF0ZSAoc3RhdGUsIF92aW0pIC0+XG4gICAgICB2aW1TdGF0ZSA9IHN0YXRlICMgdG8gcmVmZXIgYXMgdmltU3RhdGUgbGF0ZXIuXG4gICAgICB7ZWRpdG9yLCBlZGl0b3JFbGVtZW50fSA9IHZpbVN0YXRlXG4gICAgICB7c2V0LCBlbnN1cmUsIGtleXN0cm9rZX0gPSBfdmltXG5cbiAgeGRlc2NyaWJlICd0aGUgZiBwZXJmb3JtYW5jZScsIC0+XG4gICAgdGltZXNUb0V4ZWN1dGUgPSA1MDBcbiAgICAjIHRpbWVzVG9FeGVjdXRlID0gMVxuICAgIG1lYXN1cmVXaXRoVGltZUVuZCA9IChmbikgLT5cbiAgICAgIGNvbnNvbGUudGltZShmbi5uYW1lKVxuICAgICAgZm4oKVxuICAgICAgIyBjb25zb2xlLmxvZyBcIlt0aW1lLWVuZF1cIlxuICAgICAgY29uc29sZS50aW1lRW5kKGZuLm5hbWUpXG5cbiAgICBtZWFzdXJlV2l0aFBlcmZvcm1hbmNlTm93ID0gKGZuKSAtPlxuICAgICAgdDAgPSBwZXJmb3JtYW5jZS5ub3coKVxuICAgICAgZm4oKVxuICAgICAgdDEgPSBwZXJmb3JtYW5jZS5ub3coKVxuICAgICAgY29uc29sZS5sb2cgXCJbcGVyZm9ybWFuY2Uubm93XSB0b29rICN7dDEgLSB0MH0gbXNlY1wiXG5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXRcbiAgICAgICAgdGV4dDogXCIgIFwiICsgXCJsXCIucmVwZWF0KHRpbWVzVG9FeGVjdXRlKVxuICAgICAgICBjdXJzb3I6IFswLCAwXVxuXG4gICAgeGRlc2NyaWJlICd0aGUgZiByZWFkLWNoYXItdmlhLWtleWJpbmRpbmcgcGVyZm9ybWFuY2UnLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICB2aW1TdGF0ZS51c2VNaW5pRWRpdG9yID0gZmFsc2VcblxuICAgICAgaXQgJ1t3aXRoIGtleWJpbmRdIG1vdmVzIHRvIGwgY2hhcicsIC0+XG4gICAgICAgIHRlc3RQZXJmb3JtYW5jZU9mS2V5YmluZCA9IC0+XG4gICAgICAgICAga2V5c3Ryb2tlIFwiZiBsXCIgZm9yIG4gaW4gWzEuLnRpbWVzVG9FeGVjdXRlXVxuICAgICAgICAgIGVuc3VyZSBjdXJzb3I6IFswLCB0aW1lc1RvRXhlY3V0ZSArIDFdXG5cbiAgICAgICAgY29uc29sZS5sb2cgXCI9PSBrZXliaW5kXCJcbiAgICAgICAgZW5zdXJlIFwiZiBsXCIsIGN1cnNvcjogWzAsIDJdXG4gICAgICAgIHNldCBjdXJzb3I6IFswLCAwXVxuICAgICAgICBtZWFzdXJlV2l0aFRpbWVFbmQodGVzdFBlcmZvcm1hbmNlT2ZLZXliaW5kKVxuICAgICAgICAjIHNldCBjdXJzb3I6IFswLCAwXVxuICAgICAgICAjIG1lYXN1cmVXaXRoUGVyZm9ybWFuY2VOb3codGVzdFBlcmZvcm1hbmNlT2ZLZXliaW5kKVxuXG4gICAgZGVzY3JpYmUgJ1t3aXRoIGhpZGRlbi1pbnB1dF0gbW92ZXMgdG8gbCBjaGFyJywgLT5cbiAgICAgIGl0ICdbd2l0aCBoaWRkZW4taW5wdXRdIG1vdmVzIHRvIGwgY2hhcicsIC0+XG4gICAgICAgIHRlc3RQZXJmb3JtYW5jZU9mSGlkZGVuSW5wdXQgPSAtPlxuICAgICAgICAgIGtleXN0cm9rZSAnZiBsJyBmb3IgbiBpbiBbMS4udGltZXNUb0V4ZWN1dGVdXG4gICAgICAgICAgZW5zdXJlIGN1cnNvcjogWzAsIHRpbWVzVG9FeGVjdXRlICsgMV1cblxuICAgICAgICBjb25zb2xlLmxvZyBcIj09IGhpZGRlblwiXG4gICAgICAgIGVuc3VyZSAnZiBsJywgY3Vyc29yOiBbMCwgMl1cblxuICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgbWVhc3VyZVdpdGhUaW1lRW5kKHRlc3RQZXJmb3JtYW5jZU9mSGlkZGVuSW5wdXQpXG4gICAgICAgICMgc2V0IGN1cnNvcjogWzAsIDBdXG4gICAgICAgICMgbWVhc3VyZVdpdGhQZXJmb3JtYW5jZU5vdyh0ZXN0UGVyZm9ybWFuY2VPZkhpZGRlbklucHV0KVxuXG4gIGRlc2NyaWJlICd0aGUgZi9GIGtleWJpbmRpbmdzJywgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXRcbiAgICAgICAgdGV4dDogXCJhYmNhYmNhYmNhYmNcXG5cIlxuICAgICAgICBjdXJzb3I6IFswLCAwXVxuXG4gICAgaXQgJ21vdmVzIHRvIHRoZSBmaXJzdCBzcGVjaWZpZWQgY2hhcmFjdGVyIGl0IGZpbmRzJywgLT5cbiAgICAgIGVuc3VyZSAnZiBjJywgY3Vyc29yOiBbMCwgMl1cblxuICAgIGl0ICdleHRlbmRzIHZpc3VhbCBzZWxlY3Rpb24gaW4gdmlzdWFsLW1vZGUgYW5kIHJlcGV0YWJsZScsIC0+XG4gICAgICBlbnN1cmUgJ3YnLCBtb2RlOiBbJ3Zpc3VhbCcsICdjaGFyYWN0ZXJ3aXNlJ11cbiAgICAgIGVuc3VyZSAnZiBjJywgc2VsZWN0ZWRUZXh0OiAnYWJjJywgY3Vyc29yOiBbMCwgM11cbiAgICAgIGVuc3VyZSAnOycsIHNlbGVjdGVkVGV4dDogJ2FiY2FiYycsIGN1cnNvcjogWzAsIDZdXG4gICAgICBlbnN1cmUgJywnLCBzZWxlY3RlZFRleHQ6ICdhYmMnLCBjdXJzb3I6IFswLCAzXVxuXG4gICAgaXQgJ21vdmVzIGJhY2t3YXJkcyB0byB0aGUgZmlyc3Qgc3BlY2lmaWVkIGNoYXJhY3RlciBpdCBmaW5kcycsIC0+XG4gICAgICBzZXQgY3Vyc29yOiBbMCwgMl1cbiAgICAgIGVuc3VyZSAnRiBhJywgY3Vyc29yOiBbMCwgMF1cblxuICAgIGl0ICdyZXNwZWN0cyBjb3VudCBmb3J3YXJkJywgLT5cbiAgICAgIGVuc3VyZSAnMiBmIGEnLCBjdXJzb3I6IFswLCA2XVxuXG4gICAgaXQgJ3Jlc3BlY3RzIGNvdW50IGJhY2t3YXJkJywgLT5cbiAgICAgIGN1cnNvcjogWzAsIDZdXG4gICAgICBlbnN1cmUgJzIgRiBhJywgY3Vyc29yOiBbMCwgMF1cblxuICAgIGl0IFwiZG9lc24ndCBtb3ZlIGlmIHRoZSBjaGFyYWN0ZXIgc3BlY2lmaWVkIGlzbid0IGZvdW5kXCIsIC0+XG4gICAgICBlbnN1cmUgJ2YgZCcsIGN1cnNvcjogWzAsIDBdXG5cbiAgICBpdCBcImRvZXNuJ3QgbW92ZSBpZiB0aGVyZSBhcmVuJ3QgdGhlIHNwZWNpZmllZCBjb3VudCBvZiB0aGUgc3BlY2lmaWVkIGNoYXJhY3RlclwiLCAtPlxuICAgICAgZW5zdXJlICcxIDAgZiBhJywgY3Vyc29yOiBbMCwgMF1cbiAgICAgICMgYSBidWcgd2FzIG1ha2luZyB0aGlzIGJlaGF2aW91ciBkZXBlbmQgb24gdGhlIGNvdW50XG4gICAgICBlbnN1cmUgJzEgMSBmIGEnLCBjdXJzb3I6IFswLCAwXVxuICAgICAgIyBhbmQgYmFja3dhcmRzIG5vd1xuICAgICAgc2V0IGN1cnNvcjogWzAsIDZdXG4gICAgICBlbnN1cmUgJzEgMCBGIGEnLCBjdXJzb3I6IFswLCA2XVxuICAgICAgZW5zdXJlICcxIDEgRiBhJywgY3Vyc29yOiBbMCwgNl1cblxuICAgIGl0IFwiY29tcG9zZXMgd2l0aCBkXCIsIC0+XG4gICAgICBzZXQgY3Vyc29yOiBbMCwgM11cbiAgICAgIGVuc3VyZSAnZCAyIGYgYScsIHRleHQ6ICdhYmNiY1xcbidcblxuICAgIGl0IFwiRiBiZWhhdmVzIGV4Y2x1c2l2ZWx5IHdoZW4gY29tcG9zZXMgd2l0aCBvcGVyYXRvclwiLCAtPlxuICAgICAgc2V0IGN1cnNvcjogWzAsIDNdXG4gICAgICBlbnN1cmUgJ2QgRiBhJywgdGV4dDogJ2FiY2FiY2FiY1xcbidcblxuICBkZXNjcmliZSAndGhlIHQvVCBrZXliaW5kaW5ncycsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2V0XG4gICAgICAgIHRleHQ6IFwiYWJjYWJjYWJjYWJjXFxuXCJcbiAgICAgICAgY3Vyc29yOiBbMCwgMF1cblxuICAgIGl0ICdtb3ZlcyB0byB0aGUgY2hhcmFjdGVyIHByZXZpb3VzIHRvIHRoZSBmaXJzdCBzcGVjaWZpZWQgY2hhcmFjdGVyIGl0IGZpbmRzJywgLT5cbiAgICAgIGVuc3VyZSAndCBhJywgY3Vyc29yOiBbMCwgMl1cbiAgICAgICMgb3Igc3RheXMgcHV0IHdoZW4gaXQncyBhbHJlYWR5IHRoZXJlXG4gICAgICBlbnN1cmUgJ3QgYScsIGN1cnNvcjogWzAsIDJdXG5cbiAgICBpdCAnbW92ZXMgYmFja3dhcmRzIHRvIHRoZSBjaGFyYWN0ZXIgYWZ0ZXIgdGhlIGZpcnN0IHNwZWNpZmllZCBjaGFyYWN0ZXIgaXQgZmluZHMnLCAtPlxuICAgICAgc2V0IGN1cnNvcjogWzAsIDJdXG4gICAgICBlbnN1cmUgJ1QgYScsIGN1cnNvcjogWzAsIDFdXG5cbiAgICBpdCAncmVzcGVjdHMgY291bnQgZm9yd2FyZCcsIC0+XG4gICAgICBlbnN1cmUgJzIgdCBhJywgY3Vyc29yOiBbMCwgNV1cblxuICAgIGl0ICdyZXNwZWN0cyBjb3VudCBiYWNrd2FyZCcsIC0+XG4gICAgICBzZXQgY3Vyc29yOiBbMCwgNl1cbiAgICAgIGVuc3VyZSAnMiBUIGEnLCBjdXJzb3I6IFswLCAxXVxuXG4gICAgaXQgXCJkb2Vzbid0IG1vdmUgaWYgdGhlIGNoYXJhY3RlciBzcGVjaWZpZWQgaXNuJ3QgZm91bmRcIiwgLT5cbiAgICAgIGVuc3VyZSAndCBkJywgY3Vyc29yOiBbMCwgMF1cblxuICAgIGl0IFwiZG9lc24ndCBtb3ZlIGlmIHRoZXJlIGFyZW4ndCB0aGUgc3BlY2lmaWVkIGNvdW50IG9mIHRoZSBzcGVjaWZpZWQgY2hhcmFjdGVyXCIsIC0+XG4gICAgICBlbnN1cmUgJzEgMCB0IGQnLCBjdXJzb3I6IFswLCAwXVxuICAgICAgIyBhIGJ1ZyB3YXMgbWFraW5nIHRoaXMgYmVoYXZpb3VyIGRlcGVuZCBvbiB0aGUgY291bnRcbiAgICAgIGVuc3VyZSAnMSAxIHQgYScsIGN1cnNvcjogWzAsIDBdXG4gICAgICAjIGFuZCBiYWNrd2FyZHMgbm93XG4gICAgICBzZXQgY3Vyc29yOiBbMCwgNl1cbiAgICAgIGVuc3VyZSAnMSAwIFQgYScsIGN1cnNvcjogWzAsIDZdXG4gICAgICBlbnN1cmUgJzEgMSBUIGEnLCBjdXJzb3I6IFswLCA2XVxuXG4gICAgaXQgXCJjb21wb3NlcyB3aXRoIGRcIiwgLT5cbiAgICAgIHNldCBjdXJzb3I6IFswLCAzXVxuICAgICAgZW5zdXJlICdkIDIgdCBiJyxcbiAgICAgICAgdGV4dDogJ2FiY2JjYWJjXFxuJ1xuXG4gICAgaXQgXCJkZWxldGUgY2hhciB1bmRlciBjdXJzb3IgZXZlbiB3aGVuIG5vIG1vdmVtZW50IGhhcHBlbnMgc2luY2UgaXQncyBpbmNsdXNpdmUgbW90aW9uXCIsIC0+XG4gICAgICBzZXQgY3Vyc29yOiBbMCwgMF1cbiAgICAgIGVuc3VyZSAnZCB0IGInLFxuICAgICAgICB0ZXh0OiAnYmNhYmNhYmNhYmNcXG4nXG4gICAgaXQgXCJkbyBub3RoaW5nIHdoZW4gaW5jbHVzaXZlbmVzcyBpbnZlcnRlZCBieSB2IG9wZXJhdG9yLW1vZGlmaWVyXCIsIC0+XG4gICAgICB0ZXh0OiBcImFiY2FiY2FiY2FiY1xcblwiXG4gICAgICBzZXQgY3Vyc29yOiBbMCwgMF1cbiAgICAgIGVuc3VyZSAnZCB2IHQgYicsXG4gICAgICAgIHRleHQ6ICdhYmNhYmNhYmNhYmNcXG4nXG5cbiAgICBpdCBcIlQgYmVoYXZlcyBleGNsdXNpdmVseSB3aGVuIGNvbXBvc2VzIHdpdGggb3BlcmF0b3JcIiwgLT5cbiAgICAgIHNldCBjdXJzb3I6IFswLCAzXVxuICAgICAgZW5zdXJlICdkIFQgYicsXG4gICAgICAgIHRleHQ6ICdhYmFiY2FiY2FiY1xcbidcblxuICAgIGl0IFwiVCBkb24ndCBkZWxldGUgY2hhcmFjdGVyIHVuZGVyIGN1cnNvciBldmVuIHdoZW4gbm8gbW92ZW1lbnQgaGFwcGVuc1wiLCAtPlxuICAgICAgc2V0IGN1cnNvcjogWzAsIDNdXG4gICAgICBlbnN1cmUgJ2QgVCBjJyxcbiAgICAgICAgdGV4dDogJ2FiY2FiY2FiY2FiY1xcbidcblxuICBkZXNjcmliZSAndGhlIDsgYW5kICwga2V5YmluZGluZ3MnLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNldFxuICAgICAgICB0ZXh0OiBcImFiY2FiY2FiY2FiY1xcblwiXG4gICAgICAgIGN1cnNvcjogWzAsIDBdXG5cbiAgICBpdCBcInJlcGVhdCBmIGluIHNhbWUgZGlyZWN0aW9uXCIsIC0+XG4gICAgICBlbnN1cmUgJ2YgYycsIGN1cnNvcjogWzAsIDJdXG4gICAgICBlbnN1cmUgJzsnLCBjdXJzb3I6IFswLCA1XVxuICAgICAgZW5zdXJlICc7JywgY3Vyc29yOiBbMCwgOF1cblxuICAgIGl0IFwicmVwZWF0IEYgaW4gc2FtZSBkaXJlY3Rpb25cIiwgLT5cbiAgICAgIHNldCBjdXJzb3I6IFswLCAxMF1cbiAgICAgIGVuc3VyZSAnRiBjJywgY3Vyc29yOiBbMCwgOF1cbiAgICAgIGVuc3VyZSAnOycsIGN1cnNvcjogWzAsIDVdXG4gICAgICBlbnN1cmUgJzsnLCBjdXJzb3I6IFswLCAyXVxuXG4gICAgaXQgXCJyZXBlYXQgZiBpbiBvcHBvc2l0ZSBkaXJlY3Rpb25cIiwgLT5cbiAgICAgIHNldCBjdXJzb3I6IFswLCA2XVxuICAgICAgZW5zdXJlICdmIGMnLCBjdXJzb3I6IFswLCA4XVxuICAgICAgZW5zdXJlICcsJywgY3Vyc29yOiBbMCwgNV1cbiAgICAgIGVuc3VyZSAnLCcsIGN1cnNvcjogWzAsIDJdXG5cbiAgICBpdCBcInJlcGVhdCBGIGluIG9wcG9zaXRlIGRpcmVjdGlvblwiLCAtPlxuICAgICAgc2V0IGN1cnNvcjogWzAsIDRdXG4gICAgICBlbnN1cmUgJ0YgYycsIGN1cnNvcjogWzAsIDJdXG4gICAgICBlbnN1cmUgJywnLCBjdXJzb3I6IFswLCA1XVxuICAgICAgZW5zdXJlICcsJywgY3Vyc29yOiBbMCwgOF1cblxuICAgIGl0IFwiYWx0ZXJuYXRlIHJlcGVhdCBmIGluIHNhbWUgZGlyZWN0aW9uIGFuZCByZXZlcnNlXCIsIC0+XG4gICAgICBlbnN1cmUgJ2YgYycsIGN1cnNvcjogWzAsIDJdXG4gICAgICBlbnN1cmUgJzsnLCBjdXJzb3I6IFswLCA1XVxuICAgICAgZW5zdXJlICcsJywgY3Vyc29yOiBbMCwgMl1cblxuICAgIGl0IFwiYWx0ZXJuYXRlIHJlcGVhdCBGIGluIHNhbWUgZGlyZWN0aW9uIGFuZCByZXZlcnNlXCIsIC0+XG4gICAgICBzZXQgY3Vyc29yOiBbMCwgMTBdXG4gICAgICBlbnN1cmUgJ0YgYycsIGN1cnNvcjogWzAsIDhdXG4gICAgICBlbnN1cmUgJzsnLCBjdXJzb3I6IFswLCA1XVxuICAgICAgZW5zdXJlICcsJywgY3Vyc29yOiBbMCwgOF1cblxuICAgIGl0IFwicmVwZWF0IHQgaW4gc2FtZSBkaXJlY3Rpb25cIiwgLT5cbiAgICAgIGVuc3VyZSAndCBjJywgY3Vyc29yOiBbMCwgMV1cbiAgICAgIGVuc3VyZSAnOycsIGN1cnNvcjogWzAsIDRdXG5cbiAgICBpdCBcInJlcGVhdCBUIGluIHNhbWUgZGlyZWN0aW9uXCIsIC0+XG4gICAgICBzZXQgY3Vyc29yOiBbMCwgMTBdXG4gICAgICBlbnN1cmUgJ1QgYycsIGN1cnNvcjogWzAsIDldXG4gICAgICBlbnN1cmUgJzsnLCBjdXJzb3I6IFswLCA2XVxuXG4gICAgaXQgXCJyZXBlYXQgdCBpbiBvcHBvc2l0ZSBkaXJlY3Rpb24gZmlyc3QsIGFuZCB0aGVuIHJldmVyc2VcIiwgLT5cbiAgICAgIHNldCBjdXJzb3I6IFswLCAzXVxuICAgICAgZW5zdXJlICd0IGMnLCBjdXJzb3I6IFswLCA0XVxuICAgICAgZW5zdXJlICcsJywgY3Vyc29yOiBbMCwgM11cbiAgICAgIGVuc3VyZSAnOycsIGN1cnNvcjogWzAsIDRdXG5cbiAgICBpdCBcInJlcGVhdCBUIGluIG9wcG9zaXRlIGRpcmVjdGlvbiBmaXJzdCwgYW5kIHRoZW4gcmV2ZXJzZVwiLCAtPlxuICAgICAgc2V0IGN1cnNvcjogWzAsIDRdXG4gICAgICBlbnN1cmUgJ1QgYycsIGN1cnNvcjogWzAsIDNdXG4gICAgICBlbnN1cmUgJywnLCBjdXJzb3I6IFswLCA0XVxuICAgICAgZW5zdXJlICc7JywgY3Vyc29yOiBbMCwgM11cblxuICAgIGl0IFwicmVwZWF0IHdpdGggY291bnQgaW4gc2FtZSBkaXJlY3Rpb25cIiwgLT5cbiAgICAgIHNldCBjdXJzb3I6IFswLCAwXVxuICAgICAgZW5zdXJlICdmIGMnLCBjdXJzb3I6IFswLCAyXVxuICAgICAgZW5zdXJlICcyIDsnLCBjdXJzb3I6IFswLCA4XVxuXG4gICAgaXQgXCJyZXBlYXQgd2l0aCBjb3VudCBpbiByZXZlcnNlIGRpcmVjdGlvblwiLCAtPlxuICAgICAgc2V0IGN1cnNvcjogWzAsIDZdXG4gICAgICBlbnN1cmUgJ2YgYycsIGN1cnNvcjogWzAsIDhdXG4gICAgICBlbnN1cmUgJzIgLCcsIGN1cnNvcjogWzAsIDJdXG5cbiAgZGVzY3JpYmUgXCJsYXN0IGZpbmQvdGlsbCBpcyByZXBlYXRhYmxlIG9uIG90aGVyIGVkaXRvclwiLCAtPlxuICAgIFtvdGhlciwgb3RoZXJFZGl0b3IsIHBhbmVdID0gW11cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBnZXRWaW1TdGF0ZSAob3RoZXJWaW1TdGF0ZSwgX290aGVyKSAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0OiBcImEgYmF6IGJhclxcblwiXG4gICAgICAgICAgY3Vyc29yOiBbMCwgMF1cblxuICAgICAgICBvdGhlciA9IF9vdGhlclxuICAgICAgICBvdGhlci5zZXRcbiAgICAgICAgICB0ZXh0OiBcImZvbyBiYXIgYmF6XCIsXG4gICAgICAgICAgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgb3RoZXJFZGl0b3IgPSBvdGhlclZpbVN0YXRlLmVkaXRvclxuICAgICAgICAjIGphc21pbmUuYXR0YWNoVG9ET00ob3RoZXJFZGl0b3IuZWxlbWVudClcblxuICAgICAgICBwYW5lID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZSgpXG4gICAgICAgIHBhbmUuYWN0aXZhdGVJdGVtKGVkaXRvcilcblxuICAgIGl0IFwic2hhcmVzIHRoZSBtb3N0IHJlY2VudCBmaW5kL3RpbGwgY29tbWFuZCB3aXRoIG90aGVyIGVkaXRvcnNcIiwgLT5cbiAgICAgIGVuc3VyZSAnZiBiJywgY3Vyc29yOiBbMCwgMl1cbiAgICAgIG90aGVyLmVuc3VyZSBjdXJzb3I6IFswLCAwXVxuXG4gICAgICAjIHJlcGxheSBzYW1lIGZpbmQgaW4gdGhlIG90aGVyIGVkaXRvclxuICAgICAgcGFuZS5hY3RpdmF0ZUl0ZW0ob3RoZXJFZGl0b3IpXG4gICAgICBvdGhlci5rZXlzdHJva2UgJzsnXG4gICAgICBlbnN1cmUgY3Vyc29yOiBbMCwgMl1cbiAgICAgIG90aGVyLmVuc3VyZSBjdXJzb3I6IFswLCA0XVxuXG4gICAgICAjIGRvIGEgdGlsbCBpbiB0aGUgb3RoZXIgZWRpdG9yXG4gICAgICBvdGhlci5rZXlzdHJva2UgJ3QgcidcbiAgICAgIGVuc3VyZSBjdXJzb3I6IFswLCAyXVxuICAgICAgb3RoZXIuZW5zdXJlIGN1cnNvcjogWzAsIDVdXG5cbiAgICAgICMgYW5kIHJlcGxheSBpbiB0aGUgbm9ybWFsIGVkaXRvclxuICAgICAgcGFuZS5hY3RpdmF0ZUl0ZW0oZWRpdG9yKVxuICAgICAgZW5zdXJlICc7JywgY3Vyc29yOiBbMCwgN11cbiAgICAgIG90aGVyLmVuc3VyZSBjdXJzb3I6IFswLCA1XVxuXG4gICAgaXQgXCJpcyBzdGlsbCByZXBlYXRhYmxlIGFmdGVyIG9yaWdpbmFsIGVkaXRvciB3YXMgZGVzdHJveWVkXCIsIC0+XG4gICAgICBlbnN1cmUgJ2YgYicsIGN1cnNvcjogWzAsIDJdXG4gICAgICBvdGhlci5lbnN1cmUgY3Vyc29yOiBbMCwgMF1cblxuICAgICAgcGFuZS5hY3RpdmF0ZUl0ZW0ob3RoZXJFZGl0b3IpXG4gICAgICBlZGl0b3IuZGVzdHJveSgpXG4gICAgICBleHBlY3QoZWRpdG9yLmlzQWxpdmUoKSkudG9CZShmYWxzZSlcbiAgICAgIG90aGVyLmVuc3VyZSAnOycsIGN1cnNvcjogWzAsIDRdXG4gICAgICBvdGhlci5lbnN1cmUgJzsnLCBjdXJzb3I6IFswLCA4XVxuICAgICAgb3RoZXIuZW5zdXJlICcsJywgY3Vyc29yOiBbMCwgNF1cblxuICBkZXNjcmliZSBcInZtcCB1bmlxdWUgZmVhdHVyZSBvZiBgZmAgZmFtaWx5XCIsIC0+XG4gICAgZGVzY3JpYmUgXCJpZ25vcmVDYXNlRm9yRmluZFwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXR0aW5ncy5zZXQoXCJpZ25vcmVDYXNlRm9yRmluZFwiLCB0cnVlKVxuXG4gICAgICBpdCBcImlnbm9yZSBjYXNlIHRvIGZpbmRcIiwgLT5cbiAgICAgICAgc2V0IHRleHRDOiBcInwgICAgQSAgICBhYiAgICBhICAgIEFiICAgIGFcIlxuICAgICAgICBlbnN1cmUgXCJmIGFcIiwgdGV4dEM6IFwiICAgIHxBICAgIGFiICAgIGEgICAgQWIgICAgYVwiXG4gICAgICAgIGVuc3VyZSBcIjtcIiwgICB0ZXh0QzogXCIgICAgQSAgICB8YWIgICAgYSAgICBBYiAgICBhXCJcbiAgICAgICAgZW5zdXJlIFwiO1wiLCAgIHRleHRDOiBcIiAgICBBICAgIGFiICAgIHxhICAgIEFiICAgIGFcIlxuICAgICAgICBlbnN1cmUgXCI7XCIsICAgdGV4dEM6IFwiICAgIEEgICAgYWIgICAgYSAgICB8QWIgICAgYVwiXG5cbiAgICBkZXNjcmliZSBcInVzZVNtYXJ0Y2FzZUZvckZpbmRcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0dGluZ3Muc2V0KFwidXNlU21hcnRjYXNlRm9yRmluZFwiLCB0cnVlKVxuXG4gICAgICBpdCBcImlnbm9yZSBjYXNlIHdoZW4gaW5wdXQgaXMgbG93ZXIgY2hhclwiLCAtPlxuICAgICAgICBzZXQgdGV4dEM6IFwifCAgICBBICAgIGFiICAgIGEgICAgQWIgICAgYVwiXG4gICAgICAgIGVuc3VyZSBcImYgYVwiLCB0ZXh0QzogXCIgICAgfEEgICAgYWIgICAgYSAgICBBYiAgICBhXCJcbiAgICAgICAgZW5zdXJlIFwiO1wiLCAgIHRleHRDOiBcIiAgICBBICAgIHxhYiAgICBhICAgIEFiICAgIGFcIlxuICAgICAgICBlbnN1cmUgXCI7XCIsICAgdGV4dEM6IFwiICAgIEEgICAgYWIgICAgfGEgICAgQWIgICAgYVwiXG4gICAgICAgIGVuc3VyZSBcIjtcIiwgICB0ZXh0QzogXCIgICAgQSAgICBhYiAgICBhICAgIHxBYiAgICBhXCJcblxuICAgICAgaXQgXCJmaW5kIGNhc2Utc2Vuc2l0aXZlbHkgd2hlbiBpbnB1dCBpcyBsYWdlciBjaGFyXCIsIC0+XG4gICAgICAgIHNldCB0ZXh0QzogXCJ8ICAgIEEgICAgYWIgICAgYSAgICBBYiAgICBhXCJcbiAgICAgICAgZW5zdXJlIFwiZiBBXCIsIHRleHRDOiBcIiAgICB8QSAgICBhYiAgICBhICAgIEFiICAgIGFcIlxuICAgICAgICBlbnN1cmUgXCJmIEFcIiwgdGV4dEM6IFwiICAgIEEgICAgYWIgICAgYSAgICB8QWIgICAgYVwiXG4gICAgICAgIGVuc3VyZSBcIixcIiwgICB0ZXh0QzogXCIgICAgfEEgICAgYWIgICAgYSAgICBBYiAgICBhXCJcbiAgICAgICAgZW5zdXJlIFwiO1wiLCAgIHRleHRDOiBcIiAgICBBICAgIGFiICAgIGEgICAgfEFiICAgIGFcIlxuXG4gICAgZGVzY3JpYmUgXCJyZXVzZUZpbmRGb3JSZXBlYXRGaW5kXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldHRpbmdzLnNldChcInJldXNlRmluZEZvclJlcGVhdEZpbmRcIiwgdHJ1ZSlcblxuICAgICAgaXQgXCJjYW4gcmV1c2UgZiBhbmQgdCBhcyA7LCBGIGFuZCBUIGFzICcsJyByZXNwZWN0aXZlbHlcIiwgLT5cbiAgICAgICAgc2V0IHRleHRDOiBcInwgICAgQSAgICBhYiAgICBhICAgIEFiICAgIGFcIlxuICAgICAgICBlbnN1cmUgXCJmIGFcIiwgdGV4dEM6IFwiICAgIEEgICAgfGFiICAgIGEgICAgQWIgICAgYVwiXG4gICAgICAgIGVuc3VyZSBcImZcIiwgICB0ZXh0QzogXCIgICAgQSAgICBhYiAgICB8YSAgICBBYiAgICBhXCJcbiAgICAgICAgZW5zdXJlIFwiZlwiLCAgIHRleHRDOiBcIiAgICBBICAgIGFiICAgIGEgICAgQWIgICAgfGFcIlxuICAgICAgICBlbnN1cmUgXCJGXCIsICAgdGV4dEM6IFwiICAgIEEgICAgYWIgICAgfGEgICAgQWIgICAgYVwiXG4gICAgICAgIGVuc3VyZSBcIkZcIiwgICB0ZXh0QzogXCIgICAgQSAgICB8YWIgICAgYSAgICBBYiAgICBhXCJcbiAgICAgICAgZW5zdXJlIFwidFwiLCAgIHRleHRDOiBcIiAgICBBICAgIGFiICAgfCBhICAgIEFiICAgIGFcIlxuICAgICAgICBlbnN1cmUgXCJ0XCIsICAgdGV4dEM6IFwiICAgIEEgICAgYWIgICAgYSAgICBBYiAgIHwgYVwiXG4gICAgICAgIGVuc3VyZSBcIlRcIiwgICB0ZXh0QzogXCIgICAgQSAgICBhYiAgICBhfCAgICBBYiAgICBhXCJcbiAgICAgICAgZW5zdXJlIFwiVFwiLCAgIHRleHRDOiBcIiAgICBBICAgIGF8YiAgICBhICAgIEFiICAgIGFcIlxuXG4gICAgZGVzY3JpYmUgXCJmaW5kQWNyb3NzTGluZXNcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0dGluZ3Muc2V0KFwiZmluZEFjcm9zc0xpbmVzXCIsIHRydWUpXG5cbiAgICAgIGl0IFwic2VhcmNoZXMgYWNyb3NzIG11bHRpcGxlIGxpbmVzXCIsIC0+XG4gICAgICAgIHNldCAgICAgICAgICAgdGV4dEM6IFwifDA6ICAgIGEgICAgYVxcbjE6ICAgIGEgICAgYVxcbjI6ICAgIGEgICAgYVxcblwiXG4gICAgICAgIGVuc3VyZSBcImYgYVwiLCB0ZXh0QzogXCIwOiAgICB8YSAgICBhXFxuMTogICAgYSAgICBhXFxuMjogICAgYSAgICBhXFxuXCJcbiAgICAgICAgZW5zdXJlIFwiO1wiLCAgIHRleHRDOiBcIjA6ICAgIGEgICAgfGFcXG4xOiAgICBhICAgIGFcXG4yOiAgICBhICAgIGFcXG5cIlxuICAgICAgICBlbnN1cmUgXCI7XCIsICAgdGV4dEM6IFwiMDogICAgYSAgICBhXFxuMTogICAgfGEgICAgYVxcbjI6ICAgIGEgICAgYVxcblwiXG4gICAgICAgIGVuc3VyZSBcIjtcIiwgICB0ZXh0QzogXCIwOiAgICBhICAgIGFcXG4xOiAgICBhICAgIHxhXFxuMjogICAgYSAgICBhXFxuXCJcbiAgICAgICAgZW5zdXJlIFwiO1wiLCAgIHRleHRDOiBcIjA6ICAgIGEgICAgYVxcbjE6ICAgIGEgICAgYVxcbjI6ICAgIHxhICAgIGFcXG5cIlxuICAgICAgICBlbnN1cmUgXCJGIGFcIiwgdGV4dEM6IFwiMDogICAgYSAgICBhXFxuMTogICAgYSAgICB8YVxcbjI6ICAgIGEgICAgYVxcblwiXG4gICAgICAgIGVuc3VyZSBcInQgYVwiLCB0ZXh0QzogXCIwOiAgICBhICAgIGFcXG4xOiAgICBhICAgIGFcXG4yOiAgIHwgYSAgICBhXFxuXCJcbiAgICAgICAgZW5zdXJlIFwiVCBhXCIsIHRleHRDOiBcIjA6ICAgIGEgICAgYVxcbjE6ICAgIGEgICAgfGFcXG4yOiAgICBhICAgIGFcXG5cIlxuICAgICAgICBlbnN1cmUgXCJUIGFcIiwgdGV4dEM6IFwiMDogICAgYSAgICBhXFxuMTogICAgYXwgICAgYVxcbjI6ICAgIGEgICAgYVxcblwiXG5cbiAgICBkZXNjcmliZSBcImZpbmRDaGFyc01heFwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAjIFRvIHBhc3MgaGxGaW5kIGxvZ2ljIGl0IHJlcXVpcmUgXCJ2aXNpYmxlXCIgc2NyZWVuIHJhbmdlLlxuICAgICAgICBqYXNtaW5lLmF0dGFjaFRvRE9NKGF0b20ud29ya3NwYWNlLmdldEVsZW1lbnQoKSlcblxuICAgICAgZGVzY3JpYmUgXCJ3aXRoIDIgbGVuZ3RoXCIsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBzZXR0aW5ncy5zZXQoXCJmaW5kQ2hhcnNNYXhcIiwgMilcblxuICAgICAgICBkZXNjcmliZSBcImNhbiBmaW5kIG9uZSBvciB0d28gY2hhclwiLCAtPlxuICAgICAgICAgIGl0IFwiY2FuIGZpbmQgYnkgdHdvIGNoYXJcIiwgLT5cbiAgICAgICAgICAgIHNldCAgICAgICAgICAgICB0ZXh0QzogXCJ8ICAgIGEgICAgYWIgICAgYSAgICBjZCAgICBhXCJcbiAgICAgICAgICAgIGVuc3VyZSBcImYgYSBiXCIsIHRleHRDOiBcIiAgICBhICAgIHxhYiAgICBhICAgIGNkICAgIGFcIlxuICAgICAgICAgICAgZW5zdXJlIFwiZiBjIGRcIiwgdGV4dEM6IFwiICAgIGEgICAgYWIgICAgYSAgICB8Y2QgICAgYVwiXG5cbiAgICAgICAgICBpdCBcImNhbiBmaW5kIGJ5IG9uZS1jaGFyIGJ5IGNvbmZpcm1pbmcgZXhwbGljaXRseVwiLCAtPlxuICAgICAgICAgICAgc2V0ICAgICAgICAgICAgICAgICB0ZXh0QzogXCJ8ICAgIGEgICAgYWIgICAgYSAgICBjZCAgICBhXCJcbiAgICAgICAgICAgIGVuc3VyZSBcImYgYSBlbnRlclwiLCB0ZXh0QzogXCIgICAgfGEgICAgYWIgICAgYSAgICBjZCAgICBhXCJcbiAgICAgICAgICAgIGVuc3VyZSBcImYgYyBlbnRlclwiLCB0ZXh0QzogXCIgICAgYSAgICBhYiAgICBhICAgIHxjZCAgICBhXCJcblxuICAgICAgZGVzY3JpYmUgXCJ3aXRoIDMgbGVuZ3RoXCIsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBzZXR0aW5ncy5zZXQoXCJmaW5kQ2hhcnNNYXhcIiwgMylcblxuICAgICAgICBkZXNjcmliZSBcImNhbiBmaW5kIDMgYXQgbWF4aW11bVwiLCAtPlxuICAgICAgICAgIGl0IFwiY2FuIGZpbmQgYnkgb25lIG9yIHR3byBvciB0aHJlZSBjaGFyXCIsIC0+XG4gICAgICAgICAgICBzZXQgICAgICAgICAgICAgICAgICAgdGV4dEM6IFwifCAgICBhICAgIGFiICAgIGEgICAgY2QgICAgZWZnXCJcbiAgICAgICAgICAgIGVuc3VyZSBcImYgYSBiIGVudGVyXCIsIHRleHRDOiBcIiAgICBhICAgIHxhYiAgICBhICAgIGNkICAgIGVmZ1wiXG4gICAgICAgICAgICBlbnN1cmUgXCJmIGEgZW50ZXJcIiwgICB0ZXh0QzogXCIgICAgYSAgICBhYiAgICB8YSAgICBjZCAgICBlZmdcIlxuICAgICAgICAgICAgZW5zdXJlIFwiZiBjIGQgZW50ZXJcIiwgdGV4dEM6IFwiICAgIGEgICAgYWIgICAgYSAgICB8Y2QgICAgZWZnXCJcbiAgICAgICAgICAgIGVuc3VyZSBcImYgZSBmIGdcIiwgICAgIHRleHRDOiBcIiAgICBhICAgIGFiICAgIGEgICAgY2QgICAgfGVmZ1wiXG5cbiAgICAgIGRlc2NyaWJlIFwiYXV0b0NvbmZpcm1UaW1lb3V0XCIsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBzZXR0aW5ncy5zZXQoXCJmaW5kQ2hhcnNNYXhcIiwgMilcbiAgICAgICAgICBzZXR0aW5ncy5zZXQoXCJmaW5kQ29uZmlybUJ5VGltZW91dFwiLCA1MDApXG5cbiAgICAgICAgaXQgXCJhdXRvLWNvbmZpcm0gc2luZ2xlLWNoYXIgaW5wdXQgb24gdGltZW91dFwiLCAtPlxuICAgICAgICAgIHNldCAgICAgICAgICAgICB0ZXh0QzogXCJ8ICAgIGEgICAgYWIgICAgYSAgICBjZCAgICBhXCJcblxuICAgICAgICAgIGVuc3VyZSBcImYgYVwiLCAgIHRleHRDOiBcInwgICAgYSAgICBhYiAgICBhICAgIGNkICAgIGFcIlxuICAgICAgICAgIGFkdmFuY2VDbG9jayg1MDApXG4gICAgICAgICAgZW5zdXJlICAgICAgICAgIHRleHRDOiBcIiAgICB8YSAgICBhYiAgICBhICAgIGNkICAgIGFcIlxuXG4gICAgICAgICAgZW5zdXJlIFwiZiBjIGRcIiwgdGV4dEM6IFwiICAgIGEgICAgYWIgICAgYSAgICB8Y2QgICAgYVwiXG5cbiAgICAgICAgICBlbnN1cmUgXCJmIGFcIiwgICB0ZXh0QzogXCIgICAgYSAgICBhYiAgICBhICAgIHxjZCAgICBhXCJcbiAgICAgICAgICBhZHZhbmNlQ2xvY2soNTAwKVxuICAgICAgICAgIGVuc3VyZSAgICAgICAgICB0ZXh0QzogXCIgICAgYSAgICBhYiAgICBhICAgIGNkICAgIHxhXCJcblxuICAgICAgICAgIGVuc3VyZSBcIkYgYlwiLCAgIHRleHRDOiBcIiAgICBhICAgIGFiICAgIGEgICAgY2QgICAgfGFcIlxuICAgICAgICAgIGFkdmFuY2VDbG9jayg1MDApXG4gICAgICAgICAgZW5zdXJlICAgICAgICAgIHRleHRDOiBcIiAgICBhICAgIGF8YiAgICBhICAgIGNkICAgIGFcIlxuIl19
