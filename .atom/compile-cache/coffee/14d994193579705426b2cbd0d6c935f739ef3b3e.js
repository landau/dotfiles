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
    describe("cancellation", function() {
      return it("keeps multiple-cursors when cancelled", function() {
        set({
          textC: "|   a\n!   a\n|   a\n"
        });
        return ensure("f escape", {
          textC: "|   a\n!   a\n|   a\n"
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
        it("can reuse f and t as ;, F and T as ',' respectively", function() {
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
        return it("behave as normal f if no successful previous find was exists", function() {
          set({
            textC: "  |  A    ab    a    Ab    a"
          });
          ensure("f escape", {
            textC: "  |  A    ab    a    Ab    a"
          });
          expect(vimState.globalState.get("currentFind")).toBeNull();
          ensure("f a", {
            textC: "    A    |ab    a    Ab    a"
          });
          return expect(vimState.globalState.get("currentFind")).toBeTruthy();
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
      describe("find-next/previous-pre-confirmed", function() {
        beforeEach(function() {
          settings.set("findCharsMax", 10);
          return jasmine.attachToDOM(atom.workspace.getElement());
        });
        return describe("can find one or two char", function() {
          it("adjust to next-pre-confirmed", function() {
            var element;
            set({
              textC: "|    a    ab    a    cd    a"
            });
            keystroke("f a ");
            element = vimState.inputEditor.element;
            dispatch(element, "vim-mode-plus:find-next-pre-confirmed");
            dispatch(element, "vim-mode-plus:find-next-pre-confirmed");
            return ensure("enter", {
              textC: "    a    ab    |a    cd    a"
            });
          });
          it("adjust to previous-pre-confirmed", function() {
            var element;
            set({
              textC: "|    a    ab    a    cd    a"
            });
            ensure("3 f a enter", {
              textC: "    a    ab    |a    cd    a"
            });
            set({
              textC: "|    a    ab    a    cd    a"
            });
            keystroke("3 f a");
            element = vimState.inputEditor.element;
            dispatch(element, "vim-mode-plus:find-previous-pre-confirmed");
            dispatch(element, "vim-mode-plus:find-previous-pre-confirmed");
            return ensure("enter", {
              textC: "    |a    ab    a    cd    a"
            });
          });
          return it("is useful to skip earlier spot interactivelly", function() {
            var element;
            set({
              textC: 'text = "this is |\"example\" of use case"'
            });
            keystroke('c t "');
            element = vimState.inputEditor.element;
            dispatch(element, "vim-mode-plus:find-next-pre-confirmed");
            dispatch(element, "vim-mode-plus:find-next-pre-confirmed");
            return ensure("enter", {
              textC: 'text = "this is |"',
              mode: "insert"
            });
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9zcGVjL21vdGlvbi1maW5kLXNwZWMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxNQUFvQyxPQUFBLENBQVEsZUFBUixDQUFwQyxFQUFDLDZCQUFELEVBQWMsdUJBQWQsRUFBd0I7O0VBQ3hCLFFBQUEsR0FBVyxPQUFBLENBQVEsaUJBQVI7O0VBRVgsUUFBQSxDQUFTLGFBQVQsRUFBd0IsU0FBQTtBQUN0QixRQUFBO0lBQUEsT0FBNEQsRUFBNUQsRUFBQyxhQUFELEVBQU0sZ0JBQU4sRUFBYyxtQkFBZCxFQUF5QixnQkFBekIsRUFBaUMsdUJBQWpDLEVBQWdEO0lBRWhELFVBQUEsQ0FBVyxTQUFBO01BQ1QsUUFBUSxDQUFDLEdBQVQsQ0FBYSw0QkFBYixFQUEyQyxJQUEzQzthQUdBLFdBQUEsQ0FBWSxTQUFDLEtBQUQsRUFBUSxJQUFSO1FBQ1YsUUFBQSxHQUFXO1FBQ1Ysd0JBQUQsRUFBUztlQUNSLGNBQUQsRUFBTSxvQkFBTixFQUFjLDBCQUFkLEVBQTJCO01BSGpCLENBQVo7SUFKUyxDQUFYO0lBU0EsU0FBQSxDQUFVLG1CQUFWLEVBQStCLFNBQUE7QUFDN0IsVUFBQTtNQUFBLGNBQUEsR0FBaUI7TUFFakIsa0JBQUEsR0FBcUIsU0FBQyxFQUFEO1FBQ25CLE9BQU8sQ0FBQyxJQUFSLENBQWEsRUFBRSxDQUFDLElBQWhCO1FBQ0EsRUFBQSxDQUFBO2VBRUEsT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsRUFBRSxDQUFDLElBQW5CO01BSm1CO01BTXJCLHlCQUFBLEdBQTRCLFNBQUMsRUFBRDtBQUMxQixZQUFBO1FBQUEsRUFBQSxHQUFLLFdBQVcsQ0FBQyxHQUFaLENBQUE7UUFDTCxFQUFBLENBQUE7UUFDQSxFQUFBLEdBQUssV0FBVyxDQUFDLEdBQVosQ0FBQTtlQUNMLE9BQU8sQ0FBQyxHQUFSLENBQVkseUJBQUEsR0FBeUIsQ0FBQyxFQUFBLEdBQUssRUFBTixDQUF6QixHQUFrQyxPQUE5QztNQUowQjtNQU01QixVQUFBLENBQVcsU0FBQTtlQUNULEdBQUEsQ0FDRTtVQUFBLElBQUEsRUFBTSxJQUFBLEdBQU8sR0FBRyxDQUFDLE1BQUosQ0FBVyxjQUFYLENBQWI7VUFDQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQURSO1NBREY7TUFEUyxDQUFYO01BS0EsU0FBQSxDQUFVLDRDQUFWLEVBQXdELFNBQUE7UUFDdEQsVUFBQSxDQUFXLFNBQUE7aUJBQ1QsUUFBUSxDQUFDLGFBQVQsR0FBeUI7UUFEaEIsQ0FBWDtlQUdBLEVBQUEsQ0FBRyxnQ0FBSCxFQUFxQyxTQUFBO0FBQ25DLGNBQUE7VUFBQSx3QkFBQSxHQUEyQixTQUFBO0FBQ3pCLGdCQUFBO0FBQUEsaUJBQXlCLDhGQUF6QjtjQUFBLFNBQUEsQ0FBVSxLQUFWO0FBQUE7bUJBQ0EsTUFBQSxDQUFPO2NBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLGNBQUEsR0FBaUIsQ0FBckIsQ0FBUjthQUFQO1VBRnlCO1VBSTNCLE9BQU8sQ0FBQyxHQUFSLENBQVksWUFBWjtVQUNBLE1BQUEsQ0FBTyxLQUFQLEVBQWM7WUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO1dBQWQ7VUFDQSxHQUFBLENBQUk7WUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO1dBQUo7aUJBQ0Esa0JBQUEsQ0FBbUIsd0JBQW5CO1FBUm1DLENBQXJDO01BSnNELENBQXhEO2FBZ0JBLFFBQUEsQ0FBUyxxQ0FBVCxFQUFnRCxTQUFBO2VBQzlDLEVBQUEsQ0FBRyxxQ0FBSCxFQUEwQyxTQUFBO0FBQ3hDLGNBQUE7VUFBQSw0QkFBQSxHQUErQixTQUFBO0FBQzdCLGdCQUFBO0FBQUEsaUJBQXlCLDhGQUF6QjtjQUFBLFNBQUEsQ0FBVSxLQUFWO0FBQUE7bUJBQ0EsTUFBQSxDQUFPO2NBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLGNBQUEsR0FBaUIsQ0FBckIsQ0FBUjthQUFQO1VBRjZCO1VBSS9CLE9BQU8sQ0FBQyxHQUFSLENBQVksV0FBWjtVQUNBLE1BQUEsQ0FBTyxLQUFQLEVBQWM7WUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO1dBQWQ7VUFFQSxHQUFBLENBQUk7WUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO1dBQUo7aUJBQ0Esa0JBQUEsQ0FBbUIsNEJBQW5CO1FBVHdDLENBQTFDO01BRDhDLENBQWhEO0lBcEM2QixDQUEvQjtJQWtEQSxRQUFBLENBQVMscUJBQVQsRUFBZ0MsU0FBQTtNQUM5QixVQUFBLENBQVcsU0FBQTtlQUNULEdBQUEsQ0FDRTtVQUFBLElBQUEsRUFBTSxnQkFBTjtVQUNBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBRFI7U0FERjtNQURTLENBQVg7TUFLQSxFQUFBLENBQUcsaURBQUgsRUFBc0QsU0FBQTtlQUNwRCxNQUFBLENBQU8sS0FBUCxFQUFjO1VBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtTQUFkO01BRG9ELENBQXREO01BR0EsRUFBQSxDQUFHLHVEQUFILEVBQTRELFNBQUE7UUFDMUQsTUFBQSxDQUFPLEdBQVAsRUFBWTtVQUFBLElBQUEsRUFBTSxDQUFDLFFBQUQsRUFBVyxlQUFYLENBQU47U0FBWjtRQUNBLE1BQUEsQ0FBTyxLQUFQLEVBQWM7VUFBQSxZQUFBLEVBQWMsS0FBZDtVQUFxQixNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUE3QjtTQUFkO1FBQ0EsTUFBQSxDQUFPLEdBQVAsRUFBWTtVQUFBLFlBQUEsRUFBYyxRQUFkO1VBQXdCLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQWhDO1NBQVo7ZUFDQSxNQUFBLENBQU8sR0FBUCxFQUFZO1VBQUEsWUFBQSxFQUFjLEtBQWQ7VUFBcUIsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBN0I7U0FBWjtNQUowRCxDQUE1RDtNQU1BLEVBQUEsQ0FBRywyREFBSCxFQUFnRSxTQUFBO1FBQzlELEdBQUEsQ0FBSTtVQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7U0FBSjtlQUNBLE1BQUEsQ0FBTyxLQUFQLEVBQWM7VUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO1NBQWQ7TUFGOEQsQ0FBaEU7TUFJQSxFQUFBLENBQUcsd0JBQUgsRUFBNkIsU0FBQTtlQUMzQixNQUFBLENBQU8sT0FBUCxFQUFnQjtVQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7U0FBaEI7TUFEMkIsQ0FBN0I7TUFHQSxFQUFBLENBQUcseUJBQUgsRUFBOEIsU0FBQTtRQUM1QixDQUFBO1VBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtTQUFBO2VBQ0EsTUFBQSxDQUFPLE9BQVAsRUFBZ0I7VUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO1NBQWhCO01BRjRCLENBQTlCO01BSUEsRUFBQSxDQUFHLHFEQUFILEVBQTBELFNBQUE7ZUFDeEQsTUFBQSxDQUFPLEtBQVAsRUFBYztVQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7U0FBZDtNQUR3RCxDQUExRDtNQUdBLEVBQUEsQ0FBRyw2RUFBSCxFQUFrRixTQUFBO1FBQ2hGLE1BQUEsQ0FBTyxTQUFQLEVBQWtCO1VBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtTQUFsQjtRQUVBLE1BQUEsQ0FBTyxTQUFQLEVBQWtCO1VBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtTQUFsQjtRQUVBLEdBQUEsQ0FBSTtVQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7U0FBSjtRQUNBLE1BQUEsQ0FBTyxTQUFQLEVBQWtCO1VBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtTQUFsQjtlQUNBLE1BQUEsQ0FBTyxTQUFQLEVBQWtCO1VBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtTQUFsQjtNQVBnRixDQUFsRjtNQVNBLEVBQUEsQ0FBRyxpQkFBSCxFQUFzQixTQUFBO1FBQ3BCLEdBQUEsQ0FBSTtVQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7U0FBSjtlQUNBLE1BQUEsQ0FBTyxTQUFQLEVBQWtCO1VBQUEsSUFBQSxFQUFNLFNBQU47U0FBbEI7TUFGb0IsQ0FBdEI7YUFJQSxFQUFBLENBQUcsbURBQUgsRUFBd0QsU0FBQTtRQUN0RCxHQUFBLENBQUk7VUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO1NBQUo7ZUFDQSxNQUFBLENBQU8sT0FBUCxFQUFnQjtVQUFBLElBQUEsRUFBTSxhQUFOO1NBQWhCO01BRnNELENBQXhEO0lBMUM4QixDQUFoQztJQThDQSxRQUFBLENBQVMsY0FBVCxFQUF5QixTQUFBO2FBQ3ZCLEVBQUEsQ0FBRyx1Q0FBSCxFQUE0QyxTQUFBO1FBQzFDLEdBQUEsQ0FBb0I7VUFBQSxLQUFBLEVBQU8sdUJBQVA7U0FBcEI7ZUFDQSxNQUFBLENBQU8sVUFBUCxFQUFvQjtVQUFBLEtBQUEsRUFBTyx1QkFBUDtTQUFwQjtNQUYwQyxDQUE1QztJQUR1QixDQUF6QjtJQUtBLFFBQUEsQ0FBUyxxQkFBVCxFQUFnQyxTQUFBO01BQzlCLFVBQUEsQ0FBVyxTQUFBO2VBQ1QsR0FBQSxDQUNFO1VBQUEsSUFBQSxFQUFNLGdCQUFOO1VBQ0EsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FEUjtTQURGO01BRFMsQ0FBWDtNQUtBLEVBQUEsQ0FBRywyRUFBSCxFQUFnRixTQUFBO1FBQzlFLE1BQUEsQ0FBTyxLQUFQLEVBQWM7VUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO1NBQWQ7ZUFFQSxNQUFBLENBQU8sS0FBUCxFQUFjO1VBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtTQUFkO01BSDhFLENBQWhGO01BS0EsRUFBQSxDQUFHLCtFQUFILEVBQW9GLFNBQUE7UUFDbEYsR0FBQSxDQUFJO1VBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtTQUFKO2VBQ0EsTUFBQSxDQUFPLEtBQVAsRUFBYztVQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7U0FBZDtNQUZrRixDQUFwRjtNQUlBLEVBQUEsQ0FBRyx3QkFBSCxFQUE2QixTQUFBO2VBQzNCLE1BQUEsQ0FBTyxPQUFQLEVBQWdCO1VBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtTQUFoQjtNQUQyQixDQUE3QjtNQUdBLEVBQUEsQ0FBRyx5QkFBSCxFQUE4QixTQUFBO1FBQzVCLEdBQUEsQ0FBSTtVQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7U0FBSjtlQUNBLE1BQUEsQ0FBTyxPQUFQLEVBQWdCO1VBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtTQUFoQjtNQUY0QixDQUE5QjtNQUlBLEVBQUEsQ0FBRyxxREFBSCxFQUEwRCxTQUFBO2VBQ3hELE1BQUEsQ0FBTyxLQUFQLEVBQWM7VUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO1NBQWQ7TUFEd0QsQ0FBMUQ7TUFHQSxFQUFBLENBQUcsNkVBQUgsRUFBa0YsU0FBQTtRQUNoRixNQUFBLENBQU8sU0FBUCxFQUFrQjtVQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7U0FBbEI7UUFFQSxNQUFBLENBQU8sU0FBUCxFQUFrQjtVQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7U0FBbEI7UUFFQSxHQUFBLENBQUk7VUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO1NBQUo7UUFDQSxNQUFBLENBQU8sU0FBUCxFQUFrQjtVQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7U0FBbEI7ZUFDQSxNQUFBLENBQU8sU0FBUCxFQUFrQjtVQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7U0FBbEI7TUFQZ0YsQ0FBbEY7TUFTQSxFQUFBLENBQUcsaUJBQUgsRUFBc0IsU0FBQTtRQUNwQixHQUFBLENBQUk7VUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO1NBQUo7ZUFDQSxNQUFBLENBQU8sU0FBUCxFQUNFO1VBQUEsSUFBQSxFQUFNLFlBQU47U0FERjtNQUZvQixDQUF0QjtNQUtBLEVBQUEsQ0FBRyxvRkFBSCxFQUF5RixTQUFBO1FBQ3ZGLEdBQUEsQ0FBSTtVQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7U0FBSjtlQUNBLE1BQUEsQ0FBTyxPQUFQLEVBQ0U7VUFBQSxJQUFBLEVBQU0sZUFBTjtTQURGO01BRnVGLENBQXpGO01BSUEsRUFBQSxDQUFHLCtEQUFILEVBQW9FLFNBQUE7UUFDbEUsQ0FBQTtVQUFBLElBQUEsRUFBTSxnQkFBTjtTQUFBO1FBQ0EsR0FBQSxDQUFJO1VBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtTQUFKO2VBQ0EsTUFBQSxDQUFPLFNBQVAsRUFDRTtVQUFBLElBQUEsRUFBTSxnQkFBTjtTQURGO01BSGtFLENBQXBFO01BTUEsRUFBQSxDQUFHLG1EQUFILEVBQXdELFNBQUE7UUFDdEQsR0FBQSxDQUFJO1VBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtTQUFKO2VBQ0EsTUFBQSxDQUFPLE9BQVAsRUFDRTtVQUFBLElBQUEsRUFBTSxlQUFOO1NBREY7TUFGc0QsQ0FBeEQ7YUFLQSxFQUFBLENBQUcscUVBQUgsRUFBMEUsU0FBQTtRQUN4RSxHQUFBLENBQUk7VUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO1NBQUo7ZUFDQSxNQUFBLENBQU8sT0FBUCxFQUNFO1VBQUEsSUFBQSxFQUFNLGdCQUFOO1NBREY7TUFGd0UsQ0FBMUU7SUF0RDhCLENBQWhDO0lBMkRBLFFBQUEsQ0FBUyx5QkFBVCxFQUFvQyxTQUFBO01BQ2xDLFVBQUEsQ0FBVyxTQUFBO2VBQ1QsR0FBQSxDQUNFO1VBQUEsSUFBQSxFQUFNLGdCQUFOO1VBQ0EsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FEUjtTQURGO01BRFMsQ0FBWDtNQUtBLEVBQUEsQ0FBRyw0QkFBSCxFQUFpQyxTQUFBO1FBQy9CLE1BQUEsQ0FBTyxLQUFQLEVBQWM7VUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO1NBQWQ7UUFDQSxNQUFBLENBQU8sR0FBUCxFQUFZO1VBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtTQUFaO2VBQ0EsTUFBQSxDQUFPLEdBQVAsRUFBWTtVQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7U0FBWjtNQUgrQixDQUFqQztNQUtBLEVBQUEsQ0FBRyw0QkFBSCxFQUFpQyxTQUFBO1FBQy9CLEdBQUEsQ0FBSTtVQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxFQUFKLENBQVI7U0FBSjtRQUNBLE1BQUEsQ0FBTyxLQUFQLEVBQWM7VUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO1NBQWQ7UUFDQSxNQUFBLENBQU8sR0FBUCxFQUFZO1VBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtTQUFaO2VBQ0EsTUFBQSxDQUFPLEdBQVAsRUFBWTtVQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7U0FBWjtNQUorQixDQUFqQztNQU1BLEVBQUEsQ0FBRyxnQ0FBSCxFQUFxQyxTQUFBO1FBQ25DLEdBQUEsQ0FBSTtVQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7U0FBSjtRQUNBLE1BQUEsQ0FBTyxLQUFQLEVBQWM7VUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO1NBQWQ7UUFDQSxNQUFBLENBQU8sR0FBUCxFQUFZO1VBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtTQUFaO2VBQ0EsTUFBQSxDQUFPLEdBQVAsRUFBWTtVQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7U0FBWjtNQUptQyxDQUFyQztNQU1BLEVBQUEsQ0FBRyxnQ0FBSCxFQUFxQyxTQUFBO1FBQ25DLEdBQUEsQ0FBSTtVQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7U0FBSjtRQUNBLE1BQUEsQ0FBTyxLQUFQLEVBQWM7VUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO1NBQWQ7UUFDQSxNQUFBLENBQU8sR0FBUCxFQUFZO1VBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtTQUFaO2VBQ0EsTUFBQSxDQUFPLEdBQVAsRUFBWTtVQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7U0FBWjtNQUptQyxDQUFyQztNQU1BLEVBQUEsQ0FBRyxrREFBSCxFQUF1RCxTQUFBO1FBQ3JELE1BQUEsQ0FBTyxLQUFQLEVBQWM7VUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO1NBQWQ7UUFDQSxNQUFBLENBQU8sR0FBUCxFQUFZO1VBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtTQUFaO2VBQ0EsTUFBQSxDQUFPLEdBQVAsRUFBWTtVQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7U0FBWjtNQUhxRCxDQUF2RDtNQUtBLEVBQUEsQ0FBRyxrREFBSCxFQUF1RCxTQUFBO1FBQ3JELEdBQUEsQ0FBSTtVQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxFQUFKLENBQVI7U0FBSjtRQUNBLE1BQUEsQ0FBTyxLQUFQLEVBQWM7VUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO1NBQWQ7UUFDQSxNQUFBLENBQU8sR0FBUCxFQUFZO1VBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtTQUFaO2VBQ0EsTUFBQSxDQUFPLEdBQVAsRUFBWTtVQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7U0FBWjtNQUpxRCxDQUF2RDtNQU1BLEVBQUEsQ0FBRyw0QkFBSCxFQUFpQyxTQUFBO1FBQy9CLE1BQUEsQ0FBTyxLQUFQLEVBQWM7VUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO1NBQWQ7ZUFDQSxNQUFBLENBQU8sR0FBUCxFQUFZO1VBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtTQUFaO01BRitCLENBQWpDO01BSUEsRUFBQSxDQUFHLDRCQUFILEVBQWlDLFNBQUE7UUFDL0IsR0FBQSxDQUFJO1VBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLEVBQUosQ0FBUjtTQUFKO1FBQ0EsTUFBQSxDQUFPLEtBQVAsRUFBYztVQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7U0FBZDtlQUNBLE1BQUEsQ0FBTyxHQUFQLEVBQVk7VUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO1NBQVo7TUFIK0IsQ0FBakM7TUFLQSxFQUFBLENBQUcsd0RBQUgsRUFBNkQsU0FBQTtRQUMzRCxHQUFBLENBQUk7VUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO1NBQUo7UUFDQSxNQUFBLENBQU8sS0FBUCxFQUFjO1VBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtTQUFkO1FBQ0EsTUFBQSxDQUFPLEdBQVAsRUFBWTtVQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7U0FBWjtlQUNBLE1BQUEsQ0FBTyxHQUFQLEVBQVk7VUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO1NBQVo7TUFKMkQsQ0FBN0Q7TUFNQSxFQUFBLENBQUcsd0RBQUgsRUFBNkQsU0FBQTtRQUMzRCxHQUFBLENBQUk7VUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO1NBQUo7UUFDQSxNQUFBLENBQU8sS0FBUCxFQUFjO1VBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtTQUFkO1FBQ0EsTUFBQSxDQUFPLEdBQVAsRUFBWTtVQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7U0FBWjtlQUNBLE1BQUEsQ0FBTyxHQUFQLEVBQVk7VUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO1NBQVo7TUFKMkQsQ0FBN0Q7TUFNQSxFQUFBLENBQUcscUNBQUgsRUFBMEMsU0FBQTtRQUN4QyxHQUFBLENBQUk7VUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO1NBQUo7UUFDQSxNQUFBLENBQU8sS0FBUCxFQUFjO1VBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtTQUFkO2VBQ0EsTUFBQSxDQUFPLEtBQVAsRUFBYztVQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7U0FBZDtNQUh3QyxDQUExQzthQUtBLEVBQUEsQ0FBRyx3Q0FBSCxFQUE2QyxTQUFBO1FBQzNDLEdBQUEsQ0FBSTtVQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7U0FBSjtRQUNBLE1BQUEsQ0FBTyxLQUFQLEVBQWM7VUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO1NBQWQ7ZUFDQSxNQUFBLENBQU8sS0FBUCxFQUFjO1VBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtTQUFkO01BSDJDLENBQTdDO0lBbEVrQyxDQUFwQztJQXVFQSxRQUFBLENBQVMsOENBQVQsRUFBeUQsU0FBQTtBQUN2RCxVQUFBO01BQUEsT0FBNkIsRUFBN0IsRUFBQyxlQUFELEVBQVEscUJBQVIsRUFBcUI7TUFDckIsVUFBQSxDQUFXLFNBQUE7ZUFDVCxXQUFBLENBQVksU0FBQyxhQUFELEVBQWdCLE1BQWhCO1VBQ1YsR0FBQSxDQUNFO1lBQUEsSUFBQSxFQUFNLGFBQU47WUFDQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQURSO1dBREY7VUFJQSxLQUFBLEdBQVE7VUFDUixLQUFLLENBQUMsR0FBTixDQUNFO1lBQUEsSUFBQSxFQUFNLGFBQU47WUFDQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQURSO1dBREY7VUFHQSxXQUFBLEdBQWMsYUFBYSxDQUFDO1VBRzVCLElBQUEsR0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWYsQ0FBQTtpQkFDUCxJQUFJLENBQUMsWUFBTCxDQUFrQixNQUFsQjtRQWJVLENBQVo7TUFEUyxDQUFYO01BZ0JBLEVBQUEsQ0FBRyw2REFBSCxFQUFrRSxTQUFBO1FBQ2hFLE1BQUEsQ0FBTyxLQUFQLEVBQWM7VUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO1NBQWQ7UUFDQSxLQUFLLENBQUMsTUFBTixDQUFhO1VBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtTQUFiO1FBR0EsSUFBSSxDQUFDLFlBQUwsQ0FBa0IsV0FBbEI7UUFDQSxLQUFLLENBQUMsU0FBTixDQUFnQixHQUFoQjtRQUNBLE1BQUEsQ0FBTztVQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7U0FBUDtRQUNBLEtBQUssQ0FBQyxNQUFOLENBQWE7VUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO1NBQWI7UUFHQSxLQUFLLENBQUMsU0FBTixDQUFnQixLQUFoQjtRQUNBLE1BQUEsQ0FBTztVQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7U0FBUDtRQUNBLEtBQUssQ0FBQyxNQUFOLENBQWE7VUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO1NBQWI7UUFHQSxJQUFJLENBQUMsWUFBTCxDQUFrQixNQUFsQjtRQUNBLE1BQUEsQ0FBTyxHQUFQLEVBQVk7VUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO1NBQVo7ZUFDQSxLQUFLLENBQUMsTUFBTixDQUFhO1VBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtTQUFiO01BbEJnRSxDQUFsRTthQW9CQSxFQUFBLENBQUcseURBQUgsRUFBOEQsU0FBQTtRQUM1RCxNQUFBLENBQU8sS0FBUCxFQUFjO1VBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtTQUFkO1FBQ0EsS0FBSyxDQUFDLE1BQU4sQ0FBYTtVQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7U0FBYjtRQUVBLElBQUksQ0FBQyxZQUFMLENBQWtCLFdBQWxCO1FBQ0EsTUFBTSxDQUFDLE9BQVAsQ0FBQTtRQUNBLE1BQUEsQ0FBTyxNQUFNLENBQUMsT0FBUCxDQUFBLENBQVAsQ0FBd0IsQ0FBQyxJQUF6QixDQUE4QixLQUE5QjtRQUNBLEtBQUssQ0FBQyxNQUFOLENBQWEsR0FBYixFQUFrQjtVQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7U0FBbEI7UUFDQSxLQUFLLENBQUMsTUFBTixDQUFhLEdBQWIsRUFBa0I7VUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO1NBQWxCO2VBQ0EsS0FBSyxDQUFDLE1BQU4sQ0FBYSxHQUFiLEVBQWtCO1VBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtTQUFsQjtNQVQ0RCxDQUE5RDtJQXRDdUQsQ0FBekQ7V0FpREEsUUFBQSxDQUFTLGtDQUFULEVBQTZDLFNBQUE7TUFDM0MsUUFBQSxDQUFTLG1CQUFULEVBQThCLFNBQUE7UUFDNUIsVUFBQSxDQUFXLFNBQUE7aUJBQ1QsUUFBUSxDQUFDLEdBQVQsQ0FBYSxtQkFBYixFQUFrQyxJQUFsQztRQURTLENBQVg7ZUFHQSxFQUFBLENBQUcscUJBQUgsRUFBMEIsU0FBQTtVQUN4QixHQUFBLENBQUk7WUFBQSxLQUFBLEVBQU8sOEJBQVA7V0FBSjtVQUNBLE1BQUEsQ0FBTyxLQUFQLEVBQWM7WUFBQSxLQUFBLEVBQU8sOEJBQVA7V0FBZDtVQUNBLE1BQUEsQ0FBTyxHQUFQLEVBQWM7WUFBQSxLQUFBLEVBQU8sOEJBQVA7V0FBZDtVQUNBLE1BQUEsQ0FBTyxHQUFQLEVBQWM7WUFBQSxLQUFBLEVBQU8sOEJBQVA7V0FBZDtpQkFDQSxNQUFBLENBQU8sR0FBUCxFQUFjO1lBQUEsS0FBQSxFQUFPLDhCQUFQO1dBQWQ7UUFMd0IsQ0FBMUI7TUFKNEIsQ0FBOUI7TUFXQSxRQUFBLENBQVMscUJBQVQsRUFBZ0MsU0FBQTtRQUM5QixVQUFBLENBQVcsU0FBQTtpQkFDVCxRQUFRLENBQUMsR0FBVCxDQUFhLHFCQUFiLEVBQW9DLElBQXBDO1FBRFMsQ0FBWDtRQUdBLEVBQUEsQ0FBRyxzQ0FBSCxFQUEyQyxTQUFBO1VBQ3pDLEdBQUEsQ0FBSTtZQUFBLEtBQUEsRUFBTyw4QkFBUDtXQUFKO1VBQ0EsTUFBQSxDQUFPLEtBQVAsRUFBYztZQUFBLEtBQUEsRUFBTyw4QkFBUDtXQUFkO1VBQ0EsTUFBQSxDQUFPLEdBQVAsRUFBYztZQUFBLEtBQUEsRUFBTyw4QkFBUDtXQUFkO1VBQ0EsTUFBQSxDQUFPLEdBQVAsRUFBYztZQUFBLEtBQUEsRUFBTyw4QkFBUDtXQUFkO2lCQUNBLE1BQUEsQ0FBTyxHQUFQLEVBQWM7WUFBQSxLQUFBLEVBQU8sOEJBQVA7V0FBZDtRQUx5QyxDQUEzQztlQU9BLEVBQUEsQ0FBRyxnREFBSCxFQUFxRCxTQUFBO1VBQ25ELEdBQUEsQ0FBSTtZQUFBLEtBQUEsRUFBTyw4QkFBUDtXQUFKO1VBQ0EsTUFBQSxDQUFPLEtBQVAsRUFBYztZQUFBLEtBQUEsRUFBTyw4QkFBUDtXQUFkO1VBQ0EsTUFBQSxDQUFPLEtBQVAsRUFBYztZQUFBLEtBQUEsRUFBTyw4QkFBUDtXQUFkO1VBQ0EsTUFBQSxDQUFPLEdBQVAsRUFBYztZQUFBLEtBQUEsRUFBTyw4QkFBUDtXQUFkO2lCQUNBLE1BQUEsQ0FBTyxHQUFQLEVBQWM7WUFBQSxLQUFBLEVBQU8sOEJBQVA7V0FBZDtRQUxtRCxDQUFyRDtNQVg4QixDQUFoQztNQWtCQSxRQUFBLENBQVMsd0JBQVQsRUFBbUMsU0FBQTtRQUNqQyxVQUFBLENBQVcsU0FBQTtpQkFDVCxRQUFRLENBQUMsR0FBVCxDQUFhLHdCQUFiLEVBQXVDLElBQXZDO1FBRFMsQ0FBWDtRQUdBLEVBQUEsQ0FBRyxxREFBSCxFQUEwRCxTQUFBO1VBQ3hELEdBQUEsQ0FBSTtZQUFBLEtBQUEsRUFBTyw4QkFBUDtXQUFKO1VBQ0EsTUFBQSxDQUFPLEtBQVAsRUFBYztZQUFBLEtBQUEsRUFBTyw4QkFBUDtXQUFkO1VBQ0EsTUFBQSxDQUFPLEdBQVAsRUFBYztZQUFBLEtBQUEsRUFBTyw4QkFBUDtXQUFkO1VBQ0EsTUFBQSxDQUFPLEdBQVAsRUFBYztZQUFBLEtBQUEsRUFBTyw4QkFBUDtXQUFkO1VBQ0EsTUFBQSxDQUFPLEdBQVAsRUFBYztZQUFBLEtBQUEsRUFBTyw4QkFBUDtXQUFkO1VBQ0EsTUFBQSxDQUFPLEdBQVAsRUFBYztZQUFBLEtBQUEsRUFBTyw4QkFBUDtXQUFkO1VBQ0EsTUFBQSxDQUFPLEdBQVAsRUFBYztZQUFBLEtBQUEsRUFBTyw4QkFBUDtXQUFkO1VBQ0EsTUFBQSxDQUFPLEdBQVAsRUFBYztZQUFBLEtBQUEsRUFBTyw4QkFBUDtXQUFkO1VBQ0EsTUFBQSxDQUFPLEdBQVAsRUFBYztZQUFBLEtBQUEsRUFBTyw4QkFBUDtXQUFkO2lCQUNBLE1BQUEsQ0FBTyxHQUFQLEVBQWM7WUFBQSxLQUFBLEVBQU8sOEJBQVA7V0FBZDtRQVZ3RCxDQUExRDtlQVlBLEVBQUEsQ0FBRyw4REFBSCxFQUFtRSxTQUFBO1VBQ2pFLEdBQUEsQ0FBbUI7WUFBQSxLQUFBLEVBQU8sOEJBQVA7V0FBbkI7VUFDQSxNQUFBLENBQU8sVUFBUCxFQUFtQjtZQUFBLEtBQUEsRUFBTyw4QkFBUDtXQUFuQjtVQUNBLE1BQUEsQ0FBTyxRQUFRLENBQUMsV0FBVyxDQUFDLEdBQXJCLENBQXlCLGFBQXpCLENBQVAsQ0FBK0MsQ0FBQyxRQUFoRCxDQUFBO1VBQ0EsTUFBQSxDQUFPLEtBQVAsRUFBbUI7WUFBQSxLQUFBLEVBQU8sOEJBQVA7V0FBbkI7aUJBQ0EsTUFBQSxDQUFPLFFBQVEsQ0FBQyxXQUFXLENBQUMsR0FBckIsQ0FBeUIsYUFBekIsQ0FBUCxDQUErQyxDQUFDLFVBQWhELENBQUE7UUFMaUUsQ0FBbkU7TUFoQmlDLENBQW5DO01BdUJBLFFBQUEsQ0FBUyxpQkFBVCxFQUE0QixTQUFBO1FBQzFCLFVBQUEsQ0FBVyxTQUFBO2lCQUNULFFBQVEsQ0FBQyxHQUFULENBQWEsaUJBQWIsRUFBZ0MsSUFBaEM7UUFEUyxDQUFYO2VBR0EsRUFBQSxDQUFHLGdDQUFILEVBQXFDLFNBQUE7VUFDbkMsR0FBQSxDQUFjO1lBQUEsS0FBQSxFQUFPLDZDQUFQO1dBQWQ7VUFDQSxNQUFBLENBQU8sS0FBUCxFQUFjO1lBQUEsS0FBQSxFQUFPLDZDQUFQO1dBQWQ7VUFDQSxNQUFBLENBQU8sR0FBUCxFQUFjO1lBQUEsS0FBQSxFQUFPLDZDQUFQO1dBQWQ7VUFDQSxNQUFBLENBQU8sR0FBUCxFQUFjO1lBQUEsS0FBQSxFQUFPLDZDQUFQO1dBQWQ7VUFDQSxNQUFBLENBQU8sR0FBUCxFQUFjO1lBQUEsS0FBQSxFQUFPLDZDQUFQO1dBQWQ7VUFDQSxNQUFBLENBQU8sR0FBUCxFQUFjO1lBQUEsS0FBQSxFQUFPLDZDQUFQO1dBQWQ7VUFDQSxNQUFBLENBQU8sS0FBUCxFQUFjO1lBQUEsS0FBQSxFQUFPLDZDQUFQO1dBQWQ7VUFDQSxNQUFBLENBQU8sS0FBUCxFQUFjO1lBQUEsS0FBQSxFQUFPLDZDQUFQO1dBQWQ7VUFDQSxNQUFBLENBQU8sS0FBUCxFQUFjO1lBQUEsS0FBQSxFQUFPLDZDQUFQO1dBQWQ7aUJBQ0EsTUFBQSxDQUFPLEtBQVAsRUFBYztZQUFBLEtBQUEsRUFBTyw2Q0FBUDtXQUFkO1FBVm1DLENBQXJDO01BSjBCLENBQTVCO01BZ0JBLFFBQUEsQ0FBUyxrQ0FBVCxFQUE2QyxTQUFBO1FBQzNDLFVBQUEsQ0FBVyxTQUFBO1VBQ1QsUUFBUSxDQUFDLEdBQVQsQ0FBYSxjQUFiLEVBQTZCLEVBQTdCO2lCQUVBLE9BQU8sQ0FBQyxXQUFSLENBQW9CLElBQUksQ0FBQyxTQUFTLENBQUMsVUFBZixDQUFBLENBQXBCO1FBSFMsQ0FBWDtlQUtBLFFBQUEsQ0FBUywwQkFBVCxFQUFxQyxTQUFBO1VBQ25DLEVBQUEsQ0FBRyw4QkFBSCxFQUFtQyxTQUFBO0FBQ2pDLGdCQUFBO1lBQUEsR0FBQSxDQUFvQjtjQUFBLEtBQUEsRUFBTyw4QkFBUDthQUFwQjtZQUNBLFNBQUEsQ0FBVSxNQUFWO1lBQ0EsT0FBQSxHQUFVLFFBQVEsQ0FBQyxXQUFXLENBQUM7WUFDL0IsUUFBQSxDQUFTLE9BQVQsRUFBa0IsdUNBQWxCO1lBQ0EsUUFBQSxDQUFTLE9BQVQsRUFBa0IsdUNBQWxCO21CQUNBLE1BQUEsQ0FBTyxPQUFQLEVBQW9CO2NBQUEsS0FBQSxFQUFPLDhCQUFQO2FBQXBCO1VBTmlDLENBQW5DO1VBUUEsRUFBQSxDQUFHLGtDQUFILEVBQXVDLFNBQUE7QUFDckMsZ0JBQUE7WUFBQSxHQUFBLENBQXNCO2NBQUEsS0FBQSxFQUFPLDhCQUFQO2FBQXRCO1lBQ0EsTUFBQSxDQUFPLGFBQVAsRUFBc0I7Y0FBQSxLQUFBLEVBQU8sOEJBQVA7YUFBdEI7WUFDQSxHQUFBLENBQXNCO2NBQUEsS0FBQSxFQUFPLDhCQUFQO2FBQXRCO1lBQ0EsU0FBQSxDQUFVLE9BQVY7WUFDQSxPQUFBLEdBQVUsUUFBUSxDQUFDLFdBQVcsQ0FBQztZQUMvQixRQUFBLENBQVMsT0FBVCxFQUFrQiwyQ0FBbEI7WUFDQSxRQUFBLENBQVMsT0FBVCxFQUFrQiwyQ0FBbEI7bUJBQ0EsTUFBQSxDQUFPLE9BQVAsRUFBb0I7Y0FBQSxLQUFBLEVBQU8sOEJBQVA7YUFBcEI7VUFScUMsQ0FBdkM7aUJBVUEsRUFBQSxDQUFHLCtDQUFILEVBQW9ELFNBQUE7QUFDbEQsZ0JBQUE7WUFBQSxHQUFBLENBQUs7Y0FBQSxLQUFBLEVBQU8sMkNBQVA7YUFBTDtZQUNBLFNBQUEsQ0FBVSxPQUFWO1lBQ0EsT0FBQSxHQUFVLFFBQVEsQ0FBQyxXQUFXLENBQUM7WUFDL0IsUUFBQSxDQUFTLE9BQVQsRUFBa0IsdUNBQWxCO1lBQ0EsUUFBQSxDQUFTLE9BQVQsRUFBa0IsdUNBQWxCO21CQUNBLE1BQUEsQ0FBTyxPQUFQLEVBQWdCO2NBQUEsS0FBQSxFQUFPLG9CQUFQO2NBQTZCLElBQUEsRUFBTSxRQUFuQzthQUFoQjtVQU5rRCxDQUFwRDtRQW5CbUMsQ0FBckM7TUFOMkMsQ0FBN0M7YUFpQ0EsUUFBQSxDQUFTLGNBQVQsRUFBeUIsU0FBQTtRQUN2QixVQUFBLENBQVcsU0FBQTtpQkFFVCxPQUFPLENBQUMsV0FBUixDQUFvQixJQUFJLENBQUMsU0FBUyxDQUFDLFVBQWYsQ0FBQSxDQUFwQjtRQUZTLENBQVg7UUFJQSxRQUFBLENBQVMsZUFBVCxFQUEwQixTQUFBO1VBQ3hCLFVBQUEsQ0FBVyxTQUFBO21CQUNULFFBQVEsQ0FBQyxHQUFULENBQWEsY0FBYixFQUE2QixDQUE3QjtVQURTLENBQVg7aUJBR0EsUUFBQSxDQUFTLDBCQUFULEVBQXFDLFNBQUE7WUFDbkMsRUFBQSxDQUFHLHNCQUFILEVBQTJCLFNBQUE7Y0FDekIsR0FBQSxDQUFnQjtnQkFBQSxLQUFBLEVBQU8sOEJBQVA7ZUFBaEI7Y0FDQSxNQUFBLENBQU8sT0FBUCxFQUFnQjtnQkFBQSxLQUFBLEVBQU8sOEJBQVA7ZUFBaEI7cUJBQ0EsTUFBQSxDQUFPLE9BQVAsRUFBZ0I7Z0JBQUEsS0FBQSxFQUFPLDhCQUFQO2VBQWhCO1lBSHlCLENBQTNCO21CQUtBLEVBQUEsQ0FBRywrQ0FBSCxFQUFvRCxTQUFBO2NBQ2xELEdBQUEsQ0FBb0I7Z0JBQUEsS0FBQSxFQUFPLDhCQUFQO2VBQXBCO2NBQ0EsTUFBQSxDQUFPLFdBQVAsRUFBb0I7Z0JBQUEsS0FBQSxFQUFPLDhCQUFQO2VBQXBCO3FCQUNBLE1BQUEsQ0FBTyxXQUFQLEVBQW9CO2dCQUFBLEtBQUEsRUFBTyw4QkFBUDtlQUFwQjtZQUhrRCxDQUFwRDtVQU5tQyxDQUFyQztRQUp3QixDQUExQjtRQWVBLFFBQUEsQ0FBUyxlQUFULEVBQTBCLFNBQUE7VUFDeEIsVUFBQSxDQUFXLFNBQUE7bUJBQ1QsUUFBUSxDQUFDLEdBQVQsQ0FBYSxjQUFiLEVBQTZCLENBQTdCO1VBRFMsQ0FBWDtpQkFHQSxRQUFBLENBQVMsdUJBQVQsRUFBa0MsU0FBQTttQkFDaEMsRUFBQSxDQUFHLHNDQUFILEVBQTJDLFNBQUE7Y0FDekMsR0FBQSxDQUFzQjtnQkFBQSxLQUFBLEVBQU8sZ0NBQVA7ZUFBdEI7Y0FDQSxNQUFBLENBQU8sYUFBUCxFQUFzQjtnQkFBQSxLQUFBLEVBQU8sZ0NBQVA7ZUFBdEI7Y0FDQSxNQUFBLENBQU8sV0FBUCxFQUFzQjtnQkFBQSxLQUFBLEVBQU8sZ0NBQVA7ZUFBdEI7Y0FDQSxNQUFBLENBQU8sYUFBUCxFQUFzQjtnQkFBQSxLQUFBLEVBQU8sZ0NBQVA7ZUFBdEI7cUJBQ0EsTUFBQSxDQUFPLFNBQVAsRUFBc0I7Z0JBQUEsS0FBQSxFQUFPLGdDQUFQO2VBQXRCO1lBTHlDLENBQTNDO1VBRGdDLENBQWxDO1FBSndCLENBQTFCO2VBWUEsUUFBQSxDQUFTLG9CQUFULEVBQStCLFNBQUE7VUFDN0IsVUFBQSxDQUFXLFNBQUE7WUFDVCxRQUFRLENBQUMsR0FBVCxDQUFhLGNBQWIsRUFBNkIsQ0FBN0I7bUJBQ0EsUUFBUSxDQUFDLEdBQVQsQ0FBYSxzQkFBYixFQUFxQyxHQUFyQztVQUZTLENBQVg7aUJBSUEsRUFBQSxDQUFHLDJDQUFILEVBQWdELFNBQUE7WUFDOUMsR0FBQSxDQUFnQjtjQUFBLEtBQUEsRUFBTyw4QkFBUDthQUFoQjtZQUVBLE1BQUEsQ0FBTyxLQUFQLEVBQWdCO2NBQUEsS0FBQSxFQUFPLDhCQUFQO2FBQWhCO1lBQ0EsWUFBQSxDQUFhLEdBQWI7WUFDQSxNQUFBLENBQWdCO2NBQUEsS0FBQSxFQUFPLDhCQUFQO2FBQWhCO1lBRUEsTUFBQSxDQUFPLE9BQVAsRUFBZ0I7Y0FBQSxLQUFBLEVBQU8sOEJBQVA7YUFBaEI7WUFFQSxNQUFBLENBQU8sS0FBUCxFQUFnQjtjQUFBLEtBQUEsRUFBTyw4QkFBUDthQUFoQjtZQUNBLFlBQUEsQ0FBYSxHQUFiO1lBQ0EsTUFBQSxDQUFnQjtjQUFBLEtBQUEsRUFBTyw4QkFBUDthQUFoQjtZQUVBLE1BQUEsQ0FBTyxLQUFQLEVBQWdCO2NBQUEsS0FBQSxFQUFPLDhCQUFQO2FBQWhCO1lBQ0EsWUFBQSxDQUFhLEdBQWI7bUJBQ0EsTUFBQSxDQUFnQjtjQUFBLEtBQUEsRUFBTyw4QkFBUDthQUFoQjtVQWY4QyxDQUFoRDtRQUw2QixDQUEvQjtNQWhDdUIsQ0FBekI7SUF0RzJDLENBQTdDO0VBcFNzQixDQUF4QjtBQUhBIiwic291cmNlc0NvbnRlbnQiOlsie2dldFZpbVN0YXRlLCBkaXNwYXRjaCwgVGV4dERhdGF9ID0gcmVxdWlyZSAnLi9zcGVjLWhlbHBlcidcbnNldHRpbmdzID0gcmVxdWlyZSAnLi4vbGliL3NldHRpbmdzJ1xuXG5kZXNjcmliZSBcIk1vdGlvbiBGaW5kXCIsIC0+XG4gIFtzZXQsIGVuc3VyZSwga2V5c3Ryb2tlLCBlZGl0b3IsIGVkaXRvckVsZW1lbnQsIHZpbVN0YXRlXSA9IFtdXG5cbiAgYmVmb3JlRWFjaCAtPlxuICAgIHNldHRpbmdzLnNldCgndXNlRXhwZXJpbWVudGFsRmFzdGVySW5wdXQnLCB0cnVlKVxuICAgICMgamFzbWluZS5hdHRhY2hUb0RPTShhdG9tLndvcmtzcGFjZS5nZXRFbGVtZW50KCkpXG5cbiAgICBnZXRWaW1TdGF0ZSAoc3RhdGUsIF92aW0pIC0+XG4gICAgICB2aW1TdGF0ZSA9IHN0YXRlICMgdG8gcmVmZXIgYXMgdmltU3RhdGUgbGF0ZXIuXG4gICAgICB7ZWRpdG9yLCBlZGl0b3JFbGVtZW50fSA9IHZpbVN0YXRlXG4gICAgICB7c2V0LCBlbnN1cmUsIGtleXN0cm9rZX0gPSBfdmltXG5cbiAgeGRlc2NyaWJlICd0aGUgZiBwZXJmb3JtYW5jZScsIC0+XG4gICAgdGltZXNUb0V4ZWN1dGUgPSA1MDBcbiAgICAjIHRpbWVzVG9FeGVjdXRlID0gMVxuICAgIG1lYXN1cmVXaXRoVGltZUVuZCA9IChmbikgLT5cbiAgICAgIGNvbnNvbGUudGltZShmbi5uYW1lKVxuICAgICAgZm4oKVxuICAgICAgIyBjb25zb2xlLmxvZyBcIlt0aW1lLWVuZF1cIlxuICAgICAgY29uc29sZS50aW1lRW5kKGZuLm5hbWUpXG5cbiAgICBtZWFzdXJlV2l0aFBlcmZvcm1hbmNlTm93ID0gKGZuKSAtPlxuICAgICAgdDAgPSBwZXJmb3JtYW5jZS5ub3coKVxuICAgICAgZm4oKVxuICAgICAgdDEgPSBwZXJmb3JtYW5jZS5ub3coKVxuICAgICAgY29uc29sZS5sb2cgXCJbcGVyZm9ybWFuY2Uubm93XSB0b29rICN7dDEgLSB0MH0gbXNlY1wiXG5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXRcbiAgICAgICAgdGV4dDogXCIgIFwiICsgXCJsXCIucmVwZWF0KHRpbWVzVG9FeGVjdXRlKVxuICAgICAgICBjdXJzb3I6IFswLCAwXVxuXG4gICAgeGRlc2NyaWJlICd0aGUgZiByZWFkLWNoYXItdmlhLWtleWJpbmRpbmcgcGVyZm9ybWFuY2UnLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICB2aW1TdGF0ZS51c2VNaW5pRWRpdG9yID0gZmFsc2VcblxuICAgICAgaXQgJ1t3aXRoIGtleWJpbmRdIG1vdmVzIHRvIGwgY2hhcicsIC0+XG4gICAgICAgIHRlc3RQZXJmb3JtYW5jZU9mS2V5YmluZCA9IC0+XG4gICAgICAgICAga2V5c3Ryb2tlIFwiZiBsXCIgZm9yIG4gaW4gWzEuLnRpbWVzVG9FeGVjdXRlXVxuICAgICAgICAgIGVuc3VyZSBjdXJzb3I6IFswLCB0aW1lc1RvRXhlY3V0ZSArIDFdXG5cbiAgICAgICAgY29uc29sZS5sb2cgXCI9PSBrZXliaW5kXCJcbiAgICAgICAgZW5zdXJlIFwiZiBsXCIsIGN1cnNvcjogWzAsIDJdXG4gICAgICAgIHNldCBjdXJzb3I6IFswLCAwXVxuICAgICAgICBtZWFzdXJlV2l0aFRpbWVFbmQodGVzdFBlcmZvcm1hbmNlT2ZLZXliaW5kKVxuICAgICAgICAjIHNldCBjdXJzb3I6IFswLCAwXVxuICAgICAgICAjIG1lYXN1cmVXaXRoUGVyZm9ybWFuY2VOb3codGVzdFBlcmZvcm1hbmNlT2ZLZXliaW5kKVxuXG4gICAgZGVzY3JpYmUgJ1t3aXRoIGhpZGRlbi1pbnB1dF0gbW92ZXMgdG8gbCBjaGFyJywgLT5cbiAgICAgIGl0ICdbd2l0aCBoaWRkZW4taW5wdXRdIG1vdmVzIHRvIGwgY2hhcicsIC0+XG4gICAgICAgIHRlc3RQZXJmb3JtYW5jZU9mSGlkZGVuSW5wdXQgPSAtPlxuICAgICAgICAgIGtleXN0cm9rZSAnZiBsJyBmb3IgbiBpbiBbMS4udGltZXNUb0V4ZWN1dGVdXG4gICAgICAgICAgZW5zdXJlIGN1cnNvcjogWzAsIHRpbWVzVG9FeGVjdXRlICsgMV1cblxuICAgICAgICBjb25zb2xlLmxvZyBcIj09IGhpZGRlblwiXG4gICAgICAgIGVuc3VyZSAnZiBsJywgY3Vyc29yOiBbMCwgMl1cblxuICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgbWVhc3VyZVdpdGhUaW1lRW5kKHRlc3RQZXJmb3JtYW5jZU9mSGlkZGVuSW5wdXQpXG4gICAgICAgICMgc2V0IGN1cnNvcjogWzAsIDBdXG4gICAgICAgICMgbWVhc3VyZVdpdGhQZXJmb3JtYW5jZU5vdyh0ZXN0UGVyZm9ybWFuY2VPZkhpZGRlbklucHV0KVxuXG4gIGRlc2NyaWJlICd0aGUgZi9GIGtleWJpbmRpbmdzJywgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXRcbiAgICAgICAgdGV4dDogXCJhYmNhYmNhYmNhYmNcXG5cIlxuICAgICAgICBjdXJzb3I6IFswLCAwXVxuXG4gICAgaXQgJ21vdmVzIHRvIHRoZSBmaXJzdCBzcGVjaWZpZWQgY2hhcmFjdGVyIGl0IGZpbmRzJywgLT5cbiAgICAgIGVuc3VyZSAnZiBjJywgY3Vyc29yOiBbMCwgMl1cblxuICAgIGl0ICdleHRlbmRzIHZpc3VhbCBzZWxlY3Rpb24gaW4gdmlzdWFsLW1vZGUgYW5kIHJlcGV0YWJsZScsIC0+XG4gICAgICBlbnN1cmUgJ3YnLCBtb2RlOiBbJ3Zpc3VhbCcsICdjaGFyYWN0ZXJ3aXNlJ11cbiAgICAgIGVuc3VyZSAnZiBjJywgc2VsZWN0ZWRUZXh0OiAnYWJjJywgY3Vyc29yOiBbMCwgM11cbiAgICAgIGVuc3VyZSAnOycsIHNlbGVjdGVkVGV4dDogJ2FiY2FiYycsIGN1cnNvcjogWzAsIDZdXG4gICAgICBlbnN1cmUgJywnLCBzZWxlY3RlZFRleHQ6ICdhYmMnLCBjdXJzb3I6IFswLCAzXVxuXG4gICAgaXQgJ21vdmVzIGJhY2t3YXJkcyB0byB0aGUgZmlyc3Qgc3BlY2lmaWVkIGNoYXJhY3RlciBpdCBmaW5kcycsIC0+XG4gICAgICBzZXQgY3Vyc29yOiBbMCwgMl1cbiAgICAgIGVuc3VyZSAnRiBhJywgY3Vyc29yOiBbMCwgMF1cblxuICAgIGl0ICdyZXNwZWN0cyBjb3VudCBmb3J3YXJkJywgLT5cbiAgICAgIGVuc3VyZSAnMiBmIGEnLCBjdXJzb3I6IFswLCA2XVxuXG4gICAgaXQgJ3Jlc3BlY3RzIGNvdW50IGJhY2t3YXJkJywgLT5cbiAgICAgIGN1cnNvcjogWzAsIDZdXG4gICAgICBlbnN1cmUgJzIgRiBhJywgY3Vyc29yOiBbMCwgMF1cblxuICAgIGl0IFwiZG9lc24ndCBtb3ZlIGlmIHRoZSBjaGFyYWN0ZXIgc3BlY2lmaWVkIGlzbid0IGZvdW5kXCIsIC0+XG4gICAgICBlbnN1cmUgJ2YgZCcsIGN1cnNvcjogWzAsIDBdXG5cbiAgICBpdCBcImRvZXNuJ3QgbW92ZSBpZiB0aGVyZSBhcmVuJ3QgdGhlIHNwZWNpZmllZCBjb3VudCBvZiB0aGUgc3BlY2lmaWVkIGNoYXJhY3RlclwiLCAtPlxuICAgICAgZW5zdXJlICcxIDAgZiBhJywgY3Vyc29yOiBbMCwgMF1cbiAgICAgICMgYSBidWcgd2FzIG1ha2luZyB0aGlzIGJlaGF2aW91ciBkZXBlbmQgb24gdGhlIGNvdW50XG4gICAgICBlbnN1cmUgJzEgMSBmIGEnLCBjdXJzb3I6IFswLCAwXVxuICAgICAgIyBhbmQgYmFja3dhcmRzIG5vd1xuICAgICAgc2V0IGN1cnNvcjogWzAsIDZdXG4gICAgICBlbnN1cmUgJzEgMCBGIGEnLCBjdXJzb3I6IFswLCA2XVxuICAgICAgZW5zdXJlICcxIDEgRiBhJywgY3Vyc29yOiBbMCwgNl1cblxuICAgIGl0IFwiY29tcG9zZXMgd2l0aCBkXCIsIC0+XG4gICAgICBzZXQgY3Vyc29yOiBbMCwgM11cbiAgICAgIGVuc3VyZSAnZCAyIGYgYScsIHRleHQ6ICdhYmNiY1xcbidcblxuICAgIGl0IFwiRiBiZWhhdmVzIGV4Y2x1c2l2ZWx5IHdoZW4gY29tcG9zZXMgd2l0aCBvcGVyYXRvclwiLCAtPlxuICAgICAgc2V0IGN1cnNvcjogWzAsIDNdXG4gICAgICBlbnN1cmUgJ2QgRiBhJywgdGV4dDogJ2FiY2FiY2FiY1xcbidcblxuICBkZXNjcmliZSBcImNhbmNlbGxhdGlvblwiLCAtPlxuICAgIGl0IFwia2VlcHMgbXVsdGlwbGUtY3Vyc29ycyB3aGVuIGNhbmNlbGxlZFwiLCAtPlxuICAgICAgc2V0ICAgICAgICAgICAgICAgICB0ZXh0QzogXCJ8ICAgYVxcbiEgICBhXFxufCAgIGFcXG5cIlxuICAgICAgZW5zdXJlIFwiZiBlc2NhcGVcIiwgIHRleHRDOiBcInwgICBhXFxuISAgIGFcXG58ICAgYVxcblwiXG5cbiAgZGVzY3JpYmUgJ3RoZSB0L1Qga2V5YmluZGluZ3MnLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNldFxuICAgICAgICB0ZXh0OiBcImFiY2FiY2FiY2FiY1xcblwiXG4gICAgICAgIGN1cnNvcjogWzAsIDBdXG5cbiAgICBpdCAnbW92ZXMgdG8gdGhlIGNoYXJhY3RlciBwcmV2aW91cyB0byB0aGUgZmlyc3Qgc3BlY2lmaWVkIGNoYXJhY3RlciBpdCBmaW5kcycsIC0+XG4gICAgICBlbnN1cmUgJ3QgYScsIGN1cnNvcjogWzAsIDJdXG4gICAgICAjIG9yIHN0YXlzIHB1dCB3aGVuIGl0J3MgYWxyZWFkeSB0aGVyZVxuICAgICAgZW5zdXJlICd0IGEnLCBjdXJzb3I6IFswLCAyXVxuXG4gICAgaXQgJ21vdmVzIGJhY2t3YXJkcyB0byB0aGUgY2hhcmFjdGVyIGFmdGVyIHRoZSBmaXJzdCBzcGVjaWZpZWQgY2hhcmFjdGVyIGl0IGZpbmRzJywgLT5cbiAgICAgIHNldCBjdXJzb3I6IFswLCAyXVxuICAgICAgZW5zdXJlICdUIGEnLCBjdXJzb3I6IFswLCAxXVxuXG4gICAgaXQgJ3Jlc3BlY3RzIGNvdW50IGZvcndhcmQnLCAtPlxuICAgICAgZW5zdXJlICcyIHQgYScsIGN1cnNvcjogWzAsIDVdXG5cbiAgICBpdCAncmVzcGVjdHMgY291bnQgYmFja3dhcmQnLCAtPlxuICAgICAgc2V0IGN1cnNvcjogWzAsIDZdXG4gICAgICBlbnN1cmUgJzIgVCBhJywgY3Vyc29yOiBbMCwgMV1cblxuICAgIGl0IFwiZG9lc24ndCBtb3ZlIGlmIHRoZSBjaGFyYWN0ZXIgc3BlY2lmaWVkIGlzbid0IGZvdW5kXCIsIC0+XG4gICAgICBlbnN1cmUgJ3QgZCcsIGN1cnNvcjogWzAsIDBdXG5cbiAgICBpdCBcImRvZXNuJ3QgbW92ZSBpZiB0aGVyZSBhcmVuJ3QgdGhlIHNwZWNpZmllZCBjb3VudCBvZiB0aGUgc3BlY2lmaWVkIGNoYXJhY3RlclwiLCAtPlxuICAgICAgZW5zdXJlICcxIDAgdCBkJywgY3Vyc29yOiBbMCwgMF1cbiAgICAgICMgYSBidWcgd2FzIG1ha2luZyB0aGlzIGJlaGF2aW91ciBkZXBlbmQgb24gdGhlIGNvdW50XG4gICAgICBlbnN1cmUgJzEgMSB0IGEnLCBjdXJzb3I6IFswLCAwXVxuICAgICAgIyBhbmQgYmFja3dhcmRzIG5vd1xuICAgICAgc2V0IGN1cnNvcjogWzAsIDZdXG4gICAgICBlbnN1cmUgJzEgMCBUIGEnLCBjdXJzb3I6IFswLCA2XVxuICAgICAgZW5zdXJlICcxIDEgVCBhJywgY3Vyc29yOiBbMCwgNl1cblxuICAgIGl0IFwiY29tcG9zZXMgd2l0aCBkXCIsIC0+XG4gICAgICBzZXQgY3Vyc29yOiBbMCwgM11cbiAgICAgIGVuc3VyZSAnZCAyIHQgYicsXG4gICAgICAgIHRleHQ6ICdhYmNiY2FiY1xcbidcblxuICAgIGl0IFwiZGVsZXRlIGNoYXIgdW5kZXIgY3Vyc29yIGV2ZW4gd2hlbiBubyBtb3ZlbWVudCBoYXBwZW5zIHNpbmNlIGl0J3MgaW5jbHVzaXZlIG1vdGlvblwiLCAtPlxuICAgICAgc2V0IGN1cnNvcjogWzAsIDBdXG4gICAgICBlbnN1cmUgJ2QgdCBiJyxcbiAgICAgICAgdGV4dDogJ2JjYWJjYWJjYWJjXFxuJ1xuICAgIGl0IFwiZG8gbm90aGluZyB3aGVuIGluY2x1c2l2ZW5lc3MgaW52ZXJ0ZWQgYnkgdiBvcGVyYXRvci1tb2RpZmllclwiLCAtPlxuICAgICAgdGV4dDogXCJhYmNhYmNhYmNhYmNcXG5cIlxuICAgICAgc2V0IGN1cnNvcjogWzAsIDBdXG4gICAgICBlbnN1cmUgJ2QgdiB0IGInLFxuICAgICAgICB0ZXh0OiAnYWJjYWJjYWJjYWJjXFxuJ1xuXG4gICAgaXQgXCJUIGJlaGF2ZXMgZXhjbHVzaXZlbHkgd2hlbiBjb21wb3NlcyB3aXRoIG9wZXJhdG9yXCIsIC0+XG4gICAgICBzZXQgY3Vyc29yOiBbMCwgM11cbiAgICAgIGVuc3VyZSAnZCBUIGInLFxuICAgICAgICB0ZXh0OiAnYWJhYmNhYmNhYmNcXG4nXG5cbiAgICBpdCBcIlQgZG9uJ3QgZGVsZXRlIGNoYXJhY3RlciB1bmRlciBjdXJzb3IgZXZlbiB3aGVuIG5vIG1vdmVtZW50IGhhcHBlbnNcIiwgLT5cbiAgICAgIHNldCBjdXJzb3I6IFswLCAzXVxuICAgICAgZW5zdXJlICdkIFQgYycsXG4gICAgICAgIHRleHQ6ICdhYmNhYmNhYmNhYmNcXG4nXG5cbiAgZGVzY3JpYmUgJ3RoZSA7IGFuZCAsIGtleWJpbmRpbmdzJywgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXRcbiAgICAgICAgdGV4dDogXCJhYmNhYmNhYmNhYmNcXG5cIlxuICAgICAgICBjdXJzb3I6IFswLCAwXVxuXG4gICAgaXQgXCJyZXBlYXQgZiBpbiBzYW1lIGRpcmVjdGlvblwiLCAtPlxuICAgICAgZW5zdXJlICdmIGMnLCBjdXJzb3I6IFswLCAyXVxuICAgICAgZW5zdXJlICc7JywgY3Vyc29yOiBbMCwgNV1cbiAgICAgIGVuc3VyZSAnOycsIGN1cnNvcjogWzAsIDhdXG5cbiAgICBpdCBcInJlcGVhdCBGIGluIHNhbWUgZGlyZWN0aW9uXCIsIC0+XG4gICAgICBzZXQgY3Vyc29yOiBbMCwgMTBdXG4gICAgICBlbnN1cmUgJ0YgYycsIGN1cnNvcjogWzAsIDhdXG4gICAgICBlbnN1cmUgJzsnLCBjdXJzb3I6IFswLCA1XVxuICAgICAgZW5zdXJlICc7JywgY3Vyc29yOiBbMCwgMl1cblxuICAgIGl0IFwicmVwZWF0IGYgaW4gb3Bwb3NpdGUgZGlyZWN0aW9uXCIsIC0+XG4gICAgICBzZXQgY3Vyc29yOiBbMCwgNl1cbiAgICAgIGVuc3VyZSAnZiBjJywgY3Vyc29yOiBbMCwgOF1cbiAgICAgIGVuc3VyZSAnLCcsIGN1cnNvcjogWzAsIDVdXG4gICAgICBlbnN1cmUgJywnLCBjdXJzb3I6IFswLCAyXVxuXG4gICAgaXQgXCJyZXBlYXQgRiBpbiBvcHBvc2l0ZSBkaXJlY3Rpb25cIiwgLT5cbiAgICAgIHNldCBjdXJzb3I6IFswLCA0XVxuICAgICAgZW5zdXJlICdGIGMnLCBjdXJzb3I6IFswLCAyXVxuICAgICAgZW5zdXJlICcsJywgY3Vyc29yOiBbMCwgNV1cbiAgICAgIGVuc3VyZSAnLCcsIGN1cnNvcjogWzAsIDhdXG5cbiAgICBpdCBcImFsdGVybmF0ZSByZXBlYXQgZiBpbiBzYW1lIGRpcmVjdGlvbiBhbmQgcmV2ZXJzZVwiLCAtPlxuICAgICAgZW5zdXJlICdmIGMnLCBjdXJzb3I6IFswLCAyXVxuICAgICAgZW5zdXJlICc7JywgY3Vyc29yOiBbMCwgNV1cbiAgICAgIGVuc3VyZSAnLCcsIGN1cnNvcjogWzAsIDJdXG5cbiAgICBpdCBcImFsdGVybmF0ZSByZXBlYXQgRiBpbiBzYW1lIGRpcmVjdGlvbiBhbmQgcmV2ZXJzZVwiLCAtPlxuICAgICAgc2V0IGN1cnNvcjogWzAsIDEwXVxuICAgICAgZW5zdXJlICdGIGMnLCBjdXJzb3I6IFswLCA4XVxuICAgICAgZW5zdXJlICc7JywgY3Vyc29yOiBbMCwgNV1cbiAgICAgIGVuc3VyZSAnLCcsIGN1cnNvcjogWzAsIDhdXG5cbiAgICBpdCBcInJlcGVhdCB0IGluIHNhbWUgZGlyZWN0aW9uXCIsIC0+XG4gICAgICBlbnN1cmUgJ3QgYycsIGN1cnNvcjogWzAsIDFdXG4gICAgICBlbnN1cmUgJzsnLCBjdXJzb3I6IFswLCA0XVxuXG4gICAgaXQgXCJyZXBlYXQgVCBpbiBzYW1lIGRpcmVjdGlvblwiLCAtPlxuICAgICAgc2V0IGN1cnNvcjogWzAsIDEwXVxuICAgICAgZW5zdXJlICdUIGMnLCBjdXJzb3I6IFswLCA5XVxuICAgICAgZW5zdXJlICc7JywgY3Vyc29yOiBbMCwgNl1cblxuICAgIGl0IFwicmVwZWF0IHQgaW4gb3Bwb3NpdGUgZGlyZWN0aW9uIGZpcnN0LCBhbmQgdGhlbiByZXZlcnNlXCIsIC0+XG4gICAgICBzZXQgY3Vyc29yOiBbMCwgM11cbiAgICAgIGVuc3VyZSAndCBjJywgY3Vyc29yOiBbMCwgNF1cbiAgICAgIGVuc3VyZSAnLCcsIGN1cnNvcjogWzAsIDNdXG4gICAgICBlbnN1cmUgJzsnLCBjdXJzb3I6IFswLCA0XVxuXG4gICAgaXQgXCJyZXBlYXQgVCBpbiBvcHBvc2l0ZSBkaXJlY3Rpb24gZmlyc3QsIGFuZCB0aGVuIHJldmVyc2VcIiwgLT5cbiAgICAgIHNldCBjdXJzb3I6IFswLCA0XVxuICAgICAgZW5zdXJlICdUIGMnLCBjdXJzb3I6IFswLCAzXVxuICAgICAgZW5zdXJlICcsJywgY3Vyc29yOiBbMCwgNF1cbiAgICAgIGVuc3VyZSAnOycsIGN1cnNvcjogWzAsIDNdXG5cbiAgICBpdCBcInJlcGVhdCB3aXRoIGNvdW50IGluIHNhbWUgZGlyZWN0aW9uXCIsIC0+XG4gICAgICBzZXQgY3Vyc29yOiBbMCwgMF1cbiAgICAgIGVuc3VyZSAnZiBjJywgY3Vyc29yOiBbMCwgMl1cbiAgICAgIGVuc3VyZSAnMiA7JywgY3Vyc29yOiBbMCwgOF1cblxuICAgIGl0IFwicmVwZWF0IHdpdGggY291bnQgaW4gcmV2ZXJzZSBkaXJlY3Rpb25cIiwgLT5cbiAgICAgIHNldCBjdXJzb3I6IFswLCA2XVxuICAgICAgZW5zdXJlICdmIGMnLCBjdXJzb3I6IFswLCA4XVxuICAgICAgZW5zdXJlICcyICwnLCBjdXJzb3I6IFswLCAyXVxuXG4gIGRlc2NyaWJlIFwibGFzdCBmaW5kL3RpbGwgaXMgcmVwZWF0YWJsZSBvbiBvdGhlciBlZGl0b3JcIiwgLT5cbiAgICBbb3RoZXIsIG90aGVyRWRpdG9yLCBwYW5lXSA9IFtdXG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgZ2V0VmltU3RhdGUgKG90aGVyVmltU3RhdGUsIF9vdGhlcikgLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dDogXCJhIGJheiBiYXJcXG5cIlxuICAgICAgICAgIGN1cnNvcjogWzAsIDBdXG5cbiAgICAgICAgb3RoZXIgPSBfb3RoZXJcbiAgICAgICAgb3RoZXIuc2V0XG4gICAgICAgICAgdGV4dDogXCJmb28gYmFyIGJhelwiLFxuICAgICAgICAgIGN1cnNvcjogWzAsIDBdXG4gICAgICAgIG90aGVyRWRpdG9yID0gb3RoZXJWaW1TdGF0ZS5lZGl0b3JcbiAgICAgICAgIyBqYXNtaW5lLmF0dGFjaFRvRE9NKG90aGVyRWRpdG9yLmVsZW1lbnQpXG5cbiAgICAgICAgcGFuZSA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmUoKVxuICAgICAgICBwYW5lLmFjdGl2YXRlSXRlbShlZGl0b3IpXG5cbiAgICBpdCBcInNoYXJlcyB0aGUgbW9zdCByZWNlbnQgZmluZC90aWxsIGNvbW1hbmQgd2l0aCBvdGhlciBlZGl0b3JzXCIsIC0+XG4gICAgICBlbnN1cmUgJ2YgYicsIGN1cnNvcjogWzAsIDJdXG4gICAgICBvdGhlci5lbnN1cmUgY3Vyc29yOiBbMCwgMF1cblxuICAgICAgIyByZXBsYXkgc2FtZSBmaW5kIGluIHRoZSBvdGhlciBlZGl0b3JcbiAgICAgIHBhbmUuYWN0aXZhdGVJdGVtKG90aGVyRWRpdG9yKVxuICAgICAgb3RoZXIua2V5c3Ryb2tlICc7J1xuICAgICAgZW5zdXJlIGN1cnNvcjogWzAsIDJdXG4gICAgICBvdGhlci5lbnN1cmUgY3Vyc29yOiBbMCwgNF1cblxuICAgICAgIyBkbyBhIHRpbGwgaW4gdGhlIG90aGVyIGVkaXRvclxuICAgICAgb3RoZXIua2V5c3Ryb2tlICd0IHInXG4gICAgICBlbnN1cmUgY3Vyc29yOiBbMCwgMl1cbiAgICAgIG90aGVyLmVuc3VyZSBjdXJzb3I6IFswLCA1XVxuXG4gICAgICAjIGFuZCByZXBsYXkgaW4gdGhlIG5vcm1hbCBlZGl0b3JcbiAgICAgIHBhbmUuYWN0aXZhdGVJdGVtKGVkaXRvcilcbiAgICAgIGVuc3VyZSAnOycsIGN1cnNvcjogWzAsIDddXG4gICAgICBvdGhlci5lbnN1cmUgY3Vyc29yOiBbMCwgNV1cblxuICAgIGl0IFwiaXMgc3RpbGwgcmVwZWF0YWJsZSBhZnRlciBvcmlnaW5hbCBlZGl0b3Igd2FzIGRlc3Ryb3llZFwiLCAtPlxuICAgICAgZW5zdXJlICdmIGInLCBjdXJzb3I6IFswLCAyXVxuICAgICAgb3RoZXIuZW5zdXJlIGN1cnNvcjogWzAsIDBdXG5cbiAgICAgIHBhbmUuYWN0aXZhdGVJdGVtKG90aGVyRWRpdG9yKVxuICAgICAgZWRpdG9yLmRlc3Ryb3koKVxuICAgICAgZXhwZWN0KGVkaXRvci5pc0FsaXZlKCkpLnRvQmUoZmFsc2UpXG4gICAgICBvdGhlci5lbnN1cmUgJzsnLCBjdXJzb3I6IFswLCA0XVxuICAgICAgb3RoZXIuZW5zdXJlICc7JywgY3Vyc29yOiBbMCwgOF1cbiAgICAgIG90aGVyLmVuc3VyZSAnLCcsIGN1cnNvcjogWzAsIDRdXG5cbiAgZGVzY3JpYmUgXCJ2bXAgdW5pcXVlIGZlYXR1cmUgb2YgYGZgIGZhbWlseVwiLCAtPlxuICAgIGRlc2NyaWJlIFwiaWdub3JlQ2FzZUZvckZpbmRcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0dGluZ3Muc2V0KFwiaWdub3JlQ2FzZUZvckZpbmRcIiwgdHJ1ZSlcblxuICAgICAgaXQgXCJpZ25vcmUgY2FzZSB0byBmaW5kXCIsIC0+XG4gICAgICAgIHNldCB0ZXh0QzogXCJ8ICAgIEEgICAgYWIgICAgYSAgICBBYiAgICBhXCJcbiAgICAgICAgZW5zdXJlIFwiZiBhXCIsIHRleHRDOiBcIiAgICB8QSAgICBhYiAgICBhICAgIEFiICAgIGFcIlxuICAgICAgICBlbnN1cmUgXCI7XCIsICAgdGV4dEM6IFwiICAgIEEgICAgfGFiICAgIGEgICAgQWIgICAgYVwiXG4gICAgICAgIGVuc3VyZSBcIjtcIiwgICB0ZXh0QzogXCIgICAgQSAgICBhYiAgICB8YSAgICBBYiAgICBhXCJcbiAgICAgICAgZW5zdXJlIFwiO1wiLCAgIHRleHRDOiBcIiAgICBBICAgIGFiICAgIGEgICAgfEFiICAgIGFcIlxuXG4gICAgZGVzY3JpYmUgXCJ1c2VTbWFydGNhc2VGb3JGaW5kXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldHRpbmdzLnNldChcInVzZVNtYXJ0Y2FzZUZvckZpbmRcIiwgdHJ1ZSlcblxuICAgICAgaXQgXCJpZ25vcmUgY2FzZSB3aGVuIGlucHV0IGlzIGxvd2VyIGNoYXJcIiwgLT5cbiAgICAgICAgc2V0IHRleHRDOiBcInwgICAgQSAgICBhYiAgICBhICAgIEFiICAgIGFcIlxuICAgICAgICBlbnN1cmUgXCJmIGFcIiwgdGV4dEM6IFwiICAgIHxBICAgIGFiICAgIGEgICAgQWIgICAgYVwiXG4gICAgICAgIGVuc3VyZSBcIjtcIiwgICB0ZXh0QzogXCIgICAgQSAgICB8YWIgICAgYSAgICBBYiAgICBhXCJcbiAgICAgICAgZW5zdXJlIFwiO1wiLCAgIHRleHRDOiBcIiAgICBBICAgIGFiICAgIHxhICAgIEFiICAgIGFcIlxuICAgICAgICBlbnN1cmUgXCI7XCIsICAgdGV4dEM6IFwiICAgIEEgICAgYWIgICAgYSAgICB8QWIgICAgYVwiXG5cbiAgICAgIGl0IFwiZmluZCBjYXNlLXNlbnNpdGl2ZWx5IHdoZW4gaW5wdXQgaXMgbGFnZXIgY2hhclwiLCAtPlxuICAgICAgICBzZXQgdGV4dEM6IFwifCAgICBBICAgIGFiICAgIGEgICAgQWIgICAgYVwiXG4gICAgICAgIGVuc3VyZSBcImYgQVwiLCB0ZXh0QzogXCIgICAgfEEgICAgYWIgICAgYSAgICBBYiAgICBhXCJcbiAgICAgICAgZW5zdXJlIFwiZiBBXCIsIHRleHRDOiBcIiAgICBBICAgIGFiICAgIGEgICAgfEFiICAgIGFcIlxuICAgICAgICBlbnN1cmUgXCIsXCIsICAgdGV4dEM6IFwiICAgIHxBICAgIGFiICAgIGEgICAgQWIgICAgYVwiXG4gICAgICAgIGVuc3VyZSBcIjtcIiwgICB0ZXh0QzogXCIgICAgQSAgICBhYiAgICBhICAgIHxBYiAgICBhXCJcblxuICAgIGRlc2NyaWJlIFwicmV1c2VGaW5kRm9yUmVwZWF0RmluZFwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXR0aW5ncy5zZXQoXCJyZXVzZUZpbmRGb3JSZXBlYXRGaW5kXCIsIHRydWUpXG5cbiAgICAgIGl0IFwiY2FuIHJldXNlIGYgYW5kIHQgYXMgOywgRiBhbmQgVCBhcyAnLCcgcmVzcGVjdGl2ZWx5XCIsIC0+XG4gICAgICAgIHNldCB0ZXh0QzogXCJ8ICAgIEEgICAgYWIgICAgYSAgICBBYiAgICBhXCJcbiAgICAgICAgZW5zdXJlIFwiZiBhXCIsIHRleHRDOiBcIiAgICBBICAgIHxhYiAgICBhICAgIEFiICAgIGFcIlxuICAgICAgICBlbnN1cmUgXCJmXCIsICAgdGV4dEM6IFwiICAgIEEgICAgYWIgICAgfGEgICAgQWIgICAgYVwiXG4gICAgICAgIGVuc3VyZSBcImZcIiwgICB0ZXh0QzogXCIgICAgQSAgICBhYiAgICBhICAgIEFiICAgIHxhXCJcbiAgICAgICAgZW5zdXJlIFwiRlwiLCAgIHRleHRDOiBcIiAgICBBICAgIGFiICAgIHxhICAgIEFiICAgIGFcIlxuICAgICAgICBlbnN1cmUgXCJGXCIsICAgdGV4dEM6IFwiICAgIEEgICAgfGFiICAgIGEgICAgQWIgICAgYVwiXG4gICAgICAgIGVuc3VyZSBcInRcIiwgICB0ZXh0QzogXCIgICAgQSAgICBhYiAgIHwgYSAgICBBYiAgICBhXCJcbiAgICAgICAgZW5zdXJlIFwidFwiLCAgIHRleHRDOiBcIiAgICBBICAgIGFiICAgIGEgICAgQWIgICB8IGFcIlxuICAgICAgICBlbnN1cmUgXCJUXCIsICAgdGV4dEM6IFwiICAgIEEgICAgYWIgICAgYXwgICAgQWIgICAgYVwiXG4gICAgICAgIGVuc3VyZSBcIlRcIiwgICB0ZXh0QzogXCIgICAgQSAgICBhfGIgICAgYSAgICBBYiAgICBhXCJcblxuICAgICAgaXQgXCJiZWhhdmUgYXMgbm9ybWFsIGYgaWYgbm8gc3VjY2Vzc2Z1bCBwcmV2aW91cyBmaW5kIHdhcyBleGlzdHNcIiwgLT5cbiAgICAgICAgc2V0ICAgICAgICAgICAgICAgIHRleHRDOiBcIiAgfCAgQSAgICBhYiAgICBhICAgIEFiICAgIGFcIlxuICAgICAgICBlbnN1cmUgXCJmIGVzY2FwZVwiLCB0ZXh0QzogXCIgIHwgIEEgICAgYWIgICAgYSAgICBBYiAgICBhXCJcbiAgICAgICAgZXhwZWN0KHZpbVN0YXRlLmdsb2JhbFN0YXRlLmdldChcImN1cnJlbnRGaW5kXCIpKS50b0JlTnVsbCgpXG4gICAgICAgIGVuc3VyZSBcImYgYVwiLCAgICAgIHRleHRDOiBcIiAgICBBICAgIHxhYiAgICBhICAgIEFiICAgIGFcIlxuICAgICAgICBleHBlY3QodmltU3RhdGUuZ2xvYmFsU3RhdGUuZ2V0KFwiY3VycmVudEZpbmRcIikpLnRvQmVUcnV0aHkoKVxuXG4gICAgZGVzY3JpYmUgXCJmaW5kQWNyb3NzTGluZXNcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0dGluZ3Muc2V0KFwiZmluZEFjcm9zc0xpbmVzXCIsIHRydWUpXG5cbiAgICAgIGl0IFwic2VhcmNoZXMgYWNyb3NzIG11bHRpcGxlIGxpbmVzXCIsIC0+XG4gICAgICAgIHNldCAgICAgICAgICAgdGV4dEM6IFwifDA6ICAgIGEgICAgYVxcbjE6ICAgIGEgICAgYVxcbjI6ICAgIGEgICAgYVxcblwiXG4gICAgICAgIGVuc3VyZSBcImYgYVwiLCB0ZXh0QzogXCIwOiAgICB8YSAgICBhXFxuMTogICAgYSAgICBhXFxuMjogICAgYSAgICBhXFxuXCJcbiAgICAgICAgZW5zdXJlIFwiO1wiLCAgIHRleHRDOiBcIjA6ICAgIGEgICAgfGFcXG4xOiAgICBhICAgIGFcXG4yOiAgICBhICAgIGFcXG5cIlxuICAgICAgICBlbnN1cmUgXCI7XCIsICAgdGV4dEM6IFwiMDogICAgYSAgICBhXFxuMTogICAgfGEgICAgYVxcbjI6ICAgIGEgICAgYVxcblwiXG4gICAgICAgIGVuc3VyZSBcIjtcIiwgICB0ZXh0QzogXCIwOiAgICBhICAgIGFcXG4xOiAgICBhICAgIHxhXFxuMjogICAgYSAgICBhXFxuXCJcbiAgICAgICAgZW5zdXJlIFwiO1wiLCAgIHRleHRDOiBcIjA6ICAgIGEgICAgYVxcbjE6ICAgIGEgICAgYVxcbjI6ICAgIHxhICAgIGFcXG5cIlxuICAgICAgICBlbnN1cmUgXCJGIGFcIiwgdGV4dEM6IFwiMDogICAgYSAgICBhXFxuMTogICAgYSAgICB8YVxcbjI6ICAgIGEgICAgYVxcblwiXG4gICAgICAgIGVuc3VyZSBcInQgYVwiLCB0ZXh0QzogXCIwOiAgICBhICAgIGFcXG4xOiAgICBhICAgIGFcXG4yOiAgIHwgYSAgICBhXFxuXCJcbiAgICAgICAgZW5zdXJlIFwiVCBhXCIsIHRleHRDOiBcIjA6ICAgIGEgICAgYVxcbjE6ICAgIGEgICAgfGFcXG4yOiAgICBhICAgIGFcXG5cIlxuICAgICAgICBlbnN1cmUgXCJUIGFcIiwgdGV4dEM6IFwiMDogICAgYSAgICBhXFxuMTogICAgYXwgICAgYVxcbjI6ICAgIGEgICAgYVxcblwiXG5cbiAgICBkZXNjcmliZSBcImZpbmQtbmV4dC9wcmV2aW91cy1wcmUtY29uZmlybWVkXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldHRpbmdzLnNldChcImZpbmRDaGFyc01heFwiLCAxMClcbiAgICAgICAgIyBUbyBwYXNzIGhsRmluZCBsb2dpYyBpdCByZXF1aXJlIFwidmlzaWJsZVwiIHNjcmVlbiByYW5nZS5cbiAgICAgICAgamFzbWluZS5hdHRhY2hUb0RPTShhdG9tLndvcmtzcGFjZS5nZXRFbGVtZW50KCkpXG5cbiAgICAgIGRlc2NyaWJlIFwiY2FuIGZpbmQgb25lIG9yIHR3byBjaGFyXCIsIC0+XG4gICAgICAgIGl0IFwiYWRqdXN0IHRvIG5leHQtcHJlLWNvbmZpcm1lZFwiLCAtPlxuICAgICAgICAgIHNldCAgICAgICAgICAgICAgICAgdGV4dEM6IFwifCAgICBhICAgIGFiICAgIGEgICAgY2QgICAgYVwiXG4gICAgICAgICAga2V5c3Ryb2tlIFwiZiBhIFwiXG4gICAgICAgICAgZWxlbWVudCA9IHZpbVN0YXRlLmlucHV0RWRpdG9yLmVsZW1lbnRcbiAgICAgICAgICBkaXNwYXRjaChlbGVtZW50LCBcInZpbS1tb2RlLXBsdXM6ZmluZC1uZXh0LXByZS1jb25maXJtZWRcIilcbiAgICAgICAgICBkaXNwYXRjaChlbGVtZW50LCBcInZpbS1tb2RlLXBsdXM6ZmluZC1uZXh0LXByZS1jb25maXJtZWRcIilcbiAgICAgICAgICBlbnN1cmUgXCJlbnRlclwiLCAgICAgdGV4dEM6IFwiICAgIGEgICAgYWIgICAgfGEgICAgY2QgICAgYVwiXG5cbiAgICAgICAgaXQgXCJhZGp1c3QgdG8gcHJldmlvdXMtcHJlLWNvbmZpcm1lZFwiLCAtPlxuICAgICAgICAgIHNldCAgICAgICAgICAgICAgICAgICB0ZXh0QzogXCJ8ICAgIGEgICAgYWIgICAgYSAgICBjZCAgICBhXCJcbiAgICAgICAgICBlbnN1cmUgXCIzIGYgYSBlbnRlclwiLCB0ZXh0QzogXCIgICAgYSAgICBhYiAgICB8YSAgICBjZCAgICBhXCJcbiAgICAgICAgICBzZXQgICAgICAgICAgICAgICAgICAgdGV4dEM6IFwifCAgICBhICAgIGFiICAgIGEgICAgY2QgICAgYVwiXG4gICAgICAgICAga2V5c3Ryb2tlIFwiMyBmIGFcIlxuICAgICAgICAgIGVsZW1lbnQgPSB2aW1TdGF0ZS5pbnB1dEVkaXRvci5lbGVtZW50XG4gICAgICAgICAgZGlzcGF0Y2goZWxlbWVudCwgXCJ2aW0tbW9kZS1wbHVzOmZpbmQtcHJldmlvdXMtcHJlLWNvbmZpcm1lZFwiKVxuICAgICAgICAgIGRpc3BhdGNoKGVsZW1lbnQsIFwidmltLW1vZGUtcGx1czpmaW5kLXByZXZpb3VzLXByZS1jb25maXJtZWRcIilcbiAgICAgICAgICBlbnN1cmUgXCJlbnRlclwiLCAgICAgdGV4dEM6IFwiICAgIHxhICAgIGFiICAgIGEgICAgY2QgICAgYVwiXG5cbiAgICAgICAgaXQgXCJpcyB1c2VmdWwgdG8gc2tpcCBlYXJsaWVyIHNwb3QgaW50ZXJhY3RpdmVsbHlcIiwgLT5cbiAgICAgICAgICBzZXQgIHRleHRDOiAndGV4dCA9IFwidGhpcyBpcyB8XFxcImV4YW1wbGVcXFwiIG9mIHVzZSBjYXNlXCInXG4gICAgICAgICAga2V5c3Ryb2tlICdjIHQgXCInXG4gICAgICAgICAgZWxlbWVudCA9IHZpbVN0YXRlLmlucHV0RWRpdG9yLmVsZW1lbnRcbiAgICAgICAgICBkaXNwYXRjaChlbGVtZW50LCBcInZpbS1tb2RlLXBsdXM6ZmluZC1uZXh0LXByZS1jb25maXJtZWRcIikgIyB0YWJcbiAgICAgICAgICBkaXNwYXRjaChlbGVtZW50LCBcInZpbS1tb2RlLXBsdXM6ZmluZC1uZXh0LXByZS1jb25maXJtZWRcIikgIyB0YWJcbiAgICAgICAgICBlbnN1cmUgXCJlbnRlclwiLCB0ZXh0QzogJ3RleHQgPSBcInRoaXMgaXMgfFwiJywgbW9kZTogXCJpbnNlcnRcIlxuXG4gICAgZGVzY3JpYmUgXCJmaW5kQ2hhcnNNYXhcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgIyBUbyBwYXNzIGhsRmluZCBsb2dpYyBpdCByZXF1aXJlIFwidmlzaWJsZVwiIHNjcmVlbiByYW5nZS5cbiAgICAgICAgamFzbWluZS5hdHRhY2hUb0RPTShhdG9tLndvcmtzcGFjZS5nZXRFbGVtZW50KCkpXG5cbiAgICAgIGRlc2NyaWJlIFwid2l0aCAyIGxlbmd0aFwiLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgc2V0dGluZ3Muc2V0KFwiZmluZENoYXJzTWF4XCIsIDIpXG5cbiAgICAgICAgZGVzY3JpYmUgXCJjYW4gZmluZCBvbmUgb3IgdHdvIGNoYXJcIiwgLT5cbiAgICAgICAgICBpdCBcImNhbiBmaW5kIGJ5IHR3byBjaGFyXCIsIC0+XG4gICAgICAgICAgICBzZXQgICAgICAgICAgICAgdGV4dEM6IFwifCAgICBhICAgIGFiICAgIGEgICAgY2QgICAgYVwiXG4gICAgICAgICAgICBlbnN1cmUgXCJmIGEgYlwiLCB0ZXh0QzogXCIgICAgYSAgICB8YWIgICAgYSAgICBjZCAgICBhXCJcbiAgICAgICAgICAgIGVuc3VyZSBcImYgYyBkXCIsIHRleHRDOiBcIiAgICBhICAgIGFiICAgIGEgICAgfGNkICAgIGFcIlxuXG4gICAgICAgICAgaXQgXCJjYW4gZmluZCBieSBvbmUtY2hhciBieSBjb25maXJtaW5nIGV4cGxpY2l0bHlcIiwgLT5cbiAgICAgICAgICAgIHNldCAgICAgICAgICAgICAgICAgdGV4dEM6IFwifCAgICBhICAgIGFiICAgIGEgICAgY2QgICAgYVwiXG4gICAgICAgICAgICBlbnN1cmUgXCJmIGEgZW50ZXJcIiwgdGV4dEM6IFwiICAgIHxhICAgIGFiICAgIGEgICAgY2QgICAgYVwiXG4gICAgICAgICAgICBlbnN1cmUgXCJmIGMgZW50ZXJcIiwgdGV4dEM6IFwiICAgIGEgICAgYWIgICAgYSAgICB8Y2QgICAgYVwiXG5cbiAgICAgIGRlc2NyaWJlIFwid2l0aCAzIGxlbmd0aFwiLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgc2V0dGluZ3Muc2V0KFwiZmluZENoYXJzTWF4XCIsIDMpXG5cbiAgICAgICAgZGVzY3JpYmUgXCJjYW4gZmluZCAzIGF0IG1heGltdW1cIiwgLT5cbiAgICAgICAgICBpdCBcImNhbiBmaW5kIGJ5IG9uZSBvciB0d28gb3IgdGhyZWUgY2hhclwiLCAtPlxuICAgICAgICAgICAgc2V0ICAgICAgICAgICAgICAgICAgIHRleHRDOiBcInwgICAgYSAgICBhYiAgICBhICAgIGNkICAgIGVmZ1wiXG4gICAgICAgICAgICBlbnN1cmUgXCJmIGEgYiBlbnRlclwiLCB0ZXh0QzogXCIgICAgYSAgICB8YWIgICAgYSAgICBjZCAgICBlZmdcIlxuICAgICAgICAgICAgZW5zdXJlIFwiZiBhIGVudGVyXCIsICAgdGV4dEM6IFwiICAgIGEgICAgYWIgICAgfGEgICAgY2QgICAgZWZnXCJcbiAgICAgICAgICAgIGVuc3VyZSBcImYgYyBkIGVudGVyXCIsIHRleHRDOiBcIiAgICBhICAgIGFiICAgIGEgICAgfGNkICAgIGVmZ1wiXG4gICAgICAgICAgICBlbnN1cmUgXCJmIGUgZiBnXCIsICAgICB0ZXh0QzogXCIgICAgYSAgICBhYiAgICBhICAgIGNkICAgIHxlZmdcIlxuXG4gICAgICBkZXNjcmliZSBcImF1dG9Db25maXJtVGltZW91dFwiLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgc2V0dGluZ3Muc2V0KFwiZmluZENoYXJzTWF4XCIsIDIpXG4gICAgICAgICAgc2V0dGluZ3Muc2V0KFwiZmluZENvbmZpcm1CeVRpbWVvdXRcIiwgNTAwKVxuXG4gICAgICAgIGl0IFwiYXV0by1jb25maXJtIHNpbmdsZS1jaGFyIGlucHV0IG9uIHRpbWVvdXRcIiwgLT5cbiAgICAgICAgICBzZXQgICAgICAgICAgICAgdGV4dEM6IFwifCAgICBhICAgIGFiICAgIGEgICAgY2QgICAgYVwiXG5cbiAgICAgICAgICBlbnN1cmUgXCJmIGFcIiwgICB0ZXh0QzogXCJ8ICAgIGEgICAgYWIgICAgYSAgICBjZCAgICBhXCJcbiAgICAgICAgICBhZHZhbmNlQ2xvY2soNTAwKVxuICAgICAgICAgIGVuc3VyZSAgICAgICAgICB0ZXh0QzogXCIgICAgfGEgICAgYWIgICAgYSAgICBjZCAgICBhXCJcblxuICAgICAgICAgIGVuc3VyZSBcImYgYyBkXCIsIHRleHRDOiBcIiAgICBhICAgIGFiICAgIGEgICAgfGNkICAgIGFcIlxuXG4gICAgICAgICAgZW5zdXJlIFwiZiBhXCIsICAgdGV4dEM6IFwiICAgIGEgICAgYWIgICAgYSAgICB8Y2QgICAgYVwiXG4gICAgICAgICAgYWR2YW5jZUNsb2NrKDUwMClcbiAgICAgICAgICBlbnN1cmUgICAgICAgICAgdGV4dEM6IFwiICAgIGEgICAgYWIgICAgYSAgICBjZCAgICB8YVwiXG5cbiAgICAgICAgICBlbnN1cmUgXCJGIGJcIiwgICB0ZXh0QzogXCIgICAgYSAgICBhYiAgICBhICAgIGNkICAgIHxhXCJcbiAgICAgICAgICBhZHZhbmNlQ2xvY2soNTAwKVxuICAgICAgICAgIGVuc3VyZSAgICAgICAgICB0ZXh0QzogXCIgICAgYSAgICBhfGIgICAgYSAgICBjZCAgICBhXCJcbiJdfQ==
