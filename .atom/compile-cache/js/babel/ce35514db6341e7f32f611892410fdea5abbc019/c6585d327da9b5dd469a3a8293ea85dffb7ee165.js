"use babel";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, "next"); var callThrow = step.bind(null, "throw"); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

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
  }

  _createClass(Mark, [{
    key: "execute",
    value: _asyncToGenerator(function* () {
      var mark = yield this.readCharPromised();
      if (mark) {
        this.vimState.mark.set(mark, this.getCursorBufferPosition());
      }
    })
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

var MiniScrollDown = (function (_MiscCommand13) {
  _inherits(MiniScrollDown, _MiscCommand13);

  function MiniScrollDown() {
    _classCallCheck(this, MiniScrollDown);

    _get(Object.getPrototypeOf(MiniScrollDown.prototype), "constructor", this).apply(this, arguments);

    this.defaultCount = this.getConfig("defaultScrollRowsOnMiniScroll");
    this.direction = "down";
  }

  _createClass(MiniScrollDown, [{
    key: "keepCursorOnScreen",
    value: function keepCursorOnScreen(scrollRows) {
      var cursor = this.editor.getLastCursor();
      var row = cursor.getScreenRow();
      var offset = 2;
      var validScreenRow = this.direction === "down" ? this.utils.limitNumber(row, { min: this.editor.getFirstVisibleScreenRow() + offset }) : this.utils.limitNumber(row, { max: this.editor.getLastVisibleScreenRow() - offset });
      if (row !== validScreenRow) {
        this.utils.setBufferRow(cursor, this.editor.bufferRowForScreenRow(validScreenRow), { autoscroll: false });
      }
    }
  }, {
    key: "execute",
    value: function execute() {
      var amountOfScreenRows = this.direction === "down" ? this.getCount() : -this.getCount();
      var duration = this.getConfig("smoothScrollOnMiniScroll") ? this.getConfig("smoothScrollOnMiniScrollDuration") : 0;
      this.vimState.requestScroll({ amountOfScreenRows: amountOfScreenRows, duration: duration, onFinish: this.keepCursorOnScreen.bind(this) });
    }
  }]);

  return MiniScrollDown;
})(MiscCommand);

MiniScrollDown.register();

// ctrl-y scroll lines upwards

var MiniScrollUp = (function (_MiniScrollDown) {
  _inherits(MiniScrollUp, _MiniScrollDown);

  function MiniScrollUp() {
    _classCallCheck(this, MiniScrollUp);

    _get(Object.getPrototypeOf(MiniScrollUp.prototype), "constructor", this).apply(this, arguments);

    this.direction = "up";
  }

  return MiniScrollUp;
})(MiniScrollDown);

MiniScrollUp.register();

// RedrawCursorLineAt{XXX} in viewport.
// +-------------------------------------------+
// | where        | no move | move to 1st char |
// |--------------+---------+------------------|
// | top          | z t     | z enter          |
// | upper-middle | z u     | z space          |
// | middle       | z z     | z .              |
// | bottom       | z b     | z -              |
// +-------------------------------------------+

var RedrawCursorLine = (function (_MiscCommand14) {
  _inherits(RedrawCursorLine, _MiscCommand14);

  function RedrawCursorLine() {
    _classCallCheck(this, RedrawCursorLine);

    _get(Object.getPrototypeOf(RedrawCursorLine.prototype), "constructor", this).apply(this, arguments);

    this.moveToFirstCharacterOfLine = false;
  }

  _createClass(RedrawCursorLine, [{
    key: "execute",
    value: function execute() {
      var _this6 = this;

      var scrollTop = Math.round(this.getScrollTop());
      var onFinish = function onFinish() {
        if (_this6.editorElement.getScrollTop() !== scrollTop && !_this6.editor.getScrollPastEnd()) {
          _this6.recommendToEnableScrollPastEnd();
        }
      };
      var duration = this.getConfig("smoothScrollOnRedrawCursorLine") ? this.getConfig("smoothScrollOnRedrawCursorLineDuration") : 0;
      this.vimState.requestScroll({ scrollTop: scrollTop, duration: duration, onFinish: onFinish });
      if (this.moveToFirstCharacterOfLine) this.editor.moveToFirstCharacterOfLine();
    }
  }, {
    key: "getScrollTop",
    value: function getScrollTop() {
      var _editorElement$pixelPositionForScreenPosition = this.editorElement.pixelPositionForScreenPosition(this.editor.getCursorScreenPosition());

      var top = _editorElement$pixelPositionForScreenPosition.top;

      var editorHeight = this.editorElement.getHeight();
      var lineHeightInPixel = this.editor.getLineHeightInPixels();
      return this.utils.limitNumber(top - editorHeight * this.coefficient, {
        min: top - editorHeight + lineHeightInPixel * 3,
        max: top - lineHeightInPixel * 2
      });
    }
  }, {
    key: "recommendToEnableScrollPastEnd",
    value: function recommendToEnableScrollPastEnd() {
      var message = ["vim-mode-plus", "- Failed to scroll. To successfully scroll, `editor.scrollPastEnd` need to be enabled.", '- You can do it from `"Settings" > "Editor" > "Scroll Past End"`.', "- Or **do you allow vmp enable it for you now?**"].join("\n");

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
    }
  }]);

  return RedrawCursorLine;
})(MiscCommand);

RedrawCursorLine.register(false);

// top: zt

var RedrawCursorLineAtTop = (function (_RedrawCursorLine) {
  _inherits(RedrawCursorLineAtTop, _RedrawCursorLine);

  function RedrawCursorLineAtTop() {
    _classCallCheck(this, RedrawCursorLineAtTop);

    _get(Object.getPrototypeOf(RedrawCursorLineAtTop.prototype), "constructor", this).apply(this, arguments);

    this.coefficient = 0;
  }

  return RedrawCursorLineAtTop;
})(RedrawCursorLine);

RedrawCursorLineAtTop.register();

// top: z enter

var RedrawCursorLineAtTopAndMoveToFirstCharacterOfLine = (function (_RedrawCursorLine2) {
  _inherits(RedrawCursorLineAtTopAndMoveToFirstCharacterOfLine, _RedrawCursorLine2);

  function RedrawCursorLineAtTopAndMoveToFirstCharacterOfLine() {
    _classCallCheck(this, RedrawCursorLineAtTopAndMoveToFirstCharacterOfLine);

    _get(Object.getPrototypeOf(RedrawCursorLineAtTopAndMoveToFirstCharacterOfLine.prototype), "constructor", this).apply(this, arguments);

    this.coefficient = 0;
    this.moveToFirstCharacterOfLine = true;
  }

  return RedrawCursorLineAtTopAndMoveToFirstCharacterOfLine;
})(RedrawCursorLine);

RedrawCursorLineAtTopAndMoveToFirstCharacterOfLine.register();

// upper-middle: zu

var RedrawCursorLineAtUpperMiddle = (function (_RedrawCursorLine3) {
  _inherits(RedrawCursorLineAtUpperMiddle, _RedrawCursorLine3);

  function RedrawCursorLineAtUpperMiddle() {
    _classCallCheck(this, RedrawCursorLineAtUpperMiddle);

    _get(Object.getPrototypeOf(RedrawCursorLineAtUpperMiddle.prototype), "constructor", this).apply(this, arguments);

    this.coefficient = 0.25;
  }

  return RedrawCursorLineAtUpperMiddle;
})(RedrawCursorLine);

RedrawCursorLineAtUpperMiddle.register();

// upper-middle: z space

var RedrawCursorLineAtUpperMiddleAndMoveToFirstCharacterOfLine = (function (_RedrawCursorLine4) {
  _inherits(RedrawCursorLineAtUpperMiddleAndMoveToFirstCharacterOfLine, _RedrawCursorLine4);

  function RedrawCursorLineAtUpperMiddleAndMoveToFirstCharacterOfLine() {
    _classCallCheck(this, RedrawCursorLineAtUpperMiddleAndMoveToFirstCharacterOfLine);

    _get(Object.getPrototypeOf(RedrawCursorLineAtUpperMiddleAndMoveToFirstCharacterOfLine.prototype), "constructor", this).apply(this, arguments);

    this.coefficient = 0.25;
    this.moveToFirstCharacterOfLine = true;
  }

  return RedrawCursorLineAtUpperMiddleAndMoveToFirstCharacterOfLine;
})(RedrawCursorLine);

RedrawCursorLineAtUpperMiddleAndMoveToFirstCharacterOfLine.register();

// middle: zz

var RedrawCursorLineAtMiddle = (function (_RedrawCursorLine5) {
  _inherits(RedrawCursorLineAtMiddle, _RedrawCursorLine5);

  function RedrawCursorLineAtMiddle() {
    _classCallCheck(this, RedrawCursorLineAtMiddle);

    _get(Object.getPrototypeOf(RedrawCursorLineAtMiddle.prototype), "constructor", this).apply(this, arguments);

    this.coefficient = 0.5;
  }

  return RedrawCursorLineAtMiddle;
})(RedrawCursorLine);

RedrawCursorLineAtMiddle.register();

// middle: z.

var RedrawCursorLineAtMiddleAndMoveToFirstCharacterOfLine = (function (_RedrawCursorLine6) {
  _inherits(RedrawCursorLineAtMiddleAndMoveToFirstCharacterOfLine, _RedrawCursorLine6);

  function RedrawCursorLineAtMiddleAndMoveToFirstCharacterOfLine() {
    _classCallCheck(this, RedrawCursorLineAtMiddleAndMoveToFirstCharacterOfLine);

    _get(Object.getPrototypeOf(RedrawCursorLineAtMiddleAndMoveToFirstCharacterOfLine.prototype), "constructor", this).apply(this, arguments);

    this.coefficient = 0.5;
    this.moveToFirstCharacterOfLine = true;
  }

  return RedrawCursorLineAtMiddleAndMoveToFirstCharacterOfLine;
})(RedrawCursorLine);

RedrawCursorLineAtMiddleAndMoveToFirstCharacterOfLine.register();

// bottom: zb

var RedrawCursorLineAtBottom = (function (_RedrawCursorLine7) {
  _inherits(RedrawCursorLineAtBottom, _RedrawCursorLine7);

  function RedrawCursorLineAtBottom() {
    _classCallCheck(this, RedrawCursorLineAtBottom);

    _get(Object.getPrototypeOf(RedrawCursorLineAtBottom.prototype), "constructor", this).apply(this, arguments);

    this.coefficient = 1;
  }

  return RedrawCursorLineAtBottom;
})(RedrawCursorLine);

RedrawCursorLineAtBottom.register();

// bottom: z-

var RedrawCursorLineAtBottomAndMoveToFirstCharacterOfLine = (function (_RedrawCursorLine8) {
  _inherits(RedrawCursorLineAtBottomAndMoveToFirstCharacterOfLine, _RedrawCursorLine8);

  function RedrawCursorLineAtBottomAndMoveToFirstCharacterOfLine() {
    _classCallCheck(this, RedrawCursorLineAtBottomAndMoveToFirstCharacterOfLine);

    _get(Object.getPrototypeOf(RedrawCursorLineAtBottomAndMoveToFirstCharacterOfLine.prototype), "constructor", this).apply(this, arguments);

    this.coefficient = 1;
    this.moveToFirstCharacterOfLine = true;
  }

  return RedrawCursorLineAtBottomAndMoveToFirstCharacterOfLine;
})(RedrawCursorLine);

RedrawCursorLineAtBottomAndMoveToFirstCharacterOfLine.register();

// Horizontal Scroll without changing cursor position
// -------------------------
// zs

var ScrollCursorToLeft = (function (_MiscCommand15) {
  _inherits(ScrollCursorToLeft, _MiscCommand15);

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

var InsertMode = (function (_MiscCommand16) {
  _inherits(InsertMode, _MiscCommand16);

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
      var _this7 = this;

      var cursorsToMoveRight = this.editor.getCursors().filter(function (cursor) {
        return !cursor.isAtBeginningOfLine();
      });
      this.vimState.activate("normal");
      for (var cursor of cursorsToMoveRight) {
        this.utils.moveCursorRight(cursor);
      }

      var disposable = atom.commands.onDidDispatch(function (event) {
        if (event.type === _this7.getCommandName()) return;

        disposable.dispose();
        disposable = null;
        _this7.vimState.activate("insert");
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
  }

  _createClass(InsertRegister, [{
    key: "execute",
    value: _asyncToGenerator(function* () {
      var _this8 = this;

      var input = yield this.readCharPromised();
      if (input) {
        this.editor.transact(function () {
          for (var selection of _this8.editor.getSelections()) {
            var text = _this8.vimState.register.getText(input, selection);
            selection.insertText(text);
          }
        });
      }
    })
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
      var _this9 = this;

      var translation = [this.rowDelta, 0];
      this.editor.transact(function () {
        for (var selection of _this9.editor.getSelections()) {
          var point = selection.cursor.getBufferPosition().translate(translation);
          if (point.row < 0) continue;

          var range = Range.fromPointWithDelta(point, 0, 1);
          var text = _this9.editor.getTextInBufferRange(range);
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

var NextTab = (function (_MiscCommand17) {
  _inherits(NextTab, _MiscCommand17);

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

var PreviousTab = (function (_MiscCommand18) {
  _inherits(PreviousTab, _MiscCommand18);

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL21pc2MtY29tbWFuZC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxXQUFXLENBQUE7Ozs7Ozs7Ozs7OztlQUVLLE9BQU8sQ0FBQyxNQUFNLENBQUM7O0lBQXhCLEtBQUssWUFBTCxLQUFLOztBQUNaLElBQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQTs7SUFFeEIsV0FBVztZQUFYLFdBQVc7O1dBQVgsV0FBVzswQkFBWCxXQUFXOzsrQkFBWCxXQUFXOzs7ZUFBWCxXQUFXOztXQUNRLGNBQWM7Ozs7U0FEakMsV0FBVztHQUFTLElBQUk7O0FBRzlCLFdBQVcsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUE7O0lBRXJCLElBQUk7WUFBSixJQUFJOztXQUFKLElBQUk7MEJBQUosSUFBSTs7K0JBQUosSUFBSTs7O2VBQUosSUFBSTs7NkJBQ0ssYUFBRztBQUNkLFVBQU0sSUFBSSxHQUFHLE1BQU0sSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUE7QUFDMUMsVUFBSSxJQUFJLEVBQUU7QUFDUixZQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyx1QkFBdUIsRUFBRSxDQUFDLENBQUE7T0FDN0Q7S0FDRjs7O1NBTkcsSUFBSTtHQUFTLFdBQVc7O0FBUTlCLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQTs7SUFFVCxpQkFBaUI7WUFBakIsaUJBQWlCOztXQUFqQixpQkFBaUI7MEJBQWpCLGlCQUFpQjs7K0JBQWpCLGlCQUFpQjs7O2VBQWpCLGlCQUFpQjs7V0FDZCxtQkFBRztBQUNSLFVBQUksQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxVQUFVLEVBQUUsQ0FB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QUFpQjs7K0JBQWpCLGlCQUFpQjs7U0FDckIsUUFBUSxHQUFHLENBQUMsQ0FBQzs7O1NBRFQsaUJBQWlCO0dBQVMsaUJBQWlCOztBQUdqRCxpQkFBaUIsQ0FBQyxRQUFRLEVBQUUsQ0FBQTs7SUFFdEIsT0FBTztZQUFQLE9BQU87O1dBQVAsT0FBTzswQkFBUCxPQUFPOzsrQkFBUCxPQUFPOztTQUNYLFlBQVksR0FBRyxDQUFDOzs7ZUFEWixPQUFPOztXQUdKLG1CQUFHO0FBQ1IsVUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFBO0FBQzdCLFVBQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQTs7QUFFcEQsVUFBSSxLQUFLLEVBQUUsSUFBSSxDQUFDLG1CQUFtQixDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQSxLQUN6QyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQTtLQUM3Qjs7O1NBVEcsT0FBTztHQUFTLFdBQVc7O0FBV2pDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQTs7SUFFWixXQUFXO1lBQVgsV0FBVzs7V0FBWCxXQUFXOzBCQUFYLFdBQVc7OytCQUFYLFdBQVc7OztlQUFYLFdBQVc7O1dBQ1IsbUJBQUc7QUFDUixVQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsb0JBQW9CLEVBQUUsQ0FBQTtLQUMvRDs7O1NBSEcsV0FBVztHQUFTLFdBQVc7O0FBS3JDLFdBQVcsQ0FBQyxRQUFRLEVBQUUsQ0FBQSIsImZpbGUiOiIvVXNlcnMvdGxhbmRhdS9kb3RmaWxlcy8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi9taXNjLWNvbW1hbmQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBiYWJlbFwiXG5cbmNvbnN0IHtSYW5nZX0gPSByZXF1aXJlKFwiYXRvbVwiKVxuY29uc3QgQmFzZSA9IHJlcXVpcmUoXCIuL2Jhc2VcIilcblxuY2xhc3MgTWlzY0NvbW1hbmQgZXh0ZW5kcyBCYXNlIHtcbiAgc3RhdGljIG9wZXJhdGlvbktpbmQgPSBcIm1pc2MtY29tbWFuZFwiXG59XG5NaXNjQ29tbWFuZC5yZWdpc3RlcihmYWxzZSlcblxuY2xhc3MgTWFyayBleHRlbmRzIE1pc2NDb21tYW5kIHtcbiAgYXN5bmMgZXhlY3V0ZSgpIHtcbiAgICBjb25zdCBtYXJrID0gYXdhaXQgdGhpcy5yZWFkQ2hhclByb21pc2VkKClcbiAgICBpZiAobWFyaykge1xuICAgICAgdGhpcy52aW1TdGF0ZS5tYXJrLnNldChtYXJrLCB0aGlzLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCkpXG4gICAgfVxuICB9XG59XG5NYXJrLnJlZ2lzdGVyKClcblxuY2xhc3MgUmV2ZXJzZVNlbGVjdGlvbnMgZXh0ZW5kcyBNaXNjQ29tbWFuZCB7XG4gIGV4ZWN1dGUoKSB7XG4gICAgdGhpcy5zd3JhcC5zZXRSZXZlcnNlZFN0YXRlKHRoaXMuZWRpdG9yLCAhdGhpcy5lZGl0b3IuZ2V0TGFzdFNlbGVjdGlvbigpLmlzUmV2ZXJzZWQoKSlcbiAgICBpZiAodGhpcy5pc01vZGUoXCJ2aXN1YWxcIiwgXCJibG9ja3dpc2VcIikpIHtcbiAgICAgIHRoaXMuZ2V0TGFzdEJsb2Nrd2lzZVNlbGVjdGlvbigpLmF1dG9zY3JvbGwoKVxuICAgIH1cbiAgfVxufVxuUmV2ZXJzZVNlbGVjdGlvbnMucmVnaXN0ZXIoKVxuXG5jbGFzcyBCbG9ja3dpc2VPdGhlckVuZCBleHRlbmRzIFJldmVyc2VTZWxlY3Rpb25zIHtcbiAgZXhlY3V0ZSgpIHtcbiAgICBmb3IgKGNvbnN0IGJsb2Nrd2lzZVNlbGVjdGlvbiBvZiB0aGlzLmdldEJsb2Nrd2lzZVNlbGVjdGlvbnMoKSkge1xuICAgICAgYmxvY2t3aXNlU2VsZWN0aW9uLnJldmVyc2UoKVxuICAgIH1cbiAgICBzdXBlci5leGVjdXRlKClcbiAgfVxufVxuQmxvY2t3aXNlT3RoZXJFbmQucmVnaXN0ZXIoKVxuXG5jbGFzcyBVbmRvIGV4dGVuZHMgTWlzY0NvbW1hbmQge1xuICBzZXRDdXJzb3JQb3NpdGlvbih7bmV3UmFuZ2VzLCBvbGRSYW5nZXMsIHN0cmF0ZWd5fSkge1xuICAgIGNvbnN0IGxhc3RDdXJzb3IgPSB0aGlzLmVkaXRvci5nZXRMYXN0Q3Vyc29yKCkgLy8gVGhpcyBpcyByZXN0b3JlZCBjdXJzb3JcblxuICAgIGNvbnN0IGNoYW5nZWRSYW5nZSA9XG4gICAgICBzdHJhdGVneSA9PT0gXCJzbWFydFwiXG4gICAgICAgID8gdGhpcy51dGlscy5maW5kUmFuZ2VDb250YWluc1BvaW50KG5ld1JhbmdlcywgbGFzdEN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpKVxuICAgICAgICA6IHRoaXMudXRpbHMuc29ydFJhbmdlcyhuZXdSYW5nZXMuY29uY2F0KG9sZFJhbmdlcykpWzBdXG5cbiAgICBpZiAoY2hhbmdlZFJhbmdlKSB7XG4gICAgICBpZiAodGhpcy51dGlscy5pc0xpbmV3aXNlUmFuZ2UoY2hhbmdlZFJhbmdlKSkgdGhpcy51dGlscy5zZXRCdWZmZXJSb3cobGFzdEN1cnNvciwgY2hhbmdlZFJhbmdlLnN0YXJ0LnJvdylcbiAgICAgIGVsc2UgbGFzdEN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihjaGFuZ2VkUmFuZ2Uuc3RhcnQpXG4gICAgfVxuICB9XG5cbiAgbXV0YXRlV2l0aFRyYWNrQ2hhbmdlcygpIHtcbiAgICBjb25zdCBuZXdSYW5nZXMgPSBbXVxuICAgIGNvbnN0IG9sZFJhbmdlcyA9IFtdXG5cbiAgICAvLyBDb2xsZWN0IGNoYW5nZWQgcmFuZ2Ugd2hpbGUgbXV0YXRpbmcgdGV4dC1zdGF0ZSBieSBmbiBjYWxsYmFjay5cbiAgICBjb25zdCBkaXNwb3NhYmxlID0gdGhpcy5lZGl0b3IuZ2V0QnVmZmVyKCkub25EaWRDaGFuZ2UoKHtuZXdSYW5nZSwgb2xkUmFuZ2V9KSA9PiB7XG4gICAgICBpZiAobmV3UmFuZ2UuaXNFbXB0eSgpKSB7XG4gICAgICAgIG9sZFJhbmdlcy5wdXNoKG9sZFJhbmdlKSAvLyBSZW1vdmUgb25seVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbmV3UmFuZ2VzLnB1c2gobmV3UmFuZ2UpXG4gICAgICB9XG4gICAgfSlcblxuICAgIHRoaXMubXV0YXRlKClcbiAgICBkaXNwb3NhYmxlLmRpc3Bvc2UoKVxuICAgIHJldHVybiB7bmV3UmFuZ2VzLCBvbGRSYW5nZXN9XG4gIH1cblxuICBmbGFzaENoYW5nZXMoe25ld1Jhbmdlcywgb2xkUmFuZ2VzfSkge1xuICAgIGNvbnN0IGlzTXVsdGlwbGVTaW5nbGVMaW5lUmFuZ2VzID0gcmFuZ2VzID0+IHJhbmdlcy5sZW5ndGggPiAxICYmIHJhbmdlcy5ldmVyeSh0aGlzLnV0aWxzLmlzU2luZ2xlTGluZVJhbmdlKVxuXG4gICAgaWYgKG5ld1Jhbmdlcy5sZW5ndGggPiAwKSB7XG4gICAgICBpZiAodGhpcy5pc011bHRpcGxlQW5kQWxsUmFuZ2VIYXZlU2FtZUNvbHVtbkFuZENvbnNlY3V0aXZlUm93cyhuZXdSYW5nZXMpKSByZXR1cm5cblxuICAgICAgbmV3UmFuZ2VzID0gbmV3UmFuZ2VzLm1hcChyYW5nZSA9PiB0aGlzLnV0aWxzLmh1bWFuaXplQnVmZmVyUmFuZ2UodGhpcy5lZGl0b3IsIHJhbmdlKSlcbiAgICAgIG5ld1JhbmdlcyA9IHRoaXMuZmlsdGVyTm9uTGVhZGluZ1doaXRlU3BhY2VSYW5nZShuZXdSYW5nZXMpXG5cbiAgICAgIGNvbnN0IHR5cGUgPSBpc011bHRpcGxlU2luZ2xlTGluZVJhbmdlcyhuZXdSYW5nZXMpID8gXCJ1bmRvLXJlZG8tbXVsdGlwbGUtY2hhbmdlc1wiIDogXCJ1bmRvLXJlZG9cIlxuICAgICAgdGhpcy5mbGFzaChuZXdSYW5nZXMsIHt0eXBlfSlcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHRoaXMuaXNNdWx0aXBsZUFuZEFsbFJhbmdlSGF2ZVNhbWVDb2x1bW5BbmRDb25zZWN1dGl2ZVJvd3Mob2xkUmFuZ2VzKSkgcmV0dXJuXG5cbiAgICAgIGlmIChpc011bHRpcGxlU2luZ2xlTGluZVJhbmdlcyhvbGRSYW5nZXMpKSB7XG4gICAgICAgIG9sZFJhbmdlcyA9IHRoaXMuZmlsdGVyTm9uTGVhZGluZ1doaXRlU3BhY2VSYW5nZShvbGRSYW5nZXMpXG4gICAgICAgIHRoaXMuZmxhc2gob2xkUmFuZ2VzLCB7dHlwZTogXCJ1bmRvLXJlZG8tbXVsdGlwbGUtZGVsZXRlXCJ9KVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZpbHRlck5vbkxlYWRpbmdXaGl0ZVNwYWNlUmFuZ2UocmFuZ2VzKSB7XG4gICAgcmV0dXJuIHJhbmdlcy5maWx0ZXIocmFuZ2UgPT4gIXRoaXMudXRpbHMuaXNMZWFkaW5nV2hpdGVTcGFjZVJhbmdlKHRoaXMuZWRpdG9yLCByYW5nZSkpXG4gIH1cblxuICAvLyBbVE9ET10gSW1wcm92ZSBmdXJ0aGVyIGJ5IGNoZWNraW5nIG9sZFRleHQsIG5ld1RleHQ/XG4gIC8vIFtQdXJwb3NlIG9mIHRoaXMgZnVuY3Rpb25dXG4gIC8vIFN1cHByZXNzIGZsYXNoIHdoZW4gdW5kby9yZWRvaW5nIHRvZ2dsZS1jb21tZW50IHdoaWxlIGZsYXNoaW5nIHVuZG8vcmVkbyBvZiBvY2N1cnJlbmNlIG9wZXJhdGlvbi5cbiAgLy8gVGhpcyBodXJpc3RpYyBhcHByb2FjaCBuZXZlciBiZSBwZXJmZWN0LlxuICAvLyBVbHRpbWF0ZWx5IGNhbm5ub3QgZGlzdGluZ3Vpc2ggb2NjdXJyZW5jZSBvcGVyYXRpb24uXG4gIGlzTXVsdGlwbGVBbmRBbGxSYW5nZUhhdmVTYW1lQ29sdW1uQW5kQ29uc2VjdXRpdmVSb3dzKHJhbmdlcykge1xuICAgIGlmIChyYW5nZXMubGVuZ3RoIDw9IDEpIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cblxuICAgIGNvbnN0IHtzdGFydDoge2NvbHVtbjogc3RhcnRDb2x1bW59LCBlbmQ6IHtjb2x1bW46IGVuZENvbHVtbn19ID0gcmFuZ2VzWzBdXG4gICAgbGV0IHByZXZpb3VzUm93XG5cbiAgICBmb3IgKGNvbnN0IHJhbmdlIG9mIHJhbmdlcykge1xuICAgICAgY29uc3Qge3N0YXJ0LCBlbmR9ID0gcmFuZ2VcbiAgICAgIGlmIChzdGFydC5jb2x1bW4gIT09IHN0YXJ0Q29sdW1uIHx8IGVuZC5jb2x1bW4gIT09IGVuZENvbHVtbikgcmV0dXJuIGZhbHNlXG4gICAgICBpZiAocHJldmlvdXNSb3cgIT0gbnVsbCAmJiBwcmV2aW91c1JvdyArIDEgIT09IHN0YXJ0LnJvdykgcmV0dXJuIGZhbHNlXG4gICAgICBwcmV2aW91c1JvdyA9IHN0YXJ0LnJvd1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZVxuICB9XG5cbiAgZmxhc2gocmFuZ2VzLCBvcHRpb25zKSB7XG4gICAgaWYgKG9wdGlvbnMudGltZW91dCA9PSBudWxsKSBvcHRpb25zLnRpbWVvdXQgPSA1MDBcbiAgICB0aGlzLm9uRGlkRmluaXNoT3BlcmF0aW9uKCgpID0+IHRoaXMudmltU3RhdGUuZmxhc2gocmFuZ2VzLCBvcHRpb25zKSlcbiAgfVxuXG4gIGV4ZWN1dGUoKSB7XG4gICAgY29uc3Qge25ld1Jhbmdlcywgb2xkUmFuZ2VzfSA9IHRoaXMubXV0YXRlV2l0aFRyYWNrQ2hhbmdlcygpXG5cbiAgICBmb3IgKGNvbnN0IHNlbGVjdGlvbiBvZiB0aGlzLmVkaXRvci5nZXRTZWxlY3Rpb25zKCkpIHtcbiAgICAgIHNlbGVjdGlvbi5jbGVhcigpXG4gICAgfVxuXG4gICAgaWYgKHRoaXMuZ2V0Q29uZmlnKFwic2V0Q3Vyc29yVG9TdGFydE9mQ2hhbmdlT25VbmRvUmVkb1wiKSkge1xuICAgICAgY29uc3Qgc3RyYXRlZ3kgPSB0aGlzLmdldENvbmZpZyhcInNldEN1cnNvclRvU3RhcnRPZkNoYW5nZU9uVW5kb1JlZG9TdHJhdGVneVwiKVxuICAgICAgdGhpcy5zZXRDdXJzb3JQb3NpdGlvbih7bmV3UmFuZ2VzLCBvbGRSYW5nZXMsIHN0cmF0ZWd5fSlcbiAgICAgIHRoaXMudmltU3RhdGUuY2xlYXJTZWxlY3Rpb25zKClcbiAgICB9XG5cbiAgICBpZiAodGhpcy5nZXRDb25maWcoXCJmbGFzaE9uVW5kb1JlZG9cIikpIHRoaXMuZmxhc2hDaGFuZ2VzKHtuZXdSYW5nZXMsIG9sZFJhbmdlc30pXG4gICAgdGhpcy5hY3RpdmF0ZU1vZGUoXCJub3JtYWxcIilcbiAgfVxuXG4gIG11dGF0ZSgpIHtcbiAgICB0aGlzLmVkaXRvci51bmRvKClcbiAgfVxufVxuVW5kby5yZWdpc3RlcigpXG5cbmNsYXNzIFJlZG8gZXh0ZW5kcyBVbmRvIHtcbiAgbXV0YXRlKCkge1xuICAgIHRoaXMuZWRpdG9yLnJlZG8oKVxuICB9XG59XG5SZWRvLnJlZ2lzdGVyKClcblxuLy8gemNcbmNsYXNzIEZvbGRDdXJyZW50Um93IGV4dGVuZHMgTWlzY0NvbW1hbmQge1xuICBleGVjdXRlKCkge1xuICAgIGZvciAoY29uc3QgcG9pbnQgb2YgdGhpcy5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbnMoKSkge1xuICAgICAgdGhpcy5lZGl0b3IuZm9sZEJ1ZmZlclJvdyhwb2ludC5yb3cpXG4gICAgfVxuICB9XG59XG5Gb2xkQ3VycmVudFJvdy5yZWdpc3RlcigpXG5cbi8vIHpvXG5jbGFzcyBVbmZvbGRDdXJyZW50Um93IGV4dGVuZHMgTWlzY0NvbW1hbmQge1xuICBleGVjdXRlKCkge1xuICAgIGZvciAoY29uc3QgcG9pbnQgb2YgdGhpcy5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbnMoKSkge1xuICAgICAgdGhpcy5lZGl0b3IudW5mb2xkQnVmZmVyUm93KHBvaW50LnJvdylcbiAgICB9XG4gIH1cbn1cblVuZm9sZEN1cnJlbnRSb3cucmVnaXN0ZXIoKVxuXG4vLyB6YVxuY2xhc3MgVG9nZ2xlRm9sZCBleHRlbmRzIE1pc2NDb21tYW5kIHtcbiAgZXhlY3V0ZSgpIHtcbiAgICBmb3IgKGNvbnN0IHBvaW50IG9mIHRoaXMuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb25zKCkpIHtcbiAgICAgIHRoaXMuZWRpdG9yLnRvZ2dsZUZvbGRBdEJ1ZmZlclJvdyhwb2ludC5yb3cpXG4gICAgfVxuICB9XG59XG5Ub2dnbGVGb2xkLnJlZ2lzdGVyKClcblxuLy8gQmFzZSBvZiB6Qywgek8sIHpBXG5jbGFzcyBGb2xkQ3VycmVudFJvd1JlY3Vyc2l2ZWx5QmFzZSBleHRlbmRzIE1pc2NDb21tYW5kIHtcbiAgZWFjaEZvbGRTdGFydFJvdyhmbikge1xuICAgIGZvciAoY29uc3Qge3Jvd30gb2YgdGhpcy5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbnNPcmRlcmVkKCkucmV2ZXJzZSgpKSB7XG4gICAgICBpZiAoIXRoaXMuZWRpdG9yLmlzRm9sZGFibGVBdEJ1ZmZlclJvdyhyb3cpKSBjb250aW51ZVxuXG4gICAgICB0aGlzLnV0aWxzXG4gICAgICAgIC5nZXRGb2xkUm93UmFuZ2VzQ29udGFpbmVkQnlGb2xkU3RhcnRzQXRSb3codGhpcy5lZGl0b3IsIHJvdylcbiAgICAgICAgLm1hcChyb3dSYW5nZSA9PiByb3dSYW5nZVswXSkgLy8gbWFwdCB0byBzdGFydFJvdyBvZiBmb2xkXG4gICAgICAgIC5yZXZlcnNlKCkgLy8gcmV2ZXJzZSB0byBwcm9jZXNzIGVuY29sb3NlZChuZXN0ZWQpIGZvbGQgZmlyc3QgdGhhbiBlbmNvbG9zaW5nIGZvbGQuXG4gICAgICAgIC5mb3JFYWNoKGZuKVxuICAgIH1cbiAgfVxuXG4gIGZvbGRSZWN1cnNpdmVseSgpIHtcbiAgICB0aGlzLmVhY2hGb2xkU3RhcnRSb3cocm93ID0+IHtcbiAgICAgIGlmICghdGhpcy5lZGl0b3IuaXNGb2xkZWRBdEJ1ZmZlclJvdyhyb3cpKSB0aGlzLmVkaXRvci5mb2xkQnVmZmVyUm93KHJvdylcbiAgICB9KVxuICB9XG5cbiAgdW5mb2xkUmVjdXJzaXZlbHkoKSB7XG4gICAgdGhpcy5lYWNoRm9sZFN0YXJ0Um93KHJvdyA9PiB7XG4gICAgICBpZiAodGhpcy5lZGl0b3IuaXNGb2xkZWRBdEJ1ZmZlclJvdyhyb3cpKSB0aGlzLmVkaXRvci51bmZvbGRCdWZmZXJSb3cocm93KVxuICAgIH0pXG4gIH1cbn1cbkZvbGRDdXJyZW50Um93UmVjdXJzaXZlbHlCYXNlLnJlZ2lzdGVyKGZhbHNlKVxuXG4vLyB6Q1xuY2xhc3MgRm9sZEN1cnJlbnRSb3dSZWN1cnNpdmVseSBleHRlbmRzIEZvbGRDdXJyZW50Um93UmVjdXJzaXZlbHlCYXNlIHtcbiAgZXhlY3V0ZSgpIHtcbiAgICB0aGlzLmZvbGRSZWN1cnNpdmVseSgpXG4gIH1cbn1cbkZvbGRDdXJyZW50Um93UmVjdXJzaXZlbHkucmVnaXN0ZXIoKVxuXG4vLyB6T1xuY2xhc3MgVW5mb2xkQ3VycmVudFJvd1JlY3Vyc2l2ZWx5IGV4dGVuZHMgRm9sZEN1cnJlbnRSb3dSZWN1cnNpdmVseUJhc2Uge1xuICBleGVjdXRlKCkge1xuICAgIHRoaXMudW5mb2xkUmVjdXJzaXZlbHkoKVxuICB9XG59XG5VbmZvbGRDdXJyZW50Um93UmVjdXJzaXZlbHkucmVnaXN0ZXIoKVxuXG4vLyB6QVxuY2xhc3MgVG9nZ2xlRm9sZFJlY3Vyc2l2ZWx5IGV4dGVuZHMgRm9sZEN1cnJlbnRSb3dSZWN1cnNpdmVseUJhc2Uge1xuICBleGVjdXRlKCkge1xuICAgIGlmICh0aGlzLmVkaXRvci5pc0ZvbGRlZEF0QnVmZmVyUm93KHRoaXMuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKS5yb3cpKSB7XG4gICAgICB0aGlzLnVuZm9sZFJlY3Vyc2l2ZWx5KClcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5mb2xkUmVjdXJzaXZlbHkoKVxuICAgIH1cbiAgfVxufVxuVG9nZ2xlRm9sZFJlY3Vyc2l2ZWx5LnJlZ2lzdGVyKClcblxuLy8gelJcbmNsYXNzIFVuZm9sZEFsbCBleHRlbmRzIE1pc2NDb21tYW5kIHtcbiAgZXhlY3V0ZSgpIHtcbiAgICB0aGlzLmVkaXRvci51bmZvbGRBbGwoKVxuICB9XG59XG5VbmZvbGRBbGwucmVnaXN0ZXIoKVxuXG4vLyB6TVxuY2xhc3MgRm9sZEFsbCBleHRlbmRzIE1pc2NDb21tYW5kIHtcbiAgZXhlY3V0ZSgpIHtcbiAgICBjb25zdCB7YWxsRm9sZH0gPSB0aGlzLnV0aWxzLmdldEZvbGRJbmZvQnlLaW5kKHRoaXMuZWRpdG9yKVxuICAgIGlmICghYWxsRm9sZCkgcmV0dXJuXG5cbiAgICB0aGlzLmVkaXRvci51bmZvbGRBbGwoKVxuICAgIGZvciAoY29uc3Qge2luZGVudCwgc3RhcnRSb3csIGVuZFJvd30gb2YgYWxsRm9sZC5yb3dSYW5nZXNXaXRoSW5kZW50KSB7XG4gICAgICBpZiAoaW5kZW50IDw9IHRoaXMuZ2V0Q29uZmlnKFwibWF4Rm9sZGFibGVJbmRlbnRMZXZlbFwiKSkge1xuICAgICAgICB0aGlzLmVkaXRvci5mb2xkQnVmZmVyUm93UmFuZ2Uoc3RhcnRSb3csIGVuZFJvdylcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5lZGl0b3Iuc2Nyb2xsVG9DdXJzb3JQb3NpdGlvbih7Y2VudGVyOiB0cnVlfSlcbiAgfVxufVxuRm9sZEFsbC5yZWdpc3RlcigpXG5cbi8vIHpyXG5jbGFzcyBVbmZvbGROZXh0SW5kZW50TGV2ZWwgZXh0ZW5kcyBNaXNjQ29tbWFuZCB7XG4gIGV4ZWN1dGUoKSB7XG4gICAgY29uc3Qge2ZvbGRlZH0gPSB0aGlzLnV0aWxzLmdldEZvbGRJbmZvQnlLaW5kKHRoaXMuZWRpdG9yKVxuICAgIGlmICghZm9sZGVkKSByZXR1cm5cbiAgICBjb25zdCB7bWluSW5kZW50LCByb3dSYW5nZXNXaXRoSW5kZW50fSA9IGZvbGRlZFxuICAgIGNvbnN0IGNvdW50ID0gdGhpcy51dGlscy5saW1pdE51bWJlcih0aGlzLmdldENvdW50KCkgLSAxLCB7bWluOiAwfSlcbiAgICBjb25zdCB0YXJnZXRJbmRlbnRzID0gdGhpcy51dGlscy5nZXRMaXN0KG1pbkluZGVudCwgbWluSW5kZW50ICsgY291bnQpXG4gICAgZm9yIChjb25zdCB7aW5kZW50LCBzdGFydFJvd30gb2Ygcm93UmFuZ2VzV2l0aEluZGVudCkge1xuICAgICAgaWYgKHRhcmdldEluZGVudHMuaW5jbHVkZXMoaW5kZW50KSkge1xuICAgICAgICB0aGlzLmVkaXRvci51bmZvbGRCdWZmZXJSb3coc3RhcnRSb3cpXG4gICAgICB9XG4gICAgfVxuICB9XG59XG5VbmZvbGROZXh0SW5kZW50TGV2ZWwucmVnaXN0ZXIoKVxuXG4vLyB6bVxuY2xhc3MgRm9sZE5leHRJbmRlbnRMZXZlbCBleHRlbmRzIE1pc2NDb21tYW5kIHtcbiAgZXhlY3V0ZSgpIHtcbiAgICBjb25zdCB7dW5mb2xkZWQsIGFsbEZvbGR9ID0gdGhpcy51dGlscy5nZXRGb2xkSW5mb0J5S2luZCh0aGlzLmVkaXRvcilcbiAgICBpZiAoIXVuZm9sZGVkKSByZXR1cm5cbiAgICAvLyBGSVhNRTogV2h5IEkgbmVlZCB1bmZvbGRBbGwoKT8gV2h5IGNhbid0IEkganVzdCBmb2xkIG5vbi1mb2xkZWQtZm9sZCBvbmx5P1xuICAgIC8vIFVubGVzcyB1bmZvbGRBbGwoKSBoZXJlLCBAZWRpdG9yLnVuZm9sZEFsbCgpIGRlbGV0ZSBmb2xkTWFya2VyIGJ1dCBmYWlsXG4gICAgLy8gdG8gcmVuZGVyIHVuZm9sZGVkIHJvd3MgY29ycmVjdGx5LlxuICAgIC8vIEkgYmVsaWV2ZSB0aGlzIGlzIGJ1ZyBvZiB0ZXh0LWJ1ZmZlcidzIG1hcmtlckxheWVyIHdoaWNoIGFzc3VtZSBmb2xkcyBhcmVcbiAgICAvLyBjcmVhdGVkICoqaW4tb3JkZXIqKiBmcm9tIHRvcC1yb3cgdG8gYm90dG9tLXJvdy5cbiAgICB0aGlzLmVkaXRvci51bmZvbGRBbGwoKVxuXG4gICAgY29uc3QgbWF4Rm9sZGFibGUgPSB0aGlzLmdldENvbmZpZyhcIm1heEZvbGRhYmxlSW5kZW50TGV2ZWxcIilcbiAgICBsZXQgZnJvbUxldmVsID0gTWF0aC5taW4odW5mb2xkZWQubWF4SW5kZW50LCBtYXhGb2xkYWJsZSlcbiAgICBjb25zdCBjb3VudCA9IHRoaXMudXRpbHMubGltaXROdW1iZXIodGhpcy5nZXRDb3VudCgpIC0gMSwge21pbjogMH0pXG4gICAgZnJvbUxldmVsID0gdGhpcy51dGlscy5saW1pdE51bWJlcihmcm9tTGV2ZWwgLSBjb3VudCwge21pbjogMH0pXG4gICAgY29uc3QgdGFyZ2V0SW5kZW50cyA9IHRoaXMudXRpbHMuZ2V0TGlzdChmcm9tTGV2ZWwsIG1heEZvbGRhYmxlKVxuICAgIGZvciAoY29uc3Qge2luZGVudCwgc3RhcnRSb3csIGVuZFJvd30gb2YgYWxsRm9sZC5yb3dSYW5nZXNXaXRoSW5kZW50KSB7XG4gICAgICBpZiAodGFyZ2V0SW5kZW50cy5pbmNsdWRlcyhpbmRlbnQpKSB7XG4gICAgICAgIHRoaXMuZWRpdG9yLmZvbGRCdWZmZXJSb3dSYW5nZShzdGFydFJvdywgZW5kUm93KVxuICAgICAgfVxuICAgIH1cbiAgfVxufVxuRm9sZE5leHRJbmRlbnRMZXZlbC5yZWdpc3RlcigpXG5cbmNsYXNzIFJlcGxhY2VNb2RlQmFja3NwYWNlIGV4dGVuZHMgTWlzY0NvbW1hbmQge1xuICBzdGF0aWMgY29tbWFuZFNjb3BlID0gXCJhdG9tLXRleHQtZWRpdG9yLnZpbS1tb2RlLXBsdXMuaW5zZXJ0LW1vZGUucmVwbGFjZVwiXG5cbiAgZXhlY3V0ZSgpIHtcbiAgICBmb3IgKGNvbnN0IHNlbGVjdGlvbiBvZiB0aGlzLmVkaXRvci5nZXRTZWxlY3Rpb25zKCkpIHtcbiAgICAgIC8vIGNoYXIgbWlnaHQgYmUgZW1wdHkuXG4gICAgICBjb25zdCBjaGFyID0gdGhpcy52aW1TdGF0ZS5tb2RlTWFuYWdlci5nZXRSZXBsYWNlZENoYXJGb3JTZWxlY3Rpb24oc2VsZWN0aW9uKVxuICAgICAgaWYgKGNoYXIgIT0gbnVsbCkge1xuICAgICAgICBzZWxlY3Rpb24uc2VsZWN0TGVmdCgpXG4gICAgICAgIGlmICghc2VsZWN0aW9uLmluc2VydFRleHQoY2hhcikuaXNFbXB0eSgpKSBzZWxlY3Rpb24uY3Vyc29yLm1vdmVMZWZ0KClcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblJlcGxhY2VNb2RlQmFja3NwYWNlLnJlZ2lzdGVyKClcblxuLy8gY3RybC1lIHNjcm9sbCBsaW5lcyBkb3dud2FyZHNcbmNsYXNzIE1pbmlTY3JvbGxEb3duIGV4dGVuZHMgTWlzY0NvbW1hbmQge1xuICBkZWZhdWx0Q291bnQgPSB0aGlzLmdldENvbmZpZyhcImRlZmF1bHRTY3JvbGxSb3dzT25NaW5pU2Nyb2xsXCIpXG4gIGRpcmVjdGlvbiA9IFwiZG93blwiXG5cbiAga2VlcEN1cnNvck9uU2NyZWVuKHNjcm9sbFJvd3MpIHtcbiAgICBjb25zdCBjdXJzb3IgPSB0aGlzLmVkaXRvci5nZXRMYXN0Q3Vyc29yKClcbiAgICBjb25zdCByb3cgPSBjdXJzb3IuZ2V0U2NyZWVuUm93KClcbiAgICBjb25zdCBvZmZzZXQgPSAyXG4gICAgY29uc3QgdmFsaWRTY3JlZW5Sb3cgPVxuICAgICAgdGhpcy5kaXJlY3Rpb24gPT09IFwiZG93blwiXG4gICAgICAgID8gdGhpcy51dGlscy5saW1pdE51bWJlcihyb3csIHttaW46IHRoaXMuZWRpdG9yLmdldEZpcnN0VmlzaWJsZVNjcmVlblJvdygpICsgb2Zmc2V0fSlcbiAgICAgICAgOiB0aGlzLnV0aWxzLmxpbWl0TnVtYmVyKHJvdywge21heDogdGhpcy5lZGl0b3IuZ2V0TGFzdFZpc2libGVTY3JlZW5Sb3coKSAtIG9mZnNldH0pXG4gICAgaWYgKHJvdyAhPT0gdmFsaWRTY3JlZW5Sb3cpIHtcbiAgICAgIHRoaXMudXRpbHMuc2V0QnVmZmVyUm93KGN1cnNvciwgdGhpcy5lZGl0b3IuYnVmZmVyUm93Rm9yU2NyZWVuUm93KHZhbGlkU2NyZWVuUm93KSwge2F1dG9zY3JvbGw6IGZhbHNlfSlcbiAgICB9XG4gIH1cblxuICBleGVjdXRlKCkge1xuICAgIGNvbnN0IGFtb3VudE9mU2NyZWVuUm93cyA9IHRoaXMuZGlyZWN0aW9uID09PSBcImRvd25cIiA/IHRoaXMuZ2V0Q291bnQoKSA6IC10aGlzLmdldENvdW50KClcbiAgICBjb25zdCBkdXJhdGlvbiA9IHRoaXMuZ2V0Q29uZmlnKFwic21vb3RoU2Nyb2xsT25NaW5pU2Nyb2xsXCIpID8gdGhpcy5nZXRDb25maWcoXCJzbW9vdGhTY3JvbGxPbk1pbmlTY3JvbGxEdXJhdGlvblwiKSA6IDBcbiAgICB0aGlzLnZpbVN0YXRlLnJlcXVlc3RTY3JvbGwoe2Ftb3VudE9mU2NyZWVuUm93cywgZHVyYXRpb24sIG9uRmluaXNoOiB0aGlzLmtlZXBDdXJzb3JPblNjcmVlbi5iaW5kKHRoaXMpfSlcbiAgfVxufVxuTWluaVNjcm9sbERvd24ucmVnaXN0ZXIoKVxuXG4vLyBjdHJsLXkgc2Nyb2xsIGxpbmVzIHVwd2FyZHNcbmNsYXNzIE1pbmlTY3JvbGxVcCBleHRlbmRzIE1pbmlTY3JvbGxEb3duIHtcbiAgZGlyZWN0aW9uID0gXCJ1cFwiXG59XG5NaW5pU2Nyb2xsVXAucmVnaXN0ZXIoKVxuXG4vLyBSZWRyYXdDdXJzb3JMaW5lQXR7WFhYfSBpbiB2aWV3cG9ydC5cbi8vICstLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tK1xuLy8gfCB3aGVyZSAgICAgICAgfCBubyBtb3ZlIHwgbW92ZSB0byAxc3QgY2hhciB8XG4vLyB8LS0tLS0tLS0tLS0tLS0rLS0tLS0tLS0tKy0tLS0tLS0tLS0tLS0tLS0tLXxcbi8vIHwgdG9wICAgICAgICAgIHwgeiB0ICAgICB8IHogZW50ZXIgICAgICAgICAgfFxuLy8gfCB1cHBlci1taWRkbGUgfCB6IHUgICAgIHwgeiBzcGFjZSAgICAgICAgICB8XG4vLyB8IG1pZGRsZSAgICAgICB8IHogeiAgICAgfCB6IC4gICAgICAgICAgICAgIHxcbi8vIHwgYm90dG9tICAgICAgIHwgeiBiICAgICB8IHogLSAgICAgICAgICAgICAgfFxuLy8gKy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0rXG5jbGFzcyBSZWRyYXdDdXJzb3JMaW5lIGV4dGVuZHMgTWlzY0NvbW1hbmQge1xuICBtb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZSA9IGZhbHNlXG5cbiAgZXhlY3V0ZSgpIHtcbiAgICBjb25zdCBzY3JvbGxUb3AgPSBNYXRoLnJvdW5kKHRoaXMuZ2V0U2Nyb2xsVG9wKCkpXG4gICAgY29uc3Qgb25GaW5pc2ggPSAoKSA9PiB7XG4gICAgICBpZiAodGhpcy5lZGl0b3JFbGVtZW50LmdldFNjcm9sbFRvcCgpICE9PSBzY3JvbGxUb3AgJiYgIXRoaXMuZWRpdG9yLmdldFNjcm9sbFBhc3RFbmQoKSkge1xuICAgICAgICB0aGlzLnJlY29tbWVuZFRvRW5hYmxlU2Nyb2xsUGFzdEVuZCgpXG4gICAgICB9XG4gICAgfVxuICAgIGNvbnN0IGR1cmF0aW9uID0gdGhpcy5nZXRDb25maWcoXCJzbW9vdGhTY3JvbGxPblJlZHJhd0N1cnNvckxpbmVcIilcbiAgICAgID8gdGhpcy5nZXRDb25maWcoXCJzbW9vdGhTY3JvbGxPblJlZHJhd0N1cnNvckxpbmVEdXJhdGlvblwiKVxuICAgICAgOiAwXG4gICAgdGhpcy52aW1TdGF0ZS5yZXF1ZXN0U2Nyb2xsKHtzY3JvbGxUb3AsIGR1cmF0aW9uLCBvbkZpbmlzaH0pXG4gICAgaWYgKHRoaXMubW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmUpIHRoaXMuZWRpdG9yLm1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lKClcbiAgfVxuXG4gIGdldFNjcm9sbFRvcCgpIHtcbiAgICBjb25zdCB7dG9wfSA9IHRoaXMuZWRpdG9yRWxlbWVudC5waXhlbFBvc2l0aW9uRm9yU2NyZWVuUG9zaXRpb24odGhpcy5lZGl0b3IuZ2V0Q3Vyc29yU2NyZWVuUG9zaXRpb24oKSlcbiAgICBjb25zdCBlZGl0b3JIZWlnaHQgPSB0aGlzLmVkaXRvckVsZW1lbnQuZ2V0SGVpZ2h0KClcbiAgICBjb25zdCBsaW5lSGVpZ2h0SW5QaXhlbCA9IHRoaXMuZWRpdG9yLmdldExpbmVIZWlnaHRJblBpeGVscygpXG4gICAgcmV0dXJuIHRoaXMudXRpbHMubGltaXROdW1iZXIodG9wIC0gZWRpdG9ySGVpZ2h0ICogdGhpcy5jb2VmZmljaWVudCwge1xuICAgICAgbWluOiB0b3AgLSBlZGl0b3JIZWlnaHQgKyBsaW5lSGVpZ2h0SW5QaXhlbCAqIDMsXG4gICAgICBtYXg6IHRvcCAtIGxpbmVIZWlnaHRJblBpeGVsICogMixcbiAgICB9KVxuICB9XG5cbiAgcmVjb21tZW5kVG9FbmFibGVTY3JvbGxQYXN0RW5kKCkge1xuICAgIGNvbnN0IG1lc3NhZ2UgPSBbXG4gICAgICBcInZpbS1tb2RlLXBsdXNcIixcbiAgICAgIFwiLSBGYWlsZWQgdG8gc2Nyb2xsLiBUbyBzdWNjZXNzZnVsbHkgc2Nyb2xsLCBgZWRpdG9yLnNjcm9sbFBhc3RFbmRgIG5lZWQgdG8gYmUgZW5hYmxlZC5cIixcbiAgICAgICctIFlvdSBjYW4gZG8gaXQgZnJvbSBgXCJTZXR0aW5nc1wiID4gXCJFZGl0b3JcIiA+IFwiU2Nyb2xsIFBhc3QgRW5kXCJgLicsXG4gICAgICBcIi0gT3IgKipkbyB5b3UgYWxsb3cgdm1wIGVuYWJsZSBpdCBmb3IgeW91IG5vdz8qKlwiLFxuICAgIF0uam9pbihcIlxcblwiKVxuXG4gICAgY29uc3Qgbm90aWZpY2F0aW9uID0gYXRvbS5ub3RpZmljYXRpb25zLmFkZEluZm8obWVzc2FnZSwge1xuICAgICAgZGlzbWlzc2FibGU6IHRydWUsXG4gICAgICBidXR0b25zOiBbXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiBcIk5vIHRoYW5rcy5cIixcbiAgICAgICAgICBvbkRpZENsaWNrOiAoKSA9PiBub3RpZmljYXRpb24uZGlzbWlzcygpLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogXCJPSy4gRW5hYmxlIGl0IG5vdyEhXCIsXG4gICAgICAgICAgb25EaWRDbGljazogKCkgPT4ge1xuICAgICAgICAgICAgYXRvbS5jb25maWcuc2V0KGBlZGl0b3Iuc2Nyb2xsUGFzdEVuZGAsIHRydWUpXG4gICAgICAgICAgICBub3RpZmljYXRpb24uZGlzbWlzcygpXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgfSlcbiAgfVxufVxuUmVkcmF3Q3Vyc29yTGluZS5yZWdpc3RlcihmYWxzZSlcblxuLy8gdG9wOiB6dFxuY2xhc3MgUmVkcmF3Q3Vyc29yTGluZUF0VG9wIGV4dGVuZHMgUmVkcmF3Q3Vyc29yTGluZSB7XG4gIGNvZWZmaWNpZW50ID0gMFxufVxuUmVkcmF3Q3Vyc29yTGluZUF0VG9wLnJlZ2lzdGVyKClcblxuLy8gdG9wOiB6IGVudGVyXG5jbGFzcyBSZWRyYXdDdXJzb3JMaW5lQXRUb3BBbmRNb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZSBleHRlbmRzIFJlZHJhd0N1cnNvckxpbmUge1xuICBjb2VmZmljaWVudCA9IDBcbiAgbW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmUgPSB0cnVlXG59XG5SZWRyYXdDdXJzb3JMaW5lQXRUb3BBbmRNb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZS5yZWdpc3RlcigpXG5cbi8vIHVwcGVyLW1pZGRsZTogenVcbmNsYXNzIFJlZHJhd0N1cnNvckxpbmVBdFVwcGVyTWlkZGxlIGV4dGVuZHMgUmVkcmF3Q3Vyc29yTGluZSB7XG4gIGNvZWZmaWNpZW50ID0gMC4yNVxufVxuUmVkcmF3Q3Vyc29yTGluZUF0VXBwZXJNaWRkbGUucmVnaXN0ZXIoKVxuXG4vLyB1cHBlci1taWRkbGU6IHogc3BhY2VcbmNsYXNzIFJlZHJhd0N1cnNvckxpbmVBdFVwcGVyTWlkZGxlQW5kTW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmUgZXh0ZW5kcyBSZWRyYXdDdXJzb3JMaW5lIHtcbiAgY29lZmZpY2llbnQgPSAwLjI1XG4gIG1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lID0gdHJ1ZVxufVxuUmVkcmF3Q3Vyc29yTGluZUF0VXBwZXJNaWRkbGVBbmRNb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZS5yZWdpc3RlcigpXG5cbi8vIG1pZGRsZTogenpcbmNsYXNzIFJlZHJhd0N1cnNvckxpbmVBdE1pZGRsZSBleHRlbmRzIFJlZHJhd0N1cnNvckxpbmUge1xuICBjb2VmZmljaWVudCA9IDAuNVxufVxuUmVkcmF3Q3Vyc29yTGluZUF0TWlkZGxlLnJlZ2lzdGVyKClcblxuLy8gbWlkZGxlOiB6LlxuY2xhc3MgUmVkcmF3Q3Vyc29yTGluZUF0TWlkZGxlQW5kTW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmUgZXh0ZW5kcyBSZWRyYXdDdXJzb3JMaW5lIHtcbiAgY29lZmZpY2llbnQgPSAwLjVcbiAgbW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmUgPSB0cnVlXG59XG5SZWRyYXdDdXJzb3JMaW5lQXRNaWRkbGVBbmRNb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZS5yZWdpc3RlcigpXG5cbi8vIGJvdHRvbTogemJcbmNsYXNzIFJlZHJhd0N1cnNvckxpbmVBdEJvdHRvbSBleHRlbmRzIFJlZHJhd0N1cnNvckxpbmUge1xuICBjb2VmZmljaWVudCA9IDFcbn1cblJlZHJhd0N1cnNvckxpbmVBdEJvdHRvbS5yZWdpc3RlcigpXG5cbi8vIGJvdHRvbTogei1cbmNsYXNzIFJlZHJhd0N1cnNvckxpbmVBdEJvdHRvbUFuZE1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lIGV4dGVuZHMgUmVkcmF3Q3Vyc29yTGluZSB7XG4gIGNvZWZmaWNpZW50ID0gMVxuICBtb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZSA9IHRydWVcbn1cblJlZHJhd0N1cnNvckxpbmVBdEJvdHRvbUFuZE1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lLnJlZ2lzdGVyKClcblxuLy8gSG9yaXpvbnRhbCBTY3JvbGwgd2l0aG91dCBjaGFuZ2luZyBjdXJzb3IgcG9zaXRpb25cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIHpzXG5jbGFzcyBTY3JvbGxDdXJzb3JUb0xlZnQgZXh0ZW5kcyBNaXNjQ29tbWFuZCB7XG4gIHdoaWNoID0gXCJsZWZ0XCJcbiAgZXhlY3V0ZSgpIHtcbiAgICBjb25zdCB0cmFuc2xhdGlvbiA9IHRoaXMud2hpY2ggPT09IFwibGVmdFwiID8gWzAsIDBdIDogWzAsIDFdXG4gICAgY29uc3Qgc2NyZWVuUG9zaXRpb24gPSB0aGlzLmVkaXRvci5nZXRDdXJzb3JTY3JlZW5Qb3NpdGlvbigpLnRyYW5zbGF0ZSh0cmFuc2xhdGlvbilcbiAgICBjb25zdCBwaXhlbCA9IHRoaXMuZWRpdG9yRWxlbWVudC5waXhlbFBvc2l0aW9uRm9yU2NyZWVuUG9zaXRpb24oc2NyZWVuUG9zaXRpb24pXG4gICAgaWYgKHRoaXMud2hpY2ggPT09IFwibGVmdFwiKSB7XG4gICAgICB0aGlzLmVkaXRvckVsZW1lbnQuc2V0U2Nyb2xsTGVmdChwaXhlbC5sZWZ0KVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmVkaXRvckVsZW1lbnQuc2V0U2Nyb2xsUmlnaHQocGl4ZWwubGVmdClcbiAgICAgIHRoaXMuZWRpdG9yLmNvbXBvbmVudC51cGRhdGVTeW5jKCkgLy8gRklYTUU6IFRoaXMgaXMgbmVjZXNzYXJ5IG1heWJlIGJlY2F1c2Ugb2YgYnVnIG9mIGF0b20tY29yZS5cbiAgICB9XG4gIH1cbn1cblNjcm9sbEN1cnNvclRvTGVmdC5yZWdpc3RlcigpXG5cbi8vIHplXG5jbGFzcyBTY3JvbGxDdXJzb3JUb1JpZ2h0IGV4dGVuZHMgU2Nyb2xsQ3Vyc29yVG9MZWZ0IHtcbiAgd2hpY2ggPSBcInJpZ2h0XCJcbn1cblNjcm9sbEN1cnNvclRvUmlnaHQucmVnaXN0ZXIoKVxuXG4vLyBpbnNlcnQtbW9kZSBzcGVjaWZpYyBjb21tYW5kc1xuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgSW5zZXJ0TW9kZSBleHRlbmRzIE1pc2NDb21tYW5kIHt9XG5JbnNlcnRNb2RlLmNvbW1hbmRTY29wZSA9IFwiYXRvbS10ZXh0LWVkaXRvci52aW0tbW9kZS1wbHVzLmluc2VydC1tb2RlXCJcblxuY2xhc3MgQWN0aXZhdGVOb3JtYWxNb2RlT25jZSBleHRlbmRzIEluc2VydE1vZGUge1xuICBleGVjdXRlKCkge1xuICAgIGNvbnN0IGN1cnNvcnNUb01vdmVSaWdodCA9IHRoaXMuZWRpdG9yLmdldEN1cnNvcnMoKS5maWx0ZXIoY3Vyc29yID0+ICFjdXJzb3IuaXNBdEJlZ2lubmluZ09mTGluZSgpKVxuICAgIHRoaXMudmltU3RhdGUuYWN0aXZhdGUoXCJub3JtYWxcIilcbiAgICBmb3IgKGNvbnN0IGN1cnNvciBvZiBjdXJzb3JzVG9Nb3ZlUmlnaHQpIHtcbiAgICAgIHRoaXMudXRpbHMubW92ZUN1cnNvclJpZ2h0KGN1cnNvcilcbiAgICB9XG5cbiAgICBsZXQgZGlzcG9zYWJsZSA9IGF0b20uY29tbWFuZHMub25EaWREaXNwYXRjaChldmVudCA9PiB7XG4gICAgICBpZiAoZXZlbnQudHlwZSA9PT0gdGhpcy5nZXRDb21tYW5kTmFtZSgpKSByZXR1cm5cblxuICAgICAgZGlzcG9zYWJsZS5kaXNwb3NlKClcbiAgICAgIGRpc3Bvc2FibGUgPSBudWxsXG4gICAgICB0aGlzLnZpbVN0YXRlLmFjdGl2YXRlKFwiaW5zZXJ0XCIpXG4gICAgfSlcbiAgfVxufVxuQWN0aXZhdGVOb3JtYWxNb2RlT25jZS5yZWdpc3RlcigpXG5cbmNsYXNzIEluc2VydFJlZ2lzdGVyIGV4dGVuZHMgSW5zZXJ0TW9kZSB7XG4gIGFzeW5jIGV4ZWN1dGUoKSB7XG4gICAgY29uc3QgaW5wdXQgPSBhd2FpdCB0aGlzLnJlYWRDaGFyUHJvbWlzZWQoKVxuICAgIGlmIChpbnB1dCkge1xuICAgICAgdGhpcy5lZGl0b3IudHJhbnNhY3QoKCkgPT4ge1xuICAgICAgICBmb3IgKGNvbnN0IHNlbGVjdGlvbiBvZiB0aGlzLmVkaXRvci5nZXRTZWxlY3Rpb25zKCkpIHtcbiAgICAgICAgICBjb25zdCB0ZXh0ID0gdGhpcy52aW1TdGF0ZS5yZWdpc3Rlci5nZXRUZXh0KGlucHV0LCBzZWxlY3Rpb24pXG4gICAgICAgICAgc2VsZWN0aW9uLmluc2VydFRleHQodGV4dClcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9XG4gIH1cbn1cbkluc2VydFJlZ2lzdGVyLnJlZ2lzdGVyKClcblxuY2xhc3MgSW5zZXJ0TGFzdEluc2VydGVkIGV4dGVuZHMgSW5zZXJ0TW9kZSB7XG4gIGV4ZWN1dGUoKSB7XG4gICAgY29uc3QgdGV4dCA9IHRoaXMudmltU3RhdGUucmVnaXN0ZXIuZ2V0VGV4dChcIi5cIilcbiAgICB0aGlzLmVkaXRvci5pbnNlcnRUZXh0KHRleHQpXG4gIH1cbn1cbkluc2VydExhc3RJbnNlcnRlZC5yZWdpc3RlcigpXG5cbmNsYXNzIENvcHlGcm9tTGluZUFib3ZlIGV4dGVuZHMgSW5zZXJ0TW9kZSB7XG4gIHJvd0RlbHRhID0gLTFcblxuICBleGVjdXRlKCkge1xuICAgIGNvbnN0IHRyYW5zbGF0aW9uID0gW3RoaXMucm93RGVsdGEsIDBdXG4gICAgdGhpcy5lZGl0b3IudHJhbnNhY3QoKCkgPT4ge1xuICAgICAgZm9yIChsZXQgc2VsZWN0aW9uIG9mIHRoaXMuZWRpdG9yLmdldFNlbGVjdGlvbnMoKSkge1xuICAgICAgICBjb25zdCBwb2ludCA9IHNlbGVjdGlvbi5jdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKS50cmFuc2xhdGUodHJhbnNsYXRpb24pXG4gICAgICAgIGlmIChwb2ludC5yb3cgPCAwKSBjb250aW51ZVxuXG4gICAgICAgIGNvbnN0IHJhbmdlID0gUmFuZ2UuZnJvbVBvaW50V2l0aERlbHRhKHBvaW50LCAwLCAxKVxuICAgICAgICBjb25zdCB0ZXh0ID0gdGhpcy5lZGl0b3IuZ2V0VGV4dEluQnVmZmVyUmFuZ2UocmFuZ2UpXG4gICAgICAgIGlmICh0ZXh0KSBzZWxlY3Rpb24uaW5zZXJ0VGV4dCh0ZXh0KVxuICAgICAgfVxuICAgIH0pXG4gIH1cbn1cbkNvcHlGcm9tTGluZUFib3ZlLnJlZ2lzdGVyKClcblxuY2xhc3MgQ29weUZyb21MaW5lQmVsb3cgZXh0ZW5kcyBDb3B5RnJvbUxpbmVBYm92ZSB7XG4gIHJvd0RlbHRhID0gKzFcbn1cbkNvcHlGcm9tTGluZUJlbG93LnJlZ2lzdGVyKClcblxuY2xhc3MgTmV4dFRhYiBleHRlbmRzIE1pc2NDb21tYW5kIHtcbiAgZGVmYXVsdENvdW50ID0gMFxuXG4gIGV4ZWN1dGUoKSB7XG4gICAgY29uc3QgY291bnQgPSB0aGlzLmdldENvdW50KClcbiAgICBjb25zdCBwYW5lID0gYXRvbS53b3Jrc3BhY2UucGFuZUZvckl0ZW0odGhpcy5lZGl0b3IpXG5cbiAgICBpZiAoY291bnQpIHBhbmUuYWN0aXZhdGVJdGVtQXRJbmRleChjb3VudCAtIDEpXG4gICAgZWxzZSBwYW5lLmFjdGl2YXRlTmV4dEl0ZW0oKVxuICB9XG59XG5OZXh0VGFiLnJlZ2lzdGVyKClcblxuY2xhc3MgUHJldmlvdXNUYWIgZXh0ZW5kcyBNaXNjQ29tbWFuZCB7XG4gIGV4ZWN1dGUoKSB7XG4gICAgYXRvbS53b3Jrc3BhY2UucGFuZUZvckl0ZW0odGhpcy5lZGl0b3IpLmFjdGl2YXRlUHJldmlvdXNJdGVtKClcbiAgfVxufVxuUHJldmlvdXNUYWIucmVnaXN0ZXIoKVxuIl19