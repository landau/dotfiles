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
      if (!(this.isMode('visual') || this.isMode('insert'))) {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvbW90aW9uLXNlYXJjaC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLG9MQUFBO0lBQUE7Ozs7O0VBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUjs7RUFFSixNQUF3RSxPQUFBLENBQVEsU0FBUixDQUF4RSxFQUFDLHFDQUFELEVBQWtCLGlFQUFsQixFQUFpRDs7RUFDakQsV0FBQSxHQUFjLE9BQUEsQ0FBUSxnQkFBUjs7RUFDZCxNQUFBLEdBQVMsT0FBQSxDQUFRLFFBQVIsQ0FBaUIsQ0FBQyxRQUFsQixDQUEyQixRQUEzQjs7RUFFSDs7Ozs7OztJQUNKLFVBQUMsQ0FBQSxNQUFELENBQVEsS0FBUjs7eUJBQ0EsSUFBQSxHQUFNOzt5QkFDTixTQUFBLEdBQVc7O3lCQUNYLFNBQUEsR0FBVzs7eUJBQ1gsV0FBQSxHQUFhOzt5QkFDYixZQUFBLEdBQWM7O3lCQUNkLG1CQUFBLEdBQXFCOzt5QkFDckIsYUFBQSxHQUFlOzt5QkFDZix1QkFBQSxHQUF5Qjs7eUJBRXpCLFdBQUEsR0FBYSxTQUFBO2FBQ1gsSUFBQyxDQUFBO0lBRFU7O3lCQUdiLG1CQUFBLEdBQXFCLFNBQUE7YUFDbkIsSUFBQyxFQUFBLFVBQUEsRUFBRCxDQUFZLFFBQVosQ0FBQSxJQUEwQixDQUFJLElBQUMsQ0FBQSxVQUFELENBQUEsQ0FBOUIsSUFBZ0QsSUFBQyxDQUFBLFNBQUQsQ0FBVyxtQkFBWDtJQUQ3Qjs7eUJBR3JCLFVBQUEsR0FBWSxTQUFBO01BQ1YsNENBQUEsU0FBQTthQUNBLElBQUMsQ0FBQSxvQkFBRCxDQUFzQixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7aUJBQ3BCLEtBQUMsQ0FBQSxNQUFELENBQUE7UUFEb0I7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXRCO0lBRlU7O3lC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LEtBQXJCLEVBQTJCLFNBQTNCLEVBSE47O0lBSFU7O2dDQVFaLHlCQUFBLEdBQTJCLFNBQUE7QUFDekIsVUFBQTtNQUFBLE1BQUEsR0FBUyxJQUFDLENBQUEsTUFBTSxDQUFDLGFBQVIsQ0FBQTtNQUNULEtBQUEsR0FBUSxNQUFNLENBQUMsaUJBQVAsQ0FBQTtNQUVSLGlCQUFBLEdBQW9CLDZCQUFBLENBQThCLE1BQTlCO01BQ3BCLFNBQUEsR0FBZ0IsSUFBQSxNQUFBLENBQU8sT0FBQSxHQUFPLENBQUMsQ0FBQyxDQUFDLFlBQUYsQ0FBZSxpQkFBZixDQUFELENBQVAsR0FBMEMsSUFBakQsRUFBc0QsR0FBdEQ7TUFFaEIsS0FBQSxHQUFRO01BQ1IsSUFBQyxDQUFBLFdBQUQsQ0FBYSxTQUFiLEVBQXdCO1FBQUMsSUFBQSxFQUFNLENBQUMsS0FBSyxDQUFDLEdBQVAsRUFBWSxDQUFaLENBQVA7UUFBdUIsYUFBQSxFQUFlLEtBQXRDO09BQXhCLEVBQXNFLFNBQUMsR0FBRDtBQUNwRSxZQUFBO1FBRHNFLG1CQUFPO1FBQzdFLElBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxhQUFWLENBQXdCLEtBQXhCLENBQUg7VUFDRSxLQUFBLEdBQVE7aUJBQ1IsSUFBQSxDQUFBLEVBRkY7O01BRG9FLENBQXRFO2FBSUE7SUFaeUI7Ozs7S0F0Qkc7O0VBb0MxQjs7Ozs7OztJQUNKLDBCQUFDLENBQUEsTUFBRCxDQUFBOzt5Q0FDQSxTQUFBLEdBQVc7Ozs7S0FGNEI7QUFsUHpDIiwic291cmNlc0NvbnRlbnQiOlsiXyA9IHJlcXVpcmUgJ3VuZGVyc2NvcmUtcGx1cydcblxue3NhdmVFZGl0b3JTdGF0ZSwgZ2V0Tm9uV29yZENoYXJhY3RlcnNGb3JDdXJzb3IsIHNlYXJjaEJ5UHJvamVjdEZpbmR9ID0gcmVxdWlyZSAnLi91dGlscydcblNlYXJjaE1vZGVsID0gcmVxdWlyZSAnLi9zZWFyY2gtbW9kZWwnXG5Nb3Rpb24gPSByZXF1aXJlKCcuL2Jhc2UnKS5nZXRDbGFzcygnTW90aW9uJylcblxuY2xhc3MgU2VhcmNoQmFzZSBleHRlbmRzIE1vdGlvblxuICBAZXh0ZW5kKGZhbHNlKVxuICBqdW1wOiB0cnVlXG4gIGJhY2t3YXJkczogZmFsc2VcbiAgdXNlUmVnZXhwOiB0cnVlXG4gIGNvbmZpZ1Njb3BlOiBudWxsXG4gIGxhbmRpbmdQb2ludDogbnVsbCAjIFsnc3RhcnQnIG9yICdlbmQnXVxuICBkZWZhdWx0TGFuZGluZ1BvaW50OiAnc3RhcnQnICMgWydzdGFydCcgb3IgJ2VuZCddXG4gIHJlbGF0aXZlSW5kZXg6IG51bGxcbiAgdXBkYXRlbGFzdFNlYXJjaFBhdHRlcm46IHRydWVcblxuICBpc0JhY2t3YXJkczogLT5cbiAgICBAYmFja3dhcmRzXG5cbiAgaXNJbmNyZW1lbnRhbFNlYXJjaDogLT5cbiAgICBAaW5zdGFuY2VvZignU2VhcmNoJykgYW5kIG5vdCBAaXNSZXBlYXRlZCgpIGFuZCBAZ2V0Q29uZmlnKCdpbmNyZW1lbnRhbFNlYXJjaCcpXG5cbiAgaW5pdGlhbGl6ZTogLT5cbiAgICBzdXBlclxuICAgIEBvbkRpZEZpbmlzaE9wZXJhdGlvbiA9PlxuICAgICAgQGZpbmlzaCgpXG5cbiAgZ2V0Q291bnQ6IC0+XG4gICAgY291bnQgPSBzdXBlclxuICAgIGlmIEBpc0JhY2t3YXJkcygpXG4gICAgICAtY291bnRcbiAgICBlbHNlXG4gICAgICBjb3VudFxuXG4gIGdldENhc2VTZW5zaXRpdml0eTogLT5cbiAgICBpZiBAZ2V0Q29uZmlnKFwidXNlU21hcnRjYXNlRm9yI3tAY29uZmlnU2NvcGV9XCIpXG4gICAgICAnc21hcnRjYXNlJ1xuICAgIGVsc2UgaWYgQGdldENvbmZpZyhcImlnbm9yZUNhc2VGb3Ije0Bjb25maWdTY29wZX1cIilcbiAgICAgICdpbnNlbnNpdGl2ZSdcbiAgICBlbHNlXG4gICAgICAnc2Vuc2l0aXZlJ1xuXG4gIGlzQ2FzZVNlbnNpdGl2ZTogKHRlcm0pIC0+XG4gICAgc3dpdGNoIEBnZXRDYXNlU2Vuc2l0aXZpdHkoKVxuICAgICAgd2hlbiAnc21hcnRjYXNlJyB0aGVuIHRlcm0uc2VhcmNoKCdbQS1aXScpIGlzbnQgLTFcbiAgICAgIHdoZW4gJ2luc2Vuc2l0aXZlJyB0aGVuIGZhbHNlXG4gICAgICB3aGVuICdzZW5zaXRpdmUnIHRoZW4gdHJ1ZVxuXG4gIGZpbmlzaDogLT5cbiAgICBpZiBAaXNJbmNyZW1lbnRhbFNlYXJjaCgpIGFuZCBAZ2V0Q29uZmlnKCdzaG93SG92ZXJTZWFyY2hDb3VudGVyJylcbiAgICAgIEB2aW1TdGF0ZS5ob3ZlclNlYXJjaENvdW50ZXIucmVzZXQoKVxuICAgIEByZWxhdGl2ZUluZGV4ID0gbnVsbFxuICAgIEBzZWFyY2hNb2RlbD8uZGVzdHJveSgpXG4gICAgQHNlYXJjaE1vZGVsID0gbnVsbFxuXG4gIGdldExhbmRpbmdQb2ludDogLT5cbiAgICBAbGFuZGluZ1BvaW50ID89IEBkZWZhdWx0TGFuZGluZ1BvaW50XG5cbiAgZ2V0UG9pbnQ6IChjdXJzb3IpIC0+XG4gICAgaWYgQHNlYXJjaE1vZGVsP1xuICAgICAgQHJlbGF0aXZlSW5kZXggPSBAZ2V0Q291bnQoKSArIEBzZWFyY2hNb2RlbC5nZXRSZWxhdGl2ZUluZGV4KClcbiAgICBlbHNlXG4gICAgICBAcmVsYXRpdmVJbmRleCA/PSBAZ2V0Q291bnQoKVxuXG4gICAgaWYgcmFuZ2UgPSBAc2VhcmNoKGN1cnNvciwgQGlucHV0LCBAcmVsYXRpdmVJbmRleClcbiAgICAgIHBvaW50ID0gcmFuZ2VbQGdldExhbmRpbmdQb2ludCgpXVxuXG4gICAgQHNlYXJjaE1vZGVsLmRlc3Ryb3koKVxuICAgIEBzZWFyY2hNb2RlbCA9IG51bGxcblxuICAgIHBvaW50XG5cbiAgbW92ZUN1cnNvcjogKGN1cnNvcikgLT5cbiAgICBpbnB1dCA9IEBnZXRJbnB1dCgpXG4gICAgcmV0dXJuIHVubGVzcyBpbnB1dFxuXG4gICAgaWYgcG9pbnQgPSBAZ2V0UG9pbnQoY3Vyc29yKVxuICAgICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHBvaW50LCBhdXRvc2Nyb2xsOiBmYWxzZSlcblxuICAgIHVubGVzcyBAaXNSZXBlYXRlZCgpXG4gICAgICBAZ2xvYmFsU3RhdGUuc2V0KCdjdXJyZW50U2VhcmNoJywgdGhpcylcbiAgICAgIEB2aW1TdGF0ZS5zZWFyY2hIaXN0b3J5LnNhdmUoaW5wdXQpXG5cbiAgICBpZiBAdXBkYXRlbGFzdFNlYXJjaFBhdHRlcm5cbiAgICAgIEBnbG9iYWxTdGF0ZS5zZXQoJ2xhc3RTZWFyY2hQYXR0ZXJuJywgQGdldFBhdHRlcm4oaW5wdXQpKVxuXG4gIGdldFNlYXJjaE1vZGVsOiAtPlxuICAgIEBzZWFyY2hNb2RlbCA/PSBuZXcgU2VhcmNoTW9kZWwoQHZpbVN0YXRlLCBpbmNyZW1lbnRhbFNlYXJjaDogQGlzSW5jcmVtZW50YWxTZWFyY2goKSlcblxuICBzZWFyY2g6IChjdXJzb3IsIGlucHV0LCByZWxhdGl2ZUluZGV4KSAtPlxuICAgIHNlYXJjaE1vZGVsID0gQGdldFNlYXJjaE1vZGVsKClcbiAgICBpZiBpbnB1dFxuICAgICAgZnJvbVBvaW50ID0gQGdldEJ1ZmZlclBvc2l0aW9uRm9yQ3Vyc29yKGN1cnNvcilcbiAgICAgIHNlYXJjaE1vZGVsLnNlYXJjaChmcm9tUG9pbnQsIEBnZXRQYXR0ZXJuKGlucHV0KSwgcmVsYXRpdmVJbmRleClcbiAgICBlbHNlXG4gICAgICBAdmltU3RhdGUuaG92ZXJTZWFyY2hDb3VudGVyLnJlc2V0KClcbiAgICAgIHNlYXJjaE1vZGVsLmNsZWFyTWFya2VycygpXG5cbiMgLywgP1xuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBTZWFyY2ggZXh0ZW5kcyBTZWFyY2hCYXNlXG4gIEBleHRlbmQoKVxuICBjb25maWdTY29wZTogXCJTZWFyY2hcIlxuICByZXF1aXJlSW5wdXQ6IHRydWVcblxuICBpbml0aWFsaXplOiAtPlxuICAgIHN1cGVyXG4gICAgcmV0dXJuIGlmIEBpc0NvbXBsZXRlKCkgIyBXaGVuIHJlcGVhdGVkLCBubyBuZWVkIHRvIGdldCB1c2VyIGlucHV0XG5cbiAgICBpZiBAaXNJbmNyZW1lbnRhbFNlYXJjaCgpXG4gICAgICBAcmVzdG9yZUVkaXRvclN0YXRlID0gc2F2ZUVkaXRvclN0YXRlKEBlZGl0b3IpXG4gICAgICBAb25EaWRDb21tYW5kU2VhcmNoKEBoYW5kbGVDb21tYW5kRXZlbnQuYmluZCh0aGlzKSlcblxuICAgIEBvbkRpZENvbmZpcm1TZWFyY2goQGhhbmRsZUNvbmZpcm1TZWFyY2guYmluZCh0aGlzKSlcbiAgICBAb25EaWRDYW5jZWxTZWFyY2goQGhhbmRsZUNhbmNlbFNlYXJjaC5iaW5kKHRoaXMpKVxuICAgIEBvbkRpZENoYW5nZVNlYXJjaChAaGFuZGxlQ2hhbmdlU2VhcmNoLmJpbmQodGhpcykpXG5cbiAgICBAZm9jdXNTZWFyY2hJbnB1dEVkaXRvcigpXG5cbiAgZm9jdXNTZWFyY2hJbnB1dEVkaXRvcjogLT5cbiAgICBjbGFzc0xpc3QgPSBbXVxuICAgIGNsYXNzTGlzdC5wdXNoKCdiYWNrd2FyZHMnKSBpZiBAYmFja3dhcmRzXG4gICAgQHZpbVN0YXRlLnNlYXJjaElucHV0LmZvY3VzKHtjbGFzc0xpc3R9KVxuXG4gIGhhbmRsZUNvbW1hbmRFdmVudDogKGNvbW1hbmRFdmVudCkgLT5cbiAgICByZXR1cm4gdW5sZXNzIGNvbW1hbmRFdmVudC5pbnB1dFxuICAgIHN3aXRjaCBjb21tYW5kRXZlbnQubmFtZVxuICAgICAgd2hlbiAndmlzaXQnXG4gICAgICAgIHtkaXJlY3Rpb259ID0gY29tbWFuZEV2ZW50XG4gICAgICAgIGlmIEBpc0JhY2t3YXJkcygpIGFuZCBAZ2V0Q29uZmlnKCdpbmNyZW1lbnRhbFNlYXJjaFZpc2l0RGlyZWN0aW9uJykgaXMgJ3JlbGF0aXZlJ1xuICAgICAgICAgIGRpcmVjdGlvbiA9IHN3aXRjaCBkaXJlY3Rpb25cbiAgICAgICAgICAgIHdoZW4gJ25leHQnIHRoZW4gJ3ByZXYnXG4gICAgICAgICAgICB3aGVuICdwcmV2JyB0aGVuICduZXh0J1xuXG4gICAgICAgIHN3aXRjaCBkaXJlY3Rpb25cbiAgICAgICAgICB3aGVuICduZXh0JyB0aGVuIEBnZXRTZWFyY2hNb2RlbCgpLnZpc2l0KCsxKVxuICAgICAgICAgIHdoZW4gJ3ByZXYnIHRoZW4gQGdldFNlYXJjaE1vZGVsKCkudmlzaXQoLTEpXG5cbiAgICAgIHdoZW4gJ29jY3VycmVuY2UnXG4gICAgICAgIHtvcGVyYXRpb24sIGlucHV0fSA9IGNvbW1hbmRFdmVudFxuICAgICAgICBAdmltU3RhdGUub2NjdXJyZW5jZU1hbmFnZXIuYWRkUGF0dGVybihAZ2V0UGF0dGVybihpbnB1dCksIHJlc2V0OiBvcGVyYXRpb24/KVxuICAgICAgICBAdmltU3RhdGUub2NjdXJyZW5jZU1hbmFnZXIuc2F2ZUxhc3RQYXR0ZXJuKClcblxuICAgICAgICBAdmltU3RhdGUuc2VhcmNoSGlzdG9yeS5zYXZlKGlucHV0KVxuICAgICAgICBAdmltU3RhdGUuc2VhcmNoSW5wdXQuY2FuY2VsKClcblxuICAgICAgICBAdmltU3RhdGUub3BlcmF0aW9uU3RhY2sucnVuKG9wZXJhdGlvbikgaWYgb3BlcmF0aW9uP1xuXG4gICAgICB3aGVuICdwcm9qZWN0LWZpbmQnXG4gICAgICAgIHtpbnB1dH0gPSBjb21tYW5kRXZlbnRcbiAgICAgICAgQHZpbVN0YXRlLnNlYXJjaEhpc3Rvcnkuc2F2ZShpbnB1dClcbiAgICAgICAgQHZpbVN0YXRlLnNlYXJjaElucHV0LmNhbmNlbCgpXG4gICAgICAgIHNlYXJjaEJ5UHJvamVjdEZpbmQoQGVkaXRvciwgaW5wdXQpXG5cbiAgaGFuZGxlQ2FuY2VsU2VhcmNoOiAtPlxuICAgIEB2aW1TdGF0ZS5yZXNldE5vcm1hbE1vZGUoKSB1bmxlc3MgQGlzTW9kZSgndmlzdWFsJykgb3IgQGlzTW9kZSgnaW5zZXJ0JylcbiAgICBAcmVzdG9yZUVkaXRvclN0YXRlPygpXG4gICAgQHZpbVN0YXRlLnJlc2V0KClcbiAgICBAZmluaXNoKClcblxuICBpc1NlYXJjaFJlcGVhdENoYXJhY3RlcjogKGNoYXIpIC0+XG4gICAgaWYgQGlzSW5jcmVtZW50YWxTZWFyY2goKVxuICAgICAgY2hhciBpcyAnJ1xuICAgIGVsc2VcbiAgICAgIHNlYXJjaENoYXIgPSBpZiBAaXNCYWNrd2FyZHMoKSB0aGVuICc/JyBlbHNlICcvJ1xuICAgICAgY2hhciBpbiBbJycsIHNlYXJjaENoYXJdXG5cbiAgaGFuZGxlQ29uZmlybVNlYXJjaDogKHtAaW5wdXQsIEBsYW5kaW5nUG9pbnR9KSA9PlxuICAgIGlmIEBpc1NlYXJjaFJlcGVhdENoYXJhY3RlcihAaW5wdXQpXG4gICAgICBAaW5wdXQgPSBAdmltU3RhdGUuc2VhcmNoSGlzdG9yeS5nZXQoJ3ByZXYnKVxuICAgICAgYXRvbS5iZWVwKCkgdW5sZXNzIEBpbnB1dFxuICAgIEBwcm9jZXNzT3BlcmF0aW9uKClcblxuICBoYW5kbGVDaGFuZ2VTZWFyY2g6IChpbnB1dCkgLT5cbiAgICAjIElmIGlucHV0IHN0YXJ0cyB3aXRoIHNwYWNlLCByZW1vdmUgZmlyc3Qgc3BhY2UgYW5kIGRpc2FibGUgdXNlUmVnZXhwLlxuICAgIGlmIGlucHV0LnN0YXJ0c1dpdGgoJyAnKVxuICAgICAgaW5wdXQgPSBpbnB1dC5yZXBsYWNlKC9eIC8sICcnKVxuICAgICAgQHVzZVJlZ2V4cCA9IGZhbHNlXG4gICAgQHZpbVN0YXRlLnNlYXJjaElucHV0LnVwZGF0ZU9wdGlvblNldHRpbmdzKHtAdXNlUmVnZXhwfSlcblxuICAgIGlmIEBpc0luY3JlbWVudGFsU2VhcmNoKClcbiAgICAgIEBzZWFyY2goQGVkaXRvci5nZXRMYXN0Q3Vyc29yKCksIGlucHV0LCBAZ2V0Q291bnQoKSlcblxuICBnZXRQYXR0ZXJuOiAodGVybSkgLT5cbiAgICBtb2RpZmllcnMgPSBpZiBAaXNDYXNlU2Vuc2l0aXZlKHRlcm0pIHRoZW4gJ2cnIGVsc2UgJ2dpJ1xuICAgICMgRklYTUUgdGhpcyBwcmV2ZW50IHNlYXJjaCBcXFxcYyBpdHNlbGYuXG4gICAgIyBET05UIHRoaW5rbGVzc2x5IG1pbWljIHB1cmUgVmltLiBJbnN0ZWFkLCBwcm92aWRlIGlnbm9yZWNhc2UgYnV0dG9uIGFuZCBzaG9ydGN1dC5cbiAgICBpZiB0ZXJtLmluZGV4T2YoJ1xcXFxjJykgPj0gMFxuICAgICAgdGVybSA9IHRlcm0ucmVwbGFjZSgnXFxcXGMnLCAnJylcbiAgICAgIG1vZGlmaWVycyArPSAnaScgdW5sZXNzICdpJyBpbiBtb2RpZmllcnNcblxuICAgIGlmIEB1c2VSZWdleHBcbiAgICAgIHRyeVxuICAgICAgICByZXR1cm4gbmV3IFJlZ0V4cCh0ZXJtLCBtb2RpZmllcnMpXG4gICAgICBjYXRjaFxuICAgICAgICBudWxsXG5cbiAgICBuZXcgUmVnRXhwKF8uZXNjYXBlUmVnRXhwKHRlcm0pLCBtb2RpZmllcnMpXG5cbmNsYXNzIFNlYXJjaEJhY2t3YXJkcyBleHRlbmRzIFNlYXJjaFxuICBAZXh0ZW5kKClcbiAgYmFja3dhcmRzOiB0cnVlXG5cbiMgKiwgI1xuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBTZWFyY2hDdXJyZW50V29yZCBleHRlbmRzIFNlYXJjaEJhc2VcbiAgQGV4dGVuZCgpXG4gIGNvbmZpZ1Njb3BlOiBcIlNlYXJjaEN1cnJlbnRXb3JkXCJcblxuICBnZXRJbnB1dDogLT5cbiAgICBAaW5wdXQgPz0gKFxuICAgICAgd29yZFJhbmdlID0gQGdldEN1cnJlbnRXb3JkQnVmZmVyUmFuZ2UoKVxuICAgICAgaWYgd29yZFJhbmdlP1xuICAgICAgICBAZWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKHdvcmRSYW5nZS5zdGFydClcbiAgICAgICAgQGVkaXRvci5nZXRUZXh0SW5CdWZmZXJSYW5nZSh3b3JkUmFuZ2UpXG4gICAgICBlbHNlXG4gICAgICAgICcnXG4gICAgKVxuXG4gIGdldFBhdHRlcm46ICh0ZXJtKSAtPlxuICAgIG1vZGlmaWVycyA9IGlmIEBpc0Nhc2VTZW5zaXRpdmUodGVybSkgdGhlbiAnZycgZWxzZSAnZ2knXG4gICAgcGF0dGVybiA9IF8uZXNjYXBlUmVnRXhwKHRlcm0pXG4gICAgaWYgL1xcVy8udGVzdCh0ZXJtKVxuICAgICAgbmV3IFJlZ0V4cChcIiN7cGF0dGVybn1cXFxcYlwiLCBtb2RpZmllcnMpXG4gICAgZWxzZVxuICAgICAgbmV3IFJlZ0V4cChcIlxcXFxiI3twYXR0ZXJufVxcXFxiXCIsIG1vZGlmaWVycylcblxuICBnZXRDdXJyZW50V29yZEJ1ZmZlclJhbmdlOiAtPlxuICAgIGN1cnNvciA9IEBlZGl0b3IuZ2V0TGFzdEN1cnNvcigpXG4gICAgcG9pbnQgPSBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuXG4gICAgbm9uV29yZENoYXJhY3RlcnMgPSBnZXROb25Xb3JkQ2hhcmFjdGVyc0ZvckN1cnNvcihjdXJzb3IpXG4gICAgd29yZFJlZ2V4ID0gbmV3IFJlZ0V4cChcIlteXFxcXHMje18uZXNjYXBlUmVnRXhwKG5vbldvcmRDaGFyYWN0ZXJzKX1dK1wiLCAnZycpXG5cbiAgICBmb3VuZCA9IG51bGxcbiAgICBAc2NhbkZvcndhcmQgd29yZFJlZ2V4LCB7ZnJvbTogW3BvaW50LnJvdywgMF0sIGFsbG93TmV4dExpbmU6IGZhbHNlfSwgKHtyYW5nZSwgc3RvcH0pIC0+XG4gICAgICBpZiByYW5nZS5lbmQuaXNHcmVhdGVyVGhhbihwb2ludClcbiAgICAgICAgZm91bmQgPSByYW5nZVxuICAgICAgICBzdG9wKClcbiAgICBmb3VuZFxuXG5jbGFzcyBTZWFyY2hDdXJyZW50V29yZEJhY2t3YXJkcyBleHRlbmRzIFNlYXJjaEN1cnJlbnRXb3JkXG4gIEBleHRlbmQoKVxuICBiYWNrd2FyZHM6IHRydWVcbiJdfQ==
