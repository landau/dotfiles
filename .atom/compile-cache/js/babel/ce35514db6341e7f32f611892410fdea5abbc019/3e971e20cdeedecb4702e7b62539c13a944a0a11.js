"use babel";

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x3, _x4, _x5) { var _again = true; _function: while (_again) { var object = _x3, property = _x4, receiver = _x5; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x3 = parent; _x4 = property; _x5 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _ = require("underscore-plus");

var _require = require("atom");

var Point = _require.Point;
var Range = _require.Range;

var _require2 = require("./utils");

var moveCursorLeft = _require2.moveCursorLeft;
var moveCursorRight = _require2.moveCursorRight;
var moveCursorUpScreen = _require2.moveCursorUpScreen;
var moveCursorDownScreen = _require2.moveCursorDownScreen;
var pointIsAtVimEndOfFile = _require2.pointIsAtVimEndOfFile;
var getFirstVisibleScreenRow = _require2.getFirstVisibleScreenRow;
var getLastVisibleScreenRow = _require2.getLastVisibleScreenRow;
var getValidVimScreenRow = _require2.getValidVimScreenRow;
var getValidVimBufferRow = _require2.getValidVimBufferRow;
var moveCursorToFirstCharacterAtRow = _require2.moveCursorToFirstCharacterAtRow;
var sortRanges = _require2.sortRanges;
var pointIsOnWhiteSpace = _require2.pointIsOnWhiteSpace;
var moveCursorToNextNonWhitespace = _require2.moveCursorToNextNonWhitespace;
var isEmptyRow = _require2.isEmptyRow;
var getCodeFoldRowRanges = _require2.getCodeFoldRowRanges;
var getLargestFoldRangeContainsBufferRow = _require2.getLargestFoldRangeContainsBufferRow;
var isIncludeFunctionScopeForRow = _require2.isIncludeFunctionScopeForRow;
var detectScopeStartPositionForScope = _require2.detectScopeStartPositionForScope;
var getBufferRows = _require2.getBufferRows;
var getTextInScreenRange = _require2.getTextInScreenRange;
var setBufferRow = _require2.setBufferRow;
var setBufferColumn = _require2.setBufferColumn;
var limitNumber = _require2.limitNumber;
var getIndex = _require2.getIndex;
var smartScrollToBufferPosition = _require2.smartScrollToBufferPosition;
var pointIsAtEndOfLineAtNonEmptyRow = _require2.pointIsAtEndOfLineAtNonEmptyRow;
var getEndOfLineForBufferRow = _require2.getEndOfLineForBufferRow;
var findRangeInBufferRow = _require2.findRangeInBufferRow;
var saveEditorState = _require2.saveEditorState;
var getList = _require2.getList;
var getScreenPositionForScreenRow = _require2.getScreenPositionForScreenRow;

var Base = require("./base");

var Motion = (function (_Base) {
  _inherits(Motion, _Base);

  function Motion() {
    _classCallCheck(this, Motion);

    _get(Object.getPrototypeOf(Motion.prototype), "constructor", this).apply(this, arguments);

    this.inclusive = false;
    this.wise = "characterwise";
    this.jump = false;
    this.verticalMotion = false;
    this.moveSucceeded = null;
    this.moveSuccessOnLinewise = false;
    this.selectSucceeded = false;
  }

  _createClass(Motion, [{
    key: "isLinewise",
    value: function isLinewise() {
      return this.wise === "linewise";
    }
  }, {
    key: "isBlockwise",
    value: function isBlockwise() {
      return this.wise === "blockwise";
    }
  }, {
    key: "forceWise",
    value: function forceWise(wise) {
      if (wise === "characterwise") {
        this.inclusive = this.wise === "linewise" ? false : !this.inclusive;
      }
      this.wise = wise;
    }
  }, {
    key: "resetState",
    value: function resetState() {
      this.selectSucceeded = false;
    }
  }, {
    key: "setBufferPositionSafely",
    value: function setBufferPositionSafely(cursor, point) {
      if (point) cursor.setBufferPosition(point);
    }
  }, {
    key: "setScreenPositionSafely",
    value: function setScreenPositionSafely(cursor, point) {
      if (point) cursor.setScreenPosition(point);
    }
  }, {
    key: "moveWithSaveJump",
    value: function moveWithSaveJump(cursor) {
      var cursorPosition = undefined;
      if (cursor.isLastCursor() && this.jump) {
        cursorPosition = cursor.getBufferPosition();
      }

      this.moveCursor(cursor);

      if (cursorPosition && !cursorPosition.isEqual(cursor.getBufferPosition())) {
        this.vimState.mark.set("`", cursorPosition);
        this.vimState.mark.set("'", cursorPosition);
      }
    }
  }, {
    key: "execute",
    value: function execute() {
      if (this.operator) {
        this.select();
      } else {
        for (var cursor of this.editor.getCursors()) {
          this.moveWithSaveJump(cursor);
        }
      }
      this.editor.mergeCursors();
      this.editor.mergeIntersectingSelections();
    }

    // NOTE: Modify selection by modtion, selection is already "normalized" before this function is called.
  }, {
    key: "select",
    value: function select() {
      var _this = this;

      // need to care was visual for `.` repeated.
      var isOrWasVisual = this.operator && this.operator["instanceof"]("SelectBase") || this.is("CurrentSelection");

      var _loop = function (selection) {
        selection.modifySelection(function () {
          return _this.moveWithSaveJump(selection.cursor);
        });

        var selectSucceeded = _this.moveSucceeded != null ? _this.moveSucceeded : !selection.isEmpty() || _this.isLinewise() && _this.moveSuccessOnLinewise;
        if (!_this.selectSucceeded) _this.selectSucceeded = selectSucceeded;

        if (isOrWasVisual || selectSucceeded && (_this.inclusive || _this.isLinewise())) {
          var $selection = _this.swrap(selection);
          $selection.saveProperties(true); // save property of "already-normalized-selection"
          $selection.applyWise(_this.wise);
        }
      };

      for (var selection of this.editor.getSelections()) {
        _loop(selection);
      }

      if (this.wise === "blockwise") {
        this.vimState.getLastBlockwiseSelection().autoscroll();
      }
    }
  }, {
    key: "setCursorBufferRow",
    value: function setCursorBufferRow(cursor, row, options) {
      if (this.verticalMotion && !this.getConfig("stayOnVerticalMotion")) {
        cursor.setBufferPosition(this.getFirstCharacterPositionForBufferRow(row), options);
      } else {
        setBufferRow(cursor, row, options);
      }
    }

    // [NOTE]
    // Since this function checks cursor position change, a cursor position MUST be
    // updated IN callback(=fn)
    // Updating point only in callback is wrong-use of this funciton,
    // since it stops immediately because of not cursor position change.
  }, {
    key: "moveCursorCountTimes",
    value: function moveCursorCountTimes(cursor, fn) {
      var oldPosition = cursor.getBufferPosition();
      this.countTimes(this.getCount(), function (state) {
        fn(state);
        var newPosition = cursor.getBufferPosition();
        if (newPosition.isEqual(oldPosition)) state.stop();
        oldPosition = newPosition;
      });
    }
  }, {
    key: "isCaseSensitive",
    value: function isCaseSensitive(term) {
      return this.getConfig("useSmartcaseFor" + this.caseSensitivityKind) ? term.search(/[A-Z]/) !== -1 : !this.getConfig("ignoreCaseFor" + this.caseSensitivityKind);
    }
  }], [{
    key: "operationKind",
    value: "motion",
    enumerable: true
  }]);

  return Motion;
})(Base);

Motion.register(false);

// Used as operator's target in visual-mode.

var CurrentSelection = (function (_Motion) {
  _inherits(CurrentSelection, _Motion);

  function CurrentSelection() {
    _classCallCheck(this, CurrentSelection);

    _get(Object.getPrototypeOf(CurrentSelection.prototype), "constructor", this).apply(this, arguments);

    this.selectionExtent = null;
    this.blockwiseSelectionExtent = null;
    this.inclusive = true;
  }

  _createClass(CurrentSelection, [{
    key: "initialize",
    value: function initialize() {
      this.pointInfoByCursor = new Map();
      return _get(Object.getPrototypeOf(CurrentSelection.prototype), "initialize", this).call(this);
    }
  }, {
    key: "moveCursor",
    value: function moveCursor(cursor) {
      if (this.mode === "visual") {
        this.selectionExtent = this.isBlockwise() ? this.swrap(cursor.selection).getBlockwiseSelectionExtent() : this.editor.getSelectedBufferRange().getExtent();
      } else {
        // `.` repeat case
        cursor.setBufferPosition(cursor.getBufferPosition().translate(this.selectionExtent));
      }
    }
  }, {
    key: "select",
    value: function select() {
      var _this2 = this;

      if (this.mode === "visual") {
        _get(Object.getPrototypeOf(CurrentSelection.prototype), "select", this).call(this);
      } else {
        for (var cursor of this.editor.getCursors()) {
          var pointInfo = this.pointInfoByCursor.get(cursor);
          if (pointInfo) {
            var _cursorPosition = pointInfo.cursorPosition;
            var startOfSelection = pointInfo.startOfSelection;

            if (_cursorPosition.isEqual(cursor.getBufferPosition())) {
              cursor.setBufferPosition(startOfSelection);
            }
          }
        }
        _get(Object.getPrototypeOf(CurrentSelection.prototype), "select", this).call(this);
      }

      // * Purpose of pointInfoByCursor? see #235 for detail.
      // When stayOnTransformString is enabled, cursor pos is not set on start of
      // of selected range.
      // But I want following behavior, so need to preserve position info.
      //  1. `vj>.` -> indent same two rows regardless of current cursor's row.
      //  2. `vj>j.` -> indent two rows from cursor's row.

      var _loop2 = function (cursor) {
        var startOfSelection = cursor.selection.getBufferRange().start;
        _this2.onDidFinishOperation(function () {
          cursorPosition = cursor.getBufferPosition();
          _this2.pointInfoByCursor.set(cursor, { startOfSelection: startOfSelection, cursorPosition: cursorPosition });
        });
      };

      for (var cursor of this.editor.getCursors()) {
        _loop2(cursor);
      }
    }
  }]);

  return CurrentSelection;
})(Motion);

CurrentSelection.register(false);

var MoveLeft = (function (_Motion2) {
  _inherits(MoveLeft, _Motion2);

  function MoveLeft() {
    _classCallCheck(this, MoveLeft);

    _get(Object.getPrototypeOf(MoveLeft.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(MoveLeft, [{
    key: "moveCursor",
    value: function moveCursor(cursor) {
      var allowWrap = this.getConfig("wrapLeftRightMotion");
      this.moveCursorCountTimes(cursor, function () {
        return moveCursorLeft(cursor, { allowWrap: allowWrap });
      });
    }
  }]);

  return MoveLeft;
})(Motion);

MoveLeft.register();

var MoveRight = (function (_Motion3) {
  _inherits(MoveRight, _Motion3);

  function MoveRight() {
    _classCallCheck(this, MoveRight);

    _get(Object.getPrototypeOf(MoveRight.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(MoveRight, [{
    key: "canWrapToNextLine",
    value: function canWrapToNextLine(cursor) {
      if (this.isAsTargetExceptSelectInVisualMode() && !cursor.isAtEndOfLine()) {
        return false;
      } else {
        return this.getConfig("wrapLeftRightMotion");
      }
    }
  }, {
    key: "moveCursor",
    value: function moveCursor(cursor) {
      var _this3 = this;

      this.moveCursorCountTimes(cursor, function () {
        var cursorPosition = cursor.getBufferPosition();
        _this3.editor.unfoldBufferRow(cursorPosition.row);
        var allowWrap = _this3.canWrapToNextLine(cursor);
        moveCursorRight(cursor);
        if (cursor.isAtEndOfLine() && allowWrap && !pointIsAtVimEndOfFile(_this3.editor, cursorPosition)) {
          moveCursorRight(cursor, { allowWrap: allowWrap });
        }
      });
    }
  }]);

  return MoveRight;
})(Motion);

MoveRight.register();

var MoveRightBufferColumn = (function (_Motion4) {
  _inherits(MoveRightBufferColumn, _Motion4);

  function MoveRightBufferColumn() {
    _classCallCheck(this, MoveRightBufferColumn);

    _get(Object.getPrototypeOf(MoveRightBufferColumn.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(MoveRightBufferColumn, [{
    key: "moveCursor",
    value: function moveCursor(cursor) {
      setBufferColumn(cursor, cursor.getBufferColumn() + this.getCount());
    }
  }]);

  return MoveRightBufferColumn;
})(Motion);

MoveRightBufferColumn.register(false);

var MoveUp = (function (_Motion5) {
  _inherits(MoveUp, _Motion5);

  function MoveUp() {
    _classCallCheck(this, MoveUp);

    _get(Object.getPrototypeOf(MoveUp.prototype), "constructor", this).apply(this, arguments);

    this.wise = "linewise";
    this.wrap = false;
  }

  _createClass(MoveUp, [{
    key: "getBufferRow",
    value: function getBufferRow(row) {
      var min = 0;
      row = this.wrap && row === min ? this.getVimLastBufferRow() : limitNumber(row - 1, { min: min });
      return this.getFoldStartRowForRow(row);
    }
  }, {
    key: "moveCursor",
    value: function moveCursor(cursor) {
      var _this4 = this;

      this.moveCursorCountTimes(cursor, function () {
        return setBufferRow(cursor, _this4.getBufferRow(cursor.getBufferRow()));
      });
    }
  }]);

  return MoveUp;
})(Motion);

MoveUp.register();

var MoveUpWrap = (function (_MoveUp) {
  _inherits(MoveUpWrap, _MoveUp);

  function MoveUpWrap() {
    _classCallCheck(this, MoveUpWrap);

    _get(Object.getPrototypeOf(MoveUpWrap.prototype), "constructor", this).apply(this, arguments);

    this.wrap = true;
  }

  return MoveUpWrap;
})(MoveUp);

MoveUpWrap.register();

var MoveDown = (function (_MoveUp2) {
  _inherits(MoveDown, _MoveUp2);

  function MoveDown() {
    _classCallCheck(this, MoveDown);

    _get(Object.getPrototypeOf(MoveDown.prototype), "constructor", this).apply(this, arguments);

    this.wise = "linewise";
    this.wrap = false;
  }

  _createClass(MoveDown, [{
    key: "getBufferRow",
    value: function getBufferRow(row) {
      if (this.editor.isFoldedAtBufferRow(row)) {
        row = getLargestFoldRangeContainsBufferRow(this.editor, row).end.row;
      }
      var max = this.getVimLastBufferRow();
      return this.wrap && row >= max ? 0 : limitNumber(row + 1, { max: max });
    }
  }]);

  return MoveDown;
})(MoveUp);

MoveDown.register();

var MoveDownWrap = (function (_MoveDown) {
  _inherits(MoveDownWrap, _MoveDown);

  function MoveDownWrap() {
    _classCallCheck(this, MoveDownWrap);

    _get(Object.getPrototypeOf(MoveDownWrap.prototype), "constructor", this).apply(this, arguments);

    this.wrap = true;
  }

  return MoveDownWrap;
})(MoveDown);

MoveDownWrap.register();

var MoveUpScreen = (function (_Motion6) {
  _inherits(MoveUpScreen, _Motion6);

  function MoveUpScreen() {
    _classCallCheck(this, MoveUpScreen);

    _get(Object.getPrototypeOf(MoveUpScreen.prototype), "constructor", this).apply(this, arguments);

    this.wise = "linewise";
    this.direction = "up";
  }

  _createClass(MoveUpScreen, [{
    key: "moveCursor",
    value: function moveCursor(cursor) {
      this.moveCursorCountTimes(cursor, function () {
        return moveCursorUpScreen(cursor);
      });
    }
  }]);

  return MoveUpScreen;
})(Motion);

MoveUpScreen.register();

var MoveDownScreen = (function (_MoveUpScreen) {
  _inherits(MoveDownScreen, _MoveUpScreen);

  function MoveDownScreen() {
    _classCallCheck(this, MoveDownScreen);

    _get(Object.getPrototypeOf(MoveDownScreen.prototype), "constructor", this).apply(this, arguments);

    this.wise = "linewise";
    this.direction = "down";
  }

  _createClass(MoveDownScreen, [{
    key: "moveCursor",
    value: function moveCursor(cursor) {
      this.moveCursorCountTimes(cursor, function () {
        return moveCursorDownScreen(cursor);
      });
    }
  }]);

  return MoveDownScreen;
})(MoveUpScreen);

MoveDownScreen.register();

// Move down/up to Edge
// -------------------------
// See t9md/atom-vim-mode-plus#236
// At least v1.7.0. bufferPosition and screenPosition cannot convert accurately
// when row is folded.

var MoveUpToEdge = (function (_Motion7) {
  _inherits(MoveUpToEdge, _Motion7);

  function MoveUpToEdge() {
    _classCallCheck(this, MoveUpToEdge);

    _get(Object.getPrototypeOf(MoveUpToEdge.prototype), "constructor", this).apply(this, arguments);

    this.wise = "linewise";
    this.jump = true;
    this.direction = "up";
  }

  _createClass(MoveUpToEdge, [{
    key: "moveCursor",
    value: function moveCursor(cursor) {
      var _this5 = this;

      this.moveCursorCountTimes(cursor, function () {
        _this5.setScreenPositionSafely(cursor, _this5.getPoint(cursor.getScreenPosition()));
      });
    }
  }, {
    key: "getPoint",
    value: function getPoint(fromPoint) {
      var column = fromPoint.column;

      for (var row of this.getScanRows(fromPoint)) {
        var point = new Point(row, column);
        if (this.isEdge(point)) return point;
      }
    }
  }, {
    key: "getScanRows",
    value: function getScanRows(_ref) {
      var row = _ref.row;

      return this.direction === "up" ? getList(getValidVimScreenRow(this.editor, row - 1), 0, true) : getList(getValidVimScreenRow(this.editor, row + 1), this.getVimLastScreenRow(), true);
    }
  }, {
    key: "isEdge",
    value: function isEdge(point) {
      if (this.isStoppablePoint(point)) {
        // If one of above/below point was not stoppable, it's Edge!
        var above = point.translate([-1, 0]);
        var below = point.translate([+1, 0]);
        return !this.isStoppablePoint(above) || !this.isStoppablePoint(below);
      } else {
        return false;
      }
    }
  }, {
    key: "isStoppablePoint",
    value: function isStoppablePoint(point) {
      if (this.isNonWhiteSpacePoint(point) || this.isFirstRowOrLastRowAndStoppable(point)) {
        return true;
      } else {
        var leftPoint = point.translate([0, -1]);
        var rightPoint = point.translate([0, +1]);
        return this.isNonWhiteSpacePoint(leftPoint) && this.isNonWhiteSpacePoint(rightPoint);
      }
    }
  }, {
    key: "isNonWhiteSpacePoint",
    value: function isNonWhiteSpacePoint(point) {
      var char = getTextInScreenRange(this.editor, Range.fromPointWithDelta(point, 0, 1));
      return char != null && /\S/.test(char);
    }
  }, {
    key: "isFirstRowOrLastRowAndStoppable",
    value: function isFirstRowOrLastRowAndStoppable(point) {
      // In normal-mode we adjust cursor by moving-left if cursor at EOL of non-blank row.
      // So explicitly guard to not answer it stoppable.
      if (this.isMode("normal") && pointIsAtEndOfLineAtNonEmptyRow(this.editor, point)) {
        return false;
      } else {
        return point.isEqual(this.editor.clipScreenPosition(point)) && (point.row === 0 || point.row === this.getVimLastScreenRow());
      }
    }
  }]);

  return MoveUpToEdge;
})(Motion);

MoveUpToEdge.register();

var MoveDownToEdge = (function (_MoveUpToEdge) {
  _inherits(MoveDownToEdge, _MoveUpToEdge);

  function MoveDownToEdge() {
    _classCallCheck(this, MoveDownToEdge);

    _get(Object.getPrototypeOf(MoveDownToEdge.prototype), "constructor", this).apply(this, arguments);

    this.direction = "down";
  }

  return MoveDownToEdge;
})(MoveUpToEdge);

MoveDownToEdge.register();

// word
// -------------------------

var MoveToNextWord = (function (_Motion8) {
  _inherits(MoveToNextWord, _Motion8);

  function MoveToNextWord() {
    _classCallCheck(this, MoveToNextWord);

    _get(Object.getPrototypeOf(MoveToNextWord.prototype), "constructor", this).apply(this, arguments);

    this.wordRegex = null;
  }

  _createClass(MoveToNextWord, [{
    key: "getPoint",
    value: function getPoint(regex, from) {
      var wordRange = undefined;
      var found = false;

      this.scanForward(regex, { from: from }, function (_ref2) {
        var range = _ref2.range;
        var matchText = _ref2.matchText;
        var stop = _ref2.stop;

        wordRange = range;
        // Ignore 'empty line' matches between '\r' and '\n'
        if (matchText === "" && range.start.column !== 0) return;
        if (range.start.isGreaterThan(from)) {
          found = true;
          stop();
        }
      });

      if (found) {
        var point = wordRange.start;
        return pointIsAtEndOfLineAtNonEmptyRow(this.editor, point) && !point.isEqual(this.getVimEofBufferPosition()) ? point.traverse([1, 0]) : point;
      } else {
        return wordRange ? wordRange.end : from;
      }
    }

    // Special case: "cw" and "cW" are treated like "ce" and "cE" if the cursor is
    // on a non-blank.  This is because "cw" is interpreted as change-word, and a
    // word does not include the following white space.  {Vi: "cw" when on a blank
    // followed by other blanks changes only the first blank; this is probably a
    // bug, because "dw" deletes all the blanks}
    //
    // Another special case: When using the "w" motion in combination with an
    // operator and the last word moved over is at the end of a line, the end of
    // that word becomes the end of the operated text, not the first word in the
    // next line.
  }, {
    key: "moveCursor",
    value: function moveCursor(cursor) {
      var _this6 = this;

      var cursorPosition = cursor.getBufferPosition();
      if (pointIsAtVimEndOfFile(this.editor, cursorPosition)) return;

      var wasOnWhiteSpace = pointIsOnWhiteSpace(this.editor, cursorPosition);
      var isAsTargetExceptSelectInVisualMode = this.isAsTargetExceptSelectInVisualMode();

      this.moveCursorCountTimes(cursor, function (_ref3) {
        var isFinal = _ref3.isFinal;

        var cursorPosition = cursor.getBufferPosition();
        if (isEmptyRow(_this6.editor, cursorPosition.row) && isAsTargetExceptSelectInVisualMode) {
          cursor.setBufferPosition(cursorPosition.traverse([1, 0]));
        } else {
          var regex = _this6.wordRegex || cursor.wordRegExp();
          var point = _this6.getPoint(regex, cursorPosition);
          if (isFinal && isAsTargetExceptSelectInVisualMode) {
            if (_this6.operator.is("Change") && !wasOnWhiteSpace) {
              point = cursor.getEndOfCurrentWordBufferPosition({ wordRegex: _this6.wordRegex });
            } else {
              point = Point.min(point, getEndOfLineForBufferRow(_this6.editor, cursorPosition.row));
            }
          }
          cursor.setBufferPosition(point);
        }
      });
    }
  }]);

  return MoveToNextWord;
})(Motion);

MoveToNextWord.register();

// b

var MoveToPreviousWord = (function (_Motion9) {
  _inherits(MoveToPreviousWord, _Motion9);

  function MoveToPreviousWord() {
    _classCallCheck(this, MoveToPreviousWord);

    _get(Object.getPrototypeOf(MoveToPreviousWord.prototype), "constructor", this).apply(this, arguments);

    this.wordRegex = null;
  }

  _createClass(MoveToPreviousWord, [{
    key: "moveCursor",
    value: function moveCursor(cursor) {
      var _this7 = this;

      this.moveCursorCountTimes(cursor, function () {
        var point = cursor.getBeginningOfCurrentWordBufferPosition({ wordRegex: _this7.wordRegex });
        cursor.setBufferPosition(point);
      });
    }
  }]);

  return MoveToPreviousWord;
})(Motion);

MoveToPreviousWord.register();

var MoveToEndOfWord = (function (_Motion10) {
  _inherits(MoveToEndOfWord, _Motion10);

  function MoveToEndOfWord() {
    _classCallCheck(this, MoveToEndOfWord);

    _get(Object.getPrototypeOf(MoveToEndOfWord.prototype), "constructor", this).apply(this, arguments);

    this.wordRegex = null;
    this.inclusive = true;
  }

  _createClass(MoveToEndOfWord, [{
    key: "moveToNextEndOfWord",
    value: function moveToNextEndOfWord(cursor) {
      moveCursorToNextNonWhitespace(cursor);
      var point = cursor.getEndOfCurrentWordBufferPosition({ wordRegex: this.wordRegex }).translate([0, -1]);
      cursor.setBufferPosition(Point.min(point, this.getVimEofBufferPosition()));
    }
  }, {
    key: "moveCursor",
    value: function moveCursor(cursor) {
      var _this8 = this;

      this.moveCursorCountTimes(cursor, function () {
        var originalPoint = cursor.getBufferPosition();
        _this8.moveToNextEndOfWord(cursor);
        if (originalPoint.isEqual(cursor.getBufferPosition())) {
          // Retry from right column if cursor was already on EndOfWord
          cursor.moveRight();
          _this8.moveToNextEndOfWord(cursor);
        }
      });
    }
  }]);

  return MoveToEndOfWord;
})(Motion);

MoveToEndOfWord.register();

// [TODO: Improve, accuracy]

var MoveToPreviousEndOfWord = (function (_MoveToPreviousWord) {
  _inherits(MoveToPreviousEndOfWord, _MoveToPreviousWord);

  function MoveToPreviousEndOfWord() {
    _classCallCheck(this, MoveToPreviousEndOfWord);

    _get(Object.getPrototypeOf(MoveToPreviousEndOfWord.prototype), "constructor", this).apply(this, arguments);

    this.inclusive = true;
  }

  _createClass(MoveToPreviousEndOfWord, [{
    key: "moveCursor",
    value: function moveCursor(cursor) {
      var wordRange = cursor.getCurrentWordBufferRange();
      var cursorPosition = cursor.getBufferPosition();

      // if we're in the middle of a word then we need to move to its start
      var times = this.getCount();
      if (cursorPosition.isGreaterThan(wordRange.start) && cursorPosition.isLessThan(wordRange.end)) {
        times += 1;
      }

      for (var i in getList(1, times)) {
        var point = cursor.getBeginningOfCurrentWordBufferPosition({ wordRegex: this.wordRegex });
        cursor.setBufferPosition(point);
      }

      this.moveToNextEndOfWord(cursor);
      if (cursor.getBufferPosition().isGreaterThanOrEqual(cursorPosition)) {
        cursor.setBufferPosition([0, 0]);
      }
    }
  }, {
    key: "moveToNextEndOfWord",
    value: function moveToNextEndOfWord(cursor) {
      var point = cursor.getEndOfCurrentWordBufferPosition({ wordRegex: this.wordRegex }).translate([0, -1]);
      cursor.setBufferPosition(Point.min(point, this.getVimEofBufferPosition()));
    }
  }]);

  return MoveToPreviousEndOfWord;
})(MoveToPreviousWord);

MoveToPreviousEndOfWord.register();

// Whole word
// -------------------------

var MoveToNextWholeWord = (function (_MoveToNextWord) {
  _inherits(MoveToNextWholeWord, _MoveToNextWord);

  function MoveToNextWholeWord() {
    _classCallCheck(this, MoveToNextWholeWord);

    _get(Object.getPrototypeOf(MoveToNextWholeWord.prototype), "constructor", this).apply(this, arguments);

    this.wordRegex = /^$|\S+/g;
  }

  return MoveToNextWholeWord;
})(MoveToNextWord);

MoveToNextWholeWord.register();

var MoveToPreviousWholeWord = (function (_MoveToPreviousWord2) {
  _inherits(MoveToPreviousWholeWord, _MoveToPreviousWord2);

  function MoveToPreviousWholeWord() {
    _classCallCheck(this, MoveToPreviousWholeWord);

    _get(Object.getPrototypeOf(MoveToPreviousWholeWord.prototype), "constructor", this).apply(this, arguments);

    this.wordRegex = /^$|\S+/g;
  }

  return MoveToPreviousWholeWord;
})(MoveToPreviousWord);

MoveToPreviousWholeWord.register();

var MoveToEndOfWholeWord = (function (_MoveToEndOfWord) {
  _inherits(MoveToEndOfWholeWord, _MoveToEndOfWord);

  function MoveToEndOfWholeWord() {
    _classCallCheck(this, MoveToEndOfWholeWord);

    _get(Object.getPrototypeOf(MoveToEndOfWholeWord.prototype), "constructor", this).apply(this, arguments);

    this.wordRegex = /\S+/;
  }

  return MoveToEndOfWholeWord;
})(MoveToEndOfWord);

MoveToEndOfWholeWord.register();

// [TODO: Improve, accuracy]

var MoveToPreviousEndOfWholeWord = (function (_MoveToPreviousEndOfWord) {
  _inherits(MoveToPreviousEndOfWholeWord, _MoveToPreviousEndOfWord);

  function MoveToPreviousEndOfWholeWord() {
    _classCallCheck(this, MoveToPreviousEndOfWholeWord);

    _get(Object.getPrototypeOf(MoveToPreviousEndOfWholeWord.prototype), "constructor", this).apply(this, arguments);

    this.wordRegex = /\S+/;
  }

  return MoveToPreviousEndOfWholeWord;
})(MoveToPreviousEndOfWord);

MoveToPreviousEndOfWholeWord.register();

// Alphanumeric word [Experimental]
// -------------------------

var MoveToNextAlphanumericWord = (function (_MoveToNextWord2) {
  _inherits(MoveToNextAlphanumericWord, _MoveToNextWord2);

  function MoveToNextAlphanumericWord() {
    _classCallCheck(this, MoveToNextAlphanumericWord);

    _get(Object.getPrototypeOf(MoveToNextAlphanumericWord.prototype), "constructor", this).apply(this, arguments);

    this.wordRegex = /\w+/g;
  }

  return MoveToNextAlphanumericWord;
})(MoveToNextWord);

MoveToNextAlphanumericWord.register();

var MoveToPreviousAlphanumericWord = (function (_MoveToPreviousWord3) {
  _inherits(MoveToPreviousAlphanumericWord, _MoveToPreviousWord3);

  function MoveToPreviousAlphanumericWord() {
    _classCallCheck(this, MoveToPreviousAlphanumericWord);

    _get(Object.getPrototypeOf(MoveToPreviousAlphanumericWord.prototype), "constructor", this).apply(this, arguments);

    this.wordRegex = /\w+/;
  }

  return MoveToPreviousAlphanumericWord;
})(MoveToPreviousWord);

MoveToPreviousAlphanumericWord.register();

var MoveToEndOfAlphanumericWord = (function (_MoveToEndOfWord2) {
  _inherits(MoveToEndOfAlphanumericWord, _MoveToEndOfWord2);

  function MoveToEndOfAlphanumericWord() {
    _classCallCheck(this, MoveToEndOfAlphanumericWord);

    _get(Object.getPrototypeOf(MoveToEndOfAlphanumericWord.prototype), "constructor", this).apply(this, arguments);

    this.wordRegex = /\w+/;
  }

  return MoveToEndOfAlphanumericWord;
})(MoveToEndOfWord);

MoveToEndOfAlphanumericWord.register();

// Alphanumeric word [Experimental]
// -------------------------

var MoveToNextSmartWord = (function (_MoveToNextWord3) {
  _inherits(MoveToNextSmartWord, _MoveToNextWord3);

  function MoveToNextSmartWord() {
    _classCallCheck(this, MoveToNextSmartWord);

    _get(Object.getPrototypeOf(MoveToNextSmartWord.prototype), "constructor", this).apply(this, arguments);

    this.wordRegex = /[\w-]+/g;
  }

  return MoveToNextSmartWord;
})(MoveToNextWord);

MoveToNextSmartWord.register();

var MoveToPreviousSmartWord = (function (_MoveToPreviousWord4) {
  _inherits(MoveToPreviousSmartWord, _MoveToPreviousWord4);

  function MoveToPreviousSmartWord() {
    _classCallCheck(this, MoveToPreviousSmartWord);

    _get(Object.getPrototypeOf(MoveToPreviousSmartWord.prototype), "constructor", this).apply(this, arguments);

    this.wordRegex = /[\w-]+/;
  }

  return MoveToPreviousSmartWord;
})(MoveToPreviousWord);

MoveToPreviousSmartWord.register();

var MoveToEndOfSmartWord = (function (_MoveToEndOfWord3) {
  _inherits(MoveToEndOfSmartWord, _MoveToEndOfWord3);

  function MoveToEndOfSmartWord() {
    _classCallCheck(this, MoveToEndOfSmartWord);

    _get(Object.getPrototypeOf(MoveToEndOfSmartWord.prototype), "constructor", this).apply(this, arguments);

    this.wordRegex = /[\w-]+/;
  }

  return MoveToEndOfSmartWord;
})(MoveToEndOfWord);

MoveToEndOfSmartWord.register();

// Subword
// -------------------------

var MoveToNextSubword = (function (_MoveToNextWord4) {
  _inherits(MoveToNextSubword, _MoveToNextWord4);

  function MoveToNextSubword() {
    _classCallCheck(this, MoveToNextSubword);

    _get(Object.getPrototypeOf(MoveToNextSubword.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(MoveToNextSubword, [{
    key: "moveCursor",
    value: function moveCursor(cursor) {
      this.wordRegex = cursor.subwordRegExp();
      _get(Object.getPrototypeOf(MoveToNextSubword.prototype), "moveCursor", this).call(this, cursor);
    }
  }]);

  return MoveToNextSubword;
})(MoveToNextWord);

MoveToNextSubword.register();

var MoveToPreviousSubword = (function (_MoveToPreviousWord5) {
  _inherits(MoveToPreviousSubword, _MoveToPreviousWord5);

  function MoveToPreviousSubword() {
    _classCallCheck(this, MoveToPreviousSubword);

    _get(Object.getPrototypeOf(MoveToPreviousSubword.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(MoveToPreviousSubword, [{
    key: "moveCursor",
    value: function moveCursor(cursor) {
      this.wordRegex = cursor.subwordRegExp();
      _get(Object.getPrototypeOf(MoveToPreviousSubword.prototype), "moveCursor", this).call(this, cursor);
    }
  }]);

  return MoveToPreviousSubword;
})(MoveToPreviousWord);

MoveToPreviousSubword.register();

var MoveToEndOfSubword = (function (_MoveToEndOfWord4) {
  _inherits(MoveToEndOfSubword, _MoveToEndOfWord4);

  function MoveToEndOfSubword() {
    _classCallCheck(this, MoveToEndOfSubword);

    _get(Object.getPrototypeOf(MoveToEndOfSubword.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(MoveToEndOfSubword, [{
    key: "moveCursor",
    value: function moveCursor(cursor) {
      this.wordRegex = cursor.subwordRegExp();
      _get(Object.getPrototypeOf(MoveToEndOfSubword.prototype), "moveCursor", this).call(this, cursor);
    }
  }]);

  return MoveToEndOfSubword;
})(MoveToEndOfWord);

MoveToEndOfSubword.register();

// Sentence
// -------------------------
// Sentence is defined as below
//  - end with ['.', '!', '?']
//  - optionally followed by [')', ']', '"', "'"]
//  - followed by ['$', ' ', '\t']
//  - paragraph boundary is also sentence boundary
//  - section boundary is also sentence boundary(ignore)

var MoveToNextSentence = (function (_Motion11) {
  _inherits(MoveToNextSentence, _Motion11);

  function MoveToNextSentence() {
    _classCallCheck(this, MoveToNextSentence);

    _get(Object.getPrototypeOf(MoveToNextSentence.prototype), "constructor", this).apply(this, arguments);

    this.jump = true;
    this.sentenceRegex = new RegExp("(?:[\\.!\\?][\\)\\]\"']*\\s+)|(\\n|\\r\\n)", "g");
    this.direction = "next";
  }

  _createClass(MoveToNextSentence, [{
    key: "moveCursor",
    value: function moveCursor(cursor) {
      var _this9 = this;

      this.moveCursorCountTimes(cursor, function () {
        _this9.setBufferPositionSafely(cursor, _this9.getPoint(cursor.getBufferPosition()));
      });
    }
  }, {
    key: "getPoint",
    value: function getPoint(fromPoint) {
      if (this.direction === "next") {
        return this.getNextStartOfSentence(fromPoint);
      } else if (this.direction === "previous") {
        return this.getPreviousStartOfSentence(fromPoint);
      }
    }
  }, {
    key: "isBlankRow",
    value: function isBlankRow(row) {
      return this.editor.isBufferRowBlank(row);
    }
  }, {
    key: "getNextStartOfSentence",
    value: function getNextStartOfSentence(from) {
      var _this10 = this;

      var foundPoint = undefined;
      this.scanForward(this.sentenceRegex, { from: from }, function (_ref4) {
        var range = _ref4.range;
        var matchText = _ref4.matchText;
        var match = _ref4.match;
        var stop = _ref4.stop;

        if (match[1] != null) {
          var _Array$from = Array.from([range.start.row, range.end.row]);

          var _Array$from2 = _slicedToArray(_Array$from, 2);

          var startRow = _Array$from2[0];
          var endRow = _Array$from2[1];

          if (_this10.skipBlankRow && _this10.isBlankRow(endRow)) return;
          if (_this10.isBlankRow(startRow) !== _this10.isBlankRow(endRow)) {
            foundPoint = _this10.getFirstCharacterPositionForBufferRow(endRow);
          }
        } else {
          foundPoint = range.end;
        }
        if (foundPoint) stop();
      });
      return foundPoint || this.getVimEofBufferPosition();
    }
  }, {
    key: "getPreviousStartOfSentence",
    value: function getPreviousStartOfSentence(from) {
      var _this11 = this;

      var foundPoint = undefined;
      this.scanBackward(this.sentenceRegex, { from: from }, function (_ref5) {
        var range = _ref5.range;
        var match = _ref5.match;
        var stop = _ref5.stop;
        var matchText = _ref5.matchText;

        if (match[1] != null) {
          var _Array$from3 = Array.from([range.start.row, range.end.row]);

          var _Array$from32 = _slicedToArray(_Array$from3, 2);

          var startRow = _Array$from32[0];
          var endRow = _Array$from32[1];

          if (!_this11.isBlankRow(endRow) && _this11.isBlankRow(startRow)) {
            var point = _this11.getFirstCharacterPositionForBufferRow(endRow);
            if (point.isLessThan(from)) {
              foundPoint = point;
            } else {
              if (_this11.skipBlankRow) return;
              foundPoint = _this11.getFirstCharacterPositionForBufferRow(startRow);
            }
          }
        } else {
          if (range.end.isLessThan(from)) foundPoint = range.end;
        }
        if (foundPoint) stop();
      });
      return foundPoint || [0, 0];
    }
  }]);

  return MoveToNextSentence;
})(Motion);

MoveToNextSentence.register();

var MoveToPreviousSentence = (function (_MoveToNextSentence) {
  _inherits(MoveToPreviousSentence, _MoveToNextSentence);

  function MoveToPreviousSentence() {
    _classCallCheck(this, MoveToPreviousSentence);

    _get(Object.getPrototypeOf(MoveToPreviousSentence.prototype), "constructor", this).apply(this, arguments);

    this.direction = "previous";
  }

  return MoveToPreviousSentence;
})(MoveToNextSentence);

MoveToPreviousSentence.register();

var MoveToNextSentenceSkipBlankRow = (function (_MoveToNextSentence2) {
  _inherits(MoveToNextSentenceSkipBlankRow, _MoveToNextSentence2);

  function MoveToNextSentenceSkipBlankRow() {
    _classCallCheck(this, MoveToNextSentenceSkipBlankRow);

    _get(Object.getPrototypeOf(MoveToNextSentenceSkipBlankRow.prototype), "constructor", this).apply(this, arguments);

    this.skipBlankRow = true;
  }

  return MoveToNextSentenceSkipBlankRow;
})(MoveToNextSentence);

MoveToNextSentenceSkipBlankRow.register();

var MoveToPreviousSentenceSkipBlankRow = (function (_MoveToPreviousSentence) {
  _inherits(MoveToPreviousSentenceSkipBlankRow, _MoveToPreviousSentence);

  function MoveToPreviousSentenceSkipBlankRow() {
    _classCallCheck(this, MoveToPreviousSentenceSkipBlankRow);

    _get(Object.getPrototypeOf(MoveToPreviousSentenceSkipBlankRow.prototype), "constructor", this).apply(this, arguments);

    this.skipBlankRow = true;
  }

  return MoveToPreviousSentenceSkipBlankRow;
})(MoveToPreviousSentence);

MoveToPreviousSentenceSkipBlankRow.register();

// Paragraph
// -------------------------

var MoveToNextParagraph = (function (_Motion12) {
  _inherits(MoveToNextParagraph, _Motion12);

  function MoveToNextParagraph() {
    _classCallCheck(this, MoveToNextParagraph);

    _get(Object.getPrototypeOf(MoveToNextParagraph.prototype), "constructor", this).apply(this, arguments);

    this.jump = true;
    this.direction = "next";
  }

  _createClass(MoveToNextParagraph, [{
    key: "moveCursor",
    value: function moveCursor(cursor) {
      var _this12 = this;

      this.moveCursorCountTimes(cursor, function () {
        _this12.setBufferPositionSafely(cursor, _this12.getPoint(cursor.getBufferPosition()));
      });
    }
  }, {
    key: "getPoint",
    value: function getPoint(fromPoint) {
      var startRow = fromPoint.row;
      var wasAtNonBlankRow = !this.editor.isBufferRowBlank(startRow);
      for (var row of getBufferRows(this.editor, { startRow: startRow, direction: this.direction })) {
        if (this.editor.isBufferRowBlank(row)) {
          if (wasAtNonBlankRow) return new Point(row, 0);
        } else {
          wasAtNonBlankRow = true;
        }
      }

      // fallback
      return this.direction === "previous" ? new Point(0, 0) : this.getVimEofBufferPosition();
    }
  }]);

  return MoveToNextParagraph;
})(Motion);

MoveToNextParagraph.register();

var MoveToPreviousParagraph = (function (_MoveToNextParagraph) {
  _inherits(MoveToPreviousParagraph, _MoveToNextParagraph);

  function MoveToPreviousParagraph() {
    _classCallCheck(this, MoveToPreviousParagraph);

    _get(Object.getPrototypeOf(MoveToPreviousParagraph.prototype), "constructor", this).apply(this, arguments);

    this.direction = "previous";
  }

  return MoveToPreviousParagraph;
})(MoveToNextParagraph);

MoveToPreviousParagraph.register();

// -------------------------
// keymap: 0

var MoveToBeginningOfLine = (function (_Motion13) {
  _inherits(MoveToBeginningOfLine, _Motion13);

  function MoveToBeginningOfLine() {
    _classCallCheck(this, MoveToBeginningOfLine);

    _get(Object.getPrototypeOf(MoveToBeginningOfLine.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(MoveToBeginningOfLine, [{
    key: "moveCursor",
    value: function moveCursor(cursor) {
      setBufferColumn(cursor, 0);
    }
  }]);

  return MoveToBeginningOfLine;
})(Motion);

MoveToBeginningOfLine.register();

var MoveToColumn = (function (_Motion14) {
  _inherits(MoveToColumn, _Motion14);

  function MoveToColumn() {
    _classCallCheck(this, MoveToColumn);

    _get(Object.getPrototypeOf(MoveToColumn.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(MoveToColumn, [{
    key: "moveCursor",
    value: function moveCursor(cursor) {
      setBufferColumn(cursor, this.getCount(-1));
    }
  }]);

  return MoveToColumn;
})(Motion);

MoveToColumn.register();

var MoveToLastCharacterOfLine = (function (_Motion15) {
  _inherits(MoveToLastCharacterOfLine, _Motion15);

  function MoveToLastCharacterOfLine() {
    _classCallCheck(this, MoveToLastCharacterOfLine);

    _get(Object.getPrototypeOf(MoveToLastCharacterOfLine.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(MoveToLastCharacterOfLine, [{
    key: "moveCursor",
    value: function moveCursor(cursor) {
      var row = getValidVimBufferRow(this.editor, cursor.getBufferRow() + this.getCount(-1));
      cursor.setBufferPosition([row, Infinity]);
      cursor.goalColumn = Infinity;
    }
  }]);

  return MoveToLastCharacterOfLine;
})(Motion);

MoveToLastCharacterOfLine.register();

var MoveToLastNonblankCharacterOfLineAndDown = (function (_Motion16) {
  _inherits(MoveToLastNonblankCharacterOfLineAndDown, _Motion16);

  function MoveToLastNonblankCharacterOfLineAndDown() {
    _classCallCheck(this, MoveToLastNonblankCharacterOfLineAndDown);

    _get(Object.getPrototypeOf(MoveToLastNonblankCharacterOfLineAndDown.prototype), "constructor", this).apply(this, arguments);

    this.inclusive = true;
  }

  _createClass(MoveToLastNonblankCharacterOfLineAndDown, [{
    key: "moveCursor",
    value: function moveCursor(cursor) {
      cursor.setBufferPosition(this.getPoint(cursor.getBufferPosition()));
    }
  }, {
    key: "getPoint",
    value: function getPoint(_ref6) {
      var row = _ref6.row;

      row = limitNumber(row + this.getCount(-1), { max: this.getVimLastBufferRow() });
      var range = findRangeInBufferRow(this.editor, /\S|^/, row, { direction: "backward" });
      return range ? range.start : new Point(row, 0);
    }
  }]);

  return MoveToLastNonblankCharacterOfLineAndDown;
})(Motion);

MoveToLastNonblankCharacterOfLineAndDown.register();

// MoveToFirstCharacterOfLine faimily
// ------------------------------------
// ^

var MoveToFirstCharacterOfLine = (function (_Motion17) {
  _inherits(MoveToFirstCharacterOfLine, _Motion17);

  function MoveToFirstCharacterOfLine() {
    _classCallCheck(this, MoveToFirstCharacterOfLine);

    _get(Object.getPrototypeOf(MoveToFirstCharacterOfLine.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(MoveToFirstCharacterOfLine, [{
    key: "moveCursor",
    value: function moveCursor(cursor) {
      var point = this.getFirstCharacterPositionForBufferRow(cursor.getBufferRow());
      this.setBufferPositionSafely(cursor, point);
    }
  }]);

  return MoveToFirstCharacterOfLine;
})(Motion);

MoveToFirstCharacterOfLine.register();

var MoveToFirstCharacterOfLineUp = (function (_MoveToFirstCharacterOfLine) {
  _inherits(MoveToFirstCharacterOfLineUp, _MoveToFirstCharacterOfLine);

  function MoveToFirstCharacterOfLineUp() {
    _classCallCheck(this, MoveToFirstCharacterOfLineUp);

    _get(Object.getPrototypeOf(MoveToFirstCharacterOfLineUp.prototype), "constructor", this).apply(this, arguments);

    this.wise = "linewise";
  }

  _createClass(MoveToFirstCharacterOfLineUp, [{
    key: "moveCursor",
    value: function moveCursor(cursor) {
      this.moveCursorCountTimes(cursor, function () {
        var point = cursor.getBufferPosition();
        if (point.row > 0) {
          cursor.setBufferPosition(point.translate([-1, 0]));
        }
      });
      _get(Object.getPrototypeOf(MoveToFirstCharacterOfLineUp.prototype), "moveCursor", this).call(this, cursor);
    }
  }]);

  return MoveToFirstCharacterOfLineUp;
})(MoveToFirstCharacterOfLine);

MoveToFirstCharacterOfLineUp.register();

var MoveToFirstCharacterOfLineDown = (function (_MoveToFirstCharacterOfLine2) {
  _inherits(MoveToFirstCharacterOfLineDown, _MoveToFirstCharacterOfLine2);

  function MoveToFirstCharacterOfLineDown() {
    _classCallCheck(this, MoveToFirstCharacterOfLineDown);

    _get(Object.getPrototypeOf(MoveToFirstCharacterOfLineDown.prototype), "constructor", this).apply(this, arguments);

    this.wise = "linewise";
  }

  _createClass(MoveToFirstCharacterOfLineDown, [{
    key: "moveCursor",
    value: function moveCursor(cursor) {
      var _this13 = this;

      this.moveCursorCountTimes(cursor, function () {
        var point = cursor.getBufferPosition();
        if (point.row < _this13.getVimLastBufferRow()) {
          cursor.setBufferPosition(point.translate([+1, 0]));
        }
      });
      _get(Object.getPrototypeOf(MoveToFirstCharacterOfLineDown.prototype), "moveCursor", this).call(this, cursor);
    }
  }]);

  return MoveToFirstCharacterOfLineDown;
})(MoveToFirstCharacterOfLine);

MoveToFirstCharacterOfLineDown.register();

var MoveToFirstCharacterOfLineAndDown = (function (_MoveToFirstCharacterOfLineDown) {
  _inherits(MoveToFirstCharacterOfLineAndDown, _MoveToFirstCharacterOfLineDown);

  function MoveToFirstCharacterOfLineAndDown() {
    _classCallCheck(this, MoveToFirstCharacterOfLineAndDown);

    _get(Object.getPrototypeOf(MoveToFirstCharacterOfLineAndDown.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(MoveToFirstCharacterOfLineAndDown, [{
    key: "getCount",
    value: function getCount() {
      return _get(Object.getPrototypeOf(MoveToFirstCharacterOfLineAndDown.prototype), "getCount", this).call(this, -1);
    }
  }]);

  return MoveToFirstCharacterOfLineAndDown;
})(MoveToFirstCharacterOfLineDown);

MoveToFirstCharacterOfLineAndDown.register();

// keymap: g g

var MoveToFirstLine = (function (_Motion18) {
  _inherits(MoveToFirstLine, _Motion18);

  function MoveToFirstLine() {
    _classCallCheck(this, MoveToFirstLine);

    _get(Object.getPrototypeOf(MoveToFirstLine.prototype), "constructor", this).apply(this, arguments);

    this.wise = "linewise";
    this.jump = true;
    this.verticalMotion = true;
    this.moveSuccessOnLinewise = true;
  }

  _createClass(MoveToFirstLine, [{
    key: "moveCursor",
    value: function moveCursor(cursor) {
      this.setCursorBufferRow(cursor, getValidVimBufferRow(this.editor, this.getRow()));
      cursor.autoscroll({ center: true });
    }
  }, {
    key: "getRow",
    value: function getRow() {
      return this.getCount(-1);
    }
  }]);

  return MoveToFirstLine;
})(Motion);

MoveToFirstLine.register();

var MoveToScreenColumn = (function (_Motion19) {
  _inherits(MoveToScreenColumn, _Motion19);

  function MoveToScreenColumn() {
    _classCallCheck(this, MoveToScreenColumn);

    _get(Object.getPrototypeOf(MoveToScreenColumn.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(MoveToScreenColumn, [{
    key: "moveCursor",
    value: function moveCursor(cursor) {
      var allowOffScreenPosition = this.getConfig("allowMoveToOffScreenColumnOnScreenLineMotion");
      var point = getScreenPositionForScreenRow(this.editor, cursor.getScreenRow(), this.which, {
        allowOffScreenPosition: allowOffScreenPosition
      });
      this.setScreenPositionSafely(cursor, point);
    }
  }]);

  return MoveToScreenColumn;
})(Motion);

MoveToScreenColumn.register(false);

// keymap: g 0

var MoveToBeginningOfScreenLine = (function (_MoveToScreenColumn) {
  _inherits(MoveToBeginningOfScreenLine, _MoveToScreenColumn);

  function MoveToBeginningOfScreenLine() {
    _classCallCheck(this, MoveToBeginningOfScreenLine);

    _get(Object.getPrototypeOf(MoveToBeginningOfScreenLine.prototype), "constructor", this).apply(this, arguments);

    this.which = "beginning";
  }

  return MoveToBeginningOfScreenLine;
})(MoveToScreenColumn);

MoveToBeginningOfScreenLine.register();

// g ^: `move-to-first-character-of-screen-line`

var MoveToFirstCharacterOfScreenLine = (function (_MoveToScreenColumn2) {
  _inherits(MoveToFirstCharacterOfScreenLine, _MoveToScreenColumn2);

  function MoveToFirstCharacterOfScreenLine() {
    _classCallCheck(this, MoveToFirstCharacterOfScreenLine);

    _get(Object.getPrototypeOf(MoveToFirstCharacterOfScreenLine.prototype), "constructor", this).apply(this, arguments);

    this.which = "first-character";
  }

  return MoveToFirstCharacterOfScreenLine;
})(MoveToScreenColumn);

MoveToFirstCharacterOfScreenLine.register();

// keymap: g $

var MoveToLastCharacterOfScreenLine = (function (_MoveToScreenColumn3) {
  _inherits(MoveToLastCharacterOfScreenLine, _MoveToScreenColumn3);

  function MoveToLastCharacterOfScreenLine() {
    _classCallCheck(this, MoveToLastCharacterOfScreenLine);

    _get(Object.getPrototypeOf(MoveToLastCharacterOfScreenLine.prototype), "constructor", this).apply(this, arguments);

    this.which = "last-character";
  }

  return MoveToLastCharacterOfScreenLine;
})(MoveToScreenColumn);

MoveToLastCharacterOfScreenLine.register();

// keymap: G

var MoveToLastLine = (function (_MoveToFirstLine) {
  _inherits(MoveToLastLine, _MoveToFirstLine);

  function MoveToLastLine() {
    _classCallCheck(this, MoveToLastLine);

    _get(Object.getPrototypeOf(MoveToLastLine.prototype), "constructor", this).apply(this, arguments);

    this.defaultCount = Infinity;
  }

  return MoveToLastLine;
})(MoveToFirstLine);

MoveToLastLine.register();

// keymap: N% e.g. 10%

var MoveToLineByPercent = (function (_MoveToFirstLine2) {
  _inherits(MoveToLineByPercent, _MoveToFirstLine2);

  function MoveToLineByPercent() {
    _classCallCheck(this, MoveToLineByPercent);

    _get(Object.getPrototypeOf(MoveToLineByPercent.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(MoveToLineByPercent, [{
    key: "getRow",
    value: function getRow() {
      var percent = limitNumber(this.getCount(), { max: 100 });
      return Math.floor((this.editor.getLineCount() - 1) * (percent / 100));
    }
  }]);

  return MoveToLineByPercent;
})(MoveToFirstLine);

MoveToLineByPercent.register();

var MoveToRelativeLine = (function (_Motion20) {
  _inherits(MoveToRelativeLine, _Motion20);

  function MoveToRelativeLine() {
    _classCallCheck(this, MoveToRelativeLine);

    _get(Object.getPrototypeOf(MoveToRelativeLine.prototype), "constructor", this).apply(this, arguments);

    this.wise = "linewise";
    this.moveSuccessOnLinewise = true;
  }

  _createClass(MoveToRelativeLine, [{
    key: "moveCursor",
    value: function moveCursor(cursor) {
      var row = undefined;
      var count = this.getCount();
      if (count < 0) {
        // Support negative count
        // Negative count can be passed like `operationStack.run("MoveToRelativeLine", {count: -5})`.
        // Currently used in vim-mode-plus-ex-mode pkg.
        count += 1;
        row = this.getFoldStartRowForRow(cursor.getBufferRow());
        while (count++ < 0) row = this.getFoldStartRowForRow(row - 1);
      } else {
        count -= 1;
        row = this.getFoldEndRowForRow(cursor.getBufferRow());
        while (count-- > 0) row = this.getFoldEndRowForRow(row + 1);
      }
      setBufferRow(cursor, row);
    }
  }]);

  return MoveToRelativeLine;
})(Motion);

MoveToRelativeLine.register(false);

var MoveToRelativeLineMinimumTwo = (function (_MoveToRelativeLine) {
  _inherits(MoveToRelativeLineMinimumTwo, _MoveToRelativeLine);

  function MoveToRelativeLineMinimumTwo() {
    _classCallCheck(this, MoveToRelativeLineMinimumTwo);

    _get(Object.getPrototypeOf(MoveToRelativeLineMinimumTwo.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(MoveToRelativeLineMinimumTwo, [{
    key: "getCount",
    value: function getCount() {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return limitNumber(_get(Object.getPrototypeOf(MoveToRelativeLineMinimumTwo.prototype), "getCount", this).apply(this, args), { min: 2 });
    }
  }]);

  return MoveToRelativeLineMinimumTwo;
})(MoveToRelativeLine);

MoveToRelativeLineMinimumTwo.register(false);

// Position cursor without scrolling., H, M, L
// -------------------------
// keymap: H

var MoveToTopOfScreen = (function (_Motion21) {
  _inherits(MoveToTopOfScreen, _Motion21);

  function MoveToTopOfScreen() {
    _classCallCheck(this, MoveToTopOfScreen);

    _get(Object.getPrototypeOf(MoveToTopOfScreen.prototype), "constructor", this).apply(this, arguments);

    this.wise = "linewise";
    this.jump = true;
    this.scrolloff = 2;
    this.defaultCount = 0;
    this.verticalMotion = true;
  }

  _createClass(MoveToTopOfScreen, [{
    key: "moveCursor",
    value: function moveCursor(cursor) {
      var bufferRow = this.editor.bufferRowForScreenRow(this.getScreenRow());
      this.setCursorBufferRow(cursor, bufferRow);
    }
  }, {
    key: "getScrolloff",
    value: function getScrolloff() {
      return this.isAsTargetExceptSelectInVisualMode() ? 0 : this.scrolloff;
    }
  }, {
    key: "getScreenRow",
    value: function getScreenRow() {
      var firstRow = getFirstVisibleScreenRow(this.editor);
      var offset = this.getScrolloff();
      if (firstRow === 0) {
        offset = 0;
      }
      offset = limitNumber(this.getCount(-1), { min: offset });
      return firstRow + offset;
    }
  }]);

  return MoveToTopOfScreen;
})(Motion);

MoveToTopOfScreen.register();

// keymap: M

var MoveToMiddleOfScreen = (function (_MoveToTopOfScreen) {
  _inherits(MoveToMiddleOfScreen, _MoveToTopOfScreen);

  function MoveToMiddleOfScreen() {
    _classCallCheck(this, MoveToMiddleOfScreen);

    _get(Object.getPrototypeOf(MoveToMiddleOfScreen.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(MoveToMiddleOfScreen, [{
    key: "getScreenRow",
    value: function getScreenRow() {
      var startRow = getFirstVisibleScreenRow(this.editor);
      var endRow = limitNumber(this.editor.getLastVisibleScreenRow(), { max: this.getVimLastScreenRow() });
      return startRow + Math.floor((endRow - startRow) / 2);
    }
  }]);

  return MoveToMiddleOfScreen;
})(MoveToTopOfScreen);

MoveToMiddleOfScreen.register();

// keymap: L

var MoveToBottomOfScreen = (function (_MoveToTopOfScreen2) {
  _inherits(MoveToBottomOfScreen, _MoveToTopOfScreen2);

  function MoveToBottomOfScreen() {
    _classCallCheck(this, MoveToBottomOfScreen);

    _get(Object.getPrototypeOf(MoveToBottomOfScreen.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(MoveToBottomOfScreen, [{
    key: "getScreenRow",
    value: function getScreenRow() {
      // [FIXME]
      // At least Atom v1.6.0, there are two implementation of getLastVisibleScreenRow()
      // editor.getLastVisibleScreenRow() and editorElement.getLastVisibleScreenRow()
      // Those two methods return different value, editor's one is corrent.
      // So I intentionally use editor.getLastScreenRow here.
      var vimLastScreenRow = this.getVimLastScreenRow();
      var row = limitNumber(this.editor.getLastVisibleScreenRow(), { max: vimLastScreenRow });
      var offset = this.getScrolloff() + 1;
      if (row === vimLastScreenRow) {
        offset = 0;
      }
      offset = limitNumber(this.getCount(-1), { min: offset });
      return row - offset;
    }
  }]);

  return MoveToBottomOfScreen;
})(MoveToTopOfScreen);

MoveToBottomOfScreen.register();

// Scrolling
// Half: ctrl-d, ctrl-u
// Full: ctrl-f, ctrl-b
// -------------------------
// [FIXME] count behave differently from original Vim.

var Scroll = (function (_Motion22) {
  _inherits(Scroll, _Motion22);

  function Scroll() {
    _classCallCheck(this, Scroll);

    _get(Object.getPrototypeOf(Scroll.prototype), "constructor", this).apply(this, arguments);

    this.verticalMotion = true;
  }

  _createClass(Scroll, [{
    key: "isSmoothScrollEnabled",
    value: function isSmoothScrollEnabled() {
      return Math.abs(this.amountOfPage) === 1 ? this.getConfig("smoothScrollOnFullScrollMotion") : this.getConfig("smoothScrollOnHalfScrollMotion");
    }
  }, {
    key: "getSmoothScrollDuation",
    value: function getSmoothScrollDuation() {
      return Math.abs(this.amountOfPage) === 1 ? this.getConfig("smoothScrollOnFullScrollMotionDuration") : this.getConfig("smoothScrollOnHalfScrollMotionDuration");
    }
  }, {
    key: "getPixelRectTopForSceenRow",
    value: function getPixelRectTopForSceenRow(row) {
      var point = new Point(row, 0);
      return this.editor.element.pixelRectForScreenRange(new Range(point, point)).top;
    }
  }, {
    key: "smoothScroll",
    value: function smoothScroll(fromRow, toRow, done) {
      var _this14 = this;

      var topPixelFrom = { top: this.getPixelRectTopForSceenRow(fromRow) };
      var topPixelTo = { top: this.getPixelRectTopForSceenRow(toRow) };
      // [NOTE]
      // intentionally use `element.component.setScrollTop` instead of `element.setScrollTop`.
      // SInce element.setScrollTop will throw exception when element.component no longer exists.
      var step = function step(newTop) {
        if (_this14.editor.element.component) {
          _this14.editor.element.component.setScrollTop(newTop);
          _this14.editor.element.component.updateSync();
        }
      };

      var duration = this.getSmoothScrollDuation();
      this.vimState.requestScrollAnimation(topPixelFrom, topPixelTo, { duration: duration, step: step, done: done });
    }
  }, {
    key: "getAmountOfRows",
    value: function getAmountOfRows() {
      return Math.ceil(this.amountOfPage * this.editor.getRowsPerPage() * this.getCount());
    }
  }, {
    key: "getBufferRow",
    value: function getBufferRow(cursor) {
      var screenRow = getValidVimScreenRow(this.editor, cursor.getScreenRow() + this.getAmountOfRows());
      return this.editor.bufferRowForScreenRow(screenRow);
    }
  }, {
    key: "moveCursor",
    value: function moveCursor(cursor) {
      var _this15 = this;

      var bufferRow = this.getBufferRow(cursor);
      this.setCursorBufferRow(cursor, this.getBufferRow(cursor), { autoscroll: false });

      if (cursor.isLastCursor()) {
        (function () {
          if (_this15.isSmoothScrollEnabled()) _this15.vimState.finishScrollAnimation();

          var firstVisibileScreenRow = _this15.editor.getFirstVisibleScreenRow();
          var newFirstVisibileBufferRow = _this15.editor.bufferRowForScreenRow(firstVisibileScreenRow + _this15.getAmountOfRows());
          var newFirstVisibileScreenRow = _this15.editor.screenRowForBufferRow(newFirstVisibileBufferRow);
          var done = function done() {
            _this15.editor.setFirstVisibleScreenRow(newFirstVisibileScreenRow);
            // [FIXME] sometimes, scrollTop is not updated, calling this fix.
            // Investigate and find better approach then remove this workaround.
            if (_this15.editor.element.component) _this15.editor.element.component.updateSync();
          };

          if (_this15.isSmoothScrollEnabled()) _this15.smoothScroll(firstVisibileScreenRow, newFirstVisibileScreenRow, done);else done();
        })();
      }
    }
  }]);

  return Scroll;
})(Motion);

Scroll.register(false);

// keymap: ctrl-f

var ScrollFullScreenDown = (function (_Scroll) {
  _inherits(ScrollFullScreenDown, _Scroll);

  function ScrollFullScreenDown() {
    _classCallCheck(this, ScrollFullScreenDown);

    _get(Object.getPrototypeOf(ScrollFullScreenDown.prototype), "constructor", this).apply(this, arguments);

    this.amountOfPage = +1;
  }

  return ScrollFullScreenDown;
})(Scroll);

ScrollFullScreenDown.register();

// keymap: ctrl-b

var ScrollFullScreenUp = (function (_Scroll2) {
  _inherits(ScrollFullScreenUp, _Scroll2);

  function ScrollFullScreenUp() {
    _classCallCheck(this, ScrollFullScreenUp);

    _get(Object.getPrototypeOf(ScrollFullScreenUp.prototype), "constructor", this).apply(this, arguments);

    this.amountOfPage = -1;
  }

  return ScrollFullScreenUp;
})(Scroll);

ScrollFullScreenUp.register();

// keymap: ctrl-d

var ScrollHalfScreenDown = (function (_Scroll3) {
  _inherits(ScrollHalfScreenDown, _Scroll3);

  function ScrollHalfScreenDown() {
    _classCallCheck(this, ScrollHalfScreenDown);

    _get(Object.getPrototypeOf(ScrollHalfScreenDown.prototype), "constructor", this).apply(this, arguments);

    this.amountOfPage = +1 / 2;
  }

  return ScrollHalfScreenDown;
})(Scroll);

ScrollHalfScreenDown.register();

// keymap: ctrl-u

var ScrollHalfScreenUp = (function (_Scroll4) {
  _inherits(ScrollHalfScreenUp, _Scroll4);

  function ScrollHalfScreenUp() {
    _classCallCheck(this, ScrollHalfScreenUp);

    _get(Object.getPrototypeOf(ScrollHalfScreenUp.prototype), "constructor", this).apply(this, arguments);

    this.amountOfPage = -1 / 2;
  }

  return ScrollHalfScreenUp;
})(Scroll);

ScrollHalfScreenUp.register();

// Find
// -------------------------
// keymap: f

var Find = (function (_Motion23) {
  _inherits(Find, _Motion23);

  function Find() {
    _classCallCheck(this, Find);

    _get(Object.getPrototypeOf(Find.prototype), "constructor", this).apply(this, arguments);

    this.backwards = false;
    this.inclusive = true;
    this.offset = 0;
    this.requireInput = true;
    this.caseSensitivityKind = "Find";
  }

  _createClass(Find, [{
    key: "restoreEditorState",
    value: function restoreEditorState() {
      if (this._restoreEditorState) this._restoreEditorState();
      this._restoreEditorState = null;
    }
  }, {
    key: "cancelOperation",
    value: function cancelOperation() {
      this.restoreEditorState();
      _get(Object.getPrototypeOf(Find.prototype), "cancelOperation", this).call(this);
    }
  }, {
    key: "initialize",
    value: function initialize() {
      var _this16 = this;

      if (this.getConfig("reuseFindForRepeatFind")) this.repeatIfNecessary();
      if (!this.isComplete()) {
        var charsMax = this.getConfig("findCharsMax");
        var optionsBase = { purpose: "find", charsMax: charsMax };

        if (charsMax === 1) {
          this.focusInput(optionsBase);
        } else {
          this._restoreEditorState = saveEditorState(this.editor);
          var options = {
            autoConfirmTimeout: this.getConfig("findConfirmByTimeout"),
            onConfirm: function onConfirm(input) {
              _this16.input = input;
              if (input) _this16.processOperation();else _this16.cancelOperation();
            },
            onChange: function onChange(preConfirmedChars) {
              _this16.preConfirmedChars = preConfirmedChars;
              _this16.highlightTextInCursorRows(_this16.preConfirmedChars, "pre-confirm", _this16.isBackwards());
            },
            onCancel: function onCancel() {
              _this16.vimState.highlightFind.clearMarkers();
              _this16.cancelOperation();
            },
            commands: {
              "vim-mode-plus:find-next-pre-confirmed": function vimModePlusFindNextPreConfirmed() {
                return _this16.findPreConfirmed(+1);
              },
              "vim-mode-plus:find-previous-pre-confirmed": function vimModePlusFindPreviousPreConfirmed() {
                return _this16.findPreConfirmed(-1);
              }
            }
          };
          this.focusInput(Object.assign(options, optionsBase));
        }
      }
      return _get(Object.getPrototypeOf(Find.prototype), "initialize", this).call(this);
    }
  }, {
    key: "findPreConfirmed",
    value: function findPreConfirmed(delta) {
      if (this.preConfirmedChars && this.getConfig("highlightFindChar")) {
        var index = this.highlightTextInCursorRows(this.preConfirmedChars, "pre-confirm", this.isBackwards(), this.getCount(-1) + delta, true);
        this.count = index + 1;
      }
    }
  }, {
    key: "repeatIfNecessary",
    value: function repeatIfNecessary() {
      var findCommandNames = ["Find", "FindBackwards", "Till", "TillBackwards"];
      var currentFind = this.globalState.get("currentFind");
      if (currentFind && findCommandNames.includes(this.vimState.operationStack.getLastCommandName())) {
        this.input = currentFind.input;
        this.repeated = true;
      }
    }
  }, {
    key: "isBackwards",
    value: function isBackwards() {
      return this.backwards;
    }
  }, {
    key: "execute",
    value: function execute() {
      var _this17 = this;

      _get(Object.getPrototypeOf(Find.prototype), "execute", this).call(this);
      var decorationType = "post-confirm";
      if (this.operator && !this.operator["instanceof"]("SelectBase")) {
        decorationType += " long";
      }

      // HACK: When repeated by ",", this.backwards is temporary inverted and
      // restored after execution finished.
      // But final highlightTextInCursorRows is executed in async(=after operation finished).
      // Thus we need to preserve before restored `backwards` value and pass it.
      var backwards = this.isBackwards();
      this.editor.component.getNextUpdatePromise().then(function () {
        _this17.highlightTextInCursorRows(_this17.input, decorationType, backwards);
      });
    }
  }, {
    key: "getPoint",
    value: function getPoint(fromPoint) {
      var scanRange = this.editor.bufferRangeForBufferRow(fromPoint.row);
      var points = [];
      var regex = this.getRegex(this.input);
      var indexWantAccess = this.getCount(-1);

      var translation = new Point(0, this.isBackwards() ? this.offset : -this.offset);
      if (this.repeated) {
        fromPoint = fromPoint.translate(translation.negate());
      }

      if (this.isBackwards()) {
        if (this.getConfig("findAcrossLines")) scanRange.start = Point.ZERO;

        this.editor.backwardsScanInBufferRange(regex, scanRange, function (_ref7) {
          var range = _ref7.range;
          var stop = _ref7.stop;

          if (range.start.isLessThan(fromPoint)) {
            points.push(range.start);
            if (points.length > indexWantAccess) {
              stop();
            }
          }
        });
      } else {
        if (this.getConfig("findAcrossLines")) scanRange.end = this.editor.getEofBufferPosition();
        this.editor.scanInBufferRange(regex, scanRange, function (_ref8) {
          var range = _ref8.range;
          var stop = _ref8.stop;

          if (range.start.isGreaterThan(fromPoint)) {
            points.push(range.start);
            if (points.length > indexWantAccess) {
              stop();
            }
          }
        });
      }

      var point = points[indexWantAccess];
      if (point) return point.translate(translation);
    }

    // FIXME: bad naming, this function must return index
  }, {
    key: "highlightTextInCursorRows",
    value: function highlightTextInCursorRows(text, decorationType, backwards) {
      var index = arguments.length <= 3 || arguments[3] === undefined ? this.getCount(-1) : arguments[3];
      var adjustIndex = arguments.length <= 4 || arguments[4] === undefined ? false : arguments[4];

      if (!this.getConfig("highlightFindChar")) return;

      return this.vimState.highlightFind.highlightCursorRows(this.getRegex(text), decorationType, backwards, this.offset, index, adjustIndex);
    }
  }, {
    key: "moveCursor",
    value: function moveCursor(cursor) {
      var point = this.getPoint(cursor.getBufferPosition());
      if (point) cursor.setBufferPosition(point);else this.restoreEditorState();

      if (!this.repeated) this.globalState.set("currentFind", this);
    }
  }, {
    key: "getRegex",
    value: function getRegex(term) {
      var modifiers = this.isCaseSensitive(term) ? "g" : "gi";
      return new RegExp(_.escapeRegExp(term), modifiers);
    }
  }]);

  return Find;
})(Motion);

Find.register();

// keymap: F

var FindBackwards = (function (_Find) {
  _inherits(FindBackwards, _Find);

  function FindBackwards() {
    _classCallCheck(this, FindBackwards);

    _get(Object.getPrototypeOf(FindBackwards.prototype), "constructor", this).apply(this, arguments);

    this.inclusive = false;
    this.backwards = true;
  }

  return FindBackwards;
})(Find);

FindBackwards.register();

// keymap: t

var Till = (function (_Find2) {
  _inherits(Till, _Find2);

  function Till() {
    _classCallCheck(this, Till);

    _get(Object.getPrototypeOf(Till.prototype), "constructor", this).apply(this, arguments);

    this.offset = 1;
  }

  _createClass(Till, [{
    key: "getPoint",
    value: function getPoint() {
      for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      var point = _get(Object.getPrototypeOf(Till.prototype), "getPoint", this).apply(this, args);
      this.moveSucceeded = point != null;
      return point;
    }
  }]);

  return Till;
})(Find);

Till.register();

// keymap: T

var TillBackwards = (function (_Till) {
  _inherits(TillBackwards, _Till);

  function TillBackwards() {
    _classCallCheck(this, TillBackwards);

    _get(Object.getPrototypeOf(TillBackwards.prototype), "constructor", this).apply(this, arguments);

    this.inclusive = false;
    this.backwards = true;
  }

  return TillBackwards;
})(Till);

TillBackwards.register();

// Mark
// -------------------------
// keymap: `

var MoveToMark = (function (_Motion24) {
  _inherits(MoveToMark, _Motion24);

  function MoveToMark() {
    _classCallCheck(this, MoveToMark);

    _get(Object.getPrototypeOf(MoveToMark.prototype), "constructor", this).apply(this, arguments);

    this.jump = true;
    this.requireInput = true;
    this.input = null;
  }

  _createClass(MoveToMark, [{
    key: "initialize",
    value: function initialize() {
      if (!this.isComplete()) this.readChar();
      return _get(Object.getPrototypeOf(MoveToMark.prototype), "initialize", this).call(this);
    }
  }, {
    key: "getPoint",
    value: function getPoint() {
      return this.vimState.mark.get(this.input);
    }
  }, {
    key: "moveCursor",
    value: function moveCursor(cursor) {
      var point = this.getPoint();
      if (point) {
        cursor.setBufferPosition(point);
        cursor.autoscroll({ center: true });
      }
    }
  }]);

  return MoveToMark;
})(Motion);

MoveToMark.register();

// keymap: '

var MoveToMarkLine = (function (_MoveToMark) {
  _inherits(MoveToMarkLine, _MoveToMark);

  function MoveToMarkLine() {
    _classCallCheck(this, MoveToMarkLine);

    _get(Object.getPrototypeOf(MoveToMarkLine.prototype), "constructor", this).apply(this, arguments);

    this.wise = "linewise";
  }

  _createClass(MoveToMarkLine, [{
    key: "getPoint",
    value: function getPoint() {
      var point = _get(Object.getPrototypeOf(MoveToMarkLine.prototype), "getPoint", this).call(this);
      if (point) {
        return this.getFirstCharacterPositionForBufferRow(point.row);
      }
    }
  }]);

  return MoveToMarkLine;
})(MoveToMark);

MoveToMarkLine.register();

// Fold
// -------------------------

var MoveToPreviousFoldStart = (function (_Motion25) {
  _inherits(MoveToPreviousFoldStart, _Motion25);

  function MoveToPreviousFoldStart() {
    _classCallCheck(this, MoveToPreviousFoldStart);

    _get(Object.getPrototypeOf(MoveToPreviousFoldStart.prototype), "constructor", this).apply(this, arguments);

    this.wise = "characterwise";
    this.which = "start";
    this.direction = "prev";
  }

  _createClass(MoveToPreviousFoldStart, [{
    key: "execute",
    value: function execute() {
      this.rows = this.getFoldRows(this.which);
      if (this.direction === "prev") this.rows.reverse();

      _get(Object.getPrototypeOf(MoveToPreviousFoldStart.prototype), "execute", this).call(this);
    }
  }, {
    key: "getFoldRows",
    value: function getFoldRows(which) {
      var index = which === "start" ? 0 : 1;
      var rows = getCodeFoldRowRanges(this.editor).map(function (rowRange) {
        return rowRange[index];
      });
      return _.sortBy(_.uniq(rows), function (row) {
        return row;
      });
    }
  }, {
    key: "getScanRows",
    value: function getScanRows(cursor) {
      var cursorRow = cursor.getBufferRow();
      var isVald = this.direction === "prev" ? function (row) {
        return row < cursorRow;
      } : function (row) {
        return row > cursorRow;
      };
      return this.rows.filter(isVald);
    }
  }, {
    key: "detectRow",
    value: function detectRow(cursor) {
      return this.getScanRows(cursor)[0];
    }
  }, {
    key: "moveCursor",
    value: function moveCursor(cursor) {
      var _this18 = this;

      this.moveCursorCountTimes(cursor, function () {
        var row = _this18.detectRow(cursor);
        if (row != null) moveCursorToFirstCharacterAtRow(cursor, row);
      });
    }
  }]);

  return MoveToPreviousFoldStart;
})(Motion);

MoveToPreviousFoldStart.register();

var MoveToNextFoldStart = (function (_MoveToPreviousFoldStart) {
  _inherits(MoveToNextFoldStart, _MoveToPreviousFoldStart);

  function MoveToNextFoldStart() {
    _classCallCheck(this, MoveToNextFoldStart);

    _get(Object.getPrototypeOf(MoveToNextFoldStart.prototype), "constructor", this).apply(this, arguments);

    this.direction = "next";
  }

  return MoveToNextFoldStart;
})(MoveToPreviousFoldStart);

MoveToNextFoldStart.register();

var MoveToPreviousFoldStartWithSameIndent = (function (_MoveToPreviousFoldStart2) {
  _inherits(MoveToPreviousFoldStartWithSameIndent, _MoveToPreviousFoldStart2);

  function MoveToPreviousFoldStartWithSameIndent() {
    _classCallCheck(this, MoveToPreviousFoldStartWithSameIndent);

    _get(Object.getPrototypeOf(MoveToPreviousFoldStartWithSameIndent.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(MoveToPreviousFoldStartWithSameIndent, [{
    key: "detectRow",
    value: function detectRow(cursor) {
      var _this19 = this;

      var baseIndentLevel = this.editor.indentationForBufferRow(cursor.getBufferRow());
      return this.getScanRows(cursor).find(function (row) {
        return _this19.editor.indentationForBufferRow(row) === baseIndentLevel;
      });
    }
  }]);

  return MoveToPreviousFoldStartWithSameIndent;
})(MoveToPreviousFoldStart);

MoveToPreviousFoldStartWithSameIndent.register();

var MoveToNextFoldStartWithSameIndent = (function (_MoveToPreviousFoldStartWithSameIndent) {
  _inherits(MoveToNextFoldStartWithSameIndent, _MoveToPreviousFoldStartWithSameIndent);

  function MoveToNextFoldStartWithSameIndent() {
    _classCallCheck(this, MoveToNextFoldStartWithSameIndent);

    _get(Object.getPrototypeOf(MoveToNextFoldStartWithSameIndent.prototype), "constructor", this).apply(this, arguments);

    this.direction = "next";
  }

  return MoveToNextFoldStartWithSameIndent;
})(MoveToPreviousFoldStartWithSameIndent);

MoveToNextFoldStartWithSameIndent.register();

var MoveToPreviousFoldEnd = (function (_MoveToPreviousFoldStart3) {
  _inherits(MoveToPreviousFoldEnd, _MoveToPreviousFoldStart3);

  function MoveToPreviousFoldEnd() {
    _classCallCheck(this, MoveToPreviousFoldEnd);

    _get(Object.getPrototypeOf(MoveToPreviousFoldEnd.prototype), "constructor", this).apply(this, arguments);

    this.which = "end";
  }

  return MoveToPreviousFoldEnd;
})(MoveToPreviousFoldStart);

MoveToPreviousFoldEnd.register();

var MoveToNextFoldEnd = (function (_MoveToPreviousFoldEnd) {
  _inherits(MoveToNextFoldEnd, _MoveToPreviousFoldEnd);

  function MoveToNextFoldEnd() {
    _classCallCheck(this, MoveToNextFoldEnd);

    _get(Object.getPrototypeOf(MoveToNextFoldEnd.prototype), "constructor", this).apply(this, arguments);

    this.direction = "next";
  }

  return MoveToNextFoldEnd;
})(MoveToPreviousFoldEnd);

MoveToNextFoldEnd.register();

// -------------------------

var MoveToPreviousFunction = (function (_MoveToPreviousFoldStart4) {
  _inherits(MoveToPreviousFunction, _MoveToPreviousFoldStart4);

  function MoveToPreviousFunction() {
    _classCallCheck(this, MoveToPreviousFunction);

    _get(Object.getPrototypeOf(MoveToPreviousFunction.prototype), "constructor", this).apply(this, arguments);

    this.direction = "prev";
  }

  _createClass(MoveToPreviousFunction, [{
    key: "detectRow",
    value: function detectRow(cursor) {
      var _this20 = this;

      return this.getScanRows(cursor).find(function (row) {
        return isIncludeFunctionScopeForRow(_this20.editor, row);
      });
    }
  }]);

  return MoveToPreviousFunction;
})(MoveToPreviousFoldStart);

MoveToPreviousFunction.register();

var MoveToNextFunction = (function (_MoveToPreviousFunction) {
  _inherits(MoveToNextFunction, _MoveToPreviousFunction);

  function MoveToNextFunction() {
    _classCallCheck(this, MoveToNextFunction);

    _get(Object.getPrototypeOf(MoveToNextFunction.prototype), "constructor", this).apply(this, arguments);

    this.direction = "next";
  }

  return MoveToNextFunction;
})(MoveToPreviousFunction);

MoveToNextFunction.register();

// Scope based
// -------------------------

var MoveToPositionByScope = (function (_Motion26) {
  _inherits(MoveToPositionByScope, _Motion26);

  function MoveToPositionByScope() {
    _classCallCheck(this, MoveToPositionByScope);

    _get(Object.getPrototypeOf(MoveToPositionByScope.prototype), "constructor", this).apply(this, arguments);

    this.direction = "backward";
    this.scope = ".";
  }

  _createClass(MoveToPositionByScope, [{
    key: "getPoint",
    value: function getPoint(fromPoint) {
      return detectScopeStartPositionForScope(this.editor, fromPoint, this.direction, this.scope);
    }
  }, {
    key: "moveCursor",
    value: function moveCursor(cursor) {
      var _this21 = this;

      this.moveCursorCountTimes(cursor, function () {
        _this21.setBufferPositionSafely(cursor, _this21.getPoint(cursor.getBufferPosition()));
      });
    }
  }]);

  return MoveToPositionByScope;
})(Motion);

MoveToPositionByScope.register(false);

var MoveToPreviousString = (function (_MoveToPositionByScope) {
  _inherits(MoveToPreviousString, _MoveToPositionByScope);

  function MoveToPreviousString() {
    _classCallCheck(this, MoveToPreviousString);

    _get(Object.getPrototypeOf(MoveToPreviousString.prototype), "constructor", this).apply(this, arguments);

    this.direction = "backward";
    this.scope = "string.begin";
  }

  return MoveToPreviousString;
})(MoveToPositionByScope);

MoveToPreviousString.register();

var MoveToNextString = (function (_MoveToPreviousString) {
  _inherits(MoveToNextString, _MoveToPreviousString);

  function MoveToNextString() {
    _classCallCheck(this, MoveToNextString);

    _get(Object.getPrototypeOf(MoveToNextString.prototype), "constructor", this).apply(this, arguments);

    this.direction = "forward";
  }

  return MoveToNextString;
})(MoveToPreviousString);

MoveToNextString.register();

var MoveToPreviousNumber = (function (_MoveToPositionByScope2) {
  _inherits(MoveToPreviousNumber, _MoveToPositionByScope2);

  function MoveToPreviousNumber() {
    _classCallCheck(this, MoveToPreviousNumber);

    _get(Object.getPrototypeOf(MoveToPreviousNumber.prototype), "constructor", this).apply(this, arguments);

    this.direction = "backward";
    this.scope = "constant.numeric";
  }

  return MoveToPreviousNumber;
})(MoveToPositionByScope);

MoveToPreviousNumber.register();

var MoveToNextNumber = (function (_MoveToPreviousNumber) {
  _inherits(MoveToNextNumber, _MoveToPreviousNumber);

  function MoveToNextNumber() {
    _classCallCheck(this, MoveToNextNumber);

    _get(Object.getPrototypeOf(MoveToNextNumber.prototype), "constructor", this).apply(this, arguments);

    this.direction = "forward";
  }

  return MoveToNextNumber;
})(MoveToPreviousNumber);

MoveToNextNumber.register();

var MoveToNextOccurrence = (function (_Motion27) {
  _inherits(MoveToNextOccurrence, _Motion27);

  function MoveToNextOccurrence() {
    _classCallCheck(this, MoveToNextOccurrence);

    _get(Object.getPrototypeOf(MoveToNextOccurrence.prototype), "constructor", this).apply(this, arguments);

    this.jump = true;
    this.direction = "next";
  }

  _createClass(MoveToNextOccurrence, [{
    key: "execute",
    value: function execute() {
      this.ranges = sortRanges(this.occurrenceManager.getMarkers().map(function (marker) {
        return marker.getBufferRange();
      }));
      _get(Object.getPrototypeOf(MoveToNextOccurrence.prototype), "execute", this).call(this);
    }
  }, {
    key: "moveCursor",
    value: function moveCursor(cursor) {
      var range = this.ranges[getIndex(this.getIndex(cursor.getBufferPosition()), this.ranges)];
      var point = range.start;
      cursor.setBufferPosition(point, { autoscroll: false });

      if (cursor.isLastCursor()) {
        this.editor.unfoldBufferRow(point.row);
        smartScrollToBufferPosition(this.editor, point);
      }

      if (this.getConfig("flashOnMoveToOccurrence")) {
        this.vimState.flash(range, { type: "search" });
      }
    }
  }, {
    key: "getIndex",
    value: function getIndex(fromPoint) {
      var index = this.ranges.findIndex(function (range) {
        return range.start.isGreaterThan(fromPoint);
      });
      return (index >= 0 ? index : 0) + this.getCount(-1);
    }
  }], [{
    key: "commandScope",

    // Ensure this command is available when only has-occurrence
    value: "atom-text-editor.vim-mode-plus.has-occurrence",
    enumerable: true
  }]);

  return MoveToNextOccurrence;
})(Motion);

MoveToNextOccurrence.register();

var MoveToPreviousOccurrence = (function (_MoveToNextOccurrence) {
  _inherits(MoveToPreviousOccurrence, _MoveToNextOccurrence);

  function MoveToPreviousOccurrence() {
    _classCallCheck(this, MoveToPreviousOccurrence);

    _get(Object.getPrototypeOf(MoveToPreviousOccurrence.prototype), "constructor", this).apply(this, arguments);

    this.direction = "previous";
  }

  _createClass(MoveToPreviousOccurrence, [{
    key: "getIndex",
    value: function getIndex(fromPoint) {
      var ranges = this.ranges.slice().reverse();
      var range = ranges.find(function (range) {
        return range.end.isLessThan(fromPoint);
      });
      var index = range ? this.ranges.indexOf(range) : this.ranges.length - 1;
      return index - this.getCount(-1);
    }
  }]);

  return MoveToPreviousOccurrence;
})(MoveToNextOccurrence);

MoveToPreviousOccurrence.register();

// -------------------------
// keymap: %

var MoveToPair = (function (_Motion28) {
  _inherits(MoveToPair, _Motion28);

  function MoveToPair() {
    _classCallCheck(this, MoveToPair);

    _get(Object.getPrototypeOf(MoveToPair.prototype), "constructor", this).apply(this, arguments);

    this.inclusive = true;
    this.jump = true;
    this.member = ["Parenthesis", "CurlyBracket", "SquareBracket"];
  }

  _createClass(MoveToPair, [{
    key: "moveCursor",
    value: function moveCursor(cursor) {
      this.setBufferPositionSafely(cursor, this.getPoint(cursor));
    }
  }, {
    key: "getPointForTag",
    value: function getPointForTag(point) {
      var pairInfo = this.getInstance("ATag").getPairInfo(point);
      if (!pairInfo) return;

      var openRange = pairInfo.openRange;
      var closeRange = pairInfo.closeRange;

      openRange = openRange.translate([0, +1], [0, -1]);
      closeRange = closeRange.translate([0, +1], [0, -1]);
      if (openRange.containsPoint(point) && !point.isEqual(openRange.end)) {
        return closeRange.start;
      }
      if (closeRange.containsPoint(point) && !point.isEqual(closeRange.end)) {
        return openRange.start;
      }
    }
  }, {
    key: "getPoint",
    value: function getPoint(cursor) {
      var cursorPosition = cursor.getBufferPosition();
      var cursorRow = cursorPosition.row;
      var point = this.getPointForTag(cursorPosition);
      if (point) return point;

      // AAnyPairAllowForwarding return forwarding range or enclosing range.
      var range = this.getInstance("AAnyPairAllowForwarding", { member: this.member }).getRange(cursor.selection);
      if (!range) return;

      var start = range.start;
      var end = range.end;

      if (start.row === cursorRow && start.isGreaterThanOrEqual(cursorPosition)) {
        // Forwarding range found
        return end.translate([0, -1]);
      } else if (end.row === cursorPosition.row) {
        // Enclosing range was returned
        // We move to start( open-pair ) only when close-pair was at same row as cursor-row.
        return start;
      }
    }
  }]);

  return MoveToPair;
})(Motion);

MoveToPair.register();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL21vdGlvbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxXQUFXLENBQUE7Ozs7Ozs7Ozs7OztBQUVYLElBQU0sQ0FBQyxHQUFHLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFBOztlQUNiLE9BQU8sQ0FBQyxNQUFNLENBQUM7O0lBQS9CLEtBQUssWUFBTCxLQUFLO0lBQUUsS0FBSyxZQUFMLEtBQUs7O2dCQWtDZixPQUFPLENBQUMsU0FBUyxDQUFDOztJQS9CcEIsY0FBYyxhQUFkLGNBQWM7SUFDZCxlQUFlLGFBQWYsZUFBZTtJQUNmLGtCQUFrQixhQUFsQixrQkFBa0I7SUFDbEIsb0JBQW9CLGFBQXBCLG9CQUFvQjtJQUNwQixxQkFBcUIsYUFBckIscUJBQXFCO0lBQ3JCLHdCQUF3QixhQUF4Qix3QkFBd0I7SUFDeEIsdUJBQXVCLGFBQXZCLHVCQUF1QjtJQUN2QixvQkFBb0IsYUFBcEIsb0JBQW9CO0lBQ3BCLG9CQUFvQixhQUFwQixvQkFBb0I7SUFDcEIsK0JBQStCLGFBQS9CLCtCQUErQjtJQUMvQixVQUFVLGFBQVYsVUFBVTtJQUNWLG1CQUFtQixhQUFuQixtQkFBbUI7SUFDbkIsNkJBQTZCLGFBQTdCLDZCQUE2QjtJQUM3QixVQUFVLGFBQVYsVUFBVTtJQUNWLG9CQUFvQixhQUFwQixvQkFBb0I7SUFDcEIsb0NBQW9DLGFBQXBDLG9DQUFvQztJQUNwQyw0QkFBNEIsYUFBNUIsNEJBQTRCO0lBQzVCLGdDQUFnQyxhQUFoQyxnQ0FBZ0M7SUFDaEMsYUFBYSxhQUFiLGFBQWE7SUFDYixvQkFBb0IsYUFBcEIsb0JBQW9CO0lBQ3BCLFlBQVksYUFBWixZQUFZO0lBQ1osZUFBZSxhQUFmLGVBQWU7SUFDZixXQUFXLGFBQVgsV0FBVztJQUNYLFFBQVEsYUFBUixRQUFRO0lBQ1IsMkJBQTJCLGFBQTNCLDJCQUEyQjtJQUMzQiwrQkFBK0IsYUFB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QUcsY0FBYyxDQUFDLEdBQUcsQ0FBQTtBQUNwQyxVQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLGNBQWMsQ0FBQyxDQUFBO0FBQ2pELFVBQUksS0FBSyxFQUFFLE9BQU8sS0FBSyxDQUFBOzs7QUFHdkIsVUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyx5QkFBeUIsRUFBRSxFQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFBO0FBQzNHLFVBQUksQ0FBQyxLQUFLLEVBQUUsT0FBTTs7VUFFWCxLQUFLLEdBQVMsS0FBSyxDQUFuQixLQUFLO1VBQUUsR0FBRyxHQUFJLEtBQUssQ0FBWixHQUFHOztBQUNqQixVQUFJLEtBQUssQ0FBQyxHQUFHLEtBQUssU0FBUyxJQUFJLEtBQUssQ0FBQyxvQkFBb0IsQ0FBQyxjQUFjLENBQUMsRUFBRTs7QUFFekUsZUFBTyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtPQUM5QixNQUFNLElBQUksR0FBRyxDQUFDLEdBQUcsS0FBSyxjQUFjLENBQUMsR0FBRyxFQUFFOzs7QUFHekMsZUFBTyxLQUFLLENBQUE7T0FDYjtLQUNGOzs7U0EzQ0csVUFBVTtHQUFTLE1BQU07O0FBNkMvQixVQUFVLENBQUMsUUFBUSxFQUFFLENBQUEiLCJmaWxlIjoiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvbW90aW9uLmpzIiwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2UgYmFiZWxcIlxuXG5jb25zdCBfID0gcmVxdWlyZShcInVuZGVyc2NvcmUtcGx1c1wiKVxuY29uc3Qge1BvaW50LCBSYW5nZX0gPSByZXF1aXJlKFwiYXRvbVwiKVxuXG5jb25zdCB7XG4gIG1vdmVDdXJzb3JMZWZ0LFxuICBtb3ZlQ3Vyc29yUmlnaHQsXG4gIG1vdmVDdXJzb3JVcFNjcmVlbixcbiAgbW92ZUN1cnNvckRvd25TY3JlZW4sXG4gIHBvaW50SXNBdFZpbUVuZE9mRmlsZSxcbiAgZ2V0Rmlyc3RWaXNpYmxlU2NyZWVuUm93LFxuICBnZXRMYXN0VmlzaWJsZVNjcmVlblJvdyxcbiAgZ2V0VmFsaWRWaW1TY3JlZW5Sb3csXG4gIGdldFZhbGlkVmltQnVmZmVyUm93LFxuICBtb3ZlQ3Vyc29yVG9GaXJzdENoYXJhY3RlckF0Um93LFxuICBzb3J0UmFuZ2VzLFxuICBwb2ludElzT25XaGl0ZVNwYWNlLFxuICBtb3ZlQ3Vyc29yVG9OZXh0Tm9uV2hpdGVzcGFjZSxcbiAgaXNFbXB0eVJvdyxcbiAgZ2V0Q29kZUZvbGRSb3dSYW5nZXMsXG4gIGdldExhcmdlc3RGb2xkUmFuZ2VDb250YWluc0J1ZmZlclJvdyxcbiAgaXNJbmNsdWRlRnVuY3Rpb25TY29wZUZvclJvdyxcbiAgZGV0ZWN0U2NvcGVTdGFydFBvc2l0aW9uRm9yU2NvcGUsXG4gIGdldEJ1ZmZlclJvd3MsXG4gIGdldFRleHRJblNjcmVlblJhbmdlLFxuICBzZXRCdWZmZXJSb3csXG4gIHNldEJ1ZmZlckNvbHVtbixcbiAgbGltaXROdW1iZXIsXG4gIGdldEluZGV4LFxuICBzbWFydFNjcm9sbFRvQnVmZmVyUG9zaXRpb24sXG4gIHBvaW50SXNBdEVuZE9mTGluZUF0Tm9uRW1wdHlSb3csXG4gIGdldEVuZE9mTGluZUZvckJ1ZmZlclJvdyxcbiAgZmluZFJhbmdlSW5CdWZmZXJSb3csXG4gIHNhdmVFZGl0b3JTdGF0ZSxcbiAgZ2V0TGlzdCxcbiAgZ2V0U2NyZWVuUG9zaXRpb25Gb3JTY3JlZW5Sb3csXG59ID0gcmVxdWlyZShcIi4vdXRpbHNcIilcblxuY29uc3QgQmFzZSA9IHJlcXVpcmUoXCIuL2Jhc2VcIilcblxuY2xhc3MgTW90aW9uIGV4dGVuZHMgQmFzZSB7XG4gIHN0YXRpYyBvcGVyYXRpb25LaW5kID0gXCJtb3Rpb25cIlxuICBpbmNsdXNpdmUgPSBmYWxzZVxuICB3aXNlID0gXCJjaGFyYWN0ZXJ3aXNlXCJcbiAganVtcCA9IGZhbHNlXG4gIHZlcnRpY2FsTW90aW9uID0gZmFsc2VcbiAgbW92ZVN1Y2NlZWRlZCA9IG51bGxcbiAgbW92ZVN1Y2Nlc3NPbkxpbmV3aXNlID0gZmFsc2VcbiAgc2VsZWN0U3VjY2VlZGVkID0gZmFsc2VcblxuICBpc0xpbmV3aXNlKCkge1xuICAgIHJldHVybiB0aGlzLndpc2UgPT09IFwibGluZXdpc2VcIlxuICB9XG5cbiAgaXNCbG9ja3dpc2UoKSB7XG4gICAgcmV0dXJuIHRoaXMud2lzZSA9PT0gXCJibG9ja3dpc2VcIlxuICB9XG5cbiAgZm9yY2VXaXNlKHdpc2UpIHtcbiAgICBpZiAod2lzZSA9PT0gXCJjaGFyYWN0ZXJ3aXNlXCIpIHtcbiAgICAgIHRoaXMuaW5jbHVzaXZlID0gdGhpcy53aXNlID09PSBcImxpbmV3aXNlXCIgPyBmYWxzZSA6ICF0aGlzLmluY2x1c2l2ZVxuICAgIH1cbiAgICB0aGlzLndpc2UgPSB3aXNlXG4gIH1cblxuICByZXNldFN0YXRlKCkge1xuICAgIHRoaXMuc2VsZWN0U3VjY2VlZGVkID0gZmFsc2VcbiAgfVxuXG4gIHNldEJ1ZmZlclBvc2l0aW9uU2FmZWx5KGN1cnNvciwgcG9pbnQpIHtcbiAgICBpZiAocG9pbnQpIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihwb2ludClcbiAgfVxuXG4gIHNldFNjcmVlblBvc2l0aW9uU2FmZWx5KGN1cnNvciwgcG9pbnQpIHtcbiAgICBpZiAocG9pbnQpIGN1cnNvci5zZXRTY3JlZW5Qb3NpdGlvbihwb2ludClcbiAgfVxuXG4gIG1vdmVXaXRoU2F2ZUp1bXAoY3Vyc29yKSB7XG4gICAgbGV0IGN1cnNvclBvc2l0aW9uXG4gICAgaWYgKGN1cnNvci5pc0xhc3RDdXJzb3IoKSAmJiB0aGlzLmp1bXApIHtcbiAgICAgIGN1cnNvclBvc2l0aW9uID0gY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKClcbiAgICB9XG5cbiAgICB0aGlzLm1vdmVDdXJzb3IoY3Vyc29yKVxuXG4gICAgaWYgKGN1cnNvclBvc2l0aW9uICYmICFjdXJzb3JQb3NpdGlvbi5pc0VxdWFsKGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpKSkge1xuICAgICAgdGhpcy52aW1TdGF0ZS5tYXJrLnNldChcImBcIiwgY3Vyc29yUG9zaXRpb24pXG4gICAgICB0aGlzLnZpbVN0YXRlLm1hcmsuc2V0KFwiJ1wiLCBjdXJzb3JQb3NpdGlvbilcbiAgICB9XG4gIH1cblxuICBleGVjdXRlKCkge1xuICAgIGlmICh0aGlzLm9wZXJhdG9yKSB7XG4gICAgICB0aGlzLnNlbGVjdCgpXG4gICAgfSBlbHNlIHtcbiAgICAgIGZvciAoY29uc3QgY3Vyc29yIG9mIHRoaXMuZWRpdG9yLmdldEN1cnNvcnMoKSkge1xuICAgICAgICB0aGlzLm1vdmVXaXRoU2F2ZUp1bXAoY3Vyc29yKVxuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLmVkaXRvci5tZXJnZUN1cnNvcnMoKVxuICAgIHRoaXMuZWRpdG9yLm1lcmdlSW50ZXJzZWN0aW5nU2VsZWN0aW9ucygpXG4gIH1cblxuICAvLyBOT1RFOiBNb2RpZnkgc2VsZWN0aW9uIGJ5IG1vZHRpb24sIHNlbGVjdGlvbiBpcyBhbHJlYWR5IFwibm9ybWFsaXplZFwiIGJlZm9yZSB0aGlzIGZ1bmN0aW9uIGlzIGNhbGxlZC5cbiAgc2VsZWN0KCkge1xuICAgIC8vIG5lZWQgdG8gY2FyZSB3YXMgdmlzdWFsIGZvciBgLmAgcmVwZWF0ZWQuXG4gICAgY29uc3QgaXNPcldhc1Zpc3VhbCA9ICh0aGlzLm9wZXJhdG9yICYmIHRoaXMub3BlcmF0b3IuaW5zdGFuY2VvZihcIlNlbGVjdEJhc2VcIikpIHx8IHRoaXMuaXMoXCJDdXJyZW50U2VsZWN0aW9uXCIpXG5cbiAgICBmb3IgKGNvbnN0IHNlbGVjdGlvbiBvZiB0aGlzLmVkaXRvci5nZXRTZWxlY3Rpb25zKCkpIHtcbiAgICAgIHNlbGVjdGlvbi5tb2RpZnlTZWxlY3Rpb24oKCkgPT4gdGhpcy5tb3ZlV2l0aFNhdmVKdW1wKHNlbGVjdGlvbi5jdXJzb3IpKVxuXG4gICAgICBjb25zdCBzZWxlY3RTdWNjZWVkZWQgPVxuICAgICAgICB0aGlzLm1vdmVTdWNjZWVkZWQgIT0gbnVsbFxuICAgICAgICAgID8gdGhpcy5tb3ZlU3VjY2VlZGVkXG4gICAgICAgICAgOiAhc2VsZWN0aW9uLmlzRW1wdHkoKSB8fCAodGhpcy5pc0xpbmV3aXNlKCkgJiYgdGhpcy5tb3ZlU3VjY2Vzc09uTGluZXdpc2UpXG4gICAgICBpZiAoIXRoaXMuc2VsZWN0U3VjY2VlZGVkKSB0aGlzLnNlbGVjdFN1Y2NlZWRlZCA9IHNlbGVjdFN1Y2NlZWRlZFxuXG4gICAgICBpZiAoaXNPcldhc1Zpc3VhbCB8fCAoc2VsZWN0U3VjY2VlZGVkICYmICh0aGlzLmluY2x1c2l2ZSB8fCB0aGlzLmlzTGluZXdpc2UoKSkpKSB7XG4gICAgICAgIGNvbnN0ICRzZWxlY3Rpb24gPSB0aGlzLnN3cmFwKHNlbGVjdGlvbilcbiAgICAgICAgJHNlbGVjdGlvbi5zYXZlUHJvcGVydGllcyh0cnVlKSAvLyBzYXZlIHByb3BlcnR5IG9mIFwiYWxyZWFkeS1ub3JtYWxpemVkLXNlbGVjdGlvblwiXG4gICAgICAgICRzZWxlY3Rpb24uYXBwbHlXaXNlKHRoaXMud2lzZSlcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodGhpcy53aXNlID09PSBcImJsb2Nrd2lzZVwiKSB7XG4gICAgICB0aGlzLnZpbVN0YXRlLmdldExhc3RCbG9ja3dpc2VTZWxlY3Rpb24oKS5hdXRvc2Nyb2xsKClcbiAgICB9XG4gIH1cblxuICBzZXRDdXJzb3JCdWZmZXJSb3coY3Vyc29yLCByb3csIG9wdGlvbnMpIHtcbiAgICBpZiAodGhpcy52ZXJ0aWNhbE1vdGlvbiAmJiAhdGhpcy5nZXRDb25maWcoXCJzdGF5T25WZXJ0aWNhbE1vdGlvblwiKSkge1xuICAgICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHRoaXMuZ2V0Rmlyc3RDaGFyYWN0ZXJQb3NpdGlvbkZvckJ1ZmZlclJvdyhyb3cpLCBvcHRpb25zKVxuICAgIH0gZWxzZSB7XG4gICAgICBzZXRCdWZmZXJSb3coY3Vyc29yLCByb3csIG9wdGlvbnMpXG4gICAgfVxuICB9XG5cbiAgLy8gW05PVEVdXG4gIC8vIFNpbmNlIHRoaXMgZnVuY3Rpb24gY2hlY2tzIGN1cnNvciBwb3NpdGlvbiBjaGFuZ2UsIGEgY3Vyc29yIHBvc2l0aW9uIE1VU1QgYmVcbiAgLy8gdXBkYXRlZCBJTiBjYWxsYmFjayg9Zm4pXG4gIC8vIFVwZGF0aW5nIHBvaW50IG9ubHkgaW4gY2FsbGJhY2sgaXMgd3JvbmctdXNlIG9mIHRoaXMgZnVuY2l0b24sXG4gIC8vIHNpbmNlIGl0IHN0b3BzIGltbWVkaWF0ZWx5IGJlY2F1c2Ugb2Ygbm90IGN1cnNvciBwb3NpdGlvbiBjaGFuZ2UuXG4gIG1vdmVDdXJzb3JDb3VudFRpbWVzKGN1cnNvciwgZm4pIHtcbiAgICBsZXQgb2xkUG9zaXRpb24gPSBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuICAgIHRoaXMuY291bnRUaW1lcyh0aGlzLmdldENvdW50KCksIHN0YXRlID0+IHtcbiAgICAgIGZuKHN0YXRlKVxuICAgICAgY29uc3QgbmV3UG9zaXRpb24gPSBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuICAgICAgaWYgKG5ld1Bvc2l0aW9uLmlzRXF1YWwob2xkUG9zaXRpb24pKSBzdGF0ZS5zdG9wKClcbiAgICAgIG9sZFBvc2l0aW9uID0gbmV3UG9zaXRpb25cbiAgICB9KVxuICB9XG5cbiAgaXNDYXNlU2Vuc2l0aXZlKHRlcm0pIHtcbiAgICByZXR1cm4gdGhpcy5nZXRDb25maWcoYHVzZVNtYXJ0Y2FzZUZvciR7dGhpcy5jYXNlU2Vuc2l0aXZpdHlLaW5kfWApXG4gICAgICA/IHRlcm0uc2VhcmNoKC9bQS1aXS8pICE9PSAtMVxuICAgICAgOiAhdGhpcy5nZXRDb25maWcoYGlnbm9yZUNhc2VGb3Ike3RoaXMuY2FzZVNlbnNpdGl2aXR5S2luZH1gKVxuICB9XG59XG5Nb3Rpb24ucmVnaXN0ZXIoZmFsc2UpXG5cbi8vIFVzZWQgYXMgb3BlcmF0b3IncyB0YXJnZXQgaW4gdmlzdWFsLW1vZGUuXG5jbGFzcyBDdXJyZW50U2VsZWN0aW9uIGV4dGVuZHMgTW90aW9uIHtcbiAgc2VsZWN0aW9uRXh0ZW50ID0gbnVsbFxuICBibG9ja3dpc2VTZWxlY3Rpb25FeHRlbnQgPSBudWxsXG4gIGluY2x1c2l2ZSA9IHRydWVcblxuICBpbml0aWFsaXplKCkge1xuICAgIHRoaXMucG9pbnRJbmZvQnlDdXJzb3IgPSBuZXcgTWFwKClcbiAgICByZXR1cm4gc3VwZXIuaW5pdGlhbGl6ZSgpXG4gIH1cblxuICBtb3ZlQ3Vyc29yKGN1cnNvcikge1xuICAgIGlmICh0aGlzLm1vZGUgPT09IFwidmlzdWFsXCIpIHtcbiAgICAgIHRoaXMuc2VsZWN0aW9uRXh0ZW50ID0gdGhpcy5pc0Jsb2Nrd2lzZSgpXG4gICAgICAgID8gdGhpcy5zd3JhcChjdXJzb3Iuc2VsZWN0aW9uKS5nZXRCbG9ja3dpc2VTZWxlY3Rpb25FeHRlbnQoKVxuICAgICAgICA6IHRoaXMuZWRpdG9yLmdldFNlbGVjdGVkQnVmZmVyUmFuZ2UoKS5nZXRFeHRlbnQoKVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBgLmAgcmVwZWF0IGNhc2VcbiAgICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKS50cmFuc2xhdGUodGhpcy5zZWxlY3Rpb25FeHRlbnQpKVxuICAgIH1cbiAgfVxuXG4gIHNlbGVjdCgpIHtcbiAgICBpZiAodGhpcy5tb2RlID09PSBcInZpc3VhbFwiKSB7XG4gICAgICBzdXBlci5zZWxlY3QoKVxuICAgIH0gZWxzZSB7XG4gICAgICBmb3IgKGNvbnN0IGN1cnNvciBvZiB0aGlzLmVkaXRvci5nZXRDdXJzb3JzKCkpIHtcbiAgICAgICAgY29uc3QgcG9pbnRJbmZvID0gdGhpcy5wb2ludEluZm9CeUN1cnNvci5nZXQoY3Vyc29yKVxuICAgICAgICBpZiAocG9pbnRJbmZvKSB7XG4gICAgICAgICAgY29uc3Qge2N1cnNvclBvc2l0aW9uLCBzdGFydE9mU2VsZWN0aW9ufSA9IHBvaW50SW5mb1xuICAgICAgICAgIGlmIChjdXJzb3JQb3NpdGlvbi5pc0VxdWFsKGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpKSkge1xuICAgICAgICAgICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHN0YXJ0T2ZTZWxlY3Rpb24pXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBzdXBlci5zZWxlY3QoKVxuICAgIH1cblxuICAgIC8vICogUHVycG9zZSBvZiBwb2ludEluZm9CeUN1cnNvcj8gc2VlICMyMzUgZm9yIGRldGFpbC5cbiAgICAvLyBXaGVuIHN0YXlPblRyYW5zZm9ybVN0cmluZyBpcyBlbmFibGVkLCBjdXJzb3IgcG9zIGlzIG5vdCBzZXQgb24gc3RhcnQgb2ZcbiAgICAvLyBvZiBzZWxlY3RlZCByYW5nZS5cbiAgICAvLyBCdXQgSSB3YW50IGZvbGxvd2luZyBiZWhhdmlvciwgc28gbmVlZCB0byBwcmVzZXJ2ZSBwb3NpdGlvbiBpbmZvLlxuICAgIC8vICAxLiBgdmo+LmAgLT4gaW5kZW50IHNhbWUgdHdvIHJvd3MgcmVnYXJkbGVzcyBvZiBjdXJyZW50IGN1cnNvcidzIHJvdy5cbiAgICAvLyAgMi4gYHZqPmouYCAtPiBpbmRlbnQgdHdvIHJvd3MgZnJvbSBjdXJzb3IncyByb3cuXG4gICAgZm9yIChjb25zdCBjdXJzb3Igb2YgdGhpcy5lZGl0b3IuZ2V0Q3Vyc29ycygpKSB7XG4gICAgICBjb25zdCBzdGFydE9mU2VsZWN0aW9uID0gY3Vyc29yLnNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpLnN0YXJ0XG4gICAgICB0aGlzLm9uRGlkRmluaXNoT3BlcmF0aW9uKCgpID0+IHtcbiAgICAgICAgY3Vyc29yUG9zaXRpb24gPSBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuICAgICAgICB0aGlzLnBvaW50SW5mb0J5Q3Vyc29yLnNldChjdXJzb3IsIHtzdGFydE9mU2VsZWN0aW9uLCBjdXJzb3JQb3NpdGlvbn0pXG4gICAgICB9KVxuICAgIH1cbiAgfVxufVxuQ3VycmVudFNlbGVjdGlvbi5yZWdpc3RlcihmYWxzZSlcblxuY2xhc3MgTW92ZUxlZnQgZXh0ZW5kcyBNb3Rpb24ge1xuICBtb3ZlQ3Vyc29yKGN1cnNvcikge1xuICAgIGNvbnN0IGFsbG93V3JhcCA9IHRoaXMuZ2V0Q29uZmlnKFwid3JhcExlZnRSaWdodE1vdGlvblwiKVxuICAgIHRoaXMubW92ZUN1cnNvckNvdW50VGltZXMoY3Vyc29yLCAoKSA9PiBtb3ZlQ3Vyc29yTGVmdChjdXJzb3IsIHthbGxvd1dyYXB9KSlcbiAgfVxufVxuTW92ZUxlZnQucmVnaXN0ZXIoKVxuXG5jbGFzcyBNb3ZlUmlnaHQgZXh0ZW5kcyBNb3Rpb24ge1xuICBjYW5XcmFwVG9OZXh0TGluZShjdXJzb3IpIHtcbiAgICBpZiAodGhpcy5pc0FzVGFyZ2V0RXhjZXB0U2VsZWN0SW5WaXN1YWxNb2RlKCkgJiYgIWN1cnNvci5pc0F0RW5kT2ZMaW5lKCkpIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5nZXRDb25maWcoXCJ3cmFwTGVmdFJpZ2h0TW90aW9uXCIpXG4gICAgfVxuICB9XG5cbiAgbW92ZUN1cnNvcihjdXJzb3IpIHtcbiAgICB0aGlzLm1vdmVDdXJzb3JDb3VudFRpbWVzKGN1cnNvciwgKCkgPT4ge1xuICAgICAgY29uc3QgY3Vyc29yUG9zaXRpb24gPSBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuICAgICAgdGhpcy5lZGl0b3IudW5mb2xkQnVmZmVyUm93KGN1cnNvclBvc2l0aW9uLnJvdylcbiAgICAgIGNvbnN0IGFsbG93V3JhcCA9IHRoaXMuY2FuV3JhcFRvTmV4dExpbmUoY3Vyc29yKVxuICAgICAgbW92ZUN1cnNvclJpZ2h0KGN1cnNvcilcbiAgICAgIGlmIChjdXJzb3IuaXNBdEVuZE9mTGluZSgpICYmIGFsbG93V3JhcCAmJiAhcG9pbnRJc0F0VmltRW5kT2ZGaWxlKHRoaXMuZWRpdG9yLCBjdXJzb3JQb3NpdGlvbikpIHtcbiAgICAgICAgbW92ZUN1cnNvclJpZ2h0KGN1cnNvciwge2FsbG93V3JhcH0pXG4gICAgICB9XG4gICAgfSlcbiAgfVxufVxuTW92ZVJpZ2h0LnJlZ2lzdGVyKClcblxuY2xhc3MgTW92ZVJpZ2h0QnVmZmVyQ29sdW1uIGV4dGVuZHMgTW90aW9uIHtcbiAgbW92ZUN1cnNvcihjdXJzb3IpIHtcbiAgICBzZXRCdWZmZXJDb2x1bW4oY3Vyc29yLCBjdXJzb3IuZ2V0QnVmZmVyQ29sdW1uKCkgKyB0aGlzLmdldENvdW50KCkpXG4gIH1cbn1cbk1vdmVSaWdodEJ1ZmZlckNvbHVtbi5yZWdpc3RlcihmYWxzZSlcblxuY2xhc3MgTW92ZVVwIGV4dGVuZHMgTW90aW9uIHtcbiAgd2lzZSA9IFwibGluZXdpc2VcIlxuICB3cmFwID0gZmFsc2VcblxuICBnZXRCdWZmZXJSb3cocm93KSB7XG4gICAgY29uc3QgbWluID0gMFxuICAgIHJvdyA9IHRoaXMud3JhcCAmJiByb3cgPT09IG1pbiA/IHRoaXMuZ2V0VmltTGFzdEJ1ZmZlclJvdygpIDogbGltaXROdW1iZXIocm93IC0gMSwge21pbn0pXG4gICAgcmV0dXJuIHRoaXMuZ2V0Rm9sZFN0YXJ0Um93Rm9yUm93KHJvdylcbiAgfVxuXG4gIG1vdmVDdXJzb3IoY3Vyc29yKSB7XG4gICAgdGhpcy5tb3ZlQ3Vyc29yQ291bnRUaW1lcyhjdXJzb3IsICgpID0+IHNldEJ1ZmZlclJvdyhjdXJzb3IsIHRoaXMuZ2V0QnVmZmVyUm93KGN1cnNvci5nZXRCdWZmZXJSb3coKSkpKVxuICB9XG59XG5Nb3ZlVXAucmVnaXN0ZXIoKVxuXG5jbGFzcyBNb3ZlVXBXcmFwIGV4dGVuZHMgTW92ZVVwIHtcbiAgd3JhcCA9IHRydWVcbn1cbk1vdmVVcFdyYXAucmVnaXN0ZXIoKVxuXG5jbGFzcyBNb3ZlRG93biBleHRlbmRzIE1vdmVVcCB7XG4gIHdpc2UgPSBcImxpbmV3aXNlXCJcbiAgd3JhcCA9IGZhbHNlXG5cbiAgZ2V0QnVmZmVyUm93KHJvdykge1xuICAgIGlmICh0aGlzLmVkaXRvci5pc0ZvbGRlZEF0QnVmZmVyUm93KHJvdykpIHtcbiAgICAgIHJvdyA9IGdldExhcmdlc3RGb2xkUmFuZ2VDb250YWluc0J1ZmZlclJvdyh0aGlzLmVkaXRvciwgcm93KS5lbmQucm93XG4gICAgfVxuICAgIGNvbnN0IG1heCA9IHRoaXMuZ2V0VmltTGFzdEJ1ZmZlclJvdygpXG4gICAgcmV0dXJuIHRoaXMud3JhcCAmJiByb3cgPj0gbWF4ID8gMCA6IGxpbWl0TnVtYmVyKHJvdyArIDEsIHttYXh9KVxuICB9XG59XG5Nb3ZlRG93bi5yZWdpc3RlcigpXG5cbmNsYXNzIE1vdmVEb3duV3JhcCBleHRlbmRzIE1vdmVEb3duIHtcbiAgd3JhcCA9IHRydWVcbn1cbk1vdmVEb3duV3JhcC5yZWdpc3RlcigpXG5cbmNsYXNzIE1vdmVVcFNjcmVlbiBleHRlbmRzIE1vdGlvbiB7XG4gIHdpc2UgPSBcImxpbmV3aXNlXCJcbiAgZGlyZWN0aW9uID0gXCJ1cFwiXG4gIG1vdmVDdXJzb3IoY3Vyc29yKSB7XG4gICAgdGhpcy5tb3ZlQ3Vyc29yQ291bnRUaW1lcyhjdXJzb3IsICgpID0+IG1vdmVDdXJzb3JVcFNjcmVlbihjdXJzb3IpKVxuICB9XG59XG5Nb3ZlVXBTY3JlZW4ucmVnaXN0ZXIoKVxuXG5jbGFzcyBNb3ZlRG93blNjcmVlbiBleHRlbmRzIE1vdmVVcFNjcmVlbiB7XG4gIHdpc2UgPSBcImxpbmV3aXNlXCJcbiAgZGlyZWN0aW9uID0gXCJkb3duXCJcbiAgbW92ZUN1cnNvcihjdXJzb3IpIHtcbiAgICB0aGlzLm1vdmVDdXJzb3JDb3VudFRpbWVzKGN1cnNvciwgKCkgPT4gbW92ZUN1cnNvckRvd25TY3JlZW4oY3Vyc29yKSlcbiAgfVxufVxuTW92ZURvd25TY3JlZW4ucmVnaXN0ZXIoKVxuXG4vLyBNb3ZlIGRvd24vdXAgdG8gRWRnZVxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gU2VlIHQ5bWQvYXRvbS12aW0tbW9kZS1wbHVzIzIzNlxuLy8gQXQgbGVhc3QgdjEuNy4wLiBidWZmZXJQb3NpdGlvbiBhbmQgc2NyZWVuUG9zaXRpb24gY2Fubm90IGNvbnZlcnQgYWNjdXJhdGVseVxuLy8gd2hlbiByb3cgaXMgZm9sZGVkLlxuY2xhc3MgTW92ZVVwVG9FZGdlIGV4dGVuZHMgTW90aW9uIHtcbiAgd2lzZSA9IFwibGluZXdpc2VcIlxuICBqdW1wID0gdHJ1ZVxuICBkaXJlY3Rpb24gPSBcInVwXCJcbiAgbW92ZUN1cnNvcihjdXJzb3IpIHtcbiAgICB0aGlzLm1vdmVDdXJzb3JDb3VudFRpbWVzKGN1cnNvciwgKCkgPT4ge1xuICAgICAgdGhpcy5zZXRTY3JlZW5Qb3NpdGlvblNhZmVseShjdXJzb3IsIHRoaXMuZ2V0UG9pbnQoY3Vyc29yLmdldFNjcmVlblBvc2l0aW9uKCkpKVxuICAgIH0pXG4gIH1cblxuICBnZXRQb2ludChmcm9tUG9pbnQpIHtcbiAgICBjb25zdCB7Y29sdW1ufSA9IGZyb21Qb2ludFxuICAgIGZvciAoY29uc3Qgcm93IG9mIHRoaXMuZ2V0U2NhblJvd3MoZnJvbVBvaW50KSkge1xuICAgICAgY29uc3QgcG9pbnQgPSBuZXcgUG9pbnQocm93LCBjb2x1bW4pXG4gICAgICBpZiAodGhpcy5pc0VkZ2UocG9pbnQpKSByZXR1cm4gcG9pbnRcbiAgICB9XG4gIH1cblxuICBnZXRTY2FuUm93cyh7cm93fSkge1xuICAgIHJldHVybiB0aGlzLmRpcmVjdGlvbiA9PT0gXCJ1cFwiXG4gICAgICA/IGdldExpc3QoZ2V0VmFsaWRWaW1TY3JlZW5Sb3codGhpcy5lZGl0b3IsIHJvdyAtIDEpLCAwLCB0cnVlKVxuICAgICAgOiBnZXRMaXN0KGdldFZhbGlkVmltU2NyZWVuUm93KHRoaXMuZWRpdG9yLCByb3cgKyAxKSwgdGhpcy5nZXRWaW1MYXN0U2NyZWVuUm93KCksIHRydWUpXG4gIH1cblxuICBpc0VkZ2UocG9pbnQpIHtcbiAgICBpZiAodGhpcy5pc1N0b3BwYWJsZVBvaW50KHBvaW50KSkge1xuICAgICAgLy8gSWYgb25lIG9mIGFib3ZlL2JlbG93IHBvaW50IHdhcyBub3Qgc3RvcHBhYmxlLCBpdCdzIEVkZ2UhXG4gICAgICBjb25zdCBhYm92ZSA9IHBvaW50LnRyYW5zbGF0ZShbLTEsIDBdKVxuICAgICAgY29uc3QgYmVsb3cgPSBwb2ludC50cmFuc2xhdGUoWysxLCAwXSlcbiAgICAgIHJldHVybiAhdGhpcy5pc1N0b3BwYWJsZVBvaW50KGFib3ZlKSB8fCAhdGhpcy5pc1N0b3BwYWJsZVBvaW50KGJlbG93KVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG4gIH1cblxuICBpc1N0b3BwYWJsZVBvaW50KHBvaW50KSB7XG4gICAgaWYgKHRoaXMuaXNOb25XaGl0ZVNwYWNlUG9pbnQocG9pbnQpIHx8IHRoaXMuaXNGaXJzdFJvd09yTGFzdFJvd0FuZFN0b3BwYWJsZShwb2ludCkpIHtcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGxlZnRQb2ludCA9IHBvaW50LnRyYW5zbGF0ZShbMCwgLTFdKVxuICAgICAgY29uc3QgcmlnaHRQb2ludCA9IHBvaW50LnRyYW5zbGF0ZShbMCwgKzFdKVxuICAgICAgcmV0dXJuIHRoaXMuaXNOb25XaGl0ZVNwYWNlUG9pbnQobGVmdFBvaW50KSAmJiB0aGlzLmlzTm9uV2hpdGVTcGFjZVBvaW50KHJpZ2h0UG9pbnQpXG4gICAgfVxuICB9XG5cbiAgaXNOb25XaGl0ZVNwYWNlUG9pbnQocG9pbnQpIHtcbiAgICBjb25zdCBjaGFyID0gZ2V0VGV4dEluU2NyZWVuUmFuZ2UodGhpcy5lZGl0b3IsIFJhbmdlLmZyb21Qb2ludFdpdGhEZWx0YShwb2ludCwgMCwgMSkpXG4gICAgcmV0dXJuIGNoYXIgIT0gbnVsbCAmJiAvXFxTLy50ZXN0KGNoYXIpXG4gIH1cblxuICBpc0ZpcnN0Um93T3JMYXN0Um93QW5kU3RvcHBhYmxlKHBvaW50KSB7XG4gICAgLy8gSW4gbm9ybWFsLW1vZGUgd2UgYWRqdXN0IGN1cnNvciBieSBtb3ZpbmctbGVmdCBpZiBjdXJzb3IgYXQgRU9MIG9mIG5vbi1ibGFuayByb3cuXG4gICAgLy8gU28gZXhwbGljaXRseSBndWFyZCB0byBub3QgYW5zd2VyIGl0IHN0b3BwYWJsZS5cbiAgICBpZiAodGhpcy5pc01vZGUoXCJub3JtYWxcIikgJiYgcG9pbnRJc0F0RW5kT2ZMaW5lQXROb25FbXB0eVJvdyh0aGlzLmVkaXRvciwgcG9pbnQpKSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgcG9pbnQuaXNFcXVhbCh0aGlzLmVkaXRvci5jbGlwU2NyZWVuUG9zaXRpb24ocG9pbnQpKSAmJlxuICAgICAgICAocG9pbnQucm93ID09PSAwIHx8IHBvaW50LnJvdyA9PT0gdGhpcy5nZXRWaW1MYXN0U2NyZWVuUm93KCkpXG4gICAgICApXG4gICAgfVxuICB9XG59XG5Nb3ZlVXBUb0VkZ2UucmVnaXN0ZXIoKVxuXG5jbGFzcyBNb3ZlRG93blRvRWRnZSBleHRlbmRzIE1vdmVVcFRvRWRnZSB7XG4gIGRpcmVjdGlvbiA9IFwiZG93blwiXG59XG5Nb3ZlRG93blRvRWRnZS5yZWdpc3RlcigpXG5cbi8vIHdvcmRcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIE1vdmVUb05leHRXb3JkIGV4dGVuZHMgTW90aW9uIHtcbiAgd29yZFJlZ2V4ID0gbnVsbFxuXG4gIGdldFBvaW50KHJlZ2V4LCBmcm9tKSB7XG4gICAgbGV0IHdvcmRSYW5nZVxuICAgIGxldCBmb3VuZCA9IGZhbHNlXG5cbiAgICB0aGlzLnNjYW5Gb3J3YXJkKHJlZ2V4LCB7ZnJvbX0sIGZ1bmN0aW9uKHtyYW5nZSwgbWF0Y2hUZXh0LCBzdG9wfSkge1xuICAgICAgd29yZFJhbmdlID0gcmFuZ2VcbiAgICAgIC8vIElnbm9yZSAnZW1wdHkgbGluZScgbWF0Y2hlcyBiZXR3ZWVuICdcXHInIGFuZCAnXFxuJ1xuICAgICAgaWYgKG1hdGNoVGV4dCA9PT0gXCJcIiAmJiByYW5nZS5zdGFydC5jb2x1bW4gIT09IDApIHJldHVyblxuICAgICAgaWYgKHJhbmdlLnN0YXJ0LmlzR3JlYXRlclRoYW4oZnJvbSkpIHtcbiAgICAgICAgZm91bmQgPSB0cnVlXG4gICAgICAgIHN0b3AoKVxuICAgICAgfVxuICAgIH0pXG5cbiAgICBpZiAoZm91bmQpIHtcbiAgICAgIGNvbnN0IHBvaW50ID0gd29yZFJhbmdlLnN0YXJ0XG4gICAgICByZXR1cm4gcG9pbnRJc0F0RW5kT2ZMaW5lQXROb25FbXB0eVJvdyh0aGlzLmVkaXRvciwgcG9pbnQpICYmICFwb2ludC5pc0VxdWFsKHRoaXMuZ2V0VmltRW9mQnVmZmVyUG9zaXRpb24oKSlcbiAgICAgICAgPyBwb2ludC50cmF2ZXJzZShbMSwgMF0pXG4gICAgICAgIDogcG9pbnRcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHdvcmRSYW5nZSA/IHdvcmRSYW5nZS5lbmQgOiBmcm9tXG4gICAgfVxuICB9XG5cbiAgLy8gU3BlY2lhbCBjYXNlOiBcImN3XCIgYW5kIFwiY1dcIiBhcmUgdHJlYXRlZCBsaWtlIFwiY2VcIiBhbmQgXCJjRVwiIGlmIHRoZSBjdXJzb3IgaXNcbiAgLy8gb24gYSBub24tYmxhbmsuICBUaGlzIGlzIGJlY2F1c2UgXCJjd1wiIGlzIGludGVycHJldGVkIGFzIGNoYW5nZS13b3JkLCBhbmQgYVxuICAvLyB3b3JkIGRvZXMgbm90IGluY2x1ZGUgdGhlIGZvbGxvd2luZyB3aGl0ZSBzcGFjZS4gIHtWaTogXCJjd1wiIHdoZW4gb24gYSBibGFua1xuICAvLyBmb2xsb3dlZCBieSBvdGhlciBibGFua3MgY2hhbmdlcyBvbmx5IHRoZSBmaXJzdCBibGFuazsgdGhpcyBpcyBwcm9iYWJseSBhXG4gIC8vIGJ1ZywgYmVjYXVzZSBcImR3XCIgZGVsZXRlcyBhbGwgdGhlIGJsYW5rc31cbiAgLy9cbiAgLy8gQW5vdGhlciBzcGVjaWFsIGNhc2U6IFdoZW4gdXNpbmcgdGhlIFwid1wiIG1vdGlvbiBpbiBjb21iaW5hdGlvbiB3aXRoIGFuXG4gIC8vIG9wZXJhdG9yIGFuZCB0aGUgbGFzdCB3b3JkIG1vdmVkIG92ZXIgaXMgYXQgdGhlIGVuZCBvZiBhIGxpbmUsIHRoZSBlbmQgb2ZcbiAgLy8gdGhhdCB3b3JkIGJlY29tZXMgdGhlIGVuZCBvZiB0aGUgb3BlcmF0ZWQgdGV4dCwgbm90IHRoZSBmaXJzdCB3b3JkIGluIHRoZVxuICAvLyBuZXh0IGxpbmUuXG4gIG1vdmVDdXJzb3IoY3Vyc29yKSB7XG4gICAgY29uc3QgY3Vyc29yUG9zaXRpb24gPSBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuICAgIGlmIChwb2ludElzQXRWaW1FbmRPZkZpbGUodGhpcy5lZGl0b3IsIGN1cnNvclBvc2l0aW9uKSkgcmV0dXJuXG5cbiAgICBjb25zdCB3YXNPbldoaXRlU3BhY2UgPSBwb2ludElzT25XaGl0ZVNwYWNlKHRoaXMuZWRpdG9yLCBjdXJzb3JQb3NpdGlvbilcbiAgICBjb25zdCBpc0FzVGFyZ2V0RXhjZXB0U2VsZWN0SW5WaXN1YWxNb2RlID0gdGhpcy5pc0FzVGFyZ2V0RXhjZXB0U2VsZWN0SW5WaXN1YWxNb2RlKClcblxuICAgIHRoaXMubW92ZUN1cnNvckNvdW50VGltZXMoY3Vyc29yLCAoe2lzRmluYWx9KSA9PiB7XG4gICAgICBjb25zdCBjdXJzb3JQb3NpdGlvbiA9IGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXG4gICAgICBpZiAoaXNFbXB0eVJvdyh0aGlzLmVkaXRvciwgY3Vyc29yUG9zaXRpb24ucm93KSAmJiBpc0FzVGFyZ2V0RXhjZXB0U2VsZWN0SW5WaXN1YWxNb2RlKSB7XG4gICAgICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihjdXJzb3JQb3NpdGlvbi50cmF2ZXJzZShbMSwgMF0pKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgcmVnZXggPSB0aGlzLndvcmRSZWdleCB8fCBjdXJzb3Iud29yZFJlZ0V4cCgpXG4gICAgICAgIGxldCBwb2ludCA9IHRoaXMuZ2V0UG9pbnQocmVnZXgsIGN1cnNvclBvc2l0aW9uKVxuICAgICAgICBpZiAoaXNGaW5hbCAmJiBpc0FzVGFyZ2V0RXhjZXB0U2VsZWN0SW5WaXN1YWxNb2RlKSB7XG4gICAgICAgICAgaWYgKHRoaXMub3BlcmF0b3IuaXMoXCJDaGFuZ2VcIikgJiYgIXdhc09uV2hpdGVTcGFjZSkge1xuICAgICAgICAgICAgcG9pbnQgPSBjdXJzb3IuZ2V0RW5kT2ZDdXJyZW50V29yZEJ1ZmZlclBvc2l0aW9uKHt3b3JkUmVnZXg6IHRoaXMud29yZFJlZ2V4fSlcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcG9pbnQgPSBQb2ludC5taW4ocG9pbnQsIGdldEVuZE9mTGluZUZvckJ1ZmZlclJvdyh0aGlzLmVkaXRvciwgY3Vyc29yUG9zaXRpb24ucm93KSlcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHBvaW50KVxuICAgICAgfVxuICAgIH0pXG4gIH1cbn1cbk1vdmVUb05leHRXb3JkLnJlZ2lzdGVyKClcblxuLy8gYlxuY2xhc3MgTW92ZVRvUHJldmlvdXNXb3JkIGV4dGVuZHMgTW90aW9uIHtcbiAgd29yZFJlZ2V4ID0gbnVsbFxuXG4gIG1vdmVDdXJzb3IoY3Vyc29yKSB7XG4gICAgdGhpcy5tb3ZlQ3Vyc29yQ291bnRUaW1lcyhjdXJzb3IsICgpID0+IHtcbiAgICAgIGNvbnN0IHBvaW50ID0gY3Vyc29yLmdldEJlZ2lubmluZ09mQ3VycmVudFdvcmRCdWZmZXJQb3NpdGlvbih7d29yZFJlZ2V4OiB0aGlzLndvcmRSZWdleH0pXG4gICAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24ocG9pbnQpXG4gICAgfSlcbiAgfVxufVxuTW92ZVRvUHJldmlvdXNXb3JkLnJlZ2lzdGVyKClcblxuY2xhc3MgTW92ZVRvRW5kT2ZXb3JkIGV4dGVuZHMgTW90aW9uIHtcbiAgd29yZFJlZ2V4ID0gbnVsbFxuICBpbmNsdXNpdmUgPSB0cnVlXG5cbiAgbW92ZVRvTmV4dEVuZE9mV29yZChjdXJzb3IpIHtcbiAgICBtb3ZlQ3Vyc29yVG9OZXh0Tm9uV2hpdGVzcGFjZShjdXJzb3IpXG4gICAgY29uc3QgcG9pbnQgPSBjdXJzb3IuZ2V0RW5kT2ZDdXJyZW50V29yZEJ1ZmZlclBvc2l0aW9uKHt3b3JkUmVnZXg6IHRoaXMud29yZFJlZ2V4fSkudHJhbnNsYXRlKFswLCAtMV0pXG4gICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKFBvaW50Lm1pbihwb2ludCwgdGhpcy5nZXRWaW1Fb2ZCdWZmZXJQb3NpdGlvbigpKSlcbiAgfVxuXG4gIG1vdmVDdXJzb3IoY3Vyc29yKSB7XG4gICAgdGhpcy5tb3ZlQ3Vyc29yQ291bnRUaW1lcyhjdXJzb3IsICgpID0+IHtcbiAgICAgIGNvbnN0IG9yaWdpbmFsUG9pbnQgPSBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuICAgICAgdGhpcy5tb3ZlVG9OZXh0RW5kT2ZXb3JkKGN1cnNvcilcbiAgICAgIGlmIChvcmlnaW5hbFBvaW50LmlzRXF1YWwoY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKCkpKSB7XG4gICAgICAgIC8vIFJldHJ5IGZyb20gcmlnaHQgY29sdW1uIGlmIGN1cnNvciB3YXMgYWxyZWFkeSBvbiBFbmRPZldvcmRcbiAgICAgICAgY3Vyc29yLm1vdmVSaWdodCgpXG4gICAgICAgIHRoaXMubW92ZVRvTmV4dEVuZE9mV29yZChjdXJzb3IpXG4gICAgICB9XG4gICAgfSlcbiAgfVxufVxuTW92ZVRvRW5kT2ZXb3JkLnJlZ2lzdGVyKClcblxuLy8gW1RPRE86IEltcHJvdmUsIGFjY3VyYWN5XVxuY2xhc3MgTW92ZVRvUHJldmlvdXNFbmRPZldvcmQgZXh0ZW5kcyBNb3ZlVG9QcmV2aW91c1dvcmQge1xuICBpbmNsdXNpdmUgPSB0cnVlXG5cbiAgbW92ZUN1cnNvcihjdXJzb3IpIHtcbiAgICBjb25zdCB3b3JkUmFuZ2UgPSBjdXJzb3IuZ2V0Q3VycmVudFdvcmRCdWZmZXJSYW5nZSgpXG4gICAgY29uc3QgY3Vyc29yUG9zaXRpb24gPSBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuXG4gICAgLy8gaWYgd2UncmUgaW4gdGhlIG1pZGRsZSBvZiBhIHdvcmQgdGhlbiB3ZSBuZWVkIHRvIG1vdmUgdG8gaXRzIHN0YXJ0XG4gICAgbGV0IHRpbWVzID0gdGhpcy5nZXRDb3VudCgpXG4gICAgaWYgKGN1cnNvclBvc2l0aW9uLmlzR3JlYXRlclRoYW4od29yZFJhbmdlLnN0YXJ0KSAmJiBjdXJzb3JQb3NpdGlvbi5pc0xlc3NUaGFuKHdvcmRSYW5nZS5lbmQpKSB7XG4gICAgICB0aW1lcyArPSAxXG4gICAgfVxuXG4gICAgZm9yIChjb25zdCBpIGluIGdldExpc3QoMSwgdGltZXMpKSB7XG4gICAgICBjb25zdCBwb2ludCA9IGN1cnNvci5nZXRCZWdpbm5pbmdPZkN1cnJlbnRXb3JkQnVmZmVyUG9zaXRpb24oe3dvcmRSZWdleDogdGhpcy53b3JkUmVnZXh9KVxuICAgICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHBvaW50KVxuICAgIH1cblxuICAgIHRoaXMubW92ZVRvTmV4dEVuZE9mV29yZChjdXJzb3IpXG4gICAgaWYgKGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpLmlzR3JlYXRlclRoYW5PckVxdWFsKGN1cnNvclBvc2l0aW9uKSkge1xuICAgICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKFswLCAwXSlcbiAgICB9XG4gIH1cblxuICBtb3ZlVG9OZXh0RW5kT2ZXb3JkKGN1cnNvcikge1xuICAgIGNvbnN0IHBvaW50ID0gY3Vyc29yLmdldEVuZE9mQ3VycmVudFdvcmRCdWZmZXJQb3NpdGlvbih7d29yZFJlZ2V4OiB0aGlzLndvcmRSZWdleH0pLnRyYW5zbGF0ZShbMCwgLTFdKVxuICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihQb2ludC5taW4ocG9pbnQsIHRoaXMuZ2V0VmltRW9mQnVmZmVyUG9zaXRpb24oKSkpXG4gIH1cbn1cbk1vdmVUb1ByZXZpb3VzRW5kT2ZXb3JkLnJlZ2lzdGVyKClcblxuLy8gV2hvbGUgd29yZFxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgTW92ZVRvTmV4dFdob2xlV29yZCBleHRlbmRzIE1vdmVUb05leHRXb3JkIHtcbiAgd29yZFJlZ2V4ID0gL14kfFxcUysvZ1xufVxuTW92ZVRvTmV4dFdob2xlV29yZC5yZWdpc3RlcigpXG5cbmNsYXNzIE1vdmVUb1ByZXZpb3VzV2hvbGVXb3JkIGV4dGVuZHMgTW92ZVRvUHJldmlvdXNXb3JkIHtcbiAgd29yZFJlZ2V4ID0gL14kfFxcUysvZ1xufVxuTW92ZVRvUHJldmlvdXNXaG9sZVdvcmQucmVnaXN0ZXIoKVxuXG5jbGFzcyBNb3ZlVG9FbmRPZldob2xlV29yZCBleHRlbmRzIE1vdmVUb0VuZE9mV29yZCB7XG4gIHdvcmRSZWdleCA9IC9cXFMrL1xufVxuTW92ZVRvRW5kT2ZXaG9sZVdvcmQucmVnaXN0ZXIoKVxuXG4vLyBbVE9ETzogSW1wcm92ZSwgYWNjdXJhY3ldXG5jbGFzcyBNb3ZlVG9QcmV2aW91c0VuZE9mV2hvbGVXb3JkIGV4dGVuZHMgTW92ZVRvUHJldmlvdXNFbmRPZldvcmQge1xuICB3b3JkUmVnZXggPSAvXFxTKy9cbn1cbk1vdmVUb1ByZXZpb3VzRW5kT2ZXaG9sZVdvcmQucmVnaXN0ZXIoKVxuXG4vLyBBbHBoYW51bWVyaWMgd29yZCBbRXhwZXJpbWVudGFsXVxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgTW92ZVRvTmV4dEFscGhhbnVtZXJpY1dvcmQgZXh0ZW5kcyBNb3ZlVG9OZXh0V29yZCB7XG4gIHdvcmRSZWdleCA9IC9cXHcrL2dcbn1cbk1vdmVUb05leHRBbHBoYW51bWVyaWNXb3JkLnJlZ2lzdGVyKClcblxuY2xhc3MgTW92ZVRvUHJldmlvdXNBbHBoYW51bWVyaWNXb3JkIGV4dGVuZHMgTW92ZVRvUHJldmlvdXNXb3JkIHtcbiAgd29yZFJlZ2V4ID0gL1xcdysvXG59XG5Nb3ZlVG9QcmV2aW91c0FscGhhbnVtZXJpY1dvcmQucmVnaXN0ZXIoKVxuXG5jbGFzcyBNb3ZlVG9FbmRPZkFscGhhbnVtZXJpY1dvcmQgZXh0ZW5kcyBNb3ZlVG9FbmRPZldvcmQge1xuICB3b3JkUmVnZXggPSAvXFx3Ky9cbn1cbk1vdmVUb0VuZE9mQWxwaGFudW1lcmljV29yZC5yZWdpc3RlcigpXG5cbi8vIEFscGhhbnVtZXJpYyB3b3JkIFtFeHBlcmltZW50YWxdXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBNb3ZlVG9OZXh0U21hcnRXb3JkIGV4dGVuZHMgTW92ZVRvTmV4dFdvcmQge1xuICB3b3JkUmVnZXggPSAvW1xcdy1dKy9nXG59XG5Nb3ZlVG9OZXh0U21hcnRXb3JkLnJlZ2lzdGVyKClcblxuY2xhc3MgTW92ZVRvUHJldmlvdXNTbWFydFdvcmQgZXh0ZW5kcyBNb3ZlVG9QcmV2aW91c1dvcmQge1xuICB3b3JkUmVnZXggPSAvW1xcdy1dKy9cbn1cbk1vdmVUb1ByZXZpb3VzU21hcnRXb3JkLnJlZ2lzdGVyKClcblxuY2xhc3MgTW92ZVRvRW5kT2ZTbWFydFdvcmQgZXh0ZW5kcyBNb3ZlVG9FbmRPZldvcmQge1xuICB3b3JkUmVnZXggPSAvW1xcdy1dKy9cbn1cbk1vdmVUb0VuZE9mU21hcnRXb3JkLnJlZ2lzdGVyKClcblxuLy8gU3Vid29yZFxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgTW92ZVRvTmV4dFN1YndvcmQgZXh0ZW5kcyBNb3ZlVG9OZXh0V29yZCB7XG4gIG1vdmVDdXJzb3IoY3Vyc29yKSB7XG4gICAgdGhpcy53b3JkUmVnZXggPSBjdXJzb3Iuc3Vid29yZFJlZ0V4cCgpXG4gICAgc3VwZXIubW92ZUN1cnNvcihjdXJzb3IpXG4gIH1cbn1cbk1vdmVUb05leHRTdWJ3b3JkLnJlZ2lzdGVyKClcblxuY2xhc3MgTW92ZVRvUHJldmlvdXNTdWJ3b3JkIGV4dGVuZHMgTW92ZVRvUHJldmlvdXNXb3JkIHtcbiAgbW92ZUN1cnNvcihjdXJzb3IpIHtcbiAgICB0aGlzLndvcmRSZWdleCA9IGN1cnNvci5zdWJ3b3JkUmVnRXhwKClcbiAgICBzdXBlci5tb3ZlQ3Vyc29yKGN1cnNvcilcbiAgfVxufVxuTW92ZVRvUHJldmlvdXNTdWJ3b3JkLnJlZ2lzdGVyKClcblxuY2xhc3MgTW92ZVRvRW5kT2ZTdWJ3b3JkIGV4dGVuZHMgTW92ZVRvRW5kT2ZXb3JkIHtcbiAgbW92ZUN1cnNvcihjdXJzb3IpIHtcbiAgICB0aGlzLndvcmRSZWdleCA9IGN1cnNvci5zdWJ3b3JkUmVnRXhwKClcbiAgICBzdXBlci5tb3ZlQ3Vyc29yKGN1cnNvcilcbiAgfVxufVxuTW92ZVRvRW5kT2ZTdWJ3b3JkLnJlZ2lzdGVyKClcblxuLy8gU2VudGVuY2Vcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFNlbnRlbmNlIGlzIGRlZmluZWQgYXMgYmVsb3dcbi8vICAtIGVuZCB3aXRoIFsnLicsICchJywgJz8nXVxuLy8gIC0gb3B0aW9uYWxseSBmb2xsb3dlZCBieSBbJyknLCAnXScsICdcIicsIFwiJ1wiXVxuLy8gIC0gZm9sbG93ZWQgYnkgWyckJywgJyAnLCAnXFx0J11cbi8vICAtIHBhcmFncmFwaCBib3VuZGFyeSBpcyBhbHNvIHNlbnRlbmNlIGJvdW5kYXJ5XG4vLyAgLSBzZWN0aW9uIGJvdW5kYXJ5IGlzIGFsc28gc2VudGVuY2UgYm91bmRhcnkoaWdub3JlKVxuY2xhc3MgTW92ZVRvTmV4dFNlbnRlbmNlIGV4dGVuZHMgTW90aW9uIHtcbiAganVtcCA9IHRydWVcbiAgc2VudGVuY2VSZWdleCA9IG5ldyBSZWdFeHAoYCg/OltcXFxcLiFcXFxcP11bXFxcXClcXFxcXVwiJ10qXFxcXHMrKXwoXFxcXG58XFxcXHJcXFxcbilgLCBcImdcIilcbiAgZGlyZWN0aW9uID0gXCJuZXh0XCJcblxuICBtb3ZlQ3Vyc29yKGN1cnNvcikge1xuICAgIHRoaXMubW92ZUN1cnNvckNvdW50VGltZXMoY3Vyc29yLCAoKSA9PiB7XG4gICAgICB0aGlzLnNldEJ1ZmZlclBvc2l0aW9uU2FmZWx5KGN1cnNvciwgdGhpcy5nZXRQb2ludChjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKSkpXG4gICAgfSlcbiAgfVxuXG4gIGdldFBvaW50KGZyb21Qb2ludCkge1xuICAgIGlmICh0aGlzLmRpcmVjdGlvbiA9PT0gXCJuZXh0XCIpIHtcbiAgICAgIHJldHVybiB0aGlzLmdldE5leHRTdGFydE9mU2VudGVuY2UoZnJvbVBvaW50KVxuICAgIH0gZWxzZSBpZiAodGhpcy5kaXJlY3Rpb24gPT09IFwicHJldmlvdXNcIikge1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0UHJldmlvdXNTdGFydE9mU2VudGVuY2UoZnJvbVBvaW50KVxuICAgIH1cbiAgfVxuXG4gIGlzQmxhbmtSb3cocm93KSB7XG4gICAgcmV0dXJuIHRoaXMuZWRpdG9yLmlzQnVmZmVyUm93Qmxhbmsocm93KVxuICB9XG5cbiAgZ2V0TmV4dFN0YXJ0T2ZTZW50ZW5jZShmcm9tKSB7XG4gICAgbGV0IGZvdW5kUG9pbnRcbiAgICB0aGlzLnNjYW5Gb3J3YXJkKHRoaXMuc2VudGVuY2VSZWdleCwge2Zyb219LCAoe3JhbmdlLCBtYXRjaFRleHQsIG1hdGNoLCBzdG9wfSkgPT4ge1xuICAgICAgaWYgKG1hdGNoWzFdICE9IG51bGwpIHtcbiAgICAgICAgY29uc3QgW3N0YXJ0Um93LCBlbmRSb3ddID0gQXJyYXkuZnJvbShbcmFuZ2Uuc3RhcnQucm93LCByYW5nZS5lbmQucm93XSlcbiAgICAgICAgaWYgKHRoaXMuc2tpcEJsYW5rUm93ICYmIHRoaXMuaXNCbGFua1JvdyhlbmRSb3cpKSByZXR1cm5cbiAgICAgICAgaWYgKHRoaXMuaXNCbGFua1JvdyhzdGFydFJvdykgIT09IHRoaXMuaXNCbGFua1JvdyhlbmRSb3cpKSB7XG4gICAgICAgICAgZm91bmRQb2ludCA9IHRoaXMuZ2V0Rmlyc3RDaGFyYWN0ZXJQb3NpdGlvbkZvckJ1ZmZlclJvdyhlbmRSb3cpXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZvdW5kUG9pbnQgPSByYW5nZS5lbmRcbiAgICAgIH1cbiAgICAgIGlmIChmb3VuZFBvaW50KSBzdG9wKClcbiAgICB9KVxuICAgIHJldHVybiBmb3VuZFBvaW50IHx8IHRoaXMuZ2V0VmltRW9mQnVmZmVyUG9zaXRpb24oKVxuICB9XG5cbiAgZ2V0UHJldmlvdXNTdGFydE9mU2VudGVuY2UoZnJvbSkge1xuICAgIGxldCBmb3VuZFBvaW50XG4gICAgdGhpcy5zY2FuQmFja3dhcmQodGhpcy5zZW50ZW5jZVJlZ2V4LCB7ZnJvbX0sICh7cmFuZ2UsIG1hdGNoLCBzdG9wLCBtYXRjaFRleHR9KSA9PiB7XG4gICAgICBpZiAobWF0Y2hbMV0gIT0gbnVsbCkge1xuICAgICAgICBjb25zdCBbc3RhcnRSb3csIGVuZFJvd10gPSBBcnJheS5mcm9tKFtyYW5nZS5zdGFydC5yb3csIHJhbmdlLmVuZC5yb3ddKVxuICAgICAgICBpZiAoIXRoaXMuaXNCbGFua1JvdyhlbmRSb3cpICYmIHRoaXMuaXNCbGFua1JvdyhzdGFydFJvdykpIHtcbiAgICAgICAgICBjb25zdCBwb2ludCA9IHRoaXMuZ2V0Rmlyc3RDaGFyYWN0ZXJQb3NpdGlvbkZvckJ1ZmZlclJvdyhlbmRSb3cpXG4gICAgICAgICAgaWYgKHBvaW50LmlzTGVzc1RoYW4oZnJvbSkpIHtcbiAgICAgICAgICAgIGZvdW5kUG9pbnQgPSBwb2ludFxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAodGhpcy5za2lwQmxhbmtSb3cpIHJldHVyblxuICAgICAgICAgICAgZm91bmRQb2ludCA9IHRoaXMuZ2V0Rmlyc3RDaGFyYWN0ZXJQb3NpdGlvbkZvckJ1ZmZlclJvdyhzdGFydFJvdylcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChyYW5nZS5lbmQuaXNMZXNzVGhhbihmcm9tKSkgZm91bmRQb2ludCA9IHJhbmdlLmVuZFxuICAgICAgfVxuICAgICAgaWYgKGZvdW5kUG9pbnQpIHN0b3AoKVxuICAgIH0pXG4gICAgcmV0dXJuIGZvdW5kUG9pbnQgfHwgWzAsIDBdXG4gIH1cbn1cbk1vdmVUb05leHRTZW50ZW5jZS5yZWdpc3RlcigpXG5cbmNsYXNzIE1vdmVUb1ByZXZpb3VzU2VudGVuY2UgZXh0ZW5kcyBNb3ZlVG9OZXh0U2VudGVuY2Uge1xuICBkaXJlY3Rpb24gPSBcInByZXZpb3VzXCJcbn1cbk1vdmVUb1ByZXZpb3VzU2VudGVuY2UucmVnaXN0ZXIoKVxuXG5jbGFzcyBNb3ZlVG9OZXh0U2VudGVuY2VTa2lwQmxhbmtSb3cgZXh0ZW5kcyBNb3ZlVG9OZXh0U2VudGVuY2Uge1xuICBza2lwQmxhbmtSb3cgPSB0cnVlXG59XG5Nb3ZlVG9OZXh0U2VudGVuY2VTa2lwQmxhbmtSb3cucmVnaXN0ZXIoKVxuXG5jbGFzcyBNb3ZlVG9QcmV2aW91c1NlbnRlbmNlU2tpcEJsYW5rUm93IGV4dGVuZHMgTW92ZVRvUHJldmlvdXNTZW50ZW5jZSB7XG4gIHNraXBCbGFua1JvdyA9IHRydWVcbn1cbk1vdmVUb1ByZXZpb3VzU2VudGVuY2VTa2lwQmxhbmtSb3cucmVnaXN0ZXIoKVxuXG4vLyBQYXJhZ3JhcGhcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIE1vdmVUb05leHRQYXJhZ3JhcGggZXh0ZW5kcyBNb3Rpb24ge1xuICBqdW1wID0gdHJ1ZVxuICBkaXJlY3Rpb24gPSBcIm5leHRcIlxuXG4gIG1vdmVDdXJzb3IoY3Vyc29yKSB7XG4gICAgdGhpcy5tb3ZlQ3Vyc29yQ291bnRUaW1lcyhjdXJzb3IsICgpID0+IHtcbiAgICAgIHRoaXMuc2V0QnVmZmVyUG9zaXRpb25TYWZlbHkoY3Vyc29yLCB0aGlzLmdldFBvaW50KGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpKSlcbiAgICB9KVxuICB9XG5cbiAgZ2V0UG9pbnQoZnJvbVBvaW50KSB7XG4gICAgY29uc3Qgc3RhcnRSb3cgPSBmcm9tUG9pbnQucm93XG4gICAgbGV0IHdhc0F0Tm9uQmxhbmtSb3cgPSAhdGhpcy5lZGl0b3IuaXNCdWZmZXJSb3dCbGFuayhzdGFydFJvdylcbiAgICBmb3IgKGxldCByb3cgb2YgZ2V0QnVmZmVyUm93cyh0aGlzLmVkaXRvciwge3N0YXJ0Um93LCBkaXJlY3Rpb246IHRoaXMuZGlyZWN0aW9ufSkpIHtcbiAgICAgIGlmICh0aGlzLmVkaXRvci5pc0J1ZmZlclJvd0JsYW5rKHJvdykpIHtcbiAgICAgICAgaWYgKHdhc0F0Tm9uQmxhbmtSb3cpIHJldHVybiBuZXcgUG9pbnQocm93LCAwKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgd2FzQXROb25CbGFua1JvdyA9IHRydWVcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBmYWxsYmFja1xuICAgIHJldHVybiB0aGlzLmRpcmVjdGlvbiA9PT0gXCJwcmV2aW91c1wiID8gbmV3IFBvaW50KDAsIDApIDogdGhpcy5nZXRWaW1Fb2ZCdWZmZXJQb3NpdGlvbigpXG4gIH1cbn1cbk1vdmVUb05leHRQYXJhZ3JhcGgucmVnaXN0ZXIoKVxuXG5jbGFzcyBNb3ZlVG9QcmV2aW91c1BhcmFncmFwaCBleHRlbmRzIE1vdmVUb05leHRQYXJhZ3JhcGgge1xuICBkaXJlY3Rpb24gPSBcInByZXZpb3VzXCJcbn1cbk1vdmVUb1ByZXZpb3VzUGFyYWdyYXBoLnJlZ2lzdGVyKClcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8ga2V5bWFwOiAwXG5jbGFzcyBNb3ZlVG9CZWdpbm5pbmdPZkxpbmUgZXh0ZW5kcyBNb3Rpb24ge1xuICBtb3ZlQ3Vyc29yKGN1cnNvcikge1xuICAgIHNldEJ1ZmZlckNvbHVtbihjdXJzb3IsIDApXG4gIH1cbn1cbk1vdmVUb0JlZ2lubmluZ09mTGluZS5yZWdpc3RlcigpXG5cbmNsYXNzIE1vdmVUb0NvbHVtbiBleHRlbmRzIE1vdGlvbiB7XG4gIG1vdmVDdXJzb3IoY3Vyc29yKSB7XG4gICAgc2V0QnVmZmVyQ29sdW1uKGN1cnNvciwgdGhpcy5nZXRDb3VudCgtMSkpXG4gIH1cbn1cbk1vdmVUb0NvbHVtbi5yZWdpc3RlcigpXG5cbmNsYXNzIE1vdmVUb0xhc3RDaGFyYWN0ZXJPZkxpbmUgZXh0ZW5kcyBNb3Rpb24ge1xuICBtb3ZlQ3Vyc29yKGN1cnNvcikge1xuICAgIGNvbnN0IHJvdyA9IGdldFZhbGlkVmltQnVmZmVyUm93KHRoaXMuZWRpdG9yLCBjdXJzb3IuZ2V0QnVmZmVyUm93KCkgKyB0aGlzLmdldENvdW50KC0xKSlcbiAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24oW3JvdywgSW5maW5pdHldKVxuICAgIGN1cnNvci5nb2FsQ29sdW1uID0gSW5maW5pdHlcbiAgfVxufVxuTW92ZVRvTGFzdENoYXJhY3Rlck9mTGluZS5yZWdpc3RlcigpXG5cbmNsYXNzIE1vdmVUb0xhc3ROb25ibGFua0NoYXJhY3Rlck9mTGluZUFuZERvd24gZXh0ZW5kcyBNb3Rpb24ge1xuICBpbmNsdXNpdmUgPSB0cnVlXG5cbiAgbW92ZUN1cnNvcihjdXJzb3IpIHtcbiAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24odGhpcy5nZXRQb2ludChjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKSkpXG4gIH1cblxuICBnZXRQb2ludCh7cm93fSkge1xuICAgIHJvdyA9IGxpbWl0TnVtYmVyKHJvdyArIHRoaXMuZ2V0Q291bnQoLTEpLCB7bWF4OiB0aGlzLmdldFZpbUxhc3RCdWZmZXJSb3coKX0pXG4gICAgY29uc3QgcmFuZ2UgPSBmaW5kUmFuZ2VJbkJ1ZmZlclJvdyh0aGlzLmVkaXRvciwgL1xcU3xeLywgcm93LCB7ZGlyZWN0aW9uOiBcImJhY2t3YXJkXCJ9KVxuICAgIHJldHVybiByYW5nZSA/IHJhbmdlLnN0YXJ0IDogbmV3IFBvaW50KHJvdywgMClcbiAgfVxufVxuTW92ZVRvTGFzdE5vbmJsYW5rQ2hhcmFjdGVyT2ZMaW5lQW5kRG93bi5yZWdpc3RlcigpXG5cbi8vIE1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lIGZhaW1pbHlcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gXlxuY2xhc3MgTW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmUgZXh0ZW5kcyBNb3Rpb24ge1xuICBtb3ZlQ3Vyc29yKGN1cnNvcikge1xuICAgIGNvbnN0IHBvaW50ID0gdGhpcy5nZXRGaXJzdENoYXJhY3RlclBvc2l0aW9uRm9yQnVmZmVyUm93KGN1cnNvci5nZXRCdWZmZXJSb3coKSlcbiAgICB0aGlzLnNldEJ1ZmZlclBvc2l0aW9uU2FmZWx5KGN1cnNvciwgcG9pbnQpXG4gIH1cbn1cbk1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lLnJlZ2lzdGVyKClcblxuY2xhc3MgTW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmVVcCBleHRlbmRzIE1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lIHtcbiAgd2lzZSA9IFwibGluZXdpc2VcIlxuICBtb3ZlQ3Vyc29yKGN1cnNvcikge1xuICAgIHRoaXMubW92ZUN1cnNvckNvdW50VGltZXMoY3Vyc29yLCBmdW5jdGlvbigpIHtcbiAgICAgIGNvbnN0IHBvaW50ID0gY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKClcbiAgICAgIGlmIChwb2ludC5yb3cgPiAwKSB7XG4gICAgICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihwb2ludC50cmFuc2xhdGUoWy0xLCAwXSkpXG4gICAgICB9XG4gICAgfSlcbiAgICBzdXBlci5tb3ZlQ3Vyc29yKGN1cnNvcilcbiAgfVxufVxuTW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmVVcC5yZWdpc3RlcigpXG5cbmNsYXNzIE1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lRG93biBleHRlbmRzIE1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lIHtcbiAgd2lzZSA9IFwibGluZXdpc2VcIlxuICBtb3ZlQ3Vyc29yKGN1cnNvcikge1xuICAgIHRoaXMubW92ZUN1cnNvckNvdW50VGltZXMoY3Vyc29yLCAoKSA9PiB7XG4gICAgICBjb25zdCBwb2ludCA9IGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXG4gICAgICBpZiAocG9pbnQucm93IDwgdGhpcy5nZXRWaW1MYXN0QnVmZmVyUm93KCkpIHtcbiAgICAgICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHBvaW50LnRyYW5zbGF0ZShbKzEsIDBdKSlcbiAgICAgIH1cbiAgICB9KVxuICAgIHN1cGVyLm1vdmVDdXJzb3IoY3Vyc29yKVxuICB9XG59XG5Nb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZURvd24ucmVnaXN0ZXIoKVxuXG5jbGFzcyBNb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZUFuZERvd24gZXh0ZW5kcyBNb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZURvd24ge1xuICBnZXRDb3VudCgpIHtcbiAgICByZXR1cm4gc3VwZXIuZ2V0Q291bnQoLTEpXG4gIH1cbn1cbk1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lQW5kRG93bi5yZWdpc3RlcigpXG5cbi8vIGtleW1hcDogZyBnXG5jbGFzcyBNb3ZlVG9GaXJzdExpbmUgZXh0ZW5kcyBNb3Rpb24ge1xuICB3aXNlID0gXCJsaW5ld2lzZVwiXG4gIGp1bXAgPSB0cnVlXG4gIHZlcnRpY2FsTW90aW9uID0gdHJ1ZVxuICBtb3ZlU3VjY2Vzc09uTGluZXdpc2UgPSB0cnVlXG5cbiAgbW92ZUN1cnNvcihjdXJzb3IpIHtcbiAgICB0aGlzLnNldEN1cnNvckJ1ZmZlclJvdyhjdXJzb3IsIGdldFZhbGlkVmltQnVmZmVyUm93KHRoaXMuZWRpdG9yLCB0aGlzLmdldFJvdygpKSlcbiAgICBjdXJzb3IuYXV0b3Njcm9sbCh7Y2VudGVyOiB0cnVlfSlcbiAgfVxuXG4gIGdldFJvdygpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRDb3VudCgtMSlcbiAgfVxufVxuTW92ZVRvRmlyc3RMaW5lLnJlZ2lzdGVyKClcblxuY2xhc3MgTW92ZVRvU2NyZWVuQ29sdW1uIGV4dGVuZHMgTW90aW9uIHtcbiAgbW92ZUN1cnNvcihjdXJzb3IpIHtcbiAgICBjb25zdCBhbGxvd09mZlNjcmVlblBvc2l0aW9uID0gdGhpcy5nZXRDb25maWcoXCJhbGxvd01vdmVUb09mZlNjcmVlbkNvbHVtbk9uU2NyZWVuTGluZU1vdGlvblwiKVxuICAgIGNvbnN0IHBvaW50ID0gZ2V0U2NyZWVuUG9zaXRpb25Gb3JTY3JlZW5Sb3codGhpcy5lZGl0b3IsIGN1cnNvci5nZXRTY3JlZW5Sb3coKSwgdGhpcy53aGljaCwge1xuICAgICAgYWxsb3dPZmZTY3JlZW5Qb3NpdGlvbixcbiAgICB9KVxuICAgIHRoaXMuc2V0U2NyZWVuUG9zaXRpb25TYWZlbHkoY3Vyc29yLCBwb2ludClcbiAgfVxufVxuTW92ZVRvU2NyZWVuQ29sdW1uLnJlZ2lzdGVyKGZhbHNlKVxuXG4vLyBrZXltYXA6IGcgMFxuY2xhc3MgTW92ZVRvQmVnaW5uaW5nT2ZTY3JlZW5MaW5lIGV4dGVuZHMgTW92ZVRvU2NyZWVuQ29sdW1uIHtcbiAgd2hpY2ggPSBcImJlZ2lubmluZ1wiXG59XG5Nb3ZlVG9CZWdpbm5pbmdPZlNjcmVlbkxpbmUucmVnaXN0ZXIoKVxuXG4vLyBnIF46IGBtb3ZlLXRvLWZpcnN0LWNoYXJhY3Rlci1vZi1zY3JlZW4tbGluZWBcbmNsYXNzIE1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZTY3JlZW5MaW5lIGV4dGVuZHMgTW92ZVRvU2NyZWVuQ29sdW1uIHtcbiAgd2hpY2ggPSBcImZpcnN0LWNoYXJhY3RlclwiXG59XG5Nb3ZlVG9GaXJzdENoYXJhY3Rlck9mU2NyZWVuTGluZS5yZWdpc3RlcigpXG5cbi8vIGtleW1hcDogZyAkXG5jbGFzcyBNb3ZlVG9MYXN0Q2hhcmFjdGVyT2ZTY3JlZW5MaW5lIGV4dGVuZHMgTW92ZVRvU2NyZWVuQ29sdW1uIHtcbiAgd2hpY2ggPSBcImxhc3QtY2hhcmFjdGVyXCJcbn1cbk1vdmVUb0xhc3RDaGFyYWN0ZXJPZlNjcmVlbkxpbmUucmVnaXN0ZXIoKVxuXG4vLyBrZXltYXA6IEdcbmNsYXNzIE1vdmVUb0xhc3RMaW5lIGV4dGVuZHMgTW92ZVRvRmlyc3RMaW5lIHtcbiAgZGVmYXVsdENvdW50ID0gSW5maW5pdHlcbn1cbk1vdmVUb0xhc3RMaW5lLnJlZ2lzdGVyKClcblxuLy8ga2V5bWFwOiBOJSBlLmcuIDEwJVxuY2xhc3MgTW92ZVRvTGluZUJ5UGVyY2VudCBleHRlbmRzIE1vdmVUb0ZpcnN0TGluZSB7XG4gIGdldFJvdygpIHtcbiAgICBjb25zdCBwZXJjZW50ID0gbGltaXROdW1iZXIodGhpcy5nZXRDb3VudCgpLCB7bWF4OiAxMDB9KVxuICAgIHJldHVybiBNYXRoLmZsb29yKCh0aGlzLmVkaXRvci5nZXRMaW5lQ291bnQoKSAtIDEpICogKHBlcmNlbnQgLyAxMDApKVxuICB9XG59XG5Nb3ZlVG9MaW5lQnlQZXJjZW50LnJlZ2lzdGVyKClcblxuY2xhc3MgTW92ZVRvUmVsYXRpdmVMaW5lIGV4dGVuZHMgTW90aW9uIHtcbiAgd2lzZSA9IFwibGluZXdpc2VcIlxuICBtb3ZlU3VjY2Vzc09uTGluZXdpc2UgPSB0cnVlXG5cbiAgbW92ZUN1cnNvcihjdXJzb3IpIHtcbiAgICBsZXQgcm93XG4gICAgbGV0IGNvdW50ID0gdGhpcy5nZXRDb3VudCgpXG4gICAgaWYgKGNvdW50IDwgMCkge1xuICAgICAgLy8gU3VwcG9ydCBuZWdhdGl2ZSBjb3VudFxuICAgICAgLy8gTmVnYXRpdmUgY291bnQgY2FuIGJlIHBhc3NlZCBsaWtlIGBvcGVyYXRpb25TdGFjay5ydW4oXCJNb3ZlVG9SZWxhdGl2ZUxpbmVcIiwge2NvdW50OiAtNX0pYC5cbiAgICAgIC8vIEN1cnJlbnRseSB1c2VkIGluIHZpbS1tb2RlLXBsdXMtZXgtbW9kZSBwa2cuXG4gICAgICBjb3VudCArPSAxXG4gICAgICByb3cgPSB0aGlzLmdldEZvbGRTdGFydFJvd0ZvclJvdyhjdXJzb3IuZ2V0QnVmZmVyUm93KCkpXG4gICAgICB3aGlsZSAoY291bnQrKyA8IDApIHJvdyA9IHRoaXMuZ2V0Rm9sZFN0YXJ0Um93Rm9yUm93KHJvdyAtIDEpXG4gICAgfSBlbHNlIHtcbiAgICAgIGNvdW50IC09IDFcbiAgICAgIHJvdyA9IHRoaXMuZ2V0Rm9sZEVuZFJvd0ZvclJvdyhjdXJzb3IuZ2V0QnVmZmVyUm93KCkpXG4gICAgICB3aGlsZSAoY291bnQtLSA+IDApIHJvdyA9IHRoaXMuZ2V0Rm9sZEVuZFJvd0ZvclJvdyhyb3cgKyAxKVxuICAgIH1cbiAgICBzZXRCdWZmZXJSb3coY3Vyc29yLCByb3cpXG4gIH1cbn1cbk1vdmVUb1JlbGF0aXZlTGluZS5yZWdpc3RlcihmYWxzZSlcblxuY2xhc3MgTW92ZVRvUmVsYXRpdmVMaW5lTWluaW11bVR3byBleHRlbmRzIE1vdmVUb1JlbGF0aXZlTGluZSB7XG4gIGdldENvdW50KC4uLmFyZ3MpIHtcbiAgICByZXR1cm4gbGltaXROdW1iZXIoc3VwZXIuZ2V0Q291bnQoLi4uYXJncyksIHttaW46IDJ9KVxuICB9XG59XG5Nb3ZlVG9SZWxhdGl2ZUxpbmVNaW5pbXVtVHdvLnJlZ2lzdGVyKGZhbHNlKVxuXG4vLyBQb3NpdGlvbiBjdXJzb3Igd2l0aG91dCBzY3JvbGxpbmcuLCBILCBNLCBMXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBrZXltYXA6IEhcbmNsYXNzIE1vdmVUb1RvcE9mU2NyZWVuIGV4dGVuZHMgTW90aW9uIHtcbiAgd2lzZSA9IFwibGluZXdpc2VcIlxuICBqdW1wID0gdHJ1ZVxuICBzY3JvbGxvZmYgPSAyXG4gIGRlZmF1bHRDb3VudCA9IDBcbiAgdmVydGljYWxNb3Rpb24gPSB0cnVlXG5cbiAgbW92ZUN1cnNvcihjdXJzb3IpIHtcbiAgICBjb25zdCBidWZmZXJSb3cgPSB0aGlzLmVkaXRvci5idWZmZXJSb3dGb3JTY3JlZW5Sb3codGhpcy5nZXRTY3JlZW5Sb3coKSlcbiAgICB0aGlzLnNldEN1cnNvckJ1ZmZlclJvdyhjdXJzb3IsIGJ1ZmZlclJvdylcbiAgfVxuXG4gIGdldFNjcm9sbG9mZigpIHtcbiAgICByZXR1cm4gdGhpcy5pc0FzVGFyZ2V0RXhjZXB0U2VsZWN0SW5WaXN1YWxNb2RlKCkgPyAwIDogdGhpcy5zY3JvbGxvZmZcbiAgfVxuXG4gIGdldFNjcmVlblJvdygpIHtcbiAgICBjb25zdCBmaXJzdFJvdyA9IGdldEZpcnN0VmlzaWJsZVNjcmVlblJvdyh0aGlzLmVkaXRvcilcbiAgICBsZXQgb2Zmc2V0ID0gdGhpcy5nZXRTY3JvbGxvZmYoKVxuICAgIGlmIChmaXJzdFJvdyA9PT0gMCkge1xuICAgICAgb2Zmc2V0ID0gMFxuICAgIH1cbiAgICBvZmZzZXQgPSBsaW1pdE51bWJlcih0aGlzLmdldENvdW50KC0xKSwge21pbjogb2Zmc2V0fSlcbiAgICByZXR1cm4gZmlyc3RSb3cgKyBvZmZzZXRcbiAgfVxufVxuTW92ZVRvVG9wT2ZTY3JlZW4ucmVnaXN0ZXIoKVxuXG4vLyBrZXltYXA6IE1cbmNsYXNzIE1vdmVUb01pZGRsZU9mU2NyZWVuIGV4dGVuZHMgTW92ZVRvVG9wT2ZTY3JlZW4ge1xuICBnZXRTY3JlZW5Sb3coKSB7XG4gICAgY29uc3Qgc3RhcnRSb3cgPSBnZXRGaXJzdFZpc2libGVTY3JlZW5Sb3codGhpcy5lZGl0b3IpXG4gICAgY29uc3QgZW5kUm93ID0gbGltaXROdW1iZXIodGhpcy5lZGl0b3IuZ2V0TGFzdFZpc2libGVTY3JlZW5Sb3coKSwge21heDogdGhpcy5nZXRWaW1MYXN0U2NyZWVuUm93KCl9KVxuICAgIHJldHVybiBzdGFydFJvdyArIE1hdGguZmxvb3IoKGVuZFJvdyAtIHN0YXJ0Um93KSAvIDIpXG4gIH1cbn1cbk1vdmVUb01pZGRsZU9mU2NyZWVuLnJlZ2lzdGVyKClcblxuLy8ga2V5bWFwOiBMXG5jbGFzcyBNb3ZlVG9Cb3R0b21PZlNjcmVlbiBleHRlbmRzIE1vdmVUb1RvcE9mU2NyZWVuIHtcbiAgZ2V0U2NyZWVuUm93KCkge1xuICAgIC8vIFtGSVhNRV1cbiAgICAvLyBBdCBsZWFzdCBBdG9tIHYxLjYuMCwgdGhlcmUgYXJlIHR3byBpbXBsZW1lbnRhdGlvbiBvZiBnZXRMYXN0VmlzaWJsZVNjcmVlblJvdygpXG4gICAgLy8gZWRpdG9yLmdldExhc3RWaXNpYmxlU2NyZWVuUm93KCkgYW5kIGVkaXRvckVsZW1lbnQuZ2V0TGFzdFZpc2libGVTY3JlZW5Sb3coKVxuICAgIC8vIFRob3NlIHR3byBtZXRob2RzIHJldHVybiBkaWZmZXJlbnQgdmFsdWUsIGVkaXRvcidzIG9uZSBpcyBjb3JyZW50LlxuICAgIC8vIFNvIEkgaW50ZW50aW9uYWxseSB1c2UgZWRpdG9yLmdldExhc3RTY3JlZW5Sb3cgaGVyZS5cbiAgICBjb25zdCB2aW1MYXN0U2NyZWVuUm93ID0gdGhpcy5nZXRWaW1MYXN0U2NyZWVuUm93KClcbiAgICBjb25zdCByb3cgPSBsaW1pdE51bWJlcih0aGlzLmVkaXRvci5nZXRMYXN0VmlzaWJsZVNjcmVlblJvdygpLCB7bWF4OiB2aW1MYXN0U2NyZWVuUm93fSlcbiAgICBsZXQgb2Zmc2V0ID0gdGhpcy5nZXRTY3JvbGxvZmYoKSArIDFcbiAgICBpZiAocm93ID09PSB2aW1MYXN0U2NyZWVuUm93KSB7XG4gICAgICBvZmZzZXQgPSAwXG4gICAgfVxuICAgIG9mZnNldCA9IGxpbWl0TnVtYmVyKHRoaXMuZ2V0Q291bnQoLTEpLCB7bWluOiBvZmZzZXR9KVxuICAgIHJldHVybiByb3cgLSBvZmZzZXRcbiAgfVxufVxuTW92ZVRvQm90dG9tT2ZTY3JlZW4ucmVnaXN0ZXIoKVxuXG4vLyBTY3JvbGxpbmdcbi8vIEhhbGY6IGN0cmwtZCwgY3RybC11XG4vLyBGdWxsOiBjdHJsLWYsIGN0cmwtYlxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gW0ZJWE1FXSBjb3VudCBiZWhhdmUgZGlmZmVyZW50bHkgZnJvbSBvcmlnaW5hbCBWaW0uXG5jbGFzcyBTY3JvbGwgZXh0ZW5kcyBNb3Rpb24ge1xuICB2ZXJ0aWNhbE1vdGlvbiA9IHRydWVcblxuICBpc1Ntb290aFNjcm9sbEVuYWJsZWQoKSB7XG4gICAgcmV0dXJuIE1hdGguYWJzKHRoaXMuYW1vdW50T2ZQYWdlKSA9PT0gMVxuICAgICAgPyB0aGlzLmdldENvbmZpZyhcInNtb290aFNjcm9sbE9uRnVsbFNjcm9sbE1vdGlvblwiKVxuICAgICAgOiB0aGlzLmdldENvbmZpZyhcInNtb290aFNjcm9sbE9uSGFsZlNjcm9sbE1vdGlvblwiKVxuICB9XG5cbiAgZ2V0U21vb3RoU2Nyb2xsRHVhdGlvbigpIHtcbiAgICByZXR1cm4gTWF0aC5hYnModGhpcy5hbW91bnRPZlBhZ2UpID09PSAxXG4gICAgICA/IHRoaXMuZ2V0Q29uZmlnKFwic21vb3RoU2Nyb2xsT25GdWxsU2Nyb2xsTW90aW9uRHVyYXRpb25cIilcbiAgICAgIDogdGhpcy5nZXRDb25maWcoXCJzbW9vdGhTY3JvbGxPbkhhbGZTY3JvbGxNb3Rpb25EdXJhdGlvblwiKVxuICB9XG5cbiAgZ2V0UGl4ZWxSZWN0VG9wRm9yU2NlZW5Sb3cocm93KSB7XG4gICAgY29uc3QgcG9pbnQgPSBuZXcgUG9pbnQocm93LCAwKVxuICAgIHJldHVybiB0aGlzLmVkaXRvci5lbGVtZW50LnBpeGVsUmVjdEZvclNjcmVlblJhbmdlKG5ldyBSYW5nZShwb2ludCwgcG9pbnQpKS50b3BcbiAgfVxuXG4gIHNtb290aFNjcm9sbChmcm9tUm93LCB0b1JvdywgZG9uZSkge1xuICAgIGNvbnN0IHRvcFBpeGVsRnJvbSA9IHt0b3A6IHRoaXMuZ2V0UGl4ZWxSZWN0VG9wRm9yU2NlZW5Sb3coZnJvbVJvdyl9XG4gICAgY29uc3QgdG9wUGl4ZWxUbyA9IHt0b3A6IHRoaXMuZ2V0UGl4ZWxSZWN0VG9wRm9yU2NlZW5Sb3codG9Sb3cpfVxuICAgIC8vIFtOT1RFXVxuICAgIC8vIGludGVudGlvbmFsbHkgdXNlIGBlbGVtZW50LmNvbXBvbmVudC5zZXRTY3JvbGxUb3BgIGluc3RlYWQgb2YgYGVsZW1lbnQuc2V0U2Nyb2xsVG9wYC5cbiAgICAvLyBTSW5jZSBlbGVtZW50LnNldFNjcm9sbFRvcCB3aWxsIHRocm93IGV4Y2VwdGlvbiB3aGVuIGVsZW1lbnQuY29tcG9uZW50IG5vIGxvbmdlciBleGlzdHMuXG4gICAgY29uc3Qgc3RlcCA9IG5ld1RvcCA9PiB7XG4gICAgICBpZiAodGhpcy5lZGl0b3IuZWxlbWVudC5jb21wb25lbnQpIHtcbiAgICAgICAgdGhpcy5lZGl0b3IuZWxlbWVudC5jb21wb25lbnQuc2V0U2Nyb2xsVG9wKG5ld1RvcClcbiAgICAgICAgdGhpcy5lZGl0b3IuZWxlbWVudC5jb21wb25lbnQudXBkYXRlU3luYygpXG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgZHVyYXRpb24gPSB0aGlzLmdldFNtb290aFNjcm9sbER1YXRpb24oKVxuICAgIHRoaXMudmltU3RhdGUucmVxdWVzdFNjcm9sbEFuaW1hdGlvbih0b3BQaXhlbEZyb20sIHRvcFBpeGVsVG8sIHtkdXJhdGlvbiwgc3RlcCwgZG9uZX0pXG4gIH1cblxuICBnZXRBbW91bnRPZlJvd3MoKSB7XG4gICAgcmV0dXJuIE1hdGguY2VpbCh0aGlzLmFtb3VudE9mUGFnZSAqIHRoaXMuZWRpdG9yLmdldFJvd3NQZXJQYWdlKCkgKiB0aGlzLmdldENvdW50KCkpXG4gIH1cblxuICBnZXRCdWZmZXJSb3coY3Vyc29yKSB7XG4gICAgY29uc3Qgc2NyZWVuUm93ID0gZ2V0VmFsaWRWaW1TY3JlZW5Sb3codGhpcy5lZGl0b3IsIGN1cnNvci5nZXRTY3JlZW5Sb3coKSArIHRoaXMuZ2V0QW1vdW50T2ZSb3dzKCkpXG4gICAgcmV0dXJuIHRoaXMuZWRpdG9yLmJ1ZmZlclJvd0ZvclNjcmVlblJvdyhzY3JlZW5Sb3cpXG4gIH1cblxuICBtb3ZlQ3Vyc29yKGN1cnNvcikge1xuICAgIGNvbnN0IGJ1ZmZlclJvdyA9IHRoaXMuZ2V0QnVmZmVyUm93KGN1cnNvcilcbiAgICB0aGlzLnNldEN1cnNvckJ1ZmZlclJvdyhjdXJzb3IsIHRoaXMuZ2V0QnVmZmVyUm93KGN1cnNvciksIHthdXRvc2Nyb2xsOiBmYWxzZX0pXG5cbiAgICBpZiAoY3Vyc29yLmlzTGFzdEN1cnNvcigpKSB7XG4gICAgICBpZiAodGhpcy5pc1Ntb290aFNjcm9sbEVuYWJsZWQoKSkgdGhpcy52aW1TdGF0ZS5maW5pc2hTY3JvbGxBbmltYXRpb24oKVxuXG4gICAgICBjb25zdCBmaXJzdFZpc2liaWxlU2NyZWVuUm93ID0gdGhpcy5lZGl0b3IuZ2V0Rmlyc3RWaXNpYmxlU2NyZWVuUm93KClcbiAgICAgIGNvbnN0IG5ld0ZpcnN0VmlzaWJpbGVCdWZmZXJSb3cgPSB0aGlzLmVkaXRvci5idWZmZXJSb3dGb3JTY3JlZW5Sb3coXG4gICAgICAgIGZpcnN0VmlzaWJpbGVTY3JlZW5Sb3cgKyB0aGlzLmdldEFtb3VudE9mUm93cygpXG4gICAgICApXG4gICAgICBjb25zdCBuZXdGaXJzdFZpc2liaWxlU2NyZWVuUm93ID0gdGhpcy5lZGl0b3Iuc2NyZWVuUm93Rm9yQnVmZmVyUm93KG5ld0ZpcnN0VmlzaWJpbGVCdWZmZXJSb3cpXG4gICAgICBjb25zdCBkb25lID0gKCkgPT4ge1xuICAgICAgICB0aGlzLmVkaXRvci5zZXRGaXJzdFZpc2libGVTY3JlZW5Sb3cobmV3Rmlyc3RWaXNpYmlsZVNjcmVlblJvdylcbiAgICAgICAgLy8gW0ZJWE1FXSBzb21ldGltZXMsIHNjcm9sbFRvcCBpcyBub3QgdXBkYXRlZCwgY2FsbGluZyB0aGlzIGZpeC5cbiAgICAgICAgLy8gSW52ZXN0aWdhdGUgYW5kIGZpbmQgYmV0dGVyIGFwcHJvYWNoIHRoZW4gcmVtb3ZlIHRoaXMgd29ya2Fyb3VuZC5cbiAgICAgICAgaWYgKHRoaXMuZWRpdG9yLmVsZW1lbnQuY29tcG9uZW50KSB0aGlzLmVkaXRvci5lbGVtZW50LmNvbXBvbmVudC51cGRhdGVTeW5jKClcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuaXNTbW9vdGhTY3JvbGxFbmFibGVkKCkpIHRoaXMuc21vb3RoU2Nyb2xsKGZpcnN0VmlzaWJpbGVTY3JlZW5Sb3csIG5ld0ZpcnN0VmlzaWJpbGVTY3JlZW5Sb3csIGRvbmUpXG4gICAgICBlbHNlIGRvbmUoKVxuICAgIH1cbiAgfVxufVxuU2Nyb2xsLnJlZ2lzdGVyKGZhbHNlKVxuXG4vLyBrZXltYXA6IGN0cmwtZlxuY2xhc3MgU2Nyb2xsRnVsbFNjcmVlbkRvd24gZXh0ZW5kcyBTY3JvbGwge1xuICBhbW91bnRPZlBhZ2UgPSArMVxufVxuU2Nyb2xsRnVsbFNjcmVlbkRvd24ucmVnaXN0ZXIoKVxuXG4vLyBrZXltYXA6IGN0cmwtYlxuY2xhc3MgU2Nyb2xsRnVsbFNjcmVlblVwIGV4dGVuZHMgU2Nyb2xsIHtcbiAgYW1vdW50T2ZQYWdlID0gLTFcbn1cblNjcm9sbEZ1bGxTY3JlZW5VcC5yZWdpc3RlcigpXG5cbi8vIGtleW1hcDogY3RybC1kXG5jbGFzcyBTY3JvbGxIYWxmU2NyZWVuRG93biBleHRlbmRzIFNjcm9sbCB7XG4gIGFtb3VudE9mUGFnZSA9ICsxIC8gMlxufVxuU2Nyb2xsSGFsZlNjcmVlbkRvd24ucmVnaXN0ZXIoKVxuXG4vLyBrZXltYXA6IGN0cmwtdVxuY2xhc3MgU2Nyb2xsSGFsZlNjcmVlblVwIGV4dGVuZHMgU2Nyb2xsIHtcbiAgYW1vdW50T2ZQYWdlID0gLTEgLyAyXG59XG5TY3JvbGxIYWxmU2NyZWVuVXAucmVnaXN0ZXIoKVxuXG4vLyBGaW5kXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBrZXltYXA6IGZcbmNsYXNzIEZpbmQgZXh0ZW5kcyBNb3Rpb24ge1xuICBiYWNrd2FyZHMgPSBmYWxzZVxuICBpbmNsdXNpdmUgPSB0cnVlXG4gIG9mZnNldCA9IDBcbiAgcmVxdWlyZUlucHV0ID0gdHJ1ZVxuICBjYXNlU2Vuc2l0aXZpdHlLaW5kID0gXCJGaW5kXCJcblxuICByZXN0b3JlRWRpdG9yU3RhdGUoKSB7XG4gICAgaWYgKHRoaXMuX3Jlc3RvcmVFZGl0b3JTdGF0ZSkgdGhpcy5fcmVzdG9yZUVkaXRvclN0YXRlKClcbiAgICB0aGlzLl9yZXN0b3JlRWRpdG9yU3RhdGUgPSBudWxsXG4gIH1cblxuICBjYW5jZWxPcGVyYXRpb24oKSB7XG4gICAgdGhpcy5yZXN0b3JlRWRpdG9yU3RhdGUoKVxuICAgIHN1cGVyLmNhbmNlbE9wZXJhdGlvbigpXG4gIH1cblxuICBpbml0aWFsaXplKCkge1xuICAgIGlmICh0aGlzLmdldENvbmZpZyhcInJldXNlRmluZEZvclJlcGVhdEZpbmRcIikpIHRoaXMucmVwZWF0SWZOZWNlc3NhcnkoKVxuICAgIGlmICghdGhpcy5pc0NvbXBsZXRlKCkpIHtcbiAgICAgIGNvbnN0IGNoYXJzTWF4ID0gdGhpcy5nZXRDb25maWcoXCJmaW5kQ2hhcnNNYXhcIilcbiAgICAgIGNvbnN0IG9wdGlvbnNCYXNlID0ge3B1cnBvc2U6IFwiZmluZFwiLCBjaGFyc01heH1cblxuICAgICAgaWYgKGNoYXJzTWF4ID09PSAxKSB7XG4gICAgICAgIHRoaXMuZm9jdXNJbnB1dChvcHRpb25zQmFzZSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX3Jlc3RvcmVFZGl0b3JTdGF0ZSA9IHNhdmVFZGl0b3JTdGF0ZSh0aGlzLmVkaXRvcilcbiAgICAgICAgY29uc3Qgb3B0aW9ucyA9IHtcbiAgICAgICAgICBhdXRvQ29uZmlybVRpbWVvdXQ6IHRoaXMuZ2V0Q29uZmlnKFwiZmluZENvbmZpcm1CeVRpbWVvdXRcIiksXG4gICAgICAgICAgb25Db25maXJtOiBpbnB1dCA9PiB7XG4gICAgICAgICAgICB0aGlzLmlucHV0ID0gaW5wdXRcbiAgICAgICAgICAgIGlmIChpbnB1dCkgdGhpcy5wcm9jZXNzT3BlcmF0aW9uKClcbiAgICAgICAgICAgIGVsc2UgdGhpcy5jYW5jZWxPcGVyYXRpb24oKVxuICAgICAgICAgIH0sXG4gICAgICAgICAgb25DaGFuZ2U6IHByZUNvbmZpcm1lZENoYXJzID0+IHtcbiAgICAgICAgICAgIHRoaXMucHJlQ29uZmlybWVkQ2hhcnMgPSBwcmVDb25maXJtZWRDaGFyc1xuICAgICAgICAgICAgdGhpcy5oaWdobGlnaHRUZXh0SW5DdXJzb3JSb3dzKHRoaXMucHJlQ29uZmlybWVkQ2hhcnMsIFwicHJlLWNvbmZpcm1cIiwgdGhpcy5pc0JhY2t3YXJkcygpKVxuICAgICAgICAgIH0sXG4gICAgICAgICAgb25DYW5jZWw6ICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMudmltU3RhdGUuaGlnaGxpZ2h0RmluZC5jbGVhck1hcmtlcnMoKVxuICAgICAgICAgICAgdGhpcy5jYW5jZWxPcGVyYXRpb24oKVxuICAgICAgICAgIH0sXG4gICAgICAgICAgY29tbWFuZHM6IHtcbiAgICAgICAgICAgIFwidmltLW1vZGUtcGx1czpmaW5kLW5leHQtcHJlLWNvbmZpcm1lZFwiOiAoKSA9PiB0aGlzLmZpbmRQcmVDb25maXJtZWQoKzEpLFxuICAgICAgICAgICAgXCJ2aW0tbW9kZS1wbHVzOmZpbmQtcHJldmlvdXMtcHJlLWNvbmZpcm1lZFwiOiAoKSA9PiB0aGlzLmZpbmRQcmVDb25maXJtZWQoLTEpLFxuICAgICAgICAgIH0sXG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5mb2N1c0lucHV0KE9iamVjdC5hc3NpZ24ob3B0aW9ucywgb3B0aW9uc0Jhc2UpKVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gc3VwZXIuaW5pdGlhbGl6ZSgpXG4gIH1cblxuICBmaW5kUHJlQ29uZmlybWVkKGRlbHRhKSB7XG4gICAgaWYgKHRoaXMucHJlQ29uZmlybWVkQ2hhcnMgJiYgdGhpcy5nZXRDb25maWcoXCJoaWdobGlnaHRGaW5kQ2hhclwiKSkge1xuICAgICAgY29uc3QgaW5kZXggPSB0aGlzLmhpZ2hsaWdodFRleHRJbkN1cnNvclJvd3MoXG4gICAgICAgIHRoaXMucHJlQ29uZmlybWVkQ2hhcnMsXG4gICAgICAgIFwicHJlLWNvbmZpcm1cIixcbiAgICAgICAgdGhpcy5pc0JhY2t3YXJkcygpLFxuICAgICAgICB0aGlzLmdldENvdW50KC0xKSArIGRlbHRhLFxuICAgICAgICB0cnVlXG4gICAgICApXG4gICAgICB0aGlzLmNvdW50ID0gaW5kZXggKyAxXG4gICAgfVxuICB9XG5cbiAgcmVwZWF0SWZOZWNlc3NhcnkoKSB7XG4gICAgY29uc3QgZmluZENvbW1hbmROYW1lcyA9IFtcIkZpbmRcIiwgXCJGaW5kQmFja3dhcmRzXCIsIFwiVGlsbFwiLCBcIlRpbGxCYWNrd2FyZHNcIl1cbiAgICBjb25zdCBjdXJyZW50RmluZCA9IHRoaXMuZ2xvYmFsU3RhdGUuZ2V0KFwiY3VycmVudEZpbmRcIilcbiAgICBpZiAoY3VycmVudEZpbmQgJiYgZmluZENvbW1hbmROYW1lcy5pbmNsdWRlcyh0aGlzLnZpbVN0YXRlLm9wZXJhdGlvblN0YWNrLmdldExhc3RDb21tYW5kTmFtZSgpKSkge1xuICAgICAgdGhpcy5pbnB1dCA9IGN1cnJlbnRGaW5kLmlucHV0XG4gICAgICB0aGlzLnJlcGVhdGVkID0gdHJ1ZVxuICAgIH1cbiAgfVxuXG4gIGlzQmFja3dhcmRzKCkge1xuICAgIHJldHVybiB0aGlzLmJhY2t3YXJkc1xuICB9XG5cbiAgZXhlY3V0ZSgpIHtcbiAgICBzdXBlci5leGVjdXRlKClcbiAgICBsZXQgZGVjb3JhdGlvblR5cGUgPSBcInBvc3QtY29uZmlybVwiXG4gICAgaWYgKHRoaXMub3BlcmF0b3IgJiYgIXRoaXMub3BlcmF0b3IuaW5zdGFuY2VvZihcIlNlbGVjdEJhc2VcIikpIHtcbiAgICAgIGRlY29yYXRpb25UeXBlICs9IFwiIGxvbmdcIlxuICAgIH1cblxuICAgIC8vIEhBQ0s6IFdoZW4gcmVwZWF0ZWQgYnkgXCIsXCIsIHRoaXMuYmFja3dhcmRzIGlzIHRlbXBvcmFyeSBpbnZlcnRlZCBhbmRcbiAgICAvLyByZXN0b3JlZCBhZnRlciBleGVjdXRpb24gZmluaXNoZWQuXG4gICAgLy8gQnV0IGZpbmFsIGhpZ2hsaWdodFRleHRJbkN1cnNvclJvd3MgaXMgZXhlY3V0ZWQgaW4gYXN5bmMoPWFmdGVyIG9wZXJhdGlvbiBmaW5pc2hlZCkuXG4gICAgLy8gVGh1cyB3ZSBuZWVkIHRvIHByZXNlcnZlIGJlZm9yZSByZXN0b3JlZCBgYmFja3dhcmRzYCB2YWx1ZSBhbmQgcGFzcyBpdC5cbiAgICBjb25zdCBiYWNrd2FyZHMgPSB0aGlzLmlzQmFja3dhcmRzKClcbiAgICB0aGlzLmVkaXRvci5jb21wb25lbnQuZ2V0TmV4dFVwZGF0ZVByb21pc2UoKS50aGVuKCgpID0+IHtcbiAgICAgIHRoaXMuaGlnaGxpZ2h0VGV4dEluQ3Vyc29yUm93cyh0aGlzLmlucHV0LCBkZWNvcmF0aW9uVHlwZSwgYmFja3dhcmRzKVxuICAgIH0pXG4gIH1cblxuICBnZXRQb2ludChmcm9tUG9pbnQpIHtcbiAgICBjb25zdCBzY2FuUmFuZ2UgPSB0aGlzLmVkaXRvci5idWZmZXJSYW5nZUZvckJ1ZmZlclJvdyhmcm9tUG9pbnQucm93KVxuICAgIGNvbnN0IHBvaW50cyA9IFtdXG4gICAgY29uc3QgcmVnZXggPSB0aGlzLmdldFJlZ2V4KHRoaXMuaW5wdXQpXG4gICAgY29uc3QgaW5kZXhXYW50QWNjZXNzID0gdGhpcy5nZXRDb3VudCgtMSlcblxuICAgIGNvbnN0IHRyYW5zbGF0aW9uID0gbmV3IFBvaW50KDAsIHRoaXMuaXNCYWNrd2FyZHMoKSA/IHRoaXMub2Zmc2V0IDogLXRoaXMub2Zmc2V0KVxuICAgIGlmICh0aGlzLnJlcGVhdGVkKSB7XG4gICAgICBmcm9tUG9pbnQgPSBmcm9tUG9pbnQudHJhbnNsYXRlKHRyYW5zbGF0aW9uLm5lZ2F0ZSgpKVxuICAgIH1cblxuICAgIGlmICh0aGlzLmlzQmFja3dhcmRzKCkpIHtcbiAgICAgIGlmICh0aGlzLmdldENvbmZpZyhcImZpbmRBY3Jvc3NMaW5lc1wiKSkgc2NhblJhbmdlLnN0YXJ0ID0gUG9pbnQuWkVST1xuXG4gICAgICB0aGlzLmVkaXRvci5iYWNrd2FyZHNTY2FuSW5CdWZmZXJSYW5nZShyZWdleCwgc2NhblJhbmdlLCAoe3JhbmdlLCBzdG9wfSkgPT4ge1xuICAgICAgICBpZiAocmFuZ2Uuc3RhcnQuaXNMZXNzVGhhbihmcm9tUG9pbnQpKSB7XG4gICAgICAgICAgcG9pbnRzLnB1c2gocmFuZ2Uuc3RhcnQpXG4gICAgICAgICAgaWYgKHBvaW50cy5sZW5ndGggPiBpbmRleFdhbnRBY2Nlc3MpIHtcbiAgICAgICAgICAgIHN0b3AoKVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHRoaXMuZ2V0Q29uZmlnKFwiZmluZEFjcm9zc0xpbmVzXCIpKSBzY2FuUmFuZ2UuZW5kID0gdGhpcy5lZGl0b3IuZ2V0RW9mQnVmZmVyUG9zaXRpb24oKVxuICAgICAgdGhpcy5lZGl0b3Iuc2NhbkluQnVmZmVyUmFuZ2UocmVnZXgsIHNjYW5SYW5nZSwgKHtyYW5nZSwgc3RvcH0pID0+IHtcbiAgICAgICAgaWYgKHJhbmdlLnN0YXJ0LmlzR3JlYXRlclRoYW4oZnJvbVBvaW50KSkge1xuICAgICAgICAgIHBvaW50cy5wdXNoKHJhbmdlLnN0YXJ0KVxuICAgICAgICAgIGlmIChwb2ludHMubGVuZ3RoID4gaW5kZXhXYW50QWNjZXNzKSB7XG4gICAgICAgICAgICBzdG9wKClcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfVxuXG4gICAgY29uc3QgcG9pbnQgPSBwb2ludHNbaW5kZXhXYW50QWNjZXNzXVxuICAgIGlmIChwb2ludCkgcmV0dXJuIHBvaW50LnRyYW5zbGF0ZSh0cmFuc2xhdGlvbilcbiAgfVxuXG4gIC8vIEZJWE1FOiBiYWQgbmFtaW5nLCB0aGlzIGZ1bmN0aW9uIG11c3QgcmV0dXJuIGluZGV4XG4gIGhpZ2hsaWdodFRleHRJbkN1cnNvclJvd3ModGV4dCwgZGVjb3JhdGlvblR5cGUsIGJhY2t3YXJkcywgaW5kZXggPSB0aGlzLmdldENvdW50KC0xKSwgYWRqdXN0SW5kZXggPSBmYWxzZSkge1xuICAgIGlmICghdGhpcy5nZXRDb25maWcoXCJoaWdobGlnaHRGaW5kQ2hhclwiKSkgcmV0dXJuXG5cbiAgICByZXR1cm4gdGhpcy52aW1TdGF0ZS5oaWdobGlnaHRGaW5kLmhpZ2hsaWdodEN1cnNvclJvd3MoXG4gICAgICB0aGlzLmdldFJlZ2V4KHRleHQpLFxuICAgICAgZGVjb3JhdGlvblR5cGUsXG4gICAgICBiYWNrd2FyZHMsXG4gICAgICB0aGlzLm9mZnNldCxcbiAgICAgIGluZGV4LFxuICAgICAgYWRqdXN0SW5kZXhcbiAgICApXG4gIH1cblxuICBtb3ZlQ3Vyc29yKGN1cnNvcikge1xuICAgIGNvbnN0IHBvaW50ID0gdGhpcy5nZXRQb2ludChjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKSlcbiAgICBpZiAocG9pbnQpIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihwb2ludClcbiAgICBlbHNlIHRoaXMucmVzdG9yZUVkaXRvclN0YXRlKClcblxuICAgIGlmICghdGhpcy5yZXBlYXRlZCkgdGhpcy5nbG9iYWxTdGF0ZS5zZXQoXCJjdXJyZW50RmluZFwiLCB0aGlzKVxuICB9XG5cbiAgZ2V0UmVnZXgodGVybSkge1xuICAgIGNvbnN0IG1vZGlmaWVycyA9IHRoaXMuaXNDYXNlU2Vuc2l0aXZlKHRlcm0pID8gXCJnXCIgOiBcImdpXCJcbiAgICByZXR1cm4gbmV3IFJlZ0V4cChfLmVzY2FwZVJlZ0V4cCh0ZXJtKSwgbW9kaWZpZXJzKVxuICB9XG59XG5GaW5kLnJlZ2lzdGVyKClcblxuLy8ga2V5bWFwOiBGXG5jbGFzcyBGaW5kQmFja3dhcmRzIGV4dGVuZHMgRmluZCB7XG4gIGluY2x1c2l2ZSA9IGZhbHNlXG4gIGJhY2t3YXJkcyA9IHRydWVcbn1cbkZpbmRCYWNrd2FyZHMucmVnaXN0ZXIoKVxuXG4vLyBrZXltYXA6IHRcbmNsYXNzIFRpbGwgZXh0ZW5kcyBGaW5kIHtcbiAgb2Zmc2V0ID0gMVxuICBnZXRQb2ludCguLi5hcmdzKSB7XG4gICAgY29uc3QgcG9pbnQgPSBzdXBlci5nZXRQb2ludCguLi5hcmdzKVxuICAgIHRoaXMubW92ZVN1Y2NlZWRlZCA9IHBvaW50ICE9IG51bGxcbiAgICByZXR1cm4gcG9pbnRcbiAgfVxufVxuVGlsbC5yZWdpc3RlcigpXG5cbi8vIGtleW1hcDogVFxuY2xhc3MgVGlsbEJhY2t3YXJkcyBleHRlbmRzIFRpbGwge1xuICBpbmNsdXNpdmUgPSBmYWxzZVxuICBiYWNrd2FyZHMgPSB0cnVlXG59XG5UaWxsQmFja3dhcmRzLnJlZ2lzdGVyKClcblxuLy8gTWFya1xuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8ga2V5bWFwOiBgXG5jbGFzcyBNb3ZlVG9NYXJrIGV4dGVuZHMgTW90aW9uIHtcbiAganVtcCA9IHRydWVcbiAgcmVxdWlyZUlucHV0ID0gdHJ1ZVxuICBpbnB1dCA9IG51bGxcblxuICBpbml0aWFsaXplKCkge1xuICAgIGlmICghdGhpcy5pc0NvbXBsZXRlKCkpIHRoaXMucmVhZENoYXIoKVxuICAgIHJldHVybiBzdXBlci5pbml0aWFsaXplKClcbiAgfVxuXG4gIGdldFBvaW50KCkge1xuICAgIHJldHVybiB0aGlzLnZpbVN0YXRlLm1hcmsuZ2V0KHRoaXMuaW5wdXQpXG4gIH1cblxuICBtb3ZlQ3Vyc29yKGN1cnNvcikge1xuICAgIGNvbnN0IHBvaW50ID0gdGhpcy5nZXRQb2ludCgpXG4gICAgaWYgKHBvaW50KSB7XG4gICAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24ocG9pbnQpXG4gICAgICBjdXJzb3IuYXV0b3Njcm9sbCh7Y2VudGVyOiB0cnVlfSlcbiAgICB9XG4gIH1cbn1cbk1vdmVUb01hcmsucmVnaXN0ZXIoKVxuXG4vLyBrZXltYXA6ICdcbmNsYXNzIE1vdmVUb01hcmtMaW5lIGV4dGVuZHMgTW92ZVRvTWFyayB7XG4gIHdpc2UgPSBcImxpbmV3aXNlXCJcblxuICBnZXRQb2ludCgpIHtcbiAgICBjb25zdCBwb2ludCA9IHN1cGVyLmdldFBvaW50KClcbiAgICBpZiAocG9pbnQpIHtcbiAgICAgIHJldHVybiB0aGlzLmdldEZpcnN0Q2hhcmFjdGVyUG9zaXRpb25Gb3JCdWZmZXJSb3cocG9pbnQucm93KVxuICAgIH1cbiAgfVxufVxuTW92ZVRvTWFya0xpbmUucmVnaXN0ZXIoKVxuXG4vLyBGb2xkXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBNb3ZlVG9QcmV2aW91c0ZvbGRTdGFydCBleHRlbmRzIE1vdGlvbiB7XG4gIHdpc2UgPSBcImNoYXJhY3Rlcndpc2VcIlxuICB3aGljaCA9IFwic3RhcnRcIlxuICBkaXJlY3Rpb24gPSBcInByZXZcIlxuXG4gIGV4ZWN1dGUoKSB7XG4gICAgdGhpcy5yb3dzID0gdGhpcy5nZXRGb2xkUm93cyh0aGlzLndoaWNoKVxuICAgIGlmICh0aGlzLmRpcmVjdGlvbiA9PT0gXCJwcmV2XCIpIHRoaXMucm93cy5yZXZlcnNlKClcblxuICAgIHN1cGVyLmV4ZWN1dGUoKVxuICB9XG5cbiAgZ2V0Rm9sZFJvd3Mod2hpY2gpIHtcbiAgICBjb25zdCBpbmRleCA9IHdoaWNoID09PSBcInN0YXJ0XCIgPyAwIDogMVxuICAgIGNvbnN0IHJvd3MgPSBnZXRDb2RlRm9sZFJvd1Jhbmdlcyh0aGlzLmVkaXRvcikubWFwKHJvd1JhbmdlID0+IHJvd1JhbmdlW2luZGV4XSlcbiAgICByZXR1cm4gXy5zb3J0QnkoXy51bmlxKHJvd3MpLCByb3cgPT4gcm93KVxuICB9XG5cbiAgZ2V0U2NhblJvd3MoY3Vyc29yKSB7XG4gICAgY29uc3QgY3Vyc29yUm93ID0gY3Vyc29yLmdldEJ1ZmZlclJvdygpXG4gICAgY29uc3QgaXNWYWxkID0gdGhpcy5kaXJlY3Rpb24gPT09IFwicHJldlwiID8gcm93ID0+IHJvdyA8IGN1cnNvclJvdyA6IHJvdyA9PiByb3cgPiBjdXJzb3JSb3dcbiAgICByZXR1cm4gdGhpcy5yb3dzLmZpbHRlcihpc1ZhbGQpXG4gIH1cblxuICBkZXRlY3RSb3coY3Vyc29yKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0U2NhblJvd3MoY3Vyc29yKVswXVxuICB9XG5cbiAgbW92ZUN1cnNvcihjdXJzb3IpIHtcbiAgICB0aGlzLm1vdmVDdXJzb3JDb3VudFRpbWVzKGN1cnNvciwgKCkgPT4ge1xuICAgICAgY29uc3Qgcm93ID0gdGhpcy5kZXRlY3RSb3coY3Vyc29yKVxuICAgICAgaWYgKHJvdyAhPSBudWxsKSBtb3ZlQ3Vyc29yVG9GaXJzdENoYXJhY3RlckF0Um93KGN1cnNvciwgcm93KVxuICAgIH0pXG4gIH1cbn1cbk1vdmVUb1ByZXZpb3VzRm9sZFN0YXJ0LnJlZ2lzdGVyKClcblxuY2xhc3MgTW92ZVRvTmV4dEZvbGRTdGFydCBleHRlbmRzIE1vdmVUb1ByZXZpb3VzRm9sZFN0YXJ0IHtcbiAgZGlyZWN0aW9uID0gXCJuZXh0XCJcbn1cbk1vdmVUb05leHRGb2xkU3RhcnQucmVnaXN0ZXIoKVxuXG5jbGFzcyBNb3ZlVG9QcmV2aW91c0ZvbGRTdGFydFdpdGhTYW1lSW5kZW50IGV4dGVuZHMgTW92ZVRvUHJldmlvdXNGb2xkU3RhcnQge1xuICBkZXRlY3RSb3coY3Vyc29yKSB7XG4gICAgY29uc3QgYmFzZUluZGVudExldmVsID0gdGhpcy5lZGl0b3IuaW5kZW50YXRpb25Gb3JCdWZmZXJSb3coY3Vyc29yLmdldEJ1ZmZlclJvdygpKVxuICAgIHJldHVybiB0aGlzLmdldFNjYW5Sb3dzKGN1cnNvcikuZmluZChyb3cgPT4gdGhpcy5lZGl0b3IuaW5kZW50YXRpb25Gb3JCdWZmZXJSb3cocm93KSA9PT0gYmFzZUluZGVudExldmVsKVxuICB9XG59XG5Nb3ZlVG9QcmV2aW91c0ZvbGRTdGFydFdpdGhTYW1lSW5kZW50LnJlZ2lzdGVyKClcblxuY2xhc3MgTW92ZVRvTmV4dEZvbGRTdGFydFdpdGhTYW1lSW5kZW50IGV4dGVuZHMgTW92ZVRvUHJldmlvdXNGb2xkU3RhcnRXaXRoU2FtZUluZGVudCB7XG4gIGRpcmVjdGlvbiA9IFwibmV4dFwiXG59XG5Nb3ZlVG9OZXh0Rm9sZFN0YXJ0V2l0aFNhbWVJbmRlbnQucmVnaXN0ZXIoKVxuXG5jbGFzcyBNb3ZlVG9QcmV2aW91c0ZvbGRFbmQgZXh0ZW5kcyBNb3ZlVG9QcmV2aW91c0ZvbGRTdGFydCB7XG4gIHdoaWNoID0gXCJlbmRcIlxufVxuTW92ZVRvUHJldmlvdXNGb2xkRW5kLnJlZ2lzdGVyKClcblxuY2xhc3MgTW92ZVRvTmV4dEZvbGRFbmQgZXh0ZW5kcyBNb3ZlVG9QcmV2aW91c0ZvbGRFbmQge1xuICBkaXJlY3Rpb24gPSBcIm5leHRcIlxufVxuTW92ZVRvTmV4dEZvbGRFbmQucmVnaXN0ZXIoKVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBNb3ZlVG9QcmV2aW91c0Z1bmN0aW9uIGV4dGVuZHMgTW92ZVRvUHJldmlvdXNGb2xkU3RhcnQge1xuICBkaXJlY3Rpb24gPSBcInByZXZcIlxuICBkZXRlY3RSb3coY3Vyc29yKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0U2NhblJvd3MoY3Vyc29yKS5maW5kKHJvdyA9PiBpc0luY2x1ZGVGdW5jdGlvblNjb3BlRm9yUm93KHRoaXMuZWRpdG9yLCByb3cpKVxuICB9XG59XG5Nb3ZlVG9QcmV2aW91c0Z1bmN0aW9uLnJlZ2lzdGVyKClcblxuY2xhc3MgTW92ZVRvTmV4dEZ1bmN0aW9uIGV4dGVuZHMgTW92ZVRvUHJldmlvdXNGdW5jdGlvbiB7XG4gIGRpcmVjdGlvbiA9IFwibmV4dFwiXG59XG5Nb3ZlVG9OZXh0RnVuY3Rpb24ucmVnaXN0ZXIoKVxuXG4vLyBTY29wZSBiYXNlZFxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgTW92ZVRvUG9zaXRpb25CeVNjb3BlIGV4dGVuZHMgTW90aW9uIHtcbiAgZGlyZWN0aW9uID0gXCJiYWNrd2FyZFwiXG4gIHNjb3BlID0gXCIuXCJcblxuICBnZXRQb2ludChmcm9tUG9pbnQpIHtcbiAgICByZXR1cm4gZGV0ZWN0U2NvcGVTdGFydFBvc2l0aW9uRm9yU2NvcGUodGhpcy5lZGl0b3IsIGZyb21Qb2ludCwgdGhpcy5kaXJlY3Rpb24sIHRoaXMuc2NvcGUpXG4gIH1cblxuICBtb3ZlQ3Vyc29yKGN1cnNvcikge1xuICAgIHRoaXMubW92ZUN1cnNvckNvdW50VGltZXMoY3Vyc29yLCAoKSA9PiB7XG4gICAgICB0aGlzLnNldEJ1ZmZlclBvc2l0aW9uU2FmZWx5KGN1cnNvciwgdGhpcy5nZXRQb2ludChjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKSkpXG4gICAgfSlcbiAgfVxufVxuTW92ZVRvUG9zaXRpb25CeVNjb3BlLnJlZ2lzdGVyKGZhbHNlKVxuXG5jbGFzcyBNb3ZlVG9QcmV2aW91c1N0cmluZyBleHRlbmRzIE1vdmVUb1Bvc2l0aW9uQnlTY29wZSB7XG4gIGRpcmVjdGlvbiA9IFwiYmFja3dhcmRcIlxuICBzY29wZSA9IFwic3RyaW5nLmJlZ2luXCJcbn1cbk1vdmVUb1ByZXZpb3VzU3RyaW5nLnJlZ2lzdGVyKClcblxuY2xhc3MgTW92ZVRvTmV4dFN0cmluZyBleHRlbmRzIE1vdmVUb1ByZXZpb3VzU3RyaW5nIHtcbiAgZGlyZWN0aW9uID0gXCJmb3J3YXJkXCJcbn1cbk1vdmVUb05leHRTdHJpbmcucmVnaXN0ZXIoKVxuXG5jbGFzcyBNb3ZlVG9QcmV2aW91c051bWJlciBleHRlbmRzIE1vdmVUb1Bvc2l0aW9uQnlTY29wZSB7XG4gIGRpcmVjdGlvbiA9IFwiYmFja3dhcmRcIlxuICBzY29wZSA9IFwiY29uc3RhbnQubnVtZXJpY1wiXG59XG5Nb3ZlVG9QcmV2aW91c051bWJlci5yZWdpc3RlcigpXG5cbmNsYXNzIE1vdmVUb05leHROdW1iZXIgZXh0ZW5kcyBNb3ZlVG9QcmV2aW91c051bWJlciB7XG4gIGRpcmVjdGlvbiA9IFwiZm9yd2FyZFwiXG59XG5Nb3ZlVG9OZXh0TnVtYmVyLnJlZ2lzdGVyKClcblxuY2xhc3MgTW92ZVRvTmV4dE9jY3VycmVuY2UgZXh0ZW5kcyBNb3Rpb24ge1xuICAvLyBFbnN1cmUgdGhpcyBjb21tYW5kIGlzIGF2YWlsYWJsZSB3aGVuIG9ubHkgaGFzLW9jY3VycmVuY2VcbiAgc3RhdGljIGNvbW1hbmRTY29wZSA9IFwiYXRvbS10ZXh0LWVkaXRvci52aW0tbW9kZS1wbHVzLmhhcy1vY2N1cnJlbmNlXCJcbiAganVtcCA9IHRydWVcbiAgZGlyZWN0aW9uID0gXCJuZXh0XCJcblxuICBleGVjdXRlKCkge1xuICAgIHRoaXMucmFuZ2VzID0gc29ydFJhbmdlcyh0aGlzLm9jY3VycmVuY2VNYW5hZ2VyLmdldE1hcmtlcnMoKS5tYXAobWFya2VyID0+IG1hcmtlci5nZXRCdWZmZXJSYW5nZSgpKSlcbiAgICBzdXBlci5leGVjdXRlKClcbiAgfVxuXG4gIG1vdmVDdXJzb3IoY3Vyc29yKSB7XG4gICAgY29uc3QgcmFuZ2UgPSB0aGlzLnJhbmdlc1tnZXRJbmRleCh0aGlzLmdldEluZGV4KGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpKSwgdGhpcy5yYW5nZXMpXVxuICAgIGNvbnN0IHBvaW50ID0gcmFuZ2Uuc3RhcnRcbiAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24ocG9pbnQsIHthdXRvc2Nyb2xsOiBmYWxzZX0pXG5cbiAgICBpZiAoY3Vyc29yLmlzTGFzdEN1cnNvcigpKSB7XG4gICAgICB0aGlzLmVkaXRvci51bmZvbGRCdWZmZXJSb3cocG9pbnQucm93KVxuICAgICAgc21hcnRTY3JvbGxUb0J1ZmZlclBvc2l0aW9uKHRoaXMuZWRpdG9yLCBwb2ludClcbiAgICB9XG5cbiAgICBpZiAodGhpcy5nZXRDb25maWcoXCJmbGFzaE9uTW92ZVRvT2NjdXJyZW5jZVwiKSkge1xuICAgICAgdGhpcy52aW1TdGF0ZS5mbGFzaChyYW5nZSwge3R5cGU6IFwic2VhcmNoXCJ9KVxuICAgIH1cbiAgfVxuXG4gIGdldEluZGV4KGZyb21Qb2ludCkge1xuICAgIGNvbnN0IGluZGV4ID0gdGhpcy5yYW5nZXMuZmluZEluZGV4KHJhbmdlID0+IHJhbmdlLnN0YXJ0LmlzR3JlYXRlclRoYW4oZnJvbVBvaW50KSlcbiAgICByZXR1cm4gKGluZGV4ID49IDAgPyBpbmRleCA6IDApICsgdGhpcy5nZXRDb3VudCgtMSlcbiAgfVxufVxuTW92ZVRvTmV4dE9jY3VycmVuY2UucmVnaXN0ZXIoKVxuXG5jbGFzcyBNb3ZlVG9QcmV2aW91c09jY3VycmVuY2UgZXh0ZW5kcyBNb3ZlVG9OZXh0T2NjdXJyZW5jZSB7XG4gIGRpcmVjdGlvbiA9IFwicHJldmlvdXNcIlxuXG4gIGdldEluZGV4KGZyb21Qb2ludCkge1xuICAgIGNvbnN0IHJhbmdlcyA9IHRoaXMucmFuZ2VzLnNsaWNlKCkucmV2ZXJzZSgpXG4gICAgY29uc3QgcmFuZ2UgPSByYW5nZXMuZmluZChyYW5nZSA9PiByYW5nZS5lbmQuaXNMZXNzVGhhbihmcm9tUG9pbnQpKVxuICAgIGNvbnN0IGluZGV4ID0gcmFuZ2UgPyB0aGlzLnJhbmdlcy5pbmRleE9mKHJhbmdlKSA6IHRoaXMucmFuZ2VzLmxlbmd0aCAtIDFcbiAgICByZXR1cm4gaW5kZXggLSB0aGlzLmdldENvdW50KC0xKVxuICB9XG59XG5Nb3ZlVG9QcmV2aW91c09jY3VycmVuY2UucmVnaXN0ZXIoKVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBrZXltYXA6ICVcbmNsYXNzIE1vdmVUb1BhaXIgZXh0ZW5kcyBNb3Rpb24ge1xuICBpbmNsdXNpdmUgPSB0cnVlXG4gIGp1bXAgPSB0cnVlXG4gIG1lbWJlciA9IFtcIlBhcmVudGhlc2lzXCIsIFwiQ3VybHlCcmFja2V0XCIsIFwiU3F1YXJlQnJhY2tldFwiXVxuXG4gIG1vdmVDdXJzb3IoY3Vyc29yKSB7XG4gICAgdGhpcy5zZXRCdWZmZXJQb3NpdGlvblNhZmVseShjdXJzb3IsIHRoaXMuZ2V0UG9pbnQoY3Vyc29yKSlcbiAgfVxuXG4gIGdldFBvaW50Rm9yVGFnKHBvaW50KSB7XG4gICAgY29uc3QgcGFpckluZm8gPSB0aGlzLmdldEluc3RhbmNlKFwiQVRhZ1wiKS5nZXRQYWlySW5mbyhwb2ludClcbiAgICBpZiAoIXBhaXJJbmZvKSByZXR1cm5cblxuICAgIGxldCB7b3BlblJhbmdlLCBjbG9zZVJhbmdlfSA9IHBhaXJJbmZvXG4gICAgb3BlblJhbmdlID0gb3BlblJhbmdlLnRyYW5zbGF0ZShbMCwgKzFdLCBbMCwgLTFdKVxuICAgIGNsb3NlUmFuZ2UgPSBjbG9zZVJhbmdlLnRyYW5zbGF0ZShbMCwgKzFdLCBbMCwgLTFdKVxuICAgIGlmIChvcGVuUmFuZ2UuY29udGFpbnNQb2ludChwb2ludCkgJiYgIXBvaW50LmlzRXF1YWwob3BlblJhbmdlLmVuZCkpIHtcbiAgICAgIHJldHVybiBjbG9zZVJhbmdlLnN0YXJ0XG4gICAgfVxuICAgIGlmIChjbG9zZVJhbmdlLmNvbnRhaW5zUG9pbnQocG9pbnQpICYmICFwb2ludC5pc0VxdWFsKGNsb3NlUmFuZ2UuZW5kKSkge1xuICAgICAgcmV0dXJuIG9wZW5SYW5nZS5zdGFydFxuICAgIH1cbiAgfVxuXG4gIGdldFBvaW50KGN1cnNvcikge1xuICAgIGNvbnN0IGN1cnNvclBvc2l0aW9uID0gY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKClcbiAgICBjb25zdCBjdXJzb3JSb3cgPSBjdXJzb3JQb3NpdGlvbi5yb3dcbiAgICBjb25zdCBwb2ludCA9IHRoaXMuZ2V0UG9pbnRGb3JUYWcoY3Vyc29yUG9zaXRpb24pXG4gICAgaWYgKHBvaW50KSByZXR1cm4gcG9pbnRcblxuICAgIC8vIEFBbnlQYWlyQWxsb3dGb3J3YXJkaW5nIHJldHVybiBmb3J3YXJkaW5nIHJhbmdlIG9yIGVuY2xvc2luZyByYW5nZS5cbiAgICBjb25zdCByYW5nZSA9IHRoaXMuZ2V0SW5zdGFuY2UoXCJBQW55UGFpckFsbG93Rm9yd2FyZGluZ1wiLCB7bWVtYmVyOiB0aGlzLm1lbWJlcn0pLmdldFJhbmdlKGN1cnNvci5zZWxlY3Rpb24pXG4gICAgaWYgKCFyYW5nZSkgcmV0dXJuXG5cbiAgICBjb25zdCB7c3RhcnQsIGVuZH0gPSByYW5nZVxuICAgIGlmIChzdGFydC5yb3cgPT09IGN1cnNvclJvdyAmJiBzdGFydC5pc0dyZWF0ZXJUaGFuT3JFcXVhbChjdXJzb3JQb3NpdGlvbikpIHtcbiAgICAgIC8vIEZvcndhcmRpbmcgcmFuZ2UgZm91bmRcbiAgICAgIHJldHVybiBlbmQudHJhbnNsYXRlKFswLCAtMV0pXG4gICAgfSBlbHNlIGlmIChlbmQucm93ID09PSBjdXJzb3JQb3NpdGlvbi5yb3cpIHtcbiAgICAgIC8vIEVuY2xvc2luZyByYW5nZSB3YXMgcmV0dXJuZWRcbiAgICAgIC8vIFdlIG1vdmUgdG8gc3RhcnQoIG9wZW4tcGFpciApIG9ubHkgd2hlbiBjbG9zZS1wYWlyIHdhcyBhdCBzYW1lIHJvdyBhcyBjdXJzb3Itcm93LlxuICAgICAgcmV0dXJuIHN0YXJ0XG4gICAgfVxuICB9XG59XG5Nb3ZlVG9QYWlyLnJlZ2lzdGVyKClcbiJdfQ==