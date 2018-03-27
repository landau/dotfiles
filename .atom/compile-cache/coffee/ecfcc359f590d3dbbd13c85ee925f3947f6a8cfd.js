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
            textC: "\ncamel Cases\n\"Study\" Snake\nUP_CASE\n\n|other Paragraph"
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
    return describe("preset occurrence marker", function() {
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
        return describe("excude particular occurence by `.` repeat", function() {
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
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9zcGVjL29jY3VycmVuY2Utc3BlYy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLE1BQTZDLE9BQUEsQ0FBUSxlQUFSLENBQTdDLEVBQUMsNkJBQUQsRUFBYyx1QkFBZCxFQUF3Qix1QkFBeEIsRUFBa0M7O0VBQ2xDLFFBQUEsR0FBVyxPQUFBLENBQVEsaUJBQVI7O0VBRVgsUUFBQSxDQUFTLFlBQVQsRUFBdUIsU0FBQTtBQUNyQixRQUFBO0lBQUEsT0FBdUUsRUFBdkUsRUFBQyxhQUFELEVBQU0sZ0JBQU4sRUFBYyxtQkFBZCxFQUF5QixnQkFBekIsRUFBaUMsdUJBQWpDLEVBQWdELGtCQUFoRCxFQUEwRDtJQUMxRCxPQUFzQyxFQUF0QyxFQUFDLHNCQUFELEVBQWU7SUFDZixlQUFBLEdBQWtCLFNBQUMsSUFBRDthQUNoQixZQUFZLENBQUMsVUFBYixDQUF3QixJQUF4QjtJQURnQjtJQUVsQixxQkFBQSxHQUF3QixTQUFDLElBQUQ7YUFDdEIsUUFBQSxDQUFTLG1CQUFULEVBQThCLElBQTlCO0lBRHNCO0lBR3hCLFVBQUEsQ0FBVyxTQUFBO01BQ1QsV0FBQSxDQUFZLFNBQUMsS0FBRCxFQUFRLEdBQVI7UUFDVixRQUFBLEdBQVc7UUFDVix3QkFBRCxFQUFTO1FBQ1IsYUFBRCxFQUFNLG1CQUFOLEVBQWM7UUFDZCxTQUFBLEdBQVksYUFBYSxDQUFDO1FBQzFCLFlBQUEsR0FBZSxRQUFRLENBQUMsV0FBVyxDQUFDO2VBQ3BDLG1CQUFBLEdBQXNCLFFBQVEsQ0FBQyxXQUFXLENBQUM7TUFOakMsQ0FBWjthQVFBLElBQUEsQ0FBSyxTQUFBO2VBQ0gsT0FBTyxDQUFDLFdBQVIsQ0FBb0IsYUFBcEI7TUFERyxDQUFMO0lBVFMsQ0FBWDtJQVlBLFFBQUEsQ0FBUyw4QkFBVCxFQUF5QyxTQUFB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Q0FBckM7RUFoakJxQixDQUF2QjtBQUhBIiwic291cmNlc0NvbnRlbnQiOlsie2dldFZpbVN0YXRlLCBkaXNwYXRjaCwgVGV4dERhdGEsIGdldFZpZXd9ID0gcmVxdWlyZSAnLi9zcGVjLWhlbHBlcidcbnNldHRpbmdzID0gcmVxdWlyZSAnLi4vbGliL3NldHRpbmdzJ1xuXG5kZXNjcmliZSBcIk9jY3VycmVuY2VcIiwgLT5cbiAgW3NldCwgZW5zdXJlLCBrZXlzdHJva2UsIGVkaXRvciwgZWRpdG9yRWxlbWVudCwgdmltU3RhdGUsIGNsYXNzTGlzdF0gPSBbXVxuICBbc2VhcmNoRWRpdG9yLCBzZWFyY2hFZGl0b3JFbGVtZW50XSA9IFtdXG4gIGlucHV0U2VhcmNoVGV4dCA9ICh0ZXh0KSAtPlxuICAgIHNlYXJjaEVkaXRvci5pbnNlcnRUZXh0KHRleHQpXG4gIGRpc3BhdGNoU2VhcmNoQ29tbWFuZCA9IChuYW1lKSAtPlxuICAgIGRpc3BhdGNoKHNlYXJjaEVkaXRvckVsZW1lbnQsIG5hbWUpXG5cbiAgYmVmb3JlRWFjaCAtPlxuICAgIGdldFZpbVN0YXRlIChzdGF0ZSwgdmltKSAtPlxuICAgICAgdmltU3RhdGUgPSBzdGF0ZVxuICAgICAge2VkaXRvciwgZWRpdG9yRWxlbWVudH0gPSB2aW1TdGF0ZVxuICAgICAge3NldCwgZW5zdXJlLCBrZXlzdHJva2V9ID0gdmltXG4gICAgICBjbGFzc0xpc3QgPSBlZGl0b3JFbGVtZW50LmNsYXNzTGlzdFxuICAgICAgc2VhcmNoRWRpdG9yID0gdmltU3RhdGUuc2VhcmNoSW5wdXQuZWRpdG9yXG4gICAgICBzZWFyY2hFZGl0b3JFbGVtZW50ID0gdmltU3RhdGUuc2VhcmNoSW5wdXQuZWRpdG9yRWxlbWVudFxuXG4gICAgcnVucyAtPlxuICAgICAgamFzbWluZS5hdHRhY2hUb0RPTShlZGl0b3JFbGVtZW50KVxuXG4gIGRlc2NyaWJlIFwib3BlcmF0b3ItbW9kaWZpZXItb2NjdXJyZW5jZVwiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNldFxuICAgICAgICB0ZXh0OiBcIlwiXCJcblxuICAgICAgICBvb286IHh4eDogb29vOlxuICAgICAgICAtLS06IG9vbzogeHh4OiBvb286XG4gICAgICAgIG9vbzogeHh4OiAtLS06IHh4eDogb29vOlxuICAgICAgICB4eHg6IC0tLTogb29vOiBvb286XG5cbiAgICAgICAgb29vOiB4eHg6IG9vbzpcbiAgICAgICAgLS0tOiBvb286IHh4eDogb29vOlxuICAgICAgICBvb286IHh4eDogLS0tOiB4eHg6IG9vbzpcbiAgICAgICAgeHh4OiAtLS06IG9vbzogb29vOlxuXG4gICAgICAgIFwiXCJcIlxuXG4gICAgZGVzY3JpYmUgXCJvIG1vZGlmaWVyXCIsIC0+XG4gICAgICBpdCBcImNoYW5nZSBvY2N1cnJlbmNlIG9mIGN1cnNvciB3b3JkIGluIGlubmVyLXBhcmFncmFwaFwiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMSwgMF1cbiAgICAgICAgZW5zdXJlIFwiYyBvIGkgcFwiLFxuICAgICAgICAgIG1vZGU6ICdpbnNlcnQnXG4gICAgICAgICAgdGV4dEM6IFwiXCJcIlxuXG4gICAgICAgICAgITogeHh4OiB8OlxuICAgICAgICAgIC0tLTogfDogeHh4OiB8OlxuICAgICAgICAgIHw6IHh4eDogLS0tOiB4eHg6IHw6XG4gICAgICAgICAgeHh4OiAtLS06IHw6IHw6XG5cbiAgICAgICAgICBvb286IHh4eDogb29vOlxuICAgICAgICAgIC0tLTogb29vOiB4eHg6IG9vbzpcbiAgICAgICAgICBvb286IHh4eDogLS0tOiB4eHg6IG9vbzpcbiAgICAgICAgICB4eHg6IC0tLTogb29vOiBvb286XG5cbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgZWRpdG9yLmluc2VydFRleHQoJz09PScpXG4gICAgICAgIGVuc3VyZSBcImVzY2FwZVwiLFxuICAgICAgICAgIG1vZGU6ICdub3JtYWwnXG4gICAgICAgICAgdGV4dEM6IFwiXCJcIlxuXG4gICAgICAgICAgPT0hPTogeHh4OiA9PXw9OlxuICAgICAgICAgIC0tLTogPT18PTogeHh4OiA9PXw9OlxuICAgICAgICAgID09fD06IHh4eDogLS0tOiB4eHg6ID09fD06XG4gICAgICAgICAgeHh4OiAtLS06ID09fD06ID09fD06XG5cbiAgICAgICAgICBvb286IHh4eDogb29vOlxuICAgICAgICAgIC0tLTogb29vOiB4eHg6IG9vbzpcbiAgICAgICAgICBvb286IHh4eDogLS0tOiB4eHg6IG9vbzpcbiAgICAgICAgICB4eHg6IC0tLTogb29vOiBvb286XG5cbiAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBlbnN1cmUgXCJ9IGogLlwiLFxuICAgICAgICAgIG1vZGU6ICdub3JtYWwnXG4gICAgICAgICAgdGV4dEM6IFwiXCJcIlxuXG4gICAgICAgICAgPT09OiB4eHg6ID09PTpcbiAgICAgICAgICAtLS06ID09PTogeHh4OiA9PT06XG4gICAgICAgICAgPT09OiB4eHg6IC0tLTogeHh4OiA9PT06XG4gICAgICAgICAgeHh4OiAtLS06ID09PTogPT09OlxuXG4gICAgICAgICAgPT0hPTogeHh4OiA9PXw9OlxuICAgICAgICAgIC0tLTogPT18PTogeHh4OiA9PXw9OlxuICAgICAgICAgID09fD06IHh4eDogLS0tOiB4eHg6ID09fD06XG4gICAgICAgICAgeHh4OiAtLS06ID09fD06ID09fD06XG5cbiAgICAgICAgICBcIlwiXCJcblxuICAgIGRlc2NyaWJlIFwiTyBtb2RpZmllclwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0QzogXCJcIlwiXG5cbiAgICAgICAgICBjYW1lbENhfHNlIENhc2VzXG4gICAgICAgICAgXCJDYXNlU3R1ZHlcIiBTbmFrZUNhc2VcbiAgICAgICAgICBVUF9DQVNFXG5cbiAgICAgICAgICBvdGhlciBQYXJhZ3JhcGhDYXNlXG4gICAgICAgICAgXCJcIlwiXG4gICAgICBpdCBcImRlbGV0ZSBzdWJ3b3JkLW9jY3VycmVuY2UgaW4gcGFyYWdyYXBoIGFuZCByZXBlYXRhYmxlXCIsIC0+XG4gICAgICAgIGVuc3VyZSBcImQgTyBwXCIsXG4gICAgICAgICAgdGV4dEM6IFwiXCJcIlxuXG4gICAgICAgICAgY2FtZWx8IENhc2VzXG4gICAgICAgICAgXCJTdHVkeVwiIFNuYWtlXG4gICAgICAgICAgVVBfQ0FTRVxuXG4gICAgICAgICAgb3RoZXIgUGFyYWdyYXBoQ2FzZVxuICAgICAgICAgIFwiXCJcIlxuICAgICAgICBlbnN1cmUgXCJHIC5cIixcbiAgICAgICAgICB0ZXh0QzogXCJcIlwiXG5cbiAgICAgICAgICBjYW1lbCBDYXNlc1xuICAgICAgICAgIFwiU3R1ZHlcIiBTbmFrZVxuICAgICAgICAgIFVQX0NBU0VcblxuICAgICAgICAgIHxvdGhlciBQYXJhZ3JhcGhcbiAgICAgICAgICBcIlwiXCJcblxuICAgIGRlc2NyaWJlIFwiYXBwbHkgdmFyaW91cyBvcGVyYXRvciB0byBvY2N1cnJlbmNlIGluIHZhcmlvdXMgdGFyZ2V0XCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICBvb286IHh4eDogbyFvbzpcbiAgICAgICAgICA9PT06IG9vbzogeHh4OiBvb286XG4gICAgICAgICAgb29vOiB4eHg6ID09PTogeHh4OiBvb286XG4gICAgICAgICAgeHh4OiA9PT06IG9vbzogb29vOlxuICAgICAgICAgIFwiXCJcIlxuICAgICAgaXQgXCJ1cHBlciBjYXNlIGlubmVyLXdvcmRcIiwgLT5cbiAgICAgICAgZW5zdXJlIFwiZyBVIG8gaSBsXCIsXG4gICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgIE9PTzogeHh4OiBPIU9POlxuICAgICAgICAgID09PTogb29vOiB4eHg6IG9vbzpcbiAgICAgICAgICBvb286IHh4eDogPT09OiB4eHg6IG9vbzpcbiAgICAgICAgICB4eHg6ID09PTogb29vOiBvb286XG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgIGVuc3VyZSBcIjIgaiAuXCIsXG4gICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgIE9PTzogeHh4OiBPT086XG4gICAgICAgICAgPT09OiBvb286IHh4eDogb29vOlxuICAgICAgICAgIE9PTzogeHh4OiA9IT09OiB4eHg6IE9PTzpcbiAgICAgICAgICB4eHg6ID09PTogb29vOiBvb286XG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgIGVuc3VyZSBcImogLlwiLFxuICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICBPT086IHh4eDogT09POlxuICAgICAgICAgID09PTogb29vOiB4eHg6IG9vbzpcbiAgICAgICAgICBPT086IHh4eDogPT09OiB4eHg6IE9PTzpcbiAgICAgICAgICB4eHg6ID09PTogTyFPTzogT09POlxuICAgICAgICAgIFwiXCJcIlxuXG4gICAgICBkZXNjcmliZSBcImNsaXAgdG8gbXV0YXRpb24gZW5kIGJlaGF2aW9yXCIsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBzZXRcbiAgICAgICAgICAgIHRleHRDOiBcIlwiXCJcblxuICAgICAgICAgICAgb298bzp4eHg6b29vOlxuICAgICAgICAgICAgeHh4Om9vbzp4eHhcbiAgICAgICAgICAgIFxcblxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgIGl0IFwiW2QgbyBwXSBkZWxldGUgb2NjdXJyZW5jZSBhbmQgY3Vyc29yIGlzIGF0IG11dGF0aW9uIGVuZFwiLCAtPlxuICAgICAgICAgIGVuc3VyZSBcImQgbyBwXCIsXG4gICAgICAgICAgICB0ZXh0QzogXCJcIlwiXG5cbiAgICAgICAgICAgIHw6eHh4OjpcbiAgICAgICAgICAgIHh4eDo6eHh4XG4gICAgICAgICAgICBcXG5cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICBpdCBcIltkIG8gal0gZGVsZXRlIG9jY3VycmVuY2UgYW5kIGN1cnNvciBpcyBhdCBtdXRhdGlvbiBlbmRcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgXCJkIG8galwiLFxuICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuXG4gICAgICAgICAgICB8Onh4eDo6XG4gICAgICAgICAgICB4eHg6Onh4eFxuICAgICAgICAgICAgXFxuXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgaXQgXCJub3QgY2xpcCBpZiBvcmlnaW5hbCBjdXJzb3Igbm90IGludGVyc2VjdHMgYW55IG9jY3VyZW5jZS1tYXJrZXJcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJ2cgbycsIG9jY3VycmVuY2VUZXh0OiBbJ29vbycsICdvb28nLCAnb29vJ10sIGN1cnNvcjogWzEsIDJdXG4gICAgICAgICAga2V5c3Ryb2tlICdqJywgY3Vyc29yOiBbMiwgMl1cbiAgICAgICAgICBlbnN1cmUgXCJkIHBcIixcbiAgICAgICAgICAgIHRleHRDOiBcIlwiXCJcblxuICAgICAgICAgICAgOnh4eDo6XG4gICAgICAgICAgICB4eHx4Ojp4eHhcbiAgICAgICAgICAgIFxcblxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICBkZXNjcmliZSBcImF1dG8gZXh0ZW5kIHRhcmdldCByYW5nZSB0byBpbmNsdWRlIG9jY3VycmVuY2VcIiwgLT5cbiAgICAgIHRleHRPcmlnaW5hbCA9IFwiVGhpcyB0ZXh0IGhhdmUgMyBpbnN0YW5jZSBvZiAndGV4dCcgaW4gdGhlIHdob2xlIHRleHQuXFxuXCJcbiAgICAgIHRleHRGaW5hbCA9IHRleHRPcmlnaW5hbC5yZXBsYWNlKC90ZXh0L2csICcnKVxuXG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldCB0ZXh0OiB0ZXh0T3JpZ2luYWxcblxuICAgICAgaXQgXCJbZnJvbSBzdGFydCBvZiAxc3RdXCIsIC0+IHNldCBjdXJzb3I6IFswLCA1XTsgZW5zdXJlICdkIG8gJCcsIHRleHQ6IHRleHRGaW5hbFxuICAgICAgaXQgXCJbZnJvbSBtaWRkbGUgb2YgMXN0XVwiLCAtPiBzZXQgY3Vyc29yOiBbMCwgN107IGVuc3VyZSAnZCBvICQnLCB0ZXh0OiB0ZXh0RmluYWxcbiAgICAgIGl0IFwiW2Zyb20gZW5kIG9mIGxhc3RdXCIsIC0+IHNldCBjdXJzb3I6IFswLCA1Ml07IGVuc3VyZSAnZCBvIDAnLCB0ZXh0OiB0ZXh0RmluYWxcbiAgICAgIGl0IFwiW2Zyb20gbWlkZGxlIG9mIGxhc3RdXCIsIC0+IHNldCBjdXJzb3I6IFswLCA1MV07IGVuc3VyZSAnZCBvIDAnLCB0ZXh0OiB0ZXh0RmluYWxcblxuICAgIGRlc2NyaWJlIFwic2VsZWN0LW9jY3VycmVuY2VcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgdmltLW1vZGUtcGx1cyB2aW0tbW9kZS1wbHVzXG4gICAgICAgICAgXCJcIlwiXG4gICAgICBkZXNjcmliZSBcIndoYXQgdGhlIGN1cnNvci13b3JkXCIsIC0+XG4gICAgICAgIGVuc3VyZUN1cnNvcldvcmQgPSAoaW5pdGlhbFBvaW50LCB7c2VsZWN0ZWRUZXh0fSkgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBpbml0aWFsUG9pbnRcbiAgICAgICAgICBlbnN1cmUgXCJnIGNtZC1kIGkgcFwiLFxuICAgICAgICAgICAgc2VsZWN0ZWRUZXh0OiBzZWxlY3RlZFRleHRcbiAgICAgICAgICAgIG1vZGU6IFsndmlzdWFsJywgJ2NoYXJhY3Rlcndpc2UnXVxuICAgICAgICAgIGVuc3VyZSBcImVzY2FwZVwiLCBtb2RlOiBcIm5vcm1hbFwiXG5cbiAgICAgICAgZGVzY3JpYmUgXCJjdXJzb3IgaXMgb24gbm9ybWFsIHdvcmRcIiwgLT5cbiAgICAgICAgICBpdCBcInBpY2sgd29yZCBidXQgbm90IHBpY2sgcGFydGlhbGx5IG1hdGNoZWQgb25lIFtieSBzZWxlY3RdXCIsIC0+XG4gICAgICAgICAgICBlbnN1cmVDdXJzb3JXb3JkKFswLCAwXSwgc2VsZWN0ZWRUZXh0OiBbJ3ZpbScsICd2aW0nXSlcbiAgICAgICAgICAgIGVuc3VyZUN1cnNvcldvcmQoWzAsIDNdLCBzZWxlY3RlZFRleHQ6IFsnLScsICctJywgJy0nLCAnLSddKVxuICAgICAgICAgICAgZW5zdXJlQ3Vyc29yV29yZChbMCwgNF0sIHNlbGVjdGVkVGV4dDogWydtb2RlJywgJ21vZGUnXSlcbiAgICAgICAgICAgIGVuc3VyZUN1cnNvcldvcmQoWzAsIDldLCBzZWxlY3RlZFRleHQ6IFsncGx1cycsICdwbHVzJ10pXG5cbiAgICAgICAgZGVzY3JpYmUgXCJjdXJzb3IgaXMgYXQgc2luZ2xlIHdoaXRlIHNwYWNlIFtieSBkZWxldGVdXCIsIC0+XG4gICAgICAgICAgaXQgXCJwaWNrIHNpbmdsZSB3aGl0ZSBzcGFjZSBvbmx5XCIsIC0+XG4gICAgICAgICAgICBzZXRcbiAgICAgICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICAgIG9vbyBvb28gb29vXG4gICAgICAgICAgICAgICBvb28gb29vIG9vb1xuICAgICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgICAgY3Vyc29yOiBbMCwgM11cbiAgICAgICAgICAgIGVuc3VyZSBcImQgbyBpIHBcIixcbiAgICAgICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICAgIG9vb29vb29vb1xuICAgICAgICAgICAgICBvb29vb29vb29cbiAgICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgZGVzY3JpYmUgXCJjdXJzb3IgaXMgYXQgc2VxdW5jZSBvZiBzcGFjZSBbYnkgZGVsZXRlXVwiLCAtPlxuICAgICAgICAgIGl0IFwic2VsZWN0IHNlcXVuY2Ugb2Ygd2hpdGUgc3BhY2VzIGluY2x1ZGluZyBwYXJ0aWFsbHkgbWFjaGVkIG9uZVwiLCAtPlxuICAgICAgICAgICAgc2V0XG4gICAgICAgICAgICAgIGN1cnNvcjogWzAsIDNdXG4gICAgICAgICAgICAgIHRleHRfOiBcIlwiXCJcbiAgICAgICAgICAgICAgb29vX19fb29vIG9vb1xuICAgICAgICAgICAgICAgb29vIG9vb19fX19vb29fX19fX19fX29vb1xuICAgICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgIGVuc3VyZSBcImQgbyBpIHBcIixcbiAgICAgICAgICAgICAgdGV4dF86IFwiXCJcIlxuICAgICAgICAgICAgICBvb29vb28gb29vXG4gICAgICAgICAgICAgICBvb28gb29vIG9vbyAgb29vXG4gICAgICAgICAgICAgIFwiXCJcIlxuXG4gIGRlc2NyaWJlIFwic3RheU9uT2NjdXJyZW5jZSBzZXR0aW5nc1wiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNldFxuICAgICAgICB0ZXh0QzogXCJcIlwiXG5cbiAgICAgICAgYWFhLCBiYmIsIGNjY1xuICAgICAgICBiYmIsIGF8YWEsIGFhYVxuXG4gICAgICAgIFwiXCJcIlxuXG4gICAgZGVzY3JpYmUgXCJ3aGVuIHRydWUgKD0gZGVmYXVsdClcIiwgLT5cbiAgICAgIGl0IFwia2VlcCBjdXJzb3IgcG9zaXRpb24gYWZ0ZXIgb3BlcmF0aW9uIGZpbmlzaGVkXCIsIC0+XG4gICAgICAgIGVuc3VyZSAnZyBVIG8gcCcsXG4gICAgICAgICAgdGV4dEM6IFwiXCJcIlxuXG4gICAgICAgICAgQUFBLCBiYmIsIGNjY1xuICAgICAgICAgIGJiYiwgQXxBQSwgQUFBXG5cbiAgICAgICAgICBcIlwiXCJcblxuICAgIGRlc2NyaWJlIFwid2hlbiBmYWxzZVwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXR0aW5ncy5zZXQoJ3N0YXlPbk9jY3VycmVuY2UnLCBmYWxzZSlcblxuICAgICAgaXQgXCJtb3ZlIGN1cnNvciB0byBzdGFydCBvZiB0YXJnZXQgYXMgbGlrZSBub24tb2N1cnJlbmNlIG9wZXJhdG9yXCIsIC0+XG4gICAgICAgIGVuc3VyZSAnZyBVIG8gcCcsXG4gICAgICAgICAgdGV4dEM6IFwiXCJcIlxuXG4gICAgICAgICAgfEFBQSwgYmJiLCBjY2NcbiAgICAgICAgICBiYmIsIEFBQSwgQUFBXG5cbiAgICAgICAgICBcIlwiXCJcblxuXG4gIGRlc2NyaWJlIFwiZnJvbSB2aXN1YWwtbW9kZS5pcy1uYXJyb3dlZFwiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNldFxuICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgb29vOiB4eHg6IG9vb1xuICAgICAgICB8fHw6IG9vbzogeHh4OiBvb29cbiAgICAgICAgb29vOiB4eHg6IHx8fDogeHh4OiBvb29cbiAgICAgICAgeHh4OiB8fHw6IG9vbzogb29vXG4gICAgICAgIFwiXCJcIlxuICAgICAgICBjdXJzb3I6IFswLCAwXVxuXG4gICAgZGVzY3JpYmUgXCJbdkNdIHNlbGVjdC1vY2N1cnJlbmNlXCIsIC0+XG4gICAgICBpdCBcInNlbGVjdCBjdXJzb3Itd29yZCB3aGljaCBpbnRlcnNlY3Rpbmcgc2VsZWN0aW9uIHRoZW4gYXBwbHkgdXBwZXItY2FzZVwiLCAtPlxuICAgICAgICBlbnN1cmUgXCJ2IDIgaiBjbWQtZFwiLFxuICAgICAgICAgIHNlbGVjdGVkVGV4dDogWydvb28nLCAnb29vJywgJ29vbycsICdvb28nLCAnb29vJ11cbiAgICAgICAgICBtb2RlOiBbJ3Zpc3VhbCcsICdjaGFyYWN0ZXJ3aXNlJ11cblxuICAgICAgICBlbnN1cmUgXCJVXCIsXG4gICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgT09POiB4eHg6IE9PT1xuICAgICAgICAgIHx8fDogT09POiB4eHg6IE9PT1xuICAgICAgICAgIE9PTzogeHh4OiB8fHw6IHh4eDogb29vXG4gICAgICAgICAgeHh4OiB8fHw6IG9vbzogb29vXG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgbnVtQ3Vyc29yczogNVxuICAgICAgICAgIG1vZGU6ICdub3JtYWwnXG5cbiAgICBkZXNjcmliZSBcIlt2TF0gc2VsZWN0LW9jY3VycmVuY2VcIiwgLT5cbiAgICAgIGl0IFwic2VsZWN0IGN1cnNvci13b3JkIHdoaWNoIGludGVyc2VjdGluZyBzZWxlY3Rpb24gdGhlbiBhcHBseSB1cHBlci1jYXNlXCIsIC0+XG4gICAgICAgIGVuc3VyZSBcIjUgbCBWIDIgaiBjbWQtZFwiLFxuICAgICAgICAgIHNlbGVjdGVkVGV4dDogWyd4eHgnLCAneHh4JywgJ3h4eCcsICd4eHgnXVxuICAgICAgICAgIG1vZGU6IFsndmlzdWFsJywgJ2NoYXJhY3Rlcndpc2UnXVxuXG4gICAgICAgIGVuc3VyZSBcIlVcIixcbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICBvb286IFhYWDogb29vXG4gICAgICAgICAgfHx8OiBvb286IFhYWDogb29vXG4gICAgICAgICAgb29vOiBYWFg6IHx8fDogWFhYOiBvb29cbiAgICAgICAgICB4eHg6IHx8fDogb29vOiBvb29cbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICBudW1DdXJzb3JzOiA0XG4gICAgICAgICAgbW9kZTogJ25vcm1hbCdcblxuICAgIGRlc2NyaWJlIFwiW3ZCXSBzZWxlY3Qtb2NjdXJyZW5jZVwiLCAtPlxuICAgICAgaXQgXCJzZWxlY3QgY3Vyc29yLXdvcmQgd2hpY2ggaW50ZXJzZWN0aW5nIHNlbGVjdGlvbiB0aGVuIGFwcGx5IHVwcGVyLWNhc2VcIiwgLT5cbiAgICAgICAgZW5zdXJlIFwiVyBjdHJsLXYgMiBqICQgaCBjbWQtZCBVXCIsXG4gICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgb29vOiB4eHg6IE9PT1xuICAgICAgICAgIHx8fDogT09POiB4eHg6IE9PT1xuICAgICAgICAgIG9vbzogeHh4OiB8fHw6IHh4eDogT09PXG4gICAgICAgICAgeHh4OiB8fHw6IG9vbzogb29vXG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgbnVtQ3Vyc29yczogNFxuXG4gICAgICBpdCBcInBpY2sgY3Vyc29yLXdvcmQgZnJvbSB2QiByYW5nZVwiLCAtPlxuICAgICAgICBlbnN1cmUgXCJjdHJsLXYgNyBsIDIgaiBvIGNtZC1kIFVcIixcbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICBPT086IHh4eDogb29vXG4gICAgICAgICAgfHx8OiBPT086IHh4eDogb29vXG4gICAgICAgICAgT09POiB4eHg6IHx8fDogeHh4OiBvb29cbiAgICAgICAgICB4eHg6IHx8fDogb29vOiBvb29cbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICBudW1DdXJzb3JzOiAzXG5cbiAgZGVzY3JpYmUgXCJpbmNyZW1lbnRhbCBzZWFyY2ggaW50ZWdyYXRpb246IGNoYW5nZS1vY2N1cnJlbmNlLWZyb20tc2VhcmNoLCBzZWxlY3Qtb2NjdXJyZW5jZS1mcm9tLXNlYXJjaFwiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNldHRpbmdzLnNldCgnaW5jcmVtZW50YWxTZWFyY2gnLCB0cnVlKVxuICAgICAgc2V0XG4gICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICBvb286IHh4eDogb29vOiAwMDAwXG4gICAgICAgIDE6IG9vbzogMjI6IG9vbzpcbiAgICAgICAgb29vOiB4eHg6IHx8fDogeHh4OiAzMzMzOlxuICAgICAgICA0NDQ6IHx8fDogb29vOiBvb286XG4gICAgICAgIFwiXCJcIlxuICAgICAgICBjdXJzb3I6IFswLCAwXVxuXG4gICAgZGVzY3JpYmUgXCJmcm9tIG5vcm1hbCBtb2RlXCIsIC0+XG4gICAgICBpdCBcInNlbGVjdCBvY2N1cnJlbmNlIGJ5IHBhdHRlcm4gbWF0Y2hcIiwgLT5cbiAgICAgICAga2V5c3Ryb2tlICcvJ1xuICAgICAgICBpbnB1dFNlYXJjaFRleHQoJ1xcXFxkezMsNH0nKVxuICAgICAgICBkaXNwYXRjaFNlYXJjaENvbW1hbmQoJ3ZpbS1tb2RlLXBsdXM6c2VsZWN0LW9jY3VycmVuY2UtZnJvbS1zZWFyY2gnKVxuICAgICAgICBlbnN1cmUgJ2kgZScsXG4gICAgICAgICAgc2VsZWN0ZWRUZXh0OiBbJzMzMzMnLCAnNDQ0JywgJzAwMDAnXSAjIFdoeSAnMDAwMCcgY29tZXMgbGFzdCBpcyAnMDAwMCcgYmVjb21lIGxhc3Qgc2VsZWN0aW9uLlxuICAgICAgICAgIG1vZGU6IFsndmlzdWFsJywgJ2NoYXJhY3Rlcndpc2UnXVxuXG4gICAgICBpdCBcImNoYW5nZSBvY2N1cnJlbmNlIGJ5IHBhdHRlcm4gbWF0Y2hcIiwgLT5cbiAgICAgICAga2V5c3Ryb2tlICcvJ1xuICAgICAgICBpbnB1dFNlYXJjaFRleHQoJ15cXFxcdys6JylcbiAgICAgICAgZGlzcGF0Y2hTZWFyY2hDb21tYW5kKCd2aW0tbW9kZS1wbHVzOmNoYW5nZS1vY2N1cnJlbmNlLWZyb20tc2VhcmNoJylcbiAgICAgICAgZW5zdXJlICdpIGUnLCBtb2RlOiAnaW5zZXJ0J1xuICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dCgnaGVsbG8nKVxuICAgICAgICBlbnN1cmVcbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICBoZWxsbyB4eHg6IG9vbzogMDAwMFxuICAgICAgICAgIGhlbGxvIG9vbzogMjI6IG9vbzpcbiAgICAgICAgICBoZWxsbyB4eHg6IHx8fDogeHh4OiAzMzMzOlxuICAgICAgICAgIGhlbGxvIHx8fDogb29vOiBvb286XG4gICAgICAgICAgXCJcIlwiXG5cbiAgICBkZXNjcmliZSBcImZyb20gdmlzdWFsIG1vZGVcIiwgLT5cbiAgICAgIGRlc2NyaWJlIFwidmlzdWFsIGNoYXJhY3Rlcndpc2VcIiwgLT5cbiAgICAgICAgaXQgXCJjaGFuZ2Ugb2NjdXJyZW5jZSBpbiBuYXJyb3dlZCBzZWxlY3Rpb25cIiwgLT5cbiAgICAgICAgICBrZXlzdHJva2UgJ3YgaiAvJ1xuICAgICAgICAgIGlucHV0U2VhcmNoVGV4dCgnbysnKVxuICAgICAgICAgIGRpc3BhdGNoU2VhcmNoQ29tbWFuZCgndmltLW1vZGUtcGx1czpzZWxlY3Qtb2NjdXJyZW5jZS1mcm9tLXNlYXJjaCcpXG4gICAgICAgICAgZW5zdXJlICdVJyxcbiAgICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgT09POiB4eHg6IE9PTzogMDAwMFxuICAgICAgICAgICAgMTogb29vOiAyMjogb29vOlxuICAgICAgICAgICAgb29vOiB4eHg6IHx8fDogeHh4OiAzMzMzOlxuICAgICAgICAgICAgNDQ0OiB8fHw6IG9vbzogb29vOlxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgIGRlc2NyaWJlIFwidmlzdWFsIGxpbmV3aXNlXCIsIC0+XG4gICAgICAgIGl0IFwiY2hhbmdlIG9jY3VycmVuY2UgaW4gbmFycm93ZWQgc2VsZWN0aW9uXCIsIC0+XG4gICAgICAgICAga2V5c3Ryb2tlICdWIGogLydcbiAgICAgICAgICBpbnB1dFNlYXJjaFRleHQoJ28rJylcbiAgICAgICAgICBkaXNwYXRjaFNlYXJjaENvbW1hbmQoJ3ZpbS1tb2RlLXBsdXM6c2VsZWN0LW9jY3VycmVuY2UtZnJvbS1zZWFyY2gnKVxuICAgICAgICAgIGVuc3VyZSAnVScsXG4gICAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIE9PTzogeHh4OiBPT086IDAwMDBcbiAgICAgICAgICAgIDE6IE9PTzogMjI6IE9PTzpcbiAgICAgICAgICAgIG9vbzogeHh4OiB8fHw6IHh4eDogMzMzMzpcbiAgICAgICAgICAgIDQ0NDogfHx8OiBvb286IG9vbzpcbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICBkZXNjcmliZSBcInZpc3VhbCBibG9ja3dpc2VcIiwgLT5cbiAgICAgICAgaXQgXCJjaGFuZ2Ugb2NjdXJyZW5jZSBpbiBuYXJyb3dlZCBzZWxlY3Rpb25cIiwgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMCwgNV1cbiAgICAgICAgICBrZXlzdHJva2UgJ2N0cmwtdiAyIGogMSAwIGwgLydcbiAgICAgICAgICBpbnB1dFNlYXJjaFRleHQoJ28rJylcbiAgICAgICAgICBkaXNwYXRjaFNlYXJjaENvbW1hbmQoJ3ZpbS1tb2RlLXBsdXM6c2VsZWN0LW9jY3VycmVuY2UtZnJvbS1zZWFyY2gnKVxuICAgICAgICAgIGVuc3VyZSAnVScsXG4gICAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIG9vbzogeHh4OiBPT086IDAwMDBcbiAgICAgICAgICAgIDE6IE9PTzogMjI6IE9PTzpcbiAgICAgICAgICAgIG9vbzogeHh4OiB8fHw6IHh4eDogMzMzMzpcbiAgICAgICAgICAgIDQ0NDogfHx8OiBvb286IG9vbzpcbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgZGVzY3JpYmUgXCJwZXJzaXN0ZW50LXNlbGVjdGlvbiBpcyBleGlzdHNcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgYXRvbS5rZXltYXBzLmFkZCBcImNyZWF0ZS1wZXJzaXN0ZW50LXNlbGVjdGlvblwiLFxuICAgICAgICAgICdhdG9tLXRleHQtZWRpdG9yLnZpbS1tb2RlLXBsdXM6bm90KC5pbnNlcnQtbW9kZSknOlxuICAgICAgICAgICAgJ20nOiAndmltLW1vZGUtcGx1czpjcmVhdGUtcGVyc2lzdGVudC1zZWxlY3Rpb24nXG5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgb29vOiB4eHg6IG9vbzpcbiAgICAgICAgICB8fHw6IG9vbzogeHh4OiBvb286XG4gICAgICAgICAgb29vOiB4eHg6IHx8fDogeHh4OiBvb286XG4gICAgICAgICAgeHh4OiB8fHw6IG9vbzogb29vOlxcblxuICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIGN1cnNvcjogWzAsIDBdXG5cbiAgICAgICAgZW5zdXJlICdWIGogbSBHIG0gbScsXG4gICAgICAgICAgcGVyc2lzdGVudFNlbGVjdGlvbkJ1ZmZlclJhbmdlOiBbXG4gICAgICAgICAgICBbWzAsIDBdLCBbMiwgMF1dXG4gICAgICAgICAgICBbWzMsIDBdLCBbNCwgMF1dXG4gICAgICAgICAgXVxuXG4gICAgICBkZXNjcmliZSBcIndoZW4gbm8gc2VsZWN0aW9uIGlzIGV4aXN0c1wiLCAtPlxuICAgICAgICBpdCBcInNlbGVjdCBvY2N1cnJlbmNlIGluIGFsbCBwZXJzaXN0ZW50LXNlbGVjdGlvblwiLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFswLCAwXVxuICAgICAgICAgIGtleXN0cm9rZSAnLydcbiAgICAgICAgICBpbnB1dFNlYXJjaFRleHQoJ3h4eCcpXG4gICAgICAgICAgZGlzcGF0Y2hTZWFyY2hDb21tYW5kKCd2aW0tbW9kZS1wbHVzOnNlbGVjdC1vY2N1cnJlbmNlLWZyb20tc2VhcmNoJylcbiAgICAgICAgICBlbnN1cmUgJ1UnLFxuICAgICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICBvb286IFhYWDogb29vOlxuICAgICAgICAgICAgfHx8OiBvb286IFhYWDogb29vOlxuICAgICAgICAgICAgb29vOiB4eHg6IHx8fDogeHh4OiBvb286XG4gICAgICAgICAgICBYWFg6IHx8fDogb29vOiBvb286XFxuXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgIHBlcnNpc3RlbnRTZWxlY3Rpb25Db3VudDogMFxuXG4gICAgICBkZXNjcmliZSBcIndoZW4gYm90aCBleGl0cywgb3BlcmF0b3IgYXBwbGllZCB0byBib3RoXCIsIC0+XG4gICAgICAgIGl0IFwic2VsZWN0IGFsbCBvY2N1cnJlbmNlIGluIHNlbGVjdGlvblwiLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFswLCAwXVxuICAgICAgICAgIGtleXN0cm9rZSAnViAyIGogLydcbiAgICAgICAgICBpbnB1dFNlYXJjaFRleHQoJ3h4eCcpXG4gICAgICAgICAgZGlzcGF0Y2hTZWFyY2hDb21tYW5kKCd2aW0tbW9kZS1wbHVzOnNlbGVjdC1vY2N1cnJlbmNlLWZyb20tc2VhcmNoJylcbiAgICAgICAgICBlbnN1cmUgJ1UnLFxuICAgICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICBvb286IFhYWDogb29vOlxuICAgICAgICAgICAgfHx8OiBvb286IFhYWDogb29vOlxuICAgICAgICAgICAgb29vOiBYWFg6IHx8fDogWFhYOiBvb286XG4gICAgICAgICAgICBYWFg6IHx8fDogb29vOiBvb286XFxuXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgIHBlcnNpc3RlbnRTZWxlY3Rpb25Db3VudDogMFxuXG4gICAgZGVzY3JpYmUgXCJkZW1vbnN0cmF0ZSBwZXJzaXN0ZW50LXNlbGVjdGlvbidzIHByYWN0aWNhbCBzY2VuYXJpb1wiLCAtPlxuICAgICAgW29sZEdyYW1tYXJdID0gW11cbiAgICAgIGFmdGVyRWFjaCAtPlxuICAgICAgICBlZGl0b3Iuc2V0R3JhbW1hcihvbGRHcmFtbWFyKVxuXG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIGF0b20ua2V5bWFwcy5hZGQgXCJjcmVhdGUtcGVyc2lzdGVudC1zZWxlY3Rpb25cIixcbiAgICAgICAgICAnYXRvbS10ZXh0LWVkaXRvci52aW0tbW9kZS1wbHVzOm5vdCguaW5zZXJ0LW1vZGUpJzpcbiAgICAgICAgICAgICdtJzogJ3ZpbS1tb2RlLXBsdXM6dG9nZ2xlLXBlcnNpc3RlbnQtc2VsZWN0aW9uJ1xuXG4gICAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgICAgIGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKCdsYW5ndWFnZS1jb2ZmZWUtc2NyaXB0JylcblxuICAgICAgICBydW5zIC0+XG4gICAgICAgICAgb2xkR3JhbW1hciA9IGVkaXRvci5nZXRHcmFtbWFyKClcbiAgICAgICAgICBlZGl0b3Iuc2V0R3JhbW1hcihhdG9tLmdyYW1tYXJzLmdyYW1tYXJGb3JTY29wZU5hbWUoJ3NvdXJjZS5jb2ZmZWUnKSlcblxuICAgICAgICBzZXQgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICBjb25zdHJ1Y3RvcjogKEBtYWluLCBAZWRpdG9yLCBAc3RhdHVzQmFyTWFuYWdlcikgLT5cbiAgICAgICAgICAgICAgQGVkaXRvckVsZW1lbnQgPSBAZWRpdG9yLmVsZW1lbnRcbiAgICAgICAgICAgICAgQGVtaXR0ZXIgPSBuZXcgRW1pdHRlclxuICAgICAgICAgICAgICBAc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG4gICAgICAgICAgICAgIEBtb2RlTWFuYWdlciA9IG5ldyBNb2RlTWFuYWdlcih0aGlzKVxuICAgICAgICAgICAgICBAbWFyayA9IG5ldyBNYXJrTWFuYWdlcih0aGlzKVxuICAgICAgICAgICAgICBAcmVnaXN0ZXIgPSBuZXcgUmVnaXN0ZXJNYW5hZ2VyKHRoaXMpXG4gICAgICAgICAgICAgIEBwZXJzaXN0ZW50U2VsZWN0aW9ucyA9IFtdXG5cbiAgICAgICAgICAgICAgQGhpZ2hsaWdodFNlYXJjaFN1YnNjcmlwdGlvbiA9IEBlZGl0b3JFbGVtZW50Lm9uRGlkQ2hhbmdlU2Nyb2xsVG9wID0+XG4gICAgICAgICAgICAgICAgQHJlZnJlc2hIaWdobGlnaHRTZWFyY2goKVxuXG4gICAgICAgICAgICAgIEBvcGVyYXRpb25TdGFjayA9IG5ldyBPcGVyYXRpb25TdGFjayh0aGlzKVxuICAgICAgICAgICAgICBAY3Vyc29yU3R5bGVNYW5hZ2VyID0gbmV3IEN1cnNvclN0eWxlTWFuYWdlcih0aGlzKVxuXG4gICAgICAgICAgICBhbm90aGVyRnVuYzogLT5cbiAgICAgICAgICAgICAgQGhlbGxvID0gW11cbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICBpdCAnY2hhbmdlIGFsbCBhc3NpZ25tZW50KFwiPVwiKSBvZiBjdXJyZW50LWZ1bmN0aW9uIHRvIFwiPz1cIicsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFswLCAwXVxuICAgICAgICBlbnN1cmUgJ2ogZiA9JywgY3Vyc29yOiBbMSwgMTddXG5cbiAgICAgICAgcnVucyAtPlxuICAgICAgICAgIGtleXN0cm9rZSBbXG4gICAgICAgICAgICAnZyBjbWQtZCcgIyBzZWxlY3Qtb2NjdXJyZW5jZVxuICAgICAgICAgICAgJ2kgZicgICAgICMgaW5uZXItZnVuY3Rpb24tdGV4dC1vYmplY3RcbiAgICAgICAgICAgICdtJyAgICAgICAjIHRvZ2dsZS1wZXJzaXN0ZW50LXNlbGVjdGlvblxuICAgICAgICAgIF0uam9pbihcIiBcIilcblxuICAgICAgICAgIHRleHRzSW5CdWZmZXJSYW5nZSA9IHZpbVN0YXRlLnBlcnNpc3RlbnRTZWxlY3Rpb24uZ2V0TWFya2VyQnVmZmVyUmFuZ2VzKCkubWFwIChyYW5nZSkgLT5cbiAgICAgICAgICAgIGVkaXRvci5nZXRUZXh0SW5CdWZmZXJSYW5nZShyYW5nZSlcbiAgICAgICAgICB0ZXh0c0luQnVmZmVyUmFuZ2VJc0FsbEVxdWFsQ2hhciA9IHRleHRzSW5CdWZmZXJSYW5nZS5ldmVyeSgodGV4dCkgLT4gdGV4dCBpcyAnPScpXG4gICAgICAgICAgZXhwZWN0KHRleHRzSW5CdWZmZXJSYW5nZUlzQWxsRXF1YWxDaGFyKS50b0JlKHRydWUpXG4gICAgICAgICAgZXhwZWN0KHZpbVN0YXRlLnBlcnNpc3RlbnRTZWxlY3Rpb24uZ2V0TWFya2VycygpKS50b0hhdmVMZW5ndGgoMTEpXG5cbiAgICAgICAgICBrZXlzdHJva2UgJzIgbCcgIyB0byBtb3ZlIHRvIG91dC1zaWRlIG9mIHJhbmdlLW1ya2VyXG4gICAgICAgICAgZW5zdXJlICcvID0+IGVudGVyJywgY3Vyc29yOiBbOSwgNjldXG4gICAgICAgICAga2V5c3Ryb2tlIFwibVwiICMgY2xlYXIgcGVyc2lzdGVudFNlbGVjdGlvbiBhdCBjdXJzb3Igd2hpY2ggaXMgPSBzaWduIHBhcnQgb2YgZmF0IGFycm93LlxuICAgICAgICAgIGV4cGVjdCh2aW1TdGF0ZS5wZXJzaXN0ZW50U2VsZWN0aW9uLmdldE1hcmtlcnMoKSkudG9IYXZlTGVuZ3RoKDEwKVxuXG4gICAgICAgIHdhaXRzRm9yIC0+XG4gICAgICAgICAgY2xhc3NMaXN0LmNvbnRhaW5zKCdoYXMtcGVyc2lzdGVudC1zZWxlY3Rpb24nKVxuXG4gICAgICAgIHJ1bnMgLT5cbiAgICAgICAgICBrZXlzdHJva2UgXCJjdHJsLWNtZC1nIElcIiAjIFwic2VsZWN0LXBlcnNpc3RlbnQtc2VsZWN0aW9uXCIgdGhlbiBcIkluc2VydCBhdCBzdGFydCBvZiBzZWxlY3Rpb25cIlxuICAgICAgICAgIFxuICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KCc/JylcbiAgICAgICAgICBlbnN1cmUgJ2VzY2FwZScsXG4gICAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIGNvbnN0cnVjdG9yOiAoQG1haW4sIEBlZGl0b3IsIEBzdGF0dXNCYXJNYW5hZ2VyKSAtPlxuICAgICAgICAgICAgICBAZWRpdG9yRWxlbWVudCA/PSBAZWRpdG9yLmVsZW1lbnRcbiAgICAgICAgICAgICAgQGVtaXR0ZXIgPz0gbmV3IEVtaXR0ZXJcbiAgICAgICAgICAgICAgQHN1YnNjcmlwdGlvbnMgPz0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcbiAgICAgICAgICAgICAgQG1vZGVNYW5hZ2VyID89IG5ldyBNb2RlTWFuYWdlcih0aGlzKVxuICAgICAgICAgICAgICBAbWFyayA/PSBuZXcgTWFya01hbmFnZXIodGhpcylcbiAgICAgICAgICAgICAgQHJlZ2lzdGVyID89IG5ldyBSZWdpc3Rlck1hbmFnZXIodGhpcylcbiAgICAgICAgICAgICAgQHBlcnNpc3RlbnRTZWxlY3Rpb25zID89IFtdXG5cbiAgICAgICAgICAgICAgQGhpZ2hsaWdodFNlYXJjaFN1YnNjcmlwdGlvbiA/PSBAZWRpdG9yRWxlbWVudC5vbkRpZENoYW5nZVNjcm9sbFRvcCA9PlxuICAgICAgICAgICAgICAgIEByZWZyZXNoSGlnaGxpZ2h0U2VhcmNoKClcblxuICAgICAgICAgICAgICBAb3BlcmF0aW9uU3RhY2sgPz0gbmV3IE9wZXJhdGlvblN0YWNrKHRoaXMpXG4gICAgICAgICAgICAgIEBjdXJzb3JTdHlsZU1hbmFnZXIgPz0gbmV3IEN1cnNvclN0eWxlTWFuYWdlcih0aGlzKVxuXG4gICAgICAgICAgICBhbm90aGVyRnVuYzogLT5cbiAgICAgICAgICAgICAgQGhlbGxvID0gW11cbiAgICAgICAgICAgIFwiXCJcIlxuXG4gIGRlc2NyaWJlIFwicHJlc2V0IG9jY3VycmVuY2UgbWFya2VyXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2V0XG4gICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICBUaGlzIHRleHQgaGF2ZSAzIGluc3RhbmNlIG9mICd0ZXh0JyBpbiB0aGUgd2hvbGUgdGV4dFxuICAgICAgICBcIlwiXCJcbiAgICAgICAgY3Vyc29yOiBbMCwgMF1cblxuICAgIGRlc2NyaWJlIFwidG9nZ2xlLXByZXNldC1vY2N1cnJlbmNlIGNvbW1hbmRzXCIsIC0+XG4gICAgICBkZXNjcmliZSBcImluIG5vcm1hbC1tb2RlXCIsIC0+XG4gICAgICAgIGRlc2NyaWJlIFwiYWRkIHByZXNldCBvY2N1cnJlbmNlXCIsIC0+XG4gICAgICAgICAgaXQgJ3NldCBjdXJzb3Itd2FyZCBhcyBwcmVzZXQgb2NjdXJyZW5jZSBtYXJrZXIgYW5kIG5vdCBtb3ZlIGN1cnNvcicsIC0+XG4gICAgICAgICAgICBlbnN1cmUgJ2cgbycsIG9jY3VycmVuY2VUZXh0OiAnVGhpcycsIGN1cnNvcjogWzAsIDBdXG4gICAgICAgICAgICBlbnN1cmUgJ3cnLCBjdXJzb3I6IFswLCA1XVxuICAgICAgICAgICAgZW5zdXJlICdnIG8nLCBvY2N1cnJlbmNlVGV4dDogWydUaGlzJywgJ3RleHQnLCAndGV4dCcsICd0ZXh0J10sIGN1cnNvcjogWzAsIDVdXG5cbiAgICAgICAgZGVzY3JpYmUgXCJyZW1vdmUgcHJlc2V0IG9jY3VycmVuY2VcIiwgLT5cbiAgICAgICAgICBpdCAncmVtb3ZlcyBvY2N1cnJlbmNlIG9uZSBieSBvbmUgc2VwYXJhdGVseScsIC0+XG4gICAgICAgICAgICBlbnN1cmUgJ2cgbycsIG9jY3VycmVuY2VUZXh0OiAnVGhpcycsIGN1cnNvcjogWzAsIDBdXG4gICAgICAgICAgICBlbnN1cmUgJ3cnLCBjdXJzb3I6IFswLCA1XVxuICAgICAgICAgICAgZW5zdXJlICdnIG8nLCBvY2N1cnJlbmNlVGV4dDogWydUaGlzJywgJ3RleHQnLCAndGV4dCcsICd0ZXh0J10sIGN1cnNvcjogWzAsIDVdXG4gICAgICAgICAgICBlbnN1cmUgJ2cgbycsIG9jY3VycmVuY2VUZXh0OiBbJ1RoaXMnLCAndGV4dCcsICd0ZXh0J10sIGN1cnNvcjogWzAsIDVdXG4gICAgICAgICAgICBlbnN1cmUgJ2IgZyBvJywgb2NjdXJyZW5jZVRleHQ6IFsndGV4dCcsICd0ZXh0J10sIGN1cnNvcjogWzAsIDBdXG4gICAgICAgICAgaXQgJ3JlbW92ZXMgYWxsIG9jY3VycmVuY2UgaW4gdGhpcyBlZGl0b3IgYnkgZXNjYXBlJywgLT5cbiAgICAgICAgICAgIGVuc3VyZSAnZyBvJywgb2NjdXJyZW5jZVRleHQ6ICdUaGlzJywgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgICAgIGVuc3VyZSAndycsIGN1cnNvcjogWzAsIDVdXG4gICAgICAgICAgICBlbnN1cmUgJ2cgbycsIG9jY3VycmVuY2VUZXh0OiBbJ1RoaXMnLCAndGV4dCcsICd0ZXh0JywgJ3RleHQnXSwgY3Vyc29yOiBbMCwgNV1cbiAgICAgICAgICAgIGVuc3VyZSAnZXNjYXBlJywgb2NjdXJyZW5jZUNvdW50OiAwXG5cbiAgICAgICAgICBpdCAnY2FuIHJlY2FsbCBwcmV2aW91c2x5IHNldCBvY2N1cmVuY2UgcGF0dGVybiBieSBgZyAuYCcsIC0+XG4gICAgICAgICAgICBlbnN1cmUgJ3cgdiBsIGcgbycsIG9jY3VycmVuY2VUZXh0OiBbJ3RlJywgJ3RlJywgJ3RlJ10sIGN1cnNvcjogWzAsIDZdXG4gICAgICAgICAgICBlbnN1cmUgJ2VzY2FwZScsIG9jY3VycmVuY2VDb3VudDogMFxuICAgICAgICAgICAgZXhwZWN0KHZpbVN0YXRlLmdsb2JhbFN0YXRlLmdldCgnbGFzdE9jY3VycmVuY2VQYXR0ZXJuJykpLnRvRXF1YWwoL3RlL2cpXG5cbiAgICAgICAgICAgIGVuc3VyZSAndycsIGN1cnNvcjogWzAsIDEwXSAjIHRvIG1vdmUgY3Vyc29yIHRvIHRleHQgYGhhdmVgXG4gICAgICAgICAgICBlbnN1cmUgJ2cgLicsIG9jY3VycmVuY2VUZXh0OiBbJ3RlJywgJ3RlJywgJ3RlJ10sIGN1cnNvcjogWzAsIDEwXVxuXG4gICAgICAgICAgICAjIEJ1dCBvcGVyYXRvciBtb2RpZmllciBub3QgdXBkYXRlIGxhc3RPY2N1cnJlbmNlUGF0dGVyblxuICAgICAgICAgICAgZW5zdXJlICdnIFUgbyAkJywgdGV4dEM6IFwiVGhpcyB0ZXh0IHxIQVZFIDMgaW5zdGFuY2Ugb2YgJ3RleHQnIGluIHRoZSB3aG9sZSB0ZXh0XCJcbiAgICAgICAgICAgIGV4cGVjdCh2aW1TdGF0ZS5nbG9iYWxTdGF0ZS5nZXQoJ2xhc3RPY2N1cnJlbmNlUGF0dGVybicpKS50b0VxdWFsKC90ZS9nKVxuXG4gICAgICAgIGRlc2NyaWJlIFwicmVzdG9yZSBsYXN0IG9jY3VycmVuY2UgbWFya2VyIGJ5IGFkZC1wcmVzZXQtb2NjdXJyZW5jZS1mcm9tLWxhc3Qtb2NjdXJyZW5jZS1wYXR0ZXJuXCIsIC0+XG4gICAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgICAgc2V0XG4gICAgICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAgICAgY2FtZWxcbiAgICAgICAgICAgICAgY2FtZWxDYXNlXG4gICAgICAgICAgICAgIGNhbWVsc1xuICAgICAgICAgICAgICBjYW1lbFxuICAgICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICBpdCBcImNhbiByZXN0b3JlIG9jY3VycmVuY2UtbWFya2VyIGFkZGVkIGJ5IGBnIG9gIGluIG5vcm1hbC1tb2RlXCIsIC0+XG4gICAgICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgICAgIGVuc3VyZSBcImcgb1wiLCBvY2N1cnJlbmNlVGV4dDogWydjYW1lbCcsICdjYW1lbCddXG4gICAgICAgICAgICBlbnN1cmUgJ2VzY2FwZScsIG9jY3VycmVuY2VDb3VudDogMFxuICAgICAgICAgICAgZW5zdXJlIFwiZyAuXCIsIG9jY3VycmVuY2VUZXh0OiBbJ2NhbWVsJywgJ2NhbWVsJ11cblxuICAgICAgICAgIGl0IFwiY2FuIHJlc3RvcmUgb2NjdXJyZW5jZS1tYXJrZXIgYWRkZWQgYnkgYGcgb2AgaW4gdmlzdWFsLW1vZGVcIiwgLT5cbiAgICAgICAgICAgIHNldCBjdXJzb3I6IFswLCAwXVxuICAgICAgICAgICAgZW5zdXJlIFwidiBpIHdcIiwgc2VsZWN0ZWRUZXh0OiBcImNhbWVsXCJcbiAgICAgICAgICAgIGVuc3VyZSBcImcgb1wiLCBvY2N1cnJlbmNlVGV4dDogWydjYW1lbCcsICdjYW1lbCcsICdjYW1lbCcsICdjYW1lbCddXG4gICAgICAgICAgICBlbnN1cmUgJ2VzY2FwZScsIG9jY3VycmVuY2VDb3VudDogMFxuICAgICAgICAgICAgZW5zdXJlIFwiZyAuXCIsIG9jY3VycmVuY2VUZXh0OiBbJ2NhbWVsJywgJ2NhbWVsJywgJ2NhbWVsJywgJ2NhbWVsJ11cblxuICAgICAgICAgIGl0IFwiY2FuIHJlc3RvcmUgb2NjdXJyZW5jZS1tYXJrZXIgYWRkZWQgYnkgYGcgT2AgaW4gbm9ybWFsLW1vZGVcIiwgLT5cbiAgICAgICAgICAgIHNldCBjdXJzb3I6IFswLCAwXVxuICAgICAgICAgICAgZW5zdXJlIFwiZyBPXCIsIG9jY3VycmVuY2VUZXh0OiBbJ2NhbWVsJywgJ2NhbWVsJywgJ2NhbWVsJ11cbiAgICAgICAgICAgIGVuc3VyZSAnZXNjYXBlJywgb2NjdXJyZW5jZUNvdW50OiAwXG4gICAgICAgICAgICBlbnN1cmUgXCJnIC5cIiwgb2NjdXJyZW5jZVRleHQ6IFsnY2FtZWwnLCAnY2FtZWwnLCAnY2FtZWwnXVxuXG4gICAgICAgIGRlc2NyaWJlIFwiY3NzIGNsYXNzIGhhcy1vY2N1cnJlbmNlXCIsIC0+XG4gICAgICAgICAgZGVzY3JpYmUgXCJtYW51YWxseSB0b2dnbGUgYnkgdG9nZ2xlLXByZXNldC1vY2N1cnJlbmNlIGNvbW1hbmRcIiwgLT5cbiAgICAgICAgICAgIGl0ICdpcyBhdXRvLXNldC91bnNldCB3aGV0ZXIgYXQgbGVhc3Qgb25lIHByZXNldC1vY2N1cnJlbmNlIHdhcyBleGlzdHMgb3Igbm90JywgLT5cbiAgICAgICAgICAgICAgZXhwZWN0KGNsYXNzTGlzdC5jb250YWlucygnaGFzLW9jY3VycmVuY2UnKSkudG9CZShmYWxzZSlcbiAgICAgICAgICAgICAgZW5zdXJlICdnIG8nLCBvY2N1cnJlbmNlVGV4dDogJ1RoaXMnLCBjdXJzb3I6IFswLCAwXVxuICAgICAgICAgICAgICBleHBlY3QoY2xhc3NMaXN0LmNvbnRhaW5zKCdoYXMtb2NjdXJyZW5jZScpKS50b0JlKHRydWUpXG4gICAgICAgICAgICAgIGVuc3VyZSAnZyBvJywgb2NjdXJyZW5jZUNvdW50OiAwLCBjdXJzb3I6IFswLCAwXVxuICAgICAgICAgICAgICBleHBlY3QoY2xhc3NMaXN0LmNvbnRhaW5zKCdoYXMtb2NjdXJyZW5jZScpKS50b0JlKGZhbHNlKVxuXG4gICAgICAgICAgZGVzY3JpYmUgXCJjaGFuZ2UgJ0lOU0lERScgb2YgbWFya2VyXCIsIC0+XG4gICAgICAgICAgICBtYXJrZXJMYXllclVwZGF0ZWQgPSBudWxsXG4gICAgICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgICAgIG1hcmtlckxheWVyVXBkYXRlZCA9IGZhbHNlXG5cbiAgICAgICAgICAgIGl0ICdkZXN0cm95IG1hcmtlciBhbmQgcmVmbGVjdCB0byBcImhhcy1vY2N1cnJlbmNlXCIgQ1NTJywgLT5cbiAgICAgICAgICAgICAgcnVucyAtPlxuICAgICAgICAgICAgICAgIGV4cGVjdChjbGFzc0xpc3QuY29udGFpbnMoJ2hhcy1vY2N1cnJlbmNlJykpLnRvQmUoZmFsc2UpXG4gICAgICAgICAgICAgICAgZW5zdXJlICdnIG8nLCBvY2N1cnJlbmNlVGV4dDogJ1RoaXMnLCBjdXJzb3I6IFswLCAwXVxuICAgICAgICAgICAgICAgIGV4cGVjdChjbGFzc0xpc3QuY29udGFpbnMoJ2hhcy1vY2N1cnJlbmNlJykpLnRvQmUodHJ1ZSlcblxuICAgICAgICAgICAgICAgIGVuc3VyZSAnbCBpJywgbW9kZTogJ2luc2VydCdcbiAgICAgICAgICAgICAgICB2aW1TdGF0ZS5vY2N1cnJlbmNlTWFuYWdlci5tYXJrZXJMYXllci5vbkRpZFVwZGF0ZSAtPlxuICAgICAgICAgICAgICAgICAgbWFya2VyTGF5ZXJVcGRhdGVkID0gdHJ1ZVxuXG4gICAgICAgICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoJy0tJylcbiAgICAgICAgICAgICAgICBlbnN1cmUgXCJlc2NhcGVcIixcbiAgICAgICAgICAgICAgICAgIHRleHRDOiBcIlQtfC1oaXMgdGV4dCBoYXZlIDMgaW5zdGFuY2Ugb2YgJ3RleHQnIGluIHRoZSB3aG9sZSB0ZXh0XCJcbiAgICAgICAgICAgICAgICAgIG1vZGU6ICdub3JtYWwnXG5cbiAgICAgICAgICAgICAgd2FpdHNGb3IgLT5cbiAgICAgICAgICAgICAgICBtYXJrZXJMYXllclVwZGF0ZWRcblxuICAgICAgICAgICAgICBydW5zIC0+XG4gICAgICAgICAgICAgICAgZW5zdXJlIG9jY3VycmVuY2VDb3VudDogMFxuICAgICAgICAgICAgICAgIGV4cGVjdChjbGFzc0xpc3QuY29udGFpbnMoJ2hhcy1vY2N1cnJlbmNlJykpLnRvQmUoZmFsc2UpXG5cbiAgICAgIGRlc2NyaWJlIFwiaW4gdmlzdWFsLW1vZGVcIiwgLT5cbiAgICAgICAgZGVzY3JpYmUgXCJhZGQgcHJlc2V0IG9jY3VycmVuY2VcIiwgLT5cbiAgICAgICAgICBpdCAnc2V0IHNlbGVjdGVkLXRleHQgYXMgcHJlc2V0IG9jY3VycmVuY2UgbWFya2VyIGFuZCBub3QgbW92ZSBjdXJzb3InLCAtPlxuICAgICAgICAgICAgZW5zdXJlICd3IHYgbCcsIG1vZGU6IFsndmlzdWFsJywgJ2NoYXJhY3Rlcndpc2UnXSwgc2VsZWN0ZWRUZXh0OiAndGUnXG4gICAgICAgICAgICBlbnN1cmUgJ2cgbycsIG1vZGU6ICdub3JtYWwnLCBvY2N1cnJlbmNlVGV4dDogWyd0ZScsICd0ZScsICd0ZSddXG4gICAgICAgIGRlc2NyaWJlIFwiaXMtbmFycm93ZWQgc2VsZWN0aW9uXCIsIC0+XG4gICAgICAgICAgW3RleHRPcmlnaW5hbF0gPSBbXVxuICAgICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICAgIHRleHRPcmlnaW5hbCA9IFwiXCJcIlxuICAgICAgICAgICAgICBUaGlzIHRleHQgaGF2ZSAzIGluc3RhbmNlIG9mICd0ZXh0JyBpbiB0aGUgd2hvbGUgdGV4dFxuICAgICAgICAgICAgICBUaGlzIHRleHQgaGF2ZSAzIGluc3RhbmNlIG9mICd0ZXh0JyBpbiB0aGUgd2hvbGUgdGV4dFxcblxuICAgICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgIHNldFxuICAgICAgICAgICAgICBjdXJzb3I6IFswLCAwXVxuICAgICAgICAgICAgICB0ZXh0OiB0ZXh0T3JpZ2luYWxcbiAgICAgICAgICBpdCBcInBpY2sgb2N1cnJlbmNlLXdvcmQgZnJvbSBjdXJzb3IgcG9zaXRpb24gYW5kIGNvbnRpbnVlIHZpc3VhbC1tb2RlXCIsIC0+XG4gICAgICAgICAgICBlbnN1cmUgJ3cgViBqJywgbW9kZTogWyd2aXN1YWwnLCAnbGluZXdpc2UnXSwgc2VsZWN0ZWRUZXh0OiB0ZXh0T3JpZ2luYWxcbiAgICAgICAgICAgIGVuc3VyZSAnZyBvJyxcbiAgICAgICAgICAgICAgbW9kZTogWyd2aXN1YWwnLCAnbGluZXdpc2UnXVxuICAgICAgICAgICAgICBzZWxlY3RlZFRleHQ6IHRleHRPcmlnaW5hbFxuICAgICAgICAgICAgICBvY2N1cnJlbmNlVGV4dDogWyd0ZXh0JywgJ3RleHQnLCAndGV4dCcsICd0ZXh0JywgJ3RleHQnLCAndGV4dCddXG4gICAgICAgICAgICBlbnN1cmUgJ3IgIScsXG4gICAgICAgICAgICAgIG1vZGU6ICdub3JtYWwnXG4gICAgICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgICBUaGlzICEhISEgaGF2ZSAzIGluc3RhbmNlIG9mICchISEhJyBpbiB0aGUgd2hvbGUgISEhIVxuICAgICAgICAgICAgICBUaGlzICEhISEgaGF2ZSAzIGluc3RhbmNlIG9mICchISEhJyBpbiB0aGUgd2hvbGUgISEhIVxcblxuICAgICAgICAgICAgICBcIlwiXCJcblxuICAgICAgZGVzY3JpYmUgXCJpbiBpbmNyZW1lbnRhbC1zZWFyY2hcIiwgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIHNldHRpbmdzLnNldCgnaW5jcmVtZW50YWxTZWFyY2gnLCB0cnVlKVxuXG4gICAgICAgIGRlc2NyaWJlIFwiYWRkLW9jY3VycmVuY2UtcGF0dGVybi1mcm9tLXNlYXJjaFwiLCAtPlxuICAgICAgICAgIGl0ICdtYXJrIGFzIG9jY3VycmVuY2Ugd2hpY2ggbWF0Y2hlcyByZWdleCBlbnRlcmVkIGluIHNlYXJjaC11aScsIC0+XG4gICAgICAgICAgICBrZXlzdHJva2UgJy8nXG4gICAgICAgICAgICBpbnB1dFNlYXJjaFRleHQoJ1xcXFxidFxcXFx3KycpXG4gICAgICAgICAgICBkaXNwYXRjaFNlYXJjaENvbW1hbmQoJ3ZpbS1tb2RlLXBsdXM6YWRkLW9jY3VycmVuY2UtcGF0dGVybi1mcm9tLXNlYXJjaCcpXG4gICAgICAgICAgICBlbnN1cmVcbiAgICAgICAgICAgICAgb2NjdXJyZW5jZVRleHQ6IFsndGV4dCcsICd0ZXh0JywgJ3RoZScsICd0ZXh0J11cblxuICAgIGRlc2NyaWJlIFwibXV0YXRlIHByZXNldCBvY2N1cnJlbmNlXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldCB0ZXh0OiBcIlwiXCJcbiAgICAgICAgb29vOiB4eHg6IG9vbyB4eHg6IG9vbzpcbiAgICAgICAgISEhOiBvb286IHh4eDogb29vIHh4eDogb29vOlxuICAgICAgICBcIlwiXCJcbiAgICAgICAgY3Vyc29yOiBbMCwgMF1cblxuICAgICAgZGVzY3JpYmUgXCJub3JtYWwtbW9kZVwiLCAtPlxuICAgICAgICBpdCAnW2RlbGV0ZV0gYXBwbHkgb3BlcmF0aW9uIHRvIHByZXNldC1tYXJrZXIgaW50ZXJzZWN0aW5nIHNlbGVjdGVkIHRhcmdldCcsIC0+XG4gICAgICAgICAgZW5zdXJlICdsIGcgbyBEJyxcbiAgICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgOiB4eHg6ICB4eHg6IDpcbiAgICAgICAgICAgICEhITogb29vOiB4eHg6IG9vbyB4eHg6IG9vbzpcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICBpdCAnW3VwY2FzZV0gYXBwbHkgb3BlcmF0aW9uIHRvIHByZXNldC1tYXJrZXIgaW50ZXJzZWN0aW5nIHNlbGVjdGVkIHRhcmdldCcsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzAsIDZdXG4gICAgICAgICAgZW5zdXJlICdsIGcgbyBnIFUgaicsXG4gICAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIG9vbzogWFhYOiBvb28gWFhYOiBvb286XG4gICAgICAgICAgICAhISE6IG9vbzogWFhYOiBvb28gWFhYOiBvb286XG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgaXQgJ1t1cGNhc2UgZXhjbHVkZV0gd29uXFwndCBtdXRhdGUgcmVtb3ZlZCBtYXJrZXInLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFswLCAwXVxuICAgICAgICAgIGVuc3VyZSAnZyBvJywgb2NjdXJyZW5jZUNvdW50OiA2XG4gICAgICAgICAgZW5zdXJlICdnIG8nLCBvY2N1cnJlbmNlQ291bnQ6IDVcbiAgICAgICAgICBlbnN1cmUgJ2cgVSBqJyxcbiAgICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgb29vOiB4eHg6IE9PTyB4eHg6IE9PTzpcbiAgICAgICAgICAgICEhITogT09POiB4eHg6IE9PTyB4eHg6IE9PTzpcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICBpdCAnW2RlbGV0ZV0gYXBwbHkgb3BlcmF0aW9uIHRvIHByZXNldC1tYXJrZXIgaW50ZXJzZWN0aW5nIHNlbGVjdGVkIHRhcmdldCcsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzAsIDEwXVxuICAgICAgICAgIGVuc3VyZSAnZyBvIGcgVSAkJyxcbiAgICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgb29vOiB4eHg6IE9PTyB4eHg6IE9PTzpcbiAgICAgICAgICAgICEhITogb29vOiB4eHg6IG9vbyB4eHg6IG9vbzpcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICBpdCAnW2NoYW5nZV0gYXBwbHkgb3BlcmF0aW9uIHRvIHByZXNldC1tYXJrZXIgaW50ZXJzZWN0aW5nIHNlbGVjdGVkIHRhcmdldCcsIC0+XG4gICAgICAgICAgZW5zdXJlICdsIGcgbyBDJyxcbiAgICAgICAgICAgIG1vZGU6ICdpbnNlcnQnXG4gICAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIDogeHh4OiAgeHh4OiA6XG4gICAgICAgICAgICAhISE6IG9vbzogeHh4OiBvb28geHh4OiBvb286XG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dCgnWVlZJylcbiAgICAgICAgICBlbnN1cmUgJ2wgZyBvIEMnLFxuICAgICAgICAgICAgbW9kZTogJ2luc2VydCdcbiAgICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgWVlZOiB4eHg6IFlZWSB4eHg6IFlZWTpcbiAgICAgICAgICAgICEhITogb29vOiB4eHg6IG9vbyB4eHg6IG9vbzpcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgbnVtQ3Vyc29yczogM1xuICAgICAgICBkZXNjcmliZSBcInByZWRlZmluZWQga2V5bWFwIG9uIHdoZW4gaGFzLW9jY3VycmVuY2VcIiwgLT5cbiAgICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgICBzZXRcbiAgICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgICBWaW0gaXMgZWRpdG9yIEkgdXNlZCBiZWZvcmVcbiAgICAgICAgICAgICAgVnxpbSBpcyBlZGl0b3IgSSB1c2VkIGJlZm9yZVxuICAgICAgICAgICAgICBWaW0gaXMgZWRpdG9yIEkgdXNlZCBiZWZvcmVcbiAgICAgICAgICAgICAgVmltIGlzIGVkaXRvciBJIHVzZWQgYmVmb3JlXG4gICAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgICAgaXQgJ1tpbnNlcnQtYXQtc3RhcnRdIGFwcGx5IG9wZXJhdGlvbiB0byBwcmVzZXQtbWFya2VyIGludGVyc2VjdGluZyBzZWxlY3RlZCB0YXJnZXQnLCAtPlxuICAgICAgICAgICAgZW5zdXJlICdnIG8nLCBvY2N1cnJlbmNlVGV4dDogWydWaW0nLCAnVmltJywgJ1ZpbScsICdWaW0nXVxuICAgICAgICAgICAgY2xhc3NMaXN0LmNvbnRhaW5zKCdoYXMtb2NjdXJyZW5jZScpXG4gICAgICAgICAgICBlbnN1cmUgJ3YgayBJJywgbW9kZTogJ2luc2VydCcsIG51bUN1cnNvcnM6IDJcbiAgICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KFwicHVyZS1cIilcbiAgICAgICAgICAgIGVuc3VyZSAnZXNjYXBlJyxcbiAgICAgICAgICAgICAgbW9kZTogJ25vcm1hbCdcbiAgICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgICBwdXJlIS1WaW0gaXMgZWRpdG9yIEkgdXNlZCBiZWZvcmVcbiAgICAgICAgICAgICAgcHVyZXwtVmltIGlzIGVkaXRvciBJIHVzZWQgYmVmb3JlXG4gICAgICAgICAgICAgIFZpbSBpcyBlZGl0b3IgSSB1c2VkIGJlZm9yZVxuICAgICAgICAgICAgICBWaW0gaXMgZWRpdG9yIEkgdXNlZCBiZWZvcmVcbiAgICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgICBpdCAnW2luc2VydC1hZnRlci1zdGFydF0gYXBwbHkgb3BlcmF0aW9uIHRvIHByZXNldC1tYXJrZXIgaW50ZXJzZWN0aW5nIHNlbGVjdGVkIHRhcmdldCcsIC0+XG4gICAgICAgICAgICBzZXQgY3Vyc29yOiBbMSwgMV1cbiAgICAgICAgICAgIGVuc3VyZSAnZyBvJywgb2NjdXJyZW5jZVRleHQ6IFsnVmltJywgJ1ZpbScsICdWaW0nLCAnVmltJ11cbiAgICAgICAgICAgIGNsYXNzTGlzdC5jb250YWlucygnaGFzLW9jY3VycmVuY2UnKVxuICAgICAgICAgICAgZW5zdXJlICd2IGogQScsIG1vZGU6ICdpbnNlcnQnLCBudW1DdXJzb3JzOiAyXG4gICAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dChcIiBhbmQgRW1hY3NcIilcbiAgICAgICAgICAgIGVuc3VyZSAnZXNjYXBlJyxcbiAgICAgICAgICAgICAgbW9kZTogJ25vcm1hbCdcbiAgICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgICBWaW0gaXMgZWRpdG9yIEkgdXNlZCBiZWZvcmVcbiAgICAgICAgICAgICAgVmltIGFuZCBFbWFjfHMgaXMgZWRpdG9yIEkgdXNlZCBiZWZvcmVcbiAgICAgICAgICAgICAgVmltIGFuZCBFbWFjIXMgaXMgZWRpdG9yIEkgdXNlZCBiZWZvcmVcbiAgICAgICAgICAgICAgVmltIGlzIGVkaXRvciBJIHVzZWQgYmVmb3JlXG4gICAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICBkZXNjcmliZSBcInZpc3VhbC1tb2RlXCIsIC0+XG4gICAgICAgIGl0ICdbdXBjYXNlXSBhcHBseSB0byBwcmVzZXQtbWFya2VyIGFzIGxvbmcgYXMgaXQgaW50ZXJzZWN0cyBzZWxlY3Rpb24nLCAtPlxuICAgICAgICAgIHNldFxuICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgb29vOiB4fHh4OiBvb28geHh4OiBvb286XG4gICAgICAgICAgICB4eHg6IG9vbzogeHh4OiBvb28geHh4OiBvb286XG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICBlbnN1cmUgJ2cgbycsIG9jY3VycmVuY2VDb3VudDogNVxuICAgICAgICAgIGVuc3VyZSAndiBqIFUnLFxuICAgICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICBvb286IFhYWDogb29vIFhYWDogb29vOlxuICAgICAgICAgICAgWFhYOiBvb286IHh4eDogb29vIHh4eDogb29vOlxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgIGRlc2NyaWJlIFwidmlzdWFsLWxpbmV3aXNlLW1vZGVcIiwgLT5cbiAgICAgICAgaXQgJ1t1cGNhc2VdIGFwcGx5IHRvIHByZXNldC1tYXJrZXIgYXMgbG9uZyBhcyBpdCBpbnRlcnNlY3RzIHNlbGVjdGlvbicsIC0+XG4gICAgICAgICAgc2V0XG4gICAgICAgICAgICBjdXJzb3I6IFswLCA2XVxuICAgICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICBvb286IHh4eDogb29vIHh4eDogb29vOlxuICAgICAgICAgICAgeHh4OiBvb286IHh4eDogb29vIHh4eDogb29vOlxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgZW5zdXJlICdnIG8nLCBvY2N1cnJlbmNlQ291bnQ6IDVcbiAgICAgICAgICBlbnN1cmUgJ1YgVScsXG4gICAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIG9vbzogWFhYOiBvb28gWFhYOiBvb286XG4gICAgICAgICAgICB4eHg6IG9vbzogeHh4OiBvb28geHh4OiBvb286XG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgZGVzY3JpYmUgXCJ2aXN1YWwtYmxvY2t3aXNlLW1vZGVcIiwgLT5cbiAgICAgICAgaXQgJ1t1cGNhc2VdIGFwcGx5IHRvIHByZXNldC1tYXJrZXIgYXMgbG9uZyBhcyBpdCBpbnRlcnNlY3RzIHNlbGVjdGlvbicsIC0+XG4gICAgICAgICAgc2V0XG4gICAgICAgICAgICBjdXJzb3I6IFswLCA2XVxuICAgICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICBvb286IHh4eDogb29vIHh4eDogb29vOlxuICAgICAgICAgICAgeHh4OiBvb286IHh4eDogb29vIHh4eDogb29vOlxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgZW5zdXJlICdnIG8nLCBvY2N1cnJlbmNlQ291bnQ6IDVcbiAgICAgICAgICBlbnN1cmUgJ2N0cmwtdiBqIDIgdyBVJyxcbiAgICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgb29vOiBYWFg6IG9vbyB4eHg6IG9vbzpcbiAgICAgICAgICAgIHh4eDogb29vOiBYWFg6IG9vbyB4eHg6IG9vbzpcbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgZGVzY3JpYmUgXCJNb3ZlVG9OZXh0T2NjdXJyZW5jZSwgTW92ZVRvUHJldmlvdXNPY2N1cnJlbmNlXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICB8b29vOiB4eHg6IG9vb1xuICAgICAgICAgIF9fXzogb29vOiB4eHg6XG4gICAgICAgICAgb29vOiB4eHg6IG9vbzpcbiAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBlbnN1cmUgJ2cgbycsXG4gICAgICAgICAgb2NjdXJyZW5jZVRleHQ6IFsnb29vJywgJ29vbycsICdvb28nLCAnb29vJywgJ29vbyddXG5cblxuICAgICAgZGVzY3JpYmUgXCJ0YWIsIHNoaWZ0LXRhYlwiLCAtPlxuICAgICAgICBkZXNjcmliZSBcImN1cnNvciBpcyBhdCBzdGFydCBvZiBvY2N1cnJlbmNlXCIsIC0+XG4gICAgICAgICAgaXQgXCJzZWFyY2ggbmV4dC9wcmV2aW91cyBvY2N1cnJlbmNlIG1hcmtlclwiLCAtPlxuICAgICAgICAgICAgZW5zdXJlICd0YWIgdGFiJywgY3Vyc29yOiBbMSwgNV1cbiAgICAgICAgICAgIGVuc3VyZSAnMiB0YWInLCBjdXJzb3I6IFsyLCAxMF1cbiAgICAgICAgICAgIGVuc3VyZSAnMiBzaGlmdC10YWInLCBjdXJzb3I6IFsxLCA1XVxuICAgICAgICAgICAgZW5zdXJlICcyIHNoaWZ0LXRhYicsIGN1cnNvcjogWzAsIDBdXG5cbiAgICAgICAgZGVzY3JpYmUgXCJ3aGVuIGN1cnNvciBpcyBpbnNpZGUgb2Ygb2NjdXJyZW5jZVwiLCAtPlxuICAgICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICAgIGVuc3VyZSBcImVzY2FwZVwiLCBvY2N1cnJlbmNlQ291bnQ6IDBcbiAgICAgICAgICAgIHNldCB0ZXh0QzogXCJvb29vIG9vfG9vIG9vb29cIlxuICAgICAgICAgICAgZW5zdXJlICdnIG8nLCBvY2N1cnJlbmNlQ291bnQ6IDNcblxuICAgICAgICAgIGRlc2NyaWJlIFwidGFiXCIsIC0+XG4gICAgICAgICAgICBpdCBcIm1vdmUgdG8gbmV4dCBvY2N1cnJlbmNlXCIsIC0+XG4gICAgICAgICAgICAgIGVuc3VyZSAndGFiJywgdGV4dEM6ICdvb29vIG9vb28gfG9vb28nXG5cbiAgICAgICAgICBkZXNjcmliZSBcInNoaWZ0LXRhYlwiLCAtPlxuICAgICAgICAgICAgaXQgXCJtb3ZlIHRvIHByZXZpb3VzIG9jY3VycmVuY2VcIiwgLT5cbiAgICAgICAgICAgICAgZW5zdXJlICdzaGlmdC10YWInLCB0ZXh0QzogJ3xvb29vIG9vb28gb29vbydcblxuICAgICAgZGVzY3JpYmUgXCJhcyBvcGVyYXRvcidzIHRhcmdldFwiLCAtPlxuICAgICAgICBkZXNjcmliZSBcInRhYlwiLCAtPlxuICAgICAgICAgIGl0IFwib3BlcmF0ZSBvbiBuZXh0IG9jY3VycmVuY2UgYW5kIHJlcGVhdGFibGVcIiwgLT5cbiAgICAgICAgICAgIGVuc3VyZSBcImcgVSB0YWJcIixcbiAgICAgICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICAgIE9PTzogeHh4OiBPT09cbiAgICAgICAgICAgICAgX19fOiBvb286IHh4eDpcbiAgICAgICAgICAgICAgb29vOiB4eHg6IG9vbzpcbiAgICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICAgIG9jY3VycmVuY2VDb3VudDogM1xuICAgICAgICAgICAgZW5zdXJlIFwiLlwiLFxuICAgICAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgICAgT09POiB4eHg6IE9PT1xuICAgICAgICAgICAgICBfX186IE9PTzogeHh4OlxuICAgICAgICAgICAgICBvb286IHh4eDogb29vOlxuICAgICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgICAgb2NjdXJyZW5jZUNvdW50OiAyXG4gICAgICAgICAgICBlbnN1cmUgXCIyIC5cIixcbiAgICAgICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICAgIE9PTzogeHh4OiBPT09cbiAgICAgICAgICAgICAgX19fOiBPT086IHh4eDpcbiAgICAgICAgICAgICAgT09POiB4eHg6IE9PTzpcbiAgICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICAgIG9jY3VycmVuY2VDb3VudDogMFxuICAgICAgICAgICAgZXhwZWN0KGNsYXNzTGlzdC5jb250YWlucygnaGFzLW9jY3VycmVuY2UnKSkudG9CZShmYWxzZSlcblxuICAgICAgICAgIGl0IFwiW28tbW9kaWZpZXJdIG9wZXJhdGUgb24gbmV4dCBvY2N1cnJlbmNlIGFuZCByZXBlYXRhYmxlXCIsIC0+XG4gICAgICAgICAgICBlbnN1cmUgXCJlc2NhcGVcIixcbiAgICAgICAgICAgICAgbW9kZTogJ25vcm1hbCdcbiAgICAgICAgICAgICAgb2NjdXJyZW5jZUNvdW50OiAwXG5cbiAgICAgICAgICAgIGVuc3VyZSBcImcgVSBvIHRhYlwiLFxuICAgICAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgICAgT09POiB4eHg6IE9PT1xuICAgICAgICAgICAgICBfX186IG9vbzogeHh4OlxuICAgICAgICAgICAgICBvb286IHh4eDogb29vOlxuICAgICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgICAgb2NjdXJyZW5jZUNvdW50OiAwXG5cbiAgICAgICAgICAgIGVuc3VyZSBcIi5cIixcbiAgICAgICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICAgIE9PTzogeHh4OiBPT09cbiAgICAgICAgICAgICAgX19fOiBPT086IHh4eDpcbiAgICAgICAgICAgICAgb29vOiB4eHg6IG9vbzpcbiAgICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICAgIG9jY3VycmVuY2VDb3VudDogMFxuXG4gICAgICAgICAgICBlbnN1cmUgXCIyIC5cIixcbiAgICAgICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICAgIE9PTzogeHh4OiBPT09cbiAgICAgICAgICAgICAgX19fOiBPT086IHh4eDpcbiAgICAgICAgICAgICAgT09POiB4eHg6IE9PTzpcbiAgICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICAgIG9jY3VycmVuY2VDb3VudDogMFxuXG4gICAgICAgIGRlc2NyaWJlIFwic2hpZnQtdGFiXCIsIC0+XG4gICAgICAgICAgaXQgXCJvcGVyYXRlIG9uIG5leHQgcHJldmlvdXMgYW5kIHJlcGVhdGFibGVcIiwgLT5cbiAgICAgICAgICAgIHNldCBjdXJzb3I6IFsyLCAxMF1cbiAgICAgICAgICAgIGVuc3VyZSBcImcgVSBzaGlmdC10YWJcIixcbiAgICAgICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICAgIG9vbzogeHh4OiBvb29cbiAgICAgICAgICAgICAgX19fOiBvb286IHh4eDpcbiAgICAgICAgICAgICAgT09POiB4eHg6IE9PTzpcbiAgICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICAgIG9jY3VycmVuY2VDb3VudDogM1xuICAgICAgICAgICAgZW5zdXJlIFwiLlwiLFxuICAgICAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgICAgb29vOiB4eHg6IG9vb1xuICAgICAgICAgICAgICBfX186IE9PTzogeHh4OlxuICAgICAgICAgICAgICBPT086IHh4eDogT09POlxuICAgICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgICAgb2NjdXJyZW5jZUNvdW50OiAyXG4gICAgICAgICAgICBlbnN1cmUgXCIyIC5cIixcbiAgICAgICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICAgIE9PTzogeHh4OiBPT09cbiAgICAgICAgICAgICAgX19fOiBPT086IHh4eDpcbiAgICAgICAgICAgICAgT09POiB4eHg6IE9PTzpcbiAgICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICAgIG9jY3VycmVuY2VDb3VudDogMFxuICAgICAgICAgICAgZXhwZWN0KGNsYXNzTGlzdC5jb250YWlucygnaGFzLW9jY3VycmVuY2UnKSkudG9CZShmYWxzZSlcblxuICAgICAgZGVzY3JpYmUgXCJleGN1ZGUgcGFydGljdWxhciBvY2N1cmVuY2UgYnkgYC5gIHJlcGVhdFwiLCAtPlxuICAgICAgICBpdCBcImNsZWFyIHByZXNldC1vY2N1cnJlbmNlIGFuZCBtb3ZlIHRvIG5leHRcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJzIgdGFiIC4gZyBVIGkgcCcsXG4gICAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICBPT086IHh4eDogT09PXG4gICAgICAgICAgICBfX186IHxvb286IHh4eDpcbiAgICAgICAgICAgIE9PTzogeHh4OiBPT086XG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBpdCBcImNsZWFyIHByZXNldC1vY2N1cnJlbmNlIGFuZCBtb3ZlIHRvIHByZXZpb3VzXCIsIC0+XG4gICAgICAgICAgZW5zdXJlICcyIHNoaWZ0LXRhYiAuIGcgVSBpIHAnLFxuICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgT09POiB4eHg6IE9PT1xuICAgICAgICAgICAgX19fOiBPT086IHh4eDpcbiAgICAgICAgICAgIHxvb286IHh4eDogT09POlxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICBkZXNjcmliZSBcImV4cGxpY3Qgb3BlcmF0b3ItbW9kaWZpZXIgbyBhbmQgcHJlc2V0LW1hcmtlclwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgfG9vbzogeHh4OiBvb28geHh4OiBvb286XG4gICAgICAgICAgX19fOiBvb286IHh4eDogb29vIHh4eDogb29vOlxuICAgICAgICAgIFwiXCJcIlxuXG4gICAgICBkZXNjcmliZSBcIidvJyBtb2RpZmllciB3aGVuIHByZXNldCBvY2N1cnJlbmNlIGFscmVhZHkgZXhpc3RzXCIsIC0+XG4gICAgICAgIGl0IFwiJ28nIGFsd2F5cyBwaWNrIGN1cnNvci13b3JkIGFuZCBvdmVyd3JpdGUgZXhpc3RpbmcgcHJlc2V0IG1hcmtlcilcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgXCJnIG9cIixcbiAgICAgICAgICAgIG9jY3VycmVuY2VUZXh0OiBbXCJvb29cIiwgXCJvb29cIiwgXCJvb29cIiwgXCJvb29cIiwgXCJvb29cIiwgXCJvb29cIl1cbiAgICAgICAgICBlbnN1cmUgXCIyIHcgZCBvXCIsXG4gICAgICAgICAgICBvY2N1cnJlbmNlVGV4dDogW1wieHh4XCIsIFwieHh4XCIsIFwieHh4XCIsIFwieHh4XCJdXG4gICAgICAgICAgICBtb2RlOiAnb3BlcmF0b3ItcGVuZGluZydcbiAgICAgICAgICBlbnN1cmUgXCJqXCIsXG4gICAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIG9vbzogOiBvb28gOiBvb286XG4gICAgICAgICAgICBfX186IG9vbzogOiBvb28gOiBvb286XG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgIG1vZGU6ICdub3JtYWwnXG5cbiAgICAgIGRlc2NyaWJlIFwib2NjdXJyZW5jZSBib3VuZCBvcGVyYXRvciBkb24ndCBvdmVyd2l0ZSBwcmUtZXhpc3RpbmcgcHJlc2V0IG1hcmtlclwiLCAtPlxuICAgICAgICBpdCBcIidvJyBhbHdheXMgcGljayBjdXJzb3Itd29yZCBhbmQgY2xlYXIgZXhpc3RpbmcgcHJlc2V0IG1hcmtlclwiLCAtPlxuICAgICAgICAgIGVuc3VyZSBcImcgb1wiLFxuICAgICAgICAgICAgb2NjdXJyZW5jZVRleHQ6IFtcIm9vb1wiLCBcIm9vb1wiLCBcIm9vb1wiLCBcIm9vb1wiLCBcIm9vb1wiLCBcIm9vb1wiXVxuICAgICAgICAgIGVuc3VyZSBcIjIgdyBnIGNtZC1kXCIsXG4gICAgICAgICAgICBvY2N1cnJlbmNlVGV4dDogW1wib29vXCIsIFwib29vXCIsIFwib29vXCIsIFwib29vXCIsIFwib29vXCIsIFwib29vXCJdXG4gICAgICAgICAgICBtb2RlOiAnb3BlcmF0b3ItcGVuZGluZydcbiAgICAgICAgICBlbnN1cmUgXCJqXCIsXG4gICAgICAgICAgIHNlbGVjdGVkVGV4dDogW1wib29vXCIsIFwib29vXCIsIFwib29vXCIsIFwib29vXCIsIFwib29vXCIsIFwib29vXCJdXG5cbiAgICBkZXNjcmliZSBcInRvZ2dsZS1wcmVzZXQtc3Vid29yZC1vY2N1cnJlbmNlIGNvbW1hbmRzXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHRDOiBcIlwiXCJcblxuICAgICAgICAgIGNhbWVsQ2F8c2UgQ2FzZXNcbiAgICAgICAgICBcIkNhc2VTdHVkeVwiIFNuYWtlQ2FzZVxuICAgICAgICAgIFVQX0NBU0VcblxuICAgICAgICAgIG90aGVyIFBhcmFncmFwaENhc2VcbiAgICAgICAgICBcIlwiXCJcblxuICAgICAgZGVzY3JpYmUgXCJhZGQgcHJlc2V0IHN1YndvcmQtb2NjdXJyZW5jZVwiLCAtPlxuICAgICAgICBpdCBcIm1hcmsgc3Vid29yZCB1bmRlciBjdXJzb3JcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJ2cgTycsIG9jY3VycmVuY2VUZXh0OiBbJ0Nhc2UnLCAnQ2FzZScsICdDYXNlJywgJ0Nhc2UnXVxuIl19
