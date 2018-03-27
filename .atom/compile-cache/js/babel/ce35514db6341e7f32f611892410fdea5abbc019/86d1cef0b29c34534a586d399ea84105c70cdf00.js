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
        while (count++ < 0) {
          row = this.getFoldStartRowForRow(row == null ? cursor.getBufferRow() : row - 1);
          if (row <= 0) break;
        }
      } else {
        var maxRow = this.getVimLastBufferRow();
        while (count-- > 0) {
          row = this.getFoldEndRowForRow(row == null ? cursor.getBufferRow() : row + 1);
          if (row >= maxRow) break;
        }
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
      var _this19 = this;

      var foldRanges = this.utils.getCodeFoldRanges(this.editor);
      this.rows = foldRanges.map(function (range) {
        return range[_this19.which].row;
      }).sort(function (a, b) {
        return a - b;
      });
      if (this.direction === "previous") this.rows.reverse();
      _get(Object.getPrototypeOf(MoveToPreviousFoldStart.prototype), "execute", this).call(this);
    }
  }, {
    key: "getScanRows",
    value: function getScanRows(cursor) {
      if (this.direction === "previous") {
        return this.rows.filter(function (row) {
          return row < cursor.getBufferRow();
        });
      } else {
        return this.rows.filter(function (row) {
          return row > cursor.getBufferRow();
        });
      }
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
      var _this21 = this;

      var baseIndentLevel = this.editor.indentationForBufferRow(cursor.getBufferRow());
      return this.getScanRows(cursor).find(function (row) {
        return _this21.editor.indentationForBufferRow(row) === baseIndentLevel;
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
      var _this22 = this;

      return this.getScanRows(cursor).find(function (row) {
        return _this22.utils.isIncludeFunctionScopeForRow(_this22.editor, row);
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
      var _this23 = this;

      this.moveCursorCountTimes(cursor, function () {
        var cursorPosition = cursor.getBufferPosition();
        var point = _this23.utils.detectScopeStartPositionForScope(_this23.editor, cursorPosition, _this23.direction, _this23.scope);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL21vdGlvbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxXQUFXLENBQUE7Ozs7Ozs7Ozs7ZUFFWSxPQUFPLENBQUMsTUFBTSxDQUFDOztJQUEvQixLQUFLLFlBQUwsS0FBSztJQUFFLEtBQUssWUFBTCxLQUFLOztBQUVuQixJQUFNLElBQUksR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUE7O0lBRXhCLE1BQU07WUFBTixNQUFNOztXQUFOLE1BQU07MEJBQU4sTUFBTTs7K0JBQU4sTUFBTTs7U0FJVixRQUFRLEdBQUcsSUFBSTtTQUNmLFNBQVMsR0FBRyxLQUFLO1NBQ2pCLElBQUksR0FBRyxlQUFlO1NBQ3RCLElBQUksR0FBRyxLQUFLO1NBQ1osY0FBYyxHQUFHLEtBQUs7U0FDdEIsYUFBYSxHQUFHLElBQUk7U0FDcEIscUJBQXFCLEdBQUcsS0FBSztTQUM3QixlQUFlLEdBQUcsS0FBSztTQUN2QixZQUFZLEdBQUcsS0FBSztTQUNwQixtQkFBbUIsR0FBRyxJQUFJOzs7OztlQWJ0QixNQUFNOztXQWVILG1CQUFHO0FBQ1IsYUFBTyxDQUFDLElBQUksQ0FBQyxZQUFZLElBQUksSUFBSSxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUE7S0FDaEQ7OztXQUVTLHNCQUFHO0FBQ1gsYUFBTyxJQUFJLENBQUMsSUFBSSxLQUFLLFVBQVUsQ0FBQTtLQUNoQzs7O1dBRVUsdUJBQUc7QUFDWixhQUFPLElBQUksQ0FBQyxJQUFJLEtBQUssV0FBVyxDQUFBO0tBQ2pDOzs7V0FFUSxtQkFBQyxJQUFJLEVBQUU7QUFDZCxVQUFJLElBQUksS0FBSyxlQUFlLEVBQUU7QUFDNUIsWUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsSUFBSSxLQUFLLFVBQVUsR0FBRyxLQUFLLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFBO09BQ3BFO0FBQ0QsVUFBSSxD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QkFBcUIsRUFBckIscUJBQXFCO0FBQ3JCLG1CQUFpQixFQUFqQixpQkFBaUI7QUFDakIsd0JBQXNCLEVBQXRCLHNCQUFzQjtBQUN0QixvQkFBa0IsRUFBbEIsa0JBQWtCO0FBQ2xCLHdEQUFzRCxFQUF0RCxzREFBc0Q7QUFDdEQsb0RBQWtELEVBQWxELGtEQUFrRDtBQUNsRCx1QkFBcUIsRUFBckIscUJBQXFCO0FBQ3JCLHNCQUFvQixFQUFwQixvQkFBb0I7QUFDcEIsa0JBQWdCLEVBQWhCLGdCQUFnQjtBQUNoQixzQkFBb0IsRUFBcEIsb0JBQW9CO0FBQ3BCLGtCQUFnQixFQUFoQixnQkFBZ0I7QUFDaEIsc0JBQW9CLEVBQXBCLG9CQUFvQjtBQUNwQiwwQkFBd0IsRUFBeEIsd0JBQXdCO0FBQ3hCLFlBQVUsRUFBVixVQUFVO0NBQ1gsQ0FBQSIsImZpbGUiOiIvVXNlcnMvdGxhbmRhdS9kb3RmaWxlcy8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi9tb3Rpb24uanMiLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBiYWJlbFwiXG5cbmNvbnN0IHtQb2ludCwgUmFuZ2V9ID0gcmVxdWlyZShcImF0b21cIilcblxuY29uc3QgQmFzZSA9IHJlcXVpcmUoXCIuL2Jhc2VcIilcblxuY2xhc3MgTW90aW9uIGV4dGVuZHMgQmFzZSB7XG4gIHN0YXRpYyBvcGVyYXRpb25LaW5kID0gXCJtb3Rpb25cIlxuICBzdGF0aWMgY29tbWFuZCA9IGZhbHNlXG5cbiAgb3BlcmF0b3IgPSBudWxsXG4gIGluY2x1c2l2ZSA9IGZhbHNlXG4gIHdpc2UgPSBcImNoYXJhY3Rlcndpc2VcIlxuICBqdW1wID0gZmFsc2VcbiAgdmVydGljYWxNb3Rpb24gPSBmYWxzZVxuICBtb3ZlU3VjY2VlZGVkID0gbnVsbFxuICBtb3ZlU3VjY2Vzc09uTGluZXdpc2UgPSBmYWxzZVxuICBzZWxlY3RTdWNjZWVkZWQgPSBmYWxzZVxuICByZXF1aXJlSW5wdXQgPSBmYWxzZVxuICBjYXNlU2Vuc2l0aXZpdHlLaW5kID0gbnVsbFxuXG4gIGlzUmVhZHkoKSB7XG4gICAgcmV0dXJuICF0aGlzLnJlcXVpcmVJbnB1dCB8fCB0aGlzLmlucHV0ICE9IG51bGxcbiAgfVxuXG4gIGlzTGluZXdpc2UoKSB7XG4gICAgcmV0dXJuIHRoaXMud2lzZSA9PT0gXCJsaW5ld2lzZVwiXG4gIH1cblxuICBpc0Jsb2Nrd2lzZSgpIHtcbiAgICByZXR1cm4gdGhpcy53aXNlID09PSBcImJsb2Nrd2lzZVwiXG4gIH1cblxuICBmb3JjZVdpc2Uod2lzZSkge1xuICAgIGlmICh3aXNlID09PSBcImNoYXJhY3Rlcndpc2VcIikge1xuICAgICAgdGhpcy5pbmNsdXNpdmUgPSB0aGlzLndpc2UgPT09IFwibGluZXdpc2VcIiA/IGZhbHNlIDogIXRoaXMuaW5jbHVzaXZlXG4gICAgfVxuICAgIHRoaXMud2lzZSA9IHdpc2VcbiAgfVxuXG4gIHJlc2V0U3RhdGUoKSB7XG4gICAgdGhpcy5zZWxlY3RTdWNjZWVkZWQgPSBmYWxzZVxuICB9XG5cbiAgbW92ZVdpdGhTYXZlSnVtcChjdXJzb3IpIHtcbiAgICBjb25zdCBvcmlnaW5hbFBvc2l0aW9uID0gdGhpcy5qdW1wICYmIGN1cnNvci5pc0xhc3RDdXJzb3IoKSA/IGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpIDogdW5kZWZpbmVkXG5cbiAgICB0aGlzLm1vdmVDdXJzb3IoY3Vyc29yKVxuXG4gICAgaWYgKG9yaWdpbmFsUG9zaXRpb24gJiYgIWN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpLmlzRXF1YWwob3JpZ2luYWxQb3NpdGlvbikpIHtcbiAgICAgIHRoaXMudmltU3RhdGUubWFyay5zZXQoXCJgXCIsIG9yaWdpbmFsUG9zaXRpb24pXG4gICAgICB0aGlzLnZpbVN0YXRlLm1hcmsuc2V0KFwiJ1wiLCBvcmlnaW5hbFBvc2l0aW9uKVxuICAgIH1cbiAgfVxuXG4gIGV4ZWN1dGUoKSB7XG4gICAgaWYgKHRoaXMub3BlcmF0b3IpIHtcbiAgICAgIHRoaXMuc2VsZWN0KClcbiAgICB9IGVsc2Uge1xuICAgICAgZm9yIChjb25zdCBjdXJzb3Igb2YgdGhpcy5lZGl0b3IuZ2V0Q3Vyc29ycygpKSB7XG4gICAgICAgIHRoaXMubW92ZVdpdGhTYXZlSnVtcChjdXJzb3IpXG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuZWRpdG9yLm1lcmdlQ3Vyc29ycygpXG4gICAgdGhpcy5lZGl0b3IubWVyZ2VJbnRlcnNlY3RpbmdTZWxlY3Rpb25zKClcbiAgfVxuXG4gIC8vIE5PVEU6IHNlbGVjdGlvbiBpcyBhbHJlYWR5IFwibm9ybWFsaXplZFwiIGJlZm9yZSB0aGlzIGZ1bmN0aW9uIGlzIGNhbGxlZC5cbiAgc2VsZWN0KCkge1xuICAgIC8vIG5lZWQgdG8gY2FyZSB3YXMgdmlzdWFsIGZvciBgLmAgcmVwZWF0ZWQuXG4gICAgY29uc3QgaXNPcldhc1Zpc3VhbCA9IHRoaXMub3BlcmF0b3IuaW5zdGFuY2VvZihcIlNlbGVjdEJhc2VcIikgfHwgdGhpcy5uYW1lID09PSBcIkN1cnJlbnRTZWxlY3Rpb25cIlxuXG4gICAgZm9yIChjb25zdCBzZWxlY3Rpb24gb2YgdGhpcy5lZGl0b3IuZ2V0U2VsZWN0aW9ucygpKSB7XG4gICAgICBzZWxlY3Rpb24ubW9kaWZ5U2VsZWN0aW9uKCgpID0+IHRoaXMubW92ZVdpdGhTYXZlSnVtcChzZWxlY3Rpb24uY3Vyc29yKSlcblxuICAgICAgY29uc3Qgc2VsZWN0U3VjY2VlZGVkID1cbiAgICAgICAgdGhpcy5tb3ZlU3VjY2VlZGVkICE9IG51bGxcbiAgICAgICAgICA/IHRoaXMubW92ZVN1Y2NlZWRlZFxuICAgICAgICAgIDogIXNlbGVjdGlvbi5pc0VtcHR5KCkgfHwgKHRoaXMuaXNMaW5ld2lzZSgpICYmIHRoaXMubW92ZVN1Y2Nlc3NPbkxpbmV3aXNlKVxuICAgICAgaWYgKCF0aGlzLnNlbGVjdFN1Y2NlZWRlZCkgdGhpcy5zZWxlY3RTdWNjZWVkZWQgPSBzZWxlY3RTdWNjZWVkZWRcblxuICAgICAgaWYgKGlzT3JXYXNWaXN1YWwgfHwgKHNlbGVjdFN1Y2NlZWRlZCAmJiAodGhpcy5pbmNsdXNpdmUgfHwgdGhpcy5pc0xpbmV3aXNlKCkpKSkge1xuICAgICAgICBjb25zdCAkc2VsZWN0aW9uID0gdGhpcy5zd3JhcChzZWxlY3Rpb24pXG4gICAgICAgICRzZWxlY3Rpb24uc2F2ZVByb3BlcnRpZXModHJ1ZSkgLy8gc2F2ZSBwcm9wZXJ0eSBvZiBcImFscmVhZHktbm9ybWFsaXplZC1zZWxlY3Rpb25cIlxuICAgICAgICAkc2VsZWN0aW9uLmFwcGx5V2lzZSh0aGlzLndpc2UpXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHRoaXMud2lzZSA9PT0gXCJibG9ja3dpc2VcIikge1xuICAgICAgdGhpcy52aW1TdGF0ZS5nZXRMYXN0QmxvY2t3aXNlU2VsZWN0aW9uKCkuYXV0b3Njcm9sbCgpXG4gICAgfVxuICB9XG5cbiAgc2V0Q3Vyc29yQnVmZmVyUm93KGN1cnNvciwgcm93LCBvcHRpb25zKSB7XG4gICAgaWYgKHRoaXMudmVydGljYWxNb3Rpb24gJiYgIXRoaXMuZ2V0Q29uZmlnKFwic3RheU9uVmVydGljYWxNb3Rpb25cIikpIHtcbiAgICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbih0aGlzLmdldEZpcnN0Q2hhcmFjdGVyUG9zaXRpb25Gb3JCdWZmZXJSb3cocm93KSwgb3B0aW9ucylcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy51dGlscy5zZXRCdWZmZXJSb3coY3Vyc29yLCByb3csIG9wdGlvbnMpXG4gICAgfVxuICB9XG5cbiAgLy8gQ2FsbCBjYWxsYmFjayBjb3VudCB0aW1lcy5cbiAgLy8gQnV0IGJyZWFrIGl0ZXJhdGlvbiB3aGVuIGN1cnNvciBwb3NpdGlvbiBkaWQgbm90IGNoYW5nZSBiZWZvcmUvYWZ0ZXIgY2FsbGJhY2suXG4gIG1vdmVDdXJzb3JDb3VudFRpbWVzKGN1cnNvciwgZm4pIHtcbiAgICBsZXQgb2xkUG9zaXRpb24gPSBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuICAgIHRoaXMuY291bnRUaW1lcyh0aGlzLmdldENvdW50KCksIHN0YXRlID0+IHtcbiAgICAgIGZuKHN0YXRlKVxuICAgICAgY29uc3QgbmV3UG9zaXRpb24gPSBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuICAgICAgaWYgKG5ld1Bvc2l0aW9uLmlzRXF1YWwob2xkUG9zaXRpb24pKSBzdGF0ZS5zdG9wKClcbiAgICAgIG9sZFBvc2l0aW9uID0gbmV3UG9zaXRpb25cbiAgICB9KVxuICB9XG5cbiAgaXNDYXNlU2Vuc2l0aXZlKHRlcm0pIHtcbiAgICByZXR1cm4gdGhpcy5nZXRDb25maWcoYHVzZVNtYXJ0Y2FzZUZvciR7dGhpcy5jYXNlU2Vuc2l0aXZpdHlLaW5kfWApXG4gICAgICA/IHRlcm0uc2VhcmNoKC9bQS1aXS8pICE9PSAtMVxuICAgICAgOiAhdGhpcy5nZXRDb25maWcoYGlnbm9yZUNhc2VGb3Ike3RoaXMuY2FzZVNlbnNpdGl2aXR5S2luZH1gKVxuICB9XG5cbiAgZ2V0Rmlyc3RPckxhc3RQb2ludChkaXJlY3Rpb24pIHtcbiAgICByZXR1cm4gZGlyZWN0aW9uID09PSBcIm5leHRcIiA/IHRoaXMuZ2V0VmltRW9mQnVmZmVyUG9zaXRpb24oKSA6IG5ldyBQb2ludCgwLCAwKVxuICB9XG59XG5cbi8vIFVzZWQgYXMgb3BlcmF0b3IncyB0YXJnZXQgaW4gdmlzdWFsLW1vZGUuXG5jbGFzcyBDdXJyZW50U2VsZWN0aW9uIGV4dGVuZHMgTW90aW9uIHtcbiAgc3RhdGljIGNvbW1hbmQgPSBmYWxzZVxuICBzZWxlY3Rpb25FeHRlbnQgPSBudWxsXG4gIGJsb2Nrd2lzZVNlbGVjdGlvbkV4dGVudCA9IG51bGxcbiAgaW5jbHVzaXZlID0gdHJ1ZVxuICBwb2ludEluZm9CeUN1cnNvciA9IG5ldyBNYXAoKVxuXG4gIG1vdmVDdXJzb3IoY3Vyc29yKSB7XG4gICAgaWYgKHRoaXMubW9kZSA9PT0gXCJ2aXN1YWxcIikge1xuICAgICAgdGhpcy5zZWxlY3Rpb25FeHRlbnQgPSB0aGlzLmlzQmxvY2t3aXNlKClcbiAgICAgICAgPyB0aGlzLnN3cmFwKGN1cnNvci5zZWxlY3Rpb24pLmdldEJsb2Nrd2lzZVNlbGVjdGlvbkV4dGVudCgpXG4gICAgICAgIDogdGhpcy5lZGl0b3IuZ2V0U2VsZWN0ZWRCdWZmZXJSYW5nZSgpLmdldEV4dGVudCgpXG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIGAuYCByZXBlYXQgY2FzZVxuICAgICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpLnRyYW5zbGF0ZSh0aGlzLnNlbGVjdGlvbkV4dGVudCkpXG4gICAgfVxuICB9XG5cbiAgc2VsZWN0KCkge1xuICAgIGlmICh0aGlzLm1vZGUgPT09IFwidmlzdWFsXCIpIHtcbiAgICAgIHN1cGVyLnNlbGVjdCgpXG4gICAgfSBlbHNlIHtcbiAgICAgIGZvciAoY29uc3QgY3Vyc29yIG9mIHRoaXMuZWRpdG9yLmdldEN1cnNvcnMoKSkge1xuICAgICAgICBjb25zdCBwb2ludEluZm8gPSB0aGlzLnBvaW50SW5mb0J5Q3Vyc29yLmdldChjdXJzb3IpXG4gICAgICAgIGlmIChwb2ludEluZm8pIHtcbiAgICAgICAgICBjb25zdCB7Y3Vyc29yUG9zaXRpb24sIHN0YXJ0T2ZTZWxlY3Rpb259ID0gcG9pbnRJbmZvXG4gICAgICAgICAgaWYgKGN1cnNvclBvc2l0aW9uLmlzRXF1YWwoY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKCkpKSB7XG4gICAgICAgICAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24oc3RhcnRPZlNlbGVjdGlvbilcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHN1cGVyLnNlbGVjdCgpXG4gICAgfVxuXG4gICAgLy8gKiBQdXJwb3NlIG9mIHBvaW50SW5mb0J5Q3Vyc29yPyBzZWUgIzIzNSBmb3IgZGV0YWlsLlxuICAgIC8vIFdoZW4gc3RheU9uVHJhbnNmb3JtU3RyaW5nIGlzIGVuYWJsZWQsIGN1cnNvciBwb3MgaXMgbm90IHNldCBvbiBzdGFydCBvZlxuICAgIC8vIG9mIHNlbGVjdGVkIHJhbmdlLlxuICAgIC8vIEJ1dCBJIHdhbnQgZm9sbG93aW5nIGJlaGF2aW9yLCBzbyBuZWVkIHRvIHByZXNlcnZlIHBvc2l0aW9uIGluZm8uXG4gICAgLy8gIDEuIGB2aj4uYCAtPiBpbmRlbnQgc2FtZSB0d28gcm93cyByZWdhcmRsZXNzIG9mIGN1cnJlbnQgY3Vyc29yJ3Mgcm93LlxuICAgIC8vICAyLiBgdmo+ai5gIC0+IGluZGVudCB0d28gcm93cyBmcm9tIGN1cnNvcidzIHJvdy5cbiAgICBmb3IgKGNvbnN0IGN1cnNvciBvZiB0aGlzLmVkaXRvci5nZXRDdXJzb3JzKCkpIHtcbiAgICAgIGNvbnN0IHN0YXJ0T2ZTZWxlY3Rpb24gPSBjdXJzb3Iuc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKCkuc3RhcnRcbiAgICAgIHRoaXMub25EaWRGaW5pc2hPcGVyYXRpb24oKCkgPT4ge1xuICAgICAgICBjdXJzb3JQb3NpdGlvbiA9IGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXG4gICAgICAgIHRoaXMucG9pbnRJbmZvQnlDdXJzb3Iuc2V0KGN1cnNvciwge3N0YXJ0T2ZTZWxlY3Rpb24sIGN1cnNvclBvc2l0aW9ufSlcbiAgICAgIH0pXG4gICAgfVxuICB9XG59XG5cbmNsYXNzIE1vdmVMZWZ0IGV4dGVuZHMgTW90aW9uIHtcbiAgbW92ZUN1cnNvcihjdXJzb3IpIHtcbiAgICBjb25zdCBhbGxvd1dyYXAgPSB0aGlzLmdldENvbmZpZyhcIndyYXBMZWZ0UmlnaHRNb3Rpb25cIilcbiAgICB0aGlzLm1vdmVDdXJzb3JDb3VudFRpbWVzKGN1cnNvciwgKCkgPT4gdGhpcy51dGlscy5tb3ZlQ3Vyc29yTGVmdChjdXJzb3IsIHthbGxvd1dyYXB9KSlcbiAgfVxufVxuXG5jbGFzcyBNb3ZlUmlnaHQgZXh0ZW5kcyBNb3Rpb24ge1xuICBtb3ZlQ3Vyc29yKGN1cnNvcikge1xuICAgIGNvbnN0IGFsbG93V3JhcCA9IHRoaXMuZ2V0Q29uZmlnKFwid3JhcExlZnRSaWdodE1vdGlvblwiKVxuXG4gICAgdGhpcy5tb3ZlQ3Vyc29yQ291bnRUaW1lcyhjdXJzb3IsICgpID0+IHtcbiAgICAgIHRoaXMuZWRpdG9yLnVuZm9sZEJ1ZmZlclJvdyhjdXJzb3IuZ2V0QnVmZmVyUm93KCkpXG5cbiAgICAgIC8vIC0gV2hlbiBgd3JhcExlZnRSaWdodE1vdGlvbmAgZW5hYmxlZCBhbmQgZXhlY3V0ZWQgYXMgcHVyZS1tb3Rpb24gaW4gYG5vcm1hbC1tb2RlYCxcbiAgICAgIC8vICAgd2UgbmVlZCB0byBtb3ZlICoqYWdhaW4qKiB0byB3cmFwIHRvIG5leHQtbGluZSBpZiBpdCByYWNoZWQgdG8gRU9MLlxuICAgICAgLy8gLSBFeHByZXNzaW9uIGAhdGhpcy5vcGVyYXRvcmAgbWVhbnMgbm9ybWFsLW1vZGUgbW90aW9uLlxuICAgICAgLy8gLSBFeHByZXNzaW9uIGB0aGlzLm1vZGUgPT09IFwibm9ybWFsXCJgIGlzIG5vdCBhcHByb3ByZWF0ZSBzaW5jZSBpdCBtYXRjaGVzIGB4YCBvcGVyYXRvcidzIHRhcmdldCBjYXNlLlxuICAgICAgY29uc3QgbmVlZE1vdmVBZ2FpbiA9IGFsbG93V3JhcCAmJiAhdGhpcy5vcGVyYXRvciAmJiAhY3Vyc29yLmlzQXRFbmRPZkxpbmUoKVxuXG4gICAgICB0aGlzLnV0aWxzLm1vdmVDdXJzb3JSaWdodChjdXJzb3IsIHthbGxvd1dyYXB9KVxuXG4gICAgICBpZiAobmVlZE1vdmVBZ2FpbiAmJiBjdXJzb3IuaXNBdEVuZE9mTGluZSgpKSB7XG4gICAgICAgIHRoaXMudXRpbHMubW92ZUN1cnNvclJpZ2h0KGN1cnNvciwge2FsbG93V3JhcH0pXG4gICAgICB9XG4gICAgfSlcbiAgfVxufVxuXG5jbGFzcyBNb3ZlUmlnaHRCdWZmZXJDb2x1bW4gZXh0ZW5kcyBNb3Rpb24ge1xuICBzdGF0aWMgY29tbWFuZCA9IGZhbHNlXG4gIG1vdmVDdXJzb3IoY3Vyc29yKSB7XG4gICAgdGhpcy51dGlscy5zZXRCdWZmZXJDb2x1bW4oY3Vyc29yLCBjdXJzb3IuZ2V0QnVmZmVyQ29sdW1uKCkgKyB0aGlzLmdldENvdW50KCkpXG4gIH1cbn1cblxuY2xhc3MgTW92ZVVwIGV4dGVuZHMgTW90aW9uIHtcbiAgd2lzZSA9IFwibGluZXdpc2VcIlxuICB3cmFwID0gZmFsc2VcbiAgZGlyZWN0aW9uID0gXCJ1cFwiXG5cbiAgZ2V0QnVmZmVyUm93KHJvdykge1xuICAgIGNvbnN0IG1pbiA9IDBcbiAgICBjb25zdCBtYXggPSB0aGlzLmdldFZpbUxhc3RCdWZmZXJSb3coKVxuXG4gICAgaWYgKHRoaXMuZGlyZWN0aW9uID09PSBcInVwXCIpIHtcbiAgICAgIHJvdyA9IHRoaXMuZ2V0Rm9sZFN0YXJ0Um93Rm9yUm93KHJvdykgLSAxXG4gICAgICByb3cgPSB0aGlzLndyYXAgJiYgcm93IDwgbWluID8gbWF4IDogdGhpcy5saW1pdE51bWJlcihyb3csIHttaW59KVxuICAgIH0gZWxzZSB7XG4gICAgICByb3cgPSB0aGlzLmdldEZvbGRFbmRSb3dGb3JSb3cocm93KSArIDFcbiAgICAgIHJvdyA9IHRoaXMud3JhcCAmJiByb3cgPiBtYXggPyBtaW4gOiB0aGlzLmxpbWl0TnVtYmVyKHJvdywge21heH0pXG4gICAgfVxuICAgIHJldHVybiB0aGlzLmdldEZvbGRTdGFydFJvd0ZvclJvdyhyb3cpXG4gIH1cblxuICBtb3ZlQ3Vyc29yKGN1cnNvcikge1xuICAgIHRoaXMubW92ZUN1cnNvckNvdW50VGltZXMoY3Vyc29yLCAoKSA9PiB0aGlzLnV0aWxzLnNldEJ1ZmZlclJvdyhjdXJzb3IsIHRoaXMuZ2V0QnVmZmVyUm93KGN1cnNvci5nZXRCdWZmZXJSb3coKSkpKVxuICB9XG59XG5cbmNsYXNzIE1vdmVVcFdyYXAgZXh0ZW5kcyBNb3ZlVXAge1xuICB3cmFwID0gdHJ1ZVxufVxuXG5jbGFzcyBNb3ZlRG93biBleHRlbmRzIE1vdmVVcCB7XG4gIGRpcmVjdGlvbiA9IFwiZG93blwiXG59XG5cbmNsYXNzIE1vdmVEb3duV3JhcCBleHRlbmRzIE1vdmVEb3duIHtcbiAgd3JhcCA9IHRydWVcbn1cblxuY2xhc3MgTW92ZVVwU2NyZWVuIGV4dGVuZHMgTW90aW9uIHtcbiAgd2lzZSA9IFwibGluZXdpc2VcIlxuICBkaXJlY3Rpb24gPSBcInVwXCJcbiAgbW92ZUN1cnNvcihjdXJzb3IpIHtcbiAgICB0aGlzLm1vdmVDdXJzb3JDb3VudFRpbWVzKGN1cnNvciwgKCkgPT4gdGhpcy51dGlscy5tb3ZlQ3Vyc29yVXBTY3JlZW4oY3Vyc29yKSlcbiAgfVxufVxuXG5jbGFzcyBNb3ZlRG93blNjcmVlbiBleHRlbmRzIE1vdmVVcFNjcmVlbiB7XG4gIHdpc2UgPSBcImxpbmV3aXNlXCJcbiAgZGlyZWN0aW9uID0gXCJkb3duXCJcbiAgbW92ZUN1cnNvcihjdXJzb3IpIHtcbiAgICB0aGlzLm1vdmVDdXJzb3JDb3VudFRpbWVzKGN1cnNvciwgKCkgPT4gdGhpcy51dGlscy5tb3ZlQ3Vyc29yRG93blNjcmVlbihjdXJzb3IpKVxuICB9XG59XG5cbmNsYXNzIE1vdmVVcFRvRWRnZSBleHRlbmRzIE1vdGlvbiB7XG4gIHdpc2UgPSBcImxpbmV3aXNlXCJcbiAganVtcCA9IHRydWVcbiAgZGlyZWN0aW9uID0gXCJwcmV2aW91c1wiXG4gIG1vdmVDdXJzb3IoY3Vyc29yKSB7XG4gICAgdGhpcy5tb3ZlQ3Vyc29yQ291bnRUaW1lcyhjdXJzb3IsICgpID0+IHtcbiAgICAgIGNvbnN0IHBvaW50ID0gdGhpcy5nZXRQb2ludChjdXJzb3IuZ2V0U2NyZWVuUG9zaXRpb24oKSlcbiAgICAgIGlmIChwb2ludCkgY3Vyc29yLnNldFNjcmVlblBvc2l0aW9uKHBvaW50KVxuICAgIH0pXG4gIH1cblxuICBnZXRQb2ludChmcm9tUG9pbnQpIHtcbiAgICBjb25zdCB7Y29sdW1uLCByb3c6IHN0YXJ0Um93fSA9IGZyb21Qb2ludFxuICAgIGZvciAoY29uc3Qgcm93IG9mIHRoaXMuZ2V0U2NyZWVuUm93cyh7c3RhcnRSb3csIGRpcmVjdGlvbjogdGhpcy5kaXJlY3Rpb259KSkge1xuICAgICAgY29uc3QgcG9pbnQgPSBuZXcgUG9pbnQocm93LCBjb2x1bW4pXG4gICAgICBpZiAodGhpcy5pc0VkZ2UocG9pbnQpKSByZXR1cm4gcG9pbnRcbiAgICB9XG4gIH1cblxuICBpc0VkZ2UocG9pbnQpIHtcbiAgICAvLyBJZiBwb2ludCBpcyBzdG9wcGFibGUgYW5kIGFib3ZlIG9yIGJlbG93IHBvaW50IGlzIG5vdCBzdG9wcGFibGUsIGl0J3MgRWRnZSFcbiAgICByZXR1cm4gKFxuICAgICAgdGhpcy5pc1N0b3BwYWJsZShwb2ludCkgJiZcbiAgICAgICghdGhpcy5pc1N0b3BwYWJsZShwb2ludC50cmFuc2xhdGUoWy0xLCAwXSkpIHx8ICF0aGlzLmlzU3RvcHBhYmxlKHBvaW50LnRyYW5zbGF0ZShbKzEsIDBdKSkpXG4gICAgKVxuICB9XG5cbiAgaXNTdG9wcGFibGUocG9pbnQpIHtcbiAgICByZXR1cm4gKFxuICAgICAgdGhpcy5pc05vbldoaXRlU3BhY2UocG9pbnQpIHx8XG4gICAgICB0aGlzLmlzRmlyc3RSb3dPckxhc3RSb3dBbmRTdG9wcGFibGUocG9pbnQpIHx8XG4gICAgICAvLyBJZiByaWdodCBvciBsZWZ0IGNvbHVtbiBpcyBub24td2hpdGUtc3BhY2UgY2hhciwgaXQncyBzdG9wcGFibGUuXG4gICAgICAodGhpcy5pc05vbldoaXRlU3BhY2UocG9pbnQudHJhbnNsYXRlKFswLCAtMV0pKSAmJiB0aGlzLmlzTm9uV2hpdGVTcGFjZShwb2ludC50cmFuc2xhdGUoWzAsICsxXSkpKVxuICAgIClcbiAgfVxuXG4gIGlzTm9uV2hpdGVTcGFjZShwb2ludCkge1xuICAgIGNvbnN0IGNoYXIgPSB0aGlzLnV0aWxzLmdldFRleHRJblNjcmVlblJhbmdlKHRoaXMuZWRpdG9yLCBSYW5nZS5mcm9tUG9pbnRXaXRoRGVsdGEocG9pbnQsIDAsIDEpKVxuICAgIHJldHVybiBjaGFyICE9IG51bGwgJiYgL1xcUy8udGVzdChjaGFyKVxuICB9XG5cbiAgaXNGaXJzdFJvd09yTGFzdFJvd0FuZFN0b3BwYWJsZShwb2ludCkge1xuICAgIC8vIEluIG5vdG1hbC1tb2RlLCBjdXJzb3IgaXMgTk9UIHN0b3BwYWJsZSB0byBFT0wgb2Ygbm9uLWJsYW5rIHJvdy5cbiAgICAvLyBTbyBleHBsaWNpdGx5IGd1YXJkIHRvIG5vdCBhbnN3ZXIgaXQgc3RvcHBhYmxlLlxuICAgIGlmICh0aGlzLm1vZGUgPT09IFwibm9ybWFsXCIgJiYgdGhpcy51dGlscy5wb2ludElzQXRFbmRPZkxpbmVBdE5vbkVtcHR5Um93KHRoaXMuZWRpdG9yLCBwb2ludCkpIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cblxuICAgIC8vIElmIGNsaXBwZWQsIGl0IG1lYW5zIHRoYXQgb3JpZ2luYWwgcG9uaXQgd2FzIG5vbiBzdG9wcGFibGUoZS5nLiBwb2ludC5jb2x1bSA+IEVPTCkuXG4gICAgY29uc3Qge3Jvd30gPSBwb2ludFxuICAgIHJldHVybiAocm93ID09PSAwIHx8IHJvdyA9PT0gdGhpcy5nZXRWaW1MYXN0U2NyZWVuUm93KCkpICYmIHBvaW50LmlzRXF1YWwodGhpcy5lZGl0b3IuY2xpcFNjcmVlblBvc2l0aW9uKHBvaW50KSlcbiAgfVxufVxuXG5jbGFzcyBNb3ZlRG93blRvRWRnZSBleHRlbmRzIE1vdmVVcFRvRWRnZSB7XG4gIGRpcmVjdGlvbiA9IFwibmV4dFwiXG59XG5cbi8vIFdvcmQgTW90aW9uIGZhbWlseVxuLy8gKy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0rXG4vLyB8IGRpcmVjdGlvbiB8IHdoaWNoICAgICAgfCB3b3JkICB8IFdPUkQgfCBzdWJ3b3JkIHwgc21hcnR3b3JkIHwgYWxwaGFudW1lcmljIHxcbi8vIHwtLS0tLS0tLS0tLSstLS0tLS0tLS0tLS0rLS0tLS0tLSstLS0tLS0rLS0tLS0tLS0tKy0tLS0tLS0tLS0tKy0tLS0tLS0tLS0tLS0tK1xuLy8gfCBuZXh0ICAgICAgfCB3b3JkLXN0YXJ0IHwgdyAgICAgfCBXICAgIHwgLSAgICAgICB8IC0gICAgICAgICB8IC0gICAgICAgICAgICB8XG4vLyB8IHByZXZpb3VzICB8IHdvcmQtc3RhcnQgfCBiICAgICB8IGIgICAgfCAtICAgICAgIHwgLSAgICAgICAgIHwgLSAgICAgICAgICAgIHxcbi8vIHwgbmV4dCAgICAgIHwgd29yZC1lbmQgICB8IGUgICAgIHwgRSAgICB8IC0gICAgICAgfCAtICAgICAgICAgfCAtICAgICAgICAgICAgfFxuLy8gfCBwcmV2aW91cyAgfCB3b3JkLWVuZCAgIHwgZ2UgICAgfCBnIEUgIHwgbi9hICAgICB8IG4vYSAgICAgICB8IG4vYSAgICAgICAgICB8XG4vLyArLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLStcblxuY2xhc3MgV29yZE1vdGlvbiBleHRlbmRzIE1vdGlvbiB7XG4gIHN0YXRpYyBjb21tYW5kID0gZmFsc2VcbiAgd29yZFJlZ2V4ID0gbnVsbFxuICBza2lwQmxhbmtSb3cgPSBmYWxzZVxuICBza2lwV2hpdGVTcGFjZU9ubHlSb3cgPSBmYWxzZVxuXG4gIG1vdmVDdXJzb3IoY3Vyc29yKSB7XG4gICAgdGhpcy5tb3ZlQ3Vyc29yQ291bnRUaW1lcyhjdXJzb3IsIGNvdW50U3RhdGUgPT4ge1xuICAgICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHRoaXMuZ2V0UG9pbnQoY3Vyc29yLCBjb3VudFN0YXRlKSlcbiAgICB9KVxuICB9XG5cbiAgZ2V0UG9pbnQoY3Vyc29yLCBjb3VudFN0YXRlKSB7XG4gICAgY29uc3Qge2RpcmVjdGlvbn0gPSB0aGlzXG4gICAgbGV0IHt3aGljaH0gPSB0aGlzXG4gICAgY29uc3QgcmVnZXggPSB0aGlzLm5hbWUuZW5kc1dpdGgoXCJTdWJ3b3JkXCIpID8gY3Vyc29yLnN1YndvcmRSZWdFeHAoKSA6IHRoaXMud29yZFJlZ2V4IHx8IGN1cnNvci53b3JkUmVnRXhwKClcblxuICAgIGNvbnN0IG9wdGlvbnMgPSB0aGlzLmJ1aWxkT3B0aW9ucyhjdXJzb3IpXG4gICAgaWYgKGRpcmVjdGlvbiA9PT0gXCJuZXh0XCIgJiYgd2hpY2ggPT09IFwic3RhcnRcIiAmJiB0aGlzLm9wZXJhdG9yICYmIGNvdW50U3RhdGUuaXNGaW5hbCkge1xuICAgICAgLy8gW05PVEVdIEV4Y2VwdGlvbmFsIGJlaGF2aW9yIGZvciB3IGFuZCBXOiBbRGV0YWlsIGluIHZpbSBoZWxwIGA6aGVscCB3YC5dXG4gICAgICAvLyBbY2FzZS1BXSBjdywgY1cgdHJlYXRlZCBhcyBjZSwgY0Ugd2hlbiBjdXJzb3IgaXMgYXQgbm9uLWJsYW5rLlxuICAgICAgLy8gW2Nhc2UtQl0gd2hlbiB3LCBXIHVzZWQgYXMgVEFSR0VULCBpdCBkb2Vzbid0IG1vdmUgb3ZlciBuZXcgbGluZS5cbiAgICAgIGNvbnN0IHtmcm9tfSA9IG9wdGlvbnNcbiAgICAgIGlmICh0aGlzLmlzRW1wdHlSb3coZnJvbS5yb3cpKSByZXR1cm4gW2Zyb20ucm93ICsgMSwgMF1cblxuICAgICAgLy8gW2Nhc2UtQV1cbiAgICAgIGlmICh0aGlzLm9wZXJhdG9yLm5hbWUgPT09IFwiQ2hhbmdlXCIgJiYgIXRoaXMudXRpbHMucG9pbnRJc0F0V2hpdGVTcGFjZSh0aGlzLmVkaXRvciwgZnJvbSkpIHtcbiAgICAgICAgd2hpY2ggPSBcImVuZFwiXG4gICAgICB9XG4gICAgICBjb25zdCBwb2ludCA9IHRoaXMuZmluZFBvaW50KGRpcmVjdGlvbiwgcmVnZXgsIHdoaWNoLCBvcHRpb25zKVxuICAgICAgLy8gW2Nhc2UtQl1cbiAgICAgIHJldHVybiBwb2ludCA/IFBvaW50Lm1pbihwb2ludCwgW2Zyb20ucm93LCBJbmZpbml0eV0pIDogdGhpcy5nZXRGaXJzdE9yTGFzdFBvaW50KGRpcmVjdGlvbilcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuZmluZFBvaW50KGRpcmVjdGlvbiwgcmVnZXgsIHdoaWNoLCBvcHRpb25zKSB8fCB0aGlzLmdldEZpcnN0T3JMYXN0UG9pbnQoZGlyZWN0aW9uKVxuICAgIH1cbiAgfVxuXG4gIGJ1aWxkT3B0aW9ucyhjdXJzb3IpIHtcbiAgICByZXR1cm4ge1xuICAgICAgZnJvbTogY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKCksXG4gICAgICBza2lwRW1wdHlSb3c6IHRoaXMuc2tpcEVtcHR5Um93LFxuICAgICAgc2tpcFdoaXRlU3BhY2VPbmx5Um93OiB0aGlzLnNraXBXaGl0ZVNwYWNlT25seVJvdyxcbiAgICAgIHByZVRyYW5zbGF0ZTogKHRoaXMud2hpY2ggPT09IFwiZW5kXCIgJiYgWzAsICsxXSkgfHwgdW5kZWZpbmVkLFxuICAgICAgcG9zdFRyYW5zbGF0ZTogKHRoaXMud2hpY2ggPT09IFwiZW5kXCIgJiYgWzAsIC0xXSkgfHwgdW5kZWZpbmVkLFxuICAgIH1cbiAgfVxufVxuXG4vLyB3XG5jbGFzcyBNb3ZlVG9OZXh0V29yZCBleHRlbmRzIFdvcmRNb3Rpb24ge1xuICBkaXJlY3Rpb24gPSBcIm5leHRcIlxuICB3aGljaCA9IFwic3RhcnRcIlxufVxuXG4vLyBXXG5jbGFzcyBNb3ZlVG9OZXh0V2hvbGVXb3JkIGV4dGVuZHMgTW92ZVRvTmV4dFdvcmQge1xuICB3b3JkUmVnZXggPSAvXiR8XFxTKy9nXG59XG5cbi8vIG5vLWtleW1hcFxuY2xhc3MgTW92ZVRvTmV4dFN1YndvcmQgZXh0ZW5kcyBNb3ZlVG9OZXh0V29yZCB7fVxuXG4vLyBuby1rZXltYXBcbmNsYXNzIE1vdmVUb05leHRTbWFydFdvcmQgZXh0ZW5kcyBNb3ZlVG9OZXh0V29yZCB7XG4gIHdvcmRSZWdleCA9IC9bXFx3LV0rL2dcbn1cblxuLy8gbm8ta2V5bWFwXG5jbGFzcyBNb3ZlVG9OZXh0QWxwaGFudW1lcmljV29yZCBleHRlbmRzIE1vdmVUb05leHRXb3JkIHtcbiAgd29yZFJlZ2V4ID0gL1xcdysvZ1xufVxuXG4vLyBiXG5jbGFzcyBNb3ZlVG9QcmV2aW91c1dvcmQgZXh0ZW5kcyBXb3JkTW90aW9uIHtcbiAgZGlyZWN0aW9uID0gXCJwcmV2aW91c1wiXG4gIHdoaWNoID0gXCJzdGFydFwiXG4gIHNraXBXaGl0ZVNwYWNlT25seVJvdyA9IHRydWVcbn1cblxuLy8gQlxuY2xhc3MgTW92ZVRvUHJldmlvdXNXaG9sZVdvcmQgZXh0ZW5kcyBNb3ZlVG9QcmV2aW91c1dvcmQge1xuICB3b3JkUmVnZXggPSAvXiR8XFxTKy9nXG59XG5cbi8vIG5vLWtleW1hcFxuY2xhc3MgTW92ZVRvUHJldmlvdXNTdWJ3b3JkIGV4dGVuZHMgTW92ZVRvUHJldmlvdXNXb3JkIHt9XG5cbi8vIG5vLWtleW1hcFxuY2xhc3MgTW92ZVRvUHJldmlvdXNTbWFydFdvcmQgZXh0ZW5kcyBNb3ZlVG9QcmV2aW91c1dvcmQge1xuICB3b3JkUmVnZXggPSAvW1xcdy1dKy9cbn1cblxuLy8gbm8ta2V5bWFwXG5jbGFzcyBNb3ZlVG9QcmV2aW91c0FscGhhbnVtZXJpY1dvcmQgZXh0ZW5kcyBNb3ZlVG9QcmV2aW91c1dvcmQge1xuICB3b3JkUmVnZXggPSAvXFx3Ky9cbn1cblxuLy8gZVxuY2xhc3MgTW92ZVRvRW5kT2ZXb3JkIGV4dGVuZHMgV29yZE1vdGlvbiB7XG4gIGluY2x1c2l2ZSA9IHRydWVcbiAgZGlyZWN0aW9uID0gXCJuZXh0XCJcbiAgd2hpY2ggPSBcImVuZFwiXG4gIHNraXBFbXB0eVJvdyA9IHRydWVcbiAgc2tpcFdoaXRlU3BhY2VPbmx5Um93ID0gdHJ1ZVxufVxuXG4vLyBFXG5jbGFzcyBNb3ZlVG9FbmRPZldob2xlV29yZCBleHRlbmRzIE1vdmVUb0VuZE9mV29yZCB7XG4gIHdvcmRSZWdleCA9IC9cXFMrL2dcbn1cblxuLy8gbm8ta2V5bWFwXG5jbGFzcyBNb3ZlVG9FbmRPZlN1YndvcmQgZXh0ZW5kcyBNb3ZlVG9FbmRPZldvcmQge31cblxuLy8gbm8ta2V5bWFwXG5jbGFzcyBNb3ZlVG9FbmRPZlNtYXJ0V29yZCBleHRlbmRzIE1vdmVUb0VuZE9mV29yZCB7XG4gIHdvcmRSZWdleCA9IC9bXFx3LV0rL2dcbn1cblxuLy8gbm8ta2V5bWFwXG5jbGFzcyBNb3ZlVG9FbmRPZkFscGhhbnVtZXJpY1dvcmQgZXh0ZW5kcyBNb3ZlVG9FbmRPZldvcmQge1xuICB3b3JkUmVnZXggPSAvXFx3Ky9nXG59XG5cbi8vIGdlXG5jbGFzcyBNb3ZlVG9QcmV2aW91c0VuZE9mV29yZCBleHRlbmRzIFdvcmRNb3Rpb24ge1xuICBpbmNsdXNpdmUgPSB0cnVlXG4gIGRpcmVjdGlvbiA9IFwicHJldmlvdXNcIlxuICB3aGljaCA9IFwiZW5kXCJcbiAgc2tpcFdoaXRlU3BhY2VPbmx5Um93ID0gdHJ1ZVxufVxuXG4vLyBnRVxuY2xhc3MgTW92ZVRvUHJldmlvdXNFbmRPZldob2xlV29yZCBleHRlbmRzIE1vdmVUb1ByZXZpb3VzRW5kT2ZXb3JkIHtcbiAgd29yZFJlZ2V4ID0gL1xcUysvZ1xufVxuXG4vLyBTZW50ZW5jZVxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gU2VudGVuY2UgaXMgZGVmaW5lZCBhcyBiZWxvd1xuLy8gIC0gZW5kIHdpdGggWycuJywgJyEnLCAnPyddXG4vLyAgLSBvcHRpb25hbGx5IGZvbGxvd2VkIGJ5IFsnKScsICddJywgJ1wiJywgXCInXCJdXG4vLyAgLSBmb2xsb3dlZCBieSBbJyQnLCAnICcsICdcXHQnXVxuLy8gIC0gcGFyYWdyYXBoIGJvdW5kYXJ5IGlzIGFsc28gc2VudGVuY2UgYm91bmRhcnlcbi8vICAtIHNlY3Rpb24gYm91bmRhcnkgaXMgYWxzbyBzZW50ZW5jZSBib3VuZGFyeShpZ25vcmUpXG5jbGFzcyBNb3ZlVG9OZXh0U2VudGVuY2UgZXh0ZW5kcyBNb3Rpb24ge1xuICBqdW1wID0gdHJ1ZVxuICBzZW50ZW5jZVJlZ2V4ID0gbmV3IFJlZ0V4cChgKD86W1xcXFwuIVxcXFw/XVtcXFxcKVxcXFxdXCInXSpcXFxccyspfChcXFxcbnxcXFxcclxcXFxuKWAsIFwiZ1wiKVxuICBkaXJlY3Rpb24gPSBcIm5leHRcIlxuXG4gIG1vdmVDdXJzb3IoY3Vyc29yKSB7XG4gICAgdGhpcy5tb3ZlQ3Vyc29yQ291bnRUaW1lcyhjdXJzb3IsICgpID0+IHtcbiAgICAgIGNvbnN0IHBvaW50ID1cbiAgICAgICAgdGhpcy5kaXJlY3Rpb24gPT09IFwibmV4dFwiXG4gICAgICAgICAgPyB0aGlzLmdldE5leHRTdGFydE9mU2VudGVuY2UoY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKCkpXG4gICAgICAgICAgOiB0aGlzLmdldFByZXZpb3VzU3RhcnRPZlNlbnRlbmNlKGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpKVxuICAgICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHBvaW50IHx8IHRoaXMuZ2V0Rmlyc3RPckxhc3RQb2ludCh0aGlzLmRpcmVjdGlvbikpXG4gICAgfSlcbiAgfVxuXG4gIGlzQmxhbmtSb3cocm93KSB7XG4gICAgcmV0dXJuIHRoaXMuZWRpdG9yLmlzQnVmZmVyUm93Qmxhbmsocm93KVxuICB9XG5cbiAgZ2V0TmV4dFN0YXJ0T2ZTZW50ZW5jZShmcm9tKSB7XG4gICAgcmV0dXJuIHRoaXMuZmluZEluRWRpdG9yKFwiZm9yd2FyZFwiLCB0aGlzLnNlbnRlbmNlUmVnZXgsIHtmcm9tfSwgKHtyYW5nZSwgbWF0Y2h9KSA9PiB7XG4gICAgICBpZiAobWF0Y2hbMV0gIT0gbnVsbCkge1xuICAgICAgICBjb25zdCBbc3RhcnRSb3csIGVuZFJvd10gPSBbcmFuZ2Uuc3RhcnQucm93LCByYW5nZS5lbmQucm93XVxuICAgICAgICBpZiAodGhpcy5za2lwQmxhbmtSb3cgJiYgdGhpcy5pc0JsYW5rUm93KGVuZFJvdykpIHJldHVyblxuICAgICAgICBpZiAodGhpcy5pc0JsYW5rUm93KHN0YXJ0Um93KSAhPT0gdGhpcy5pc0JsYW5rUm93KGVuZFJvdykpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5nZXRGaXJzdENoYXJhY3RlclBvc2l0aW9uRm9yQnVmZmVyUm93KGVuZFJvdylcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHJhbmdlLmVuZFxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICBnZXRQcmV2aW91c1N0YXJ0T2ZTZW50ZW5jZShmcm9tKSB7XG4gICAgcmV0dXJuIHRoaXMuZmluZEluRWRpdG9yKFwiYmFja3dhcmRcIiwgdGhpcy5zZW50ZW5jZVJlZ2V4LCB7ZnJvbX0sICh7cmFuZ2UsIG1hdGNofSkgPT4ge1xuICAgICAgaWYgKG1hdGNoWzFdICE9IG51bGwpIHtcbiAgICAgICAgY29uc3QgW3N0YXJ0Um93LCBlbmRSb3ddID0gW3JhbmdlLnN0YXJ0LnJvdywgcmFuZ2UuZW5kLnJvd11cbiAgICAgICAgaWYgKCF0aGlzLmlzQmxhbmtSb3coZW5kUm93KSAmJiB0aGlzLmlzQmxhbmtSb3coc3RhcnRSb3cpKSB7XG4gICAgICAgICAgY29uc3QgcG9pbnQgPSB0aGlzLmdldEZpcnN0Q2hhcmFjdGVyUG9zaXRpb25Gb3JCdWZmZXJSb3coZW5kUm93KVxuICAgICAgICAgIGlmIChwb2ludC5pc0xlc3NUaGFuKGZyb20pKSByZXR1cm4gcG9pbnRcbiAgICAgICAgICBlbHNlIGlmICghdGhpcy5za2lwQmxhbmtSb3cpIHJldHVybiB0aGlzLmdldEZpcnN0Q2hhcmFjdGVyUG9zaXRpb25Gb3JCdWZmZXJSb3coc3RhcnRSb3cpXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAocmFuZ2UuZW5kLmlzTGVzc1RoYW4oZnJvbSkpIHtcbiAgICAgICAgcmV0dXJuIHJhbmdlLmVuZFxuICAgICAgfVxuICAgIH0pXG4gIH1cbn1cblxuY2xhc3MgTW92ZVRvUHJldmlvdXNTZW50ZW5jZSBleHRlbmRzIE1vdmVUb05leHRTZW50ZW5jZSB7XG4gIGRpcmVjdGlvbiA9IFwicHJldmlvdXNcIlxufVxuXG5jbGFzcyBNb3ZlVG9OZXh0U2VudGVuY2VTa2lwQmxhbmtSb3cgZXh0ZW5kcyBNb3ZlVG9OZXh0U2VudGVuY2Uge1xuICBza2lwQmxhbmtSb3cgPSB0cnVlXG59XG5cbmNsYXNzIE1vdmVUb1ByZXZpb3VzU2VudGVuY2VTa2lwQmxhbmtSb3cgZXh0ZW5kcyBNb3ZlVG9QcmV2aW91c1NlbnRlbmNlIHtcbiAgc2tpcEJsYW5rUm93ID0gdHJ1ZVxufVxuXG4vLyBQYXJhZ3JhcGhcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIE1vdmVUb05leHRQYXJhZ3JhcGggZXh0ZW5kcyBNb3Rpb24ge1xuICBqdW1wID0gdHJ1ZVxuICBkaXJlY3Rpb24gPSBcIm5leHRcIlxuXG4gIG1vdmVDdXJzb3IoY3Vyc29yKSB7XG4gICAgdGhpcy5tb3ZlQ3Vyc29yQ291bnRUaW1lcyhjdXJzb3IsICgpID0+IHtcbiAgICAgIGNvbnN0IHBvaW50ID0gdGhpcy5nZXRQb2ludChjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKSlcbiAgICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihwb2ludCB8fCB0aGlzLmdldEZpcnN0T3JMYXN0UG9pbnQodGhpcy5kaXJlY3Rpb24pKVxuICAgIH0pXG4gIH1cblxuICBnZXRQb2ludChmcm9tKSB7XG4gICAgbGV0IHdhc0JsYW5rUm93ID0gdGhpcy5lZGl0b3IuaXNCdWZmZXJSb3dCbGFuayhmcm9tLnJvdylcbiAgICByZXR1cm4gdGhpcy5maW5kSW5FZGl0b3IodGhpcy5kaXJlY3Rpb24sIC9eL2csIHtmcm9tfSwgKHtyYW5nZX0pID0+IHtcbiAgICAgIGNvbnN0IGlzQmxhbmtSb3cgPSB0aGlzLmVkaXRvci5pc0J1ZmZlclJvd0JsYW5rKHJhbmdlLnN0YXJ0LnJvdylcbiAgICAgIGlmICghd2FzQmxhbmtSb3cgJiYgaXNCbGFua1Jvdykge1xuICAgICAgICByZXR1cm4gcmFuZ2Uuc3RhcnRcbiAgICAgIH1cbiAgICAgIHdhc0JsYW5rUm93ID0gaXNCbGFua1Jvd1xuICAgIH0pXG4gIH1cbn1cblxuY2xhc3MgTW92ZVRvUHJldmlvdXNQYXJhZ3JhcGggZXh0ZW5kcyBNb3ZlVG9OZXh0UGFyYWdyYXBoIHtcbiAgZGlyZWN0aW9uID0gXCJwcmV2aW91c1wiXG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIGtleW1hcDogMFxuY2xhc3MgTW92ZVRvQmVnaW5uaW5nT2ZMaW5lIGV4dGVuZHMgTW90aW9uIHtcbiAgbW92ZUN1cnNvcihjdXJzb3IpIHtcbiAgICB0aGlzLnV0aWxzLnNldEJ1ZmZlckNvbHVtbihjdXJzb3IsIDApXG4gIH1cbn1cblxuY2xhc3MgTW92ZVRvQ29sdW1uIGV4dGVuZHMgTW90aW9uIHtcbiAgbW92ZUN1cnNvcihjdXJzb3IpIHtcbiAgICB0aGlzLnV0aWxzLnNldEJ1ZmZlckNvbHVtbihjdXJzb3IsIHRoaXMuZ2V0Q291bnQoKSAtIDEpXG4gIH1cbn1cblxuY2xhc3MgTW92ZVRvTGFzdENoYXJhY3Rlck9mTGluZSBleHRlbmRzIE1vdGlvbiB7XG4gIG1vdmVDdXJzb3IoY3Vyc29yKSB7XG4gICAgY29uc3Qgcm93ID0gdGhpcy5nZXRWYWxpZFZpbUJ1ZmZlclJvdyhjdXJzb3IuZ2V0QnVmZmVyUm93KCkgKyB0aGlzLmdldENvdW50KCkgLSAxKVxuICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihbcm93LCBJbmZpbml0eV0pXG4gICAgY3Vyc29yLmdvYWxDb2x1bW4gPSBJbmZpbml0eVxuICB9XG59XG5cbmNsYXNzIE1vdmVUb0xhc3ROb25ibGFua0NoYXJhY3Rlck9mTGluZUFuZERvd24gZXh0ZW5kcyBNb3Rpb24ge1xuICBpbmNsdXNpdmUgPSB0cnVlXG5cbiAgbW92ZUN1cnNvcihjdXJzb3IpIHtcbiAgICBjb25zdCByb3cgPSB0aGlzLmxpbWl0TnVtYmVyKGN1cnNvci5nZXRCdWZmZXJSb3coKSArIHRoaXMuZ2V0Q291bnQoKSAtIDEsIHttYXg6IHRoaXMuZ2V0VmltTGFzdEJ1ZmZlclJvdygpfSlcbiAgICBjb25zdCBvcHRpb25zID0ge2Zyb206IFtyb3csIEluZmluaXR5XSwgYWxsb3dOZXh0TGluZTogZmFsc2V9XG4gICAgY29uc3QgcG9pbnQgPSB0aGlzLmZpbmRJbkVkaXRvcihcImJhY2t3YXJkXCIsIC9cXFN8Xi8sIG9wdGlvbnMsIGV2ZW50ID0+IGV2ZW50LnJhbmdlLnN0YXJ0KVxuICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihwb2ludClcbiAgfVxufVxuXG4vLyBNb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZSBmYWltaWx5XG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIF5cbmNsYXNzIE1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lIGV4dGVuZHMgTW90aW9uIHtcbiAgbW92ZUN1cnNvcihjdXJzb3IpIHtcbiAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24odGhpcy5nZXRGaXJzdENoYXJhY3RlclBvc2l0aW9uRm9yQnVmZmVyUm93KGN1cnNvci5nZXRCdWZmZXJSb3coKSkpXG4gIH1cbn1cblxuY2xhc3MgTW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmVVcCBleHRlbmRzIE1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lIHtcbiAgd2lzZSA9IFwibGluZXdpc2VcIlxuICBtb3ZlQ3Vyc29yKGN1cnNvcikge1xuICAgIHRoaXMubW92ZUN1cnNvckNvdW50VGltZXMoY3Vyc29yLCAoKSA9PiB7XG4gICAgICBjb25zdCByb3cgPSB0aGlzLmdldFZhbGlkVmltQnVmZmVyUm93KGN1cnNvci5nZXRCdWZmZXJSb3coKSAtIDEpXG4gICAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24oW3JvdywgMF0pXG4gICAgfSlcbiAgICBzdXBlci5tb3ZlQ3Vyc29yKGN1cnNvcilcbiAgfVxufVxuXG5jbGFzcyBNb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZURvd24gZXh0ZW5kcyBNb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZSB7XG4gIHdpc2UgPSBcImxpbmV3aXNlXCJcbiAgbW92ZUN1cnNvcihjdXJzb3IpIHtcbiAgICB0aGlzLm1vdmVDdXJzb3JDb3VudFRpbWVzKGN1cnNvciwgKCkgPT4ge1xuICAgICAgY29uc3QgcG9pbnQgPSBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuICAgICAgaWYgKHBvaW50LnJvdyA8IHRoaXMuZ2V0VmltTGFzdEJ1ZmZlclJvdygpKSB7XG4gICAgICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihwb2ludC50cmFuc2xhdGUoWysxLCAwXSkpXG4gICAgICB9XG4gICAgfSlcbiAgICBzdXBlci5tb3ZlQ3Vyc29yKGN1cnNvcilcbiAgfVxufVxuXG5jbGFzcyBNb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZUFuZERvd24gZXh0ZW5kcyBNb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZURvd24ge1xuICBnZXRDb3VudCgpIHtcbiAgICByZXR1cm4gc3VwZXIuZ2V0Q291bnQoKSAtIDFcbiAgfVxufVxuXG5jbGFzcyBNb3ZlVG9TY3JlZW5Db2x1bW4gZXh0ZW5kcyBNb3Rpb24ge1xuICBzdGF0aWMgY29tbWFuZCA9IGZhbHNlXG4gIG1vdmVDdXJzb3IoY3Vyc29yKSB7XG4gICAgY29uc3QgYWxsb3dPZmZTY3JlZW5Qb3NpdGlvbiA9IHRoaXMuZ2V0Q29uZmlnKFwiYWxsb3dNb3ZlVG9PZmZTY3JlZW5Db2x1bW5PblNjcmVlbkxpbmVNb3Rpb25cIilcbiAgICBjb25zdCBwb2ludCA9IHRoaXMudXRpbHMuZ2V0U2NyZWVuUG9zaXRpb25Gb3JTY3JlZW5Sb3codGhpcy5lZGl0b3IsIGN1cnNvci5nZXRTY3JlZW5Sb3coKSwgdGhpcy53aGljaCwge1xuICAgICAgYWxsb3dPZmZTY3JlZW5Qb3NpdGlvbixcbiAgICB9KVxuICAgIGlmIChwb2ludCkgY3Vyc29yLnNldFNjcmVlblBvc2l0aW9uKHBvaW50KVxuICB9XG59XG5cbi8vIGtleW1hcDogZyAwXG5jbGFzcyBNb3ZlVG9CZWdpbm5pbmdPZlNjcmVlbkxpbmUgZXh0ZW5kcyBNb3ZlVG9TY3JlZW5Db2x1bW4ge1xuICB3aGljaCA9IFwiYmVnaW5uaW5nXCJcbn1cblxuLy8gZyBeOiBgbW92ZS10by1maXJzdC1jaGFyYWN0ZXItb2Ytc2NyZWVuLWxpbmVgXG5jbGFzcyBNb3ZlVG9GaXJzdENoYXJhY3Rlck9mU2NyZWVuTGluZSBleHRlbmRzIE1vdmVUb1NjcmVlbkNvbHVtbiB7XG4gIHdoaWNoID0gXCJmaXJzdC1jaGFyYWN0ZXJcIlxufVxuXG4vLyBrZXltYXA6IGcgJFxuY2xhc3MgTW92ZVRvTGFzdENoYXJhY3Rlck9mU2NyZWVuTGluZSBleHRlbmRzIE1vdmVUb1NjcmVlbkNvbHVtbiB7XG4gIHdoaWNoID0gXCJsYXN0LWNoYXJhY3RlclwiXG59XG5cbi8vIGtleW1hcDogZyBnXG5jbGFzcyBNb3ZlVG9GaXJzdExpbmUgZXh0ZW5kcyBNb3Rpb24ge1xuICB3aXNlID0gXCJsaW5ld2lzZVwiXG4gIGp1bXAgPSB0cnVlXG4gIHZlcnRpY2FsTW90aW9uID0gdHJ1ZVxuICBtb3ZlU3VjY2Vzc09uTGluZXdpc2UgPSB0cnVlXG5cbiAgbW92ZUN1cnNvcihjdXJzb3IpIHtcbiAgICB0aGlzLnNldEN1cnNvckJ1ZmZlclJvdyhjdXJzb3IsIHRoaXMuZ2V0VmFsaWRWaW1CdWZmZXJSb3codGhpcy5nZXRSb3coKSkpXG4gICAgY3Vyc29yLmF1dG9zY3JvbGwoe2NlbnRlcjogdHJ1ZX0pXG4gIH1cblxuICBnZXRSb3coKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0Q291bnQoKSAtIDFcbiAgfVxufVxuXG4vLyBrZXltYXA6IEdcbmNsYXNzIE1vdmVUb0xhc3RMaW5lIGV4dGVuZHMgTW92ZVRvRmlyc3RMaW5lIHtcbiAgZGVmYXVsdENvdW50ID0gSW5maW5pdHlcbn1cblxuLy8ga2V5bWFwOiBOJSBlLmcuIDEwJVxuY2xhc3MgTW92ZVRvTGluZUJ5UGVyY2VudCBleHRlbmRzIE1vdmVUb0ZpcnN0TGluZSB7XG4gIGdldFJvdygpIHtcbiAgICBjb25zdCBwZXJjZW50ID0gdGhpcy5saW1pdE51bWJlcih0aGlzLmdldENvdW50KCksIHttYXg6IDEwMH0pXG4gICAgcmV0dXJuIE1hdGguZmxvb3IodGhpcy5nZXRWaW1MYXN0QnVmZmVyUm93KCkgKiAocGVyY2VudCAvIDEwMCkpXG4gIH1cbn1cblxuY2xhc3MgTW92ZVRvUmVsYXRpdmVMaW5lIGV4dGVuZHMgTW90aW9uIHtcbiAgc3RhdGljIGNvbW1hbmQgPSBmYWxzZVxuICB3aXNlID0gXCJsaW5ld2lzZVwiXG4gIG1vdmVTdWNjZXNzT25MaW5ld2lzZSA9IHRydWVcblxuICBtb3ZlQ3Vyc29yKGN1cnNvcikge1xuICAgIGxldCByb3dcbiAgICBsZXQgY291bnQgPSB0aGlzLmdldENvdW50KClcbiAgICBpZiAoY291bnQgPCAwKSB7XG4gICAgICAvLyBTdXBwb3J0IG5lZ2F0aXZlIGNvdW50XG4gICAgICAvLyBOZWdhdGl2ZSBjb3VudCBjYW4gYmUgcGFzc2VkIGxpa2UgYG9wZXJhdGlvblN0YWNrLnJ1bihcIk1vdmVUb1JlbGF0aXZlTGluZVwiLCB7Y291bnQ6IC01fSlgLlxuICAgICAgLy8gQ3VycmVudGx5IHVzZWQgaW4gdmltLW1vZGUtcGx1cy1leC1tb2RlIHBrZy5cbiAgICAgIHdoaWxlIChjb3VudCsrIDwgMCkge1xuICAgICAgICByb3cgPSB0aGlzLmdldEZvbGRTdGFydFJvd0ZvclJvdyhyb3cgPT0gbnVsbCA/IGN1cnNvci5nZXRCdWZmZXJSb3coKSA6IHJvdyAtIDEpXG4gICAgICAgIGlmIChyb3cgPD0gMCkgYnJlYWtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgbWF4Um93ID0gdGhpcy5nZXRWaW1MYXN0QnVmZmVyUm93KClcbiAgICAgIHdoaWxlIChjb3VudC0tID4gMCkge1xuICAgICAgICByb3cgPSB0aGlzLmdldEZvbGRFbmRSb3dGb3JSb3cocm93ID09IG51bGwgPyBjdXJzb3IuZ2V0QnVmZmVyUm93KCkgOiByb3cgKyAxKVxuICAgICAgICBpZiAocm93ID49IG1heFJvdykgYnJlYWtcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy51dGlscy5zZXRCdWZmZXJSb3coY3Vyc29yLCByb3cpXG4gIH1cbn1cblxuY2xhc3MgTW92ZVRvUmVsYXRpdmVMaW5lTWluaW11bVR3byBleHRlbmRzIE1vdmVUb1JlbGF0aXZlTGluZSB7XG4gIHN0YXRpYyBjb21tYW5kID0gZmFsc2VcbiAgZ2V0Q291bnQoKSB7XG4gICAgcmV0dXJuIHRoaXMubGltaXROdW1iZXIoc3VwZXIuZ2V0Q291bnQoKSwge21pbjogMn0pXG4gIH1cbn1cblxuLy8gUG9zaXRpb24gY3Vyc29yIHdpdGhvdXQgc2Nyb2xsaW5nLiwgSCwgTSwgTFxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8ga2V5bWFwOiBIXG5jbGFzcyBNb3ZlVG9Ub3BPZlNjcmVlbiBleHRlbmRzIE1vdGlvbiB7XG4gIHdpc2UgPSBcImxpbmV3aXNlXCJcbiAganVtcCA9IHRydWVcbiAgZGVmYXVsdENvdW50ID0gMFxuICB2ZXJ0aWNhbE1vdGlvbiA9IHRydWVcblxuICBtb3ZlQ3Vyc29yKGN1cnNvcikge1xuICAgIGNvbnN0IGJ1ZmZlclJvdyA9IHRoaXMuZWRpdG9yLmJ1ZmZlclJvd0ZvclNjcmVlblJvdyh0aGlzLmdldFNjcmVlblJvdygpKVxuICAgIHRoaXMuc2V0Q3Vyc29yQnVmZmVyUm93KGN1cnNvciwgYnVmZmVyUm93KVxuICB9XG5cbiAgZ2V0U2NyZWVuUm93KCkge1xuICAgIGNvbnN0IGZpcnN0VmlzaWJsZVJvdyA9IHRoaXMuZWRpdG9yLmdldEZpcnN0VmlzaWJsZVNjcmVlblJvdygpXG4gICAgY29uc3QgbGFzdFZpc2libGVSb3cgPSB0aGlzLmxpbWl0TnVtYmVyKHRoaXMuZWRpdG9yLmdldExhc3RWaXNpYmxlU2NyZWVuUm93KCksIHttYXg6IHRoaXMuZ2V0VmltTGFzdFNjcmVlblJvdygpfSlcblxuICAgIGNvbnN0IGJhc2VPZmZzZXQgPSAyXG4gICAgaWYgKHRoaXMubmFtZSA9PT0gXCJNb3ZlVG9Ub3BPZlNjcmVlblwiKSB7XG4gICAgICBjb25zdCBvZmZzZXQgPSBmaXJzdFZpc2libGVSb3cgPT09IDAgPyAwIDogYmFzZU9mZnNldFxuICAgICAgY29uc3QgY291bnQgPSB0aGlzLmdldENvdW50KCkgLSAxXG4gICAgICByZXR1cm4gdGhpcy5saW1pdE51bWJlcihmaXJzdFZpc2libGVSb3cgKyBjb3VudCwge21pbjogZmlyc3RWaXNpYmxlUm93ICsgb2Zmc2V0LCBtYXg6IGxhc3RWaXNpYmxlUm93fSlcbiAgICB9IGVsc2UgaWYgKHRoaXMubmFtZSA9PT0gXCJNb3ZlVG9NaWRkbGVPZlNjcmVlblwiKSB7XG4gICAgICByZXR1cm4gZmlyc3RWaXNpYmxlUm93ICsgTWF0aC5mbG9vcigobGFzdFZpc2libGVSb3cgLSBmaXJzdFZpc2libGVSb3cpIC8gMilcbiAgICB9IGVsc2UgaWYgKHRoaXMubmFtZSA9PT0gXCJNb3ZlVG9Cb3R0b21PZlNjcmVlblwiKSB7XG4gICAgICBjb25zdCBvZmZzZXQgPSBsYXN0VmlzaWJsZVJvdyA9PT0gdGhpcy5nZXRWaW1MYXN0U2NyZWVuUm93KCkgPyAwIDogYmFzZU9mZnNldCArIDFcbiAgICAgIGNvbnN0IGNvdW50ID0gdGhpcy5nZXRDb3VudCgpIC0gMVxuICAgICAgcmV0dXJuIHRoaXMubGltaXROdW1iZXIobGFzdFZpc2libGVSb3cgLSBjb3VudCwge21pbjogZmlyc3RWaXNpYmxlUm93LCBtYXg6IGxhc3RWaXNpYmxlUm93IC0gb2Zmc2V0fSlcbiAgICB9XG4gIH1cbn1cblxuY2xhc3MgTW92ZVRvTWlkZGxlT2ZTY3JlZW4gZXh0ZW5kcyBNb3ZlVG9Ub3BPZlNjcmVlbiB7fSAvLyBrZXltYXA6IE1cbmNsYXNzIE1vdmVUb0JvdHRvbU9mU2NyZWVuIGV4dGVuZHMgTW92ZVRvVG9wT2ZTY3JlZW4ge30gLy8ga2V5bWFwOiBMXG5cbi8vIFNjcm9sbGluZ1xuLy8gSGFsZjogY3RybC1kLCBjdHJsLXVcbi8vIEZ1bGw6IGN0cmwtZiwgY3RybC1iXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBbRklYTUVdIGNvdW50IGJlaGF2ZSBkaWZmZXJlbnRseSBmcm9tIG9yaWdpbmFsIFZpbS5cbmNsYXNzIFNjcm9sbCBleHRlbmRzIE1vdGlvbiB7XG4gIHN0YXRpYyBjb21tYW5kID0gZmFsc2VcbiAgc3RhdGljIHNjcm9sbFRhc2sgPSBudWxsXG4gIHN0YXRpYyBhbW91bnRPZlBhZ2VCeU5hbWUgPSB7XG4gICAgU2Nyb2xsRnVsbFNjcmVlbkRvd246IDEsXG4gICAgU2Nyb2xsRnVsbFNjcmVlblVwOiAtMSxcbiAgICBTY3JvbGxIYWxmU2NyZWVuRG93bjogMC41LFxuICAgIFNjcm9sbEhhbGZTY3JlZW5VcDogLTAuNSxcbiAgICBTY3JvbGxRdWFydGVyU2NyZWVuRG93bjogMC4yNSxcbiAgICBTY3JvbGxRdWFydGVyU2NyZWVuVXA6IC0wLjI1LFxuICB9XG4gIHZlcnRpY2FsTW90aW9uID0gdHJ1ZVxuXG4gIGV4ZWN1dGUoKSB7XG4gICAgY29uc3QgYW1vdW50T2ZQYWdlID0gdGhpcy5jb25zdHJ1Y3Rvci5hbW91bnRPZlBhZ2VCeU5hbWVbdGhpcy5uYW1lXVxuICAgIGNvbnN0IGFtb3VudE9mU2NyZWVuUm93cyA9IE1hdGgudHJ1bmMoYW1vdW50T2ZQYWdlICogdGhpcy5lZGl0b3IuZ2V0Um93c1BlclBhZ2UoKSAqIHRoaXMuZ2V0Q291bnQoKSlcbiAgICB0aGlzLmFtb3VudE9mUGl4ZWxzID0gYW1vdW50T2ZTY3JlZW5Sb3dzICogdGhpcy5lZGl0b3IuZ2V0TGluZUhlaWdodEluUGl4ZWxzKClcblxuICAgIHN1cGVyLmV4ZWN1dGUoKVxuXG4gICAgdGhpcy52aW1TdGF0ZS5yZXF1ZXN0U2Nyb2xsKHtcbiAgICAgIGFtb3VudE9mUGl4ZWxzOiB0aGlzLmFtb3VudE9mUGl4ZWxzLFxuICAgICAgZHVyYXRpb246IHRoaXMuZ2V0U21vb3RoU2Nyb2xsRHVhdGlvbigoTWF0aC5hYnMoYW1vdW50T2ZQYWdlKSA9PT0gMSA/IFwiRnVsbFwiIDogXCJIYWxmXCIpICsgXCJTY3JvbGxNb3Rpb25cIiksXG4gICAgfSlcbiAgfVxuXG4gIG1vdmVDdXJzb3IoY3Vyc29yKSB7XG4gICAgY29uc3QgY3Vyc29yUGl4ZWwgPSB0aGlzLmVkaXRvckVsZW1lbnQucGl4ZWxQb3NpdGlvbkZvclNjcmVlblBvc2l0aW9uKGN1cnNvci5nZXRTY3JlZW5Qb3NpdGlvbigpKVxuICAgIGN1cnNvclBpeGVsLnRvcCArPSB0aGlzLmFtb3VudE9mUGl4ZWxzXG4gICAgY29uc3Qgc2NyZWVuUG9zaXRpb24gPSB0aGlzLmVkaXRvckVsZW1lbnQuc2NyZWVuUG9zaXRpb25Gb3JQaXhlbFBvc2l0aW9uKGN1cnNvclBpeGVsKVxuICAgIGNvbnN0IHNjcmVlblJvdyA9IHRoaXMuZ2V0VmFsaWRWaW1TY3JlZW5Sb3coc2NyZWVuUG9zaXRpb24ucm93KVxuICAgIHRoaXMuc2V0Q3Vyc29yQnVmZmVyUm93KGN1cnNvciwgdGhpcy5lZGl0b3IuYnVmZmVyUm93Rm9yU2NyZWVuUm93KHNjcmVlblJvdyksIHthdXRvc2Nyb2xsOiBmYWxzZX0pXG4gIH1cbn1cblxuY2xhc3MgU2Nyb2xsRnVsbFNjcmVlbkRvd24gZXh0ZW5kcyBTY3JvbGwge30gLy8gY3RybC1mXG5jbGFzcyBTY3JvbGxGdWxsU2NyZWVuVXAgZXh0ZW5kcyBTY3JvbGwge30gLy8gY3RybC1iXG5jbGFzcyBTY3JvbGxIYWxmU2NyZWVuRG93biBleHRlbmRzIFNjcm9sbCB7fSAvLyBjdHJsLWRcbmNsYXNzIFNjcm9sbEhhbGZTY3JlZW5VcCBleHRlbmRzIFNjcm9sbCB7fSAvLyBjdHJsLXVcbmNsYXNzIFNjcm9sbFF1YXJ0ZXJTY3JlZW5Eb3duIGV4dGVuZHMgU2Nyb2xsIHt9IC8vIGcgY3RybC1kXG5jbGFzcyBTY3JvbGxRdWFydGVyU2NyZWVuVXAgZXh0ZW5kcyBTY3JvbGwge30gLy8gZyBjdHJsLXVcblxuLy8gRmluZFxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8ga2V5bWFwOiBmXG5jbGFzcyBGaW5kIGV4dGVuZHMgTW90aW9uIHtcbiAgYmFja3dhcmRzID0gZmFsc2VcbiAgaW5jbHVzaXZlID0gdHJ1ZVxuICBvZmZzZXQgPSAwXG4gIHJlcXVpcmVJbnB1dCA9IHRydWVcbiAgY2FzZVNlbnNpdGl2aXR5S2luZCA9IFwiRmluZFwiXG5cbiAgcmVzdG9yZUVkaXRvclN0YXRlKCkge1xuICAgIGlmICh0aGlzLl9yZXN0b3JlRWRpdG9yU3RhdGUpIHRoaXMuX3Jlc3RvcmVFZGl0b3JTdGF0ZSgpXG4gICAgdGhpcy5fcmVzdG9yZUVkaXRvclN0YXRlID0gbnVsbFxuICB9XG5cbiAgY2FuY2VsT3BlcmF0aW9uKCkge1xuICAgIHRoaXMucmVzdG9yZUVkaXRvclN0YXRlKClcbiAgICBzdXBlci5jYW5jZWxPcGVyYXRpb24oKVxuICB9XG5cbiAgaW5pdGlhbGl6ZSgpIHtcbiAgICBpZiAodGhpcy5nZXRDb25maWcoXCJyZXVzZUZpbmRGb3JSZXBlYXRGaW5kXCIpKSB0aGlzLnJlcGVhdElmTmVjZXNzYXJ5KClcblxuICAgIGlmICghdGhpcy5yZXBlYXRlZCkge1xuICAgICAgY29uc3QgY2hhcnNNYXggPSB0aGlzLmdldENvbmZpZyhcImZpbmRDaGFyc01heFwiKVxuICAgICAgY29uc3Qgb3B0aW9uc0Jhc2UgPSB7cHVycG9zZTogXCJmaW5kXCIsIGNoYXJzTWF4fVxuXG4gICAgICBpZiAoY2hhcnNNYXggPT09IDEpIHtcbiAgICAgICAgdGhpcy5mb2N1c0lucHV0KG9wdGlvbnNCYXNlKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fcmVzdG9yZUVkaXRvclN0YXRlID0gdGhpcy51dGlscy5zYXZlRWRpdG9yU3RhdGUodGhpcy5lZGl0b3IpXG4gICAgICAgIGNvbnN0IG9wdGlvbnMgPSB7XG4gICAgICAgICAgYXV0b0NvbmZpcm1UaW1lb3V0OiB0aGlzLmdldENvbmZpZyhcImZpbmRDb25maXJtQnlUaW1lb3V0XCIpLFxuICAgICAgICAgIG9uQ29uZmlybTogaW5wdXQgPT4ge1xuICAgICAgICAgICAgdGhpcy5pbnB1dCA9IGlucHV0XG4gICAgICAgICAgICBpZiAoaW5wdXQpIHRoaXMucHJvY2Vzc09wZXJhdGlvbigpXG4gICAgICAgICAgICBlbHNlIHRoaXMuY2FuY2VsT3BlcmF0aW9uKClcbiAgICAgICAgICB9LFxuICAgICAgICAgIG9uQ2hhbmdlOiBwcmVDb25maXJtZWRDaGFycyA9PiB7XG4gICAgICAgICAgICB0aGlzLnByZUNvbmZpcm1lZENoYXJzID0gcHJlQ29uZmlybWVkQ2hhcnNcbiAgICAgICAgICAgIHRoaXMuaGlnaGxpZ2h0VGV4dEluQ3Vyc29yUm93cyh0aGlzLnByZUNvbmZpcm1lZENoYXJzLCBcInByZS1jb25maXJtXCIsIHRoaXMuaXNCYWNrd2FyZHMoKSlcbiAgICAgICAgICB9LFxuICAgICAgICAgIG9uQ2FuY2VsOiAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnZpbVN0YXRlLmhpZ2hsaWdodEZpbmQuY2xlYXJNYXJrZXJzKClcbiAgICAgICAgICAgIHRoaXMuY2FuY2VsT3BlcmF0aW9uKClcbiAgICAgICAgICB9LFxuICAgICAgICAgIGNvbW1hbmRzOiB7XG4gICAgICAgICAgICBcInZpbS1tb2RlLXBsdXM6ZmluZC1uZXh0LXByZS1jb25maXJtZWRcIjogKCkgPT4gdGhpcy5maW5kUHJlQ29uZmlybWVkKCsxKSxcbiAgICAgICAgICAgIFwidmltLW1vZGUtcGx1czpmaW5kLXByZXZpb3VzLXByZS1jb25maXJtZWRcIjogKCkgPT4gdGhpcy5maW5kUHJlQ29uZmlybWVkKC0xKSxcbiAgICAgICAgICB9LFxuICAgICAgICB9XG4gICAgICAgIHRoaXMuZm9jdXNJbnB1dChPYmplY3QuYXNzaWduKG9wdGlvbnMsIG9wdGlvbnNCYXNlKSlcbiAgICAgIH1cbiAgICB9XG4gICAgc3VwZXIuaW5pdGlhbGl6ZSgpXG4gIH1cblxuICBmaW5kUHJlQ29uZmlybWVkKGRlbHRhKSB7XG4gICAgaWYgKHRoaXMucHJlQ29uZmlybWVkQ2hhcnMgJiYgdGhpcy5nZXRDb25maWcoXCJoaWdobGlnaHRGaW5kQ2hhclwiKSkge1xuICAgICAgY29uc3QgaW5kZXggPSB0aGlzLmhpZ2hsaWdodFRleHRJbkN1cnNvclJvd3MoXG4gICAgICAgIHRoaXMucHJlQ29uZmlybWVkQ2hhcnMsXG4gICAgICAgIFwicHJlLWNvbmZpcm1cIixcbiAgICAgICAgdGhpcy5pc0JhY2t3YXJkcygpLFxuICAgICAgICB0aGlzLmdldENvdW50KCkgLSAxICsgZGVsdGEsXG4gICAgICAgIHRydWVcbiAgICAgIClcbiAgICAgIHRoaXMuY291bnQgPSBpbmRleCArIDFcbiAgICB9XG4gIH1cblxuICByZXBlYXRJZk5lY2Vzc2FyeSgpIHtcbiAgICBjb25zdCBmaW5kQ29tbWFuZE5hbWVzID0gW1wiRmluZFwiLCBcIkZpbmRCYWNrd2FyZHNcIiwgXCJUaWxsXCIsIFwiVGlsbEJhY2t3YXJkc1wiXVxuICAgIGNvbnN0IGN1cnJlbnRGaW5kID0gdGhpcy5nbG9iYWxTdGF0ZS5nZXQoXCJjdXJyZW50RmluZFwiKVxuICAgIGlmIChjdXJyZW50RmluZCAmJiBmaW5kQ29tbWFuZE5hbWVzLmluY2x1ZGVzKHRoaXMudmltU3RhdGUub3BlcmF0aW9uU3RhY2suZ2V0TGFzdENvbW1hbmROYW1lKCkpKSB7XG4gICAgICB0aGlzLmlucHV0ID0gY3VycmVudEZpbmQuaW5wdXRcbiAgICAgIHRoaXMucmVwZWF0ZWQgPSB0cnVlXG4gICAgfVxuICB9XG5cbiAgaXNCYWNrd2FyZHMoKSB7XG4gICAgcmV0dXJuIHRoaXMuYmFja3dhcmRzXG4gIH1cblxuICBleGVjdXRlKCkge1xuICAgIHN1cGVyLmV4ZWN1dGUoKVxuICAgIGxldCBkZWNvcmF0aW9uVHlwZSA9IFwicG9zdC1jb25maXJtXCJcbiAgICBpZiAodGhpcy5vcGVyYXRvciAmJiAhdGhpcy5vcGVyYXRvci5pbnN0YW5jZW9mKFwiU2VsZWN0QmFzZVwiKSkge1xuICAgICAgZGVjb3JhdGlvblR5cGUgKz0gXCIgbG9uZ1wiXG4gICAgfVxuXG4gICAgLy8gSEFDSzogV2hlbiByZXBlYXRlZCBieSBcIixcIiwgdGhpcy5iYWNrd2FyZHMgaXMgdGVtcG9yYXJ5IGludmVydGVkIGFuZFxuICAgIC8vIHJlc3RvcmVkIGFmdGVyIGV4ZWN1dGlvbiBmaW5pc2hlZC5cbiAgICAvLyBCdXQgZmluYWwgaGlnaGxpZ2h0VGV4dEluQ3Vyc29yUm93cyBpcyBleGVjdXRlZCBpbiBhc3luYyg9YWZ0ZXIgb3BlcmF0aW9uIGZpbmlzaGVkKS5cbiAgICAvLyBUaHVzIHdlIG5lZWQgdG8gcHJlc2VydmUgYmVmb3JlIHJlc3RvcmVkIGBiYWNrd2FyZHNgIHZhbHVlIGFuZCBwYXNzIGl0LlxuICAgIGNvbnN0IGJhY2t3YXJkcyA9IHRoaXMuaXNCYWNrd2FyZHMoKVxuICAgIHRoaXMuZWRpdG9yLmNvbXBvbmVudC5nZXROZXh0VXBkYXRlUHJvbWlzZSgpLnRoZW4oKCkgPT4ge1xuICAgICAgdGhpcy5oaWdobGlnaHRUZXh0SW5DdXJzb3JSb3dzKHRoaXMuaW5wdXQsIGRlY29yYXRpb25UeXBlLCBiYWNrd2FyZHMpXG4gICAgfSlcbiAgfVxuXG4gIGdldFBvaW50KGZyb21Qb2ludCkge1xuICAgIGNvbnN0IHNjYW5SYW5nZSA9IHRoaXMuZWRpdG9yLmJ1ZmZlclJhbmdlRm9yQnVmZmVyUm93KGZyb21Qb2ludC5yb3cpXG4gICAgY29uc3QgcG9pbnRzID0gW11cbiAgICBjb25zdCByZWdleCA9IHRoaXMuZ2V0UmVnZXgodGhpcy5pbnB1dClcbiAgICBjb25zdCBpbmRleFdhbnRBY2Nlc3MgPSB0aGlzLmdldENvdW50KCkgLSAxXG5cbiAgICBjb25zdCB0cmFuc2xhdGlvbiA9IG5ldyBQb2ludCgwLCB0aGlzLmlzQmFja3dhcmRzKCkgPyB0aGlzLm9mZnNldCA6IC10aGlzLm9mZnNldClcbiAgICBpZiAodGhpcy5yZXBlYXRlZCkge1xuICAgICAgZnJvbVBvaW50ID0gZnJvbVBvaW50LnRyYW5zbGF0ZSh0cmFuc2xhdGlvbi5uZWdhdGUoKSlcbiAgICB9XG5cbiAgICBpZiAodGhpcy5pc0JhY2t3YXJkcygpKSB7XG4gICAgICBpZiAodGhpcy5nZXRDb25maWcoXCJmaW5kQWNyb3NzTGluZXNcIikpIHNjYW5SYW5nZS5zdGFydCA9IFBvaW50LlpFUk9cblxuICAgICAgdGhpcy5lZGl0b3IuYmFja3dhcmRzU2NhbkluQnVmZmVyUmFuZ2UocmVnZXgsIHNjYW5SYW5nZSwgKHtyYW5nZSwgc3RvcH0pID0+IHtcbiAgICAgICAgaWYgKHJhbmdlLnN0YXJ0LmlzTGVzc1RoYW4oZnJvbVBvaW50KSkge1xuICAgICAgICAgIHBvaW50cy5wdXNoKHJhbmdlLnN0YXJ0KVxuICAgICAgICAgIGlmIChwb2ludHMubGVuZ3RoID4gaW5kZXhXYW50QWNjZXNzKSBzdG9wKClcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHRoaXMuZ2V0Q29uZmlnKFwiZmluZEFjcm9zc0xpbmVzXCIpKSBzY2FuUmFuZ2UuZW5kID0gdGhpcy5lZGl0b3IuZ2V0RW9mQnVmZmVyUG9zaXRpb24oKVxuXG4gICAgICB0aGlzLmVkaXRvci5zY2FuSW5CdWZmZXJSYW5nZShyZWdleCwgc2NhblJhbmdlLCAoe3JhbmdlLCBzdG9wfSkgPT4ge1xuICAgICAgICBpZiAocmFuZ2Uuc3RhcnQuaXNHcmVhdGVyVGhhbihmcm9tUG9pbnQpKSB7XG4gICAgICAgICAgcG9pbnRzLnB1c2gocmFuZ2Uuc3RhcnQpXG4gICAgICAgICAgaWYgKHBvaW50cy5sZW5ndGggPiBpbmRleFdhbnRBY2Nlc3MpIHN0b3AoKVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH1cblxuICAgIGNvbnN0IHBvaW50ID0gcG9pbnRzW2luZGV4V2FudEFjY2Vzc11cbiAgICBpZiAocG9pbnQpIHJldHVybiBwb2ludC50cmFuc2xhdGUodHJhbnNsYXRpb24pXG4gIH1cblxuICAvLyBGSVhNRTogYmFkIG5hbWluZywgdGhpcyBmdW5jdGlvbiBtdXN0IHJldHVybiBpbmRleFxuICBoaWdobGlnaHRUZXh0SW5DdXJzb3JSb3dzKHRleHQsIGRlY29yYXRpb25UeXBlLCBiYWNrd2FyZHMsIGluZGV4ID0gdGhpcy5nZXRDb3VudCgpIC0gMSwgYWRqdXN0SW5kZXggPSBmYWxzZSkge1xuICAgIGlmICghdGhpcy5nZXRDb25maWcoXCJoaWdobGlnaHRGaW5kQ2hhclwiKSkgcmV0dXJuXG5cbiAgICByZXR1cm4gdGhpcy52aW1TdGF0ZS5oaWdobGlnaHRGaW5kLmhpZ2hsaWdodEN1cnNvclJvd3MoXG4gICAgICB0aGlzLmdldFJlZ2V4KHRleHQpLFxuICAgICAgZGVjb3JhdGlvblR5cGUsXG4gICAgICBiYWNrd2FyZHMsXG4gICAgICB0aGlzLm9mZnNldCxcbiAgICAgIGluZGV4LFxuICAgICAgYWRqdXN0SW5kZXhcbiAgICApXG4gIH1cblxuICBtb3ZlQ3Vyc29yKGN1cnNvcikge1xuICAgIGNvbnN0IHBvaW50ID0gdGhpcy5nZXRQb2ludChjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKSlcbiAgICBpZiAocG9pbnQpIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihwb2ludClcbiAgICBlbHNlIHRoaXMucmVzdG9yZUVkaXRvclN0YXRlKClcblxuICAgIGlmICghdGhpcy5yZXBlYXRlZCkgdGhpcy5nbG9iYWxTdGF0ZS5zZXQoXCJjdXJyZW50RmluZFwiLCB0aGlzKVxuICB9XG5cbiAgZ2V0UmVnZXgodGVybSkge1xuICAgIGNvbnN0IG1vZGlmaWVycyA9IHRoaXMuaXNDYXNlU2Vuc2l0aXZlKHRlcm0pID8gXCJnXCIgOiBcImdpXCJcbiAgICByZXR1cm4gbmV3IFJlZ0V4cCh0aGlzLl8uZXNjYXBlUmVnRXhwKHRlcm0pLCBtb2RpZmllcnMpXG4gIH1cbn1cblxuLy8ga2V5bWFwOiBGXG5jbGFzcyBGaW5kQmFja3dhcmRzIGV4dGVuZHMgRmluZCB7XG4gIGluY2x1c2l2ZSA9IGZhbHNlXG4gIGJhY2t3YXJkcyA9IHRydWVcbn1cblxuLy8ga2V5bWFwOiB0XG5jbGFzcyBUaWxsIGV4dGVuZHMgRmluZCB7XG4gIG9mZnNldCA9IDFcbiAgZ2V0UG9pbnQoLi4uYXJncykge1xuICAgIGNvbnN0IHBvaW50ID0gc3VwZXIuZ2V0UG9pbnQoLi4uYXJncylcbiAgICB0aGlzLm1vdmVTdWNjZWVkZWQgPSBwb2ludCAhPSBudWxsXG4gICAgcmV0dXJuIHBvaW50XG4gIH1cbn1cblxuLy8ga2V5bWFwOiBUXG5jbGFzcyBUaWxsQmFja3dhcmRzIGV4dGVuZHMgVGlsbCB7XG4gIGluY2x1c2l2ZSA9IGZhbHNlXG4gIGJhY2t3YXJkcyA9IHRydWVcbn1cblxuLy8gTWFya1xuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8ga2V5bWFwOiBgXG5jbGFzcyBNb3ZlVG9NYXJrIGV4dGVuZHMgTW90aW9uIHtcbiAganVtcCA9IHRydWVcbiAgcmVxdWlyZUlucHV0ID0gdHJ1ZVxuICBpbnB1dCA9IG51bGxcbiAgbW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmUgPSBmYWxzZVxuXG4gIGluaXRpYWxpemUoKSB7XG4gICAgdGhpcy5yZWFkQ2hhcigpXG4gICAgc3VwZXIuaW5pdGlhbGl6ZSgpXG4gIH1cblxuICBtb3ZlQ3Vyc29yKGN1cnNvcikge1xuICAgIGxldCBwb2ludCA9IHRoaXMudmltU3RhdGUubWFyay5nZXQodGhpcy5pbnB1dClcbiAgICBpZiAocG9pbnQpIHtcbiAgICAgIGlmICh0aGlzLm1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lKSB7XG4gICAgICAgIHBvaW50ID0gdGhpcy5nZXRGaXJzdENoYXJhY3RlclBvc2l0aW9uRm9yQnVmZmVyUm93KHBvaW50LnJvdylcbiAgICAgIH1cbiAgICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihwb2ludClcbiAgICAgIGN1cnNvci5hdXRvc2Nyb2xsKHtjZW50ZXI6IHRydWV9KVxuICAgIH1cbiAgfVxufVxuXG4vLyBrZXltYXA6ICdcbmNsYXNzIE1vdmVUb01hcmtMaW5lIGV4dGVuZHMgTW92ZVRvTWFyayB7XG4gIHdpc2UgPSBcImxpbmV3aXNlXCJcbiAgbW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmUgPSB0cnVlXG59XG5cbi8vIEZvbGQgbW90aW9uXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBNb3ZlVG9QcmV2aW91c0ZvbGRTdGFydCBleHRlbmRzIE1vdGlvbiB7XG4gIHdpc2UgPSBcImNoYXJhY3Rlcndpc2VcIlxuICB3aGljaCA9IFwic3RhcnRcIlxuICBkaXJlY3Rpb24gPSBcInByZXZpb3VzXCJcblxuICBleGVjdXRlKCkge1xuICAgIGNvbnN0IGZvbGRSYW5nZXMgPSB0aGlzLnV0aWxzLmdldENvZGVGb2xkUmFuZ2VzKHRoaXMuZWRpdG9yKVxuICAgIHRoaXMucm93cyA9IGZvbGRSYW5nZXMubWFwKHJhbmdlID0+IHJhbmdlW3RoaXMud2hpY2hdLnJvdykuc29ydCgoYSwgYikgPT4gYSAtIGIpXG4gICAgaWYgKHRoaXMuZGlyZWN0aW9uID09PSBcInByZXZpb3VzXCIpIHRoaXMucm93cy5yZXZlcnNlKClcbiAgICBzdXBlci5leGVjdXRlKClcbiAgfVxuXG4gIGdldFNjYW5Sb3dzKGN1cnNvcikge1xuICAgIGlmICh0aGlzLmRpcmVjdGlvbiA9PT0gXCJwcmV2aW91c1wiKSB7XG4gICAgICByZXR1cm4gdGhpcy5yb3dzLmZpbHRlcihyb3cgPT4gcm93IDwgY3Vyc29yLmdldEJ1ZmZlclJvdygpKVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5yb3dzLmZpbHRlcihyb3cgPT4gcm93ID4gY3Vyc29yLmdldEJ1ZmZlclJvdygpKVxuICAgIH1cbiAgfVxuXG4gIGRldGVjdFJvdyhjdXJzb3IpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRTY2FuUm93cyhjdXJzb3IpWzBdXG4gIH1cblxuICBtb3ZlQ3Vyc29yKGN1cnNvcikge1xuICAgIHRoaXMubW92ZUN1cnNvckNvdW50VGltZXMoY3Vyc29yLCAoKSA9PiB7XG4gICAgICBjb25zdCByb3cgPSB0aGlzLmRldGVjdFJvdyhjdXJzb3IpXG4gICAgICBpZiAocm93ICE9IG51bGwpIHRoaXMudXRpbHMubW92ZUN1cnNvclRvRmlyc3RDaGFyYWN0ZXJBdFJvdyhjdXJzb3IsIHJvdylcbiAgICB9KVxuICB9XG59XG5cbmNsYXNzIE1vdmVUb05leHRGb2xkU3RhcnQgZXh0ZW5kcyBNb3ZlVG9QcmV2aW91c0ZvbGRTdGFydCB7XG4gIGRpcmVjdGlvbiA9IFwibmV4dFwiXG59XG5cbmNsYXNzIE1vdmVUb1ByZXZpb3VzRm9sZFN0YXJ0V2l0aFNhbWVJbmRlbnQgZXh0ZW5kcyBNb3ZlVG9QcmV2aW91c0ZvbGRTdGFydCB7XG4gIGRldGVjdFJvdyhjdXJzb3IpIHtcbiAgICBjb25zdCBiYXNlSW5kZW50TGV2ZWwgPSB0aGlzLmVkaXRvci5pbmRlbnRhdGlvbkZvckJ1ZmZlclJvdyhjdXJzb3IuZ2V0QnVmZmVyUm93KCkpXG4gICAgcmV0dXJuIHRoaXMuZ2V0U2NhblJvd3MoY3Vyc29yKS5maW5kKHJvdyA9PiB0aGlzLmVkaXRvci5pbmRlbnRhdGlvbkZvckJ1ZmZlclJvdyhyb3cpID09PSBiYXNlSW5kZW50TGV2ZWwpXG4gIH1cbn1cblxuY2xhc3MgTW92ZVRvTmV4dEZvbGRTdGFydFdpdGhTYW1lSW5kZW50IGV4dGVuZHMgTW92ZVRvUHJldmlvdXNGb2xkU3RhcnRXaXRoU2FtZUluZGVudCB7XG4gIGRpcmVjdGlvbiA9IFwibmV4dFwiXG59XG5cbmNsYXNzIE1vdmVUb1ByZXZpb3VzRm9sZEVuZCBleHRlbmRzIE1vdmVUb1ByZXZpb3VzRm9sZFN0YXJ0IHtcbiAgd2hpY2ggPSBcImVuZFwiXG59XG5cbmNsYXNzIE1vdmVUb05leHRGb2xkRW5kIGV4dGVuZHMgTW92ZVRvUHJldmlvdXNGb2xkRW5kIHtcbiAgZGlyZWN0aW9uID0gXCJuZXh0XCJcbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgTW92ZVRvUHJldmlvdXNGdW5jdGlvbiBleHRlbmRzIE1vdmVUb1ByZXZpb3VzRm9sZFN0YXJ0IHtcbiAgZGlyZWN0aW9uID0gXCJwcmV2aW91c1wiXG4gIGRldGVjdFJvdyhjdXJzb3IpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRTY2FuUm93cyhjdXJzb3IpLmZpbmQocm93ID0+IHRoaXMudXRpbHMuaXNJbmNsdWRlRnVuY3Rpb25TY29wZUZvclJvdyh0aGlzLmVkaXRvciwgcm93KSlcbiAgfVxufVxuXG5jbGFzcyBNb3ZlVG9OZXh0RnVuY3Rpb24gZXh0ZW5kcyBNb3ZlVG9QcmV2aW91c0Z1bmN0aW9uIHtcbiAgZGlyZWN0aW9uID0gXCJuZXh0XCJcbn1cblxuY2xhc3MgTW92ZVRvUHJldmlvdXNGdW5jdGlvbkFuZFJlZHJhd0N1cnNvckxpbmVBdFVwcGVyTWlkZGxlIGV4dGVuZHMgTW92ZVRvUHJldmlvdXNGdW5jdGlvbiB7XG4gIGV4ZWN1dGUoKSB7XG4gICAgc3VwZXIuZXhlY3V0ZSgpXG4gICAgdGhpcy5nZXRJbnN0YW5jZShcIlJlZHJhd0N1cnNvckxpbmVBdFVwcGVyTWlkZGxlXCIpLmV4ZWN1dGUoKVxuICB9XG59XG5cbmNsYXNzIE1vdmVUb05leHRGdW5jdGlvbkFuZFJlZHJhd0N1cnNvckxpbmVBdFVwcGVyTWlkZGxlIGV4dGVuZHMgTW92ZVRvUHJldmlvdXNGdW5jdGlvbkFuZFJlZHJhd0N1cnNvckxpbmVBdFVwcGVyTWlkZGxlIHtcbiAgZGlyZWN0aW9uID0gXCJuZXh0XCJcbn1cblxuLy8gU2NvcGUgYmFzZWRcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIE1vdmVUb1Bvc2l0aW9uQnlTY29wZSBleHRlbmRzIE1vdGlvbiB7XG4gIHN0YXRpYyBjb21tYW5kID0gZmFsc2VcbiAgZGlyZWN0aW9uID0gXCJiYWNrd2FyZFwiXG4gIHNjb3BlID0gXCIuXCJcblxuICBtb3ZlQ3Vyc29yKGN1cnNvcikge1xuICAgIHRoaXMubW92ZUN1cnNvckNvdW50VGltZXMoY3Vyc29yLCAoKSA9PiB7XG4gICAgICBjb25zdCBjdXJzb3JQb3NpdGlvbiA9IGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXG4gICAgICBjb25zdCBwb2ludCA9IHRoaXMudXRpbHMuZGV0ZWN0U2NvcGVTdGFydFBvc2l0aW9uRm9yU2NvcGUodGhpcy5lZGl0b3IsIGN1cnNvclBvc2l0aW9uLCB0aGlzLmRpcmVjdGlvbiwgdGhpcy5zY29wZSlcbiAgICAgIGlmIChwb2ludCkgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHBvaW50KVxuICAgIH0pXG4gIH1cbn1cblxuY2xhc3MgTW92ZVRvUHJldmlvdXNTdHJpbmcgZXh0ZW5kcyBNb3ZlVG9Qb3NpdGlvbkJ5U2NvcGUge1xuICBkaXJlY3Rpb24gPSBcImJhY2t3YXJkXCJcbiAgc2NvcGUgPSBcInN0cmluZy5iZWdpblwiXG59XG5cbmNsYXNzIE1vdmVUb05leHRTdHJpbmcgZXh0ZW5kcyBNb3ZlVG9QcmV2aW91c1N0cmluZyB7XG4gIGRpcmVjdGlvbiA9IFwiZm9yd2FyZFwiXG59XG5cbmNsYXNzIE1vdmVUb1ByZXZpb3VzTnVtYmVyIGV4dGVuZHMgTW92ZVRvUG9zaXRpb25CeVNjb3BlIHtcbiAgZGlyZWN0aW9uID0gXCJiYWNrd2FyZFwiXG4gIHNjb3BlID0gXCJjb25zdGFudC5udW1lcmljXCJcbn1cblxuY2xhc3MgTW92ZVRvTmV4dE51bWJlciBleHRlbmRzIE1vdmVUb1ByZXZpb3VzTnVtYmVyIHtcbiAgZGlyZWN0aW9uID0gXCJmb3J3YXJkXCJcbn1cblxuY2xhc3MgTW92ZVRvTmV4dE9jY3VycmVuY2UgZXh0ZW5kcyBNb3Rpb24ge1xuICAvLyBFbnN1cmUgdGhpcyBjb21tYW5kIGlzIGF2YWlsYWJsZSB3aGVuIG9ubHkgaGFzLW9jY3VycmVuY2VcbiAgc3RhdGljIGNvbW1hbmRTY29wZSA9IFwiYXRvbS10ZXh0LWVkaXRvci52aW0tbW9kZS1wbHVzLmhhcy1vY2N1cnJlbmNlXCJcbiAganVtcCA9IHRydWVcbiAgZGlyZWN0aW9uID0gXCJuZXh0XCJcblxuICBleGVjdXRlKCkge1xuICAgIHRoaXMucmFuZ2VzID0gdGhpcy51dGlscy5zb3J0UmFuZ2VzKHRoaXMub2NjdXJyZW5jZU1hbmFnZXIuZ2V0TWFya2VycygpLm1hcChtYXJrZXIgPT4gbWFya2VyLmdldEJ1ZmZlclJhbmdlKCkpKVxuICAgIHN1cGVyLmV4ZWN1dGUoKVxuICB9XG5cbiAgbW92ZUN1cnNvcihjdXJzb3IpIHtcbiAgICBjb25zdCByYW5nZSA9IHRoaXMucmFuZ2VzW3RoaXMudXRpbHMuZ2V0SW5kZXgodGhpcy5nZXRJbmRleChjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKSksIHRoaXMucmFuZ2VzKV1cbiAgICBjb25zdCBwb2ludCA9IHJhbmdlLnN0YXJ0XG4gICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHBvaW50LCB7YXV0b3Njcm9sbDogZmFsc2V9KVxuXG4gICAgdGhpcy5lZGl0b3IudW5mb2xkQnVmZmVyUm93KHBvaW50LnJvdylcbiAgICBpZiAoY3Vyc29yLmlzTGFzdEN1cnNvcigpKSB7XG4gICAgICB0aGlzLnV0aWxzLnNtYXJ0U2Nyb2xsVG9CdWZmZXJQb3NpdGlvbih0aGlzLmVkaXRvciwgcG9pbnQpXG4gICAgfVxuXG4gICAgaWYgKHRoaXMuZ2V0Q29uZmlnKFwiZmxhc2hPbk1vdmVUb09jY3VycmVuY2VcIikpIHtcbiAgICAgIHRoaXMudmltU3RhdGUuZmxhc2gocmFuZ2UsIHt0eXBlOiBcInNlYXJjaFwifSlcbiAgICB9XG4gIH1cblxuICBnZXRJbmRleChmcm9tUG9pbnQpIHtcbiAgICBjb25zdCBpbmRleCA9IHRoaXMucmFuZ2VzLmZpbmRJbmRleChyYW5nZSA9PiByYW5nZS5zdGFydC5pc0dyZWF0ZXJUaGFuKGZyb21Qb2ludCkpXG4gICAgcmV0dXJuIChpbmRleCA+PSAwID8gaW5kZXggOiAwKSArIHRoaXMuZ2V0Q291bnQoKSAtIDFcbiAgfVxufVxuXG5jbGFzcyBNb3ZlVG9QcmV2aW91c09jY3VycmVuY2UgZXh0ZW5kcyBNb3ZlVG9OZXh0T2NjdXJyZW5jZSB7XG4gIGRpcmVjdGlvbiA9IFwicHJldmlvdXNcIlxuXG4gIGdldEluZGV4KGZyb21Qb2ludCkge1xuICAgIGNvbnN0IHJhbmdlcyA9IHRoaXMucmFuZ2VzLnNsaWNlKCkucmV2ZXJzZSgpXG4gICAgY29uc3QgcmFuZ2UgPSByYW5nZXMuZmluZChyYW5nZSA9PiByYW5nZS5lbmQuaXNMZXNzVGhhbihmcm9tUG9pbnQpKVxuICAgIGNvbnN0IGluZGV4ID0gcmFuZ2UgPyB0aGlzLnJhbmdlcy5pbmRleE9mKHJhbmdlKSA6IHRoaXMucmFuZ2VzLmxlbmd0aCAtIDFcbiAgICByZXR1cm4gaW5kZXggLSAodGhpcy5nZXRDb3VudCgpIC0gMSlcbiAgfVxufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBrZXltYXA6ICVcbmNsYXNzIE1vdmVUb1BhaXIgZXh0ZW5kcyBNb3Rpb24ge1xuICBpbmNsdXNpdmUgPSB0cnVlXG4gIGp1bXAgPSB0cnVlXG4gIG1lbWJlciA9IFtcIlBhcmVudGhlc2lzXCIsIFwiQ3VybHlCcmFja2V0XCIsIFwiU3F1YXJlQnJhY2tldFwiXVxuXG4gIG1vdmVDdXJzb3IoY3Vyc29yKSB7XG4gICAgY29uc3QgcG9pbnQgPSB0aGlzLmdldFBvaW50KGN1cnNvcilcbiAgICBpZiAocG9pbnQpIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihwb2ludClcbiAgfVxuXG4gIGdldFBvaW50Rm9yVGFnKHBvaW50KSB7XG4gICAgY29uc3QgcGFpckluZm8gPSB0aGlzLmdldEluc3RhbmNlKFwiQVRhZ1wiKS5nZXRQYWlySW5mbyhwb2ludClcbiAgICBpZiAoIXBhaXJJbmZvKSByZXR1cm5cblxuICAgIGxldCB7b3BlblJhbmdlLCBjbG9zZVJhbmdlfSA9IHBhaXJJbmZvXG4gICAgb3BlblJhbmdlID0gb3BlblJhbmdlLnRyYW5zbGF0ZShbMCwgKzFdLCBbMCwgLTFdKVxuICAgIGNsb3NlUmFuZ2UgPSBjbG9zZVJhbmdlLnRyYW5zbGF0ZShbMCwgKzFdLCBbMCwgLTFdKVxuICAgIGlmIChvcGVuUmFuZ2UuY29udGFpbnNQb2ludChwb2ludCkgJiYgIXBvaW50LmlzRXF1YWwob3BlblJhbmdlLmVuZCkpIHtcbiAgICAgIHJldHVybiBjbG9zZVJhbmdlLnN0YXJ0XG4gICAgfVxuICAgIGlmIChjbG9zZVJhbmdlLmNvbnRhaW5zUG9pbnQocG9pbnQpICYmICFwb2ludC5pc0VxdWFsKGNsb3NlUmFuZ2UuZW5kKSkge1xuICAgICAgcmV0dXJuIG9wZW5SYW5nZS5zdGFydFxuICAgIH1cbiAgfVxuXG4gIGdldFBvaW50KGN1cnNvcikge1xuICAgIGNvbnN0IGN1cnNvclBvc2l0aW9uID0gY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKClcbiAgICBjb25zdCBjdXJzb3JSb3cgPSBjdXJzb3JQb3NpdGlvbi5yb3dcbiAgICBjb25zdCBwb2ludCA9IHRoaXMuZ2V0UG9pbnRGb3JUYWcoY3Vyc29yUG9zaXRpb24pXG4gICAgaWYgKHBvaW50KSByZXR1cm4gcG9pbnRcblxuICAgIC8vIEFBbnlQYWlyQWxsb3dGb3J3YXJkaW5nIHJldHVybiBmb3J3YXJkaW5nIHJhbmdlIG9yIGVuY2xvc2luZyByYW5nZS5cbiAgICBjb25zdCByYW5nZSA9IHRoaXMuZ2V0SW5zdGFuY2UoXCJBQW55UGFpckFsbG93Rm9yd2FyZGluZ1wiLCB7bWVtYmVyOiB0aGlzLm1lbWJlcn0pLmdldFJhbmdlKGN1cnNvci5zZWxlY3Rpb24pXG4gICAgaWYgKCFyYW5nZSkgcmV0dXJuXG5cbiAgICBjb25zdCB7c3RhcnQsIGVuZH0gPSByYW5nZVxuICAgIGlmIChzdGFydC5yb3cgPT09IGN1cnNvclJvdyAmJiBzdGFydC5pc0dyZWF0ZXJUaGFuT3JFcXVhbChjdXJzb3JQb3NpdGlvbikpIHtcbiAgICAgIC8vIEZvcndhcmRpbmcgcmFuZ2UgZm91bmRcbiAgICAgIHJldHVybiBlbmQudHJhbnNsYXRlKFswLCAtMV0pXG4gICAgfSBlbHNlIGlmIChlbmQucm93ID09PSBjdXJzb3JQb3NpdGlvbi5yb3cpIHtcbiAgICAgIC8vIEVuY2xvc2luZyByYW5nZSB3YXMgcmV0dXJuZWRcbiAgICAgIC8vIFdlIG1vdmUgdG8gc3RhcnQoIG9wZW4tcGFpciApIG9ubHkgd2hlbiBjbG9zZS1wYWlyIHdhcyBhdCBzYW1lIHJvdyBhcyBjdXJzb3Itcm93LlxuICAgICAgcmV0dXJuIHN0YXJ0XG4gICAgfVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBNb3Rpb24sXG4gIEN1cnJlbnRTZWxlY3Rpb24sXG4gIE1vdmVMZWZ0LFxuICBNb3ZlUmlnaHQsXG4gIE1vdmVSaWdodEJ1ZmZlckNvbHVtbixcbiAgTW92ZVVwLFxuICBNb3ZlVXBXcmFwLFxuICBNb3ZlRG93bixcbiAgTW92ZURvd25XcmFwLFxuICBNb3ZlVXBTY3JlZW4sXG4gIE1vdmVEb3duU2NyZWVuLFxuICBNb3ZlVXBUb0VkZ2UsXG4gIE1vdmVEb3duVG9FZGdlLFxuICBXb3JkTW90aW9uLFxuICBNb3ZlVG9OZXh0V29yZCxcbiAgTW92ZVRvTmV4dFdob2xlV29yZCxcbiAgTW92ZVRvTmV4dEFscGhhbnVtZXJpY1dvcmQsXG4gIE1vdmVUb05leHRTbWFydFdvcmQsXG4gIE1vdmVUb05leHRTdWJ3b3JkLFxuICBNb3ZlVG9QcmV2aW91c1dvcmQsXG4gIE1vdmVUb1ByZXZpb3VzV2hvbGVXb3JkLFxuICBNb3ZlVG9QcmV2aW91c0FscGhhbnVtZXJpY1dvcmQsXG4gIE1vdmVUb1ByZXZpb3VzU21hcnRXb3JkLFxuICBNb3ZlVG9QcmV2aW91c1N1YndvcmQsXG4gIE1vdmVUb0VuZE9mV29yZCxcbiAgTW92ZVRvRW5kT2ZXaG9sZVdvcmQsXG4gIE1vdmVUb0VuZE9mQWxwaGFudW1lcmljV29yZCxcbiAgTW92ZVRvRW5kT2ZTbWFydFdvcmQsXG4gIE1vdmVUb0VuZE9mU3Vid29yZCxcbiAgTW92ZVRvUHJldmlvdXNFbmRPZldvcmQsXG4gIE1vdmVUb1ByZXZpb3VzRW5kT2ZXaG9sZVdvcmQsXG4gIE1vdmVUb05leHRTZW50ZW5jZSxcbiAgTW92ZVRvUHJldmlvdXNTZW50ZW5jZSxcbiAgTW92ZVRvTmV4dFNlbnRlbmNlU2tpcEJsYW5rUm93LFxuICBNb3ZlVG9QcmV2aW91c1NlbnRlbmNlU2tpcEJsYW5rUm93LFxuICBNb3ZlVG9OZXh0UGFyYWdyYXBoLFxuICBNb3ZlVG9QcmV2aW91c1BhcmFncmFwaCxcbiAgTW92ZVRvQmVnaW5uaW5nT2ZMaW5lLFxuICBNb3ZlVG9Db2x1bW4sXG4gIE1vdmVUb0xhc3RDaGFyYWN0ZXJPZkxpbmUsXG4gIE1vdmVUb0xhc3ROb25ibGFua0NoYXJhY3Rlck9mTGluZUFuZERvd24sXG4gIE1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lLFxuICBNb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZVVwLFxuICBNb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZURvd24sXG4gIE1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lQW5kRG93bixcbiAgTW92ZVRvU2NyZWVuQ29sdW1uLFxuICBNb3ZlVG9CZWdpbm5pbmdPZlNjcmVlbkxpbmUsXG4gIE1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZTY3JlZW5MaW5lLFxuICBNb3ZlVG9MYXN0Q2hhcmFjdGVyT2ZTY3JlZW5MaW5lLFxuICBNb3ZlVG9GaXJzdExpbmUsXG4gIE1vdmVUb0xhc3RMaW5lLFxuICBNb3ZlVG9MaW5lQnlQZXJjZW50LFxuICBNb3ZlVG9SZWxhdGl2ZUxpbmUsXG4gIE1vdmVUb1JlbGF0aXZlTGluZU1pbmltdW1Ud28sXG4gIE1vdmVUb1RvcE9mU2NyZWVuLFxuICBNb3ZlVG9NaWRkbGVPZlNjcmVlbixcbiAgTW92ZVRvQm90dG9tT2ZTY3JlZW4sXG4gIFNjcm9sbCxcbiAgU2Nyb2xsRnVsbFNjcmVlbkRvd24sXG4gIFNjcm9sbEZ1bGxTY3JlZW5VcCxcbiAgU2Nyb2xsSGFsZlNjcmVlbkRvd24sXG4gIFNjcm9sbEhhbGZTY3JlZW5VcCxcbiAgU2Nyb2xsUXVhcnRlclNjcmVlbkRvd24sXG4gIFNjcm9sbFF1YXJ0ZXJTY3JlZW5VcCxcbiAgRmluZCxcbiAgRmluZEJhY2t3YXJkcyxcbiAgVGlsbCxcbiAgVGlsbEJhY2t3YXJkcyxcbiAgTW92ZVRvTWFyayxcbiAgTW92ZVRvTWFya0xpbmUsXG4gIE1vdmVUb1ByZXZpb3VzRm9sZFN0YXJ0LFxuICBNb3ZlVG9OZXh0Rm9sZFN0YXJ0LFxuICBNb3ZlVG9QcmV2aW91c0ZvbGRTdGFydFdpdGhTYW1lSW5kZW50LFxuICBNb3ZlVG9OZXh0Rm9sZFN0YXJ0V2l0aFNhbWVJbmRlbnQsXG4gIE1vdmVUb1ByZXZpb3VzRm9sZEVuZCxcbiAgTW92ZVRvTmV4dEZvbGRFbmQsXG4gIE1vdmVUb1ByZXZpb3VzRnVuY3Rpb24sXG4gIE1vdmVUb05leHRGdW5jdGlvbixcbiAgTW92ZVRvUHJldmlvdXNGdW5jdGlvbkFuZFJlZHJhd0N1cnNvckxpbmVBdFVwcGVyTWlkZGxlLFxuICBNb3ZlVG9OZXh0RnVuY3Rpb25BbmRSZWRyYXdDdXJzb3JMaW5lQXRVcHBlck1pZGRsZSxcbiAgTW92ZVRvUG9zaXRpb25CeVNjb3BlLFxuICBNb3ZlVG9QcmV2aW91c1N0cmluZyxcbiAgTW92ZVRvTmV4dFN0cmluZyxcbiAgTW92ZVRvUHJldmlvdXNOdW1iZXIsXG4gIE1vdmVUb05leHROdW1iZXIsXG4gIE1vdmVUb05leHRPY2N1cnJlbmNlLFxuICBNb3ZlVG9QcmV2aW91c09jY3VycmVuY2UsXG4gIE1vdmVUb1BhaXIsXG59XG4iXX0=