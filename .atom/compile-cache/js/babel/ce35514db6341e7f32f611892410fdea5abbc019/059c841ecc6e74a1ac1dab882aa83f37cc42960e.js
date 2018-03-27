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

  // Used as operator's target in visual-mode.

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

    // Call callback count times.
    // But break iteration when cursor position did not change before/after callback.
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
  }, {
    key: "getFirstOrLastPoint",
    value: function getFirstOrLastPoint(direction) {
      return direction === "next" ? this.getVimEofBufferPosition() : new Point(0, 0);
    }
  }], [{
    key: "operationKind",
    value: "motion",
    enumerable: true
  }, {
    key: "command",
    value: false,
    enumerable: true
  }]);

  return Motion;
})(Base);

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
  }], [{
    key: "command",
    value: false,
    enumerable: true
  }]);

  return CurrentSelection;
})(Motion);

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
  }], [{
    key: "command",
    value: false,
    enumerable: true
  }]);

  return MoveRightBufferColumn;
})(Motion);

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

var MoveUpWrap = (function (_MoveUp) {
  _inherits(MoveUpWrap, _MoveUp);

  function MoveUpWrap() {
    _classCallCheck(this, MoveUpWrap);

    _get(Object.getPrototypeOf(MoveUpWrap.prototype), "constructor", this).apply(this, arguments);

    this.wrap = true;
  }

  return MoveUpWrap;
})(MoveUp);

var MoveDown = (function (_MoveUp2) {
  _inherits(MoveDown, _MoveUp2);

  function MoveDown() {
    _classCallCheck(this, MoveDown);

    _get(Object.getPrototypeOf(MoveDown.prototype), "constructor", this).apply(this, arguments);

    this.direction = "down";
  }

  return MoveDown;
})(MoveUp);

var MoveDownWrap = (function (_MoveDown) {
  _inherits(MoveDownWrap, _MoveDown);

  function MoveDownWrap() {
    _classCallCheck(this, MoveDownWrap);

    _get(Object.getPrototypeOf(MoveDownWrap.prototype), "constructor", this).apply(this, arguments);

    this.wrap = true;
  }

  return MoveDownWrap;
})(MoveDown);

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
      return this.isNonWhiteSpace(point) || this.isFirstRowOrLastRowAndStoppable(point) ||
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
    key: "isFirstRowOrLastRowAndStoppable",
    value: function isFirstRowOrLastRowAndStoppable(point) {
      // In notmal-mode, cursor is NOT stoppable to EOL of non-blank row.
      // So explicitly guard to not answer it stoppable.
      if (this.mode === "normal" && this.utils.pointIsAtEndOfLineAtNonEmptyRow(this.editor, point)) {
        return false;
      }

      // If clipped, it means that original ponit was non stoppable(e.g. point.colum > EOL).
      var row = point.row;

      return (row === 0 || row === this.getVimLastScreenRow()) && point.isEqual(this.editor.clipScreenPosition(point));
    }
  }]);

  return MoveUpToEdge;
})(Motion);

var MoveDownToEdge = (function (_MoveUpToEdge) {
  _inherits(MoveDownToEdge, _MoveUpToEdge);

  function MoveDownToEdge() {
    _classCallCheck(this, MoveDownToEdge);

    _get(Object.getPrototypeOf(MoveDownToEdge.prototype), "constructor", this).apply(this, arguments);

    this.direction = "next";
  }

  // Word Motion family
  // +----------------------------------------------------------------------------+
  // | direction | which      | word  | WORD | subword | smartword | alphanumeric |
  // |-----------+------------+-------+------+---------+-----------+--------------+
  // | next      | word-start | w     | W    | -       | -         | -            |
  // | previous  | word-start | b     | b    | -       | -         | -            |
  // | next      | word-end   | e     | E    | -       | -         | -            |
  // | previous  | word-end   | ge    | g E  | n/a     | n/a       | n/a          |
  // +----------------------------------------------------------------------------+

  return MoveDownToEdge;
})(MoveUpToEdge);

var WordMotion = (function (_Motion8) {
  _inherits(WordMotion, _Motion8);

  function WordMotion() {
    _classCallCheck(this, WordMotion);

    _get(Object.getPrototypeOf(WordMotion.prototype), "constructor", this).apply(this, arguments);

    this.wordRegex = null;
    this.skipBlankRow = false;
    this.skipWhiteSpaceOnlyRow = false;
  }

  // w

  _createClass(WordMotion, [{
    key: "moveCursor",
    value: function moveCursor(cursor) {
      var _this9 = this;

      this.moveCursorCountTimes(cursor, function (countState) {
        cursor.setBufferPosition(_this9.getPoint(cursor, countState));
      });
    }
  }, {
    key: "getPoint",
    value: function getPoint(cursor, countState) {
      var direction = this.direction;
      var which = this.which;

      var regex = this.name.endsWith("Subword") ? cursor.subwordRegExp() : this.wordRegex || cursor.wordRegExp();

      var options = this.buildOptions(cursor);
      if (direction === "next" && which === "start" && this.operator && countState.isFinal) {
        // [NOTE] Exceptional behavior for w and W: [Detail in vim help `:help w`.]
        // [case-A] cw, cW treated as ce, cE when cursor is at non-blank.
        // [case-B] when w, W used as TARGET, it doesn't move over new line.
        var from = options.from;

        if (this.isEmptyRow(from.row)) return [from.row + 1, 0];

        // [case-A]
        if (this.operator.name === "Change" && !this.utils.pointIsAtWhiteSpace(this.editor, from)) {
          which = "end";
        }
        var point = this.findPoint(direction, regex, which, options);
        // [case-B]
        return point ? Point.min(point, [from.row, Infinity]) : this.getFirstOrLastPoint(direction);
      } else {
        return this.findPoint(direction, regex, which, options) || this.getFirstOrLastPoint(direction);
      }
    }
  }, {
    key: "buildOptions",
    value: function buildOptions(cursor) {
      return {
        from: cursor.getBufferPosition(),
        skipEmptyRow: this.skipEmptyRow,
        skipWhiteSpaceOnlyRow: this.skipWhiteSpaceOnlyRow,
        preTranslate: this.which === "end" && [0, +1] || undefined,
        postTranslate: this.which === "end" && [0, -1] || undefined
      };
    }
  }], [{
    key: "command",
    value: false,
    enumerable: true
  }]);

  return WordMotion;
})(Motion);

var MoveToNextWord = (function (_WordMotion) {
  _inherits(MoveToNextWord, _WordMotion);

  function MoveToNextWord() {
    _classCallCheck(this, MoveToNextWord);

    _get(Object.getPrototypeOf(MoveToNextWord.prototype), "constructor", this).apply(this, arguments);

    this.direction = "next";
    this.which = "start";
  }

  // W
  return MoveToNextWord;
})(WordMotion);

var MoveToNextWholeWord = (function (_MoveToNextWord) {
  _inherits(MoveToNextWholeWord, _MoveToNextWord);

  function MoveToNextWholeWord() {
    _classCallCheck(this, MoveToNextWholeWord);

    _get(Object.getPrototypeOf(MoveToNextWholeWord.prototype), "constructor", this).apply(this, arguments);

    this.wordRegex = /^$|\S+/g;
  }

  // no-keymap
  return MoveToNextWholeWord;
})(MoveToNextWord);

var MoveToNextSubword = (function (_MoveToNextWord2) {
  _inherits(MoveToNextSubword, _MoveToNextWord2);

  function MoveToNextSubword() {
    _classCallCheck(this, MoveToNextSubword);

    _get(Object.getPrototypeOf(MoveToNextSubword.prototype), "constructor", this).apply(this, arguments);
  }

  // no-keymap
  return MoveToNextSubword;
})(MoveToNextWord);

var MoveToNextSmartWord = (function (_MoveToNextWord3) {
  _inherits(MoveToNextSmartWord, _MoveToNextWord3);

  function MoveToNextSmartWord() {
    _classCallCheck(this, MoveToNextSmartWord);

    _get(Object.getPrototypeOf(MoveToNextSmartWord.prototype), "constructor", this).apply(this, arguments);

    this.wordRegex = /[\w-]+/g;
  }

  // no-keymap
  return MoveToNextSmartWord;
})(MoveToNextWord);

var MoveToNextAlphanumericWord = (function (_MoveToNextWord4) {
  _inherits(MoveToNextAlphanumericWord, _MoveToNextWord4);

  function MoveToNextAlphanumericWord() {
    _classCallCheck(this, MoveToNextAlphanumericWord);

    _get(Object.getPrototypeOf(MoveToNextAlphanumericWord.prototype), "constructor", this).apply(this, arguments);

    this.wordRegex = /\w+/g;
  }

  // b
  return MoveToNextAlphanumericWord;
})(MoveToNextWord);

var MoveToPreviousWord = (function (_WordMotion2) {
  _inherits(MoveToPreviousWord, _WordMotion2);

  function MoveToPreviousWord() {
    _classCallCheck(this, MoveToPreviousWord);

    _get(Object.getPrototypeOf(MoveToPreviousWord.prototype), "constructor", this).apply(this, arguments);

    this.direction = "previous";
    this.which = "start";
    this.skipWhiteSpaceOnlyRow = true;
  }

  // B
  return MoveToPreviousWord;
})(WordMotion);

var MoveToPreviousWholeWord = (function (_MoveToPreviousWord) {
  _inherits(MoveToPreviousWholeWord, _MoveToPreviousWord);

  function MoveToPreviousWholeWord() {
    _classCallCheck(this, MoveToPreviousWholeWord);

    _get(Object.getPrototypeOf(MoveToPreviousWholeWord.prototype), "constructor", this).apply(this, arguments);

    this.wordRegex = /^$|\S+/g;
  }

  // no-keymap
  return MoveToPreviousWholeWord;
})(MoveToPreviousWord);

var MoveToPreviousSubword = (function (_MoveToPreviousWord2) {
  _inherits(MoveToPreviousSubword, _MoveToPreviousWord2);

  function MoveToPreviousSubword() {
    _classCallCheck(this, MoveToPreviousSubword);

    _get(Object.getPrototypeOf(MoveToPreviousSubword.prototype), "constructor", this).apply(this, arguments);
  }

  // no-keymap
  return MoveToPreviousSubword;
})(MoveToPreviousWord);

var MoveToPreviousSmartWord = (function (_MoveToPreviousWord3) {
  _inherits(MoveToPreviousSmartWord, _MoveToPreviousWord3);

  function MoveToPreviousSmartWord() {
    _classCallCheck(this, MoveToPreviousSmartWord);

    _get(Object.getPrototypeOf(MoveToPreviousSmartWord.prototype), "constructor", this).apply(this, arguments);

    this.wordRegex = /[\w-]+/;
  }

  // no-keymap
  return MoveToPreviousSmartWord;
})(MoveToPreviousWord);

var MoveToPreviousAlphanumericWord = (function (_MoveToPreviousWord4) {
  _inherits(MoveToPreviousAlphanumericWord, _MoveToPreviousWord4);

  function MoveToPreviousAlphanumericWord() {
    _classCallCheck(this, MoveToPreviousAlphanumericWord);

    _get(Object.getPrototypeOf(MoveToPreviousAlphanumericWord.prototype), "constructor", this).apply(this, arguments);

    this.wordRegex = /\w+/;
  }

  // e
  return MoveToPreviousAlphanumericWord;
})(MoveToPreviousWord);

var MoveToEndOfWord = (function (_WordMotion3) {
  _inherits(MoveToEndOfWord, _WordMotion3);

  function MoveToEndOfWord() {
    _classCallCheck(this, MoveToEndOfWord);

    _get(Object.getPrototypeOf(MoveToEndOfWord.prototype), "constructor", this).apply(this, arguments);

    this.inclusive = true;
    this.direction = "next";
    this.which = "end";
    this.skipEmptyRow = true;
    this.skipWhiteSpaceOnlyRow = true;
  }

  // E
  return MoveToEndOfWord;
})(WordMotion);

var MoveToEndOfWholeWord = (function (_MoveToEndOfWord) {
  _inherits(MoveToEndOfWholeWord, _MoveToEndOfWord);

  function MoveToEndOfWholeWord() {
    _classCallCheck(this, MoveToEndOfWholeWord);

    _get(Object.getPrototypeOf(MoveToEndOfWholeWord.prototype), "constructor", this).apply(this, arguments);

    this.wordRegex = /\S+/g;
  }

  // no-keymap
  return MoveToEndOfWholeWord;
})(MoveToEndOfWord);

var MoveToEndOfSubword = (function (_MoveToEndOfWord2) {
  _inherits(MoveToEndOfSubword, _MoveToEndOfWord2);

  function MoveToEndOfSubword() {
    _classCallCheck(this, MoveToEndOfSubword);

    _get(Object.getPrototypeOf(MoveToEndOfSubword.prototype), "constructor", this).apply(this, arguments);
  }

  // no-keymap
  return MoveToEndOfSubword;
})(MoveToEndOfWord);

var MoveToEndOfSmartWord = (function (_MoveToEndOfWord3) {
  _inherits(MoveToEndOfSmartWord, _MoveToEndOfWord3);

  function MoveToEndOfSmartWord() {
    _classCallCheck(this, MoveToEndOfSmartWord);

    _get(Object.getPrototypeOf(MoveToEndOfSmartWord.prototype), "constructor", this).apply(this, arguments);

    this.wordRegex = /[\w-]+/g;
  }

  // no-keymap
  return MoveToEndOfSmartWord;
})(MoveToEndOfWord);

var MoveToEndOfAlphanumericWord = (function (_MoveToEndOfWord4) {
  _inherits(MoveToEndOfAlphanumericWord, _MoveToEndOfWord4);

  function MoveToEndOfAlphanumericWord() {
    _classCallCheck(this, MoveToEndOfAlphanumericWord);

    _get(Object.getPrototypeOf(MoveToEndOfAlphanumericWord.prototype), "constructor", this).apply(this, arguments);

    this.wordRegex = /\w+/g;
  }

  // ge
  return MoveToEndOfAlphanumericWord;
})(MoveToEndOfWord);

var MoveToPreviousEndOfWord = (function (_WordMotion4) {
  _inherits(MoveToPreviousEndOfWord, _WordMotion4);

  function MoveToPreviousEndOfWord() {
    _classCallCheck(this, MoveToPreviousEndOfWord);

    _get(Object.getPrototypeOf(MoveToPreviousEndOfWord.prototype), "constructor", this).apply(this, arguments);

    this.inclusive = true;
    this.direction = "previous";
    this.which = "end";
    this.skipWhiteSpaceOnlyRow = true;
  }

  // gE
  return MoveToPreviousEndOfWord;
})(WordMotion);

var MoveToPreviousEndOfWholeWord = (function (_MoveToPreviousEndOfWord) {
  _inherits(MoveToPreviousEndOfWholeWord, _MoveToPreviousEndOfWord);

  function MoveToPreviousEndOfWholeWord() {
    _classCallCheck(this, MoveToPreviousEndOfWholeWord);

    _get(Object.getPrototypeOf(MoveToPreviousEndOfWholeWord.prototype), "constructor", this).apply(this, arguments);

    this.wordRegex = /\S+/g;
  }

  // Sentence
  // -------------------------
  // Sentence is defined as below
  //  - end with ['.', '!', '?']
  //  - optionally followed by [')', ']', '"', "'"]
  //  - followed by ['$', ' ', '\t']
  //  - paragraph boundary is also sentence boundary
  //  - section boundary is also sentence boundary(ignore)
  return MoveToPreviousEndOfWholeWord;
})(MoveToPreviousEndOfWord);

var MoveToNextSentence = (function (_Motion9) {
  _inherits(MoveToNextSentence, _Motion9);

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
      var _this10 = this;

      this.moveCursorCountTimes(cursor, function () {
        var point = _this10.direction === "next" ? _this10.getNextStartOfSentence(cursor.getBufferPosition()) : _this10.getPreviousStartOfSentence(cursor.getBufferPosition());
        cursor.setBufferPosition(point || _this10.getFirstOrLastPoint(_this10.direction));
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
      var _this11 = this;

      return this.findInEditor("forward", this.sentenceRegex, { from: from }, function (_ref) {
        var range = _ref.range;
        var match = _ref.match;

        if (match[1] != null) {
          var startRow = range.start.row;
          var endRow = range.end.row;

          if (_this11.skipBlankRow && _this11.isBlankRow(endRow)) return;
          if (_this11.isBlankRow(startRow) !== _this11.isBlankRow(endRow)) {
            return _this11.getFirstCharacterPositionForBufferRow(endRow);
          }
        } else {
          return range.end;
        }
      });
    }
  }, {
    key: "getPreviousStartOfSentence",
    value: function getPreviousStartOfSentence(from) {
      var _this12 = this;

      return this.findInEditor("backward", this.sentenceRegex, { from: from }, function (_ref2) {
        var range = _ref2.range;
        var match = _ref2.match;

        if (match[1] != null) {
          var startRow = range.start.row;
          var endRow = range.end.row;

          if (!_this12.isBlankRow(endRow) && _this12.isBlankRow(startRow)) {
            var point = _this12.getFirstCharacterPositionForBufferRow(endRow);
            if (point.isLessThan(from)) return point;else if (!_this12.skipBlankRow) return _this12.getFirstCharacterPositionForBufferRow(startRow);
          }
        } else if (range.end.isLessThan(from)) {
          return range.end;
        }
      });
    }
  }]);

  return MoveToNextSentence;
})(Motion);

var MoveToPreviousSentence = (function (_MoveToNextSentence) {
  _inherits(MoveToPreviousSentence, _MoveToNextSentence);

  function MoveToPreviousSentence() {
    _classCallCheck(this, MoveToPreviousSentence);

    _get(Object.getPrototypeOf(MoveToPreviousSentence.prototype), "constructor", this).apply(this, arguments);

    this.direction = "previous";
  }

  return MoveToPreviousSentence;
})(MoveToNextSentence);

var MoveToNextSentenceSkipBlankRow = (function (_MoveToNextSentence2) {
  _inherits(MoveToNextSentenceSkipBlankRow, _MoveToNextSentence2);

  function MoveToNextSentenceSkipBlankRow() {
    _classCallCheck(this, MoveToNextSentenceSkipBlankRow);

    _get(Object.getPrototypeOf(MoveToNextSentenceSkipBlankRow.prototype), "constructor", this).apply(this, arguments);

    this.skipBlankRow = true;
  }

  return MoveToNextSentenceSkipBlankRow;
})(MoveToNextSentence);

var MoveToPreviousSentenceSkipBlankRow = (function (_MoveToPreviousSentence) {
  _inherits(MoveToPreviousSentenceSkipBlankRow, _MoveToPreviousSentence);

  function MoveToPreviousSentenceSkipBlankRow() {
    _classCallCheck(this, MoveToPreviousSentenceSkipBlankRow);

    _get(Object.getPrototypeOf(MoveToPreviousSentenceSkipBlankRow.prototype), "constructor", this).apply(this, arguments);

    this.skipBlankRow = true;
  }

  // Paragraph
  // -------------------------
  return MoveToPreviousSentenceSkipBlankRow;
})(MoveToPreviousSentence);

var MoveToNextParagraph = (function (_Motion10) {
  _inherits(MoveToNextParagraph, _Motion10);

  function MoveToNextParagraph() {
    _classCallCheck(this, MoveToNextParagraph);

    _get(Object.getPrototypeOf(MoveToNextParagraph.prototype), "constructor", this).apply(this, arguments);

    this.jump = true;
    this.direction = "next";
  }

  _createClass(MoveToNextParagraph, [{
    key: "moveCursor",
    value: function moveCursor(cursor) {
      var _this13 = this;

      this.moveCursorCountTimes(cursor, function () {
        var point = _this13.getPoint(cursor.getBufferPosition());
        cursor.setBufferPosition(point || _this13.getFirstOrLastPoint(_this13.direction));
      });
    }
  }, {
    key: "getPoint",
    value: function getPoint(from) {
      var _this14 = this;

      var wasBlankRow = this.editor.isBufferRowBlank(from.row);
      return this.findInEditor(this.direction, /^/g, { from: from }, function (_ref3) {
        var range = _ref3.range;

        var isBlankRow = _this14.editor.isBufferRowBlank(range.start.row);
        if (!wasBlankRow && isBlankRow) {
          return range.start;
        }
        wasBlankRow = isBlankRow;
      });
    }
  }]);

  return MoveToNextParagraph;
})(Motion);

var MoveToPreviousParagraph = (function (_MoveToNextParagraph) {
  _inherits(MoveToPreviousParagraph, _MoveToNextParagraph);

  function MoveToPreviousParagraph() {
    _classCallCheck(this, MoveToPreviousParagraph);

    _get(Object.getPrototypeOf(MoveToPreviousParagraph.prototype), "constructor", this).apply(this, arguments);

    this.direction = "previous";
  }

  // -------------------------
  // keymap: 0
  return MoveToPreviousParagraph;
})(MoveToNextParagraph);

