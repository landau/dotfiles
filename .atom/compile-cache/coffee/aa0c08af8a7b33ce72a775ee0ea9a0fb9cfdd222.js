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

    SearchBase.prototype.caseSensitivityKind = null;

    SearchBase.prototype.landingPoint = null;

    SearchBase.prototype.defaultLandingPoint = 'start';

    SearchBase.prototype.relativeIndex = null;

    SearchBase.prototype.updatelastSearchPattern = true;

    SearchBase.prototype.isBackwards = function() {
      return this.backwards;
    };

    SearchBase.prototype.isIncrementalSearch = function() {
      return this["instanceof"]('Search') && !this.repeated && this.getConfig('incrementalSearch');
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
      input = this.input;
      if (!input) {
        return;
      }
      if (point = this.getPoint(cursor)) {
        cursor.setBufferPosition(point, {
          autoscroll: false
        });
      }
      if (!this.repeated) {
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

    Search.prototype.caseSensitivityKind = "Search";

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

    SearchCurrentWord.prototype.caseSensitivityKind = "SearchCurrentWord";

    SearchCurrentWord.prototype.moveCursor = function(cursor) {
      var wordRange;
      if (this.input == null) {
        this.input = (wordRange = this.getCurrentWordBufferRange(), wordRange != null ? (this.editor.setCursorBufferPosition(wordRange.start), this.editor.getTextInBufferRange(wordRange)) : '');
      }
      return SearchCurrentWord.__super__.moveCursor.apply(this, arguments);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvbW90aW9uLXNlYXJjaC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLG9MQUFBO0lBQUE7Ozs7O0VBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUjs7RUFFSixNQUF3RSxPQUFBLENBQVEsU0FBUixDQUF4RSxFQUFDLHFDQUFELEVBQWtCLGlFQUFsQixFQUFpRDs7RUFDakQsV0FBQSxHQUFjLE9BQUEsQ0FBUSxnQkFBUjs7RUFDZCxNQUFBLEdBQVMsT0FBQSxDQUFRLFFBQVIsQ0FBaUIsQ0FBQyxRQUFsQixDQUEyQixRQUEzQjs7RUFFSDs7Ozs7OztJQUNKLFVBQUMsQ0FBQSxNQUFELENBQVEsS0FBUjs7eUJBQ0EsSUFBQSxHQUFNOzt5QkFDTixTQUFBLEdBQVc7O3lCQUNYLFNBQUEsR0FBVzs7eUJBQ1gsbUJBQUEsR0FBcUI7O3lCQUNyQixZQUFBLEdBQWM7O3lCQUNkLG1CQUFBLEdBQXFCOzt5QkFDckIsYUFBQSxHQUFlOzt5QkFDZix1QkFBQSxHQUF5Qjs7eUJBRXpCLFdBQUEsR0FBYSxTQUFBO2FBQ1gsSUFBQyxDQUFBO0lBRFU7O3lCQUdiLG1CQUFBLEdBQXFCLFNBQUE7YUFDbkIsSUFBQyxFQUFBLFVBQUEsRUFBRCxDQUFZLFFBQVosQ0FBQSxJQUEwQixDQUFJLElBQUMsQ0FBQSxRQUEvQixJQUE0QyxJQUFDLENBQUEsU0FBRCxDQUFXLG1CQUFYO0lBRHpCOzt5QkFHckIsVUFBQSxHQUFZLFNBQUE7TUFDViw0Q0FBQSxTQUFBO2FBQ0EsSUFBQyxDQUFBLG9CQUFELENBQXNCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtpQkFDcEIsS0FBQyxDQUFBLE1BQUQsQ0FBQTtRQURvQjtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBdEI7SUFGVTs7eUJBS1osUUFBQSxHQUFVLFNB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QUFEO0FBQ3BFLFlBQUE7UUFEc0UsbUJBQU87UUFDN0UsSUFBRyxLQUFLLENBQUMsR0FBRyxDQUFDLGFBQVYsQ0FBd0IsS0FBeEIsQ0FBSDtVQUNFLEtBQUEsR0FBUTtpQkFDUixJQUFBLENBQUEsRUFGRjs7TUFEb0UsQ0FBdEU7YUFJQTtJQVp5Qjs7OztLQXZCRzs7RUFxQzFCOzs7Ozs7O0lBQ0osMEJBQUMsQ0FBQSxNQUFELENBQUE7O3lDQUNBLFNBQUEsR0FBVzs7OztLQUY0QjtBQXJPekMiLCJzb3VyY2VzQ29udGVudCI6WyJfID0gcmVxdWlyZSAndW5kZXJzY29yZS1wbHVzJ1xuXG57c2F2ZUVkaXRvclN0YXRlLCBnZXROb25Xb3JkQ2hhcmFjdGVyc0ZvckN1cnNvciwgc2VhcmNoQnlQcm9qZWN0RmluZH0gPSByZXF1aXJlICcuL3V0aWxzJ1xuU2VhcmNoTW9kZWwgPSByZXF1aXJlICcuL3NlYXJjaC1tb2RlbCdcbk1vdGlvbiA9IHJlcXVpcmUoJy4vYmFzZScpLmdldENsYXNzKCdNb3Rpb24nKVxuXG5jbGFzcyBTZWFyY2hCYXNlIGV4dGVuZHMgTW90aW9uXG4gIEBleHRlbmQoZmFsc2UpXG4gIGp1bXA6IHRydWVcbiAgYmFja3dhcmRzOiBmYWxzZVxuICB1c2VSZWdleHA6IHRydWVcbiAgY2FzZVNlbnNpdGl2aXR5S2luZDogbnVsbFxuICBsYW5kaW5nUG9pbnQ6IG51bGwgIyBbJ3N0YXJ0JyBvciAnZW5kJ11cbiAgZGVmYXVsdExhbmRpbmdQb2ludDogJ3N0YXJ0JyAjIFsnc3RhcnQnIG9yICdlbmQnXVxuICByZWxhdGl2ZUluZGV4OiBudWxsXG4gIHVwZGF0ZWxhc3RTZWFyY2hQYXR0ZXJuOiB0cnVlXG5cbiAgaXNCYWNrd2FyZHM6IC0+XG4gICAgQGJhY2t3YXJkc1xuXG4gIGlzSW5jcmVtZW50YWxTZWFyY2g6IC0+XG4gICAgQGluc3RhbmNlb2YoJ1NlYXJjaCcpIGFuZCBub3QgQHJlcGVhdGVkIGFuZCBAZ2V0Q29uZmlnKCdpbmNyZW1lbnRhbFNlYXJjaCcpXG5cbiAgaW5pdGlhbGl6ZTogLT5cbiAgICBzdXBlclxuICAgIEBvbkRpZEZpbmlzaE9wZXJhdGlvbiA9PlxuICAgICAgQGZpbmlzaCgpXG5cbiAgZ2V0Q291bnQ6IC0+XG4gICAgY291bnQgPSBzdXBlclxuICAgIGlmIEBpc0JhY2t3YXJkcygpXG4gICAgICAtY291bnRcbiAgICBlbHNlXG4gICAgICBjb3VudFxuXG4gIGZpbmlzaDogLT5cbiAgICBpZiBAaXNJbmNyZW1lbnRhbFNlYXJjaCgpIGFuZCBAZ2V0Q29uZmlnKCdzaG93SG92ZXJTZWFyY2hDb3VudGVyJylcbiAgICAgIEB2aW1TdGF0ZS5ob3ZlclNlYXJjaENvdW50ZXIucmVzZXQoKVxuICAgIEByZWxhdGl2ZUluZGV4ID0gbnVsbFxuICAgIEBzZWFyY2hNb2RlbD8uZGVzdHJveSgpXG4gICAgQHNlYXJjaE1vZGVsID0gbnVsbFxuXG4gIGdldExhbmRpbmdQb2ludDogLT5cbiAgICBAbGFuZGluZ1BvaW50ID89IEBkZWZhdWx0TGFuZGluZ1BvaW50XG5cbiAgZ2V0UG9pbnQ6IChjdXJzb3IpIC0+XG4gICAgaWYgQHNlYXJjaE1vZGVsP1xuICAgICAgQHJlbGF0aXZlSW5kZXggPSBAZ2V0Q291bnQoKSArIEBzZWFyY2hNb2RlbC5nZXRSZWxhdGl2ZUluZGV4KClcbiAgICBlbHNlXG4gICAgICBAcmVsYXRpdmVJbmRleCA/PSBAZ2V0Q291bnQoKVxuXG4gICAgaWYgcmFuZ2UgPSBAc2VhcmNoKGN1cnNvciwgQGlucHV0LCBAcmVsYXRpdmVJbmRleClcbiAgICAgIHBvaW50ID0gcmFuZ2VbQGdldExhbmRpbmdQb2ludCgpXVxuXG4gICAgQHNlYXJjaE1vZGVsLmRlc3Ryb3koKVxuICAgIEBzZWFyY2hNb2RlbCA9IG51bGxcblxuICAgIHBvaW50XG5cbiAgbW92ZUN1cnNvcjogKGN1cnNvcikgLT5cbiAgICBpbnB1dCA9IEBpbnB1dFxuICAgIHJldHVybiB1bmxlc3MgaW5wdXRcblxuICAgIGlmIHBvaW50ID0gQGdldFBvaW50KGN1cnNvcilcbiAgICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihwb2ludCwgYXV0b3Njcm9sbDogZmFsc2UpXG5cbiAgICB1bmxlc3MgQHJlcGVhdGVkXG4gICAgICBAZ2xvYmFsU3RhdGUuc2V0KCdjdXJyZW50U2VhcmNoJywgdGhpcylcbiAgICAgIEB2aW1TdGF0ZS5zZWFyY2hIaXN0b3J5LnNhdmUoaW5wdXQpXG5cbiAgICBpZiBAdXBkYXRlbGFzdFNlYXJjaFBhdHRlcm5cbiAgICAgIEBnbG9iYWxTdGF0ZS5zZXQoJ2xhc3RTZWFyY2hQYXR0ZXJuJywgQGdldFBhdHRlcm4oaW5wdXQpKVxuXG4gIGdldFNlYXJjaE1vZGVsOiAtPlxuICAgIEBzZWFyY2hNb2RlbCA/PSBuZXcgU2VhcmNoTW9kZWwoQHZpbVN0YXRlLCBpbmNyZW1lbnRhbFNlYXJjaDogQGlzSW5jcmVtZW50YWxTZWFyY2goKSlcblxuICBzZWFyY2g6IChjdXJzb3IsIGlucHV0LCByZWxhdGl2ZUluZGV4KSAtPlxuICAgIHNlYXJjaE1vZGVsID0gQGdldFNlYXJjaE1vZGVsKClcbiAgICBpZiBpbnB1dFxuICAgICAgZnJvbVBvaW50ID0gQGdldEJ1ZmZlclBvc2l0aW9uRm9yQ3Vyc29yKGN1cnNvcilcbiAgICAgIHJldHVybiBzZWFyY2hNb2RlbC5zZWFyY2goZnJvbVBvaW50LCBAZ2V0UGF0dGVybihpbnB1dCksIHJlbGF0aXZlSW5kZXgpXG4gICAgZWxzZVxuICAgICAgQHZpbVN0YXRlLmhvdmVyU2VhcmNoQ291bnRlci5yZXNldCgpXG4gICAgICBzZWFyY2hNb2RlbC5jbGVhck1hcmtlcnMoKVxuXG4jIC8sID9cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgU2VhcmNoIGV4dGVuZHMgU2VhcmNoQmFzZVxuICBAZXh0ZW5kKClcbiAgY2FzZVNlbnNpdGl2aXR5S2luZDogXCJTZWFyY2hcIlxuICByZXF1aXJlSW5wdXQ6IHRydWVcblxuICBpbml0aWFsaXplOiAtPlxuICAgIHN1cGVyXG4gICAgcmV0dXJuIGlmIEBpc0NvbXBsZXRlKCkgIyBXaGVuIHJlcGVhdGVkLCBubyBuZWVkIHRvIGdldCB1c2VyIGlucHV0XG5cbiAgICBpZiBAaXNJbmNyZW1lbnRhbFNlYXJjaCgpXG4gICAgICBAcmVzdG9yZUVkaXRvclN0YXRlID0gc2F2ZUVkaXRvclN0YXRlKEBlZGl0b3IpXG4gICAgICBAb25EaWRDb21tYW5kU2VhcmNoKEBoYW5kbGVDb21tYW5kRXZlbnQuYmluZCh0aGlzKSlcblxuICAgIEBvbkRpZENvbmZpcm1TZWFyY2goQGhhbmRsZUNvbmZpcm1TZWFyY2guYmluZCh0aGlzKSlcbiAgICBAb25EaWRDYW5jZWxTZWFyY2goQGhhbmRsZUNhbmNlbFNlYXJjaC5iaW5kKHRoaXMpKVxuICAgIEBvbkRpZENoYW5nZVNlYXJjaChAaGFuZGxlQ2hhbmdlU2VhcmNoLmJpbmQodGhpcykpXG5cbiAgICBAZm9jdXNTZWFyY2hJbnB1dEVkaXRvcigpXG5cbiAgZm9jdXNTZWFyY2hJbnB1dEVkaXRvcjogLT5cbiAgICBjbGFzc0xpc3QgPSBbXVxuICAgIGNsYXNzTGlzdC5wdXNoKCdiYWNrd2FyZHMnKSBpZiBAYmFja3dhcmRzXG4gICAgQHZpbVN0YXRlLnNlYXJjaElucHV0LmZvY3VzKHtjbGFzc0xpc3R9KVxuXG4gIGhhbmRsZUNvbW1hbmRFdmVudDogKGNvbW1hbmRFdmVudCkgLT5cbiAgICByZXR1cm4gdW5sZXNzIGNvbW1hbmRFdmVudC5pbnB1dFxuICAgIHN3aXRjaCBjb21tYW5kRXZlbnQubmFtZVxuICAgICAgd2hlbiAndmlzaXQnXG4gICAgICAgIHtkaXJlY3Rpb259ID0gY29tbWFuZEV2ZW50XG4gICAgICAgIGlmIEBpc0JhY2t3YXJkcygpIGFuZCBAZ2V0Q29uZmlnKCdpbmNyZW1lbnRhbFNlYXJjaFZpc2l0RGlyZWN0aW9uJykgaXMgJ3JlbGF0aXZlJ1xuICAgICAgICAgIGRpcmVjdGlvbiA9IHN3aXRjaCBkaXJlY3Rpb25cbiAgICAgICAgICAgIHdoZW4gJ25leHQnIHRoZW4gJ3ByZXYnXG4gICAgICAgICAgICB3aGVuICdwcmV2JyB0aGVuICduZXh0J1xuXG4gICAgICAgIHN3aXRjaCBkaXJlY3Rpb25cbiAgICAgICAgICB3aGVuICduZXh0JyB0aGVuIEBnZXRTZWFyY2hNb2RlbCgpLnZpc2l0KCsxKVxuICAgICAgICAgIHdoZW4gJ3ByZXYnIHRoZW4gQGdldFNlYXJjaE1vZGVsKCkudmlzaXQoLTEpXG5cbiAgICAgIHdoZW4gJ29jY3VycmVuY2UnXG4gICAgICAgIHtvcGVyYXRpb24sIGlucHV0fSA9IGNvbW1hbmRFdmVudFxuICAgICAgICBAdmltU3RhdGUub2NjdXJyZW5jZU1hbmFnZXIuYWRkUGF0dGVybihAZ2V0UGF0dGVybihpbnB1dCksIHJlc2V0OiBvcGVyYXRpb24/KVxuICAgICAgICBAdmltU3RhdGUub2NjdXJyZW5jZU1hbmFnZXIuc2F2ZUxhc3RQYXR0ZXJuKClcblxuICAgICAgICBAdmltU3RhdGUuc2VhcmNoSGlzdG9yeS5zYXZlKGlucHV0KVxuICAgICAgICBAdmltU3RhdGUuc2VhcmNoSW5wdXQuY2FuY2VsKClcblxuICAgICAgICBAdmltU3RhdGUub3BlcmF0aW9uU3RhY2sucnVuKG9wZXJhdGlvbikgaWYgb3BlcmF0aW9uP1xuXG4gICAgICB3aGVuICdwcm9qZWN0LWZpbmQnXG4gICAgICAgIHtpbnB1dH0gPSBjb21tYW5kRXZlbnRcbiAgICAgICAgQHZpbVN0YXRlLnNlYXJjaEhpc3Rvcnkuc2F2ZShpbnB1dClcbiAgICAgICAgQHZpbVN0YXRlLnNlYXJjaElucHV0LmNhbmNlbCgpXG4gICAgICAgIHNlYXJjaEJ5UHJvamVjdEZpbmQoQGVkaXRvciwgaW5wdXQpXG5cbiAgaGFuZGxlQ2FuY2VsU2VhcmNoOiAtPlxuICAgIEB2aW1TdGF0ZS5yZXNldE5vcm1hbE1vZGUoKSB1bmxlc3MgQG1vZGUgaW4gWyd2aXN1YWwnLCAnaW5zZXJ0J11cbiAgICBAcmVzdG9yZUVkaXRvclN0YXRlPygpXG4gICAgQHZpbVN0YXRlLnJlc2V0KClcbiAgICBAZmluaXNoKClcblxuICBpc1NlYXJjaFJlcGVhdENoYXJhY3RlcjogKGNoYXIpIC0+XG4gICAgaWYgQGlzSW5jcmVtZW50YWxTZWFyY2goKVxuICAgICAgY2hhciBpcyAnJ1xuICAgIGVsc2VcbiAgICAgIHNlYXJjaENoYXIgPSBpZiBAaXNCYWNrd2FyZHMoKSB0aGVuICc/JyBlbHNlICcvJ1xuICAgICAgY2hhciBpbiBbJycsIHNlYXJjaENoYXJdXG5cbiAgaGFuZGxlQ29uZmlybVNlYXJjaDogKHtAaW5wdXQsIEBsYW5kaW5nUG9pbnR9KSA9PlxuICAgIGlmIEBpc1NlYXJjaFJlcGVhdENoYXJhY3RlcihAaW5wdXQpXG4gICAgICBAaW5wdXQgPSBAdmltU3RhdGUuc2VhcmNoSGlzdG9yeS5nZXQoJ3ByZXYnKVxuICAgICAgYXRvbS5iZWVwKCkgdW5sZXNzIEBpbnB1dFxuICAgIEBwcm9jZXNzT3BlcmF0aW9uKClcblxuICBoYW5kbGVDaGFuZ2VTZWFyY2g6IChpbnB1dCkgLT5cbiAgICAjIElmIGlucHV0IHN0YXJ0cyB3aXRoIHNwYWNlLCByZW1vdmUgZmlyc3Qgc3BhY2UgYW5kIGRpc2FibGUgdXNlUmVnZXhwLlxuICAgIGlmIGlucHV0LnN0YXJ0c1dpdGgoJyAnKVxuICAgICAgaW5wdXQgPSBpbnB1dC5yZXBsYWNlKC9eIC8sICcnKVxuICAgICAgQHVzZVJlZ2V4cCA9IGZhbHNlXG4gICAgQHZpbVN0YXRlLnNlYXJjaElucHV0LnVwZGF0ZU9wdGlvblNldHRpbmdzKHtAdXNlUmVnZXhwfSlcblxuICAgIGlmIEBpc0luY3JlbWVudGFsU2VhcmNoKClcbiAgICAgIEBzZWFyY2goQGVkaXRvci5nZXRMYXN0Q3Vyc29yKCksIGlucHV0LCBAZ2V0Q291bnQoKSlcblxuICBnZXRQYXR0ZXJuOiAodGVybSkgLT5cbiAgICBtb2RpZmllcnMgPSBpZiBAaXNDYXNlU2Vuc2l0aXZlKHRlcm0pIHRoZW4gJ2cnIGVsc2UgJ2dpJ1xuICAgICMgRklYTUUgdGhpcyBwcmV2ZW50IHNlYXJjaCBcXFxcYyBpdHNlbGYuXG4gICAgIyBET05UIHRoaW5rbGVzc2x5IG1pbWljIHB1cmUgVmltLiBJbnN0ZWFkLCBwcm92aWRlIGlnbm9yZWNhc2UgYnV0dG9uIGFuZCBzaG9ydGN1dC5cbiAgICBpZiB0ZXJtLmluZGV4T2YoJ1xcXFxjJykgPj0gMFxuICAgICAgdGVybSA9IHRlcm0ucmVwbGFjZSgnXFxcXGMnLCAnJylcbiAgICAgIG1vZGlmaWVycyArPSAnaScgdW5sZXNzICdpJyBpbiBtb2RpZmllcnNcblxuICAgIGlmIEB1c2VSZWdleHBcbiAgICAgIHRyeVxuICAgICAgICByZXR1cm4gbmV3IFJlZ0V4cCh0ZXJtLCBtb2RpZmllcnMpXG4gICAgICBjYXRjaFxuICAgICAgICBudWxsXG5cbiAgICBuZXcgUmVnRXhwKF8uZXNjYXBlUmVnRXhwKHRlcm0pLCBtb2RpZmllcnMpXG5cbmNsYXNzIFNlYXJjaEJhY2t3YXJkcyBleHRlbmRzIFNlYXJjaFxuICBAZXh0ZW5kKClcbiAgYmFja3dhcmRzOiB0cnVlXG5cbiMgKiwgI1xuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBTZWFyY2hDdXJyZW50V29yZCBleHRlbmRzIFNlYXJjaEJhc2VcbiAgQGV4dGVuZCgpXG4gIGNhc2VTZW5zaXRpdml0eUtpbmQ6IFwiU2VhcmNoQ3VycmVudFdvcmRcIlxuXG4gIG1vdmVDdXJzb3I6IChjdXJzb3IpIC0+XG4gICAgQGlucHV0ID89IChcbiAgICAgIHdvcmRSYW5nZSA9IEBnZXRDdXJyZW50V29yZEJ1ZmZlclJhbmdlKClcbiAgICAgIGlmIHdvcmRSYW5nZT9cbiAgICAgICAgQGVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbih3b3JkUmFuZ2Uuc3RhcnQpXG4gICAgICAgIEBlZGl0b3IuZ2V0VGV4dEluQnVmZmVyUmFuZ2Uod29yZFJhbmdlKVxuICAgICAgZWxzZVxuICAgICAgICAnJ1xuICAgIClcbiAgICBzdXBlclxuXG4gIGdldFBhdHRlcm46ICh0ZXJtKSAtPlxuICAgIG1vZGlmaWVycyA9IGlmIEBpc0Nhc2VTZW5zaXRpdmUodGVybSkgdGhlbiAnZycgZWxzZSAnZ2knXG4gICAgcGF0dGVybiA9IF8uZXNjYXBlUmVnRXhwKHRlcm0pXG4gICAgaWYgL1xcVy8udGVzdCh0ZXJtKVxuICAgICAgbmV3IFJlZ0V4cChcIiN7cGF0dGVybn1cXFxcYlwiLCBtb2RpZmllcnMpXG4gICAgZWxzZVxuICAgICAgbmV3IFJlZ0V4cChcIlxcXFxiI3twYXR0ZXJufVxcXFxiXCIsIG1vZGlmaWVycylcblxuICBnZXRDdXJyZW50V29yZEJ1ZmZlclJhbmdlOiAtPlxuICAgIGN1cnNvciA9IEBlZGl0b3IuZ2V0TGFzdEN1cnNvcigpXG4gICAgcG9pbnQgPSBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuXG4gICAgbm9uV29yZENoYXJhY3RlcnMgPSBnZXROb25Xb3JkQ2hhcmFjdGVyc0ZvckN1cnNvcihjdXJzb3IpXG4gICAgd29yZFJlZ2V4ID0gbmV3IFJlZ0V4cChcIlteXFxcXHMje18uZXNjYXBlUmVnRXhwKG5vbldvcmRDaGFyYWN0ZXJzKX1dK1wiLCAnZycpXG5cbiAgICBmb3VuZCA9IG51bGxcbiAgICBAc2NhbkZvcndhcmQgd29yZFJlZ2V4LCB7ZnJvbTogW3BvaW50LnJvdywgMF0sIGFsbG93TmV4dExpbmU6IGZhbHNlfSwgKHtyYW5nZSwgc3RvcH0pIC0+XG4gICAgICBpZiByYW5nZS5lbmQuaXNHcmVhdGVyVGhhbihwb2ludClcbiAgICAgICAgZm91bmQgPSByYW5nZVxuICAgICAgICBzdG9wKClcbiAgICBmb3VuZFxuXG5jbGFzcyBTZWFyY2hDdXJyZW50V29yZEJhY2t3YXJkcyBleHRlbmRzIFNlYXJjaEN1cnJlbnRXb3JkXG4gIEBleHRlbmQoKVxuICBiYWNrd2FyZHM6IHRydWVcbiJdfQ==
