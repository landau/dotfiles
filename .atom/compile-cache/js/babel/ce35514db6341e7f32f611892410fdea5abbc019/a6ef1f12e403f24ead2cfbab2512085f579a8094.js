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
          this.restoreEditorState = this.utils.saveEditorState(this.editor);
          this.onDidCommandSearch(this.handleCommandEvent.bind(this));
        }

        this.onDidConfirmSearch(this.handleConfirmSearch.bind(this));
        this.onDidCancelSearch(this.handleCancelSearch.bind(this));
        this.onDidChangeSearch(this.handleChangeSearch.bind(this));

        this.focusSearchInputEditor();
      }

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL21vdGlvbi1zZWFyY2guanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsV0FBVyxDQUFBOzs7Ozs7Ozs7O0FBRVgsSUFBTSxDQUFDLEdBQUcsT0FBTyxDQUFDLGlCQUFpQixDQUFDLENBQUE7O0FBRXBDLElBQU0sV0FBVyxHQUFHLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFBO0FBQzdDLElBQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUE7O0lBRTdDLFVBQVU7WUFBVixVQUFVOztXQUFWLFVBQVU7MEJBQVYsVUFBVTs7K0JBQVYsVUFBVTs7U0FDZCxJQUFJLEdBQUcsSUFBSTtTQUNYLFNBQVMsR0FBRyxLQUFLO1NBQ2pCLFNBQVMsR0FBRyxJQUFJO1NBQ2hCLG1CQUFtQixHQUFHLElBQUk7U0FDMUIsWUFBWSxHQUFHLElBQUk7U0FDbkIsbUJBQW1CLEdBQUcsT0FBTztTQUM3QixhQUFhLEdBQUcsSUFBSTtTQUNwQix1QkFBdUIsR0FBRyxJQUFJOzs7ZUFSMUIsVUFBVTs7V0FVSCx1QkFBRztBQUNaLGFBQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQTtLQUN0Qjs7O1dBRVMsc0JBQUc7QUFDWCxpQ0FmRSxVQUFVLDRDQWVNO0FBQ2xCLFVBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFBO0tBQzFCOzs7V0FFa0IsK0JBQUc7QUFDcEIsYUFBTyxJQUFJLGNBQVcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFBO0tBQzFGOzs7V0FFUyxzQkFBRzs7O0FBQ1gsVUFBSSxDQUFDLG9CQUFvQixDQUFDO2VBQU0sTUFBSyxNQUFNLEVBQUU7T0FBQSxDQUFDLENBQUE7QUFDOUMsaUNBekJFLFVBQVUs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VUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLEVBQUUsRUFBQyxJQUFJLEVBQUUsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxFQUFFLGFBQWEsRUFBRSxLQUFLLEVBQUMsRUFBRSxVQUFDLEtBQWEsRUFBSztZQUFqQixLQUFLLEdBQU4sS0FBYSxDQUFaLEtBQUs7WUFBRSxJQUFJLEdBQVosS0FBYSxDQUFMLElBQUk7O0FBQ3JGLFlBQUksS0FBSyxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLEVBQUU7QUFDbEMsb0JBQVUsR0FBRyxLQUFLLENBQUE7QUFDbEIsY0FBSSxFQUFFLENBQUE7U0FDUDtPQUNGLENBQUMsQ0FBQTtBQUNGLGFBQU8sVUFBVSxDQUFBO0tBQ2xCOzs7U0F0Q0csaUJBQWlCO0dBQVMsVUFBVTs7QUF3QzFDLGlCQUFpQixDQUFDLFFBQVEsRUFBRSxDQUFBOztJQUV0QiwwQkFBMEI7WUFBMUIsMEJBQTBCOztXQUExQiwwQkFBMEI7MEJBQTFCLDBCQUEwQjs7K0JBQTFCLDBCQUEwQjs7U0FDOUIsU0FBUyxHQUFHLElBQUk7OztTQURaLDBCQUEwQjtHQUFTLGlCQUFpQjs7QUFHMUQsMEJBQTBCLENBQUMsUUFBUSxFQUFFLENBQUEiLCJmaWxlIjoiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvbW90aW9uLXNlYXJjaC5qcyIsInNvdXJjZXNDb250ZW50IjpbIlwidXNlIGJhYmVsXCJcblxuY29uc3QgXyA9IHJlcXVpcmUoXCJ1bmRlcnNjb3JlLXBsdXNcIilcblxuY29uc3QgU2VhcmNoTW9kZWwgPSByZXF1aXJlKFwiLi9zZWFyY2gtbW9kZWxcIilcbmNvbnN0IE1vdGlvbiA9IHJlcXVpcmUoXCIuL2Jhc2VcIikuZ2V0Q2xhc3MoXCJNb3Rpb25cIilcblxuY2xhc3MgU2VhcmNoQmFzZSBleHRlbmRzIE1vdGlvbiB7XG4gIGp1bXAgPSB0cnVlXG4gIGJhY2t3YXJkcyA9IGZhbHNlXG4gIHVzZVJlZ2V4cCA9IHRydWVcbiAgY2FzZVNlbnNpdGl2aXR5S2luZCA9IG51bGxcbiAgbGFuZGluZ1BvaW50ID0gbnVsbCAvLyBbJ3N0YXJ0JyBvciAnZW5kJ11cbiAgZGVmYXVsdExhbmRpbmdQb2ludCA9IFwic3RhcnRcIiAvLyBbJ3N0YXJ0JyBvciAnZW5kJ11cbiAgcmVsYXRpdmVJbmRleCA9IG51bGxcbiAgdXBkYXRlbGFzdFNlYXJjaFBhdHRlcm4gPSB0cnVlXG5cbiAgaXNCYWNrd2FyZHMoKSB7XG4gICAgcmV0dXJuIHRoaXMuYmFja3dhcmRzXG4gIH1cblxuICByZXNldFN0YXRlKCkge1xuICAgIHN1cGVyLnJlc2V0U3RhdGUoKVxuICAgIHRoaXMucmVsYXRpdmVJbmRleCA9IG51bGxcbiAgfVxuXG4gIGlzSW5jcmVtZW50YWxTZWFyY2goKSB7XG4gICAgcmV0dXJuIHRoaXMuaW5zdGFuY2VvZihcIlNlYXJjaFwiKSAmJiAhdGhpcy5yZXBlYXRlZCAmJiB0aGlzLmdldENvbmZpZyhcImluY3JlbWVudGFsU2VhcmNoXCIpXG4gIH1cblxuICBpbml0aWFsaXplKCkge1xuICAgIHRoaXMub25EaWRGaW5pc2hPcGVyYXRpb24oKCkgPT4gdGhpcy5maW5pc2goKSlcbiAgICBzdXBlci5pbml0aWFsaXplKClcbiAgfVxuXG4gIGdldENvdW50KC4uLmFyZ3MpIHtcbiAgICByZXR1cm4gc3VwZXIuZ2V0Q291bnQoLi4uYXJncykgKiAodGhpcy5pc0JhY2t3YXJkcygpID8gLTEgOiAxKVxuICB9XG5cbiAgZmluaXNoKCkge1xuICAgIGlmICh0aGlzLmlzSW5jcmVtZW50YWxTZWFyY2goKSAmJiB0aGlzLmdldENvbmZpZyhcInNob3dIb3ZlclNlYXJjaENvdW50ZXJcIikpIHtcbiAgICAgIHRoaXMudmltU3RhdGUuaG92ZXJTZWFyY2hDb3VudGVyLnJlc2V0KClcbiAgICB9XG4gICAgaWYgKHRoaXMuc2VhcmNoTW9kZWwpIHRoaXMuc2VhcmNoTW9kZWwuZGVzdHJveSgpXG5cbiAgICB0aGlzLnJlbGF0aXZlSW5kZXggPSBudWxsXG4gICAgdGhpcy5zZWFyY2hNb2RlbCA9IG51bGxcbiAgfVxuXG4gIGdldExhbmRpbmdQb2ludCgpIHtcbiAgICBpZiAoIXRoaXMubGFuZGluZ1BvaW50KSB0aGlzLmxhbmRpbmdQb2ludCA9IHRoaXMuZGVmYXVsdExhbmRpbmdQb2ludFxuICAgIHJldHVybiB0aGlzLmxhbmRpbmdQb2ludFxuICB9XG5cbiAgZ2V0UG9pbnQoY3Vyc29yKSB7XG4gICAgaWYgKHRoaXMuc2VhcmNoTW9kZWwpIHtcbiAgICAgIHRoaXMucmVsYXRpdmVJbmRleCA9IHRoaXMuZ2V0Q291bnQoKSArIHRoaXMuc2VhcmNoTW9kZWwuZ2V0UmVsYXRpdmVJbmRleCgpXG4gICAgfSBlbHNlIGlmICh0aGlzLnJlbGF0aXZlSW5kZXggPT0gbnVsbCkge1xuICAgICAgdGhpcy5yZWxhdGl2ZUluZGV4ID0gdGhpcy5nZXRDb3VudCgpXG4gICAgfVxuXG4gICAgY29uc3QgcmFuZ2UgPSB0aGlzLnNlYXJjaChjdXJzb3IsIHRoaXMuaW5wdXQsIHRoaXMucmVsYXRpdmVJbmRleClcblxuICAgIHRoaXMuc2VhcmNoTW9kZWwuZGVzdHJveSgpXG4gICAgdGhpcy5zZWFyY2hNb2RlbCA9IG51bGxcblxuICAgIGlmIChyYW5nZSkgcmV0dXJuIHJhbmdlW3RoaXMuZ2V0TGFuZGluZ1BvaW50KCldXG4gIH1cblxuICBtb3ZlQ3Vyc29yKGN1cnNvcikge1xuICAgIGlmICghdGhpcy5pbnB1dCkgcmV0dXJuXG4gICAgY29uc3QgcG9pbnQgPSB0aGlzLmdldFBvaW50KGN1cnNvcilcblxuICAgIGlmIChwb2ludCkgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHBvaW50LCB7YXV0b3Njcm9sbDogZmFsc2V9KVxuXG4gICAgaWYgKCF0aGlzLnJlcGVhdGVkKSB7XG4gICAgICB0aGlzLmdsb2JhbFN0YXRlLnNldChcImN1cnJlbnRTZWFyY2hcIiwgdGhpcylcbiAgICAgIHRoaXMudmltU3RhdGUuc2VhcmNoSGlzdG9yeS5zYXZlKHRoaXMuaW5wdXQpXG4gICAgfVxuXG4gICAgaWYgKHRoaXMudXBkYXRlbGFzdFNlYXJjaFBhdHRlcm4pIHtcbiAgICAgIHRoaXMuZ2xvYmFsU3RhdGUuc2V0KFwibGFzdFNlYXJjaFBhdHRlcm5cIiwgdGhpcy5nZXRQYXR0ZXJuKHRoaXMuaW5wdXQpKVxuICAgIH1cbiAgfVxuXG4gIGdldFNlYXJjaE1vZGVsKCkge1xuICAgIGlmICghdGhpcy5zZWFyY2hNb2RlbCkge1xuICAgICAgdGhpcy5zZWFyY2hNb2RlbCA9IG5ldyBTZWFyY2hNb2RlbCh0aGlzLnZpbVN0YXRlLCB7aW5jcmVtZW50YWxTZWFyY2g6IHRoaXMuaXNJbmNyZW1lbnRhbFNlYXJjaCgpfSlcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuc2VhcmNoTW9kZWxcbiAgfVxuXG4gIHNlYXJjaChjdXJzb3IsIGlucHV0LCByZWxhdGl2ZUluZGV4KSB7XG4gICAgY29uc3Qgc2VhcmNoTW9kZWwgPSB0aGlzLmdldFNlYXJjaE1vZGVsKClcbiAgICBpZiAoaW5wdXQpIHtcbiAgICAgIGNvbnN0IGZyb21Qb2ludCA9IHRoaXMuZ2V0QnVmZmVyUG9zaXRpb25Gb3JDdXJzb3IoY3Vyc29yKVxuICAgICAgcmV0dXJuIHNlYXJjaE1vZGVsLnNlYXJjaChmcm9tUG9pbnQsIHRoaXMuZ2V0UGF0dGVybihpbnB1dCksIHJlbGF0aXZlSW5kZXgpXG4gICAgfVxuICAgIHRoaXMudmltU3RhdGUuaG92ZXJTZWFyY2hDb3VudGVyLnJlc2V0KClcbiAgICBzZWFyY2hNb2RlbC5jbGVhck1hcmtlcnMoKVxuICB9XG59XG5TZWFyY2hCYXNlLnJlZ2lzdGVyKGZhbHNlKVxuXG4vLyAvLCA/XG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBTZWFyY2ggZXh0ZW5kcyBTZWFyY2hCYXNlIHtcbiAgY2FzZVNlbnNpdGl2aXR5S2luZCA9IFwiU2VhcmNoXCJcbiAgcmVxdWlyZUlucHV0ID0gdHJ1ZVxuXG4gIGluaXRpYWxpemUoKSB7XG4gICAgaWYgKCF0aGlzLmlzQ29tcGxldGUoKSkge1xuICAgICAgaWYgKHRoaXMuaXNJbmNyZW1lbnRhbFNlYXJjaCgpKSB7XG4gICAgICAgIHRoaXMucmVzdG9yZUVkaXRvclN0YXRlID0gdGhpcy51dGlscy5zYXZlRWRpdG9yU3RhdGUodGhpcy5lZGl0b3IpXG4gICAgICAgIHRoaXMub25EaWRDb21tYW5kU2VhcmNoKHRoaXMuaGFuZGxlQ29tbWFuZEV2ZW50LmJpbmQodGhpcykpXG4gICAgICB9XG5cbiAgICAgIHRoaXMub25EaWRDb25maXJtU2VhcmNoKHRoaXMuaGFuZGxlQ29uZmlybVNlYXJjaC5iaW5kKHRoaXMpKVxuICAgICAgdGhpcy5vbkRpZENhbmNlbFNlYXJjaCh0aGlzLmhhbmRsZUNhbmNlbFNlYXJjaC5iaW5kKHRoaXMpKVxuICAgICAgdGhpcy5vbkRpZENoYW5nZVNlYXJjaCh0aGlzLmhhbmRsZUNoYW5nZVNlYXJjaC5iaW5kKHRoaXMpKVxuXG4gICAgICB0aGlzLmZvY3VzU2VhcmNoSW5wdXRFZGl0b3IoKVxuICAgIH1cblxuICAgIHN1cGVyLmluaXRpYWxpemUoKVxuICB9XG5cbiAgZm9jdXNTZWFyY2hJbnB1dEVkaXRvcigpIHtcbiAgICBjb25zdCBjbGFzc0xpc3QgPSB0aGlzLmlzQmFja3dhcmRzKCkgPyBbXCJiYWNrd2FyZHNcIl0gOiBbXVxuICAgIHRoaXMudmltU3RhdGUuc2VhcmNoSW5wdXQuZm9jdXMoe2NsYXNzTGlzdH0pXG4gIH1cblxuICBoYW5kbGVDb21tYW5kRXZlbnQoZXZlbnQpIHtcbiAgICBpZiAoIWV2ZW50LmlucHV0KSByZXR1cm5cblxuICAgIGlmIChldmVudC5uYW1lID09PSBcInZpc2l0XCIpIHtcbiAgICAgIGxldCB7ZGlyZWN0aW9ufSA9IGV2ZW50XG4gICAgICBpZiAodGhpcy5pc0JhY2t3YXJkcygpICYmIHRoaXMuZ2V0Q29uZmlnKFwiaW5jcmVtZW50YWxTZWFyY2hWaXNpdERpcmVjdGlvblwiKSA9PT0gXCJyZWxhdGl2ZVwiKSB7XG4gICAgICAgIGRpcmVjdGlvbiA9IGRpcmVjdGlvbiA9PT0gXCJuZXh0XCIgPyBcInByZXZcIiA6IFwibmV4dFwiXG4gICAgICB9XG4gICAgICB0aGlzLmdldFNlYXJjaE1vZGVsKCkudmlzaXQoZGlyZWN0aW9uID09PSBcIm5leHRcIiA/ICsxIDogLTEpXG4gICAgfSBlbHNlIGlmIChldmVudC5uYW1lID09PSBcIm9jY3VycmVuY2VcIikge1xuICAgICAgY29uc3Qge29wZXJhdGlvbiwgaW5wdXR9ID0gZXZlbnRcbiAgICAgIHRoaXMub2NjdXJyZW5jZU1hbmFnZXIuYWRkUGF0dGVybih0aGlzLmdldFBhdHRlcm4oaW5wdXQpLCB7cmVzZXQ6IG9wZXJhdGlvbiAhPSBudWxsfSlcbiAgICAgIHRoaXMub2NjdXJyZW5jZU1hbmFnZXIuc2F2ZUxhc3RQYXR0ZXJuKClcblxuICAgICAgdGhpcy52aW1TdGF0ZS5zZWFyY2hIaXN0b3J5LnNhdmUoaW5wdXQpXG4gICAgICB0aGlzLnZpbVN0YXRlLnNlYXJjaElucHV0LmNhbmNlbCgpXG4gICAgICBpZiAob3BlcmF0aW9uICE9IG51bGwpIHRoaXMudmltU3RhdGUub3BlcmF0aW9uU3RhY2sucnVuKG9wZXJhdGlvbilcbiAgICB9IGVsc2UgaWYgKGV2ZW50Lm5hbWUgPT09IFwicHJvamVjdC1maW5kXCIpIHtcbiAgICAgIHRoaXMudmltU3RhdGUuc2VhcmNoSGlzdG9yeS5zYXZlKGV2ZW50LmlucHV0KVxuICAgICAgdGhpcy52aW1TdGF0ZS5zZWFyY2hJbnB1dC5jYW5jZWwoKVxuICAgICAgdGhpcy51dGlscy5zZWFyY2hCeVByb2plY3RGaW5kKHRoaXMuZWRpdG9yLCBldmVudC5pbnB1dClcbiAgICB9XG4gIH1cblxuICBoYW5kbGVDYW5jZWxTZWFyY2goKSB7XG4gICAgaWYgKCFbXCJ2aXN1YWxcIiwgXCJpbnNlcnRcIl0uaW5jbHVkZXModGhpcy5tb2RlKSkgdGhpcy52aW1TdGF0ZS5yZXNldE5vcm1hbE1vZGUoKVxuXG4gICAgaWYgKHRoaXMucmVzdG9yZUVkaXRvclN0YXRlKSB0aGlzLnJlc3RvcmVFZGl0b3JTdGF0ZSgpXG4gICAgdGhpcy52aW1TdGF0ZS5yZXNldCgpXG4gICAgdGhpcy5maW5pc2goKVxuICB9XG5cbiAgaXNTZWFyY2hSZXBlYXRDaGFyYWN0ZXIoY2hhcikge1xuICAgIHJldHVybiB0aGlzLmlzSW5jcmVtZW50YWxTZWFyY2goKSA/IGNoYXIgPT09IFwiXCIgOiBbXCJcIiwgdGhpcy5pc0JhY2t3YXJkcygpID8gXCI/XCIgOiBcIi9cIl0uaW5jbHVkZXMoY2hhcikgLy8gZW1wdHkgY29uZmlybSBvciBpbnZva2luZy1jaGFyXG4gIH1cblxuICBoYW5kbGVDb25maXJtU2VhcmNoKHtpbnB1dCwgbGFuZGluZ1BvaW50fSkge1xuICAgIHRoaXMuaW5wdXQgPSBpbnB1dFxuICAgIHRoaXMubGFuZGluZ1BvaW50ID0gbGFuZGluZ1BvaW50XG4gICAgaWYgKHRoaXMuaXNTZWFyY2hSZXBlYXRDaGFyYWN0ZXIodGhpcy5pbnB1dCkpIHtcbiAgICAgIHRoaXMuaW5wdXQgPSB0aGlzLnZpbVN0YXRlLnNlYXJjaEhpc3RvcnkuZ2V0KFwicHJldlwiKVxuICAgICAgaWYgKCF0aGlzLmlucHV0KSBhdG9tLmJlZXAoKVxuICAgIH1cbiAgICB0aGlzLnByb2Nlc3NPcGVyYXRpb24oKVxuICB9XG5cbiAgaGFuZGxlQ2hhbmdlU2VhcmNoKGlucHV0KSB7XG4gICAgLy8gSWYgaW5wdXQgc3RhcnRzIHdpdGggc3BhY2UsIHJlbW92ZSBmaXJzdCBzcGFjZSBhbmQgZGlzYWJsZSB1c2VSZWdleHAuXG4gICAgaWYgKGlucHV0LnN0YXJ0c1dpdGgoXCIgXCIpKSB7XG4gICAgICAvLyBGSVhNRTogU291bGQgSSByZW1vdmUgdGhpcyB1bmtub3duIGhhY2sgYW5kIGltcGxlbWVudCB2aXNpYmxlIGJ1dHRvbiB0byB0b2dsZSByZWdleHA/XG4gICAgICBpbnB1dCA9IGlucHV0LnJlcGxhY2UoL14gLywgXCJcIilcbiAgICAgIHRoaXMudXNlUmVnZXhwID0gZmFsc2VcbiAgICB9XG4gICAgdGhpcy52aW1TdGF0ZS5zZWFyY2hJbnB1dC51cGRhdGVPcHRpb25TZXR0aW5ncyh7dXNlUmVnZXhwOiB0aGlzLnVzZVJlZ2V4cH0pXG5cbiAgICBpZiAodGhpcy5pc0luY3JlbWVudGFsU2VhcmNoKCkpIHtcbiAgICAgIHRoaXMuc2VhcmNoKHRoaXMuZWRpdG9yLmdldExhc3RDdXJzb3IoKSwgaW5wdXQsIHRoaXMuZ2V0Q291bnQoKSlcbiAgICB9XG4gIH1cblxuICBnZXRQYXR0ZXJuKHRlcm0pIHtcbiAgICBsZXQgbW9kaWZpZXJzID0gdGhpcy5pc0Nhc2VTZW5zaXRpdmUodGVybSkgPyBcImdcIiA6IFwiZ2lcIlxuICAgIC8vIEZJWE1FIHRoaXMgcHJldmVudCBzZWFyY2ggXFxcXGMgaXRzZWxmLlxuICAgIC8vIERPTlQgdGhpbmtsZXNzbHkgbWltaWMgcHVyZSBWaW0uIEluc3RlYWQsIHByb3ZpZGUgaWdub3JlY2FzZSBidXR0b24gYW5kIHNob3J0Y3V0LlxuICAgIGlmICh0ZXJtLmluZGV4T2YoXCJcXFxcY1wiKSA+PSAwKSB7XG4gICAgICB0ZXJtID0gdGVybS5yZXBsYWNlKFwiXFxcXGNcIiwgXCJcIilcbiAgICAgIGlmICghbW9kaWZpZXJzLmluY2x1ZGVzKFwiaVwiKSkgbW9kaWZpZXJzICs9IFwiaVwiXG4gICAgfVxuXG4gICAgaWYgKHRoaXMudXNlUmVnZXhwKSB7XG4gICAgICB0cnkge1xuICAgICAgICByZXR1cm4gbmV3IFJlZ0V4cCh0ZXJtLCBtb2RpZmllcnMpXG4gICAgICB9IGNhdGNoIChlcnJvcikge31cbiAgICB9XG4gICAgcmV0dXJuIG5ldyBSZWdFeHAoXy5lc2NhcGVSZWdFeHAodGVybSksIG1vZGlmaWVycylcbiAgfVxufVxuU2VhcmNoLnJlZ2lzdGVyKClcblxuY2xhc3MgU2VhcmNoQmFja3dhcmRzIGV4dGVuZHMgU2VhcmNoIHtcbiAgYmFja3dhcmRzID0gdHJ1ZVxufVxuU2VhcmNoQmFja3dhcmRzLnJlZ2lzdGVyKClcblxuLy8gKiwgI1xuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgU2VhcmNoQ3VycmVudFdvcmQgZXh0ZW5kcyBTZWFyY2hCYXNlIHtcbiAgY2FzZVNlbnNpdGl2aXR5S2luZCA9IFwiU2VhcmNoQ3VycmVudFdvcmRcIlxuXG4gIG1vdmVDdXJzb3IoY3Vyc29yKSB7XG4gICAgaWYgKHRoaXMuaW5wdXQgPT0gbnVsbCkge1xuICAgICAgY29uc3Qgd29yZFJhbmdlID0gdGhpcy5nZXRDdXJyZW50V29yZEJ1ZmZlclJhbmdlKClcbiAgICAgIGlmICh3b3JkUmFuZ2UpIHtcbiAgICAgICAgdGhpcy5lZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24od29yZFJhbmdlLnN0YXJ0KVxuICAgICAgICB0aGlzLmlucHV0ID0gdGhpcy5lZGl0b3IuZ2V0VGV4dEluQnVmZmVyUmFuZ2Uod29yZFJhbmdlKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5pbnB1dCA9IFwiXCJcbiAgICAgIH1cbiAgICB9XG5cbiAgICBzdXBlci5tb3ZlQ3Vyc29yKGN1cnNvcilcbiAgfVxuXG4gIGdldFBhdHRlcm4odGVybSkge1xuICAgIGNvbnN0IGVzY2FwZWQgPSBfLmVzY2FwZVJlZ0V4cCh0ZXJtKVxuICAgIGNvbnN0IHNvdXJjZSA9IC9cXFcvLnRlc3QodGVybSkgPyBgJHtlc2NhcGVkfVxcXFxiYCA6IGBcXFxcYiR7ZXNjYXBlZH1cXFxcYmBcbiAgICByZXR1cm4gbmV3IFJlZ0V4cChzb3VyY2UsIHRoaXMuaXNDYXNlU2Vuc2l0aXZlKHRlcm0pID8gXCJnXCIgOiBcImdpXCIpXG4gIH1cblxuICBnZXRDdXJyZW50V29yZEJ1ZmZlclJhbmdlKCkge1xuICAgIGNvbnN0IGN1cnNvciA9IHRoaXMuZWRpdG9yLmdldExhc3RDdXJzb3IoKVxuICAgIGNvbnN0IHBvaW50ID0gY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKClcblxuICAgIGNvbnN0IG5vbldvcmRDaGFyYWN0ZXJzID0gdGhpcy51dGlscy5nZXROb25Xb3JkQ2hhcmFjdGVyc0ZvckN1cnNvcihjdXJzb3IpXG4gICAgY29uc3Qgd29yZFJlZ2V4ID0gbmV3IFJlZ0V4cChgW15cXFxccyR7Xy5lc2NhcGVSZWdFeHAobm9uV29yZENoYXJhY3RlcnMpfV0rYCwgXCJnXCIpXG5cbiAgICBsZXQgZm91bmRSYW5nZVxuICAgIHRoaXMuc2NhbkZvcndhcmQod29yZFJlZ2V4LCB7ZnJvbTogW3BvaW50LnJvdywgMF0sIGFsbG93TmV4dExpbmU6IGZhbHNlfSwgKHtyYW5nZSwgc3RvcH0pID0+IHtcbiAgICAgIGlmIChyYW5nZS5lbmQuaXNHcmVhdGVyVGhhbihwb2ludCkpIHtcbiAgICAgICAgZm91bmRSYW5nZSA9IHJhbmdlXG4gICAgICAgIHN0b3AoKVxuICAgICAgfVxuICAgIH0pXG4gICAgcmV0dXJuIGZvdW5kUmFuZ2VcbiAgfVxufVxuU2VhcmNoQ3VycmVudFdvcmQucmVnaXN0ZXIoKVxuXG5jbGFzcyBTZWFyY2hDdXJyZW50V29yZEJhY2t3YXJkcyBleHRlbmRzIFNlYXJjaEN1cnJlbnRXb3JkIHtcbiAgYmFja3dhcmRzID0gdHJ1ZVxufVxuU2VhcmNoQ3VycmVudFdvcmRCYWNrd2FyZHMucmVnaXN0ZXIoKVxuIl19