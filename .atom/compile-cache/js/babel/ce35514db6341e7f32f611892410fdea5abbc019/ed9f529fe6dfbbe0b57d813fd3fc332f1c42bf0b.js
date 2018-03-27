"use babel";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _ = require("underscore-plus");

var _require = require("./utils");

var saveEditorState = _require.saveEditorState;
var getNonWordCharactersForCursor = _require.getNonWordCharactersForCursor;
var searchByProjectFind = _require.searchByProjectFind;

var SearchModel = require("./search-model");
var Motion = require("./base").getClass("Motion");

var SearchBase = (function (_Motion) {
  _inherits(SearchBase, _Motion);

  function SearchBase() {
    _classCallCheck(this, SearchBase);

    _get(Object.getPrototypeOf(SearchBase.prototype), "constructor", this).apply(this, arguments);

    this.jump = true;
    this.backwards = false;
    this.useRegexp = true;
    this.caseSensitivityKind = null;
    this.landingPoint = null;
    this.defaultLandingPoint = "start";
    this.relativeIndex = null;
    this.updatelastSearchPattern = true;
  }

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
      return _get(Object.getPrototypeOf(SearchBase.prototype), "initialize", this).call(this);
    }
  }, {
    key: "getCount",
    value: function getCount() {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return _get(Object.getPrototypeOf(SearchBase.prototype), "getCount", this).apply(this, args) * (this.isBackwards() ? -1 : 1);
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

      if (point) cursor.setBufferPosition(point, { autoscroll: false });

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
  }]);

  return SearchBase;
})(Motion);

SearchBase.register(false);

// /, ?
// -------------------------

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
      if (!this.isComplete()) {
        if (this.isIncrementalSearch()) {
          this.restoreEditorState = saveEditorState(this.editor);
          this.onDidCommandSearch(this.handleCommandEvent.bind(this));
        }

        this.onDidConfirmSearch(this.handleConfirmSearch.bind(this));
        this.onDidCancelSearch(this.handleCancelSearch.bind(this));
        this.onDidChangeSearch(this.handleChangeSearch.bind(this));

        this.focusSearchInputEditor();
      }

      return _get(Object.getPrototypeOf(Search.prototype), "initialize", this).call(this);
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
        searchByProjectFind(this.editor, event.input);
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
      return new RegExp(_.escapeRegExp(term), modifiers);
    }
  }]);

  return Search;
})(SearchBase);

Search.register();

var SearchBackwards = (function (_Search) {
  _inherits(SearchBackwards, _Search);

  function SearchBackwards() {
    _classCallCheck(this, SearchBackwards);

    _get(Object.getPrototypeOf(SearchBackwards.prototype), "constructor", this).apply(this, arguments);

    this.backwards = true;
  }

  return SearchBackwards;
})(Search);

SearchBackwards.register();

// *, #
// -------------------------

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
      var escaped = _.escapeRegExp(term);
      var source = /\W/.test(term) ? escaped + "\\b" : "\\b" + escaped + "\\b";
      return new RegExp(source, this.isCaseSensitive(term) ? "g" : "gi");
    }
  }, {
    key: "getCurrentWordBufferRange",
    value: function getCurrentWordBufferRange() {
      var cursor = this.editor.getLastCursor();
      var point = cursor.getBufferPosition();

      var nonWordCharacters = getNonWordCharactersForCursor(cursor);
      var wordRegex = new RegExp("[^\\s" + _.escapeRegExp(nonWordCharacters) + "]+", "g");

      var foundRange = undefined;
      this.scanForward(wordRegex, { from: [point.row, 0], allowNextLine: false }, function (_ref2) {
        var range = _ref2.range;
        var stop = _ref2.stop;

        if (range.end.isGreaterThan(point)) {
          foundRange = range;
          stop();
        }
      });
      return foundRange;
    }
  }]);

  return SearchCurrentWord;
})(SearchBase);

SearchCurrentWord.register();

