"use babel";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var SearchModel = require("./search-model");

var _require = require("./motion");

var Motion = _require.Motion;

var SearchBase = (function (_Motion) {
  _inherits(SearchBase, _Motion);

  function SearchBase() {
    _classCallCheck(this, SearchBase);

    _get(Object.getPrototypeOf(SearchBase.prototype), "constructor", this).apply(this, arguments);

    this.jump = true;
    this.backwards = false;
    this.useRegexp = true;
    this.landingPoint = null;
    this.defaultLandingPoint = "start";
    this.relativeIndex = null;
    this.updatelastSearchPattern = true;
  }

  // /, ?
  // -------------------------

  _createClass(SearchBase, [{
    key: "isBackwards",
    value: function isBackwards() {
      return this.backwards;
    }
  }, {
    key: "resetState",
    value: function resetState() {
      _get(Object.getPrototypeOf(SearchBase.prototype), "resetState", this).call(this);
      this.relativeIndex = null;
    }
  }, {
    key: "isIncrementalSearch",
    value: function isIncrementalSearch() {
      return this["instanceof"]("Search") && !this.repeated && this.getConfig("incrementalSearch");
    }
  }, {
    key: "initialize",
    value: function initialize() {
      var _this = this;

      this.onDidFinishOperation(function () {
        return _this.finish();
      });
      _get(Object.getPrototypeOf(SearchBase.prototype), "initialize", this).call(this);
    }
  }, {
    key: "getCount",
    value: function getCount() {
      return _get(Object.getPrototypeOf(SearchBase.prototype), "getCount", this).call(this) * (this.isBackwards() ? -1 : 1);
    }
  }, {
    key: "finish",
    value: function finish() {
      if (this.isIncrementalSearch() && this.getConfig("showHoverSearchCounter")) {
        this.vimState.hoverSearchCounter.reset();
      }
      if (this.searchModel) this.searchModel.destroy();

      this.relativeIndex = null;
      this.searchModel = null;
    }
  }, {
    key: "getLandingPoint",
    value: function getLandingPoint() {
      if (!this.landingPoint) this.landingPoint = this.defaultLandingPoint;
      return this.landingPoint;
    }
  }, {
    key: "getPoint",
    value: function getPoint(cursor) {
      if (this.searchModel) {
        this.relativeIndex = this.getCount() + this.searchModel.getRelativeIndex();
      } else if (this.relativeIndex == null) {
        this.relativeIndex = this.getCount();
      }

      var range = this.search(cursor, this.input, this.relativeIndex);

      this.searchModel.destroy();
      this.searchModel = null;

      if (range) return range[this.getLandingPoint()];
    }
  }, {
    key: "moveCursor",
    value: function moveCursor(cursor) {
      if (!this.input) return;
      var point = this.getPoint(cursor);

      if (point) {
        if (this.restoreEditorState) {
          this.restoreEditorState({ anchorPosition: point, skipRow: point.row });
          this.restoreEditorState = null; // HACK: dont refold on `n`, `N` repeat
        }
        cursor.setBufferPosition(point, { autoscroll: false });
      }

      if (!this.repeated) {
        this.globalState.set("currentSearch", this);
        this.vimState.searchHistory.save(this.input);
      }

      if (this.updatelastSearchPattern) {
        this.globalState.set("lastSearchPattern", this.getPattern(this.input));
      }
    }
  }, {
    key: "getSearchModel",
    value: function getSearchModel() {
      if (!this.searchModel) {
        this.searchModel = new SearchModel(this.vimState, { incrementalSearch: this.isIncrementalSearch() });
      }
      return this.searchModel;
    }
  }, {
    key: "search",
    value: function search(cursor, input, relativeIndex) {
      var searchModel = this.getSearchModel();
      if (input) {
        var fromPoint = this.getBufferPositionForCursor(cursor);
        return searchModel.search(fromPoint, this.getPattern(input), relativeIndex);
      }
      this.vimState.hoverSearchCounter.reset();
      searchModel.clearMarkers();
    }
  }], [{
    key: "command",
    value: false,
    enumerable: true
  }]);

  return SearchBase;
})(Motion);

