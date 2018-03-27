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
    key: "execute",
    value: function execute() {
      var newRanges = [];
      var oldRanges = [];

      var disposable = this.editor.getBuffer().onDidChangeText(function (event) {
        for (var _ref2 of event.changes) {
          var newRange = _ref2.newRange;
          var oldRange = _ref2.oldRange;

          if (newRange.isEmpty()) {
            oldRanges.push(oldRange); // Remove only
          } else {
              newRanges.push(newRange);
            }
        }
      });

      if (this.name === "Undo") {
        this.editor.undo();
      } else {
        this.editor.redo();
      }

      disposable.dispose();

      for (var selection of this.editor.getSelections()) {
        selection.clear();
      }

      if (this.getConfig("setCursorToStartOfChangeOnUndoRedo")) {
        var strategy = this.getConfig("setCursorToStartOfChangeOnUndoRedoStrategy");
        this.setCursorPosition({ newRanges: newRanges, oldRanges: oldRanges, strategy: strategy });
        this.vimState.clearSelections();
      }

      if (this.getConfig("flashOnUndoRedo")) {
        if (newRanges.length) {
          this.flashChanges(newRanges, "changes");
        } else {
          this.flashChanges(oldRanges, "deletes");
        }
      }
      this.activateMode("normal");
    }
  }, {
    key: "setCursorPosition",
    value: function setCursorPosition(_ref3) {
      var newRanges = _ref3.newRanges;
      var oldRanges = _ref3.oldRanges;
      var strategy = _ref3.strategy;

      var lastCursor = this.editor.getLastCursor(); // This is restored cursor

      var changedRange = strategy === "smart" ? this.utils.findRangeContainsPoint(newRanges, lastCursor.getBufferPosition()) : this.utils.sortRanges(newRanges.concat(oldRanges))[0];

      if (changedRange) {
        if (this.utils.isLinewiseRange(changedRange)) this.utils.setBufferRow(lastCursor, changedRange.start.row);else lastCursor.setBufferPosition(changedRange.start);
      }
    }
  }, {
    key: "flashChanges",
    value: function flashChanges(ranges, mutationType) {
      var _this = this;

      var isMultipleSingleLineRanges = function isMultipleSingleLineRanges(ranges) {
        return ranges.length > 1 && ranges.every(_this.utils.isSingleLineRange);
      };
      var humanizeNewLineForBufferRange = this.utils.humanizeNewLineForBufferRange.bind(null, this.editor);
      var isNotLeadingWhiteSpaceRange = this.utils.isNotLeadingWhiteSpaceRange.bind(null, this.editor);
      if (!this.utils.isMultipleAndAllRangeHaveSameColumnAndConsecutiveRows(ranges)) {
        ranges = ranges.map(humanizeNewLineForBufferRange);
        var type = isMultipleSingleLineRanges(ranges) ? "undo-redo-multiple-" + mutationType : "undo-redo";
        if (!(type === "undo-redo" && mutationType === "deletes")) {
          this.vimState.flash(ranges.filter(isNotLeadingWhiteSpaceRange), { type: type });
        }
      }
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
      var _this2 = this;

      this.eachFoldStartRow(function (row) {
        if (!_this2.editor.isFoldedAtBufferRow(row)) _this2.editor.foldBufferRow(row);
      });
    }
  }, {
    key: "unfoldRecursively",
    value: function unfoldRecursively() {
      var _this3 = this;

      this.eachFoldStartRow(function (row) {
        if (_this3.editor.isFoldedAtBufferRow(row)) _this3.editor.unfoldBufferRow(row);
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
    value: function keepCursorOnScreen() {
      var cursor = this.editor.getLastCursor();
      var row = cursor.getScreenRow();
      var offset = 2;
      var validRow = this.direction === "down" ? this.utils.limitNumber(row, { min: this.editor.getFirstVisibleScreenRow() + offset }) : this.utils.limitNumber(row, { max: this.editor.getLastVisibleScreenRow() - offset });
      if (row !== validRow) {
        this.utils.setBufferRow(cursor, this.editor.bufferRowForScreenRow(validRow), { autoscroll: false });
      }
    }
  }, {
    key: "execute",
    value: function execute() {
      var _this4 = this;

      this.vimState.requestScroll({
        amountOfScreenRows: this.direction === "down" ? this.getCount() : -this.getCount(),
        duration: this.getSmoothScrollDuation("MiniScroll"),
        onFinish: function onFinish() {
          return _this4.keepCursorOnScreen();
        }
      });
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
      var _this5 = this;

      var scrollTop = Math.round(this.getScrollTop());
      var onFinish = function onFinish() {
        if (_this5.editorElement.getScrollTop() !== scrollTop && !_this5.editor.getScrollPastEnd()) {
          _this5.recommendToEnableScrollPastEnd();
        }
      };
      var duration = this.getSmoothScrollDuation("RedrawCursorLine");
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

  _createClass(InsertMode, null, [{
    key: "commandScope",
    value: "atom-text-editor.vim-mode-plus.insert-mode",
    enumerable: true
  }]);

  return InsertMode;
})(MiscCommand);

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
        if (event.type !== _this6.getCommandName()) {
          disposable.dispose();
          _this6.vimState.activate("insert");
        }
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
      var _this7 = this;

      var input = yield this.readCharPromised();
      if (input) {
        this.editor.transact(function () {
          for (var selection of _this7.editor.getSelections()) {
            selection.insertText(_this7.vimState.register.getText(input, selection));
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
      this.editor.insertText(this.vimState.register.getText("."));
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
          if (point.row >= 0) {
            var range = Range.fromPointWithDelta(point, 0, 1);
            var text = _this8.editor.getTextInBufferRange(range);
            if (text) selection.insertText(text);
          }
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL21pc2MtY29tbWFuZC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxXQUFXLENBQUE7Ozs7Ozs7Ozs7OztlQUVLLE9BQU8sQ0FBQyxNQUFNLENBQUM7O0lBQXhCLEtBQUssWUFBTCxLQUFLOztBQUNaLElBQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQTs7SUFFeEIsV0FBVztZQUFYLFdBQVc7O1dBQVgsV0FBVzswQkFBWCxXQUFXOzsrQkFBWCxXQUFXOzs7ZUFBWCxXQUFXOztXQUNRLGNBQWM7Ozs7U0FEakMsV0FBVztHQUFTLElBQUk7O0FBRzlCLFdBQVcsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUE7O0lBRXJCLElBQUk7WUFBSixJQUFJOztXQUFKLElBQUk7MEJBQUosSUFBSTs7K0JBQUosSUFBSTs7O2VBQUosSUFBSTs7NkJBQ0ssYUFBRztBQUNkLFVBQU0sSUFBSSxHQUFHLE1BQU0sSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUE7QUFDMUMsVUFBSSxJQUFJLEVBQUU7QUFDUixZQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyx1QkFBdUIsRUFBRSxDQUFDLENBQUE7T0FDN0Q7S0FDRjs7O1NBTkcsSUFBSTtHQUFTLFdBQVc7O0FBUTlCLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQTs7SUFFVCxpQkFBaUI7WUFBakIsaUJBQWlCOztXQUFqQixpQkFBaUI7MEJBQWpCLGlCQUFpQjs7K0JBQWpCLGlCQUFpQjs7O2VBQWpCLGlCQUFpQjs7V0FDZCxtQkFBRztBQUNSLFVBQUksQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxVQUFVLEVBQUUsQ0FB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QVc7O1dBQVgsV0FBVzswQkFBWCxXQUFXOzsrQkFBWCxXQUFXOzs7ZUFBWCxXQUFXOztXQUNSLG1CQUFHO0FBQ1IsVUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLG9CQUFvQixFQUFFLENBQUE7S0FDL0Q7OztTQUhHLFdBQVc7R0FBUyxXQUFXOztBQUtyQyxXQUFXLENBQUMsUUFBUSxFQUFFLENBQUEiLCJmaWxlIjoiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvbWlzYy1jb21tYW5kLmpzIiwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2UgYmFiZWxcIlxuXG5jb25zdCB7UmFuZ2V9ID0gcmVxdWlyZShcImF0b21cIilcbmNvbnN0IEJhc2UgPSByZXF1aXJlKFwiLi9iYXNlXCIpXG5cbmNsYXNzIE1pc2NDb21tYW5kIGV4dGVuZHMgQmFzZSB7XG4gIHN0YXRpYyBvcGVyYXRpb25LaW5kID0gXCJtaXNjLWNvbW1hbmRcIlxufVxuTWlzY0NvbW1hbmQucmVnaXN0ZXIoZmFsc2UpXG5cbmNsYXNzIE1hcmsgZXh0ZW5kcyBNaXNjQ29tbWFuZCB7XG4gIGFzeW5jIGV4ZWN1dGUoKSB7XG4gICAgY29uc3QgbWFyayA9IGF3YWl0IHRoaXMucmVhZENoYXJQcm9taXNlZCgpXG4gICAgaWYgKG1hcmspIHtcbiAgICAgIHRoaXMudmltU3RhdGUubWFyay5zZXQobWFyaywgdGhpcy5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpKVxuICAgIH1cbiAgfVxufVxuTWFyay5yZWdpc3RlcigpXG5cbmNsYXNzIFJldmVyc2VTZWxlY3Rpb25zIGV4dGVuZHMgTWlzY0NvbW1hbmQge1xuICBleGVjdXRlKCkge1xuICAgIHRoaXMuc3dyYXAuc2V0UmV2ZXJzZWRTdGF0ZSh0aGlzLmVkaXRvciwgIXRoaXMuZWRpdG9yLmdldExhc3RTZWxlY3Rpb24oKS5pc1JldmVyc2VkKCkpXG4gICAgaWYgKHRoaXMuaXNNb2RlKFwidmlzdWFsXCIsIFwiYmxvY2t3aXNlXCIpKSB7XG4gICAgICB0aGlzLmdldExhc3RCbG9ja3dpc2VTZWxlY3Rpb24oKS5hdXRvc2Nyb2xsKClcbiAgICB9XG4gIH1cbn1cblJldmVyc2VTZWxlY3Rpb25zLnJlZ2lzdGVyKClcblxuY2xhc3MgQmxvY2t3aXNlT3RoZXJFbmQgZXh0ZW5kcyBSZXZlcnNlU2VsZWN0aW9ucyB7XG4gIGV4ZWN1dGUoKSB7XG4gICAgZm9yIChjb25zdCBibG9ja3dpc2VTZWxlY3Rpb24gb2YgdGhpcy5nZXRCbG9ja3dpc2VTZWxlY3Rpb25zKCkpIHtcbiAgICAgIGJsb2Nrd2lzZVNlbGVjdGlvbi5yZXZlcnNlKClcbiAgICB9XG4gICAgc3VwZXIuZXhlY3V0ZSgpXG4gIH1cbn1cbkJsb2Nrd2lzZU90aGVyRW5kLnJlZ2lzdGVyKClcblxuY2xhc3MgVW5kbyBleHRlbmRzIE1pc2NDb21tYW5kIHtcbiAgZXhlY3V0ZSgpIHtcbiAgICBjb25zdCBuZXdSYW5nZXMgPSBbXVxuICAgIGNvbnN0IG9sZFJhbmdlcyA9IFtdXG5cbiAgICBjb25zdCBkaXNwb3NhYmxlID0gdGhpcy5lZGl0b3IuZ2V0QnVmZmVyKCkub25EaWRDaGFuZ2VUZXh0KGV2ZW50ID0+IHtcbiAgICAgIGZvciAoY29uc3Qge25ld1JhbmdlLCBvbGRSYW5nZX0gb2YgZXZlbnQuY2hhbmdlcykge1xuICAgICAgICBpZiAobmV3UmFuZ2UuaXNFbXB0eSgpKSB7XG4gICAgICAgICAgb2xkUmFuZ2VzLnB1c2gob2xkUmFuZ2UpIC8vIFJlbW92ZSBvbmx5XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbmV3UmFuZ2VzLnB1c2gobmV3UmFuZ2UpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuXG4gICAgaWYgKHRoaXMubmFtZSA9PT0gXCJVbmRvXCIpIHtcbiAgICAgIHRoaXMuZWRpdG9yLnVuZG8oKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmVkaXRvci5yZWRvKClcbiAgICB9XG5cbiAgICBkaXNwb3NhYmxlLmRpc3Bvc2UoKVxuXG4gICAgZm9yIChjb25zdCBzZWxlY3Rpb24gb2YgdGhpcy5lZGl0b3IuZ2V0U2VsZWN0aW9ucygpKSB7XG4gICAgICBzZWxlY3Rpb24uY2xlYXIoKVxuICAgIH1cblxuICAgIGlmICh0aGlzLmdldENvbmZpZyhcInNldEN1cnNvclRvU3RhcnRPZkNoYW5nZU9uVW5kb1JlZG9cIikpIHtcbiAgICAgIGNvbnN0IHN0cmF0ZWd5ID0gdGhpcy5nZXRDb25maWcoXCJzZXRDdXJzb3JUb1N0YXJ0T2ZDaGFuZ2VPblVuZG9SZWRvU3RyYXRlZ3lcIilcbiAgICAgIHRoaXMuc2V0Q3Vyc29yUG9zaXRpb24oe25ld1Jhbmdlcywgb2xkUmFuZ2VzLCBzdHJhdGVneX0pXG4gICAgICB0aGlzLnZpbVN0YXRlLmNsZWFyU2VsZWN0aW9ucygpXG4gICAgfVxuXG4gICAgaWYgKHRoaXMuZ2V0Q29uZmlnKFwiZmxhc2hPblVuZG9SZWRvXCIpKSB7XG4gICAgICBpZiAobmV3UmFuZ2VzLmxlbmd0aCkge1xuICAgICAgICB0aGlzLmZsYXNoQ2hhbmdlcyhuZXdSYW5nZXMsIFwiY2hhbmdlc1wiKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5mbGFzaENoYW5nZXMob2xkUmFuZ2VzLCBcImRlbGV0ZXNcIilcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5hY3RpdmF0ZU1vZGUoXCJub3JtYWxcIilcbiAgfVxuXG4gIHNldEN1cnNvclBvc2l0aW9uKHtuZXdSYW5nZXMsIG9sZFJhbmdlcywgc3RyYXRlZ3l9KSB7XG4gICAgY29uc3QgbGFzdEN1cnNvciA9IHRoaXMuZWRpdG9yLmdldExhc3RDdXJzb3IoKSAvLyBUaGlzIGlzIHJlc3RvcmVkIGN1cnNvclxuXG4gICAgY29uc3QgY2hhbmdlZFJhbmdlID1cbiAgICAgIHN0cmF0ZWd5ID09PSBcInNtYXJ0XCJcbiAgICAgICAgPyB0aGlzLnV0aWxzLmZpbmRSYW5nZUNvbnRhaW5zUG9pbnQobmV3UmFuZ2VzLCBsYXN0Q3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKCkpXG4gICAgICAgIDogdGhpcy51dGlscy5zb3J0UmFuZ2VzKG5ld1Jhbmdlcy5jb25jYXQob2xkUmFuZ2VzKSlbMF1cblxuICAgIGlmIChjaGFuZ2VkUmFuZ2UpIHtcbiAgICAgIGlmICh0aGlzLnV0aWxzLmlzTGluZXdpc2VSYW5nZShjaGFuZ2VkUmFuZ2UpKSB0aGlzLnV0aWxzLnNldEJ1ZmZlclJvdyhsYXN0Q3Vyc29yLCBjaGFuZ2VkUmFuZ2Uuc3RhcnQucm93KVxuICAgICAgZWxzZSBsYXN0Q3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKGNoYW5nZWRSYW5nZS5zdGFydClcbiAgICB9XG4gIH1cblxuICBmbGFzaENoYW5nZXMocmFuZ2VzLCBtdXRhdGlvblR5cGUpIHtcbiAgICBjb25zdCBpc011bHRpcGxlU2luZ2xlTGluZVJhbmdlcyA9IHJhbmdlcyA9PiByYW5nZXMubGVuZ3RoID4gMSAmJiByYW5nZXMuZXZlcnkodGhpcy51dGlscy5pc1NpbmdsZUxpbmVSYW5nZSlcbiAgICBjb25zdCBodW1hbml6ZU5ld0xpbmVGb3JCdWZmZXJSYW5nZSA9IHRoaXMudXRpbHMuaHVtYW5pemVOZXdMaW5lRm9yQnVmZmVyUmFuZ2UuYmluZChudWxsLCB0aGlzLmVkaXRvcilcbiAgICBjb25zdCBpc05vdExlYWRpbmdXaGl0ZVNwYWNlUmFuZ2UgPSB0aGlzLnV0aWxzLmlzTm90TGVhZGluZ1doaXRlU3BhY2VSYW5nZS5iaW5kKG51bGwsIHRoaXMuZWRpdG9yKVxuICAgIGlmICghdGhpcy51dGlscy5pc011bHRpcGxlQW5kQWxsUmFuZ2VIYXZlU2FtZUNvbHVtbkFuZENvbnNlY3V0aXZlUm93cyhyYW5nZXMpKSB7XG4gICAgICByYW5nZXMgPSByYW5nZXMubWFwKGh1bWFuaXplTmV3TGluZUZvckJ1ZmZlclJhbmdlKVxuICAgICAgY29uc3QgdHlwZSA9IGlzTXVsdGlwbGVTaW5nbGVMaW5lUmFuZ2VzKHJhbmdlcykgPyBgdW5kby1yZWRvLW11bHRpcGxlLSR7bXV0YXRpb25UeXBlfWAgOiBcInVuZG8tcmVkb1wiXG4gICAgICBpZiAoISh0eXBlID09PSBcInVuZG8tcmVkb1wiICYmIG11dGF0aW9uVHlwZSA9PT0gXCJkZWxldGVzXCIpKSB7XG4gICAgICAgIHRoaXMudmltU3RhdGUuZmxhc2gocmFuZ2VzLmZpbHRlcihpc05vdExlYWRpbmdXaGl0ZVNwYWNlUmFuZ2UpLCB7dHlwZX0pXG4gICAgICB9XG4gICAgfVxuICB9XG59XG5VbmRvLnJlZ2lzdGVyKClcblxuY2xhc3MgUmVkbyBleHRlbmRzIFVuZG8ge31cblJlZG8ucmVnaXN0ZXIoKVxuXG4vLyB6Y1xuY2xhc3MgRm9sZEN1cnJlbnRSb3cgZXh0ZW5kcyBNaXNjQ29tbWFuZCB7XG4gIGV4ZWN1dGUoKSB7XG4gICAgZm9yIChjb25zdCBwb2ludCBvZiB0aGlzLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9ucygpKSB7XG4gICAgICB0aGlzLmVkaXRvci5mb2xkQnVmZmVyUm93KHBvaW50LnJvdylcbiAgICB9XG4gIH1cbn1cbkZvbGRDdXJyZW50Um93LnJlZ2lzdGVyKClcblxuLy8gem9cbmNsYXNzIFVuZm9sZEN1cnJlbnRSb3cgZXh0ZW5kcyBNaXNjQ29tbWFuZCB7XG4gIGV4ZWN1dGUoKSB7XG4gICAgZm9yIChjb25zdCBwb2ludCBvZiB0aGlzLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9ucygpKSB7XG4gICAgICB0aGlzLmVkaXRvci51bmZvbGRCdWZmZXJSb3cocG9pbnQucm93KVxuICAgIH1cbiAgfVxufVxuVW5mb2xkQ3VycmVudFJvdy5yZWdpc3RlcigpXG5cbi8vIHphXG5jbGFzcyBUb2dnbGVGb2xkIGV4dGVuZHMgTWlzY0NvbW1hbmQge1xuICBleGVjdXRlKCkge1xuICAgIGZvciAoY29uc3QgcG9pbnQgb2YgdGhpcy5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbnMoKSkge1xuICAgICAgdGhpcy5lZGl0b3IudG9nZ2xlRm9sZEF0QnVmZmVyUm93KHBvaW50LnJvdylcbiAgICB9XG4gIH1cbn1cblRvZ2dsZUZvbGQucmVnaXN0ZXIoKVxuXG4vLyBCYXNlIG9mIHpDLCB6TywgekFcbmNsYXNzIEZvbGRDdXJyZW50Um93UmVjdXJzaXZlbHlCYXNlIGV4dGVuZHMgTWlzY0NvbW1hbmQge1xuICBlYWNoRm9sZFN0YXJ0Um93KGZuKSB7XG4gICAgZm9yIChjb25zdCB7cm93fSBvZiB0aGlzLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uc09yZGVyZWQoKS5yZXZlcnNlKCkpIHtcbiAgICAgIGlmICghdGhpcy5lZGl0b3IuaXNGb2xkYWJsZUF0QnVmZmVyUm93KHJvdykpIGNvbnRpbnVlXG5cbiAgICAgIHRoaXMudXRpbHNcbiAgICAgICAgLmdldEZvbGRSb3dSYW5nZXNDb250YWluZWRCeUZvbGRTdGFydHNBdFJvdyh0aGlzLmVkaXRvciwgcm93KVxuICAgICAgICAubWFwKHJvd1JhbmdlID0+IHJvd1JhbmdlWzBdKSAvLyBtYXB0IHRvIHN0YXJ0Um93IG9mIGZvbGRcbiAgICAgICAgLnJldmVyc2UoKSAvLyByZXZlcnNlIHRvIHByb2Nlc3MgZW5jb2xvc2VkKG5lc3RlZCkgZm9sZCBmaXJzdCB0aGFuIGVuY29sb3NpbmcgZm9sZC5cbiAgICAgICAgLmZvckVhY2goZm4pXG4gICAgfVxuICB9XG5cbiAgZm9sZFJlY3Vyc2l2ZWx5KCkge1xuICAgIHRoaXMuZWFjaEZvbGRTdGFydFJvdyhyb3cgPT4ge1xuICAgICAgaWYgKCF0aGlzLmVkaXRvci5pc0ZvbGRlZEF0QnVmZmVyUm93KHJvdykpIHRoaXMuZWRpdG9yLmZvbGRCdWZmZXJSb3cocm93KVxuICAgIH0pXG4gIH1cblxuICB1bmZvbGRSZWN1cnNpdmVseSgpIHtcbiAgICB0aGlzLmVhY2hGb2xkU3RhcnRSb3cocm93ID0+IHtcbiAgICAgIGlmICh0aGlzLmVkaXRvci5pc0ZvbGRlZEF0QnVmZmVyUm93KHJvdykpIHRoaXMuZWRpdG9yLnVuZm9sZEJ1ZmZlclJvdyhyb3cpXG4gICAgfSlcbiAgfVxufVxuRm9sZEN1cnJlbnRSb3dSZWN1cnNpdmVseUJhc2UucmVnaXN0ZXIoZmFsc2UpXG5cbi8vIHpDXG5jbGFzcyBGb2xkQ3VycmVudFJvd1JlY3Vyc2l2ZWx5IGV4dGVuZHMgRm9sZEN1cnJlbnRSb3dSZWN1cnNpdmVseUJhc2Uge1xuICBleGVjdXRlKCkge1xuICAgIHRoaXMuZm9sZFJlY3Vyc2l2ZWx5KClcbiAgfVxufVxuRm9sZEN1cnJlbnRSb3dSZWN1cnNpdmVseS5yZWdpc3RlcigpXG5cbi8vIHpPXG5jbGFzcyBVbmZvbGRDdXJyZW50Um93UmVjdXJzaXZlbHkgZXh0ZW5kcyBGb2xkQ3VycmVudFJvd1JlY3Vyc2l2ZWx5QmFzZSB7XG4gIGV4ZWN1dGUoKSB7XG4gICAgdGhpcy51bmZvbGRSZWN1cnNpdmVseSgpXG4gIH1cbn1cblVuZm9sZEN1cnJlbnRSb3dSZWN1cnNpdmVseS5yZWdpc3RlcigpXG5cbi8vIHpBXG5jbGFzcyBUb2dnbGVGb2xkUmVjdXJzaXZlbHkgZXh0ZW5kcyBGb2xkQ3VycmVudFJvd1JlY3Vyc2l2ZWx5QmFzZSB7XG4gIGV4ZWN1dGUoKSB7XG4gICAgaWYgKHRoaXMuZWRpdG9yLmlzRm9sZGVkQXRCdWZmZXJSb3codGhpcy5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpLnJvdykpIHtcbiAgICAgIHRoaXMudW5mb2xkUmVjdXJzaXZlbHkoKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmZvbGRSZWN1cnNpdmVseSgpXG4gICAgfVxuICB9XG59XG5Ub2dnbGVGb2xkUmVjdXJzaXZlbHkucmVnaXN0ZXIoKVxuXG4vLyB6UlxuY2xhc3MgVW5mb2xkQWxsIGV4dGVuZHMgTWlzY0NvbW1hbmQge1xuICBleGVjdXRlKCkge1xuICAgIHRoaXMuZWRpdG9yLnVuZm9sZEFsbCgpXG4gIH1cbn1cblVuZm9sZEFsbC5yZWdpc3RlcigpXG5cbi8vIHpNXG5jbGFzcyBGb2xkQWxsIGV4dGVuZHMgTWlzY0NvbW1hbmQge1xuICBleGVjdXRlKCkge1xuICAgIGNvbnN0IHthbGxGb2xkfSA9IHRoaXMudXRpbHMuZ2V0Rm9sZEluZm9CeUtpbmQodGhpcy5lZGl0b3IpXG4gICAgaWYgKCFhbGxGb2xkKSByZXR1cm5cblxuICAgIHRoaXMuZWRpdG9yLnVuZm9sZEFsbCgpXG4gICAgZm9yIChjb25zdCB7aW5kZW50LCBzdGFydFJvdywgZW5kUm93fSBvZiBhbGxGb2xkLnJvd1Jhbmdlc1dpdGhJbmRlbnQpIHtcbiAgICAgIGlmIChpbmRlbnQgPD0gdGhpcy5nZXRDb25maWcoXCJtYXhGb2xkYWJsZUluZGVudExldmVsXCIpKSB7XG4gICAgICAgIHRoaXMuZWRpdG9yLmZvbGRCdWZmZXJSb3dSYW5nZShzdGFydFJvdywgZW5kUm93KVxuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLmVkaXRvci5zY3JvbGxUb0N1cnNvclBvc2l0aW9uKHtjZW50ZXI6IHRydWV9KVxuICB9XG59XG5Gb2xkQWxsLnJlZ2lzdGVyKClcblxuLy8genJcbmNsYXNzIFVuZm9sZE5leHRJbmRlbnRMZXZlbCBleHRlbmRzIE1pc2NDb21tYW5kIHtcbiAgZXhlY3V0ZSgpIHtcbiAgICBjb25zdCB7Zm9sZGVkfSA9IHRoaXMudXRpbHMuZ2V0Rm9sZEluZm9CeUtpbmQodGhpcy5lZGl0b3IpXG4gICAgaWYgKCFmb2xkZWQpIHJldHVyblxuICAgIGNvbnN0IHttaW5JbmRlbnQsIHJvd1Jhbmdlc1dpdGhJbmRlbnR9ID0gZm9sZGVkXG4gICAgY29uc3QgY291bnQgPSB0aGlzLnV0aWxzLmxpbWl0TnVtYmVyKHRoaXMuZ2V0Q291bnQoKSAtIDEsIHttaW46IDB9KVxuICAgIGNvbnN0IHRhcmdldEluZGVudHMgPSB0aGlzLnV0aWxzLmdldExpc3QobWluSW5kZW50LCBtaW5JbmRlbnQgKyBjb3VudClcbiAgICBmb3IgKGNvbnN0IHtpbmRlbnQsIHN0YXJ0Um93fSBvZiByb3dSYW5nZXNXaXRoSW5kZW50KSB7XG4gICAgICBpZiAodGFyZ2V0SW5kZW50cy5pbmNsdWRlcyhpbmRlbnQpKSB7XG4gICAgICAgIHRoaXMuZWRpdG9yLnVuZm9sZEJ1ZmZlclJvdyhzdGFydFJvdylcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblVuZm9sZE5leHRJbmRlbnRMZXZlbC5yZWdpc3RlcigpXG5cbi8vIHptXG5jbGFzcyBGb2xkTmV4dEluZGVudExldmVsIGV4dGVuZHMgTWlzY0NvbW1hbmQge1xuICBleGVjdXRlKCkge1xuICAgIGNvbnN0IHt1bmZvbGRlZCwgYWxsRm9sZH0gPSB0aGlzLnV0aWxzLmdldEZvbGRJbmZvQnlLaW5kKHRoaXMuZWRpdG9yKVxuICAgIGlmICghdW5mb2xkZWQpIHJldHVyblxuICAgIC8vIEZJWE1FOiBXaHkgSSBuZWVkIHVuZm9sZEFsbCgpPyBXaHkgY2FuJ3QgSSBqdXN0IGZvbGQgbm9uLWZvbGRlZC1mb2xkIG9ubHk/XG4gICAgLy8gVW5sZXNzIHVuZm9sZEFsbCgpIGhlcmUsIEBlZGl0b3IudW5mb2xkQWxsKCkgZGVsZXRlIGZvbGRNYXJrZXIgYnV0IGZhaWxcbiAgICAvLyB0byByZW5kZXIgdW5mb2xkZWQgcm93cyBjb3JyZWN0bHkuXG4gICAgLy8gSSBiZWxpZXZlIHRoaXMgaXMgYnVnIG9mIHRleHQtYnVmZmVyJ3MgbWFya2VyTGF5ZXIgd2hpY2ggYXNzdW1lIGZvbGRzIGFyZVxuICAgIC8vIGNyZWF0ZWQgKippbi1vcmRlcioqIGZyb20gdG9wLXJvdyB0byBib3R0b20tcm93LlxuICAgIHRoaXMuZWRpdG9yLnVuZm9sZEFsbCgpXG5cbiAgICBjb25zdCBtYXhGb2xkYWJsZSA9IHRoaXMuZ2V0Q29uZmlnKFwibWF4Rm9sZGFibGVJbmRlbnRMZXZlbFwiKVxuICAgIGxldCBmcm9tTGV2ZWwgPSBNYXRoLm1pbih1bmZvbGRlZC5tYXhJbmRlbnQsIG1heEZvbGRhYmxlKVxuICAgIGNvbnN0IGNvdW50ID0gdGhpcy51dGlscy5saW1pdE51bWJlcih0aGlzLmdldENvdW50KCkgLSAxLCB7bWluOiAwfSlcbiAgICBmcm9tTGV2ZWwgPSB0aGlzLnV0aWxzLmxpbWl0TnVtYmVyKGZyb21MZXZlbCAtIGNvdW50LCB7bWluOiAwfSlcbiAgICBjb25zdCB0YXJnZXRJbmRlbnRzID0gdGhpcy51dGlscy5nZXRMaXN0KGZyb21MZXZlbCwgbWF4Rm9sZGFibGUpXG4gICAgZm9yIChjb25zdCB7aW5kZW50LCBzdGFydFJvdywgZW5kUm93fSBvZiBhbGxGb2xkLnJvd1Jhbmdlc1dpdGhJbmRlbnQpIHtcbiAgICAgIGlmICh0YXJnZXRJbmRlbnRzLmluY2x1ZGVzKGluZGVudCkpIHtcbiAgICAgICAgdGhpcy5lZGl0b3IuZm9sZEJ1ZmZlclJvd1JhbmdlKHN0YXJ0Um93LCBlbmRSb3cpXG4gICAgICB9XG4gICAgfVxuICB9XG59XG5Gb2xkTmV4dEluZGVudExldmVsLnJlZ2lzdGVyKClcblxuY2xhc3MgUmVwbGFjZU1vZGVCYWNrc3BhY2UgZXh0ZW5kcyBNaXNjQ29tbWFuZCB7XG4gIHN0YXRpYyBjb21tYW5kU2NvcGUgPSBcImF0b20tdGV4dC1lZGl0b3IudmltLW1vZGUtcGx1cy5pbnNlcnQtbW9kZS5yZXBsYWNlXCJcblxuICBleGVjdXRlKCkge1xuICAgIGZvciAoY29uc3Qgc2VsZWN0aW9uIG9mIHRoaXMuZWRpdG9yLmdldFNlbGVjdGlvbnMoKSkge1xuICAgICAgLy8gY2hhciBtaWdodCBiZSBlbXB0eS5cbiAgICAgIGNvbnN0IGNoYXIgPSB0aGlzLnZpbVN0YXRlLm1vZGVNYW5hZ2VyLmdldFJlcGxhY2VkQ2hhckZvclNlbGVjdGlvbihzZWxlY3Rpb24pXG4gICAgICBpZiAoY2hhciAhPSBudWxsKSB7XG4gICAgICAgIHNlbGVjdGlvbi5zZWxlY3RMZWZ0KClcbiAgICAgICAgaWYgKCFzZWxlY3Rpb24uaW5zZXJ0VGV4dChjaGFyKS5pc0VtcHR5KCkpIHNlbGVjdGlvbi5jdXJzb3IubW92ZUxlZnQoKVxuICAgICAgfVxuICAgIH1cbiAgfVxufVxuUmVwbGFjZU1vZGVCYWNrc3BhY2UucmVnaXN0ZXIoKVxuXG4vLyBjdHJsLWUgc2Nyb2xsIGxpbmVzIGRvd253YXJkc1xuY2xhc3MgTWluaVNjcm9sbERvd24gZXh0ZW5kcyBNaXNjQ29tbWFuZCB7XG4gIGRlZmF1bHRDb3VudCA9IHRoaXMuZ2V0Q29uZmlnKFwiZGVmYXVsdFNjcm9sbFJvd3NPbk1pbmlTY3JvbGxcIilcbiAgZGlyZWN0aW9uID0gXCJkb3duXCJcblxuICBrZWVwQ3Vyc29yT25TY3JlZW4oKSB7XG4gICAgY29uc3QgY3Vyc29yID0gdGhpcy5lZGl0b3IuZ2V0TGFzdEN1cnNvcigpXG4gICAgY29uc3Qgcm93ID0gY3Vyc29yLmdldFNjcmVlblJvdygpXG4gICAgY29uc3Qgb2Zmc2V0ID0gMlxuICAgIGNvbnN0IHZhbGlkUm93ID1cbiAgICAgIHRoaXMuZGlyZWN0aW9uID09PSBcImRvd25cIlxuICAgICAgICA/IHRoaXMudXRpbHMubGltaXROdW1iZXIocm93LCB7bWluOiB0aGlzLmVkaXRvci5nZXRGaXJzdFZpc2libGVTY3JlZW5Sb3coKSArIG9mZnNldH0pXG4gICAgICAgIDogdGhpcy51dGlscy5saW1pdE51bWJlcihyb3csIHttYXg6IHRoaXMuZWRpdG9yLmdldExhc3RWaXNpYmxlU2NyZWVuUm93KCkgLSBvZmZzZXR9KVxuICAgIGlmIChyb3cgIT09IHZhbGlkUm93KSB7XG4gICAgICB0aGlzLnV0aWxzLnNldEJ1ZmZlclJvdyhjdXJzb3IsIHRoaXMuZWRpdG9yLmJ1ZmZlclJvd0ZvclNjcmVlblJvdyh2YWxpZFJvdyksIHthdXRvc2Nyb2xsOiBmYWxzZX0pXG4gICAgfVxuICB9XG5cbiAgZXhlY3V0ZSgpIHtcbiAgICB0aGlzLnZpbVN0YXRlLnJlcXVlc3RTY3JvbGwoe1xuICAgICAgYW1vdW50T2ZTY3JlZW5Sb3dzOiB0aGlzLmRpcmVjdGlvbiA9PT0gXCJkb3duXCIgPyB0aGlzLmdldENvdW50KCkgOiAtdGhpcy5nZXRDb3VudCgpLFxuICAgICAgZHVyYXRpb246IHRoaXMuZ2V0U21vb3RoU2Nyb2xsRHVhdGlvbihcIk1pbmlTY3JvbGxcIiksXG4gICAgICBvbkZpbmlzaDogKCkgPT4gdGhpcy5rZWVwQ3Vyc29yT25TY3JlZW4oKSxcbiAgICB9KVxuICB9XG59XG5NaW5pU2Nyb2xsRG93bi5yZWdpc3RlcigpXG5cbi8vIGN0cmwteSBzY3JvbGwgbGluZXMgdXB3YXJkc1xuY2xhc3MgTWluaVNjcm9sbFVwIGV4dGVuZHMgTWluaVNjcm9sbERvd24ge1xuICBkaXJlY3Rpb24gPSBcInVwXCJcbn1cbk1pbmlTY3JvbGxVcC5yZWdpc3RlcigpXG5cbi8vIFJlZHJhd0N1cnNvckxpbmVBdHtYWFh9IGluIHZpZXdwb3J0LlxuLy8gKy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0rXG4vLyB8IHdoZXJlICAgICAgICB8IG5vIG1vdmUgfCBtb3ZlIHRvIDFzdCBjaGFyIHxcbi8vIHwtLS0tLS0tLS0tLS0tLSstLS0tLS0tLS0rLS0tLS0tLS0tLS0tLS0tLS0tfFxuLy8gfCB0b3AgICAgICAgICAgfCB6IHQgICAgIHwgeiBlbnRlciAgICAgICAgICB8XG4vLyB8IHVwcGVyLW1pZGRsZSB8IHogdSAgICAgfCB6IHNwYWNlICAgICAgICAgIHxcbi8vIHwgbWlkZGxlICAgICAgIHwgeiB6ICAgICB8IHogLiAgICAgICAgICAgICAgfFxuLy8gfCBib3R0b20gICAgICAgfCB6IGIgICAgIHwgeiAtICAgICAgICAgICAgICB8XG4vLyArLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLStcbmNsYXNzIFJlZHJhd0N1cnNvckxpbmUgZXh0ZW5kcyBNaXNjQ29tbWFuZCB7XG4gIG1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lID0gZmFsc2VcblxuICBleGVjdXRlKCkge1xuICAgIGNvbnN0IHNjcm9sbFRvcCA9IE1hdGgucm91bmQodGhpcy5nZXRTY3JvbGxUb3AoKSlcbiAgICBjb25zdCBvbkZpbmlzaCA9ICgpID0+IHtcbiAgICAgIGlmICh0aGlzLmVkaXRvckVsZW1lbnQuZ2V0U2Nyb2xsVG9wKCkgIT09IHNjcm9sbFRvcCAmJiAhdGhpcy5lZGl0b3IuZ2V0U2Nyb2xsUGFzdEVuZCgpKSB7XG4gICAgICAgIHRoaXMucmVjb21tZW5kVG9FbmFibGVTY3JvbGxQYXN0RW5kKClcbiAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgZHVyYXRpb24gPSB0aGlzLmdldFNtb290aFNjcm9sbER1YXRpb24oXCJSZWRyYXdDdXJzb3JMaW5lXCIpXG4gICAgdGhpcy52aW1TdGF0ZS5yZXF1ZXN0U2Nyb2xsKHtzY3JvbGxUb3AsIGR1cmF0aW9uLCBvbkZpbmlzaH0pXG4gICAgaWYgKHRoaXMubW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmUpIHRoaXMuZWRpdG9yLm1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lKClcbiAgfVxuXG4gIGdldFNjcm9sbFRvcCgpIHtcbiAgICBjb25zdCB7dG9wfSA9IHRoaXMuZWRpdG9yRWxlbWVudC5waXhlbFBvc2l0aW9uRm9yU2NyZWVuUG9zaXRpb24odGhpcy5lZGl0b3IuZ2V0Q3Vyc29yU2NyZWVuUG9zaXRpb24oKSlcbiAgICBjb25zdCBlZGl0b3JIZWlnaHQgPSB0aGlzLmVkaXRvckVsZW1lbnQuZ2V0SGVpZ2h0KClcbiAgICBjb25zdCBsaW5lSGVpZ2h0SW5QaXhlbCA9IHRoaXMuZWRpdG9yLmdldExpbmVIZWlnaHRJblBpeGVscygpXG4gICAgcmV0dXJuIHRoaXMudXRpbHMubGltaXROdW1iZXIodG9wIC0gZWRpdG9ySGVpZ2h0ICogdGhpcy5jb2VmZmljaWVudCwge1xuICAgICAgbWluOiB0b3AgLSBlZGl0b3JIZWlnaHQgKyBsaW5lSGVpZ2h0SW5QaXhlbCAqIDMsXG4gICAgICBtYXg6IHRvcCAtIGxpbmVIZWlnaHRJblBpeGVsICogMixcbiAgICB9KVxuICB9XG5cbiAgcmVjb21tZW5kVG9FbmFibGVTY3JvbGxQYXN0RW5kKCkge1xuICAgIGNvbnN0IG1lc3NhZ2UgPSBbXG4gICAgICBcInZpbS1tb2RlLXBsdXNcIixcbiAgICAgIFwiLSBGYWlsZWQgdG8gc2Nyb2xsLiBUbyBzdWNjZXNzZnVsbHkgc2Nyb2xsLCBgZWRpdG9yLnNjcm9sbFBhc3RFbmRgIG5lZWQgdG8gYmUgZW5hYmxlZC5cIixcbiAgICAgICctIFlvdSBjYW4gZG8gaXQgZnJvbSBgXCJTZXR0aW5nc1wiID4gXCJFZGl0b3JcIiA+IFwiU2Nyb2xsIFBhc3QgRW5kXCJgLicsXG4gICAgICBcIi0gT3IgKipkbyB5b3UgYWxsb3cgdm1wIGVuYWJsZSBpdCBmb3IgeW91IG5vdz8qKlwiLFxuICAgIF0uam9pbihcIlxcblwiKVxuXG4gICAgY29uc3Qgbm90aWZpY2F0aW9uID0gYXRvbS5ub3RpZmljYXRpb25zLmFkZEluZm8obWVzc2FnZSwge1xuICAgICAgZGlzbWlzc2FibGU6IHRydWUsXG4gICAgICBidXR0b25zOiBbXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiBcIk5vIHRoYW5rcy5cIixcbiAgICAgICAgICBvbkRpZENsaWNrOiAoKSA9PiBub3RpZmljYXRpb24uZGlzbWlzcygpLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogXCJPSy4gRW5hYmxlIGl0IG5vdyEhXCIsXG4gICAgICAgICAgb25EaWRDbGljazogKCkgPT4ge1xuICAgICAgICAgICAgYXRvbS5jb25maWcuc2V0KGBlZGl0b3Iuc2Nyb2xsUGFzdEVuZGAsIHRydWUpXG4gICAgICAgICAgICBub3RpZmljYXRpb24uZGlzbWlzcygpXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgfSlcbiAgfVxufVxuUmVkcmF3Q3Vyc29yTGluZS5yZWdpc3RlcihmYWxzZSlcblxuLy8gdG9wOiB6dFxuY2xhc3MgUmVkcmF3Q3Vyc29yTGluZUF0VG9wIGV4dGVuZHMgUmVkcmF3Q3Vyc29yTGluZSB7XG4gIGNvZWZmaWNpZW50ID0gMFxufVxuUmVkcmF3Q3Vyc29yTGluZUF0VG9wLnJlZ2lzdGVyKClcblxuLy8gdG9wOiB6IGVudGVyXG5jbGFzcyBSZWRyYXdDdXJzb3JMaW5lQXRUb3BBbmRNb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZSBleHRlbmRzIFJlZHJhd0N1cnNvckxpbmUge1xuICBjb2VmZmljaWVudCA9IDBcbiAgbW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmUgPSB0cnVlXG59XG5SZWRyYXdDdXJzb3JMaW5lQXRUb3BBbmRNb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZS5yZWdpc3RlcigpXG5cbi8vIHVwcGVyLW1pZGRsZTogenVcbmNsYXNzIFJlZHJhd0N1cnNvckxpbmVBdFVwcGVyTWlkZGxlIGV4dGVuZHMgUmVkcmF3Q3Vyc29yTGluZSB7XG4gIGNvZWZmaWNpZW50ID0gMC4yNVxufVxuUmVkcmF3Q3Vyc29yTGluZUF0VXBwZXJNaWRkbGUucmVnaXN0ZXIoKVxuXG4vLyB1cHBlci1taWRkbGU6IHogc3BhY2VcbmNsYXNzIFJlZHJhd0N1cnNvckxpbmVBdFVwcGVyTWlkZGxlQW5kTW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmUgZXh0ZW5kcyBSZWRyYXdDdXJzb3JMaW5lIHtcbiAgY29lZmZpY2llbnQgPSAwLjI1XG4gIG1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lID0gdHJ1ZVxufVxuUmVkcmF3Q3Vyc29yTGluZUF0VXBwZXJNaWRkbGVBbmRNb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZS5yZWdpc3RlcigpXG5cbi8vIG1pZGRsZTogenpcbmNsYXNzIFJlZHJhd0N1cnNvckxpbmVBdE1pZGRsZSBleHRlbmRzIFJlZHJhd0N1cnNvckxpbmUge1xuICBjb2VmZmljaWVudCA9IDAuNVxufVxuUmVkcmF3Q3Vyc29yTGluZUF0TWlkZGxlLnJlZ2lzdGVyKClcblxuLy8gbWlkZGxlOiB6LlxuY2xhc3MgUmVkcmF3Q3Vyc29yTGluZUF0TWlkZGxlQW5kTW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmUgZXh0ZW5kcyBSZWRyYXdDdXJzb3JMaW5lIHtcbiAgY29lZmZpY2llbnQgPSAwLjVcbiAgbW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmUgPSB0cnVlXG59XG5SZWRyYXdDdXJzb3JMaW5lQXRNaWRkbGVBbmRNb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZS5yZWdpc3RlcigpXG5cbi8vIGJvdHRvbTogemJcbmNsYXNzIFJlZHJhd0N1cnNvckxpbmVBdEJvdHRvbSBleHRlbmRzIFJlZHJhd0N1cnNvckxpbmUge1xuICBjb2VmZmljaWVudCA9IDFcbn1cblJlZHJhd0N1cnNvckxpbmVBdEJvdHRvbS5yZWdpc3RlcigpXG5cbi8vIGJvdHRvbTogei1cbmNsYXNzIFJlZHJhd0N1cnNvckxpbmVBdEJvdHRvbUFuZE1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lIGV4dGVuZHMgUmVkcmF3Q3Vyc29yTGluZSB7XG4gIGNvZWZmaWNpZW50ID0gMVxuICBtb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZSA9IHRydWVcbn1cblJlZHJhd0N1cnNvckxpbmVBdEJvdHRvbUFuZE1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lLnJlZ2lzdGVyKClcblxuLy8gSG9yaXpvbnRhbCBTY3JvbGwgd2l0aG91dCBjaGFuZ2luZyBjdXJzb3IgcG9zaXRpb25cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIHpzXG5jbGFzcyBTY3JvbGxDdXJzb3JUb0xlZnQgZXh0ZW5kcyBNaXNjQ29tbWFuZCB7XG4gIHdoaWNoID0gXCJsZWZ0XCJcbiAgZXhlY3V0ZSgpIHtcbiAgICBjb25zdCB0cmFuc2xhdGlvbiA9IHRoaXMud2hpY2ggPT09IFwibGVmdFwiID8gWzAsIDBdIDogWzAsIDFdXG4gICAgY29uc3Qgc2NyZWVuUG9zaXRpb24gPSB0aGlzLmVkaXRvci5nZXRDdXJzb3JTY3JlZW5Qb3NpdGlvbigpLnRyYW5zbGF0ZSh0cmFuc2xhdGlvbilcbiAgICBjb25zdCBwaXhlbCA9IHRoaXMuZWRpdG9yRWxlbWVudC5waXhlbFBvc2l0aW9uRm9yU2NyZWVuUG9zaXRpb24oc2NyZWVuUG9zaXRpb24pXG4gICAgaWYgKHRoaXMud2hpY2ggPT09IFwibGVmdFwiKSB7XG4gICAgICB0aGlzLmVkaXRvckVsZW1lbnQuc2V0U2Nyb2xsTGVmdChwaXhlbC5sZWZ0KVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmVkaXRvckVsZW1lbnQuc2V0U2Nyb2xsUmlnaHQocGl4ZWwubGVmdClcbiAgICAgIHRoaXMuZWRpdG9yLmNvbXBvbmVudC51cGRhdGVTeW5jKCkgLy8gRklYTUU6IFRoaXMgaXMgbmVjZXNzYXJ5IG1heWJlIGJlY2F1c2Ugb2YgYnVnIG9mIGF0b20tY29yZS5cbiAgICB9XG4gIH1cbn1cblNjcm9sbEN1cnNvclRvTGVmdC5yZWdpc3RlcigpXG5cbi8vIHplXG5jbGFzcyBTY3JvbGxDdXJzb3JUb1JpZ2h0IGV4dGVuZHMgU2Nyb2xsQ3Vyc29yVG9MZWZ0IHtcbiAgd2hpY2ggPSBcInJpZ2h0XCJcbn1cblNjcm9sbEN1cnNvclRvUmlnaHQucmVnaXN0ZXIoKVxuXG4vLyBpbnNlcnQtbW9kZSBzcGVjaWZpYyBjb21tYW5kc1xuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgSW5zZXJ0TW9kZSBleHRlbmRzIE1pc2NDb21tYW5kIHtcbiAgc3RhdGljIGNvbW1hbmRTY29wZSA9IFwiYXRvbS10ZXh0LWVkaXRvci52aW0tbW9kZS1wbHVzLmluc2VydC1tb2RlXCJcbn1cblxuY2xhc3MgQWN0aXZhdGVOb3JtYWxNb2RlT25jZSBleHRlbmRzIEluc2VydE1vZGUge1xuICBleGVjdXRlKCkge1xuICAgIGNvbnN0IGN1cnNvcnNUb01vdmVSaWdodCA9IHRoaXMuZWRpdG9yLmdldEN1cnNvcnMoKS5maWx0ZXIoY3Vyc29yID0+ICFjdXJzb3IuaXNBdEJlZ2lubmluZ09mTGluZSgpKVxuICAgIHRoaXMudmltU3RhdGUuYWN0aXZhdGUoXCJub3JtYWxcIilcbiAgICBmb3IgKGNvbnN0IGN1cnNvciBvZiBjdXJzb3JzVG9Nb3ZlUmlnaHQpIHtcbiAgICAgIHRoaXMudXRpbHMubW92ZUN1cnNvclJpZ2h0KGN1cnNvcilcbiAgICB9XG5cbiAgICBjb25zdCBkaXNwb3NhYmxlID0gYXRvbS5jb21tYW5kcy5vbkRpZERpc3BhdGNoKGV2ZW50ID0+IHtcbiAgICAgIGlmIChldmVudC50eXBlICE9PSB0aGlzLmdldENvbW1hbmROYW1lKCkpIHtcbiAgICAgICAgZGlzcG9zYWJsZS5kaXNwb3NlKClcbiAgICAgICAgdGhpcy52aW1TdGF0ZS5hY3RpdmF0ZShcImluc2VydFwiKVxuICAgICAgfVxuICAgIH0pXG4gIH1cbn1cbkFjdGl2YXRlTm9ybWFsTW9kZU9uY2UucmVnaXN0ZXIoKVxuXG5jbGFzcyBJbnNlcnRSZWdpc3RlciBleHRlbmRzIEluc2VydE1vZGUge1xuICBhc3luYyBleGVjdXRlKCkge1xuICAgIGNvbnN0IGlucHV0ID0gYXdhaXQgdGhpcy5yZWFkQ2hhclByb21pc2VkKClcbiAgICBpZiAoaW5wdXQpIHtcbiAgICAgIHRoaXMuZWRpdG9yLnRyYW5zYWN0KCgpID0+IHtcbiAgICAgICAgZm9yIChjb25zdCBzZWxlY3Rpb24gb2YgdGhpcy5lZGl0b3IuZ2V0U2VsZWN0aW9ucygpKSB7XG4gICAgICAgICAgc2VsZWN0aW9uLmluc2VydFRleHQodGhpcy52aW1TdGF0ZS5yZWdpc3Rlci5nZXRUZXh0KGlucHV0LCBzZWxlY3Rpb24pKVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH1cbiAgfVxufVxuSW5zZXJ0UmVnaXN0ZXIucmVnaXN0ZXIoKVxuXG5jbGFzcyBJbnNlcnRMYXN0SW5zZXJ0ZWQgZXh0ZW5kcyBJbnNlcnRNb2RlIHtcbiAgZXhlY3V0ZSgpIHtcbiAgICB0aGlzLmVkaXRvci5pbnNlcnRUZXh0KHRoaXMudmltU3RhdGUucmVnaXN0ZXIuZ2V0VGV4dChcIi5cIikpXG4gIH1cbn1cbkluc2VydExhc3RJbnNlcnRlZC5yZWdpc3RlcigpXG5cbmNsYXNzIENvcHlGcm9tTGluZUFib3ZlIGV4dGVuZHMgSW5zZXJ0TW9kZSB7XG4gIHJvd0RlbHRhID0gLTFcblxuICBleGVjdXRlKCkge1xuICAgIGNvbnN0IHRyYW5zbGF0aW9uID0gW3RoaXMucm93RGVsdGEsIDBdXG4gICAgdGhpcy5lZGl0b3IudHJhbnNhY3QoKCkgPT4ge1xuICAgICAgZm9yIChjb25zdCBzZWxlY3Rpb24gb2YgdGhpcy5lZGl0b3IuZ2V0U2VsZWN0aW9ucygpKSB7XG4gICAgICAgIGNvbnN0IHBvaW50ID0gc2VsZWN0aW9uLmN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpLnRyYW5zbGF0ZSh0cmFuc2xhdGlvbilcbiAgICAgICAgaWYgKHBvaW50LnJvdyA+PSAwKSB7XG4gICAgICAgICAgY29uc3QgcmFuZ2UgPSBSYW5nZS5mcm9tUG9pbnRXaXRoRGVsdGEocG9pbnQsIDAsIDEpXG4gICAgICAgICAgY29uc3QgdGV4dCA9IHRoaXMuZWRpdG9yLmdldFRleHRJbkJ1ZmZlclJhbmdlKHJhbmdlKVxuICAgICAgICAgIGlmICh0ZXh0KSBzZWxlY3Rpb24uaW5zZXJ0VGV4dCh0ZXh0KVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgfVxufVxuQ29weUZyb21MaW5lQWJvdmUucmVnaXN0ZXIoKVxuXG5jbGFzcyBDb3B5RnJvbUxpbmVCZWxvdyBleHRlbmRzIENvcHlGcm9tTGluZUFib3ZlIHtcbiAgcm93RGVsdGEgPSArMVxufVxuQ29weUZyb21MaW5lQmVsb3cucmVnaXN0ZXIoKVxuXG5jbGFzcyBOZXh0VGFiIGV4dGVuZHMgTWlzY0NvbW1hbmQge1xuICBkZWZhdWx0Q291bnQgPSAwXG5cbiAgZXhlY3V0ZSgpIHtcbiAgICBjb25zdCBjb3VudCA9IHRoaXMuZ2V0Q291bnQoKVxuICAgIGNvbnN0IHBhbmUgPSBhdG9tLndvcmtzcGFjZS5wYW5lRm9ySXRlbSh0aGlzLmVkaXRvcilcblxuICAgIGlmIChjb3VudCkgcGFuZS5hY3RpdmF0ZUl0ZW1BdEluZGV4KGNvdW50IC0gMSlcbiAgICBlbHNlIHBhbmUuYWN0aXZhdGVOZXh0SXRlbSgpXG4gIH1cbn1cbk5leHRUYWIucmVnaXN0ZXIoKVxuXG5jbGFzcyBQcmV2aW91c1RhYiBleHRlbmRzIE1pc2NDb21tYW5kIHtcbiAgZXhlY3V0ZSgpIHtcbiAgICBhdG9tLndvcmtzcGFjZS5wYW5lRm9ySXRlbSh0aGlzLmVkaXRvcikuYWN0aXZhdGVQcmV2aW91c0l0ZW0oKVxuICB9XG59XG5QcmV2aW91c1RhYi5yZWdpc3RlcigpXG4iXX0=