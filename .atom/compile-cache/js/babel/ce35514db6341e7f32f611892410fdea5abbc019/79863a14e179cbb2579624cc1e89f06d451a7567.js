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
    key: "command",
    value: false,
    enumerable: true
  }, {
    key: "operationKind",
    value: "misc-command",
    enumerable: true
  }]);

  return MiscCommand;
})(Base);

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

      var changedRange = undefined;

      if (strategy === "smart") {
        changedRange = this.utils.findRangeContainsPoint(newRanges, lastCursor.getBufferPosition());
      } else if (strategy === "simple") {
        changedRange = this.utils.sortRanges(newRanges.concat(oldRanges))[0];
      }

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

var Redo = (function (_Undo) {
  _inherits(Redo, _Undo);

  function Redo() {
    _classCallCheck(this, Redo);

    _get(Object.getPrototypeOf(Redo.prototype), "constructor", this).apply(this, arguments);
  }

  // zc
  return Redo;
})(Undo);

var FoldCurrentRow = (function (_MiscCommand4) {
  _inherits(FoldCurrentRow, _MiscCommand4);

  function FoldCurrentRow() {
    _classCallCheck(this, FoldCurrentRow);

    _get(Object.getPrototypeOf(FoldCurrentRow.prototype), "constructor", this).apply(this, arguments);
  }

  // zo

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

var UnfoldCurrentRow = (function (_MiscCommand5) {
  _inherits(UnfoldCurrentRow, _MiscCommand5);

  function UnfoldCurrentRow() {
    _classCallCheck(this, UnfoldCurrentRow);

    _get(Object.getPrototypeOf(UnfoldCurrentRow.prototype), "constructor", this).apply(this, arguments);
  }

  // za

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

var ToggleFold = (function (_MiscCommand6) {
  _inherits(ToggleFold, _MiscCommand6);

  function ToggleFold() {
    _classCallCheck(this, ToggleFold);

    _get(Object.getPrototypeOf(ToggleFold.prototype), "constructor", this).apply(this, arguments);
  }

  // Base of zC, zO, zA

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

var FoldCurrentRowRecursivelyBase = (function (_MiscCommand7) {
  _inherits(FoldCurrentRowRecursivelyBase, _MiscCommand7);

  function FoldCurrentRowRecursivelyBase() {
    _classCallCheck(this, FoldCurrentRowRecursivelyBase);

    _get(Object.getPrototypeOf(FoldCurrentRowRecursivelyBase.prototype), "constructor", this).apply(this, arguments);
  }

  // zC

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
  }], [{
    key: "command",
    value: false,
    enumerable: true
  }]);

  return FoldCurrentRowRecursivelyBase;
})(MiscCommand);

var FoldCurrentRowRecursively = (function (_FoldCurrentRowRecursivelyBase) {
  _inherits(FoldCurrentRowRecursively, _FoldCurrentRowRecursivelyBase);

  function FoldCurrentRowRecursively() {
    _classCallCheck(this, FoldCurrentRowRecursively);

    _get(Object.getPrototypeOf(FoldCurrentRowRecursively.prototype), "constructor", this).apply(this, arguments);
  }

  // zO

  _createClass(FoldCurrentRowRecursively, [{
    key: "execute",
    value: function execute() {
      this.foldRecursively();
    }
  }]);

  return FoldCurrentRowRecursively;
})(FoldCurrentRowRecursivelyBase);

var UnfoldCurrentRowRecursively = (function (_FoldCurrentRowRecursivelyBase2) {
  _inherits(UnfoldCurrentRowRecursively, _FoldCurrentRowRecursivelyBase2);

  function UnfoldCurrentRowRecursively() {
    _classCallCheck(this, UnfoldCurrentRowRecursively);

    _get(Object.getPrototypeOf(UnfoldCurrentRowRecursively.prototype), "constructor", this).apply(this, arguments);
  }

  // zA

  _createClass(UnfoldCurrentRowRecursively, [{
    key: "execute",
    value: function execute() {
      this.unfoldRecursively();
    }
  }]);

  return UnfoldCurrentRowRecursively;
})(FoldCurrentRowRecursivelyBase);

var ToggleFoldRecursively = (function (_FoldCurrentRowRecursivelyBase3) {
  _inherits(ToggleFoldRecursively, _FoldCurrentRowRecursivelyBase3);

  function ToggleFoldRecursively() {
    _classCallCheck(this, ToggleFoldRecursively);

    _get(Object.getPrototypeOf(ToggleFoldRecursively.prototype), "constructor", this).apply(this, arguments);
  }

  // zR

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

var UnfoldAll = (function (_MiscCommand8) {
  _inherits(UnfoldAll, _MiscCommand8);

  function UnfoldAll() {
    _classCallCheck(this, UnfoldAll);

    _get(Object.getPrototypeOf(UnfoldAll.prototype), "constructor", this).apply(this, arguments);
  }

  // zM

  _createClass(UnfoldAll, [{
    key: "execute",
    value: function execute() {
      this.editor.unfoldAll();
    }
  }]);

  return UnfoldAll;
})(MiscCommand);

var FoldAll = (function (_MiscCommand9) {
  _inherits(FoldAll, _MiscCommand9);

  function FoldAll() {
    _classCallCheck(this, FoldAll);

    _get(Object.getPrototypeOf(FoldAll.prototype), "constructor", this).apply(this, arguments);
  }

  // zr

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

var UnfoldNextIndentLevel = (function (_MiscCommand10) {
  _inherits(UnfoldNextIndentLevel, _MiscCommand10);

  function UnfoldNextIndentLevel() {
    _classCallCheck(this, UnfoldNextIndentLevel);

    _get(Object.getPrototypeOf(UnfoldNextIndentLevel.prototype), "constructor", this).apply(this, arguments);
  }

  // zm

  _createClass(UnfoldNextIndentLevel, [{
    key: "execute",
    value: function execute() {
      var _utils$getFoldInfoByKind2 = this.utils.getFoldInfoByKind(this.editor);

      var folded = _utils$getFoldInfoByKind2.folded;

      if (!folded) return;
      var minIndent = folded.minIndent;
      var rowRangesWithIndent = folded.rowRangesWithIndent;

      var targetIndents = this.utils.getList(minIndent, minIndent + this.getCount() - 1);
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

var FoldNextIndentLevel = (function (_MiscCommand11) {
  _inherits(FoldNextIndentLevel, _MiscCommand11);

  function FoldNextIndentLevel() {
    _classCallCheck(this, FoldNextIndentLevel);

    _get(Object.getPrototypeOf(FoldNextIndentLevel.prototype), "constructor", this).apply(this, arguments);
  }

  // ctrl-e scroll lines downwards

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
      fromLevel = this.limitNumber(fromLevel - this.getCount() - 1, { min: 0 });
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

var MiniScrollDown = (function (_MiscCommand12) {
  _inherits(MiniScrollDown, _MiscCommand12);

  function MiniScrollDown() {
    _classCallCheck(this, MiniScrollDown);

    _get(Object.getPrototypeOf(MiniScrollDown.prototype), "constructor", this).apply(this, arguments);

    this.defaultCount = this.getConfig("defaultScrollRowsOnMiniScroll");
    this.direction = "down";
  }

  // ctrl-y scroll lines upwards

  _createClass(MiniScrollDown, [{
    key: "keepCursorOnScreen",
    value: function keepCursorOnScreen() {
      var cursor = this.editor.getLastCursor();
      var row = cursor.getScreenRow();
      var offset = 2;
      var validRow = this.direction === "down" ? this.limitNumber(row, { min: this.editor.getFirstVisibleScreenRow() + offset }) : this.limitNumber(row, { max: this.editor.getLastVisibleScreenRow() - offset });
      if (row !== validRow) {
        this.utils.setBufferRow(cursor, this.editor.bufferRowForScreenRow(validRow), { autoscroll: false });
      }
    }
  }, {
    key: "execute",
    value: function execute() {
      var _this4 = this;

      this.vimState.requestScroll({
        amountOfPixels: (this.direction === "down" ? 1 : -1) * this.getCount() * this.editor.getLineHeightInPixels(),
        duration: this.getSmoothScrollDuation("MiniScroll"),
        onFinish: function onFinish() {
          return _this4.keepCursorOnScreen();
        }
      });
    }
  }]);

  return MiniScrollDown;
})(MiscCommand);

var MiniScrollUp = (function (_MiniScrollDown) {
  _inherits(MiniScrollUp, _MiniScrollDown);

  function MiniScrollUp() {
    _classCallCheck(this, MiniScrollUp);

    _get(Object.getPrototypeOf(MiniScrollUp.prototype), "constructor", this).apply(this, arguments);

    this.direction = "up";
  }

  // RedrawCursorLineAt{XXX} in viewport.
  // +-------------------------------------------+
  // | where        | no move | move to 1st char |
  // |--------------+---------+------------------|
  // | top          | z t     | z enter          |
  // | upper-middle | z u     | z space          |
  // | middle       | z z     | z .              |
  // | bottom       | z b     | z -              |
  // +-------------------------------------------+
  return MiniScrollUp;
})(MiniScrollDown);

var RedrawCursorLine = (function (_MiscCommand13) {
  _inherits(RedrawCursorLine, _MiscCommand13);

  function RedrawCursorLine() {
    _classCallCheck(this, RedrawCursorLine);

    _get(Object.getPrototypeOf(RedrawCursorLine.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(RedrawCursorLine, [{
    key: "initialize",
    value: function initialize() {
      var baseName = this.name.replace(/AndMoveToFirstCharacterOfLine$/, "");
      this.coefficient = this.constructor.coefficientByName[baseName];
      this.moveToFirstCharacterOfLine = this.name.endsWith("AndMoveToFirstCharacterOfLine");
      _get(Object.getPrototypeOf(RedrawCursorLine.prototype), "initialize", this).call(this);
    }
  }, {
    key: "execute",
    value: function execute() {
      var _this5 = this;

      var scrollTop = Math.round(this.getScrollTop());
      this.vimState.requestScroll({
        scrollTop: scrollTop,
        duration: this.getSmoothScrollDuation("RedrawCursorLine"),
        onFinish: function onFinish() {
          if (_this5.editorElement.getScrollTop() !== scrollTop && !_this5.editor.getScrollPastEnd()) {
            _this5.recommendToEnableScrollPastEnd();
          }
        }
      });
      if (this.moveToFirstCharacterOfLine) this.editor.moveToFirstCharacterOfLine();
    }
  }, {
    key: "getScrollTop",
    value: function getScrollTop() {
      var _editorElement$pixelPositionForScreenPosition = this.editorElement.pixelPositionForScreenPosition(this.editor.getCursorScreenPosition());

      var top = _editorElement$pixelPositionForScreenPosition.top;

      var editorHeight = this.editorElement.getHeight();
      var lineHeightInPixel = this.editor.getLineHeightInPixels();

      return this.limitNumber(top - editorHeight * this.coefficient, {
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
  }], [{
    key: "command",
    value: false,
    enumerable: true
  }, {
    key: "coefficientByName",
    value: {
      RedrawCursorLineAtTop: 0,
      RedrawCursorLineAtUpperMiddle: 0.25,
      RedrawCursorLineAtMiddle: 0.5,
      RedrawCursorLineAtBottom: 1
    },
    enumerable: true
  }]);

  return RedrawCursorLine;
})(MiscCommand);

var RedrawCursorLineAtTop = (function (_RedrawCursorLine) {
  _inherits(RedrawCursorLineAtTop, _RedrawCursorLine);

  function RedrawCursorLineAtTop() {
    _classCallCheck(this, RedrawCursorLineAtTop);

    _get(Object.getPrototypeOf(RedrawCursorLineAtTop.prototype), "constructor", this).apply(this, arguments);
  }

  // zt
  return RedrawCursorLineAtTop;
})(RedrawCursorLine);

var RedrawCursorLineAtTopAndMoveToFirstCharacterOfLine = (function (_RedrawCursorLine2) {
  _inherits(RedrawCursorLineAtTopAndMoveToFirstCharacterOfLine, _RedrawCursorLine2);

  function RedrawCursorLineAtTopAndMoveToFirstCharacterOfLine() {
    _classCallCheck(this, RedrawCursorLineAtTopAndMoveToFirstCharacterOfLine);

    _get(Object.getPrototypeOf(RedrawCursorLineAtTopAndMoveToFirstCharacterOfLine.prototype), "constructor", this).apply(this, arguments);
  }

  // z enter
  return RedrawCursorLineAtTopAndMoveToFirstCharacterOfLine;
})(RedrawCursorLine);

var RedrawCursorLineAtUpperMiddle = (function (_RedrawCursorLine3) {
  _inherits(RedrawCursorLineAtUpperMiddle, _RedrawCursorLine3);

  function RedrawCursorLineAtUpperMiddle() {
    _classCallCheck(this, RedrawCursorLineAtUpperMiddle);

    _get(Object.getPrototypeOf(RedrawCursorLineAtUpperMiddle.prototype), "constructor", this).apply(this, arguments);
  }

  // zu
  return RedrawCursorLineAtUpperMiddle;
})(RedrawCursorLine);

var RedrawCursorLineAtUpperMiddleAndMoveToFirstCharacterOfLine = (function (_RedrawCursorLine4) {
  _inherits(RedrawCursorLineAtUpperMiddleAndMoveToFirstCharacterOfLine, _RedrawCursorLine4);

  function RedrawCursorLineAtUpperMiddleAndMoveToFirstCharacterOfLine() {
    _classCallCheck(this, RedrawCursorLineAtUpperMiddleAndMoveToFirstCharacterOfLine);

    _get(Object.getPrototypeOf(RedrawCursorLineAtUpperMiddleAndMoveToFirstCharacterOfLine.prototype), "constructor", this).apply(this, arguments);
  }

  // z space
  return RedrawCursorLineAtUpperMiddleAndMoveToFirstCharacterOfLine;
})(RedrawCursorLine);

var RedrawCursorLineAtMiddle = (function (_RedrawCursorLine5) {
  _inherits(RedrawCursorLineAtMiddle, _RedrawCursorLine5);

  function RedrawCursorLineAtMiddle() {
    _classCallCheck(this, RedrawCursorLineAtMiddle);

    _get(Object.getPrototypeOf(RedrawCursorLineAtMiddle.prototype), "constructor", this).apply(this, arguments);
  }

  // z z
  return RedrawCursorLineAtMiddle;
})(RedrawCursorLine);

var RedrawCursorLineAtMiddleAndMoveToFirstCharacterOfLine = (function (_RedrawCursorLine6) {
  _inherits(RedrawCursorLineAtMiddleAndMoveToFirstCharacterOfLine, _RedrawCursorLine6);

  function RedrawCursorLineAtMiddleAndMoveToFirstCharacterOfLine() {
    _classCallCheck(this, RedrawCursorLineAtMiddleAndMoveToFirstCharacterOfLine);

    _get(Object.getPrototypeOf(RedrawCursorLineAtMiddleAndMoveToFirstCharacterOfLine.prototype), "constructor", this).apply(this, arguments);
  }

  // z .
  return RedrawCursorLineAtMiddleAndMoveToFirstCharacterOfLine;
})(RedrawCursorLine);

var RedrawCursorLineAtBottom = (function (_RedrawCursorLine7) {
  _inherits(RedrawCursorLineAtBottom, _RedrawCursorLine7);

  function RedrawCursorLineAtBottom() {
    _classCallCheck(this, RedrawCursorLineAtBottom);

    _get(Object.getPrototypeOf(RedrawCursorLineAtBottom.prototype), "constructor", this).apply(this, arguments);
  }

  // z b
  return RedrawCursorLineAtBottom;
})(RedrawCursorLine);

var RedrawCursorLineAtBottomAndMoveToFirstCharacterOfLine = (function (_RedrawCursorLine8) {
  _inherits(RedrawCursorLineAtBottomAndMoveToFirstCharacterOfLine, _RedrawCursorLine8);

  function RedrawCursorLineAtBottomAndMoveToFirstCharacterOfLine() {
    _classCallCheck(this, RedrawCursorLineAtBottomAndMoveToFirstCharacterOfLine);

    _get(Object.getPrototypeOf(RedrawCursorLineAtBottomAndMoveToFirstCharacterOfLine.prototype), "constructor", this).apply(this, arguments);
  }

  // z -

  // Horizontal Scroll without changing cursor position
  // -------------------------
  // zs
  return RedrawCursorLineAtBottomAndMoveToFirstCharacterOfLine;
})(RedrawCursorLine);

var ScrollCursorToLeft = (function (_MiscCommand14) {
  _inherits(ScrollCursorToLeft, _MiscCommand14);

  function ScrollCursorToLeft() {
    _classCallCheck(this, ScrollCursorToLeft);

    _get(Object.getPrototypeOf(ScrollCursorToLeft.prototype), "constructor", this).apply(this, arguments);

    this.which = "left";
  }

  // ze

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

var ScrollCursorToRight = (function (_ScrollCursorToLeft) {
  _inherits(ScrollCursorToRight, _ScrollCursorToLeft);

  function ScrollCursorToRight() {
    _classCallCheck(this, ScrollCursorToRight);

    _get(Object.getPrototypeOf(ScrollCursorToRight.prototype), "constructor", this).apply(this, arguments);

    this.which = "right";
  }

  // insert-mode specific commands
  // -------------------------
  return ScrollCursorToRight;
})(ScrollCursorToLeft);

var InsertMode = (function (_MiscCommand15) {
  _inherits(InsertMode, _MiscCommand15);

  function InsertMode() {
    _classCallCheck(this, InsertMode);

    _get(Object.getPrototypeOf(InsertMode.prototype), "constructor", this).apply(this, arguments);
  }

  // just namespace

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

var CopyFromLineBelow = (function (_CopyFromLineAbove) {
  _inherits(CopyFromLineBelow, _CopyFromLineAbove);

  function CopyFromLineBelow() {
    _classCallCheck(this, CopyFromLineBelow);

    _get(Object.getPrototypeOf(CopyFromLineBelow.prototype), "constructor", this).apply(this, arguments);

    this.rowDelta = +1;
  }

  return CopyFromLineBelow;
})(CopyFromLineAbove);

var NextTab = (function (_MiscCommand16) {
  _inherits(NextTab, _MiscCommand16);

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

var PreviousTab = (function (_MiscCommand17) {
  _inherits(PreviousTab, _MiscCommand17);

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

module.exports = {
  MiscCommand: MiscCommand,
  Mark: Mark,
  ReverseSelections: ReverseSelections,
  BlockwiseOtherEnd: BlockwiseOtherEnd,
  Undo: Undo,
  Redo: Redo,
  FoldCurrentRow: FoldCurrentRow,
  UnfoldCurrentRow: UnfoldCurrentRow,
  ToggleFold: ToggleFold,
  FoldCurrentRowRecursivelyBase: FoldCurrentRowRecursivelyBase,
  FoldCurrentRowRecursively: FoldCurrentRowRecursively,
  UnfoldCurrentRowRecursively: UnfoldCurrentRowRecursively,
  ToggleFoldRecursively: ToggleFoldRecursively,
  UnfoldAll: UnfoldAll,
  FoldAll: FoldAll,
  UnfoldNextIndentLevel: UnfoldNextIndentLevel,
  FoldNextIndentLevel: FoldNextIndentLevel,
  MiniScrollDown: MiniScrollDown,
  MiniScrollUp: MiniScrollUp,
  RedrawCursorLine: RedrawCursorLine,
  RedrawCursorLineAtTop: RedrawCursorLineAtTop,
  RedrawCursorLineAtTopAndMoveToFirstCharacterOfLine: RedrawCursorLineAtTopAndMoveToFirstCharacterOfLine,
  RedrawCursorLineAtUpperMiddle: RedrawCursorLineAtUpperMiddle,
  RedrawCursorLineAtUpperMiddleAndMoveToFirstCharacterOfLine: RedrawCursorLineAtUpperMiddleAndMoveToFirstCharacterOfLine,
  RedrawCursorLineAtMiddle: RedrawCursorLineAtMiddle,
  RedrawCursorLineAtMiddleAndMoveToFirstCharacterOfLine: RedrawCursorLineAtMiddleAndMoveToFirstCharacterOfLine,
  RedrawCursorLineAtBottom: RedrawCursorLineAtBottom,
  RedrawCursorLineAtBottomAndMoveToFirstCharacterOfLine: RedrawCursorLineAtBottomAndMoveToFirstCharacterOfLine,
  ScrollCursorToLeft: ScrollCursorToLeft,
  ScrollCursorToRight: ScrollCursorToRight,
  ActivateNormalModeOnce: ActivateNormalModeOnce,
  InsertRegister: InsertRegister,
  InsertLastInserted: InsertLastInserted,
  CopyFromLineAbove: CopyFromLineAbove,
  CopyFromLineBelow: CopyFromLineBelow,
  NextTab: NextTab,
  PreviousTab: PreviousTab
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL21pc2MtY29tbWFuZC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxXQUFXLENBQUE7Ozs7Ozs7Ozs7OztlQUVLLE9BQU8sQ0FBQyxNQUFNLENBQUM7O0lBQXhCLEtBQUssWUFBTCxLQUFLOztBQUNaLElBQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQTs7SUFFeEIsV0FBVztZQUFYLFdBQVc7O1dBQVgsV0FBVzswQkFBWCxXQUFXOzsrQkFBWCxXQUFXOzs7ZUFBWCxXQUFXOztXQUNFLEtBQUs7Ozs7V0FDQyxjQUFjOzs7O1NBRmpDLFdBQVc7R0FBUyxJQUFJOztJQUt4QixJQUFJO1lBQUosSUFBSTs7V0FBSixJQUFJOzBCQUFKLElBQUk7OytCQUFKLElBQUk7OztlQUFKLElBQUk7OzZCQUNLLGFBQUc7QUFDZCxVQUFNLElBQUksR0FBRyxNQUFNLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFBO0FBQzFDLFVBQUksSUFBSSxFQUFFO0FBQ1IsWUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsdUJBQXVCLEVBQUUsQ0FBQyxDQUFBO09BQzdEO0tBQ0Y7OztTQU5HLElBQUk7R0FBUyxXQUFXOztJQVN4QixpQkFBaUI7WUFBakIsaUJBQWlCOztXQUFqQixpQkFBaUI7MEJBQWpCLGlCQUFpQjs7K0JBQWpCLGlCQUFpQjs7O2VBQWpCLGlCQUFpQjs7V0FDZCxtQkFBRztBQUNSLFVBQUksQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFBO0FBQ3RGLFVBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsV0FBVyxDQUFDLEVB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a0I7QUFDbEIscUJBQW1CLEVBQW5CLG1CQUFtQjtBQUNuQix3QkFBc0IsRUFBdEIsc0JBQXNCO0FBQ3RCLGdCQUFjLEVBQWQsY0FBYztBQUNkLG9CQUFrQixFQUFsQixrQkFBa0I7QUFDbEIsbUJBQWlCLEVBQWpCLGlCQUFpQjtBQUNqQixtQkFBaUIsRUFBakIsaUJBQWlCO0FBQ2pCLFNBQU8sRUFBUCxPQUFPO0FBQ1AsYUFBVyxFQUFYLFdBQVc7Q0FDWixDQUFBIiwiZmlsZSI6Ii9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL21pc2MtY29tbWFuZC5qcyIsInNvdXJjZXNDb250ZW50IjpbIlwidXNlIGJhYmVsXCJcblxuY29uc3Qge1JhbmdlfSA9IHJlcXVpcmUoXCJhdG9tXCIpXG5jb25zdCBCYXNlID0gcmVxdWlyZShcIi4vYmFzZVwiKVxuXG5jbGFzcyBNaXNjQ29tbWFuZCBleHRlbmRzIEJhc2Uge1xuICBzdGF0aWMgY29tbWFuZCA9IGZhbHNlXG4gIHN0YXRpYyBvcGVyYXRpb25LaW5kID0gXCJtaXNjLWNvbW1hbmRcIlxufVxuXG5jbGFzcyBNYXJrIGV4dGVuZHMgTWlzY0NvbW1hbmQge1xuICBhc3luYyBleGVjdXRlKCkge1xuICAgIGNvbnN0IG1hcmsgPSBhd2FpdCB0aGlzLnJlYWRDaGFyUHJvbWlzZWQoKVxuICAgIGlmIChtYXJrKSB7XG4gICAgICB0aGlzLnZpbVN0YXRlLm1hcmsuc2V0KG1hcmssIHRoaXMuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKSlcbiAgICB9XG4gIH1cbn1cblxuY2xhc3MgUmV2ZXJzZVNlbGVjdGlvbnMgZXh0ZW5kcyBNaXNjQ29tbWFuZCB7XG4gIGV4ZWN1dGUoKSB7XG4gICAgdGhpcy5zd3JhcC5zZXRSZXZlcnNlZFN0YXRlKHRoaXMuZWRpdG9yLCAhdGhpcy5lZGl0b3IuZ2V0TGFzdFNlbGVjdGlvbigpLmlzUmV2ZXJzZWQoKSlcbiAgICBpZiAodGhpcy5pc01vZGUoXCJ2aXN1YWxcIiwgXCJibG9ja3dpc2VcIikpIHtcbiAgICAgIHRoaXMuZ2V0TGFzdEJsb2Nrd2lzZVNlbGVjdGlvbigpLmF1dG9zY3JvbGwoKVxuICAgIH1cbiAgfVxufVxuXG5jbGFzcyBCbG9ja3dpc2VPdGhlckVuZCBleHRlbmRzIFJldmVyc2VTZWxlY3Rpb25zIHtcbiAgZXhlY3V0ZSgpIHtcbiAgICBmb3IgKGNvbnN0IGJsb2Nrd2lzZVNlbGVjdGlvbiBvZiB0aGlzLmdldEJsb2Nrd2lzZVNlbGVjdGlvbnMoKSkge1xuICAgICAgYmxvY2t3aXNlU2VsZWN0aW9uLnJldmVyc2UoKVxuICAgIH1cbiAgICBzdXBlci5leGVjdXRlKClcbiAgfVxufVxuXG5jbGFzcyBVbmRvIGV4dGVuZHMgTWlzY0NvbW1hbmQge1xuICBleGVjdXRlKCkge1xuICAgIGNvbnN0IG5ld1JhbmdlcyA9IFtdXG4gICAgY29uc3Qgb2xkUmFuZ2VzID0gW11cblxuICAgIGNvbnN0IGRpc3Bvc2FibGUgPSB0aGlzLmVkaXRvci5nZXRCdWZmZXIoKS5vbkRpZENoYW5nZVRleHQoZXZlbnQgPT4ge1xuICAgICAgZm9yIChjb25zdCB7bmV3UmFuZ2UsIG9sZFJhbmdlfSBvZiBldmVudC5jaGFuZ2VzKSB7XG4gICAgICAgIGlmIChuZXdSYW5nZS5pc0VtcHR5KCkpIHtcbiAgICAgICAgICBvbGRSYW5nZXMucHVzaChvbGRSYW5nZSkgLy8gUmVtb3ZlIG9ubHlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBuZXdSYW5nZXMucHVzaChuZXdSYW5nZSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG5cbiAgICBpZiAodGhpcy5uYW1lID09PSBcIlVuZG9cIikge1xuICAgICAgdGhpcy5lZGl0b3IudW5kbygpXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZWRpdG9yLnJlZG8oKVxuICAgIH1cblxuICAgIGRpc3Bvc2FibGUuZGlzcG9zZSgpXG5cbiAgICBmb3IgKGNvbnN0IHNlbGVjdGlvbiBvZiB0aGlzLmVkaXRvci5nZXRTZWxlY3Rpb25zKCkpIHtcbiAgICAgIHNlbGVjdGlvbi5jbGVhcigpXG4gICAgfVxuXG4gICAgaWYgKHRoaXMuZ2V0Q29uZmlnKFwic2V0Q3Vyc29yVG9TdGFydE9mQ2hhbmdlT25VbmRvUmVkb1wiKSkge1xuICAgICAgY29uc3Qgc3RyYXRlZ3kgPSB0aGlzLmdldENvbmZpZyhcInNldEN1cnNvclRvU3RhcnRPZkNoYW5nZU9uVW5kb1JlZG9TdHJhdGVneVwiKVxuICAgICAgdGhpcy5zZXRDdXJzb3JQb3NpdGlvbih7bmV3UmFuZ2VzLCBvbGRSYW5nZXMsIHN0cmF0ZWd5fSlcbiAgICAgIHRoaXMudmltU3RhdGUuY2xlYXJTZWxlY3Rpb25zKClcbiAgICB9XG5cbiAgICBpZiAodGhpcy5nZXRDb25maWcoXCJmbGFzaE9uVW5kb1JlZG9cIikpIHtcbiAgICAgIGlmIChuZXdSYW5nZXMubGVuZ3RoKSB7XG4gICAgICAgIHRoaXMuZmxhc2hDaGFuZ2VzKG5ld1JhbmdlcywgXCJjaGFuZ2VzXCIpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmZsYXNoQ2hhbmdlcyhvbGRSYW5nZXMsIFwiZGVsZXRlc1wiKVxuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLmFjdGl2YXRlTW9kZShcIm5vcm1hbFwiKVxuICB9XG5cbiAgc2V0Q3Vyc29yUG9zaXRpb24oe25ld1Jhbmdlcywgb2xkUmFuZ2VzLCBzdHJhdGVneX0pIHtcbiAgICBjb25zdCBsYXN0Q3Vyc29yID0gdGhpcy5lZGl0b3IuZ2V0TGFzdEN1cnNvcigpIC8vIFRoaXMgaXMgcmVzdG9yZWQgY3Vyc29yXG5cbiAgICBsZXQgY2hhbmdlZFJhbmdlXG5cbiAgICBpZiAoc3RyYXRlZ3kgPT09IFwic21hcnRcIikge1xuICAgICAgY2hhbmdlZFJhbmdlID0gdGhpcy51dGlscy5maW5kUmFuZ2VDb250YWluc1BvaW50KG5ld1JhbmdlcywgbGFzdEN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpKVxuICAgIH0gZWxzZSBpZiAoc3RyYXRlZ3kgPT09IFwic2ltcGxlXCIpIHtcbiAgICAgIGNoYW5nZWRSYW5nZSA9IHRoaXMudXRpbHMuc29ydFJhbmdlcyhuZXdSYW5nZXMuY29uY2F0KG9sZFJhbmdlcykpWzBdXG4gICAgfVxuXG4gICAgaWYgKGNoYW5nZWRSYW5nZSkge1xuICAgICAgaWYgKHRoaXMudXRpbHMuaXNMaW5ld2lzZVJhbmdlKGNoYW5nZWRSYW5nZSkpIHRoaXMudXRpbHMuc2V0QnVmZmVyUm93KGxhc3RDdXJzb3IsIGNoYW5nZWRSYW5nZS5zdGFydC5yb3cpXG4gICAgICBlbHNlIGxhc3RDdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24oY2hhbmdlZFJhbmdlLnN0YXJ0KVxuICAgIH1cbiAgfVxuXG4gIGZsYXNoQ2hhbmdlcyhyYW5nZXMsIG11dGF0aW9uVHlwZSkge1xuICAgIGNvbnN0IGlzTXVsdGlwbGVTaW5nbGVMaW5lUmFuZ2VzID0gcmFuZ2VzID0+IHJhbmdlcy5sZW5ndGggPiAxICYmIHJhbmdlcy5ldmVyeSh0aGlzLnV0aWxzLmlzU2luZ2xlTGluZVJhbmdlKVxuICAgIGNvbnN0IGh1bWFuaXplTmV3TGluZUZvckJ1ZmZlclJhbmdlID0gdGhpcy51dGlscy5odW1hbml6ZU5ld0xpbmVGb3JCdWZmZXJSYW5nZS5iaW5kKG51bGwsIHRoaXMuZWRpdG9yKVxuICAgIGNvbnN0IGlzTm90TGVhZGluZ1doaXRlU3BhY2VSYW5nZSA9IHRoaXMudXRpbHMuaXNOb3RMZWFkaW5nV2hpdGVTcGFjZVJhbmdlLmJpbmQobnVsbCwgdGhpcy5lZGl0b3IpXG4gICAgaWYgKCF0aGlzLnV0aWxzLmlzTXVsdGlwbGVBbmRBbGxSYW5nZUhhdmVTYW1lQ29sdW1uQW5kQ29uc2VjdXRpdmVSb3dzKHJhbmdlcykpIHtcbiAgICAgIHJhbmdlcyA9IHJhbmdlcy5tYXAoaHVtYW5pemVOZXdMaW5lRm9yQnVmZmVyUmFuZ2UpXG4gICAgICBjb25zdCB0eXBlID0gaXNNdWx0aXBsZVNpbmdsZUxpbmVSYW5nZXMocmFuZ2VzKSA/IGB1bmRvLXJlZG8tbXVsdGlwbGUtJHttdXRhdGlvblR5cGV9YCA6IFwidW5kby1yZWRvXCJcbiAgICAgIGlmICghKHR5cGUgPT09IFwidW5kby1yZWRvXCIgJiYgbXV0YXRpb25UeXBlID09PSBcImRlbGV0ZXNcIikpIHtcbiAgICAgICAgdGhpcy52aW1TdGF0ZS5mbGFzaChyYW5nZXMuZmlsdGVyKGlzTm90TGVhZGluZ1doaXRlU3BhY2VSYW5nZSksIHt0eXBlfSlcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuY2xhc3MgUmVkbyBleHRlbmRzIFVuZG8ge31cblxuLy8gemNcbmNsYXNzIEZvbGRDdXJyZW50Um93IGV4dGVuZHMgTWlzY0NvbW1hbmQge1xuICBleGVjdXRlKCkge1xuICAgIGZvciAoY29uc3QgcG9pbnQgb2YgdGhpcy5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbnMoKSkge1xuICAgICAgdGhpcy5lZGl0b3IuZm9sZEJ1ZmZlclJvdyhwb2ludC5yb3cpXG4gICAgfVxuICB9XG59XG5cbi8vIHpvXG5jbGFzcyBVbmZvbGRDdXJyZW50Um93IGV4dGVuZHMgTWlzY0NvbW1hbmQge1xuICBleGVjdXRlKCkge1xuICAgIGZvciAoY29uc3QgcG9pbnQgb2YgdGhpcy5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbnMoKSkge1xuICAgICAgdGhpcy5lZGl0b3IudW5mb2xkQnVmZmVyUm93KHBvaW50LnJvdylcbiAgICB9XG4gIH1cbn1cblxuLy8gemFcbmNsYXNzIFRvZ2dsZUZvbGQgZXh0ZW5kcyBNaXNjQ29tbWFuZCB7XG4gIGV4ZWN1dGUoKSB7XG4gICAgZm9yIChjb25zdCBwb2ludCBvZiB0aGlzLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9ucygpKSB7XG4gICAgICB0aGlzLmVkaXRvci50b2dnbGVGb2xkQXRCdWZmZXJSb3cocG9pbnQucm93KVxuICAgIH1cbiAgfVxufVxuXG4vLyBCYXNlIG9mIHpDLCB6TywgekFcbmNsYXNzIEZvbGRDdXJyZW50Um93UmVjdXJzaXZlbHlCYXNlIGV4dGVuZHMgTWlzY0NvbW1hbmQge1xuICBzdGF0aWMgY29tbWFuZCA9IGZhbHNlXG4gIGVhY2hGb2xkU3RhcnRSb3coZm4pIHtcbiAgICBmb3IgKGNvbnN0IHtyb3d9IG9mIHRoaXMuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb25zT3JkZXJlZCgpLnJldmVyc2UoKSkge1xuICAgICAgaWYgKCF0aGlzLmVkaXRvci5pc0ZvbGRhYmxlQXRCdWZmZXJSb3cocm93KSkgY29udGludWVcblxuICAgICAgdGhpcy51dGlsc1xuICAgICAgICAuZ2V0Rm9sZFJvd1Jhbmdlc0NvbnRhaW5lZEJ5Rm9sZFN0YXJ0c0F0Um93KHRoaXMuZWRpdG9yLCByb3cpXG4gICAgICAgIC5tYXAocm93UmFuZ2UgPT4gcm93UmFuZ2VbMF0pIC8vIG1hcHQgdG8gc3RhcnRSb3cgb2YgZm9sZFxuICAgICAgICAucmV2ZXJzZSgpIC8vIHJldmVyc2UgdG8gcHJvY2VzcyBlbmNvbG9zZWQobmVzdGVkKSBmb2xkIGZpcnN0IHRoYW4gZW5jb2xvc2luZyBmb2xkLlxuICAgICAgICAuZm9yRWFjaChmbilcbiAgICB9XG4gIH1cblxuICBmb2xkUmVjdXJzaXZlbHkoKSB7XG4gICAgdGhpcy5lYWNoRm9sZFN0YXJ0Um93KHJvdyA9PiB7XG4gICAgICBpZiAoIXRoaXMuZWRpdG9yLmlzRm9sZGVkQXRCdWZmZXJSb3cocm93KSkgdGhpcy5lZGl0b3IuZm9sZEJ1ZmZlclJvdyhyb3cpXG4gICAgfSlcbiAgfVxuXG4gIHVuZm9sZFJlY3Vyc2l2ZWx5KCkge1xuICAgIHRoaXMuZWFjaEZvbGRTdGFydFJvdyhyb3cgPT4ge1xuICAgICAgaWYgKHRoaXMuZWRpdG9yLmlzRm9sZGVkQXRCdWZmZXJSb3cocm93KSkgdGhpcy5lZGl0b3IudW5mb2xkQnVmZmVyUm93KHJvdylcbiAgICB9KVxuICB9XG59XG5cbi8vIHpDXG5jbGFzcyBGb2xkQ3VycmVudFJvd1JlY3Vyc2l2ZWx5IGV4dGVuZHMgRm9sZEN1cnJlbnRSb3dSZWN1cnNpdmVseUJhc2Uge1xuICBleGVjdXRlKCkge1xuICAgIHRoaXMuZm9sZFJlY3Vyc2l2ZWx5KClcbiAgfVxufVxuXG4vLyB6T1xuY2xhc3MgVW5mb2xkQ3VycmVudFJvd1JlY3Vyc2l2ZWx5IGV4dGVuZHMgRm9sZEN1cnJlbnRSb3dSZWN1cnNpdmVseUJhc2Uge1xuICBleGVjdXRlKCkge1xuICAgIHRoaXMudW5mb2xkUmVjdXJzaXZlbHkoKVxuICB9XG59XG5cbi8vIHpBXG5jbGFzcyBUb2dnbGVGb2xkUmVjdXJzaXZlbHkgZXh0ZW5kcyBGb2xkQ3VycmVudFJvd1JlY3Vyc2l2ZWx5QmFzZSB7XG4gIGV4ZWN1dGUoKSB7XG4gICAgaWYgKHRoaXMuZWRpdG9yLmlzRm9sZGVkQXRCdWZmZXJSb3codGhpcy5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpLnJvdykpIHtcbiAgICAgIHRoaXMudW5mb2xkUmVjdXJzaXZlbHkoKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmZvbGRSZWN1cnNpdmVseSgpXG4gICAgfVxuICB9XG59XG5cbi8vIHpSXG5jbGFzcyBVbmZvbGRBbGwgZXh0ZW5kcyBNaXNjQ29tbWFuZCB7XG4gIGV4ZWN1dGUoKSB7XG4gICAgdGhpcy5lZGl0b3IudW5mb2xkQWxsKClcbiAgfVxufVxuXG4vLyB6TVxuY2xhc3MgRm9sZEFsbCBleHRlbmRzIE1pc2NDb21tYW5kIHtcbiAgZXhlY3V0ZSgpIHtcbiAgICBjb25zdCB7YWxsRm9sZH0gPSB0aGlzLnV0aWxzLmdldEZvbGRJbmZvQnlLaW5kKHRoaXMuZWRpdG9yKVxuICAgIGlmICghYWxsRm9sZCkgcmV0dXJuXG5cbiAgICB0aGlzLmVkaXRvci51bmZvbGRBbGwoKVxuICAgIGZvciAoY29uc3Qge2luZGVudCwgc3RhcnRSb3csIGVuZFJvd30gb2YgYWxsRm9sZC5yb3dSYW5nZXNXaXRoSW5kZW50KSB7XG4gICAgICBpZiAoaW5kZW50IDw9IHRoaXMuZ2V0Q29uZmlnKFwibWF4Rm9sZGFibGVJbmRlbnRMZXZlbFwiKSkge1xuICAgICAgICB0aGlzLmVkaXRvci5mb2xkQnVmZmVyUm93UmFuZ2Uoc3RhcnRSb3csIGVuZFJvdylcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5lZGl0b3Iuc2Nyb2xsVG9DdXJzb3JQb3NpdGlvbih7Y2VudGVyOiB0cnVlfSlcbiAgfVxufVxuXG4vLyB6clxuY2xhc3MgVW5mb2xkTmV4dEluZGVudExldmVsIGV4dGVuZHMgTWlzY0NvbW1hbmQge1xuICBleGVjdXRlKCkge1xuICAgIGNvbnN0IHtmb2xkZWR9ID0gdGhpcy51dGlscy5nZXRGb2xkSW5mb0J5S2luZCh0aGlzLmVkaXRvcilcbiAgICBpZiAoIWZvbGRlZCkgcmV0dXJuXG4gICAgY29uc3Qge21pbkluZGVudCwgcm93UmFuZ2VzV2l0aEluZGVudH0gPSBmb2xkZWRcbiAgICBjb25zdCB0YXJnZXRJbmRlbnRzID0gdGhpcy51dGlscy5nZXRMaXN0KG1pbkluZGVudCwgbWluSW5kZW50ICsgdGhpcy5nZXRDb3VudCgpIC0gMSlcbiAgICBmb3IgKGNvbnN0IHtpbmRlbnQsIHN0YXJ0Um93fSBvZiByb3dSYW5nZXNXaXRoSW5kZW50KSB7XG4gICAgICBpZiAodGFyZ2V0SW5kZW50cy5pbmNsdWRlcyhpbmRlbnQpKSB7XG4gICAgICAgIHRoaXMuZWRpdG9yLnVuZm9sZEJ1ZmZlclJvdyhzdGFydFJvdylcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuLy8gem1cbmNsYXNzIEZvbGROZXh0SW5kZW50TGV2ZWwgZXh0ZW5kcyBNaXNjQ29tbWFuZCB7XG4gIGV4ZWN1dGUoKSB7XG4gICAgY29uc3Qge3VuZm9sZGVkLCBhbGxGb2xkfSA9IHRoaXMudXRpbHMuZ2V0Rm9sZEluZm9CeUtpbmQodGhpcy5lZGl0b3IpXG4gICAgaWYgKCF1bmZvbGRlZCkgcmV0dXJuXG4gICAgLy8gRklYTUU6IFdoeSBJIG5lZWQgdW5mb2xkQWxsKCk/IFdoeSBjYW4ndCBJIGp1c3QgZm9sZCBub24tZm9sZGVkLWZvbGQgb25seT9cbiAgICAvLyBVbmxlc3MgdW5mb2xkQWxsKCkgaGVyZSwgQGVkaXRvci51bmZvbGRBbGwoKSBkZWxldGUgZm9sZE1hcmtlciBidXQgZmFpbFxuICAgIC8vIHRvIHJlbmRlciB1bmZvbGRlZCByb3dzIGNvcnJlY3RseS5cbiAgICAvLyBJIGJlbGlldmUgdGhpcyBpcyBidWcgb2YgdGV4dC1idWZmZXIncyBtYXJrZXJMYXllciB3aGljaCBhc3N1bWUgZm9sZHMgYXJlXG4gICAgLy8gY3JlYXRlZCAqKmluLW9yZGVyKiogZnJvbSB0b3Atcm93IHRvIGJvdHRvbS1yb3cuXG4gICAgdGhpcy5lZGl0b3IudW5mb2xkQWxsKClcblxuICAgIGNvbnN0IG1heEZvbGRhYmxlID0gdGhpcy5nZXRDb25maWcoXCJtYXhGb2xkYWJsZUluZGVudExldmVsXCIpXG4gICAgbGV0IGZyb21MZXZlbCA9IE1hdGgubWluKHVuZm9sZGVkLm1heEluZGVudCwgbWF4Rm9sZGFibGUpXG4gICAgZnJvbUxldmVsID0gdGhpcy5saW1pdE51bWJlcihmcm9tTGV2ZWwgLSB0aGlzLmdldENvdW50KCkgLSAxLCB7bWluOiAwfSlcbiAgICBjb25zdCB0YXJnZXRJbmRlbnRzID0gdGhpcy51dGlscy5nZXRMaXN0KGZyb21MZXZlbCwgbWF4Rm9sZGFibGUpXG4gICAgZm9yIChjb25zdCB7aW5kZW50LCBzdGFydFJvdywgZW5kUm93fSBvZiBhbGxGb2xkLnJvd1Jhbmdlc1dpdGhJbmRlbnQpIHtcbiAgICAgIGlmICh0YXJnZXRJbmRlbnRzLmluY2x1ZGVzKGluZGVudCkpIHtcbiAgICAgICAgdGhpcy5lZGl0b3IuZm9sZEJ1ZmZlclJvd1JhbmdlKHN0YXJ0Um93LCBlbmRSb3cpXG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbi8vIGN0cmwtZSBzY3JvbGwgbGluZXMgZG93bndhcmRzXG5jbGFzcyBNaW5pU2Nyb2xsRG93biBleHRlbmRzIE1pc2NDb21tYW5kIHtcbiAgZGVmYXVsdENvdW50ID0gdGhpcy5nZXRDb25maWcoXCJkZWZhdWx0U2Nyb2xsUm93c09uTWluaVNjcm9sbFwiKVxuICBkaXJlY3Rpb24gPSBcImRvd25cIlxuXG4gIGtlZXBDdXJzb3JPblNjcmVlbigpIHtcbiAgICBjb25zdCBjdXJzb3IgPSB0aGlzLmVkaXRvci5nZXRMYXN0Q3Vyc29yKClcbiAgICBjb25zdCByb3cgPSBjdXJzb3IuZ2V0U2NyZWVuUm93KClcbiAgICBjb25zdCBvZmZzZXQgPSAyXG4gICAgY29uc3QgdmFsaWRSb3cgPVxuICAgICAgdGhpcy5kaXJlY3Rpb24gPT09IFwiZG93blwiXG4gICAgICAgID8gdGhpcy5saW1pdE51bWJlcihyb3csIHttaW46IHRoaXMuZWRpdG9yLmdldEZpcnN0VmlzaWJsZVNjcmVlblJvdygpICsgb2Zmc2V0fSlcbiAgICAgICAgOiB0aGlzLmxpbWl0TnVtYmVyKHJvdywge21heDogdGhpcy5lZGl0b3IuZ2V0TGFzdFZpc2libGVTY3JlZW5Sb3coKSAtIG9mZnNldH0pXG4gICAgaWYgKHJvdyAhPT0gdmFsaWRSb3cpIHtcbiAgICAgIHRoaXMudXRpbHMuc2V0QnVmZmVyUm93KGN1cnNvciwgdGhpcy5lZGl0b3IuYnVmZmVyUm93Rm9yU2NyZWVuUm93KHZhbGlkUm93KSwge2F1dG9zY3JvbGw6IGZhbHNlfSlcbiAgICB9XG4gIH1cblxuICBleGVjdXRlKCkge1xuICAgIHRoaXMudmltU3RhdGUucmVxdWVzdFNjcm9sbCh7XG4gICAgICBhbW91bnRPZlBpeGVsczogKHRoaXMuZGlyZWN0aW9uID09PSBcImRvd25cIiA/IDEgOiAtMSkgKiB0aGlzLmdldENvdW50KCkgKiB0aGlzLmVkaXRvci5nZXRMaW5lSGVpZ2h0SW5QaXhlbHMoKSxcbiAgICAgIGR1cmF0aW9uOiB0aGlzLmdldFNtb290aFNjcm9sbER1YXRpb24oXCJNaW5pU2Nyb2xsXCIpLFxuICAgICAgb25GaW5pc2g6ICgpID0+IHRoaXMua2VlcEN1cnNvck9uU2NyZWVuKCksXG4gICAgfSlcbiAgfVxufVxuXG4vLyBjdHJsLXkgc2Nyb2xsIGxpbmVzIHVwd2FyZHNcbmNsYXNzIE1pbmlTY3JvbGxVcCBleHRlbmRzIE1pbmlTY3JvbGxEb3duIHtcbiAgZGlyZWN0aW9uID0gXCJ1cFwiXG59XG5cbi8vIFJlZHJhd0N1cnNvckxpbmVBdHtYWFh9IGluIHZpZXdwb3J0LlxuLy8gKy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0rXG4vLyB8IHdoZXJlICAgICAgICB8IG5vIG1vdmUgfCBtb3ZlIHRvIDFzdCBjaGFyIHxcbi8vIHwtLS0tLS0tLS0tLS0tLSstLS0tLS0tLS0rLS0tLS0tLS0tLS0tLS0tLS0tfFxuLy8gfCB0b3AgICAgICAgICAgfCB6IHQgICAgIHwgeiBlbnRlciAgICAgICAgICB8XG4vLyB8IHVwcGVyLW1pZGRsZSB8IHogdSAgICAgfCB6IHNwYWNlICAgICAgICAgIHxcbi8vIHwgbWlkZGxlICAgICAgIHwgeiB6ICAgICB8IHogLiAgICAgICAgICAgICAgfFxuLy8gfCBib3R0b20gICAgICAgfCB6IGIgICAgIHwgeiAtICAgICAgICAgICAgICB8XG4vLyArLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLStcbmNsYXNzIFJlZHJhd0N1cnNvckxpbmUgZXh0ZW5kcyBNaXNjQ29tbWFuZCB7XG4gIHN0YXRpYyBjb21tYW5kID0gZmFsc2VcbiAgc3RhdGljIGNvZWZmaWNpZW50QnlOYW1lID0ge1xuICAgIFJlZHJhd0N1cnNvckxpbmVBdFRvcDogMCxcbiAgICBSZWRyYXdDdXJzb3JMaW5lQXRVcHBlck1pZGRsZTogMC4yNSxcbiAgICBSZWRyYXdDdXJzb3JMaW5lQXRNaWRkbGU6IDAuNSxcbiAgICBSZWRyYXdDdXJzb3JMaW5lQXRCb3R0b206IDEsXG4gIH1cblxuICBpbml0aWFsaXplKCkge1xuICAgIGNvbnN0IGJhc2VOYW1lID0gdGhpcy5uYW1lLnJlcGxhY2UoL0FuZE1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lJC8sIFwiXCIpXG4gICAgdGhpcy5jb2VmZmljaWVudCA9IHRoaXMuY29uc3RydWN0b3IuY29lZmZpY2llbnRCeU5hbWVbYmFzZU5hbWVdXG4gICAgdGhpcy5tb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZSA9IHRoaXMubmFtZS5lbmRzV2l0aChcIkFuZE1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lXCIpXG4gICAgc3VwZXIuaW5pdGlhbGl6ZSgpXG4gIH1cblxuICBleGVjdXRlKCkge1xuICAgIGNvbnN0IHNjcm9sbFRvcCA9IE1hdGgucm91bmQodGhpcy5nZXRTY3JvbGxUb3AoKSlcbiAgICB0aGlzLnZpbVN0YXRlLnJlcXVlc3RTY3JvbGwoe1xuICAgICAgc2Nyb2xsVG9wOiBzY3JvbGxUb3AsXG4gICAgICBkdXJhdGlvbjogdGhpcy5nZXRTbW9vdGhTY3JvbGxEdWF0aW9uKFwiUmVkcmF3Q3Vyc29yTGluZVwiKSxcbiAgICAgIG9uRmluaXNoOiAoKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLmVkaXRvckVsZW1lbnQuZ2V0U2Nyb2xsVG9wKCkgIT09IHNjcm9sbFRvcCAmJiAhdGhpcy5lZGl0b3IuZ2V0U2Nyb2xsUGFzdEVuZCgpKSB7XG4gICAgICAgICAgdGhpcy5yZWNvbW1lbmRUb0VuYWJsZVNjcm9sbFBhc3RFbmQoKVxuICAgICAgICB9XG4gICAgICB9LFxuICAgIH0pXG4gICAgaWYgKHRoaXMubW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmUpIHRoaXMuZWRpdG9yLm1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lKClcbiAgfVxuXG4gIGdldFNjcm9sbFRvcCgpIHtcbiAgICBjb25zdCB7dG9wfSA9IHRoaXMuZWRpdG9yRWxlbWVudC5waXhlbFBvc2l0aW9uRm9yU2NyZWVuUG9zaXRpb24odGhpcy5lZGl0b3IuZ2V0Q3Vyc29yU2NyZWVuUG9zaXRpb24oKSlcbiAgICBjb25zdCBlZGl0b3JIZWlnaHQgPSB0aGlzLmVkaXRvckVsZW1lbnQuZ2V0SGVpZ2h0KClcbiAgICBjb25zdCBsaW5lSGVpZ2h0SW5QaXhlbCA9IHRoaXMuZWRpdG9yLmdldExpbmVIZWlnaHRJblBpeGVscygpXG5cbiAgICByZXR1cm4gdGhpcy5saW1pdE51bWJlcih0b3AgLSBlZGl0b3JIZWlnaHQgKiB0aGlzLmNvZWZmaWNpZW50LCB7XG4gICAgICBtaW46IHRvcCAtIGVkaXRvckhlaWdodCArIGxpbmVIZWlnaHRJblBpeGVsICogMyxcbiAgICAgIG1heDogdG9wIC0gbGluZUhlaWdodEluUGl4ZWwgKiAyLFxuICAgIH0pXG4gIH1cblxuICByZWNvbW1lbmRUb0VuYWJsZVNjcm9sbFBhc3RFbmQoKSB7XG4gICAgY29uc3QgbWVzc2FnZSA9IFtcbiAgICAgIFwidmltLW1vZGUtcGx1c1wiLFxuICAgICAgXCItIEZhaWxlZCB0byBzY3JvbGwuIFRvIHN1Y2Nlc3NmdWxseSBzY3JvbGwsIGBlZGl0b3Iuc2Nyb2xsUGFzdEVuZGAgbmVlZCB0byBiZSBlbmFibGVkLlwiLFxuICAgICAgJy0gWW91IGNhbiBkbyBpdCBmcm9tIGBcIlNldHRpbmdzXCIgPiBcIkVkaXRvclwiID4gXCJTY3JvbGwgUGFzdCBFbmRcImAuJyxcbiAgICAgIFwiLSBPciAqKmRvIHlvdSBhbGxvdyB2bXAgZW5hYmxlIGl0IGZvciB5b3Ugbm93PyoqXCIsXG4gICAgXS5qb2luKFwiXFxuXCIpXG5cbiAgICBjb25zdCBub3RpZmljYXRpb24gPSBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkSW5mbyhtZXNzYWdlLCB7XG4gICAgICBkaXNtaXNzYWJsZTogdHJ1ZSxcbiAgICAgIGJ1dHRvbnM6IFtcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6IFwiTm8gdGhhbmtzLlwiLFxuICAgICAgICAgIG9uRGlkQ2xpY2s6ICgpID0+IG5vdGlmaWNhdGlvbi5kaXNtaXNzKCksXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiBcIk9LLiBFbmFibGUgaXQgbm93ISFcIixcbiAgICAgICAgICBvbkRpZENsaWNrOiAoKSA9PiB7XG4gICAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQoYGVkaXRvci5zY3JvbGxQYXN0RW5kYCwgdHJ1ZSlcbiAgICAgICAgICAgIG5vdGlmaWNhdGlvbi5kaXNtaXNzKClcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICB9KVxuICB9XG59XG5cbmNsYXNzIFJlZHJhd0N1cnNvckxpbmVBdFRvcCBleHRlbmRzIFJlZHJhd0N1cnNvckxpbmUge30gLy8genRcbmNsYXNzIFJlZHJhd0N1cnNvckxpbmVBdFRvcEFuZE1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lIGV4dGVuZHMgUmVkcmF3Q3Vyc29yTGluZSB7fSAvLyB6IGVudGVyXG5jbGFzcyBSZWRyYXdDdXJzb3JMaW5lQXRVcHBlck1pZGRsZSBleHRlbmRzIFJlZHJhd0N1cnNvckxpbmUge30gLy8genVcbmNsYXNzIFJlZHJhd0N1cnNvckxpbmVBdFVwcGVyTWlkZGxlQW5kTW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmUgZXh0ZW5kcyBSZWRyYXdDdXJzb3JMaW5lIHt9IC8vIHogc3BhY2VcbmNsYXNzIFJlZHJhd0N1cnNvckxpbmVBdE1pZGRsZSBleHRlbmRzIFJlZHJhd0N1cnNvckxpbmUge30gLy8geiB6XG5jbGFzcyBSZWRyYXdDdXJzb3JMaW5lQXRNaWRkbGVBbmRNb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZSBleHRlbmRzIFJlZHJhd0N1cnNvckxpbmUge30gLy8geiAuXG5jbGFzcyBSZWRyYXdDdXJzb3JMaW5lQXRCb3R0b20gZXh0ZW5kcyBSZWRyYXdDdXJzb3JMaW5lIHt9IC8vIHogYlxuY2xhc3MgUmVkcmF3Q3Vyc29yTGluZUF0Qm90dG9tQW5kTW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmUgZXh0ZW5kcyBSZWRyYXdDdXJzb3JMaW5lIHt9IC8vIHogLVxuXG4vLyBIb3Jpem9udGFsIFNjcm9sbCB3aXRob3V0IGNoYW5naW5nIGN1cnNvciBwb3NpdGlvblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8genNcbmNsYXNzIFNjcm9sbEN1cnNvclRvTGVmdCBleHRlbmRzIE1pc2NDb21tYW5kIHtcbiAgd2hpY2ggPSBcImxlZnRcIlxuICBleGVjdXRlKCkge1xuICAgIGNvbnN0IHRyYW5zbGF0aW9uID0gdGhpcy53aGljaCA9PT0gXCJsZWZ0XCIgPyBbMCwgMF0gOiBbMCwgMV1cbiAgICBjb25zdCBzY3JlZW5Qb3NpdGlvbiA9IHRoaXMuZWRpdG9yLmdldEN1cnNvclNjcmVlblBvc2l0aW9uKCkudHJhbnNsYXRlKHRyYW5zbGF0aW9uKVxuICAgIGNvbnN0IHBpeGVsID0gdGhpcy5lZGl0b3JFbGVtZW50LnBpeGVsUG9zaXRpb25Gb3JTY3JlZW5Qb3NpdGlvbihzY3JlZW5Qb3NpdGlvbilcbiAgICBpZiAodGhpcy53aGljaCA9PT0gXCJsZWZ0XCIpIHtcbiAgICAgIHRoaXMuZWRpdG9yRWxlbWVudC5zZXRTY3JvbGxMZWZ0KHBpeGVsLmxlZnQpXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZWRpdG9yRWxlbWVudC5zZXRTY3JvbGxSaWdodChwaXhlbC5sZWZ0KVxuICAgICAgdGhpcy5lZGl0b3IuY29tcG9uZW50LnVwZGF0ZVN5bmMoKSAvLyBGSVhNRTogVGhpcyBpcyBuZWNlc3NhcnkgbWF5YmUgYmVjYXVzZSBvZiBidWcgb2YgYXRvbS1jb3JlLlxuICAgIH1cbiAgfVxufVxuXG4vLyB6ZVxuY2xhc3MgU2Nyb2xsQ3Vyc29yVG9SaWdodCBleHRlbmRzIFNjcm9sbEN1cnNvclRvTGVmdCB7XG4gIHdoaWNoID0gXCJyaWdodFwiXG59XG5cbi8vIGluc2VydC1tb2RlIHNwZWNpZmljIGNvbW1hbmRzXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBJbnNlcnRNb2RlIGV4dGVuZHMgTWlzY0NvbW1hbmQge30gLy8ganVzdCBuYW1lc3BhY2VcblxuY2xhc3MgQWN0aXZhdGVOb3JtYWxNb2RlT25jZSBleHRlbmRzIEluc2VydE1vZGUge1xuICBleGVjdXRlKCkge1xuICAgIGNvbnN0IGN1cnNvcnNUb01vdmVSaWdodCA9IHRoaXMuZWRpdG9yLmdldEN1cnNvcnMoKS5maWx0ZXIoY3Vyc29yID0+ICFjdXJzb3IuaXNBdEJlZ2lubmluZ09mTGluZSgpKVxuICAgIHRoaXMudmltU3RhdGUuYWN0aXZhdGUoXCJub3JtYWxcIilcbiAgICBmb3IgKGNvbnN0IGN1cnNvciBvZiBjdXJzb3JzVG9Nb3ZlUmlnaHQpIHtcbiAgICAgIHRoaXMudXRpbHMubW92ZUN1cnNvclJpZ2h0KGN1cnNvcilcbiAgICB9XG5cbiAgICBjb25zdCBkaXNwb3NhYmxlID0gYXRvbS5jb21tYW5kcy5vbkRpZERpc3BhdGNoKGV2ZW50ID0+IHtcbiAgICAgIGlmIChldmVudC50eXBlICE9PSB0aGlzLmdldENvbW1hbmROYW1lKCkpIHtcbiAgICAgICAgZGlzcG9zYWJsZS5kaXNwb3NlKClcbiAgICAgICAgdGhpcy52aW1TdGF0ZS5hY3RpdmF0ZShcImluc2VydFwiKVxuICAgICAgfVxuICAgIH0pXG4gIH1cbn1cblxuY2xhc3MgSW5zZXJ0UmVnaXN0ZXIgZXh0ZW5kcyBJbnNlcnRNb2RlIHtcbiAgYXN5bmMgZXhlY3V0ZSgpIHtcbiAgICBjb25zdCBpbnB1dCA9IGF3YWl0IHRoaXMucmVhZENoYXJQcm9taXNlZCgpXG4gICAgaWYgKGlucHV0KSB7XG4gICAgICB0aGlzLmVkaXRvci50cmFuc2FjdCgoKSA9PiB7XG4gICAgICAgIGZvciAoY29uc3Qgc2VsZWN0aW9uIG9mIHRoaXMuZWRpdG9yLmdldFNlbGVjdGlvbnMoKSkge1xuICAgICAgICAgIHNlbGVjdGlvbi5pbnNlcnRUZXh0KHRoaXMudmltU3RhdGUucmVnaXN0ZXIuZ2V0VGV4dChpbnB1dCwgc2VsZWN0aW9uKSlcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9XG4gIH1cbn1cblxuY2xhc3MgSW5zZXJ0TGFzdEluc2VydGVkIGV4dGVuZHMgSW5zZXJ0TW9kZSB7XG4gIGV4ZWN1dGUoKSB7XG4gICAgdGhpcy5lZGl0b3IuaW5zZXJ0VGV4dCh0aGlzLnZpbVN0YXRlLnJlZ2lzdGVyLmdldFRleHQoXCIuXCIpKVxuICB9XG59XG5cbmNsYXNzIENvcHlGcm9tTGluZUFib3ZlIGV4dGVuZHMgSW5zZXJ0TW9kZSB7XG4gIHJvd0RlbHRhID0gLTFcblxuICBleGVjdXRlKCkge1xuICAgIGNvbnN0IHRyYW5zbGF0aW9uID0gW3RoaXMucm93RGVsdGEsIDBdXG4gICAgdGhpcy5lZGl0b3IudHJhbnNhY3QoKCkgPT4ge1xuICAgICAgZm9yIChjb25zdCBzZWxlY3Rpb24gb2YgdGhpcy5lZGl0b3IuZ2V0U2VsZWN0aW9ucygpKSB7XG4gICAgICAgIGNvbnN0IHBvaW50ID0gc2VsZWN0aW9uLmN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpLnRyYW5zbGF0ZSh0cmFuc2xhdGlvbilcbiAgICAgICAgaWYgKHBvaW50LnJvdyA+PSAwKSB7XG4gICAgICAgICAgY29uc3QgcmFuZ2UgPSBSYW5nZS5mcm9tUG9pbnRXaXRoRGVsdGEocG9pbnQsIDAsIDEpXG4gICAgICAgICAgY29uc3QgdGV4dCA9IHRoaXMuZWRpdG9yLmdldFRleHRJbkJ1ZmZlclJhbmdlKHJhbmdlKVxuICAgICAgICAgIGlmICh0ZXh0KSBzZWxlY3Rpb24uaW5zZXJ0VGV4dCh0ZXh0KVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgfVxufVxuXG5jbGFzcyBDb3B5RnJvbUxpbmVCZWxvdyBleHRlbmRzIENvcHlGcm9tTGluZUFib3ZlIHtcbiAgcm93RGVsdGEgPSArMVxufVxuXG5jbGFzcyBOZXh0VGFiIGV4dGVuZHMgTWlzY0NvbW1hbmQge1xuICBkZWZhdWx0Q291bnQgPSAwXG5cbiAgZXhlY3V0ZSgpIHtcbiAgICBjb25zdCBjb3VudCA9IHRoaXMuZ2V0Q291bnQoKVxuICAgIGNvbnN0IHBhbmUgPSBhdG9tLndvcmtzcGFjZS5wYW5lRm9ySXRlbSh0aGlzLmVkaXRvcilcblxuICAgIGlmIChjb3VudCkgcGFuZS5hY3RpdmF0ZUl0ZW1BdEluZGV4KGNvdW50IC0gMSlcbiAgICBlbHNlIHBhbmUuYWN0aXZhdGVOZXh0SXRlbSgpXG4gIH1cbn1cblxuY2xhc3MgUHJldmlvdXNUYWIgZXh0ZW5kcyBNaXNjQ29tbWFuZCB7XG4gIGV4ZWN1dGUoKSB7XG4gICAgYXRvbS53b3Jrc3BhY2UucGFuZUZvckl0ZW0odGhpcy5lZGl0b3IpLmFjdGl2YXRlUHJldmlvdXNJdGVtKClcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgTWlzY0NvbW1hbmQsXG4gIE1hcmssXG4gIFJldmVyc2VTZWxlY3Rpb25zLFxuICBCbG9ja3dpc2VPdGhlckVuZCxcbiAgVW5kbyxcbiAgUmVkbyxcbiAgRm9sZEN1cnJlbnRSb3csXG4gIFVuZm9sZEN1cnJlbnRSb3csXG4gIFRvZ2dsZUZvbGQsXG4gIEZvbGRDdXJyZW50Um93UmVjdXJzaXZlbHlCYXNlLFxuICBGb2xkQ3VycmVudFJvd1JlY3Vyc2l2ZWx5LFxuICBVbmZvbGRDdXJyZW50Um93UmVjdXJzaXZlbHksXG4gIFRvZ2dsZUZvbGRSZWN1cnNpdmVseSxcbiAgVW5mb2xkQWxsLFxuICBGb2xkQWxsLFxuICBVbmZvbGROZXh0SW5kZW50TGV2ZWwsXG4gIEZvbGROZXh0SW5kZW50TGV2ZWwsXG4gIE1pbmlTY3JvbGxEb3duLFxuICBNaW5pU2Nyb2xsVXAsXG4gIFJlZHJhd0N1cnNvckxpbmUsXG4gIFJlZHJhd0N1cnNvckxpbmVBdFRvcCxcbiAgUmVkcmF3Q3Vyc29yTGluZUF0VG9wQW5kTW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmUsXG4gIFJlZHJhd0N1cnNvckxpbmVBdFVwcGVyTWlkZGxlLFxuICBSZWRyYXdDdXJzb3JMaW5lQXRVcHBlck1pZGRsZUFuZE1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lLFxuICBSZWRyYXdDdXJzb3JMaW5lQXRNaWRkbGUsXG4gIFJlZHJhd0N1cnNvckxpbmVBdE1pZGRsZUFuZE1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lLFxuICBSZWRyYXdDdXJzb3JMaW5lQXRCb3R0b20sXG4gIFJlZHJhd0N1cnNvckxpbmVBdEJvdHRvbUFuZE1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lLFxuICBTY3JvbGxDdXJzb3JUb0xlZnQsXG4gIFNjcm9sbEN1cnNvclRvUmlnaHQsXG4gIEFjdGl2YXRlTm9ybWFsTW9kZU9uY2UsXG4gIEluc2VydFJlZ2lzdGVyLFxuICBJbnNlcnRMYXN0SW5zZXJ0ZWQsXG4gIENvcHlGcm9tTGluZUFib3ZlLFxuICBDb3B5RnJvbUxpbmVCZWxvdyxcbiAgTmV4dFRhYixcbiAgUHJldmlvdXNUYWIsXG59XG4iXX0=