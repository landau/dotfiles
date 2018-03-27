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

    this.operator = null;
    this.inclusive = false;
    this.wise = "characterwise";
    this.jump = false;
    this.verticalMotion = false;
    this.moveSucceeded = null;
    this.moveSuccessOnLinewise = false;
    this.selectSucceeded = false;
    this.requireInput = false;
    this.caseSensitivityKind = null;
  }

  _createClass(Motion, [{
    key: "isReady",
    value: function isReady() {
      return !this.requireInput || this.input != null;
    }
  }, {
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
        var point = _this8.getPoint(cursor.getScreenPosition());
        if (point) cursor.setScreenPosition(point);
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
      var isTargetOfNormalOperator = this.isTargetOfNormalOperator();

      this.moveCursorCountTimes(cursor, function (_ref2) {
        var isFinal = _ref2.isFinal;

        var cursorPosition = cursor.getBufferPosition();
        if (_this9.utils.isEmptyRow(_this9.editor, cursorPosition.row) && isTargetOfNormalOperator) {
          cursor.setBufferPosition(cursorPosition.traverse([1, 0]));
        } else {
          var regex = _this9.wordRegex || cursor.wordRegExp();
          var point = _this9.getPoint(regex, cursorPosition);
          if (isFinal && isTargetOfNormalOperator) {
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
        cursor.setBufferPosition(_this12.getPoint(cursor.getBufferPosition()));
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
        cursor.setBufferPosition(_this15.getPoint(cursor.getBufferPosition()));
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
      cursor.setBufferPosition(point);
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
      if (point) cursor.setScreenPosition(point);
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
    this.defaultCount = 0;
    this.verticalMotion = true;
    this.where = "top";
  }

  _createClass(MoveToTopOfScreen, [{
    key: "moveCursor",
    value: function moveCursor(cursor) {
      var bufferRow = this.editor.bufferRowForScreenRow(this.getScreenRow());
      this.setCursorBufferRow(cursor, bufferRow);
    }
  }, {
    key: "getScreenRow",
    value: function getScreenRow() {
      var limitNumber = this.utils.limitNumber;

      var firstVisibleRow = this.editor.getFirstVisibleScreenRow();
      var lastVisibleRow = limitNumber(this.editor.getLastVisibleScreenRow(), { max: this.getVimLastScreenRow() });

      var baseOffset = 2;
      if (this.where === "top") {
        var offset = firstVisibleRow === 0 ? 0 : baseOffset;
        return limitNumber(firstVisibleRow + this.getCount(-1), { min: firstVisibleRow + offset, max: lastVisibleRow });
      } else if (this.where === "middle") {
        return firstVisibleRow + Math.floor((lastVisibleRow - firstVisibleRow) / 2);
      } else if (this.where === "bottom") {
        var offset = lastVisibleRow === this.getVimLastScreenRow() ? 0 : baseOffset + 1;
        return limitNumber(lastVisibleRow - this.getCount(-1), { min: firstVisibleRow, max: lastVisibleRow - offset });
      }
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

    this.where = "middle";
  }

  return MoveToMiddleOfScreen;
})(MoveToTopOfScreen);

MoveToMiddleOfScreen.register();

// keymap: L

var MoveToBottomOfScreen = (function (_MoveToTopOfScreen2) {
  _inherits(MoveToBottomOfScreen, _MoveToTopOfScreen2);

  function MoveToBottomOfScreen() {
    _classCallCheck(this, MoveToBottomOfScreen);

    _get(Object.getPrototypeOf(MoveToBottomOfScreen.prototype), "constructor", this).apply(this, arguments);

    this.where = "bottom";
  }

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
    key: "moveCursor",
    value: function moveCursor(cursor) {
      var screenRow = this.utils.getValidVimScreenRow(this.editor, cursor.getScreenRow() + this.amountOfRowsToScroll);
      this.setCursorBufferRow(cursor, this.editor.bufferRowForScreenRow(screenRow), { autoscroll: false });
    }
  }, {
    key: "execute",
    value: function execute() {
      this.amountOfRowsToScroll = Math.ceil(this.amountOfPage * this.editor.getRowsPerPage() * this.getCount());
      _get(Object.getPrototypeOf(Scroll.prototype), "execute", this).call(this);
      var duration = this.isSmoothScrollEnabled() ? this.getSmoothScrollDuation() : 0;
      this.vimState.requestScroll({ amountOfScreenRows: this.amountOfRowsToScroll, duration: duration });
    }
  }], [{
    key: "scrollTask",
    value: null,
    enumerable: true
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

// keymap: g ctrl-d

var ScrollQuarterScreenDown = (function (_Scroll5) {
  _inherits(ScrollQuarterScreenDown, _Scroll5);

  function ScrollQuarterScreenDown() {
    _classCallCheck(this, ScrollQuarterScreenDown);

    _get(Object.getPrototypeOf(ScrollQuarterScreenDown.prototype), "constructor", this).apply(this, arguments);

    this.amountOfPage = +1 / 4;
  }

  return ScrollQuarterScreenDown;
})(Scroll);

ScrollQuarterScreenDown.register();

// keymap: g ctrl-u

var ScrollQuarterScreenUp = (function (_Scroll6) {
  _inherits(ScrollQuarterScreenUp, _Scroll6);

  function ScrollQuarterScreenUp() {
    _classCallCheck(this, ScrollQuarterScreenUp);

    _get(Object.getPrototypeOf(ScrollQuarterScreenUp.prototype), "constructor", this).apply(this, arguments);

    this.amountOfPage = -1 / 4;
  }

  return ScrollQuarterScreenUp;
})(Scroll);

ScrollQuarterScreenUp.register();

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
      var _this18 = this;

      if (this.getConfig("reuseFindForRepeatFind")) this.repeatIfNecessary();

      if (!this.repeated) {
        var charsMax = this.getConfig("findCharsMax");
        var optionsBase = { purpose: "find", charsMax: charsMax };

        if (charsMax === 1) {
          this.focusInput(optionsBase);
        } else {
          this._restoreEditorState = this.utils.saveEditorState(this.editor);
          var options = {
            autoConfirmTimeout: this.getConfig("findConfirmByTimeout"),
            onConfirm: function onConfirm(input) {
              _this18.input = input;
              if (input) _this18.processOperation();else _this18.cancelOperation();
            },
            onChange: function onChange(preConfirmedChars) {
              _this18.preConfirmedChars = preConfirmedChars;
              _this18.highlightTextInCursorRows(_this18.preConfirmedChars, "pre-confirm", _this18.isBackwards());
            },
            onCancel: function onCancel() {
              _this18.vimState.highlightFind.clearMarkers();
              _this18.cancelOperation();
            },
            commands: {
              "vim-mode-plus:find-next-pre-confirmed": function vimModePlusFindNextPreConfirmed() {
                return _this18.findPreConfirmed(+1);
              },
              "vim-mode-plus:find-previous-pre-confirmed": function vimModePlusFindPreviousPreConfirmed() {
                return _this18.findPreConfirmed(-1);
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
      var _this19 = this;

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
        _this19.highlightTextInCursorRows(_this19.input, decorationType, backwards);
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
      this.readChar();
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
      var _this20 = this;

      this.moveCursorCountTimes(cursor, function () {
        var row = _this20.detectRow(cursor);
        if (row != null) _this20.utils.moveCursorToFirstCharacterAtRow(cursor, row);
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
      var _this21 = this;

      var baseIndentLevel = this.editor.indentationForBufferRow(cursor.getBufferRow());
      return this.getScanRows(cursor).find(function (row) {
        return _this21.editor.indentationForBufferRow(row) === baseIndentLevel;
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
      var _this22 = this;

      return this.getScanRows(cursor).find(function (row) {
        return _this22.utils.isIncludeFunctionScopeForRow(_this22.editor, row);
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
      var _this23 = this;

      this.moveCursorCountTimes(cursor, function () {
        var point = _this23.getPoint(cursor.getBufferPosition());
        if (point) cursor.setBufferPosition(point);
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

      this.editor.unfoldBufferRow(point.row);
      if (cursor.isLastCursor()) {
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
      var point = this.getPoint(cursor);
      if (point) cursor.setBufferPosition(point);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL21vdGlvbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxXQUFXLENBQUE7Ozs7Ozs7Ozs7OztBQUVYLElBQU0sQ0FBQyxHQUFHLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFBOztlQUNiLE9BQU8sQ0FBQyxNQUFNLENBQUM7O0lBQS9CLEtBQUssWUFBTCxLQUFLO0lBQUUsS0FBSyxZQUFMLEtBQUs7O0FBRW5CLElBQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQTs7SUFFeEIsTUFBTTtZQUFOLE1BQU07O1dBQU4sTUFBTTswQkFBTixNQUFNOzsrQkFBTixNQUFNOztTQUVWLFFBQVEsR0FBRyxJQUFJO1NBQ2YsU0FBUyxHQUFHLEtBQUs7U0FDakIsSUFBSSxHQUFHLGVBQWU7U0FDdEIsSUFBSSxHQUFHLEtBQUs7U0FDWixjQUFjLEdBQUcsS0FBSztTQUN0QixhQUFhLEdBQUcsSUFBSTtTQUNwQixxQkFBcUIsR0FBRyxLQUFLO1NBQzdCLGVBQWUsR0FBRyxLQUFLO1NBQ3ZCLFlBQVksR0FBRyxLQUFLO1NBQ3BCLG1CQUFtQixHQUFHLElBQUk7OztlQVh0QixNQUFNOztXQWFILG1CQUFHO0FBQ1IsYUFBTyxDQUFDLElBQUksQ0FBQyxZQUFZLElBQUksSUFBSSxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUE7S0FDaEQ7OztXQUVTLHNCQUFHO0FBQ1gsYUFBTyxJQUFJLENBQUMsSUFBSSxLQUFLLFVBQVUsQ0FBQTtLQUNoQzs7O1dBRVUsdUJBQUc7QUFDWixhQUFPLElBQUksQ0FBQyxJQUFJLEtBQUssV0FBVyxDQUFBO0tBQ2pDOzs7V0FFUSxtQkFBQyxJQUFJLEVBQUU7QUFDZCxVQUFJLElBQUksS0FBSyxlQUFlLEVBQUU7QUFDNUIsWUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsSUFBSSxLQUFLLFVBQVUsR0FBRyxLQUFL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QUFTLEtBQUssQ0FBbkIsS0FBSztVQUFFLEdBQUcsR0FBSSxLQUFLLENBQVosR0FBRzs7QUFDakIsVUFBSSxLQUFLLENBQUMsR0FBRyxLQUFLLFNBQVMsSUFBSSxLQUFLLENBQUMsb0JBQW9CLENBQUMsY0FBYyxDQUFDLEVBQUU7O0FBRXpFLGVBQU8sR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7T0FDOUIsTUFBTSxJQUFJLEdBQUcsQ0FBQyxHQUFHLEtBQUssY0FBYyxDQUFDLEdBQUcsRUFBRTs7O0FBR3pDLGVBQU8sS0FBSyxDQUFBO09BQ2I7S0FDRjs7O1NBNUNHLFVBQVU7R0FBUyxNQUFNOztBQThDL0IsVUFBVSxDQUFDLFFBQVEsRUFBRSxDQUFBIiwiZmlsZSI6Ii9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL21vdGlvbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIlwidXNlIGJhYmVsXCJcblxuY29uc3QgXyA9IHJlcXVpcmUoXCJ1bmRlcnNjb3JlLXBsdXNcIilcbmNvbnN0IHtQb2ludCwgUmFuZ2V9ID0gcmVxdWlyZShcImF0b21cIilcblxuY29uc3QgQmFzZSA9IHJlcXVpcmUoXCIuL2Jhc2VcIilcblxuY2xhc3MgTW90aW9uIGV4dGVuZHMgQmFzZSB7XG4gIHN0YXRpYyBvcGVyYXRpb25LaW5kID0gXCJtb3Rpb25cIlxuICBvcGVyYXRvciA9IG51bGxcbiAgaW5jbHVzaXZlID0gZmFsc2VcbiAgd2lzZSA9IFwiY2hhcmFjdGVyd2lzZVwiXG4gIGp1bXAgPSBmYWxzZVxuICB2ZXJ0aWNhbE1vdGlvbiA9IGZhbHNlXG4gIG1vdmVTdWNjZWVkZWQgPSBudWxsXG4gIG1vdmVTdWNjZXNzT25MaW5ld2lzZSA9IGZhbHNlXG4gIHNlbGVjdFN1Y2NlZWRlZCA9IGZhbHNlXG4gIHJlcXVpcmVJbnB1dCA9IGZhbHNlXG4gIGNhc2VTZW5zaXRpdml0eUtpbmQgPSBudWxsXG5cbiAgaXNSZWFkeSgpIHtcbiAgICByZXR1cm4gIXRoaXMucmVxdWlyZUlucHV0IHx8IHRoaXMuaW5wdXQgIT0gbnVsbFxuICB9XG5cbiAgaXNMaW5ld2lzZSgpIHtcbiAgICByZXR1cm4gdGhpcy53aXNlID09PSBcImxpbmV3aXNlXCJcbiAgfVxuXG4gIGlzQmxvY2t3aXNlKCkge1xuICAgIHJldHVybiB0aGlzLndpc2UgPT09IFwiYmxvY2t3aXNlXCJcbiAgfVxuXG4gIGZvcmNlV2lzZSh3aXNlKSB7XG4gICAgaWYgKHdpc2UgPT09IFwiY2hhcmFjdGVyd2lzZVwiKSB7XG4gICAgICB0aGlzLmluY2x1c2l2ZSA9IHRoaXMud2lzZSA9PT0gXCJsaW5ld2lzZVwiID8gZmFsc2UgOiAhdGhpcy5pbmNsdXNpdmVcbiAgICB9XG4gICAgdGhpcy53aXNlID0gd2lzZVxuICB9XG5cbiAgcmVzZXRTdGF0ZSgpIHtcbiAgICB0aGlzLnNlbGVjdFN1Y2NlZWRlZCA9IGZhbHNlXG4gIH1cblxuICBtb3ZlV2l0aFNhdmVKdW1wKGN1cnNvcikge1xuICAgIGNvbnN0IG9yaWdpbmFsUG9zaXRpb24gPSB0aGlzLmp1bXAgJiYgY3Vyc29yLmlzTGFzdEN1cnNvcigpID8gY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKCkgOiB1bmRlZmluZWRcblxuICAgIHRoaXMubW92ZUN1cnNvcihjdXJzb3IpXG5cbiAgICBpZiAob3JpZ2luYWxQb3NpdGlvbiAmJiAhY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKCkuaXNFcXVhbChvcmlnaW5hbFBvc2l0aW9uKSkge1xuICAgICAgdGhpcy52aW1TdGF0ZS5tYXJrLnNldChcImBcIiwgb3JpZ2luYWxQb3NpdGlvbilcbiAgICAgIHRoaXMudmltU3RhdGUubWFyay5zZXQoXCInXCIsIG9yaWdpbmFsUG9zaXRpb24pXG4gICAgfVxuICB9XG5cbiAgZXhlY3V0ZSgpIHtcbiAgICBpZiAodGhpcy5vcGVyYXRvcikge1xuICAgICAgdGhpcy5zZWxlY3QoKVxuICAgIH0gZWxzZSB7XG4gICAgICBmb3IgKGNvbnN0IGN1cnNvciBvZiB0aGlzLmVkaXRvci5nZXRDdXJzb3JzKCkpIHtcbiAgICAgICAgdGhpcy5tb3ZlV2l0aFNhdmVKdW1wKGN1cnNvcilcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5lZGl0b3IubWVyZ2VDdXJzb3JzKClcbiAgICB0aGlzLmVkaXRvci5tZXJnZUludGVyc2VjdGluZ1NlbGVjdGlvbnMoKVxuICB9XG5cbiAgLy8gTk9URTogc2VsZWN0aW9uIGlzIGFscmVhZHkgXCJub3JtYWxpemVkXCIgYmVmb3JlIHRoaXMgZnVuY3Rpb24gaXMgY2FsbGVkLlxuICBzZWxlY3QoKSB7XG4gICAgLy8gbmVlZCB0byBjYXJlIHdhcyB2aXN1YWwgZm9yIGAuYCByZXBlYXRlZC5cbiAgICBjb25zdCBpc09yV2FzVmlzdWFsID0gdGhpcy5vcGVyYXRvci5pbnN0YW5jZW9mKFwiU2VsZWN0QmFzZVwiKSB8fCB0aGlzLmlzKFwiQ3VycmVudFNlbGVjdGlvblwiKVxuXG4gICAgZm9yIChjb25zdCBzZWxlY3Rpb24gb2YgdGhpcy5lZGl0b3IuZ2V0U2VsZWN0aW9ucygpKSB7XG4gICAgICBzZWxlY3Rpb24ubW9kaWZ5U2VsZWN0aW9uKCgpID0+IHRoaXMubW92ZVdpdGhTYXZlSnVtcChzZWxlY3Rpb24uY3Vyc29yKSlcblxuICAgICAgY29uc3Qgc2VsZWN0U3VjY2VlZGVkID1cbiAgICAgICAgdGhpcy5tb3ZlU3VjY2VlZGVkICE9IG51bGxcbiAgICAgICAgICA/IHRoaXMubW92ZVN1Y2NlZWRlZFxuICAgICAgICAgIDogIXNlbGVjdGlvbi5pc0VtcHR5KCkgfHwgKHRoaXMuaXNMaW5ld2lzZSgpICYmIHRoaXMubW92ZVN1Y2Nlc3NPbkxpbmV3aXNlKVxuICAgICAgaWYgKCF0aGlzLnNlbGVjdFN1Y2NlZWRlZCkgdGhpcy5zZWxlY3RTdWNjZWVkZWQgPSBzZWxlY3RTdWNjZWVkZWRcblxuICAgICAgaWYgKGlzT3JXYXNWaXN1YWwgfHwgKHNlbGVjdFN1Y2NlZWRlZCAmJiAodGhpcy5pbmNsdXNpdmUgfHwgdGhpcy5pc0xpbmV3aXNlKCkpKSkge1xuICAgICAgICBjb25zdCAkc2VsZWN0aW9uID0gdGhpcy5zd3JhcChzZWxlY3Rpb24pXG4gICAgICAgICRzZWxlY3Rpb24uc2F2ZVByb3BlcnRpZXModHJ1ZSkgLy8gc2F2ZSBwcm9wZXJ0eSBvZiBcImFscmVhZHktbm9ybWFsaXplZC1zZWxlY3Rpb25cIlxuICAgICAgICAkc2VsZWN0aW9uLmFwcGx5V2lzZSh0aGlzLndpc2UpXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHRoaXMud2lzZSA9PT0gXCJibG9ja3dpc2VcIikge1xuICAgICAgdGhpcy52aW1TdGF0ZS5nZXRMYXN0QmxvY2t3aXNlU2VsZWN0aW9uKCkuYXV0b3Njcm9sbCgpXG4gICAgfVxuICB9XG5cbiAgc2V0Q3Vyc29yQnVmZmVyUm93KGN1cnNvciwgcm93LCBvcHRpb25zKSB7XG4gICAgaWYgKHRoaXMudmVydGljYWxNb3Rpb24gJiYgIXRoaXMuZ2V0Q29uZmlnKFwic3RheU9uVmVydGljYWxNb3Rpb25cIikpIHtcbiAgICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbih0aGlzLmdldEZpcnN0Q2hhcmFjdGVyUG9zaXRpb25Gb3JCdWZmZXJSb3cocm93KSwgb3B0aW9ucylcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy51dGlscy5zZXRCdWZmZXJSb3coY3Vyc29yLCByb3csIG9wdGlvbnMpXG4gICAgfVxuICB9XG5cbiAgLy8gW05PVEVdXG4gIC8vIFNpbmNlIHRoaXMgZnVuY3Rpb24gY2hlY2tzIGN1cnNvciBwb3NpdGlvbiBjaGFuZ2UsIGEgY3Vyc29yIHBvc2l0aW9uIE1VU1QgYmVcbiAgLy8gdXBkYXRlZCBJTiBjYWxsYmFjayg9Zm4pXG4gIC8vIFVwZGF0aW5nIHBvaW50IG9ubHkgaW4gY2FsbGJhY2sgaXMgd3JvbmctdXNlIG9mIHRoaXMgZnVuY2l0b24sXG4gIC8vIHNpbmNlIGl0IHN0b3BzIGltbWVkaWF0ZWx5IGJlY2F1c2Ugb2Ygbm90IGN1cnNvciBwb3NpdGlvbiBjaGFuZ2UuXG4gIG1vdmVDdXJzb3JDb3VudFRpbWVzKGN1cnNvciwgZm4pIHtcbiAgICBsZXQgb2xkUG9zaXRpb24gPSBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuICAgIHRoaXMuY291bnRUaW1lcyh0aGlzLmdldENvdW50KCksIHN0YXRlID0+IHtcbiAgICAgIGZuKHN0YXRlKVxuICAgICAgY29uc3QgbmV3UG9zaXRpb24gPSBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuICAgICAgaWYgKG5ld1Bvc2l0aW9uLmlzRXF1YWwob2xkUG9zaXRpb24pKSBzdGF0ZS5zdG9wKClcbiAgICAgIG9sZFBvc2l0aW9uID0gbmV3UG9zaXRpb25cbiAgICB9KVxuICB9XG5cbiAgaXNDYXNlU2Vuc2l0aXZlKHRlcm0pIHtcbiAgICByZXR1cm4gdGhpcy5nZXRDb25maWcoYHVzZVNtYXJ0Y2FzZUZvciR7dGhpcy5jYXNlU2Vuc2l0aXZpdHlLaW5kfWApXG4gICAgICA/IHRlcm0uc2VhcmNoKC9bQS1aXS8pICE9PSAtMVxuICAgICAgOiAhdGhpcy5nZXRDb25maWcoYGlnbm9yZUNhc2VGb3Ike3RoaXMuY2FzZVNlbnNpdGl2aXR5S2luZH1gKVxuICB9XG59XG5Nb3Rpb24ucmVnaXN0ZXIoZmFsc2UpXG5cbi8vIFVzZWQgYXMgb3BlcmF0b3IncyB0YXJnZXQgaW4gdmlzdWFsLW1vZGUuXG5jbGFzcyBDdXJyZW50U2VsZWN0aW9uIGV4dGVuZHMgTW90aW9uIHtcbiAgc2VsZWN0aW9uRXh0ZW50ID0gbnVsbFxuICBibG9ja3dpc2VTZWxlY3Rpb25FeHRlbnQgPSBudWxsXG4gIGluY2x1c2l2ZSA9IHRydWVcbiAgcG9pbnRJbmZvQnlDdXJzb3IgPSBuZXcgTWFwKClcblxuICBtb3ZlQ3Vyc29yKGN1cnNvcikge1xuICAgIGlmICh0aGlzLm1vZGUgPT09IFwidmlzdWFsXCIpIHtcbiAgICAgIHRoaXMuc2VsZWN0aW9uRXh0ZW50ID0gdGhpcy5pc0Jsb2Nrd2lzZSgpXG4gICAgICAgID8gdGhpcy5zd3JhcChjdXJzb3Iuc2VsZWN0aW9uKS5nZXRCbG9ja3dpc2VTZWxlY3Rpb25FeHRlbnQoKVxuICAgICAgICA6IHRoaXMuZWRpdG9yLmdldFNlbGVjdGVkQnVmZmVyUmFuZ2UoKS5nZXRFeHRlbnQoKVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBgLmAgcmVwZWF0IGNhc2VcbiAgICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKS50cmFuc2xhdGUodGhpcy5zZWxlY3Rpb25FeHRlbnQpKVxuICAgIH1cbiAgfVxuXG4gIHNlbGVjdCgpIHtcbiAgICBpZiAodGhpcy5tb2RlID09PSBcInZpc3VhbFwiKSB7XG4gICAgICBzdXBlci5zZWxlY3QoKVxuICAgIH0gZWxzZSB7XG4gICAgICBmb3IgKGNvbnN0IGN1cnNvciBvZiB0aGlzLmVkaXRvci5nZXRDdXJzb3JzKCkpIHtcbiAgICAgICAgY29uc3QgcG9pbnRJbmZvID0gdGhpcy5wb2ludEluZm9CeUN1cnNvci5nZXQoY3Vyc29yKVxuICAgICAgICBpZiAocG9pbnRJbmZvKSB7XG4gICAgICAgICAgY29uc3Qge2N1cnNvclBvc2l0aW9uLCBzdGFydE9mU2VsZWN0aW9ufSA9IHBvaW50SW5mb1xuICAgICAgICAgIGlmIChjdXJzb3JQb3NpdGlvbi5pc0VxdWFsKGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpKSkge1xuICAgICAgICAgICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHN0YXJ0T2ZTZWxlY3Rpb24pXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBzdXBlci5zZWxlY3QoKVxuICAgIH1cblxuICAgIC8vICogUHVycG9zZSBvZiBwb2ludEluZm9CeUN1cnNvcj8gc2VlICMyMzUgZm9yIGRldGFpbC5cbiAgICAvLyBXaGVuIHN0YXlPblRyYW5zZm9ybVN0cmluZyBpcyBlbmFibGVkLCBjdXJzb3IgcG9zIGlzIG5vdCBzZXQgb24gc3RhcnQgb2ZcbiAgICAvLyBvZiBzZWxlY3RlZCByYW5nZS5cbiAgICAvLyBCdXQgSSB3YW50IGZvbGxvd2luZyBiZWhhdmlvciwgc28gbmVlZCB0byBwcmVzZXJ2ZSBwb3NpdGlvbiBpbmZvLlxuICAgIC8vICAxLiBgdmo+LmAgLT4gaW5kZW50IHNhbWUgdHdvIHJvd3MgcmVnYXJkbGVzcyBvZiBjdXJyZW50IGN1cnNvcidzIHJvdy5cbiAgICAvLyAgMi4gYHZqPmouYCAtPiBpbmRlbnQgdHdvIHJvd3MgZnJvbSBjdXJzb3IncyByb3cuXG4gICAgZm9yIChjb25zdCBjdXJzb3Igb2YgdGhpcy5lZGl0b3IuZ2V0Q3Vyc29ycygpKSB7XG4gICAgICBjb25zdCBzdGFydE9mU2VsZWN0aW9uID0gY3Vyc29yLnNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpLnN0YXJ0XG4gICAgICB0aGlzLm9uRGlkRmluaXNoT3BlcmF0aW9uKCgpID0+IHtcbiAgICAgICAgY3Vyc29yUG9zaXRpb24gPSBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuICAgICAgICB0aGlzLnBvaW50SW5mb0J5Q3Vyc29yLnNldChjdXJzb3IsIHtzdGFydE9mU2VsZWN0aW9uLCBjdXJzb3JQb3NpdGlvbn0pXG4gICAgICB9KVxuICAgIH1cbiAgfVxufVxuQ3VycmVudFNlbGVjdGlvbi5yZWdpc3RlcihmYWxzZSlcblxuY2xhc3MgTW92ZUxlZnQgZXh0ZW5kcyBNb3Rpb24ge1xuICBtb3ZlQ3Vyc29yKGN1cnNvcikge1xuICAgIGNvbnN0IGFsbG93V3JhcCA9IHRoaXMuZ2V0Q29uZmlnKFwid3JhcExlZnRSaWdodE1vdGlvblwiKVxuICAgIHRoaXMubW92ZUN1cnNvckNvdW50VGltZXMoY3Vyc29yLCAoKSA9PiB0aGlzLnV0aWxzLm1vdmVDdXJzb3JMZWZ0KGN1cnNvciwge2FsbG93V3JhcH0pKVxuICB9XG59XG5Nb3ZlTGVmdC5yZWdpc3RlcigpXG5cbmNsYXNzIE1vdmVSaWdodCBleHRlbmRzIE1vdGlvbiB7XG4gIG1vdmVDdXJzb3IoY3Vyc29yKSB7XG4gICAgY29uc3QgYWxsb3dXcmFwID0gdGhpcy5nZXRDb25maWcoXCJ3cmFwTGVmdFJpZ2h0TW90aW9uXCIpXG5cbiAgICB0aGlzLm1vdmVDdXJzb3JDb3VudFRpbWVzKGN1cnNvciwgKCkgPT4ge1xuICAgICAgdGhpcy5lZGl0b3IudW5mb2xkQnVmZmVyUm93KGN1cnNvci5nZXRCdWZmZXJSb3coKSlcblxuICAgICAgLy8gLSBXaGVuIGB3cmFwTGVmdFJpZ2h0TW90aW9uYCBlbmFibGVkIGFuZCBleGVjdXRlZCBhcyBwdXJlLW1vdGlvbiBpbiBgbm9ybWFsLW1vZGVgLFxuICAgICAgLy8gICB3ZSBuZWVkIHRvIG1vdmUgKiphZ2FpbioqIHRvIHdyYXAgdG8gbmV4dC1saW5lIGlmIGl0IHJhY2hlZCB0byBFT0wuXG4gICAgICAvLyAtIEV4cHJlc3Npb24gYCF0aGlzLm9wZXJhdG9yYCBtZWFucyBub3JtYWwtbW9kZSBtb3Rpb24uXG4gICAgICAvLyAtIEV4cHJlc3Npb24gYHRoaXMubW9kZSA9PT0gXCJub3JtYWxcImAgaXMgbm90IGFwcHJvcHJlYXRlIHNpbmNlIGl0IG1hdGNoZXMgYHhgIG9wZXJhdG9yJ3MgdGFyZ2V0IGNhc2UuXG4gICAgICBjb25zdCBuZWVkTW92ZUFnYWluID0gYWxsb3dXcmFwICYmICF0aGlzLm9wZXJhdG9yICYmICFjdXJzb3IuaXNBdEVuZE9mTGluZSgpXG5cbiAgICAgIHRoaXMudXRpbHMubW92ZUN1cnNvclJpZ2h0KGN1cnNvciwge2FsbG93V3JhcH0pXG5cbiAgICAgIGlmIChuZWVkTW92ZUFnYWluICYmIGN1cnNvci5pc0F0RW5kT2ZMaW5lKCkpIHtcbiAgICAgICAgdGhpcy51dGlscy5tb3ZlQ3Vyc29yUmlnaHQoY3Vyc29yLCB7YWxsb3dXcmFwfSlcbiAgICAgIH1cbiAgICB9KVxuICB9XG59XG5Nb3ZlUmlnaHQucmVnaXN0ZXIoKVxuXG5jbGFzcyBNb3ZlUmlnaHRCdWZmZXJDb2x1bW4gZXh0ZW5kcyBNb3Rpb24ge1xuICBtb3ZlQ3Vyc29yKGN1cnNvcikge1xuICAgIHRoaXMudXRpbHMuc2V0QnVmZmVyQ29sdW1uKGN1cnNvciwgY3Vyc29yLmdldEJ1ZmZlckNvbHVtbigpICsgdGhpcy5nZXRDb3VudCgpKVxuICB9XG59XG5Nb3ZlUmlnaHRCdWZmZXJDb2x1bW4ucmVnaXN0ZXIoZmFsc2UpXG5cbmNsYXNzIE1vdmVVcCBleHRlbmRzIE1vdGlvbiB7XG4gIHdpc2UgPSBcImxpbmV3aXNlXCJcbiAgd3JhcCA9IGZhbHNlXG5cbiAgZ2V0QnVmZmVyUm93KHJvdykge1xuICAgIGNvbnN0IG1pbiA9IDBcbiAgICByb3cgPSB0aGlzLndyYXAgJiYgcm93ID09PSBtaW4gPyB0aGlzLmdldFZpbUxhc3RCdWZmZXJSb3coKSA6IHRoaXMudXRpbHMubGltaXROdW1iZXIocm93IC0gMSwge21pbn0pXG4gICAgcmV0dXJuIHRoaXMuZ2V0Rm9sZFN0YXJ0Um93Rm9yUm93KHJvdylcbiAgfVxuXG4gIG1vdmVDdXJzb3IoY3Vyc29yKSB7XG4gICAgdGhpcy5tb3ZlQ3Vyc29yQ291bnRUaW1lcyhjdXJzb3IsICgpID0+IHRoaXMudXRpbHMuc2V0QnVmZmVyUm93KGN1cnNvciwgdGhpcy5nZXRCdWZmZXJSb3coY3Vyc29yLmdldEJ1ZmZlclJvdygpKSkpXG4gIH1cbn1cbk1vdmVVcC5yZWdpc3RlcigpXG5cbmNsYXNzIE1vdmVVcFdyYXAgZXh0ZW5kcyBNb3ZlVXAge1xuICB3cmFwID0gdHJ1ZVxufVxuTW92ZVVwV3JhcC5yZWdpc3RlcigpXG5cbmNsYXNzIE1vdmVEb3duIGV4dGVuZHMgTW92ZVVwIHtcbiAgd2lzZSA9IFwibGluZXdpc2VcIlxuICB3cmFwID0gZmFsc2VcblxuICBnZXRCdWZmZXJSb3cocm93KSB7XG4gICAgaWYgKHRoaXMuZWRpdG9yLmlzRm9sZGVkQXRCdWZmZXJSb3cocm93KSkge1xuICAgICAgcm93ID0gdGhpcy51dGlscy5nZXRMYXJnZXN0Rm9sZFJhbmdlQ29udGFpbnNCdWZmZXJSb3codGhpcy5lZGl0b3IsIHJvdykuZW5kLnJvd1xuICAgIH1cbiAgICBjb25zdCBtYXggPSB0aGlzLmdldFZpbUxhc3RCdWZmZXJSb3coKVxuICAgIHJldHVybiB0aGlzLndyYXAgJiYgcm93ID49IG1heCA/IDAgOiB0aGlzLnV0aWxzLmxpbWl0TnVtYmVyKHJvdyArIDEsIHttYXh9KVxuICB9XG59XG5Nb3ZlRG93bi5yZWdpc3RlcigpXG5cbmNsYXNzIE1vdmVEb3duV3JhcCBleHRlbmRzIE1vdmVEb3duIHtcbiAgd3JhcCA9IHRydWVcbn1cbk1vdmVEb3duV3JhcC5yZWdpc3RlcigpXG5cbmNsYXNzIE1vdmVVcFNjcmVlbiBleHRlbmRzIE1vdGlvbiB7XG4gIHdpc2UgPSBcImxpbmV3aXNlXCJcbiAgZGlyZWN0aW9uID0gXCJ1cFwiXG4gIG1vdmVDdXJzb3IoY3Vyc29yKSB7XG4gICAgdGhpcy5tb3ZlQ3Vyc29yQ291bnRUaW1lcyhjdXJzb3IsICgpID0+IHRoaXMudXRpbHMubW92ZUN1cnNvclVwU2NyZWVuKGN1cnNvcikpXG4gIH1cbn1cbk1vdmVVcFNjcmVlbi5yZWdpc3RlcigpXG5cbmNsYXNzIE1vdmVEb3duU2NyZWVuIGV4dGVuZHMgTW92ZVVwU2NyZWVuIHtcbiAgd2lzZSA9IFwibGluZXdpc2VcIlxuICBkaXJlY3Rpb24gPSBcImRvd25cIlxuICBtb3ZlQ3Vyc29yKGN1cnNvcikge1xuICAgIHRoaXMubW92ZUN1cnNvckNvdW50VGltZXMoY3Vyc29yLCAoKSA9PiB0aGlzLnV0aWxzLm1vdmVDdXJzb3JEb3duU2NyZWVuKGN1cnNvcikpXG4gIH1cbn1cbk1vdmVEb3duU2NyZWVuLnJlZ2lzdGVyKClcblxuY2xhc3MgTW92ZVVwVG9FZGdlIGV4dGVuZHMgTW90aW9uIHtcbiAgd2lzZSA9IFwibGluZXdpc2VcIlxuICBqdW1wID0gdHJ1ZVxuICBkaXJlY3Rpb24gPSBcInByZXZpb3VzXCJcbiAgbW92ZUN1cnNvcihjdXJzb3IpIHtcbiAgICB0aGlzLm1vdmVDdXJzb3JDb3VudFRpbWVzKGN1cnNvciwgKCkgPT4ge1xuICAgICAgY29uc3QgcG9pbnQgPSB0aGlzLmdldFBvaW50KGN1cnNvci5nZXRTY3JlZW5Qb3NpdGlvbigpKVxuICAgICAgaWYgKHBvaW50KSBjdXJzb3Iuc2V0U2NyZWVuUG9zaXRpb24ocG9pbnQpXG4gICAgfSlcbiAgfVxuXG4gIGdldFBvaW50KGZyb21Qb2ludCkge1xuICAgIGNvbnN0IHtjb2x1bW4sIHJvdzogc3RhcnRSb3d9ID0gZnJvbVBvaW50XG4gICAgZm9yIChjb25zdCByb3cgb2YgdGhpcy5nZXRTY3JlZW5Sb3dzKHtzdGFydFJvdywgZGlyZWN0aW9uOiB0aGlzLmRpcmVjdGlvbn0pKSB7XG4gICAgICBjb25zdCBwb2ludCA9IG5ldyBQb2ludChyb3csIGNvbHVtbilcbiAgICAgIGlmICh0aGlzLmlzRWRnZShwb2ludCkpIHJldHVybiBwb2ludFxuICAgIH1cbiAgfVxuXG4gIGlzRWRnZShwb2ludCkge1xuICAgIC8vIElmIHBvaW50IGlzIHN0b3BwYWJsZSBhbmQgYWJvdmUgb3IgYmVsb3cgcG9pbnQgaXMgbm90IHN0b3BwYWJsZSwgaXQncyBFZGdlIVxuICAgIHJldHVybiAoXG4gICAgICB0aGlzLmlzU3RvcHBhYmxlKHBvaW50KSAmJlxuICAgICAgKCF0aGlzLmlzU3RvcHBhYmxlKHBvaW50LnRyYW5zbGF0ZShbLTEsIDBdKSkgfHwgIXRoaXMuaXNTdG9wcGFibGUocG9pbnQudHJhbnNsYXRlKFsrMSwgMF0pKSlcbiAgICApXG4gIH1cblxuICBpc1N0b3BwYWJsZShwb2ludCkge1xuICAgIHJldHVybiAoXG4gICAgICB0aGlzLmlzTm9uV2hpdGVTcGFjZShwb2ludCkgfHxcbiAgICAgIHRoaXMuaXNGaXJzdFJvd09yTGFzdFJvd0FuZEVxdWFsQWZ0ZXJDbGlwcGVkKHBvaW50KSB8fFxuICAgICAgLy8gSWYgcmlnaHQgb3IgbGVmdCBjb2x1bW4gaXMgbm9uLXdoaXRlLXNwYWNlIGNoYXIsIGl0J3Mgc3RvcHBhYmxlLlxuICAgICAgKHRoaXMuaXNOb25XaGl0ZVNwYWNlKHBvaW50LnRyYW5zbGF0ZShbMCwgLTFdKSkgJiYgdGhpcy5pc05vbldoaXRlU3BhY2UocG9pbnQudHJhbnNsYXRlKFswLCArMV0pKSlcbiAgICApXG4gIH1cblxuICBpc05vbldoaXRlU3BhY2UocG9pbnQpIHtcbiAgICBjb25zdCBjaGFyID0gdGhpcy51dGlscy5nZXRUZXh0SW5TY3JlZW5SYW5nZSh0aGlzLmVkaXRvciwgUmFuZ2UuZnJvbVBvaW50V2l0aERlbHRhKHBvaW50LCAwLCAxKSlcbiAgICByZXR1cm4gY2hhciAhPSBudWxsICYmIC9cXFMvLnRlc3QoY2hhcilcbiAgfVxuXG4gIGlzRmlyc3RSb3dPckxhc3RSb3dBbmRFcXVhbEFmdGVyQ2xpcHBlZChwb2ludCkge1xuICAgIC8vIEluIG5vdG1hbC1tb2RlLCBjdXJzb3IgaXMgTk9UIHN0b3BwYWJsZSB0byBFT0wgb2Ygbm9uLWJsYW5rIHJvdy5cbiAgICAvLyBTbyBleHBsaWNpdGx5IGd1YXJkIHRvIG5vdCBhbnN3ZXIgaXQgc3RvcHBhYmxlLlxuICAgIGlmICh0aGlzLmlzTW9kZShcIm5vcm1hbFwiKSAmJiB0aGlzLnV0aWxzLnBvaW50SXNBdEVuZE9mTGluZUF0Tm9uRW1wdHlSb3codGhpcy5lZGl0b3IsIHBvaW50KSkge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG4gICAgcmV0dXJuIChcbiAgICAgIChwb2ludC5yb3cgPT09IDAgfHwgcG9pbnQucm93ID09PSB0aGlzLmdldFZpbUxhc3RTY3JlZW5Sb3coKSkgJiZcbiAgICAgIHBvaW50LmlzRXF1YWwodGhpcy5lZGl0b3IuY2xpcFNjcmVlblBvc2l0aW9uKHBvaW50KSlcbiAgICApXG4gIH1cbn1cbk1vdmVVcFRvRWRnZS5yZWdpc3RlcigpXG5cbmNsYXNzIE1vdmVEb3duVG9FZGdlIGV4dGVuZHMgTW92ZVVwVG9FZGdlIHtcbiAgZGlyZWN0aW9uID0gXCJuZXh0XCJcbn1cbk1vdmVEb3duVG9FZGdlLnJlZ2lzdGVyKClcblxuLy8gd29yZFxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgTW92ZVRvTmV4dFdvcmQgZXh0ZW5kcyBNb3Rpb24ge1xuICB3b3JkUmVnZXggPSBudWxsXG5cbiAgZ2V0UG9pbnQocmVnZXgsIGZyb20pIHtcbiAgICBsZXQgd29yZFJhbmdlXG4gICAgbGV0IGZvdW5kID0gZmFsc2VcblxuICAgIHRoaXMuc2NhbkZvcndhcmQocmVnZXgsIHtmcm9tfSwgKHtyYW5nZSwgbWF0Y2hUZXh0LCBzdG9wfSkgPT4ge1xuICAgICAgd29yZFJhbmdlID0gcmFuZ2VcbiAgICAgIC8vIElnbm9yZSAnZW1wdHkgbGluZScgbWF0Y2hlcyBiZXR3ZWVuICdcXHInIGFuZCAnXFxuJ1xuICAgICAgaWYgKG1hdGNoVGV4dCA9PT0gXCJcIiAmJiByYW5nZS5zdGFydC5jb2x1bW4gIT09IDApIHJldHVyblxuICAgICAgaWYgKHJhbmdlLnN0YXJ0LmlzR3JlYXRlclRoYW4oZnJvbSkpIHtcbiAgICAgICAgZm91bmQgPSB0cnVlXG4gICAgICAgIHN0b3AoKVxuICAgICAgfVxuICAgIH0pXG5cbiAgICBpZiAoZm91bmQpIHtcbiAgICAgIGNvbnN0IHBvaW50ID0gd29yZFJhbmdlLnN0YXJ0XG4gICAgICByZXR1cm4gdGhpcy51dGlscy5wb2ludElzQXRFbmRPZkxpbmVBdE5vbkVtcHR5Um93KHRoaXMuZWRpdG9yLCBwb2ludCkgJiZcbiAgICAgICAgIXBvaW50LmlzRXF1YWwodGhpcy5nZXRWaW1Fb2ZCdWZmZXJQb3NpdGlvbigpKVxuICAgICAgICA/IHBvaW50LnRyYXZlcnNlKFsxLCAwXSlcbiAgICAgICAgOiBwb2ludFxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gd29yZFJhbmdlID8gd29yZFJhbmdlLmVuZCA6IGZyb21cbiAgICB9XG4gIH1cblxuICAvLyBTcGVjaWFsIGNhc2U6IFwiY3dcIiBhbmQgXCJjV1wiIGFyZSB0cmVhdGVkIGxpa2UgXCJjZVwiIGFuZCBcImNFXCIgaWYgdGhlIGN1cnNvciBpc1xuICAvLyBvbiBhIG5vbi1ibGFuay4gIFRoaXMgaXMgYmVjYXVzZSBcImN3XCIgaXMgaW50ZXJwcmV0ZWQgYXMgY2hhbmdlLXdvcmQsIGFuZCBhXG4gIC8vIHdvcmQgZG9lcyBub3QgaW5jbHVkZSB0aGUgZm9sbG93aW5nIHdoaXRlIHNwYWNlLiAge1ZpOiBcImN3XCIgd2hlbiBvbiBhIGJsYW5rXG4gIC8vIGZvbGxvd2VkIGJ5IG90aGVyIGJsYW5rcyBjaGFuZ2VzIG9ubHkgdGhlIGZpcnN0IGJsYW5rOyB0aGlzIGlzIHByb2JhYmx5IGFcbiAgLy8gYnVnLCBiZWNhdXNlIFwiZHdcIiBkZWxldGVzIGFsbCB0aGUgYmxhbmtzfVxuICAvL1xuICAvLyBBbm90aGVyIHNwZWNpYWwgY2FzZTogV2hlbiB1c2luZyB0aGUgXCJ3XCIgbW90aW9uIGluIGNvbWJpbmF0aW9uIHdpdGggYW5cbiAgLy8gb3BlcmF0b3IgYW5kIHRoZSBsYXN0IHdvcmQgbW92ZWQgb3ZlciBpcyBhdCB0aGUgZW5kIG9mIGEgbGluZSwgdGhlIGVuZCBvZlxuICAvLyB0aGF0IHdvcmQgYmVjb21lcyB0aGUgZW5kIG9mIHRoZSBvcGVyYXRlZCB0ZXh0LCBub3QgdGhlIGZpcnN0IHdvcmQgaW4gdGhlXG4gIC8vIG5leHQgbGluZS5cbiAgbW92ZUN1cnNvcihjdXJzb3IpIHtcbiAgICBjb25zdCBjdXJzb3JQb3NpdGlvbiA9IGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXG4gICAgaWYgKHRoaXMudXRpbHMucG9pbnRJc0F0VmltRW5kT2ZGaWxlKHRoaXMuZWRpdG9yLCBjdXJzb3JQb3NpdGlvbikpIHJldHVyblxuXG4gICAgY29uc3Qgd2FzT25XaGl0ZVNwYWNlID0gdGhpcy51dGlscy5wb2ludElzT25XaGl0ZVNwYWNlKHRoaXMuZWRpdG9yLCBjdXJzb3JQb3NpdGlvbilcbiAgICBjb25zdCBpc1RhcmdldE9mTm9ybWFsT3BlcmF0b3IgPSB0aGlzLmlzVGFyZ2V0T2ZOb3JtYWxPcGVyYXRvcigpXG5cbiAgICB0aGlzLm1vdmVDdXJzb3JDb3VudFRpbWVzKGN1cnNvciwgKHtpc0ZpbmFsfSkgPT4ge1xuICAgICAgY29uc3QgY3Vyc29yUG9zaXRpb24gPSBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuICAgICAgaWYgKHRoaXMudXRpbHMuaXNFbXB0eVJvdyh0aGlzLmVkaXRvciwgY3Vyc29yUG9zaXRpb24ucm93KSAmJiBpc1RhcmdldE9mTm9ybWFsT3BlcmF0b3IpIHtcbiAgICAgICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKGN1cnNvclBvc2l0aW9uLnRyYXZlcnNlKFsxLCAwXSkpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCByZWdleCA9IHRoaXMud29yZFJlZ2V4IHx8IGN1cnNvci53b3JkUmVnRXhwKClcbiAgICAgICAgbGV0IHBvaW50ID0gdGhpcy5nZXRQb2ludChyZWdleCwgY3Vyc29yUG9zaXRpb24pXG4gICAgICAgIGlmIChpc0ZpbmFsICYmIGlzVGFyZ2V0T2ZOb3JtYWxPcGVyYXRvcikge1xuICAgICAgICAgIGlmICh0aGlzLm9wZXJhdG9yLmlzKFwiQ2hhbmdlXCIpICYmICF3YXNPbldoaXRlU3BhY2UpIHtcbiAgICAgICAgICAgIHBvaW50ID0gY3Vyc29yLmdldEVuZE9mQ3VycmVudFdvcmRCdWZmZXJQb3NpdGlvbih7d29yZFJlZ2V4OiB0aGlzLndvcmRSZWdleH0pXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHBvaW50ID0gUG9pbnQubWluKHBvaW50LCB0aGlzLnV0aWxzLmdldEVuZE9mTGluZUZvckJ1ZmZlclJvdyh0aGlzLmVkaXRvciwgY3Vyc29yUG9zaXRpb24ucm93KSlcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHBvaW50KVxuICAgICAgfVxuICAgIH0pXG4gIH1cbn1cbk1vdmVUb05leHRXb3JkLnJlZ2lzdGVyKClcblxuLy8gYlxuY2xhc3MgTW92ZVRvUHJldmlvdXNXb3JkIGV4dGVuZHMgTW90aW9uIHtcbiAgd29yZFJlZ2V4ID0gbnVsbFxuXG4gIG1vdmVDdXJzb3IoY3Vyc29yKSB7XG4gICAgdGhpcy5tb3ZlQ3Vyc29yQ291bnRUaW1lcyhjdXJzb3IsICgpID0+IHtcbiAgICAgIGNvbnN0IHBvaW50ID0gY3Vyc29yLmdldEJlZ2lubmluZ09mQ3VycmVudFdvcmRCdWZmZXJQb3NpdGlvbih7d29yZFJlZ2V4OiB0aGlzLndvcmRSZWdleH0pXG4gICAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24ocG9pbnQpXG4gICAgfSlcbiAgfVxufVxuTW92ZVRvUHJldmlvdXNXb3JkLnJlZ2lzdGVyKClcblxuY2xhc3MgTW92ZVRvRW5kT2ZXb3JkIGV4dGVuZHMgTW90aW9uIHtcbiAgd29yZFJlZ2V4ID0gbnVsbFxuICBpbmNsdXNpdmUgPSB0cnVlXG5cbiAgbW92ZVRvTmV4dEVuZE9mV29yZChjdXJzb3IpIHtcbiAgICB0aGlzLnV0aWxzLm1vdmVDdXJzb3JUb05leHROb25XaGl0ZXNwYWNlKGN1cnNvcilcbiAgICBjb25zdCBwb2ludCA9IGN1cnNvci5nZXRFbmRPZkN1cnJlbnRXb3JkQnVmZmVyUG9zaXRpb24oe3dvcmRSZWdleDogdGhpcy53b3JkUmVnZXh9KS50cmFuc2xhdGUoWzAsIC0xXSlcbiAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24oUG9pbnQubWluKHBvaW50LCB0aGlzLmdldFZpbUVvZkJ1ZmZlclBvc2l0aW9uKCkpKVxuICB9XG5cbiAgbW92ZUN1cnNvcihjdXJzb3IpIHtcbiAgICB0aGlzLm1vdmVDdXJzb3JDb3VudFRpbWVzKGN1cnNvciwgKCkgPT4ge1xuICAgICAgY29uc3Qgb3JpZ2luYWxQb2ludCA9IGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXG4gICAgICB0aGlzLm1vdmVUb05leHRFbmRPZldvcmQoY3Vyc29yKVxuICAgICAgaWYgKG9yaWdpbmFsUG9pbnQuaXNFcXVhbChjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKSkpIHtcbiAgICAgICAgLy8gUmV0cnkgZnJvbSByaWdodCBjb2x1bW4gaWYgY3Vyc29yIHdhcyBhbHJlYWR5IG9uIEVuZE9mV29yZFxuICAgICAgICBjdXJzb3IubW92ZVJpZ2h0KClcbiAgICAgICAgdGhpcy5tb3ZlVG9OZXh0RW5kT2ZXb3JkKGN1cnNvcilcbiAgICAgIH1cbiAgICB9KVxuICB9XG59XG5Nb3ZlVG9FbmRPZldvcmQucmVnaXN0ZXIoKVxuXG4vLyBbVE9ETzogSW1wcm92ZSwgYWNjdXJhY3ldXG5jbGFzcyBNb3ZlVG9QcmV2aW91c0VuZE9mV29yZCBleHRlbmRzIE1vdmVUb1ByZXZpb3VzV29yZCB7XG4gIGluY2x1c2l2ZSA9IHRydWVcblxuICBtb3ZlQ3Vyc29yKGN1cnNvcikge1xuICAgIGNvbnN0IHdvcmRSYW5nZSA9IGN1cnNvci5nZXRDdXJyZW50V29yZEJ1ZmZlclJhbmdlKClcbiAgICBjb25zdCBjdXJzb3JQb3NpdGlvbiA9IGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXG5cbiAgICAvLyBpZiB3ZSdyZSBpbiB0aGUgbWlkZGxlIG9mIGEgd29yZCB0aGVuIHdlIG5lZWQgdG8gbW92ZSB0byBpdHMgc3RhcnRcbiAgICBsZXQgdGltZXMgPSB0aGlzLmdldENvdW50KClcbiAgICBpZiAoY3Vyc29yUG9zaXRpb24uaXNHcmVhdGVyVGhhbih3b3JkUmFuZ2Uuc3RhcnQpICYmIGN1cnNvclBvc2l0aW9uLmlzTGVzc1RoYW4od29yZFJhbmdlLmVuZCkpIHtcbiAgICAgIHRpbWVzICs9IDFcbiAgICB9XG5cbiAgICBmb3IgKGNvbnN0IGkgaW4gdGhpcy51dGlscy5nZXRMaXN0KDEsIHRpbWVzKSkge1xuICAgICAgY29uc3QgcG9pbnQgPSBjdXJzb3IuZ2V0QmVnaW5uaW5nT2ZDdXJyZW50V29yZEJ1ZmZlclBvc2l0aW9uKHt3b3JkUmVnZXg6IHRoaXMud29yZFJlZ2V4fSlcbiAgICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihwb2ludClcbiAgICB9XG5cbiAgICB0aGlzLm1vdmVUb05leHRFbmRPZldvcmQoY3Vyc29yKVxuICAgIGlmIChjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKS5pc0dyZWF0ZXJUaGFuT3JFcXVhbChjdXJzb3JQb3NpdGlvbikpIHtcbiAgICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihbMCwgMF0pXG4gICAgfVxuICB9XG5cbiAgbW92ZVRvTmV4dEVuZE9mV29yZChjdXJzb3IpIHtcbiAgICBjb25zdCBwb2ludCA9IGN1cnNvci5nZXRFbmRPZkN1cnJlbnRXb3JkQnVmZmVyUG9zaXRpb24oe3dvcmRSZWdleDogdGhpcy53b3JkUmVnZXh9KS50cmFuc2xhdGUoWzAsIC0xXSlcbiAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24oUG9pbnQubWluKHBvaW50LCB0aGlzLmdldFZpbUVvZkJ1ZmZlclBvc2l0aW9uKCkpKVxuICB9XG59XG5Nb3ZlVG9QcmV2aW91c0VuZE9mV29yZC5yZWdpc3RlcigpXG5cbi8vIFdob2xlIHdvcmRcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIE1vdmVUb05leHRXaG9sZVdvcmQgZXh0ZW5kcyBNb3ZlVG9OZXh0V29yZCB7XG4gIHdvcmRSZWdleCA9IC9eJHxcXFMrL2dcbn1cbk1vdmVUb05leHRXaG9sZVdvcmQucmVnaXN0ZXIoKVxuXG5jbGFzcyBNb3ZlVG9QcmV2aW91c1dob2xlV29yZCBleHRlbmRzIE1vdmVUb1ByZXZpb3VzV29yZCB7XG4gIHdvcmRSZWdleCA9IC9eJHxcXFMrL2dcbn1cbk1vdmVUb1ByZXZpb3VzV2hvbGVXb3JkLnJlZ2lzdGVyKClcblxuY2xhc3MgTW92ZVRvRW5kT2ZXaG9sZVdvcmQgZXh0ZW5kcyBNb3ZlVG9FbmRPZldvcmQge1xuICB3b3JkUmVnZXggPSAvXFxTKy9cbn1cbk1vdmVUb0VuZE9mV2hvbGVXb3JkLnJlZ2lzdGVyKClcblxuLy8gW1RPRE86IEltcHJvdmUsIGFjY3VyYWN5XVxuY2xhc3MgTW92ZVRvUHJldmlvdXNFbmRPZldob2xlV29yZCBleHRlbmRzIE1vdmVUb1ByZXZpb3VzRW5kT2ZXb3JkIHtcbiAgd29yZFJlZ2V4ID0gL1xcUysvXG59XG5Nb3ZlVG9QcmV2aW91c0VuZE9mV2hvbGVXb3JkLnJlZ2lzdGVyKClcblxuLy8gQWxwaGFudW1lcmljIHdvcmQgW0V4cGVyaW1lbnRhbF1cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIE1vdmVUb05leHRBbHBoYW51bWVyaWNXb3JkIGV4dGVuZHMgTW92ZVRvTmV4dFdvcmQge1xuICB3b3JkUmVnZXggPSAvXFx3Ky9nXG59XG5Nb3ZlVG9OZXh0QWxwaGFudW1lcmljV29yZC5yZWdpc3RlcigpXG5cbmNsYXNzIE1vdmVUb1ByZXZpb3VzQWxwaGFudW1lcmljV29yZCBleHRlbmRzIE1vdmVUb1ByZXZpb3VzV29yZCB7XG4gIHdvcmRSZWdleCA9IC9cXHcrL1xufVxuTW92ZVRvUHJldmlvdXNBbHBoYW51bWVyaWNXb3JkLnJlZ2lzdGVyKClcblxuY2xhc3MgTW92ZVRvRW5kT2ZBbHBoYW51bWVyaWNXb3JkIGV4dGVuZHMgTW92ZVRvRW5kT2ZXb3JkIHtcbiAgd29yZFJlZ2V4ID0gL1xcdysvXG59XG5Nb3ZlVG9FbmRPZkFscGhhbnVtZXJpY1dvcmQucmVnaXN0ZXIoKVxuXG4vLyBBbHBoYW51bWVyaWMgd29yZCBbRXhwZXJpbWVudGFsXVxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgTW92ZVRvTmV4dFNtYXJ0V29yZCBleHRlbmRzIE1vdmVUb05leHRXb3JkIHtcbiAgd29yZFJlZ2V4ID0gL1tcXHctXSsvZ1xufVxuTW92ZVRvTmV4dFNtYXJ0V29yZC5yZWdpc3RlcigpXG5cbmNsYXNzIE1vdmVUb1ByZXZpb3VzU21hcnRXb3JkIGV4dGVuZHMgTW92ZVRvUHJldmlvdXNXb3JkIHtcbiAgd29yZFJlZ2V4ID0gL1tcXHctXSsvXG59XG5Nb3ZlVG9QcmV2aW91c1NtYXJ0V29yZC5yZWdpc3RlcigpXG5cbmNsYXNzIE1vdmVUb0VuZE9mU21hcnRXb3JkIGV4dGVuZHMgTW92ZVRvRW5kT2ZXb3JkIHtcbiAgd29yZFJlZ2V4ID0gL1tcXHctXSsvXG59XG5Nb3ZlVG9FbmRPZlNtYXJ0V29yZC5yZWdpc3RlcigpXG5cbi8vIFN1YndvcmRcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIE1vdmVUb05leHRTdWJ3b3JkIGV4dGVuZHMgTW92ZVRvTmV4dFdvcmQge1xuICBtb3ZlQ3Vyc29yKGN1cnNvcikge1xuICAgIHRoaXMud29yZFJlZ2V4ID0gY3Vyc29yLnN1YndvcmRSZWdFeHAoKVxuICAgIHN1cGVyLm1vdmVDdXJzb3IoY3Vyc29yKVxuICB9XG59XG5Nb3ZlVG9OZXh0U3Vid29yZC5yZWdpc3RlcigpXG5cbmNsYXNzIE1vdmVUb1ByZXZpb3VzU3Vid29yZCBleHRlbmRzIE1vdmVUb1ByZXZpb3VzV29yZCB7XG4gIG1vdmVDdXJzb3IoY3Vyc29yKSB7XG4gICAgdGhpcy53b3JkUmVnZXggPSBjdXJzb3Iuc3Vid29yZFJlZ0V4cCgpXG4gICAgc3VwZXIubW92ZUN1cnNvcihjdXJzb3IpXG4gIH1cbn1cbk1vdmVUb1ByZXZpb3VzU3Vid29yZC5yZWdpc3RlcigpXG5cbmNsYXNzIE1vdmVUb0VuZE9mU3Vid29yZCBleHRlbmRzIE1vdmVUb0VuZE9mV29yZCB7XG4gIG1vdmVDdXJzb3IoY3Vyc29yKSB7XG4gICAgdGhpcy53b3JkUmVnZXggPSBjdXJzb3Iuc3Vid29yZFJlZ0V4cCgpXG4gICAgc3VwZXIubW92ZUN1cnNvcihjdXJzb3IpXG4gIH1cbn1cbk1vdmVUb0VuZE9mU3Vid29yZC5yZWdpc3RlcigpXG5cbi8vIFNlbnRlbmNlXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBTZW50ZW5jZSBpcyBkZWZpbmVkIGFzIGJlbG93XG4vLyAgLSBlbmQgd2l0aCBbJy4nLCAnIScsICc/J11cbi8vICAtIG9wdGlvbmFsbHkgZm9sbG93ZWQgYnkgWycpJywgJ10nLCAnXCInLCBcIidcIl1cbi8vICAtIGZvbGxvd2VkIGJ5IFsnJCcsICcgJywgJ1xcdCddXG4vLyAgLSBwYXJhZ3JhcGggYm91bmRhcnkgaXMgYWxzbyBzZW50ZW5jZSBib3VuZGFyeVxuLy8gIC0gc2VjdGlvbiBib3VuZGFyeSBpcyBhbHNvIHNlbnRlbmNlIGJvdW5kYXJ5KGlnbm9yZSlcbmNsYXNzIE1vdmVUb05leHRTZW50ZW5jZSBleHRlbmRzIE1vdGlvbiB7XG4gIGp1bXAgPSB0cnVlXG4gIHNlbnRlbmNlUmVnZXggPSBuZXcgUmVnRXhwKGAoPzpbXFxcXC4hXFxcXD9dW1xcXFwpXFxcXF1cIiddKlxcXFxzKyl8KFxcXFxufFxcXFxyXFxcXG4pYCwgXCJnXCIpXG4gIGRpcmVjdGlvbiA9IFwibmV4dFwiXG5cbiAgbW92ZUN1cnNvcihjdXJzb3IpIHtcbiAgICB0aGlzLm1vdmVDdXJzb3JDb3VudFRpbWVzKGN1cnNvciwgKCkgPT4ge1xuICAgICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHRoaXMuZ2V0UG9pbnQoY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKCkpKVxuICAgIH0pXG4gIH1cblxuICBnZXRQb2ludChmcm9tUG9pbnQpIHtcbiAgICByZXR1cm4gdGhpcy5kaXJlY3Rpb24gPT09IFwibmV4dFwiXG4gICAgICA/IHRoaXMuZ2V0TmV4dFN0YXJ0T2ZTZW50ZW5jZShmcm9tUG9pbnQpXG4gICAgICA6IHRoaXMuZ2V0UHJldmlvdXNTdGFydE9mU2VudGVuY2UoZnJvbVBvaW50KVxuICB9XG5cbiAgaXNCbGFua1Jvdyhyb3cpIHtcbiAgICByZXR1cm4gdGhpcy5lZGl0b3IuaXNCdWZmZXJSb3dCbGFuayhyb3cpXG4gIH1cblxuICBnZXROZXh0U3RhcnRPZlNlbnRlbmNlKGZyb20pIHtcbiAgICBsZXQgZm91bmRQb2ludFxuICAgIHRoaXMuc2NhbkZvcndhcmQodGhpcy5zZW50ZW5jZVJlZ2V4LCB7ZnJvbX0sICh7cmFuZ2UsIG1hdGNoVGV4dCwgbWF0Y2gsIHN0b3B9KSA9PiB7XG4gICAgICBpZiAobWF0Y2hbMV0gIT0gbnVsbCkge1xuICAgICAgICBjb25zdCBbc3RhcnRSb3csIGVuZFJvd10gPSBbcmFuZ2Uuc3RhcnQucm93LCByYW5nZS5lbmQucm93XVxuICAgICAgICBpZiAodGhpcy5za2lwQmxhbmtSb3cgJiYgdGhpcy5pc0JsYW5rUm93KGVuZFJvdykpIHJldHVyblxuICAgICAgICBpZiAodGhpcy5pc0JsYW5rUm93KHN0YXJ0Um93KSAhPT0gdGhpcy5pc0JsYW5rUm93KGVuZFJvdykpIHtcbiAgICAgICAgICBmb3VuZFBvaW50ID0gdGhpcy5nZXRGaXJzdENoYXJhY3RlclBvc2l0aW9uRm9yQnVmZmVyUm93KGVuZFJvdylcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZm91bmRQb2ludCA9IHJhbmdlLmVuZFxuICAgICAgfVxuICAgICAgaWYgKGZvdW5kUG9pbnQpIHN0b3AoKVxuICAgIH0pXG4gICAgcmV0dXJuIGZvdW5kUG9pbnQgfHwgdGhpcy5nZXRWaW1Fb2ZCdWZmZXJQb3NpdGlvbigpXG4gIH1cblxuICBnZXRQcmV2aW91c1N0YXJ0T2ZTZW50ZW5jZShmcm9tKSB7XG4gICAgbGV0IGZvdW5kUG9pbnRcbiAgICB0aGlzLnNjYW5CYWNrd2FyZCh0aGlzLnNlbnRlbmNlUmVnZXgsIHtmcm9tfSwgKHtyYW5nZSwgbWF0Y2hUZXh0LCBtYXRjaCwgc3RvcH0pID0+IHtcbiAgICAgIGlmIChtYXRjaFsxXSAhPSBudWxsKSB7XG4gICAgICAgIGNvbnN0IFtzdGFydFJvdywgZW5kUm93XSA9IFtyYW5nZS5zdGFydC5yb3csIHJhbmdlLmVuZC5yb3ddXG4gICAgICAgIGlmICghdGhpcy5pc0JsYW5rUm93KGVuZFJvdykgJiYgdGhpcy5pc0JsYW5rUm93KHN0YXJ0Um93KSkge1xuICAgICAgICAgIGNvbnN0IHBvaW50ID0gdGhpcy5nZXRGaXJzdENoYXJhY3RlclBvc2l0aW9uRm9yQnVmZmVyUm93KGVuZFJvdylcbiAgICAgICAgICBpZiAocG9pbnQuaXNMZXNzVGhhbihmcm9tKSkge1xuICAgICAgICAgICAgZm91bmRQb2ludCA9IHBvaW50XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnNraXBCbGFua1JvdykgcmV0dXJuXG4gICAgICAgICAgICBmb3VuZFBvaW50ID0gdGhpcy5nZXRGaXJzdENoYXJhY3RlclBvc2l0aW9uRm9yQnVmZmVyUm93KHN0YXJ0Um93KVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKHJhbmdlLmVuZC5pc0xlc3NUaGFuKGZyb20pKSBmb3VuZFBvaW50ID0gcmFuZ2UuZW5kXG4gICAgICB9XG4gICAgICBpZiAoZm91bmRQb2ludCkgc3RvcCgpXG4gICAgfSlcbiAgICByZXR1cm4gZm91bmRQb2ludCB8fCBbMCwgMF1cbiAgfVxufVxuTW92ZVRvTmV4dFNlbnRlbmNlLnJlZ2lzdGVyKClcblxuY2xhc3MgTW92ZVRvUHJldmlvdXNTZW50ZW5jZSBleHRlbmRzIE1vdmVUb05leHRTZW50ZW5jZSB7XG4gIGRpcmVjdGlvbiA9IFwicHJldmlvdXNcIlxufVxuTW92ZVRvUHJldmlvdXNTZW50ZW5jZS5yZWdpc3RlcigpXG5cbmNsYXNzIE1vdmVUb05leHRTZW50ZW5jZVNraXBCbGFua1JvdyBleHRlbmRzIE1vdmVUb05leHRTZW50ZW5jZSB7XG4gIHNraXBCbGFua1JvdyA9IHRydWVcbn1cbk1vdmVUb05leHRTZW50ZW5jZVNraXBCbGFua1Jvdy5yZWdpc3RlcigpXG5cbmNsYXNzIE1vdmVUb1ByZXZpb3VzU2VudGVuY2VTa2lwQmxhbmtSb3cgZXh0ZW5kcyBNb3ZlVG9QcmV2aW91c1NlbnRlbmNlIHtcbiAgc2tpcEJsYW5rUm93ID0gdHJ1ZVxufVxuTW92ZVRvUHJldmlvdXNTZW50ZW5jZVNraXBCbGFua1Jvdy5yZWdpc3RlcigpXG5cbi8vIFBhcmFncmFwaFxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgTW92ZVRvTmV4dFBhcmFncmFwaCBleHRlbmRzIE1vdGlvbiB7XG4gIGp1bXAgPSB0cnVlXG4gIGRpcmVjdGlvbiA9IFwibmV4dFwiXG5cbiAgbW92ZUN1cnNvcihjdXJzb3IpIHtcbiAgICB0aGlzLm1vdmVDdXJzb3JDb3VudFRpbWVzKGN1cnNvciwgKCkgPT4ge1xuICAgICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHRoaXMuZ2V0UG9pbnQoY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKCkpKVxuICAgIH0pXG4gIH1cblxuICBnZXRQb2ludChmcm9tUG9pbnQpIHtcbiAgICBjb25zdCBzdGFydFJvdyA9IGZyb21Qb2ludC5yb3dcbiAgICBsZXQgd2FzQmxhbmtSb3cgPSB0aGlzLmVkaXRvci5pc0J1ZmZlclJvd0JsYW5rKHN0YXJ0Um93KVxuICAgIGZvciAoY29uc3Qgcm93IG9mIHRoaXMuZ2V0QnVmZmVyUm93cyh7c3RhcnRSb3csIGRpcmVjdGlvbjogdGhpcy5kaXJlY3Rpb259KSkge1xuICAgICAgY29uc3QgaXNCbGFua1JvdyA9IHRoaXMuZWRpdG9yLmlzQnVmZmVyUm93Qmxhbmsocm93KVxuICAgICAgaWYgKCF3YXNCbGFua1JvdyAmJiBpc0JsYW5rUm93KSB7XG4gICAgICAgIHJldHVybiBuZXcgUG9pbnQocm93LCAwKVxuICAgICAgfVxuICAgICAgd2FzQmxhbmtSb3cgPSBpc0JsYW5rUm93XG4gICAgfVxuXG4gICAgLy8gZmFsbGJhY2tcbiAgICByZXR1cm4gdGhpcy5kaXJlY3Rpb24gPT09IFwicHJldmlvdXNcIiA/IG5ldyBQb2ludCgwLCAwKSA6IHRoaXMuZ2V0VmltRW9mQnVmZmVyUG9zaXRpb24oKVxuICB9XG59XG5Nb3ZlVG9OZXh0UGFyYWdyYXBoLnJlZ2lzdGVyKClcblxuY2xhc3MgTW92ZVRvUHJldmlvdXNQYXJhZ3JhcGggZXh0ZW5kcyBNb3ZlVG9OZXh0UGFyYWdyYXBoIHtcbiAgZGlyZWN0aW9uID0gXCJwcmV2aW91c1wiXG59XG5Nb3ZlVG9QcmV2aW91c1BhcmFncmFwaC5yZWdpc3RlcigpXG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIGtleW1hcDogMFxuY2xhc3MgTW92ZVRvQmVnaW5uaW5nT2ZMaW5lIGV4dGVuZHMgTW90aW9uIHtcbiAgbW92ZUN1cnNvcihjdXJzb3IpIHtcbiAgICB0aGlzLnV0aWxzLnNldEJ1ZmZlckNvbHVtbihjdXJzb3IsIDApXG4gIH1cbn1cbk1vdmVUb0JlZ2lubmluZ09mTGluZS5yZWdpc3RlcigpXG5cbmNsYXNzIE1vdmVUb0NvbHVtbiBleHRlbmRzIE1vdGlvbiB7XG4gIG1vdmVDdXJzb3IoY3Vyc29yKSB7XG4gICAgdGhpcy51dGlscy5zZXRCdWZmZXJDb2x1bW4oY3Vyc29yLCB0aGlzLmdldENvdW50KC0xKSlcbiAgfVxufVxuTW92ZVRvQ29sdW1uLnJlZ2lzdGVyKClcblxuY2xhc3MgTW92ZVRvTGFzdENoYXJhY3Rlck9mTGluZSBleHRlbmRzIE1vdGlvbiB7XG4gIG1vdmVDdXJzb3IoY3Vyc29yKSB7XG4gICAgY29uc3Qgcm93ID0gdGhpcy5nZXRWYWxpZFZpbUJ1ZmZlclJvdyhjdXJzb3IuZ2V0QnVmZmVyUm93KCkgKyB0aGlzLmdldENvdW50KC0xKSlcbiAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24oW3JvdywgSW5maW5pdHldKVxuICAgIGN1cnNvci5nb2FsQ29sdW1uID0gSW5maW5pdHlcbiAgfVxufVxuTW92ZVRvTGFzdENoYXJhY3Rlck9mTGluZS5yZWdpc3RlcigpXG5cbmNsYXNzIE1vdmVUb0xhc3ROb25ibGFua0NoYXJhY3Rlck9mTGluZUFuZERvd24gZXh0ZW5kcyBNb3Rpb24ge1xuICBpbmNsdXNpdmUgPSB0cnVlXG5cbiAgbW92ZUN1cnNvcihjdXJzb3IpIHtcbiAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24odGhpcy5nZXRQb2ludChjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKSkpXG4gIH1cblxuICBnZXRQb2ludCh7cm93fSkge1xuICAgIHJvdyA9IHRoaXMudXRpbHMubGltaXROdW1iZXIocm93ICsgdGhpcy5nZXRDb3VudCgtMSksIHttYXg6IHRoaXMuZ2V0VmltTGFzdEJ1ZmZlclJvdygpfSlcbiAgICBjb25zdCByYW5nZSA9IHRoaXMudXRpbHMuZmluZFJhbmdlSW5CdWZmZXJSb3codGhpcy5lZGl0b3IsIC9cXFN8Xi8sIHJvdywge2RpcmVjdGlvbjogXCJiYWNrd2FyZFwifSlcbiAgICByZXR1cm4gcmFuZ2UgPyByYW5nZS5zdGFydCA6IG5ldyBQb2ludChyb3csIDApXG4gIH1cbn1cbk1vdmVUb0xhc3ROb25ibGFua0NoYXJhY3Rlck9mTGluZUFuZERvd24ucmVnaXN0ZXIoKVxuXG4vLyBNb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZSBmYWltaWx5XG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIF5cbmNsYXNzIE1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lIGV4dGVuZHMgTW90aW9uIHtcbiAgbW92ZUN1cnNvcihjdXJzb3IpIHtcbiAgICBjb25zdCBwb2ludCA9IHRoaXMuZ2V0Rmlyc3RDaGFyYWN0ZXJQb3NpdGlvbkZvckJ1ZmZlclJvdyhjdXJzb3IuZ2V0QnVmZmVyUm93KCkpXG4gICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHBvaW50KVxuICB9XG59XG5Nb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZS5yZWdpc3RlcigpXG5cbmNsYXNzIE1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lVXAgZXh0ZW5kcyBNb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZSB7XG4gIHdpc2UgPSBcImxpbmV3aXNlXCJcbiAgbW92ZUN1cnNvcihjdXJzb3IpIHtcbiAgICB0aGlzLm1vdmVDdXJzb3JDb3VudFRpbWVzKGN1cnNvciwgKCkgPT4ge1xuICAgICAgY29uc3Qgcm93ID0gdGhpcy5nZXRWYWxpZFZpbUJ1ZmZlclJvdyhjdXJzb3IuZ2V0QnVmZmVyUm93KCkgLSAxKVxuICAgICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKFtyb3csIDBdKVxuICAgIH0pXG4gICAgc3VwZXIubW92ZUN1cnNvcihjdXJzb3IpXG4gIH1cbn1cbk1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lVXAucmVnaXN0ZXIoKVxuXG5jbGFzcyBNb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZURvd24gZXh0ZW5kcyBNb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZSB7XG4gIHdpc2UgPSBcImxpbmV3aXNlXCJcbiAgbW92ZUN1cnNvcihjdXJzb3IpIHtcbiAgICB0aGlzLm1vdmVDdXJzb3JDb3VudFRpbWVzKGN1cnNvciwgKCkgPT4ge1xuICAgICAgY29uc3QgcG9pbnQgPSBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuICAgICAgaWYgKHBvaW50LnJvdyA8IHRoaXMuZ2V0VmltTGFzdEJ1ZmZlclJvdygpKSB7XG4gICAgICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihwb2ludC50cmFuc2xhdGUoWysxLCAwXSkpXG4gICAgICB9XG4gICAgfSlcbiAgICBzdXBlci5tb3ZlQ3Vyc29yKGN1cnNvcilcbiAgfVxufVxuTW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmVEb3duLnJlZ2lzdGVyKClcblxuY2xhc3MgTW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmVBbmREb3duIGV4dGVuZHMgTW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmVEb3duIHtcbiAgZ2V0Q291bnQoKSB7XG4gICAgcmV0dXJuIHN1cGVyLmdldENvdW50KC0xKVxuICB9XG59XG5Nb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZUFuZERvd24ucmVnaXN0ZXIoKVxuXG5jbGFzcyBNb3ZlVG9TY3JlZW5Db2x1bW4gZXh0ZW5kcyBNb3Rpb24ge1xuICBtb3ZlQ3Vyc29yKGN1cnNvcikge1xuICAgIGNvbnN0IGFsbG93T2ZmU2NyZWVuUG9zaXRpb24gPSB0aGlzLmdldENvbmZpZyhcImFsbG93TW92ZVRvT2ZmU2NyZWVuQ29sdW1uT25TY3JlZW5MaW5lTW90aW9uXCIpXG4gICAgY29uc3QgcG9pbnQgPSB0aGlzLnV0aWxzLmdldFNjcmVlblBvc2l0aW9uRm9yU2NyZWVuUm93KHRoaXMuZWRpdG9yLCBjdXJzb3IuZ2V0U2NyZWVuUm93KCksIHRoaXMud2hpY2gsIHtcbiAgICAgIGFsbG93T2ZmU2NyZWVuUG9zaXRpb24sXG4gICAgfSlcbiAgICBpZiAocG9pbnQpIGN1cnNvci5zZXRTY3JlZW5Qb3NpdGlvbihwb2ludClcbiAgfVxufVxuTW92ZVRvU2NyZWVuQ29sdW1uLnJlZ2lzdGVyKGZhbHNlKVxuXG4vLyBrZXltYXA6IGcgMFxuY2xhc3MgTW92ZVRvQmVnaW5uaW5nT2ZTY3JlZW5MaW5lIGV4dGVuZHMgTW92ZVRvU2NyZWVuQ29sdW1uIHtcbiAgd2hpY2ggPSBcImJlZ2lubmluZ1wiXG59XG5Nb3ZlVG9CZWdpbm5pbmdPZlNjcmVlbkxpbmUucmVnaXN0ZXIoKVxuXG4vLyBnIF46IGBtb3ZlLXRvLWZpcnN0LWNoYXJhY3Rlci1vZi1zY3JlZW4tbGluZWBcbmNsYXNzIE1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZTY3JlZW5MaW5lIGV4dGVuZHMgTW92ZVRvU2NyZWVuQ29sdW1uIHtcbiAgd2hpY2ggPSBcImZpcnN0LWNoYXJhY3RlclwiXG59XG5Nb3ZlVG9GaXJzdENoYXJhY3Rlck9mU2NyZWVuTGluZS5yZWdpc3RlcigpXG5cbi8vIGtleW1hcDogZyAkXG5jbGFzcyBNb3ZlVG9MYXN0Q2hhcmFjdGVyT2ZTY3JlZW5MaW5lIGV4dGVuZHMgTW92ZVRvU2NyZWVuQ29sdW1uIHtcbiAgd2hpY2ggPSBcImxhc3QtY2hhcmFjdGVyXCJcbn1cbk1vdmVUb0xhc3RDaGFyYWN0ZXJPZlNjcmVlbkxpbmUucmVnaXN0ZXIoKVxuXG4vLyBrZXltYXA6IGcgZ1xuY2xhc3MgTW92ZVRvRmlyc3RMaW5lIGV4dGVuZHMgTW90aW9uIHtcbiAgd2lzZSA9IFwibGluZXdpc2VcIlxuICBqdW1wID0gdHJ1ZVxuICB2ZXJ0aWNhbE1vdGlvbiA9IHRydWVcbiAgbW92ZVN1Y2Nlc3NPbkxpbmV3aXNlID0gdHJ1ZVxuXG4gIG1vdmVDdXJzb3IoY3Vyc29yKSB7XG4gICAgdGhpcy5zZXRDdXJzb3JCdWZmZXJSb3coY3Vyc29yLCB0aGlzLmdldFZhbGlkVmltQnVmZmVyUm93KHRoaXMuZ2V0Um93KCkpKVxuICAgIGN1cnNvci5hdXRvc2Nyb2xsKHtjZW50ZXI6IHRydWV9KVxuICB9XG5cbiAgZ2V0Um93KCkge1xuICAgIHJldHVybiB0aGlzLmdldENvdW50KC0xKVxuICB9XG59XG5Nb3ZlVG9GaXJzdExpbmUucmVnaXN0ZXIoKVxuXG4vLyBrZXltYXA6IEdcbmNsYXNzIE1vdmVUb0xhc3RMaW5lIGV4dGVuZHMgTW92ZVRvRmlyc3RMaW5lIHtcbiAgZGVmYXVsdENvdW50ID0gSW5maW5pdHlcbn1cbk1vdmVUb0xhc3RMaW5lLnJlZ2lzdGVyKClcblxuLy8ga2V5bWFwOiBOJSBlLmcuIDEwJVxuY2xhc3MgTW92ZVRvTGluZUJ5UGVyY2VudCBleHRlbmRzIE1vdmVUb0ZpcnN0TGluZSB7XG4gIGdldFJvdygpIHtcbiAgICBjb25zdCBwZXJjZW50ID0gdGhpcy51dGlscy5saW1pdE51bWJlcih0aGlzLmdldENvdW50KCksIHttYXg6IDEwMH0pXG4gICAgcmV0dXJuIE1hdGguZmxvb3IoKHRoaXMuZWRpdG9yLmdldExpbmVDb3VudCgpIC0gMSkgKiAocGVyY2VudCAvIDEwMCkpXG4gIH1cbn1cbk1vdmVUb0xpbmVCeVBlcmNlbnQucmVnaXN0ZXIoKVxuXG5jbGFzcyBNb3ZlVG9SZWxhdGl2ZUxpbmUgZXh0ZW5kcyBNb3Rpb24ge1xuICB3aXNlID0gXCJsaW5ld2lzZVwiXG4gIG1vdmVTdWNjZXNzT25MaW5ld2lzZSA9IHRydWVcblxuICBtb3ZlQ3Vyc29yKGN1cnNvcikge1xuICAgIGxldCByb3dcbiAgICBsZXQgY291bnQgPSB0aGlzLmdldENvdW50KClcbiAgICBpZiAoY291bnQgPCAwKSB7XG4gICAgICAvLyBTdXBwb3J0IG5lZ2F0aXZlIGNvdW50XG4gICAgICAvLyBOZWdhdGl2ZSBjb3VudCBjYW4gYmUgcGFzc2VkIGxpa2UgYG9wZXJhdGlvblN0YWNrLnJ1bihcIk1vdmVUb1JlbGF0aXZlTGluZVwiLCB7Y291bnQ6IC01fSlgLlxuICAgICAgLy8gQ3VycmVudGx5IHVzZWQgaW4gdmltLW1vZGUtcGx1cy1leC1tb2RlIHBrZy5cbiAgICAgIGNvdW50ICs9IDFcbiAgICAgIHJvdyA9IHRoaXMuZ2V0Rm9sZFN0YXJ0Um93Rm9yUm93KGN1cnNvci5nZXRCdWZmZXJSb3coKSlcbiAgICAgIHdoaWxlIChjb3VudCsrIDwgMCkgcm93ID0gdGhpcy5nZXRGb2xkU3RhcnRSb3dGb3JSb3cocm93IC0gMSlcbiAgICB9IGVsc2Uge1xuICAgICAgY291bnQgLT0gMVxuICAgICAgcm93ID0gdGhpcy5nZXRGb2xkRW5kUm93Rm9yUm93KGN1cnNvci5nZXRCdWZmZXJSb3coKSlcbiAgICAgIHdoaWxlIChjb3VudC0tID4gMCkgcm93ID0gdGhpcy5nZXRGb2xkRW5kUm93Rm9yUm93KHJvdyArIDEpXG4gICAgfVxuICAgIHRoaXMudXRpbHMuc2V0QnVmZmVyUm93KGN1cnNvciwgcm93KVxuICB9XG59XG5Nb3ZlVG9SZWxhdGl2ZUxpbmUucmVnaXN0ZXIoZmFsc2UpXG5cbmNsYXNzIE1vdmVUb1JlbGF0aXZlTGluZU1pbmltdW1Ud28gZXh0ZW5kcyBNb3ZlVG9SZWxhdGl2ZUxpbmUge1xuICBnZXRDb3VudCguLi5hcmdzKSB7XG4gICAgcmV0dXJuIHRoaXMudXRpbHMubGltaXROdW1iZXIoc3VwZXIuZ2V0Q291bnQoLi4uYXJncyksIHttaW46IDJ9KVxuICB9XG59XG5Nb3ZlVG9SZWxhdGl2ZUxpbmVNaW5pbXVtVHdvLnJlZ2lzdGVyKGZhbHNlKVxuXG4vLyBQb3NpdGlvbiBjdXJzb3Igd2l0aG91dCBzY3JvbGxpbmcuLCBILCBNLCBMXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBrZXltYXA6IEhcbmNsYXNzIE1vdmVUb1RvcE9mU2NyZWVuIGV4dGVuZHMgTW90aW9uIHtcbiAgd2lzZSA9IFwibGluZXdpc2VcIlxuICBqdW1wID0gdHJ1ZVxuICBkZWZhdWx0Q291bnQgPSAwXG4gIHZlcnRpY2FsTW90aW9uID0gdHJ1ZVxuICB3aGVyZSA9IFwidG9wXCJcblxuICBtb3ZlQ3Vyc29yKGN1cnNvcikge1xuICAgIGNvbnN0IGJ1ZmZlclJvdyA9IHRoaXMuZWRpdG9yLmJ1ZmZlclJvd0ZvclNjcmVlblJvdyh0aGlzLmdldFNjcmVlblJvdygpKVxuICAgIHRoaXMuc2V0Q3Vyc29yQnVmZmVyUm93KGN1cnNvciwgYnVmZmVyUm93KVxuICB9XG5cbiAgZ2V0U2NyZWVuUm93KCkge1xuICAgIGNvbnN0IHtsaW1pdE51bWJlcn0gPSB0aGlzLnV0aWxzXG4gICAgY29uc3QgZmlyc3RWaXNpYmxlUm93ID0gdGhpcy5lZGl0b3IuZ2V0Rmlyc3RWaXNpYmxlU2NyZWVuUm93KClcbiAgICBjb25zdCBsYXN0VmlzaWJsZVJvdyA9IGxpbWl0TnVtYmVyKHRoaXMuZWRpdG9yLmdldExhc3RWaXNpYmxlU2NyZWVuUm93KCksIHttYXg6IHRoaXMuZ2V0VmltTGFzdFNjcmVlblJvdygpfSlcblxuICAgIGNvbnN0IGJhc2VPZmZzZXQgPSAyXG4gICAgaWYgKHRoaXMud2hlcmUgPT09IFwidG9wXCIpIHtcbiAgICAgIGNvbnN0IG9mZnNldCA9IGZpcnN0VmlzaWJsZVJvdyA9PT0gMCA/IDAgOiBiYXNlT2Zmc2V0XG4gICAgICByZXR1cm4gbGltaXROdW1iZXIoZmlyc3RWaXNpYmxlUm93ICsgdGhpcy5nZXRDb3VudCgtMSksIHttaW46IGZpcnN0VmlzaWJsZVJvdyArIG9mZnNldCwgbWF4OiBsYXN0VmlzaWJsZVJvd30pXG4gICAgfSBlbHNlIGlmICh0aGlzLndoZXJlID09PSBcIm1pZGRsZVwiKSB7XG4gICAgICByZXR1cm4gZmlyc3RWaXNpYmxlUm93ICsgTWF0aC5mbG9vcigobGFzdFZpc2libGVSb3cgLSBmaXJzdFZpc2libGVSb3cpIC8gMilcbiAgICB9IGVsc2UgaWYgKHRoaXMud2hlcmUgPT09IFwiYm90dG9tXCIpIHtcbiAgICAgIGNvbnN0IG9mZnNldCA9IGxhc3RWaXNpYmxlUm93ID09PSB0aGlzLmdldFZpbUxhc3RTY3JlZW5Sb3coKSA/IDAgOiBiYXNlT2Zmc2V0ICsgMVxuICAgICAgcmV0dXJuIGxpbWl0TnVtYmVyKGxhc3RWaXNpYmxlUm93IC0gdGhpcy5nZXRDb3VudCgtMSksIHttaW46IGZpcnN0VmlzaWJsZVJvdywgbWF4OiBsYXN0VmlzaWJsZVJvdyAtIG9mZnNldH0pXG4gICAgfVxuICB9XG59XG5Nb3ZlVG9Ub3BPZlNjcmVlbi5yZWdpc3RlcigpXG5cbi8vIGtleW1hcDogTVxuY2xhc3MgTW92ZVRvTWlkZGxlT2ZTY3JlZW4gZXh0ZW5kcyBNb3ZlVG9Ub3BPZlNjcmVlbiB7XG4gIHdoZXJlID0gXCJtaWRkbGVcIlxufVxuTW92ZVRvTWlkZGxlT2ZTY3JlZW4ucmVnaXN0ZXIoKVxuXG4vLyBrZXltYXA6IExcbmNsYXNzIE1vdmVUb0JvdHRvbU9mU2NyZWVuIGV4dGVuZHMgTW92ZVRvVG9wT2ZTY3JlZW4ge1xuICB3aGVyZSA9IFwiYm90dG9tXCJcbn1cbk1vdmVUb0JvdHRvbU9mU2NyZWVuLnJlZ2lzdGVyKClcblxuLy8gU2Nyb2xsaW5nXG4vLyBIYWxmOiBjdHJsLWQsIGN0cmwtdVxuLy8gRnVsbDogY3RybC1mLCBjdHJsLWJcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFtGSVhNRV0gY291bnQgYmVoYXZlIGRpZmZlcmVudGx5IGZyb20gb3JpZ2luYWwgVmltLlxuY2xhc3MgU2Nyb2xsIGV4dGVuZHMgTW90aW9uIHtcbiAgc3RhdGljIHNjcm9sbFRhc2sgPSBudWxsXG4gIHZlcnRpY2FsTW90aW9uID0gdHJ1ZVxuXG4gIGlzU21vb3RoU2Nyb2xsRW5hYmxlZCgpIHtcbiAgICByZXR1cm4gTWF0aC5hYnModGhpcy5hbW91bnRPZlBhZ2UpID09PSAxXG4gICAgICA/IHRoaXMuZ2V0Q29uZmlnKFwic21vb3RoU2Nyb2xsT25GdWxsU2Nyb2xsTW90aW9uXCIpXG4gICAgICA6IHRoaXMuZ2V0Q29uZmlnKFwic21vb3RoU2Nyb2xsT25IYWxmU2Nyb2xsTW90aW9uXCIpXG4gIH1cblxuICBnZXRTbW9vdGhTY3JvbGxEdWF0aW9uKCkge1xuICAgIHJldHVybiBNYXRoLmFicyh0aGlzLmFtb3VudE9mUGFnZSkgPT09IDFcbiAgICAgID8gdGhpcy5nZXRDb25maWcoXCJzbW9vdGhTY3JvbGxPbkZ1bGxTY3JvbGxNb3Rpb25EdXJhdGlvblwiKVxuICAgICAgOiB0aGlzLmdldENvbmZpZyhcInNtb290aFNjcm9sbE9uSGFsZlNjcm9sbE1vdGlvbkR1cmF0aW9uXCIpXG4gIH1cblxuICBtb3ZlQ3Vyc29yKGN1cnNvcikge1xuICAgIGNvbnN0IHNjcmVlblJvdyA9IHRoaXMudXRpbHMuZ2V0VmFsaWRWaW1TY3JlZW5Sb3codGhpcy5lZGl0b3IsIGN1cnNvci5nZXRTY3JlZW5Sb3coKSArIHRoaXMuYW1vdW50T2ZSb3dzVG9TY3JvbGwpXG4gICAgdGhpcy5zZXRDdXJzb3JCdWZmZXJSb3coY3Vyc29yLCB0aGlzLmVkaXRvci5idWZmZXJSb3dGb3JTY3JlZW5Sb3coc2NyZWVuUm93KSwge2F1dG9zY3JvbGw6IGZhbHNlfSlcbiAgfVxuXG4gIGV4ZWN1dGUoKSB7XG4gICAgdGhpcy5hbW91bnRPZlJvd3NUb1Njcm9sbCA9IE1hdGguY2VpbCh0aGlzLmFtb3VudE9mUGFnZSAqIHRoaXMuZWRpdG9yLmdldFJvd3NQZXJQYWdlKCkgKiB0aGlzLmdldENvdW50KCkpXG4gICAgc3VwZXIuZXhlY3V0ZSgpXG4gICAgY29uc3QgZHVyYXRpb24gPSB0aGlzLmlzU21vb3RoU2Nyb2xsRW5hYmxlZCgpID8gdGhpcy5nZXRTbW9vdGhTY3JvbGxEdWF0aW9uKCkgOiAwXG4gICAgdGhpcy52aW1TdGF0ZS5yZXF1ZXN0U2Nyb2xsKHthbW91bnRPZlNjcmVlblJvd3M6IHRoaXMuYW1vdW50T2ZSb3dzVG9TY3JvbGwsIGR1cmF0aW9ufSlcbiAgfVxufVxuU2Nyb2xsLnJlZ2lzdGVyKGZhbHNlKVxuXG4vLyBrZXltYXA6IGN0cmwtZlxuY2xhc3MgU2Nyb2xsRnVsbFNjcmVlbkRvd24gZXh0ZW5kcyBTY3JvbGwge1xuICBhbW91bnRPZlBhZ2UgPSArMVxufVxuU2Nyb2xsRnVsbFNjcmVlbkRvd24ucmVnaXN0ZXIoKVxuXG4vLyBrZXltYXA6IGN0cmwtYlxuY2xhc3MgU2Nyb2xsRnVsbFNjcmVlblVwIGV4dGVuZHMgU2Nyb2xsIHtcbiAgYW1vdW50T2ZQYWdlID0gLTFcbn1cblNjcm9sbEZ1bGxTY3JlZW5VcC5yZWdpc3RlcigpXG5cbi8vIGtleW1hcDogY3RybC1kXG5jbGFzcyBTY3JvbGxIYWxmU2NyZWVuRG93biBleHRlbmRzIFNjcm9sbCB7XG4gIGFtb3VudE9mUGFnZSA9ICsxIC8gMlxufVxuU2Nyb2xsSGFsZlNjcmVlbkRvd24ucmVnaXN0ZXIoKVxuXG4vLyBrZXltYXA6IGN0cmwtdVxuY2xhc3MgU2Nyb2xsSGFsZlNjcmVlblVwIGV4dGVuZHMgU2Nyb2xsIHtcbiAgYW1vdW50T2ZQYWdlID0gLTEgLyAyXG59XG5TY3JvbGxIYWxmU2NyZWVuVXAucmVnaXN0ZXIoKVxuXG4vLyBrZXltYXA6IGcgY3RybC1kXG5jbGFzcyBTY3JvbGxRdWFydGVyU2NyZWVuRG93biBleHRlbmRzIFNjcm9sbCB7XG4gIGFtb3VudE9mUGFnZSA9ICsxIC8gNFxufVxuU2Nyb2xsUXVhcnRlclNjcmVlbkRvd24ucmVnaXN0ZXIoKVxuXG4vLyBrZXltYXA6IGcgY3RybC11XG5jbGFzcyBTY3JvbGxRdWFydGVyU2NyZWVuVXAgZXh0ZW5kcyBTY3JvbGwge1xuICBhbW91bnRPZlBhZ2UgPSAtMSAvIDRcbn1cblNjcm9sbFF1YXJ0ZXJTY3JlZW5VcC5yZWdpc3RlcigpXG5cbi8vIEZpbmRcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIGtleW1hcDogZlxuY2xhc3MgRmluZCBleHRlbmRzIE1vdGlvbiB7XG4gIGJhY2t3YXJkcyA9IGZhbHNlXG4gIGluY2x1c2l2ZSA9IHRydWVcbiAgb2Zmc2V0ID0gMFxuICByZXF1aXJlSW5wdXQgPSB0cnVlXG4gIGNhc2VTZW5zaXRpdml0eUtpbmQgPSBcIkZpbmRcIlxuXG4gIHJlc3RvcmVFZGl0b3JTdGF0ZSgpIHtcbiAgICBpZiAodGhpcy5fcmVzdG9yZUVkaXRvclN0YXRlKSB0aGlzLl9yZXN0b3JlRWRpdG9yU3RhdGUoKVxuICAgIHRoaXMuX3Jlc3RvcmVFZGl0b3JTdGF0ZSA9IG51bGxcbiAgfVxuXG4gIGNhbmNlbE9wZXJhdGlvbigpIHtcbiAgICB0aGlzLnJlc3RvcmVFZGl0b3JTdGF0ZSgpXG4gICAgc3VwZXIuY2FuY2VsT3BlcmF0aW9uKClcbiAgfVxuXG4gIGluaXRpYWxpemUoKSB7XG4gICAgaWYgKHRoaXMuZ2V0Q29uZmlnKFwicmV1c2VGaW5kRm9yUmVwZWF0RmluZFwiKSkgdGhpcy5yZXBlYXRJZk5lY2Vzc2FyeSgpXG5cbiAgICBpZiAoIXRoaXMucmVwZWF0ZWQpIHtcbiAgICAgIGNvbnN0IGNoYXJzTWF4ID0gdGhpcy5nZXRDb25maWcoXCJmaW5kQ2hhcnNNYXhcIilcbiAgICAgIGNvbnN0IG9wdGlvbnNCYXNlID0ge3B1cnBvc2U6IFwiZmluZFwiLCBjaGFyc01heH1cblxuICAgICAgaWYgKGNoYXJzTWF4ID09PSAxKSB7XG4gICAgICAgIHRoaXMuZm9jdXNJbnB1dChvcHRpb25zQmFzZSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX3Jlc3RvcmVFZGl0b3JTdGF0ZSA9IHRoaXMudXRpbHMuc2F2ZUVkaXRvclN0YXRlKHRoaXMuZWRpdG9yKVxuICAgICAgICBjb25zdCBvcHRpb25zID0ge1xuICAgICAgICAgIGF1dG9Db25maXJtVGltZW91dDogdGhpcy5nZXRDb25maWcoXCJmaW5kQ29uZmlybUJ5VGltZW91dFwiKSxcbiAgICAgICAgICBvbkNvbmZpcm06IGlucHV0ID0+IHtcbiAgICAgICAgICAgIHRoaXMuaW5wdXQgPSBpbnB1dFxuICAgICAgICAgICAgaWYgKGlucHV0KSB0aGlzLnByb2Nlc3NPcGVyYXRpb24oKVxuICAgICAgICAgICAgZWxzZSB0aGlzLmNhbmNlbE9wZXJhdGlvbigpXG4gICAgICAgICAgfSxcbiAgICAgICAgICBvbkNoYW5nZTogcHJlQ29uZmlybWVkQ2hhcnMgPT4ge1xuICAgICAgICAgICAgdGhpcy5wcmVDb25maXJtZWRDaGFycyA9IHByZUNvbmZpcm1lZENoYXJzXG4gICAgICAgICAgICB0aGlzLmhpZ2hsaWdodFRleHRJbkN1cnNvclJvd3ModGhpcy5wcmVDb25maXJtZWRDaGFycywgXCJwcmUtY29uZmlybVwiLCB0aGlzLmlzQmFja3dhcmRzKCkpXG4gICAgICAgICAgfSxcbiAgICAgICAgICBvbkNhbmNlbDogKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy52aW1TdGF0ZS5oaWdobGlnaHRGaW5kLmNsZWFyTWFya2VycygpXG4gICAgICAgICAgICB0aGlzLmNhbmNlbE9wZXJhdGlvbigpXG4gICAgICAgICAgfSxcbiAgICAgICAgICBjb21tYW5kczoge1xuICAgICAgICAgICAgXCJ2aW0tbW9kZS1wbHVzOmZpbmQtbmV4dC1wcmUtY29uZmlybWVkXCI6ICgpID0+IHRoaXMuZmluZFByZUNvbmZpcm1lZCgrMSksXG4gICAgICAgICAgICBcInZpbS1tb2RlLXBsdXM6ZmluZC1wcmV2aW91cy1wcmUtY29uZmlybWVkXCI6ICgpID0+IHRoaXMuZmluZFByZUNvbmZpcm1lZCgtMSksXG4gICAgICAgICAgfSxcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmZvY3VzSW5wdXQoT2JqZWN0LmFzc2lnbihvcHRpb25zLCBvcHRpb25zQmFzZSkpXG4gICAgICB9XG4gICAgfVxuICAgIHN1cGVyLmluaXRpYWxpemUoKVxuICB9XG5cbiAgZmluZFByZUNvbmZpcm1lZChkZWx0YSkge1xuICAgIGlmICh0aGlzLnByZUNvbmZpcm1lZENoYXJzICYmIHRoaXMuZ2V0Q29uZmlnKFwiaGlnaGxpZ2h0RmluZENoYXJcIikpIHtcbiAgICAgIGNvbnN0IGluZGV4ID0gdGhpcy5oaWdobGlnaHRUZXh0SW5DdXJzb3JSb3dzKFxuICAgICAgICB0aGlzLnByZUNvbmZpcm1lZENoYXJzLFxuICAgICAgICBcInByZS1jb25maXJtXCIsXG4gICAgICAgIHRoaXMuaXNCYWNrd2FyZHMoKSxcbiAgICAgICAgdGhpcy5nZXRDb3VudCgtMSkgKyBkZWx0YSxcbiAgICAgICAgdHJ1ZVxuICAgICAgKVxuICAgICAgdGhpcy5jb3VudCA9IGluZGV4ICsgMVxuICAgIH1cbiAgfVxuXG4gIHJlcGVhdElmTmVjZXNzYXJ5KCkge1xuICAgIGNvbnN0IGZpbmRDb21tYW5kTmFtZXMgPSBbXCJGaW5kXCIsIFwiRmluZEJhY2t3YXJkc1wiLCBcIlRpbGxcIiwgXCJUaWxsQmFja3dhcmRzXCJdXG4gICAgY29uc3QgY3VycmVudEZpbmQgPSB0aGlzLmdsb2JhbFN0YXRlLmdldChcImN1cnJlbnRGaW5kXCIpXG4gICAgaWYgKGN1cnJlbnRGaW5kICYmIGZpbmRDb21tYW5kTmFtZXMuaW5jbHVkZXModGhpcy52aW1TdGF0ZS5vcGVyYXRpb25TdGFjay5nZXRMYXN0Q29tbWFuZE5hbWUoKSkpIHtcbiAgICAgIHRoaXMuaW5wdXQgPSBjdXJyZW50RmluZC5pbnB1dFxuICAgICAgdGhpcy5yZXBlYXRlZCA9IHRydWVcbiAgICB9XG4gIH1cblxuICBpc0JhY2t3YXJkcygpIHtcbiAgICByZXR1cm4gdGhpcy5iYWNrd2FyZHNcbiAgfVxuXG4gIGV4ZWN1dGUoKSB7XG4gICAgc3VwZXIuZXhlY3V0ZSgpXG4gICAgbGV0IGRlY29yYXRpb25UeXBlID0gXCJwb3N0LWNvbmZpcm1cIlxuICAgIGlmICh0aGlzLm9wZXJhdG9yICYmICF0aGlzLm9wZXJhdG9yLmluc3RhbmNlb2YoXCJTZWxlY3RCYXNlXCIpKSB7XG4gICAgICBkZWNvcmF0aW9uVHlwZSArPSBcIiBsb25nXCJcbiAgICB9XG5cbiAgICAvLyBIQUNLOiBXaGVuIHJlcGVhdGVkIGJ5IFwiLFwiLCB0aGlzLmJhY2t3YXJkcyBpcyB0ZW1wb3JhcnkgaW52ZXJ0ZWQgYW5kXG4gICAgLy8gcmVzdG9yZWQgYWZ0ZXIgZXhlY3V0aW9uIGZpbmlzaGVkLlxuICAgIC8vIEJ1dCBmaW5hbCBoaWdobGlnaHRUZXh0SW5DdXJzb3JSb3dzIGlzIGV4ZWN1dGVkIGluIGFzeW5jKD1hZnRlciBvcGVyYXRpb24gZmluaXNoZWQpLlxuICAgIC8vIFRodXMgd2UgbmVlZCB0byBwcmVzZXJ2ZSBiZWZvcmUgcmVzdG9yZWQgYGJhY2t3YXJkc2AgdmFsdWUgYW5kIHBhc3MgaXQuXG4gICAgY29uc3QgYmFja3dhcmRzID0gdGhpcy5pc0JhY2t3YXJkcygpXG4gICAgdGhpcy5lZGl0b3IuY29tcG9uZW50LmdldE5leHRVcGRhdGVQcm9taXNlKCkudGhlbigoKSA9PiB7XG4gICAgICB0aGlzLmhpZ2hsaWdodFRleHRJbkN1cnNvclJvd3ModGhpcy5pbnB1dCwgZGVjb3JhdGlvblR5cGUsIGJhY2t3YXJkcylcbiAgICB9KVxuICB9XG5cbiAgZ2V0UG9pbnQoZnJvbVBvaW50KSB7XG4gICAgY29uc3Qgc2NhblJhbmdlID0gdGhpcy5lZGl0b3IuYnVmZmVyUmFuZ2VGb3JCdWZmZXJSb3coZnJvbVBvaW50LnJvdylcbiAgICBjb25zdCBwb2ludHMgPSBbXVxuICAgIGNvbnN0IHJlZ2V4ID0gdGhpcy5nZXRSZWdleCh0aGlzLmlucHV0KVxuICAgIGNvbnN0IGluZGV4V2FudEFjY2VzcyA9IHRoaXMuZ2V0Q291bnQoLTEpXG5cbiAgICBjb25zdCB0cmFuc2xhdGlvbiA9IG5ldyBQb2ludCgwLCB0aGlzLmlzQmFja3dhcmRzKCkgPyB0aGlzLm9mZnNldCA6IC10aGlzLm9mZnNldClcbiAgICBpZiAodGhpcy5yZXBlYXRlZCkge1xuICAgICAgZnJvbVBvaW50ID0gZnJvbVBvaW50LnRyYW5zbGF0ZSh0cmFuc2xhdGlvbi5uZWdhdGUoKSlcbiAgICB9XG5cbiAgICBpZiAodGhpcy5pc0JhY2t3YXJkcygpKSB7XG4gICAgICBpZiAodGhpcy5nZXRDb25maWcoXCJmaW5kQWNyb3NzTGluZXNcIikpIHNjYW5SYW5nZS5zdGFydCA9IFBvaW50LlpFUk9cblxuICAgICAgdGhpcy5lZGl0b3IuYmFja3dhcmRzU2NhbkluQnVmZmVyUmFuZ2UocmVnZXgsIHNjYW5SYW5nZSwgKHtyYW5nZSwgc3RvcH0pID0+IHtcbiAgICAgICAgaWYgKHJhbmdlLnN0YXJ0LmlzTGVzc1RoYW4oZnJvbVBvaW50KSkge1xuICAgICAgICAgIHBvaW50cy5wdXNoKHJhbmdlLnN0YXJ0KVxuICAgICAgICAgIGlmIChwb2ludHMubGVuZ3RoID4gaW5kZXhXYW50QWNjZXNzKSB7XG4gICAgICAgICAgICBzdG9wKClcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICh0aGlzLmdldENvbmZpZyhcImZpbmRBY3Jvc3NMaW5lc1wiKSkgc2NhblJhbmdlLmVuZCA9IHRoaXMuZWRpdG9yLmdldEVvZkJ1ZmZlclBvc2l0aW9uKClcbiAgICAgIHRoaXMuZWRpdG9yLnNjYW5JbkJ1ZmZlclJhbmdlKHJlZ2V4LCBzY2FuUmFuZ2UsICh7cmFuZ2UsIHN0b3B9KSA9PiB7XG4gICAgICAgIGlmIChyYW5nZS5zdGFydC5pc0dyZWF0ZXJUaGFuKGZyb21Qb2ludCkpIHtcbiAgICAgICAgICBwb2ludHMucHVzaChyYW5nZS5zdGFydClcbiAgICAgICAgICBpZiAocG9pbnRzLmxlbmd0aCA+IGluZGV4V2FudEFjY2Vzcykge1xuICAgICAgICAgICAgc3RvcCgpXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH1cblxuICAgIGNvbnN0IHBvaW50ID0gcG9pbnRzW2luZGV4V2FudEFjY2Vzc11cbiAgICBpZiAocG9pbnQpIHJldHVybiBwb2ludC50cmFuc2xhdGUodHJhbnNsYXRpb24pXG4gIH1cblxuICAvLyBGSVhNRTogYmFkIG5hbWluZywgdGhpcyBmdW5jdGlvbiBtdXN0IHJldHVybiBpbmRleFxuICBoaWdobGlnaHRUZXh0SW5DdXJzb3JSb3dzKHRleHQsIGRlY29yYXRpb25UeXBlLCBiYWNrd2FyZHMsIGluZGV4ID0gdGhpcy5nZXRDb3VudCgtMSksIGFkanVzdEluZGV4ID0gZmFsc2UpIHtcbiAgICBpZiAoIXRoaXMuZ2V0Q29uZmlnKFwiaGlnaGxpZ2h0RmluZENoYXJcIikpIHJldHVyblxuXG4gICAgcmV0dXJuIHRoaXMudmltU3RhdGUuaGlnaGxpZ2h0RmluZC5oaWdobGlnaHRDdXJzb3JSb3dzKFxuICAgICAgdGhpcy5nZXRSZWdleCh0ZXh0KSxcbiAgICAgIGRlY29yYXRpb25UeXBlLFxuICAgICAgYmFja3dhcmRzLFxuICAgICAgdGhpcy5vZmZzZXQsXG4gICAgICBpbmRleCxcbiAgICAgIGFkanVzdEluZGV4XG4gICAgKVxuICB9XG5cbiAgbW92ZUN1cnNvcihjdXJzb3IpIHtcbiAgICBjb25zdCBwb2ludCA9IHRoaXMuZ2V0UG9pbnQoY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKCkpXG4gICAgaWYgKHBvaW50KSBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24ocG9pbnQpXG4gICAgZWxzZSB0aGlzLnJlc3RvcmVFZGl0b3JTdGF0ZSgpXG5cbiAgICBpZiAoIXRoaXMucmVwZWF0ZWQpIHRoaXMuZ2xvYmFsU3RhdGUuc2V0KFwiY3VycmVudEZpbmRcIiwgdGhpcylcbiAgfVxuXG4gIGdldFJlZ2V4KHRlcm0pIHtcbiAgICBjb25zdCBtb2RpZmllcnMgPSB0aGlzLmlzQ2FzZVNlbnNpdGl2ZSh0ZXJtKSA/IFwiZ1wiIDogXCJnaVwiXG4gICAgcmV0dXJuIG5ldyBSZWdFeHAoXy5lc2NhcGVSZWdFeHAodGVybSksIG1vZGlmaWVycylcbiAgfVxufVxuRmluZC5yZWdpc3RlcigpXG5cbi8vIGtleW1hcDogRlxuY2xhc3MgRmluZEJhY2t3YXJkcyBleHRlbmRzIEZpbmQge1xuICBpbmNsdXNpdmUgPSBmYWxzZVxuICBiYWNrd2FyZHMgPSB0cnVlXG59XG5GaW5kQmFja3dhcmRzLnJlZ2lzdGVyKClcblxuLy8ga2V5bWFwOiB0XG5jbGFzcyBUaWxsIGV4dGVuZHMgRmluZCB7XG4gIG9mZnNldCA9IDFcbiAgZ2V0UG9pbnQoLi4uYXJncykge1xuICAgIGNvbnN0IHBvaW50ID0gc3VwZXIuZ2V0UG9pbnQoLi4uYXJncylcbiAgICB0aGlzLm1vdmVTdWNjZWVkZWQgPSBwb2ludCAhPSBudWxsXG4gICAgcmV0dXJuIHBvaW50XG4gIH1cbn1cblRpbGwucmVnaXN0ZXIoKVxuXG4vLyBrZXltYXA6IFRcbmNsYXNzIFRpbGxCYWNrd2FyZHMgZXh0ZW5kcyBUaWxsIHtcbiAgaW5jbHVzaXZlID0gZmFsc2VcbiAgYmFja3dhcmRzID0gdHJ1ZVxufVxuVGlsbEJhY2t3YXJkcy5yZWdpc3RlcigpXG5cbi8vIE1hcmtcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIGtleW1hcDogYFxuY2xhc3MgTW92ZVRvTWFyayBleHRlbmRzIE1vdGlvbiB7XG4gIGp1bXAgPSB0cnVlXG4gIHJlcXVpcmVJbnB1dCA9IHRydWVcbiAgaW5wdXQgPSBudWxsXG4gIG1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lID0gZmFsc2VcblxuICBpbml0aWFsaXplKCkge1xuICAgIHRoaXMucmVhZENoYXIoKVxuICAgIHN1cGVyLmluaXRpYWxpemUoKVxuICB9XG5cbiAgZ2V0UG9pbnQoKSB7XG4gICAgY29uc3QgcG9pbnQgPSB0aGlzLnZpbVN0YXRlLm1hcmsuZ2V0KHRoaXMuaW5wdXQpXG4gICAgaWYgKHBvaW50KSB7XG4gICAgICByZXR1cm4gdGhpcy5tb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZSA/IHRoaXMuZ2V0Rmlyc3RDaGFyYWN0ZXJQb3NpdGlvbkZvckJ1ZmZlclJvdyhwb2ludC5yb3cpIDogcG9pbnRcbiAgICB9XG4gIH1cblxuICBtb3ZlQ3Vyc29yKGN1cnNvcikge1xuICAgIGNvbnN0IHBvaW50ID0gdGhpcy5nZXRQb2ludCgpXG4gICAgaWYgKHBvaW50KSB7XG4gICAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24ocG9pbnQpXG4gICAgICBjdXJzb3IuYXV0b3Njcm9sbCh7Y2VudGVyOiB0cnVlfSlcbiAgICB9XG4gIH1cbn1cbk1vdmVUb01hcmsucmVnaXN0ZXIoKVxuXG4vLyBrZXltYXA6ICdcbmNsYXNzIE1vdmVUb01hcmtMaW5lIGV4dGVuZHMgTW92ZVRvTWFyayB7XG4gIHdpc2UgPSBcImxpbmV3aXNlXCJcbiAgbW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmUgPSB0cnVlXG59XG5Nb3ZlVG9NYXJrTGluZS5yZWdpc3RlcigpXG5cbi8vIEZvbGRcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIE1vdmVUb1ByZXZpb3VzRm9sZFN0YXJ0IGV4dGVuZHMgTW90aW9uIHtcbiAgd2lzZSA9IFwiY2hhcmFjdGVyd2lzZVwiXG4gIHdoaWNoID0gXCJzdGFydFwiXG4gIGRpcmVjdGlvbiA9IFwicHJldmlvdXNcIlxuXG4gIGV4ZWN1dGUoKSB7XG4gICAgdGhpcy5yb3dzID0gdGhpcy5nZXRGb2xkUm93cyh0aGlzLndoaWNoKVxuICAgIGlmICh0aGlzLmRpcmVjdGlvbiA9PT0gXCJwcmV2aW91c1wiKSB0aGlzLnJvd3MucmV2ZXJzZSgpXG4gICAgc3VwZXIuZXhlY3V0ZSgpXG4gIH1cblxuICBnZXRGb2xkUm93cyh3aGljaCkge1xuICAgIGNvbnN0IHRvUm93ID0gKFtzdGFydFJvdywgZW5kUm93XSkgPT4gKHdoaWNoID09PSBcInN0YXJ0XCIgPyBzdGFydFJvdyA6IGVuZFJvdylcbiAgICBjb25zdCByb3dzID0gdGhpcy51dGlscy5nZXRDb2RlRm9sZFJvd1Jhbmdlcyh0aGlzLmVkaXRvcikubWFwKHRvUm93KVxuICAgIHJldHVybiBfLnNvcnRCeShfLnVuaXEocm93cyksIHJvdyA9PiByb3cpXG4gIH1cblxuICBnZXRTY2FuUm93cyhjdXJzb3IpIHtcbiAgICBjb25zdCBjdXJzb3JSb3cgPSBjdXJzb3IuZ2V0QnVmZmVyUm93KClcbiAgICBjb25zdCBpc1ZhbGQgPSB0aGlzLmRpcmVjdGlvbiA9PT0gXCJwcmV2aW91c1wiID8gcm93ID0+IHJvdyA8IGN1cnNvclJvdyA6IHJvdyA9PiByb3cgPiBjdXJzb3JSb3dcbiAgICByZXR1cm4gdGhpcy5yb3dzLmZpbHRlcihpc1ZhbGQpXG4gIH1cblxuICBkZXRlY3RSb3coY3Vyc29yKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0U2NhblJvd3MoY3Vyc29yKVswXVxuICB9XG5cbiAgbW92ZUN1cnNvcihjdXJzb3IpIHtcbiAgICB0aGlzLm1vdmVDdXJzb3JDb3VudFRpbWVzKGN1cnNvciwgKCkgPT4ge1xuICAgICAgY29uc3Qgcm93ID0gdGhpcy5kZXRlY3RSb3coY3Vyc29yKVxuICAgICAgaWYgKHJvdyAhPSBudWxsKSB0aGlzLnV0aWxzLm1vdmVDdXJzb3JUb0ZpcnN0Q2hhcmFjdGVyQXRSb3coY3Vyc29yLCByb3cpXG4gICAgfSlcbiAgfVxufVxuTW92ZVRvUHJldmlvdXNGb2xkU3RhcnQucmVnaXN0ZXIoKVxuXG5jbGFzcyBNb3ZlVG9OZXh0Rm9sZFN0YXJ0IGV4dGVuZHMgTW92ZVRvUHJldmlvdXNGb2xkU3RhcnQge1xuICBkaXJlY3Rpb24gPSBcIm5leHRcIlxufVxuTW92ZVRvTmV4dEZvbGRTdGFydC5yZWdpc3RlcigpXG5cbmNsYXNzIE1vdmVUb1ByZXZpb3VzRm9sZFN0YXJ0V2l0aFNhbWVJbmRlbnQgZXh0ZW5kcyBNb3ZlVG9QcmV2aW91c0ZvbGRTdGFydCB7XG4gIGRldGVjdFJvdyhjdXJzb3IpIHtcbiAgICBjb25zdCBiYXNlSW5kZW50TGV2ZWwgPSB0aGlzLmVkaXRvci5pbmRlbnRhdGlvbkZvckJ1ZmZlclJvdyhjdXJzb3IuZ2V0QnVmZmVyUm93KCkpXG4gICAgcmV0dXJuIHRoaXMuZ2V0U2NhblJvd3MoY3Vyc29yKS5maW5kKHJvdyA9PiB0aGlzLmVkaXRvci5pbmRlbnRhdGlvbkZvckJ1ZmZlclJvdyhyb3cpID09PSBiYXNlSW5kZW50TGV2ZWwpXG4gIH1cbn1cbk1vdmVUb1ByZXZpb3VzRm9sZFN0YXJ0V2l0aFNhbWVJbmRlbnQucmVnaXN0ZXIoKVxuXG5jbGFzcyBNb3ZlVG9OZXh0Rm9sZFN0YXJ0V2l0aFNhbWVJbmRlbnQgZXh0ZW5kcyBNb3ZlVG9QcmV2aW91c0ZvbGRTdGFydFdpdGhTYW1lSW5kZW50IHtcbiAgZGlyZWN0aW9uID0gXCJuZXh0XCJcbn1cbk1vdmVUb05leHRGb2xkU3RhcnRXaXRoU2FtZUluZGVudC5yZWdpc3RlcigpXG5cbmNsYXNzIE1vdmVUb1ByZXZpb3VzRm9sZEVuZCBleHRlbmRzIE1vdmVUb1ByZXZpb3VzRm9sZFN0YXJ0IHtcbiAgd2hpY2ggPSBcImVuZFwiXG59XG5Nb3ZlVG9QcmV2aW91c0ZvbGRFbmQucmVnaXN0ZXIoKVxuXG5jbGFzcyBNb3ZlVG9OZXh0Rm9sZEVuZCBleHRlbmRzIE1vdmVUb1ByZXZpb3VzRm9sZEVuZCB7XG4gIGRpcmVjdGlvbiA9IFwibmV4dFwiXG59XG5Nb3ZlVG9OZXh0Rm9sZEVuZC5yZWdpc3RlcigpXG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIE1vdmVUb1ByZXZpb3VzRnVuY3Rpb24gZXh0ZW5kcyBNb3ZlVG9QcmV2aW91c0ZvbGRTdGFydCB7XG4gIGRpcmVjdGlvbiA9IFwicHJldmlvdXNcIlxuICBkZXRlY3RSb3coY3Vyc29yKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0U2NhblJvd3MoY3Vyc29yKS5maW5kKHJvdyA9PiB0aGlzLnV0aWxzLmlzSW5jbHVkZUZ1bmN0aW9uU2NvcGVGb3JSb3codGhpcy5lZGl0b3IsIHJvdykpXG4gIH1cbn1cbk1vdmVUb1ByZXZpb3VzRnVuY3Rpb24ucmVnaXN0ZXIoKVxuXG5jbGFzcyBNb3ZlVG9OZXh0RnVuY3Rpb24gZXh0ZW5kcyBNb3ZlVG9QcmV2aW91c0Z1bmN0aW9uIHtcbiAgZGlyZWN0aW9uID0gXCJuZXh0XCJcbn1cbk1vdmVUb05leHRGdW5jdGlvbi5yZWdpc3RlcigpXG5cbi8vIFNjb3BlIGJhc2VkXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBNb3ZlVG9Qb3NpdGlvbkJ5U2NvcGUgZXh0ZW5kcyBNb3Rpb24ge1xuICBkaXJlY3Rpb24gPSBcImJhY2t3YXJkXCJcbiAgc2NvcGUgPSBcIi5cIlxuXG4gIGdldFBvaW50KGZyb21Qb2ludCkge1xuICAgIHJldHVybiB0aGlzLnV0aWxzLmRldGVjdFNjb3BlU3RhcnRQb3NpdGlvbkZvclNjb3BlKHRoaXMuZWRpdG9yLCBmcm9tUG9pbnQsIHRoaXMuZGlyZWN0aW9uLCB0aGlzLnNjb3BlKVxuICB9XG5cbiAgbW92ZUN1cnNvcihjdXJzb3IpIHtcbiAgICB0aGlzLm1vdmVDdXJzb3JDb3VudFRpbWVzKGN1cnNvciwgKCkgPT4ge1xuICAgICAgY29uc3QgcG9pbnQgPSB0aGlzLmdldFBvaW50KGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpKVxuICAgICAgaWYgKHBvaW50KSBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24ocG9pbnQpXG4gICAgfSlcbiAgfVxufVxuTW92ZVRvUG9zaXRpb25CeVNjb3BlLnJlZ2lzdGVyKGZhbHNlKVxuXG5jbGFzcyBNb3ZlVG9QcmV2aW91c1N0cmluZyBleHRlbmRzIE1vdmVUb1Bvc2l0aW9uQnlTY29wZSB7XG4gIGRpcmVjdGlvbiA9IFwiYmFja3dhcmRcIlxuICBzY29wZSA9IFwic3RyaW5nLmJlZ2luXCJcbn1cbk1vdmVUb1ByZXZpb3VzU3RyaW5nLnJlZ2lzdGVyKClcblxuY2xhc3MgTW92ZVRvTmV4dFN0cmluZyBleHRlbmRzIE1vdmVUb1ByZXZpb3VzU3RyaW5nIHtcbiAgZGlyZWN0aW9uID0gXCJmb3J3YXJkXCJcbn1cbk1vdmVUb05leHRTdHJpbmcucmVnaXN0ZXIoKVxuXG5jbGFzcyBNb3ZlVG9QcmV2aW91c051bWJlciBleHRlbmRzIE1vdmVUb1Bvc2l0aW9uQnlTY29wZSB7XG4gIGRpcmVjdGlvbiA9IFwiYmFja3dhcmRcIlxuICBzY29wZSA9IFwiY29uc3RhbnQubnVtZXJpY1wiXG59XG5Nb3ZlVG9QcmV2aW91c051bWJlci5yZWdpc3RlcigpXG5cbmNsYXNzIE1vdmVUb05leHROdW1iZXIgZXh0ZW5kcyBNb3ZlVG9QcmV2aW91c051bWJlciB7XG4gIGRpcmVjdGlvbiA9IFwiZm9yd2FyZFwiXG59XG5Nb3ZlVG9OZXh0TnVtYmVyLnJlZ2lzdGVyKClcblxuY2xhc3MgTW92ZVRvTmV4dE9jY3VycmVuY2UgZXh0ZW5kcyBNb3Rpb24ge1xuICAvLyBFbnN1cmUgdGhpcyBjb21tYW5kIGlzIGF2YWlsYWJsZSB3aGVuIG9ubHkgaGFzLW9jY3VycmVuY2VcbiAgc3RhdGljIGNvbW1hbmRTY29wZSA9IFwiYXRvbS10ZXh0LWVkaXRvci52aW0tbW9kZS1wbHVzLmhhcy1vY2N1cnJlbmNlXCJcbiAganVtcCA9IHRydWVcbiAgZGlyZWN0aW9uID0gXCJuZXh0XCJcblxuICBleGVjdXRlKCkge1xuICAgIHRoaXMucmFuZ2VzID0gdGhpcy51dGlscy5zb3J0UmFuZ2VzKHRoaXMub2NjdXJyZW5jZU1hbmFnZXIuZ2V0TWFya2VycygpLm1hcChtYXJrZXIgPT4gbWFya2VyLmdldEJ1ZmZlclJhbmdlKCkpKVxuICAgIHN1cGVyLmV4ZWN1dGUoKVxuICB9XG5cbiAgbW92ZUN1cnNvcihjdXJzb3IpIHtcbiAgICBjb25zdCByYW5nZSA9IHRoaXMucmFuZ2VzW3RoaXMudXRpbHMuZ2V0SW5kZXgodGhpcy5nZXRJbmRleChjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKSksIHRoaXMucmFuZ2VzKV1cbiAgICBjb25zdCBwb2ludCA9IHJhbmdlLnN0YXJ0XG4gICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHBvaW50LCB7YXV0b3Njcm9sbDogZmFsc2V9KVxuXG4gICAgdGhpcy5lZGl0b3IudW5mb2xkQnVmZmVyUm93KHBvaW50LnJvdylcbiAgICBpZiAoY3Vyc29yLmlzTGFzdEN1cnNvcigpKSB7XG4gICAgICB0aGlzLnV0aWxzLnNtYXJ0U2Nyb2xsVG9CdWZmZXJQb3NpdGlvbih0aGlzLmVkaXRvciwgcG9pbnQpXG4gICAgfVxuXG4gICAgaWYgKHRoaXMuZ2V0Q29uZmlnKFwiZmxhc2hPbk1vdmVUb09jY3VycmVuY2VcIikpIHtcbiAgICAgIHRoaXMudmltU3RhdGUuZmxhc2gocmFuZ2UsIHt0eXBlOiBcInNlYXJjaFwifSlcbiAgICB9XG4gIH1cblxuICBnZXRJbmRleChmcm9tUG9pbnQpIHtcbiAgICBjb25zdCBpbmRleCA9IHRoaXMucmFuZ2VzLmZpbmRJbmRleChyYW5nZSA9PiByYW5nZS5zdGFydC5pc0dyZWF0ZXJUaGFuKGZyb21Qb2ludCkpXG4gICAgcmV0dXJuIChpbmRleCA+PSAwID8gaW5kZXggOiAwKSArIHRoaXMuZ2V0Q291bnQoLTEpXG4gIH1cbn1cbk1vdmVUb05leHRPY2N1cnJlbmNlLnJlZ2lzdGVyKClcblxuY2xhc3MgTW92ZVRvUHJldmlvdXNPY2N1cnJlbmNlIGV4dGVuZHMgTW92ZVRvTmV4dE9jY3VycmVuY2Uge1xuICBkaXJlY3Rpb24gPSBcInByZXZpb3VzXCJcblxuICBnZXRJbmRleChmcm9tUG9pbnQpIHtcbiAgICBjb25zdCByYW5nZXMgPSB0aGlzLnJhbmdlcy5zbGljZSgpLnJldmVyc2UoKVxuICAgIGNvbnN0IHJhbmdlID0gcmFuZ2VzLmZpbmQocmFuZ2UgPT4gcmFuZ2UuZW5kLmlzTGVzc1RoYW4oZnJvbVBvaW50KSlcbiAgICBjb25zdCBpbmRleCA9IHJhbmdlID8gdGhpcy5yYW5nZXMuaW5kZXhPZihyYW5nZSkgOiB0aGlzLnJhbmdlcy5sZW5ndGggLSAxXG4gICAgcmV0dXJuIGluZGV4IC0gdGhpcy5nZXRDb3VudCgtMSlcbiAgfVxufVxuTW92ZVRvUHJldmlvdXNPY2N1cnJlbmNlLnJlZ2lzdGVyKClcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8ga2V5bWFwOiAlXG5jbGFzcyBNb3ZlVG9QYWlyIGV4dGVuZHMgTW90aW9uIHtcbiAgaW5jbHVzaXZlID0gdHJ1ZVxuICBqdW1wID0gdHJ1ZVxuICBtZW1iZXIgPSBbXCJQYXJlbnRoZXNpc1wiLCBcIkN1cmx5QnJhY2tldFwiLCBcIlNxdWFyZUJyYWNrZXRcIl1cblxuICBtb3ZlQ3Vyc29yKGN1cnNvcikge1xuICAgIGNvbnN0IHBvaW50ID0gdGhpcy5nZXRQb2ludChjdXJzb3IpXG4gICAgaWYgKHBvaW50KSBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24ocG9pbnQpXG4gIH1cblxuICBnZXRQb2ludEZvclRhZyhwb2ludCkge1xuICAgIGNvbnN0IHBhaXJJbmZvID0gdGhpcy5nZXRJbnN0YW5jZShcIkFUYWdcIikuZ2V0UGFpckluZm8ocG9pbnQpXG4gICAgaWYgKCFwYWlySW5mbykgcmV0dXJuXG5cbiAgICBsZXQge29wZW5SYW5nZSwgY2xvc2VSYW5nZX0gPSBwYWlySW5mb1xuICAgIG9wZW5SYW5nZSA9IG9wZW5SYW5nZS50cmFuc2xhdGUoWzAsICsxXSwgWzAsIC0xXSlcbiAgICBjbG9zZVJhbmdlID0gY2xvc2VSYW5nZS50cmFuc2xhdGUoWzAsICsxXSwgWzAsIC0xXSlcbiAgICBpZiAob3BlblJhbmdlLmNvbnRhaW5zUG9pbnQocG9pbnQpICYmICFwb2ludC5pc0VxdWFsKG9wZW5SYW5nZS5lbmQpKSB7XG4gICAgICByZXR1cm4gY2xvc2VSYW5nZS5zdGFydFxuICAgIH1cbiAgICBpZiAoY2xvc2VSYW5nZS5jb250YWluc1BvaW50KHBvaW50KSAmJiAhcG9pbnQuaXNFcXVhbChjbG9zZVJhbmdlLmVuZCkpIHtcbiAgICAgIHJldHVybiBvcGVuUmFuZ2Uuc3RhcnRcbiAgICB9XG4gIH1cblxuICBnZXRQb2ludChjdXJzb3IpIHtcbiAgICBjb25zdCBjdXJzb3JQb3NpdGlvbiA9IGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXG4gICAgY29uc3QgY3Vyc29yUm93ID0gY3Vyc29yUG9zaXRpb24ucm93XG4gICAgY29uc3QgcG9pbnQgPSB0aGlzLmdldFBvaW50Rm9yVGFnKGN1cnNvclBvc2l0aW9uKVxuICAgIGlmIChwb2ludCkgcmV0dXJuIHBvaW50XG5cbiAgICAvLyBBQW55UGFpckFsbG93Rm9yd2FyZGluZyByZXR1cm4gZm9yd2FyZGluZyByYW5nZSBvciBlbmNsb3NpbmcgcmFuZ2UuXG4gICAgY29uc3QgcmFuZ2UgPSB0aGlzLmdldEluc3RhbmNlKFwiQUFueVBhaXJBbGxvd0ZvcndhcmRpbmdcIiwge21lbWJlcjogdGhpcy5tZW1iZXJ9KS5nZXRSYW5nZShjdXJzb3Iuc2VsZWN0aW9uKVxuICAgIGlmICghcmFuZ2UpIHJldHVyblxuXG4gICAgY29uc3Qge3N0YXJ0LCBlbmR9ID0gcmFuZ2VcbiAgICBpZiAoc3RhcnQucm93ID09PSBjdXJzb3JSb3cgJiYgc3RhcnQuaXNHcmVhdGVyVGhhbk9yRXF1YWwoY3Vyc29yUG9zaXRpb24pKSB7XG4gICAgICAvLyBGb3J3YXJkaW5nIHJhbmdlIGZvdW5kXG4gICAgICByZXR1cm4gZW5kLnRyYW5zbGF0ZShbMCwgLTFdKVxuICAgIH0gZWxzZSBpZiAoZW5kLnJvdyA9PT0gY3Vyc29yUG9zaXRpb24ucm93KSB7XG4gICAgICAvLyBFbmNsb3NpbmcgcmFuZ2Ugd2FzIHJldHVybmVkXG4gICAgICAvLyBXZSBtb3ZlIHRvIHN0YXJ0KCBvcGVuLXBhaXIgKSBvbmx5IHdoZW4gY2xvc2UtcGFpciB3YXMgYXQgc2FtZSByb3cgYXMgY3Vyc29yLXJvdy5cbiAgICAgIHJldHVybiBzdGFydFxuICAgIH1cbiAgfVxufVxuTW92ZVRvUGFpci5yZWdpc3RlcigpXG4iXX0=