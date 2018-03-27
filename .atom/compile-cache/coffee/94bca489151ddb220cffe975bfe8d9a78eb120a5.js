(function() {
  var AnyBracket, BracketMatchingMotion, CloseBrackets, Input, MotionWithInput, OpenBrackets, Point, Range, RepeatSearch, Search, SearchBase, SearchCurrentWord, SearchViewModel, settings, _, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ = require('underscore-plus');

  MotionWithInput = require('./general-motions').MotionWithInput;

  SearchViewModel = require('../view-models/search-view-model');

  Input = require('../view-models/view-model').Input;

  _ref = require('atom'), Point = _ref.Point, Range = _ref.Range;

  settings = require('../settings');

  SearchBase = (function(_super) {
    __extends(SearchBase, _super);

    function SearchBase(editor, vimState, options) {
      this.editor = editor;
      this.vimState = vimState;
      if (options == null) {
        options = {};
      }
      this.reversed = __bind(this.reversed, this);
      SearchBase.__super__.constructor.call(this, this.editor, this.vimState);
      this.reverse = this.initiallyReversed = false;
      if (!options.dontUpdateCurrentSearch) {
        this.updateCurrentSearch();
      }
    }

    SearchBase.prototype.reversed = function() {
      this.initiallyReversed = this.reverse = true;
      this.updateCurrentSearch();
      return this;
    };

    SearchBase.prototype.moveCursor = function(cursor, count) {
      var range, ranges;
      if (count == null) {
        count = 1;
      }
      ranges = this.scan(cursor);
      if (ranges.length > 0) {
        range = ranges[(count - 1) % ranges.length];
        return cursor.setBufferPosition(range.start);
      } else {
        return atom.beep();
      }
    };

    SearchBase.prototype.scan = function(cursor) {
      var currentPosition, rangesAfter, rangesBefore, _ref1;
      if (this.input.characters === "") {
        return [];
      }
      currentPosition = cursor.getBufferPosition();
      _ref1 = [[], []], rangesBefore = _ref1[0], rangesAfter = _ref1[1];
      this.editor.scan(this.getSearchTerm(this.input.characters), (function(_this) {
        return function(_arg) {
          var isBefore, range;
          range = _arg.range;
          isBefore = _this.reverse ? range.start.compare(currentPosition) < 0 : range.start.compare(currentPosition) <= 0;
          if (isBefore) {
            return rangesBefore.push(range);
          } else {
            return rangesAfter.push(range);
          }
        };
      })(this));
      if (this.reverse) {
        return rangesAfter.concat(rangesBefore).reverse();
      } else {
        return rangesAfter.concat(rangesBefore);
      }
    };

    SearchBase.prototype.getSearchTerm = function(term) {
      var modFlags, modifiers;
      modifiers = {
        'g': true
      };
      if (!term.match('[A-Z]') && settings.useSmartcaseForSearch()) {
        modifiers['i'] = true;
      }
      if (term.indexOf('\\c') >= 0) {
        term = term.replace('\\c', '');
        modifiers['i'] = true;
      }
      modFlags = Object.keys(modifiers).join('');
      try {
        return new RegExp(term, modFlags);
      } catch (_error) {
        return new RegExp(_.escapeRegExp(term), modFlags);
      }
    };

    SearchBase.prototype.updateCurrentSearch = function() {
      this.vimState.globalVimState.currentSearch.reverse = this.reverse;
      return this.vimState.globalVimState.currentSearch.initiallyReversed = this.initiallyReversed;
    };

    SearchBase.prototype.replicateCurrentSearch = function() {
      this.reverse = this.vimState.globalVimState.currentSearch.reverse;
      return this.initiallyReversed = this.vimState.globalVimState.currentSearch.initiallyReversed;
    };

    return SearchBase;

  })(MotionWithInput);

  Search = (function(_super) {
    __extends(Search, _super);

    function Search(editor, vimState) {
      this.editor = editor;
      this.vimState = vimState;
      this.reversed = __bind(this.reversed, this);
      Search.__super__.constructor.call(this, this.editor, this.vimState);
      this.viewModel = new SearchViewModel(this);
      this.updateViewModel();
    }

    Search.prototype.reversed = function() {
      this.initiallyReversed = this.reverse = true;
      this.updateCurrentSearch();
      this.updateViewModel();
      return this;
    };

    Search.prototype.updateViewModel = function() {
      return this.viewModel.update(this.initiallyReversed);
    };

    return Search;

  })(SearchBase);

  SearchCurrentWord = (function(_super) {
    __extends(SearchCurrentWord, _super);

    SearchCurrentWord.keywordRegex = null;

    function SearchCurrentWord(editor, vimState) {
      var defaultIsKeyword, searchString, userIsKeyword;
      this.editor = editor;
      this.vimState = vimState;
      SearchCurrentWord.__super__.constructor.call(this, this.editor, this.vimState);
      defaultIsKeyword = "[@a-zA-Z0-9_\-]+";
      userIsKeyword = atom.config.get('vim-mode.iskeyword');
      this.keywordRegex = new RegExp(userIsKeyword || defaultIsKeyword);
      searchString = this.getCurrentWordMatch();
      this.input = new Input(searchString);
      if (searchString !== this.vimState.getSearchHistoryItem()) {
        this.vimState.pushSearchHistory(searchString);
      }
    }

    SearchCurrentWord.prototype.getCurrentWord = function() {
      var cursor, cursorPosition, wordEnd, wordStart;
      cursor = this.editor.getLastCursor();
      wordStart = cursor.getBeginningOfCurrentWordBufferPosition({
        wordRegex: this.keywordRegex,
        allowPrevious: false
      });
      wordEnd = cursor.getEndOfCurrentWordBufferPosition({
        wordRegex: this.keywordRegex,
        allowNext: false
      });
      cursorPosition = cursor.getBufferPosition();
      if (wordEnd.column === cursorPosition.column) {
        wordEnd = cursor.getEndOfCurrentWordBufferPosition({
          wordRegex: this.keywordRegex,
          allowNext: true
        });
        if (wordEnd.row !== cursorPosition.row) {
          return "";
        }
        cursor.setBufferPosition(wordEnd);
        wordStart = cursor.getBeginningOfCurrentWordBufferPosition({
          wordRegex: this.keywordRegex,
          allowPrevious: false
        });
      }
      cursor.setBufferPosition(wordStart);
      return this.editor.getTextInBufferRange([wordStart, wordEnd]);
    };

    SearchCurrentWord.prototype.cursorIsOnEOF = function(cursor) {
      var eofPos, pos;
      pos = cursor.getNextWordBoundaryBufferPosition({
        wordRegex: this.keywordRegex
      });
      eofPos = this.editor.getEofBufferPosition();
      return pos.row === eofPos.row && pos.column === eofPos.column;
    };

    SearchCurrentWord.prototype.getCurrentWordMatch = function() {
      var characters;
      characters = this.getCurrentWord();
      if (characters.length > 0) {
        if (/\W/.test(characters)) {
          return "" + characters + "\\b";
        } else {
          return "\\b" + characters + "\\b";
        }
      } else {
        return characters;
      }
    };

    SearchCurrentWord.prototype.isComplete = function() {
      return true;
    };

    SearchCurrentWord.prototype.execute = function(count) {
      if (count == null) {
        count = 1;
      }
      if (this.input.characters.length > 0) {
        return SearchCurrentWord.__super__.execute.call(this, count);
      }
    };

    return SearchCurrentWord;

  })(SearchBase);

  OpenBrackets = ['(', '{', '['];

  CloseBrackets = [')', '}', ']'];

  AnyBracket = new RegExp(OpenBrackets.concat(CloseBrackets).map(_.escapeRegExp).join("|"));

  BracketMatchingMotion = (function(_super) {
    __extends(BracketMatchingMotion, _super);

    function BracketMatchingMotion() {
      return BracketMatchingMotion.__super__.constructor.apply(this, arguments);
    }

    BracketMatchingMotion.prototype.operatesInclusively = true;

    BracketMatchingMotion.prototype.isComplete = function() {
      return true;
    };

    BracketMatchingMotion.prototype.searchForMatch = function(startPosition, reverse, inCharacter, outCharacter) {
      var character, depth, eofPosition, increment, lineLength, point;
      depth = 0;
      point = startPosition.copy();
      lineLength = this.editor.lineTextForBufferRow(point.row).length;
      eofPosition = this.editor.getEofBufferPosition().translate([0, 1]);
      increment = reverse ? -1 : 1;
      while (true) {
        character = this.characterAt(point);
        if (character === inCharacter) {
          depth++;
        }
        if (character === outCharacter) {
          depth--;
        }
        if (depth === 0) {
          return point;
        }
        point.column += increment;
        if (depth < 0) {
          return null;
        }
        if (point.isEqual([0, -1])) {
          return null;
        }
        if (point.isEqual(eofPosition)) {
          return null;
        }
        if (point.column < 0) {
          point.row--;
          lineLength = this.editor.lineTextForBufferRow(point.row).length;
          point.column = lineLength - 1;
        } else if (point.column >= lineLength) {
          point.row++;
          lineLength = this.editor.lineTextForBufferRow(point.row).length;
          point.column = 0;
        }
      }
    };

    BracketMatchingMotion.prototype.characterAt = function(position) {
      return this.editor.getTextInBufferRange([position, position.translate([0, 1])]);
    };

    BracketMatchingMotion.prototype.getSearchData = function(position) {
      var character, index;
      character = this.characterAt(position);
      if ((index = OpenBrackets.indexOf(character)) >= 0) {
        return [character, CloseBrackets[index], false];
      } else if ((index = CloseBrackets.indexOf(character)) >= 0) {
        return [character, OpenBrackets[index], true];
      } else {
        return [];
      }
    };

    BracketMatchingMotion.prototype.moveCursor = function(cursor) {
      var inCharacter, matchPosition, outCharacter, restOfLine, reverse, startPosition, _ref1, _ref2;
      startPosition = cursor.getBufferPosition();
      _ref1 = this.getSearchData(startPosition), inCharacter = _ref1[0], outCharacter = _ref1[1], reverse = _ref1[2];
      if (inCharacter == null) {
        restOfLine = [startPosition, [startPosition.row, Infinity]];
        this.editor.scanInBufferRange(AnyBracket, restOfLine, function(_arg) {
          var range, stop;
          range = _arg.range, stop = _arg.stop;
          startPosition = range.start;
          return stop();
        });
      }
      _ref2 = this.getSearchData(startPosition), inCharacter = _ref2[0], outCharacter = _ref2[1], reverse = _ref2[2];
      if (inCharacter == null) {
        return;
      }
      if (matchPosition = this.searchForMatch(startPosition, reverse, inCharacter, outCharacter)) {
        return cursor.setBufferPosition(matchPosition);
      }
    };

    return BracketMatchingMotion;

  })(SearchBase);

  RepeatSearch = (function(_super) {
    __extends(RepeatSearch, _super);

    function RepeatSearch(editor, vimState) {
      var _ref1;
      this.editor = editor;
      this.vimState = vimState;
      RepeatSearch.__super__.constructor.call(this, this.editor, this.vimState, {
        dontUpdateCurrentSearch: true
      });
      this.input = new Input((_ref1 = this.vimState.getSearchHistoryItem(0)) != null ? _ref1 : "");
      this.replicateCurrentSearch();
    }

    RepeatSearch.prototype.isComplete = function() {
      return true;
    };

    RepeatSearch.prototype.reversed = function() {
      this.reverse = !this.initiallyReversed;
      return this;
    };

    return RepeatSearch;

  })(SearchBase);

  module.exports = {
    Search: Search,
    SearchCurrentWord: SearchCurrentWord,
    BracketMatchingMotion: BracketMatchingMotion,
    RepeatSearch: RepeatSearch
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUvbGliL21vdGlvbnMvc2VhcmNoLW1vdGlvbi5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsNkxBQUE7SUFBQTs7bVNBQUE7O0FBQUEsRUFBQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSLENBQUosQ0FBQTs7QUFBQSxFQUNDLGtCQUFtQixPQUFBLENBQVEsbUJBQVIsRUFBbkIsZUFERCxDQUFBOztBQUFBLEVBRUEsZUFBQSxHQUFrQixPQUFBLENBQVEsa0NBQVIsQ0FGbEIsQ0FBQTs7QUFBQSxFQUdDLFFBQVMsT0FBQSxDQUFRLDJCQUFSLEVBQVQsS0FIRCxDQUFBOztBQUFBLEVBSUEsT0FBaUIsT0FBQSxDQUFRLE1BQVIsQ0FBakIsRUFBQyxhQUFBLEtBQUQsRUFBUSxhQUFBLEtBSlIsQ0FBQTs7QUFBQSxFQUtBLFFBQUEsR0FBVyxPQUFBLENBQVEsYUFBUixDQUxYLENBQUE7O0FBQUEsRUFPTTtBQUNKLGlDQUFBLENBQUE7O0FBQWEsSUFBQSxvQkFBRSxNQUFGLEVBQVcsUUFBWCxFQUFxQixPQUFyQixHQUFBO0FBQ1gsTUFEWSxJQUFDLENBQUEsU0FBQSxNQUNiLENBQUE7QUFBQSxNQURxQixJQUFDLENBQUEsV0FBQSxRQUN0QixDQUFBOztRQURnQyxVQUFVO09BQzFDO0FBQUEsaURBQUEsQ0FBQTtBQUFBLE1BQUEsNENBQU0sSUFBQyxDQUFBLE1BQVAsRUFBZSxJQUFDLENBQUEsUUFBaEIsQ0FBQSxDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsT0FBRCxHQUFXLElBQUMsQ0FBQSxpQkFBRCxHQUFxQixLQURoQyxDQUFBO0FBRUEsTUFBQSxJQUFBLENBQUEsT0FBcUMsQ0FBQyx1QkFBdEM7QUFBQSxRQUFBLElBQUMsQ0FBQSxt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

//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/vim-mode/lib/motions/search-motion.coffee
