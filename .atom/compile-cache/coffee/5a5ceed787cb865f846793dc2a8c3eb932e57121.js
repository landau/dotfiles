(function() {
  var ActivateNormalModeOnce, Base, BlockwiseOtherEnd, Mark, MiscCommand, Point, Range, Redo, ReplaceModeBackspace, ReverseSelections, ScrollCursor, ScrollCursorToBottom, ScrollCursorToBottomLeave, ScrollCursorToLeft, ScrollCursorToMiddle, ScrollCursorToMiddleLeave, ScrollCursorToRight, ScrollCursorToTop, ScrollCursorToTopLeave, ScrollDown, ScrollUp, ScrollWithoutChangingCursorPosition, ToggleFold, Undo, _, findRangeContainsPoint, humanizeBufferRange, isLeadingWhiteSpaceRange, isLinewiseRange, isSingleLineRange, mergeIntersectingRanges, moveCursorRight, pointIsAtEndOfLine, ref, ref1, setBufferRow, settings, sortRanges, swrap,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  ref = require('atom'), Range = ref.Range, Point = ref.Point;

  Base = require('./base');

  swrap = require('./selection-wrapper');

  settings = require('./settings');

  _ = require('underscore-plus');

  ref1 = require('./utils'), moveCursorRight = ref1.moveCursorRight, isLinewiseRange = ref1.isLinewiseRange, setBufferRow = ref1.setBufferRow, pointIsAtEndOfLine = ref1.pointIsAtEndOfLine, sortRanges = ref1.sortRanges, findRangeContainsPoint = ref1.findRangeContainsPoint, mergeIntersectingRanges = ref1.mergeIntersectingRanges, isSingleLineRange = ref1.isSingleLineRange, isLinewiseRange = ref1.isLinewiseRange, isLeadingWhiteSpaceRange = ref1.isLeadingWhiteSpaceRange, humanizeBufferRange = ref1.humanizeBufferRange;

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
        return this.getLastBlockwiseSelection().autoscrollIfReversed();
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
      if (settings.get('setCursorToStartOfChangeOnUndoRedo')) {
        strategy = settings.get('setCursorToStartOfChangeOnUndoRedoStrategy');
        this.setCursorPosition({
          newRanges: newRanges,
          oldRanges: oldRanges,
          strategy: strategy
        });
        this.vimState.clearSelections();
      }
      if (settings.get('flashOnUndoRedo')) {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvbWlzYy1jb21tYW5kLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsa25CQUFBO0lBQUE7OztFQUFBLE1BQWlCLE9BQUEsQ0FBUSxNQUFSLENBQWpCLEVBQUMsaUJBQUQsRUFBUTs7RUFDUixJQUFBLEdBQU8sT0FBQSxDQUFRLFFBQVI7O0VBQ1AsS0FBQSxHQUFRLE9BQUEsQ0FBUSxxQkFBUjs7RUFDUixRQUFBLEdBQVcsT0FBQSxDQUFRLFlBQVI7O0VBQ1gsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUjs7RUFFSixPQVlJLE9BQUEsQ0FBUSxTQUFSLENBWkosRUFDRSxzQ0FERixFQUVFLHNDQUZGLEVBR0UsZ0NBSEYsRUFJRSw0Q0FKRixFQUtFLDRCQUxGLEVBTUUsb0RBTkYsRUFPRSxzREFQRixFQVFFLDBDQVJGLEVBU0Usc0NBVEYsRUFVRSx3REFWRixFQVdFOztFQUdJOzs7SUFDSixXQUFDLENBQUEsTUFBRCxDQUFRLEtBQVI7O0lBQ2EscUJBQUE7TUFDWCw4Q0FBQSxTQUFBO01BQ0EsSUFBQyxDQUFBLFVBQUQsQ0FBQTtJQUZXOzs7O0tBRlc7O0VBTXBCOzs7Ozs7O0lBQ0osSUFBQyxDQUFBLE1BQUQsQ0FBQTs7bUJBQ0EsWUFBQSxHQUFjOzttQkFDZCxVQUFBLEdBQVksU0FBQTtNQUNWLElBQUMsQ0FBQSxVQUFELENBQUE7YUFDQSxzQ0FBQSxTQUFBO0lBRlU7O21CQUlaLE9BQUEsR0FBUyxTQUFBO01BQ1AsSUFBQyxDQUFBLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBZixDQUFtQixJQUFDLENBQUEsS0FBcEIsRUFBMkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyx1QkFBUixDQUFBLENBQTNCO2FBQ0EsSUFBQyxDQUFBLFlBQUQsQ0FBYyxRQUFkO0lBRk87Ozs7S0FQUTs7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QUFDLENBQUEsY0FBRCxDQUFBLENBQWlCLENBQUMsSUFBaEQ7SUFETzs7OztLQUh1Qjs7RUFNNUI7Ozs7Ozs7SUFDSixzQkFBQyxDQUFBLE1BQUQsQ0FBQTs7SUFDQSxzQkFBQyxDQUFBLFlBQUQsR0FBZTs7cUNBQ2YsZUFBQSxHQUFpQixzQkFBQyxDQUFBLGNBQUQsQ0FBQTs7cUNBRWpCLE9BQUEsR0FBUyxTQUFBO0FBQ1AsVUFBQTtNQUFBLGtCQUFBLEdBQXFCLElBQUMsQ0FBQSxNQUFNLENBQUMsVUFBUixDQUFBLENBQW9CLENBQUMsTUFBckIsQ0FBNEIsU0FBQyxNQUFEO2VBQVksQ0FBSSxNQUFNLENBQUMsbUJBQVAsQ0FBQTtNQUFoQixDQUE1QjtNQUNyQixJQUFDLENBQUEsUUFBUSxDQUFDLFFBQVYsQ0FBbUIsUUFBbkI7QUFDQSxXQUFBLG9EQUFBOztRQUFBLGVBQUEsQ0FBZ0IsTUFBaEI7QUFBQTthQUNBLFVBQUEsR0FBYSxJQUFJLENBQUMsUUFBUSxDQUFDLGFBQWQsQ0FBNEIsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLEdBQUQ7QUFDdkMsY0FBQTtVQUR5QyxPQUFEO1VBQ3hDLElBQVUsSUFBQSxLQUFRLEtBQUMsQ0FBQSxlQUFuQjtBQUFBLG1CQUFBOztVQUNBLFVBQVUsQ0FBQyxPQUFYLENBQUE7VUFDQSxVQUFBLEdBQWE7aUJBQ2IsS0FBQyxDQUFBLFFBQVEsQ0FBQyxRQUFWLENBQW1CLFFBQW5CO1FBSnVDO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE1QjtJQUpOOzs7O0tBTDBCO0FBaFNyQyIsInNvdXJjZXNDb250ZW50IjpbIntSYW5nZSwgUG9pbnR9ID0gcmVxdWlyZSAnYXRvbSdcbkJhc2UgPSByZXF1aXJlICcuL2Jhc2UnXG5zd3JhcCA9IHJlcXVpcmUgJy4vc2VsZWN0aW9uLXdyYXBwZXInXG5zZXR0aW5ncyA9IHJlcXVpcmUgJy4vc2V0dGluZ3MnXG5fID0gcmVxdWlyZSAndW5kZXJzY29yZS1wbHVzJ1xuXG57XG4gIG1vdmVDdXJzb3JSaWdodFxuICBpc0xpbmV3aXNlUmFuZ2VcbiAgc2V0QnVmZmVyUm93XG4gIHBvaW50SXNBdEVuZE9mTGluZVxuICBzb3J0UmFuZ2VzXG4gIGZpbmRSYW5nZUNvbnRhaW5zUG9pbnRcbiAgbWVyZ2VJbnRlcnNlY3RpbmdSYW5nZXNcbiAgaXNTaW5nbGVMaW5lUmFuZ2VcbiAgaXNMaW5ld2lzZVJhbmdlXG4gIGlzTGVhZGluZ1doaXRlU3BhY2VSYW5nZVxuICBodW1hbml6ZUJ1ZmZlclJhbmdlXG59ID0gcmVxdWlyZSAnLi91dGlscydcblxuY2xhc3MgTWlzY0NvbW1hbmQgZXh0ZW5kcyBCYXNlXG4gIEBleHRlbmQoZmFsc2UpXG4gIGNvbnN0cnVjdG9yOiAtPlxuICAgIHN1cGVyXG4gICAgQGluaXRpYWxpemUoKVxuXG5jbGFzcyBNYXJrIGV4dGVuZHMgTWlzY0NvbW1hbmRcbiAgQGV4dGVuZCgpXG4gIHJlcXVpcmVJbnB1dDogdHJ1ZVxuICBpbml0aWFsaXplOiAtPlxuICAgIEBmb2N1c0lucHV0KClcbiAgICBzdXBlclxuXG4gIGV4ZWN1dGU6IC0+XG4gICAgQHZpbVN0YXRlLm1hcmsuc2V0KEBpbnB1dCwgQGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpKVxuICAgIEBhY3RpdmF0ZU1vZGUoJ25vcm1hbCcpXG5cbmNsYXNzIFJldmVyc2VTZWxlY3Rpb25zIGV4dGVuZHMgTWlzY0NvbW1hbmRcbiAgQGV4dGVuZCgpXG4gIGV4ZWN1dGU6IC0+XG4gICAgc3dyYXAuc2V0UmV2ZXJzZWRTdGF0ZShAZWRpdG9yLCBub3QgQGVkaXRvci5nZXRMYXN0U2VsZWN0aW9uKCkuaXNSZXZlcnNlZCgpKVxuICAgIGlmIEBpc01vZGUoJ3Zpc3VhbCcsICdibG9ja3dpc2UnKVxuICAgICAgQGdldExhc3RCbG9ja3dpc2VTZWxlY3Rpb24oKS5hdXRvc2Nyb2xsSWZSZXZlcnNlZCgpXG5cbmNsYXNzIEJsb2Nrd2lzZU90aGVyRW5kIGV4dGVuZHMgUmV2ZXJzZVNlbGVjdGlvbnNcbiAgQGV4dGVuZCgpXG4gIGV4ZWN1dGU6IC0+XG4gICAgZm9yIGJsb2Nrd2lzZVNlbGVjdGlvbiBpbiBAZ2V0QmxvY2t3aXNlU2VsZWN0aW9ucygpXG4gICAgICBibG9ja3dpc2VTZWxlY3Rpb24ucmV2ZXJzZSgpXG4gICAgc3VwZXJcblxuY2xhc3MgVW5kbyBleHRlbmRzIE1pc2NDb21tYW5kXG4gIEBleHRlbmQoKVxuXG4gIHNldEN1cnNvclBvc2l0aW9uOiAoe25ld1Jhbmdlcywgb2xkUmFuZ2VzLCBzdHJhdGVneX0pIC0+XG4gICAgbGFzdEN1cnNvciA9IEBlZGl0b3IuZ2V0TGFzdEN1cnNvcigpICMgVGhpcyBpcyByZXN0b3JlZCBjdXJzb3JcblxuICAgIGlmIHN0cmF0ZWd5IGlzICdzbWFydCdcbiAgICAgIGNoYW5nZWRSYW5nZSA9IGZpbmRSYW5nZUNvbnRhaW5zUG9pbnQobmV3UmFuZ2VzLCBsYXN0Q3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKCkpXG4gICAgZWxzZVxuICAgICAgY2hhbmdlZFJhbmdlID0gc29ydFJhbmdlcyhuZXdSYW5nZXMuY29uY2F0KG9sZFJhbmdlcykpWzBdXG5cbiAgICBpZiBjaGFuZ2VkUmFuZ2U/XG4gICAgICBpZiBpc0xpbmV3aXNlUmFuZ2UoY2hhbmdlZFJhbmdlKVxuICAgICAgICBzZXRCdWZmZXJSb3cobGFzdEN1cnNvciwgY2hhbmdlZFJhbmdlLnN0YXJ0LnJvdylcbiAgICAgIGVsc2VcbiAgICAgICAgbGFzdEN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihjaGFuZ2VkUmFuZ2Uuc3RhcnQpXG5cbiAgbXV0YXRlV2l0aFRyYWNrQ2hhbmdlczogLT5cbiAgICBuZXdSYW5nZXMgPSBbXVxuICAgIG9sZFJhbmdlcyA9IFtdXG5cbiAgICAjIENvbGxlY3QgY2hhbmdlZCByYW5nZSB3aGlsZSBtdXRhdGluZyB0ZXh0LXN0YXRlIGJ5IGZuIGNhbGxiYWNrLlxuICAgIGRpc3Bvc2FibGUgPSBAZWRpdG9yLmdldEJ1ZmZlcigpLm9uRGlkQ2hhbmdlICh7bmV3UmFuZ2UsIG9sZFJhbmdlfSkgLT5cbiAgICAgIGlmIG5ld1JhbmdlLmlzRW1wdHkoKVxuICAgICAgICBvbGRSYW5nZXMucHVzaChvbGRSYW5nZSkgIyBSZW1vdmUgb25seVxuICAgICAgZWxzZVxuICAgICAgICBuZXdSYW5nZXMucHVzaChuZXdSYW5nZSlcblxuICAgIEBtdXRhdGUoKVxuXG4gICAgZGlzcG9zYWJsZS5kaXNwb3NlKClcbiAgICB7bmV3UmFuZ2VzLCBvbGRSYW5nZXN9XG5cbiAgZmxhc2hDaGFuZ2VzOiAoe25ld1Jhbmdlcywgb2xkUmFuZ2VzfSkgLT5cbiAgICBpc011bHRpcGxlU2luZ2xlTGluZVJhbmdlcyA9IChyYW5nZXMpIC0+XG4gICAgICByYW5nZXMubGVuZ3RoID4gMSBhbmQgcmFuZ2VzLmV2ZXJ5KGlzU2luZ2xlTGluZVJhbmdlKVxuXG4gICAgaWYgbmV3UmFuZ2VzLmxlbmd0aCA+IDBcbiAgICAgIHJldHVybiBpZiBAaXNNdWx0aXBsZUFuZEFsbFJhbmdlSGF2ZVNhbWVDb2x1bW5SYW5nZXMobmV3UmFuZ2VzKVxuICAgICAgbmV3UmFuZ2VzID0gbmV3UmFuZ2VzLm1hcCAocmFuZ2UpID0+IGh1bWFuaXplQnVmZmVyUmFuZ2UoQGVkaXRvciwgcmFuZ2UpXG4gICAgICBuZXdSYW5nZXMgPSBAZmlsdGVyTm9uTGVhZGluZ1doaXRlU3BhY2VSYW5nZShuZXdSYW5nZXMpXG5cbiAgICAgIGlmIGlzTXVsdGlwbGVTaW5nbGVMaW5lUmFuZ2VzKG5ld1JhbmdlcylcbiAgICAgICAgQGZsYXNoKG5ld1JhbmdlcywgdHlwZTogJ3VuZG8tcmVkby1tdWx0aXBsZS1jaGFuZ2VzJylcbiAgICAgIGVsc2VcbiAgICAgICAgQGZsYXNoKG5ld1JhbmdlcywgdHlwZTogJ3VuZG8tcmVkbycpXG4gICAgZWxzZVxuICAgICAgcmV0dXJuIGlmIEBpc011bHRpcGxlQW5kQWxsUmFuZ2VIYXZlU2FtZUNvbHVtblJhbmdlcyhvbGRSYW5nZXMpXG5cbiAgICAgIGlmIGlzTXVsdGlwbGVTaW5nbGVMaW5lUmFuZ2VzKG9sZFJhbmdlcylcbiAgICAgICAgb2xkUmFuZ2VzID0gQGZpbHRlck5vbkxlYWRpbmdXaGl0ZVNwYWNlUmFuZ2Uob2xkUmFuZ2VzKVxuICAgICAgICBAZmxhc2gob2xkUmFuZ2VzLCB0eXBlOiAndW5kby1yZWRvLW11bHRpcGxlLWRlbGV0ZScpXG5cbiAgZmlsdGVyTm9uTGVhZGluZ1doaXRlU3BhY2VSYW5nZTogKHJhbmdlcykgLT5cbiAgICByYW5nZXMuZmlsdGVyIChyYW5nZSkgPT5cbiAgICAgIG5vdCBpc0xlYWRpbmdXaGl0ZVNwYWNlUmFuZ2UoQGVkaXRvciwgcmFuZ2UpXG5cbiAgaXNNdWx0aXBsZUFuZEFsbFJhbmdlSGF2ZVNhbWVDb2x1bW5SYW5nZXM6IChyYW5nZXMpIC0+XG4gICAgcmV0dXJuIGZhbHNlIGlmIHJhbmdlcy5sZW5ndGggPD0gMVxuXG4gICAge3N0YXJ0LCBlbmR9ID0gcmFuZ2VzWzBdXG4gICAgc3RhcnRDb2x1bW4gPSBzdGFydC5jb2x1bW5cbiAgICBlbmRDb2x1bW4gPSBlbmQuY29sdW1uXG5cbiAgICByYW5nZXMuZXZlcnkgKHtzdGFydCwgZW5kfSkgLT5cbiAgICAgIChzdGFydC5jb2x1bW4gaXMgc3RhcnRDb2x1bW4pIGFuZCAoZW5kLmNvbHVtbiBpcyBlbmRDb2x1bW4pXG5cbiAgZmxhc2g6IChmbGFzaFJhbmdlcywgb3B0aW9ucykgLT5cbiAgICBvcHRpb25zLnRpbWVvdXQgPz0gNTAwXG4gICAgQG9uRGlkRmluaXNoT3BlcmF0aW9uID0+XG4gICAgICBAdmltU3RhdGUuZmxhc2goZmxhc2hSYW5nZXMsIG9wdGlvbnMpXG5cbiAgZXhlY3V0ZTogLT5cbiAgICB7bmV3UmFuZ2VzLCBvbGRSYW5nZXN9ID0gQG11dGF0ZVdpdGhUcmFja0NoYW5nZXMoKVxuXG4gICAgZm9yIHNlbGVjdGlvbiBpbiBAZWRpdG9yLmdldFNlbGVjdGlvbnMoKVxuICAgICAgc2VsZWN0aW9uLmNsZWFyKClcblxuICAgIGlmIHNldHRpbmdzLmdldCgnc2V0Q3Vyc29yVG9TdGFydE9mQ2hhbmdlT25VbmRvUmVkbycpXG4gICAgICBzdHJhdGVneSA9IHNldHRpbmdzLmdldCgnc2V0Q3Vyc29yVG9TdGFydE9mQ2hhbmdlT25VbmRvUmVkb1N0cmF0ZWd5JylcbiAgICAgIEBzZXRDdXJzb3JQb3NpdGlvbih7bmV3UmFuZ2VzLCBvbGRSYW5nZXMsIHN0cmF0ZWd5fSlcbiAgICAgIEB2aW1TdGF0ZS5jbGVhclNlbGVjdGlvbnMoKVxuXG4gICAgaWYgc2V0dGluZ3MuZ2V0KCdmbGFzaE9uVW5kb1JlZG8nKVxuICAgICAgQGZsYXNoQ2hhbmdlcyh7bmV3UmFuZ2VzLCBvbGRSYW5nZXN9KVxuXG4gICAgQGFjdGl2YXRlTW9kZSgnbm9ybWFsJylcblxuICBtdXRhdGU6IC0+XG4gICAgQGVkaXRvci51bmRvKClcblxuY2xhc3MgUmVkbyBleHRlbmRzIFVuZG9cbiAgQGV4dGVuZCgpXG4gIG11dGF0ZTogLT5cbiAgICBAZWRpdG9yLnJlZG8oKVxuXG5jbGFzcyBUb2dnbGVGb2xkIGV4dGVuZHMgTWlzY0NvbW1hbmRcbiAgQGV4dGVuZCgpXG4gIGV4ZWN1dGU6IC0+XG4gICAgcG9pbnQgPSBAZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKClcbiAgICBAZWRpdG9yLnRvZ2dsZUZvbGRBdEJ1ZmZlclJvdyhwb2ludC5yb3cpXG5cbmNsYXNzIFJlcGxhY2VNb2RlQmFja3NwYWNlIGV4dGVuZHMgTWlzY0NvbW1hbmRcbiAgQGNvbW1hbmRTY29wZTogJ2F0b20tdGV4dC1lZGl0b3IudmltLW1vZGUtcGx1cy5pbnNlcnQtbW9kZS5yZXBsYWNlJ1xuICBAZXh0ZW5kKClcbiAgZXhlY3V0ZTogLT5cbiAgICBmb3Igc2VsZWN0aW9uIGluIEBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpXG4gICAgICAjIGNoYXIgbWlnaHQgYmUgZW1wdHkuXG4gICAgICBjaGFyID0gQHZpbVN0YXRlLm1vZGVNYW5hZ2VyLmdldFJlcGxhY2VkQ2hhckZvclNlbGVjdGlvbihzZWxlY3Rpb24pXG4gICAgICBpZiBjaGFyP1xuICAgICAgICBzZWxlY3Rpb24uc2VsZWN0TGVmdCgpXG4gICAgICAgIHVubGVzcyBzZWxlY3Rpb24uaW5zZXJ0VGV4dChjaGFyKS5pc0VtcHR5KClcbiAgICAgICAgICBzZWxlY3Rpb24uY3Vyc29yLm1vdmVMZWZ0KClcblxuY2xhc3MgU2Nyb2xsV2l0aG91dENoYW5naW5nQ3Vyc29yUG9zaXRpb24gZXh0ZW5kcyBNaXNjQ29tbWFuZFxuICBAZXh0ZW5kKGZhbHNlKVxuICBzY3JvbGxvZmY6IDIgIyBhdG9tIGRlZmF1bHQuIEJldHRlciB0byB1c2UgZWRpdG9yLmdldFZlcnRpY2FsU2Nyb2xsTWFyZ2luKCk/XG4gIGN1cnNvclBpeGVsOiBudWxsXG5cbiAgZ2V0Rmlyc3RWaXNpYmxlU2NyZWVuUm93OiAtPlxuICAgIEBlZGl0b3JFbGVtZW50LmdldEZpcnN0VmlzaWJsZVNjcmVlblJvdygpXG5cbiAgZ2V0TGFzdFZpc2libGVTY3JlZW5Sb3c6IC0+XG4gICAgQGVkaXRvckVsZW1lbnQuZ2V0TGFzdFZpc2libGVTY3JlZW5Sb3coKVxuXG4gIGdldExhc3RTY3JlZW5Sb3c6IC0+XG4gICAgQGVkaXRvci5nZXRMYXN0U2NyZWVuUm93KClcblxuICBnZXRDdXJzb3JQaXhlbDogLT5cbiAgICBwb2ludCA9IEBlZGl0b3IuZ2V0Q3Vyc29yU2NyZWVuUG9zaXRpb24oKVxuICAgIEBlZGl0b3JFbGVtZW50LnBpeGVsUG9zaXRpb25Gb3JTY3JlZW5Qb3NpdGlvbihwb2ludClcblxuIyBjdHJsLWUgc2Nyb2xsIGxpbmVzIGRvd253YXJkc1xuY2xhc3MgU2Nyb2xsRG93biBleHRlbmRzIFNjcm9sbFdpdGhvdXRDaGFuZ2luZ0N1cnNvclBvc2l0aW9uXG4gIEBleHRlbmQoKVxuXG4gIGV4ZWN1dGU6IC0+XG4gICAgY291bnQgPSBAZ2V0Q291bnQoKVxuICAgIG9sZEZpcnN0Um93ID0gQGVkaXRvci5nZXRGaXJzdFZpc2libGVTY3JlZW5Sb3coKVxuICAgIEBlZGl0b3Iuc2V0Rmlyc3RWaXNpYmxlU2NyZWVuUm93KG9sZEZpcnN0Um93ICsgY291bnQpXG4gICAgbmV3Rmlyc3RSb3cgPSBAZWRpdG9yLmdldEZpcnN0VmlzaWJsZVNjcmVlblJvdygpXG5cbiAgICBtYXJnaW4gPSBAZWRpdG9yLmdldFZlcnRpY2FsU2Nyb2xsTWFyZ2luKClcbiAgICB7cm93LCBjb2x1bW59ID0gQGVkaXRvci5nZXRDdXJzb3JTY3JlZW5Qb3NpdGlvbigpXG4gICAgaWYgcm93IDwgKG5ld0ZpcnN0Um93ICsgbWFyZ2luKVxuICAgICAgbmV3UG9pbnQgPSBbcm93ICsgY291bnQsIGNvbHVtbl1cbiAgICAgIEBlZGl0b3Iuc2V0Q3Vyc29yU2NyZWVuUG9zaXRpb24obmV3UG9pbnQsIGF1dG9zY3JvbGw6IGZhbHNlKVxuXG4jIGN0cmwteSBzY3JvbGwgbGluZXMgdXB3YXJkc1xuY2xhc3MgU2Nyb2xsVXAgZXh0ZW5kcyBTY3JvbGxXaXRob3V0Q2hhbmdpbmdDdXJzb3JQb3NpdGlvblxuICBAZXh0ZW5kKClcblxuICBleGVjdXRlOiAtPlxuICAgIGNvdW50ID0gQGdldENvdW50KClcbiAgICBvbGRGaXJzdFJvdyA9IEBlZGl0b3IuZ2V0Rmlyc3RWaXNpYmxlU2NyZWVuUm93KClcbiAgICBAZWRpdG9yLnNldEZpcnN0VmlzaWJsZVNjcmVlblJvdyhvbGRGaXJzdFJvdyAtIGNvdW50KVxuICAgIG5ld0xhc3RSb3cgPSBAZWRpdG9yLmdldExhc3RWaXNpYmxlU2NyZWVuUm93KClcblxuICAgIG1hcmdpbiA9IEBlZGl0b3IuZ2V0VmVydGljYWxTY3JvbGxNYXJnaW4oKVxuICAgIHtyb3csIGNvbHVtbn0gPSBAZWRpdG9yLmdldEN1cnNvclNjcmVlblBvc2l0aW9uKClcbiAgICBpZiByb3cgPj0gKG5ld0xhc3RSb3cgLSBtYXJnaW4pXG4gICAgICBuZXdQb2ludCA9IFtyb3cgLSBjb3VudCwgY29sdW1uXVxuICAgICAgQGVkaXRvci5zZXRDdXJzb3JTY3JlZW5Qb3NpdGlvbihuZXdQb2ludCwgYXV0b3Njcm9sbDogZmFsc2UpXG5cbiMgU2Nyb2xsV2l0aG91dENoYW5naW5nQ3Vyc29yUG9zaXRpb24gd2l0aG91dCBDdXJzb3IgUG9zaXRpb24gY2hhbmdlLlxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBTY3JvbGxDdXJzb3IgZXh0ZW5kcyBTY3JvbGxXaXRob3V0Q2hhbmdpbmdDdXJzb3JQb3NpdGlvblxuICBAZXh0ZW5kKGZhbHNlKVxuICBleGVjdXRlOiAtPlxuICAgIEBtb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZT8oKVxuICAgIGlmIEBpc1Njcm9sbGFibGUoKVxuICAgICAgQGVkaXRvckVsZW1lbnQuc2V0U2Nyb2xsVG9wIEBnZXRTY3JvbGxUb3AoKVxuXG4gIG1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lOiAtPlxuICAgIEBlZGl0b3IubW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmUoKVxuXG4gIGdldE9mZlNldFBpeGVsSGVpZ2h0OiAobGluZURlbHRhPTApIC0+XG4gICAgQGVkaXRvci5nZXRMaW5lSGVpZ2h0SW5QaXhlbHMoKSAqIChAc2Nyb2xsb2ZmICsgbGluZURlbHRhKVxuXG4jIHogZW50ZXJcbmNsYXNzIFNjcm9sbEN1cnNvclRvVG9wIGV4dGVuZHMgU2Nyb2xsQ3Vyc29yXG4gIEBleHRlbmQoKVxuICBpc1Njcm9sbGFibGU6IC0+XG4gICAgQGdldExhc3RWaXNpYmxlU2NyZWVuUm93KCkgaXNudCBAZ2V0TGFzdFNjcmVlblJvdygpXG5cbiAgZ2V0U2Nyb2xsVG9wOiAtPlxuICAgIEBnZXRDdXJzb3JQaXhlbCgpLnRvcCAtIEBnZXRPZmZTZXRQaXhlbEhlaWdodCgpXG5cbiMgenRcbmNsYXNzIFNjcm9sbEN1cnNvclRvVG9wTGVhdmUgZXh0ZW5kcyBTY3JvbGxDdXJzb3JUb1RvcFxuICBAZXh0ZW5kKClcbiAgbW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmU6IG51bGxcblxuIyB6LVxuY2xhc3MgU2Nyb2xsQ3Vyc29yVG9Cb3R0b20gZXh0ZW5kcyBTY3JvbGxDdXJzb3JcbiAgQGV4dGVuZCgpXG4gIGlzU2Nyb2xsYWJsZTogLT5cbiAgICBAZ2V0Rmlyc3RWaXNpYmxlU2NyZWVuUm93KCkgaXNudCAwXG5cbiAgZ2V0U2Nyb2xsVG9wOiAtPlxuICAgIEBnZXRDdXJzb3JQaXhlbCgpLnRvcCAtIChAZWRpdG9yRWxlbWVudC5nZXRIZWlnaHQoKSAtIEBnZXRPZmZTZXRQaXhlbEhlaWdodCgxKSlcblxuIyB6YlxuY2xhc3MgU2Nyb2xsQ3Vyc29yVG9Cb3R0b21MZWF2ZSBleHRlbmRzIFNjcm9sbEN1cnNvclRvQm90dG9tXG4gIEBleHRlbmQoKVxuICBtb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZTogbnVsbFxuXG4jIHouXG5jbGFzcyBTY3JvbGxDdXJzb3JUb01pZGRsZSBleHRlbmRzIFNjcm9sbEN1cnNvclxuICBAZXh0ZW5kKClcbiAgaXNTY3JvbGxhYmxlOiAtPlxuICAgIHRydWVcblxuICBnZXRTY3JvbGxUb3A6IC0+XG4gICAgQGdldEN1cnNvclBpeGVsKCkudG9wIC0gKEBlZGl0b3JFbGVtZW50LmdldEhlaWdodCgpIC8gMilcblxuIyB6elxuY2xhc3MgU2Nyb2xsQ3Vyc29yVG9NaWRkbGVMZWF2ZSBleHRlbmRzIFNjcm9sbEN1cnNvclRvTWlkZGxlXG4gIEBleHRlbmQoKVxuICBtb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZTogbnVsbFxuXG4jIEhvcml6b250YWwgU2Nyb2xsV2l0aG91dENoYW5naW5nQ3Vyc29yUG9zaXRpb25cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyB6c1xuY2xhc3MgU2Nyb2xsQ3Vyc29yVG9MZWZ0IGV4dGVuZHMgU2Nyb2xsV2l0aG91dENoYW5naW5nQ3Vyc29yUG9zaXRpb25cbiAgQGV4dGVuZCgpXG5cbiAgZXhlY3V0ZTogLT5cbiAgICBAZWRpdG9yRWxlbWVudC5zZXRTY3JvbGxMZWZ0KEBnZXRDdXJzb3JQaXhlbCgpLmxlZnQpXG5cbiMgemVcbmNsYXNzIFNjcm9sbEN1cnNvclRvUmlnaHQgZXh0ZW5kcyBTY3JvbGxDdXJzb3JUb0xlZnRcbiAgQGV4dGVuZCgpXG5cbiAgZXhlY3V0ZTogLT5cbiAgICBAZWRpdG9yRWxlbWVudC5zZXRTY3JvbGxSaWdodChAZ2V0Q3Vyc29yUGl4ZWwoKS5sZWZ0KVxuXG5jbGFzcyBBY3RpdmF0ZU5vcm1hbE1vZGVPbmNlIGV4dGVuZHMgTWlzY0NvbW1hbmRcbiAgQGV4dGVuZCgpXG4gIEBjb21tYW5kU2NvcGU6ICdhdG9tLXRleHQtZWRpdG9yLnZpbS1tb2RlLXBsdXMuaW5zZXJ0LW1vZGUnXG4gIHRoaXNDb21tYW5kTmFtZTogQGdldENvbW1hbmROYW1lKClcblxuICBleGVjdXRlOiAtPlxuICAgIGN1cnNvcnNUb01vdmVSaWdodCA9IEBlZGl0b3IuZ2V0Q3Vyc29ycygpLmZpbHRlciAoY3Vyc29yKSAtPiBub3QgY3Vyc29yLmlzQXRCZWdpbm5pbmdPZkxpbmUoKVxuICAgIEB2aW1TdGF0ZS5hY3RpdmF0ZSgnbm9ybWFsJylcbiAgICBtb3ZlQ3Vyc29yUmlnaHQoY3Vyc29yKSBmb3IgY3Vyc29yIGluIGN1cnNvcnNUb01vdmVSaWdodFxuICAgIGRpc3Bvc2FibGUgPSBhdG9tLmNvbW1hbmRzLm9uRGlkRGlzcGF0Y2ggKHt0eXBlfSkgPT5cbiAgICAgIHJldHVybiBpZiB0eXBlIGlzIEB0aGlzQ29tbWFuZE5hbWVcbiAgICAgIGRpc3Bvc2FibGUuZGlzcG9zZSgpXG4gICAgICBkaXNwb3NhYmxlID0gbnVsbFxuICAgICAgQHZpbVN0YXRlLmFjdGl2YXRlKCdpbnNlcnQnKVxuIl19
