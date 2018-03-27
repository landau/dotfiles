"use babel";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _ = require("underscore-plus");

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
      return new RegExp(_.escapeRegExp(term), modifiers);
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
      var escaped = _.escapeRegExp(term);
      var source = /\W/.test(term) ? escaped + "\\b" : "\\b" + escaped + "\\b";
      return new RegExp(source, this.isCaseSensitive(term) ? "g" : "gi");
    }
  }, {
    key: "getCurrentWordBufferRange",
    value: function getCurrentWordBufferRange() {
      var cursor = this.editor.getLastCursor();
      var point = cursor.getBufferPosition();

      var nonWordCharacters = this.utils.getNonWordCharactersForCursor(cursor);
      var regex = new RegExp("[^\\s" + _.escapeRegExp(nonWordCharacters) + "]+", "g");
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL21vdGlvbi1zZWFyY2guanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsV0FBVyxDQUFBOzs7Ozs7Ozs7O0FBRVgsSUFBTSxDQUFDLEdBQUcsT0FBTyxDQUFDLGlCQUFpQixDQUFDLENBQUE7O0FBRXBDLElBQU0sV0FBVyxHQUFHLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFBO0FBQzdDLElBQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUE7O0lBRTdDLFVBQVU7WUFBVixVQUFVOztXQUFWLFVBQVU7MEJBQVYsVUFBVTs7K0JBQVYsVUFBVTs7U0FFZCxJQUFJLEdBQUcsSUFBSTtTQUNYLFNBQVMsR0FBRyxLQUFLO1NBQ2pCLFNBQVMsR0FBRyxJQUFJO1NBQ2hCLFlBQVksR0FBRyxJQUFJO1NBQ25CLG1CQUFtQixHQUFHLE9BQU87U0FDN0IsYUFBYSxHQUFHLElBQUk7U0FDcEIsdUJBQXVCLEdBQUcsSUFBSTs7Ozs7O2VBUjFCLFVBQVU7O1dBVUgsdUJBQUc7QUFDWixhQUFPLElBQUksQ0FBQyxTQUFTLENBQUE7S0FDdEI7OztXQUVTLHNCQUFHO0FBQ1gsaUNBZkUsVUFBVSw0Q0FlTTtBQUNsQixVQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQTtLQUMxQjs7O1dBRWtCLCtCQUFHO0FBQ3BCLGFBQU8sSUFBSSxjQUFXLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQW1CLENBQUMsQ0FBQTtLQUMxRjs7O1dBRVMsc0JBQUc7OztBQUNYLFVBQUksQ0FBQyxvQkFBb0IsQ0FBQztlQUFNLE1BQUssTUFBTSxFQUFFO09BQUEsQ0FBQyxDQUFBO0FBQzlDLGlDQXpCRSxVQUFVLDRDQXlCTTtLQUNuQjs7O1dBRU8s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QU8sR0FBRyxFQUFDLElBQUksRUFBRSxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEVBQUUsYUFBYSxFQUFFLEtBQUssRUFBQyxDQUFBO0FBQzVELGFBQU8sSUFBSSxDQUFDLFlBQVksQ0FBQyxTQUFTLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxVQUFDLEtBQU87WUFBTixLQUFLLEdBQU4sS0FBTyxDQUFOLEtBQUs7ZUFBTSxLQUFLLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsSUFBSSxLQUFLO09BQUEsQ0FBQyxDQUFBO0tBQzFHOzs7U0EvQkcsaUJBQWlCO0dBQVMsVUFBVTs7SUFrQ3BDLDBCQUEwQjtZQUExQiwwQkFBMEI7O1dBQTFCLDBCQUEwQjswQkFBMUIsMEJBQTBCOzsrQkFBMUIsMEJBQTBCOztTQUM5QixTQUFTLEdBQUcsSUFBSTs7O1NBRFosMEJBQTBCO0dBQVMsaUJBQWlCOztBQUkxRCxNQUFNLENBQUMsT0FBTyxHQUFHO0FBQ2YsWUFBVSxFQUFWLFVBQVU7QUFDVixRQUFNLEVBQU4sTUFBTTtBQUNOLGlCQUFlLEVBQWYsZUFBZTtBQUNmLG1CQUFpQixFQUFqQixpQkFBaUI7QUFDakIsNEJBQTBCLEVBQTFCLDBCQUEwQjtDQUMzQixDQUFBIiwiZmlsZSI6Ii9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL21vdGlvbi1zZWFyY2guanMiLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBiYWJlbFwiXG5cbmNvbnN0IF8gPSByZXF1aXJlKFwidW5kZXJzY29yZS1wbHVzXCIpXG5cbmNvbnN0IFNlYXJjaE1vZGVsID0gcmVxdWlyZShcIi4vc2VhcmNoLW1vZGVsXCIpXG5jb25zdCBNb3Rpb24gPSByZXF1aXJlKFwiLi9iYXNlXCIpLmdldENsYXNzKFwiTW90aW9uXCIpXG5cbmNsYXNzIFNlYXJjaEJhc2UgZXh0ZW5kcyBNb3Rpb24ge1xuICBzdGF0aWMgY29tbWFuZCA9IGZhbHNlXG4gIGp1bXAgPSB0cnVlXG4gIGJhY2t3YXJkcyA9IGZhbHNlXG4gIHVzZVJlZ2V4cCA9IHRydWVcbiAgbGFuZGluZ1BvaW50ID0gbnVsbCAvLyBbJ3N0YXJ0JyBvciAnZW5kJ11cbiAgZGVmYXVsdExhbmRpbmdQb2ludCA9IFwic3RhcnRcIiAvLyBbJ3N0YXJ0JyBvciAnZW5kJ11cbiAgcmVsYXRpdmVJbmRleCA9IG51bGxcbiAgdXBkYXRlbGFzdFNlYXJjaFBhdHRlcm4gPSB0cnVlXG5cbiAgaXNCYWNrd2FyZHMoKSB7XG4gICAgcmV0dXJuIHRoaXMuYmFja3dhcmRzXG4gIH1cblxuICByZXNldFN0YXRlKCkge1xuICAgIHN1cGVyLnJlc2V0U3RhdGUoKVxuICAgIHRoaXMucmVsYXRpdmVJbmRleCA9IG51bGxcbiAgfVxuXG4gIGlzSW5jcmVtZW50YWxTZWFyY2goKSB7XG4gICAgcmV0dXJuIHRoaXMuaW5zdGFuY2VvZihcIlNlYXJjaFwiKSAmJiAhdGhpcy5yZXBlYXRlZCAmJiB0aGlzLmdldENvbmZpZyhcImluY3JlbWVudGFsU2VhcmNoXCIpXG4gIH1cblxuICBpbml0aWFsaXplKCkge1xuICAgIHRoaXMub25EaWRGaW5pc2hPcGVyYXRpb24oKCkgPT4gdGhpcy5maW5pc2goKSlcbiAgICBzdXBlci5pbml0aWFsaXplKClcbiAgfVxuXG4gIGdldENvdW50KC4uLmFyZ3MpIHtcbiAgICByZXR1cm4gc3VwZXIuZ2V0Q291bnQoLi4uYXJncykgKiAodGhpcy5pc0JhY2t3YXJkcygpID8gLTEgOiAxKVxuICB9XG5cbiAgZmluaXNoKCkge1xuICAgIGlmICh0aGlzLmlzSW5jcmVtZW50YWxTZWFyY2goKSAmJiB0aGlzLmdldENvbmZpZyhcInNob3dIb3ZlclNlYXJjaENvdW50ZXJcIikpIHtcbiAgICAgIHRoaXMudmltU3RhdGUuaG92ZXJTZWFyY2hDb3VudGVyLnJlc2V0KClcbiAgICB9XG4gICAgaWYgKHRoaXMuc2VhcmNoTW9kZWwpIHRoaXMuc2VhcmNoTW9kZWwuZGVzdHJveSgpXG5cbiAgICB0aGlzLnJlbGF0aXZlSW5kZXggPSBudWxsXG4gICAgdGhpcy5zZWFyY2hNb2RlbCA9IG51bGxcbiAgfVxuXG4gIGdldExhbmRpbmdQb2ludCgpIHtcbiAgICBpZiAoIXRoaXMubGFuZGluZ1BvaW50KSB0aGlzLmxhbmRpbmdQb2ludCA9IHRoaXMuZGVmYXVsdExhbmRpbmdQb2ludFxuICAgIHJldHVybiB0aGlzLmxhbmRpbmdQb2ludFxuICB9XG5cbiAgZ2V0UG9pbnQoY3Vyc29yKSB7XG4gICAgaWYgKHRoaXMuc2VhcmNoTW9kZWwpIHtcbiAgICAgIHRoaXMucmVsYXRpdmVJbmRleCA9IHRoaXMuZ2V0Q291bnQoKSArIHRoaXMuc2VhcmNoTW9kZWwuZ2V0UmVsYXRpdmVJbmRleCgpXG4gICAgfSBlbHNlIGlmICh0aGlzLnJlbGF0aXZlSW5kZXggPT0gbnVsbCkge1xuICAgICAgdGhpcy5yZWxhdGl2ZUluZGV4ID0gdGhpcy5nZXRDb3VudCgpXG4gICAgfVxuXG4gICAgY29uc3QgcmFuZ2UgPSB0aGlzLnNlYXJjaChjdXJzb3IsIHRoaXMuaW5wdXQsIHRoaXMucmVsYXRpdmVJbmRleClcblxuICAgIHRoaXMuc2VhcmNoTW9kZWwuZGVzdHJveSgpXG4gICAgdGhpcy5zZWFyY2hNb2RlbCA9IG51bGxcblxuICAgIGlmIChyYW5nZSkgcmV0dXJuIHJhbmdlW3RoaXMuZ2V0TGFuZGluZ1BvaW50KCldXG4gIH1cblxuICBtb3ZlQ3Vyc29yKGN1cnNvcikge1xuICAgIGlmICghdGhpcy5pbnB1dCkgcmV0dXJuXG4gICAgY29uc3QgcG9pbnQgPSB0aGlzLmdldFBvaW50KGN1cnNvcilcblxuICAgIGlmIChwb2ludCkge1xuICAgICAgaWYgKHRoaXMucmVzdG9yZUVkaXRvclN0YXRlKSB7XG4gICAgICAgIHRoaXMucmVzdG9yZUVkaXRvclN0YXRlKHthbmNob3JQb3NpdGlvbjogcG9pbnQsIHNraXBSb3c6IHBvaW50LnJvd30pXG4gICAgICAgIHRoaXMucmVzdG9yZUVkaXRvclN0YXRlID0gbnVsbCAvLyBIQUNLOiBkb250IHJlZm9sZCBvbiBgbmAsIGBOYCByZXBlYXRcbiAgICAgIH1cbiAgICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihwb2ludCwge2F1dG9zY3JvbGw6IGZhbHNlfSlcbiAgICB9XG5cbiAgICBpZiAoIXRoaXMucmVwZWF0ZWQpIHtcbiAgICAgIHRoaXMuZ2xvYmFsU3RhdGUuc2V0KFwiY3VycmVudFNlYXJjaFwiLCB0aGlzKVxuICAgICAgdGhpcy52aW1TdGF0ZS5zZWFyY2hIaXN0b3J5LnNhdmUodGhpcy5pbnB1dClcbiAgICB9XG5cbiAgICBpZiAodGhpcy51cGRhdGVsYXN0U2VhcmNoUGF0dGVybikge1xuICAgICAgdGhpcy5nbG9iYWxTdGF0ZS5zZXQoXCJsYXN0U2VhcmNoUGF0dGVyblwiLCB0aGlzLmdldFBhdHRlcm4odGhpcy5pbnB1dCkpXG4gICAgfVxuICB9XG5cbiAgZ2V0U2VhcmNoTW9kZWwoKSB7XG4gICAgaWYgKCF0aGlzLnNlYXJjaE1vZGVsKSB7XG4gICAgICB0aGlzLnNlYXJjaE1vZGVsID0gbmV3IFNlYXJjaE1vZGVsKHRoaXMudmltU3RhdGUsIHtpbmNyZW1lbnRhbFNlYXJjaDogdGhpcy5pc0luY3JlbWVudGFsU2VhcmNoKCl9KVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy5zZWFyY2hNb2RlbFxuICB9XG5cbiAgc2VhcmNoKGN1cnNvciwgaW5wdXQsIHJlbGF0aXZlSW5kZXgpIHtcbiAgICBjb25zdCBzZWFyY2hNb2RlbCA9IHRoaXMuZ2V0U2VhcmNoTW9kZWwoKVxuICAgIGlmIChpbnB1dCkge1xuICAgICAgY29uc3QgZnJvbVBvaW50ID0gdGhpcy5nZXRCdWZmZXJQb3NpdGlvbkZvckN1cnNvcihjdXJzb3IpXG4gICAgICByZXR1cm4gc2VhcmNoTW9kZWwuc2VhcmNoKGZyb21Qb2ludCwgdGhpcy5nZXRQYXR0ZXJuKGlucHV0KSwgcmVsYXRpdmVJbmRleClcbiAgICB9XG4gICAgdGhpcy52aW1TdGF0ZS5ob3ZlclNlYXJjaENvdW50ZXIucmVzZXQoKVxuICAgIHNlYXJjaE1vZGVsLmNsZWFyTWFya2VycygpXG4gIH1cbn1cblxuLy8gLywgP1xuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgU2VhcmNoIGV4dGVuZHMgU2VhcmNoQmFzZSB7XG4gIGNhc2VTZW5zaXRpdml0eUtpbmQgPSBcIlNlYXJjaFwiXG4gIHJlcXVpcmVJbnB1dCA9IHRydWVcblxuICBpbml0aWFsaXplKCkge1xuICAgIGlmICh0aGlzLmlzSW5jcmVtZW50YWxTZWFyY2goKSkge1xuICAgICAgdGhpcy5yZXN0b3JlRWRpdG9yU3RhdGUgPSB0aGlzLnV0aWxzLnNhdmVFZGl0b3JTdGF0ZSh0aGlzLmVkaXRvcilcbiAgICAgIHRoaXMub25EaWRDb21tYW5kU2VhcmNoKHRoaXMuaGFuZGxlQ29tbWFuZEV2ZW50LmJpbmQodGhpcykpXG4gICAgfVxuXG4gICAgdGhpcy5vbkRpZENvbmZpcm1TZWFyY2godGhpcy5oYW5kbGVDb25maXJtU2VhcmNoLmJpbmQodGhpcykpXG4gICAgdGhpcy5vbkRpZENhbmNlbFNlYXJjaCh0aGlzLmhhbmRsZUNhbmNlbFNlYXJjaC5iaW5kKHRoaXMpKVxuICAgIHRoaXMub25EaWRDaGFuZ2VTZWFyY2godGhpcy5oYW5kbGVDaGFuZ2VTZWFyY2guYmluZCh0aGlzKSlcblxuICAgIHRoaXMuZm9jdXNTZWFyY2hJbnB1dEVkaXRvcigpXG5cbiAgICBzdXBlci5pbml0aWFsaXplKClcbiAgfVxuXG4gIGZvY3VzU2VhcmNoSW5wdXRFZGl0b3IoKSB7XG4gICAgY29uc3QgY2xhc3NMaXN0ID0gdGhpcy5pc0JhY2t3YXJkcygpID8gW1wiYmFja3dhcmRzXCJdIDogW11cbiAgICB0aGlzLnZpbVN0YXRlLnNlYXJjaElucHV0LmZvY3VzKHtjbGFzc0xpc3R9KVxuICB9XG5cbiAgaGFuZGxlQ29tbWFuZEV2ZW50KGV2ZW50KSB7XG4gICAgaWYgKCFldmVudC5pbnB1dCkgcmV0dXJuXG5cbiAgICBpZiAoZXZlbnQubmFtZSA9PT0gXCJ2aXNpdFwiKSB7XG4gICAgICBsZXQge2RpcmVjdGlvbn0gPSBldmVudFxuICAgICAgaWYgKHRoaXMuaXNCYWNrd2FyZHMoKSAmJiB0aGlzLmdldENvbmZpZyhcImluY3JlbWVudGFsU2VhcmNoVmlzaXREaXJlY3Rpb25cIikgPT09IFwicmVsYXRpdmVcIikge1xuICAgICAgICBkaXJlY3Rpb24gPSBkaXJlY3Rpb24gPT09IFwibmV4dFwiID8gXCJwcmV2XCIgOiBcIm5leHRcIlxuICAgICAgfVxuICAgICAgdGhpcy5nZXRTZWFyY2hNb2RlbCgpLnZpc2l0KGRpcmVjdGlvbiA9PT0gXCJuZXh0XCIgPyArMSA6IC0xKVxuICAgIH0gZWxzZSBpZiAoZXZlbnQubmFtZSA9PT0gXCJvY2N1cnJlbmNlXCIpIHtcbiAgICAgIGNvbnN0IHtvcGVyYXRpb24sIGlucHV0fSA9IGV2ZW50XG4gICAgICB0aGlzLm9jY3VycmVuY2VNYW5hZ2VyLmFkZFBhdHRlcm4odGhpcy5nZXRQYXR0ZXJuKGlucHV0KSwge3Jlc2V0OiBvcGVyYXRpb24gIT0gbnVsbH0pXG4gICAgICB0aGlzLm9jY3VycmVuY2VNYW5hZ2VyLnNhdmVMYXN0UGF0dGVybigpXG5cbiAgICAgIHRoaXMudmltU3RhdGUuc2VhcmNoSGlzdG9yeS5zYXZlKGlucHV0KVxuICAgICAgdGhpcy52aW1TdGF0ZS5zZWFyY2hJbnB1dC5jYW5jZWwoKVxuICAgICAgaWYgKG9wZXJhdGlvbiAhPSBudWxsKSB0aGlzLnZpbVN0YXRlLm9wZXJhdGlvblN0YWNrLnJ1bihvcGVyYXRpb24pXG4gICAgfSBlbHNlIGlmIChldmVudC5uYW1lID09PSBcInByb2plY3QtZmluZFwiKSB7XG4gICAgICB0aGlzLnZpbVN0YXRlLnNlYXJjaEhpc3Rvcnkuc2F2ZShldmVudC5pbnB1dClcbiAgICAgIHRoaXMudmltU3RhdGUuc2VhcmNoSW5wdXQuY2FuY2VsKClcbiAgICAgIHRoaXMudXRpbHMuc2VhcmNoQnlQcm9qZWN0RmluZCh0aGlzLmVkaXRvciwgZXZlbnQuaW5wdXQpXG4gICAgfVxuICB9XG5cbiAgaGFuZGxlQ2FuY2VsU2VhcmNoKCkge1xuICAgIGlmICghW1widmlzdWFsXCIsIFwiaW5zZXJ0XCJdLmluY2x1ZGVzKHRoaXMubW9kZSkpIHRoaXMudmltU3RhdGUucmVzZXROb3JtYWxNb2RlKClcblxuICAgIGlmICh0aGlzLnJlc3RvcmVFZGl0b3JTdGF0ZSkgdGhpcy5yZXN0b3JlRWRpdG9yU3RhdGUoKVxuICAgIHRoaXMudmltU3RhdGUucmVzZXQoKVxuICAgIHRoaXMuZmluaXNoKClcbiAgfVxuXG4gIGlzU2VhcmNoUmVwZWF0Q2hhcmFjdGVyKGNoYXIpIHtcbiAgICByZXR1cm4gdGhpcy5pc0luY3JlbWVudGFsU2VhcmNoKCkgPyBjaGFyID09PSBcIlwiIDogW1wiXCIsIHRoaXMuaXNCYWNrd2FyZHMoKSA/IFwiP1wiIDogXCIvXCJdLmluY2x1ZGVzKGNoYXIpIC8vIGVtcHR5IGNvbmZpcm0gb3IgaW52b2tpbmctY2hhclxuICB9XG5cbiAgaGFuZGxlQ29uZmlybVNlYXJjaCh7aW5wdXQsIGxhbmRpbmdQb2ludH0pIHtcbiAgICB0aGlzLmlucHV0ID0gaW5wdXRcbiAgICB0aGlzLmxhbmRpbmdQb2ludCA9IGxhbmRpbmdQb2ludFxuICAgIGlmICh0aGlzLmlzU2VhcmNoUmVwZWF0Q2hhcmFjdGVyKHRoaXMuaW5wdXQpKSB7XG4gICAgICB0aGlzLmlucHV0ID0gdGhpcy52aW1TdGF0ZS5zZWFyY2hIaXN0b3J5LmdldChcInByZXZcIilcbiAgICAgIGlmICghdGhpcy5pbnB1dCkgYXRvbS5iZWVwKClcbiAgICB9XG4gICAgdGhpcy5wcm9jZXNzT3BlcmF0aW9uKClcbiAgfVxuXG4gIGhhbmRsZUNoYW5nZVNlYXJjaChpbnB1dCkge1xuICAgIC8vIElmIGlucHV0IHN0YXJ0cyB3aXRoIHNwYWNlLCByZW1vdmUgZmlyc3Qgc3BhY2UgYW5kIGRpc2FibGUgdXNlUmVnZXhwLlxuICAgIGlmIChpbnB1dC5zdGFydHNXaXRoKFwiIFwiKSkge1xuICAgICAgLy8gRklYTUU6IFNvdWxkIEkgcmVtb3ZlIHRoaXMgdW5rbm93biBoYWNrIGFuZCBpbXBsZW1lbnQgdmlzaWJsZSBidXR0b24gdG8gdG9nbGUgcmVnZXhwP1xuICAgICAgaW5wdXQgPSBpbnB1dC5yZXBsYWNlKC9eIC8sIFwiXCIpXG4gICAgICB0aGlzLnVzZVJlZ2V4cCA9IGZhbHNlXG4gICAgfVxuICAgIHRoaXMudmltU3RhdGUuc2VhcmNoSW5wdXQudXBkYXRlT3B0aW9uU2V0dGluZ3Moe3VzZVJlZ2V4cDogdGhpcy51c2VSZWdleHB9KVxuXG4gICAgaWYgKHRoaXMuaXNJbmNyZW1lbnRhbFNlYXJjaCgpKSB7XG4gICAgICB0aGlzLnNlYXJjaCh0aGlzLmVkaXRvci5nZXRMYXN0Q3Vyc29yKCksIGlucHV0LCB0aGlzLmdldENvdW50KCkpXG4gICAgfVxuICB9XG5cbiAgZ2V0UGF0dGVybih0ZXJtKSB7XG4gICAgbGV0IG1vZGlmaWVycyA9IHRoaXMuaXNDYXNlU2Vuc2l0aXZlKHRlcm0pID8gXCJnXCIgOiBcImdpXCJcbiAgICAvLyBGSVhNRSB0aGlzIHByZXZlbnQgc2VhcmNoIFxcXFxjIGl0c2VsZi5cbiAgICAvLyBET05UIHRoaW5rbGVzc2x5IG1pbWljIHB1cmUgVmltLiBJbnN0ZWFkLCBwcm92aWRlIGlnbm9yZWNhc2UgYnV0dG9uIGFuZCBzaG9ydGN1dC5cbiAgICBpZiAodGVybS5pbmRleE9mKFwiXFxcXGNcIikgPj0gMCkge1xuICAgICAgdGVybSA9IHRlcm0ucmVwbGFjZShcIlxcXFxjXCIsIFwiXCIpXG4gICAgICBpZiAoIW1vZGlmaWVycy5pbmNsdWRlcyhcImlcIikpIG1vZGlmaWVycyArPSBcImlcIlxuICAgIH1cblxuICAgIGlmICh0aGlzLnVzZVJlZ2V4cCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIG5ldyBSZWdFeHAodGVybSwgbW9kaWZpZXJzKVxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHt9XG4gICAgfVxuICAgIHJldHVybiBuZXcgUmVnRXhwKF8uZXNjYXBlUmVnRXhwKHRlcm0pLCBtb2RpZmllcnMpXG4gIH1cbn1cblxuY2xhc3MgU2VhcmNoQmFja3dhcmRzIGV4dGVuZHMgU2VhcmNoIHtcbiAgYmFja3dhcmRzID0gdHJ1ZVxufVxuXG4vLyAqLCAjXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBTZWFyY2hDdXJyZW50V29yZCBleHRlbmRzIFNlYXJjaEJhc2Uge1xuICBjYXNlU2Vuc2l0aXZpdHlLaW5kID0gXCJTZWFyY2hDdXJyZW50V29yZFwiXG5cbiAgbW92ZUN1cnNvcihjdXJzb3IpIHtcbiAgICBpZiAodGhpcy5pbnB1dCA9PSBudWxsKSB7XG4gICAgICBjb25zdCB3b3JkUmFuZ2UgPSB0aGlzLmdldEN1cnJlbnRXb3JkQnVmZmVyUmFuZ2UoKVxuICAgICAgaWYgKHdvcmRSYW5nZSkge1xuICAgICAgICB0aGlzLmVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbih3b3JkUmFuZ2Uuc3RhcnQpXG4gICAgICAgIHRoaXMuaW5wdXQgPSB0aGlzLmVkaXRvci5nZXRUZXh0SW5CdWZmZXJSYW5nZSh3b3JkUmFuZ2UpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmlucHV0ID0gXCJcIlxuICAgICAgfVxuICAgIH1cblxuICAgIHN1cGVyLm1vdmVDdXJzb3IoY3Vyc29yKVxuICB9XG5cbiAgZ2V0UGF0dGVybih0ZXJtKSB7XG4gICAgY29uc3QgZXNjYXBlZCA9IF8uZXNjYXBlUmVnRXhwKHRlcm0pXG4gICAgY29uc3Qgc291cmNlID0gL1xcVy8udGVzdCh0ZXJtKSA/IGAke2VzY2FwZWR9XFxcXGJgIDogYFxcXFxiJHtlc2NhcGVkfVxcXFxiYFxuICAgIHJldHVybiBuZXcgUmVnRXhwKHNvdXJjZSwgdGhpcy5pc0Nhc2VTZW5zaXRpdmUodGVybSkgPyBcImdcIiA6IFwiZ2lcIilcbiAgfVxuXG4gIGdldEN1cnJlbnRXb3JkQnVmZmVyUmFuZ2UoKSB7XG4gICAgY29uc3QgY3Vyc29yID0gdGhpcy5lZGl0b3IuZ2V0TGFzdEN1cnNvcigpXG4gICAgY29uc3QgcG9pbnQgPSBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuXG4gICAgY29uc3Qgbm9uV29yZENoYXJhY3RlcnMgPSB0aGlzLnV0aWxzLmdldE5vbldvcmRDaGFyYWN0ZXJzRm9yQ3Vyc29yKGN1cnNvcilcbiAgICBjb25zdCByZWdleCA9IG5ldyBSZWdFeHAoYFteXFxcXHMke18uZXNjYXBlUmVnRXhwKG5vbldvcmRDaGFyYWN0ZXJzKX1dK2AsIFwiZ1wiKVxuICAgIGNvbnN0IG9wdGlvbnMgPSB7ZnJvbTogW3BvaW50LnJvdywgMF0sIGFsbG93TmV4dExpbmU6IGZhbHNlfVxuICAgIHJldHVybiB0aGlzLmZpbmRJbkVkaXRvcihcImZvcndhcmRcIiwgcmVnZXgsIG9wdGlvbnMsICh7cmFuZ2V9KSA9PiByYW5nZS5lbmQuaXNHcmVhdGVyVGhhbihwb2ludCkgJiYgcmFuZ2UpXG4gIH1cbn1cblxuY2xhc3MgU2VhcmNoQ3VycmVudFdvcmRCYWNrd2FyZHMgZXh0ZW5kcyBTZWFyY2hDdXJyZW50V29yZCB7XG4gIGJhY2t3YXJkcyA9IHRydWVcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIFNlYXJjaEJhc2UsXG4gIFNlYXJjaCxcbiAgU2VhcmNoQmFja3dhcmRzLFxuICBTZWFyY2hDdXJyZW50V29yZCxcbiAgU2VhcmNoQ3VycmVudFdvcmRCYWNrd2FyZHMsXG59XG4iXX0=