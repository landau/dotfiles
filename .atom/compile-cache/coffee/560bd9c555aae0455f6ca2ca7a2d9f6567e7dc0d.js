(function() {
  var ActivateNormalModeOnce, Base, BlockwiseOtherEnd, CopyFromLineAbove, CopyFromLineBelow, FoldAll, FoldCurrentRow, FoldCurrentRowRecursively, FoldCurrentRowRecursivelyBase, FoldNextIndentLevel, InsertLastInserted, InsertMode, InsertRegister, Mark, MiscCommand, NextTab, Point, PreviousTab, Range, Redo, ReplaceModeBackspace, ReverseSelections, ScrollCursor, ScrollCursorToBottom, ScrollCursorToBottomLeave, ScrollCursorToLeft, ScrollCursorToMiddle, ScrollCursorToMiddleLeave, ScrollCursorToRight, ScrollCursorToTop, ScrollCursorToTopLeave, ScrollDown, ScrollUp, ScrollWithoutChangingCursorPosition, ToggleFold, ToggleFoldRecursively, Undo, UnfoldAll, UnfoldCurrentRow, UnfoldCurrentRowRecursively, UnfoldNextIndentLevel, _, findRangeContainsPoint, getFoldInfoByKind, getFoldRowRangesContainedByFoldStartsAtRow, humanizeBufferRange, isLeadingWhiteSpaceRange, isLinewiseRange, isSingleLineRange, limitNumber, moveCursorRight, ref, ref1, setBufferRow, sortRanges,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  ref = require('atom'), Range = ref.Range, Point = ref.Point;

  Base = require('./base');

  _ = require('underscore-plus');

  ref1 = require('./utils'), moveCursorRight = ref1.moveCursorRight, isLinewiseRange = ref1.isLinewiseRange, setBufferRow = ref1.setBufferRow, sortRanges = ref1.sortRanges, findRangeContainsPoint = ref1.findRangeContainsPoint, isSingleLineRange = ref1.isSingleLineRange, isLeadingWhiteSpaceRange = ref1.isLeadingWhiteSpaceRange, humanizeBufferRange = ref1.humanizeBufferRange, getFoldInfoByKind = ref1.getFoldInfoByKind, limitNumber = ref1.limitNumber, getFoldRowRangesContainedByFoldStartsAtRow = ref1.getFoldRowRangesContainedByFoldStartsAtRow;

  MiscCommand = (function(superClass) {
    extend(MiscCommand, superClass);

    MiscCommand.extend(false);

    MiscCommand.operationKind = 'misc-command';

    function MiscCommand() {
      MiscCommand.__super__.constructor.apply(this, arguments);
      this.initialize();
    }

    return MiscCommand;

  })(Base);

  Mark = (function(superClass) {
    extend(Mark, superClass);

    function Mark() {
      return Mark.__super__.constructor.apply(this, arguments);
    }

    Mark.extend();

    Mark.prototype.requireInput = true;

    Mark.prototype.initialize = function() {
      this.focusInput();
      return Mark.__super__.initialize.apply(this, arguments);
    };

    Mark.prototype.execute = function() {
      this.vimState.mark.set(this.input, this.editor.getCursorBufferPosition());
      return this.activateMode('normal');
    };

    return Mark;

  })(MiscCommand);

  ReverseSelections = (function(superClass) {
    extend(ReverseSelections, superClass);

    function ReverseSelections() {
      return ReverseSelections.__super__.constructor.apply(this, arguments);
    }

    ReverseSelections.extend();

    ReverseSelections.prototype.execute = function() {
      this.swrap.setReversedState(this.editor, !this.editor.getLastSelection().isReversed());
      if (this.isMode('visual', 'blockwise')) {
        return this.getLastBlockwiseSelection().autoscroll();
      }
    };

    return ReverseSelections;

  })(MiscCommand);

  BlockwiseOtherEnd = (function(superClass) {
    extend(BlockwiseOtherEnd, superClass);

    function BlockwiseOtherEnd() {
      return BlockwiseOtherEnd.__super__.constructor.apply(this, arguments);
    }

    BlockwiseOtherEnd.extend();

    BlockwiseOtherEnd.prototype.execute = function() {
      var blockwiseSelection, i, len, ref2;
      ref2 = this.getBlockwiseSelections();
      for (i = 0, len = ref2.length; i < len; i++) {
        blockwiseSelection = ref2[i];
        blockwiseSelection.reverse();
      }
      return BlockwiseOtherEnd.__super__.execute.apply(this, arguments);
    };

    return BlockwiseOtherEnd;

  })(ReverseSelections);

  Undo = (function(superClass) {
    extend(Undo, superClass);

    function Undo() {
      return Undo.__super__.constructor.apply(this, arguments);
    }

    Undo.extend();

    Undo.prototype.setCursorPosition = function(arg) {
      var changedRange, lastCursor, newRanges, oldRanges, strategy;
      newRanges = arg.newRanges, oldRanges = arg.oldRanges, strategy = arg.strategy;
      lastCursor = this.editor.getLastCursor();
      if (strategy === 'smart') {
        changedRange = findRangeContainsPoint(newRanges, lastCursor.getBufferPosition());
      } else {
        changedRange = sortRanges(newRanges.concat(oldRanges))[0];
      }
      if (changedRange != null) {
        if (isLinewiseRange(changedRange)) {
          return setBufferRow(lastCursor, changedRange.start.row);
        } else {
          return lastCursor.setBufferPosition(changedRange.start);
        }
      }
    };

    Undo.prototype.mutateWithTrackChanges = function() {
      var disposable, newRanges, oldRanges;
      newRanges = [];
      oldRanges = [];
      disposable = this.editor.getBuffer().onDidChange(function(arg) {
        var newRange, oldRange;
        newRange = arg.newRange, oldRange = arg.oldRange;
        if (newRange.isEmpty()) {
          return oldRanges.push(oldRange);
        } else {
          return newRanges.push(newRange);
        }
      });
      this.mutate();
      disposable.dispose();
      return {
        newRanges: newRanges,
        oldRanges: oldRanges
      };
    };

    Undo.prototype.flashChanges = function(arg) {
      var isMultipleSingleLineRanges, newRanges, oldRanges;
      newRanges = arg.newRanges, oldRanges = arg.oldRanges;
      isMultipleSingleLineRanges = function(ranges) {
        return ranges.length > 1 && ranges.every(isSingleLineRange);
      };
      if (newRanges.length > 0) {
        if (this.isMultipleAndAllRangeHaveSameColumnAndConsecutiveRows(newRanges)) {
          return;
        }
        newRanges = newRanges.map((function(_this) {
          return function(range) {
            return humanizeBufferRange(_this.editor, range);
          };
        })(this));
        newRanges = this.filterNonLeadingWhiteSpaceRange(newRanges);
        if (isMultipleSingleLineRanges(newRanges)) {
          return this.flash(newRanges, {
            type: 'undo-redo-multiple-changes'
          });
        } else {
          return this.flash(newRanges, {
            type: 'undo-redo'
          });
        }
      } else {
        if (this.isMultipleAndAllRangeHaveSameColumnAndConsecutiveRows(oldRanges)) {
          return;
        }
        if (isMultipleSingleLineRanges(oldRanges)) {
          oldRanges = this.filterNonLeadingWhiteSpaceRange(oldRanges);
          return this.flash(oldRanges, {
            type: 'undo-redo-multiple-delete'
          });
        }
      }
    };

    Undo.prototype.filterNonLeadingWhiteSpaceRange = function(ranges) {
      return ranges.filter((function(_this) {
        return function(range) {
          return !isLeadingWhiteSpaceRange(_this.editor, range);
        };
      })(this));
    };

    Undo.prototype.isMultipleAndAllRangeHaveSameColumnAndConsecutiveRows = function(ranges) {
      var end, endColumn, i, len, previousRow, range, ref2, ref3, ref4, start, startColumn;
      if (ranges.length <= 1) {
        return false;
      }
      ref2 = ranges[0], (ref3 = ref2.start, startColumn = ref3.column), (ref4 = ref2.end, endColumn = ref4.column);
      previousRow = null;
      for (i = 0, len = ranges.length; i < len; i++) {
        range = ranges[i];
        start = range.start, end = range.end;
        if (!((start.column === startColumn) && (end.column === endColumn))) {
          return false;
        }
        if ((previousRow != null) && (previousRow + 1 !== start.row)) {
          return false;
        }
        previousRow = start.row;
      }
      return true;
      return ranges.every(function(arg) {
        var end, start;
        start = arg.start, end = arg.end;
        return (start.column === startColumn) && (end.column === endColumn);
      });
    };

    Undo.prototype.flash = function(flashRanges, options) {
      if (options.timeout == null) {
        options.timeout = 500;
      }
      return this.onDidFinishOperation((function(_this) {
        return function() {
          return _this.vimState.flash(flashRanges, options);
        };
      })(this));
    };

    Undo.prototype.execute = function() {
      var i, len, newRanges, oldRanges, ref2, ref3, selection, strategy;
      ref2 = this.mutateWithTrackChanges(), newRanges = ref2.newRanges, oldRanges = ref2.oldRanges;
      ref3 = this.editor.getSelections();
      for (i = 0, len = ref3.length; i < len; i++) {
        selection = ref3[i];
        selection.clear();
      }
      if (this.getConfig('setCursorToStartOfChangeOnUndoRedo')) {
        strategy = this.getConfig('setCursorToStartOfChangeOnUndoRedoStrategy');
        this.setCursorPosition({
          newRanges: newRanges,
          oldRanges: oldRanges,
          strategy: strategy
        });
        this.vimState.clearSelections();
      }
      if (this.getConfig('flashOnUndoRedo')) {
        this.flashChanges({
          newRanges: newRanges,
          oldRanges: oldRanges
        });
      }
      return this.activateMode('normal');
    };

    Undo.prototype.mutate = function() {
      return this.editor.undo();
    };

    return Undo;

  })(MiscCommand);

  Redo = (function(superClass) {
    extend(Redo, superClass);

    function Redo() {
      return Redo.__super__.constructor.apply(this, arguments);
    }

    Redo.extend();

    Redo.prototype.mutate = function() {
      return this.editor.redo();
    };

    return Redo;

  })(Undo);

  FoldCurrentRow = (function(superClass) {
    extend(FoldCurrentRow, superClass);

    function FoldCurrentRow() {
      return FoldCurrentRow.__super__.constructor.apply(this, arguments);
    }

    FoldCurrentRow.extend();

    FoldCurrentRow.prototype.execute = function() {
      var i, len, ref2, results, row, selection;
      ref2 = this.editor.getSelections();
      results = [];
      for (i = 0, len = ref2.length; i < len; i++) {
        selection = ref2[i];
        row = this.getCursorPositionForSelection(selection).row;
        results.push(this.editor.foldBufferRow(row));
      }
      return results;
    };

    return FoldCurrentRow;

  })(MiscCommand);

  UnfoldCurrentRow = (function(superClass) {
    extend(UnfoldCurrentRow, superClass);

    function UnfoldCurrentRow() {
      return UnfoldCurrentRow.__super__.constructor.apply(this, arguments);
    }

    UnfoldCurrentRow.extend();

    UnfoldCurrentRow.prototype.execute = function() {
      var i, len, ref2, results, row, selection;
      ref2 = this.editor.getSelections();
      results = [];
      for (i = 0, len = ref2.length; i < len; i++) {
        selection = ref2[i];
        row = this.getCursorPositionForSelection(selection).row;
        results.push(this.editor.unfoldBufferRow(row));
      }
      return results;
    };

    return UnfoldCurrentRow;

  })(MiscCommand);

  ToggleFold = (function(superClass) {
    extend(ToggleFold, superClass);

    function ToggleFold() {
      return ToggleFold.__super__.constructor.apply(this, arguments);
    }

    ToggleFold.extend();

    ToggleFold.prototype.execute = function() {
      var point;
      point = this.editor.getCursorBufferPosition();
      return this.editor.toggleFoldAtBufferRow(point.row);
    };

    return ToggleFold;

  })(MiscCommand);

  FoldCurrentRowRecursivelyBase = (function(superClass) {
    extend(FoldCurrentRowRecursivelyBase, superClass);

    function FoldCurrentRowRecursivelyBase() {
      return FoldCurrentRowRecursivelyBase.__super__.constructor.apply(this, arguments);
    }

    FoldCurrentRowRecursivelyBase.extend(false);

    FoldCurrentRowRecursivelyBase.prototype.foldRecursively = function(row) {
      var i, len, ref2, results, rowRanges, startRows;
      rowRanges = getFoldRowRangesContainedByFoldStartsAtRow(this.editor, row);
      if (rowRanges != null) {
        startRows = rowRanges.map(function(rowRange) {
          return rowRange[0];
        });
        ref2 = startRows.reverse();
        results = [];
        for (i = 0, len = ref2.length; i < len; i++) {
          row = ref2[i];
          if (!this.editor.isFoldedAtBufferRow(row)) {
            results.push(this.editor.foldBufferRow(row));
          }
        }
        return results;
      }
    };

    FoldCurrentRowRecursivelyBase.prototype.unfoldRecursively = function(row) {
      var i, len, results, rowRanges, startRows;
      rowRanges = getFoldRowRangesContainedByFoldStartsAtRow(this.editor, row);
      if (rowRanges != null) {
        startRows = rowRanges.map(function(rowRange) {
          return rowRange[0];
        });
        results = [];
        for (i = 0, len = startRows.length; i < len; i++) {
          row = startRows[i];
          if (this.editor.isFoldedAtBufferRow(row)) {
            results.push(this.editor.unfoldBufferRow(row));
          }
        }
        return results;
      }
    };

    FoldCurrentRowRecursivelyBase.prototype.foldRecursivelyForAllSelections = function() {
      var i, len, ref2, results, selection;
      ref2 = this.editor.getSelectionsOrderedByBufferPosition().reverse();
      results = [];
      for (i = 0, len = ref2.length; i < len; i++) {
        selection = ref2[i];
        results.push(this.foldRecursively(this.getCursorPositionForSelection(selection).row));
      }
      return results;
    };

    FoldCurrentRowRecursivelyBase.prototype.unfoldRecursivelyForAllSelections = function() {
      var i, len, ref2, results, selection;
      ref2 = this.editor.getSelectionsOrderedByBufferPosition();
      results = [];
      for (i = 0, len = ref2.length; i < len; i++) {
        selection = ref2[i];
        results.push(this.unfoldRecursively(this.getCursorPositionForSelection(selection).row));
      }
      return results;
    };

    return FoldCurrentRowRecursivelyBase;

  })(MiscCommand);

  FoldCurrentRowRecursively = (function(superClass) {
    extend(FoldCurrentRowRecursively, superClass);

    function FoldCurrentRowRecursively() {
      return FoldCurrentRowRecursively.__super__.constructor.apply(this, arguments);
    }

    FoldCurrentRowRecursively.extend();

    FoldCurrentRowRecursively.prototype.execute = function() {
      return this.foldRecursivelyForAllSelections();
    };

    return FoldCurrentRowRecursively;

  })(FoldCurrentRowRecursivelyBase);

  UnfoldCurrentRowRecursively = (function(superClass) {
    extend(UnfoldCurrentRowRecursively, superClass);

    function UnfoldCurrentRowRecursively() {
      return UnfoldCurrentRowRecursively.__super__.constructor.apply(this, arguments);
    }

    UnfoldCurrentRowRecursively.extend();

    UnfoldCurrentRowRecursively.prototype.execute = function() {
      return this.unfoldRecursivelyForAllSelections();
    };

    return UnfoldCurrentRowRecursively;

  })(FoldCurrentRowRecursivelyBase);

  ToggleFoldRecursively = (function(superClass) {
    extend(ToggleFoldRecursively, superClass);

    function ToggleFoldRecursively() {
      return ToggleFoldRecursively.__super__.constructor.apply(this, arguments);
    }

    ToggleFoldRecursively.extend();

    ToggleFoldRecursively.prototype.execute = function() {
      var row;
      row = this.getCursorPositionForSelection(this.editor.getLastSelection()).row;
      if (this.editor.isFoldedAtBufferRow(row)) {
        return this.unfoldRecursivelyForAllSelections();
      } else {
        return this.foldRecursivelyForAllSelections();
      }
    };

    return ToggleFoldRecursively;

  })(FoldCurrentRowRecursivelyBase);

  UnfoldAll = (function(superClass) {
    extend(UnfoldAll, superClass);

    function UnfoldAll() {
      return UnfoldAll.__super__.constructor.apply(this, arguments);
    }

    UnfoldAll.extend();

    UnfoldAll.prototype.execute = function() {
      return this.editor.unfoldAll();
    };

    return UnfoldAll;

  })(MiscCommand);

  FoldAll = (function(superClass) {
    extend(FoldAll, superClass);

    function FoldAll() {
      return FoldAll.__super__.constructor.apply(this, arguments);
    }

    FoldAll.extend();

    FoldAll.prototype.execute = function() {
      var allFold, endRow, i, indent, len, ref2, ref3, results, startRow;
      allFold = getFoldInfoByKind(this.editor).allFold;
      if (allFold != null) {
        this.editor.unfoldAll();
        ref2 = allFold.rowRangesWithIndent;
        results = [];
        for (i = 0, len = ref2.length; i < len; i++) {
          ref3 = ref2[i], indent = ref3.indent, startRow = ref3.startRow, endRow = ref3.endRow;
          if (indent <= this.getConfig('maxFoldableIndentLevel')) {
            results.push(this.editor.foldBufferRowRange(startRow, endRow));
          } else {
            results.push(void 0);
          }
        }
        return results;
      }
    };

    return FoldAll;

  })(MiscCommand);

  UnfoldNextIndentLevel = (function(superClass) {
    extend(UnfoldNextIndentLevel, superClass);

    function UnfoldNextIndentLevel() {
      return UnfoldNextIndentLevel.__super__.constructor.apply(this, arguments);
    }

    UnfoldNextIndentLevel.extend();

    UnfoldNextIndentLevel.prototype.execute = function() {
      var count, folded, i, indent, j, len, minIndent, ref2, ref3, results, results1, rowRangesWithIndent, startRow, targetIndents;
      folded = getFoldInfoByKind(this.editor).folded;
      if (folded != null) {
        minIndent = folded.minIndent, rowRangesWithIndent = folded.rowRangesWithIndent;
        count = limitNumber(this.getCount() - 1, {
          min: 0
        });
        targetIndents = (function() {
          results = [];
          for (var i = minIndent, ref2 = minIndent + count; minIndent <= ref2 ? i <= ref2 : i >= ref2; minIndent <= ref2 ? i++ : i--){ results.push(i); }
          return results;
        }).apply(this);
        results1 = [];
        for (j = 0, len = rowRangesWithIndent.length; j < len; j++) {
          ref3 = rowRangesWithIndent[j], indent = ref3.indent, startRow = ref3.startRow;
          if (indexOf.call(targetIndents, indent) >= 0) {
            results1.push(this.editor.unfoldBufferRow(startRow));
          } else {
            results1.push(void 0);
          }
        }
        return results1;
      }
    };

    return UnfoldNextIndentLevel;

  })(MiscCommand);

  FoldNextIndentLevel = (function(superClass) {
    extend(FoldNextIndentLevel, superClass);

    function FoldNextIndentLevel() {
      return FoldNextIndentLevel.__super__.constructor.apply(this, arguments);
    }

    FoldNextIndentLevel.extend();

    FoldNextIndentLevel.prototype.execute = function() {
      var allFold, count, endRow, fromLevel, i, indent, j, len, maxFoldable, ref2, ref3, ref4, results, results1, startRow, targetIndents, unfolded;
      ref2 = getFoldInfoByKind(this.editor), unfolded = ref2.unfolded, allFold = ref2.allFold;
      if (unfolded != null) {
        this.editor.unfoldAll();
        maxFoldable = this.getConfig('maxFoldableIndentLevel');
        fromLevel = Math.min(unfolded.maxIndent, maxFoldable);
        count = limitNumber(this.getCount() - 1, {
          min: 0
        });
        fromLevel = limitNumber(fromLevel - count, {
          min: 0
        });
        targetIndents = (function() {
          results = [];
          for (var i = fromLevel; fromLevel <= maxFoldable ? i <= maxFoldable : i >= maxFoldable; fromLevel <= maxFoldable ? i++ : i--){ results.push(i); }
          return results;
        }).apply(this);
        ref3 = allFold.rowRangesWithIndent;
        results1 = [];
        for (j = 0, len = ref3.length; j < len; j++) {
          ref4 = ref3[j], indent = ref4.indent, startRow = ref4.startRow, endRow = ref4.endRow;
          if (indexOf.call(targetIndents, indent) >= 0) {
            results1.push(this.editor.foldBufferRowRange(startRow, endRow));
          } else {
            results1.push(void 0);
          }
        }
        return results1;
      }
    };

    return FoldNextIndentLevel;

  })(MiscCommand);

  ReplaceModeBackspace = (function(superClass) {
    extend(ReplaceModeBackspace, superClass);

    function ReplaceModeBackspace() {
      return ReplaceModeBackspace.__super__.constructor.apply(this, arguments);
    }

    ReplaceModeBackspace.commandScope = 'atom-text-editor.vim-mode-plus.insert-mode.replace';

    ReplaceModeBackspace.extend();

    ReplaceModeBackspace.prototype.execute = function() {
      var char, i, len, ref2, results, selection;
      ref2 = this.editor.getSelections();
      results = [];
      for (i = 0, len = ref2.length; i < len; i++) {
        selection = ref2[i];
        char = this.vimState.modeManager.getReplacedCharForSelection(selection);
        if (char != null) {
          selection.selectLeft();
          if (!selection.insertText(char).isEmpty()) {
            results.push(selection.cursor.moveLeft());
          } else {
            results.push(void 0);
          }
        } else {
          results.push(void 0);
        }
      }
      return results;
    };

    return ReplaceModeBackspace;

  })(MiscCommand);

  ScrollWithoutChangingCursorPosition = (function(superClass) {
    extend(ScrollWithoutChangingCursorPosition, superClass);

    function ScrollWithoutChangingCursorPosition() {
      return ScrollWithoutChangingCursorPosition.__super__.constructor.apply(this, arguments);
    }

    ScrollWithoutChangingCursorPosition.extend(false);

    ScrollWithoutChangingCursorPosition.prototype.scrolloff = 2;

    ScrollWithoutChangingCursorPosition.prototype.cursorPixel = null;

    ScrollWithoutChangingCursorPosition.prototype.getFirstVisibleScreenRow = function() {
      return this.editorElement.getFirstVisibleScreenRow();
    };

    ScrollWithoutChangingCursorPosition.prototype.getLastVisibleScreenRow = function() {
      return this.editorElement.getLastVisibleScreenRow();
    };

    ScrollWithoutChangingCursorPosition.prototype.getLastScreenRow = function() {
      return this.editor.getLastScreenRow();
    };

    ScrollWithoutChangingCursorPosition.prototype.getCursorPixel = function() {
      var point;
      point = this.editor.getCursorScreenPosition();
      return this.editorElement.pixelPositionForScreenPosition(point);
    };

    return ScrollWithoutChangingCursorPosition;

  })(MiscCommand);

  ScrollDown = (function(superClass) {
    extend(ScrollDown, superClass);

    function ScrollDown() {
      return ScrollDown.__super__.constructor.apply(this, arguments);
    }

    ScrollDown.extend();

    ScrollDown.prototype.execute = function() {
      var column, count, newFirstRow, newPoint, offset, oldFirstRow, ref2, row;
      count = this.getCount();
      oldFirstRow = this.editor.getFirstVisibleScreenRow();
      this.editor.setFirstVisibleScreenRow(oldFirstRow + count);
      newFirstRow = this.editor.getFirstVisibleScreenRow();
      offset = 2;
      ref2 = this.editor.getCursorScreenPosition(), row = ref2.row, column = ref2.column;
      if (row < (newFirstRow + offset)) {
        newPoint = [row + count, column];
        return this.editor.setCursorScreenPosition(newPoint, {
          autoscroll: false
        });
      }
    };

    return ScrollDown;

  })(ScrollWithoutChangingCursorPosition);

  ScrollUp = (function(superClass) {
    extend(ScrollUp, superClass);

    function ScrollUp() {
      return ScrollUp.__super__.constructor.apply(this, arguments);
    }

    ScrollUp.extend();

    ScrollUp.prototype.execute = function() {
      var column, count, newLastRow, newPoint, offset, oldFirstRow, ref2, row;
      count = this.getCount();
      oldFirstRow = this.editor.getFirstVisibleScreenRow();
      this.editor.setFirstVisibleScreenRow(oldFirstRow - count);
      newLastRow = this.editor.getLastVisibleScreenRow();
      offset = 2;
      ref2 = this.editor.getCursorScreenPosition(), row = ref2.row, column = ref2.column;
      if (row >= (newLastRow - offset)) {
        newPoint = [row - count, column];
        return this.editor.setCursorScreenPosition(newPoint, {
          autoscroll: false
        });
      }
    };

    return ScrollUp;

  })(ScrollWithoutChangingCursorPosition);

  ScrollCursor = (function(superClass) {
    extend(ScrollCursor, superClass);

    function ScrollCursor() {
      return ScrollCursor.__super__.constructor.apply(this, arguments);
    }

    ScrollCursor.extend(false);

    ScrollCursor.prototype.execute = function() {
      if (typeof this.moveToFirstCharacterOfLine === "function") {
        this.moveToFirstCharacterOfLine();
      }
      if (this.isScrollable()) {
        return this.editorElement.setScrollTop(this.getScrollTop());
      }
    };

    ScrollCursor.prototype.moveToFirstCharacterOfLine = function() {
      return this.editor.moveToFirstCharacterOfLine();
    };

    ScrollCursor.prototype.getOffSetPixelHeight = function(lineDelta) {
      if (lineDelta == null) {
        lineDelta = 0;
      }
      return this.editor.getLineHeightInPixels() * (this.scrolloff + lineDelta);
    };

    return ScrollCursor;

  })(ScrollWithoutChangingCursorPosition);

  ScrollCursorToTop = (function(superClass) {
    extend(ScrollCursorToTop, superClass);

    function ScrollCursorToTop() {
      return ScrollCursorToTop.__super__.constructor.apply(this, arguments);
    }

    ScrollCursorToTop.extend();

    ScrollCursorToTop.prototype.isScrollable = function() {
      return this.getLastVisibleScreenRow() !== this.getLastScreenRow();
    };

    ScrollCursorToTop.prototype.getScrollTop = function() {
      return this.getCursorPixel().top - this.getOffSetPixelHeight();
    };

    return ScrollCursorToTop;

  })(ScrollCursor);

  ScrollCursorToTopLeave = (function(superClass) {
    extend(ScrollCursorToTopLeave, superClass);

    function ScrollCursorToTopLeave() {
      return ScrollCursorToTopLeave.__super__.constructor.apply(this, arguments);
    }

    ScrollCursorToTopLeave.extend();

    ScrollCursorToTopLeave.prototype.moveToFirstCharacterOfLine = null;

    return ScrollCursorToTopLeave;

  })(ScrollCursorToTop);

  ScrollCursorToBottom = (function(superClass) {
    extend(ScrollCursorToBottom, superClass);

    function ScrollCursorToBottom() {
      return ScrollCursorToBottom.__super__.constructor.apply(this, arguments);
    }

    ScrollCursorToBottom.extend();

    ScrollCursorToBottom.prototype.isScrollable = function() {
      return this.getFirstVisibleScreenRow() !== 0;
    };

    ScrollCursorToBottom.prototype.getScrollTop = function() {
      return this.getCursorPixel().top - (this.editorElement.getHeight() - this.getOffSetPixelHeight(1));
    };

    return ScrollCursorToBottom;

  })(ScrollCursor);

  ScrollCursorToBottomLeave = (function(superClass) {
    extend(ScrollCursorToBottomLeave, superClass);

    function ScrollCursorToBottomLeave() {
      return ScrollCursorToBottomLeave.__super__.constructor.apply(this, arguments);
    }

    ScrollCursorToBottomLeave.extend();

    ScrollCursorToBottomLeave.prototype.moveToFirstCharacterOfLine = null;

    return ScrollCursorToBottomLeave;

  })(ScrollCursorToBottom);

  ScrollCursorToMiddle = (function(superClass) {
    extend(ScrollCursorToMiddle, superClass);

    function ScrollCursorToMiddle() {
      return ScrollCursorToMiddle.__super__.constructor.apply(this, arguments);
    }

    ScrollCursorToMiddle.extend();

    ScrollCursorToMiddle.prototype.isScrollable = function() {
      return true;
    };

    ScrollCursorToMiddle.prototype.getScrollTop = function() {
      return this.getCursorPixel().top - (this.editorElement.getHeight() / 2);
    };

    return ScrollCursorToMiddle;

  })(ScrollCursor);

  ScrollCursorToMiddleLeave = (function(superClass) {
    extend(ScrollCursorToMiddleLeave, superClass);

    function ScrollCursorToMiddleLeave() {
      return ScrollCursorToMiddleLeave.__super__.constructor.apply(this, arguments);
    }

    ScrollCursorToMiddleLeave.extend();

    ScrollCursorToMiddleLeave.prototype.moveToFirstCharacterOfLine = null;

    return ScrollCursorToMiddleLeave;

  })(ScrollCursorToMiddle);

  ScrollCursorToLeft = (function(superClass) {
    extend(ScrollCursorToLeft, superClass);

    function ScrollCursorToLeft() {
      return ScrollCursorToLeft.__super__.constructor.apply(this, arguments);
    }

    ScrollCursorToLeft.extend();

    ScrollCursorToLeft.prototype.execute = function() {
      return this.editorElement.setScrollLeft(this.getCursorPixel().left);
    };

    return ScrollCursorToLeft;

  })(ScrollWithoutChangingCursorPosition);

  ScrollCursorToRight = (function(superClass) {
    extend(ScrollCursorToRight, superClass);

    function ScrollCursorToRight() {
      return ScrollCursorToRight.__super__.constructor.apply(this, arguments);
    }

    ScrollCursorToRight.extend();

    ScrollCursorToRight.prototype.execute = function() {
      return this.editorElement.setScrollRight(this.getCursorPixel().left);
    };

    return ScrollCursorToRight;

  })(ScrollCursorToLeft);

  InsertMode = (function(superClass) {
    extend(InsertMode, superClass);

    function InsertMode() {
      return InsertMode.__super__.constructor.apply(this, arguments);
    }

    InsertMode.commandScope = 'atom-text-editor.vim-mode-plus.insert-mode';

    return InsertMode;

  })(MiscCommand);

  ActivateNormalModeOnce = (function(superClass) {
    extend(ActivateNormalModeOnce, superClass);

    function ActivateNormalModeOnce() {
      return ActivateNormalModeOnce.__super__.constructor.apply(this, arguments);
    }

    ActivateNormalModeOnce.extend();

    ActivateNormalModeOnce.prototype.thisCommandName = ActivateNormalModeOnce.getCommandName();

    ActivateNormalModeOnce.prototype.execute = function() {
      var cursor, cursorsToMoveRight, disposable, i, len;
      cursorsToMoveRight = this.editor.getCursors().filter(function(cursor) {
        return !cursor.isAtBeginningOfLine();
      });
      this.vimState.activate('normal');
      for (i = 0, len = cursorsToMoveRight.length; i < len; i++) {
        cursor = cursorsToMoveRight[i];
        moveCursorRight(cursor);
      }
      return disposable = atom.commands.onDidDispatch((function(_this) {
        return function(arg) {
          var type;
          type = arg.type;
          if (type === _this.thisCommandName) {
            return;
          }
          disposable.dispose();
          disposable = null;
          return _this.vimState.activate('insert');
        };
      })(this));
    };

    return ActivateNormalModeOnce;

  })(InsertMode);

  InsertRegister = (function(superClass) {
    extend(InsertRegister, superClass);

    function InsertRegister() {
      return InsertRegister.__super__.constructor.apply(this, arguments);
    }

    InsertRegister.extend();

    InsertRegister.prototype.requireInput = true;

    InsertRegister.prototype.initialize = function() {
      InsertRegister.__super__.initialize.apply(this, arguments);
      return this.focusInput();
    };

    InsertRegister.prototype.execute = function() {
      return this.editor.transact((function(_this) {
        return function() {
          var i, len, ref2, results, selection, text;
          ref2 = _this.editor.getSelections();
          results = [];
          for (i = 0, len = ref2.length; i < len; i++) {
            selection = ref2[i];
            text = _this.vimState.register.getText(_this.input, selection);
            results.push(selection.insertText(text));
          }
          return results;
        };
      })(this));
    };

    return InsertRegister;

  })(InsertMode);

  InsertLastInserted = (function(superClass) {
    extend(InsertLastInserted, superClass);

    function InsertLastInserted() {
      return InsertLastInserted.__super__.constructor.apply(this, arguments);
    }

    InsertLastInserted.extend();

    InsertLastInserted.description = "Insert text inserted in latest insert-mode.\nEquivalent to *i_CTRL-A* of pure Vim";

    InsertLastInserted.prototype.execute = function() {
      var text;
      text = this.vimState.register.getText('.');
      return this.editor.insertText(text);
    };

    return InsertLastInserted;

  })(InsertMode);

  CopyFromLineAbove = (function(superClass) {
    extend(CopyFromLineAbove, superClass);

    function CopyFromLineAbove() {
      return CopyFromLineAbove.__super__.constructor.apply(this, arguments);
    }

    CopyFromLineAbove.extend();

    CopyFromLineAbove.description = "Insert character of same-column of above line.\nEquivalent to *i_CTRL-Y* of pure Vim";

    CopyFromLineAbove.prototype.rowDelta = -1;

    CopyFromLineAbove.prototype.execute = function() {
      var translation;
      translation = [this.rowDelta, 0];
      return this.editor.transact((function(_this) {
        return function() {
          var i, len, point, range, ref2, results, selection, text;
          ref2 = _this.editor.getSelections();
          results = [];
          for (i = 0, len = ref2.length; i < len; i++) {
            selection = ref2[i];
            point = selection.cursor.getBufferPosition().translate(translation);
            if (point.row < 0) {
              continue;
            }
            range = Range.fromPointWithDelta(point, 0, 1);
            if (text = _this.editor.getTextInBufferRange(range)) {
              results.push(selection.insertText(text));
            } else {
              results.push(void 0);
            }
          }
          return results;
        };
      })(this));
    };

    return CopyFromLineAbove;

  })(InsertMode);

  CopyFromLineBelow = (function(superClass) {
    extend(CopyFromLineBelow, superClass);

    function CopyFromLineBelow() {
      return CopyFromLineBelow.__super__.constructor.apply(this, arguments);
    }

    CopyFromLineBelow.extend();

    CopyFromLineBelow.description = "Insert character of same-column of above line.\nEquivalent to *i_CTRL-E* of pure Vim";

    CopyFromLineBelow.prototype.rowDelta = +1;

    return CopyFromLineBelow;

  })(CopyFromLineAbove);

  NextTab = (function(superClass) {
    extend(NextTab, superClass);

    function NextTab() {
      return NextTab.__super__.constructor.apply(this, arguments);
    }

    NextTab.extend();

    NextTab.prototype.defaultCount = 0;

    NextTab.prototype.execute = function() {
      var count, pane;
      count = this.getCount();
      pane = atom.workspace.paneForItem(this.editor);
      if (count) {
        return pane.activateItemAtIndex(count - 1);
      } else {
        return pane.activateNextItem();
      }
    };

    return NextTab;

  })(MiscCommand);

  PreviousTab = (function(superClass) {
    extend(PreviousTab, superClass);

    function PreviousTab() {
      return PreviousTab.__super__.constructor.apply(this, arguments);
    }

    PreviousTab.extend();

    PreviousTab.prototype.execute = function() {
      var pane;
      pane = atom.workspace.paneForItem(this.editor);
      return pane.activatePreviousItem();
    };

    return PreviousTab;

  })(MiscCommand);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvbWlzYy1jb21tYW5kLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsNDdCQUFBO0lBQUE7Ozs7RUFBQSxNQUFpQixPQUFBLENBQVEsTUFBUixDQUFqQixFQUFDLGlCQUFELEVBQVE7O0VBQ1IsSUFBQSxHQUFPLE9BQUEsQ0FBUSxRQUFSOztFQUNQLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVI7O0VBRUosT0FZSSxPQUFBLENBQVEsU0FBUixDQVpKLEVBQ0Usc0NBREYsRUFFRSxzQ0FGRixFQUdFLGdDQUhGLEVBSUUsNEJBSkYsRUFLRSxvREFMRixFQU1FLDBDQU5GLEVBT0Usd0RBUEYsRUFRRSw4Q0FSRixFQVNFLDBDQVRGLEVBVUUsOEJBVkYsRUFXRTs7RUFHSTs7O0lBQ0osV0FBQyxDQUFBLE1BQUQsQ0FBUSxLQUFSOztJQUNBLFdBQUMsQ0FBQSxhQUFELEdBQWdCOztJQUNILHFCQUFBO01BQ1gsOENBQUEsU0FBQTtNQUNBLElBQUMsQ0FBQSxVQUFELENBQUE7SUFGVzs7OztLQUhXOztFQU9wQjs7Ozs7OztJQUNKLElBQUMsQ0FBQSxNQUFELENBQUE7O21CQUNBLFlBQUEsR0FBYzs7bUJBQ2QsVUFBQSxHQUFZLFNBQUE7TUFDVixJQUFDLENBQUEsVUFBRCxDQUFBO2FBQ0Esc0NBQUEsU0FBQTtJQUZVOzttQkFJWixPQUFBLEdBQVMsU0FBQTtNQUNQLElBQUMsQ0FBQSxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQWYsQ0FBbUIsSUFBQyxDQUFBLEtBQXBCLEVBQTJCLElBQUMsQ0FBQSxNQUFNLENBQUMsdUJBQVIsQ0FBQSxDQUEzQjthQUNBLElBQUMsQ0FBQSxZQUFELENBQWMsUUFBZDtJQUZPOzs7O0tBUFE7O0VBV2I7Ozs7Ozs7SUFDSixpQkFBQyxDQUFBLE1BQUQsQ0FBQTs7Z0NBQ0Es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QVMsQ0FBQyxVQUFWLENBQXFCLElBQXJCLEdBREY7YUFBQSxNQUFBO21DQUFBOztBQUpGOztRQURlO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFqQjtJQUZPOzs7O0tBUnFCOztFQWtCMUI7Ozs7Ozs7SUFDSixpQkFBQyxDQUFBLE1BQUQsQ0FBQTs7SUFDQSxpQkFBQyxDQUFBLFdBQUQsR0FBYzs7Z0NBSWQsUUFBQSxHQUFVLENBQUM7Ozs7S0FObUI7O0VBUTFCOzs7Ozs7O0lBQ0osT0FBQyxDQUFBLE1BQUQsQ0FBQTs7c0JBQ0EsWUFBQSxHQUFjOztzQkFDZCxPQUFBLEdBQVMsU0FBQTtBQUNQLFVBQUE7TUFBQSxLQUFBLEdBQVEsSUFBQyxDQUFBLFFBQUQsQ0FBQTtNQUNSLElBQUEsR0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQWYsQ0FBMkIsSUFBQyxDQUFBLE1BQTVCO01BQ1AsSUFBRyxLQUFIO2VBQ0UsSUFBSSxDQUFDLG1CQUFMLENBQXlCLEtBQUEsR0FBUSxDQUFqQyxFQURGO09BQUEsTUFBQTtlQUdFLElBQUksQ0FBQyxnQkFBTCxDQUFBLEVBSEY7O0lBSE87Ozs7S0FIVzs7RUFXaEI7Ozs7Ozs7SUFDSixXQUFDLENBQUEsTUFBRCxDQUFBOzswQkFDQSxPQUFBLEdBQVMsU0FBQTtBQUNQLFVBQUE7TUFBQSxJQUFBLEdBQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFmLENBQTJCLElBQUMsQ0FBQSxNQUE1QjthQUNQLElBQUksQ0FBQyxvQkFBTCxDQUFBO0lBRk87Ozs7S0FGZTtBQWxmMUIiLCJzb3VyY2VzQ29udGVudCI6WyJ7UmFuZ2UsIFBvaW50fSA9IHJlcXVpcmUgJ2F0b20nXG5CYXNlID0gcmVxdWlyZSAnLi9iYXNlJ1xuXyA9IHJlcXVpcmUgJ3VuZGVyc2NvcmUtcGx1cydcblxue1xuICBtb3ZlQ3Vyc29yUmlnaHRcbiAgaXNMaW5ld2lzZVJhbmdlXG4gIHNldEJ1ZmZlclJvd1xuICBzb3J0UmFuZ2VzXG4gIGZpbmRSYW5nZUNvbnRhaW5zUG9pbnRcbiAgaXNTaW5nbGVMaW5lUmFuZ2VcbiAgaXNMZWFkaW5nV2hpdGVTcGFjZVJhbmdlXG4gIGh1bWFuaXplQnVmZmVyUmFuZ2VcbiAgZ2V0Rm9sZEluZm9CeUtpbmRcbiAgbGltaXROdW1iZXJcbiAgZ2V0Rm9sZFJvd1Jhbmdlc0NvbnRhaW5lZEJ5Rm9sZFN0YXJ0c0F0Um93XG59ID0gcmVxdWlyZSAnLi91dGlscydcblxuY2xhc3MgTWlzY0NvbW1hbmQgZXh0ZW5kcyBCYXNlXG4gIEBleHRlbmQoZmFsc2UpXG4gIEBvcGVyYXRpb25LaW5kOiAnbWlzYy1jb21tYW5kJ1xuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBzdXBlclxuICAgIEBpbml0aWFsaXplKClcblxuY2xhc3MgTWFyayBleHRlbmRzIE1pc2NDb21tYW5kXG4gIEBleHRlbmQoKVxuICByZXF1aXJlSW5wdXQ6IHRydWVcbiAgaW5pdGlhbGl6ZTogLT5cbiAgICBAZm9jdXNJbnB1dCgpXG4gICAgc3VwZXJcblxuICBleGVjdXRlOiAtPlxuICAgIEB2aW1TdGF0ZS5tYXJrLnNldChAaW5wdXQsIEBlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKSlcbiAgICBAYWN0aXZhdGVNb2RlKCdub3JtYWwnKVxuXG5jbGFzcyBSZXZlcnNlU2VsZWN0aW9ucyBleHRlbmRzIE1pc2NDb21tYW5kXG4gIEBleHRlbmQoKVxuICBleGVjdXRlOiAtPlxuICAgIEBzd3JhcC5zZXRSZXZlcnNlZFN0YXRlKEBlZGl0b3IsIG5vdCBAZWRpdG9yLmdldExhc3RTZWxlY3Rpb24oKS5pc1JldmVyc2VkKCkpXG4gICAgaWYgQGlzTW9kZSgndmlzdWFsJywgJ2Jsb2Nrd2lzZScpXG4gICAgICBAZ2V0TGFzdEJsb2Nrd2lzZVNlbGVjdGlvbigpLmF1dG9zY3JvbGwoKVxuXG5jbGFzcyBCbG9ja3dpc2VPdGhlckVuZCBleHRlbmRzIFJldmVyc2VTZWxlY3Rpb25zXG4gIEBleHRlbmQoKVxuICBleGVjdXRlOiAtPlxuICAgIGZvciBibG9ja3dpc2VTZWxlY3Rpb24gaW4gQGdldEJsb2Nrd2lzZVNlbGVjdGlvbnMoKVxuICAgICAgYmxvY2t3aXNlU2VsZWN0aW9uLnJldmVyc2UoKVxuICAgIHN1cGVyXG5cbmNsYXNzIFVuZG8gZXh0ZW5kcyBNaXNjQ29tbWFuZFxuICBAZXh0ZW5kKClcblxuICBzZXRDdXJzb3JQb3NpdGlvbjogKHtuZXdSYW5nZXMsIG9sZFJhbmdlcywgc3RyYXRlZ3l9KSAtPlxuICAgIGxhc3RDdXJzb3IgPSBAZWRpdG9yLmdldExhc3RDdXJzb3IoKSAjIFRoaXMgaXMgcmVzdG9yZWQgY3Vyc29yXG5cbiAgICBpZiBzdHJhdGVneSBpcyAnc21hcnQnXG4gICAgICBjaGFuZ2VkUmFuZ2UgPSBmaW5kUmFuZ2VDb250YWluc1BvaW50KG5ld1JhbmdlcywgbGFzdEN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpKVxuICAgIGVsc2VcbiAgICAgIGNoYW5nZWRSYW5nZSA9IHNvcnRSYW5nZXMobmV3UmFuZ2VzLmNvbmNhdChvbGRSYW5nZXMpKVswXVxuXG4gICAgaWYgY2hhbmdlZFJhbmdlP1xuICAgICAgaWYgaXNMaW5ld2lzZVJhbmdlKGNoYW5nZWRSYW5nZSlcbiAgICAgICAgc2V0QnVmZmVyUm93KGxhc3RDdXJzb3IsIGNoYW5nZWRSYW5nZS5zdGFydC5yb3cpXG4gICAgICBlbHNlXG4gICAgICAgIGxhc3RDdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24oY2hhbmdlZFJhbmdlLnN0YXJ0KVxuXG4gIG11dGF0ZVdpdGhUcmFja0NoYW5nZXM6IC0+XG4gICAgbmV3UmFuZ2VzID0gW11cbiAgICBvbGRSYW5nZXMgPSBbXVxuXG4gICAgIyBDb2xsZWN0IGNoYW5nZWQgcmFuZ2Ugd2hpbGUgbXV0YXRpbmcgdGV4dC1zdGF0ZSBieSBmbiBjYWxsYmFjay5cbiAgICBkaXNwb3NhYmxlID0gQGVkaXRvci5nZXRCdWZmZXIoKS5vbkRpZENoYW5nZSAoe25ld1JhbmdlLCBvbGRSYW5nZX0pIC0+XG4gICAgICBpZiBuZXdSYW5nZS5pc0VtcHR5KClcbiAgICAgICAgb2xkUmFuZ2VzLnB1c2gob2xkUmFuZ2UpICMgUmVtb3ZlIG9ubHlcbiAgICAgIGVsc2VcbiAgICAgICAgbmV3UmFuZ2VzLnB1c2gobmV3UmFuZ2UpXG5cbiAgICBAbXV0YXRlKClcblxuICAgIGRpc3Bvc2FibGUuZGlzcG9zZSgpXG4gICAge25ld1Jhbmdlcywgb2xkUmFuZ2VzfVxuXG4gIGZsYXNoQ2hhbmdlczogKHtuZXdSYW5nZXMsIG9sZFJhbmdlc30pIC0+XG4gICAgaXNNdWx0aXBsZVNpbmdsZUxpbmVSYW5nZXMgPSAocmFuZ2VzKSAtPlxuICAgICAgcmFuZ2VzLmxlbmd0aCA+IDEgYW5kIHJhbmdlcy5ldmVyeShpc1NpbmdsZUxpbmVSYW5nZSlcblxuICAgIGlmIG5ld1Jhbmdlcy5sZW5ndGggPiAwXG4gICAgICByZXR1cm4gaWYgQGlzTXVsdGlwbGVBbmRBbGxSYW5nZUhhdmVTYW1lQ29sdW1uQW5kQ29uc2VjdXRpdmVSb3dzKG5ld1JhbmdlcylcbiAgICAgIG5ld1JhbmdlcyA9IG5ld1Jhbmdlcy5tYXAgKHJhbmdlKSA9PiBodW1hbml6ZUJ1ZmZlclJhbmdlKEBlZGl0b3IsIHJhbmdlKVxuICAgICAgbmV3UmFuZ2VzID0gQGZpbHRlck5vbkxlYWRpbmdXaGl0ZVNwYWNlUmFuZ2UobmV3UmFuZ2VzKVxuXG4gICAgICBpZiBpc011bHRpcGxlU2luZ2xlTGluZVJhbmdlcyhuZXdSYW5nZXMpXG4gICAgICAgIEBmbGFzaChuZXdSYW5nZXMsIHR5cGU6ICd1bmRvLXJlZG8tbXVsdGlwbGUtY2hhbmdlcycpXG4gICAgICBlbHNlXG4gICAgICAgIEBmbGFzaChuZXdSYW5nZXMsIHR5cGU6ICd1bmRvLXJlZG8nKVxuICAgIGVsc2VcbiAgICAgIHJldHVybiBpZiBAaXNNdWx0aXBsZUFuZEFsbFJhbmdlSGF2ZVNhbWVDb2x1bW5BbmRDb25zZWN1dGl2ZVJvd3Mob2xkUmFuZ2VzKVxuXG4gICAgICBpZiBpc011bHRpcGxlU2luZ2xlTGluZVJhbmdlcyhvbGRSYW5nZXMpXG4gICAgICAgIG9sZFJhbmdlcyA9IEBmaWx0ZXJOb25MZWFkaW5nV2hpdGVTcGFjZVJhbmdlKG9sZFJhbmdlcylcbiAgICAgICAgQGZsYXNoKG9sZFJhbmdlcywgdHlwZTogJ3VuZG8tcmVkby1tdWx0aXBsZS1kZWxldGUnKVxuXG4gIGZpbHRlck5vbkxlYWRpbmdXaGl0ZVNwYWNlUmFuZ2U6IChyYW5nZXMpIC0+XG4gICAgcmFuZ2VzLmZpbHRlciAocmFuZ2UpID0+XG4gICAgICBub3QgaXNMZWFkaW5nV2hpdGVTcGFjZVJhbmdlKEBlZGl0b3IsIHJhbmdlKVxuXG4gICMgW1RPRE9dIEltcHJvdmUgZnVydGhlciBieSBjaGVja2luZyBvbGRUZXh0LCBuZXdUZXh0P1xuICAjIFtQdXJwb3NlIG9mIHRoaXMgaXMgZnVuY3Rpb25dXG4gICMgU3VwcHJlc3MgZmxhc2ggd2hlbiB1bmRvL3JlZG9pbmcgdG9nZ2xlLWNvbW1lbnQgd2hpbGUgZmxhc2hpbmcgdW5kby9yZWRvIG9mIG9jY3VycmVuY2Ugb3BlcmF0aW9uLlxuICAjIFRoaXMgaHVyaXN0aWMgYXBwcm9hY2ggbmV2ZXIgYmUgcGVyZmVjdC5cbiAgIyBVbHRpbWF0ZWx5IGNhbm5ub3QgZGlzdGluZ3Vpc2ggb2NjdXJyZW5jZSBvcGVyYXRpb24uXG4gIGlzTXVsdGlwbGVBbmRBbGxSYW5nZUhhdmVTYW1lQ29sdW1uQW5kQ29uc2VjdXRpdmVSb3dzOiAocmFuZ2VzKSAtPlxuICAgIHJldHVybiBmYWxzZSBpZiByYW5nZXMubGVuZ3RoIDw9IDFcblxuICAgIHtzdGFydDoge2NvbHVtbjogc3RhcnRDb2x1bW59LCBlbmQ6IHtjb2x1bW46IGVuZENvbHVtbn19ID0gcmFuZ2VzWzBdXG4gICAgcHJldmlvdXNSb3cgPSBudWxsXG4gICAgZm9yIHJhbmdlIGluIHJhbmdlc1xuICAgICAge3N0YXJ0LCBlbmR9ID0gcmFuZ2VcbiAgICAgIHVubGVzcyAoKHN0YXJ0LmNvbHVtbiBpcyBzdGFydENvbHVtbikgYW5kIChlbmQuY29sdW1uIGlzIGVuZENvbHVtbikpXG4gICAgICAgIHJldHVybiBmYWxzZVxuXG4gICAgICBpZiBwcmV2aW91c1Jvdz8gYW5kIChwcmV2aW91c1JvdyArIDEgaXNudCBzdGFydC5yb3cpXG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgcHJldmlvdXNSb3cgPSBzdGFydC5yb3dcbiAgICByZXR1cm4gdHJ1ZVxuXG4gICAgcmFuZ2VzLmV2ZXJ5ICh7c3RhcnQsIGVuZH0pIC0+XG4gICAgICAoc3RhcnQuY29sdW1uIGlzIHN0YXJ0Q29sdW1uKSBhbmQgKGVuZC5jb2x1bW4gaXMgZW5kQ29sdW1uKVxuXG4gIGZsYXNoOiAoZmxhc2hSYW5nZXMsIG9wdGlvbnMpIC0+XG4gICAgb3B0aW9ucy50aW1lb3V0ID89IDUwMFxuICAgIEBvbkRpZEZpbmlzaE9wZXJhdGlvbiA9PlxuICAgICAgQHZpbVN0YXRlLmZsYXNoKGZsYXNoUmFuZ2VzLCBvcHRpb25zKVxuXG4gIGV4ZWN1dGU6IC0+XG4gICAge25ld1Jhbmdlcywgb2xkUmFuZ2VzfSA9IEBtdXRhdGVXaXRoVHJhY2tDaGFuZ2VzKClcblxuICAgIGZvciBzZWxlY3Rpb24gaW4gQGVkaXRvci5nZXRTZWxlY3Rpb25zKClcbiAgICAgIHNlbGVjdGlvbi5jbGVhcigpXG5cbiAgICBpZiBAZ2V0Q29uZmlnKCdzZXRDdXJzb3JUb1N0YXJ0T2ZDaGFuZ2VPblVuZG9SZWRvJylcbiAgICAgIHN0cmF0ZWd5ID0gQGdldENvbmZpZygnc2V0Q3Vyc29yVG9TdGFydE9mQ2hhbmdlT25VbmRvUmVkb1N0cmF0ZWd5JylcbiAgICAgIEBzZXRDdXJzb3JQb3NpdGlvbih7bmV3UmFuZ2VzLCBvbGRSYW5nZXMsIHN0cmF0ZWd5fSlcbiAgICAgIEB2aW1TdGF0ZS5jbGVhclNlbGVjdGlvbnMoKVxuXG4gICAgaWYgQGdldENvbmZpZygnZmxhc2hPblVuZG9SZWRvJylcbiAgICAgIEBmbGFzaENoYW5nZXMoe25ld1Jhbmdlcywgb2xkUmFuZ2VzfSlcblxuICAgIEBhY3RpdmF0ZU1vZGUoJ25vcm1hbCcpXG5cbiAgbXV0YXRlOiAtPlxuICAgIEBlZGl0b3IudW5kbygpXG5cbmNsYXNzIFJlZG8gZXh0ZW5kcyBVbmRvXG4gIEBleHRlbmQoKVxuICBtdXRhdGU6IC0+XG4gICAgQGVkaXRvci5yZWRvKClcblxuIyB6Y1xuY2xhc3MgRm9sZEN1cnJlbnRSb3cgZXh0ZW5kcyBNaXNjQ29tbWFuZFxuICBAZXh0ZW5kKClcbiAgZXhlY3V0ZTogLT5cbiAgICBmb3Igc2VsZWN0aW9uIGluIEBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpXG4gICAgICB7cm93fSA9IEBnZXRDdXJzb3JQb3NpdGlvbkZvclNlbGVjdGlvbihzZWxlY3Rpb24pXG4gICAgICBAZWRpdG9yLmZvbGRCdWZmZXJSb3cocm93KVxuXG4jIHpvXG5jbGFzcyBVbmZvbGRDdXJyZW50Um93IGV4dGVuZHMgTWlzY0NvbW1hbmRcbiAgQGV4dGVuZCgpXG4gIGV4ZWN1dGU6IC0+XG4gICAgZm9yIHNlbGVjdGlvbiBpbiBAZWRpdG9yLmdldFNlbGVjdGlvbnMoKVxuICAgICAge3Jvd30gPSBAZ2V0Q3Vyc29yUG9zaXRpb25Gb3JTZWxlY3Rpb24oc2VsZWN0aW9uKVxuICAgICAgQGVkaXRvci51bmZvbGRCdWZmZXJSb3cocm93KVxuXG4jIHphXG5jbGFzcyBUb2dnbGVGb2xkIGV4dGVuZHMgTWlzY0NvbW1hbmRcbiAgQGV4dGVuZCgpXG4gIGV4ZWN1dGU6IC0+XG4gICAgcG9pbnQgPSBAZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKClcbiAgICBAZWRpdG9yLnRvZ2dsZUZvbGRBdEJ1ZmZlclJvdyhwb2ludC5yb3cpXG5cbiMgQmFzZSBvZiB6Qywgek8sIHpBXG5jbGFzcyBGb2xkQ3VycmVudFJvd1JlY3Vyc2l2ZWx5QmFzZSBleHRlbmRzIE1pc2NDb21tYW5kXG4gIEBleHRlbmQoZmFsc2UpXG5cbiAgZm9sZFJlY3Vyc2l2ZWx5OiAocm93KSAtPlxuICAgIHJvd1JhbmdlcyA9IGdldEZvbGRSb3dSYW5nZXNDb250YWluZWRCeUZvbGRTdGFydHNBdFJvdyhAZWRpdG9yLCByb3cpXG4gICAgaWYgcm93UmFuZ2VzP1xuICAgICAgc3RhcnRSb3dzID0gcm93UmFuZ2VzLm1hcCAocm93UmFuZ2UpIC0+IHJvd1JhbmdlWzBdXG4gICAgICBmb3Igcm93IGluIHN0YXJ0Um93cy5yZXZlcnNlKCkgd2hlbiBub3QgQGVkaXRvci5pc0ZvbGRlZEF0QnVmZmVyUm93KHJvdylcbiAgICAgICAgQGVkaXRvci5mb2xkQnVmZmVyUm93KHJvdylcblxuICB1bmZvbGRSZWN1cnNpdmVseTogKHJvdykgLT5cbiAgICByb3dSYW5nZXMgPSBnZXRGb2xkUm93UmFuZ2VzQ29udGFpbmVkQnlGb2xkU3RhcnRzQXRSb3coQGVkaXRvciwgcm93KVxuICAgIGlmIHJvd1Jhbmdlcz9cbiAgICAgIHN0YXJ0Um93cyA9IHJvd1Jhbmdlcy5tYXAgKHJvd1JhbmdlKSAtPiByb3dSYW5nZVswXVxuICAgICAgZm9yIHJvdyBpbiBzdGFydFJvd3Mgd2hlbiBAZWRpdG9yLmlzRm9sZGVkQXRCdWZmZXJSb3cocm93KVxuICAgICAgICBAZWRpdG9yLnVuZm9sZEJ1ZmZlclJvdyhyb3cpXG5cbiAgZm9sZFJlY3Vyc2l2ZWx5Rm9yQWxsU2VsZWN0aW9uczogLT5cbiAgICBmb3Igc2VsZWN0aW9uIGluIEBlZGl0b3IuZ2V0U2VsZWN0aW9uc09yZGVyZWRCeUJ1ZmZlclBvc2l0aW9uKCkucmV2ZXJzZSgpXG4gICAgICBAZm9sZFJlY3Vyc2l2ZWx5KEBnZXRDdXJzb3JQb3NpdGlvbkZvclNlbGVjdGlvbihzZWxlY3Rpb24pLnJvdylcblxuICB1bmZvbGRSZWN1cnNpdmVseUZvckFsbFNlbGVjdGlvbnM6IC0+XG4gICAgZm9yIHNlbGVjdGlvbiBpbiBAZWRpdG9yLmdldFNlbGVjdGlvbnNPcmRlcmVkQnlCdWZmZXJQb3NpdGlvbigpXG4gICAgICBAdW5mb2xkUmVjdXJzaXZlbHkoQGdldEN1cnNvclBvc2l0aW9uRm9yU2VsZWN0aW9uKHNlbGVjdGlvbikucm93KVxuXG4jIHpDXG5jbGFzcyBGb2xkQ3VycmVudFJvd1JlY3Vyc2l2ZWx5IGV4dGVuZHMgRm9sZEN1cnJlbnRSb3dSZWN1cnNpdmVseUJhc2VcbiAgQGV4dGVuZCgpXG4gIGV4ZWN1dGU6IC0+XG4gICAgQGZvbGRSZWN1cnNpdmVseUZvckFsbFNlbGVjdGlvbnMoKVxuXG4jIHpPXG5jbGFzcyBVbmZvbGRDdXJyZW50Um93UmVjdXJzaXZlbHkgZXh0ZW5kcyBGb2xkQ3VycmVudFJvd1JlY3Vyc2l2ZWx5QmFzZVxuICBAZXh0ZW5kKClcbiAgZXhlY3V0ZTogLT5cbiAgICBAdW5mb2xkUmVjdXJzaXZlbHlGb3JBbGxTZWxlY3Rpb25zKClcblxuIyB6QVxuY2xhc3MgVG9nZ2xlRm9sZFJlY3Vyc2l2ZWx5IGV4dGVuZHMgRm9sZEN1cnJlbnRSb3dSZWN1cnNpdmVseUJhc2VcbiAgQGV4dGVuZCgpXG4gIGV4ZWN1dGU6IC0+XG4gICAgcm93ID0gQGdldEN1cnNvclBvc2l0aW9uRm9yU2VsZWN0aW9uKEBlZGl0b3IuZ2V0TGFzdFNlbGVjdGlvbigpKS5yb3dcbiAgICBpZiBAZWRpdG9yLmlzRm9sZGVkQXRCdWZmZXJSb3cocm93KVxuICAgICAgQHVuZm9sZFJlY3Vyc2l2ZWx5Rm9yQWxsU2VsZWN0aW9ucygpXG4gICAgZWxzZVxuICAgICAgQGZvbGRSZWN1cnNpdmVseUZvckFsbFNlbGVjdGlvbnMoKVxuXG4jIHpSXG5jbGFzcyBVbmZvbGRBbGwgZXh0ZW5kcyBNaXNjQ29tbWFuZFxuICBAZXh0ZW5kKClcbiAgZXhlY3V0ZTogLT5cbiAgICBAZWRpdG9yLnVuZm9sZEFsbCgpXG5cbiMgek1cbmNsYXNzIEZvbGRBbGwgZXh0ZW5kcyBNaXNjQ29tbWFuZFxuICBAZXh0ZW5kKClcbiAgZXhlY3V0ZTogLT5cbiAgICB7YWxsRm9sZH0gPSBnZXRGb2xkSW5mb0J5S2luZChAZWRpdG9yKVxuICAgIGlmIGFsbEZvbGQ/XG4gICAgICBAZWRpdG9yLnVuZm9sZEFsbCgpXG4gICAgICBmb3Ige2luZGVudCwgc3RhcnRSb3csIGVuZFJvd30gaW4gYWxsRm9sZC5yb3dSYW5nZXNXaXRoSW5kZW50XG4gICAgICAgIGlmIGluZGVudCA8PSBAZ2V0Q29uZmlnKCdtYXhGb2xkYWJsZUluZGVudExldmVsJylcbiAgICAgICAgICBAZWRpdG9yLmZvbGRCdWZmZXJSb3dSYW5nZShzdGFydFJvdywgZW5kUm93KVxuXG4jIHpyXG5jbGFzcyBVbmZvbGROZXh0SW5kZW50TGV2ZWwgZXh0ZW5kcyBNaXNjQ29tbWFuZFxuICBAZXh0ZW5kKClcbiAgZXhlY3V0ZTogLT5cbiAgICB7Zm9sZGVkfSA9IGdldEZvbGRJbmZvQnlLaW5kKEBlZGl0b3IpXG4gICAgaWYgZm9sZGVkP1xuICAgICAge21pbkluZGVudCwgcm93UmFuZ2VzV2l0aEluZGVudH0gPSBmb2xkZWRcbiAgICAgIGNvdW50ID0gbGltaXROdW1iZXIoQGdldENvdW50KCkgLSAxLCBtaW46IDApXG4gICAgICB0YXJnZXRJbmRlbnRzID0gW21pbkluZGVudC4uKG1pbkluZGVudCArIGNvdW50KV1cbiAgICAgIGZvciB7aW5kZW50LCBzdGFydFJvd30gaW4gcm93UmFuZ2VzV2l0aEluZGVudFxuICAgICAgICBpZiBpbmRlbnQgaW4gdGFyZ2V0SW5kZW50c1xuICAgICAgICAgIEBlZGl0b3IudW5mb2xkQnVmZmVyUm93KHN0YXJ0Um93KVxuXG4jIHptXG5jbGFzcyBGb2xkTmV4dEluZGVudExldmVsIGV4dGVuZHMgTWlzY0NvbW1hbmRcbiAgQGV4dGVuZCgpXG4gIGV4ZWN1dGU6IC0+XG4gICAge3VuZm9sZGVkLCBhbGxGb2xkfSA9IGdldEZvbGRJbmZvQnlLaW5kKEBlZGl0b3IpXG4gICAgaWYgdW5mb2xkZWQ/XG4gICAgICAjIEZJWE1FOiBXaHkgSSBuZWVkIHVuZm9sZEFsbCgpPyBXaHkgY2FuJ3QgSSBqdXN0IGZvbGQgbm9uLWZvbGRlZC1mb2xkIG9ubHk/XG4gICAgICAjIFVubGVzcyB1bmZvbGRBbGwoKSBoZXJlLCBAZWRpdG9yLnVuZm9sZEFsbCgpIGRlbGV0ZSBmb2xkTWFya2VyIGJ1dCBmYWlsXG4gICAgICAjIHRvIHJlbmRlciB1bmZvbGRlZCByb3dzIGNvcnJlY3RseS5cbiAgICAgICMgSSBiZWxpZXZlIHRoaXMgaXMgYnVnIG9mIHRleHQtYnVmZmVyJ3MgbWFya2VyTGF5ZXIgd2hpY2ggYXNzdW1lIGZvbGRzIGFyZVxuICAgICAgIyBjcmVhdGVkICoqaW4tb3JkZXIqKiBmcm9tIHRvcC1yb3cgdG8gYm90dG9tLXJvdy5cbiAgICAgIEBlZGl0b3IudW5mb2xkQWxsKClcblxuICAgICAgbWF4Rm9sZGFibGUgPSBAZ2V0Q29uZmlnKCdtYXhGb2xkYWJsZUluZGVudExldmVsJylcbiAgICAgIGZyb21MZXZlbCA9IE1hdGgubWluKHVuZm9sZGVkLm1heEluZGVudCwgbWF4Rm9sZGFibGUpXG4gICAgICBjb3VudCA9IGxpbWl0TnVtYmVyKEBnZXRDb3VudCgpIC0gMSwgbWluOiAwKVxuICAgICAgZnJvbUxldmVsID0gbGltaXROdW1iZXIoZnJvbUxldmVsIC0gY291bnQsIG1pbjogMClcbiAgICAgIHRhcmdldEluZGVudHMgPSBbZnJvbUxldmVsLi5tYXhGb2xkYWJsZV1cblxuICAgICAgZm9yIHtpbmRlbnQsIHN0YXJ0Um93LCBlbmRSb3d9IGluIGFsbEZvbGQucm93UmFuZ2VzV2l0aEluZGVudFxuICAgICAgICBpZiBpbmRlbnQgaW4gdGFyZ2V0SW5kZW50c1xuICAgICAgICAgIEBlZGl0b3IuZm9sZEJ1ZmZlclJvd1JhbmdlKHN0YXJ0Um93LCBlbmRSb3cpXG5cbmNsYXNzIFJlcGxhY2VNb2RlQmFja3NwYWNlIGV4dGVuZHMgTWlzY0NvbW1hbmRcbiAgQGNvbW1hbmRTY29wZTogJ2F0b20tdGV4dC1lZGl0b3IudmltLW1vZGUtcGx1cy5pbnNlcnQtbW9kZS5yZXBsYWNlJ1xuICBAZXh0ZW5kKClcbiAgZXhlY3V0ZTogLT5cbiAgICBmb3Igc2VsZWN0aW9uIGluIEBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpXG4gICAgICAjIGNoYXIgbWlnaHQgYmUgZW1wdHkuXG4gICAgICBjaGFyID0gQHZpbVN0YXRlLm1vZGVNYW5hZ2VyLmdldFJlcGxhY2VkQ2hhckZvclNlbGVjdGlvbihzZWxlY3Rpb24pXG4gICAgICBpZiBjaGFyP1xuICAgICAgICBzZWxlY3Rpb24uc2VsZWN0TGVmdCgpXG4gICAgICAgIHVubGVzcyBzZWxlY3Rpb24uaW5zZXJ0VGV4dChjaGFyKS5pc0VtcHR5KClcbiAgICAgICAgICBzZWxlY3Rpb24uY3Vyc29yLm1vdmVMZWZ0KClcblxuY2xhc3MgU2Nyb2xsV2l0aG91dENoYW5naW5nQ3Vyc29yUG9zaXRpb24gZXh0ZW5kcyBNaXNjQ29tbWFuZFxuICBAZXh0ZW5kKGZhbHNlKVxuICBzY3JvbGxvZmY6IDIgIyBhdG9tIGRlZmF1bHQuIEJldHRlciB0byB1c2UgZWRpdG9yLmdldFZlcnRpY2FsU2Nyb2xsTWFyZ2luKCk/XG4gIGN1cnNvclBpeGVsOiBudWxsXG5cbiAgZ2V0Rmlyc3RWaXNpYmxlU2NyZWVuUm93OiAtPlxuICAgIEBlZGl0b3JFbGVtZW50LmdldEZpcnN0VmlzaWJsZVNjcmVlblJvdygpXG5cbiAgZ2V0TGFzdFZpc2libGVTY3JlZW5Sb3c6IC0+XG4gICAgQGVkaXRvckVsZW1lbnQuZ2V0TGFzdFZpc2libGVTY3JlZW5Sb3coKVxuXG4gIGdldExhc3RTY3JlZW5Sb3c6IC0+XG4gICAgQGVkaXRvci5nZXRMYXN0U2NyZWVuUm93KClcblxuICBnZXRDdXJzb3JQaXhlbDogLT5cbiAgICBwb2ludCA9IEBlZGl0b3IuZ2V0Q3Vyc29yU2NyZWVuUG9zaXRpb24oKVxuICAgIEBlZGl0b3JFbGVtZW50LnBpeGVsUG9zaXRpb25Gb3JTY3JlZW5Qb3NpdGlvbihwb2ludClcblxuIyBjdHJsLWUgc2Nyb2xsIGxpbmVzIGRvd253YXJkc1xuY2xhc3MgU2Nyb2xsRG93biBleHRlbmRzIFNjcm9sbFdpdGhvdXRDaGFuZ2luZ0N1cnNvclBvc2l0aW9uXG4gIEBleHRlbmQoKVxuXG4gIGV4ZWN1dGU6IC0+XG4gICAgY291bnQgPSBAZ2V0Q291bnQoKVxuICAgIG9sZEZpcnN0Um93ID0gQGVkaXRvci5nZXRGaXJzdFZpc2libGVTY3JlZW5Sb3coKVxuICAgIEBlZGl0b3Iuc2V0Rmlyc3RWaXNpYmxlU2NyZWVuUm93KG9sZEZpcnN0Um93ICsgY291bnQpXG4gICAgbmV3Rmlyc3RSb3cgPSBAZWRpdG9yLmdldEZpcnN0VmlzaWJsZVNjcmVlblJvdygpXG5cbiAgICBvZmZzZXQgPSAyXG4gICAge3JvdywgY29sdW1ufSA9IEBlZGl0b3IuZ2V0Q3Vyc29yU2NyZWVuUG9zaXRpb24oKVxuICAgIGlmIHJvdyA8IChuZXdGaXJzdFJvdyArIG9mZnNldClcbiAgICAgIG5ld1BvaW50ID0gW3JvdyArIGNvdW50LCBjb2x1bW5dXG4gICAgICBAZWRpdG9yLnNldEN1cnNvclNjcmVlblBvc2l0aW9uKG5ld1BvaW50LCBhdXRvc2Nyb2xsOiBmYWxzZSlcblxuIyBjdHJsLXkgc2Nyb2xsIGxpbmVzIHVwd2FyZHNcbmNsYXNzIFNjcm9sbFVwIGV4dGVuZHMgU2Nyb2xsV2l0aG91dENoYW5naW5nQ3Vyc29yUG9zaXRpb25cbiAgQGV4dGVuZCgpXG5cbiAgZXhlY3V0ZTogLT5cbiAgICBjb3VudCA9IEBnZXRDb3VudCgpXG4gICAgb2xkRmlyc3RSb3cgPSBAZWRpdG9yLmdldEZpcnN0VmlzaWJsZVNjcmVlblJvdygpXG4gICAgQGVkaXRvci5zZXRGaXJzdFZpc2libGVTY3JlZW5Sb3cob2xkRmlyc3RSb3cgLSBjb3VudClcbiAgICBuZXdMYXN0Um93ID0gQGVkaXRvci5nZXRMYXN0VmlzaWJsZVNjcmVlblJvdygpXG5cbiAgICBvZmZzZXQgPSAyXG4gICAge3JvdywgY29sdW1ufSA9IEBlZGl0b3IuZ2V0Q3Vyc29yU2NyZWVuUG9zaXRpb24oKVxuICAgIGlmIHJvdyA+PSAobmV3TGFzdFJvdyAtIG9mZnNldClcbiAgICAgIG5ld1BvaW50ID0gW3JvdyAtIGNvdW50LCBjb2x1bW5dXG4gICAgICBAZWRpdG9yLnNldEN1cnNvclNjcmVlblBvc2l0aW9uKG5ld1BvaW50LCBhdXRvc2Nyb2xsOiBmYWxzZSlcblxuIyBTY3JvbGxXaXRob3V0Q2hhbmdpbmdDdXJzb3JQb3NpdGlvbiB3aXRob3V0IEN1cnNvciBQb3NpdGlvbiBjaGFuZ2UuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIFNjcm9sbEN1cnNvciBleHRlbmRzIFNjcm9sbFdpdGhvdXRDaGFuZ2luZ0N1cnNvclBvc2l0aW9uXG4gIEBleHRlbmQoZmFsc2UpXG4gIGV4ZWN1dGU6IC0+XG4gICAgQG1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lPygpXG4gICAgaWYgQGlzU2Nyb2xsYWJsZSgpXG4gICAgICBAZWRpdG9yRWxlbWVudC5zZXRTY3JvbGxUb3AgQGdldFNjcm9sbFRvcCgpXG5cbiAgbW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmU6IC0+XG4gICAgQGVkaXRvci5tb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZSgpXG5cbiAgZ2V0T2ZmU2V0UGl4ZWxIZWlnaHQ6IChsaW5lRGVsdGE9MCkgLT5cbiAgICBAZWRpdG9yLmdldExpbmVIZWlnaHRJblBpeGVscygpICogKEBzY3JvbGxvZmYgKyBsaW5lRGVsdGEpXG5cbiMgeiBlbnRlclxuY2xhc3MgU2Nyb2xsQ3Vyc29yVG9Ub3AgZXh0ZW5kcyBTY3JvbGxDdXJzb3JcbiAgQGV4dGVuZCgpXG4gIGlzU2Nyb2xsYWJsZTogLT5cbiAgICBAZ2V0TGFzdFZpc2libGVTY3JlZW5Sb3coKSBpc250IEBnZXRMYXN0U2NyZWVuUm93KClcblxuICBnZXRTY3JvbGxUb3A6IC0+XG4gICAgQGdldEN1cnNvclBpeGVsKCkudG9wIC0gQGdldE9mZlNldFBpeGVsSGVpZ2h0KClcblxuIyB6dFxuY2xhc3MgU2Nyb2xsQ3Vyc29yVG9Ub3BMZWF2ZSBleHRlbmRzIFNjcm9sbEN1cnNvclRvVG9wXG4gIEBleHRlbmQoKVxuICBtb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZTogbnVsbFxuXG4jIHotXG5jbGFzcyBTY3JvbGxDdXJzb3JUb0JvdHRvbSBleHRlbmRzIFNjcm9sbEN1cnNvclxuICBAZXh0ZW5kKClcbiAgaXNTY3JvbGxhYmxlOiAtPlxuICAgIEBnZXRGaXJzdFZpc2libGVTY3JlZW5Sb3coKSBpc250IDBcblxuICBnZXRTY3JvbGxUb3A6IC0+XG4gICAgQGdldEN1cnNvclBpeGVsKCkudG9wIC0gKEBlZGl0b3JFbGVtZW50LmdldEhlaWdodCgpIC0gQGdldE9mZlNldFBpeGVsSGVpZ2h0KDEpKVxuXG4jIHpiXG5jbGFzcyBTY3JvbGxDdXJzb3JUb0JvdHRvbUxlYXZlIGV4dGVuZHMgU2Nyb2xsQ3Vyc29yVG9Cb3R0b21cbiAgQGV4dGVuZCgpXG4gIG1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lOiBudWxsXG5cbiMgei5cbmNsYXNzIFNjcm9sbEN1cnNvclRvTWlkZGxlIGV4dGVuZHMgU2Nyb2xsQ3Vyc29yXG4gIEBleHRlbmQoKVxuICBpc1Njcm9sbGFibGU6IC0+XG4gICAgdHJ1ZVxuXG4gIGdldFNjcm9sbFRvcDogLT5cbiAgICBAZ2V0Q3Vyc29yUGl4ZWwoKS50b3AgLSAoQGVkaXRvckVsZW1lbnQuZ2V0SGVpZ2h0KCkgLyAyKVxuXG4jIHp6XG5jbGFzcyBTY3JvbGxDdXJzb3JUb01pZGRsZUxlYXZlIGV4dGVuZHMgU2Nyb2xsQ3Vyc29yVG9NaWRkbGVcbiAgQGV4dGVuZCgpXG4gIG1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lOiBudWxsXG5cbiMgSG9yaXpvbnRhbCBTY3JvbGxXaXRob3V0Q2hhbmdpbmdDdXJzb3JQb3NpdGlvblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIHpzXG5jbGFzcyBTY3JvbGxDdXJzb3JUb0xlZnQgZXh0ZW5kcyBTY3JvbGxXaXRob3V0Q2hhbmdpbmdDdXJzb3JQb3NpdGlvblxuICBAZXh0ZW5kKClcblxuICBleGVjdXRlOiAtPlxuICAgIEBlZGl0b3JFbGVtZW50LnNldFNjcm9sbExlZnQoQGdldEN1cnNvclBpeGVsKCkubGVmdClcblxuIyB6ZVxuY2xhc3MgU2Nyb2xsQ3Vyc29yVG9SaWdodCBleHRlbmRzIFNjcm9sbEN1cnNvclRvTGVmdFxuICBAZXh0ZW5kKClcblxuICBleGVjdXRlOiAtPlxuICAgIEBlZGl0b3JFbGVtZW50LnNldFNjcm9sbFJpZ2h0KEBnZXRDdXJzb3JQaXhlbCgpLmxlZnQpXG5cbiMgaW5zZXJ0LW1vZGUgc3BlY2lmaWMgY29tbWFuZHNcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgSW5zZXJ0TW9kZSBleHRlbmRzIE1pc2NDb21tYW5kXG4gIEBjb21tYW5kU2NvcGU6ICdhdG9tLXRleHQtZWRpdG9yLnZpbS1tb2RlLXBsdXMuaW5zZXJ0LW1vZGUnXG5cbmNsYXNzIEFjdGl2YXRlTm9ybWFsTW9kZU9uY2UgZXh0ZW5kcyBJbnNlcnRNb2RlXG4gIEBleHRlbmQoKVxuICB0aGlzQ29tbWFuZE5hbWU6IEBnZXRDb21tYW5kTmFtZSgpXG5cbiAgZXhlY3V0ZTogLT5cbiAgICBjdXJzb3JzVG9Nb3ZlUmlnaHQgPSBAZWRpdG9yLmdldEN1cnNvcnMoKS5maWx0ZXIgKGN1cnNvcikgLT4gbm90IGN1cnNvci5pc0F0QmVnaW5uaW5nT2ZMaW5lKClcbiAgICBAdmltU3RhdGUuYWN0aXZhdGUoJ25vcm1hbCcpXG4gICAgbW92ZUN1cnNvclJpZ2h0KGN1cnNvcikgZm9yIGN1cnNvciBpbiBjdXJzb3JzVG9Nb3ZlUmlnaHRcbiAgICBkaXNwb3NhYmxlID0gYXRvbS5jb21tYW5kcy5vbkRpZERpc3BhdGNoICh7dHlwZX0pID0+XG4gICAgICByZXR1cm4gaWYgdHlwZSBpcyBAdGhpc0NvbW1hbmROYW1lXG4gICAgICBkaXNwb3NhYmxlLmRpc3Bvc2UoKVxuICAgICAgZGlzcG9zYWJsZSA9IG51bGxcbiAgICAgIEB2aW1TdGF0ZS5hY3RpdmF0ZSgnaW5zZXJ0JylcblxuY2xhc3MgSW5zZXJ0UmVnaXN0ZXIgZXh0ZW5kcyBJbnNlcnRNb2RlXG4gIEBleHRlbmQoKVxuICByZXF1aXJlSW5wdXQ6IHRydWVcblxuICBpbml0aWFsaXplOiAtPlxuICAgIHN1cGVyXG4gICAgQGZvY3VzSW5wdXQoKVxuXG4gIGV4ZWN1dGU6IC0+XG4gICAgQGVkaXRvci50cmFuc2FjdCA9PlxuICAgICAgZm9yIHNlbGVjdGlvbiBpbiBAZWRpdG9yLmdldFNlbGVjdGlvbnMoKVxuICAgICAgICB0ZXh0ID0gQHZpbVN0YXRlLnJlZ2lzdGVyLmdldFRleHQoQGlucHV0LCBzZWxlY3Rpb24pXG4gICAgICAgIHNlbGVjdGlvbi5pbnNlcnRUZXh0KHRleHQpXG5cbmNsYXNzIEluc2VydExhc3RJbnNlcnRlZCBleHRlbmRzIEluc2VydE1vZGVcbiAgQGV4dGVuZCgpXG4gIEBkZXNjcmlwdGlvbjogXCJcIlwiXG4gIEluc2VydCB0ZXh0IGluc2VydGVkIGluIGxhdGVzdCBpbnNlcnQtbW9kZS5cbiAgRXF1aXZhbGVudCB0byAqaV9DVFJMLUEqIG9mIHB1cmUgVmltXG4gIFwiXCJcIlxuICBleGVjdXRlOiAtPlxuICAgIHRleHQgPSBAdmltU3RhdGUucmVnaXN0ZXIuZ2V0VGV4dCgnLicpXG4gICAgQGVkaXRvci5pbnNlcnRUZXh0KHRleHQpXG5cbmNsYXNzIENvcHlGcm9tTGluZUFib3ZlIGV4dGVuZHMgSW5zZXJ0TW9kZVxuICBAZXh0ZW5kKClcbiAgQGRlc2NyaXB0aW9uOiBcIlwiXCJcbiAgSW5zZXJ0IGNoYXJhY3RlciBvZiBzYW1lLWNvbHVtbiBvZiBhYm92ZSBsaW5lLlxuICBFcXVpdmFsZW50IHRvICppX0NUUkwtWSogb2YgcHVyZSBWaW1cbiAgXCJcIlwiXG4gIHJvd0RlbHRhOiAtMVxuXG4gIGV4ZWN1dGU6IC0+XG4gICAgdHJhbnNsYXRpb24gPSBbQHJvd0RlbHRhLCAwXVxuICAgIEBlZGl0b3IudHJhbnNhY3QgPT5cbiAgICAgIGZvciBzZWxlY3Rpb24gaW4gQGVkaXRvci5nZXRTZWxlY3Rpb25zKClcbiAgICAgICAgcG9pbnQgPSBzZWxlY3Rpb24uY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKCkudHJhbnNsYXRlKHRyYW5zbGF0aW9uKVxuICAgICAgICBjb250aW51ZSBpZiBwb2ludC5yb3cgPCAwXG4gICAgICAgIHJhbmdlID0gUmFuZ2UuZnJvbVBvaW50V2l0aERlbHRhKHBvaW50LCAwLCAxKVxuICAgICAgICBpZiB0ZXh0ID0gQGVkaXRvci5nZXRUZXh0SW5CdWZmZXJSYW5nZShyYW5nZSlcbiAgICAgICAgICBzZWxlY3Rpb24uaW5zZXJ0VGV4dCh0ZXh0KVxuXG5jbGFzcyBDb3B5RnJvbUxpbmVCZWxvdyBleHRlbmRzIENvcHlGcm9tTGluZUFib3ZlXG4gIEBleHRlbmQoKVxuICBAZGVzY3JpcHRpb246IFwiXCJcIlxuICBJbnNlcnQgY2hhcmFjdGVyIG9mIHNhbWUtY29sdW1uIG9mIGFib3ZlIGxpbmUuXG4gIEVxdWl2YWxlbnQgdG8gKmlfQ1RSTC1FKiBvZiBwdXJlIFZpbVxuICBcIlwiXCJcbiAgcm93RGVsdGE6ICsxXG5cbmNsYXNzIE5leHRUYWIgZXh0ZW5kcyBNaXNjQ29tbWFuZFxuICBAZXh0ZW5kKClcbiAgZGVmYXVsdENvdW50OiAwXG4gIGV4ZWN1dGU6IC0+XG4gICAgY291bnQgPSBAZ2V0Q291bnQoKVxuICAgIHBhbmUgPSBhdG9tLndvcmtzcGFjZS5wYW5lRm9ySXRlbShAZWRpdG9yKVxuICAgIGlmIGNvdW50XG4gICAgICBwYW5lLmFjdGl2YXRlSXRlbUF0SW5kZXgoY291bnQgLSAxKVxuICAgIGVsc2VcbiAgICAgIHBhbmUuYWN0aXZhdGVOZXh0SXRlbSgpXG5cbmNsYXNzIFByZXZpb3VzVGFiIGV4dGVuZHMgTWlzY0NvbW1hbmRcbiAgQGV4dGVuZCgpXG4gIGV4ZWN1dGU6IC0+XG4gICAgcGFuZSA9IGF0b20ud29ya3NwYWNlLnBhbmVGb3JJdGVtKEBlZGl0b3IpXG4gICAgcGFuZS5hY3RpdmF0ZVByZXZpb3VzSXRlbSgpXG4iXX0=