var SearchCurrentWordBackwards = (function (_SearchCurrentWord) {
  _inherits(SearchCurrentWordBackwards, _SearchCurrentWord);

  function SearchCurrentWordBackwards() {
    _classCallCheck(this, SearchCurrentWordBackwards);

    _get(Object.getPrototypeOf(SearchCurrentWordBackwards.prototype), "constructor", this).apply(this, arguments);

    this.backwards = true;
  }

  return SearchCurrentWordBackwards;
})(SearchCurrentWord);

SearchCurrentWordBackwards.register();
// ['start' or 'end']
// ['start' or 'end']
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL21vdGlvbi1zZWFyY2guanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsV0FBVyxDQUFBOzs7Ozs7Ozs7O0FBRVgsSUFBTSxDQUFDLEdBQUcsT0FBTyxDQUFDLGlCQUFpQixDQUFDLENBQUE7O2VBRTBDLE9BQU8sQ0FBQyxTQUFTLENBQUM7O0lBQXpGLGVBQWUsWUFBZixlQUFlO0lBQUUsNkJBQTZCLFlBQTdCLDZCQUE2QjtJQUFFLG1CQUFtQixZQUFuQixtQkFBbUI7O0FBQzFFLElBQU0sV0FBVyxHQUFHLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFBO0FBQzdDLElBQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUE7O0lBRTdDLFVBQVU7WUFBVixVQUFVOztXQUFWLFVBQVU7MEJBQVYsVUFBVTs7K0JBQVYsVUFBVTs7U0FDZCxJQUFJLEdBQUcsSUFBSTtTQUNYLFNBQVMsR0FBRyxLQUFLO1NBQ2pCLFNBQVMsR0FBRyxJQUFJO1NBQ2hCLG1CQUFtQixHQUFHLElBQUk7U0FDMUIsWUFBWSxHQUFHLElBQUk7U0FDbkIsbUJBQW1CLEdBQUcsT0FBTztTQUM3QixhQUFhLEdBQUcsSUFBSTtTQUNwQix1QkFBdUIsR0FBRyxJQUFJOzs7ZUFSMUIsVUFBVTs7V0FVSCx1QkFBRztBQUNaLGFBQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQTtLQUN0Qjs7O1dBRVMsc0JBQUc7QUFDWCxpQ0FmRSxVQUFVLDRDQWVNO0FBQ2xCLFVBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFBO0tBQzFCOzs7V0FFa0IsK0JBQUc7QUFDcEIsYUFBTyxJQUFJLGNBQVcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFBO0tB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QUMsQ0FBQTs7QUFFaEYsVUFBSSxVQUFVLFlBQUEsQ0FBQTtBQUNkLFVBQUksQ0FBQyxXQUFXLENBQUMsU0FBUyxFQUFFLEVBQUMsSUFBSSxFQUFFLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsRUFBRSxhQUFhLEVBQUUsS0FBSyxFQUFDLEVBQUUsVUFBQyxLQUFhLEVBQUs7WUFBakIsS0FBSyxHQUFOLEtBQWEsQ0FBWixLQUFLO1lBQUUsSUFBSSxHQUFaLEtBQWEsQ0FBTCxJQUFJOztBQUNyRixZQUFJLEtBQUssQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxFQUFFO0FBQ2xDLG9CQUFVLEdBQUcsS0FBSyxDQUFBO0FBQ2xCLGNBQUksRUFBRSxDQUFBO1NBQ1A7T0FDRixDQUFDLENBQUE7QUFDRixhQUFPLFVBQVUsQ0FBQTtLQUNsQjs7O1NBdENHLGlCQUFpQjtHQUFTLFVBQVU7O0FBd0MxQyxpQkFBaUIsQ0FBQyxRQUFRLEVBQUUsQ0FBQTs7SUFFdEIsMEJBQTBCO1lBQTFCLDBCQUEwQjs7V0FBMUIsMEJBQTBCOzBCQUExQiwwQkFBMEI7OytCQUExQiwwQkFBMEI7O1NBQzlCLFNBQVMsR0FBRyxJQUFJOzs7U0FEWiwwQkFBMEI7R0FBUyxpQkFBaUI7O0FBRzFELDBCQUEwQixDQUFDLFFBQVEsRUFBRSxDQUFBIiwiZmlsZSI6Ii9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL21vdGlvbi1zZWFyY2guanMiLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBiYWJlbFwiXG5cbmNvbnN0IF8gPSByZXF1aXJlKFwidW5kZXJzY29yZS1wbHVzXCIpXG5cbmNvbnN0IHtzYXZlRWRpdG9yU3RhdGUsIGdldE5vbldvcmRDaGFyYWN0ZXJzRm9yQ3Vyc29yLCBzZWFyY2hCeVByb2plY3RGaW5kfSA9IHJlcXVpcmUoXCIuL3V0aWxzXCIpXG5jb25zdCBTZWFyY2hNb2RlbCA9IHJlcXVpcmUoXCIuL3NlYXJjaC1tb2RlbFwiKVxuY29uc3QgTW90aW9uID0gcmVxdWlyZShcIi4vYmFzZVwiKS5nZXRDbGFzcyhcIk1vdGlvblwiKVxuXG5jbGFzcyBTZWFyY2hCYXNlIGV4dGVuZHMgTW90aW9uIHtcbiAganVtcCA9IHRydWVcbiAgYmFja3dhcmRzID0gZmFsc2VcbiAgdXNlUmVnZXhwID0gdHJ1ZVxuICBjYXNlU2Vuc2l0aXZpdHlLaW5kID0gbnVsbFxuICBsYW5kaW5nUG9pbnQgPSBudWxsIC8vIFsnc3RhcnQnIG9yICdlbmQnXVxuICBkZWZhdWx0TGFuZGluZ1BvaW50ID0gXCJzdGFydFwiIC8vIFsnc3RhcnQnIG9yICdlbmQnXVxuICByZWxhdGl2ZUluZGV4ID0gbnVsbFxuICB1cGRhdGVsYXN0U2VhcmNoUGF0dGVybiA9IHRydWVcblxuICBpc0JhY2t3YXJkcygpIHtcbiAgICByZXR1cm4gdGhpcy5iYWNrd2FyZHNcbiAgfVxuXG4gIHJlc2V0U3RhdGUoKSB7XG4gICAgc3VwZXIucmVzZXRTdGF0ZSgpXG4gICAgdGhpcy5yZWxhdGl2ZUluZGV4ID0gbnVsbFxuICB9XG5cbiAgaXNJbmNyZW1lbnRhbFNlYXJjaCgpIHtcbiAgICByZXR1cm4gdGhpcy5pbnN0YW5jZW9mKFwiU2VhcmNoXCIpICYmICF0aGlzLnJlcGVhdGVkICYmIHRoaXMuZ2V0Q29uZmlnKFwiaW5jcmVtZW50YWxTZWFyY2hcIilcbiAgfVxuXG4gIGluaXRpYWxpemUoKSB7XG4gICAgdGhpcy5vbkRpZEZpbmlzaE9wZXJhdGlvbigoKSA9PiB0aGlzLmZpbmlzaCgpKVxuICAgIHJldHVybiBzdXBlci5pbml0aWFsaXplKClcbiAgfVxuXG4gIGdldENvdW50KC4uLmFyZ3MpIHtcbiAgICByZXR1cm4gc3VwZXIuZ2V0Q291bnQoLi4uYXJncykgKiAodGhpcy5pc0JhY2t3YXJkcygpID8gLTEgOiAxKVxuICB9XG5cbiAgZmluaXNoKCkge1xuICAgIGlmICh0aGlzLmlzSW5jcmVtZW50YWxTZWFyY2goKSAmJiB0aGlzLmdldENvbmZpZyhcInNob3dIb3ZlclNlYXJjaENvdW50ZXJcIikpIHtcbiAgICAgIHRoaXMudmltU3RhdGUuaG92ZXJTZWFyY2hDb3VudGVyLnJlc2V0KClcbiAgICB9XG4gICAgaWYgKHRoaXMuc2VhcmNoTW9kZWwpIHRoaXMuc2VhcmNoTW9kZWwuZGVzdHJveSgpXG5cbiAgICB0aGlzLnJlbGF0aXZlSW5kZXggPSBudWxsXG4gICAgdGhpcy5zZWFyY2hNb2RlbCA9IG51bGxcbiAgfVxuXG4gIGdldExhbmRpbmdQb2ludCgpIHtcbiAgICBpZiAoIXRoaXMubGFuZGluZ1BvaW50KSB0aGlzLmxhbmRpbmdQb2ludCA9IHRoaXMuZGVmYXVsdExhbmRpbmdQb2ludFxuICAgIHJldHVybiB0aGlzLmxhbmRpbmdQb2ludFxuICB9XG5cbiAgZ2V0UG9pbnQoY3Vyc29yKSB7XG4gICAgaWYgKHRoaXMuc2VhcmNoTW9kZWwpIHtcbiAgICAgIHRoaXMucmVsYXRpdmVJbmRleCA9IHRoaXMuZ2V0Q291bnQoKSArIHRoaXMuc2VhcmNoTW9kZWwuZ2V0UmVsYXRpdmVJbmRleCgpXG4gICAgfSBlbHNlIGlmICh0aGlzLnJlbGF0aXZlSW5kZXggPT0gbnVsbCkge1xuICAgICAgdGhpcy5yZWxhdGl2ZUluZGV4ID0gdGhpcy5nZXRDb3VudCgpXG4gICAgfVxuXG4gICAgY29uc3QgcmFuZ2UgPSB0aGlzLnNlYXJjaChjdXJzb3IsIHRoaXMuaW5wdXQsIHRoaXMucmVsYXRpdmVJbmRleClcblxuICAgIHRoaXMuc2VhcmNoTW9kZWwuZGVzdHJveSgpXG4gICAgdGhpcy5zZWFyY2hNb2RlbCA9IG51bGxcblxuICAgIGlmIChyYW5nZSkgcmV0dXJuIHJhbmdlW3RoaXMuZ2V0TGFuZGluZ1BvaW50KCldXG4gIH1cblxuICBtb3ZlQ3Vyc29yKGN1cnNvcikge1xuICAgIGlmICghdGhpcy5pbnB1dCkgcmV0dXJuXG4gICAgY29uc3QgcG9pbnQgPSB0aGlzLmdldFBvaW50KGN1cnNvcilcblxuICAgIGlmIChwb2ludCkgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHBvaW50LCB7YXV0b3Njcm9sbDogZmFsc2V9KVxuXG4gICAgaWYgKCF0aGlzLnJlcGVhdGVkKSB7XG4gICAgICB0aGlzLmdsb2JhbFN0YXRlLnNldChcImN1cnJlbnRTZWFyY2hcIiwgdGhpcylcbiAgICAgIHRoaXMudmltU3RhdGUuc2VhcmNoSGlzdG9yeS5zYXZlKHRoaXMuaW5wdXQpXG4gICAgfVxuXG4gICAgaWYgKHRoaXMudXBkYXRlbGFzdFNlYXJjaFBhdHRlcm4pIHtcbiAgICAgIHRoaXMuZ2xvYmFsU3RhdGUuc2V0KFwibGFzdFNlYXJjaFBhdHRlcm5cIiwgdGhpcy5nZXRQYXR0ZXJuKHRoaXMuaW5wdXQpKVxuICAgIH1cbiAgfVxuXG4gIGdldFNlYXJjaE1vZGVsKCkge1xuICAgIGlmICghdGhpcy5zZWFyY2hNb2RlbCkge1xuICAgICAgdGhpcy5zZWFyY2hNb2RlbCA9IG5ldyBTZWFyY2hNb2RlbCh0aGlzLnZpbVN0YXRlLCB7aW5jcmVtZW50YWxTZWFyY2g6IHRoaXMuaXNJbmNyZW1lbnRhbFNlYXJjaCgpfSlcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuc2VhcmNoTW9kZWxcbiAgfVxuXG4gIHNlYXJjaChjdXJzb3IsIGlucHV0LCByZWxhdGl2ZUluZGV4KSB7XG4gICAgY29uc3Qgc2VhcmNoTW9kZWwgPSB0aGlzLmdldFNlYXJjaE1vZGVsKClcbiAgICBpZiAoaW5wdXQpIHtcbiAgICAgIGNvbnN0IGZyb21Qb2ludCA9IHRoaXMuZ2V0QnVmZmVyUG9zaXRpb25Gb3JDdXJzb3IoY3Vyc29yKVxuICAgICAgcmV0dXJuIHNlYXJjaE1vZGVsLnNlYXJjaChmcm9tUG9pbnQsIHRoaXMuZ2V0UGF0dGVybihpbnB1dCksIHJlbGF0aXZlSW5kZXgpXG4gICAgfVxuICAgIHRoaXMudmltU3RhdGUuaG92ZXJTZWFyY2hDb3VudGVyLnJlc2V0KClcbiAgICBzZWFyY2hNb2RlbC5jbGVhck1hcmtlcnMoKVxuICB9XG59XG5TZWFyY2hCYXNlLnJlZ2lzdGVyKGZhbHNlKVxuXG4vLyAvLCA/XG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBTZWFyY2ggZXh0ZW5kcyBTZWFyY2hCYXNlIHtcbiAgY2FzZVNlbnNpdGl2aXR5S2luZCA9IFwiU2VhcmNoXCJcbiAgcmVxdWlyZUlucHV0ID0gdHJ1ZVxuXG4gIGluaXRpYWxpemUoKSB7XG4gICAgaWYgKCF0aGlzLmlzQ29tcGxldGUoKSkge1xuICAgICAgaWYgKHRoaXMuaXNJbmNyZW1lbnRhbFNlYXJjaCgpKSB7XG4gICAgICAgIHRoaXMucmVzdG9yZUVkaXRvclN0YXRlID0gc2F2ZUVkaXRvclN0YXRlKHRoaXMuZWRpdG9yKVxuICAgICAgICB0aGlzLm9uRGlkQ29tbWFuZFNlYXJjaCh0aGlzLmhhbmRsZUNvbW1hbmRFdmVudC5iaW5kKHRoaXMpKVxuICAgICAgfVxuXG4gICAgICB0aGlzLm9uRGlkQ29uZmlybVNlYXJjaCh0aGlzLmhhbmRsZUNvbmZpcm1TZWFyY2guYmluZCh0aGlzKSlcbiAgICAgIHRoaXMub25EaWRDYW5jZWxTZWFyY2godGhpcy5oYW5kbGVDYW5jZWxTZWFyY2guYmluZCh0aGlzKSlcbiAgICAgIHRoaXMub25EaWRDaGFuZ2VTZWFyY2godGhpcy5oYW5kbGVDaGFuZ2VTZWFyY2guYmluZCh0aGlzKSlcblxuICAgICAgdGhpcy5mb2N1c1NlYXJjaElucHV0RWRpdG9yKClcbiAgICB9XG5cbiAgICByZXR1cm4gc3VwZXIuaW5pdGlhbGl6ZSgpXG4gIH1cblxuICBmb2N1c1NlYXJjaElucHV0RWRpdG9yKCkge1xuICAgIGNvbnN0IGNsYXNzTGlzdCA9IHRoaXMuaXNCYWNrd2FyZHMoKSA/IFtcImJhY2t3YXJkc1wiXSA6IFtdXG4gICAgdGhpcy52aW1TdGF0ZS5zZWFyY2hJbnB1dC5mb2N1cyh7Y2xhc3NMaXN0fSlcbiAgfVxuXG4gIGhhbmRsZUNvbW1hbmRFdmVudChldmVudCkge1xuICAgIGlmICghZXZlbnQuaW5wdXQpIHJldHVyblxuXG4gICAgaWYgKGV2ZW50Lm5hbWUgPT09IFwidmlzaXRcIikge1xuICAgICAgbGV0IHtkaXJlY3Rpb259ID0gZXZlbnRcbiAgICAgIGlmICh0aGlzLmlzQmFja3dhcmRzKCkgJiYgdGhpcy5nZXRDb25maWcoXCJpbmNyZW1lbnRhbFNlYXJjaFZpc2l0RGlyZWN0aW9uXCIpID09PSBcInJlbGF0aXZlXCIpIHtcbiAgICAgICAgZGlyZWN0aW9uID0gZGlyZWN0aW9uID09PSBcIm5leHRcIiA/IFwicHJldlwiIDogXCJuZXh0XCJcbiAgICAgIH1cbiAgICAgIHRoaXMuZ2V0U2VhcmNoTW9kZWwoKS52aXNpdChkaXJlY3Rpb24gPT09IFwibmV4dFwiID8gKzEgOiAtMSlcbiAgICB9IGVsc2UgaWYgKGV2ZW50Lm5hbWUgPT09IFwib2NjdXJyZW5jZVwiKSB7XG4gICAgICBjb25zdCB7b3BlcmF0aW9uLCBpbnB1dH0gPSBldmVudFxuICAgICAgdGhpcy5vY2N1cnJlbmNlTWFuYWdlci5hZGRQYXR0ZXJuKHRoaXMuZ2V0UGF0dGVybihpbnB1dCksIHtyZXNldDogb3BlcmF0aW9uICE9IG51bGx9KVxuICAgICAgdGhpcy5vY2N1cnJlbmNlTWFuYWdlci5zYXZlTGFzdFBhdHRlcm4oKVxuXG4gICAgICB0aGlzLnZpbVN0YXRlLnNlYXJjaEhpc3Rvcnkuc2F2ZShpbnB1dClcbiAgICAgIHRoaXMudmltU3RhdGUuc2VhcmNoSW5wdXQuY2FuY2VsKClcbiAgICAgIGlmIChvcGVyYXRpb24gIT0gbnVsbCkgdGhpcy52aW1TdGF0ZS5vcGVyYXRpb25TdGFjay5ydW4ob3BlcmF0aW9uKVxuICAgIH0gZWxzZSBpZiAoZXZlbnQubmFtZSA9PT0gXCJwcm9qZWN0LWZpbmRcIikge1xuICAgICAgdGhpcy52aW1TdGF0ZS5zZWFyY2hIaXN0b3J5LnNhdmUoZXZlbnQuaW5wdXQpXG4gICAgICB0aGlzLnZpbVN0YXRlLnNlYXJjaElucHV0LmNhbmNlbCgpXG4gICAgICBzZWFyY2hCeVByb2plY3RGaW5kKHRoaXMuZWRpdG9yLCBldmVudC5pbnB1dClcbiAgICB9XG4gIH1cblxuICBoYW5kbGVDYW5jZWxTZWFyY2goKSB7XG4gICAgaWYgKCFbXCJ2aXN1YWxcIiwgXCJpbnNlcnRcIl0uaW5jbHVkZXModGhpcy5tb2RlKSkgdGhpcy52aW1TdGF0ZS5yZXNldE5vcm1hbE1vZGUoKVxuXG4gICAgaWYgKHRoaXMucmVzdG9yZUVkaXRvclN0YXRlKSB0aGlzLnJlc3RvcmVFZGl0b3JTdGF0ZSgpXG4gICAgdGhpcy52aW1TdGF0ZS5yZXNldCgpXG4gICAgdGhpcy5maW5pc2goKVxuICB9XG5cbiAgaXNTZWFyY2hSZXBlYXRDaGFyYWN0ZXIoY2hhcikge1xuICAgIHJldHVybiB0aGlzLmlzSW5jcmVtZW50YWxTZWFyY2goKSA/IGNoYXIgPT09IFwiXCIgOiBbXCJcIiwgdGhpcy5pc0JhY2t3YXJkcygpID8gXCI/XCIgOiBcIi9cIl0uaW5jbHVkZXMoY2hhcikgLy8gZW1wdHkgY29uZmlybSBvciBpbnZva2luZy1jaGFyXG4gIH1cblxuICBoYW5kbGVDb25maXJtU2VhcmNoKHtpbnB1dCwgbGFuZGluZ1BvaW50fSkge1xuICAgIHRoaXMuaW5wdXQgPSBpbnB1dFxuICAgIHRoaXMubGFuZGluZ1BvaW50ID0gbGFuZGluZ1BvaW50XG4gICAgaWYgKHRoaXMuaXNTZWFyY2hSZXBlYXRDaGFyYWN0ZXIodGhpcy5pbnB1dCkpIHtcbiAgICAgIHRoaXMuaW5wdXQgPSB0aGlzLnZpbVN0YXRlLnNlYXJjaEhpc3RvcnkuZ2V0KFwicHJldlwiKVxuICAgICAgaWYgKCF0aGlzLmlucHV0KSBhdG9tLmJlZXAoKVxuICAgIH1cbiAgICB0aGlzLnByb2Nlc3NPcGVyYXRpb24oKVxuICB9XG5cbiAgaGFuZGxlQ2hhbmdlU2VhcmNoKGlucHV0KSB7XG4gICAgLy8gSWYgaW5wdXQgc3RhcnRzIHdpdGggc3BhY2UsIHJlbW92ZSBmaXJzdCBzcGFjZSBhbmQgZGlzYWJsZSB1c2VSZWdleHAuXG4gICAgaWYgKGlucHV0LnN0YXJ0c1dpdGgoXCIgXCIpKSB7XG4gICAgICAvLyBGSVhNRTogU291bGQgSSByZW1vdmUgdGhpcyB1bmtub3duIGhhY2sgYW5kIGltcGxlbWVudCB2aXNpYmxlIGJ1dHRvbiB0byB0b2dsZSByZWdleHA/XG4gICAgICBpbnB1dCA9IGlucHV0LnJlcGxhY2UoL14gLywgXCJcIilcbiAgICAgIHRoaXMudXNlUmVnZXhwID0gZmFsc2VcbiAgICB9XG4gICAgdGhpcy52aW1TdGF0ZS5zZWFyY2hJbnB1dC51cGRhdGVPcHRpb25TZXR0aW5ncyh7dXNlUmVnZXhwOiB0aGlzLnVzZVJlZ2V4cH0pXG5cbiAgICBpZiAodGhpcy5pc0luY3JlbWVudGFsU2VhcmNoKCkpIHtcbiAgICAgIHRoaXMuc2VhcmNoKHRoaXMuZWRpdG9yLmdldExhc3RDdXJzb3IoKSwgaW5wdXQsIHRoaXMuZ2V0Q291bnQoKSlcbiAgICB9XG4gIH1cblxuICBnZXRQYXR0ZXJuKHRlcm0pIHtcbiAgICBsZXQgbW9kaWZpZXJzID0gdGhpcy5pc0Nhc2VTZW5zaXRpdmUodGVybSkgPyBcImdcIiA6IFwiZ2lcIlxuICAgIC8vIEZJWE1FIHRoaXMgcHJldmVudCBzZWFyY2ggXFxcXGMgaXRzZWxmLlxuICAgIC8vIERPTlQgdGhpbmtsZXNzbHkgbWltaWMgcHVyZSBWaW0uIEluc3RlYWQsIHByb3ZpZGUgaWdub3JlY2FzZSBidXR0b24gYW5kIHNob3J0Y3V0LlxuICAgIGlmICh0ZXJtLmluZGV4T2YoXCJcXFxcY1wiKSA+PSAwKSB7XG4gICAgICB0ZXJtID0gdGVybS5yZXBsYWNlKFwiXFxcXGNcIiwgXCJcIilcbiAgICAgIGlmICghbW9kaWZpZXJzLmluY2x1ZGVzKFwiaVwiKSkgbW9kaWZpZXJzICs9IFwiaVwiXG4gICAgfVxuXG4gICAgaWYgKHRoaXMudXNlUmVnZXhwKSB7XG4gICAgICB0cnkge1xuICAgICAgICByZXR1cm4gbmV3IFJlZ0V4cCh0ZXJtLCBtb2RpZmllcnMpXG4gICAgICB9IGNhdGNoIChlcnJvcikge31cbiAgICB9XG4gICAgcmV0dXJuIG5ldyBSZWdFeHAoXy5lc2NhcGVSZWdFeHAodGVybSksIG1vZGlmaWVycylcbiAgfVxufVxuU2VhcmNoLnJlZ2lzdGVyKClcblxuY2xhc3MgU2VhcmNoQmFja3dhcmRzIGV4dGVuZHMgU2VhcmNoIHtcbiAgYmFja3dhcmRzID0gdHJ1ZVxufVxuU2VhcmNoQmFja3dhcmRzLnJlZ2lzdGVyKClcblxuLy8gKiwgI1xuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgU2VhcmNoQ3VycmVudFdvcmQgZXh0ZW5kcyBTZWFyY2hCYXNlIHtcbiAgY2FzZVNlbnNpdGl2aXR5S2luZCA9IFwiU2VhcmNoQ3VycmVudFdvcmRcIlxuXG4gIG1vdmVDdXJzb3IoY3Vyc29yKSB7XG4gICAgaWYgKHRoaXMuaW5wdXQgPT0gbnVsbCkge1xuICAgICAgY29uc3Qgd29yZFJhbmdlID0gdGhpcy5nZXRDdXJyZW50V29yZEJ1ZmZlclJhbmdlKClcbiAgICAgIGlmICh3b3JkUmFuZ2UpIHtcbiAgICAgICAgdGhpcy5lZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24od29yZFJhbmdlLnN0YXJ0KVxuICAgICAgICB0aGlzLmlucHV0ID0gdGhpcy5lZGl0b3IuZ2V0VGV4dEluQnVmZmVyUmFuZ2Uod29yZFJhbmdlKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5pbnB1dCA9IFwiXCJcbiAgICAgIH1cbiAgICB9XG5cbiAgICBzdXBlci5tb3ZlQ3Vyc29yKGN1cnNvcilcbiAgfVxuXG4gIGdldFBhdHRlcm4odGVybSkge1xuICAgIGNvbnN0IGVzY2FwZWQgPSBfLmVzY2FwZVJlZ0V4cCh0ZXJtKVxuICAgIGNvbnN0IHNvdXJjZSA9IC9cXFcvLnRlc3QodGVybSkgPyBgJHtlc2NhcGVkfVxcXFxiYCA6IGBcXFxcYiR7ZXNjYXBlZH1cXFxcYmBcbiAgICByZXR1cm4gbmV3IFJlZ0V4cChzb3VyY2UsIHRoaXMuaXNDYXNlU2Vuc2l0aXZlKHRlcm0pID8gXCJnXCIgOiBcImdpXCIpXG4gIH1cblxuICBnZXRDdXJyZW50V29yZEJ1ZmZlclJhbmdlKCkge1xuICAgIGNvbnN0IGN1cnNvciA9IHRoaXMuZWRpdG9yLmdldExhc3RDdXJzb3IoKVxuICAgIGNvbnN0IHBvaW50ID0gY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKClcblxuICAgIGNvbnN0IG5vbldvcmRDaGFyYWN0ZXJzID0gZ2V0Tm9uV29yZENoYXJhY3RlcnNGb3JDdXJzb3IoY3Vyc29yKVxuICAgIGNvbnN0IHdvcmRSZWdleCA9IG5ldyBSZWdFeHAoYFteXFxcXHMke18uZXNjYXBlUmVnRXhwKG5vbldvcmRDaGFyYWN0ZXJzKX1dK2AsIFwiZ1wiKVxuXG4gICAgbGV0IGZvdW5kUmFuZ2VcbiAgICB0aGlzLnNjYW5Gb3J3YXJkKHdvcmRSZWdleCwge2Zyb206IFtwb2ludC5yb3csIDBdLCBhbGxvd05leHRMaW5lOiBmYWxzZX0sICh7cmFuZ2UsIHN0b3B9KSA9PiB7XG4gICAgICBpZiAocmFuZ2UuZW5kLmlzR3JlYXRlclRoYW4ocG9pbnQpKSB7XG4gICAgICAgIGZvdW5kUmFuZ2UgPSByYW5nZVxuICAgICAgICBzdG9wKClcbiAgICAgIH1cbiAgICB9KVxuICAgIHJldHVybiBmb3VuZFJhbmdlXG4gIH1cbn1cblNlYXJjaEN1cnJlbnRXb3JkLnJlZ2lzdGVyKClcblxuY2xhc3MgU2VhcmNoQ3VycmVudFdvcmRCYWNrd2FyZHMgZXh0ZW5kcyBTZWFyY2hDdXJyZW50V29yZCB7XG4gIGJhY2t3YXJkcyA9IHRydWVcbn1cblNlYXJjaEN1cnJlbnRXb3JkQmFja3dhcmRzLnJlZ2lzdGVyKClcbiJdfQ==