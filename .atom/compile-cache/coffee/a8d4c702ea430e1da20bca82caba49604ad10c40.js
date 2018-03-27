(function() {
  var Motion, Search, SearchBackwards, SearchBase, SearchCurrentWord, SearchCurrentWordBackwards, SearchModel, _, getCaseSensitivity, getNonWordCharactersForCursor, ref, saveEditorState, searchByProjectFind, settings,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  _ = require('underscore-plus');

  ref = require('./utils'), saveEditorState = ref.saveEditorState, getNonWordCharactersForCursor = ref.getNonWordCharactersForCursor, searchByProjectFind = ref.searchByProjectFind;

  SearchModel = require('./search-model');

  settings = require('./settings');

  Motion = require('./base').getClass('Motion');

  getCaseSensitivity = function(searchName) {
    if (settings.get("useSmartcaseFor" + searchName)) {
      return 'smartcase';
    } else if (settings.get("ignoreCaseFor" + searchName)) {
      return 'insensitive';
    } else {
      return 'sensitive';
    }
  };

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
      return this["instanceof"]('Search') && !this.isRepeated() && settings.get('incrementalSearch');
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

    SearchBase.prototype.isCaseSensitive = function(term) {
      switch (getCaseSensitivity(this.configScope)) {
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
      if (this.isIncrementalSearch() && settings.get('showHoverSearchCounter')) {
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
          if (this.isBackwards() && settings.get('incrementalSearchVisitDirection') === 'relative') {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvbW90aW9uLXNlYXJjaC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLGtOQUFBO0lBQUE7Ozs7O0VBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUjs7RUFFSixNQUF3RSxPQUFBLENBQVEsU0FBUixDQUF4RSxFQUFDLHFDQUFELEVBQWtCLGlFQUFsQixFQUFpRDs7RUFDakQsV0FBQSxHQUFjLE9BQUEsQ0FBUSxnQkFBUjs7RUFDZCxRQUFBLEdBQVcsT0FBQSxDQUFRLFlBQVI7O0VBQ1gsTUFBQSxHQUFTLE9BQUEsQ0FBUSxRQUFSLENBQWlCLENBQUMsUUFBbEIsQ0FBMkIsUUFBM0I7O0VBRVQsa0JBQUEsR0FBcUIsU0FBQyxVQUFEO0lBRW5CLElBQUcsUUFBUSxDQUFDLEdBQVQsQ0FBYSxpQkFBQSxHQUFrQixVQUEvQixDQUFIO2FBQ0UsWUFERjtLQUFBLE1BRUssSUFBRyxRQUFRLENBQUMsR0FBVCxDQUFhLGVBQUEsR0FBZ0IsVUFBN0IsQ0FBSDthQUNILGNBREc7S0FBQSxNQUFBO2FBR0gsWUFIRzs7RUFKYzs7RUFTZjs7Ozs7OztJQUNKLFVBQUMsQ0FBQSxNQUFELENBQVEsS0FBUjs7eUJBQ0EsSUFBQSxHQUFNOzt5QkFDTixTQUFBLEdBQVc7O3lCQUNYLFNBQUEsR0FBVzs7eUJBQ1gsV0FBQSxHQUFhOzt5QkFDYixZQUFBLEdBQWM7O3lCQUNkLG1CQUFBLEdBQXFCOzt5QkFDckIsYUFBQSxHQUFlOzt5QkFDZix1QkFBQSxHQUF5Qjs7eUJBRXpCLFdBQUEsR0FBYSxTQUFBO2FBQ1gsSUFBQyxDQUFBO0lBRFU7O3lCQUdiLG1CQUFBLEdBQXFCLFNBQUE7YUFDbkIsSUFBQyxFQUFBLFVBQUEsRUFBRCxDQUFZLFFBQVosQ0FBQSxJQUEwQixDQUFJLElBQUMsQ0FBQSxV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TyxLQUFBLEdBQU0sT0FBTixHQUFjLEtBQXJCLEVBQTJCLFNBQTNCLEVBSE47O0lBSFU7O2dDQVFaLHlCQUFBLEdBQTJCLFNBQUE7QUFDekIsVUFBQTtNQUFBLE1BQUEsR0FBUyxJQUFDLENBQUEsTUFBTSxDQUFDLGFBQVIsQ0FBQTtNQUNULEtBQUEsR0FBUSxNQUFNLENBQUMsaUJBQVAsQ0FBQTtNQUVSLGlCQUFBLEdBQW9CLDZCQUFBLENBQThCLE1BQTlCO01BQ3BCLFNBQUEsR0FBZ0IsSUFBQSxNQUFBLENBQU8sT0FBQSxHQUFPLENBQUMsQ0FBQyxDQUFDLFlBQUYsQ0FBZSxpQkFBZixDQUFELENBQVAsR0FBMEMsSUFBakQsRUFBc0QsR0FBdEQ7TUFFaEIsS0FBQSxHQUFRO01BQ1IsSUFBQyxDQUFBLFdBQUQsQ0FBYSxTQUFiLEVBQXdCO1FBQUMsSUFBQSxFQUFNLENBQUMsS0FBSyxDQUFDLEdBQVAsRUFBWSxDQUFaLENBQVA7UUFBdUIsYUFBQSxFQUFlLEtBQXRDO09BQXhCLEVBQXNFLFNBQUMsR0FBRDtBQUNwRSxZQUFBO1FBRHNFLG1CQUFPO1FBQzdFLElBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxhQUFWLENBQXdCLEtBQXhCLENBQUg7VUFDRSxLQUFBLEdBQVE7aUJBQ1IsSUFBQSxDQUFBLEVBRkY7O01BRG9FLENBQXRFO2FBSUE7SUFaeUI7Ozs7S0F0Qkc7O0VBb0MxQjs7Ozs7OztJQUNKLDBCQUFDLENBQUEsTUFBRCxDQUFBOzt5Q0FDQSxTQUFBLEdBQVc7Ozs7S0FGNEI7QUFwUHpDIiwic291cmNlc0NvbnRlbnQiOlsiXyA9IHJlcXVpcmUgJ3VuZGVyc2NvcmUtcGx1cydcblxue3NhdmVFZGl0b3JTdGF0ZSwgZ2V0Tm9uV29yZENoYXJhY3RlcnNGb3JDdXJzb3IsIHNlYXJjaEJ5UHJvamVjdEZpbmR9ID0gcmVxdWlyZSAnLi91dGlscydcblNlYXJjaE1vZGVsID0gcmVxdWlyZSAnLi9zZWFyY2gtbW9kZWwnXG5zZXR0aW5ncyA9IHJlcXVpcmUgJy4vc2V0dGluZ3MnXG5Nb3Rpb24gPSByZXF1aXJlKCcuL2Jhc2UnKS5nZXRDbGFzcygnTW90aW9uJylcblxuZ2V0Q2FzZVNlbnNpdGl2aXR5ID0gKHNlYXJjaE5hbWUpIC0+XG4gICMgW1RPRE9dIGRlcHJlY2F0ZSBvbGQgc2V0dGluZyBhbmQgYXV0by1taWdyYXRlIHRvIGNhc2VTZW5zaXRpdml0eUZvclhYWFxuICBpZiBzZXR0aW5ncy5nZXQoXCJ1c2VTbWFydGNhc2VGb3Ije3NlYXJjaE5hbWV9XCIpXG4gICAgJ3NtYXJ0Y2FzZSdcbiAgZWxzZSBpZiBzZXR0aW5ncy5nZXQoXCJpZ25vcmVDYXNlRm9yI3tzZWFyY2hOYW1lfVwiKVxuICAgICdpbnNlbnNpdGl2ZSdcbiAgZWxzZVxuICAgICdzZW5zaXRpdmUnXG5cbmNsYXNzIFNlYXJjaEJhc2UgZXh0ZW5kcyBNb3Rpb25cbiAgQGV4dGVuZChmYWxzZSlcbiAganVtcDogdHJ1ZVxuICBiYWNrd2FyZHM6IGZhbHNlXG4gIHVzZVJlZ2V4cDogdHJ1ZVxuICBjb25maWdTY29wZTogbnVsbFxuICBsYW5kaW5nUG9pbnQ6IG51bGwgIyBbJ3N0YXJ0JyBvciAnZW5kJ11cbiAgZGVmYXVsdExhbmRpbmdQb2ludDogJ3N0YXJ0JyAjIFsnc3RhcnQnIG9yICdlbmQnXVxuICByZWxhdGl2ZUluZGV4OiBudWxsXG4gIHVwZGF0ZWxhc3RTZWFyY2hQYXR0ZXJuOiB0cnVlXG5cbiAgaXNCYWNrd2FyZHM6IC0+XG4gICAgQGJhY2t3YXJkc1xuXG4gIGlzSW5jcmVtZW50YWxTZWFyY2g6IC0+XG4gICAgQGluc3RhbmNlb2YoJ1NlYXJjaCcpIGFuZCBub3QgQGlzUmVwZWF0ZWQoKSBhbmQgc2V0dGluZ3MuZ2V0KCdpbmNyZW1lbnRhbFNlYXJjaCcpXG5cbiAgaW5pdGlhbGl6ZTogLT5cbiAgICBzdXBlclxuICAgIEBvbkRpZEZpbmlzaE9wZXJhdGlvbiA9PlxuICAgICAgQGZpbmlzaCgpXG5cbiAgZ2V0Q291bnQ6IC0+XG4gICAgY291bnQgPSBzdXBlclxuICAgIGlmIEBpc0JhY2t3YXJkcygpXG4gICAgICAtY291bnRcbiAgICBlbHNlXG4gICAgICBjb3VudFxuXG4gIGlzQ2FzZVNlbnNpdGl2ZTogKHRlcm0pIC0+XG4gICAgc3dpdGNoIGdldENhc2VTZW5zaXRpdml0eShAY29uZmlnU2NvcGUpXG4gICAgICB3aGVuICdzbWFydGNhc2UnIHRoZW4gdGVybS5zZWFyY2goJ1tBLVpdJykgaXNudCAtMVxuICAgICAgd2hlbiAnaW5zZW5zaXRpdmUnIHRoZW4gZmFsc2VcbiAgICAgIHdoZW4gJ3NlbnNpdGl2ZScgdGhlbiB0cnVlXG5cbiAgZmluaXNoOiAtPlxuICAgIGlmIEBpc0luY3JlbWVudGFsU2VhcmNoKCkgYW5kIHNldHRpbmdzLmdldCgnc2hvd0hvdmVyU2VhcmNoQ291bnRlcicpXG4gICAgICBAdmltU3RhdGUuaG92ZXJTZWFyY2hDb3VudGVyLnJlc2V0KClcbiAgICBAcmVsYXRpdmVJbmRleCA9IG51bGxcbiAgICBAc2VhcmNoTW9kZWw/LmRlc3Ryb3koKVxuICAgIEBzZWFyY2hNb2RlbCA9IG51bGxcblxuICBnZXRMYW5kaW5nUG9pbnQ6IC0+XG4gICAgQGxhbmRpbmdQb2ludCA/PSBAZGVmYXVsdExhbmRpbmdQb2ludFxuXG4gIGdldFBvaW50OiAoY3Vyc29yKSAtPlxuICAgIGlmIEBzZWFyY2hNb2RlbD9cbiAgICAgIEByZWxhdGl2ZUluZGV4ID0gQGdldENvdW50KCkgKyBAc2VhcmNoTW9kZWwuZ2V0UmVsYXRpdmVJbmRleCgpXG4gICAgZWxzZVxuICAgICAgQHJlbGF0aXZlSW5kZXggPz0gQGdldENvdW50KClcblxuICAgIGlmIHJhbmdlID0gQHNlYXJjaChjdXJzb3IsIEBpbnB1dCwgQHJlbGF0aXZlSW5kZXgpXG4gICAgICBwb2ludCA9IHJhbmdlW0BnZXRMYW5kaW5nUG9pbnQoKV1cblxuICAgIEBzZWFyY2hNb2RlbC5kZXN0cm95KClcbiAgICBAc2VhcmNoTW9kZWwgPSBudWxsXG5cbiAgICBwb2ludFxuXG4gIG1vdmVDdXJzb3I6IChjdXJzb3IpIC0+XG4gICAgaW5wdXQgPSBAZ2V0SW5wdXQoKVxuICAgIHJldHVybiB1bmxlc3MgaW5wdXRcblxuICAgIGlmIHBvaW50ID0gQGdldFBvaW50KGN1cnNvcilcbiAgICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihwb2ludCwgYXV0b3Njcm9sbDogZmFsc2UpXG5cbiAgICB1bmxlc3MgQGlzUmVwZWF0ZWQoKVxuICAgICAgQGdsb2JhbFN0YXRlLnNldCgnY3VycmVudFNlYXJjaCcsIHRoaXMpXG4gICAgICBAdmltU3RhdGUuc2VhcmNoSGlzdG9yeS5zYXZlKGlucHV0KVxuXG4gICAgaWYgQHVwZGF0ZWxhc3RTZWFyY2hQYXR0ZXJuXG4gICAgICBAZ2xvYmFsU3RhdGUuc2V0KCdsYXN0U2VhcmNoUGF0dGVybicsIEBnZXRQYXR0ZXJuKGlucHV0KSlcblxuICBnZXRTZWFyY2hNb2RlbDogLT5cbiAgICBAc2VhcmNoTW9kZWwgPz0gbmV3IFNlYXJjaE1vZGVsKEB2aW1TdGF0ZSwgaW5jcmVtZW50YWxTZWFyY2g6IEBpc0luY3JlbWVudGFsU2VhcmNoKCkpXG5cbiAgc2VhcmNoOiAoY3Vyc29yLCBpbnB1dCwgcmVsYXRpdmVJbmRleCkgLT5cbiAgICBzZWFyY2hNb2RlbCA9IEBnZXRTZWFyY2hNb2RlbCgpXG4gICAgaWYgaW5wdXRcbiAgICAgIGZyb21Qb2ludCA9IEBnZXRCdWZmZXJQb3NpdGlvbkZvckN1cnNvcihjdXJzb3IpXG4gICAgICBzZWFyY2hNb2RlbC5zZWFyY2goZnJvbVBvaW50LCBAZ2V0UGF0dGVybihpbnB1dCksIHJlbGF0aXZlSW5kZXgpXG4gICAgZWxzZVxuICAgICAgQHZpbVN0YXRlLmhvdmVyU2VhcmNoQ291bnRlci5yZXNldCgpXG4gICAgICBzZWFyY2hNb2RlbC5jbGVhck1hcmtlcnMoKVxuXG4jIC8sID9cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgU2VhcmNoIGV4dGVuZHMgU2VhcmNoQmFzZVxuICBAZXh0ZW5kKClcbiAgY29uZmlnU2NvcGU6IFwiU2VhcmNoXCJcbiAgcmVxdWlyZUlucHV0OiB0cnVlXG5cbiAgaW5pdGlhbGl6ZTogLT5cbiAgICBzdXBlclxuICAgIHJldHVybiBpZiBAaXNDb21wbGV0ZSgpICMgV2hlbiByZXBlYXRlZCwgbm8gbmVlZCB0byBnZXQgdXNlciBpbnB1dFxuXG4gICAgaWYgQGlzSW5jcmVtZW50YWxTZWFyY2goKVxuICAgICAgQHJlc3RvcmVFZGl0b3JTdGF0ZSA9IHNhdmVFZGl0b3JTdGF0ZShAZWRpdG9yKVxuICAgICAgQG9uRGlkQ29tbWFuZFNlYXJjaChAaGFuZGxlQ29tbWFuZEV2ZW50LmJpbmQodGhpcykpXG5cbiAgICBAb25EaWRDb25maXJtU2VhcmNoKEBoYW5kbGVDb25maXJtU2VhcmNoLmJpbmQodGhpcykpXG4gICAgQG9uRGlkQ2FuY2VsU2VhcmNoKEBoYW5kbGVDYW5jZWxTZWFyY2guYmluZCh0aGlzKSlcbiAgICBAb25EaWRDaGFuZ2VTZWFyY2goQGhhbmRsZUNoYW5nZVNlYXJjaC5iaW5kKHRoaXMpKVxuXG4gICAgQGZvY3VzU2VhcmNoSW5wdXRFZGl0b3IoKVxuXG4gIGZvY3VzU2VhcmNoSW5wdXRFZGl0b3I6IC0+XG4gICAgY2xhc3NMaXN0ID0gW11cbiAgICBjbGFzc0xpc3QucHVzaCgnYmFja3dhcmRzJykgaWYgQGJhY2t3YXJkc1xuICAgIEB2aW1TdGF0ZS5zZWFyY2hJbnB1dC5mb2N1cyh7Y2xhc3NMaXN0fSlcblxuICBoYW5kbGVDb21tYW5kRXZlbnQ6IChjb21tYW5kRXZlbnQpIC0+XG4gICAgcmV0dXJuIHVubGVzcyBjb21tYW5kRXZlbnQuaW5wdXRcbiAgICBzd2l0Y2ggY29tbWFuZEV2ZW50Lm5hbWVcbiAgICAgIHdoZW4gJ3Zpc2l0J1xuICAgICAgICB7ZGlyZWN0aW9ufSA9IGNvbW1hbmRFdmVudFxuICAgICAgICBpZiBAaXNCYWNrd2FyZHMoKSBhbmQgc2V0dGluZ3MuZ2V0KCdpbmNyZW1lbnRhbFNlYXJjaFZpc2l0RGlyZWN0aW9uJykgaXMgJ3JlbGF0aXZlJ1xuICAgICAgICAgIGRpcmVjdGlvbiA9IHN3aXRjaCBkaXJlY3Rpb25cbiAgICAgICAgICAgIHdoZW4gJ25leHQnIHRoZW4gJ3ByZXYnXG4gICAgICAgICAgICB3aGVuICdwcmV2JyB0aGVuICduZXh0J1xuXG4gICAgICAgIHN3aXRjaCBkaXJlY3Rpb25cbiAgICAgICAgICB3aGVuICduZXh0JyB0aGVuIEBnZXRTZWFyY2hNb2RlbCgpLnZpc2l0KCsxKVxuICAgICAgICAgIHdoZW4gJ3ByZXYnIHRoZW4gQGdldFNlYXJjaE1vZGVsKCkudmlzaXQoLTEpXG5cbiAgICAgIHdoZW4gJ29jY3VycmVuY2UnXG4gICAgICAgIHtvcGVyYXRpb24sIGlucHV0fSA9IGNvbW1hbmRFdmVudFxuICAgICAgICBAdmltU3RhdGUub2NjdXJyZW5jZU1hbmFnZXIuYWRkUGF0dGVybihAZ2V0UGF0dGVybihpbnB1dCksIHJlc2V0OiBvcGVyYXRpb24/KVxuICAgICAgICBAdmltU3RhdGUub2NjdXJyZW5jZU1hbmFnZXIuc2F2ZUxhc3RQYXR0ZXJuKClcblxuICAgICAgICBAdmltU3RhdGUuc2VhcmNoSGlzdG9yeS5zYXZlKGlucHV0KVxuICAgICAgICBAdmltU3RhdGUuc2VhcmNoSW5wdXQuY2FuY2VsKClcblxuICAgICAgICBAdmltU3RhdGUub3BlcmF0aW9uU3RhY2sucnVuKG9wZXJhdGlvbikgaWYgb3BlcmF0aW9uP1xuXG4gICAgICB3aGVuICdwcm9qZWN0LWZpbmQnXG4gICAgICAgIHtpbnB1dH0gPSBjb21tYW5kRXZlbnRcbiAgICAgICAgQHZpbVN0YXRlLnNlYXJjaEhpc3Rvcnkuc2F2ZShpbnB1dClcbiAgICAgICAgQHZpbVN0YXRlLnNlYXJjaElucHV0LmNhbmNlbCgpXG4gICAgICAgIHNlYXJjaEJ5UHJvamVjdEZpbmQoQGVkaXRvciwgaW5wdXQpXG5cbiAgaGFuZGxlQ2FuY2VsU2VhcmNoOiAtPlxuICAgIEB2aW1TdGF0ZS5yZXNldE5vcm1hbE1vZGUoKSB1bmxlc3MgQGlzTW9kZSgndmlzdWFsJykgb3IgQGlzTW9kZSgnaW5zZXJ0JylcbiAgICBAcmVzdG9yZUVkaXRvclN0YXRlPygpXG4gICAgQHZpbVN0YXRlLnJlc2V0KClcbiAgICBAZmluaXNoKClcblxuICBpc1NlYXJjaFJlcGVhdENoYXJhY3RlcjogKGNoYXIpIC0+XG4gICAgaWYgQGlzSW5jcmVtZW50YWxTZWFyY2goKVxuICAgICAgY2hhciBpcyAnJ1xuICAgIGVsc2VcbiAgICAgIHNlYXJjaENoYXIgPSBpZiBAaXNCYWNrd2FyZHMoKSB0aGVuICc/JyBlbHNlICcvJ1xuICAgICAgY2hhciBpbiBbJycsIHNlYXJjaENoYXJdXG5cbiAgaGFuZGxlQ29uZmlybVNlYXJjaDogKHtAaW5wdXQsIEBsYW5kaW5nUG9pbnR9KSA9PlxuICAgIGlmIEBpc1NlYXJjaFJlcGVhdENoYXJhY3RlcihAaW5wdXQpXG4gICAgICBAaW5wdXQgPSBAdmltU3RhdGUuc2VhcmNoSGlzdG9yeS5nZXQoJ3ByZXYnKVxuICAgICAgYXRvbS5iZWVwKCkgdW5sZXNzIEBpbnB1dFxuICAgIEBwcm9jZXNzT3BlcmF0aW9uKClcblxuICBoYW5kbGVDaGFuZ2VTZWFyY2g6IChpbnB1dCkgLT5cbiAgICAjIElmIGlucHV0IHN0YXJ0cyB3aXRoIHNwYWNlLCByZW1vdmUgZmlyc3Qgc3BhY2UgYW5kIGRpc2FibGUgdXNlUmVnZXhwLlxuICAgIGlmIGlucHV0LnN0YXJ0c1dpdGgoJyAnKVxuICAgICAgaW5wdXQgPSBpbnB1dC5yZXBsYWNlKC9eIC8sICcnKVxuICAgICAgQHVzZVJlZ2V4cCA9IGZhbHNlXG4gICAgQHZpbVN0YXRlLnNlYXJjaElucHV0LnVwZGF0ZU9wdGlvblNldHRpbmdzKHtAdXNlUmVnZXhwfSlcblxuICAgIGlmIEBpc0luY3JlbWVudGFsU2VhcmNoKClcbiAgICAgIEBzZWFyY2goQGVkaXRvci5nZXRMYXN0Q3Vyc29yKCksIGlucHV0LCBAZ2V0Q291bnQoKSlcblxuICBnZXRQYXR0ZXJuOiAodGVybSkgLT5cbiAgICBtb2RpZmllcnMgPSBpZiBAaXNDYXNlU2Vuc2l0aXZlKHRlcm0pIHRoZW4gJ2cnIGVsc2UgJ2dpJ1xuICAgICMgRklYTUUgdGhpcyBwcmV2ZW50IHNlYXJjaCBcXFxcYyBpdHNlbGYuXG4gICAgIyBET05UIHRoaW5rbGVzc2x5IG1pbWljIHB1cmUgVmltLiBJbnN0ZWFkLCBwcm92aWRlIGlnbm9yZWNhc2UgYnV0dG9uIGFuZCBzaG9ydGN1dC5cbiAgICBpZiB0ZXJtLmluZGV4T2YoJ1xcXFxjJykgPj0gMFxuICAgICAgdGVybSA9IHRlcm0ucmVwbGFjZSgnXFxcXGMnLCAnJylcbiAgICAgIG1vZGlmaWVycyArPSAnaScgdW5sZXNzICdpJyBpbiBtb2RpZmllcnNcblxuICAgIGlmIEB1c2VSZWdleHBcbiAgICAgIHRyeVxuICAgICAgICByZXR1cm4gbmV3IFJlZ0V4cCh0ZXJtLCBtb2RpZmllcnMpXG4gICAgICBjYXRjaFxuICAgICAgICBudWxsXG5cbiAgICBuZXcgUmVnRXhwKF8uZXNjYXBlUmVnRXhwKHRlcm0pLCBtb2RpZmllcnMpXG5cbmNsYXNzIFNlYXJjaEJhY2t3YXJkcyBleHRlbmRzIFNlYXJjaFxuICBAZXh0ZW5kKClcbiAgYmFja3dhcmRzOiB0cnVlXG5cbiMgKiwgI1xuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBTZWFyY2hDdXJyZW50V29yZCBleHRlbmRzIFNlYXJjaEJhc2VcbiAgQGV4dGVuZCgpXG4gIGNvbmZpZ1Njb3BlOiBcIlNlYXJjaEN1cnJlbnRXb3JkXCJcblxuICBnZXRJbnB1dDogLT5cbiAgICBAaW5wdXQgPz0gKFxuICAgICAgd29yZFJhbmdlID0gQGdldEN1cnJlbnRXb3JkQnVmZmVyUmFuZ2UoKVxuICAgICAgaWYgd29yZFJhbmdlP1xuICAgICAgICBAZWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKHdvcmRSYW5nZS5zdGFydClcbiAgICAgICAgQGVkaXRvci5nZXRUZXh0SW5CdWZmZXJSYW5nZSh3b3JkUmFuZ2UpXG4gICAgICBlbHNlXG4gICAgICAgICcnXG4gICAgKVxuXG4gIGdldFBhdHRlcm46ICh0ZXJtKSAtPlxuICAgIG1vZGlmaWVycyA9IGlmIEBpc0Nhc2VTZW5zaXRpdmUodGVybSkgdGhlbiAnZycgZWxzZSAnZ2knXG4gICAgcGF0dGVybiA9IF8uZXNjYXBlUmVnRXhwKHRlcm0pXG4gICAgaWYgL1xcVy8udGVzdCh0ZXJtKVxuICAgICAgbmV3IFJlZ0V4cChcIiN7cGF0dGVybn1cXFxcYlwiLCBtb2RpZmllcnMpXG4gICAgZWxzZVxuICAgICAgbmV3IFJlZ0V4cChcIlxcXFxiI3twYXR0ZXJufVxcXFxiXCIsIG1vZGlmaWVycylcblxuICBnZXRDdXJyZW50V29yZEJ1ZmZlclJhbmdlOiAtPlxuICAgIGN1cnNvciA9IEBlZGl0b3IuZ2V0TGFzdEN1cnNvcigpXG4gICAgcG9pbnQgPSBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuXG4gICAgbm9uV29yZENoYXJhY3RlcnMgPSBnZXROb25Xb3JkQ2hhcmFjdGVyc0ZvckN1cnNvcihjdXJzb3IpXG4gICAgd29yZFJlZ2V4ID0gbmV3IFJlZ0V4cChcIlteXFxcXHMje18uZXNjYXBlUmVnRXhwKG5vbldvcmRDaGFyYWN0ZXJzKX1dK1wiLCAnZycpXG5cbiAgICBmb3VuZCA9IG51bGxcbiAgICBAc2NhbkZvcndhcmQgd29yZFJlZ2V4LCB7ZnJvbTogW3BvaW50LnJvdywgMF0sIGFsbG93TmV4dExpbmU6IGZhbHNlfSwgKHtyYW5nZSwgc3RvcH0pIC0+XG4gICAgICBpZiByYW5nZS5lbmQuaXNHcmVhdGVyVGhhbihwb2ludClcbiAgICAgICAgZm91bmQgPSByYW5nZVxuICAgICAgICBzdG9wKClcbiAgICBmb3VuZFxuXG5jbGFzcyBTZWFyY2hDdXJyZW50V29yZEJhY2t3YXJkcyBleHRlbmRzIFNlYXJjaEN1cnJlbnRXb3JkXG4gIEBleHRlbmQoKVxuICBiYWNrd2FyZHM6IHRydWVcbiJdfQ==
