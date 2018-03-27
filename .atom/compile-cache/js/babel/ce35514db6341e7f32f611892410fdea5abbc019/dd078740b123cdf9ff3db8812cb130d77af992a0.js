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
      var originalPosition = this.jump && cursor.isLastCursor() ? cursor.getBufferPosition() : undefined;

      this.moveCursor(cursor);

      if (originalPosition && !cursor.getBufferPosition().isEqual(originalPosition)) {
        this.vimState.mark.set("`", originalPosition);
        this.vimState.mark.set("'", originalPosition);
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

    // NOTE: selection is already "normalized" before this function is called.
  }, {
    key: "select",
    value: function select() {
      var _this = this;

      // need to care was visual for `.` repeated.
      var isOrWasVisual = this.operator["instanceof"]("SelectBase") || this.is("CurrentSelection");

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
        this.utils.setBufferRow(cursor, row, options);
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
    this.pointInfoByCursor = new Map();
  }

  _createClass(CurrentSelection, [{
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
      var _this3 = this;

      var allowWrap = this.getConfig("wrapLeftRightMotion");
      this.moveCursorCountTimes(cursor, function () {
        return _this3.utils.moveCursorLeft(cursor, { allowWrap: allowWrap });
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
    key: "moveCursor",
    value: function moveCursor(cursor) {
      var _this4 = this;

      var allowWrap = this.getConfig("wrapLeftRightMotion");

      this.moveCursorCountTimes(cursor, function () {
        _this4.editor.unfoldBufferRow(cursor.getBufferRow());

        // - When `wrapLeftRightMotion` enabled and executed as pure-motion in `normal-mode`,
        //   we need to move **again** to wrap to next-line if it rached to EOL.
        // - Expression `!this.operator` means normal-mode motion.
        // - Expression `this.mode === "normal"` is not appropreate since it matches `x` operator's target case.
        var needMoveAgain = allowWrap && !_this4.operator && !cursor.isAtEndOfLine();

        _this4.utils.moveCursorRight(cursor, { allowWrap: allowWrap });

        if (needMoveAgain && cursor.isAtEndOfLine()) {
          _this4.utils.moveCursorRight(cursor, { allowWrap: allowWrap });
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
      this.utils.setBufferColumn(cursor, cursor.getBufferColumn() + this.getCount());
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
      row = this.wrap && row === min ? this.getVimLastBufferRow() : this.utils.limitNumber(row - 1, { min: min });
      return this.getFoldStartRowForRow(row);
    }
  }, {
    key: "moveCursor",
    value: function moveCursor(cursor) {
      var _this5 = this;

      this.moveCursorCountTimes(cursor, function () {
        return _this5.utils.setBufferRow(cursor, _this5.getBufferRow(cursor.getBufferRow()));
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
        row = this.utils.getLargestFoldRangeContainsBufferRow(this.editor, row).end.row;
      }
      var max = this.getVimLastBufferRow();
      return this.wrap && row >= max ? 0 : this.utils.limitNumber(row + 1, { max: max });
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
      var _this6 = this;

      this.moveCursorCountTimes(cursor, function () {
        return _this6.utils.moveCursorUpScreen(cursor);
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
      var _this7 = this;

      this.moveCursorCountTimes(cursor, function () {
        return _this7.utils.moveCursorDownScreen(cursor);
      });
    }
  }]);

  return MoveDownScreen;
})(MoveUpScreen);

MoveDownScreen.register();

var MoveUpToEdge = (function (_Motion7) {
  _inherits(MoveUpToEdge, _Motion7);

  function MoveUpToEdge() {
    _classCallCheck(this, MoveUpToEdge);

    _get(Object.getPrototypeOf(MoveUpToEdge.prototype), "constructor", this).apply(this, arguments);

    this.wise = "linewise";
    this.jump = true;
    this.direction = "previous";
  }

  _createClass(MoveUpToEdge, [{
    key: "moveCursor",
    value: function moveCursor(cursor) {
      var _this8 = this;

      this.moveCursorCountTimes(cursor, function () {
        _this8.setScreenPositionSafely(cursor, _this8.getPoint(cursor.getScreenPosition()));
      });
    }
  }, {
    key: "getPoint",
    value: function getPoint(fromPoint) {
      var column = fromPoint.column;
      var startRow = fromPoint.row;

      for (var row of this.getScreenRows({ startRow: startRow, direction: this.direction })) {
        var point = new Point(row, column);
        if (this.isEdge(point)) return point;
      }
    }
  }, {
    key: "isEdge",
    value: function isEdge(point) {
      // If point is stoppable and above or below point is not stoppable, it's Edge!
      return this.isStoppable(point) && (!this.isStoppable(point.translate([-1, 0])) || !this.isStoppable(point.translate([+1, 0])));
    }
  }, {
    key: "isStoppable",
    value: function isStoppable(point) {
      return this.isNonWhiteSpace(point) || this.isFirstRowOrLastRowAndEqualAfterClipped(point) ||
      // If right or left column is non-white-space char, it's stoppable.
      this.isNonWhiteSpace(point.translate([0, -1])) && this.isNonWhiteSpace(point.translate([0, +1]));
    }
  }, {
    key: "isNonWhiteSpace",
    value: function isNonWhiteSpace(point) {
      var char = this.utils.getTextInScreenRange(this.editor, Range.fromPointWithDelta(point, 0, 1));
      return char != null && /\S/.test(char);
    }
  }, {
    key: "isFirstRowOrLastRowAndEqualAfterClipped",
    value: function isFirstRowOrLastRowAndEqualAfterClipped(point) {
      // In notmal-mode, cursor is NOT stoppable to EOL of non-blank row.
      // So explicitly guard to not answer it stoppable.
      if (this.isMode("normal") && this.utils.pointIsAtEndOfLineAtNonEmptyRow(this.editor, point)) {
        return false;
      }

      return (point.row === 0 || point.row === this.getVimLastScreenRow()) && point.isEqual(this.editor.clipScreenPosition(point));
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

    this.direction = "next";
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

      this.scanForward(regex, { from: from }, function (_ref) {
        var range = _ref.range;
        var matchText = _ref.matchText;
        var stop = _ref.stop;

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
        return this.utils.pointIsAtEndOfLineAtNonEmptyRow(this.editor, point) && !point.isEqual(this.getVimEofBufferPosition()) ? point.traverse([1, 0]) : point;
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
      var _this9 = this;

      var cursorPosition = cursor.getBufferPosition();
      if (this.utils.pointIsAtVimEndOfFile(this.editor, cursorPosition)) return;

      var wasOnWhiteSpace = this.utils.pointIsOnWhiteSpace(this.editor, cursorPosition);
      var isAsTargetExceptSelectInVisualMode = this.isAsTargetExceptSelectInVisualMode();

      this.moveCursorCountTimes(cursor, function (_ref2) {
        var isFinal = _ref2.isFinal;

        var cursorPosition = cursor.getBufferPosition();
        if (_this9.utils.isEmptyRow(_this9.editor, cursorPosition.row) && isAsTargetExceptSelectInVisualMode) {
          cursor.setBufferPosition(cursorPosition.traverse([1, 0]));
        } else {
          var regex = _this9.wordRegex || cursor.wordRegExp();
          var point = _this9.getPoint(regex, cursorPosition);
          if (isFinal && isAsTargetExceptSelectInVisualMode) {
            if (_this9.operator.is("Change") && !wasOnWhiteSpace) {
              point = cursor.getEndOfCurrentWordBufferPosition({ wordRegex: _this9.wordRegex });
            } else {
              point = Point.min(point, _this9.utils.getEndOfLineForBufferRow(_this9.editor, cursorPosition.row));
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
      var _this10 = this;

      this.moveCursorCountTimes(cursor, function () {
        var point = cursor.getBeginningOfCurrentWordBufferPosition({ wordRegex: _this10.wordRegex });
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
      this.utils.moveCursorToNextNonWhitespace(cursor);
      var point = cursor.getEndOfCurrentWordBufferPosition({ wordRegex: this.wordRegex }).translate([0, -1]);
      cursor.setBufferPosition(Point.min(point, this.getVimEofBufferPosition()));
    }
  }, {
    key: "moveCursor",
    value: function moveCursor(cursor) {
      var _this11 = this;

      this.moveCursorCountTimes(cursor, function () {
        var originalPoint = cursor.getBufferPosition();
        _this11.moveToNextEndOfWord(cursor);
        if (originalPoint.isEqual(cursor.getBufferPosition())) {
          // Retry from right column if cursor was already on EndOfWord
          cursor.moveRight();
          _this11.moveToNextEndOfWord(cursor);
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

      for (var i in this.utils.getList(1, times)) {
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
      var _this12 = this;

      this.moveCursorCountTimes(cursor, function () {
        _this12.setBufferPositionSafely(cursor, _this12.getPoint(cursor.getBufferPosition()));
      });
    }
  }, {
    key: "getPoint",
    value: function getPoint(fromPoint) {
      return this.direction === "next" ? this.getNextStartOfSentence(fromPoint) : this.getPreviousStartOfSentence(fromPoint);
    }
  }, {
    key: "isBlankRow",
    value: function isBlankRow(row) {
      return this.editor.isBufferRowBlank(row);
    }
  }, {
    key: "getNextStartOfSentence",
    value: function getNextStartOfSentence(from) {
      var _this13 = this;

      var foundPoint = undefined;
      this.scanForward(this.sentenceRegex, { from: from }, function (_ref3) {
        var range = _ref3.range;
        var matchText = _ref3.matchText;
        var match = _ref3.match;
        var stop = _ref3.stop;

        if (match[1] != null) {
          var startRow = range.start.row;
          var endRow = range.end.row;

          if (_this13.skipBlankRow && _this13.isBlankRow(endRow)) return;
          if (_this13.isBlankRow(startRow) !== _this13.isBlankRow(endRow)) {
            foundPoint = _this13.getFirstCharacterPositionForBufferRow(endRow);
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
      var _this14 = this;

      var foundPoint = undefined;
      this.scanBackward(this.sentenceRegex, { from: from }, function (_ref4) {
        var range = _ref4.range;
        var matchText = _ref4.matchText;
        var match = _ref4.match;
        var stop = _ref4.stop;

        if (match[1] != null) {
          var startRow = range.start.row;
          var endRow = range.end.row;

          if (!_this14.isBlankRow(endRow) && _this14.isBlankRow(startRow)) {
            var point = _this14.getFirstCharacterPositionForBufferRow(endRow);
            if (point.isLessThan(from)) {
              foundPoint = point;
            } else {
              if (_this14.skipBlankRow) return;
              foundPoint = _this14.getFirstCharacterPositionForBufferRow(startRow);
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
      var _this15 = this;

      this.moveCursorCountTimes(cursor, function () {
        _this15.setBufferPositionSafely(cursor, _this15.getPoint(cursor.getBufferPosition()));
      });
    }
  }, {
    key: "getPoint",
    value: function getPoint(fromPoint) {
      var startRow = fromPoint.row;
      var wasBlankRow = this.editor.isBufferRowBlank(startRow);
      for (var row of this.getBufferRows({ startRow: startRow, direction: this.direction })) {
        var isBlankRow = this.editor.isBufferRowBlank(row);
        if (!wasBlankRow && isBlankRow) {
          return new Point(row, 0);
        }
        wasBlankRow = isBlankRow;
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
      this.utils.setBufferColumn(cursor, 0);
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
      this.utils.setBufferColumn(cursor, this.getCount(-1));
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
      var row = this.getValidVimBufferRow(cursor.getBufferRow() + this.getCount(-1));
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
    value: function getPoint(_ref5) {
      var row = _ref5.row;

      row = this.utils.limitNumber(row + this.getCount(-1), { max: this.getVimLastBufferRow() });
      var range = this.utils.findRangeInBufferRow(this.editor, /\S|^/, row, { direction: "backward" });
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
      var _this16 = this;

      this.moveCursorCountTimes(cursor, function () {
        var row = _this16.getValidVimBufferRow(cursor.getBufferRow() - 1);
        cursor.setBufferPosition([row, 0]);
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
      var _this17 = this;

      this.moveCursorCountTimes(cursor, function () {
        var point = cursor.getBufferPosition();
        if (point.row < _this17.getVimLastBufferRow()) {
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

var MoveToScreenColumn = (function (_Motion18) {
  _inherits(MoveToScreenColumn, _Motion18);

  function MoveToScreenColumn() {
    _classCallCheck(this, MoveToScreenColumn);

    _get(Object.getPrototypeOf(MoveToScreenColumn.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(MoveToScreenColumn, [{
    key: "moveCursor",
    value: function moveCursor(cursor) {
      var allowOffScreenPosition = this.getConfig("allowMoveToOffScreenColumnOnScreenLineMotion");
      var point = this.utils.getScreenPositionForScreenRow(this.editor, cursor.getScreenRow(), this.which, {
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

// keymap: g g

var MoveToFirstLine = (function (_Motion19) {
  _inherits(MoveToFirstLine, _Motion19);

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
      this.setCursorBufferRow(cursor, this.getValidVimBufferRow(this.getRow()));
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
      var percent = this.utils.limitNumber(this.getCount(), { max: 100 });
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
      this.utils.setBufferRow(cursor, row);
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

      return this.utils.limitNumber(_get(Object.getPrototypeOf(MoveToRelativeLineMinimumTwo.prototype), "getCount", this).apply(this, args), { min: 2 });
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
      var firstRow = this.editor.getFirstVisibleScreenRow();
      var offset = this.getScrolloff();
      if (firstRow === 0) {
        offset = 0;
      }
      offset = this.utils.limitNumber(this.getCount(-1), { min: offset });
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
      var startRow = this.editor.getFirstVisibleScreenRow();
      var endRow = this.utils.limitNumber(this.editor.getLastVisibleScreenRow(), { max: this.getVimLastScreenRow() });
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
      var vimLastScreenRow = this.getVimLastScreenRow();
      var row = this.utils.limitNumber(this.editor.getLastVisibleScreenRow(), { max: vimLastScreenRow });
      var offset = this.getScrolloff() + 1;
      if (row === vimLastScreenRow) {
        offset = 0;
      }
      offset = this.utils.limitNumber(this.getCount(-1), { min: offset });
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
      var _this18 = this;

      var topPixelFrom = { top: this.getPixelRectTopForSceenRow(fromRow) };
      var topPixelTo = { top: this.getPixelRectTopForSceenRow(toRow) };
      // [NOTE]
      // intentionally use `element.component.setScrollTop` instead of `element.setScrollTop`.
      // SInce element.setScrollTop will throw exception when element.component no longer exists.
      var step = function step(newTop) {
        if (_this18.editor.element.component) {
          _this18.editor.element.component.setScrollTop(newTop);
          _this18.editor.element.component.updateSync();
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
      var screenRow = this.utils.getValidVimScreenRow(this.editor, cursor.getScreenRow() + this.getAmountOfRows());
      return this.editor.bufferRowForScreenRow(screenRow);
    }
  }, {
    key: "moveCursor",
    value: function moveCursor(cursor) {
      var _this19 = this;

      var bufferRow = this.getBufferRow(cursor);
      this.setCursorBufferRow(cursor, this.getBufferRow(cursor), { autoscroll: false });

      if (cursor.isLastCursor()) {
        (function () {
          if (_this19.isSmoothScrollEnabled()) _this19.vimState.finishScrollAnimation();

          var firstVisibileScreenRow = _this19.editor.getFirstVisibleScreenRow();
          var newFirstVisibileBufferRow = _this19.editor.bufferRowForScreenRow(firstVisibileScreenRow + _this19.getAmountOfRows());
          var newFirstVisibileScreenRow = _this19.editor.screenRowForBufferRow(newFirstVisibileBufferRow);
          var done = function done() {
            _this19.editor.setFirstVisibleScreenRow(newFirstVisibileScreenRow);
            // [FIXME] sometimes, scrollTop is not updated, calling this fix.
            // Investigate and find better approach then remove this workaround.
            if (_this19.editor.element.component) _this19.editor.element.component.updateSync();
          };

          if (_this19.isSmoothScrollEnabled()) _this19.smoothScroll(firstVisibileScreenRow, newFirstVisibileScreenRow, done);else done();
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
      var _this20 = this;

      if (this.getConfig("reuseFindForRepeatFind")) this.repeatIfNecessary();
      if (!this.isComplete()) {
        var charsMax = this.getConfig("findCharsMax");
        var optionsBase = { purpose: "find", charsMax: charsMax };

        if (charsMax === 1) {
          this.focusInput(optionsBase);
        } else {
          this._restoreEditorState = this.utils.saveEditorState(this.editor);
          var options = {
            autoConfirmTimeout: this.getConfig("findConfirmByTimeout"),
            onConfirm: function onConfirm(input) {
              _this20.input = input;
              if (input) _this20.processOperation();else _this20.cancelOperation();
            },
            onChange: function onChange(preConfirmedChars) {
              _this20.preConfirmedChars = preConfirmedChars;
              _this20.highlightTextInCursorRows(_this20.preConfirmedChars, "pre-confirm", _this20.isBackwards());
            },
            onCancel: function onCancel() {
              _this20.vimState.highlightFind.clearMarkers();
              _this20.cancelOperation();
            },
            commands: {
              "vim-mode-plus:find-next-pre-confirmed": function vimModePlusFindNextPreConfirmed() {
                return _this20.findPreConfirmed(+1);
              },
              "vim-mode-plus:find-previous-pre-confirmed": function vimModePlusFindPreviousPreConfirmed() {
                return _this20.findPreConfirmed(-1);
              }
            }
          };
          this.focusInput(Object.assign(options, optionsBase));
        }
      }
      _get(Object.getPrototypeOf(Find.prototype), "initialize", this).call(this);
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
      var _this21 = this;

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
        _this21.highlightTextInCursorRows(_this21.input, decorationType, backwards);
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

        this.editor.backwardsScanInBufferRange(regex, scanRange, function (_ref6) {
          var range = _ref6.range;
          var stop = _ref6.stop;

          if (range.start.isLessThan(fromPoint)) {
            points.push(range.start);
            if (points.length > indexWantAccess) {
              stop();
            }
          }
        });
      } else {
        if (this.getConfig("findAcrossLines")) scanRange.end = this.editor.getEofBufferPosition();
        this.editor.scanInBufferRange(regex, scanRange, function (_ref7) {
          var range = _ref7.range;
          var stop = _ref7.stop;

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
    this.moveToFirstCharacterOfLine = false;
  }

  _createClass(MoveToMark, [{
    key: "initialize",
    value: function initialize() {
      if (!this.isComplete()) this.readChar();
      _get(Object.getPrototypeOf(MoveToMark.prototype), "initialize", this).call(this);
    }
  }, {
    key: "getPoint",
    value: function getPoint() {
      var point = this.vimState.mark.get(this.input);
      if (point) {
        return this.moveToFirstCharacterOfLine ? this.getFirstCharacterPositionForBufferRow(point.row) : point;
      }
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
    this.moveToFirstCharacterOfLine = true;
  }

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
    this.direction = "previous";
  }

  _createClass(MoveToPreviousFoldStart, [{
    key: "execute",
    value: function execute() {
      this.rows = this.getFoldRows(this.which);
      if (this.direction === "previous") this.rows.reverse();
      _get(Object.getPrototypeOf(MoveToPreviousFoldStart.prototype), "execute", this).call(this);
    }
  }, {
    key: "getFoldRows",
    value: function getFoldRows(which) {
      var toRow = function toRow(_ref8) {
        var _ref82 = _slicedToArray(_ref8, 2);

        var startRow = _ref82[0];
        var endRow = _ref82[1];
        return which === "start" ? startRow : endRow;
      };
      var rows = this.utils.getCodeFoldRowRanges(this.editor).map(toRow);
      return _.sortBy(_.uniq(rows), function (row) {
        return row;
      });
    }
  }, {
    key: "getScanRows",
    value: function getScanRows(cursor) {
      var cursorRow = cursor.getBufferRow();
      var isVald = this.direction === "previous" ? function (row) {
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
      var _this22 = this;

      this.moveCursorCountTimes(cursor, function () {
        var row = _this22.detectRow(cursor);
        if (row != null) _this22.utils.moveCursorToFirstCharacterAtRow(cursor, row);
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
      var _this23 = this;

      var baseIndentLevel = this.editor.indentationForBufferRow(cursor.getBufferRow());
      return this.getScanRows(cursor).find(function (row) {
        return _this23.editor.indentationForBufferRow(row) === baseIndentLevel;
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

    this.direction = "previous";
  }

  _createClass(MoveToPreviousFunction, [{
    key: "detectRow",
    value: function detectRow(cursor) {
      var _this24 = this;

      return this.getScanRows(cursor).find(function (row) {
        return _this24.utils.isIncludeFunctionScopeForRow(_this24.editor, row);
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
      return this.utils.detectScopeStartPositionForScope(this.editor, fromPoint, this.direction, this.scope);
    }
  }, {
    key: "moveCursor",
    value: function moveCursor(cursor) {
      var _this25 = this;

      this.moveCursorCountTimes(cursor, function () {
        _this25.setBufferPositionSafely(cursor, _this25.getPoint(cursor.getBufferPosition()));
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
      this.ranges = this.utils.sortRanges(this.occurrenceManager.getMarkers().map(function (marker) {
        return marker.getBufferRange();
      }));
      _get(Object.getPrototypeOf(MoveToNextOccurrence.prototype), "execute", this).call(this);
    }
  }, {
    key: "moveCursor",
    value: function moveCursor(cursor) {
      var range = this.ranges[this.utils.getIndex(this.getIndex(cursor.getBufferPosition()), this.ranges)];
      var point = range.start;
      cursor.setBufferPosition(point, { autoscroll: false });

      if (cursor.isLastCursor()) {
        this.editor.unfoldBufferRow(point.row);
        this.utils.smartScrollToBufferPosition(this.editor, point);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL21vdGlvbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxXQUFXLENBQUE7Ozs7Ozs7Ozs7OztBQUVYLElBQU0sQ0FBQyxHQUFHLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFBOztlQUNiLE9BQU8sQ0FBQyxNQUFNLENBQUM7O0lBQS9CLEtBQUssWUFBTCxLQUFLO0lBQUUsS0FBSyxZQUFMLEtBQUs7O0FBRW5CLElBQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQTs7SUFFeEIsTUFBTTtZQUFOLE1BQU07O1dBQU4sTUFBTTswQkFBTixNQUFNOzsrQkFBTixNQUFNOztTQUVWLFNBQVMsR0FBRyxLQUFLO1NBQ2pCLElBQUksR0FBRyxlQUFlO1NBQ3RCLElBQUksR0FBRyxLQUFLO1NBQ1osY0FBYyxHQUFHLEtBQUs7U0FDdEIsYUFBYSxHQUFHLElBQUk7U0FDcEIscUJBQXFCLEdBQUcsS0FBSztTQUM3QixlQUFlLEdBQUcsS0FBSzs7O2VBUm5CLE1BQU07O1dBVUEsc0JBQUc7QUFDWCxhQUFPLElBQUksQ0FBQyxJQUFJLEtBQUssVUFBVSxDQUFBO0tBQ2hDOzs7V0FFVSx1QkFBRztBQUNaLGFBQU8sSUFBSSxDQUFDLElBQUksS0FBSyxXQUFXLENBQUE7S0FDakM7OztXQUVRLG1CQUFDLElBQUksRUFBRTtBQUNkLFVBQUksSUFBSSxLQUFLLGVBQWUsRUFBRTtBQUM1QixZQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxJQUFJLEtBQUssVUFBVSxHQUFHLEtBQUssR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUE7T0FDcEU7QUFDRCxVQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQTtLQUNqQjs7O1dBRVMsc0JBQUc7QUFDWCxVQUFJLENBQUMsZUFBZSxHQUFHLEtBQUssQ0FBQTtLQUM3Qjs7O1dBRXNCLGlDQUFDLE1B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LEdBQUcsTUFBTSxDQUFDLGlCQUFpQixFQUFFLENBQUE7QUFDakQsVUFBTSxTQUFTLEdBQUcsY0FBYyxDQUFDLEdBQUcsQ0FBQTtBQUNwQyxVQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLGNBQWMsQ0FBQyxDQUFBO0FBQ2pELFVBQUksS0FBSyxFQUFFLE9BQU8sS0FBSyxDQUFBOzs7QUFHdkIsVUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyx5QkFBeUIsRUFBRSxFQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFBO0FBQzNHLFVBQUksQ0FBQyxLQUFLLEVBQUUsT0FBTTs7VUFFWCxLQUFLLEdBQVMsS0FBSyxDQUFuQixLQUFLO1VBQUUsR0FBRyxHQUFJLEtBQUssQ0FBWixHQUFHOztBQUNqQixVQUFJLEtBQUssQ0FBQyxHQUFHLEtBQUssU0FBUyxJQUFJLEtBQUssQ0FBQyxvQkFBb0IsQ0FBQyxjQUFjLENBQUMsRUFBRTs7QUFFekUsZUFBTyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtPQUM5QixNQUFNLElBQUksR0FBRyxDQUFDLEdBQUcsS0FBSyxjQUFjLENBQUMsR0FBRyxFQUFFOzs7QUFHekMsZUFBTyxLQUFLLENBQUE7T0FDYjtLQUNGOzs7U0EzQ0csVUFBVTtHQUFTLE1BQU07O0FBNkMvQixVQUFVLENBQUMsUUFBUSxFQUFFLENBQUEiLCJmaWxlIjoiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvbW90aW9uLmpzIiwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2UgYmFiZWxcIlxuXG5jb25zdCBfID0gcmVxdWlyZShcInVuZGVyc2NvcmUtcGx1c1wiKVxuY29uc3Qge1BvaW50LCBSYW5nZX0gPSByZXF1aXJlKFwiYXRvbVwiKVxuXG5jb25zdCBCYXNlID0gcmVxdWlyZShcIi4vYmFzZVwiKVxuXG5jbGFzcyBNb3Rpb24gZXh0ZW5kcyBCYXNlIHtcbiAgc3RhdGljIG9wZXJhdGlvbktpbmQgPSBcIm1vdGlvblwiXG4gIGluY2x1c2l2ZSA9IGZhbHNlXG4gIHdpc2UgPSBcImNoYXJhY3Rlcndpc2VcIlxuICBqdW1wID0gZmFsc2VcbiAgdmVydGljYWxNb3Rpb24gPSBmYWxzZVxuICBtb3ZlU3VjY2VlZGVkID0gbnVsbFxuICBtb3ZlU3VjY2Vzc09uTGluZXdpc2UgPSBmYWxzZVxuICBzZWxlY3RTdWNjZWVkZWQgPSBmYWxzZVxuXG4gIGlzTGluZXdpc2UoKSB7XG4gICAgcmV0dXJuIHRoaXMud2lzZSA9PT0gXCJsaW5ld2lzZVwiXG4gIH1cblxuICBpc0Jsb2Nrd2lzZSgpIHtcbiAgICByZXR1cm4gdGhpcy53aXNlID09PSBcImJsb2Nrd2lzZVwiXG4gIH1cblxuICBmb3JjZVdpc2Uod2lzZSkge1xuICAgIGlmICh3aXNlID09PSBcImNoYXJhY3Rlcndpc2VcIikge1xuICAgICAgdGhpcy5pbmNsdXNpdmUgPSB0aGlzLndpc2UgPT09IFwibGluZXdpc2VcIiA/IGZhbHNlIDogIXRoaXMuaW5jbHVzaXZlXG4gICAgfVxuICAgIHRoaXMud2lzZSA9IHdpc2VcbiAgfVxuXG4gIHJlc2V0U3RhdGUoKSB7XG4gICAgdGhpcy5zZWxlY3RTdWNjZWVkZWQgPSBmYWxzZVxuICB9XG5cbiAgc2V0QnVmZmVyUG9zaXRpb25TYWZlbHkoY3Vyc29yLCBwb2ludCkge1xuICAgIGlmIChwb2ludCkgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHBvaW50KVxuICB9XG5cbiAgc2V0U2NyZWVuUG9zaXRpb25TYWZlbHkoY3Vyc29yLCBwb2ludCkge1xuICAgIGlmIChwb2ludCkgY3Vyc29yLnNldFNjcmVlblBvc2l0aW9uKHBvaW50KVxuICB9XG5cbiAgbW92ZVdpdGhTYXZlSnVtcChjdXJzb3IpIHtcbiAgICBjb25zdCBvcmlnaW5hbFBvc2l0aW9uID0gdGhpcy5qdW1wICYmIGN1cnNvci5pc0xhc3RDdXJzb3IoKSA/IGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpIDogdW5kZWZpbmVkXG5cbiAgICB0aGlzLm1vdmVDdXJzb3IoY3Vyc29yKVxuXG4gICAgaWYgKG9yaWdpbmFsUG9zaXRpb24gJiYgIWN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpLmlzRXF1YWwob3JpZ2luYWxQb3NpdGlvbikpIHtcbiAgICAgIHRoaXMudmltU3RhdGUubWFyay5zZXQoXCJgXCIsIG9yaWdpbmFsUG9zaXRpb24pXG4gICAgICB0aGlzLnZpbVN0YXRlLm1hcmsuc2V0KFwiJ1wiLCBvcmlnaW5hbFBvc2l0aW9uKVxuICAgIH1cbiAgfVxuXG4gIGV4ZWN1dGUoKSB7XG4gICAgaWYgKHRoaXMub3BlcmF0b3IpIHtcbiAgICAgIHRoaXMuc2VsZWN0KClcbiAgICB9IGVsc2Uge1xuICAgICAgZm9yIChjb25zdCBjdXJzb3Igb2YgdGhpcy5lZGl0b3IuZ2V0Q3Vyc29ycygpKSB7XG4gICAgICAgIHRoaXMubW92ZVdpdGhTYXZlSnVtcChjdXJzb3IpXG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuZWRpdG9yLm1lcmdlQ3Vyc29ycygpXG4gICAgdGhpcy5lZGl0b3IubWVyZ2VJbnRlcnNlY3RpbmdTZWxlY3Rpb25zKClcbiAgfVxuXG4gIC8vIE5PVEU6IHNlbGVjdGlvbiBpcyBhbHJlYWR5IFwibm9ybWFsaXplZFwiIGJlZm9yZSB0aGlzIGZ1bmN0aW9uIGlzIGNhbGxlZC5cbiAgc2VsZWN0KCkge1xuICAgIC8vIG5lZWQgdG8gY2FyZSB3YXMgdmlzdWFsIGZvciBgLmAgcmVwZWF0ZWQuXG4gICAgY29uc3QgaXNPcldhc1Zpc3VhbCA9IHRoaXMub3BlcmF0b3IuaW5zdGFuY2VvZihcIlNlbGVjdEJhc2VcIikgfHwgdGhpcy5pcyhcIkN1cnJlbnRTZWxlY3Rpb25cIilcblxuICAgIGZvciAoY29uc3Qgc2VsZWN0aW9uIG9mIHRoaXMuZWRpdG9yLmdldFNlbGVjdGlvbnMoKSkge1xuICAgICAgc2VsZWN0aW9uLm1vZGlmeVNlbGVjdGlvbigoKSA9PiB0aGlzLm1vdmVXaXRoU2F2ZUp1bXAoc2VsZWN0aW9uLmN1cnNvcikpXG5cbiAgICAgIGNvbnN0IHNlbGVjdFN1Y2NlZWRlZCA9XG4gICAgICAgIHRoaXMubW92ZVN1Y2NlZWRlZCAhPSBudWxsXG4gICAgICAgICAgPyB0aGlzLm1vdmVTdWNjZWVkZWRcbiAgICAgICAgICA6ICFzZWxlY3Rpb24uaXNFbXB0eSgpIHx8ICh0aGlzLmlzTGluZXdpc2UoKSAmJiB0aGlzLm1vdmVTdWNjZXNzT25MaW5ld2lzZSlcbiAgICAgIGlmICghdGhpcy5zZWxlY3RTdWNjZWVkZWQpIHRoaXMuc2VsZWN0U3VjY2VlZGVkID0gc2VsZWN0U3VjY2VlZGVkXG5cbiAgICAgIGlmIChpc09yV2FzVmlzdWFsIHx8IChzZWxlY3RTdWNjZWVkZWQgJiYgKHRoaXMuaW5jbHVzaXZlIHx8IHRoaXMuaXNMaW5ld2lzZSgpKSkpIHtcbiAgICAgICAgY29uc3QgJHNlbGVjdGlvbiA9IHRoaXMuc3dyYXAoc2VsZWN0aW9uKVxuICAgICAgICAkc2VsZWN0aW9uLnNhdmVQcm9wZXJ0aWVzKHRydWUpIC8vIHNhdmUgcHJvcGVydHkgb2YgXCJhbHJlYWR5LW5vcm1hbGl6ZWQtc2VsZWN0aW9uXCJcbiAgICAgICAgJHNlbGVjdGlvbi5hcHBseVdpc2UodGhpcy53aXNlKVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0aGlzLndpc2UgPT09IFwiYmxvY2t3aXNlXCIpIHtcbiAgICAgIHRoaXMudmltU3RhdGUuZ2V0TGFzdEJsb2Nrd2lzZVNlbGVjdGlvbigpLmF1dG9zY3JvbGwoKVxuICAgIH1cbiAgfVxuXG4gIHNldEN1cnNvckJ1ZmZlclJvdyhjdXJzb3IsIHJvdywgb3B0aW9ucykge1xuICAgIGlmICh0aGlzLnZlcnRpY2FsTW90aW9uICYmICF0aGlzLmdldENvbmZpZyhcInN0YXlPblZlcnRpY2FsTW90aW9uXCIpKSB7XG4gICAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24odGhpcy5nZXRGaXJzdENoYXJhY3RlclBvc2l0aW9uRm9yQnVmZmVyUm93KHJvdyksIG9wdGlvbnMpXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMudXRpbHMuc2V0QnVmZmVyUm93KGN1cnNvciwgcm93LCBvcHRpb25zKVxuICAgIH1cbiAgfVxuXG4gIC8vIFtOT1RFXVxuICAvLyBTaW5jZSB0aGlzIGZ1bmN0aW9uIGNoZWNrcyBjdXJzb3IgcG9zaXRpb24gY2hhbmdlLCBhIGN1cnNvciBwb3NpdGlvbiBNVVNUIGJlXG4gIC8vIHVwZGF0ZWQgSU4gY2FsbGJhY2soPWZuKVxuICAvLyBVcGRhdGluZyBwb2ludCBvbmx5IGluIGNhbGxiYWNrIGlzIHdyb25nLXVzZSBvZiB0aGlzIGZ1bmNpdG9uLFxuICAvLyBzaW5jZSBpdCBzdG9wcyBpbW1lZGlhdGVseSBiZWNhdXNlIG9mIG5vdCBjdXJzb3IgcG9zaXRpb24gY2hhbmdlLlxuICBtb3ZlQ3Vyc29yQ291bnRUaW1lcyhjdXJzb3IsIGZuKSB7XG4gICAgbGV0IG9sZFBvc2l0aW9uID0gY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKClcbiAgICB0aGlzLmNvdW50VGltZXModGhpcy5nZXRDb3VudCgpLCBzdGF0ZSA9PiB7XG4gICAgICBmbihzdGF0ZSlcbiAgICAgIGNvbnN0IG5ld1Bvc2l0aW9uID0gY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKClcbiAgICAgIGlmIChuZXdQb3NpdGlvbi5pc0VxdWFsKG9sZFBvc2l0aW9uKSkgc3RhdGUuc3RvcCgpXG4gICAgICBvbGRQb3NpdGlvbiA9IG5ld1Bvc2l0aW9uXG4gICAgfSlcbiAgfVxuXG4gIGlzQ2FzZVNlbnNpdGl2ZSh0ZXJtKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0Q29uZmlnKGB1c2VTbWFydGNhc2VGb3Ike3RoaXMuY2FzZVNlbnNpdGl2aXR5S2luZH1gKVxuICAgICAgPyB0ZXJtLnNlYXJjaCgvW0EtWl0vKSAhPT0gLTFcbiAgICAgIDogIXRoaXMuZ2V0Q29uZmlnKGBpZ25vcmVDYXNlRm9yJHt0aGlzLmNhc2VTZW5zaXRpdml0eUtpbmR9YClcbiAgfVxufVxuTW90aW9uLnJlZ2lzdGVyKGZhbHNlKVxuXG4vLyBVc2VkIGFzIG9wZXJhdG9yJ3MgdGFyZ2V0IGluIHZpc3VhbC1tb2RlLlxuY2xhc3MgQ3VycmVudFNlbGVjdGlvbiBleHRlbmRzIE1vdGlvbiB7XG4gIHNlbGVjdGlvbkV4dGVudCA9IG51bGxcbiAgYmxvY2t3aXNlU2VsZWN0aW9uRXh0ZW50ID0gbnVsbFxuICBpbmNsdXNpdmUgPSB0cnVlXG4gIHBvaW50SW5mb0J5Q3Vyc29yID0gbmV3IE1hcCgpXG5cbiAgbW92ZUN1cnNvcihjdXJzb3IpIHtcbiAgICBpZiAodGhpcy5tb2RlID09PSBcInZpc3VhbFwiKSB7XG4gICAgICB0aGlzLnNlbGVjdGlvbkV4dGVudCA9IHRoaXMuaXNCbG9ja3dpc2UoKVxuICAgICAgICA/IHRoaXMuc3dyYXAoY3Vyc29yLnNlbGVjdGlvbikuZ2V0QmxvY2t3aXNlU2VsZWN0aW9uRXh0ZW50KClcbiAgICAgICAgOiB0aGlzLmVkaXRvci5nZXRTZWxlY3RlZEJ1ZmZlclJhbmdlKCkuZ2V0RXh0ZW50KClcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gYC5gIHJlcGVhdCBjYXNlXG4gICAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24oY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKCkudHJhbnNsYXRlKHRoaXMuc2VsZWN0aW9uRXh0ZW50KSlcbiAgICB9XG4gIH1cblxuICBzZWxlY3QoKSB7XG4gICAgaWYgKHRoaXMubW9kZSA9PT0gXCJ2aXN1YWxcIikge1xuICAgICAgc3VwZXIuc2VsZWN0KClcbiAgICB9IGVsc2Uge1xuICAgICAgZm9yIChjb25zdCBjdXJzb3Igb2YgdGhpcy5lZGl0b3IuZ2V0Q3Vyc29ycygpKSB7XG4gICAgICAgIGNvbnN0IHBvaW50SW5mbyA9IHRoaXMucG9pbnRJbmZvQnlDdXJzb3IuZ2V0KGN1cnNvcilcbiAgICAgICAgaWYgKHBvaW50SW5mbykge1xuICAgICAgICAgIGNvbnN0IHtjdXJzb3JQb3NpdGlvbiwgc3RhcnRPZlNlbGVjdGlvbn0gPSBwb2ludEluZm9cbiAgICAgICAgICBpZiAoY3Vyc29yUG9zaXRpb24uaXNFcXVhbChjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKSkpIHtcbiAgICAgICAgICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihzdGFydE9mU2VsZWN0aW9uKVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgc3VwZXIuc2VsZWN0KClcbiAgICB9XG5cbiAgICAvLyAqIFB1cnBvc2Ugb2YgcG9pbnRJbmZvQnlDdXJzb3I/IHNlZSAjMjM1IGZvciBkZXRhaWwuXG4gICAgLy8gV2hlbiBzdGF5T25UcmFuc2Zvcm1TdHJpbmcgaXMgZW5hYmxlZCwgY3Vyc29yIHBvcyBpcyBub3Qgc2V0IG9uIHN0YXJ0IG9mXG4gICAgLy8gb2Ygc2VsZWN0ZWQgcmFuZ2UuXG4gICAgLy8gQnV0IEkgd2FudCBmb2xsb3dpbmcgYmVoYXZpb3IsIHNvIG5lZWQgdG8gcHJlc2VydmUgcG9zaXRpb24gaW5mby5cbiAgICAvLyAgMS4gYHZqPi5gIC0+IGluZGVudCBzYW1lIHR3byByb3dzIHJlZ2FyZGxlc3Mgb2YgY3VycmVudCBjdXJzb3IncyByb3cuXG4gICAgLy8gIDIuIGB2aj5qLmAgLT4gaW5kZW50IHR3byByb3dzIGZyb20gY3Vyc29yJ3Mgcm93LlxuICAgIGZvciAoY29uc3QgY3Vyc29yIG9mIHRoaXMuZWRpdG9yLmdldEN1cnNvcnMoKSkge1xuICAgICAgY29uc3Qgc3RhcnRPZlNlbGVjdGlvbiA9IGN1cnNvci5zZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKS5zdGFydFxuICAgICAgdGhpcy5vbkRpZEZpbmlzaE9wZXJhdGlvbigoKSA9PiB7XG4gICAgICAgIGN1cnNvclBvc2l0aW9uID0gY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKClcbiAgICAgICAgdGhpcy5wb2ludEluZm9CeUN1cnNvci5zZXQoY3Vyc29yLCB7c3RhcnRPZlNlbGVjdGlvbiwgY3Vyc29yUG9zaXRpb259KVxuICAgICAgfSlcbiAgICB9XG4gIH1cbn1cbkN1cnJlbnRTZWxlY3Rpb24ucmVnaXN0ZXIoZmFsc2UpXG5cbmNsYXNzIE1vdmVMZWZ0IGV4dGVuZHMgTW90aW9uIHtcbiAgbW92ZUN1cnNvcihjdXJzb3IpIHtcbiAgICBjb25zdCBhbGxvd1dyYXAgPSB0aGlzLmdldENvbmZpZyhcIndyYXBMZWZ0UmlnaHRNb3Rpb25cIilcbiAgICB0aGlzLm1vdmVDdXJzb3JDb3VudFRpbWVzKGN1cnNvciwgKCkgPT4gdGhpcy51dGlscy5tb3ZlQ3Vyc29yTGVmdChjdXJzb3IsIHthbGxvd1dyYXB9KSlcbiAgfVxufVxuTW92ZUxlZnQucmVnaXN0ZXIoKVxuXG5jbGFzcyBNb3ZlUmlnaHQgZXh0ZW5kcyBNb3Rpb24ge1xuICBtb3ZlQ3Vyc29yKGN1cnNvcikge1xuICAgIGNvbnN0IGFsbG93V3JhcCA9IHRoaXMuZ2V0Q29uZmlnKFwid3JhcExlZnRSaWdodE1vdGlvblwiKVxuXG4gICAgdGhpcy5tb3ZlQ3Vyc29yQ291bnRUaW1lcyhjdXJzb3IsICgpID0+IHtcbiAgICAgIHRoaXMuZWRpdG9yLnVuZm9sZEJ1ZmZlclJvdyhjdXJzb3IuZ2V0QnVmZmVyUm93KCkpXG5cbiAgICAgIC8vIC0gV2hlbiBgd3JhcExlZnRSaWdodE1vdGlvbmAgZW5hYmxlZCBhbmQgZXhlY3V0ZWQgYXMgcHVyZS1tb3Rpb24gaW4gYG5vcm1hbC1tb2RlYCxcbiAgICAgIC8vICAgd2UgbmVlZCB0byBtb3ZlICoqYWdhaW4qKiB0byB3cmFwIHRvIG5leHQtbGluZSBpZiBpdCByYWNoZWQgdG8gRU9MLlxuICAgICAgLy8gLSBFeHByZXNzaW9uIGAhdGhpcy5vcGVyYXRvcmAgbWVhbnMgbm9ybWFsLW1vZGUgbW90aW9uLlxuICAgICAgLy8gLSBFeHByZXNzaW9uIGB0aGlzLm1vZGUgPT09IFwibm9ybWFsXCJgIGlzIG5vdCBhcHByb3ByZWF0ZSBzaW5jZSBpdCBtYXRjaGVzIGB4YCBvcGVyYXRvcidzIHRhcmdldCBjYXNlLlxuICAgICAgY29uc3QgbmVlZE1vdmVBZ2FpbiA9IGFsbG93V3JhcCAmJiAhdGhpcy5vcGVyYXRvciAmJiAhY3Vyc29yLmlzQXRFbmRPZkxpbmUoKVxuXG4gICAgICB0aGlzLnV0aWxzLm1vdmVDdXJzb3JSaWdodChjdXJzb3IsIHthbGxvd1dyYXB9KVxuXG4gICAgICBpZiAobmVlZE1vdmVBZ2FpbiAmJiBjdXJzb3IuaXNBdEVuZE9mTGluZSgpKSB7XG4gICAgICAgIHRoaXMudXRpbHMubW92ZUN1cnNvclJpZ2h0KGN1cnNvciwge2FsbG93V3JhcH0pXG4gICAgICB9XG4gICAgfSlcbiAgfVxufVxuTW92ZVJpZ2h0LnJlZ2lzdGVyKClcblxuY2xhc3MgTW92ZVJpZ2h0QnVmZmVyQ29sdW1uIGV4dGVuZHMgTW90aW9uIHtcbiAgbW92ZUN1cnNvcihjdXJzb3IpIHtcbiAgICB0aGlzLnV0aWxzLnNldEJ1ZmZlckNvbHVtbihjdXJzb3IsIGN1cnNvci5nZXRCdWZmZXJDb2x1bW4oKSArIHRoaXMuZ2V0Q291bnQoKSlcbiAgfVxufVxuTW92ZVJpZ2h0QnVmZmVyQ29sdW1uLnJlZ2lzdGVyKGZhbHNlKVxuXG5jbGFzcyBNb3ZlVXAgZXh0ZW5kcyBNb3Rpb24ge1xuICB3aXNlID0gXCJsaW5ld2lzZVwiXG4gIHdyYXAgPSBmYWxzZVxuXG4gIGdldEJ1ZmZlclJvdyhyb3cpIHtcbiAgICBjb25zdCBtaW4gPSAwXG4gICAgcm93ID0gdGhpcy53cmFwICYmIHJvdyA9PT0gbWluID8gdGhpcy5nZXRWaW1MYXN0QnVmZmVyUm93KCkgOiB0aGlzLnV0aWxzLmxpbWl0TnVtYmVyKHJvdyAtIDEsIHttaW59KVxuICAgIHJldHVybiB0aGlzLmdldEZvbGRTdGFydFJvd0ZvclJvdyhyb3cpXG4gIH1cblxuICBtb3ZlQ3Vyc29yKGN1cnNvcikge1xuICAgIHRoaXMubW92ZUN1cnNvckNvdW50VGltZXMoY3Vyc29yLCAoKSA9PiB0aGlzLnV0aWxzLnNldEJ1ZmZlclJvdyhjdXJzb3IsIHRoaXMuZ2V0QnVmZmVyUm93KGN1cnNvci5nZXRCdWZmZXJSb3coKSkpKVxuICB9XG59XG5Nb3ZlVXAucmVnaXN0ZXIoKVxuXG5jbGFzcyBNb3ZlVXBXcmFwIGV4dGVuZHMgTW92ZVVwIHtcbiAgd3JhcCA9IHRydWVcbn1cbk1vdmVVcFdyYXAucmVnaXN0ZXIoKVxuXG5jbGFzcyBNb3ZlRG93biBleHRlbmRzIE1vdmVVcCB7XG4gIHdpc2UgPSBcImxpbmV3aXNlXCJcbiAgd3JhcCA9IGZhbHNlXG5cbiAgZ2V0QnVmZmVyUm93KHJvdykge1xuICAgIGlmICh0aGlzLmVkaXRvci5pc0ZvbGRlZEF0QnVmZmVyUm93KHJvdykpIHtcbiAgICAgIHJvdyA9IHRoaXMudXRpbHMuZ2V0TGFyZ2VzdEZvbGRSYW5nZUNvbnRhaW5zQnVmZmVyUm93KHRoaXMuZWRpdG9yLCByb3cpLmVuZC5yb3dcbiAgICB9XG4gICAgY29uc3QgbWF4ID0gdGhpcy5nZXRWaW1MYXN0QnVmZmVyUm93KClcbiAgICByZXR1cm4gdGhpcy53cmFwICYmIHJvdyA+PSBtYXggPyAwIDogdGhpcy51dGlscy5saW1pdE51bWJlcihyb3cgKyAxLCB7bWF4fSlcbiAgfVxufVxuTW92ZURvd24ucmVnaXN0ZXIoKVxuXG5jbGFzcyBNb3ZlRG93bldyYXAgZXh0ZW5kcyBNb3ZlRG93biB7XG4gIHdyYXAgPSB0cnVlXG59XG5Nb3ZlRG93bldyYXAucmVnaXN0ZXIoKVxuXG5jbGFzcyBNb3ZlVXBTY3JlZW4gZXh0ZW5kcyBNb3Rpb24ge1xuICB3aXNlID0gXCJsaW5ld2lzZVwiXG4gIGRpcmVjdGlvbiA9IFwidXBcIlxuICBtb3ZlQ3Vyc29yKGN1cnNvcikge1xuICAgIHRoaXMubW92ZUN1cnNvckNvdW50VGltZXMoY3Vyc29yLCAoKSA9PiB0aGlzLnV0aWxzLm1vdmVDdXJzb3JVcFNjcmVlbihjdXJzb3IpKVxuICB9XG59XG5Nb3ZlVXBTY3JlZW4ucmVnaXN0ZXIoKVxuXG5jbGFzcyBNb3ZlRG93blNjcmVlbiBleHRlbmRzIE1vdmVVcFNjcmVlbiB7XG4gIHdpc2UgPSBcImxpbmV3aXNlXCJcbiAgZGlyZWN0aW9uID0gXCJkb3duXCJcbiAgbW92ZUN1cnNvcihjdXJzb3IpIHtcbiAgICB0aGlzLm1vdmVDdXJzb3JDb3VudFRpbWVzKGN1cnNvciwgKCkgPT4gdGhpcy51dGlscy5tb3ZlQ3Vyc29yRG93blNjcmVlbihjdXJzb3IpKVxuICB9XG59XG5Nb3ZlRG93blNjcmVlbi5yZWdpc3RlcigpXG5cbmNsYXNzIE1vdmVVcFRvRWRnZSBleHRlbmRzIE1vdGlvbiB7XG4gIHdpc2UgPSBcImxpbmV3aXNlXCJcbiAganVtcCA9IHRydWVcbiAgZGlyZWN0aW9uID0gXCJwcmV2aW91c1wiXG4gIG1vdmVDdXJzb3IoY3Vyc29yKSB7XG4gICAgdGhpcy5tb3ZlQ3Vyc29yQ291bnRUaW1lcyhjdXJzb3IsICgpID0+IHtcbiAgICAgIHRoaXMuc2V0U2NyZWVuUG9zaXRpb25TYWZlbHkoY3Vyc29yLCB0aGlzLmdldFBvaW50KGN1cnNvci5nZXRTY3JlZW5Qb3NpdGlvbigpKSlcbiAgICB9KVxuICB9XG5cbiAgZ2V0UG9pbnQoZnJvbVBvaW50KSB7XG4gICAgY29uc3Qge2NvbHVtbiwgcm93OiBzdGFydFJvd30gPSBmcm9tUG9pbnRcbiAgICBmb3IgKGNvbnN0IHJvdyBvZiB0aGlzLmdldFNjcmVlblJvd3Moe3N0YXJ0Um93LCBkaXJlY3Rpb246IHRoaXMuZGlyZWN0aW9ufSkpIHtcbiAgICAgIGNvbnN0IHBvaW50ID0gbmV3IFBvaW50KHJvdywgY29sdW1uKVxuICAgICAgaWYgKHRoaXMuaXNFZGdlKHBvaW50KSkgcmV0dXJuIHBvaW50XG4gICAgfVxuICB9XG5cbiAgaXNFZGdlKHBvaW50KSB7XG4gICAgLy8gSWYgcG9pbnQgaXMgc3RvcHBhYmxlIGFuZCBhYm92ZSBvciBiZWxvdyBwb2ludCBpcyBub3Qgc3RvcHBhYmxlLCBpdCdzIEVkZ2UhXG4gICAgcmV0dXJuIChcbiAgICAgIHRoaXMuaXNTdG9wcGFibGUocG9pbnQpICYmXG4gICAgICAoIXRoaXMuaXNTdG9wcGFibGUocG9pbnQudHJhbnNsYXRlKFstMSwgMF0pKSB8fCAhdGhpcy5pc1N0b3BwYWJsZShwb2ludC50cmFuc2xhdGUoWysxLCAwXSkpKVxuICAgIClcbiAgfVxuXG4gIGlzU3RvcHBhYmxlKHBvaW50KSB7XG4gICAgcmV0dXJuIChcbiAgICAgIHRoaXMuaXNOb25XaGl0ZVNwYWNlKHBvaW50KSB8fFxuICAgICAgdGhpcy5pc0ZpcnN0Um93T3JMYXN0Um93QW5kRXF1YWxBZnRlckNsaXBwZWQocG9pbnQpIHx8XG4gICAgICAvLyBJZiByaWdodCBvciBsZWZ0IGNvbHVtbiBpcyBub24td2hpdGUtc3BhY2UgY2hhciwgaXQncyBzdG9wcGFibGUuXG4gICAgICAodGhpcy5pc05vbldoaXRlU3BhY2UocG9pbnQudHJhbnNsYXRlKFswLCAtMV0pKSAmJiB0aGlzLmlzTm9uV2hpdGVTcGFjZShwb2ludC50cmFuc2xhdGUoWzAsICsxXSkpKVxuICAgIClcbiAgfVxuXG4gIGlzTm9uV2hpdGVTcGFjZShwb2ludCkge1xuICAgIGNvbnN0IGNoYXIgPSB0aGlzLnV0aWxzLmdldFRleHRJblNjcmVlblJhbmdlKHRoaXMuZWRpdG9yLCBSYW5nZS5mcm9tUG9pbnRXaXRoRGVsdGEocG9pbnQsIDAsIDEpKVxuICAgIHJldHVybiBjaGFyICE9IG51bGwgJiYgL1xcUy8udGVzdChjaGFyKVxuICB9XG5cbiAgaXNGaXJzdFJvd09yTGFzdFJvd0FuZEVxdWFsQWZ0ZXJDbGlwcGVkKHBvaW50KSB7XG4gICAgLy8gSW4gbm90bWFsLW1vZGUsIGN1cnNvciBpcyBOT1Qgc3RvcHBhYmxlIHRvIEVPTCBvZiBub24tYmxhbmsgcm93LlxuICAgIC8vIFNvIGV4cGxpY2l0bHkgZ3VhcmQgdG8gbm90IGFuc3dlciBpdCBzdG9wcGFibGUuXG4gICAgaWYgKHRoaXMuaXNNb2RlKFwibm9ybWFsXCIpICYmIHRoaXMudXRpbHMucG9pbnRJc0F0RW5kT2ZMaW5lQXROb25FbXB0eVJvdyh0aGlzLmVkaXRvciwgcG9pbnQpKSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cbiAgICByZXR1cm4gKFxuICAgICAgKHBvaW50LnJvdyA9PT0gMCB8fCBwb2ludC5yb3cgPT09IHRoaXMuZ2V0VmltTGFzdFNjcmVlblJvdygpKSAmJlxuICAgICAgcG9pbnQuaXNFcXVhbCh0aGlzLmVkaXRvci5jbGlwU2NyZWVuUG9zaXRpb24ocG9pbnQpKVxuICAgIClcbiAgfVxufVxuTW92ZVVwVG9FZGdlLnJlZ2lzdGVyKClcblxuY2xhc3MgTW92ZURvd25Ub0VkZ2UgZXh0ZW5kcyBNb3ZlVXBUb0VkZ2Uge1xuICBkaXJlY3Rpb24gPSBcIm5leHRcIlxufVxuTW92ZURvd25Ub0VkZ2UucmVnaXN0ZXIoKVxuXG4vLyB3b3JkXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBNb3ZlVG9OZXh0V29yZCBleHRlbmRzIE1vdGlvbiB7XG4gIHdvcmRSZWdleCA9IG51bGxcblxuICBnZXRQb2ludChyZWdleCwgZnJvbSkge1xuICAgIGxldCB3b3JkUmFuZ2VcbiAgICBsZXQgZm91bmQgPSBmYWxzZVxuXG4gICAgdGhpcy5zY2FuRm9yd2FyZChyZWdleCwge2Zyb219LCAoe3JhbmdlLCBtYXRjaFRleHQsIHN0b3B9KSA9PiB7XG4gICAgICB3b3JkUmFuZ2UgPSByYW5nZVxuICAgICAgLy8gSWdub3JlICdlbXB0eSBsaW5lJyBtYXRjaGVzIGJldHdlZW4gJ1xccicgYW5kICdcXG4nXG4gICAgICBpZiAobWF0Y2hUZXh0ID09PSBcIlwiICYmIHJhbmdlLnN0YXJ0LmNvbHVtbiAhPT0gMCkgcmV0dXJuXG4gICAgICBpZiAocmFuZ2Uuc3RhcnQuaXNHcmVhdGVyVGhhbihmcm9tKSkge1xuICAgICAgICBmb3VuZCA9IHRydWVcbiAgICAgICAgc3RvcCgpXG4gICAgICB9XG4gICAgfSlcblxuICAgIGlmIChmb3VuZCkge1xuICAgICAgY29uc3QgcG9pbnQgPSB3b3JkUmFuZ2Uuc3RhcnRcbiAgICAgIHJldHVybiB0aGlzLnV0aWxzLnBvaW50SXNBdEVuZE9mTGluZUF0Tm9uRW1wdHlSb3codGhpcy5lZGl0b3IsIHBvaW50KSAmJlxuICAgICAgICAhcG9pbnQuaXNFcXVhbCh0aGlzLmdldFZpbUVvZkJ1ZmZlclBvc2l0aW9uKCkpXG4gICAgICAgID8gcG9pbnQudHJhdmVyc2UoWzEsIDBdKVxuICAgICAgICA6IHBvaW50XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB3b3JkUmFuZ2UgPyB3b3JkUmFuZ2UuZW5kIDogZnJvbVxuICAgIH1cbiAgfVxuXG4gIC8vIFNwZWNpYWwgY2FzZTogXCJjd1wiIGFuZCBcImNXXCIgYXJlIHRyZWF0ZWQgbGlrZSBcImNlXCIgYW5kIFwiY0VcIiBpZiB0aGUgY3Vyc29yIGlzXG4gIC8vIG9uIGEgbm9uLWJsYW5rLiAgVGhpcyBpcyBiZWNhdXNlIFwiY3dcIiBpcyBpbnRlcnByZXRlZCBhcyBjaGFuZ2Utd29yZCwgYW5kIGFcbiAgLy8gd29yZCBkb2VzIG5vdCBpbmNsdWRlIHRoZSBmb2xsb3dpbmcgd2hpdGUgc3BhY2UuICB7Vmk6IFwiY3dcIiB3aGVuIG9uIGEgYmxhbmtcbiAgLy8gZm9sbG93ZWQgYnkgb3RoZXIgYmxhbmtzIGNoYW5nZXMgb25seSB0aGUgZmlyc3QgYmxhbms7IHRoaXMgaXMgcHJvYmFibHkgYVxuICAvLyBidWcsIGJlY2F1c2UgXCJkd1wiIGRlbGV0ZXMgYWxsIHRoZSBibGFua3N9XG4gIC8vXG4gIC8vIEFub3RoZXIgc3BlY2lhbCBjYXNlOiBXaGVuIHVzaW5nIHRoZSBcIndcIiBtb3Rpb24gaW4gY29tYmluYXRpb24gd2l0aCBhblxuICAvLyBvcGVyYXRvciBhbmQgdGhlIGxhc3Qgd29yZCBtb3ZlZCBvdmVyIGlzIGF0IHRoZSBlbmQgb2YgYSBsaW5lLCB0aGUgZW5kIG9mXG4gIC8vIHRoYXQgd29yZCBiZWNvbWVzIHRoZSBlbmQgb2YgdGhlIG9wZXJhdGVkIHRleHQsIG5vdCB0aGUgZmlyc3Qgd29yZCBpbiB0aGVcbiAgLy8gbmV4dCBsaW5lLlxuICBtb3ZlQ3Vyc29yKGN1cnNvcikge1xuICAgIGNvbnN0IGN1cnNvclBvc2l0aW9uID0gY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKClcbiAgICBpZiAodGhpcy51dGlscy5wb2ludElzQXRWaW1FbmRPZkZpbGUodGhpcy5lZGl0b3IsIGN1cnNvclBvc2l0aW9uKSkgcmV0dXJuXG5cbiAgICBjb25zdCB3YXNPbldoaXRlU3BhY2UgPSB0aGlzLnV0aWxzLnBvaW50SXNPbldoaXRlU3BhY2UodGhpcy5lZGl0b3IsIGN1cnNvclBvc2l0aW9uKVxuICAgIGNvbnN0IGlzQXNUYXJnZXRFeGNlcHRTZWxlY3RJblZpc3VhbE1vZGUgPSB0aGlzLmlzQXNUYXJnZXRFeGNlcHRTZWxlY3RJblZpc3VhbE1vZGUoKVxuXG4gICAgdGhpcy5tb3ZlQ3Vyc29yQ291bnRUaW1lcyhjdXJzb3IsICh7aXNGaW5hbH0pID0+IHtcbiAgICAgIGNvbnN0IGN1cnNvclBvc2l0aW9uID0gY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKClcbiAgICAgIGlmICh0aGlzLnV0aWxzLmlzRW1wdHlSb3codGhpcy5lZGl0b3IsIGN1cnNvclBvc2l0aW9uLnJvdykgJiYgaXNBc1RhcmdldEV4Y2VwdFNlbGVjdEluVmlzdWFsTW9kZSkge1xuICAgICAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24oY3Vyc29yUG9zaXRpb24udHJhdmVyc2UoWzEsIDBdKSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IHJlZ2V4ID0gdGhpcy53b3JkUmVnZXggfHwgY3Vyc29yLndvcmRSZWdFeHAoKVxuICAgICAgICBsZXQgcG9pbnQgPSB0aGlzLmdldFBvaW50KHJlZ2V4LCBjdXJzb3JQb3NpdGlvbilcbiAgICAgICAgaWYgKGlzRmluYWwgJiYgaXNBc1RhcmdldEV4Y2VwdFNlbGVjdEluVmlzdWFsTW9kZSkge1xuICAgICAgICAgIGlmICh0aGlzLm9wZXJhdG9yLmlzKFwiQ2hhbmdlXCIpICYmICF3YXNPbldoaXRlU3BhY2UpIHtcbiAgICAgICAgICAgIHBvaW50ID0gY3Vyc29yLmdldEVuZE9mQ3VycmVudFdvcmRCdWZmZXJQb3NpdGlvbih7d29yZFJlZ2V4OiB0aGlzLndvcmRSZWdleH0pXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHBvaW50ID0gUG9pbnQubWluKHBvaW50LCB0aGlzLnV0aWxzLmdldEVuZE9mTGluZUZvckJ1ZmZlclJvdyh0aGlzLmVkaXRvciwgY3Vyc29yUG9zaXRpb24ucm93KSlcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHBvaW50KVxuICAgICAgfVxuICAgIH0pXG4gIH1cbn1cbk1vdmVUb05leHRXb3JkLnJlZ2lzdGVyKClcblxuLy8gYlxuY2xhc3MgTW92ZVRvUHJldmlvdXNXb3JkIGV4dGVuZHMgTW90aW9uIHtcbiAgd29yZFJlZ2V4ID0gbnVsbFxuXG4gIG1vdmVDdXJzb3IoY3Vyc29yKSB7XG4gICAgdGhpcy5tb3ZlQ3Vyc29yQ291bnRUaW1lcyhjdXJzb3IsICgpID0+IHtcbiAgICAgIGNvbnN0IHBvaW50ID0gY3Vyc29yLmdldEJlZ2lubmluZ09mQ3VycmVudFdvcmRCdWZmZXJQb3NpdGlvbih7d29yZFJlZ2V4OiB0aGlzLndvcmRSZWdleH0pXG4gICAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24ocG9pbnQpXG4gICAgfSlcbiAgfVxufVxuTW92ZVRvUHJldmlvdXNXb3JkLnJlZ2lzdGVyKClcblxuY2xhc3MgTW92ZVRvRW5kT2ZXb3JkIGV4dGVuZHMgTW90aW9uIHtcbiAgd29yZFJlZ2V4ID0gbnVsbFxuICBpbmNsdXNpdmUgPSB0cnVlXG5cbiAgbW92ZVRvTmV4dEVuZE9mV29yZChjdXJzb3IpIHtcbiAgICB0aGlzLnV0aWxzLm1vdmVDdXJzb3JUb05leHROb25XaGl0ZXNwYWNlKGN1cnNvcilcbiAgICBjb25zdCBwb2ludCA9IGN1cnNvci5nZXRFbmRPZkN1cnJlbnRXb3JkQnVmZmVyUG9zaXRpb24oe3dvcmRSZWdleDogdGhpcy53b3JkUmVnZXh9KS50cmFuc2xhdGUoWzAsIC0xXSlcbiAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24oUG9pbnQubWluKHBvaW50LCB0aGlzLmdldFZpbUVvZkJ1ZmZlclBvc2l0aW9uKCkpKVxuICB9XG5cbiAgbW92ZUN1cnNvcihjdXJzb3IpIHtcbiAgICB0aGlzLm1vdmVDdXJzb3JDb3VudFRpbWVzKGN1cnNvciwgKCkgPT4ge1xuICAgICAgY29uc3Qgb3JpZ2luYWxQb2ludCA9IGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXG4gICAgICB0aGlzLm1vdmVUb05leHRFbmRPZldvcmQoY3Vyc29yKVxuICAgICAgaWYgKG9yaWdpbmFsUG9pbnQuaXNFcXVhbChjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKSkpIHtcbiAgICAgICAgLy8gUmV0cnkgZnJvbSByaWdodCBjb2x1bW4gaWYgY3Vyc29yIHdhcyBhbHJlYWR5IG9uIEVuZE9mV29yZFxuICAgICAgICBjdXJzb3IubW92ZVJpZ2h0KClcbiAgICAgICAgdGhpcy5tb3ZlVG9OZXh0RW5kT2ZXb3JkKGN1cnNvcilcbiAgICAgIH1cbiAgICB9KVxuICB9XG59XG5Nb3ZlVG9FbmRPZldvcmQucmVnaXN0ZXIoKVxuXG4vLyBbVE9ETzogSW1wcm92ZSwgYWNjdXJhY3ldXG5jbGFzcyBNb3ZlVG9QcmV2aW91c0VuZE9mV29yZCBleHRlbmRzIE1vdmVUb1ByZXZpb3VzV29yZCB7XG4gIGluY2x1c2l2ZSA9IHRydWVcblxuICBtb3ZlQ3Vyc29yKGN1cnNvcikge1xuICAgIGNvbnN0IHdvcmRSYW5nZSA9IGN1cnNvci5nZXRDdXJyZW50V29yZEJ1ZmZlclJhbmdlKClcbiAgICBjb25zdCBjdXJzb3JQb3NpdGlvbiA9IGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXG5cbiAgICAvLyBpZiB3ZSdyZSBpbiB0aGUgbWlkZGxlIG9mIGEgd29yZCB0aGVuIHdlIG5lZWQgdG8gbW92ZSB0byBpdHMgc3RhcnRcbiAgICBsZXQgdGltZXMgPSB0aGlzLmdldENvdW50KClcbiAgICBpZiAoY3Vyc29yUG9zaXRpb24uaXNHcmVhdGVyVGhhbih3b3JkUmFuZ2Uuc3RhcnQpICYmIGN1cnNvclBvc2l0aW9uLmlzTGVzc1RoYW4od29yZFJhbmdlLmVuZCkpIHtcbiAgICAgIHRpbWVzICs9IDFcbiAgICB9XG5cbiAgICBmb3IgKGNvbnN0IGkgaW4gdGhpcy51dGlscy5nZXRMaXN0KDEsIHRpbWVzKSkge1xuICAgICAgY29uc3QgcG9pbnQgPSBjdXJzb3IuZ2V0QmVnaW5uaW5nT2ZDdXJyZW50V29yZEJ1ZmZlclBvc2l0aW9uKHt3b3JkUmVnZXg6IHRoaXMud29yZFJlZ2V4fSlcbiAgICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihwb2ludClcbiAgICB9XG5cbiAgICB0aGlzLm1vdmVUb05leHRFbmRPZldvcmQoY3Vyc29yKVxuICAgIGlmIChjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKS5pc0dyZWF0ZXJUaGFuT3JFcXVhbChjdXJzb3JQb3NpdGlvbikpIHtcbiAgICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihbMCwgMF0pXG4gICAgfVxuICB9XG5cbiAgbW92ZVRvTmV4dEVuZE9mV29yZChjdXJzb3IpIHtcbiAgICBjb25zdCBwb2ludCA9IGN1cnNvci5nZXRFbmRPZkN1cnJlbnRXb3JkQnVmZmVyUG9zaXRpb24oe3dvcmRSZWdleDogdGhpcy53b3JkUmVnZXh9KS50cmFuc2xhdGUoWzAsIC0xXSlcbiAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24oUG9pbnQubWluKHBvaW50LCB0aGlzLmdldFZpbUVvZkJ1ZmZlclBvc2l0aW9uKCkpKVxuICB9XG59XG5Nb3ZlVG9QcmV2aW91c0VuZE9mV29yZC5yZWdpc3RlcigpXG5cbi8vIFdob2xlIHdvcmRcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIE1vdmVUb05leHRXaG9sZVdvcmQgZXh0ZW5kcyBNb3ZlVG9OZXh0V29yZCB7XG4gIHdvcmRSZWdleCA9IC9eJHxcXFMrL2dcbn1cbk1vdmVUb05leHRXaG9sZVdvcmQucmVnaXN0ZXIoKVxuXG5jbGFzcyBNb3ZlVG9QcmV2aW91c1dob2xlV29yZCBleHRlbmRzIE1vdmVUb1ByZXZpb3VzV29yZCB7XG4gIHdvcmRSZWdleCA9IC9eJHxcXFMrL2dcbn1cbk1vdmVUb1ByZXZpb3VzV2hvbGVXb3JkLnJlZ2lzdGVyKClcblxuY2xhc3MgTW92ZVRvRW5kT2ZXaG9sZVdvcmQgZXh0ZW5kcyBNb3ZlVG9FbmRPZldvcmQge1xuICB3b3JkUmVnZXggPSAvXFxTKy9cbn1cbk1vdmVUb0VuZE9mV2hvbGVXb3JkLnJlZ2lzdGVyKClcblxuLy8gW1RPRE86IEltcHJvdmUsIGFjY3VyYWN5XVxuY2xhc3MgTW92ZVRvUHJldmlvdXNFbmRPZldob2xlV29yZCBleHRlbmRzIE1vdmVUb1ByZXZpb3VzRW5kT2ZXb3JkIHtcbiAgd29yZFJlZ2V4ID0gL1xcUysvXG59XG5Nb3ZlVG9QcmV2aW91c0VuZE9mV2hvbGVXb3JkLnJlZ2lzdGVyKClcblxuLy8gQWxwaGFudW1lcmljIHdvcmQgW0V4cGVyaW1lbnRhbF1cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIE1vdmVUb05leHRBbHBoYW51bWVyaWNXb3JkIGV4dGVuZHMgTW92ZVRvTmV4dFdvcmQge1xuICB3b3JkUmVnZXggPSAvXFx3Ky9nXG59XG5Nb3ZlVG9OZXh0QWxwaGFudW1lcmljV29yZC5yZWdpc3RlcigpXG5cbmNsYXNzIE1vdmVUb1ByZXZpb3VzQWxwaGFudW1lcmljV29yZCBleHRlbmRzIE1vdmVUb1ByZXZpb3VzV29yZCB7XG4gIHdvcmRSZWdleCA9IC9cXHcrL1xufVxuTW92ZVRvUHJldmlvdXNBbHBoYW51bWVyaWNXb3JkLnJlZ2lzdGVyKClcblxuY2xhc3MgTW92ZVRvRW5kT2ZBbHBoYW51bWVyaWNXb3JkIGV4dGVuZHMgTW92ZVRvRW5kT2ZXb3JkIHtcbiAgd29yZFJlZ2V4ID0gL1xcdysvXG59XG5Nb3ZlVG9FbmRPZkFscGhhbnVtZXJpY1dvcmQucmVnaXN0ZXIoKVxuXG4vLyBBbHBoYW51bWVyaWMgd29yZCBbRXhwZXJpbWVudGFsXVxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgTW92ZVRvTmV4dFNtYXJ0V29yZCBleHRlbmRzIE1vdmVUb05leHRXb3JkIHtcbiAgd29yZFJlZ2V4ID0gL1tcXHctXSsvZ1xufVxuTW92ZVRvTmV4dFNtYXJ0V29yZC5yZWdpc3RlcigpXG5cbmNsYXNzIE1vdmVUb1ByZXZpb3VzU21hcnRXb3JkIGV4dGVuZHMgTW92ZVRvUHJldmlvdXNXb3JkIHtcbiAgd29yZFJlZ2V4ID0gL1tcXHctXSsvXG59XG5Nb3ZlVG9QcmV2aW91c1NtYXJ0V29yZC5yZWdpc3RlcigpXG5cbmNsYXNzIE1vdmVUb0VuZE9mU21hcnRXb3JkIGV4dGVuZHMgTW92ZVRvRW5kT2ZXb3JkIHtcbiAgd29yZFJlZ2V4ID0gL1tcXHctXSsvXG59XG5Nb3ZlVG9FbmRPZlNtYXJ0V29yZC5yZWdpc3RlcigpXG5cbi8vIFN1YndvcmRcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIE1vdmVUb05leHRTdWJ3b3JkIGV4dGVuZHMgTW92ZVRvTmV4dFdvcmQge1xuICBtb3ZlQ3Vyc29yKGN1cnNvcikge1xuICAgIHRoaXMud29yZFJlZ2V4ID0gY3Vyc29yLnN1YndvcmRSZWdFeHAoKVxuICAgIHN1cGVyLm1vdmVDdXJzb3IoY3Vyc29yKVxuICB9XG59XG5Nb3ZlVG9OZXh0U3Vid29yZC5yZWdpc3RlcigpXG5cbmNsYXNzIE1vdmVUb1ByZXZpb3VzU3Vid29yZCBleHRlbmRzIE1vdmVUb1ByZXZpb3VzV29yZCB7XG4gIG1vdmVDdXJzb3IoY3Vyc29yKSB7XG4gICAgdGhpcy53b3JkUmVnZXggPSBjdXJzb3Iuc3Vid29yZFJlZ0V4cCgpXG4gICAgc3VwZXIubW92ZUN1cnNvcihjdXJzb3IpXG4gIH1cbn1cbk1vdmVUb1ByZXZpb3VzU3Vid29yZC5yZWdpc3RlcigpXG5cbmNsYXNzIE1vdmVUb0VuZE9mU3Vid29yZCBleHRlbmRzIE1vdmVUb0VuZE9mV29yZCB7XG4gIG1vdmVDdXJzb3IoY3Vyc29yKSB7XG4gICAgdGhpcy53b3JkUmVnZXggPSBjdXJzb3Iuc3Vid29yZFJlZ0V4cCgpXG4gICAgc3VwZXIubW92ZUN1cnNvcihjdXJzb3IpXG4gIH1cbn1cbk1vdmVUb0VuZE9mU3Vid29yZC5yZWdpc3RlcigpXG5cbi8vIFNlbnRlbmNlXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBTZW50ZW5jZSBpcyBkZWZpbmVkIGFzIGJlbG93XG4vLyAgLSBlbmQgd2l0aCBbJy4nLCAnIScsICc/J11cbi8vICAtIG9wdGlvbmFsbHkgZm9sbG93ZWQgYnkgWycpJywgJ10nLCAnXCInLCBcIidcIl1cbi8vICAtIGZvbGxvd2VkIGJ5IFsnJCcsICcgJywgJ1xcdCddXG4vLyAgLSBwYXJhZ3JhcGggYm91bmRhcnkgaXMgYWxzbyBzZW50ZW5jZSBib3VuZGFyeVxuLy8gIC0gc2VjdGlvbiBib3VuZGFyeSBpcyBhbHNvIHNlbnRlbmNlIGJvdW5kYXJ5KGlnbm9yZSlcbmNsYXNzIE1vdmVUb05leHRTZW50ZW5jZSBleHRlbmRzIE1vdGlvbiB7XG4gIGp1bXAgPSB0cnVlXG4gIHNlbnRlbmNlUmVnZXggPSBuZXcgUmVnRXhwKGAoPzpbXFxcXC4hXFxcXD9dW1xcXFwpXFxcXF1cIiddKlxcXFxzKyl8KFxcXFxufFxcXFxyXFxcXG4pYCwgXCJnXCIpXG4gIGRpcmVjdGlvbiA9IFwibmV4dFwiXG5cbiAgbW92ZUN1cnNvcihjdXJzb3IpIHtcbiAgICB0aGlzLm1vdmVDdXJzb3JDb3VudFRpbWVzKGN1cnNvciwgKCkgPT4ge1xuICAgICAgdGhpcy5zZXRCdWZmZXJQb3NpdGlvblNhZmVseShjdXJzb3IsIHRoaXMuZ2V0UG9pbnQoY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKCkpKVxuICAgIH0pXG4gIH1cblxuICBnZXRQb2ludChmcm9tUG9pbnQpIHtcbiAgICByZXR1cm4gdGhpcy5kaXJlY3Rpb24gPT09IFwibmV4dFwiXG4gICAgICA/IHRoaXMuZ2V0TmV4dFN0YXJ0T2ZTZW50ZW5jZShmcm9tUG9pbnQpXG4gICAgICA6IHRoaXMuZ2V0UHJldmlvdXNTdGFydE9mU2VudGVuY2UoZnJvbVBvaW50KVxuICB9XG5cbiAgaXNCbGFua1Jvdyhyb3cpIHtcbiAgICByZXR1cm4gdGhpcy5lZGl0b3IuaXNCdWZmZXJSb3dCbGFuayhyb3cpXG4gIH1cblxuICBnZXROZXh0U3RhcnRPZlNlbnRlbmNlKGZyb20pIHtcbiAgICBsZXQgZm91bmRQb2ludFxuICAgIHRoaXMuc2NhbkZvcndhcmQodGhpcy5zZW50ZW5jZVJlZ2V4LCB7ZnJvbX0sICh7cmFuZ2UsIG1hdGNoVGV4dCwgbWF0Y2gsIHN0b3B9KSA9PiB7XG4gICAgICBpZiAobWF0Y2hbMV0gIT0gbnVsbCkge1xuICAgICAgICBjb25zdCBbc3RhcnRSb3csIGVuZFJvd10gPSBbcmFuZ2Uuc3RhcnQucm93LCByYW5nZS5lbmQucm93XVxuICAgICAgICBpZiAodGhpcy5za2lwQmxhbmtSb3cgJiYgdGhpcy5pc0JsYW5rUm93KGVuZFJvdykpIHJldHVyblxuICAgICAgICBpZiAodGhpcy5pc0JsYW5rUm93KHN0YXJ0Um93KSAhPT0gdGhpcy5pc0JsYW5rUm93KGVuZFJvdykpIHtcbiAgICAgICAgICBmb3VuZFBvaW50ID0gdGhpcy5nZXRGaXJzdENoYXJhY3RlclBvc2l0aW9uRm9yQnVmZmVyUm93KGVuZFJvdylcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZm91bmRQb2ludCA9IHJhbmdlLmVuZFxuICAgICAgfVxuICAgICAgaWYgKGZvdW5kUG9pbnQpIHN0b3AoKVxuICAgIH0pXG4gICAgcmV0dXJuIGZvdW5kUG9pbnQgfHwgdGhpcy5nZXRWaW1Fb2ZCdWZmZXJQb3NpdGlvbigpXG4gIH1cblxuICBnZXRQcmV2aW91c1N0YXJ0T2ZTZW50ZW5jZShmcm9tKSB7XG4gICAgbGV0IGZvdW5kUG9pbnRcbiAgICB0aGlzLnNjYW5CYWNrd2FyZCh0aGlzLnNlbnRlbmNlUmVnZXgsIHtmcm9tfSwgKHtyYW5nZSwgbWF0Y2hUZXh0LCBtYXRjaCwgc3RvcH0pID0+IHtcbiAgICAgIGlmIChtYXRjaFsxXSAhPSBudWxsKSB7XG4gICAgICAgIGNvbnN0IFtzdGFydFJvdywgZW5kUm93XSA9IFtyYW5nZS5zdGFydC5yb3csIHJhbmdlLmVuZC5yb3ddXG4gICAgICAgIGlmICghdGhpcy5pc0JsYW5rUm93KGVuZFJvdykgJiYgdGhpcy5pc0JsYW5rUm93KHN0YXJ0Um93KSkge1xuICAgICAgICAgIGNvbnN0IHBvaW50ID0gdGhpcy5nZXRGaXJzdENoYXJhY3RlclBvc2l0aW9uRm9yQnVmZmVyUm93KGVuZFJvdylcbiAgICAgICAgICBpZiAocG9pbnQuaXNMZXNzVGhhbihmcm9tKSkge1xuICAgICAgICAgICAgZm91bmRQb2ludCA9IHBvaW50XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnNraXBCbGFua1JvdykgcmV0dXJuXG4gICAgICAgICAgICBmb3VuZFBvaW50ID0gdGhpcy5nZXRGaXJzdENoYXJhY3RlclBvc2l0aW9uRm9yQnVmZmVyUm93KHN0YXJ0Um93KVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKHJhbmdlLmVuZC5pc0xlc3NUaGFuKGZyb20pKSBmb3VuZFBvaW50ID0gcmFuZ2UuZW5kXG4gICAgICB9XG4gICAgICBpZiAoZm91bmRQb2ludCkgc3RvcCgpXG4gICAgfSlcbiAgICByZXR1cm4gZm91bmRQb2ludCB8fCBbMCwgMF1cbiAgfVxufVxuTW92ZVRvTmV4dFNlbnRlbmNlLnJlZ2lzdGVyKClcblxuY2xhc3MgTW92ZVRvUHJldmlvdXNTZW50ZW5jZSBleHRlbmRzIE1vdmVUb05leHRTZW50ZW5jZSB7XG4gIGRpcmVjdGlvbiA9IFwicHJldmlvdXNcIlxufVxuTW92ZVRvUHJldmlvdXNTZW50ZW5jZS5yZWdpc3RlcigpXG5cbmNsYXNzIE1vdmVUb05leHRTZW50ZW5jZVNraXBCbGFua1JvdyBleHRlbmRzIE1vdmVUb05leHRTZW50ZW5jZSB7XG4gIHNraXBCbGFua1JvdyA9IHRydWVcbn1cbk1vdmVUb05leHRTZW50ZW5jZVNraXBCbGFua1Jvdy5yZWdpc3RlcigpXG5cbmNsYXNzIE1vdmVUb1ByZXZpb3VzU2VudGVuY2VTa2lwQmxhbmtSb3cgZXh0ZW5kcyBNb3ZlVG9QcmV2aW91c1NlbnRlbmNlIHtcbiAgc2tpcEJsYW5rUm93ID0gdHJ1ZVxufVxuTW92ZVRvUHJldmlvdXNTZW50ZW5jZVNraXBCbGFua1Jvdy5yZWdpc3RlcigpXG5cbi8vIFBhcmFncmFwaFxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgTW92ZVRvTmV4dFBhcmFncmFwaCBleHRlbmRzIE1vdGlvbiB7XG4gIGp1bXAgPSB0cnVlXG4gIGRpcmVjdGlvbiA9IFwibmV4dFwiXG5cbiAgbW92ZUN1cnNvcihjdXJzb3IpIHtcbiAgICB0aGlzLm1vdmVDdXJzb3JDb3VudFRpbWVzKGN1cnNvciwgKCkgPT4ge1xuICAgICAgdGhpcy5zZXRCdWZmZXJQb3NpdGlvblNhZmVseShjdXJzb3IsIHRoaXMuZ2V0UG9pbnQoY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKCkpKVxuICAgIH0pXG4gIH1cblxuICBnZXRQb2ludChmcm9tUG9pbnQpIHtcbiAgICBjb25zdCBzdGFydFJvdyA9IGZyb21Qb2ludC5yb3dcbiAgICBsZXQgd2FzQmxhbmtSb3cgPSB0aGlzLmVkaXRvci5pc0J1ZmZlclJvd0JsYW5rKHN0YXJ0Um93KVxuICAgIGZvciAoY29uc3Qgcm93IG9mIHRoaXMuZ2V0QnVmZmVyUm93cyh7c3RhcnRSb3csIGRpcmVjdGlvbjogdGhpcy5kaXJlY3Rpb259KSkge1xuICAgICAgY29uc3QgaXNCbGFua1JvdyA9IHRoaXMuZWRpdG9yLmlzQnVmZmVyUm93Qmxhbmsocm93KVxuICAgICAgaWYgKCF3YXNCbGFua1JvdyAmJiBpc0JsYW5rUm93KSB7XG4gICAgICAgIHJldHVybiBuZXcgUG9pbnQocm93LCAwKVxuICAgICAgfVxuICAgICAgd2FzQmxhbmtSb3cgPSBpc0JsYW5rUm93XG4gICAgfVxuXG4gICAgLy8gZmFsbGJhY2tcbiAgICByZXR1cm4gdGhpcy5kaXJlY3Rpb24gPT09IFwicHJldmlvdXNcIiA/IG5ldyBQb2ludCgwLCAwKSA6IHRoaXMuZ2V0VmltRW9mQnVmZmVyUG9zaXRpb24oKVxuICB9XG59XG5Nb3ZlVG9OZXh0UGFyYWdyYXBoLnJlZ2lzdGVyKClcblxuY2xhc3MgTW92ZVRvUHJldmlvdXNQYXJhZ3JhcGggZXh0ZW5kcyBNb3ZlVG9OZXh0UGFyYWdyYXBoIHtcbiAgZGlyZWN0aW9uID0gXCJwcmV2aW91c1wiXG59XG5Nb3ZlVG9QcmV2aW91c1BhcmFncmFwaC5yZWdpc3RlcigpXG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIGtleW1hcDogMFxuY2xhc3MgTW92ZVRvQmVnaW5uaW5nT2ZMaW5lIGV4dGVuZHMgTW90aW9uIHtcbiAgbW92ZUN1cnNvcihjdXJzb3IpIHtcbiAgICB0aGlzLnV0aWxzLnNldEJ1ZmZlckNvbHVtbihjdXJzb3IsIDApXG4gIH1cbn1cbk1vdmVUb0JlZ2lubmluZ09mTGluZS5yZWdpc3RlcigpXG5cbmNsYXNzIE1vdmVUb0NvbHVtbiBleHRlbmRzIE1vdGlvbiB7XG4gIG1vdmVDdXJzb3IoY3Vyc29yKSB7XG4gICAgdGhpcy51dGlscy5zZXRCdWZmZXJDb2x1bW4oY3Vyc29yLCB0aGlzLmdldENvdW50KC0xKSlcbiAgfVxufVxuTW92ZVRvQ29sdW1uLnJlZ2lzdGVyKClcblxuY2xhc3MgTW92ZVRvTGFzdENoYXJhY3Rlck9mTGluZSBleHRlbmRzIE1vdGlvbiB7XG4gIG1vdmVDdXJzb3IoY3Vyc29yKSB7XG4gICAgY29uc3Qgcm93ID0gdGhpcy5nZXRWYWxpZFZpbUJ1ZmZlclJvdyhjdXJzb3IuZ2V0QnVmZmVyUm93KCkgKyB0aGlzLmdldENvdW50KC0xKSlcbiAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24oW3JvdywgSW5maW5pdHldKVxuICAgIGN1cnNvci5nb2FsQ29sdW1uID0gSW5maW5pdHlcbiAgfVxufVxuTW92ZVRvTGFzdENoYXJhY3Rlck9mTGluZS5yZWdpc3RlcigpXG5cbmNsYXNzIE1vdmVUb0xhc3ROb25ibGFua0NoYXJhY3Rlck9mTGluZUFuZERvd24gZXh0ZW5kcyBNb3Rpb24ge1xuICBpbmNsdXNpdmUgPSB0cnVlXG5cbiAgbW92ZUN1cnNvcihjdXJzb3IpIHtcbiAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24odGhpcy5nZXRQb2ludChjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKSkpXG4gIH1cblxuICBnZXRQb2ludCh7cm93fSkge1xuICAgIHJvdyA9IHRoaXMudXRpbHMubGltaXROdW1iZXIocm93ICsgdGhpcy5nZXRDb3VudCgtMSksIHttYXg6IHRoaXMuZ2V0VmltTGFzdEJ1ZmZlclJvdygpfSlcbiAgICBjb25zdCByYW5nZSA9IHRoaXMudXRpbHMuZmluZFJhbmdlSW5CdWZmZXJSb3codGhpcy5lZGl0b3IsIC9cXFN8Xi8sIHJvdywge2RpcmVjdGlvbjogXCJiYWNrd2FyZFwifSlcbiAgICByZXR1cm4gcmFuZ2UgPyByYW5nZS5zdGFydCA6IG5ldyBQb2ludChyb3csIDApXG4gIH1cbn1cbk1vdmVUb0xhc3ROb25ibGFua0NoYXJhY3Rlck9mTGluZUFuZERvd24ucmVnaXN0ZXIoKVxuXG4vLyBNb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZSBmYWltaWx5XG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIF5cbmNsYXNzIE1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lIGV4dGVuZHMgTW90aW9uIHtcbiAgbW92ZUN1cnNvcihjdXJzb3IpIHtcbiAgICBjb25zdCBwb2ludCA9IHRoaXMuZ2V0Rmlyc3RDaGFyYWN0ZXJQb3NpdGlvbkZvckJ1ZmZlclJvdyhjdXJzb3IuZ2V0QnVmZmVyUm93KCkpXG4gICAgdGhpcy5zZXRCdWZmZXJQb3NpdGlvblNhZmVseShjdXJzb3IsIHBvaW50KVxuICB9XG59XG5Nb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZS5yZWdpc3RlcigpXG5cbmNsYXNzIE1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lVXAgZXh0ZW5kcyBNb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZSB7XG4gIHdpc2UgPSBcImxpbmV3aXNlXCJcbiAgbW92ZUN1cnNvcihjdXJzb3IpIHtcbiAgICB0aGlzLm1vdmVDdXJzb3JDb3VudFRpbWVzKGN1cnNvciwgKCkgPT4ge1xuICAgICAgY29uc3Qgcm93ID0gdGhpcy5nZXRWYWxpZFZpbUJ1ZmZlclJvdyhjdXJzb3IuZ2V0QnVmZmVyUm93KCkgLSAxKVxuICAgICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKFtyb3csIDBdKVxuICAgIH0pXG4gICAgc3VwZXIubW92ZUN1cnNvcihjdXJzb3IpXG4gIH1cbn1cbk1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lVXAucmVnaXN0ZXIoKVxuXG5jbGFzcyBNb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZURvd24gZXh0ZW5kcyBNb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZSB7XG4gIHdpc2UgPSBcImxpbmV3aXNlXCJcbiAgbW92ZUN1cnNvcihjdXJzb3IpIHtcbiAgICB0aGlzLm1vdmVDdXJzb3JDb3VudFRpbWVzKGN1cnNvciwgKCkgPT4ge1xuICAgICAgY29uc3QgcG9pbnQgPSBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuICAgICAgaWYgKHBvaW50LnJvdyA8IHRoaXMuZ2V0VmltTGFzdEJ1ZmZlclJvdygpKSB7XG4gICAgICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihwb2ludC50cmFuc2xhdGUoWysxLCAwXSkpXG4gICAgICB9XG4gICAgfSlcbiAgICBzdXBlci5tb3ZlQ3Vyc29yKGN1cnNvcilcbiAgfVxufVxuTW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmVEb3duLnJlZ2lzdGVyKClcblxuY2xhc3MgTW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmVBbmREb3duIGV4dGVuZHMgTW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmVEb3duIHtcbiAgZ2V0Q291bnQoKSB7XG4gICAgcmV0dXJuIHN1cGVyLmdldENvdW50KC0xKVxuICB9XG59XG5Nb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZUFuZERvd24ucmVnaXN0ZXIoKVxuXG5jbGFzcyBNb3ZlVG9TY3JlZW5Db2x1bW4gZXh0ZW5kcyBNb3Rpb24ge1xuICBtb3ZlQ3Vyc29yKGN1cnNvcikge1xuICAgIGNvbnN0IGFsbG93T2ZmU2NyZWVuUG9zaXRpb24gPSB0aGlzLmdldENvbmZpZyhcImFsbG93TW92ZVRvT2ZmU2NyZWVuQ29sdW1uT25TY3JlZW5MaW5lTW90aW9uXCIpXG4gICAgY29uc3QgcG9pbnQgPSB0aGlzLnV0aWxzLmdldFNjcmVlblBvc2l0aW9uRm9yU2NyZWVuUm93KHRoaXMuZWRpdG9yLCBjdXJzb3IuZ2V0U2NyZWVuUm93KCksIHRoaXMud2hpY2gsIHtcbiAgICAgIGFsbG93T2ZmU2NyZWVuUG9zaXRpb24sXG4gICAgfSlcbiAgICB0aGlzLnNldFNjcmVlblBvc2l0aW9uU2FmZWx5KGN1cnNvciwgcG9pbnQpXG4gIH1cbn1cbk1vdmVUb1NjcmVlbkNvbHVtbi5yZWdpc3RlcihmYWxzZSlcblxuLy8ga2V5bWFwOiBnIDBcbmNsYXNzIE1vdmVUb0JlZ2lubmluZ09mU2NyZWVuTGluZSBleHRlbmRzIE1vdmVUb1NjcmVlbkNvbHVtbiB7XG4gIHdoaWNoID0gXCJiZWdpbm5pbmdcIlxufVxuTW92ZVRvQmVnaW5uaW5nT2ZTY3JlZW5MaW5lLnJlZ2lzdGVyKClcblxuLy8gZyBeOiBgbW92ZS10by1maXJzdC1jaGFyYWN0ZXItb2Ytc2NyZWVuLWxpbmVgXG5jbGFzcyBNb3ZlVG9GaXJzdENoYXJhY3Rlck9mU2NyZWVuTGluZSBleHRlbmRzIE1vdmVUb1NjcmVlbkNvbHVtbiB7XG4gIHdoaWNoID0gXCJmaXJzdC1jaGFyYWN0ZXJcIlxufVxuTW92ZVRvRmlyc3RDaGFyYWN0ZXJPZlNjcmVlbkxpbmUucmVnaXN0ZXIoKVxuXG4vLyBrZXltYXA6IGcgJFxuY2xhc3MgTW92ZVRvTGFzdENoYXJhY3Rlck9mU2NyZWVuTGluZSBleHRlbmRzIE1vdmVUb1NjcmVlbkNvbHVtbiB7XG4gIHdoaWNoID0gXCJsYXN0LWNoYXJhY3RlclwiXG59XG5Nb3ZlVG9MYXN0Q2hhcmFjdGVyT2ZTY3JlZW5MaW5lLnJlZ2lzdGVyKClcblxuLy8ga2V5bWFwOiBnIGdcbmNsYXNzIE1vdmVUb0ZpcnN0TGluZSBleHRlbmRzIE1vdGlvbiB7XG4gIHdpc2UgPSBcImxpbmV3aXNlXCJcbiAganVtcCA9IHRydWVcbiAgdmVydGljYWxNb3Rpb24gPSB0cnVlXG4gIG1vdmVTdWNjZXNzT25MaW5ld2lzZSA9IHRydWVcblxuICBtb3ZlQ3Vyc29yKGN1cnNvcikge1xuICAgIHRoaXMuc2V0Q3Vyc29yQnVmZmVyUm93KGN1cnNvciwgdGhpcy5nZXRWYWxpZFZpbUJ1ZmZlclJvdyh0aGlzLmdldFJvdygpKSlcbiAgICBjdXJzb3IuYXV0b3Njcm9sbCh7Y2VudGVyOiB0cnVlfSlcbiAgfVxuXG4gIGdldFJvdygpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRDb3VudCgtMSlcbiAgfVxufVxuTW92ZVRvRmlyc3RMaW5lLnJlZ2lzdGVyKClcblxuLy8ga2V5bWFwOiBHXG5jbGFzcyBNb3ZlVG9MYXN0TGluZSBleHRlbmRzIE1vdmVUb0ZpcnN0TGluZSB7XG4gIGRlZmF1bHRDb3VudCA9IEluZmluaXR5XG59XG5Nb3ZlVG9MYXN0TGluZS5yZWdpc3RlcigpXG5cbi8vIGtleW1hcDogTiUgZS5nLiAxMCVcbmNsYXNzIE1vdmVUb0xpbmVCeVBlcmNlbnQgZXh0ZW5kcyBNb3ZlVG9GaXJzdExpbmUge1xuICBnZXRSb3coKSB7XG4gICAgY29uc3QgcGVyY2VudCA9IHRoaXMudXRpbHMubGltaXROdW1iZXIodGhpcy5nZXRDb3VudCgpLCB7bWF4OiAxMDB9KVxuICAgIHJldHVybiBNYXRoLmZsb29yKCh0aGlzLmVkaXRvci5nZXRMaW5lQ291bnQoKSAtIDEpICogKHBlcmNlbnQgLyAxMDApKVxuICB9XG59XG5Nb3ZlVG9MaW5lQnlQZXJjZW50LnJlZ2lzdGVyKClcblxuY2xhc3MgTW92ZVRvUmVsYXRpdmVMaW5lIGV4dGVuZHMgTW90aW9uIHtcbiAgd2lzZSA9IFwibGluZXdpc2VcIlxuICBtb3ZlU3VjY2Vzc09uTGluZXdpc2UgPSB0cnVlXG5cbiAgbW92ZUN1cnNvcihjdXJzb3IpIHtcbiAgICBsZXQgcm93XG4gICAgbGV0IGNvdW50ID0gdGhpcy5nZXRDb3VudCgpXG4gICAgaWYgKGNvdW50IDwgMCkge1xuICAgICAgLy8gU3VwcG9ydCBuZWdhdGl2ZSBjb3VudFxuICAgICAgLy8gTmVnYXRpdmUgY291bnQgY2FuIGJlIHBhc3NlZCBsaWtlIGBvcGVyYXRpb25TdGFjay5ydW4oXCJNb3ZlVG9SZWxhdGl2ZUxpbmVcIiwge2NvdW50OiAtNX0pYC5cbiAgICAgIC8vIEN1cnJlbnRseSB1c2VkIGluIHZpbS1tb2RlLXBsdXMtZXgtbW9kZSBwa2cuXG4gICAgICBjb3VudCArPSAxXG4gICAgICByb3cgPSB0aGlzLmdldEZvbGRTdGFydFJvd0ZvclJvdyhjdXJzb3IuZ2V0QnVmZmVyUm93KCkpXG4gICAgICB3aGlsZSAoY291bnQrKyA8IDApIHJvdyA9IHRoaXMuZ2V0Rm9sZFN0YXJ0Um93Rm9yUm93KHJvdyAtIDEpXG4gICAgfSBlbHNlIHtcbiAgICAgIGNvdW50IC09IDFcbiAgICAgIHJvdyA9IHRoaXMuZ2V0Rm9sZEVuZFJvd0ZvclJvdyhjdXJzb3IuZ2V0QnVmZmVyUm93KCkpXG4gICAgICB3aGlsZSAoY291bnQtLSA+IDApIHJvdyA9IHRoaXMuZ2V0Rm9sZEVuZFJvd0ZvclJvdyhyb3cgKyAxKVxuICAgIH1cbiAgICB0aGlzLnV0aWxzLnNldEJ1ZmZlclJvdyhjdXJzb3IsIHJvdylcbiAgfVxufVxuTW92ZVRvUmVsYXRpdmVMaW5lLnJlZ2lzdGVyKGZhbHNlKVxuXG5jbGFzcyBNb3ZlVG9SZWxhdGl2ZUxpbmVNaW5pbXVtVHdvIGV4dGVuZHMgTW92ZVRvUmVsYXRpdmVMaW5lIHtcbiAgZ2V0Q291bnQoLi4uYXJncykge1xuICAgIHJldHVybiB0aGlzLnV0aWxzLmxpbWl0TnVtYmVyKHN1cGVyLmdldENvdW50KC4uLmFyZ3MpLCB7bWluOiAyfSlcbiAgfVxufVxuTW92ZVRvUmVsYXRpdmVMaW5lTWluaW11bVR3by5yZWdpc3RlcihmYWxzZSlcblxuLy8gUG9zaXRpb24gY3Vyc29yIHdpdGhvdXQgc2Nyb2xsaW5nLiwgSCwgTSwgTFxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8ga2V5bWFwOiBIXG5jbGFzcyBNb3ZlVG9Ub3BPZlNjcmVlbiBleHRlbmRzIE1vdGlvbiB7XG4gIHdpc2UgPSBcImxpbmV3aXNlXCJcbiAganVtcCA9IHRydWVcbiAgc2Nyb2xsb2ZmID0gMlxuICBkZWZhdWx0Q291bnQgPSAwXG4gIHZlcnRpY2FsTW90aW9uID0gdHJ1ZVxuXG4gIG1vdmVDdXJzb3IoY3Vyc29yKSB7XG4gICAgY29uc3QgYnVmZmVyUm93ID0gdGhpcy5lZGl0b3IuYnVmZmVyUm93Rm9yU2NyZWVuUm93KHRoaXMuZ2V0U2NyZWVuUm93KCkpXG4gICAgdGhpcy5zZXRDdXJzb3JCdWZmZXJSb3coY3Vyc29yLCBidWZmZXJSb3cpXG4gIH1cblxuICBnZXRTY3JvbGxvZmYoKSB7XG4gICAgcmV0dXJuIHRoaXMuaXNBc1RhcmdldEV4Y2VwdFNlbGVjdEluVmlzdWFsTW9kZSgpID8gMCA6IHRoaXMuc2Nyb2xsb2ZmXG4gIH1cblxuICBnZXRTY3JlZW5Sb3coKSB7XG4gICAgY29uc3QgZmlyc3RSb3cgPSB0aGlzLmVkaXRvci5nZXRGaXJzdFZpc2libGVTY3JlZW5Sb3coKVxuICAgIGxldCBvZmZzZXQgPSB0aGlzLmdldFNjcm9sbG9mZigpXG4gICAgaWYgKGZpcnN0Um93ID09PSAwKSB7XG4gICAgICBvZmZzZXQgPSAwXG4gICAgfVxuICAgIG9mZnNldCA9IHRoaXMudXRpbHMubGltaXROdW1iZXIodGhpcy5nZXRDb3VudCgtMSksIHttaW46IG9mZnNldH0pXG4gICAgcmV0dXJuIGZpcnN0Um93ICsgb2Zmc2V0XG4gIH1cbn1cbk1vdmVUb1RvcE9mU2NyZWVuLnJlZ2lzdGVyKClcblxuLy8ga2V5bWFwOiBNXG5jbGFzcyBNb3ZlVG9NaWRkbGVPZlNjcmVlbiBleHRlbmRzIE1vdmVUb1RvcE9mU2NyZWVuIHtcbiAgZ2V0U2NyZWVuUm93KCkge1xuICAgIGNvbnN0IHN0YXJ0Um93ID0gdGhpcy5lZGl0b3IuZ2V0Rmlyc3RWaXNpYmxlU2NyZWVuUm93KClcbiAgICBjb25zdCBlbmRSb3cgPSB0aGlzLnV0aWxzLmxpbWl0TnVtYmVyKHRoaXMuZWRpdG9yLmdldExhc3RWaXNpYmxlU2NyZWVuUm93KCksIHttYXg6IHRoaXMuZ2V0VmltTGFzdFNjcmVlblJvdygpfSlcbiAgICByZXR1cm4gc3RhcnRSb3cgKyBNYXRoLmZsb29yKChlbmRSb3cgLSBzdGFydFJvdykgLyAyKVxuICB9XG59XG5Nb3ZlVG9NaWRkbGVPZlNjcmVlbi5yZWdpc3RlcigpXG5cbi8vIGtleW1hcDogTFxuY2xhc3MgTW92ZVRvQm90dG9tT2ZTY3JlZW4gZXh0ZW5kcyBNb3ZlVG9Ub3BPZlNjcmVlbiB7XG4gIGdldFNjcmVlblJvdygpIHtcbiAgICBjb25zdCB2aW1MYXN0U2NyZWVuUm93ID0gdGhpcy5nZXRWaW1MYXN0U2NyZWVuUm93KClcbiAgICBjb25zdCByb3cgPSB0aGlzLnV0aWxzLmxpbWl0TnVtYmVyKHRoaXMuZWRpdG9yLmdldExhc3RWaXNpYmxlU2NyZWVuUm93KCksIHttYXg6IHZpbUxhc3RTY3JlZW5Sb3d9KVxuICAgIGxldCBvZmZzZXQgPSB0aGlzLmdldFNjcm9sbG9mZigpICsgMVxuICAgIGlmIChyb3cgPT09IHZpbUxhc3RTY3JlZW5Sb3cpIHtcbiAgICAgIG9mZnNldCA9IDBcbiAgICB9XG4gICAgb2Zmc2V0ID0gdGhpcy51dGlscy5saW1pdE51bWJlcih0aGlzLmdldENvdW50KC0xKSwge21pbjogb2Zmc2V0fSlcbiAgICByZXR1cm4gcm93IC0gb2Zmc2V0XG4gIH1cbn1cbk1vdmVUb0JvdHRvbU9mU2NyZWVuLnJlZ2lzdGVyKClcblxuLy8gU2Nyb2xsaW5nXG4vLyBIYWxmOiBjdHJsLWQsIGN0cmwtdVxuLy8gRnVsbDogY3RybC1mLCBjdHJsLWJcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFtGSVhNRV0gY291bnQgYmVoYXZlIGRpZmZlcmVudGx5IGZyb20gb3JpZ2luYWwgVmltLlxuY2xhc3MgU2Nyb2xsIGV4dGVuZHMgTW90aW9uIHtcbiAgdmVydGljYWxNb3Rpb24gPSB0cnVlXG5cbiAgaXNTbW9vdGhTY3JvbGxFbmFibGVkKCkge1xuICAgIHJldHVybiBNYXRoLmFicyh0aGlzLmFtb3VudE9mUGFnZSkgPT09IDFcbiAgICAgID8gdGhpcy5nZXRDb25maWcoXCJzbW9vdGhTY3JvbGxPbkZ1bGxTY3JvbGxNb3Rpb25cIilcbiAgICAgIDogdGhpcy5nZXRDb25maWcoXCJzbW9vdGhTY3JvbGxPbkhhbGZTY3JvbGxNb3Rpb25cIilcbiAgfVxuXG4gIGdldFNtb290aFNjcm9sbER1YXRpb24oKSB7XG4gICAgcmV0dXJuIE1hdGguYWJzKHRoaXMuYW1vdW50T2ZQYWdlKSA9PT0gMVxuICAgICAgPyB0aGlzLmdldENvbmZpZyhcInNtb290aFNjcm9sbE9uRnVsbFNjcm9sbE1vdGlvbkR1cmF0aW9uXCIpXG4gICAgICA6IHRoaXMuZ2V0Q29uZmlnKFwic21vb3RoU2Nyb2xsT25IYWxmU2Nyb2xsTW90aW9uRHVyYXRpb25cIilcbiAgfVxuXG4gIGdldFBpeGVsUmVjdFRvcEZvclNjZWVuUm93KHJvdykge1xuICAgIGNvbnN0IHBvaW50ID0gbmV3IFBvaW50KHJvdywgMClcbiAgICByZXR1cm4gdGhpcy5lZGl0b3IuZWxlbWVudC5waXhlbFJlY3RGb3JTY3JlZW5SYW5nZShuZXcgUmFuZ2UocG9pbnQsIHBvaW50KSkudG9wXG4gIH1cblxuICBzbW9vdGhTY3JvbGwoZnJvbVJvdywgdG9Sb3csIGRvbmUpIHtcbiAgICBjb25zdCB0b3BQaXhlbEZyb20gPSB7dG9wOiB0aGlzLmdldFBpeGVsUmVjdFRvcEZvclNjZWVuUm93KGZyb21Sb3cpfVxuICAgIGNvbnN0IHRvcFBpeGVsVG8gPSB7dG9wOiB0aGlzLmdldFBpeGVsUmVjdFRvcEZvclNjZWVuUm93KHRvUm93KX1cbiAgICAvLyBbTk9URV1cbiAgICAvLyBpbnRlbnRpb25hbGx5IHVzZSBgZWxlbWVudC5jb21wb25lbnQuc2V0U2Nyb2xsVG9wYCBpbnN0ZWFkIG9mIGBlbGVtZW50LnNldFNjcm9sbFRvcGAuXG4gICAgLy8gU0luY2UgZWxlbWVudC5zZXRTY3JvbGxUb3Agd2lsbCB0aHJvdyBleGNlcHRpb24gd2hlbiBlbGVtZW50LmNvbXBvbmVudCBubyBsb25nZXIgZXhpc3RzLlxuICAgIGNvbnN0IHN0ZXAgPSBuZXdUb3AgPT4ge1xuICAgICAgaWYgKHRoaXMuZWRpdG9yLmVsZW1lbnQuY29tcG9uZW50KSB7XG4gICAgICAgIHRoaXMuZWRpdG9yLmVsZW1lbnQuY29tcG9uZW50LnNldFNjcm9sbFRvcChuZXdUb3ApXG4gICAgICAgIHRoaXMuZWRpdG9yLmVsZW1lbnQuY29tcG9uZW50LnVwZGF0ZVN5bmMoKVxuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IGR1cmF0aW9uID0gdGhpcy5nZXRTbW9vdGhTY3JvbGxEdWF0aW9uKClcbiAgICB0aGlzLnZpbVN0YXRlLnJlcXVlc3RTY3JvbGxBbmltYXRpb24odG9wUGl4ZWxGcm9tLCB0b3BQaXhlbFRvLCB7ZHVyYXRpb24sIHN0ZXAsIGRvbmV9KVxuICB9XG5cbiAgZ2V0QW1vdW50T2ZSb3dzKCkge1xuICAgIHJldHVybiBNYXRoLmNlaWwodGhpcy5hbW91bnRPZlBhZ2UgKiB0aGlzLmVkaXRvci5nZXRSb3dzUGVyUGFnZSgpICogdGhpcy5nZXRDb3VudCgpKVxuICB9XG5cbiAgZ2V0QnVmZmVyUm93KGN1cnNvcikge1xuICAgIGNvbnN0IHNjcmVlblJvdyA9IHRoaXMudXRpbHMuZ2V0VmFsaWRWaW1TY3JlZW5Sb3codGhpcy5lZGl0b3IsIGN1cnNvci5nZXRTY3JlZW5Sb3coKSArIHRoaXMuZ2V0QW1vdW50T2ZSb3dzKCkpXG4gICAgcmV0dXJuIHRoaXMuZWRpdG9yLmJ1ZmZlclJvd0ZvclNjcmVlblJvdyhzY3JlZW5Sb3cpXG4gIH1cblxuICBtb3ZlQ3Vyc29yKGN1cnNvcikge1xuICAgIGNvbnN0IGJ1ZmZlclJvdyA9IHRoaXMuZ2V0QnVmZmVyUm93KGN1cnNvcilcbiAgICB0aGlzLnNldEN1cnNvckJ1ZmZlclJvdyhjdXJzb3IsIHRoaXMuZ2V0QnVmZmVyUm93KGN1cnNvciksIHthdXRvc2Nyb2xsOiBmYWxzZX0pXG5cbiAgICBpZiAoY3Vyc29yLmlzTGFzdEN1cnNvcigpKSB7XG4gICAgICBpZiAodGhpcy5pc1Ntb290aFNjcm9sbEVuYWJsZWQoKSkgdGhpcy52aW1TdGF0ZS5maW5pc2hTY3JvbGxBbmltYXRpb24oKVxuXG4gICAgICBjb25zdCBmaXJzdFZpc2liaWxlU2NyZWVuUm93ID0gdGhpcy5lZGl0b3IuZ2V0Rmlyc3RWaXNpYmxlU2NyZWVuUm93KClcbiAgICAgIGNvbnN0IG5ld0ZpcnN0VmlzaWJpbGVCdWZmZXJSb3cgPSB0aGlzLmVkaXRvci5idWZmZXJSb3dGb3JTY3JlZW5Sb3coXG4gICAgICAgIGZpcnN0VmlzaWJpbGVTY3JlZW5Sb3cgKyB0aGlzLmdldEFtb3VudE9mUm93cygpXG4gICAgICApXG4gICAgICBjb25zdCBuZXdGaXJzdFZpc2liaWxlU2NyZWVuUm93ID0gdGhpcy5lZGl0b3Iuc2NyZWVuUm93Rm9yQnVmZmVyUm93KG5ld0ZpcnN0VmlzaWJpbGVCdWZmZXJSb3cpXG4gICAgICBjb25zdCBkb25lID0gKCkgPT4ge1xuICAgICAgICB0aGlzLmVkaXRvci5zZXRGaXJzdFZpc2libGVTY3JlZW5Sb3cobmV3Rmlyc3RWaXNpYmlsZVNjcmVlblJvdylcbiAgICAgICAgLy8gW0ZJWE1FXSBzb21ldGltZXMsIHNjcm9sbFRvcCBpcyBub3QgdXBkYXRlZCwgY2FsbGluZyB0aGlzIGZpeC5cbiAgICAgICAgLy8gSW52ZXN0aWdhdGUgYW5kIGZpbmQgYmV0dGVyIGFwcHJvYWNoIHRoZW4gcmVtb3ZlIHRoaXMgd29ya2Fyb3VuZC5cbiAgICAgICAgaWYgKHRoaXMuZWRpdG9yLmVsZW1lbnQuY29tcG9uZW50KSB0aGlzLmVkaXRvci5lbGVtZW50LmNvbXBvbmVudC51cGRhdGVTeW5jKClcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuaXNTbW9vdGhTY3JvbGxFbmFibGVkKCkpIHRoaXMuc21vb3RoU2Nyb2xsKGZpcnN0VmlzaWJpbGVTY3JlZW5Sb3csIG5ld0ZpcnN0VmlzaWJpbGVTY3JlZW5Sb3csIGRvbmUpXG4gICAgICBlbHNlIGRvbmUoKVxuICAgIH1cbiAgfVxufVxuU2Nyb2xsLnJlZ2lzdGVyKGZhbHNlKVxuXG4vLyBrZXltYXA6IGN0cmwtZlxuY2xhc3MgU2Nyb2xsRnVsbFNjcmVlbkRvd24gZXh0ZW5kcyBTY3JvbGwge1xuICBhbW91bnRPZlBhZ2UgPSArMVxufVxuU2Nyb2xsRnVsbFNjcmVlbkRvd24ucmVnaXN0ZXIoKVxuXG4vLyBrZXltYXA6IGN0cmwtYlxuY2xhc3MgU2Nyb2xsRnVsbFNjcmVlblVwIGV4dGVuZHMgU2Nyb2xsIHtcbiAgYW1vdW50T2ZQYWdlID0gLTFcbn1cblNjcm9sbEZ1bGxTY3JlZW5VcC5yZWdpc3RlcigpXG5cbi8vIGtleW1hcDogY3RybC1kXG5jbGFzcyBTY3JvbGxIYWxmU2NyZWVuRG93biBleHRlbmRzIFNjcm9sbCB7XG4gIGFtb3VudE9mUGFnZSA9ICsxIC8gMlxufVxuU2Nyb2xsSGFsZlNjcmVlbkRvd24ucmVnaXN0ZXIoKVxuXG4vLyBrZXltYXA6IGN0cmwtdVxuY2xhc3MgU2Nyb2xsSGFsZlNjcmVlblVwIGV4dGVuZHMgU2Nyb2xsIHtcbiAgYW1vdW50T2ZQYWdlID0gLTEgLyAyXG59XG5TY3JvbGxIYWxmU2NyZWVuVXAucmVnaXN0ZXIoKVxuXG4vLyBGaW5kXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBrZXltYXA6IGZcbmNsYXNzIEZpbmQgZXh0ZW5kcyBNb3Rpb24ge1xuICBiYWNrd2FyZHMgPSBmYWxzZVxuICBpbmNsdXNpdmUgPSB0cnVlXG4gIG9mZnNldCA9IDBcbiAgcmVxdWlyZUlucHV0ID0gdHJ1ZVxuICBjYXNlU2Vuc2l0aXZpdHlLaW5kID0gXCJGaW5kXCJcblxuICByZXN0b3JlRWRpdG9yU3RhdGUoKSB7XG4gICAgaWYgKHRoaXMuX3Jlc3RvcmVFZGl0b3JTdGF0ZSkgdGhpcy5fcmVzdG9yZUVkaXRvclN0YXRlKClcbiAgICB0aGlzLl9yZXN0b3JlRWRpdG9yU3RhdGUgPSBudWxsXG4gIH1cblxuICBjYW5jZWxPcGVyYXRpb24oKSB7XG4gICAgdGhpcy5yZXN0b3JlRWRpdG9yU3RhdGUoKVxuICAgIHN1cGVyLmNhbmNlbE9wZXJhdGlvbigpXG4gIH1cblxuICBpbml0aWFsaXplKCkge1xuICAgIGlmICh0aGlzLmdldENvbmZpZyhcInJldXNlRmluZEZvclJlcGVhdEZpbmRcIikpIHRoaXMucmVwZWF0SWZOZWNlc3NhcnkoKVxuICAgIGlmICghdGhpcy5pc0NvbXBsZXRlKCkpIHtcbiAgICAgIGNvbnN0IGNoYXJzTWF4ID0gdGhpcy5nZXRDb25maWcoXCJmaW5kQ2hhcnNNYXhcIilcbiAgICAgIGNvbnN0IG9wdGlvbnNCYXNlID0ge3B1cnBvc2U6IFwiZmluZFwiLCBjaGFyc01heH1cblxuICAgICAgaWYgKGNoYXJzTWF4ID09PSAxKSB7XG4gICAgICAgIHRoaXMuZm9jdXNJbnB1dChvcHRpb25zQmFzZSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX3Jlc3RvcmVFZGl0b3JTdGF0ZSA9IHRoaXMudXRpbHMuc2F2ZUVkaXRvclN0YXRlKHRoaXMuZWRpdG9yKVxuICAgICAgICBjb25zdCBvcHRpb25zID0ge1xuICAgICAgICAgIGF1dG9Db25maXJtVGltZW91dDogdGhpcy5nZXRDb25maWcoXCJmaW5kQ29uZmlybUJ5VGltZW91dFwiKSxcbiAgICAgICAgICBvbkNvbmZpcm06IGlucHV0ID0+IHtcbiAgICAgICAgICAgIHRoaXMuaW5wdXQgPSBpbnB1dFxuICAgICAgICAgICAgaWYgKGlucHV0KSB0aGlzLnByb2Nlc3NPcGVyYXRpb24oKVxuICAgICAgICAgICAgZWxzZSB0aGlzLmNhbmNlbE9wZXJhdGlvbigpXG4gICAgICAgICAgfSxcbiAgICAgICAgICBvbkNoYW5nZTogcHJlQ29uZmlybWVkQ2hhcnMgPT4ge1xuICAgICAgICAgICAgdGhpcy5wcmVDb25maXJtZWRDaGFycyA9IHByZUNvbmZpcm1lZENoYXJzXG4gICAgICAgICAgICB0aGlzLmhpZ2hsaWdodFRleHRJbkN1cnNvclJvd3ModGhpcy5wcmVDb25maXJtZWRDaGFycywgXCJwcmUtY29uZmlybVwiLCB0aGlzLmlzQmFja3dhcmRzKCkpXG4gICAgICAgICAgfSxcbiAgICAgICAgICBvbkNhbmNlbDogKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy52aW1TdGF0ZS5oaWdobGlnaHRGaW5kLmNsZWFyTWFya2VycygpXG4gICAgICAgICAgICB0aGlzLmNhbmNlbE9wZXJhdGlvbigpXG4gICAgICAgICAgfSxcbiAgICAgICAgICBjb21tYW5kczoge1xuICAgICAgICAgICAgXCJ2aW0tbW9kZS1wbHVzOmZpbmQtbmV4dC1wcmUtY29uZmlybWVkXCI6ICgpID0+IHRoaXMuZmluZFByZUNvbmZpcm1lZCgrMSksXG4gICAgICAgICAgICBcInZpbS1tb2RlLXBsdXM6ZmluZC1wcmV2aW91cy1wcmUtY29uZmlybWVkXCI6ICgpID0+IHRoaXMuZmluZFByZUNvbmZpcm1lZCgtMSksXG4gICAgICAgICAgfSxcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmZvY3VzSW5wdXQoT2JqZWN0LmFzc2lnbihvcHRpb25zLCBvcHRpb25zQmFzZSkpXG4gICAgICB9XG4gICAgfVxuICAgIHN1cGVyLmluaXRpYWxpemUoKVxuICB9XG5cbiAgZmluZFByZUNvbmZpcm1lZChkZWx0YSkge1xuICAgIGlmICh0aGlzLnByZUNvbmZpcm1lZENoYXJzICYmIHRoaXMuZ2V0Q29uZmlnKFwiaGlnaGxpZ2h0RmluZENoYXJcIikpIHtcbiAgICAgIGNvbnN0IGluZGV4ID0gdGhpcy5oaWdobGlnaHRUZXh0SW5DdXJzb3JSb3dzKFxuICAgICAgICB0aGlzLnByZUNvbmZpcm1lZENoYXJzLFxuICAgICAgICBcInByZS1jb25maXJtXCIsXG4gICAgICAgIHRoaXMuaXNCYWNrd2FyZHMoKSxcbiAgICAgICAgdGhpcy5nZXRDb3VudCgtMSkgKyBkZWx0YSxcbiAgICAgICAgdHJ1ZVxuICAgICAgKVxuICAgICAgdGhpcy5jb3VudCA9IGluZGV4ICsgMVxuICAgIH1cbiAgfVxuXG4gIHJlcGVhdElmTmVjZXNzYXJ5KCkge1xuICAgIGNvbnN0IGZpbmRDb21tYW5kTmFtZXMgPSBbXCJGaW5kXCIsIFwiRmluZEJhY2t3YXJkc1wiLCBcIlRpbGxcIiwgXCJUaWxsQmFja3dhcmRzXCJdXG4gICAgY29uc3QgY3VycmVudEZpbmQgPSB0aGlzLmdsb2JhbFN0YXRlLmdldChcImN1cnJlbnRGaW5kXCIpXG4gICAgaWYgKGN1cnJlbnRGaW5kICYmIGZpbmRDb21tYW5kTmFtZXMuaW5jbHVkZXModGhpcy52aW1TdGF0ZS5vcGVyYXRpb25TdGFjay5nZXRMYXN0Q29tbWFuZE5hbWUoKSkpIHtcbiAgICAgIHRoaXMuaW5wdXQgPSBjdXJyZW50RmluZC5pbnB1dFxuICAgICAgdGhpcy5yZXBlYXRlZCA9IHRydWVcbiAgICB9XG4gIH1cblxuICBpc0JhY2t3YXJkcygpIHtcbiAgICByZXR1cm4gdGhpcy5iYWNrd2FyZHNcbiAgfVxuXG4gIGV4ZWN1dGUoKSB7XG4gICAgc3VwZXIuZXhlY3V0ZSgpXG4gICAgbGV0IGRlY29yYXRpb25UeXBlID0gXCJwb3N0LWNvbmZpcm1cIlxuICAgIGlmICh0aGlzLm9wZXJhdG9yICYmICF0aGlzLm9wZXJhdG9yLmluc3RhbmNlb2YoXCJTZWxlY3RCYXNlXCIpKSB7XG4gICAgICBkZWNvcmF0aW9uVHlwZSArPSBcIiBsb25nXCJcbiAgICB9XG5cbiAgICAvLyBIQUNLOiBXaGVuIHJlcGVhdGVkIGJ5IFwiLFwiLCB0aGlzLmJhY2t3YXJkcyBpcyB0ZW1wb3JhcnkgaW52ZXJ0ZWQgYW5kXG4gICAgLy8gcmVzdG9yZWQgYWZ0ZXIgZXhlY3V0aW9uIGZpbmlzaGVkLlxuICAgIC8vIEJ1dCBmaW5hbCBoaWdobGlnaHRUZXh0SW5DdXJzb3JSb3dzIGlzIGV4ZWN1dGVkIGluIGFzeW5jKD1hZnRlciBvcGVyYXRpb24gZmluaXNoZWQpLlxuICAgIC8vIFRodXMgd2UgbmVlZCB0byBwcmVzZXJ2ZSBiZWZvcmUgcmVzdG9yZWQgYGJhY2t3YXJkc2AgdmFsdWUgYW5kIHBhc3MgaXQuXG4gICAgY29uc3QgYmFja3dhcmRzID0gdGhpcy5pc0JhY2t3YXJkcygpXG4gICAgdGhpcy5lZGl0b3IuY29tcG9uZW50LmdldE5leHRVcGRhdGVQcm9taXNlKCkudGhlbigoKSA9PiB7XG4gICAgICB0aGlzLmhpZ2hsaWdodFRleHRJbkN1cnNvclJvd3ModGhpcy5pbnB1dCwgZGVjb3JhdGlvblR5cGUsIGJhY2t3YXJkcylcbiAgICB9KVxuICB9XG5cbiAgZ2V0UG9pbnQoZnJvbVBvaW50KSB7XG4gICAgY29uc3Qgc2NhblJhbmdlID0gdGhpcy5lZGl0b3IuYnVmZmVyUmFuZ2VGb3JCdWZmZXJSb3coZnJvbVBvaW50LnJvdylcbiAgICBjb25zdCBwb2ludHMgPSBbXVxuICAgIGNvbnN0IHJlZ2V4ID0gdGhpcy5nZXRSZWdleCh0aGlzLmlucHV0KVxuICAgIGNvbnN0IGluZGV4V2FudEFjY2VzcyA9IHRoaXMuZ2V0Q291bnQoLTEpXG5cbiAgICBjb25zdCB0cmFuc2xhdGlvbiA9IG5ldyBQb2ludCgwLCB0aGlzLmlzQmFja3dhcmRzKCkgPyB0aGlzLm9mZnNldCA6IC10aGlzLm9mZnNldClcbiAgICBpZiAodGhpcy5yZXBlYXRlZCkge1xuICAgICAgZnJvbVBvaW50ID0gZnJvbVBvaW50LnRyYW5zbGF0ZSh0cmFuc2xhdGlvbi5uZWdhdGUoKSlcbiAgICB9XG5cbiAgICBpZiAodGhpcy5pc0JhY2t3YXJkcygpKSB7XG4gICAgICBpZiAodGhpcy5nZXRDb25maWcoXCJmaW5kQWNyb3NzTGluZXNcIikpIHNjYW5SYW5nZS5zdGFydCA9IFBvaW50LlpFUk9cblxuICAgICAgdGhpcy5lZGl0b3IuYmFja3dhcmRzU2NhbkluQnVmZmVyUmFuZ2UocmVnZXgsIHNjYW5SYW5nZSwgKHtyYW5nZSwgc3RvcH0pID0+IHtcbiAgICAgICAgaWYgKHJhbmdlLnN0YXJ0LmlzTGVzc1RoYW4oZnJvbVBvaW50KSkge1xuICAgICAgICAgIHBvaW50cy5wdXNoKHJhbmdlLnN0YXJ0KVxuICAgICAgICAgIGlmIChwb2ludHMubGVuZ3RoID4gaW5kZXhXYW50QWNjZXNzKSB7XG4gICAgICAgICAgICBzdG9wKClcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICh0aGlzLmdldENvbmZpZyhcImZpbmRBY3Jvc3NMaW5lc1wiKSkgc2NhblJhbmdlLmVuZCA9IHRoaXMuZWRpdG9yLmdldEVvZkJ1ZmZlclBvc2l0aW9uKClcbiAgICAgIHRoaXMuZWRpdG9yLnNjYW5JbkJ1ZmZlclJhbmdlKHJlZ2V4LCBzY2FuUmFuZ2UsICh7cmFuZ2UsIHN0b3B9KSA9PiB7XG4gICAgICAgIGlmIChyYW5nZS5zdGFydC5pc0dyZWF0ZXJUaGFuKGZyb21Qb2ludCkpIHtcbiAgICAgICAgICBwb2ludHMucHVzaChyYW5nZS5zdGFydClcbiAgICAgICAgICBpZiAocG9pbnRzLmxlbmd0aCA+IGluZGV4V2FudEFjY2Vzcykge1xuICAgICAgICAgICAgc3RvcCgpXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH1cblxuICAgIGNvbnN0IHBvaW50ID0gcG9pbnRzW2luZGV4V2FudEFjY2Vzc11cbiAgICBpZiAocG9pbnQpIHJldHVybiBwb2ludC50cmFuc2xhdGUodHJhbnNsYXRpb24pXG4gIH1cblxuICAvLyBGSVhNRTogYmFkIG5hbWluZywgdGhpcyBmdW5jdGlvbiBtdXN0IHJldHVybiBpbmRleFxuICBoaWdobGlnaHRUZXh0SW5DdXJzb3JSb3dzKHRleHQsIGRlY29yYXRpb25UeXBlLCBiYWNrd2FyZHMsIGluZGV4ID0gdGhpcy5nZXRDb3VudCgtMSksIGFkanVzdEluZGV4ID0gZmFsc2UpIHtcbiAgICBpZiAoIXRoaXMuZ2V0Q29uZmlnKFwiaGlnaGxpZ2h0RmluZENoYXJcIikpIHJldHVyblxuXG4gICAgcmV0dXJuIHRoaXMudmltU3RhdGUuaGlnaGxpZ2h0RmluZC5oaWdobGlnaHRDdXJzb3JSb3dzKFxuICAgICAgdGhpcy5nZXRSZWdleCh0ZXh0KSxcbiAgICAgIGRlY29yYXRpb25UeXBlLFxuICAgICAgYmFja3dhcmRzLFxuICAgICAgdGhpcy5vZmZzZXQsXG4gICAgICBpbmRleCxcbiAgICAgIGFkanVzdEluZGV4XG4gICAgKVxuICB9XG5cbiAgbW92ZUN1cnNvcihjdXJzb3IpIHtcbiAgICBjb25zdCBwb2ludCA9IHRoaXMuZ2V0UG9pbnQoY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKCkpXG4gICAgaWYgKHBvaW50KSBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24ocG9pbnQpXG4gICAgZWxzZSB0aGlzLnJlc3RvcmVFZGl0b3JTdGF0ZSgpXG5cbiAgICBpZiAoIXRoaXMucmVwZWF0ZWQpIHRoaXMuZ2xvYmFsU3RhdGUuc2V0KFwiY3VycmVudEZpbmRcIiwgdGhpcylcbiAgfVxuXG4gIGdldFJlZ2V4KHRlcm0pIHtcbiAgICBjb25zdCBtb2RpZmllcnMgPSB0aGlzLmlzQ2FzZVNlbnNpdGl2ZSh0ZXJtKSA/IFwiZ1wiIDogXCJnaVwiXG4gICAgcmV0dXJuIG5ldyBSZWdFeHAoXy5lc2NhcGVSZWdFeHAodGVybSksIG1vZGlmaWVycylcbiAgfVxufVxuRmluZC5yZWdpc3RlcigpXG5cbi8vIGtleW1hcDogRlxuY2xhc3MgRmluZEJhY2t3YXJkcyBleHRlbmRzIEZpbmQge1xuICBpbmNsdXNpdmUgPSBmYWxzZVxuICBiYWNrd2FyZHMgPSB0cnVlXG59XG5GaW5kQmFja3dhcmRzLnJlZ2lzdGVyKClcblxuLy8ga2V5bWFwOiB0XG5jbGFzcyBUaWxsIGV4dGVuZHMgRmluZCB7XG4gIG9mZnNldCA9IDFcbiAgZ2V0UG9pbnQoLi4uYXJncykge1xuICAgIGNvbnN0IHBvaW50ID0gc3VwZXIuZ2V0UG9pbnQoLi4uYXJncylcbiAgICB0aGlzLm1vdmVTdWNjZWVkZWQgPSBwb2ludCAhPSBudWxsXG4gICAgcmV0dXJuIHBvaW50XG4gIH1cbn1cblRpbGwucmVnaXN0ZXIoKVxuXG4vLyBrZXltYXA6IFRcbmNsYXNzIFRpbGxCYWNrd2FyZHMgZXh0ZW5kcyBUaWxsIHtcbiAgaW5jbHVzaXZlID0gZmFsc2VcbiAgYmFja3dhcmRzID0gdHJ1ZVxufVxuVGlsbEJhY2t3YXJkcy5yZWdpc3RlcigpXG5cbi8vIE1hcmtcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIGtleW1hcDogYFxuY2xhc3MgTW92ZVRvTWFyayBleHRlbmRzIE1vdGlvbiB7XG4gIGp1bXAgPSB0cnVlXG4gIHJlcXVpcmVJbnB1dCA9IHRydWVcbiAgaW5wdXQgPSBudWxsXG4gIG1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lID0gZmFsc2VcblxuICBpbml0aWFsaXplKCkge1xuICAgIGlmICghdGhpcy5pc0NvbXBsZXRlKCkpIHRoaXMucmVhZENoYXIoKVxuICAgIHN1cGVyLmluaXRpYWxpemUoKVxuICB9XG5cbiAgZ2V0UG9pbnQoKSB7XG4gICAgY29uc3QgcG9pbnQgPSB0aGlzLnZpbVN0YXRlLm1hcmsuZ2V0KHRoaXMuaW5wdXQpXG4gICAgaWYgKHBvaW50KSB7XG4gICAgICByZXR1cm4gdGhpcy5tb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZSA/IHRoaXMuZ2V0Rmlyc3RDaGFyYWN0ZXJQb3NpdGlvbkZvckJ1ZmZlclJvdyhwb2ludC5yb3cpIDogcG9pbnRcbiAgICB9XG4gIH1cblxuICBtb3ZlQ3Vyc29yKGN1cnNvcikge1xuICAgIGNvbnN0IHBvaW50ID0gdGhpcy5nZXRQb2ludCgpXG4gICAgaWYgKHBvaW50KSB7XG4gICAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24ocG9pbnQpXG4gICAgICBjdXJzb3IuYXV0b3Njcm9sbCh7Y2VudGVyOiB0cnVlfSlcbiAgICB9XG4gIH1cbn1cbk1vdmVUb01hcmsucmVnaXN0ZXIoKVxuXG4vLyBrZXltYXA6ICdcbmNsYXNzIE1vdmVUb01hcmtMaW5lIGV4dGVuZHMgTW92ZVRvTWFyayB7XG4gIHdpc2UgPSBcImxpbmV3aXNlXCJcbiAgbW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmUgPSB0cnVlXG59XG5Nb3ZlVG9NYXJrTGluZS5yZWdpc3RlcigpXG5cbi8vIEZvbGRcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIE1vdmVUb1ByZXZpb3VzRm9sZFN0YXJ0IGV4dGVuZHMgTW90aW9uIHtcbiAgd2lzZSA9IFwiY2hhcmFjdGVyd2lzZVwiXG4gIHdoaWNoID0gXCJzdGFydFwiXG4gIGRpcmVjdGlvbiA9IFwicHJldmlvdXNcIlxuXG4gIGV4ZWN1dGUoKSB7XG4gICAgdGhpcy5yb3dzID0gdGhpcy5nZXRGb2xkUm93cyh0aGlzLndoaWNoKVxuICAgIGlmICh0aGlzLmRpcmVjdGlvbiA9PT0gXCJwcmV2aW91c1wiKSB0aGlzLnJvd3MucmV2ZXJzZSgpXG4gICAgc3VwZXIuZXhlY3V0ZSgpXG4gIH1cblxuICBnZXRGb2xkUm93cyh3aGljaCkge1xuICAgIGNvbnN0IHRvUm93ID0gKFtzdGFydFJvdywgZW5kUm93XSkgPT4gKHdoaWNoID09PSBcInN0YXJ0XCIgPyBzdGFydFJvdyA6IGVuZFJvdylcbiAgICBjb25zdCByb3dzID0gdGhpcy51dGlscy5nZXRDb2RlRm9sZFJvd1Jhbmdlcyh0aGlzLmVkaXRvcikubWFwKHRvUm93KVxuICAgIHJldHVybiBfLnNvcnRCeShfLnVuaXEocm93cyksIHJvdyA9PiByb3cpXG4gIH1cblxuICBnZXRTY2FuUm93cyhjdXJzb3IpIHtcbiAgICBjb25zdCBjdXJzb3JSb3cgPSBjdXJzb3IuZ2V0QnVmZmVyUm93KClcbiAgICBjb25zdCBpc1ZhbGQgPSB0aGlzLmRpcmVjdGlvbiA9PT0gXCJwcmV2aW91c1wiID8gcm93ID0+IHJvdyA8IGN1cnNvclJvdyA6IHJvdyA9PiByb3cgPiBjdXJzb3JSb3dcbiAgICByZXR1cm4gdGhpcy5yb3dzLmZpbHRlcihpc1ZhbGQpXG4gIH1cblxuICBkZXRlY3RSb3coY3Vyc29yKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0U2NhblJvd3MoY3Vyc29yKVswXVxuICB9XG5cbiAgbW92ZUN1cnNvcihjdXJzb3IpIHtcbiAgICB0aGlzLm1vdmVDdXJzb3JDb3VudFRpbWVzKGN1cnNvciwgKCkgPT4ge1xuICAgICAgY29uc3Qgcm93ID0gdGhpcy5kZXRlY3RSb3coY3Vyc29yKVxuICAgICAgaWYgKHJvdyAhPSBudWxsKSB0aGlzLnV0aWxzLm1vdmVDdXJzb3JUb0ZpcnN0Q2hhcmFjdGVyQXRSb3coY3Vyc29yLCByb3cpXG4gICAgfSlcbiAgfVxufVxuTW92ZVRvUHJldmlvdXNGb2xkU3RhcnQucmVnaXN0ZXIoKVxuXG5jbGFzcyBNb3ZlVG9OZXh0Rm9sZFN0YXJ0IGV4dGVuZHMgTW92ZVRvUHJldmlvdXNGb2xkU3RhcnQge1xuICBkaXJlY3Rpb24gPSBcIm5leHRcIlxufVxuTW92ZVRvTmV4dEZvbGRTdGFydC5yZWdpc3RlcigpXG5cbmNsYXNzIE1vdmVUb1ByZXZpb3VzRm9sZFN0YXJ0V2l0aFNhbWVJbmRlbnQgZXh0ZW5kcyBNb3ZlVG9QcmV2aW91c0ZvbGRTdGFydCB7XG4gIGRldGVjdFJvdyhjdXJzb3IpIHtcbiAgICBjb25zdCBiYXNlSW5kZW50TGV2ZWwgPSB0aGlzLmVkaXRvci5pbmRlbnRhdGlvbkZvckJ1ZmZlclJvdyhjdXJzb3IuZ2V0QnVmZmVyUm93KCkpXG4gICAgcmV0dXJuIHRoaXMuZ2V0U2NhblJvd3MoY3Vyc29yKS5maW5kKHJvdyA9PiB0aGlzLmVkaXRvci5pbmRlbnRhdGlvbkZvckJ1ZmZlclJvdyhyb3cpID09PSBiYXNlSW5kZW50TGV2ZWwpXG4gIH1cbn1cbk1vdmVUb1ByZXZpb3VzRm9sZFN0YXJ0V2l0aFNhbWVJbmRlbnQucmVnaXN0ZXIoKVxuXG5jbGFzcyBNb3ZlVG9OZXh0Rm9sZFN0YXJ0V2l0aFNhbWVJbmRlbnQgZXh0ZW5kcyBNb3ZlVG9QcmV2aW91c0ZvbGRTdGFydFdpdGhTYW1lSW5kZW50IHtcbiAgZGlyZWN0aW9uID0gXCJuZXh0XCJcbn1cbk1vdmVUb05leHRGb2xkU3RhcnRXaXRoU2FtZUluZGVudC5yZWdpc3RlcigpXG5cbmNsYXNzIE1vdmVUb1ByZXZpb3VzRm9sZEVuZCBleHRlbmRzIE1vdmVUb1ByZXZpb3VzRm9sZFN0YXJ0IHtcbiAgd2hpY2ggPSBcImVuZFwiXG59XG5Nb3ZlVG9QcmV2aW91c0ZvbGRFbmQucmVnaXN0ZXIoKVxuXG5jbGFzcyBNb3ZlVG9OZXh0Rm9sZEVuZCBleHRlbmRzIE1vdmVUb1ByZXZpb3VzRm9sZEVuZCB7XG4gIGRpcmVjdGlvbiA9IFwibmV4dFwiXG59XG5Nb3ZlVG9OZXh0Rm9sZEVuZC5yZWdpc3RlcigpXG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIE1vdmVUb1ByZXZpb3VzRnVuY3Rpb24gZXh0ZW5kcyBNb3ZlVG9QcmV2aW91c0ZvbGRTdGFydCB7XG4gIGRpcmVjdGlvbiA9IFwicHJldmlvdXNcIlxuICBkZXRlY3RSb3coY3Vyc29yKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0U2NhblJvd3MoY3Vyc29yKS5maW5kKHJvdyA9PiB0aGlzLnV0aWxzLmlzSW5jbHVkZUZ1bmN0aW9uU2NvcGVGb3JSb3codGhpcy5lZGl0b3IsIHJvdykpXG4gIH1cbn1cbk1vdmVUb1ByZXZpb3VzRnVuY3Rpb24ucmVnaXN0ZXIoKVxuXG5jbGFzcyBNb3ZlVG9OZXh0RnVuY3Rpb24gZXh0ZW5kcyBNb3ZlVG9QcmV2aW91c0Z1bmN0aW9uIHtcbiAgZGlyZWN0aW9uID0gXCJuZXh0XCJcbn1cbk1vdmVUb05leHRGdW5jdGlvbi5yZWdpc3RlcigpXG5cbi8vIFNjb3BlIGJhc2VkXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBNb3ZlVG9Qb3NpdGlvbkJ5U2NvcGUgZXh0ZW5kcyBNb3Rpb24ge1xuICBkaXJlY3Rpb24gPSBcImJhY2t3YXJkXCJcbiAgc2NvcGUgPSBcIi5cIlxuXG4gIGdldFBvaW50KGZyb21Qb2ludCkge1xuICAgIHJldHVybiB0aGlzLnV0aWxzLmRldGVjdFNjb3BlU3RhcnRQb3NpdGlvbkZvclNjb3BlKHRoaXMuZWRpdG9yLCBmcm9tUG9pbnQsIHRoaXMuZGlyZWN0aW9uLCB0aGlzLnNjb3BlKVxuICB9XG5cbiAgbW92ZUN1cnNvcihjdXJzb3IpIHtcbiAgICB0aGlzLm1vdmVDdXJzb3JDb3VudFRpbWVzKGN1cnNvciwgKCkgPT4ge1xuICAgICAgdGhpcy5zZXRCdWZmZXJQb3NpdGlvblNhZmVseShjdXJzb3IsIHRoaXMuZ2V0UG9pbnQoY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKCkpKVxuICAgIH0pXG4gIH1cbn1cbk1vdmVUb1Bvc2l0aW9uQnlTY29wZS5yZWdpc3RlcihmYWxzZSlcblxuY2xhc3MgTW92ZVRvUHJldmlvdXNTdHJpbmcgZXh0ZW5kcyBNb3ZlVG9Qb3NpdGlvbkJ5U2NvcGUge1xuICBkaXJlY3Rpb24gPSBcImJhY2t3YXJkXCJcbiAgc2NvcGUgPSBcInN0cmluZy5iZWdpblwiXG59XG5Nb3ZlVG9QcmV2aW91c1N0cmluZy5yZWdpc3RlcigpXG5cbmNsYXNzIE1vdmVUb05leHRTdHJpbmcgZXh0ZW5kcyBNb3ZlVG9QcmV2aW91c1N0cmluZyB7XG4gIGRpcmVjdGlvbiA9IFwiZm9yd2FyZFwiXG59XG5Nb3ZlVG9OZXh0U3RyaW5nLnJlZ2lzdGVyKClcblxuY2xhc3MgTW92ZVRvUHJldmlvdXNOdW1iZXIgZXh0ZW5kcyBNb3ZlVG9Qb3NpdGlvbkJ5U2NvcGUge1xuICBkaXJlY3Rpb24gPSBcImJhY2t3YXJkXCJcbiAgc2NvcGUgPSBcImNvbnN0YW50Lm51bWVyaWNcIlxufVxuTW92ZVRvUHJldmlvdXNOdW1iZXIucmVnaXN0ZXIoKVxuXG5jbGFzcyBNb3ZlVG9OZXh0TnVtYmVyIGV4dGVuZHMgTW92ZVRvUHJldmlvdXNOdW1iZXIge1xuICBkaXJlY3Rpb24gPSBcImZvcndhcmRcIlxufVxuTW92ZVRvTmV4dE51bWJlci5yZWdpc3RlcigpXG5cbmNsYXNzIE1vdmVUb05leHRPY2N1cnJlbmNlIGV4dGVuZHMgTW90aW9uIHtcbiAgLy8gRW5zdXJlIHRoaXMgY29tbWFuZCBpcyBhdmFpbGFibGUgd2hlbiBvbmx5IGhhcy1vY2N1cnJlbmNlXG4gIHN0YXRpYyBjb21tYW5kU2NvcGUgPSBcImF0b20tdGV4dC1lZGl0b3IudmltLW1vZGUtcGx1cy5oYXMtb2NjdXJyZW5jZVwiXG4gIGp1bXAgPSB0cnVlXG4gIGRpcmVjdGlvbiA9IFwibmV4dFwiXG5cbiAgZXhlY3V0ZSgpIHtcbiAgICB0aGlzLnJhbmdlcyA9IHRoaXMudXRpbHMuc29ydFJhbmdlcyh0aGlzLm9jY3VycmVuY2VNYW5hZ2VyLmdldE1hcmtlcnMoKS5tYXAobWFya2VyID0+IG1hcmtlci5nZXRCdWZmZXJSYW5nZSgpKSlcbiAgICBzdXBlci5leGVjdXRlKClcbiAgfVxuXG4gIG1vdmVDdXJzb3IoY3Vyc29yKSB7XG4gICAgY29uc3QgcmFuZ2UgPSB0aGlzLnJhbmdlc1t0aGlzLnV0aWxzLmdldEluZGV4KHRoaXMuZ2V0SW5kZXgoY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKCkpLCB0aGlzLnJhbmdlcyldXG4gICAgY29uc3QgcG9pbnQgPSByYW5nZS5zdGFydFxuICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihwb2ludCwge2F1dG9zY3JvbGw6IGZhbHNlfSlcblxuICAgIGlmIChjdXJzb3IuaXNMYXN0Q3Vyc29yKCkpIHtcbiAgICAgIHRoaXMuZWRpdG9yLnVuZm9sZEJ1ZmZlclJvdyhwb2ludC5yb3cpXG4gICAgICB0aGlzLnV0aWxzLnNtYXJ0U2Nyb2xsVG9CdWZmZXJQb3NpdGlvbih0aGlzLmVkaXRvciwgcG9pbnQpXG4gICAgfVxuXG4gICAgaWYgKHRoaXMuZ2V0Q29uZmlnKFwiZmxhc2hPbk1vdmVUb09jY3VycmVuY2VcIikpIHtcbiAgICAgIHRoaXMudmltU3RhdGUuZmxhc2gocmFuZ2UsIHt0eXBlOiBcInNlYXJjaFwifSlcbiAgICB9XG4gIH1cblxuICBnZXRJbmRleChmcm9tUG9pbnQpIHtcbiAgICBjb25zdCBpbmRleCA9IHRoaXMucmFuZ2VzLmZpbmRJbmRleChyYW5nZSA9PiByYW5nZS5zdGFydC5pc0dyZWF0ZXJUaGFuKGZyb21Qb2ludCkpXG4gICAgcmV0dXJuIChpbmRleCA+PSAwID8gaW5kZXggOiAwKSArIHRoaXMuZ2V0Q291bnQoLTEpXG4gIH1cbn1cbk1vdmVUb05leHRPY2N1cnJlbmNlLnJlZ2lzdGVyKClcblxuY2xhc3MgTW92ZVRvUHJldmlvdXNPY2N1cnJlbmNlIGV4dGVuZHMgTW92ZVRvTmV4dE9jY3VycmVuY2Uge1xuICBkaXJlY3Rpb24gPSBcInByZXZpb3VzXCJcblxuICBnZXRJbmRleChmcm9tUG9pbnQpIHtcbiAgICBjb25zdCByYW5nZXMgPSB0aGlzLnJhbmdlcy5zbGljZSgpLnJldmVyc2UoKVxuICAgIGNvbnN0IHJhbmdlID0gcmFuZ2VzLmZpbmQocmFuZ2UgPT4gcmFuZ2UuZW5kLmlzTGVzc1RoYW4oZnJvbVBvaW50KSlcbiAgICBjb25zdCBpbmRleCA9IHJhbmdlID8gdGhpcy5yYW5nZXMuaW5kZXhPZihyYW5nZSkgOiB0aGlzLnJhbmdlcy5sZW5ndGggLSAxXG4gICAgcmV0dXJuIGluZGV4IC0gdGhpcy5nZXRDb3VudCgtMSlcbiAgfVxufVxuTW92ZVRvUHJldmlvdXNPY2N1cnJlbmNlLnJlZ2lzdGVyKClcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8ga2V5bWFwOiAlXG5jbGFzcyBNb3ZlVG9QYWlyIGV4dGVuZHMgTW90aW9uIHtcbiAgaW5jbHVzaXZlID0gdHJ1ZVxuICBqdW1wID0gdHJ1ZVxuICBtZW1iZXIgPSBbXCJQYXJlbnRoZXNpc1wiLCBcIkN1cmx5QnJhY2tldFwiLCBcIlNxdWFyZUJyYWNrZXRcIl1cblxuICBtb3ZlQ3Vyc29yKGN1cnNvcikge1xuICAgIHRoaXMuc2V0QnVmZmVyUG9zaXRpb25TYWZlbHkoY3Vyc29yLCB0aGlzLmdldFBvaW50KGN1cnNvcikpXG4gIH1cblxuICBnZXRQb2ludEZvclRhZyhwb2ludCkge1xuICAgIGNvbnN0IHBhaXJJbmZvID0gdGhpcy5nZXRJbnN0YW5jZShcIkFUYWdcIikuZ2V0UGFpckluZm8ocG9pbnQpXG4gICAgaWYgKCFwYWlySW5mbykgcmV0dXJuXG5cbiAgICBsZXQge29wZW5SYW5nZSwgY2xvc2VSYW5nZX0gPSBwYWlySW5mb1xuICAgIG9wZW5SYW5nZSA9IG9wZW5SYW5nZS50cmFuc2xhdGUoWzAsICsxXSwgWzAsIC0xXSlcbiAgICBjbG9zZVJhbmdlID0gY2xvc2VSYW5nZS50cmFuc2xhdGUoWzAsICsxXSwgWzAsIC0xXSlcbiAgICBpZiAob3BlblJhbmdlLmNvbnRhaW5zUG9pbnQocG9pbnQpICYmICFwb2ludC5pc0VxdWFsKG9wZW5SYW5nZS5lbmQpKSB7XG4gICAgICByZXR1cm4gY2xvc2VSYW5nZS5zdGFydFxuICAgIH1cbiAgICBpZiAoY2xvc2VSYW5nZS5jb250YWluc1BvaW50KHBvaW50KSAmJiAhcG9pbnQuaXNFcXVhbChjbG9zZVJhbmdlLmVuZCkpIHtcbiAgICAgIHJldHVybiBvcGVuUmFuZ2Uuc3RhcnRcbiAgICB9XG4gIH1cblxuICBnZXRQb2ludChjdXJzb3IpIHtcbiAgICBjb25zdCBjdXJzb3JQb3NpdGlvbiA9IGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXG4gICAgY29uc3QgY3Vyc29yUm93ID0gY3Vyc29yUG9zaXRpb24ucm93XG4gICAgY29uc3QgcG9pbnQgPSB0aGlzLmdldFBvaW50Rm9yVGFnKGN1cnNvclBvc2l0aW9uKVxuICAgIGlmIChwb2ludCkgcmV0dXJuIHBvaW50XG5cbiAgICAvLyBBQW55UGFpckFsbG93Rm9yd2FyZGluZyByZXR1cm4gZm9yd2FyZGluZyByYW5nZSBvciBlbmNsb3NpbmcgcmFuZ2UuXG4gICAgY29uc3QgcmFuZ2UgPSB0aGlzLmdldEluc3RhbmNlKFwiQUFueVBhaXJBbGxvd0ZvcndhcmRpbmdcIiwge21lbWJlcjogdGhpcy5tZW1iZXJ9KS5nZXRSYW5nZShjdXJzb3Iuc2VsZWN0aW9uKVxuICAgIGlmICghcmFuZ2UpIHJldHVyblxuXG4gICAgY29uc3Qge3N0YXJ0LCBlbmR9ID0gcmFuZ2VcbiAgICBpZiAoc3RhcnQucm93ID09PSBjdXJzb3JSb3cgJiYgc3RhcnQuaXNHcmVhdGVyVGhhbk9yRXF1YWwoY3Vyc29yUG9zaXRpb24pKSB7XG4gICAgICAvLyBGb3J3YXJkaW5nIHJhbmdlIGZvdW5kXG4gICAgICByZXR1cm4gZW5kLnRyYW5zbGF0ZShbMCwgLTFdKVxuICAgIH0gZWxzZSBpZiAoZW5kLnJvdyA9PT0gY3Vyc29yUG9zaXRpb24ucm93KSB7XG4gICAgICAvLyBFbmNsb3NpbmcgcmFuZ2Ugd2FzIHJldHVybmVkXG4gICAgICAvLyBXZSBtb3ZlIHRvIHN0YXJ0KCBvcGVuLXBhaXIgKSBvbmx5IHdoZW4gY2xvc2UtcGFpciB3YXMgYXQgc2FtZSByb3cgYXMgY3Vyc29yLXJvdy5cbiAgICAgIHJldHVybiBzdGFydFxuICAgIH1cbiAgfVxufVxuTW92ZVRvUGFpci5yZWdpc3RlcigpXG4iXX0=