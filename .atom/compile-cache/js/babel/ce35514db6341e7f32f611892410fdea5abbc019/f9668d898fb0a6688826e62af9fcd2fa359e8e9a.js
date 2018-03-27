"use babel";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _require = require("atom");

var Range = _require.Range;

var Base = require("./base");

var _require2 = require("./utils");

var moveCursorRight = _require2.moveCursorRight;
var isLinewiseRange = _require2.isLinewiseRange;
var setBufferRow = _require2.setBufferRow;
var sortRanges = _require2.sortRanges;
var findRangeContainsPoint = _require2.findRangeContainsPoint;
var isSingleLineRange = _require2.isSingleLineRange;
var isLeadingWhiteSpaceRange = _require2.isLeadingWhiteSpaceRange;
var humanizeBufferRange = _require2.humanizeBufferRange;
var getFoldInfoByKind = _require2.getFoldInfoByKind;
var limitNumber = _require2.limitNumber;
var getFoldRowRangesContainedByFoldStartsAtRow = _require2.getFoldRowRangesContainedByFoldStartsAtRow;
var getList = _require2.getList;

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
      return _get(Object.getPrototypeOf(Mark.prototype), "initialize", this).call(this);
    }
  }, {
    key: "execute",
    value: function execute() {
      this.vimState.mark.set(this.input, this.editor.getCursorBufferPosition());
      this.activateMode("normal");
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

      var changedRange = strategy === "smart" ? findRangeContainsPoint(newRanges, lastCursor.getBufferPosition()) : sortRanges(newRanges.concat(oldRanges))[0];

      if (changedRange) {
        if (isLinewiseRange(changedRange)) setBufferRow(lastCursor, changedRange.start.row);else lastCursor.setBufferPosition(changedRange.start);
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
        return ranges.length > 1 && ranges.every(isSingleLineRange);
      };

      if (newRanges.length > 0) {
        if (this.isMultipleAndAllRangeHaveSameColumnAndConsecutiveRows(newRanges)) return;

        newRanges = newRanges.map(function (range) {
          return humanizeBufferRange(_this.editor, range);
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
        return !isLeadingWhiteSpaceRange(_this2.editor, range);
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
      for (var selection of this.editor.getSelections()) {
        this.editor.foldBufferRow(this.getCursorPositionForSelection(selection).row);
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
      for (var selection of this.editor.getSelections()) {
        this.editor.unfoldBufferRow(this.getCursorPositionForSelection(selection).row);
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
      this.editor.toggleFoldAtBufferRow(this.editor.getCursorBufferPosition().row);
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
    key: "foldRecursively",
    value: function foldRecursively(row) {
      var rowRanges = getFoldRowRangesContainedByFoldStartsAtRow(this.editor, row);
      if (!rowRanges) return;
      var startRows = rowRanges.map(function (rowRange) {
        return rowRange[0];
      });
      for (var _row of startRows.reverse()) {
        if (!this.editor.isFoldedAtBufferRow(_row)) {
          this.editor.foldBufferRow(_row);
        }
      }
    }
  }, {
    key: "unfoldRecursively",
    value: function unfoldRecursively(row) {
      var rowRanges = getFoldRowRangesContainedByFoldStartsAtRow(this.editor, row);
      if (!rowRanges) return;
      var startRows = rowRanges.map(function (rowRange) {
        return rowRange[0];
      });
      for (row of startRows) {
        if (this.editor.isFoldedAtBufferRow(row)) {
          this.editor.unfoldBufferRow(row);
        }
      }
    }
  }, {
    key: "foldRecursivelyForAllSelections",
    value: function foldRecursivelyForAllSelections() {
      for (var selection of this.editor.getSelectionsOrderedByBufferPosition().reverse()) {
        this.foldRecursively(this.getCursorPositionForSelection(selection).row);
      }
    }
  }, {
    key: "unfoldRecursivelyForAllSelections",
    value: function unfoldRecursivelyForAllSelections() {
      for (var selection of this.editor.getSelectionsOrderedByBufferPosition()) {
        this.unfoldRecursively(this.getCursorPositionForSelection(selection).row);
      }
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
      this.foldRecursivelyForAllSelections();
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
      this.unfoldRecursivelyForAllSelections();
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
      var _getCursorPositionForSelection = this.getCursorPositionForSelection(this.editor.getLastSelection());

      var row = _getCursorPositionForSelection.row;

      if (this.editor.isFoldedAtBufferRow(row)) {
        this.unfoldRecursivelyForAllSelections();
      } else {
        this.foldRecursivelyForAllSelections();
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
      var _getFoldInfoByKind = getFoldInfoByKind(this.editor);

      var allFold = _getFoldInfoByKind.allFold;

      if (!allFold) return;

      this.editor.unfoldAll();
      for (var _ref42 of allFold.rowRangesWithIndent) {
        var indent = _ref42.indent;
        var startRow = _ref42.startRow;
        var endRow = _ref42.endRow;

        if (indent <= this.getConfig("maxFoldableIndentLevel")) {
          this.editor.foldBufferRowRange(startRow, endRow);
        }
      }
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
      var _getFoldInfoByKind2 = getFoldInfoByKind(this.editor);

      var folded = _getFoldInfoByKind2.folded;

      if (!folded) return;
      var minIndent = folded.minIndent;
      var rowRangesWithIndent = folded.rowRangesWithIndent;

      var count = limitNumber(this.getCount() - 1, { min: 0 });
      var targetIndents = getList(minIndent, minIndent + count);
      for (var _ref52 of rowRangesWithIndent) {
        var indent = _ref52.indent;
        var startRow = _ref52.startRow;

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
      var _getFoldInfoByKind3 = getFoldInfoByKind(this.editor);

      var unfolded = _getFoldInfoByKind3.unfolded;
      var allFold = _getFoldInfoByKind3.allFold;

      if (!unfolded) return;
      // FIXME: Why I need unfoldAll()? Why can't I just fold non-folded-fold only?
      // Unless unfoldAll() here, @editor.unfoldAll() delete foldMarker but fail
      // to render unfolded rows correctly.
      // I believe this is bug of text-buffer's markerLayer which assume folds are
      // created **in-order** from top-row to bottom-row.
      this.editor.unfoldAll();

      var maxFoldable = this.getConfig("maxFoldableIndentLevel");
      var fromLevel = Math.min(unfolded.maxIndent, maxFoldable);
      var count = limitNumber(this.getCount() - 1, { min: 0 });
      fromLevel = limitNumber(fromLevel - count, { min: 0 });
      var targetIndents = getList(fromLevel, maxFoldable);
      for (var _ref62 of allFold.rowRangesWithIndent) {
        var indent = _ref62.indent;
        var startRow = _ref62.startRow;
        var endRow = _ref62.endRow;

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

var ScrollWithoutChangingCursorPosition = (function (_MiscCommand13) {
  _inherits(ScrollWithoutChangingCursorPosition, _MiscCommand13);

  function ScrollWithoutChangingCursorPosition() {
    _classCallCheck(this, ScrollWithoutChangingCursorPosition);

    _get(Object.getPrototypeOf(ScrollWithoutChangingCursorPosition.prototype), "constructor", this).apply(this, arguments);

    this.scrolloff = 2;
    this.cursorPixel = null;
  }

  _createClass(ScrollWithoutChangingCursorPosition, [{
    key: "getFirstVisibleScreenRow",
    value: function getFirstVisibleScreenRow() {
      return this.editorElement.getFirstVisibleScreenRow();
    }
  }, {
    key: "getLastVisibleScreenRow",
    value: function getLastVisibleScreenRow() {
      return this.editorElement.getLastVisibleScreenRow();
    }
  }, {
    key: "getLastScreenRow",
    value: function getLastScreenRow() {
      return this.editor.getLastScreenRow();
    }
  }, {
    key: "getCursorPixel",
    value: function getCursorPixel() {
      var point = this.editor.getCursorScreenPosition();
      return this.editorElement.pixelPositionForScreenPosition(point);
    }
  }]);

  return ScrollWithoutChangingCursorPosition;
})(MiscCommand);

ScrollWithoutChangingCursorPosition.register(false);

// ctrl-e scroll lines downwards

var ScrollDown = (function (_ScrollWithoutChangingCursorPosition) {
  _inherits(ScrollDown, _ScrollWithoutChangingCursorPosition);

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
})(ScrollWithoutChangingCursorPosition);

ScrollDown.register();

// ctrl-y scroll lines upwards

var ScrollUp = (function (_ScrollWithoutChangingCursorPosition2) {
  _inherits(ScrollUp, _ScrollWithoutChangingCursorPosition2);

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
})(ScrollWithoutChangingCursorPosition);

ScrollUp.register();

// ScrollWithoutChangingCursorPosition without Cursor Position change.
// -------------------------

var ScrollCursor = (function (_ScrollWithoutChangingCursorPosition3) {
  _inherits(ScrollCursor, _ScrollWithoutChangingCursorPosition3);

  function ScrollCursor() {
    _classCallCheck(this, ScrollCursor);

    _get(Object.getPrototypeOf(ScrollCursor.prototype), "constructor", this).apply(this, arguments);

    this.moveToFirstCharacterOfLine = true;
  }

  _createClass(ScrollCursor, [{
    key: "execute",
    value: function execute() {
      if (this.moveToFirstCharacterOfLine) this.editor.moveToFirstCharacterOfLine();
      if (this.isScrollable()) this.editorElement.setScrollTop(this.getScrollTop());
    }
  }, {
    key: "getOffSetPixelHeight",
    value: function getOffSetPixelHeight() {
      var lineDelta = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];

      return this.editor.getLineHeightInPixels() * (this.scrolloff + lineDelta);
    }
  }]);

  return ScrollCursor;
})(ScrollWithoutChangingCursorPosition);

ScrollCursor.register(false);

// z enter

var ScrollCursorToTop = (function (_ScrollCursor) {
  _inherits(ScrollCursorToTop, _ScrollCursor);

  function ScrollCursorToTop() {
    _classCallCheck(this, ScrollCursorToTop);

    _get(Object.getPrototypeOf(ScrollCursorToTop.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(ScrollCursorToTop, [{
    key: "isScrollable",
    value: function isScrollable() {
      return this.getLastVisibleScreenRow() !== this.getLastScreenRow();
    }
  }, {
    key: "getScrollTop",
    value: function getScrollTop() {
      return this.getCursorPixel().top - this.getOffSetPixelHeight();
    }
  }]);

  return ScrollCursorToTop;
})(ScrollCursor);

ScrollCursorToTop.register();

// zt

var ScrollCursorToTopLeave = (function (_ScrollCursorToTop) {
  _inherits(ScrollCursorToTopLeave, _ScrollCursorToTop);

  function ScrollCursorToTopLeave() {
    _classCallCheck(this, ScrollCursorToTopLeave);

    _get(Object.getPrototypeOf(ScrollCursorToTopLeave.prototype), "constructor", this).apply(this, arguments);

    this.moveToFirstCharacterOfLine = false;
  }

  return ScrollCursorToTopLeave;
})(ScrollCursorToTop);

ScrollCursorToTopLeave.register();

// z-

var ScrollCursorToBottom = (function (_ScrollCursor2) {
  _inherits(ScrollCursorToBottom, _ScrollCursor2);

  function ScrollCursorToBottom() {
    _classCallCheck(this, ScrollCursorToBottom);

    _get(Object.getPrototypeOf(ScrollCursorToBottom.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(ScrollCursorToBottom, [{
    key: "isScrollable",
    value: function isScrollable() {
      return this.getFirstVisibleScreenRow() !== 0;
    }
  }, {
    key: "getScrollTop",
    value: function getScrollTop() {
      return this.getCursorPixel().top - (this.editorElement.getHeight() - this.getOffSetPixelHeight(1));
    }
  }]);

  return ScrollCursorToBottom;
})(ScrollCursor);

ScrollCursorToBottom.register();

// zb

var ScrollCursorToBottomLeave = (function (_ScrollCursorToBottom) {
  _inherits(ScrollCursorToBottomLeave, _ScrollCursorToBottom);

  function ScrollCursorToBottomLeave() {
    _classCallCheck(this, ScrollCursorToBottomLeave);

    _get(Object.getPrototypeOf(ScrollCursorToBottomLeave.prototype), "constructor", this).apply(this, arguments);

    this.moveToFirstCharacterOfLine = false;
  }

  return ScrollCursorToBottomLeave;
})(ScrollCursorToBottom);

ScrollCursorToBottomLeave.register();

// z.

var ScrollCursorToMiddle = (function (_ScrollCursor3) {
  _inherits(ScrollCursorToMiddle, _ScrollCursor3);

  function ScrollCursorToMiddle() {
    _classCallCheck(this, ScrollCursorToMiddle);

    _get(Object.getPrototypeOf(ScrollCursorToMiddle.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(ScrollCursorToMiddle, [{
    key: "isScrollable",
    value: function isScrollable() {
      return true;
    }
  }, {
    key: "getScrollTop",
    value: function getScrollTop() {
      return this.getCursorPixel().top - this.editorElement.getHeight() / 2;
    }
  }]);

  return ScrollCursorToMiddle;
})(ScrollCursor);

ScrollCursorToMiddle.register();

// zz

var ScrollCursorToMiddleLeave = (function (_ScrollCursorToMiddle) {
  _inherits(ScrollCursorToMiddleLeave, _ScrollCursorToMiddle);

  function ScrollCursorToMiddleLeave() {
    _classCallCheck(this, ScrollCursorToMiddleLeave);

    _get(Object.getPrototypeOf(ScrollCursorToMiddleLeave.prototype), "constructor", this).apply(this, arguments);

    this.moveToFirstCharacterOfLine = false;
  }

  return ScrollCursorToMiddleLeave;
})(ScrollCursorToMiddle);

ScrollCursorToMiddleLeave.register();

// Horizontal ScrollWithoutChangingCursorPosition
// -------------------------
// zs

var ScrollCursorToLeft = (function (_ScrollWithoutChangingCursorPosition4) {
  _inherits(ScrollCursorToLeft, _ScrollWithoutChangingCursorPosition4);

  function ScrollCursorToLeft() {
    _classCallCheck(this, ScrollCursorToLeft);

    _get(Object.getPrototypeOf(ScrollCursorToLeft.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(ScrollCursorToLeft, [{
    key: "execute",
    value: function execute() {
      this.editorElement.setScrollLeft(this.getCursorPixel().left);
    }
  }]);

  return ScrollCursorToLeft;
})(ScrollWithoutChangingCursorPosition);

ScrollCursorToLeft.register();

// ze

var ScrollCursorToRight = (function (_ScrollCursorToLeft) {
  _inherits(ScrollCursorToRight, _ScrollCursorToLeft);

  function ScrollCursorToRight() {
    _classCallCheck(this, ScrollCursorToRight);

    _get(Object.getPrototypeOf(ScrollCursorToRight.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(ScrollCursorToRight, [{
    key: "execute",
    value: function execute() {
      this.editorElement.setScrollRight(this.getCursorPixel().left);
    }
  }]);

  return ScrollCursorToRight;
})(ScrollCursorToLeft);

ScrollCursorToRight.register();

// insert-mode specific commands
// -------------------------

var InsertMode = (function (_MiscCommand14) {
  _inherits(InsertMode, _MiscCommand14);

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
      var _this4 = this;

      var cursorsToMoveRight = this.editor.getCursors().filter(function (cursor) {
        return !cursor.isAtBeginningOfLine();
      });
      this.vimState.activate("normal");
      for (var cursor of cursorsToMoveRight) {
        moveCursorRight(cursor);
      }

      var disposable = atom.commands.onDidDispatch(function (event) {
        if (event.type === _this4.getCommandName()) return;

        disposable.dispose();
        disposable = null;
        _this4.vimState.activate("insert");
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
      return _get(Object.getPrototypeOf(InsertRegister.prototype), "initialize", this).call(this);
    }
  }, {
    key: "execute",
    value: function execute() {
      var _this5 = this;

      this.editor.transact(function () {
        for (var selection of _this5.editor.getSelections()) {
          var text = _this5.vimState.register.getText(_this5.input, selection);
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
      var _this6 = this;

      var translation = [this.rowDelta, 0];
      this.editor.transact(function () {
        for (var selection of _this6.editor.getSelections()) {
          var point = selection.cursor.getBufferPosition().translate(translation);
          if (point.row < 0) continue;

          var range = Range.fromPointWithDelta(point, 0, 1);
          var text = _this6.editor.getTextInBufferRange(range);
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

var NextTab = (function (_MiscCommand15) {
  _inherits(NextTab, _MiscCommand15);

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

var PreviousTab = (function (_MiscCommand16) {
  _inherits(PreviousTab, _MiscCommand16);

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
// atom default. Better to use editor.getVerticalScrollMargin()?
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL21pc2MtY29tbWFuZC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxXQUFXLENBQUE7Ozs7Ozs7Ozs7ZUFFSyxPQUFPLENBQUMsTUFBTSxDQUFDOztJQUF4QixLQUFLLFlBQUwsS0FBSzs7QUFDWixJQUFNLElBQUksR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUE7O2dCQWMxQixPQUFPLENBQUMsU0FBUyxDQUFDOztJQVpwQixlQUFlLGFBQWYsZUFBZTtJQUNmLGVBQWUsYUFBZixlQUFlO0lBQ2YsWUFBWSxhQUFaLFlBQVk7SUFDWixVQUFVLGFBQVYsVUFBVTtJQUNWLHNCQUFzQixhQUF0QixzQkFBc0I7SUFDdEIsaUJBQWlCLGFBQWpCLGlCQUFpQjtJQUNqQix3QkFBd0IsYUFBeEIsd0JBQXdCO0lBQ3hCLG1CQUFtQixhQUFuQixtQkFBbUI7SUFDbkIsaUJBQWlCLGFBQWpCLGlCQUFpQjtJQUNqQixXQUFXLGFBQVgsV0FBVztJQUNYLDBDQUEwQyxhQUExQywwQ0FBMEM7SUFDMUMsT0FBTyxhQUFQLE9BQU87O0lBR0gsV0FBVztZQUFYLFdBQVc7O1dBQVgsV0FBVzswQkFBWCxXQUFXOzsrQkFBWCxXQUFXOzs7ZUFBWCxXQUFXOztXQUNRLGNBQWM7Ozs7U0FEakMsV0FBVztHQUFTLElBQUk7O0FBRzlCLFdBQVcsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUE7O0lBRXJCLElBQUk7WUFBSixJQUFJOztXQUFKLElBQUk7MEJBQUosSUFBSTs7K0JBQUosSUFBSTs7U0FDUixZQUFZLEdBQUcsSUFBSTs7O2VBRGYsSUFBSTs7V0FFRSxzQkFBRztBQUNYLFVBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQTtBQUNmLHdDQUpFLElBQUksNENBSW1CO0tBQzFCOzs7V0FFTSxtQkFBRztBQUNSLFVBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEdB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LFdBQVcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUE7O0FBRXBELFVBQUksS0FBSyxFQUFFLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUEsS0FDekMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUE7S0FDN0I7OztTQVRHLE9BQU87R0FBUyxXQUFXOztBQVdqQyxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUE7O0lBRVosV0FBVztZQUFYLFdBQVc7O1dBQVgsV0FBVzswQkFBWCxXQUFXOzsrQkFBWCxXQUFXOzs7ZUFBWCxXQUFXOztXQUNSLG1CQUFHO0FBQ1IsVUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLG9CQUFvQixFQUFFLENBQUE7S0FDL0Q7OztTQUhHLFdBQVc7R0FBUyxXQUFXOztBQUtyQyxXQUFXLENBQUMsUUFBUSxFQUFFLENBQUEiLCJmaWxlIjoiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvbWlzYy1jb21tYW5kLmpzIiwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2UgYmFiZWxcIlxuXG5jb25zdCB7UmFuZ2V9ID0gcmVxdWlyZShcImF0b21cIilcbmNvbnN0IEJhc2UgPSByZXF1aXJlKFwiLi9iYXNlXCIpXG5jb25zdCB7XG4gIG1vdmVDdXJzb3JSaWdodCxcbiAgaXNMaW5ld2lzZVJhbmdlLFxuICBzZXRCdWZmZXJSb3csXG4gIHNvcnRSYW5nZXMsXG4gIGZpbmRSYW5nZUNvbnRhaW5zUG9pbnQsXG4gIGlzU2luZ2xlTGluZVJhbmdlLFxuICBpc0xlYWRpbmdXaGl0ZVNwYWNlUmFuZ2UsXG4gIGh1bWFuaXplQnVmZmVyUmFuZ2UsXG4gIGdldEZvbGRJbmZvQnlLaW5kLFxuICBsaW1pdE51bWJlcixcbiAgZ2V0Rm9sZFJvd1Jhbmdlc0NvbnRhaW5lZEJ5Rm9sZFN0YXJ0c0F0Um93LFxuICBnZXRMaXN0LFxufSA9IHJlcXVpcmUoXCIuL3V0aWxzXCIpXG5cbmNsYXNzIE1pc2NDb21tYW5kIGV4dGVuZHMgQmFzZSB7XG4gIHN0YXRpYyBvcGVyYXRpb25LaW5kID0gXCJtaXNjLWNvbW1hbmRcIlxufVxuTWlzY0NvbW1hbmQucmVnaXN0ZXIoZmFsc2UpXG5cbmNsYXNzIE1hcmsgZXh0ZW5kcyBNaXNjQ29tbWFuZCB7XG4gIHJlcXVpcmVJbnB1dCA9IHRydWVcbiAgaW5pdGlhbGl6ZSgpIHtcbiAgICB0aGlzLnJlYWRDaGFyKClcbiAgICByZXR1cm4gc3VwZXIuaW5pdGlhbGl6ZSgpXG4gIH1cblxuICBleGVjdXRlKCkge1xuICAgIHRoaXMudmltU3RhdGUubWFyay5zZXQodGhpcy5pbnB1dCwgdGhpcy5lZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKSlcbiAgICB0aGlzLmFjdGl2YXRlTW9kZShcIm5vcm1hbFwiKVxuICB9XG59XG5NYXJrLnJlZ2lzdGVyKClcblxuY2xhc3MgUmV2ZXJzZVNlbGVjdGlvbnMgZXh0ZW5kcyBNaXNjQ29tbWFuZCB7XG4gIGV4ZWN1dGUoKSB7XG4gICAgdGhpcy5zd3JhcC5zZXRSZXZlcnNlZFN0YXRlKHRoaXMuZWRpdG9yLCAhdGhpcy5lZGl0b3IuZ2V0TGFzdFNlbGVjdGlvbigpLmlzUmV2ZXJzZWQoKSlcbiAgICBpZiAodGhpcy5pc01vZGUoXCJ2aXN1YWxcIiwgXCJibG9ja3dpc2VcIikpIHtcbiAgICAgIHRoaXMuZ2V0TGFzdEJsb2Nrd2lzZVNlbGVjdGlvbigpLmF1dG9zY3JvbGwoKVxuICAgIH1cbiAgfVxufVxuUmV2ZXJzZVNlbGVjdGlvbnMucmVnaXN0ZXIoKVxuXG5jbGFzcyBCbG9ja3dpc2VPdGhlckVuZCBleHRlbmRzIFJldmVyc2VTZWxlY3Rpb25zIHtcbiAgZXhlY3V0ZSgpIHtcbiAgICBmb3IgKGNvbnN0IGJsb2Nrd2lzZVNlbGVjdGlvbiBvZiB0aGlzLmdldEJsb2Nrd2lzZVNlbGVjdGlvbnMoKSkge1xuICAgICAgYmxvY2t3aXNlU2VsZWN0aW9uLnJldmVyc2UoKVxuICAgIH1cbiAgICBzdXBlci5leGVjdXRlKClcbiAgfVxufVxuQmxvY2t3aXNlT3RoZXJFbmQucmVnaXN0ZXIoKVxuXG5jbGFzcyBVbmRvIGV4dGVuZHMgTWlzY0NvbW1hbmQge1xuICBzZXRDdXJzb3JQb3NpdGlvbih7bmV3UmFuZ2VzLCBvbGRSYW5nZXMsIHN0cmF0ZWd5fSkge1xuICAgIGNvbnN0IGxhc3RDdXJzb3IgPSB0aGlzLmVkaXRvci5nZXRMYXN0Q3Vyc29yKCkgLy8gVGhpcyBpcyByZXN0b3JlZCBjdXJzb3JcblxuICAgIGNvbnN0IGNoYW5nZWRSYW5nZSA9XG4gICAgICBzdHJhdGVneSA9PT0gXCJzbWFydFwiXG4gICAgICAgID8gZmluZFJhbmdlQ29udGFpbnNQb2ludChuZXdSYW5nZXMsIGxhc3RDdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKSlcbiAgICAgICAgOiBzb3J0UmFuZ2VzKG5ld1Jhbmdlcy5jb25jYXQob2xkUmFuZ2VzKSlbMF1cblxuICAgIGlmIChjaGFuZ2VkUmFuZ2UpIHtcbiAgICAgIGlmIChpc0xpbmV3aXNlUmFuZ2UoY2hhbmdlZFJhbmdlKSkgc2V0QnVmZmVyUm93KGxhc3RDdXJzb3IsIGNoYW5nZWRSYW5nZS5zdGFydC5yb3cpXG4gICAgICBlbHNlIGxhc3RDdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24oY2hhbmdlZFJhbmdlLnN0YXJ0KVxuICAgIH1cbiAgfVxuXG4gIG11dGF0ZVdpdGhUcmFja0NoYW5nZXMoKSB7XG4gICAgY29uc3QgbmV3UmFuZ2VzID0gW11cbiAgICBjb25zdCBvbGRSYW5nZXMgPSBbXVxuXG4gICAgLy8gQ29sbGVjdCBjaGFuZ2VkIHJhbmdlIHdoaWxlIG11dGF0aW5nIHRleHQtc3RhdGUgYnkgZm4gY2FsbGJhY2suXG4gICAgY29uc3QgZGlzcG9zYWJsZSA9IHRoaXMuZWRpdG9yLmdldEJ1ZmZlcigpLm9uRGlkQ2hhbmdlKCh7bmV3UmFuZ2UsIG9sZFJhbmdlfSkgPT4ge1xuICAgICAgaWYgKG5ld1JhbmdlLmlzRW1wdHkoKSkge1xuICAgICAgICBvbGRSYW5nZXMucHVzaChvbGRSYW5nZSkgLy8gUmVtb3ZlIG9ubHlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5ld1Jhbmdlcy5wdXNoKG5ld1JhbmdlKVxuICAgICAgfVxuICAgIH0pXG5cbiAgICB0aGlzLm11dGF0ZSgpXG4gICAgZGlzcG9zYWJsZS5kaXNwb3NlKClcbiAgICByZXR1cm4ge25ld1Jhbmdlcywgb2xkUmFuZ2VzfVxuICB9XG5cbiAgZmxhc2hDaGFuZ2VzKHtuZXdSYW5nZXMsIG9sZFJhbmdlc30pIHtcbiAgICBjb25zdCBpc011bHRpcGxlU2luZ2xlTGluZVJhbmdlcyA9IHJhbmdlcyA9PiByYW5nZXMubGVuZ3RoID4gMSAmJiByYW5nZXMuZXZlcnkoaXNTaW5nbGVMaW5lUmFuZ2UpXG5cbiAgICBpZiAobmV3UmFuZ2VzLmxlbmd0aCA+IDApIHtcbiAgICAgIGlmICh0aGlzLmlzTXVsdGlwbGVBbmRBbGxSYW5nZUhhdmVTYW1lQ29sdW1uQW5kQ29uc2VjdXRpdmVSb3dzKG5ld1JhbmdlcykpIHJldHVyblxuXG4gICAgICBuZXdSYW5nZXMgPSBuZXdSYW5nZXMubWFwKHJhbmdlID0+IGh1bWFuaXplQnVmZmVyUmFuZ2UodGhpcy5lZGl0b3IsIHJhbmdlKSlcbiAgICAgIG5ld1JhbmdlcyA9IHRoaXMuZmlsdGVyTm9uTGVhZGluZ1doaXRlU3BhY2VSYW5nZShuZXdSYW5nZXMpXG5cbiAgICAgIGNvbnN0IHR5cGUgPSBpc011bHRpcGxlU2luZ2xlTGluZVJhbmdlcyhuZXdSYW5nZXMpID8gXCJ1bmRvLXJlZG8tbXVsdGlwbGUtY2hhbmdlc1wiIDogXCJ1bmRvLXJlZG9cIlxuICAgICAgdGhpcy5mbGFzaChuZXdSYW5nZXMsIHt0eXBlfSlcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHRoaXMuaXNNdWx0aXBsZUFuZEFsbFJhbmdlSGF2ZVNhbWVDb2x1bW5BbmRDb25zZWN1dGl2ZVJvd3Mob2xkUmFuZ2VzKSkgcmV0dXJuXG5cbiAgICAgIGlmIChpc011bHRpcGxlU2luZ2xlTGluZVJhbmdlcyhvbGRSYW5nZXMpKSB7XG4gICAgICAgIG9sZFJhbmdlcyA9IHRoaXMuZmlsdGVyTm9uTGVhZGluZ1doaXRlU3BhY2VSYW5nZShvbGRSYW5nZXMpXG4gICAgICAgIHRoaXMuZmxhc2gob2xkUmFuZ2VzLCB7dHlwZTogXCJ1bmRvLXJlZG8tbXVsdGlwbGUtZGVsZXRlXCJ9KVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZpbHRlck5vbkxlYWRpbmdXaGl0ZVNwYWNlUmFuZ2UocmFuZ2VzKSB7XG4gICAgcmV0dXJuIHJhbmdlcy5maWx0ZXIocmFuZ2UgPT4gIWlzTGVhZGluZ1doaXRlU3BhY2VSYW5nZSh0aGlzLmVkaXRvciwgcmFuZ2UpKVxuICB9XG5cbiAgLy8gW1RPRE9dIEltcHJvdmUgZnVydGhlciBieSBjaGVja2luZyBvbGRUZXh0LCBuZXdUZXh0P1xuICAvLyBbUHVycG9zZSBvZiB0aGlzIGZ1bmN0aW9uXVxuICAvLyBTdXBwcmVzcyBmbGFzaCB3aGVuIHVuZG8vcmVkb2luZyB0b2dnbGUtY29tbWVudCB3aGlsZSBmbGFzaGluZyB1bmRvL3JlZG8gb2Ygb2NjdXJyZW5jZSBvcGVyYXRpb24uXG4gIC8vIFRoaXMgaHVyaXN0aWMgYXBwcm9hY2ggbmV2ZXIgYmUgcGVyZmVjdC5cbiAgLy8gVWx0aW1hdGVseSBjYW5ubm90IGRpc3Rpbmd1aXNoIG9jY3VycmVuY2Ugb3BlcmF0aW9uLlxuICBpc011bHRpcGxlQW5kQWxsUmFuZ2VIYXZlU2FtZUNvbHVtbkFuZENvbnNlY3V0aXZlUm93cyhyYW5nZXMpIHtcbiAgICBpZiAocmFuZ2VzLmxlbmd0aCA8PSAxKSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cbiAgICBjb25zdCB7c3RhcnQ6IHtjb2x1bW46IHN0YXJ0Q29sdW1ufSwgZW5kOiB7Y29sdW1uOiBlbmRDb2x1bW59fSA9IHJhbmdlc1swXVxuICAgIGxldCBwcmV2aW91c1Jvd1xuXG4gICAgZm9yIChjb25zdCByYW5nZSBvZiByYW5nZXMpIHtcbiAgICAgIGNvbnN0IHtzdGFydCwgZW5kfSA9IHJhbmdlXG4gICAgICBpZiAoc3RhcnQuY29sdW1uICE9PSBzdGFydENvbHVtbiB8fCBlbmQuY29sdW1uICE9PSBlbmRDb2x1bW4pIHJldHVybiBmYWxzZVxuICAgICAgaWYgKHByZXZpb3VzUm93ICE9IG51bGwgJiYgcHJldmlvdXNSb3cgKyAxICE9PSBzdGFydC5yb3cpIHJldHVybiBmYWxzZVxuICAgICAgcHJldmlvdXNSb3cgPSBzdGFydC5yb3dcbiAgICB9XG4gICAgcmV0dXJuIHRydWVcbiAgfVxuXG4gIGZsYXNoKHJhbmdlcywgb3B0aW9ucykge1xuICAgIGlmIChvcHRpb25zLnRpbWVvdXQgPT0gbnVsbCkgb3B0aW9ucy50aW1lb3V0ID0gNTAwXG4gICAgdGhpcy5vbkRpZEZpbmlzaE9wZXJhdGlvbigoKSA9PiB0aGlzLnZpbVN0YXRlLmZsYXNoKHJhbmdlcywgb3B0aW9ucykpXG4gIH1cblxuICBleGVjdXRlKCkge1xuICAgIGNvbnN0IHtuZXdSYW5nZXMsIG9sZFJhbmdlc30gPSB0aGlzLm11dGF0ZVdpdGhUcmFja0NoYW5nZXMoKVxuXG4gICAgZm9yIChjb25zdCBzZWxlY3Rpb24gb2YgdGhpcy5lZGl0b3IuZ2V0U2VsZWN0aW9ucygpKSB7XG4gICAgICBzZWxlY3Rpb24uY2xlYXIoKVxuICAgIH1cblxuICAgIGlmICh0aGlzLmdldENvbmZpZyhcInNldEN1cnNvclRvU3RhcnRPZkNoYW5nZU9uVW5kb1JlZG9cIikpIHtcbiAgICAgIGNvbnN0IHN0cmF0ZWd5ID0gdGhpcy5nZXRDb25maWcoXCJzZXRDdXJzb3JUb1N0YXJ0T2ZDaGFuZ2VPblVuZG9SZWRvU3RyYXRlZ3lcIilcbiAgICAgIHRoaXMuc2V0Q3Vyc29yUG9zaXRpb24oe25ld1Jhbmdlcywgb2xkUmFuZ2VzLCBzdHJhdGVneX0pXG4gICAgICB0aGlzLnZpbVN0YXRlLmNsZWFyU2VsZWN0aW9ucygpXG4gICAgfVxuXG4gICAgaWYgKHRoaXMuZ2V0Q29uZmlnKFwiZmxhc2hPblVuZG9SZWRvXCIpKSB0aGlzLmZsYXNoQ2hhbmdlcyh7bmV3UmFuZ2VzLCBvbGRSYW5nZXN9KVxuICAgIHRoaXMuYWN0aXZhdGVNb2RlKFwibm9ybWFsXCIpXG4gIH1cblxuICBtdXRhdGUoKSB7XG4gICAgdGhpcy5lZGl0b3IudW5kbygpXG4gIH1cbn1cblVuZG8ucmVnaXN0ZXIoKVxuXG5jbGFzcyBSZWRvIGV4dGVuZHMgVW5kbyB7XG4gIG11dGF0ZSgpIHtcbiAgICB0aGlzLmVkaXRvci5yZWRvKClcbiAgfVxufVxuUmVkby5yZWdpc3RlcigpXG5cbi8vIHpjXG5jbGFzcyBGb2xkQ3VycmVudFJvdyBleHRlbmRzIE1pc2NDb21tYW5kIHtcbiAgZXhlY3V0ZSgpIHtcbiAgICBmb3IgKGNvbnN0IHNlbGVjdGlvbiBvZiB0aGlzLmVkaXRvci5nZXRTZWxlY3Rpb25zKCkpIHtcbiAgICAgIHRoaXMuZWRpdG9yLmZvbGRCdWZmZXJSb3codGhpcy5nZXRDdXJzb3JQb3NpdGlvbkZvclNlbGVjdGlvbihzZWxlY3Rpb24pLnJvdylcbiAgICB9XG4gIH1cbn1cbkZvbGRDdXJyZW50Um93LnJlZ2lzdGVyKClcblxuLy8gem9cbmNsYXNzIFVuZm9sZEN1cnJlbnRSb3cgZXh0ZW5kcyBNaXNjQ29tbWFuZCB7XG4gIGV4ZWN1dGUoKSB7XG4gICAgZm9yIChjb25zdCBzZWxlY3Rpb24gb2YgdGhpcy5lZGl0b3IuZ2V0U2VsZWN0aW9ucygpKSB7XG4gICAgICB0aGlzLmVkaXRvci51bmZvbGRCdWZmZXJSb3codGhpcy5nZXRDdXJzb3JQb3NpdGlvbkZvclNlbGVjdGlvbihzZWxlY3Rpb24pLnJvdylcbiAgICB9XG4gIH1cbn1cblVuZm9sZEN1cnJlbnRSb3cucmVnaXN0ZXIoKVxuXG4vLyB6YVxuY2xhc3MgVG9nZ2xlRm9sZCBleHRlbmRzIE1pc2NDb21tYW5kIHtcbiAgZXhlY3V0ZSgpIHtcbiAgICB0aGlzLmVkaXRvci50b2dnbGVGb2xkQXRCdWZmZXJSb3codGhpcy5lZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKS5yb3cpXG4gIH1cbn1cblRvZ2dsZUZvbGQucmVnaXN0ZXIoKVxuXG4vLyBCYXNlIG9mIHpDLCB6TywgekFcbmNsYXNzIEZvbGRDdXJyZW50Um93UmVjdXJzaXZlbHlCYXNlIGV4dGVuZHMgTWlzY0NvbW1hbmQge1xuICBmb2xkUmVjdXJzaXZlbHkocm93KSB7XG4gICAgY29uc3Qgcm93UmFuZ2VzID0gZ2V0Rm9sZFJvd1Jhbmdlc0NvbnRhaW5lZEJ5Rm9sZFN0YXJ0c0F0Um93KHRoaXMuZWRpdG9yLCByb3cpXG4gICAgaWYgKCFyb3dSYW5nZXMpIHJldHVyblxuICAgIGNvbnN0IHN0YXJ0Um93cyA9IHJvd1Jhbmdlcy5tYXAocm93UmFuZ2UgPT4gcm93UmFuZ2VbMF0pXG4gICAgZm9yIChjb25zdCByb3cgb2Ygc3RhcnRSb3dzLnJldmVyc2UoKSkge1xuICAgICAgaWYgKCF0aGlzLmVkaXRvci5pc0ZvbGRlZEF0QnVmZmVyUm93KHJvdykpIHtcbiAgICAgICAgdGhpcy5lZGl0b3IuZm9sZEJ1ZmZlclJvdyhyb3cpXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgdW5mb2xkUmVjdXJzaXZlbHkocm93KSB7XG4gICAgY29uc3Qgcm93UmFuZ2VzID0gZ2V0Rm9sZFJvd1Jhbmdlc0NvbnRhaW5lZEJ5Rm9sZFN0YXJ0c0F0Um93KHRoaXMuZWRpdG9yLCByb3cpXG4gICAgaWYgKCFyb3dSYW5nZXMpIHJldHVyblxuICAgIGNvbnN0IHN0YXJ0Um93cyA9IHJvd1Jhbmdlcy5tYXAocm93UmFuZ2UgPT4gcm93UmFuZ2VbMF0pXG4gICAgZm9yIChyb3cgb2Ygc3RhcnRSb3dzKSB7XG4gICAgICBpZiAodGhpcy5lZGl0b3IuaXNGb2xkZWRBdEJ1ZmZlclJvdyhyb3cpKSB7XG4gICAgICAgIHRoaXMuZWRpdG9yLnVuZm9sZEJ1ZmZlclJvdyhyb3cpXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZm9sZFJlY3Vyc2l2ZWx5Rm9yQWxsU2VsZWN0aW9ucygpIHtcbiAgICBmb3IgKGNvbnN0IHNlbGVjdGlvbiBvZiB0aGlzLmVkaXRvci5nZXRTZWxlY3Rpb25zT3JkZXJlZEJ5QnVmZmVyUG9zaXRpb24oKS5yZXZlcnNlKCkpIHtcbiAgICAgIHRoaXMuZm9sZFJlY3Vyc2l2ZWx5KHRoaXMuZ2V0Q3Vyc29yUG9zaXRpb25Gb3JTZWxlY3Rpb24oc2VsZWN0aW9uKS5yb3cpXG4gICAgfVxuICB9XG5cbiAgdW5mb2xkUmVjdXJzaXZlbHlGb3JBbGxTZWxlY3Rpb25zKCkge1xuICAgIGZvciAoY29uc3Qgc2VsZWN0aW9uIG9mIHRoaXMuZWRpdG9yLmdldFNlbGVjdGlvbnNPcmRlcmVkQnlCdWZmZXJQb3NpdGlvbigpKSB7XG4gICAgICB0aGlzLnVuZm9sZFJlY3Vyc2l2ZWx5KHRoaXMuZ2V0Q3Vyc29yUG9zaXRpb25Gb3JTZWxlY3Rpb24oc2VsZWN0aW9uKS5yb3cpXG4gICAgfVxuICB9XG59XG5Gb2xkQ3VycmVudFJvd1JlY3Vyc2l2ZWx5QmFzZS5yZWdpc3RlcihmYWxzZSlcblxuLy8gekNcbmNsYXNzIEZvbGRDdXJyZW50Um93UmVjdXJzaXZlbHkgZXh0ZW5kcyBGb2xkQ3VycmVudFJvd1JlY3Vyc2l2ZWx5QmFzZSB7XG4gIGV4ZWN1dGUoKSB7XG4gICAgdGhpcy5mb2xkUmVjdXJzaXZlbHlGb3JBbGxTZWxlY3Rpb25zKClcbiAgfVxufVxuRm9sZEN1cnJlbnRSb3dSZWN1cnNpdmVseS5yZWdpc3RlcigpXG5cbi8vIHpPXG5jbGFzcyBVbmZvbGRDdXJyZW50Um93UmVjdXJzaXZlbHkgZXh0ZW5kcyBGb2xkQ3VycmVudFJvd1JlY3Vyc2l2ZWx5QmFzZSB7XG4gIGV4ZWN1dGUoKSB7XG4gICAgdGhpcy51bmZvbGRSZWN1cnNpdmVseUZvckFsbFNlbGVjdGlvbnMoKVxuICB9XG59XG5VbmZvbGRDdXJyZW50Um93UmVjdXJzaXZlbHkucmVnaXN0ZXIoKVxuXG4vLyB6QVxuY2xhc3MgVG9nZ2xlRm9sZFJlY3Vyc2l2ZWx5IGV4dGVuZHMgRm9sZEN1cnJlbnRSb3dSZWN1cnNpdmVseUJhc2Uge1xuICBleGVjdXRlKCkge1xuICAgIGNvbnN0IHtyb3d9ID0gdGhpcy5nZXRDdXJzb3JQb3NpdGlvbkZvclNlbGVjdGlvbih0aGlzLmVkaXRvci5nZXRMYXN0U2VsZWN0aW9uKCkpXG4gICAgaWYgKHRoaXMuZWRpdG9yLmlzRm9sZGVkQXRCdWZmZXJSb3cocm93KSkge1xuICAgICAgdGhpcy51bmZvbGRSZWN1cnNpdmVseUZvckFsbFNlbGVjdGlvbnMoKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmZvbGRSZWN1cnNpdmVseUZvckFsbFNlbGVjdGlvbnMoKVxuICAgIH1cbiAgfVxufVxuVG9nZ2xlRm9sZFJlY3Vyc2l2ZWx5LnJlZ2lzdGVyKClcblxuLy8gelJcbmNsYXNzIFVuZm9sZEFsbCBleHRlbmRzIE1pc2NDb21tYW5kIHtcbiAgZXhlY3V0ZSgpIHtcbiAgICB0aGlzLmVkaXRvci51bmZvbGRBbGwoKVxuICB9XG59XG5VbmZvbGRBbGwucmVnaXN0ZXIoKVxuXG4vLyB6TVxuY2xhc3MgRm9sZEFsbCBleHRlbmRzIE1pc2NDb21tYW5kIHtcbiAgZXhlY3V0ZSgpIHtcbiAgICBjb25zdCB7YWxsRm9sZH0gPSBnZXRGb2xkSW5mb0J5S2luZCh0aGlzLmVkaXRvcilcbiAgICBpZiAoIWFsbEZvbGQpIHJldHVyblxuXG4gICAgdGhpcy5lZGl0b3IudW5mb2xkQWxsKClcbiAgICBmb3IgKGNvbnN0IHtpbmRlbnQsIHN0YXJ0Um93LCBlbmRSb3d9IG9mIGFsbEZvbGQucm93UmFuZ2VzV2l0aEluZGVudCkge1xuICAgICAgaWYgKGluZGVudCA8PSB0aGlzLmdldENvbmZpZyhcIm1heEZvbGRhYmxlSW5kZW50TGV2ZWxcIikpIHtcbiAgICAgICAgdGhpcy5lZGl0b3IuZm9sZEJ1ZmZlclJvd1JhbmdlKHN0YXJ0Um93LCBlbmRSb3cpXG4gICAgICB9XG4gICAgfVxuICB9XG59XG5Gb2xkQWxsLnJlZ2lzdGVyKClcblxuLy8genJcbmNsYXNzIFVuZm9sZE5leHRJbmRlbnRMZXZlbCBleHRlbmRzIE1pc2NDb21tYW5kIHtcbiAgZXhlY3V0ZSgpIHtcbiAgICBjb25zdCB7Zm9sZGVkfSA9IGdldEZvbGRJbmZvQnlLaW5kKHRoaXMuZWRpdG9yKVxuICAgIGlmICghZm9sZGVkKSByZXR1cm5cbiAgICBjb25zdCB7bWluSW5kZW50LCByb3dSYW5nZXNXaXRoSW5kZW50fSA9IGZvbGRlZFxuICAgIGNvbnN0IGNvdW50ID0gbGltaXROdW1iZXIodGhpcy5nZXRDb3VudCgpIC0gMSwge21pbjogMH0pXG4gICAgY29uc3QgdGFyZ2V0SW5kZW50cyA9IGdldExpc3QobWluSW5kZW50LCBtaW5JbmRlbnQgKyBjb3VudClcbiAgICBmb3IgKGNvbnN0IHtpbmRlbnQsIHN0YXJ0Um93fSBvZiByb3dSYW5nZXNXaXRoSW5kZW50KSB7XG4gICAgICBpZiAodGFyZ2V0SW5kZW50cy5pbmNsdWRlcyhpbmRlbnQpKSB7XG4gICAgICAgIHRoaXMuZWRpdG9yLnVuZm9sZEJ1ZmZlclJvdyhzdGFydFJvdylcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblVuZm9sZE5leHRJbmRlbnRMZXZlbC5yZWdpc3RlcigpXG5cbi8vIHptXG5jbGFzcyBGb2xkTmV4dEluZGVudExldmVsIGV4dGVuZHMgTWlzY0NvbW1hbmQge1xuICBleGVjdXRlKCkge1xuICAgIGNvbnN0IHt1bmZvbGRlZCwgYWxsRm9sZH0gPSBnZXRGb2xkSW5mb0J5S2luZCh0aGlzLmVkaXRvcilcbiAgICBpZiAoIXVuZm9sZGVkKSByZXR1cm5cbiAgICAvLyBGSVhNRTogV2h5IEkgbmVlZCB1bmZvbGRBbGwoKT8gV2h5IGNhbid0IEkganVzdCBmb2xkIG5vbi1mb2xkZWQtZm9sZCBvbmx5P1xuICAgIC8vIFVubGVzcyB1bmZvbGRBbGwoKSBoZXJlLCBAZWRpdG9yLnVuZm9sZEFsbCgpIGRlbGV0ZSBmb2xkTWFya2VyIGJ1dCBmYWlsXG4gICAgLy8gdG8gcmVuZGVyIHVuZm9sZGVkIHJvd3MgY29ycmVjdGx5LlxuICAgIC8vIEkgYmVsaWV2ZSB0aGlzIGlzIGJ1ZyBvZiB0ZXh0LWJ1ZmZlcidzIG1hcmtlckxheWVyIHdoaWNoIGFzc3VtZSBmb2xkcyBhcmVcbiAgICAvLyBjcmVhdGVkICoqaW4tb3JkZXIqKiBmcm9tIHRvcC1yb3cgdG8gYm90dG9tLXJvdy5cbiAgICB0aGlzLmVkaXRvci51bmZvbGRBbGwoKVxuXG4gICAgY29uc3QgbWF4Rm9sZGFibGUgPSB0aGlzLmdldENvbmZpZyhcIm1heEZvbGRhYmxlSW5kZW50TGV2ZWxcIilcbiAgICBsZXQgZnJvbUxldmVsID0gTWF0aC5taW4odW5mb2xkZWQubWF4SW5kZW50LCBtYXhGb2xkYWJsZSlcbiAgICBjb25zdCBjb3VudCA9IGxpbWl0TnVtYmVyKHRoaXMuZ2V0Q291bnQoKSAtIDEsIHttaW46IDB9KVxuICAgIGZyb21MZXZlbCA9IGxpbWl0TnVtYmVyKGZyb21MZXZlbCAtIGNvdW50LCB7bWluOiAwfSlcbiAgICBjb25zdCB0YXJnZXRJbmRlbnRzID0gZ2V0TGlzdChmcm9tTGV2ZWwsIG1heEZvbGRhYmxlKVxuICAgIGZvciAoY29uc3Qge2luZGVudCwgc3RhcnRSb3csIGVuZFJvd30gb2YgYWxsRm9sZC5yb3dSYW5nZXNXaXRoSW5kZW50KSB7XG4gICAgICBpZiAodGFyZ2V0SW5kZW50cy5pbmNsdWRlcyhpbmRlbnQpKSB7XG4gICAgICAgIHRoaXMuZWRpdG9yLmZvbGRCdWZmZXJSb3dSYW5nZShzdGFydFJvdywgZW5kUm93KVxuICAgICAgfVxuICAgIH1cbiAgfVxufVxuRm9sZE5leHRJbmRlbnRMZXZlbC5yZWdpc3RlcigpXG5cbmNsYXNzIFJlcGxhY2VNb2RlQmFja3NwYWNlIGV4dGVuZHMgTWlzY0NvbW1hbmQge1xuICBzdGF0aWMgY29tbWFuZFNjb3BlID0gXCJhdG9tLXRleHQtZWRpdG9yLnZpbS1tb2RlLXBsdXMuaW5zZXJ0LW1vZGUucmVwbGFjZVwiXG5cbiAgZXhlY3V0ZSgpIHtcbiAgICBmb3IgKGNvbnN0IHNlbGVjdGlvbiBvZiB0aGlzLmVkaXRvci5nZXRTZWxlY3Rpb25zKCkpIHtcbiAgICAgIC8vIGNoYXIgbWlnaHQgYmUgZW1wdHkuXG4gICAgICBjb25zdCBjaGFyID0gdGhpcy52aW1TdGF0ZS5tb2RlTWFuYWdlci5nZXRSZXBsYWNlZENoYXJGb3JTZWxlY3Rpb24oc2VsZWN0aW9uKVxuICAgICAgaWYgKGNoYXIgIT0gbnVsbCkge1xuICAgICAgICBzZWxlY3Rpb24uc2VsZWN0TGVmdCgpXG4gICAgICAgIGlmICghc2VsZWN0aW9uLmluc2VydFRleHQoY2hhcikuaXNFbXB0eSgpKSBzZWxlY3Rpb24uY3Vyc29yLm1vdmVMZWZ0KClcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblJlcGxhY2VNb2RlQmFja3NwYWNlLnJlZ2lzdGVyKClcblxuY2xhc3MgU2Nyb2xsV2l0aG91dENoYW5naW5nQ3Vyc29yUG9zaXRpb24gZXh0ZW5kcyBNaXNjQ29tbWFuZCB7XG4gIHNjcm9sbG9mZiA9IDIgLy8gYXRvbSBkZWZhdWx0LiBCZXR0ZXIgdG8gdXNlIGVkaXRvci5nZXRWZXJ0aWNhbFNjcm9sbE1hcmdpbigpP1xuICBjdXJzb3JQaXhlbCA9IG51bGxcblxuICBnZXRGaXJzdFZpc2libGVTY3JlZW5Sb3coKSB7XG4gICAgcmV0dXJuIHRoaXMuZWRpdG9yRWxlbWVudC5nZXRGaXJzdFZpc2libGVTY3JlZW5Sb3coKVxuICB9XG5cbiAgZ2V0TGFzdFZpc2libGVTY3JlZW5Sb3coKSB7XG4gICAgcmV0dXJuIHRoaXMuZWRpdG9yRWxlbWVudC5nZXRMYXN0VmlzaWJsZVNjcmVlblJvdygpXG4gIH1cblxuICBnZXRMYXN0U2NyZWVuUm93KCkge1xuICAgIHJldHVybiB0aGlzLmVkaXRvci5nZXRMYXN0U2NyZWVuUm93KClcbiAgfVxuXG4gIGdldEN1cnNvclBpeGVsKCkge1xuICAgIGNvbnN0IHBvaW50ID0gdGhpcy5lZGl0b3IuZ2V0Q3Vyc29yU2NyZWVuUG9zaXRpb24oKVxuICAgIHJldHVybiB0aGlzLmVkaXRvckVsZW1lbnQucGl4ZWxQb3NpdGlvbkZvclNjcmVlblBvc2l0aW9uKHBvaW50KVxuICB9XG59XG5TY3JvbGxXaXRob3V0Q2hhbmdpbmdDdXJzb3JQb3NpdGlvbi5yZWdpc3RlcihmYWxzZSlcblxuLy8gY3RybC1lIHNjcm9sbCBsaW5lcyBkb3dud2FyZHNcbmNsYXNzIFNjcm9sbERvd24gZXh0ZW5kcyBTY3JvbGxXaXRob3V0Q2hhbmdpbmdDdXJzb3JQb3NpdGlvbiB7XG4gIGV4ZWN1dGUoKSB7XG4gICAgY29uc3QgY291bnQgPSB0aGlzLmdldENvdW50KClcbiAgICBjb25zdCBvbGRGaXJzdFJvdyA9IHRoaXMuZWRpdG9yLmdldEZpcnN0VmlzaWJsZVNjcmVlblJvdygpXG4gICAgdGhpcy5lZGl0b3Iuc2V0Rmlyc3RWaXNpYmxlU2NyZWVuUm93KG9sZEZpcnN0Um93ICsgY291bnQpXG4gICAgY29uc3QgbmV3Rmlyc3RSb3cgPSB0aGlzLmVkaXRvci5nZXRGaXJzdFZpc2libGVTY3JlZW5Sb3coKVxuXG4gICAgY29uc3Qgb2Zmc2V0ID0gMlxuICAgIGNvbnN0IHtyb3csIGNvbHVtbn0gPSB0aGlzLmVkaXRvci5nZXRDdXJzb3JTY3JlZW5Qb3NpdGlvbigpXG4gICAgaWYgKHJvdyA8IG5ld0ZpcnN0Um93ICsgb2Zmc2V0KSB7XG4gICAgICBjb25zdCBuZXdQb2ludCA9IFtyb3cgKyBjb3VudCwgY29sdW1uXVxuICAgICAgdGhpcy5lZGl0b3Iuc2V0Q3Vyc29yU2NyZWVuUG9zaXRpb24obmV3UG9pbnQsIHthdXRvc2Nyb2xsOiBmYWxzZX0pXG4gICAgfVxuICB9XG59XG5TY3JvbGxEb3duLnJlZ2lzdGVyKClcblxuLy8gY3RybC15IHNjcm9sbCBsaW5lcyB1cHdhcmRzXG5jbGFzcyBTY3JvbGxVcCBleHRlbmRzIFNjcm9sbFdpdGhvdXRDaGFuZ2luZ0N1cnNvclBvc2l0aW9uIHtcbiAgZXhlY3V0ZSgpIHtcbiAgICBjb25zdCBjb3VudCA9IHRoaXMuZ2V0Q291bnQoKVxuICAgIGNvbnN0IG9sZEZpcnN0Um93ID0gdGhpcy5lZGl0b3IuZ2V0Rmlyc3RWaXNpYmxlU2NyZWVuUm93KClcbiAgICB0aGlzLmVkaXRvci5zZXRGaXJzdFZpc2libGVTY3JlZW5Sb3cob2xkRmlyc3RSb3cgLSBjb3VudClcbiAgICBjb25zdCBuZXdMYXN0Um93ID0gdGhpcy5lZGl0b3IuZ2V0TGFzdFZpc2libGVTY3JlZW5Sb3coKVxuXG4gICAgY29uc3Qgb2Zmc2V0ID0gMlxuICAgIGNvbnN0IHtyb3csIGNvbHVtbn0gPSB0aGlzLmVkaXRvci5nZXRDdXJzb3JTY3JlZW5Qb3NpdGlvbigpXG4gICAgaWYgKHJvdyA+PSBuZXdMYXN0Um93IC0gb2Zmc2V0KSB7XG4gICAgICBjb25zdCBuZXdQb2ludCA9IFtyb3cgLSBjb3VudCwgY29sdW1uXVxuICAgICAgdGhpcy5lZGl0b3Iuc2V0Q3Vyc29yU2NyZWVuUG9zaXRpb24obmV3UG9pbnQsIHthdXRvc2Nyb2xsOiBmYWxzZX0pXG4gICAgfVxuICB9XG59XG5TY3JvbGxVcC5yZWdpc3RlcigpXG5cbi8vIFNjcm9sbFdpdGhvdXRDaGFuZ2luZ0N1cnNvclBvc2l0aW9uIHdpdGhvdXQgQ3Vyc29yIFBvc2l0aW9uIGNoYW5nZS5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIFNjcm9sbEN1cnNvciBleHRlbmRzIFNjcm9sbFdpdGhvdXRDaGFuZ2luZ0N1cnNvclBvc2l0aW9uIHtcbiAgbW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmUgPSB0cnVlXG5cbiAgZXhlY3V0ZSgpIHtcbiAgICBpZiAodGhpcy5tb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZSkgdGhpcy5lZGl0b3IubW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmUoKVxuICAgIGlmICh0aGlzLmlzU2Nyb2xsYWJsZSgpKSB0aGlzLmVkaXRvckVsZW1lbnQuc2V0U2Nyb2xsVG9wKHRoaXMuZ2V0U2Nyb2xsVG9wKCkpXG4gIH1cblxuICBnZXRPZmZTZXRQaXhlbEhlaWdodChsaW5lRGVsdGEgPSAwKSB7XG4gICAgcmV0dXJuIHRoaXMuZWRpdG9yLmdldExpbmVIZWlnaHRJblBpeGVscygpICogKHRoaXMuc2Nyb2xsb2ZmICsgbGluZURlbHRhKVxuICB9XG59XG5TY3JvbGxDdXJzb3IucmVnaXN0ZXIoZmFsc2UpXG5cbi8vIHogZW50ZXJcbmNsYXNzIFNjcm9sbEN1cnNvclRvVG9wIGV4dGVuZHMgU2Nyb2xsQ3Vyc29yIHtcbiAgaXNTY3JvbGxhYmxlKCkge1xuICAgIHJldHVybiB0aGlzLmdldExhc3RWaXNpYmxlU2NyZWVuUm93KCkgIT09IHRoaXMuZ2V0TGFzdFNjcmVlblJvdygpXG4gIH1cblxuICBnZXRTY3JvbGxUb3AoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0Q3Vyc29yUGl4ZWwoKS50b3AgLSB0aGlzLmdldE9mZlNldFBpeGVsSGVpZ2h0KClcbiAgfVxufVxuU2Nyb2xsQ3Vyc29yVG9Ub3AucmVnaXN0ZXIoKVxuXG4vLyB6dFxuY2xhc3MgU2Nyb2xsQ3Vyc29yVG9Ub3BMZWF2ZSBleHRlbmRzIFNjcm9sbEN1cnNvclRvVG9wIHtcbiAgbW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmUgPSBmYWxzZVxufVxuU2Nyb2xsQ3Vyc29yVG9Ub3BMZWF2ZS5yZWdpc3RlcigpXG5cbi8vIHotXG5jbGFzcyBTY3JvbGxDdXJzb3JUb0JvdHRvbSBleHRlbmRzIFNjcm9sbEN1cnNvciB7XG4gIGlzU2Nyb2xsYWJsZSgpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRGaXJzdFZpc2libGVTY3JlZW5Sb3coKSAhPT0gMFxuICB9XG5cbiAgZ2V0U2Nyb2xsVG9wKCkge1xuICAgIHJldHVybiB0aGlzLmdldEN1cnNvclBpeGVsKCkudG9wIC0gKHRoaXMuZWRpdG9yRWxlbWVudC5nZXRIZWlnaHQoKSAtIHRoaXMuZ2V0T2ZmU2V0UGl4ZWxIZWlnaHQoMSkpXG4gIH1cbn1cblNjcm9sbEN1cnNvclRvQm90dG9tLnJlZ2lzdGVyKClcblxuLy8gemJcbmNsYXNzIFNjcm9sbEN1cnNvclRvQm90dG9tTGVhdmUgZXh0ZW5kcyBTY3JvbGxDdXJzb3JUb0JvdHRvbSB7XG4gIG1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lID0gZmFsc2Vcbn1cblNjcm9sbEN1cnNvclRvQm90dG9tTGVhdmUucmVnaXN0ZXIoKVxuXG4vLyB6LlxuY2xhc3MgU2Nyb2xsQ3Vyc29yVG9NaWRkbGUgZXh0ZW5kcyBTY3JvbGxDdXJzb3Ige1xuICBpc1Njcm9sbGFibGUoKSB7XG4gICAgcmV0dXJuIHRydWVcbiAgfVxuXG4gIGdldFNjcm9sbFRvcCgpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRDdXJzb3JQaXhlbCgpLnRvcCAtIHRoaXMuZWRpdG9yRWxlbWVudC5nZXRIZWlnaHQoKSAvIDJcbiAgfVxufVxuU2Nyb2xsQ3Vyc29yVG9NaWRkbGUucmVnaXN0ZXIoKVxuXG4vLyB6elxuY2xhc3MgU2Nyb2xsQ3Vyc29yVG9NaWRkbGVMZWF2ZSBleHRlbmRzIFNjcm9sbEN1cnNvclRvTWlkZGxlIHtcbiAgbW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmUgPSBmYWxzZVxufVxuU2Nyb2xsQ3Vyc29yVG9NaWRkbGVMZWF2ZS5yZWdpc3RlcigpXG5cbi8vIEhvcml6b250YWwgU2Nyb2xsV2l0aG91dENoYW5naW5nQ3Vyc29yUG9zaXRpb25cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIHpzXG5jbGFzcyBTY3JvbGxDdXJzb3JUb0xlZnQgZXh0ZW5kcyBTY3JvbGxXaXRob3V0Q2hhbmdpbmdDdXJzb3JQb3NpdGlvbiB7XG4gIGV4ZWN1dGUoKSB7XG4gICAgdGhpcy5lZGl0b3JFbGVtZW50LnNldFNjcm9sbExlZnQodGhpcy5nZXRDdXJzb3JQaXhlbCgpLmxlZnQpXG4gIH1cbn1cblNjcm9sbEN1cnNvclRvTGVmdC5yZWdpc3RlcigpXG5cbi8vIHplXG5jbGFzcyBTY3JvbGxDdXJzb3JUb1JpZ2h0IGV4dGVuZHMgU2Nyb2xsQ3Vyc29yVG9MZWZ0IHtcbiAgZXhlY3V0ZSgpIHtcbiAgICB0aGlzLmVkaXRvckVsZW1lbnQuc2V0U2Nyb2xsUmlnaHQodGhpcy5nZXRDdXJzb3JQaXhlbCgpLmxlZnQpXG4gIH1cbn1cblNjcm9sbEN1cnNvclRvUmlnaHQucmVnaXN0ZXIoKVxuXG4vLyBpbnNlcnQtbW9kZSBzcGVjaWZpYyBjb21tYW5kc1xuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgSW5zZXJ0TW9kZSBleHRlbmRzIE1pc2NDb21tYW5kIHt9XG5JbnNlcnRNb2RlLmNvbW1hbmRTY29wZSA9IFwiYXRvbS10ZXh0LWVkaXRvci52aW0tbW9kZS1wbHVzLmluc2VydC1tb2RlXCJcblxuY2xhc3MgQWN0aXZhdGVOb3JtYWxNb2RlT25jZSBleHRlbmRzIEluc2VydE1vZGUge1xuICBleGVjdXRlKCkge1xuICAgIGNvbnN0IGN1cnNvcnNUb01vdmVSaWdodCA9IHRoaXMuZWRpdG9yLmdldEN1cnNvcnMoKS5maWx0ZXIoY3Vyc29yID0+ICFjdXJzb3IuaXNBdEJlZ2lubmluZ09mTGluZSgpKVxuICAgIHRoaXMudmltU3RhdGUuYWN0aXZhdGUoXCJub3JtYWxcIilcbiAgICBmb3IgKGNvbnN0IGN1cnNvciBvZiBjdXJzb3JzVG9Nb3ZlUmlnaHQpIHtcbiAgICAgIG1vdmVDdXJzb3JSaWdodChjdXJzb3IpXG4gICAgfVxuXG4gICAgbGV0IGRpc3Bvc2FibGUgPSBhdG9tLmNvbW1hbmRzLm9uRGlkRGlzcGF0Y2goZXZlbnQgPT4ge1xuICAgICAgaWYgKGV2ZW50LnR5cGUgPT09IHRoaXMuZ2V0Q29tbWFuZE5hbWUoKSkgcmV0dXJuXG5cbiAgICAgIGRpc3Bvc2FibGUuZGlzcG9zZSgpXG4gICAgICBkaXNwb3NhYmxlID0gbnVsbFxuICAgICAgdGhpcy52aW1TdGF0ZS5hY3RpdmF0ZShcImluc2VydFwiKVxuICAgIH0pXG4gIH1cbn1cbkFjdGl2YXRlTm9ybWFsTW9kZU9uY2UucmVnaXN0ZXIoKVxuXG5jbGFzcyBJbnNlcnRSZWdpc3RlciBleHRlbmRzIEluc2VydE1vZGUge1xuICByZXF1aXJlSW5wdXQgPSB0cnVlXG4gIGluaXRpYWxpemUoKSB7XG4gICAgdGhpcy5yZWFkQ2hhcigpXG4gICAgcmV0dXJuIHN1cGVyLmluaXRpYWxpemUoKVxuICB9XG5cbiAgZXhlY3V0ZSgpIHtcbiAgICB0aGlzLmVkaXRvci50cmFuc2FjdCgoKSA9PiB7XG4gICAgICBmb3IgKGNvbnN0IHNlbGVjdGlvbiBvZiB0aGlzLmVkaXRvci5nZXRTZWxlY3Rpb25zKCkpIHtcbiAgICAgICAgY29uc3QgdGV4dCA9IHRoaXMudmltU3RhdGUucmVnaXN0ZXIuZ2V0VGV4dCh0aGlzLmlucHV0LCBzZWxlY3Rpb24pXG4gICAgICAgIHNlbGVjdGlvbi5pbnNlcnRUZXh0KHRleHQpXG4gICAgICB9XG4gICAgfSlcbiAgfVxufVxuSW5zZXJ0UmVnaXN0ZXIucmVnaXN0ZXIoKVxuXG5jbGFzcyBJbnNlcnRMYXN0SW5zZXJ0ZWQgZXh0ZW5kcyBJbnNlcnRNb2RlIHtcbiAgZXhlY3V0ZSgpIHtcbiAgICBjb25zdCB0ZXh0ID0gdGhpcy52aW1TdGF0ZS5yZWdpc3Rlci5nZXRUZXh0KFwiLlwiKVxuICAgIHRoaXMuZWRpdG9yLmluc2VydFRleHQodGV4dClcbiAgfVxufVxuSW5zZXJ0TGFzdEluc2VydGVkLnJlZ2lzdGVyKClcblxuY2xhc3MgQ29weUZyb21MaW5lQWJvdmUgZXh0ZW5kcyBJbnNlcnRNb2RlIHtcbiAgcm93RGVsdGEgPSAtMVxuXG4gIGV4ZWN1dGUoKSB7XG4gICAgY29uc3QgdHJhbnNsYXRpb24gPSBbdGhpcy5yb3dEZWx0YSwgMF1cbiAgICB0aGlzLmVkaXRvci50cmFuc2FjdCgoKSA9PiB7XG4gICAgICBmb3IgKGxldCBzZWxlY3Rpb24gb2YgdGhpcy5lZGl0b3IuZ2V0U2VsZWN0aW9ucygpKSB7XG4gICAgICAgIGNvbnN0IHBvaW50ID0gc2VsZWN0aW9uLmN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpLnRyYW5zbGF0ZSh0cmFuc2xhdGlvbilcbiAgICAgICAgaWYgKHBvaW50LnJvdyA8IDApIGNvbnRpbnVlXG5cbiAgICAgICAgY29uc3QgcmFuZ2UgPSBSYW5nZS5mcm9tUG9pbnRXaXRoRGVsdGEocG9pbnQsIDAsIDEpXG4gICAgICAgIGNvbnN0IHRleHQgPSB0aGlzLmVkaXRvci5nZXRUZXh0SW5CdWZmZXJSYW5nZShyYW5nZSlcbiAgICAgICAgaWYgKHRleHQpIHNlbGVjdGlvbi5pbnNlcnRUZXh0KHRleHQpXG4gICAgICB9XG4gICAgfSlcbiAgfVxufVxuQ29weUZyb21MaW5lQWJvdmUucmVnaXN0ZXIoKVxuXG5jbGFzcyBDb3B5RnJvbUxpbmVCZWxvdyBleHRlbmRzIENvcHlGcm9tTGluZUFib3ZlIHtcbiAgcm93RGVsdGEgPSArMVxufVxuQ29weUZyb21MaW5lQmVsb3cucmVnaXN0ZXIoKVxuXG5jbGFzcyBOZXh0VGFiIGV4dGVuZHMgTWlzY0NvbW1hbmQge1xuICBkZWZhdWx0Q291bnQgPSAwXG5cbiAgZXhlY3V0ZSgpIHtcbiAgICBjb25zdCBjb3VudCA9IHRoaXMuZ2V0Q291bnQoKVxuICAgIGNvbnN0IHBhbmUgPSBhdG9tLndvcmtzcGFjZS5wYW5lRm9ySXRlbSh0aGlzLmVkaXRvcilcblxuICAgIGlmIChjb3VudCkgcGFuZS5hY3RpdmF0ZUl0ZW1BdEluZGV4KGNvdW50IC0gMSlcbiAgICBlbHNlIHBhbmUuYWN0aXZhdGVOZXh0SXRlbSgpXG4gIH1cbn1cbk5leHRUYWIucmVnaXN0ZXIoKVxuXG5jbGFzcyBQcmV2aW91c1RhYiBleHRlbmRzIE1pc2NDb21tYW5kIHtcbiAgZXhlY3V0ZSgpIHtcbiAgICBhdG9tLndvcmtzcGFjZS5wYW5lRm9ySXRlbSh0aGlzLmVkaXRvcikuYWN0aXZhdGVQcmV2aW91c0l0ZW0oKVxuICB9XG59XG5QcmV2aW91c1RhYi5yZWdpc3RlcigpXG4iXX0=