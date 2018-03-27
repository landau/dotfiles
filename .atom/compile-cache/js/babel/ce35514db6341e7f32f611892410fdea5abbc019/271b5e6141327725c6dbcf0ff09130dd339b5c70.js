"use babel";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x3, _x4, _x5) { var _again = true; _function: while (_again) { var object = _x3, property = _x4, receiver = _x5; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x3 = parent; _x4 = property; _x5 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

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
        row = this.wrap && row < min ? max : this.limitNumber(row, { min: min });
      } else {
        row = this.getFoldEndRowForRow(row) + 1;
        row = this.wrap && row > max ? min : this.limitNumber(row, { max: max });
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
      this.utils.setBufferColumn(cursor, this.getCount() - 1);
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
      var row = this.getValidVimBufferRow(cursor.getBufferRow() + this.getCount() - 1);
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
      var row = this.limitNumber(cursor.getBufferRow() + this.getCount() - 1, { max: this.getVimLastBufferRow() });
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
      return _get(Object.getPrototypeOf(MoveToFirstCharacterOfLineAndDown.prototype), "getCount", this).call(this) - 1;
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
      return this.getCount() - 1;
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
      var percent = this.limitNumber(this.getCount(), { max: 100 });
      return Math.floor(this.getVimLastBufferRow() * (percent / 100));
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
      return this.limitNumber(_get(Object.getPrototypeOf(MoveToRelativeLineMinimumTwo.prototype), "getCount", this).call(this), { min: 2 });
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
      var firstVisibleRow = this.editor.getFirstVisibleScreenRow();
      var lastVisibleRow = this.limitNumber(this.editor.getLastVisibleScreenRow(), { max: this.getVimLastScreenRow() });

      var baseOffset = 2;
      if (this.name === "MoveToTopOfScreen") {
        var offset = firstVisibleRow === 0 ? 0 : baseOffset;
        var count = this.getCount() - 1;
        return this.limitNumber(firstVisibleRow + count, { min: firstVisibleRow + offset, max: lastVisibleRow });
      } else if (this.name === "MoveToMiddleOfScreen") {
        return firstVisibleRow + Math.floor((lastVisibleRow - firstVisibleRow) / 2);
      } else if (this.name === "MoveToBottomOfScreen") {
        var offset = lastVisibleRow === this.getVimLastScreenRow() ? 0 : baseOffset + 1;
        var count = this.getCount() - 1;
        return this.limitNumber(lastVisibleRow - count, { min: firstVisibleRow, max: lastVisibleRow - offset });
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
        var index = this.highlightTextInCursorRows(this.preConfirmedChars, "pre-confirm", this.isBackwards(), this.getCount() - 1 + delta, true);
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
      var indexWantAccess = this.getCount() - 1;

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
      var index = arguments.length <= 3 || arguments[3] === undefined ? this.getCount() - 1 : arguments[3];
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
      return new RegExp(this._.escapeRegExp(term), modifiers);
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
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
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
      var foldRanges = this.utils.getCodeFoldRowRanges(this.editor);
      return foldRanges.map(function (rowRange) {
        return rowRange[which === "start" ? 0 : 1];
      }).sort(function (a, b) {
        return a - b;
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
      return (index >= 0 ? index : 0) + this.getCount() - 1;
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
      return index - (this.getCount() - 1);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL21vdGlvbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxXQUFXLENBQUE7Ozs7Ozs7Ozs7ZUFFWSxPQUFPLENBQUMsTUFBTSxDQUFDOztJQUEvQixLQUFLLFlBQUwsS0FBSztJQUFFLEtBQUssWUFBTCxLQUFLOztBQUVuQixJQUFNLElBQUksR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUE7O0lBRXhCLE1BQU07WUFBTixNQUFNOztXQUFOLE1BQU07MEJBQU4sTUFBTTs7K0JBQU4sTUFBTTs7U0FJVixRQUFRLEdBQUcsSUFBSTtTQUNmLFNBQVMsR0FBRyxLQUFLO1NBQ2pCLElBQUksR0FBRyxlQUFlO1NBQ3RCLElBQUksR0FBRyxLQUFLO1NBQ1osY0FBYyxHQUFHLEtBQUs7U0FDdEIsYUFBYSxHQUFHLElBQUk7U0FDcEIscUJBQXFCLEdBQUcsS0FBSztTQUM3QixlQUFlLEdBQUcsS0FBSztTQUN2QixZQUFZLEdBQUcsS0FBSztTQUNwQixtQkFBbUIsR0FBRyxJQUFJOzs7OztlQWJ0QixNQUFNOztXQWVILG1CQUFHO0FBQ1IsYUFBTyxDQUFDLElBQUksQ0FBQyxZQUFZLElBQUksSUFBSSxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUE7S0FDaEQ7OztXQUVTLHNCQUFHO0FBQ1gsYUFBTyxJQUFJLENBQUMsSUFBSSxLQUFLLFVBQVUsQ0FBQTtLQUNoQzs7O1dBRVUsdUJBQUc7QUFDWixhQUFPLElBQUksQ0FBQyxJQUFJLEtBQUssV0FBVyxDQUFBO0tBQ2pDOzs7V0FFUSxtQkFBQyxJQUFJLEVBQUU7QUFDZCxVQUFJLElBQUksS0FBSyxlQUFlLEVBQUU7QUFDNUIsWUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsSUFBSSxLQUFLLFVBQVUsR0FBRyxLQUFLLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFBO09BQ3BFO0FBQ0QsVUFBSSxD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QUFpQyxFQUFqQyxpQ0FBaUM7QUFDakMsdUJBQXFCLEVBQXJCLHFCQUFxQjtBQUNyQixtQkFBaUIsRUFBakIsaUJBQWlCO0FBQ2pCLHdCQUFzQixFQUF0QixzQkFBc0I7QUFDdEIsb0JBQWtCLEVBQWxCLGtCQUFrQjtBQUNsQix3REFBc0QsRUFBdEQsc0RBQXNEO0FBQ3RELG9EQUFrRCxFQUFsRCxrREFBa0Q7QUFDbEQsdUJBQXFCLEVBQXJCLHFCQUFxQjtBQUNyQixzQkFBb0IsRUFBcEIsb0JBQW9CO0FBQ3BCLGtCQUFnQixFQUFoQixnQkFBZ0I7QUFDaEIsc0JBQW9CLEVBQXBCLG9CQUFvQjtBQUNwQixrQkFBZ0IsRUFBaEIsZ0JBQWdCO0FBQ2hCLHNCQUFvQixFQUFwQixvQkFBb0I7QUFDcEIsMEJBQXdCLEVBQXhCLHdCQUF3QjtBQUN4QixZQUFVLEVBQVYsVUFBVTtDQUNYLENBQUEiLCJmaWxlIjoiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvbW90aW9uLmpzIiwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2UgYmFiZWxcIlxuXG5jb25zdCB7UG9pbnQsIFJhbmdlfSA9IHJlcXVpcmUoXCJhdG9tXCIpXG5cbmNvbnN0IEJhc2UgPSByZXF1aXJlKFwiLi9iYXNlXCIpXG5cbmNsYXNzIE1vdGlvbiBleHRlbmRzIEJhc2Uge1xuICBzdGF0aWMgb3BlcmF0aW9uS2luZCA9IFwibW90aW9uXCJcbiAgc3RhdGljIGNvbW1hbmQgPSBmYWxzZVxuXG4gIG9wZXJhdG9yID0gbnVsbFxuICBpbmNsdXNpdmUgPSBmYWxzZVxuICB3aXNlID0gXCJjaGFyYWN0ZXJ3aXNlXCJcbiAganVtcCA9IGZhbHNlXG4gIHZlcnRpY2FsTW90aW9uID0gZmFsc2VcbiAgbW92ZVN1Y2NlZWRlZCA9IG51bGxcbiAgbW92ZVN1Y2Nlc3NPbkxpbmV3aXNlID0gZmFsc2VcbiAgc2VsZWN0U3VjY2VlZGVkID0gZmFsc2VcbiAgcmVxdWlyZUlucHV0ID0gZmFsc2VcbiAgY2FzZVNlbnNpdGl2aXR5S2luZCA9IG51bGxcblxuICBpc1JlYWR5KCkge1xuICAgIHJldHVybiAhdGhpcy5yZXF1aXJlSW5wdXQgfHwgdGhpcy5pbnB1dCAhPSBudWxsXG4gIH1cblxuICBpc0xpbmV3aXNlKCkge1xuICAgIHJldHVybiB0aGlzLndpc2UgPT09IFwibGluZXdpc2VcIlxuICB9XG5cbiAgaXNCbG9ja3dpc2UoKSB7XG4gICAgcmV0dXJuIHRoaXMud2lzZSA9PT0gXCJibG9ja3dpc2VcIlxuICB9XG5cbiAgZm9yY2VXaXNlKHdpc2UpIHtcbiAgICBpZiAod2lzZSA9PT0gXCJjaGFyYWN0ZXJ3aXNlXCIpIHtcbiAgICAgIHRoaXMuaW5jbHVzaXZlID0gdGhpcy53aXNlID09PSBcImxpbmV3aXNlXCIgPyBmYWxzZSA6ICF0aGlzLmluY2x1c2l2ZVxuICAgIH1cbiAgICB0aGlzLndpc2UgPSB3aXNlXG4gIH1cblxuICByZXNldFN0YXRlKCkge1xuICAgIHRoaXMuc2VsZWN0U3VjY2VlZGVkID0gZmFsc2VcbiAgfVxuXG4gIG1vdmVXaXRoU2F2ZUp1bXAoY3Vyc29yKSB7XG4gICAgY29uc3Qgb3JpZ2luYWxQb3NpdGlvbiA9IHRoaXMuanVtcCAmJiBjdXJzb3IuaXNMYXN0Q3Vyc29yKCkgPyBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKSA6IHVuZGVmaW5lZFxuXG4gICAgdGhpcy5tb3ZlQ3Vyc29yKGN1cnNvcilcblxuICAgIGlmIChvcmlnaW5hbFBvc2l0aW9uICYmICFjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKS5pc0VxdWFsKG9yaWdpbmFsUG9zaXRpb24pKSB7XG4gICAgICB0aGlzLnZpbVN0YXRlLm1hcmsuc2V0KFwiYFwiLCBvcmlnaW5hbFBvc2l0aW9uKVxuICAgICAgdGhpcy52aW1TdGF0ZS5tYXJrLnNldChcIidcIiwgb3JpZ2luYWxQb3NpdGlvbilcbiAgICB9XG4gIH1cblxuICBleGVjdXRlKCkge1xuICAgIGlmICh0aGlzLm9wZXJhdG9yKSB7XG4gICAgICB0aGlzLnNlbGVjdCgpXG4gICAgfSBlbHNlIHtcbiAgICAgIGZvciAoY29uc3QgY3Vyc29yIG9mIHRoaXMuZWRpdG9yLmdldEN1cnNvcnMoKSkge1xuICAgICAgICB0aGlzLm1vdmVXaXRoU2F2ZUp1bXAoY3Vyc29yKVxuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLmVkaXRvci5tZXJnZUN1cnNvcnMoKVxuICAgIHRoaXMuZWRpdG9yLm1lcmdlSW50ZXJzZWN0aW5nU2VsZWN0aW9ucygpXG4gIH1cblxuICAvLyBOT1RFOiBzZWxlY3Rpb24gaXMgYWxyZWFkeSBcIm5vcm1hbGl6ZWRcIiBiZWZvcmUgdGhpcyBmdW5jdGlvbiBpcyBjYWxsZWQuXG4gIHNlbGVjdCgpIHtcbiAgICAvLyBuZWVkIHRvIGNhcmUgd2FzIHZpc3VhbCBmb3IgYC5gIHJlcGVhdGVkLlxuICAgIGNvbnN0IGlzT3JXYXNWaXN1YWwgPSB0aGlzLm9wZXJhdG9yLmluc3RhbmNlb2YoXCJTZWxlY3RCYXNlXCIpIHx8IHRoaXMubmFtZSA9PT0gXCJDdXJyZW50U2VsZWN0aW9uXCJcblxuICAgIGZvciAoY29uc3Qgc2VsZWN0aW9uIG9mIHRoaXMuZWRpdG9yLmdldFNlbGVjdGlvbnMoKSkge1xuICAgICAgc2VsZWN0aW9uLm1vZGlmeVNlbGVjdGlvbigoKSA9PiB0aGlzLm1vdmVXaXRoU2F2ZUp1bXAoc2VsZWN0aW9uLmN1cnNvcikpXG5cbiAgICAgIGNvbnN0IHNlbGVjdFN1Y2NlZWRlZCA9XG4gICAgICAgIHRoaXMubW92ZVN1Y2NlZWRlZCAhPSBudWxsXG4gICAgICAgICAgPyB0aGlzLm1vdmVTdWNjZWVkZWRcbiAgICAgICAgICA6ICFzZWxlY3Rpb24uaXNFbXB0eSgpIHx8ICh0aGlzLmlzTGluZXdpc2UoKSAmJiB0aGlzLm1vdmVTdWNjZXNzT25MaW5ld2lzZSlcbiAgICAgIGlmICghdGhpcy5zZWxlY3RTdWNjZWVkZWQpIHRoaXMuc2VsZWN0U3VjY2VlZGVkID0gc2VsZWN0U3VjY2VlZGVkXG5cbiAgICAgIGlmIChpc09yV2FzVmlzdWFsIHx8IChzZWxlY3RTdWNjZWVkZWQgJiYgKHRoaXMuaW5jbHVzaXZlIHx8IHRoaXMuaXNMaW5ld2lzZSgpKSkpIHtcbiAgICAgICAgY29uc3QgJHNlbGVjdGlvbiA9IHRoaXMuc3dyYXAoc2VsZWN0aW9uKVxuICAgICAgICAkc2VsZWN0aW9uLnNhdmVQcm9wZXJ0aWVzKHRydWUpIC8vIHNhdmUgcHJvcGVydHkgb2YgXCJhbHJlYWR5LW5vcm1hbGl6ZWQtc2VsZWN0aW9uXCJcbiAgICAgICAgJHNlbGVjdGlvbi5hcHBseVdpc2UodGhpcy53aXNlKVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0aGlzLndpc2UgPT09IFwiYmxvY2t3aXNlXCIpIHtcbiAgICAgIHRoaXMudmltU3RhdGUuZ2V0TGFzdEJsb2Nrd2lzZVNlbGVjdGlvbigpLmF1dG9zY3JvbGwoKVxuICAgIH1cbiAgfVxuXG4gIHNldEN1cnNvckJ1ZmZlclJvdyhjdXJzb3IsIHJvdywgb3B0aW9ucykge1xuICAgIGlmICh0aGlzLnZlcnRpY2FsTW90aW9uICYmICF0aGlzLmdldENvbmZpZyhcInN0YXlPblZlcnRpY2FsTW90aW9uXCIpKSB7XG4gICAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24odGhpcy5nZXRGaXJzdENoYXJhY3RlclBvc2l0aW9uRm9yQnVmZmVyUm93KHJvdyksIG9wdGlvbnMpXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMudXRpbHMuc2V0QnVmZmVyUm93KGN1cnNvciwgcm93LCBvcHRpb25zKVxuICAgIH1cbiAgfVxuXG4gIC8vIENhbGwgY2FsbGJhY2sgY291bnQgdGltZXMuXG4gIC8vIEJ1dCBicmVhayBpdGVyYXRpb24gd2hlbiBjdXJzb3IgcG9zaXRpb24gZGlkIG5vdCBjaGFuZ2UgYmVmb3JlL2FmdGVyIGNhbGxiYWNrLlxuICBtb3ZlQ3Vyc29yQ291bnRUaW1lcyhjdXJzb3IsIGZuKSB7XG4gICAgbGV0IG9sZFBvc2l0aW9uID0gY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKClcbiAgICB0aGlzLmNvdW50VGltZXModGhpcy5nZXRDb3VudCgpLCBzdGF0ZSA9PiB7XG4gICAgICBmbihzdGF0ZSlcbiAgICAgIGNvbnN0IG5ld1Bvc2l0aW9uID0gY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKClcbiAgICAgIGlmIChuZXdQb3NpdGlvbi5pc0VxdWFsKG9sZFBvc2l0aW9uKSkgc3RhdGUuc3RvcCgpXG4gICAgICBvbGRQb3NpdGlvbiA9IG5ld1Bvc2l0aW9uXG4gICAgfSlcbiAgfVxuXG4gIGlzQ2FzZVNlbnNpdGl2ZSh0ZXJtKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0Q29uZmlnKGB1c2VTbWFydGNhc2VGb3Ike3RoaXMuY2FzZVNlbnNpdGl2aXR5S2luZH1gKVxuICAgICAgPyB0ZXJtLnNlYXJjaCgvW0EtWl0vKSAhPT0gLTFcbiAgICAgIDogIXRoaXMuZ2V0Q29uZmlnKGBpZ25vcmVDYXNlRm9yJHt0aGlzLmNhc2VTZW5zaXRpdml0eUtpbmR9YClcbiAgfVxuXG4gIGdldEZpcnN0T3JMYXN0UG9pbnQoZGlyZWN0aW9uKSB7XG4gICAgcmV0dXJuIGRpcmVjdGlvbiA9PT0gXCJuZXh0XCIgPyB0aGlzLmdldFZpbUVvZkJ1ZmZlclBvc2l0aW9uKCkgOiBuZXcgUG9pbnQoMCwgMClcbiAgfVxufVxuXG4vLyBVc2VkIGFzIG9wZXJhdG9yJ3MgdGFyZ2V0IGluIHZpc3VhbC1tb2RlLlxuY2xhc3MgQ3VycmVudFNlbGVjdGlvbiBleHRlbmRzIE1vdGlvbiB7XG4gIHN0YXRpYyBjb21tYW5kID0gZmFsc2VcbiAgc2VsZWN0aW9uRXh0ZW50ID0gbnVsbFxuICBibG9ja3dpc2VTZWxlY3Rpb25FeHRlbnQgPSBudWxsXG4gIGluY2x1c2l2ZSA9IHRydWVcbiAgcG9pbnRJbmZvQnlDdXJzb3IgPSBuZXcgTWFwKClcblxuICBtb3ZlQ3Vyc29yKGN1cnNvcikge1xuICAgIGlmICh0aGlzLm1vZGUgPT09IFwidmlzdWFsXCIpIHtcbiAgICAgIHRoaXMuc2VsZWN0aW9uRXh0ZW50ID0gdGhpcy5pc0Jsb2Nrd2lzZSgpXG4gICAgICAgID8gdGhpcy5zd3JhcChjdXJzb3Iuc2VsZWN0aW9uKS5nZXRCbG9ja3dpc2VTZWxlY3Rpb25FeHRlbnQoKVxuICAgICAgICA6IHRoaXMuZWRpdG9yLmdldFNlbGVjdGVkQnVmZmVyUmFuZ2UoKS5nZXRFeHRlbnQoKVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBgLmAgcmVwZWF0IGNhc2VcbiAgICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKS50cmFuc2xhdGUodGhpcy5zZWxlY3Rpb25FeHRlbnQpKVxuICAgIH1cbiAgfVxuXG4gIHNlbGVjdCgpIHtcbiAgICBpZiAodGhpcy5tb2RlID09PSBcInZpc3VhbFwiKSB7XG4gICAgICBzdXBlci5zZWxlY3QoKVxuICAgIH0gZWxzZSB7XG4gICAgICBmb3IgKGNvbnN0IGN1cnNvciBvZiB0aGlzLmVkaXRvci5nZXRDdXJzb3JzKCkpIHtcbiAgICAgICAgY29uc3QgcG9pbnRJbmZvID0gdGhpcy5wb2ludEluZm9CeUN1cnNvci5nZXQoY3Vyc29yKVxuICAgICAgICBpZiAocG9pbnRJbmZvKSB7XG4gICAgICAgICAgY29uc3Qge2N1cnNvclBvc2l0aW9uLCBzdGFydE9mU2VsZWN0aW9ufSA9IHBvaW50SW5mb1xuICAgICAgICAgIGlmIChjdXJzb3JQb3NpdGlvbi5pc0VxdWFsKGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpKSkge1xuICAgICAgICAgICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHN0YXJ0T2ZTZWxlY3Rpb24pXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBzdXBlci5zZWxlY3QoKVxuICAgIH1cblxuICAgIC8vICogUHVycG9zZSBvZiBwb2ludEluZm9CeUN1cnNvcj8gc2VlICMyMzUgZm9yIGRldGFpbC5cbiAgICAvLyBXaGVuIHN0YXlPblRyYW5zZm9ybVN0cmluZyBpcyBlbmFibGVkLCBjdXJzb3IgcG9zIGlzIG5vdCBzZXQgb24gc3RhcnQgb2ZcbiAgICAvLyBvZiBzZWxlY3RlZCByYW5nZS5cbiAgICAvLyBCdXQgSSB3YW50IGZvbGxvd2luZyBiZWhhdmlvciwgc28gbmVlZCB0byBwcmVzZXJ2ZSBwb3NpdGlvbiBpbmZvLlxuICAgIC8vICAxLiBgdmo+LmAgLT4gaW5kZW50IHNhbWUgdHdvIHJvd3MgcmVnYXJkbGVzcyBvZiBjdXJyZW50IGN1cnNvcidzIHJvdy5cbiAgICAvLyAgMi4gYHZqPmouYCAtPiBpbmRlbnQgdHdvIHJvd3MgZnJvbSBjdXJzb3IncyByb3cuXG4gICAgZm9yIChjb25zdCBjdXJzb3Igb2YgdGhpcy5lZGl0b3IuZ2V0Q3Vyc29ycygpKSB7XG4gICAgICBjb25zdCBzdGFydE9mU2VsZWN0aW9uID0gY3Vyc29yLnNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpLnN0YXJ0XG4gICAgICB0aGlzLm9uRGlkRmluaXNoT3BlcmF0aW9uKCgpID0+IHtcbiAgICAgICAgY3Vyc29yUG9zaXRpb24gPSBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuICAgICAgICB0aGlzLnBvaW50SW5mb0J5Q3Vyc29yLnNldChjdXJzb3IsIHtzdGFydE9mU2VsZWN0aW9uLCBjdXJzb3JQb3NpdGlvbn0pXG4gICAgICB9KVxuICAgIH1cbiAgfVxufVxuXG5jbGFzcyBNb3ZlTGVmdCBleHRlbmRzIE1vdGlvbiB7XG4gIG1vdmVDdXJzb3IoY3Vyc29yKSB7XG4gICAgY29uc3QgYWxsb3dXcmFwID0gdGhpcy5nZXRDb25maWcoXCJ3cmFwTGVmdFJpZ2h0TW90aW9uXCIpXG4gICAgdGhpcy5tb3ZlQ3Vyc29yQ291bnRUaW1lcyhjdXJzb3IsICgpID0+IHRoaXMudXRpbHMubW92ZUN1cnNvckxlZnQoY3Vyc29yLCB7YWxsb3dXcmFwfSkpXG4gIH1cbn1cblxuY2xhc3MgTW92ZVJpZ2h0IGV4dGVuZHMgTW90aW9uIHtcbiAgbW92ZUN1cnNvcihjdXJzb3IpIHtcbiAgICBjb25zdCBhbGxvd1dyYXAgPSB0aGlzLmdldENvbmZpZyhcIndyYXBMZWZ0UmlnaHRNb3Rpb25cIilcblxuICAgIHRoaXMubW92ZUN1cnNvckNvdW50VGltZXMoY3Vyc29yLCAoKSA9PiB7XG4gICAgICB0aGlzLmVkaXRvci51bmZvbGRCdWZmZXJSb3coY3Vyc29yLmdldEJ1ZmZlclJvdygpKVxuXG4gICAgICAvLyAtIFdoZW4gYHdyYXBMZWZ0UmlnaHRNb3Rpb25gIGVuYWJsZWQgYW5kIGV4ZWN1dGVkIGFzIHB1cmUtbW90aW9uIGluIGBub3JtYWwtbW9kZWAsXG4gICAgICAvLyAgIHdlIG5lZWQgdG8gbW92ZSAqKmFnYWluKiogdG8gd3JhcCB0byBuZXh0LWxpbmUgaWYgaXQgcmFjaGVkIHRvIEVPTC5cbiAgICAgIC8vIC0gRXhwcmVzc2lvbiBgIXRoaXMub3BlcmF0b3JgIG1lYW5zIG5vcm1hbC1tb2RlIG1vdGlvbi5cbiAgICAgIC8vIC0gRXhwcmVzc2lvbiBgdGhpcy5tb2RlID09PSBcIm5vcm1hbFwiYCBpcyBub3QgYXBwcm9wcmVhdGUgc2luY2UgaXQgbWF0Y2hlcyBgeGAgb3BlcmF0b3IncyB0YXJnZXQgY2FzZS5cbiAgICAgIGNvbnN0IG5lZWRNb3ZlQWdhaW4gPSBhbGxvd1dyYXAgJiYgIXRoaXMub3BlcmF0b3IgJiYgIWN1cnNvci5pc0F0RW5kT2ZMaW5lKClcblxuICAgICAgdGhpcy51dGlscy5tb3ZlQ3Vyc29yUmlnaHQoY3Vyc29yLCB7YWxsb3dXcmFwfSlcblxuICAgICAgaWYgKG5lZWRNb3ZlQWdhaW4gJiYgY3Vyc29yLmlzQXRFbmRPZkxpbmUoKSkge1xuICAgICAgICB0aGlzLnV0aWxzLm1vdmVDdXJzb3JSaWdodChjdXJzb3IsIHthbGxvd1dyYXB9KVxuICAgICAgfVxuICAgIH0pXG4gIH1cbn1cblxuY2xhc3MgTW92ZVJpZ2h0QnVmZmVyQ29sdW1uIGV4dGVuZHMgTW90aW9uIHtcbiAgc3RhdGljIGNvbW1hbmQgPSBmYWxzZVxuICBtb3ZlQ3Vyc29yKGN1cnNvcikge1xuICAgIHRoaXMudXRpbHMuc2V0QnVmZmVyQ29sdW1uKGN1cnNvciwgY3Vyc29yLmdldEJ1ZmZlckNvbHVtbigpICsgdGhpcy5nZXRDb3VudCgpKVxuICB9XG59XG5cbmNsYXNzIE1vdmVVcCBleHRlbmRzIE1vdGlvbiB7XG4gIHdpc2UgPSBcImxpbmV3aXNlXCJcbiAgd3JhcCA9IGZhbHNlXG4gIGRpcmVjdGlvbiA9IFwidXBcIlxuXG4gIGdldEJ1ZmZlclJvdyhyb3cpIHtcbiAgICBjb25zdCBtaW4gPSAwXG4gICAgY29uc3QgbWF4ID0gdGhpcy5nZXRWaW1MYXN0QnVmZmVyUm93KClcblxuICAgIGlmICh0aGlzLmRpcmVjdGlvbiA9PT0gXCJ1cFwiKSB7XG4gICAgICByb3cgPSB0aGlzLmdldEZvbGRTdGFydFJvd0ZvclJvdyhyb3cpIC0gMVxuICAgICAgcm93ID0gdGhpcy53cmFwICYmIHJvdyA8IG1pbiA/IG1heCA6IHRoaXMubGltaXROdW1iZXIocm93LCB7bWlufSlcbiAgICB9IGVsc2Uge1xuICAgICAgcm93ID0gdGhpcy5nZXRGb2xkRW5kUm93Rm9yUm93KHJvdykgKyAxXG4gICAgICByb3cgPSB0aGlzLndyYXAgJiYgcm93ID4gbWF4ID8gbWluIDogdGhpcy5saW1pdE51bWJlcihyb3csIHttYXh9KVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy5nZXRGb2xkU3RhcnRSb3dGb3JSb3cocm93KVxuICB9XG5cbiAgbW92ZUN1cnNvcihjdXJzb3IpIHtcbiAgICB0aGlzLm1vdmVDdXJzb3JDb3VudFRpbWVzKGN1cnNvciwgKCkgPT4gdGhpcy51dGlscy5zZXRCdWZmZXJSb3coY3Vyc29yLCB0aGlzLmdldEJ1ZmZlclJvdyhjdXJzb3IuZ2V0QnVmZmVyUm93KCkpKSlcbiAgfVxufVxuXG5jbGFzcyBNb3ZlVXBXcmFwIGV4dGVuZHMgTW92ZVVwIHtcbiAgd3JhcCA9IHRydWVcbn1cblxuY2xhc3MgTW92ZURvd24gZXh0ZW5kcyBNb3ZlVXAge1xuICBkaXJlY3Rpb24gPSBcImRvd25cIlxufVxuXG5jbGFzcyBNb3ZlRG93bldyYXAgZXh0ZW5kcyBNb3ZlRG93biB7XG4gIHdyYXAgPSB0cnVlXG59XG5cbmNsYXNzIE1vdmVVcFNjcmVlbiBleHRlbmRzIE1vdGlvbiB7XG4gIHdpc2UgPSBcImxpbmV3aXNlXCJcbiAgZGlyZWN0aW9uID0gXCJ1cFwiXG4gIG1vdmVDdXJzb3IoY3Vyc29yKSB7XG4gICAgdGhpcy5tb3ZlQ3Vyc29yQ291bnRUaW1lcyhjdXJzb3IsICgpID0+IHRoaXMudXRpbHMubW92ZUN1cnNvclVwU2NyZWVuKGN1cnNvcikpXG4gIH1cbn1cblxuY2xhc3MgTW92ZURvd25TY3JlZW4gZXh0ZW5kcyBNb3ZlVXBTY3JlZW4ge1xuICB3aXNlID0gXCJsaW5ld2lzZVwiXG4gIGRpcmVjdGlvbiA9IFwiZG93blwiXG4gIG1vdmVDdXJzb3IoY3Vyc29yKSB7XG4gICAgdGhpcy5tb3ZlQ3Vyc29yQ291bnRUaW1lcyhjdXJzb3IsICgpID0+IHRoaXMudXRpbHMubW92ZUN1cnNvckRvd25TY3JlZW4oY3Vyc29yKSlcbiAgfVxufVxuXG5jbGFzcyBNb3ZlVXBUb0VkZ2UgZXh0ZW5kcyBNb3Rpb24ge1xuICB3aXNlID0gXCJsaW5ld2lzZVwiXG4gIGp1bXAgPSB0cnVlXG4gIGRpcmVjdGlvbiA9IFwicHJldmlvdXNcIlxuICBtb3ZlQ3Vyc29yKGN1cnNvcikge1xuICAgIHRoaXMubW92ZUN1cnNvckNvdW50VGltZXMoY3Vyc29yLCAoKSA9PiB7XG4gICAgICBjb25zdCBwb2ludCA9IHRoaXMuZ2V0UG9pbnQoY3Vyc29yLmdldFNjcmVlblBvc2l0aW9uKCkpXG4gICAgICBpZiAocG9pbnQpIGN1cnNvci5zZXRTY3JlZW5Qb3NpdGlvbihwb2ludClcbiAgICB9KVxuICB9XG5cbiAgZ2V0UG9pbnQoZnJvbVBvaW50KSB7XG4gICAgY29uc3Qge2NvbHVtbiwgcm93OiBzdGFydFJvd30gPSBmcm9tUG9pbnRcbiAgICBmb3IgKGNvbnN0IHJvdyBvZiB0aGlzLmdldFNjcmVlblJvd3Moe3N0YXJ0Um93LCBkaXJlY3Rpb246IHRoaXMuZGlyZWN0aW9ufSkpIHtcbiAgICAgIGNvbnN0IHBvaW50ID0gbmV3IFBvaW50KHJvdywgY29sdW1uKVxuICAgICAgaWYgKHRoaXMuaXNFZGdlKHBvaW50KSkgcmV0dXJuIHBvaW50XG4gICAgfVxuICB9XG5cbiAgaXNFZGdlKHBvaW50KSB7XG4gICAgLy8gSWYgcG9pbnQgaXMgc3RvcHBhYmxlIGFuZCBhYm92ZSBvciBiZWxvdyBwb2ludCBpcyBub3Qgc3RvcHBhYmxlLCBpdCdzIEVkZ2UhXG4gICAgcmV0dXJuIChcbiAgICAgIHRoaXMuaXNTdG9wcGFibGUocG9pbnQpICYmXG4gICAgICAoIXRoaXMuaXNTdG9wcGFibGUocG9pbnQudHJhbnNsYXRlKFstMSwgMF0pKSB8fCAhdGhpcy5pc1N0b3BwYWJsZShwb2ludC50cmFuc2xhdGUoWysxLCAwXSkpKVxuICAgIClcbiAgfVxuXG4gIGlzU3RvcHBhYmxlKHBvaW50KSB7XG4gICAgcmV0dXJuIChcbiAgICAgIHRoaXMuaXNOb25XaGl0ZVNwYWNlKHBvaW50KSB8fFxuICAgICAgdGhpcy5pc0ZpcnN0Um93T3JMYXN0Um93QW5kU3RvcHBhYmxlKHBvaW50KSB8fFxuICAgICAgLy8gSWYgcmlnaHQgb3IgbGVmdCBjb2x1bW4gaXMgbm9uLXdoaXRlLXNwYWNlIGNoYXIsIGl0J3Mgc3RvcHBhYmxlLlxuICAgICAgKHRoaXMuaXNOb25XaGl0ZVNwYWNlKHBvaW50LnRyYW5zbGF0ZShbMCwgLTFdKSkgJiYgdGhpcy5pc05vbldoaXRlU3BhY2UocG9pbnQudHJhbnNsYXRlKFswLCArMV0pKSlcbiAgICApXG4gIH1cblxuICBpc05vbldoaXRlU3BhY2UocG9pbnQpIHtcbiAgICBjb25zdCBjaGFyID0gdGhpcy51dGlscy5nZXRUZXh0SW5TY3JlZW5SYW5nZSh0aGlzLmVkaXRvciwgUmFuZ2UuZnJvbVBvaW50V2l0aERlbHRhKHBvaW50LCAwLCAxKSlcbiAgICByZXR1cm4gY2hhciAhPSBudWxsICYmIC9cXFMvLnRlc3QoY2hhcilcbiAgfVxuXG4gIGlzRmlyc3RSb3dPckxhc3RSb3dBbmRTdG9wcGFibGUocG9pbnQpIHtcbiAgICAvLyBJbiBub3RtYWwtbW9kZSwgY3Vyc29yIGlzIE5PVCBzdG9wcGFibGUgdG8gRU9MIG9mIG5vbi1ibGFuayByb3cuXG4gICAgLy8gU28gZXhwbGljaXRseSBndWFyZCB0byBub3QgYW5zd2VyIGl0IHN0b3BwYWJsZS5cbiAgICBpZiAodGhpcy5tb2RlID09PSBcIm5vcm1hbFwiICYmIHRoaXMudXRpbHMucG9pbnRJc0F0RW5kT2ZMaW5lQXROb25FbXB0eVJvdyh0aGlzLmVkaXRvciwgcG9pbnQpKSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cbiAgICAvLyBJZiBjbGlwcGVkLCBpdCBtZWFucyB0aGF0IG9yaWdpbmFsIHBvbml0IHdhcyBub24gc3RvcHBhYmxlKGUuZy4gcG9pbnQuY29sdW0gPiBFT0wpLlxuICAgIGNvbnN0IHtyb3d9ID0gcG9pbnRcbiAgICByZXR1cm4gKHJvdyA9PT0gMCB8fCByb3cgPT09IHRoaXMuZ2V0VmltTGFzdFNjcmVlblJvdygpKSAmJiBwb2ludC5pc0VxdWFsKHRoaXMuZWRpdG9yLmNsaXBTY3JlZW5Qb3NpdGlvbihwb2ludCkpXG4gIH1cbn1cblxuY2xhc3MgTW92ZURvd25Ub0VkZ2UgZXh0ZW5kcyBNb3ZlVXBUb0VkZ2Uge1xuICBkaXJlY3Rpb24gPSBcIm5leHRcIlxufVxuXG4vLyBXb3JkIE1vdGlvbiBmYW1pbHlcbi8vICstLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tK1xuLy8gfCBkaXJlY3Rpb24gfCB3aGljaCAgICAgIHwgd29yZCAgfCBXT1JEIHwgc3Vid29yZCB8IHNtYXJ0d29yZCB8IGFscGhhbnVtZXJpYyB8XG4vLyB8LS0tLS0tLS0tLS0rLS0tLS0tLS0tLS0tKy0tLS0tLS0rLS0tLS0tKy0tLS0tLS0tLSstLS0tLS0tLS0tLSstLS0tLS0tLS0tLS0tLStcbi8vIHwgbmV4dCAgICAgIHwgd29yZC1zdGFydCB8IHcgICAgIHwgVyAgICB8IC0gICAgICAgfCAtICAgICAgICAgfCAtICAgICAgICAgICAgfFxuLy8gfCBwcmV2aW91cyAgfCB3b3JkLXN0YXJ0IHwgYiAgICAgfCBiICAgIHwgLSAgICAgICB8IC0gICAgICAgICB8IC0gICAgICAgICAgICB8XG4vLyB8IG5leHQgICAgICB8IHdvcmQtZW5kICAgfCBlICAgICB8IEUgICAgfCAtICAgICAgIHwgLSAgICAgICAgIHwgLSAgICAgICAgICAgIHxcbi8vIHwgcHJldmlvdXMgIHwgd29yZC1lbmQgICB8IGdlICAgIHwgZyBFICB8IG4vYSAgICAgfCBuL2EgICAgICAgfCBuL2EgICAgICAgICAgfFxuLy8gKy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0rXG5cbmNsYXNzIFdvcmRNb3Rpb24gZXh0ZW5kcyBNb3Rpb24ge1xuICBzdGF0aWMgY29tbWFuZCA9IGZhbHNlXG4gIHdvcmRSZWdleCA9IG51bGxcbiAgc2tpcEJsYW5rUm93ID0gZmFsc2VcbiAgc2tpcFdoaXRlU3BhY2VPbmx5Um93ID0gZmFsc2VcblxuICBtb3ZlQ3Vyc29yKGN1cnNvcikge1xuICAgIHRoaXMubW92ZUN1cnNvckNvdW50VGltZXMoY3Vyc29yLCBjb3VudFN0YXRlID0+IHtcbiAgICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbih0aGlzLmdldFBvaW50KGN1cnNvciwgY291bnRTdGF0ZSkpXG4gICAgfSlcbiAgfVxuXG4gIGdldFBvaW50KGN1cnNvciwgY291bnRTdGF0ZSkge1xuICAgIGNvbnN0IHtkaXJlY3Rpb259ID0gdGhpc1xuICAgIGxldCB7d2hpY2h9ID0gdGhpc1xuICAgIGNvbnN0IHJlZ2V4ID0gdGhpcy5uYW1lLmVuZHNXaXRoKFwiU3Vid29yZFwiKSA/IGN1cnNvci5zdWJ3b3JkUmVnRXhwKCkgOiB0aGlzLndvcmRSZWdleCB8fCBjdXJzb3Iud29yZFJlZ0V4cCgpXG5cbiAgICBjb25zdCBvcHRpb25zID0gdGhpcy5idWlsZE9wdGlvbnMoY3Vyc29yKVxuICAgIGlmIChkaXJlY3Rpb24gPT09IFwibmV4dFwiICYmIHdoaWNoID09PSBcInN0YXJ0XCIgJiYgdGhpcy5vcGVyYXRvciAmJiBjb3VudFN0YXRlLmlzRmluYWwpIHtcbiAgICAgIC8vIFtOT1RFXSBFeGNlcHRpb25hbCBiZWhhdmlvciBmb3IgdyBhbmQgVzogW0RldGFpbCBpbiB2aW0gaGVscCBgOmhlbHAgd2AuXVxuICAgICAgLy8gW2Nhc2UtQV0gY3csIGNXIHRyZWF0ZWQgYXMgY2UsIGNFIHdoZW4gY3Vyc29yIGlzIGF0IG5vbi1ibGFuay5cbiAgICAgIC8vIFtjYXNlLUJdIHdoZW4gdywgVyB1c2VkIGFzIFRBUkdFVCwgaXQgZG9lc24ndCBtb3ZlIG92ZXIgbmV3IGxpbmUuXG4gICAgICBjb25zdCB7ZnJvbX0gPSBvcHRpb25zXG4gICAgICBpZiAodGhpcy5pc0VtcHR5Um93KGZyb20ucm93KSkgcmV0dXJuIFtmcm9tLnJvdyArIDEsIDBdXG5cbiAgICAgIC8vIFtjYXNlLUFdXG4gICAgICBpZiAodGhpcy5vcGVyYXRvci5uYW1lID09PSBcIkNoYW5nZVwiICYmICF0aGlzLnV0aWxzLnBvaW50SXNBdFdoaXRlU3BhY2UodGhpcy5lZGl0b3IsIGZyb20pKSB7XG4gICAgICAgIHdoaWNoID0gXCJlbmRcIlxuICAgICAgfVxuICAgICAgY29uc3QgcG9pbnQgPSB0aGlzLmZpbmRQb2ludChkaXJlY3Rpb24sIHJlZ2V4LCB3aGljaCwgb3B0aW9ucylcbiAgICAgIC8vIFtjYXNlLUJdXG4gICAgICByZXR1cm4gcG9pbnQgPyBQb2ludC5taW4ocG9pbnQsIFtmcm9tLnJvdywgSW5maW5pdHldKSA6IHRoaXMuZ2V0Rmlyc3RPckxhc3RQb2ludChkaXJlY3Rpb24pXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLmZpbmRQb2ludChkaXJlY3Rpb24sIHJlZ2V4LCB3aGljaCwgb3B0aW9ucykgfHwgdGhpcy5nZXRGaXJzdE9yTGFzdFBvaW50KGRpcmVjdGlvbilcbiAgICB9XG4gIH1cblxuICBidWlsZE9wdGlvbnMoY3Vyc29yKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGZyb206IGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpLFxuICAgICAgc2tpcEVtcHR5Um93OiB0aGlzLnNraXBFbXB0eVJvdyxcbiAgICAgIHNraXBXaGl0ZVNwYWNlT25seVJvdzogdGhpcy5za2lwV2hpdGVTcGFjZU9ubHlSb3csXG4gICAgICBwcmVUcmFuc2xhdGU6ICh0aGlzLndoaWNoID09PSBcImVuZFwiICYmIFswLCArMV0pIHx8IHVuZGVmaW5lZCxcbiAgICAgIHBvc3RUcmFuc2xhdGU6ICh0aGlzLndoaWNoID09PSBcImVuZFwiICYmIFswLCAtMV0pIHx8IHVuZGVmaW5lZCxcbiAgICB9XG4gIH1cbn1cblxuLy8gd1xuY2xhc3MgTW92ZVRvTmV4dFdvcmQgZXh0ZW5kcyBXb3JkTW90aW9uIHtcbiAgZGlyZWN0aW9uID0gXCJuZXh0XCJcbiAgd2hpY2ggPSBcInN0YXJ0XCJcbn1cblxuLy8gV1xuY2xhc3MgTW92ZVRvTmV4dFdob2xlV29yZCBleHRlbmRzIE1vdmVUb05leHRXb3JkIHtcbiAgd29yZFJlZ2V4ID0gL14kfFxcUysvZ1xufVxuXG4vLyBuby1rZXltYXBcbmNsYXNzIE1vdmVUb05leHRTdWJ3b3JkIGV4dGVuZHMgTW92ZVRvTmV4dFdvcmQge31cblxuLy8gbm8ta2V5bWFwXG5jbGFzcyBNb3ZlVG9OZXh0U21hcnRXb3JkIGV4dGVuZHMgTW92ZVRvTmV4dFdvcmQge1xuICB3b3JkUmVnZXggPSAvW1xcdy1dKy9nXG59XG5cbi8vIG5vLWtleW1hcFxuY2xhc3MgTW92ZVRvTmV4dEFscGhhbnVtZXJpY1dvcmQgZXh0ZW5kcyBNb3ZlVG9OZXh0V29yZCB7XG4gIHdvcmRSZWdleCA9IC9cXHcrL2dcbn1cblxuLy8gYlxuY2xhc3MgTW92ZVRvUHJldmlvdXNXb3JkIGV4dGVuZHMgV29yZE1vdGlvbiB7XG4gIGRpcmVjdGlvbiA9IFwicHJldmlvdXNcIlxuICB3aGljaCA9IFwic3RhcnRcIlxuICBza2lwV2hpdGVTcGFjZU9ubHlSb3cgPSB0cnVlXG59XG5cbi8vIEJcbmNsYXNzIE1vdmVUb1ByZXZpb3VzV2hvbGVXb3JkIGV4dGVuZHMgTW92ZVRvUHJldmlvdXNXb3JkIHtcbiAgd29yZFJlZ2V4ID0gL14kfFxcUysvZ1xufVxuXG4vLyBuby1rZXltYXBcbmNsYXNzIE1vdmVUb1ByZXZpb3VzU3Vid29yZCBleHRlbmRzIE1vdmVUb1ByZXZpb3VzV29yZCB7fVxuXG4vLyBuby1rZXltYXBcbmNsYXNzIE1vdmVUb1ByZXZpb3VzU21hcnRXb3JkIGV4dGVuZHMgTW92ZVRvUHJldmlvdXNXb3JkIHtcbiAgd29yZFJlZ2V4ID0gL1tcXHctXSsvXG59XG5cbi8vIG5vLWtleW1hcFxuY2xhc3MgTW92ZVRvUHJldmlvdXNBbHBoYW51bWVyaWNXb3JkIGV4dGVuZHMgTW92ZVRvUHJldmlvdXNXb3JkIHtcbiAgd29yZFJlZ2V4ID0gL1xcdysvXG59XG5cbi8vIGVcbmNsYXNzIE1vdmVUb0VuZE9mV29yZCBleHRlbmRzIFdvcmRNb3Rpb24ge1xuICBpbmNsdXNpdmUgPSB0cnVlXG4gIGRpcmVjdGlvbiA9IFwibmV4dFwiXG4gIHdoaWNoID0gXCJlbmRcIlxuICBza2lwRW1wdHlSb3cgPSB0cnVlXG4gIHNraXBXaGl0ZVNwYWNlT25seVJvdyA9IHRydWVcbn1cblxuLy8gRVxuY2xhc3MgTW92ZVRvRW5kT2ZXaG9sZVdvcmQgZXh0ZW5kcyBNb3ZlVG9FbmRPZldvcmQge1xuICB3b3JkUmVnZXggPSAvXFxTKy9nXG59XG5cbi8vIG5vLWtleW1hcFxuY2xhc3MgTW92ZVRvRW5kT2ZTdWJ3b3JkIGV4dGVuZHMgTW92ZVRvRW5kT2ZXb3JkIHt9XG5cbi8vIG5vLWtleW1hcFxuY2xhc3MgTW92ZVRvRW5kT2ZTbWFydFdvcmQgZXh0ZW5kcyBNb3ZlVG9FbmRPZldvcmQge1xuICB3b3JkUmVnZXggPSAvW1xcdy1dKy9nXG59XG5cbi8vIG5vLWtleW1hcFxuY2xhc3MgTW92ZVRvRW5kT2ZBbHBoYW51bWVyaWNXb3JkIGV4dGVuZHMgTW92ZVRvRW5kT2ZXb3JkIHtcbiAgd29yZFJlZ2V4ID0gL1xcdysvZ1xufVxuXG4vLyBnZVxuY2xhc3MgTW92ZVRvUHJldmlvdXNFbmRPZldvcmQgZXh0ZW5kcyBXb3JkTW90aW9uIHtcbiAgaW5jbHVzaXZlID0gdHJ1ZVxuICBkaXJlY3Rpb24gPSBcInByZXZpb3VzXCJcbiAgd2hpY2ggPSBcImVuZFwiXG4gIHNraXBXaGl0ZVNwYWNlT25seVJvdyA9IHRydWVcbn1cblxuLy8gZ0VcbmNsYXNzIE1vdmVUb1ByZXZpb3VzRW5kT2ZXaG9sZVdvcmQgZXh0ZW5kcyBNb3ZlVG9QcmV2aW91c0VuZE9mV29yZCB7XG4gIHdvcmRSZWdleCA9IC9cXFMrL2dcbn1cblxuLy8gU2VudGVuY2Vcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFNlbnRlbmNlIGlzIGRlZmluZWQgYXMgYmVsb3dcbi8vICAtIGVuZCB3aXRoIFsnLicsICchJywgJz8nXVxuLy8gIC0gb3B0aW9uYWxseSBmb2xsb3dlZCBieSBbJyknLCAnXScsICdcIicsIFwiJ1wiXVxuLy8gIC0gZm9sbG93ZWQgYnkgWyckJywgJyAnLCAnXFx0J11cbi8vICAtIHBhcmFncmFwaCBib3VuZGFyeSBpcyBhbHNvIHNlbnRlbmNlIGJvdW5kYXJ5XG4vLyAgLSBzZWN0aW9uIGJvdW5kYXJ5IGlzIGFsc28gc2VudGVuY2UgYm91bmRhcnkoaWdub3JlKVxuY2xhc3MgTW92ZVRvTmV4dFNlbnRlbmNlIGV4dGVuZHMgTW90aW9uIHtcbiAganVtcCA9IHRydWVcbiAgc2VudGVuY2VSZWdleCA9IG5ldyBSZWdFeHAoYCg/OltcXFxcLiFcXFxcP11bXFxcXClcXFxcXVwiJ10qXFxcXHMrKXwoXFxcXG58XFxcXHJcXFxcbilgLCBcImdcIilcbiAgZGlyZWN0aW9uID0gXCJuZXh0XCJcblxuICBtb3ZlQ3Vyc29yKGN1cnNvcikge1xuICAgIHRoaXMubW92ZUN1cnNvckNvdW50VGltZXMoY3Vyc29yLCAoKSA9PiB7XG4gICAgICBjb25zdCBwb2ludCA9XG4gICAgICAgIHRoaXMuZGlyZWN0aW9uID09PSBcIm5leHRcIlxuICAgICAgICAgID8gdGhpcy5nZXROZXh0U3RhcnRPZlNlbnRlbmNlKGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpKVxuICAgICAgICAgIDogdGhpcy5nZXRQcmV2aW91c1N0YXJ0T2ZTZW50ZW5jZShjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKSlcbiAgICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihwb2ludCB8fCB0aGlzLmdldEZpcnN0T3JMYXN0UG9pbnQodGhpcy5kaXJlY3Rpb24pKVxuICAgIH0pXG4gIH1cblxuICBpc0JsYW5rUm93KHJvdykge1xuICAgIHJldHVybiB0aGlzLmVkaXRvci5pc0J1ZmZlclJvd0JsYW5rKHJvdylcbiAgfVxuXG4gIGdldE5leHRTdGFydE9mU2VudGVuY2UoZnJvbSkge1xuICAgIHJldHVybiB0aGlzLmZpbmRJbkVkaXRvcihcImZvcndhcmRcIiwgdGhpcy5zZW50ZW5jZVJlZ2V4LCB7ZnJvbX0sICh7cmFuZ2UsIG1hdGNofSkgPT4ge1xuICAgICAgaWYgKG1hdGNoWzFdICE9IG51bGwpIHtcbiAgICAgICAgY29uc3QgW3N0YXJ0Um93LCBlbmRSb3ddID0gW3JhbmdlLnN0YXJ0LnJvdywgcmFuZ2UuZW5kLnJvd11cbiAgICAgICAgaWYgKHRoaXMuc2tpcEJsYW5rUm93ICYmIHRoaXMuaXNCbGFua1JvdyhlbmRSb3cpKSByZXR1cm5cbiAgICAgICAgaWYgKHRoaXMuaXNCbGFua1JvdyhzdGFydFJvdykgIT09IHRoaXMuaXNCbGFua1JvdyhlbmRSb3cpKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0Rmlyc3RDaGFyYWN0ZXJQb3NpdGlvbkZvckJ1ZmZlclJvdyhlbmRSb3cpXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiByYW5nZS5lbmRcbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgZ2V0UHJldmlvdXNTdGFydE9mU2VudGVuY2UoZnJvbSkge1xuICAgIHJldHVybiB0aGlzLmZpbmRJbkVkaXRvcihcImJhY2t3YXJkXCIsIHRoaXMuc2VudGVuY2VSZWdleCwge2Zyb219LCAoe3JhbmdlLCBtYXRjaH0pID0+IHtcbiAgICAgIGlmIChtYXRjaFsxXSAhPSBudWxsKSB7XG4gICAgICAgIGNvbnN0IFtzdGFydFJvdywgZW5kUm93XSA9IFtyYW5nZS5zdGFydC5yb3csIHJhbmdlLmVuZC5yb3ddXG4gICAgICAgIGlmICghdGhpcy5pc0JsYW5rUm93KGVuZFJvdykgJiYgdGhpcy5pc0JsYW5rUm93KHN0YXJ0Um93KSkge1xuICAgICAgICAgIGNvbnN0IHBvaW50ID0gdGhpcy5nZXRGaXJzdENoYXJhY3RlclBvc2l0aW9uRm9yQnVmZmVyUm93KGVuZFJvdylcbiAgICAgICAgICBpZiAocG9pbnQuaXNMZXNzVGhhbihmcm9tKSkgcmV0dXJuIHBvaW50XG4gICAgICAgICAgZWxzZSBpZiAoIXRoaXMuc2tpcEJsYW5rUm93KSByZXR1cm4gdGhpcy5nZXRGaXJzdENoYXJhY3RlclBvc2l0aW9uRm9yQnVmZmVyUm93KHN0YXJ0Um93KVxuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKHJhbmdlLmVuZC5pc0xlc3NUaGFuKGZyb20pKSB7XG4gICAgICAgIHJldHVybiByYW5nZS5lbmRcbiAgICAgIH1cbiAgICB9KVxuICB9XG59XG5cbmNsYXNzIE1vdmVUb1ByZXZpb3VzU2VudGVuY2UgZXh0ZW5kcyBNb3ZlVG9OZXh0U2VudGVuY2Uge1xuICBkaXJlY3Rpb24gPSBcInByZXZpb3VzXCJcbn1cblxuY2xhc3MgTW92ZVRvTmV4dFNlbnRlbmNlU2tpcEJsYW5rUm93IGV4dGVuZHMgTW92ZVRvTmV4dFNlbnRlbmNlIHtcbiAgc2tpcEJsYW5rUm93ID0gdHJ1ZVxufVxuXG5jbGFzcyBNb3ZlVG9QcmV2aW91c1NlbnRlbmNlU2tpcEJsYW5rUm93IGV4dGVuZHMgTW92ZVRvUHJldmlvdXNTZW50ZW5jZSB7XG4gIHNraXBCbGFua1JvdyA9IHRydWVcbn1cblxuLy8gUGFyYWdyYXBoXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBNb3ZlVG9OZXh0UGFyYWdyYXBoIGV4dGVuZHMgTW90aW9uIHtcbiAganVtcCA9IHRydWVcbiAgZGlyZWN0aW9uID0gXCJuZXh0XCJcblxuICBtb3ZlQ3Vyc29yKGN1cnNvcikge1xuICAgIHRoaXMubW92ZUN1cnNvckNvdW50VGltZXMoY3Vyc29yLCAoKSA9PiB7XG4gICAgICBjb25zdCBwb2ludCA9IHRoaXMuZ2V0UG9pbnQoY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKCkpXG4gICAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24ocG9pbnQgfHwgdGhpcy5nZXRGaXJzdE9yTGFzdFBvaW50KHRoaXMuZGlyZWN0aW9uKSlcbiAgICB9KVxuICB9XG5cbiAgZ2V0UG9pbnQoZnJvbSkge1xuICAgIGxldCB3YXNCbGFua1JvdyA9IHRoaXMuZWRpdG9yLmlzQnVmZmVyUm93QmxhbmsoZnJvbS5yb3cpXG4gICAgcmV0dXJuIHRoaXMuZmluZEluRWRpdG9yKHRoaXMuZGlyZWN0aW9uLCAvXi9nLCB7ZnJvbX0sICh7cmFuZ2V9KSA9PiB7XG4gICAgICBjb25zdCBpc0JsYW5rUm93ID0gdGhpcy5lZGl0b3IuaXNCdWZmZXJSb3dCbGFuayhyYW5nZS5zdGFydC5yb3cpXG4gICAgICBpZiAoIXdhc0JsYW5rUm93ICYmIGlzQmxhbmtSb3cpIHtcbiAgICAgICAgcmV0dXJuIHJhbmdlLnN0YXJ0XG4gICAgICB9XG4gICAgICB3YXNCbGFua1JvdyA9IGlzQmxhbmtSb3dcbiAgICB9KVxuICB9XG59XG5cbmNsYXNzIE1vdmVUb1ByZXZpb3VzUGFyYWdyYXBoIGV4dGVuZHMgTW92ZVRvTmV4dFBhcmFncmFwaCB7XG4gIGRpcmVjdGlvbiA9IFwicHJldmlvdXNcIlxufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBrZXltYXA6IDBcbmNsYXNzIE1vdmVUb0JlZ2lubmluZ09mTGluZSBleHRlbmRzIE1vdGlvbiB7XG4gIG1vdmVDdXJzb3IoY3Vyc29yKSB7XG4gICAgdGhpcy51dGlscy5zZXRCdWZmZXJDb2x1bW4oY3Vyc29yLCAwKVxuICB9XG59XG5cbmNsYXNzIE1vdmVUb0NvbHVtbiBleHRlbmRzIE1vdGlvbiB7XG4gIG1vdmVDdXJzb3IoY3Vyc29yKSB7XG4gICAgdGhpcy51dGlscy5zZXRCdWZmZXJDb2x1bW4oY3Vyc29yLCB0aGlzLmdldENvdW50KCkgLSAxKVxuICB9XG59XG5cbmNsYXNzIE1vdmVUb0xhc3RDaGFyYWN0ZXJPZkxpbmUgZXh0ZW5kcyBNb3Rpb24ge1xuICBtb3ZlQ3Vyc29yKGN1cnNvcikge1xuICAgIGNvbnN0IHJvdyA9IHRoaXMuZ2V0VmFsaWRWaW1CdWZmZXJSb3coY3Vyc29yLmdldEJ1ZmZlclJvdygpICsgdGhpcy5nZXRDb3VudCgpIC0gMSlcbiAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24oW3JvdywgSW5maW5pdHldKVxuICAgIGN1cnNvci5nb2FsQ29sdW1uID0gSW5maW5pdHlcbiAgfVxufVxuXG5jbGFzcyBNb3ZlVG9MYXN0Tm9uYmxhbmtDaGFyYWN0ZXJPZkxpbmVBbmREb3duIGV4dGVuZHMgTW90aW9uIHtcbiAgaW5jbHVzaXZlID0gdHJ1ZVxuXG4gIG1vdmVDdXJzb3IoY3Vyc29yKSB7XG4gICAgY29uc3Qgcm93ID0gdGhpcy5saW1pdE51bWJlcihjdXJzb3IuZ2V0QnVmZmVyUm93KCkgKyB0aGlzLmdldENvdW50KCkgLSAxLCB7bWF4OiB0aGlzLmdldFZpbUxhc3RCdWZmZXJSb3coKX0pXG4gICAgY29uc3Qgb3B0aW9ucyA9IHtmcm9tOiBbcm93LCBJbmZpbml0eV0sIGFsbG93TmV4dExpbmU6IGZhbHNlfVxuICAgIGNvbnN0IHBvaW50ID0gdGhpcy5maW5kSW5FZGl0b3IoXCJiYWNrd2FyZFwiLCAvXFxTfF4vLCBvcHRpb25zLCBldmVudCA9PiBldmVudC5yYW5nZS5zdGFydClcbiAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24ocG9pbnQpXG4gIH1cbn1cblxuLy8gTW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmUgZmFpbWlseVxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBeXG5jbGFzcyBNb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZSBleHRlbmRzIE1vdGlvbiB7XG4gIG1vdmVDdXJzb3IoY3Vyc29yKSB7XG4gICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHRoaXMuZ2V0Rmlyc3RDaGFyYWN0ZXJQb3NpdGlvbkZvckJ1ZmZlclJvdyhjdXJzb3IuZ2V0QnVmZmVyUm93KCkpKVxuICB9XG59XG5cbmNsYXNzIE1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lVXAgZXh0ZW5kcyBNb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZSB7XG4gIHdpc2UgPSBcImxpbmV3aXNlXCJcbiAgbW92ZUN1cnNvcihjdXJzb3IpIHtcbiAgICB0aGlzLm1vdmVDdXJzb3JDb3VudFRpbWVzKGN1cnNvciwgKCkgPT4ge1xuICAgICAgY29uc3Qgcm93ID0gdGhpcy5nZXRWYWxpZFZpbUJ1ZmZlclJvdyhjdXJzb3IuZ2V0QnVmZmVyUm93KCkgLSAxKVxuICAgICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKFtyb3csIDBdKVxuICAgIH0pXG4gICAgc3VwZXIubW92ZUN1cnNvcihjdXJzb3IpXG4gIH1cbn1cblxuY2xhc3MgTW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmVEb3duIGV4dGVuZHMgTW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmUge1xuICB3aXNlID0gXCJsaW5ld2lzZVwiXG4gIG1vdmVDdXJzb3IoY3Vyc29yKSB7XG4gICAgdGhpcy5tb3ZlQ3Vyc29yQ291bnRUaW1lcyhjdXJzb3IsICgpID0+IHtcbiAgICAgIGNvbnN0IHBvaW50ID0gY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKClcbiAgICAgIGlmIChwb2ludC5yb3cgPCB0aGlzLmdldFZpbUxhc3RCdWZmZXJSb3coKSkge1xuICAgICAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24ocG9pbnQudHJhbnNsYXRlKFsrMSwgMF0pKVxuICAgICAgfVxuICAgIH0pXG4gICAgc3VwZXIubW92ZUN1cnNvcihjdXJzb3IpXG4gIH1cbn1cblxuY2xhc3MgTW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmVBbmREb3duIGV4dGVuZHMgTW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmVEb3duIHtcbiAgZ2V0Q291bnQoKSB7XG4gICAgcmV0dXJuIHN1cGVyLmdldENvdW50KCkgLSAxXG4gIH1cbn1cblxuY2xhc3MgTW92ZVRvU2NyZWVuQ29sdW1uIGV4dGVuZHMgTW90aW9uIHtcbiAgc3RhdGljIGNvbW1hbmQgPSBmYWxzZVxuICBtb3ZlQ3Vyc29yKGN1cnNvcikge1xuICAgIGNvbnN0IGFsbG93T2ZmU2NyZWVuUG9zaXRpb24gPSB0aGlzLmdldENvbmZpZyhcImFsbG93TW92ZVRvT2ZmU2NyZWVuQ29sdW1uT25TY3JlZW5MaW5lTW90aW9uXCIpXG4gICAgY29uc3QgcG9pbnQgPSB0aGlzLnV0aWxzLmdldFNjcmVlblBvc2l0aW9uRm9yU2NyZWVuUm93KHRoaXMuZWRpdG9yLCBjdXJzb3IuZ2V0U2NyZWVuUm93KCksIHRoaXMud2hpY2gsIHtcbiAgICAgIGFsbG93T2ZmU2NyZWVuUG9zaXRpb24sXG4gICAgfSlcbiAgICBpZiAocG9pbnQpIGN1cnNvci5zZXRTY3JlZW5Qb3NpdGlvbihwb2ludClcbiAgfVxufVxuXG4vLyBrZXltYXA6IGcgMFxuY2xhc3MgTW92ZVRvQmVnaW5uaW5nT2ZTY3JlZW5MaW5lIGV4dGVuZHMgTW92ZVRvU2NyZWVuQ29sdW1uIHtcbiAgd2hpY2ggPSBcImJlZ2lubmluZ1wiXG59XG5cbi8vIGcgXjogYG1vdmUtdG8tZmlyc3QtY2hhcmFjdGVyLW9mLXNjcmVlbi1saW5lYFxuY2xhc3MgTW92ZVRvRmlyc3RDaGFyYWN0ZXJPZlNjcmVlbkxpbmUgZXh0ZW5kcyBNb3ZlVG9TY3JlZW5Db2x1bW4ge1xuICB3aGljaCA9IFwiZmlyc3QtY2hhcmFjdGVyXCJcbn1cblxuLy8ga2V5bWFwOiBnICRcbmNsYXNzIE1vdmVUb0xhc3RDaGFyYWN0ZXJPZlNjcmVlbkxpbmUgZXh0ZW5kcyBNb3ZlVG9TY3JlZW5Db2x1bW4ge1xuICB3aGljaCA9IFwibGFzdC1jaGFyYWN0ZXJcIlxufVxuXG4vLyBrZXltYXA6IGcgZ1xuY2xhc3MgTW92ZVRvRmlyc3RMaW5lIGV4dGVuZHMgTW90aW9uIHtcbiAgd2lzZSA9IFwibGluZXdpc2VcIlxuICBqdW1wID0gdHJ1ZVxuICB2ZXJ0aWNhbE1vdGlvbiA9IHRydWVcbiAgbW92ZVN1Y2Nlc3NPbkxpbmV3aXNlID0gdHJ1ZVxuXG4gIG1vdmVDdXJzb3IoY3Vyc29yKSB7XG4gICAgdGhpcy5zZXRDdXJzb3JCdWZmZXJSb3coY3Vyc29yLCB0aGlzLmdldFZhbGlkVmltQnVmZmVyUm93KHRoaXMuZ2V0Um93KCkpKVxuICAgIGN1cnNvci5hdXRvc2Nyb2xsKHtjZW50ZXI6IHRydWV9KVxuICB9XG5cbiAgZ2V0Um93KCkge1xuICAgIHJldHVybiB0aGlzLmdldENvdW50KCkgLSAxXG4gIH1cbn1cblxuLy8ga2V5bWFwOiBHXG5jbGFzcyBNb3ZlVG9MYXN0TGluZSBleHRlbmRzIE1vdmVUb0ZpcnN0TGluZSB7XG4gIGRlZmF1bHRDb3VudCA9IEluZmluaXR5XG59XG5cbi8vIGtleW1hcDogTiUgZS5nLiAxMCVcbmNsYXNzIE1vdmVUb0xpbmVCeVBlcmNlbnQgZXh0ZW5kcyBNb3ZlVG9GaXJzdExpbmUge1xuICBnZXRSb3coKSB7XG4gICAgY29uc3QgcGVyY2VudCA9IHRoaXMubGltaXROdW1iZXIodGhpcy5nZXRDb3VudCgpLCB7bWF4OiAxMDB9KVxuICAgIHJldHVybiBNYXRoLmZsb29yKHRoaXMuZ2V0VmltTGFzdEJ1ZmZlclJvdygpICogKHBlcmNlbnQgLyAxMDApKVxuICB9XG59XG5cbmNsYXNzIE1vdmVUb1JlbGF0aXZlTGluZSBleHRlbmRzIE1vdGlvbiB7XG4gIHN0YXRpYyBjb21tYW5kID0gZmFsc2VcbiAgd2lzZSA9IFwibGluZXdpc2VcIlxuICBtb3ZlU3VjY2Vzc09uTGluZXdpc2UgPSB0cnVlXG5cbiAgbW92ZUN1cnNvcihjdXJzb3IpIHtcbiAgICBsZXQgcm93XG4gICAgbGV0IGNvdW50ID0gdGhpcy5nZXRDb3VudCgpXG4gICAgaWYgKGNvdW50IDwgMCkge1xuICAgICAgLy8gU3VwcG9ydCBuZWdhdGl2ZSBjb3VudFxuICAgICAgLy8gTmVnYXRpdmUgY291bnQgY2FuIGJlIHBhc3NlZCBsaWtlIGBvcGVyYXRpb25TdGFjay5ydW4oXCJNb3ZlVG9SZWxhdGl2ZUxpbmVcIiwge2NvdW50OiAtNX0pYC5cbiAgICAgIC8vIEN1cnJlbnRseSB1c2VkIGluIHZpbS1tb2RlLXBsdXMtZXgtbW9kZSBwa2cuXG4gICAgICBjb3VudCArPSAxXG4gICAgICByb3cgPSB0aGlzLmdldEZvbGRTdGFydFJvd0ZvclJvdyhjdXJzb3IuZ2V0QnVmZmVyUm93KCkpXG4gICAgICB3aGlsZSAoY291bnQrKyA8IDApIHJvdyA9IHRoaXMuZ2V0Rm9sZFN0YXJ0Um93Rm9yUm93KHJvdyAtIDEpXG4gICAgfSBlbHNlIHtcbiAgICAgIGNvdW50IC09IDFcbiAgICAgIHJvdyA9IHRoaXMuZ2V0Rm9sZEVuZFJvd0ZvclJvdyhjdXJzb3IuZ2V0QnVmZmVyUm93KCkpXG4gICAgICB3aGlsZSAoY291bnQtLSA+IDApIHJvdyA9IHRoaXMuZ2V0Rm9sZEVuZFJvd0ZvclJvdyhyb3cgKyAxKVxuICAgIH1cbiAgICB0aGlzLnV0aWxzLnNldEJ1ZmZlclJvdyhjdXJzb3IsIHJvdylcbiAgfVxufVxuXG5jbGFzcyBNb3ZlVG9SZWxhdGl2ZUxpbmVNaW5pbXVtVHdvIGV4dGVuZHMgTW92ZVRvUmVsYXRpdmVMaW5lIHtcbiAgc3RhdGljIGNvbW1hbmQgPSBmYWxzZVxuICBnZXRDb3VudCgpIHtcbiAgICByZXR1cm4gdGhpcy5saW1pdE51bWJlcihzdXBlci5nZXRDb3VudCgpLCB7bWluOiAyfSlcbiAgfVxufVxuXG4vLyBQb3NpdGlvbiBjdXJzb3Igd2l0aG91dCBzY3JvbGxpbmcuLCBILCBNLCBMXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBrZXltYXA6IEhcbmNsYXNzIE1vdmVUb1RvcE9mU2NyZWVuIGV4dGVuZHMgTW90aW9uIHtcbiAgd2lzZSA9IFwibGluZXdpc2VcIlxuICBqdW1wID0gdHJ1ZVxuICBkZWZhdWx0Q291bnQgPSAwXG4gIHZlcnRpY2FsTW90aW9uID0gdHJ1ZVxuXG4gIG1vdmVDdXJzb3IoY3Vyc29yKSB7XG4gICAgY29uc3QgYnVmZmVyUm93ID0gdGhpcy5lZGl0b3IuYnVmZmVyUm93Rm9yU2NyZWVuUm93KHRoaXMuZ2V0U2NyZWVuUm93KCkpXG4gICAgdGhpcy5zZXRDdXJzb3JCdWZmZXJSb3coY3Vyc29yLCBidWZmZXJSb3cpXG4gIH1cblxuICBnZXRTY3JlZW5Sb3coKSB7XG4gICAgY29uc3QgZmlyc3RWaXNpYmxlUm93ID0gdGhpcy5lZGl0b3IuZ2V0Rmlyc3RWaXNpYmxlU2NyZWVuUm93KClcbiAgICBjb25zdCBsYXN0VmlzaWJsZVJvdyA9IHRoaXMubGltaXROdW1iZXIodGhpcy5lZGl0b3IuZ2V0TGFzdFZpc2libGVTY3JlZW5Sb3coKSwge21heDogdGhpcy5nZXRWaW1MYXN0U2NyZWVuUm93KCl9KVxuXG4gICAgY29uc3QgYmFzZU9mZnNldCA9IDJcbiAgICBpZiAodGhpcy5uYW1lID09PSBcIk1vdmVUb1RvcE9mU2NyZWVuXCIpIHtcbiAgICAgIGNvbnN0IG9mZnNldCA9IGZpcnN0VmlzaWJsZVJvdyA9PT0gMCA/IDAgOiBiYXNlT2Zmc2V0XG4gICAgICBjb25zdCBjb3VudCA9IHRoaXMuZ2V0Q291bnQoKSAtIDFcbiAgICAgIHJldHVybiB0aGlzLmxpbWl0TnVtYmVyKGZpcnN0VmlzaWJsZVJvdyArIGNvdW50LCB7bWluOiBmaXJzdFZpc2libGVSb3cgKyBvZmZzZXQsIG1heDogbGFzdFZpc2libGVSb3d9KVxuICAgIH0gZWxzZSBpZiAodGhpcy5uYW1lID09PSBcIk1vdmVUb01pZGRsZU9mU2NyZWVuXCIpIHtcbiAgICAgIHJldHVybiBmaXJzdFZpc2libGVSb3cgKyBNYXRoLmZsb29yKChsYXN0VmlzaWJsZVJvdyAtIGZpcnN0VmlzaWJsZVJvdykgLyAyKVxuICAgIH0gZWxzZSBpZiAodGhpcy5uYW1lID09PSBcIk1vdmVUb0JvdHRvbU9mU2NyZWVuXCIpIHtcbiAgICAgIGNvbnN0IG9mZnNldCA9IGxhc3RWaXNpYmxlUm93ID09PSB0aGlzLmdldFZpbUxhc3RTY3JlZW5Sb3coKSA/IDAgOiBiYXNlT2Zmc2V0ICsgMVxuICAgICAgY29uc3QgY291bnQgPSB0aGlzLmdldENvdW50KCkgLSAxXG4gICAgICByZXR1cm4gdGhpcy5saW1pdE51bWJlcihsYXN0VmlzaWJsZVJvdyAtIGNvdW50LCB7bWluOiBmaXJzdFZpc2libGVSb3csIG1heDogbGFzdFZpc2libGVSb3cgLSBvZmZzZXR9KVxuICAgIH1cbiAgfVxufVxuXG5jbGFzcyBNb3ZlVG9NaWRkbGVPZlNjcmVlbiBleHRlbmRzIE1vdmVUb1RvcE9mU2NyZWVuIHt9IC8vIGtleW1hcDogTVxuY2xhc3MgTW92ZVRvQm90dG9tT2ZTY3JlZW4gZXh0ZW5kcyBNb3ZlVG9Ub3BPZlNjcmVlbiB7fSAvLyBrZXltYXA6IExcblxuLy8gU2Nyb2xsaW5nXG4vLyBIYWxmOiBjdHJsLWQsIGN0cmwtdVxuLy8gRnVsbDogY3RybC1mLCBjdHJsLWJcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFtGSVhNRV0gY291bnQgYmVoYXZlIGRpZmZlcmVudGx5IGZyb20gb3JpZ2luYWwgVmltLlxuY2xhc3MgU2Nyb2xsIGV4dGVuZHMgTW90aW9uIHtcbiAgc3RhdGljIGNvbW1hbmQgPSBmYWxzZVxuICBzdGF0aWMgc2Nyb2xsVGFzayA9IG51bGxcbiAgc3RhdGljIGFtb3VudE9mUGFnZUJ5TmFtZSA9IHtcbiAgICBTY3JvbGxGdWxsU2NyZWVuRG93bjogMSxcbiAgICBTY3JvbGxGdWxsU2NyZWVuVXA6IC0xLFxuICAgIFNjcm9sbEhhbGZTY3JlZW5Eb3duOiAwLjUsXG4gICAgU2Nyb2xsSGFsZlNjcmVlblVwOiAtMC41LFxuICAgIFNjcm9sbFF1YXJ0ZXJTY3JlZW5Eb3duOiAwLjI1LFxuICAgIFNjcm9sbFF1YXJ0ZXJTY3JlZW5VcDogLTAuMjUsXG4gIH1cbiAgdmVydGljYWxNb3Rpb24gPSB0cnVlXG5cbiAgZXhlY3V0ZSgpIHtcbiAgICBjb25zdCBhbW91bnRPZlBhZ2UgPSB0aGlzLmNvbnN0cnVjdG9yLmFtb3VudE9mUGFnZUJ5TmFtZVt0aGlzLm5hbWVdXG4gICAgY29uc3QgYW1vdW50T2ZTY3JlZW5Sb3dzID0gTWF0aC50cnVuYyhhbW91bnRPZlBhZ2UgKiB0aGlzLmVkaXRvci5nZXRSb3dzUGVyUGFnZSgpICogdGhpcy5nZXRDb3VudCgpKVxuICAgIHRoaXMuYW1vdW50T2ZQaXhlbHMgPSBhbW91bnRPZlNjcmVlblJvd3MgKiB0aGlzLmVkaXRvci5nZXRMaW5lSGVpZ2h0SW5QaXhlbHMoKVxuXG4gICAgc3VwZXIuZXhlY3V0ZSgpXG5cbiAgICB0aGlzLnZpbVN0YXRlLnJlcXVlc3RTY3JvbGwoe1xuICAgICAgYW1vdW50T2ZQaXhlbHM6IHRoaXMuYW1vdW50T2ZQaXhlbHMsXG4gICAgICBkdXJhdGlvbjogdGhpcy5nZXRTbW9vdGhTY3JvbGxEdWF0aW9uKChNYXRoLmFicyhhbW91bnRPZlBhZ2UpID09PSAxID8gXCJGdWxsXCIgOiBcIkhhbGZcIikgKyBcIlNjcm9sbE1vdGlvblwiKSxcbiAgICB9KVxuICB9XG5cbiAgbW92ZUN1cnNvcihjdXJzb3IpIHtcbiAgICBjb25zdCBjdXJzb3JQaXhlbCA9IHRoaXMuZWRpdG9yRWxlbWVudC5waXhlbFBvc2l0aW9uRm9yU2NyZWVuUG9zaXRpb24oY3Vyc29yLmdldFNjcmVlblBvc2l0aW9uKCkpXG4gICAgY3Vyc29yUGl4ZWwudG9wICs9IHRoaXMuYW1vdW50T2ZQaXhlbHNcbiAgICBjb25zdCBzY3JlZW5Qb3NpdGlvbiA9IHRoaXMuZWRpdG9yRWxlbWVudC5zY3JlZW5Qb3NpdGlvbkZvclBpeGVsUG9zaXRpb24oY3Vyc29yUGl4ZWwpXG4gICAgY29uc3Qgc2NyZWVuUm93ID0gdGhpcy5nZXRWYWxpZFZpbVNjcmVlblJvdyhzY3JlZW5Qb3NpdGlvbi5yb3cpXG4gICAgdGhpcy5zZXRDdXJzb3JCdWZmZXJSb3coY3Vyc29yLCB0aGlzLmVkaXRvci5idWZmZXJSb3dGb3JTY3JlZW5Sb3coc2NyZWVuUm93KSwge2F1dG9zY3JvbGw6IGZhbHNlfSlcbiAgfVxufVxuXG5jbGFzcyBTY3JvbGxGdWxsU2NyZWVuRG93biBleHRlbmRzIFNjcm9sbCB7fSAvLyBjdHJsLWZcbmNsYXNzIFNjcm9sbEZ1bGxTY3JlZW5VcCBleHRlbmRzIFNjcm9sbCB7fSAvLyBjdHJsLWJcbmNsYXNzIFNjcm9sbEhhbGZTY3JlZW5Eb3duIGV4dGVuZHMgU2Nyb2xsIHt9IC8vIGN0cmwtZFxuY2xhc3MgU2Nyb2xsSGFsZlNjcmVlblVwIGV4dGVuZHMgU2Nyb2xsIHt9IC8vIGN0cmwtdVxuY2xhc3MgU2Nyb2xsUXVhcnRlclNjcmVlbkRvd24gZXh0ZW5kcyBTY3JvbGwge30gLy8gZyBjdHJsLWRcbmNsYXNzIFNjcm9sbFF1YXJ0ZXJTY3JlZW5VcCBleHRlbmRzIFNjcm9sbCB7fSAvLyBnIGN0cmwtdVxuXG4vLyBGaW5kXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBrZXltYXA6IGZcbmNsYXNzIEZpbmQgZXh0ZW5kcyBNb3Rpb24ge1xuICBiYWNrd2FyZHMgPSBmYWxzZVxuICBpbmNsdXNpdmUgPSB0cnVlXG4gIG9mZnNldCA9IDBcbiAgcmVxdWlyZUlucHV0ID0gdHJ1ZVxuICBjYXNlU2Vuc2l0aXZpdHlLaW5kID0gXCJGaW5kXCJcblxuICByZXN0b3JlRWRpdG9yU3RhdGUoKSB7XG4gICAgaWYgKHRoaXMuX3Jlc3RvcmVFZGl0b3JTdGF0ZSkgdGhpcy5fcmVzdG9yZUVkaXRvclN0YXRlKClcbiAgICB0aGlzLl9yZXN0b3JlRWRpdG9yU3RhdGUgPSBudWxsXG4gIH1cblxuICBjYW5jZWxPcGVyYXRpb24oKSB7XG4gICAgdGhpcy5yZXN0b3JlRWRpdG9yU3RhdGUoKVxuICAgIHN1cGVyLmNhbmNlbE9wZXJhdGlvbigpXG4gIH1cblxuICBpbml0aWFsaXplKCkge1xuICAgIGlmICh0aGlzLmdldENvbmZpZyhcInJldXNlRmluZEZvclJlcGVhdEZpbmRcIikpIHRoaXMucmVwZWF0SWZOZWNlc3NhcnkoKVxuXG4gICAgaWYgKCF0aGlzLnJlcGVhdGVkKSB7XG4gICAgICBjb25zdCBjaGFyc01heCA9IHRoaXMuZ2V0Q29uZmlnKFwiZmluZENoYXJzTWF4XCIpXG4gICAgICBjb25zdCBvcHRpb25zQmFzZSA9IHtwdXJwb3NlOiBcImZpbmRcIiwgY2hhcnNNYXh9XG5cbiAgICAgIGlmIChjaGFyc01heCA9PT0gMSkge1xuICAgICAgICB0aGlzLmZvY3VzSW5wdXQob3B0aW9uc0Jhc2UpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9yZXN0b3JlRWRpdG9yU3RhdGUgPSB0aGlzLnV0aWxzLnNhdmVFZGl0b3JTdGF0ZSh0aGlzLmVkaXRvcilcbiAgICAgICAgY29uc3Qgb3B0aW9ucyA9IHtcbiAgICAgICAgICBhdXRvQ29uZmlybVRpbWVvdXQ6IHRoaXMuZ2V0Q29uZmlnKFwiZmluZENvbmZpcm1CeVRpbWVvdXRcIiksXG4gICAgICAgICAgb25Db25maXJtOiBpbnB1dCA9PiB7XG4gICAgICAgICAgICB0aGlzLmlucHV0ID0gaW5wdXRcbiAgICAgICAgICAgIGlmIChpbnB1dCkgdGhpcy5wcm9jZXNzT3BlcmF0aW9uKClcbiAgICAgICAgICAgIGVsc2UgdGhpcy5jYW5jZWxPcGVyYXRpb24oKVxuICAgICAgICAgIH0sXG4gICAgICAgICAgb25DaGFuZ2U6IHByZUNvbmZpcm1lZENoYXJzID0+IHtcbiAgICAgICAgICAgIHRoaXMucHJlQ29uZmlybWVkQ2hhcnMgPSBwcmVDb25maXJtZWRDaGFyc1xuICAgICAgICAgICAgdGhpcy5oaWdobGlnaHRUZXh0SW5DdXJzb3JSb3dzKHRoaXMucHJlQ29uZmlybWVkQ2hhcnMsIFwicHJlLWNvbmZpcm1cIiwgdGhpcy5pc0JhY2t3YXJkcygpKVxuICAgICAgICAgIH0sXG4gICAgICAgICAgb25DYW5jZWw6ICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMudmltU3RhdGUuaGlnaGxpZ2h0RmluZC5jbGVhck1hcmtlcnMoKVxuICAgICAgICAgICAgdGhpcy5jYW5jZWxPcGVyYXRpb24oKVxuICAgICAgICAgIH0sXG4gICAgICAgICAgY29tbWFuZHM6IHtcbiAgICAgICAgICAgIFwidmltLW1vZGUtcGx1czpmaW5kLW5leHQtcHJlLWNvbmZpcm1lZFwiOiAoKSA9PiB0aGlzLmZpbmRQcmVDb25maXJtZWQoKzEpLFxuICAgICAgICAgICAgXCJ2aW0tbW9kZS1wbHVzOmZpbmQtcHJldmlvdXMtcHJlLWNvbmZpcm1lZFwiOiAoKSA9PiB0aGlzLmZpbmRQcmVDb25maXJtZWQoLTEpLFxuICAgICAgICAgIH0sXG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5mb2N1c0lucHV0KE9iamVjdC5hc3NpZ24ob3B0aW9ucywgb3B0aW9uc0Jhc2UpKVxuICAgICAgfVxuICAgIH1cbiAgICBzdXBlci5pbml0aWFsaXplKClcbiAgfVxuXG4gIGZpbmRQcmVDb25maXJtZWQoZGVsdGEpIHtcbiAgICBpZiAodGhpcy5wcmVDb25maXJtZWRDaGFycyAmJiB0aGlzLmdldENvbmZpZyhcImhpZ2hsaWdodEZpbmRDaGFyXCIpKSB7XG4gICAgICBjb25zdCBpbmRleCA9IHRoaXMuaGlnaGxpZ2h0VGV4dEluQ3Vyc29yUm93cyhcbiAgICAgICAgdGhpcy5wcmVDb25maXJtZWRDaGFycyxcbiAgICAgICAgXCJwcmUtY29uZmlybVwiLFxuICAgICAgICB0aGlzLmlzQmFja3dhcmRzKCksXG4gICAgICAgIHRoaXMuZ2V0Q291bnQoKSAtIDEgKyBkZWx0YSxcbiAgICAgICAgdHJ1ZVxuICAgICAgKVxuICAgICAgdGhpcy5jb3VudCA9IGluZGV4ICsgMVxuICAgIH1cbiAgfVxuXG4gIHJlcGVhdElmTmVjZXNzYXJ5KCkge1xuICAgIGNvbnN0IGZpbmRDb21tYW5kTmFtZXMgPSBbXCJGaW5kXCIsIFwiRmluZEJhY2t3YXJkc1wiLCBcIlRpbGxcIiwgXCJUaWxsQmFja3dhcmRzXCJdXG4gICAgY29uc3QgY3VycmVudEZpbmQgPSB0aGlzLmdsb2JhbFN0YXRlLmdldChcImN1cnJlbnRGaW5kXCIpXG4gICAgaWYgKGN1cnJlbnRGaW5kICYmIGZpbmRDb21tYW5kTmFtZXMuaW5jbHVkZXModGhpcy52aW1TdGF0ZS5vcGVyYXRpb25TdGFjay5nZXRMYXN0Q29tbWFuZE5hbWUoKSkpIHtcbiAgICAgIHRoaXMuaW5wdXQgPSBjdXJyZW50RmluZC5pbnB1dFxuICAgICAgdGhpcy5yZXBlYXRlZCA9IHRydWVcbiAgICB9XG4gIH1cblxuICBpc0JhY2t3YXJkcygpIHtcbiAgICByZXR1cm4gdGhpcy5iYWNrd2FyZHNcbiAgfVxuXG4gIGV4ZWN1dGUoKSB7XG4gICAgc3VwZXIuZXhlY3V0ZSgpXG4gICAgbGV0IGRlY29yYXRpb25UeXBlID0gXCJwb3N0LWNvbmZpcm1cIlxuICAgIGlmICh0aGlzLm9wZXJhdG9yICYmICF0aGlzLm9wZXJhdG9yLmluc3RhbmNlb2YoXCJTZWxlY3RCYXNlXCIpKSB7XG4gICAgICBkZWNvcmF0aW9uVHlwZSArPSBcIiBsb25nXCJcbiAgICB9XG5cbiAgICAvLyBIQUNLOiBXaGVuIHJlcGVhdGVkIGJ5IFwiLFwiLCB0aGlzLmJhY2t3YXJkcyBpcyB0ZW1wb3JhcnkgaW52ZXJ0ZWQgYW5kXG4gICAgLy8gcmVzdG9yZWQgYWZ0ZXIgZXhlY3V0aW9uIGZpbmlzaGVkLlxuICAgIC8vIEJ1dCBmaW5hbCBoaWdobGlnaHRUZXh0SW5DdXJzb3JSb3dzIGlzIGV4ZWN1dGVkIGluIGFzeW5jKD1hZnRlciBvcGVyYXRpb24gZmluaXNoZWQpLlxuICAgIC8vIFRodXMgd2UgbmVlZCB0byBwcmVzZXJ2ZSBiZWZvcmUgcmVzdG9yZWQgYGJhY2t3YXJkc2AgdmFsdWUgYW5kIHBhc3MgaXQuXG4gICAgY29uc3QgYmFja3dhcmRzID0gdGhpcy5pc0JhY2t3YXJkcygpXG4gICAgdGhpcy5lZGl0b3IuY29tcG9uZW50LmdldE5leHRVcGRhdGVQcm9taXNlKCkudGhlbigoKSA9PiB7XG4gICAgICB0aGlzLmhpZ2hsaWdodFRleHRJbkN1cnNvclJvd3ModGhpcy5pbnB1dCwgZGVjb3JhdGlvblR5cGUsIGJhY2t3YXJkcylcbiAgICB9KVxuICB9XG5cbiAgZ2V0UG9pbnQoZnJvbVBvaW50KSB7XG4gICAgY29uc3Qgc2NhblJhbmdlID0gdGhpcy5lZGl0b3IuYnVmZmVyUmFuZ2VGb3JCdWZmZXJSb3coZnJvbVBvaW50LnJvdylcbiAgICBjb25zdCBwb2ludHMgPSBbXVxuICAgIGNvbnN0IHJlZ2V4ID0gdGhpcy5nZXRSZWdleCh0aGlzLmlucHV0KVxuICAgIGNvbnN0IGluZGV4V2FudEFjY2VzcyA9IHRoaXMuZ2V0Q291bnQoKSAtIDFcblxuICAgIGNvbnN0IHRyYW5zbGF0aW9uID0gbmV3IFBvaW50KDAsIHRoaXMuaXNCYWNrd2FyZHMoKSA/IHRoaXMub2Zmc2V0IDogLXRoaXMub2Zmc2V0KVxuICAgIGlmICh0aGlzLnJlcGVhdGVkKSB7XG4gICAgICBmcm9tUG9pbnQgPSBmcm9tUG9pbnQudHJhbnNsYXRlKHRyYW5zbGF0aW9uLm5lZ2F0ZSgpKVxuICAgIH1cblxuICAgIGlmICh0aGlzLmlzQmFja3dhcmRzKCkpIHtcbiAgICAgIGlmICh0aGlzLmdldENvbmZpZyhcImZpbmRBY3Jvc3NMaW5lc1wiKSkgc2NhblJhbmdlLnN0YXJ0ID0gUG9pbnQuWkVST1xuXG4gICAgICB0aGlzLmVkaXRvci5iYWNrd2FyZHNTY2FuSW5CdWZmZXJSYW5nZShyZWdleCwgc2NhblJhbmdlLCAoe3JhbmdlLCBzdG9wfSkgPT4ge1xuICAgICAgICBpZiAocmFuZ2Uuc3RhcnQuaXNMZXNzVGhhbihmcm9tUG9pbnQpKSB7XG4gICAgICAgICAgcG9pbnRzLnB1c2gocmFuZ2Uuc3RhcnQpXG4gICAgICAgICAgaWYgKHBvaW50cy5sZW5ndGggPiBpbmRleFdhbnRBY2Nlc3MpIHN0b3AoKVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAodGhpcy5nZXRDb25maWcoXCJmaW5kQWNyb3NzTGluZXNcIikpIHNjYW5SYW5nZS5lbmQgPSB0aGlzLmVkaXRvci5nZXRFb2ZCdWZmZXJQb3NpdGlvbigpXG5cbiAgICAgIHRoaXMuZWRpdG9yLnNjYW5JbkJ1ZmZlclJhbmdlKHJlZ2V4LCBzY2FuUmFuZ2UsICh7cmFuZ2UsIHN0b3B9KSA9PiB7XG4gICAgICAgIGlmIChyYW5nZS5zdGFydC5pc0dyZWF0ZXJUaGFuKGZyb21Qb2ludCkpIHtcbiAgICAgICAgICBwb2ludHMucHVzaChyYW5nZS5zdGFydClcbiAgICAgICAgICBpZiAocG9pbnRzLmxlbmd0aCA+IGluZGV4V2FudEFjY2Vzcykgc3RvcCgpXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfVxuXG4gICAgY29uc3QgcG9pbnQgPSBwb2ludHNbaW5kZXhXYW50QWNjZXNzXVxuICAgIGlmIChwb2ludCkgcmV0dXJuIHBvaW50LnRyYW5zbGF0ZSh0cmFuc2xhdGlvbilcbiAgfVxuXG4gIC8vIEZJWE1FOiBiYWQgbmFtaW5nLCB0aGlzIGZ1bmN0aW9uIG11c3QgcmV0dXJuIGluZGV4XG4gIGhpZ2hsaWdodFRleHRJbkN1cnNvclJvd3ModGV4dCwgZGVjb3JhdGlvblR5cGUsIGJhY2t3YXJkcywgaW5kZXggPSB0aGlzLmdldENvdW50KCkgLSAxLCBhZGp1c3RJbmRleCA9IGZhbHNlKSB7XG4gICAgaWYgKCF0aGlzLmdldENvbmZpZyhcImhpZ2hsaWdodEZpbmRDaGFyXCIpKSByZXR1cm5cblxuICAgIHJldHVybiB0aGlzLnZpbVN0YXRlLmhpZ2hsaWdodEZpbmQuaGlnaGxpZ2h0Q3Vyc29yUm93cyhcbiAgICAgIHRoaXMuZ2V0UmVnZXgodGV4dCksXG4gICAgICBkZWNvcmF0aW9uVHlwZSxcbiAgICAgIGJhY2t3YXJkcyxcbiAgICAgIHRoaXMub2Zmc2V0LFxuICAgICAgaW5kZXgsXG4gICAgICBhZGp1c3RJbmRleFxuICAgIClcbiAgfVxuXG4gIG1vdmVDdXJzb3IoY3Vyc29yKSB7XG4gICAgY29uc3QgcG9pbnQgPSB0aGlzLmdldFBvaW50KGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpKVxuICAgIGlmIChwb2ludCkgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHBvaW50KVxuICAgIGVsc2UgdGhpcy5yZXN0b3JlRWRpdG9yU3RhdGUoKVxuXG4gICAgaWYgKCF0aGlzLnJlcGVhdGVkKSB0aGlzLmdsb2JhbFN0YXRlLnNldChcImN1cnJlbnRGaW5kXCIsIHRoaXMpXG4gIH1cblxuICBnZXRSZWdleCh0ZXJtKSB7XG4gICAgY29uc3QgbW9kaWZpZXJzID0gdGhpcy5pc0Nhc2VTZW5zaXRpdmUodGVybSkgPyBcImdcIiA6IFwiZ2lcIlxuICAgIHJldHVybiBuZXcgUmVnRXhwKHRoaXMuXy5lc2NhcGVSZWdFeHAodGVybSksIG1vZGlmaWVycylcbiAgfVxufVxuXG4vLyBrZXltYXA6IEZcbmNsYXNzIEZpbmRCYWNrd2FyZHMgZXh0ZW5kcyBGaW5kIHtcbiAgaW5jbHVzaXZlID0gZmFsc2VcbiAgYmFja3dhcmRzID0gdHJ1ZVxufVxuXG4vLyBrZXltYXA6IHRcbmNsYXNzIFRpbGwgZXh0ZW5kcyBGaW5kIHtcbiAgb2Zmc2V0ID0gMVxuICBnZXRQb2ludCguLi5hcmdzKSB7XG4gICAgY29uc3QgcG9pbnQgPSBzdXBlci5nZXRQb2ludCguLi5hcmdzKVxuICAgIHRoaXMubW92ZVN1Y2NlZWRlZCA9IHBvaW50ICE9IG51bGxcbiAgICByZXR1cm4gcG9pbnRcbiAgfVxufVxuXG4vLyBrZXltYXA6IFRcbmNsYXNzIFRpbGxCYWNrd2FyZHMgZXh0ZW5kcyBUaWxsIHtcbiAgaW5jbHVzaXZlID0gZmFsc2VcbiAgYmFja3dhcmRzID0gdHJ1ZVxufVxuXG4vLyBNYXJrXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBrZXltYXA6IGBcbmNsYXNzIE1vdmVUb01hcmsgZXh0ZW5kcyBNb3Rpb24ge1xuICBqdW1wID0gdHJ1ZVxuICByZXF1aXJlSW5wdXQgPSB0cnVlXG4gIGlucHV0ID0gbnVsbFxuICBtb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZSA9IGZhbHNlXG5cbiAgaW5pdGlhbGl6ZSgpIHtcbiAgICB0aGlzLnJlYWRDaGFyKClcbiAgICBzdXBlci5pbml0aWFsaXplKClcbiAgfVxuXG4gIG1vdmVDdXJzb3IoY3Vyc29yKSB7XG4gICAgbGV0IHBvaW50ID0gdGhpcy52aW1TdGF0ZS5tYXJrLmdldCh0aGlzLmlucHV0KVxuICAgIGlmIChwb2ludCkge1xuICAgICAgaWYgKHRoaXMubW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmUpIHtcbiAgICAgICAgcG9pbnQgPSB0aGlzLmdldEZpcnN0Q2hhcmFjdGVyUG9zaXRpb25Gb3JCdWZmZXJSb3cocG9pbnQucm93KVxuICAgICAgfVxuICAgICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHBvaW50KVxuICAgICAgY3Vyc29yLmF1dG9zY3JvbGwoe2NlbnRlcjogdHJ1ZX0pXG4gICAgfVxuICB9XG59XG5cbi8vIGtleW1hcDogJ1xuY2xhc3MgTW92ZVRvTWFya0xpbmUgZXh0ZW5kcyBNb3ZlVG9NYXJrIHtcbiAgd2lzZSA9IFwibGluZXdpc2VcIlxuICBtb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZSA9IHRydWVcbn1cblxuLy8gRm9sZCBtb3Rpb25cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIE1vdmVUb1ByZXZpb3VzRm9sZFN0YXJ0IGV4dGVuZHMgTW90aW9uIHtcbiAgd2lzZSA9IFwiY2hhcmFjdGVyd2lzZVwiXG4gIHdoaWNoID0gXCJzdGFydFwiXG4gIGRpcmVjdGlvbiA9IFwicHJldmlvdXNcIlxuXG4gIGV4ZWN1dGUoKSB7XG4gICAgdGhpcy5yb3dzID0gdGhpcy5nZXRGb2xkUm93cyh0aGlzLndoaWNoKVxuICAgIGlmICh0aGlzLmRpcmVjdGlvbiA9PT0gXCJwcmV2aW91c1wiKSB0aGlzLnJvd3MucmV2ZXJzZSgpXG4gICAgc3VwZXIuZXhlY3V0ZSgpXG4gIH1cblxuICBnZXRGb2xkUm93cyh3aGljaCkge1xuICAgIGNvbnN0IGZvbGRSYW5nZXMgPSB0aGlzLnV0aWxzLmdldENvZGVGb2xkUm93UmFuZ2VzKHRoaXMuZWRpdG9yKVxuICAgIHJldHVybiBmb2xkUmFuZ2VzLm1hcChyb3dSYW5nZSA9PiByb3dSYW5nZVt3aGljaCA9PT0gXCJzdGFydFwiID8gMCA6IDFdKS5zb3J0KChhLCBiKSA9PiBhIC0gYilcbiAgfVxuXG4gIGdldFNjYW5Sb3dzKGN1cnNvcikge1xuICAgIGNvbnN0IGN1cnNvclJvdyA9IGN1cnNvci5nZXRCdWZmZXJSb3coKVxuICAgIGNvbnN0IGlzVmFsZCA9IHRoaXMuZGlyZWN0aW9uID09PSBcInByZXZpb3VzXCIgPyByb3cgPT4gcm93IDwgY3Vyc29yUm93IDogcm93ID0+IHJvdyA+IGN1cnNvclJvd1xuICAgIHJldHVybiB0aGlzLnJvd3MuZmlsdGVyKGlzVmFsZClcbiAgfVxuXG4gIGRldGVjdFJvdyhjdXJzb3IpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRTY2FuUm93cyhjdXJzb3IpWzBdXG4gIH1cblxuICBtb3ZlQ3Vyc29yKGN1cnNvcikge1xuICAgIHRoaXMubW92ZUN1cnNvckNvdW50VGltZXMoY3Vyc29yLCAoKSA9PiB7XG4gICAgICBjb25zdCByb3cgPSB0aGlzLmRldGVjdFJvdyhjdXJzb3IpXG4gICAgICBpZiAocm93ICE9IG51bGwpIHRoaXMudXRpbHMubW92ZUN1cnNvclRvRmlyc3RDaGFyYWN0ZXJBdFJvdyhjdXJzb3IsIHJvdylcbiAgICB9KVxuICB9XG59XG5cbmNsYXNzIE1vdmVUb05leHRGb2xkU3RhcnQgZXh0ZW5kcyBNb3ZlVG9QcmV2aW91c0ZvbGRTdGFydCB7XG4gIGRpcmVjdGlvbiA9IFwibmV4dFwiXG59XG5cbmNsYXNzIE1vdmVUb1ByZXZpb3VzRm9sZFN0YXJ0V2l0aFNhbWVJbmRlbnQgZXh0ZW5kcyBNb3ZlVG9QcmV2aW91c0ZvbGRTdGFydCB7XG4gIGRldGVjdFJvdyhjdXJzb3IpIHtcbiAgICBjb25zdCBiYXNlSW5kZW50TGV2ZWwgPSB0aGlzLmVkaXRvci5pbmRlbnRhdGlvbkZvckJ1ZmZlclJvdyhjdXJzb3IuZ2V0QnVmZmVyUm93KCkpXG4gICAgcmV0dXJuIHRoaXMuZ2V0U2NhblJvd3MoY3Vyc29yKS5maW5kKHJvdyA9PiB0aGlzLmVkaXRvci5pbmRlbnRhdGlvbkZvckJ1ZmZlclJvdyhyb3cpID09PSBiYXNlSW5kZW50TGV2ZWwpXG4gIH1cbn1cblxuY2xhc3MgTW92ZVRvTmV4dEZvbGRTdGFydFdpdGhTYW1lSW5kZW50IGV4dGVuZHMgTW92ZVRvUHJldmlvdXNGb2xkU3RhcnRXaXRoU2FtZUluZGVudCB7XG4gIGRpcmVjdGlvbiA9IFwibmV4dFwiXG59XG5cbmNsYXNzIE1vdmVUb1ByZXZpb3VzRm9sZEVuZCBleHRlbmRzIE1vdmVUb1ByZXZpb3VzRm9sZFN0YXJ0IHtcbiAgd2hpY2ggPSBcImVuZFwiXG59XG5cbmNsYXNzIE1vdmVUb05leHRGb2xkRW5kIGV4dGVuZHMgTW92ZVRvUHJldmlvdXNGb2xkRW5kIHtcbiAgZGlyZWN0aW9uID0gXCJuZXh0XCJcbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgTW92ZVRvUHJldmlvdXNGdW5jdGlvbiBleHRlbmRzIE1vdmVUb1ByZXZpb3VzRm9sZFN0YXJ0IHtcbiAgZGlyZWN0aW9uID0gXCJwcmV2aW91c1wiXG4gIGRldGVjdFJvdyhjdXJzb3IpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRTY2FuUm93cyhjdXJzb3IpLmZpbmQocm93ID0+IHRoaXMudXRpbHMuaXNJbmNsdWRlRnVuY3Rpb25TY29wZUZvclJvdyh0aGlzLmVkaXRvciwgcm93KSlcbiAgfVxufVxuXG5jbGFzcyBNb3ZlVG9OZXh0RnVuY3Rpb24gZXh0ZW5kcyBNb3ZlVG9QcmV2aW91c0Z1bmN0aW9uIHtcbiAgZGlyZWN0aW9uID0gXCJuZXh0XCJcbn1cblxuY2xhc3MgTW92ZVRvUHJldmlvdXNGdW5jdGlvbkFuZFJlZHJhd0N1cnNvckxpbmVBdFVwcGVyTWlkZGxlIGV4dGVuZHMgTW92ZVRvUHJldmlvdXNGdW5jdGlvbiB7XG4gIGV4ZWN1dGUoKSB7XG4gICAgc3VwZXIuZXhlY3V0ZSgpXG4gICAgdGhpcy5nZXRJbnN0YW5jZShcIlJlZHJhd0N1cnNvckxpbmVBdFVwcGVyTWlkZGxlXCIpLmV4ZWN1dGUoKVxuICB9XG59XG5cbmNsYXNzIE1vdmVUb05leHRGdW5jdGlvbkFuZFJlZHJhd0N1cnNvckxpbmVBdFVwcGVyTWlkZGxlIGV4dGVuZHMgTW92ZVRvUHJldmlvdXNGdW5jdGlvbkFuZFJlZHJhd0N1cnNvckxpbmVBdFVwcGVyTWlkZGxlIHtcbiAgZGlyZWN0aW9uID0gXCJuZXh0XCJcbn1cblxuLy8gU2NvcGUgYmFzZWRcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIE1vdmVUb1Bvc2l0aW9uQnlTY29wZSBleHRlbmRzIE1vdGlvbiB7XG4gIHN0YXRpYyBjb21tYW5kID0gZmFsc2VcbiAgZGlyZWN0aW9uID0gXCJiYWNrd2FyZFwiXG4gIHNjb3BlID0gXCIuXCJcblxuICBtb3ZlQ3Vyc29yKGN1cnNvcikge1xuICAgIHRoaXMubW92ZUN1cnNvckNvdW50VGltZXMoY3Vyc29yLCAoKSA9PiB7XG4gICAgICBjb25zdCBjdXJzb3JQb3NpdGlvbiA9IGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXG4gICAgICBjb25zdCBwb2ludCA9IHRoaXMudXRpbHMuZGV0ZWN0U2NvcGVTdGFydFBvc2l0aW9uRm9yU2NvcGUodGhpcy5lZGl0b3IsIGN1cnNvclBvc2l0aW9uLCB0aGlzLmRpcmVjdGlvbiwgdGhpcy5zY29wZSlcbiAgICAgIGlmIChwb2ludCkgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHBvaW50KVxuICAgIH0pXG4gIH1cbn1cblxuY2xhc3MgTW92ZVRvUHJldmlvdXNTdHJpbmcgZXh0ZW5kcyBNb3ZlVG9Qb3NpdGlvbkJ5U2NvcGUge1xuICBkaXJlY3Rpb24gPSBcImJhY2t3YXJkXCJcbiAgc2NvcGUgPSBcInN0cmluZy5iZWdpblwiXG59XG5cbmNsYXNzIE1vdmVUb05leHRTdHJpbmcgZXh0ZW5kcyBNb3ZlVG9QcmV2aW91c1N0cmluZyB7XG4gIGRpcmVjdGlvbiA9IFwiZm9yd2FyZFwiXG59XG5cbmNsYXNzIE1vdmVUb1ByZXZpb3VzTnVtYmVyIGV4dGVuZHMgTW92ZVRvUG9zaXRpb25CeVNjb3BlIHtcbiAgZGlyZWN0aW9uID0gXCJiYWNrd2FyZFwiXG4gIHNjb3BlID0gXCJjb25zdGFudC5udW1lcmljXCJcbn1cblxuY2xhc3MgTW92ZVRvTmV4dE51bWJlciBleHRlbmRzIE1vdmVUb1ByZXZpb3VzTnVtYmVyIHtcbiAgZGlyZWN0aW9uID0gXCJmb3J3YXJkXCJcbn1cblxuY2xhc3MgTW92ZVRvTmV4dE9jY3VycmVuY2UgZXh0ZW5kcyBNb3Rpb24ge1xuICAvLyBFbnN1cmUgdGhpcyBjb21tYW5kIGlzIGF2YWlsYWJsZSB3aGVuIG9ubHkgaGFzLW9jY3VycmVuY2VcbiAgc3RhdGljIGNvbW1hbmRTY29wZSA9IFwiYXRvbS10ZXh0LWVkaXRvci52aW0tbW9kZS1wbHVzLmhhcy1vY2N1cnJlbmNlXCJcbiAganVtcCA9IHRydWVcbiAgZGlyZWN0aW9uID0gXCJuZXh0XCJcblxuICBleGVjdXRlKCkge1xuICAgIHRoaXMucmFuZ2VzID0gdGhpcy51dGlscy5zb3J0UmFuZ2VzKHRoaXMub2NjdXJyZW5jZU1hbmFnZXIuZ2V0TWFya2VycygpLm1hcChtYXJrZXIgPT4gbWFya2VyLmdldEJ1ZmZlclJhbmdlKCkpKVxuICAgIHN1cGVyLmV4ZWN1dGUoKVxuICB9XG5cbiAgbW92ZUN1cnNvcihjdXJzb3IpIHtcbiAgICBjb25zdCByYW5nZSA9IHRoaXMucmFuZ2VzW3RoaXMudXRpbHMuZ2V0SW5kZXgodGhpcy5nZXRJbmRleChjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKSksIHRoaXMucmFuZ2VzKV1cbiAgICBjb25zdCBwb2ludCA9IHJhbmdlLnN0YXJ0XG4gICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHBvaW50LCB7YXV0b3Njcm9sbDogZmFsc2V9KVxuXG4gICAgdGhpcy5lZGl0b3IudW5mb2xkQnVmZmVyUm93KHBvaW50LnJvdylcbiAgICBpZiAoY3Vyc29yLmlzTGFzdEN1cnNvcigpKSB7XG4gICAgICB0aGlzLnV0aWxzLnNtYXJ0U2Nyb2xsVG9CdWZmZXJQb3NpdGlvbih0aGlzLmVkaXRvciwgcG9pbnQpXG4gICAgfVxuXG4gICAgaWYgKHRoaXMuZ2V0Q29uZmlnKFwiZmxhc2hPbk1vdmVUb09jY3VycmVuY2VcIikpIHtcbiAgICAgIHRoaXMudmltU3RhdGUuZmxhc2gocmFuZ2UsIHt0eXBlOiBcInNlYXJjaFwifSlcbiAgICB9XG4gIH1cblxuICBnZXRJbmRleChmcm9tUG9pbnQpIHtcbiAgICBjb25zdCBpbmRleCA9IHRoaXMucmFuZ2VzLmZpbmRJbmRleChyYW5nZSA9PiByYW5nZS5zdGFydC5pc0dyZWF0ZXJUaGFuKGZyb21Qb2ludCkpXG4gICAgcmV0dXJuIChpbmRleCA+PSAwID8gaW5kZXggOiAwKSArIHRoaXMuZ2V0Q291bnQoKSAtIDFcbiAgfVxufVxuXG5jbGFzcyBNb3ZlVG9QcmV2aW91c09jY3VycmVuY2UgZXh0ZW5kcyBNb3ZlVG9OZXh0T2NjdXJyZW5jZSB7XG4gIGRpcmVjdGlvbiA9IFwicHJldmlvdXNcIlxuXG4gIGdldEluZGV4KGZyb21Qb2ludCkge1xuICAgIGNvbnN0IHJhbmdlcyA9IHRoaXMucmFuZ2VzLnNsaWNlKCkucmV2ZXJzZSgpXG4gICAgY29uc3QgcmFuZ2UgPSByYW5nZXMuZmluZChyYW5nZSA9PiByYW5nZS5lbmQuaXNMZXNzVGhhbihmcm9tUG9pbnQpKVxuICAgIGNvbnN0IGluZGV4ID0gcmFuZ2UgPyB0aGlzLnJhbmdlcy5pbmRleE9mKHJhbmdlKSA6IHRoaXMucmFuZ2VzLmxlbmd0aCAtIDFcbiAgICByZXR1cm4gaW5kZXggLSAodGhpcy5nZXRDb3VudCgpIC0gMSlcbiAgfVxufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBrZXltYXA6ICVcbmNsYXNzIE1vdmVUb1BhaXIgZXh0ZW5kcyBNb3Rpb24ge1xuICBpbmNsdXNpdmUgPSB0cnVlXG4gIGp1bXAgPSB0cnVlXG4gIG1lbWJlciA9IFtcIlBhcmVudGhlc2lzXCIsIFwiQ3VybHlCcmFja2V0XCIsIFwiU3F1YXJlQnJhY2tldFwiXVxuXG4gIG1vdmVDdXJzb3IoY3Vyc29yKSB7XG4gICAgY29uc3QgcG9pbnQgPSB0aGlzLmdldFBvaW50KGN1cnNvcilcbiAgICBpZiAocG9pbnQpIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihwb2ludClcbiAgfVxuXG4gIGdldFBvaW50Rm9yVGFnKHBvaW50KSB7XG4gICAgY29uc3QgcGFpckluZm8gPSB0aGlzLmdldEluc3RhbmNlKFwiQVRhZ1wiKS5nZXRQYWlySW5mbyhwb2ludClcbiAgICBpZiAoIXBhaXJJbmZvKSByZXR1cm5cblxuICAgIGxldCB7b3BlblJhbmdlLCBjbG9zZVJhbmdlfSA9IHBhaXJJbmZvXG4gICAgb3BlblJhbmdlID0gb3BlblJhbmdlLnRyYW5zbGF0ZShbMCwgKzFdLCBbMCwgLTFdKVxuICAgIGNsb3NlUmFuZ2UgPSBjbG9zZVJhbmdlLnRyYW5zbGF0ZShbMCwgKzFdLCBbMCwgLTFdKVxuICAgIGlmIChvcGVuUmFuZ2UuY29udGFpbnNQb2ludChwb2ludCkgJiYgIXBvaW50LmlzRXF1YWwob3BlblJhbmdlLmVuZCkpIHtcbiAgICAgIHJldHVybiBjbG9zZVJhbmdlLnN0YXJ0XG4gICAgfVxuICAgIGlmIChjbG9zZVJhbmdlLmNvbnRhaW5zUG9pbnQocG9pbnQpICYmICFwb2ludC5pc0VxdWFsKGNsb3NlUmFuZ2UuZW5kKSkge1xuICAgICAgcmV0dXJuIG9wZW5SYW5nZS5zdGFydFxuICAgIH1cbiAgfVxuXG4gIGdldFBvaW50KGN1cnNvcikge1xuICAgIGNvbnN0IGN1cnNvclBvc2l0aW9uID0gY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKClcbiAgICBjb25zdCBjdXJzb3JSb3cgPSBjdXJzb3JQb3NpdGlvbi5yb3dcbiAgICBjb25zdCBwb2ludCA9IHRoaXMuZ2V0UG9pbnRGb3JUYWcoY3Vyc29yUG9zaXRpb24pXG4gICAgaWYgKHBvaW50KSByZXR1cm4gcG9pbnRcblxuICAgIC8vIEFBbnlQYWlyQWxsb3dGb3J3YXJkaW5nIHJldHVybiBmb3J3YXJkaW5nIHJhbmdlIG9yIGVuY2xvc2luZyByYW5nZS5cbiAgICBjb25zdCByYW5nZSA9IHRoaXMuZ2V0SW5zdGFuY2UoXCJBQW55UGFpckFsbG93Rm9yd2FyZGluZ1wiLCB7bWVtYmVyOiB0aGlzLm1lbWJlcn0pLmdldFJhbmdlKGN1cnNvci5zZWxlY3Rpb24pXG4gICAgaWYgKCFyYW5nZSkgcmV0dXJuXG5cbiAgICBjb25zdCB7c3RhcnQsIGVuZH0gPSByYW5nZVxuICAgIGlmIChzdGFydC5yb3cgPT09IGN1cnNvclJvdyAmJiBzdGFydC5pc0dyZWF0ZXJUaGFuT3JFcXVhbChjdXJzb3JQb3NpdGlvbikpIHtcbiAgICAgIC8vIEZvcndhcmRpbmcgcmFuZ2UgZm91bmRcbiAgICAgIHJldHVybiBlbmQudHJhbnNsYXRlKFswLCAtMV0pXG4gICAgfSBlbHNlIGlmIChlbmQucm93ID09PSBjdXJzb3JQb3NpdGlvbi5yb3cpIHtcbiAgICAgIC8vIEVuY2xvc2luZyByYW5nZSB3YXMgcmV0dXJuZWRcbiAgICAgIC8vIFdlIG1vdmUgdG8gc3RhcnQoIG9wZW4tcGFpciApIG9ubHkgd2hlbiBjbG9zZS1wYWlyIHdhcyBhdCBzYW1lIHJvdyBhcyBjdXJzb3Itcm93LlxuICAgICAgcmV0dXJuIHN0YXJ0XG4gICAgfVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBNb3Rpb24sXG4gIEN1cnJlbnRTZWxlY3Rpb24sXG4gIE1vdmVMZWZ0LFxuICBNb3ZlUmlnaHQsXG4gIE1vdmVSaWdodEJ1ZmZlckNvbHVtbixcbiAgTW92ZVVwLFxuICBNb3ZlVXBXcmFwLFxuICBNb3ZlRG93bixcbiAgTW92ZURvd25XcmFwLFxuICBNb3ZlVXBTY3JlZW4sXG4gIE1vdmVEb3duU2NyZWVuLFxuICBNb3ZlVXBUb0VkZ2UsXG4gIE1vdmVEb3duVG9FZGdlLFxuICBXb3JkTW90aW9uLFxuICBNb3ZlVG9OZXh0V29yZCxcbiAgTW92ZVRvTmV4dFdob2xlV29yZCxcbiAgTW92ZVRvTmV4dEFscGhhbnVtZXJpY1dvcmQsXG4gIE1vdmVUb05leHRTbWFydFdvcmQsXG4gIE1vdmVUb05leHRTdWJ3b3JkLFxuICBNb3ZlVG9QcmV2aW91c1dvcmQsXG4gIE1vdmVUb1ByZXZpb3VzV2hvbGVXb3JkLFxuICBNb3ZlVG9QcmV2aW91c0FscGhhbnVtZXJpY1dvcmQsXG4gIE1vdmVUb1ByZXZpb3VzU21hcnRXb3JkLFxuICBNb3ZlVG9QcmV2aW91c1N1YndvcmQsXG4gIE1vdmVUb0VuZE9mV29yZCxcbiAgTW92ZVRvRW5kT2ZXaG9sZVdvcmQsXG4gIE1vdmVUb0VuZE9mQWxwaGFudW1lcmljV29yZCxcbiAgTW92ZVRvRW5kT2ZTbWFydFdvcmQsXG4gIE1vdmVUb0VuZE9mU3Vid29yZCxcbiAgTW92ZVRvUHJldmlvdXNFbmRPZldvcmQsXG4gIE1vdmVUb1ByZXZpb3VzRW5kT2ZXaG9sZVdvcmQsXG4gIE1vdmVUb05leHRTZW50ZW5jZSxcbiAgTW92ZVRvUHJldmlvdXNTZW50ZW5jZSxcbiAgTW92ZVRvTmV4dFNlbnRlbmNlU2tpcEJsYW5rUm93LFxuICBNb3ZlVG9QcmV2aW91c1NlbnRlbmNlU2tpcEJsYW5rUm93LFxuICBNb3ZlVG9OZXh0UGFyYWdyYXBoLFxuICBNb3ZlVG9QcmV2aW91c1BhcmFncmFwaCxcbiAgTW92ZVRvQmVnaW5uaW5nT2ZMaW5lLFxuICBNb3ZlVG9Db2x1bW4sXG4gIE1vdmVUb0xhc3RDaGFyYWN0ZXJPZkxpbmUsXG4gIE1vdmVUb0xhc3ROb25ibGFua0NoYXJhY3Rlck9mTGluZUFuZERvd24sXG4gIE1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lLFxuICBNb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZVVwLFxuICBNb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZURvd24sXG4gIE1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lQW5kRG93bixcbiAgTW92ZVRvU2NyZWVuQ29sdW1uLFxuICBNb3ZlVG9CZWdpbm5pbmdPZlNjcmVlbkxpbmUsXG4gIE1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZTY3JlZW5MaW5lLFxuICBNb3ZlVG9MYXN0Q2hhcmFjdGVyT2ZTY3JlZW5MaW5lLFxuICBNb3ZlVG9GaXJzdExpbmUsXG4gIE1vdmVUb0xhc3RMaW5lLFxuICBNb3ZlVG9MaW5lQnlQZXJjZW50LFxuICBNb3ZlVG9SZWxhdGl2ZUxpbmUsXG4gIE1vdmVUb1JlbGF0aXZlTGluZU1pbmltdW1Ud28sXG4gIE1vdmVUb1RvcE9mU2NyZWVuLFxuICBNb3ZlVG9NaWRkbGVPZlNjcmVlbixcbiAgTW92ZVRvQm90dG9tT2ZTY3JlZW4sXG4gIFNjcm9sbCxcbiAgU2Nyb2xsRnVsbFNjcmVlbkRvd24sXG4gIFNjcm9sbEZ1bGxTY3JlZW5VcCxcbiAgU2Nyb2xsSGFsZlNjcmVlbkRvd24sXG4gIFNjcm9sbEhhbGZTY3JlZW5VcCxcbiAgU2Nyb2xsUXVhcnRlclNjcmVlbkRvd24sXG4gIFNjcm9sbFF1YXJ0ZXJTY3JlZW5VcCxcbiAgRmluZCxcbiAgRmluZEJhY2t3YXJkcyxcbiAgVGlsbCxcbiAgVGlsbEJhY2t3YXJkcyxcbiAgTW92ZVRvTWFyayxcbiAgTW92ZVRvTWFya0xpbmUsXG4gIE1vdmVUb1ByZXZpb3VzRm9sZFN0YXJ0LFxuICBNb3ZlVG9OZXh0Rm9sZFN0YXJ0LFxuICBNb3ZlVG9QcmV2aW91c0ZvbGRTdGFydFdpdGhTYW1lSW5kZW50LFxuICBNb3ZlVG9OZXh0Rm9sZFN0YXJ0V2l0aFNhbWVJbmRlbnQsXG4gIE1vdmVUb1ByZXZpb3VzRm9sZEVuZCxcbiAgTW92ZVRvTmV4dEZvbGRFbmQsXG4gIE1vdmVUb1ByZXZpb3VzRnVuY3Rpb24sXG4gIE1vdmVUb05leHRGdW5jdGlvbixcbiAgTW92ZVRvUHJldmlvdXNGdW5jdGlvbkFuZFJlZHJhd0N1cnNvckxpbmVBdFVwcGVyTWlkZGxlLFxuICBNb3ZlVG9OZXh0RnVuY3Rpb25BbmRSZWRyYXdDdXJzb3JMaW5lQXRVcHBlck1pZGRsZSxcbiAgTW92ZVRvUG9zaXRpb25CeVNjb3BlLFxuICBNb3ZlVG9QcmV2aW91c1N0cmluZyxcbiAgTW92ZVRvTmV4dFN0cmluZyxcbiAgTW92ZVRvUHJldmlvdXNOdW1iZXIsXG4gIE1vdmVUb05leHROdW1iZXIsXG4gIE1vdmVUb05leHRPY2N1cnJlbmNlLFxuICBNb3ZlVG9QcmV2aW91c09jY3VycmVuY2UsXG4gIE1vdmVUb1BhaXIsXG59XG4iXX0=