var MoveToBeginningOfLine = (function (_Motion11) {
  _inherits(MoveToBeginningOfLine, _Motion11);

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

var MoveToColumn = (function (_Motion12) {
  _inherits(MoveToColumn, _Motion12);

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

var MoveToLastCharacterOfLine = (function (_Motion13) {
  _inherits(MoveToLastCharacterOfLine, _Motion13);

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

var MoveToLastNonblankCharacterOfLineAndDown = (function (_Motion14) {
  _inherits(MoveToLastNonblankCharacterOfLineAndDown, _Motion14);

  function MoveToLastNonblankCharacterOfLineAndDown() {
    _classCallCheck(this, MoveToLastNonblankCharacterOfLineAndDown);

    _get(Object.getPrototypeOf(MoveToLastNonblankCharacterOfLineAndDown.prototype), "constructor", this).apply(this, arguments);

    this.inclusive = true;
  }

  // MoveToFirstCharacterOfLine faimily
  // ------------------------------------
  // ^

  _createClass(MoveToLastNonblankCharacterOfLineAndDown, [{
    key: "moveCursor",
    value: function moveCursor(cursor) {
      var row = this.utils.limitNumber(cursor.getBufferRow() + this.getCount(-1), { max: this.getVimLastBufferRow() });
      var options = { from: [row, Infinity], allowNextLine: false };
      var point = this.findInEditor("backward", /\S|^/, options, function (event) {
        return event.range.start;
      });
      cursor.setBufferPosition(point);
    }
  }]);

  return MoveToLastNonblankCharacterOfLineAndDown;
})(Motion);

var MoveToFirstCharacterOfLine = (function (_Motion15) {
  _inherits(MoveToFirstCharacterOfLine, _Motion15);

  function MoveToFirstCharacterOfLine() {
    _classCallCheck(this, MoveToFirstCharacterOfLine);

    _get(Object.getPrototypeOf(MoveToFirstCharacterOfLine.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(MoveToFirstCharacterOfLine, [{
    key: "moveCursor",
    value: function moveCursor(cursor) {
      cursor.setBufferPosition(this.getFirstCharacterPositionForBufferRow(cursor.getBufferRow()));
    }
  }]);

  return MoveToFirstCharacterOfLine;
})(Motion);

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
      var _this15 = this;

      this.moveCursorCountTimes(cursor, function () {
        var row = _this15.getValidVimBufferRow(cursor.getBufferRow() - 1);
        cursor.setBufferPosition([row, 0]);
      });
      _get(Object.getPrototypeOf(MoveToFirstCharacterOfLineUp.prototype), "moveCursor", this).call(this, cursor);
    }
  }]);

  return MoveToFirstCharacterOfLineUp;
})(MoveToFirstCharacterOfLine);

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
      var _this16 = this;

      this.moveCursorCountTimes(cursor, function () {
        var point = cursor.getBufferPosition();
        if (point.row < _this16.getVimLastBufferRow()) {
          cursor.setBufferPosition(point.translate([+1, 0]));
        }
      });
      _get(Object.getPrototypeOf(MoveToFirstCharacterOfLineDown.prototype), "moveCursor", this).call(this, cursor);
    }
  }]);

  return MoveToFirstCharacterOfLineDown;
})(MoveToFirstCharacterOfLine);

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

var MoveToScreenColumn = (function (_Motion16) {
  _inherits(MoveToScreenColumn, _Motion16);

  function MoveToScreenColumn() {
    _classCallCheck(this, MoveToScreenColumn);

    _get(Object.getPrototypeOf(MoveToScreenColumn.prototype), "constructor", this).apply(this, arguments);
  }

  // keymap: g 0

  _createClass(MoveToScreenColumn, [{
    key: "moveCursor",
    value: function moveCursor(cursor) {
      var allowOffScreenPosition = this.getConfig("allowMoveToOffScreenColumnOnScreenLineMotion");
      var point = this.utils.getScreenPositionForScreenRow(this.editor, cursor.getScreenRow(), this.which, {
        allowOffScreenPosition: allowOffScreenPosition
      });
      if (point) cursor.setScreenPosition(point);
    }
  }], [{
    key: "command",
    value: false,
    enumerable: true
  }]);

  return MoveToScreenColumn;
})(Motion);

var MoveToBeginningOfScreenLine = (function (_MoveToScreenColumn) {
  _inherits(MoveToBeginningOfScreenLine, _MoveToScreenColumn);

  function MoveToBeginningOfScreenLine() {
    _classCallCheck(this, MoveToBeginningOfScreenLine);

    _get(Object.getPrototypeOf(MoveToBeginningOfScreenLine.prototype), "constructor", this).apply(this, arguments);

    this.which = "beginning";
  }

  // g ^: `move-to-first-character-of-screen-line`
  return MoveToBeginningOfScreenLine;
})(MoveToScreenColumn);

var MoveToFirstCharacterOfScreenLine = (function (_MoveToScreenColumn2) {
  _inherits(MoveToFirstCharacterOfScreenLine, _MoveToScreenColumn2);

  function MoveToFirstCharacterOfScreenLine() {
    _classCallCheck(this, MoveToFirstCharacterOfScreenLine);

    _get(Object.getPrototypeOf(MoveToFirstCharacterOfScreenLine.prototype), "constructor", this).apply(this, arguments);

    this.which = "first-character";
  }

  // keymap: g $
  return MoveToFirstCharacterOfScreenLine;
})(MoveToScreenColumn);

var MoveToLastCharacterOfScreenLine = (function (_MoveToScreenColumn3) {
  _inherits(MoveToLastCharacterOfScreenLine, _MoveToScreenColumn3);

  function MoveToLastCharacterOfScreenLine() {
    _classCallCheck(this, MoveToLastCharacterOfScreenLine);

    _get(Object.getPrototypeOf(MoveToLastCharacterOfScreenLine.prototype), "constructor", this).apply(this, arguments);

    this.which = "last-character";
  }

  // keymap: g g
  return MoveToLastCharacterOfScreenLine;
})(MoveToScreenColumn);

var MoveToFirstLine = (function (_Motion17) {
  _inherits(MoveToFirstLine, _Motion17);

  function MoveToFirstLine() {
    _classCallCheck(this, MoveToFirstLine);

    _get(Object.getPrototypeOf(MoveToFirstLine.prototype), "constructor", this).apply(this, arguments);

    this.wise = "linewise";
    this.jump = true;
    this.verticalMotion = true;
    this.moveSuccessOnLinewise = true;
  }

  // keymap: G

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

var MoveToLastLine = (function (_MoveToFirstLine) {
  _inherits(MoveToLastLine, _MoveToFirstLine);

  function MoveToLastLine() {
    _classCallCheck(this, MoveToLastLine);

    _get(Object.getPrototypeOf(MoveToLastLine.prototype), "constructor", this).apply(this, arguments);

    this.defaultCount = Infinity;
  }

  // keymap: N% e.g. 10%
  return MoveToLastLine;
})(MoveToFirstLine);

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

var MoveToRelativeLine = (function (_Motion18) {
  _inherits(MoveToRelativeLine, _Motion18);

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
  }], [{
    key: "command",
    value: false,
    enumerable: true
  }]);

  return MoveToRelativeLine;
})(Motion);

var MoveToRelativeLineMinimumTwo = (function (_MoveToRelativeLine) {
  _inherits(MoveToRelativeLineMinimumTwo, _MoveToRelativeLine);

  function MoveToRelativeLineMinimumTwo() {
    _classCallCheck(this, MoveToRelativeLineMinimumTwo);

    _get(Object.getPrototypeOf(MoveToRelativeLineMinimumTwo.prototype), "constructor", this).apply(this, arguments);
  }

  // Position cursor without scrolling., H, M, L
  // -------------------------
  // keymap: H

  _createClass(MoveToRelativeLineMinimumTwo, [{
    key: "getCount",
    value: function getCount() {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return this.utils.limitNumber(_get(Object.getPrototypeOf(MoveToRelativeLineMinimumTwo.prototype), "getCount", this).apply(this, args), { min: 2 });
    }
  }], [{
    key: "command",
    value: false,
    enumerable: true
  }]);

  return MoveToRelativeLineMinimumTwo;
})(MoveToRelativeLine);

var MoveToTopOfScreen = (function (_Motion19) {
  _inherits(MoveToTopOfScreen, _Motion19);

  function MoveToTopOfScreen() {
    _classCallCheck(this, MoveToTopOfScreen);

    _get(Object.getPrototypeOf(MoveToTopOfScreen.prototype), "constructor", this).apply(this, arguments);

    this.wise = "linewise";
    this.jump = true;
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
    key: "getScreenRow",
    value: function getScreenRow() {
      var limitNumber = this.utils.limitNumber;

      var firstVisibleRow = this.editor.getFirstVisibleScreenRow();
      var lastVisibleRow = limitNumber(this.editor.getLastVisibleScreenRow(), { max: this.getVimLastScreenRow() });

      var baseOffset = 2;
      if (this.name === "MoveToTopOfScreen") {
        var offset = firstVisibleRow === 0 ? 0 : baseOffset;
        return limitNumber(firstVisibleRow + this.getCount(-1), { min: firstVisibleRow + offset, max: lastVisibleRow });
      } else if (this.name === "MoveToMiddleOfScreen") {
        return firstVisibleRow + Math.floor((lastVisibleRow - firstVisibleRow) / 2);
      } else if (this.name === "MoveToBottomOfScreen") {
        var offset = lastVisibleRow === this.getVimLastScreenRow() ? 0 : baseOffset + 1;
        return limitNumber(lastVisibleRow - this.getCount(-1), { min: firstVisibleRow, max: lastVisibleRow - offset });
      }
    }
  }]);

  return MoveToTopOfScreen;
})(Motion);

var MoveToMiddleOfScreen = (function (_MoveToTopOfScreen) {
  _inherits(MoveToMiddleOfScreen, _MoveToTopOfScreen);

  function MoveToMiddleOfScreen() {
    _classCallCheck(this, MoveToMiddleOfScreen);

    _get(Object.getPrototypeOf(MoveToMiddleOfScreen.prototype), "constructor", this).apply(this, arguments);
  }

  // keymap: M
  return MoveToMiddleOfScreen;
})(MoveToTopOfScreen);

var MoveToBottomOfScreen = (function (_MoveToTopOfScreen2) {
  _inherits(MoveToBottomOfScreen, _MoveToTopOfScreen2);

  function MoveToBottomOfScreen() {
    _classCallCheck(this, MoveToBottomOfScreen);

    _get(Object.getPrototypeOf(MoveToBottomOfScreen.prototype), "constructor", this).apply(this, arguments);
  }

  // keymap: L

  // Scrolling
  // Half: ctrl-d, ctrl-u
  // Full: ctrl-f, ctrl-b
  // -------------------------
  // [FIXME] count behave differently from original Vim.
  return MoveToBottomOfScreen;
})(MoveToTopOfScreen);

var Scroll = (function (_Motion20) {
  _inherits(Scroll, _Motion20);

  function Scroll() {
    _classCallCheck(this, Scroll);

    _get(Object.getPrototypeOf(Scroll.prototype), "constructor", this).apply(this, arguments);

    this.verticalMotion = true;
  }

  _createClass(Scroll, [{
    key: "execute",
    value: function execute() {
      var amountOfPage = this.constructor.amountOfPageByName[this.name];
      var amountOfScreenRows = Math.trunc(amountOfPage * this.editor.getRowsPerPage() * this.getCount());
      this.amountOfPixels = amountOfScreenRows * this.editor.getLineHeightInPixels();

      _get(Object.getPrototypeOf(Scroll.prototype), "execute", this).call(this);

      this.vimState.requestScroll({
        amountOfPixels: this.amountOfPixels,
        duration: this.getSmoothScrollDuation((Math.abs(amountOfPage) === 1 ? "Full" : "Half") + "ScrollMotion")
      });
    }
  }, {
    key: "moveCursor",
    value: function moveCursor(cursor) {
      var cursorPixel = this.editorElement.pixelPositionForScreenPosition(cursor.getScreenPosition());
      cursorPixel.top += this.amountOfPixels;
      var screenPosition = this.editorElement.screenPositionForPixelPosition(cursorPixel);
      var screenRow = this.getValidVimScreenRow(screenPosition.row);
      this.setCursorBufferRow(cursor, this.editor.bufferRowForScreenRow(screenRow), { autoscroll: false });
    }
  }], [{
    key: "command",
    value: false,
    enumerable: true
  }, {
    key: "scrollTask",
    value: null,
    enumerable: true
  }, {
    key: "amountOfPageByName",
    value: {
      ScrollFullScreenDown: 1,
      ScrollFullScreenUp: -1,
      ScrollHalfScreenDown: 0.5,
      ScrollHalfScreenUp: -0.5,
      ScrollQuarterScreenDown: 0.25,
      ScrollQuarterScreenUp: -0.25
    },
    enumerable: true
  }]);

  return Scroll;
})(Motion);

var ScrollFullScreenDown = (function (_Scroll) {
  _inherits(ScrollFullScreenDown, _Scroll);

  function ScrollFullScreenDown() {
    _classCallCheck(this, ScrollFullScreenDown);

    _get(Object.getPrototypeOf(ScrollFullScreenDown.prototype), "constructor", this).apply(this, arguments);
  }

  // ctrl-f
  return ScrollFullScreenDown;
})(Scroll);

var ScrollFullScreenUp = (function (_Scroll2) {
  _inherits(ScrollFullScreenUp, _Scroll2);

  function ScrollFullScreenUp() {
    _classCallCheck(this, ScrollFullScreenUp);

    _get(Object.getPrototypeOf(ScrollFullScreenUp.prototype), "constructor", this).apply(this, arguments);
  }

  // ctrl-b
  return ScrollFullScreenUp;
})(Scroll);

var ScrollHalfScreenDown = (function (_Scroll3) {
  _inherits(ScrollHalfScreenDown, _Scroll3);

  function ScrollHalfScreenDown() {
    _classCallCheck(this, ScrollHalfScreenDown);

    _get(Object.getPrototypeOf(ScrollHalfScreenDown.prototype), "constructor", this).apply(this, arguments);
  }

  // ctrl-d
  return ScrollHalfScreenDown;
})(Scroll);

var ScrollHalfScreenUp = (function (_Scroll4) {
  _inherits(ScrollHalfScreenUp, _Scroll4);

  function ScrollHalfScreenUp() {
    _classCallCheck(this, ScrollHalfScreenUp);

    _get(Object.getPrototypeOf(ScrollHalfScreenUp.prototype), "constructor", this).apply(this, arguments);
  }

  // ctrl-u
  return ScrollHalfScreenUp;
})(Scroll);

var ScrollQuarterScreenDown = (function (_Scroll5) {
  _inherits(ScrollQuarterScreenDown, _Scroll5);

  function ScrollQuarterScreenDown() {
    _classCallCheck(this, ScrollQuarterScreenDown);

    _get(Object.getPrototypeOf(ScrollQuarterScreenDown.prototype), "constructor", this).apply(this, arguments);
  }

  // g ctrl-d
  return ScrollQuarterScreenDown;
})(Scroll);

var ScrollQuarterScreenUp = (function (_Scroll6) {
  _inherits(ScrollQuarterScreenUp, _Scroll6);

  function ScrollQuarterScreenUp() {
    _classCallCheck(this, ScrollQuarterScreenUp);

    _get(Object.getPrototypeOf(ScrollQuarterScreenUp.prototype), "constructor", this).apply(this, arguments);
  }

  // g ctrl-u

  // Find
  // -------------------------
  // keymap: f
  return ScrollQuarterScreenUp;
})(Scroll);

