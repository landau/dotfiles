(function() {
  var Base, CurrentSelection, Find, FindBackwards, Motion, MoveDown, MoveDownScreen, MoveDownToEdge, MoveDownWrap, MoveLeft, MoveRight, MoveRightBufferColumn, MoveToBeginningOfLine, MoveToBottomOfScreen, MoveToColumn, MoveToEndOfAlphanumericWord, MoveToEndOfSmartWord, MoveToEndOfSubword, MoveToEndOfWholeWord, MoveToEndOfWord, MoveToFirstCharacterOfLine, MoveToFirstCharacterOfLineAndDown, MoveToFirstCharacterOfLineDown, MoveToFirstCharacterOfLineUp, MoveToFirstLine, MoveToLastCharacterOfLine, MoveToLastLine, MoveToLastNonblankCharacterOfLineAndDown, MoveToLineByPercent, MoveToMark, MoveToMarkLine, MoveToMiddleOfScreen, MoveToNextAlphanumericWord, MoveToNextFoldEnd, MoveToNextFoldStart, MoveToNextFoldStartWithSameIndent, MoveToNextFunction, MoveToNextNumber, MoveToNextOccurrence, MoveToNextParagraph, MoveToNextSentence, MoveToNextSentenceSkipBlankRow, MoveToNextSmartWord, MoveToNextString, MoveToNextSubword, MoveToNextWholeWord, MoveToNextWord, MoveToPair, MoveToPositionByScope, MoveToPreviousAlphanumericWord, MoveToPreviousEndOfWholeWord, MoveToPreviousEndOfWord, MoveToPreviousFoldEnd, MoveToPreviousFoldStart, MoveToPreviousFoldStartWithSameIndent, MoveToPreviousFunction, MoveToPreviousNumber, MoveToPreviousOccurrence, MoveToPreviousParagraph, MoveToPreviousSentence, MoveToPreviousSentenceSkipBlankRow, MoveToPreviousSmartWord, MoveToPreviousString, MoveToPreviousSubword, MoveToPreviousWholeWord, MoveToPreviousWord, MoveToRelativeLine, MoveToRelativeLineMinimumOne, MoveToTopOfScreen, MoveUp, MoveUpScreen, MoveUpToEdge, MoveUpWrap, Point, Range, Scroll, ScrollFullScreenDown, ScrollFullScreenUp, ScrollHalfScreenDown, ScrollHalfScreenUp, Till, TillBackwards, _, detectScopeStartPositionForScope, findRangeInBufferRow, getBufferRows, getCodeFoldRowRanges, getEndOfLineForBufferRow, getFirstVisibleScreenRow, getIndex, getLargestFoldRangeContainsBufferRow, getLastVisibleScreenRow, getTextInScreenRange, getValidVimBufferRow, getValidVimScreenRow, isEmptyRow, isIncludeFunctionScopeForRow, limitNumber, moveCursorDownScreen, moveCursorLeft, moveCursorRight, moveCursorToFirstCharacterAtRow, moveCursorToNextNonWhitespace, moveCursorUpScreen, pointIsAtEndOfLineAtNonEmptyRow, pointIsAtVimEndOfFile, pointIsOnWhiteSpace, ref, ref1, setBufferColumn, setBufferRow, smartScrollToBufferPosition, sortRanges,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  _ = require('underscore-plus');

  ref = require('atom'), Point = ref.Point, Range = ref.Range;

  ref1 = require('./utils'), moveCursorLeft = ref1.moveCursorLeft, moveCursorRight = ref1.moveCursorRight, moveCursorUpScreen = ref1.moveCursorUpScreen, moveCursorDownScreen = ref1.moveCursorDownScreen, pointIsAtVimEndOfFile = ref1.pointIsAtVimEndOfFile, getFirstVisibleScreenRow = ref1.getFirstVisibleScreenRow, getLastVisibleScreenRow = ref1.getLastVisibleScreenRow, getValidVimScreenRow = ref1.getValidVimScreenRow, getValidVimBufferRow = ref1.getValidVimBufferRow, moveCursorToFirstCharacterAtRow = ref1.moveCursorToFirstCharacterAtRow, sortRanges = ref1.sortRanges, pointIsOnWhiteSpace = ref1.pointIsOnWhiteSpace, moveCursorToNextNonWhitespace = ref1.moveCursorToNextNonWhitespace, isEmptyRow = ref1.isEmptyRow, getCodeFoldRowRanges = ref1.getCodeFoldRowRanges, getLargestFoldRangeContainsBufferRow = ref1.getLargestFoldRangeContainsBufferRow, isIncludeFunctionScopeForRow = ref1.isIncludeFunctionScopeForRow, detectScopeStartPositionForScope = ref1.detectScopeStartPositionForScope, getBufferRows = ref1.getBufferRows, getTextInScreenRange = ref1.getTextInScreenRange, setBufferRow = ref1.setBufferRow, setBufferColumn = ref1.setBufferColumn, limitNumber = ref1.limitNumber, getIndex = ref1.getIndex, smartScrollToBufferPosition = ref1.smartScrollToBufferPosition, pointIsAtEndOfLineAtNonEmptyRow = ref1.pointIsAtEndOfLineAtNonEmptyRow, getEndOfLineForBufferRow = ref1.getEndOfLineForBufferRow, findRangeInBufferRow = ref1.findRangeInBufferRow;

  Base = require('./base');

  Motion = (function(superClass) {
    extend(Motion, superClass);

    Motion.extend(false);

    Motion.operationKind = 'motion';

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
          $selection = this.swrap(selection);
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
          return this.blockwiseSelectionExtent = this.swrap(cursor.selection).getBlockwiseSelectionExtent();
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
          var allowWrap, cursorPosition;
          cursorPosition = cursor.getBufferPosition();
          _this.editor.unfoldBufferRow(cursorPosition.row);
          allowWrap = _this.canWrapToNextLine(cursor);
          moveCursorRight(cursor);
          if (cursor.isAtEndOfLine() && allowWrap && !pointIsAtVimEndOfFile(_this.editor, cursorPosition)) {
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
      var cursorPosition, isAsTargetExceptSelect, wasOnWhiteSpace;
      cursorPosition = cursor.getBufferPosition();
      if (pointIsAtVimEndOfFile(this.editor, cursorPosition)) {
        return;
      }
      wasOnWhiteSpace = pointIsOnWhiteSpace(this.editor, cursorPosition);
      isAsTargetExceptSelect = this.isAsTargetExceptSelect();
      return this.moveCursorCountTimes(cursor, (function(_this) {
        return function(arg) {
          var isFinal, pattern, point, ref2;
          isFinal = arg.isFinal;
          cursorPosition = cursor.getBufferPosition();
          if (isEmptyRow(_this.editor, cursorPosition.row) && isAsTargetExceptSelect) {
            point = cursorPosition.traverse([1, 0]);
          } else {
            pattern = (ref2 = _this.wordRegex) != null ? ref2 : cursor.wordRegExp();
            point = _this.getPoint(pattern, cursorPosition);
            if (isFinal && isAsTargetExceptSelect) {
              if (_this.operator.is('Change') && (!wasOnWhiteSpace)) {
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
        var point;
        point = cursor.getBufferPosition();
        if (point.row !== 0) {
          return cursor.setBufferPosition(point.translate([-1, 0]));
        }
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
      this.moveCursorCountTimes(cursor, (function(_this) {
        return function() {
          var point;
          point = cursor.getBufferPosition();
          if (_this.getVimLastBufferRow() !== point.row) {
            return cursor.setBufferPosition(point.translate([+1, 0]));
          }
        };
      })(this));
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
      var count, row;
      row = this.getFoldEndRowForRow(cursor.getBufferRow());
      count = this.getCount(-1);
      while (count > 0) {
        row = this.getFoldEndRowForRow(row + 1);
        count--;
      }
      return setBufferRow(cursor, row);
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

    Scroll.prototype.smoothScroll = function(fromRow, toRow, done) {
      var duration, step, topPixelFrom, topPixelTo;
      topPixelFrom = {
        top: this.getPixelRectTopForSceenRow(fromRow)
      };
      topPixelTo = {
        top: this.getPixelRectTopForSceenRow(toRow)
      };
      step = (function(_this) {
        return function(newTop) {
          if (_this.editor.element.component != null) {
            _this.editor.element.component.setScrollTop(newTop);
            return _this.editor.element.component.updateSync();
          }
        };
      })(this);
      duration = this.getSmoothScrollDuation();
      return this.vimState.requestScrollAnimation(topPixelFrom, topPixelTo, {
        duration: duration,
        step: step,
        done: done
      });
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
            var ref2;
            _this.editor.setFirstVisibleScreenRow(newFirstVisibileScreenRow);
            return (ref2 = _this.editor.element.component) != null ? ref2.updateSync() : void 0;
          };
        })(this);
        if (this.isSmoothScrollEnabled()) {
          return this.smoothScroll(firstVisibileScreenRow, newFirstVisibileScreenRow, done);
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
      unOffset = -offset * this.repeated;
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
      if (!this.repeated) {
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
      return this.vimState.mark.get(this.input);
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

    MoveToPair.prototype.member = ['Parenthesis', 'CurlyBracket', 'SquareBracket'];

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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvbW90aW9uLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsMndFQUFBO0lBQUE7OztFQUFBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVI7O0VBQ0osTUFBaUIsT0FBQSxDQUFRLE1BQVIsQ0FBakIsRUFBQyxpQkFBRCxFQUFROztFQUVSLE9BeUJJLE9BQUEsQ0FBUSxTQUFSLENBekJKLEVBQ0Usb0NBREYsRUFDa0Isc0NBRGxCLEVBRUUsNENBRkYsRUFFc0IsZ0RBRnRCLEVBR0Usa0RBSEYsRUFJRSx3REFKRixFQUk0QixzREFKNUIsRUFLRSxnREFMRixFQUt3QixnREFMeEIsRUFNRSxzRUFORixFQU9FLDRCQVBGLEVBUUUsOENBUkYsRUFTRSxrRUFURixFQVVFLDRCQVZGLEVBV0UsZ0RBWEYsRUFZRSxnRkFaRixFQWFFLGdFQWJGLEVBY0Usd0VBZEYsRUFlRSxrQ0FmRixFQWdCRSxnREFoQkYsRUFpQkUsZ0NBakJGLEVBa0JFLHNDQWxCRixFQW1CRSw4QkFuQkYsRUFvQkUsd0JBcEJGLEVBcUJFLDhEQXJCRixFQXNCRSxzRUF0QkYsRUF1QkUsd0RBdkJGLEVBd0JFOztFQUdGLElBQUEsR0FBTyxPQUFBLENBQVEsUUFBUjs7RUFFRDs7O0lBQ0osTUFBQyxDQUFBLE1BQUQsQ0FBUSxLQUFSOztJQUNBLE1BQUMsQ0FBQSxhQUFELEdBQWdCOztxQkFDaEIsU0FBQSxHQUFXOztxQkFDWCxJQUFBLEdBQU07O3FCQUNOLElBQUEsR0FBTTs7cUJBQ04sY0FBQSxHQUFnQjs7cUJBQ2hCLGFBQUEsR0FBZTs7cUJBQ2YscUJBQUEsR0FBdUI7O0lBRVYsZ0JBQUE7TUFDWCx5Q0FBQSxTQUFBO01BRUEsSUFBRyxJQUFDLENBQUEsSUFBRCxLQUFTLFFBQVo7UUFDRSxJQUFDLENBQUEsSUFBRCxHQUFRLElB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QSxNQUFGO09BQWhDLENBQTBDLENBQUMsUUFBM0MsQ0FBb0QsTUFBTSxDQUFDLFNBQTNEO01BQ1IsSUFBbUIsYUFBbkI7QUFBQSxlQUFPLEtBQVA7O01BQ0MsbUJBQUQsRUFBUTtNQUNSLElBQUcsQ0FBQyxLQUFLLENBQUMsR0FBTixLQUFhLFNBQWQsQ0FBQSxJQUE2QixLQUFLLENBQUMsb0JBQU4sQ0FBMkIsY0FBM0IsQ0FBaEM7ZUFFRSxHQUFHLENBQUMsU0FBSixDQUFjLENBQUMsQ0FBRCxFQUFJLENBQUMsQ0FBTCxDQUFkLEVBRkY7T0FBQSxNQUdLLElBQUcsR0FBRyxDQUFDLEdBQUosS0FBVyxjQUFjLENBQUMsR0FBN0I7ZUFHSCxNQUhHOztJQVpHOzs7O0tBbEJhO0FBMWxDekIiLCJzb3VyY2VzQ29udGVudCI6WyJfID0gcmVxdWlyZSAndW5kZXJzY29yZS1wbHVzJ1xue1BvaW50LCBSYW5nZX0gPSByZXF1aXJlICdhdG9tJ1xuXG57XG4gIG1vdmVDdXJzb3JMZWZ0LCBtb3ZlQ3Vyc29yUmlnaHRcbiAgbW92ZUN1cnNvclVwU2NyZWVuLCBtb3ZlQ3Vyc29yRG93blNjcmVlblxuICBwb2ludElzQXRWaW1FbmRPZkZpbGVcbiAgZ2V0Rmlyc3RWaXNpYmxlU2NyZWVuUm93LCBnZXRMYXN0VmlzaWJsZVNjcmVlblJvd1xuICBnZXRWYWxpZFZpbVNjcmVlblJvdywgZ2V0VmFsaWRWaW1CdWZmZXJSb3dcbiAgbW92ZUN1cnNvclRvRmlyc3RDaGFyYWN0ZXJBdFJvd1xuICBzb3J0UmFuZ2VzXG4gIHBvaW50SXNPbldoaXRlU3BhY2VcbiAgbW92ZUN1cnNvclRvTmV4dE5vbldoaXRlc3BhY2VcbiAgaXNFbXB0eVJvd1xuICBnZXRDb2RlRm9sZFJvd1Jhbmdlc1xuICBnZXRMYXJnZXN0Rm9sZFJhbmdlQ29udGFpbnNCdWZmZXJSb3dcbiAgaXNJbmNsdWRlRnVuY3Rpb25TY29wZUZvclJvd1xuICBkZXRlY3RTY29wZVN0YXJ0UG9zaXRpb25Gb3JTY29wZVxuICBnZXRCdWZmZXJSb3dzXG4gIGdldFRleHRJblNjcmVlblJhbmdlXG4gIHNldEJ1ZmZlclJvd1xuICBzZXRCdWZmZXJDb2x1bW5cbiAgbGltaXROdW1iZXJcbiAgZ2V0SW5kZXhcbiAgc21hcnRTY3JvbGxUb0J1ZmZlclBvc2l0aW9uXG4gIHBvaW50SXNBdEVuZE9mTGluZUF0Tm9uRW1wdHlSb3dcbiAgZ2V0RW5kT2ZMaW5lRm9yQnVmZmVyUm93XG4gIGZpbmRSYW5nZUluQnVmZmVyUm93XG59ID0gcmVxdWlyZSAnLi91dGlscydcblxuQmFzZSA9IHJlcXVpcmUgJy4vYmFzZSdcblxuY2xhc3MgTW90aW9uIGV4dGVuZHMgQmFzZVxuICBAZXh0ZW5kKGZhbHNlKVxuICBAb3BlcmF0aW9uS2luZDogJ21vdGlvbidcbiAgaW5jbHVzaXZlOiBmYWxzZVxuICB3aXNlOiAnY2hhcmFjdGVyd2lzZSdcbiAganVtcDogZmFsc2VcbiAgdmVydGljYWxNb3Rpb246IGZhbHNlXG4gIG1vdmVTdWNjZWVkZWQ6IG51bGxcbiAgbW92ZVN1Y2Nlc3NPbkxpbmV3aXNlOiBmYWxzZVxuXG4gIGNvbnN0cnVjdG9yOiAtPlxuICAgIHN1cGVyXG5cbiAgICBpZiBAbW9kZSBpcyAndmlzdWFsJ1xuICAgICAgQHdpc2UgPSBAc3VibW9kZVxuICAgIEBpbml0aWFsaXplKClcblxuICBpc0xpbmV3aXNlOiAtPiBAd2lzZSBpcyAnbGluZXdpc2UnXG4gIGlzQmxvY2t3aXNlOiAtPiBAd2lzZSBpcyAnYmxvY2t3aXNlJ1xuXG4gIGZvcmNlV2lzZTogKHdpc2UpIC0+XG4gICAgaWYgd2lzZSBpcyAnY2hhcmFjdGVyd2lzZSdcbiAgICAgIGlmIEB3aXNlIGlzICdsaW5ld2lzZSdcbiAgICAgICAgQGluY2x1c2l2ZSA9IGZhbHNlXG4gICAgICBlbHNlXG4gICAgICAgIEBpbmNsdXNpdmUgPSBub3QgQGluY2x1c2l2ZVxuICAgIEB3aXNlID0gd2lzZVxuXG4gIHNldEJ1ZmZlclBvc2l0aW9uU2FmZWx5OiAoY3Vyc29yLCBwb2ludCkgLT5cbiAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24ocG9pbnQpIGlmIHBvaW50P1xuXG4gIHNldFNjcmVlblBvc2l0aW9uU2FmZWx5OiAoY3Vyc29yLCBwb2ludCkgLT5cbiAgICBjdXJzb3Iuc2V0U2NyZWVuUG9zaXRpb24ocG9pbnQpIGlmIHBvaW50P1xuXG4gIG1vdmVXaXRoU2F2ZUp1bXA6IChjdXJzb3IpIC0+XG4gICAgaWYgY3Vyc29yLmlzTGFzdEN1cnNvcigpIGFuZCBAanVtcFxuICAgICAgY3Vyc29yUG9zaXRpb24gPSBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuXG4gICAgQG1vdmVDdXJzb3IoY3Vyc29yKVxuXG4gICAgaWYgY3Vyc29yUG9zaXRpb24/IGFuZCBub3QgY3Vyc29yUG9zaXRpb24uaXNFcXVhbChjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKSlcbiAgICAgIEB2aW1TdGF0ZS5tYXJrLnNldCgnYCcsIGN1cnNvclBvc2l0aW9uKVxuICAgICAgQHZpbVN0YXRlLm1hcmsuc2V0KFwiJ1wiLCBjdXJzb3JQb3NpdGlvbilcblxuICBleGVjdXRlOiAtPlxuICAgIGlmIEBvcGVyYXRvcj9cbiAgICAgIEBzZWxlY3QoKVxuICAgIGVsc2VcbiAgICAgIEBtb3ZlV2l0aFNhdmVKdW1wKGN1cnNvcikgZm9yIGN1cnNvciBpbiBAZWRpdG9yLmdldEN1cnNvcnMoKVxuICAgIEBlZGl0b3IubWVyZ2VDdXJzb3JzKClcbiAgICBAZWRpdG9yLm1lcmdlSW50ZXJzZWN0aW5nU2VsZWN0aW9ucygpXG5cbiAgIyBOT1RFOiBNb2RpZnkgc2VsZWN0aW9uIGJ5IG1vZHRpb24sIHNlbGVjdGlvbiBpcyBhbHJlYWR5IFwibm9ybWFsaXplZFwiIGJlZm9yZSB0aGlzIGZ1bmN0aW9uIGlzIGNhbGxlZC5cbiAgc2VsZWN0OiAtPlxuICAgIGlzT3JXYXNWaXN1YWwgPSBAbW9kZSBpcyAndmlzdWFsJyBvciBAaXMoJ0N1cnJlbnRTZWxlY3Rpb24nKSAjIG5lZWQgdG8gY2FyZSB3YXMgdmlzdWFsIGZvciBgLmAgcmVwZWF0ZWQuXG4gICAgZm9yIHNlbGVjdGlvbiBpbiBAZWRpdG9yLmdldFNlbGVjdGlvbnMoKVxuICAgICAgc2VsZWN0aW9uLm1vZGlmeVNlbGVjdGlvbiA9PlxuICAgICAgICBAbW92ZVdpdGhTYXZlSnVtcChzZWxlY3Rpb24uY3Vyc29yKVxuXG4gICAgICBzdWNjZWVkZWQgPSBAbW92ZVN1Y2NlZWRlZCA/IG5vdCBzZWxlY3Rpb24uaXNFbXB0eSgpIG9yIChAbW92ZVN1Y2Nlc3NPbkxpbmV3aXNlIGFuZCBAaXNMaW5ld2lzZSgpKVxuICAgICAgaWYgaXNPcldhc1Zpc3VhbCBvciAoc3VjY2VlZGVkIGFuZCAoQGluY2x1c2l2ZSBvciBAaXNMaW5ld2lzZSgpKSlcbiAgICAgICAgJHNlbGVjdGlvbiA9IEBzd3JhcChzZWxlY3Rpb24pXG4gICAgICAgICRzZWxlY3Rpb24uc2F2ZVByb3BlcnRpZXModHJ1ZSkgIyBzYXZlIHByb3BlcnR5IG9mIFwiYWxyZWFkeS1ub3JtYWxpemVkLXNlbGVjdGlvblwiXG4gICAgICAgICRzZWxlY3Rpb24uYXBwbHlXaXNlKEB3aXNlKVxuXG4gICAgQHZpbVN0YXRlLmdldExhc3RCbG9ja3dpc2VTZWxlY3Rpb24oKS5hdXRvc2Nyb2xsKCkgaWYgQHdpc2UgaXMgJ2Jsb2Nrd2lzZSdcblxuICBzZXRDdXJzb3JCdWZmZXJSb3c6IChjdXJzb3IsIHJvdywgb3B0aW9ucykgLT5cbiAgICBpZiBAdmVydGljYWxNb3Rpb24gYW5kIEBnZXRDb25maWcoJ21vdmVUb0ZpcnN0Q2hhcmFjdGVyT25WZXJ0aWNhbE1vdGlvbicpXG4gICAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24oQGdldEZpcnN0Q2hhcmFjdGVyUG9zaXRpb25Gb3JCdWZmZXJSb3cocm93KSwgb3B0aW9ucylcbiAgICBlbHNlXG4gICAgICBzZXRCdWZmZXJSb3coY3Vyc29yLCByb3csIG9wdGlvbnMpXG5cbiAgIyBbTk9URV1cbiAgIyBTaW5jZSB0aGlzIGZ1bmN0aW9uIGNoZWNrcyBjdXJzb3IgcG9zaXRpb24gY2hhbmdlLCBhIGN1cnNvciBwb3NpdGlvbiBNVVNUIGJlXG4gICMgdXBkYXRlZCBJTiBjYWxsYmFjayg9Zm4pXG4gICMgVXBkYXRpbmcgcG9pbnQgb25seSBpbiBjYWxsYmFjayBpcyB3cm9uZy11c2Ugb2YgdGhpcyBmdW5jaXRvbixcbiAgIyBzaW5jZSBpdCBzdG9wcyBpbW1lZGlhdGVseSBiZWNhdXNlIG9mIG5vdCBjdXJzb3IgcG9zaXRpb24gY2hhbmdlLlxuICBtb3ZlQ3Vyc29yQ291bnRUaW1lczogKGN1cnNvciwgZm4pIC0+XG4gICAgb2xkUG9zaXRpb24gPSBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuICAgIEBjb3VudFRpbWVzIEBnZXRDb3VudCgpLCAoc3RhdGUpIC0+XG4gICAgICBmbihzdGF0ZSlcbiAgICAgIGlmIChuZXdQb3NpdGlvbiA9IGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpKS5pc0VxdWFsKG9sZFBvc2l0aW9uKVxuICAgICAgICBzdGF0ZS5zdG9wKClcbiAgICAgIG9sZFBvc2l0aW9uID0gbmV3UG9zaXRpb25cblxuIyBVc2VkIGFzIG9wZXJhdG9yJ3MgdGFyZ2V0IGluIHZpc3VhbC1tb2RlLlxuY2xhc3MgQ3VycmVudFNlbGVjdGlvbiBleHRlbmRzIE1vdGlvblxuICBAZXh0ZW5kKGZhbHNlKVxuICBzZWxlY3Rpb25FeHRlbnQ6IG51bGxcbiAgYmxvY2t3aXNlU2VsZWN0aW9uRXh0ZW50OiBudWxsXG4gIGluY2x1c2l2ZTogdHJ1ZVxuXG4gIGluaXRpYWxpemU6IC0+XG4gICAgc3VwZXJcbiAgICBAcG9pbnRJbmZvQnlDdXJzb3IgPSBuZXcgTWFwXG5cbiAgbW92ZUN1cnNvcjogKGN1cnNvcikgLT5cbiAgICBpZiBAbW9kZSBpcyAndmlzdWFsJ1xuICAgICAgaWYgQGlzQmxvY2t3aXNlKClcbiAgICAgICAgQGJsb2Nrd2lzZVNlbGVjdGlvbkV4dGVudCA9IEBzd3JhcChjdXJzb3Iuc2VsZWN0aW9uKS5nZXRCbG9ja3dpc2VTZWxlY3Rpb25FeHRlbnQoKVxuICAgICAgZWxzZVxuICAgICAgICBAc2VsZWN0aW9uRXh0ZW50ID0gQGVkaXRvci5nZXRTZWxlY3RlZEJ1ZmZlclJhbmdlKCkuZ2V0RXh0ZW50KClcbiAgICBlbHNlXG4gICAgICAjIGAuYCByZXBlYXQgY2FzZVxuICAgICAgcG9pbnQgPSBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuXG4gICAgICBpZiBAYmxvY2t3aXNlU2VsZWN0aW9uRXh0ZW50P1xuICAgICAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24ocG9pbnQudHJhbnNsYXRlKEBibG9ja3dpc2VTZWxlY3Rpb25FeHRlbnQpKVxuICAgICAgZWxzZVxuICAgICAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24ocG9pbnQudHJhdmVyc2UoQHNlbGVjdGlvbkV4dGVudCkpXG5cbiAgc2VsZWN0OiAtPlxuICAgIGlmIEBtb2RlIGlzICd2aXN1YWwnXG4gICAgICBzdXBlclxuICAgIGVsc2VcbiAgICAgIGZvciBjdXJzb3IgaW4gQGVkaXRvci5nZXRDdXJzb3JzKCkgd2hlbiBwb2ludEluZm8gPSBAcG9pbnRJbmZvQnlDdXJzb3IuZ2V0KGN1cnNvcilcbiAgICAgICAge2N1cnNvclBvc2l0aW9uLCBzdGFydE9mU2VsZWN0aW9ufSA9IHBvaW50SW5mb1xuICAgICAgICBpZiBjdXJzb3JQb3NpdGlvbi5pc0VxdWFsKGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpKVxuICAgICAgICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihzdGFydE9mU2VsZWN0aW9uKVxuICAgICAgc3VwZXJcblxuICAgICMgKiBQdXJwb3NlIG9mIHBvaW50SW5mb0J5Q3Vyc29yPyBzZWUgIzIzNSBmb3IgZGV0YWlsLlxuICAgICMgV2hlbiBzdGF5T25UcmFuc2Zvcm1TdHJpbmcgaXMgZW5hYmxlZCwgY3Vyc29yIHBvcyBpcyBub3Qgc2V0IG9uIHN0YXJ0IG9mXG4gICAgIyBvZiBzZWxlY3RlZCByYW5nZS5cbiAgICAjIEJ1dCBJIHdhbnQgZm9sbG93aW5nIGJlaGF2aW9yLCBzbyBuZWVkIHRvIHByZXNlcnZlIHBvc2l0aW9uIGluZm8uXG4gICAgIyAgMS4gYHZqPi5gIC0+IGluZGVudCBzYW1lIHR3byByb3dzIHJlZ2FyZGxlc3Mgb2YgY3VycmVudCBjdXJzb3IncyByb3cuXG4gICAgIyAgMi4gYHZqPmouYCAtPiBpbmRlbnQgdHdvIHJvd3MgZnJvbSBjdXJzb3IncyByb3cuXG4gICAgZm9yIGN1cnNvciBpbiBAZWRpdG9yLmdldEN1cnNvcnMoKVxuICAgICAgc3RhcnRPZlNlbGVjdGlvbiA9IGN1cnNvci5zZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKS5zdGFydFxuICAgICAgQG9uRGlkRmluaXNoT3BlcmF0aW9uID0+XG4gICAgICAgIGN1cnNvclBvc2l0aW9uID0gY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKClcbiAgICAgICAgQHBvaW50SW5mb0J5Q3Vyc29yLnNldChjdXJzb3IsIHtzdGFydE9mU2VsZWN0aW9uLCBjdXJzb3JQb3NpdGlvbn0pXG5cbmNsYXNzIE1vdmVMZWZ0IGV4dGVuZHMgTW90aW9uXG4gIEBleHRlbmQoKVxuICBtb3ZlQ3Vyc29yOiAoY3Vyc29yKSAtPlxuICAgIGFsbG93V3JhcCA9IEBnZXRDb25maWcoJ3dyYXBMZWZ0UmlnaHRNb3Rpb24nKVxuICAgIEBtb3ZlQ3Vyc29yQ291bnRUaW1lcyBjdXJzb3IsIC0+XG4gICAgICBtb3ZlQ3Vyc29yTGVmdChjdXJzb3IsIHthbGxvd1dyYXB9KVxuXG5jbGFzcyBNb3ZlUmlnaHQgZXh0ZW5kcyBNb3Rpb25cbiAgQGV4dGVuZCgpXG4gIGNhbldyYXBUb05leHRMaW5lOiAoY3Vyc29yKSAtPlxuICAgIGlmIEBpc0FzVGFyZ2V0RXhjZXB0U2VsZWN0KCkgYW5kIG5vdCBjdXJzb3IuaXNBdEVuZE9mTGluZSgpXG4gICAgICBmYWxzZVxuICAgIGVsc2VcbiAgICAgIEBnZXRDb25maWcoJ3dyYXBMZWZ0UmlnaHRNb3Rpb24nKVxuXG4gIG1vdmVDdXJzb3I6IChjdXJzb3IpIC0+XG4gICAgQG1vdmVDdXJzb3JDb3VudFRpbWVzIGN1cnNvciwgPT5cbiAgICAgIGN1cnNvclBvc2l0aW9uID0gY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKClcbiAgICAgIEBlZGl0b3IudW5mb2xkQnVmZmVyUm93KGN1cnNvclBvc2l0aW9uLnJvdylcbiAgICAgIGFsbG93V3JhcCA9IEBjYW5XcmFwVG9OZXh0TGluZShjdXJzb3IpXG4gICAgICBtb3ZlQ3Vyc29yUmlnaHQoY3Vyc29yKVxuICAgICAgaWYgY3Vyc29yLmlzQXRFbmRPZkxpbmUoKSBhbmQgYWxsb3dXcmFwIGFuZCBub3QgcG9pbnRJc0F0VmltRW5kT2ZGaWxlKEBlZGl0b3IsIGN1cnNvclBvc2l0aW9uKVxuICAgICAgICBtb3ZlQ3Vyc29yUmlnaHQoY3Vyc29yLCB7YWxsb3dXcmFwfSlcblxuY2xhc3MgTW92ZVJpZ2h0QnVmZmVyQ29sdW1uIGV4dGVuZHMgTW90aW9uXG4gIEBleHRlbmQoZmFsc2UpXG5cbiAgbW92ZUN1cnNvcjogKGN1cnNvcikgLT5cbiAgICBzZXRCdWZmZXJDb2x1bW4oY3Vyc29yLCBjdXJzb3IuZ2V0QnVmZmVyQ29sdW1uKCkgKyBAZ2V0Q291bnQoKSlcblxuY2xhc3MgTW92ZVVwIGV4dGVuZHMgTW90aW9uXG4gIEBleHRlbmQoKVxuICB3aXNlOiAnbGluZXdpc2UnXG4gIHdyYXA6IGZhbHNlXG5cbiAgZ2V0QnVmZmVyUm93OiAocm93KSAtPlxuICAgIHJvdyA9IEBnZXROZXh0Um93KHJvdylcbiAgICBpZiBAZWRpdG9yLmlzRm9sZGVkQXRCdWZmZXJSb3cocm93KVxuICAgICAgZ2V0TGFyZ2VzdEZvbGRSYW5nZUNvbnRhaW5zQnVmZmVyUm93KEBlZGl0b3IsIHJvdykuc3RhcnQucm93XG4gICAgZWxzZVxuICAgICAgcm93XG5cbiAgZ2V0TmV4dFJvdzogKHJvdykgLT5cbiAgICBtaW4gPSAwXG4gICAgaWYgQHdyYXAgYW5kIHJvdyBpcyBtaW5cbiAgICAgIEBnZXRWaW1MYXN0QnVmZmVyUm93KClcbiAgICBlbHNlXG4gICAgICBsaW1pdE51bWJlcihyb3cgLSAxLCB7bWlufSlcblxuICBtb3ZlQ3Vyc29yOiAoY3Vyc29yKSAtPlxuICAgIEBtb3ZlQ3Vyc29yQ291bnRUaW1lcyBjdXJzb3IsID0+XG4gICAgICBzZXRCdWZmZXJSb3coY3Vyc29yLCBAZ2V0QnVmZmVyUm93KGN1cnNvci5nZXRCdWZmZXJSb3coKSkpXG5cbmNsYXNzIE1vdmVVcFdyYXAgZXh0ZW5kcyBNb3ZlVXBcbiAgQGV4dGVuZCgpXG4gIHdyYXA6IHRydWVcblxuY2xhc3MgTW92ZURvd24gZXh0ZW5kcyBNb3ZlVXBcbiAgQGV4dGVuZCgpXG4gIHdpc2U6ICdsaW5ld2lzZSdcbiAgd3JhcDogZmFsc2VcblxuICBnZXRCdWZmZXJSb3c6IChyb3cpIC0+XG4gICAgaWYgQGVkaXRvci5pc0ZvbGRlZEF0QnVmZmVyUm93KHJvdylcbiAgICAgIHJvdyA9IGdldExhcmdlc3RGb2xkUmFuZ2VDb250YWluc0J1ZmZlclJvdyhAZWRpdG9yLCByb3cpLmVuZC5yb3dcbiAgICBAZ2V0TmV4dFJvdyhyb3cpXG5cbiAgZ2V0TmV4dFJvdzogKHJvdykgLT5cbiAgICBtYXggPSBAZ2V0VmltTGFzdEJ1ZmZlclJvdygpXG4gICAgaWYgQHdyYXAgYW5kIHJvdyA+PSBtYXhcbiAgICAgIDBcbiAgICBlbHNlXG4gICAgICBsaW1pdE51bWJlcihyb3cgKyAxLCB7bWF4fSlcblxuY2xhc3MgTW92ZURvd25XcmFwIGV4dGVuZHMgTW92ZURvd25cbiAgQGV4dGVuZCgpXG4gIHdyYXA6IHRydWVcblxuY2xhc3MgTW92ZVVwU2NyZWVuIGV4dGVuZHMgTW90aW9uXG4gIEBleHRlbmQoKVxuICB3aXNlOiAnbGluZXdpc2UnXG4gIGRpcmVjdGlvbjogJ3VwJ1xuXG4gIG1vdmVDdXJzb3I6IChjdXJzb3IpIC0+XG4gICAgQG1vdmVDdXJzb3JDb3VudFRpbWVzIGN1cnNvciwgLT5cbiAgICAgIG1vdmVDdXJzb3JVcFNjcmVlbihjdXJzb3IpXG5cbmNsYXNzIE1vdmVEb3duU2NyZWVuIGV4dGVuZHMgTW92ZVVwU2NyZWVuXG4gIEBleHRlbmQoKVxuICB3aXNlOiAnbGluZXdpc2UnXG4gIGRpcmVjdGlvbjogJ2Rvd24nXG5cbiAgbW92ZUN1cnNvcjogKGN1cnNvcikgLT5cbiAgICBAbW92ZUN1cnNvckNvdW50VGltZXMgY3Vyc29yLCAtPlxuICAgICAgbW92ZUN1cnNvckRvd25TY3JlZW4oY3Vyc29yKVxuXG4jIE1vdmUgZG93bi91cCB0byBFZGdlXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgU2VlIHQ5bWQvYXRvbS12aW0tbW9kZS1wbHVzIzIzNlxuIyBBdCBsZWFzdCB2MS43LjAuIGJ1ZmZlclBvc2l0aW9uIGFuZCBzY3JlZW5Qb3NpdGlvbiBjYW5ub3QgY29udmVydCBhY2N1cmF0ZWx5XG4jIHdoZW4gcm93IGlzIGZvbGRlZC5cbmNsYXNzIE1vdmVVcFRvRWRnZSBleHRlbmRzIE1vdGlvblxuICBAZXh0ZW5kKClcbiAgd2lzZTogJ2xpbmV3aXNlJ1xuICBqdW1wOiB0cnVlXG4gIGRpcmVjdGlvbjogJ3VwJ1xuICBAZGVzY3JpcHRpb246IFwiTW92ZSBjdXJzb3IgdXAgdG8gKiplZGdlKiogY2hhciBhdCBzYW1lLWNvbHVtblwiXG5cbiAgbW92ZUN1cnNvcjogKGN1cnNvcikgLT5cbiAgICBAbW92ZUN1cnNvckNvdW50VGltZXMgY3Vyc29yLCA9PlxuICAgICAgQHNldFNjcmVlblBvc2l0aW9uU2FmZWx5KGN1cnNvciwgQGdldFBvaW50KGN1cnNvci5nZXRTY3JlZW5Qb3NpdGlvbigpKSlcblxuICBnZXRQb2ludDogKGZyb21Qb2ludCkgLT5cbiAgICBjb2x1bW4gPSBmcm9tUG9pbnQuY29sdW1uXG4gICAgZm9yIHJvdyBpbiBAZ2V0U2NhblJvd3MoZnJvbVBvaW50KSB3aGVuIEBpc0VkZ2UocG9pbnQgPSBuZXcgUG9pbnQocm93LCBjb2x1bW4pKVxuICAgICAgcmV0dXJuIHBvaW50XG5cbiAgZ2V0U2NhblJvd3M6ICh7cm93fSkgLT5cbiAgICB2YWxpZFJvdyA9IGdldFZhbGlkVmltU2NyZWVuUm93LmJpbmQobnVsbCwgQGVkaXRvcilcbiAgICBzd2l0Y2ggQGRpcmVjdGlvblxuICAgICAgd2hlbiAndXAnIHRoZW4gW3ZhbGlkUm93KHJvdyAtIDEpLi4wXVxuICAgICAgd2hlbiAnZG93bicgdGhlbiBbdmFsaWRSb3cocm93ICsgMSkuLkBnZXRWaW1MYXN0U2NyZWVuUm93KCldXG5cbiAgaXNFZGdlOiAocG9pbnQpIC0+XG4gICAgaWYgQGlzU3RvcHBhYmxlUG9pbnQocG9pbnQpXG4gICAgICAjIElmIG9uZSBvZiBhYm92ZS9iZWxvdyBwb2ludCB3YXMgbm90IHN0b3BwYWJsZSwgaXQncyBFZGdlIVxuICAgICAgYWJvdmUgPSBwb2ludC50cmFuc2xhdGUoWy0xLCAwXSlcbiAgICAgIGJlbG93ID0gcG9pbnQudHJhbnNsYXRlKFsrMSwgMF0pXG4gICAgICAobm90IEBpc1N0b3BwYWJsZVBvaW50KGFib3ZlKSkgb3IgKG5vdCBAaXNTdG9wcGFibGVQb2ludChiZWxvdykpXG4gICAgZWxzZVxuICAgICAgZmFsc2VcblxuICBpc1N0b3BwYWJsZVBvaW50OiAocG9pbnQpIC0+XG4gICAgaWYgQGlzTm9uV2hpdGVTcGFjZVBvaW50KHBvaW50KVxuICAgICAgdHJ1ZVxuICAgIGVsc2VcbiAgICAgIGxlZnRQb2ludCA9IHBvaW50LnRyYW5zbGF0ZShbMCwgLTFdKVxuICAgICAgcmlnaHRQb2ludCA9IHBvaW50LnRyYW5zbGF0ZShbMCwgKzFdKVxuICAgICAgQGlzTm9uV2hpdGVTcGFjZVBvaW50KGxlZnRQb2ludCkgYW5kIEBpc05vbldoaXRlU3BhY2VQb2ludChyaWdodFBvaW50KVxuXG4gIGlzTm9uV2hpdGVTcGFjZVBvaW50OiAocG9pbnQpIC0+XG4gICAgY2hhciA9IGdldFRleHRJblNjcmVlblJhbmdlKEBlZGl0b3IsIFJhbmdlLmZyb21Qb2ludFdpdGhEZWx0YShwb2ludCwgMCwgMSkpXG4gICAgY2hhcj8gYW5kIC9cXFMvLnRlc3QoY2hhcilcblxuY2xhc3MgTW92ZURvd25Ub0VkZ2UgZXh0ZW5kcyBNb3ZlVXBUb0VkZ2VcbiAgQGV4dGVuZCgpXG4gIEBkZXNjcmlwdGlvbjogXCJNb3ZlIGN1cnNvciBkb3duIHRvICoqZWRnZSoqIGNoYXIgYXQgc2FtZS1jb2x1bW5cIlxuICBkaXJlY3Rpb246ICdkb3duJ1xuXG4jIHdvcmRcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgTW92ZVRvTmV4dFdvcmQgZXh0ZW5kcyBNb3Rpb25cbiAgQGV4dGVuZCgpXG4gIHdvcmRSZWdleDogbnVsbFxuXG4gIGdldFBvaW50OiAocGF0dGVybiwgZnJvbSkgLT5cbiAgICB3b3JkUmFuZ2UgPSBudWxsXG4gICAgZm91bmQgPSBmYWxzZVxuICAgIHZpbUVPRiA9IEBnZXRWaW1Fb2ZCdWZmZXJQb3NpdGlvbihAZWRpdG9yKVxuXG4gICAgQHNjYW5Gb3J3YXJkIHBhdHRlcm4sIHtmcm9tfSwgKHtyYW5nZSwgbWF0Y2hUZXh0LCBzdG9wfSkgLT5cbiAgICAgIHdvcmRSYW5nZSA9IHJhbmdlXG4gICAgICAjIElnbm9yZSAnZW1wdHkgbGluZScgbWF0Y2hlcyBiZXR3ZWVuICdcXHInIGFuZCAnXFxuJ1xuICAgICAgcmV0dXJuIGlmIG1hdGNoVGV4dCBpcyAnJyBhbmQgcmFuZ2Uuc3RhcnQuY29sdW1uIGlzbnQgMFxuICAgICAgaWYgcmFuZ2Uuc3RhcnQuaXNHcmVhdGVyVGhhbihmcm9tKVxuICAgICAgICBmb3VuZCA9IHRydWVcbiAgICAgICAgc3RvcCgpXG5cbiAgICBpZiBmb3VuZFxuICAgICAgcG9pbnQgPSB3b3JkUmFuZ2Uuc3RhcnRcbiAgICAgIGlmIHBvaW50SXNBdEVuZE9mTGluZUF0Tm9uRW1wdHlSb3coQGVkaXRvciwgcG9pbnQpIGFuZCBub3QgcG9pbnQuaXNFcXVhbCh2aW1FT0YpXG4gICAgICAgIHBvaW50LnRyYXZlcnNlKFsxLCAwXSlcbiAgICAgIGVsc2VcbiAgICAgICAgcG9pbnRcbiAgICBlbHNlXG4gICAgICB3b3JkUmFuZ2U/LmVuZCA/IGZyb21cblxuICAjIFNwZWNpYWwgY2FzZTogXCJjd1wiIGFuZCBcImNXXCIgYXJlIHRyZWF0ZWQgbGlrZSBcImNlXCIgYW5kIFwiY0VcIiBpZiB0aGUgY3Vyc29yIGlzXG4gICMgb24gYSBub24tYmxhbmsuICBUaGlzIGlzIGJlY2F1c2UgXCJjd1wiIGlzIGludGVycHJldGVkIGFzIGNoYW5nZS13b3JkLCBhbmQgYVxuICAjIHdvcmQgZG9lcyBub3QgaW5jbHVkZSB0aGUgZm9sbG93aW5nIHdoaXRlIHNwYWNlLiAge1ZpOiBcImN3XCIgd2hlbiBvbiBhIGJsYW5rXG4gICMgZm9sbG93ZWQgYnkgb3RoZXIgYmxhbmtzIGNoYW5nZXMgb25seSB0aGUgZmlyc3QgYmxhbms7IHRoaXMgaXMgcHJvYmFibHkgYVxuICAjIGJ1ZywgYmVjYXVzZSBcImR3XCIgZGVsZXRlcyBhbGwgdGhlIGJsYW5rc31cbiAgI1xuICAjIEFub3RoZXIgc3BlY2lhbCBjYXNlOiBXaGVuIHVzaW5nIHRoZSBcIndcIiBtb3Rpb24gaW4gY29tYmluYXRpb24gd2l0aCBhblxuICAjIG9wZXJhdG9yIGFuZCB0aGUgbGFzdCB3b3JkIG1vdmVkIG92ZXIgaXMgYXQgdGhlIGVuZCBvZiBhIGxpbmUsIHRoZSBlbmQgb2ZcbiAgIyB0aGF0IHdvcmQgYmVjb21lcyB0aGUgZW5kIG9mIHRoZSBvcGVyYXRlZCB0ZXh0LCBub3QgdGhlIGZpcnN0IHdvcmQgaW4gdGhlXG4gICMgbmV4dCBsaW5lLlxuICBtb3ZlQ3Vyc29yOiAoY3Vyc29yKSAtPlxuICAgIGN1cnNvclBvc2l0aW9uID0gY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKClcbiAgICByZXR1cm4gaWYgcG9pbnRJc0F0VmltRW5kT2ZGaWxlKEBlZGl0b3IsIGN1cnNvclBvc2l0aW9uKVxuICAgIHdhc09uV2hpdGVTcGFjZSA9IHBvaW50SXNPbldoaXRlU3BhY2UoQGVkaXRvciwgY3Vyc29yUG9zaXRpb24pXG5cbiAgICBpc0FzVGFyZ2V0RXhjZXB0U2VsZWN0ID0gQGlzQXNUYXJnZXRFeGNlcHRTZWxlY3QoKVxuICAgIEBtb3ZlQ3Vyc29yQ291bnRUaW1lcyBjdXJzb3IsICh7aXNGaW5hbH0pID0+XG4gICAgICBjdXJzb3JQb3NpdGlvbiA9IGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXG4gICAgICBpZiBpc0VtcHR5Um93KEBlZGl0b3IsIGN1cnNvclBvc2l0aW9uLnJvdykgYW5kIGlzQXNUYXJnZXRFeGNlcHRTZWxlY3RcbiAgICAgICAgcG9pbnQgPSBjdXJzb3JQb3NpdGlvbi50cmF2ZXJzZShbMSwgMF0pXG4gICAgICBlbHNlXG4gICAgICAgIHBhdHRlcm4gPSBAd29yZFJlZ2V4ID8gY3Vyc29yLndvcmRSZWdFeHAoKVxuICAgICAgICBwb2ludCA9IEBnZXRQb2ludChwYXR0ZXJuLCBjdXJzb3JQb3NpdGlvbilcbiAgICAgICAgaWYgaXNGaW5hbCBhbmQgaXNBc1RhcmdldEV4Y2VwdFNlbGVjdFxuICAgICAgICAgIGlmIEBvcGVyYXRvci5pcygnQ2hhbmdlJykgYW5kIChub3Qgd2FzT25XaGl0ZVNwYWNlKVxuICAgICAgICAgICAgcG9pbnQgPSBjdXJzb3IuZ2V0RW5kT2ZDdXJyZW50V29yZEJ1ZmZlclBvc2l0aW9uKHtAd29yZFJlZ2V4fSlcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBwb2ludCA9IFBvaW50Lm1pbihwb2ludCwgZ2V0RW5kT2ZMaW5lRm9yQnVmZmVyUm93KEBlZGl0b3IsIGN1cnNvclBvc2l0aW9uLnJvdykpXG4gICAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24ocG9pbnQpXG5cbiMgYlxuY2xhc3MgTW92ZVRvUHJldmlvdXNXb3JkIGV4dGVuZHMgTW90aW9uXG4gIEBleHRlbmQoKVxuICB3b3JkUmVnZXg6IG51bGxcblxuICBtb3ZlQ3Vyc29yOiAoY3Vyc29yKSAtPlxuICAgIEBtb3ZlQ3Vyc29yQ291bnRUaW1lcyBjdXJzb3IsID0+XG4gICAgICBwb2ludCA9IGN1cnNvci5nZXRCZWdpbm5pbmdPZkN1cnJlbnRXb3JkQnVmZmVyUG9zaXRpb24oe0B3b3JkUmVnZXh9KVxuICAgICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHBvaW50KVxuXG5jbGFzcyBNb3ZlVG9FbmRPZldvcmQgZXh0ZW5kcyBNb3Rpb25cbiAgQGV4dGVuZCgpXG4gIHdvcmRSZWdleDogbnVsbFxuICBpbmNsdXNpdmU6IHRydWVcblxuICBtb3ZlVG9OZXh0RW5kT2ZXb3JkOiAoY3Vyc29yKSAtPlxuICAgIG1vdmVDdXJzb3JUb05leHROb25XaGl0ZXNwYWNlKGN1cnNvcilcbiAgICBwb2ludCA9IGN1cnNvci5nZXRFbmRPZkN1cnJlbnRXb3JkQnVmZmVyUG9zaXRpb24oe0B3b3JkUmVnZXh9KS50cmFuc2xhdGUoWzAsIC0xXSlcbiAgICBwb2ludCA9IFBvaW50Lm1pbihwb2ludCwgQGdldFZpbUVvZkJ1ZmZlclBvc2l0aW9uKCkpXG4gICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHBvaW50KVxuXG4gIG1vdmVDdXJzb3I6IChjdXJzb3IpIC0+XG4gICAgQG1vdmVDdXJzb3JDb3VudFRpbWVzIGN1cnNvciwgPT5cbiAgICAgIG9yaWdpbmFsUG9pbnQgPSBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuICAgICAgQG1vdmVUb05leHRFbmRPZldvcmQoY3Vyc29yKVxuICAgICAgaWYgb3JpZ2luYWxQb2ludC5pc0VxdWFsKGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpKVxuICAgICAgICAjIFJldHJ5IGZyb20gcmlnaHQgY29sdW1uIGlmIGN1cnNvciB3YXMgYWxyZWFkeSBvbiBFbmRPZldvcmRcbiAgICAgICAgY3Vyc29yLm1vdmVSaWdodCgpXG4gICAgICAgIEBtb3ZlVG9OZXh0RW5kT2ZXb3JkKGN1cnNvcilcblxuIyBbVE9ETzogSW1wcm92ZSwgYWNjdXJhY3ldXG5jbGFzcyBNb3ZlVG9QcmV2aW91c0VuZE9mV29yZCBleHRlbmRzIE1vdmVUb1ByZXZpb3VzV29yZFxuICBAZXh0ZW5kKClcbiAgaW5jbHVzaXZlOiB0cnVlXG5cbiAgbW92ZUN1cnNvcjogKGN1cnNvcikgLT5cbiAgICB0aW1lcyA9IEBnZXRDb3VudCgpXG4gICAgd29yZFJhbmdlID0gY3Vyc29yLmdldEN1cnJlbnRXb3JkQnVmZmVyUmFuZ2UoKVxuICAgIGN1cnNvclBvc2l0aW9uID0gY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKClcblxuICAgICMgaWYgd2UncmUgaW4gdGhlIG1pZGRsZSBvZiBhIHdvcmQgdGhlbiB3ZSBuZWVkIHRvIG1vdmUgdG8gaXRzIHN0YXJ0XG4gICAgaWYgY3Vyc29yUG9zaXRpb24uaXNHcmVhdGVyVGhhbih3b3JkUmFuZ2Uuc3RhcnQpIGFuZCBjdXJzb3JQb3NpdGlvbi5pc0xlc3NUaGFuKHdvcmRSYW5nZS5lbmQpXG4gICAgICB0aW1lcyArPSAxXG5cbiAgICBmb3IgWzEuLnRpbWVzXVxuICAgICAgcG9pbnQgPSBjdXJzb3IuZ2V0QmVnaW5uaW5nT2ZDdXJyZW50V29yZEJ1ZmZlclBvc2l0aW9uKHtAd29yZFJlZ2V4fSlcbiAgICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihwb2ludClcblxuICAgIEBtb3ZlVG9OZXh0RW5kT2ZXb3JkKGN1cnNvcilcbiAgICBpZiBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKS5pc0dyZWF0ZXJUaGFuT3JFcXVhbChjdXJzb3JQb3NpdGlvbilcbiAgICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihbMCwgMF0pXG5cbiAgbW92ZVRvTmV4dEVuZE9mV29yZDogKGN1cnNvcikgLT5cbiAgICBwb2ludCA9IGN1cnNvci5nZXRFbmRPZkN1cnJlbnRXb3JkQnVmZmVyUG9zaXRpb24oe0B3b3JkUmVnZXh9KS50cmFuc2xhdGUoWzAsIC0xXSlcbiAgICBwb2ludCA9IFBvaW50Lm1pbihwb2ludCwgQGdldFZpbUVvZkJ1ZmZlclBvc2l0aW9uKCkpXG4gICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHBvaW50KVxuXG4jIFdob2xlIHdvcmRcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgTW92ZVRvTmV4dFdob2xlV29yZCBleHRlbmRzIE1vdmVUb05leHRXb3JkXG4gIEBleHRlbmQoKVxuICB3b3JkUmVnZXg6IC9eJHxcXFMrL2dcblxuY2xhc3MgTW92ZVRvUHJldmlvdXNXaG9sZVdvcmQgZXh0ZW5kcyBNb3ZlVG9QcmV2aW91c1dvcmRcbiAgQGV4dGVuZCgpXG4gIHdvcmRSZWdleDogL14kfFxcUysvZ1xuXG5jbGFzcyBNb3ZlVG9FbmRPZldob2xlV29yZCBleHRlbmRzIE1vdmVUb0VuZE9mV29yZFxuICBAZXh0ZW5kKClcbiAgd29yZFJlZ2V4OiAvXFxTKy9cblxuIyBbVE9ETzogSW1wcm92ZSwgYWNjdXJhY3ldXG5jbGFzcyBNb3ZlVG9QcmV2aW91c0VuZE9mV2hvbGVXb3JkIGV4dGVuZHMgTW92ZVRvUHJldmlvdXNFbmRPZldvcmRcbiAgQGV4dGVuZCgpXG4gIHdvcmRSZWdleDogL1xcUysvXG5cbiMgQWxwaGFudW1lcmljIHdvcmQgW0V4cGVyaW1lbnRhbF1cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgTW92ZVRvTmV4dEFscGhhbnVtZXJpY1dvcmQgZXh0ZW5kcyBNb3ZlVG9OZXh0V29yZFxuICBAZXh0ZW5kKClcbiAgQGRlc2NyaXB0aW9uOiBcIk1vdmUgdG8gbmV4dCBhbHBoYW51bWVyaWMoYC9cXHcrL2ApIHdvcmRcIlxuICB3b3JkUmVnZXg6IC9cXHcrL2dcblxuY2xhc3MgTW92ZVRvUHJldmlvdXNBbHBoYW51bWVyaWNXb3JkIGV4dGVuZHMgTW92ZVRvUHJldmlvdXNXb3JkXG4gIEBleHRlbmQoKVxuICBAZGVzY3JpcHRpb246IFwiTW92ZSB0byBwcmV2aW91cyBhbHBoYW51bWVyaWMoYC9cXHcrL2ApIHdvcmRcIlxuICB3b3JkUmVnZXg6IC9cXHcrL1xuXG5jbGFzcyBNb3ZlVG9FbmRPZkFscGhhbnVtZXJpY1dvcmQgZXh0ZW5kcyBNb3ZlVG9FbmRPZldvcmRcbiAgQGV4dGVuZCgpXG4gIEBkZXNjcmlwdGlvbjogXCJNb3ZlIHRvIGVuZCBvZiBhbHBoYW51bWVyaWMoYC9cXHcrL2ApIHdvcmRcIlxuICB3b3JkUmVnZXg6IC9cXHcrL1xuXG4jIEFscGhhbnVtZXJpYyB3b3JkIFtFeHBlcmltZW50YWxdXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIE1vdmVUb05leHRTbWFydFdvcmQgZXh0ZW5kcyBNb3ZlVG9OZXh0V29yZFxuICBAZXh0ZW5kKClcbiAgQGRlc2NyaXB0aW9uOiBcIk1vdmUgdG8gbmV4dCBzbWFydCB3b3JkIChgL1tcXHctXSsvYCkgd29yZFwiXG4gIHdvcmRSZWdleDogL1tcXHctXSsvZ1xuXG5jbGFzcyBNb3ZlVG9QcmV2aW91c1NtYXJ0V29yZCBleHRlbmRzIE1vdmVUb1ByZXZpb3VzV29yZFxuICBAZXh0ZW5kKClcbiAgQGRlc2NyaXB0aW9uOiBcIk1vdmUgdG8gcHJldmlvdXMgc21hcnQgd29yZCAoYC9bXFx3LV0rL2ApIHdvcmRcIlxuICB3b3JkUmVnZXg6IC9bXFx3LV0rL1xuXG5jbGFzcyBNb3ZlVG9FbmRPZlNtYXJ0V29yZCBleHRlbmRzIE1vdmVUb0VuZE9mV29yZFxuICBAZXh0ZW5kKClcbiAgQGRlc2NyaXB0aW9uOiBcIk1vdmUgdG8gZW5kIG9mIHNtYXJ0IHdvcmQgKGAvW1xcdy1dKy9gKSB3b3JkXCJcbiAgd29yZFJlZ2V4OiAvW1xcdy1dKy9cblxuIyBTdWJ3b3JkXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIE1vdmVUb05leHRTdWJ3b3JkIGV4dGVuZHMgTW92ZVRvTmV4dFdvcmRcbiAgQGV4dGVuZCgpXG4gIG1vdmVDdXJzb3I6IChjdXJzb3IpIC0+XG4gICAgQHdvcmRSZWdleCA9IGN1cnNvci5zdWJ3b3JkUmVnRXhwKClcbiAgICBzdXBlclxuXG5jbGFzcyBNb3ZlVG9QcmV2aW91c1N1YndvcmQgZXh0ZW5kcyBNb3ZlVG9QcmV2aW91c1dvcmRcbiAgQGV4dGVuZCgpXG4gIG1vdmVDdXJzb3I6IChjdXJzb3IpIC0+XG4gICAgQHdvcmRSZWdleCA9IGN1cnNvci5zdWJ3b3JkUmVnRXhwKClcbiAgICBzdXBlclxuXG5jbGFzcyBNb3ZlVG9FbmRPZlN1YndvcmQgZXh0ZW5kcyBNb3ZlVG9FbmRPZldvcmRcbiAgQGV4dGVuZCgpXG4gIG1vdmVDdXJzb3I6IChjdXJzb3IpIC0+XG4gICAgQHdvcmRSZWdleCA9IGN1cnNvci5zdWJ3b3JkUmVnRXhwKClcbiAgICBzdXBlclxuXG4jIFNlbnRlbmNlXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgU2VudGVuY2UgaXMgZGVmaW5lZCBhcyBiZWxvd1xuIyAgLSBlbmQgd2l0aCBbJy4nLCAnIScsICc/J11cbiMgIC0gb3B0aW9uYWxseSBmb2xsb3dlZCBieSBbJyknLCAnXScsICdcIicsIFwiJ1wiXVxuIyAgLSBmb2xsb3dlZCBieSBbJyQnLCAnICcsICdcXHQnXVxuIyAgLSBwYXJhZ3JhcGggYm91bmRhcnkgaXMgYWxzbyBzZW50ZW5jZSBib3VuZGFyeVxuIyAgLSBzZWN0aW9uIGJvdW5kYXJ5IGlzIGFsc28gc2VudGVuY2UgYm91bmRhcnkoaWdub3JlKVxuY2xhc3MgTW92ZVRvTmV4dFNlbnRlbmNlIGV4dGVuZHMgTW90aW9uXG4gIEBleHRlbmQoKVxuICBqdW1wOiB0cnVlXG4gIHNlbnRlbmNlUmVnZXg6IC8vLyg/OltcXC4hXFw/XVtcXClcXF1cIiddKlxccyspfChcXG58XFxyXFxuKS8vL2dcbiAgZGlyZWN0aW9uOiAnbmV4dCdcblxuICBtb3ZlQ3Vyc29yOiAoY3Vyc29yKSAtPlxuICAgIEBtb3ZlQ3Vyc29yQ291bnRUaW1lcyBjdXJzb3IsID0+XG4gICAgICBAc2V0QnVmZmVyUG9zaXRpb25TYWZlbHkoY3Vyc29yLCBAZ2V0UG9pbnQoY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKCkpKVxuXG4gIGdldFBvaW50OiAoZnJvbVBvaW50KSAtPlxuICAgIGlmIEBkaXJlY3Rpb24gaXMgJ25leHQnXG4gICAgICBAZ2V0TmV4dFN0YXJ0T2ZTZW50ZW5jZShmcm9tUG9pbnQpXG4gICAgZWxzZSBpZiBAZGlyZWN0aW9uIGlzICdwcmV2aW91cydcbiAgICAgIEBnZXRQcmV2aW91c1N0YXJ0T2ZTZW50ZW5jZShmcm9tUG9pbnQpXG5cbiAgaXNCbGFua1JvdzogKHJvdykgLT5cbiAgICBAZWRpdG9yLmlzQnVmZmVyUm93Qmxhbmsocm93KVxuXG4gIGdldE5leHRTdGFydE9mU2VudGVuY2U6IChmcm9tKSAtPlxuICAgIGZvdW5kUG9pbnQgPSBudWxsXG4gICAgQHNjYW5Gb3J3YXJkIEBzZW50ZW5jZVJlZ2V4LCB7ZnJvbX0sICh7cmFuZ2UsIG1hdGNoVGV4dCwgbWF0Y2gsIHN0b3B9KSA9PlxuICAgICAgaWYgbWF0Y2hbMV0/XG4gICAgICAgIFtzdGFydFJvdywgZW5kUm93XSA9IFtyYW5nZS5zdGFydC5yb3csIHJhbmdlLmVuZC5yb3ddXG4gICAgICAgIHJldHVybiBpZiBAc2tpcEJsYW5rUm93IGFuZCBAaXNCbGFua1JvdyhlbmRSb3cpXG4gICAgICAgIGlmIEBpc0JsYW5rUm93KHN0YXJ0Um93KSBpc250IEBpc0JsYW5rUm93KGVuZFJvdylcbiAgICAgICAgICBmb3VuZFBvaW50ID0gQGdldEZpcnN0Q2hhcmFjdGVyUG9zaXRpb25Gb3JCdWZmZXJSb3coZW5kUm93KVxuICAgICAgZWxzZVxuICAgICAgICBmb3VuZFBvaW50ID0gcmFuZ2UuZW5kXG4gICAgICBzdG9wKCkgaWYgZm91bmRQb2ludD9cbiAgICBmb3VuZFBvaW50ID8gQGdldFZpbUVvZkJ1ZmZlclBvc2l0aW9uKClcblxuICBnZXRQcmV2aW91c1N0YXJ0T2ZTZW50ZW5jZTogKGZyb20pIC0+XG4gICAgZm91bmRQb2ludCA9IG51bGxcbiAgICBAc2NhbkJhY2t3YXJkIEBzZW50ZW5jZVJlZ2V4LCB7ZnJvbX0sICh7cmFuZ2UsIG1hdGNoLCBzdG9wLCBtYXRjaFRleHR9KSA9PlxuICAgICAgaWYgbWF0Y2hbMV0/XG4gICAgICAgIFtzdGFydFJvdywgZW5kUm93XSA9IFtyYW5nZS5zdGFydC5yb3csIHJhbmdlLmVuZC5yb3ddXG4gICAgICAgIGlmIG5vdCBAaXNCbGFua1JvdyhlbmRSb3cpIGFuZCBAaXNCbGFua1JvdyhzdGFydFJvdylcbiAgICAgICAgICBwb2ludCA9IEBnZXRGaXJzdENoYXJhY3RlclBvc2l0aW9uRm9yQnVmZmVyUm93KGVuZFJvdylcbiAgICAgICAgICBpZiBwb2ludC5pc0xlc3NUaGFuKGZyb20pXG4gICAgICAgICAgICBmb3VuZFBvaW50ID0gcG9pbnRcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXR1cm4gaWYgQHNraXBCbGFua1Jvd1xuICAgICAgICAgICAgZm91bmRQb2ludCA9IEBnZXRGaXJzdENoYXJhY3RlclBvc2l0aW9uRm9yQnVmZmVyUm93KHN0YXJ0Um93KVxuICAgICAgZWxzZVxuICAgICAgICBpZiByYW5nZS5lbmQuaXNMZXNzVGhhbihmcm9tKVxuICAgICAgICAgIGZvdW5kUG9pbnQgPSByYW5nZS5lbmRcbiAgICAgIHN0b3AoKSBpZiBmb3VuZFBvaW50P1xuICAgIGZvdW5kUG9pbnQgPyBbMCwgMF1cblxuY2xhc3MgTW92ZVRvUHJldmlvdXNTZW50ZW5jZSBleHRlbmRzIE1vdmVUb05leHRTZW50ZW5jZVxuICBAZXh0ZW5kKClcbiAgZGlyZWN0aW9uOiAncHJldmlvdXMnXG5cbmNsYXNzIE1vdmVUb05leHRTZW50ZW5jZVNraXBCbGFua1JvdyBleHRlbmRzIE1vdmVUb05leHRTZW50ZW5jZVxuICBAZXh0ZW5kKClcbiAgc2tpcEJsYW5rUm93OiB0cnVlXG5cbmNsYXNzIE1vdmVUb1ByZXZpb3VzU2VudGVuY2VTa2lwQmxhbmtSb3cgZXh0ZW5kcyBNb3ZlVG9QcmV2aW91c1NlbnRlbmNlXG4gIEBleHRlbmQoKVxuICBza2lwQmxhbmtSb3c6IHRydWVcblxuIyBQYXJhZ3JhcGhcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgTW92ZVRvTmV4dFBhcmFncmFwaCBleHRlbmRzIE1vdGlvblxuICBAZXh0ZW5kKClcbiAganVtcDogdHJ1ZVxuICBkaXJlY3Rpb246ICduZXh0J1xuXG4gIG1vdmVDdXJzb3I6IChjdXJzb3IpIC0+XG4gICAgQG1vdmVDdXJzb3JDb3VudFRpbWVzIGN1cnNvciwgPT5cbiAgICAgIEBzZXRCdWZmZXJQb3NpdGlvblNhZmVseShjdXJzb3IsIEBnZXRQb2ludChjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKSkpXG5cbiAgZ2V0UG9pbnQ6IChmcm9tUG9pbnQpIC0+XG4gICAgc3RhcnRSb3cgPSBmcm9tUG9pbnQucm93XG4gICAgd2FzQXROb25CbGFua1JvdyA9IG5vdCBAZWRpdG9yLmlzQnVmZmVyUm93Qmxhbmsoc3RhcnRSb3cpXG4gICAgZm9yIHJvdyBpbiBnZXRCdWZmZXJSb3dzKEBlZGl0b3IsIHtzdGFydFJvdywgQGRpcmVjdGlvbn0pXG4gICAgICBpZiBAZWRpdG9yLmlzQnVmZmVyUm93Qmxhbmsocm93KVxuICAgICAgICByZXR1cm4gbmV3IFBvaW50KHJvdywgMCkgaWYgd2FzQXROb25CbGFua1Jvd1xuICAgICAgZWxzZVxuICAgICAgICB3YXNBdE5vbkJsYW5rUm93ID0gdHJ1ZVxuXG4gICAgIyBmYWxsYmFja1xuICAgIHN3aXRjaCBAZGlyZWN0aW9uXG4gICAgICB3aGVuICdwcmV2aW91cycgdGhlbiBuZXcgUG9pbnQoMCwgMClcbiAgICAgIHdoZW4gJ25leHQnIHRoZW4gQGdldFZpbUVvZkJ1ZmZlclBvc2l0aW9uKClcblxuY2xhc3MgTW92ZVRvUHJldmlvdXNQYXJhZ3JhcGggZXh0ZW5kcyBNb3ZlVG9OZXh0UGFyYWdyYXBoXG4gIEBleHRlbmQoKVxuICBkaXJlY3Rpb246ICdwcmV2aW91cydcblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBNb3ZlVG9CZWdpbm5pbmdPZkxpbmUgZXh0ZW5kcyBNb3Rpb25cbiAgQGV4dGVuZCgpXG5cbiAgbW92ZUN1cnNvcjogKGN1cnNvcikgLT5cbiAgICBzZXRCdWZmZXJDb2x1bW4oY3Vyc29yLCAwKVxuXG5jbGFzcyBNb3ZlVG9Db2x1bW4gZXh0ZW5kcyBNb3Rpb25cbiAgQGV4dGVuZCgpXG5cbiAgbW92ZUN1cnNvcjogKGN1cnNvcikgLT5cbiAgICBzZXRCdWZmZXJDb2x1bW4oY3Vyc29yLCBAZ2V0Q291bnQoLTEpKVxuXG5jbGFzcyBNb3ZlVG9MYXN0Q2hhcmFjdGVyT2ZMaW5lIGV4dGVuZHMgTW90aW9uXG4gIEBleHRlbmQoKVxuXG4gIG1vdmVDdXJzb3I6IChjdXJzb3IpIC0+XG4gICAgcm93ID0gZ2V0VmFsaWRWaW1CdWZmZXJSb3coQGVkaXRvciwgY3Vyc29yLmdldEJ1ZmZlclJvdygpICsgQGdldENvdW50KC0xKSlcbiAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24oW3JvdywgSW5maW5pdHldKVxuICAgIGN1cnNvci5nb2FsQ29sdW1uID0gSW5maW5pdHlcblxuY2xhc3MgTW92ZVRvTGFzdE5vbmJsYW5rQ2hhcmFjdGVyT2ZMaW5lQW5kRG93biBleHRlbmRzIE1vdGlvblxuICBAZXh0ZW5kKClcbiAgaW5jbHVzaXZlOiB0cnVlXG5cbiAgbW92ZUN1cnNvcjogKGN1cnNvcikgLT5cbiAgICBwb2ludCA9IEBnZXRQb2ludChjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKSlcbiAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24ocG9pbnQpXG5cbiAgZ2V0UG9pbnQ6ICh7cm93fSkgLT5cbiAgICByb3cgPSBsaW1pdE51bWJlcihyb3cgKyBAZ2V0Q291bnQoLTEpLCBtYXg6IEBnZXRWaW1MYXN0QnVmZmVyUm93KCkpXG4gICAgcmFuZ2UgPSBmaW5kUmFuZ2VJbkJ1ZmZlclJvdyhAZWRpdG9yLCAvXFxTfF4vLCByb3csIGRpcmVjdGlvbjogJ2JhY2t3YXJkJylcbiAgICByYW5nZT8uc3RhcnQgPyBuZXcgUG9pbnQocm93LCAwKVxuXG4jIE1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lIGZhaW1pbHlcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBNb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZSBleHRlbmRzIE1vdGlvblxuICBAZXh0ZW5kKClcbiAgbW92ZUN1cnNvcjogKGN1cnNvcikgLT5cbiAgICBwb2ludCA9IEBnZXRGaXJzdENoYXJhY3RlclBvc2l0aW9uRm9yQnVmZmVyUm93KGN1cnNvci5nZXRCdWZmZXJSb3coKSlcbiAgICBAc2V0QnVmZmVyUG9zaXRpb25TYWZlbHkoY3Vyc29yLCBwb2ludClcblxuY2xhc3MgTW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmVVcCBleHRlbmRzIE1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lXG4gIEBleHRlbmQoKVxuICB3aXNlOiAnbGluZXdpc2UnXG4gIG1vdmVDdXJzb3I6IChjdXJzb3IpIC0+XG4gICAgQG1vdmVDdXJzb3JDb3VudFRpbWVzIGN1cnNvciwgLT5cbiAgICAgIHBvaW50ID0gY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKClcbiAgICAgIHVubGVzcyBwb2ludC5yb3cgaXMgMFxuICAgICAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24ocG9pbnQudHJhbnNsYXRlKFstMSwgMF0pKVxuICAgIHN1cGVyXG5cbmNsYXNzIE1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lRG93biBleHRlbmRzIE1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lXG4gIEBleHRlbmQoKVxuICB3aXNlOiAnbGluZXdpc2UnXG4gIG1vdmVDdXJzb3I6IChjdXJzb3IpIC0+XG4gICAgQG1vdmVDdXJzb3JDb3VudFRpbWVzIGN1cnNvciwgPT5cbiAgICAgIHBvaW50ID0gY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKClcbiAgICAgIHVubGVzcyBAZ2V0VmltTGFzdEJ1ZmZlclJvdygpIGlzIHBvaW50LnJvd1xuICAgICAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24ocG9pbnQudHJhbnNsYXRlKFsrMSwgMF0pKVxuICAgIHN1cGVyXG5cbmNsYXNzIE1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lQW5kRG93biBleHRlbmRzIE1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lRG93blxuICBAZXh0ZW5kKClcbiAgZGVmYXVsdENvdW50OiAwXG4gIGdldENvdW50OiAtPiBzdXBlciAtIDFcblxuIyBrZXltYXA6IGcgZ1xuY2xhc3MgTW92ZVRvRmlyc3RMaW5lIGV4dGVuZHMgTW90aW9uXG4gIEBleHRlbmQoKVxuICB3aXNlOiAnbGluZXdpc2UnXG4gIGp1bXA6IHRydWVcbiAgdmVydGljYWxNb3Rpb246IHRydWVcbiAgbW92ZVN1Y2Nlc3NPbkxpbmV3aXNlOiB0cnVlXG5cbiAgbW92ZUN1cnNvcjogKGN1cnNvcikgLT5cbiAgICBAc2V0Q3Vyc29yQnVmZmVyUm93KGN1cnNvciwgZ2V0VmFsaWRWaW1CdWZmZXJSb3coQGVkaXRvciwgQGdldFJvdygpKSlcbiAgICBjdXJzb3IuYXV0b3Njcm9sbChjZW50ZXI6IHRydWUpXG5cbiAgZ2V0Um93OiAtPlxuICAgIEBnZXRDb3VudCgtMSlcblxuIyBrZXltYXA6IEdcbmNsYXNzIE1vdmVUb0xhc3RMaW5lIGV4dGVuZHMgTW92ZVRvRmlyc3RMaW5lXG4gIEBleHRlbmQoKVxuICBkZWZhdWx0Q291bnQ6IEluZmluaXR5XG5cbiMga2V5bWFwOiBOJSBlLmcuIDEwJVxuY2xhc3MgTW92ZVRvTGluZUJ5UGVyY2VudCBleHRlbmRzIE1vdmVUb0ZpcnN0TGluZVxuICBAZXh0ZW5kKClcblxuICBnZXRSb3c6IC0+XG4gICAgcGVyY2VudCA9IGxpbWl0TnVtYmVyKEBnZXRDb3VudCgpLCBtYXg6IDEwMClcbiAgICBNYXRoLmZsb29yKChAZWRpdG9yLmdldExpbmVDb3VudCgpIC0gMSkgKiAocGVyY2VudCAvIDEwMCkpXG5cbmNsYXNzIE1vdmVUb1JlbGF0aXZlTGluZSBleHRlbmRzIE1vdGlvblxuICBAZXh0ZW5kKGZhbHNlKVxuICB3aXNlOiAnbGluZXdpc2UnXG4gIG1vdmVTdWNjZXNzT25MaW5ld2lzZTogdHJ1ZVxuXG4gIG1vdmVDdXJzb3I6IChjdXJzb3IpIC0+XG4gICAgcm93ID0gQGdldEZvbGRFbmRSb3dGb3JSb3coY3Vyc29yLmdldEJ1ZmZlclJvdygpKVxuXG4gICAgY291bnQgPSBAZ2V0Q291bnQoLTEpXG4gICAgd2hpbGUgKGNvdW50ID4gMClcbiAgICAgIHJvdyA9IEBnZXRGb2xkRW5kUm93Rm9yUm93KHJvdyArIDEpXG4gICAgICBjb3VudC0tXG5cbiAgICBzZXRCdWZmZXJSb3coY3Vyc29yLCByb3cpXG5cbmNsYXNzIE1vdmVUb1JlbGF0aXZlTGluZU1pbmltdW1PbmUgZXh0ZW5kcyBNb3ZlVG9SZWxhdGl2ZUxpbmVcbiAgQGV4dGVuZChmYWxzZSlcblxuICBnZXRDb3VudDogLT5cbiAgICBsaW1pdE51bWJlcihzdXBlciwgbWluOiAxKVxuXG4jIFBvc2l0aW9uIGN1cnNvciB3aXRob3V0IHNjcm9sbGluZy4sIEgsIE0sIExcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBrZXltYXA6IEhcbmNsYXNzIE1vdmVUb1RvcE9mU2NyZWVuIGV4dGVuZHMgTW90aW9uXG4gIEBleHRlbmQoKVxuICB3aXNlOiAnbGluZXdpc2UnXG4gIGp1bXA6IHRydWVcbiAgc2Nyb2xsb2ZmOiAyXG4gIGRlZmF1bHRDb3VudDogMFxuICB2ZXJ0aWNhbE1vdGlvbjogdHJ1ZVxuXG4gIG1vdmVDdXJzb3I6IChjdXJzb3IpIC0+XG4gICAgYnVmZmVyUm93ID0gQGVkaXRvci5idWZmZXJSb3dGb3JTY3JlZW5Sb3coQGdldFNjcmVlblJvdygpKVxuICAgIEBzZXRDdXJzb3JCdWZmZXJSb3coY3Vyc29yLCBidWZmZXJSb3cpXG5cbiAgZ2V0U2Nyb2xsb2ZmOiAtPlxuICAgIGlmIEBpc0FzVGFyZ2V0RXhjZXB0U2VsZWN0KClcbiAgICAgIDBcbiAgICBlbHNlXG4gICAgICBAc2Nyb2xsb2ZmXG5cbiAgZ2V0U2NyZWVuUm93OiAtPlxuICAgIGZpcnN0Um93ID0gZ2V0Rmlyc3RWaXNpYmxlU2NyZWVuUm93KEBlZGl0b3IpXG4gICAgb2Zmc2V0ID0gQGdldFNjcm9sbG9mZigpXG4gICAgb2Zmc2V0ID0gMCBpZiBmaXJzdFJvdyBpcyAwXG4gICAgb2Zmc2V0ID0gbGltaXROdW1iZXIoQGdldENvdW50KC0xKSwgbWluOiBvZmZzZXQpXG4gICAgZmlyc3RSb3cgKyBvZmZzZXRcblxuIyBrZXltYXA6IE1cbmNsYXNzIE1vdmVUb01pZGRsZU9mU2NyZWVuIGV4dGVuZHMgTW92ZVRvVG9wT2ZTY3JlZW5cbiAgQGV4dGVuZCgpXG4gIGdldFNjcmVlblJvdzogLT5cbiAgICBzdGFydFJvdyA9IGdldEZpcnN0VmlzaWJsZVNjcmVlblJvdyhAZWRpdG9yKVxuICAgIGVuZFJvdyA9IGxpbWl0TnVtYmVyKEBlZGl0b3IuZ2V0TGFzdFZpc2libGVTY3JlZW5Sb3coKSwgbWF4OiBAZ2V0VmltTGFzdFNjcmVlblJvdygpKVxuICAgIHN0YXJ0Um93ICsgTWF0aC5mbG9vcigoZW5kUm93IC0gc3RhcnRSb3cpIC8gMilcblxuIyBrZXltYXA6IExcbmNsYXNzIE1vdmVUb0JvdHRvbU9mU2NyZWVuIGV4dGVuZHMgTW92ZVRvVG9wT2ZTY3JlZW5cbiAgQGV4dGVuZCgpXG4gIGdldFNjcmVlblJvdzogLT5cbiAgICAjIFtGSVhNRV1cbiAgICAjIEF0IGxlYXN0IEF0b20gdjEuNi4wLCB0aGVyZSBhcmUgdHdvIGltcGxlbWVudGF0aW9uIG9mIGdldExhc3RWaXNpYmxlU2NyZWVuUm93KClcbiAgICAjIGVkaXRvci5nZXRMYXN0VmlzaWJsZVNjcmVlblJvdygpIGFuZCBlZGl0b3JFbGVtZW50LmdldExhc3RWaXNpYmxlU2NyZWVuUm93KClcbiAgICAjIFRob3NlIHR3byBtZXRob2RzIHJldHVybiBkaWZmZXJlbnQgdmFsdWUsIGVkaXRvcidzIG9uZSBpcyBjb3JyZW50LlxuICAgICMgU28gSSBpbnRlbnRpb25hbGx5IHVzZSBlZGl0b3IuZ2V0TGFzdFNjcmVlblJvdyBoZXJlLlxuICAgIHZpbUxhc3RTY3JlZW5Sb3cgPSBAZ2V0VmltTGFzdFNjcmVlblJvdygpXG4gICAgcm93ID0gbGltaXROdW1iZXIoQGVkaXRvci5nZXRMYXN0VmlzaWJsZVNjcmVlblJvdygpLCBtYXg6IHZpbUxhc3RTY3JlZW5Sb3cpXG4gICAgb2Zmc2V0ID0gQGdldFNjcm9sbG9mZigpICsgMVxuICAgIG9mZnNldCA9IDAgaWYgcm93IGlzIHZpbUxhc3RTY3JlZW5Sb3dcbiAgICBvZmZzZXQgPSBsaW1pdE51bWJlcihAZ2V0Q291bnQoLTEpLCBtaW46IG9mZnNldClcbiAgICByb3cgLSBvZmZzZXRcblxuIyBTY3JvbGxpbmdcbiMgSGFsZjogY3RybC1kLCBjdHJsLXVcbiMgRnVsbDogY3RybC1mLCBjdHJsLWJcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBbRklYTUVdIGNvdW50IGJlaGF2ZSBkaWZmZXJlbnRseSBmcm9tIG9yaWdpbmFsIFZpbS5cbmNsYXNzIFNjcm9sbCBleHRlbmRzIE1vdGlvblxuICBAZXh0ZW5kKGZhbHNlKVxuICB2ZXJ0aWNhbE1vdGlvbjogdHJ1ZVxuXG4gIGlzU21vb3RoU2Nyb2xsRW5hYmxlZDogLT5cbiAgICBpZiBNYXRoLmFicyhAYW1vdW50T2ZQYWdlKSBpcyAxXG4gICAgICBAZ2V0Q29uZmlnKCdzbW9vdGhTY3JvbGxPbkZ1bGxTY3JvbGxNb3Rpb24nKVxuICAgIGVsc2VcbiAgICAgIEBnZXRDb25maWcoJ3Ntb290aFNjcm9sbE9uSGFsZlNjcm9sbE1vdGlvbicpXG5cbiAgZ2V0U21vb3RoU2Nyb2xsRHVhdGlvbjogLT5cbiAgICBpZiBNYXRoLmFicyhAYW1vdW50T2ZQYWdlKSBpcyAxXG4gICAgICBAZ2V0Q29uZmlnKCdzbW9vdGhTY3JvbGxPbkZ1bGxTY3JvbGxNb3Rpb25EdXJhdGlvbicpXG4gICAgZWxzZVxuICAgICAgQGdldENvbmZpZygnc21vb3RoU2Nyb2xsT25IYWxmU2Nyb2xsTW90aW9uRHVyYXRpb24nKVxuXG4gIGdldFBpeGVsUmVjdFRvcEZvclNjZWVuUm93OiAocm93KSAtPlxuICAgIHBvaW50ID0gbmV3IFBvaW50KHJvdywgMClcbiAgICBAZWRpdG9yLmVsZW1lbnQucGl4ZWxSZWN0Rm9yU2NyZWVuUmFuZ2UobmV3IFJhbmdlKHBvaW50LCBwb2ludCkpLnRvcFxuXG4gIHNtb290aFNjcm9sbDogKGZyb21Sb3csIHRvUm93LCBkb25lKSAtPlxuICAgIHRvcFBpeGVsRnJvbSA9IHt0b3A6IEBnZXRQaXhlbFJlY3RUb3BGb3JTY2VlblJvdyhmcm9tUm93KX1cbiAgICB0b3BQaXhlbFRvID0ge3RvcDogQGdldFBpeGVsUmVjdFRvcEZvclNjZWVuUm93KHRvUm93KX1cbiAgICAjIFtOT1RFXVxuICAgICMgaW50ZW50aW9uYWxseSB1c2UgYGVsZW1lbnQuY29tcG9uZW50LnNldFNjcm9sbFRvcGAgaW5zdGVhZCBvZiBgZWxlbWVudC5zZXRTY3JvbGxUb3BgLlxuICAgICMgU0luY2UgZWxlbWVudC5zZXRTY3JvbGxUb3Agd2lsbCB0aHJvdyBleGNlcHRpb24gd2hlbiBlbGVtZW50LmNvbXBvbmVudCBubyBsb25nZXIgZXhpc3RzLlxuICAgIHN0ZXAgPSAobmV3VG9wKSA9PlxuICAgICAgaWYgQGVkaXRvci5lbGVtZW50LmNvbXBvbmVudD9cbiAgICAgICAgQGVkaXRvci5lbGVtZW50LmNvbXBvbmVudC5zZXRTY3JvbGxUb3AobmV3VG9wKVxuICAgICAgICBAZWRpdG9yLmVsZW1lbnQuY29tcG9uZW50LnVwZGF0ZVN5bmMoKVxuXG4gICAgZHVyYXRpb24gPSBAZ2V0U21vb3RoU2Nyb2xsRHVhdGlvbigpXG4gICAgQHZpbVN0YXRlLnJlcXVlc3RTY3JvbGxBbmltYXRpb24odG9wUGl4ZWxGcm9tLCB0b3BQaXhlbFRvLCB7ZHVyYXRpb24sIHN0ZXAsIGRvbmV9KVxuXG4gIGdldEFtb3VudE9mUm93czogLT5cbiAgICBNYXRoLmNlaWwoQGFtb3VudE9mUGFnZSAqIEBlZGl0b3IuZ2V0Um93c1BlclBhZ2UoKSAqIEBnZXRDb3VudCgpKVxuXG4gIGdldEJ1ZmZlclJvdzogKGN1cnNvcikgLT5cbiAgICBzY3JlZW5Sb3cgPSBnZXRWYWxpZFZpbVNjcmVlblJvdyhAZWRpdG9yLCBjdXJzb3IuZ2V0U2NyZWVuUm93KCkgKyBAZ2V0QW1vdW50T2ZSb3dzKCkpXG4gICAgQGVkaXRvci5idWZmZXJSb3dGb3JTY3JlZW5Sb3coc2NyZWVuUm93KVxuXG4gIG1vdmVDdXJzb3I6IChjdXJzb3IpIC0+XG4gICAgYnVmZmVyUm93ID0gQGdldEJ1ZmZlclJvdyhjdXJzb3IpXG4gICAgQHNldEN1cnNvckJ1ZmZlclJvdyhjdXJzb3IsIEBnZXRCdWZmZXJSb3coY3Vyc29yKSwgYXV0b3Njcm9sbDogZmFsc2UpXG5cbiAgICBpZiBjdXJzb3IuaXNMYXN0Q3Vyc29yKClcbiAgICAgIGlmIEBpc1Ntb290aFNjcm9sbEVuYWJsZWQoKVxuICAgICAgICBAdmltU3RhdGUuZmluaXNoU2Nyb2xsQW5pbWF0aW9uKClcblxuICAgICAgZmlyc3RWaXNpYmlsZVNjcmVlblJvdyA9IEBlZGl0b3IuZ2V0Rmlyc3RWaXNpYmxlU2NyZWVuUm93KClcbiAgICAgIG5ld0ZpcnN0VmlzaWJpbGVCdWZmZXJSb3cgPSBAZWRpdG9yLmJ1ZmZlclJvd0ZvclNjcmVlblJvdyhmaXJzdFZpc2liaWxlU2NyZWVuUm93ICsgQGdldEFtb3VudE9mUm93cygpKVxuICAgICAgbmV3Rmlyc3RWaXNpYmlsZVNjcmVlblJvdyA9IEBlZGl0b3Iuc2NyZWVuUm93Rm9yQnVmZmVyUm93KG5ld0ZpcnN0VmlzaWJpbGVCdWZmZXJSb3cpXG4gICAgICBkb25lID0gPT5cbiAgICAgICAgQGVkaXRvci5zZXRGaXJzdFZpc2libGVTY3JlZW5Sb3cobmV3Rmlyc3RWaXNpYmlsZVNjcmVlblJvdylcbiAgICAgICAgIyBbRklYTUVdIHNvbWV0aW1lcywgc2Nyb2xsVG9wIGlzIG5vdCB1cGRhdGVkLCBjYWxsaW5nIHRoaXMgZml4LlxuICAgICAgICAjIEludmVzdGlnYXRlIGFuZCBmaW5kIGJldHRlciBhcHByb2FjaCB0aGVuIHJlbW92ZSB0aGlzIHdvcmthcm91bmQuXG4gICAgICAgIEBlZGl0b3IuZWxlbWVudC5jb21wb25lbnQ/LnVwZGF0ZVN5bmMoKVxuXG4gICAgICBpZiBAaXNTbW9vdGhTY3JvbGxFbmFibGVkKClcbiAgICAgICAgQHNtb290aFNjcm9sbChmaXJzdFZpc2liaWxlU2NyZWVuUm93LCBuZXdGaXJzdFZpc2liaWxlU2NyZWVuUm93LCBkb25lKVxuICAgICAgZWxzZVxuICAgICAgICBkb25lKClcblxuXG4jIGtleW1hcDogY3RybC1mXG5jbGFzcyBTY3JvbGxGdWxsU2NyZWVuRG93biBleHRlbmRzIFNjcm9sbFxuICBAZXh0ZW5kKHRydWUpXG4gIGFtb3VudE9mUGFnZTogKzFcblxuIyBrZXltYXA6IGN0cmwtYlxuY2xhc3MgU2Nyb2xsRnVsbFNjcmVlblVwIGV4dGVuZHMgU2Nyb2xsXG4gIEBleHRlbmQoKVxuICBhbW91bnRPZlBhZ2U6IC0xXG5cbiMga2V5bWFwOiBjdHJsLWRcbmNsYXNzIFNjcm9sbEhhbGZTY3JlZW5Eb3duIGV4dGVuZHMgU2Nyb2xsXG4gIEBleHRlbmQoKVxuICBhbW91bnRPZlBhZ2U6ICsxIC8gMlxuXG4jIGtleW1hcDogY3RybC11XG5jbGFzcyBTY3JvbGxIYWxmU2NyZWVuVXAgZXh0ZW5kcyBTY3JvbGxcbiAgQGV4dGVuZCgpXG4gIGFtb3VudE9mUGFnZTogLTEgLyAyXG5cbiMgRmluZFxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIGtleW1hcDogZlxuY2xhc3MgRmluZCBleHRlbmRzIE1vdGlvblxuICBAZXh0ZW5kKClcbiAgYmFja3dhcmRzOiBmYWxzZVxuICBpbmNsdXNpdmU6IHRydWVcbiAgb2Zmc2V0OiAwXG4gIHJlcXVpcmVJbnB1dDogdHJ1ZVxuXG4gIGluaXRpYWxpemU6IC0+XG4gICAgc3VwZXJcbiAgICBAZm9jdXNJbnB1dCgpIHVubGVzcyBAaXNDb21wbGV0ZSgpXG5cbiAgaXNCYWNrd2FyZHM6IC0+XG4gICAgQGJhY2t3YXJkc1xuXG4gIGdldFBvaW50OiAoZnJvbVBvaW50KSAtPlxuICAgIHtzdGFydCwgZW5kfSA9IEBlZGl0b3IuYnVmZmVyUmFuZ2VGb3JCdWZmZXJSb3coZnJvbVBvaW50LnJvdylcblxuICAgIG9mZnNldCA9IGlmIEBpc0JhY2t3YXJkcygpIHRoZW4gQG9mZnNldCBlbHNlIC1Ab2Zmc2V0XG4gICAgdW5PZmZzZXQgPSAtb2Zmc2V0ICogQHJlcGVhdGVkXG4gICAgaWYgQGlzQmFja3dhcmRzKClcbiAgICAgIHNjYW5SYW5nZSA9IFtzdGFydCwgZnJvbVBvaW50LnRyYW5zbGF0ZShbMCwgdW5PZmZzZXRdKV1cbiAgICAgIG1ldGhvZCA9ICdiYWNrd2FyZHNTY2FuSW5CdWZmZXJSYW5nZSdcbiAgICBlbHNlXG4gICAgICBzY2FuUmFuZ2UgPSBbZnJvbVBvaW50LnRyYW5zbGF0ZShbMCwgMSArIHVuT2Zmc2V0XSksIGVuZF1cbiAgICAgIG1ldGhvZCA9ICdzY2FuSW5CdWZmZXJSYW5nZSdcblxuICAgIHBvaW50cyA9IFtdXG4gICAgQGVkaXRvclttZXRob2RdIC8vLyN7Xy5lc2NhcGVSZWdFeHAoQGlucHV0KX0vLy9nLCBzY2FuUmFuZ2UsICh7cmFuZ2V9KSAtPlxuICAgICAgcG9pbnRzLnB1c2gocmFuZ2Uuc3RhcnQpXG4gICAgcG9pbnRzW0BnZXRDb3VudCgtMSldPy50cmFuc2xhdGUoWzAsIG9mZnNldF0pXG5cbiAgbW92ZUN1cnNvcjogKGN1cnNvcikgLT5cbiAgICBwb2ludCA9IEBnZXRQb2ludChjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKSlcbiAgICBAc2V0QnVmZmVyUG9zaXRpb25TYWZlbHkoY3Vyc29yLCBwb2ludClcbiAgICBAZ2xvYmFsU3RhdGUuc2V0KCdjdXJyZW50RmluZCcsIHRoaXMpIHVubGVzcyBAcmVwZWF0ZWRcblxuIyBrZXltYXA6IEZcbmNsYXNzIEZpbmRCYWNrd2FyZHMgZXh0ZW5kcyBGaW5kXG4gIEBleHRlbmQoKVxuICBpbmNsdXNpdmU6IGZhbHNlXG4gIGJhY2t3YXJkczogdHJ1ZVxuXG4jIGtleW1hcDogdFxuY2xhc3MgVGlsbCBleHRlbmRzIEZpbmRcbiAgQGV4dGVuZCgpXG4gIG9mZnNldDogMVxuXG4gIGdldFBvaW50OiAtPlxuICAgIEBwb2ludCA9IHN1cGVyXG4gICAgQG1vdmVTdWNjZWVkZWQgPSBAcG9pbnQ/XG4gICAgcmV0dXJuIEBwb2ludFxuXG4jIGtleW1hcDogVFxuY2xhc3MgVGlsbEJhY2t3YXJkcyBleHRlbmRzIFRpbGxcbiAgQGV4dGVuZCgpXG4gIGluY2x1c2l2ZTogZmFsc2VcbiAgYmFja3dhcmRzOiB0cnVlXG5cbiMgTWFya1xuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIGtleW1hcDogYFxuY2xhc3MgTW92ZVRvTWFyayBleHRlbmRzIE1vdGlvblxuICBAZXh0ZW5kKClcbiAganVtcDogdHJ1ZVxuICByZXF1aXJlSW5wdXQ6IHRydWVcbiAgaW5wdXQ6IG51bGwgIyBzZXQgd2hlbiBpbnN0YXRudGlhdGVkIHZpYSB2aW1TdGF0ZTo6bW92ZVRvTWFyaygpXG5cbiAgaW5pdGlhbGl6ZTogLT5cbiAgICBzdXBlclxuICAgIEBmb2N1c0lucHV0KCkgdW5sZXNzIEBpc0NvbXBsZXRlKClcblxuICBnZXRQb2ludDogLT5cbiAgICBAdmltU3RhdGUubWFyay5nZXQoQGlucHV0KVxuXG4gIG1vdmVDdXJzb3I6IChjdXJzb3IpIC0+XG4gICAgaWYgcG9pbnQgPSBAZ2V0UG9pbnQoKVxuICAgICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHBvaW50KVxuICAgICAgY3Vyc29yLmF1dG9zY3JvbGwoY2VudGVyOiB0cnVlKVxuXG4jIGtleW1hcDogJ1xuY2xhc3MgTW92ZVRvTWFya0xpbmUgZXh0ZW5kcyBNb3ZlVG9NYXJrXG4gIEBleHRlbmQoKVxuICB3aXNlOiAnbGluZXdpc2UnXG5cbiAgZ2V0UG9pbnQ6IC0+XG4gICAgaWYgcG9pbnQgPSBzdXBlclxuICAgICAgQGdldEZpcnN0Q2hhcmFjdGVyUG9zaXRpb25Gb3JCdWZmZXJSb3cocG9pbnQucm93KVxuXG4jIEZvbGRcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgTW92ZVRvUHJldmlvdXNGb2xkU3RhcnQgZXh0ZW5kcyBNb3Rpb25cbiAgQGV4dGVuZCgpXG4gIEBkZXNjcmlwdGlvbjogXCJNb3ZlIHRvIHByZXZpb3VzIGZvbGQgc3RhcnRcIlxuICB3aXNlOiAnY2hhcmFjdGVyd2lzZSdcbiAgd2hpY2g6ICdzdGFydCdcbiAgZGlyZWN0aW9uOiAncHJldidcblxuICBpbml0aWFsaXplOiAtPlxuICAgIHN1cGVyXG4gICAgQHJvd3MgPSBAZ2V0Rm9sZFJvd3MoQHdoaWNoKVxuICAgIEByb3dzLnJldmVyc2UoKSBpZiBAZGlyZWN0aW9uIGlzICdwcmV2J1xuXG4gIGdldEZvbGRSb3dzOiAod2hpY2gpIC0+XG4gICAgaW5kZXggPSBpZiB3aGljaCBpcyAnc3RhcnQnIHRoZW4gMCBlbHNlIDFcbiAgICByb3dzID0gZ2V0Q29kZUZvbGRSb3dSYW5nZXMoQGVkaXRvcikubWFwIChyb3dSYW5nZSkgLT5cbiAgICAgIHJvd1JhbmdlW2luZGV4XVxuICAgIF8uc29ydEJ5KF8udW5pcShyb3dzKSwgKHJvdykgLT4gcm93KVxuXG4gIGdldFNjYW5Sb3dzOiAoY3Vyc29yKSAtPlxuICAgIGN1cnNvclJvdyA9IGN1cnNvci5nZXRCdWZmZXJSb3coKVxuICAgIGlzVmFsaWRSb3cgPSBzd2l0Y2ggQGRpcmVjdGlvblxuICAgICAgd2hlbiAncHJldicgdGhlbiAocm93KSAtPiByb3cgPCBjdXJzb3JSb3dcbiAgICAgIHdoZW4gJ25leHQnIHRoZW4gKHJvdykgLT4gcm93ID4gY3Vyc29yUm93XG4gICAgQHJvd3MuZmlsdGVyKGlzVmFsaWRSb3cpXG5cbiAgZGV0ZWN0Um93OiAoY3Vyc29yKSAtPlxuICAgIEBnZXRTY2FuUm93cyhjdXJzb3IpWzBdXG5cbiAgbW92ZUN1cnNvcjogKGN1cnNvcikgLT5cbiAgICBAbW92ZUN1cnNvckNvdW50VGltZXMgY3Vyc29yLCA9PlxuICAgICAgaWYgKHJvdyA9IEBkZXRlY3RSb3coY3Vyc29yKSk/XG4gICAgICAgIG1vdmVDdXJzb3JUb0ZpcnN0Q2hhcmFjdGVyQXRSb3coY3Vyc29yLCByb3cpXG5cbmNsYXNzIE1vdmVUb05leHRGb2xkU3RhcnQgZXh0ZW5kcyBNb3ZlVG9QcmV2aW91c0ZvbGRTdGFydFxuICBAZXh0ZW5kKClcbiAgQGRlc2NyaXB0aW9uOiBcIk1vdmUgdG8gbmV4dCBmb2xkIHN0YXJ0XCJcbiAgZGlyZWN0aW9uOiAnbmV4dCdcblxuY2xhc3MgTW92ZVRvUHJldmlvdXNGb2xkU3RhcnRXaXRoU2FtZUluZGVudCBleHRlbmRzIE1vdmVUb1ByZXZpb3VzRm9sZFN0YXJ0XG4gIEBleHRlbmQoKVxuICBAZGVzY3JpcHRpb246IFwiTW92ZSB0byBwcmV2aW91cyBzYW1lLWluZGVudGVkIGZvbGQgc3RhcnRcIlxuICBkZXRlY3RSb3c6IChjdXJzb3IpIC0+XG4gICAgYmFzZUluZGVudExldmVsID0gQGdldEluZGVudExldmVsRm9yQnVmZmVyUm93KGN1cnNvci5nZXRCdWZmZXJSb3coKSlcbiAgICBmb3Igcm93IGluIEBnZXRTY2FuUm93cyhjdXJzb3IpXG4gICAgICBpZiBAZ2V0SW5kZW50TGV2ZWxGb3JCdWZmZXJSb3cocm93KSBpcyBiYXNlSW5kZW50TGV2ZWxcbiAgICAgICAgcmV0dXJuIHJvd1xuICAgIG51bGxcblxuY2xhc3MgTW92ZVRvTmV4dEZvbGRTdGFydFdpdGhTYW1lSW5kZW50IGV4dGVuZHMgTW92ZVRvUHJldmlvdXNGb2xkU3RhcnRXaXRoU2FtZUluZGVudFxuICBAZXh0ZW5kKClcbiAgQGRlc2NyaXB0aW9uOiBcIk1vdmUgdG8gbmV4dCBzYW1lLWluZGVudGVkIGZvbGQgc3RhcnRcIlxuICBkaXJlY3Rpb246ICduZXh0J1xuXG5jbGFzcyBNb3ZlVG9QcmV2aW91c0ZvbGRFbmQgZXh0ZW5kcyBNb3ZlVG9QcmV2aW91c0ZvbGRTdGFydFxuICBAZXh0ZW5kKClcbiAgQGRlc2NyaXB0aW9uOiBcIk1vdmUgdG8gcHJldmlvdXMgZm9sZCBlbmRcIlxuICB3aGljaDogJ2VuZCdcblxuY2xhc3MgTW92ZVRvTmV4dEZvbGRFbmQgZXh0ZW5kcyBNb3ZlVG9QcmV2aW91c0ZvbGRFbmRcbiAgQGV4dGVuZCgpXG4gIEBkZXNjcmlwdGlvbjogXCJNb3ZlIHRvIG5leHQgZm9sZCBlbmRcIlxuICBkaXJlY3Rpb246ICduZXh0J1xuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIE1vdmVUb1ByZXZpb3VzRnVuY3Rpb24gZXh0ZW5kcyBNb3ZlVG9QcmV2aW91c0ZvbGRTdGFydFxuICBAZXh0ZW5kKClcbiAgQGRlc2NyaXB0aW9uOiBcIk1vdmUgdG8gcHJldmlvdXMgZnVuY3Rpb25cIlxuICBkaXJlY3Rpb246ICdwcmV2J1xuICBkZXRlY3RSb3c6IChjdXJzb3IpIC0+XG4gICAgXy5kZXRlY3QgQGdldFNjYW5Sb3dzKGN1cnNvciksIChyb3cpID0+XG4gICAgICBpc0luY2x1ZGVGdW5jdGlvblNjb3BlRm9yUm93KEBlZGl0b3IsIHJvdylcblxuY2xhc3MgTW92ZVRvTmV4dEZ1bmN0aW9uIGV4dGVuZHMgTW92ZVRvUHJldmlvdXNGdW5jdGlvblxuICBAZXh0ZW5kKClcbiAgQGRlc2NyaXB0aW9uOiBcIk1vdmUgdG8gbmV4dCBmdW5jdGlvblwiXG4gIGRpcmVjdGlvbjogJ25leHQnXG5cbiMgU2NvcGUgYmFzZWRcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgTW92ZVRvUG9zaXRpb25CeVNjb3BlIGV4dGVuZHMgTW90aW9uXG4gIEBleHRlbmQoZmFsc2UpXG4gIGRpcmVjdGlvbjogJ2JhY2t3YXJkJ1xuICBzY29wZTogJy4nXG5cbiAgZ2V0UG9pbnQ6IChmcm9tUG9pbnQpIC0+XG4gICAgZGV0ZWN0U2NvcGVTdGFydFBvc2l0aW9uRm9yU2NvcGUoQGVkaXRvciwgZnJvbVBvaW50LCBAZGlyZWN0aW9uLCBAc2NvcGUpXG5cbiAgbW92ZUN1cnNvcjogKGN1cnNvcikgLT5cbiAgICBAbW92ZUN1cnNvckNvdW50VGltZXMgY3Vyc29yLCA9PlxuICAgICAgQHNldEJ1ZmZlclBvc2l0aW9uU2FmZWx5KGN1cnNvciwgQGdldFBvaW50KGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpKSlcblxuY2xhc3MgTW92ZVRvUHJldmlvdXNTdHJpbmcgZXh0ZW5kcyBNb3ZlVG9Qb3NpdGlvbkJ5U2NvcGVcbiAgQGV4dGVuZCgpXG4gIEBkZXNjcmlwdGlvbjogXCJNb3ZlIHRvIHByZXZpb3VzIHN0cmluZyhzZWFyY2hlZCBieSBgc3RyaW5nLmJlZ2luYCBzY29wZSlcIlxuICBkaXJlY3Rpb246ICdiYWNrd2FyZCdcbiAgc2NvcGU6ICdzdHJpbmcuYmVnaW4nXG5cbmNsYXNzIE1vdmVUb05leHRTdHJpbmcgZXh0ZW5kcyBNb3ZlVG9QcmV2aW91c1N0cmluZ1xuICBAZXh0ZW5kKClcbiAgQGRlc2NyaXB0aW9uOiBcIk1vdmUgdG8gbmV4dCBzdHJpbmcoc2VhcmNoZWQgYnkgYHN0cmluZy5iZWdpbmAgc2NvcGUpXCJcbiAgZGlyZWN0aW9uOiAnZm9yd2FyZCdcblxuY2xhc3MgTW92ZVRvUHJldmlvdXNOdW1iZXIgZXh0ZW5kcyBNb3ZlVG9Qb3NpdGlvbkJ5U2NvcGVcbiAgQGV4dGVuZCgpXG4gIGRpcmVjdGlvbjogJ2JhY2t3YXJkJ1xuICBAZGVzY3JpcHRpb246IFwiTW92ZSB0byBwcmV2aW91cyBudW1iZXIoc2VhcmNoZWQgYnkgYGNvbnN0YW50Lm51bWVyaWNgIHNjb3BlKVwiXG4gIHNjb3BlOiAnY29uc3RhbnQubnVtZXJpYydcblxuY2xhc3MgTW92ZVRvTmV4dE51bWJlciBleHRlbmRzIE1vdmVUb1ByZXZpb3VzTnVtYmVyXG4gIEBleHRlbmQoKVxuICBAZGVzY3JpcHRpb246IFwiTW92ZSB0byBuZXh0IG51bWJlcihzZWFyY2hlZCBieSBgY29uc3RhbnQubnVtZXJpY2Agc2NvcGUpXCJcbiAgZGlyZWN0aW9uOiAnZm9yd2FyZCdcblxuY2xhc3MgTW92ZVRvTmV4dE9jY3VycmVuY2UgZXh0ZW5kcyBNb3Rpb25cbiAgQGV4dGVuZCgpXG4gICMgRW5zdXJlIHRoaXMgY29tbWFuZCBpcyBhdmFpbGFibGUgd2hlbiBoYXMtb2NjdXJyZW5jZVxuICBAY29tbWFuZFNjb3BlOiAnYXRvbS10ZXh0LWVkaXRvci52aW0tbW9kZS1wbHVzLmhhcy1vY2N1cnJlbmNlJ1xuICBqdW1wOiB0cnVlXG4gIGRpcmVjdGlvbjogJ25leHQnXG5cbiAgZ2V0UmFuZ2VzOiAtPlxuICAgIEB2aW1TdGF0ZS5vY2N1cnJlbmNlTWFuYWdlci5nZXRNYXJrZXJzKCkubWFwIChtYXJrZXIpIC0+XG4gICAgICBtYXJrZXIuZ2V0QnVmZmVyUmFuZ2UoKVxuXG4gIGV4ZWN1dGU6IC0+XG4gICAgQHJhbmdlcyA9IEBnZXRSYW5nZXMoKVxuICAgIHN1cGVyXG5cbiAgbW92ZUN1cnNvcjogKGN1cnNvcikgLT5cbiAgICBpbmRleCA9IEBnZXRJbmRleChjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKSlcbiAgICBpZiBpbmRleD9cbiAgICAgIG9mZnNldCA9IHN3aXRjaCBAZGlyZWN0aW9uXG4gICAgICAgIHdoZW4gJ25leHQnIHRoZW4gQGdldENvdW50KC0xKVxuICAgICAgICB3aGVuICdwcmV2aW91cycgdGhlbiAtQGdldENvdW50KC0xKVxuICAgICAgcmFuZ2UgPSBAcmFuZ2VzW2dldEluZGV4KGluZGV4ICsgb2Zmc2V0LCBAcmFuZ2VzKV1cbiAgICAgIHBvaW50ID0gcmFuZ2Uuc3RhcnRcblxuICAgICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHBvaW50LCBhdXRvc2Nyb2xsOiBmYWxzZSlcblxuICAgICAgaWYgY3Vyc29yLmlzTGFzdEN1cnNvcigpXG4gICAgICAgIEBlZGl0b3IudW5mb2xkQnVmZmVyUm93KHBvaW50LnJvdylcbiAgICAgICAgc21hcnRTY3JvbGxUb0J1ZmZlclBvc2l0aW9uKEBlZGl0b3IsIHBvaW50KVxuXG4gICAgICBpZiBAZ2V0Q29uZmlnKCdmbGFzaE9uTW92ZVRvT2NjdXJyZW5jZScpXG4gICAgICAgIEB2aW1TdGF0ZS5mbGFzaChyYW5nZSwgdHlwZTogJ3NlYXJjaCcpXG5cbiAgZ2V0SW5kZXg6IChmcm9tUG9pbnQpIC0+XG4gICAgZm9yIHJhbmdlLCBpIGluIEByYW5nZXMgd2hlbiByYW5nZS5zdGFydC5pc0dyZWF0ZXJUaGFuKGZyb21Qb2ludClcbiAgICAgIHJldHVybiBpXG4gICAgMFxuXG5jbGFzcyBNb3ZlVG9QcmV2aW91c09jY3VycmVuY2UgZXh0ZW5kcyBNb3ZlVG9OZXh0T2NjdXJyZW5jZVxuICBAZXh0ZW5kKClcbiAgZGlyZWN0aW9uOiAncHJldmlvdXMnXG5cbiAgZ2V0SW5kZXg6IChmcm9tUG9pbnQpIC0+XG4gICAgZm9yIHJhbmdlLCBpIGluIEByYW5nZXMgYnkgLTEgd2hlbiByYW5nZS5lbmQuaXNMZXNzVGhhbihmcm9tUG9pbnQpXG4gICAgICByZXR1cm4gaVxuICAgIEByYW5nZXMubGVuZ3RoIC0gMVxuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMga2V5bWFwOiAlXG5jbGFzcyBNb3ZlVG9QYWlyIGV4dGVuZHMgTW90aW9uXG4gIEBleHRlbmQoKVxuICBpbmNsdXNpdmU6IHRydWVcbiAganVtcDogdHJ1ZVxuICBtZW1iZXI6IFsnUGFyZW50aGVzaXMnLCAnQ3VybHlCcmFja2V0JywgJ1NxdWFyZUJyYWNrZXQnXVxuXG4gIG1vdmVDdXJzb3I6IChjdXJzb3IpIC0+XG4gICAgQHNldEJ1ZmZlclBvc2l0aW9uU2FmZWx5KGN1cnNvciwgQGdldFBvaW50KGN1cnNvcikpXG5cbiAgZ2V0UG9pbnRGb3JUYWc6IChwb2ludCkgLT5cbiAgICBwYWlySW5mbyA9IEBuZXcoXCJBVGFnXCIpLmdldFBhaXJJbmZvKHBvaW50KVxuICAgIHJldHVybiBudWxsIHVubGVzcyBwYWlySW5mbz9cbiAgICB7b3BlblJhbmdlLCBjbG9zZVJhbmdlfSA9IHBhaXJJbmZvXG4gICAgb3BlblJhbmdlID0gb3BlblJhbmdlLnRyYW5zbGF0ZShbMCwgKzFdLCBbMCwgLTFdKVxuICAgIGNsb3NlUmFuZ2UgPSBjbG9zZVJhbmdlLnRyYW5zbGF0ZShbMCwgKzFdLCBbMCwgLTFdKVxuICAgIHJldHVybiBjbG9zZVJhbmdlLnN0YXJ0IGlmIG9wZW5SYW5nZS5jb250YWluc1BvaW50KHBvaW50KSBhbmQgKG5vdCBwb2ludC5pc0VxdWFsKG9wZW5SYW5nZS5lbmQpKVxuICAgIHJldHVybiBvcGVuUmFuZ2Uuc3RhcnQgaWYgY2xvc2VSYW5nZS5jb250YWluc1BvaW50KHBvaW50KSBhbmQgKG5vdCBwb2ludC5pc0VxdWFsKGNsb3NlUmFuZ2UuZW5kKSlcblxuICBnZXRQb2ludDogKGN1cnNvcikgLT5cbiAgICBjdXJzb3JQb3NpdGlvbiA9IGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXG4gICAgY3Vyc29yUm93ID0gY3Vyc29yUG9zaXRpb24ucm93XG4gICAgcmV0dXJuIHBvaW50IGlmIHBvaW50ID0gQGdldFBvaW50Rm9yVGFnKGN1cnNvclBvc2l0aW9uKVxuXG4gICAgIyBBQW55UGFpckFsbG93Rm9yd2FyZGluZyByZXR1cm4gZm9yd2FyZGluZyByYW5nZSBvciBlbmNsb3NpbmcgcmFuZ2UuXG4gICAgcmFuZ2UgPSBAbmV3KFwiQUFueVBhaXJBbGxvd0ZvcndhcmRpbmdcIiwge0BtZW1iZXJ9KS5nZXRSYW5nZShjdXJzb3Iuc2VsZWN0aW9uKVxuICAgIHJldHVybiBudWxsIHVubGVzcyByYW5nZT9cbiAgICB7c3RhcnQsIGVuZH0gPSByYW5nZVxuICAgIGlmIChzdGFydC5yb3cgaXMgY3Vyc29yUm93KSBhbmQgc3RhcnQuaXNHcmVhdGVyVGhhbk9yRXF1YWwoY3Vyc29yUG9zaXRpb24pXG4gICAgICAjIEZvcndhcmRpbmcgcmFuZ2UgZm91bmRcbiAgICAgIGVuZC50cmFuc2xhdGUoWzAsIC0xXSlcbiAgICBlbHNlIGlmIGVuZC5yb3cgaXMgY3Vyc29yUG9zaXRpb24ucm93XG4gICAgICAjIEVuY2xvc2luZyByYW5nZSB3YXMgcmV0dXJuZWRcbiAgICAgICMgV2UgbW92ZSB0byBzdGFydCggb3Blbi1wYWlyICkgb25seSB3aGVuIGNsb3NlLXBhaXIgd2FzIGF0IHNhbWUgcm93IGFzIGN1cnNvci1yb3cuXG4gICAgICBzdGFydFxuIl19
