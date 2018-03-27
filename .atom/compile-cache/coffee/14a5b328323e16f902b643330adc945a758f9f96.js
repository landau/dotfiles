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
        var persistentSelectionBufferRange;
        persistentSelectionBufferRange = null;
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
          persistentSelectionBufferRange = [[[0, 0], [2, 0]], [[3, 0], [4, 0]]];
          return ensure('V j m G m m', {
            persistentSelectionBufferRange: persistentSelectionBufferRange
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
          ensure([
            'j f', {
              input: '='
            }
          ], {
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
            ensure([
              '/', {
                search: '=>'
              }
            ], {
              cursor: [9, 69]
            });
            keystroke("m");
            return expect(vimState.persistentSelection.getMarkers()).toHaveLength(10);
          });
          waitsFor(function() {
            return classList.contains('has-persistent-selection');
          });
          return runs(function() {
            keystroke(['ctrl-cmd-g', 'I']);
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
              return ensure([
                'r', {
                  input: '!'
                }
              ], {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9zcGVjL29jY3VycmVuY2Utc3BlYy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLE1BQTZDLE9BQUEsQ0FBUSxlQUFSLENBQTdDLEVBQUMsNkJBQUQsRUFBYyx1QkFBZCxFQUF3Qix1QkFBeEIsRUFBa0M7O0VBQ2xDLFFBQUEsR0FBVyxPQUFBLENBQVEsaUJBQVI7O0VBRVgsUUFBQSxDQUFTLFlBQVQsRUFBdUIsU0FBQTtBQUNyQixRQUFBO0lBQUEsT0FBdUUsRUFBdkUsRUFBQyxhQUFELEVBQU0sZ0JBQU4sRUFBYyxtQkFBZCxFQUF5QixnQkFBekIsRUFBaUMsdUJBQWpDLEVBQWdELGtCQUFoRCxFQUEwRDtJQUMxRCxPQUFzQyxFQUF0QyxFQUFDLHNCQUFELEVBQWU7SUFDZixlQUFBLEdBQWtCLFNBQUMsSUFBRDthQUNoQixZQUFZLENBQUMsVUFBYixDQUF3QixJQUF4QjtJQURnQjtJQUVsQixxQkFBQSxHQUF3QixTQUFDLElBQUQ7YUFDdEIsUUFBQSxDQUFTLG1CQUFULEVBQThCLElBQTlCO0lBRHNCO0lBR3hCLFVBQUEsQ0FBVyxTQUFBO01BQ1QsV0FBQSxDQUFZLFNBQUMsS0FBRCxFQUFRLEdBQVI7UUFDVixRQUFBLEdBQVc7UUFDVix3QkFBRCxFQUFTO1FBQ1IsYUFBRCxFQUFNLG1CQUFOLEVBQWM7UUFDZCxTQUFBLEdBQVksYUFBYSxDQUFDO1FBQzFCLFlBQUEsR0FBZSxRQUFRLENBQUMsV0FBVyxDQUFDO2VBQ3BDLG1CQUFBLEdBQXNCLFFBQVEsQ0FBQyxXQUFXLENBQUM7TUFOakMsQ0FBWjthQVFBLElBQUEsQ0FBSyxTQUFBO2VBQ0gsT0FBTyxDQUFDLFdBQVIsQ0FBb0IsYUFBcEI7TUFERyxDQUFMO0lBVFMsQ0FBWDtJQVlBLFFBQUEsQ0FBUyw4QkFBVCxFQUF5QyxTQUFB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K0JBQVQsRUFBMEMsU0FBQTtpQkFDeEMsRUFBQSxDQUFHLDJCQUFILEVBQWdDLFNBQUE7bUJBQzlCLE1BQUEsQ0FBTyxLQUFQLEVBQWM7Y0FBQSxjQUFBLEVBQWdCLENBQUMsTUFBRCxFQUFTLE1BQVQsRUFBaUIsTUFBakIsRUFBeUIsTUFBekIsQ0FBaEI7YUFBZDtVQUQ4QixDQUFoQztRQUR3QyxDQUExQztNQVpvRCxDQUF0RDtJQTlibUMsQ0FBckM7RUFwakJxQixDQUF2QjtBQUhBIiwic291cmNlc0NvbnRlbnQiOlsie2dldFZpbVN0YXRlLCBkaXNwYXRjaCwgVGV4dERhdGEsIGdldFZpZXd9ID0gcmVxdWlyZSAnLi9zcGVjLWhlbHBlcidcbnNldHRpbmdzID0gcmVxdWlyZSAnLi4vbGliL3NldHRpbmdzJ1xuXG5kZXNjcmliZSBcIk9jY3VycmVuY2VcIiwgLT5cbiAgW3NldCwgZW5zdXJlLCBrZXlzdHJva2UsIGVkaXRvciwgZWRpdG9yRWxlbWVudCwgdmltU3RhdGUsIGNsYXNzTGlzdF0gPSBbXVxuICBbc2VhcmNoRWRpdG9yLCBzZWFyY2hFZGl0b3JFbGVtZW50XSA9IFtdXG4gIGlucHV0U2VhcmNoVGV4dCA9ICh0ZXh0KSAtPlxuICAgIHNlYXJjaEVkaXRvci5pbnNlcnRUZXh0KHRleHQpXG4gIGRpc3BhdGNoU2VhcmNoQ29tbWFuZCA9IChuYW1lKSAtPlxuICAgIGRpc3BhdGNoKHNlYXJjaEVkaXRvckVsZW1lbnQsIG5hbWUpXG5cbiAgYmVmb3JlRWFjaCAtPlxuICAgIGdldFZpbVN0YXRlIChzdGF0ZSwgdmltKSAtPlxuICAgICAgdmltU3RhdGUgPSBzdGF0ZVxuICAgICAge2VkaXRvciwgZWRpdG9yRWxlbWVudH0gPSB2aW1TdGF0ZVxuICAgICAge3NldCwgZW5zdXJlLCBrZXlzdHJva2V9ID0gdmltXG4gICAgICBjbGFzc0xpc3QgPSBlZGl0b3JFbGVtZW50LmNsYXNzTGlzdFxuICAgICAgc2VhcmNoRWRpdG9yID0gdmltU3RhdGUuc2VhcmNoSW5wdXQuZWRpdG9yXG4gICAgICBzZWFyY2hFZGl0b3JFbGVtZW50ID0gdmltU3RhdGUuc2VhcmNoSW5wdXQuZWRpdG9yRWxlbWVudFxuXG4gICAgcnVucyAtPlxuICAgICAgamFzbWluZS5hdHRhY2hUb0RPTShlZGl0b3JFbGVtZW50KVxuXG4gIGRlc2NyaWJlIFwib3BlcmF0b3ItbW9kaWZpZXItb2NjdXJyZW5jZVwiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNldFxuICAgICAgICB0ZXh0OiBcIlwiXCJcblxuICAgICAgICBvb286IHh4eDogb29vOlxuICAgICAgICAtLS06IG9vbzogeHh4OiBvb286XG4gICAgICAgIG9vbzogeHh4OiAtLS06IHh4eDogb29vOlxuICAgICAgICB4eHg6IC0tLTogb29vOiBvb286XG5cbiAgICAgICAgb29vOiB4eHg6IG9vbzpcbiAgICAgICAgLS0tOiBvb286IHh4eDogb29vOlxuICAgICAgICBvb286IHh4eDogLS0tOiB4eHg6IG9vbzpcbiAgICAgICAgeHh4OiAtLS06IG9vbzogb29vOlxuXG4gICAgICAgIFwiXCJcIlxuXG4gICAgZGVzY3JpYmUgXCJvIG1vZGlmaWVyXCIsIC0+XG4gICAgICBpdCBcImNoYW5nZSBvY2N1cnJlbmNlIG9mIGN1cnNvciB3b3JkIGluIGlubmVyLXBhcmFncmFwaFwiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMSwgMF1cbiAgICAgICAgZW5zdXJlIFwiYyBvIGkgcFwiLFxuICAgICAgICAgIG1vZGU6ICdpbnNlcnQnXG4gICAgICAgICAgdGV4dEM6IFwiXCJcIlxuXG4gICAgICAgICAgITogeHh4OiB8OlxuICAgICAgICAgIC0tLTogfDogeHh4OiB8OlxuICAgICAgICAgIHw6IHh4eDogLS0tOiB4eHg6IHw6XG4gICAgICAgICAgeHh4OiAtLS06IHw6IHw6XG5cbiAgICAgICAgICBvb286IHh4eDogb29vOlxuICAgICAgICAgIC0tLTogb29vOiB4eHg6IG9vbzpcbiAgICAgICAgICBvb286IHh4eDogLS0tOiB4eHg6IG9vbzpcbiAgICAgICAgICB4eHg6IC0tLTogb29vOiBvb286XG5cbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgZWRpdG9yLmluc2VydFRleHQoJz09PScpXG4gICAgICAgIGVuc3VyZSBcImVzY2FwZVwiLFxuICAgICAgICAgIG1vZGU6ICdub3JtYWwnXG4gICAgICAgICAgdGV4dEM6IFwiXCJcIlxuXG4gICAgICAgICAgPT0hPTogeHh4OiA9PXw9OlxuICAgICAgICAgIC0tLTogPT18PTogeHh4OiA9PXw9OlxuICAgICAgICAgID09fD06IHh4eDogLS0tOiB4eHg6ID09fD06XG4gICAgICAgICAgeHh4OiAtLS06ID09fD06ID09fD06XG5cbiAgICAgICAgICBvb286IHh4eDogb29vOlxuICAgICAgICAgIC0tLTogb29vOiB4eHg6IG9vbzpcbiAgICAgICAgICBvb286IHh4eDogLS0tOiB4eHg6IG9vbzpcbiAgICAgICAgICB4eHg6IC0tLTogb29vOiBvb286XG5cbiAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBlbnN1cmUgXCJ9IGogLlwiLFxuICAgICAgICAgIG1vZGU6ICdub3JtYWwnXG4gICAgICAgICAgdGV4dEM6IFwiXCJcIlxuXG4gICAgICAgICAgPT09OiB4eHg6ID09PTpcbiAgICAgICAgICAtLS06ID09PTogeHh4OiA9PT06XG4gICAgICAgICAgPT09OiB4eHg6IC0tLTogeHh4OiA9PT06XG4gICAgICAgICAgeHh4OiAtLS06ID09PTogPT09OlxuXG4gICAgICAgICAgPT0hPTogeHh4OiA9PXw9OlxuICAgICAgICAgIC0tLTogPT18PTogeHh4OiA9PXw9OlxuICAgICAgICAgID09fD06IHh4eDogLS0tOiB4eHg6ID09fD06XG4gICAgICAgICAgeHh4OiAtLS06ID09fD06ID09fD06XG5cbiAgICAgICAgICBcIlwiXCJcblxuICAgIGRlc2NyaWJlIFwiTyBtb2RpZmllclwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0QzogXCJcIlwiXG5cbiAgICAgICAgICBjYW1lbENhfHNlIENhc2VzXG4gICAgICAgICAgXCJDYXNlU3R1ZHlcIiBTbmFrZUNhc2VcbiAgICAgICAgICBVUF9DQVNFXG5cbiAgICAgICAgICBvdGhlciBQYXJhZ3JhcGhDYXNlXG4gICAgICAgICAgXCJcIlwiXG4gICAgICBpdCBcImRlbGV0ZSBzdWJ3b3JkLW9jY3VycmVuY2UgaW4gcGFyYWdyYXBoIGFuZCByZXBlYXRhYmxlXCIsIC0+XG4gICAgICAgIGVuc3VyZSBcImQgTyBwXCIsXG4gICAgICAgICAgdGV4dEM6IFwiXCJcIlxuXG4gICAgICAgICAgY2FtZWx8IENhc2VzXG4gICAgICAgICAgXCJTdHVkeVwiIFNuYWtlXG4gICAgICAgICAgVVBfQ0FTRVxuXG4gICAgICAgICAgb3RoZXIgUGFyYWdyYXBoQ2FzZVxuICAgICAgICAgIFwiXCJcIlxuICAgICAgICBlbnN1cmUgXCJHIC5cIixcbiAgICAgICAgICB0ZXh0QzogXCJcIlwiXG5cbiAgICAgICAgICBjYW1lbCBDYXNlc1xuICAgICAgICAgIFwiU3R1ZHlcIiBTbmFrZVxuICAgICAgICAgIFVQX0NBU0VcblxuICAgICAgICAgIHxvdGhlciBQYXJhZ3JhcGhcbiAgICAgICAgICBcIlwiXCJcblxuICAgIGRlc2NyaWJlIFwiYXBwbHkgdmFyaW91cyBvcGVyYXRvciB0byBvY2N1cnJlbmNlIGluIHZhcmlvdXMgdGFyZ2V0XCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICBvb286IHh4eDogbyFvbzpcbiAgICAgICAgICA9PT06IG9vbzogeHh4OiBvb286XG4gICAgICAgICAgb29vOiB4eHg6ID09PTogeHh4OiBvb286XG4gICAgICAgICAgeHh4OiA9PT06IG9vbzogb29vOlxuICAgICAgICAgIFwiXCJcIlxuICAgICAgaXQgXCJ1cHBlciBjYXNlIGlubmVyLXdvcmRcIiwgLT5cbiAgICAgICAgZW5zdXJlIFwiZyBVIG8gaSBsXCIsXG4gICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgIE9PTzogeHh4OiBPIU9POlxuICAgICAgICAgID09PTogb29vOiB4eHg6IG9vbzpcbiAgICAgICAgICBvb286IHh4eDogPT09OiB4eHg6IG9vbzpcbiAgICAgICAgICB4eHg6ID09PTogb29vOiBvb286XG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgIGVuc3VyZSBcIjIgaiAuXCIsXG4gICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgIE9PTzogeHh4OiBPT086XG4gICAgICAgICAgPT09OiBvb286IHh4eDogb29vOlxuICAgICAgICAgIE9PTzogeHh4OiA9IT09OiB4eHg6IE9PTzpcbiAgICAgICAgICB4eHg6ID09PTogb29vOiBvb286XG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgIGVuc3VyZSBcImogLlwiLFxuICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICBPT086IHh4eDogT09POlxuICAgICAgICAgID09PTogb29vOiB4eHg6IG9vbzpcbiAgICAgICAgICBPT086IHh4eDogPT09OiB4eHg6IE9PTzpcbiAgICAgICAgICB4eHg6ID09PTogTyFPTzogT09POlxuICAgICAgICAgIFwiXCJcIlxuXG4gICAgICBkZXNjcmliZSBcImNsaXAgdG8gbXV0YXRpb24gZW5kIGJlaGF2aW9yXCIsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBzZXRcbiAgICAgICAgICAgIHRleHRDOiBcIlwiXCJcblxuICAgICAgICAgICAgb298bzp4eHg6b29vOlxuICAgICAgICAgICAgeHh4Om9vbzp4eHhcbiAgICAgICAgICAgIFxcblxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgIGl0IFwiW2QgbyBwXSBkZWxldGUgb2NjdXJyZW5jZSBhbmQgY3Vyc29yIGlzIGF0IG11dGF0aW9uIGVuZFwiLCAtPlxuICAgICAgICAgIGVuc3VyZSBcImQgbyBwXCIsXG4gICAgICAgICAgICB0ZXh0QzogXCJcIlwiXG5cbiAgICAgICAgICAgIHw6eHh4OjpcbiAgICAgICAgICAgIHh4eDo6eHh4XG4gICAgICAgICAgICBcXG5cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICBpdCBcIltkIG8gal0gZGVsZXRlIG9jY3VycmVuY2UgYW5kIGN1cnNvciBpcyBhdCBtdXRhdGlvbiBlbmRcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgXCJkIG8galwiLFxuICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuXG4gICAgICAgICAgICB8Onh4eDo6XG4gICAgICAgICAgICB4eHg6Onh4eFxuICAgICAgICAgICAgXFxuXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgaXQgXCJub3QgY2xpcCBpZiBvcmlnaW5hbCBjdXJzb3Igbm90IGludGVyc2VjdHMgYW55IG9jY3VyZW5jZS1tYXJrZXJcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJ2cgbycsIG9jY3VycmVuY2VUZXh0OiBbJ29vbycsICdvb28nLCAnb29vJ10sIGN1cnNvcjogWzEsIDJdXG4gICAgICAgICAga2V5c3Ryb2tlICdqJywgY3Vyc29yOiBbMiwgMl1cbiAgICAgICAgICBlbnN1cmUgXCJkIHBcIixcbiAgICAgICAgICAgIHRleHRDOiBcIlwiXCJcblxuICAgICAgICAgICAgOnh4eDo6XG4gICAgICAgICAgICB4eHx4Ojp4eHhcbiAgICAgICAgICAgIFxcblxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICBkZXNjcmliZSBcImF1dG8gZXh0ZW5kIHRhcmdldCByYW5nZSB0byBpbmNsdWRlIG9jY3VycmVuY2VcIiwgLT5cbiAgICAgIHRleHRPcmlnaW5hbCA9IFwiVGhpcyB0ZXh0IGhhdmUgMyBpbnN0YW5jZSBvZiAndGV4dCcgaW4gdGhlIHdob2xlIHRleHQuXFxuXCJcbiAgICAgIHRleHRGaW5hbCA9IHRleHRPcmlnaW5hbC5yZXBsYWNlKC90ZXh0L2csICcnKVxuXG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldCB0ZXh0OiB0ZXh0T3JpZ2luYWxcblxuICAgICAgaXQgXCJbZnJvbSBzdGFydCBvZiAxc3RdXCIsIC0+IHNldCBjdXJzb3I6IFswLCA1XTsgZW5zdXJlICdkIG8gJCcsIHRleHQ6IHRleHRGaW5hbFxuICAgICAgaXQgXCJbZnJvbSBtaWRkbGUgb2YgMXN0XVwiLCAtPiBzZXQgY3Vyc29yOiBbMCwgN107IGVuc3VyZSAnZCBvICQnLCB0ZXh0OiB0ZXh0RmluYWxcbiAgICAgIGl0IFwiW2Zyb20gZW5kIG9mIGxhc3RdXCIsIC0+IHNldCBjdXJzb3I6IFswLCA1Ml07IGVuc3VyZSAnZCBvIDAnLCB0ZXh0OiB0ZXh0RmluYWxcbiAgICAgIGl0IFwiW2Zyb20gbWlkZGxlIG9mIGxhc3RdXCIsIC0+IHNldCBjdXJzb3I6IFswLCA1MV07IGVuc3VyZSAnZCBvIDAnLCB0ZXh0OiB0ZXh0RmluYWxcblxuICAgIGRlc2NyaWJlIFwic2VsZWN0LW9jY3VycmVuY2VcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgdmltLW1vZGUtcGx1cyB2aW0tbW9kZS1wbHVzXG4gICAgICAgICAgXCJcIlwiXG4gICAgICBkZXNjcmliZSBcIndoYXQgdGhlIGN1cnNvci13b3JkXCIsIC0+XG4gICAgICAgIGVuc3VyZUN1cnNvcldvcmQgPSAoaW5pdGlhbFBvaW50LCB7c2VsZWN0ZWRUZXh0fSkgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBpbml0aWFsUG9pbnRcbiAgICAgICAgICBlbnN1cmUgXCJnIGNtZC1kIGkgcFwiLFxuICAgICAgICAgICAgc2VsZWN0ZWRUZXh0OiBzZWxlY3RlZFRleHRcbiAgICAgICAgICAgIG1vZGU6IFsndmlzdWFsJywgJ2NoYXJhY3Rlcndpc2UnXVxuICAgICAgICAgIGVuc3VyZSBcImVzY2FwZVwiLCBtb2RlOiBcIm5vcm1hbFwiXG5cbiAgICAgICAgZGVzY3JpYmUgXCJjdXJzb3IgaXMgb24gbm9ybWFsIHdvcmRcIiwgLT5cbiAgICAgICAgICBpdCBcInBpY2sgd29yZCBidXQgbm90IHBpY2sgcGFydGlhbGx5IG1hdGNoZWQgb25lIFtieSBzZWxlY3RdXCIsIC0+XG4gICAgICAgICAgICBlbnN1cmVDdXJzb3JXb3JkKFswLCAwXSwgc2VsZWN0ZWRUZXh0OiBbJ3ZpbScsICd2aW0nXSlcbiAgICAgICAgICAgIGVuc3VyZUN1cnNvcldvcmQoWzAsIDNdLCBzZWxlY3RlZFRleHQ6IFsnLScsICctJywgJy0nLCAnLSddKVxuICAgICAgICAgICAgZW5zdXJlQ3Vyc29yV29yZChbMCwgNF0sIHNlbGVjdGVkVGV4dDogWydtb2RlJywgJ21vZGUnXSlcbiAgICAgICAgICAgIGVuc3VyZUN1cnNvcldvcmQoWzAsIDldLCBzZWxlY3RlZFRleHQ6IFsncGx1cycsICdwbHVzJ10pXG5cbiAgICAgICAgZGVzY3JpYmUgXCJjdXJzb3IgaXMgYXQgc2luZ2xlIHdoaXRlIHNwYWNlIFtieSBkZWxldGVdXCIsIC0+XG4gICAgICAgICAgaXQgXCJwaWNrIHNpbmdsZSB3aGl0ZSBzcGFjZSBvbmx5XCIsIC0+XG4gICAgICAgICAgICBzZXRcbiAgICAgICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICAgIG9vbyBvb28gb29vXG4gICAgICAgICAgICAgICBvb28gb29vIG9vb1xuICAgICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgICAgY3Vyc29yOiBbMCwgM11cbiAgICAgICAgICAgIGVuc3VyZSBcImQgbyBpIHBcIixcbiAgICAgICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICAgIG9vb29vb29vb1xuICAgICAgICAgICAgICBvb29vb29vb29cbiAgICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgZGVzY3JpYmUgXCJjdXJzb3IgaXMgYXQgc2VxdW5jZSBvZiBzcGFjZSBbYnkgZGVsZXRlXVwiLCAtPlxuICAgICAgICAgIGl0IFwic2VsZWN0IHNlcXVuY2Ugb2Ygd2hpdGUgc3BhY2VzIGluY2x1ZGluZyBwYXJ0aWFsbHkgbWFjaGVkIG9uZVwiLCAtPlxuICAgICAgICAgICAgc2V0XG4gICAgICAgICAgICAgIGN1cnNvcjogWzAsIDNdXG4gICAgICAgICAgICAgIHRleHRfOiBcIlwiXCJcbiAgICAgICAgICAgICAgb29vX19fb29vIG9vb1xuICAgICAgICAgICAgICAgb29vIG9vb19fX19vb29fX19fX19fX29vb1xuICAgICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgIGVuc3VyZSBcImQgbyBpIHBcIixcbiAgICAgICAgICAgICAgdGV4dF86IFwiXCJcIlxuICAgICAgICAgICAgICBvb29vb28gb29vXG4gICAgICAgICAgICAgICBvb28gb29vIG9vbyAgb29vXG4gICAgICAgICAgICAgIFwiXCJcIlxuXG4gIGRlc2NyaWJlIFwic3RheU9uT2NjdXJyZW5jZSBzZXR0aW5nc1wiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNldFxuICAgICAgICB0ZXh0QzogXCJcIlwiXG5cbiAgICAgICAgYWFhLCBiYmIsIGNjY1xuICAgICAgICBiYmIsIGF8YWEsIGFhYVxuXG4gICAgICAgIFwiXCJcIlxuXG4gICAgZGVzY3JpYmUgXCJ3aGVuIHRydWUgKD0gZGVmYXVsdClcIiwgLT5cbiAgICAgIGl0IFwia2VlcCBjdXJzb3IgcG9zaXRpb24gYWZ0ZXIgb3BlcmF0aW9uIGZpbmlzaGVkXCIsIC0+XG4gICAgICAgIGVuc3VyZSAnZyBVIG8gcCcsXG4gICAgICAgICAgdGV4dEM6IFwiXCJcIlxuXG4gICAgICAgICAgQUFBLCBiYmIsIGNjY1xuICAgICAgICAgIGJiYiwgQXxBQSwgQUFBXG5cbiAgICAgICAgICBcIlwiXCJcblxuICAgIGRlc2NyaWJlIFwid2hlbiBmYWxzZVwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXR0aW5ncy5zZXQoJ3N0YXlPbk9jY3VycmVuY2UnLCBmYWxzZSlcblxuICAgICAgaXQgXCJtb3ZlIGN1cnNvciB0byBzdGFydCBvZiB0YXJnZXQgYXMgbGlrZSBub24tb2N1cnJlbmNlIG9wZXJhdG9yXCIsIC0+XG4gICAgICAgIGVuc3VyZSAnZyBVIG8gcCcsXG4gICAgICAgICAgdGV4dEM6IFwiXCJcIlxuXG4gICAgICAgICAgfEFBQSwgYmJiLCBjY2NcbiAgICAgICAgICBiYmIsIEFBQSwgQUFBXG5cbiAgICAgICAgICBcIlwiXCJcblxuXG4gIGRlc2NyaWJlIFwiZnJvbSB2aXN1YWwtbW9kZS5pcy1uYXJyb3dlZFwiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNldFxuICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgb29vOiB4eHg6IG9vb1xuICAgICAgICB8fHw6IG9vbzogeHh4OiBvb29cbiAgICAgICAgb29vOiB4eHg6IHx8fDogeHh4OiBvb29cbiAgICAgICAgeHh4OiB8fHw6IG9vbzogb29vXG4gICAgICAgIFwiXCJcIlxuICAgICAgICBjdXJzb3I6IFswLCAwXVxuXG4gICAgZGVzY3JpYmUgXCJbdkNdIHNlbGVjdC1vY2N1cnJlbmNlXCIsIC0+XG4gICAgICBpdCBcInNlbGVjdCBjdXJzb3Itd29yZCB3aGljaCBpbnRlcnNlY3Rpbmcgc2VsZWN0aW9uIHRoZW4gYXBwbHkgdXBwZXItY2FzZVwiLCAtPlxuICAgICAgICBlbnN1cmUgXCJ2IDIgaiBjbWQtZFwiLFxuICAgICAgICAgIHNlbGVjdGVkVGV4dDogWydvb28nLCAnb29vJywgJ29vbycsICdvb28nLCAnb29vJ11cbiAgICAgICAgICBtb2RlOiBbJ3Zpc3VhbCcsICdjaGFyYWN0ZXJ3aXNlJ11cblxuICAgICAgICBlbnN1cmUgXCJVXCIsXG4gICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgT09POiB4eHg6IE9PT1xuICAgICAgICAgIHx8fDogT09POiB4eHg6IE9PT1xuICAgICAgICAgIE9PTzogeHh4OiB8fHw6IHh4eDogb29vXG4gICAgICAgICAgeHh4OiB8fHw6IG9vbzogb29vXG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgbnVtQ3Vyc29yczogNVxuICAgICAgICAgIG1vZGU6ICdub3JtYWwnXG5cbiAgICBkZXNjcmliZSBcIlt2TF0gc2VsZWN0LW9jY3VycmVuY2VcIiwgLT5cbiAgICAgIGl0IFwic2VsZWN0IGN1cnNvci13b3JkIHdoaWNoIGludGVyc2VjdGluZyBzZWxlY3Rpb24gdGhlbiBhcHBseSB1cHBlci1jYXNlXCIsIC0+XG4gICAgICAgIGVuc3VyZSBcIjUgbCBWIDIgaiBjbWQtZFwiLFxuICAgICAgICAgIHNlbGVjdGVkVGV4dDogWyd4eHgnLCAneHh4JywgJ3h4eCcsICd4eHgnXVxuICAgICAgICAgIG1vZGU6IFsndmlzdWFsJywgJ2NoYXJhY3Rlcndpc2UnXVxuXG4gICAgICAgIGVuc3VyZSBcIlVcIixcbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICBvb286IFhYWDogb29vXG4gICAgICAgICAgfHx8OiBvb286IFhYWDogb29vXG4gICAgICAgICAgb29vOiBYWFg6IHx8fDogWFhYOiBvb29cbiAgICAgICAgICB4eHg6IHx8fDogb29vOiBvb29cbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICBudW1DdXJzb3JzOiA0XG4gICAgICAgICAgbW9kZTogJ25vcm1hbCdcblxuICAgIGRlc2NyaWJlIFwiW3ZCXSBzZWxlY3Qtb2NjdXJyZW5jZVwiLCAtPlxuICAgICAgaXQgXCJzZWxlY3QgY3Vyc29yLXdvcmQgd2hpY2ggaW50ZXJzZWN0aW5nIHNlbGVjdGlvbiB0aGVuIGFwcGx5IHVwcGVyLWNhc2VcIiwgLT5cbiAgICAgICAgZW5zdXJlIFwiVyBjdHJsLXYgMiBqICQgaCBjbWQtZCBVXCIsXG4gICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgb29vOiB4eHg6IE9PT1xuICAgICAgICAgIHx8fDogT09POiB4eHg6IE9PT1xuICAgICAgICAgIG9vbzogeHh4OiB8fHw6IHh4eDogT09PXG4gICAgICAgICAgeHh4OiB8fHw6IG9vbzogb29vXG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgbnVtQ3Vyc29yczogNFxuXG4gICAgICBpdCBcInBpY2sgY3Vyc29yLXdvcmQgZnJvbSB2QiByYW5nZVwiLCAtPlxuICAgICAgICBlbnN1cmUgXCJjdHJsLXYgNyBsIDIgaiBvIGNtZC1kIFVcIixcbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICBPT086IHh4eDogb29vXG4gICAgICAgICAgfHx8OiBPT086IHh4eDogb29vXG4gICAgICAgICAgT09POiB4eHg6IHx8fDogeHh4OiBvb29cbiAgICAgICAgICB4eHg6IHx8fDogb29vOiBvb29cbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICBudW1DdXJzb3JzOiAzXG5cbiAgZGVzY3JpYmUgXCJpbmNyZW1lbnRhbCBzZWFyY2ggaW50ZWdyYXRpb246IGNoYW5nZS1vY2N1cnJlbmNlLWZyb20tc2VhcmNoLCBzZWxlY3Qtb2NjdXJyZW5jZS1mcm9tLXNlYXJjaFwiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNldHRpbmdzLnNldCgnaW5jcmVtZW50YWxTZWFyY2gnLCB0cnVlKVxuICAgICAgc2V0XG4gICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICBvb286IHh4eDogb29vOiAwMDAwXG4gICAgICAgIDE6IG9vbzogMjI6IG9vbzpcbiAgICAgICAgb29vOiB4eHg6IHx8fDogeHh4OiAzMzMzOlxuICAgICAgICA0NDQ6IHx8fDogb29vOiBvb286XG4gICAgICAgIFwiXCJcIlxuICAgICAgICBjdXJzb3I6IFswLCAwXVxuXG4gICAgZGVzY3JpYmUgXCJmcm9tIG5vcm1hbCBtb2RlXCIsIC0+XG4gICAgICBpdCBcInNlbGVjdCBvY2N1cnJlbmNlIGJ5IHBhdHRlcm4gbWF0Y2hcIiwgLT5cbiAgICAgICAga2V5c3Ryb2tlICcvJ1xuICAgICAgICBpbnB1dFNlYXJjaFRleHQoJ1xcXFxkezMsNH0nKVxuICAgICAgICBkaXNwYXRjaFNlYXJjaENvbW1hbmQoJ3ZpbS1tb2RlLXBsdXM6c2VsZWN0LW9jY3VycmVuY2UtZnJvbS1zZWFyY2gnKVxuICAgICAgICBlbnN1cmUgJ2kgZScsXG4gICAgICAgICAgc2VsZWN0ZWRUZXh0OiBbJzMzMzMnLCAnNDQ0JywgJzAwMDAnXSAjIFdoeSAnMDAwMCcgY29tZXMgbGFzdCBpcyAnMDAwMCcgYmVjb21lIGxhc3Qgc2VsZWN0aW9uLlxuICAgICAgICAgIG1vZGU6IFsndmlzdWFsJywgJ2NoYXJhY3Rlcndpc2UnXVxuXG4gICAgICBpdCBcImNoYW5nZSBvY2N1cnJlbmNlIGJ5IHBhdHRlcm4gbWF0Y2hcIiwgLT5cbiAgICAgICAga2V5c3Ryb2tlICcvJ1xuICAgICAgICBpbnB1dFNlYXJjaFRleHQoJ15cXFxcdys6JylcbiAgICAgICAgZGlzcGF0Y2hTZWFyY2hDb21tYW5kKCd2aW0tbW9kZS1wbHVzOmNoYW5nZS1vY2N1cnJlbmNlLWZyb20tc2VhcmNoJylcbiAgICAgICAgZW5zdXJlICdpIGUnLCBtb2RlOiAnaW5zZXJ0J1xuICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dCgnaGVsbG8nKVxuICAgICAgICBlbnN1cmVcbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICBoZWxsbyB4eHg6IG9vbzogMDAwMFxuICAgICAgICAgIGhlbGxvIG9vbzogMjI6IG9vbzpcbiAgICAgICAgICBoZWxsbyB4eHg6IHx8fDogeHh4OiAzMzMzOlxuICAgICAgICAgIGhlbGxvIHx8fDogb29vOiBvb286XG4gICAgICAgICAgXCJcIlwiXG5cbiAgICBkZXNjcmliZSBcImZyb20gdmlzdWFsIG1vZGVcIiwgLT5cbiAgICAgIGRlc2NyaWJlIFwidmlzdWFsIGNoYXJhY3Rlcndpc2VcIiwgLT5cbiAgICAgICAgaXQgXCJjaGFuZ2Ugb2NjdXJyZW5jZSBpbiBuYXJyb3dlZCBzZWxlY3Rpb25cIiwgLT5cbiAgICAgICAgICBrZXlzdHJva2UgJ3YgaiAvJ1xuICAgICAgICAgIGlucHV0U2VhcmNoVGV4dCgnbysnKVxuICAgICAgICAgIGRpc3BhdGNoU2VhcmNoQ29tbWFuZCgndmltLW1vZGUtcGx1czpzZWxlY3Qtb2NjdXJyZW5jZS1mcm9tLXNlYXJjaCcpXG4gICAgICAgICAgZW5zdXJlICdVJyxcbiAgICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgT09POiB4eHg6IE9PTzogMDAwMFxuICAgICAgICAgICAgMTogb29vOiAyMjogb29vOlxuICAgICAgICAgICAgb29vOiB4eHg6IHx8fDogeHh4OiAzMzMzOlxuICAgICAgICAgICAgNDQ0OiB8fHw6IG9vbzogb29vOlxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgIGRlc2NyaWJlIFwidmlzdWFsIGxpbmV3aXNlXCIsIC0+XG4gICAgICAgIGl0IFwiY2hhbmdlIG9jY3VycmVuY2UgaW4gbmFycm93ZWQgc2VsZWN0aW9uXCIsIC0+XG4gICAgICAgICAga2V5c3Ryb2tlICdWIGogLydcbiAgICAgICAgICBpbnB1dFNlYXJjaFRleHQoJ28rJylcbiAgICAgICAgICBkaXNwYXRjaFNlYXJjaENvbW1hbmQoJ3ZpbS1tb2RlLXBsdXM6c2VsZWN0LW9jY3VycmVuY2UtZnJvbS1zZWFyY2gnKVxuICAgICAgICAgIGVuc3VyZSAnVScsXG4gICAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIE9PTzogeHh4OiBPT086IDAwMDBcbiAgICAgICAgICAgIDE6IE9PTzogMjI6IE9PTzpcbiAgICAgICAgICAgIG9vbzogeHh4OiB8fHw6IHh4eDogMzMzMzpcbiAgICAgICAgICAgIDQ0NDogfHx8OiBvb286IG9vbzpcbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICBkZXNjcmliZSBcInZpc3VhbCBibG9ja3dpc2VcIiwgLT5cbiAgICAgICAgaXQgXCJjaGFuZ2Ugb2NjdXJyZW5jZSBpbiBuYXJyb3dlZCBzZWxlY3Rpb25cIiwgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMCwgNV1cbiAgICAgICAgICBrZXlzdHJva2UgJ2N0cmwtdiAyIGogMSAwIGwgLydcbiAgICAgICAgICBpbnB1dFNlYXJjaFRleHQoJ28rJylcbiAgICAgICAgICBkaXNwYXRjaFNlYXJjaENvbW1hbmQoJ3ZpbS1tb2RlLXBsdXM6c2VsZWN0LW9jY3VycmVuY2UtZnJvbS1zZWFyY2gnKVxuICAgICAgICAgIGVuc3VyZSAnVScsXG4gICAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIG9vbzogeHh4OiBPT086IDAwMDBcbiAgICAgICAgICAgIDE6IE9PTzogMjI6IE9PTzpcbiAgICAgICAgICAgIG9vbzogeHh4OiB8fHw6IHh4eDogMzMzMzpcbiAgICAgICAgICAgIDQ0NDogfHx8OiBvb286IG9vbzpcbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgZGVzY3JpYmUgXCJwZXJzaXN0ZW50LXNlbGVjdGlvbiBpcyBleGlzdHNcIiwgLT5cbiAgICAgIHBlcnNpc3RlbnRTZWxlY3Rpb25CdWZmZXJSYW5nZSA9IG51bGxcbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgYXRvbS5rZXltYXBzLmFkZCBcImNyZWF0ZS1wZXJzaXN0ZW50LXNlbGVjdGlvblwiLFxuICAgICAgICAgICdhdG9tLXRleHQtZWRpdG9yLnZpbS1tb2RlLXBsdXM6bm90KC5pbnNlcnQtbW9kZSknOlxuICAgICAgICAgICAgJ20nOiAndmltLW1vZGUtcGx1czpjcmVhdGUtcGVyc2lzdGVudC1zZWxlY3Rpb24nXG5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgb29vOiB4eHg6IG9vbzpcbiAgICAgICAgICB8fHw6IG9vbzogeHh4OiBvb286XG4gICAgICAgICAgb29vOiB4eHg6IHx8fDogeHh4OiBvb286XG4gICAgICAgICAgeHh4OiB8fHw6IG9vbzogb29vOlxcblxuICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIGN1cnNvcjogWzAsIDBdXG5cbiAgICAgICAgcGVyc2lzdGVudFNlbGVjdGlvbkJ1ZmZlclJhbmdlID0gW1xuICAgICAgICAgIFtbMCwgMF0sIFsyLCAwXV1cbiAgICAgICAgICBbWzMsIDBdLCBbNCwgMF1dXG4gICAgICAgIF1cbiAgICAgICAgZW5zdXJlICdWIGogbSBHIG0gbScsXG4gICAgICAgICAgcGVyc2lzdGVudFNlbGVjdGlvbkJ1ZmZlclJhbmdlOiBwZXJzaXN0ZW50U2VsZWN0aW9uQnVmZmVyUmFuZ2VcblxuICAgICAgZGVzY3JpYmUgXCJ3aGVuIG5vIHNlbGVjdGlvbiBpcyBleGlzdHNcIiwgLT5cbiAgICAgICAgaXQgXCJzZWxlY3Qgb2NjdXJyZW5jZSBpbiBhbGwgcGVyc2lzdGVudC1zZWxlY3Rpb25cIiwgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgICBrZXlzdHJva2UgJy8nXG4gICAgICAgICAgaW5wdXRTZWFyY2hUZXh0KCd4eHgnKVxuICAgICAgICAgIGRpc3BhdGNoU2VhcmNoQ29tbWFuZCgndmltLW1vZGUtcGx1czpzZWxlY3Qtb2NjdXJyZW5jZS1mcm9tLXNlYXJjaCcpXG4gICAgICAgICAgZW5zdXJlICdVJyxcbiAgICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgb29vOiBYWFg6IG9vbzpcbiAgICAgICAgICAgIHx8fDogb29vOiBYWFg6IG9vbzpcbiAgICAgICAgICAgIG9vbzogeHh4OiB8fHw6IHh4eDogb29vOlxuICAgICAgICAgICAgWFhYOiB8fHw6IG9vbzogb29vOlxcblxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICBwZXJzaXN0ZW50U2VsZWN0aW9uQ291bnQ6IDBcblxuICAgICAgZGVzY3JpYmUgXCJ3aGVuIGJvdGggZXhpdHMsIG9wZXJhdG9yIGFwcGxpZWQgdG8gYm90aFwiLCAtPlxuICAgICAgICBpdCBcInNlbGVjdCBhbGwgb2NjdXJyZW5jZSBpbiBzZWxlY3Rpb25cIiwgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgICBrZXlzdHJva2UgJ1YgMiBqIC8nXG4gICAgICAgICAgaW5wdXRTZWFyY2hUZXh0KCd4eHgnKVxuICAgICAgICAgIGRpc3BhdGNoU2VhcmNoQ29tbWFuZCgndmltLW1vZGUtcGx1czpzZWxlY3Qtb2NjdXJyZW5jZS1mcm9tLXNlYXJjaCcpXG4gICAgICAgICAgZW5zdXJlICdVJyxcbiAgICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgb29vOiBYWFg6IG9vbzpcbiAgICAgICAgICAgIHx8fDogb29vOiBYWFg6IG9vbzpcbiAgICAgICAgICAgIG9vbzogWFhYOiB8fHw6IFhYWDogb29vOlxuICAgICAgICAgICAgWFhYOiB8fHw6IG9vbzogb29vOlxcblxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICBwZXJzaXN0ZW50U2VsZWN0aW9uQ291bnQ6IDBcblxuICAgIGRlc2NyaWJlIFwiZGVtb25zdHJhdGUgcGVyc2lzdGVudC1zZWxlY3Rpb24ncyBwcmFjdGljYWwgc2NlbmFyaW9cIiwgLT5cbiAgICAgIFtvbGRHcmFtbWFyXSA9IFtdXG4gICAgICBhZnRlckVhY2ggLT5cbiAgICAgICAgZWRpdG9yLnNldEdyYW1tYXIob2xkR3JhbW1hcilcblxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBhdG9tLmtleW1hcHMuYWRkIFwiY3JlYXRlLXBlcnNpc3RlbnQtc2VsZWN0aW9uXCIsXG4gICAgICAgICAgJ2F0b20tdGV4dC1lZGl0b3IudmltLW1vZGUtcGx1czpub3QoLmluc2VydC1tb2RlKSc6XG4gICAgICAgICAgICAnbSc6ICd2aW0tbW9kZS1wbHVzOnRvZ2dsZS1wZXJzaXN0ZW50LXNlbGVjdGlvbidcblxuICAgICAgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAgICAgICBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZSgnbGFuZ3VhZ2UtY29mZmVlLXNjcmlwdCcpXG5cbiAgICAgICAgcnVucyAtPlxuICAgICAgICAgIG9sZEdyYW1tYXIgPSBlZGl0b3IuZ2V0R3JhbW1hcigpXG4gICAgICAgICAgZWRpdG9yLnNldEdyYW1tYXIoYXRvbS5ncmFtbWFycy5ncmFtbWFyRm9yU2NvcGVOYW1lKCdzb3VyY2UuY29mZmVlJykpXG5cbiAgICAgICAgc2V0IHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgY29uc3RydWN0b3I6IChAbWFpbiwgQGVkaXRvciwgQHN0YXR1c0Jhck1hbmFnZXIpIC0+XG4gICAgICAgICAgICAgIEBlZGl0b3JFbGVtZW50ID0gQGVkaXRvci5lbGVtZW50XG4gICAgICAgICAgICAgIEBlbWl0dGVyID0gbmV3IEVtaXR0ZXJcbiAgICAgICAgICAgICAgQHN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuICAgICAgICAgICAgICBAbW9kZU1hbmFnZXIgPSBuZXcgTW9kZU1hbmFnZXIodGhpcylcbiAgICAgICAgICAgICAgQG1hcmsgPSBuZXcgTWFya01hbmFnZXIodGhpcylcbiAgICAgICAgICAgICAgQHJlZ2lzdGVyID0gbmV3IFJlZ2lzdGVyTWFuYWdlcih0aGlzKVxuICAgICAgICAgICAgICBAcGVyc2lzdGVudFNlbGVjdGlvbnMgPSBbXVxuXG4gICAgICAgICAgICAgIEBoaWdobGlnaHRTZWFyY2hTdWJzY3JpcHRpb24gPSBAZWRpdG9yRWxlbWVudC5vbkRpZENoYW5nZVNjcm9sbFRvcCA9PlxuICAgICAgICAgICAgICAgIEByZWZyZXNoSGlnaGxpZ2h0U2VhcmNoKClcblxuICAgICAgICAgICAgICBAb3BlcmF0aW9uU3RhY2sgPSBuZXcgT3BlcmF0aW9uU3RhY2sodGhpcylcbiAgICAgICAgICAgICAgQGN1cnNvclN0eWxlTWFuYWdlciA9IG5ldyBDdXJzb3JTdHlsZU1hbmFnZXIodGhpcylcblxuICAgICAgICAgICAgYW5vdGhlckZ1bmM6IC0+XG4gICAgICAgICAgICAgIEBoZWxsbyA9IFtdXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgaXQgJ2NoYW5nZSBhbGwgYXNzaWdubWVudChcIj1cIikgb2YgY3VycmVudC1mdW5jdGlvbiB0byBcIj89XCInLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgZW5zdXJlIFsnaiBmJywgaW5wdXQ6ICc9J10sIGN1cnNvcjogWzEsIDE3XVxuXG4gICAgICAgIHJ1bnMgLT5cbiAgICAgICAgICBrZXlzdHJva2UgW1xuICAgICAgICAgICAgJ2cgY21kLWQnICMgc2VsZWN0LW9jY3VycmVuY2VcbiAgICAgICAgICAgICdpIGYnICAgICAjIGlubmVyLWZ1bmN0aW9uLXRleHQtb2JqZWN0XG4gICAgICAgICAgICAnbScgICAgICAgIyB0b2dnbGUtcGVyc2lzdGVudC1zZWxlY3Rpb25cbiAgICAgICAgICBdLmpvaW4oXCIgXCIpXG5cbiAgICAgICAgICB0ZXh0c0luQnVmZmVyUmFuZ2UgPSB2aW1TdGF0ZS5wZXJzaXN0ZW50U2VsZWN0aW9uLmdldE1hcmtlckJ1ZmZlclJhbmdlcygpLm1hcCAocmFuZ2UpIC0+XG4gICAgICAgICAgICBlZGl0b3IuZ2V0VGV4dEluQnVmZmVyUmFuZ2UocmFuZ2UpXG4gICAgICAgICAgdGV4dHNJbkJ1ZmZlclJhbmdlSXNBbGxFcXVhbENoYXIgPSB0ZXh0c0luQnVmZmVyUmFuZ2UuZXZlcnkoKHRleHQpIC0+IHRleHQgaXMgJz0nKVxuICAgICAgICAgIGV4cGVjdCh0ZXh0c0luQnVmZmVyUmFuZ2VJc0FsbEVxdWFsQ2hhcikudG9CZSh0cnVlKVxuICAgICAgICAgIGV4cGVjdCh2aW1TdGF0ZS5wZXJzaXN0ZW50U2VsZWN0aW9uLmdldE1hcmtlcnMoKSkudG9IYXZlTGVuZ3RoKDExKVxuXG4gICAgICAgICAga2V5c3Ryb2tlICcyIGwnICMgdG8gbW92ZSB0byBvdXQtc2lkZSBvZiByYW5nZS1tcmtlclxuICAgICAgICAgIGVuc3VyZSBbJy8nLCBzZWFyY2g6ICc9PiddLCBjdXJzb3I6IFs5LCA2OV1cbiAgICAgICAgICBrZXlzdHJva2UgXCJtXCIgIyBjbGVhciBwZXJzaXN0ZW50U2VsZWN0aW9uIGF0IGN1cnNvciB3aGljaCBpcyA9IHNpZ24gcGFydCBvZiBmYXQgYXJyb3cuXG4gICAgICAgICAgZXhwZWN0KHZpbVN0YXRlLnBlcnNpc3RlbnRTZWxlY3Rpb24uZ2V0TWFya2VycygpKS50b0hhdmVMZW5ndGgoMTApXG5cbiAgICAgICAgd2FpdHNGb3IgLT5cbiAgICAgICAgICBjbGFzc0xpc3QuY29udGFpbnMoJ2hhcy1wZXJzaXN0ZW50LXNlbGVjdGlvbicpXG5cbiAgICAgICAgcnVucyAtPlxuICAgICAgICAgIGtleXN0cm9rZSBbXG4gICAgICAgICAgICAnY3RybC1jbWQtZycgIyBzZWxlY3QtcGVyc2lzdGVudC1zZWxlY3Rpb25cbiAgICAgICAgICAgICdJJyAgICAgICAgICAjIEluc2VydCBhdCBzdGFydCBvZiBzZWxlY3Rpb25cbiAgICAgICAgICBdXG4gICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoJz8nKVxuICAgICAgICAgIGVuc3VyZSAnZXNjYXBlJyxcbiAgICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgY29uc3RydWN0b3I6IChAbWFpbiwgQGVkaXRvciwgQHN0YXR1c0Jhck1hbmFnZXIpIC0+XG4gICAgICAgICAgICAgIEBlZGl0b3JFbGVtZW50ID89IEBlZGl0b3IuZWxlbWVudFxuICAgICAgICAgICAgICBAZW1pdHRlciA/PSBuZXcgRW1pdHRlclxuICAgICAgICAgICAgICBAc3Vic2NyaXB0aW9ucyA/PSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuICAgICAgICAgICAgICBAbW9kZU1hbmFnZXIgPz0gbmV3IE1vZGVNYW5hZ2VyKHRoaXMpXG4gICAgICAgICAgICAgIEBtYXJrID89IG5ldyBNYXJrTWFuYWdlcih0aGlzKVxuICAgICAgICAgICAgICBAcmVnaXN0ZXIgPz0gbmV3IFJlZ2lzdGVyTWFuYWdlcih0aGlzKVxuICAgICAgICAgICAgICBAcGVyc2lzdGVudFNlbGVjdGlvbnMgPz0gW11cblxuICAgICAgICAgICAgICBAaGlnaGxpZ2h0U2VhcmNoU3Vic2NyaXB0aW9uID89IEBlZGl0b3JFbGVtZW50Lm9uRGlkQ2hhbmdlU2Nyb2xsVG9wID0+XG4gICAgICAgICAgICAgICAgQHJlZnJlc2hIaWdobGlnaHRTZWFyY2goKVxuXG4gICAgICAgICAgICAgIEBvcGVyYXRpb25TdGFjayA/PSBuZXcgT3BlcmF0aW9uU3RhY2sodGhpcylcbiAgICAgICAgICAgICAgQGN1cnNvclN0eWxlTWFuYWdlciA/PSBuZXcgQ3Vyc29yU3R5bGVNYW5hZ2VyKHRoaXMpXG5cbiAgICAgICAgICAgIGFub3RoZXJGdW5jOiAtPlxuICAgICAgICAgICAgICBAaGVsbG8gPSBbXVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgZGVzY3JpYmUgXCJwcmVzZXQgb2NjdXJyZW5jZSBtYXJrZXJcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXRcbiAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgIFRoaXMgdGV4dCBoYXZlIDMgaW5zdGFuY2Ugb2YgJ3RleHQnIGluIHRoZSB3aG9sZSB0ZXh0XG4gICAgICAgIFwiXCJcIlxuICAgICAgICBjdXJzb3I6IFswLCAwXVxuXG4gICAgZGVzY3JpYmUgXCJ0b2dnbGUtcHJlc2V0LW9jY3VycmVuY2UgY29tbWFuZHNcIiwgLT5cbiAgICAgIGRlc2NyaWJlIFwiaW4gbm9ybWFsLW1vZGVcIiwgLT5cbiAgICAgICAgZGVzY3JpYmUgXCJhZGQgcHJlc2V0IG9jY3VycmVuY2VcIiwgLT5cbiAgICAgICAgICBpdCAnc2V0IGN1cnNvci13YXJkIGFzIHByZXNldCBvY2N1cnJlbmNlIG1hcmtlciBhbmQgbm90IG1vdmUgY3Vyc29yJywgLT5cbiAgICAgICAgICAgIGVuc3VyZSAnZyBvJywgb2NjdXJyZW5jZVRleHQ6ICdUaGlzJywgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgICAgIGVuc3VyZSAndycsIGN1cnNvcjogWzAsIDVdXG4gICAgICAgICAgICBlbnN1cmUgJ2cgbycsIG9jY3VycmVuY2VUZXh0OiBbJ1RoaXMnLCAndGV4dCcsICd0ZXh0JywgJ3RleHQnXSwgY3Vyc29yOiBbMCwgNV1cblxuICAgICAgICBkZXNjcmliZSBcInJlbW92ZSBwcmVzZXQgb2NjdXJyZW5jZVwiLCAtPlxuICAgICAgICAgIGl0ICdyZW1vdmVzIG9jY3VycmVuY2Ugb25lIGJ5IG9uZSBzZXBhcmF0ZWx5JywgLT5cbiAgICAgICAgICAgIGVuc3VyZSAnZyBvJywgb2NjdXJyZW5jZVRleHQ6ICdUaGlzJywgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgICAgIGVuc3VyZSAndycsIGN1cnNvcjogWzAsIDVdXG4gICAgICAgICAgICBlbnN1cmUgJ2cgbycsIG9jY3VycmVuY2VUZXh0OiBbJ1RoaXMnLCAndGV4dCcsICd0ZXh0JywgJ3RleHQnXSwgY3Vyc29yOiBbMCwgNV1cbiAgICAgICAgICAgIGVuc3VyZSAnZyBvJywgb2NjdXJyZW5jZVRleHQ6IFsnVGhpcycsICd0ZXh0JywgJ3RleHQnXSwgY3Vyc29yOiBbMCwgNV1cbiAgICAgICAgICAgIGVuc3VyZSAnYiBnIG8nLCBvY2N1cnJlbmNlVGV4dDogWyd0ZXh0JywgJ3RleHQnXSwgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgICBpdCAncmVtb3ZlcyBhbGwgb2NjdXJyZW5jZSBpbiB0aGlzIGVkaXRvciBieSBlc2NhcGUnLCAtPlxuICAgICAgICAgICAgZW5zdXJlICdnIG8nLCBvY2N1cnJlbmNlVGV4dDogJ1RoaXMnLCBjdXJzb3I6IFswLCAwXVxuICAgICAgICAgICAgZW5zdXJlICd3JywgY3Vyc29yOiBbMCwgNV1cbiAgICAgICAgICAgIGVuc3VyZSAnZyBvJywgb2NjdXJyZW5jZVRleHQ6IFsnVGhpcycsICd0ZXh0JywgJ3RleHQnLCAndGV4dCddLCBjdXJzb3I6IFswLCA1XVxuICAgICAgICAgICAgZW5zdXJlICdlc2NhcGUnLCBvY2N1cnJlbmNlQ291bnQ6IDBcblxuICAgICAgICAgIGl0ICdjYW4gcmVjYWxsIHByZXZpb3VzbHkgc2V0IG9jY3VyZW5jZSBwYXR0ZXJuIGJ5IGBnIC5gJywgLT5cbiAgICAgICAgICAgIGVuc3VyZSAndyB2IGwgZyBvJywgb2NjdXJyZW5jZVRleHQ6IFsndGUnLCAndGUnLCAndGUnXSwgY3Vyc29yOiBbMCwgNl1cbiAgICAgICAgICAgIGVuc3VyZSAnZXNjYXBlJywgb2NjdXJyZW5jZUNvdW50OiAwXG4gICAgICAgICAgICBleHBlY3QodmltU3RhdGUuZ2xvYmFsU3RhdGUuZ2V0KCdsYXN0T2NjdXJyZW5jZVBhdHRlcm4nKSkudG9FcXVhbCgvdGUvZylcblxuICAgICAgICAgICAgZW5zdXJlICd3JywgY3Vyc29yOiBbMCwgMTBdICMgdG8gbW92ZSBjdXJzb3IgdG8gdGV4dCBgaGF2ZWBcbiAgICAgICAgICAgIGVuc3VyZSAnZyAuJywgb2NjdXJyZW5jZVRleHQ6IFsndGUnLCAndGUnLCAndGUnXSwgY3Vyc29yOiBbMCwgMTBdXG5cbiAgICAgICAgICAgICMgQnV0IG9wZXJhdG9yIG1vZGlmaWVyIG5vdCB1cGRhdGUgbGFzdE9jY3VycmVuY2VQYXR0ZXJuXG4gICAgICAgICAgICBlbnN1cmUgJ2cgVSBvICQnLCB0ZXh0QzogXCJUaGlzIHRleHQgfEhBVkUgMyBpbnN0YW5jZSBvZiAndGV4dCcgaW4gdGhlIHdob2xlIHRleHRcIlxuICAgICAgICAgICAgZXhwZWN0KHZpbVN0YXRlLmdsb2JhbFN0YXRlLmdldCgnbGFzdE9jY3VycmVuY2VQYXR0ZXJuJykpLnRvRXF1YWwoL3RlL2cpXG5cbiAgICAgICAgZGVzY3JpYmUgXCJyZXN0b3JlIGxhc3Qgb2NjdXJyZW5jZSBtYXJrZXIgYnkgYWRkLXByZXNldC1vY2N1cnJlbmNlLWZyb20tbGFzdC1vY2N1cnJlbmNlLXBhdHRlcm5cIiwgLT5cbiAgICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgICBzZXRcbiAgICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgICBjYW1lbFxuICAgICAgICAgICAgICBjYW1lbENhc2VcbiAgICAgICAgICAgICAgY2FtZWxzXG4gICAgICAgICAgICAgIGNhbWVsXG4gICAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIGl0IFwiY2FuIHJlc3RvcmUgb2NjdXJyZW5jZS1tYXJrZXIgYWRkZWQgYnkgYGcgb2AgaW4gbm9ybWFsLW1vZGVcIiwgLT5cbiAgICAgICAgICAgIHNldCBjdXJzb3I6IFswLCAwXVxuICAgICAgICAgICAgZW5zdXJlIFwiZyBvXCIsIG9jY3VycmVuY2VUZXh0OiBbJ2NhbWVsJywgJ2NhbWVsJ11cbiAgICAgICAgICAgIGVuc3VyZSAnZXNjYXBlJywgb2NjdXJyZW5jZUNvdW50OiAwXG4gICAgICAgICAgICBlbnN1cmUgXCJnIC5cIiwgb2NjdXJyZW5jZVRleHQ6IFsnY2FtZWwnLCAnY2FtZWwnXVxuXG4gICAgICAgICAgaXQgXCJjYW4gcmVzdG9yZSBvY2N1cnJlbmNlLW1hcmtlciBhZGRlZCBieSBgZyBvYCBpbiB2aXN1YWwtbW9kZVwiLCAtPlxuICAgICAgICAgICAgc2V0IGN1cnNvcjogWzAsIDBdXG4gICAgICAgICAgICBlbnN1cmUgXCJ2IGkgd1wiLCBzZWxlY3RlZFRleHQ6IFwiY2FtZWxcIlxuICAgICAgICAgICAgZW5zdXJlIFwiZyBvXCIsIG9jY3VycmVuY2VUZXh0OiBbJ2NhbWVsJywgJ2NhbWVsJywgJ2NhbWVsJywgJ2NhbWVsJ11cbiAgICAgICAgICAgIGVuc3VyZSAnZXNjYXBlJywgb2NjdXJyZW5jZUNvdW50OiAwXG4gICAgICAgICAgICBlbnN1cmUgXCJnIC5cIiwgb2NjdXJyZW5jZVRleHQ6IFsnY2FtZWwnLCAnY2FtZWwnLCAnY2FtZWwnLCAnY2FtZWwnXVxuXG4gICAgICAgICAgaXQgXCJjYW4gcmVzdG9yZSBvY2N1cnJlbmNlLW1hcmtlciBhZGRlZCBieSBgZyBPYCBpbiBub3JtYWwtbW9kZVwiLCAtPlxuICAgICAgICAgICAgc2V0IGN1cnNvcjogWzAsIDBdXG4gICAgICAgICAgICBlbnN1cmUgXCJnIE9cIiwgb2NjdXJyZW5jZVRleHQ6IFsnY2FtZWwnLCAnY2FtZWwnLCAnY2FtZWwnXVxuICAgICAgICAgICAgZW5zdXJlICdlc2NhcGUnLCBvY2N1cnJlbmNlQ291bnQ6IDBcbiAgICAgICAgICAgIGVuc3VyZSBcImcgLlwiLCBvY2N1cnJlbmNlVGV4dDogWydjYW1lbCcsICdjYW1lbCcsICdjYW1lbCddXG5cbiAgICAgICAgZGVzY3JpYmUgXCJjc3MgY2xhc3MgaGFzLW9jY3VycmVuY2VcIiwgLT5cbiAgICAgICAgICBkZXNjcmliZSBcIm1hbnVhbGx5IHRvZ2dsZSBieSB0b2dnbGUtcHJlc2V0LW9jY3VycmVuY2UgY29tbWFuZFwiLCAtPlxuICAgICAgICAgICAgaXQgJ2lzIGF1dG8tc2V0L3Vuc2V0IHdoZXRlciBhdCBsZWFzdCBvbmUgcHJlc2V0LW9jY3VycmVuY2Ugd2FzIGV4aXN0cyBvciBub3QnLCAtPlxuICAgICAgICAgICAgICBleHBlY3QoY2xhc3NMaXN0LmNvbnRhaW5zKCdoYXMtb2NjdXJyZW5jZScpKS50b0JlKGZhbHNlKVxuICAgICAgICAgICAgICBlbnN1cmUgJ2cgbycsIG9jY3VycmVuY2VUZXh0OiAnVGhpcycsIGN1cnNvcjogWzAsIDBdXG4gICAgICAgICAgICAgIGV4cGVjdChjbGFzc0xpc3QuY29udGFpbnMoJ2hhcy1vY2N1cnJlbmNlJykpLnRvQmUodHJ1ZSlcbiAgICAgICAgICAgICAgZW5zdXJlICdnIG8nLCBvY2N1cnJlbmNlQ291bnQ6IDAsIGN1cnNvcjogWzAsIDBdXG4gICAgICAgICAgICAgIGV4cGVjdChjbGFzc0xpc3QuY29udGFpbnMoJ2hhcy1vY2N1cnJlbmNlJykpLnRvQmUoZmFsc2UpXG5cbiAgICAgICAgICBkZXNjcmliZSBcImNoYW5nZSAnSU5TSURFJyBvZiBtYXJrZXJcIiwgLT5cbiAgICAgICAgICAgIG1hcmtlckxheWVyVXBkYXRlZCA9IG51bGxcbiAgICAgICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICAgICAgbWFya2VyTGF5ZXJVcGRhdGVkID0gZmFsc2VcblxuICAgICAgICAgICAgaXQgJ2Rlc3Ryb3kgbWFya2VyIGFuZCByZWZsZWN0IHRvIFwiaGFzLW9jY3VycmVuY2VcIiBDU1MnLCAtPlxuICAgICAgICAgICAgICBydW5zIC0+XG4gICAgICAgICAgICAgICAgZXhwZWN0KGNsYXNzTGlzdC5jb250YWlucygnaGFzLW9jY3VycmVuY2UnKSkudG9CZShmYWxzZSlcbiAgICAgICAgICAgICAgICBlbnN1cmUgJ2cgbycsIG9jY3VycmVuY2VUZXh0OiAnVGhpcycsIGN1cnNvcjogWzAsIDBdXG4gICAgICAgICAgICAgICAgZXhwZWN0KGNsYXNzTGlzdC5jb250YWlucygnaGFzLW9jY3VycmVuY2UnKSkudG9CZSh0cnVlKVxuXG4gICAgICAgICAgICAgICAgZW5zdXJlICdsIGknLCBtb2RlOiAnaW5zZXJ0J1xuICAgICAgICAgICAgICAgIHZpbVN0YXRlLm9jY3VycmVuY2VNYW5hZ2VyLm1hcmtlckxheWVyLm9uRGlkVXBkYXRlIC0+XG4gICAgICAgICAgICAgICAgICBtYXJrZXJMYXllclVwZGF0ZWQgPSB0cnVlXG5cbiAgICAgICAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dCgnLS0nKVxuICAgICAgICAgICAgICAgIGVuc3VyZSBcImVzY2FwZVwiLFxuICAgICAgICAgICAgICAgICAgdGV4dEM6IFwiVC18LWhpcyB0ZXh0IGhhdmUgMyBpbnN0YW5jZSBvZiAndGV4dCcgaW4gdGhlIHdob2xlIHRleHRcIlxuICAgICAgICAgICAgICAgICAgbW9kZTogJ25vcm1hbCdcblxuICAgICAgICAgICAgICB3YWl0c0ZvciAtPlxuICAgICAgICAgICAgICAgIG1hcmtlckxheWVyVXBkYXRlZFxuXG4gICAgICAgICAgICAgIHJ1bnMgLT5cbiAgICAgICAgICAgICAgICBlbnN1cmUgb2NjdXJyZW5jZUNvdW50OiAwXG4gICAgICAgICAgICAgICAgZXhwZWN0KGNsYXNzTGlzdC5jb250YWlucygnaGFzLW9jY3VycmVuY2UnKSkudG9CZShmYWxzZSlcblxuICAgICAgZGVzY3JpYmUgXCJpbiB2aXN1YWwtbW9kZVwiLCAtPlxuICAgICAgICBkZXNjcmliZSBcImFkZCBwcmVzZXQgb2NjdXJyZW5jZVwiLCAtPlxuICAgICAgICAgIGl0ICdzZXQgc2VsZWN0ZWQtdGV4dCBhcyBwcmVzZXQgb2NjdXJyZW5jZSBtYXJrZXIgYW5kIG5vdCBtb3ZlIGN1cnNvcicsIC0+XG4gICAgICAgICAgICBlbnN1cmUgJ3cgdiBsJywgbW9kZTogWyd2aXN1YWwnLCAnY2hhcmFjdGVyd2lzZSddLCBzZWxlY3RlZFRleHQ6ICd0ZSdcbiAgICAgICAgICAgIGVuc3VyZSAnZyBvJywgbW9kZTogJ25vcm1hbCcsIG9jY3VycmVuY2VUZXh0OiBbJ3RlJywgJ3RlJywgJ3RlJ11cbiAgICAgICAgZGVzY3JpYmUgXCJpcy1uYXJyb3dlZCBzZWxlY3Rpb25cIiwgLT5cbiAgICAgICAgICBbdGV4dE9yaWdpbmFsXSA9IFtdXG4gICAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgICAgdGV4dE9yaWdpbmFsID0gXCJcIlwiXG4gICAgICAgICAgICAgIFRoaXMgdGV4dCBoYXZlIDMgaW5zdGFuY2Ugb2YgJ3RleHQnIGluIHRoZSB3aG9sZSB0ZXh0XG4gICAgICAgICAgICAgIFRoaXMgdGV4dCBoYXZlIDMgaW5zdGFuY2Ugb2YgJ3RleHQnIGluIHRoZSB3aG9sZSB0ZXh0XFxuXG4gICAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgc2V0XG4gICAgICAgICAgICAgIGN1cnNvcjogWzAsIDBdXG4gICAgICAgICAgICAgIHRleHQ6IHRleHRPcmlnaW5hbFxuICAgICAgICAgIGl0IFwicGljayBvY3VycmVuY2Utd29yZCBmcm9tIGN1cnNvciBwb3NpdGlvbiBhbmQgY29udGludWUgdmlzdWFsLW1vZGVcIiwgLT5cbiAgICAgICAgICAgIGVuc3VyZSAndyBWIGonLCBtb2RlOiBbJ3Zpc3VhbCcsICdsaW5ld2lzZSddLCBzZWxlY3RlZFRleHQ6IHRleHRPcmlnaW5hbFxuICAgICAgICAgICAgZW5zdXJlICdnIG8nLFxuICAgICAgICAgICAgICBtb2RlOiBbJ3Zpc3VhbCcsICdsaW5ld2lzZSddXG4gICAgICAgICAgICAgIHNlbGVjdGVkVGV4dDogdGV4dE9yaWdpbmFsXG4gICAgICAgICAgICAgIG9jY3VycmVuY2VUZXh0OiBbJ3RleHQnLCAndGV4dCcsICd0ZXh0JywgJ3RleHQnLCAndGV4dCcsICd0ZXh0J11cbiAgICAgICAgICAgIGVuc3VyZSBbJ3InLCBpbnB1dDogJyEnXSxcbiAgICAgICAgICAgICAgbW9kZTogJ25vcm1hbCdcbiAgICAgICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICAgIFRoaXMgISEhISBoYXZlIDMgaW5zdGFuY2Ugb2YgJyEhISEnIGluIHRoZSB3aG9sZSAhISEhXG4gICAgICAgICAgICAgIFRoaXMgISEhISBoYXZlIDMgaW5zdGFuY2Ugb2YgJyEhISEnIGluIHRoZSB3aG9sZSAhISEhXFxuXG4gICAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICBkZXNjcmliZSBcImluIGluY3JlbWVudGFsLXNlYXJjaFwiLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgc2V0dGluZ3Muc2V0KCdpbmNyZW1lbnRhbFNlYXJjaCcsIHRydWUpXG5cbiAgICAgICAgZGVzY3JpYmUgXCJhZGQtb2NjdXJyZW5jZS1wYXR0ZXJuLWZyb20tc2VhcmNoXCIsIC0+XG4gICAgICAgICAgaXQgJ21hcmsgYXMgb2NjdXJyZW5jZSB3aGljaCBtYXRjaGVzIHJlZ2V4IGVudGVyZWQgaW4gc2VhcmNoLXVpJywgLT5cbiAgICAgICAgICAgIGtleXN0cm9rZSAnLydcbiAgICAgICAgICAgIGlucHV0U2VhcmNoVGV4dCgnXFxcXGJ0XFxcXHcrJylcbiAgICAgICAgICAgIGRpc3BhdGNoU2VhcmNoQ29tbWFuZCgndmltLW1vZGUtcGx1czphZGQtb2NjdXJyZW5jZS1wYXR0ZXJuLWZyb20tc2VhcmNoJylcbiAgICAgICAgICAgIGVuc3VyZVxuICAgICAgICAgICAgICBvY2N1cnJlbmNlVGV4dDogWyd0ZXh0JywgJ3RleHQnLCAndGhlJywgJ3RleHQnXVxuXG4gICAgZGVzY3JpYmUgXCJtdXRhdGUgcHJlc2V0IG9jY3VycmVuY2VcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0IHRleHQ6IFwiXCJcIlxuICAgICAgICBvb286IHh4eDogb29vIHh4eDogb29vOlxuICAgICAgICAhISE6IG9vbzogeHh4OiBvb28geHh4OiBvb286XG4gICAgICAgIFwiXCJcIlxuICAgICAgICBjdXJzb3I6IFswLCAwXVxuXG4gICAgICBkZXNjcmliZSBcIm5vcm1hbC1tb2RlXCIsIC0+XG4gICAgICAgIGl0ICdbZGVsZXRlXSBhcHBseSBvcGVyYXRpb24gdG8gcHJlc2V0LW1hcmtlciBpbnRlcnNlY3Rpbmcgc2VsZWN0ZWQgdGFyZ2V0JywgLT5cbiAgICAgICAgICBlbnN1cmUgJ2wgZyBvIEQnLFxuICAgICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICA6IHh4eDogIHh4eDogOlxuICAgICAgICAgICAgISEhOiBvb286IHh4eDogb29vIHh4eDogb29vOlxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgIGl0ICdbdXBjYXNlXSBhcHBseSBvcGVyYXRpb24gdG8gcHJlc2V0LW1hcmtlciBpbnRlcnNlY3Rpbmcgc2VsZWN0ZWQgdGFyZ2V0JywgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMCwgNl1cbiAgICAgICAgICBlbnN1cmUgJ2wgZyBvIGcgVSBqJyxcbiAgICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgb29vOiBYWFg6IG9vbyBYWFg6IG9vbzpcbiAgICAgICAgICAgICEhITogb29vOiBYWFg6IG9vbyBYWFg6IG9vbzpcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICBpdCAnW3VwY2FzZSBleGNsdWRlXSB3b25cXCd0IG11dGF0ZSByZW1vdmVkIG1hcmtlcicsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzAsIDBdXG4gICAgICAgICAgZW5zdXJlICdnIG8nLCBvY2N1cnJlbmNlQ291bnQ6IDZcbiAgICAgICAgICBlbnN1cmUgJ2cgbycsIG9jY3VycmVuY2VDb3VudDogNVxuICAgICAgICAgIGVuc3VyZSAnZyBVIGonLFxuICAgICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICBvb286IHh4eDogT09PIHh4eDogT09POlxuICAgICAgICAgICAgISEhOiBPT086IHh4eDogT09PIHh4eDogT09POlxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgIGl0ICdbZGVsZXRlXSBhcHBseSBvcGVyYXRpb24gdG8gcHJlc2V0LW1hcmtlciBpbnRlcnNlY3Rpbmcgc2VsZWN0ZWQgdGFyZ2V0JywgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMTBdXG4gICAgICAgICAgZW5zdXJlICdnIG8gZyBVICQnLFxuICAgICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICBvb286IHh4eDogT09PIHh4eDogT09POlxuICAgICAgICAgICAgISEhOiBvb286IHh4eDogb29vIHh4eDogb29vOlxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgIGl0ICdbY2hhbmdlXSBhcHBseSBvcGVyYXRpb24gdG8gcHJlc2V0LW1hcmtlciBpbnRlcnNlY3Rpbmcgc2VsZWN0ZWQgdGFyZ2V0JywgLT5cbiAgICAgICAgICBlbnN1cmUgJ2wgZyBvIEMnLFxuICAgICAgICAgICAgbW9kZTogJ2luc2VydCdcbiAgICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgOiB4eHg6ICB4eHg6IDpcbiAgICAgICAgICAgICEhITogb29vOiB4eHg6IG9vbyB4eHg6IG9vbzpcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KCdZWVknKVxuICAgICAgICAgIGVuc3VyZSAnbCBnIG8gQycsXG4gICAgICAgICAgICBtb2RlOiAnaW5zZXJ0J1xuICAgICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICBZWVk6IHh4eDogWVlZIHh4eDogWVlZOlxuICAgICAgICAgICAgISEhOiBvb286IHh4eDogb29vIHh4eDogb29vOlxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICBudW1DdXJzb3JzOiAzXG4gICAgICAgIGRlc2NyaWJlIFwicHJlZGVmaW5lZCBrZXltYXAgb24gd2hlbiBoYXMtb2NjdXJyZW5jZVwiLCAtPlxuICAgICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICAgIHNldFxuICAgICAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICAgIFZpbSBpcyBlZGl0b3IgSSB1c2VkIGJlZm9yZVxuICAgICAgICAgICAgICBWfGltIGlzIGVkaXRvciBJIHVzZWQgYmVmb3JlXG4gICAgICAgICAgICAgIFZpbSBpcyBlZGl0b3IgSSB1c2VkIGJlZm9yZVxuICAgICAgICAgICAgICBWaW0gaXMgZWRpdG9yIEkgdXNlZCBiZWZvcmVcbiAgICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgICBpdCAnW2luc2VydC1hdC1zdGFydF0gYXBwbHkgb3BlcmF0aW9uIHRvIHByZXNldC1tYXJrZXIgaW50ZXJzZWN0aW5nIHNlbGVjdGVkIHRhcmdldCcsIC0+XG4gICAgICAgICAgICBlbnN1cmUgJ2cgbycsIG9jY3VycmVuY2VUZXh0OiBbJ1ZpbScsICdWaW0nLCAnVmltJywgJ1ZpbSddXG4gICAgICAgICAgICBjbGFzc0xpc3QuY29udGFpbnMoJ2hhcy1vY2N1cnJlbmNlJylcbiAgICAgICAgICAgIGVuc3VyZSAndiBrIEknLCBtb2RlOiAnaW5zZXJ0JywgbnVtQ3Vyc29yczogMlxuICAgICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoXCJwdXJlLVwiKVxuICAgICAgICAgICAgZW5zdXJlICdlc2NhcGUnLFxuICAgICAgICAgICAgICBtb2RlOiAnbm9ybWFsJ1xuICAgICAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICAgIHB1cmUhLVZpbSBpcyBlZGl0b3IgSSB1c2VkIGJlZm9yZVxuICAgICAgICAgICAgICBwdXJlfC1WaW0gaXMgZWRpdG9yIEkgdXNlZCBiZWZvcmVcbiAgICAgICAgICAgICAgVmltIGlzIGVkaXRvciBJIHVzZWQgYmVmb3JlXG4gICAgICAgICAgICAgIFZpbSBpcyBlZGl0b3IgSSB1c2VkIGJlZm9yZVxuICAgICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICAgIGl0ICdbaW5zZXJ0LWFmdGVyLXN0YXJ0XSBhcHBseSBvcGVyYXRpb24gdG8gcHJlc2V0LW1hcmtlciBpbnRlcnNlY3Rpbmcgc2VsZWN0ZWQgdGFyZ2V0JywgLT5cbiAgICAgICAgICAgIHNldCBjdXJzb3I6IFsxLCAxXVxuICAgICAgICAgICAgZW5zdXJlICdnIG8nLCBvY2N1cnJlbmNlVGV4dDogWydWaW0nLCAnVmltJywgJ1ZpbScsICdWaW0nXVxuICAgICAgICAgICAgY2xhc3NMaXN0LmNvbnRhaW5zKCdoYXMtb2NjdXJyZW5jZScpXG4gICAgICAgICAgICBlbnN1cmUgJ3YgaiBBJywgbW9kZTogJ2luc2VydCcsIG51bUN1cnNvcnM6IDJcbiAgICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KFwiIGFuZCBFbWFjc1wiKVxuICAgICAgICAgICAgZW5zdXJlICdlc2NhcGUnLFxuICAgICAgICAgICAgICBtb2RlOiAnbm9ybWFsJ1xuICAgICAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICAgIFZpbSBpcyBlZGl0b3IgSSB1c2VkIGJlZm9yZVxuICAgICAgICAgICAgICBWaW0gYW5kIEVtYWN8cyBpcyBlZGl0b3IgSSB1c2VkIGJlZm9yZVxuICAgICAgICAgICAgICBWaW0gYW5kIEVtYWMhcyBpcyBlZGl0b3IgSSB1c2VkIGJlZm9yZVxuICAgICAgICAgICAgICBWaW0gaXMgZWRpdG9yIEkgdXNlZCBiZWZvcmVcbiAgICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgIGRlc2NyaWJlIFwidmlzdWFsLW1vZGVcIiwgLT5cbiAgICAgICAgaXQgJ1t1cGNhc2VdIGFwcGx5IHRvIHByZXNldC1tYXJrZXIgYXMgbG9uZyBhcyBpdCBpbnRlcnNlY3RzIHNlbGVjdGlvbicsIC0+XG4gICAgICAgICAgc2V0XG4gICAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICBvb286IHh8eHg6IG9vbyB4eHg6IG9vbzpcbiAgICAgICAgICAgIHh4eDogb29vOiB4eHg6IG9vbyB4eHg6IG9vbzpcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIGVuc3VyZSAnZyBvJywgb2NjdXJyZW5jZUNvdW50OiA1XG4gICAgICAgICAgZW5zdXJlICd2IGogVScsXG4gICAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIG9vbzogWFhYOiBvb28gWFhYOiBvb286XG4gICAgICAgICAgICBYWFg6IG9vbzogeHh4OiBvb28geHh4OiBvb286XG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgZGVzY3JpYmUgXCJ2aXN1YWwtbGluZXdpc2UtbW9kZVwiLCAtPlxuICAgICAgICBpdCAnW3VwY2FzZV0gYXBwbHkgdG8gcHJlc2V0LW1hcmtlciBhcyBsb25nIGFzIGl0IGludGVyc2VjdHMgc2VsZWN0aW9uJywgLT5cbiAgICAgICAgICBzZXRcbiAgICAgICAgICAgIGN1cnNvcjogWzAsIDZdXG4gICAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIG9vbzogeHh4OiBvb28geHh4OiBvb286XG4gICAgICAgICAgICB4eHg6IG9vbzogeHh4OiBvb28geHh4OiBvb286XG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICBlbnN1cmUgJ2cgbycsIG9jY3VycmVuY2VDb3VudDogNVxuICAgICAgICAgIGVuc3VyZSAnViBVJyxcbiAgICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgb29vOiBYWFg6IG9vbyBYWFg6IG9vbzpcbiAgICAgICAgICAgIHh4eDogb29vOiB4eHg6IG9vbyB4eHg6IG9vbzpcbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICBkZXNjcmliZSBcInZpc3VhbC1ibG9ja3dpc2UtbW9kZVwiLCAtPlxuICAgICAgICBpdCAnW3VwY2FzZV0gYXBwbHkgdG8gcHJlc2V0LW1hcmtlciBhcyBsb25nIGFzIGl0IGludGVyc2VjdHMgc2VsZWN0aW9uJywgLT5cbiAgICAgICAgICBzZXRcbiAgICAgICAgICAgIGN1cnNvcjogWzAsIDZdXG4gICAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIG9vbzogeHh4OiBvb28geHh4OiBvb286XG4gICAgICAgICAgICB4eHg6IG9vbzogeHh4OiBvb28geHh4OiBvb286XG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICBlbnN1cmUgJ2cgbycsIG9jY3VycmVuY2VDb3VudDogNVxuICAgICAgICAgIGVuc3VyZSAnY3RybC12IGogMiB3IFUnLFxuICAgICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICBvb286IFhYWDogb29vIHh4eDogb29vOlxuICAgICAgICAgICAgeHh4OiBvb286IFhYWDogb29vIHh4eDogb29vOlxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICBkZXNjcmliZSBcIk1vdmVUb05leHRPY2N1cnJlbmNlLCBNb3ZlVG9QcmV2aW91c09jY3VycmVuY2VcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgIHxvb286IHh4eDogb29vXG4gICAgICAgICAgX19fOiBvb286IHh4eDpcbiAgICAgICAgICBvb286IHh4eDogb29vOlxuICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGVuc3VyZSAnZyBvJyxcbiAgICAgICAgICBvY2N1cnJlbmNlVGV4dDogWydvb28nLCAnb29vJywgJ29vbycsICdvb28nLCAnb29vJ11cblxuXG4gICAgICBkZXNjcmliZSBcInRhYiwgc2hpZnQtdGFiXCIsIC0+XG4gICAgICAgIGRlc2NyaWJlIFwiY3Vyc29yIGlzIGF0IHN0YXJ0IG9mIG9jY3VycmVuY2VcIiwgLT5cbiAgICAgICAgICBpdCBcInNlYXJjaCBuZXh0L3ByZXZpb3VzIG9jY3VycmVuY2UgbWFya2VyXCIsIC0+XG4gICAgICAgICAgICBlbnN1cmUgJ3RhYiB0YWInLCBjdXJzb3I6IFsxLCA1XVxuICAgICAgICAgICAgZW5zdXJlICcyIHRhYicsIGN1cnNvcjogWzIsIDEwXVxuICAgICAgICAgICAgZW5zdXJlICcyIHNoaWZ0LXRhYicsIGN1cnNvcjogWzEsIDVdXG4gICAgICAgICAgICBlbnN1cmUgJzIgc2hpZnQtdGFiJywgY3Vyc29yOiBbMCwgMF1cblxuICAgICAgICBkZXNjcmliZSBcIndoZW4gY3Vyc29yIGlzIGluc2lkZSBvZiBvY2N1cnJlbmNlXCIsIC0+XG4gICAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgICAgZW5zdXJlIFwiZXNjYXBlXCIsIG9jY3VycmVuY2VDb3VudDogMFxuICAgICAgICAgICAgc2V0IHRleHRDOiBcIm9vb28gb298b28gb29vb1wiXG4gICAgICAgICAgICBlbnN1cmUgJ2cgbycsIG9jY3VycmVuY2VDb3VudDogM1xuXG4gICAgICAgICAgZGVzY3JpYmUgXCJ0YWJcIiwgLT5cbiAgICAgICAgICAgIGl0IFwibW92ZSB0byBuZXh0IG9jY3VycmVuY2VcIiwgLT5cbiAgICAgICAgICAgICAgZW5zdXJlICd0YWInLCB0ZXh0QzogJ29vb28gb29vbyB8b29vbydcblxuICAgICAgICAgIGRlc2NyaWJlIFwic2hpZnQtdGFiXCIsIC0+XG4gICAgICAgICAgICBpdCBcIm1vdmUgdG8gcHJldmlvdXMgb2NjdXJyZW5jZVwiLCAtPlxuICAgICAgICAgICAgICBlbnN1cmUgJ3NoaWZ0LXRhYicsIHRleHRDOiAnfG9vb28gb29vbyBvb29vJ1xuXG4gICAgICBkZXNjcmliZSBcImFzIG9wZXJhdG9yJ3MgdGFyZ2V0XCIsIC0+XG4gICAgICAgIGRlc2NyaWJlIFwidGFiXCIsIC0+XG4gICAgICAgICAgaXQgXCJvcGVyYXRlIG9uIG5leHQgb2NjdXJyZW5jZSBhbmQgcmVwZWF0YWJsZVwiLCAtPlxuICAgICAgICAgICAgZW5zdXJlIFwiZyBVIHRhYlwiLFxuICAgICAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgICAgT09POiB4eHg6IE9PT1xuICAgICAgICAgICAgICBfX186IG9vbzogeHh4OlxuICAgICAgICAgICAgICBvb286IHh4eDogb29vOlxuICAgICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgICAgb2NjdXJyZW5jZUNvdW50OiAzXG4gICAgICAgICAgICBlbnN1cmUgXCIuXCIsXG4gICAgICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgICBPT086IHh4eDogT09PXG4gICAgICAgICAgICAgIF9fXzogT09POiB4eHg6XG4gICAgICAgICAgICAgIG9vbzogeHh4OiBvb286XG4gICAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgICBvY2N1cnJlbmNlQ291bnQ6IDJcbiAgICAgICAgICAgIGVuc3VyZSBcIjIgLlwiLFxuICAgICAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgICAgT09POiB4eHg6IE9PT1xuICAgICAgICAgICAgICBfX186IE9PTzogeHh4OlxuICAgICAgICAgICAgICBPT086IHh4eDogT09POlxuICAgICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgICAgb2NjdXJyZW5jZUNvdW50OiAwXG4gICAgICAgICAgICBleHBlY3QoY2xhc3NMaXN0LmNvbnRhaW5zKCdoYXMtb2NjdXJyZW5jZScpKS50b0JlKGZhbHNlKVxuXG4gICAgICAgICAgaXQgXCJbby1tb2RpZmllcl0gb3BlcmF0ZSBvbiBuZXh0IG9jY3VycmVuY2UgYW5kIHJlcGVhdGFibGVcIiwgLT5cbiAgICAgICAgICAgIGVuc3VyZSBcImVzY2FwZVwiLFxuICAgICAgICAgICAgICBtb2RlOiAnbm9ybWFsJ1xuICAgICAgICAgICAgICBvY2N1cnJlbmNlQ291bnQ6IDBcblxuICAgICAgICAgICAgZW5zdXJlIFwiZyBVIG8gdGFiXCIsXG4gICAgICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgICBPT086IHh4eDogT09PXG4gICAgICAgICAgICAgIF9fXzogb29vOiB4eHg6XG4gICAgICAgICAgICAgIG9vbzogeHh4OiBvb286XG4gICAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgICBvY2N1cnJlbmNlQ291bnQ6IDBcblxuICAgICAgICAgICAgZW5zdXJlIFwiLlwiLFxuICAgICAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgICAgT09POiB4eHg6IE9PT1xuICAgICAgICAgICAgICBfX186IE9PTzogeHh4OlxuICAgICAgICAgICAgICBvb286IHh4eDogb29vOlxuICAgICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgICAgb2NjdXJyZW5jZUNvdW50OiAwXG5cbiAgICAgICAgICAgIGVuc3VyZSBcIjIgLlwiLFxuICAgICAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgICAgT09POiB4eHg6IE9PT1xuICAgICAgICAgICAgICBfX186IE9PTzogeHh4OlxuICAgICAgICAgICAgICBPT086IHh4eDogT09POlxuICAgICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgICAgb2NjdXJyZW5jZUNvdW50OiAwXG5cbiAgICAgICAgZGVzY3JpYmUgXCJzaGlmdC10YWJcIiwgLT5cbiAgICAgICAgICBpdCBcIm9wZXJhdGUgb24gbmV4dCBwcmV2aW91cyBhbmQgcmVwZWF0YWJsZVwiLCAtPlxuICAgICAgICAgICAgc2V0IGN1cnNvcjogWzIsIDEwXVxuICAgICAgICAgICAgZW5zdXJlIFwiZyBVIHNoaWZ0LXRhYlwiLFxuICAgICAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgICAgb29vOiB4eHg6IG9vb1xuICAgICAgICAgICAgICBfX186IG9vbzogeHh4OlxuICAgICAgICAgICAgICBPT086IHh4eDogT09POlxuICAgICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgICAgb2NjdXJyZW5jZUNvdW50OiAzXG4gICAgICAgICAgICBlbnN1cmUgXCIuXCIsXG4gICAgICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgICBvb286IHh4eDogb29vXG4gICAgICAgICAgICAgIF9fXzogT09POiB4eHg6XG4gICAgICAgICAgICAgIE9PTzogeHh4OiBPT086XG4gICAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgICBvY2N1cnJlbmNlQ291bnQ6IDJcbiAgICAgICAgICAgIGVuc3VyZSBcIjIgLlwiLFxuICAgICAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgICAgT09POiB4eHg6IE9PT1xuICAgICAgICAgICAgICBfX186IE9PTzogeHh4OlxuICAgICAgICAgICAgICBPT086IHh4eDogT09POlxuICAgICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgICAgb2NjdXJyZW5jZUNvdW50OiAwXG4gICAgICAgICAgICBleHBlY3QoY2xhc3NMaXN0LmNvbnRhaW5zKCdoYXMtb2NjdXJyZW5jZScpKS50b0JlKGZhbHNlKVxuXG4gICAgICBkZXNjcmliZSBcImV4Y3VkZSBwYXJ0aWN1bGFyIG9jY3VyZW5jZSBieSBgLmAgcmVwZWF0XCIsIC0+XG4gICAgICAgIGl0IFwiY2xlYXIgcHJlc2V0LW9jY3VycmVuY2UgYW5kIG1vdmUgdG8gbmV4dFwiLCAtPlxuICAgICAgICAgIGVuc3VyZSAnMiB0YWIgLiBnIFUgaSBwJyxcbiAgICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAgIE9PTzogeHh4OiBPT09cbiAgICAgICAgICAgIF9fXzogfG9vbzogeHh4OlxuICAgICAgICAgICAgT09POiB4eHg6IE9PTzpcbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGl0IFwiY2xlYXIgcHJlc2V0LW9jY3VycmVuY2UgYW5kIG1vdmUgdG8gcHJldmlvdXNcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJzIgc2hpZnQtdGFiIC4gZyBVIGkgcCcsXG4gICAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICBPT086IHh4eDogT09PXG4gICAgICAgICAgICBfX186IE9PTzogeHh4OlxuICAgICAgICAgICAgfG9vbzogeHh4OiBPT086XG4gICAgICAgICAgICBcIlwiXCJcblxuICAgIGRlc2NyaWJlIFwiZXhwbGljdCBvcGVyYXRvci1tb2RpZmllciBvIGFuZCBwcmVzZXQtbWFya2VyXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICB8b29vOiB4eHg6IG9vbyB4eHg6IG9vbzpcbiAgICAgICAgICBfX186IG9vbzogeHh4OiBvb28geHh4OiBvb286XG4gICAgICAgICAgXCJcIlwiXG5cbiAgICAgIGRlc2NyaWJlIFwiJ28nIG1vZGlmaWVyIHdoZW4gcHJlc2V0IG9jY3VycmVuY2UgYWxyZWFkeSBleGlzdHNcIiwgLT5cbiAgICAgICAgaXQgXCInbycgYWx3YXlzIHBpY2sgY3Vyc29yLXdvcmQgYW5kIG92ZXJ3cml0ZSBleGlzdGluZyBwcmVzZXQgbWFya2VyKVwiLCAtPlxuICAgICAgICAgIGVuc3VyZSBcImcgb1wiLFxuICAgICAgICAgICAgb2NjdXJyZW5jZVRleHQ6IFtcIm9vb1wiLCBcIm9vb1wiLCBcIm9vb1wiLCBcIm9vb1wiLCBcIm9vb1wiLCBcIm9vb1wiXVxuICAgICAgICAgIGVuc3VyZSBcIjIgdyBkIG9cIixcbiAgICAgICAgICAgIG9jY3VycmVuY2VUZXh0OiBbXCJ4eHhcIiwgXCJ4eHhcIiwgXCJ4eHhcIiwgXCJ4eHhcIl1cbiAgICAgICAgICAgIG1vZGU6ICdvcGVyYXRvci1wZW5kaW5nJ1xuICAgICAgICAgIGVuc3VyZSBcImpcIixcbiAgICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgb29vOiA6IG9vbyA6IG9vbzpcbiAgICAgICAgICAgIF9fXzogb29vOiA6IG9vbyA6IG9vbzpcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgbW9kZTogJ25vcm1hbCdcblxuICAgICAgZGVzY3JpYmUgXCJvY2N1cnJlbmNlIGJvdW5kIG9wZXJhdG9yIGRvbid0IG92ZXJ3aXRlIHByZS1leGlzdGluZyBwcmVzZXQgbWFya2VyXCIsIC0+XG4gICAgICAgIGl0IFwiJ28nIGFsd2F5cyBwaWNrIGN1cnNvci13b3JkIGFuZCBjbGVhciBleGlzdGluZyBwcmVzZXQgbWFya2VyXCIsIC0+XG4gICAgICAgICAgZW5zdXJlIFwiZyBvXCIsXG4gICAgICAgICAgICBvY2N1cnJlbmNlVGV4dDogW1wib29vXCIsIFwib29vXCIsIFwib29vXCIsIFwib29vXCIsIFwib29vXCIsIFwib29vXCJdXG4gICAgICAgICAgZW5zdXJlIFwiMiB3IGcgY21kLWRcIixcbiAgICAgICAgICAgIG9jY3VycmVuY2VUZXh0OiBbXCJvb29cIiwgXCJvb29cIiwgXCJvb29cIiwgXCJvb29cIiwgXCJvb29cIiwgXCJvb29cIl1cbiAgICAgICAgICAgIG1vZGU6ICdvcGVyYXRvci1wZW5kaW5nJ1xuICAgICAgICAgIGVuc3VyZSBcImpcIixcbiAgICAgICAgICAgc2VsZWN0ZWRUZXh0OiBbXCJvb29cIiwgXCJvb29cIiwgXCJvb29cIiwgXCJvb29cIiwgXCJvb29cIiwgXCJvb29cIl1cblxuICAgIGRlc2NyaWJlIFwidG9nZ2xlLXByZXNldC1zdWJ3b3JkLW9jY3VycmVuY2UgY29tbWFuZHNcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dEM6IFwiXCJcIlxuXG4gICAgICAgICAgY2FtZWxDYXxzZSBDYXNlc1xuICAgICAgICAgIFwiQ2FzZVN0dWR5XCIgU25ha2VDYXNlXG4gICAgICAgICAgVVBfQ0FTRVxuXG4gICAgICAgICAgb3RoZXIgUGFyYWdyYXBoQ2FzZVxuICAgICAgICAgIFwiXCJcIlxuXG4gICAgICBkZXNjcmliZSBcImFkZCBwcmVzZXQgc3Vid29yZC1vY2N1cnJlbmNlXCIsIC0+XG4gICAgICAgIGl0IFwibWFyayBzdWJ3b3JkIHVuZGVyIGN1cnNvclwiLCAtPlxuICAgICAgICAgIGVuc3VyZSAnZyBPJywgb2NjdXJyZW5jZVRleHQ6IFsnQ2FzZScsICdDYXNlJywgJ0Nhc2UnLCAnQ2FzZSddXG4iXX0=
