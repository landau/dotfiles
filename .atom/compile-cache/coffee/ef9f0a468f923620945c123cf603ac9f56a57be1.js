(function() {
  var TextData, dispatch, getView, getVimState, ref, settings;

  ref = require('./spec-helper'), getVimState = ref.getVimState, dispatch = ref.dispatch, TextData = ref.TextData, getView = ref.getView;

  settings = require('../lib/settings');

  describe("Motion Search", function() {
    var editor, editorElement, ensure, keystroke, ref1, set, vimState;
    ref1 = [], set = ref1[0], ensure = ref1[1], keystroke = ref1[2], editor = ref1[3], editorElement = ref1[4], vimState = ref1[5];
    beforeEach(function() {
      jasmine.attachToDOM(getView(atom.workspace));
      return getVimState(function(state, _vim) {
        vimState = state;
        editor = vimState.editor, editorElement = vimState.editorElement;
        return set = _vim.set, ensure = _vim.ensure, keystroke = _vim.keystroke, _vim;
      });
    });
    describe("the / keybinding", function() {
      var pane;
      pane = null;
      beforeEach(function() {
        pane = {
          activate: jasmine.createSpy("activate")
        };
        set({
          text: "abc\ndef\nabc\ndef\n",
          cursor: [0, 0]
        });
        return spyOn(atom.workspace, 'getActivePane').andReturn(pane);
      });
      describe("as a motion", function() {
        it("moves the cursor to the specified search pattern", function() {
          ensure('/ def enter', {
            cursor: [1, 0]
          });
          return expect(pane.activate).toHaveBeenCalled();
        });
        it("loops back around", function() {
          set({
            cursor: [3, 0]
          });
          return ensure('/ def enter', {
            cursor: [1, 0]
          });
        });
        it("uses a valid regex as a regex", function() {
          ensure('/ [abc] enter', {
            cursor: [0, 1]
          });
          return ensure('n', {
            cursor: [0, 2]
          });
        });
        it("uses an invalid regex as a literal string", function() {
          set({
            text: "abc\n[abc]\n"
          });
          ensure('/ [abc enter', {
            cursor: [1, 0]
          });
          return ensure('n', {
            cursor: [1, 0]
          });
        });
        it("uses ? as a literal string", function() {
          set({
            text: "abc\n[a?c?\n"
          });
          ensure('/ ? enter', {
            cursor: [1, 2]
          });
          return ensure('n', {
            cursor: [1, 4]
          });
        });
        it('works with selection in visual mode', function() {
          set({
            text: 'one two three'
          });
          ensure('v / th enter', {
            cursor: [0, 9]
          });
          return ensure('d', {
            text: 'hree'
          });
        });
        it('extends selection when repeating search in visual mode', function() {
          set({
            text: "line1\nline2\nline3"
          });
          ensure('v / line enter', {
            selectedBufferRange: [[0, 0], [1, 1]]
          });
          return ensure('n', {
            selectedBufferRange: [[0, 0], [2, 1]]
          });
        });
        it('searches to the correct column in visual linewise mode', function() {
          return ensure('V / ef enter', {
            selectedText: "abc\ndef\n",
            propertyHead: [1, 1],
            cursor: [2, 0],
            mode: ['visual', 'linewise']
          });
        });
        it('not extend linwise selection if search matches on same line', function() {
          set({
            text: "abc def\ndef\n"
          });
          return ensure('V / ef enter', {
            selectedText: "abc def\n"
          });
        });
        describe("case sensitivity", function() {
          beforeEach(function() {
            return set({
              text: "\nabc\nABC\n",
              cursor: [0, 0]
            });
          });
          it("works in case sensitive mode", function() {
            ensure('/ ABC enter', {
              cursor: [2, 0]
            });
            return ensure('n', {
              cursor: [2, 0]
            });
          });
          it("works in case insensitive mode", function() {
            ensure('/ \\cAbC enter', {
              cursor: [1, 0]
            });
            return ensure('n', {
              cursor: [2, 0]
            });
          });
          it("works in case insensitive mode wherever \\c is", function() {
            ensure('/ AbC\\c enter', {
              cursor: [1, 0]
            });
            return ensure('n', {
              cursor: [2, 0]
            });
          });
          describe("when ignoreCaseForSearch is enabled", function() {
            beforeEach(function() {
              return settings.set('ignoreCaseForSearch', true);
            });
            it("ignore case when search [case-1]", function() {
              ensure('/ abc enter', {
                cursor: [1, 0]
              });
              return ensure('n', {
                cursor: [2, 0]
              });
            });
            return it("ignore case when search [case-2]", function() {
              ensure('/ ABC enter', {
                cursor: [1, 0]
              });
              return ensure('n', {
                cursor: [2, 0]
              });
            });
          });
          return describe("when useSmartcaseForSearch is enabled", function() {
            beforeEach(function() {
              return settings.set('useSmartcaseForSearch', true);
            });
            it("ignore case when searh term includes A-Z", function() {
              ensure('/ ABC enter', {
                cursor: [2, 0]
              });
              return ensure('n', {
                cursor: [2, 0]
              });
            });
            it("ignore case when searh term NOT includes A-Z regardress of `ignoreCaseForSearch`", function() {
              settings.set('ignoreCaseForSearch', false);
              ensure('/ abc enter', {
                cursor: [1, 0]
              });
              return ensure('n', {
                cursor: [2, 0]
              });
            });
            return it("ignore case when searh term NOT includes A-Z regardress of `ignoreCaseForSearch`", function() {
              settings.set('ignoreCaseForSearch', true);
              ensure('/ abc enter', {
                cursor: [1, 0]
              });
              return ensure('n', {
                cursor: [2, 0]
              });
            });
          });
        });
        describe("repeating", function() {
          return it("does nothing with no search history", function() {
            set({
              cursor: [0, 0]
            });
            ensure('n', {
              cursor: [0, 0]
            });
            set({
              cursor: [1, 1]
            });
            return ensure('n', {
              cursor: [1, 1]
            });
          });
        });
        describe("repeating with search history", function() {
          beforeEach(function() {
            return keystroke('/ def enter');
          });
          it("repeats previous search with /<enter>", function() {
            return ensure('/  enter', {
              cursor: [3, 0]
            });
          });
          describe("non-incrementalSearch only feature", function() {
            beforeEach(function() {
              return settings.set("incrementalSearch", false);
            });
            return it("repeats previous search with //", function() {
              return ensure('/ / enter', {
                cursor: [3, 0]
              });
            });
          });
          describe("the n keybinding", function() {
            return it("repeats the last search", function() {
              return ensure('n', {
                cursor: [3, 0]
              });
            });
          });
          return describe("the N keybinding", function() {
            return it("repeats the last search backwards", function() {
              set({
                cursor: [0, 0]
              });
              ensure('N', {
                cursor: [3, 0]
              });
              return ensure('N', {
                cursor: [1, 0]
              });
            });
          });
        });
        return describe("composing", function() {
          it("composes with operators", function() {
            return ensure('d / def enter', {
              text: "def\nabc\ndef\n"
            });
          });
          return it("repeats correctly with operators", function() {
            ensure('d / def enter', {
              text: "def\nabc\ndef\n"
            });
            return ensure('.', {
              text: "def\n"
            });
          });
        });
      });
      describe("when reversed as ?", function() {
        it("moves the cursor backwards to the specified search pattern", function() {
          return ensure('? def enter', {
            cursor: [3, 0]
          });
        });
        it("accepts / as a literal search pattern", function() {
          set({
            text: "abc\nd/f\nabc\nd/f\n",
            cursor: [0, 0]
          });
          ensure('? / enter', {
            cursor: [3, 1]
          });
          return ensure('? / enter', {
            cursor: [1, 1]
          });
        });
        return describe("repeating", function() {
          beforeEach(function() {
            return keystroke('? def enter');
          });
          it("repeats previous search as reversed with ?<enter>", function() {
            return ensure("? enter", {
              cursor: [1, 0]
            });
          });
          describe("non-incrementalSearch only feature", function() {
            beforeEach(function() {
              return settings.set("incrementalSearch", false);
            });
            return it("repeats previous search as reversed with ??", function() {
              return ensure('? ? enter', {
                cursor: [1, 0]
              });
            });
          });
          describe('the n keybinding', function() {
            return it("repeats the last search backwards", function() {
              set({
                cursor: [0, 0]
              });
              return ensure('n', {
                cursor: [3, 0]
              });
            });
          });
          return describe('the N keybinding', function() {
            return it("repeats the last search forwards", function() {
              set({
                cursor: [0, 0]
              });
              return ensure('N', {
                cursor: [1, 0]
              });
            });
          });
        });
      });
      describe("using search history", function() {
        var ensureInputEditor, inputEditor;
        inputEditor = null;
        ensureInputEditor = function(command, arg) {
          var text;
          text = arg.text;
          dispatch(inputEditor, command);
          return expect(inputEditor.getModel().getText()).toEqual(text);
        };
        beforeEach(function() {
          ensure('/ def enter', {
            cursor: [1, 0]
          });
          ensure('/ abc enter', {
            cursor: [2, 0]
          });
          return inputEditor = vimState.searchInput.editorElement;
        });
        it("allows searching history in the search field", function() {
          keystroke('/');
          ensureInputEditor('core:move-up', {
            text: 'abc'
          });
          ensureInputEditor('core:move-up', {
            text: 'def'
          });
          return ensureInputEditor('core:move-up', {
            text: 'def'
          });
        });
        return it("resets the search field to empty when scrolling back", function() {
          keystroke('/');
          ensureInputEditor('core:move-up', {
            text: 'abc'
          });
          ensureInputEditor('core:move-up', {
            text: 'def'
          });
          ensureInputEditor('core:move-down', {
            text: 'abc'
          });
          return ensureInputEditor('core:move-down', {
            text: ''
          });
        });
      });
      return describe("highlightSearch", function() {
        var ensureHightlightSearch, textForMarker;
        textForMarker = function(marker) {
          return editor.getTextInBufferRange(marker.getBufferRange());
        };
        ensureHightlightSearch = function(options) {
          var markers, text;
          markers = vimState.highlightSearch.getMarkers();
          if (options.length != null) {
            expect(markers).toHaveLength(options.length);
          }
          if (options.text != null) {
            text = markers.map(function(marker) {
              return textForMarker(marker);
            });
            expect(text).toEqual(options.text);
          }
          if (options.mode != null) {
            return ensure({
              mode: options.mode
            });
          }
        };
        beforeEach(function() {
          jasmine.attachToDOM(getView(atom.workspace));
          settings.set('highlightSearch', true);
          expect(vimState.highlightSearch.hasMarkers()).toBe(false);
          return ensure('/ def enter', {
            cursor: [1, 0]
          });
        });
        describe("clearHighlightSearch command", function() {
          return it("clear highlightSearch marker", function() {
            ensureHightlightSearch({
              length: 2,
              text: ["def", "def"],
              mode: 'normal'
            });
            dispatch(editorElement, 'vim-mode-plus:clear-highlight-search');
            return expect(vimState.highlightSearch.hasMarkers()).toBe(false);
          });
        });
        return describe("clearHighlightSearchOnResetNormalMode", function() {
          describe("when disabled", function() {
            return it("it won't clear highlightSearch", function() {
              settings.set('clearHighlightSearchOnResetNormalMode', false);
              ensureHightlightSearch({
                length: 2,
                text: ["def", "def"],
                mode: 'normal'
              });
              ensure("escape", {
                mode: 'normal'
              });
              return ensureHightlightSearch({
                length: 2,
                text: ["def", "def"],
                mode: 'normal'
              });
            });
          });
          return describe("when enabled", function() {
            return it("it clear highlightSearch on reset-normal-mode", function() {
              settings.set('clearHighlightSearchOnResetNormalMode', true);
              ensureHightlightSearch({
                length: 2,
                text: ["def", "def"],
                mode: 'normal'
              });
              ensure("escape", {
                mode: 'normal'
              });
              expect(vimState.highlightSearch.hasMarkers()).toBe(false);
              return ensure({
                mode: 'normal'
              });
            });
          });
        });
      });
    });
    describe("IncrementalSearch", function() {
      beforeEach(function() {
        return jasmine.attachToDOM(getView(atom.workspace));
      });
      describe("with multiple-cursors", function() {
        beforeEach(function() {
          return set({
            text: "0:    abc\n1:    abc\n2:    abc\n3:    abc",
            cursor: [[0, 0], [1, 0]]
          });
        });
        it("[forward] move each cursor to match", function() {
          return ensure('/ abc enter', {
            cursor: [[0, 6], [1, 6]]
          });
        });
        it("[forward: count specified], move each cursor to match", function() {
          return ensure('2 / abc enter', {
            cursor: [[1, 6], [2, 6]]
          });
        });
        it("[backward] move each cursor to match", function() {
          return ensure('? abc enter', {
            cursor: [[3, 6], [0, 6]]
          });
        });
        return it("[backward: count specified] move each cursor to match", function() {
          return ensure('2 ? abc enter', {
            cursor: [[2, 6], [3, 6]]
          });
        });
      });
      return describe("blank input repeat last search", function() {
        beforeEach(function() {
          return set({
            text: "0:    abc\n1:    abc\n2:    abc\n3:    abc\n4:"
          });
        });
        it("Do nothing when search history is empty", function() {
          set({
            cursor: [2, 1]
          });
          ensure('/  enter', {
            cursor: [2, 1]
          });
          return ensure('?  enter', {
            cursor: [2, 1]
          });
        });
        it("Repeat forward direction", function() {
          set({
            cursor: [0, 0]
          });
          ensure('/ abc enter', {
            cursor: [0, 6]
          });
          ensure('/  enter', {
            cursor: [1, 6]
          });
          return ensure('2 /  enter', {
            cursor: [3, 6]
          });
        });
        return it("Repeat backward direction", function() {
          set({
            cursor: [4, 0]
          });
          ensure('? abc enter', {
            cursor: [3, 6]
          });
          ensure('?  enter', {
            cursor: [2, 6]
          });
          return ensure('2 ?  enter', {
            cursor: [0, 6]
          });
        });
      });
    });
    describe("the * keybinding", function() {
      beforeEach(function() {
        return set({
          text: "abd\n@def\nabd\ndef\n",
          cursor: [0, 0]
        });
      });
      describe("as a motion", function() {
        it("moves cursor to next occurrence of word under cursor", function() {
          return ensure('*', {
            cursor: [2, 0]
          });
        });
        it("repeats with the n key", function() {
          ensure('*', {
            cursor: [2, 0]
          });
          return ensure('n', {
            cursor: [0, 0]
          });
        });
        it("doesn't move cursor unless next occurrence is the exact word (no partial matches)", function() {
          set({
            text: "abc\ndef\nghiabc\njkl\nabcdef",
            cursor: [0, 0]
          });
          return ensure('*', {
            cursor: [0, 0]
          });
        });
        describe("with words that contain 'non-word' characters", function() {
          it("skips non-word-char when picking cursor-word then place cursor to next occurrence of word", function() {
            set({
              text: "abc\n@def\nabc\n@def\n",
              cursor: [1, 0]
            });
            return ensure('*', {
              cursor: [3, 1]
            });
          });
          it("doesn't move cursor unless next match has exact word ending", function() {
            set({
              text: "abc\n@def\nabc\n@def1\n",
              cursor: [1, 1]
            });
            return ensure('*', {
              cursor: [1, 1]
            });
          });
          return it("moves cursor to the start of valid word char", function() {
            set({
              text: "abc\ndef\nabc\n@def\n",
              cursor: [1, 0]
            });
            return ensure('*', {
              cursor: [3, 1]
            });
          });
        });
        describe("when cursor is on non-word char column", function() {
          return it("matches only the non-word char", function() {
            set({
              text: "abc\n@def\nabc\n@def\n",
              cursor: [1, 0]
            });
            return ensure('*', {
              cursor: [3, 1]
            });
          });
        });
        describe("when cursor is not on a word", function() {
          return it("does a match with the next word", function() {
            set({
              text: "abc\na  @def\n abc\n @def",
              cursor: [1, 1]
            });
            return ensure('*', {
              cursor: [3, 2]
            });
          });
        });
        return describe("when cursor is at EOF", function() {
          return it("doesn't try to do any match", function() {
            set({
              text: "abc\n@def\nabc\n ",
              cursor: [3, 0]
            });
            return ensure('*', {
              cursor: [3, 0]
            });
          });
        });
      });
      return describe("caseSensitivity setting", function() {
        beforeEach(function() {
          return set({
            text: "abc\nABC\nabC\nabc\nABC",
            cursor: [0, 0]
          });
        });
        it("search case sensitively when `ignoreCaseForSearchCurrentWord` is false(=default)", function() {
          expect(settings.get('ignoreCaseForSearchCurrentWord')).toBe(false);
          ensure('*', {
            cursor: [3, 0]
          });
          return ensure('n', {
            cursor: [0, 0]
          });
        });
        it("search case insensitively when `ignoreCaseForSearchCurrentWord` true", function() {
          settings.set('ignoreCaseForSearchCurrentWord', true);
          ensure('*', {
            cursor: [1, 0]
          });
          ensure('n', {
            cursor: [2, 0]
          });
          ensure('n', {
            cursor: [3, 0]
          });
          return ensure('n', {
            cursor: [4, 0]
          });
        });
        return describe("useSmartcaseForSearchCurrentWord is enabled", function() {
          beforeEach(function() {
            return settings.set('useSmartcaseForSearchCurrentWord', true);
          });
          it("search case sensitively when enable and search term includes uppercase", function() {
            set({
              cursor: [1, 0]
            });
            ensure('*', {
              cursor: [4, 0]
            });
            return ensure('n', {
              cursor: [1, 0]
            });
          });
          return it("search case insensitively when enable and search term NOT includes uppercase", function() {
            set({
              cursor: [0, 0]
            });
            ensure('*', {
              cursor: [1, 0]
            });
            ensure('n', {
              cursor: [2, 0]
            });
            ensure('n', {
              cursor: [3, 0]
            });
            return ensure('n', {
              cursor: [4, 0]
            });
          });
        });
      });
    });
    describe("the hash keybinding", function() {
      describe("as a motion", function() {
        it("moves cursor to previous occurrence of word under cursor", function() {
          set({
            text: "abc\n@def\nabc\ndef\n",
            cursor: [2, 1]
          });
          return ensure('#', {
            cursor: [0, 0]
          });
        });
        it("repeats with n", function() {
          set({
            text: "abc\n@def\nabc\ndef\nabc\n",
            cursor: [2, 1]
          });
          ensure('#', {
            cursor: [0, 0]
          });
          ensure('n', {
            cursor: [4, 0]
          });
          return ensure('n', {
            cursor: [2, 0]
          });
        });
        it("doesn't move cursor unless next occurrence is the exact word (no partial matches)", function() {
          set({
            text: "abc\ndef\nghiabc\njkl\nabcdef",
            cursor: [0, 0]
          });
          return ensure('#', {
            cursor: [0, 0]
          });
        });
        describe("with words that containt 'non-word' characters", function() {
          it("moves cursor to next occurrence of word under cursor", function() {
            set({
              text: "abc\n@def\nabc\n@def\n",
              cursor: [3, 0]
            });
            return ensure('#', {
              cursor: [1, 1]
            });
          });
          return it("moves cursor to the start of valid word char", function() {
            set({
              text: "abc\n@def\nabc\ndef\n",
              cursor: [3, 0]
            });
            return ensure('#', {
              cursor: [1, 1]
            });
          });
        });
        return describe("when cursor is on non-word char column", function() {
          return it("matches only the non-word char", function() {
            set({
              text: "abc\n@def\nabc\n@def\n",
              cursor: [1, 0]
            });
            return ensure('*', {
              cursor: [3, 1]
            });
          });
        });
      });
      return describe("caseSensitivity setting", function() {
        beforeEach(function() {
          return set({
            text: "abc\nABC\nabC\nabc\nABC",
            cursor: [4, 0]
          });
        });
        it("search case sensitively when `ignoreCaseForSearchCurrentWord` is false(=default)", function() {
          expect(settings.get('ignoreCaseForSearchCurrentWord')).toBe(false);
          ensure('#', {
            cursor: [1, 0]
          });
          return ensure('n', {
            cursor: [4, 0]
          });
        });
        it("search case insensitively when `ignoreCaseForSearchCurrentWord` true", function() {
          settings.set('ignoreCaseForSearchCurrentWord', true);
          ensure('#', {
            cursor: [3, 0]
          });
          ensure('n', {
            cursor: [2, 0]
          });
          ensure('n', {
            cursor: [1, 0]
          });
          return ensure('n', {
            cursor: [0, 0]
          });
        });
        return describe("useSmartcaseForSearchCurrentWord is enabled", function() {
          beforeEach(function() {
            return settings.set('useSmartcaseForSearchCurrentWord', true);
          });
          it("search case sensitively when enable and search term includes uppercase", function() {
            set({
              cursor: [4, 0]
            });
            ensure('#', {
              cursor: [1, 0]
            });
            return ensure('n', {
              cursor: [4, 0]
            });
          });
          return it("search case insensitively when enable and search term NOT includes uppercase", function() {
            set({
              cursor: [0, 0]
            });
            ensure('#', {
              cursor: [4, 0]
            });
            ensure('n', {
              cursor: [3, 0]
            });
            ensure('n', {
              cursor: [2, 0]
            });
            ensure('n', {
              cursor: [1, 0]
            });
            return ensure('n', {
              cursor: [0, 0]
            });
          });
        });
      });
    });
    return describe('the % motion', function() {
      describe("Parenthesis", function() {
        beforeEach(function() {
          return set({
            text: "(___)"
          });
        });
        describe("as operator target", function() {
          beforeEach(function() {
            return set({
              text: "(_(_)_)"
            });
          });
          it('behave inclusively when is at open pair', function() {
            set({
              cursor: [0, 2]
            });
            return ensure('d %', {
              text: "(__)"
            });
          });
          return it('behave inclusively when is at open pair', function() {
            set({
              cursor: [0, 4]
            });
            return ensure('d %', {
              text: "(__)"
            });
          });
        });
        describe("cursor is at pair char", function() {
          it("cursor is at open pair, it move to closing pair", function() {
            set({
              cursor: [0, 0]
            });
            ensure('%', {
              cursor: [0, 4]
            });
            return ensure('%', {
              cursor: [0, 0]
            });
          });
          return it("cursor is at close pair, it move to open pair", function() {
            set({
              cursor: [0, 4]
            });
            ensure('%', {
              cursor: [0, 0]
            });
            return ensure('%', {
              cursor: [0, 4]
            });
          });
        });
        describe("cursor is enclosed by pair", function() {
          beforeEach(function() {
            return set({
              text: "(___)",
              cursor: [0, 2]
            });
          });
          return it("move to open pair", function() {
            return ensure('%', {
              cursor: [0, 0]
            });
          });
        });
        describe("cursor is bofore open pair", function() {
          beforeEach(function() {
            return set({
              text: "__(___)",
              cursor: [0, 0]
            });
          });
          return it("move to open pair", function() {
            return ensure('%', {
              cursor: [0, 6]
            });
          });
        });
        describe("cursor is after close pair", function() {
          beforeEach(function() {
            return set({
              text: "__(___)__",
              cursor: [0, 7]
            });
          });
          return it("fail to move", function() {
            return ensure('%', {
              cursor: [0, 7]
            });
          });
        });
        return describe("multi line", function() {
          beforeEach(function() {
            return set({
              text: "___\n___(__\n___\n___)"
            });
          });
          describe("when open and close pair is not at cursor line", function() {
            it("fail to move", function() {
              set({
                cursor: [0, 0]
              });
              return ensure('%', {
                cursor: [0, 0]
              });
            });
            return it("fail to move", function() {
              set({
                cursor: [2, 0]
              });
              return ensure('%', {
                cursor: [2, 0]
              });
            });
          });
          describe("when open pair is forwarding to cursor in same row", function() {
            return it("move to closing pair", function() {
              set({
                cursor: [1, 0]
              });
              return ensure('%', {
                cursor: [3, 3]
              });
            });
          });
          describe("when cursor position is greater than open pair", function() {
            return it("fail to move", function() {
              set({
                cursor: [1, 4]
              });
              return ensure('%', {
                cursor: [1, 4]
              });
            });
          });
          return describe("when close pair is forwarding to cursor in same row", function() {
            return it("move to closing pair", function() {
              set({
                cursor: [3, 0]
              });
              return ensure('%', {
                cursor: [1, 3]
              });
            });
          });
        });
      });
      describe("CurlyBracket", function() {
        beforeEach(function() {
          return set({
            text: "{___}"
          });
        });
        it("cursor is at open pair, it move to closing pair", function() {
          set({
            cursor: [0, 0]
          });
          ensure('%', {
            cursor: [0, 4]
          });
          return ensure('%', {
            cursor: [0, 0]
          });
        });
        return it("cursor is at close pair, it move to open pair", function() {
          set({
            cursor: [0, 4]
          });
          ensure('%', {
            cursor: [0, 0]
          });
          return ensure('%', {
            cursor: [0, 4]
          });
        });
      });
      describe("SquareBracket", function() {
        beforeEach(function() {
          return set({
            text: "[___]"
          });
        });
        it("cursor is at open pair, it move to closing pair", function() {
          set({
            cursor: [0, 0]
          });
          ensure('%', {
            cursor: [0, 4]
          });
          return ensure('%', {
            cursor: [0, 0]
          });
        });
        return it("cursor is at close pair, it move to open pair", function() {
          set({
            cursor: [0, 4]
          });
          ensure('%', {
            cursor: [0, 0]
          });
          return ensure('%', {
            cursor: [0, 4]
          });
        });
      });
      describe("complex situation", function() {
        beforeEach(function() {
          return set({
            text: "(_____)__{__[___]__}\n_"
          });
        });
        it('move to closing pair which open pair come first', function() {
          set({
            cursor: [0, 7]
          });
          ensure('%', {
            cursor: [0, 19]
          });
          set({
            cursor: [0, 10]
          });
          return ensure('%', {
            cursor: [0, 16]
          });
        });
        return it('enclosing pair is prioritized over forwarding range', function() {
          set({
            cursor: [0, 2]
          });
          return ensure('%', {
            cursor: [0, 0]
          });
        });
      });
      return describe("complex situation with html tag", function() {
        beforeEach(function() {
          return set({
            text: "<div>\n  <span>\n    some text\n  </span>\n</div>"
          });
        });
        return it('move to pair tag only when cursor is on open or close tag but not on AngleBracket(<, >)', function() {
          set({
            cursor: [0, 1]
          });
          ensure('%', {
            cursor: [4, 1]
          });
          set({
            cursor: [0, 2]
          });
          ensure('%', {
            cursor: [4, 1]
          });
          set({
            cursor: [0, 3]
          });
          ensure('%', {
            cursor: [4, 1]
          });
          set({
            cursor: [4, 1]
          });
          ensure('%', {
            cursor: [0, 1]
          });
          set({
            cursor: [4, 2]
          });
          ensure('%', {
            cursor: [0, 1]
          });
          set({
            cursor: [4, 3]
          });
          ensure('%', {
            cursor: [0, 1]
          });
          set({
            cursor: [4, 4]
          });
          return ensure('%', {
            cursor: [0, 1]
          });
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9zcGVjL21vdGlvbi1zZWFyY2gtc3BlYy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLE1BQTZDLE9BQUEsQ0FBUSxlQUFSLENBQTdDLEVBQUMsNkJBQUQsRUFBYyx1QkFBZCxFQUF3Qix1QkFBeEIsRUFBa0M7O0VBQ2xDLFFBQUEsR0FBVyxPQUFBLENBQVEsaUJBQVI7O0VBRVgsUUFBQSxDQUFTLGVBQVQsRUFBMEIsU0FBQTtBQUN4QixRQUFBO0lBQUEsT0FBNEQsRUFBNUQsRUFBQyxhQUFELEVBQU0sZ0JBQU4sRUFBYyxtQkFBZCxFQUF5QixnQkFBekIsRUFBaUMsdUJBQWpDLEVBQWdEO0lBRWhELFVBQUEsQ0FBVyxTQUFBO01BQ1QsT0FBTyxDQUFDLFdBQVIsQ0FBb0IsT0FBQSxDQUFRLElBQUksQ0FBQyxTQUFiLENBQXBCO2FBQ0EsV0FBQSxDQUFZLFNBQUMsS0FBRCxFQUFRLElBQVI7UUFDVixRQUFBLEdBQVc7UUFDVix3QkFBRCxFQUFTO2VBQ1IsY0FBRCxFQUFNLG9CQUFOLEVBQWMsMEJBQWQsRUFBMkI7TUFIakIsQ0FBWjtJQUZTLENBQVg7SUFPQSxRQUFBLENBQVMsa0JBQVQsRUFBNkIsU0FBQTtBQUMzQixVQUFBO01BQUEsSUFBQSxHQUFPO01BRVAsVUFBQSxDQUFXLFNBQUE7UUFDVCxJQUFBLEdBQU87VUFBQyxRQUFBLEVBQVUsT0FBTyxDQUFDLFNBQVIsQ0FBa0IsVUFBbEIsQ0FBWDs7UUFDUCxHQUFBLENBQ0U7VUFBQSxJQUFBLEVBQU0sc0JBQU47VUFNQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQU5SO1NBREY7ZUFRQSxLQUFBLENBQU0sSUFBSSxDQUFDLFNBQVgsRUFBc0IsZUFBdEIsQ0FBc0MsQ0FBQyxTQUF2QyxDQUFpRCxJQUFqRDtNQVZTLENB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Q0FBRCxFQUFJLENBQUosQ0FBUjtXQUFKO1VBQW9CLE1BQUEsQ0FBTyxHQUFQLEVBQVk7WUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO1dBQVo7VUFDcEIsR0FBQSxDQUFJO1lBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtXQUFKO2lCQUFvQixNQUFBLENBQU8sR0FBUCxFQUFZO1lBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtXQUFaO1FBUndFLENBQTlGO01BVjBDLENBQTVDO0lBaEh1QixDQUF6QjtFQXRnQndCLENBQTFCO0FBSEEiLCJzb3VyY2VzQ29udGVudCI6WyJ7Z2V0VmltU3RhdGUsIGRpc3BhdGNoLCBUZXh0RGF0YSwgZ2V0Vmlld30gPSByZXF1aXJlICcuL3NwZWMtaGVscGVyJ1xuc2V0dGluZ3MgPSByZXF1aXJlICcuLi9saWIvc2V0dGluZ3MnXG5cbmRlc2NyaWJlIFwiTW90aW9uIFNlYXJjaFwiLCAtPlxuICBbc2V0LCBlbnN1cmUsIGtleXN0cm9rZSwgZWRpdG9yLCBlZGl0b3JFbGVtZW50LCB2aW1TdGF0ZV0gPSBbXVxuXG4gIGJlZm9yZUVhY2ggLT5cbiAgICBqYXNtaW5lLmF0dGFjaFRvRE9NKGdldFZpZXcoYXRvbS53b3Jrc3BhY2UpKVxuICAgIGdldFZpbVN0YXRlIChzdGF0ZSwgX3ZpbSkgLT5cbiAgICAgIHZpbVN0YXRlID0gc3RhdGUgIyB0byByZWZlciBhcyB2aW1TdGF0ZSBsYXRlci5cbiAgICAgIHtlZGl0b3IsIGVkaXRvckVsZW1lbnR9ID0gdmltU3RhdGVcbiAgICAgIHtzZXQsIGVuc3VyZSwga2V5c3Ryb2tlfSA9IF92aW1cblxuICBkZXNjcmliZSBcInRoZSAvIGtleWJpbmRpbmdcIiwgLT5cbiAgICBwYW5lID0gbnVsbFxuXG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgcGFuZSA9IHthY3RpdmF0ZTogamFzbWluZS5jcmVhdGVTcHkoXCJhY3RpdmF0ZVwiKX1cbiAgICAgIHNldFxuICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICBhYmNcbiAgICAgICAgICBkZWZcbiAgICAgICAgICBhYmNcbiAgICAgICAgICBkZWZcXG5cbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgY3Vyc29yOiBbMCwgMF1cbiAgICAgIHNweU9uKGF0b20ud29ya3NwYWNlLCAnZ2V0QWN0aXZlUGFuZScpLmFuZFJldHVybihwYW5lKVxuXG4gICAgZGVzY3JpYmUgXCJhcyBhIG1vdGlvblwiLCAtPlxuICAgICAgaXQgXCJtb3ZlcyB0aGUgY3Vyc29yIHRvIHRoZSBzcGVjaWZpZWQgc2VhcmNoIHBhdHRlcm5cIiwgLT5cbiAgICAgICAgZW5zdXJlICcvIGRlZiBlbnRlcicsIGN1cnNvcjogWzEsIDBdXG4gICAgICAgIGV4cGVjdChwYW5lLmFjdGl2YXRlKS50b0hhdmVCZWVuQ2FsbGVkKClcblxuICAgICAgaXQgXCJsb29wcyBiYWNrIGFyb3VuZFwiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMywgMF1cbiAgICAgICAgZW5zdXJlICcvIGRlZiBlbnRlcicsIGN1cnNvcjogWzEsIDBdXG5cbiAgICAgIGl0IFwidXNlcyBhIHZhbGlkIHJlZ2V4IGFzIGEgcmVnZXhcIiwgLT5cbiAgICAgICAgIyBDeWNsZSB0aHJvdWdoIHRoZSAnYWJjJyBvbiB0aGUgZmlyc3QgbGluZSB3aXRoIGEgY2hhcmFjdGVyIHBhdHRlcm5cbiAgICAgICAgZW5zdXJlICcvIFthYmNdIGVudGVyJywgY3Vyc29yOiBbMCwgMV1cbiAgICAgICAgZW5zdXJlICduJywgY3Vyc29yOiBbMCwgMl1cblxuICAgICAgaXQgXCJ1c2VzIGFuIGludmFsaWQgcmVnZXggYXMgYSBsaXRlcmFsIHN0cmluZ1wiLCAtPlxuICAgICAgICAjIEdvIHN0cmFpZ2h0IHRvIHRoZSBsaXRlcmFsIFthYmNcbiAgICAgICAgc2V0IHRleHQ6IFwiYWJjXFxuW2FiY11cXG5cIlxuICAgICAgICBlbnN1cmUgJy8gW2FiYyBlbnRlcicsIGN1cnNvcjogWzEsIDBdXG4gICAgICAgIGVuc3VyZSAnbicsIGN1cnNvcjogWzEsIDBdXG5cbiAgICAgIGl0IFwidXNlcyA/IGFzIGEgbGl0ZXJhbCBzdHJpbmdcIiwgLT5cbiAgICAgICAgc2V0IHRleHQ6IFwiYWJjXFxuW2E/Yz9cXG5cIlxuICAgICAgICBlbnN1cmUgJy8gPyBlbnRlcicsIGN1cnNvcjogWzEsIDJdXG4gICAgICAgIGVuc3VyZSAnbicsIGN1cnNvcjogWzEsIDRdXG5cbiAgICAgIGl0ICd3b3JrcyB3aXRoIHNlbGVjdGlvbiBpbiB2aXN1YWwgbW9kZScsIC0+XG4gICAgICAgIHNldCB0ZXh0OiAnb25lIHR3byB0aHJlZSdcbiAgICAgICAgZW5zdXJlICd2IC8gdGggZW50ZXInLCBjdXJzb3I6IFswLCA5XVxuICAgICAgICBlbnN1cmUgJ2QnLCB0ZXh0OiAnaHJlZSdcblxuICAgICAgaXQgJ2V4dGVuZHMgc2VsZWN0aW9uIHdoZW4gcmVwZWF0aW5nIHNlYXJjaCBpbiB2aXN1YWwgbW9kZScsIC0+XG4gICAgICAgIHNldCB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICBsaW5lMVxuICAgICAgICAgIGxpbmUyXG4gICAgICAgICAgbGluZTNcbiAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBlbnN1cmUgJ3YgLyBsaW5lIGVudGVyJyxcbiAgICAgICAgICBzZWxlY3RlZEJ1ZmZlclJhbmdlOiBbWzAsIDBdLCBbMSwgMV1dXG4gICAgICAgIGVuc3VyZSAnbicsXG4gICAgICAgICAgc2VsZWN0ZWRCdWZmZXJSYW5nZTogW1swLCAwXSwgWzIsIDFdXVxuXG4gICAgICBpdCAnc2VhcmNoZXMgdG8gdGhlIGNvcnJlY3QgY29sdW1uIGluIHZpc3VhbCBsaW5ld2lzZSBtb2RlJywgLT5cbiAgICAgICAgZW5zdXJlICdWIC8gZWYgZW50ZXInLFxuICAgICAgICAgIHNlbGVjdGVkVGV4dDogXCJhYmNcXG5kZWZcXG5cIixcbiAgICAgICAgICBwcm9wZXJ0eUhlYWQ6IFsxLCAxXVxuICAgICAgICAgIGN1cnNvcjogWzIsIDBdXG4gICAgICAgICAgbW9kZTogWyd2aXN1YWwnLCAnbGluZXdpc2UnXVxuXG4gICAgICBpdCAnbm90IGV4dGVuZCBsaW53aXNlIHNlbGVjdGlvbiBpZiBzZWFyY2ggbWF0Y2hlcyBvbiBzYW1lIGxpbmUnLCAtPlxuICAgICAgICBzZXQgdGV4dDogXCJcIlwiXG4gICAgICAgICAgYWJjIGRlZlxuICAgICAgICAgIGRlZlxcblxuICAgICAgICAgIFwiXCJcIlxuICAgICAgICBlbnN1cmUgJ1YgLyBlZiBlbnRlcicsIHNlbGVjdGVkVGV4dDogXCJhYmMgZGVmXFxuXCIsXG5cbiAgICAgIGRlc2NyaWJlIFwiY2FzZSBzZW5zaXRpdml0eVwiLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgc2V0XG4gICAgICAgICAgICB0ZXh0OiBcIlxcbmFiY1xcbkFCQ1xcblwiXG4gICAgICAgICAgICBjdXJzb3I6IFswLCAwXVxuXG4gICAgICAgIGl0IFwid29ya3MgaW4gY2FzZSBzZW5zaXRpdmUgbW9kZVwiLCAtPlxuICAgICAgICAgIGVuc3VyZSAnLyBBQkMgZW50ZXInLCBjdXJzb3I6IFsyLCAwXVxuICAgICAgICAgIGVuc3VyZSAnbicsIGN1cnNvcjogWzIsIDBdXG5cbiAgICAgICAgaXQgXCJ3b3JrcyBpbiBjYXNlIGluc2Vuc2l0aXZlIG1vZGVcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJy8gXFxcXGNBYkMgZW50ZXInLCBjdXJzb3I6IFsxLCAwXVxuICAgICAgICAgIGVuc3VyZSAnbicsIGN1cnNvcjogWzIsIDBdXG5cbiAgICAgICAgaXQgXCJ3b3JrcyBpbiBjYXNlIGluc2Vuc2l0aXZlIG1vZGUgd2hlcmV2ZXIgXFxcXGMgaXNcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJy8gQWJDXFxcXGMgZW50ZXInLCBjdXJzb3I6IFsxLCAwXVxuICAgICAgICAgIGVuc3VyZSAnbicsIGN1cnNvcjogWzIsIDBdXG5cbiAgICAgICAgZGVzY3JpYmUgXCJ3aGVuIGlnbm9yZUNhc2VGb3JTZWFyY2ggaXMgZW5hYmxlZFwiLCAtPlxuICAgICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICAgIHNldHRpbmdzLnNldCAnaWdub3JlQ2FzZUZvclNlYXJjaCcsIHRydWVcblxuICAgICAgICAgIGl0IFwiaWdub3JlIGNhc2Ugd2hlbiBzZWFyY2ggW2Nhc2UtMV1cIiwgLT5cbiAgICAgICAgICAgIGVuc3VyZSAnLyBhYmMgZW50ZXInLCBjdXJzb3I6IFsxLCAwXVxuICAgICAgICAgICAgZW5zdXJlICduJywgY3Vyc29yOiBbMiwgMF1cblxuICAgICAgICAgIGl0IFwiaWdub3JlIGNhc2Ugd2hlbiBzZWFyY2ggW2Nhc2UtMl1cIiwgLT5cbiAgICAgICAgICAgIGVuc3VyZSAnLyBBQkMgZW50ZXInLCBjdXJzb3I6IFsxLCAwXVxuICAgICAgICAgICAgZW5zdXJlICduJywgY3Vyc29yOiBbMiwgMF1cblxuICAgICAgICBkZXNjcmliZSBcIndoZW4gdXNlU21hcnRjYXNlRm9yU2VhcmNoIGlzIGVuYWJsZWRcIiwgLT5cbiAgICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgICBzZXR0aW5ncy5zZXQgJ3VzZVNtYXJ0Y2FzZUZvclNlYXJjaCcsIHRydWVcblxuICAgICAgICAgIGl0IFwiaWdub3JlIGNhc2Ugd2hlbiBzZWFyaCB0ZXJtIGluY2x1ZGVzIEEtWlwiLCAtPlxuICAgICAgICAgICAgZW5zdXJlICcvIEFCQyBlbnRlcicsIGN1cnNvcjogWzIsIDBdXG4gICAgICAgICAgICBlbnN1cmUgJ24nLCBjdXJzb3I6IFsyLCAwXVxuXG4gICAgICAgICAgaXQgXCJpZ25vcmUgY2FzZSB3aGVuIHNlYXJoIHRlcm0gTk9UIGluY2x1ZGVzIEEtWiByZWdhcmRyZXNzIG9mIGBpZ25vcmVDYXNlRm9yU2VhcmNoYFwiLCAtPlxuICAgICAgICAgICAgc2V0dGluZ3Muc2V0ICdpZ25vcmVDYXNlRm9yU2VhcmNoJywgZmFsc2UgIyBkZWZhdWx0XG4gICAgICAgICAgICBlbnN1cmUgJy8gYWJjIGVudGVyJywgY3Vyc29yOiBbMSwgMF1cbiAgICAgICAgICAgIGVuc3VyZSAnbicsIGN1cnNvcjogWzIsIDBdXG5cbiAgICAgICAgICBpdCBcImlnbm9yZSBjYXNlIHdoZW4gc2VhcmggdGVybSBOT1QgaW5jbHVkZXMgQS1aIHJlZ2FyZHJlc3Mgb2YgYGlnbm9yZUNhc2VGb3JTZWFyY2hgXCIsIC0+XG4gICAgICAgICAgICBzZXR0aW5ncy5zZXQgJ2lnbm9yZUNhc2VGb3JTZWFyY2gnLCB0cnVlICMgZGVmYXVsdFxuICAgICAgICAgICAgZW5zdXJlICcvIGFiYyBlbnRlcicsIGN1cnNvcjogWzEsIDBdXG4gICAgICAgICAgICBlbnN1cmUgJ24nLCBjdXJzb3I6IFsyLCAwXVxuXG4gICAgICBkZXNjcmliZSBcInJlcGVhdGluZ1wiLCAtPlxuICAgICAgICBpdCBcImRvZXMgbm90aGluZyB3aXRoIG5vIHNlYXJjaCBoaXN0b3J5XCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzAsIDBdXG4gICAgICAgICAgZW5zdXJlICduJywgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMSwgMV1cbiAgICAgICAgICBlbnN1cmUgJ24nLCBjdXJzb3I6IFsxLCAxXVxuXG4gICAgICBkZXNjcmliZSBcInJlcGVhdGluZyB3aXRoIHNlYXJjaCBoaXN0b3J5XCIsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBrZXlzdHJva2UgJy8gZGVmIGVudGVyJ1xuXG4gICAgICAgIGl0IFwicmVwZWF0cyBwcmV2aW91cyBzZWFyY2ggd2l0aCAvPGVudGVyPlwiLCAtPlxuICAgICAgICAgIGVuc3VyZSAnLyAgZW50ZXInLCBjdXJzb3I6IFszLCAwXVxuXG4gICAgICAgIGRlc2NyaWJlIFwibm9uLWluY3JlbWVudGFsU2VhcmNoIG9ubHkgZmVhdHVyZVwiLCAtPlxuICAgICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICAgIHNldHRpbmdzLnNldChcImluY3JlbWVudGFsU2VhcmNoXCIsIGZhbHNlKVxuXG4gICAgICAgICAgaXQgXCJyZXBlYXRzIHByZXZpb3VzIHNlYXJjaCB3aXRoIC8vXCIsIC0+XG4gICAgICAgICAgICBlbnN1cmUgJy8gLyBlbnRlcicsIGN1cnNvcjogWzMsIDBdXG5cbiAgICAgICAgZGVzY3JpYmUgXCJ0aGUgbiBrZXliaW5kaW5nXCIsIC0+XG4gICAgICAgICAgaXQgXCJyZXBlYXRzIHRoZSBsYXN0IHNlYXJjaFwiLCAtPlxuICAgICAgICAgICAgZW5zdXJlICduJywgY3Vyc29yOiBbMywgMF1cblxuICAgICAgICBkZXNjcmliZSBcInRoZSBOIGtleWJpbmRpbmdcIiwgLT5cbiAgICAgICAgICBpdCBcInJlcGVhdHMgdGhlIGxhc3Qgc2VhcmNoIGJhY2t3YXJkc1wiLCAtPlxuICAgICAgICAgICAgc2V0IGN1cnNvcjogWzAsIDBdXG4gICAgICAgICAgICBlbnN1cmUgJ04nLCBjdXJzb3I6IFszLCAwXVxuICAgICAgICAgICAgZW5zdXJlICdOJywgY3Vyc29yOiBbMSwgMF1cblxuICAgICAgZGVzY3JpYmUgXCJjb21wb3NpbmdcIiwgLT5cbiAgICAgICAgaXQgXCJjb21wb3NlcyB3aXRoIG9wZXJhdG9yc1wiLCAtPlxuICAgICAgICAgIGVuc3VyZSAnZCAvIGRlZiBlbnRlcicsIHRleHQ6IFwiZGVmXFxuYWJjXFxuZGVmXFxuXCJcblxuICAgICAgICBpdCBcInJlcGVhdHMgY29ycmVjdGx5IHdpdGggb3BlcmF0b3JzXCIsIC0+XG4gICAgICAgICAgZW5zdXJlICdkIC8gZGVmIGVudGVyJywgdGV4dDogXCJkZWZcXG5hYmNcXG5kZWZcXG5cIlxuICAgICAgICAgIGVuc3VyZSAnLicsIHRleHQ6IFwiZGVmXFxuXCJcblxuICAgIGRlc2NyaWJlIFwid2hlbiByZXZlcnNlZCBhcyA/XCIsIC0+XG4gICAgICBpdCBcIm1vdmVzIHRoZSBjdXJzb3IgYmFja3dhcmRzIHRvIHRoZSBzcGVjaWZpZWQgc2VhcmNoIHBhdHRlcm5cIiwgLT5cbiAgICAgICAgZW5zdXJlICc/IGRlZiBlbnRlcicsIGN1cnNvcjogWzMsIDBdXG5cbiAgICAgIGl0IFwiYWNjZXB0cyAvIGFzIGEgbGl0ZXJhbCBzZWFyY2ggcGF0dGVyblwiLCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0OiBcImFiY1xcbmQvZlxcbmFiY1xcbmQvZlxcblwiXG4gICAgICAgICAgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgZW5zdXJlICc/IC8gZW50ZXInLCBjdXJzb3I6IFszLCAxXVxuICAgICAgICBlbnN1cmUgJz8gLyBlbnRlcicsIGN1cnNvcjogWzEsIDFdXG5cbiAgICAgIGRlc2NyaWJlIFwicmVwZWF0aW5nXCIsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBrZXlzdHJva2UgJz8gZGVmIGVudGVyJ1xuXG4gICAgICAgIGl0IFwicmVwZWF0cyBwcmV2aW91cyBzZWFyY2ggYXMgcmV2ZXJzZWQgd2l0aCA/PGVudGVyPlwiLCAtPlxuICAgICAgICAgIGVuc3VyZSBcIj8gZW50ZXJcIiwgY3Vyc29yOiBbMSwgMF1cblxuICAgICAgICBkZXNjcmliZSBcIm5vbi1pbmNyZW1lbnRhbFNlYXJjaCBvbmx5IGZlYXR1cmVcIiwgLT5cbiAgICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgICBzZXR0aW5ncy5zZXQoXCJpbmNyZW1lbnRhbFNlYXJjaFwiLCBmYWxzZSlcblxuICAgICAgICAgIGl0IFwicmVwZWF0cyBwcmV2aW91cyBzZWFyY2ggYXMgcmV2ZXJzZWQgd2l0aCA/P1wiLCAtPlxuICAgICAgICAgICAgZW5zdXJlICc/ID8gZW50ZXInLCBjdXJzb3I6IFsxLCAwXVxuXG4gICAgICAgIGRlc2NyaWJlICd0aGUgbiBrZXliaW5kaW5nJywgLT5cbiAgICAgICAgICBpdCBcInJlcGVhdHMgdGhlIGxhc3Qgc2VhcmNoIGJhY2t3YXJkc1wiLCAtPlxuICAgICAgICAgICAgc2V0IGN1cnNvcjogWzAsIDBdXG4gICAgICAgICAgICBlbnN1cmUgJ24nLCBjdXJzb3I6IFszLCAwXVxuXG4gICAgICAgIGRlc2NyaWJlICd0aGUgTiBrZXliaW5kaW5nJywgLT5cbiAgICAgICAgICBpdCBcInJlcGVhdHMgdGhlIGxhc3Qgc2VhcmNoIGZvcndhcmRzXCIsIC0+XG4gICAgICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgICAgIGVuc3VyZSAnTicsIGN1cnNvcjogWzEsIDBdXG5cbiAgICBkZXNjcmliZSBcInVzaW5nIHNlYXJjaCBoaXN0b3J5XCIsIC0+XG4gICAgICBpbnB1dEVkaXRvciA9IG51bGxcbiAgICAgIGVuc3VyZUlucHV0RWRpdG9yID0gKGNvbW1hbmQsIHt0ZXh0fSkgLT5cbiAgICAgICAgZGlzcGF0Y2goaW5wdXRFZGl0b3IsIGNvbW1hbmQpXG4gICAgICAgIGV4cGVjdChpbnB1dEVkaXRvci5nZXRNb2RlbCgpLmdldFRleHQoKSkudG9FcXVhbCh0ZXh0KVxuXG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIGVuc3VyZSAnLyBkZWYgZW50ZXInLCBjdXJzb3I6IFsxLCAwXVxuICAgICAgICBlbnN1cmUgJy8gYWJjIGVudGVyJywgY3Vyc29yOiBbMiwgMF1cbiAgICAgICAgaW5wdXRFZGl0b3IgPSB2aW1TdGF0ZS5zZWFyY2hJbnB1dC5lZGl0b3JFbGVtZW50XG5cbiAgICAgIGl0IFwiYWxsb3dzIHNlYXJjaGluZyBoaXN0b3J5IGluIHRoZSBzZWFyY2ggZmllbGRcIiwgLT5cbiAgICAgICAga2V5c3Ryb2tlICcvJ1xuICAgICAgICBlbnN1cmVJbnB1dEVkaXRvciAnY29yZTptb3ZlLXVwJywgdGV4dDogJ2FiYydcbiAgICAgICAgZW5zdXJlSW5wdXRFZGl0b3IgJ2NvcmU6bW92ZS11cCcsIHRleHQ6ICdkZWYnXG4gICAgICAgIGVuc3VyZUlucHV0RWRpdG9yICdjb3JlOm1vdmUtdXAnLCB0ZXh0OiAnZGVmJ1xuXG4gICAgICBpdCBcInJlc2V0cyB0aGUgc2VhcmNoIGZpZWxkIHRvIGVtcHR5IHdoZW4gc2Nyb2xsaW5nIGJhY2tcIiwgLT5cbiAgICAgICAga2V5c3Ryb2tlICcvJ1xuICAgICAgICBlbnN1cmVJbnB1dEVkaXRvciAnY29yZTptb3ZlLXVwJywgdGV4dDogJ2FiYydcbiAgICAgICAgZW5zdXJlSW5wdXRFZGl0b3IgJ2NvcmU6bW92ZS11cCcsIHRleHQ6ICdkZWYnXG4gICAgICAgIGVuc3VyZUlucHV0RWRpdG9yICdjb3JlOm1vdmUtZG93bicsIHRleHQ6ICdhYmMnXG4gICAgICAgIGVuc3VyZUlucHV0RWRpdG9yICdjb3JlOm1vdmUtZG93bicsIHRleHQ6ICcnXG5cbiAgICBkZXNjcmliZSBcImhpZ2hsaWdodFNlYXJjaFwiLCAtPlxuICAgICAgdGV4dEZvck1hcmtlciA9IChtYXJrZXIpIC0+XG4gICAgICAgIGVkaXRvci5nZXRUZXh0SW5CdWZmZXJSYW5nZShtYXJrZXIuZ2V0QnVmZmVyUmFuZ2UoKSlcblxuICAgICAgZW5zdXJlSGlnaHRsaWdodFNlYXJjaCA9IChvcHRpb25zKSAtPlxuICAgICAgICBtYXJrZXJzID0gdmltU3RhdGUuaGlnaGxpZ2h0U2VhcmNoLmdldE1hcmtlcnMoKVxuICAgICAgICBpZiBvcHRpb25zLmxlbmd0aD9cbiAgICAgICAgICBleHBlY3QobWFya2VycykudG9IYXZlTGVuZ3RoKG9wdGlvbnMubGVuZ3RoKVxuXG4gICAgICAgIGlmIG9wdGlvbnMudGV4dD9cbiAgICAgICAgICB0ZXh0ID0gbWFya2Vycy5tYXAgKG1hcmtlcikgLT4gdGV4dEZvck1hcmtlcihtYXJrZXIpXG4gICAgICAgICAgZXhwZWN0KHRleHQpLnRvRXF1YWwob3B0aW9ucy50ZXh0KVxuXG4gICAgICAgIGlmIG9wdGlvbnMubW9kZT9cbiAgICAgICAgICBlbnN1cmUge21vZGU6IG9wdGlvbnMubW9kZX1cblxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBqYXNtaW5lLmF0dGFjaFRvRE9NKGdldFZpZXcoYXRvbS53b3Jrc3BhY2UpKVxuICAgICAgICBzZXR0aW5ncy5zZXQoJ2hpZ2hsaWdodFNlYXJjaCcsIHRydWUpXG4gICAgICAgIGV4cGVjdCh2aW1TdGF0ZS5oaWdobGlnaHRTZWFyY2guaGFzTWFya2VycygpKS50b0JlKGZhbHNlKVxuICAgICAgICBlbnN1cmUgJy8gZGVmIGVudGVyJywgY3Vyc29yOiBbMSwgMF1cblxuICAgICAgZGVzY3JpYmUgXCJjbGVhckhpZ2hsaWdodFNlYXJjaCBjb21tYW5kXCIsIC0+XG4gICAgICAgIGl0IFwiY2xlYXIgaGlnaGxpZ2h0U2VhcmNoIG1hcmtlclwiLCAtPlxuICAgICAgICAgIGVuc3VyZUhpZ2h0bGlnaHRTZWFyY2ggbGVuZ3RoOiAyLCB0ZXh0OiBbXCJkZWZcIiwgXCJkZWZcIl0sIG1vZGU6ICdub3JtYWwnXG4gICAgICAgICAgZGlzcGF0Y2goZWRpdG9yRWxlbWVudCwgJ3ZpbS1tb2RlLXBsdXM6Y2xlYXItaGlnaGxpZ2h0LXNlYXJjaCcpXG4gICAgICAgICAgZXhwZWN0KHZpbVN0YXRlLmhpZ2hsaWdodFNlYXJjaC5oYXNNYXJrZXJzKCkpLnRvQmUoZmFsc2UpXG5cbiAgICAgIGRlc2NyaWJlIFwiY2xlYXJIaWdobGlnaHRTZWFyY2hPblJlc2V0Tm9ybWFsTW9kZVwiLCAtPlxuICAgICAgICBkZXNjcmliZSBcIndoZW4gZGlzYWJsZWRcIiwgLT5cbiAgICAgICAgICBpdCBcIml0IHdvbid0IGNsZWFyIGhpZ2hsaWdodFNlYXJjaFwiLCAtPlxuICAgICAgICAgICAgc2V0dGluZ3Muc2V0KCdjbGVhckhpZ2hsaWdodFNlYXJjaE9uUmVzZXROb3JtYWxNb2RlJywgZmFsc2UpXG4gICAgICAgICAgICBlbnN1cmVIaWdodGxpZ2h0U2VhcmNoIGxlbmd0aDogMiwgdGV4dDogW1wiZGVmXCIsIFwiZGVmXCJdLCBtb2RlOiAnbm9ybWFsJ1xuICAgICAgICAgICAgZW5zdXJlIFwiZXNjYXBlXCIsIG1vZGU6ICdub3JtYWwnXG4gICAgICAgICAgICBlbnN1cmVIaWdodGxpZ2h0U2VhcmNoIGxlbmd0aDogMiwgdGV4dDogW1wiZGVmXCIsIFwiZGVmXCJdLCBtb2RlOiAnbm9ybWFsJ1xuXG4gICAgICAgIGRlc2NyaWJlIFwid2hlbiBlbmFibGVkXCIsIC0+XG4gICAgICAgICAgaXQgXCJpdCBjbGVhciBoaWdobGlnaHRTZWFyY2ggb24gcmVzZXQtbm9ybWFsLW1vZGVcIiwgLT5cbiAgICAgICAgICAgIHNldHRpbmdzLnNldCgnY2xlYXJIaWdobGlnaHRTZWFyY2hPblJlc2V0Tm9ybWFsTW9kZScsIHRydWUpXG4gICAgICAgICAgICBlbnN1cmVIaWdodGxpZ2h0U2VhcmNoIGxlbmd0aDogMiwgdGV4dDogW1wiZGVmXCIsIFwiZGVmXCJdLCBtb2RlOiAnbm9ybWFsJ1xuICAgICAgICAgICAgZW5zdXJlIFwiZXNjYXBlXCIsIG1vZGU6ICdub3JtYWwnXG4gICAgICAgICAgICBleHBlY3QodmltU3RhdGUuaGlnaGxpZ2h0U2VhcmNoLmhhc01hcmtlcnMoKSkudG9CZShmYWxzZSlcbiAgICAgICAgICAgIGVuc3VyZSBtb2RlOiAnbm9ybWFsJ1xuXG4gIGRlc2NyaWJlIFwiSW5jcmVtZW50YWxTZWFyY2hcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBqYXNtaW5lLmF0dGFjaFRvRE9NKGdldFZpZXcoYXRvbS53b3Jrc3BhY2UpKVxuXG4gICAgZGVzY3JpYmUgXCJ3aXRoIG11bHRpcGxlLWN1cnNvcnNcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgMDogICAgYWJjXG4gICAgICAgICAgMTogICAgYWJjXG4gICAgICAgICAgMjogICAgYWJjXG4gICAgICAgICAgMzogICAgYWJjXG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgY3Vyc29yOiBbWzAsIDBdLCBbMSwgMF1dXG5cbiAgICAgIGl0IFwiW2ZvcndhcmRdIG1vdmUgZWFjaCBjdXJzb3IgdG8gbWF0Y2hcIiwgLT5cbiAgICAgICAgZW5zdXJlICcvIGFiYyBlbnRlcicsIGN1cnNvcjogW1swLCA2XSwgWzEsIDZdXVxuICAgICAgaXQgXCJbZm9yd2FyZDogY291bnQgc3BlY2lmaWVkXSwgbW92ZSBlYWNoIGN1cnNvciB0byBtYXRjaFwiLCAtPlxuICAgICAgICBlbnN1cmUgJzIgLyBhYmMgZW50ZXInLCBjdXJzb3I6IFtbMSwgNl0sIFsyLCA2XV1cblxuICAgICAgaXQgXCJbYmFja3dhcmRdIG1vdmUgZWFjaCBjdXJzb3IgdG8gbWF0Y2hcIiwgLT5cbiAgICAgICAgZW5zdXJlICc/IGFiYyBlbnRlcicsIGN1cnNvcjogW1szLCA2XSwgWzAsIDZdXVxuICAgICAgaXQgXCJbYmFja3dhcmQ6IGNvdW50IHNwZWNpZmllZF0gbW92ZSBlYWNoIGN1cnNvciB0byBtYXRjaFwiLCAtPlxuICAgICAgICBlbnN1cmUgJzIgPyBhYmMgZW50ZXInLCBjdXJzb3I6IFtbMiwgNl0sIFszLCA2XV1cblxuICAgIGRlc2NyaWJlIFwiYmxhbmsgaW5wdXQgcmVwZWF0IGxhc3Qgc2VhcmNoXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgIDA6ICAgIGFiY1xuICAgICAgICAgIDE6ICAgIGFiY1xuICAgICAgICAgIDI6ICAgIGFiY1xuICAgICAgICAgIDM6ICAgIGFiY1xuICAgICAgICAgIDQ6XG4gICAgICAgICAgXCJcIlwiXG5cbiAgICAgIGl0IFwiRG8gbm90aGluZyB3aGVuIHNlYXJjaCBoaXN0b3J5IGlzIGVtcHR5XCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFsyLCAxXVxuICAgICAgICBlbnN1cmUgJy8gIGVudGVyJywgY3Vyc29yOiBbMiwgMV1cbiAgICAgICAgZW5zdXJlICc/ICBlbnRlcicsIGN1cnNvcjogWzIsIDFdXG5cbiAgICAgIGl0IFwiUmVwZWF0IGZvcndhcmQgZGlyZWN0aW9uXCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFswLCAwXVxuICAgICAgICBlbnN1cmUgJy8gYWJjIGVudGVyJywgY3Vyc29yOiBbMCwgNl1cbiAgICAgICAgZW5zdXJlICcvICBlbnRlcicsIGN1cnNvcjogWzEsIDZdXG4gICAgICAgIGVuc3VyZSAnMiAvICBlbnRlcicsIGN1cnNvcjogWzMsIDZdXG5cbiAgICAgIGl0IFwiUmVwZWF0IGJhY2t3YXJkIGRpcmVjdGlvblwiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbNCwgMF1cbiAgICAgICAgZW5zdXJlICc/IGFiYyBlbnRlcicsIGN1cnNvcjogWzMsIDZdXG4gICAgICAgIGVuc3VyZSAnPyAgZW50ZXInLCBjdXJzb3I6IFsyLCA2XVxuICAgICAgICBlbnN1cmUgJzIgPyAgZW50ZXInLCBjdXJzb3I6IFswLCA2XVxuXG4gIGRlc2NyaWJlIFwidGhlICoga2V5YmluZGluZ1wiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNldFxuICAgICAgICB0ZXh0OiBcImFiZFxcbkBkZWZcXG5hYmRcXG5kZWZcXG5cIlxuICAgICAgICBjdXJzb3I6IFswLCAwXVxuXG4gICAgZGVzY3JpYmUgXCJhcyBhIG1vdGlvblwiLCAtPlxuICAgICAgaXQgXCJtb3ZlcyBjdXJzb3IgdG8gbmV4dCBvY2N1cnJlbmNlIG9mIHdvcmQgdW5kZXIgY3Vyc29yXCIsIC0+XG4gICAgICAgIGVuc3VyZSAnKicsIGN1cnNvcjogWzIsIDBdXG5cbiAgICAgIGl0IFwicmVwZWF0cyB3aXRoIHRoZSBuIGtleVwiLCAtPlxuICAgICAgICBlbnN1cmUgJyonLCBjdXJzb3I6IFsyLCAwXVxuICAgICAgICBlbnN1cmUgJ24nLCBjdXJzb3I6IFswLCAwXVxuXG4gICAgICBpdCBcImRvZXNuJ3QgbW92ZSBjdXJzb3IgdW5sZXNzIG5leHQgb2NjdXJyZW5jZSBpcyB0aGUgZXhhY3Qgd29yZCAobm8gcGFydGlhbCBtYXRjaGVzKVwiLCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0OiBcImFiY1xcbmRlZlxcbmdoaWFiY1xcbmprbFxcbmFiY2RlZlwiXG4gICAgICAgICAgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgZW5zdXJlICcqJywgY3Vyc29yOiBbMCwgMF1cblxuICAgICAgZGVzY3JpYmUgXCJ3aXRoIHdvcmRzIHRoYXQgY29udGFpbiAnbm9uLXdvcmQnIGNoYXJhY3RlcnNcIiwgLT5cbiAgICAgICAgaXQgXCJza2lwcyBub24td29yZC1jaGFyIHdoZW4gcGlja2luZyBjdXJzb3Itd29yZCB0aGVuIHBsYWNlIGN1cnNvciB0byBuZXh0IG9jY3VycmVuY2Ugb2Ygd29yZFwiLCAtPlxuICAgICAgICAgIHNldFxuICAgICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICBhYmNcbiAgICAgICAgICAgIEBkZWZcbiAgICAgICAgICAgIGFiY1xuICAgICAgICAgICAgQGRlZlxcblxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICBjdXJzb3I6IFsxLCAwXVxuICAgICAgICAgIGVuc3VyZSAnKicsIGN1cnNvcjogWzMsIDFdXG5cbiAgICAgICAgaXQgXCJkb2Vzbid0IG1vdmUgY3Vyc29yIHVubGVzcyBuZXh0IG1hdGNoIGhhcyBleGFjdCB3b3JkIGVuZGluZ1wiLCAtPlxuICAgICAgICAgIHNldFxuICAgICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICBhYmNcbiAgICAgICAgICAgIEBkZWZcbiAgICAgICAgICAgIGFiY1xuICAgICAgICAgICAgQGRlZjFcXG5cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgY3Vyc29yOiBbMSwgMV1cbiAgICAgICAgICBlbnN1cmUgJyonLCBjdXJzb3I6IFsxLCAxXVxuXG4gICAgICAgIGl0IFwibW92ZXMgY3Vyc29yIHRvIHRoZSBzdGFydCBvZiB2YWxpZCB3b3JkIGNoYXJcIiwgLT5cbiAgICAgICAgICBzZXRcbiAgICAgICAgICAgIHRleHQ6IFwiYWJjXFxuZGVmXFxuYWJjXFxuQGRlZlxcblwiXG4gICAgICAgICAgICBjdXJzb3I6IFsxLCAwXVxuICAgICAgICAgIGVuc3VyZSAnKicsIGN1cnNvcjogWzMsIDFdXG5cbiAgICAgIGRlc2NyaWJlIFwid2hlbiBjdXJzb3IgaXMgb24gbm9uLXdvcmQgY2hhciBjb2x1bW5cIiwgLT5cbiAgICAgICAgaXQgXCJtYXRjaGVzIG9ubHkgdGhlIG5vbi13b3JkIGNoYXJcIiwgLT5cbiAgICAgICAgICBzZXRcbiAgICAgICAgICAgIHRleHQ6IFwiYWJjXFxuQGRlZlxcbmFiY1xcbkBkZWZcXG5cIlxuICAgICAgICAgICAgY3Vyc29yOiBbMSwgMF1cbiAgICAgICAgICBlbnN1cmUgJyonLCBjdXJzb3I6IFszLCAxXVxuXG4gICAgICBkZXNjcmliZSBcIndoZW4gY3Vyc29yIGlzIG5vdCBvbiBhIHdvcmRcIiwgLT5cbiAgICAgICAgaXQgXCJkb2VzIGEgbWF0Y2ggd2l0aCB0aGUgbmV4dCB3b3JkXCIsIC0+XG4gICAgICAgICAgc2V0XG4gICAgICAgICAgICB0ZXh0OiBcImFiY1xcbmEgIEBkZWZcXG4gYWJjXFxuIEBkZWZcIlxuICAgICAgICAgICAgY3Vyc29yOiBbMSwgMV1cbiAgICAgICAgICBlbnN1cmUgJyonLCBjdXJzb3I6IFszLCAyXVxuXG4gICAgICBkZXNjcmliZSBcIndoZW4gY3Vyc29yIGlzIGF0IEVPRlwiLCAtPlxuICAgICAgICBpdCBcImRvZXNuJ3QgdHJ5IHRvIGRvIGFueSBtYXRjaFwiLCAtPlxuICAgICAgICAgIHNldFxuICAgICAgICAgICAgdGV4dDogXCJhYmNcXG5AZGVmXFxuYWJjXFxuIFwiXG4gICAgICAgICAgICBjdXJzb3I6IFszLCAwXVxuICAgICAgICAgIGVuc3VyZSAnKicsIGN1cnNvcjogWzMsIDBdXG5cbiAgICBkZXNjcmliZSBcImNhc2VTZW5zaXRpdml0eSBzZXR0aW5nXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgIGFiY1xuICAgICAgICAgIEFCQ1xuICAgICAgICAgIGFiQ1xuICAgICAgICAgIGFiY1xuICAgICAgICAgIEFCQ1xuICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIGN1cnNvcjogWzAsIDBdXG5cbiAgICAgIGl0IFwic2VhcmNoIGNhc2Ugc2Vuc2l0aXZlbHkgd2hlbiBgaWdub3JlQ2FzZUZvclNlYXJjaEN1cnJlbnRXb3JkYCBpcyBmYWxzZSg9ZGVmYXVsdClcIiwgLT5cbiAgICAgICAgZXhwZWN0KHNldHRpbmdzLmdldCgnaWdub3JlQ2FzZUZvclNlYXJjaEN1cnJlbnRXb3JkJykpLnRvQmUoZmFsc2UpXG4gICAgICAgIGVuc3VyZSAnKicsIGN1cnNvcjogWzMsIDBdXG4gICAgICAgIGVuc3VyZSAnbicsIGN1cnNvcjogWzAsIDBdXG5cbiAgICAgIGl0IFwic2VhcmNoIGNhc2UgaW5zZW5zaXRpdmVseSB3aGVuIGBpZ25vcmVDYXNlRm9yU2VhcmNoQ3VycmVudFdvcmRgIHRydWVcIiwgLT5cbiAgICAgICAgc2V0dGluZ3Muc2V0ICdpZ25vcmVDYXNlRm9yU2VhcmNoQ3VycmVudFdvcmQnLCB0cnVlXG4gICAgICAgIGVuc3VyZSAnKicsIGN1cnNvcjogWzEsIDBdXG4gICAgICAgIGVuc3VyZSAnbicsIGN1cnNvcjogWzIsIDBdXG4gICAgICAgIGVuc3VyZSAnbicsIGN1cnNvcjogWzMsIDBdXG4gICAgICAgIGVuc3VyZSAnbicsIGN1cnNvcjogWzQsIDBdXG5cbiAgICAgIGRlc2NyaWJlIFwidXNlU21hcnRjYXNlRm9yU2VhcmNoQ3VycmVudFdvcmQgaXMgZW5hYmxlZFwiLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgc2V0dGluZ3Muc2V0ICd1c2VTbWFydGNhc2VGb3JTZWFyY2hDdXJyZW50V29yZCcsIHRydWVcblxuICAgICAgICBpdCBcInNlYXJjaCBjYXNlIHNlbnNpdGl2ZWx5IHdoZW4gZW5hYmxlIGFuZCBzZWFyY2ggdGVybSBpbmNsdWRlcyB1cHBlcmNhc2VcIiwgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMSwgMF1cbiAgICAgICAgICBlbnN1cmUgJyonLCBjdXJzb3I6IFs0LCAwXVxuICAgICAgICAgIGVuc3VyZSAnbicsIGN1cnNvcjogWzEsIDBdXG5cbiAgICAgICAgaXQgXCJzZWFyY2ggY2FzZSBpbnNlbnNpdGl2ZWx5IHdoZW4gZW5hYmxlIGFuZCBzZWFyY2ggdGVybSBOT1QgaW5jbHVkZXMgdXBwZXJjYXNlXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzAsIDBdXG4gICAgICAgICAgZW5zdXJlICcqJywgY3Vyc29yOiBbMSwgMF1cbiAgICAgICAgICBlbnN1cmUgJ24nLCBjdXJzb3I6IFsyLCAwXVxuICAgICAgICAgIGVuc3VyZSAnbicsIGN1cnNvcjogWzMsIDBdXG4gICAgICAgICAgZW5zdXJlICduJywgY3Vyc29yOiBbNCwgMF1cblxuICBkZXNjcmliZSBcInRoZSBoYXNoIGtleWJpbmRpbmdcIiwgLT5cbiAgICBkZXNjcmliZSBcImFzIGEgbW90aW9uXCIsIC0+XG4gICAgICBpdCBcIm1vdmVzIGN1cnNvciB0byBwcmV2aW91cyBvY2N1cnJlbmNlIG9mIHdvcmQgdW5kZXIgY3Vyc29yXCIsIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHQ6IFwiYWJjXFxuQGRlZlxcbmFiY1xcbmRlZlxcblwiXG4gICAgICAgICAgY3Vyc29yOiBbMiwgMV1cbiAgICAgICAgZW5zdXJlICcjJywgY3Vyc29yOiBbMCwgMF1cblxuICAgICAgaXQgXCJyZXBlYXRzIHdpdGggblwiLCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0OiBcImFiY1xcbkBkZWZcXG5hYmNcXG5kZWZcXG5hYmNcXG5cIlxuICAgICAgICAgIGN1cnNvcjogWzIsIDFdXG4gICAgICAgIGVuc3VyZSAnIycsIGN1cnNvcjogWzAsIDBdXG4gICAgICAgIGVuc3VyZSAnbicsIGN1cnNvcjogWzQsIDBdXG4gICAgICAgIGVuc3VyZSAnbicsIGN1cnNvcjogWzIsIDBdXG5cbiAgICAgIGl0IFwiZG9lc24ndCBtb3ZlIGN1cnNvciB1bmxlc3MgbmV4dCBvY2N1cnJlbmNlIGlzIHRoZSBleGFjdCB3b3JkIChubyBwYXJ0aWFsIG1hdGNoZXMpXCIsIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHQ6IFwiYWJjXFxuZGVmXFxuZ2hpYWJjXFxuamtsXFxuYWJjZGVmXCJcbiAgICAgICAgICBjdXJzb3I6IFswLCAwXVxuICAgICAgICBlbnN1cmUgJyMnLCBjdXJzb3I6IFswLCAwXVxuXG4gICAgICBkZXNjcmliZSBcIndpdGggd29yZHMgdGhhdCBjb250YWludCAnbm9uLXdvcmQnIGNoYXJhY3RlcnNcIiwgLT5cbiAgICAgICAgaXQgXCJtb3ZlcyBjdXJzb3IgdG8gbmV4dCBvY2N1cnJlbmNlIG9mIHdvcmQgdW5kZXIgY3Vyc29yXCIsIC0+XG4gICAgICAgICAgc2V0XG4gICAgICAgICAgICB0ZXh0OiBcImFiY1xcbkBkZWZcXG5hYmNcXG5AZGVmXFxuXCJcbiAgICAgICAgICAgIGN1cnNvcjogWzMsIDBdXG4gICAgICAgICAgZW5zdXJlICcjJywgY3Vyc29yOiBbMSwgMV1cblxuICAgICAgICBpdCBcIm1vdmVzIGN1cnNvciB0byB0aGUgc3RhcnQgb2YgdmFsaWQgd29yZCBjaGFyXCIsIC0+XG4gICAgICAgICAgc2V0XG4gICAgICAgICAgICB0ZXh0OiBcImFiY1xcbkBkZWZcXG5hYmNcXG5kZWZcXG5cIlxuICAgICAgICAgICAgY3Vyc29yOiBbMywgMF1cbiAgICAgICAgICBlbnN1cmUgJyMnLCBjdXJzb3I6IFsxLCAxXVxuXG4gICAgICBkZXNjcmliZSBcIndoZW4gY3Vyc29yIGlzIG9uIG5vbi13b3JkIGNoYXIgY29sdW1uXCIsIC0+XG4gICAgICAgIGl0IFwibWF0Y2hlcyBvbmx5IHRoZSBub24td29yZCBjaGFyXCIsIC0+XG4gICAgICAgICAgc2V0XG4gICAgICAgICAgICB0ZXh0OiBcImFiY1xcbkBkZWZcXG5hYmNcXG5AZGVmXFxuXCJcbiAgICAgICAgICAgIGN1cnNvcjogWzEsIDBdXG4gICAgICAgICAgZW5zdXJlICcqJywgY3Vyc29yOiBbMywgMV1cblxuICAgIGRlc2NyaWJlIFwiY2FzZVNlbnNpdGl2aXR5IHNldHRpbmdcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgYWJjXG4gICAgICAgICAgQUJDXG4gICAgICAgICAgYWJDXG4gICAgICAgICAgYWJjXG4gICAgICAgICAgQUJDXG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgY3Vyc29yOiBbNCwgMF1cblxuICAgICAgaXQgXCJzZWFyY2ggY2FzZSBzZW5zaXRpdmVseSB3aGVuIGBpZ25vcmVDYXNlRm9yU2VhcmNoQ3VycmVudFdvcmRgIGlzIGZhbHNlKD1kZWZhdWx0KVwiLCAtPlxuICAgICAgICBleHBlY3Qoc2V0dGluZ3MuZ2V0KCdpZ25vcmVDYXNlRm9yU2VhcmNoQ3VycmVudFdvcmQnKSkudG9CZShmYWxzZSlcbiAgICAgICAgZW5zdXJlICcjJywgY3Vyc29yOiBbMSwgMF1cbiAgICAgICAgZW5zdXJlICduJywgY3Vyc29yOiBbNCwgMF1cblxuICAgICAgaXQgXCJzZWFyY2ggY2FzZSBpbnNlbnNpdGl2ZWx5IHdoZW4gYGlnbm9yZUNhc2VGb3JTZWFyY2hDdXJyZW50V29yZGAgdHJ1ZVwiLCAtPlxuICAgICAgICBzZXR0aW5ncy5zZXQgJ2lnbm9yZUNhc2VGb3JTZWFyY2hDdXJyZW50V29yZCcsIHRydWVcbiAgICAgICAgZW5zdXJlICcjJywgY3Vyc29yOiBbMywgMF1cbiAgICAgICAgZW5zdXJlICduJywgY3Vyc29yOiBbMiwgMF1cbiAgICAgICAgZW5zdXJlICduJywgY3Vyc29yOiBbMSwgMF1cbiAgICAgICAgZW5zdXJlICduJywgY3Vyc29yOiBbMCwgMF1cblxuICAgICAgZGVzY3JpYmUgXCJ1c2VTbWFydGNhc2VGb3JTZWFyY2hDdXJyZW50V29yZCBpcyBlbmFibGVkXCIsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBzZXR0aW5ncy5zZXQgJ3VzZVNtYXJ0Y2FzZUZvclNlYXJjaEN1cnJlbnRXb3JkJywgdHJ1ZVxuXG4gICAgICAgIGl0IFwic2VhcmNoIGNhc2Ugc2Vuc2l0aXZlbHkgd2hlbiBlbmFibGUgYW5kIHNlYXJjaCB0ZXJtIGluY2x1ZGVzIHVwcGVyY2FzZVwiLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFs0LCAwXVxuICAgICAgICAgIGVuc3VyZSAnIycsIGN1cnNvcjogWzEsIDBdXG4gICAgICAgICAgZW5zdXJlICduJywgY3Vyc29yOiBbNCwgMF1cblxuICAgICAgICBpdCBcInNlYXJjaCBjYXNlIGluc2Vuc2l0aXZlbHkgd2hlbiBlbmFibGUgYW5kIHNlYXJjaCB0ZXJtIE5PVCBpbmNsdWRlcyB1cHBlcmNhc2VcIiwgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgICBlbnN1cmUgJyMnLCBjdXJzb3I6IFs0LCAwXVxuICAgICAgICAgIGVuc3VyZSAnbicsIGN1cnNvcjogWzMsIDBdXG4gICAgICAgICAgZW5zdXJlICduJywgY3Vyc29yOiBbMiwgMF1cbiAgICAgICAgICBlbnN1cmUgJ24nLCBjdXJzb3I6IFsxLCAwXVxuICAgICAgICAgIGVuc3VyZSAnbicsIGN1cnNvcjogWzAsIDBdXG5cbiAgIyBGSVhNRTogTm8gbG9uZ2VyIGNoaWxkIG9mIHNlYXJjaCBzbyBtb3ZlIHRvIG1vdGlvbi1nZW5lcmFsLXNwZWMuY29mZmU/XG4gIGRlc2NyaWJlICd0aGUgJSBtb3Rpb24nLCAtPlxuICAgIGRlc2NyaWJlIFwiUGFyZW50aGVzaXNcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0IHRleHQ6IFwiKF9fXylcIlxuICAgICAgZGVzY3JpYmUgXCJhcyBvcGVyYXRvciB0YXJnZXRcIiwgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIHNldCB0ZXh0OiBcIihfKF8pXylcIlxuICAgICAgICBpdCAnYmVoYXZlIGluY2x1c2l2ZWx5IHdoZW4gaXMgYXQgb3BlbiBwYWlyJywgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMl1cbiAgICAgICAgICBlbnN1cmUgJ2QgJScsIHRleHQ6IFwiKF9fKVwiXG4gICAgICAgIGl0ICdiZWhhdmUgaW5jbHVzaXZlbHkgd2hlbiBpcyBhdCBvcGVuIHBhaXInLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFswLCA0XVxuICAgICAgICAgIGVuc3VyZSAnZCAlJywgdGV4dDogXCIoX18pXCJcbiAgICAgIGRlc2NyaWJlIFwiY3Vyc29yIGlzIGF0IHBhaXIgY2hhclwiLCAtPlxuICAgICAgICBpdCBcImN1cnNvciBpcyBhdCBvcGVuIHBhaXIsIGl0IG1vdmUgdG8gY2xvc2luZyBwYWlyXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzAsIDBdXG4gICAgICAgICAgZW5zdXJlICclJywgY3Vyc29yOiBbMCwgNF1cbiAgICAgICAgICBlbnN1cmUgJyUnLCBjdXJzb3I6IFswLCAwXVxuICAgICAgICBpdCBcImN1cnNvciBpcyBhdCBjbG9zZSBwYWlyLCBpdCBtb3ZlIHRvIG9wZW4gcGFpclwiLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFswLCA0XVxuICAgICAgICAgIGVuc3VyZSAnJScsIGN1cnNvcjogWzAsIDBdXG4gICAgICAgICAgZW5zdXJlICclJywgY3Vyc29yOiBbMCwgNF1cbiAgICAgIGRlc2NyaWJlIFwiY3Vyc29yIGlzIGVuY2xvc2VkIGJ5IHBhaXJcIiwgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIHNldFxuICAgICAgICAgICAgdGV4dDogXCIoX19fKVwiLFxuICAgICAgICAgICAgY3Vyc29yOiBbMCwgMl1cbiAgICAgICAgaXQgXCJtb3ZlIHRvIG9wZW4gcGFpclwiLCAtPlxuICAgICAgICAgIGVuc3VyZSAnJScsIGN1cnNvcjogWzAsIDBdXG4gICAgICBkZXNjcmliZSBcImN1cnNvciBpcyBib2ZvcmUgb3BlbiBwYWlyXCIsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBzZXRcbiAgICAgICAgICAgIHRleHQ6IFwiX18oX19fKVwiLFxuICAgICAgICAgICAgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgaXQgXCJtb3ZlIHRvIG9wZW4gcGFpclwiLCAtPlxuICAgICAgICAgIGVuc3VyZSAnJScsIGN1cnNvcjogWzAsIDZdXG4gICAgICBkZXNjcmliZSBcImN1cnNvciBpcyBhZnRlciBjbG9zZSBwYWlyXCIsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBzZXRcbiAgICAgICAgICAgIHRleHQ6IFwiX18oX19fKV9fXCIsXG4gICAgICAgICAgICBjdXJzb3I6IFswLCA3XVxuICAgICAgICBpdCBcImZhaWwgdG8gbW92ZVwiLCAtPlxuICAgICAgICAgIGVuc3VyZSAnJScsIGN1cnNvcjogWzAsIDddXG4gICAgICBkZXNjcmliZSBcIm11bHRpIGxpbmVcIiwgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIHNldFxuICAgICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICBfX19cbiAgICAgICAgICAgIF9fXyhfX1xuICAgICAgICAgICAgX19fXG4gICAgICAgICAgICBfX18pXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgZGVzY3JpYmUgXCJ3aGVuIG9wZW4gYW5kIGNsb3NlIHBhaXIgaXMgbm90IGF0IGN1cnNvciBsaW5lXCIsIC0+XG4gICAgICAgICAgaXQgXCJmYWlsIHRvIG1vdmVcIiwgLT5cbiAgICAgICAgICAgIHNldCBjdXJzb3I6IFswLCAwXVxuICAgICAgICAgICAgZW5zdXJlICclJywgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgICBpdCBcImZhaWwgdG8gbW92ZVwiLCAtPlxuICAgICAgICAgICAgc2V0IGN1cnNvcjogWzIsIDBdXG4gICAgICAgICAgICBlbnN1cmUgJyUnLCBjdXJzb3I6IFsyLCAwXVxuICAgICAgICBkZXNjcmliZSBcIndoZW4gb3BlbiBwYWlyIGlzIGZvcndhcmRpbmcgdG8gY3Vyc29yIGluIHNhbWUgcm93XCIsIC0+XG4gICAgICAgICAgaXQgXCJtb3ZlIHRvIGNsb3NpbmcgcGFpclwiLCAtPlxuICAgICAgICAgICAgc2V0IGN1cnNvcjogWzEsIDBdXG4gICAgICAgICAgICBlbnN1cmUgJyUnLCBjdXJzb3I6IFszLCAzXVxuICAgICAgICBkZXNjcmliZSBcIndoZW4gY3Vyc29yIHBvc2l0aW9uIGlzIGdyZWF0ZXIgdGhhbiBvcGVuIHBhaXJcIiwgLT5cbiAgICAgICAgICBpdCBcImZhaWwgdG8gbW92ZVwiLCAtPlxuICAgICAgICAgICAgc2V0IGN1cnNvcjogWzEsIDRdXG4gICAgICAgICAgICBlbnN1cmUgJyUnLCBjdXJzb3I6IFsxLCA0XVxuICAgICAgICBkZXNjcmliZSBcIndoZW4gY2xvc2UgcGFpciBpcyBmb3J3YXJkaW5nIHRvIGN1cnNvciBpbiBzYW1lIHJvd1wiLCAtPlxuICAgICAgICAgIGl0IFwibW92ZSB0byBjbG9zaW5nIHBhaXJcIiwgLT5cbiAgICAgICAgICAgIHNldCBjdXJzb3I6IFszLCAwXVxuICAgICAgICAgICAgZW5zdXJlICclJywgY3Vyc29yOiBbMSwgM11cblxuICAgIGRlc2NyaWJlIFwiQ3VybHlCcmFja2V0XCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldCB0ZXh0OiBcIntfX199XCJcbiAgICAgIGl0IFwiY3Vyc29yIGlzIGF0IG9wZW4gcGFpciwgaXQgbW92ZSB0byBjbG9zaW5nIHBhaXJcIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzAsIDBdXG4gICAgICAgIGVuc3VyZSAnJScsIGN1cnNvcjogWzAsIDRdXG4gICAgICAgIGVuc3VyZSAnJScsIGN1cnNvcjogWzAsIDBdXG4gICAgICBpdCBcImN1cnNvciBpcyBhdCBjbG9zZSBwYWlyLCBpdCBtb3ZlIHRvIG9wZW4gcGFpclwiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMCwgNF1cbiAgICAgICAgZW5zdXJlICclJywgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgZW5zdXJlICclJywgY3Vyc29yOiBbMCwgNF1cblxuICAgIGRlc2NyaWJlIFwiU3F1YXJlQnJhY2tldFwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXQgdGV4dDogXCJbX19fXVwiXG4gICAgICBpdCBcImN1cnNvciBpcyBhdCBvcGVuIHBhaXIsIGl0IG1vdmUgdG8gY2xvc2luZyBwYWlyXCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFswLCAwXVxuICAgICAgICBlbnN1cmUgJyUnLCBjdXJzb3I6IFswLCA0XVxuICAgICAgICBlbnN1cmUgJyUnLCBjdXJzb3I6IFswLCAwXVxuICAgICAgaXQgXCJjdXJzb3IgaXMgYXQgY2xvc2UgcGFpciwgaXQgbW92ZSB0byBvcGVuIHBhaXJcIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzAsIDRdXG4gICAgICAgIGVuc3VyZSAnJScsIGN1cnNvcjogWzAsIDBdXG4gICAgICAgIGVuc3VyZSAnJScsIGN1cnNvcjogWzAsIDRdXG5cbiAgICBkZXNjcmliZSBcImNvbXBsZXggc2l0dWF0aW9uXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgIChfX19fXylfX3tfX1tfX19dX199XG4gICAgICAgICAgX1xuICAgICAgICAgIFwiXCJcIlxuICAgICAgaXQgJ21vdmUgdG8gY2xvc2luZyBwYWlyIHdoaWNoIG9wZW4gcGFpciBjb21lIGZpcnN0JywgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzAsIDddXG4gICAgICAgIGVuc3VyZSAnJScsIGN1cnNvcjogWzAsIDE5XVxuICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMTBdXG4gICAgICAgIGVuc3VyZSAnJScsIGN1cnNvcjogWzAsIDE2XVxuICAgICAgaXQgJ2VuY2xvc2luZyBwYWlyIGlzIHByaW9yaXRpemVkIG92ZXIgZm9yd2FyZGluZyByYW5nZScsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFswLCAyXVxuICAgICAgICBlbnN1cmUgJyUnLCBjdXJzb3I6IFswLCAwXVxuXG4gICAgZGVzY3JpYmUgXCJjb21wbGV4IHNpdHVhdGlvbiB3aXRoIGh0bWwgdGFnXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICA8c3Bhbj5cbiAgICAgICAgICAgICAgc29tZSB0ZXh0XG4gICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgXCJcIlwiXG4gICAgICBpdCAnbW92ZSB0byBwYWlyIHRhZyBvbmx5IHdoZW4gY3Vyc29yIGlzIG9uIG9wZW4gb3IgY2xvc2UgdGFnIGJ1dCBub3Qgb24gQW5nbGVCcmFja2V0KDwsID4pJywgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzAsIDFdOyBlbnN1cmUgJyUnLCBjdXJzb3I6IFs0LCAxXVxuICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMl07IGVuc3VyZSAnJScsIGN1cnNvcjogWzQsIDFdXG4gICAgICAgIHNldCBjdXJzb3I6IFswLCAzXTsgZW5zdXJlICclJywgY3Vyc29yOiBbNCwgMV1cblxuICAgICAgICBzZXQgY3Vyc29yOiBbNCwgMV07IGVuc3VyZSAnJScsIGN1cnNvcjogWzAsIDFdXG4gICAgICAgIHNldCBjdXJzb3I6IFs0LCAyXTsgZW5zdXJlICclJywgY3Vyc29yOiBbMCwgMV1cbiAgICAgICAgc2V0IGN1cnNvcjogWzQsIDNdOyBlbnN1cmUgJyUnLCBjdXJzb3I6IFswLCAxXVxuICAgICAgICBzZXQgY3Vyc29yOiBbNCwgNF07IGVuc3VyZSAnJScsIGN1cnNvcjogWzAsIDFdXG4iXX0=
