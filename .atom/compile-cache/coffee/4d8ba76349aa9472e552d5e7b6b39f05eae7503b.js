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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvbW90aW9uLXNlYXJjaC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLG9MQUFBO0lBQUE7Ozs7O0VBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUjs7RUFFSixNQUF3RSxPQUFBLENBQVEsU0FBUixDQUF4RSxFQUFDLHFDQUFELEVBQWtCLGlFQUFsQixFQUFpRDs7RUFDakQsV0FBQSxHQUFjLE9BQUEsQ0FBUSxnQkFBUjs7RUFDZCxNQUFBLEdBQVMsT0FBQSxDQUFRLFFBQVIsQ0FBaUIsQ0FBQyxRQUFsQixDQUEyQixRQUEzQjs7RUFFSDs7Ozs7OztJQUNKLFVBQUMsQ0FBQSxNQUFELENBQVEsS0FBUjs7eUJBQ0EsSUFBQSxHQUFNOzt5QkFDTixTQUFBLEdBQVc7O3lCQUNYLFNBQUEsR0FBVzs7eUJBQ1gsV0FBQSxHQUFhOzt5QkFDYixZQUFBLEdBQWM7O3lCQUNkLG1CQUFBLEdBQXFCOzt5QkFDckIsYUFBQSxHQUFlOzt5QkFDZix1QkFBQSxHQUF5Qjs7eUJBRXpCLFdBQUEsR0FBYSxTQUFBO2FBQ1gsSUFBQyxDQUFBO0lBRFU7O3lCQUdiLG1CQUFBLEdBQXFCLFNBQUE7YUFDbkIsSUFBQyxFQUFBLFVBQUEsRUFBRCxDQUFZLFFBQVosQ0FBQSxJQUEwQixDQUFJLElBQUMsQ0FBQSxRQUEvQixJQUE0QyxJQUFDLENBQUEsU0FBRCxDQUFXLG1CQUFYO0lBRHpCOzt5QkFHckIsVUFBQSxHQUFZLFNBQUE7TUFDViw0Q0FBQSxTQUFBO2FBQ0EsSUFBQyxDQUFBLG9CQUFELENBQXNCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtpQkFDcEIsS0FBQyxDQUFBLE1BQUQsQ0FBQTtRQURvQjtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBdEI7SUFGVTs7eUJBS1osUUFBQSxHQUFVLFNBQUE7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QTtBQUN6QixVQUFBO01BQUEsTUFBQSxHQUFTLElBQUMsQ0FBQSxNQUFNLENBQUMsYUFBUixDQUFBO01BQ1QsS0FBQSxHQUFRLE1BQU0sQ0FBQyxpQkFBUCxDQUFBO01BRVIsaUJBQUEsR0FBb0IsNkJBQUEsQ0FBOEIsTUFBOUI7TUFDcEIsU0FBQSxHQUFnQixJQUFBLE1BQUEsQ0FBTyxPQUFBLEdBQU8sQ0FBQyxDQUFDLENBQUMsWUFBRixDQUFlLGlCQUFmLENBQUQsQ0FBUCxHQUEwQyxJQUFqRCxFQUFzRCxHQUF0RDtNQUVoQixLQUFBLEdBQVE7TUFDUixJQUFDLENBQUEsV0FBRCxDQUFhLFNBQWIsRUFBd0I7UUFBQyxJQUFBLEVBQU0sQ0FBQyxLQUFLLENBQUMsR0FBUCxFQUFZLENBQVosQ0FBUDtRQUF1QixhQUFBLEVBQWUsS0FBdEM7T0FBeEIsRUFBc0UsU0FBQyxHQUFEO0FBQ3BFLFlBQUE7UUFEc0UsbUJBQU87UUFDN0UsSUFBRyxLQUFLLENBQUMsR0FBRyxDQUFDLGFBQVYsQ0FBd0IsS0FBeEIsQ0FBSDtVQUNFLEtBQUEsR0FBUTtpQkFDUixJQUFBLENBQUEsRUFGRjs7TUFEb0UsQ0FBdEU7YUFJQTtJQVp5Qjs7OztLQXZCRzs7RUFxQzFCOzs7Ozs7O0lBQ0osMEJBQUMsQ0FBQSxNQUFELENBQUE7O3lDQUNBLFNBQUEsR0FBVzs7OztLQUY0QjtBQW5QekMiLCJzb3VyY2VzQ29udGVudCI6WyJfID0gcmVxdWlyZSAndW5kZXJzY29yZS1wbHVzJ1xuXG57c2F2ZUVkaXRvclN0YXRlLCBnZXROb25Xb3JkQ2hhcmFjdGVyc0ZvckN1cnNvciwgc2VhcmNoQnlQcm9qZWN0RmluZH0gPSByZXF1aXJlICcuL3V0aWxzJ1xuU2VhcmNoTW9kZWwgPSByZXF1aXJlICcuL3NlYXJjaC1tb2RlbCdcbk1vdGlvbiA9IHJlcXVpcmUoJy4vYmFzZScpLmdldENsYXNzKCdNb3Rpb24nKVxuXG5jbGFzcyBTZWFyY2hCYXNlIGV4dGVuZHMgTW90aW9uXG4gIEBleHRlbmQoZmFsc2UpXG4gIGp1bXA6IHRydWVcbiAgYmFja3dhcmRzOiBmYWxzZVxuICB1c2VSZWdleHA6IHRydWVcbiAgY29uZmlnU2NvcGU6IG51bGxcbiAgbGFuZGluZ1BvaW50OiBudWxsICMgWydzdGFydCcgb3IgJ2VuZCddXG4gIGRlZmF1bHRMYW5kaW5nUG9pbnQ6ICdzdGFydCcgIyBbJ3N0YXJ0JyBvciAnZW5kJ11cbiAgcmVsYXRpdmVJbmRleDogbnVsbFxuICB1cGRhdGVsYXN0U2VhcmNoUGF0dGVybjogdHJ1ZVxuXG4gIGlzQmFja3dhcmRzOiAtPlxuICAgIEBiYWNrd2FyZHNcblxuICBpc0luY3JlbWVudGFsU2VhcmNoOiAtPlxuICAgIEBpbnN0YW5jZW9mKCdTZWFyY2gnKSBhbmQgbm90IEByZXBlYXRlZCBhbmQgQGdldENvbmZpZygnaW5jcmVtZW50YWxTZWFyY2gnKVxuXG4gIGluaXRpYWxpemU6IC0+XG4gICAgc3VwZXJcbiAgICBAb25EaWRGaW5pc2hPcGVyYXRpb24gPT5cbiAgICAgIEBmaW5pc2goKVxuXG4gIGdldENvdW50OiAtPlxuICAgIGNvdW50ID0gc3VwZXJcbiAgICBpZiBAaXNCYWNrd2FyZHMoKVxuICAgICAgLWNvdW50XG4gICAgZWxzZVxuICAgICAgY291bnRcblxuICBnZXRDYXNlU2Vuc2l0aXZpdHk6IC0+XG4gICAgaWYgQGdldENvbmZpZyhcInVzZVNtYXJ0Y2FzZUZvciN7QGNvbmZpZ1Njb3BlfVwiKVxuICAgICAgJ3NtYXJ0Y2FzZSdcbiAgICBlbHNlIGlmIEBnZXRDb25maWcoXCJpZ25vcmVDYXNlRm9yI3tAY29uZmlnU2NvcGV9XCIpXG4gICAgICAnaW5zZW5zaXRpdmUnXG4gICAgZWxzZVxuICAgICAgJ3NlbnNpdGl2ZSdcblxuICBpc0Nhc2VTZW5zaXRpdmU6ICh0ZXJtKSAtPlxuICAgIHN3aXRjaCBAZ2V0Q2FzZVNlbnNpdGl2aXR5KClcbiAgICAgIHdoZW4gJ3NtYXJ0Y2FzZScgdGhlbiB0ZXJtLnNlYXJjaCgnW0EtWl0nKSBpc250IC0xXG4gICAgICB3aGVuICdpbnNlbnNpdGl2ZScgdGhlbiBmYWxzZVxuICAgICAgd2hlbiAnc2Vuc2l0aXZlJyB0aGVuIHRydWVcblxuICBmaW5pc2g6IC0+XG4gICAgaWYgQGlzSW5jcmVtZW50YWxTZWFyY2goKSBhbmQgQGdldENvbmZpZygnc2hvd0hvdmVyU2VhcmNoQ291bnRlcicpXG4gICAgICBAdmltU3RhdGUuaG92ZXJTZWFyY2hDb3VudGVyLnJlc2V0KClcbiAgICBAcmVsYXRpdmVJbmRleCA9IG51bGxcbiAgICBAc2VhcmNoTW9kZWw/LmRlc3Ryb3koKVxuICAgIEBzZWFyY2hNb2RlbCA9IG51bGxcblxuICBnZXRMYW5kaW5nUG9pbnQ6IC0+XG4gICAgQGxhbmRpbmdQb2ludCA/PSBAZGVmYXVsdExhbmRpbmdQb2ludFxuXG4gIGdldFBvaW50OiAoY3Vyc29yKSAtPlxuICAgIGlmIEBzZWFyY2hNb2RlbD9cbiAgICAgIEByZWxhdGl2ZUluZGV4ID0gQGdldENvdW50KCkgKyBAc2VhcmNoTW9kZWwuZ2V0UmVsYXRpdmVJbmRleCgpXG4gICAgZWxzZVxuICAgICAgQHJlbGF0aXZlSW5kZXggPz0gQGdldENvdW50KClcblxuICAgIGlmIHJhbmdlID0gQHNlYXJjaChjdXJzb3IsIEBpbnB1dCwgQHJlbGF0aXZlSW5kZXgpXG4gICAgICBwb2ludCA9IHJhbmdlW0BnZXRMYW5kaW5nUG9pbnQoKV1cblxuICAgIEBzZWFyY2hNb2RlbC5kZXN0cm95KClcbiAgICBAc2VhcmNoTW9kZWwgPSBudWxsXG5cbiAgICBwb2ludFxuXG4gIG1vdmVDdXJzb3I6IChjdXJzb3IpIC0+XG4gICAgaW5wdXQgPSBAaW5wdXRcbiAgICByZXR1cm4gdW5sZXNzIGlucHV0XG5cbiAgICBpZiBwb2ludCA9IEBnZXRQb2ludChjdXJzb3IpXG4gICAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24ocG9pbnQsIGF1dG9zY3JvbGw6IGZhbHNlKVxuXG4gICAgdW5sZXNzIEByZXBlYXRlZFxuICAgICAgQGdsb2JhbFN0YXRlLnNldCgnY3VycmVudFNlYXJjaCcsIHRoaXMpXG4gICAgICBAdmltU3RhdGUuc2VhcmNoSGlzdG9yeS5zYXZlKGlucHV0KVxuXG4gICAgaWYgQHVwZGF0ZWxhc3RTZWFyY2hQYXR0ZXJuXG4gICAgICBAZ2xvYmFsU3RhdGUuc2V0KCdsYXN0U2VhcmNoUGF0dGVybicsIEBnZXRQYXR0ZXJuKGlucHV0KSlcblxuICBnZXRTZWFyY2hNb2RlbDogLT5cbiAgICBAc2VhcmNoTW9kZWwgPz0gbmV3IFNlYXJjaE1vZGVsKEB2aW1TdGF0ZSwgaW5jcmVtZW50YWxTZWFyY2g6IEBpc0luY3JlbWVudGFsU2VhcmNoKCkpXG5cbiAgc2VhcmNoOiAoY3Vyc29yLCBpbnB1dCwgcmVsYXRpdmVJbmRleCkgLT5cbiAgICBzZWFyY2hNb2RlbCA9IEBnZXRTZWFyY2hNb2RlbCgpXG4gICAgaWYgaW5wdXRcbiAgICAgIGZyb21Qb2ludCA9IEBnZXRCdWZmZXJQb3NpdGlvbkZvckN1cnNvcihjdXJzb3IpXG4gICAgICByZXR1cm4gc2VhcmNoTW9kZWwuc2VhcmNoKGZyb21Qb2ludCwgQGdldFBhdHRlcm4oaW5wdXQpLCByZWxhdGl2ZUluZGV4KVxuICAgIGVsc2VcbiAgICAgIEB2aW1TdGF0ZS5ob3ZlclNlYXJjaENvdW50ZXIucmVzZXQoKVxuICAgICAgc2VhcmNoTW9kZWwuY2xlYXJNYXJrZXJzKClcblxuIyAvLCA/XG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIFNlYXJjaCBleHRlbmRzIFNlYXJjaEJhc2VcbiAgQGV4dGVuZCgpXG4gIGNvbmZpZ1Njb3BlOiBcIlNlYXJjaFwiXG4gIHJlcXVpcmVJbnB1dDogdHJ1ZVxuXG4gIGluaXRpYWxpemU6IC0+XG4gICAgc3VwZXJcbiAgICByZXR1cm4gaWYgQGlzQ29tcGxldGUoKSAjIFdoZW4gcmVwZWF0ZWQsIG5vIG5lZWQgdG8gZ2V0IHVzZXIgaW5wdXRcblxuICAgIGlmIEBpc0luY3JlbWVudGFsU2VhcmNoKClcbiAgICAgIEByZXN0b3JlRWRpdG9yU3RhdGUgPSBzYXZlRWRpdG9yU3RhdGUoQGVkaXRvcilcbiAgICAgIEBvbkRpZENvbW1hbmRTZWFyY2goQGhhbmRsZUNvbW1hbmRFdmVudC5iaW5kKHRoaXMpKVxuXG4gICAgQG9uRGlkQ29uZmlybVNlYXJjaChAaGFuZGxlQ29uZmlybVNlYXJjaC5iaW5kKHRoaXMpKVxuICAgIEBvbkRpZENhbmNlbFNlYXJjaChAaGFuZGxlQ2FuY2VsU2VhcmNoLmJpbmQodGhpcykpXG4gICAgQG9uRGlkQ2hhbmdlU2VhcmNoKEBoYW5kbGVDaGFuZ2VTZWFyY2guYmluZCh0aGlzKSlcblxuICAgIEBmb2N1c1NlYXJjaElucHV0RWRpdG9yKClcblxuICBmb2N1c1NlYXJjaElucHV0RWRpdG9yOiAtPlxuICAgIGNsYXNzTGlzdCA9IFtdXG4gICAgY2xhc3NMaXN0LnB1c2goJ2JhY2t3YXJkcycpIGlmIEBiYWNrd2FyZHNcbiAgICBAdmltU3RhdGUuc2VhcmNoSW5wdXQuZm9jdXMoe2NsYXNzTGlzdH0pXG5cbiAgaGFuZGxlQ29tbWFuZEV2ZW50OiAoY29tbWFuZEV2ZW50KSAtPlxuICAgIHJldHVybiB1bmxlc3MgY29tbWFuZEV2ZW50LmlucHV0XG4gICAgc3dpdGNoIGNvbW1hbmRFdmVudC5uYW1lXG4gICAgICB3aGVuICd2aXNpdCdcbiAgICAgICAge2RpcmVjdGlvbn0gPSBjb21tYW5kRXZlbnRcbiAgICAgICAgaWYgQGlzQmFja3dhcmRzKCkgYW5kIEBnZXRDb25maWcoJ2luY3JlbWVudGFsU2VhcmNoVmlzaXREaXJlY3Rpb24nKSBpcyAncmVsYXRpdmUnXG4gICAgICAgICAgZGlyZWN0aW9uID0gc3dpdGNoIGRpcmVjdGlvblxuICAgICAgICAgICAgd2hlbiAnbmV4dCcgdGhlbiAncHJldidcbiAgICAgICAgICAgIHdoZW4gJ3ByZXYnIHRoZW4gJ25leHQnXG5cbiAgICAgICAgc3dpdGNoIGRpcmVjdGlvblxuICAgICAgICAgIHdoZW4gJ25leHQnIHRoZW4gQGdldFNlYXJjaE1vZGVsKCkudmlzaXQoKzEpXG4gICAgICAgICAgd2hlbiAncHJldicgdGhlbiBAZ2V0U2VhcmNoTW9kZWwoKS52aXNpdCgtMSlcblxuICAgICAgd2hlbiAnb2NjdXJyZW5jZSdcbiAgICAgICAge29wZXJhdGlvbiwgaW5wdXR9ID0gY29tbWFuZEV2ZW50XG4gICAgICAgIEB2aW1TdGF0ZS5vY2N1cnJlbmNlTWFuYWdlci5hZGRQYXR0ZXJuKEBnZXRQYXR0ZXJuKGlucHV0KSwgcmVzZXQ6IG9wZXJhdGlvbj8pXG4gICAgICAgIEB2aW1TdGF0ZS5vY2N1cnJlbmNlTWFuYWdlci5zYXZlTGFzdFBhdHRlcm4oKVxuXG4gICAgICAgIEB2aW1TdGF0ZS5zZWFyY2hIaXN0b3J5LnNhdmUoaW5wdXQpXG4gICAgICAgIEB2aW1TdGF0ZS5zZWFyY2hJbnB1dC5jYW5jZWwoKVxuXG4gICAgICAgIEB2aW1TdGF0ZS5vcGVyYXRpb25TdGFjay5ydW4ob3BlcmF0aW9uKSBpZiBvcGVyYXRpb24/XG5cbiAgICAgIHdoZW4gJ3Byb2plY3QtZmluZCdcbiAgICAgICAge2lucHV0fSA9IGNvbW1hbmRFdmVudFxuICAgICAgICBAdmltU3RhdGUuc2VhcmNoSGlzdG9yeS5zYXZlKGlucHV0KVxuICAgICAgICBAdmltU3RhdGUuc2VhcmNoSW5wdXQuY2FuY2VsKClcbiAgICAgICAgc2VhcmNoQnlQcm9qZWN0RmluZChAZWRpdG9yLCBpbnB1dClcblxuICBoYW5kbGVDYW5jZWxTZWFyY2g6IC0+XG4gICAgQHZpbVN0YXRlLnJlc2V0Tm9ybWFsTW9kZSgpIHVubGVzcyBAbW9kZSBpbiBbJ3Zpc3VhbCcsICdpbnNlcnQnXVxuICAgIEByZXN0b3JlRWRpdG9yU3RhdGU/KClcbiAgICBAdmltU3RhdGUucmVzZXQoKVxuICAgIEBmaW5pc2goKVxuXG4gIGlzU2VhcmNoUmVwZWF0Q2hhcmFjdGVyOiAoY2hhcikgLT5cbiAgICBpZiBAaXNJbmNyZW1lbnRhbFNlYXJjaCgpXG4gICAgICBjaGFyIGlzICcnXG4gICAgZWxzZVxuICAgICAgc2VhcmNoQ2hhciA9IGlmIEBpc0JhY2t3YXJkcygpIHRoZW4gJz8nIGVsc2UgJy8nXG4gICAgICBjaGFyIGluIFsnJywgc2VhcmNoQ2hhcl1cblxuICBoYW5kbGVDb25maXJtU2VhcmNoOiAoe0BpbnB1dCwgQGxhbmRpbmdQb2ludH0pID0+XG4gICAgaWYgQGlzU2VhcmNoUmVwZWF0Q2hhcmFjdGVyKEBpbnB1dClcbiAgICAgIEBpbnB1dCA9IEB2aW1TdGF0ZS5zZWFyY2hIaXN0b3J5LmdldCgncHJldicpXG4gICAgICBhdG9tLmJlZXAoKSB1bmxlc3MgQGlucHV0XG4gICAgQHByb2Nlc3NPcGVyYXRpb24oKVxuXG4gIGhhbmRsZUNoYW5nZVNlYXJjaDogKGlucHV0KSAtPlxuICAgICMgSWYgaW5wdXQgc3RhcnRzIHdpdGggc3BhY2UsIHJlbW92ZSBmaXJzdCBzcGFjZSBhbmQgZGlzYWJsZSB1c2VSZWdleHAuXG4gICAgaWYgaW5wdXQuc3RhcnRzV2l0aCgnICcpXG4gICAgICBpbnB1dCA9IGlucHV0LnJlcGxhY2UoL14gLywgJycpXG4gICAgICBAdXNlUmVnZXhwID0gZmFsc2VcbiAgICBAdmltU3RhdGUuc2VhcmNoSW5wdXQudXBkYXRlT3B0aW9uU2V0dGluZ3Moe0B1c2VSZWdleHB9KVxuXG4gICAgaWYgQGlzSW5jcmVtZW50YWxTZWFyY2goKVxuICAgICAgQHNlYXJjaChAZWRpdG9yLmdldExhc3RDdXJzb3IoKSwgaW5wdXQsIEBnZXRDb3VudCgpKVxuXG4gIGdldFBhdHRlcm46ICh0ZXJtKSAtPlxuICAgIG1vZGlmaWVycyA9IGlmIEBpc0Nhc2VTZW5zaXRpdmUodGVybSkgdGhlbiAnZycgZWxzZSAnZ2knXG4gICAgIyBGSVhNRSB0aGlzIHByZXZlbnQgc2VhcmNoIFxcXFxjIGl0c2VsZi5cbiAgICAjIERPTlQgdGhpbmtsZXNzbHkgbWltaWMgcHVyZSBWaW0uIEluc3RlYWQsIHByb3ZpZGUgaWdub3JlY2FzZSBidXR0b24gYW5kIHNob3J0Y3V0LlxuICAgIGlmIHRlcm0uaW5kZXhPZignXFxcXGMnKSA+PSAwXG4gICAgICB0ZXJtID0gdGVybS5yZXBsYWNlKCdcXFxcYycsICcnKVxuICAgICAgbW9kaWZpZXJzICs9ICdpJyB1bmxlc3MgJ2knIGluIG1vZGlmaWVyc1xuXG4gICAgaWYgQHVzZVJlZ2V4cFxuICAgICAgdHJ5XG4gICAgICAgIHJldHVybiBuZXcgUmVnRXhwKHRlcm0sIG1vZGlmaWVycylcbiAgICAgIGNhdGNoXG4gICAgICAgIG51bGxcblxuICAgIG5ldyBSZWdFeHAoXy5lc2NhcGVSZWdFeHAodGVybSksIG1vZGlmaWVycylcblxuY2xhc3MgU2VhcmNoQmFja3dhcmRzIGV4dGVuZHMgU2VhcmNoXG4gIEBleHRlbmQoKVxuICBiYWNrd2FyZHM6IHRydWVcblxuIyAqLCAjXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIFNlYXJjaEN1cnJlbnRXb3JkIGV4dGVuZHMgU2VhcmNoQmFzZVxuICBAZXh0ZW5kKClcbiAgY29uZmlnU2NvcGU6IFwiU2VhcmNoQ3VycmVudFdvcmRcIlxuXG4gIG1vdmVDdXJzb3I6IChjdXJzb3IpIC0+XG4gICAgQGlucHV0ID89IChcbiAgICAgIHdvcmRSYW5nZSA9IEBnZXRDdXJyZW50V29yZEJ1ZmZlclJhbmdlKClcbiAgICAgIGlmIHdvcmRSYW5nZT9cbiAgICAgICAgQGVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbih3b3JkUmFuZ2Uuc3RhcnQpXG4gICAgICAgIEBlZGl0b3IuZ2V0VGV4dEluQnVmZmVyUmFuZ2Uod29yZFJhbmdlKVxuICAgICAgZWxzZVxuICAgICAgICAnJ1xuICAgIClcbiAgICBzdXBlclxuXG4gIGdldFBhdHRlcm46ICh0ZXJtKSAtPlxuICAgIG1vZGlmaWVycyA9IGlmIEBpc0Nhc2VTZW5zaXRpdmUodGVybSkgdGhlbiAnZycgZWxzZSAnZ2knXG4gICAgcGF0dGVybiA9IF8uZXNjYXBlUmVnRXhwKHRlcm0pXG4gICAgaWYgL1xcVy8udGVzdCh0ZXJtKVxuICAgICAgbmV3IFJlZ0V4cChcIiN7cGF0dGVybn1cXFxcYlwiLCBtb2RpZmllcnMpXG4gICAgZWxzZVxuICAgICAgbmV3IFJlZ0V4cChcIlxcXFxiI3twYXR0ZXJufVxcXFxiXCIsIG1vZGlmaWVycylcblxuICBnZXRDdXJyZW50V29yZEJ1ZmZlclJhbmdlOiAtPlxuICAgIGN1cnNvciA9IEBlZGl0b3IuZ2V0TGFzdEN1cnNvcigpXG4gICAgcG9pbnQgPSBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuXG4gICAgbm9uV29yZENoYXJhY3RlcnMgPSBnZXROb25Xb3JkQ2hhcmFjdGVyc0ZvckN1cnNvcihjdXJzb3IpXG4gICAgd29yZFJlZ2V4ID0gbmV3IFJlZ0V4cChcIlteXFxcXHMje18uZXNjYXBlUmVnRXhwKG5vbldvcmRDaGFyYWN0ZXJzKX1dK1wiLCAnZycpXG5cbiAgICBmb3VuZCA9IG51bGxcbiAgICBAc2NhbkZvcndhcmQgd29yZFJlZ2V4LCB7ZnJvbTogW3BvaW50LnJvdywgMF0sIGFsbG93TmV4dExpbmU6IGZhbHNlfSwgKHtyYW5nZSwgc3RvcH0pIC0+XG4gICAgICBpZiByYW5nZS5lbmQuaXNHcmVhdGVyVGhhbihwb2ludClcbiAgICAgICAgZm91bmQgPSByYW5nZVxuICAgICAgICBzdG9wKClcbiAgICBmb3VuZFxuXG5jbGFzcyBTZWFyY2hDdXJyZW50V29yZEJhY2t3YXJkcyBleHRlbmRzIFNlYXJjaEN1cnJlbnRXb3JkXG4gIEBleHRlbmQoKVxuICBiYWNrd2FyZHM6IHRydWVcbiJdfQ==
