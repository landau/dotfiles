(function() {
  var ActivateNormalModeOnce, Base, BlockwiseOtherEnd, CopyFromLineAbove, CopyFromLineBelow, InsertLastInserted, InsertMode, InsertRegister, Mark, MiscCommand, Point, Range, Redo, ReplaceModeBackspace, ReverseSelections, ScrollCursor, ScrollCursorToBottom, ScrollCursorToBottomLeave, ScrollCursorToLeft, ScrollCursorToMiddle, ScrollCursorToMiddleLeave, ScrollCursorToRight, ScrollCursorToTop, ScrollCursorToTopLeave, ScrollDown, ScrollUp, ScrollWithoutChangingCursorPosition, ToggleFold, Undo, _, findRangeContainsPoint, humanizeBufferRange, isLeadingWhiteSpaceRange, isLinewiseRange, isSingleLineRange, moveCursorRight, ref, ref1, setBufferRow, sortRanges, swrap,
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

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvbWlzYy1jb21tYW5kLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsaXBCQUFBO0lBQUE7OztFQUFBLE1BQWlCLE9BQUEsQ0FBUSxNQUFSLENBQWpCLEVBQUMsaUJBQUQsRUFBUTs7RUFDUixJQUFBLEdBQU8sT0FBQSxDQUFRLFFBQVI7O0VBQ1AsS0FBQSxHQUFRLE9BQUEsQ0FBUSxxQkFBUjs7RUFDUixDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSOztFQUVKLE9BU0ksT0FBQSxDQUFRLFNBQVIsQ0FUSixFQUNFLHNDQURGLEVBRUUsc0NBRkYsRUFHRSxnQ0FIRixFQUlFLDRCQUpGLEVBS0Usb0RBTEYsRUFNRSwwQ0FORixFQU9FLHdEQVBGLEVBUUU7O0VBR0k7OztJQUNKLFdBQUMsQ0FBQSxNQUFELENBQVEsS0FBUjs7SUFDQSxXQUFDLENBQUEsYUFBRCxHQUFnQjs7SUFDSCxxQkFBQTtNQUNYLDhDQUFBLFNBQUE7TUFDQSxJQUFDLENBQUEsVUFBRCxDQUFBO0lBRlc7Ozs7S0FIVzs7RUFPcEI7Ozs7Ozs7SUFDSixJQUFDLENBQUEsTUFBRCxDQUFBOzttQkFDQSxZQUFBLEdBQWM7O21CQUNkLFVBQUEsR0FBWSxTQUFBO01BQ1YsSUFBQyxDQUFBLFVBQUQsQ0FBQTthQUNBLHNDQUFBLFNBQUE7SUFGVTs7bUJBSVosT0FBQSxHQUFTLFNBQUE7TUFDUCxJQUFDLENBQUEsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFmLENBQW1CLElBQUMsQ0FBQSxLQUFwQixFQUEyQixJQUFDLENBQUEsTUFBTSxDQUFDLHVCQUFSLENBQUEsQ0FBM0I7YUFDQSxJQUFDLENBQUEsWUFBRCxDQUFjLFFBQWQ7SUFGTzs7OztLQVBROztFQVdiOzs7Ozs7O0lBQ0osaUJBQUMsQ0FBQSxNQUFELENBQUE7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O0FBQUE7ZUFBQSxzQ0FBQTs7WUFDRSxLQUFBLEdBQVEsU0FBUyxDQUFDLE1BQU0sQ0FBQyxpQkFBakIsQ0FBQSxDQUFvQyxDQUFDLFNBQXJDLENBQStDLFdBQS9DO1lBQ1IsS0FBQSxHQUFRLEtBQUssQ0FBQyxrQkFBTixDQUF5QixLQUF6QixFQUFnQyxDQUFoQyxFQUFtQyxDQUFuQztZQUNSLElBQUcsSUFBQSxHQUFPLEtBQUMsQ0FBQSxNQUFNLENBQUMsb0JBQVIsQ0FBNkIsS0FBN0IsQ0FBVjsyQkFDRSxTQUFTLENBQUMsVUFBVixDQUFxQixJQUFyQixHQURGO2FBQUEsTUFBQTttQ0FBQTs7QUFIRjs7UUFEZTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBakI7SUFGTzs7OztLQVJxQjs7RUFpQjFCOzs7Ozs7O0lBQ0osaUJBQUMsQ0FBQSxNQUFELENBQUE7O0lBQ0EsaUJBQUMsQ0FBQSxXQUFELEdBQWM7O2dDQUlkLFFBQUEsR0FBVSxDQUFDOzs7O0tBTm1CO0FBdFdoQyIsInNvdXJjZXNDb250ZW50IjpbIntSYW5nZSwgUG9pbnR9ID0gcmVxdWlyZSAnYXRvbSdcbkJhc2UgPSByZXF1aXJlICcuL2Jhc2UnXG5zd3JhcCA9IHJlcXVpcmUgJy4vc2VsZWN0aW9uLXdyYXBwZXInXG5fID0gcmVxdWlyZSAndW5kZXJzY29yZS1wbHVzJ1xuXG57XG4gIG1vdmVDdXJzb3JSaWdodFxuICBpc0xpbmV3aXNlUmFuZ2VcbiAgc2V0QnVmZmVyUm93XG4gIHNvcnRSYW5nZXNcbiAgZmluZFJhbmdlQ29udGFpbnNQb2ludFxuICBpc1NpbmdsZUxpbmVSYW5nZVxuICBpc0xlYWRpbmdXaGl0ZVNwYWNlUmFuZ2VcbiAgaHVtYW5pemVCdWZmZXJSYW5nZVxufSA9IHJlcXVpcmUgJy4vdXRpbHMnXG5cbmNsYXNzIE1pc2NDb21tYW5kIGV4dGVuZHMgQmFzZVxuICBAZXh0ZW5kKGZhbHNlKVxuICBAb3BlcmF0aW9uS2luZDogJ21pc2MtY29tbWFuZCdcbiAgY29uc3RydWN0b3I6IC0+XG4gICAgc3VwZXJcbiAgICBAaW5pdGlhbGl6ZSgpXG5cbmNsYXNzIE1hcmsgZXh0ZW5kcyBNaXNjQ29tbWFuZFxuICBAZXh0ZW5kKClcbiAgcmVxdWlyZUlucHV0OiB0cnVlXG4gIGluaXRpYWxpemU6IC0+XG4gICAgQGZvY3VzSW5wdXQoKVxuICAgIHN1cGVyXG5cbiAgZXhlY3V0ZTogLT5cbiAgICBAdmltU3RhdGUubWFyay5zZXQoQGlucHV0LCBAZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCkpXG4gICAgQGFjdGl2YXRlTW9kZSgnbm9ybWFsJylcblxuY2xhc3MgUmV2ZXJzZVNlbGVjdGlvbnMgZXh0ZW5kcyBNaXNjQ29tbWFuZFxuICBAZXh0ZW5kKClcbiAgZXhlY3V0ZTogLT5cbiAgICBzd3JhcC5zZXRSZXZlcnNlZFN0YXRlKEBlZGl0b3IsIG5vdCBAZWRpdG9yLmdldExhc3RTZWxlY3Rpb24oKS5pc1JldmVyc2VkKCkpXG4gICAgaWYgQGlzTW9kZSgndmlzdWFsJywgJ2Jsb2Nrd2lzZScpXG4gICAgICBAZ2V0TGFzdEJsb2Nrd2lzZVNlbGVjdGlvbigpLmF1dG9zY3JvbGwoKVxuXG5jbGFzcyBCbG9ja3dpc2VPdGhlckVuZCBleHRlbmRzIFJldmVyc2VTZWxlY3Rpb25zXG4gIEBleHRlbmQoKVxuICBleGVjdXRlOiAtPlxuICAgIGZvciBibG9ja3dpc2VTZWxlY3Rpb24gaW4gQGdldEJsb2Nrd2lzZVNlbGVjdGlvbnMoKVxuICAgICAgYmxvY2t3aXNlU2VsZWN0aW9uLnJldmVyc2UoKVxuICAgIHN1cGVyXG5cbmNsYXNzIFVuZG8gZXh0ZW5kcyBNaXNjQ29tbWFuZFxuICBAZXh0ZW5kKClcblxuICBzZXRDdXJzb3JQb3NpdGlvbjogKHtuZXdSYW5nZXMsIG9sZFJhbmdlcywgc3RyYXRlZ3l9KSAtPlxuICAgIGxhc3RDdXJzb3IgPSBAZWRpdG9yLmdldExhc3RDdXJzb3IoKSAjIFRoaXMgaXMgcmVzdG9yZWQgY3Vyc29yXG5cbiAgICBpZiBzdHJhdGVneSBpcyAnc21hcnQnXG4gICAgICBjaGFuZ2VkUmFuZ2UgPSBmaW5kUmFuZ2VDb250YWluc1BvaW50KG5ld1JhbmdlcywgbGFzdEN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpKVxuICAgIGVsc2VcbiAgICAgIGNoYW5nZWRSYW5nZSA9IHNvcnRSYW5nZXMobmV3UmFuZ2VzLmNvbmNhdChvbGRSYW5nZXMpKVswXVxuXG4gICAgaWYgY2hhbmdlZFJhbmdlP1xuICAgICAgaWYgaXNMaW5ld2lzZVJhbmdlKGNoYW5nZWRSYW5nZSlcbiAgICAgICAgc2V0QnVmZmVyUm93KGxhc3RDdXJzb3IsIGNoYW5nZWRSYW5nZS5zdGFydC5yb3cpXG4gICAgICBlbHNlXG4gICAgICAgIGxhc3RDdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24oY2hhbmdlZFJhbmdlLnN0YXJ0KVxuXG4gIG11dGF0ZVdpdGhUcmFja0NoYW5nZXM6IC0+XG4gICAgbmV3UmFuZ2VzID0gW11cbiAgICBvbGRSYW5nZXMgPSBbXVxuXG4gICAgIyBDb2xsZWN0IGNoYW5nZWQgcmFuZ2Ugd2hpbGUgbXV0YXRpbmcgdGV4dC1zdGF0ZSBieSBmbiBjYWxsYmFjay5cbiAgICBkaXNwb3NhYmxlID0gQGVkaXRvci5nZXRCdWZmZXIoKS5vbkRpZENoYW5nZSAoe25ld1JhbmdlLCBvbGRSYW5nZX0pIC0+XG4gICAgICBpZiBuZXdSYW5nZS5pc0VtcHR5KClcbiAgICAgICAgb2xkUmFuZ2VzLnB1c2gob2xkUmFuZ2UpICMgUmVtb3ZlIG9ubHlcbiAgICAgIGVsc2VcbiAgICAgICAgbmV3UmFuZ2VzLnB1c2gobmV3UmFuZ2UpXG5cbiAgICBAbXV0YXRlKClcblxuICAgIGRpc3Bvc2FibGUuZGlzcG9zZSgpXG4gICAge25ld1Jhbmdlcywgb2xkUmFuZ2VzfVxuXG4gIGZsYXNoQ2hhbmdlczogKHtuZXdSYW5nZXMsIG9sZFJhbmdlc30pIC0+XG4gICAgaXNNdWx0aXBsZVNpbmdsZUxpbmVSYW5nZXMgPSAocmFuZ2VzKSAtPlxuICAgICAgcmFuZ2VzLmxlbmd0aCA+IDEgYW5kIHJhbmdlcy5ldmVyeShpc1NpbmdsZUxpbmVSYW5nZSlcblxuICAgIGlmIG5ld1Jhbmdlcy5sZW5ndGggPiAwXG4gICAgICByZXR1cm4gaWYgQGlzTXVsdGlwbGVBbmRBbGxSYW5nZUhhdmVTYW1lQ29sdW1uQW5kQ29uc2VjdXRpdmVSb3dzKG5ld1JhbmdlcylcbiAgICAgIG5ld1JhbmdlcyA9IG5ld1Jhbmdlcy5tYXAgKHJhbmdlKSA9PiBodW1hbml6ZUJ1ZmZlclJhbmdlKEBlZGl0b3IsIHJhbmdlKVxuICAgICAgbmV3UmFuZ2VzID0gQGZpbHRlck5vbkxlYWRpbmdXaGl0ZVNwYWNlUmFuZ2UobmV3UmFuZ2VzKVxuXG4gICAgICBpZiBpc011bHRpcGxlU2luZ2xlTGluZVJhbmdlcyhuZXdSYW5nZXMpXG4gICAgICAgIEBmbGFzaChuZXdSYW5nZXMsIHR5cGU6ICd1bmRvLXJlZG8tbXVsdGlwbGUtY2hhbmdlcycpXG4gICAgICBlbHNlXG4gICAgICAgIEBmbGFzaChuZXdSYW5nZXMsIHR5cGU6ICd1bmRvLXJlZG8nKVxuICAgIGVsc2VcbiAgICAgIHJldHVybiBpZiBAaXNNdWx0aXBsZUFuZEFsbFJhbmdlSGF2ZVNhbWVDb2x1bW5BbmRDb25zZWN1dGl2ZVJvd3Mob2xkUmFuZ2VzKVxuXG4gICAgICBpZiBpc011bHRpcGxlU2luZ2xlTGluZVJhbmdlcyhvbGRSYW5nZXMpXG4gICAgICAgIG9sZFJhbmdlcyA9IEBmaWx0ZXJOb25MZWFkaW5nV2hpdGVTcGFjZVJhbmdlKG9sZFJhbmdlcylcbiAgICAgICAgQGZsYXNoKG9sZFJhbmdlcywgdHlwZTogJ3VuZG8tcmVkby1tdWx0aXBsZS1kZWxldGUnKVxuXG4gIGZpbHRlck5vbkxlYWRpbmdXaGl0ZVNwYWNlUmFuZ2U6IChyYW5nZXMpIC0+XG4gICAgcmFuZ2VzLmZpbHRlciAocmFuZ2UpID0+XG4gICAgICBub3QgaXNMZWFkaW5nV2hpdGVTcGFjZVJhbmdlKEBlZGl0b3IsIHJhbmdlKVxuXG4gICMgW1RPRE9dIEltcHJvdmUgZnVydGhlciBieSBjaGVja2luZyBvbGRUZXh0LCBuZXdUZXh0P1xuICAjIFtQdXJwb3NlIG9mIHRoaXMgaXMgZnVuY3Rpb25dXG4gICMgU3VwcHJlc3MgZmxhc2ggd2hlbiB1bmRvL3JlZG9pbmcgdG9nZ2xlLWNvbW1lbnQgd2hpbGUgZmxhc2hpbmcgdW5kby9yZWRvIG9mIG9jY3VycmVuY2Ugb3BlcmF0aW9uLlxuICAjIFRoaXMgaHVyaXN0aWMgYXBwcm9hY2ggbmV2ZXIgYmUgcGVyZmVjdC5cbiAgIyBVbHRpbWF0ZWx5IGNhbm5ub3QgZGlzdGluZ3Vpc2ggb2NjdXJyZW5jZSBvcGVyYXRpb24uXG4gIGlzTXVsdGlwbGVBbmRBbGxSYW5nZUhhdmVTYW1lQ29sdW1uQW5kQ29uc2VjdXRpdmVSb3dzOiAocmFuZ2VzKSAtPlxuICAgIHJldHVybiBmYWxzZSBpZiByYW5nZXMubGVuZ3RoIDw9IDFcblxuICAgIHtzdGFydDoge2NvbHVtbjogc3RhcnRDb2x1bW59LCBlbmQ6IHtjb2x1bW46IGVuZENvbHVtbn19ID0gcmFuZ2VzWzBdXG4gICAgcHJldmlvdXNSb3cgPSBudWxsXG4gICAgZm9yIHJhbmdlIGluIHJhbmdlc1xuICAgICAge3N0YXJ0LCBlbmR9ID0gcmFuZ2VcbiAgICAgIHVubGVzcyAoKHN0YXJ0LmNvbHVtbiBpcyBzdGFydENvbHVtbikgYW5kIChlbmQuY29sdW1uIGlzIGVuZENvbHVtbikpXG4gICAgICAgIHJldHVybiBmYWxzZVxuXG4gICAgICBpZiBwcmV2aW91c1Jvdz8gYW5kIChwcmV2aW91c1JvdyArIDEgaXNudCBzdGFydC5yb3cpXG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgcHJldmlvdXNSb3cgPSBzdGFydC5yb3dcbiAgICByZXR1cm4gdHJ1ZVxuXG4gICAgcmFuZ2VzLmV2ZXJ5ICh7c3RhcnQsIGVuZH0pIC0+XG4gICAgICAoc3RhcnQuY29sdW1uIGlzIHN0YXJ0Q29sdW1uKSBhbmQgKGVuZC5jb2x1bW4gaXMgZW5kQ29sdW1uKVxuXG4gIGZsYXNoOiAoZmxhc2hSYW5nZXMsIG9wdGlvbnMpIC0+XG4gICAgb3B0aW9ucy50aW1lb3V0ID89IDUwMFxuICAgIEBvbkRpZEZpbmlzaE9wZXJhdGlvbiA9PlxuICAgICAgQHZpbVN0YXRlLmZsYXNoKGZsYXNoUmFuZ2VzLCBvcHRpb25zKVxuXG4gIGV4ZWN1dGU6IC0+XG4gICAge25ld1Jhbmdlcywgb2xkUmFuZ2VzfSA9IEBtdXRhdGVXaXRoVHJhY2tDaGFuZ2VzKClcblxuICAgIGZvciBzZWxlY3Rpb24gaW4gQGVkaXRvci5nZXRTZWxlY3Rpb25zKClcbiAgICAgIHNlbGVjdGlvbi5jbGVhcigpXG5cbiAgICBpZiBAZ2V0Q29uZmlnKCdzZXRDdXJzb3JUb1N0YXJ0T2ZDaGFuZ2VPblVuZG9SZWRvJylcbiAgICAgIHN0cmF0ZWd5ID0gQGdldENvbmZpZygnc2V0Q3Vyc29yVG9TdGFydE9mQ2hhbmdlT25VbmRvUmVkb1N0cmF0ZWd5JylcbiAgICAgIEBzZXRDdXJzb3JQb3NpdGlvbih7bmV3UmFuZ2VzLCBvbGRSYW5nZXMsIHN0cmF0ZWd5fSlcbiAgICAgIEB2aW1TdGF0ZS5jbGVhclNlbGVjdGlvbnMoKVxuXG4gICAgaWYgQGdldENvbmZpZygnZmxhc2hPblVuZG9SZWRvJylcbiAgICAgIEBmbGFzaENoYW5nZXMoe25ld1Jhbmdlcywgb2xkUmFuZ2VzfSlcblxuICAgIEBhY3RpdmF0ZU1vZGUoJ25vcm1hbCcpXG5cbiAgbXV0YXRlOiAtPlxuICAgIEBlZGl0b3IudW5kbygpXG5cbmNsYXNzIFJlZG8gZXh0ZW5kcyBVbmRvXG4gIEBleHRlbmQoKVxuICBtdXRhdGU6IC0+XG4gICAgQGVkaXRvci5yZWRvKClcblxuY2xhc3MgVG9nZ2xlRm9sZCBleHRlbmRzIE1pc2NDb21tYW5kXG4gIEBleHRlbmQoKVxuICBleGVjdXRlOiAtPlxuICAgIHBvaW50ID0gQGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpXG4gICAgQGVkaXRvci50b2dnbGVGb2xkQXRCdWZmZXJSb3cocG9pbnQucm93KVxuXG5jbGFzcyBSZXBsYWNlTW9kZUJhY2tzcGFjZSBleHRlbmRzIE1pc2NDb21tYW5kXG4gIEBjb21tYW5kU2NvcGU6ICdhdG9tLXRleHQtZWRpdG9yLnZpbS1tb2RlLXBsdXMuaW5zZXJ0LW1vZGUucmVwbGFjZSdcbiAgQGV4dGVuZCgpXG4gIGV4ZWN1dGU6IC0+XG4gICAgZm9yIHNlbGVjdGlvbiBpbiBAZWRpdG9yLmdldFNlbGVjdGlvbnMoKVxuICAgICAgIyBjaGFyIG1pZ2h0IGJlIGVtcHR5LlxuICAgICAgY2hhciA9IEB2aW1TdGF0ZS5tb2RlTWFuYWdlci5nZXRSZXBsYWNlZENoYXJGb3JTZWxlY3Rpb24oc2VsZWN0aW9uKVxuICAgICAgaWYgY2hhcj9cbiAgICAgICAgc2VsZWN0aW9uLnNlbGVjdExlZnQoKVxuICAgICAgICB1bmxlc3Mgc2VsZWN0aW9uLmluc2VydFRleHQoY2hhcikuaXNFbXB0eSgpXG4gICAgICAgICAgc2VsZWN0aW9uLmN1cnNvci5tb3ZlTGVmdCgpXG5cbmNsYXNzIFNjcm9sbFdpdGhvdXRDaGFuZ2luZ0N1cnNvclBvc2l0aW9uIGV4dGVuZHMgTWlzY0NvbW1hbmRcbiAgQGV4dGVuZChmYWxzZSlcbiAgc2Nyb2xsb2ZmOiAyICMgYXRvbSBkZWZhdWx0LiBCZXR0ZXIgdG8gdXNlIGVkaXRvci5nZXRWZXJ0aWNhbFNjcm9sbE1hcmdpbigpP1xuICBjdXJzb3JQaXhlbDogbnVsbFxuXG4gIGdldEZpcnN0VmlzaWJsZVNjcmVlblJvdzogLT5cbiAgICBAZWRpdG9yRWxlbWVudC5nZXRGaXJzdFZpc2libGVTY3JlZW5Sb3coKVxuXG4gIGdldExhc3RWaXNpYmxlU2NyZWVuUm93OiAtPlxuICAgIEBlZGl0b3JFbGVtZW50LmdldExhc3RWaXNpYmxlU2NyZWVuUm93KClcblxuICBnZXRMYXN0U2NyZWVuUm93OiAtPlxuICAgIEBlZGl0b3IuZ2V0TGFzdFNjcmVlblJvdygpXG5cbiAgZ2V0Q3Vyc29yUGl4ZWw6IC0+XG4gICAgcG9pbnQgPSBAZWRpdG9yLmdldEN1cnNvclNjcmVlblBvc2l0aW9uKClcbiAgICBAZWRpdG9yRWxlbWVudC5waXhlbFBvc2l0aW9uRm9yU2NyZWVuUG9zaXRpb24ocG9pbnQpXG5cbiMgY3RybC1lIHNjcm9sbCBsaW5lcyBkb3dud2FyZHNcbmNsYXNzIFNjcm9sbERvd24gZXh0ZW5kcyBTY3JvbGxXaXRob3V0Q2hhbmdpbmdDdXJzb3JQb3NpdGlvblxuICBAZXh0ZW5kKClcblxuICBleGVjdXRlOiAtPlxuICAgIGNvdW50ID0gQGdldENvdW50KClcbiAgICBvbGRGaXJzdFJvdyA9IEBlZGl0b3IuZ2V0Rmlyc3RWaXNpYmxlU2NyZWVuUm93KClcbiAgICBAZWRpdG9yLnNldEZpcnN0VmlzaWJsZVNjcmVlblJvdyhvbGRGaXJzdFJvdyArIGNvdW50KVxuICAgIG5ld0ZpcnN0Um93ID0gQGVkaXRvci5nZXRGaXJzdFZpc2libGVTY3JlZW5Sb3coKVxuXG4gICAgbWFyZ2luID0gQGVkaXRvci5nZXRWZXJ0aWNhbFNjcm9sbE1hcmdpbigpXG4gICAge3JvdywgY29sdW1ufSA9IEBlZGl0b3IuZ2V0Q3Vyc29yU2NyZWVuUG9zaXRpb24oKVxuICAgIGlmIHJvdyA8IChuZXdGaXJzdFJvdyArIG1hcmdpbilcbiAgICAgIG5ld1BvaW50ID0gW3JvdyArIGNvdW50LCBjb2x1bW5dXG4gICAgICBAZWRpdG9yLnNldEN1cnNvclNjcmVlblBvc2l0aW9uKG5ld1BvaW50LCBhdXRvc2Nyb2xsOiBmYWxzZSlcblxuIyBjdHJsLXkgc2Nyb2xsIGxpbmVzIHVwd2FyZHNcbmNsYXNzIFNjcm9sbFVwIGV4dGVuZHMgU2Nyb2xsV2l0aG91dENoYW5naW5nQ3Vyc29yUG9zaXRpb25cbiAgQGV4dGVuZCgpXG5cbiAgZXhlY3V0ZTogLT5cbiAgICBjb3VudCA9IEBnZXRDb3VudCgpXG4gICAgb2xkRmlyc3RSb3cgPSBAZWRpdG9yLmdldEZpcnN0VmlzaWJsZVNjcmVlblJvdygpXG4gICAgQGVkaXRvci5zZXRGaXJzdFZpc2libGVTY3JlZW5Sb3cob2xkRmlyc3RSb3cgLSBjb3VudClcbiAgICBuZXdMYXN0Um93ID0gQGVkaXRvci5nZXRMYXN0VmlzaWJsZVNjcmVlblJvdygpXG5cbiAgICBtYXJnaW4gPSBAZWRpdG9yLmdldFZlcnRpY2FsU2Nyb2xsTWFyZ2luKClcbiAgICB7cm93LCBjb2x1bW59ID0gQGVkaXRvci5nZXRDdXJzb3JTY3JlZW5Qb3NpdGlvbigpXG4gICAgaWYgcm93ID49IChuZXdMYXN0Um93IC0gbWFyZ2luKVxuICAgICAgbmV3UG9pbnQgPSBbcm93IC0gY291bnQsIGNvbHVtbl1cbiAgICAgIEBlZGl0b3Iuc2V0Q3Vyc29yU2NyZWVuUG9zaXRpb24obmV3UG9pbnQsIGF1dG9zY3JvbGw6IGZhbHNlKVxuXG4jIFNjcm9sbFdpdGhvdXRDaGFuZ2luZ0N1cnNvclBvc2l0aW9uIHdpdGhvdXQgQ3Vyc29yIFBvc2l0aW9uIGNoYW5nZS5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgU2Nyb2xsQ3Vyc29yIGV4dGVuZHMgU2Nyb2xsV2l0aG91dENoYW5naW5nQ3Vyc29yUG9zaXRpb25cbiAgQGV4dGVuZChmYWxzZSlcbiAgZXhlY3V0ZTogLT5cbiAgICBAbW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmU/KClcbiAgICBpZiBAaXNTY3JvbGxhYmxlKClcbiAgICAgIEBlZGl0b3JFbGVtZW50LnNldFNjcm9sbFRvcCBAZ2V0U2Nyb2xsVG9wKClcblxuICBtb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZTogLT5cbiAgICBAZWRpdG9yLm1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lKClcblxuICBnZXRPZmZTZXRQaXhlbEhlaWdodDogKGxpbmVEZWx0YT0wKSAtPlxuICAgIEBlZGl0b3IuZ2V0TGluZUhlaWdodEluUGl4ZWxzKCkgKiAoQHNjcm9sbG9mZiArIGxpbmVEZWx0YSlcblxuIyB6IGVudGVyXG5jbGFzcyBTY3JvbGxDdXJzb3JUb1RvcCBleHRlbmRzIFNjcm9sbEN1cnNvclxuICBAZXh0ZW5kKClcbiAgaXNTY3JvbGxhYmxlOiAtPlxuICAgIEBnZXRMYXN0VmlzaWJsZVNjcmVlblJvdygpIGlzbnQgQGdldExhc3RTY3JlZW5Sb3coKVxuXG4gIGdldFNjcm9sbFRvcDogLT5cbiAgICBAZ2V0Q3Vyc29yUGl4ZWwoKS50b3AgLSBAZ2V0T2ZmU2V0UGl4ZWxIZWlnaHQoKVxuXG4jIHp0XG5jbGFzcyBTY3JvbGxDdXJzb3JUb1RvcExlYXZlIGV4dGVuZHMgU2Nyb2xsQ3Vyc29yVG9Ub3BcbiAgQGV4dGVuZCgpXG4gIG1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lOiBudWxsXG5cbiMgei1cbmNsYXNzIFNjcm9sbEN1cnNvclRvQm90dG9tIGV4dGVuZHMgU2Nyb2xsQ3Vyc29yXG4gIEBleHRlbmQoKVxuICBpc1Njcm9sbGFibGU6IC0+XG4gICAgQGdldEZpcnN0VmlzaWJsZVNjcmVlblJvdygpIGlzbnQgMFxuXG4gIGdldFNjcm9sbFRvcDogLT5cbiAgICBAZ2V0Q3Vyc29yUGl4ZWwoKS50b3AgLSAoQGVkaXRvckVsZW1lbnQuZ2V0SGVpZ2h0KCkgLSBAZ2V0T2ZmU2V0UGl4ZWxIZWlnaHQoMSkpXG5cbiMgemJcbmNsYXNzIFNjcm9sbEN1cnNvclRvQm90dG9tTGVhdmUgZXh0ZW5kcyBTY3JvbGxDdXJzb3JUb0JvdHRvbVxuICBAZXh0ZW5kKClcbiAgbW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmU6IG51bGxcblxuIyB6LlxuY2xhc3MgU2Nyb2xsQ3Vyc29yVG9NaWRkbGUgZXh0ZW5kcyBTY3JvbGxDdXJzb3JcbiAgQGV4dGVuZCgpXG4gIGlzU2Nyb2xsYWJsZTogLT5cbiAgICB0cnVlXG5cbiAgZ2V0U2Nyb2xsVG9wOiAtPlxuICAgIEBnZXRDdXJzb3JQaXhlbCgpLnRvcCAtIChAZWRpdG9yRWxlbWVudC5nZXRIZWlnaHQoKSAvIDIpXG5cbiMgenpcbmNsYXNzIFNjcm9sbEN1cnNvclRvTWlkZGxlTGVhdmUgZXh0ZW5kcyBTY3JvbGxDdXJzb3JUb01pZGRsZVxuICBAZXh0ZW5kKClcbiAgbW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmU6IG51bGxcblxuIyBIb3Jpem9udGFsIFNjcm9sbFdpdGhvdXRDaGFuZ2luZ0N1cnNvclBvc2l0aW9uXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgenNcbmNsYXNzIFNjcm9sbEN1cnNvclRvTGVmdCBleHRlbmRzIFNjcm9sbFdpdGhvdXRDaGFuZ2luZ0N1cnNvclBvc2l0aW9uXG4gIEBleHRlbmQoKVxuXG4gIGV4ZWN1dGU6IC0+XG4gICAgQGVkaXRvckVsZW1lbnQuc2V0U2Nyb2xsTGVmdChAZ2V0Q3Vyc29yUGl4ZWwoKS5sZWZ0KVxuXG4jIHplXG5jbGFzcyBTY3JvbGxDdXJzb3JUb1JpZ2h0IGV4dGVuZHMgU2Nyb2xsQ3Vyc29yVG9MZWZ0XG4gIEBleHRlbmQoKVxuXG4gIGV4ZWN1dGU6IC0+XG4gICAgQGVkaXRvckVsZW1lbnQuc2V0U2Nyb2xsUmlnaHQoQGdldEN1cnNvclBpeGVsKCkubGVmdClcblxuIyBpbnNlcnQtbW9kZSBzcGVjaWZpYyBjb21tYW5kc1xuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBJbnNlcnRNb2RlIGV4dGVuZHMgTWlzY0NvbW1hbmRcbiAgQGNvbW1hbmRTY29wZTogJ2F0b20tdGV4dC1lZGl0b3IudmltLW1vZGUtcGx1cy5pbnNlcnQtbW9kZSdcblxuY2xhc3MgQWN0aXZhdGVOb3JtYWxNb2RlT25jZSBleHRlbmRzIEluc2VydE1vZGVcbiAgQGV4dGVuZCgpXG4gIHRoaXNDb21tYW5kTmFtZTogQGdldENvbW1hbmROYW1lKClcblxuICBleGVjdXRlOiAtPlxuICAgIGN1cnNvcnNUb01vdmVSaWdodCA9IEBlZGl0b3IuZ2V0Q3Vyc29ycygpLmZpbHRlciAoY3Vyc29yKSAtPiBub3QgY3Vyc29yLmlzQXRCZWdpbm5pbmdPZkxpbmUoKVxuICAgIEB2aW1TdGF0ZS5hY3RpdmF0ZSgnbm9ybWFsJylcbiAgICBtb3ZlQ3Vyc29yUmlnaHQoY3Vyc29yKSBmb3IgY3Vyc29yIGluIGN1cnNvcnNUb01vdmVSaWdodFxuICAgIGRpc3Bvc2FibGUgPSBhdG9tLmNvbW1hbmRzLm9uRGlkRGlzcGF0Y2ggKHt0eXBlfSkgPT5cbiAgICAgIHJldHVybiBpZiB0eXBlIGlzIEB0aGlzQ29tbWFuZE5hbWVcbiAgICAgIGRpc3Bvc2FibGUuZGlzcG9zZSgpXG4gICAgICBkaXNwb3NhYmxlID0gbnVsbFxuICAgICAgQHZpbVN0YXRlLmFjdGl2YXRlKCdpbnNlcnQnKVxuXG5jbGFzcyBJbnNlcnRSZWdpc3RlciBleHRlbmRzIEluc2VydE1vZGVcbiAgQGV4dGVuZCgpXG4gIHJlcXVpcmVJbnB1dDogdHJ1ZVxuXG4gIGluaXRpYWxpemU6IC0+XG4gICAgc3VwZXJcbiAgICBAZm9jdXNJbnB1dCgpXG5cbiAgZXhlY3V0ZTogLT5cbiAgICBAZWRpdG9yLnRyYW5zYWN0ID0+XG4gICAgICBmb3Igc2VsZWN0aW9uIGluIEBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpXG4gICAgICAgIHRleHQgPSBAdmltU3RhdGUucmVnaXN0ZXIuZ2V0VGV4dChAaW5wdXQsIHNlbGVjdGlvbilcbiAgICAgICAgc2VsZWN0aW9uLmluc2VydFRleHQodGV4dClcblxuY2xhc3MgSW5zZXJ0TGFzdEluc2VydGVkIGV4dGVuZHMgSW5zZXJ0TW9kZVxuICBAZXh0ZW5kKClcbiAgQGRlc2NyaXB0aW9uOiBcIlwiXCJcbiAgSW5zZXJ0IHRleHQgaW5zZXJ0ZWQgaW4gbGF0ZXN0IGluc2VydC1tb2RlLlxuICBFcXVpdmFsZW50IHRvICppX0NUUkwtQSogb2YgcHVyZSBWaW1cbiAgXCJcIlwiXG4gIGV4ZWN1dGU6IC0+XG4gICAgdGV4dCA9IEB2aW1TdGF0ZS5yZWdpc3Rlci5nZXRUZXh0KCcuJylcbiAgICBAZWRpdG9yLmluc2VydFRleHQodGV4dClcblxuY2xhc3MgQ29weUZyb21MaW5lQWJvdmUgZXh0ZW5kcyBJbnNlcnRNb2RlXG4gIEBleHRlbmQoKVxuICBAZGVzY3JpcHRpb246IFwiXCJcIlxuICBJbnNlcnQgY2hhcmFjdGVyIG9mIHNhbWUtY29sdW1uIG9mIGFib3ZlIGxpbmUuXG4gIEVxdWl2YWxlbnQgdG8gKmlfQ1RSTC1ZKiBvZiBwdXJlIFZpbVxuICBcIlwiXCJcbiAgcm93RGVsdGE6IC0xXG5cbiAgZXhlY3V0ZTogLT5cbiAgICB0cmFuc2xhdGlvbiA9IFtAcm93RGVsdGEsIDBdXG4gICAgQGVkaXRvci50cmFuc2FjdCA9PlxuICAgICAgZm9yIHNlbGVjdGlvbiBpbiBAZWRpdG9yLmdldFNlbGVjdGlvbnMoKVxuICAgICAgICBwb2ludCA9IHNlbGVjdGlvbi5jdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKS50cmFuc2xhdGUodHJhbnNsYXRpb24pXG4gICAgICAgIHJhbmdlID0gUmFuZ2UuZnJvbVBvaW50V2l0aERlbHRhKHBvaW50LCAwLCAxKVxuICAgICAgICBpZiB0ZXh0ID0gQGVkaXRvci5nZXRUZXh0SW5CdWZmZXJSYW5nZShyYW5nZSlcbiAgICAgICAgICBzZWxlY3Rpb24uaW5zZXJ0VGV4dCh0ZXh0KVxuXG5jbGFzcyBDb3B5RnJvbUxpbmVCZWxvdyBleHRlbmRzIENvcHlGcm9tTGluZUFib3ZlXG4gIEBleHRlbmQoKVxuICBAZGVzY3JpcHRpb246IFwiXCJcIlxuICBJbnNlcnQgY2hhcmFjdGVyIG9mIHNhbWUtY29sdW1uIG9mIGFib3ZlIGxpbmUuXG4gIEVxdWl2YWxlbnQgdG8gKmlfQ1RSTC1FKiBvZiBwdXJlIFZpbVxuICBcIlwiXCJcbiAgcm93RGVsdGE6ICsxXG4iXX0=