var Search = (function (_SearchBase) {
  _inherits(Search, _SearchBase);

  function Search() {
    _classCallCheck(this, Search);

    _get(Object.getPrototypeOf(Search.prototype), "constructor", this).apply(this, arguments);

    this.caseSensitivityKind = "Search";
    this.requireInput = true;
  }

  _createClass(Search, [{
    key: "initialize",
    value: function initialize() {
      if (this.isIncrementalSearch()) {
        this.restoreEditorState = this.utils.saveEditorState(this.editor);
        this.onDidCommandSearch(this.handleCommandEvent.bind(this));
      }

      this.onDidConfirmSearch(this.handleConfirmSearch.bind(this));
      this.onDidCancelSearch(this.handleCancelSearch.bind(this));
      this.onDidChangeSearch(this.handleChangeSearch.bind(this));

      this.focusSearchInputEditor();

      _get(Object.getPrototypeOf(Search.prototype), "initialize", this).call(this);
    }
  }, {
    key: "focusSearchInputEditor",
    value: function focusSearchInputEditor() {
      var classList = this.isBackwards() ? ["backwards"] : [];
      this.vimState.searchInput.focus({ classList: classList });
    }
  }, {
    key: "handleCommandEvent",
    value: function handleCommandEvent(event) {
      if (!event.input) return;

      if (event.name === "visit") {
        var direction = event.direction;

        if (this.isBackwards() && this.getConfig("incrementalSearchVisitDirection") === "relative") {
          direction = direction === "next" ? "prev" : "next";
        }
        this.getSearchModel().visit(direction === "next" ? +1 : -1);
      } else if (event.name === "occurrence") {
        var operation = event.operation;
        var input = event.input;

        this.occurrenceManager.addPattern(this.getPattern(input), { reset: operation != null });
        this.occurrenceManager.saveLastPattern();

        this.vimState.searchHistory.save(input);
        this.vimState.searchInput.cancel();
        if (operation != null) this.vimState.operationStack.run(operation);
      } else if (event.name === "project-find") {
        this.vimState.searchHistory.save(event.input);
        this.vimState.searchInput.cancel();
        this.utils.searchByProjectFind(this.editor, event.input);
      }
    }
  }, {
    key: "handleCancelSearch",
    value: function handleCancelSearch() {
      if (!["visual", "insert"].includes(this.mode)) this.vimState.resetNormalMode();

      if (this.restoreEditorState) this.restoreEditorState();
      this.vimState.reset();
      this.finish();
    }
  }, {
    key: "isSearchRepeatCharacter",
    value: function isSearchRepeatCharacter(char) {
      return this.isIncrementalSearch() ? char === "" : ["", this.isBackwards() ? "?" : "/"].includes(char); // empty confirm or invoking-char
    }
  }, {
    key: "handleConfirmSearch",
    value: function handleConfirmSearch(_ref) {
      var input = _ref.input;
      var landingPoint = _ref.landingPoint;

      this.input = input;
      this.landingPoint = landingPoint;
      if (this.isSearchRepeatCharacter(this.input)) {
        this.input = this.vimState.searchHistory.get("prev");
        if (!this.input) atom.beep();
      }
      this.processOperation();
    }
  }, {
    key: "handleChangeSearch",
    value: function handleChangeSearch(input) {
      // If input starts with space, remove first space and disable useRegexp.
      if (input.startsWith(" ")) {
        // FIXME: Sould I remove this unknown hack and implement visible button to togle regexp?
        input = input.replace(/^ /, "");
        this.useRegexp = false;
      }
      this.vimState.searchInput.updateOptionSettings({ useRegexp: this.useRegexp });

      if (this.isIncrementalSearch()) {
        this.search(this.editor.getLastCursor(), input, this.getCount());
      }
    }
  }, {
    key: "getPattern",
    value: function getPattern(term) {
      var modifiers = this.isCaseSensitive(term) ? "g" : "gi";
      // FIXME this prevent search \\c itself.
      // DONT thinklessly mimic pure Vim. Instead, provide ignorecase button and shortcut.
      if (term.indexOf("\\c") >= 0) {
        term = term.replace("\\c", "");
        if (!modifiers.includes("i")) modifiers += "i";
      }

      if (this.useRegexp) {
        try {
          return new RegExp(term, modifiers);
        } catch (error) {}
      }
      return new RegExp(this._.escapeRegExp(term), modifiers);
    }
  }]);

  return Search;
})(SearchBase);

var SearchBackwards = (function (_Search) {
  _inherits(SearchBackwards, _Search);

  function SearchBackwards() {
    _classCallCheck(this, SearchBackwards);

    _get(Object.getPrototypeOf(SearchBackwards.prototype), "constructor", this).apply(this, arguments);

    this.backwards = true;
  }

  // *, #
  // -------------------------
  return SearchBackwards;
})(Search);

var SearchCurrentWord = (function (_SearchBase2) {
  _inherits(SearchCurrentWord, _SearchBase2);

  function SearchCurrentWord() {
    _classCallCheck(this, SearchCurrentWord);

    _get(Object.getPrototypeOf(SearchCurrentWord.prototype), "constructor", this).apply(this, arguments);

    this.caseSensitivityKind = "SearchCurrentWord";
  }

  _createClass(SearchCurrentWord, [{
    key: "moveCursor",
    value: function moveCursor(cursor) {
      if (this.input == null) {
        var wordRange = this.getCurrentWordBufferRange();
        if (wordRange) {
          this.editor.setCursorBufferPosition(wordRange.start);
          this.input = this.editor.getTextInBufferRange(wordRange);
        } else {
          this.input = "";
        }
      }

      _get(Object.getPrototypeOf(SearchCurrentWord.prototype), "moveCursor", this).call(this, cursor);
    }
  }, {
    key: "getPattern",
    value: function getPattern(term) {
      var escaped = this._.escapeRegExp(term);
      var source = /\W/.test(term) ? escaped + "\\b" : "\\b" + escaped + "\\b";
      return new RegExp(source, this.isCaseSensitive(term) ? "g" : "gi");
    }
  }, {
    key: "getCurrentWordBufferRange",
    value: function getCurrentWordBufferRange() {
      var cursor = this.editor.getLastCursor();
      var point = cursor.getBufferPosition();

      var nonWordCharacters = this.utils.getNonWordCharactersForCursor(cursor);
      var regex = new RegExp("[^\\s" + this._.escapeRegExp(nonWordCharacters) + "]+", "g");
      var options = { from: [point.row, 0], allowNextLine: false };
      return this.findInEditor("forward", regex, options, function (_ref2) {
        var range = _ref2.range;
        return range.end.isGreaterThan(point) && range;
      });
    }
  }]);

  return SearchCurrentWord;
})(SearchBase);

