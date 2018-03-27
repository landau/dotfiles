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
      var isOrWasVisual = this.operator["instanceof"]("SelectBase") || this.name === "CurrentSelection";

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
    this.direction = "up";
  }

  _createClass(MoveUp, [{
    key: "getBufferRow",
    value: function getBufferRow(row) {
      var min = 0;
      var max = this.getVimLastBufferRow();

      if (this.direction === "up") {
        row = this.getFoldStartRowForRow(row) - 1;
        row = this.wrap && row < min ? max : this.utils.limitNumber(row, { min: min });
      } else {
        row = this.getFoldEndRowForRow(row) + 1;
        row = this.wrap && row > max ? min : this.utils.limitNumber(row, { max: max });
      }
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

    this.direction = "down";
  }

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
            if (_this9.operator.name === "Change" && !wasOnWhiteSpace) {
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
        var cursorPosition = cursor.getBufferPosition();

        var point = _this12.direction === "next" ? _this12.getNextStartOfSentence(cursorPosition) : _this12.getPreviousStartOfSentence(cursorPosition);

        cursor.setBufferPosition(point);
      });
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
      var row = this.utils.limitNumber(cursor.getBufferRow() + this.getCount(-1), { max: this.getVimLastBufferRow() });
      var range = this.utils.findRangeInBufferRow(this.editor, /\S|^/, row, { direction: "backward" });
      cursor.setBufferPosition(range ? range.start : new Point(row, 0));
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
      return Math.floor(this.editor.getLastBufferRow() * (percent / 100));
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
    key: "execute",
    value: function execute() {
      this.amountOfRowsToScroll = Math.trunc(this.amountOfPage * this.editor.getRowsPerPage() * this.getCount());

      _get(Object.getPrototypeOf(Scroll.prototype), "execute", this).call(this);

      this.vimState.requestScroll({
        amountOfScreenRows: this.amountOfRowsToScroll,
        duration: this.getSmoothScrollDuation((Math.abs(this.amountOfPage) === 1 ? "Full" : "Half") + "ScrollMotion")
      });
    }
  }, {
    key: "moveCursor",
    value: function moveCursor(cursor) {
      var screenRow = this.getValidVimScreenRow(cursor.getScreenRow() + this.amountOfRowsToScroll);
      this.setCursorBufferRow(cursor, this.editor.bufferRowForScreenRow(screenRow), { autoscroll: false });
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

    this.amountOfPage = 0.5;
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

    this.amountOfPage = -0.5;
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

    this.amountOfPage = 0.25;
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

    this.amountOfPage = -0.25;
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

        this.editor.backwardsScanInBufferRange(regex, scanRange, function (_ref5) {
          var range = _ref5.range;
          var stop = _ref5.stop;

          if (range.start.isLessThan(fromPoint)) {
            points.push(range.start);
            if (points.length > indexWantAccess) {
              stop();
            }
          }
        });
      } else {
        if (this.getConfig("findAcrossLines")) scanRange.end = this.editor.getEofBufferPosition();
        this.editor.scanInBufferRange(regex, scanRange, function (_ref6) {
          var range = _ref6.range;
          var stop = _ref6.stop;

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
    key: "moveCursor",
    value: function moveCursor(cursor) {
      var point = this.vimState.mark.get(this.input);
      if (point) {
        if (this.moveToFirstCharacterOfLine) {
          point = this.getFirstCharacterPositionForBufferRow(point.row);
        }
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
      var toRow = function toRow(_ref7) {
        var _ref72 = _slicedToArray(_ref7, 2);

        var startRow = _ref72[0];
        var endRow = _ref72[1];
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

var MoveToPreviousFunctionAndRedrawCursorLineAtUpperMiddle = (function (_MoveToPreviousFunction2) {
  _inherits(MoveToPreviousFunctionAndRedrawCursorLineAtUpperMiddle, _MoveToPreviousFunction2);

  function MoveToPreviousFunctionAndRedrawCursorLineAtUpperMiddle() {
    _classCallCheck(this, MoveToPreviousFunctionAndRedrawCursorLineAtUpperMiddle);

    _get(Object.getPrototypeOf(MoveToPreviousFunctionAndRedrawCursorLineAtUpperMiddle.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(MoveToPreviousFunctionAndRedrawCursorLineAtUpperMiddle, [{
    key: "execute",
    value: function execute() {
      _get(Object.getPrototypeOf(MoveToPreviousFunctionAndRedrawCursorLineAtUpperMiddle.prototype), "execute", this).call(this);
      this.getInstance("RedrawCursorLineAtUpperMiddle").execute();
    }
  }]);

  return MoveToPreviousFunctionAndRedrawCursorLineAtUpperMiddle;
})(MoveToPreviousFunction);

MoveToPreviousFunctionAndRedrawCursorLineAtUpperMiddle.register();

var MoveToNextFunctionAndRedrawCursorLineAtUpperMiddle = (function (_MoveToPreviousFunctionAndRedrawCursorLineAtUpperMiddle) {
  _inherits(MoveToNextFunctionAndRedrawCursorLineAtUpperMiddle, _MoveToPreviousFunctionAndRedrawCursorLineAtUpperMiddle);

  function MoveToNextFunctionAndRedrawCursorLineAtUpperMiddle() {
    _classCallCheck(this, MoveToNextFunctionAndRedrawCursorLineAtUpperMiddle);

    _get(Object.getPrototypeOf(MoveToNextFunctionAndRedrawCursorLineAtUpperMiddle.prototype), "constructor", this).apply(this, arguments);

    this.direction = "next";
  }

  return MoveToNextFunctionAndRedrawCursorLineAtUpperMiddle;
})(MoveToPreviousFunctionAndRedrawCursorLineAtUpperMiddle);

MoveToNextFunctionAndRedrawCursorLineAtUpperMiddle.register();

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
    key: "moveCursor",
    value: function moveCursor(cursor) {
      var _this23 = this;

      this.moveCursorCountTimes(cursor, function () {
        var cursorPosition = cursor.getBufferPosition();
        var point = _this23.utils.detectScopeStartPositionForScope(_this23.editor, cursorPosition, _this23.direction, _this23.scope);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL21vdGlvbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxXQUFXLENBQUE7Ozs7Ozs7Ozs7OztBQUVYLElBQU0sQ0FBQyxHQUFHLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFBOztlQUNiLE9BQU8sQ0FBQyxNQUFNLENBQUM7O0lBQS9CLEtBQUssWUFBTCxLQUFLO0lBQUUsS0FBSyxZQUFMLEtBQUs7O0FBRW5CLElBQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQTs7SUFFeEIsTUFBTTtZQUFOLE1BQU07O1dBQU4sTUFBTTswQkFBTixNQUFNOzsrQkFBTixNQUFNOztTQUVWLFFBQVEsR0FBRyxJQUFJO1NBQ2YsU0FBUyxHQUFHLEtBQUs7U0FDakIsSUFBSSxHQUFHLGVBQWU7U0FDdEIsSUFBSSxHQUFHLEtBQUs7U0FDWixjQUFjLEdBQUcsS0FBSztTQUN0QixhQUFhLEdBQUcsSUFBSTtTQUNwQixxQkFBcUIsR0FBRyxLQUFLO1NBQzdCLGVBQWUsR0FBRyxLQUFLO1NBQ3ZCLFlBQVksR0FBRyxLQUFLO1NBQ3BCLG1CQUFtQixHQUFHLElBQUk7OztlQVh0QixNQUFNOztXQWFILG1CQUFHO0FBQ1IsYUFBTyxDQUFDLElBQUksQ0FBQyxZQUFZLElBQUksSUFBSSxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUE7S0FDaEQ7OztXQUVTLHNCQUFHO0FBQ1gsYUFBTyxJQUFJLENBQUMsSUFBSSxLQUFLLFVBQVUsQ0FBQTtLQUNoQzs7O1dBRVUsdUJBQUc7QUFDWixhQUFPLElBQUksQ0FBQyxJQUFJLEtBQUssV0FBVyxDQUFBO0tBQ2pDOzs7V0FFUSxtQkFBQyxJQUFJLEVBQUU7QUFDZCxVQUFJLElBQUksS0FBSyxlQUFlLEVBQUU7QUFDNUIsWUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsSUFBSSxLQUFLLFVBQVUsR0FBRyxLQUFL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VUFBVSxDQUFDLFFBQVEsRUFBRSxDQUFBIiwiZmlsZSI6Ii9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL21vdGlvbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIlwidXNlIGJhYmVsXCJcblxuY29uc3QgXyA9IHJlcXVpcmUoXCJ1bmRlcnNjb3JlLXBsdXNcIilcbmNvbnN0IHtQb2ludCwgUmFuZ2V9ID0gcmVxdWlyZShcImF0b21cIilcblxuY29uc3QgQmFzZSA9IHJlcXVpcmUoXCIuL2Jhc2VcIilcblxuY2xhc3MgTW90aW9uIGV4dGVuZHMgQmFzZSB7XG4gIHN0YXRpYyBvcGVyYXRpb25LaW5kID0gXCJtb3Rpb25cIlxuICBvcGVyYXRvciA9IG51bGxcbiAgaW5jbHVzaXZlID0gZmFsc2VcbiAgd2lzZSA9IFwiY2hhcmFjdGVyd2lzZVwiXG4gIGp1bXAgPSBmYWxzZVxuICB2ZXJ0aWNhbE1vdGlvbiA9IGZhbHNlXG4gIG1vdmVTdWNjZWVkZWQgPSBudWxsXG4gIG1vdmVTdWNjZXNzT25MaW5ld2lzZSA9IGZhbHNlXG4gIHNlbGVjdFN1Y2NlZWRlZCA9IGZhbHNlXG4gIHJlcXVpcmVJbnB1dCA9IGZhbHNlXG4gIGNhc2VTZW5zaXRpdml0eUtpbmQgPSBudWxsXG5cbiAgaXNSZWFkeSgpIHtcbiAgICByZXR1cm4gIXRoaXMucmVxdWlyZUlucHV0IHx8IHRoaXMuaW5wdXQgIT0gbnVsbFxuICB9XG5cbiAgaXNMaW5ld2lzZSgpIHtcbiAgICByZXR1cm4gdGhpcy53aXNlID09PSBcImxpbmV3aXNlXCJcbiAgfVxuXG4gIGlzQmxvY2t3aXNlKCkge1xuICAgIHJldHVybiB0aGlzLndpc2UgPT09IFwiYmxvY2t3aXNlXCJcbiAgfVxuXG4gIGZvcmNlV2lzZSh3aXNlKSB7XG4gICAgaWYgKHdpc2UgPT09IFwiY2hhcmFjdGVyd2lzZVwiKSB7XG4gICAgICB0aGlzLmluY2x1c2l2ZSA9IHRoaXMud2lzZSA9PT0gXCJsaW5ld2lzZVwiID8gZmFsc2UgOiAhdGhpcy5pbmNsdXNpdmVcbiAgICB9XG4gICAgdGhpcy53aXNlID0gd2lzZVxuICB9XG5cbiAgcmVzZXRTdGF0ZSgpIHtcbiAgICB0aGlzLnNlbGVjdFN1Y2NlZWRlZCA9IGZhbHNlXG4gIH1cblxuICBtb3ZlV2l0aFNhdmVKdW1wKGN1cnNvcikge1xuICAgIGNvbnN0IG9yaWdpbmFsUG9zaXRpb24gPSB0aGlzLmp1bXAgJiYgY3Vyc29yLmlzTGFzdEN1cnNvcigpID8gY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKCkgOiB1bmRlZmluZWRcblxuICAgIHRoaXMubW92ZUN1cnNvcihjdXJzb3IpXG5cbiAgICBpZiAob3JpZ2luYWxQb3NpdGlvbiAmJiAhY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKCkuaXNFcXVhbChvcmlnaW5hbFBvc2l0aW9uKSkge1xuICAgICAgdGhpcy52aW1TdGF0ZS5tYXJrLnNldChcImBcIiwgb3JpZ2luYWxQb3NpdGlvbilcbiAgICAgIHRoaXMudmltU3RhdGUubWFyay5zZXQoXCInXCIsIG9yaWdpbmFsUG9zaXRpb24pXG4gICAgfVxuICB9XG5cbiAgZXhlY3V0ZSgpIHtcbiAgICBpZiAodGhpcy5vcGVyYXRvcikge1xuICAgICAgdGhpcy5zZWxlY3QoKVxuICAgIH0gZWxzZSB7XG4gICAgICBmb3IgKGNvbnN0IGN1cnNvciBvZiB0aGlzLmVkaXRvci5nZXRDdXJzb3JzKCkpIHtcbiAgICAgICAgdGhpcy5tb3ZlV2l0aFNhdmVKdW1wKGN1cnNvcilcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5lZGl0b3IubWVyZ2VDdXJzb3JzKClcbiAgICB0aGlzLmVkaXRvci5tZXJnZUludGVyc2VjdGluZ1NlbGVjdGlvbnMoKVxuICB9XG5cbiAgLy8gTk9URTogc2VsZWN0aW9uIGlzIGFscmVhZHkgXCJub3JtYWxpemVkXCIgYmVmb3JlIHRoaXMgZnVuY3Rpb24gaXMgY2FsbGVkLlxuICBzZWxlY3QoKSB7XG4gICAgLy8gbmVlZCB0byBjYXJlIHdhcyB2aXN1YWwgZm9yIGAuYCByZXBlYXRlZC5cbiAgICBjb25zdCBpc09yV2FzVmlzdWFsID0gdGhpcy5vcGVyYXRvci5pbnN0YW5jZW9mKFwiU2VsZWN0QmFzZVwiKSB8fCB0aGlzLm5hbWUgPT09IFwiQ3VycmVudFNlbGVjdGlvblwiXG5cbiAgICBmb3IgKGNvbnN0IHNlbGVjdGlvbiBvZiB0aGlzLmVkaXRvci5nZXRTZWxlY3Rpb25zKCkpIHtcbiAgICAgIHNlbGVjdGlvbi5tb2RpZnlTZWxlY3Rpb24oKCkgPT4gdGhpcy5tb3ZlV2l0aFNhdmVKdW1wKHNlbGVjdGlvbi5jdXJzb3IpKVxuXG4gICAgICBjb25zdCBzZWxlY3RTdWNjZWVkZWQgPVxuICAgICAgICB0aGlzLm1vdmVTdWNjZWVkZWQgIT0gbnVsbFxuICAgICAgICAgID8gdGhpcy5tb3ZlU3VjY2VlZGVkXG4gICAgICAgICAgOiAhc2VsZWN0aW9uLmlzRW1wdHkoKSB8fCAodGhpcy5pc0xpbmV3aXNlKCkgJiYgdGhpcy5tb3ZlU3VjY2Vzc09uTGluZXdpc2UpXG4gICAgICBpZiAoIXRoaXMuc2VsZWN0U3VjY2VlZGVkKSB0aGlzLnNlbGVjdFN1Y2NlZWRlZCA9IHNlbGVjdFN1Y2NlZWRlZFxuXG4gICAgICBpZiAoaXNPcldhc1Zpc3VhbCB8fCAoc2VsZWN0U3VjY2VlZGVkICYmICh0aGlzLmluY2x1c2l2ZSB8fCB0aGlzLmlzTGluZXdpc2UoKSkpKSB7XG4gICAgICAgIGNvbnN0ICRzZWxlY3Rpb24gPSB0aGlzLnN3cmFwKHNlbGVjdGlvbilcbiAgICAgICAgJHNlbGVjdGlvbi5zYXZlUHJvcGVydGllcyh0cnVlKSAvLyBzYXZlIHByb3BlcnR5IG9mIFwiYWxyZWFkeS1ub3JtYWxpemVkLXNlbGVjdGlvblwiXG4gICAgICAgICRzZWxlY3Rpb24uYXBwbHlXaXNlKHRoaXMud2lzZSlcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodGhpcy53aXNlID09PSBcImJsb2Nrd2lzZVwiKSB7XG4gICAgICB0aGlzLnZpbVN0YXRlLmdldExhc3RCbG9ja3dpc2VTZWxlY3Rpb24oKS5hdXRvc2Nyb2xsKClcbiAgICB9XG4gIH1cblxuICBzZXRDdXJzb3JCdWZmZXJSb3coY3Vyc29yLCByb3csIG9wdGlvbnMpIHtcbiAgICBpZiAodGhpcy52ZXJ0aWNhbE1vdGlvbiAmJiAhdGhpcy5nZXRDb25maWcoXCJzdGF5T25WZXJ0aWNhbE1vdGlvblwiKSkge1xuICAgICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHRoaXMuZ2V0Rmlyc3RDaGFyYWN0ZXJQb3NpdGlvbkZvckJ1ZmZlclJvdyhyb3cpLCBvcHRpb25zKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnV0aWxzLnNldEJ1ZmZlclJvdyhjdXJzb3IsIHJvdywgb3B0aW9ucylcbiAgICB9XG4gIH1cblxuICAvLyBbTk9URV1cbiAgLy8gU2luY2UgdGhpcyBmdW5jdGlvbiBjaGVja3MgY3Vyc29yIHBvc2l0aW9uIGNoYW5nZSwgYSBjdXJzb3IgcG9zaXRpb24gTVVTVCBiZVxuICAvLyB1cGRhdGVkIElOIGNhbGxiYWNrKD1mbilcbiAgLy8gVXBkYXRpbmcgcG9pbnQgb25seSBpbiBjYWxsYmFjayBpcyB3cm9uZy11c2Ugb2YgdGhpcyBmdW5jaXRvbixcbiAgLy8gc2luY2UgaXQgc3RvcHMgaW1tZWRpYXRlbHkgYmVjYXVzZSBvZiBub3QgY3Vyc29yIHBvc2l0aW9uIGNoYW5nZS5cbiAgbW92ZUN1cnNvckNvdW50VGltZXMoY3Vyc29yLCBmbikge1xuICAgIGxldCBvbGRQb3NpdGlvbiA9IGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXG4gICAgdGhpcy5jb3VudFRpbWVzKHRoaXMuZ2V0Q291bnQoKSwgc3RhdGUgPT4ge1xuICAgICAgZm4oc3RhdGUpXG4gICAgICBjb25zdCBuZXdQb3NpdGlvbiA9IGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXG4gICAgICBpZiAobmV3UG9zaXRpb24uaXNFcXVhbChvbGRQb3NpdGlvbikpIHN0YXRlLnN0b3AoKVxuICAgICAgb2xkUG9zaXRpb24gPSBuZXdQb3NpdGlvblxuICAgIH0pXG4gIH1cblxuICBpc0Nhc2VTZW5zaXRpdmUodGVybSkge1xuICAgIHJldHVybiB0aGlzLmdldENvbmZpZyhgdXNlU21hcnRjYXNlRm9yJHt0aGlzLmNhc2VTZW5zaXRpdml0eUtpbmR9YClcbiAgICAgID8gdGVybS5zZWFyY2goL1tBLVpdLykgIT09IC0xXG4gICAgICA6ICF0aGlzLmdldENvbmZpZyhgaWdub3JlQ2FzZUZvciR7dGhpcy5jYXNlU2Vuc2l0aXZpdHlLaW5kfWApXG4gIH1cbn1cbk1vdGlvbi5yZWdpc3RlcihmYWxzZSlcblxuLy8gVXNlZCBhcyBvcGVyYXRvcidzIHRhcmdldCBpbiB2aXN1YWwtbW9kZS5cbmNsYXNzIEN1cnJlbnRTZWxlY3Rpb24gZXh0ZW5kcyBNb3Rpb24ge1xuICBzZWxlY3Rpb25FeHRlbnQgPSBudWxsXG4gIGJsb2Nrd2lzZVNlbGVjdGlvbkV4dGVudCA9IG51bGxcbiAgaW5jbHVzaXZlID0gdHJ1ZVxuICBwb2ludEluZm9CeUN1cnNvciA9IG5ldyBNYXAoKVxuXG4gIG1vdmVDdXJzb3IoY3Vyc29yKSB7XG4gICAgaWYgKHRoaXMubW9kZSA9PT0gXCJ2aXN1YWxcIikge1xuICAgICAgdGhpcy5zZWxlY3Rpb25FeHRlbnQgPSB0aGlzLmlzQmxvY2t3aXNlKClcbiAgICAgICAgPyB0aGlzLnN3cmFwKGN1cnNvci5zZWxlY3Rpb24pLmdldEJsb2Nrd2lzZVNlbGVjdGlvbkV4dGVudCgpXG4gICAgICAgIDogdGhpcy5lZGl0b3IuZ2V0U2VsZWN0ZWRCdWZmZXJSYW5nZSgpLmdldEV4dGVudCgpXG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIGAuYCByZXBlYXQgY2FzZVxuICAgICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpLnRyYW5zbGF0ZSh0aGlzLnNlbGVjdGlvbkV4dGVudCkpXG4gICAgfVxuICB9XG5cbiAgc2VsZWN0KCkge1xuICAgIGlmICh0aGlzLm1vZGUgPT09IFwidmlzdWFsXCIpIHtcbiAgICAgIHN1cGVyLnNlbGVjdCgpXG4gICAgfSBlbHNlIHtcbiAgICAgIGZvciAoY29uc3QgY3Vyc29yIG9mIHRoaXMuZWRpdG9yLmdldEN1cnNvcnMoKSkge1xuICAgICAgICBjb25zdCBwb2ludEluZm8gPSB0aGlzLnBvaW50SW5mb0J5Q3Vyc29yLmdldChjdXJzb3IpXG4gICAgICAgIGlmIChwb2ludEluZm8pIHtcbiAgICAgICAgICBjb25zdCB7Y3Vyc29yUG9zaXRpb24sIHN0YXJ0T2ZTZWxlY3Rpb259ID0gcG9pbnRJbmZvXG4gICAgICAgICAgaWYgKGN1cnNvclBvc2l0aW9uLmlzRXF1YWwoY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKCkpKSB7XG4gICAgICAgICAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24oc3RhcnRPZlNlbGVjdGlvbilcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHN1cGVyLnNlbGVjdCgpXG4gICAgfVxuXG4gICAgLy8gKiBQdXJwb3NlIG9mIHBvaW50SW5mb0J5Q3Vyc29yPyBzZWUgIzIzNSBmb3IgZGV0YWlsLlxuICAgIC8vIFdoZW4gc3RheU9uVHJhbnNmb3JtU3RyaW5nIGlzIGVuYWJsZWQsIGN1cnNvciBwb3MgaXMgbm90IHNldCBvbiBzdGFydCBvZlxuICAgIC8vIG9mIHNlbGVjdGVkIHJhbmdlLlxuICAgIC8vIEJ1dCBJIHdhbnQgZm9sbG93aW5nIGJlaGF2aW9yLCBzbyBuZWVkIHRvIHByZXNlcnZlIHBvc2l0aW9uIGluZm8uXG4gICAgLy8gIDEuIGB2aj4uYCAtPiBpbmRlbnQgc2FtZSB0d28gcm93cyByZWdhcmRsZXNzIG9mIGN1cnJlbnQgY3Vyc29yJ3Mgcm93LlxuICAgIC8vICAyLiBgdmo+ai5gIC0+IGluZGVudCB0d28gcm93cyBmcm9tIGN1cnNvcidzIHJvdy5cbiAgICBmb3IgKGNvbnN0IGN1cnNvciBvZiB0aGlzLmVkaXRvci5nZXRDdXJzb3JzKCkpIHtcbiAgICAgIGNvbnN0IHN0YXJ0T2ZTZWxlY3Rpb24gPSBjdXJzb3Iuc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKCkuc3RhcnRcbiAgICAgIHRoaXMub25EaWRGaW5pc2hPcGVyYXRpb24oKCkgPT4ge1xuICAgICAgICBjdXJzb3JQb3NpdGlvbiA9IGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXG4gICAgICAgIHRoaXMucG9pbnRJbmZvQnlDdXJzb3Iuc2V0KGN1cnNvciwge3N0YXJ0T2ZTZWxlY3Rpb24sIGN1cnNvclBvc2l0aW9ufSlcbiAgICAgIH0pXG4gICAgfVxuICB9XG59XG5DdXJyZW50U2VsZWN0aW9uLnJlZ2lzdGVyKGZhbHNlKVxuXG5jbGFzcyBNb3ZlTGVmdCBleHRlbmRzIE1vdGlvbiB7XG4gIG1vdmVDdXJzb3IoY3Vyc29yKSB7XG4gICAgY29uc3QgYWxsb3dXcmFwID0gdGhpcy5nZXRDb25maWcoXCJ3cmFwTGVmdFJpZ2h0TW90aW9uXCIpXG4gICAgdGhpcy5tb3ZlQ3Vyc29yQ291bnRUaW1lcyhjdXJzb3IsICgpID0+IHRoaXMudXRpbHMubW92ZUN1cnNvckxlZnQoY3Vyc29yLCB7YWxsb3dXcmFwfSkpXG4gIH1cbn1cbk1vdmVMZWZ0LnJlZ2lzdGVyKClcblxuY2xhc3MgTW92ZVJpZ2h0IGV4dGVuZHMgTW90aW9uIHtcbiAgbW92ZUN1cnNvcihjdXJzb3IpIHtcbiAgICBjb25zdCBhbGxvd1dyYXAgPSB0aGlzLmdldENvbmZpZyhcIndyYXBMZWZ0UmlnaHRNb3Rpb25cIilcblxuICAgIHRoaXMubW92ZUN1cnNvckNvdW50VGltZXMoY3Vyc29yLCAoKSA9PiB7XG4gICAgICB0aGlzLmVkaXRvci51bmZvbGRCdWZmZXJSb3coY3Vyc29yLmdldEJ1ZmZlclJvdygpKVxuXG4gICAgICAvLyAtIFdoZW4gYHdyYXBMZWZ0UmlnaHRNb3Rpb25gIGVuYWJsZWQgYW5kIGV4ZWN1dGVkIGFzIHB1cmUtbW90aW9uIGluIGBub3JtYWwtbW9kZWAsXG4gICAgICAvLyAgIHdlIG5lZWQgdG8gbW92ZSAqKmFnYWluKiogdG8gd3JhcCB0byBuZXh0LWxpbmUgaWYgaXQgcmFjaGVkIHRvIEVPTC5cbiAgICAgIC8vIC0gRXhwcmVzc2lvbiBgIXRoaXMub3BlcmF0b3JgIG1lYW5zIG5vcm1hbC1tb2RlIG1vdGlvbi5cbiAgICAgIC8vIC0gRXhwcmVzc2lvbiBgdGhpcy5tb2RlID09PSBcIm5vcm1hbFwiYCBpcyBub3QgYXBwcm9wcmVhdGUgc2luY2UgaXQgbWF0Y2hlcyBgeGAgb3BlcmF0b3IncyB0YXJnZXQgY2FzZS5cbiAgICAgIGNvbnN0IG5lZWRNb3ZlQWdhaW4gPSBhbGxvd1dyYXAgJiYgIXRoaXMub3BlcmF0b3IgJiYgIWN1cnNvci5pc0F0RW5kT2ZMaW5lKClcblxuICAgICAgdGhpcy51dGlscy5tb3ZlQ3Vyc29yUmlnaHQoY3Vyc29yLCB7YWxsb3dXcmFwfSlcblxuICAgICAgaWYgKG5lZWRNb3ZlQWdhaW4gJiYgY3Vyc29yLmlzQXRFbmRPZkxpbmUoKSkge1xuICAgICAgICB0aGlzLnV0aWxzLm1vdmVDdXJzb3JSaWdodChjdXJzb3IsIHthbGxvd1dyYXB9KVxuICAgICAgfVxuICAgIH0pXG4gIH1cbn1cbk1vdmVSaWdodC5yZWdpc3RlcigpXG5cbmNsYXNzIE1vdmVSaWdodEJ1ZmZlckNvbHVtbiBleHRlbmRzIE1vdGlvbiB7XG4gIG1vdmVDdXJzb3IoY3Vyc29yKSB7XG4gICAgdGhpcy51dGlscy5zZXRCdWZmZXJDb2x1bW4oY3Vyc29yLCBjdXJzb3IuZ2V0QnVmZmVyQ29sdW1uKCkgKyB0aGlzLmdldENvdW50KCkpXG4gIH1cbn1cbk1vdmVSaWdodEJ1ZmZlckNvbHVtbi5yZWdpc3RlcihmYWxzZSlcblxuY2xhc3MgTW92ZVVwIGV4dGVuZHMgTW90aW9uIHtcbiAgd2lzZSA9IFwibGluZXdpc2VcIlxuICB3cmFwID0gZmFsc2VcbiAgZGlyZWN0aW9uID0gXCJ1cFwiXG5cbiAgZ2V0QnVmZmVyUm93KHJvdykge1xuICAgIGNvbnN0IG1pbiA9IDBcbiAgICBjb25zdCBtYXggPSB0aGlzLmdldFZpbUxhc3RCdWZmZXJSb3coKVxuXG4gICAgaWYgKHRoaXMuZGlyZWN0aW9uID09PSBcInVwXCIpIHtcbiAgICAgIHJvdyA9IHRoaXMuZ2V0Rm9sZFN0YXJ0Um93Rm9yUm93KHJvdykgLSAxXG4gICAgICByb3cgPSB0aGlzLndyYXAgJiYgcm93IDwgbWluID8gbWF4IDogdGhpcy51dGlscy5saW1pdE51bWJlcihyb3csIHttaW59KVxuICAgIH0gZWxzZSB7XG4gICAgICByb3cgPSB0aGlzLmdldEZvbGRFbmRSb3dGb3JSb3cocm93KSArIDFcbiAgICAgIHJvdyA9IHRoaXMud3JhcCAmJiByb3cgPiBtYXggPyBtaW4gOiB0aGlzLnV0aWxzLmxpbWl0TnVtYmVyKHJvdywge21heH0pXG4gICAgfVxuICAgIHJldHVybiB0aGlzLmdldEZvbGRTdGFydFJvd0ZvclJvdyhyb3cpXG4gIH1cblxuICBtb3ZlQ3Vyc29yKGN1cnNvcikge1xuICAgIHRoaXMubW92ZUN1cnNvckNvdW50VGltZXMoY3Vyc29yLCAoKSA9PiB0aGlzLnV0aWxzLnNldEJ1ZmZlclJvdyhjdXJzb3IsIHRoaXMuZ2V0QnVmZmVyUm93KGN1cnNvci5nZXRCdWZmZXJSb3coKSkpKVxuICB9XG59XG5Nb3ZlVXAucmVnaXN0ZXIoKVxuXG5jbGFzcyBNb3ZlVXBXcmFwIGV4dGVuZHMgTW92ZVVwIHtcbiAgd3JhcCA9IHRydWVcbn1cbk1vdmVVcFdyYXAucmVnaXN0ZXIoKVxuXG5jbGFzcyBNb3ZlRG93biBleHRlbmRzIE1vdmVVcCB7XG4gIGRpcmVjdGlvbiA9IFwiZG93blwiXG59XG5Nb3ZlRG93bi5yZWdpc3RlcigpXG5cbmNsYXNzIE1vdmVEb3duV3JhcCBleHRlbmRzIE1vdmVEb3duIHtcbiAgd3JhcCA9IHRydWVcbn1cbk1vdmVEb3duV3JhcC5yZWdpc3RlcigpXG5cbmNsYXNzIE1vdmVVcFNjcmVlbiBleHRlbmRzIE1vdGlvbiB7XG4gIHdpc2UgPSBcImxpbmV3aXNlXCJcbiAgZGlyZWN0aW9uID0gXCJ1cFwiXG4gIG1vdmVDdXJzb3IoY3Vyc29yKSB7XG4gICAgdGhpcy5tb3ZlQ3Vyc29yQ291bnRUaW1lcyhjdXJzb3IsICgpID0+IHRoaXMudXRpbHMubW92ZUN1cnNvclVwU2NyZWVuKGN1cnNvcikpXG4gIH1cbn1cbk1vdmVVcFNjcmVlbi5yZWdpc3RlcigpXG5cbmNsYXNzIE1vdmVEb3duU2NyZWVuIGV4dGVuZHMgTW92ZVVwU2NyZWVuIHtcbiAgd2lzZSA9IFwibGluZXdpc2VcIlxuICBkaXJlY3Rpb24gPSBcImRvd25cIlxuICBtb3ZlQ3Vyc29yKGN1cnNvcikge1xuICAgIHRoaXMubW92ZUN1cnNvckNvdW50VGltZXMoY3Vyc29yLCAoKSA9PiB0aGlzLnV0aWxzLm1vdmVDdXJzb3JEb3duU2NyZWVuKGN1cnNvcikpXG4gIH1cbn1cbk1vdmVEb3duU2NyZWVuLnJlZ2lzdGVyKClcblxuY2xhc3MgTW92ZVVwVG9FZGdlIGV4dGVuZHMgTW90aW9uIHtcbiAgd2lzZSA9IFwibGluZXdpc2VcIlxuICBqdW1wID0gdHJ1ZVxuICBkaXJlY3Rpb24gPSBcInByZXZpb3VzXCJcbiAgbW92ZUN1cnNvcihjdXJzb3IpIHtcbiAgICB0aGlzLm1vdmVDdXJzb3JDb3VudFRpbWVzKGN1cnNvciwgKCkgPT4ge1xuICAgICAgY29uc3QgcG9pbnQgPSB0aGlzLmdldFBvaW50KGN1cnNvci5nZXRTY3JlZW5Qb3NpdGlvbigpKVxuICAgICAgaWYgKHBvaW50KSBjdXJzb3Iuc2V0U2NyZWVuUG9zaXRpb24ocG9pbnQpXG4gICAgfSlcbiAgfVxuXG4gIGdldFBvaW50KGZyb21Qb2ludCkge1xuICAgIGNvbnN0IHtjb2x1bW4sIHJvdzogc3RhcnRSb3d9ID0gZnJvbVBvaW50XG4gICAgZm9yIChjb25zdCByb3cgb2YgdGhpcy5nZXRTY3JlZW5Sb3dzKHtzdGFydFJvdywgZGlyZWN0aW9uOiB0aGlzLmRpcmVjdGlvbn0pKSB7XG4gICAgICBjb25zdCBwb2ludCA9IG5ldyBQb2ludChyb3csIGNvbHVtbilcbiAgICAgIGlmICh0aGlzLmlzRWRnZShwb2ludCkpIHJldHVybiBwb2ludFxuICAgIH1cbiAgfVxuXG4gIGlzRWRnZShwb2ludCkge1xuICAgIC8vIElmIHBvaW50IGlzIHN0b3BwYWJsZSBhbmQgYWJvdmUgb3IgYmVsb3cgcG9pbnQgaXMgbm90IHN0b3BwYWJsZSwgaXQncyBFZGdlIVxuICAgIHJldHVybiAoXG4gICAgICB0aGlzLmlzU3RvcHBhYmxlKHBvaW50KSAmJlxuICAgICAgKCF0aGlzLmlzU3RvcHBhYmxlKHBvaW50LnRyYW5zbGF0ZShbLTEsIDBdKSkgfHwgIXRoaXMuaXNTdG9wcGFibGUocG9pbnQudHJhbnNsYXRlKFsrMSwgMF0pKSlcbiAgICApXG4gIH1cblxuICBpc1N0b3BwYWJsZShwb2ludCkge1xuICAgIHJldHVybiAoXG4gICAgICB0aGlzLmlzTm9uV2hpdGVTcGFjZShwb2ludCkgfHxcbiAgICAgIHRoaXMuaXNGaXJzdFJvd09yTGFzdFJvd0FuZEVxdWFsQWZ0ZXJDbGlwcGVkKHBvaW50KSB8fFxuICAgICAgLy8gSWYgcmlnaHQgb3IgbGVmdCBjb2x1bW4gaXMgbm9uLXdoaXRlLXNwYWNlIGNoYXIsIGl0J3Mgc3RvcHBhYmxlLlxuICAgICAgKHRoaXMuaXNOb25XaGl0ZVNwYWNlKHBvaW50LnRyYW5zbGF0ZShbMCwgLTFdKSkgJiYgdGhpcy5pc05vbldoaXRlU3BhY2UocG9pbnQudHJhbnNsYXRlKFswLCArMV0pKSlcbiAgICApXG4gIH1cblxuICBpc05vbldoaXRlU3BhY2UocG9pbnQpIHtcbiAgICBjb25zdCBjaGFyID0gdGhpcy51dGlscy5nZXRUZXh0SW5TY3JlZW5SYW5nZSh0aGlzLmVkaXRvciwgUmFuZ2UuZnJvbVBvaW50V2l0aERlbHRhKHBvaW50LCAwLCAxKSlcbiAgICByZXR1cm4gY2hhciAhPSBudWxsICYmIC9cXFMvLnRlc3QoY2hhcilcbiAgfVxuXG4gIGlzRmlyc3RSb3dPckxhc3RSb3dBbmRFcXVhbEFmdGVyQ2xpcHBlZChwb2ludCkge1xuICAgIC8vIEluIG5vdG1hbC1tb2RlLCBjdXJzb3IgaXMgTk9UIHN0b3BwYWJsZSB0byBFT0wgb2Ygbm9uLWJsYW5rIHJvdy5cbiAgICAvLyBTbyBleHBsaWNpdGx5IGd1YXJkIHRvIG5vdCBhbnN3ZXIgaXQgc3RvcHBhYmxlLlxuICAgIGlmICh0aGlzLmlzTW9kZShcIm5vcm1hbFwiKSAmJiB0aGlzLnV0aWxzLnBvaW50SXNBdEVuZE9mTGluZUF0Tm9uRW1wdHlSb3codGhpcy5lZGl0b3IsIHBvaW50KSkge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG4gICAgcmV0dXJuIChcbiAgICAgIChwb2ludC5yb3cgPT09IDAgfHwgcG9pbnQucm93ID09PSB0aGlzLmdldFZpbUxhc3RTY3JlZW5Sb3coKSkgJiZcbiAgICAgIHBvaW50LmlzRXF1YWwodGhpcy5lZGl0b3IuY2xpcFNjcmVlblBvc2l0aW9uKHBvaW50KSlcbiAgICApXG4gIH1cbn1cbk1vdmVVcFRvRWRnZS5yZWdpc3RlcigpXG5cbmNsYXNzIE1vdmVEb3duVG9FZGdlIGV4dGVuZHMgTW92ZVVwVG9FZGdlIHtcbiAgZGlyZWN0aW9uID0gXCJuZXh0XCJcbn1cbk1vdmVEb3duVG9FZGdlLnJlZ2lzdGVyKClcblxuLy8gd29yZFxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgTW92ZVRvTmV4dFdvcmQgZXh0ZW5kcyBNb3Rpb24ge1xuICB3b3JkUmVnZXggPSBudWxsXG5cbiAgZ2V0UG9pbnQocmVnZXgsIGZyb20pIHtcbiAgICBsZXQgd29yZFJhbmdlXG4gICAgbGV0IGZvdW5kID0gZmFsc2VcblxuICAgIHRoaXMuc2NhbkZvcndhcmQocmVnZXgsIHtmcm9tfSwgKHtyYW5nZSwgbWF0Y2hUZXh0LCBzdG9wfSkgPT4ge1xuICAgICAgd29yZFJhbmdlID0gcmFuZ2VcbiAgICAgIC8vIElnbm9yZSAnZW1wdHkgbGluZScgbWF0Y2hlcyBiZXR3ZWVuICdcXHInIGFuZCAnXFxuJ1xuICAgICAgaWYgKG1hdGNoVGV4dCA9PT0gXCJcIiAmJiByYW5nZS5zdGFydC5jb2x1bW4gIT09IDApIHJldHVyblxuICAgICAgaWYgKHJhbmdlLnN0YXJ0LmlzR3JlYXRlclRoYW4oZnJvbSkpIHtcbiAgICAgICAgZm91bmQgPSB0cnVlXG4gICAgICAgIHN0b3AoKVxuICAgICAgfVxuICAgIH0pXG5cbiAgICBpZiAoZm91bmQpIHtcbiAgICAgIGNvbnN0IHBvaW50ID0gd29yZFJhbmdlLnN0YXJ0XG4gICAgICByZXR1cm4gdGhpcy51dGlscy5wb2ludElzQXRFbmRPZkxpbmVBdE5vbkVtcHR5Um93KHRoaXMuZWRpdG9yLCBwb2ludCkgJiZcbiAgICAgICAgIXBvaW50LmlzRXF1YWwodGhpcy5nZXRWaW1Fb2ZCdWZmZXJQb3NpdGlvbigpKVxuICAgICAgICA/IHBvaW50LnRyYXZlcnNlKFsxLCAwXSlcbiAgICAgICAgOiBwb2ludFxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gd29yZFJhbmdlID8gd29yZFJhbmdlLmVuZCA6IGZyb21cbiAgICB9XG4gIH1cblxuICAvLyBTcGVjaWFsIGNhc2U6IFwiY3dcIiBhbmQgXCJjV1wiIGFyZSB0cmVhdGVkIGxpa2UgXCJjZVwiIGFuZCBcImNFXCIgaWYgdGhlIGN1cnNvciBpc1xuICAvLyBvbiBhIG5vbi1ibGFuay4gIFRoaXMgaXMgYmVjYXVzZSBcImN3XCIgaXMgaW50ZXJwcmV0ZWQgYXMgY2hhbmdlLXdvcmQsIGFuZCBhXG4gIC8vIHdvcmQgZG9lcyBub3QgaW5jbHVkZSB0aGUgZm9sbG93aW5nIHdoaXRlIHNwYWNlLiAge1ZpOiBcImN3XCIgd2hlbiBvbiBhIGJsYW5rXG4gIC8vIGZvbGxvd2VkIGJ5IG90aGVyIGJsYW5rcyBjaGFuZ2VzIG9ubHkgdGhlIGZpcnN0IGJsYW5rOyB0aGlzIGlzIHByb2JhYmx5IGFcbiAgLy8gYnVnLCBiZWNhdXNlIFwiZHdcIiBkZWxldGVzIGFsbCB0aGUgYmxhbmtzfVxuICAvL1xuICAvLyBBbm90aGVyIHNwZWNpYWwgY2FzZTogV2hlbiB1c2luZyB0aGUgXCJ3XCIgbW90aW9uIGluIGNvbWJpbmF0aW9uIHdpdGggYW5cbiAgLy8gb3BlcmF0b3IgYW5kIHRoZSBsYXN0IHdvcmQgbW92ZWQgb3ZlciBpcyBhdCB0aGUgZW5kIG9mIGEgbGluZSwgdGhlIGVuZCBvZlxuICAvLyB0aGF0IHdvcmQgYmVjb21lcyB0aGUgZW5kIG9mIHRoZSBvcGVyYXRlZCB0ZXh0LCBub3QgdGhlIGZpcnN0IHdvcmQgaW4gdGhlXG4gIC8vIG5leHQgbGluZS5cbiAgbW92ZUN1cnNvcihjdXJzb3IpIHtcbiAgICBjb25zdCBjdXJzb3JQb3NpdGlvbiA9IGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXG4gICAgaWYgKHRoaXMudXRpbHMucG9pbnRJc0F0VmltRW5kT2ZGaWxlKHRoaXMuZWRpdG9yLCBjdXJzb3JQb3NpdGlvbikpIHJldHVyblxuXG4gICAgY29uc3Qgd2FzT25XaGl0ZVNwYWNlID0gdGhpcy51dGlscy5wb2ludElzT25XaGl0ZVNwYWNlKHRoaXMuZWRpdG9yLCBjdXJzb3JQb3NpdGlvbilcbiAgICBjb25zdCBpc1RhcmdldE9mTm9ybWFsT3BlcmF0b3IgPSB0aGlzLmlzVGFyZ2V0T2ZOb3JtYWxPcGVyYXRvcigpXG5cbiAgICB0aGlzLm1vdmVDdXJzb3JDb3VudFRpbWVzKGN1cnNvciwgKHtpc0ZpbmFsfSkgPT4ge1xuICAgICAgY29uc3QgY3Vyc29yUG9zaXRpb24gPSBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuICAgICAgaWYgKHRoaXMudXRpbHMuaXNFbXB0eVJvdyh0aGlzLmVkaXRvciwgY3Vyc29yUG9zaXRpb24ucm93KSAmJiBpc1RhcmdldE9mTm9ybWFsT3BlcmF0b3IpIHtcbiAgICAgICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKGN1cnNvclBvc2l0aW9uLnRyYXZlcnNlKFsxLCAwXSkpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCByZWdleCA9IHRoaXMud29yZFJlZ2V4IHx8IGN1cnNvci53b3JkUmVnRXhwKClcbiAgICAgICAgbGV0IHBvaW50ID0gdGhpcy5nZXRQb2ludChyZWdleCwgY3Vyc29yUG9zaXRpb24pXG4gICAgICAgIGlmIChpc0ZpbmFsICYmIGlzVGFyZ2V0T2ZOb3JtYWxPcGVyYXRvcikge1xuICAgICAgICAgIGlmICh0aGlzLm9wZXJhdG9yLm5hbWUgPT09IFwiQ2hhbmdlXCIgJiYgIXdhc09uV2hpdGVTcGFjZSkge1xuICAgICAgICAgICAgcG9pbnQgPSBjdXJzb3IuZ2V0RW5kT2ZDdXJyZW50V29yZEJ1ZmZlclBvc2l0aW9uKHt3b3JkUmVnZXg6IHRoaXMud29yZFJlZ2V4fSlcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcG9pbnQgPSBQb2ludC5taW4ocG9pbnQsIHRoaXMudXRpbHMuZ2V0RW5kT2ZMaW5lRm9yQnVmZmVyUm93KHRoaXMuZWRpdG9yLCBjdXJzb3JQb3NpdGlvbi5yb3cpKVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24ocG9pbnQpXG4gICAgICB9XG4gICAgfSlcbiAgfVxufVxuTW92ZVRvTmV4dFdvcmQucmVnaXN0ZXIoKVxuXG4vLyBiXG5jbGFzcyBNb3ZlVG9QcmV2aW91c1dvcmQgZXh0ZW5kcyBNb3Rpb24ge1xuICB3b3JkUmVnZXggPSBudWxsXG5cbiAgbW92ZUN1cnNvcihjdXJzb3IpIHtcbiAgICB0aGlzLm1vdmVDdXJzb3JDb3VudFRpbWVzKGN1cnNvciwgKCkgPT4ge1xuICAgICAgY29uc3QgcG9pbnQgPSBjdXJzb3IuZ2V0QmVnaW5uaW5nT2ZDdXJyZW50V29yZEJ1ZmZlclBvc2l0aW9uKHt3b3JkUmVnZXg6IHRoaXMud29yZFJlZ2V4fSlcbiAgICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihwb2ludClcbiAgICB9KVxuICB9XG59XG5Nb3ZlVG9QcmV2aW91c1dvcmQucmVnaXN0ZXIoKVxuXG5jbGFzcyBNb3ZlVG9FbmRPZldvcmQgZXh0ZW5kcyBNb3Rpb24ge1xuICB3b3JkUmVnZXggPSBudWxsXG4gIGluY2x1c2l2ZSA9IHRydWVcblxuICBtb3ZlVG9OZXh0RW5kT2ZXb3JkKGN1cnNvcikge1xuICAgIHRoaXMudXRpbHMubW92ZUN1cnNvclRvTmV4dE5vbldoaXRlc3BhY2UoY3Vyc29yKVxuICAgIGNvbnN0IHBvaW50ID0gY3Vyc29yLmdldEVuZE9mQ3VycmVudFdvcmRCdWZmZXJQb3NpdGlvbih7d29yZFJlZ2V4OiB0aGlzLndvcmRSZWdleH0pLnRyYW5zbGF0ZShbMCwgLTFdKVxuICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihQb2ludC5taW4ocG9pbnQsIHRoaXMuZ2V0VmltRW9mQnVmZmVyUG9zaXRpb24oKSkpXG4gIH1cblxuICBtb3ZlQ3Vyc29yKGN1cnNvcikge1xuICAgIHRoaXMubW92ZUN1cnNvckNvdW50VGltZXMoY3Vyc29yLCAoKSA9PiB7XG4gICAgICBjb25zdCBvcmlnaW5hbFBvaW50ID0gY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKClcbiAgICAgIHRoaXMubW92ZVRvTmV4dEVuZE9mV29yZChjdXJzb3IpXG4gICAgICBpZiAob3JpZ2luYWxQb2ludC5pc0VxdWFsKGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpKSkge1xuICAgICAgICAvLyBSZXRyeSBmcm9tIHJpZ2h0IGNvbHVtbiBpZiBjdXJzb3Igd2FzIGFscmVhZHkgb24gRW5kT2ZXb3JkXG4gICAgICAgIGN1cnNvci5tb3ZlUmlnaHQoKVxuICAgICAgICB0aGlzLm1vdmVUb05leHRFbmRPZldvcmQoY3Vyc29yKVxuICAgICAgfVxuICAgIH0pXG4gIH1cbn1cbk1vdmVUb0VuZE9mV29yZC5yZWdpc3RlcigpXG5cbi8vIFtUT0RPOiBJbXByb3ZlLCBhY2N1cmFjeV1cbmNsYXNzIE1vdmVUb1ByZXZpb3VzRW5kT2ZXb3JkIGV4dGVuZHMgTW92ZVRvUHJldmlvdXNXb3JkIHtcbiAgaW5jbHVzaXZlID0gdHJ1ZVxuXG4gIG1vdmVDdXJzb3IoY3Vyc29yKSB7XG4gICAgY29uc3Qgd29yZFJhbmdlID0gY3Vyc29yLmdldEN1cnJlbnRXb3JkQnVmZmVyUmFuZ2UoKVxuICAgIGNvbnN0IGN1cnNvclBvc2l0aW9uID0gY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKClcblxuICAgIC8vIGlmIHdlJ3JlIGluIHRoZSBtaWRkbGUgb2YgYSB3b3JkIHRoZW4gd2UgbmVlZCB0byBtb3ZlIHRvIGl0cyBzdGFydFxuICAgIGxldCB0aW1lcyA9IHRoaXMuZ2V0Q291bnQoKVxuICAgIGlmIChjdXJzb3JQb3NpdGlvbi5pc0dyZWF0ZXJUaGFuKHdvcmRSYW5nZS5zdGFydCkgJiYgY3Vyc29yUG9zaXRpb24uaXNMZXNzVGhhbih3b3JkUmFuZ2UuZW5kKSkge1xuICAgICAgdGltZXMgKz0gMVxuICAgIH1cblxuICAgIGZvciAoY29uc3QgaSBpbiB0aGlzLnV0aWxzLmdldExpc3QoMSwgdGltZXMpKSB7XG4gICAgICBjb25zdCBwb2ludCA9IGN1cnNvci5nZXRCZWdpbm5pbmdPZkN1cnJlbnRXb3JkQnVmZmVyUG9zaXRpb24oe3dvcmRSZWdleDogdGhpcy53b3JkUmVnZXh9KVxuICAgICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHBvaW50KVxuICAgIH1cblxuICAgIHRoaXMubW92ZVRvTmV4dEVuZE9mV29yZChjdXJzb3IpXG4gICAgaWYgKGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpLmlzR3JlYXRlclRoYW5PckVxdWFsKGN1cnNvclBvc2l0aW9uKSkge1xuICAgICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKFswLCAwXSlcbiAgICB9XG4gIH1cblxuICBtb3ZlVG9OZXh0RW5kT2ZXb3JkKGN1cnNvcikge1xuICAgIGNvbnN0IHBvaW50ID0gY3Vyc29yLmdldEVuZE9mQ3VycmVudFdvcmRCdWZmZXJQb3NpdGlvbih7d29yZFJlZ2V4OiB0aGlzLndvcmRSZWdleH0pLnRyYW5zbGF0ZShbMCwgLTFdKVxuICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihQb2ludC5taW4ocG9pbnQsIHRoaXMuZ2V0VmltRW9mQnVmZmVyUG9zaXRpb24oKSkpXG4gIH1cbn1cbk1vdmVUb1ByZXZpb3VzRW5kT2ZXb3JkLnJlZ2lzdGVyKClcblxuLy8gV2hvbGUgd29yZFxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgTW92ZVRvTmV4dFdob2xlV29yZCBleHRlbmRzIE1vdmVUb05leHRXb3JkIHtcbiAgd29yZFJlZ2V4ID0gL14kfFxcUysvZ1xufVxuTW92ZVRvTmV4dFdob2xlV29yZC5yZWdpc3RlcigpXG5cbmNsYXNzIE1vdmVUb1ByZXZpb3VzV2hvbGVXb3JkIGV4dGVuZHMgTW92ZVRvUHJldmlvdXNXb3JkIHtcbiAgd29yZFJlZ2V4ID0gL14kfFxcUysvZ1xufVxuTW92ZVRvUHJldmlvdXNXaG9sZVdvcmQucmVnaXN0ZXIoKVxuXG5jbGFzcyBNb3ZlVG9FbmRPZldob2xlV29yZCBleHRlbmRzIE1vdmVUb0VuZE9mV29yZCB7XG4gIHdvcmRSZWdleCA9IC9cXFMrL1xufVxuTW92ZVRvRW5kT2ZXaG9sZVdvcmQucmVnaXN0ZXIoKVxuXG4vLyBbVE9ETzogSW1wcm92ZSwgYWNjdXJhY3ldXG5jbGFzcyBNb3ZlVG9QcmV2aW91c0VuZE9mV2hvbGVXb3JkIGV4dGVuZHMgTW92ZVRvUHJldmlvdXNFbmRPZldvcmQge1xuICB3b3JkUmVnZXggPSAvXFxTKy9cbn1cbk1vdmVUb1ByZXZpb3VzRW5kT2ZXaG9sZVdvcmQucmVnaXN0ZXIoKVxuXG4vLyBBbHBoYW51bWVyaWMgd29yZCBbRXhwZXJpbWVudGFsXVxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgTW92ZVRvTmV4dEFscGhhbnVtZXJpY1dvcmQgZXh0ZW5kcyBNb3ZlVG9OZXh0V29yZCB7XG4gIHdvcmRSZWdleCA9IC9cXHcrL2dcbn1cbk1vdmVUb05leHRBbHBoYW51bWVyaWNXb3JkLnJlZ2lzdGVyKClcblxuY2xhc3MgTW92ZVRvUHJldmlvdXNBbHBoYW51bWVyaWNXb3JkIGV4dGVuZHMgTW92ZVRvUHJldmlvdXNXb3JkIHtcbiAgd29yZFJlZ2V4ID0gL1xcdysvXG59XG5Nb3ZlVG9QcmV2aW91c0FscGhhbnVtZXJpY1dvcmQucmVnaXN0ZXIoKVxuXG5jbGFzcyBNb3ZlVG9FbmRPZkFscGhhbnVtZXJpY1dvcmQgZXh0ZW5kcyBNb3ZlVG9FbmRPZldvcmQge1xuICB3b3JkUmVnZXggPSAvXFx3Ky9cbn1cbk1vdmVUb0VuZE9mQWxwaGFudW1lcmljV29yZC5yZWdpc3RlcigpXG5cbi8vIEFscGhhbnVtZXJpYyB3b3JkIFtFeHBlcmltZW50YWxdXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBNb3ZlVG9OZXh0U21hcnRXb3JkIGV4dGVuZHMgTW92ZVRvTmV4dFdvcmQge1xuICB3b3JkUmVnZXggPSAvW1xcdy1dKy9nXG59XG5Nb3ZlVG9OZXh0U21hcnRXb3JkLnJlZ2lzdGVyKClcblxuY2xhc3MgTW92ZVRvUHJldmlvdXNTbWFydFdvcmQgZXh0ZW5kcyBNb3ZlVG9QcmV2aW91c1dvcmQge1xuICB3b3JkUmVnZXggPSAvW1xcdy1dKy9cbn1cbk1vdmVUb1ByZXZpb3VzU21hcnRXb3JkLnJlZ2lzdGVyKClcblxuY2xhc3MgTW92ZVRvRW5kT2ZTbWFydFdvcmQgZXh0ZW5kcyBNb3ZlVG9FbmRPZldvcmQge1xuICB3b3JkUmVnZXggPSAvW1xcdy1dKy9cbn1cbk1vdmVUb0VuZE9mU21hcnRXb3JkLnJlZ2lzdGVyKClcblxuLy8gU3Vid29yZFxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgTW92ZVRvTmV4dFN1YndvcmQgZXh0ZW5kcyBNb3ZlVG9OZXh0V29yZCB7XG4gIG1vdmVDdXJzb3IoY3Vyc29yKSB7XG4gICAgdGhpcy53b3JkUmVnZXggPSBjdXJzb3Iuc3Vid29yZFJlZ0V4cCgpXG4gICAgc3VwZXIubW92ZUN1cnNvcihjdXJzb3IpXG4gIH1cbn1cbk1vdmVUb05leHRTdWJ3b3JkLnJlZ2lzdGVyKClcblxuY2xhc3MgTW92ZVRvUHJldmlvdXNTdWJ3b3JkIGV4dGVuZHMgTW92ZVRvUHJldmlvdXNXb3JkIHtcbiAgbW92ZUN1cnNvcihjdXJzb3IpIHtcbiAgICB0aGlzLndvcmRSZWdleCA9IGN1cnNvci5zdWJ3b3JkUmVnRXhwKClcbiAgICBzdXBlci5tb3ZlQ3Vyc29yKGN1cnNvcilcbiAgfVxufVxuTW92ZVRvUHJldmlvdXNTdWJ3b3JkLnJlZ2lzdGVyKClcblxuY2xhc3MgTW92ZVRvRW5kT2ZTdWJ3b3JkIGV4dGVuZHMgTW92ZVRvRW5kT2ZXb3JkIHtcbiAgbW92ZUN1cnNvcihjdXJzb3IpIHtcbiAgICB0aGlzLndvcmRSZWdleCA9IGN1cnNvci5zdWJ3b3JkUmVnRXhwKClcbiAgICBzdXBlci5tb3ZlQ3Vyc29yKGN1cnNvcilcbiAgfVxufVxuTW92ZVRvRW5kT2ZTdWJ3b3JkLnJlZ2lzdGVyKClcblxuLy8gU2VudGVuY2Vcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFNlbnRlbmNlIGlzIGRlZmluZWQgYXMgYmVsb3dcbi8vICAtIGVuZCB3aXRoIFsnLicsICchJywgJz8nXVxuLy8gIC0gb3B0aW9uYWxseSBmb2xsb3dlZCBieSBbJyknLCAnXScsICdcIicsIFwiJ1wiXVxuLy8gIC0gZm9sbG93ZWQgYnkgWyckJywgJyAnLCAnXFx0J11cbi8vICAtIHBhcmFncmFwaCBib3VuZGFyeSBpcyBhbHNvIHNlbnRlbmNlIGJvdW5kYXJ5XG4vLyAgLSBzZWN0aW9uIGJvdW5kYXJ5IGlzIGFsc28gc2VudGVuY2UgYm91bmRhcnkoaWdub3JlKVxuY2xhc3MgTW92ZVRvTmV4dFNlbnRlbmNlIGV4dGVuZHMgTW90aW9uIHtcbiAganVtcCA9IHRydWVcbiAgc2VudGVuY2VSZWdleCA9IG5ldyBSZWdFeHAoYCg/OltcXFxcLiFcXFxcP11bXFxcXClcXFxcXVwiJ10qXFxcXHMrKXwoXFxcXG58XFxcXHJcXFxcbilgLCBcImdcIilcbiAgZGlyZWN0aW9uID0gXCJuZXh0XCJcblxuICBtb3ZlQ3Vyc29yKGN1cnNvcikge1xuICAgIHRoaXMubW92ZUN1cnNvckNvdW50VGltZXMoY3Vyc29yLCAoKSA9PiB7XG4gICAgICBjb25zdCBjdXJzb3JQb3NpdGlvbiA9IGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXG5cbiAgICAgIGNvbnN0IHBvaW50ID1cbiAgICAgICAgdGhpcy5kaXJlY3Rpb24gPT09IFwibmV4dFwiXG4gICAgICAgICAgPyB0aGlzLmdldE5leHRTdGFydE9mU2VudGVuY2UoY3Vyc29yUG9zaXRpb24pXG4gICAgICAgICAgOiB0aGlzLmdldFByZXZpb3VzU3RhcnRPZlNlbnRlbmNlKGN1cnNvclBvc2l0aW9uKVxuXG4gICAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24ocG9pbnQpXG4gICAgfSlcbiAgfVxuXG4gIGlzQmxhbmtSb3cocm93KSB7XG4gICAgcmV0dXJuIHRoaXMuZWRpdG9yLmlzQnVmZmVyUm93Qmxhbmsocm93KVxuICB9XG5cbiAgZ2V0TmV4dFN0YXJ0T2ZTZW50ZW5jZShmcm9tKSB7XG4gICAgbGV0IGZvdW5kUG9pbnRcbiAgICB0aGlzLnNjYW5Gb3J3YXJkKHRoaXMuc2VudGVuY2VSZWdleCwge2Zyb219LCAoe3JhbmdlLCBtYXRjaFRleHQsIG1hdGNoLCBzdG9wfSkgPT4ge1xuICAgICAgaWYgKG1hdGNoWzFdICE9IG51bGwpIHtcbiAgICAgICAgY29uc3QgW3N0YXJ0Um93LCBlbmRSb3ddID0gW3JhbmdlLnN0YXJ0LnJvdywgcmFuZ2UuZW5kLnJvd11cbiAgICAgICAgaWYgKHRoaXMuc2tpcEJsYW5rUm93ICYmIHRoaXMuaXNCbGFua1JvdyhlbmRSb3cpKSByZXR1cm5cbiAgICAgICAgaWYgKHRoaXMuaXNCbGFua1JvdyhzdGFydFJvdykgIT09IHRoaXMuaXNCbGFua1JvdyhlbmRSb3cpKSB7XG4gICAgICAgICAgZm91bmRQb2ludCA9IHRoaXMuZ2V0Rmlyc3RDaGFyYWN0ZXJQb3NpdGlvbkZvckJ1ZmZlclJvdyhlbmRSb3cpXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZvdW5kUG9pbnQgPSByYW5nZS5lbmRcbiAgICAgIH1cbiAgICAgIGlmIChmb3VuZFBvaW50KSBzdG9wKClcbiAgICB9KVxuICAgIHJldHVybiBmb3VuZFBvaW50IHx8IHRoaXMuZ2V0VmltRW9mQnVmZmVyUG9zaXRpb24oKVxuICB9XG5cbiAgZ2V0UHJldmlvdXNTdGFydE9mU2VudGVuY2UoZnJvbSkge1xuICAgIGxldCBmb3VuZFBvaW50XG4gICAgdGhpcy5zY2FuQmFja3dhcmQodGhpcy5zZW50ZW5jZVJlZ2V4LCB7ZnJvbX0sICh7cmFuZ2UsIG1hdGNoVGV4dCwgbWF0Y2gsIHN0b3B9KSA9PiB7XG4gICAgICBpZiAobWF0Y2hbMV0gIT0gbnVsbCkge1xuICAgICAgICBjb25zdCBbc3RhcnRSb3csIGVuZFJvd10gPSBbcmFuZ2Uuc3RhcnQucm93LCByYW5nZS5lbmQucm93XVxuICAgICAgICBpZiAoIXRoaXMuaXNCbGFua1JvdyhlbmRSb3cpICYmIHRoaXMuaXNCbGFua1JvdyhzdGFydFJvdykpIHtcbiAgICAgICAgICBjb25zdCBwb2ludCA9IHRoaXMuZ2V0Rmlyc3RDaGFyYWN0ZXJQb3NpdGlvbkZvckJ1ZmZlclJvdyhlbmRSb3cpXG4gICAgICAgICAgaWYgKHBvaW50LmlzTGVzc1RoYW4oZnJvbSkpIHtcbiAgICAgICAgICAgIGZvdW5kUG9pbnQgPSBwb2ludFxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAodGhpcy5za2lwQmxhbmtSb3cpIHJldHVyblxuICAgICAgICAgICAgZm91bmRQb2ludCA9IHRoaXMuZ2V0Rmlyc3RDaGFyYWN0ZXJQb3NpdGlvbkZvckJ1ZmZlclJvdyhzdGFydFJvdylcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChyYW5nZS5lbmQuaXNMZXNzVGhhbihmcm9tKSkgZm91bmRQb2ludCA9IHJhbmdlLmVuZFxuICAgICAgfVxuICAgICAgaWYgKGZvdW5kUG9pbnQpIHN0b3AoKVxuICAgIH0pXG4gICAgcmV0dXJuIGZvdW5kUG9pbnQgfHwgWzAsIDBdXG4gIH1cbn1cbk1vdmVUb05leHRTZW50ZW5jZS5yZWdpc3RlcigpXG5cbmNsYXNzIE1vdmVUb1ByZXZpb3VzU2VudGVuY2UgZXh0ZW5kcyBNb3ZlVG9OZXh0U2VudGVuY2Uge1xuICBkaXJlY3Rpb24gPSBcInByZXZpb3VzXCJcbn1cbk1vdmVUb1ByZXZpb3VzU2VudGVuY2UucmVnaXN0ZXIoKVxuXG5jbGFzcyBNb3ZlVG9OZXh0U2VudGVuY2VTa2lwQmxhbmtSb3cgZXh0ZW5kcyBNb3ZlVG9OZXh0U2VudGVuY2Uge1xuICBza2lwQmxhbmtSb3cgPSB0cnVlXG59XG5Nb3ZlVG9OZXh0U2VudGVuY2VTa2lwQmxhbmtSb3cucmVnaXN0ZXIoKVxuXG5jbGFzcyBNb3ZlVG9QcmV2aW91c1NlbnRlbmNlU2tpcEJsYW5rUm93IGV4dGVuZHMgTW92ZVRvUHJldmlvdXNTZW50ZW5jZSB7XG4gIHNraXBCbGFua1JvdyA9IHRydWVcbn1cbk1vdmVUb1ByZXZpb3VzU2VudGVuY2VTa2lwQmxhbmtSb3cucmVnaXN0ZXIoKVxuXG4vLyBQYXJhZ3JhcGhcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIE1vdmVUb05leHRQYXJhZ3JhcGggZXh0ZW5kcyBNb3Rpb24ge1xuICBqdW1wID0gdHJ1ZVxuICBkaXJlY3Rpb24gPSBcIm5leHRcIlxuXG4gIG1vdmVDdXJzb3IoY3Vyc29yKSB7XG4gICAgdGhpcy5tb3ZlQ3Vyc29yQ291bnRUaW1lcyhjdXJzb3IsICgpID0+IHtcbiAgICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbih0aGlzLmdldFBvaW50KGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpKSlcbiAgICB9KVxuICB9XG5cbiAgZ2V0UG9pbnQoZnJvbVBvaW50KSB7XG4gICAgY29uc3Qgc3RhcnRSb3cgPSBmcm9tUG9pbnQucm93XG4gICAgbGV0IHdhc0JsYW5rUm93ID0gdGhpcy5lZGl0b3IuaXNCdWZmZXJSb3dCbGFuayhzdGFydFJvdylcbiAgICBmb3IgKGNvbnN0IHJvdyBvZiB0aGlzLmdldEJ1ZmZlclJvd3Moe3N0YXJ0Um93LCBkaXJlY3Rpb246IHRoaXMuZGlyZWN0aW9ufSkpIHtcbiAgICAgIGNvbnN0IGlzQmxhbmtSb3cgPSB0aGlzLmVkaXRvci5pc0J1ZmZlclJvd0JsYW5rKHJvdylcbiAgICAgIGlmICghd2FzQmxhbmtSb3cgJiYgaXNCbGFua1Jvdykge1xuICAgICAgICByZXR1cm4gbmV3IFBvaW50KHJvdywgMClcbiAgICAgIH1cbiAgICAgIHdhc0JsYW5rUm93ID0gaXNCbGFua1Jvd1xuICAgIH1cblxuICAgIC8vIGZhbGxiYWNrXG4gICAgcmV0dXJuIHRoaXMuZGlyZWN0aW9uID09PSBcInByZXZpb3VzXCIgPyBuZXcgUG9pbnQoMCwgMCkgOiB0aGlzLmdldFZpbUVvZkJ1ZmZlclBvc2l0aW9uKClcbiAgfVxufVxuTW92ZVRvTmV4dFBhcmFncmFwaC5yZWdpc3RlcigpXG5cbmNsYXNzIE1vdmVUb1ByZXZpb3VzUGFyYWdyYXBoIGV4dGVuZHMgTW92ZVRvTmV4dFBhcmFncmFwaCB7XG4gIGRpcmVjdGlvbiA9IFwicHJldmlvdXNcIlxufVxuTW92ZVRvUHJldmlvdXNQYXJhZ3JhcGgucmVnaXN0ZXIoKVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBrZXltYXA6IDBcbmNsYXNzIE1vdmVUb0JlZ2lubmluZ09mTGluZSBleHRlbmRzIE1vdGlvbiB7XG4gIG1vdmVDdXJzb3IoY3Vyc29yKSB7XG4gICAgdGhpcy51dGlscy5zZXRCdWZmZXJDb2x1bW4oY3Vyc29yLCAwKVxuICB9XG59XG5Nb3ZlVG9CZWdpbm5pbmdPZkxpbmUucmVnaXN0ZXIoKVxuXG5jbGFzcyBNb3ZlVG9Db2x1bW4gZXh0ZW5kcyBNb3Rpb24ge1xuICBtb3ZlQ3Vyc29yKGN1cnNvcikge1xuICAgIHRoaXMudXRpbHMuc2V0QnVmZmVyQ29sdW1uKGN1cnNvciwgdGhpcy5nZXRDb3VudCgtMSkpXG4gIH1cbn1cbk1vdmVUb0NvbHVtbi5yZWdpc3RlcigpXG5cbmNsYXNzIE1vdmVUb0xhc3RDaGFyYWN0ZXJPZkxpbmUgZXh0ZW5kcyBNb3Rpb24ge1xuICBtb3ZlQ3Vyc29yKGN1cnNvcikge1xuICAgIGNvbnN0IHJvdyA9IHRoaXMuZ2V0VmFsaWRWaW1CdWZmZXJSb3coY3Vyc29yLmdldEJ1ZmZlclJvdygpICsgdGhpcy5nZXRDb3VudCgtMSkpXG4gICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKFtyb3csIEluZmluaXR5XSlcbiAgICBjdXJzb3IuZ29hbENvbHVtbiA9IEluZmluaXR5XG4gIH1cbn1cbk1vdmVUb0xhc3RDaGFyYWN0ZXJPZkxpbmUucmVnaXN0ZXIoKVxuXG5jbGFzcyBNb3ZlVG9MYXN0Tm9uYmxhbmtDaGFyYWN0ZXJPZkxpbmVBbmREb3duIGV4dGVuZHMgTW90aW9uIHtcbiAgaW5jbHVzaXZlID0gdHJ1ZVxuXG4gIG1vdmVDdXJzb3IoY3Vyc29yKSB7XG4gICAgY29uc3Qgcm93ID0gdGhpcy51dGlscy5saW1pdE51bWJlcihjdXJzb3IuZ2V0QnVmZmVyUm93KCkgKyB0aGlzLmdldENvdW50KC0xKSwge21heDogdGhpcy5nZXRWaW1MYXN0QnVmZmVyUm93KCl9KVxuICAgIGNvbnN0IHJhbmdlID0gdGhpcy51dGlscy5maW5kUmFuZ2VJbkJ1ZmZlclJvdyh0aGlzLmVkaXRvciwgL1xcU3xeLywgcm93LCB7ZGlyZWN0aW9uOiBcImJhY2t3YXJkXCJ9KVxuICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihyYW5nZSA/IHJhbmdlLnN0YXJ0IDogbmV3IFBvaW50KHJvdywgMCkpXG4gIH1cbn1cbk1vdmVUb0xhc3ROb25ibGFua0NoYXJhY3Rlck9mTGluZUFuZERvd24ucmVnaXN0ZXIoKVxuXG4vLyBNb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZSBmYWltaWx5XG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIF5cbmNsYXNzIE1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lIGV4dGVuZHMgTW90aW9uIHtcbiAgbW92ZUN1cnNvcihjdXJzb3IpIHtcbiAgICBjb25zdCBwb2ludCA9IHRoaXMuZ2V0Rmlyc3RDaGFyYWN0ZXJQb3NpdGlvbkZvckJ1ZmZlclJvdyhjdXJzb3IuZ2V0QnVmZmVyUm93KCkpXG4gICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHBvaW50KVxuICB9XG59XG5Nb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZS5yZWdpc3RlcigpXG5cbmNsYXNzIE1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lVXAgZXh0ZW5kcyBNb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZSB7XG4gIHdpc2UgPSBcImxpbmV3aXNlXCJcbiAgbW92ZUN1cnNvcihjdXJzb3IpIHtcbiAgICB0aGlzLm1vdmVDdXJzb3JDb3VudFRpbWVzKGN1cnNvciwgKCkgPT4ge1xuICAgICAgY29uc3Qgcm93ID0gdGhpcy5nZXRWYWxpZFZpbUJ1ZmZlclJvdyhjdXJzb3IuZ2V0QnVmZmVyUm93KCkgLSAxKVxuICAgICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKFtyb3csIDBdKVxuICAgIH0pXG4gICAgc3VwZXIubW92ZUN1cnNvcihjdXJzb3IpXG4gIH1cbn1cbk1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lVXAucmVnaXN0ZXIoKVxuXG5jbGFzcyBNb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZURvd24gZXh0ZW5kcyBNb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZSB7XG4gIHdpc2UgPSBcImxpbmV3aXNlXCJcbiAgbW92ZUN1cnNvcihjdXJzb3IpIHtcbiAgICB0aGlzLm1vdmVDdXJzb3JDb3VudFRpbWVzKGN1cnNvciwgKCkgPT4ge1xuICAgICAgY29uc3QgcG9pbnQgPSBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuICAgICAgaWYgKHBvaW50LnJvdyA8IHRoaXMuZ2V0VmltTGFzdEJ1ZmZlclJvdygpKSB7XG4gICAgICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihwb2ludC50cmFuc2xhdGUoWysxLCAwXSkpXG4gICAgICB9XG4gICAgfSlcbiAgICBzdXBlci5tb3ZlQ3Vyc29yKGN1cnNvcilcbiAgfVxufVxuTW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmVEb3duLnJlZ2lzdGVyKClcblxuY2xhc3MgTW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmVBbmREb3duIGV4dGVuZHMgTW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmVEb3duIHtcbiAgZ2V0Q291bnQoKSB7XG4gICAgcmV0dXJuIHN1cGVyLmdldENvdW50KC0xKVxuICB9XG59XG5Nb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZUFuZERvd24ucmVnaXN0ZXIoKVxuXG5jbGFzcyBNb3ZlVG9TY3JlZW5Db2x1bW4gZXh0ZW5kcyBNb3Rpb24ge1xuICBtb3ZlQ3Vyc29yKGN1cnNvcikge1xuICAgIGNvbnN0IGFsbG93T2ZmU2NyZWVuUG9zaXRpb24gPSB0aGlzLmdldENvbmZpZyhcImFsbG93TW92ZVRvT2ZmU2NyZWVuQ29sdW1uT25TY3JlZW5MaW5lTW90aW9uXCIpXG4gICAgY29uc3QgcG9pbnQgPSB0aGlzLnV0aWxzLmdldFNjcmVlblBvc2l0aW9uRm9yU2NyZWVuUm93KHRoaXMuZWRpdG9yLCBjdXJzb3IuZ2V0U2NyZWVuUm93KCksIHRoaXMud2hpY2gsIHtcbiAgICAgIGFsbG93T2ZmU2NyZWVuUG9zaXRpb24sXG4gICAgfSlcbiAgICBpZiAocG9pbnQpIGN1cnNvci5zZXRTY3JlZW5Qb3NpdGlvbihwb2ludClcbiAgfVxufVxuTW92ZVRvU2NyZWVuQ29sdW1uLnJlZ2lzdGVyKGZhbHNlKVxuXG4vLyBrZXltYXA6IGcgMFxuY2xhc3MgTW92ZVRvQmVnaW5uaW5nT2ZTY3JlZW5MaW5lIGV4dGVuZHMgTW92ZVRvU2NyZWVuQ29sdW1uIHtcbiAgd2hpY2ggPSBcImJlZ2lubmluZ1wiXG59XG5Nb3ZlVG9CZWdpbm5pbmdPZlNjcmVlbkxpbmUucmVnaXN0ZXIoKVxuXG4vLyBnIF46IGBtb3ZlLXRvLWZpcnN0LWNoYXJhY3Rlci1vZi1zY3JlZW4tbGluZWBcbmNsYXNzIE1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZTY3JlZW5MaW5lIGV4dGVuZHMgTW92ZVRvU2NyZWVuQ29sdW1uIHtcbiAgd2hpY2ggPSBcImZpcnN0LWNoYXJhY3RlclwiXG59XG5Nb3ZlVG9GaXJzdENoYXJhY3Rlck9mU2NyZWVuTGluZS5yZWdpc3RlcigpXG5cbi8vIGtleW1hcDogZyAkXG5jbGFzcyBNb3ZlVG9MYXN0Q2hhcmFjdGVyT2ZTY3JlZW5MaW5lIGV4dGVuZHMgTW92ZVRvU2NyZWVuQ29sdW1uIHtcbiAgd2hpY2ggPSBcImxhc3QtY2hhcmFjdGVyXCJcbn1cbk1vdmVUb0xhc3RDaGFyYWN0ZXJPZlNjcmVlbkxpbmUucmVnaXN0ZXIoKVxuXG4vLyBrZXltYXA6IGcgZ1xuY2xhc3MgTW92ZVRvRmlyc3RMaW5lIGV4dGVuZHMgTW90aW9uIHtcbiAgd2lzZSA9IFwibGluZXdpc2VcIlxuICBqdW1wID0gdHJ1ZVxuICB2ZXJ0aWNhbE1vdGlvbiA9IHRydWVcbiAgbW92ZVN1Y2Nlc3NPbkxpbmV3aXNlID0gdHJ1ZVxuXG4gIG1vdmVDdXJzb3IoY3Vyc29yKSB7XG4gICAgdGhpcy5zZXRDdXJzb3JCdWZmZXJSb3coY3Vyc29yLCB0aGlzLmdldFZhbGlkVmltQnVmZmVyUm93KHRoaXMuZ2V0Um93KCkpKVxuICAgIGN1cnNvci5hdXRvc2Nyb2xsKHtjZW50ZXI6IHRydWV9KVxuICB9XG5cbiAgZ2V0Um93KCkge1xuICAgIHJldHVybiB0aGlzLmdldENvdW50KC0xKVxuICB9XG59XG5Nb3ZlVG9GaXJzdExpbmUucmVnaXN0ZXIoKVxuXG4vLyBrZXltYXA6IEdcbmNsYXNzIE1vdmVUb0xhc3RMaW5lIGV4dGVuZHMgTW92ZVRvRmlyc3RMaW5lIHtcbiAgZGVmYXVsdENvdW50ID0gSW5maW5pdHlcbn1cbk1vdmVUb0xhc3RMaW5lLnJlZ2lzdGVyKClcblxuLy8ga2V5bWFwOiBOJSBlLmcuIDEwJVxuY2xhc3MgTW92ZVRvTGluZUJ5UGVyY2VudCBleHRlbmRzIE1vdmVUb0ZpcnN0TGluZSB7XG4gIGdldFJvdygpIHtcbiAgICBjb25zdCBwZXJjZW50ID0gdGhpcy51dGlscy5saW1pdE51bWJlcih0aGlzLmdldENvdW50KCksIHttYXg6IDEwMH0pXG4gICAgcmV0dXJuIE1hdGguZmxvb3IodGhpcy5lZGl0b3IuZ2V0TGFzdEJ1ZmZlclJvdygpICogKHBlcmNlbnQgLyAxMDApKVxuICB9XG59XG5Nb3ZlVG9MaW5lQnlQZXJjZW50LnJlZ2lzdGVyKClcblxuY2xhc3MgTW92ZVRvUmVsYXRpdmVMaW5lIGV4dGVuZHMgTW90aW9uIHtcbiAgd2lzZSA9IFwibGluZXdpc2VcIlxuICBtb3ZlU3VjY2Vzc09uTGluZXdpc2UgPSB0cnVlXG5cbiAgbW92ZUN1cnNvcihjdXJzb3IpIHtcbiAgICBsZXQgcm93XG4gICAgbGV0IGNvdW50ID0gdGhpcy5nZXRDb3VudCgpXG4gICAgaWYgKGNvdW50IDwgMCkge1xuICAgICAgLy8gU3VwcG9ydCBuZWdhdGl2ZSBjb3VudFxuICAgICAgLy8gTmVnYXRpdmUgY291bnQgY2FuIGJlIHBhc3NlZCBsaWtlIGBvcGVyYXRpb25TdGFjay5ydW4oXCJNb3ZlVG9SZWxhdGl2ZUxpbmVcIiwge2NvdW50OiAtNX0pYC5cbiAgICAgIC8vIEN1cnJlbnRseSB1c2VkIGluIHZpbS1tb2RlLXBsdXMtZXgtbW9kZSBwa2cuXG4gICAgICBjb3VudCArPSAxXG4gICAgICByb3cgPSB0aGlzLmdldEZvbGRTdGFydFJvd0ZvclJvdyhjdXJzb3IuZ2V0QnVmZmVyUm93KCkpXG4gICAgICB3aGlsZSAoY291bnQrKyA8IDApIHJvdyA9IHRoaXMuZ2V0Rm9sZFN0YXJ0Um93Rm9yUm93KHJvdyAtIDEpXG4gICAgfSBlbHNlIHtcbiAgICAgIGNvdW50IC09IDFcbiAgICAgIHJvdyA9IHRoaXMuZ2V0Rm9sZEVuZFJvd0ZvclJvdyhjdXJzb3IuZ2V0QnVmZmVyUm93KCkpXG4gICAgICB3aGlsZSAoY291bnQtLSA+IDApIHJvdyA9IHRoaXMuZ2V0Rm9sZEVuZFJvd0ZvclJvdyhyb3cgKyAxKVxuICAgIH1cbiAgICB0aGlzLnV0aWxzLnNldEJ1ZmZlclJvdyhjdXJzb3IsIHJvdylcbiAgfVxufVxuTW92ZVRvUmVsYXRpdmVMaW5lLnJlZ2lzdGVyKGZhbHNlKVxuXG5jbGFzcyBNb3ZlVG9SZWxhdGl2ZUxpbmVNaW5pbXVtVHdvIGV4dGVuZHMgTW92ZVRvUmVsYXRpdmVMaW5lIHtcbiAgZ2V0Q291bnQoLi4uYXJncykge1xuICAgIHJldHVybiB0aGlzLnV0aWxzLmxpbWl0TnVtYmVyKHN1cGVyLmdldENvdW50KC4uLmFyZ3MpLCB7bWluOiAyfSlcbiAgfVxufVxuTW92ZVRvUmVsYXRpdmVMaW5lTWluaW11bVR3by5yZWdpc3RlcihmYWxzZSlcblxuLy8gUG9zaXRpb24gY3Vyc29yIHdpdGhvdXQgc2Nyb2xsaW5nLiwgSCwgTSwgTFxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8ga2V5bWFwOiBIXG5jbGFzcyBNb3ZlVG9Ub3BPZlNjcmVlbiBleHRlbmRzIE1vdGlvbiB7XG4gIHdpc2UgPSBcImxpbmV3aXNlXCJcbiAganVtcCA9IHRydWVcbiAgZGVmYXVsdENvdW50ID0gMFxuICB2ZXJ0aWNhbE1vdGlvbiA9IHRydWVcbiAgd2hlcmUgPSBcInRvcFwiXG5cbiAgbW92ZUN1cnNvcihjdXJzb3IpIHtcbiAgICBjb25zdCBidWZmZXJSb3cgPSB0aGlzLmVkaXRvci5idWZmZXJSb3dGb3JTY3JlZW5Sb3codGhpcy5nZXRTY3JlZW5Sb3coKSlcbiAgICB0aGlzLnNldEN1cnNvckJ1ZmZlclJvdyhjdXJzb3IsIGJ1ZmZlclJvdylcbiAgfVxuXG4gIGdldFNjcmVlblJvdygpIHtcbiAgICBjb25zdCB7bGltaXROdW1iZXJ9ID0gdGhpcy51dGlsc1xuICAgIGNvbnN0IGZpcnN0VmlzaWJsZVJvdyA9IHRoaXMuZWRpdG9yLmdldEZpcnN0VmlzaWJsZVNjcmVlblJvdygpXG4gICAgY29uc3QgbGFzdFZpc2libGVSb3cgPSBsaW1pdE51bWJlcih0aGlzLmVkaXRvci5nZXRMYXN0VmlzaWJsZVNjcmVlblJvdygpLCB7bWF4OiB0aGlzLmdldFZpbUxhc3RTY3JlZW5Sb3coKX0pXG5cbiAgICBjb25zdCBiYXNlT2Zmc2V0ID0gMlxuICAgIGlmICh0aGlzLndoZXJlID09PSBcInRvcFwiKSB7XG4gICAgICBjb25zdCBvZmZzZXQgPSBmaXJzdFZpc2libGVSb3cgPT09IDAgPyAwIDogYmFzZU9mZnNldFxuICAgICAgcmV0dXJuIGxpbWl0TnVtYmVyKGZpcnN0VmlzaWJsZVJvdyArIHRoaXMuZ2V0Q291bnQoLTEpLCB7bWluOiBmaXJzdFZpc2libGVSb3cgKyBvZmZzZXQsIG1heDogbGFzdFZpc2libGVSb3d9KVxuICAgIH0gZWxzZSBpZiAodGhpcy53aGVyZSA9PT0gXCJtaWRkbGVcIikge1xuICAgICAgcmV0dXJuIGZpcnN0VmlzaWJsZVJvdyArIE1hdGguZmxvb3IoKGxhc3RWaXNpYmxlUm93IC0gZmlyc3RWaXNpYmxlUm93KSAvIDIpXG4gICAgfSBlbHNlIGlmICh0aGlzLndoZXJlID09PSBcImJvdHRvbVwiKSB7XG4gICAgICBjb25zdCBvZmZzZXQgPSBsYXN0VmlzaWJsZVJvdyA9PT0gdGhpcy5nZXRWaW1MYXN0U2NyZWVuUm93KCkgPyAwIDogYmFzZU9mZnNldCArIDFcbiAgICAgIHJldHVybiBsaW1pdE51bWJlcihsYXN0VmlzaWJsZVJvdyAtIHRoaXMuZ2V0Q291bnQoLTEpLCB7bWluOiBmaXJzdFZpc2libGVSb3csIG1heDogbGFzdFZpc2libGVSb3cgLSBvZmZzZXR9KVxuICAgIH1cbiAgfVxufVxuTW92ZVRvVG9wT2ZTY3JlZW4ucmVnaXN0ZXIoKVxuXG4vLyBrZXltYXA6IE1cbmNsYXNzIE1vdmVUb01pZGRsZU9mU2NyZWVuIGV4dGVuZHMgTW92ZVRvVG9wT2ZTY3JlZW4ge1xuICB3aGVyZSA9IFwibWlkZGxlXCJcbn1cbk1vdmVUb01pZGRsZU9mU2NyZWVuLnJlZ2lzdGVyKClcblxuLy8ga2V5bWFwOiBMXG5jbGFzcyBNb3ZlVG9Cb3R0b21PZlNjcmVlbiBleHRlbmRzIE1vdmVUb1RvcE9mU2NyZWVuIHtcbiAgd2hlcmUgPSBcImJvdHRvbVwiXG59XG5Nb3ZlVG9Cb3R0b21PZlNjcmVlbi5yZWdpc3RlcigpXG5cbi8vIFNjcm9sbGluZ1xuLy8gSGFsZjogY3RybC1kLCBjdHJsLXVcbi8vIEZ1bGw6IGN0cmwtZiwgY3RybC1iXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBbRklYTUVdIGNvdW50IGJlaGF2ZSBkaWZmZXJlbnRseSBmcm9tIG9yaWdpbmFsIFZpbS5cbmNsYXNzIFNjcm9sbCBleHRlbmRzIE1vdGlvbiB7XG4gIHN0YXRpYyBzY3JvbGxUYXNrID0gbnVsbFxuICB2ZXJ0aWNhbE1vdGlvbiA9IHRydWVcblxuICBleGVjdXRlKCkge1xuICAgIHRoaXMuYW1vdW50T2ZSb3dzVG9TY3JvbGwgPSBNYXRoLnRydW5jKHRoaXMuYW1vdW50T2ZQYWdlICogdGhpcy5lZGl0b3IuZ2V0Um93c1BlclBhZ2UoKSAqIHRoaXMuZ2V0Q291bnQoKSlcblxuICAgIHN1cGVyLmV4ZWN1dGUoKVxuXG4gICAgdGhpcy52aW1TdGF0ZS5yZXF1ZXN0U2Nyb2xsKHtcbiAgICAgIGFtb3VudE9mU2NyZWVuUm93czogdGhpcy5hbW91bnRPZlJvd3NUb1Njcm9sbCxcbiAgICAgIGR1cmF0aW9uOiB0aGlzLmdldFNtb290aFNjcm9sbER1YXRpb24oKE1hdGguYWJzKHRoaXMuYW1vdW50T2ZQYWdlKSA9PT0gMSA/IFwiRnVsbFwiIDogXCJIYWxmXCIpICsgXCJTY3JvbGxNb3Rpb25cIiksXG4gICAgfSlcbiAgfVxuXG4gIG1vdmVDdXJzb3IoY3Vyc29yKSB7XG4gICAgY29uc3Qgc2NyZWVuUm93ID0gdGhpcy5nZXRWYWxpZFZpbVNjcmVlblJvdyhjdXJzb3IuZ2V0U2NyZWVuUm93KCkgKyB0aGlzLmFtb3VudE9mUm93c1RvU2Nyb2xsKVxuICAgIHRoaXMuc2V0Q3Vyc29yQnVmZmVyUm93KGN1cnNvciwgdGhpcy5lZGl0b3IuYnVmZmVyUm93Rm9yU2NyZWVuUm93KHNjcmVlblJvdyksIHthdXRvc2Nyb2xsOiBmYWxzZX0pXG4gIH1cbn1cblNjcm9sbC5yZWdpc3RlcihmYWxzZSlcblxuLy8ga2V5bWFwOiBjdHJsLWZcbmNsYXNzIFNjcm9sbEZ1bGxTY3JlZW5Eb3duIGV4dGVuZHMgU2Nyb2xsIHtcbiAgYW1vdW50T2ZQYWdlID0gKzFcbn1cblNjcm9sbEZ1bGxTY3JlZW5Eb3duLnJlZ2lzdGVyKClcblxuLy8ga2V5bWFwOiBjdHJsLWJcbmNsYXNzIFNjcm9sbEZ1bGxTY3JlZW5VcCBleHRlbmRzIFNjcm9sbCB7XG4gIGFtb3VudE9mUGFnZSA9IC0xXG59XG5TY3JvbGxGdWxsU2NyZWVuVXAucmVnaXN0ZXIoKVxuXG4vLyBrZXltYXA6IGN0cmwtZFxuY2xhc3MgU2Nyb2xsSGFsZlNjcmVlbkRvd24gZXh0ZW5kcyBTY3JvbGwge1xuICBhbW91bnRPZlBhZ2UgPSAwLjVcbn1cblNjcm9sbEhhbGZTY3JlZW5Eb3duLnJlZ2lzdGVyKClcblxuLy8ga2V5bWFwOiBjdHJsLXVcbmNsYXNzIFNjcm9sbEhhbGZTY3JlZW5VcCBleHRlbmRzIFNjcm9sbCB7XG4gIGFtb3VudE9mUGFnZSA9IC0wLjVcbn1cblNjcm9sbEhhbGZTY3JlZW5VcC5yZWdpc3RlcigpXG5cbi8vIGtleW1hcDogZyBjdHJsLWRcbmNsYXNzIFNjcm9sbFF1YXJ0ZXJTY3JlZW5Eb3duIGV4dGVuZHMgU2Nyb2xsIHtcbiAgYW1vdW50T2ZQYWdlID0gMC4yNVxufVxuU2Nyb2xsUXVhcnRlclNjcmVlbkRvd24ucmVnaXN0ZXIoKVxuXG4vLyBrZXltYXA6IGcgY3RybC11XG5jbGFzcyBTY3JvbGxRdWFydGVyU2NyZWVuVXAgZXh0ZW5kcyBTY3JvbGwge1xuICBhbW91bnRPZlBhZ2UgPSAtMC4yNVxufVxuU2Nyb2xsUXVhcnRlclNjcmVlblVwLnJlZ2lzdGVyKClcblxuLy8gRmluZFxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8ga2V5bWFwOiBmXG5jbGFzcyBGaW5kIGV4dGVuZHMgTW90aW9uIHtcbiAgYmFja3dhcmRzID0gZmFsc2VcbiAgaW5jbHVzaXZlID0gdHJ1ZVxuICBvZmZzZXQgPSAwXG4gIHJlcXVpcmVJbnB1dCA9IHRydWVcbiAgY2FzZVNlbnNpdGl2aXR5S2luZCA9IFwiRmluZFwiXG5cbiAgcmVzdG9yZUVkaXRvclN0YXRlKCkge1xuICAgIGlmICh0aGlzLl9yZXN0b3JlRWRpdG9yU3RhdGUpIHRoaXMuX3Jlc3RvcmVFZGl0b3JTdGF0ZSgpXG4gICAgdGhpcy5fcmVzdG9yZUVkaXRvclN0YXRlID0gbnVsbFxuICB9XG5cbiAgY2FuY2VsT3BlcmF0aW9uKCkge1xuICAgIHRoaXMucmVzdG9yZUVkaXRvclN0YXRlKClcbiAgICBzdXBlci5jYW5jZWxPcGVyYXRpb24oKVxuICB9XG5cbiAgaW5pdGlhbGl6ZSgpIHtcbiAgICBpZiAodGhpcy5nZXRDb25maWcoXCJyZXVzZUZpbmRGb3JSZXBlYXRGaW5kXCIpKSB0aGlzLnJlcGVhdElmTmVjZXNzYXJ5KClcblxuICAgIGlmICghdGhpcy5yZXBlYXRlZCkge1xuICAgICAgY29uc3QgY2hhcnNNYXggPSB0aGlzLmdldENvbmZpZyhcImZpbmRDaGFyc01heFwiKVxuICAgICAgY29uc3Qgb3B0aW9uc0Jhc2UgPSB7cHVycG9zZTogXCJmaW5kXCIsIGNoYXJzTWF4fVxuXG4gICAgICBpZiAoY2hhcnNNYXggPT09IDEpIHtcbiAgICAgICAgdGhpcy5mb2N1c0lucHV0KG9wdGlvbnNCYXNlKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fcmVzdG9yZUVkaXRvclN0YXRlID0gdGhpcy51dGlscy5zYXZlRWRpdG9yU3RhdGUodGhpcy5lZGl0b3IpXG4gICAgICAgIGNvbnN0IG9wdGlvbnMgPSB7XG4gICAgICAgICAgYXV0b0NvbmZpcm1UaW1lb3V0OiB0aGlzLmdldENvbmZpZyhcImZpbmRDb25maXJtQnlUaW1lb3V0XCIpLFxuICAgICAgICAgIG9uQ29uZmlybTogaW5wdXQgPT4ge1xuICAgICAgICAgICAgdGhpcy5pbnB1dCA9IGlucHV0XG4gICAgICAgICAgICBpZiAoaW5wdXQpIHRoaXMucHJvY2Vzc09wZXJhdGlvbigpXG4gICAgICAgICAgICBlbHNlIHRoaXMuY2FuY2VsT3BlcmF0aW9uKClcbiAgICAgICAgICB9LFxuICAgICAgICAgIG9uQ2hhbmdlOiBwcmVDb25maXJtZWRDaGFycyA9PiB7XG4gICAgICAgICAgICB0aGlzLnByZUNvbmZpcm1lZENoYXJzID0gcHJlQ29uZmlybWVkQ2hhcnNcbiAgICAgICAgICAgIHRoaXMuaGlnaGxpZ2h0VGV4dEluQ3Vyc29yUm93cyh0aGlzLnByZUNvbmZpcm1lZENoYXJzLCBcInByZS1jb25maXJtXCIsIHRoaXMuaXNCYWNrd2FyZHMoKSlcbiAgICAgICAgICB9LFxuICAgICAgICAgIG9uQ2FuY2VsOiAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnZpbVN0YXRlLmhpZ2hsaWdodEZpbmQuY2xlYXJNYXJrZXJzKClcbiAgICAgICAgICAgIHRoaXMuY2FuY2VsT3BlcmF0aW9uKClcbiAgICAgICAgICB9LFxuICAgICAgICAgIGNvbW1hbmRzOiB7XG4gICAgICAgICAgICBcInZpbS1tb2RlLXBsdXM6ZmluZC1uZXh0LXByZS1jb25maXJtZWRcIjogKCkgPT4gdGhpcy5maW5kUHJlQ29uZmlybWVkKCsxKSxcbiAgICAgICAgICAgIFwidmltLW1vZGUtcGx1czpmaW5kLXByZXZpb3VzLXByZS1jb25maXJtZWRcIjogKCkgPT4gdGhpcy5maW5kUHJlQ29uZmlybWVkKC0xKSxcbiAgICAgICAgICB9LFxuICAgICAgICB9XG4gICAgICAgIHRoaXMuZm9jdXNJbnB1dChPYmplY3QuYXNzaWduKG9wdGlvbnMsIG9wdGlvbnNCYXNlKSlcbiAgICAgIH1cbiAgICB9XG4gICAgc3VwZXIuaW5pdGlhbGl6ZSgpXG4gIH1cblxuICBmaW5kUHJlQ29uZmlybWVkKGRlbHRhKSB7XG4gICAgaWYgKHRoaXMucHJlQ29uZmlybWVkQ2hhcnMgJiYgdGhpcy5nZXRDb25maWcoXCJoaWdobGlnaHRGaW5kQ2hhclwiKSkge1xuICAgICAgY29uc3QgaW5kZXggPSB0aGlzLmhpZ2hsaWdodFRleHRJbkN1cnNvclJvd3MoXG4gICAgICAgIHRoaXMucHJlQ29uZmlybWVkQ2hhcnMsXG4gICAgICAgIFwicHJlLWNvbmZpcm1cIixcbiAgICAgICAgdGhpcy5pc0JhY2t3YXJkcygpLFxuICAgICAgICB0aGlzLmdldENvdW50KC0xKSArIGRlbHRhLFxuICAgICAgICB0cnVlXG4gICAgICApXG4gICAgICB0aGlzLmNvdW50ID0gaW5kZXggKyAxXG4gICAgfVxuICB9XG5cbiAgcmVwZWF0SWZOZWNlc3NhcnkoKSB7XG4gICAgY29uc3QgZmluZENvbW1hbmROYW1lcyA9IFtcIkZpbmRcIiwgXCJGaW5kQmFja3dhcmRzXCIsIFwiVGlsbFwiLCBcIlRpbGxCYWNrd2FyZHNcIl1cbiAgICBjb25zdCBjdXJyZW50RmluZCA9IHRoaXMuZ2xvYmFsU3RhdGUuZ2V0KFwiY3VycmVudEZpbmRcIilcbiAgICBpZiAoY3VycmVudEZpbmQgJiYgZmluZENvbW1hbmROYW1lcy5pbmNsdWRlcyh0aGlzLnZpbVN0YXRlLm9wZXJhdGlvblN0YWNrLmdldExhc3RDb21tYW5kTmFtZSgpKSkge1xuICAgICAgdGhpcy5pbnB1dCA9IGN1cnJlbnRGaW5kLmlucHV0XG4gICAgICB0aGlzLnJlcGVhdGVkID0gdHJ1ZVxuICAgIH1cbiAgfVxuXG4gIGlzQmFja3dhcmRzKCkge1xuICAgIHJldHVybiB0aGlzLmJhY2t3YXJkc1xuICB9XG5cbiAgZXhlY3V0ZSgpIHtcbiAgICBzdXBlci5leGVjdXRlKClcbiAgICBsZXQgZGVjb3JhdGlvblR5cGUgPSBcInBvc3QtY29uZmlybVwiXG4gICAgaWYgKHRoaXMub3BlcmF0b3IgJiYgIXRoaXMub3BlcmF0b3IuaW5zdGFuY2VvZihcIlNlbGVjdEJhc2VcIikpIHtcbiAgICAgIGRlY29yYXRpb25UeXBlICs9IFwiIGxvbmdcIlxuICAgIH1cblxuICAgIC8vIEhBQ0s6IFdoZW4gcmVwZWF0ZWQgYnkgXCIsXCIsIHRoaXMuYmFja3dhcmRzIGlzIHRlbXBvcmFyeSBpbnZlcnRlZCBhbmRcbiAgICAvLyByZXN0b3JlZCBhZnRlciBleGVjdXRpb24gZmluaXNoZWQuXG4gICAgLy8gQnV0IGZpbmFsIGhpZ2hsaWdodFRleHRJbkN1cnNvclJvd3MgaXMgZXhlY3V0ZWQgaW4gYXN5bmMoPWFmdGVyIG9wZXJhdGlvbiBmaW5pc2hlZCkuXG4gICAgLy8gVGh1cyB3ZSBuZWVkIHRvIHByZXNlcnZlIGJlZm9yZSByZXN0b3JlZCBgYmFja3dhcmRzYCB2YWx1ZSBhbmQgcGFzcyBpdC5cbiAgICBjb25zdCBiYWNrd2FyZHMgPSB0aGlzLmlzQmFja3dhcmRzKClcbiAgICB0aGlzLmVkaXRvci5jb21wb25lbnQuZ2V0TmV4dFVwZGF0ZVByb21pc2UoKS50aGVuKCgpID0+IHtcbiAgICAgIHRoaXMuaGlnaGxpZ2h0VGV4dEluQ3Vyc29yUm93cyh0aGlzLmlucHV0LCBkZWNvcmF0aW9uVHlwZSwgYmFja3dhcmRzKVxuICAgIH0pXG4gIH1cblxuICBnZXRQb2ludChmcm9tUG9pbnQpIHtcbiAgICBjb25zdCBzY2FuUmFuZ2UgPSB0aGlzLmVkaXRvci5idWZmZXJSYW5nZUZvckJ1ZmZlclJvdyhmcm9tUG9pbnQucm93KVxuICAgIGNvbnN0IHBvaW50cyA9IFtdXG4gICAgY29uc3QgcmVnZXggPSB0aGlzLmdldFJlZ2V4KHRoaXMuaW5wdXQpXG4gICAgY29uc3QgaW5kZXhXYW50QWNjZXNzID0gdGhpcy5nZXRDb3VudCgtMSlcblxuICAgIGNvbnN0IHRyYW5zbGF0aW9uID0gbmV3IFBvaW50KDAsIHRoaXMuaXNCYWNrd2FyZHMoKSA/IHRoaXMub2Zmc2V0IDogLXRoaXMub2Zmc2V0KVxuICAgIGlmICh0aGlzLnJlcGVhdGVkKSB7XG4gICAgICBmcm9tUG9pbnQgPSBmcm9tUG9pbnQudHJhbnNsYXRlKHRyYW5zbGF0aW9uLm5lZ2F0ZSgpKVxuICAgIH1cblxuICAgIGlmICh0aGlzLmlzQmFja3dhcmRzKCkpIHtcbiAgICAgIGlmICh0aGlzLmdldENvbmZpZyhcImZpbmRBY3Jvc3NMaW5lc1wiKSkgc2NhblJhbmdlLnN0YXJ0ID0gUG9pbnQuWkVST1xuXG4gICAgICB0aGlzLmVkaXRvci5iYWNrd2FyZHNTY2FuSW5CdWZmZXJSYW5nZShyZWdleCwgc2NhblJhbmdlLCAoe3JhbmdlLCBzdG9wfSkgPT4ge1xuICAgICAgICBpZiAocmFuZ2Uuc3RhcnQuaXNMZXNzVGhhbihmcm9tUG9pbnQpKSB7XG4gICAgICAgICAgcG9pbnRzLnB1c2gocmFuZ2Uuc3RhcnQpXG4gICAgICAgICAgaWYgKHBvaW50cy5sZW5ndGggPiBpbmRleFdhbnRBY2Nlc3MpIHtcbiAgICAgICAgICAgIHN0b3AoKVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHRoaXMuZ2V0Q29uZmlnKFwiZmluZEFjcm9zc0xpbmVzXCIpKSBzY2FuUmFuZ2UuZW5kID0gdGhpcy5lZGl0b3IuZ2V0RW9mQnVmZmVyUG9zaXRpb24oKVxuICAgICAgdGhpcy5lZGl0b3Iuc2NhbkluQnVmZmVyUmFuZ2UocmVnZXgsIHNjYW5SYW5nZSwgKHtyYW5nZSwgc3RvcH0pID0+IHtcbiAgICAgICAgaWYgKHJhbmdlLnN0YXJ0LmlzR3JlYXRlclRoYW4oZnJvbVBvaW50KSkge1xuICAgICAgICAgIHBvaW50cy5wdXNoKHJhbmdlLnN0YXJ0KVxuICAgICAgICAgIGlmIChwb2ludHMubGVuZ3RoID4gaW5kZXhXYW50QWNjZXNzKSB7XG4gICAgICAgICAgICBzdG9wKClcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfVxuXG4gICAgY29uc3QgcG9pbnQgPSBwb2ludHNbaW5kZXhXYW50QWNjZXNzXVxuICAgIGlmIChwb2ludCkgcmV0dXJuIHBvaW50LnRyYW5zbGF0ZSh0cmFuc2xhdGlvbilcbiAgfVxuXG4gIC8vIEZJWE1FOiBiYWQgbmFtaW5nLCB0aGlzIGZ1bmN0aW9uIG11c3QgcmV0dXJuIGluZGV4XG4gIGhpZ2hsaWdodFRleHRJbkN1cnNvclJvd3ModGV4dCwgZGVjb3JhdGlvblR5cGUsIGJhY2t3YXJkcywgaW5kZXggPSB0aGlzLmdldENvdW50KC0xKSwgYWRqdXN0SW5kZXggPSBmYWxzZSkge1xuICAgIGlmICghdGhpcy5nZXRDb25maWcoXCJoaWdobGlnaHRGaW5kQ2hhclwiKSkgcmV0dXJuXG5cbiAgICByZXR1cm4gdGhpcy52aW1TdGF0ZS5oaWdobGlnaHRGaW5kLmhpZ2hsaWdodEN1cnNvclJvd3MoXG4gICAgICB0aGlzLmdldFJlZ2V4KHRleHQpLFxuICAgICAgZGVjb3JhdGlvblR5cGUsXG4gICAgICBiYWNrd2FyZHMsXG4gICAgICB0aGlzLm9mZnNldCxcbiAgICAgIGluZGV4LFxuICAgICAgYWRqdXN0SW5kZXhcbiAgICApXG4gIH1cblxuICBtb3ZlQ3Vyc29yKGN1cnNvcikge1xuICAgIGNvbnN0IHBvaW50ID0gdGhpcy5nZXRQb2ludChjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKSlcbiAgICBpZiAocG9pbnQpIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihwb2ludClcbiAgICBlbHNlIHRoaXMucmVzdG9yZUVkaXRvclN0YXRlKClcblxuICAgIGlmICghdGhpcy5yZXBlYXRlZCkgdGhpcy5nbG9iYWxTdGF0ZS5zZXQoXCJjdXJyZW50RmluZFwiLCB0aGlzKVxuICB9XG5cbiAgZ2V0UmVnZXgodGVybSkge1xuICAgIGNvbnN0IG1vZGlmaWVycyA9IHRoaXMuaXNDYXNlU2Vuc2l0aXZlKHRlcm0pID8gXCJnXCIgOiBcImdpXCJcbiAgICByZXR1cm4gbmV3IFJlZ0V4cChfLmVzY2FwZVJlZ0V4cCh0ZXJtKSwgbW9kaWZpZXJzKVxuICB9XG59XG5GaW5kLnJlZ2lzdGVyKClcblxuLy8ga2V5bWFwOiBGXG5jbGFzcyBGaW5kQmFja3dhcmRzIGV4dGVuZHMgRmluZCB7XG4gIGluY2x1c2l2ZSA9IGZhbHNlXG4gIGJhY2t3YXJkcyA9IHRydWVcbn1cbkZpbmRCYWNrd2FyZHMucmVnaXN0ZXIoKVxuXG4vLyBrZXltYXA6IHRcbmNsYXNzIFRpbGwgZXh0ZW5kcyBGaW5kIHtcbiAgb2Zmc2V0ID0gMVxuICBnZXRQb2ludCguLi5hcmdzKSB7XG4gICAgY29uc3QgcG9pbnQgPSBzdXBlci5nZXRQb2ludCguLi5hcmdzKVxuICAgIHRoaXMubW92ZVN1Y2NlZWRlZCA9IHBvaW50ICE9IG51bGxcbiAgICByZXR1cm4gcG9pbnRcbiAgfVxufVxuVGlsbC5yZWdpc3RlcigpXG5cbi8vIGtleW1hcDogVFxuY2xhc3MgVGlsbEJhY2t3YXJkcyBleHRlbmRzIFRpbGwge1xuICBpbmNsdXNpdmUgPSBmYWxzZVxuICBiYWNrd2FyZHMgPSB0cnVlXG59XG5UaWxsQmFja3dhcmRzLnJlZ2lzdGVyKClcblxuLy8gTWFya1xuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8ga2V5bWFwOiBgXG5jbGFzcyBNb3ZlVG9NYXJrIGV4dGVuZHMgTW90aW9uIHtcbiAganVtcCA9IHRydWVcbiAgcmVxdWlyZUlucHV0ID0gdHJ1ZVxuICBpbnB1dCA9IG51bGxcbiAgbW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmUgPSBmYWxzZVxuXG4gIGluaXRpYWxpemUoKSB7XG4gICAgdGhpcy5yZWFkQ2hhcigpXG4gICAgc3VwZXIuaW5pdGlhbGl6ZSgpXG4gIH1cblxuICBtb3ZlQ3Vyc29yKGN1cnNvcikge1xuICAgIGxldCBwb2ludCA9IHRoaXMudmltU3RhdGUubWFyay5nZXQodGhpcy5pbnB1dClcbiAgICBpZiAocG9pbnQpIHtcbiAgICAgIGlmICh0aGlzLm1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lKSB7XG4gICAgICAgIHBvaW50ID0gdGhpcy5nZXRGaXJzdENoYXJhY3RlclBvc2l0aW9uRm9yQnVmZmVyUm93KHBvaW50LnJvdylcbiAgICAgIH1cbiAgICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihwb2ludClcbiAgICAgIGN1cnNvci5hdXRvc2Nyb2xsKHtjZW50ZXI6IHRydWV9KVxuICAgIH1cbiAgfVxufVxuTW92ZVRvTWFyay5yZWdpc3RlcigpXG5cbi8vIGtleW1hcDogJ1xuY2xhc3MgTW92ZVRvTWFya0xpbmUgZXh0ZW5kcyBNb3ZlVG9NYXJrIHtcbiAgd2lzZSA9IFwibGluZXdpc2VcIlxuICBtb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZSA9IHRydWVcbn1cbk1vdmVUb01hcmtMaW5lLnJlZ2lzdGVyKClcblxuLy8gRm9sZFxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgTW92ZVRvUHJldmlvdXNGb2xkU3RhcnQgZXh0ZW5kcyBNb3Rpb24ge1xuICB3aXNlID0gXCJjaGFyYWN0ZXJ3aXNlXCJcbiAgd2hpY2ggPSBcInN0YXJ0XCJcbiAgZGlyZWN0aW9uID0gXCJwcmV2aW91c1wiXG5cbiAgZXhlY3V0ZSgpIHtcbiAgICB0aGlzLnJvd3MgPSB0aGlzLmdldEZvbGRSb3dzKHRoaXMud2hpY2gpXG4gICAgaWYgKHRoaXMuZGlyZWN0aW9uID09PSBcInByZXZpb3VzXCIpIHRoaXMucm93cy5yZXZlcnNlKClcbiAgICBzdXBlci5leGVjdXRlKClcbiAgfVxuXG4gIGdldEZvbGRSb3dzKHdoaWNoKSB7XG4gICAgY29uc3QgdG9Sb3cgPSAoW3N0YXJ0Um93LCBlbmRSb3ddKSA9PiAod2hpY2ggPT09IFwic3RhcnRcIiA/IHN0YXJ0Um93IDogZW5kUm93KVxuICAgIGNvbnN0IHJvd3MgPSB0aGlzLnV0aWxzLmdldENvZGVGb2xkUm93UmFuZ2VzKHRoaXMuZWRpdG9yKS5tYXAodG9Sb3cpXG4gICAgcmV0dXJuIF8uc29ydEJ5KF8udW5pcShyb3dzKSwgcm93ID0+IHJvdylcbiAgfVxuXG4gIGdldFNjYW5Sb3dzKGN1cnNvcikge1xuICAgIGNvbnN0IGN1cnNvclJvdyA9IGN1cnNvci5nZXRCdWZmZXJSb3coKVxuICAgIGNvbnN0IGlzVmFsZCA9IHRoaXMuZGlyZWN0aW9uID09PSBcInByZXZpb3VzXCIgPyByb3cgPT4gcm93IDwgY3Vyc29yUm93IDogcm93ID0+IHJvdyA+IGN1cnNvclJvd1xuICAgIHJldHVybiB0aGlzLnJvd3MuZmlsdGVyKGlzVmFsZClcbiAgfVxuXG4gIGRldGVjdFJvdyhjdXJzb3IpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRTY2FuUm93cyhjdXJzb3IpWzBdXG4gIH1cblxuICBtb3ZlQ3Vyc29yKGN1cnNvcikge1xuICAgIHRoaXMubW92ZUN1cnNvckNvdW50VGltZXMoY3Vyc29yLCAoKSA9PiB7XG4gICAgICBjb25zdCByb3cgPSB0aGlzLmRldGVjdFJvdyhjdXJzb3IpXG4gICAgICBpZiAocm93ICE9IG51bGwpIHRoaXMudXRpbHMubW92ZUN1cnNvclRvRmlyc3RDaGFyYWN0ZXJBdFJvdyhjdXJzb3IsIHJvdylcbiAgICB9KVxuICB9XG59XG5Nb3ZlVG9QcmV2aW91c0ZvbGRTdGFydC5yZWdpc3RlcigpXG5cbmNsYXNzIE1vdmVUb05leHRGb2xkU3RhcnQgZXh0ZW5kcyBNb3ZlVG9QcmV2aW91c0ZvbGRTdGFydCB7XG4gIGRpcmVjdGlvbiA9IFwibmV4dFwiXG59XG5Nb3ZlVG9OZXh0Rm9sZFN0YXJ0LnJlZ2lzdGVyKClcblxuY2xhc3MgTW92ZVRvUHJldmlvdXNGb2xkU3RhcnRXaXRoU2FtZUluZGVudCBleHRlbmRzIE1vdmVUb1ByZXZpb3VzRm9sZFN0YXJ0IHtcbiAgZGV0ZWN0Um93KGN1cnNvcikge1xuICAgIGNvbnN0IGJhc2VJbmRlbnRMZXZlbCA9IHRoaXMuZWRpdG9yLmluZGVudGF0aW9uRm9yQnVmZmVyUm93KGN1cnNvci5nZXRCdWZmZXJSb3coKSlcbiAgICByZXR1cm4gdGhpcy5nZXRTY2FuUm93cyhjdXJzb3IpLmZpbmQocm93ID0+IHRoaXMuZWRpdG9yLmluZGVudGF0aW9uRm9yQnVmZmVyUm93KHJvdykgPT09IGJhc2VJbmRlbnRMZXZlbClcbiAgfVxufVxuTW92ZVRvUHJldmlvdXNGb2xkU3RhcnRXaXRoU2FtZUluZGVudC5yZWdpc3RlcigpXG5cbmNsYXNzIE1vdmVUb05leHRGb2xkU3RhcnRXaXRoU2FtZUluZGVudCBleHRlbmRzIE1vdmVUb1ByZXZpb3VzRm9sZFN0YXJ0V2l0aFNhbWVJbmRlbnQge1xuICBkaXJlY3Rpb24gPSBcIm5leHRcIlxufVxuTW92ZVRvTmV4dEZvbGRTdGFydFdpdGhTYW1lSW5kZW50LnJlZ2lzdGVyKClcblxuY2xhc3MgTW92ZVRvUHJldmlvdXNGb2xkRW5kIGV4dGVuZHMgTW92ZVRvUHJldmlvdXNGb2xkU3RhcnQge1xuICB3aGljaCA9IFwiZW5kXCJcbn1cbk1vdmVUb1ByZXZpb3VzRm9sZEVuZC5yZWdpc3RlcigpXG5cbmNsYXNzIE1vdmVUb05leHRGb2xkRW5kIGV4dGVuZHMgTW92ZVRvUHJldmlvdXNGb2xkRW5kIHtcbiAgZGlyZWN0aW9uID0gXCJuZXh0XCJcbn1cbk1vdmVUb05leHRGb2xkRW5kLnJlZ2lzdGVyKClcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgTW92ZVRvUHJldmlvdXNGdW5jdGlvbiBleHRlbmRzIE1vdmVUb1ByZXZpb3VzRm9sZFN0YXJ0IHtcbiAgZGlyZWN0aW9uID0gXCJwcmV2aW91c1wiXG4gIGRldGVjdFJvdyhjdXJzb3IpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRTY2FuUm93cyhjdXJzb3IpLmZpbmQocm93ID0+IHRoaXMudXRpbHMuaXNJbmNsdWRlRnVuY3Rpb25TY29wZUZvclJvdyh0aGlzLmVkaXRvciwgcm93KSlcbiAgfVxufVxuTW92ZVRvUHJldmlvdXNGdW5jdGlvbi5yZWdpc3RlcigpXG5cbmNsYXNzIE1vdmVUb05leHRGdW5jdGlvbiBleHRlbmRzIE1vdmVUb1ByZXZpb3VzRnVuY3Rpb24ge1xuICBkaXJlY3Rpb24gPSBcIm5leHRcIlxufVxuTW92ZVRvTmV4dEZ1bmN0aW9uLnJlZ2lzdGVyKClcblxuY2xhc3MgTW92ZVRvUHJldmlvdXNGdW5jdGlvbkFuZFJlZHJhd0N1cnNvckxpbmVBdFVwcGVyTWlkZGxlIGV4dGVuZHMgTW92ZVRvUHJldmlvdXNGdW5jdGlvbiB7XG4gIGV4ZWN1dGUoKSB7XG4gICAgc3VwZXIuZXhlY3V0ZSgpXG4gICAgdGhpcy5nZXRJbnN0YW5jZShcIlJlZHJhd0N1cnNvckxpbmVBdFVwcGVyTWlkZGxlXCIpLmV4ZWN1dGUoKVxuICB9XG59XG5Nb3ZlVG9QcmV2aW91c0Z1bmN0aW9uQW5kUmVkcmF3Q3Vyc29yTGluZUF0VXBwZXJNaWRkbGUucmVnaXN0ZXIoKVxuXG5jbGFzcyBNb3ZlVG9OZXh0RnVuY3Rpb25BbmRSZWRyYXdDdXJzb3JMaW5lQXRVcHBlck1pZGRsZSBleHRlbmRzIE1vdmVUb1ByZXZpb3VzRnVuY3Rpb25BbmRSZWRyYXdDdXJzb3JMaW5lQXRVcHBlck1pZGRsZSB7XG4gIGRpcmVjdGlvbiA9IFwibmV4dFwiXG59XG5Nb3ZlVG9OZXh0RnVuY3Rpb25BbmRSZWRyYXdDdXJzb3JMaW5lQXRVcHBlck1pZGRsZS5yZWdpc3RlcigpXG5cbi8vIFNjb3BlIGJhc2VkXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBNb3ZlVG9Qb3NpdGlvbkJ5U2NvcGUgZXh0ZW5kcyBNb3Rpb24ge1xuICBkaXJlY3Rpb24gPSBcImJhY2t3YXJkXCJcbiAgc2NvcGUgPSBcIi5cIlxuXG4gIG1vdmVDdXJzb3IoY3Vyc29yKSB7XG4gICAgdGhpcy5tb3ZlQ3Vyc29yQ291bnRUaW1lcyhjdXJzb3IsICgpID0+IHtcbiAgICAgIGNvbnN0IGN1cnNvclBvc2l0aW9uID0gY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKClcbiAgICAgIGNvbnN0IHBvaW50ID0gdGhpcy51dGlscy5kZXRlY3RTY29wZVN0YXJ0UG9zaXRpb25Gb3JTY29wZSh0aGlzLmVkaXRvciwgY3Vyc29yUG9zaXRpb24sIHRoaXMuZGlyZWN0aW9uLCB0aGlzLnNjb3BlKVxuICAgICAgaWYgKHBvaW50KSBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24ocG9pbnQpXG4gICAgfSlcbiAgfVxufVxuTW92ZVRvUG9zaXRpb25CeVNjb3BlLnJlZ2lzdGVyKGZhbHNlKVxuXG5jbGFzcyBNb3ZlVG9QcmV2aW91c1N0cmluZyBleHRlbmRzIE1vdmVUb1Bvc2l0aW9uQnlTY29wZSB7XG4gIGRpcmVjdGlvbiA9IFwiYmFja3dhcmRcIlxuICBzY29wZSA9IFwic3RyaW5nLmJlZ2luXCJcbn1cbk1vdmVUb1ByZXZpb3VzU3RyaW5nLnJlZ2lzdGVyKClcblxuY2xhc3MgTW92ZVRvTmV4dFN0cmluZyBleHRlbmRzIE1vdmVUb1ByZXZpb3VzU3RyaW5nIHtcbiAgZGlyZWN0aW9uID0gXCJmb3J3YXJkXCJcbn1cbk1vdmVUb05leHRTdHJpbmcucmVnaXN0ZXIoKVxuXG5jbGFzcyBNb3ZlVG9QcmV2aW91c051bWJlciBleHRlbmRzIE1vdmVUb1Bvc2l0aW9uQnlTY29wZSB7XG4gIGRpcmVjdGlvbiA9IFwiYmFja3dhcmRcIlxuICBzY29wZSA9IFwiY29uc3RhbnQubnVtZXJpY1wiXG59XG5Nb3ZlVG9QcmV2aW91c051bWJlci5yZWdpc3RlcigpXG5cbmNsYXNzIE1vdmVUb05leHROdW1iZXIgZXh0ZW5kcyBNb3ZlVG9QcmV2aW91c051bWJlciB7XG4gIGRpcmVjdGlvbiA9IFwiZm9yd2FyZFwiXG59XG5Nb3ZlVG9OZXh0TnVtYmVyLnJlZ2lzdGVyKClcblxuY2xhc3MgTW92ZVRvTmV4dE9jY3VycmVuY2UgZXh0ZW5kcyBNb3Rpb24ge1xuICAvLyBFbnN1cmUgdGhpcyBjb21tYW5kIGlzIGF2YWlsYWJsZSB3aGVuIG9ubHkgaGFzLW9jY3VycmVuY2VcbiAgc3RhdGljIGNvbW1hbmRTY29wZSA9IFwiYXRvbS10ZXh0LWVkaXRvci52aW0tbW9kZS1wbHVzLmhhcy1vY2N1cnJlbmNlXCJcbiAganVtcCA9IHRydWVcbiAgZGlyZWN0aW9uID0gXCJuZXh0XCJcblxuICBleGVjdXRlKCkge1xuICAgIHRoaXMucmFuZ2VzID0gdGhpcy51dGlscy5zb3J0UmFuZ2VzKHRoaXMub2NjdXJyZW5jZU1hbmFnZXIuZ2V0TWFya2VycygpLm1hcChtYXJrZXIgPT4gbWFya2VyLmdldEJ1ZmZlclJhbmdlKCkpKVxuICAgIHN1cGVyLmV4ZWN1dGUoKVxuICB9XG5cbiAgbW92ZUN1cnNvcihjdXJzb3IpIHtcbiAgICBjb25zdCByYW5nZSA9IHRoaXMucmFuZ2VzW3RoaXMudXRpbHMuZ2V0SW5kZXgodGhpcy5nZXRJbmRleChjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKSksIHRoaXMucmFuZ2VzKV1cbiAgICBjb25zdCBwb2ludCA9IHJhbmdlLnN0YXJ0XG4gICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHBvaW50LCB7YXV0b3Njcm9sbDogZmFsc2V9KVxuXG4gICAgdGhpcy5lZGl0b3IudW5mb2xkQnVmZmVyUm93KHBvaW50LnJvdylcbiAgICBpZiAoY3Vyc29yLmlzTGFzdEN1cnNvcigpKSB7XG4gICAgICB0aGlzLnV0aWxzLnNtYXJ0U2Nyb2xsVG9CdWZmZXJQb3NpdGlvbih0aGlzLmVkaXRvciwgcG9pbnQpXG4gICAgfVxuXG4gICAgaWYgKHRoaXMuZ2V0Q29uZmlnKFwiZmxhc2hPbk1vdmVUb09jY3VycmVuY2VcIikpIHtcbiAgICAgIHRoaXMudmltU3RhdGUuZmxhc2gocmFuZ2UsIHt0eXBlOiBcInNlYXJjaFwifSlcbiAgICB9XG4gIH1cblxuICBnZXRJbmRleChmcm9tUG9pbnQpIHtcbiAgICBjb25zdCBpbmRleCA9IHRoaXMucmFuZ2VzLmZpbmRJbmRleChyYW5nZSA9PiByYW5nZS5zdGFydC5pc0dyZWF0ZXJUaGFuKGZyb21Qb2ludCkpXG4gICAgcmV0dXJuIChpbmRleCA+PSAwID8gaW5kZXggOiAwKSArIHRoaXMuZ2V0Q291bnQoLTEpXG4gIH1cbn1cbk1vdmVUb05leHRPY2N1cnJlbmNlLnJlZ2lzdGVyKClcblxuY2xhc3MgTW92ZVRvUHJldmlvdXNPY2N1cnJlbmNlIGV4dGVuZHMgTW92ZVRvTmV4dE9jY3VycmVuY2Uge1xuICBkaXJlY3Rpb24gPSBcInByZXZpb3VzXCJcblxuICBnZXRJbmRleChmcm9tUG9pbnQpIHtcbiAgICBjb25zdCByYW5nZXMgPSB0aGlzLnJhbmdlcy5zbGljZSgpLnJldmVyc2UoKVxuICAgIGNvbnN0IHJhbmdlID0gcmFuZ2VzLmZpbmQocmFuZ2UgPT4gcmFuZ2UuZW5kLmlzTGVzc1RoYW4oZnJvbVBvaW50KSlcbiAgICBjb25zdCBpbmRleCA9IHJhbmdlID8gdGhpcy5yYW5nZXMuaW5kZXhPZihyYW5nZSkgOiB0aGlzLnJhbmdlcy5sZW5ndGggLSAxXG4gICAgcmV0dXJuIGluZGV4IC0gdGhpcy5nZXRDb3VudCgtMSlcbiAgfVxufVxuTW92ZVRvUHJldmlvdXNPY2N1cnJlbmNlLnJlZ2lzdGVyKClcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8ga2V5bWFwOiAlXG5jbGFzcyBNb3ZlVG9QYWlyIGV4dGVuZHMgTW90aW9uIHtcbiAgaW5jbHVzaXZlID0gdHJ1ZVxuICBqdW1wID0gdHJ1ZVxuICBtZW1iZXIgPSBbXCJQYXJlbnRoZXNpc1wiLCBcIkN1cmx5QnJhY2tldFwiLCBcIlNxdWFyZUJyYWNrZXRcIl1cblxuICBtb3ZlQ3Vyc29yKGN1cnNvcikge1xuICAgIGNvbnN0IHBvaW50ID0gdGhpcy5nZXRQb2ludChjdXJzb3IpXG4gICAgaWYgKHBvaW50KSBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24ocG9pbnQpXG4gIH1cblxuICBnZXRQb2ludEZvclRhZyhwb2ludCkge1xuICAgIGNvbnN0IHBhaXJJbmZvID0gdGhpcy5nZXRJbnN0YW5jZShcIkFUYWdcIikuZ2V0UGFpckluZm8ocG9pbnQpXG4gICAgaWYgKCFwYWlySW5mbykgcmV0dXJuXG5cbiAgICBsZXQge29wZW5SYW5nZSwgY2xvc2VSYW5nZX0gPSBwYWlySW5mb1xuICAgIG9wZW5SYW5nZSA9IG9wZW5SYW5nZS50cmFuc2xhdGUoWzAsICsxXSwgWzAsIC0xXSlcbiAgICBjbG9zZVJhbmdlID0gY2xvc2VSYW5nZS50cmFuc2xhdGUoWzAsICsxXSwgWzAsIC0xXSlcbiAgICBpZiAob3BlblJhbmdlLmNvbnRhaW5zUG9pbnQocG9pbnQpICYmICFwb2ludC5pc0VxdWFsKG9wZW5SYW5nZS5lbmQpKSB7XG4gICAgICByZXR1cm4gY2xvc2VSYW5nZS5zdGFydFxuICAgIH1cbiAgICBpZiAoY2xvc2VSYW5nZS5jb250YWluc1BvaW50KHBvaW50KSAmJiAhcG9pbnQuaXNFcXVhbChjbG9zZVJhbmdlLmVuZCkpIHtcbiAgICAgIHJldHVybiBvcGVuUmFuZ2Uuc3RhcnRcbiAgICB9XG4gIH1cblxuICBnZXRQb2ludChjdXJzb3IpIHtcbiAgICBjb25zdCBjdXJzb3JQb3NpdGlvbiA9IGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXG4gICAgY29uc3QgY3Vyc29yUm93ID0gY3Vyc29yUG9zaXRpb24ucm93XG4gICAgY29uc3QgcG9pbnQgPSB0aGlzLmdldFBvaW50Rm9yVGFnKGN1cnNvclBvc2l0aW9uKVxuICAgIGlmIChwb2ludCkgcmV0dXJuIHBvaW50XG5cbiAgICAvLyBBQW55UGFpckFsbG93Rm9yd2FyZGluZyByZXR1cm4gZm9yd2FyZGluZyByYW5nZSBvciBlbmNsb3NpbmcgcmFuZ2UuXG4gICAgY29uc3QgcmFuZ2UgPSB0aGlzLmdldEluc3RhbmNlKFwiQUFueVBhaXJBbGxvd0ZvcndhcmRpbmdcIiwge21lbWJlcjogdGhpcy5tZW1iZXJ9KS5nZXRSYW5nZShjdXJzb3Iuc2VsZWN0aW9uKVxuICAgIGlmICghcmFuZ2UpIHJldHVyblxuXG4gICAgY29uc3Qge3N0YXJ0LCBlbmR9ID0gcmFuZ2VcbiAgICBpZiAoc3RhcnQucm93ID09PSBjdXJzb3JSb3cgJiYgc3RhcnQuaXNHcmVhdGVyVGhhbk9yRXF1YWwoY3Vyc29yUG9zaXRpb24pKSB7XG4gICAgICAvLyBGb3J3YXJkaW5nIHJhbmdlIGZvdW5kXG4gICAgICByZXR1cm4gZW5kLnRyYW5zbGF0ZShbMCwgLTFdKVxuICAgIH0gZWxzZSBpZiAoZW5kLnJvdyA9PT0gY3Vyc29yUG9zaXRpb24ucm93KSB7XG4gICAgICAvLyBFbmNsb3NpbmcgcmFuZ2Ugd2FzIHJldHVybmVkXG4gICAgICAvLyBXZSBtb3ZlIHRvIHN0YXJ0KCBvcGVuLXBhaXIgKSBvbmx5IHdoZW4gY2xvc2UtcGFpciB3YXMgYXQgc2FtZSByb3cgYXMgY3Vyc29yLXJvdy5cbiAgICAgIHJldHVybiBzdGFydFxuICAgIH1cbiAgfVxufVxuTW92ZVRvUGFpci5yZWdpc3RlcigpXG4iXX0=