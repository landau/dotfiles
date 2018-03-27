(function() {
  var Motion, Search, SearchBackwards, SearchBase, SearchCurrentWord, SearchCurrentWordBackwards, SearchModel, _, getNonWordCharactersForCursor, ref, saveEditorState, searchByProjectFind,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  _ = require('underscore-plus');

  ref = require('./utils'), saveEditorState = ref.saveEditorState, getNonWordCharactersForCursor = ref.getNonWordCharactersForCursor, searchByProjectFind = ref.searchByProjectFind;

  SearchModel = require('./search-model');

  Motion = require('./base').getClass('Motion');

  SearchBase = (function(superClass) {
    extend(SearchBase, superClass);

    function SearchBase() {
      return SearchBase.__super__.constructor.apply(this, arguments);
    }

    SearchBase.extend(false);

    SearchBase.prototype.jump = true;

    SearchBase.prototype.backwards = false;

    SearchBase.prototype.useRegexp = true;

    SearchBase.prototype.configScope = null;

    SearchBase.prototype.landingPoint = null;

    SearchBase.prototype.defaultLandingPoint = 'start';

    SearchBase.prototype.relativeIndex = null;

    SearchBase.prototype.updatelastSearchPattern = true;

    SearchBase.prototype.isBackwards = function() {
      return this.backwards;
    };

    SearchBase.prototype.isIncrementalSearch = function() {
      return this["instanceof"]('Search') && !this.isRepeated() && this.getConfig('incrementalSearch');
    };

    SearchBase.prototype.initialize = function() {
      SearchBase.__super__.initialize.apply(this, arguments);
      return this.onDidFinishOperation((function(_this) {
        return function() {
          return _this.finish();
        };
      })(this));
    };

    SearchBase.prototype.getCount = function() {
      var count;
      count = SearchBase.__super__.getCount.apply(this, arguments);
      if (this.isBackwards()) {
        return -count;
      } else {
        return count;
      }
    };

    SearchBase.prototype.getCaseSensitivity = function() {
      if (this.getConfig("useSmartcaseFor" + this.configScope)) {
        return 'smartcase';
      } else if (this.getConfig("ignoreCaseFor" + this.configScope)) {
        return 'insensitive';
      } else {
        return 'sensitive';
      }
    };

    SearchBase.prototype.isCaseSensitive = function(term) {
      switch (this.getCaseSensitivity()) {
        case 'smartcase':
          return term.search('[A-Z]') !== -1;
        case 'insensitive':
          return false;
        case 'sensitive':
          return true;
      }
    };

    SearchBase.prototype.finish = function() {
      var ref1;
      if (this.isIncrementalSearch() && this.getConfig('showHoverSearchCounter')) {
        this.vimState.hoverSearchCounter.reset();
      }
      this.relativeIndex = null;
      if ((ref1 = this.searchModel) != null) {
        ref1.destroy();
      }
      return this.searchModel = null;
    };

    SearchBase.prototype.getLandingPoint = function() {
      return this.landingPoint != null ? this.landingPoint : this.landingPoint = this.defaultLandingPoint;
    };

    SearchBase.prototype.getPoint = function(cursor) {
      var point, range;
      if (this.searchModel != null) {
        this.relativeIndex = this.getCount() + this.searchModel.getRelativeIndex();
      } else {
        if (this.relativeIndex == null) {
          this.relativeIndex = this.getCount();
        }
      }
      if (range = this.search(cursor, this.input, this.relativeIndex)) {
        point = range[this.getLandingPoint()];
      }
      this.searchModel.destroy();
      this.searchModel = null;
      return point;
    };

    SearchBase.prototype.moveCursor = function(cursor) {
      var input, point;
      input = this.getInput();
      if (!input) {
        return;
      }
      if (point = this.getPoint(cursor)) {
        cursor.setBufferPosition(point, {
          autoscroll: false
        });
      }
      if (!this.isRepeated()) {
        this.globalState.set('currentSearch', this);
        this.vimState.searchHistory.save(input);
      }
      if (this.updatelastSearchPattern) {
        return this.globalState.set('lastSearchPattern', this.getPattern(input));
      }
    };

    SearchBase.prototype.getSearchModel = function() {
      return this.searchModel != null ? this.searchModel : this.searchModel = new SearchModel(this.vimState, {
        incrementalSearch: this.isIncrementalSearch()
      });
    };

    SearchBase.prototype.search = function(cursor, input, relativeIndex) {
      var fromPoint, searchModel;
      searchModel = this.getSearchModel();
      if (input) {
        fromPoint = this.getBufferPositionForCursor(cursor);
        return searchModel.search(fromPoint, this.getPattern(input), relativeIndex);
      } else {
        this.vimState.hoverSearchCounter.reset();
        return searchModel.clearMarkers();
      }
    };

    return SearchBase;

  })(Motion);

  Search = (function(superClass) {
    extend(Search, superClass);

    function Search() {
      this.handleConfirmSearch = bind(this.handleConfirmSearch, this);
      return Search.__super__.constructor.apply(this, arguments);
    }

    Search.extend();

    Search.prototype.configScope = "Search";

    Search.prototype.requireInput = true;

    Search.prototype.initialize = function() {
      Search.__super__.initialize.apply(this, arguments);
      if (this.isComplete()) {
        return;
      }
      if (this.isIncrementalSearch()) {
        this.restoreEditorState = saveEditorState(this.editor);
        this.onDidCommandSearch(this.handleCommandEvent.bind(this));
      }
      this.onDidConfirmSearch(this.handleConfirmSearch.bind(this));
      this.onDidCancelSearch(this.handleCancelSearch.bind(this));
      this.onDidChangeSearch(this.handleChangeSearch.bind(this));
      return this.focusSearchInputEditor();
    };

    Search.prototype.focusSearchInputEditor = function() {
      var classList;
      classList = [];
      if (this.backwards) {
        classList.push('backwards');
      }
      return this.vimState.searchInput.focus({
        classList: classList
      });
    };

    Search.prototype.handleCommandEvent = function(commandEvent) {
      var direction, input, operation;
      if (!commandEvent.input) {
        return;
      }
      switch (commandEvent.name) {
        case 'visit':
          direction = commandEvent.direction;
          if (this.isBackwards() && this.getConfig('incrementalSearchVisitDirection') === 'relative') {
            direction = (function() {
              switch (direction) {
                case 'next':
                  return 'prev';
                case 'prev':
                  return 'next';
              }
            })();
          }
          switch (direction) {
            case 'next':
              return this.getSearchModel().visit(+1);
            case 'prev':
              return this.getSearchModel().visit(-1);
          }
          break;
        case 'occurrence':
          operation = commandEvent.operation, input = commandEvent.input;
          this.vimState.occurrenceManager.addPattern(this.getPattern(input), {
            reset: operation != null
          });
          this.vimState.occurrenceManager.saveLastPattern();
          this.vimState.searchHistory.save(input);
          this.vimState.searchInput.cancel();
          if (operation != null) {
            return this.vimState.operationStack.run(operation);
          }
          break;
        case 'project-find':
          input = commandEvent.input;
          this.vimState.searchHistory.save(input);
          this.vimState.searchInput.cancel();
          return searchByProjectFind(this.editor, input);
      }
    };

    Search.prototype.handleCancelSearch = function() {
      var ref1;
      if ((ref1 = this.mode) !== 'visual' && ref1 !== 'insert') {
        this.vimState.resetNormalMode();
      }
      if (typeof this.restoreEditorState === "function") {
        this.restoreEditorState();
      }
      this.vimState.reset();
      return this.finish();
    };

    Search.prototype.isSearchRepeatCharacter = function(char) {
      var searchChar;
      if (this.isIncrementalSearch()) {
        return char === '';
      } else {
        searchChar = this.isBackwards() ? '?' : '/';
        return char === '' || char === searchChar;
      }
    };

    Search.prototype.handleConfirmSearch = function(arg) {
      this.input = arg.input, this.landingPoint = arg.landingPoint;
      if (this.isSearchRepeatCharacter(this.input)) {
        this.input = this.vimState.searchHistory.get('prev');
        if (!this.input) {
          atom.beep();
        }
      }
      return this.processOperation();
    };

    Search.prototype.handleChangeSearch = function(input) {
      if (input.startsWith(' ')) {
        input = input.replace(/^ /, '');
        this.useRegexp = false;
      }
      this.vimState.searchInput.updateOptionSettings({
        useRegexp: this.useRegexp
      });
      if (this.isIncrementalSearch()) {
        return this.search(this.editor.getLastCursor(), input, this.getCount());
      }
    };

    Search.prototype.getPattern = function(term) {
      var modifiers;
      modifiers = this.isCaseSensitive(term) ? 'g' : 'gi';
      if (term.indexOf('\\c') >= 0) {
        term = term.replace('\\c', '');
        if (indexOf.call(modifiers, 'i') < 0) {
          modifiers += 'i';
        }
      }
      if (this.useRegexp) {
        try {
          return new RegExp(term, modifiers);
        } catch (error) {
          null;
        }
      }
      return new RegExp(_.escapeRegExp(term), modifiers);
    };

    return Search;

  })(SearchBase);

  SearchBackwards = (function(superClass) {
    extend(SearchBackwards, superClass);

    function SearchBackwards() {
      return SearchBackwards.__super__.constructor.apply(this, arguments);
    }

    SearchBackwards.extend();

    SearchBackwards.prototype.backwards = true;

    return SearchBackwards;

  })(Search);

  SearchCurrentWord = (function(superClass) {
    extend(SearchCurrentWord, superClass);

    function SearchCurrentWord() {
      return SearchCurrentWord.__super__.constructor.apply(this, arguments);
    }

    SearchCurrentWord.extend();

    SearchCurrentWord.prototype.configScope = "SearchCurrentWord";

    SearchCurrentWord.prototype.getInput = function() {
      var wordRange;
      return this.input != null ? this.input : this.input = (wordRange = this.getCurrentWordBufferRange(), wordRange != null ? (this.editor.setCursorBufferPosition(wordRange.start), this.editor.getTextInBufferRange(wordRange)) : '');
    };

    SearchCurrentWord.prototype.getPattern = function(term) {
      var modifiers, pattern;
      modifiers = this.isCaseSensitive(term) ? 'g' : 'gi';
      pattern = _.escapeRegExp(term);
      if (/\W/.test(term)) {
        return new RegExp(pattern + "\\b", modifiers);
      } else {
        return new RegExp("\\b" + pattern + "\\b", modifiers);
      }
    };

    SearchCurrentWord.prototype.getCurrentWordBufferRange = function() {
      var cursor, found, nonWordCharacters, point, wordRegex;
      cursor = this.editor.getLastCursor();
      point = cursor.getBufferPosition();
      nonWordCharacters = getNonWordCharactersForCursor(cursor);
      wordRegex = new RegExp("[^\\s" + (_.escapeRegExp(nonWordCharacters)) + "]+", 'g');
      found = null;
      this.scanForward(wordRegex, {
        from: [point.row, 0],
        allowNextLine: false
      }, function(arg) {
        var range, stop;
        range = arg.range, stop = arg.stop;
        if (range.end.isGreaterThan(point)) {
          found = range;
          return stop();
        }
      });
      return found;
    };

    return SearchCurrentWord;

  })(SearchBase);

  SearchCurrentWordBackwards = (function(superClass) {
    extend(SearchCurrentWordBackwards, superClass);

    function SearchCurrentWordBackwards() {
      return SearchCurrentWordBackwards.__super__.constructor.apply(this, arguments);
    }

    SearchCurrentWordBackwards.extend();

    SearchCurrentWordBackwards.prototype.backwards = true;

    return SearchCurrentWordBackwards;

  })(SearchCurrentWord);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvbW90aW9uLXNlYXJjaC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLG9MQUFBO0lBQUE7Ozs7O0VBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUjs7RUFFSixNQUF3RSxPQUFBLENBQVEsU0FBUixDQUF4RSxFQUFDLHFDQUFELEVBQWtCLGlFQUFsQixFQUFpRDs7RUFDakQsV0FBQSxHQUFjLE9BQUEsQ0FBUSxnQkFBUjs7RUFDZCxNQUFBLEdBQVMsT0FBQSxDQUFRLFFBQVIsQ0FBaUIsQ0FBQyxRQUFsQixDQUEyQixRQUEzQjs7RUFFSDs7Ozs7OztJQUNKLFVBQUMsQ0FBQSxNQUFELENBQVEsS0FBUjs7eUJBQ0EsSUFBQSxHQUFNOzt5QkFDTixTQUFBLEdBQVc7O3lCQUNYLFNBQUEsR0FBVzs7eUJBQ1gsV0FBQSxHQUFhOzt5QkFDYixZQUFBLEdBQWM7O3lCQUNkLG1CQUFBLEdBQXFCOzt5QkFDckIsYUFBQSxHQUFlOzt5QkFDZix1QkFBQSxHQUF5Qjs7eUJBRXpCLFdBQUEsR0FBYSxTQUFBO2FBQ1gsSUFBQyxDQUFBO0lBRFU7O3lCQUdiLG1CQUFBLEdBQXFCLFNBQUE7YUFDbkIsSUFBQyxFQUFBLFVBQUEsRUFBRCxDQUFZLFFBQVosQ0FBQSxJQUEwQixDQUFJLElBQUMsQ0FBQSxVQUFELENBQUEsQ0FBOUIsSUFBZ0QsSUFBQyxDQUFBLFNBQUQsQ0FBVyxtQkFBWDtJQUQ3Qjs7eUJBR3JCLFVBQUEsR0FBWSxTQUFBO01BQ1YsNENBQUEsU0FBQTthQUNBLElBQUMsQ0FBQSxvQkFBRCxDQUFzQixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7aUJBQ3BCLEtBQUMsQ0FBQSxNQUFELENBQUE7UUFEb0I7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXRCO0lBRlU7O3lCQUtaLFFBQUEsR0FBVSxTQUFBO0FBQ1IsVUFBQTtNQUFBLEtBQUEsR0FBUSwwQ0FBQSxTQUFBO01BQ1IsSUFBRyxJQUFDLENBQUEsV0FBRCxDQUFBLENBQUg7ZUFDRSxDQUFDLE1BREg7T0FBQSxNQUFBO2VBR0UsTUFIRjs7SUFGUTs7eUJBT1Ysa0JBQUEsR0FBb0IsU0FBQTtNQUNsQixJQUFHLElBQUMsQ0FBQSxTQUFELENBQVcsaUJBQUEsR0FBa0IsSUFBQyxDQUFBLFdBQTlCLENBQUg7ZUFDRSxZQURGO09BQUEsTUFFSyxJQUFHLElBQUMsQ0FBQSxTQUFELENBQVcsZUFBQSxHQUFnQixJQUFDLENBQUEsV0FBNUIsQ0FBSDtlQUNILGNBREc7T0FBQSxNQUFBO2VBR0gsWUFIRzs7SUFIYTs7eUJBUXBCLGVBQUEsR0FBaUIsU0FBQyxJQUFEO0FBQ2YsY0FBTyxJQUFDLENBQUEsa0JBQUQsQ0FBQSxDQUFQO0FBQUEsYUFDTyxXQURQO2lCQUN3QixJQUFJLENBQUMsTUFBTCxDQUFZLE9BQVosQ0FBQSxLQUEwQixDQUFDO0FBRG5ELGFBRU8sYUFGUDtpQkFFMEI7QUFGMUIsYUFHTyxXQUhQO2lCQUd3QjtBQUh4QjtJQURlOzt5QkFNakIsTUFBQSxHQUFRLFNBQUE7QUFDTixVQUFBO01BQUEsSUFBRyxJQUFDLENBQUEsbUJBQUQsQ0FBQSxDQUFBLElBQTJCLElBQUMsQ0FBQSxTQUFELENBQVcsd0JBQVgsQ0FBOUI7UUFDRSxJQUFDLENBQUEsUUFBUSxDQUFDLGtCQUFrQixDQUFDLEtBQTdCLENBQUEsRUFERjs7TUFFQSxJQUFDLENBQUEsYUFBRCxHQUFpQjs7WUFDTCxDQUFFLE9BQWQsQ0FBQTs7YUFDQSxJQUFDLENBQUEsV0FBRCxHQUFlO0lBTFQ7O3lCQU9SLGVBQUEsR0FBaUIsU0FBQTt5Q0FDZixJQUFDLENBQUEsZUFBRCxJQUFDLENBQUEsZUFBZ0IsSUFBQyxDQUFBO0lBREg7O3lCQUdqQixRQUFBLEdBQVUsU0FBQyxNQUFEO0FBQ1IsVUFBQTtNQUFBLElBQUcsd0JBQUg7UUFDRSxJQUFDLENBQUEsYUFBRCxHQUFpQixJQUFDLENBQUEsUUFBRCxDQUFBLENBQUEsR0FBYyxJQUFDLENBQUEsV0FBVyxDQUFDLGdCQUFiLENBQUEsRUFEakM7T0FBQSxNQUFBOztVQUdFLElBQUMsQ0FBQSxnQkFBaUIsSUFBQyxDQUFBLFFBQUQsQ0FBQTtTQUhwQjs7TUFLQSxJQUFHLEtBQUEsR0FBUSxJQUFDLENBQUEsTUFBRCxDQUFRLE1BQVIsRUFBZ0IsSUFBQyxDQUFBLEtBQWpCLEVBQXdCLElBQUMsQ0FBQSxhQUF6QixDQUFYO1FBQ0UsS0FBQSxHQUFRLEtBQU0sQ0FBQSxJQUFDLENBQUEsZUFBRCxDQUFBLENBQUEsRUFEaEI7O01BR0EsSUFBQyxDQUFBLFdBQVcsQ0FBQyxPQUFiLENBQUE7TUFDQSxJQUFDLENBQUEsV0FBRCxHQUFlO2FBRWY7SUFaUTs7eUJBY1YsVUFBQSxHQUFZLFNBQUMsTUFBRDtBQUNWLFVBQUE7TUFBQSxLQUFBLEdBQVEsSUFBQyxDQUFBLFFBQUQsQ0FBQTtNQUNSLElBQUEsQ0FBYyxLQUFkO0FBQUEsZUFBQTs7TUFFQSxJQUFHLEtBQUEsR0FBUSxJQUFDLENBQUEsUUFBRCxDQUFVLE1BQVYsQ0FBWDtRQUNFLE1BQU0sQ0FBQyxpQkFBUCxDQUF5QixLQUF6QixFQUFnQztVQUFBLFVBQUEsRUFBWSxLQUFaO1NBQWhDLEVBREY7O01BR0EsSUFBQSxDQUFPLElBQUMsQ0FBQSxVQUFELENBQUEsQ0FBUDtRQUNFLElBQUMsQ0FBQSxXQUFXLENBQUMsR0FBYixDQUFpQixlQUFqQixFQUFrQyxJQUFsQztRQUNBLElBQUMsQ0FBQSxRQUFRLENBQUMsYUFBYSxDQUFDLElBQXhCLENBQTZCLEtBQTdCLEVBRkY7O01BSUEsSUFBRyxJQUFDLENBQUEsdUJBQUo7ZUFDRSxJQUFDLENBQUEsV0FBVyxDQUFDLEdBQWIsQ0FBaUIsbUJBQWpCLEVBQXNDLElBQUMsQ0FBQSxVQUFELENBQVksS0FBWixDQUF0QyxFQURGOztJQVhVOzt5QkFjWixjQUFBLEdBQWdCLFNBQUE7d0NBQ2QsSUFBQyxDQUFBLGNBQUQsSUFBQyxDQUFBLGNBQW1CLElBQUEsV0FBQSxDQUFZLElBQUMsQ0FBQSxRQUFiLEVBQXVCO1FBQUEsaUJBQUEsRUFBbUIsSUFBQyxDQUFBLG1CQUFELENBQUEsQ0FBbkI7T0FBdkI7SUFETjs7eUJBR2hCLE1BQUEsR0FBUSxTQUFDLE1BQUQsRUFBUyxLQUFULEVBQWdCLGFBQWhCO0FBQ04sVUFBQTtNQUFBLFdBQUEsR0FBYyxJQUFDLENBQUEsY0FBRCxDQUFBO01BQ2QsSUFBRyxLQUFIO1FBQ0UsU0FBQSxHQUFZLElBQUMsQ0FBQSwwQkFBRCxDQUE0QixNQUE1QjtlQUNaLFdBQVcsQ0FBQyxNQUFaLENBQW1CLFNBQW5CLEVBQThCLElBQUMsQ0FBQSxVQUFELENBQVksS0FBWixDQUE5QixFQUFrRCxhQUFsRCxFQUZGO09BQUEsTUFBQTtRQUlFLElBQUMsQ0FBQSxRQUFRLENBQUMsa0JBQWtCLENBQUMsS0FBN0IsQ0FBQTtlQUNBLFdBQVcsQ0FBQyxZQUFaLENBQUEsRUFMRjs7SUFGTTs7OztLQXBGZTs7RUErRm5COzs7Ozs7OztJQUNKLE1BQUMsQ0FBQSxNQUFELENBQUE7O3FCQUNBLFdBQUEsR0FBYTs7cUJBQ2IsWUFBQSxHQUFjOztxQkFFZCxVQUFBLEdBQVksU0FBQTtNQUNWLHdDQUFBLFNBQUE7TUFDQSxJQUFVLElBQUMsQ0FBQSxVQUFELENBQUEsQ0FBVjtBQUFBLGVBQUE7O01BRUEsSUFBRyxJQUFDLENBQUEsbUJBQUQsQ0FBQSxDQUFIO1FBQ0UsSUFBQyxDQUFBLGtCQUFELEdBQXNCLGVBQUEsQ0FBZ0IsSUFBQyxDQUFBLE1BQWpCO1FBQ3RCLElBQUMsQ0FBQSxrQkFBRCxDQUFvQixJQUFDLENBQUEsa0JBQWtCLENBQUMsSUFBcEIsQ0FBeUIsSUFBekIsQ0FBcEIsRUFGRjs7TUFJQSxJQUFDLENBQUEsa0JBQUQsQ0FBb0IsSUFBQyxDQUFBLG1CQUFtQixDQUFDLElBQXJCLENBQTBCLElBQTFCLENBQXBCO01BQ0EsSUFBQyxDQUFBLGlCQUFELENBQW1CLElBQUMsQ0FBQSxrQkFBa0IsQ0FBQyxJQUFwQixDQUF5QixJQUF6QixDQUFuQjtNQUNBLElBQUMsQ0FBQSxpQkFBRCxDQUFtQixJQUFDLENBQUEsa0JBQWtCLENBQUMsSUFBcEIsQ0FBeUIsSUFBekIsQ0FBbkI7YUFFQSxJQUFDLENBQUEsc0JBQUQsQ0FBQTtJQVpVOztxQkFjWixzQkFBQSxHQUF3QixTQUFBO0FBQ3RCLFVBQUE7TUFBQSxTQUFBLEdBQVk7TUFDWixJQUErQixJQUFDLENBQUEsU0FBaEM7UUFBQSxTQUFTLENBQUMsSUFBVixDQUFlLFdBQWYsRUFBQTs7YUFDQSxJQUFDLENBQUEsUUFBUSxDQUFDLFdBQVcsQ0FBQyxLQUF0QixDQUE0QjtRQUFDLFdBQUEsU0FBRDtPQUE1QjtJQUhzQjs7cUJBS3hCLGtCQUFBLEdBQW9CLFNBQUMsWUFBRDtBQUNsQixVQUFBO01BQUEsSUFBQSxDQUFjLFlBQVksQ0FBQyxLQUEzQjtBQUFBLGVBQUE7O0FBQ0EsY0FBTyxZQUFZLENBQUMsSUFBcEI7QUFBQSxhQUNPLE9BRFA7VUFFSyxZQUFhO1VBQ2QsSUFBRyxJQUFDLENBQUEsV0FBRCxDQUFBLENBQUEsSUFBbUIsSUFBQyxDQUFBLFNBQUQsQ0FBVyxpQ0FBWCxDQUFBLEtBQWlELFVBQXZFO1lBQ0UsU0FBQTtBQUFZLHNCQUFPLFNBQVA7QUFBQSxxQkFDTCxNQURLO3lCQUNPO0FBRFAscUJBRUwsTUFGSzt5QkFFTztBQUZQO2lCQURkOztBQUtBLGtCQUFPLFNBQVA7QUFBQSxpQkFDTyxNQURQO3FCQUNtQixJQUFDLENBQUEsY0FBRCxDQUFBLENBQWlCLENBQUMsS0FBbEIsQ0FBd0IsQ0FBQyxDQUF6QjtBQURuQixpQkFFTyxNQUZQO3FCQUVtQixJQUFDLENBQUEsY0FBRCxDQUFBLENBQWlCLENBQUMsS0FBbEIsQ0FBd0IsQ0FBQyxDQUF6QjtBQUZuQjtBQVBHO0FBRFAsYUFZTyxZQVpQO1VBYUssa0NBQUQsRUFBWTtVQUNaLElBQUMsQ0FBQSxRQUFRLENBQUMsaUJBQWlCLENBQUMsVUFBNUIsQ0FBdUMsSUFBQyxDQUFBLFVBQUQsQ0FBWSxLQUFaLENBQXZDLEVBQTJEO1lBQUEsS0FBQSxFQUFPLGlCQUFQO1dBQTNEO1VBQ0EsSUFBQyxDQUFBLFFBQVEsQ0FBQyxpQkFBaUIsQ0FBQyxlQUE1QixDQUFBO1VBRUEsSUFBQyxDQUFBLFFBQVEsQ0FBQyxhQUFhLENBQUMsSUFBeEIsQ0FBNkIsS0FBN0I7VUFDQSxJQUFDLENBQUEsUUFBUSxDQUFDLFdBQVcsQ0FBQyxNQUF0QixDQUFBO1VBRUEsSUFBMkMsaUJBQTNDO21CQUFBLElBQUMsQ0FBQSxRQUFRLENBQUMsY0FBYyxDQUFDLEdBQXpCLENBQTZCLFNBQTdCLEVBQUE7O0FBUkc7QUFaUCxhQXNCTyxjQXRCUDtVQXVCSyxRQUFTO1VBQ1YsSUFBQyxDQUFBLFFBQVEsQ0FBQyxhQUFhLENBQUMsSUFBeEIsQ0FBNkIsS0FBN0I7VUFDQSxJQUFDLENBQUEsUUFBUSxDQUFDLFdBQVcsQ0FBQyxNQUF0QixDQUFBO2lCQUNBLG1CQUFBLENBQW9CLElBQUMsQ0FBQSxNQUFyQixFQUE2QixLQUE3QjtBQTFCSjtJQUZrQjs7cUJBOEJwQixrQkFBQSxHQUFvQixTQUFBO0FBQ2xCLFVBQUE7TUFBQSxZQUFtQyxJQUFDLENBQUEsS0FBRCxLQUFVLFFBQVYsSUFBQSxJQUFBLEtBQW9CLFFBQXZEO1FBQUEsSUFBQyxDQUFBLFFBQVEsQ0FBQyxlQUFWLENBQUEsRUFBQTs7O1FBQ0EsSUFBQyxDQUFBOztNQUNELElBQUMsQ0FBQSxRQUFRLENBQUMsS0FBVixDQUFBO2FBQ0EsSUFBQyxDQUFBLE1BQUQsQ0FBQTtJQUprQjs7cUJBTXBCLHVCQUFBLEdBQXlCLFNBQUMsSUFBRDtBQUN2QixVQUFBO01BQUEsSUFBRyxJQUFDLENBQUEsbUJBQUQsQ0FBQSxDQUFIO2VBQ0UsSUFBQSxLQUFRLEdBRFY7T0FBQSxNQUFBO1FBR0UsVUFBQSxHQUFnQixJQUFDLENBQUEsV0FBRCxDQUFBLENBQUgsR0FBdUIsR0FBdkIsR0FBZ0M7ZUFDN0MsSUFBQSxLQUFTLEVBQVQsSUFBQSxJQUFBLEtBQWEsV0FKZjs7SUFEdUI7O3FCQU96QixtQkFBQSxHQUFxQixTQUFDLEdBQUQ7TUFBRSxJQUFDLENBQUEsWUFBQSxPQUFPLElBQUMsQ0FBQSxtQkFBQTtNQUM5QixJQUFHLElBQUMsQ0FBQSx1QkFBRCxDQUF5QixJQUFDLENBQUEsS0FBMUIsQ0FBSDtRQUNFLElBQUMsQ0FBQSxLQUFELEdBQVMsSUFBQyxDQUFBLFFBQVEsQ0FBQyxhQUFhLENBQUMsR0FBeEIsQ0FBNEIsTUFBNUI7UUFDVCxJQUFBLENBQW1CLElBQUMsQ0FBQSxLQUFwQjtVQUFBLElBQUksQ0FBQyxJQUFMLENBQUEsRUFBQTtTQUZGOzthQUdBLElBQUMsQ0FBQSxnQkFBRCxDQUFBO0lBSm1COztxQkFNckIsa0JBQUEsR0FBb0IsU0FBQyxLQUFEO01BRWxCLElBQUcsS0FBSyxDQUFDLFVBQU4sQ0FBaUIsR0FBakIsQ0FBSDtRQUNFLEtBQUEsR0FBUSxLQUFLLENBQUMsT0FBTixDQUFjLElBQWQsRUFBb0IsRUFBcEI7UUFDUixJQUFDLENBQUEsU0FBRCxHQUFhLE1BRmY7O01BR0EsSUFBQyxDQUFBLFFBQVEsQ0FBQyxXQUFXLENBQUMsb0JBQXRCLENBQTJDO1FBQUUsV0FBRCxJQUFDLENBQUEsU0FBRjtPQUEzQztNQUVBLElBQUcsSUFBQyxDQUFBLG1CQUFELENBQUEsQ0FBSDtlQUNFLElBQUMsQ0FBQSxNQUFELENBQVEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxhQUFSLENBQUEsQ0FBUixFQUFpQyxLQUFqQyxFQUF3QyxJQUFDLENBQUEsUUFBRCxDQUFBLENBQXhDLEVBREY7O0lBUGtCOztxQkFVcEIsVUFBQSxHQUFZLFNBQUMsSUFBRDtBQUNWLFVBQUE7TUFBQSxTQUFBLEdBQWUsSUFBQyxDQUFBLGVBQUQsQ0FBaUIsSUFBakIsQ0FBSCxHQUErQixHQUEvQixHQUF3QztNQUdwRCxJQUFHLElBQUksQ0FBQyxPQUFMLENBQWEsS0FBYixDQUFBLElBQXVCLENBQTFCO1FBQ0UsSUFBQSxHQUFPLElBQUksQ0FBQyxPQUFMLENBQWEsS0FBYixFQUFvQixFQUFwQjtRQUNQLElBQXdCLGFBQU8sU0FBUCxFQUFBLEdBQUEsS0FBeEI7VUFBQSxTQUFBLElBQWEsSUFBYjtTQUZGOztNQUlBLElBQUcsSUFBQyxDQUFBLFNBQUo7QUFDRTtBQUNFLGlCQUFXLElBQUEsTUFBQSxDQUFPLElBQVAsRUFBYSxTQUFiLEVBRGI7U0FBQSxhQUFBO1VBR0UsS0FIRjtTQURGOzthQU1JLElBQUEsTUFBQSxDQUFPLENBQUMsQ0FBQyxZQUFGLENBQWUsSUFBZixDQUFQLEVBQTZCLFNBQTdCO0lBZE07Ozs7S0FuRk87O0VBbUdmOzs7Ozs7O0lBQ0osZUFBQyxDQUFBLE1BQUQsQ0FBQTs7OEJBQ0EsU0FBQSxHQUFXOzs7O0tBRmlCOztFQU14Qjs7Ozs7OztJQUNKLGlCQUFDLENBQUEsTUFBRCxDQUFBOztnQ0FDQSxXQUFBLEdBQWE7O2dDQUViLFFBQUEsR0FBVSxTQUFBO0FBQ1IsVUFBQTtrQ0FBQSxJQUFDLENBQUEsUUFBRCxJQUFDLENBQUEsUUFBUyxDQUNSLFNBQUEsR0FBWSxJQUFDLENBQUEseUJBQUQsQ0FBQSxDQUFaLEVBQ0csaUJBQUgsR0FDRSxDQUFBLElBQUMsQ0FBQSxNQUFNLENBQUMsdUJBQVIsQ0FBZ0MsU0FBUyxDQUFDLEtBQTFDLENBQUEsRUFDQSxJQUFDLENBQUEsTUFBTSxDQUFDLG9CQUFSLENBQTZCLFNBQTdCLENBREEsQ0FERixHQUlFLEVBTk07SUFERjs7Z0NBVVYsVUFBQSxHQUFZLFNBQUMsSUFBRDtBQUNWLFVBQUE7TUFBQSxTQUFBLEdBQWUsSUFBQyxDQUFBLGVBQUQsQ0FBaUIsSUFBakIsQ0FBSCxHQUErQixHQUEvQixHQUF3QztNQUNwRCxPQUFBLEdBQVUsQ0FBQyxDQUFDLFlBQUYsQ0FBZSxJQUFmO01BQ1YsSUFBRyxJQUFJLENBQUMsSUFBTCxDQUFVLElBQVYsQ0FBSDtlQUNNLElBQUEsTUFBQSxDQUFVLE9BQUQsR0FBUyxLQUFsQixFQUF3QixTQUF4QixFQUROO09BQUEsTUFBQTtlQUdNLElBQUEsTUFBQSxDQUFPLEtBQUEsR0FBTSxPQUFOLEdBQWMsS0FBckIsRUFBMkIsU0FBM0IsRUFITjs7SUFIVTs7Z0NBUVoseUJBQUEsR0FBMkIsU0FBQTtBQUN6QixVQUFBO01BQUEsTUFBQSxHQUFTLElBQUMsQ0FBQSxNQUFNLENBQUMsYUFBUixDQUFBO01BQ1QsS0FBQSxHQUFRLE1BQU0sQ0FBQyxpQkFBUCxDQUFBO01BRVIsaUJBQUEsR0FBb0IsNkJBQUEsQ0FBOEIsTUFBOUI7TUFDcEIsU0FBQSxHQUFnQixJQUFBLE1BQUEsQ0FBTyxPQUFBLEdBQU8sQ0FBQyxDQUFDLENBQUMsWUFBRixDQUFlLGlCQUFmLENBQUQsQ0FBUCxHQUEwQyxJQUFqRCxFQUFzRCxHQUF0RDtNQUVoQixLQUFBLEdBQVE7TUFDUixJQUFDLENBQUEsV0FBRCxDQUFhLFNBQWIsRUFBd0I7UUFBQyxJQUFBLEVBQU0sQ0FBQyxLQUFLLENBQUMsR0FBUCxFQUFZLENBQVosQ0FBUDtRQUF1QixhQUFBLEVBQWUsS0FBdEM7T0FBeEIsRUFBc0UsU0FBQyxHQUFEO0FBQ3BFLFlBQUE7UUFEc0UsbUJBQU87UUFDN0UsSUFBRyxLQUFLLENBQUMsR0FBRyxDQUFDLGFBQVYsQ0FBd0IsS0FBeEIsQ0FBSDtVQUNFLEtBQUEsR0FBUTtpQkFDUixJQUFBLENBQUEsRUFGRjs7TUFEb0UsQ0FBdEU7YUFJQTtJQVp5Qjs7OztLQXRCRzs7RUFvQzFCOzs7Ozs7O0lBQ0osMEJBQUMsQ0FBQSxNQUFELENBQUE7O3lDQUNBLFNBQUEsR0FBVzs7OztLQUY0QjtBQWxQekMiLCJzb3VyY2VzQ29udGVudCI6WyJfID0gcmVxdWlyZSAndW5kZXJzY29yZS1wbHVzJ1xuXG57c2F2ZUVkaXRvclN0YXRlLCBnZXROb25Xb3JkQ2hhcmFjdGVyc0ZvckN1cnNvciwgc2VhcmNoQnlQcm9qZWN0RmluZH0gPSByZXF1aXJlICcuL3V0aWxzJ1xuU2VhcmNoTW9kZWwgPSByZXF1aXJlICcuL3NlYXJjaC1tb2RlbCdcbk1vdGlvbiA9IHJlcXVpcmUoJy4vYmFzZScpLmdldENsYXNzKCdNb3Rpb24nKVxuXG5jbGFzcyBTZWFyY2hCYXNlIGV4dGVuZHMgTW90aW9uXG4gIEBleHRlbmQoZmFsc2UpXG4gIGp1bXA6IHRydWVcbiAgYmFja3dhcmRzOiBmYWxzZVxuICB1c2VSZWdleHA6IHRydWVcbiAgY29uZmlnU2NvcGU6IG51bGxcbiAgbGFuZGluZ1BvaW50OiBudWxsICMgWydzdGFydCcgb3IgJ2VuZCddXG4gIGRlZmF1bHRMYW5kaW5nUG9pbnQ6ICdzdGFydCcgIyBbJ3N0YXJ0JyBvciAnZW5kJ11cbiAgcmVsYXRpdmVJbmRleDogbnVsbFxuICB1cGRhdGVsYXN0U2VhcmNoUGF0dGVybjogdHJ1ZVxuXG4gIGlzQmFja3dhcmRzOiAtPlxuICAgIEBiYWNrd2FyZHNcblxuICBpc0luY3JlbWVudGFsU2VhcmNoOiAtPlxuICAgIEBpbnN0YW5jZW9mKCdTZWFyY2gnKSBhbmQgbm90IEBpc1JlcGVhdGVkKCkgYW5kIEBnZXRDb25maWcoJ2luY3JlbWVudGFsU2VhcmNoJylcblxuICBpbml0aWFsaXplOiAtPlxuICAgIHN1cGVyXG4gICAgQG9uRGlkRmluaXNoT3BlcmF0aW9uID0+XG4gICAgICBAZmluaXNoKClcblxuICBnZXRDb3VudDogLT5cbiAgICBjb3VudCA9IHN1cGVyXG4gICAgaWYgQGlzQmFja3dhcmRzKClcbiAgICAgIC1jb3VudFxuICAgIGVsc2VcbiAgICAgIGNvdW50XG5cbiAgZ2V0Q2FzZVNlbnNpdGl2aXR5OiAtPlxuICAgIGlmIEBnZXRDb25maWcoXCJ1c2VTbWFydGNhc2VGb3Ije0Bjb25maWdTY29wZX1cIilcbiAgICAgICdzbWFydGNhc2UnXG4gICAgZWxzZSBpZiBAZ2V0Q29uZmlnKFwiaWdub3JlQ2FzZUZvciN7QGNvbmZpZ1Njb3BlfVwiKVxuICAgICAgJ2luc2Vuc2l0aXZlJ1xuICAgIGVsc2VcbiAgICAgICdzZW5zaXRpdmUnXG5cbiAgaXNDYXNlU2Vuc2l0aXZlOiAodGVybSkgLT5cbiAgICBzd2l0Y2ggQGdldENhc2VTZW5zaXRpdml0eSgpXG4gICAgICB3aGVuICdzbWFydGNhc2UnIHRoZW4gdGVybS5zZWFyY2goJ1tBLVpdJykgaXNudCAtMVxuICAgICAgd2hlbiAnaW5zZW5zaXRpdmUnIHRoZW4gZmFsc2VcbiAgICAgIHdoZW4gJ3NlbnNpdGl2ZScgdGhlbiB0cnVlXG5cbiAgZmluaXNoOiAtPlxuICAgIGlmIEBpc0luY3JlbWVudGFsU2VhcmNoKCkgYW5kIEBnZXRDb25maWcoJ3Nob3dIb3ZlclNlYXJjaENvdW50ZXInKVxuICAgICAgQHZpbVN0YXRlLmhvdmVyU2VhcmNoQ291bnRlci5yZXNldCgpXG4gICAgQHJlbGF0aXZlSW5kZXggPSBudWxsXG4gICAgQHNlYXJjaE1vZGVsPy5kZXN0cm95KClcbiAgICBAc2VhcmNoTW9kZWwgPSBudWxsXG5cbiAgZ2V0TGFuZGluZ1BvaW50OiAtPlxuICAgIEBsYW5kaW5nUG9pbnQgPz0gQGRlZmF1bHRMYW5kaW5nUG9pbnRcblxuICBnZXRQb2ludDogKGN1cnNvcikgLT5cbiAgICBpZiBAc2VhcmNoTW9kZWw/XG4gICAgICBAcmVsYXRpdmVJbmRleCA9IEBnZXRDb3VudCgpICsgQHNlYXJjaE1vZGVsLmdldFJlbGF0aXZlSW5kZXgoKVxuICAgIGVsc2VcbiAgICAgIEByZWxhdGl2ZUluZGV4ID89IEBnZXRDb3VudCgpXG5cbiAgICBpZiByYW5nZSA9IEBzZWFyY2goY3Vyc29yLCBAaW5wdXQsIEByZWxhdGl2ZUluZGV4KVxuICAgICAgcG9pbnQgPSByYW5nZVtAZ2V0TGFuZGluZ1BvaW50KCldXG5cbiAgICBAc2VhcmNoTW9kZWwuZGVzdHJveSgpXG4gICAgQHNlYXJjaE1vZGVsID0gbnVsbFxuXG4gICAgcG9pbnRcblxuICBtb3ZlQ3Vyc29yOiAoY3Vyc29yKSAtPlxuICAgIGlucHV0ID0gQGdldElucHV0KClcbiAgICByZXR1cm4gdW5sZXNzIGlucHV0XG5cbiAgICBpZiBwb2ludCA9IEBnZXRQb2ludChjdXJzb3IpXG4gICAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24ocG9pbnQsIGF1dG9zY3JvbGw6IGZhbHNlKVxuXG4gICAgdW5sZXNzIEBpc1JlcGVhdGVkKClcbiAgICAgIEBnbG9iYWxTdGF0ZS5zZXQoJ2N1cnJlbnRTZWFyY2gnLCB0aGlzKVxuICAgICAgQHZpbVN0YXRlLnNlYXJjaEhpc3Rvcnkuc2F2ZShpbnB1dClcblxuICAgIGlmIEB1cGRhdGVsYXN0U2VhcmNoUGF0dGVyblxuICAgICAgQGdsb2JhbFN0YXRlLnNldCgnbGFzdFNlYXJjaFBhdHRlcm4nLCBAZ2V0UGF0dGVybihpbnB1dCkpXG5cbiAgZ2V0U2VhcmNoTW9kZWw6IC0+XG4gICAgQHNlYXJjaE1vZGVsID89IG5ldyBTZWFyY2hNb2RlbChAdmltU3RhdGUsIGluY3JlbWVudGFsU2VhcmNoOiBAaXNJbmNyZW1lbnRhbFNlYXJjaCgpKVxuXG4gIHNlYXJjaDogKGN1cnNvciwgaW5wdXQsIHJlbGF0aXZlSW5kZXgpIC0+XG4gICAgc2VhcmNoTW9kZWwgPSBAZ2V0U2VhcmNoTW9kZWwoKVxuICAgIGlmIGlucHV0XG4gICAgICBmcm9tUG9pbnQgPSBAZ2V0QnVmZmVyUG9zaXRpb25Gb3JDdXJzb3IoY3Vyc29yKVxuICAgICAgc2VhcmNoTW9kZWwuc2VhcmNoKGZyb21Qb2ludCwgQGdldFBhdHRlcm4oaW5wdXQpLCByZWxhdGl2ZUluZGV4KVxuICAgIGVsc2VcbiAgICAgIEB2aW1TdGF0ZS5ob3ZlclNlYXJjaENvdW50ZXIucmVzZXQoKVxuICAgICAgc2VhcmNoTW9kZWwuY2xlYXJNYXJrZXJzKClcblxuIyAvLCA/XG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIFNlYXJjaCBleHRlbmRzIFNlYXJjaEJhc2VcbiAgQGV4dGVuZCgpXG4gIGNvbmZpZ1Njb3BlOiBcIlNlYXJjaFwiXG4gIHJlcXVpcmVJbnB1dDogdHJ1ZVxuXG4gIGluaXRpYWxpemU6IC0+XG4gICAgc3VwZXJcbiAgICByZXR1cm4gaWYgQGlzQ29tcGxldGUoKSAjIFdoZW4gcmVwZWF0ZWQsIG5vIG5lZWQgdG8gZ2V0IHVzZXIgaW5wdXRcblxuICAgIGlmIEBpc0luY3JlbWVudGFsU2VhcmNoKClcbiAgICAgIEByZXN0b3JlRWRpdG9yU3RhdGUgPSBzYXZlRWRpdG9yU3RhdGUoQGVkaXRvcilcbiAgICAgIEBvbkRpZENvbW1hbmRTZWFyY2goQGhhbmRsZUNvbW1hbmRFdmVudC5iaW5kKHRoaXMpKVxuXG4gICAgQG9uRGlkQ29uZmlybVNlYXJjaChAaGFuZGxlQ29uZmlybVNlYXJjaC5iaW5kKHRoaXMpKVxuICAgIEBvbkRpZENhbmNlbFNlYXJjaChAaGFuZGxlQ2FuY2VsU2VhcmNoLmJpbmQodGhpcykpXG4gICAgQG9uRGlkQ2hhbmdlU2VhcmNoKEBoYW5kbGVDaGFuZ2VTZWFyY2guYmluZCh0aGlzKSlcblxuICAgIEBmb2N1c1NlYXJjaElucHV0RWRpdG9yKClcblxuICBmb2N1c1NlYXJjaElucHV0RWRpdG9yOiAtPlxuICAgIGNsYXNzTGlzdCA9IFtdXG4gICAgY2xhc3NMaXN0LnB1c2goJ2JhY2t3YXJkcycpIGlmIEBiYWNrd2FyZHNcbiAgICBAdmltU3RhdGUuc2VhcmNoSW5wdXQuZm9jdXMoe2NsYXNzTGlzdH0pXG5cbiAgaGFuZGxlQ29tbWFuZEV2ZW50OiAoY29tbWFuZEV2ZW50KSAtPlxuICAgIHJldHVybiB1bmxlc3MgY29tbWFuZEV2ZW50LmlucHV0XG4gICAgc3dpdGNoIGNvbW1hbmRFdmVudC5uYW1lXG4gICAgICB3aGVuICd2aXNpdCdcbiAgICAgICAge2RpcmVjdGlvbn0gPSBjb21tYW5kRXZlbnRcbiAgICAgICAgaWYgQGlzQmFja3dhcmRzKCkgYW5kIEBnZXRDb25maWcoJ2luY3JlbWVudGFsU2VhcmNoVmlzaXREaXJlY3Rpb24nKSBpcyAncmVsYXRpdmUnXG4gICAgICAgICAgZGlyZWN0aW9uID0gc3dpdGNoIGRpcmVjdGlvblxuICAgICAgICAgICAgd2hlbiAnbmV4dCcgdGhlbiAncHJldidcbiAgICAgICAgICAgIHdoZW4gJ3ByZXYnIHRoZW4gJ25leHQnXG5cbiAgICAgICAgc3dpdGNoIGRpcmVjdGlvblxuICAgICAgICAgIHdoZW4gJ25leHQnIHRoZW4gQGdldFNlYXJjaE1vZGVsKCkudmlzaXQoKzEpXG4gICAgICAgICAgd2hlbiAncHJldicgdGhlbiBAZ2V0U2VhcmNoTW9kZWwoKS52aXNpdCgtMSlcblxuICAgICAgd2hlbiAnb2NjdXJyZW5jZSdcbiAgICAgICAge29wZXJhdGlvbiwgaW5wdXR9ID0gY29tbWFuZEV2ZW50XG4gICAgICAgIEB2aW1TdGF0ZS5vY2N1cnJlbmNlTWFuYWdlci5hZGRQYXR0ZXJuKEBnZXRQYXR0ZXJuKGlucHV0KSwgcmVzZXQ6IG9wZXJhdGlvbj8pXG4gICAgICAgIEB2aW1TdGF0ZS5vY2N1cnJlbmNlTWFuYWdlci5zYXZlTGFzdFBhdHRlcm4oKVxuXG4gICAgICAgIEB2aW1TdGF0ZS5zZWFyY2hIaXN0b3J5LnNhdmUoaW5wdXQpXG4gICAgICAgIEB2aW1TdGF0ZS5zZWFyY2hJbnB1dC5jYW5jZWwoKVxuXG4gICAgICAgIEB2aW1TdGF0ZS5vcGVyYXRpb25TdGFjay5ydW4ob3BlcmF0aW9uKSBpZiBvcGVyYXRpb24/XG5cbiAgICAgIHdoZW4gJ3Byb2plY3QtZmluZCdcbiAgICAgICAge2lucHV0fSA9IGNvbW1hbmRFdmVudFxuICAgICAgICBAdmltU3RhdGUuc2VhcmNoSGlzdG9yeS5zYXZlKGlucHV0KVxuICAgICAgICBAdmltU3RhdGUuc2VhcmNoSW5wdXQuY2FuY2VsKClcbiAgICAgICAgc2VhcmNoQnlQcm9qZWN0RmluZChAZWRpdG9yLCBpbnB1dClcblxuICBoYW5kbGVDYW5jZWxTZWFyY2g6IC0+XG4gICAgQHZpbVN0YXRlLnJlc2V0Tm9ybWFsTW9kZSgpIHVubGVzcyBAbW9kZSBpbiBbJ3Zpc3VhbCcsICdpbnNlcnQnXVxuICAgIEByZXN0b3JlRWRpdG9yU3RhdGU/KClcbiAgICBAdmltU3RhdGUucmVzZXQoKVxuICAgIEBmaW5pc2goKVxuXG4gIGlzU2VhcmNoUmVwZWF0Q2hhcmFjdGVyOiAoY2hhcikgLT5cbiAgICBpZiBAaXNJbmNyZW1lbnRhbFNlYXJjaCgpXG4gICAgICBjaGFyIGlzICcnXG4gICAgZWxzZVxuICAgICAgc2VhcmNoQ2hhciA9IGlmIEBpc0JhY2t3YXJkcygpIHRoZW4gJz8nIGVsc2UgJy8nXG4gICAgICBjaGFyIGluIFsnJywgc2VhcmNoQ2hhcl1cblxuICBoYW5kbGVDb25maXJtU2VhcmNoOiAoe0BpbnB1dCwgQGxhbmRpbmdQb2ludH0pID0+XG4gICAgaWYgQGlzU2VhcmNoUmVwZWF0Q2hhcmFjdGVyKEBpbnB1dClcbiAgICAgIEBpbnB1dCA9IEB2aW1TdGF0ZS5zZWFyY2hIaXN0b3J5LmdldCgncHJldicpXG4gICAgICBhdG9tLmJlZXAoKSB1bmxlc3MgQGlucHV0XG4gICAgQHByb2Nlc3NPcGVyYXRpb24oKVxuXG4gIGhhbmRsZUNoYW5nZVNlYXJjaDogKGlucHV0KSAtPlxuICAgICMgSWYgaW5wdXQgc3RhcnRzIHdpdGggc3BhY2UsIHJlbW92ZSBmaXJzdCBzcGFjZSBhbmQgZGlzYWJsZSB1c2VSZWdleHAuXG4gICAgaWYgaW5wdXQuc3RhcnRzV2l0aCgnICcpXG4gICAgICBpbnB1dCA9IGlucHV0LnJlcGxhY2UoL14gLywgJycpXG4gICAgICBAdXNlUmVnZXhwID0gZmFsc2VcbiAgICBAdmltU3RhdGUuc2VhcmNoSW5wdXQudXBkYXRlT3B0aW9uU2V0dGluZ3Moe0B1c2VSZWdleHB9KVxuXG4gICAgaWYgQGlzSW5jcmVtZW50YWxTZWFyY2goKVxuICAgICAgQHNlYXJjaChAZWRpdG9yLmdldExhc3RDdXJzb3IoKSwgaW5wdXQsIEBnZXRDb3VudCgpKVxuXG4gIGdldFBhdHRlcm46ICh0ZXJtKSAtPlxuICAgIG1vZGlmaWVycyA9IGlmIEBpc0Nhc2VTZW5zaXRpdmUodGVybSkgdGhlbiAnZycgZWxzZSAnZ2knXG4gICAgIyBGSVhNRSB0aGlzIHByZXZlbnQgc2VhcmNoIFxcXFxjIGl0c2VsZi5cbiAgICAjIERPTlQgdGhpbmtsZXNzbHkgbWltaWMgcHVyZSBWaW0uIEluc3RlYWQsIHByb3ZpZGUgaWdub3JlY2FzZSBidXR0b24gYW5kIHNob3J0Y3V0LlxuICAgIGlmIHRlcm0uaW5kZXhPZignXFxcXGMnKSA+PSAwXG4gICAgICB0ZXJtID0gdGVybS5yZXBsYWNlKCdcXFxcYycsICcnKVxuICAgICAgbW9kaWZpZXJzICs9ICdpJyB1bmxlc3MgJ2knIGluIG1vZGlmaWVyc1xuXG4gICAgaWYgQHVzZVJlZ2V4cFxuICAgICAgdHJ5XG4gICAgICAgIHJldHVybiBuZXcgUmVnRXhwKHRlcm0sIG1vZGlmaWVycylcbiAgICAgIGNhdGNoXG4gICAgICAgIG51bGxcblxuICAgIG5ldyBSZWdFeHAoXy5lc2NhcGVSZWdFeHAodGVybSksIG1vZGlmaWVycylcblxuY2xhc3MgU2VhcmNoQmFja3dhcmRzIGV4dGVuZHMgU2VhcmNoXG4gIEBleHRlbmQoKVxuICBiYWNrd2FyZHM6IHRydWVcblxuIyAqLCAjXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIFNlYXJjaEN1cnJlbnRXb3JkIGV4dGVuZHMgU2VhcmNoQmFzZVxuICBAZXh0ZW5kKClcbiAgY29uZmlnU2NvcGU6IFwiU2VhcmNoQ3VycmVudFdvcmRcIlxuXG4gIGdldElucHV0OiAtPlxuICAgIEBpbnB1dCA/PSAoXG4gICAgICB3b3JkUmFuZ2UgPSBAZ2V0Q3VycmVudFdvcmRCdWZmZXJSYW5nZSgpXG4gICAgICBpZiB3b3JkUmFuZ2U/XG4gICAgICAgIEBlZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24od29yZFJhbmdlLnN0YXJ0KVxuICAgICAgICBAZWRpdG9yLmdldFRleHRJbkJ1ZmZlclJhbmdlKHdvcmRSYW5nZSlcbiAgICAgIGVsc2VcbiAgICAgICAgJydcbiAgICApXG5cbiAgZ2V0UGF0dGVybjogKHRlcm0pIC0+XG4gICAgbW9kaWZpZXJzID0gaWYgQGlzQ2FzZVNlbnNpdGl2ZSh0ZXJtKSB0aGVuICdnJyBlbHNlICdnaSdcbiAgICBwYXR0ZXJuID0gXy5lc2NhcGVSZWdFeHAodGVybSlcbiAgICBpZiAvXFxXLy50ZXN0KHRlcm0pXG4gICAgICBuZXcgUmVnRXhwKFwiI3twYXR0ZXJufVxcXFxiXCIsIG1vZGlmaWVycylcbiAgICBlbHNlXG4gICAgICBuZXcgUmVnRXhwKFwiXFxcXGIje3BhdHRlcm59XFxcXGJcIiwgbW9kaWZpZXJzKVxuXG4gIGdldEN1cnJlbnRXb3JkQnVmZmVyUmFuZ2U6IC0+XG4gICAgY3Vyc29yID0gQGVkaXRvci5nZXRMYXN0Q3Vyc29yKClcbiAgICBwb2ludCA9IGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXG5cbiAgICBub25Xb3JkQ2hhcmFjdGVycyA9IGdldE5vbldvcmRDaGFyYWN0ZXJzRm9yQ3Vyc29yKGN1cnNvcilcbiAgICB3b3JkUmVnZXggPSBuZXcgUmVnRXhwKFwiW15cXFxccyN7Xy5lc2NhcGVSZWdFeHAobm9uV29yZENoYXJhY3RlcnMpfV0rXCIsICdnJylcblxuICAgIGZvdW5kID0gbnVsbFxuICAgIEBzY2FuRm9yd2FyZCB3b3JkUmVnZXgsIHtmcm9tOiBbcG9pbnQucm93LCAwXSwgYWxsb3dOZXh0TGluZTogZmFsc2V9LCAoe3JhbmdlLCBzdG9wfSkgLT5cbiAgICAgIGlmIHJhbmdlLmVuZC5pc0dyZWF0ZXJUaGFuKHBvaW50KVxuICAgICAgICBmb3VuZCA9IHJhbmdlXG4gICAgICAgIHN0b3AoKVxuICAgIGZvdW5kXG5cbmNsYXNzIFNlYXJjaEN1cnJlbnRXb3JkQmFja3dhcmRzIGV4dGVuZHMgU2VhcmNoQ3VycmVudFdvcmRcbiAgQGV4dGVuZCgpXG4gIGJhY2t3YXJkczogdHJ1ZVxuIl19