var Find = (function (_Motion21) {
  _inherits(Find, _Motion21);

  function Find() {
    _classCallCheck(this, Find);

    _get(Object.getPrototypeOf(Find.prototype), "constructor", this).apply(this, arguments);

    this.backwards = false;
    this.inclusive = true;
    this.offset = 0;
    this.requireInput = true;
    this.caseSensitivityKind = "Find";
  }

  // keymap: F

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
      var _this17 = this;

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
              _this17.input = input;
              if (input) _this17.processOperation();else _this17.cancelOperation();
            },
            onChange: function onChange(preConfirmedChars) {
              _this17.preConfirmedChars = preConfirmedChars;
              _this17.highlightTextInCursorRows(_this17.preConfirmedChars, "pre-confirm", _this17.isBackwards());
            },
            onCancel: function onCancel() {
              _this17.vimState.highlightFind.clearMarkers();
              _this17.cancelOperation();
            },
            commands: {
              "vim-mode-plus:find-next-pre-confirmed": function vimModePlusFindNextPreConfirmed() {
                return _this17.findPreConfirmed(+1);
              },
              "vim-mode-plus:find-previous-pre-confirmed": function vimModePlusFindPreviousPreConfirmed() {
                return _this17.findPreConfirmed(-1);
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
      var _this18 = this;

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
        _this18.highlightTextInCursorRows(_this18.input, decorationType, backwards);
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

        this.editor.backwardsScanInBufferRange(regex, scanRange, function (_ref4) {
          var range = _ref4.range;
          var stop = _ref4.stop;

          if (range.start.isLessThan(fromPoint)) {
            points.push(range.start);
            if (points.length > indexWantAccess) stop();
          }
        });
      } else {
        if (this.getConfig("findAcrossLines")) scanRange.end = this.editor.getEofBufferPosition();

        this.editor.scanInBufferRange(regex, scanRange, function (_ref5) {
          var range = _ref5.range;
          var stop = _ref5.stop;

          if (range.start.isGreaterThan(fromPoint)) {
            points.push(range.start);
            if (points.length > indexWantAccess) stop();
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

var FindBackwards = (function (_Find) {
  _inherits(FindBackwards, _Find);

  function FindBackwards() {
    _classCallCheck(this, FindBackwards);

    _get(Object.getPrototypeOf(FindBackwards.prototype), "constructor", this).apply(this, arguments);

    this.inclusive = false;
    this.backwards = true;
  }

  // keymap: t
  return FindBackwards;
})(Find);

var Till = (function (_Find2) {
  _inherits(Till, _Find2);

  function Till() {
    _classCallCheck(this, Till);

    _get(Object.getPrototypeOf(Till.prototype), "constructor", this).apply(this, arguments);

    this.offset = 1;
  }

  // keymap: T

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

var TillBackwards = (function (_Till) {
  _inherits(TillBackwards, _Till);

  function TillBackwards() {
    _classCallCheck(this, TillBackwards);

    _get(Object.getPrototypeOf(TillBackwards.prototype), "constructor", this).apply(this, arguments);

    this.inclusive = false;
    this.backwards = true;
  }

  // Mark
  // -------------------------
  // keymap: `
  return TillBackwards;
})(Till);

var MoveToMark = (function (_Motion22) {
  _inherits(MoveToMark, _Motion22);

  function MoveToMark() {
    _classCallCheck(this, MoveToMark);

    _get(Object.getPrototypeOf(MoveToMark.prototype), "constructor", this).apply(this, arguments);

    this.jump = true;
    this.requireInput = true;
    this.input = null;
    this.moveToFirstCharacterOfLine = false;
  }

  // keymap: '

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

var MoveToMarkLine = (function (_MoveToMark) {
  _inherits(MoveToMarkLine, _MoveToMark);

  function MoveToMarkLine() {
    _classCallCheck(this, MoveToMarkLine);

    _get(Object.getPrototypeOf(MoveToMarkLine.prototype), "constructor", this).apply(this, arguments);

    this.wise = "linewise";
    this.moveToFirstCharacterOfLine = true;
  }

  // Fold motion
  // -------------------------
  return MoveToMarkLine;
})(MoveToMark);

var MoveToPreviousFoldStart = (function (_Motion23) {
  _inherits(MoveToPreviousFoldStart, _Motion23);

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
      var toRow = function toRow(_ref6) {
        var _ref62 = _slicedToArray(_ref6, 2);

        var startRow = _ref62[0];
        var endRow = _ref62[1];
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
      var _this19 = this;

      this.moveCursorCountTimes(cursor, function () {
        var row = _this19.detectRow(cursor);
        if (row != null) _this19.utils.moveCursorToFirstCharacterAtRow(cursor, row);
      });
    }
  }]);

  return MoveToPreviousFoldStart;
})(Motion);

var MoveToNextFoldStart = (function (_MoveToPreviousFoldStart) {
  _inherits(MoveToNextFoldStart, _MoveToPreviousFoldStart);

  function MoveToNextFoldStart() {
    _classCallCheck(this, MoveToNextFoldStart);

    _get(Object.getPrototypeOf(MoveToNextFoldStart.prototype), "constructor", this).apply(this, arguments);

    this.direction = "next";
  }

  return MoveToNextFoldStart;
})(MoveToPreviousFoldStart);

var MoveToPreviousFoldStartWithSameIndent = (function (_MoveToPreviousFoldStart2) {
  _inherits(MoveToPreviousFoldStartWithSameIndent, _MoveToPreviousFoldStart2);

  function MoveToPreviousFoldStartWithSameIndent() {
    _classCallCheck(this, MoveToPreviousFoldStartWithSameIndent);

    _get(Object.getPrototypeOf(MoveToPreviousFoldStartWithSameIndent.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(MoveToPreviousFoldStartWithSameIndent, [{
    key: "detectRow",
    value: function detectRow(cursor) {
      var _this20 = this;

      var baseIndentLevel = this.editor.indentationForBufferRow(cursor.getBufferRow());
      return this.getScanRows(cursor).find(function (row) {
        return _this20.editor.indentationForBufferRow(row) === baseIndentLevel;
      });
    }
  }]);

  return MoveToPreviousFoldStartWithSameIndent;
})(MoveToPreviousFoldStart);

var MoveToNextFoldStartWithSameIndent = (function (_MoveToPreviousFoldStartWithSameIndent) {
  _inherits(MoveToNextFoldStartWithSameIndent, _MoveToPreviousFoldStartWithSameIndent);

  function MoveToNextFoldStartWithSameIndent() {
    _classCallCheck(this, MoveToNextFoldStartWithSameIndent);

    _get(Object.getPrototypeOf(MoveToNextFoldStartWithSameIndent.prototype), "constructor", this).apply(this, arguments);

    this.direction = "next";
  }

  return MoveToNextFoldStartWithSameIndent;
})(MoveToPreviousFoldStartWithSameIndent);

var MoveToPreviousFoldEnd = (function (_MoveToPreviousFoldStart3) {
  _inherits(MoveToPreviousFoldEnd, _MoveToPreviousFoldStart3);

  function MoveToPreviousFoldEnd() {
    _classCallCheck(this, MoveToPreviousFoldEnd);

    _get(Object.getPrototypeOf(MoveToPreviousFoldEnd.prototype), "constructor", this).apply(this, arguments);

    this.which = "end";
  }

  return MoveToPreviousFoldEnd;
})(MoveToPreviousFoldStart);

var MoveToNextFoldEnd = (function (_MoveToPreviousFoldEnd) {
  _inherits(MoveToNextFoldEnd, _MoveToPreviousFoldEnd);

  function MoveToNextFoldEnd() {
    _classCallCheck(this, MoveToNextFoldEnd);

    _get(Object.getPrototypeOf(MoveToNextFoldEnd.prototype), "constructor", this).apply(this, arguments);

    this.direction = "next";
  }

  // -------------------------
  return MoveToNextFoldEnd;
})(MoveToPreviousFoldEnd);

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
      var _this21 = this;

      return this.getScanRows(cursor).find(function (row) {
        return _this21.utils.isIncludeFunctionScopeForRow(_this21.editor, row);
      });
    }
  }]);

  return MoveToPreviousFunction;
})(MoveToPreviousFoldStart);

var MoveToNextFunction = (function (_MoveToPreviousFunction) {
  _inherits(MoveToNextFunction, _MoveToPreviousFunction);

  function MoveToNextFunction() {
    _classCallCheck(this, MoveToNextFunction);

    _get(Object.getPrototypeOf(MoveToNextFunction.prototype), "constructor", this).apply(this, arguments);

    this.direction = "next";
  }

  return MoveToNextFunction;
})(MoveToPreviousFunction);

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

var MoveToNextFunctionAndRedrawCursorLineAtUpperMiddle = (function (_MoveToPreviousFunctionAndRedrawCursorLineAtUpperMiddle) {
  _inherits(MoveToNextFunctionAndRedrawCursorLineAtUpperMiddle, _MoveToPreviousFunctionAndRedrawCursorLineAtUpperMiddle);

  function MoveToNextFunctionAndRedrawCursorLineAtUpperMiddle() {
    _classCallCheck(this, MoveToNextFunctionAndRedrawCursorLineAtUpperMiddle);

    _get(Object.getPrototypeOf(MoveToNextFunctionAndRedrawCursorLineAtUpperMiddle.prototype), "constructor", this).apply(this, arguments);

    this.direction = "next";
  }

  // Scope based
  // -------------------------
  return MoveToNextFunctionAndRedrawCursorLineAtUpperMiddle;
})(MoveToPreviousFunctionAndRedrawCursorLineAtUpperMiddle);

var MoveToPositionByScope = (function (_Motion24) {
  _inherits(MoveToPositionByScope, _Motion24);

  function MoveToPositionByScope() {
    _classCallCheck(this, MoveToPositionByScope);

    _get(Object.getPrototypeOf(MoveToPositionByScope.prototype), "constructor", this).apply(this, arguments);

    this.direction = "backward";
    this.scope = ".";
  }

  _createClass(MoveToPositionByScope, [{
    key: "moveCursor",
    value: function moveCursor(cursor) {
      var _this22 = this;

      this.moveCursorCountTimes(cursor, function () {
        var cursorPosition = cursor.getBufferPosition();
        var point = _this22.utils.detectScopeStartPositionForScope(_this22.editor, cursorPosition, _this22.direction, _this22.scope);
        if (point) cursor.setBufferPosition(point);
      });
    }
  }], [{
    key: "command",
    value: false,
    enumerable: true
  }]);

  return MoveToPositionByScope;
})(Motion);

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

var MoveToNextString = (function (_MoveToPreviousString) {
  _inherits(MoveToNextString, _MoveToPreviousString);

  function MoveToNextString() {
    _classCallCheck(this, MoveToNextString);

    _get(Object.getPrototypeOf(MoveToNextString.prototype), "constructor", this).apply(this, arguments);

    this.direction = "forward";
  }

  return MoveToNextString;
})(MoveToPreviousString);

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

var MoveToNextNumber = (function (_MoveToPreviousNumber) {
  _inherits(MoveToNextNumber, _MoveToPreviousNumber);

  function MoveToNextNumber() {
    _classCallCheck(this, MoveToNextNumber);

    _get(Object.getPrototypeOf(MoveToNextNumber.prototype), "constructor", this).apply(this, arguments);

    this.direction = "forward";
  }

  return MoveToNextNumber;
})(MoveToPreviousNumber);

var MoveToNextOccurrence = (function (_Motion25) {
  _inherits(MoveToNextOccurrence, _Motion25);

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

var MoveToPreviousOccurrence = (function (_MoveToNextOccurrence) {
  _inherits(MoveToPreviousOccurrence, _MoveToNextOccurrence);

  function MoveToPreviousOccurrence() {
    _classCallCheck(this, MoveToPreviousOccurrence);

    _get(Object.getPrototypeOf(MoveToPreviousOccurrence.prototype), "constructor", this).apply(this, arguments);

    this.direction = "previous";
  }

  // -------------------------
  // keymap: %

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

var MoveToPair = (function (_Motion26) {
  _inherits(MoveToPair, _Motion26);

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

module.exports = {
  Motion: Motion,
  CurrentSelection: CurrentSelection,
  MoveLeft: MoveLeft,
  MoveRight: MoveRight,
  MoveRightBufferColumn: MoveRightBufferColumn,
  MoveUp: MoveUp,
  MoveUpWrap: MoveUpWrap,
  MoveDown: MoveDown,
  MoveDownWrap: MoveDownWrap,
  MoveUpScreen: MoveUpScreen,
  MoveDownScreen: MoveDownScreen,
  MoveUpToEdge: MoveUpToEdge,
  MoveDownToEdge: MoveDownToEdge,
  WordMotion: WordMotion,
  MoveToNextWord: MoveToNextWord,
  MoveToNextWholeWord: MoveToNextWholeWord,
  MoveToNextAlphanumericWord: MoveToNextAlphanumericWord,
  MoveToNextSmartWord: MoveToNextSmartWord,
  MoveToNextSubword: MoveToNextSubword,
  MoveToPreviousWord: MoveToPreviousWord,
  MoveToPreviousWholeWord: MoveToPreviousWholeWord,
  MoveToPreviousAlphanumericWord: MoveToPreviousAlphanumericWord,
  MoveToPreviousSmartWord: MoveToPreviousSmartWord,
  MoveToPreviousSubword: MoveToPreviousSubword,
  MoveToEndOfWord: MoveToEndOfWord,
  MoveToEndOfWholeWord: MoveToEndOfWholeWord,
  MoveToEndOfAlphanumericWord: MoveToEndOfAlphanumericWord,
  MoveToEndOfSmartWord: MoveToEndOfSmartWord,
  MoveToEndOfSubword: MoveToEndOfSubword,
  MoveToPreviousEndOfWord: MoveToPreviousEndOfWord,
  MoveToPreviousEndOfWholeWord: MoveToPreviousEndOfWholeWord,
  MoveToNextSentence: MoveToNextSentence,
  MoveToPreviousSentence: MoveToPreviousSentence,
  MoveToNextSentenceSkipBlankRow: MoveToNextSentenceSkipBlankRow,
  MoveToPreviousSentenceSkipBlankRow: MoveToPreviousSentenceSkipBlankRow,
  MoveToNextParagraph: MoveToNextParagraph,
  MoveToPreviousParagraph: MoveToPreviousParagraph,
  MoveToBeginningOfLine: MoveToBeginningOfLine,
  MoveToColumn: MoveToColumn,
  MoveToLastCharacterOfLine: MoveToLastCharacterOfLine,
  MoveToLastNonblankCharacterOfLineAndDown: MoveToLastNonblankCharacterOfLineAndDown,
  MoveToFirstCharacterOfLine: MoveToFirstCharacterOfLine,
  MoveToFirstCharacterOfLineUp: MoveToFirstCharacterOfLineUp,
  MoveToFirstCharacterOfLineDown: MoveToFirstCharacterOfLineDown,
  MoveToFirstCharacterOfLineAndDown: MoveToFirstCharacterOfLineAndDown,
  MoveToScreenColumn: MoveToScreenColumn,
  MoveToBeginningOfScreenLine: MoveToBeginningOfScreenLine,
  MoveToFirstCharacterOfScreenLine: MoveToFirstCharacterOfScreenLine,
  MoveToLastCharacterOfScreenLine: MoveToLastCharacterOfScreenLine,
  MoveToFirstLine: MoveToFirstLine,
  MoveToLastLine: MoveToLastLine,
  MoveToLineByPercent: MoveToLineByPercent,
  MoveToRelativeLine: MoveToRelativeLine,
  MoveToRelativeLineMinimumTwo: MoveToRelativeLineMinimumTwo,
  MoveToTopOfScreen: MoveToTopOfScreen,
  MoveToMiddleOfScreen: MoveToMiddleOfScreen,
  MoveToBottomOfScreen: MoveToBottomOfScreen,
  Scroll: Scroll,
  ScrollFullScreenDown: ScrollFullScreenDown,
  ScrollFullScreenUp: ScrollFullScreenUp,
  ScrollHalfScreenDown: ScrollHalfScreenDown,
  ScrollHalfScreenUp: ScrollHalfScreenUp,
  ScrollQuarterScreenDown: ScrollQuarterScreenDown,
  ScrollQuarterScreenUp: ScrollQuarterScreenUp,
  Find: Find,
  FindBackwards: FindBackwards,
  Till: Till,
  TillBackwards: TillBackwards,
  MoveToMark: MoveToMark,
  MoveToMarkLine: MoveToMarkLine,
  MoveToPreviousFoldStart: MoveToPreviousFoldStart,
  MoveToNextFoldStart: MoveToNextFoldStart,
  MoveToPreviousFoldStartWithSameIndent: MoveToPreviousFoldStartWithSameIndent,
  MoveToNextFoldStartWithSameIndent: MoveToNextFoldStartWithSameIndent,
  MoveToPreviousFoldEnd: MoveToPreviousFoldEnd,
  MoveToNextFoldEnd: MoveToNextFoldEnd,
  MoveToPreviousFunction: MoveToPreviousFunction,
  MoveToNextFunction: MoveToNextFunction,
  MoveToPreviousFunctionAndRedrawCursorLineAtUpperMiddle: MoveToPreviousFunctionAndRedrawCursorLineAtUpperMiddle,
  MoveToNextFunctionAndRedrawCursorLineAtUpperMiddle: MoveToNextFunctionAndRedrawCursorLineAtUpperMiddle,
  MoveToPositionByScope: MoveToPositionByScope,
  MoveToPreviousString: MoveToPreviousString,
  MoveToNextString: MoveToNextString,
  MoveToPreviousNumber: MoveToPreviousNumber,
  MoveToNextNumber: MoveToNextNumber,
  MoveToNextOccurrence: MoveToNextOccurrence,
  MoveToPreviousOccurrence: MoveToPreviousOccurrence,
  MoveToPair: MoveToPair
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL21vdGlvbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxXQUFXLENBQUE7Ozs7Ozs7Ozs7OztBQUVYLElBQU0sQ0FBQyxHQUFHLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFBOztlQUNiLE9BQU8sQ0FBQyxNQUFNLENBQUM7O0lBQS9CLEtBQUssWUFBTCxLQUFLO0lBQUUsS0FBSyxZQUFMLEtBQUs7O0FBRW5CLElBQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQTs7SUFFeEIsTUFBTTtZQUFOLE1BQU07O1dBQU4sTUFBTTswQkFBTixNQUFNOzsrQkFBTixNQUFNOztTQUlWLFFBQVEsR0FBRyxJQUFJO1NBQ2YsU0FBUyxHQUFHLEtBQUs7U0FDakIsSUFBSSxHQUFHLGVBQWU7U0FDdEIsSUFBSSxHQUFHLEtBQUs7U0FDWixjQUFjLEdBQUcsS0FBSztTQUN0QixhQUFhLEdBQUcsSUFBSTtTQUNwQixxQkFBcUIsR0FBRyxLQUFLO1NBQzdCLGVBQWUsR0FBRyxLQUFLO1NBQ3ZCLFlBQVksR0FBRyxLQUFLO1NBQ3BCLG1CQUFtQixHQUFHLElBQUk7Ozs7O2VBYnRCLE1BQU07O1dBZUgsbUJBQUc7QUFDUixhQUFPLENBQUMsSUFBSSxDQUFDLFlBQVksSUFBSSxJQUFJLENBQUMsS0FBSyxJQUFJLElBQUksQ0FBQTtLQUNoRDs7O1dBRVMsc0JBQUc7QUFDWCxhQUFPLElBQUksQ0FBQyxJQUFJLEtBQUssVUFBVSxDQUFBO0tBQ2hDOzs7V0FFVSx1QkFBRztBQUNaLGFBQU8sSUFBSSxDQUFDLElBQUksS0FBSyxXQUFXLENBQUE7S0FDakM7OztXQUVRLG1CQUFDLElBQUksRUFBRTtBQUNkLFVBQUksSUFBSSxLQUFLLGVBQWUsRUFBRTtBQUM1QixZQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxJQUFJLEtBQUssVUFBVSxHQUFHLEtB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QUFDckIsTUFBSSxFQUFKLElBQUk7QUFDSixlQUFhLEVBQWIsYUFBYTtBQUNiLE1BQUksRUFBSixJQUFJO0FBQ0osZUFBYSxFQUFiLGFBQWE7QUFDYixZQUFVLEVBQVYsVUFBVTtBQUNWLGdCQUFjLEVBQWQsY0FBYztBQUNkLHlCQUF1QixFQUF2Qix1QkFBdUI7QUFDdkIscUJBQW1CLEVBQW5CLG1CQUFtQjtBQUNuQix1Q0FBcUMsRUFBckMscUNBQXFDO0FBQ3JDLG1DQUFpQyxFQUFqQyxpQ0FBaUM7QUFDakMsdUJBQXFCLEVBQXJCLHFCQUFxQjtBQUNyQixtQkFBaUIsRUFBakIsaUJBQWlCO0FBQ2pCLHdCQUFzQixFQUF0QixzQkFBc0I7QUFDdEIsb0JBQWtCLEVBQWxCLGtCQUFrQjtBQUNsQix3REFBc0QsRUFBdEQsc0RBQXNEO0FBQ3RELG9EQUFrRCxFQUFsRCxrREFBa0Q7QUFDbEQsdUJBQXFCLEVBQXJCLHFCQUFxQjtBQUNyQixzQkFBb0IsRUFBcEIsb0JBQW9CO0FBQ3BCLGtCQUFnQixFQUFoQixnQkFBZ0I7QUFDaEIsc0JBQW9CLEVBQXBCLG9CQUFvQjtBQUNwQixrQkFBZ0IsRUFBaEIsZ0JBQWdCO0FBQ2hCLHNCQUFvQixFQUFwQixvQkFBb0I7QUFDcEIsMEJBQXdCLEVBQXhCLHdCQUF3QjtBQUN4QixZQUFVLEVBQVYsVUFBVTtDQUNYLENBQUEiLCJmaWxlIjoiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvbW90aW9uLmpzIiwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2UgYmFiZWxcIlxuXG5jb25zdCBfID0gcmVxdWlyZShcInVuZGVyc2NvcmUtcGx1c1wiKVxuY29uc3Qge1BvaW50LCBSYW5nZX0gPSByZXF1aXJlKFwiYXRvbVwiKVxuXG5jb25zdCBCYXNlID0gcmVxdWlyZShcIi4vYmFzZVwiKVxuXG5jbGFzcyBNb3Rpb24gZXh0ZW5kcyBCYXNlIHtcbiAgc3RhdGljIG9wZXJhdGlvbktpbmQgPSBcIm1vdGlvblwiXG4gIHN0YXRpYyBjb21tYW5kID0gZmFsc2VcblxuICBvcGVyYXRvciA9IG51bGxcbiAgaW5jbHVzaXZlID0gZmFsc2VcbiAgd2lzZSA9IFwiY2hhcmFjdGVyd2lzZVwiXG4gIGp1bXAgPSBmYWxzZVxuICB2ZXJ0aWNhbE1vdGlvbiA9IGZhbHNlXG4gIG1vdmVTdWNjZWVkZWQgPSBudWxsXG4gIG1vdmVTdWNjZXNzT25MaW5ld2lzZSA9IGZhbHNlXG4gIHNlbGVjdFN1Y2NlZWRlZCA9IGZhbHNlXG4gIHJlcXVpcmVJbnB1dCA9IGZhbHNlXG4gIGNhc2VTZW5zaXRpdml0eUtpbmQgPSBudWxsXG5cbiAgaXNSZWFkeSgpIHtcbiAgICByZXR1cm4gIXRoaXMucmVxdWlyZUlucHV0IHx8IHRoaXMuaW5wdXQgIT0gbnVsbFxuICB9XG5cbiAgaXNMaW5ld2lzZSgpIHtcbiAgICByZXR1cm4gdGhpcy53aXNlID09PSBcImxpbmV3aXNlXCJcbiAgfVxuXG4gIGlzQmxvY2t3aXNlKCkge1xuICAgIHJldHVybiB0aGlzLndpc2UgPT09IFwiYmxvY2t3aXNlXCJcbiAgfVxuXG4gIGZvcmNlV2lzZSh3aXNlKSB7XG4gICAgaWYgKHdpc2UgPT09IFwiY2hhcmFjdGVyd2lzZVwiKSB7XG4gICAgICB0aGlzLmluY2x1c2l2ZSA9IHRoaXMud2lzZSA9PT0gXCJsaW5ld2lzZVwiID8gZmFsc2UgOiAhdGhpcy5pbmNsdXNpdmVcbiAgICB9XG4gICAgdGhpcy53aXNlID0gd2lzZVxuICB9XG5cbiAgcmVzZXRTdGF0ZSgpIHtcbiAgICB0aGlzLnNlbGVjdFN1Y2NlZWRlZCA9IGZhbHNlXG4gIH1cblxuICBtb3ZlV2l0aFNhdmVKdW1wKGN1cnNvcikge1xuICAgIGNvbnN0IG9yaWdpbmFsUG9zaXRpb24gPSB0aGlzLmp1bXAgJiYgY3Vyc29yLmlzTGFzdEN1cnNvcigpID8gY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKCkgOiB1bmRlZmluZWRcblxuICAgIHRoaXMubW92ZUN1cnNvcihjdXJzb3IpXG5cbiAgICBpZiAob3JpZ2luYWxQb3NpdGlvbiAmJiAhY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKCkuaXNFcXVhbChvcmlnaW5hbFBvc2l0aW9uKSkge1xuICAgICAgdGhpcy52aW1TdGF0ZS5tYXJrLnNldChcImBcIiwgb3JpZ2luYWxQb3NpdGlvbilcbiAgICAgIHRoaXMudmltU3RhdGUubWFyay5zZXQoXCInXCIsIG9yaWdpbmFsUG9zaXRpb24pXG4gICAgfVxuICB9XG5cbiAgZXhlY3V0ZSgpIHtcbiAgICBpZiAodGhpcy5vcGVyYXRvcikge1xuICAgICAgdGhpcy5zZWxlY3QoKVxuICAgIH0gZWxzZSB7XG4gICAgICBmb3IgKGNvbnN0IGN1cnNvciBvZiB0aGlzLmVkaXRvci5nZXRDdXJzb3JzKCkpIHtcbiAgICAgICAgdGhpcy5tb3ZlV2l0aFNhdmVKdW1wKGN1cnNvcilcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5lZGl0b3IubWVyZ2VDdXJzb3JzKClcbiAgICB0aGlzLmVkaXRvci5tZXJnZUludGVyc2VjdGluZ1NlbGVjdGlvbnMoKVxuICB9XG5cbiAgLy8gTk9URTogc2VsZWN0aW9uIGlzIGFscmVhZHkgXCJub3JtYWxpemVkXCIgYmVmb3JlIHRoaXMgZnVuY3Rpb24gaXMgY2FsbGVkLlxuICBzZWxlY3QoKSB7XG4gICAgLy8gbmVlZCB0byBjYXJlIHdhcyB2aXN1YWwgZm9yIGAuYCByZXBlYXRlZC5cbiAgICBjb25zdCBpc09yV2FzVmlzdWFsID0gdGhpcy5vcGVyYXRvci5pbnN0YW5jZW9mKFwiU2VsZWN0QmFzZVwiKSB8fCB0aGlzLm5hbWUgPT09IFwiQ3VycmVudFNlbGVjdGlvblwiXG5cbiAgICBmb3IgKGNvbnN0IHNlbGVjdGlvbiBvZiB0aGlzLmVkaXRvci5nZXRTZWxlY3Rpb25zKCkpIHtcbiAgICAgIHNlbGVjdGlvbi5tb2RpZnlTZWxlY3Rpb24oKCkgPT4gdGhpcy5tb3ZlV2l0aFNhdmVKdW1wKHNlbGVjdGlvbi5jdXJzb3IpKVxuXG4gICAgICBjb25zdCBzZWxlY3RTdWNjZWVkZWQgPVxuICAgICAgICB0aGlzLm1vdmVTdWNjZWVkZWQgIT0gbnVsbFxuICAgICAgICAgID8gdGhpcy5tb3ZlU3VjY2VlZGVkXG4gICAgICAgICAgOiAhc2VsZWN0aW9uLmlzRW1wdHkoKSB8fCAodGhpcy5pc0xpbmV3aXNlKCkgJiYgdGhpcy5tb3ZlU3VjY2Vzc09uTGluZXdpc2UpXG4gICAgICBpZiAoIXRoaXMuc2VsZWN0U3VjY2VlZGVkKSB0aGlzLnNlbGVjdFN1Y2NlZWRlZCA9IHNlbGVjdFN1Y2NlZWRlZFxuXG4gICAgICBpZiAoaXNPcldhc1Zpc3VhbCB8fCAoc2VsZWN0U3VjY2VlZGVkICYmICh0aGlzLmluY2x1c2l2ZSB8fCB0aGlzLmlzTGluZXdpc2UoKSkpKSB7XG4gICAgICAgIGNvbnN0ICRzZWxlY3Rpb24gPSB0aGlzLnN3cmFwKHNlbGVjdGlvbilcbiAgICAgICAgJHNlbGVjdGlvbi5zYXZlUHJvcGVydGllcyh0cnVlKSAvLyBzYXZlIHByb3BlcnR5IG9mIFwiYWxyZWFkeS1ub3JtYWxpemVkLXNlbGVjdGlvblwiXG4gICAgICAgICRzZWxlY3Rpb24uYXBwbHlXaXNlKHRoaXMud2lzZSlcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodGhpcy53aXNlID09PSBcImJsb2Nrd2lzZVwiKSB7XG4gICAgICB0aGlzLnZpbVN0YXRlLmdldExhc3RCbG9ja3dpc2VTZWxlY3Rpb24oKS5hdXRvc2Nyb2xsKClcbiAgICB9XG4gIH1cblxuICBzZXRDdXJzb3JCdWZmZXJSb3coY3Vyc29yLCByb3csIG9wdGlvbnMpIHtcbiAgICBpZiAodGhpcy52ZXJ0aWNhbE1vdGlvbiAmJiAhdGhpcy5nZXRDb25maWcoXCJzdGF5T25WZXJ0aWNhbE1vdGlvblwiKSkge1xuICAgICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHRoaXMuZ2V0Rmlyc3RDaGFyYWN0ZXJQb3NpdGlvbkZvckJ1ZmZlclJvdyhyb3cpLCBvcHRpb25zKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnV0aWxzLnNldEJ1ZmZlclJvdyhjdXJzb3IsIHJvdywgb3B0aW9ucylcbiAgICB9XG4gIH1cblxuICAvLyBDYWxsIGNhbGxiYWNrIGNvdW50IHRpbWVzLlxuICAvLyBCdXQgYnJlYWsgaXRlcmF0aW9uIHdoZW4gY3Vyc29yIHBvc2l0aW9uIGRpZCBub3QgY2hhbmdlIGJlZm9yZS9hZnRlciBjYWxsYmFjay5cbiAgbW92ZUN1cnNvckNvdW50VGltZXMoY3Vyc29yLCBmbikge1xuICAgIGxldCBvbGRQb3NpdGlvbiA9IGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXG4gICAgdGhpcy5jb3VudFRpbWVzKHRoaXMuZ2V0Q291bnQoKSwgc3RhdGUgPT4ge1xuICAgICAgZm4oc3RhdGUpXG4gICAgICBjb25zdCBuZXdQb3NpdGlvbiA9IGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXG4gICAgICBpZiAobmV3UG9zaXRpb24uaXNFcXVhbChvbGRQb3NpdGlvbikpIHN0YXRlLnN0b3AoKVxuICAgICAgb2xkUG9zaXRpb24gPSBuZXdQb3NpdGlvblxuICAgIH0pXG4gIH1cblxuICBpc0Nhc2VTZW5zaXRpdmUodGVybSkge1xuICAgIHJldHVybiB0aGlzLmdldENvbmZpZyhgdXNlU21hcnRjYXNlRm9yJHt0aGlzLmNhc2VTZW5zaXRpdml0eUtpbmR9YClcbiAgICAgID8gdGVybS5zZWFyY2goL1tBLVpdLykgIT09IC0xXG4gICAgICA6ICF0aGlzLmdldENvbmZpZyhgaWdub3JlQ2FzZUZvciR7dGhpcy5jYXNlU2Vuc2l0aXZpdHlLaW5kfWApXG4gIH1cblxuICBnZXRGaXJzdE9yTGFzdFBvaW50KGRpcmVjdGlvbikge1xuICAgIHJldHVybiBkaXJlY3Rpb24gPT09IFwibmV4dFwiID8gdGhpcy5nZXRWaW1Fb2ZCdWZmZXJQb3NpdGlvbigpIDogbmV3IFBvaW50KDAsIDApXG4gIH1cbn1cblxuLy8gVXNlZCBhcyBvcGVyYXRvcidzIHRhcmdldCBpbiB2aXN1YWwtbW9kZS5cbmNsYXNzIEN1cnJlbnRTZWxlY3Rpb24gZXh0ZW5kcyBNb3Rpb24ge1xuICBzdGF0aWMgY29tbWFuZCA9IGZhbHNlXG4gIHNlbGVjdGlvbkV4dGVudCA9IG51bGxcbiAgYmxvY2t3aXNlU2VsZWN0aW9uRXh0ZW50ID0gbnVsbFxuICBpbmNsdXNpdmUgPSB0cnVlXG4gIHBvaW50SW5mb0J5Q3Vyc29yID0gbmV3IE1hcCgpXG5cbiAgbW92ZUN1cnNvcihjdXJzb3IpIHtcbiAgICBpZiAodGhpcy5tb2RlID09PSBcInZpc3VhbFwiKSB7XG4gICAgICB0aGlzLnNlbGVjdGlvbkV4dGVudCA9IHRoaXMuaXNCbG9ja3dpc2UoKVxuICAgICAgICA/IHRoaXMuc3dyYXAoY3Vyc29yLnNlbGVjdGlvbikuZ2V0QmxvY2t3aXNlU2VsZWN0aW9uRXh0ZW50KClcbiAgICAgICAgOiB0aGlzLmVkaXRvci5nZXRTZWxlY3RlZEJ1ZmZlclJhbmdlKCkuZ2V0RXh0ZW50KClcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gYC5gIHJlcGVhdCBjYXNlXG4gICAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24oY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKCkudHJhbnNsYXRlKHRoaXMuc2VsZWN0aW9uRXh0ZW50KSlcbiAgICB9XG4gIH1cblxuICBzZWxlY3QoKSB7XG4gICAgaWYgKHRoaXMubW9kZSA9PT0gXCJ2aXN1YWxcIikge1xuICAgICAgc3VwZXIuc2VsZWN0KClcbiAgICB9IGVsc2Uge1xuICAgICAgZm9yIChjb25zdCBjdXJzb3Igb2YgdGhpcy5lZGl0b3IuZ2V0Q3Vyc29ycygpKSB7XG4gICAgICAgIGNvbnN0IHBvaW50SW5mbyA9IHRoaXMucG9pbnRJbmZvQnlDdXJzb3IuZ2V0KGN1cnNvcilcbiAgICAgICAgaWYgKHBvaW50SW5mbykge1xuICAgICAgICAgIGNvbnN0IHtjdXJzb3JQb3NpdGlvbiwgc3RhcnRPZlNlbGVjdGlvbn0gPSBwb2ludEluZm9cbiAgICAgICAgICBpZiAoY3Vyc29yUG9zaXRpb24uaXNFcXVhbChjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKSkpIHtcbiAgICAgICAgICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihzdGFydE9mU2VsZWN0aW9uKVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgc3VwZXIuc2VsZWN0KClcbiAgICB9XG5cbiAgICAvLyAqIFB1cnBvc2Ugb2YgcG9pbnRJbmZvQnlDdXJzb3I/IHNlZSAjMjM1IGZvciBkZXRhaWwuXG4gICAgLy8gV2hlbiBzdGF5T25UcmFuc2Zvcm1TdHJpbmcgaXMgZW5hYmxlZCwgY3Vyc29yIHBvcyBpcyBub3Qgc2V0IG9uIHN0YXJ0IG9mXG4gICAgLy8gb2Ygc2VsZWN0ZWQgcmFuZ2UuXG4gICAgLy8gQnV0IEkgd2FudCBmb2xsb3dpbmcgYmVoYXZpb3IsIHNvIG5lZWQgdG8gcHJlc2VydmUgcG9zaXRpb24gaW5mby5cbiAgICAvLyAgMS4gYHZqPi5gIC0+IGluZGVudCBzYW1lIHR3byByb3dzIHJlZ2FyZGxlc3Mgb2YgY3VycmVudCBjdXJzb3IncyByb3cuXG4gICAgLy8gIDIuIGB2aj5qLmAgLT4gaW5kZW50IHR3byByb3dzIGZyb20gY3Vyc29yJ3Mgcm93LlxuICAgIGZvciAoY29uc3QgY3Vyc29yIG9mIHRoaXMuZWRpdG9yLmdldEN1cnNvcnMoKSkge1xuICAgICAgY29uc3Qgc3RhcnRPZlNlbGVjdGlvbiA9IGN1cnNvci5zZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKS5zdGFydFxuICAgICAgdGhpcy5vbkRpZEZpbmlzaE9wZXJhdGlvbigoKSA9PiB7XG4gICAgICAgIGN1cnNvclBvc2l0aW9uID0gY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKClcbiAgICAgICAgdGhpcy5wb2ludEluZm9CeUN1cnNvci5zZXQoY3Vyc29yLCB7c3RhcnRPZlNlbGVjdGlvbiwgY3Vyc29yUG9zaXRpb259KVxuICAgICAgfSlcbiAgICB9XG4gIH1cbn1cblxuY2xhc3MgTW92ZUxlZnQgZXh0ZW5kcyBNb3Rpb24ge1xuICBtb3ZlQ3Vyc29yKGN1cnNvcikge1xuICAgIGNvbnN0IGFsbG93V3JhcCA9IHRoaXMuZ2V0Q29uZmlnKFwid3JhcExlZnRSaWdodE1vdGlvblwiKVxuICAgIHRoaXMubW92ZUN1cnNvckNvdW50VGltZXMoY3Vyc29yLCAoKSA9PiB0aGlzLnV0aWxzLm1vdmVDdXJzb3JMZWZ0KGN1cnNvciwge2FsbG93V3JhcH0pKVxuICB9XG59XG5cbmNsYXNzIE1vdmVSaWdodCBleHRlbmRzIE1vdGlvbiB7XG4gIG1vdmVDdXJzb3IoY3Vyc29yKSB7XG4gICAgY29uc3QgYWxsb3dXcmFwID0gdGhpcy5nZXRDb25maWcoXCJ3cmFwTGVmdFJpZ2h0TW90aW9uXCIpXG5cbiAgICB0aGlzLm1vdmVDdXJzb3JDb3VudFRpbWVzKGN1cnNvciwgKCkgPT4ge1xuICAgICAgdGhpcy5lZGl0b3IudW5mb2xkQnVmZmVyUm93KGN1cnNvci5nZXRCdWZmZXJSb3coKSlcblxuICAgICAgLy8gLSBXaGVuIGB3cmFwTGVmdFJpZ2h0TW90aW9uYCBlbmFibGVkIGFuZCBleGVjdXRlZCBhcyBwdXJlLW1vdGlvbiBpbiBgbm9ybWFsLW1vZGVgLFxuICAgICAgLy8gICB3ZSBuZWVkIHRvIG1vdmUgKiphZ2FpbioqIHRvIHdyYXAgdG8gbmV4dC1saW5lIGlmIGl0IHJhY2hlZCB0byBFT0wuXG4gICAgICAvLyAtIEV4cHJlc3Npb24gYCF0aGlzLm9wZXJhdG9yYCBtZWFucyBub3JtYWwtbW9kZSBtb3Rpb24uXG4gICAgICAvLyAtIEV4cHJlc3Npb24gYHRoaXMubW9kZSA9PT0gXCJub3JtYWxcImAgaXMgbm90IGFwcHJvcHJlYXRlIHNpbmNlIGl0IG1hdGNoZXMgYHhgIG9wZXJhdG9yJ3MgdGFyZ2V0IGNhc2UuXG4gICAgICBjb25zdCBuZWVkTW92ZUFnYWluID0gYWxsb3dXcmFwICYmICF0aGlzLm9wZXJhdG9yICYmICFjdXJzb3IuaXNBdEVuZE9mTGluZSgpXG5cbiAgICAgIHRoaXMudXRpbHMubW92ZUN1cnNvclJpZ2h0KGN1cnNvciwge2FsbG93V3JhcH0pXG5cbiAgICAgIGlmIChuZWVkTW92ZUFnYWluICYmIGN1cnNvci5pc0F0RW5kT2ZMaW5lKCkpIHtcbiAgICAgICAgdGhpcy51dGlscy5tb3ZlQ3Vyc29yUmlnaHQoY3Vyc29yLCB7YWxsb3dXcmFwfSlcbiAgICAgIH1cbiAgICB9KVxuICB9XG59XG5cbmNsYXNzIE1vdmVSaWdodEJ1ZmZlckNvbHVtbiBleHRlbmRzIE1vdGlvbiB7XG4gIHN0YXRpYyBjb21tYW5kID0gZmFsc2VcbiAgbW92ZUN1cnNvcihjdXJzb3IpIHtcbiAgICB0aGlzLnV0aWxzLnNldEJ1ZmZlckNvbHVtbihjdXJzb3IsIGN1cnNvci5nZXRCdWZmZXJDb2x1bW4oKSArIHRoaXMuZ2V0Q291bnQoKSlcbiAgfVxufVxuXG5jbGFzcyBNb3ZlVXAgZXh0ZW5kcyBNb3Rpb24ge1xuICB3aXNlID0gXCJsaW5ld2lzZVwiXG4gIHdyYXAgPSBmYWxzZVxuICBkaXJlY3Rpb24gPSBcInVwXCJcblxuICBnZXRCdWZmZXJSb3cocm93KSB7XG4gICAgY29uc3QgbWluID0gMFxuICAgIGNvbnN0IG1heCA9IHRoaXMuZ2V0VmltTGFzdEJ1ZmZlclJvdygpXG5cbiAgICBpZiAodGhpcy5kaXJlY3Rpb24gPT09IFwidXBcIikge1xuICAgICAgcm93ID0gdGhpcy5nZXRGb2xkU3RhcnRSb3dGb3JSb3cocm93KSAtIDFcbiAgICAgIHJvdyA9IHRoaXMud3JhcCAmJiByb3cgPCBtaW4gPyBtYXggOiB0aGlzLnV0aWxzLmxpbWl0TnVtYmVyKHJvdywge21pbn0pXG4gICAgfSBlbHNlIHtcbiAgICAgIHJvdyA9IHRoaXMuZ2V0Rm9sZEVuZFJvd0ZvclJvdyhyb3cpICsgMVxuICAgICAgcm93ID0gdGhpcy53cmFwICYmIHJvdyA+IG1heCA/IG1pbiA6IHRoaXMudXRpbHMubGltaXROdW1iZXIocm93LCB7bWF4fSlcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZ2V0Rm9sZFN0YXJ0Um93Rm9yUm93KHJvdylcbiAgfVxuXG4gIG1vdmVDdXJzb3IoY3Vyc29yKSB7XG4gICAgdGhpcy5tb3ZlQ3Vyc29yQ291bnRUaW1lcyhjdXJzb3IsICgpID0+IHRoaXMudXRpbHMuc2V0QnVmZmVyUm93KGN1cnNvciwgdGhpcy5nZXRCdWZmZXJSb3coY3Vyc29yLmdldEJ1ZmZlclJvdygpKSkpXG4gIH1cbn1cblxuY2xhc3MgTW92ZVVwV3JhcCBleHRlbmRzIE1vdmVVcCB7XG4gIHdyYXAgPSB0cnVlXG59XG5cbmNsYXNzIE1vdmVEb3duIGV4dGVuZHMgTW92ZVVwIHtcbiAgZGlyZWN0aW9uID0gXCJkb3duXCJcbn1cblxuY2xhc3MgTW92ZURvd25XcmFwIGV4dGVuZHMgTW92ZURvd24ge1xuICB3cmFwID0gdHJ1ZVxufVxuXG5jbGFzcyBNb3ZlVXBTY3JlZW4gZXh0ZW5kcyBNb3Rpb24ge1xuICB3aXNlID0gXCJsaW5ld2lzZVwiXG4gIGRpcmVjdGlvbiA9IFwidXBcIlxuICBtb3ZlQ3Vyc29yKGN1cnNvcikge1xuICAgIHRoaXMubW92ZUN1cnNvckNvdW50VGltZXMoY3Vyc29yLCAoKSA9PiB0aGlzLnV0aWxzLm1vdmVDdXJzb3JVcFNjcmVlbihjdXJzb3IpKVxuICB9XG59XG5cbmNsYXNzIE1vdmVEb3duU2NyZWVuIGV4dGVuZHMgTW92ZVVwU2NyZWVuIHtcbiAgd2lzZSA9IFwibGluZXdpc2VcIlxuICBkaXJlY3Rpb24gPSBcImRvd25cIlxuICBtb3ZlQ3Vyc29yKGN1cnNvcikge1xuICAgIHRoaXMubW92ZUN1cnNvckNvdW50VGltZXMoY3Vyc29yLCAoKSA9PiB0aGlzLnV0aWxzLm1vdmVDdXJzb3JEb3duU2NyZWVuKGN1cnNvcikpXG4gIH1cbn1cblxuY2xhc3MgTW92ZVVwVG9FZGdlIGV4dGVuZHMgTW90aW9uIHtcbiAgd2lzZSA9IFwibGluZXdpc2VcIlxuICBqdW1wID0gdHJ1ZVxuICBkaXJlY3Rpb24gPSBcInByZXZpb3VzXCJcbiAgbW92ZUN1cnNvcihjdXJzb3IpIHtcbiAgICB0aGlzLm1vdmVDdXJzb3JDb3VudFRpbWVzKGN1cnNvciwgKCkgPT4ge1xuICAgICAgY29uc3QgcG9pbnQgPSB0aGlzLmdldFBvaW50KGN1cnNvci5nZXRTY3JlZW5Qb3NpdGlvbigpKVxuICAgICAgaWYgKHBvaW50KSBjdXJzb3Iuc2V0U2NyZWVuUG9zaXRpb24ocG9pbnQpXG4gICAgfSlcbiAgfVxuXG4gIGdldFBvaW50KGZyb21Qb2ludCkge1xuICAgIGNvbnN0IHtjb2x1bW4sIHJvdzogc3RhcnRSb3d9ID0gZnJvbVBvaW50XG4gICAgZm9yIChjb25zdCByb3cgb2YgdGhpcy5nZXRTY3JlZW5Sb3dzKHtzdGFydFJvdywgZGlyZWN0aW9uOiB0aGlzLmRpcmVjdGlvbn0pKSB7XG4gICAgICBjb25zdCBwb2ludCA9IG5ldyBQb2ludChyb3csIGNvbHVtbilcbiAgICAgIGlmICh0aGlzLmlzRWRnZShwb2ludCkpIHJldHVybiBwb2ludFxuICAgIH1cbiAgfVxuXG4gIGlzRWRnZShwb2ludCkge1xuICAgIC8vIElmIHBvaW50IGlzIHN0b3BwYWJsZSBhbmQgYWJvdmUgb3IgYmVsb3cgcG9pbnQgaXMgbm90IHN0b3BwYWJsZSwgaXQncyBFZGdlIVxuICAgIHJldHVybiAoXG4gICAgICB0aGlzLmlzU3RvcHBhYmxlKHBvaW50KSAmJlxuICAgICAgKCF0aGlzLmlzU3RvcHBhYmxlKHBvaW50LnRyYW5zbGF0ZShbLTEsIDBdKSkgfHwgIXRoaXMuaXNTdG9wcGFibGUocG9pbnQudHJhbnNsYXRlKFsrMSwgMF0pKSlcbiAgICApXG4gIH1cblxuICBpc1N0b3BwYWJsZShwb2ludCkge1xuICAgIHJldHVybiAoXG4gICAgICB0aGlzLmlzTm9uV2hpdGVTcGFjZShwb2ludCkgfHxcbiAgICAgIHRoaXMuaXNGaXJzdFJvd09yTGFzdFJvd0FuZFN0b3BwYWJsZShwb2ludCkgfHxcbiAgICAgIC8vIElmIHJpZ2h0IG9yIGxlZnQgY29sdW1uIGlzIG5vbi13aGl0ZS1zcGFjZSBjaGFyLCBpdCdzIHN0b3BwYWJsZS5cbiAgICAgICh0aGlzLmlzTm9uV2hpdGVTcGFjZShwb2ludC50cmFuc2xhdGUoWzAsIC0xXSkpICYmIHRoaXMuaXNOb25XaGl0ZVNwYWNlKHBvaW50LnRyYW5zbGF0ZShbMCwgKzFdKSkpXG4gICAgKVxuICB9XG5cbiAgaXNOb25XaGl0ZVNwYWNlKHBvaW50KSB7XG4gICAgY29uc3QgY2hhciA9IHRoaXMudXRpbHMuZ2V0VGV4dEluU2NyZWVuUmFuZ2UodGhpcy5lZGl0b3IsIFJhbmdlLmZyb21Qb2ludFdpdGhEZWx0YShwb2ludCwgMCwgMSkpXG4gICAgcmV0dXJuIGNoYXIgIT0gbnVsbCAmJiAvXFxTLy50ZXN0KGNoYXIpXG4gIH1cblxuICBpc0ZpcnN0Um93T3JMYXN0Um93QW5kU3RvcHBhYmxlKHBvaW50KSB7XG4gICAgLy8gSW4gbm90bWFsLW1vZGUsIGN1cnNvciBpcyBOT1Qgc3RvcHBhYmxlIHRvIEVPTCBvZiBub24tYmxhbmsgcm93LlxuICAgIC8vIFNvIGV4cGxpY2l0bHkgZ3VhcmQgdG8gbm90IGFuc3dlciBpdCBzdG9wcGFibGUuXG4gICAgaWYgKHRoaXMubW9kZSA9PT0gXCJub3JtYWxcIiAmJiB0aGlzLnV0aWxzLnBvaW50SXNBdEVuZE9mTGluZUF0Tm9uRW1wdHlSb3codGhpcy5lZGl0b3IsIHBvaW50KSkge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG4gICAgLy8gSWYgY2xpcHBlZCwgaXQgbWVhbnMgdGhhdCBvcmlnaW5hbCBwb25pdCB3YXMgbm9uIHN0b3BwYWJsZShlLmcuIHBvaW50LmNvbHVtID4gRU9MKS5cbiAgICBjb25zdCB7cm93fSA9IHBvaW50XG4gICAgcmV0dXJuIChyb3cgPT09IDAgfHwgcm93ID09PSB0aGlzLmdldFZpbUxhc3RTY3JlZW5Sb3coKSkgJiYgcG9pbnQuaXNFcXVhbCh0aGlzLmVkaXRvci5jbGlwU2NyZWVuUG9zaXRpb24ocG9pbnQpKVxuICB9XG59XG5cbmNsYXNzIE1vdmVEb3duVG9FZGdlIGV4dGVuZHMgTW92ZVVwVG9FZGdlIHtcbiAgZGlyZWN0aW9uID0gXCJuZXh0XCJcbn1cblxuLy8gV29yZCBNb3Rpb24gZmFtaWx5XG4vLyArLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLStcbi8vIHwgZGlyZWN0aW9uIHwgd2hpY2ggICAgICB8IHdvcmQgIHwgV09SRCB8IHN1YndvcmQgfCBzbWFydHdvcmQgfCBhbHBoYW51bWVyaWMgfFxuLy8gfC0tLS0tLS0tLS0tKy0tLS0tLS0tLS0tLSstLS0tLS0tKy0tLS0tLSstLS0tLS0tLS0rLS0tLS0tLS0tLS0rLS0tLS0tLS0tLS0tLS0rXG4vLyB8IG5leHQgICAgICB8IHdvcmQtc3RhcnQgfCB3ICAgICB8IFcgICAgfCAtICAgICAgIHwgLSAgICAgICAgIHwgLSAgICAgICAgICAgIHxcbi8vIHwgcHJldmlvdXMgIHwgd29yZC1zdGFydCB8IGIgICAgIHwgYiAgICB8IC0gICAgICAgfCAtICAgICAgICAgfCAtICAgICAgICAgICAgfFxuLy8gfCBuZXh0ICAgICAgfCB3b3JkLWVuZCAgIHwgZSAgICAgfCBFICAgIHwgLSAgICAgICB8IC0gICAgICAgICB8IC0gICAgICAgICAgICB8XG4vLyB8IHByZXZpb3VzICB8IHdvcmQtZW5kICAgfCBnZSAgICB8IGcgRSAgfCBuL2EgICAgIHwgbi9hICAgICAgIHwgbi9hICAgICAgICAgIHxcbi8vICstLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tK1xuXG5jbGFzcyBXb3JkTW90aW9uIGV4dGVuZHMgTW90aW9uIHtcbiAgc3RhdGljIGNvbW1hbmQgPSBmYWxzZVxuICB3b3JkUmVnZXggPSBudWxsXG4gIHNraXBCbGFua1JvdyA9IGZhbHNlXG4gIHNraXBXaGl0ZVNwYWNlT25seVJvdyA9IGZhbHNlXG5cbiAgbW92ZUN1cnNvcihjdXJzb3IpIHtcbiAgICB0aGlzLm1vdmVDdXJzb3JDb3VudFRpbWVzKGN1cnNvciwgY291bnRTdGF0ZSA9PiB7XG4gICAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24odGhpcy5nZXRQb2ludChjdXJzb3IsIGNvdW50U3RhdGUpKVxuICAgIH0pXG4gIH1cblxuICBnZXRQb2ludChjdXJzb3IsIGNvdW50U3RhdGUpIHtcbiAgICBjb25zdCB7ZGlyZWN0aW9ufSA9IHRoaXNcbiAgICBsZXQge3doaWNofSA9IHRoaXNcbiAgICBjb25zdCByZWdleCA9IHRoaXMubmFtZS5lbmRzV2l0aChcIlN1YndvcmRcIikgPyBjdXJzb3Iuc3Vid29yZFJlZ0V4cCgpIDogdGhpcy53b3JkUmVnZXggfHwgY3Vyc29yLndvcmRSZWdFeHAoKVxuXG4gICAgY29uc3Qgb3B0aW9ucyA9IHRoaXMuYnVpbGRPcHRpb25zKGN1cnNvcilcbiAgICBpZiAoZGlyZWN0aW9uID09PSBcIm5leHRcIiAmJiB3aGljaCA9PT0gXCJzdGFydFwiICYmIHRoaXMub3BlcmF0b3IgJiYgY291bnRTdGF0ZS5pc0ZpbmFsKSB7XG4gICAgICAvLyBbTk9URV0gRXhjZXB0aW9uYWwgYmVoYXZpb3IgZm9yIHcgYW5kIFc6IFtEZXRhaWwgaW4gdmltIGhlbHAgYDpoZWxwIHdgLl1cbiAgICAgIC8vIFtjYXNlLUFdIGN3LCBjVyB0cmVhdGVkIGFzIGNlLCBjRSB3aGVuIGN1cnNvciBpcyBhdCBub24tYmxhbmsuXG4gICAgICAvLyBbY2FzZS1CXSB3aGVuIHcsIFcgdXNlZCBhcyBUQVJHRVQsIGl0IGRvZXNuJ3QgbW92ZSBvdmVyIG5ldyBsaW5lLlxuICAgICAgY29uc3Qge2Zyb219ID0gb3B0aW9uc1xuICAgICAgaWYgKHRoaXMuaXNFbXB0eVJvdyhmcm9tLnJvdykpIHJldHVybiBbZnJvbS5yb3cgKyAxLCAwXVxuXG4gICAgICAvLyBbY2FzZS1BXVxuICAgICAgaWYgKHRoaXMub3BlcmF0b3IubmFtZSA9PT0gXCJDaGFuZ2VcIiAmJiAhdGhpcy51dGlscy5wb2ludElzQXRXaGl0ZVNwYWNlKHRoaXMuZWRpdG9yLCBmcm9tKSkge1xuICAgICAgICB3aGljaCA9IFwiZW5kXCJcbiAgICAgIH1cbiAgICAgIGNvbnN0IHBvaW50ID0gdGhpcy5maW5kUG9pbnQoZGlyZWN0aW9uLCByZWdleCwgd2hpY2gsIG9wdGlvbnMpXG4gICAgICAvLyBbY2FzZS1CXVxuICAgICAgcmV0dXJuIHBvaW50ID8gUG9pbnQubWluKHBvaW50LCBbZnJvbS5yb3csIEluZmluaXR5XSkgOiB0aGlzLmdldEZpcnN0T3JMYXN0UG9pbnQoZGlyZWN0aW9uKVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5maW5kUG9pbnQoZGlyZWN0aW9uLCByZWdleCwgd2hpY2gsIG9wdGlvbnMpIHx8IHRoaXMuZ2V0Rmlyc3RPckxhc3RQb2ludChkaXJlY3Rpb24pXG4gICAgfVxuICB9XG5cbiAgYnVpbGRPcHRpb25zKGN1cnNvcikge1xuICAgIHJldHVybiB7XG4gICAgICBmcm9tOiBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKSxcbiAgICAgIHNraXBFbXB0eVJvdzogdGhpcy5za2lwRW1wdHlSb3csXG4gICAgICBza2lwV2hpdGVTcGFjZU9ubHlSb3c6IHRoaXMuc2tpcFdoaXRlU3BhY2VPbmx5Um93LFxuICAgICAgcHJlVHJhbnNsYXRlOiAodGhpcy53aGljaCA9PT0gXCJlbmRcIiAmJiBbMCwgKzFdKSB8fCB1bmRlZmluZWQsXG4gICAgICBwb3N0VHJhbnNsYXRlOiAodGhpcy53aGljaCA9PT0gXCJlbmRcIiAmJiBbMCwgLTFdKSB8fCB1bmRlZmluZWQsXG4gICAgfVxuICB9XG59XG5cbi8vIHdcbmNsYXNzIE1vdmVUb05leHRXb3JkIGV4dGVuZHMgV29yZE1vdGlvbiB7XG4gIGRpcmVjdGlvbiA9IFwibmV4dFwiXG4gIHdoaWNoID0gXCJzdGFydFwiXG59XG5cbi8vIFdcbmNsYXNzIE1vdmVUb05leHRXaG9sZVdvcmQgZXh0ZW5kcyBNb3ZlVG9OZXh0V29yZCB7XG4gIHdvcmRSZWdleCA9IC9eJHxcXFMrL2dcbn1cblxuLy8gbm8ta2V5bWFwXG5jbGFzcyBNb3ZlVG9OZXh0U3Vid29yZCBleHRlbmRzIE1vdmVUb05leHRXb3JkIHt9XG5cbi8vIG5vLWtleW1hcFxuY2xhc3MgTW92ZVRvTmV4dFNtYXJ0V29yZCBleHRlbmRzIE1vdmVUb05leHRXb3JkIHtcbiAgd29yZFJlZ2V4ID0gL1tcXHctXSsvZ1xufVxuXG4vLyBuby1rZXltYXBcbmNsYXNzIE1vdmVUb05leHRBbHBoYW51bWVyaWNXb3JkIGV4dGVuZHMgTW92ZVRvTmV4dFdvcmQge1xuICB3b3JkUmVnZXggPSAvXFx3Ky9nXG59XG5cbi8vIGJcbmNsYXNzIE1vdmVUb1ByZXZpb3VzV29yZCBleHRlbmRzIFdvcmRNb3Rpb24ge1xuICBkaXJlY3Rpb24gPSBcInByZXZpb3VzXCJcbiAgd2hpY2ggPSBcInN0YXJ0XCJcbiAgc2tpcFdoaXRlU3BhY2VPbmx5Um93ID0gdHJ1ZVxufVxuXG4vLyBCXG5jbGFzcyBNb3ZlVG9QcmV2aW91c1dob2xlV29yZCBleHRlbmRzIE1vdmVUb1ByZXZpb3VzV29yZCB7XG4gIHdvcmRSZWdleCA9IC9eJHxcXFMrL2dcbn1cblxuLy8gbm8ta2V5bWFwXG5jbGFzcyBNb3ZlVG9QcmV2aW91c1N1YndvcmQgZXh0ZW5kcyBNb3ZlVG9QcmV2aW91c1dvcmQge31cblxuLy8gbm8ta2V5bWFwXG5jbGFzcyBNb3ZlVG9QcmV2aW91c1NtYXJ0V29yZCBleHRlbmRzIE1vdmVUb1ByZXZpb3VzV29yZCB7XG4gIHdvcmRSZWdleCA9IC9bXFx3LV0rL1xufVxuXG4vLyBuby1rZXltYXBcbmNsYXNzIE1vdmVUb1ByZXZpb3VzQWxwaGFudW1lcmljV29yZCBleHRlbmRzIE1vdmVUb1ByZXZpb3VzV29yZCB7XG4gIHdvcmRSZWdleCA9IC9cXHcrL1xufVxuXG4vLyBlXG5jbGFzcyBNb3ZlVG9FbmRPZldvcmQgZXh0ZW5kcyBXb3JkTW90aW9uIHtcbiAgaW5jbHVzaXZlID0gdHJ1ZVxuICBkaXJlY3Rpb24gPSBcIm5leHRcIlxuICB3aGljaCA9IFwiZW5kXCJcbiAgc2tpcEVtcHR5Um93ID0gdHJ1ZVxuICBza2lwV2hpdGVTcGFjZU9ubHlSb3cgPSB0cnVlXG59XG5cbi8vIEVcbmNsYXNzIE1vdmVUb0VuZE9mV2hvbGVXb3JkIGV4dGVuZHMgTW92ZVRvRW5kT2ZXb3JkIHtcbiAgd29yZFJlZ2V4ID0gL1xcUysvZ1xufVxuXG4vLyBuby1rZXltYXBcbmNsYXNzIE1vdmVUb0VuZE9mU3Vid29yZCBleHRlbmRzIE1vdmVUb0VuZE9mV29yZCB7fVxuXG4vLyBuby1rZXltYXBcbmNsYXNzIE1vdmVUb0VuZE9mU21hcnRXb3JkIGV4dGVuZHMgTW92ZVRvRW5kT2ZXb3JkIHtcbiAgd29yZFJlZ2V4ID0gL1tcXHctXSsvZ1xufVxuXG4vLyBuby1rZXltYXBcbmNsYXNzIE1vdmVUb0VuZE9mQWxwaGFudW1lcmljV29yZCBleHRlbmRzIE1vdmVUb0VuZE9mV29yZCB7XG4gIHdvcmRSZWdleCA9IC9cXHcrL2dcbn1cblxuLy8gZ2VcbmNsYXNzIE1vdmVUb1ByZXZpb3VzRW5kT2ZXb3JkIGV4dGVuZHMgV29yZE1vdGlvbiB7XG4gIGluY2x1c2l2ZSA9IHRydWVcbiAgZGlyZWN0aW9uID0gXCJwcmV2aW91c1wiXG4gIHdoaWNoID0gXCJlbmRcIlxuICBza2lwV2hpdGVTcGFjZU9ubHlSb3cgPSB0cnVlXG59XG5cbi8vIGdFXG5jbGFzcyBNb3ZlVG9QcmV2aW91c0VuZE9mV2hvbGVXb3JkIGV4dGVuZHMgTW92ZVRvUHJldmlvdXNFbmRPZldvcmQge1xuICB3b3JkUmVnZXggPSAvXFxTKy9nXG59XG5cbi8vIFNlbnRlbmNlXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBTZW50ZW5jZSBpcyBkZWZpbmVkIGFzIGJlbG93XG4vLyAgLSBlbmQgd2l0aCBbJy4nLCAnIScsICc/J11cbi8vICAtIG9wdGlvbmFsbHkgZm9sbG93ZWQgYnkgWycpJywgJ10nLCAnXCInLCBcIidcIl1cbi8vICAtIGZvbGxvd2VkIGJ5IFsnJCcsICcgJywgJ1xcdCddXG4vLyAgLSBwYXJhZ3JhcGggYm91bmRhcnkgaXMgYWxzbyBzZW50ZW5jZSBib3VuZGFyeVxuLy8gIC0gc2VjdGlvbiBib3VuZGFyeSBpcyBhbHNvIHNlbnRlbmNlIGJvdW5kYXJ5KGlnbm9yZSlcbmNsYXNzIE1vdmVUb05leHRTZW50ZW5jZSBleHRlbmRzIE1vdGlvbiB7XG4gIGp1bXAgPSB0cnVlXG4gIHNlbnRlbmNlUmVnZXggPSBuZXcgUmVnRXhwKGAoPzpbXFxcXC4hXFxcXD9dW1xcXFwpXFxcXF1cIiddKlxcXFxzKyl8KFxcXFxufFxcXFxyXFxcXG4pYCwgXCJnXCIpXG4gIGRpcmVjdGlvbiA9IFwibmV4dFwiXG5cbiAgbW92ZUN1cnNvcihjdXJzb3IpIHtcbiAgICB0aGlzLm1vdmVDdXJzb3JDb3VudFRpbWVzKGN1cnNvciwgKCkgPT4ge1xuICAgICAgY29uc3QgcG9pbnQgPVxuICAgICAgICB0aGlzLmRpcmVjdGlvbiA9PT0gXCJuZXh0XCJcbiAgICAgICAgICA/IHRoaXMuZ2V0TmV4dFN0YXJ0T2ZTZW50ZW5jZShjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKSlcbiAgICAgICAgICA6IHRoaXMuZ2V0UHJldmlvdXNTdGFydE9mU2VudGVuY2UoY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKCkpXG4gICAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24ocG9pbnQgfHwgdGhpcy5nZXRGaXJzdE9yTGFzdFBvaW50KHRoaXMuZGlyZWN0aW9uKSlcbiAgICB9KVxuICB9XG5cbiAgaXNCbGFua1Jvdyhyb3cpIHtcbiAgICByZXR1cm4gdGhpcy5lZGl0b3IuaXNCdWZmZXJSb3dCbGFuayhyb3cpXG4gIH1cblxuICBnZXROZXh0U3RhcnRPZlNlbnRlbmNlKGZyb20pIHtcbiAgICByZXR1cm4gdGhpcy5maW5kSW5FZGl0b3IoXCJmb3J3YXJkXCIsIHRoaXMuc2VudGVuY2VSZWdleCwge2Zyb219LCAoe3JhbmdlLCBtYXRjaH0pID0+IHtcbiAgICAgIGlmIChtYXRjaFsxXSAhPSBudWxsKSB7XG4gICAgICAgIGNvbnN0IFtzdGFydFJvdywgZW5kUm93XSA9IFtyYW5nZS5zdGFydC5yb3csIHJhbmdlLmVuZC5yb3ddXG4gICAgICAgIGlmICh0aGlzLnNraXBCbGFua1JvdyAmJiB0aGlzLmlzQmxhbmtSb3coZW5kUm93KSkgcmV0dXJuXG4gICAgICAgIGlmICh0aGlzLmlzQmxhbmtSb3coc3RhcnRSb3cpICE9PSB0aGlzLmlzQmxhbmtSb3coZW5kUm93KSkge1xuICAgICAgICAgIHJldHVybiB0aGlzLmdldEZpcnN0Q2hhcmFjdGVyUG9zaXRpb25Gb3JCdWZmZXJSb3coZW5kUm93KVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gcmFuZ2UuZW5kXG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIGdldFByZXZpb3VzU3RhcnRPZlNlbnRlbmNlKGZyb20pIHtcbiAgICByZXR1cm4gdGhpcy5maW5kSW5FZGl0b3IoXCJiYWNrd2FyZFwiLCB0aGlzLnNlbnRlbmNlUmVnZXgsIHtmcm9tfSwgKHtyYW5nZSwgbWF0Y2h9KSA9PiB7XG4gICAgICBpZiAobWF0Y2hbMV0gIT0gbnVsbCkge1xuICAgICAgICBjb25zdCBbc3RhcnRSb3csIGVuZFJvd10gPSBbcmFuZ2Uuc3RhcnQucm93LCByYW5nZS5lbmQucm93XVxuICAgICAgICBpZiAoIXRoaXMuaXNCbGFua1JvdyhlbmRSb3cpICYmIHRoaXMuaXNCbGFua1JvdyhzdGFydFJvdykpIHtcbiAgICAgICAgICBjb25zdCBwb2ludCA9IHRoaXMuZ2V0Rmlyc3RDaGFyYWN0ZXJQb3NpdGlvbkZvckJ1ZmZlclJvdyhlbmRSb3cpXG4gICAgICAgICAgaWYgKHBvaW50LmlzTGVzc1RoYW4oZnJvbSkpIHJldHVybiBwb2ludFxuICAgICAgICAgIGVsc2UgaWYgKCF0aGlzLnNraXBCbGFua1JvdykgcmV0dXJuIHRoaXMuZ2V0Rmlyc3RDaGFyYWN0ZXJQb3NpdGlvbkZvckJ1ZmZlclJvdyhzdGFydFJvdylcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChyYW5nZS5lbmQuaXNMZXNzVGhhbihmcm9tKSkge1xuICAgICAgICByZXR1cm4gcmFuZ2UuZW5kXG4gICAgICB9XG4gICAgfSlcbiAgfVxufVxuXG5jbGFzcyBNb3ZlVG9QcmV2aW91c1NlbnRlbmNlIGV4dGVuZHMgTW92ZVRvTmV4dFNlbnRlbmNlIHtcbiAgZGlyZWN0aW9uID0gXCJwcmV2aW91c1wiXG59XG5cbmNsYXNzIE1vdmVUb05leHRTZW50ZW5jZVNraXBCbGFua1JvdyBleHRlbmRzIE1vdmVUb05leHRTZW50ZW5jZSB7XG4gIHNraXBCbGFua1JvdyA9IHRydWVcbn1cblxuY2xhc3MgTW92ZVRvUHJldmlvdXNTZW50ZW5jZVNraXBCbGFua1JvdyBleHRlbmRzIE1vdmVUb1ByZXZpb3VzU2VudGVuY2Uge1xuICBza2lwQmxhbmtSb3cgPSB0cnVlXG59XG5cbi8vIFBhcmFncmFwaFxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgTW92ZVRvTmV4dFBhcmFncmFwaCBleHRlbmRzIE1vdGlvbiB7XG4gIGp1bXAgPSB0cnVlXG4gIGRpcmVjdGlvbiA9IFwibmV4dFwiXG5cbiAgbW92ZUN1cnNvcihjdXJzb3IpIHtcbiAgICB0aGlzLm1vdmVDdXJzb3JDb3VudFRpbWVzKGN1cnNvciwgKCkgPT4ge1xuICAgICAgY29uc3QgcG9pbnQgPSB0aGlzLmdldFBvaW50KGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpKVxuICAgICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHBvaW50IHx8IHRoaXMuZ2V0Rmlyc3RPckxhc3RQb2ludCh0aGlzLmRpcmVjdGlvbikpXG4gICAgfSlcbiAgfVxuXG4gIGdldFBvaW50KGZyb20pIHtcbiAgICBsZXQgd2FzQmxhbmtSb3cgPSB0aGlzLmVkaXRvci5pc0J1ZmZlclJvd0JsYW5rKGZyb20ucm93KVxuICAgIHJldHVybiB0aGlzLmZpbmRJbkVkaXRvcih0aGlzLmRpcmVjdGlvbiwgL14vZywge2Zyb219LCAoe3JhbmdlfSkgPT4ge1xuICAgICAgY29uc3QgaXNCbGFua1JvdyA9IHRoaXMuZWRpdG9yLmlzQnVmZmVyUm93QmxhbmsocmFuZ2Uuc3RhcnQucm93KVxuICAgICAgaWYgKCF3YXNCbGFua1JvdyAmJiBpc0JsYW5rUm93KSB7XG4gICAgICAgIHJldHVybiByYW5nZS5zdGFydFxuICAgICAgfVxuICAgICAgd2FzQmxhbmtSb3cgPSBpc0JsYW5rUm93XG4gICAgfSlcbiAgfVxufVxuXG5jbGFzcyBNb3ZlVG9QcmV2aW91c1BhcmFncmFwaCBleHRlbmRzIE1vdmVUb05leHRQYXJhZ3JhcGgge1xuICBkaXJlY3Rpb24gPSBcInByZXZpb3VzXCJcbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8ga2V5bWFwOiAwXG5jbGFzcyBNb3ZlVG9CZWdpbm5pbmdPZkxpbmUgZXh0ZW5kcyBNb3Rpb24ge1xuICBtb3ZlQ3Vyc29yKGN1cnNvcikge1xuICAgIHRoaXMudXRpbHMuc2V0QnVmZmVyQ29sdW1uKGN1cnNvciwgMClcbiAgfVxufVxuXG5jbGFzcyBNb3ZlVG9Db2x1bW4gZXh0ZW5kcyBNb3Rpb24ge1xuICBtb3ZlQ3Vyc29yKGN1cnNvcikge1xuICAgIHRoaXMudXRpbHMuc2V0QnVmZmVyQ29sdW1uKGN1cnNvciwgdGhpcy5nZXRDb3VudCgtMSkpXG4gIH1cbn1cblxuY2xhc3MgTW92ZVRvTGFzdENoYXJhY3Rlck9mTGluZSBleHRlbmRzIE1vdGlvbiB7XG4gIG1vdmVDdXJzb3IoY3Vyc29yKSB7XG4gICAgY29uc3Qgcm93ID0gdGhpcy5nZXRWYWxpZFZpbUJ1ZmZlclJvdyhjdXJzb3IuZ2V0QnVmZmVyUm93KCkgKyB0aGlzLmdldENvdW50KC0xKSlcbiAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24oW3JvdywgSW5maW5pdHldKVxuICAgIGN1cnNvci5nb2FsQ29sdW1uID0gSW5maW5pdHlcbiAgfVxufVxuXG5jbGFzcyBNb3ZlVG9MYXN0Tm9uYmxhbmtDaGFyYWN0ZXJPZkxpbmVBbmREb3duIGV4dGVuZHMgTW90aW9uIHtcbiAgaW5jbHVzaXZlID0gdHJ1ZVxuXG4gIG1vdmVDdXJzb3IoY3Vyc29yKSB7XG4gICAgY29uc3Qgcm93ID0gdGhpcy51dGlscy5saW1pdE51bWJlcihjdXJzb3IuZ2V0QnVmZmVyUm93KCkgKyB0aGlzLmdldENvdW50KC0xKSwge21heDogdGhpcy5nZXRWaW1MYXN0QnVmZmVyUm93KCl9KVxuICAgIGNvbnN0IG9wdGlvbnMgPSB7ZnJvbTogW3JvdywgSW5maW5pdHldLCBhbGxvd05leHRMaW5lOiBmYWxzZX1cbiAgICBjb25zdCBwb2ludCA9IHRoaXMuZmluZEluRWRpdG9yKFwiYmFja3dhcmRcIiwgL1xcU3xeLywgb3B0aW9ucywgZXZlbnQgPT4gZXZlbnQucmFuZ2Uuc3RhcnQpXG4gICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHBvaW50KVxuICB9XG59XG5cbi8vIE1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lIGZhaW1pbHlcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gXlxuY2xhc3MgTW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmUgZXh0ZW5kcyBNb3Rpb24ge1xuICBtb3ZlQ3Vyc29yKGN1cnNvcikge1xuICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbih0aGlzLmdldEZpcnN0Q2hhcmFjdGVyUG9zaXRpb25Gb3JCdWZmZXJSb3coY3Vyc29yLmdldEJ1ZmZlclJvdygpKSlcbiAgfVxufVxuXG5jbGFzcyBNb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZVVwIGV4dGVuZHMgTW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmUge1xuICB3aXNlID0gXCJsaW5ld2lzZVwiXG4gIG1vdmVDdXJzb3IoY3Vyc29yKSB7XG4gICAgdGhpcy5tb3ZlQ3Vyc29yQ291bnRUaW1lcyhjdXJzb3IsICgpID0+IHtcbiAgICAgIGNvbnN0IHJvdyA9IHRoaXMuZ2V0VmFsaWRWaW1CdWZmZXJSb3coY3Vyc29yLmdldEJ1ZmZlclJvdygpIC0gMSlcbiAgICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihbcm93LCAwXSlcbiAgICB9KVxuICAgIHN1cGVyLm1vdmVDdXJzb3IoY3Vyc29yKVxuICB9XG59XG5cbmNsYXNzIE1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lRG93biBleHRlbmRzIE1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lIHtcbiAgd2lzZSA9IFwibGluZXdpc2VcIlxuICBtb3ZlQ3Vyc29yKGN1cnNvcikge1xuICAgIHRoaXMubW92ZUN1cnNvckNvdW50VGltZXMoY3Vyc29yLCAoKSA9PiB7XG4gICAgICBjb25zdCBwb2ludCA9IGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXG4gICAgICBpZiAocG9pbnQucm93IDwgdGhpcy5nZXRWaW1MYXN0QnVmZmVyUm93KCkpIHtcbiAgICAgICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHBvaW50LnRyYW5zbGF0ZShbKzEsIDBdKSlcbiAgICAgIH1cbiAgICB9KVxuICAgIHN1cGVyLm1vdmVDdXJzb3IoY3Vyc29yKVxuICB9XG59XG5cbmNsYXNzIE1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lQW5kRG93biBleHRlbmRzIE1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lRG93biB7XG4gIGdldENvdW50KCkge1xuICAgIHJldHVybiBzdXBlci5nZXRDb3VudCgtMSlcbiAgfVxufVxuXG5jbGFzcyBNb3ZlVG9TY3JlZW5Db2x1bW4gZXh0ZW5kcyBNb3Rpb24ge1xuICBzdGF0aWMgY29tbWFuZCA9IGZhbHNlXG4gIG1vdmVDdXJzb3IoY3Vyc29yKSB7XG4gICAgY29uc3QgYWxsb3dPZmZTY3JlZW5Qb3NpdGlvbiA9IHRoaXMuZ2V0Q29uZmlnKFwiYWxsb3dNb3ZlVG9PZmZTY3JlZW5Db2x1bW5PblNjcmVlbkxpbmVNb3Rpb25cIilcbiAgICBjb25zdCBwb2ludCA9IHRoaXMudXRpbHMuZ2V0U2NyZWVuUG9zaXRpb25Gb3JTY3JlZW5Sb3codGhpcy5lZGl0b3IsIGN1cnNvci5nZXRTY3JlZW5Sb3coKSwgdGhpcy53aGljaCwge1xuICAgICAgYWxsb3dPZmZTY3JlZW5Qb3NpdGlvbixcbiAgICB9KVxuICAgIGlmIChwb2ludCkgY3Vyc29yLnNldFNjcmVlblBvc2l0aW9uKHBvaW50KVxuICB9XG59XG5cbi8vIGtleW1hcDogZyAwXG5jbGFzcyBNb3ZlVG9CZWdpbm5pbmdPZlNjcmVlbkxpbmUgZXh0ZW5kcyBNb3ZlVG9TY3JlZW5Db2x1bW4ge1xuICB3aGljaCA9IFwiYmVnaW5uaW5nXCJcbn1cblxuLy8gZyBeOiBgbW92ZS10by1maXJzdC1jaGFyYWN0ZXItb2Ytc2NyZWVuLWxpbmVgXG5jbGFzcyBNb3ZlVG9GaXJzdENoYXJhY3Rlck9mU2NyZWVuTGluZSBleHRlbmRzIE1vdmVUb1NjcmVlbkNvbHVtbiB7XG4gIHdoaWNoID0gXCJmaXJzdC1jaGFyYWN0ZXJcIlxufVxuXG4vLyBrZXltYXA6IGcgJFxuY2xhc3MgTW92ZVRvTGFzdENoYXJhY3Rlck9mU2NyZWVuTGluZSBleHRlbmRzIE1vdmVUb1NjcmVlbkNvbHVtbiB7XG4gIHdoaWNoID0gXCJsYXN0LWNoYXJhY3RlclwiXG59XG5cbi8vIGtleW1hcDogZyBnXG5jbGFzcyBNb3ZlVG9GaXJzdExpbmUgZXh0ZW5kcyBNb3Rpb24ge1xuICB3aXNlID0gXCJsaW5ld2lzZVwiXG4gIGp1bXAgPSB0cnVlXG4gIHZlcnRpY2FsTW90aW9uID0gdHJ1ZVxuICBtb3ZlU3VjY2Vzc09uTGluZXdpc2UgPSB0cnVlXG5cbiAgbW92ZUN1cnNvcihjdXJzb3IpIHtcbiAgICB0aGlzLnNldEN1cnNvckJ1ZmZlclJvdyhjdXJzb3IsIHRoaXMuZ2V0VmFsaWRWaW1CdWZmZXJSb3codGhpcy5nZXRSb3coKSkpXG4gICAgY3Vyc29yLmF1dG9zY3JvbGwoe2NlbnRlcjogdHJ1ZX0pXG4gIH1cblxuICBnZXRSb3coKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0Q291bnQoLTEpXG4gIH1cbn1cblxuLy8ga2V5bWFwOiBHXG5jbGFzcyBNb3ZlVG9MYXN0TGluZSBleHRlbmRzIE1vdmVUb0ZpcnN0TGluZSB7XG4gIGRlZmF1bHRDb3VudCA9IEluZmluaXR5XG59XG5cbi8vIGtleW1hcDogTiUgZS5nLiAxMCVcbmNsYXNzIE1vdmVUb0xpbmVCeVBlcmNlbnQgZXh0ZW5kcyBNb3ZlVG9GaXJzdExpbmUge1xuICBnZXRSb3coKSB7XG4gICAgY29uc3QgcGVyY2VudCA9IHRoaXMudXRpbHMubGltaXROdW1iZXIodGhpcy5nZXRDb3VudCgpLCB7bWF4OiAxMDB9KVxuICAgIHJldHVybiBNYXRoLmZsb29yKHRoaXMuZWRpdG9yLmdldExhc3RCdWZmZXJSb3coKSAqIChwZXJjZW50IC8gMTAwKSlcbiAgfVxufVxuXG5jbGFzcyBNb3ZlVG9SZWxhdGl2ZUxpbmUgZXh0ZW5kcyBNb3Rpb24ge1xuICBzdGF0aWMgY29tbWFuZCA9IGZhbHNlXG4gIHdpc2UgPSBcImxpbmV3aXNlXCJcbiAgbW92ZVN1Y2Nlc3NPbkxpbmV3aXNlID0gdHJ1ZVxuXG4gIG1vdmVDdXJzb3IoY3Vyc29yKSB7XG4gICAgbGV0IHJvd1xuICAgIGxldCBjb3VudCA9IHRoaXMuZ2V0Q291bnQoKVxuICAgIGlmIChjb3VudCA8IDApIHtcbiAgICAgIC8vIFN1cHBvcnQgbmVnYXRpdmUgY291bnRcbiAgICAgIC8vIE5lZ2F0aXZlIGNvdW50IGNhbiBiZSBwYXNzZWQgbGlrZSBgb3BlcmF0aW9uU3RhY2sucnVuKFwiTW92ZVRvUmVsYXRpdmVMaW5lXCIsIHtjb3VudDogLTV9KWAuXG4gICAgICAvLyBDdXJyZW50bHkgdXNlZCBpbiB2aW0tbW9kZS1wbHVzLWV4LW1vZGUgcGtnLlxuICAgICAgY291bnQgKz0gMVxuICAgICAgcm93ID0gdGhpcy5nZXRGb2xkU3RhcnRSb3dGb3JSb3coY3Vyc29yLmdldEJ1ZmZlclJvdygpKVxuICAgICAgd2hpbGUgKGNvdW50KysgPCAwKSByb3cgPSB0aGlzLmdldEZvbGRTdGFydFJvd0ZvclJvdyhyb3cgLSAxKVxuICAgIH0gZWxzZSB7XG4gICAgICBjb3VudCAtPSAxXG4gICAgICByb3cgPSB0aGlzLmdldEZvbGRFbmRSb3dGb3JSb3coY3Vyc29yLmdldEJ1ZmZlclJvdygpKVxuICAgICAgd2hpbGUgKGNvdW50LS0gPiAwKSByb3cgPSB0aGlzLmdldEZvbGRFbmRSb3dGb3JSb3cocm93ICsgMSlcbiAgICB9XG4gICAgdGhpcy51dGlscy5zZXRCdWZmZXJSb3coY3Vyc29yLCByb3cpXG4gIH1cbn1cblxuY2xhc3MgTW92ZVRvUmVsYXRpdmVMaW5lTWluaW11bVR3byBleHRlbmRzIE1vdmVUb1JlbGF0aXZlTGluZSB7XG4gIHN0YXRpYyBjb21tYW5kID0gZmFsc2VcbiAgZ2V0Q291bnQoLi4uYXJncykge1xuICAgIHJldHVybiB0aGlzLnV0aWxzLmxpbWl0TnVtYmVyKHN1cGVyLmdldENvdW50KC4uLmFyZ3MpLCB7bWluOiAyfSlcbiAgfVxufVxuXG4vLyBQb3NpdGlvbiBjdXJzb3Igd2l0aG91dCBzY3JvbGxpbmcuLCBILCBNLCBMXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBrZXltYXA6IEhcbmNsYXNzIE1vdmVUb1RvcE9mU2NyZWVuIGV4dGVuZHMgTW90aW9uIHtcbiAgd2lzZSA9IFwibGluZXdpc2VcIlxuICBqdW1wID0gdHJ1ZVxuICBkZWZhdWx0Q291bnQgPSAwXG4gIHZlcnRpY2FsTW90aW9uID0gdHJ1ZVxuXG4gIG1vdmVDdXJzb3IoY3Vyc29yKSB7XG4gICAgY29uc3QgYnVmZmVyUm93ID0gdGhpcy5lZGl0b3IuYnVmZmVyUm93Rm9yU2NyZWVuUm93KHRoaXMuZ2V0U2NyZWVuUm93KCkpXG4gICAgdGhpcy5zZXRDdXJzb3JCdWZmZXJSb3coY3Vyc29yLCBidWZmZXJSb3cpXG4gIH1cblxuICBnZXRTY3JlZW5Sb3coKSB7XG4gICAgY29uc3Qge2xpbWl0TnVtYmVyfSA9IHRoaXMudXRpbHNcbiAgICBjb25zdCBmaXJzdFZpc2libGVSb3cgPSB0aGlzLmVkaXRvci5nZXRGaXJzdFZpc2libGVTY3JlZW5Sb3coKVxuICAgIGNvbnN0IGxhc3RWaXNpYmxlUm93ID0gbGltaXROdW1iZXIodGhpcy5lZGl0b3IuZ2V0TGFzdFZpc2libGVTY3JlZW5Sb3coKSwge21heDogdGhpcy5nZXRWaW1MYXN0U2NyZWVuUm93KCl9KVxuXG4gICAgY29uc3QgYmFzZU9mZnNldCA9IDJcbiAgICBpZiAodGhpcy5uYW1lID09PSBcIk1vdmVUb1RvcE9mU2NyZWVuXCIpIHtcbiAgICAgIGNvbnN0IG9mZnNldCA9IGZpcnN0VmlzaWJsZVJvdyA9PT0gMCA/IDAgOiBiYXNlT2Zmc2V0XG4gICAgICByZXR1cm4gbGltaXROdW1iZXIoZmlyc3RWaXNpYmxlUm93ICsgdGhpcy5nZXRDb3VudCgtMSksIHttaW46IGZpcnN0VmlzaWJsZVJvdyArIG9mZnNldCwgbWF4OiBsYXN0VmlzaWJsZVJvd30pXG4gICAgfSBlbHNlIGlmICh0aGlzLm5hbWUgPT09IFwiTW92ZVRvTWlkZGxlT2ZTY3JlZW5cIikge1xuICAgICAgcmV0dXJuIGZpcnN0VmlzaWJsZVJvdyArIE1hdGguZmxvb3IoKGxhc3RWaXNpYmxlUm93IC0gZmlyc3RWaXNpYmxlUm93KSAvIDIpXG4gICAgfSBlbHNlIGlmICh0aGlzLm5hbWUgPT09IFwiTW92ZVRvQm90dG9tT2ZTY3JlZW5cIikge1xuICAgICAgY29uc3Qgb2Zmc2V0ID0gbGFzdFZpc2libGVSb3cgPT09IHRoaXMuZ2V0VmltTGFzdFNjcmVlblJvdygpID8gMCA6IGJhc2VPZmZzZXQgKyAxXG4gICAgICByZXR1cm4gbGltaXROdW1iZXIobGFzdFZpc2libGVSb3cgLSB0aGlzLmdldENvdW50KC0xKSwge21pbjogZmlyc3RWaXNpYmxlUm93LCBtYXg6IGxhc3RWaXNpYmxlUm93IC0gb2Zmc2V0fSlcbiAgICB9XG4gIH1cbn1cblxuY2xhc3MgTW92ZVRvTWlkZGxlT2ZTY3JlZW4gZXh0ZW5kcyBNb3ZlVG9Ub3BPZlNjcmVlbiB7fSAvLyBrZXltYXA6IE1cbmNsYXNzIE1vdmVUb0JvdHRvbU9mU2NyZWVuIGV4dGVuZHMgTW92ZVRvVG9wT2ZTY3JlZW4ge30gLy8ga2V5bWFwOiBMXG5cbi8vIFNjcm9sbGluZ1xuLy8gSGFsZjogY3RybC1kLCBjdHJsLXVcbi8vIEZ1bGw6IGN0cmwtZiwgY3RybC1iXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBbRklYTUVdIGNvdW50IGJlaGF2ZSBkaWZmZXJlbnRseSBmcm9tIG9yaWdpbmFsIFZpbS5cbmNsYXNzIFNjcm9sbCBleHRlbmRzIE1vdGlvbiB7XG4gIHN0YXRpYyBjb21tYW5kID0gZmFsc2VcbiAgc3RhdGljIHNjcm9sbFRhc2sgPSBudWxsXG4gIHN0YXRpYyBhbW91bnRPZlBhZ2VCeU5hbWUgPSB7XG4gICAgU2Nyb2xsRnVsbFNjcmVlbkRvd246IDEsXG4gICAgU2Nyb2xsRnVsbFNjcmVlblVwOiAtMSxcbiAgICBTY3JvbGxIYWxmU2NyZWVuRG93bjogMC41LFxuICAgIFNjcm9sbEhhbGZTY3JlZW5VcDogLTAuNSxcbiAgICBTY3JvbGxRdWFydGVyU2NyZWVuRG93bjogMC4yNSxcbiAgICBTY3JvbGxRdWFydGVyU2NyZWVuVXA6IC0wLjI1LFxuICB9XG4gIHZlcnRpY2FsTW90aW9uID0gdHJ1ZVxuXG4gIGV4ZWN1dGUoKSB7XG4gICAgY29uc3QgYW1vdW50T2ZQYWdlID0gdGhpcy5jb25zdHJ1Y3Rvci5hbW91bnRPZlBhZ2VCeU5hbWVbdGhpcy5uYW1lXVxuICAgIGNvbnN0IGFtb3VudE9mU2NyZWVuUm93cyA9IE1hdGgudHJ1bmMoYW1vdW50T2ZQYWdlICogdGhpcy5lZGl0b3IuZ2V0Um93c1BlclBhZ2UoKSAqIHRoaXMuZ2V0Q291bnQoKSlcbiAgICB0aGlzLmFtb3VudE9mUGl4ZWxzID0gYW1vdW50T2ZTY3JlZW5Sb3dzICogdGhpcy5lZGl0b3IuZ2V0TGluZUhlaWdodEluUGl4ZWxzKClcblxuICAgIHN1cGVyLmV4ZWN1dGUoKVxuXG4gICAgdGhpcy52aW1TdGF0ZS5yZXF1ZXN0U2Nyb2xsKHtcbiAgICAgIGFtb3VudE9mUGl4ZWxzOiB0aGlzLmFtb3VudE9mUGl4ZWxzLFxuICAgICAgZHVyYXRpb246IHRoaXMuZ2V0U21vb3RoU2Nyb2xsRHVhdGlvbigoTWF0aC5hYnMoYW1vdW50T2ZQYWdlKSA9PT0gMSA/IFwiRnVsbFwiIDogXCJIYWxmXCIpICsgXCJTY3JvbGxNb3Rpb25cIiksXG4gICAgfSlcbiAgfVxuXG4gIG1vdmVDdXJzb3IoY3Vyc29yKSB7XG4gICAgY29uc3QgY3Vyc29yUGl4ZWwgPSB0aGlzLmVkaXRvckVsZW1lbnQucGl4ZWxQb3NpdGlvbkZvclNjcmVlblBvc2l0aW9uKGN1cnNvci5nZXRTY3JlZW5Qb3NpdGlvbigpKVxuICAgIGN1cnNvclBpeGVsLnRvcCArPSB0aGlzLmFtb3VudE9mUGl4ZWxzXG4gICAgY29uc3Qgc2NyZWVuUG9zaXRpb24gPSB0aGlzLmVkaXRvckVsZW1lbnQuc2NyZWVuUG9zaXRpb25Gb3JQaXhlbFBvc2l0aW9uKGN1cnNvclBpeGVsKVxuICAgIGNvbnN0IHNjcmVlblJvdyA9IHRoaXMuZ2V0VmFsaWRWaW1TY3JlZW5Sb3coc2NyZWVuUG9zaXRpb24ucm93KVxuICAgIHRoaXMuc2V0Q3Vyc29yQnVmZmVyUm93KGN1cnNvciwgdGhpcy5lZGl0b3IuYnVmZmVyUm93Rm9yU2NyZWVuUm93KHNjcmVlblJvdyksIHthdXRvc2Nyb2xsOiBmYWxzZX0pXG4gIH1cbn1cblxuY2xhc3MgU2Nyb2xsRnVsbFNjcmVlbkRvd24gZXh0ZW5kcyBTY3JvbGwge30gLy8gY3RybC1mXG5jbGFzcyBTY3JvbGxGdWxsU2NyZWVuVXAgZXh0ZW5kcyBTY3JvbGwge30gLy8gY3RybC1iXG5jbGFzcyBTY3JvbGxIYWxmU2NyZWVuRG93biBleHRlbmRzIFNjcm9sbCB7fSAvLyBjdHJsLWRcbmNsYXNzIFNjcm9sbEhhbGZTY3JlZW5VcCBleHRlbmRzIFNjcm9sbCB7fSAvLyBjdHJsLXVcbmNsYXNzIFNjcm9sbFF1YXJ0ZXJTY3JlZW5Eb3duIGV4dGVuZHMgU2Nyb2xsIHt9IC8vIGcgY3RybC1kXG5jbGFzcyBTY3JvbGxRdWFydGVyU2NyZWVuVXAgZXh0ZW5kcyBTY3JvbGwge30gLy8gZyBjdHJsLXVcblxuLy8gRmluZFxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8ga2V5bWFwOiBmXG5jbGFzcyBGaW5kIGV4dGVuZHMgTW90aW9uIHtcbiAgYmFja3dhcmRzID0gZmFsc2VcbiAgaW5jbHVzaXZlID0gdHJ1ZVxuICBvZmZzZXQgPSAwXG4gIHJlcXVpcmVJbnB1dCA9IHRydWVcbiAgY2FzZVNlbnNpdGl2aXR5S2luZCA9IFwiRmluZFwiXG5cbiAgcmVzdG9yZUVkaXRvclN0YXRlKCkge1xuICAgIGlmICh0aGlzLl9yZXN0b3JlRWRpdG9yU3RhdGUpIHRoaXMuX3Jlc3RvcmVFZGl0b3JTdGF0ZSgpXG4gICAgdGhpcy5fcmVzdG9yZUVkaXRvclN0YXRlID0gbnVsbFxuICB9XG5cbiAgY2FuY2VsT3BlcmF0aW9uKCkge1xuICAgIHRoaXMucmVzdG9yZUVkaXRvclN0YXRlKClcbiAgICBzdXBlci5jYW5jZWxPcGVyYXRpb24oKVxuICB9XG5cbiAgaW5pdGlhbGl6ZSgpIHtcbiAgICBpZiAodGhpcy5nZXRDb25maWcoXCJyZXVzZUZpbmRGb3JSZXBlYXRGaW5kXCIpKSB0aGlzLnJlcGVhdElmTmVjZXNzYXJ5KClcblxuICAgIGlmICghdGhpcy5yZXBlYXRlZCkge1xuICAgICAgY29uc3QgY2hhcnNNYXggPSB0aGlzLmdldENvbmZpZyhcImZpbmRDaGFyc01heFwiKVxuICAgICAgY29uc3Qgb3B0aW9uc0Jhc2UgPSB7cHVycG9zZTogXCJmaW5kXCIsIGNoYXJzTWF4fVxuXG4gICAgICBpZiAoY2hhcnNNYXggPT09IDEpIHtcbiAgICAgICAgdGhpcy5mb2N1c0lucHV0KG9wdGlvbnNCYXNlKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fcmVzdG9yZUVkaXRvclN0YXRlID0gdGhpcy51dGlscy5zYXZlRWRpdG9yU3RhdGUodGhpcy5lZGl0b3IpXG4gICAgICAgIGNvbnN0IG9wdGlvbnMgPSB7XG4gICAgICAgICAgYXV0b0NvbmZpcm1UaW1lb3V0OiB0aGlzLmdldENvbmZpZyhcImZpbmRDb25maXJtQnlUaW1lb3V0XCIpLFxuICAgICAgICAgIG9uQ29uZmlybTogaW5wdXQgPT4ge1xuICAgICAgICAgICAgdGhpcy5pbnB1dCA9IGlucHV0XG4gICAgICAgICAgICBpZiAoaW5wdXQpIHRoaXMucHJvY2Vzc09wZXJhdGlvbigpXG4gICAgICAgICAgICBlbHNlIHRoaXMuY2FuY2VsT3BlcmF0aW9uKClcbiAgICAgICAgICB9LFxuICAgICAgICAgIG9uQ2hhbmdlOiBwcmVDb25maXJtZWRDaGFycyA9PiB7XG4gICAgICAgICAgICB0aGlzLnByZUNvbmZpcm1lZENoYXJzID0gcHJlQ29uZmlybWVkQ2hhcnNcbiAgICAgICAgICAgIHRoaXMuaGlnaGxpZ2h0VGV4dEluQ3Vyc29yUm93cyh0aGlzLnByZUNvbmZpcm1lZENoYXJzLCBcInByZS1jb25maXJtXCIsIHRoaXMuaXNCYWNrd2FyZHMoKSlcbiAgICAgICAgICB9LFxuICAgICAgICAgIG9uQ2FuY2VsOiAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnZpbVN0YXRlLmhpZ2hsaWdodEZpbmQuY2xlYXJNYXJrZXJzKClcbiAgICAgICAgICAgIHRoaXMuY2FuY2VsT3BlcmF0aW9uKClcbiAgICAgICAgICB9LFxuICAgICAgICAgIGNvbW1hbmRzOiB7XG4gICAgICAgICAgICBcInZpbS1tb2RlLXBsdXM6ZmluZC1uZXh0LXByZS1jb25maXJtZWRcIjogKCkgPT4gdGhpcy5maW5kUHJlQ29uZmlybWVkKCsxKSxcbiAgICAgICAgICAgIFwidmltLW1vZGUtcGx1czpmaW5kLXByZXZpb3VzLXByZS1jb25maXJtZWRcIjogKCkgPT4gdGhpcy5maW5kUHJlQ29uZmlybWVkKC0xKSxcbiAgICAgICAgICB9LFxuICAgICAgICB9XG4gICAgICAgIHRoaXMuZm9jdXNJbnB1dChPYmplY3QuYXNzaWduKG9wdGlvbnMsIG9wdGlvbnNCYXNlKSlcbiAgICAgIH1cbiAgICB9XG4gICAgc3VwZXIuaW5pdGlhbGl6ZSgpXG4gIH1cblxuICBmaW5kUHJlQ29uZmlybWVkKGRlbHRhKSB7XG4gICAgaWYgKHRoaXMucHJlQ29uZmlybWVkQ2hhcnMgJiYgdGhpcy5nZXRDb25maWcoXCJoaWdobGlnaHRGaW5kQ2hhclwiKSkge1xuICAgICAgY29uc3QgaW5kZXggPSB0aGlzLmhpZ2hsaWdodFRleHRJbkN1cnNvclJvd3MoXG4gICAgICAgIHRoaXMucHJlQ29uZmlybWVkQ2hhcnMsXG4gICAgICAgIFwicHJlLWNvbmZpcm1cIixcbiAgICAgICAgdGhpcy5pc0JhY2t3YXJkcygpLFxuICAgICAgICB0aGlzLmdldENvdW50KC0xKSArIGRlbHRhLFxuICAgICAgICB0cnVlXG4gICAgICApXG4gICAgICB0aGlzLmNvdW50ID0gaW5kZXggKyAxXG4gICAgfVxuICB9XG5cbiAgcmVwZWF0SWZOZWNlc3NhcnkoKSB7XG4gICAgY29uc3QgZmluZENvbW1hbmROYW1lcyA9IFtcIkZpbmRcIiwgXCJGaW5kQmFja3dhcmRzXCIsIFwiVGlsbFwiLCBcIlRpbGxCYWNrd2FyZHNcIl1cbiAgICBjb25zdCBjdXJyZW50RmluZCA9IHRoaXMuZ2xvYmFsU3RhdGUuZ2V0KFwiY3VycmVudEZpbmRcIilcbiAgICBpZiAoY3VycmVudEZpbmQgJiYgZmluZENvbW1hbmROYW1lcy5pbmNsdWRlcyh0aGlzLnZpbVN0YXRlLm9wZXJhdGlvblN0YWNrLmdldExhc3RDb21tYW5kTmFtZSgpKSkge1xuICAgICAgdGhpcy5pbnB1dCA9IGN1cnJlbnRGaW5kLmlucHV0XG4gICAgICB0aGlzLnJlcGVhdGVkID0gdHJ1ZVxuICAgIH1cbiAgfVxuXG4gIGlzQmFja3dhcmRzKCkge1xuICAgIHJldHVybiB0aGlzLmJhY2t3YXJkc1xuICB9XG5cbiAgZXhlY3V0ZSgpIHtcbiAgICBzdXBlci5leGVjdXRlKClcbiAgICBsZXQgZGVjb3JhdGlvblR5cGUgPSBcInBvc3QtY29uZmlybVwiXG4gICAgaWYgKHRoaXMub3BlcmF0b3IgJiYgIXRoaXMub3BlcmF0b3IuaW5zdGFuY2VvZihcIlNlbGVjdEJhc2VcIikpIHtcbiAgICAgIGRlY29yYXRpb25UeXBlICs9IFwiIGxvbmdcIlxuICAgIH1cblxuICAgIC8vIEhBQ0s6IFdoZW4gcmVwZWF0ZWQgYnkgXCIsXCIsIHRoaXMuYmFja3dhcmRzIGlzIHRlbXBvcmFyeSBpbnZlcnRlZCBhbmRcbiAgICAvLyByZXN0b3JlZCBhZnRlciBleGVjdXRpb24gZmluaXNoZWQuXG4gICAgLy8gQnV0IGZpbmFsIGhpZ2hsaWdodFRleHRJbkN1cnNvclJvd3MgaXMgZXhlY3V0ZWQgaW4gYXN5bmMoPWFmdGVyIG9wZXJhdGlvbiBmaW5pc2hlZCkuXG4gICAgLy8gVGh1cyB3ZSBuZWVkIHRvIHByZXNlcnZlIGJlZm9yZSByZXN0b3JlZCBgYmFja3dhcmRzYCB2YWx1ZSBhbmQgcGFzcyBpdC5cbiAgICBjb25zdCBiYWNrd2FyZHMgPSB0aGlzLmlzQmFja3dhcmRzKClcbiAgICB0aGlzLmVkaXRvci5jb21wb25lbnQuZ2V0TmV4dFVwZGF0ZVByb21pc2UoKS50aGVuKCgpID0+IHtcbiAgICAgIHRoaXMuaGlnaGxpZ2h0VGV4dEluQ3Vyc29yUm93cyh0aGlzLmlucHV0LCBkZWNvcmF0aW9uVHlwZSwgYmFja3dhcmRzKVxuICAgIH0pXG4gIH1cblxuICBnZXRQb2ludChmcm9tUG9pbnQpIHtcbiAgICBjb25zdCBzY2FuUmFuZ2UgPSB0aGlzLmVkaXRvci5idWZmZXJSYW5nZUZvckJ1ZmZlclJvdyhmcm9tUG9pbnQucm93KVxuICAgIGNvbnN0IHBvaW50cyA9IFtdXG4gICAgY29uc3QgcmVnZXggPSB0aGlzLmdldFJlZ2V4KHRoaXMuaW5wdXQpXG4gICAgY29uc3QgaW5kZXhXYW50QWNjZXNzID0gdGhpcy5nZXRDb3VudCgtMSlcblxuICAgIGNvbnN0IHRyYW5zbGF0aW9uID0gbmV3IFBvaW50KDAsIHRoaXMuaXNCYWNrd2FyZHMoKSA/IHRoaXMub2Zmc2V0IDogLXRoaXMub2Zmc2V0KVxuICAgIGlmICh0aGlzLnJlcGVhdGVkKSB7XG4gICAgICBmcm9tUG9pbnQgPSBmcm9tUG9pbnQudHJhbnNsYXRlKHRyYW5zbGF0aW9uLm5lZ2F0ZSgpKVxuICAgIH1cblxuICAgIGlmICh0aGlzLmlzQmFja3dhcmRzKCkpIHtcbiAgICAgIGlmICh0aGlzLmdldENvbmZpZyhcImZpbmRBY3Jvc3NMaW5lc1wiKSkgc2NhblJhbmdlLnN0YXJ0ID0gUG9pbnQuWkVST1xuXG4gICAgICB0aGlzLmVkaXRvci5iYWNrd2FyZHNTY2FuSW5CdWZmZXJSYW5nZShyZWdleCwgc2NhblJhbmdlLCAoe3JhbmdlLCBzdG9wfSkgPT4ge1xuICAgICAgICBpZiAocmFuZ2Uuc3RhcnQuaXNMZXNzVGhhbihmcm9tUG9pbnQpKSB7XG4gICAgICAgICAgcG9pbnRzLnB1c2gocmFuZ2Uuc3RhcnQpXG4gICAgICAgICAgaWYgKHBvaW50cy5sZW5ndGggPiBpbmRleFdhbnRBY2Nlc3MpIHN0b3AoKVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAodGhpcy5nZXRDb25maWcoXCJmaW5kQWNyb3NzTGluZXNcIikpIHNjYW5SYW5nZS5lbmQgPSB0aGlzLmVkaXRvci5nZXRFb2ZCdWZmZXJQb3NpdGlvbigpXG5cbiAgICAgIHRoaXMuZWRpdG9yLnNjYW5JbkJ1ZmZlclJhbmdlKHJlZ2V4LCBzY2FuUmFuZ2UsICh7cmFuZ2UsIHN0b3B9KSA9PiB7XG4gICAgICAgIGlmIChyYW5nZS5zdGFydC5pc0dyZWF0ZXJUaGFuKGZyb21Qb2ludCkpIHtcbiAgICAgICAgICBwb2ludHMucHVzaChyYW5nZS5zdGFydClcbiAgICAgICAgICBpZiAocG9pbnRzLmxlbmd0aCA+IGluZGV4V2FudEFjY2Vzcykgc3RvcCgpXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfVxuXG4gICAgY29uc3QgcG9pbnQgPSBwb2ludHNbaW5kZXhXYW50QWNjZXNzXVxuICAgIGlmIChwb2ludCkgcmV0dXJuIHBvaW50LnRyYW5zbGF0ZSh0cmFuc2xhdGlvbilcbiAgfVxuXG4gIC8vIEZJWE1FOiBiYWQgbmFtaW5nLCB0aGlzIGZ1bmN0aW9uIG11c3QgcmV0dXJuIGluZGV4XG4gIGhpZ2hsaWdodFRleHRJbkN1cnNvclJvd3ModGV4dCwgZGVjb3JhdGlvblR5cGUsIGJhY2t3YXJkcywgaW5kZXggPSB0aGlzLmdldENvdW50KC0xKSwgYWRqdXN0SW5kZXggPSBmYWxzZSkge1xuICAgIGlmICghdGhpcy5nZXRDb25maWcoXCJoaWdobGlnaHRGaW5kQ2hhclwiKSkgcmV0dXJuXG5cbiAgICByZXR1cm4gdGhpcy52aW1TdGF0ZS5oaWdobGlnaHRGaW5kLmhpZ2hsaWdodEN1cnNvclJvd3MoXG4gICAgICB0aGlzLmdldFJlZ2V4KHRleHQpLFxuICAgICAgZGVjb3JhdGlvblR5cGUsXG4gICAgICBiYWNrd2FyZHMsXG4gICAgICB0aGlzLm9mZnNldCxcbiAgICAgIGluZGV4LFxuICAgICAgYWRqdXN0SW5kZXhcbiAgICApXG4gIH1cblxuICBtb3ZlQ3Vyc29yKGN1cnNvcikge1xuICAgIGNvbnN0IHBvaW50ID0gdGhpcy5nZXRQb2ludChjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKSlcbiAgICBpZiAocG9pbnQpIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihwb2ludClcbiAgICBlbHNlIHRoaXMucmVzdG9yZUVkaXRvclN0YXRlKClcblxuICAgIGlmICghdGhpcy5yZXBlYXRlZCkgdGhpcy5nbG9iYWxTdGF0ZS5zZXQoXCJjdXJyZW50RmluZFwiLCB0aGlzKVxuICB9XG5cbiAgZ2V0UmVnZXgodGVybSkge1xuICAgIGNvbnN0IG1vZGlmaWVycyA9IHRoaXMuaXNDYXNlU2Vuc2l0aXZlKHRlcm0pID8gXCJnXCIgOiBcImdpXCJcbiAgICByZXR1cm4gbmV3IFJlZ0V4cChfLmVzY2FwZVJlZ0V4cCh0ZXJtKSwgbW9kaWZpZXJzKVxuICB9XG59XG5cbi8vIGtleW1hcDogRlxuY2xhc3MgRmluZEJhY2t3YXJkcyBleHRlbmRzIEZpbmQge1xuICBpbmNsdXNpdmUgPSBmYWxzZVxuICBiYWNrd2FyZHMgPSB0cnVlXG59XG5cbi8vIGtleW1hcDogdFxuY2xhc3MgVGlsbCBleHRlbmRzIEZpbmQge1xuICBvZmZzZXQgPSAxXG4gIGdldFBvaW50KC4uLmFyZ3MpIHtcbiAgICBjb25zdCBwb2ludCA9IHN1cGVyLmdldFBvaW50KC4uLmFyZ3MpXG4gICAgdGhpcy5tb3ZlU3VjY2VlZGVkID0gcG9pbnQgIT0gbnVsbFxuICAgIHJldHVybiBwb2ludFxuICB9XG59XG5cbi8vIGtleW1hcDogVFxuY2xhc3MgVGlsbEJhY2t3YXJkcyBleHRlbmRzIFRpbGwge1xuICBpbmNsdXNpdmUgPSBmYWxzZVxuICBiYWNrd2FyZHMgPSB0cnVlXG59XG5cbi8vIE1hcmtcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIGtleW1hcDogYFxuY2xhc3MgTW92ZVRvTWFyayBleHRlbmRzIE1vdGlvbiB7XG4gIGp1bXAgPSB0cnVlXG4gIHJlcXVpcmVJbnB1dCA9IHRydWVcbiAgaW5wdXQgPSBudWxsXG4gIG1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lID0gZmFsc2VcblxuICBpbml0aWFsaXplKCkge1xuICAgIHRoaXMucmVhZENoYXIoKVxuICAgIHN1cGVyLmluaXRpYWxpemUoKVxuICB9XG5cbiAgbW92ZUN1cnNvcihjdXJzb3IpIHtcbiAgICBsZXQgcG9pbnQgPSB0aGlzLnZpbVN0YXRlLm1hcmsuZ2V0KHRoaXMuaW5wdXQpXG4gICAgaWYgKHBvaW50KSB7XG4gICAgICBpZiAodGhpcy5tb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZSkge1xuICAgICAgICBwb2ludCA9IHRoaXMuZ2V0Rmlyc3RDaGFyYWN0ZXJQb3NpdGlvbkZvckJ1ZmZlclJvdyhwb2ludC5yb3cpXG4gICAgICB9XG4gICAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24ocG9pbnQpXG4gICAgICBjdXJzb3IuYXV0b3Njcm9sbCh7Y2VudGVyOiB0cnVlfSlcbiAgICB9XG4gIH1cbn1cblxuLy8ga2V5bWFwOiAnXG5jbGFzcyBNb3ZlVG9NYXJrTGluZSBleHRlbmRzIE1vdmVUb01hcmsge1xuICB3aXNlID0gXCJsaW5ld2lzZVwiXG4gIG1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lID0gdHJ1ZVxufVxuXG4vLyBGb2xkIG1vdGlvblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgTW92ZVRvUHJldmlvdXNGb2xkU3RhcnQgZXh0ZW5kcyBNb3Rpb24ge1xuICB3aXNlID0gXCJjaGFyYWN0ZXJ3aXNlXCJcbiAgd2hpY2ggPSBcInN0YXJ0XCJcbiAgZGlyZWN0aW9uID0gXCJwcmV2aW91c1wiXG5cbiAgZXhlY3V0ZSgpIHtcbiAgICB0aGlzLnJvd3MgPSB0aGlzLmdldEZvbGRSb3dzKHRoaXMud2hpY2gpXG4gICAgaWYgKHRoaXMuZGlyZWN0aW9uID09PSBcInByZXZpb3VzXCIpIHRoaXMucm93cy5yZXZlcnNlKClcbiAgICBzdXBlci5leGVjdXRlKClcbiAgfVxuXG4gIGdldEZvbGRSb3dzKHdoaWNoKSB7XG4gICAgY29uc3QgdG9Sb3cgPSAoW3N0YXJ0Um93LCBlbmRSb3ddKSA9PiAod2hpY2ggPT09IFwic3RhcnRcIiA/IHN0YXJ0Um93IDogZW5kUm93KVxuICAgIGNvbnN0IHJvd3MgPSB0aGlzLnV0aWxzLmdldENvZGVGb2xkUm93UmFuZ2VzKHRoaXMuZWRpdG9yKS5tYXAodG9Sb3cpXG4gICAgcmV0dXJuIF8uc29ydEJ5KF8udW5pcShyb3dzKSwgcm93ID0+IHJvdylcbiAgfVxuXG4gIGdldFNjYW5Sb3dzKGN1cnNvcikge1xuICAgIGNvbnN0IGN1cnNvclJvdyA9IGN1cnNvci5nZXRCdWZmZXJSb3coKVxuICAgIGNvbnN0IGlzVmFsZCA9IHRoaXMuZGlyZWN0aW9uID09PSBcInByZXZpb3VzXCIgPyByb3cgPT4gcm93IDwgY3Vyc29yUm93IDogcm93ID0+IHJvdyA+IGN1cnNvclJvd1xuICAgIHJldHVybiB0aGlzLnJvd3MuZmlsdGVyKGlzVmFsZClcbiAgfVxuXG4gIGRldGVjdFJvdyhjdXJzb3IpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRTY2FuUm93cyhjdXJzb3IpWzBdXG4gIH1cblxuICBtb3ZlQ3Vyc29yKGN1cnNvcikge1xuICAgIHRoaXMubW92ZUN1cnNvckNvdW50VGltZXMoY3Vyc29yLCAoKSA9PiB7XG4gICAgICBjb25zdCByb3cgPSB0aGlzLmRldGVjdFJvdyhjdXJzb3IpXG4gICAgICBpZiAocm93ICE9IG51bGwpIHRoaXMudXRpbHMubW92ZUN1cnNvclRvRmlyc3RDaGFyYWN0ZXJBdFJvdyhjdXJzb3IsIHJvdylcbiAgICB9KVxuICB9XG59XG5cbmNsYXNzIE1vdmVUb05leHRGb2xkU3RhcnQgZXh0ZW5kcyBNb3ZlVG9QcmV2aW91c0ZvbGRTdGFydCB7XG4gIGRpcmVjdGlvbiA9IFwibmV4dFwiXG59XG5cbmNsYXNzIE1vdmVUb1ByZXZpb3VzRm9sZFN0YXJ0V2l0aFNhbWVJbmRlbnQgZXh0ZW5kcyBNb3ZlVG9QcmV2aW91c0ZvbGRTdGFydCB7XG4gIGRldGVjdFJvdyhjdXJzb3IpIHtcbiAgICBjb25zdCBiYXNlSW5kZW50TGV2ZWwgPSB0aGlzLmVkaXRvci5pbmRlbnRhdGlvbkZvckJ1ZmZlclJvdyhjdXJzb3IuZ2V0QnVmZmVyUm93KCkpXG4gICAgcmV0dXJuIHRoaXMuZ2V0U2NhblJvd3MoY3Vyc29yKS5maW5kKHJvdyA9PiB0aGlzLmVkaXRvci5pbmRlbnRhdGlvbkZvckJ1ZmZlclJvdyhyb3cpID09PSBiYXNlSW5kZW50TGV2ZWwpXG4gIH1cbn1cblxuY2xhc3MgTW92ZVRvTmV4dEZvbGRTdGFydFdpdGhTYW1lSW5kZW50IGV4dGVuZHMgTW92ZVRvUHJldmlvdXNGb2xkU3RhcnRXaXRoU2FtZUluZGVudCB7XG4gIGRpcmVjdGlvbiA9IFwibmV4dFwiXG59XG5cbmNsYXNzIE1vdmVUb1ByZXZpb3VzRm9sZEVuZCBleHRlbmRzIE1vdmVUb1ByZXZpb3VzRm9sZFN0YXJ0IHtcbiAgd2hpY2ggPSBcImVuZFwiXG59XG5cbmNsYXNzIE1vdmVUb05leHRGb2xkRW5kIGV4dGVuZHMgTW92ZVRvUHJldmlvdXNGb2xkRW5kIHtcbiAgZGlyZWN0aW9uID0gXCJuZXh0XCJcbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgTW92ZVRvUHJldmlvdXNGdW5jdGlvbiBleHRlbmRzIE1vdmVUb1ByZXZpb3VzRm9sZFN0YXJ0IHtcbiAgZGlyZWN0aW9uID0gXCJwcmV2aW91c1wiXG4gIGRldGVjdFJvdyhjdXJzb3IpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRTY2FuUm93cyhjdXJzb3IpLmZpbmQocm93ID0+IHRoaXMudXRpbHMuaXNJbmNsdWRlRnVuY3Rpb25TY29wZUZvclJvdyh0aGlzLmVkaXRvciwgcm93KSlcbiAgfVxufVxuXG5jbGFzcyBNb3ZlVG9OZXh0RnVuY3Rpb24gZXh0ZW5kcyBNb3ZlVG9QcmV2aW91c0Z1bmN0aW9uIHtcbiAgZGlyZWN0aW9uID0gXCJuZXh0XCJcbn1cblxuY2xhc3MgTW92ZVRvUHJldmlvdXNGdW5jdGlvbkFuZFJlZHJhd0N1cnNvckxpbmVBdFVwcGVyTWlkZGxlIGV4dGVuZHMgTW92ZVRvUHJldmlvdXNGdW5jdGlvbiB7XG4gIGV4ZWN1dGUoKSB7XG4gICAgc3VwZXIuZXhlY3V0ZSgpXG4gICAgdGhpcy5nZXRJbnN0YW5jZShcIlJlZHJhd0N1cnNvckxpbmVBdFVwcGVyTWlkZGxlXCIpLmV4ZWN1dGUoKVxuICB9XG59XG5cbmNsYXNzIE1vdmVUb05leHRGdW5jdGlvbkFuZFJlZHJhd0N1cnNvckxpbmVBdFVwcGVyTWlkZGxlIGV4dGVuZHMgTW92ZVRvUHJldmlvdXNGdW5jdGlvbkFuZFJlZHJhd0N1cnNvckxpbmVBdFVwcGVyTWlkZGxlIHtcbiAgZGlyZWN0aW9uID0gXCJuZXh0XCJcbn1cblxuLy8gU2NvcGUgYmFzZWRcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIE1vdmVUb1Bvc2l0aW9uQnlTY29wZSBleHRlbmRzIE1vdGlvbiB7XG4gIHN0YXRpYyBjb21tYW5kID0gZmFsc2VcbiAgZGlyZWN0aW9uID0gXCJiYWNrd2FyZFwiXG4gIHNjb3BlID0gXCIuXCJcblxuICBtb3ZlQ3Vyc29yKGN1cnNvcikge1xuICAgIHRoaXMubW92ZUN1cnNvckNvdW50VGltZXMoY3Vyc29yLCAoKSA9PiB7XG4gICAgICBjb25zdCBjdXJzb3JQb3NpdGlvbiA9IGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXG4gICAgICBjb25zdCBwb2ludCA9IHRoaXMudXRpbHMuZGV0ZWN0U2NvcGVTdGFydFBvc2l0aW9uRm9yU2NvcGUodGhpcy5lZGl0b3IsIGN1cnNvclBvc2l0aW9uLCB0aGlzLmRpcmVjdGlvbiwgdGhpcy5zY29wZSlcbiAgICAgIGlmIChwb2ludCkgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHBvaW50KVxuICAgIH0pXG4gIH1cbn1cblxuY2xhc3MgTW92ZVRvUHJldmlvdXNTdHJpbmcgZXh0ZW5kcyBNb3ZlVG9Qb3NpdGlvbkJ5U2NvcGUge1xuICBkaXJlY3Rpb24gPSBcImJhY2t3YXJkXCJcbiAgc2NvcGUgPSBcInN0cmluZy5iZWdpblwiXG59XG5cbmNsYXNzIE1vdmVUb05leHRTdHJpbmcgZXh0ZW5kcyBNb3ZlVG9QcmV2aW91c1N0cmluZyB7XG4gIGRpcmVjdGlvbiA9IFwiZm9yd2FyZFwiXG59XG5cbmNsYXNzIE1vdmVUb1ByZXZpb3VzTnVtYmVyIGV4dGVuZHMgTW92ZVRvUG9zaXRpb25CeVNjb3BlIHtcbiAgZGlyZWN0aW9uID0gXCJiYWNrd2FyZFwiXG4gIHNjb3BlID0gXCJjb25zdGFudC5udW1lcmljXCJcbn1cblxuY2xhc3MgTW92ZVRvTmV4dE51bWJlciBleHRlbmRzIE1vdmVUb1ByZXZpb3VzTnVtYmVyIHtcbiAgZGlyZWN0aW9uID0gXCJmb3J3YXJkXCJcbn1cblxuY2xhc3MgTW92ZVRvTmV4dE9jY3VycmVuY2UgZXh0ZW5kcyBNb3Rpb24ge1xuICAvLyBFbnN1cmUgdGhpcyBjb21tYW5kIGlzIGF2YWlsYWJsZSB3aGVuIG9ubHkgaGFzLW9jY3VycmVuY2VcbiAgc3RhdGljIGNvbW1hbmRTY29wZSA9IFwiYXRvbS10ZXh0LWVkaXRvci52aW0tbW9kZS1wbHVzLmhhcy1vY2N1cnJlbmNlXCJcbiAganVtcCA9IHRydWVcbiAgZGlyZWN0aW9uID0gXCJuZXh0XCJcblxuICBleGVjdXRlKCkge1xuICAgIHRoaXMucmFuZ2VzID0gdGhpcy51dGlscy5zb3J0UmFuZ2VzKHRoaXMub2NjdXJyZW5jZU1hbmFnZXIuZ2V0TWFya2VycygpLm1hcChtYXJrZXIgPT4gbWFya2VyLmdldEJ1ZmZlclJhbmdlKCkpKVxuICAgIHN1cGVyLmV4ZWN1dGUoKVxuICB9XG5cbiAgbW92ZUN1cnNvcihjdXJzb3IpIHtcbiAgICBjb25zdCByYW5nZSA9IHRoaXMucmFuZ2VzW3RoaXMudXRpbHMuZ2V0SW5kZXgodGhpcy5nZXRJbmRleChjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKSksIHRoaXMucmFuZ2VzKV1cbiAgICBjb25zdCBwb2ludCA9IHJhbmdlLnN0YXJ0XG4gICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHBvaW50LCB7YXV0b3Njcm9sbDogZmFsc2V9KVxuXG4gICAgdGhpcy5lZGl0b3IudW5mb2xkQnVmZmVyUm93KHBvaW50LnJvdylcbiAgICBpZiAoY3Vyc29yLmlzTGFzdEN1cnNvcigpKSB7XG4gICAgICB0aGlzLnV0aWxzLnNtYXJ0U2Nyb2xsVG9CdWZmZXJQb3NpdGlvbih0aGlzLmVkaXRvciwgcG9pbnQpXG4gICAgfVxuXG4gICAgaWYgKHRoaXMuZ2V0Q29uZmlnKFwiZmxhc2hPbk1vdmVUb09jY3VycmVuY2VcIikpIHtcbiAgICAgIHRoaXMudmltU3RhdGUuZmxhc2gocmFuZ2UsIHt0eXBlOiBcInNlYXJjaFwifSlcbiAgICB9XG4gIH1cblxuICBnZXRJbmRleChmcm9tUG9pbnQpIHtcbiAgICBjb25zdCBpbmRleCA9IHRoaXMucmFuZ2VzLmZpbmRJbmRleChyYW5nZSA9PiByYW5nZS5zdGFydC5pc0dyZWF0ZXJUaGFuKGZyb21Qb2ludCkpXG4gICAgcmV0dXJuIChpbmRleCA+PSAwID8gaW5kZXggOiAwKSArIHRoaXMuZ2V0Q291bnQoLTEpXG4gIH1cbn1cblxuY2xhc3MgTW92ZVRvUHJldmlvdXNPY2N1cnJlbmNlIGV4dGVuZHMgTW92ZVRvTmV4dE9jY3VycmVuY2Uge1xuICBkaXJlY3Rpb24gPSBcInByZXZpb3VzXCJcblxuICBnZXRJbmRleChmcm9tUG9pbnQpIHtcbiAgICBjb25zdCByYW5nZXMgPSB0aGlzLnJhbmdlcy5zbGljZSgpLnJldmVyc2UoKVxuICAgIGNvbnN0IHJhbmdlID0gcmFuZ2VzLmZpbmQocmFuZ2UgPT4gcmFuZ2UuZW5kLmlzTGVzc1RoYW4oZnJvbVBvaW50KSlcbiAgICBjb25zdCBpbmRleCA9IHJhbmdlID8gdGhpcy5yYW5nZXMuaW5kZXhPZihyYW5nZSkgOiB0aGlzLnJhbmdlcy5sZW5ndGggLSAxXG4gICAgcmV0dXJuIGluZGV4IC0gdGhpcy5nZXRDb3VudCgtMSlcbiAgfVxufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBrZXltYXA6ICVcbmNsYXNzIE1vdmVUb1BhaXIgZXh0ZW5kcyBNb3Rpb24ge1xuICBpbmNsdXNpdmUgPSB0cnVlXG4gIGp1bXAgPSB0cnVlXG4gIG1lbWJlciA9IFtcIlBhcmVudGhlc2lzXCIsIFwiQ3VybHlCcmFja2V0XCIsIFwiU3F1YXJlQnJhY2tldFwiXVxuXG4gIG1vdmVDdXJzb3IoY3Vyc29yKSB7XG4gICAgY29uc3QgcG9pbnQgPSB0aGlzLmdldFBvaW50KGN1cnNvcilcbiAgICBpZiAocG9pbnQpIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihwb2ludClcbiAgfVxuXG4gIGdldFBvaW50Rm9yVGFnKHBvaW50KSB7XG4gICAgY29uc3QgcGFpckluZm8gPSB0aGlzLmdldEluc3RhbmNlKFwiQVRhZ1wiKS5nZXRQYWlySW5mbyhwb2ludClcbiAgICBpZiAoIXBhaXJJbmZvKSByZXR1cm5cblxuICAgIGxldCB7b3BlblJhbmdlLCBjbG9zZVJhbmdlfSA9IHBhaXJJbmZvXG4gICAgb3BlblJhbmdlID0gb3BlblJhbmdlLnRyYW5zbGF0ZShbMCwgKzFdLCBbMCwgLTFdKVxuICAgIGNsb3NlUmFuZ2UgPSBjbG9zZVJhbmdlLnRyYW5zbGF0ZShbMCwgKzFdLCBbMCwgLTFdKVxuICAgIGlmIChvcGVuUmFuZ2UuY29udGFpbnNQb2ludChwb2ludCkgJiYgIXBvaW50LmlzRXF1YWwob3BlblJhbmdlLmVuZCkpIHtcbiAgICAgIHJldHVybiBjbG9zZVJhbmdlLnN0YXJ0XG4gICAgfVxuICAgIGlmIChjbG9zZVJhbmdlLmNvbnRhaW5zUG9pbnQocG9pbnQpICYmICFwb2ludC5pc0VxdWFsKGNsb3NlUmFuZ2UuZW5kKSkge1xuICAgICAgcmV0dXJuIG9wZW5SYW5nZS5zdGFydFxuICAgIH1cbiAgfVxuXG4gIGdldFBvaW50KGN1cnNvcikge1xuICAgIGNvbnN0IGN1cnNvclBvc2l0aW9uID0gY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKClcbiAgICBjb25zdCBjdXJzb3JSb3cgPSBjdXJzb3JQb3NpdGlvbi5yb3dcbiAgICBjb25zdCBwb2ludCA9IHRoaXMuZ2V0UG9pbnRGb3JUYWcoY3Vyc29yUG9zaXRpb24pXG4gICAgaWYgKHBvaW50KSByZXR1cm4gcG9pbnRcblxuICAgIC8vIEFBbnlQYWlyQWxsb3dGb3J3YXJkaW5nIHJldHVybiBmb3J3YXJkaW5nIHJhbmdlIG9yIGVuY2xvc2luZyByYW5nZS5cbiAgICBjb25zdCByYW5nZSA9IHRoaXMuZ2V0SW5zdGFuY2UoXCJBQW55UGFpckFsbG93Rm9yd2FyZGluZ1wiLCB7bWVtYmVyOiB0aGlzLm1lbWJlcn0pLmdldFJhbmdlKGN1cnNvci5zZWxlY3Rpb24pXG4gICAgaWYgKCFyYW5nZSkgcmV0dXJuXG5cbiAgICBjb25zdCB7c3RhcnQsIGVuZH0gPSByYW5nZVxuICAgIGlmIChzdGFydC5yb3cgPT09IGN1cnNvclJvdyAmJiBzdGFydC5pc0dyZWF0ZXJUaGFuT3JFcXVhbChjdXJzb3JQb3NpdGlvbikpIHtcbiAgICAgIC8vIEZvcndhcmRpbmcgcmFuZ2UgZm91bmRcbiAgICAgIHJldHVybiBlbmQudHJhbnNsYXRlKFswLCAtMV0pXG4gICAgfSBlbHNlIGlmIChlbmQucm93ID09PSBjdXJzb3JQb3NpdGlvbi5yb3cpIHtcbiAgICAgIC8vIEVuY2xvc2luZyByYW5nZSB3YXMgcmV0dXJuZWRcbiAgICAgIC8vIFdlIG1vdmUgdG8gc3RhcnQoIG9wZW4tcGFpciApIG9ubHkgd2hlbiBjbG9zZS1wYWlyIHdhcyBhdCBzYW1lIHJvdyBhcyBjdXJzb3Itcm93LlxuICAgICAgcmV0dXJuIHN0YXJ0XG4gICAgfVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBNb3Rpb24sXG4gIEN1cnJlbnRTZWxlY3Rpb24sXG4gIE1vdmVMZWZ0LFxuICBNb3ZlUmlnaHQsXG4gIE1vdmVSaWdodEJ1ZmZlckNvbHVtbixcbiAgTW92ZVVwLFxuICBNb3ZlVXBXcmFwLFxuICBNb3ZlRG93bixcbiAgTW92ZURvd25XcmFwLFxuICBNb3ZlVXBTY3JlZW4sXG4gIE1vdmVEb3duU2NyZWVuLFxuICBNb3ZlVXBUb0VkZ2UsXG4gIE1vdmVEb3duVG9FZGdlLFxuICBXb3JkTW90aW9uLFxuICBNb3ZlVG9OZXh0V29yZCxcbiAgTW92ZVRvTmV4dFdob2xlV29yZCxcbiAgTW92ZVRvTmV4dEFscGhhbnVtZXJpY1dvcmQsXG4gIE1vdmVUb05leHRTbWFydFdvcmQsXG4gIE1vdmVUb05leHRTdWJ3b3JkLFxuICBNb3ZlVG9QcmV2aW91c1dvcmQsXG4gIE1vdmVUb1ByZXZpb3VzV2hvbGVXb3JkLFxuICBNb3ZlVG9QcmV2aW91c0FscGhhbnVtZXJpY1dvcmQsXG4gIE1vdmVUb1ByZXZpb3VzU21hcnRXb3JkLFxuICBNb3ZlVG9QcmV2aW91c1N1YndvcmQsXG4gIE1vdmVUb0VuZE9mV29yZCxcbiAgTW92ZVRvRW5kT2ZXaG9sZVdvcmQsXG4gIE1vdmVUb0VuZE9mQWxwaGFudW1lcmljV29yZCxcbiAgTW92ZVRvRW5kT2ZTbWFydFdvcmQsXG4gIE1vdmVUb0VuZE9mU3Vid29yZCxcbiAgTW92ZVRvUHJldmlvdXNFbmRPZldvcmQsXG4gIE1vdmVUb1ByZXZpb3VzRW5kT2ZXaG9sZVdvcmQsXG4gIE1vdmVUb05leHRTZW50ZW5jZSxcbiAgTW92ZVRvUHJldmlvdXNTZW50ZW5jZSxcbiAgTW92ZVRvTmV4dFNlbnRlbmNlU2tpcEJsYW5rUm93LFxuICBNb3ZlVG9QcmV2aW91c1NlbnRlbmNlU2tpcEJsYW5rUm93LFxuICBNb3ZlVG9OZXh0UGFyYWdyYXBoLFxuICBNb3ZlVG9QcmV2aW91c1BhcmFncmFwaCxcbiAgTW92ZVRvQmVnaW5uaW5nT2ZMaW5lLFxuICBNb3ZlVG9Db2x1bW4sXG4gIE1vdmVUb0xhc3RDaGFyYWN0ZXJPZkxpbmUsXG4gIE1vdmVUb0xhc3ROb25ibGFua0NoYXJhY3Rlck9mTGluZUFuZERvd24sXG4gIE1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lLFxuICBNb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZVVwLFxuICBNb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZURvd24sXG4gIE1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lQW5kRG93bixcbiAgTW92ZVRvU2NyZWVuQ29sdW1uLFxuICBNb3ZlVG9CZWdpbm5pbmdPZlNjcmVlbkxpbmUsXG4gIE1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZTY3JlZW5MaW5lLFxuICBNb3ZlVG9MYXN0Q2hhcmFjdGVyT2ZTY3JlZW5MaW5lLFxuICBNb3ZlVG9GaXJzdExpbmUsXG4gIE1vdmVUb0xhc3RMaW5lLFxuICBNb3ZlVG9MaW5lQnlQZXJjZW50LFxuICBNb3ZlVG9SZWxhdGl2ZUxpbmUsXG4gIE1vdmVUb1JlbGF0aXZlTGluZU1pbmltdW1Ud28sXG4gIE1vdmVUb1RvcE9mU2NyZWVuLFxuICBNb3ZlVG9NaWRkbGVPZlNjcmVlbixcbiAgTW92ZVRvQm90dG9tT2ZTY3JlZW4sXG4gIFNjcm9sbCxcbiAgU2Nyb2xsRnVsbFNjcmVlbkRvd24sXG4gIFNjcm9sbEZ1bGxTY3JlZW5VcCxcbiAgU2Nyb2xsSGFsZlNjcmVlbkRvd24sXG4gIFNjcm9sbEhhbGZTY3JlZW5VcCxcbiAgU2Nyb2xsUXVhcnRlclNjcmVlbkRvd24sXG4gIFNjcm9sbFF1YXJ0ZXJTY3JlZW5VcCxcbiAgRmluZCxcbiAgRmluZEJhY2t3YXJkcyxcbiAgVGlsbCxcbiAgVGlsbEJhY2t3YXJkcyxcbiAgTW92ZVRvTWFyayxcbiAgTW92ZVRvTWFya0xpbmUsXG4gIE1vdmVUb1ByZXZpb3VzRm9sZFN0YXJ0LFxuICBNb3ZlVG9OZXh0Rm9sZFN0YXJ0LFxuICBNb3ZlVG9QcmV2aW91c0ZvbGRTdGFydFdpdGhTYW1lSW5kZW50LFxuICBNb3ZlVG9OZXh0Rm9sZFN0YXJ0V2l0aFNhbWVJbmRlbnQsXG4gIE1vdmVUb1ByZXZpb3VzRm9sZEVuZCxcbiAgTW92ZVRvTmV4dEZvbGRFbmQsXG4gIE1vdmVUb1ByZXZpb3VzRnVuY3Rpb24sXG4gIE1vdmVUb05leHRGdW5jdGlvbixcbiAgTW92ZVRvUHJldmlvdXNGdW5jdGlvbkFuZFJlZHJhd0N1cnNvckxpbmVBdFVwcGVyTWlkZGxlLFxuICBNb3ZlVG9OZXh0RnVuY3Rpb25BbmRSZWRyYXdDdXJzb3JMaW5lQXRVcHBlck1pZGRsZSxcbiAgTW92ZVRvUG9zaXRpb25CeVNjb3BlLFxuICBNb3ZlVG9QcmV2aW91c1N0cmluZyxcbiAgTW92ZVRvTmV4dFN0cmluZyxcbiAgTW92ZVRvUHJldmlvdXNOdW1iZXIsXG4gIE1vdmVUb05leHROdW1iZXIsXG4gIE1vdmVUb05leHRPY2N1cnJlbmNlLFxuICBNb3ZlVG9QcmV2aW91c09jY3VycmVuY2UsXG4gIE1vdmVUb1BhaXIsXG59XG4iXX0=