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

      var nonWordCharacters = this.utils.getNonWordCharactersForCursor(cursor);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL21vdGlvbi1zZWFyY2guanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsV0FBVyxDQUFBOzs7Ozs7Ozs7O0FBRVgsSUFBTSxDQUFDLEdBQUcsT0FBTyxDQUFDLGlCQUFpQixDQUFDLENBQUE7O0FBRXBDLElBQU0sV0FBVyxHQUFHLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFBO0FBQzdDLElBQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUE7O0lBRTdDLFVBQVU7WUFBVixVQUFVOztXQUFWLFVBQVU7MEJBQVYsVUFBVTs7K0JBQVYsVUFBVTs7U0FDZCxJQUFJLEdBQUcsSUFBSTtTQUNYLFNBQVMsR0FBRyxLQUFLO1NBQ2pCLFNBQVMsR0FBRyxJQUFJO1NBQ2hCLFlBQVksR0FBRyxJQUFJO1NBQ25CLG1CQUFtQixHQUFHLE9BQU87U0FDN0IsYUFBYSxHQUFHLElBQUk7U0FDcEIsdUJBQXVCLEdBQUcsSUFBSTs7O2VBUDFCLFVBQVU7O1dBU0gsdUJBQUc7QUFDWixhQUFPLElBQUksQ0FBQyxTQUFTLENBQUE7S0FDdEI7OztXQUVTLHNCQUFHO0FBQ1gsaUNBZEUsVUFBVSw0Q0FjTTtBQUNsQixVQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQTtLQUMxQjs7O1dBRWtCLCtCQUFHO0FBQ3BCLGFBQU8sSUFBSSxjQUFXLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQW1CLENBQUMsQ0FBQTtLQUMxRjs7O1dBRVMsc0JBQUc7OztBQUNYLFVBQUksQ0FBQyxvQkFBb0IsQ0FBQztlQUFNLE1BQUssTUFBTSxFQUFFO09BQUEsQ0FBQyxDQUFBO0FBQzlDLGlDQXhCRSxVQUFVLDRDQXdCTTtLQUNuQjs7O1dBRU8sb0JB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LFNBQVMsR0FBRyxJQUFJLE1BQU0sV0FBUyxDQUFDLENBQUMsWUFBWSxDQUFDLGlCQUFpQixDQUFDLFNBQU0sR0FBRyxDQUFDLENBQUE7O0FBRWhGLFVBQUksVUFBVSxZQUFBLENBQUE7QUFDZCxVQUFJLENBQUMsV0FBVyxDQUFDLFNBQVMsRUFBRSxFQUFDLElBQUksRUFBRSxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEVBQUUsYUFBYSxFQUFFLEtBQUssRUFBQyxFQUFFLFVBQUMsS0FBYSxFQUFLO1lBQWpCLEtBQUssR0FBTixLQUFhLENBQVosS0FBSztZQUFFLElBQUksR0FBWixLQUFhLENBQUwsSUFBSTs7QUFDckYsWUFBSSxLQUFLLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsRUFBRTtBQUNsQyxvQkFBVSxHQUFHLEtBQUssQ0FBQTtBQUNsQixjQUFJLEVBQUUsQ0FBQTtTQUNQO09BQ0YsQ0FBQyxDQUFBO0FBQ0YsYUFBTyxVQUFVLENBQUE7S0FDbEI7OztTQXRDRyxpQkFBaUI7R0FBUyxVQUFVOztBQXdDMUMsaUJBQWlCLENBQUMsUUFBUSxFQUFFLENBQUE7O0lBRXRCLDBCQUEwQjtZQUExQiwwQkFBMEI7O1dBQTFCLDBCQUEwQjswQkFBMUIsMEJBQTBCOzsrQkFBMUIsMEJBQTBCOztTQUM5QixTQUFTLEdBQUcsSUFBSTs7O1NBRFosMEJBQTBCO0dBQVMsaUJBQWlCOztBQUcxRCwwQkFBMEIsQ0FBQyxRQUFRLEVBQUUsQ0FBQSIsImZpbGUiOiIvVXNlcnMvdGxhbmRhdS9kb3RmaWxlcy8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi9tb3Rpb24tc2VhcmNoLmpzIiwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2UgYmFiZWxcIlxuXG5jb25zdCBfID0gcmVxdWlyZShcInVuZGVyc2NvcmUtcGx1c1wiKVxuXG5jb25zdCBTZWFyY2hNb2RlbCA9IHJlcXVpcmUoXCIuL3NlYXJjaC1tb2RlbFwiKVxuY29uc3QgTW90aW9uID0gcmVxdWlyZShcIi4vYmFzZVwiKS5nZXRDbGFzcyhcIk1vdGlvblwiKVxuXG5jbGFzcyBTZWFyY2hCYXNlIGV4dGVuZHMgTW90aW9uIHtcbiAganVtcCA9IHRydWVcbiAgYmFja3dhcmRzID0gZmFsc2VcbiAgdXNlUmVnZXhwID0gdHJ1ZVxuICBsYW5kaW5nUG9pbnQgPSBudWxsIC8vIFsnc3RhcnQnIG9yICdlbmQnXVxuICBkZWZhdWx0TGFuZGluZ1BvaW50ID0gXCJzdGFydFwiIC8vIFsnc3RhcnQnIG9yICdlbmQnXVxuICByZWxhdGl2ZUluZGV4ID0gbnVsbFxuICB1cGRhdGVsYXN0U2VhcmNoUGF0dGVybiA9IHRydWVcblxuICBpc0JhY2t3YXJkcygpIHtcbiAgICByZXR1cm4gdGhpcy5iYWNrd2FyZHNcbiAgfVxuXG4gIHJlc2V0U3RhdGUoKSB7XG4gICAgc3VwZXIucmVzZXRTdGF0ZSgpXG4gICAgdGhpcy5yZWxhdGl2ZUluZGV4ID0gbnVsbFxuICB9XG5cbiAgaXNJbmNyZW1lbnRhbFNlYXJjaCgpIHtcbiAgICByZXR1cm4gdGhpcy5pbnN0YW5jZW9mKFwiU2VhcmNoXCIpICYmICF0aGlzLnJlcGVhdGVkICYmIHRoaXMuZ2V0Q29uZmlnKFwiaW5jcmVtZW50YWxTZWFyY2hcIilcbiAgfVxuXG4gIGluaXRpYWxpemUoKSB7XG4gICAgdGhpcy5vbkRpZEZpbmlzaE9wZXJhdGlvbigoKSA9PiB0aGlzLmZpbmlzaCgpKVxuICAgIHN1cGVyLmluaXRpYWxpemUoKVxuICB9XG5cbiAgZ2V0Q291bnQoLi4uYXJncykge1xuICAgIHJldHVybiBzdXBlci5nZXRDb3VudCguLi5hcmdzKSAqICh0aGlzLmlzQmFja3dhcmRzKCkgPyAtMSA6IDEpXG4gIH1cblxuICBmaW5pc2goKSB7XG4gICAgaWYgKHRoaXMuaXNJbmNyZW1lbnRhbFNlYXJjaCgpICYmIHRoaXMuZ2V0Q29uZmlnKFwic2hvd0hvdmVyU2VhcmNoQ291bnRlclwiKSkge1xuICAgICAgdGhpcy52aW1TdGF0ZS5ob3ZlclNlYXJjaENvdW50ZXIucmVzZXQoKVxuICAgIH1cbiAgICBpZiAodGhpcy5zZWFyY2hNb2RlbCkgdGhpcy5zZWFyY2hNb2RlbC5kZXN0cm95KClcblxuICAgIHRoaXMucmVsYXRpdmVJbmRleCA9IG51bGxcbiAgICB0aGlzLnNlYXJjaE1vZGVsID0gbnVsbFxuICB9XG5cbiAgZ2V0TGFuZGluZ1BvaW50KCkge1xuICAgIGlmICghdGhpcy5sYW5kaW5nUG9pbnQpIHRoaXMubGFuZGluZ1BvaW50ID0gdGhpcy5kZWZhdWx0TGFuZGluZ1BvaW50XG4gICAgcmV0dXJuIHRoaXMubGFuZGluZ1BvaW50XG4gIH1cblxuICBnZXRQb2ludChjdXJzb3IpIHtcbiAgICBpZiAodGhpcy5zZWFyY2hNb2RlbCkge1xuICAgICAgdGhpcy5yZWxhdGl2ZUluZGV4ID0gdGhpcy5nZXRDb3VudCgpICsgdGhpcy5zZWFyY2hNb2RlbC5nZXRSZWxhdGl2ZUluZGV4KClcbiAgICB9IGVsc2UgaWYgKHRoaXMucmVsYXRpdmVJbmRleCA9PSBudWxsKSB7XG4gICAgICB0aGlzLnJlbGF0aXZlSW5kZXggPSB0aGlzLmdldENvdW50KClcbiAgICB9XG5cbiAgICBjb25zdCByYW5nZSA9IHRoaXMuc2VhcmNoKGN1cnNvciwgdGhpcy5pbnB1dCwgdGhpcy5yZWxhdGl2ZUluZGV4KVxuXG4gICAgdGhpcy5zZWFyY2hNb2RlbC5kZXN0cm95KClcbiAgICB0aGlzLnNlYXJjaE1vZGVsID0gbnVsbFxuXG4gICAgaWYgKHJhbmdlKSByZXR1cm4gcmFuZ2VbdGhpcy5nZXRMYW5kaW5nUG9pbnQoKV1cbiAgfVxuXG4gIG1vdmVDdXJzb3IoY3Vyc29yKSB7XG4gICAgaWYgKCF0aGlzLmlucHV0KSByZXR1cm5cbiAgICBjb25zdCBwb2ludCA9IHRoaXMuZ2V0UG9pbnQoY3Vyc29yKVxuXG4gICAgaWYgKHBvaW50KSB7XG4gICAgICBpZiAodGhpcy5yZXN0b3JlRWRpdG9yU3RhdGUpIHtcbiAgICAgICAgdGhpcy5yZXN0b3JlRWRpdG9yU3RhdGUoe2FuY2hvclBvc2l0aW9uOiBwb2ludCwgc2tpcFJvdzogcG9pbnQucm93fSlcbiAgICAgICAgdGhpcy5yZXN0b3JlRWRpdG9yU3RhdGUgPSBudWxsIC8vIEhBQ0s6IGRvbnQgcmVmb2xkIG9uIGBuYCwgYE5gIHJlcGVhdFxuICAgICAgfVxuICAgICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHBvaW50LCB7YXV0b3Njcm9sbDogZmFsc2V9KVxuICAgIH1cblxuICAgIGlmICghdGhpcy5yZXBlYXRlZCkge1xuICAgICAgdGhpcy5nbG9iYWxTdGF0ZS5zZXQoXCJjdXJyZW50U2VhcmNoXCIsIHRoaXMpXG4gICAgICB0aGlzLnZpbVN0YXRlLnNlYXJjaEhpc3Rvcnkuc2F2ZSh0aGlzLmlucHV0KVxuICAgIH1cblxuICAgIGlmICh0aGlzLnVwZGF0ZWxhc3RTZWFyY2hQYXR0ZXJuKSB7XG4gICAgICB0aGlzLmdsb2JhbFN0YXRlLnNldChcImxhc3RTZWFyY2hQYXR0ZXJuXCIsIHRoaXMuZ2V0UGF0dGVybih0aGlzLmlucHV0KSlcbiAgICB9XG4gIH1cblxuICBnZXRTZWFyY2hNb2RlbCgpIHtcbiAgICBpZiAoIXRoaXMuc2VhcmNoTW9kZWwpIHtcbiAgICAgIHRoaXMuc2VhcmNoTW9kZWwgPSBuZXcgU2VhcmNoTW9kZWwodGhpcy52aW1TdGF0ZSwge2luY3JlbWVudGFsU2VhcmNoOiB0aGlzLmlzSW5jcmVtZW50YWxTZWFyY2goKX0pXG4gICAgfVxuICAgIHJldHVybiB0aGlzLnNlYXJjaE1vZGVsXG4gIH1cblxuICBzZWFyY2goY3Vyc29yLCBpbnB1dCwgcmVsYXRpdmVJbmRleCkge1xuICAgIGNvbnN0IHNlYXJjaE1vZGVsID0gdGhpcy5nZXRTZWFyY2hNb2RlbCgpXG4gICAgaWYgKGlucHV0KSB7XG4gICAgICBjb25zdCBmcm9tUG9pbnQgPSB0aGlzLmdldEJ1ZmZlclBvc2l0aW9uRm9yQ3Vyc29yKGN1cnNvcilcbiAgICAgIHJldHVybiBzZWFyY2hNb2RlbC5zZWFyY2goZnJvbVBvaW50LCB0aGlzLmdldFBhdHRlcm4oaW5wdXQpLCByZWxhdGl2ZUluZGV4KVxuICAgIH1cbiAgICB0aGlzLnZpbVN0YXRlLmhvdmVyU2VhcmNoQ291bnRlci5yZXNldCgpXG4gICAgc2VhcmNoTW9kZWwuY2xlYXJNYXJrZXJzKClcbiAgfVxufVxuU2VhcmNoQmFzZS5yZWdpc3RlcihmYWxzZSlcblxuLy8gLywgP1xuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgU2VhcmNoIGV4dGVuZHMgU2VhcmNoQmFzZSB7XG4gIGNhc2VTZW5zaXRpdml0eUtpbmQgPSBcIlNlYXJjaFwiXG4gIHJlcXVpcmVJbnB1dCA9IHRydWVcblxuICBpbml0aWFsaXplKCkge1xuICAgIGlmICh0aGlzLmlzSW5jcmVtZW50YWxTZWFyY2goKSkge1xuICAgICAgdGhpcy5yZXN0b3JlRWRpdG9yU3RhdGUgPSB0aGlzLnV0aWxzLnNhdmVFZGl0b3JTdGF0ZSh0aGlzLmVkaXRvcilcbiAgICAgIHRoaXMub25EaWRDb21tYW5kU2VhcmNoKHRoaXMuaGFuZGxlQ29tbWFuZEV2ZW50LmJpbmQodGhpcykpXG4gICAgfVxuXG4gICAgdGhpcy5vbkRpZENvbmZpcm1TZWFyY2godGhpcy5oYW5kbGVDb25maXJtU2VhcmNoLmJpbmQodGhpcykpXG4gICAgdGhpcy5vbkRpZENhbmNlbFNlYXJjaCh0aGlzLmhhbmRsZUNhbmNlbFNlYXJjaC5iaW5kKHRoaXMpKVxuICAgIHRoaXMub25EaWRDaGFuZ2VTZWFyY2godGhpcy5oYW5kbGVDaGFuZ2VTZWFyY2guYmluZCh0aGlzKSlcblxuICAgIHRoaXMuZm9jdXNTZWFyY2hJbnB1dEVkaXRvcigpXG5cbiAgICBzdXBlci5pbml0aWFsaXplKClcbiAgfVxuXG4gIGZvY3VzU2VhcmNoSW5wdXRFZGl0b3IoKSB7XG4gICAgY29uc3QgY2xhc3NMaXN0ID0gdGhpcy5pc0JhY2t3YXJkcygpID8gW1wiYmFja3dhcmRzXCJdIDogW11cbiAgICB0aGlzLnZpbVN0YXRlLnNlYXJjaElucHV0LmZvY3VzKHtjbGFzc0xpc3R9KVxuICB9XG5cbiAgaGFuZGxlQ29tbWFuZEV2ZW50KGV2ZW50KSB7XG4gICAgaWYgKCFldmVudC5pbnB1dCkgcmV0dXJuXG5cbiAgICBpZiAoZXZlbnQubmFtZSA9PT0gXCJ2aXNpdFwiKSB7XG4gICAgICBsZXQge2RpcmVjdGlvbn0gPSBldmVudFxuICAgICAgaWYgKHRoaXMuaXNCYWNrd2FyZHMoKSAmJiB0aGlzLmdldENvbmZpZyhcImluY3JlbWVudGFsU2VhcmNoVmlzaXREaXJlY3Rpb25cIikgPT09IFwicmVsYXRpdmVcIikge1xuICAgICAgICBkaXJlY3Rpb24gPSBkaXJlY3Rpb24gPT09IFwibmV4dFwiID8gXCJwcmV2XCIgOiBcIm5leHRcIlxuICAgICAgfVxuICAgICAgdGhpcy5nZXRTZWFyY2hNb2RlbCgpLnZpc2l0KGRpcmVjdGlvbiA9PT0gXCJuZXh0XCIgPyArMSA6IC0xKVxuICAgIH0gZWxzZSBpZiAoZXZlbnQubmFtZSA9PT0gXCJvY2N1cnJlbmNlXCIpIHtcbiAgICAgIGNvbnN0IHtvcGVyYXRpb24sIGlucHV0fSA9IGV2ZW50XG4gICAgICB0aGlzLm9jY3VycmVuY2VNYW5hZ2VyLmFkZFBhdHRlcm4odGhpcy5nZXRQYXR0ZXJuKGlucHV0KSwge3Jlc2V0OiBvcGVyYXRpb24gIT0gbnVsbH0pXG4gICAgICB0aGlzLm9jY3VycmVuY2VNYW5hZ2VyLnNhdmVMYXN0UGF0dGVybigpXG5cbiAgICAgIHRoaXMudmltU3RhdGUuc2VhcmNoSGlzdG9yeS5zYXZlKGlucHV0KVxuICAgICAgdGhpcy52aW1TdGF0ZS5zZWFyY2hJbnB1dC5jYW5jZWwoKVxuICAgICAgaWYgKG9wZXJhdGlvbiAhPSBudWxsKSB0aGlzLnZpbVN0YXRlLm9wZXJhdGlvblN0YWNrLnJ1bihvcGVyYXRpb24pXG4gICAgfSBlbHNlIGlmIChldmVudC5uYW1lID09PSBcInByb2plY3QtZmluZFwiKSB7XG4gICAgICB0aGlzLnZpbVN0YXRlLnNlYXJjaEhpc3Rvcnkuc2F2ZShldmVudC5pbnB1dClcbiAgICAgIHRoaXMudmltU3RhdGUuc2VhcmNoSW5wdXQuY2FuY2VsKClcbiAgICAgIHRoaXMudXRpbHMuc2VhcmNoQnlQcm9qZWN0RmluZCh0aGlzLmVkaXRvciwgZXZlbnQuaW5wdXQpXG4gICAgfVxuICB9XG5cbiAgaGFuZGxlQ2FuY2VsU2VhcmNoKCkge1xuICAgIGlmICghW1widmlzdWFsXCIsIFwiaW5zZXJ0XCJdLmluY2x1ZGVzKHRoaXMubW9kZSkpIHRoaXMudmltU3RhdGUucmVzZXROb3JtYWxNb2RlKClcblxuICAgIGlmICh0aGlzLnJlc3RvcmVFZGl0b3JTdGF0ZSkgdGhpcy5yZXN0b3JlRWRpdG9yU3RhdGUoKVxuICAgIHRoaXMudmltU3RhdGUucmVzZXQoKVxuICAgIHRoaXMuZmluaXNoKClcbiAgfVxuXG4gIGlzU2VhcmNoUmVwZWF0Q2hhcmFjdGVyKGNoYXIpIHtcbiAgICByZXR1cm4gdGhpcy5pc0luY3JlbWVudGFsU2VhcmNoKCkgPyBjaGFyID09PSBcIlwiIDogW1wiXCIsIHRoaXMuaXNCYWNrd2FyZHMoKSA/IFwiP1wiIDogXCIvXCJdLmluY2x1ZGVzKGNoYXIpIC8vIGVtcHR5IGNvbmZpcm0gb3IgaW52b2tpbmctY2hhclxuICB9XG5cbiAgaGFuZGxlQ29uZmlybVNlYXJjaCh7aW5wdXQsIGxhbmRpbmdQb2ludH0pIHtcbiAgICB0aGlzLmlucHV0ID0gaW5wdXRcbiAgICB0aGlzLmxhbmRpbmdQb2ludCA9IGxhbmRpbmdQb2ludFxuICAgIGlmICh0aGlzLmlzU2VhcmNoUmVwZWF0Q2hhcmFjdGVyKHRoaXMuaW5wdXQpKSB7XG4gICAgICB0aGlzLmlucHV0ID0gdGhpcy52aW1TdGF0ZS5zZWFyY2hIaXN0b3J5LmdldChcInByZXZcIilcbiAgICAgIGlmICghdGhpcy5pbnB1dCkgYXRvbS5iZWVwKClcbiAgICB9XG4gICAgdGhpcy5wcm9jZXNzT3BlcmF0aW9uKClcbiAgfVxuXG4gIGhhbmRsZUNoYW5nZVNlYXJjaChpbnB1dCkge1xuICAgIC8vIElmIGlucHV0IHN0YXJ0cyB3aXRoIHNwYWNlLCByZW1vdmUgZmlyc3Qgc3BhY2UgYW5kIGRpc2FibGUgdXNlUmVnZXhwLlxuICAgIGlmIChpbnB1dC5zdGFydHNXaXRoKFwiIFwiKSkge1xuICAgICAgLy8gRklYTUU6IFNvdWxkIEkgcmVtb3ZlIHRoaXMgdW5rbm93biBoYWNrIGFuZCBpbXBsZW1lbnQgdmlzaWJsZSBidXR0b24gdG8gdG9nbGUgcmVnZXhwP1xuICAgICAgaW5wdXQgPSBpbnB1dC5yZXBsYWNlKC9eIC8sIFwiXCIpXG4gICAgICB0aGlzLnVzZVJlZ2V4cCA9IGZhbHNlXG4gICAgfVxuICAgIHRoaXMudmltU3RhdGUuc2VhcmNoSW5wdXQudXBkYXRlT3B0aW9uU2V0dGluZ3Moe3VzZVJlZ2V4cDogdGhpcy51c2VSZWdleHB9KVxuXG4gICAgaWYgKHRoaXMuaXNJbmNyZW1lbnRhbFNlYXJjaCgpKSB7XG4gICAgICB0aGlzLnNlYXJjaCh0aGlzLmVkaXRvci5nZXRMYXN0Q3Vyc29yKCksIGlucHV0LCB0aGlzLmdldENvdW50KCkpXG4gICAgfVxuICB9XG5cbiAgZ2V0UGF0dGVybih0ZXJtKSB7XG4gICAgbGV0IG1vZGlmaWVycyA9IHRoaXMuaXNDYXNlU2Vuc2l0aXZlKHRlcm0pID8gXCJnXCIgOiBcImdpXCJcbiAgICAvLyBGSVhNRSB0aGlzIHByZXZlbnQgc2VhcmNoIFxcXFxjIGl0c2VsZi5cbiAgICAvLyBET05UIHRoaW5rbGVzc2x5IG1pbWljIHB1cmUgVmltLiBJbnN0ZWFkLCBwcm92aWRlIGlnbm9yZWNhc2UgYnV0dG9uIGFuZCBzaG9ydGN1dC5cbiAgICBpZiAodGVybS5pbmRleE9mKFwiXFxcXGNcIikgPj0gMCkge1xuICAgICAgdGVybSA9IHRlcm0ucmVwbGFjZShcIlxcXFxjXCIsIFwiXCIpXG4gICAgICBpZiAoIW1vZGlmaWVycy5pbmNsdWRlcyhcImlcIikpIG1vZGlmaWVycyArPSBcImlcIlxuICAgIH1cblxuICAgIGlmICh0aGlzLnVzZVJlZ2V4cCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIG5ldyBSZWdFeHAodGVybSwgbW9kaWZpZXJzKVxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHt9XG4gICAgfVxuICAgIHJldHVybiBuZXcgUmVnRXhwKF8uZXNjYXBlUmVnRXhwKHRlcm0pLCBtb2RpZmllcnMpXG4gIH1cbn1cblNlYXJjaC5yZWdpc3RlcigpXG5cbmNsYXNzIFNlYXJjaEJhY2t3YXJkcyBleHRlbmRzIFNlYXJjaCB7XG4gIGJhY2t3YXJkcyA9IHRydWVcbn1cblNlYXJjaEJhY2t3YXJkcy5yZWdpc3RlcigpXG5cbi8vICosICNcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIFNlYXJjaEN1cnJlbnRXb3JkIGV4dGVuZHMgU2VhcmNoQmFzZSB7XG4gIGNhc2VTZW5zaXRpdml0eUtpbmQgPSBcIlNlYXJjaEN1cnJlbnRXb3JkXCJcblxuICBtb3ZlQ3Vyc29yKGN1cnNvcikge1xuICAgIGlmICh0aGlzLmlucHV0ID09IG51bGwpIHtcbiAgICAgIGNvbnN0IHdvcmRSYW5nZSA9IHRoaXMuZ2V0Q3VycmVudFdvcmRCdWZmZXJSYW5nZSgpXG4gICAgICBpZiAod29yZFJhbmdlKSB7XG4gICAgICAgIHRoaXMuZWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKHdvcmRSYW5nZS5zdGFydClcbiAgICAgICAgdGhpcy5pbnB1dCA9IHRoaXMuZWRpdG9yLmdldFRleHRJbkJ1ZmZlclJhbmdlKHdvcmRSYW5nZSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuaW5wdXQgPSBcIlwiXG4gICAgICB9XG4gICAgfVxuXG4gICAgc3VwZXIubW92ZUN1cnNvcihjdXJzb3IpXG4gIH1cblxuICBnZXRQYXR0ZXJuKHRlcm0pIHtcbiAgICBjb25zdCBlc2NhcGVkID0gXy5lc2NhcGVSZWdFeHAodGVybSlcbiAgICBjb25zdCBzb3VyY2UgPSAvXFxXLy50ZXN0KHRlcm0pID8gYCR7ZXNjYXBlZH1cXFxcYmAgOiBgXFxcXGIke2VzY2FwZWR9XFxcXGJgXG4gICAgcmV0dXJuIG5ldyBSZWdFeHAoc291cmNlLCB0aGlzLmlzQ2FzZVNlbnNpdGl2ZSh0ZXJtKSA/IFwiZ1wiIDogXCJnaVwiKVxuICB9XG5cbiAgZ2V0Q3VycmVudFdvcmRCdWZmZXJSYW5nZSgpIHtcbiAgICBjb25zdCBjdXJzb3IgPSB0aGlzLmVkaXRvci5nZXRMYXN0Q3Vyc29yKClcbiAgICBjb25zdCBwb2ludCA9IGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXG5cbiAgICBjb25zdCBub25Xb3JkQ2hhcmFjdGVycyA9IHRoaXMudXRpbHMuZ2V0Tm9uV29yZENoYXJhY3RlcnNGb3JDdXJzb3IoY3Vyc29yKVxuICAgIGNvbnN0IHdvcmRSZWdleCA9IG5ldyBSZWdFeHAoYFteXFxcXHMke18uZXNjYXBlUmVnRXhwKG5vbldvcmRDaGFyYWN0ZXJzKX1dK2AsIFwiZ1wiKVxuXG4gICAgbGV0IGZvdW5kUmFuZ2VcbiAgICB0aGlzLnNjYW5Gb3J3YXJkKHdvcmRSZWdleCwge2Zyb206IFtwb2ludC5yb3csIDBdLCBhbGxvd05leHRMaW5lOiBmYWxzZX0sICh7cmFuZ2UsIHN0b3B9KSA9PiB7XG4gICAgICBpZiAocmFuZ2UuZW5kLmlzR3JlYXRlclRoYW4ocG9pbnQpKSB7XG4gICAgICAgIGZvdW5kUmFuZ2UgPSByYW5nZVxuICAgICAgICBzdG9wKClcbiAgICAgIH1cbiAgICB9KVxuICAgIHJldHVybiBmb3VuZFJhbmdlXG4gIH1cbn1cblNlYXJjaEN1cnJlbnRXb3JkLnJlZ2lzdGVyKClcblxuY2xhc3MgU2VhcmNoQ3VycmVudFdvcmRCYWNrd2FyZHMgZXh0ZW5kcyBTZWFyY2hDdXJyZW50V29yZCB7XG4gIGJhY2t3YXJkcyA9IHRydWVcbn1cblNlYXJjaEN1cnJlbnRXb3JkQmFja3dhcmRzLnJlZ2lzdGVyKClcbiJdfQ==