var SearchCurrentWordBackwards = (function (_SearchCurrentWord) {
  _inherits(SearchCurrentWordBackwards, _SearchCurrentWord);

  function SearchCurrentWordBackwards() {
    _classCallCheck(this, SearchCurrentWordBackwards);

    _get(Object.getPrototypeOf(SearchCurrentWordBackwards.prototype), "constructor", this).apply(this, arguments);

    this.backwards = true;
  }

  return SearchCurrentWordBackwards;
})(SearchCurrentWord);

module.exports = {
  SearchBase: SearchBase,
  Search: Search,
  SearchBackwards: SearchBackwards,
  SearchCurrentWord: SearchCurrentWord,
  SearchCurrentWordBackwards: SearchCurrentWordBackwards
};
// ['start' or 'end']
// ['start' or 'end']
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL21vdGlvbi1zZWFyY2guanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsV0FBVyxDQUFBOzs7Ozs7Ozs7O0FBRVgsSUFBTSxXQUFXLEdBQUcsT0FBTyxDQUFDLGdCQUFnQixDQUFDLENBQUE7O2VBQzVCLE9BQU8sQ0FBQyxVQUFVLENBQUM7O0lBQTdCLE1BQU0sWUFBTixNQUFNOztJQUVQLFVBQVU7WUFBVixVQUFVOztXQUFWLFVBQVU7MEJBQVYsVUFBVTs7K0JBQVYsVUFBVTs7U0FFZCxJQUFJLEdBQUcsSUFBSTtTQUNYLFNBQVMsR0FBRyxLQUFLO1NBQ2pCLFNBQVMsR0FBRyxJQUFJO1NBQ2hCLFlBQVksR0FBRyxJQUFJO1NBQ25CLG1CQUFtQixHQUFHLE9BQU87U0FDN0IsYUFBYSxHQUFHLElBQUk7U0FDcEIsdUJBQXVCLEdBQUcsSUFBSTs7Ozs7O2VBUjFCLFVBQVU7O1dBVUgsdUJBQUc7QUFDWixhQUFPLElBQUksQ0FBQyxTQUFTLENBQUE7S0FDdEI7OztXQUVTLHNCQUFHO0FBQ1gsaUNBZkUsVUFBVSw0Q0FlTTtBQUNsQixVQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQTtLQUMxQjs7O1dBRWtCLCtCQUFHO0FBQ3BCLGFBQU8sSUFBSSxjQUFXLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQW1CLENBQUMsQ0FBQTtLQUMxRjs7O1dBRVMsc0JBQUc7OztBQUNYLFVBQUksQ0FBQyxvQkFBb0IsQ0FBQztlQUFNLE1BQUssTUFBTSxFQUFFO09BQUEsQ0FBQyxDQUFBO0FBQzlDLGlDQXpCRSxVQUFVLDRDQXlCTTtLQUNuQjs7O1dBRU8sb0JBQUc7QUFDVCxhQUFPLDJCQTdCTCxVQUFVLDZDQTZCZSxJQUFJLENBQUMsV0FBVyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEdB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QUssRUFBQyxDQUFBO0FBQzVELGFBQU8sSUFBSSxDQUFDLFlBQVksQ0FBQyxTQUFTLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxVQUFDLEtBQU87WUFBTixLQUFLLEdBQU4sS0FBTyxDQUFOLEtBQUs7ZUFBTSxLQUFLLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsSUFBSSxLQUFLO09BQUEsQ0FBQyxDQUFBO0tBQzFHOzs7U0EvQkcsaUJBQWlCO0dBQVMsVUFBVTs7SUFrQ3BDLDBCQUEwQjtZQUExQiwwQkFBMEI7O1dBQTFCLDBCQUEwQjswQkFBMUIsMEJBQTBCOzsrQkFBMUIsMEJBQTBCOztTQUM5QixTQUFTLEdBQUcsSUFBSTs7O1NBRFosMEJBQTBCO0dBQVMsaUJBQWlCOztBQUkxRCxNQUFNLENBQUMsT0FBTyxHQUFHO0FBQ2YsWUFBVSxFQUFWLFVBQVU7QUFDVixRQUFNLEVBQU4sTUFBTTtBQUNOLGlCQUFlLEVBQWYsZUFBZTtBQUNmLG1CQUFpQixFQUFqQixpQkFBaUI7QUFDakIsNEJBQTBCLEVBQTFCLDBCQUEwQjtDQUMzQixDQUFBIiwiZmlsZSI6Ii9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL21vdGlvbi1zZWFyY2guanMiLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBiYWJlbFwiXG5cbmNvbnN0IFNlYXJjaE1vZGVsID0gcmVxdWlyZShcIi4vc2VhcmNoLW1vZGVsXCIpXG5jb25zdCB7TW90aW9ufSA9IHJlcXVpcmUoXCIuL21vdGlvblwiKVxuXG5jbGFzcyBTZWFyY2hCYXNlIGV4dGVuZHMgTW90aW9uIHtcbiAgc3RhdGljIGNvbW1hbmQgPSBmYWxzZVxuICBqdW1wID0gdHJ1ZVxuICBiYWNrd2FyZHMgPSBmYWxzZVxuICB1c2VSZWdleHAgPSB0cnVlXG4gIGxhbmRpbmdQb2ludCA9IG51bGwgLy8gWydzdGFydCcgb3IgJ2VuZCddXG4gIGRlZmF1bHRMYW5kaW5nUG9pbnQgPSBcInN0YXJ0XCIgLy8gWydzdGFydCcgb3IgJ2VuZCddXG4gIHJlbGF0aXZlSW5kZXggPSBudWxsXG4gIHVwZGF0ZWxhc3RTZWFyY2hQYXR0ZXJuID0gdHJ1ZVxuXG4gIGlzQmFja3dhcmRzKCkge1xuICAgIHJldHVybiB0aGlzLmJhY2t3YXJkc1xuICB9XG5cbiAgcmVzZXRTdGF0ZSgpIHtcbiAgICBzdXBlci5yZXNldFN0YXRlKClcbiAgICB0aGlzLnJlbGF0aXZlSW5kZXggPSBudWxsXG4gIH1cblxuICBpc0luY3JlbWVudGFsU2VhcmNoKCkge1xuICAgIHJldHVybiB0aGlzLmluc3RhbmNlb2YoXCJTZWFyY2hcIikgJiYgIXRoaXMucmVwZWF0ZWQgJiYgdGhpcy5nZXRDb25maWcoXCJpbmNyZW1lbnRhbFNlYXJjaFwiKVxuICB9XG5cbiAgaW5pdGlhbGl6ZSgpIHtcbiAgICB0aGlzLm9uRGlkRmluaXNoT3BlcmF0aW9uKCgpID0+IHRoaXMuZmluaXNoKCkpXG4gICAgc3VwZXIuaW5pdGlhbGl6ZSgpXG4gIH1cblxuICBnZXRDb3VudCgpIHtcbiAgICByZXR1cm4gc3VwZXIuZ2V0Q291bnQoKSAqICh0aGlzLmlzQmFja3dhcmRzKCkgPyAtMSA6IDEpXG4gIH1cblxuICBmaW5pc2goKSB7XG4gICAgaWYgKHRoaXMuaXNJbmNyZW1lbnRhbFNlYXJjaCgpICYmIHRoaXMuZ2V0Q29uZmlnKFwic2hvd0hvdmVyU2VhcmNoQ291bnRlclwiKSkge1xuICAgICAgdGhpcy52aW1TdGF0ZS5ob3ZlclNlYXJjaENvdW50ZXIucmVzZXQoKVxuICAgIH1cbiAgICBpZiAodGhpcy5zZWFyY2hNb2RlbCkgdGhpcy5zZWFyY2hNb2RlbC5kZXN0cm95KClcblxuICAgIHRoaXMucmVsYXRpdmVJbmRleCA9IG51bGxcbiAgICB0aGlzLnNlYXJjaE1vZGVsID0gbnVsbFxuICB9XG5cbiAgZ2V0TGFuZGluZ1BvaW50KCkge1xuICAgIGlmICghdGhpcy5sYW5kaW5nUG9pbnQpIHRoaXMubGFuZGluZ1BvaW50ID0gdGhpcy5kZWZhdWx0TGFuZGluZ1BvaW50XG4gICAgcmV0dXJuIHRoaXMubGFuZGluZ1BvaW50XG4gIH1cblxuICBnZXRQb2ludChjdXJzb3IpIHtcbiAgICBpZiAodGhpcy5zZWFyY2hNb2RlbCkge1xuICAgICAgdGhpcy5yZWxhdGl2ZUluZGV4ID0gdGhpcy5nZXRDb3VudCgpICsgdGhpcy5zZWFyY2hNb2RlbC5nZXRSZWxhdGl2ZUluZGV4KClcbiAgICB9IGVsc2UgaWYgKHRoaXMucmVsYXRpdmVJbmRleCA9PSBudWxsKSB7XG4gICAgICB0aGlzLnJlbGF0aXZlSW5kZXggPSB0aGlzLmdldENvdW50KClcbiAgICB9XG5cbiAgICBjb25zdCByYW5nZSA9IHRoaXMuc2VhcmNoKGN1cnNvciwgdGhpcy5pbnB1dCwgdGhpcy5yZWxhdGl2ZUluZGV4KVxuXG4gICAgdGhpcy5zZWFyY2hNb2RlbC5kZXN0cm95KClcbiAgICB0aGlzLnNlYXJjaE1vZGVsID0gbnVsbFxuXG4gICAgaWYgKHJhbmdlKSByZXR1cm4gcmFuZ2VbdGhpcy5nZXRMYW5kaW5nUG9pbnQoKV1cbiAgfVxuXG4gIG1vdmVDdXJzb3IoY3Vyc29yKSB7XG4gICAgaWYgKCF0aGlzLmlucHV0KSByZXR1cm5cbiAgICBjb25zdCBwb2ludCA9IHRoaXMuZ2V0UG9pbnQoY3Vyc29yKVxuXG4gICAgaWYgKHBvaW50KSB7XG4gICAgICBpZiAodGhpcy5yZXN0b3JlRWRpdG9yU3RhdGUpIHtcbiAgICAgICAgdGhpcy5yZXN0b3JlRWRpdG9yU3RhdGUoe2FuY2hvclBvc2l0aW9uOiBwb2ludCwgc2tpcFJvdzogcG9pbnQucm93fSlcbiAgICAgICAgdGhpcy5yZXN0b3JlRWRpdG9yU3RhdGUgPSBudWxsIC8vIEhBQ0s6IGRvbnQgcmVmb2xkIG9uIGBuYCwgYE5gIHJlcGVhdFxuICAgICAgfVxuICAgICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHBvaW50LCB7YXV0b3Njcm9sbDogZmFsc2V9KVxuICAgIH1cblxuICAgIGlmICghdGhpcy5yZXBlYXRlZCkge1xuICAgICAgdGhpcy5nbG9iYWxTdGF0ZS5zZXQoXCJjdXJyZW50U2VhcmNoXCIsIHRoaXMpXG4gICAgICB0aGlzLnZpbVN0YXRlLnNlYXJjaEhpc3Rvcnkuc2F2ZSh0aGlzLmlucHV0KVxuICAgIH1cblxuICAgIGlmICh0aGlzLnVwZGF0ZWxhc3RTZWFyY2hQYXR0ZXJuKSB7XG4gICAgICB0aGlzLmdsb2JhbFN0YXRlLnNldChcImxhc3RTZWFyY2hQYXR0ZXJuXCIsIHRoaXMuZ2V0UGF0dGVybih0aGlzLmlucHV0KSlcbiAgICB9XG4gIH1cblxuICBnZXRTZWFyY2hNb2RlbCgpIHtcbiAgICBpZiAoIXRoaXMuc2VhcmNoTW9kZWwpIHtcbiAgICAgIHRoaXMuc2VhcmNoTW9kZWwgPSBuZXcgU2VhcmNoTW9kZWwodGhpcy52aW1TdGF0ZSwge2luY3JlbWVudGFsU2VhcmNoOiB0aGlzLmlzSW5jcmVtZW50YWxTZWFyY2goKX0pXG4gICAgfVxuICAgIHJldHVybiB0aGlzLnNlYXJjaE1vZGVsXG4gIH1cblxuICBzZWFyY2goY3Vyc29yLCBpbnB1dCwgcmVsYXRpdmVJbmRleCkge1xuICAgIGNvbnN0IHNlYXJjaE1vZGVsID0gdGhpcy5nZXRTZWFyY2hNb2RlbCgpXG4gICAgaWYgKGlucHV0KSB7XG4gICAgICBjb25zdCBmcm9tUG9pbnQgPSB0aGlzLmdldEJ1ZmZlclBvc2l0aW9uRm9yQ3Vyc29yKGN1cnNvcilcbiAgICAgIHJldHVybiBzZWFyY2hNb2RlbC5zZWFyY2goZnJvbVBvaW50LCB0aGlzLmdldFBhdHRlcm4oaW5wdXQpLCByZWxhdGl2ZUluZGV4KVxuICAgIH1cbiAgICB0aGlzLnZpbVN0YXRlLmhvdmVyU2VhcmNoQ291bnRlci5yZXNldCgpXG4gICAgc2VhcmNoTW9kZWwuY2xlYXJNYXJrZXJzKClcbiAgfVxufVxuXG4vLyAvLCA/XG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBTZWFyY2ggZXh0ZW5kcyBTZWFyY2hCYXNlIHtcbiAgY2FzZVNlbnNpdGl2aXR5S2luZCA9IFwiU2VhcmNoXCJcbiAgcmVxdWlyZUlucHV0ID0gdHJ1ZVxuXG4gIGluaXRpYWxpemUoKSB7XG4gICAgaWYgKHRoaXMuaXNJbmNyZW1lbnRhbFNlYXJjaCgpKSB7XG4gICAgICB0aGlzLnJlc3RvcmVFZGl0b3JTdGF0ZSA9IHRoaXMudXRpbHMuc2F2ZUVkaXRvclN0YXRlKHRoaXMuZWRpdG9yKVxuICAgICAgdGhpcy5vbkRpZENvbW1hbmRTZWFyY2godGhpcy5oYW5kbGVDb21tYW5kRXZlbnQuYmluZCh0aGlzKSlcbiAgICB9XG5cbiAgICB0aGlzLm9uRGlkQ29uZmlybVNlYXJjaCh0aGlzLmhhbmRsZUNvbmZpcm1TZWFyY2guYmluZCh0aGlzKSlcbiAgICB0aGlzLm9uRGlkQ2FuY2VsU2VhcmNoKHRoaXMuaGFuZGxlQ2FuY2VsU2VhcmNoLmJpbmQodGhpcykpXG4gICAgdGhpcy5vbkRpZENoYW5nZVNlYXJjaCh0aGlzLmhhbmRsZUNoYW5nZVNlYXJjaC5iaW5kKHRoaXMpKVxuXG4gICAgdGhpcy5mb2N1c1NlYXJjaElucHV0RWRpdG9yKClcblxuICAgIHN1cGVyLmluaXRpYWxpemUoKVxuICB9XG5cbiAgZm9jdXNTZWFyY2hJbnB1dEVkaXRvcigpIHtcbiAgICBjb25zdCBjbGFzc0xpc3QgPSB0aGlzLmlzQmFja3dhcmRzKCkgPyBbXCJiYWNrd2FyZHNcIl0gOiBbXVxuICAgIHRoaXMudmltU3RhdGUuc2VhcmNoSW5wdXQuZm9jdXMoe2NsYXNzTGlzdH0pXG4gIH1cblxuICBoYW5kbGVDb21tYW5kRXZlbnQoZXZlbnQpIHtcbiAgICBpZiAoIWV2ZW50LmlucHV0KSByZXR1cm5cblxuICAgIGlmIChldmVudC5uYW1lID09PSBcInZpc2l0XCIpIHtcbiAgICAgIGxldCB7ZGlyZWN0aW9ufSA9IGV2ZW50XG4gICAgICBpZiAodGhpcy5pc0JhY2t3YXJkcygpICYmIHRoaXMuZ2V0Q29uZmlnKFwiaW5jcmVtZW50YWxTZWFyY2hWaXNpdERpcmVjdGlvblwiKSA9PT0gXCJyZWxhdGl2ZVwiKSB7XG4gICAgICAgIGRpcmVjdGlvbiA9IGRpcmVjdGlvbiA9PT0gXCJuZXh0XCIgPyBcInByZXZcIiA6IFwibmV4dFwiXG4gICAgICB9XG4gICAgICB0aGlzLmdldFNlYXJjaE1vZGVsKCkudmlzaXQoZGlyZWN0aW9uID09PSBcIm5leHRcIiA/ICsxIDogLTEpXG4gICAgfSBlbHNlIGlmIChldmVudC5uYW1lID09PSBcIm9jY3VycmVuY2VcIikge1xuICAgICAgY29uc3Qge29wZXJhdGlvbiwgaW5wdXR9ID0gZXZlbnRcbiAgICAgIHRoaXMub2NjdXJyZW5jZU1hbmFnZXIuYWRkUGF0dGVybih0aGlzLmdldFBhdHRlcm4oaW5wdXQpLCB7cmVzZXQ6IG9wZXJhdGlvbiAhPSBudWxsfSlcbiAgICAgIHRoaXMub2NjdXJyZW5jZU1hbmFnZXIuc2F2ZUxhc3RQYXR0ZXJuKClcblxuICAgICAgdGhpcy52aW1TdGF0ZS5zZWFyY2hIaXN0b3J5LnNhdmUoaW5wdXQpXG4gICAgICB0aGlzLnZpbVN0YXRlLnNlYXJjaElucHV0LmNhbmNlbCgpXG4gICAgICBpZiAob3BlcmF0aW9uICE9IG51bGwpIHRoaXMudmltU3RhdGUub3BlcmF0aW9uU3RhY2sucnVuKG9wZXJhdGlvbilcbiAgICB9IGVsc2UgaWYgKGV2ZW50Lm5hbWUgPT09IFwicHJvamVjdC1maW5kXCIpIHtcbiAgICAgIHRoaXMudmltU3RhdGUuc2VhcmNoSGlzdG9yeS5zYXZlKGV2ZW50LmlucHV0KVxuICAgICAgdGhpcy52aW1TdGF0ZS5zZWFyY2hJbnB1dC5jYW5jZWwoKVxuICAgICAgdGhpcy51dGlscy5zZWFyY2hCeVByb2plY3RGaW5kKHRoaXMuZWRpdG9yLCBldmVudC5pbnB1dClcbiAgICB9XG4gIH1cblxuICBoYW5kbGVDYW5jZWxTZWFyY2goKSB7XG4gICAgaWYgKCFbXCJ2aXN1YWxcIiwgXCJpbnNlcnRcIl0uaW5jbHVkZXModGhpcy5tb2RlKSkgdGhpcy52aW1TdGF0ZS5yZXNldE5vcm1hbE1vZGUoKVxuXG4gICAgaWYgKHRoaXMucmVzdG9yZUVkaXRvclN0YXRlKSB0aGlzLnJlc3RvcmVFZGl0b3JTdGF0ZSgpXG4gICAgdGhpcy52aW1TdGF0ZS5yZXNldCgpXG4gICAgdGhpcy5maW5pc2goKVxuICB9XG5cbiAgaXNTZWFyY2hSZXBlYXRDaGFyYWN0ZXIoY2hhcikge1xuICAgIHJldHVybiB0aGlzLmlzSW5jcmVtZW50YWxTZWFyY2goKSA/IGNoYXIgPT09IFwiXCIgOiBbXCJcIiwgdGhpcy5pc0JhY2t3YXJkcygpID8gXCI/XCIgOiBcIi9cIl0uaW5jbHVkZXMoY2hhcikgLy8gZW1wdHkgY29uZmlybSBvciBpbnZva2luZy1jaGFyXG4gIH1cblxuICBoYW5kbGVDb25maXJtU2VhcmNoKHtpbnB1dCwgbGFuZGluZ1BvaW50fSkge1xuICAgIHRoaXMuaW5wdXQgPSBpbnB1dFxuICAgIHRoaXMubGFuZGluZ1BvaW50ID0gbGFuZGluZ1BvaW50XG4gICAgaWYgKHRoaXMuaXNTZWFyY2hSZXBlYXRDaGFyYWN0ZXIodGhpcy5pbnB1dCkpIHtcbiAgICAgIHRoaXMuaW5wdXQgPSB0aGlzLnZpbVN0YXRlLnNlYXJjaEhpc3RvcnkuZ2V0KFwicHJldlwiKVxuICAgICAgaWYgKCF0aGlzLmlucHV0KSBhdG9tLmJlZXAoKVxuICAgIH1cbiAgICB0aGlzLnByb2Nlc3NPcGVyYXRpb24oKVxuICB9XG5cbiAgaGFuZGxlQ2hhbmdlU2VhcmNoKGlucHV0KSB7XG4gICAgLy8gSWYgaW5wdXQgc3RhcnRzIHdpdGggc3BhY2UsIHJlbW92ZSBmaXJzdCBzcGFjZSBhbmQgZGlzYWJsZSB1c2VSZWdleHAuXG4gICAgaWYgKGlucHV0LnN0YXJ0c1dpdGgoXCIgXCIpKSB7XG4gICAgICAvLyBGSVhNRTogU291bGQgSSByZW1vdmUgdGhpcyB1bmtub3duIGhhY2sgYW5kIGltcGxlbWVudCB2aXNpYmxlIGJ1dHRvbiB0byB0b2dsZSByZWdleHA/XG4gICAgICBpbnB1dCA9IGlucHV0LnJlcGxhY2UoL14gLywgXCJcIilcbiAgICAgIHRoaXMudXNlUmVnZXhwID0gZmFsc2VcbiAgICB9XG4gICAgdGhpcy52aW1TdGF0ZS5zZWFyY2hJbnB1dC51cGRhdGVPcHRpb25TZXR0aW5ncyh7dXNlUmVnZXhwOiB0aGlzLnVzZVJlZ2V4cH0pXG5cbiAgICBpZiAodGhpcy5pc0luY3JlbWVudGFsU2VhcmNoKCkpIHtcbiAgICAgIHRoaXMuc2VhcmNoKHRoaXMuZWRpdG9yLmdldExhc3RDdXJzb3IoKSwgaW5wdXQsIHRoaXMuZ2V0Q291bnQoKSlcbiAgICB9XG4gIH1cblxuICBnZXRQYXR0ZXJuKHRlcm0pIHtcbiAgICBsZXQgbW9kaWZpZXJzID0gdGhpcy5pc0Nhc2VTZW5zaXRpdmUodGVybSkgPyBcImdcIiA6IFwiZ2lcIlxuICAgIC8vIEZJWE1FIHRoaXMgcHJldmVudCBzZWFyY2ggXFxcXGMgaXRzZWxmLlxuICAgIC8vIERPTlQgdGhpbmtsZXNzbHkgbWltaWMgcHVyZSBWaW0uIEluc3RlYWQsIHByb3ZpZGUgaWdub3JlY2FzZSBidXR0b24gYW5kIHNob3J0Y3V0LlxuICAgIGlmICh0ZXJtLmluZGV4T2YoXCJcXFxcY1wiKSA+PSAwKSB7XG4gICAgICB0ZXJtID0gdGVybS5yZXBsYWNlKFwiXFxcXGNcIiwgXCJcIilcbiAgICAgIGlmICghbW9kaWZpZXJzLmluY2x1ZGVzKFwiaVwiKSkgbW9kaWZpZXJzICs9IFwiaVwiXG4gICAgfVxuXG4gICAgaWYgKHRoaXMudXNlUmVnZXhwKSB7XG4gICAgICB0cnkge1xuICAgICAgICByZXR1cm4gbmV3IFJlZ0V4cCh0ZXJtLCBtb2RpZmllcnMpXG4gICAgICB9IGNhdGNoIChlcnJvcikge31cbiAgICB9XG4gICAgcmV0dXJuIG5ldyBSZWdFeHAodGhpcy5fLmVzY2FwZVJlZ0V4cCh0ZXJtKSwgbW9kaWZpZXJzKVxuICB9XG59XG5cbmNsYXNzIFNlYXJjaEJhY2t3YXJkcyBleHRlbmRzIFNlYXJjaCB7XG4gIGJhY2t3YXJkcyA9IHRydWVcbn1cblxuLy8gKiwgI1xuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgU2VhcmNoQ3VycmVudFdvcmQgZXh0ZW5kcyBTZWFyY2hCYXNlIHtcbiAgY2FzZVNlbnNpdGl2aXR5S2luZCA9IFwiU2VhcmNoQ3VycmVudFdvcmRcIlxuXG4gIG1vdmVDdXJzb3IoY3Vyc29yKSB7XG4gICAgaWYgKHRoaXMuaW5wdXQgPT0gbnVsbCkge1xuICAgICAgY29uc3Qgd29yZFJhbmdlID0gdGhpcy5nZXRDdXJyZW50V29yZEJ1ZmZlclJhbmdlKClcbiAgICAgIGlmICh3b3JkUmFuZ2UpIHtcbiAgICAgICAgdGhpcy5lZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24od29yZFJhbmdlLnN0YXJ0KVxuICAgICAgICB0aGlzLmlucHV0ID0gdGhpcy5lZGl0b3IuZ2V0VGV4dEluQnVmZmVyUmFuZ2Uod29yZFJhbmdlKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5pbnB1dCA9IFwiXCJcbiAgICAgIH1cbiAgICB9XG5cbiAgICBzdXBlci5tb3ZlQ3Vyc29yKGN1cnNvcilcbiAgfVxuXG4gIGdldFBhdHRlcm4odGVybSkge1xuICAgIGNvbnN0IGVzY2FwZWQgPSB0aGlzLl8uZXNjYXBlUmVnRXhwKHRlcm0pXG4gICAgY29uc3Qgc291cmNlID0gL1xcVy8udGVzdCh0ZXJtKSA/IGAke2VzY2FwZWR9XFxcXGJgIDogYFxcXFxiJHtlc2NhcGVkfVxcXFxiYFxuICAgIHJldHVybiBuZXcgUmVnRXhwKHNvdXJjZSwgdGhpcy5pc0Nhc2VTZW5zaXRpdmUodGVybSkgPyBcImdcIiA6IFwiZ2lcIilcbiAgfVxuXG4gIGdldEN1cnJlbnRXb3JkQnVmZmVyUmFuZ2UoKSB7XG4gICAgY29uc3QgY3Vyc29yID0gdGhpcy5lZGl0b3IuZ2V0TGFzdEN1cnNvcigpXG4gICAgY29uc3QgcG9pbnQgPSBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuXG4gICAgY29uc3Qgbm9uV29yZENoYXJhY3RlcnMgPSB0aGlzLnV0aWxzLmdldE5vbldvcmRDaGFyYWN0ZXJzRm9yQ3Vyc29yKGN1cnNvcilcbiAgICBjb25zdCByZWdleCA9IG5ldyBSZWdFeHAoYFteXFxcXHMke3RoaXMuXy5lc2NhcGVSZWdFeHAobm9uV29yZENoYXJhY3RlcnMpfV0rYCwgXCJnXCIpXG4gICAgY29uc3Qgb3B0aW9ucyA9IHtmcm9tOiBbcG9pbnQucm93LCAwXSwgYWxsb3dOZXh0TGluZTogZmFsc2V9XG4gICAgcmV0dXJuIHRoaXMuZmluZEluRWRpdG9yKFwiZm9yd2FyZFwiLCByZWdleCwgb3B0aW9ucywgKHtyYW5nZX0pID0+IHJhbmdlLmVuZC5pc0dyZWF0ZXJUaGFuKHBvaW50KSAmJiByYW5nZSlcbiAgfVxufVxuXG5jbGFzcyBTZWFyY2hDdXJyZW50V29yZEJhY2t3YXJkcyBleHRlbmRzIFNlYXJjaEN1cnJlbnRXb3JkIHtcbiAgYmFja3dhcmRzID0gdHJ1ZVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgU2VhcmNoQmFzZSxcbiAgU2VhcmNoLFxuICBTZWFyY2hCYWNrd2FyZHMsXG4gIFNlYXJjaEN1cnJlbnRXb3JkLFxuICBTZWFyY2hDdXJyZW50V29yZEJhY2t3YXJkcyxcbn1cbiJdfQ==