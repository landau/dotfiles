"use babel";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _require = require("atom");

var Range = _require.Range;

var Base = require("./base");

var MiscCommand = (function (_Base) {
  _inherits(MiscCommand, _Base);

  function MiscCommand() {
    _classCallCheck(this, MiscCommand);

    _get(Object.getPrototypeOf(MiscCommand.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(MiscCommand, null, [{
    key: "operationKind",
    value: "misc-command",
    enumerable: true
  }]);

  return MiscCommand;
})(Base);

MiscCommand.register(false);

var Mark = (function (_MiscCommand) {
  _inherits(Mark, _MiscCommand);

  function Mark() {
    _classCallCheck(this, Mark);

    _get(Object.getPrototypeOf(Mark.prototype), "constructor", this).apply(this, arguments);

    this.requireInput = true;
  }

  _createClass(Mark, [{
    key: "initialize",
    value: function initialize() {
      this.readChar();
      _get(Object.getPrototypeOf(Mark.prototype), "initialize", this).call(this);
    }
  }, {
    key: "execute",
    value: function execute() {
      this.vimState.mark.set(this.input, this.getCursorBufferPosition());
    }
  }]);

  return Mark;
})(MiscCommand);

Mark.register();

var ReverseSelections = (function (_MiscCommand2) {
  _inherits(ReverseSelections, _MiscCommand2);

  function ReverseSelections() {
    _classCallCheck(this, ReverseSelections);

    _get(Object.getPrototypeOf(ReverseSelections.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(ReverseSelections, [{
    key: "execute",
    value: function execute() {
      this.swrap.setReversedState(this.editor, !this.editor.getLastSelection().isReversed());
      if (this.isMode("visual", "blockwise")) {
        this.getLastBlockwiseSelection().autoscroll();
      }
    }
  }]);

  return ReverseSelections;
})(MiscCommand);

ReverseSelections.register();

var BlockwiseOtherEnd = (function (_ReverseSelections) {
  _inherits(BlockwiseOtherEnd, _ReverseSelections);

  function BlockwiseOtherEnd() {
    _classCallCheck(this, BlockwiseOtherEnd);

    _get(Object.getPrototypeOf(BlockwiseOtherEnd.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(BlockwiseOtherEnd, [{
    key: "execute",
    value: function execute() {
      for (var blockwiseSelection of this.getBlockwiseSelections()) {
        blockwiseSelection.reverse();
      }
      _get(Object.getPrototypeOf(BlockwiseOtherEnd.prototype), "execute", this).call(this);
    }
  }]);

  return BlockwiseOtherEnd;
})(ReverseSelections);

BlockwiseOtherEnd.register();

var Undo = (function (_MiscCommand3) {
  _inherits(Undo, _MiscCommand3);

  function Undo() {
    _classCallCheck(this, Undo);

    _get(Object.getPrototypeOf(Undo.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(Undo, [{
    key: "setCursorPosition",
    value: function setCursorPosition(_ref) {
      var newRanges = _ref.newRanges;
      var oldRanges = _ref.oldRanges;
      var strategy = _ref.strategy;

      var lastCursor = this.editor.getLastCursor(); // This is restored cursor

      var changedRange = strategy === "smart" ? this.utils.findRangeContainsPoint(newRanges, lastCursor.getBufferPosition()) : this.utils.sortRanges(newRanges.concat(oldRanges))[0];

      if (changedRange) {
        if (this.utils.isLinewiseRange(changedRange)) this.utils.setBufferRow(lastCursor, changedRange.start.row);else lastCursor.setBufferPosition(changedRange.start);
      }
    }
  }, {
    key: "mutateWithTrackChanges",
    value: function mutateWithTrackChanges() {
      var newRanges = [];
      var oldRanges = [];

      // Collect changed range while mutating text-state by fn callback.
      var disposable = this.editor.getBuffer().onDidChange(function (_ref2) {
        var newRange = _ref2.newRange;
        var oldRange = _ref2.oldRange;

        if (newRange.isEmpty()) {
          oldRanges.push(oldRange); // Remove only
        } else {
            newRanges.push(newRange);
          }
      });

      this.mutate();
      disposable.dispose();
      return { newRanges: newRanges, oldRanges: oldRanges };
    }
  }, {
    key: "flashChanges",
    value: function flashChanges(_ref3) {
      var _this = this;

      var newRanges = _ref3.newRanges;
      var oldRanges = _ref3.oldRanges;

      var isMultipleSingleLineRanges = function isMultipleSingleLineRanges(ranges) {
        return ranges.length > 1 && ranges.every(_this.utils.isSingleLineRange);
      };

      if (newRanges.length > 0) {
        if (this.isMultipleAndAllRangeHaveSameColumnAndConsecutiveRows(newRanges)) return;

        newRanges = newRanges.map(function (range) {
          return _this.utils.humanizeBufferRange(_this.editor, range);
        });
        newRanges = this.filterNonLeadingWhiteSpaceRange(newRanges);

        var type = isMultipleSingleLineRanges(newRanges) ? "undo-redo-multiple-changes" : "undo-redo";
        this.flash(newRanges, { type: type });
      } else {
        if (this.isMultipleAndAllRangeHaveSameColumnAndConsecutiveRows(oldRanges)) return;

        if (isMultipleSingleLineRanges(oldRanges)) {
          oldRanges = this.filterNonLeadingWhiteSpaceRange(oldRanges);
          this.flash(oldRanges, { type: "undo-redo-multiple-delete" });
        }
      }
    }
  }, {
    key: "filterNonLeadingWhiteSpaceRange",
    value: function filterNonLeadingWhiteSpaceRange(ranges) {
      var _this2 = this;

      return ranges.filter(function (range) {
        return !_this2.utils.isLeadingWhiteSpaceRange(_this2.editor, range);
      });
    }

    // [TODO] Improve further by checking oldText, newText?
    // [Purpose of this function]
    // Suppress flash when undo/redoing toggle-comment while flashing undo/redo of occurrence operation.
    // This huristic approach never be perfect.
    // Ultimately cannnot distinguish occurrence operation.
  }, {
    key: "isMultipleAndAllRangeHaveSameColumnAndConsecutiveRows",
    value: function isMultipleAndAllRangeHaveSameColumnAndConsecutiveRows(ranges) {
      if (ranges.length <= 1) {
        return false;
      }

      var _ranges$0 = ranges[0];
      var startColumn = _ranges$0.start.column;
      var endColumn = _ranges$0.end.column;

      var previousRow = undefined;

      for (var range of ranges) {
        var start = range.start;
        var end = range.end;

        if (start.column !== startColumn || end.column !== endColumn) return false;
        if (previousRow != null && previousRow + 1 !== start.row) return false;
        previousRow = start.row;
      }
      return true;
    }
  }, {
    key: "flash",
    value: function flash(ranges, options) {
      var _this3 = this;

      if (options.timeout == null) options.timeout = 500;
      this.onDidFinishOperation(function () {
        return _this3.vimState.flash(ranges, options);
      });
    }
  }, {
    key: "execute",
    value: function execute() {
      var _mutateWithTrackChanges = this.mutateWithTrackChanges();

      var newRanges = _mutateWithTrackChanges.newRanges;
      var oldRanges = _mutateWithTrackChanges.oldRanges;

      for (var selection of this.editor.getSelections()) {
        selection.clear();
      }

      if (this.getConfig("setCursorToStartOfChangeOnUndoRedo")) {
        var strategy = this.getConfig("setCursorToStartOfChangeOnUndoRedoStrategy");
        this.setCursorPosition({ newRanges: newRanges, oldRanges: oldRanges, strategy: strategy });
        this.vimState.clearSelections();
      }

      if (this.getConfig("flashOnUndoRedo")) this.flashChanges({ newRanges: newRanges, oldRanges: oldRanges });
      this.activateMode("normal");
    }
  }, {
    key: "mutate",
    value: function mutate() {
      this.editor.undo();
    }
  }]);

  return Undo;
})(MiscCommand);

Undo.register();

var Redo = (function (_Undo) {
  _inherits(Redo, _Undo);

  function Redo() {
    _classCallCheck(this, Redo);

    _get(Object.getPrototypeOf(Redo.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(Redo, [{
    key: "mutate",
    value: function mutate() {
      this.editor.redo();
    }
  }]);

  return Redo;
})(Undo);

Redo.register();

// zc

var FoldCurrentRow = (function (_MiscCommand4) {
  _inherits(FoldCurrentRow, _MiscCommand4);

  function FoldCurrentRow() {
    _classCallCheck(this, FoldCurrentRow);

    _get(Object.getPrototypeOf(FoldCurrentRow.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(FoldCurrentRow, [{
    key: "execute",
    value: function execute() {
      for (var point of this.getCursorBufferPositions()) {
        this.editor.foldBufferRow(point.row);
      }
    }
  }]);

  return FoldCurrentRow;
})(MiscCommand);

FoldCurrentRow.register();

// zo

var UnfoldCurrentRow = (function (_MiscCommand5) {
  _inherits(UnfoldCurrentRow, _MiscCommand5);

  function UnfoldCurrentRow() {
    _classCallCheck(this, UnfoldCurrentRow);

    _get(Object.getPrototypeOf(UnfoldCurrentRow.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(UnfoldCurrentRow, [{
    key: "execute",
    value: function execute() {
      for (var point of this.getCursorBufferPositions()) {
        this.editor.unfoldBufferRow(point.row);
      }
    }
  }]);

  return UnfoldCurrentRow;
})(MiscCommand);

UnfoldCurrentRow.register();

// za

var ToggleFold = (function (_MiscCommand6) {
  _inherits(ToggleFold, _MiscCommand6);

  function ToggleFold() {
    _classCallCheck(this, ToggleFold);

    _get(Object.getPrototypeOf(ToggleFold.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(ToggleFold, [{
    key: "execute",
    value: function execute() {
      for (var point of this.getCursorBufferPositions()) {
        this.editor.toggleFoldAtBufferRow(point.row);
      }
    }
  }]);

  return ToggleFold;
})(MiscCommand);

ToggleFold.register();

// Base of zC, zO, zA

var FoldCurrentRowRecursivelyBase = (function (_MiscCommand7) {
  _inherits(FoldCurrentRowRecursivelyBase, _MiscCommand7);

  function FoldCurrentRowRecursivelyBase() {
    _classCallCheck(this, FoldCurrentRowRecursivelyBase);

    _get(Object.getPrototypeOf(FoldCurrentRowRecursivelyBase.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(FoldCurrentRowRecursivelyBase, [{
    key: "eachFoldStartRow",
    value: function eachFoldStartRow(fn) {
      for (var _ref42 of this.getCursorBufferPositionsOrdered().reverse()) {
        var row = _ref42.row;

        if (!this.editor.isFoldableAtBufferRow(row)) continue;

        this.utils.getFoldRowRangesContainedByFoldStartsAtRow(this.editor, row).map(function (rowRange) {
          return rowRange[0];
        }) // mapt to startRow of fold
        .reverse() // reverse to process encolosed(nested) fold first than encolosing fold.
        .forEach(fn);
      }
    }
  }, {
    key: "foldRecursively",
    value: function foldRecursively() {
      var _this4 = this;

      this.eachFoldStartRow(function (row) {
        if (!_this4.editor.isFoldedAtBufferRow(row)) _this4.editor.foldBufferRow(row);
      });
    }
  }, {
    key: "unfoldRecursively",
    value: function unfoldRecursively() {
      var _this5 = this;

      this.eachFoldStartRow(function (row) {
        if (_this5.editor.isFoldedAtBufferRow(row)) _this5.editor.unfoldBufferRow(row);
      });
    }
  }]);

  return FoldCurrentRowRecursivelyBase;
})(MiscCommand);

FoldCurrentRowRecursivelyBase.register(false);

// zC

var FoldCurrentRowRecursively = (function (_FoldCurrentRowRecursivelyBase) {
  _inherits(FoldCurrentRowRecursively, _FoldCurrentRowRecursivelyBase);

  function FoldCurrentRowRecursively() {
    _classCallCheck(this, FoldCurrentRowRecursively);

    _get(Object.getPrototypeOf(FoldCurrentRowRecursively.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(FoldCurrentRowRecursively, [{
    key: "execute",
    value: function execute() {
      this.foldRecursively();
    }
  }]);

  return FoldCurrentRowRecursively;
})(FoldCurrentRowRecursivelyBase);

FoldCurrentRowRecursively.register();

// zO

var UnfoldCurrentRowRecursively = (function (_FoldCurrentRowRecursivelyBase2) {
  _inherits(UnfoldCurrentRowRecursively, _FoldCurrentRowRecursivelyBase2);

  function UnfoldCurrentRowRecursively() {
    _classCallCheck(this, UnfoldCurrentRowRecursively);

    _get(Object.getPrototypeOf(UnfoldCurrentRowRecursively.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(UnfoldCurrentRowRecursively, [{
    key: "execute",
    value: function execute() {
      this.unfoldRecursively();
    }
  }]);

  return UnfoldCurrentRowRecursively;
})(FoldCurrentRowRecursivelyBase);

UnfoldCurrentRowRecursively.register();

// zA

var ToggleFoldRecursively = (function (_FoldCurrentRowRecursivelyBase3) {
  _inherits(ToggleFoldRecursively, _FoldCurrentRowRecursivelyBase3);

  function ToggleFoldRecursively() {
    _classCallCheck(this, ToggleFoldRecursively);

    _get(Object.getPrototypeOf(ToggleFoldRecursively.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(ToggleFoldRecursively, [{
    key: "execute",
    value: function execute() {
      if (this.editor.isFoldedAtBufferRow(this.getCursorBufferPosition().row)) {
        this.unfoldRecursively();
      } else {
        this.foldRecursively();
      }
    }
  }]);

  return ToggleFoldRecursively;
})(FoldCurrentRowRecursivelyBase);

ToggleFoldRecursively.register();

// zR

var UnfoldAll = (function (_MiscCommand8) {
  _inherits(UnfoldAll, _MiscCommand8);

  function UnfoldAll() {
    _classCallCheck(this, UnfoldAll);

    _get(Object.getPrototypeOf(UnfoldAll.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(UnfoldAll, [{
    key: "execute",
    value: function execute() {
      this.editor.unfoldAll();
    }
  }]);

  return UnfoldAll;
})(MiscCommand);

UnfoldAll.register();

// zM

var FoldAll = (function (_MiscCommand9) {
  _inherits(FoldAll, _MiscCommand9);

  function FoldAll() {
    _classCallCheck(this, FoldAll);

    _get(Object.getPrototypeOf(FoldAll.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(FoldAll, [{
    key: "execute",
    value: function execute() {
      var _utils$getFoldInfoByKind = this.utils.getFoldInfoByKind(this.editor);

      var allFold = _utils$getFoldInfoByKind.allFold;

      if (!allFold) return;

      this.editor.unfoldAll();
      for (var _ref52 of allFold.rowRangesWithIndent) {
        var indent = _ref52.indent;
        var startRow = _ref52.startRow;
        var endRow = _ref52.endRow;

        if (indent <= this.getConfig("maxFoldableIndentLevel")) {
          this.editor.foldBufferRowRange(startRow, endRow);
        }
      }
      this.editor.scrollToCursorPosition({ center: true });
    }
  }]);

  return FoldAll;
})(MiscCommand);

FoldAll.register();

// zr

var UnfoldNextIndentLevel = (function (_MiscCommand10) {
  _inherits(UnfoldNextIndentLevel, _MiscCommand10);

  function UnfoldNextIndentLevel() {
    _classCallCheck(this, UnfoldNextIndentLevel);

    _get(Object.getPrototypeOf(UnfoldNextIndentLevel.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(UnfoldNextIndentLevel, [{
    key: "execute",
    value: function execute() {
      var _utils$getFoldInfoByKind2 = this.utils.getFoldInfoByKind(this.editor);

      var folded = _utils$getFoldInfoByKind2.folded;

      if (!folded) return;
      var minIndent = folded.minIndent;
      var rowRangesWithIndent = folded.rowRangesWithIndent;

      var count = this.utils.limitNumber(this.getCount() - 1, { min: 0 });
      var targetIndents = this.utils.getList(minIndent, minIndent + count);
      for (var _ref62 of rowRangesWithIndent) {
        var indent = _ref62.indent;
        var startRow = _ref62.startRow;

        if (targetIndents.includes(indent)) {
          this.editor.unfoldBufferRow(startRow);
        }
      }
    }
  }]);

  return UnfoldNextIndentLevel;
})(MiscCommand);

UnfoldNextIndentLevel.register();

// zm

var FoldNextIndentLevel = (function (_MiscCommand11) {
  _inherits(FoldNextIndentLevel, _MiscCommand11);

  function FoldNextIndentLevel() {
    _classCallCheck(this, FoldNextIndentLevel);

    _get(Object.getPrototypeOf(FoldNextIndentLevel.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(FoldNextIndentLevel, [{
    key: "execute",
    value: function execute() {
      var _utils$getFoldInfoByKind3 = this.utils.getFoldInfoByKind(this.editor);

      var unfolded = _utils$getFoldInfoByKind3.unfolded;
      var allFold = _utils$getFoldInfoByKind3.allFold;

      if (!unfolded) return;
      // FIXME: Why I need unfoldAll()? Why can't I just fold non-folded-fold only?
      // Unless unfoldAll() here, @editor.unfoldAll() delete foldMarker but fail
      // to render unfolded rows correctly.
      // I believe this is bug of text-buffer's markerLayer which assume folds are
      // created **in-order** from top-row to bottom-row.
      this.editor.unfoldAll();

      var maxFoldable = this.getConfig("maxFoldableIndentLevel");
      var fromLevel = Math.min(unfolded.maxIndent, maxFoldable);
      var count = this.utils.limitNumber(this.getCount() - 1, { min: 0 });
      fromLevel = this.utils.limitNumber(fromLevel - count, { min: 0 });
      var targetIndents = this.utils.getList(fromLevel, maxFoldable);
      for (var _ref72 of allFold.rowRangesWithIndent) {
        var indent = _ref72.indent;
        var startRow = _ref72.startRow;
        var endRow = _ref72.endRow;

        if (targetIndents.includes(indent)) {
          this.editor.foldBufferRowRange(startRow, endRow);
        }
      }
    }
  }]);

  return FoldNextIndentLevel;
})(MiscCommand);

FoldNextIndentLevel.register();

var ReplaceModeBackspace = (function (_MiscCommand12) {
  _inherits(ReplaceModeBackspace, _MiscCommand12);

  function ReplaceModeBackspace() {
    _classCallCheck(this, ReplaceModeBackspace);

    _get(Object.getPrototypeOf(ReplaceModeBackspace.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(ReplaceModeBackspace, [{
    key: "execute",
    value: function execute() {
      for (var selection of this.editor.getSelections()) {
        // char might be empty.
        var char = this.vimState.modeManager.getReplacedCharForSelection(selection);
        if (char != null) {
          selection.selectLeft();
          if (!selection.insertText(char).isEmpty()) selection.cursor.moveLeft();
        }
      }
    }
  }], [{
    key: "commandScope",
    value: "atom-text-editor.vim-mode-plus.insert-mode.replace",
    enumerable: true
  }]);

  return ReplaceModeBackspace;
})(MiscCommand);

ReplaceModeBackspace.register();

// ctrl-e scroll lines downwards

var ScrollDown = (function (_MiscCommand13) {
  _inherits(ScrollDown, _MiscCommand13);

  function ScrollDown() {
    _classCallCheck(this, ScrollDown);

    _get(Object.getPrototypeOf(ScrollDown.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(ScrollDown, [{
    key: "execute",
    value: function execute() {
      var count = this.getCount();
      var oldFirstRow = this.editor.getFirstVisibleScreenRow();
      this.editor.setFirstVisibleScreenRow(oldFirstRow + count);
      var newFirstRow = this.editor.getFirstVisibleScreenRow();

      var offset = 2;

      var _editor$getCursorScreenPosition = this.editor.getCursorScreenPosition();

      var row = _editor$getCursorScreenPosition.row;
      var column = _editor$getCursorScreenPosition.column;

      if (row < newFirstRow + offset) {
        var newPoint = [row + count, column];
        this.editor.setCursorScreenPosition(newPoint, { autoscroll: false });
      }
    }
  }]);

  return ScrollDown;
})(MiscCommand);

ScrollDown.register();

// ctrl-y scroll lines upwards

var ScrollUp = (function (_MiscCommand14) {
  _inherits(ScrollUp, _MiscCommand14);

  function ScrollUp() {
    _classCallCheck(this, ScrollUp);

    _get(Object.getPrototypeOf(ScrollUp.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(ScrollUp, [{
    key: "execute",
    value: function execute() {
      var count = this.getCount();
      var oldFirstRow = this.editor.getFirstVisibleScreenRow();
      this.editor.setFirstVisibleScreenRow(oldFirstRow - count);
      var newLastRow = this.editor.getLastVisibleScreenRow();

      var offset = 2;

      var _editor$getCursorScreenPosition2 = this.editor.getCursorScreenPosition();

      var row = _editor$getCursorScreenPosition2.row;
      var column = _editor$getCursorScreenPosition2.column;

      if (row >= newLastRow - offset) {
        var newPoint = [row - count, column];
        this.editor.setCursorScreenPosition(newPoint, { autoscroll: false });
      }
    }
  }]);

  return ScrollUp;
})(MiscCommand);

ScrollUp.register();

// Adjust scrollTop to change where curos is shown in viewport.
// +--------+------------------+---------+
// | where  | move to 1st char | no move |
// +--------+------------------+---------+
// | top    | `z enter`        | `z t`   |
// | middle | `z .`            | `z z`   |
// | bottom | `z -`            | `z b`   |
// +--------+------------------+---------+

var ScrollCursor = (function (_MiscCommand15) {
  _inherits(ScrollCursor, _MiscCommand15);

  function ScrollCursor() {
    _classCallCheck(this, ScrollCursor);

    _get(Object.getPrototypeOf(ScrollCursor.prototype), "constructor", this).apply(this, arguments);

    this.moveToFirstCharacterOfLine = false;
    this.where = null;
  }

  _createClass(ScrollCursor, [{
    key: "execute",
    value: function execute() {
      this.editorElement.setScrollTop(this.getScrollTop());
      if (this.moveToFirstCharacterOfLine) this.editor.moveToFirstCharacterOfLine();
    }
  }, {
    key: "getScrollTop",
    value: function getScrollTop() {
      var screenPosition = this.editor.getCursorScreenPosition();

      var _editorElement$pixelPositionForScreenPosition = this.editorElement.pixelPositionForScreenPosition(screenPosition);

      var top = _editorElement$pixelPositionForScreenPosition.top;

      switch (this.where) {
        case "top":
          this.recommendToEnableScrollPastEndIfNecessary();
          return top - this.getOffSetPixelHeight();
        case "middle":
          return top - this.editorElement.getHeight() / 2;
        case "bottom":
          return top - (this.editorElement.getHeight() - this.getOffSetPixelHeight(1));
      }
    }
  }, {
    key: "getOffSetPixelHeight",
    value: function getOffSetPixelHeight() {
      var lineDelta = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];

      var scrolloff = 2; // atom default. Better to use editor.getVerticalScrollMargin()?
      return this.editor.getLineHeightInPixels() * (scrolloff + lineDelta);
    }
  }, {
    key: "recommendToEnableScrollPastEndIfNecessary",
    value: function recommendToEnableScrollPastEndIfNecessary() {
      if (this.editor.getLastVisibleScreenRow() === this.editor.getLastScreenRow() && !this.editor.getScrollPastEnd()) {
        (function () {
          var message = ["vim-mode-plus", "- For `z t` and `z enter` works properly in every situation, `editor.scrollPastEnd` setting need to be `true`.", '- You can enable it from `"Settings" > "Editor" > "Scroll Past End"`.', "- Or **do you allow vmp enable it for you now?**"].join("\n");

          var notification = atom.notifications.addInfo(message, {
            dismissable: true,
            buttons: [{
              text: "No thanks.",
              onDidClick: function onDidClick() {
                return notification.dismiss();
              }
            }, {
              text: "OK. Enable it now!!",
              onDidClick: function onDidClick() {
                atom.config.set("editor.scrollPastEnd", true);
                notification.dismiss();
              }
            }]
          });
        })();
      }
    }
  }]);

  return ScrollCursor;
})(MiscCommand);

ScrollCursor.register(false);

// top: z enter

var ScrollCursorToTop = (function (_ScrollCursor) {
  _inherits(ScrollCursorToTop, _ScrollCursor);

  function ScrollCursorToTop() {
    _classCallCheck(this, ScrollCursorToTop);

    _get(Object.getPrototypeOf(ScrollCursorToTop.prototype), "constructor", this).apply(this, arguments);

    this.where = "top";
    this.moveToFirstCharacterOfLine = true;
  }

  return ScrollCursorToTop;
})(ScrollCursor);

ScrollCursorToTop.register();

// top: zt

var ScrollCursorToTopLeave = (function (_ScrollCursor2) {
  _inherits(ScrollCursorToTopLeave, _ScrollCursor2);

  function ScrollCursorToTopLeave() {
    _classCallCheck(this, ScrollCursorToTopLeave);

    _get(Object.getPrototypeOf(ScrollCursorToTopLeave.prototype), "constructor", this).apply(this, arguments);

    this.where = "top";
  }

  return ScrollCursorToTopLeave;
})(ScrollCursor);

ScrollCursorToTopLeave.register();

// middle: z.

var ScrollCursorToMiddle = (function (_ScrollCursor3) {
  _inherits(ScrollCursorToMiddle, _ScrollCursor3);

  function ScrollCursorToMiddle() {
    _classCallCheck(this, ScrollCursorToMiddle);

    _get(Object.getPrototypeOf(ScrollCursorToMiddle.prototype), "constructor", this).apply(this, arguments);

    this.where = "middle";
    this.moveToFirstCharacterOfLine = true;
  }

  return ScrollCursorToMiddle;
})(ScrollCursor);

ScrollCursorToMiddle.register();

// middle: zz

var ScrollCursorToMiddleLeave = (function (_ScrollCursor4) {
  _inherits(ScrollCursorToMiddleLeave, _ScrollCursor4);

  function ScrollCursorToMiddleLeave() {
    _classCallCheck(this, ScrollCursorToMiddleLeave);

    _get(Object.getPrototypeOf(ScrollCursorToMiddleLeave.prototype), "constructor", this).apply(this, arguments);

    this.where = "middle";
  }

  return ScrollCursorToMiddleLeave;
})(ScrollCursor);

ScrollCursorToMiddleLeave.register();

// bottom: z-

var ScrollCursorToBottom = (function (_ScrollCursor5) {
  _inherits(ScrollCursorToBottom, _ScrollCursor5);

  function ScrollCursorToBottom() {
    _classCallCheck(this, ScrollCursorToBottom);

    _get(Object.getPrototypeOf(ScrollCursorToBottom.prototype), "constructor", this).apply(this, arguments);

    this.where = "bottom";
    this.moveToFirstCharacterOfLine = true;
  }

  return ScrollCursorToBottom;
})(ScrollCursor);

ScrollCursorToBottom.register();

// bottom: zb

var ScrollCursorToBottomLeave = (function (_ScrollCursor6) {
  _inherits(ScrollCursorToBottomLeave, _ScrollCursor6);

  function ScrollCursorToBottomLeave() {
    _classCallCheck(this, ScrollCursorToBottomLeave);

    _get(Object.getPrototypeOf(ScrollCursorToBottomLeave.prototype), "constructor", this).apply(this, arguments);

    this.where = "bottom";
  }

  return ScrollCursorToBottomLeave;
})(ScrollCursor);

ScrollCursorToBottomLeave.register();

// Horizontal Scroll without changing cursor position
// -------------------------
// zs

var ScrollCursorToLeft = (function (_MiscCommand16) {
  _inherits(ScrollCursorToLeft, _MiscCommand16);

  function ScrollCursorToLeft() {
    _classCallCheck(this, ScrollCursorToLeft);

    _get(Object.getPrototypeOf(ScrollCursorToLeft.prototype), "constructor", this).apply(this, arguments);

    this.which = "left";
  }

  _createClass(ScrollCursorToLeft, [{
    key: "execute",
    value: function execute() {
      var translation = this.which === "left" ? [0, 0] : [0, 1];
      var screenPosition = this.editor.getCursorScreenPosition().translate(translation);
      var pixel = this.editorElement.pixelPositionForScreenPosition(screenPosition);
      if (this.which === "left") {
        this.editorElement.setScrollLeft(pixel.left);
      } else {
        this.editorElement.setScrollRight(pixel.left);
        this.editor.component.updateSync(); // FIXME: This is necessary maybe because of bug of atom-core.
      }
    }
  }]);

  return ScrollCursorToLeft;
})(MiscCommand);

ScrollCursorToLeft.register();

// ze

var ScrollCursorToRight = (function (_ScrollCursorToLeft) {
  _inherits(ScrollCursorToRight, _ScrollCursorToLeft);

  function ScrollCursorToRight() {
    _classCallCheck(this, ScrollCursorToRight);

    _get(Object.getPrototypeOf(ScrollCursorToRight.prototype), "constructor", this).apply(this, arguments);

    this.which = "right";
  }

  return ScrollCursorToRight;
})(ScrollCursorToLeft);

ScrollCursorToRight.register();

// insert-mode specific commands
// -------------------------

var InsertMode = (function (_MiscCommand17) {
  _inherits(InsertMode, _MiscCommand17);

  function InsertMode() {
    _classCallCheck(this, InsertMode);

    _get(Object.getPrototypeOf(InsertMode.prototype), "constructor", this).apply(this, arguments);
  }

  return InsertMode;
})(MiscCommand);

InsertMode.commandScope = "atom-text-editor.vim-mode-plus.insert-mode";

var ActivateNormalModeOnce = (function (_InsertMode) {
  _inherits(ActivateNormalModeOnce, _InsertMode);

  function ActivateNormalModeOnce() {
    _classCallCheck(this, ActivateNormalModeOnce);

    _get(Object.getPrototypeOf(ActivateNormalModeOnce.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(ActivateNormalModeOnce, [{
    key: "execute",
    value: function execute() {
      var _this6 = this;

      var cursorsToMoveRight = this.editor.getCursors().filter(function (cursor) {
        return !cursor.isAtBeginningOfLine();
      });
      this.vimState.activate("normal");
      for (var cursor of cursorsToMoveRight) {
        this.utils.moveCursorRight(cursor);
      }

      var disposable = atom.commands.onDidDispatch(function (event) {
        if (event.type === _this6.getCommandName()) return;

        disposable.dispose();
        disposable = null;
        _this6.vimState.activate("insert");
      });
    }
  }]);

  return ActivateNormalModeOnce;
})(InsertMode);

ActivateNormalModeOnce.register();

var InsertRegister = (function (_InsertMode2) {
  _inherits(InsertRegister, _InsertMode2);

  function InsertRegister() {
    _classCallCheck(this, InsertRegister);

    _get(Object.getPrototypeOf(InsertRegister.prototype), "constructor", this).apply(this, arguments);

    this.requireInput = true;
  }

  _createClass(InsertRegister, [{
    key: "initialize",
    value: function initialize() {
      this.readChar();
      _get(Object.getPrototypeOf(InsertRegister.prototype), "initialize", this).call(this);
    }
  }, {
    key: "execute",
    value: function execute() {
      var _this7 = this;

      this.editor.transact(function () {
        for (var selection of _this7.editor.getSelections()) {
          var text = _this7.vimState.register.getText(_this7.input, selection);
          selection.insertText(text);
        }
      });
    }
  }]);

  return InsertRegister;
})(InsertMode);

InsertRegister.register();

var InsertLastInserted = (function (_InsertMode3) {
  _inherits(InsertLastInserted, _InsertMode3);

  function InsertLastInserted() {
    _classCallCheck(this, InsertLastInserted);

    _get(Object.getPrototypeOf(InsertLastInserted.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(InsertLastInserted, [{
    key: "execute",
    value: function execute() {
      var text = this.vimState.register.getText(".");
      this.editor.insertText(text);
    }
  }]);

  return InsertLastInserted;
})(InsertMode);

InsertLastInserted.register();

var CopyFromLineAbove = (function (_InsertMode4) {
  _inherits(CopyFromLineAbove, _InsertMode4);

  function CopyFromLineAbove() {
    _classCallCheck(this, CopyFromLineAbove);

    _get(Object.getPrototypeOf(CopyFromLineAbove.prototype), "constructor", this).apply(this, arguments);

    this.rowDelta = -1;
  }

  _createClass(CopyFromLineAbove, [{
    key: "execute",
    value: function execute() {
      var _this8 = this;

      var translation = [this.rowDelta, 0];
      this.editor.transact(function () {
        for (var selection of _this8.editor.getSelections()) {
          var point = selection.cursor.getBufferPosition().translate(translation);
          if (point.row < 0) continue;

          var range = Range.fromPointWithDelta(point, 0, 1);
          var text = _this8.editor.getTextInBufferRange(range);
          if (text) selection.insertText(text);
        }
      });
    }
  }]);

  return CopyFromLineAbove;
})(InsertMode);

CopyFromLineAbove.register();

var CopyFromLineBelow = (function (_CopyFromLineAbove) {
  _inherits(CopyFromLineBelow, _CopyFromLineAbove);

  function CopyFromLineBelow() {
    _classCallCheck(this, CopyFromLineBelow);

    _get(Object.getPrototypeOf(CopyFromLineBelow.prototype), "constructor", this).apply(this, arguments);

    this.rowDelta = +1;
  }

  return CopyFromLineBelow;
})(CopyFromLineAbove);

CopyFromLineBelow.register();

var NextTab = (function (_MiscCommand18) {
  _inherits(NextTab, _MiscCommand18);

  function NextTab() {
    _classCallCheck(this, NextTab);

    _get(Object.getPrototypeOf(NextTab.prototype), "constructor", this).apply(this, arguments);

    this.defaultCount = 0;
  }

  _createClass(NextTab, [{
    key: "execute",
    value: function execute() {
      var count = this.getCount();
      var pane = atom.workspace.paneForItem(this.editor);

      if (count) pane.activateItemAtIndex(count - 1);else pane.activateNextItem();
    }
  }]);

  return NextTab;
})(MiscCommand);

NextTab.register();

var PreviousTab = (function (_MiscCommand19) {
  _inherits(PreviousTab, _MiscCommand19);

  function PreviousTab() {
    _classCallCheck(this, PreviousTab);

    _get(Object.getPrototypeOf(PreviousTab.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(PreviousTab, [{
    key: "execute",
    value: function execute() {
      atom.workspace.paneForItem(this.editor).activatePreviousItem();
    }
  }]);

  return PreviousTab;
})(MiscCommand);

PreviousTab.register();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL21pc2MtY29tbWFuZC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxXQUFXLENBQUE7Ozs7Ozs7Ozs7ZUFFSyxPQUFPLENBQUMsTUFBTSxDQUFDOztJQUF4QixLQUFLLFlBQUwsS0FBSzs7QUFDWixJQUFNLElBQUksR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUE7O0lBRXhCLFdBQVc7WUFBWCxXQUFXOztXQUFYLFdBQVc7MEJBQVgsV0FBVzs7K0JBQVgsV0FBVzs7O2VBQVgsV0FBVzs7V0FDUSxjQUFjOzs7O1NBRGpDLFdBQVc7R0FBUyxJQUFJOztBQUc5QixXQUFXLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFBOztJQUVyQixJQUFJO1lBQUosSUFBSTs7V0FBSixJQUFJOzBCQUFKLElBQUk7OytCQUFKLElBQUk7O1NBQ1IsWUFBWSxHQUFHLElBQUk7OztlQURmLElBQUk7O1dBRUUsc0JBQUc7QUFDWCxVQUFJLENBQUMsUUFBUSxFQUFFLENBQUE7QUFDZixpQ0FKRSxJQUFJLDRDQUlZO0tBQ25COzs7V0FFTSxtQkFBRztBQUNSLFVBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyx1QkFBdUIsRUFBRSxDQUFDLENBQUE7S0FDbkU7OztTQVRHLElBQUk7R0FBUyxXQUFXOztBQVc5QixJQUFJLENBQUMsUUFBUSxFQUFFLENBQUE7O0lBRVQsaUJBQWlCO1lBQWpCLGlCQUFpQjs7V0FBakIsaUJBQWlCOzBCQUFqQixpQkFBaUI7OytCQUFqQixpQkFBaUI7OztlQUFqQixpQkFBaUI7O1dBQ2QsbUJBQUc7QUFDUixVQUFJLENBQUMsS0FBSyxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLGdCQUFnQixF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QyxNQUFNLENBQUMsQ0FBQTs7QUFFcEQsVUFBSSxLQUFLLEVBQUUsSUFBSSxDQUFDLG1CQUFtQixDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQSxLQUN6QyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQTtLQUM3Qjs7O1NBVEcsT0FBTztHQUFTLFdBQVc7O0FBV2pDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQTs7SUFFWixXQUFXO1lBQVgsV0FBVzs7V0FBWCxXQUFXOzBCQUFYLFdBQVc7OytCQUFYLFdBQVc7OztlQUFYLFdBQVc7O1dBQ1IsbUJBQUc7QUFDUixVQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsb0JBQW9CLEVBQUUsQ0FBQTtLQUMvRDs7O1NBSEcsV0FBVztHQUFTLFdBQVc7O0FBS3JDLFdBQVcsQ0FBQyxRQUFRLEVBQUUsQ0FBQSIsImZpbGUiOiIvVXNlcnMvdGxhbmRhdS9kb3RmaWxlcy8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi9taXNjLWNvbW1hbmQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBiYWJlbFwiXG5cbmNvbnN0IHtSYW5nZX0gPSByZXF1aXJlKFwiYXRvbVwiKVxuY29uc3QgQmFzZSA9IHJlcXVpcmUoXCIuL2Jhc2VcIilcblxuY2xhc3MgTWlzY0NvbW1hbmQgZXh0ZW5kcyBCYXNlIHtcbiAgc3RhdGljIG9wZXJhdGlvbktpbmQgPSBcIm1pc2MtY29tbWFuZFwiXG59XG5NaXNjQ29tbWFuZC5yZWdpc3RlcihmYWxzZSlcblxuY2xhc3MgTWFyayBleHRlbmRzIE1pc2NDb21tYW5kIHtcbiAgcmVxdWlyZUlucHV0ID0gdHJ1ZVxuICBpbml0aWFsaXplKCkge1xuICAgIHRoaXMucmVhZENoYXIoKVxuICAgIHN1cGVyLmluaXRpYWxpemUoKVxuICB9XG5cbiAgZXhlY3V0ZSgpIHtcbiAgICB0aGlzLnZpbVN0YXRlLm1hcmsuc2V0KHRoaXMuaW5wdXQsIHRoaXMuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKSlcbiAgfVxufVxuTWFyay5yZWdpc3RlcigpXG5cbmNsYXNzIFJldmVyc2VTZWxlY3Rpb25zIGV4dGVuZHMgTWlzY0NvbW1hbmQge1xuICBleGVjdXRlKCkge1xuICAgIHRoaXMuc3dyYXAuc2V0UmV2ZXJzZWRTdGF0ZSh0aGlzLmVkaXRvciwgIXRoaXMuZWRpdG9yLmdldExhc3RTZWxlY3Rpb24oKS5pc1JldmVyc2VkKCkpXG4gICAgaWYgKHRoaXMuaXNNb2RlKFwidmlzdWFsXCIsIFwiYmxvY2t3aXNlXCIpKSB7XG4gICAgICB0aGlzLmdldExhc3RCbG9ja3dpc2VTZWxlY3Rpb24oKS5hdXRvc2Nyb2xsKClcbiAgICB9XG4gIH1cbn1cblJldmVyc2VTZWxlY3Rpb25zLnJlZ2lzdGVyKClcblxuY2xhc3MgQmxvY2t3aXNlT3RoZXJFbmQgZXh0ZW5kcyBSZXZlcnNlU2VsZWN0aW9ucyB7XG4gIGV4ZWN1dGUoKSB7XG4gICAgZm9yIChjb25zdCBibG9ja3dpc2VTZWxlY3Rpb24gb2YgdGhpcy5nZXRCbG9ja3dpc2VTZWxlY3Rpb25zKCkpIHtcbiAgICAgIGJsb2Nrd2lzZVNlbGVjdGlvbi5yZXZlcnNlKClcbiAgICB9XG4gICAgc3VwZXIuZXhlY3V0ZSgpXG4gIH1cbn1cbkJsb2Nrd2lzZU90aGVyRW5kLnJlZ2lzdGVyKClcblxuY2xhc3MgVW5kbyBleHRlbmRzIE1pc2NDb21tYW5kIHtcbiAgc2V0Q3Vyc29yUG9zaXRpb24oe25ld1Jhbmdlcywgb2xkUmFuZ2VzLCBzdHJhdGVneX0pIHtcbiAgICBjb25zdCBsYXN0Q3Vyc29yID0gdGhpcy5lZGl0b3IuZ2V0TGFzdEN1cnNvcigpIC8vIFRoaXMgaXMgcmVzdG9yZWQgY3Vyc29yXG5cbiAgICBjb25zdCBjaGFuZ2VkUmFuZ2UgPVxuICAgICAgc3RyYXRlZ3kgPT09IFwic21hcnRcIlxuICAgICAgICA/IHRoaXMudXRpbHMuZmluZFJhbmdlQ29udGFpbnNQb2ludChuZXdSYW5nZXMsIGxhc3RDdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKSlcbiAgICAgICAgOiB0aGlzLnV0aWxzLnNvcnRSYW5nZXMobmV3UmFuZ2VzLmNvbmNhdChvbGRSYW5nZXMpKVswXVxuXG4gICAgaWYgKGNoYW5nZWRSYW5nZSkge1xuICAgICAgaWYgKHRoaXMudXRpbHMuaXNMaW5ld2lzZVJhbmdlKGNoYW5nZWRSYW5nZSkpIHRoaXMudXRpbHMuc2V0QnVmZmVyUm93KGxhc3RDdXJzb3IsIGNoYW5nZWRSYW5nZS5zdGFydC5yb3cpXG4gICAgICBlbHNlIGxhc3RDdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24oY2hhbmdlZFJhbmdlLnN0YXJ0KVxuICAgIH1cbiAgfVxuXG4gIG11dGF0ZVdpdGhUcmFja0NoYW5nZXMoKSB7XG4gICAgY29uc3QgbmV3UmFuZ2VzID0gW11cbiAgICBjb25zdCBvbGRSYW5nZXMgPSBbXVxuXG4gICAgLy8gQ29sbGVjdCBjaGFuZ2VkIHJhbmdlIHdoaWxlIG11dGF0aW5nIHRleHQtc3RhdGUgYnkgZm4gY2FsbGJhY2suXG4gICAgY29uc3QgZGlzcG9zYWJsZSA9IHRoaXMuZWRpdG9yLmdldEJ1ZmZlcigpLm9uRGlkQ2hhbmdlKCh7bmV3UmFuZ2UsIG9sZFJhbmdlfSkgPT4ge1xuICAgICAgaWYgKG5ld1JhbmdlLmlzRW1wdHkoKSkge1xuICAgICAgICBvbGRSYW5nZXMucHVzaChvbGRSYW5nZSkgLy8gUmVtb3ZlIG9ubHlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5ld1Jhbmdlcy5wdXNoKG5ld1JhbmdlKVxuICAgICAgfVxuICAgIH0pXG5cbiAgICB0aGlzLm11dGF0ZSgpXG4gICAgZGlzcG9zYWJsZS5kaXNwb3NlKClcbiAgICByZXR1cm4ge25ld1Jhbmdlcywgb2xkUmFuZ2VzfVxuICB9XG5cbiAgZmxhc2hDaGFuZ2VzKHtuZXdSYW5nZXMsIG9sZFJhbmdlc30pIHtcbiAgICBjb25zdCBpc011bHRpcGxlU2luZ2xlTGluZVJhbmdlcyA9IHJhbmdlcyA9PiByYW5nZXMubGVuZ3RoID4gMSAmJiByYW5nZXMuZXZlcnkodGhpcy51dGlscy5pc1NpbmdsZUxpbmVSYW5nZSlcblxuICAgIGlmIChuZXdSYW5nZXMubGVuZ3RoID4gMCkge1xuICAgICAgaWYgKHRoaXMuaXNNdWx0aXBsZUFuZEFsbFJhbmdlSGF2ZVNhbWVDb2x1bW5BbmRDb25zZWN1dGl2ZVJvd3MobmV3UmFuZ2VzKSkgcmV0dXJuXG5cbiAgICAgIG5ld1JhbmdlcyA9IG5ld1Jhbmdlcy5tYXAocmFuZ2UgPT4gdGhpcy51dGlscy5odW1hbml6ZUJ1ZmZlclJhbmdlKHRoaXMuZWRpdG9yLCByYW5nZSkpXG4gICAgICBuZXdSYW5nZXMgPSB0aGlzLmZpbHRlck5vbkxlYWRpbmdXaGl0ZVNwYWNlUmFuZ2UobmV3UmFuZ2VzKVxuXG4gICAgICBjb25zdCB0eXBlID0gaXNNdWx0aXBsZVNpbmdsZUxpbmVSYW5nZXMobmV3UmFuZ2VzKSA/IFwidW5kby1yZWRvLW11bHRpcGxlLWNoYW5nZXNcIiA6IFwidW5kby1yZWRvXCJcbiAgICAgIHRoaXMuZmxhc2gobmV3UmFuZ2VzLCB7dHlwZX0pXG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICh0aGlzLmlzTXVsdGlwbGVBbmRBbGxSYW5nZUhhdmVTYW1lQ29sdW1uQW5kQ29uc2VjdXRpdmVSb3dzKG9sZFJhbmdlcykpIHJldHVyblxuXG4gICAgICBpZiAoaXNNdWx0aXBsZVNpbmdsZUxpbmVSYW5nZXMob2xkUmFuZ2VzKSkge1xuICAgICAgICBvbGRSYW5nZXMgPSB0aGlzLmZpbHRlck5vbkxlYWRpbmdXaGl0ZVNwYWNlUmFuZ2Uob2xkUmFuZ2VzKVxuICAgICAgICB0aGlzLmZsYXNoKG9sZFJhbmdlcywge3R5cGU6IFwidW5kby1yZWRvLW11bHRpcGxlLWRlbGV0ZVwifSlcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmaWx0ZXJOb25MZWFkaW5nV2hpdGVTcGFjZVJhbmdlKHJhbmdlcykge1xuICAgIHJldHVybiByYW5nZXMuZmlsdGVyKHJhbmdlID0+ICF0aGlzLnV0aWxzLmlzTGVhZGluZ1doaXRlU3BhY2VSYW5nZSh0aGlzLmVkaXRvciwgcmFuZ2UpKVxuICB9XG5cbiAgLy8gW1RPRE9dIEltcHJvdmUgZnVydGhlciBieSBjaGVja2luZyBvbGRUZXh0LCBuZXdUZXh0P1xuICAvLyBbUHVycG9zZSBvZiB0aGlzIGZ1bmN0aW9uXVxuICAvLyBTdXBwcmVzcyBmbGFzaCB3aGVuIHVuZG8vcmVkb2luZyB0b2dnbGUtY29tbWVudCB3aGlsZSBmbGFzaGluZyB1bmRvL3JlZG8gb2Ygb2NjdXJyZW5jZSBvcGVyYXRpb24uXG4gIC8vIFRoaXMgaHVyaXN0aWMgYXBwcm9hY2ggbmV2ZXIgYmUgcGVyZmVjdC5cbiAgLy8gVWx0aW1hdGVseSBjYW5ubm90IGRpc3Rpbmd1aXNoIG9jY3VycmVuY2Ugb3BlcmF0aW9uLlxuICBpc011bHRpcGxlQW5kQWxsUmFuZ2VIYXZlU2FtZUNvbHVtbkFuZENvbnNlY3V0aXZlUm93cyhyYW5nZXMpIHtcbiAgICBpZiAocmFuZ2VzLmxlbmd0aCA8PSAxKSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cbiAgICBjb25zdCB7c3RhcnQ6IHtjb2x1bW46IHN0YXJ0Q29sdW1ufSwgZW5kOiB7Y29sdW1uOiBlbmRDb2x1bW59fSA9IHJhbmdlc1swXVxuICAgIGxldCBwcmV2aW91c1Jvd1xuXG4gICAgZm9yIChjb25zdCByYW5nZSBvZiByYW5nZXMpIHtcbiAgICAgIGNvbnN0IHtzdGFydCwgZW5kfSA9IHJhbmdlXG4gICAgICBpZiAoc3RhcnQuY29sdW1uICE9PSBzdGFydENvbHVtbiB8fCBlbmQuY29sdW1uICE9PSBlbmRDb2x1bW4pIHJldHVybiBmYWxzZVxuICAgICAgaWYgKHByZXZpb3VzUm93ICE9IG51bGwgJiYgcHJldmlvdXNSb3cgKyAxICE9PSBzdGFydC5yb3cpIHJldHVybiBmYWxzZVxuICAgICAgcHJldmlvdXNSb3cgPSBzdGFydC5yb3dcbiAgICB9XG4gICAgcmV0dXJuIHRydWVcbiAgfVxuXG4gIGZsYXNoKHJhbmdlcywgb3B0aW9ucykge1xuICAgIGlmIChvcHRpb25zLnRpbWVvdXQgPT0gbnVsbCkgb3B0aW9ucy50aW1lb3V0ID0gNTAwXG4gICAgdGhpcy5vbkRpZEZpbmlzaE9wZXJhdGlvbigoKSA9PiB0aGlzLnZpbVN0YXRlLmZsYXNoKHJhbmdlcywgb3B0aW9ucykpXG4gIH1cblxuICBleGVjdXRlKCkge1xuICAgIGNvbnN0IHtuZXdSYW5nZXMsIG9sZFJhbmdlc30gPSB0aGlzLm11dGF0ZVdpdGhUcmFja0NoYW5nZXMoKVxuXG4gICAgZm9yIChjb25zdCBzZWxlY3Rpb24gb2YgdGhpcy5lZGl0b3IuZ2V0U2VsZWN0aW9ucygpKSB7XG4gICAgICBzZWxlY3Rpb24uY2xlYXIoKVxuICAgIH1cblxuICAgIGlmICh0aGlzLmdldENvbmZpZyhcInNldEN1cnNvclRvU3RhcnRPZkNoYW5nZU9uVW5kb1JlZG9cIikpIHtcbiAgICAgIGNvbnN0IHN0cmF0ZWd5ID0gdGhpcy5nZXRDb25maWcoXCJzZXRDdXJzb3JUb1N0YXJ0T2ZDaGFuZ2VPblVuZG9SZWRvU3RyYXRlZ3lcIilcbiAgICAgIHRoaXMuc2V0Q3Vyc29yUG9zaXRpb24oe25ld1Jhbmdlcywgb2xkUmFuZ2VzLCBzdHJhdGVneX0pXG4gICAgICB0aGlzLnZpbVN0YXRlLmNsZWFyU2VsZWN0aW9ucygpXG4gICAgfVxuXG4gICAgaWYgKHRoaXMuZ2V0Q29uZmlnKFwiZmxhc2hPblVuZG9SZWRvXCIpKSB0aGlzLmZsYXNoQ2hhbmdlcyh7bmV3UmFuZ2VzLCBvbGRSYW5nZXN9KVxuICAgIHRoaXMuYWN0aXZhdGVNb2RlKFwibm9ybWFsXCIpXG4gIH1cblxuICBtdXRhdGUoKSB7XG4gICAgdGhpcy5lZGl0b3IudW5kbygpXG4gIH1cbn1cblVuZG8ucmVnaXN0ZXIoKVxuXG5jbGFzcyBSZWRvIGV4dGVuZHMgVW5kbyB7XG4gIG11dGF0ZSgpIHtcbiAgICB0aGlzLmVkaXRvci5yZWRvKClcbiAgfVxufVxuUmVkby5yZWdpc3RlcigpXG5cbi8vIHpjXG5jbGFzcyBGb2xkQ3VycmVudFJvdyBleHRlbmRzIE1pc2NDb21tYW5kIHtcbiAgZXhlY3V0ZSgpIHtcbiAgICBmb3IgKGNvbnN0IHBvaW50IG9mIHRoaXMuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb25zKCkpIHtcbiAgICAgIHRoaXMuZWRpdG9yLmZvbGRCdWZmZXJSb3cocG9pbnQucm93KVxuICAgIH1cbiAgfVxufVxuRm9sZEN1cnJlbnRSb3cucmVnaXN0ZXIoKVxuXG4vLyB6b1xuY2xhc3MgVW5mb2xkQ3VycmVudFJvdyBleHRlbmRzIE1pc2NDb21tYW5kIHtcbiAgZXhlY3V0ZSgpIHtcbiAgICBmb3IgKGNvbnN0IHBvaW50IG9mIHRoaXMuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb25zKCkpIHtcbiAgICAgIHRoaXMuZWRpdG9yLnVuZm9sZEJ1ZmZlclJvdyhwb2ludC5yb3cpXG4gICAgfVxuICB9XG59XG5VbmZvbGRDdXJyZW50Um93LnJlZ2lzdGVyKClcblxuLy8gemFcbmNsYXNzIFRvZ2dsZUZvbGQgZXh0ZW5kcyBNaXNjQ29tbWFuZCB7XG4gIGV4ZWN1dGUoKSB7XG4gICAgZm9yIChjb25zdCBwb2ludCBvZiB0aGlzLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9ucygpKSB7XG4gICAgICB0aGlzLmVkaXRvci50b2dnbGVGb2xkQXRCdWZmZXJSb3cocG9pbnQucm93KVxuICAgIH1cbiAgfVxufVxuVG9nZ2xlRm9sZC5yZWdpc3RlcigpXG5cbi8vIEJhc2Ugb2YgekMsIHpPLCB6QVxuY2xhc3MgRm9sZEN1cnJlbnRSb3dSZWN1cnNpdmVseUJhc2UgZXh0ZW5kcyBNaXNjQ29tbWFuZCB7XG4gIGVhY2hGb2xkU3RhcnRSb3coZm4pIHtcbiAgICBmb3IgKGNvbnN0IHtyb3d9IG9mIHRoaXMuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb25zT3JkZXJlZCgpLnJldmVyc2UoKSkge1xuICAgICAgaWYgKCF0aGlzLmVkaXRvci5pc0ZvbGRhYmxlQXRCdWZmZXJSb3cocm93KSkgY29udGludWVcblxuICAgICAgdGhpcy51dGlsc1xuICAgICAgICAuZ2V0Rm9sZFJvd1Jhbmdlc0NvbnRhaW5lZEJ5Rm9sZFN0YXJ0c0F0Um93KHRoaXMuZWRpdG9yLCByb3cpXG4gICAgICAgIC5tYXAocm93UmFuZ2UgPT4gcm93UmFuZ2VbMF0pIC8vIG1hcHQgdG8gc3RhcnRSb3cgb2YgZm9sZFxuICAgICAgICAucmV2ZXJzZSgpIC8vIHJldmVyc2UgdG8gcHJvY2VzcyBlbmNvbG9zZWQobmVzdGVkKSBmb2xkIGZpcnN0IHRoYW4gZW5jb2xvc2luZyBmb2xkLlxuICAgICAgICAuZm9yRWFjaChmbilcbiAgICB9XG4gIH1cblxuICBmb2xkUmVjdXJzaXZlbHkoKSB7XG4gICAgdGhpcy5lYWNoRm9sZFN0YXJ0Um93KHJvdyA9PiB7XG4gICAgICBpZiAoIXRoaXMuZWRpdG9yLmlzRm9sZGVkQXRCdWZmZXJSb3cocm93KSkgdGhpcy5lZGl0b3IuZm9sZEJ1ZmZlclJvdyhyb3cpXG4gICAgfSlcbiAgfVxuXG4gIHVuZm9sZFJlY3Vyc2l2ZWx5KCkge1xuICAgIHRoaXMuZWFjaEZvbGRTdGFydFJvdyhyb3cgPT4ge1xuICAgICAgaWYgKHRoaXMuZWRpdG9yLmlzRm9sZGVkQXRCdWZmZXJSb3cocm93KSkgdGhpcy5lZGl0b3IudW5mb2xkQnVmZmVyUm93KHJvdylcbiAgICB9KVxuICB9XG59XG5Gb2xkQ3VycmVudFJvd1JlY3Vyc2l2ZWx5QmFzZS5yZWdpc3RlcihmYWxzZSlcblxuLy8gekNcbmNsYXNzIEZvbGRDdXJyZW50Um93UmVjdXJzaXZlbHkgZXh0ZW5kcyBGb2xkQ3VycmVudFJvd1JlY3Vyc2l2ZWx5QmFzZSB7XG4gIGV4ZWN1dGUoKSB7XG4gICAgdGhpcy5mb2xkUmVjdXJzaXZlbHkoKVxuICB9XG59XG5Gb2xkQ3VycmVudFJvd1JlY3Vyc2l2ZWx5LnJlZ2lzdGVyKClcblxuLy8gek9cbmNsYXNzIFVuZm9sZEN1cnJlbnRSb3dSZWN1cnNpdmVseSBleHRlbmRzIEZvbGRDdXJyZW50Um93UmVjdXJzaXZlbHlCYXNlIHtcbiAgZXhlY3V0ZSgpIHtcbiAgICB0aGlzLnVuZm9sZFJlY3Vyc2l2ZWx5KClcbiAgfVxufVxuVW5mb2xkQ3VycmVudFJvd1JlY3Vyc2l2ZWx5LnJlZ2lzdGVyKClcblxuLy8gekFcbmNsYXNzIFRvZ2dsZUZvbGRSZWN1cnNpdmVseSBleHRlbmRzIEZvbGRDdXJyZW50Um93UmVjdXJzaXZlbHlCYXNlIHtcbiAgZXhlY3V0ZSgpIHtcbiAgICBpZiAodGhpcy5lZGl0b3IuaXNGb2xkZWRBdEJ1ZmZlclJvdyh0aGlzLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCkucm93KSkge1xuICAgICAgdGhpcy51bmZvbGRSZWN1cnNpdmVseSgpXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZm9sZFJlY3Vyc2l2ZWx5KClcbiAgICB9XG4gIH1cbn1cblRvZ2dsZUZvbGRSZWN1cnNpdmVseS5yZWdpc3RlcigpXG5cbi8vIHpSXG5jbGFzcyBVbmZvbGRBbGwgZXh0ZW5kcyBNaXNjQ29tbWFuZCB7XG4gIGV4ZWN1dGUoKSB7XG4gICAgdGhpcy5lZGl0b3IudW5mb2xkQWxsKClcbiAgfVxufVxuVW5mb2xkQWxsLnJlZ2lzdGVyKClcblxuLy8gek1cbmNsYXNzIEZvbGRBbGwgZXh0ZW5kcyBNaXNjQ29tbWFuZCB7XG4gIGV4ZWN1dGUoKSB7XG4gICAgY29uc3Qge2FsbEZvbGR9ID0gdGhpcy51dGlscy5nZXRGb2xkSW5mb0J5S2luZCh0aGlzLmVkaXRvcilcbiAgICBpZiAoIWFsbEZvbGQpIHJldHVyblxuXG4gICAgdGhpcy5lZGl0b3IudW5mb2xkQWxsKClcbiAgICBmb3IgKGNvbnN0IHtpbmRlbnQsIHN0YXJ0Um93LCBlbmRSb3d9IG9mIGFsbEZvbGQucm93UmFuZ2VzV2l0aEluZGVudCkge1xuICAgICAgaWYgKGluZGVudCA8PSB0aGlzLmdldENvbmZpZyhcIm1heEZvbGRhYmxlSW5kZW50TGV2ZWxcIikpIHtcbiAgICAgICAgdGhpcy5lZGl0b3IuZm9sZEJ1ZmZlclJvd1JhbmdlKHN0YXJ0Um93LCBlbmRSb3cpXG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuZWRpdG9yLnNjcm9sbFRvQ3Vyc29yUG9zaXRpb24oe2NlbnRlcjogdHJ1ZX0pXG4gIH1cbn1cbkZvbGRBbGwucmVnaXN0ZXIoKVxuXG4vLyB6clxuY2xhc3MgVW5mb2xkTmV4dEluZGVudExldmVsIGV4dGVuZHMgTWlzY0NvbW1hbmQge1xuICBleGVjdXRlKCkge1xuICAgIGNvbnN0IHtmb2xkZWR9ID0gdGhpcy51dGlscy5nZXRGb2xkSW5mb0J5S2luZCh0aGlzLmVkaXRvcilcbiAgICBpZiAoIWZvbGRlZCkgcmV0dXJuXG4gICAgY29uc3Qge21pbkluZGVudCwgcm93UmFuZ2VzV2l0aEluZGVudH0gPSBmb2xkZWRcbiAgICBjb25zdCBjb3VudCA9IHRoaXMudXRpbHMubGltaXROdW1iZXIodGhpcy5nZXRDb3VudCgpIC0gMSwge21pbjogMH0pXG4gICAgY29uc3QgdGFyZ2V0SW5kZW50cyA9IHRoaXMudXRpbHMuZ2V0TGlzdChtaW5JbmRlbnQsIG1pbkluZGVudCArIGNvdW50KVxuICAgIGZvciAoY29uc3Qge2luZGVudCwgc3RhcnRSb3d9IG9mIHJvd1Jhbmdlc1dpdGhJbmRlbnQpIHtcbiAgICAgIGlmICh0YXJnZXRJbmRlbnRzLmluY2x1ZGVzKGluZGVudCkpIHtcbiAgICAgICAgdGhpcy5lZGl0b3IudW5mb2xkQnVmZmVyUm93KHN0YXJ0Um93KVxuICAgICAgfVxuICAgIH1cbiAgfVxufVxuVW5mb2xkTmV4dEluZGVudExldmVsLnJlZ2lzdGVyKClcblxuLy8gem1cbmNsYXNzIEZvbGROZXh0SW5kZW50TGV2ZWwgZXh0ZW5kcyBNaXNjQ29tbWFuZCB7XG4gIGV4ZWN1dGUoKSB7XG4gICAgY29uc3Qge3VuZm9sZGVkLCBhbGxGb2xkfSA9IHRoaXMudXRpbHMuZ2V0Rm9sZEluZm9CeUtpbmQodGhpcy5lZGl0b3IpXG4gICAgaWYgKCF1bmZvbGRlZCkgcmV0dXJuXG4gICAgLy8gRklYTUU6IFdoeSBJIG5lZWQgdW5mb2xkQWxsKCk/IFdoeSBjYW4ndCBJIGp1c3QgZm9sZCBub24tZm9sZGVkLWZvbGQgb25seT9cbiAgICAvLyBVbmxlc3MgdW5mb2xkQWxsKCkgaGVyZSwgQGVkaXRvci51bmZvbGRBbGwoKSBkZWxldGUgZm9sZE1hcmtlciBidXQgZmFpbFxuICAgIC8vIHRvIHJlbmRlciB1bmZvbGRlZCByb3dzIGNvcnJlY3RseS5cbiAgICAvLyBJIGJlbGlldmUgdGhpcyBpcyBidWcgb2YgdGV4dC1idWZmZXIncyBtYXJrZXJMYXllciB3aGljaCBhc3N1bWUgZm9sZHMgYXJlXG4gICAgLy8gY3JlYXRlZCAqKmluLW9yZGVyKiogZnJvbSB0b3Atcm93IHRvIGJvdHRvbS1yb3cuXG4gICAgdGhpcy5lZGl0b3IudW5mb2xkQWxsKClcblxuICAgIGNvbnN0IG1heEZvbGRhYmxlID0gdGhpcy5nZXRDb25maWcoXCJtYXhGb2xkYWJsZUluZGVudExldmVsXCIpXG4gICAgbGV0IGZyb21MZXZlbCA9IE1hdGgubWluKHVuZm9sZGVkLm1heEluZGVudCwgbWF4Rm9sZGFibGUpXG4gICAgY29uc3QgY291bnQgPSB0aGlzLnV0aWxzLmxpbWl0TnVtYmVyKHRoaXMuZ2V0Q291bnQoKSAtIDEsIHttaW46IDB9KVxuICAgIGZyb21MZXZlbCA9IHRoaXMudXRpbHMubGltaXROdW1iZXIoZnJvbUxldmVsIC0gY291bnQsIHttaW46IDB9KVxuICAgIGNvbnN0IHRhcmdldEluZGVudHMgPSB0aGlzLnV0aWxzLmdldExpc3QoZnJvbUxldmVsLCBtYXhGb2xkYWJsZSlcbiAgICBmb3IgKGNvbnN0IHtpbmRlbnQsIHN0YXJ0Um93LCBlbmRSb3d9IG9mIGFsbEZvbGQucm93UmFuZ2VzV2l0aEluZGVudCkge1xuICAgICAgaWYgKHRhcmdldEluZGVudHMuaW5jbHVkZXMoaW5kZW50KSkge1xuICAgICAgICB0aGlzLmVkaXRvci5mb2xkQnVmZmVyUm93UmFuZ2Uoc3RhcnRSb3csIGVuZFJvdylcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cbkZvbGROZXh0SW5kZW50TGV2ZWwucmVnaXN0ZXIoKVxuXG5jbGFzcyBSZXBsYWNlTW9kZUJhY2tzcGFjZSBleHRlbmRzIE1pc2NDb21tYW5kIHtcbiAgc3RhdGljIGNvbW1hbmRTY29wZSA9IFwiYXRvbS10ZXh0LWVkaXRvci52aW0tbW9kZS1wbHVzLmluc2VydC1tb2RlLnJlcGxhY2VcIlxuXG4gIGV4ZWN1dGUoKSB7XG4gICAgZm9yIChjb25zdCBzZWxlY3Rpb24gb2YgdGhpcy5lZGl0b3IuZ2V0U2VsZWN0aW9ucygpKSB7XG4gICAgICAvLyBjaGFyIG1pZ2h0IGJlIGVtcHR5LlxuICAgICAgY29uc3QgY2hhciA9IHRoaXMudmltU3RhdGUubW9kZU1hbmFnZXIuZ2V0UmVwbGFjZWRDaGFyRm9yU2VsZWN0aW9uKHNlbGVjdGlvbilcbiAgICAgIGlmIChjaGFyICE9IG51bGwpIHtcbiAgICAgICAgc2VsZWN0aW9uLnNlbGVjdExlZnQoKVxuICAgICAgICBpZiAoIXNlbGVjdGlvbi5pbnNlcnRUZXh0KGNoYXIpLmlzRW1wdHkoKSkgc2VsZWN0aW9uLmN1cnNvci5tb3ZlTGVmdCgpXG4gICAgICB9XG4gICAgfVxuICB9XG59XG5SZXBsYWNlTW9kZUJhY2tzcGFjZS5yZWdpc3RlcigpXG5cbi8vIGN0cmwtZSBzY3JvbGwgbGluZXMgZG93bndhcmRzXG5jbGFzcyBTY3JvbGxEb3duIGV4dGVuZHMgTWlzY0NvbW1hbmQge1xuICBleGVjdXRlKCkge1xuICAgIGNvbnN0IGNvdW50ID0gdGhpcy5nZXRDb3VudCgpXG4gICAgY29uc3Qgb2xkRmlyc3RSb3cgPSB0aGlzLmVkaXRvci5nZXRGaXJzdFZpc2libGVTY3JlZW5Sb3coKVxuICAgIHRoaXMuZWRpdG9yLnNldEZpcnN0VmlzaWJsZVNjcmVlblJvdyhvbGRGaXJzdFJvdyArIGNvdW50KVxuICAgIGNvbnN0IG5ld0ZpcnN0Um93ID0gdGhpcy5lZGl0b3IuZ2V0Rmlyc3RWaXNpYmxlU2NyZWVuUm93KClcblxuICAgIGNvbnN0IG9mZnNldCA9IDJcbiAgICBjb25zdCB7cm93LCBjb2x1bW59ID0gdGhpcy5lZGl0b3IuZ2V0Q3Vyc29yU2NyZWVuUG9zaXRpb24oKVxuICAgIGlmIChyb3cgPCBuZXdGaXJzdFJvdyArIG9mZnNldCkge1xuICAgICAgY29uc3QgbmV3UG9pbnQgPSBbcm93ICsgY291bnQsIGNvbHVtbl1cbiAgICAgIHRoaXMuZWRpdG9yLnNldEN1cnNvclNjcmVlblBvc2l0aW9uKG5ld1BvaW50LCB7YXV0b3Njcm9sbDogZmFsc2V9KVxuICAgIH1cbiAgfVxufVxuU2Nyb2xsRG93bi5yZWdpc3RlcigpXG5cbi8vIGN0cmwteSBzY3JvbGwgbGluZXMgdXB3YXJkc1xuY2xhc3MgU2Nyb2xsVXAgZXh0ZW5kcyBNaXNjQ29tbWFuZCB7XG4gIGV4ZWN1dGUoKSB7XG4gICAgY29uc3QgY291bnQgPSB0aGlzLmdldENvdW50KClcbiAgICBjb25zdCBvbGRGaXJzdFJvdyA9IHRoaXMuZWRpdG9yLmdldEZpcnN0VmlzaWJsZVNjcmVlblJvdygpXG4gICAgdGhpcy5lZGl0b3Iuc2V0Rmlyc3RWaXNpYmxlU2NyZWVuUm93KG9sZEZpcnN0Um93IC0gY291bnQpXG4gICAgY29uc3QgbmV3TGFzdFJvdyA9IHRoaXMuZWRpdG9yLmdldExhc3RWaXNpYmxlU2NyZWVuUm93KClcblxuICAgIGNvbnN0IG9mZnNldCA9IDJcbiAgICBjb25zdCB7cm93LCBjb2x1bW59ID0gdGhpcy5lZGl0b3IuZ2V0Q3Vyc29yU2NyZWVuUG9zaXRpb24oKVxuICAgIGlmIChyb3cgPj0gbmV3TGFzdFJvdyAtIG9mZnNldCkge1xuICAgICAgY29uc3QgbmV3UG9pbnQgPSBbcm93IC0gY291bnQsIGNvbHVtbl1cbiAgICAgIHRoaXMuZWRpdG9yLnNldEN1cnNvclNjcmVlblBvc2l0aW9uKG5ld1BvaW50LCB7YXV0b3Njcm9sbDogZmFsc2V9KVxuICAgIH1cbiAgfVxufVxuU2Nyb2xsVXAucmVnaXN0ZXIoKVxuXG4vLyBBZGp1c3Qgc2Nyb2xsVG9wIHRvIGNoYW5nZSB3aGVyZSBjdXJvcyBpcyBzaG93biBpbiB2aWV3cG9ydC5cbi8vICstLS0tLS0tLSstLS0tLS0tLS0tLS0tLS0tLS0rLS0tLS0tLS0tK1xuLy8gfCB3aGVyZSAgfCBtb3ZlIHRvIDFzdCBjaGFyIHwgbm8gbW92ZSB8XG4vLyArLS0tLS0tLS0rLS0tLS0tLS0tLS0tLS0tLS0tKy0tLS0tLS0tLStcbi8vIHwgdG9wICAgIHwgYHogZW50ZXJgICAgICAgICB8IGB6IHRgICAgfFxuLy8gfCBtaWRkbGUgfCBgeiAuYCAgICAgICAgICAgIHwgYHogemAgICB8XG4vLyB8IGJvdHRvbSB8IGB6IC1gICAgICAgICAgICAgfCBgeiBiYCAgIHxcbi8vICstLS0tLS0tLSstLS0tLS0tLS0tLS0tLS0tLS0rLS0tLS0tLS0tK1xuY2xhc3MgU2Nyb2xsQ3Vyc29yIGV4dGVuZHMgTWlzY0NvbW1hbmQge1xuICBtb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZSA9IGZhbHNlXG4gIHdoZXJlID0gbnVsbFxuXG4gIGV4ZWN1dGUoKSB7XG4gICAgdGhpcy5lZGl0b3JFbGVtZW50LnNldFNjcm9sbFRvcCh0aGlzLmdldFNjcm9sbFRvcCgpKVxuICAgIGlmICh0aGlzLm1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lKSB0aGlzLmVkaXRvci5tb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZSgpXG4gIH1cblxuICBnZXRTY3JvbGxUb3AoKSB7XG4gICAgY29uc3Qgc2NyZWVuUG9zaXRpb24gPSB0aGlzLmVkaXRvci5nZXRDdXJzb3JTY3JlZW5Qb3NpdGlvbigpXG4gICAgY29uc3Qge3RvcH0gPSB0aGlzLmVkaXRvckVsZW1lbnQucGl4ZWxQb3NpdGlvbkZvclNjcmVlblBvc2l0aW9uKHNjcmVlblBvc2l0aW9uKVxuICAgIHN3aXRjaCAodGhpcy53aGVyZSkge1xuICAgICAgY2FzZSBcInRvcFwiOlxuICAgICAgICB0aGlzLnJlY29tbWVuZFRvRW5hYmxlU2Nyb2xsUGFzdEVuZElmTmVjZXNzYXJ5KClcbiAgICAgICAgcmV0dXJuIHRvcCAtIHRoaXMuZ2V0T2ZmU2V0UGl4ZWxIZWlnaHQoKVxuICAgICAgY2FzZSBcIm1pZGRsZVwiOlxuICAgICAgICByZXR1cm4gdG9wIC0gdGhpcy5lZGl0b3JFbGVtZW50LmdldEhlaWdodCgpIC8gMlxuICAgICAgY2FzZSBcImJvdHRvbVwiOlxuICAgICAgICByZXR1cm4gdG9wIC0gKHRoaXMuZWRpdG9yRWxlbWVudC5nZXRIZWlnaHQoKSAtIHRoaXMuZ2V0T2ZmU2V0UGl4ZWxIZWlnaHQoMSkpXG4gICAgfVxuICB9XG5cbiAgZ2V0T2ZmU2V0UGl4ZWxIZWlnaHQobGluZURlbHRhID0gMCkge1xuICAgIGNvbnN0IHNjcm9sbG9mZiA9IDIgLy8gYXRvbSBkZWZhdWx0LiBCZXR0ZXIgdG8gdXNlIGVkaXRvci5nZXRWZXJ0aWNhbFNjcm9sbE1hcmdpbigpP1xuICAgIHJldHVybiB0aGlzLmVkaXRvci5nZXRMaW5lSGVpZ2h0SW5QaXhlbHMoKSAqIChzY3JvbGxvZmYgKyBsaW5lRGVsdGEpXG4gIH1cblxuICByZWNvbW1lbmRUb0VuYWJsZVNjcm9sbFBhc3RFbmRJZk5lY2Vzc2FyeSgpIHtcbiAgICBpZiAodGhpcy5lZGl0b3IuZ2V0TGFzdFZpc2libGVTY3JlZW5Sb3coKSA9PT0gdGhpcy5lZGl0b3IuZ2V0TGFzdFNjcmVlblJvdygpICYmICF0aGlzLmVkaXRvci5nZXRTY3JvbGxQYXN0RW5kKCkpIHtcbiAgICAgIGNvbnN0IG1lc3NhZ2UgPSBbXG4gICAgICAgIFwidmltLW1vZGUtcGx1c1wiLFxuICAgICAgICBcIi0gRm9yIGB6IHRgIGFuZCBgeiBlbnRlcmAgd29ya3MgcHJvcGVybHkgaW4gZXZlcnkgc2l0dWF0aW9uLCBgZWRpdG9yLnNjcm9sbFBhc3RFbmRgIHNldHRpbmcgbmVlZCB0byBiZSBgdHJ1ZWAuXCIsXG4gICAgICAgICctIFlvdSBjYW4gZW5hYmxlIGl0IGZyb20gYFwiU2V0dGluZ3NcIiA+IFwiRWRpdG9yXCIgPiBcIlNjcm9sbCBQYXN0IEVuZFwiYC4nLFxuICAgICAgICBcIi0gT3IgKipkbyB5b3UgYWxsb3cgdm1wIGVuYWJsZSBpdCBmb3IgeW91IG5vdz8qKlwiLFxuICAgICAgXS5qb2luKFwiXFxuXCIpXG5cbiAgICAgIGNvbnN0IG5vdGlmaWNhdGlvbiA9IGF0b20ubm90aWZpY2F0aW9ucy5hZGRJbmZvKG1lc3NhZ2UsIHtcbiAgICAgICAgZGlzbWlzc2FibGU6IHRydWUsXG4gICAgICAgIGJ1dHRvbnM6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICB0ZXh0OiBcIk5vIHRoYW5rcy5cIixcbiAgICAgICAgICAgIG9uRGlkQ2xpY2s6ICgpID0+IG5vdGlmaWNhdGlvbi5kaXNtaXNzKCksXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICB0ZXh0OiBcIk9LLiBFbmFibGUgaXQgbm93ISFcIixcbiAgICAgICAgICAgIG9uRGlkQ2xpY2s6ICgpID0+IHtcbiAgICAgICAgICAgICAgYXRvbS5jb25maWcuc2V0KGBlZGl0b3Iuc2Nyb2xsUGFzdEVuZGAsIHRydWUpXG4gICAgICAgICAgICAgIG5vdGlmaWNhdGlvbi5kaXNtaXNzKClcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICAgIH0pXG4gICAgfVxuICB9XG59XG5TY3JvbGxDdXJzb3IucmVnaXN0ZXIoZmFsc2UpXG5cbi8vIHRvcDogeiBlbnRlclxuY2xhc3MgU2Nyb2xsQ3Vyc29yVG9Ub3AgZXh0ZW5kcyBTY3JvbGxDdXJzb3Ige1xuICB3aGVyZSA9IFwidG9wXCJcbiAgbW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmUgPSB0cnVlXG59XG5TY3JvbGxDdXJzb3JUb1RvcC5yZWdpc3RlcigpXG5cbi8vIHRvcDogenRcbmNsYXNzIFNjcm9sbEN1cnNvclRvVG9wTGVhdmUgZXh0ZW5kcyBTY3JvbGxDdXJzb3Ige1xuICB3aGVyZSA9IFwidG9wXCJcbn1cblNjcm9sbEN1cnNvclRvVG9wTGVhdmUucmVnaXN0ZXIoKVxuXG4vLyBtaWRkbGU6IHouXG5jbGFzcyBTY3JvbGxDdXJzb3JUb01pZGRsZSBleHRlbmRzIFNjcm9sbEN1cnNvciB7XG4gIHdoZXJlID0gXCJtaWRkbGVcIlxuICBtb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZSA9IHRydWVcbn1cblNjcm9sbEN1cnNvclRvTWlkZGxlLnJlZ2lzdGVyKClcblxuLy8gbWlkZGxlOiB6elxuY2xhc3MgU2Nyb2xsQ3Vyc29yVG9NaWRkbGVMZWF2ZSBleHRlbmRzIFNjcm9sbEN1cnNvciB7XG4gIHdoZXJlID0gXCJtaWRkbGVcIlxufVxuU2Nyb2xsQ3Vyc29yVG9NaWRkbGVMZWF2ZS5yZWdpc3RlcigpXG5cbi8vIGJvdHRvbTogei1cbmNsYXNzIFNjcm9sbEN1cnNvclRvQm90dG9tIGV4dGVuZHMgU2Nyb2xsQ3Vyc29yIHtcbiAgd2hlcmUgPSBcImJvdHRvbVwiXG4gIG1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lID0gdHJ1ZVxufVxuU2Nyb2xsQ3Vyc29yVG9Cb3R0b20ucmVnaXN0ZXIoKVxuXG4vLyBib3R0b206IHpiXG5jbGFzcyBTY3JvbGxDdXJzb3JUb0JvdHRvbUxlYXZlIGV4dGVuZHMgU2Nyb2xsQ3Vyc29yIHtcbiAgd2hlcmUgPSBcImJvdHRvbVwiXG59XG5TY3JvbGxDdXJzb3JUb0JvdHRvbUxlYXZlLnJlZ2lzdGVyKClcblxuLy8gSG9yaXpvbnRhbCBTY3JvbGwgd2l0aG91dCBjaGFuZ2luZyBjdXJzb3IgcG9zaXRpb25cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIHpzXG5jbGFzcyBTY3JvbGxDdXJzb3JUb0xlZnQgZXh0ZW5kcyBNaXNjQ29tbWFuZCB7XG4gIHdoaWNoID0gXCJsZWZ0XCJcbiAgZXhlY3V0ZSgpIHtcbiAgICBjb25zdCB0cmFuc2xhdGlvbiA9IHRoaXMud2hpY2ggPT09IFwibGVmdFwiID8gWzAsIDBdIDogWzAsIDFdXG4gICAgY29uc3Qgc2NyZWVuUG9zaXRpb24gPSB0aGlzLmVkaXRvci5nZXRDdXJzb3JTY3JlZW5Qb3NpdGlvbigpLnRyYW5zbGF0ZSh0cmFuc2xhdGlvbilcbiAgICBjb25zdCBwaXhlbCA9IHRoaXMuZWRpdG9yRWxlbWVudC5waXhlbFBvc2l0aW9uRm9yU2NyZWVuUG9zaXRpb24oc2NyZWVuUG9zaXRpb24pXG4gICAgaWYgKHRoaXMud2hpY2ggPT09IFwibGVmdFwiKSB7XG4gICAgICB0aGlzLmVkaXRvckVsZW1lbnQuc2V0U2Nyb2xsTGVmdChwaXhlbC5sZWZ0KVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmVkaXRvckVsZW1lbnQuc2V0U2Nyb2xsUmlnaHQocGl4ZWwubGVmdClcbiAgICAgIHRoaXMuZWRpdG9yLmNvbXBvbmVudC51cGRhdGVTeW5jKCkgLy8gRklYTUU6IFRoaXMgaXMgbmVjZXNzYXJ5IG1heWJlIGJlY2F1c2Ugb2YgYnVnIG9mIGF0b20tY29yZS5cbiAgICB9XG4gIH1cbn1cblNjcm9sbEN1cnNvclRvTGVmdC5yZWdpc3RlcigpXG5cbi8vIHplXG5jbGFzcyBTY3JvbGxDdXJzb3JUb1JpZ2h0IGV4dGVuZHMgU2Nyb2xsQ3Vyc29yVG9MZWZ0IHtcbiAgd2hpY2ggPSBcInJpZ2h0XCJcbn1cblNjcm9sbEN1cnNvclRvUmlnaHQucmVnaXN0ZXIoKVxuXG4vLyBpbnNlcnQtbW9kZSBzcGVjaWZpYyBjb21tYW5kc1xuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgSW5zZXJ0TW9kZSBleHRlbmRzIE1pc2NDb21tYW5kIHt9XG5JbnNlcnRNb2RlLmNvbW1hbmRTY29wZSA9IFwiYXRvbS10ZXh0LWVkaXRvci52aW0tbW9kZS1wbHVzLmluc2VydC1tb2RlXCJcblxuY2xhc3MgQWN0aXZhdGVOb3JtYWxNb2RlT25jZSBleHRlbmRzIEluc2VydE1vZGUge1xuICBleGVjdXRlKCkge1xuICAgIGNvbnN0IGN1cnNvcnNUb01vdmVSaWdodCA9IHRoaXMuZWRpdG9yLmdldEN1cnNvcnMoKS5maWx0ZXIoY3Vyc29yID0+ICFjdXJzb3IuaXNBdEJlZ2lubmluZ09mTGluZSgpKVxuICAgIHRoaXMudmltU3RhdGUuYWN0aXZhdGUoXCJub3JtYWxcIilcbiAgICBmb3IgKGNvbnN0IGN1cnNvciBvZiBjdXJzb3JzVG9Nb3ZlUmlnaHQpIHtcbiAgICAgIHRoaXMudXRpbHMubW92ZUN1cnNvclJpZ2h0KGN1cnNvcilcbiAgICB9XG5cbiAgICBsZXQgZGlzcG9zYWJsZSA9IGF0b20uY29tbWFuZHMub25EaWREaXNwYXRjaChldmVudCA9PiB7XG4gICAgICBpZiAoZXZlbnQudHlwZSA9PT0gdGhpcy5nZXRDb21tYW5kTmFtZSgpKSByZXR1cm5cblxuICAgICAgZGlzcG9zYWJsZS5kaXNwb3NlKClcbiAgICAgIGRpc3Bvc2FibGUgPSBudWxsXG4gICAgICB0aGlzLnZpbVN0YXRlLmFjdGl2YXRlKFwiaW5zZXJ0XCIpXG4gICAgfSlcbiAgfVxufVxuQWN0aXZhdGVOb3JtYWxNb2RlT25jZS5yZWdpc3RlcigpXG5cbmNsYXNzIEluc2VydFJlZ2lzdGVyIGV4dGVuZHMgSW5zZXJ0TW9kZSB7XG4gIHJlcXVpcmVJbnB1dCA9IHRydWVcbiAgaW5pdGlhbGl6ZSgpIHtcbiAgICB0aGlzLnJlYWRDaGFyKClcbiAgICBzdXBlci5pbml0aWFsaXplKClcbiAgfVxuXG4gIGV4ZWN1dGUoKSB7XG4gICAgdGhpcy5lZGl0b3IudHJhbnNhY3QoKCkgPT4ge1xuICAgICAgZm9yIChjb25zdCBzZWxlY3Rpb24gb2YgdGhpcy5lZGl0b3IuZ2V0U2VsZWN0aW9ucygpKSB7XG4gICAgICAgIGNvbnN0IHRleHQgPSB0aGlzLnZpbVN0YXRlLnJlZ2lzdGVyLmdldFRleHQodGhpcy5pbnB1dCwgc2VsZWN0aW9uKVxuICAgICAgICBzZWxlY3Rpb24uaW5zZXJ0VGV4dCh0ZXh0KVxuICAgICAgfVxuICAgIH0pXG4gIH1cbn1cbkluc2VydFJlZ2lzdGVyLnJlZ2lzdGVyKClcblxuY2xhc3MgSW5zZXJ0TGFzdEluc2VydGVkIGV4dGVuZHMgSW5zZXJ0TW9kZSB7XG4gIGV4ZWN1dGUoKSB7XG4gICAgY29uc3QgdGV4dCA9IHRoaXMudmltU3RhdGUucmVnaXN0ZXIuZ2V0VGV4dChcIi5cIilcbiAgICB0aGlzLmVkaXRvci5pbnNlcnRUZXh0KHRleHQpXG4gIH1cbn1cbkluc2VydExhc3RJbnNlcnRlZC5yZWdpc3RlcigpXG5cbmNsYXNzIENvcHlGcm9tTGluZUFib3ZlIGV4dGVuZHMgSW5zZXJ0TW9kZSB7XG4gIHJvd0RlbHRhID0gLTFcblxuICBleGVjdXRlKCkge1xuICAgIGNvbnN0IHRyYW5zbGF0aW9uID0gW3RoaXMucm93RGVsdGEsIDBdXG4gICAgdGhpcy5lZGl0b3IudHJhbnNhY3QoKCkgPT4ge1xuICAgICAgZm9yIChsZXQgc2VsZWN0aW9uIG9mIHRoaXMuZWRpdG9yLmdldFNlbGVjdGlvbnMoKSkge1xuICAgICAgICBjb25zdCBwb2ludCA9IHNlbGVjdGlvbi5jdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKS50cmFuc2xhdGUodHJhbnNsYXRpb24pXG4gICAgICAgIGlmIChwb2ludC5yb3cgPCAwKSBjb250aW51ZVxuXG4gICAgICAgIGNvbnN0IHJhbmdlID0gUmFuZ2UuZnJvbVBvaW50V2l0aERlbHRhKHBvaW50LCAwLCAxKVxuICAgICAgICBjb25zdCB0ZXh0ID0gdGhpcy5lZGl0b3IuZ2V0VGV4dEluQnVmZmVyUmFuZ2UocmFuZ2UpXG4gICAgICAgIGlmICh0ZXh0KSBzZWxlY3Rpb24uaW5zZXJ0VGV4dCh0ZXh0KVxuICAgICAgfVxuICAgIH0pXG4gIH1cbn1cbkNvcHlGcm9tTGluZUFib3ZlLnJlZ2lzdGVyKClcblxuY2xhc3MgQ29weUZyb21MaW5lQmVsb3cgZXh0ZW5kcyBDb3B5RnJvbUxpbmVBYm92ZSB7XG4gIHJvd0RlbHRhID0gKzFcbn1cbkNvcHlGcm9tTGluZUJlbG93LnJlZ2lzdGVyKClcblxuY2xhc3MgTmV4dFRhYiBleHRlbmRzIE1pc2NDb21tYW5kIHtcbiAgZGVmYXVsdENvdW50ID0gMFxuXG4gIGV4ZWN1dGUoKSB7XG4gICAgY29uc3QgY291bnQgPSB0aGlzLmdldENvdW50KClcbiAgICBjb25zdCBwYW5lID0gYXRvbS53b3Jrc3BhY2UucGFuZUZvckl0ZW0odGhpcy5lZGl0b3IpXG5cbiAgICBpZiAoY291bnQpIHBhbmUuYWN0aXZhdGVJdGVtQXRJbmRleChjb3VudCAtIDEpXG4gICAgZWxzZSBwYW5lLmFjdGl2YXRlTmV4dEl0ZW0oKVxuICB9XG59XG5OZXh0VGFiLnJlZ2lzdGVyKClcblxuY2xhc3MgUHJldmlvdXNUYWIgZXh0ZW5kcyBNaXNjQ29tbWFuZCB7XG4gIGV4ZWN1dGUoKSB7XG4gICAgYXRvbS53b3Jrc3BhY2UucGFuZUZvckl0ZW0odGhpcy5lZGl0b3IpLmFjdGl2YXRlUHJldmlvdXNJdGVtKClcbiAgfVxufVxuUHJldmlvdXNUYWIucmVnaXN0ZXIoKVxuIl19