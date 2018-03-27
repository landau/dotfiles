(function() {
  var ActivateNormalModeOnce, Base, BlockwiseOtherEnd, Mark, MiscCommand, Point, Range, Redo, ReplaceModeBackspace, ReverseSelections, ScrollCursor, ScrollCursorToBottom, ScrollCursorToBottomLeave, ScrollCursorToLeft, ScrollCursorToMiddle, ScrollCursorToMiddleLeave, ScrollCursorToRight, ScrollCursorToTop, ScrollCursorToTopLeave, ScrollDown, ScrollUp, ScrollWithoutChangingCursorPosition, ToggleFold, Undo, _, findRangeContainsPoint, humanizeBufferRange, isLeadingWhiteSpaceRange, isLinewiseRange, isSingleLineRange, moveCursorRight, ref, ref1, setBufferRow, sortRanges, swrap,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  ref = require('atom'), Range = ref.Range, Point = ref.Point;

  Base = require('./base');

  swrap = require('./selection-wrapper');

  _ = require('underscore-plus');

  ref1 = require('./utils'), moveCursorRight = ref1.moveCursorRight, isLinewiseRange = ref1.isLinewiseRange, setBufferRow = ref1.setBufferRow, sortRanges = ref1.sortRanges, findRangeContainsPoint = ref1.findRangeContainsPoint, isSingleLineRange = ref1.isSingleLineRange, isLeadingWhiteSpaceRange = ref1.isLeadingWhiteSpaceRange, humanizeBufferRange = ref1.humanizeBufferRange;

  MiscCommand = (function(superClass) {
    extend(MiscCommand, superClass);

    MiscCommand.extend(false);

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
      swrap.setReversedState(this.editor, !this.editor.getLastSelection().isReversed());
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
        if (this.isMultipleAndAllRangeHaveSameColumnRanges(newRanges)) {
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
        if (this.isMultipleAndAllRangeHaveSameColumnRanges(oldRanges)) {
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

    Undo.prototype.isMultipleAndAllRangeHaveSameColumnRanges = function(ranges) {
      var end, endColumn, ref2, start, startColumn;
      if (ranges.length <= 1) {
        return false;
      }
      ref2 = ranges[0], start = ref2.start, end = ref2.end;
      startColumn = start.column;
      endColumn = end.column;
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
      var column, count, margin, newFirstRow, newPoint, oldFirstRow, ref2, row;
      count = this.getCount();
      oldFirstRow = this.editor.getFirstVisibleScreenRow();
      this.editor.setFirstVisibleScreenRow(oldFirstRow + count);
      newFirstRow = this.editor.getFirstVisibleScreenRow();
      margin = this.editor.getVerticalScrollMargin();
      ref2 = this.editor.getCursorScreenPosition(), row = ref2.row, column = ref2.column;
      if (row < (newFirstRow + margin)) {
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
      var column, count, margin, newLastRow, newPoint, oldFirstRow, ref2, row;
      count = this.getCount();
      oldFirstRow = this.editor.getFirstVisibleScreenRow();
      this.editor.setFirstVisibleScreenRow(oldFirstRow - count);
      newLastRow = this.editor.getLastVisibleScreenRow();
      margin = this.editor.getVerticalScrollMargin();
      ref2 = this.editor.getCursorScreenPosition(), row = ref2.row, column = ref2.column;
      if (row >= (newLastRow - margin)) {
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

  ActivateNormalModeOnce = (function(superClass) {
    extend(ActivateNormalModeOnce, superClass);

    function ActivateNormalModeOnce() {
      return ActivateNormalModeOnce.__super__.constructor.apply(this, arguments);
    }

    ActivateNormalModeOnce.extend();

    ActivateNormalModeOnce.commandScope = 'atom-text-editor.vim-mode-plus.insert-mode';

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

  })(MiscCommand);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvbWlzYy1jb21tYW5kLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsMmpCQUFBO0lBQUE7OztFQUFBLE1BQWlCLE9BQUEsQ0FBUSxNQUFSLENBQWpCLEVBQUMsaUJBQUQsRUFBUTs7RUFDUixJQUFBLEdBQU8sT0FBQSxDQUFRLFFBQVI7O0VBQ1AsS0FBQSxHQUFRLE9BQUEsQ0FBUSxxQkFBUjs7RUFDUixDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSOztFQUVKLE9BU0ksT0FBQSxDQUFRLFNBQVIsQ0FUSixFQUNFLHNDQURGLEVBRUUsc0NBRkYsRUFHRSxnQ0FIRixFQUlFLDRCQUpGLEVBS0Usb0RBTEYsRUFNRSwwQ0FORixFQU9FLHdEQVBGLEVBUUU7O0VBR0k7OztJQUNKLFdBQUMsQ0FBQSxNQUFELENBQVEsS0FBUjs7SUFDYSxxQkFBQTtNQUNYLDhDQUFBLFNBQUE7TUFDQSxJQUFDLENBQUEsVUFBRCxDQUFBO0lBRlc7Ozs7S0FGVzs7RUFNcEI7Ozs7Ozs7SUFDSixJQUFDLENBQUEsTUFBRCxDQUFBOzttQkFDQSxZQUFBLEdBQWM7O21CQUNkLFVBQUEsR0FBWSxTQUFBO01BQ1YsSUFBQyxDQUFBLFVBQUQsQ0FBQTthQUNBLHNDQUFBLFNBQUE7SUFGVTs7bUJBSVosT0FBQSxHQUFTLFNBQUE7TUFDUCxJQUFDLENBQUEsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFmLENBQW1CLElBQUMsQ0FBQSxLQUFwQixFQUEyQixJQUFDLENBQUEsTUFBTSxDQUFDLHVCQUFSLENBQUEsQ0FBM0I7YUFDQSxJQUFDLENBQUEsWUFBRCxDQUFjLFFBQWQ7SUFGTzs7OztLQVBROztFQVdiOzs7Ozs7O0lBQ0osaUJBQUMsQ0FBQSxNQUFELENBQUE7O2dDQUNBLE9BQUEsR0FBUyxTQUFBO01BQ1As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Q0osc0JBQUMsQ0FBQSxNQUFELENBQUE7O0lBQ0Esc0JBQUMsQ0FBQSxZQUFELEdBQWU7O3FDQUNmLGVBQUEsR0FBaUIsc0JBQUMsQ0FBQSxjQUFELENBQUE7O3FDQUVqQixPQUFBLEdBQVMsU0FBQTtBQUNQLFVBQUE7TUFBQSxrQkFBQSxHQUFxQixJQUFDLENBQUEsTUFBTSxDQUFDLFVBQVIsQ0FBQSxDQUFvQixDQUFDLE1BQXJCLENBQTRCLFNBQUMsTUFBRDtlQUFZLENBQUksTUFBTSxDQUFDLG1CQUFQLENBQUE7TUFBaEIsQ0FBNUI7TUFDckIsSUFBQyxDQUFBLFFBQVEsQ0FBQyxRQUFWLENBQW1CLFFBQW5CO0FBQ0EsV0FBQSxvREFBQTs7UUFBQSxlQUFBLENBQWdCLE1BQWhCO0FBQUE7YUFDQSxVQUFBLEdBQWEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxhQUFkLENBQTRCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxHQUFEO0FBQ3ZDLGNBQUE7VUFEeUMsT0FBRDtVQUN4QyxJQUFVLElBQUEsS0FBUSxLQUFDLENBQUEsZUFBbkI7QUFBQSxtQkFBQTs7VUFDQSxVQUFVLENBQUMsT0FBWCxDQUFBO1VBQ0EsVUFBQSxHQUFhO2lCQUNiLEtBQUMsQ0FBQSxRQUFRLENBQUMsUUFBVixDQUFtQixRQUFuQjtRQUp1QztNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBNUI7SUFKTjs7OztLQUwwQjtBQTVSckMiLCJzb3VyY2VzQ29udGVudCI6WyJ7UmFuZ2UsIFBvaW50fSA9IHJlcXVpcmUgJ2F0b20nXG5CYXNlID0gcmVxdWlyZSAnLi9iYXNlJ1xuc3dyYXAgPSByZXF1aXJlICcuL3NlbGVjdGlvbi13cmFwcGVyJ1xuXyA9IHJlcXVpcmUgJ3VuZGVyc2NvcmUtcGx1cydcblxue1xuICBtb3ZlQ3Vyc29yUmlnaHRcbiAgaXNMaW5ld2lzZVJhbmdlXG4gIHNldEJ1ZmZlclJvd1xuICBzb3J0UmFuZ2VzXG4gIGZpbmRSYW5nZUNvbnRhaW5zUG9pbnRcbiAgaXNTaW5nbGVMaW5lUmFuZ2VcbiAgaXNMZWFkaW5nV2hpdGVTcGFjZVJhbmdlXG4gIGh1bWFuaXplQnVmZmVyUmFuZ2Vcbn0gPSByZXF1aXJlICcuL3V0aWxzJ1xuXG5jbGFzcyBNaXNjQ29tbWFuZCBleHRlbmRzIEJhc2VcbiAgQGV4dGVuZChmYWxzZSlcbiAgY29uc3RydWN0b3I6IC0+XG4gICAgc3VwZXJcbiAgICBAaW5pdGlhbGl6ZSgpXG5cbmNsYXNzIE1hcmsgZXh0ZW5kcyBNaXNjQ29tbWFuZFxuICBAZXh0ZW5kKClcbiAgcmVxdWlyZUlucHV0OiB0cnVlXG4gIGluaXRpYWxpemU6IC0+XG4gICAgQGZvY3VzSW5wdXQoKVxuICAgIHN1cGVyXG5cbiAgZXhlY3V0ZTogLT5cbiAgICBAdmltU3RhdGUubWFyay5zZXQoQGlucHV0LCBAZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCkpXG4gICAgQGFjdGl2YXRlTW9kZSgnbm9ybWFsJylcblxuY2xhc3MgUmV2ZXJzZVNlbGVjdGlvbnMgZXh0ZW5kcyBNaXNjQ29tbWFuZFxuICBAZXh0ZW5kKClcbiAgZXhlY3V0ZTogLT5cbiAgICBzd3JhcC5zZXRSZXZlcnNlZFN0YXRlKEBlZGl0b3IsIG5vdCBAZWRpdG9yLmdldExhc3RTZWxlY3Rpb24oKS5pc1JldmVyc2VkKCkpXG4gICAgaWYgQGlzTW9kZSgndmlzdWFsJywgJ2Jsb2Nrd2lzZScpXG4gICAgICBAZ2V0TGFzdEJsb2Nrd2lzZVNlbGVjdGlvbigpLmF1dG9zY3JvbGwoKVxuXG5jbGFzcyBCbG9ja3dpc2VPdGhlckVuZCBleHRlbmRzIFJldmVyc2VTZWxlY3Rpb25zXG4gIEBleHRlbmQoKVxuICBleGVjdXRlOiAtPlxuICAgIGZvciBibG9ja3dpc2VTZWxlY3Rpb24gaW4gQGdldEJsb2Nrd2lzZVNlbGVjdGlvbnMoKVxuICAgICAgYmxvY2t3aXNlU2VsZWN0aW9uLnJldmVyc2UoKVxuICAgIHN1cGVyXG5cbmNsYXNzIFVuZG8gZXh0ZW5kcyBNaXNjQ29tbWFuZFxuICBAZXh0ZW5kKClcblxuICBzZXRDdXJzb3JQb3NpdGlvbjogKHtuZXdSYW5nZXMsIG9sZFJhbmdlcywgc3RyYXRlZ3l9KSAtPlxuICAgIGxhc3RDdXJzb3IgPSBAZWRpdG9yLmdldExhc3RDdXJzb3IoKSAjIFRoaXMgaXMgcmVzdG9yZWQgY3Vyc29yXG5cbiAgICBpZiBzdHJhdGVneSBpcyAnc21hcnQnXG4gICAgICBjaGFuZ2VkUmFuZ2UgPSBmaW5kUmFuZ2VDb250YWluc1BvaW50KG5ld1JhbmdlcywgbGFzdEN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpKVxuICAgIGVsc2VcbiAgICAgIGNoYW5nZWRSYW5nZSA9IHNvcnRSYW5nZXMobmV3UmFuZ2VzLmNvbmNhdChvbGRSYW5nZXMpKVswXVxuXG4gICAgaWYgY2hhbmdlZFJhbmdlP1xuICAgICAgaWYgaXNMaW5ld2lzZVJhbmdlKGNoYW5nZWRSYW5nZSlcbiAgICAgICAgc2V0QnVmZmVyUm93KGxhc3RDdXJzb3IsIGNoYW5nZWRSYW5nZS5zdGFydC5yb3cpXG4gICAgICBlbHNlXG4gICAgICAgIGxhc3RDdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24oY2hhbmdlZFJhbmdlLnN0YXJ0KVxuXG4gIG11dGF0ZVdpdGhUcmFja0NoYW5nZXM6IC0+XG4gICAgbmV3UmFuZ2VzID0gW11cbiAgICBvbGRSYW5nZXMgPSBbXVxuXG4gICAgIyBDb2xsZWN0IGNoYW5nZWQgcmFuZ2Ugd2hpbGUgbXV0YXRpbmcgdGV4dC1zdGF0ZSBieSBmbiBjYWxsYmFjay5cbiAgICBkaXNwb3NhYmxlID0gQGVkaXRvci5nZXRCdWZmZXIoKS5vbkRpZENoYW5nZSAoe25ld1JhbmdlLCBvbGRSYW5nZX0pIC0+XG4gICAgICBpZiBuZXdSYW5nZS5pc0VtcHR5KClcbiAgICAgICAgb2xkUmFuZ2VzLnB1c2gob2xkUmFuZ2UpICMgUmVtb3ZlIG9ubHlcbiAgICAgIGVsc2VcbiAgICAgICAgbmV3UmFuZ2VzLnB1c2gobmV3UmFuZ2UpXG5cbiAgICBAbXV0YXRlKClcblxuICAgIGRpc3Bvc2FibGUuZGlzcG9zZSgpXG4gICAge25ld1Jhbmdlcywgb2xkUmFuZ2VzfVxuXG4gIGZsYXNoQ2hhbmdlczogKHtuZXdSYW5nZXMsIG9sZFJhbmdlc30pIC0+XG4gICAgaXNNdWx0aXBsZVNpbmdsZUxpbmVSYW5nZXMgPSAocmFuZ2VzKSAtPlxuICAgICAgcmFuZ2VzLmxlbmd0aCA+IDEgYW5kIHJhbmdlcy5ldmVyeShpc1NpbmdsZUxpbmVSYW5nZSlcblxuICAgIGlmIG5ld1Jhbmdlcy5sZW5ndGggPiAwXG4gICAgICByZXR1cm4gaWYgQGlzTXVsdGlwbGVBbmRBbGxSYW5nZUhhdmVTYW1lQ29sdW1uUmFuZ2VzKG5ld1JhbmdlcylcbiAgICAgIG5ld1JhbmdlcyA9IG5ld1Jhbmdlcy5tYXAgKHJhbmdlKSA9PiBodW1hbml6ZUJ1ZmZlclJhbmdlKEBlZGl0b3IsIHJhbmdlKVxuICAgICAgbmV3UmFuZ2VzID0gQGZpbHRlck5vbkxlYWRpbmdXaGl0ZVNwYWNlUmFuZ2UobmV3UmFuZ2VzKVxuXG4gICAgICBpZiBpc011bHRpcGxlU2luZ2xlTGluZVJhbmdlcyhuZXdSYW5nZXMpXG4gICAgICAgIEBmbGFzaChuZXdSYW5nZXMsIHR5cGU6ICd1bmRvLXJlZG8tbXVsdGlwbGUtY2hhbmdlcycpXG4gICAgICBlbHNlXG4gICAgICAgIEBmbGFzaChuZXdSYW5nZXMsIHR5cGU6ICd1bmRvLXJlZG8nKVxuICAgIGVsc2VcbiAgICAgIHJldHVybiBpZiBAaXNNdWx0aXBsZUFuZEFsbFJhbmdlSGF2ZVNhbWVDb2x1bW5SYW5nZXMob2xkUmFuZ2VzKVxuXG4gICAgICBpZiBpc011bHRpcGxlU2luZ2xlTGluZVJhbmdlcyhvbGRSYW5nZXMpXG4gICAgICAgIG9sZFJhbmdlcyA9IEBmaWx0ZXJOb25MZWFkaW5nV2hpdGVTcGFjZVJhbmdlKG9sZFJhbmdlcylcbiAgICAgICAgQGZsYXNoKG9sZFJhbmdlcywgdHlwZTogJ3VuZG8tcmVkby1tdWx0aXBsZS1kZWxldGUnKVxuXG4gIGZpbHRlck5vbkxlYWRpbmdXaGl0ZVNwYWNlUmFuZ2U6IChyYW5nZXMpIC0+XG4gICAgcmFuZ2VzLmZpbHRlciAocmFuZ2UpID0+XG4gICAgICBub3QgaXNMZWFkaW5nV2hpdGVTcGFjZVJhbmdlKEBlZGl0b3IsIHJhbmdlKVxuXG4gIGlzTXVsdGlwbGVBbmRBbGxSYW5nZUhhdmVTYW1lQ29sdW1uUmFuZ2VzOiAocmFuZ2VzKSAtPlxuICAgIHJldHVybiBmYWxzZSBpZiByYW5nZXMubGVuZ3RoIDw9IDFcblxuICAgIHtzdGFydCwgZW5kfSA9IHJhbmdlc1swXVxuICAgIHN0YXJ0Q29sdW1uID0gc3RhcnQuY29sdW1uXG4gICAgZW5kQ29sdW1uID0gZW5kLmNvbHVtblxuXG4gICAgcmFuZ2VzLmV2ZXJ5ICh7c3RhcnQsIGVuZH0pIC0+XG4gICAgICAoc3RhcnQuY29sdW1uIGlzIHN0YXJ0Q29sdW1uKSBhbmQgKGVuZC5jb2x1bW4gaXMgZW5kQ29sdW1uKVxuXG4gIGZsYXNoOiAoZmxhc2hSYW5nZXMsIG9wdGlvbnMpIC0+XG4gICAgb3B0aW9ucy50aW1lb3V0ID89IDUwMFxuICAgIEBvbkRpZEZpbmlzaE9wZXJhdGlvbiA9PlxuICAgICAgQHZpbVN0YXRlLmZsYXNoKGZsYXNoUmFuZ2VzLCBvcHRpb25zKVxuXG4gIGV4ZWN1dGU6IC0+XG4gICAge25ld1Jhbmdlcywgb2xkUmFuZ2VzfSA9IEBtdXRhdGVXaXRoVHJhY2tDaGFuZ2VzKClcblxuICAgIGZvciBzZWxlY3Rpb24gaW4gQGVkaXRvci5nZXRTZWxlY3Rpb25zKClcbiAgICAgIHNlbGVjdGlvbi5jbGVhcigpXG5cbiAgICBpZiBAZ2V0Q29uZmlnKCdzZXRDdXJzb3JUb1N0YXJ0T2ZDaGFuZ2VPblVuZG9SZWRvJylcbiAgICAgIHN0cmF0ZWd5ID0gQGdldENvbmZpZygnc2V0Q3Vyc29yVG9TdGFydE9mQ2hhbmdlT25VbmRvUmVkb1N0cmF0ZWd5JylcbiAgICAgIEBzZXRDdXJzb3JQb3NpdGlvbih7bmV3UmFuZ2VzLCBvbGRSYW5nZXMsIHN0cmF0ZWd5fSlcbiAgICAgIEB2aW1TdGF0ZS5jbGVhclNlbGVjdGlvbnMoKVxuXG4gICAgaWYgQGdldENvbmZpZygnZmxhc2hPblVuZG9SZWRvJylcbiAgICAgIEBmbGFzaENoYW5nZXMoe25ld1Jhbmdlcywgb2xkUmFuZ2VzfSlcblxuICAgIEBhY3RpdmF0ZU1vZGUoJ25vcm1hbCcpXG5cbiAgbXV0YXRlOiAtPlxuICAgIEBlZGl0b3IudW5kbygpXG5cbmNsYXNzIFJlZG8gZXh0ZW5kcyBVbmRvXG4gIEBleHRlbmQoKVxuICBtdXRhdGU6IC0+XG4gICAgQGVkaXRvci5yZWRvKClcblxuY2xhc3MgVG9nZ2xlRm9sZCBleHRlbmRzIE1pc2NDb21tYW5kXG4gIEBleHRlbmQoKVxuICBleGVjdXRlOiAtPlxuICAgIHBvaW50ID0gQGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpXG4gICAgQGVkaXRvci50b2dnbGVGb2xkQXRCdWZmZXJSb3cocG9pbnQucm93KVxuXG5jbGFzcyBSZXBsYWNlTW9kZUJhY2tzcGFjZSBleHRlbmRzIE1pc2NDb21tYW5kXG4gIEBjb21tYW5kU2NvcGU6ICdhdG9tLXRleHQtZWRpdG9yLnZpbS1tb2RlLXBsdXMuaW5zZXJ0LW1vZGUucmVwbGFjZSdcbiAgQGV4dGVuZCgpXG4gIGV4ZWN1dGU6IC0+XG4gICAgZm9yIHNlbGVjdGlvbiBpbiBAZWRpdG9yLmdldFNlbGVjdGlvbnMoKVxuICAgICAgIyBjaGFyIG1pZ2h0IGJlIGVtcHR5LlxuICAgICAgY2hhciA9IEB2aW1TdGF0ZS5tb2RlTWFuYWdlci5nZXRSZXBsYWNlZENoYXJGb3JTZWxlY3Rpb24oc2VsZWN0aW9uKVxuICAgICAgaWYgY2hhcj9cbiAgICAgICAgc2VsZWN0aW9uLnNlbGVjdExlZnQoKVxuICAgICAgICB1bmxlc3Mgc2VsZWN0aW9uLmluc2VydFRleHQoY2hhcikuaXNFbXB0eSgpXG4gICAgICAgICAgc2VsZWN0aW9uLmN1cnNvci5tb3ZlTGVmdCgpXG5cbmNsYXNzIFNjcm9sbFdpdGhvdXRDaGFuZ2luZ0N1cnNvclBvc2l0aW9uIGV4dGVuZHMgTWlzY0NvbW1hbmRcbiAgQGV4dGVuZChmYWxzZSlcbiAgc2Nyb2xsb2ZmOiAyICMgYXRvbSBkZWZhdWx0LiBCZXR0ZXIgdG8gdXNlIGVkaXRvci5nZXRWZXJ0aWNhbFNjcm9sbE1hcmdpbigpP1xuICBjdXJzb3JQaXhlbDogbnVsbFxuXG4gIGdldEZpcnN0VmlzaWJsZVNjcmVlblJvdzogLT5cbiAgICBAZWRpdG9yRWxlbWVudC5nZXRGaXJzdFZpc2libGVTY3JlZW5Sb3coKVxuXG4gIGdldExhc3RWaXNpYmxlU2NyZWVuUm93OiAtPlxuICAgIEBlZGl0b3JFbGVtZW50LmdldExhc3RWaXNpYmxlU2NyZWVuUm93KClcblxuICBnZXRMYXN0U2NyZWVuUm93OiAtPlxuICAgIEBlZGl0b3IuZ2V0TGFzdFNjcmVlblJvdygpXG5cbiAgZ2V0Q3Vyc29yUGl4ZWw6IC0+XG4gICAgcG9pbnQgPSBAZWRpdG9yLmdldEN1cnNvclNjcmVlblBvc2l0aW9uKClcbiAgICBAZWRpdG9yRWxlbWVudC5waXhlbFBvc2l0aW9uRm9yU2NyZWVuUG9zaXRpb24ocG9pbnQpXG5cbiMgY3RybC1lIHNjcm9sbCBsaW5lcyBkb3dud2FyZHNcbmNsYXNzIFNjcm9sbERvd24gZXh0ZW5kcyBTY3JvbGxXaXRob3V0Q2hhbmdpbmdDdXJzb3JQb3NpdGlvblxuICBAZXh0ZW5kKClcblxuICBleGVjdXRlOiAtPlxuICAgIGNvdW50ID0gQGdldENvdW50KClcbiAgICBvbGRGaXJzdFJvdyA9IEBlZGl0b3IuZ2V0Rmlyc3RWaXNpYmxlU2NyZWVuUm93KClcbiAgICBAZWRpdG9yLnNldEZpcnN0VmlzaWJsZVNjcmVlblJvdyhvbGRGaXJzdFJvdyArIGNvdW50KVxuICAgIG5ld0ZpcnN0Um93ID0gQGVkaXRvci5nZXRGaXJzdFZpc2libGVTY3JlZW5Sb3coKVxuXG4gICAgbWFyZ2luID0gQGVkaXRvci5nZXRWZXJ0aWNhbFNjcm9sbE1hcmdpbigpXG4gICAge3JvdywgY29sdW1ufSA9IEBlZGl0b3IuZ2V0Q3Vyc29yU2NyZWVuUG9zaXRpb24oKVxuICAgIGlmIHJvdyA8IChuZXdGaXJzdFJvdyArIG1hcmdpbilcbiAgICAgIG5ld1BvaW50ID0gW3JvdyArIGNvdW50LCBjb2x1bW5dXG4gICAgICBAZWRpdG9yLnNldEN1cnNvclNjcmVlblBvc2l0aW9uKG5ld1BvaW50LCBhdXRvc2Nyb2xsOiBmYWxzZSlcblxuIyBjdHJsLXkgc2Nyb2xsIGxpbmVzIHVwd2FyZHNcbmNsYXNzIFNjcm9sbFVwIGV4dGVuZHMgU2Nyb2xsV2l0aG91dENoYW5naW5nQ3Vyc29yUG9zaXRpb25cbiAgQGV4dGVuZCgpXG5cbiAgZXhlY3V0ZTogLT5cbiAgICBjb3VudCA9IEBnZXRDb3VudCgpXG4gICAgb2xkRmlyc3RSb3cgPSBAZWRpdG9yLmdldEZpcnN0VmlzaWJsZVNjcmVlblJvdygpXG4gICAgQGVkaXRvci5zZXRGaXJzdFZpc2libGVTY3JlZW5Sb3cob2xkRmlyc3RSb3cgLSBjb3VudClcbiAgICBuZXdMYXN0Um93ID0gQGVkaXRvci5nZXRMYXN0VmlzaWJsZVNjcmVlblJvdygpXG5cbiAgICBtYXJnaW4gPSBAZWRpdG9yLmdldFZlcnRpY2FsU2Nyb2xsTWFyZ2luKClcbiAgICB7cm93LCBjb2x1bW59ID0gQGVkaXRvci5nZXRDdXJzb3JTY3JlZW5Qb3NpdGlvbigpXG4gICAgaWYgcm93ID49IChuZXdMYXN0Um93IC0gbWFyZ2luKVxuICAgICAgbmV3UG9pbnQgPSBbcm93IC0gY291bnQsIGNvbHVtbl1cbiAgICAgIEBlZGl0b3Iuc2V0Q3Vyc29yU2NyZWVuUG9zaXRpb24obmV3UG9pbnQsIGF1dG9zY3JvbGw6IGZhbHNlKVxuXG4jIFNjcm9sbFdpdGhvdXRDaGFuZ2luZ0N1cnNvclBvc2l0aW9uIHdpdGhvdXQgQ3Vyc29yIFBvc2l0aW9uIGNoYW5nZS5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgU2Nyb2xsQ3Vyc29yIGV4dGVuZHMgU2Nyb2xsV2l0aG91dENoYW5naW5nQ3Vyc29yUG9zaXRpb25cbiAgQGV4dGVuZChmYWxzZSlcbiAgZXhlY3V0ZTogLT5cbiAgICBAbW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmU/KClcbiAgICBpZiBAaXNTY3JvbGxhYmxlKClcbiAgICAgIEBlZGl0b3JFbGVtZW50LnNldFNjcm9sbFRvcCBAZ2V0U2Nyb2xsVG9wKClcblxuICBtb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZTogLT5cbiAgICBAZWRpdG9yLm1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lKClcblxuICBnZXRPZmZTZXRQaXhlbEhlaWdodDogKGxpbmVEZWx0YT0wKSAtPlxuICAgIEBlZGl0b3IuZ2V0TGluZUhlaWdodEluUGl4ZWxzKCkgKiAoQHNjcm9sbG9mZiArIGxpbmVEZWx0YSlcblxuIyB6IGVudGVyXG5jbGFzcyBTY3JvbGxDdXJzb3JUb1RvcCBleHRlbmRzIFNjcm9sbEN1cnNvclxuICBAZXh0ZW5kKClcbiAgaXNTY3JvbGxhYmxlOiAtPlxuICAgIEBnZXRMYXN0VmlzaWJsZVNjcmVlblJvdygpIGlzbnQgQGdldExhc3RTY3JlZW5Sb3coKVxuXG4gIGdldFNjcm9sbFRvcDogLT5cbiAgICBAZ2V0Q3Vyc29yUGl4ZWwoKS50b3AgLSBAZ2V0T2ZmU2V0UGl4ZWxIZWlnaHQoKVxuXG4jIHp0XG5jbGFzcyBTY3JvbGxDdXJzb3JUb1RvcExlYXZlIGV4dGVuZHMgU2Nyb2xsQ3Vyc29yVG9Ub3BcbiAgQGV4dGVuZCgpXG4gIG1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lOiBudWxsXG5cbiMgei1cbmNsYXNzIFNjcm9sbEN1cnNvclRvQm90dG9tIGV4dGVuZHMgU2Nyb2xsQ3Vyc29yXG4gIEBleHRlbmQoKVxuICBpc1Njcm9sbGFibGU6IC0+XG4gICAgQGdldEZpcnN0VmlzaWJsZVNjcmVlblJvdygpIGlzbnQgMFxuXG4gIGdldFNjcm9sbFRvcDogLT5cbiAgICBAZ2V0Q3Vyc29yUGl4ZWwoKS50b3AgLSAoQGVkaXRvckVsZW1lbnQuZ2V0SGVpZ2h0KCkgLSBAZ2V0T2ZmU2V0UGl4ZWxIZWlnaHQoMSkpXG5cbiMgemJcbmNsYXNzIFNjcm9sbEN1cnNvclRvQm90dG9tTGVhdmUgZXh0ZW5kcyBTY3JvbGxDdXJzb3JUb0JvdHRvbVxuICBAZXh0ZW5kKClcbiAgbW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmU6IG51bGxcblxuIyB6LlxuY2xhc3MgU2Nyb2xsQ3Vyc29yVG9NaWRkbGUgZXh0ZW5kcyBTY3JvbGxDdXJzb3JcbiAgQGV4dGVuZCgpXG4gIGlzU2Nyb2xsYWJsZTogLT5cbiAgICB0cnVlXG5cbiAgZ2V0U2Nyb2xsVG9wOiAtPlxuICAgIEBnZXRDdXJzb3JQaXhlbCgpLnRvcCAtIChAZWRpdG9yRWxlbWVudC5nZXRIZWlnaHQoKSAvIDIpXG5cbiMgenpcbmNsYXNzIFNjcm9sbEN1cnNvclRvTWlkZGxlTGVhdmUgZXh0ZW5kcyBTY3JvbGxDdXJzb3JUb01pZGRsZVxuICBAZXh0ZW5kKClcbiAgbW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmU6IG51bGxcblxuIyBIb3Jpem9udGFsIFNjcm9sbFdpdGhvdXRDaGFuZ2luZ0N1cnNvclBvc2l0aW9uXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgenNcbmNsYXNzIFNjcm9sbEN1cnNvclRvTGVmdCBleHRlbmRzIFNjcm9sbFdpdGhvdXRDaGFuZ2luZ0N1cnNvclBvc2l0aW9uXG4gIEBleHRlbmQoKVxuXG4gIGV4ZWN1dGU6IC0+XG4gICAgQGVkaXRvckVsZW1lbnQuc2V0U2Nyb2xsTGVmdChAZ2V0Q3Vyc29yUGl4ZWwoKS5sZWZ0KVxuXG4jIHplXG5jbGFzcyBTY3JvbGxDdXJzb3JUb1JpZ2h0IGV4dGVuZHMgU2Nyb2xsQ3Vyc29yVG9MZWZ0XG4gIEBleHRlbmQoKVxuXG4gIGV4ZWN1dGU6IC0+XG4gICAgQGVkaXRvckVsZW1lbnQuc2V0U2Nyb2xsUmlnaHQoQGdldEN1cnNvclBpeGVsKCkubGVmdClcblxuY2xhc3MgQWN0aXZhdGVOb3JtYWxNb2RlT25jZSBleHRlbmRzIE1pc2NDb21tYW5kXG4gIEBleHRlbmQoKVxuICBAY29tbWFuZFNjb3BlOiAnYXRvbS10ZXh0LWVkaXRvci52aW0tbW9kZS1wbHVzLmluc2VydC1tb2RlJ1xuICB0aGlzQ29tbWFuZE5hbWU6IEBnZXRDb21tYW5kTmFtZSgpXG5cbiAgZXhlY3V0ZTogLT5cbiAgICBjdXJzb3JzVG9Nb3ZlUmlnaHQgPSBAZWRpdG9yLmdldEN1cnNvcnMoKS5maWx0ZXIgKGN1cnNvcikgLT4gbm90IGN1cnNvci5pc0F0QmVnaW5uaW5nT2ZMaW5lKClcbiAgICBAdmltU3RhdGUuYWN0aXZhdGUoJ25vcm1hbCcpXG4gICAgbW92ZUN1cnNvclJpZ2h0KGN1cnNvcikgZm9yIGN1cnNvciBpbiBjdXJzb3JzVG9Nb3ZlUmlnaHRcbiAgICBkaXNwb3NhYmxlID0gYXRvbS5jb21tYW5kcy5vbkRpZERpc3BhdGNoICh7dHlwZX0pID0+XG4gICAgICByZXR1cm4gaWYgdHlwZSBpcyBAdGhpc0NvbW1hbmROYW1lXG4gICAgICBkaXNwb3NhYmxlLmRpc3Bvc2UoKVxuICAgICAgZGlzcG9zYWJsZSA9IG51bGxcbiAgICAgIEB2aW1TdGF0ZS5hY3RpdmF0ZSgnaW5zZXJ0JylcbiJdfQ==
