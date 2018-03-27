(function() {
  var TextData, dispatch, getView, getVimState, ref, settings;

  ref = require('./spec-helper'), getVimState = ref.getVimState, dispatch = ref.dispatch, TextData = ref.TextData, getView = ref.getView;

  settings = require('../lib/settings');

  describe("Occurrence", function() {
    var classList, dispatchSearchCommand, editor, editorElement, ensure, inputSearchText, keystroke, ref1, ref2, searchEditor, searchEditorElement, set, vimState;
    ref1 = [], set = ref1[0], ensure = ref1[1], keystroke = ref1[2], editor = ref1[3], editorElement = ref1[4], vimState = ref1[5], classList = ref1[6];
    ref2 = [], searchEditor = ref2[0], searchEditorElement = ref2[1];
    inputSearchText = function(text) {
      return searchEditor.insertText(text);
    };
    dispatchSearchCommand = function(name) {
      return dispatch(searchEditorElement, name);
    };
    beforeEach(function() {
      getVimState(function(state, vim) {
        vimState = state;
        editor = vimState.editor, editorElement = vimState.editorElement;
        set = vim.set, ensure = vim.ensure, keystroke = vim.keystroke;
        classList = editorElement.classList;
        searchEditor = vimState.searchInput.editor;
        return searchEditorElement = vimState.searchInput.editorElement;
      });
      return runs(function() {
        return jasmine.attachToDOM(editorElement);
      });
    });
    describe("operator-modifier-occurrence", function() {
      beforeEach(function() {
        return set({
          text: "\nooo: xxx: ooo:\n---: ooo: xxx: ooo:\nooo: xxx: ---: xxx: ooo:\nxxx: ---: ooo: ooo:\n\nooo: xxx: ooo:\n---: ooo: xxx: ooo:\nooo: xxx: ---: xxx: ooo:\nxxx: ---: ooo: ooo:\n"
        });
      });
      describe("o modifier", function() {
        return it("change occurrence of cursor word in inner-paragraph", function() {
          set({
            cursor: [1, 0]
          });
          ensure("c o i p", {
            mode: 'insert',
            textC: "\n!: xxx: |:\n---: |: xxx: |:\n|: xxx: ---: xxx: |:\nxxx: ---: |: |:\n\nooo: xxx: ooo:\n---: ooo: xxx: ooo:\nooo: xxx: ---: xxx: ooo:\nxxx: ---: ooo: ooo:\n"
          });
          editor.insertText('===');
          ensure("escape", {
            mode: 'normal',
            textC: "\n==!=: xxx: ==|=:\n---: ==|=: xxx: ==|=:\n==|=: xxx: ---: xxx: ==|=:\nxxx: ---: ==|=: ==|=:\n\nooo: xxx: ooo:\n---: ooo: xxx: ooo:\nooo: xxx: ---: xxx: ooo:\nxxx: ---: ooo: ooo:\n"
          });
          return ensure("} j .", {
            mode: 'normal',
            textC: "\n===: xxx: ===:\n---: ===: xxx: ===:\n===: xxx: ---: xxx: ===:\nxxx: ---: ===: ===:\n\n==!=: xxx: ==|=:\n---: ==|=: xxx: ==|=:\n==|=: xxx: ---: xxx: ==|=:\nxxx: ---: ==|=: ==|=:\n"
          });
        });
      });
      describe("O modifier", function() {
        beforeEach(function() {
          return set({
            textC: "\ncamelCa|se Cases\n\"CaseStudy\" SnakeCase\nUP_CASE\n\nother ParagraphCase"
          });
        });
        return it("delete subword-occurrence in paragraph and repeatable", function() {
          ensure("d O p", {
            textC: "\ncamel| Cases\n\"Study\" Snake\nUP_CASE\n\nother ParagraphCase"
          });
          return ensure("G .", {
            textC: "\ncamel Cases\n\"Study\" Snake\nUP_CASE\n\nother| Paragraph"
          });
        });
      });
      describe("apply various operator to occurrence in various target", function() {
        beforeEach(function() {
          return set({
            textC: "ooo: xxx: o!oo:\n===: ooo: xxx: ooo:\nooo: xxx: ===: xxx: ooo:\nxxx: ===: ooo: ooo:"
          });
        });
        it("upper case inner-word", function() {
          ensure("g U o i l", {
            textC: "OOO: xxx: O!OO:\n===: ooo: xxx: ooo:\nooo: xxx: ===: xxx: ooo:\nxxx: ===: ooo: ooo:"
          });
          ensure("2 j .", {
            textC: "OOO: xxx: OOO:\n===: ooo: xxx: ooo:\nOOO: xxx: =!==: xxx: OOO:\nxxx: ===: ooo: ooo:"
          });
          return ensure("j .", {
            textC: "OOO: xxx: OOO:\n===: ooo: xxx: ooo:\nOOO: xxx: ===: xxx: OOO:\nxxx: ===: O!OO: OOO:"
          });
        });
        return describe("clip to mutation end behavior", function() {
          beforeEach(function() {
            return set({
              textC: "\noo|o:xxx:ooo:\nxxx:ooo:xxx\n\n"
            });
          });
          it("[d o p] delete occurrence and cursor is at mutation end", function() {
            return ensure("d o p", {
              textC: "\n|:xxx::\nxxx::xxx\n\n"
            });
          });
          it("[d o j] delete occurrence and cursor is at mutation end", function() {
            return ensure("d o j", {
              textC: "\n|:xxx::\nxxx::xxx\n\n"
            });
          });
          return it("not clip if original cursor not intersects any occurence-marker", function() {
            ensure('g o', {
              occurrenceText: ['ooo', 'ooo', 'ooo'],
              cursor: [1, 2]
            });
            keystroke('j', {
              cursor: [2, 2]
            });
            return ensure("d p", {
              textC: "\n:xxx::\nxx|x::xxx\n\n"
            });
          });
        });
      });
      describe("auto extend target range to include occurrence", function() {
        var textFinal, textOriginal;
        textOriginal = "This text have 3 instance of 'text' in the whole text.\n";
        textFinal = textOriginal.replace(/text/g, '');
        beforeEach(function() {
          return set({
            text: textOriginal
          });
        });
        it("[from start of 1st]", function() {
          set({
            cursor: [0, 5]
          });
          return ensure('d o $', {
            text: textFinal
          });
        });
        it("[from middle of 1st]", function() {
          set({
            cursor: [0, 7]
          });
          return ensure('d o $', {
            text: textFinal
          });
        });
        it("[from end of last]", function() {
          set({
            cursor: [0, 52]
          });
          return ensure('d o 0', {
            text: textFinal
          });
        });
        return it("[from middle of last]", function() {
          set({
            cursor: [0, 51]
          });
          return ensure('d o 0', {
            text: textFinal
          });
        });
      });
      return describe("select-occurrence", function() {
        beforeEach(function() {
          return set({
            text: "vim-mode-plus vim-mode-plus"
          });
        });
        return describe("what the cursor-word", function() {
          var ensureCursorWord;
          ensureCursorWord = function(initialPoint, arg) {
            var selectedText;
            selectedText = arg.selectedText;
            set({
              cursor: initialPoint
            });
            ensure("g cmd-d i p", {
              selectedText: selectedText,
              mode: ['visual', 'characterwise']
            });
            return ensure("escape", {
              mode: "normal"
            });
          };
          describe("cursor is on normal word", function() {
            return it("pick word but not pick partially matched one [by select]", function() {
              ensureCursorWord([0, 0], {
                selectedText: ['vim', 'vim']
              });
              ensureCursorWord([0, 3], {
                selectedText: ['-', '-', '-', '-']
              });
              ensureCursorWord([0, 4], {
                selectedText: ['mode', 'mode']
              });
              return ensureCursorWord([0, 9], {
                selectedText: ['plus', 'plus']
              });
            });
          });
          describe("cursor is at single white space [by delete]", function() {
            return it("pick single white space only", function() {
              set({
                text: "ooo ooo ooo\n ooo ooo ooo",
                cursor: [0, 3]
              });
              return ensure("d o i p", {
                text: "ooooooooo\nooooooooo"
              });
            });
          });
          return describe("cursor is at sequnce of space [by delete]", function() {
            return it("select sequnce of white spaces including partially mached one", function() {
              set({
                cursor: [0, 3],
                text_: "ooo___ooo ooo\n ooo ooo____ooo________ooo"
              });
              return ensure("d o i p", {
                text_: "oooooo ooo\n ooo ooo ooo  ooo"
              });
            });
          });
        });
      });
    });
    describe("stayOnOccurrence settings", function() {
      beforeEach(function() {
        return set({
          textC: "\naaa, bbb, ccc\nbbb, a|aa, aaa\n"
        });
      });
      describe("when true (= default)", function() {
        return it("keep cursor position after operation finished", function() {
          return ensure('g U o p', {
            textC: "\nAAA, bbb, ccc\nbbb, A|AA, AAA\n"
          });
        });
      });
      return describe("when false", function() {
        beforeEach(function() {
          return settings.set('stayOnOccurrence', false);
        });
        return it("move cursor to start of target as like non-ocurrence operator", function() {
          return ensure('g U o p', {
            textC: "\n|AAA, bbb, ccc\nbbb, AAA, AAA\n"
          });
        });
      });
    });
    describe("from visual-mode.is-narrowed", function() {
      beforeEach(function() {
        return set({
          text: "ooo: xxx: ooo\n|||: ooo: xxx: ooo\nooo: xxx: |||: xxx: ooo\nxxx: |||: ooo: ooo",
          cursor: [0, 0]
        });
      });
      describe("[vC] select-occurrence", function() {
        return it("select cursor-word which intersecting selection then apply upper-case", function() {
          ensure("v 2 j cmd-d", {
            selectedText: ['ooo', 'ooo', 'ooo', 'ooo', 'ooo'],
            mode: ['visual', 'characterwise']
          });
          return ensure("U", {
            text: "OOO: xxx: OOO\n|||: OOO: xxx: OOO\nOOO: xxx: |||: xxx: ooo\nxxx: |||: ooo: ooo",
            numCursors: 5,
            mode: 'normal'
          });
        });
      });
      describe("[vL] select-occurrence", function() {
        return it("select cursor-word which intersecting selection then apply upper-case", function() {
          ensure("5 l V 2 j cmd-d", {
            selectedText: ['xxx', 'xxx', 'xxx', 'xxx'],
            mode: ['visual', 'characterwise']
          });
          return ensure("U", {
            text: "ooo: XXX: ooo\n|||: ooo: XXX: ooo\nooo: XXX: |||: XXX: ooo\nxxx: |||: ooo: ooo",
            numCursors: 4,
            mode: 'normal'
          });
        });
      });
      return describe("[vB] select-occurrence", function() {
        it("select cursor-word which intersecting selection then apply upper-case", function() {
          return ensure("W ctrl-v 2 j $ h cmd-d U", {
            text: "ooo: xxx: OOO\n|||: OOO: xxx: OOO\nooo: xxx: |||: xxx: OOO\nxxx: |||: ooo: ooo",
            numCursors: 4
          });
        });
        return it("pick cursor-word from vB range", function() {
          return ensure("ctrl-v 7 l 2 j o cmd-d U", {
            text: "OOO: xxx: ooo\n|||: OOO: xxx: ooo\nOOO: xxx: |||: xxx: ooo\nxxx: |||: ooo: ooo",
            numCursors: 3
          });
        });
      });
    });
    describe("incremental search integration: change-occurrence-from-search, select-occurrence-from-search", function() {
      beforeEach(function() {
        settings.set('incrementalSearch', true);
        return set({
          text: "ooo: xxx: ooo: 0000\n1: ooo: 22: ooo:\nooo: xxx: |||: xxx: 3333:\n444: |||: ooo: ooo:",
          cursor: [0, 0]
        });
      });
      describe("from normal mode", function() {
        it("select occurrence by pattern match", function() {
          keystroke('/');
          inputSearchText('\\d{3,4}');
          dispatchSearchCommand('vim-mode-plus:select-occurrence-from-search');
          return ensure('i e', {
            selectedText: ['3333', '444', '0000'],
            mode: ['visual', 'characterwise']
          });
        });
        return it("change occurrence by pattern match", function() {
          keystroke('/');
          inputSearchText('^\\w+:');
          dispatchSearchCommand('vim-mode-plus:change-occurrence-from-search');
          ensure('i e', {
            mode: 'insert'
          });
          editor.insertText('hello');
          return ensure({
            text: "hello xxx: ooo: 0000\nhello ooo: 22: ooo:\nhello xxx: |||: xxx: 3333:\nhello |||: ooo: ooo:"
          });
        });
      });
      describe("from visual mode", function() {
        describe("visual characterwise", function() {
          return it("change occurrence in narrowed selection", function() {
            keystroke('v j /');
            inputSearchText('o+');
            dispatchSearchCommand('vim-mode-plus:select-occurrence-from-search');
            return ensure('U', {
              text: "OOO: xxx: OOO: 0000\n1: ooo: 22: ooo:\nooo: xxx: |||: xxx: 3333:\n444: |||: ooo: ooo:"
            });
          });
        });
        describe("visual linewise", function() {
          return it("change occurrence in narrowed selection", function() {
            keystroke('V j /');
            inputSearchText('o+');
            dispatchSearchCommand('vim-mode-plus:select-occurrence-from-search');
            return ensure('U', {
              text: "OOO: xxx: OOO: 0000\n1: OOO: 22: OOO:\nooo: xxx: |||: xxx: 3333:\n444: |||: ooo: ooo:"
            });
          });
        });
        return describe("visual blockwise", function() {
          return it("change occurrence in narrowed selection", function() {
            set({
              cursor: [0, 5]
            });
            keystroke('ctrl-v 2 j 1 0 l /');
            inputSearchText('o+');
            dispatchSearchCommand('vim-mode-plus:select-occurrence-from-search');
            return ensure('U', {
              text: "ooo: xxx: OOO: 0000\n1: OOO: 22: OOO:\nooo: xxx: |||: xxx: 3333:\n444: |||: ooo: ooo:"
            });
          });
        });
      });
      describe("persistent-selection is exists", function() {
        beforeEach(function() {
          atom.keymaps.add("create-persistent-selection", {
            'atom-text-editor.vim-mode-plus:not(.insert-mode)': {
              'm': 'vim-mode-plus:create-persistent-selection'
            }
          });
          set({
            text: "ooo: xxx: ooo:\n|||: ooo: xxx: ooo:\nooo: xxx: |||: xxx: ooo:\nxxx: |||: ooo: ooo:\n",
            cursor: [0, 0]
          });
          return ensure('V j m G m m', {
            persistentSelectionBufferRange: [[[0, 0], [2, 0]], [[3, 0], [4, 0]]]
          });
        });
        describe("when no selection is exists", function() {
          return it("select occurrence in all persistent-selection", function() {
            set({
              cursor: [0, 0]
            });
            keystroke('/');
            inputSearchText('xxx');
            dispatchSearchCommand('vim-mode-plus:select-occurrence-from-search');
            return ensure('U', {
              text: "ooo: XXX: ooo:\n|||: ooo: XXX: ooo:\nooo: xxx: |||: xxx: ooo:\nXXX: |||: ooo: ooo:\n",
              persistentSelectionCount: 0
            });
          });
        });
        return describe("when both exits, operator applied to both", function() {
          return it("select all occurrence in selection", function() {
            set({
              cursor: [0, 0]
            });
            keystroke('V 2 j /');
            inputSearchText('xxx');
            dispatchSearchCommand('vim-mode-plus:select-occurrence-from-search');
            return ensure('U', {
              text: "ooo: XXX: ooo:\n|||: ooo: XXX: ooo:\nooo: XXX: |||: XXX: ooo:\nXXX: |||: ooo: ooo:\n",
              persistentSelectionCount: 0
            });
          });
        });
      });
      return describe("demonstrate persistent-selection's practical scenario", function() {
        var oldGrammar;
        oldGrammar = [][0];
        afterEach(function() {
          return editor.setGrammar(oldGrammar);
        });
        beforeEach(function() {
          atom.keymaps.add("create-persistent-selection", {
            'atom-text-editor.vim-mode-plus:not(.insert-mode)': {
              'm': 'vim-mode-plus:toggle-persistent-selection'
            }
          });
          waitsForPromise(function() {
            return atom.packages.activatePackage('language-coffee-script');
          });
          runs(function() {
            oldGrammar = editor.getGrammar();
            return editor.setGrammar(atom.grammars.grammarForScopeName('source.coffee'));
          });
          return set({
            text: "constructor: (@main, @editor, @statusBarManager) ->\n  @editorElement = @editor.element\n  @emitter = new Emitter\n  @subscriptions = new CompositeDisposable\n  @modeManager = new ModeManager(this)\n  @mark = new MarkManager(this)\n  @register = new RegisterManager(this)\n  @persistentSelections = []\n\n  @highlightSearchSubscription = @editorElement.onDidChangeScrollTop =>\n    @refreshHighlightSearch()\n\n  @operationStack = new OperationStack(this)\n  @cursorStyleManager = new CursorStyleManager(this)\n\nanotherFunc: ->\n  @hello = []"
          });
        });
        return it('change all assignment("=") of current-function to "?="', function() {
          set({
            cursor: [0, 0]
          });
          ensure('j f =', {
            cursor: [1, 17]
          });
          runs(function() {
            var textsInBufferRange, textsInBufferRangeIsAllEqualChar;
            keystroke(['g cmd-d', 'i f', 'm'].join(" "));
            textsInBufferRange = vimState.persistentSelection.getMarkerBufferRanges().map(function(range) {
              return editor.getTextInBufferRange(range);
            });
            textsInBufferRangeIsAllEqualChar = textsInBufferRange.every(function(text) {
              return text === '=';
            });
            expect(textsInBufferRangeIsAllEqualChar).toBe(true);
            expect(vimState.persistentSelection.getMarkers()).toHaveLength(11);
            keystroke('2 l');
            ensure('/ => enter', {
              cursor: [9, 69]
            });
            keystroke("m");
            return expect(vimState.persistentSelection.getMarkers()).toHaveLength(10);
          });
          waitsFor(function() {
            return classList.contains('has-persistent-selection');
          });
          return runs(function() {
            keystroke("ctrl-cmd-g I");
            editor.insertText('?');
            return ensure('escape', {
              text: "constructor: (@main, @editor, @statusBarManager) ->\n  @editorElement ?= @editor.element\n  @emitter ?= new Emitter\n  @subscriptions ?= new CompositeDisposable\n  @modeManager ?= new ModeManager(this)\n  @mark ?= new MarkManager(this)\n  @register ?= new RegisterManager(this)\n  @persistentSelections ?= []\n\n  @highlightSearchSubscription ?= @editorElement.onDidChangeScrollTop =>\n    @refreshHighlightSearch()\n\n  @operationStack ?= new OperationStack(this)\n  @cursorStyleManager ?= new CursorStyleManager(this)\n\nanotherFunc: ->\n  @hello = []"
            });
          });
        });
      });
    });
    describe("preset occurrence marker", function() {
      beforeEach(function() {
        return set({
          text: "This text have 3 instance of 'text' in the whole text",
          cursor: [0, 0]
        });
      });
      describe("toggle-preset-occurrence commands", function() {
        describe("in normal-mode", function() {
          describe("add preset occurrence", function() {
            return it('set cursor-ward as preset occurrence marker and not move cursor', function() {
              ensure('g o', {
                occurrenceText: 'This',
                cursor: [0, 0]
              });
              ensure('w', {
                cursor: [0, 5]
              });
              return ensure('g o', {
                occurrenceText: ['This', 'text', 'text', 'text'],
                cursor: [0, 5]
              });
            });
          });
          describe("remove preset occurrence", function() {
            it('removes occurrence one by one separately', function() {
              ensure('g o', {
                occurrenceText: 'This',
                cursor: [0, 0]
              });
              ensure('w', {
                cursor: [0, 5]
              });
              ensure('g o', {
                occurrenceText: ['This', 'text', 'text', 'text'],
                cursor: [0, 5]
              });
              ensure('g o', {
                occurrenceText: ['This', 'text', 'text'],
                cursor: [0, 5]
              });
              return ensure('b g o', {
                occurrenceText: ['text', 'text'],
                cursor: [0, 0]
              });
            });
            it('removes all occurrence in this editor by escape', function() {
              ensure('g o', {
                occurrenceText: 'This',
                cursor: [0, 0]
              });
              ensure('w', {
                cursor: [0, 5]
              });
              ensure('g o', {
                occurrenceText: ['This', 'text', 'text', 'text'],
                cursor: [0, 5]
              });
              return ensure('escape', {
                occurrenceCount: 0
              });
            });
            return it('can recall previously set occurence pattern by `g .`', function() {
              ensure('w v l g o', {
                occurrenceText: ['te', 'te', 'te'],
                cursor: [0, 6]
              });
              ensure('escape', {
                occurrenceCount: 0
              });
              expect(vimState.globalState.get('lastOccurrencePattern')).toEqual(/te/g);
              ensure('w', {
                cursor: [0, 10]
              });
              ensure('g .', {
                occurrenceText: ['te', 'te', 'te'],
                cursor: [0, 10]
              });
              ensure('g U o $', {
                textC: "This text |HAVE 3 instance of 'text' in the whole text"
              });
              return expect(vimState.globalState.get('lastOccurrencePattern')).toEqual(/te/g);
            });
          });
          describe("restore last occurrence marker by add-preset-occurrence-from-last-occurrence-pattern", function() {
            beforeEach(function() {
              return set({
                textC: "camel\ncamelCase\ncamels\ncamel"
              });
            });
            it("can restore occurrence-marker added by `g o` in normal-mode", function() {
              set({
                cursor: [0, 0]
              });
              ensure("g o", {
                occurrenceText: ['camel', 'camel']
              });
              ensure('escape', {
                occurrenceCount: 0
              });
              return ensure("g .", {
                occurrenceText: ['camel', 'camel']
              });
            });
            it("can restore occurrence-marker added by `g o` in visual-mode", function() {
              set({
                cursor: [0, 0]
              });
              ensure("v i w", {
                selectedText: "camel"
              });
              ensure("g o", {
                occurrenceText: ['camel', 'camel', 'camel', 'camel']
              });
              ensure('escape', {
                occurrenceCount: 0
              });
              return ensure("g .", {
                occurrenceText: ['camel', 'camel', 'camel', 'camel']
              });
            });
            return it("can restore occurrence-marker added by `g O` in normal-mode", function() {
              set({
                cursor: [0, 0]
              });
              ensure("g O", {
                occurrenceText: ['camel', 'camel', 'camel']
              });
              ensure('escape', {
                occurrenceCount: 0
              });
              return ensure("g .", {
                occurrenceText: ['camel', 'camel', 'camel']
              });
            });
          });
          return describe("css class has-occurrence", function() {
            describe("manually toggle by toggle-preset-occurrence command", function() {
              return it('is auto-set/unset wheter at least one preset-occurrence was exists or not', function() {
                expect(classList.contains('has-occurrence')).toBe(false);
                ensure('g o', {
                  occurrenceText: 'This',
                  cursor: [0, 0]
                });
                expect(classList.contains('has-occurrence')).toBe(true);
                ensure('g o', {
                  occurrenceCount: 0,
                  cursor: [0, 0]
                });
                return expect(classList.contains('has-occurrence')).toBe(false);
              });
            });
            return describe("change 'INSIDE' of marker", function() {
              var markerLayerUpdated;
              markerLayerUpdated = null;
              beforeEach(function() {
                return markerLayerUpdated = false;
              });
              return it('destroy marker and reflect to "has-occurrence" CSS', function() {
                runs(function() {
                  expect(classList.contains('has-occurrence')).toBe(false);
                  ensure('g o', {
                    occurrenceText: 'This',
                    cursor: [0, 0]
                  });
                  expect(classList.contains('has-occurrence')).toBe(true);
                  ensure('l i', {
                    mode: 'insert'
                  });
                  vimState.occurrenceManager.markerLayer.onDidUpdate(function() {
                    return markerLayerUpdated = true;
                  });
                  editor.insertText('--');
                  return ensure("escape", {
                    textC: "T-|-his text have 3 instance of 'text' in the whole text",
                    mode: 'normal'
                  });
                });
                waitsFor(function() {
                  return markerLayerUpdated;
                });
                return runs(function() {
                  ensure({
                    occurrenceCount: 0
                  });
                  return expect(classList.contains('has-occurrence')).toBe(false);
                });
              });
            });
          });
        });
        describe("in visual-mode", function() {
          describe("add preset occurrence", function() {
            return it('set selected-text as preset occurrence marker and not move cursor', function() {
              ensure('w v l', {
                mode: ['visual', 'characterwise'],
                selectedText: 'te'
              });
              return ensure('g o', {
                mode: 'normal',
                occurrenceText: ['te', 'te', 'te']
              });
            });
          });
          return describe("is-narrowed selection", function() {
            var textOriginal;
            textOriginal = [][0];
            beforeEach(function() {
              textOriginal = "This text have 3 instance of 'text' in the whole text\nThis text have 3 instance of 'text' in the whole text\n";
              return set({
                cursor: [0, 0],
                text: textOriginal
              });
            });
            return it("pick ocurrence-word from cursor position and continue visual-mode", function() {
              ensure('w V j', {
                mode: ['visual', 'linewise'],
                selectedText: textOriginal
              });
              ensure('g o', {
                mode: ['visual', 'linewise'],
                selectedText: textOriginal,
                occurrenceText: ['text', 'text', 'text', 'text', 'text', 'text']
              });
              return ensure('r !', {
                mode: 'normal',
                text: "This !!!! have 3 instance of '!!!!' in the whole !!!!\nThis !!!! have 3 instance of '!!!!' in the whole !!!!\n"
              });
            });
          });
        });
        return describe("in incremental-search", function() {
          beforeEach(function() {
            return settings.set('incrementalSearch', true);
          });
          return describe("add-occurrence-pattern-from-search", function() {
            return it('mark as occurrence which matches regex entered in search-ui', function() {
              keystroke('/');
              inputSearchText('\\bt\\w+');
              dispatchSearchCommand('vim-mode-plus:add-occurrence-pattern-from-search');
              return ensure({
                occurrenceText: ['text', 'text', 'the', 'text']
              });
            });
          });
        });
      });
      describe("mutate preset occurrence", function() {
        beforeEach(function() {
          set({
            text: "ooo: xxx: ooo xxx: ooo:\n!!!: ooo: xxx: ooo xxx: ooo:"
          });
          return {
            cursor: [0, 0]
          };
        });
        describe("normal-mode", function() {
          it('[delete] apply operation to preset-marker intersecting selected target', function() {
            return ensure('l g o D', {
              text: ": xxx:  xxx: :\n!!!: ooo: xxx: ooo xxx: ooo:"
            });
          });
          it('[upcase] apply operation to preset-marker intersecting selected target', function() {
            set({
              cursor: [0, 6]
            });
            return ensure('l g o g U j', {
              text: "ooo: XXX: ooo XXX: ooo:\n!!!: ooo: XXX: ooo XXX: ooo:"
            });
          });
          it('[upcase exclude] won\'t mutate removed marker', function() {
            set({
              cursor: [0, 0]
            });
            ensure('g o', {
              occurrenceCount: 6
            });
            ensure('g o', {
              occurrenceCount: 5
            });
            return ensure('g U j', {
              text: "ooo: xxx: OOO xxx: OOO:\n!!!: OOO: xxx: OOO xxx: OOO:"
            });
          });
          it('[delete] apply operation to preset-marker intersecting selected target', function() {
            set({
              cursor: [0, 10]
            });
            return ensure('g o g U $', {
              text: "ooo: xxx: OOO xxx: OOO:\n!!!: ooo: xxx: ooo xxx: ooo:"
            });
          });
          it('[change] apply operation to preset-marker intersecting selected target', function() {
            ensure('l g o C', {
              mode: 'insert',
              text: ": xxx:  xxx: :\n!!!: ooo: xxx: ooo xxx: ooo:"
            });
            editor.insertText('YYY');
            return ensure('l g o C', {
              mode: 'insert',
              text: "YYY: xxx: YYY xxx: YYY:\n!!!: ooo: xxx: ooo xxx: ooo:",
              numCursors: 3
            });
          });
          return describe("predefined keymap on when has-occurrence", function() {
            beforeEach(function() {
              return set({
                textC: "Vim is editor I used before\nV|im is editor I used before\nVim is editor I used before\nVim is editor I used before"
              });
            });
            it('[insert-at-start] apply operation to preset-marker intersecting selected target', function() {
              ensure('g o', {
                occurrenceText: ['Vim', 'Vim', 'Vim', 'Vim']
              });
              classList.contains('has-occurrence');
              ensure('v k I', {
                mode: 'insert',
                numCursors: 2
              });
              editor.insertText("pure-");
              return ensure('escape', {
                mode: 'normal',
                textC: "pure!-Vim is editor I used before\npure|-Vim is editor I used before\nVim is editor I used before\nVim is editor I used before"
              });
            });
            return it('[insert-after-start] apply operation to preset-marker intersecting selected target', function() {
              set({
                cursor: [1, 1]
              });
              ensure('g o', {
                occurrenceText: ['Vim', 'Vim', 'Vim', 'Vim']
              });
              classList.contains('has-occurrence');
              ensure('v j A', {
                mode: 'insert',
                numCursors: 2
              });
              editor.insertText(" and Emacs");
              return ensure('escape', {
                mode: 'normal',
                textC: "Vim is editor I used before\nVim and Emac|s is editor I used before\nVim and Emac!s is editor I used before\nVim is editor I used before"
              });
            });
          });
        });
        describe("visual-mode", function() {
          return it('[upcase] apply to preset-marker as long as it intersects selection', function() {
            set({
              textC: "ooo: x|xx: ooo xxx: ooo:\nxxx: ooo: xxx: ooo xxx: ooo:"
            });
            ensure('g o', {
              occurrenceCount: 5
            });
            return ensure('v j U', {
              text: "ooo: XXX: ooo XXX: ooo:\nXXX: ooo: xxx: ooo xxx: ooo:"
            });
          });
        });
        describe("visual-linewise-mode", function() {
          return it('[upcase] apply to preset-marker as long as it intersects selection', function() {
            set({
              cursor: [0, 6],
              text: "ooo: xxx: ooo xxx: ooo:\nxxx: ooo: xxx: ooo xxx: ooo:"
            });
            ensure('g o', {
              occurrenceCount: 5
            });
            return ensure('V U', {
              text: "ooo: XXX: ooo XXX: ooo:\nxxx: ooo: xxx: ooo xxx: ooo:"
            });
          });
        });
        return describe("visual-blockwise-mode", function() {
          return it('[upcase] apply to preset-marker as long as it intersects selection', function() {
            set({
              cursor: [0, 6],
              text: "ooo: xxx: ooo xxx: ooo:\nxxx: ooo: xxx: ooo xxx: ooo:"
            });
            ensure('g o', {
              occurrenceCount: 5
            });
            return ensure('ctrl-v j 2 w U', {
              text: "ooo: XXX: ooo xxx: ooo:\nxxx: ooo: XXX: ooo xxx: ooo:"
            });
          });
        });
      });
      describe("MoveToNextOccurrence, MoveToPreviousOccurrence", function() {
        beforeEach(function() {
          set({
            textC: "|ooo: xxx: ooo\n___: ooo: xxx:\nooo: xxx: ooo:"
          });
          return ensure('g o', {
            occurrenceText: ['ooo', 'ooo', 'ooo', 'ooo', 'ooo']
          });
        });
        describe("tab, shift-tab", function() {
          describe("cursor is at start of occurrence", function() {
            return it("search next/previous occurrence marker", function() {
              ensure('tab tab', {
                cursor: [1, 5]
              });
              ensure('2 tab', {
                cursor: [2, 10]
              });
              ensure('2 shift-tab', {
                cursor: [1, 5]
              });
              return ensure('2 shift-tab', {
                cursor: [0, 0]
              });
            });
          });
          return describe("when cursor is inside of occurrence", function() {
            beforeEach(function() {
              ensure("escape", {
                occurrenceCount: 0
              });
              set({
                textC: "oooo oo|oo oooo"
              });
              return ensure('g o', {
                occurrenceCount: 3
              });
            });
            describe("tab", function() {
              return it("move to next occurrence", function() {
                return ensure('tab', {
                  textC: 'oooo oooo |oooo'
                });
              });
            });
            return describe("shift-tab", function() {
              return it("move to previous occurrence", function() {
                return ensure('shift-tab', {
                  textC: '|oooo oooo oooo'
                });
              });
            });
          });
        });
        describe("as operator's target", function() {
          describe("tab", function() {
            it("operate on next occurrence and repeatable", function() {
              ensure("g U tab", {
                text: "OOO: xxx: OOO\n___: ooo: xxx:\nooo: xxx: ooo:",
                occurrenceCount: 3
              });
              ensure(".", {
                text: "OOO: xxx: OOO\n___: OOO: xxx:\nooo: xxx: ooo:",
                occurrenceCount: 2
              });
              ensure("2 .", {
                text: "OOO: xxx: OOO\n___: OOO: xxx:\nOOO: xxx: OOO:",
                occurrenceCount: 0
              });
              return expect(classList.contains('has-occurrence')).toBe(false);
            });
            return it("[o-modifier] operate on next occurrence and repeatable", function() {
              ensure("escape", {
                mode: 'normal',
                occurrenceCount: 0
              });
              ensure("g U o tab", {
                text: "OOO: xxx: OOO\n___: ooo: xxx:\nooo: xxx: ooo:",
                occurrenceCount: 0
              });
              ensure(".", {
                text: "OOO: xxx: OOO\n___: OOO: xxx:\nooo: xxx: ooo:",
                occurrenceCount: 0
              });
              return ensure("2 .", {
                text: "OOO: xxx: OOO\n___: OOO: xxx:\nOOO: xxx: OOO:",
                occurrenceCount: 0
              });
            });
          });
          return describe("shift-tab", function() {
            return it("operate on next previous and repeatable", function() {
              set({
                cursor: [2, 10]
              });
              ensure("g U shift-tab", {
                text: "ooo: xxx: ooo\n___: ooo: xxx:\nOOO: xxx: OOO:",
                occurrenceCount: 3
              });
              ensure(".", {
                text: "ooo: xxx: ooo\n___: OOO: xxx:\nOOO: xxx: OOO:",
                occurrenceCount: 2
              });
              ensure("2 .", {
                text: "OOO: xxx: OOO\n___: OOO: xxx:\nOOO: xxx: OOO:",
                occurrenceCount: 0
              });
              return expect(classList.contains('has-occurrence')).toBe(false);
            });
          });
        });
        describe("excude particular occurence by `.` repeat", function() {
          it("clear preset-occurrence and move to next", function() {
            return ensure('2 tab . g U i p', {
              textC: "OOO: xxx: OOO\n___: |ooo: xxx:\nOOO: xxx: OOO:"
            });
          });
          return it("clear preset-occurrence and move to previous", function() {
            return ensure('2 shift-tab . g U i p', {
              textC: "OOO: xxx: OOO\n___: OOO: xxx:\n|ooo: xxx: OOO:"
            });
          });
        });
        return describe("when multiple preset-occurrence created at different timing", function() {
          beforeEach(function() {
            set({
              cursor: [0, 5]
            });
            return ensure('g o', {
              occurrenceText: ['ooo', 'ooo', 'ooo', 'ooo', 'ooo', 'xxx', 'xxx', 'xxx']
            });
          });
          return it("visit occurrences ordered by buffer position", function() {
            ensure("tab", {
              textC: "ooo: xxx: |ooo\n___: ooo: xxx:\nooo: xxx: ooo:"
            });
            ensure("tab", {
              textC: "ooo: xxx: ooo\n___: |ooo: xxx:\nooo: xxx: ooo:"
            });
            ensure("tab", {
              textC: "ooo: xxx: ooo\n___: ooo: |xxx:\nooo: xxx: ooo:"
            });
            ensure("tab", {
              textC: "ooo: xxx: ooo\n___: ooo: xxx:\n|ooo: xxx: ooo:"
            });
            ensure("tab", {
              textC: "ooo: xxx: ooo\n___: ooo: xxx:\nooo: |xxx: ooo:"
            });
            ensure("tab", {
              textC: "ooo: xxx: ooo\n___: ooo: xxx:\nooo: xxx: |ooo:"
            });
            ensure("shift-tab", {
              textC: "ooo: xxx: ooo\n___: ooo: xxx:\nooo: |xxx: ooo:"
            });
            ensure("shift-tab", {
              textC: "ooo: xxx: ooo\n___: ooo: xxx:\n|ooo: xxx: ooo:"
            });
            ensure("shift-tab", {
              textC: "ooo: xxx: ooo\n___: ooo: |xxx:\nooo: xxx: ooo:"
            });
            ensure("shift-tab", {
              textC: "ooo: xxx: ooo\n___: |ooo: xxx:\nooo: xxx: ooo:"
            });
            return ensure("shift-tab", {
              textC: "ooo: xxx: |ooo\n___: ooo: xxx:\nooo: xxx: ooo:"
            });
          });
        });
      });
      describe("explict operator-modifier o and preset-marker", function() {
        beforeEach(function() {
          return set({
            textC: "|ooo: xxx: ooo xxx: ooo:\n___: ooo: xxx: ooo xxx: ooo:"
          });
        });
        describe("'o' modifier when preset occurrence already exists", function() {
          return it("'o' always pick cursor-word and overwrite existing preset marker)", function() {
            ensure("g o", {
              occurrenceText: ["ooo", "ooo", "ooo", "ooo", "ooo", "ooo"]
            });
            ensure("2 w d o", {
              occurrenceText: ["xxx", "xxx", "xxx", "xxx"],
              mode: 'operator-pending'
            });
            return ensure("j", {
              text: "ooo: : ooo : ooo:\n___: ooo: : ooo : ooo:",
              mode: 'normal'
            });
          });
        });
        return describe("occurrence bound operator don't overwite pre-existing preset marker", function() {
          return it("'o' always pick cursor-word and clear existing preset marker", function() {
            ensure("g o", {
              occurrenceText: ["ooo", "ooo", "ooo", "ooo", "ooo", "ooo"]
            });
            ensure("2 w g cmd-d", {
              occurrenceText: ["ooo", "ooo", "ooo", "ooo", "ooo", "ooo"],
              mode: 'operator-pending'
            });
            return ensure("j", {
              selectedText: ["ooo", "ooo", "ooo", "ooo", "ooo", "ooo"]
            });
          });
        });
      });
      return describe("toggle-preset-subword-occurrence commands", function() {
        beforeEach(function() {
          return set({
            textC: "\ncamelCa|se Cases\n\"CaseStudy\" SnakeCase\nUP_CASE\n\nother ParagraphCase"
          });
        });
        return describe("add preset subword-occurrence", function() {
          return it("mark subword under cursor", function() {
            return ensure('g O', {
              occurrenceText: ['Case', 'Case', 'Case', 'Case']
            });
          });
        });
      });
    });
    return describe("linewise-bound-operation in occurrence operation", function() {
      beforeEach(function() {
        waitsForPromise(function() {
          return atom.packages.activatePackage("language-javascript");
        });
        return runs(function() {
          return set({
            grammar: 'source.js',
            textC: "function hello(name) {\n  console.log(\"debug-1\")\n  |console.log(\"debug-2\")\n\n  const greeting = \"hello\"\n  console.log(\"debug-3\")\n\n  console.log(\"debug-4, includ `console` word\")\n  returrn name + \" \" + greeting\n}"
          });
        });
      });
      describe("with preset-occurrence", function() {
        it("works characterwise for `delete` operator", function() {
          ensure("g o v i f", {
            mode: ['visual', 'linewise']
          });
          return ensure("d", {
            textC: "function hello(name) {\n  |.log(\"debug-1\")\n  .log(\"debug-2\")\n\n  const greeting = \"hello\"\n  .log(\"debug-3\")\n\n  .log(\"debug-4, includ `` word\")\n  returrn name + \" \" + greeting\n}"
          });
        });
        return it("works linewise for `delete-line` operator", function() {
          return ensure("g o v i f D", {
            textC: "function hello(name) {\n|\n  const greeting = \"hello\"\n\n  returrn name + \" \" + greeting\n}"
          });
        });
      });
      describe("when specified both o and V operator-modifier", function() {
        it("delete `console` including line by `V` modifier", function() {
          return ensure("d o V f", {
            textC: "function hello(name) {\n|\n  const greeting = \"hello\"\n\n  returrn name + \" \" + greeting\n}"
          });
        });
        return it("upper-case `console` including line by `V` modifier", function() {
          return ensure("g U o V f", {
            textC: "function hello(name) {\n  CONSOLE.LOG(\"DEBUG-1\")\n  |CONSOLE.LOG(\"DEBUG-2\")\n\n  const greeting = \"hello\"\n  CONSOLE.LOG(\"DEBUG-3\")\n\n  CONSOLE.LOG(\"DEBUG-4, INCLUD `CONSOLE` WORD\")\n  returrn name + \" \" + greeting\n}"
          });
        });
      });
      return describe("with o operator-modifier", function() {
        return it("toggle-line-comments of `occurrence` inclding **lines**", function() {
          ensure("g / o f", {
            textC: "function hello(name) {\n  // console.log(\"debug-1\")\n  // |console.log(\"debug-2\")\n\n  const greeting = \"hello\"\n  // console.log(\"debug-3\")\n\n  // console.log(\"debug-4, includ `console` word\")\n  returrn name + \" \" + greeting\n}"
          });
          return ensure('.', {
            textC: "function hello(name) {\n  console.log(\"debug-1\")\n  |console.log(\"debug-2\")\n\n  const greeting = \"hello\"\n  console.log(\"debug-3\")\n\n  console.log(\"debug-4, includ `console` word\")\n  returrn name + \" \" + greeting\n}"
          });
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9zcGVjL29jY3VycmVuY2Utc3BlYy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLE1BQTZDLE9BQUEsQ0FBUSxlQUFSLENBQTdDLEVBQUMsNkJBQUQsRUFBYyx1QkFBZCxFQUF3Qix1QkFBeEIsRUFBa0M7O0VBQ2xDLFFBQUEsR0FBVyxPQUFBLENBQVEsaUJBQVI7O0VBRVgsUUFBQSxDQUFTLFlBQVQsRUFBdUIsU0FBQTtBQUNyQixRQUFBO0lBQUEsT0FBdUUsRUFBdkUsRUFBQyxhQUFELEVBQU0sZ0JBQU4sRUFBYyxtQkFBZCxFQUF5QixnQkFBekIsRUFBaUMsdUJBQWpDLEVBQWdELGtCQUFoRCxFQUEwRDtJQUMxRCxPQUFzQyxFQUF0QyxFQUFDLHNCQUFELEVBQWU7SUFDZixlQUFBLEdBQWtCLFNBQUMsSUFBRDthQUNoQixZQUFZLENBQUMsVUFBYixDQUF3QixJQUF4QjtJQURnQjtJQUVsQixxQkFBQSxHQUF3QixTQUFDLElBQUQ7YUFDdEIsUUFBQSxDQUFTLG1CQUFULEVBQThCLElBQTlCO0lBRHNCO0lBR3hCLFVBQUEsQ0FBVyxTQUFBO01BQ1QsV0FBQSxDQUFZLFNBQUMsS0FBRCxFQUFRLEdBQVI7UUFDVixRQUFBLEdBQVc7UUFDVix3QkFBRCxFQUFTO1FBQ1IsYUFBRCxFQUFNLG1CQUFOLEVBQWM7UUFDZCxTQUFBLEdBQVksYUFBYSxDQUFDO1FBQzFCLFlBQUEsR0FBZSxRQUFRLENBQUMsV0FBVyxDQUFDO2VBQ3BDLG1CQUFBLEdBQXNCLFFBQVEsQ0FBQyxXQUFXLENBQUM7TUFOakMsQ0FBWjthQVFBLElBQUEsQ0FBSyxTQUFBO2VBQ0gsT0FBTyxDQUFDLFdBQVIsQ0FBb0IsYUFBcEI7TUFERyxDQUFMO0lBVFMsQ0FBWDtJQVlBLFFBQUEsQ0FBUyw4QkFBVCxFQUF5QyxTQUFB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QSxFQUFPLG9QQUFQO1dBREY7aUJBYUEsTUFBQSxDQUFPLEdBQVAsRUFDRTtZQUFBLEtBQUEsRUFBTyx3T0FBUDtXQURGO1FBZDRELENBQTlEO01BRG1DLENBQXJDO0lBeEUyRCxDQUE3RDtFQWpoQ3FCLENBQXZCO0FBSEEiLCJzb3VyY2VzQ29udGVudCI6WyJ7Z2V0VmltU3RhdGUsIGRpc3BhdGNoLCBUZXh0RGF0YSwgZ2V0Vmlld30gPSByZXF1aXJlICcuL3NwZWMtaGVscGVyJ1xuc2V0dGluZ3MgPSByZXF1aXJlICcuLi9saWIvc2V0dGluZ3MnXG5cbmRlc2NyaWJlIFwiT2NjdXJyZW5jZVwiLCAtPlxuICBbc2V0LCBlbnN1cmUsIGtleXN0cm9rZSwgZWRpdG9yLCBlZGl0b3JFbGVtZW50LCB2aW1TdGF0ZSwgY2xhc3NMaXN0XSA9IFtdXG4gIFtzZWFyY2hFZGl0b3IsIHNlYXJjaEVkaXRvckVsZW1lbnRdID0gW11cbiAgaW5wdXRTZWFyY2hUZXh0ID0gKHRleHQpIC0+XG4gICAgc2VhcmNoRWRpdG9yLmluc2VydFRleHQodGV4dClcbiAgZGlzcGF0Y2hTZWFyY2hDb21tYW5kID0gKG5hbWUpIC0+XG4gICAgZGlzcGF0Y2goc2VhcmNoRWRpdG9yRWxlbWVudCwgbmFtZSlcblxuICBiZWZvcmVFYWNoIC0+XG4gICAgZ2V0VmltU3RhdGUgKHN0YXRlLCB2aW0pIC0+XG4gICAgICB2aW1TdGF0ZSA9IHN0YXRlXG4gICAgICB7ZWRpdG9yLCBlZGl0b3JFbGVtZW50fSA9IHZpbVN0YXRlXG4gICAgICB7c2V0LCBlbnN1cmUsIGtleXN0cm9rZX0gPSB2aW1cbiAgICAgIGNsYXNzTGlzdCA9IGVkaXRvckVsZW1lbnQuY2xhc3NMaXN0XG4gICAgICBzZWFyY2hFZGl0b3IgPSB2aW1TdGF0ZS5zZWFyY2hJbnB1dC5lZGl0b3JcbiAgICAgIHNlYXJjaEVkaXRvckVsZW1lbnQgPSB2aW1TdGF0ZS5zZWFyY2hJbnB1dC5lZGl0b3JFbGVtZW50XG5cbiAgICBydW5zIC0+XG4gICAgICBqYXNtaW5lLmF0dGFjaFRvRE9NKGVkaXRvckVsZW1lbnQpXG5cbiAgZGVzY3JpYmUgXCJvcGVyYXRvci1tb2RpZmllci1vY2N1cnJlbmNlXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2V0XG4gICAgICAgIHRleHQ6IFwiXCJcIlxuXG4gICAgICAgIG9vbzogeHh4OiBvb286XG4gICAgICAgIC0tLTogb29vOiB4eHg6IG9vbzpcbiAgICAgICAgb29vOiB4eHg6IC0tLTogeHh4OiBvb286XG4gICAgICAgIHh4eDogLS0tOiBvb286IG9vbzpcblxuICAgICAgICBvb286IHh4eDogb29vOlxuICAgICAgICAtLS06IG9vbzogeHh4OiBvb286XG4gICAgICAgIG9vbzogeHh4OiAtLS06IHh4eDogb29vOlxuICAgICAgICB4eHg6IC0tLTogb29vOiBvb286XG5cbiAgICAgICAgXCJcIlwiXG5cbiAgICBkZXNjcmliZSBcIm8gbW9kaWZpZXJcIiwgLT5cbiAgICAgIGl0IFwiY2hhbmdlIG9jY3VycmVuY2Ugb2YgY3Vyc29yIHdvcmQgaW4gaW5uZXItcGFyYWdyYXBoXCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFsxLCAwXVxuICAgICAgICBlbnN1cmUgXCJjIG8gaSBwXCIsXG4gICAgICAgICAgbW9kZTogJ2luc2VydCdcbiAgICAgICAgICB0ZXh0QzogXCJcIlwiXG5cbiAgICAgICAgICAhOiB4eHg6IHw6XG4gICAgICAgICAgLS0tOiB8OiB4eHg6IHw6XG4gICAgICAgICAgfDogeHh4OiAtLS06IHh4eDogfDpcbiAgICAgICAgICB4eHg6IC0tLTogfDogfDpcblxuICAgICAgICAgIG9vbzogeHh4OiBvb286XG4gICAgICAgICAgLS0tOiBvb286IHh4eDogb29vOlxuICAgICAgICAgIG9vbzogeHh4OiAtLS06IHh4eDogb29vOlxuICAgICAgICAgIHh4eDogLS0tOiBvb286IG9vbzpcblxuICAgICAgICAgIFwiXCJcIlxuICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dCgnPT09JylcbiAgICAgICAgZW5zdXJlIFwiZXNjYXBlXCIsXG4gICAgICAgICAgbW9kZTogJ25vcm1hbCdcbiAgICAgICAgICB0ZXh0QzogXCJcIlwiXG5cbiAgICAgICAgICA9PSE9OiB4eHg6ID09fD06XG4gICAgICAgICAgLS0tOiA9PXw9OiB4eHg6ID09fD06XG4gICAgICAgICAgPT18PTogeHh4OiAtLS06IHh4eDogPT18PTpcbiAgICAgICAgICB4eHg6IC0tLTogPT18PTogPT18PTpcblxuICAgICAgICAgIG9vbzogeHh4OiBvb286XG4gICAgICAgICAgLS0tOiBvb286IHh4eDogb29vOlxuICAgICAgICAgIG9vbzogeHh4OiAtLS06IHh4eDogb29vOlxuICAgICAgICAgIHh4eDogLS0tOiBvb286IG9vbzpcblxuICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGVuc3VyZSBcIn0gaiAuXCIsXG4gICAgICAgICAgbW9kZTogJ25vcm1hbCdcbiAgICAgICAgICB0ZXh0QzogXCJcIlwiXG5cbiAgICAgICAgICA9PT06IHh4eDogPT09OlxuICAgICAgICAgIC0tLTogPT09OiB4eHg6ID09PTpcbiAgICAgICAgICA9PT06IHh4eDogLS0tOiB4eHg6ID09PTpcbiAgICAgICAgICB4eHg6IC0tLTogPT09OiA9PT06XG5cbiAgICAgICAgICA9PSE9OiB4eHg6ID09fD06XG4gICAgICAgICAgLS0tOiA9PXw9OiB4eHg6ID09fD06XG4gICAgICAgICAgPT18PTogeHh4OiAtLS06IHh4eDogPT18PTpcbiAgICAgICAgICB4eHg6IC0tLTogPT18PTogPT18PTpcblxuICAgICAgICAgIFwiXCJcIlxuXG4gICAgZGVzY3JpYmUgXCJPIG1vZGlmaWVyXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHRDOiBcIlwiXCJcblxuICAgICAgICAgIGNhbWVsQ2F8c2UgQ2FzZXNcbiAgICAgICAgICBcIkNhc2VTdHVkeVwiIFNuYWtlQ2FzZVxuICAgICAgICAgIFVQX0NBU0VcblxuICAgICAgICAgIG90aGVyIFBhcmFncmFwaENhc2VcbiAgICAgICAgICBcIlwiXCJcbiAgICAgIGl0IFwiZGVsZXRlIHN1YndvcmQtb2NjdXJyZW5jZSBpbiBwYXJhZ3JhcGggYW5kIHJlcGVhdGFibGVcIiwgLT5cbiAgICAgICAgZW5zdXJlIFwiZCBPIHBcIixcbiAgICAgICAgICB0ZXh0QzogXCJcIlwiXG5cbiAgICAgICAgICBjYW1lbHwgQ2FzZXNcbiAgICAgICAgICBcIlN0dWR5XCIgU25ha2VcbiAgICAgICAgICBVUF9DQVNFXG5cbiAgICAgICAgICBvdGhlciBQYXJhZ3JhcGhDYXNlXG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgIGVuc3VyZSBcIkcgLlwiLFxuICAgICAgICAgIHRleHRDOiBcIlwiXCJcblxuICAgICAgICAgIGNhbWVsIENhc2VzXG4gICAgICAgICAgXCJTdHVkeVwiIFNuYWtlXG4gICAgICAgICAgVVBfQ0FTRVxuXG4gICAgICAgICAgb3RoZXJ8IFBhcmFncmFwaFxuICAgICAgICAgIFwiXCJcIlxuXG4gICAgZGVzY3JpYmUgXCJhcHBseSB2YXJpb3VzIG9wZXJhdG9yIHRvIG9jY3VycmVuY2UgaW4gdmFyaW91cyB0YXJnZXRcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgIG9vbzogeHh4OiBvIW9vOlxuICAgICAgICAgID09PTogb29vOiB4eHg6IG9vbzpcbiAgICAgICAgICBvb286IHh4eDogPT09OiB4eHg6IG9vbzpcbiAgICAgICAgICB4eHg6ID09PTogb29vOiBvb286XG4gICAgICAgICAgXCJcIlwiXG4gICAgICBpdCBcInVwcGVyIGNhc2UgaW5uZXItd29yZFwiLCAtPlxuICAgICAgICBlbnN1cmUgXCJnIFUgbyBpIGxcIixcbiAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgT09POiB4eHg6IE8hT086XG4gICAgICAgICAgPT09OiBvb286IHh4eDogb29vOlxuICAgICAgICAgIG9vbzogeHh4OiA9PT06IHh4eDogb29vOlxuICAgICAgICAgIHh4eDogPT09OiBvb286IG9vbzpcbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgZW5zdXJlIFwiMiBqIC5cIixcbiAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgT09POiB4eHg6IE9PTzpcbiAgICAgICAgICA9PT06IG9vbzogeHh4OiBvb286XG4gICAgICAgICAgT09POiB4eHg6ID0hPT06IHh4eDogT09POlxuICAgICAgICAgIHh4eDogPT09OiBvb286IG9vbzpcbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgZW5zdXJlIFwiaiAuXCIsXG4gICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgIE9PTzogeHh4OiBPT086XG4gICAgICAgICAgPT09OiBvb286IHh4eDogb29vOlxuICAgICAgICAgIE9PTzogeHh4OiA9PT06IHh4eDogT09POlxuICAgICAgICAgIHh4eDogPT09OiBPIU9POiBPT086XG4gICAgICAgICAgXCJcIlwiXG5cbiAgICAgIGRlc2NyaWJlIFwiY2xpcCB0byBtdXRhdGlvbiBlbmQgYmVoYXZpb3JcIiwgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIHNldFxuICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuXG4gICAgICAgICAgICBvb3xvOnh4eDpvb286XG4gICAgICAgICAgICB4eHg6b29vOnh4eFxuICAgICAgICAgICAgXFxuXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgaXQgXCJbZCBvIHBdIGRlbGV0ZSBvY2N1cnJlbmNlIGFuZCBjdXJzb3IgaXMgYXQgbXV0YXRpb24gZW5kXCIsIC0+XG4gICAgICAgICAgZW5zdXJlIFwiZCBvIHBcIixcbiAgICAgICAgICAgIHRleHRDOiBcIlwiXCJcblxuICAgICAgICAgICAgfDp4eHg6OlxuICAgICAgICAgICAgeHh4Ojp4eHhcbiAgICAgICAgICAgIFxcblxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgIGl0IFwiW2QgbyBqXSBkZWxldGUgb2NjdXJyZW5jZSBhbmQgY3Vyc29yIGlzIGF0IG11dGF0aW9uIGVuZFwiLCAtPlxuICAgICAgICAgIGVuc3VyZSBcImQgbyBqXCIsXG4gICAgICAgICAgICB0ZXh0QzogXCJcIlwiXG5cbiAgICAgICAgICAgIHw6eHh4OjpcbiAgICAgICAgICAgIHh4eDo6eHh4XG4gICAgICAgICAgICBcXG5cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICBpdCBcIm5vdCBjbGlwIGlmIG9yaWdpbmFsIGN1cnNvciBub3QgaW50ZXJzZWN0cyBhbnkgb2NjdXJlbmNlLW1hcmtlclwiLCAtPlxuICAgICAgICAgIGVuc3VyZSAnZyBvJywgb2NjdXJyZW5jZVRleHQ6IFsnb29vJywgJ29vbycsICdvb28nXSwgY3Vyc29yOiBbMSwgMl1cbiAgICAgICAgICBrZXlzdHJva2UgJ2onLCBjdXJzb3I6IFsyLCAyXVxuICAgICAgICAgIGVuc3VyZSBcImQgcFwiLFxuICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuXG4gICAgICAgICAgICA6eHh4OjpcbiAgICAgICAgICAgIHh4fHg6Onh4eFxuICAgICAgICAgICAgXFxuXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgIGRlc2NyaWJlIFwiYXV0byBleHRlbmQgdGFyZ2V0IHJhbmdlIHRvIGluY2x1ZGUgb2NjdXJyZW5jZVwiLCAtPlxuICAgICAgdGV4dE9yaWdpbmFsID0gXCJUaGlzIHRleHQgaGF2ZSAzIGluc3RhbmNlIG9mICd0ZXh0JyBpbiB0aGUgd2hvbGUgdGV4dC5cXG5cIlxuICAgICAgdGV4dEZpbmFsID0gdGV4dE9yaWdpbmFsLnJlcGxhY2UoL3RleHQvZywgJycpXG5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0IHRleHQ6IHRleHRPcmlnaW5hbFxuXG4gICAgICBpdCBcIltmcm9tIHN0YXJ0IG9mIDFzdF1cIiwgLT4gc2V0IGN1cnNvcjogWzAsIDVdOyBlbnN1cmUgJ2QgbyAkJywgdGV4dDogdGV4dEZpbmFsXG4gICAgICBpdCBcIltmcm9tIG1pZGRsZSBvZiAxc3RdXCIsIC0+IHNldCBjdXJzb3I6IFswLCA3XTsgZW5zdXJlICdkIG8gJCcsIHRleHQ6IHRleHRGaW5hbFxuICAgICAgaXQgXCJbZnJvbSBlbmQgb2YgbGFzdF1cIiwgLT4gc2V0IGN1cnNvcjogWzAsIDUyXTsgZW5zdXJlICdkIG8gMCcsIHRleHQ6IHRleHRGaW5hbFxuICAgICAgaXQgXCJbZnJvbSBtaWRkbGUgb2YgbGFzdF1cIiwgLT4gc2V0IGN1cnNvcjogWzAsIDUxXTsgZW5zdXJlICdkIG8gMCcsIHRleHQ6IHRleHRGaW5hbFxuXG4gICAgZGVzY3JpYmUgXCJzZWxlY3Qtb2NjdXJyZW5jZVwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICB2aW0tbW9kZS1wbHVzIHZpbS1tb2RlLXBsdXNcbiAgICAgICAgICBcIlwiXCJcbiAgICAgIGRlc2NyaWJlIFwid2hhdCB0aGUgY3Vyc29yLXdvcmRcIiwgLT5cbiAgICAgICAgZW5zdXJlQ3Vyc29yV29yZCA9IChpbml0aWFsUG9pbnQsIHtzZWxlY3RlZFRleHR9KSAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IGluaXRpYWxQb2ludFxuICAgICAgICAgIGVuc3VyZSBcImcgY21kLWQgaSBwXCIsXG4gICAgICAgICAgICBzZWxlY3RlZFRleHQ6IHNlbGVjdGVkVGV4dFxuICAgICAgICAgICAgbW9kZTogWyd2aXN1YWwnLCAnY2hhcmFjdGVyd2lzZSddXG4gICAgICAgICAgZW5zdXJlIFwiZXNjYXBlXCIsIG1vZGU6IFwibm9ybWFsXCJcblxuICAgICAgICBkZXNjcmliZSBcImN1cnNvciBpcyBvbiBub3JtYWwgd29yZFwiLCAtPlxuICAgICAgICAgIGl0IFwicGljayB3b3JkIGJ1dCBub3QgcGljayBwYXJ0aWFsbHkgbWF0Y2hlZCBvbmUgW2J5IHNlbGVjdF1cIiwgLT5cbiAgICAgICAgICAgIGVuc3VyZUN1cnNvcldvcmQoWzAsIDBdLCBzZWxlY3RlZFRleHQ6IFsndmltJywgJ3ZpbSddKVxuICAgICAgICAgICAgZW5zdXJlQ3Vyc29yV29yZChbMCwgM10sIHNlbGVjdGVkVGV4dDogWyctJywgJy0nLCAnLScsICctJ10pXG4gICAgICAgICAgICBlbnN1cmVDdXJzb3JXb3JkKFswLCA0XSwgc2VsZWN0ZWRUZXh0OiBbJ21vZGUnLCAnbW9kZSddKVxuICAgICAgICAgICAgZW5zdXJlQ3Vyc29yV29yZChbMCwgOV0sIHNlbGVjdGVkVGV4dDogWydwbHVzJywgJ3BsdXMnXSlcblxuICAgICAgICBkZXNjcmliZSBcImN1cnNvciBpcyBhdCBzaW5nbGUgd2hpdGUgc3BhY2UgW2J5IGRlbGV0ZV1cIiwgLT5cbiAgICAgICAgICBpdCBcInBpY2sgc2luZ2xlIHdoaXRlIHNwYWNlIG9ubHlcIiwgLT5cbiAgICAgICAgICAgIHNldFxuICAgICAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgICAgb29vIG9vbyBvb29cbiAgICAgICAgICAgICAgIG9vbyBvb28gb29vXG4gICAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgICBjdXJzb3I6IFswLCAzXVxuICAgICAgICAgICAgZW5zdXJlIFwiZCBvIGkgcFwiLFxuICAgICAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgICAgb29vb29vb29vXG4gICAgICAgICAgICAgIG9vb29vb29vb1xuICAgICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBkZXNjcmliZSBcImN1cnNvciBpcyBhdCBzZXF1bmNlIG9mIHNwYWNlIFtieSBkZWxldGVdXCIsIC0+XG4gICAgICAgICAgaXQgXCJzZWxlY3Qgc2VxdW5jZSBvZiB3aGl0ZSBzcGFjZXMgaW5jbHVkaW5nIHBhcnRpYWxseSBtYWNoZWQgb25lXCIsIC0+XG4gICAgICAgICAgICBzZXRcbiAgICAgICAgICAgICAgY3Vyc29yOiBbMCwgM11cbiAgICAgICAgICAgICAgdGV4dF86IFwiXCJcIlxuICAgICAgICAgICAgICBvb29fX19vb28gb29vXG4gICAgICAgICAgICAgICBvb28gb29vX19fX29vb19fX19fX19fb29vXG4gICAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgZW5zdXJlIFwiZCBvIGkgcFwiLFxuICAgICAgICAgICAgICB0ZXh0XzogXCJcIlwiXG4gICAgICAgICAgICAgIG9vb29vbyBvb29cbiAgICAgICAgICAgICAgIG9vbyBvb28gb29vICBvb29cbiAgICAgICAgICAgICAgXCJcIlwiXG5cbiAgZGVzY3JpYmUgXCJzdGF5T25PY2N1cnJlbmNlIHNldHRpbmdzXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2V0XG4gICAgICAgIHRleHRDOiBcIlwiXCJcblxuICAgICAgICBhYWEsIGJiYiwgY2NjXG4gICAgICAgIGJiYiwgYXxhYSwgYWFhXG5cbiAgICAgICAgXCJcIlwiXG5cbiAgICBkZXNjcmliZSBcIndoZW4gdHJ1ZSAoPSBkZWZhdWx0KVwiLCAtPlxuICAgICAgaXQgXCJrZWVwIGN1cnNvciBwb3NpdGlvbiBhZnRlciBvcGVyYXRpb24gZmluaXNoZWRcIiwgLT5cbiAgICAgICAgZW5zdXJlICdnIFUgbyBwJyxcbiAgICAgICAgICB0ZXh0QzogXCJcIlwiXG5cbiAgICAgICAgICBBQUEsIGJiYiwgY2NjXG4gICAgICAgICAgYmJiLCBBfEFBLCBBQUFcblxuICAgICAgICAgIFwiXCJcIlxuXG4gICAgZGVzY3JpYmUgXCJ3aGVuIGZhbHNlXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldHRpbmdzLnNldCgnc3RheU9uT2NjdXJyZW5jZScsIGZhbHNlKVxuXG4gICAgICBpdCBcIm1vdmUgY3Vyc29yIHRvIHN0YXJ0IG9mIHRhcmdldCBhcyBsaWtlIG5vbi1vY3VycmVuY2Ugb3BlcmF0b3JcIiwgLT5cbiAgICAgICAgZW5zdXJlICdnIFUgbyBwJyxcbiAgICAgICAgICB0ZXh0QzogXCJcIlwiXG5cbiAgICAgICAgICB8QUFBLCBiYmIsIGNjY1xuICAgICAgICAgIGJiYiwgQUFBLCBBQUFcblxuICAgICAgICAgIFwiXCJcIlxuXG5cbiAgZGVzY3JpYmUgXCJmcm9tIHZpc3VhbC1tb2RlLmlzLW5hcnJvd2VkXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2V0XG4gICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICBvb286IHh4eDogb29vXG4gICAgICAgIHx8fDogb29vOiB4eHg6IG9vb1xuICAgICAgICBvb286IHh4eDogfHx8OiB4eHg6IG9vb1xuICAgICAgICB4eHg6IHx8fDogb29vOiBvb29cbiAgICAgICAgXCJcIlwiXG4gICAgICAgIGN1cnNvcjogWzAsIDBdXG5cbiAgICBkZXNjcmliZSBcIlt2Q10gc2VsZWN0LW9jY3VycmVuY2VcIiwgLT5cbiAgICAgIGl0IFwic2VsZWN0IGN1cnNvci13b3JkIHdoaWNoIGludGVyc2VjdGluZyBzZWxlY3Rpb24gdGhlbiBhcHBseSB1cHBlci1jYXNlXCIsIC0+XG4gICAgICAgIGVuc3VyZSBcInYgMiBqIGNtZC1kXCIsXG4gICAgICAgICAgc2VsZWN0ZWRUZXh0OiBbJ29vbycsICdvb28nLCAnb29vJywgJ29vbycsICdvb28nXVxuICAgICAgICAgIG1vZGU6IFsndmlzdWFsJywgJ2NoYXJhY3Rlcndpc2UnXVxuXG4gICAgICAgIGVuc3VyZSBcIlVcIixcbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICBPT086IHh4eDogT09PXG4gICAgICAgICAgfHx8OiBPT086IHh4eDogT09PXG4gICAgICAgICAgT09POiB4eHg6IHx8fDogeHh4OiBvb29cbiAgICAgICAgICB4eHg6IHx8fDogb29vOiBvb29cbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICBudW1DdXJzb3JzOiA1XG4gICAgICAgICAgbW9kZTogJ25vcm1hbCdcblxuICAgIGRlc2NyaWJlIFwiW3ZMXSBzZWxlY3Qtb2NjdXJyZW5jZVwiLCAtPlxuICAgICAgaXQgXCJzZWxlY3QgY3Vyc29yLXdvcmQgd2hpY2ggaW50ZXJzZWN0aW5nIHNlbGVjdGlvbiB0aGVuIGFwcGx5IHVwcGVyLWNhc2VcIiwgLT5cbiAgICAgICAgZW5zdXJlIFwiNSBsIFYgMiBqIGNtZC1kXCIsXG4gICAgICAgICAgc2VsZWN0ZWRUZXh0OiBbJ3h4eCcsICd4eHgnLCAneHh4JywgJ3h4eCddXG4gICAgICAgICAgbW9kZTogWyd2aXN1YWwnLCAnY2hhcmFjdGVyd2lzZSddXG5cbiAgICAgICAgZW5zdXJlIFwiVVwiLFxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgIG9vbzogWFhYOiBvb29cbiAgICAgICAgICB8fHw6IG9vbzogWFhYOiBvb29cbiAgICAgICAgICBvb286IFhYWDogfHx8OiBYWFg6IG9vb1xuICAgICAgICAgIHh4eDogfHx8OiBvb286IG9vb1xuICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIG51bUN1cnNvcnM6IDRcbiAgICAgICAgICBtb2RlOiAnbm9ybWFsJ1xuXG4gICAgZGVzY3JpYmUgXCJbdkJdIHNlbGVjdC1vY2N1cnJlbmNlXCIsIC0+XG4gICAgICBpdCBcInNlbGVjdCBjdXJzb3Itd29yZCB3aGljaCBpbnRlcnNlY3Rpbmcgc2VsZWN0aW9uIHRoZW4gYXBwbHkgdXBwZXItY2FzZVwiLCAtPlxuICAgICAgICBlbnN1cmUgXCJXIGN0cmwtdiAyIGogJCBoIGNtZC1kIFVcIixcbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICBvb286IHh4eDogT09PXG4gICAgICAgICAgfHx8OiBPT086IHh4eDogT09PXG4gICAgICAgICAgb29vOiB4eHg6IHx8fDogeHh4OiBPT09cbiAgICAgICAgICB4eHg6IHx8fDogb29vOiBvb29cbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICBudW1DdXJzb3JzOiA0XG5cbiAgICAgIGl0IFwicGljayBjdXJzb3Itd29yZCBmcm9tIHZCIHJhbmdlXCIsIC0+XG4gICAgICAgIGVuc3VyZSBcImN0cmwtdiA3IGwgMiBqIG8gY21kLWQgVVwiLFxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgIE9PTzogeHh4OiBvb29cbiAgICAgICAgICB8fHw6IE9PTzogeHh4OiBvb29cbiAgICAgICAgICBPT086IHh4eDogfHx8OiB4eHg6IG9vb1xuICAgICAgICAgIHh4eDogfHx8OiBvb286IG9vb1xuICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIG51bUN1cnNvcnM6IDNcblxuICBkZXNjcmliZSBcImluY3JlbWVudGFsIHNlYXJjaCBpbnRlZ3JhdGlvbjogY2hhbmdlLW9jY3VycmVuY2UtZnJvbS1zZWFyY2gsIHNlbGVjdC1vY2N1cnJlbmNlLWZyb20tc2VhcmNoXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2V0dGluZ3Muc2V0KCdpbmNyZW1lbnRhbFNlYXJjaCcsIHRydWUpXG4gICAgICBzZXRcbiAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgIG9vbzogeHh4OiBvb286IDAwMDBcbiAgICAgICAgMTogb29vOiAyMjogb29vOlxuICAgICAgICBvb286IHh4eDogfHx8OiB4eHg6IDMzMzM6XG4gICAgICAgIDQ0NDogfHx8OiBvb286IG9vbzpcbiAgICAgICAgXCJcIlwiXG4gICAgICAgIGN1cnNvcjogWzAsIDBdXG5cbiAgICBkZXNjcmliZSBcImZyb20gbm9ybWFsIG1vZGVcIiwgLT5cbiAgICAgIGl0IFwic2VsZWN0IG9jY3VycmVuY2UgYnkgcGF0dGVybiBtYXRjaFwiLCAtPlxuICAgICAgICBrZXlzdHJva2UgJy8nXG4gICAgICAgIGlucHV0U2VhcmNoVGV4dCgnXFxcXGR7Myw0fScpXG4gICAgICAgIGRpc3BhdGNoU2VhcmNoQ29tbWFuZCgndmltLW1vZGUtcGx1czpzZWxlY3Qtb2NjdXJyZW5jZS1mcm9tLXNlYXJjaCcpXG4gICAgICAgIGVuc3VyZSAnaSBlJyxcbiAgICAgICAgICBzZWxlY3RlZFRleHQ6IFsnMzMzMycsICc0NDQnLCAnMDAwMCddICMgV2h5ICcwMDAwJyBjb21lcyBsYXN0IGlzICcwMDAwJyBiZWNvbWUgbGFzdCBzZWxlY3Rpb24uXG4gICAgICAgICAgbW9kZTogWyd2aXN1YWwnLCAnY2hhcmFjdGVyd2lzZSddXG5cbiAgICAgIGl0IFwiY2hhbmdlIG9jY3VycmVuY2UgYnkgcGF0dGVybiBtYXRjaFwiLCAtPlxuICAgICAgICBrZXlzdHJva2UgJy8nXG4gICAgICAgIGlucHV0U2VhcmNoVGV4dCgnXlxcXFx3KzonKVxuICAgICAgICBkaXNwYXRjaFNlYXJjaENvbW1hbmQoJ3ZpbS1tb2RlLXBsdXM6Y2hhbmdlLW9jY3VycmVuY2UtZnJvbS1zZWFyY2gnKVxuICAgICAgICBlbnN1cmUgJ2kgZScsIG1vZGU6ICdpbnNlcnQnXG4gICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KCdoZWxsbycpXG4gICAgICAgIGVuc3VyZVxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgIGhlbGxvIHh4eDogb29vOiAwMDAwXG4gICAgICAgICAgaGVsbG8gb29vOiAyMjogb29vOlxuICAgICAgICAgIGhlbGxvIHh4eDogfHx8OiB4eHg6IDMzMzM6XG4gICAgICAgICAgaGVsbG8gfHx8OiBvb286IG9vbzpcbiAgICAgICAgICBcIlwiXCJcblxuICAgIGRlc2NyaWJlIFwiZnJvbSB2aXN1YWwgbW9kZVwiLCAtPlxuICAgICAgZGVzY3JpYmUgXCJ2aXN1YWwgY2hhcmFjdGVyd2lzZVwiLCAtPlxuICAgICAgICBpdCBcImNoYW5nZSBvY2N1cnJlbmNlIGluIG5hcnJvd2VkIHNlbGVjdGlvblwiLCAtPlxuICAgICAgICAgIGtleXN0cm9rZSAndiBqIC8nXG4gICAgICAgICAgaW5wdXRTZWFyY2hUZXh0KCdvKycpXG4gICAgICAgICAgZGlzcGF0Y2hTZWFyY2hDb21tYW5kKCd2aW0tbW9kZS1wbHVzOnNlbGVjdC1vY2N1cnJlbmNlLWZyb20tc2VhcmNoJylcbiAgICAgICAgICBlbnN1cmUgJ1UnLFxuICAgICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICBPT086IHh4eDogT09POiAwMDAwXG4gICAgICAgICAgICAxOiBvb286IDIyOiBvb286XG4gICAgICAgICAgICBvb286IHh4eDogfHx8OiB4eHg6IDMzMzM6XG4gICAgICAgICAgICA0NDQ6IHx8fDogb29vOiBvb286XG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgZGVzY3JpYmUgXCJ2aXN1YWwgbGluZXdpc2VcIiwgLT5cbiAgICAgICAgaXQgXCJjaGFuZ2Ugb2NjdXJyZW5jZSBpbiBuYXJyb3dlZCBzZWxlY3Rpb25cIiwgLT5cbiAgICAgICAgICBrZXlzdHJva2UgJ1YgaiAvJ1xuICAgICAgICAgIGlucHV0U2VhcmNoVGV4dCgnbysnKVxuICAgICAgICAgIGRpc3BhdGNoU2VhcmNoQ29tbWFuZCgndmltLW1vZGUtcGx1czpzZWxlY3Qtb2NjdXJyZW5jZS1mcm9tLXNlYXJjaCcpXG4gICAgICAgICAgZW5zdXJlICdVJyxcbiAgICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgT09POiB4eHg6IE9PTzogMDAwMFxuICAgICAgICAgICAgMTogT09POiAyMjogT09POlxuICAgICAgICAgICAgb29vOiB4eHg6IHx8fDogeHh4OiAzMzMzOlxuICAgICAgICAgICAgNDQ0OiB8fHw6IG9vbzogb29vOlxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgIGRlc2NyaWJlIFwidmlzdWFsIGJsb2Nrd2lzZVwiLCAtPlxuICAgICAgICBpdCBcImNoYW5nZSBvY2N1cnJlbmNlIGluIG5hcnJvd2VkIHNlbGVjdGlvblwiLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFswLCA1XVxuICAgICAgICAgIGtleXN0cm9rZSAnY3RybC12IDIgaiAxIDAgbCAvJ1xuICAgICAgICAgIGlucHV0U2VhcmNoVGV4dCgnbysnKVxuICAgICAgICAgIGRpc3BhdGNoU2VhcmNoQ29tbWFuZCgndmltLW1vZGUtcGx1czpzZWxlY3Qtb2NjdXJyZW5jZS1mcm9tLXNlYXJjaCcpXG4gICAgICAgICAgZW5zdXJlICdVJyxcbiAgICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgb29vOiB4eHg6IE9PTzogMDAwMFxuICAgICAgICAgICAgMTogT09POiAyMjogT09POlxuICAgICAgICAgICAgb29vOiB4eHg6IHx8fDogeHh4OiAzMzMzOlxuICAgICAgICAgICAgNDQ0OiB8fHw6IG9vbzogb29vOlxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICBkZXNjcmliZSBcInBlcnNpc3RlbnQtc2VsZWN0aW9uIGlzIGV4aXN0c1wiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBhdG9tLmtleW1hcHMuYWRkIFwiY3JlYXRlLXBlcnNpc3RlbnQtc2VsZWN0aW9uXCIsXG4gICAgICAgICAgJ2F0b20tdGV4dC1lZGl0b3IudmltLW1vZGUtcGx1czpub3QoLmluc2VydC1tb2RlKSc6XG4gICAgICAgICAgICAnbSc6ICd2aW0tbW9kZS1wbHVzOmNyZWF0ZS1wZXJzaXN0ZW50LXNlbGVjdGlvbidcblxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICBvb286IHh4eDogb29vOlxuICAgICAgICAgIHx8fDogb29vOiB4eHg6IG9vbzpcbiAgICAgICAgICBvb286IHh4eDogfHx8OiB4eHg6IG9vbzpcbiAgICAgICAgICB4eHg6IHx8fDogb29vOiBvb286XFxuXG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgY3Vyc29yOiBbMCwgMF1cblxuICAgICAgICBlbnN1cmUgJ1YgaiBtIEcgbSBtJyxcbiAgICAgICAgICBwZXJzaXN0ZW50U2VsZWN0aW9uQnVmZmVyUmFuZ2U6IFtcbiAgICAgICAgICAgIFtbMCwgMF0sIFsyLCAwXV1cbiAgICAgICAgICAgIFtbMywgMF0sIFs0LCAwXV1cbiAgICAgICAgICBdXG5cbiAgICAgIGRlc2NyaWJlIFwid2hlbiBubyBzZWxlY3Rpb24gaXMgZXhpc3RzXCIsIC0+XG4gICAgICAgIGl0IFwic2VsZWN0IG9jY3VycmVuY2UgaW4gYWxsIHBlcnNpc3RlbnQtc2VsZWN0aW9uXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzAsIDBdXG4gICAgICAgICAga2V5c3Ryb2tlICcvJ1xuICAgICAgICAgIGlucHV0U2VhcmNoVGV4dCgneHh4JylcbiAgICAgICAgICBkaXNwYXRjaFNlYXJjaENvbW1hbmQoJ3ZpbS1tb2RlLXBsdXM6c2VsZWN0LW9jY3VycmVuY2UtZnJvbS1zZWFyY2gnKVxuICAgICAgICAgIGVuc3VyZSAnVScsXG4gICAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIG9vbzogWFhYOiBvb286XG4gICAgICAgICAgICB8fHw6IG9vbzogWFhYOiBvb286XG4gICAgICAgICAgICBvb286IHh4eDogfHx8OiB4eHg6IG9vbzpcbiAgICAgICAgICAgIFhYWDogfHx8OiBvb286IG9vbzpcXG5cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgcGVyc2lzdGVudFNlbGVjdGlvbkNvdW50OiAwXG5cbiAgICAgIGRlc2NyaWJlIFwid2hlbiBib3RoIGV4aXRzLCBvcGVyYXRvciBhcHBsaWVkIHRvIGJvdGhcIiwgLT5cbiAgICAgICAgaXQgXCJzZWxlY3QgYWxsIG9jY3VycmVuY2UgaW4gc2VsZWN0aW9uXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzAsIDBdXG4gICAgICAgICAga2V5c3Ryb2tlICdWIDIgaiAvJ1xuICAgICAgICAgIGlucHV0U2VhcmNoVGV4dCgneHh4JylcbiAgICAgICAgICBkaXNwYXRjaFNlYXJjaENvbW1hbmQoJ3ZpbS1tb2RlLXBsdXM6c2VsZWN0LW9jY3VycmVuY2UtZnJvbS1zZWFyY2gnKVxuICAgICAgICAgIGVuc3VyZSAnVScsXG4gICAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIG9vbzogWFhYOiBvb286XG4gICAgICAgICAgICB8fHw6IG9vbzogWFhYOiBvb286XG4gICAgICAgICAgICBvb286IFhYWDogfHx8OiBYWFg6IG9vbzpcbiAgICAgICAgICAgIFhYWDogfHx8OiBvb286IG9vbzpcXG5cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgcGVyc2lzdGVudFNlbGVjdGlvbkNvdW50OiAwXG5cbiAgICBkZXNjcmliZSBcImRlbW9uc3RyYXRlIHBlcnNpc3RlbnQtc2VsZWN0aW9uJ3MgcHJhY3RpY2FsIHNjZW5hcmlvXCIsIC0+XG4gICAgICBbb2xkR3JhbW1hcl0gPSBbXVxuICAgICAgYWZ0ZXJFYWNoIC0+XG4gICAgICAgIGVkaXRvci5zZXRHcmFtbWFyKG9sZEdyYW1tYXIpXG5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgYXRvbS5rZXltYXBzLmFkZCBcImNyZWF0ZS1wZXJzaXN0ZW50LXNlbGVjdGlvblwiLFxuICAgICAgICAgICdhdG9tLXRleHQtZWRpdG9yLnZpbS1tb2RlLXBsdXM6bm90KC5pbnNlcnQtbW9kZSknOlxuICAgICAgICAgICAgJ20nOiAndmltLW1vZGUtcGx1czp0b2dnbGUtcGVyc2lzdGVudC1zZWxlY3Rpb24nXG5cbiAgICAgICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICAgICAgYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoJ2xhbmd1YWdlLWNvZmZlZS1zY3JpcHQnKVxuXG4gICAgICAgIHJ1bnMgLT5cbiAgICAgICAgICBvbGRHcmFtbWFyID0gZWRpdG9yLmdldEdyYW1tYXIoKVxuICAgICAgICAgIGVkaXRvci5zZXRHcmFtbWFyKGF0b20uZ3JhbW1hcnMuZ3JhbW1hckZvclNjb3BlTmFtZSgnc291cmNlLmNvZmZlZScpKVxuXG4gICAgICAgIHNldCB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIGNvbnN0cnVjdG9yOiAoQG1haW4sIEBlZGl0b3IsIEBzdGF0dXNCYXJNYW5hZ2VyKSAtPlxuICAgICAgICAgICAgICBAZWRpdG9yRWxlbWVudCA9IEBlZGl0b3IuZWxlbWVudFxuICAgICAgICAgICAgICBAZW1pdHRlciA9IG5ldyBFbWl0dGVyXG4gICAgICAgICAgICAgIEBzdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcbiAgICAgICAgICAgICAgQG1vZGVNYW5hZ2VyID0gbmV3IE1vZGVNYW5hZ2VyKHRoaXMpXG4gICAgICAgICAgICAgIEBtYXJrID0gbmV3IE1hcmtNYW5hZ2VyKHRoaXMpXG4gICAgICAgICAgICAgIEByZWdpc3RlciA9IG5ldyBSZWdpc3Rlck1hbmFnZXIodGhpcylcbiAgICAgICAgICAgICAgQHBlcnNpc3RlbnRTZWxlY3Rpb25zID0gW11cblxuICAgICAgICAgICAgICBAaGlnaGxpZ2h0U2VhcmNoU3Vic2NyaXB0aW9uID0gQGVkaXRvckVsZW1lbnQub25EaWRDaGFuZ2VTY3JvbGxUb3AgPT5cbiAgICAgICAgICAgICAgICBAcmVmcmVzaEhpZ2hsaWdodFNlYXJjaCgpXG5cbiAgICAgICAgICAgICAgQG9wZXJhdGlvblN0YWNrID0gbmV3IE9wZXJhdGlvblN0YWNrKHRoaXMpXG4gICAgICAgICAgICAgIEBjdXJzb3JTdHlsZU1hbmFnZXIgPSBuZXcgQ3Vyc29yU3R5bGVNYW5hZ2VyKHRoaXMpXG5cbiAgICAgICAgICAgIGFub3RoZXJGdW5jOiAtPlxuICAgICAgICAgICAgICBAaGVsbG8gPSBbXVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgIGl0ICdjaGFuZ2UgYWxsIGFzc2lnbm1lbnQoXCI9XCIpIG9mIGN1cnJlbnQtZnVuY3Rpb24gdG8gXCI/PVwiJywgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzAsIDBdXG4gICAgICAgIGVuc3VyZSAnaiBmID0nLCBjdXJzb3I6IFsxLCAxN11cblxuICAgICAgICBydW5zIC0+XG4gICAgICAgICAga2V5c3Ryb2tlIFtcbiAgICAgICAgICAgICdnIGNtZC1kJyAjIHNlbGVjdC1vY2N1cnJlbmNlXG4gICAgICAgICAgICAnaSBmJyAgICAgIyBpbm5lci1mdW5jdGlvbi10ZXh0LW9iamVjdFxuICAgICAgICAgICAgJ20nICAgICAgICMgdG9nZ2xlLXBlcnNpc3RlbnQtc2VsZWN0aW9uXG4gICAgICAgICAgXS5qb2luKFwiIFwiKVxuXG4gICAgICAgICAgdGV4dHNJbkJ1ZmZlclJhbmdlID0gdmltU3RhdGUucGVyc2lzdGVudFNlbGVjdGlvbi5nZXRNYXJrZXJCdWZmZXJSYW5nZXMoKS5tYXAgKHJhbmdlKSAtPlxuICAgICAgICAgICAgZWRpdG9yLmdldFRleHRJbkJ1ZmZlclJhbmdlKHJhbmdlKVxuICAgICAgICAgIHRleHRzSW5CdWZmZXJSYW5nZUlzQWxsRXF1YWxDaGFyID0gdGV4dHNJbkJ1ZmZlclJhbmdlLmV2ZXJ5KCh0ZXh0KSAtPiB0ZXh0IGlzICc9JylcbiAgICAgICAgICBleHBlY3QodGV4dHNJbkJ1ZmZlclJhbmdlSXNBbGxFcXVhbENoYXIpLnRvQmUodHJ1ZSlcbiAgICAgICAgICBleHBlY3QodmltU3RhdGUucGVyc2lzdGVudFNlbGVjdGlvbi5nZXRNYXJrZXJzKCkpLnRvSGF2ZUxlbmd0aCgxMSlcblxuICAgICAgICAgIGtleXN0cm9rZSAnMiBsJyAjIHRvIG1vdmUgdG8gb3V0LXNpZGUgb2YgcmFuZ2UtbXJrZXJcbiAgICAgICAgICBlbnN1cmUgJy8gPT4gZW50ZXInLCBjdXJzb3I6IFs5LCA2OV1cbiAgICAgICAgICBrZXlzdHJva2UgXCJtXCIgIyBjbGVhciBwZXJzaXN0ZW50U2VsZWN0aW9uIGF0IGN1cnNvciB3aGljaCBpcyA9IHNpZ24gcGFydCBvZiBmYXQgYXJyb3cuXG4gICAgICAgICAgZXhwZWN0KHZpbVN0YXRlLnBlcnNpc3RlbnRTZWxlY3Rpb24uZ2V0TWFya2VycygpKS50b0hhdmVMZW5ndGgoMTApXG5cbiAgICAgICAgd2FpdHNGb3IgLT5cbiAgICAgICAgICBjbGFzc0xpc3QuY29udGFpbnMoJ2hhcy1wZXJzaXN0ZW50LXNlbGVjdGlvbicpXG5cbiAgICAgICAgcnVucyAtPlxuICAgICAgICAgIGtleXN0cm9rZSBcImN0cmwtY21kLWcgSVwiICMgXCJzZWxlY3QtcGVyc2lzdGVudC1zZWxlY3Rpb25cIiB0aGVuIFwiSW5zZXJ0IGF0IHN0YXJ0IG9mIHNlbGVjdGlvblwiXG5cbiAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dCgnPycpXG4gICAgICAgICAgZW5zdXJlICdlc2NhcGUnLFxuICAgICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICBjb25zdHJ1Y3RvcjogKEBtYWluLCBAZWRpdG9yLCBAc3RhdHVzQmFyTWFuYWdlcikgLT5cbiAgICAgICAgICAgICAgQGVkaXRvckVsZW1lbnQgPz0gQGVkaXRvci5lbGVtZW50XG4gICAgICAgICAgICAgIEBlbWl0dGVyID89IG5ldyBFbWl0dGVyXG4gICAgICAgICAgICAgIEBzdWJzY3JpcHRpb25zID89IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG4gICAgICAgICAgICAgIEBtb2RlTWFuYWdlciA/PSBuZXcgTW9kZU1hbmFnZXIodGhpcylcbiAgICAgICAgICAgICAgQG1hcmsgPz0gbmV3IE1hcmtNYW5hZ2VyKHRoaXMpXG4gICAgICAgICAgICAgIEByZWdpc3RlciA/PSBuZXcgUmVnaXN0ZXJNYW5hZ2VyKHRoaXMpXG4gICAgICAgICAgICAgIEBwZXJzaXN0ZW50U2VsZWN0aW9ucyA/PSBbXVxuXG4gICAgICAgICAgICAgIEBoaWdobGlnaHRTZWFyY2hTdWJzY3JpcHRpb24gPz0gQGVkaXRvckVsZW1lbnQub25EaWRDaGFuZ2VTY3JvbGxUb3AgPT5cbiAgICAgICAgICAgICAgICBAcmVmcmVzaEhpZ2hsaWdodFNlYXJjaCgpXG5cbiAgICAgICAgICAgICAgQG9wZXJhdGlvblN0YWNrID89IG5ldyBPcGVyYXRpb25TdGFjayh0aGlzKVxuICAgICAgICAgICAgICBAY3Vyc29yU3R5bGVNYW5hZ2VyID89IG5ldyBDdXJzb3JTdHlsZU1hbmFnZXIodGhpcylcblxuICAgICAgICAgICAgYW5vdGhlckZ1bmM6IC0+XG4gICAgICAgICAgICAgIEBoZWxsbyA9IFtdXG4gICAgICAgICAgICBcIlwiXCJcblxuICBkZXNjcmliZSBcInByZXNldCBvY2N1cnJlbmNlIG1hcmtlclwiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNldFxuICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgVGhpcyB0ZXh0IGhhdmUgMyBpbnN0YW5jZSBvZiAndGV4dCcgaW4gdGhlIHdob2xlIHRleHRcbiAgICAgICAgXCJcIlwiXG4gICAgICAgIGN1cnNvcjogWzAsIDBdXG5cbiAgICBkZXNjcmliZSBcInRvZ2dsZS1wcmVzZXQtb2NjdXJyZW5jZSBjb21tYW5kc1wiLCAtPlxuICAgICAgZGVzY3JpYmUgXCJpbiBub3JtYWwtbW9kZVwiLCAtPlxuICAgICAgICBkZXNjcmliZSBcImFkZCBwcmVzZXQgb2NjdXJyZW5jZVwiLCAtPlxuICAgICAgICAgIGl0ICdzZXQgY3Vyc29yLXdhcmQgYXMgcHJlc2V0IG9jY3VycmVuY2UgbWFya2VyIGFuZCBub3QgbW92ZSBjdXJzb3InLCAtPlxuICAgICAgICAgICAgZW5zdXJlICdnIG8nLCBvY2N1cnJlbmNlVGV4dDogJ1RoaXMnLCBjdXJzb3I6IFswLCAwXVxuICAgICAgICAgICAgZW5zdXJlICd3JywgY3Vyc29yOiBbMCwgNV1cbiAgICAgICAgICAgIGVuc3VyZSAnZyBvJywgb2NjdXJyZW5jZVRleHQ6IFsnVGhpcycsICd0ZXh0JywgJ3RleHQnLCAndGV4dCddLCBjdXJzb3I6IFswLCA1XVxuXG4gICAgICAgIGRlc2NyaWJlIFwicmVtb3ZlIHByZXNldCBvY2N1cnJlbmNlXCIsIC0+XG4gICAgICAgICAgaXQgJ3JlbW92ZXMgb2NjdXJyZW5jZSBvbmUgYnkgb25lIHNlcGFyYXRlbHknLCAtPlxuICAgICAgICAgICAgZW5zdXJlICdnIG8nLCBvY2N1cnJlbmNlVGV4dDogJ1RoaXMnLCBjdXJzb3I6IFswLCAwXVxuICAgICAgICAgICAgZW5zdXJlICd3JywgY3Vyc29yOiBbMCwgNV1cbiAgICAgICAgICAgIGVuc3VyZSAnZyBvJywgb2NjdXJyZW5jZVRleHQ6IFsnVGhpcycsICd0ZXh0JywgJ3RleHQnLCAndGV4dCddLCBjdXJzb3I6IFswLCA1XVxuICAgICAgICAgICAgZW5zdXJlICdnIG8nLCBvY2N1cnJlbmNlVGV4dDogWydUaGlzJywgJ3RleHQnLCAndGV4dCddLCBjdXJzb3I6IFswLCA1XVxuICAgICAgICAgICAgZW5zdXJlICdiIGcgbycsIG9jY3VycmVuY2VUZXh0OiBbJ3RleHQnLCAndGV4dCddLCBjdXJzb3I6IFswLCAwXVxuICAgICAgICAgIGl0ICdyZW1vdmVzIGFsbCBvY2N1cnJlbmNlIGluIHRoaXMgZWRpdG9yIGJ5IGVzY2FwZScsIC0+XG4gICAgICAgICAgICBlbnN1cmUgJ2cgbycsIG9jY3VycmVuY2VUZXh0OiAnVGhpcycsIGN1cnNvcjogWzAsIDBdXG4gICAgICAgICAgICBlbnN1cmUgJ3cnLCBjdXJzb3I6IFswLCA1XVxuICAgICAgICAgICAgZW5zdXJlICdnIG8nLCBvY2N1cnJlbmNlVGV4dDogWydUaGlzJywgJ3RleHQnLCAndGV4dCcsICd0ZXh0J10sIGN1cnNvcjogWzAsIDVdXG4gICAgICAgICAgICBlbnN1cmUgJ2VzY2FwZScsIG9jY3VycmVuY2VDb3VudDogMFxuXG4gICAgICAgICAgaXQgJ2NhbiByZWNhbGwgcHJldmlvdXNseSBzZXQgb2NjdXJlbmNlIHBhdHRlcm4gYnkgYGcgLmAnLCAtPlxuICAgICAgICAgICAgZW5zdXJlICd3IHYgbCBnIG8nLCBvY2N1cnJlbmNlVGV4dDogWyd0ZScsICd0ZScsICd0ZSddLCBjdXJzb3I6IFswLCA2XVxuICAgICAgICAgICAgZW5zdXJlICdlc2NhcGUnLCBvY2N1cnJlbmNlQ291bnQ6IDBcbiAgICAgICAgICAgIGV4cGVjdCh2aW1TdGF0ZS5nbG9iYWxTdGF0ZS5nZXQoJ2xhc3RPY2N1cnJlbmNlUGF0dGVybicpKS50b0VxdWFsKC90ZS9nKVxuXG4gICAgICAgICAgICBlbnN1cmUgJ3cnLCBjdXJzb3I6IFswLCAxMF0gIyB0byBtb3ZlIGN1cnNvciB0byB0ZXh0IGBoYXZlYFxuICAgICAgICAgICAgZW5zdXJlICdnIC4nLCBvY2N1cnJlbmNlVGV4dDogWyd0ZScsICd0ZScsICd0ZSddLCBjdXJzb3I6IFswLCAxMF1cblxuICAgICAgICAgICAgIyBCdXQgb3BlcmF0b3IgbW9kaWZpZXIgbm90IHVwZGF0ZSBsYXN0T2NjdXJyZW5jZVBhdHRlcm5cbiAgICAgICAgICAgIGVuc3VyZSAnZyBVIG8gJCcsIHRleHRDOiBcIlRoaXMgdGV4dCB8SEFWRSAzIGluc3RhbmNlIG9mICd0ZXh0JyBpbiB0aGUgd2hvbGUgdGV4dFwiXG4gICAgICAgICAgICBleHBlY3QodmltU3RhdGUuZ2xvYmFsU3RhdGUuZ2V0KCdsYXN0T2NjdXJyZW5jZVBhdHRlcm4nKSkudG9FcXVhbCgvdGUvZylcblxuICAgICAgICBkZXNjcmliZSBcInJlc3RvcmUgbGFzdCBvY2N1cnJlbmNlIG1hcmtlciBieSBhZGQtcHJlc2V0LW9jY3VycmVuY2UtZnJvbS1sYXN0LW9jY3VycmVuY2UtcGF0dGVyblwiLCAtPlxuICAgICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICAgIHNldFxuICAgICAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICAgIGNhbWVsXG4gICAgICAgICAgICAgIGNhbWVsQ2FzZVxuICAgICAgICAgICAgICBjYW1lbHNcbiAgICAgICAgICAgICAgY2FtZWxcbiAgICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgaXQgXCJjYW4gcmVzdG9yZSBvY2N1cnJlbmNlLW1hcmtlciBhZGRlZCBieSBgZyBvYCBpbiBub3JtYWwtbW9kZVwiLCAtPlxuICAgICAgICAgICAgc2V0IGN1cnNvcjogWzAsIDBdXG4gICAgICAgICAgICBlbnN1cmUgXCJnIG9cIiwgb2NjdXJyZW5jZVRleHQ6IFsnY2FtZWwnLCAnY2FtZWwnXVxuICAgICAgICAgICAgZW5zdXJlICdlc2NhcGUnLCBvY2N1cnJlbmNlQ291bnQ6IDBcbiAgICAgICAgICAgIGVuc3VyZSBcImcgLlwiLCBvY2N1cnJlbmNlVGV4dDogWydjYW1lbCcsICdjYW1lbCddXG5cbiAgICAgICAgICBpdCBcImNhbiByZXN0b3JlIG9jY3VycmVuY2UtbWFya2VyIGFkZGVkIGJ5IGBnIG9gIGluIHZpc3VhbC1tb2RlXCIsIC0+XG4gICAgICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgICAgIGVuc3VyZSBcInYgaSB3XCIsIHNlbGVjdGVkVGV4dDogXCJjYW1lbFwiXG4gICAgICAgICAgICBlbnN1cmUgXCJnIG9cIiwgb2NjdXJyZW5jZVRleHQ6IFsnY2FtZWwnLCAnY2FtZWwnLCAnY2FtZWwnLCAnY2FtZWwnXVxuICAgICAgICAgICAgZW5zdXJlICdlc2NhcGUnLCBvY2N1cnJlbmNlQ291bnQ6IDBcbiAgICAgICAgICAgIGVuc3VyZSBcImcgLlwiLCBvY2N1cnJlbmNlVGV4dDogWydjYW1lbCcsICdjYW1lbCcsICdjYW1lbCcsICdjYW1lbCddXG5cbiAgICAgICAgICBpdCBcImNhbiByZXN0b3JlIG9jY3VycmVuY2UtbWFya2VyIGFkZGVkIGJ5IGBnIE9gIGluIG5vcm1hbC1tb2RlXCIsIC0+XG4gICAgICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgICAgIGVuc3VyZSBcImcgT1wiLCBvY2N1cnJlbmNlVGV4dDogWydjYW1lbCcsICdjYW1lbCcsICdjYW1lbCddXG4gICAgICAgICAgICBlbnN1cmUgJ2VzY2FwZScsIG9jY3VycmVuY2VDb3VudDogMFxuICAgICAgICAgICAgZW5zdXJlIFwiZyAuXCIsIG9jY3VycmVuY2VUZXh0OiBbJ2NhbWVsJywgJ2NhbWVsJywgJ2NhbWVsJ11cblxuICAgICAgICBkZXNjcmliZSBcImNzcyBjbGFzcyBoYXMtb2NjdXJyZW5jZVwiLCAtPlxuICAgICAgICAgIGRlc2NyaWJlIFwibWFudWFsbHkgdG9nZ2xlIGJ5IHRvZ2dsZS1wcmVzZXQtb2NjdXJyZW5jZSBjb21tYW5kXCIsIC0+XG4gICAgICAgICAgICBpdCAnaXMgYXV0by1zZXQvdW5zZXQgd2hldGVyIGF0IGxlYXN0IG9uZSBwcmVzZXQtb2NjdXJyZW5jZSB3YXMgZXhpc3RzIG9yIG5vdCcsIC0+XG4gICAgICAgICAgICAgIGV4cGVjdChjbGFzc0xpc3QuY29udGFpbnMoJ2hhcy1vY2N1cnJlbmNlJykpLnRvQmUoZmFsc2UpXG4gICAgICAgICAgICAgIGVuc3VyZSAnZyBvJywgb2NjdXJyZW5jZVRleHQ6ICdUaGlzJywgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgICAgICAgZXhwZWN0KGNsYXNzTGlzdC5jb250YWlucygnaGFzLW9jY3VycmVuY2UnKSkudG9CZSh0cnVlKVxuICAgICAgICAgICAgICBlbnN1cmUgJ2cgbycsIG9jY3VycmVuY2VDb3VudDogMCwgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgICAgICAgZXhwZWN0KGNsYXNzTGlzdC5jb250YWlucygnaGFzLW9jY3VycmVuY2UnKSkudG9CZShmYWxzZSlcblxuICAgICAgICAgIGRlc2NyaWJlIFwiY2hhbmdlICdJTlNJREUnIG9mIG1hcmtlclwiLCAtPlxuICAgICAgICAgICAgbWFya2VyTGF5ZXJVcGRhdGVkID0gbnVsbFxuICAgICAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgICAgICBtYXJrZXJMYXllclVwZGF0ZWQgPSBmYWxzZVxuXG4gICAgICAgICAgICBpdCAnZGVzdHJveSBtYXJrZXIgYW5kIHJlZmxlY3QgdG8gXCJoYXMtb2NjdXJyZW5jZVwiIENTUycsIC0+XG4gICAgICAgICAgICAgIHJ1bnMgLT5cbiAgICAgICAgICAgICAgICBleHBlY3QoY2xhc3NMaXN0LmNvbnRhaW5zKCdoYXMtb2NjdXJyZW5jZScpKS50b0JlKGZhbHNlKVxuICAgICAgICAgICAgICAgIGVuc3VyZSAnZyBvJywgb2NjdXJyZW5jZVRleHQ6ICdUaGlzJywgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgICAgICAgICBleHBlY3QoY2xhc3NMaXN0LmNvbnRhaW5zKCdoYXMtb2NjdXJyZW5jZScpKS50b0JlKHRydWUpXG5cbiAgICAgICAgICAgICAgICBlbnN1cmUgJ2wgaScsIG1vZGU6ICdpbnNlcnQnXG4gICAgICAgICAgICAgICAgdmltU3RhdGUub2NjdXJyZW5jZU1hbmFnZXIubWFya2VyTGF5ZXIub25EaWRVcGRhdGUgLT5cbiAgICAgICAgICAgICAgICAgIG1hcmtlckxheWVyVXBkYXRlZCA9IHRydWVcblxuICAgICAgICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KCctLScpXG4gICAgICAgICAgICAgICAgZW5zdXJlIFwiZXNjYXBlXCIsXG4gICAgICAgICAgICAgICAgICB0ZXh0QzogXCJULXwtaGlzIHRleHQgaGF2ZSAzIGluc3RhbmNlIG9mICd0ZXh0JyBpbiB0aGUgd2hvbGUgdGV4dFwiXG4gICAgICAgICAgICAgICAgICBtb2RlOiAnbm9ybWFsJ1xuXG4gICAgICAgICAgICAgIHdhaXRzRm9yIC0+XG4gICAgICAgICAgICAgICAgbWFya2VyTGF5ZXJVcGRhdGVkXG5cbiAgICAgICAgICAgICAgcnVucyAtPlxuICAgICAgICAgICAgICAgIGVuc3VyZSBvY2N1cnJlbmNlQ291bnQ6IDBcbiAgICAgICAgICAgICAgICBleHBlY3QoY2xhc3NMaXN0LmNvbnRhaW5zKCdoYXMtb2NjdXJyZW5jZScpKS50b0JlKGZhbHNlKVxuXG4gICAgICBkZXNjcmliZSBcImluIHZpc3VhbC1tb2RlXCIsIC0+XG4gICAgICAgIGRlc2NyaWJlIFwiYWRkIHByZXNldCBvY2N1cnJlbmNlXCIsIC0+XG4gICAgICAgICAgaXQgJ3NldCBzZWxlY3RlZC10ZXh0IGFzIHByZXNldCBvY2N1cnJlbmNlIG1hcmtlciBhbmQgbm90IG1vdmUgY3Vyc29yJywgLT5cbiAgICAgICAgICAgIGVuc3VyZSAndyB2IGwnLCBtb2RlOiBbJ3Zpc3VhbCcsICdjaGFyYWN0ZXJ3aXNlJ10sIHNlbGVjdGVkVGV4dDogJ3RlJ1xuICAgICAgICAgICAgZW5zdXJlICdnIG8nLCBtb2RlOiAnbm9ybWFsJywgb2NjdXJyZW5jZVRleHQ6IFsndGUnLCAndGUnLCAndGUnXVxuICAgICAgICBkZXNjcmliZSBcImlzLW5hcnJvd2VkIHNlbGVjdGlvblwiLCAtPlxuICAgICAgICAgIFt0ZXh0T3JpZ2luYWxdID0gW11cbiAgICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgICB0ZXh0T3JpZ2luYWwgPSBcIlwiXCJcbiAgICAgICAgICAgICAgVGhpcyB0ZXh0IGhhdmUgMyBpbnN0YW5jZSBvZiAndGV4dCcgaW4gdGhlIHdob2xlIHRleHRcbiAgICAgICAgICAgICAgVGhpcyB0ZXh0IGhhdmUgMyBpbnN0YW5jZSBvZiAndGV4dCcgaW4gdGhlIHdob2xlIHRleHRcXG5cbiAgICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICBzZXRcbiAgICAgICAgICAgICAgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgICAgICAgdGV4dDogdGV4dE9yaWdpbmFsXG4gICAgICAgICAgaXQgXCJwaWNrIG9jdXJyZW5jZS13b3JkIGZyb20gY3Vyc29yIHBvc2l0aW9uIGFuZCBjb250aW51ZSB2aXN1YWwtbW9kZVwiLCAtPlxuICAgICAgICAgICAgZW5zdXJlICd3IFYgaicsIG1vZGU6IFsndmlzdWFsJywgJ2xpbmV3aXNlJ10sIHNlbGVjdGVkVGV4dDogdGV4dE9yaWdpbmFsXG4gICAgICAgICAgICBlbnN1cmUgJ2cgbycsXG4gICAgICAgICAgICAgIG1vZGU6IFsndmlzdWFsJywgJ2xpbmV3aXNlJ11cbiAgICAgICAgICAgICAgc2VsZWN0ZWRUZXh0OiB0ZXh0T3JpZ2luYWxcbiAgICAgICAgICAgICAgb2NjdXJyZW5jZVRleHQ6IFsndGV4dCcsICd0ZXh0JywgJ3RleHQnLCAndGV4dCcsICd0ZXh0JywgJ3RleHQnXVxuICAgICAgICAgICAgZW5zdXJlICdyICEnLFxuICAgICAgICAgICAgICBtb2RlOiAnbm9ybWFsJ1xuICAgICAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgICAgVGhpcyAhISEhIGhhdmUgMyBpbnN0YW5jZSBvZiAnISEhIScgaW4gdGhlIHdob2xlICEhISFcbiAgICAgICAgICAgICAgVGhpcyAhISEhIGhhdmUgMyBpbnN0YW5jZSBvZiAnISEhIScgaW4gdGhlIHdob2xlICEhISFcXG5cbiAgICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgIGRlc2NyaWJlIFwiaW4gaW5jcmVtZW50YWwtc2VhcmNoXCIsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBzZXR0aW5ncy5zZXQoJ2luY3JlbWVudGFsU2VhcmNoJywgdHJ1ZSlcblxuICAgICAgICBkZXNjcmliZSBcImFkZC1vY2N1cnJlbmNlLXBhdHRlcm4tZnJvbS1zZWFyY2hcIiwgLT5cbiAgICAgICAgICBpdCAnbWFyayBhcyBvY2N1cnJlbmNlIHdoaWNoIG1hdGNoZXMgcmVnZXggZW50ZXJlZCBpbiBzZWFyY2gtdWknLCAtPlxuICAgICAgICAgICAga2V5c3Ryb2tlICcvJ1xuICAgICAgICAgICAgaW5wdXRTZWFyY2hUZXh0KCdcXFxcYnRcXFxcdysnKVxuICAgICAgICAgICAgZGlzcGF0Y2hTZWFyY2hDb21tYW5kKCd2aW0tbW9kZS1wbHVzOmFkZC1vY2N1cnJlbmNlLXBhdHRlcm4tZnJvbS1zZWFyY2gnKVxuICAgICAgICAgICAgZW5zdXJlXG4gICAgICAgICAgICAgIG9jY3VycmVuY2VUZXh0OiBbJ3RleHQnLCAndGV4dCcsICd0aGUnLCAndGV4dCddXG5cbiAgICBkZXNjcmliZSBcIm11dGF0ZSBwcmVzZXQgb2NjdXJyZW5jZVwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXQgdGV4dDogXCJcIlwiXG4gICAgICAgIG9vbzogeHh4OiBvb28geHh4OiBvb286XG4gICAgICAgICEhITogb29vOiB4eHg6IG9vbyB4eHg6IG9vbzpcbiAgICAgICAgXCJcIlwiXG4gICAgICAgIGN1cnNvcjogWzAsIDBdXG5cbiAgICAgIGRlc2NyaWJlIFwibm9ybWFsLW1vZGVcIiwgLT5cbiAgICAgICAgaXQgJ1tkZWxldGVdIGFwcGx5IG9wZXJhdGlvbiB0byBwcmVzZXQtbWFya2VyIGludGVyc2VjdGluZyBzZWxlY3RlZCB0YXJnZXQnLCAtPlxuICAgICAgICAgIGVuc3VyZSAnbCBnIG8gRCcsXG4gICAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIDogeHh4OiAgeHh4OiA6XG4gICAgICAgICAgICAhISE6IG9vbzogeHh4OiBvb28geHh4OiBvb286XG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgaXQgJ1t1cGNhc2VdIGFwcGx5IG9wZXJhdGlvbiB0byBwcmVzZXQtbWFya2VyIGludGVyc2VjdGluZyBzZWxlY3RlZCB0YXJnZXQnLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFswLCA2XVxuICAgICAgICAgIGVuc3VyZSAnbCBnIG8gZyBVIGonLFxuICAgICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICBvb286IFhYWDogb29vIFhYWDogb29vOlxuICAgICAgICAgICAgISEhOiBvb286IFhYWDogb29vIFhYWDogb29vOlxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgIGl0ICdbdXBjYXNlIGV4Y2x1ZGVdIHdvblxcJ3QgbXV0YXRlIHJlbW92ZWQgbWFya2VyJywgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgICBlbnN1cmUgJ2cgbycsIG9jY3VycmVuY2VDb3VudDogNlxuICAgICAgICAgIGVuc3VyZSAnZyBvJywgb2NjdXJyZW5jZUNvdW50OiA1XG4gICAgICAgICAgZW5zdXJlICdnIFUgaicsXG4gICAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIG9vbzogeHh4OiBPT08geHh4OiBPT086XG4gICAgICAgICAgICAhISE6IE9PTzogeHh4OiBPT08geHh4OiBPT086XG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgaXQgJ1tkZWxldGVdIGFwcGx5IG9wZXJhdGlvbiB0byBwcmVzZXQtbWFya2VyIGludGVyc2VjdGluZyBzZWxlY3RlZCB0YXJnZXQnLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFswLCAxMF1cbiAgICAgICAgICBlbnN1cmUgJ2cgbyBnIFUgJCcsXG4gICAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIG9vbzogeHh4OiBPT08geHh4OiBPT086XG4gICAgICAgICAgICAhISE6IG9vbzogeHh4OiBvb28geHh4OiBvb286XG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgaXQgJ1tjaGFuZ2VdIGFwcGx5IG9wZXJhdGlvbiB0byBwcmVzZXQtbWFya2VyIGludGVyc2VjdGluZyBzZWxlY3RlZCB0YXJnZXQnLCAtPlxuICAgICAgICAgIGVuc3VyZSAnbCBnIG8gQycsXG4gICAgICAgICAgICBtb2RlOiAnaW5zZXJ0J1xuICAgICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICA6IHh4eDogIHh4eDogOlxuICAgICAgICAgICAgISEhOiBvb286IHh4eDogb29vIHh4eDogb29vOlxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoJ1lZWScpXG4gICAgICAgICAgZW5zdXJlICdsIGcgbyBDJyxcbiAgICAgICAgICAgIG1vZGU6ICdpbnNlcnQnXG4gICAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIFlZWTogeHh4OiBZWVkgeHh4OiBZWVk6XG4gICAgICAgICAgICAhISE6IG9vbzogeHh4OiBvb28geHh4OiBvb286XG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgIG51bUN1cnNvcnM6IDNcbiAgICAgICAgZGVzY3JpYmUgXCJwcmVkZWZpbmVkIGtleW1hcCBvbiB3aGVuIGhhcy1vY2N1cnJlbmNlXCIsIC0+XG4gICAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgICAgc2V0XG4gICAgICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAgICAgVmltIGlzIGVkaXRvciBJIHVzZWQgYmVmb3JlXG4gICAgICAgICAgICAgIFZ8aW0gaXMgZWRpdG9yIEkgdXNlZCBiZWZvcmVcbiAgICAgICAgICAgICAgVmltIGlzIGVkaXRvciBJIHVzZWQgYmVmb3JlXG4gICAgICAgICAgICAgIFZpbSBpcyBlZGl0b3IgSSB1c2VkIGJlZm9yZVxuICAgICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICAgIGl0ICdbaW5zZXJ0LWF0LXN0YXJ0XSBhcHBseSBvcGVyYXRpb24gdG8gcHJlc2V0LW1hcmtlciBpbnRlcnNlY3Rpbmcgc2VsZWN0ZWQgdGFyZ2V0JywgLT5cbiAgICAgICAgICAgIGVuc3VyZSAnZyBvJywgb2NjdXJyZW5jZVRleHQ6IFsnVmltJywgJ1ZpbScsICdWaW0nLCAnVmltJ11cbiAgICAgICAgICAgIGNsYXNzTGlzdC5jb250YWlucygnaGFzLW9jY3VycmVuY2UnKVxuICAgICAgICAgICAgZW5zdXJlICd2IGsgSScsIG1vZGU6ICdpbnNlcnQnLCBudW1DdXJzb3JzOiAyXG4gICAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dChcInB1cmUtXCIpXG4gICAgICAgICAgICBlbnN1cmUgJ2VzY2FwZScsXG4gICAgICAgICAgICAgIG1vZGU6ICdub3JtYWwnXG4gICAgICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAgICAgcHVyZSEtVmltIGlzIGVkaXRvciBJIHVzZWQgYmVmb3JlXG4gICAgICAgICAgICAgIHB1cmV8LVZpbSBpcyBlZGl0b3IgSSB1c2VkIGJlZm9yZVxuICAgICAgICAgICAgICBWaW0gaXMgZWRpdG9yIEkgdXNlZCBiZWZvcmVcbiAgICAgICAgICAgICAgVmltIGlzIGVkaXRvciBJIHVzZWQgYmVmb3JlXG4gICAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgICAgaXQgJ1tpbnNlcnQtYWZ0ZXItc3RhcnRdIGFwcGx5IG9wZXJhdGlvbiB0byBwcmVzZXQtbWFya2VyIGludGVyc2VjdGluZyBzZWxlY3RlZCB0YXJnZXQnLCAtPlxuICAgICAgICAgICAgc2V0IGN1cnNvcjogWzEsIDFdXG4gICAgICAgICAgICBlbnN1cmUgJ2cgbycsIG9jY3VycmVuY2VUZXh0OiBbJ1ZpbScsICdWaW0nLCAnVmltJywgJ1ZpbSddXG4gICAgICAgICAgICBjbGFzc0xpc3QuY29udGFpbnMoJ2hhcy1vY2N1cnJlbmNlJylcbiAgICAgICAgICAgIGVuc3VyZSAndiBqIEEnLCBtb2RlOiAnaW5zZXJ0JywgbnVtQ3Vyc29yczogMlxuICAgICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoXCIgYW5kIEVtYWNzXCIpXG4gICAgICAgICAgICBlbnN1cmUgJ2VzY2FwZScsXG4gICAgICAgICAgICAgIG1vZGU6ICdub3JtYWwnXG4gICAgICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAgICAgVmltIGlzIGVkaXRvciBJIHVzZWQgYmVmb3JlXG4gICAgICAgICAgICAgIFZpbSBhbmQgRW1hY3xzIGlzIGVkaXRvciBJIHVzZWQgYmVmb3JlXG4gICAgICAgICAgICAgIFZpbSBhbmQgRW1hYyFzIGlzIGVkaXRvciBJIHVzZWQgYmVmb3JlXG4gICAgICAgICAgICAgIFZpbSBpcyBlZGl0b3IgSSB1c2VkIGJlZm9yZVxuICAgICAgICAgICAgICBcIlwiXCJcblxuICAgICAgZGVzY3JpYmUgXCJ2aXN1YWwtbW9kZVwiLCAtPlxuICAgICAgICBpdCAnW3VwY2FzZV0gYXBwbHkgdG8gcHJlc2V0LW1hcmtlciBhcyBsb25nIGFzIGl0IGludGVyc2VjdHMgc2VsZWN0aW9uJywgLT5cbiAgICAgICAgICBzZXRcbiAgICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAgIG9vbzogeHx4eDogb29vIHh4eDogb29vOlxuICAgICAgICAgICAgeHh4OiBvb286IHh4eDogb29vIHh4eDogb29vOlxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgZW5zdXJlICdnIG8nLCBvY2N1cnJlbmNlQ291bnQ6IDVcbiAgICAgICAgICBlbnN1cmUgJ3YgaiBVJyxcbiAgICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgb29vOiBYWFg6IG9vbyBYWFg6IG9vbzpcbiAgICAgICAgICAgIFhYWDogb29vOiB4eHg6IG9vbyB4eHg6IG9vbzpcbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICBkZXNjcmliZSBcInZpc3VhbC1saW5ld2lzZS1tb2RlXCIsIC0+XG4gICAgICAgIGl0ICdbdXBjYXNlXSBhcHBseSB0byBwcmVzZXQtbWFya2VyIGFzIGxvbmcgYXMgaXQgaW50ZXJzZWN0cyBzZWxlY3Rpb24nLCAtPlxuICAgICAgICAgIHNldFxuICAgICAgICAgICAgY3Vyc29yOiBbMCwgNl1cbiAgICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgb29vOiB4eHg6IG9vbyB4eHg6IG9vbzpcbiAgICAgICAgICAgIHh4eDogb29vOiB4eHg6IG9vbyB4eHg6IG9vbzpcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIGVuc3VyZSAnZyBvJywgb2NjdXJyZW5jZUNvdW50OiA1XG4gICAgICAgICAgZW5zdXJlICdWIFUnLFxuICAgICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICBvb286IFhYWDogb29vIFhYWDogb29vOlxuICAgICAgICAgICAgeHh4OiBvb286IHh4eDogb29vIHh4eDogb29vOlxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgIGRlc2NyaWJlIFwidmlzdWFsLWJsb2Nrd2lzZS1tb2RlXCIsIC0+XG4gICAgICAgIGl0ICdbdXBjYXNlXSBhcHBseSB0byBwcmVzZXQtbWFya2VyIGFzIGxvbmcgYXMgaXQgaW50ZXJzZWN0cyBzZWxlY3Rpb24nLCAtPlxuICAgICAgICAgIHNldFxuICAgICAgICAgICAgY3Vyc29yOiBbMCwgNl1cbiAgICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgb29vOiB4eHg6IG9vbyB4eHg6IG9vbzpcbiAgICAgICAgICAgIHh4eDogb29vOiB4eHg6IG9vbyB4eHg6IG9vbzpcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIGVuc3VyZSAnZyBvJywgb2NjdXJyZW5jZUNvdW50OiA1XG4gICAgICAgICAgZW5zdXJlICdjdHJsLXYgaiAyIHcgVScsXG4gICAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIG9vbzogWFhYOiBvb28geHh4OiBvb286XG4gICAgICAgICAgICB4eHg6IG9vbzogWFhYOiBvb28geHh4OiBvb286XG4gICAgICAgICAgICBcIlwiXCJcblxuICAgIGRlc2NyaWJlIFwiTW92ZVRvTmV4dE9jY3VycmVuY2UsIE1vdmVUb1ByZXZpb3VzT2NjdXJyZW5jZVwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgfG9vbzogeHh4OiBvb29cbiAgICAgICAgICBfX186IG9vbzogeHh4OlxuICAgICAgICAgIG9vbzogeHh4OiBvb286XG4gICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgZW5zdXJlICdnIG8nLFxuICAgICAgICAgIG9jY3VycmVuY2VUZXh0OiBbJ29vbycsICdvb28nLCAnb29vJywgJ29vbycsICdvb28nXVxuXG4gICAgICBkZXNjcmliZSBcInRhYiwgc2hpZnQtdGFiXCIsIC0+XG4gICAgICAgIGRlc2NyaWJlIFwiY3Vyc29yIGlzIGF0IHN0YXJ0IG9mIG9jY3VycmVuY2VcIiwgLT5cbiAgICAgICAgICBpdCBcInNlYXJjaCBuZXh0L3ByZXZpb3VzIG9jY3VycmVuY2UgbWFya2VyXCIsIC0+XG4gICAgICAgICAgICBlbnN1cmUgJ3RhYiB0YWInLCBjdXJzb3I6IFsxLCA1XVxuICAgICAgICAgICAgZW5zdXJlICcyIHRhYicsIGN1cnNvcjogWzIsIDEwXVxuICAgICAgICAgICAgZW5zdXJlICcyIHNoaWZ0LXRhYicsIGN1cnNvcjogWzEsIDVdXG4gICAgICAgICAgICBlbnN1cmUgJzIgc2hpZnQtdGFiJywgY3Vyc29yOiBbMCwgMF1cblxuICAgICAgICBkZXNjcmliZSBcIndoZW4gY3Vyc29yIGlzIGluc2lkZSBvZiBvY2N1cnJlbmNlXCIsIC0+XG4gICAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgICAgZW5zdXJlIFwiZXNjYXBlXCIsIG9jY3VycmVuY2VDb3VudDogMFxuICAgICAgICAgICAgc2V0IHRleHRDOiBcIm9vb28gb298b28gb29vb1wiXG4gICAgICAgICAgICBlbnN1cmUgJ2cgbycsIG9jY3VycmVuY2VDb3VudDogM1xuXG4gICAgICAgICAgZGVzY3JpYmUgXCJ0YWJcIiwgLT5cbiAgICAgICAgICAgIGl0IFwibW92ZSB0byBuZXh0IG9jY3VycmVuY2VcIiwgLT5cbiAgICAgICAgICAgICAgZW5zdXJlICd0YWInLCB0ZXh0QzogJ29vb28gb29vbyB8b29vbydcblxuICAgICAgICAgIGRlc2NyaWJlIFwic2hpZnQtdGFiXCIsIC0+XG4gICAgICAgICAgICBpdCBcIm1vdmUgdG8gcHJldmlvdXMgb2NjdXJyZW5jZVwiLCAtPlxuICAgICAgICAgICAgICBlbnN1cmUgJ3NoaWZ0LXRhYicsIHRleHRDOiAnfG9vb28gb29vbyBvb29vJ1xuXG4gICAgICBkZXNjcmliZSBcImFzIG9wZXJhdG9yJ3MgdGFyZ2V0XCIsIC0+XG4gICAgICAgIGRlc2NyaWJlIFwidGFiXCIsIC0+XG4gICAgICAgICAgaXQgXCJvcGVyYXRlIG9uIG5leHQgb2NjdXJyZW5jZSBhbmQgcmVwZWF0YWJsZVwiLCAtPlxuICAgICAgICAgICAgZW5zdXJlIFwiZyBVIHRhYlwiLFxuICAgICAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgICAgT09POiB4eHg6IE9PT1xuICAgICAgICAgICAgICBfX186IG9vbzogeHh4OlxuICAgICAgICAgICAgICBvb286IHh4eDogb29vOlxuICAgICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgICAgb2NjdXJyZW5jZUNvdW50OiAzXG4gICAgICAgICAgICBlbnN1cmUgXCIuXCIsXG4gICAgICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgICBPT086IHh4eDogT09PXG4gICAgICAgICAgICAgIF9fXzogT09POiB4eHg6XG4gICAgICAgICAgICAgIG9vbzogeHh4OiBvb286XG4gICAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgICBvY2N1cnJlbmNlQ291bnQ6IDJcbiAgICAgICAgICAgIGVuc3VyZSBcIjIgLlwiLFxuICAgICAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgICAgT09POiB4eHg6IE9PT1xuICAgICAgICAgICAgICBfX186IE9PTzogeHh4OlxuICAgICAgICAgICAgICBPT086IHh4eDogT09POlxuICAgICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgICAgb2NjdXJyZW5jZUNvdW50OiAwXG4gICAgICAgICAgICBleHBlY3QoY2xhc3NMaXN0LmNvbnRhaW5zKCdoYXMtb2NjdXJyZW5jZScpKS50b0JlKGZhbHNlKVxuXG4gICAgICAgICAgaXQgXCJbby1tb2RpZmllcl0gb3BlcmF0ZSBvbiBuZXh0IG9jY3VycmVuY2UgYW5kIHJlcGVhdGFibGVcIiwgLT5cbiAgICAgICAgICAgIGVuc3VyZSBcImVzY2FwZVwiLFxuICAgICAgICAgICAgICBtb2RlOiAnbm9ybWFsJ1xuICAgICAgICAgICAgICBvY2N1cnJlbmNlQ291bnQ6IDBcblxuICAgICAgICAgICAgZW5zdXJlIFwiZyBVIG8gdGFiXCIsXG4gICAgICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgICBPT086IHh4eDogT09PXG4gICAgICAgICAgICAgIF9fXzogb29vOiB4eHg6XG4gICAgICAgICAgICAgIG9vbzogeHh4OiBvb286XG4gICAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgICBvY2N1cnJlbmNlQ291bnQ6IDBcblxuICAgICAgICAgICAgZW5zdXJlIFwiLlwiLFxuICAgICAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgICAgT09POiB4eHg6IE9PT1xuICAgICAgICAgICAgICBfX186IE9PTzogeHh4OlxuICAgICAgICAgICAgICBvb286IHh4eDogb29vOlxuICAgICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgICAgb2NjdXJyZW5jZUNvdW50OiAwXG5cbiAgICAgICAgICAgIGVuc3VyZSBcIjIgLlwiLFxuICAgICAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgICAgT09POiB4eHg6IE9PT1xuICAgICAgICAgICAgICBfX186IE9PTzogeHh4OlxuICAgICAgICAgICAgICBPT086IHh4eDogT09POlxuICAgICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgICAgb2NjdXJyZW5jZUNvdW50OiAwXG5cbiAgICAgICAgZGVzY3JpYmUgXCJzaGlmdC10YWJcIiwgLT5cbiAgICAgICAgICBpdCBcIm9wZXJhdGUgb24gbmV4dCBwcmV2aW91cyBhbmQgcmVwZWF0YWJsZVwiLCAtPlxuICAgICAgICAgICAgc2V0IGN1cnNvcjogWzIsIDEwXVxuICAgICAgICAgICAgZW5zdXJlIFwiZyBVIHNoaWZ0LXRhYlwiLFxuICAgICAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgICAgb29vOiB4eHg6IG9vb1xuICAgICAgICAgICAgICBfX186IG9vbzogeHh4OlxuICAgICAgICAgICAgICBPT086IHh4eDogT09POlxuICAgICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgICAgb2NjdXJyZW5jZUNvdW50OiAzXG4gICAgICAgICAgICBlbnN1cmUgXCIuXCIsXG4gICAgICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgICBvb286IHh4eDogb29vXG4gICAgICAgICAgICAgIF9fXzogT09POiB4eHg6XG4gICAgICAgICAgICAgIE9PTzogeHh4OiBPT086XG4gICAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgICBvY2N1cnJlbmNlQ291bnQ6IDJcbiAgICAgICAgICAgIGVuc3VyZSBcIjIgLlwiLFxuICAgICAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgICAgT09POiB4eHg6IE9PT1xuICAgICAgICAgICAgICBfX186IE9PTzogeHh4OlxuICAgICAgICAgICAgICBPT086IHh4eDogT09POlxuICAgICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgICAgb2NjdXJyZW5jZUNvdW50OiAwXG4gICAgICAgICAgICBleHBlY3QoY2xhc3NMaXN0LmNvbnRhaW5zKCdoYXMtb2NjdXJyZW5jZScpKS50b0JlKGZhbHNlKVxuXG4gICAgICBkZXNjcmliZSBcImV4Y3VkZSBwYXJ0aWN1bGFyIG9jY3VyZW5jZSBieSBgLmAgcmVwZWF0XCIsIC0+XG4gICAgICAgIGl0IFwiY2xlYXIgcHJlc2V0LW9jY3VycmVuY2UgYW5kIG1vdmUgdG8gbmV4dFwiLCAtPlxuICAgICAgICAgIGVuc3VyZSAnMiB0YWIgLiBnIFUgaSBwJyxcbiAgICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAgIE9PTzogeHh4OiBPT09cbiAgICAgICAgICAgIF9fXzogfG9vbzogeHh4OlxuICAgICAgICAgICAgT09POiB4eHg6IE9PTzpcbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGl0IFwiY2xlYXIgcHJlc2V0LW9jY3VycmVuY2UgYW5kIG1vdmUgdG8gcHJldmlvdXNcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJzIgc2hpZnQtdGFiIC4gZyBVIGkgcCcsXG4gICAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICBPT086IHh4eDogT09PXG4gICAgICAgICAgICBfX186IE9PTzogeHh4OlxuICAgICAgICAgICAgfG9vbzogeHh4OiBPT086XG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgZGVzY3JpYmUgXCJ3aGVuIG11bHRpcGxlIHByZXNldC1vY2N1cnJlbmNlIGNyZWF0ZWQgYXQgZGlmZmVyZW50IHRpbWluZ1wiLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgc2V0XG4gICAgICAgICAgICBjdXJzb3I6IFswLCA1XVxuICAgICAgICAgIGVuc3VyZSAnZyBvJyxcbiAgICAgICAgICAgIG9jY3VycmVuY2VUZXh0OiBbJ29vbycsICdvb28nLCAnb29vJywgJ29vbycsICdvb28nLCAneHh4JywgJ3h4eCcsICd4eHgnXVxuXG4gICAgICAgIGl0IFwidmlzaXQgb2NjdXJyZW5jZXMgb3JkZXJlZCBieSBidWZmZXIgcG9zaXRpb25cIiwgLT5cbiAgICAgICAgICBlbnN1cmUgXCJ0YWJcIiwgICAgICAgdGV4dEM6IFwib29vOiB4eHg6IHxvb29cXG5fX186IG9vbzogeHh4Olxcbm9vbzogeHh4OiBvb286XCJcbiAgICAgICAgICBlbnN1cmUgXCJ0YWJcIiwgICAgICAgdGV4dEM6IFwib29vOiB4eHg6IG9vb1xcbl9fXzogfG9vbzogeHh4Olxcbm9vbzogeHh4OiBvb286XCJcbiAgICAgICAgICBlbnN1cmUgXCJ0YWJcIiwgICAgICAgdGV4dEM6IFwib29vOiB4eHg6IG9vb1xcbl9fXzogb29vOiB8eHh4Olxcbm9vbzogeHh4OiBvb286XCJcbiAgICAgICAgICBlbnN1cmUgXCJ0YWJcIiwgICAgICAgdGV4dEM6IFwib29vOiB4eHg6IG9vb1xcbl9fXzogb29vOiB4eHg6XFxufG9vbzogeHh4OiBvb286XCJcbiAgICAgICAgICBlbnN1cmUgXCJ0YWJcIiwgICAgICAgdGV4dEM6IFwib29vOiB4eHg6IG9vb1xcbl9fXzogb29vOiB4eHg6XFxub29vOiB8eHh4OiBvb286XCJcbiAgICAgICAgICBlbnN1cmUgXCJ0YWJcIiwgICAgICAgdGV4dEM6IFwib29vOiB4eHg6IG9vb1xcbl9fXzogb29vOiB4eHg6XFxub29vOiB4eHg6IHxvb286XCJcbiAgICAgICAgICBlbnN1cmUgXCJzaGlmdC10YWJcIiwgdGV4dEM6IFwib29vOiB4eHg6IG9vb1xcbl9fXzogb29vOiB4eHg6XFxub29vOiB8eHh4OiBvb286XCJcbiAgICAgICAgICBlbnN1cmUgXCJzaGlmdC10YWJcIiwgdGV4dEM6IFwib29vOiB4eHg6IG9vb1xcbl9fXzogb29vOiB4eHg6XFxufG9vbzogeHh4OiBvb286XCJcbiAgICAgICAgICBlbnN1cmUgXCJzaGlmdC10YWJcIiwgdGV4dEM6IFwib29vOiB4eHg6IG9vb1xcbl9fXzogb29vOiB8eHh4Olxcbm9vbzogeHh4OiBvb286XCJcbiAgICAgICAgICBlbnN1cmUgXCJzaGlmdC10YWJcIiwgdGV4dEM6IFwib29vOiB4eHg6IG9vb1xcbl9fXzogfG9vbzogeHh4Olxcbm9vbzogeHh4OiBvb286XCJcbiAgICAgICAgICBlbnN1cmUgXCJzaGlmdC10YWJcIiwgdGV4dEM6IFwib29vOiB4eHg6IHxvb29cXG5fX186IG9vbzogeHh4Olxcbm9vbzogeHh4OiBvb286XCJcblxuICAgIGRlc2NyaWJlIFwiZXhwbGljdCBvcGVyYXRvci1tb2RpZmllciBvIGFuZCBwcmVzZXQtbWFya2VyXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICB8b29vOiB4eHg6IG9vbyB4eHg6IG9vbzpcbiAgICAgICAgICBfX186IG9vbzogeHh4OiBvb28geHh4OiBvb286XG4gICAgICAgICAgXCJcIlwiXG5cbiAgICAgIGRlc2NyaWJlIFwiJ28nIG1vZGlmaWVyIHdoZW4gcHJlc2V0IG9jY3VycmVuY2UgYWxyZWFkeSBleGlzdHNcIiwgLT5cbiAgICAgICAgaXQgXCInbycgYWx3YXlzIHBpY2sgY3Vyc29yLXdvcmQgYW5kIG92ZXJ3cml0ZSBleGlzdGluZyBwcmVzZXQgbWFya2VyKVwiLCAtPlxuICAgICAgICAgIGVuc3VyZSBcImcgb1wiLFxuICAgICAgICAgICAgb2NjdXJyZW5jZVRleHQ6IFtcIm9vb1wiLCBcIm9vb1wiLCBcIm9vb1wiLCBcIm9vb1wiLCBcIm9vb1wiLCBcIm9vb1wiXVxuICAgICAgICAgIGVuc3VyZSBcIjIgdyBkIG9cIixcbiAgICAgICAgICAgIG9jY3VycmVuY2VUZXh0OiBbXCJ4eHhcIiwgXCJ4eHhcIiwgXCJ4eHhcIiwgXCJ4eHhcIl1cbiAgICAgICAgICAgIG1vZGU6ICdvcGVyYXRvci1wZW5kaW5nJ1xuICAgICAgICAgIGVuc3VyZSBcImpcIixcbiAgICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgb29vOiA6IG9vbyA6IG9vbzpcbiAgICAgICAgICAgIF9fXzogb29vOiA6IG9vbyA6IG9vbzpcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgbW9kZTogJ25vcm1hbCdcblxuICAgICAgZGVzY3JpYmUgXCJvY2N1cnJlbmNlIGJvdW5kIG9wZXJhdG9yIGRvbid0IG92ZXJ3aXRlIHByZS1leGlzdGluZyBwcmVzZXQgbWFya2VyXCIsIC0+XG4gICAgICAgIGl0IFwiJ28nIGFsd2F5cyBwaWNrIGN1cnNvci13b3JkIGFuZCBjbGVhciBleGlzdGluZyBwcmVzZXQgbWFya2VyXCIsIC0+XG4gICAgICAgICAgZW5zdXJlIFwiZyBvXCIsXG4gICAgICAgICAgICBvY2N1cnJlbmNlVGV4dDogW1wib29vXCIsIFwib29vXCIsIFwib29vXCIsIFwib29vXCIsIFwib29vXCIsIFwib29vXCJdXG4gICAgICAgICAgZW5zdXJlIFwiMiB3IGcgY21kLWRcIixcbiAgICAgICAgICAgIG9jY3VycmVuY2VUZXh0OiBbXCJvb29cIiwgXCJvb29cIiwgXCJvb29cIiwgXCJvb29cIiwgXCJvb29cIiwgXCJvb29cIl1cbiAgICAgICAgICAgIG1vZGU6ICdvcGVyYXRvci1wZW5kaW5nJ1xuICAgICAgICAgIGVuc3VyZSBcImpcIixcbiAgICAgICAgICAgc2VsZWN0ZWRUZXh0OiBbXCJvb29cIiwgXCJvb29cIiwgXCJvb29cIiwgXCJvb29cIiwgXCJvb29cIiwgXCJvb29cIl1cblxuICAgIGRlc2NyaWJlIFwidG9nZ2xlLXByZXNldC1zdWJ3b3JkLW9jY3VycmVuY2UgY29tbWFuZHNcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dEM6IFwiXCJcIlxuXG4gICAgICAgICAgY2FtZWxDYXxzZSBDYXNlc1xuICAgICAgICAgIFwiQ2FzZVN0dWR5XCIgU25ha2VDYXNlXG4gICAgICAgICAgVVBfQ0FTRVxuXG4gICAgICAgICAgb3RoZXIgUGFyYWdyYXBoQ2FzZVxuICAgICAgICAgIFwiXCJcIlxuXG4gICAgICBkZXNjcmliZSBcImFkZCBwcmVzZXQgc3Vid29yZC1vY2N1cnJlbmNlXCIsIC0+XG4gICAgICAgIGl0IFwibWFyayBzdWJ3b3JkIHVuZGVyIGN1cnNvclwiLCAtPlxuICAgICAgICAgIGVuc3VyZSAnZyBPJywgb2NjdXJyZW5jZVRleHQ6IFsnQ2FzZScsICdDYXNlJywgJ0Nhc2UnLCAnQ2FzZSddXG5cbiAgZGVzY3JpYmUgXCJsaW5ld2lzZS1ib3VuZC1vcGVyYXRpb24gaW4gb2NjdXJyZW5jZSBvcGVyYXRpb25cIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAgICAgYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoXCJsYW5ndWFnZS1qYXZhc2NyaXB0XCIpXG5cbiAgICAgIHJ1bnMgLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgZ3JhbW1hcjogJ3NvdXJjZS5qcydcbiAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgZnVuY3Rpb24gaGVsbG8obmFtZSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJkZWJ1Zy0xXCIpXG4gICAgICAgICAgICB8Y29uc29sZS5sb2coXCJkZWJ1Zy0yXCIpXG5cbiAgICAgICAgICAgIGNvbnN0IGdyZWV0aW5nID0gXCJoZWxsb1wiXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcImRlYnVnLTNcIilcblxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJkZWJ1Zy00LCBpbmNsdWQgYGNvbnNvbGVgIHdvcmRcIilcbiAgICAgICAgICAgIHJldHVycm4gbmFtZSArIFwiIFwiICsgZ3JlZXRpbmdcbiAgICAgICAgICB9XG4gICAgICAgICAgXCJcIlwiXG5cbiAgICBkZXNjcmliZSBcIndpdGggcHJlc2V0LW9jY3VycmVuY2VcIiwgLT5cbiAgICAgIGl0IFwid29ya3MgY2hhcmFjdGVyd2lzZSBmb3IgYGRlbGV0ZWAgb3BlcmF0b3JcIiwgLT5cbiAgICAgICAgZW5zdXJlIFwiZyBvIHYgaSBmXCIsIG1vZGU6IFsndmlzdWFsJywgJ2xpbmV3aXNlJ11cbiAgICAgICAgZW5zdXJlIFwiZFwiLFxuICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICBmdW5jdGlvbiBoZWxsbyhuYW1lKSB7XG4gICAgICAgICAgICB8LmxvZyhcImRlYnVnLTFcIilcbiAgICAgICAgICAgIC5sb2coXCJkZWJ1Zy0yXCIpXG5cbiAgICAgICAgICAgIGNvbnN0IGdyZWV0aW5nID0gXCJoZWxsb1wiXG4gICAgICAgICAgICAubG9nKFwiZGVidWctM1wiKVxuXG4gICAgICAgICAgICAubG9nKFwiZGVidWctNCwgaW5jbHVkIGBgIHdvcmRcIilcbiAgICAgICAgICAgIHJldHVycm4gbmFtZSArIFwiIFwiICsgZ3JlZXRpbmdcbiAgICAgICAgICB9XG4gICAgICAgICAgXCJcIlwiXG4gICAgICBpdCBcIndvcmtzIGxpbmV3aXNlIGZvciBgZGVsZXRlLWxpbmVgIG9wZXJhdG9yXCIsIC0+XG4gICAgICAgIGVuc3VyZSBcImcgbyB2IGkgZiBEXCIsXG4gICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgIGZ1bmN0aW9uIGhlbGxvKG5hbWUpIHtcbiAgICAgICAgICB8XG4gICAgICAgICAgICBjb25zdCBncmVldGluZyA9IFwiaGVsbG9cIlxuXG4gICAgICAgICAgICByZXR1cnJuIG5hbWUgKyBcIiBcIiArIGdyZWV0aW5nXG4gICAgICAgICAgfVxuICAgICAgICAgIFwiXCJcIlxuICAgIGRlc2NyaWJlIFwid2hlbiBzcGVjaWZpZWQgYm90aCBvIGFuZCBWIG9wZXJhdG9yLW1vZGlmaWVyXCIsIC0+XG4gICAgICBpdCBcImRlbGV0ZSBgY29uc29sZWAgaW5jbHVkaW5nIGxpbmUgYnkgYFZgIG1vZGlmaWVyXCIsIC0+XG4gICAgICAgIGVuc3VyZSBcImQgbyBWIGZcIixcbiAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgZnVuY3Rpb24gaGVsbG8obmFtZSkge1xuICAgICAgICAgIHxcbiAgICAgICAgICAgIGNvbnN0IGdyZWV0aW5nID0gXCJoZWxsb1wiXG5cbiAgICAgICAgICAgIHJldHVycm4gbmFtZSArIFwiIFwiICsgZ3JlZXRpbmdcbiAgICAgICAgICB9XG4gICAgICAgICAgXCJcIlwiXG4gICAgICBpdCBcInVwcGVyLWNhc2UgYGNvbnNvbGVgIGluY2x1ZGluZyBsaW5lIGJ5IGBWYCBtb2RpZmllclwiLCAtPlxuICAgICAgICBlbnN1cmUgXCJnIFUgbyBWIGZcIixcbiAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgZnVuY3Rpb24gaGVsbG8obmFtZSkge1xuICAgICAgICAgICAgQ09OU09MRS5MT0coXCJERUJVRy0xXCIpXG4gICAgICAgICAgICB8Q09OU09MRS5MT0coXCJERUJVRy0yXCIpXG5cbiAgICAgICAgICAgIGNvbnN0IGdyZWV0aW5nID0gXCJoZWxsb1wiXG4gICAgICAgICAgICBDT05TT0xFLkxPRyhcIkRFQlVHLTNcIilcblxuICAgICAgICAgICAgQ09OU09MRS5MT0coXCJERUJVRy00LCBJTkNMVUQgYENPTlNPTEVgIFdPUkRcIilcbiAgICAgICAgICAgIHJldHVycm4gbmFtZSArIFwiIFwiICsgZ3JlZXRpbmdcbiAgICAgICAgICB9XG4gICAgICAgICAgXCJcIlwiXG4gICAgZGVzY3JpYmUgXCJ3aXRoIG8gb3BlcmF0b3ItbW9kaWZpZXJcIiwgLT5cbiAgICAgIGl0IFwidG9nZ2xlLWxpbmUtY29tbWVudHMgb2YgYG9jY3VycmVuY2VgIGluY2xkaW5nICoqbGluZXMqKlwiLCAtPlxuICAgICAgICBlbnN1cmUgXCJnIC8gbyBmXCIsXG4gICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgIGZ1bmN0aW9uIGhlbGxvKG5hbWUpIHtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwiZGVidWctMVwiKVxuICAgICAgICAgICAgLy8gfGNvbnNvbGUubG9nKFwiZGVidWctMlwiKVxuXG4gICAgICAgICAgICBjb25zdCBncmVldGluZyA9IFwiaGVsbG9cIlxuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coXCJkZWJ1Zy0zXCIpXG5cbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwiZGVidWctNCwgaW5jbHVkIGBjb25zb2xlYCB3b3JkXCIpXG4gICAgICAgICAgICByZXR1cnJuIG5hbWUgKyBcIiBcIiArIGdyZWV0aW5nXG4gICAgICAgICAgfVxuICAgICAgICAgIFwiXCJcIlxuICAgICAgICBlbnN1cmUgJy4nLFxuICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICBmdW5jdGlvbiBoZWxsbyhuYW1lKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcImRlYnVnLTFcIilcbiAgICAgICAgICAgIHxjb25zb2xlLmxvZyhcImRlYnVnLTJcIilcblxuICAgICAgICAgICAgY29uc3QgZ3JlZXRpbmcgPSBcImhlbGxvXCJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiZGVidWctM1wiKVxuXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcImRlYnVnLTQsIGluY2x1ZCBgY29uc29sZWAgd29yZFwiKVxuICAgICAgICAgICAgcmV0dXJybiBuYW1lICsgXCIgXCIgKyBncmVldGluZ1xuICAgICAgICAgIH1cbiAgICAgICAgICBcIlwiXCJcbiJdfQ==
