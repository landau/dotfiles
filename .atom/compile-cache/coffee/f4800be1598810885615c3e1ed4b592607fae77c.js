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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvbW90aW9uLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsMndFQUFBO0lBQUE7OztFQUFBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVI7O0VBQ0osTUFBaUIsT0FBQSxDQUFRLE1BQVIsQ0FBakIsRUFBQyxpQkFBRCxFQUFROztFQUVSLE9BeUJJLE9BQUEsQ0FBUSxTQUFSLENBekJKLEVBQ0Usb0NBREYsRUFDa0Isc0NBRGxCLEVBRUUsNENBRkYsRUFFc0IsZ0RBRnRCLEVBR0Usa0RBSEYsRUFJRSx3REFKRixFQUk0QixzREFKNUIsRUFLRSxnREFMRixFQUt3QixnREFMeEIsRUFNRSxzRUFORixFQU9FLDRCQVBGLEVBUUUsOENBUkYsRUFTRSxrRUFURixFQVVFLDRCQVZGLEVBV0UsZ0RBWEYsRUFZRSxnRkFaRixFQWFFLGdFQWJGLEVBY0Usd0VBZEYsRUFlRSxrQ0FmRixFQWdCRSxnREFoQkYsRUFpQkUsZ0NBakJGLEVBa0JFLHNDQWxCRixFQW1CRSw4QkFuQkYsRUFvQkUsd0JBcEJGLEVBcUJFLDhEQXJCRixFQXNCRSxzRUF0QkYsRUF1QkUsd0RBdkJGLEVBd0JFOztFQUdGLElBQUEsR0FBTyxPQUFBLENBQVEsUUFBUjs7RUFFRDs7O0lBQ0osTUFBQyxDQUFBLE1BQUQsQ0FBUSxLQUFSOztJQUNBLE1BQUMsQ0FBQSxhQUFELEdBQWdCOztxQkFDaEIsU0FBQSxHQUFXOztxQkFDWCxJQUFBLEdBQU07O3FCQUNOLElBQUEsR0FBTTs7cUJBQ04sY0FBQSxHQUFnQjs7cUJBQ2hCLGFBQUEsR0FBZTs7cUJBQ2YscUJBQUEsR0FBdUI7O0lBRVYsZ0JBQUE7TUFDWCx5Q0FBQSxTQUFBO01BRUEsSUFBRyxJQUFDLENBQUEsSUFBRCxLQUFTLFFBQVo7UUFDRSxJQUFDLENBQUEsSUFB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LEdBQUcsQ0FBQyxTQUFKLENBQWMsQ0FBQyxDQUFELEVBQUksQ0FBQyxDQUFMLENBQWQsRUFGRjtPQUFBLE1BR0ssSUFBRyxHQUFHLENBQUMsR0FBSixLQUFXLGNBQWMsQ0FBQyxHQUE3QjtlQUdILE1BSEc7O0lBWkc7Ozs7S0FsQmE7QUE1a0N6QiIsInNvdXJjZXNDb250ZW50IjpbIl8gPSByZXF1aXJlICd1bmRlcnNjb3JlLXBsdXMnXG57UG9pbnQsIFJhbmdlfSA9IHJlcXVpcmUgJ2F0b20nXG5cbntcbiAgbW92ZUN1cnNvckxlZnQsIG1vdmVDdXJzb3JSaWdodFxuICBtb3ZlQ3Vyc29yVXBTY3JlZW4sIG1vdmVDdXJzb3JEb3duU2NyZWVuXG4gIHBvaW50SXNBdFZpbUVuZE9mRmlsZVxuICBnZXRGaXJzdFZpc2libGVTY3JlZW5Sb3csIGdldExhc3RWaXNpYmxlU2NyZWVuUm93XG4gIGdldFZhbGlkVmltU2NyZWVuUm93LCBnZXRWYWxpZFZpbUJ1ZmZlclJvd1xuICBtb3ZlQ3Vyc29yVG9GaXJzdENoYXJhY3RlckF0Um93XG4gIHNvcnRSYW5nZXNcbiAgcG9pbnRJc09uV2hpdGVTcGFjZVxuICBtb3ZlQ3Vyc29yVG9OZXh0Tm9uV2hpdGVzcGFjZVxuICBpc0VtcHR5Um93XG4gIGdldENvZGVGb2xkUm93UmFuZ2VzXG4gIGdldExhcmdlc3RGb2xkUmFuZ2VDb250YWluc0J1ZmZlclJvd1xuICBpc0luY2x1ZGVGdW5jdGlvblNjb3BlRm9yUm93XG4gIGRldGVjdFNjb3BlU3RhcnRQb3NpdGlvbkZvclNjb3BlXG4gIGdldEJ1ZmZlclJvd3NcbiAgZ2V0VGV4dEluU2NyZWVuUmFuZ2VcbiAgc2V0QnVmZmVyUm93XG4gIHNldEJ1ZmZlckNvbHVtblxuICBsaW1pdE51bWJlclxuICBnZXRJbmRleFxuICBzbWFydFNjcm9sbFRvQnVmZmVyUG9zaXRpb25cbiAgcG9pbnRJc0F0RW5kT2ZMaW5lQXROb25FbXB0eVJvd1xuICBnZXRFbmRPZkxpbmVGb3JCdWZmZXJSb3dcbiAgZmluZFJhbmdlSW5CdWZmZXJSb3dcbn0gPSByZXF1aXJlICcuL3V0aWxzJ1xuXG5CYXNlID0gcmVxdWlyZSAnLi9iYXNlJ1xuXG5jbGFzcyBNb3Rpb24gZXh0ZW5kcyBCYXNlXG4gIEBleHRlbmQoZmFsc2UpXG4gIEBvcGVyYXRpb25LaW5kOiAnbW90aW9uJ1xuICBpbmNsdXNpdmU6IGZhbHNlXG4gIHdpc2U6ICdjaGFyYWN0ZXJ3aXNlJ1xuICBqdW1wOiBmYWxzZVxuICB2ZXJ0aWNhbE1vdGlvbjogZmFsc2VcbiAgbW92ZVN1Y2NlZWRlZDogbnVsbFxuICBtb3ZlU3VjY2Vzc09uTGluZXdpc2U6IGZhbHNlXG5cbiAgY29uc3RydWN0b3I6IC0+XG4gICAgc3VwZXJcblxuICAgIGlmIEBtb2RlIGlzICd2aXN1YWwnXG4gICAgICBAd2lzZSA9IEBzdWJtb2RlXG4gICAgQGluaXRpYWxpemUoKVxuXG4gIGlzTGluZXdpc2U6IC0+IEB3aXNlIGlzICdsaW5ld2lzZSdcbiAgaXNCbG9ja3dpc2U6IC0+IEB3aXNlIGlzICdibG9ja3dpc2UnXG5cbiAgZm9yY2VXaXNlOiAod2lzZSkgLT5cbiAgICBpZiB3aXNlIGlzICdjaGFyYWN0ZXJ3aXNlJ1xuICAgICAgaWYgQHdpc2UgaXMgJ2xpbmV3aXNlJ1xuICAgICAgICBAaW5jbHVzaXZlID0gZmFsc2VcbiAgICAgIGVsc2VcbiAgICAgICAgQGluY2x1c2l2ZSA9IG5vdCBAaW5jbHVzaXZlXG4gICAgQHdpc2UgPSB3aXNlXG5cbiAgc2V0QnVmZmVyUG9zaXRpb25TYWZlbHk6IChjdXJzb3IsIHBvaW50KSAtPlxuICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihwb2ludCkgaWYgcG9pbnQ/XG5cbiAgc2V0U2NyZWVuUG9zaXRpb25TYWZlbHk6IChjdXJzb3IsIHBvaW50KSAtPlxuICAgIGN1cnNvci5zZXRTY3JlZW5Qb3NpdGlvbihwb2ludCkgaWYgcG9pbnQ/XG5cbiAgbW92ZVdpdGhTYXZlSnVtcDogKGN1cnNvcikgLT5cbiAgICBpZiBjdXJzb3IuaXNMYXN0Q3Vyc29yKCkgYW5kIEBqdW1wXG4gICAgICBjdXJzb3JQb3NpdGlvbiA9IGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXG5cbiAgICBAbW92ZUN1cnNvcihjdXJzb3IpXG5cbiAgICBpZiBjdXJzb3JQb3NpdGlvbj8gYW5kIG5vdCBjdXJzb3JQb3NpdGlvbi5pc0VxdWFsKGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpKVxuICAgICAgQHZpbVN0YXRlLm1hcmsuc2V0KCdgJywgY3Vyc29yUG9zaXRpb24pXG4gICAgICBAdmltU3RhdGUubWFyay5zZXQoXCInXCIsIGN1cnNvclBvc2l0aW9uKVxuXG4gIGV4ZWN1dGU6IC0+XG4gICAgaWYgQG9wZXJhdG9yP1xuICAgICAgQHNlbGVjdCgpXG4gICAgZWxzZVxuICAgICAgQG1vdmVXaXRoU2F2ZUp1bXAoY3Vyc29yKSBmb3IgY3Vyc29yIGluIEBlZGl0b3IuZ2V0Q3Vyc29ycygpXG4gICAgQGVkaXRvci5tZXJnZUN1cnNvcnMoKVxuICAgIEBlZGl0b3IubWVyZ2VJbnRlcnNlY3RpbmdTZWxlY3Rpb25zKClcblxuICAjIE5PVEU6IE1vZGlmeSBzZWxlY3Rpb24gYnkgbW9kdGlvbiwgc2VsZWN0aW9uIGlzIGFscmVhZHkgXCJub3JtYWxpemVkXCIgYmVmb3JlIHRoaXMgZnVuY3Rpb24gaXMgY2FsbGVkLlxuICBzZWxlY3Q6IC0+XG4gICAgaXNPcldhc1Zpc3VhbCA9IEBtb2RlIGlzICd2aXN1YWwnIG9yIEBpcygnQ3VycmVudFNlbGVjdGlvbicpICMgbmVlZCB0byBjYXJlIHdhcyB2aXN1YWwgZm9yIGAuYCByZXBlYXRlZC5cbiAgICBmb3Igc2VsZWN0aW9uIGluIEBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpXG4gICAgICBzZWxlY3Rpb24ubW9kaWZ5U2VsZWN0aW9uID0+XG4gICAgICAgIEBtb3ZlV2l0aFNhdmVKdW1wKHNlbGVjdGlvbi5jdXJzb3IpXG5cbiAgICAgIHN1Y2NlZWRlZCA9IEBtb3ZlU3VjY2VlZGVkID8gbm90IHNlbGVjdGlvbi5pc0VtcHR5KCkgb3IgKEBtb3ZlU3VjY2Vzc09uTGluZXdpc2UgYW5kIEBpc0xpbmV3aXNlKCkpXG4gICAgICBpZiBpc09yV2FzVmlzdWFsIG9yIChzdWNjZWVkZWQgYW5kIChAaW5jbHVzaXZlIG9yIEBpc0xpbmV3aXNlKCkpKVxuICAgICAgICAkc2VsZWN0aW9uID0gQHN3cmFwKHNlbGVjdGlvbilcbiAgICAgICAgJHNlbGVjdGlvbi5zYXZlUHJvcGVydGllcyh0cnVlKSAjIHNhdmUgcHJvcGVydHkgb2YgXCJhbHJlYWR5LW5vcm1hbGl6ZWQtc2VsZWN0aW9uXCJcbiAgICAgICAgJHNlbGVjdGlvbi5hcHBseVdpc2UoQHdpc2UpXG5cbiAgICBAdmltU3RhdGUuZ2V0TGFzdEJsb2Nrd2lzZVNlbGVjdGlvbigpLmF1dG9zY3JvbGwoKSBpZiBAd2lzZSBpcyAnYmxvY2t3aXNlJ1xuXG4gIHNldEN1cnNvckJ1ZmZlclJvdzogKGN1cnNvciwgcm93LCBvcHRpb25zKSAtPlxuICAgIGlmIEB2ZXJ0aWNhbE1vdGlvbiBhbmQgQGdldENvbmZpZygnbW92ZVRvRmlyc3RDaGFyYWN0ZXJPblZlcnRpY2FsTW90aW9uJylcbiAgICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihAZ2V0Rmlyc3RDaGFyYWN0ZXJQb3NpdGlvbkZvckJ1ZmZlclJvdyhyb3cpLCBvcHRpb25zKVxuICAgIGVsc2VcbiAgICAgIHNldEJ1ZmZlclJvdyhjdXJzb3IsIHJvdywgb3B0aW9ucylcblxuICAjIFtOT1RFXVxuICAjIFNpbmNlIHRoaXMgZnVuY3Rpb24gY2hlY2tzIGN1cnNvciBwb3NpdGlvbiBjaGFuZ2UsIGEgY3Vyc29yIHBvc2l0aW9uIE1VU1QgYmVcbiAgIyB1cGRhdGVkIElOIGNhbGxiYWNrKD1mbilcbiAgIyBVcGRhdGluZyBwb2ludCBvbmx5IGluIGNhbGxiYWNrIGlzIHdyb25nLXVzZSBvZiB0aGlzIGZ1bmNpdG9uLFxuICAjIHNpbmNlIGl0IHN0b3BzIGltbWVkaWF0ZWx5IGJlY2F1c2Ugb2Ygbm90IGN1cnNvciBwb3NpdGlvbiBjaGFuZ2UuXG4gIG1vdmVDdXJzb3JDb3VudFRpbWVzOiAoY3Vyc29yLCBmbikgLT5cbiAgICBvbGRQb3NpdGlvbiA9IGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXG4gICAgQGNvdW50VGltZXMgQGdldENvdW50KCksIChzdGF0ZSkgLT5cbiAgICAgIGZuKHN0YXRlKVxuICAgICAgaWYgKG5ld1Bvc2l0aW9uID0gY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKCkpLmlzRXF1YWwob2xkUG9zaXRpb24pXG4gICAgICAgIHN0YXRlLnN0b3AoKVxuICAgICAgb2xkUG9zaXRpb24gPSBuZXdQb3NpdGlvblxuXG4jIFVzZWQgYXMgb3BlcmF0b3IncyB0YXJnZXQgaW4gdmlzdWFsLW1vZGUuXG5jbGFzcyBDdXJyZW50U2VsZWN0aW9uIGV4dGVuZHMgTW90aW9uXG4gIEBleHRlbmQoZmFsc2UpXG4gIHNlbGVjdGlvbkV4dGVudDogbnVsbFxuICBibG9ja3dpc2VTZWxlY3Rpb25FeHRlbnQ6IG51bGxcbiAgaW5jbHVzaXZlOiB0cnVlXG5cbiAgaW5pdGlhbGl6ZTogLT5cbiAgICBzdXBlclxuICAgIEBwb2ludEluZm9CeUN1cnNvciA9IG5ldyBNYXBcblxuICBtb3ZlQ3Vyc29yOiAoY3Vyc29yKSAtPlxuICAgIGlmIEBtb2RlIGlzICd2aXN1YWwnXG4gICAgICBpZiBAaXNCbG9ja3dpc2UoKVxuICAgICAgICBAYmxvY2t3aXNlU2VsZWN0aW9uRXh0ZW50ID0gQHN3cmFwKGN1cnNvci5zZWxlY3Rpb24pLmdldEJsb2Nrd2lzZVNlbGVjdGlvbkV4dGVudCgpXG4gICAgICBlbHNlXG4gICAgICAgIEBzZWxlY3Rpb25FeHRlbnQgPSBAZWRpdG9yLmdldFNlbGVjdGVkQnVmZmVyUmFuZ2UoKS5nZXRFeHRlbnQoKVxuICAgIGVsc2VcbiAgICAgICMgYC5gIHJlcGVhdCBjYXNlXG4gICAgICBwb2ludCA9IGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXG5cbiAgICAgIGlmIEBibG9ja3dpc2VTZWxlY3Rpb25FeHRlbnQ/XG4gICAgICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihwb2ludC50cmFuc2xhdGUoQGJsb2Nrd2lzZVNlbGVjdGlvbkV4dGVudCkpXG4gICAgICBlbHNlXG4gICAgICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihwb2ludC50cmF2ZXJzZShAc2VsZWN0aW9uRXh0ZW50KSlcblxuICBzZWxlY3Q6IC0+XG4gICAgaWYgQG1vZGUgaXMgJ3Zpc3VhbCdcbiAgICAgIHN1cGVyXG4gICAgZWxzZVxuICAgICAgZm9yIGN1cnNvciBpbiBAZWRpdG9yLmdldEN1cnNvcnMoKSB3aGVuIHBvaW50SW5mbyA9IEBwb2ludEluZm9CeUN1cnNvci5nZXQoY3Vyc29yKVxuICAgICAgICB7Y3Vyc29yUG9zaXRpb24sIHN0YXJ0T2ZTZWxlY3Rpb259ID0gcG9pbnRJbmZvXG4gICAgICAgIGlmIGN1cnNvclBvc2l0aW9uLmlzRXF1YWwoY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKCkpXG4gICAgICAgICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHN0YXJ0T2ZTZWxlY3Rpb24pXG4gICAgICBzdXBlclxuXG4gICAgIyAqIFB1cnBvc2Ugb2YgcG9pbnRJbmZvQnlDdXJzb3I/IHNlZSAjMjM1IGZvciBkZXRhaWwuXG4gICAgIyBXaGVuIHN0YXlPblRyYW5zZm9ybVN0cmluZyBpcyBlbmFibGVkLCBjdXJzb3IgcG9zIGlzIG5vdCBzZXQgb24gc3RhcnQgb2ZcbiAgICAjIG9mIHNlbGVjdGVkIHJhbmdlLlxuICAgICMgQnV0IEkgd2FudCBmb2xsb3dpbmcgYmVoYXZpb3IsIHNvIG5lZWQgdG8gcHJlc2VydmUgcG9zaXRpb24gaW5mby5cbiAgICAjICAxLiBgdmo+LmAgLT4gaW5kZW50IHNhbWUgdHdvIHJvd3MgcmVnYXJkbGVzcyBvZiBjdXJyZW50IGN1cnNvcidzIHJvdy5cbiAgICAjICAyLiBgdmo+ai5gIC0+IGluZGVudCB0d28gcm93cyBmcm9tIGN1cnNvcidzIHJvdy5cbiAgICBmb3IgY3Vyc29yIGluIEBlZGl0b3IuZ2V0Q3Vyc29ycygpXG4gICAgICBzdGFydE9mU2VsZWN0aW9uID0gY3Vyc29yLnNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpLnN0YXJ0XG4gICAgICBAb25EaWRGaW5pc2hPcGVyYXRpb24gPT5cbiAgICAgICAgY3Vyc29yUG9zaXRpb24gPSBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuICAgICAgICBAcG9pbnRJbmZvQnlDdXJzb3Iuc2V0KGN1cnNvciwge3N0YXJ0T2ZTZWxlY3Rpb24sIGN1cnNvclBvc2l0aW9ufSlcblxuY2xhc3MgTW92ZUxlZnQgZXh0ZW5kcyBNb3Rpb25cbiAgQGV4dGVuZCgpXG4gIG1vdmVDdXJzb3I6IChjdXJzb3IpIC0+XG4gICAgYWxsb3dXcmFwID0gQGdldENvbmZpZygnd3JhcExlZnRSaWdodE1vdGlvbicpXG4gICAgQG1vdmVDdXJzb3JDb3VudFRpbWVzIGN1cnNvciwgLT5cbiAgICAgIG1vdmVDdXJzb3JMZWZ0KGN1cnNvciwge2FsbG93V3JhcH0pXG5cbmNsYXNzIE1vdmVSaWdodCBleHRlbmRzIE1vdGlvblxuICBAZXh0ZW5kKClcbiAgY2FuV3JhcFRvTmV4dExpbmU6IChjdXJzb3IpIC0+XG4gICAgaWYgQGlzQXNUYXJnZXRFeGNlcHRTZWxlY3QoKSBhbmQgbm90IGN1cnNvci5pc0F0RW5kT2ZMaW5lKClcbiAgICAgIGZhbHNlXG4gICAgZWxzZVxuICAgICAgQGdldENvbmZpZygnd3JhcExlZnRSaWdodE1vdGlvbicpXG5cbiAgbW92ZUN1cnNvcjogKGN1cnNvcikgLT5cbiAgICBAbW92ZUN1cnNvckNvdW50VGltZXMgY3Vyc29yLCA9PlxuICAgICAgY3Vyc29yUG9zaXRpb24gPSBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuICAgICAgQGVkaXRvci51bmZvbGRCdWZmZXJSb3coY3Vyc29yUG9zaXRpb24ucm93KVxuICAgICAgYWxsb3dXcmFwID0gQGNhbldyYXBUb05leHRMaW5lKGN1cnNvcilcbiAgICAgIG1vdmVDdXJzb3JSaWdodChjdXJzb3IpXG4gICAgICBpZiBjdXJzb3IuaXNBdEVuZE9mTGluZSgpIGFuZCBhbGxvd1dyYXAgYW5kIG5vdCBwb2ludElzQXRWaW1FbmRPZkZpbGUoQGVkaXRvciwgY3Vyc29yUG9zaXRpb24pXG4gICAgICAgIG1vdmVDdXJzb3JSaWdodChjdXJzb3IsIHthbGxvd1dyYXB9KVxuXG5jbGFzcyBNb3ZlUmlnaHRCdWZmZXJDb2x1bW4gZXh0ZW5kcyBNb3Rpb25cbiAgQGV4dGVuZChmYWxzZSlcblxuICBtb3ZlQ3Vyc29yOiAoY3Vyc29yKSAtPlxuICAgIHNldEJ1ZmZlckNvbHVtbihjdXJzb3IsIGN1cnNvci5nZXRCdWZmZXJDb2x1bW4oKSArIEBnZXRDb3VudCgpKVxuXG5jbGFzcyBNb3ZlVXAgZXh0ZW5kcyBNb3Rpb25cbiAgQGV4dGVuZCgpXG4gIHdpc2U6ICdsaW5ld2lzZSdcbiAgd3JhcDogZmFsc2VcblxuICBnZXRCdWZmZXJSb3c6IChyb3cpIC0+XG4gICAgcm93ID0gQGdldE5leHRSb3cocm93KVxuICAgIGlmIEBlZGl0b3IuaXNGb2xkZWRBdEJ1ZmZlclJvdyhyb3cpXG4gICAgICBnZXRMYXJnZXN0Rm9sZFJhbmdlQ29udGFpbnNCdWZmZXJSb3coQGVkaXRvciwgcm93KS5zdGFydC5yb3dcbiAgICBlbHNlXG4gICAgICByb3dcblxuICBnZXROZXh0Um93OiAocm93KSAtPlxuICAgIG1pbiA9IDBcbiAgICBpZiBAd3JhcCBhbmQgcm93IGlzIG1pblxuICAgICAgQGdldFZpbUxhc3RCdWZmZXJSb3coKVxuICAgIGVsc2VcbiAgICAgIGxpbWl0TnVtYmVyKHJvdyAtIDEsIHttaW59KVxuXG4gIG1vdmVDdXJzb3I6IChjdXJzb3IpIC0+XG4gICAgQG1vdmVDdXJzb3JDb3VudFRpbWVzIGN1cnNvciwgPT5cbiAgICAgIHNldEJ1ZmZlclJvdyhjdXJzb3IsIEBnZXRCdWZmZXJSb3coY3Vyc29yLmdldEJ1ZmZlclJvdygpKSlcblxuY2xhc3MgTW92ZVVwV3JhcCBleHRlbmRzIE1vdmVVcFxuICBAZXh0ZW5kKClcbiAgd3JhcDogdHJ1ZVxuXG5jbGFzcyBNb3ZlRG93biBleHRlbmRzIE1vdmVVcFxuICBAZXh0ZW5kKClcbiAgd2lzZTogJ2xpbmV3aXNlJ1xuICB3cmFwOiBmYWxzZVxuXG4gIGdldEJ1ZmZlclJvdzogKHJvdykgLT5cbiAgICBpZiBAZWRpdG9yLmlzRm9sZGVkQXRCdWZmZXJSb3cocm93KVxuICAgICAgcm93ID0gZ2V0TGFyZ2VzdEZvbGRSYW5nZUNvbnRhaW5zQnVmZmVyUm93KEBlZGl0b3IsIHJvdykuZW5kLnJvd1xuICAgIEBnZXROZXh0Um93KHJvdylcblxuICBnZXROZXh0Um93OiAocm93KSAtPlxuICAgIG1heCA9IEBnZXRWaW1MYXN0QnVmZmVyUm93KClcbiAgICBpZiBAd3JhcCBhbmQgcm93ID49IG1heFxuICAgICAgMFxuICAgIGVsc2VcbiAgICAgIGxpbWl0TnVtYmVyKHJvdyArIDEsIHttYXh9KVxuXG5jbGFzcyBNb3ZlRG93bldyYXAgZXh0ZW5kcyBNb3ZlRG93blxuICBAZXh0ZW5kKClcbiAgd3JhcDogdHJ1ZVxuXG5jbGFzcyBNb3ZlVXBTY3JlZW4gZXh0ZW5kcyBNb3Rpb25cbiAgQGV4dGVuZCgpXG4gIHdpc2U6ICdsaW5ld2lzZSdcbiAgZGlyZWN0aW9uOiAndXAnXG5cbiAgbW92ZUN1cnNvcjogKGN1cnNvcikgLT5cbiAgICBAbW92ZUN1cnNvckNvdW50VGltZXMgY3Vyc29yLCAtPlxuICAgICAgbW92ZUN1cnNvclVwU2NyZWVuKGN1cnNvcilcblxuY2xhc3MgTW92ZURvd25TY3JlZW4gZXh0ZW5kcyBNb3ZlVXBTY3JlZW5cbiAgQGV4dGVuZCgpXG4gIHdpc2U6ICdsaW5ld2lzZSdcbiAgZGlyZWN0aW9uOiAnZG93bidcblxuICBtb3ZlQ3Vyc29yOiAoY3Vyc29yKSAtPlxuICAgIEBtb3ZlQ3Vyc29yQ291bnRUaW1lcyBjdXJzb3IsIC0+XG4gICAgICBtb3ZlQ3Vyc29yRG93blNjcmVlbihjdXJzb3IpXG5cbiMgTW92ZSBkb3duL3VwIHRvIEVkZ2VcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBTZWUgdDltZC9hdG9tLXZpbS1tb2RlLXBsdXMjMjM2XG4jIEF0IGxlYXN0IHYxLjcuMC4gYnVmZmVyUG9zaXRpb24gYW5kIHNjcmVlblBvc2l0aW9uIGNhbm5vdCBjb252ZXJ0IGFjY3VyYXRlbHlcbiMgd2hlbiByb3cgaXMgZm9sZGVkLlxuY2xhc3MgTW92ZVVwVG9FZGdlIGV4dGVuZHMgTW90aW9uXG4gIEBleHRlbmQoKVxuICB3aXNlOiAnbGluZXdpc2UnXG4gIGp1bXA6IHRydWVcbiAgZGlyZWN0aW9uOiAndXAnXG4gIEBkZXNjcmlwdGlvbjogXCJNb3ZlIGN1cnNvciB1cCB0byAqKmVkZ2UqKiBjaGFyIGF0IHNhbWUtY29sdW1uXCJcblxuICBtb3ZlQ3Vyc29yOiAoY3Vyc29yKSAtPlxuICAgIEBtb3ZlQ3Vyc29yQ291bnRUaW1lcyBjdXJzb3IsID0+XG4gICAgICBAc2V0U2NyZWVuUG9zaXRpb25TYWZlbHkoY3Vyc29yLCBAZ2V0UG9pbnQoY3Vyc29yLmdldFNjcmVlblBvc2l0aW9uKCkpKVxuXG4gIGdldFBvaW50OiAoZnJvbVBvaW50KSAtPlxuICAgIGNvbHVtbiA9IGZyb21Qb2ludC5jb2x1bW5cbiAgICBmb3Igcm93IGluIEBnZXRTY2FuUm93cyhmcm9tUG9pbnQpIHdoZW4gQGlzRWRnZShwb2ludCA9IG5ldyBQb2ludChyb3csIGNvbHVtbikpXG4gICAgICByZXR1cm4gcG9pbnRcblxuICBnZXRTY2FuUm93czogKHtyb3d9KSAtPlxuICAgIHZhbGlkUm93ID0gZ2V0VmFsaWRWaW1TY3JlZW5Sb3cuYmluZChudWxsLCBAZWRpdG9yKVxuICAgIHN3aXRjaCBAZGlyZWN0aW9uXG4gICAgICB3aGVuICd1cCcgdGhlbiBbdmFsaWRSb3cocm93IC0gMSkuLjBdXG4gICAgICB3aGVuICdkb3duJyB0aGVuIFt2YWxpZFJvdyhyb3cgKyAxKS4uQGdldFZpbUxhc3RTY3JlZW5Sb3coKV1cblxuICBpc0VkZ2U6IChwb2ludCkgLT5cbiAgICBpZiBAaXNTdG9wcGFibGVQb2ludChwb2ludClcbiAgICAgICMgSWYgb25lIG9mIGFib3ZlL2JlbG93IHBvaW50IHdhcyBub3Qgc3RvcHBhYmxlLCBpdCdzIEVkZ2UhXG4gICAgICBhYm92ZSA9IHBvaW50LnRyYW5zbGF0ZShbLTEsIDBdKVxuICAgICAgYmVsb3cgPSBwb2ludC50cmFuc2xhdGUoWysxLCAwXSlcbiAgICAgIChub3QgQGlzU3RvcHBhYmxlUG9pbnQoYWJvdmUpKSBvciAobm90IEBpc1N0b3BwYWJsZVBvaW50KGJlbG93KSlcbiAgICBlbHNlXG4gICAgICBmYWxzZVxuXG4gIGlzU3RvcHBhYmxlUG9pbnQ6IChwb2ludCkgLT5cbiAgICBpZiBAaXNOb25XaGl0ZVNwYWNlUG9pbnQocG9pbnQpXG4gICAgICB0cnVlXG4gICAgZWxzZVxuICAgICAgbGVmdFBvaW50ID0gcG9pbnQudHJhbnNsYXRlKFswLCAtMV0pXG4gICAgICByaWdodFBvaW50ID0gcG9pbnQudHJhbnNsYXRlKFswLCArMV0pXG4gICAgICBAaXNOb25XaGl0ZVNwYWNlUG9pbnQobGVmdFBvaW50KSBhbmQgQGlzTm9uV2hpdGVTcGFjZVBvaW50KHJpZ2h0UG9pbnQpXG5cbiAgaXNOb25XaGl0ZVNwYWNlUG9pbnQ6IChwb2ludCkgLT5cbiAgICBjaGFyID0gZ2V0VGV4dEluU2NyZWVuUmFuZ2UoQGVkaXRvciwgUmFuZ2UuZnJvbVBvaW50V2l0aERlbHRhKHBvaW50LCAwLCAxKSlcbiAgICBjaGFyPyBhbmQgL1xcUy8udGVzdChjaGFyKVxuXG5jbGFzcyBNb3ZlRG93blRvRWRnZSBleHRlbmRzIE1vdmVVcFRvRWRnZVxuICBAZXh0ZW5kKClcbiAgQGRlc2NyaXB0aW9uOiBcIk1vdmUgY3Vyc29yIGRvd24gdG8gKiplZGdlKiogY2hhciBhdCBzYW1lLWNvbHVtblwiXG4gIGRpcmVjdGlvbjogJ2Rvd24nXG5cbiMgd29yZFxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBNb3ZlVG9OZXh0V29yZCBleHRlbmRzIE1vdGlvblxuICBAZXh0ZW5kKClcbiAgd29yZFJlZ2V4OiBudWxsXG5cbiAgZ2V0UG9pbnQ6IChwYXR0ZXJuLCBmcm9tKSAtPlxuICAgIHdvcmRSYW5nZSA9IG51bGxcbiAgICBmb3VuZCA9IGZhbHNlXG4gICAgdmltRU9GID0gQGdldFZpbUVvZkJ1ZmZlclBvc2l0aW9uKEBlZGl0b3IpXG5cbiAgICBAc2NhbkZvcndhcmQgcGF0dGVybiwge2Zyb219LCAoe3JhbmdlLCBtYXRjaFRleHQsIHN0b3B9KSAtPlxuICAgICAgd29yZFJhbmdlID0gcmFuZ2VcbiAgICAgICMgSWdub3JlICdlbXB0eSBsaW5lJyBtYXRjaGVzIGJldHdlZW4gJ1xccicgYW5kICdcXG4nXG4gICAgICByZXR1cm4gaWYgbWF0Y2hUZXh0IGlzICcnIGFuZCByYW5nZS5zdGFydC5jb2x1bW4gaXNudCAwXG4gICAgICBpZiByYW5nZS5zdGFydC5pc0dyZWF0ZXJUaGFuKGZyb20pXG4gICAgICAgIGZvdW5kID0gdHJ1ZVxuICAgICAgICBzdG9wKClcblxuICAgIGlmIGZvdW5kXG4gICAgICBwb2ludCA9IHdvcmRSYW5nZS5zdGFydFxuICAgICAgaWYgcG9pbnRJc0F0RW5kT2ZMaW5lQXROb25FbXB0eVJvdyhAZWRpdG9yLCBwb2ludCkgYW5kIG5vdCBwb2ludC5pc0VxdWFsKHZpbUVPRilcbiAgICAgICAgcG9pbnQudHJhdmVyc2UoWzEsIDBdKVxuICAgICAgZWxzZVxuICAgICAgICBwb2ludFxuICAgIGVsc2VcbiAgICAgIHdvcmRSYW5nZT8uZW5kID8gZnJvbVxuXG4gICMgU3BlY2lhbCBjYXNlOiBcImN3XCIgYW5kIFwiY1dcIiBhcmUgdHJlYXRlZCBsaWtlIFwiY2VcIiBhbmQgXCJjRVwiIGlmIHRoZSBjdXJzb3IgaXNcbiAgIyBvbiBhIG5vbi1ibGFuay4gIFRoaXMgaXMgYmVjYXVzZSBcImN3XCIgaXMgaW50ZXJwcmV0ZWQgYXMgY2hhbmdlLXdvcmQsIGFuZCBhXG4gICMgd29yZCBkb2VzIG5vdCBpbmNsdWRlIHRoZSBmb2xsb3dpbmcgd2hpdGUgc3BhY2UuICB7Vmk6IFwiY3dcIiB3aGVuIG9uIGEgYmxhbmtcbiAgIyBmb2xsb3dlZCBieSBvdGhlciBibGFua3MgY2hhbmdlcyBvbmx5IHRoZSBmaXJzdCBibGFuazsgdGhpcyBpcyBwcm9iYWJseSBhXG4gICMgYnVnLCBiZWNhdXNlIFwiZHdcIiBkZWxldGVzIGFsbCB0aGUgYmxhbmtzfVxuICAjXG4gICMgQW5vdGhlciBzcGVjaWFsIGNhc2U6IFdoZW4gdXNpbmcgdGhlIFwid1wiIG1vdGlvbiBpbiBjb21iaW5hdGlvbiB3aXRoIGFuXG4gICMgb3BlcmF0b3IgYW5kIHRoZSBsYXN0IHdvcmQgbW92ZWQgb3ZlciBpcyBhdCB0aGUgZW5kIG9mIGEgbGluZSwgdGhlIGVuZCBvZlxuICAjIHRoYXQgd29yZCBiZWNvbWVzIHRoZSBlbmQgb2YgdGhlIG9wZXJhdGVkIHRleHQsIG5vdCB0aGUgZmlyc3Qgd29yZCBpbiB0aGVcbiAgIyBuZXh0IGxpbmUuXG4gIG1vdmVDdXJzb3I6IChjdXJzb3IpIC0+XG4gICAgY3Vyc29yUG9zaXRpb24gPSBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuICAgIHJldHVybiBpZiBwb2ludElzQXRWaW1FbmRPZkZpbGUoQGVkaXRvciwgY3Vyc29yUG9zaXRpb24pXG4gICAgd2FzT25XaGl0ZVNwYWNlID0gcG9pbnRJc09uV2hpdGVTcGFjZShAZWRpdG9yLCBjdXJzb3JQb3NpdGlvbilcblxuICAgIGlzQXNUYXJnZXRFeGNlcHRTZWxlY3QgPSBAaXNBc1RhcmdldEV4Y2VwdFNlbGVjdCgpXG4gICAgQG1vdmVDdXJzb3JDb3VudFRpbWVzIGN1cnNvciwgKHtpc0ZpbmFsfSkgPT5cbiAgICAgIGN1cnNvclBvc2l0aW9uID0gY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKClcbiAgICAgIGlmIGlzRW1wdHlSb3coQGVkaXRvciwgY3Vyc29yUG9zaXRpb24ucm93KSBhbmQgaXNBc1RhcmdldEV4Y2VwdFNlbGVjdFxuICAgICAgICBwb2ludCA9IGN1cnNvclBvc2l0aW9uLnRyYXZlcnNlKFsxLCAwXSlcbiAgICAgIGVsc2VcbiAgICAgICAgcGF0dGVybiA9IEB3b3JkUmVnZXggPyBjdXJzb3Iud29yZFJlZ0V4cCgpXG4gICAgICAgIHBvaW50ID0gQGdldFBvaW50KHBhdHRlcm4sIGN1cnNvclBvc2l0aW9uKVxuICAgICAgICBpZiBpc0ZpbmFsIGFuZCBpc0FzVGFyZ2V0RXhjZXB0U2VsZWN0XG4gICAgICAgICAgaWYgQG9wZXJhdG9yLmlzKCdDaGFuZ2UnKSBhbmQgKG5vdCB3YXNPbldoaXRlU3BhY2UpXG4gICAgICAgICAgICBwb2ludCA9IGN1cnNvci5nZXRFbmRPZkN1cnJlbnRXb3JkQnVmZmVyUG9zaXRpb24oe0B3b3JkUmVnZXh9KVxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIHBvaW50ID0gUG9pbnQubWluKHBvaW50LCBnZXRFbmRPZkxpbmVGb3JCdWZmZXJSb3coQGVkaXRvciwgY3Vyc29yUG9zaXRpb24ucm93KSlcbiAgICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihwb2ludClcblxuIyBiXG5jbGFzcyBNb3ZlVG9QcmV2aW91c1dvcmQgZXh0ZW5kcyBNb3Rpb25cbiAgQGV4dGVuZCgpXG4gIHdvcmRSZWdleDogbnVsbFxuXG4gIG1vdmVDdXJzb3I6IChjdXJzb3IpIC0+XG4gICAgQG1vdmVDdXJzb3JDb3VudFRpbWVzIGN1cnNvciwgPT5cbiAgICAgIHBvaW50ID0gY3Vyc29yLmdldEJlZ2lubmluZ09mQ3VycmVudFdvcmRCdWZmZXJQb3NpdGlvbih7QHdvcmRSZWdleH0pXG4gICAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24ocG9pbnQpXG5cbmNsYXNzIE1vdmVUb0VuZE9mV29yZCBleHRlbmRzIE1vdGlvblxuICBAZXh0ZW5kKClcbiAgd29yZFJlZ2V4OiBudWxsXG4gIGluY2x1c2l2ZTogdHJ1ZVxuXG4gIG1vdmVUb05leHRFbmRPZldvcmQ6IChjdXJzb3IpIC0+XG4gICAgbW92ZUN1cnNvclRvTmV4dE5vbldoaXRlc3BhY2UoY3Vyc29yKVxuICAgIHBvaW50ID0gY3Vyc29yLmdldEVuZE9mQ3VycmVudFdvcmRCdWZmZXJQb3NpdGlvbih7QHdvcmRSZWdleH0pLnRyYW5zbGF0ZShbMCwgLTFdKVxuICAgIHBvaW50ID0gUG9pbnQubWluKHBvaW50LCBAZ2V0VmltRW9mQnVmZmVyUG9zaXRpb24oKSlcbiAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24ocG9pbnQpXG5cbiAgbW92ZUN1cnNvcjogKGN1cnNvcikgLT5cbiAgICBAbW92ZUN1cnNvckNvdW50VGltZXMgY3Vyc29yLCA9PlxuICAgICAgb3JpZ2luYWxQb2ludCA9IGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXG4gICAgICBAbW92ZVRvTmV4dEVuZE9mV29yZChjdXJzb3IpXG4gICAgICBpZiBvcmlnaW5hbFBvaW50LmlzRXF1YWwoY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKCkpXG4gICAgICAgICMgUmV0cnkgZnJvbSByaWdodCBjb2x1bW4gaWYgY3Vyc29yIHdhcyBhbHJlYWR5IG9uIEVuZE9mV29yZFxuICAgICAgICBjdXJzb3IubW92ZVJpZ2h0KClcbiAgICAgICAgQG1vdmVUb05leHRFbmRPZldvcmQoY3Vyc29yKVxuXG4jIFtUT0RPOiBJbXByb3ZlLCBhY2N1cmFjeV1cbmNsYXNzIE1vdmVUb1ByZXZpb3VzRW5kT2ZXb3JkIGV4dGVuZHMgTW92ZVRvUHJldmlvdXNXb3JkXG4gIEBleHRlbmQoKVxuICBpbmNsdXNpdmU6IHRydWVcblxuICBtb3ZlQ3Vyc29yOiAoY3Vyc29yKSAtPlxuICAgIHRpbWVzID0gQGdldENvdW50KClcbiAgICB3b3JkUmFuZ2UgPSBjdXJzb3IuZ2V0Q3VycmVudFdvcmRCdWZmZXJSYW5nZSgpXG4gICAgY3Vyc29yUG9zaXRpb24gPSBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuXG4gICAgIyBpZiB3ZSdyZSBpbiB0aGUgbWlkZGxlIG9mIGEgd29yZCB0aGVuIHdlIG5lZWQgdG8gbW92ZSB0byBpdHMgc3RhcnRcbiAgICBpZiBjdXJzb3JQb3NpdGlvbi5pc0dyZWF0ZXJUaGFuKHdvcmRSYW5nZS5zdGFydCkgYW5kIGN1cnNvclBvc2l0aW9uLmlzTGVzc1RoYW4od29yZFJhbmdlLmVuZClcbiAgICAgIHRpbWVzICs9IDFcblxuICAgIGZvciBbMS4udGltZXNdXG4gICAgICBwb2ludCA9IGN1cnNvci5nZXRCZWdpbm5pbmdPZkN1cnJlbnRXb3JkQnVmZmVyUG9zaXRpb24oe0B3b3JkUmVnZXh9KVxuICAgICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHBvaW50KVxuXG4gICAgQG1vdmVUb05leHRFbmRPZldvcmQoY3Vyc29yKVxuICAgIGlmIGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpLmlzR3JlYXRlclRoYW5PckVxdWFsKGN1cnNvclBvc2l0aW9uKVxuICAgICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKFswLCAwXSlcblxuICBtb3ZlVG9OZXh0RW5kT2ZXb3JkOiAoY3Vyc29yKSAtPlxuICAgIHBvaW50ID0gY3Vyc29yLmdldEVuZE9mQ3VycmVudFdvcmRCdWZmZXJQb3NpdGlvbih7QHdvcmRSZWdleH0pLnRyYW5zbGF0ZShbMCwgLTFdKVxuICAgIHBvaW50ID0gUG9pbnQubWluKHBvaW50LCBAZ2V0VmltRW9mQnVmZmVyUG9zaXRpb24oKSlcbiAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24ocG9pbnQpXG5cbiMgV2hvbGUgd29yZFxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBNb3ZlVG9OZXh0V2hvbGVXb3JkIGV4dGVuZHMgTW92ZVRvTmV4dFdvcmRcbiAgQGV4dGVuZCgpXG4gIHdvcmRSZWdleDogL14kfFxcUysvZ1xuXG5jbGFzcyBNb3ZlVG9QcmV2aW91c1dob2xlV29yZCBleHRlbmRzIE1vdmVUb1ByZXZpb3VzV29yZFxuICBAZXh0ZW5kKClcbiAgd29yZFJlZ2V4OiAvXiR8XFxTKy9nXG5cbmNsYXNzIE1vdmVUb0VuZE9mV2hvbGVXb3JkIGV4dGVuZHMgTW92ZVRvRW5kT2ZXb3JkXG4gIEBleHRlbmQoKVxuICB3b3JkUmVnZXg6IC9cXFMrL1xuXG4jIFtUT0RPOiBJbXByb3ZlLCBhY2N1cmFjeV1cbmNsYXNzIE1vdmVUb1ByZXZpb3VzRW5kT2ZXaG9sZVdvcmQgZXh0ZW5kcyBNb3ZlVG9QcmV2aW91c0VuZE9mV29yZFxuICBAZXh0ZW5kKClcbiAgd29yZFJlZ2V4OiAvXFxTKy9cblxuIyBBbHBoYW51bWVyaWMgd29yZCBbRXhwZXJpbWVudGFsXVxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBNb3ZlVG9OZXh0QWxwaGFudW1lcmljV29yZCBleHRlbmRzIE1vdmVUb05leHRXb3JkXG4gIEBleHRlbmQoKVxuICBAZGVzY3JpcHRpb246IFwiTW92ZSB0byBuZXh0IGFscGhhbnVtZXJpYyhgL1xcdysvYCkgd29yZFwiXG4gIHdvcmRSZWdleDogL1xcdysvZ1xuXG5jbGFzcyBNb3ZlVG9QcmV2aW91c0FscGhhbnVtZXJpY1dvcmQgZXh0ZW5kcyBNb3ZlVG9QcmV2aW91c1dvcmRcbiAgQGV4dGVuZCgpXG4gIEBkZXNjcmlwdGlvbjogXCJNb3ZlIHRvIHByZXZpb3VzIGFscGhhbnVtZXJpYyhgL1xcdysvYCkgd29yZFwiXG4gIHdvcmRSZWdleDogL1xcdysvXG5cbmNsYXNzIE1vdmVUb0VuZE9mQWxwaGFudW1lcmljV29yZCBleHRlbmRzIE1vdmVUb0VuZE9mV29yZFxuICBAZXh0ZW5kKClcbiAgQGRlc2NyaXB0aW9uOiBcIk1vdmUgdG8gZW5kIG9mIGFscGhhbnVtZXJpYyhgL1xcdysvYCkgd29yZFwiXG4gIHdvcmRSZWdleDogL1xcdysvXG5cbiMgQWxwaGFudW1lcmljIHdvcmQgW0V4cGVyaW1lbnRhbF1cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgTW92ZVRvTmV4dFNtYXJ0V29yZCBleHRlbmRzIE1vdmVUb05leHRXb3JkXG4gIEBleHRlbmQoKVxuICBAZGVzY3JpcHRpb246IFwiTW92ZSB0byBuZXh0IHNtYXJ0IHdvcmQgKGAvW1xcdy1dKy9gKSB3b3JkXCJcbiAgd29yZFJlZ2V4OiAvW1xcdy1dKy9nXG5cbmNsYXNzIE1vdmVUb1ByZXZpb3VzU21hcnRXb3JkIGV4dGVuZHMgTW92ZVRvUHJldmlvdXNXb3JkXG4gIEBleHRlbmQoKVxuICBAZGVzY3JpcHRpb246IFwiTW92ZSB0byBwcmV2aW91cyBzbWFydCB3b3JkIChgL1tcXHctXSsvYCkgd29yZFwiXG4gIHdvcmRSZWdleDogL1tcXHctXSsvXG5cbmNsYXNzIE1vdmVUb0VuZE9mU21hcnRXb3JkIGV4dGVuZHMgTW92ZVRvRW5kT2ZXb3JkXG4gIEBleHRlbmQoKVxuICBAZGVzY3JpcHRpb246IFwiTW92ZSB0byBlbmQgb2Ygc21hcnQgd29yZCAoYC9bXFx3LV0rL2ApIHdvcmRcIlxuICB3b3JkUmVnZXg6IC9bXFx3LV0rL1xuXG4jIFN1YndvcmRcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgTW92ZVRvTmV4dFN1YndvcmQgZXh0ZW5kcyBNb3ZlVG9OZXh0V29yZFxuICBAZXh0ZW5kKClcbiAgbW92ZUN1cnNvcjogKGN1cnNvcikgLT5cbiAgICBAd29yZFJlZ2V4ID0gY3Vyc29yLnN1YndvcmRSZWdFeHAoKVxuICAgIHN1cGVyXG5cbmNsYXNzIE1vdmVUb1ByZXZpb3VzU3Vid29yZCBleHRlbmRzIE1vdmVUb1ByZXZpb3VzV29yZFxuICBAZXh0ZW5kKClcbiAgbW92ZUN1cnNvcjogKGN1cnNvcikgLT5cbiAgICBAd29yZFJlZ2V4ID0gY3Vyc29yLnN1YndvcmRSZWdFeHAoKVxuICAgIHN1cGVyXG5cbmNsYXNzIE1vdmVUb0VuZE9mU3Vid29yZCBleHRlbmRzIE1vdmVUb0VuZE9mV29yZFxuICBAZXh0ZW5kKClcbiAgbW92ZUN1cnNvcjogKGN1cnNvcikgLT5cbiAgICBAd29yZFJlZ2V4ID0gY3Vyc29yLnN1YndvcmRSZWdFeHAoKVxuICAgIHN1cGVyXG5cbiMgU2VudGVuY2VcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBTZW50ZW5jZSBpcyBkZWZpbmVkIGFzIGJlbG93XG4jICAtIGVuZCB3aXRoIFsnLicsICchJywgJz8nXVxuIyAgLSBvcHRpb25hbGx5IGZvbGxvd2VkIGJ5IFsnKScsICddJywgJ1wiJywgXCInXCJdXG4jICAtIGZvbGxvd2VkIGJ5IFsnJCcsICcgJywgJ1xcdCddXG4jICAtIHBhcmFncmFwaCBib3VuZGFyeSBpcyBhbHNvIHNlbnRlbmNlIGJvdW5kYXJ5XG4jICAtIHNlY3Rpb24gYm91bmRhcnkgaXMgYWxzbyBzZW50ZW5jZSBib3VuZGFyeShpZ25vcmUpXG5jbGFzcyBNb3ZlVG9OZXh0U2VudGVuY2UgZXh0ZW5kcyBNb3Rpb25cbiAgQGV4dGVuZCgpXG4gIGp1bXA6IHRydWVcbiAgc2VudGVuY2VSZWdleDogLy8vKD86W1xcLiFcXD9dW1xcKVxcXVwiJ10qXFxzKyl8KFxcbnxcXHJcXG4pLy8vZ1xuICBkaXJlY3Rpb246ICduZXh0J1xuXG4gIG1vdmVDdXJzb3I6IChjdXJzb3IpIC0+XG4gICAgQG1vdmVDdXJzb3JDb3VudFRpbWVzIGN1cnNvciwgPT5cbiAgICAgIEBzZXRCdWZmZXJQb3NpdGlvblNhZmVseShjdXJzb3IsIEBnZXRQb2ludChjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKSkpXG5cbiAgZ2V0UG9pbnQ6IChmcm9tUG9pbnQpIC0+XG4gICAgaWYgQGRpcmVjdGlvbiBpcyAnbmV4dCdcbiAgICAgIEBnZXROZXh0U3RhcnRPZlNlbnRlbmNlKGZyb21Qb2ludClcbiAgICBlbHNlIGlmIEBkaXJlY3Rpb24gaXMgJ3ByZXZpb3VzJ1xuICAgICAgQGdldFByZXZpb3VzU3RhcnRPZlNlbnRlbmNlKGZyb21Qb2ludClcblxuICBpc0JsYW5rUm93OiAocm93KSAtPlxuICAgIEBlZGl0b3IuaXNCdWZmZXJSb3dCbGFuayhyb3cpXG5cbiAgZ2V0TmV4dFN0YXJ0T2ZTZW50ZW5jZTogKGZyb20pIC0+XG4gICAgZm91bmRQb2ludCA9IG51bGxcbiAgICBAc2NhbkZvcndhcmQgQHNlbnRlbmNlUmVnZXgsIHtmcm9tfSwgKHtyYW5nZSwgbWF0Y2hUZXh0LCBtYXRjaCwgc3RvcH0pID0+XG4gICAgICBpZiBtYXRjaFsxXT9cbiAgICAgICAgW3N0YXJ0Um93LCBlbmRSb3ddID0gW3JhbmdlLnN0YXJ0LnJvdywgcmFuZ2UuZW5kLnJvd11cbiAgICAgICAgcmV0dXJuIGlmIEBza2lwQmxhbmtSb3cgYW5kIEBpc0JsYW5rUm93KGVuZFJvdylcbiAgICAgICAgaWYgQGlzQmxhbmtSb3coc3RhcnRSb3cpIGlzbnQgQGlzQmxhbmtSb3coZW5kUm93KVxuICAgICAgICAgIGZvdW5kUG9pbnQgPSBAZ2V0Rmlyc3RDaGFyYWN0ZXJQb3NpdGlvbkZvckJ1ZmZlclJvdyhlbmRSb3cpXG4gICAgICBlbHNlXG4gICAgICAgIGZvdW5kUG9pbnQgPSByYW5nZS5lbmRcbiAgICAgIHN0b3AoKSBpZiBmb3VuZFBvaW50P1xuICAgIGZvdW5kUG9pbnQgPyBAZ2V0VmltRW9mQnVmZmVyUG9zaXRpb24oKVxuXG4gIGdldFByZXZpb3VzU3RhcnRPZlNlbnRlbmNlOiAoZnJvbSkgLT5cbiAgICBmb3VuZFBvaW50ID0gbnVsbFxuICAgIEBzY2FuQmFja3dhcmQgQHNlbnRlbmNlUmVnZXgsIHtmcm9tfSwgKHtyYW5nZSwgbWF0Y2gsIHN0b3AsIG1hdGNoVGV4dH0pID0+XG4gICAgICBpZiBtYXRjaFsxXT9cbiAgICAgICAgW3N0YXJ0Um93LCBlbmRSb3ddID0gW3JhbmdlLnN0YXJ0LnJvdywgcmFuZ2UuZW5kLnJvd11cbiAgICAgICAgaWYgbm90IEBpc0JsYW5rUm93KGVuZFJvdykgYW5kIEBpc0JsYW5rUm93KHN0YXJ0Um93KVxuICAgICAgICAgIHBvaW50ID0gQGdldEZpcnN0Q2hhcmFjdGVyUG9zaXRpb25Gb3JCdWZmZXJSb3coZW5kUm93KVxuICAgICAgICAgIGlmIHBvaW50LmlzTGVzc1RoYW4oZnJvbSlcbiAgICAgICAgICAgIGZvdW5kUG9pbnQgPSBwb2ludFxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJldHVybiBpZiBAc2tpcEJsYW5rUm93XG4gICAgICAgICAgICBmb3VuZFBvaW50ID0gQGdldEZpcnN0Q2hhcmFjdGVyUG9zaXRpb25Gb3JCdWZmZXJSb3coc3RhcnRSb3cpXG4gICAgICBlbHNlXG4gICAgICAgIGlmIHJhbmdlLmVuZC5pc0xlc3NUaGFuKGZyb20pXG4gICAgICAgICAgZm91bmRQb2ludCA9IHJhbmdlLmVuZFxuICAgICAgc3RvcCgpIGlmIGZvdW5kUG9pbnQ/XG4gICAgZm91bmRQb2ludCA/IFswLCAwXVxuXG5jbGFzcyBNb3ZlVG9QcmV2aW91c1NlbnRlbmNlIGV4dGVuZHMgTW92ZVRvTmV4dFNlbnRlbmNlXG4gIEBleHRlbmQoKVxuICBkaXJlY3Rpb246ICdwcmV2aW91cydcblxuY2xhc3MgTW92ZVRvTmV4dFNlbnRlbmNlU2tpcEJsYW5rUm93IGV4dGVuZHMgTW92ZVRvTmV4dFNlbnRlbmNlXG4gIEBleHRlbmQoKVxuICBza2lwQmxhbmtSb3c6IHRydWVcblxuY2xhc3MgTW92ZVRvUHJldmlvdXNTZW50ZW5jZVNraXBCbGFua1JvdyBleHRlbmRzIE1vdmVUb1ByZXZpb3VzU2VudGVuY2VcbiAgQGV4dGVuZCgpXG4gIHNraXBCbGFua1JvdzogdHJ1ZVxuXG4jIFBhcmFncmFwaFxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBNb3ZlVG9OZXh0UGFyYWdyYXBoIGV4dGVuZHMgTW90aW9uXG4gIEBleHRlbmQoKVxuICBqdW1wOiB0cnVlXG4gIGRpcmVjdGlvbjogJ25leHQnXG5cbiAgbW92ZUN1cnNvcjogKGN1cnNvcikgLT5cbiAgICBAbW92ZUN1cnNvckNvdW50VGltZXMgY3Vyc29yLCA9PlxuICAgICAgQHNldEJ1ZmZlclBvc2l0aW9uU2FmZWx5KGN1cnNvciwgQGdldFBvaW50KGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpKSlcblxuICBnZXRQb2ludDogKGZyb21Qb2ludCkgLT5cbiAgICBzdGFydFJvdyA9IGZyb21Qb2ludC5yb3dcbiAgICB3YXNBdE5vbkJsYW5rUm93ID0gbm90IEBlZGl0b3IuaXNCdWZmZXJSb3dCbGFuayhzdGFydFJvdylcbiAgICBmb3Igcm93IGluIGdldEJ1ZmZlclJvd3MoQGVkaXRvciwge3N0YXJ0Um93LCBAZGlyZWN0aW9ufSlcbiAgICAgIGlmIEBlZGl0b3IuaXNCdWZmZXJSb3dCbGFuayhyb3cpXG4gICAgICAgIHJldHVybiBuZXcgUG9pbnQocm93LCAwKSBpZiB3YXNBdE5vbkJsYW5rUm93XG4gICAgICBlbHNlXG4gICAgICAgIHdhc0F0Tm9uQmxhbmtSb3cgPSB0cnVlXG5cbiAgICAjIGZhbGxiYWNrXG4gICAgc3dpdGNoIEBkaXJlY3Rpb25cbiAgICAgIHdoZW4gJ3ByZXZpb3VzJyB0aGVuIG5ldyBQb2ludCgwLCAwKVxuICAgICAgd2hlbiAnbmV4dCcgdGhlbiBAZ2V0VmltRW9mQnVmZmVyUG9zaXRpb24oKVxuXG5jbGFzcyBNb3ZlVG9QcmV2aW91c1BhcmFncmFwaCBleHRlbmRzIE1vdmVUb05leHRQYXJhZ3JhcGhcbiAgQGV4dGVuZCgpXG4gIGRpcmVjdGlvbjogJ3ByZXZpb3VzJ1xuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIE1vdmVUb0JlZ2lubmluZ09mTGluZSBleHRlbmRzIE1vdGlvblxuICBAZXh0ZW5kKClcblxuICBtb3ZlQ3Vyc29yOiAoY3Vyc29yKSAtPlxuICAgIHNldEJ1ZmZlckNvbHVtbihjdXJzb3IsIDApXG5cbmNsYXNzIE1vdmVUb0NvbHVtbiBleHRlbmRzIE1vdGlvblxuICBAZXh0ZW5kKClcblxuICBtb3ZlQ3Vyc29yOiAoY3Vyc29yKSAtPlxuICAgIHNldEJ1ZmZlckNvbHVtbihjdXJzb3IsIEBnZXRDb3VudCgtMSkpXG5cbmNsYXNzIE1vdmVUb0xhc3RDaGFyYWN0ZXJPZkxpbmUgZXh0ZW5kcyBNb3Rpb25cbiAgQGV4dGVuZCgpXG5cbiAgbW92ZUN1cnNvcjogKGN1cnNvcikgLT5cbiAgICByb3cgPSBnZXRWYWxpZFZpbUJ1ZmZlclJvdyhAZWRpdG9yLCBjdXJzb3IuZ2V0QnVmZmVyUm93KCkgKyBAZ2V0Q291bnQoLTEpKVxuICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihbcm93LCBJbmZpbml0eV0pXG4gICAgY3Vyc29yLmdvYWxDb2x1bW4gPSBJbmZpbml0eVxuXG5jbGFzcyBNb3ZlVG9MYXN0Tm9uYmxhbmtDaGFyYWN0ZXJPZkxpbmVBbmREb3duIGV4dGVuZHMgTW90aW9uXG4gIEBleHRlbmQoKVxuICBpbmNsdXNpdmU6IHRydWVcblxuICBtb3ZlQ3Vyc29yOiAoY3Vyc29yKSAtPlxuICAgIHBvaW50ID0gQGdldFBvaW50KGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpKVxuICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihwb2ludClcblxuICBnZXRQb2ludDogKHtyb3d9KSAtPlxuICAgIHJvdyA9IGxpbWl0TnVtYmVyKHJvdyArIEBnZXRDb3VudCgtMSksIG1heDogQGdldFZpbUxhc3RCdWZmZXJSb3coKSlcbiAgICByYW5nZSA9IGZpbmRSYW5nZUluQnVmZmVyUm93KEBlZGl0b3IsIC9cXFN8Xi8sIHJvdywgZGlyZWN0aW9uOiAnYmFja3dhcmQnKVxuICAgIHJhbmdlPy5zdGFydCA/IG5ldyBQb2ludChyb3csIDApXG5cbiMgTW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmUgZmFpbWlseVxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIE1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lIGV4dGVuZHMgTW90aW9uXG4gIEBleHRlbmQoKVxuICBtb3ZlQ3Vyc29yOiAoY3Vyc29yKSAtPlxuICAgIHBvaW50ID0gQGdldEZpcnN0Q2hhcmFjdGVyUG9zaXRpb25Gb3JCdWZmZXJSb3coY3Vyc29yLmdldEJ1ZmZlclJvdygpKVxuICAgIEBzZXRCdWZmZXJQb3NpdGlvblNhZmVseShjdXJzb3IsIHBvaW50KVxuXG5jbGFzcyBNb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZVVwIGV4dGVuZHMgTW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmVcbiAgQGV4dGVuZCgpXG4gIHdpc2U6ICdsaW5ld2lzZSdcbiAgbW92ZUN1cnNvcjogKGN1cnNvcikgLT5cbiAgICBAbW92ZUN1cnNvckNvdW50VGltZXMgY3Vyc29yLCAtPlxuICAgICAgcG9pbnQgPSBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuICAgICAgdW5sZXNzIHBvaW50LnJvdyBpcyAwXG4gICAgICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihwb2ludC50cmFuc2xhdGUoWy0xLCAwXSkpXG4gICAgc3VwZXJcblxuY2xhc3MgTW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmVEb3duIGV4dGVuZHMgTW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmVcbiAgQGV4dGVuZCgpXG4gIHdpc2U6ICdsaW5ld2lzZSdcbiAgbW92ZUN1cnNvcjogKGN1cnNvcikgLT5cbiAgICBAbW92ZUN1cnNvckNvdW50VGltZXMgY3Vyc29yLCA9PlxuICAgICAgcG9pbnQgPSBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuICAgICAgdW5sZXNzIEBnZXRWaW1MYXN0QnVmZmVyUm93KCkgaXMgcG9pbnQucm93XG4gICAgICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihwb2ludC50cmFuc2xhdGUoWysxLCAwXSkpXG4gICAgc3VwZXJcblxuY2xhc3MgTW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmVBbmREb3duIGV4dGVuZHMgTW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmVEb3duXG4gIEBleHRlbmQoKVxuICBkZWZhdWx0Q291bnQ6IDBcbiAgZ2V0Q291bnQ6IC0+IHN1cGVyIC0gMVxuXG4jIGtleW1hcDogZyBnXG5jbGFzcyBNb3ZlVG9GaXJzdExpbmUgZXh0ZW5kcyBNb3Rpb25cbiAgQGV4dGVuZCgpXG4gIHdpc2U6ICdsaW5ld2lzZSdcbiAganVtcDogdHJ1ZVxuICB2ZXJ0aWNhbE1vdGlvbjogdHJ1ZVxuICBtb3ZlU3VjY2Vzc09uTGluZXdpc2U6IHRydWVcblxuICBtb3ZlQ3Vyc29yOiAoY3Vyc29yKSAtPlxuICAgIEBzZXRDdXJzb3JCdWZmZXJSb3coY3Vyc29yLCBnZXRWYWxpZFZpbUJ1ZmZlclJvdyhAZWRpdG9yLCBAZ2V0Um93KCkpKVxuICAgIGN1cnNvci5hdXRvc2Nyb2xsKGNlbnRlcjogdHJ1ZSlcblxuICBnZXRSb3c6IC0+XG4gICAgQGdldENvdW50KC0xKVxuXG4jIGtleW1hcDogR1xuY2xhc3MgTW92ZVRvTGFzdExpbmUgZXh0ZW5kcyBNb3ZlVG9GaXJzdExpbmVcbiAgQGV4dGVuZCgpXG4gIGRlZmF1bHRDb3VudDogSW5maW5pdHlcblxuIyBrZXltYXA6IE4lIGUuZy4gMTAlXG5jbGFzcyBNb3ZlVG9MaW5lQnlQZXJjZW50IGV4dGVuZHMgTW92ZVRvRmlyc3RMaW5lXG4gIEBleHRlbmQoKVxuXG4gIGdldFJvdzogLT5cbiAgICBwZXJjZW50ID0gbGltaXROdW1iZXIoQGdldENvdW50KCksIG1heDogMTAwKVxuICAgIE1hdGguZmxvb3IoKEBlZGl0b3IuZ2V0TGluZUNvdW50KCkgLSAxKSAqIChwZXJjZW50IC8gMTAwKSlcblxuY2xhc3MgTW92ZVRvUmVsYXRpdmVMaW5lIGV4dGVuZHMgTW90aW9uXG4gIEBleHRlbmQoZmFsc2UpXG4gIHdpc2U6ICdsaW5ld2lzZSdcbiAgbW92ZVN1Y2Nlc3NPbkxpbmV3aXNlOiB0cnVlXG5cbiAgbW92ZUN1cnNvcjogKGN1cnNvcikgLT5cbiAgICBzZXRCdWZmZXJSb3coY3Vyc29yLCBjdXJzb3IuZ2V0QnVmZmVyUm93KCkgKyBAZ2V0Q291bnQoLTEpKVxuXG5jbGFzcyBNb3ZlVG9SZWxhdGl2ZUxpbmVNaW5pbXVtT25lIGV4dGVuZHMgTW92ZVRvUmVsYXRpdmVMaW5lXG4gIEBleHRlbmQoZmFsc2UpXG5cbiAgZ2V0Q291bnQ6IC0+XG4gICAgbGltaXROdW1iZXIoc3VwZXIsIG1pbjogMSlcblxuIyBQb3NpdGlvbiBjdXJzb3Igd2l0aG91dCBzY3JvbGxpbmcuLCBILCBNLCBMXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMga2V5bWFwOiBIXG5jbGFzcyBNb3ZlVG9Ub3BPZlNjcmVlbiBleHRlbmRzIE1vdGlvblxuICBAZXh0ZW5kKClcbiAgd2lzZTogJ2xpbmV3aXNlJ1xuICBqdW1wOiB0cnVlXG4gIHNjcm9sbG9mZjogMlxuICBkZWZhdWx0Q291bnQ6IDBcbiAgdmVydGljYWxNb3Rpb246IHRydWVcblxuICBtb3ZlQ3Vyc29yOiAoY3Vyc29yKSAtPlxuICAgIGJ1ZmZlclJvdyA9IEBlZGl0b3IuYnVmZmVyUm93Rm9yU2NyZWVuUm93KEBnZXRTY3JlZW5Sb3coKSlcbiAgICBAc2V0Q3Vyc29yQnVmZmVyUm93KGN1cnNvciwgYnVmZmVyUm93KVxuXG4gIGdldFNjcm9sbG9mZjogLT5cbiAgICBpZiBAaXNBc1RhcmdldEV4Y2VwdFNlbGVjdCgpXG4gICAgICAwXG4gICAgZWxzZVxuICAgICAgQHNjcm9sbG9mZlxuXG4gIGdldFNjcmVlblJvdzogLT5cbiAgICBmaXJzdFJvdyA9IGdldEZpcnN0VmlzaWJsZVNjcmVlblJvdyhAZWRpdG9yKVxuICAgIG9mZnNldCA9IEBnZXRTY3JvbGxvZmYoKVxuICAgIG9mZnNldCA9IDAgaWYgZmlyc3RSb3cgaXMgMFxuICAgIG9mZnNldCA9IGxpbWl0TnVtYmVyKEBnZXRDb3VudCgtMSksIG1pbjogb2Zmc2V0KVxuICAgIGZpcnN0Um93ICsgb2Zmc2V0XG5cbiMga2V5bWFwOiBNXG5jbGFzcyBNb3ZlVG9NaWRkbGVPZlNjcmVlbiBleHRlbmRzIE1vdmVUb1RvcE9mU2NyZWVuXG4gIEBleHRlbmQoKVxuICBnZXRTY3JlZW5Sb3c6IC0+XG4gICAgc3RhcnRSb3cgPSBnZXRGaXJzdFZpc2libGVTY3JlZW5Sb3coQGVkaXRvcilcbiAgICBlbmRSb3cgPSBsaW1pdE51bWJlcihAZWRpdG9yLmdldExhc3RWaXNpYmxlU2NyZWVuUm93KCksIG1heDogQGdldFZpbUxhc3RTY3JlZW5Sb3coKSlcbiAgICBzdGFydFJvdyArIE1hdGguZmxvb3IoKGVuZFJvdyAtIHN0YXJ0Um93KSAvIDIpXG5cbiMga2V5bWFwOiBMXG5jbGFzcyBNb3ZlVG9Cb3R0b21PZlNjcmVlbiBleHRlbmRzIE1vdmVUb1RvcE9mU2NyZWVuXG4gIEBleHRlbmQoKVxuICBnZXRTY3JlZW5Sb3c6IC0+XG4gICAgIyBbRklYTUVdXG4gICAgIyBBdCBsZWFzdCBBdG9tIHYxLjYuMCwgdGhlcmUgYXJlIHR3byBpbXBsZW1lbnRhdGlvbiBvZiBnZXRMYXN0VmlzaWJsZVNjcmVlblJvdygpXG4gICAgIyBlZGl0b3IuZ2V0TGFzdFZpc2libGVTY3JlZW5Sb3coKSBhbmQgZWRpdG9yRWxlbWVudC5nZXRMYXN0VmlzaWJsZVNjcmVlblJvdygpXG4gICAgIyBUaG9zZSB0d28gbWV0aG9kcyByZXR1cm4gZGlmZmVyZW50IHZhbHVlLCBlZGl0b3IncyBvbmUgaXMgY29ycmVudC5cbiAgICAjIFNvIEkgaW50ZW50aW9uYWxseSB1c2UgZWRpdG9yLmdldExhc3RTY3JlZW5Sb3cgaGVyZS5cbiAgICB2aW1MYXN0U2NyZWVuUm93ID0gQGdldFZpbUxhc3RTY3JlZW5Sb3coKVxuICAgIHJvdyA9IGxpbWl0TnVtYmVyKEBlZGl0b3IuZ2V0TGFzdFZpc2libGVTY3JlZW5Sb3coKSwgbWF4OiB2aW1MYXN0U2NyZWVuUm93KVxuICAgIG9mZnNldCA9IEBnZXRTY3JvbGxvZmYoKSArIDFcbiAgICBvZmZzZXQgPSAwIGlmIHJvdyBpcyB2aW1MYXN0U2NyZWVuUm93XG4gICAgb2Zmc2V0ID0gbGltaXROdW1iZXIoQGdldENvdW50KC0xKSwgbWluOiBvZmZzZXQpXG4gICAgcm93IC0gb2Zmc2V0XG5cbiMgU2Nyb2xsaW5nXG4jIEhhbGY6IGN0cmwtZCwgY3RybC11XG4jIEZ1bGw6IGN0cmwtZiwgY3RybC1iXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgW0ZJWE1FXSBjb3VudCBiZWhhdmUgZGlmZmVyZW50bHkgZnJvbSBvcmlnaW5hbCBWaW0uXG5jbGFzcyBTY3JvbGwgZXh0ZW5kcyBNb3Rpb25cbiAgQGV4dGVuZChmYWxzZSlcbiAgdmVydGljYWxNb3Rpb246IHRydWVcblxuICBpc1Ntb290aFNjcm9sbEVuYWJsZWQ6IC0+XG4gICAgaWYgTWF0aC5hYnMoQGFtb3VudE9mUGFnZSkgaXMgMVxuICAgICAgQGdldENvbmZpZygnc21vb3RoU2Nyb2xsT25GdWxsU2Nyb2xsTW90aW9uJylcbiAgICBlbHNlXG4gICAgICBAZ2V0Q29uZmlnKCdzbW9vdGhTY3JvbGxPbkhhbGZTY3JvbGxNb3Rpb24nKVxuXG4gIGdldFNtb290aFNjcm9sbER1YXRpb246IC0+XG4gICAgaWYgTWF0aC5hYnMoQGFtb3VudE9mUGFnZSkgaXMgMVxuICAgICAgQGdldENvbmZpZygnc21vb3RoU2Nyb2xsT25GdWxsU2Nyb2xsTW90aW9uRHVyYXRpb24nKVxuICAgIGVsc2VcbiAgICAgIEBnZXRDb25maWcoJ3Ntb290aFNjcm9sbE9uSGFsZlNjcm9sbE1vdGlvbkR1cmF0aW9uJylcblxuICBnZXRQaXhlbFJlY3RUb3BGb3JTY2VlblJvdzogKHJvdykgLT5cbiAgICBwb2ludCA9IG5ldyBQb2ludChyb3csIDApXG4gICAgQGVkaXRvci5lbGVtZW50LnBpeGVsUmVjdEZvclNjcmVlblJhbmdlKG5ldyBSYW5nZShwb2ludCwgcG9pbnQpKS50b3BcblxuICBzbW9vdGhTY3JvbGw6IChmcm9tUm93LCB0b1Jvdywgb3B0aW9ucz17fSkgLT5cbiAgICB0b3BQaXhlbEZyb20gPSB7dG9wOiBAZ2V0UGl4ZWxSZWN0VG9wRm9yU2NlZW5Sb3coZnJvbVJvdyl9XG4gICAgdG9wUGl4ZWxUbyA9IHt0b3A6IEBnZXRQaXhlbFJlY3RUb3BGb3JTY2VlblJvdyh0b1Jvdyl9XG4gICAgb3B0aW9ucy5zdGVwID0gKG5ld1RvcCkgPT4gQGVkaXRvci5lbGVtZW50LnNldFNjcm9sbFRvcChuZXdUb3ApXG4gICAgb3B0aW9ucy5kdXJhdGlvbiA9IEBnZXRTbW9vdGhTY3JvbGxEdWF0aW9uKClcbiAgICBAdmltU3RhdGUucmVxdWVzdFNjcm9sbEFuaW1hdGlvbih0b3BQaXhlbEZyb20sIHRvcFBpeGVsVG8sIG9wdGlvbnMpXG5cbiAgZ2V0QW1vdW50T2ZSb3dzOiAtPlxuICAgIE1hdGguY2VpbChAYW1vdW50T2ZQYWdlICogQGVkaXRvci5nZXRSb3dzUGVyUGFnZSgpICogQGdldENvdW50KCkpXG5cbiAgZ2V0QnVmZmVyUm93OiAoY3Vyc29yKSAtPlxuICAgIHNjcmVlblJvdyA9IGdldFZhbGlkVmltU2NyZWVuUm93KEBlZGl0b3IsIGN1cnNvci5nZXRTY3JlZW5Sb3coKSArIEBnZXRBbW91bnRPZlJvd3MoKSlcbiAgICBAZWRpdG9yLmJ1ZmZlclJvd0ZvclNjcmVlblJvdyhzY3JlZW5Sb3cpXG5cbiAgbW92ZUN1cnNvcjogKGN1cnNvcikgLT5cbiAgICBidWZmZXJSb3cgPSBAZ2V0QnVmZmVyUm93KGN1cnNvcilcbiAgICBAc2V0Q3Vyc29yQnVmZmVyUm93KGN1cnNvciwgQGdldEJ1ZmZlclJvdyhjdXJzb3IpLCBhdXRvc2Nyb2xsOiBmYWxzZSlcblxuICAgIGlmIGN1cnNvci5pc0xhc3RDdXJzb3IoKVxuICAgICAgaWYgQGlzU21vb3RoU2Nyb2xsRW5hYmxlZCgpXG4gICAgICAgIEB2aW1TdGF0ZS5maW5pc2hTY3JvbGxBbmltYXRpb24oKVxuXG4gICAgICBmaXJzdFZpc2liaWxlU2NyZWVuUm93ID0gQGVkaXRvci5nZXRGaXJzdFZpc2libGVTY3JlZW5Sb3coKVxuICAgICAgbmV3Rmlyc3RWaXNpYmlsZUJ1ZmZlclJvdyA9IEBlZGl0b3IuYnVmZmVyUm93Rm9yU2NyZWVuUm93KGZpcnN0VmlzaWJpbGVTY3JlZW5Sb3cgKyBAZ2V0QW1vdW50T2ZSb3dzKCkpXG4gICAgICBuZXdGaXJzdFZpc2liaWxlU2NyZWVuUm93ID0gQGVkaXRvci5zY3JlZW5Sb3dGb3JCdWZmZXJSb3cobmV3Rmlyc3RWaXNpYmlsZUJ1ZmZlclJvdylcbiAgICAgIGRvbmUgPSA9PlxuICAgICAgICBAZWRpdG9yLnNldEZpcnN0VmlzaWJsZVNjcmVlblJvdyhuZXdGaXJzdFZpc2liaWxlU2NyZWVuUm93KVxuICAgICAgICAjIFtGSVhNRV0gc29tZXRpbWVzLCBzY3JvbGxUb3AgaXMgbm90IHVwZGF0ZWQsIGNhbGxpbmcgdGhpcyBmaXguXG4gICAgICAgICMgSW52ZXN0aWdhdGUgYW5kIGZpbmQgYmV0dGVyIGFwcHJvYWNoIHRoZW4gcmVtb3ZlIHRoaXMgd29ya2Fyb3VuZC5cbiAgICAgICAgQGVkaXRvci5lbGVtZW50LmNvbXBvbmVudC51cGRhdGVTeW5jKClcblxuICAgICAgaWYgQGlzU21vb3RoU2Nyb2xsRW5hYmxlZCgpXG4gICAgICAgIEBzbW9vdGhTY3JvbGwoZmlyc3RWaXNpYmlsZVNjcmVlblJvdywgbmV3Rmlyc3RWaXNpYmlsZVNjcmVlblJvdywge2RvbmV9KVxuICAgICAgZWxzZVxuICAgICAgICBkb25lKClcblxuXG4jIGtleW1hcDogY3RybC1mXG5jbGFzcyBTY3JvbGxGdWxsU2NyZWVuRG93biBleHRlbmRzIFNjcm9sbFxuICBAZXh0ZW5kKHRydWUpXG4gIGFtb3VudE9mUGFnZTogKzFcblxuIyBrZXltYXA6IGN0cmwtYlxuY2xhc3MgU2Nyb2xsRnVsbFNjcmVlblVwIGV4dGVuZHMgU2Nyb2xsXG4gIEBleHRlbmQoKVxuICBhbW91bnRPZlBhZ2U6IC0xXG5cbiMga2V5bWFwOiBjdHJsLWRcbmNsYXNzIFNjcm9sbEhhbGZTY3JlZW5Eb3duIGV4dGVuZHMgU2Nyb2xsXG4gIEBleHRlbmQoKVxuICBhbW91bnRPZlBhZ2U6ICsxIC8gMlxuXG4jIGtleW1hcDogY3RybC11XG5jbGFzcyBTY3JvbGxIYWxmU2NyZWVuVXAgZXh0ZW5kcyBTY3JvbGxcbiAgQGV4dGVuZCgpXG4gIGFtb3VudE9mUGFnZTogLTEgLyAyXG5cbiMgRmluZFxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIGtleW1hcDogZlxuY2xhc3MgRmluZCBleHRlbmRzIE1vdGlvblxuICBAZXh0ZW5kKClcbiAgYmFja3dhcmRzOiBmYWxzZVxuICBpbmNsdXNpdmU6IHRydWVcbiAgb2Zmc2V0OiAwXG4gIHJlcXVpcmVJbnB1dDogdHJ1ZVxuXG4gIGluaXRpYWxpemU6IC0+XG4gICAgc3VwZXJcbiAgICBAZm9jdXNJbnB1dCgpIHVubGVzcyBAaXNDb21wbGV0ZSgpXG5cbiAgaXNCYWNrd2FyZHM6IC0+XG4gICAgQGJhY2t3YXJkc1xuXG4gIGdldFBvaW50OiAoZnJvbVBvaW50KSAtPlxuICAgIHtzdGFydCwgZW5kfSA9IEBlZGl0b3IuYnVmZmVyUmFuZ2VGb3JCdWZmZXJSb3coZnJvbVBvaW50LnJvdylcblxuICAgIG9mZnNldCA9IGlmIEBpc0JhY2t3YXJkcygpIHRoZW4gQG9mZnNldCBlbHNlIC1Ab2Zmc2V0XG4gICAgdW5PZmZzZXQgPSAtb2Zmc2V0ICogQHJlcGVhdGVkXG4gICAgaWYgQGlzQmFja3dhcmRzKClcbiAgICAgIHNjYW5SYW5nZSA9IFtzdGFydCwgZnJvbVBvaW50LnRyYW5zbGF0ZShbMCwgdW5PZmZzZXRdKV1cbiAgICAgIG1ldGhvZCA9ICdiYWNrd2FyZHNTY2FuSW5CdWZmZXJSYW5nZSdcbiAgICBlbHNlXG4gICAgICBzY2FuUmFuZ2UgPSBbZnJvbVBvaW50LnRyYW5zbGF0ZShbMCwgMSArIHVuT2Zmc2V0XSksIGVuZF1cbiAgICAgIG1ldGhvZCA9ICdzY2FuSW5CdWZmZXJSYW5nZSdcblxuICAgIHBvaW50cyA9IFtdXG4gICAgQGVkaXRvclttZXRob2RdIC8vLyN7Xy5lc2NhcGVSZWdFeHAoQGlucHV0KX0vLy9nLCBzY2FuUmFuZ2UsICh7cmFuZ2V9KSAtPlxuICAgICAgcG9pbnRzLnB1c2gocmFuZ2Uuc3RhcnQpXG4gICAgcG9pbnRzW0BnZXRDb3VudCgtMSldPy50cmFuc2xhdGUoWzAsIG9mZnNldF0pXG5cbiAgbW92ZUN1cnNvcjogKGN1cnNvcikgLT5cbiAgICBwb2ludCA9IEBnZXRQb2ludChjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKSlcbiAgICBAc2V0QnVmZmVyUG9zaXRpb25TYWZlbHkoY3Vyc29yLCBwb2ludClcbiAgICBAZ2xvYmFsU3RhdGUuc2V0KCdjdXJyZW50RmluZCcsIHRoaXMpIHVubGVzcyBAcmVwZWF0ZWRcblxuIyBrZXltYXA6IEZcbmNsYXNzIEZpbmRCYWNrd2FyZHMgZXh0ZW5kcyBGaW5kXG4gIEBleHRlbmQoKVxuICBpbmNsdXNpdmU6IGZhbHNlXG4gIGJhY2t3YXJkczogdHJ1ZVxuXG4jIGtleW1hcDogdFxuY2xhc3MgVGlsbCBleHRlbmRzIEZpbmRcbiAgQGV4dGVuZCgpXG4gIG9mZnNldDogMVxuXG4gIGdldFBvaW50OiAtPlxuICAgIEBwb2ludCA9IHN1cGVyXG4gICAgQG1vdmVTdWNjZWVkZWQgPSBAcG9pbnQ/XG4gICAgcmV0dXJuIEBwb2ludFxuXG4jIGtleW1hcDogVFxuY2xhc3MgVGlsbEJhY2t3YXJkcyBleHRlbmRzIFRpbGxcbiAgQGV4dGVuZCgpXG4gIGluY2x1c2l2ZTogZmFsc2VcbiAgYmFja3dhcmRzOiB0cnVlXG5cbiMgTWFya1xuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIGtleW1hcDogYFxuY2xhc3MgTW92ZVRvTWFyayBleHRlbmRzIE1vdGlvblxuICBAZXh0ZW5kKClcbiAganVtcDogdHJ1ZVxuICByZXF1aXJlSW5wdXQ6IHRydWVcbiAgaW5wdXQ6IG51bGwgIyBzZXQgd2hlbiBpbnN0YXRudGlhdGVkIHZpYSB2aW1TdGF0ZTo6bW92ZVRvTWFyaygpXG5cbiAgaW5pdGlhbGl6ZTogLT5cbiAgICBzdXBlclxuICAgIEBmb2N1c0lucHV0KCkgdW5sZXNzIEBpc0NvbXBsZXRlKClcblxuICBnZXRQb2ludDogLT5cbiAgICBAdmltU3RhdGUubWFyay5nZXQoQGlucHV0KVxuXG4gIG1vdmVDdXJzb3I6IChjdXJzb3IpIC0+XG4gICAgaWYgcG9pbnQgPSBAZ2V0UG9pbnQoKVxuICAgICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHBvaW50KVxuICAgICAgY3Vyc29yLmF1dG9zY3JvbGwoY2VudGVyOiB0cnVlKVxuXG4jIGtleW1hcDogJ1xuY2xhc3MgTW92ZVRvTWFya0xpbmUgZXh0ZW5kcyBNb3ZlVG9NYXJrXG4gIEBleHRlbmQoKVxuICB3aXNlOiAnbGluZXdpc2UnXG5cbiAgZ2V0UG9pbnQ6IC0+XG4gICAgaWYgcG9pbnQgPSBzdXBlclxuICAgICAgQGdldEZpcnN0Q2hhcmFjdGVyUG9zaXRpb25Gb3JCdWZmZXJSb3cocG9pbnQucm93KVxuXG4jIEZvbGRcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgTW92ZVRvUHJldmlvdXNGb2xkU3RhcnQgZXh0ZW5kcyBNb3Rpb25cbiAgQGV4dGVuZCgpXG4gIEBkZXNjcmlwdGlvbjogXCJNb3ZlIHRvIHByZXZpb3VzIGZvbGQgc3RhcnRcIlxuICB3aXNlOiAnY2hhcmFjdGVyd2lzZSdcbiAgd2hpY2g6ICdzdGFydCdcbiAgZGlyZWN0aW9uOiAncHJldidcblxuICBpbml0aWFsaXplOiAtPlxuICAgIHN1cGVyXG4gICAgQHJvd3MgPSBAZ2V0Rm9sZFJvd3MoQHdoaWNoKVxuICAgIEByb3dzLnJldmVyc2UoKSBpZiBAZGlyZWN0aW9uIGlzICdwcmV2J1xuXG4gIGdldEZvbGRSb3dzOiAod2hpY2gpIC0+XG4gICAgaW5kZXggPSBpZiB3aGljaCBpcyAnc3RhcnQnIHRoZW4gMCBlbHNlIDFcbiAgICByb3dzID0gZ2V0Q29kZUZvbGRSb3dSYW5nZXMoQGVkaXRvcikubWFwIChyb3dSYW5nZSkgLT5cbiAgICAgIHJvd1JhbmdlW2luZGV4XVxuICAgIF8uc29ydEJ5KF8udW5pcShyb3dzKSwgKHJvdykgLT4gcm93KVxuXG4gIGdldFNjYW5Sb3dzOiAoY3Vyc29yKSAtPlxuICAgIGN1cnNvclJvdyA9IGN1cnNvci5nZXRCdWZmZXJSb3coKVxuICAgIGlzVmFsaWRSb3cgPSBzd2l0Y2ggQGRpcmVjdGlvblxuICAgICAgd2hlbiAncHJldicgdGhlbiAocm93KSAtPiByb3cgPCBjdXJzb3JSb3dcbiAgICAgIHdoZW4gJ25leHQnIHRoZW4gKHJvdykgLT4gcm93ID4gY3Vyc29yUm93XG4gICAgQHJvd3MuZmlsdGVyKGlzVmFsaWRSb3cpXG5cbiAgZGV0ZWN0Um93OiAoY3Vyc29yKSAtPlxuICAgIEBnZXRTY2FuUm93cyhjdXJzb3IpWzBdXG5cbiAgbW92ZUN1cnNvcjogKGN1cnNvcikgLT5cbiAgICBAbW92ZUN1cnNvckNvdW50VGltZXMgY3Vyc29yLCA9PlxuICAgICAgaWYgKHJvdyA9IEBkZXRlY3RSb3coY3Vyc29yKSk/XG4gICAgICAgIG1vdmVDdXJzb3JUb0ZpcnN0Q2hhcmFjdGVyQXRSb3coY3Vyc29yLCByb3cpXG5cbmNsYXNzIE1vdmVUb05leHRGb2xkU3RhcnQgZXh0ZW5kcyBNb3ZlVG9QcmV2aW91c0ZvbGRTdGFydFxuICBAZXh0ZW5kKClcbiAgQGRlc2NyaXB0aW9uOiBcIk1vdmUgdG8gbmV4dCBmb2xkIHN0YXJ0XCJcbiAgZGlyZWN0aW9uOiAnbmV4dCdcblxuY2xhc3MgTW92ZVRvUHJldmlvdXNGb2xkU3RhcnRXaXRoU2FtZUluZGVudCBleHRlbmRzIE1vdmVUb1ByZXZpb3VzRm9sZFN0YXJ0XG4gIEBleHRlbmQoKVxuICBAZGVzY3JpcHRpb246IFwiTW92ZSB0byBwcmV2aW91cyBzYW1lLWluZGVudGVkIGZvbGQgc3RhcnRcIlxuICBkZXRlY3RSb3c6IChjdXJzb3IpIC0+XG4gICAgYmFzZUluZGVudExldmVsID0gQGdldEluZGVudExldmVsRm9yQnVmZmVyUm93KGN1cnNvci5nZXRCdWZmZXJSb3coKSlcbiAgICBmb3Igcm93IGluIEBnZXRTY2FuUm93cyhjdXJzb3IpXG4gICAgICBpZiBAZ2V0SW5kZW50TGV2ZWxGb3JCdWZmZXJSb3cocm93KSBpcyBiYXNlSW5kZW50TGV2ZWxcbiAgICAgICAgcmV0dXJuIHJvd1xuICAgIG51bGxcblxuY2xhc3MgTW92ZVRvTmV4dEZvbGRTdGFydFdpdGhTYW1lSW5kZW50IGV4dGVuZHMgTW92ZVRvUHJldmlvdXNGb2xkU3RhcnRXaXRoU2FtZUluZGVudFxuICBAZXh0ZW5kKClcbiAgQGRlc2NyaXB0aW9uOiBcIk1vdmUgdG8gbmV4dCBzYW1lLWluZGVudGVkIGZvbGQgc3RhcnRcIlxuICBkaXJlY3Rpb246ICduZXh0J1xuXG5jbGFzcyBNb3ZlVG9QcmV2aW91c0ZvbGRFbmQgZXh0ZW5kcyBNb3ZlVG9QcmV2aW91c0ZvbGRTdGFydFxuICBAZXh0ZW5kKClcbiAgQGRlc2NyaXB0aW9uOiBcIk1vdmUgdG8gcHJldmlvdXMgZm9sZCBlbmRcIlxuICB3aGljaDogJ2VuZCdcblxuY2xhc3MgTW92ZVRvTmV4dEZvbGRFbmQgZXh0ZW5kcyBNb3ZlVG9QcmV2aW91c0ZvbGRFbmRcbiAgQGV4dGVuZCgpXG4gIEBkZXNjcmlwdGlvbjogXCJNb3ZlIHRvIG5leHQgZm9sZCBlbmRcIlxuICBkaXJlY3Rpb246ICduZXh0J1xuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIE1vdmVUb1ByZXZpb3VzRnVuY3Rpb24gZXh0ZW5kcyBNb3ZlVG9QcmV2aW91c0ZvbGRTdGFydFxuICBAZXh0ZW5kKClcbiAgQGRlc2NyaXB0aW9uOiBcIk1vdmUgdG8gcHJldmlvdXMgZnVuY3Rpb25cIlxuICBkaXJlY3Rpb246ICdwcmV2J1xuICBkZXRlY3RSb3c6IChjdXJzb3IpIC0+XG4gICAgXy5kZXRlY3QgQGdldFNjYW5Sb3dzKGN1cnNvciksIChyb3cpID0+XG4gICAgICBpc0luY2x1ZGVGdW5jdGlvblNjb3BlRm9yUm93KEBlZGl0b3IsIHJvdylcblxuY2xhc3MgTW92ZVRvTmV4dEZ1bmN0aW9uIGV4dGVuZHMgTW92ZVRvUHJldmlvdXNGdW5jdGlvblxuICBAZXh0ZW5kKClcbiAgQGRlc2NyaXB0aW9uOiBcIk1vdmUgdG8gbmV4dCBmdW5jdGlvblwiXG4gIGRpcmVjdGlvbjogJ25leHQnXG5cbiMgU2NvcGUgYmFzZWRcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgTW92ZVRvUG9zaXRpb25CeVNjb3BlIGV4dGVuZHMgTW90aW9uXG4gIEBleHRlbmQoZmFsc2UpXG4gIGRpcmVjdGlvbjogJ2JhY2t3YXJkJ1xuICBzY29wZTogJy4nXG5cbiAgZ2V0UG9pbnQ6IChmcm9tUG9pbnQpIC0+XG4gICAgZGV0ZWN0U2NvcGVTdGFydFBvc2l0aW9uRm9yU2NvcGUoQGVkaXRvciwgZnJvbVBvaW50LCBAZGlyZWN0aW9uLCBAc2NvcGUpXG5cbiAgbW92ZUN1cnNvcjogKGN1cnNvcikgLT5cbiAgICBAbW92ZUN1cnNvckNvdW50VGltZXMgY3Vyc29yLCA9PlxuICAgICAgQHNldEJ1ZmZlclBvc2l0aW9uU2FmZWx5KGN1cnNvciwgQGdldFBvaW50KGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpKSlcblxuY2xhc3MgTW92ZVRvUHJldmlvdXNTdHJpbmcgZXh0ZW5kcyBNb3ZlVG9Qb3NpdGlvbkJ5U2NvcGVcbiAgQGV4dGVuZCgpXG4gIEBkZXNjcmlwdGlvbjogXCJNb3ZlIHRvIHByZXZpb3VzIHN0cmluZyhzZWFyY2hlZCBieSBgc3RyaW5nLmJlZ2luYCBzY29wZSlcIlxuICBkaXJlY3Rpb246ICdiYWNrd2FyZCdcbiAgc2NvcGU6ICdzdHJpbmcuYmVnaW4nXG5cbmNsYXNzIE1vdmVUb05leHRTdHJpbmcgZXh0ZW5kcyBNb3ZlVG9QcmV2aW91c1N0cmluZ1xuICBAZXh0ZW5kKClcbiAgQGRlc2NyaXB0aW9uOiBcIk1vdmUgdG8gbmV4dCBzdHJpbmcoc2VhcmNoZWQgYnkgYHN0cmluZy5iZWdpbmAgc2NvcGUpXCJcbiAgZGlyZWN0aW9uOiAnZm9yd2FyZCdcblxuY2xhc3MgTW92ZVRvUHJldmlvdXNOdW1iZXIgZXh0ZW5kcyBNb3ZlVG9Qb3NpdGlvbkJ5U2NvcGVcbiAgQGV4dGVuZCgpXG4gIGRpcmVjdGlvbjogJ2JhY2t3YXJkJ1xuICBAZGVzY3JpcHRpb246IFwiTW92ZSB0byBwcmV2aW91cyBudW1iZXIoc2VhcmNoZWQgYnkgYGNvbnN0YW50Lm51bWVyaWNgIHNjb3BlKVwiXG4gIHNjb3BlOiAnY29uc3RhbnQubnVtZXJpYydcblxuY2xhc3MgTW92ZVRvTmV4dE51bWJlciBleHRlbmRzIE1vdmVUb1ByZXZpb3VzTnVtYmVyXG4gIEBleHRlbmQoKVxuICBAZGVzY3JpcHRpb246IFwiTW92ZSB0byBuZXh0IG51bWJlcihzZWFyY2hlZCBieSBgY29uc3RhbnQubnVtZXJpY2Agc2NvcGUpXCJcbiAgZGlyZWN0aW9uOiAnZm9yd2FyZCdcblxuY2xhc3MgTW92ZVRvTmV4dE9jY3VycmVuY2UgZXh0ZW5kcyBNb3Rpb25cbiAgQGV4dGVuZCgpXG4gICMgRW5zdXJlIHRoaXMgY29tbWFuZCBpcyBhdmFpbGFibGUgd2hlbiBoYXMtb2NjdXJyZW5jZVxuICBAY29tbWFuZFNjb3BlOiAnYXRvbS10ZXh0LWVkaXRvci52aW0tbW9kZS1wbHVzLmhhcy1vY2N1cnJlbmNlJ1xuICBqdW1wOiB0cnVlXG4gIGRpcmVjdGlvbjogJ25leHQnXG5cbiAgZ2V0UmFuZ2VzOiAtPlxuICAgIEB2aW1TdGF0ZS5vY2N1cnJlbmNlTWFuYWdlci5nZXRNYXJrZXJzKCkubWFwIChtYXJrZXIpIC0+XG4gICAgICBtYXJrZXIuZ2V0QnVmZmVyUmFuZ2UoKVxuXG4gIGV4ZWN1dGU6IC0+XG4gICAgQHJhbmdlcyA9IEBnZXRSYW5nZXMoKVxuICAgIHN1cGVyXG5cbiAgbW92ZUN1cnNvcjogKGN1cnNvcikgLT5cbiAgICBpbmRleCA9IEBnZXRJbmRleChjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKSlcbiAgICBpZiBpbmRleD9cbiAgICAgIG9mZnNldCA9IHN3aXRjaCBAZGlyZWN0aW9uXG4gICAgICAgIHdoZW4gJ25leHQnIHRoZW4gQGdldENvdW50KC0xKVxuICAgICAgICB3aGVuICdwcmV2aW91cycgdGhlbiAtQGdldENvdW50KC0xKVxuICAgICAgcmFuZ2UgPSBAcmFuZ2VzW2dldEluZGV4KGluZGV4ICsgb2Zmc2V0LCBAcmFuZ2VzKV1cbiAgICAgIHBvaW50ID0gcmFuZ2Uuc3RhcnRcblxuICAgICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHBvaW50LCBhdXRvc2Nyb2xsOiBmYWxzZSlcblxuICAgICAgaWYgY3Vyc29yLmlzTGFzdEN1cnNvcigpXG4gICAgICAgIEBlZGl0b3IudW5mb2xkQnVmZmVyUm93KHBvaW50LnJvdylcbiAgICAgICAgc21hcnRTY3JvbGxUb0J1ZmZlclBvc2l0aW9uKEBlZGl0b3IsIHBvaW50KVxuXG4gICAgICBpZiBAZ2V0Q29uZmlnKCdmbGFzaE9uTW92ZVRvT2NjdXJyZW5jZScpXG4gICAgICAgIEB2aW1TdGF0ZS5mbGFzaChyYW5nZSwgdHlwZTogJ3NlYXJjaCcpXG5cbiAgZ2V0SW5kZXg6IChmcm9tUG9pbnQpIC0+XG4gICAgZm9yIHJhbmdlLCBpIGluIEByYW5nZXMgd2hlbiByYW5nZS5zdGFydC5pc0dyZWF0ZXJUaGFuKGZyb21Qb2ludClcbiAgICAgIHJldHVybiBpXG4gICAgMFxuXG5jbGFzcyBNb3ZlVG9QcmV2aW91c09jY3VycmVuY2UgZXh0ZW5kcyBNb3ZlVG9OZXh0T2NjdXJyZW5jZVxuICBAZXh0ZW5kKClcbiAgZGlyZWN0aW9uOiAncHJldmlvdXMnXG5cbiAgZ2V0SW5kZXg6IChmcm9tUG9pbnQpIC0+XG4gICAgZm9yIHJhbmdlLCBpIGluIEByYW5nZXMgYnkgLTEgd2hlbiByYW5nZS5lbmQuaXNMZXNzVGhhbihmcm9tUG9pbnQpXG4gICAgICByZXR1cm4gaVxuICAgIEByYW5nZXMubGVuZ3RoIC0gMVxuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMga2V5bWFwOiAlXG5jbGFzcyBNb3ZlVG9QYWlyIGV4dGVuZHMgTW90aW9uXG4gIEBleHRlbmQoKVxuICBpbmNsdXNpdmU6IHRydWVcbiAganVtcDogdHJ1ZVxuICBtZW1iZXI6IFsnUGFyZW50aGVzaXMnLCAnQ3VybHlCcmFja2V0JywgJ1NxdWFyZUJyYWNrZXQnLCAnQW5nbGVCcmFja2V0J11cblxuICBtb3ZlQ3Vyc29yOiAoY3Vyc29yKSAtPlxuICAgIEBzZXRCdWZmZXJQb3NpdGlvblNhZmVseShjdXJzb3IsIEBnZXRQb2ludChjdXJzb3IpKVxuXG4gIGdldFBvaW50Rm9yVGFnOiAocG9pbnQpIC0+XG4gICAgcGFpckluZm8gPSBAbmV3KFwiQVRhZ1wiKS5nZXRQYWlySW5mbyhwb2ludClcbiAgICByZXR1cm4gbnVsbCB1bmxlc3MgcGFpckluZm8/XG4gICAge29wZW5SYW5nZSwgY2xvc2VSYW5nZX0gPSBwYWlySW5mb1xuICAgIG9wZW5SYW5nZSA9IG9wZW5SYW5nZS50cmFuc2xhdGUoWzAsICsxXSwgWzAsIC0xXSlcbiAgICBjbG9zZVJhbmdlID0gY2xvc2VSYW5nZS50cmFuc2xhdGUoWzAsICsxXSwgWzAsIC0xXSlcbiAgICByZXR1cm4gY2xvc2VSYW5nZS5zdGFydCBpZiBvcGVuUmFuZ2UuY29udGFpbnNQb2ludChwb2ludCkgYW5kIChub3QgcG9pbnQuaXNFcXVhbChvcGVuUmFuZ2UuZW5kKSlcbiAgICByZXR1cm4gb3BlblJhbmdlLnN0YXJ0IGlmIGNsb3NlUmFuZ2UuY29udGFpbnNQb2ludChwb2ludCkgYW5kIChub3QgcG9pbnQuaXNFcXVhbChjbG9zZVJhbmdlLmVuZCkpXG5cbiAgZ2V0UG9pbnQ6IChjdXJzb3IpIC0+XG4gICAgY3Vyc29yUG9zaXRpb24gPSBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuICAgIGN1cnNvclJvdyA9IGN1cnNvclBvc2l0aW9uLnJvd1xuICAgIHJldHVybiBwb2ludCBpZiBwb2ludCA9IEBnZXRQb2ludEZvclRhZyhjdXJzb3JQb3NpdGlvbilcblxuICAgICMgQUFueVBhaXJBbGxvd0ZvcndhcmRpbmcgcmV0dXJuIGZvcndhcmRpbmcgcmFuZ2Ugb3IgZW5jbG9zaW5nIHJhbmdlLlxuICAgIHJhbmdlID0gQG5ldyhcIkFBbnlQYWlyQWxsb3dGb3J3YXJkaW5nXCIsIHtAbWVtYmVyfSkuZ2V0UmFuZ2UoY3Vyc29yLnNlbGVjdGlvbilcbiAgICByZXR1cm4gbnVsbCB1bmxlc3MgcmFuZ2U/XG4gICAge3N0YXJ0LCBlbmR9ID0gcmFuZ2VcbiAgICBpZiAoc3RhcnQucm93IGlzIGN1cnNvclJvdykgYW5kIHN0YXJ0LmlzR3JlYXRlclRoYW5PckVxdWFsKGN1cnNvclBvc2l0aW9uKVxuICAgICAgIyBGb3J3YXJkaW5nIHJhbmdlIGZvdW5kXG4gICAgICBlbmQudHJhbnNsYXRlKFswLCAtMV0pXG4gICAgZWxzZSBpZiBlbmQucm93IGlzIGN1cnNvclBvc2l0aW9uLnJvd1xuICAgICAgIyBFbmNsb3NpbmcgcmFuZ2Ugd2FzIHJldHVybmVkXG4gICAgICAjIFdlIG1vdmUgdG8gc3RhcnQoIG9wZW4tcGFpciApIG9ubHkgd2hlbiBjbG9zZS1wYWlyIHdhcyBhdCBzYW1lIHJvdyBhcyBjdXJzb3Itcm93LlxuICAgICAgc3RhcnRcbiJdfQ==
