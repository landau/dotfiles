(function() {
  var Base, CurrentSelection, Find, FindBackwards, Motion, MoveDown, MoveDownScreen, MoveDownToEdge, MoveDownWrap, MoveLeft, MoveRight, MoveRightBufferColumn, MoveToBeginningOfLine, MoveToBottomOfScreen, MoveToColumn, MoveToEndOfAlphanumericWord, MoveToEndOfSmartWord, MoveToEndOfSubword, MoveToEndOfWholeWord, MoveToEndOfWord, MoveToFirstCharacterOfLine, MoveToFirstCharacterOfLineAndDown, MoveToFirstCharacterOfLineDown, MoveToFirstCharacterOfLineUp, MoveToFirstLine, MoveToLastCharacterOfLine, MoveToLastLine, MoveToLastNonblankCharacterOfLineAndDown, MoveToLineByPercent, MoveToMark, MoveToMarkLine, MoveToMiddleOfScreen, MoveToNextAlphanumericWord, MoveToNextFoldEnd, MoveToNextFoldStart, MoveToNextFoldStartWithSameIndent, MoveToNextFunction, MoveToNextNumber, MoveToNextOccurrence, MoveToNextParagraph, MoveToNextSentence, MoveToNextSentenceSkipBlankRow, MoveToNextSmartWord, MoveToNextString, MoveToNextSubword, MoveToNextWholeWord, MoveToNextWord, MoveToPair, MoveToPositionByScope, MoveToPreviousAlphanumericWord, MoveToPreviousEndOfWholeWord, MoveToPreviousEndOfWord, MoveToPreviousFoldEnd, MoveToPreviousFoldStart, MoveToPreviousFoldStartWithSameIndent, MoveToPreviousFunction, MoveToPreviousNumber, MoveToPreviousOccurrence, MoveToPreviousParagraph, MoveToPreviousSentence, MoveToPreviousSentenceSkipBlankRow, MoveToPreviousSmartWord, MoveToPreviousString, MoveToPreviousSubword, MoveToPreviousWholeWord, MoveToPreviousWord, MoveToRelativeLine, MoveToRelativeLineMinimumOne, MoveToTopOfScreen, MoveUp, MoveUpScreen, MoveUpToEdge, MoveUpWrap, Point, Range, Scroll, ScrollFullScreenDown, ScrollFullScreenUp, ScrollHalfScreenDown, ScrollHalfScreenUp, Till, TillBackwards, _, cursorIsAtEndOfLineAtNonEmptyRow, cursorIsAtVimEndOfFile, detectScopeStartPositionForScope, findRangeInBufferRow, getBufferRows, getCodeFoldRowRanges, getEndOfLineForBufferRow, getFirstVisibleScreenRow, getIndex, getLargestFoldRangeContainsBufferRow, getLastVisibleScreenRow, getTextInScreenRange, getValidVimBufferRow, getValidVimScreenRow, isEmptyRow, isIncludeFunctionScopeForRow, limitNumber, moveCursorDownBuffer, moveCursorDownScreen, moveCursorLeft, moveCursorRight, moveCursorToFirstCharacterAtRow, moveCursorToNextNonWhitespace, moveCursorUpBuffer, moveCursorUpScreen, pointIsAtEndOfLineAtNonEmptyRow, pointIsOnWhiteSpace, ref, ref1, setBufferColumn, setBufferRow, smartScrollToBufferPosition, sortRanges, swrap,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  _ = require('underscore-plus');

  ref = require('atom'), Point = ref.Point, Range = ref.Range;

  ref1 = require('./utils'), moveCursorLeft = ref1.moveCursorLeft, moveCursorRight = ref1.moveCursorRight, moveCursorUpScreen = ref1.moveCursorUpScreen, moveCursorDownScreen = ref1.moveCursorDownScreen, moveCursorDownBuffer = ref1.moveCursorDownBuffer, moveCursorUpBuffer = ref1.moveCursorUpBuffer, cursorIsAtVimEndOfFile = ref1.cursorIsAtVimEndOfFile, getFirstVisibleScreenRow = ref1.getFirstVisibleScreenRow, getLastVisibleScreenRow = ref1.getLastVisibleScreenRow, getValidVimScreenRow = ref1.getValidVimScreenRow, getValidVimBufferRow = ref1.getValidVimBufferRow, moveCursorToFirstCharacterAtRow = ref1.moveCursorToFirstCharacterAtRow, sortRanges = ref1.sortRanges, pointIsOnWhiteSpace = ref1.pointIsOnWhiteSpace, moveCursorToNextNonWhitespace = ref1.moveCursorToNextNonWhitespace, isEmptyRow = ref1.isEmptyRow, getCodeFoldRowRanges = ref1.getCodeFoldRowRanges, getLargestFoldRangeContainsBufferRow = ref1.getLargestFoldRangeContainsBufferRow, isIncludeFunctionScopeForRow = ref1.isIncludeFunctionScopeForRow, detectScopeStartPositionForScope = ref1.detectScopeStartPositionForScope, getBufferRows = ref1.getBufferRows, getTextInScreenRange = ref1.getTextInScreenRange, cursorIsAtEndOfLineAtNonEmptyRow = ref1.cursorIsAtEndOfLineAtNonEmptyRow, setBufferRow = ref1.setBufferRow, setBufferColumn = ref1.setBufferColumn, limitNumber = ref1.limitNumber, getIndex = ref1.getIndex, smartScrollToBufferPosition = ref1.smartScrollToBufferPosition, pointIsAtEndOfLineAtNonEmptyRow = ref1.pointIsAtEndOfLineAtNonEmptyRow, getEndOfLineForBufferRow = ref1.getEndOfLineForBufferRow, findRangeInBufferRow = ref1.findRangeInBufferRow;

  swrap = require('./selection-wrapper');

  Base = require('./base');

  Motion = (function(superClass) {
    extend(Motion, superClass);

    Motion.extend(false);

    Motion.prototype.inclusive = false;

    Motion.prototype.wise = 'characterwise';

    Motion.prototype.jump = false;

    Motion.prototype.verticalMotion = false;

    Motion.prototype.moveSucceeded = null;

    Motion.prototype.moveSuccessOnLinewise = false;

    function Motion() {
      Motion.__super__.constructor.apply(this, arguments);
      if (this.mode === 'visual') {
        this.wise = this.submode;
      }
      this.initialize();
    }

    Motion.prototype.isLinewise = function() {
      return this.wise === 'linewise';
    };

    Motion.prototype.isBlockwise = function() {
      return this.wise === 'blockwise';
    };

    Motion.prototype.forceWise = function(wise) {
      if (wise === 'characterwise') {
        if (this.wise === 'linewise') {
          this.inclusive = false;
        } else {
          this.inclusive = !this.inclusive;
        }
      }
      return this.wise = wise;
    };

    Motion.prototype.setBufferPositionSafely = function(cursor, point) {
      if (point != null) {
        return cursor.setBufferPosition(point);
      }
    };

    Motion.prototype.setScreenPositionSafely = function(cursor, point) {
      if (point != null) {
        return cursor.setScreenPosition(point);
      }
    };

    Motion.prototype.moveWithSaveJump = function(cursor) {
      var cursorPosition;
      if (cursor.isLastCursor() && this.jump) {
        cursorPosition = cursor.getBufferPosition();
      }
      this.moveCursor(cursor);
      if ((cursorPosition != null) && !cursorPosition.isEqual(cursor.getBufferPosition())) {
        this.vimState.mark.set('`', cursorPosition);
        return this.vimState.mark.set("'", cursorPosition);
      }
    };

    Motion.prototype.execute = function() {
      var cursor, j, len, ref2;
      if (this.operator != null) {
        this.select();
      } else {
        ref2 = this.editor.getCursors();
        for (j = 0, len = ref2.length; j < len; j++) {
          cursor = ref2[j];
          this.moveWithSaveJump(cursor);
        }
      }
      this.editor.mergeCursors();
      return this.editor.mergeIntersectingSelections();
    };

    Motion.prototype.select = function() {
      var $selection, isOrWasVisual, j, len, ref2, ref3, selection, succeeded;
      isOrWasVisual = this.mode === 'visual' || this.is('CurrentSelection');
      ref2 = this.editor.getSelections();
      for (j = 0, len = ref2.length; j < len; j++) {
        selection = ref2[j];
        selection.modifySelection((function(_this) {
          return function() {
            return _this.moveWithSaveJump(selection.cursor);
          };
        })(this));
        succeeded = ((ref3 = this.moveSucceeded) != null ? ref3 : !selection.isEmpty()) || (this.moveSuccessOnLinewise && this.isLinewise());
        if (isOrWasVisual || (succeeded && (this.inclusive || this.isLinewise()))) {
          $selection = swrap(selection);
          $selection.saveProperties(true);
          $selection.applyWise(this.wise);
        }
      }
      if (this.wise === 'blockwise') {
        return this.vimState.getLastBlockwiseSelection().autoscroll();
      }
    };

    Motion.prototype.setCursorBufferRow = function(cursor, row, options) {
      if (this.verticalMotion && this.getConfig('moveToFirstCharacterOnVerticalMotion')) {
        return cursor.setBufferPosition(this.getFirstCharacterPositionForBufferRow(row), options);
      } else {
        return setBufferRow(cursor, row, options);
      }
    };

    Motion.prototype.moveCursorCountTimes = function(cursor, fn) {
      var oldPosition;
      oldPosition = cursor.getBufferPosition();
      return this.countTimes(this.getCount(), function(state) {
        var newPosition;
        fn(state);
        if ((newPosition = cursor.getBufferPosition()).isEqual(oldPosition)) {
          state.stop();
        }
        return oldPosition = newPosition;
      });
    };

    return Motion;

  })(Base);

  CurrentSelection = (function(superClass) {
    extend(CurrentSelection, superClass);

    function CurrentSelection() {
      return CurrentSelection.__super__.constructor.apply(this, arguments);
    }

    CurrentSelection.extend(false);

    CurrentSelection.prototype.selectionExtent = null;

    CurrentSelection.prototype.blockwiseSelectionExtent = null;

    CurrentSelection.prototype.inclusive = true;

    CurrentSelection.prototype.initialize = function() {
      CurrentSelection.__super__.initialize.apply(this, arguments);
      return this.pointInfoByCursor = new Map;
    };

    CurrentSelection.prototype.moveCursor = function(cursor) {
      var point;
      if (this.mode === 'visual') {
        if (this.isBlockwise()) {
          return this.blockwiseSelectionExtent = swrap(cursor.selection).getBlockwiseSelectionExtent();
        } else {
          return this.selectionExtent = this.editor.getSelectedBufferRange().getExtent();
        }
      } else {
        point = cursor.getBufferPosition();
        if (this.blockwiseSelectionExtent != null) {
          return cursor.setBufferPosition(point.translate(this.blockwiseSelectionExtent));
        } else {
          return cursor.setBufferPosition(point.traverse(this.selectionExtent));
        }
      }
    };

    CurrentSelection.prototype.select = function() {
      var cursor, cursorPosition, j, k, len, len1, pointInfo, ref2, ref3, results, startOfSelection;
      if (this.mode === 'visual') {
        CurrentSelection.__super__.select.apply(this, arguments);
      } else {
        ref2 = this.editor.getCursors();
        for (j = 0, len = ref2.length; j < len; j++) {
          cursor = ref2[j];
          if (!(pointInfo = this.pointInfoByCursor.get(cursor))) {
            continue;
          }
          cursorPosition = pointInfo.cursorPosition, startOfSelection = pointInfo.startOfSelection;
          if (cursorPosition.isEqual(cursor.getBufferPosition())) {
            cursor.setBufferPosition(startOfSelection);
          }
        }
        CurrentSelection.__super__.select.apply(this, arguments);
      }
      ref3 = this.editor.getCursors();
      results = [];
      for (k = 0, len1 = ref3.length; k < len1; k++) {
        cursor = ref3[k];
        startOfSelection = cursor.selection.getBufferRange().start;
        results.push(this.onDidFinishOperation((function(_this) {
          return function() {
            cursorPosition = cursor.getBufferPosition();
            return _this.pointInfoByCursor.set(cursor, {
              startOfSelection: startOfSelection,
              cursorPosition: cursorPosition
            });
          };
        })(this)));
      }
      return results;
    };

    return CurrentSelection;

  })(Motion);

  MoveLeft = (function(superClass) {
    extend(MoveLeft, superClass);

    function MoveLeft() {
      return MoveLeft.__super__.constructor.apply(this, arguments);
    }

    MoveLeft.extend();

    MoveLeft.prototype.moveCursor = function(cursor) {
      var allowWrap;
      allowWrap = this.getConfig('wrapLeftRightMotion');
      return this.moveCursorCountTimes(cursor, function() {
        return moveCursorLeft(cursor, {
          allowWrap: allowWrap
        });
      });
    };

    return MoveLeft;

  })(Motion);

  MoveRight = (function(superClass) {
    extend(MoveRight, superClass);

    function MoveRight() {
      return MoveRight.__super__.constructor.apply(this, arguments);
    }

    MoveRight.extend();

    MoveRight.prototype.canWrapToNextLine = function(cursor) {
      if (this.isAsTargetExceptSelect() && !cursor.isAtEndOfLine()) {
        return false;
      } else {
        return this.getConfig('wrapLeftRightMotion');
      }
    };

    MoveRight.prototype.moveCursor = function(cursor) {
      return this.moveCursorCountTimes(cursor, (function(_this) {
        return function() {
          var allowWrap;
          _this.editor.unfoldBufferRow(cursor.getBufferRow());
          allowWrap = _this.canWrapToNextLine(cursor);
          moveCursorRight(cursor);
          if (cursor.isAtEndOfLine() && allowWrap && !cursorIsAtVimEndOfFile(cursor)) {
            return moveCursorRight(cursor, {
              allowWrap: allowWrap
            });
          }
        };
      })(this));
    };

    return MoveRight;

  })(Motion);

  MoveRightBufferColumn = (function(superClass) {
    extend(MoveRightBufferColumn, superClass);

    function MoveRightBufferColumn() {
      return MoveRightBufferColumn.__super__.constructor.apply(this, arguments);
    }

    MoveRightBufferColumn.extend(false);

    MoveRightBufferColumn.prototype.moveCursor = function(cursor) {
      return setBufferColumn(cursor, cursor.getBufferColumn() + this.getCount());
    };

    return MoveRightBufferColumn;

  })(Motion);

  MoveUp = (function(superClass) {
    extend(MoveUp, superClass);

    function MoveUp() {
      return MoveUp.__super__.constructor.apply(this, arguments);
    }

    MoveUp.extend();

    MoveUp.prototype.wise = 'linewise';

    MoveUp.prototype.wrap = false;

    MoveUp.prototype.getBufferRow = function(row) {
      row = this.getNextRow(row);
      if (this.editor.isFoldedAtBufferRow(row)) {
        return getLargestFoldRangeContainsBufferRow(this.editor, row).start.row;
      } else {
        return row;
      }
    };

    MoveUp.prototype.getNextRow = function(row) {
      var min;
      min = 0;
      if (this.wrap && row === min) {
        return this.getVimLastBufferRow();
      } else {
        return limitNumber(row - 1, {
          min: min
        });
      }
    };

    MoveUp.prototype.moveCursor = function(cursor) {
      return this.moveCursorCountTimes(cursor, (function(_this) {
        return function() {
          return setBufferRow(cursor, _this.getBufferRow(cursor.getBufferRow()));
        };
      })(this));
    };

    return MoveUp;

  })(Motion);

  MoveUpWrap = (function(superClass) {
    extend(MoveUpWrap, superClass);

    function MoveUpWrap() {
      return MoveUpWrap.__super__.constructor.apply(this, arguments);
    }

    MoveUpWrap.extend();

    MoveUpWrap.prototype.wrap = true;

    return MoveUpWrap;

  })(MoveUp);

  MoveDown = (function(superClass) {
    extend(MoveDown, superClass);

    function MoveDown() {
      return MoveDown.__super__.constructor.apply(this, arguments);
    }

    MoveDown.extend();

    MoveDown.prototype.wise = 'linewise';

    MoveDown.prototype.wrap = false;

    MoveDown.prototype.getBufferRow = function(row) {
      if (this.editor.isFoldedAtBufferRow(row)) {
        row = getLargestFoldRangeContainsBufferRow(this.editor, row).end.row;
      }
      return this.getNextRow(row);
    };

    MoveDown.prototype.getNextRow = function(row) {
      var max;
      max = this.getVimLastBufferRow();
      if (this.wrap && row >= max) {
        return 0;
      } else {
        return limitNumber(row + 1, {
          max: max
        });
      }
    };

    return MoveDown;

  })(MoveUp);

  MoveDownWrap = (function(superClass) {
    extend(MoveDownWrap, superClass);

    function MoveDownWrap() {
      return MoveDownWrap.__super__.constructor.apply(this, arguments);
    }

    MoveDownWrap.extend();

    MoveDownWrap.prototype.wrap = true;

    return MoveDownWrap;

  })(MoveDown);

  MoveUpScreen = (function(superClass) {
    extend(MoveUpScreen, superClass);

    function MoveUpScreen() {
      return MoveUpScreen.__super__.constructor.apply(this, arguments);
    }

    MoveUpScreen.extend();

    MoveUpScreen.prototype.wise = 'linewise';

    MoveUpScreen.prototype.direction = 'up';

    MoveUpScreen.prototype.moveCursor = function(cursor) {
      return this.moveCursorCountTimes(cursor, function() {
        return moveCursorUpScreen(cursor);
      });
    };

    return MoveUpScreen;

  })(Motion);

  MoveDownScreen = (function(superClass) {
    extend(MoveDownScreen, superClass);

    function MoveDownScreen() {
      return MoveDownScreen.__super__.constructor.apply(this, arguments);
    }

    MoveDownScreen.extend();

    MoveDownScreen.prototype.wise = 'linewise';

    MoveDownScreen.prototype.direction = 'down';

    MoveDownScreen.prototype.moveCursor = function(cursor) {
      return this.moveCursorCountTimes(cursor, function() {
        return moveCursorDownScreen(cursor);
      });
    };

    return MoveDownScreen;

  })(MoveUpScreen);

  MoveUpToEdge = (function(superClass) {
    extend(MoveUpToEdge, superClass);

    function MoveUpToEdge() {
      return MoveUpToEdge.__super__.constructor.apply(this, arguments);
    }

    MoveUpToEdge.extend();

    MoveUpToEdge.prototype.wise = 'linewise';

    MoveUpToEdge.prototype.jump = true;

    MoveUpToEdge.prototype.direction = 'up';

    MoveUpToEdge.description = "Move cursor up to **edge** char at same-column";

    MoveUpToEdge.prototype.moveCursor = function(cursor) {
      return this.moveCursorCountTimes(cursor, (function(_this) {
        return function() {
          return _this.setScreenPositionSafely(cursor, _this.getPoint(cursor.getScreenPosition()));
        };
      })(this));
    };

    MoveUpToEdge.prototype.getPoint = function(fromPoint) {
      var column, j, len, point, ref2, row;
      column = fromPoint.column;
      ref2 = this.getScanRows(fromPoint);
      for (j = 0, len = ref2.length; j < len; j++) {
        row = ref2[j];
        if (this.isEdge(point = new Point(row, column))) {
          return point;
        }
      }
    };

    MoveUpToEdge.prototype.getScanRows = function(arg) {
      var j, k, ref2, ref3, ref4, results, results1, row, validRow;
      row = arg.row;
      validRow = getValidVimScreenRow.bind(null, this.editor);
      switch (this.direction) {
        case 'up':
          return (function() {
            results = [];
            for (var j = ref2 = validRow(row - 1); ref2 <= 0 ? j <= 0 : j >= 0; ref2 <= 0 ? j++ : j--){ results.push(j); }
            return results;
          }).apply(this);
        case 'down':
          return (function() {
            results1 = [];
            for (var k = ref3 = validRow(row + 1), ref4 = this.getVimLastScreenRow(); ref3 <= ref4 ? k <= ref4 : k >= ref4; ref3 <= ref4 ? k++ : k--){ results1.push(k); }
            return results1;
          }).apply(this);
      }
    };

    MoveUpToEdge.prototype.isEdge = function(point) {
      var above, below;
      if (this.isStoppablePoint(point)) {
        above = point.translate([-1, 0]);
        below = point.translate([+1, 0]);
        return (!this.isStoppablePoint(above)) || (!this.isStoppablePoint(below));
      } else {
        return false;
      }
    };

    MoveUpToEdge.prototype.isStoppablePoint = function(point) {
      var leftPoint, rightPoint;
      if (this.isNonWhiteSpacePoint(point)) {
        return true;
      } else {
        leftPoint = point.translate([0, -1]);
        rightPoint = point.translate([0, +1]);
        return this.isNonWhiteSpacePoint(leftPoint) && this.isNonWhiteSpacePoint(rightPoint);
      }
    };

    MoveUpToEdge.prototype.isNonWhiteSpacePoint = function(point) {
      var char;
      char = getTextInScreenRange(this.editor, Range.fromPointWithDelta(point, 0, 1));
      return (char != null) && /\S/.test(char);
    };

    return MoveUpToEdge;

  })(Motion);

  MoveDownToEdge = (function(superClass) {
    extend(MoveDownToEdge, superClass);

    function MoveDownToEdge() {
      return MoveDownToEdge.__super__.constructor.apply(this, arguments);
    }

    MoveDownToEdge.extend();

    MoveDownToEdge.description = "Move cursor down to **edge** char at same-column";

    MoveDownToEdge.prototype.direction = 'down';

    return MoveDownToEdge;

  })(MoveUpToEdge);

  MoveToNextWord = (function(superClass) {
    extend(MoveToNextWord, superClass);

    function MoveToNextWord() {
      return MoveToNextWord.__super__.constructor.apply(this, arguments);
    }

    MoveToNextWord.extend();

    MoveToNextWord.prototype.wordRegex = null;

    MoveToNextWord.prototype.getPoint = function(pattern, from) {
      var found, point, ref2, vimEOF, wordRange;
      wordRange = null;
      found = false;
      vimEOF = this.getVimEofBufferPosition(this.editor);
      this.scanForward(pattern, {
        from: from
      }, function(arg) {
        var matchText, range, stop;
        range = arg.range, matchText = arg.matchText, stop = arg.stop;
        wordRange = range;
        if (matchText === '' && range.start.column !== 0) {
          return;
        }
        if (range.start.isGreaterThan(from)) {
          found = true;
          return stop();
        }
      });
      if (found) {
        point = wordRange.start;
        if (pointIsAtEndOfLineAtNonEmptyRow(this.editor, point) && !point.isEqual(vimEOF)) {
          return point.traverse([1, 0]);
        } else {
          return point;
        }
      } else {
        return (ref2 = wordRange != null ? wordRange.end : void 0) != null ? ref2 : from;
      }
    };

    MoveToNextWord.prototype.moveCursor = function(cursor) {
      var isAsTargetExceptSelect, wasOnWhiteSpace;
      if (cursorIsAtVimEndOfFile(cursor)) {
        return;
      }
      wasOnWhiteSpace = pointIsOnWhiteSpace(this.editor, cursor.getBufferPosition());
      isAsTargetExceptSelect = this.isAsTargetExceptSelect();
      return this.moveCursorCountTimes(cursor, (function(_this) {
        return function(arg) {
          var cursorPosition, isFinal, pattern, point, ref2;
          isFinal = arg.isFinal;
          cursorPosition = cursor.getBufferPosition();
          if (isEmptyRow(_this.editor, cursorPosition.row) && isAsTargetExceptSelect) {
            point = cursorPosition.traverse([1, 0]);
          } else {
            pattern = (ref2 = _this.wordRegex) != null ? ref2 : cursor.wordRegExp();
            point = _this.getPoint(pattern, cursorPosition);
            if (isFinal && isAsTargetExceptSelect) {
              if (_this.getOperator().is('Change') && (!wasOnWhiteSpace)) {
                point = cursor.getEndOfCurrentWordBufferPosition({
                  wordRegex: _this.wordRegex
                });
              } else {
                point = Point.min(point, getEndOfLineForBufferRow(_this.editor, cursorPosition.row));
              }
            }
          }
          return cursor.setBufferPosition(point);
        };
      })(this));
    };

    return MoveToNextWord;

  })(Motion);

  MoveToPreviousWord = (function(superClass) {
    extend(MoveToPreviousWord, superClass);

    function MoveToPreviousWord() {
      return MoveToPreviousWord.__super__.constructor.apply(this, arguments);
    }

    MoveToPreviousWord.extend();

    MoveToPreviousWord.prototype.wordRegex = null;

    MoveToPreviousWord.prototype.moveCursor = function(cursor) {
      return this.moveCursorCountTimes(cursor, (function(_this) {
        return function() {
          var point;
          point = cursor.getBeginningOfCurrentWordBufferPosition({
            wordRegex: _this.wordRegex
          });
          return cursor.setBufferPosition(point);
        };
      })(this));
    };

    return MoveToPreviousWord;

  })(Motion);

  MoveToEndOfWord = (function(superClass) {
    extend(MoveToEndOfWord, superClass);

    function MoveToEndOfWord() {
      return MoveToEndOfWord.__super__.constructor.apply(this, arguments);
    }

    MoveToEndOfWord.extend();

    MoveToEndOfWord.prototype.wordRegex = null;

    MoveToEndOfWord.prototype.inclusive = true;

    MoveToEndOfWord.prototype.moveToNextEndOfWord = function(cursor) {
      var point;
      moveCursorToNextNonWhitespace(cursor);
      point = cursor.getEndOfCurrentWordBufferPosition({
        wordRegex: this.wordRegex
      }).translate([0, -1]);
      point = Point.min(point, this.getVimEofBufferPosition());
      return cursor.setBufferPosition(point);
    };

    MoveToEndOfWord.prototype.moveCursor = function(cursor) {
      return this.moveCursorCountTimes(cursor, (function(_this) {
        return function() {
          var originalPoint;
          originalPoint = cursor.getBufferPosition();
          _this.moveToNextEndOfWord(cursor);
          if (originalPoint.isEqual(cursor.getBufferPosition())) {
            cursor.moveRight();
            return _this.moveToNextEndOfWord(cursor);
          }
        };
      })(this));
    };

    return MoveToEndOfWord;

  })(Motion);

  MoveToPreviousEndOfWord = (function(superClass) {
    extend(MoveToPreviousEndOfWord, superClass);

    function MoveToPreviousEndOfWord() {
      return MoveToPreviousEndOfWord.__super__.constructor.apply(this, arguments);
    }

    MoveToPreviousEndOfWord.extend();

    MoveToPreviousEndOfWord.prototype.inclusive = true;

    MoveToPreviousEndOfWord.prototype.moveCursor = function(cursor) {
      var cursorPosition, j, point, ref2, times, wordRange;
      times = this.getCount();
      wordRange = cursor.getCurrentWordBufferRange();
      cursorPosition = cursor.getBufferPosition();
      if (cursorPosition.isGreaterThan(wordRange.start) && cursorPosition.isLessThan(wordRange.end)) {
        times += 1;
      }
      for (j = 1, ref2 = times; 1 <= ref2 ? j <= ref2 : j >= ref2; 1 <= ref2 ? j++ : j--) {
        point = cursor.getBeginningOfCurrentWordBufferPosition({
          wordRegex: this.wordRegex
        });
        cursor.setBufferPosition(point);
      }
      this.moveToNextEndOfWord(cursor);
      if (cursor.getBufferPosition().isGreaterThanOrEqual(cursorPosition)) {
        return cursor.setBufferPosition([0, 0]);
      }
    };

    MoveToPreviousEndOfWord.prototype.moveToNextEndOfWord = function(cursor) {
      var point;
      point = cursor.getEndOfCurrentWordBufferPosition({
        wordRegex: this.wordRegex
      }).translate([0, -1]);
      point = Point.min(point, this.getVimEofBufferPosition());
      return cursor.setBufferPosition(point);
    };

    return MoveToPreviousEndOfWord;

  })(MoveToPreviousWord);

  MoveToNextWholeWord = (function(superClass) {
    extend(MoveToNextWholeWord, superClass);

    function MoveToNextWholeWord() {
      return MoveToNextWholeWord.__super__.constructor.apply(this, arguments);
    }

    MoveToNextWholeWord.extend();

    MoveToNextWholeWord.prototype.wordRegex = /^$|\S+/g;

    return MoveToNextWholeWord;

  })(MoveToNextWord);

  MoveToPreviousWholeWord = (function(superClass) {
    extend(MoveToPreviousWholeWord, superClass);

    function MoveToPreviousWholeWord() {
      return MoveToPreviousWholeWord.__super__.constructor.apply(this, arguments);
    }

    MoveToPreviousWholeWord.extend();

    MoveToPreviousWholeWord.prototype.wordRegex = /^$|\S+/g;

    return MoveToPreviousWholeWord;

  })(MoveToPreviousWord);

  MoveToEndOfWholeWord = (function(superClass) {
    extend(MoveToEndOfWholeWord, superClass);

    function MoveToEndOfWholeWord() {
      return MoveToEndOfWholeWord.__super__.constructor.apply(this, arguments);
    }

    MoveToEndOfWholeWord.extend();

    MoveToEndOfWholeWord.prototype.wordRegex = /\S+/;

    return MoveToEndOfWholeWord;

  })(MoveToEndOfWord);

  MoveToPreviousEndOfWholeWord = (function(superClass) {
    extend(MoveToPreviousEndOfWholeWord, superClass);

    function MoveToPreviousEndOfWholeWord() {
      return MoveToPreviousEndOfWholeWord.__super__.constructor.apply(this, arguments);
    }

    MoveToPreviousEndOfWholeWord.extend();

    MoveToPreviousEndOfWholeWord.prototype.wordRegex = /\S+/;

    return MoveToPreviousEndOfWholeWord;

  })(MoveToPreviousEndOfWord);

  MoveToNextAlphanumericWord = (function(superClass) {
    extend(MoveToNextAlphanumericWord, superClass);

    function MoveToNextAlphanumericWord() {
      return MoveToNextAlphanumericWord.__super__.constructor.apply(this, arguments);
    }

    MoveToNextAlphanumericWord.extend();

    MoveToNextAlphanumericWord.description = "Move to next alphanumeric(`/\w+/`) word";

    MoveToNextAlphanumericWord.prototype.wordRegex = /\w+/g;

    return MoveToNextAlphanumericWord;

  })(MoveToNextWord);

  MoveToPreviousAlphanumericWord = (function(superClass) {
    extend(MoveToPreviousAlphanumericWord, superClass);

    function MoveToPreviousAlphanumericWord() {
      return MoveToPreviousAlphanumericWord.__super__.constructor.apply(this, arguments);
    }

    MoveToPreviousAlphanumericWord.extend();

    MoveToPreviousAlphanumericWord.description = "Move to previous alphanumeric(`/\w+/`) word";

    MoveToPreviousAlphanumericWord.prototype.wordRegex = /\w+/;

    return MoveToPreviousAlphanumericWord;

  })(MoveToPreviousWord);

  MoveToEndOfAlphanumericWord = (function(superClass) {
    extend(MoveToEndOfAlphanumericWord, superClass);

    function MoveToEndOfAlphanumericWord() {
      return MoveToEndOfAlphanumericWord.__super__.constructor.apply(this, arguments);
    }

    MoveToEndOfAlphanumericWord.extend();

    MoveToEndOfAlphanumericWord.description = "Move to end of alphanumeric(`/\w+/`) word";

    MoveToEndOfAlphanumericWord.prototype.wordRegex = /\w+/;

    return MoveToEndOfAlphanumericWord;

  })(MoveToEndOfWord);

  MoveToNextSmartWord = (function(superClass) {
    extend(MoveToNextSmartWord, superClass);

    function MoveToNextSmartWord() {
      return MoveToNextSmartWord.__super__.constructor.apply(this, arguments);
    }

    MoveToNextSmartWord.extend();

    MoveToNextSmartWord.description = "Move to next smart word (`/[\w-]+/`) word";

    MoveToNextSmartWord.prototype.wordRegex = /[\w-]+/g;

    return MoveToNextSmartWord;

  })(MoveToNextWord);

  MoveToPreviousSmartWord = (function(superClass) {
    extend(MoveToPreviousSmartWord, superClass);

    function MoveToPreviousSmartWord() {
      return MoveToPreviousSmartWord.__super__.constructor.apply(this, arguments);
    }

    MoveToPreviousSmartWord.extend();

    MoveToPreviousSmartWord.description = "Move to previous smart word (`/[\w-]+/`) word";

    MoveToPreviousSmartWord.prototype.wordRegex = /[\w-]+/;

    return MoveToPreviousSmartWord;

  })(MoveToPreviousWord);

  MoveToEndOfSmartWord = (function(superClass) {
    extend(MoveToEndOfSmartWord, superClass);

    function MoveToEndOfSmartWord() {
      return MoveToEndOfSmartWord.__super__.constructor.apply(this, arguments);
    }

    MoveToEndOfSmartWord.extend();

    MoveToEndOfSmartWord.description = "Move to end of smart word (`/[\w-]+/`) word";

    MoveToEndOfSmartWord.prototype.wordRegex = /[\w-]+/;

    return MoveToEndOfSmartWord;

  })(MoveToEndOfWord);

  MoveToNextSubword = (function(superClass) {
    extend(MoveToNextSubword, superClass);

    function MoveToNextSubword() {
      return MoveToNextSubword.__super__.constructor.apply(this, arguments);
    }

    MoveToNextSubword.extend();

    MoveToNextSubword.prototype.moveCursor = function(cursor) {
      this.wordRegex = cursor.subwordRegExp();
      return MoveToNextSubword.__super__.moveCursor.apply(this, arguments);
    };

    return MoveToNextSubword;

  })(MoveToNextWord);

  MoveToPreviousSubword = (function(superClass) {
    extend(MoveToPreviousSubword, superClass);

    function MoveToPreviousSubword() {
      return MoveToPreviousSubword.__super__.constructor.apply(this, arguments);
    }

    MoveToPreviousSubword.extend();

    MoveToPreviousSubword.prototype.moveCursor = function(cursor) {
      this.wordRegex = cursor.subwordRegExp();
      return MoveToPreviousSubword.__super__.moveCursor.apply(this, arguments);
    };

    return MoveToPreviousSubword;

  })(MoveToPreviousWord);

  MoveToEndOfSubword = (function(superClass) {
    extend(MoveToEndOfSubword, superClass);

    function MoveToEndOfSubword() {
      return MoveToEndOfSubword.__super__.constructor.apply(this, arguments);
    }

    MoveToEndOfSubword.extend();

    MoveToEndOfSubword.prototype.moveCursor = function(cursor) {
      this.wordRegex = cursor.subwordRegExp();
      return MoveToEndOfSubword.__super__.moveCursor.apply(this, arguments);
    };

    return MoveToEndOfSubword;

  })(MoveToEndOfWord);

  MoveToNextSentence = (function(superClass) {
    extend(MoveToNextSentence, superClass);

    function MoveToNextSentence() {
      return MoveToNextSentence.__super__.constructor.apply(this, arguments);
    }

    MoveToNextSentence.extend();

    MoveToNextSentence.prototype.jump = true;

    MoveToNextSentence.prototype.sentenceRegex = /(?:[\.!\?][\)\]"']*\s+)|(\n|\r\n)/g;

    MoveToNextSentence.prototype.direction = 'next';

    MoveToNextSentence.prototype.moveCursor = function(cursor) {
      return this.moveCursorCountTimes(cursor, (function(_this) {
        return function() {
          return _this.setBufferPositionSafely(cursor, _this.getPoint(cursor.getBufferPosition()));
        };
      })(this));
    };

    MoveToNextSentence.prototype.getPoint = function(fromPoint) {
      if (this.direction === 'next') {
        return this.getNextStartOfSentence(fromPoint);
      } else if (this.direction === 'previous') {
        return this.getPreviousStartOfSentence(fromPoint);
      }
    };

    MoveToNextSentence.prototype.isBlankRow = function(row) {
      return this.editor.isBufferRowBlank(row);
    };

    MoveToNextSentence.prototype.getNextStartOfSentence = function(from) {
      var foundPoint;
      foundPoint = null;
      this.scanForward(this.sentenceRegex, {
        from: from
      }, (function(_this) {
        return function(arg) {
          var endRow, match, matchText, range, ref2, startRow, stop;
          range = arg.range, matchText = arg.matchText, match = arg.match, stop = arg.stop;
          if (match[1] != null) {
            ref2 = [range.start.row, range.end.row], startRow = ref2[0], endRow = ref2[1];
            if (_this.skipBlankRow && _this.isBlankRow(endRow)) {
              return;
            }
            if (_this.isBlankRow(startRow) !== _this.isBlankRow(endRow)) {
              foundPoint = _this.getFirstCharacterPositionForBufferRow(endRow);
            }
          } else {
            foundPoint = range.end;
          }
          if (foundPoint != null) {
            return stop();
          }
        };
      })(this));
      return foundPoint != null ? foundPoint : this.getVimEofBufferPosition();
    };

    MoveToNextSentence.prototype.getPreviousStartOfSentence = function(from) {
      var foundPoint;
      foundPoint = null;
      this.scanBackward(this.sentenceRegex, {
        from: from
      }, (function(_this) {
        return function(arg) {
          var endRow, match, matchText, point, range, ref2, startRow, stop;
          range = arg.range, match = arg.match, stop = arg.stop, matchText = arg.matchText;
          if (match[1] != null) {
            ref2 = [range.start.row, range.end.row], startRow = ref2[0], endRow = ref2[1];
            if (!_this.isBlankRow(endRow) && _this.isBlankRow(startRow)) {
              point = _this.getFirstCharacterPositionForBufferRow(endRow);
              if (point.isLessThan(from)) {
                foundPoint = point;
              } else {
                if (_this.skipBlankRow) {
                  return;
                }
                foundPoint = _this.getFirstCharacterPositionForBufferRow(startRow);
              }
            }
          } else {
            if (range.end.isLessThan(from)) {
              foundPoint = range.end;
            }
          }
          if (foundPoint != null) {
            return stop();
          }
        };
      })(this));
      return foundPoint != null ? foundPoint : [0, 0];
    };

    return MoveToNextSentence;

  })(Motion);

  MoveToPreviousSentence = (function(superClass) {
    extend(MoveToPreviousSentence, superClass);

    function MoveToPreviousSentence() {
      return MoveToPreviousSentence.__super__.constructor.apply(this, arguments);
    }

    MoveToPreviousSentence.extend();

    MoveToPreviousSentence.prototype.direction = 'previous';

    return MoveToPreviousSentence;

  })(MoveToNextSentence);

  MoveToNextSentenceSkipBlankRow = (function(superClass) {
    extend(MoveToNextSentenceSkipBlankRow, superClass);

    function MoveToNextSentenceSkipBlankRow() {
      return MoveToNextSentenceSkipBlankRow.__super__.constructor.apply(this, arguments);
    }

    MoveToNextSentenceSkipBlankRow.extend();

    MoveToNextSentenceSkipBlankRow.prototype.skipBlankRow = true;

    return MoveToNextSentenceSkipBlankRow;

  })(MoveToNextSentence);

  MoveToPreviousSentenceSkipBlankRow = (function(superClass) {
    extend(MoveToPreviousSentenceSkipBlankRow, superClass);

    function MoveToPreviousSentenceSkipBlankRow() {
      return MoveToPreviousSentenceSkipBlankRow.__super__.constructor.apply(this, arguments);
    }

    MoveToPreviousSentenceSkipBlankRow.extend();

    MoveToPreviousSentenceSkipBlankRow.prototype.skipBlankRow = true;

    return MoveToPreviousSentenceSkipBlankRow;

  })(MoveToPreviousSentence);

  MoveToNextParagraph = (function(superClass) {
    extend(MoveToNextParagraph, superClass);

    function MoveToNextParagraph() {
      return MoveToNextParagraph.__super__.constructor.apply(this, arguments);
    }

    MoveToNextParagraph.extend();

    MoveToNextParagraph.prototype.jump = true;

    MoveToNextParagraph.prototype.direction = 'next';

    MoveToNextParagraph.prototype.moveCursor = function(cursor) {
      return this.moveCursorCountTimes(cursor, (function(_this) {
        return function() {
          return _this.setBufferPositionSafely(cursor, _this.getPoint(cursor.getBufferPosition()));
        };
      })(this));
    };

    MoveToNextParagraph.prototype.getPoint = function(fromPoint) {
      var j, len, ref2, row, startRow, wasAtNonBlankRow;
      startRow = fromPoint.row;
      wasAtNonBlankRow = !this.editor.isBufferRowBlank(startRow);
      ref2 = getBufferRows(this.editor, {
        startRow: startRow,
        direction: this.direction
      });
      for (j = 0, len = ref2.length; j < len; j++) {
        row = ref2[j];
        if (this.editor.isBufferRowBlank(row)) {
          if (wasAtNonBlankRow) {
            return new Point(row, 0);
          }
        } else {
          wasAtNonBlankRow = true;
        }
      }
      switch (this.direction) {
        case 'previous':
          return new Point(0, 0);
        case 'next':
          return this.getVimEofBufferPosition();
      }
    };

    return MoveToNextParagraph;

  })(Motion);

  MoveToPreviousParagraph = (function(superClass) {
    extend(MoveToPreviousParagraph, superClass);

    function MoveToPreviousParagraph() {
      return MoveToPreviousParagraph.__super__.constructor.apply(this, arguments);
    }

    MoveToPreviousParagraph.extend();

    MoveToPreviousParagraph.prototype.direction = 'previous';

    return MoveToPreviousParagraph;

  })(MoveToNextParagraph);

  MoveToBeginningOfLine = (function(superClass) {
    extend(MoveToBeginningOfLine, superClass);

    function MoveToBeginningOfLine() {
      return MoveToBeginningOfLine.__super__.constructor.apply(this, arguments);
    }

    MoveToBeginningOfLine.extend();

    MoveToBeginningOfLine.prototype.moveCursor = function(cursor) {
      return setBufferColumn(cursor, 0);
    };

    return MoveToBeginningOfLine;

  })(Motion);

  MoveToColumn = (function(superClass) {
    extend(MoveToColumn, superClass);

    function MoveToColumn() {
      return MoveToColumn.__super__.constructor.apply(this, arguments);
    }

    MoveToColumn.extend();

    MoveToColumn.prototype.moveCursor = function(cursor) {
      return setBufferColumn(cursor, this.getCount(-1));
    };

    return MoveToColumn;

  })(Motion);

  MoveToLastCharacterOfLine = (function(superClass) {
    extend(MoveToLastCharacterOfLine, superClass);

    function MoveToLastCharacterOfLine() {
      return MoveToLastCharacterOfLine.__super__.constructor.apply(this, arguments);
    }

    MoveToLastCharacterOfLine.extend();

    MoveToLastCharacterOfLine.prototype.moveCursor = function(cursor) {
      var row;
      row = getValidVimBufferRow(this.editor, cursor.getBufferRow() + this.getCount(-1));
      cursor.setBufferPosition([row, 2e308]);
      return cursor.goalColumn = 2e308;
    };

    return MoveToLastCharacterOfLine;

  })(Motion);

  MoveToLastNonblankCharacterOfLineAndDown = (function(superClass) {
    extend(MoveToLastNonblankCharacterOfLineAndDown, superClass);

    function MoveToLastNonblankCharacterOfLineAndDown() {
      return MoveToLastNonblankCharacterOfLineAndDown.__super__.constructor.apply(this, arguments);
    }

    MoveToLastNonblankCharacterOfLineAndDown.extend();

    MoveToLastNonblankCharacterOfLineAndDown.prototype.inclusive = true;

    MoveToLastNonblankCharacterOfLineAndDown.prototype.moveCursor = function(cursor) {
      var point;
      point = this.getPoint(cursor.getBufferPosition());
      return cursor.setBufferPosition(point);
    };

    MoveToLastNonblankCharacterOfLineAndDown.prototype.getPoint = function(arg) {
      var range, ref2, row;
      row = arg.row;
      row = limitNumber(row + this.getCount(-1), {
        max: this.getVimLastBufferRow()
      });
      range = findRangeInBufferRow(this.editor, /\S|^/, row, {
        direction: 'backward'
      });
      return (ref2 = range != null ? range.start : void 0) != null ? ref2 : new Point(row, 0);
    };

    return MoveToLastNonblankCharacterOfLineAndDown;

  })(Motion);

  MoveToFirstCharacterOfLine = (function(superClass) {
    extend(MoveToFirstCharacterOfLine, superClass);

    function MoveToFirstCharacterOfLine() {
      return MoveToFirstCharacterOfLine.__super__.constructor.apply(this, arguments);
    }

    MoveToFirstCharacterOfLine.extend();

    MoveToFirstCharacterOfLine.prototype.moveCursor = function(cursor) {
      var point;
      point = this.getFirstCharacterPositionForBufferRow(cursor.getBufferRow());
      return this.setBufferPositionSafely(cursor, point);
    };

    return MoveToFirstCharacterOfLine;

  })(Motion);

  MoveToFirstCharacterOfLineUp = (function(superClass) {
    extend(MoveToFirstCharacterOfLineUp, superClass);

    function MoveToFirstCharacterOfLineUp() {
      return MoveToFirstCharacterOfLineUp.__super__.constructor.apply(this, arguments);
    }

    MoveToFirstCharacterOfLineUp.extend();

    MoveToFirstCharacterOfLineUp.prototype.wise = 'linewise';

    MoveToFirstCharacterOfLineUp.prototype.moveCursor = function(cursor) {
      this.moveCursorCountTimes(cursor, function() {
        return moveCursorUpBuffer(cursor);
      });
      return MoveToFirstCharacterOfLineUp.__super__.moveCursor.apply(this, arguments);
    };

    return MoveToFirstCharacterOfLineUp;

  })(MoveToFirstCharacterOfLine);

  MoveToFirstCharacterOfLineDown = (function(superClass) {
    extend(MoveToFirstCharacterOfLineDown, superClass);

    function MoveToFirstCharacterOfLineDown() {
      return MoveToFirstCharacterOfLineDown.__super__.constructor.apply(this, arguments);
    }

    MoveToFirstCharacterOfLineDown.extend();

    MoveToFirstCharacterOfLineDown.prototype.wise = 'linewise';

    MoveToFirstCharacterOfLineDown.prototype.moveCursor = function(cursor) {
      this.moveCursorCountTimes(cursor, function() {
        return moveCursorDownBuffer(cursor);
      });
      return MoveToFirstCharacterOfLineDown.__super__.moveCursor.apply(this, arguments);
    };

    return MoveToFirstCharacterOfLineDown;

  })(MoveToFirstCharacterOfLine);

  MoveToFirstCharacterOfLineAndDown = (function(superClass) {
    extend(MoveToFirstCharacterOfLineAndDown, superClass);

    function MoveToFirstCharacterOfLineAndDown() {
      return MoveToFirstCharacterOfLineAndDown.__super__.constructor.apply(this, arguments);
    }

    MoveToFirstCharacterOfLineAndDown.extend();

    MoveToFirstCharacterOfLineAndDown.prototype.defaultCount = 0;

    MoveToFirstCharacterOfLineAndDown.prototype.getCount = function() {
      return MoveToFirstCharacterOfLineAndDown.__super__.getCount.apply(this, arguments) - 1;
    };

    return MoveToFirstCharacterOfLineAndDown;

  })(MoveToFirstCharacterOfLineDown);

  MoveToFirstLine = (function(superClass) {
    extend(MoveToFirstLine, superClass);

    function MoveToFirstLine() {
      return MoveToFirstLine.__super__.constructor.apply(this, arguments);
    }

    MoveToFirstLine.extend();

    MoveToFirstLine.prototype.wise = 'linewise';

    MoveToFirstLine.prototype.jump = true;

    MoveToFirstLine.prototype.verticalMotion = true;

    MoveToFirstLine.prototype.moveSuccessOnLinewise = true;

    MoveToFirstLine.prototype.moveCursor = function(cursor) {
      this.setCursorBufferRow(cursor, getValidVimBufferRow(this.editor, this.getRow()));
      return cursor.autoscroll({
        center: true
      });
    };

    MoveToFirstLine.prototype.getRow = function() {
      return this.getCount(-1);
    };

    return MoveToFirstLine;

  })(Motion);

  MoveToLastLine = (function(superClass) {
    extend(MoveToLastLine, superClass);

    function MoveToLastLine() {
      return MoveToLastLine.__super__.constructor.apply(this, arguments);
    }

    MoveToLastLine.extend();

    MoveToLastLine.prototype.defaultCount = 2e308;

    return MoveToLastLine;

  })(MoveToFirstLine);

  MoveToLineByPercent = (function(superClass) {
    extend(MoveToLineByPercent, superClass);

    function MoveToLineByPercent() {
      return MoveToLineByPercent.__super__.constructor.apply(this, arguments);
    }

    MoveToLineByPercent.extend();

    MoveToLineByPercent.prototype.getRow = function() {
      var percent;
      percent = limitNumber(this.getCount(), {
        max: 100
      });
      return Math.floor((this.editor.getLineCount() - 1) * (percent / 100));
    };

    return MoveToLineByPercent;

  })(MoveToFirstLine);

  MoveToRelativeLine = (function(superClass) {
    extend(MoveToRelativeLine, superClass);

    function MoveToRelativeLine() {
      return MoveToRelativeLine.__super__.constructor.apply(this, arguments);
    }

    MoveToRelativeLine.extend(false);

    MoveToRelativeLine.prototype.wise = 'linewise';

    MoveToRelativeLine.prototype.moveSuccessOnLinewise = true;

    MoveToRelativeLine.prototype.moveCursor = function(cursor) {
      return setBufferRow(cursor, cursor.getBufferRow() + this.getCount(-1));
    };

    return MoveToRelativeLine;

  })(Motion);

  MoveToRelativeLineMinimumOne = (function(superClass) {
    extend(MoveToRelativeLineMinimumOne, superClass);

    function MoveToRelativeLineMinimumOne() {
      return MoveToRelativeLineMinimumOne.__super__.constructor.apply(this, arguments);
    }

    MoveToRelativeLineMinimumOne.extend(false);

    MoveToRelativeLineMinimumOne.prototype.getCount = function() {
      return limitNumber(MoveToRelativeLineMinimumOne.__super__.getCount.apply(this, arguments), {
        min: 1
      });
    };

    return MoveToRelativeLineMinimumOne;

  })(MoveToRelativeLine);

  MoveToTopOfScreen = (function(superClass) {
    extend(MoveToTopOfScreen, superClass);

    function MoveToTopOfScreen() {
      return MoveToTopOfScreen.__super__.constructor.apply(this, arguments);
    }

    MoveToTopOfScreen.extend();

    MoveToTopOfScreen.prototype.wise = 'linewise';

    MoveToTopOfScreen.prototype.jump = true;

    MoveToTopOfScreen.prototype.scrolloff = 2;

    MoveToTopOfScreen.prototype.defaultCount = 0;

    MoveToTopOfScreen.prototype.verticalMotion = true;

    MoveToTopOfScreen.prototype.moveCursor = function(cursor) {
      var bufferRow;
      bufferRow = this.editor.bufferRowForScreenRow(this.getScreenRow());
      return this.setCursorBufferRow(cursor, bufferRow);
    };

    MoveToTopOfScreen.prototype.getScrolloff = function() {
      if (this.isAsTargetExceptSelect()) {
        return 0;
      } else {
        return this.scrolloff;
      }
    };

    MoveToTopOfScreen.prototype.getScreenRow = function() {
      var firstRow, offset;
      firstRow = getFirstVisibleScreenRow(this.editor);
      offset = this.getScrolloff();
      if (firstRow === 0) {
        offset = 0;
      }
      offset = limitNumber(this.getCount(-1), {
        min: offset
      });
      return firstRow + offset;
    };

    return MoveToTopOfScreen;

  })(Motion);

  MoveToMiddleOfScreen = (function(superClass) {
    extend(MoveToMiddleOfScreen, superClass);

    function MoveToMiddleOfScreen() {
      return MoveToMiddleOfScreen.__super__.constructor.apply(this, arguments);
    }

    MoveToMiddleOfScreen.extend();

    MoveToMiddleOfScreen.prototype.getScreenRow = function() {
      var endRow, startRow;
      startRow = getFirstVisibleScreenRow(this.editor);
      endRow = limitNumber(this.editor.getLastVisibleScreenRow(), {
        max: this.getVimLastScreenRow()
      });
      return startRow + Math.floor((endRow - startRow) / 2);
    };

    return MoveToMiddleOfScreen;

  })(MoveToTopOfScreen);

  MoveToBottomOfScreen = (function(superClass) {
    extend(MoveToBottomOfScreen, superClass);

    function MoveToBottomOfScreen() {
      return MoveToBottomOfScreen.__super__.constructor.apply(this, arguments);
    }

    MoveToBottomOfScreen.extend();

    MoveToBottomOfScreen.prototype.getScreenRow = function() {
      var offset, row, vimLastScreenRow;
      vimLastScreenRow = this.getVimLastScreenRow();
      row = limitNumber(this.editor.getLastVisibleScreenRow(), {
        max: vimLastScreenRow
      });
      offset = this.getScrolloff() + 1;
      if (row === vimLastScreenRow) {
        offset = 0;
      }
      offset = limitNumber(this.getCount(-1), {
        min: offset
      });
      return row - offset;
    };

    return MoveToBottomOfScreen;

  })(MoveToTopOfScreen);

  Scroll = (function(superClass) {
    extend(Scroll, superClass);

    function Scroll() {
      return Scroll.__super__.constructor.apply(this, arguments);
    }

    Scroll.extend(false);

    Scroll.prototype.verticalMotion = true;

    Scroll.prototype.isSmoothScrollEnabled = function() {
      if (Math.abs(this.amountOfPage) === 1) {
        return this.getConfig('smoothScrollOnFullScrollMotion');
      } else {
        return this.getConfig('smoothScrollOnHalfScrollMotion');
      }
    };

    Scroll.prototype.getSmoothScrollDuation = function() {
      if (Math.abs(this.amountOfPage) === 1) {
        return this.getConfig('smoothScrollOnFullScrollMotionDuration');
      } else {
        return this.getConfig('smoothScrollOnHalfScrollMotionDuration');
      }
    };

    Scroll.prototype.getPixelRectTopForSceenRow = function(row) {
      var point;
      point = new Point(row, 0);
      return this.editor.element.pixelRectForScreenRange(new Range(point, point)).top;
    };

    Scroll.prototype.smoothScroll = function(fromRow, toRow, options) {
      var topPixelFrom, topPixelTo;
      if (options == null) {
        options = {};
      }
      topPixelFrom = {
        top: this.getPixelRectTopForSceenRow(fromRow)
      };
      topPixelTo = {
        top: this.getPixelRectTopForSceenRow(toRow)
      };
      options.step = (function(_this) {
        return function(newTop) {
          return _this.editor.element.setScrollTop(newTop);
        };
      })(this);
      options.duration = this.getSmoothScrollDuation();
      return this.vimState.requestScrollAnimation(topPixelFrom, topPixelTo, options);
    };

    Scroll.prototype.getAmountOfRows = function() {
      return Math.ceil(this.amountOfPage * this.editor.getRowsPerPage() * this.getCount());
    };

    Scroll.prototype.getBufferRow = function(cursor) {
      var screenRow;
      screenRow = getValidVimScreenRow(this.editor, cursor.getScreenRow() + this.getAmountOfRows());
      return this.editor.bufferRowForScreenRow(screenRow);
    };

    Scroll.prototype.moveCursor = function(cursor) {
      var bufferRow, done, firstVisibileScreenRow, newFirstVisibileBufferRow, newFirstVisibileScreenRow;
      bufferRow = this.getBufferRow(cursor);
      this.setCursorBufferRow(cursor, this.getBufferRow(cursor), {
        autoscroll: false
      });
      if (cursor.isLastCursor()) {
        if (this.isSmoothScrollEnabled()) {
          this.vimState.finishScrollAnimation();
        }
        firstVisibileScreenRow = this.editor.getFirstVisibleScreenRow();
        newFirstVisibileBufferRow = this.editor.bufferRowForScreenRow(firstVisibileScreenRow + this.getAmountOfRows());
        newFirstVisibileScreenRow = this.editor.screenRowForBufferRow(newFirstVisibileBufferRow);
        done = (function(_this) {
          return function() {
            _this.editor.setFirstVisibleScreenRow(newFirstVisibileScreenRow);
            return _this.editor.element.component.updateSync();
          };
        })(this);
        if (this.isSmoothScrollEnabled()) {
          return this.smoothScroll(firstVisibileScreenRow, newFirstVisibileScreenRow, {
            done: done
          });
        } else {
          return done();
        }
      }
    };

    return Scroll;

  })(Motion);

  ScrollFullScreenDown = (function(superClass) {
    extend(ScrollFullScreenDown, superClass);

    function ScrollFullScreenDown() {
      return ScrollFullScreenDown.__super__.constructor.apply(this, arguments);
    }

    ScrollFullScreenDown.extend(true);

    ScrollFullScreenDown.prototype.amountOfPage = +1;

    return ScrollFullScreenDown;

  })(Scroll);

  ScrollFullScreenUp = (function(superClass) {
    extend(ScrollFullScreenUp, superClass);

    function ScrollFullScreenUp() {
      return ScrollFullScreenUp.__super__.constructor.apply(this, arguments);
    }

    ScrollFullScreenUp.extend();

    ScrollFullScreenUp.prototype.amountOfPage = -1;

    return ScrollFullScreenUp;

  })(Scroll);

  ScrollHalfScreenDown = (function(superClass) {
    extend(ScrollHalfScreenDown, superClass);

    function ScrollHalfScreenDown() {
      return ScrollHalfScreenDown.__super__.constructor.apply(this, arguments);
    }

    ScrollHalfScreenDown.extend();

    ScrollHalfScreenDown.prototype.amountOfPage = +1 / 2;

    return ScrollHalfScreenDown;

  })(Scroll);

  ScrollHalfScreenUp = (function(superClass) {
    extend(ScrollHalfScreenUp, superClass);

    function ScrollHalfScreenUp() {
      return ScrollHalfScreenUp.__super__.constructor.apply(this, arguments);
    }

    ScrollHalfScreenUp.extend();

    ScrollHalfScreenUp.prototype.amountOfPage = -1 / 2;

    return ScrollHalfScreenUp;

  })(Scroll);

  Find = (function(superClass) {
    extend(Find, superClass);

    function Find() {
      return Find.__super__.constructor.apply(this, arguments);
    }

    Find.extend();

    Find.prototype.backwards = false;

    Find.prototype.inclusive = true;

    Find.prototype.offset = 0;

    Find.prototype.requireInput = true;

    Find.prototype.initialize = function() {
      Find.__super__.initialize.apply(this, arguments);
      if (!this.isComplete()) {
        return this.focusInput();
      }
    };

    Find.prototype.isBackwards = function() {
      return this.backwards;
    };

    Find.prototype.getPoint = function(fromPoint) {
      var end, method, offset, points, ref2, ref3, scanRange, start, unOffset;
      ref2 = this.editor.bufferRangeForBufferRow(fromPoint.row), start = ref2.start, end = ref2.end;
      offset = this.isBackwards() ? this.offset : -this.offset;
      unOffset = -offset * this.isRepeated();
      if (this.isBackwards()) {
        scanRange = [start, fromPoint.translate([0, unOffset])];
        method = 'backwardsScanInBufferRange';
      } else {
        scanRange = [fromPoint.translate([0, 1 + unOffset]), end];
        method = 'scanInBufferRange';
      }
      points = [];
      this.editor[method](RegExp("" + (_.escapeRegExp(this.input)), "g"), scanRange, function(arg) {
        var range;
        range = arg.range;
        return points.push(range.start);
      });
      return (ref3 = points[this.getCount(-1)]) != null ? ref3.translate([0, offset]) : void 0;
    };

    Find.prototype.moveCursor = function(cursor) {
      var point;
      point = this.getPoint(cursor.getBufferPosition());
      this.setBufferPositionSafely(cursor, point);
      if (!this.isRepeated()) {
        return this.globalState.set('currentFind', this);
      }
    };

    return Find;

  })(Motion);

  FindBackwards = (function(superClass) {
    extend(FindBackwards, superClass);

    function FindBackwards() {
      return FindBackwards.__super__.constructor.apply(this, arguments);
    }

    FindBackwards.extend();

    FindBackwards.prototype.inclusive = false;

    FindBackwards.prototype.backwards = true;

    return FindBackwards;

  })(Find);

  Till = (function(superClass) {
    extend(Till, superClass);

    function Till() {
      return Till.__super__.constructor.apply(this, arguments);
    }

    Till.extend();

    Till.prototype.offset = 1;

    Till.prototype.getPoint = function() {
      this.point = Till.__super__.getPoint.apply(this, arguments);
      this.moveSucceeded = this.point != null;
      return this.point;
    };

    return Till;

  })(Find);

  TillBackwards = (function(superClass) {
    extend(TillBackwards, superClass);

    function TillBackwards() {
      return TillBackwards.__super__.constructor.apply(this, arguments);
    }

    TillBackwards.extend();

    TillBackwards.prototype.inclusive = false;

    TillBackwards.prototype.backwards = true;

    return TillBackwards;

  })(Till);

  MoveToMark = (function(superClass) {
    extend(MoveToMark, superClass);

    function MoveToMark() {
      return MoveToMark.__super__.constructor.apply(this, arguments);
    }

    MoveToMark.extend();

    MoveToMark.prototype.jump = true;

    MoveToMark.prototype.requireInput = true;

    MoveToMark.prototype.input = null;

    MoveToMark.prototype.initialize = function() {
      MoveToMark.__super__.initialize.apply(this, arguments);
      if (!this.isComplete()) {
        return this.focusInput();
      }
    };

    MoveToMark.prototype.getPoint = function() {
      return this.vimState.mark.get(this.getInput());
    };

    MoveToMark.prototype.moveCursor = function(cursor) {
      var point;
      if (point = this.getPoint()) {
        cursor.setBufferPosition(point);
        return cursor.autoscroll({
          center: true
        });
      }
    };

    return MoveToMark;

  })(Motion);

  MoveToMarkLine = (function(superClass) {
    extend(MoveToMarkLine, superClass);

    function MoveToMarkLine() {
      return MoveToMarkLine.__super__.constructor.apply(this, arguments);
    }

    MoveToMarkLine.extend();

    MoveToMarkLine.prototype.wise = 'linewise';

    MoveToMarkLine.prototype.getPoint = function() {
      var point;
      if (point = MoveToMarkLine.__super__.getPoint.apply(this, arguments)) {
        return this.getFirstCharacterPositionForBufferRow(point.row);
      }
    };

    return MoveToMarkLine;

  })(MoveToMark);

  MoveToPreviousFoldStart = (function(superClass) {
    extend(MoveToPreviousFoldStart, superClass);

    function MoveToPreviousFoldStart() {
      return MoveToPreviousFoldStart.__super__.constructor.apply(this, arguments);
    }

    MoveToPreviousFoldStart.extend();

    MoveToPreviousFoldStart.description = "Move to previous fold start";

    MoveToPreviousFoldStart.prototype.wise = 'characterwise';

    MoveToPreviousFoldStart.prototype.which = 'start';

    MoveToPreviousFoldStart.prototype.direction = 'prev';

    MoveToPreviousFoldStart.prototype.initialize = function() {
      MoveToPreviousFoldStart.__super__.initialize.apply(this, arguments);
      this.rows = this.getFoldRows(this.which);
      if (this.direction === 'prev') {
        return this.rows.reverse();
      }
    };

    MoveToPreviousFoldStart.prototype.getFoldRows = function(which) {
      var index, rows;
      index = which === 'start' ? 0 : 1;
      rows = getCodeFoldRowRanges(this.editor).map(function(rowRange) {
        return rowRange[index];
      });
      return _.sortBy(_.uniq(rows), function(row) {
        return row;
      });
    };

    MoveToPreviousFoldStart.prototype.getScanRows = function(cursor) {
      var cursorRow, isValidRow;
      cursorRow = cursor.getBufferRow();
      isValidRow = (function() {
        switch (this.direction) {
          case 'prev':
            return function(row) {
              return row < cursorRow;
            };
          case 'next':
            return function(row) {
              return row > cursorRow;
            };
        }
      }).call(this);
      return this.rows.filter(isValidRow);
    };

    MoveToPreviousFoldStart.prototype.detectRow = function(cursor) {
      return this.getScanRows(cursor)[0];
    };

    MoveToPreviousFoldStart.prototype.moveCursor = function(cursor) {
      return this.moveCursorCountTimes(cursor, (function(_this) {
        return function() {
          var row;
          if ((row = _this.detectRow(cursor)) != null) {
            return moveCursorToFirstCharacterAtRow(cursor, row);
          }
        };
      })(this));
    };

    return MoveToPreviousFoldStart;

  })(Motion);

  MoveToNextFoldStart = (function(superClass) {
    extend(MoveToNextFoldStart, superClass);

    function MoveToNextFoldStart() {
      return MoveToNextFoldStart.__super__.constructor.apply(this, arguments);
    }

    MoveToNextFoldStart.extend();

    MoveToNextFoldStart.description = "Move to next fold start";

    MoveToNextFoldStart.prototype.direction = 'next';

    return MoveToNextFoldStart;

  })(MoveToPreviousFoldStart);

  MoveToPreviousFoldStartWithSameIndent = (function(superClass) {
    extend(MoveToPreviousFoldStartWithSameIndent, superClass);

    function MoveToPreviousFoldStartWithSameIndent() {
      return MoveToPreviousFoldStartWithSameIndent.__super__.constructor.apply(this, arguments);
    }

    MoveToPreviousFoldStartWithSameIndent.extend();

    MoveToPreviousFoldStartWithSameIndent.description = "Move to previous same-indented fold start";

    MoveToPreviousFoldStartWithSameIndent.prototype.detectRow = function(cursor) {
      var baseIndentLevel, j, len, ref2, row;
      baseIndentLevel = this.getIndentLevelForBufferRow(cursor.getBufferRow());
      ref2 = this.getScanRows(cursor);
      for (j = 0, len = ref2.length; j < len; j++) {
        row = ref2[j];
        if (this.getIndentLevelForBufferRow(row) === baseIndentLevel) {
          return row;
        }
      }
      return null;
    };

    return MoveToPreviousFoldStartWithSameIndent;

  })(MoveToPreviousFoldStart);

  MoveToNextFoldStartWithSameIndent = (function(superClass) {
    extend(MoveToNextFoldStartWithSameIndent, superClass);

    function MoveToNextFoldStartWithSameIndent() {
      return MoveToNextFoldStartWithSameIndent.__super__.constructor.apply(this, arguments);
    }

    MoveToNextFoldStartWithSameIndent.extend();

    MoveToNextFoldStartWithSameIndent.description = "Move to next same-indented fold start";

    MoveToNextFoldStartWithSameIndent.prototype.direction = 'next';

    return MoveToNextFoldStartWithSameIndent;

  })(MoveToPreviousFoldStartWithSameIndent);

  MoveToPreviousFoldEnd = (function(superClass) {
    extend(MoveToPreviousFoldEnd, superClass);

    function MoveToPreviousFoldEnd() {
      return MoveToPreviousFoldEnd.__super__.constructor.apply(this, arguments);
    }

    MoveToPreviousFoldEnd.extend();

    MoveToPreviousFoldEnd.description = "Move to previous fold end";

    MoveToPreviousFoldEnd.prototype.which = 'end';

    return MoveToPreviousFoldEnd;

  })(MoveToPreviousFoldStart);

  MoveToNextFoldEnd = (function(superClass) {
    extend(MoveToNextFoldEnd, superClass);

    function MoveToNextFoldEnd() {
      return MoveToNextFoldEnd.__super__.constructor.apply(this, arguments);
    }

    MoveToNextFoldEnd.extend();

    MoveToNextFoldEnd.description = "Move to next fold end";

    MoveToNextFoldEnd.prototype.direction = 'next';

    return MoveToNextFoldEnd;

  })(MoveToPreviousFoldEnd);

  MoveToPreviousFunction = (function(superClass) {
    extend(MoveToPreviousFunction, superClass);

    function MoveToPreviousFunction() {
      return MoveToPreviousFunction.__super__.constructor.apply(this, arguments);
    }

    MoveToPreviousFunction.extend();

    MoveToPreviousFunction.description = "Move to previous function";

    MoveToPreviousFunction.prototype.direction = 'prev';

    MoveToPreviousFunction.prototype.detectRow = function(cursor) {
      return _.detect(this.getScanRows(cursor), (function(_this) {
        return function(row) {
          return isIncludeFunctionScopeForRow(_this.editor, row);
        };
      })(this));
    };

    return MoveToPreviousFunction;

  })(MoveToPreviousFoldStart);

  MoveToNextFunction = (function(superClass) {
    extend(MoveToNextFunction, superClass);

    function MoveToNextFunction() {
      return MoveToNextFunction.__super__.constructor.apply(this, arguments);
    }

    MoveToNextFunction.extend();

    MoveToNextFunction.description = "Move to next function";

    MoveToNextFunction.prototype.direction = 'next';

    return MoveToNextFunction;

  })(MoveToPreviousFunction);

  MoveToPositionByScope = (function(superClass) {
    extend(MoveToPositionByScope, superClass);

    function MoveToPositionByScope() {
      return MoveToPositionByScope.__super__.constructor.apply(this, arguments);
    }

    MoveToPositionByScope.extend(false);

    MoveToPositionByScope.prototype.direction = 'backward';

    MoveToPositionByScope.prototype.scope = '.';

    MoveToPositionByScope.prototype.getPoint = function(fromPoint) {
      return detectScopeStartPositionForScope(this.editor, fromPoint, this.direction, this.scope);
    };

    MoveToPositionByScope.prototype.moveCursor = function(cursor) {
      return this.moveCursorCountTimes(cursor, (function(_this) {
        return function() {
          return _this.setBufferPositionSafely(cursor, _this.getPoint(cursor.getBufferPosition()));
        };
      })(this));
    };

    return MoveToPositionByScope;

  })(Motion);

  MoveToPreviousString = (function(superClass) {
    extend(MoveToPreviousString, superClass);

    function MoveToPreviousString() {
      return MoveToPreviousString.__super__.constructor.apply(this, arguments);
    }

    MoveToPreviousString.extend();

    MoveToPreviousString.description = "Move to previous string(searched by `string.begin` scope)";

    MoveToPreviousString.prototype.direction = 'backward';

    MoveToPreviousString.prototype.scope = 'string.begin';

    return MoveToPreviousString;

  })(MoveToPositionByScope);

  MoveToNextString = (function(superClass) {
    extend(MoveToNextString, superClass);

    function MoveToNextString() {
      return MoveToNextString.__super__.constructor.apply(this, arguments);
    }

    MoveToNextString.extend();

    MoveToNextString.description = "Move to next string(searched by `string.begin` scope)";

    MoveToNextString.prototype.direction = 'forward';

    return MoveToNextString;

  })(MoveToPreviousString);

  MoveToPreviousNumber = (function(superClass) {
    extend(MoveToPreviousNumber, superClass);

    function MoveToPreviousNumber() {
      return MoveToPreviousNumber.__super__.constructor.apply(this, arguments);
    }

    MoveToPreviousNumber.extend();

    MoveToPreviousNumber.prototype.direction = 'backward';

    MoveToPreviousNumber.description = "Move to previous number(searched by `constant.numeric` scope)";

    MoveToPreviousNumber.prototype.scope = 'constant.numeric';

    return MoveToPreviousNumber;

  })(MoveToPositionByScope);

  MoveToNextNumber = (function(superClass) {
    extend(MoveToNextNumber, superClass);

    function MoveToNextNumber() {
      return MoveToNextNumber.__super__.constructor.apply(this, arguments);
    }

    MoveToNextNumber.extend();

    MoveToNextNumber.description = "Move to next number(searched by `constant.numeric` scope)";

    MoveToNextNumber.prototype.direction = 'forward';

    return MoveToNextNumber;

  })(MoveToPreviousNumber);

  MoveToNextOccurrence = (function(superClass) {
    extend(MoveToNextOccurrence, superClass);

    function MoveToNextOccurrence() {
      return MoveToNextOccurrence.__super__.constructor.apply(this, arguments);
    }

    MoveToNextOccurrence.extend();

    MoveToNextOccurrence.commandScope = 'atom-text-editor.vim-mode-plus.has-occurrence';

    MoveToNextOccurrence.prototype.jump = true;

    MoveToNextOccurrence.prototype.direction = 'next';

    MoveToNextOccurrence.prototype.getRanges = function() {
      return this.vimState.occurrenceManager.getMarkers().map(function(marker) {
        return marker.getBufferRange();
      });
    };

    MoveToNextOccurrence.prototype.execute = function() {
      this.ranges = this.getRanges();
      return MoveToNextOccurrence.__super__.execute.apply(this, arguments);
    };

    MoveToNextOccurrence.prototype.moveCursor = function(cursor) {
      var index, offset, point, range;
      index = this.getIndex(cursor.getBufferPosition());
      if (index != null) {
        offset = (function() {
          switch (this.direction) {
            case 'next':
              return this.getCount(-1);
            case 'previous':
              return -this.getCount(-1);
          }
        }).call(this);
        range = this.ranges[getIndex(index + offset, this.ranges)];
        point = range.start;
        cursor.setBufferPosition(point, {
          autoscroll: false
        });
        if (cursor.isLastCursor()) {
          this.editor.unfoldBufferRow(point.row);
          smartScrollToBufferPosition(this.editor, point);
        }
        if (this.getConfig('flashOnMoveToOccurrence')) {
          return this.vimState.flash(range, {
            type: 'search'
          });
        }
      }
    };

    MoveToNextOccurrence.prototype.getIndex = function(fromPoint) {
      var i, j, len, range, ref2;
      ref2 = this.ranges;
      for (i = j = 0, len = ref2.length; j < len; i = ++j) {
        range = ref2[i];
        if (range.start.isGreaterThan(fromPoint)) {
          return i;
        }
      }
      return 0;
    };

    return MoveToNextOccurrence;

  })(Motion);

  MoveToPreviousOccurrence = (function(superClass) {
    extend(MoveToPreviousOccurrence, superClass);

    function MoveToPreviousOccurrence() {
      return MoveToPreviousOccurrence.__super__.constructor.apply(this, arguments);
    }

    MoveToPreviousOccurrence.extend();

    MoveToPreviousOccurrence.prototype.direction = 'previous';

    MoveToPreviousOccurrence.prototype.getIndex = function(fromPoint) {
      var i, j, range, ref2;
      ref2 = this.ranges;
      for (i = j = ref2.length - 1; j >= 0; i = j += -1) {
        range = ref2[i];
        if (range.end.isLessThan(fromPoint)) {
          return i;
        }
      }
      return this.ranges.length - 1;
    };

    return MoveToPreviousOccurrence;

  })(MoveToNextOccurrence);

  MoveToPair = (function(superClass) {
    extend(MoveToPair, superClass);

    function MoveToPair() {
      return MoveToPair.__super__.constructor.apply(this, arguments);
    }

    MoveToPair.extend();

    MoveToPair.prototype.inclusive = true;

    MoveToPair.prototype.jump = true;

    MoveToPair.prototype.member = ['Parenthesis', 'CurlyBracket', 'SquareBracket', 'AngleBracket'];

    MoveToPair.prototype.moveCursor = function(cursor) {
      return this.setBufferPositionSafely(cursor, this.getPoint(cursor));
    };

    MoveToPair.prototype.getPointForTag = function(point) {
      var closeRange, openRange, pairInfo;
      pairInfo = this["new"]("ATag").getPairInfo(point);
      if (pairInfo == null) {
        return null;
      }
      openRange = pairInfo.openRange, closeRange = pairInfo.closeRange;
      openRange = openRange.translate([0, +1], [0, -1]);
      closeRange = closeRange.translate([0, +1], [0, -1]);
      if (openRange.containsPoint(point) && (!point.isEqual(openRange.end))) {
        return closeRange.start;
      }
      if (closeRange.containsPoint(point) && (!point.isEqual(closeRange.end))) {
        return openRange.start;
      }
    };

    MoveToPair.prototype.getPoint = function(cursor) {
      var cursorPosition, cursorRow, end, point, range, start;
      cursorPosition = cursor.getBufferPosition();
      cursorRow = cursorPosition.row;
      if (point = this.getPointForTag(cursorPosition)) {
        return point;
      }
      range = this["new"]("AAnyPairAllowForwarding", {
        member: this.member
      }).getRange(cursor.selection);
      if (range == null) {
        return null;
      }
      start = range.start, end = range.end;
      if ((start.row === cursorRow) && start.isGreaterThanOrEqual(cursorPosition)) {
        return end.translate([0, -1]);
      } else if (end.row === cursorPosition.row) {
        return start;
      }
    };

    return MoveToPair;

  })(Motion);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvbW90aW9uLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsKzFFQUFBO0lBQUE7OztFQUFBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVI7O0VBQ0osTUFBaUIsT0FBQSxDQUFRLE1BQVIsQ0FBakIsRUFBQyxpQkFBRCxFQUFROztFQUVSLE9BNEJJLE9BQUEsQ0FBUSxTQUFSLENBNUJKLEVBQ0Usb0NBREYsRUFDa0Isc0NBRGxCLEVBRUUsNENBRkYsRUFFc0IsZ0RBRnRCLEVBR0UsZ0RBSEYsRUFJRSw0Q0FKRixFQUtFLG9EQUxGLEVBTUUsd0RBTkYsRUFNNEIsc0RBTjVCLEVBT0UsZ0RBUEYsRUFPd0IsZ0RBUHhCLEVBUUUsc0VBUkYsRUFTRSw0QkFURixFQVVFLDhDQVZGLEVBV0Usa0VBWEYsRUFZRSw0QkFaRixFQWFFLGdEQWJGLEVBY0UsZ0ZBZEYsRUFlRSxnRUFmRixFQWdCRSx3RUFoQkYsRUFpQkUsa0NBakJGLEVBa0JFLGdEQWxCRixFQW1CRSx3RUFuQkYsRUFvQkUsZ0NBcEJGLEVBcUJFLHNDQXJCRixFQXNCRSw4QkF0QkYsRUF1QkUsd0JBdkJGLEVBd0JFLDhEQXhCRixFQXlCRSxzRUF6QkYsRUEwQkUsd0RBMUJGLEVBMkJFOztFQUdGLEtBQUEsR0FBUSxPQUFBLENBQVEscUJBQVI7O0VBQ1IsSUFBQSxHQUFPLE9BQUEsQ0FBUSxRQUFSOztFQUVEOzs7SUFDSixNQUFDLENBQUEsTUFBRCxDQUFRLEtBQVI7O3FCQUNBLFNBQUEsR0FBVzs7cUJBQ1gsSUFBQSxHQUFNOztxQkFDTixJQUFBLEdBQU07O3FCQUNOLGNBQUEsR0FBZ0I7O3FCQUNoQixhQUFBLEdBQWU7O3FCQUNmLHFCQUFBLEdBQXVCOztJQUVWLGdCQUFBO01BQ1gseUNBQUEsU0FBQTtNQUVBLElBQUcs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LENBQUMsT0FBTixDQUFjLFVBQVUsQ0FBQyxHQUF6QixDQUFMLENBQTlEO0FBQUEsZUFBTyxTQUFTLENBQUMsTUFBakI7O0lBUGM7O3lCQVNoQixRQUFBLEdBQVUsU0FBQyxNQUFEO0FBQ1IsVUFBQTtNQUFBLGNBQUEsR0FBaUIsTUFBTSxDQUFDLGlCQUFQLENBQUE7TUFDakIsU0FBQSxHQUFZLGNBQWMsQ0FBQztNQUMzQixJQUFnQixLQUFBLEdBQVEsSUFBQyxDQUFBLGNBQUQsQ0FBZ0IsY0FBaEIsQ0FBeEI7QUFBQSxlQUFPLE1BQVA7O01BR0EsS0FBQSxHQUFRLElBQUMsRUFBQSxHQUFBLEVBQUQsQ0FBSyx5QkFBTCxFQUFnQztRQUFFLFFBQUQsSUFBQyxDQUFBLE1BQUY7T0FBaEMsQ0FBMEMsQ0FBQyxRQUEzQyxDQUFvRCxNQUFNLENBQUMsU0FBM0Q7TUFDUixJQUFtQixhQUFuQjtBQUFBLGVBQU8sS0FBUDs7TUFDQyxtQkFBRCxFQUFRO01BQ1IsSUFBRyxDQUFDLEtBQUssQ0FBQyxHQUFOLEtBQWEsU0FBZCxDQUFBLElBQTZCLEtBQUssQ0FBQyxvQkFBTixDQUEyQixjQUEzQixDQUFoQztlQUVFLEdBQUcsQ0FBQyxTQUFKLENBQWMsQ0FBQyxDQUFELEVBQUksQ0FBQyxDQUFMLENBQWQsRUFGRjtPQUFBLE1BR0ssSUFBRyxHQUFHLENBQUMsR0FBSixLQUFXLGNBQWMsQ0FBQyxHQUE3QjtlQUdILE1BSEc7O0lBWkc7Ozs7S0FsQmE7QUF6a0N6QiIsInNvdXJjZXNDb250ZW50IjpbIl8gPSByZXF1aXJlICd1bmRlcnNjb3JlLXBsdXMnXG57UG9pbnQsIFJhbmdlfSA9IHJlcXVpcmUgJ2F0b20nXG5cbntcbiAgbW92ZUN1cnNvckxlZnQsIG1vdmVDdXJzb3JSaWdodFxuICBtb3ZlQ3Vyc29yVXBTY3JlZW4sIG1vdmVDdXJzb3JEb3duU2NyZWVuXG4gIG1vdmVDdXJzb3JEb3duQnVmZmVyXG4gIG1vdmVDdXJzb3JVcEJ1ZmZlclxuICBjdXJzb3JJc0F0VmltRW5kT2ZGaWxlXG4gIGdldEZpcnN0VmlzaWJsZVNjcmVlblJvdywgZ2V0TGFzdFZpc2libGVTY3JlZW5Sb3dcbiAgZ2V0VmFsaWRWaW1TY3JlZW5Sb3csIGdldFZhbGlkVmltQnVmZmVyUm93XG4gIG1vdmVDdXJzb3JUb0ZpcnN0Q2hhcmFjdGVyQXRSb3dcbiAgc29ydFJhbmdlc1xuICBwb2ludElzT25XaGl0ZVNwYWNlXG4gIG1vdmVDdXJzb3JUb05leHROb25XaGl0ZXNwYWNlXG4gIGlzRW1wdHlSb3dcbiAgZ2V0Q29kZUZvbGRSb3dSYW5nZXNcbiAgZ2V0TGFyZ2VzdEZvbGRSYW5nZUNvbnRhaW5zQnVmZmVyUm93XG4gIGlzSW5jbHVkZUZ1bmN0aW9uU2NvcGVGb3JSb3dcbiAgZGV0ZWN0U2NvcGVTdGFydFBvc2l0aW9uRm9yU2NvcGVcbiAgZ2V0QnVmZmVyUm93c1xuICBnZXRUZXh0SW5TY3JlZW5SYW5nZVxuICBjdXJzb3JJc0F0RW5kT2ZMaW5lQXROb25FbXB0eVJvd1xuICBzZXRCdWZmZXJSb3dcbiAgc2V0QnVmZmVyQ29sdW1uXG4gIGxpbWl0TnVtYmVyXG4gIGdldEluZGV4XG4gIHNtYXJ0U2Nyb2xsVG9CdWZmZXJQb3NpdGlvblxuICBwb2ludElzQXRFbmRPZkxpbmVBdE5vbkVtcHR5Um93XG4gIGdldEVuZE9mTGluZUZvckJ1ZmZlclJvd1xuICBmaW5kUmFuZ2VJbkJ1ZmZlclJvd1xufSA9IHJlcXVpcmUgJy4vdXRpbHMnXG5cbnN3cmFwID0gcmVxdWlyZSAnLi9zZWxlY3Rpb24td3JhcHBlcidcbkJhc2UgPSByZXF1aXJlICcuL2Jhc2UnXG5cbmNsYXNzIE1vdGlvbiBleHRlbmRzIEJhc2VcbiAgQGV4dGVuZChmYWxzZSlcbiAgaW5jbHVzaXZlOiBmYWxzZVxuICB3aXNlOiAnY2hhcmFjdGVyd2lzZSdcbiAganVtcDogZmFsc2VcbiAgdmVydGljYWxNb3Rpb246IGZhbHNlXG4gIG1vdmVTdWNjZWVkZWQ6IG51bGxcbiAgbW92ZVN1Y2Nlc3NPbkxpbmV3aXNlOiBmYWxzZVxuXG4gIGNvbnN0cnVjdG9yOiAtPlxuICAgIHN1cGVyXG5cbiAgICBpZiBAbW9kZSBpcyAndmlzdWFsJ1xuICAgICAgQHdpc2UgPSBAc3VibW9kZVxuICAgIEBpbml0aWFsaXplKClcblxuICBpc0xpbmV3aXNlOiAtPiBAd2lzZSBpcyAnbGluZXdpc2UnXG4gIGlzQmxvY2t3aXNlOiAtPiBAd2lzZSBpcyAnYmxvY2t3aXNlJ1xuXG4gIGZvcmNlV2lzZTogKHdpc2UpIC0+XG4gICAgaWYgd2lzZSBpcyAnY2hhcmFjdGVyd2lzZSdcbiAgICAgIGlmIEB3aXNlIGlzICdsaW5ld2lzZSdcbiAgICAgICAgQGluY2x1c2l2ZSA9IGZhbHNlXG4gICAgICBlbHNlXG4gICAgICAgIEBpbmNsdXNpdmUgPSBub3QgQGluY2x1c2l2ZVxuICAgIEB3aXNlID0gd2lzZVxuXG4gIHNldEJ1ZmZlclBvc2l0aW9uU2FmZWx5OiAoY3Vyc29yLCBwb2ludCkgLT5cbiAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24ocG9pbnQpIGlmIHBvaW50P1xuXG4gIHNldFNjcmVlblBvc2l0aW9uU2FmZWx5OiAoY3Vyc29yLCBwb2ludCkgLT5cbiAgICBjdXJzb3Iuc2V0U2NyZWVuUG9zaXRpb24ocG9pbnQpIGlmIHBvaW50P1xuXG4gIG1vdmVXaXRoU2F2ZUp1bXA6IChjdXJzb3IpIC0+XG4gICAgaWYgY3Vyc29yLmlzTGFzdEN1cnNvcigpIGFuZCBAanVtcFxuICAgICAgY3Vyc29yUG9zaXRpb24gPSBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuXG4gICAgQG1vdmVDdXJzb3IoY3Vyc29yKVxuXG4gICAgaWYgY3Vyc29yUG9zaXRpb24/IGFuZCBub3QgY3Vyc29yUG9zaXRpb24uaXNFcXVhbChjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKSlcbiAgICAgIEB2aW1TdGF0ZS5tYXJrLnNldCgnYCcsIGN1cnNvclBvc2l0aW9uKVxuICAgICAgQHZpbVN0YXRlLm1hcmsuc2V0KFwiJ1wiLCBjdXJzb3JQb3NpdGlvbilcblxuICBleGVjdXRlOiAtPlxuICAgIGlmIEBvcGVyYXRvcj9cbiAgICAgIEBzZWxlY3QoKVxuICAgIGVsc2VcbiAgICAgIEBtb3ZlV2l0aFNhdmVKdW1wKGN1cnNvcikgZm9yIGN1cnNvciBpbiBAZWRpdG9yLmdldEN1cnNvcnMoKVxuICAgIEBlZGl0b3IubWVyZ2VDdXJzb3JzKClcbiAgICBAZWRpdG9yLm1lcmdlSW50ZXJzZWN0aW5nU2VsZWN0aW9ucygpXG5cbiAgIyBOT1RFOiBNb2RpZnkgc2VsZWN0aW9uIGJ5IG1vZHRpb24sIHNlbGVjdGlvbiBpcyBhbHJlYWR5IFwibm9ybWFsaXplZFwiIGJlZm9yZSB0aGlzIGZ1bmN0aW9uIGlzIGNhbGxlZC5cbiAgc2VsZWN0OiAtPlxuICAgIGlzT3JXYXNWaXN1YWwgPSBAbW9kZSBpcyAndmlzdWFsJyBvciBAaXMoJ0N1cnJlbnRTZWxlY3Rpb24nKSAjIG5lZWQgdG8gY2FyZSB3YXMgdmlzdWFsIGZvciBgLmAgcmVwZWF0ZWQuXG4gICAgZm9yIHNlbGVjdGlvbiBpbiBAZWRpdG9yLmdldFNlbGVjdGlvbnMoKVxuICAgICAgc2VsZWN0aW9uLm1vZGlmeVNlbGVjdGlvbiA9PlxuICAgICAgICBAbW92ZVdpdGhTYXZlSnVtcChzZWxlY3Rpb24uY3Vyc29yKVxuXG4gICAgICBzdWNjZWVkZWQgPSBAbW92ZVN1Y2NlZWRlZCA/IG5vdCBzZWxlY3Rpb24uaXNFbXB0eSgpIG9yIChAbW92ZVN1Y2Nlc3NPbkxpbmV3aXNlIGFuZCBAaXNMaW5ld2lzZSgpKVxuICAgICAgaWYgaXNPcldhc1Zpc3VhbCBvciAoc3VjY2VlZGVkIGFuZCAoQGluY2x1c2l2ZSBvciBAaXNMaW5ld2lzZSgpKSlcbiAgICAgICAgJHNlbGVjdGlvbiA9IHN3cmFwKHNlbGVjdGlvbilcbiAgICAgICAgJHNlbGVjdGlvbi5zYXZlUHJvcGVydGllcyh0cnVlKSAjIHNhdmUgcHJvcGVydHkgb2YgXCJhbHJlYWR5LW5vcm1hbGl6ZWQtc2VsZWN0aW9uXCJcbiAgICAgICAgJHNlbGVjdGlvbi5hcHBseVdpc2UoQHdpc2UpXG5cbiAgICBAdmltU3RhdGUuZ2V0TGFzdEJsb2Nrd2lzZVNlbGVjdGlvbigpLmF1dG9zY3JvbGwoKSBpZiBAd2lzZSBpcyAnYmxvY2t3aXNlJ1xuXG4gIHNldEN1cnNvckJ1ZmZlclJvdzogKGN1cnNvciwgcm93LCBvcHRpb25zKSAtPlxuICAgIGlmIEB2ZXJ0aWNhbE1vdGlvbiBhbmQgQGdldENvbmZpZygnbW92ZVRvRmlyc3RDaGFyYWN0ZXJPblZlcnRpY2FsTW90aW9uJylcbiAgICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihAZ2V0Rmlyc3RDaGFyYWN0ZXJQb3NpdGlvbkZvckJ1ZmZlclJvdyhyb3cpLCBvcHRpb25zKVxuICAgIGVsc2VcbiAgICAgIHNldEJ1ZmZlclJvdyhjdXJzb3IsIHJvdywgb3B0aW9ucylcblxuICAjIFtOT1RFXVxuICAjIFNpbmNlIHRoaXMgZnVuY3Rpb24gY2hlY2tzIGN1cnNvciBwb3NpdGlvbiBjaGFuZ2UsIGEgY3Vyc29yIHBvc2l0aW9uIE1VU1QgYmVcbiAgIyB1cGRhdGVkIElOIGNhbGxiYWNrKD1mbilcbiAgIyBVcGRhdGluZyBwb2ludCBvbmx5IGluIGNhbGxiYWNrIGlzIHdyb25nLXVzZSBvZiB0aGlzIGZ1bmNpdG9uLFxuICAjIHNpbmNlIGl0IHN0b3BzIGltbWVkaWF0ZWx5IGJlY2F1c2Ugb2Ygbm90IGN1cnNvciBwb3NpdGlvbiBjaGFuZ2UuXG4gIG1vdmVDdXJzb3JDb3VudFRpbWVzOiAoY3Vyc29yLCBmbikgLT5cbiAgICBvbGRQb3NpdGlvbiA9IGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXG4gICAgQGNvdW50VGltZXMgQGdldENvdW50KCksIChzdGF0ZSkgLT5cbiAgICAgIGZuKHN0YXRlKVxuICAgICAgaWYgKG5ld1Bvc2l0aW9uID0gY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKCkpLmlzRXF1YWwob2xkUG9zaXRpb24pXG4gICAgICAgIHN0YXRlLnN0b3AoKVxuICAgICAgb2xkUG9zaXRpb24gPSBuZXdQb3NpdGlvblxuXG4jIFVzZWQgYXMgb3BlcmF0b3IncyB0YXJnZXQgaW4gdmlzdWFsLW1vZGUuXG5jbGFzcyBDdXJyZW50U2VsZWN0aW9uIGV4dGVuZHMgTW90aW9uXG4gIEBleHRlbmQoZmFsc2UpXG4gIHNlbGVjdGlvbkV4dGVudDogbnVsbFxuICBibG9ja3dpc2VTZWxlY3Rpb25FeHRlbnQ6IG51bGxcbiAgaW5jbHVzaXZlOiB0cnVlXG5cbiAgaW5pdGlhbGl6ZTogLT5cbiAgICBzdXBlclxuICAgIEBwb2ludEluZm9CeUN1cnNvciA9IG5ldyBNYXBcblxuICBtb3ZlQ3Vyc29yOiAoY3Vyc29yKSAtPlxuICAgIGlmIEBtb2RlIGlzICd2aXN1YWwnXG4gICAgICBpZiBAaXNCbG9ja3dpc2UoKVxuICAgICAgICBAYmxvY2t3aXNlU2VsZWN0aW9uRXh0ZW50ID0gc3dyYXAoY3Vyc29yLnNlbGVjdGlvbikuZ2V0QmxvY2t3aXNlU2VsZWN0aW9uRXh0ZW50KClcbiAgICAgIGVsc2VcbiAgICAgICAgQHNlbGVjdGlvbkV4dGVudCA9IEBlZGl0b3IuZ2V0U2VsZWN0ZWRCdWZmZXJSYW5nZSgpLmdldEV4dGVudCgpXG4gICAgZWxzZVxuICAgICAgIyBgLmAgcmVwZWF0IGNhc2VcbiAgICAgIHBvaW50ID0gY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKClcblxuICAgICAgaWYgQGJsb2Nrd2lzZVNlbGVjdGlvbkV4dGVudD9cbiAgICAgICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHBvaW50LnRyYW5zbGF0ZShAYmxvY2t3aXNlU2VsZWN0aW9uRXh0ZW50KSlcbiAgICAgIGVsc2VcbiAgICAgICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHBvaW50LnRyYXZlcnNlKEBzZWxlY3Rpb25FeHRlbnQpKVxuXG4gIHNlbGVjdDogLT5cbiAgICBpZiBAbW9kZSBpcyAndmlzdWFsJ1xuICAgICAgc3VwZXJcbiAgICBlbHNlXG4gICAgICBmb3IgY3Vyc29yIGluIEBlZGl0b3IuZ2V0Q3Vyc29ycygpIHdoZW4gcG9pbnRJbmZvID0gQHBvaW50SW5mb0J5Q3Vyc29yLmdldChjdXJzb3IpXG4gICAgICAgIHtjdXJzb3JQb3NpdGlvbiwgc3RhcnRPZlNlbGVjdGlvbn0gPSBwb2ludEluZm9cbiAgICAgICAgaWYgY3Vyc29yUG9zaXRpb24uaXNFcXVhbChjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKSlcbiAgICAgICAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24oc3RhcnRPZlNlbGVjdGlvbilcbiAgICAgIHN1cGVyXG5cbiAgICAjICogUHVycG9zZSBvZiBwb2ludEluZm9CeUN1cnNvcj8gc2VlICMyMzUgZm9yIGRldGFpbC5cbiAgICAjIFdoZW4gc3RheU9uVHJhbnNmb3JtU3RyaW5nIGlzIGVuYWJsZWQsIGN1cnNvciBwb3MgaXMgbm90IHNldCBvbiBzdGFydCBvZlxuICAgICMgb2Ygc2VsZWN0ZWQgcmFuZ2UuXG4gICAgIyBCdXQgSSB3YW50IGZvbGxvd2luZyBiZWhhdmlvciwgc28gbmVlZCB0byBwcmVzZXJ2ZSBwb3NpdGlvbiBpbmZvLlxuICAgICMgIDEuIGB2aj4uYCAtPiBpbmRlbnQgc2FtZSB0d28gcm93cyByZWdhcmRsZXNzIG9mIGN1cnJlbnQgY3Vyc29yJ3Mgcm93LlxuICAgICMgIDIuIGB2aj5qLmAgLT4gaW5kZW50IHR3byByb3dzIGZyb20gY3Vyc29yJ3Mgcm93LlxuICAgIGZvciBjdXJzb3IgaW4gQGVkaXRvci5nZXRDdXJzb3JzKClcbiAgICAgIHN0YXJ0T2ZTZWxlY3Rpb24gPSBjdXJzb3Iuc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKCkuc3RhcnRcbiAgICAgIEBvbkRpZEZpbmlzaE9wZXJhdGlvbiA9PlxuICAgICAgICBjdXJzb3JQb3NpdGlvbiA9IGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXG4gICAgICAgIEBwb2ludEluZm9CeUN1cnNvci5zZXQoY3Vyc29yLCB7c3RhcnRPZlNlbGVjdGlvbiwgY3Vyc29yUG9zaXRpb259KVxuXG5jbGFzcyBNb3ZlTGVmdCBleHRlbmRzIE1vdGlvblxuICBAZXh0ZW5kKClcbiAgbW92ZUN1cnNvcjogKGN1cnNvcikgLT5cbiAgICBhbGxvd1dyYXAgPSBAZ2V0Q29uZmlnKCd3cmFwTGVmdFJpZ2h0TW90aW9uJylcbiAgICBAbW92ZUN1cnNvckNvdW50VGltZXMgY3Vyc29yLCAtPlxuICAgICAgbW92ZUN1cnNvckxlZnQoY3Vyc29yLCB7YWxsb3dXcmFwfSlcblxuY2xhc3MgTW92ZVJpZ2h0IGV4dGVuZHMgTW90aW9uXG4gIEBleHRlbmQoKVxuICBjYW5XcmFwVG9OZXh0TGluZTogKGN1cnNvcikgLT5cbiAgICBpZiBAaXNBc1RhcmdldEV4Y2VwdFNlbGVjdCgpIGFuZCBub3QgY3Vyc29yLmlzQXRFbmRPZkxpbmUoKVxuICAgICAgZmFsc2VcbiAgICBlbHNlXG4gICAgICBAZ2V0Q29uZmlnKCd3cmFwTGVmdFJpZ2h0TW90aW9uJylcblxuICBtb3ZlQ3Vyc29yOiAoY3Vyc29yKSAtPlxuICAgIEBtb3ZlQ3Vyc29yQ291bnRUaW1lcyBjdXJzb3IsID0+XG4gICAgICBAZWRpdG9yLnVuZm9sZEJ1ZmZlclJvdyhjdXJzb3IuZ2V0QnVmZmVyUm93KCkpXG4gICAgICBhbGxvd1dyYXAgPSBAY2FuV3JhcFRvTmV4dExpbmUoY3Vyc29yKVxuICAgICAgbW92ZUN1cnNvclJpZ2h0KGN1cnNvcilcbiAgICAgIGlmIGN1cnNvci5pc0F0RW5kT2ZMaW5lKCkgYW5kIGFsbG93V3JhcCBhbmQgbm90IGN1cnNvcklzQXRWaW1FbmRPZkZpbGUoY3Vyc29yKVxuICAgICAgICBtb3ZlQ3Vyc29yUmlnaHQoY3Vyc29yLCB7YWxsb3dXcmFwfSlcblxuY2xhc3MgTW92ZVJpZ2h0QnVmZmVyQ29sdW1uIGV4dGVuZHMgTW90aW9uXG4gIEBleHRlbmQoZmFsc2UpXG5cbiAgbW92ZUN1cnNvcjogKGN1cnNvcikgLT5cbiAgICBzZXRCdWZmZXJDb2x1bW4oY3Vyc29yLCBjdXJzb3IuZ2V0QnVmZmVyQ29sdW1uKCkgKyBAZ2V0Q291bnQoKSlcblxuY2xhc3MgTW92ZVVwIGV4dGVuZHMgTW90aW9uXG4gIEBleHRlbmQoKVxuICB3aXNlOiAnbGluZXdpc2UnXG4gIHdyYXA6IGZhbHNlXG5cbiAgZ2V0QnVmZmVyUm93OiAocm93KSAtPlxuICAgIHJvdyA9IEBnZXROZXh0Um93KHJvdylcbiAgICBpZiBAZWRpdG9yLmlzRm9sZGVkQXRCdWZmZXJSb3cocm93KVxuICAgICAgZ2V0TGFyZ2VzdEZvbGRSYW5nZUNvbnRhaW5zQnVmZmVyUm93KEBlZGl0b3IsIHJvdykuc3RhcnQucm93XG4gICAgZWxzZVxuICAgICAgcm93XG5cbiAgZ2V0TmV4dFJvdzogKHJvdykgLT5cbiAgICBtaW4gPSAwXG4gICAgaWYgQHdyYXAgYW5kIHJvdyBpcyBtaW5cbiAgICAgIEBnZXRWaW1MYXN0QnVmZmVyUm93KClcbiAgICBlbHNlXG4gICAgICBsaW1pdE51bWJlcihyb3cgLSAxLCB7bWlufSlcblxuICBtb3ZlQ3Vyc29yOiAoY3Vyc29yKSAtPlxuICAgIEBtb3ZlQ3Vyc29yQ291bnRUaW1lcyBjdXJzb3IsID0+XG4gICAgICBzZXRCdWZmZXJSb3coY3Vyc29yLCBAZ2V0QnVmZmVyUm93KGN1cnNvci5nZXRCdWZmZXJSb3coKSkpXG5cbmNsYXNzIE1vdmVVcFdyYXAgZXh0ZW5kcyBNb3ZlVXBcbiAgQGV4dGVuZCgpXG4gIHdyYXA6IHRydWVcblxuY2xhc3MgTW92ZURvd24gZXh0ZW5kcyBNb3ZlVXBcbiAgQGV4dGVuZCgpXG4gIHdpc2U6ICdsaW5ld2lzZSdcbiAgd3JhcDogZmFsc2VcblxuICBnZXRCdWZmZXJSb3c6IChyb3cpIC0+XG4gICAgaWYgQGVkaXRvci5pc0ZvbGRlZEF0QnVmZmVyUm93KHJvdylcbiAgICAgIHJvdyA9IGdldExhcmdlc3RGb2xkUmFuZ2VDb250YWluc0J1ZmZlclJvdyhAZWRpdG9yLCByb3cpLmVuZC5yb3dcbiAgICBAZ2V0TmV4dFJvdyhyb3cpXG5cbiAgZ2V0TmV4dFJvdzogKHJvdykgLT5cbiAgICBtYXggPSBAZ2V0VmltTGFzdEJ1ZmZlclJvdygpXG4gICAgaWYgQHdyYXAgYW5kIHJvdyA+PSBtYXhcbiAgICAgIDBcbiAgICBlbHNlXG4gICAgICBsaW1pdE51bWJlcihyb3cgKyAxLCB7bWF4fSlcblxuY2xhc3MgTW92ZURvd25XcmFwIGV4dGVuZHMgTW92ZURvd25cbiAgQGV4dGVuZCgpXG4gIHdyYXA6IHRydWVcblxuY2xhc3MgTW92ZVVwU2NyZWVuIGV4dGVuZHMgTW90aW9uXG4gIEBleHRlbmQoKVxuICB3aXNlOiAnbGluZXdpc2UnXG4gIGRpcmVjdGlvbjogJ3VwJ1xuXG4gIG1vdmVDdXJzb3I6IChjdXJzb3IpIC0+XG4gICAgQG1vdmVDdXJzb3JDb3VudFRpbWVzIGN1cnNvciwgLT5cbiAgICAgIG1vdmVDdXJzb3JVcFNjcmVlbihjdXJzb3IpXG5cbmNsYXNzIE1vdmVEb3duU2NyZWVuIGV4dGVuZHMgTW92ZVVwU2NyZWVuXG4gIEBleHRlbmQoKVxuICB3aXNlOiAnbGluZXdpc2UnXG4gIGRpcmVjdGlvbjogJ2Rvd24nXG5cbiAgbW92ZUN1cnNvcjogKGN1cnNvcikgLT5cbiAgICBAbW92ZUN1cnNvckNvdW50VGltZXMgY3Vyc29yLCAtPlxuICAgICAgbW92ZUN1cnNvckRvd25TY3JlZW4oY3Vyc29yKVxuXG4jIE1vdmUgZG93bi91cCB0byBFZGdlXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgU2VlIHQ5bWQvYXRvbS12aW0tbW9kZS1wbHVzIzIzNlxuIyBBdCBsZWFzdCB2MS43LjAuIGJ1ZmZlclBvc2l0aW9uIGFuZCBzY3JlZW5Qb3NpdGlvbiBjYW5ub3QgY29udmVydCBhY2N1cmF0ZWx5XG4jIHdoZW4gcm93IGlzIGZvbGRlZC5cbmNsYXNzIE1vdmVVcFRvRWRnZSBleHRlbmRzIE1vdGlvblxuICBAZXh0ZW5kKClcbiAgd2lzZTogJ2xpbmV3aXNlJ1xuICBqdW1wOiB0cnVlXG4gIGRpcmVjdGlvbjogJ3VwJ1xuICBAZGVzY3JpcHRpb246IFwiTW92ZSBjdXJzb3IgdXAgdG8gKiplZGdlKiogY2hhciBhdCBzYW1lLWNvbHVtblwiXG5cbiAgbW92ZUN1cnNvcjogKGN1cnNvcikgLT5cbiAgICBAbW92ZUN1cnNvckNvdW50VGltZXMgY3Vyc29yLCA9PlxuICAgICAgQHNldFNjcmVlblBvc2l0aW9uU2FmZWx5KGN1cnNvciwgQGdldFBvaW50KGN1cnNvci5nZXRTY3JlZW5Qb3NpdGlvbigpKSlcblxuICBnZXRQb2ludDogKGZyb21Qb2ludCkgLT5cbiAgICBjb2x1bW4gPSBmcm9tUG9pbnQuY29sdW1uXG4gICAgZm9yIHJvdyBpbiBAZ2V0U2NhblJvd3MoZnJvbVBvaW50KSB3aGVuIEBpc0VkZ2UocG9pbnQgPSBuZXcgUG9pbnQocm93LCBjb2x1bW4pKVxuICAgICAgcmV0dXJuIHBvaW50XG5cbiAgZ2V0U2NhblJvd3M6ICh7cm93fSkgLT5cbiAgICB2YWxpZFJvdyA9IGdldFZhbGlkVmltU2NyZWVuUm93LmJpbmQobnVsbCwgQGVkaXRvcilcbiAgICBzd2l0Y2ggQGRpcmVjdGlvblxuICAgICAgd2hlbiAndXAnIHRoZW4gW3ZhbGlkUm93KHJvdyAtIDEpLi4wXVxuICAgICAgd2hlbiAnZG93bicgdGhlbiBbdmFsaWRSb3cocm93ICsgMSkuLkBnZXRWaW1MYXN0U2NyZWVuUm93KCldXG5cbiAgaXNFZGdlOiAocG9pbnQpIC0+XG4gICAgaWYgQGlzU3RvcHBhYmxlUG9pbnQocG9pbnQpXG4gICAgICAjIElmIG9uZSBvZiBhYm92ZS9iZWxvdyBwb2ludCB3YXMgbm90IHN0b3BwYWJsZSwgaXQncyBFZGdlIVxuICAgICAgYWJvdmUgPSBwb2ludC50cmFuc2xhdGUoWy0xLCAwXSlcbiAgICAgIGJlbG93ID0gcG9pbnQudHJhbnNsYXRlKFsrMSwgMF0pXG4gICAgICAobm90IEBpc1N0b3BwYWJsZVBvaW50KGFib3ZlKSkgb3IgKG5vdCBAaXNTdG9wcGFibGVQb2ludChiZWxvdykpXG4gICAgZWxzZVxuICAgICAgZmFsc2VcblxuICBpc1N0b3BwYWJsZVBvaW50OiAocG9pbnQpIC0+XG4gICAgaWYgQGlzTm9uV2hpdGVTcGFjZVBvaW50KHBvaW50KVxuICAgICAgdHJ1ZVxuICAgIGVsc2VcbiAgICAgIGxlZnRQb2ludCA9IHBvaW50LnRyYW5zbGF0ZShbMCwgLTFdKVxuICAgICAgcmlnaHRQb2ludCA9IHBvaW50LnRyYW5zbGF0ZShbMCwgKzFdKVxuICAgICAgQGlzTm9uV2hpdGVTcGFjZVBvaW50KGxlZnRQb2ludCkgYW5kIEBpc05vbldoaXRlU3BhY2VQb2ludChyaWdodFBvaW50KVxuXG4gIGlzTm9uV2hpdGVTcGFjZVBvaW50OiAocG9pbnQpIC0+XG4gICAgY2hhciA9IGdldFRleHRJblNjcmVlblJhbmdlKEBlZGl0b3IsIFJhbmdlLmZyb21Qb2ludFdpdGhEZWx0YShwb2ludCwgMCwgMSkpXG4gICAgY2hhcj8gYW5kIC9cXFMvLnRlc3QoY2hhcilcblxuY2xhc3MgTW92ZURvd25Ub0VkZ2UgZXh0ZW5kcyBNb3ZlVXBUb0VkZ2VcbiAgQGV4dGVuZCgpXG4gIEBkZXNjcmlwdGlvbjogXCJNb3ZlIGN1cnNvciBkb3duIHRvICoqZWRnZSoqIGNoYXIgYXQgc2FtZS1jb2x1bW5cIlxuICBkaXJlY3Rpb246ICdkb3duJ1xuXG4jIHdvcmRcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgTW92ZVRvTmV4dFdvcmQgZXh0ZW5kcyBNb3Rpb25cbiAgQGV4dGVuZCgpXG4gIHdvcmRSZWdleDogbnVsbFxuXG4gIGdldFBvaW50OiAocGF0dGVybiwgZnJvbSkgLT5cbiAgICB3b3JkUmFuZ2UgPSBudWxsXG4gICAgZm91bmQgPSBmYWxzZVxuICAgIHZpbUVPRiA9IEBnZXRWaW1Fb2ZCdWZmZXJQb3NpdGlvbihAZWRpdG9yKVxuXG4gICAgQHNjYW5Gb3J3YXJkIHBhdHRlcm4sIHtmcm9tfSwgKHtyYW5nZSwgbWF0Y2hUZXh0LCBzdG9wfSkgLT5cbiAgICAgIHdvcmRSYW5nZSA9IHJhbmdlXG4gICAgICAjIElnbm9yZSAnZW1wdHkgbGluZScgbWF0Y2hlcyBiZXR3ZWVuICdcXHInIGFuZCAnXFxuJ1xuICAgICAgcmV0dXJuIGlmIG1hdGNoVGV4dCBpcyAnJyBhbmQgcmFuZ2Uuc3RhcnQuY29sdW1uIGlzbnQgMFxuICAgICAgaWYgcmFuZ2Uuc3RhcnQuaXNHcmVhdGVyVGhhbihmcm9tKVxuICAgICAgICBmb3VuZCA9IHRydWVcbiAgICAgICAgc3RvcCgpXG5cbiAgICBpZiBmb3VuZFxuICAgICAgcG9pbnQgPSB3b3JkUmFuZ2Uuc3RhcnRcbiAgICAgIGlmIHBvaW50SXNBdEVuZE9mTGluZUF0Tm9uRW1wdHlSb3coQGVkaXRvciwgcG9pbnQpIGFuZCBub3QgcG9pbnQuaXNFcXVhbCh2aW1FT0YpXG4gICAgICAgIHBvaW50LnRyYXZlcnNlKFsxLCAwXSlcbiAgICAgIGVsc2VcbiAgICAgICAgcG9pbnRcbiAgICBlbHNlXG4gICAgICB3b3JkUmFuZ2U/LmVuZCA/IGZyb21cblxuICAjIFNwZWNpYWwgY2FzZTogXCJjd1wiIGFuZCBcImNXXCIgYXJlIHRyZWF0ZWQgbGlrZSBcImNlXCIgYW5kIFwiY0VcIiBpZiB0aGUgY3Vyc29yIGlzXG4gICMgb24gYSBub24tYmxhbmsuICBUaGlzIGlzIGJlY2F1c2UgXCJjd1wiIGlzIGludGVycHJldGVkIGFzIGNoYW5nZS13b3JkLCBhbmQgYVxuICAjIHdvcmQgZG9lcyBub3QgaW5jbHVkZSB0aGUgZm9sbG93aW5nIHdoaXRlIHNwYWNlLiAge1ZpOiBcImN3XCIgd2hlbiBvbiBhIGJsYW5rXG4gICMgZm9sbG93ZWQgYnkgb3RoZXIgYmxhbmtzIGNoYW5nZXMgb25seSB0aGUgZmlyc3QgYmxhbms7IHRoaXMgaXMgcHJvYmFibHkgYVxuICAjIGJ1ZywgYmVjYXVzZSBcImR3XCIgZGVsZXRlcyBhbGwgdGhlIGJsYW5rc31cbiAgI1xuICAjIEFub3RoZXIgc3BlY2lhbCBjYXNlOiBXaGVuIHVzaW5nIHRoZSBcIndcIiBtb3Rpb24gaW4gY29tYmluYXRpb24gd2l0aCBhblxuICAjIG9wZXJhdG9yIGFuZCB0aGUgbGFzdCB3b3JkIG1vdmVkIG92ZXIgaXMgYXQgdGhlIGVuZCBvZiBhIGxpbmUsIHRoZSBlbmQgb2ZcbiAgIyB0aGF0IHdvcmQgYmVjb21lcyB0aGUgZW5kIG9mIHRoZSBvcGVyYXRlZCB0ZXh0LCBub3QgdGhlIGZpcnN0IHdvcmQgaW4gdGhlXG4gICMgbmV4dCBsaW5lLlxuICBtb3ZlQ3Vyc29yOiAoY3Vyc29yKSAtPlxuICAgIHJldHVybiBpZiBjdXJzb3JJc0F0VmltRW5kT2ZGaWxlKGN1cnNvcilcbiAgICB3YXNPbldoaXRlU3BhY2UgPSBwb2ludElzT25XaGl0ZVNwYWNlKEBlZGl0b3IsIGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpKVxuXG4gICAgaXNBc1RhcmdldEV4Y2VwdFNlbGVjdCA9IEBpc0FzVGFyZ2V0RXhjZXB0U2VsZWN0KClcbiAgICBAbW92ZUN1cnNvckNvdW50VGltZXMgY3Vyc29yLCAoe2lzRmluYWx9KSA9PlxuICAgICAgY3Vyc29yUG9zaXRpb24gPSBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuICAgICAgaWYgaXNFbXB0eVJvdyhAZWRpdG9yLCBjdXJzb3JQb3NpdGlvbi5yb3cpIGFuZCBpc0FzVGFyZ2V0RXhjZXB0U2VsZWN0XG4gICAgICAgIHBvaW50ID0gY3Vyc29yUG9zaXRpb24udHJhdmVyc2UoWzEsIDBdKVxuICAgICAgZWxzZVxuICAgICAgICBwYXR0ZXJuID0gQHdvcmRSZWdleCA/IGN1cnNvci53b3JkUmVnRXhwKClcbiAgICAgICAgcG9pbnQgPSBAZ2V0UG9pbnQocGF0dGVybiwgY3Vyc29yUG9zaXRpb24pXG4gICAgICAgIGlmIGlzRmluYWwgYW5kIGlzQXNUYXJnZXRFeGNlcHRTZWxlY3RcbiAgICAgICAgICBpZiBAZ2V0T3BlcmF0b3IoKS5pcygnQ2hhbmdlJykgYW5kIChub3Qgd2FzT25XaGl0ZVNwYWNlKVxuICAgICAgICAgICAgcG9pbnQgPSBjdXJzb3IuZ2V0RW5kT2ZDdXJyZW50V29yZEJ1ZmZlclBvc2l0aW9uKHtAd29yZFJlZ2V4fSlcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBwb2ludCA9IFBvaW50Lm1pbihwb2ludCwgZ2V0RW5kT2ZMaW5lRm9yQnVmZmVyUm93KEBlZGl0b3IsIGN1cnNvclBvc2l0aW9uLnJvdykpXG4gICAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24ocG9pbnQpXG5cbiMgYlxuY2xhc3MgTW92ZVRvUHJldmlvdXNXb3JkIGV4dGVuZHMgTW90aW9uXG4gIEBleHRlbmQoKVxuICB3b3JkUmVnZXg6IG51bGxcblxuICBtb3ZlQ3Vyc29yOiAoY3Vyc29yKSAtPlxuICAgIEBtb3ZlQ3Vyc29yQ291bnRUaW1lcyBjdXJzb3IsID0+XG4gICAgICBwb2ludCA9IGN1cnNvci5nZXRCZWdpbm5pbmdPZkN1cnJlbnRXb3JkQnVmZmVyUG9zaXRpb24oe0B3b3JkUmVnZXh9KVxuICAgICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHBvaW50KVxuXG5jbGFzcyBNb3ZlVG9FbmRPZldvcmQgZXh0ZW5kcyBNb3Rpb25cbiAgQGV4dGVuZCgpXG4gIHdvcmRSZWdleDogbnVsbFxuICBpbmNsdXNpdmU6IHRydWVcblxuICBtb3ZlVG9OZXh0RW5kT2ZXb3JkOiAoY3Vyc29yKSAtPlxuICAgIG1vdmVDdXJzb3JUb05leHROb25XaGl0ZXNwYWNlKGN1cnNvcilcbiAgICBwb2ludCA9IGN1cnNvci5nZXRFbmRPZkN1cnJlbnRXb3JkQnVmZmVyUG9zaXRpb24oe0B3b3JkUmVnZXh9KS50cmFuc2xhdGUoWzAsIC0xXSlcbiAgICBwb2ludCA9IFBvaW50Lm1pbihwb2ludCwgQGdldFZpbUVvZkJ1ZmZlclBvc2l0aW9uKCkpXG4gICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHBvaW50KVxuXG4gIG1vdmVDdXJzb3I6IChjdXJzb3IpIC0+XG4gICAgQG1vdmVDdXJzb3JDb3VudFRpbWVzIGN1cnNvciwgPT5cbiAgICAgIG9yaWdpbmFsUG9pbnQgPSBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuICAgICAgQG1vdmVUb05leHRFbmRPZldvcmQoY3Vyc29yKVxuICAgICAgaWYgb3JpZ2luYWxQb2ludC5pc0VxdWFsKGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpKVxuICAgICAgICAjIFJldHJ5IGZyb20gcmlnaHQgY29sdW1uIGlmIGN1cnNvciB3YXMgYWxyZWFkeSBvbiBFbmRPZldvcmRcbiAgICAgICAgY3Vyc29yLm1vdmVSaWdodCgpXG4gICAgICAgIEBtb3ZlVG9OZXh0RW5kT2ZXb3JkKGN1cnNvcilcblxuIyBbVE9ETzogSW1wcm92ZSwgYWNjdXJhY3ldXG5jbGFzcyBNb3ZlVG9QcmV2aW91c0VuZE9mV29yZCBleHRlbmRzIE1vdmVUb1ByZXZpb3VzV29yZFxuICBAZXh0ZW5kKClcbiAgaW5jbHVzaXZlOiB0cnVlXG5cbiAgbW92ZUN1cnNvcjogKGN1cnNvcikgLT5cbiAgICB0aW1lcyA9IEBnZXRDb3VudCgpXG4gICAgd29yZFJhbmdlID0gY3Vyc29yLmdldEN1cnJlbnRXb3JkQnVmZmVyUmFuZ2UoKVxuICAgIGN1cnNvclBvc2l0aW9uID0gY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKClcblxuICAgICMgaWYgd2UncmUgaW4gdGhlIG1pZGRsZSBvZiBhIHdvcmQgdGhlbiB3ZSBuZWVkIHRvIG1vdmUgdG8gaXRzIHN0YXJ0XG4gICAgaWYgY3Vyc29yUG9zaXRpb24uaXNHcmVhdGVyVGhhbih3b3JkUmFuZ2Uuc3RhcnQpIGFuZCBjdXJzb3JQb3NpdGlvbi5pc0xlc3NUaGFuKHdvcmRSYW5nZS5lbmQpXG4gICAgICB0aW1lcyArPSAxXG5cbiAgICBmb3IgWzEuLnRpbWVzXVxuICAgICAgcG9pbnQgPSBjdXJzb3IuZ2V0QmVnaW5uaW5nT2ZDdXJyZW50V29yZEJ1ZmZlclBvc2l0aW9uKHtAd29yZFJlZ2V4fSlcbiAgICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihwb2ludClcblxuICAgIEBtb3ZlVG9OZXh0RW5kT2ZXb3JkKGN1cnNvcilcbiAgICBpZiBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKS5pc0dyZWF0ZXJUaGFuT3JFcXVhbChjdXJzb3JQb3NpdGlvbilcbiAgICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihbMCwgMF0pXG5cbiAgbW92ZVRvTmV4dEVuZE9mV29yZDogKGN1cnNvcikgLT5cbiAgICBwb2ludCA9IGN1cnNvci5nZXRFbmRPZkN1cnJlbnRXb3JkQnVmZmVyUG9zaXRpb24oe0B3b3JkUmVnZXh9KS50cmFuc2xhdGUoWzAsIC0xXSlcbiAgICBwb2ludCA9IFBvaW50Lm1pbihwb2ludCwgQGdldFZpbUVvZkJ1ZmZlclBvc2l0aW9uKCkpXG4gICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHBvaW50KVxuXG4jIFdob2xlIHdvcmRcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgTW92ZVRvTmV4dFdob2xlV29yZCBleHRlbmRzIE1vdmVUb05leHRXb3JkXG4gIEBleHRlbmQoKVxuICB3b3JkUmVnZXg6IC9eJHxcXFMrL2dcblxuY2xhc3MgTW92ZVRvUHJldmlvdXNXaG9sZVdvcmQgZXh0ZW5kcyBNb3ZlVG9QcmV2aW91c1dvcmRcbiAgQGV4dGVuZCgpXG4gIHdvcmRSZWdleDogL14kfFxcUysvZ1xuXG5jbGFzcyBNb3ZlVG9FbmRPZldob2xlV29yZCBleHRlbmRzIE1vdmVUb0VuZE9mV29yZFxuICBAZXh0ZW5kKClcbiAgd29yZFJlZ2V4OiAvXFxTKy9cblxuIyBbVE9ETzogSW1wcm92ZSwgYWNjdXJhY3ldXG5jbGFzcyBNb3ZlVG9QcmV2aW91c0VuZE9mV2hvbGVXb3JkIGV4dGVuZHMgTW92ZVRvUHJldmlvdXNFbmRPZldvcmRcbiAgQGV4dGVuZCgpXG4gIHdvcmRSZWdleDogL1xcUysvXG5cbiMgQWxwaGFudW1lcmljIHdvcmQgW0V4cGVyaW1lbnRhbF1cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgTW92ZVRvTmV4dEFscGhhbnVtZXJpY1dvcmQgZXh0ZW5kcyBNb3ZlVG9OZXh0V29yZFxuICBAZXh0ZW5kKClcbiAgQGRlc2NyaXB0aW9uOiBcIk1vdmUgdG8gbmV4dCBhbHBoYW51bWVyaWMoYC9cXHcrL2ApIHdvcmRcIlxuICB3b3JkUmVnZXg6IC9cXHcrL2dcblxuY2xhc3MgTW92ZVRvUHJldmlvdXNBbHBoYW51bWVyaWNXb3JkIGV4dGVuZHMgTW92ZVRvUHJldmlvdXNXb3JkXG4gIEBleHRlbmQoKVxuICBAZGVzY3JpcHRpb246IFwiTW92ZSB0byBwcmV2aW91cyBhbHBoYW51bWVyaWMoYC9cXHcrL2ApIHdvcmRcIlxuICB3b3JkUmVnZXg6IC9cXHcrL1xuXG5jbGFzcyBNb3ZlVG9FbmRPZkFscGhhbnVtZXJpY1dvcmQgZXh0ZW5kcyBNb3ZlVG9FbmRPZldvcmRcbiAgQGV4dGVuZCgpXG4gIEBkZXNjcmlwdGlvbjogXCJNb3ZlIHRvIGVuZCBvZiBhbHBoYW51bWVyaWMoYC9cXHcrL2ApIHdvcmRcIlxuICB3b3JkUmVnZXg6IC9cXHcrL1xuXG4jIEFscGhhbnVtZXJpYyB3b3JkIFtFeHBlcmltZW50YWxdXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIE1vdmVUb05leHRTbWFydFdvcmQgZXh0ZW5kcyBNb3ZlVG9OZXh0V29yZFxuICBAZXh0ZW5kKClcbiAgQGRlc2NyaXB0aW9uOiBcIk1vdmUgdG8gbmV4dCBzbWFydCB3b3JkIChgL1tcXHctXSsvYCkgd29yZFwiXG4gIHdvcmRSZWdleDogL1tcXHctXSsvZ1xuXG5jbGFzcyBNb3ZlVG9QcmV2aW91c1NtYXJ0V29yZCBleHRlbmRzIE1vdmVUb1ByZXZpb3VzV29yZFxuICBAZXh0ZW5kKClcbiAgQGRlc2NyaXB0aW9uOiBcIk1vdmUgdG8gcHJldmlvdXMgc21hcnQgd29yZCAoYC9bXFx3LV0rL2ApIHdvcmRcIlxuICB3b3JkUmVnZXg6IC9bXFx3LV0rL1xuXG5jbGFzcyBNb3ZlVG9FbmRPZlNtYXJ0V29yZCBleHRlbmRzIE1vdmVUb0VuZE9mV29yZFxuICBAZXh0ZW5kKClcbiAgQGRlc2NyaXB0aW9uOiBcIk1vdmUgdG8gZW5kIG9mIHNtYXJ0IHdvcmQgKGAvW1xcdy1dKy9gKSB3b3JkXCJcbiAgd29yZFJlZ2V4OiAvW1xcdy1dKy9cblxuIyBTdWJ3b3JkXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIE1vdmVUb05leHRTdWJ3b3JkIGV4dGVuZHMgTW92ZVRvTmV4dFdvcmRcbiAgQGV4dGVuZCgpXG4gIG1vdmVDdXJzb3I6IChjdXJzb3IpIC0+XG4gICAgQHdvcmRSZWdleCA9IGN1cnNvci5zdWJ3b3JkUmVnRXhwKClcbiAgICBzdXBlclxuXG5jbGFzcyBNb3ZlVG9QcmV2aW91c1N1YndvcmQgZXh0ZW5kcyBNb3ZlVG9QcmV2aW91c1dvcmRcbiAgQGV4dGVuZCgpXG4gIG1vdmVDdXJzb3I6IChjdXJzb3IpIC0+XG4gICAgQHdvcmRSZWdleCA9IGN1cnNvci5zdWJ3b3JkUmVnRXhwKClcbiAgICBzdXBlclxuXG5jbGFzcyBNb3ZlVG9FbmRPZlN1YndvcmQgZXh0ZW5kcyBNb3ZlVG9FbmRPZldvcmRcbiAgQGV4dGVuZCgpXG4gIG1vdmVDdXJzb3I6IChjdXJzb3IpIC0+XG4gICAgQHdvcmRSZWdleCA9IGN1cnNvci5zdWJ3b3JkUmVnRXhwKClcbiAgICBzdXBlclxuXG4jIFNlbnRlbmNlXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgU2VudGVuY2UgaXMgZGVmaW5lZCBhcyBiZWxvd1xuIyAgLSBlbmQgd2l0aCBbJy4nLCAnIScsICc/J11cbiMgIC0gb3B0aW9uYWxseSBmb2xsb3dlZCBieSBbJyknLCAnXScsICdcIicsIFwiJ1wiXVxuIyAgLSBmb2xsb3dlZCBieSBbJyQnLCAnICcsICdcXHQnXVxuIyAgLSBwYXJhZ3JhcGggYm91bmRhcnkgaXMgYWxzbyBzZW50ZW5jZSBib3VuZGFyeVxuIyAgLSBzZWN0aW9uIGJvdW5kYXJ5IGlzIGFsc28gc2VudGVuY2UgYm91bmRhcnkoaWdub3JlKVxuY2xhc3MgTW92ZVRvTmV4dFNlbnRlbmNlIGV4dGVuZHMgTW90aW9uXG4gIEBleHRlbmQoKVxuICBqdW1wOiB0cnVlXG4gIHNlbnRlbmNlUmVnZXg6IC8vLyg/OltcXC4hXFw/XVtcXClcXF1cIiddKlxccyspfChcXG58XFxyXFxuKS8vL2dcbiAgZGlyZWN0aW9uOiAnbmV4dCdcblxuICBtb3ZlQ3Vyc29yOiAoY3Vyc29yKSAtPlxuICAgIEBtb3ZlQ3Vyc29yQ291bnRUaW1lcyBjdXJzb3IsID0+XG4gICAgICBAc2V0QnVmZmVyUG9zaXRpb25TYWZlbHkoY3Vyc29yLCBAZ2V0UG9pbnQoY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKCkpKVxuXG4gIGdldFBvaW50OiAoZnJvbVBvaW50KSAtPlxuICAgIGlmIEBkaXJlY3Rpb24gaXMgJ25leHQnXG4gICAgICBAZ2V0TmV4dFN0YXJ0T2ZTZW50ZW5jZShmcm9tUG9pbnQpXG4gICAgZWxzZSBpZiBAZGlyZWN0aW9uIGlzICdwcmV2aW91cydcbiAgICAgIEBnZXRQcmV2aW91c1N0YXJ0T2ZTZW50ZW5jZShmcm9tUG9pbnQpXG5cbiAgaXNCbGFua1JvdzogKHJvdykgLT5cbiAgICBAZWRpdG9yLmlzQnVmZmVyUm93Qmxhbmsocm93KVxuXG4gIGdldE5leHRTdGFydE9mU2VudGVuY2U6IChmcm9tKSAtPlxuICAgIGZvdW5kUG9pbnQgPSBudWxsXG4gICAgQHNjYW5Gb3J3YXJkIEBzZW50ZW5jZVJlZ2V4LCB7ZnJvbX0sICh7cmFuZ2UsIG1hdGNoVGV4dCwgbWF0Y2gsIHN0b3B9KSA9PlxuICAgICAgaWYgbWF0Y2hbMV0/XG4gICAgICAgIFtzdGFydFJvdywgZW5kUm93XSA9IFtyYW5nZS5zdGFydC5yb3csIHJhbmdlLmVuZC5yb3ddXG4gICAgICAgIHJldHVybiBpZiBAc2tpcEJsYW5rUm93IGFuZCBAaXNCbGFua1JvdyhlbmRSb3cpXG4gICAgICAgIGlmIEBpc0JsYW5rUm93KHN0YXJ0Um93KSBpc250IEBpc0JsYW5rUm93KGVuZFJvdylcbiAgICAgICAgICBmb3VuZFBvaW50ID0gQGdldEZpcnN0Q2hhcmFjdGVyUG9zaXRpb25Gb3JCdWZmZXJSb3coZW5kUm93KVxuICAgICAgZWxzZVxuICAgICAgICBmb3VuZFBvaW50ID0gcmFuZ2UuZW5kXG4gICAgICBzdG9wKCkgaWYgZm91bmRQb2ludD9cbiAgICBmb3VuZFBvaW50ID8gQGdldFZpbUVvZkJ1ZmZlclBvc2l0aW9uKClcblxuICBnZXRQcmV2aW91c1N0YXJ0T2ZTZW50ZW5jZTogKGZyb20pIC0+XG4gICAgZm91bmRQb2ludCA9IG51bGxcbiAgICBAc2NhbkJhY2t3YXJkIEBzZW50ZW5jZVJlZ2V4LCB7ZnJvbX0sICh7cmFuZ2UsIG1hdGNoLCBzdG9wLCBtYXRjaFRleHR9KSA9PlxuICAgICAgaWYgbWF0Y2hbMV0/XG4gICAgICAgIFtzdGFydFJvdywgZW5kUm93XSA9IFtyYW5nZS5zdGFydC5yb3csIHJhbmdlLmVuZC5yb3ddXG4gICAgICAgIGlmIG5vdCBAaXNCbGFua1JvdyhlbmRSb3cpIGFuZCBAaXNCbGFua1JvdyhzdGFydFJvdylcbiAgICAgICAgICBwb2ludCA9IEBnZXRGaXJzdENoYXJhY3RlclBvc2l0aW9uRm9yQnVmZmVyUm93KGVuZFJvdylcbiAgICAgICAgICBpZiBwb2ludC5pc0xlc3NUaGFuKGZyb20pXG4gICAgICAgICAgICBmb3VuZFBvaW50ID0gcG9pbnRcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXR1cm4gaWYgQHNraXBCbGFua1Jvd1xuICAgICAgICAgICAgZm91bmRQb2ludCA9IEBnZXRGaXJzdENoYXJhY3RlclBvc2l0aW9uRm9yQnVmZmVyUm93KHN0YXJ0Um93KVxuICAgICAgZWxzZVxuICAgICAgICBpZiByYW5nZS5lbmQuaXNMZXNzVGhhbihmcm9tKVxuICAgICAgICAgIGZvdW5kUG9pbnQgPSByYW5nZS5lbmRcbiAgICAgIHN0b3AoKSBpZiBmb3VuZFBvaW50P1xuICAgIGZvdW5kUG9pbnQgPyBbMCwgMF1cblxuY2xhc3MgTW92ZVRvUHJldmlvdXNTZW50ZW5jZSBleHRlbmRzIE1vdmVUb05leHRTZW50ZW5jZVxuICBAZXh0ZW5kKClcbiAgZGlyZWN0aW9uOiAncHJldmlvdXMnXG5cbmNsYXNzIE1vdmVUb05leHRTZW50ZW5jZVNraXBCbGFua1JvdyBleHRlbmRzIE1vdmVUb05leHRTZW50ZW5jZVxuICBAZXh0ZW5kKClcbiAgc2tpcEJsYW5rUm93OiB0cnVlXG5cbmNsYXNzIE1vdmVUb1ByZXZpb3VzU2VudGVuY2VTa2lwQmxhbmtSb3cgZXh0ZW5kcyBNb3ZlVG9QcmV2aW91c1NlbnRlbmNlXG4gIEBleHRlbmQoKVxuICBza2lwQmxhbmtSb3c6IHRydWVcblxuIyBQYXJhZ3JhcGhcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgTW92ZVRvTmV4dFBhcmFncmFwaCBleHRlbmRzIE1vdGlvblxuICBAZXh0ZW5kKClcbiAganVtcDogdHJ1ZVxuICBkaXJlY3Rpb246ICduZXh0J1xuXG4gIG1vdmVDdXJzb3I6IChjdXJzb3IpIC0+XG4gICAgQG1vdmVDdXJzb3JDb3VudFRpbWVzIGN1cnNvciwgPT5cbiAgICAgIEBzZXRCdWZmZXJQb3NpdGlvblNhZmVseShjdXJzb3IsIEBnZXRQb2ludChjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKSkpXG5cbiAgZ2V0UG9pbnQ6IChmcm9tUG9pbnQpIC0+XG4gICAgc3RhcnRSb3cgPSBmcm9tUG9pbnQucm93XG4gICAgd2FzQXROb25CbGFua1JvdyA9IG5vdCBAZWRpdG9yLmlzQnVmZmVyUm93Qmxhbmsoc3RhcnRSb3cpXG4gICAgZm9yIHJvdyBpbiBnZXRCdWZmZXJSb3dzKEBlZGl0b3IsIHtzdGFydFJvdywgQGRpcmVjdGlvbn0pXG4gICAgICBpZiBAZWRpdG9yLmlzQnVmZmVyUm93Qmxhbmsocm93KVxuICAgICAgICByZXR1cm4gbmV3IFBvaW50KHJvdywgMCkgaWYgd2FzQXROb25CbGFua1Jvd1xuICAgICAgZWxzZVxuICAgICAgICB3YXNBdE5vbkJsYW5rUm93ID0gdHJ1ZVxuXG4gICAgIyBmYWxsYmFja1xuICAgIHN3aXRjaCBAZGlyZWN0aW9uXG4gICAgICB3aGVuICdwcmV2aW91cycgdGhlbiBuZXcgUG9pbnQoMCwgMClcbiAgICAgIHdoZW4gJ25leHQnIHRoZW4gQGdldFZpbUVvZkJ1ZmZlclBvc2l0aW9uKClcblxuY2xhc3MgTW92ZVRvUHJldmlvdXNQYXJhZ3JhcGggZXh0ZW5kcyBNb3ZlVG9OZXh0UGFyYWdyYXBoXG4gIEBleHRlbmQoKVxuICBkaXJlY3Rpb246ICdwcmV2aW91cydcblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBNb3ZlVG9CZWdpbm5pbmdPZkxpbmUgZXh0ZW5kcyBNb3Rpb25cbiAgQGV4dGVuZCgpXG5cbiAgbW92ZUN1cnNvcjogKGN1cnNvcikgLT5cbiAgICBzZXRCdWZmZXJDb2x1bW4oY3Vyc29yLCAwKVxuXG5jbGFzcyBNb3ZlVG9Db2x1bW4gZXh0ZW5kcyBNb3Rpb25cbiAgQGV4dGVuZCgpXG5cbiAgbW92ZUN1cnNvcjogKGN1cnNvcikgLT5cbiAgICBzZXRCdWZmZXJDb2x1bW4oY3Vyc29yLCBAZ2V0Q291bnQoLTEpKVxuXG5jbGFzcyBNb3ZlVG9MYXN0Q2hhcmFjdGVyT2ZMaW5lIGV4dGVuZHMgTW90aW9uXG4gIEBleHRlbmQoKVxuXG4gIG1vdmVDdXJzb3I6IChjdXJzb3IpIC0+XG4gICAgcm93ID0gZ2V0VmFsaWRWaW1CdWZmZXJSb3coQGVkaXRvciwgY3Vyc29yLmdldEJ1ZmZlclJvdygpICsgQGdldENvdW50KC0xKSlcbiAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24oW3JvdywgSW5maW5pdHldKVxuICAgIGN1cnNvci5nb2FsQ29sdW1uID0gSW5maW5pdHlcblxuY2xhc3MgTW92ZVRvTGFzdE5vbmJsYW5rQ2hhcmFjdGVyT2ZMaW5lQW5kRG93biBleHRlbmRzIE1vdGlvblxuICBAZXh0ZW5kKClcbiAgaW5jbHVzaXZlOiB0cnVlXG5cbiAgbW92ZUN1cnNvcjogKGN1cnNvcikgLT5cbiAgICBwb2ludCA9IEBnZXRQb2ludChjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKSlcbiAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24ocG9pbnQpXG5cbiAgZ2V0UG9pbnQ6ICh7cm93fSkgLT5cbiAgICByb3cgPSBsaW1pdE51bWJlcihyb3cgKyBAZ2V0Q291bnQoLTEpLCBtYXg6IEBnZXRWaW1MYXN0QnVmZmVyUm93KCkpXG4gICAgcmFuZ2UgPSBmaW5kUmFuZ2VJbkJ1ZmZlclJvdyhAZWRpdG9yLCAvXFxTfF4vLCByb3csIGRpcmVjdGlvbjogJ2JhY2t3YXJkJylcbiAgICByYW5nZT8uc3RhcnQgPyBuZXcgUG9pbnQocm93LCAwKVxuXG4jIE1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lIGZhaW1pbHlcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBNb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZSBleHRlbmRzIE1vdGlvblxuICBAZXh0ZW5kKClcbiAgbW92ZUN1cnNvcjogKGN1cnNvcikgLT5cbiAgICBwb2ludCA9IEBnZXRGaXJzdENoYXJhY3RlclBvc2l0aW9uRm9yQnVmZmVyUm93KGN1cnNvci5nZXRCdWZmZXJSb3coKSlcbiAgICBAc2V0QnVmZmVyUG9zaXRpb25TYWZlbHkoY3Vyc29yLCBwb2ludClcblxuY2xhc3MgTW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmVVcCBleHRlbmRzIE1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lXG4gIEBleHRlbmQoKVxuICB3aXNlOiAnbGluZXdpc2UnXG4gIG1vdmVDdXJzb3I6IChjdXJzb3IpIC0+XG4gICAgQG1vdmVDdXJzb3JDb3VudFRpbWVzIGN1cnNvciwgLT5cbiAgICAgIG1vdmVDdXJzb3JVcEJ1ZmZlcihjdXJzb3IpXG4gICAgc3VwZXJcblxuY2xhc3MgTW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmVEb3duIGV4dGVuZHMgTW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmVcbiAgQGV4dGVuZCgpXG4gIHdpc2U6ICdsaW5ld2lzZSdcbiAgbW92ZUN1cnNvcjogKGN1cnNvcikgLT5cbiAgICBAbW92ZUN1cnNvckNvdW50VGltZXMgY3Vyc29yLCAtPlxuICAgICAgbW92ZUN1cnNvckRvd25CdWZmZXIoY3Vyc29yKVxuICAgIHN1cGVyXG5cbmNsYXNzIE1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lQW5kRG93biBleHRlbmRzIE1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lRG93blxuICBAZXh0ZW5kKClcbiAgZGVmYXVsdENvdW50OiAwXG4gIGdldENvdW50OiAtPiBzdXBlciAtIDFcblxuIyBrZXltYXA6IGcgZ1xuY2xhc3MgTW92ZVRvRmlyc3RMaW5lIGV4dGVuZHMgTW90aW9uXG4gIEBleHRlbmQoKVxuICB3aXNlOiAnbGluZXdpc2UnXG4gIGp1bXA6IHRydWVcbiAgdmVydGljYWxNb3Rpb246IHRydWVcbiAgbW92ZVN1Y2Nlc3NPbkxpbmV3aXNlOiB0cnVlXG5cbiAgbW92ZUN1cnNvcjogKGN1cnNvcikgLT5cbiAgICBAc2V0Q3Vyc29yQnVmZmVyUm93KGN1cnNvciwgZ2V0VmFsaWRWaW1CdWZmZXJSb3coQGVkaXRvciwgQGdldFJvdygpKSlcbiAgICBjdXJzb3IuYXV0b3Njcm9sbChjZW50ZXI6IHRydWUpXG5cbiAgZ2V0Um93OiAtPlxuICAgIEBnZXRDb3VudCgtMSlcblxuIyBrZXltYXA6IEdcbmNsYXNzIE1vdmVUb0xhc3RMaW5lIGV4dGVuZHMgTW92ZVRvRmlyc3RMaW5lXG4gIEBleHRlbmQoKVxuICBkZWZhdWx0Q291bnQ6IEluZmluaXR5XG5cbiMga2V5bWFwOiBOJSBlLmcuIDEwJVxuY2xhc3MgTW92ZVRvTGluZUJ5UGVyY2VudCBleHRlbmRzIE1vdmVUb0ZpcnN0TGluZVxuICBAZXh0ZW5kKClcblxuICBnZXRSb3c6IC0+XG4gICAgcGVyY2VudCA9IGxpbWl0TnVtYmVyKEBnZXRDb3VudCgpLCBtYXg6IDEwMClcbiAgICBNYXRoLmZsb29yKChAZWRpdG9yLmdldExpbmVDb3VudCgpIC0gMSkgKiAocGVyY2VudCAvIDEwMCkpXG5cbmNsYXNzIE1vdmVUb1JlbGF0aXZlTGluZSBleHRlbmRzIE1vdGlvblxuICBAZXh0ZW5kKGZhbHNlKVxuICB3aXNlOiAnbGluZXdpc2UnXG4gIG1vdmVTdWNjZXNzT25MaW5ld2lzZTogdHJ1ZVxuXG4gIG1vdmVDdXJzb3I6IChjdXJzb3IpIC0+XG4gICAgc2V0QnVmZmVyUm93KGN1cnNvciwgY3Vyc29yLmdldEJ1ZmZlclJvdygpICsgQGdldENvdW50KC0xKSlcblxuY2xhc3MgTW92ZVRvUmVsYXRpdmVMaW5lTWluaW11bU9uZSBleHRlbmRzIE1vdmVUb1JlbGF0aXZlTGluZVxuICBAZXh0ZW5kKGZhbHNlKVxuXG4gIGdldENvdW50OiAtPlxuICAgIGxpbWl0TnVtYmVyKHN1cGVyLCBtaW46IDEpXG5cbiMgUG9zaXRpb24gY3Vyc29yIHdpdGhvdXQgc2Nyb2xsaW5nLiwgSCwgTSwgTFxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIGtleW1hcDogSFxuY2xhc3MgTW92ZVRvVG9wT2ZTY3JlZW4gZXh0ZW5kcyBNb3Rpb25cbiAgQGV4dGVuZCgpXG4gIHdpc2U6ICdsaW5ld2lzZSdcbiAganVtcDogdHJ1ZVxuICBzY3JvbGxvZmY6IDJcbiAgZGVmYXVsdENvdW50OiAwXG4gIHZlcnRpY2FsTW90aW9uOiB0cnVlXG5cbiAgbW92ZUN1cnNvcjogKGN1cnNvcikgLT5cbiAgICBidWZmZXJSb3cgPSBAZWRpdG9yLmJ1ZmZlclJvd0ZvclNjcmVlblJvdyhAZ2V0U2NyZWVuUm93KCkpXG4gICAgQHNldEN1cnNvckJ1ZmZlclJvdyhjdXJzb3IsIGJ1ZmZlclJvdylcblxuICBnZXRTY3JvbGxvZmY6IC0+XG4gICAgaWYgQGlzQXNUYXJnZXRFeGNlcHRTZWxlY3QoKVxuICAgICAgMFxuICAgIGVsc2VcbiAgICAgIEBzY3JvbGxvZmZcblxuICBnZXRTY3JlZW5Sb3c6IC0+XG4gICAgZmlyc3RSb3cgPSBnZXRGaXJzdFZpc2libGVTY3JlZW5Sb3coQGVkaXRvcilcbiAgICBvZmZzZXQgPSBAZ2V0U2Nyb2xsb2ZmKClcbiAgICBvZmZzZXQgPSAwIGlmIGZpcnN0Um93IGlzIDBcbiAgICBvZmZzZXQgPSBsaW1pdE51bWJlcihAZ2V0Q291bnQoLTEpLCBtaW46IG9mZnNldClcbiAgICBmaXJzdFJvdyArIG9mZnNldFxuXG4jIGtleW1hcDogTVxuY2xhc3MgTW92ZVRvTWlkZGxlT2ZTY3JlZW4gZXh0ZW5kcyBNb3ZlVG9Ub3BPZlNjcmVlblxuICBAZXh0ZW5kKClcbiAgZ2V0U2NyZWVuUm93OiAtPlxuICAgIHN0YXJ0Um93ID0gZ2V0Rmlyc3RWaXNpYmxlU2NyZWVuUm93KEBlZGl0b3IpXG4gICAgZW5kUm93ID0gbGltaXROdW1iZXIoQGVkaXRvci5nZXRMYXN0VmlzaWJsZVNjcmVlblJvdygpLCBtYXg6IEBnZXRWaW1MYXN0U2NyZWVuUm93KCkpXG4gICAgc3RhcnRSb3cgKyBNYXRoLmZsb29yKChlbmRSb3cgLSBzdGFydFJvdykgLyAyKVxuXG4jIGtleW1hcDogTFxuY2xhc3MgTW92ZVRvQm90dG9tT2ZTY3JlZW4gZXh0ZW5kcyBNb3ZlVG9Ub3BPZlNjcmVlblxuICBAZXh0ZW5kKClcbiAgZ2V0U2NyZWVuUm93OiAtPlxuICAgICMgW0ZJWE1FXVxuICAgICMgQXQgbGVhc3QgQXRvbSB2MS42LjAsIHRoZXJlIGFyZSB0d28gaW1wbGVtZW50YXRpb24gb2YgZ2V0TGFzdFZpc2libGVTY3JlZW5Sb3coKVxuICAgICMgZWRpdG9yLmdldExhc3RWaXNpYmxlU2NyZWVuUm93KCkgYW5kIGVkaXRvckVsZW1lbnQuZ2V0TGFzdFZpc2libGVTY3JlZW5Sb3coKVxuICAgICMgVGhvc2UgdHdvIG1ldGhvZHMgcmV0dXJuIGRpZmZlcmVudCB2YWx1ZSwgZWRpdG9yJ3Mgb25lIGlzIGNvcnJlbnQuXG4gICAgIyBTbyBJIGludGVudGlvbmFsbHkgdXNlIGVkaXRvci5nZXRMYXN0U2NyZWVuUm93IGhlcmUuXG4gICAgdmltTGFzdFNjcmVlblJvdyA9IEBnZXRWaW1MYXN0U2NyZWVuUm93KClcbiAgICByb3cgPSBsaW1pdE51bWJlcihAZWRpdG9yLmdldExhc3RWaXNpYmxlU2NyZWVuUm93KCksIG1heDogdmltTGFzdFNjcmVlblJvdylcbiAgICBvZmZzZXQgPSBAZ2V0U2Nyb2xsb2ZmKCkgKyAxXG4gICAgb2Zmc2V0ID0gMCBpZiByb3cgaXMgdmltTGFzdFNjcmVlblJvd1xuICAgIG9mZnNldCA9IGxpbWl0TnVtYmVyKEBnZXRDb3VudCgtMSksIG1pbjogb2Zmc2V0KVxuICAgIHJvdyAtIG9mZnNldFxuXG4jIFNjcm9sbGluZ1xuIyBIYWxmOiBjdHJsLWQsIGN0cmwtdVxuIyBGdWxsOiBjdHJsLWYsIGN0cmwtYlxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIFtGSVhNRV0gY291bnQgYmVoYXZlIGRpZmZlcmVudGx5IGZyb20gb3JpZ2luYWwgVmltLlxuY2xhc3MgU2Nyb2xsIGV4dGVuZHMgTW90aW9uXG4gIEBleHRlbmQoZmFsc2UpXG4gIHZlcnRpY2FsTW90aW9uOiB0cnVlXG5cbiAgaXNTbW9vdGhTY3JvbGxFbmFibGVkOiAtPlxuICAgIGlmIE1hdGguYWJzKEBhbW91bnRPZlBhZ2UpIGlzIDFcbiAgICAgIEBnZXRDb25maWcoJ3Ntb290aFNjcm9sbE9uRnVsbFNjcm9sbE1vdGlvbicpXG4gICAgZWxzZVxuICAgICAgQGdldENvbmZpZygnc21vb3RoU2Nyb2xsT25IYWxmU2Nyb2xsTW90aW9uJylcblxuICBnZXRTbW9vdGhTY3JvbGxEdWF0aW9uOiAtPlxuICAgIGlmIE1hdGguYWJzKEBhbW91bnRPZlBhZ2UpIGlzIDFcbiAgICAgIEBnZXRDb25maWcoJ3Ntb290aFNjcm9sbE9uRnVsbFNjcm9sbE1vdGlvbkR1cmF0aW9uJylcbiAgICBlbHNlXG4gICAgICBAZ2V0Q29uZmlnKCdzbW9vdGhTY3JvbGxPbkhhbGZTY3JvbGxNb3Rpb25EdXJhdGlvbicpXG5cbiAgZ2V0UGl4ZWxSZWN0VG9wRm9yU2NlZW5Sb3c6IChyb3cpIC0+XG4gICAgcG9pbnQgPSBuZXcgUG9pbnQocm93LCAwKVxuICAgIEBlZGl0b3IuZWxlbWVudC5waXhlbFJlY3RGb3JTY3JlZW5SYW5nZShuZXcgUmFuZ2UocG9pbnQsIHBvaW50KSkudG9wXG5cbiAgc21vb3RoU2Nyb2xsOiAoZnJvbVJvdywgdG9Sb3csIG9wdGlvbnM9e30pIC0+XG4gICAgdG9wUGl4ZWxGcm9tID0ge3RvcDogQGdldFBpeGVsUmVjdFRvcEZvclNjZWVuUm93KGZyb21Sb3cpfVxuICAgIHRvcFBpeGVsVG8gPSB7dG9wOiBAZ2V0UGl4ZWxSZWN0VG9wRm9yU2NlZW5Sb3codG9Sb3cpfVxuICAgIG9wdGlvbnMuc3RlcCA9IChuZXdUb3ApID0+IEBlZGl0b3IuZWxlbWVudC5zZXRTY3JvbGxUb3AobmV3VG9wKVxuICAgIG9wdGlvbnMuZHVyYXRpb24gPSBAZ2V0U21vb3RoU2Nyb2xsRHVhdGlvbigpXG4gICAgQHZpbVN0YXRlLnJlcXVlc3RTY3JvbGxBbmltYXRpb24odG9wUGl4ZWxGcm9tLCB0b3BQaXhlbFRvLCBvcHRpb25zKVxuXG4gIGdldEFtb3VudE9mUm93czogLT5cbiAgICBNYXRoLmNlaWwoQGFtb3VudE9mUGFnZSAqIEBlZGl0b3IuZ2V0Um93c1BlclBhZ2UoKSAqIEBnZXRDb3VudCgpKVxuXG4gIGdldEJ1ZmZlclJvdzogKGN1cnNvcikgLT5cbiAgICBzY3JlZW5Sb3cgPSBnZXRWYWxpZFZpbVNjcmVlblJvdyhAZWRpdG9yLCBjdXJzb3IuZ2V0U2NyZWVuUm93KCkgKyBAZ2V0QW1vdW50T2ZSb3dzKCkpXG4gICAgQGVkaXRvci5idWZmZXJSb3dGb3JTY3JlZW5Sb3coc2NyZWVuUm93KVxuXG4gIG1vdmVDdXJzb3I6IChjdXJzb3IpIC0+XG4gICAgYnVmZmVyUm93ID0gQGdldEJ1ZmZlclJvdyhjdXJzb3IpXG4gICAgQHNldEN1cnNvckJ1ZmZlclJvdyhjdXJzb3IsIEBnZXRCdWZmZXJSb3coY3Vyc29yKSwgYXV0b3Njcm9sbDogZmFsc2UpXG5cbiAgICBpZiBjdXJzb3IuaXNMYXN0Q3Vyc29yKClcbiAgICAgIGlmIEBpc1Ntb290aFNjcm9sbEVuYWJsZWQoKVxuICAgICAgICBAdmltU3RhdGUuZmluaXNoU2Nyb2xsQW5pbWF0aW9uKClcblxuICAgICAgZmlyc3RWaXNpYmlsZVNjcmVlblJvdyA9IEBlZGl0b3IuZ2V0Rmlyc3RWaXNpYmxlU2NyZWVuUm93KClcbiAgICAgIG5ld0ZpcnN0VmlzaWJpbGVCdWZmZXJSb3cgPSBAZWRpdG9yLmJ1ZmZlclJvd0ZvclNjcmVlblJvdyhmaXJzdFZpc2liaWxlU2NyZWVuUm93ICsgQGdldEFtb3VudE9mUm93cygpKVxuICAgICAgbmV3Rmlyc3RWaXNpYmlsZVNjcmVlblJvdyA9IEBlZGl0b3Iuc2NyZWVuUm93Rm9yQnVmZmVyUm93KG5ld0ZpcnN0VmlzaWJpbGVCdWZmZXJSb3cpXG4gICAgICBkb25lID0gPT5cbiAgICAgICAgQGVkaXRvci5zZXRGaXJzdFZpc2libGVTY3JlZW5Sb3cobmV3Rmlyc3RWaXNpYmlsZVNjcmVlblJvdylcbiAgICAgICAgIyBbRklYTUVdIHNvbWV0aW1lcywgc2Nyb2xsVG9wIGlzIG5vdCB1cGRhdGVkLCBjYWxsaW5nIHRoaXMgZml4LlxuICAgICAgICAjIEludmVzdGlnYXRlIGFuZCBmaW5kIGJldHRlciBhcHByb2FjaCB0aGVuIHJlbW92ZSB0aGlzIHdvcmthcm91bmQuXG4gICAgICAgIEBlZGl0b3IuZWxlbWVudC5jb21wb25lbnQudXBkYXRlU3luYygpXG5cbiAgICAgIGlmIEBpc1Ntb290aFNjcm9sbEVuYWJsZWQoKVxuICAgICAgICBAc21vb3RoU2Nyb2xsKGZpcnN0VmlzaWJpbGVTY3JlZW5Sb3csIG5ld0ZpcnN0VmlzaWJpbGVTY3JlZW5Sb3csIHtkb25lfSlcbiAgICAgIGVsc2VcbiAgICAgICAgZG9uZSgpXG5cblxuIyBrZXltYXA6IGN0cmwtZlxuY2xhc3MgU2Nyb2xsRnVsbFNjcmVlbkRvd24gZXh0ZW5kcyBTY3JvbGxcbiAgQGV4dGVuZCh0cnVlKVxuICBhbW91bnRPZlBhZ2U6ICsxXG5cbiMga2V5bWFwOiBjdHJsLWJcbmNsYXNzIFNjcm9sbEZ1bGxTY3JlZW5VcCBleHRlbmRzIFNjcm9sbFxuICBAZXh0ZW5kKClcbiAgYW1vdW50T2ZQYWdlOiAtMVxuXG4jIGtleW1hcDogY3RybC1kXG5jbGFzcyBTY3JvbGxIYWxmU2NyZWVuRG93biBleHRlbmRzIFNjcm9sbFxuICBAZXh0ZW5kKClcbiAgYW1vdW50T2ZQYWdlOiArMSAvIDJcblxuIyBrZXltYXA6IGN0cmwtdVxuY2xhc3MgU2Nyb2xsSGFsZlNjcmVlblVwIGV4dGVuZHMgU2Nyb2xsXG4gIEBleHRlbmQoKVxuICBhbW91bnRPZlBhZ2U6IC0xIC8gMlxuXG4jIEZpbmRcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBrZXltYXA6IGZcbmNsYXNzIEZpbmQgZXh0ZW5kcyBNb3Rpb25cbiAgQGV4dGVuZCgpXG4gIGJhY2t3YXJkczogZmFsc2VcbiAgaW5jbHVzaXZlOiB0cnVlXG4gIG9mZnNldDogMFxuICByZXF1aXJlSW5wdXQ6IHRydWVcblxuICBpbml0aWFsaXplOiAtPlxuICAgIHN1cGVyXG4gICAgQGZvY3VzSW5wdXQoKSB1bmxlc3MgQGlzQ29tcGxldGUoKVxuXG4gIGlzQmFja3dhcmRzOiAtPlxuICAgIEBiYWNrd2FyZHNcblxuICBnZXRQb2ludDogKGZyb21Qb2ludCkgLT5cbiAgICB7c3RhcnQsIGVuZH0gPSBAZWRpdG9yLmJ1ZmZlclJhbmdlRm9yQnVmZmVyUm93KGZyb21Qb2ludC5yb3cpXG5cbiAgICBvZmZzZXQgPSBpZiBAaXNCYWNrd2FyZHMoKSB0aGVuIEBvZmZzZXQgZWxzZSAtQG9mZnNldFxuICAgIHVuT2Zmc2V0ID0gLW9mZnNldCAqIEBpc1JlcGVhdGVkKClcbiAgICBpZiBAaXNCYWNrd2FyZHMoKVxuICAgICAgc2NhblJhbmdlID0gW3N0YXJ0LCBmcm9tUG9pbnQudHJhbnNsYXRlKFswLCB1bk9mZnNldF0pXVxuICAgICAgbWV0aG9kID0gJ2JhY2t3YXJkc1NjYW5JbkJ1ZmZlclJhbmdlJ1xuICAgIGVsc2VcbiAgICAgIHNjYW5SYW5nZSA9IFtmcm9tUG9pbnQudHJhbnNsYXRlKFswLCAxICsgdW5PZmZzZXRdKSwgZW5kXVxuICAgICAgbWV0aG9kID0gJ3NjYW5JbkJ1ZmZlclJhbmdlJ1xuXG4gICAgcG9pbnRzID0gW11cbiAgICBAZWRpdG9yW21ldGhvZF0gLy8vI3tfLmVzY2FwZVJlZ0V4cChAaW5wdXQpfS8vL2csIHNjYW5SYW5nZSwgKHtyYW5nZX0pIC0+XG4gICAgICBwb2ludHMucHVzaChyYW5nZS5zdGFydClcbiAgICBwb2ludHNbQGdldENvdW50KC0xKV0/LnRyYW5zbGF0ZShbMCwgb2Zmc2V0XSlcblxuICBtb3ZlQ3Vyc29yOiAoY3Vyc29yKSAtPlxuICAgIHBvaW50ID0gQGdldFBvaW50KGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpKVxuICAgIEBzZXRCdWZmZXJQb3NpdGlvblNhZmVseShjdXJzb3IsIHBvaW50KVxuICAgIEBnbG9iYWxTdGF0ZS5zZXQoJ2N1cnJlbnRGaW5kJywgdGhpcykgdW5sZXNzIEBpc1JlcGVhdGVkKClcblxuIyBrZXltYXA6IEZcbmNsYXNzIEZpbmRCYWNrd2FyZHMgZXh0ZW5kcyBGaW5kXG4gIEBleHRlbmQoKVxuICBpbmNsdXNpdmU6IGZhbHNlXG4gIGJhY2t3YXJkczogdHJ1ZVxuXG4jIGtleW1hcDogdFxuY2xhc3MgVGlsbCBleHRlbmRzIEZpbmRcbiAgQGV4dGVuZCgpXG4gIG9mZnNldDogMVxuXG4gIGdldFBvaW50OiAtPlxuICAgIEBwb2ludCA9IHN1cGVyXG4gICAgQG1vdmVTdWNjZWVkZWQgPSBAcG9pbnQ/XG4gICAgcmV0dXJuIEBwb2ludFxuXG4jIGtleW1hcDogVFxuY2xhc3MgVGlsbEJhY2t3YXJkcyBleHRlbmRzIFRpbGxcbiAgQGV4dGVuZCgpXG4gIGluY2x1c2l2ZTogZmFsc2VcbiAgYmFja3dhcmRzOiB0cnVlXG5cbiMgTWFya1xuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIGtleW1hcDogYFxuY2xhc3MgTW92ZVRvTWFyayBleHRlbmRzIE1vdGlvblxuICBAZXh0ZW5kKClcbiAganVtcDogdHJ1ZVxuICByZXF1aXJlSW5wdXQ6IHRydWVcbiAgaW5wdXQ6IG51bGwgIyBzZXQgd2hlbiBpbnN0YXRudGlhdGVkIHZpYSB2aW1TdGF0ZTo6bW92ZVRvTWFyaygpXG5cbiAgaW5pdGlhbGl6ZTogLT5cbiAgICBzdXBlclxuICAgIEBmb2N1c0lucHV0KCkgdW5sZXNzIEBpc0NvbXBsZXRlKClcblxuICBnZXRQb2ludDogLT5cbiAgICBAdmltU3RhdGUubWFyay5nZXQoQGdldElucHV0KCkpXG5cbiAgbW92ZUN1cnNvcjogKGN1cnNvcikgLT5cbiAgICBpZiBwb2ludCA9IEBnZXRQb2ludCgpXG4gICAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24ocG9pbnQpXG4gICAgICBjdXJzb3IuYXV0b3Njcm9sbChjZW50ZXI6IHRydWUpXG5cbiMga2V5bWFwOiAnXG5jbGFzcyBNb3ZlVG9NYXJrTGluZSBleHRlbmRzIE1vdmVUb01hcmtcbiAgQGV4dGVuZCgpXG4gIHdpc2U6ICdsaW5ld2lzZSdcblxuICBnZXRQb2ludDogLT5cbiAgICBpZiBwb2ludCA9IHN1cGVyXG4gICAgICBAZ2V0Rmlyc3RDaGFyYWN0ZXJQb3NpdGlvbkZvckJ1ZmZlclJvdyhwb2ludC5yb3cpXG5cbiMgRm9sZFxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBNb3ZlVG9QcmV2aW91c0ZvbGRTdGFydCBleHRlbmRzIE1vdGlvblxuICBAZXh0ZW5kKClcbiAgQGRlc2NyaXB0aW9uOiBcIk1vdmUgdG8gcHJldmlvdXMgZm9sZCBzdGFydFwiXG4gIHdpc2U6ICdjaGFyYWN0ZXJ3aXNlJ1xuICB3aGljaDogJ3N0YXJ0J1xuICBkaXJlY3Rpb246ICdwcmV2J1xuXG4gIGluaXRpYWxpemU6IC0+XG4gICAgc3VwZXJcbiAgICBAcm93cyA9IEBnZXRGb2xkUm93cyhAd2hpY2gpXG4gICAgQHJvd3MucmV2ZXJzZSgpIGlmIEBkaXJlY3Rpb24gaXMgJ3ByZXYnXG5cbiAgZ2V0Rm9sZFJvd3M6ICh3aGljaCkgLT5cbiAgICBpbmRleCA9IGlmIHdoaWNoIGlzICdzdGFydCcgdGhlbiAwIGVsc2UgMVxuICAgIHJvd3MgPSBnZXRDb2RlRm9sZFJvd1JhbmdlcyhAZWRpdG9yKS5tYXAgKHJvd1JhbmdlKSAtPlxuICAgICAgcm93UmFuZ2VbaW5kZXhdXG4gICAgXy5zb3J0QnkoXy51bmlxKHJvd3MpLCAocm93KSAtPiByb3cpXG5cbiAgZ2V0U2NhblJvd3M6IChjdXJzb3IpIC0+XG4gICAgY3Vyc29yUm93ID0gY3Vyc29yLmdldEJ1ZmZlclJvdygpXG4gICAgaXNWYWxpZFJvdyA9IHN3aXRjaCBAZGlyZWN0aW9uXG4gICAgICB3aGVuICdwcmV2JyB0aGVuIChyb3cpIC0+IHJvdyA8IGN1cnNvclJvd1xuICAgICAgd2hlbiAnbmV4dCcgdGhlbiAocm93KSAtPiByb3cgPiBjdXJzb3JSb3dcbiAgICBAcm93cy5maWx0ZXIoaXNWYWxpZFJvdylcblxuICBkZXRlY3RSb3c6IChjdXJzb3IpIC0+XG4gICAgQGdldFNjYW5Sb3dzKGN1cnNvcilbMF1cblxuICBtb3ZlQ3Vyc29yOiAoY3Vyc29yKSAtPlxuICAgIEBtb3ZlQ3Vyc29yQ291bnRUaW1lcyBjdXJzb3IsID0+XG4gICAgICBpZiAocm93ID0gQGRldGVjdFJvdyhjdXJzb3IpKT9cbiAgICAgICAgbW92ZUN1cnNvclRvRmlyc3RDaGFyYWN0ZXJBdFJvdyhjdXJzb3IsIHJvdylcblxuY2xhc3MgTW92ZVRvTmV4dEZvbGRTdGFydCBleHRlbmRzIE1vdmVUb1ByZXZpb3VzRm9sZFN0YXJ0XG4gIEBleHRlbmQoKVxuICBAZGVzY3JpcHRpb246IFwiTW92ZSB0byBuZXh0IGZvbGQgc3RhcnRcIlxuICBkaXJlY3Rpb246ICduZXh0J1xuXG5jbGFzcyBNb3ZlVG9QcmV2aW91c0ZvbGRTdGFydFdpdGhTYW1lSW5kZW50IGV4dGVuZHMgTW92ZVRvUHJldmlvdXNGb2xkU3RhcnRcbiAgQGV4dGVuZCgpXG4gIEBkZXNjcmlwdGlvbjogXCJNb3ZlIHRvIHByZXZpb3VzIHNhbWUtaW5kZW50ZWQgZm9sZCBzdGFydFwiXG4gIGRldGVjdFJvdzogKGN1cnNvcikgLT5cbiAgICBiYXNlSW5kZW50TGV2ZWwgPSBAZ2V0SW5kZW50TGV2ZWxGb3JCdWZmZXJSb3coY3Vyc29yLmdldEJ1ZmZlclJvdygpKVxuICAgIGZvciByb3cgaW4gQGdldFNjYW5Sb3dzKGN1cnNvcilcbiAgICAgIGlmIEBnZXRJbmRlbnRMZXZlbEZvckJ1ZmZlclJvdyhyb3cpIGlzIGJhc2VJbmRlbnRMZXZlbFxuICAgICAgICByZXR1cm4gcm93XG4gICAgbnVsbFxuXG5jbGFzcyBNb3ZlVG9OZXh0Rm9sZFN0YXJ0V2l0aFNhbWVJbmRlbnQgZXh0ZW5kcyBNb3ZlVG9QcmV2aW91c0ZvbGRTdGFydFdpdGhTYW1lSW5kZW50XG4gIEBleHRlbmQoKVxuICBAZGVzY3JpcHRpb246IFwiTW92ZSB0byBuZXh0IHNhbWUtaW5kZW50ZWQgZm9sZCBzdGFydFwiXG4gIGRpcmVjdGlvbjogJ25leHQnXG5cbmNsYXNzIE1vdmVUb1ByZXZpb3VzRm9sZEVuZCBleHRlbmRzIE1vdmVUb1ByZXZpb3VzRm9sZFN0YXJ0XG4gIEBleHRlbmQoKVxuICBAZGVzY3JpcHRpb246IFwiTW92ZSB0byBwcmV2aW91cyBmb2xkIGVuZFwiXG4gIHdoaWNoOiAnZW5kJ1xuXG5jbGFzcyBNb3ZlVG9OZXh0Rm9sZEVuZCBleHRlbmRzIE1vdmVUb1ByZXZpb3VzRm9sZEVuZFxuICBAZXh0ZW5kKClcbiAgQGRlc2NyaXB0aW9uOiBcIk1vdmUgdG8gbmV4dCBmb2xkIGVuZFwiXG4gIGRpcmVjdGlvbjogJ25leHQnXG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgTW92ZVRvUHJldmlvdXNGdW5jdGlvbiBleHRlbmRzIE1vdmVUb1ByZXZpb3VzRm9sZFN0YXJ0XG4gIEBleHRlbmQoKVxuICBAZGVzY3JpcHRpb246IFwiTW92ZSB0byBwcmV2aW91cyBmdW5jdGlvblwiXG4gIGRpcmVjdGlvbjogJ3ByZXYnXG4gIGRldGVjdFJvdzogKGN1cnNvcikgLT5cbiAgICBfLmRldGVjdCBAZ2V0U2NhblJvd3MoY3Vyc29yKSwgKHJvdykgPT5cbiAgICAgIGlzSW5jbHVkZUZ1bmN0aW9uU2NvcGVGb3JSb3coQGVkaXRvciwgcm93KVxuXG5jbGFzcyBNb3ZlVG9OZXh0RnVuY3Rpb24gZXh0ZW5kcyBNb3ZlVG9QcmV2aW91c0Z1bmN0aW9uXG4gIEBleHRlbmQoKVxuICBAZGVzY3JpcHRpb246IFwiTW92ZSB0byBuZXh0IGZ1bmN0aW9uXCJcbiAgZGlyZWN0aW9uOiAnbmV4dCdcblxuIyBTY29wZSBiYXNlZFxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBNb3ZlVG9Qb3NpdGlvbkJ5U2NvcGUgZXh0ZW5kcyBNb3Rpb25cbiAgQGV4dGVuZChmYWxzZSlcbiAgZGlyZWN0aW9uOiAnYmFja3dhcmQnXG4gIHNjb3BlOiAnLidcblxuICBnZXRQb2ludDogKGZyb21Qb2ludCkgLT5cbiAgICBkZXRlY3RTY29wZVN0YXJ0UG9zaXRpb25Gb3JTY29wZShAZWRpdG9yLCBmcm9tUG9pbnQsIEBkaXJlY3Rpb24sIEBzY29wZSlcblxuICBtb3ZlQ3Vyc29yOiAoY3Vyc29yKSAtPlxuICAgIEBtb3ZlQ3Vyc29yQ291bnRUaW1lcyBjdXJzb3IsID0+XG4gICAgICBAc2V0QnVmZmVyUG9zaXRpb25TYWZlbHkoY3Vyc29yLCBAZ2V0UG9pbnQoY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKCkpKVxuXG5jbGFzcyBNb3ZlVG9QcmV2aW91c1N0cmluZyBleHRlbmRzIE1vdmVUb1Bvc2l0aW9uQnlTY29wZVxuICBAZXh0ZW5kKClcbiAgQGRlc2NyaXB0aW9uOiBcIk1vdmUgdG8gcHJldmlvdXMgc3RyaW5nKHNlYXJjaGVkIGJ5IGBzdHJpbmcuYmVnaW5gIHNjb3BlKVwiXG4gIGRpcmVjdGlvbjogJ2JhY2t3YXJkJ1xuICBzY29wZTogJ3N0cmluZy5iZWdpbidcblxuY2xhc3MgTW92ZVRvTmV4dFN0cmluZyBleHRlbmRzIE1vdmVUb1ByZXZpb3VzU3RyaW5nXG4gIEBleHRlbmQoKVxuICBAZGVzY3JpcHRpb246IFwiTW92ZSB0byBuZXh0IHN0cmluZyhzZWFyY2hlZCBieSBgc3RyaW5nLmJlZ2luYCBzY29wZSlcIlxuICBkaXJlY3Rpb246ICdmb3J3YXJkJ1xuXG5jbGFzcyBNb3ZlVG9QcmV2aW91c051bWJlciBleHRlbmRzIE1vdmVUb1Bvc2l0aW9uQnlTY29wZVxuICBAZXh0ZW5kKClcbiAgZGlyZWN0aW9uOiAnYmFja3dhcmQnXG4gIEBkZXNjcmlwdGlvbjogXCJNb3ZlIHRvIHByZXZpb3VzIG51bWJlcihzZWFyY2hlZCBieSBgY29uc3RhbnQubnVtZXJpY2Agc2NvcGUpXCJcbiAgc2NvcGU6ICdjb25zdGFudC5udW1lcmljJ1xuXG5jbGFzcyBNb3ZlVG9OZXh0TnVtYmVyIGV4dGVuZHMgTW92ZVRvUHJldmlvdXNOdW1iZXJcbiAgQGV4dGVuZCgpXG4gIEBkZXNjcmlwdGlvbjogXCJNb3ZlIHRvIG5leHQgbnVtYmVyKHNlYXJjaGVkIGJ5IGBjb25zdGFudC5udW1lcmljYCBzY29wZSlcIlxuICBkaXJlY3Rpb246ICdmb3J3YXJkJ1xuXG5jbGFzcyBNb3ZlVG9OZXh0T2NjdXJyZW5jZSBleHRlbmRzIE1vdGlvblxuICBAZXh0ZW5kKClcbiAgIyBFbnN1cmUgdGhpcyBjb21tYW5kIGlzIGF2YWlsYWJsZSB3aGVuIGhhcy1vY2N1cnJlbmNlXG4gIEBjb21tYW5kU2NvcGU6ICdhdG9tLXRleHQtZWRpdG9yLnZpbS1tb2RlLXBsdXMuaGFzLW9jY3VycmVuY2UnXG4gIGp1bXA6IHRydWVcbiAgZGlyZWN0aW9uOiAnbmV4dCdcblxuICBnZXRSYW5nZXM6IC0+XG4gICAgQHZpbVN0YXRlLm9jY3VycmVuY2VNYW5hZ2VyLmdldE1hcmtlcnMoKS5tYXAgKG1hcmtlcikgLT5cbiAgICAgIG1hcmtlci5nZXRCdWZmZXJSYW5nZSgpXG5cbiAgZXhlY3V0ZTogLT5cbiAgICBAcmFuZ2VzID0gQGdldFJhbmdlcygpXG4gICAgc3VwZXJcblxuICBtb3ZlQ3Vyc29yOiAoY3Vyc29yKSAtPlxuICAgIGluZGV4ID0gQGdldEluZGV4KGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpKVxuICAgIGlmIGluZGV4P1xuICAgICAgb2Zmc2V0ID0gc3dpdGNoIEBkaXJlY3Rpb25cbiAgICAgICAgd2hlbiAnbmV4dCcgdGhlbiBAZ2V0Q291bnQoLTEpXG4gICAgICAgIHdoZW4gJ3ByZXZpb3VzJyB0aGVuIC1AZ2V0Q291bnQoLTEpXG4gICAgICByYW5nZSA9IEByYW5nZXNbZ2V0SW5kZXgoaW5kZXggKyBvZmZzZXQsIEByYW5nZXMpXVxuICAgICAgcG9pbnQgPSByYW5nZS5zdGFydFxuXG4gICAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24ocG9pbnQsIGF1dG9zY3JvbGw6IGZhbHNlKVxuXG4gICAgICBpZiBjdXJzb3IuaXNMYXN0Q3Vyc29yKClcbiAgICAgICAgQGVkaXRvci51bmZvbGRCdWZmZXJSb3cocG9pbnQucm93KVxuICAgICAgICBzbWFydFNjcm9sbFRvQnVmZmVyUG9zaXRpb24oQGVkaXRvciwgcG9pbnQpXG5cbiAgICAgIGlmIEBnZXRDb25maWcoJ2ZsYXNoT25Nb3ZlVG9PY2N1cnJlbmNlJylcbiAgICAgICAgQHZpbVN0YXRlLmZsYXNoKHJhbmdlLCB0eXBlOiAnc2VhcmNoJylcblxuICBnZXRJbmRleDogKGZyb21Qb2ludCkgLT5cbiAgICBmb3IgcmFuZ2UsIGkgaW4gQHJhbmdlcyB3aGVuIHJhbmdlLnN0YXJ0LmlzR3JlYXRlclRoYW4oZnJvbVBvaW50KVxuICAgICAgcmV0dXJuIGlcbiAgICAwXG5cbmNsYXNzIE1vdmVUb1ByZXZpb3VzT2NjdXJyZW5jZSBleHRlbmRzIE1vdmVUb05leHRPY2N1cnJlbmNlXG4gIEBleHRlbmQoKVxuICBkaXJlY3Rpb246ICdwcmV2aW91cydcblxuICBnZXRJbmRleDogKGZyb21Qb2ludCkgLT5cbiAgICBmb3IgcmFuZ2UsIGkgaW4gQHJhbmdlcyBieSAtMSB3aGVuIHJhbmdlLmVuZC5pc0xlc3NUaGFuKGZyb21Qb2ludClcbiAgICAgIHJldHVybiBpXG4gICAgQHJhbmdlcy5sZW5ndGggLSAxXG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBrZXltYXA6ICVcbmNsYXNzIE1vdmVUb1BhaXIgZXh0ZW5kcyBNb3Rpb25cbiAgQGV4dGVuZCgpXG4gIGluY2x1c2l2ZTogdHJ1ZVxuICBqdW1wOiB0cnVlXG4gIG1lbWJlcjogWydQYXJlbnRoZXNpcycsICdDdXJseUJyYWNrZXQnLCAnU3F1YXJlQnJhY2tldCcsICdBbmdsZUJyYWNrZXQnXVxuXG4gIG1vdmVDdXJzb3I6IChjdXJzb3IpIC0+XG4gICAgQHNldEJ1ZmZlclBvc2l0aW9uU2FmZWx5KGN1cnNvciwgQGdldFBvaW50KGN1cnNvcikpXG5cbiAgZ2V0UG9pbnRGb3JUYWc6IChwb2ludCkgLT5cbiAgICBwYWlySW5mbyA9IEBuZXcoXCJBVGFnXCIpLmdldFBhaXJJbmZvKHBvaW50KVxuICAgIHJldHVybiBudWxsIHVubGVzcyBwYWlySW5mbz9cbiAgICB7b3BlblJhbmdlLCBjbG9zZVJhbmdlfSA9IHBhaXJJbmZvXG4gICAgb3BlblJhbmdlID0gb3BlblJhbmdlLnRyYW5zbGF0ZShbMCwgKzFdLCBbMCwgLTFdKVxuICAgIGNsb3NlUmFuZ2UgPSBjbG9zZVJhbmdlLnRyYW5zbGF0ZShbMCwgKzFdLCBbMCwgLTFdKVxuICAgIHJldHVybiBjbG9zZVJhbmdlLnN0YXJ0IGlmIG9wZW5SYW5nZS5jb250YWluc1BvaW50KHBvaW50KSBhbmQgKG5vdCBwb2ludC5pc0VxdWFsKG9wZW5SYW5nZS5lbmQpKVxuICAgIHJldHVybiBvcGVuUmFuZ2Uuc3RhcnQgaWYgY2xvc2VSYW5nZS5jb250YWluc1BvaW50KHBvaW50KSBhbmQgKG5vdCBwb2ludC5pc0VxdWFsKGNsb3NlUmFuZ2UuZW5kKSlcblxuICBnZXRQb2ludDogKGN1cnNvcikgLT5cbiAgICBjdXJzb3JQb3NpdGlvbiA9IGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXG4gICAgY3Vyc29yUm93ID0gY3Vyc29yUG9zaXRpb24ucm93XG4gICAgcmV0dXJuIHBvaW50IGlmIHBvaW50ID0gQGdldFBvaW50Rm9yVGFnKGN1cnNvclBvc2l0aW9uKVxuXG4gICAgIyBBQW55UGFpckFsbG93Rm9yd2FyZGluZyByZXR1cm4gZm9yd2FyZGluZyByYW5nZSBvciBlbmNsb3NpbmcgcmFuZ2UuXG4gICAgcmFuZ2UgPSBAbmV3KFwiQUFueVBhaXJBbGxvd0ZvcndhcmRpbmdcIiwge0BtZW1iZXJ9KS5nZXRSYW5nZShjdXJzb3Iuc2VsZWN0aW9uKVxuICAgIHJldHVybiBudWxsIHVubGVzcyByYW5nZT9cbiAgICB7c3RhcnQsIGVuZH0gPSByYW5nZVxuICAgIGlmIChzdGFydC5yb3cgaXMgY3Vyc29yUm93KSBhbmQgc3RhcnQuaXNHcmVhdGVyVGhhbk9yRXF1YWwoY3Vyc29yUG9zaXRpb24pXG4gICAgICAjIEZvcndhcmRpbmcgcmFuZ2UgZm91bmRcbiAgICAgIGVuZC50cmFuc2xhdGUoWzAsIC0xXSlcbiAgICBlbHNlIGlmIGVuZC5yb3cgaXMgY3Vyc29yUG9zaXRpb24ucm93XG4gICAgICAjIEVuY2xvc2luZyByYW5nZSB3YXMgcmV0dXJuZWRcbiAgICAgICMgV2UgbW92ZSB0byBzdGFydCggb3Blbi1wYWlyICkgb25seSB3aGVuIGNsb3NlLXBhaXIgd2FzIGF0IHNhbWUgcm93IGFzIGN1cnNvci1yb3cuXG4gICAgICBzdGFydFxuIl19
