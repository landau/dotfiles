(function() {
  var Base, CurrentSelection, Find, FindBackwards, Motion, MoveDown, MoveDownScreen, MoveDownToEdge, MoveDownWrap, MoveLeft, MoveRight, MoveRightBufferColumn, MoveToBeginningOfLine, MoveToBeginningOfScreenLine, MoveToBottomOfScreen, MoveToColumn, MoveToEndOfAlphanumericWord, MoveToEndOfSmartWord, MoveToEndOfSubword, MoveToEndOfWholeWord, MoveToEndOfWord, MoveToFirstCharacterOfLine, MoveToFirstCharacterOfLineAndDown, MoveToFirstCharacterOfLineDown, MoveToFirstCharacterOfLineUp, MoveToFirstCharacterOfScreenLine, MoveToFirstLine, MoveToLastCharacterOfLine, MoveToLastCharacterOfScreenLine, MoveToLastLine, MoveToLastNonblankCharacterOfLineAndDown, MoveToLineByPercent, MoveToMark, MoveToMarkLine, MoveToMiddleOfScreen, MoveToNextAlphanumericWord, MoveToNextFoldEnd, MoveToNextFoldStart, MoveToNextFoldStartWithSameIndent, MoveToNextFunction, MoveToNextNumber, MoveToNextOccurrence, MoveToNextParagraph, MoveToNextSentence, MoveToNextSentenceSkipBlankRow, MoveToNextSmartWord, MoveToNextString, MoveToNextSubword, MoveToNextWholeWord, MoveToNextWord, MoveToPair, MoveToPositionByScope, MoveToPreviousAlphanumericWord, MoveToPreviousEndOfWholeWord, MoveToPreviousEndOfWord, MoveToPreviousFoldEnd, MoveToPreviousFoldStart, MoveToPreviousFoldStartWithSameIndent, MoveToPreviousFunction, MoveToPreviousNumber, MoveToPreviousOccurrence, MoveToPreviousParagraph, MoveToPreviousSentence, MoveToPreviousSentenceSkipBlankRow, MoveToPreviousSmartWord, MoveToPreviousString, MoveToPreviousSubword, MoveToPreviousWholeWord, MoveToPreviousWord, MoveToRelativeLine, MoveToRelativeLineMinimumOne, MoveToScreenColumn, MoveToTopOfScreen, MoveUp, MoveUpScreen, MoveUpToEdge, MoveUpWrap, Point, Range, Scroll, ScrollFullScreenDown, ScrollFullScreenUp, ScrollHalfScreenDown, ScrollHalfScreenUp, Till, TillBackwards, _, detectScopeStartPositionForScope, findRangeInBufferRow, getBufferRows, getCodeFoldRowRanges, getEndOfLineForBufferRow, getFirstVisibleScreenRow, getIndex, getLargestFoldRangeContainsBufferRow, getLastVisibleScreenRow, getTextInScreenRange, getValidVimBufferRow, getValidVimScreenRow, isEmptyRow, isIncludeFunctionScopeForRow, limitNumber, moveCursorDownScreen, moveCursorLeft, moveCursorRight, moveCursorToFirstCharacterAtRow, moveCursorToNextNonWhitespace, moveCursorUpScreen, pointIsAtEndOfLineAtNonEmptyRow, pointIsAtVimEndOfFile, pointIsOnWhiteSpace, ref, ref1, saveEditorState, setBufferColumn, setBufferRow, smartScrollToBufferPosition, sortRanges,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  _ = require('underscore-plus');

  ref = require('atom'), Point = ref.Point, Range = ref.Range;

  ref1 = require('./utils'), moveCursorLeft = ref1.moveCursorLeft, moveCursorRight = ref1.moveCursorRight, moveCursorUpScreen = ref1.moveCursorUpScreen, moveCursorDownScreen = ref1.moveCursorDownScreen, pointIsAtVimEndOfFile = ref1.pointIsAtVimEndOfFile, getFirstVisibleScreenRow = ref1.getFirstVisibleScreenRow, getLastVisibleScreenRow = ref1.getLastVisibleScreenRow, getValidVimScreenRow = ref1.getValidVimScreenRow, getValidVimBufferRow = ref1.getValidVimBufferRow, moveCursorToFirstCharacterAtRow = ref1.moveCursorToFirstCharacterAtRow, sortRanges = ref1.sortRanges, pointIsOnWhiteSpace = ref1.pointIsOnWhiteSpace, moveCursorToNextNonWhitespace = ref1.moveCursorToNextNonWhitespace, isEmptyRow = ref1.isEmptyRow, getCodeFoldRowRanges = ref1.getCodeFoldRowRanges, getLargestFoldRangeContainsBufferRow = ref1.getLargestFoldRangeContainsBufferRow, isIncludeFunctionScopeForRow = ref1.isIncludeFunctionScopeForRow, detectScopeStartPositionForScope = ref1.detectScopeStartPositionForScope, getBufferRows = ref1.getBufferRows, getTextInScreenRange = ref1.getTextInScreenRange, setBufferRow = ref1.setBufferRow, setBufferColumn = ref1.setBufferColumn, limitNumber = ref1.limitNumber, getIndex = ref1.getIndex, smartScrollToBufferPosition = ref1.smartScrollToBufferPosition, pointIsAtEndOfLineAtNonEmptyRow = ref1.pointIsAtEndOfLineAtNonEmptyRow, getEndOfLineForBufferRow = ref1.getEndOfLineForBufferRow, findRangeInBufferRow = ref1.findRangeInBufferRow, saveEditorState = ref1.saveEditorState;

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
      if (this.verticalMotion && !this.getConfig('stayOnVerticalMotion')) {
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

    Motion.prototype.isCaseSensitive = function(term) {
      if (this.getConfig("useSmartcaseFor" + this.caseSensitivityKind)) {
        return term.search(/[A-Z]/) !== -1;
      } else {
        return !this.getConfig("ignoreCaseFor" + this.caseSensitivityKind);
      }
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

  MoveToScreenColumn = (function(superClass) {
    extend(MoveToScreenColumn, superClass);

    function MoveToScreenColumn() {
      return MoveToScreenColumn.__super__.constructor.apply(this, arguments);
    }

    MoveToScreenColumn.extend(false);

    MoveToScreenColumn.prototype.moveCursor = function(cursor) {
      var allowOffScreenPosition, point;
      allowOffScreenPosition = this.getConfig("allowMoveToOffScreenColumnOnScreenLineMotion");
      point = this.vimState.utils.getScreenPositionForScreenRow(this.editor, cursor.getScreenRow(), this.which, {
        allowOffScreenPosition: allowOffScreenPosition
      });
      return this.setScreenPositionSafely(cursor, point);
    };

    return MoveToScreenColumn;

  })(Motion);

  MoveToBeginningOfScreenLine = (function(superClass) {
    extend(MoveToBeginningOfScreenLine, superClass);

    function MoveToBeginningOfScreenLine() {
      return MoveToBeginningOfScreenLine.__super__.constructor.apply(this, arguments);
    }

    MoveToBeginningOfScreenLine.extend();

    MoveToBeginningOfScreenLine.prototype.which = "beginning";

    return MoveToBeginningOfScreenLine;

  })(MoveToScreenColumn);

  MoveToFirstCharacterOfScreenLine = (function(superClass) {
    extend(MoveToFirstCharacterOfScreenLine, superClass);

    function MoveToFirstCharacterOfScreenLine() {
      return MoveToFirstCharacterOfScreenLine.__super__.constructor.apply(this, arguments);
    }

    MoveToFirstCharacterOfScreenLine.extend();

    MoveToFirstCharacterOfScreenLine.prototype.which = "first-character";

    return MoveToFirstCharacterOfScreenLine;

  })(MoveToScreenColumn);

  MoveToLastCharacterOfScreenLine = (function(superClass) {
    extend(MoveToLastCharacterOfScreenLine, superClass);

    function MoveToLastCharacterOfScreenLine() {
      return MoveToLastCharacterOfScreenLine.__super__.constructor.apply(this, arguments);
    }

    MoveToLastCharacterOfScreenLine.extend();

    MoveToLastCharacterOfScreenLine.prototype.which = "last-character";

    return MoveToLastCharacterOfScreenLine;

  })(MoveToScreenColumn);

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

    Find.prototype.caseSensitivityKind = "Find";

    Find.prototype.restoreEditorState = function() {
      if (typeof this._restoreEditorState === "function") {
        this._restoreEditorState();
      }
      return this._restoreEditorState = null;
    };

    Find.prototype.cancelOperation = function() {
      this.restoreEditorState();
      return Find.__super__.cancelOperation.apply(this, arguments);
    };

    Find.prototype.initialize = function() {
      var charsMax, options;
      Find.__super__.initialize.apply(this, arguments);
      if (this.getConfig("reuseFindForRepeatFind")) {
        this.repeatIfNecessary();
      }
      if (this.isComplete()) {
        return;
      }
      charsMax = this.getConfig("findCharsMax");
      if (charsMax > 1) {
        this._restoreEditorState = saveEditorState(this.editor);
        options = {
          autoConfirmTimeout: this.getConfig("findConfirmByTimeout"),
          onConfirm: (function(_this) {
            return function(input) {
              _this.input = input;
              if (_this.input) {
                return _this.processOperation();
              } else {
                return _this.cancelOperation();
              }
            };
          })(this),
          onChange: (function(_this) {
            return function(preConfirmedChars) {
              _this.preConfirmedChars = preConfirmedChars;
              return _this.highlightTextInCursorRows(_this.preConfirmedChars, "pre-confirm");
            };
          })(this),
          onCancel: (function(_this) {
            return function() {
              _this.vimState.highlightFind.clearMarkers();
              return _this.cancelOperation();
            };
          })(this),
          commands: {
            "vim-mode-plus:find-next-pre-confirmed": (function(_this) {
              return function() {
                return _this.findPreConfirmed(+1);
              };
            })(this),
            "vim-mode-plus:find-previous-pre-confirmed": (function(_this) {
              return function() {
                return _this.findPreConfirmed(-1);
              };
            })(this)
          }
        };
      }
      if (options == null) {
        options = {};
      }
      options.purpose = "find";
      options.charsMax = charsMax;
      return this.focusInput(options);
    };

    Find.prototype.findPreConfirmed = function(delta) {
      var index;
      if (this.preConfirmedChars && this.getConfig("highlightFindChar")) {
        index = this.highlightTextInCursorRows(this.preConfirmedChars, "pre-confirm", this.getCount(-1) + delta, true);
        return this.count = index + 1;
      }
    };

    Find.prototype.repeatIfNecessary = function() {
      var currentFind, isSequentialExecution, ref2;
      currentFind = this.vimState.globalState.get("currentFind");
      isSequentialExecution = (ref2 = this.vimState.operationStack.getLastCommandName()) === "Find" || ref2 === "FindBackwards" || ref2 === "Till" || ref2 === "TillBackwards";
      if ((currentFind != null) && isSequentialExecution) {
        this.input = currentFind.input;
        return this.repeated = true;
      }
    };

    Find.prototype.isBackwards = function() {
      return this.backwards;
    };

    Find.prototype.execute = function() {
      var decorationType;
      Find.__super__.execute.apply(this, arguments);
      decorationType = "post-confirm";
      if (this.isAsTargetExceptSelect()) {
        decorationType += " long";
      }
      this.editor.component.getNextUpdatePromise().then((function(_this) {
        return function() {
          return _this.highlightTextInCursorRows(_this.input, decorationType);
        };
      })(this));
    };

    Find.prototype.getPoint = function(fromPoint) {
      var indexWantAccess, points, ref2, regex, scanRange, translation;
      scanRange = this.editor.bufferRangeForBufferRow(fromPoint.row);
      points = [];
      regex = this.getRegex(this.input);
      indexWantAccess = this.getCount(-1);
      translation = new Point(0, this.isBackwards() ? this.offset : -this.offset);
      if (this.repeated) {
        fromPoint = fromPoint.translate(translation.negate());
      }
      if (this.isBackwards()) {
        if (this.getConfig("findAcrossLines")) {
          scanRange.start = Point.ZERO;
        }
        this.editor.backwardsScanInBufferRange(regex, scanRange, function(arg) {
          var range, stop;
          range = arg.range, stop = arg.stop;
          if (range.start.isLessThan(fromPoint)) {
            points.push(range.start);
            if (points.length > indexWantAccess) {
              return stop();
            }
          }
        });
      } else {
        if (this.getConfig("findAcrossLines")) {
          scanRange.end = this.editor.getEofBufferPosition();
        }
        this.editor.scanInBufferRange(regex, scanRange, function(arg) {
          var range, stop;
          range = arg.range, stop = arg.stop;
          if (range.start.isGreaterThan(fromPoint)) {
            points.push(range.start);
            if (points.length > indexWantAccess) {
              return stop();
            }
          }
        });
      }
      return (ref2 = points[indexWantAccess]) != null ? ref2.translate(translation) : void 0;
    };

    Find.prototype.highlightTextInCursorRows = function(text, decorationType, index, adjustIndex) {
      if (index == null) {
        index = this.getCount(-1);
      }
      if (adjustIndex == null) {
        adjustIndex = false;
      }
      if (!this.getConfig("highlightFindChar")) {
        return;
      }
      return this.vimState.highlightFind.highlightCursorRows(this.getRegex(text), decorationType, this.isBackwards(), this.offset, index, adjustIndex);
    };

    Find.prototype.moveCursor = function(cursor) {
      var point;
      point = this.getPoint(cursor.getBufferPosition());
      if (point != null) {
        cursor.setBufferPosition(point);
      } else {
        this.restoreEditorState();
      }
      if (!this.repeated) {
        return this.globalState.set('currentFind', this);
      }
    };

    Find.prototype.getRegex = function(term) {
      var modifiers;
      modifiers = this.isCaseSensitive(term) ? 'g' : 'gi';
      return new RegExp(_.escapeRegExp(term), modifiers);
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
        return this.readChar();
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
      this.ranges = this.vimState.utils.sortRanges(this.getRanges());
      return MoveToNextOccurrence.__super__.execute.apply(this, arguments);
    };

    MoveToNextOccurrence.prototype.moveCursor = function(cursor) {
      var point, range;
      range = this.ranges[getIndex(this.getIndex(cursor.getBufferPosition()), this.ranges)];
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
    };

    MoveToNextOccurrence.prototype.getIndex = function(fromPoint) {
      var i, index, j, len, range, ref2;
      index = null;
      ref2 = this.ranges;
      for (i = j = 0, len = ref2.length; j < len; i = ++j) {
        range = ref2[i];
        if (!(range.start.isGreaterThan(fromPoint))) {
          continue;
        }
        index = i;
        break;
      }
      return (index != null ? index : 0) + this.getCount(-1);
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
      var i, index, j, range, ref2;
      index = null;
      ref2 = this.ranges;
      for (i = j = ref2.length - 1; j >= 0; i = j += -1) {
        range = ref2[i];
        if (!(range.end.isLessThan(fromPoint))) {
          continue;
        }
        index = i;
        break;
      }
      return (index != null ? index : this.ranges.length - 1) - this.getCount(-1);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvbW90aW9uLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsZzVFQUFBO0lBQUE7OztFQUFBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVI7O0VBQ0osTUFBaUIsT0FBQSxDQUFRLE1BQVIsQ0FBakIsRUFBQyxpQkFBRCxFQUFROztFQUVSLE9BMEJJLE9BQUEsQ0FBUSxTQUFSLENBMUJKLEVBQ0Usb0NBREYsRUFDa0Isc0NBRGxCLEVBRUUsNENBRkYsRUFFc0IsZ0RBRnRCLEVBR0Usa0RBSEYsRUFJRSx3REFKRixFQUk0QixzREFKNUIsRUFLRSxnREFMRixFQUt3QixnREFMeEIsRUFNRSxzRUFORixFQU9FLDRCQVBGLEVBUUUsOENBUkYsRUFTRSxrRUFURixFQVVFLDRCQVZGLEVBV0UsZ0RBWEYsRUFZRSxnRkFaRixFQWFFLGdFQWJGLEVBY0Usd0VBZEYsRUFlRSxrQ0FmRixFQWdCRSxnREFoQkYsRUFpQkUsZ0NBakJGLEVBa0JFLHNDQWxCRixFQW1CRSw4QkFuQkYsRUFvQkUsd0JBcEJGLEVBcUJFLDhEQXJCRixFQXNCRSxzRUF0QkYsRUF1QkUsd0RBdkJGLEVBd0JFLGdEQXhCRixFQXlCRTs7RUFHRixJQUFBLEdBQU8sT0FBQSxDQUFRLFFBQVI7O0VBRUQ7OztJQUNKLE1BQUMsQ0FBQSxNQUFELENBQVEsS0FBUjs7SUFDQSxNQUFDLENBQUEsYUFBRCxHQUFnQjs7cUJBQ2hCLFNBQUEsR0FBVzs7cUJBQ1gsSUFBQSxHQUFNOztxQkFDTixJQUFBLEdBQU07O3FCQUNOLGNBQUEsR0FBZ0I7O3FCQUNoQixhQUFBLEdBQWU7O3FCQUNmLHFCQUFBLEdBQXVCOztJQUVWLGdCQUFBO01BQ1gseUNBQUEsU0FBQTtNQUVBLElBQUcsSUFBQyxDQUFBLElBQUQsS0FBUyxRQUFaO1FBQ0UsSUFBQyxDQUFBLElBQUQsR0FBUSxJQUFDLENBQUEsUUFEWDs7TUFFQSxJQUFDLENBQUEsVUFBRCxDQUFBO0lBTFc7O3FCQU9iLFVBQUEsR0FBWSxTQUFBO2FBQUcsSUFBQyxDQUFBLElBQUQsS0FBUztJQUFaOztxQkFDWixXQUFBLEdBQWEsU0FBQTthQUFHLElBQUMsQ0FBQSxJQUFELEtBQVM7SUFBWjs7cUJBRWIsU0FBQSxHQUFXLFNBQUMsSUFBRDtNQUNULElBQUcsSUFBQSxLQUFRLGVBQVg7UUFDRSxJQUFHLElBQUMsQ0FBQSxJQUFELEtBQVMsVUFBWjtVQUNFLElBQUMsQ0FBQSxTQUFELEdBQWEsTUFEZjtTQUFBLE1BQUE7VUFHRSxJQUFDLENBQUEsU0FBRCxHQUFhLENBQUksSUFBQyxDQUFBLFVBSHBCO1NBREY7O2FBS0EsSUFBQyxDQUFBLElBQUQsR0FBUTtJQU5DOztxQkFRWCx1QkFBQSxHQUF5QixTQUFDLE1BQUQsRUFBUyxLQUFUO01BQ3ZCLElBQW1DLGFBQW5DO2VBQUEsTUFBTSxDQUFDLGlCQUFQLENBQXlCLEtBQXpCLEVBQUE7O0lBRHVCOztxQkFHekIsdUJBQUEsR0FBeUIsU0FBQyxNQUFELEVBQVMsS0FBVDtNQUN2QixJQUFtQyxhQUFuQztlQUFBLE1BQU0sQ0FBQyxpQkFBUCxDQUF5QixLQUF6QixFQUFBOztJQUR1Qjs7cUJBR3pCLGdCQUFBLEdBQWtCLFNBQUMsTUFBRDtBQUNoQixVQUFBO01BQUEsSUFBRyxNQUFNLENBQUMsWUFBUCxDQUFBLENBQUEsSUFBMEIsSUFBQyxDQUFBLElBQTlCO1FBQ0UsY0FBQSxHQUFpQixNQUFNLENBQUMsaUJBQVAsQ0FBQSxFQURuQjs7TUFHQSxJQUFDLENBQUEsVUFBRCxDQUFZLE1BQVo7TUFFQSxJQUFHLHdCQUFBLElBQW9CLENBQUksY0FBYyxDQUFDLE9BQWYsQ0FBdUIsTUFBTSxDQUFDLGlCQUFQLENBQUEsQ0FBdkIsQ0FBM0I7UUFDRSxJQUFDLENBQUEsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFmLENBQW1CLEdBQW5CLEVBQXdCLGNBQXhCO2VBQ0EsSUFBQyxDQUFBLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBZixDQUFtQixHQUFuQixFQUF3QixjQUF4QixFQUZGOztJQU5nQjs7cUJBVWxCLE9BQUEsR0FBUyxTQUFBO0FBQ1AsVUFBQTtNQUFBLElBQUcscUJBQUg7UUFDRSxJQUFDLENBQUEsTUFBRCxDQUFBLEVBREY7T0FBQSxNQUFBO0FBR0U7QUFBQSxhQUFBLHNDQUFBOztVQUFBLElBQUMsQ0FBQSxnQkFBRCxDQUFrQixNQUFsQjtBQUFBLFNBSEY7O01BSUEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxZQUFSLENBQUE7YUFDQSxJQUFDLENBQUEsTUFBTSxDQUFDLDJCQUFSLENBQUE7SUFOTzs7cUJBU1QsTUFBQSxHQUFRLFNBQUE7QUFDTixVQUFBO01BQUEsYUFBQSxHQUFnQixJQUFDLENBQUEsSUFBRCxLQUFTLFFBQVQsSUFBcUIsSUFBQyxDQUFBLEVBQUQsQ0FBSSxrQkFBSjtBQUNyQztBQUFBLFdBQUEsc0NBQUE7O1FBQ0UsU0FBUyxDQUFDLGVBQVYsQ0FBMEIsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQTttQkFDeEIsS0FBQyxDQUFBLGdCQUFELENBQWtCLFNBQVMsQ0FBQyxNQUE1QjtVQUR3QjtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBMUI7UUFHQSxTQUFBLGlEQUE2QixDQUFJLFNBQVMsQ0FBQyxPQUFWLENBQUEsRUFBckIsSUFBNEMsQ0FBQyxJQUFDLENBQUEscUJBQUQsSUFBMkIsSUFBQyxDQUFBLFVBQUQsQ0FBQSxDQUE1QjtRQUN4RCxJQUFHLGFBQUEsSUFBaUIsQ0FBQyxTQUFBLElBQWMsQ0FBQyxJQUFDLENBQUEsU0FBRCxJQUFjLElBQUMsQ0FBQSxVQUFELENBQUEsQ0FBZixDQUFmLENBQXBCO1VBQ0UsVUFBQSxHQUFhLElBQUMsQ0FBQSxLQUFELENBQU8sU0FBUDtVQUNiLFVBQVUsQ0FBQyxjQUFYLENBQTBCLElBQTFCO1VBQ0EsVUFBVSxDQUFDLFNBQVgsQ0FBcUIsSUFBQyxDQUFBLElBQXRCLEVBSEY7O0FBTEY7TUFVQSxJQUFzRCxJQUFDLENBQUEsSUFBRCxLQUFTLFdBQS9EO2VBQUEsSUFBQyxDQUFBLFFBQVEsQ0FBQyx5QkFBVixDQUFBLENBQXFDLENBQUMsVUFBdEMsQ0FBQSxFQUFBOztJQVpNOztxQkFjUixrQkFBQSxHQUFvQixTQUFDLE1BQUQsRUFBUyxHQUFULEVBQWMsT0FBZDtNQUNsQixJQUFHLElBQUMsQ0FBQSxjQUFELElBQW9CLENBQUksSUFBQyxDQUFBLFNBQUQsQ0FBVyxzQkFBWCxDQUEzQjtlQUNFLE1BQU0sQ0FBQyxpQkFBUCxDQUF5QixJQUFDLENBQUEscUNBQUQsQ0FBdUMsR0FBdkMsQ0FBekIsRUFBc0UsT0FBdEUsRUFERjtPQUFBLE1BQUE7ZUFHRSxZQUFBLENBQWEsTUFBYixFQUFxQixHQUFyQixFQUEwQixPQUExQixFQUhGOztJQURrQjs7cUJBV3BCLG9CQUFBLEdBQXNCLFNBQUMsTUFBRCxFQUFTLEVBQVQ7QUFDcEIsVUFBQTtNQUFBLFdBQUEsR0FBYyxNQUFNLENBQUMsaUJBQVAsQ0FBQTthQUNkLElBQUMsQ0FBQSxVQUFELENBQVksSUFBQyxDQUFBLFFBQUQsQ0FBQSxDQUFaLEVBQXlCLFNBQUMsS0FBRDtBQUN2QixZQUFBO1FBQUEsRUFBQSxDQUFHLEtBQUg7UUFDQSxJQUFHLENBQUMsV0FBQSxHQUFjLE1BQU0sQ0FBQyxpQkFBUCxDQUFBLENBQWYsQ0FBMEMsQ0FBQyxPQUEzQyxDQUFtRCxXQUFuRCxDQUFIO1VBQ0UsS0FBSyxDQUFDLElBQU4sQ0FBQSxFQURGOztlQUVBLFdBQUEsR0FBYztNQUpTLENBQXpCO0lBRm9COztxQkFRdEIsZUFBQSxHQUFpQixTQUFDLElBQUQ7TUFDZixJQUFHLElBQUMsQ0FBQSxTQUFELENBQVcsaUJBQUEsR0FBa0IsSUFBQyxDQUFBLG1CQUE5QixDQUFIO2VBQ0UsSUFBSSxDQUFDLE1BQUwsQ0FBWSxPQUFaLENBQUEsS0FBMEIsQ0FBQyxFQUQ3QjtPQUFBLE1BQUE7ZUFHRSxDQUFJLElBQUMsQ0FBQSxTQUFELENBQVcsZUFBQSxHQUFnQixJQUFDLENBQUEsbUJBQTVCLEVBSE47O0lBRGU7Ozs7S0F0RkU7O0VBNkZmOzs7Ozs7O0lBQ0osZ0JBQUMsQ0FBQSxNQUFELENBQVEsS0FBUjs7K0JBQ0EsZUFBQSxHQUFpQjs7K0JBQ2pCLHdCQUFBLEdBQTBCOzsrQkFDMUIsU0FBQSxHQUFXOzsrQkFFWCxVQUFBLEdBQVksU0FBQTtNQUNWLGtEQUFBLFNBQUE7YUFDQSxJQUFDLENBQUEsaUJBQUQsR0FBcUIsSUFBSTtJQUZmOzsrQkFJWixVQUFBLEdBQVksU0FBQyxNQUFEO0FBQ1YsVUFBQTtNQUFBLElBQUcsSUFBQyxDQUFBLElBQUQsS0FBUyxRQUFaO1FBQ0UsSUFBRyxJQUFDLENBQUEsV0FBRCxDQUFBLENBQUg7aUJBQ0UsSUFBQyxDQUFBLHdCQUFELEdBQTRCLElBQUMsQ0FBQSxLQUFELENBQU8sTUFBTSxDQUFDLFNBQWQsQ0FBd0IsQ0FBQywyQkFBekIsQ0FBQSxFQUQ5QjtTQUFBLE1BQUE7aUJBR0UsSUFBQyxDQUFBLGVBQUQsR0FBbUIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxzQkFBUixDQUFBLENBQWdDLENBQUMsU0FBakMsQ0FBQSxFQUhyQjtTQURGO09BQUEsTUFBQTtRQU9FLEtBQUEsR0FBUSxNQUFNLENBQUMsaUJBQVAsQ0FBQTtRQUVSLElBQUcscUNBQUg7aUJBQ0UsTUFBTSxDQUFDLGlCQUFQLENBQXlCLEtBQUssQ0FBQyxTQUFOLENBQWdCLElBQUMsQ0FBQSx3QkFBakIsQ0FBekIsRUFERjtTQUFBLE1BQUE7aUJBR0UsTUFBTSxDQUFDLGlCQUFQLENBQXlCLEtBQUssQ0FBQyxRQUFOLENBQWUsSUFBQyxDQUFBLGVBQWhCLENBQXpCLEVBSEY7U0FURjs7SUFEVTs7K0JBZVosTUFBQSxHQUFRLFNBQUE7QUFDTixVQUFBO01BQUEsSUFBRyxJQUFDLENBQUEsSUFBRCxLQUFTLFFBQVo7UUFDRSw4Q0FBQSxTQUFBLEVBREY7T0FBQSxNQUFBO0FBR0U7QUFBQSxhQUFBLHNDQUFBOztnQkFBd0MsU0FBQSxHQUFZLElBQUMsQ0FBQSxpQkFBaUIsQ0FBQyxHQUFuQixDQUF1QixNQUF2Qjs7O1VBQ2pELHlDQUFELEVBQWlCO1VBQ2pCLElBQUcsY0FBYyxDQUFDLE9BQWYsQ0FBdUIsTUFBTSxDQUFDLGlCQUFQLENBQUEsQ0FBdkIsQ0FBSDtZQUNFLE1BQU0sQ0FBQyxpQkFBUCxDQUF5QixnQkFBekIsRUFERjs7QUFGRjtRQUlBLDhDQUFBLFNBQUEsRUFQRjs7QUFlQTtBQUFBO1dBQUEsd0NBQUE7O1FBQ0UsZ0JBQUEsR0FBbUIsTUFBTSxDQUFDLFNBQVMsQ0FBQyxjQUFqQixDQUFBLENBQWlDLENBQUM7cUJBQ3JELElBQUMsQ0FBQSxvQkFBRCxDQUFzQixDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFBO1lBQ3BCLGNBQUEsR0FBaUIsTUFBTSxDQUFDLGlCQUFQLENBQUE7bUJBQ2pCLEtBQUMsQ0FBQSxpQkFBaUIsQ0FBQyxHQUFuQixDQUF1QixNQUF2QixFQUErQjtjQUFDLGtCQUFBLGdCQUFEO2NBQW1CLGdCQUFBLGNBQW5CO2FBQS9CO1VBRm9CO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF0QjtBQUZGOztJQWhCTTs7OztLQXpCcUI7O0VBK0N6Qjs7Ozs7OztJQUNKLFFBQUMsQ0FBQSxNQUFELENBQUE7O3VCQUNBLFVBQUEsR0FBWSxTQUFDLE1BQUQ7QUFDVixVQUFBO01BQUEsU0FBQSxHQUFZLElBQUMsQ0FBQSxTQUFELENBQVcscUJBQVg7YUFDWixJQUFDLENBQUEsb0JBQUQsQ0FBc0IsTUFBdEIsRUFBOEIsU0FBQTtlQUM1QixjQUFBLENBQWUsTUFBZixFQUF1QjtVQUFDLFdBQUEsU0FBRDtTQUF2QjtNQUQ0QixDQUE5QjtJQUZVOzs7O0tBRlM7O0VBT2pCOzs7Ozs7O0lBQ0osU0FBQyxDQUFBLE1BQUQsQ0FBQTs7d0JBQ0EsaUJBQUEsR0FBbUIsU0FBQyxNQUFEO01BQ2pCLElBQUcsSUFBQyxDQUFBLHNCQUFELENBQUEsQ0FBQSxJQUE4QixDQUFJLE1BQU0sQ0FBQyxhQUFQLENBQUEsQ0FBckM7ZUFDRSxNQURGO09BQUEsTUFBQTtlQUdFLElBQUMsQ0FBQSxTQUFELENBQVcscUJBQVgsRUFIRjs7SUFEaUI7O3dCQU1uQixVQUFBLEdBQVksU0FBQyxNQUFEO2FBQ1YsSUFBQyxDQUFBLG9CQUFELENBQXNCLE1BQXRCLEVBQThCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtBQUM1QixjQUFBO1VBQUEsY0FBQSxHQUFpQixNQUFNLENBQUMsaUJBQVAsQ0FBQTtVQUNqQixLQUFDLENBQUEsTUFBTSxDQUFDLGVBQVIsQ0FBd0IsY0FBYyxDQUFDLEdBQXZDO1VBQ0EsU0FBQSxHQUFZLEtBQUMsQ0FBQSxpQkFBRCxDQUFtQixNQUFuQjtVQUNaLGVBQUEsQ0FBZ0IsTUFBaEI7VUFDQSxJQUFHLE1BQU0sQ0FBQyxhQUFQLENBQUEsQ0FBQSxJQUEyQixTQUEzQixJQUF5QyxDQUFJLHFCQUFBLENBQXNCLEtBQUMsQ0FBQSxNQUF2QixFQUErQixjQUEvQixDQUFoRDttQkFDRSxlQUFBLENBQWdCLE1BQWhCLEVBQXdCO2NBQUMsV0FBQSxTQUFEO2FBQXhCLEVBREY7O1FBTDRCO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE5QjtJQURVOzs7O0tBUlU7O0VBaUJsQjs7Ozs7OztJQUNKLHFCQUFDLENBQUEsTUFBRCxDQUFRLEtBQVI7O29DQUVBLFVBQUEsR0FBWSxTQUFDLE1BQUQ7YUFDVixlQUFBLENBQWdCLE1BQWhCLEVBQXdCLE1BQU0sQ0FBQyxlQUFQLENBQUEsQ0FBQSxHQUEyQixJQUFDLENBQUEsUUFBRCxDQUFBLENBQW5EO0lBRFU7Ozs7S0FIc0I7O0VBTTlCOzs7Ozs7O0lBQ0osTUFBQyxDQUFBLE1BQUQsQ0FBQTs7cUJBQ0EsSUFBQSxHQUFNOztxQkFDTixJQUFBLEdBQU07O3FCQUVOLFlBQUEsR0FBYyxTQUFDLEdBQUQ7TUFDWixHQUFBLEdBQU0sSUFBQyxDQUFBLFVBQUQsQ0FBWSxHQUFaO01BQ04sSUFBRyxJQUFDLENBQUEsTUFBTSxDQUFDLG1CQUFSLENBQTRCLEdBQTVCLENBQUg7ZUFDRSxvQ0FBQSxDQUFxQyxJQUFDLENBQUEsTUFBdEMsRUFBOEMsR0FBOUMsQ0FBa0QsQ0FBQyxLQUFLLENBQUMsSUFEM0Q7T0FBQSxNQUFBO2VBR0UsSUFIRjs7SUFGWTs7cUJBT2QsVUFBQSxHQUFZLFNBQUMsR0FBRDtBQUNWLFVBQUE7TUFBQSxHQUFBLEdBQU07TUFDTixJQUFHLElBQUMsQ0FBQSxJQUFELElBQVUsR0FBQSxLQUFPLEdBQXBCO2VBQ0UsSUFBQyxDQUFBLG1CQUFELENBQUEsRUFERjtPQUFBLE1BQUE7ZUFHRSxXQUFBLENBQVksR0FBQSxHQUFNLENBQWxCLEVBQXFCO1VBQUMsS0FBQSxHQUFEO1NBQXJCLEVBSEY7O0lBRlU7O3FCQU9aLFVBQUEsR0FBWSxTQUFDLE1BQUQ7YUFDVixJQUFDLENBQUEsb0JBQUQsQ0FBc0IsTUFBdEIsRUFBOEIsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO2lCQUM1QixZQUFBLENBQWEsTUFBYixFQUFxQixLQUFDLENBQUEsWUFBRCxDQUFjLE1BQU0sQ0FBQyxZQUFQLENBQUEsQ0FBZCxDQUFyQjtRQUQ0QjtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBOUI7SUFEVTs7OztLQW5CTzs7RUF1QmY7Ozs7Ozs7SUFDSixVQUFDLENBQUEsTUFBRCxDQUFBOzt5QkFDQSxJQUFBLEdBQU07Ozs7S0FGaUI7O0VBSW5COzs7Ozs7O0lBQ0osUUFBQyxDQUFBLE1BQUQsQ0FBQTs7dUJBQ0EsSUFBQSxHQUFNOzt1QkFDTixJQUFBLEdBQU07O3VCQUVOLFlBQUEsR0FBYyxTQUFDLEdBQUQ7TUFDWixJQUFHLElBQUMsQ0FBQSxNQUFNLENBQUMsbUJBQVIsQ0FBNEIsR0FBNUIsQ0FBSDtRQUNFLEdBQUEsR0FBTSxvQ0FBQSxDQUFxQyxJQUFDLENBQUEsTUFBdEMsRUFBOEMsR0FBOUMsQ0FBa0QsQ0FBQyxHQUFHLENBQUMsSUFEL0Q7O2FBRUEsSUFBQyxDQUFBLFVBQUQsQ0FBWSxHQUFaO0lBSFk7O3VCQUtkLFVBQUEsR0FBWSxTQUFDLEdBQUQ7QUFDVixVQUFBO01BQUEsR0FBQSxHQUFNLElBQUMsQ0FBQSxtQkFBRCxDQUFBO01BQ04sSUFBRyxJQUFDLENBQUEsSUFBRCxJQUFVLEdBQUEsSUFBTyxHQUFwQjtlQUNFLEVBREY7T0FBQSxNQUFBO2VBR0UsV0FBQSxDQUFZLEdBQUEsR0FBTSxDQUFsQixFQUFxQjtVQUFDLEtBQUEsR0FBRDtTQUFyQixFQUhGOztJQUZVOzs7O0tBVlM7O0VBaUJqQjs7Ozs7OztJQUNKLFlBQUMsQ0FBQSxNQUFELENBQUE7OzJCQUNBLElBQUEsR0FBTTs7OztLQUZtQjs7RUFJckI7Ozs7Ozs7SUFDSixZQUFDLENBQUEsTUFBRCxDQUFBOzsyQkFDQSxJQUFBLEdBQU07OzJCQUNOLFNBQUEsR0FBVzs7MkJBRVgsVUFBQSxHQUFZLFNBQUMsTUFBRDthQUNWLElBQUMsQ0FBQSxvQkFBRCxDQUFzQixNQUF0QixFQUE4QixTQUFBO2VBQzVCLGtCQUFBLENBQW1CLE1BQW5CO01BRDRCLENBQTlCO0lBRFU7Ozs7S0FMYTs7RUFTckI7Ozs7Ozs7SUFDSixjQUFDLENBQUEsTUFBRCxDQUFBOzs2QkFDQSxJQUFBLEdBQU07OzZCQUNOLFNBQUEsR0FBVzs7NkJBRVgsVUFBQSxHQUFZLFNBQUMsTUFBRDthQUNWLElBQUMsQ0FBQSxvQkFBRCxDQUFzQixNQUF0QixFQUE4QixTQUFBO2VBQzVCLG9CQUFBLENBQXFCLE1BQXJCO01BRDRCLENBQTlCO0lBRFU7Ozs7S0FMZTs7RUFjdkI7Ozs7Ozs7SUFDSixZQUFDLENBQUEsTUFBRCxDQUFBOzsyQkFDQSxJQUFBLEdBQU07OzJCQUNOLElBQUEsR0FBTTs7MkJBQ04sU0FBQSxHQUFXOztJQUNYLFlBQUMsQ0FBQSxXQUFELEdBQWM7OzJCQUVkLFVBQUEsR0FBWSxTQUFDLE1BQUQ7YUFDVixJQUFDLENBQUEsb0JBQUQsQ0FBc0IsTUFBdEIsRUFBOEIsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO2lCQUM1QixLQUFDLENBQUEsdUJBQUQsQ0FBeUIsTUFBekIsRUFBaUMsS0FBQyxDQUFBLFFBQUQsQ0FBVSxNQUFNLENBQUMsaUJBQVAsQ0FBQSxDQUFWLENBQWpDO1FBRDRCO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE5QjtJQURVOzsyQkFJWixRQUFBLEdBQVUsU0FBQyxTQUFEO0FBQ1IsVUFBQTtNQUFBLE1BQUEsR0FBUyxTQUFTLENBQUM7QUFDbkI7QUFBQSxXQUFBLHNDQUFBOztZQUF3QyxJQUFDLENBQUEsTUFBRCxDQUFRLEtBQUEsR0FBWSxJQUFBLEtBQUEsQ0FBTSxHQUFOLEVBQVcsTUFBWCxDQUFwQjtBQUN0QyxpQkFBTzs7QUFEVDtJQUZROzsyQkFLVixXQUFBLEdBQWEsU0FBQyxHQUFEO0FBQ1gsVUFBQTtNQURhLE1BQUQ7TUFDWixRQUFBLEdBQVcsb0JBQW9CLENBQUMsSUFBckIsQ0FBMEIsSUFBMUIsRUFBZ0MsSUFBQyxDQUFBLE1BQWpDO0FBQ1gsY0FBTyxJQUFDLENBQUEsU0FBUjtBQUFBLGFBQ08sSUFEUDtpQkFDaUI7Ozs7O0FBRGpCLGFBRU8sTUFGUDtpQkFFbUI7Ozs7O0FBRm5CO0lBRlc7OzJCQU1iLE1BQUEsR0FBUSxTQUFDLEtBQUQ7QUFDTixVQUFBO01BQUEsSUFBRyxJQUFDLENBQUEsZ0JBQUQsQ0FBa0IsS0FBbEIsQ0FBSDtRQUVFLEtBQUEsR0FBUSxLQUFLLENBQUMsU0FBTixDQUFnQixDQUFDLENBQUMsQ0FBRixFQUFLLENBQUwsQ0FBaEI7UUFDUixLQUFBLEdBQVEsS0FBSyxDQUFDLFNBQU4sQ0FBZ0IsQ0FBQyxDQUFDLENBQUYsRUFBSyxDQUFMLENBQWhCO2VBQ1IsQ0FBQyxDQUFJLElBQUMsQ0FBQSxnQkFBRCxDQUFrQixLQUFsQixDQUFMLENBQUEsSUFBa0MsQ0FBQyxDQUFJLElBQUMsQ0FBQSxnQkFBRCxDQUFrQixLQUFsQixDQUFMLEVBSnBDO09BQUEsTUFBQTtlQU1FLE1BTkY7O0lBRE07OzJCQVNSLGdCQUFBLEdBQWtCLFNBQUMsS0FBRDtBQUNoQixVQUFBO01BQUEsSUFBRyxJQUFDLENBQUEsb0JBQUQsQ0FBc0IsS0FBdEIsQ0FBSDtlQUNFLEtBREY7T0FBQSxNQUFBO1FBR0UsU0FBQSxHQUFZLEtBQUssQ0FBQyxTQUFOLENBQWdCLENBQUMsQ0FBRCxFQUFJLENBQUMsQ0FBTCxDQUFoQjtRQUNaLFVBQUEsR0FBYSxLQUFLLENBQUMsU0FBTixDQUFnQixDQUFDLENBQUQsRUFBSSxDQUFDLENBQUwsQ0FBaEI7ZUFDYixJQUFDLENBQUEsb0JBQUQsQ0FBc0IsU0FBdEIsQ0FBQSxJQUFxQyxJQUFDLENBQUEsb0JBQUQsQ0FBc0IsVUFBdEIsRUFMdkM7O0lBRGdCOzsyQkFRbEIsb0JBQUEsR0FBc0IsU0FBQyxLQUFEO0FBQ3BCLFVBQUE7TUFBQSxJQUFBLEdBQU8sb0JBQUEsQ0FBcUIsSUFBQyxDQUFBLE1BQXRCLEVBQThCLEtBQUssQ0FBQyxrQkFBTixDQUF5QixLQUF6QixFQUFnQyxDQUFoQyxFQUFtQyxDQUFuQyxDQUE5QjthQUNQLGNBQUEsSUFBVSxJQUFJLENBQUMsSUFBTCxDQUFVLElBQVY7SUFGVTs7OztLQXZDRzs7RUEyQ3JCOzs7Ozs7O0lBQ0osY0FBQyxDQUFBLE1BQUQsQ0FBQTs7SUFDQSxjQUFDLENBQUEsV0FBRCxHQUFjOzs2QkFDZCxTQUFBLEdBQVc7Ozs7S0FIZ0I7O0VBT3ZCOzs7Ozs7O0lBQ0osY0FBQyxDQUFBLE1BQUQsQ0FBQTs7NkJBQ0EsU0FBQSxHQUFXOzs2QkFFWCxRQUFBLEdBQVUsU0FBQyxPQUFELEVBQVUsSUFBVjtBQUNSLFVBQUE7TUFBQSxTQUFBLEdBQVk7TUFDWixLQUFBLEdBQVE7TUFDUixNQUFBLEdBQVMsSUFBQyxDQUFBLHVCQUFELENBQXlCLElBQUMsQ0FBQSxNQUExQjtNQUVULElBQUMsQ0FBQSxXQUFELENBQWEsT0FBYixFQUFzQjtRQUFDLE1BQUEsSUFBRDtPQUF0QixFQUE4QixTQUFDLEdBQUQ7QUFDNUIsWUFBQTtRQUQ4QixtQkFBTywyQkFBVztRQUNoRCxTQUFBLEdBQVk7UUFFWixJQUFVLFNBQUEsS0FBYSxFQUFiLElBQW9CLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBWixLQUF3QixDQUF0RDtBQUFBLGlCQUFBOztRQUNBLElBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxhQUFaLENBQTBCLElBQTFCLENBQUg7VUFDRSxLQUFBLEdBQVE7aUJBQ1IsSUFBQSxDQUFBLEVBRkY7O01BSjRCLENBQTlCO01BUUEsSUFBRyxLQUFIO1FBQ0UsS0FBQSxHQUFRLFNBQVMsQ0FBQztRQUNsQixJQUFHLCtCQUFBLENBQWdDLElBQUMsQ0FBQSxNQUFqQyxFQUF5QyxLQUF6QyxDQUFBLElBQW9ELENBQUksS0FBSyxDQUFDLE9BQU4sQ0FBYyxNQUFkLENBQTNEO2lCQUNFLEtBQUssQ0FBQyxRQUFOLENBQWUsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFmLEVBREY7U0FBQSxNQUFBO2lCQUdFLE1BSEY7U0FGRjtPQUFBLE1BQUE7b0ZBT21CLEtBUG5COztJQWJROzs2QkFnQ1YsVUFBQSxHQUFZLFNBQUMsTUFBRDtBQUNWLFVBQUE7TUFBQSxjQUFBLEdBQWlCLE1BQU0sQ0FBQyxpQkFBUCxDQUFBO01BQ2pCLElBQVUscUJBQUEsQ0FBc0IsSUFBQyxDQUFBLE1BQXZCLEVBQStCLGNBQS9CLENBQVY7QUFBQSxlQUFBOztNQUNBLGVBQUEsR0FBa0IsbUJBQUEsQ0FBb0IsSUFBQyxDQUFBLE1BQXJCLEVBQTZCLGNBQTdCO01BRWxCLHNCQUFBLEdBQXlCLElBQUMsQ0FBQSxzQkFBRCxDQUFBO2FBQ3pCLElBQUMsQ0FBQSxvQkFBRCxDQUFzQixNQUF0QixFQUE4QixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsR0FBRDtBQUM1QixjQUFBO1VBRDhCLFVBQUQ7VUFDN0IsY0FBQSxHQUFpQixNQUFNLENBQUMsaUJBQVAsQ0FBQTtVQUNqQixJQUFHLFVBQUEsQ0FBVyxLQUFDLENBQUEsTUFBWixFQUFvQixjQUFjLENBQUMsR0FBbkMsQ0FBQSxJQUE0QyxzQkFBL0M7WUFDRSxLQUFBLEdBQVEsY0FBYyxDQUFDLFFBQWYsQ0FBd0IsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUF4QixFQURWO1dBQUEsTUFBQTtZQUdFLE9BQUEsNkNBQXVCLE1BQU0sQ0FBQyxVQUFQLENBQUE7WUFDdkIsS0FBQSxHQUFRLEtBQUMsQ0FBQSxRQUFELENBQVUsT0FBVixFQUFtQixjQUFuQjtZQUNSLElBQUcsT0FBQSxJQUFZLHNCQUFmO2NBQ0UsSUFBRyxLQUFDLENBQUEsUUFBUSxDQUFDLEVBQVYsQ0FBYSxRQUFiLENBQUEsSUFBMkIsQ0FBQyxDQUFJLGVBQUwsQ0FBOUI7Z0JBQ0UsS0FBQSxHQUFRLE1BQU0sQ0FBQyxpQ0FBUCxDQUF5QztrQkFBRSxXQUFELEtBQUMsQ0FBQSxTQUFGO2lCQUF6QyxFQURWO2VBQUEsTUFBQTtnQkFHRSxLQUFBLEdBQVEsS0FBSyxDQUFDLEdBQU4sQ0FBVSxLQUFWLEVBQWlCLHdCQUFBLENBQXlCLEtBQUMsQ0FBQSxNQUExQixFQUFrQyxjQUFjLENBQUMsR0FBakQsQ0FBakIsRUFIVjtlQURGO2FBTEY7O2lCQVVBLE1BQU0sQ0FBQyxpQkFBUCxDQUF5QixLQUF6QjtRQVo0QjtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBOUI7SUFOVTs7OztLQXBDZTs7RUF5RHZCOzs7Ozs7O0lBQ0osa0JBQUMsQ0FBQSxNQUFELENBQUE7O2lDQUNBLFNBQUEsR0FBVzs7aUNBRVgsVUFBQSxHQUFZLFNBQUMsTUFBRDthQUNWLElBQUMsQ0FBQSxvQkFBRCxDQUFzQixNQUF0QixFQUE4QixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7QUFDNUIsY0FBQTtVQUFBLEtBQUEsR0FBUSxNQUFNLENBQUMsdUNBQVAsQ0FBK0M7WUFBRSxXQUFELEtBQUMsQ0FBQSxTQUFGO1dBQS9DO2lCQUNSLE1BQU0sQ0FBQyxpQkFBUCxDQUF5QixLQUF6QjtRQUY0QjtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBOUI7SUFEVTs7OztLQUptQjs7RUFTM0I7Ozs7Ozs7SUFDSixlQUFDLENBQUEsTUFBRCxDQUFBOzs4QkFDQSxTQUFBLEdBQVc7OzhCQUNYLFNBQUEsR0FBVzs7OEJBRVgsbUJBQUEsR0FBcUIsU0FBQyxNQUFEO0FBQ25CLFVBQUE7TUFBQSw2QkFBQSxDQUE4QixNQUE5QjtNQUNBLEtBQUEsR0FBUSxNQUFNLENBQUMsaUNBQVAsQ0FBeUM7UUFBRSxXQUFELElBQUMsQ0FBQSxTQUFGO09BQXpDLENBQXNELENBQUMsU0FBdkQsQ0FBaUUsQ0FBQyxDQUFELEVBQUksQ0FBQyxDQUFMLENBQWpFO01BQ1IsS0FBQSxHQUFRLEtBQUssQ0FBQyxHQUFOLENBQVUsS0FBVixFQUFpQixJQUFDLENBQUEsdUJBQUQsQ0FBQSxDQUFqQjthQUNSLE1BQU0sQ0FBQyxpQkFBUCxDQUF5QixLQUF6QjtJQUptQjs7OEJBTXJCLFVBQUEsR0FBWSxTQUFDLE1BQUQ7YUFDVixJQUFDLENBQUEsb0JBQUQsQ0FBc0IsTUFBdEIsRUFBOEIsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO0FBQzVCLGNBQUE7VUFBQSxhQUFBLEdBQWdCLE1BQU0sQ0FBQyxpQkFBUCxDQUFBO1VBQ2hCLEtBQUMsQ0FBQSxtQkFBRCxDQUFxQixNQUFyQjtVQUNBLElBQUcsYUFBYSxDQUFDLE9BQWQsQ0FBc0IsTUFBTSxDQUFDLGlCQUFQLENBQUEsQ0FBdEIsQ0FBSDtZQUVFLE1BQU0sQ0FBQyxTQUFQLENBQUE7bUJBQ0EsS0FBQyxDQUFBLG1CQUFELENBQXFCLE1BQXJCLEVBSEY7O1FBSDRCO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE5QjtJQURVOzs7O0tBWGdCOztFQXFCeEI7Ozs7Ozs7SUFDSix1QkFBQyxDQUFBLE1BQUQsQ0FBQTs7c0NBQ0EsU0FBQSxHQUFXOztzQ0FFWCxVQUFBLEdBQVksU0FBQyxNQUFEO0FBQ1YsVUFBQTtNQUFBLEtBQUEsR0FBUSxJQUFDLENBQUEsUUFBRCxDQUFBO01BQ1IsU0FBQSxHQUFZLE1BQU0sQ0FBQyx5QkFBUCxDQUFBO01BQ1osY0FBQSxHQUFpQixNQUFNLENBQUMsaUJBQVAsQ0FBQTtNQUdqQixJQUFHLGNBQWMsQ0FBQyxhQUFmLENBQTZCLFNBQVMsQ0FBQyxLQUF2QyxDQUFBLElBQWtELGNBQWMsQ0FBQyxVQUFmLENBQTBCLFNBQVMsQ0FBQyxHQUFwQyxDQUFyRDtRQUNFLEtBQUEsSUFBUyxFQURYOztBQUdBLFdBQUksNkVBQUo7UUFDRSxLQUFBLEdBQVEsTUFBTSxDQUFDLHVDQUFQLENBQStDO1VBQUUsV0FBRCxJQUFDLENBQUEsU0FBRjtTQUEvQztRQUNSLE1BQU0sQ0FBQyxpQkFBUCxDQUF5QixLQUF6QjtBQUZGO01BSUEsSUFBQyxDQUFBLG1CQUFELENBQXFCLE1BQXJCO01BQ0EsSUFBRyxNQUFNLENBQUMsaUJBQVAsQ0FBQSxDQUEwQixDQUFDLG9CQUEzQixDQUFnRCxjQUFoRCxDQUFIO2VBQ0UsTUFBTSxDQUFDLGlCQUFQLENBQXlCLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBekIsRUFERjs7SUFkVTs7c0NBaUJaLG1CQUFBLEdBQXFCLFNBQUMsTUFBRDtBQUNuQixVQUFBO01BQUEsS0FBQSxHQUFRLE1BQU0sQ0FBQyxpQ0FBUCxDQUF5QztRQUFFLFdBQUQsSUFBQyxDQUFBLFNBQUY7T0FBekMsQ0FBc0QsQ0FBQyxTQUF2RCxDQUFpRSxDQUFDLENBQUQsRUFBSSxDQUFDLENBQUwsQ0FBakU7TUFDUixLQUFBLEdBQVEsS0FBSyxDQUFDLEdBQU4sQ0FBVSxLQUFWLEVBQWlCLElBQUMsQ0FBQSx1QkFBRCxDQUFBLENBQWpCO2FBQ1IsTUFBTSxDQUFDLGlCQUFQLENBQXlCLEtBQXpCO0lBSG1COzs7O0tBckJlOztFQTRCaEM7Ozs7Ozs7SUFDSixtQkFBQyxDQUFBLE1BQUQsQ0FBQTs7a0NBQ0EsU0FBQSxHQUFXOzs7O0tBRnFCOztFQUk1Qjs7Ozs7OztJQUNKLHVCQUFDLENBQUEsTUFBRCxDQUFBOztzQ0FDQSxTQUFBLEdBQVc7Ozs7S0FGeUI7O0VBSWhDOzs7Ozs7O0lBQ0osb0JBQUMsQ0FBQSxNQUFELENBQUE7O21DQUNBLFNBQUEsR0FBVzs7OztLQUZzQjs7RUFLN0I7Ozs7Ozs7SUFDSiw0QkFBQyxDQUFBLE1BQUQsQ0FBQTs7MkNBQ0EsU0FBQSxHQUFXOzs7O0tBRjhCOztFQU1yQzs7Ozs7OztJQUNKLDBCQUFDLENBQUEsTUFBRCxDQUFBOztJQUNBLDBCQUFDLENBQUEsV0FBRCxHQUFjOzt5Q0FDZCxTQUFBLEdBQVc7Ozs7S0FINEI7O0VBS25DOzs7Ozs7O0lBQ0osOEJBQUMsQ0FBQSxNQUFELENBQUE7O0lBQ0EsOEJBQUMsQ0FBQSxXQUFELEdBQWM7OzZDQUNkLFNBQUEsR0FBVzs7OztLQUhnQzs7RUFLdkM7Ozs7Ozs7SUFDSiwyQkFBQyxDQUFBLE1BQUQsQ0FBQTs7SUFDQSwyQkFBQyxDQUFBLFdBQUQsR0FBYzs7MENBQ2QsU0FBQSxHQUFXOzs7O0tBSDZCOztFQU9wQzs7Ozs7OztJQUNKLG1CQUFDLENBQUEsTUFBRCxDQUFBOztJQUNBLG1CQUFDLENBQUEsV0FBRCxHQUFjOztrQ0FDZCxTQUFBLEdBQVc7Ozs7S0FIcUI7O0VBSzVCOzs7Ozs7O0lBQ0osdUJBQUMsQ0FBQSxNQUFELENBQUE7O0lBQ0EsdUJBQUMsQ0FBQSxXQUFELEdBQWM7O3NDQUNkLFNBQUEsR0FBVzs7OztLQUh5Qjs7RUFLaEM7Ozs7Ozs7SUFDSixvQkFBQyxDQUFBLE1BQUQsQ0FBQTs7SUFDQSxvQkFBQyxDQUFBLFdBQUQsR0FBYzs7bUNBQ2QsU0FBQSxHQUFXOzs7O0tBSHNCOztFQU83Qjs7Ozs7OztJQUNKLGlCQUFDLENBQUEsTUFBRCxDQUFBOztnQ0FDQSxVQUFBLEdBQVksU0FBQyxNQUFEO01BQ1YsSUFBQyxDQUFBLFNBQUQsR0FBYSxNQUFNLENBQUMsYUFBUCxDQUFBO2FBQ2IsbURBQUEsU0FBQTtJQUZVOzs7O0tBRmtCOztFQU0xQjs7Ozs7OztJQUNKLHFCQUFDLENBQUEsTUFBRCxDQUFBOztvQ0FDQSxVQUFBLEdBQVksU0FBQyxNQUFEO01BQ1YsSUFBQyxDQUFBLFNBQUQsR0FBYSxNQUFNLENBQUMsYUFBUCxDQUFBO2FBQ2IsdURBQUEsU0FBQTtJQUZVOzs7O0tBRnNCOztFQU05Qjs7Ozs7OztJQUNKLGtCQUFDLENBQUEsTUFBRCxDQUFBOztpQ0FDQSxVQUFBLEdBQVksU0FBQyxNQUFEO01BQ1YsSUFBQyxDQUFBLFNBQUQsR0FBYSxNQUFNLENBQUMsYUFBUCxDQUFBO2FBQ2Isb0RBQUEsU0FBQTtJQUZVOzs7O0tBRm1COztFQWMzQjs7Ozs7OztJQUNKLGtCQUFDLENBQUEsTUFBRCxDQUFBOztpQ0FDQSxJQUFBLEdBQU07O2lDQUNOLGFBQUEsR0FBZTs7aUNBQ2YsU0FBQSxHQUFXOztpQ0FFWCxVQUFBLEdBQVksU0FBQyxNQUFEO2FBQ1YsSUFBQyxDQUFBLG9CQUFELENBQXNCLE1BQXRCLEVBQThCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtpQkFDNUIsS0FBQyxDQUFBLHVCQUFELENBQXlCLE1BQXpCLEVBQWlDLEtBQUMsQ0FBQSxRQUFELENBQVUsTUFBTSxDQUFDLGlCQUFQLENBQUEsQ0FBVixDQUFqQztRQUQ0QjtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBOUI7SUFEVTs7aUNBSVosUUFBQSxHQUFVLFNBQUMsU0FBRDtNQUNSLElBQUcsSUFBQyxDQUFBLFNBQUQsS0FBYyxNQUFqQjtlQUNFLElBQUMsQ0FBQSxzQkFBRCxDQUF3QixTQUF4QixFQURGO09BQUEsTUFFSyxJQUFHLElBQUMsQ0FBQSxTQUFELEtBQWMsVUFBakI7ZUFDSCxJQUFDLENBQUEsMEJBQUQsQ0FBNEIsU0FBNUIsRUFERzs7SUFIRzs7aUNBTVYsVUFBQSxHQUFZLFNBQUMsR0FBRDthQUNWLElBQUMsQ0FBQSxNQUFNLENBQUMsZ0JBQVIsQ0FBeUIsR0FBekI7SUFEVTs7aUNBR1osc0JBQUEsR0FBd0IsU0FBQyxJQUFEO0FBQ3RCLFVBQUE7TUFBQSxVQUFBLEdBQWE7TUFDYixJQUFDLENBQUEsV0FBRCxDQUFhLElBQUMsQ0FBQSxhQUFkLEVBQTZCO1FBQUMsTUFBQSxJQUFEO09BQTdCLEVBQXFDLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxHQUFEO0FBQ25DLGNBQUE7VUFEcUMsbUJBQU8sMkJBQVcsbUJBQU87VUFDOUQsSUFBRyxnQkFBSDtZQUNFLE9BQXFCLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFiLEVBQWtCLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBNUIsQ0FBckIsRUFBQyxrQkFBRCxFQUFXO1lBQ1gsSUFBVSxLQUFDLENBQUEsWUFBRCxJQUFrQixLQUFDLENBQUEsVUFBRCxDQUFZLE1BQVosQ0FBNUI7QUFBQSxxQkFBQTs7WUFDQSxJQUFHLEtBQUMsQ0FBQSxVQUFELENBQVksUUFBWixDQUFBLEtBQTJCLEtBQUMsQ0FBQSxVQUFELENBQVksTUFBWixDQUE5QjtjQUNFLFVBQUEsR0FBYSxLQUFDLENBQUEscUNBQUQsQ0FBdUMsTUFBdkMsRUFEZjthQUhGO1dBQUEsTUFBQTtZQU1FLFVBQUEsR0FBYSxLQUFLLENBQUMsSUFOckI7O1VBT0EsSUFBVSxrQkFBVjttQkFBQSxJQUFBLENBQUEsRUFBQTs7UUFSbUM7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXJDO2tDQVNBLGFBQWEsSUFBQyxDQUFBLHVCQUFELENBQUE7SUFYUzs7aUNBYXhCLDBCQUFBLEdBQTRCLFNBQUMsSUFBRDtBQUMxQixVQUFBO01BQUEsVUFBQSxHQUFhO01BQ2IsSUFBQyxDQUFBLFlBQUQsQ0FBYyxJQUFDLENBQUEsYUFBZixFQUE4QjtRQUFDLE1BQUEsSUFBRDtPQUE5QixFQUFzQyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsR0FBRDtBQUNwQyxjQUFBO1VBRHNDLG1CQUFPLG1CQUFPLGlCQUFNO1VBQzFELElBQUcsZ0JBQUg7WUFDRSxPQUFxQixDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBYixFQUFrQixLQUFLLENBQUMsR0FBRyxDQUFDLEdBQTVCLENBQXJCLEVBQUMsa0JBQUQsRUFBVztZQUNYLElBQUcsQ0FBSSxLQUFDLENBQUEsVUFBRCxDQUFZLE1BQVosQ0FBSixJQUE0QixLQUFDLENBQUEsVUFBRCxDQUFZLFFBQVosQ0FBL0I7Y0FDRSxLQUFBLEdBQVEsS0FBQyxDQUFBLHFDQUFELENBQXVDLE1BQXZDO2NBQ1IsSUFBRyxLQUFLLENBQUMsVUFBTixDQUFpQixJQUFqQixDQUFIO2dCQUNFLFVBQUEsR0FBYSxNQURmO2VBQUEsTUFBQTtnQkFHRSxJQUFVLEtBQUMsQ0FBQSxZQUFYO0FBQUEseUJBQUE7O2dCQUNBLFVBQUEsR0FBYSxLQUFDLENBQUEscUNBQUQsQ0FBdUMsUUFBdkMsRUFKZjtlQUZGO2FBRkY7V0FBQSxNQUFBO1lBVUUsSUFBRyxLQUFLLENBQUMsR0FBRyxDQUFDLFVBQVYsQ0FBcUIsSUFBckIsQ0FBSDtjQUNFLFVBQUEsR0FBYSxLQUFLLENBQUMsSUFEckI7YUFWRjs7VUFZQSxJQUFVLGtCQUFWO21CQUFBLElBQUEsQ0FBQSxFQUFBOztRQWJvQztNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBdEM7a0NBY0EsYUFBYSxDQUFDLENBQUQsRUFBSSxDQUFKO0lBaEJhOzs7O0tBaENHOztFQWtEM0I7Ozs7Ozs7SUFDSixzQkFBQyxDQUFBLE1BQUQsQ0FBQTs7cUNBQ0EsU0FBQSxHQUFXOzs7O0tBRndCOztFQUkvQjs7Ozs7OztJQUNKLDhCQUFDLENBQUEsTUFBRCxDQUFBOzs2Q0FDQSxZQUFBLEdBQWM7Ozs7S0FGNkI7O0VBSXZDOzs7Ozs7O0lBQ0osa0NBQUMsQ0FBQSxNQUFELENBQUE7O2lEQUNBLFlBQUEsR0FBYzs7OztLQUZpQzs7RUFNM0M7Ozs7Ozs7SUFDSixtQkFBQyxDQUFBLE1BQUQsQ0FBQTs7a0NBQ0EsSUFBQSxHQUFNOztrQ0FDTixTQUFBLEdBQVc7O2tDQUVYLFVBQUEsR0FBWSxTQUFDLE1BQUQ7YUFDVixJQUFDLENBQUEsb0JBQUQsQ0FBc0IsTUFBdEIsRUFBOEIsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO2lCQUM1QixLQUFDLENBQUEsdUJBQUQsQ0FBeUIsTUFBekIsRUFBaUMsS0FBQyxDQUFBLFFBQUQsQ0FBVSxNQUFNLENBQUMsaUJBQVAsQ0FBQSxDQUFWLENBQWpDO1FBRDRCO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE5QjtJQURVOztrQ0FJWixRQUFBLEdBQVUsU0FBQyxTQUFEO0FBQ1IsVUFBQTtNQUFBLFFBQUEsR0FBVyxTQUFTLENBQUM7TUFDckIsZ0JBQUEsR0FBbUIsQ0FBSSxJQUFDLENBQUEsTUFBTSxDQUFDLGdCQUFSLENBQXlCLFFBQXpCO0FBQ3ZCOzs7O0FBQUEsV0FBQSxzQ0FBQTs7UUFDRSxJQUFHLElBQUMsQ0FBQSxNQUFNLENBQUMsZ0JBQVIsQ0FBeUIsR0FBekIsQ0FBSDtVQUNFLElBQTRCLGdCQUE1QjtBQUFBLG1CQUFXLElBQUEsS0FBQSxDQUFNLEdBQU4sRUFBVyxDQUFYLEVBQVg7V0FERjtTQUFBLE1BQUE7VUFHRSxnQkFBQSxHQUFtQixLQUhyQjs7QUFERjtBQU9BLGNBQU8sSUFBQyxDQUFBLFNBQVI7QUFBQSxhQUNPLFVBRFA7aUJBQzJCLElBQUEsS0FBQSxDQUFNLENBQU4sRUFBUyxDQUFUO0FBRDNCLGFBRU8sTUFGUDtpQkFFbUIsSUFBQyxDQUFBLHVCQUFELENBQUE7QUFGbkI7SUFWUTs7OztLQVRzQjs7RUF1QjVCOzs7Ozs7O0lBQ0osdUJBQUMsQ0FBQSxNQUFELENBQUE7O3NDQUNBLFNBQUEsR0FBVzs7OztLQUZ5Qjs7RUFNaEM7Ozs7Ozs7SUFDSixxQkFBQyxDQUFBLE1BQUQsQ0FBQTs7b0NBRUEsVUFBQSxHQUFZLFNBQUMsTUFBRDthQUNWLGVBQUEsQ0FBZ0IsTUFBaEIsRUFBd0IsQ0FBeEI7SUFEVTs7OztLQUhzQjs7RUFNOUI7Ozs7Ozs7SUFDSixZQUFDLENBQUEsTUFBRCxDQUFBOzsyQkFFQSxVQUFBLEdBQVksU0FBQyxNQUFEO2FBQ1YsZUFBQSxDQUFnQixNQUFoQixFQUF3QixJQUFDLENBQUEsUUFBRCxDQUFVLENBQUMsQ0FBWCxDQUF4QjtJQURVOzs7O0tBSGE7O0VBTXJCOzs7Ozs7O0lBQ0oseUJBQUMsQ0FBQSxNQUFELENBQUE7O3dDQUVBLFVBQUEsR0FBWSxTQUFDLE1BQUQ7QUFDVixVQUFBO01BQUEsR0FBQSxHQUFNLG9CQUFBLENBQXFCLElBQUMsQ0FBQSxNQUF0QixFQUE4QixNQUFNLENBQUMsWUFBUCxDQUFBLENBQUEsR0FBd0IsSUFBQyxDQUFBLFFBQUQsQ0FBVSxDQUFDLENBQVgsQ0FBdEQ7TUFDTixNQUFNLENBQUMsaUJBQVAsQ0FBeUIsQ0FBQyxHQUFELEVBQU0sS0FBTixDQUF6QjthQUNBLE1BQU0sQ0FBQyxVQUFQLEdBQW9CO0lBSFY7Ozs7S0FIMEI7O0VBUWxDOzs7Ozs7O0lBQ0osd0NBQUMsQ0FBQSxNQUFELENBQUE7O3VEQUNBLFNBQUEsR0FBVzs7dURBRVgsVUFBQSxHQUFZLFNBQUMsTUFBRDtBQUNWLFVBQUE7TUFBQSxLQUFBLEdBQVEsSUFBQyxDQUFBLFFBQUQsQ0FBVSxNQUFNLENBQUMsaUJBQVAsQ0FBQSxDQUFWO2FBQ1IsTUFBTSxDQUFDLGlCQUFQLENBQXlCLEtBQXpCO0lBRlU7O3VEQUlaLFFBQUEsR0FBVSxTQUFDLEdBQUQ7QUFDUixVQUFBO01BRFUsTUFBRDtNQUNULEdBQUEsR0FBTSxXQUFBLENBQVksR0FBQSxHQUFNLElBQUMsQ0FBQSxRQUFELENBQVUsQ0FBQyxDQUFYLENBQWxCLEVBQWlDO1FBQUEsR0FBQSxFQUFLLElBQUMsQ0FBQSxtQkFBRCxDQUFBLENBQUw7T0FBakM7TUFDTixLQUFBLEdBQVEsb0JBQUEsQ0FBcUIsSUFBQyxDQUFBLE1BQXRCLEVBQThCLE1BQTlCLEVBQXNDLEdBQXRDLEVBQTJDO1FBQUEsU0FBQSxFQUFXLFVBQVg7T0FBM0M7NEVBQ1csSUFBQSxLQUFBLENBQU0sR0FBTixFQUFXLENBQVg7SUFIWDs7OztLQVIyQzs7RUFnQmpEOzs7Ozs7O0lBQ0osMEJBQUMsQ0FBQSxNQUFELENBQUE7O3lDQUNBLFVBQUEsR0FBWSxTQUFDLE1BQUQ7QUFDVixVQUFBO01BQUEsS0FBQSxHQUFRLElBQUMsQ0FBQSxxQ0FBRCxDQUF1QyxNQUFNLENBQUMsWUFBUCxDQUFBLENBQXZDO2FBQ1IsSUFBQyxDQUFBLHVCQUFELENBQXlCLE1BQXpCLEVBQWlDLEtBQWpDO0lBRlU7Ozs7S0FGMkI7O0VBTW5DOzs7Ozs7O0lBQ0osNEJBQUMsQ0FBQSxNQUFELENBQUE7OzJDQUNBLElBQUEsR0FBTTs7MkNBQ04sVUFBQSxHQUFZLFNBQUMsTUFBRDtNQUNWLElBQUMsQ0FBQSxvQkFBRCxDQUFzQixNQUF0QixFQUE4QixTQUFBO0FBQzVCLFlBQUE7UUFBQSxLQUFBLEdBQVEsTUFBTSxDQUFDLGlCQUFQLENBQUE7UUFDUixJQUFPLEtBQUssQ0FBQyxHQUFOLEtBQWEsQ0FBcEI7aUJBQ0UsTUFBTSxDQUFDLGlCQUFQLENBQXlCLEtBQUssQ0FBQyxTQUFOLENBQWdCLENBQUMsQ0FBQyxDQUFGLEVBQUssQ0FBTCxDQUFoQixDQUF6QixFQURGOztNQUY0QixDQUE5QjthQUlBLDhEQUFBLFNBQUE7SUFMVTs7OztLQUg2Qjs7RUFVckM7Ozs7Ozs7SUFDSiw4QkFBQyxDQUFBLE1BQUQsQ0FBQTs7NkNBQ0EsSUFBQSxHQUFNOzs2Q0FDTixVQUFBLEdBQVksU0FBQyxNQUFEO01BQ1YsSUFBQyxDQUFBLG9CQUFELENBQXNCLE1BQXRCLEVBQThCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtBQUM1QixjQUFBO1VBQUEsS0FBQSxHQUFRLE1BQU0sQ0FBQyxpQkFBUCxDQUFBO1VBQ1IsSUFBTyxLQUFDLENBQUEsbUJBQUQsQ0FBQSxDQUFBLEtBQTBCLEtBQUssQ0FBQyxHQUF2QzttQkFDRSxNQUFNLENBQUMsaUJBQVAsQ0FBeUIsS0FBSyxDQUFDLFNBQU4sQ0FBZ0IsQ0FBQyxDQUFDLENBQUYsRUFBSyxDQUFMLENBQWhCLENBQXpCLEVBREY7O1FBRjRCO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE5QjthQUlBLGdFQUFBLFNBQUE7SUFMVTs7OztLQUgrQjs7RUFVdkM7Ozs7Ozs7SUFDSixpQ0FBQyxDQUFBLE1BQUQsQ0FBQTs7Z0RBQ0EsWUFBQSxHQUFjOztnREFDZCxRQUFBLEdBQVUsU0FBQTthQUFHLGlFQUFBLFNBQUEsQ0FBQSxHQUFRO0lBQVg7Ozs7S0FIb0M7O0VBTTFDOzs7Ozs7O0lBQ0osZUFBQyxDQUFBLE1BQUQsQ0FBQTs7OEJBQ0EsSUFBQSxHQUFNOzs4QkFDTixJQUFBLEdBQU07OzhCQUNOLGNBQUEsR0FBZ0I7OzhCQUNoQixxQkFBQSxHQUF1Qjs7OEJBRXZCLFVBQUEsR0FBWSxTQUFDLE1BQUQ7TUFDVixJQUFDLENBQUEsa0JBQUQsQ0FBb0IsTUFBcEIsRUFBNEIsb0JBQUEsQ0FBcUIsSUFBQyxDQUFBLE1BQXRCLEVBQThCLElBQUMsQ0FBQSxNQUFELENBQUEsQ0FBOUIsQ0FBNUI7YUFDQSxNQUFNLENBQUMsVUFBUCxDQUFrQjtRQUFBLE1BQUEsRUFBUSxJQUFSO09BQWxCO0lBRlU7OzhCQUlaLE1BQUEsR0FBUSxTQUFBO2FBQ04sSUFBQyxDQUFBLFFBQUQsQ0FBVSxDQUFDLENBQVg7SUFETTs7OztLQVhvQjs7RUFjeEI7Ozs7Ozs7SUFDSixrQkFBQyxDQUFBLE1BQUQsQ0FBUSxLQUFSOztpQ0FDQSxVQUFBLEdBQVksU0FBQyxNQUFEO0FBQ1YsVUFBQTtNQUFBLHNCQUFBLEdBQXlCLElBQUMsQ0FBQSxTQUFELENBQVcsOENBQVg7TUFDekIsS0FBQSxHQUFRLElBQUMsQ0FBQSxRQUFRLENBQUMsS0FBSyxDQUFDLDZCQUFoQixDQUE4QyxJQUFDLENBQUEsTUFBL0MsRUFBdUQsTUFBTSxDQUFDLFlBQVAsQ0FBQSxDQUF2RCxFQUE4RSxJQUFDLENBQUEsS0FBL0UsRUFBc0Y7UUFBQyx3QkFBQSxzQkFBRDtPQUF0RjthQUNSLElBQUMsQ0FBQSx1QkFBRCxDQUF5QixNQUF6QixFQUFpQyxLQUFqQztJQUhVOzs7O0tBRm1COztFQVEzQjs7Ozs7OztJQUNKLDJCQUFDLENBQUEsTUFBRCxDQUFBOzswQ0FDQSxLQUFBLEdBQU87Ozs7S0FGaUM7O0VBS3BDOzs7Ozs7O0lBQ0osZ0NBQUMsQ0FBQSxNQUFELENBQUE7OytDQUNBLEtBQUEsR0FBTzs7OztLQUZzQzs7RUFLekM7Ozs7Ozs7SUFDSiwrQkFBQyxDQUFBLE1BQUQsQ0FBQTs7OENBQ0EsS0FBQSxHQUFPOzs7O0tBRnFDOztFQUt4Qzs7Ozs7OztJQUNKLGNBQUMsQ0FBQSxNQUFELENBQUE7OzZCQUNBLFlBQUEsR0FBYzs7OztLQUZhOztFQUt2Qjs7Ozs7OztJQUNKLG1CQUFDLENBQUEsTUFBRCxDQUFBOztrQ0FFQSxNQUFBLEdBQVEsU0FBQTtBQUNOLFVBQUE7TUFBQSxPQUFBLEdBQVUsV0FBQSxDQUFZLElBQUMsQ0FBQSxRQUFELENBQUEsQ0FBWixFQUF5QjtRQUFBLEdBQUEsRUFBSyxHQUFMO09BQXpCO2FBQ1YsSUFBSSxDQUFDLEtBQUwsQ0FBVyxDQUFDLElBQUMsQ0FBQSxNQUFNLENBQUMsWUFBUixDQUFBLENBQUEsR0FBeUIsQ0FBMUIsQ0FBQSxHQUErQixDQUFDLE9BQUEsR0FBVSxHQUFYLENBQTFDO0lBRk07Ozs7S0FId0I7O0VBTzVCOzs7Ozs7O0lBQ0osa0JBQUMsQ0FBQSxNQUFELENBQVEsS0FBUjs7aUNBQ0EsSUFBQSxHQUFNOztpQ0FDTixxQkFBQSxHQUF1Qjs7aUNBRXZCLFVBQUEsR0FBWSxTQUFDLE1BQUQ7QUFDVixVQUFBO01BQUEsR0FBQSxHQUFNLElBQUMsQ0FBQSxtQkFBRCxDQUFxQixNQUFNLENBQUMsWUFBUCxDQUFBLENBQXJCO01BRU4sS0FBQSxHQUFRLElBQUMsQ0FBQSxRQUFELENBQVUsQ0FBQyxDQUFYO0FBQ1IsYUFBTyxLQUFBLEdBQVEsQ0FBZjtRQUNFLEdBQUEsR0FBTSxJQUFDLENBQUEsbUJBQUQsQ0FBcUIsR0FBQSxHQUFNLENBQTNCO1FBQ04sS0FBQTtNQUZGO2FBSUEsWUFBQSxDQUFhLE1BQWIsRUFBcUIsR0FBckI7SUFSVTs7OztLQUxtQjs7RUFlM0I7Ozs7Ozs7SUFDSiw0QkFBQyxDQUFBLE1BQUQsQ0FBUSxLQUFSOzsyQ0FFQSxRQUFBLEdBQVUsU0FBQTthQUNSLFdBQUEsQ0FBWSw0REFBQSxTQUFBLENBQVosRUFBbUI7UUFBQSxHQUFBLEVBQUssQ0FBTDtPQUFuQjtJQURROzs7O0tBSCtCOztFQVNyQzs7Ozs7OztJQUNKLGlCQUFDLENBQUEsTUFBRCxDQUFBOztnQ0FDQSxJQUFBLEdBQU07O2dDQUNOLElBQUEsR0FBTTs7Z0NBQ04sU0FBQSxHQUFXOztnQ0FDWCxZQUFBLEdBQWM7O2dDQUNkLGNBQUEsR0FBZ0I7O2dDQUVoQixVQUFBLEdBQVksU0FBQyxNQUFEO0FBQ1YsVUFBQTtNQUFBLFNBQUEsR0FBWSxJQUFDLENBQUEsTUFBTSxDQUFDLHFCQUFSLENBQThCLElBQUMsQ0FBQSxZQUFELENBQUEsQ0FBOUI7YUFDWixJQUFDLENBQUEsa0JBQUQsQ0FBb0IsTUFBcEIsRUFBNEIsU0FBNUI7SUFGVTs7Z0NBSVosWUFBQSxHQUFjLFNBQUE7TUFDWixJQUFHLElBQUMsQ0FBQSxzQkFBRCxDQUFBLENBQUg7ZUFDRSxFQURGO09BQUEsTUFBQTtlQUdFLElBQUMsQ0FBQSxVQUhIOztJQURZOztnQ0FNZCxZQUFBLEdBQWMsU0FBQTtBQUNaLFVBQUE7TUFBQSxRQUFBLEdBQVcsd0JBQUEsQ0FBeUIsSUFBQyxDQUFBLE1BQTFCO01BQ1gsTUFBQSxHQUFTLElBQUMsQ0FBQSxZQUFELENBQUE7TUFDVCxJQUFjLFFBQUEsS0FBWSxDQUExQjtRQUFBLE1BQUEsR0FBUyxFQUFUOztNQUNBLE1BQUEsR0FBUyxXQUFBLENBQVksSUFBQyxDQUFBLFFBQUQsQ0FBVSxDQUFDLENBQVgsQ0FBWixFQUEyQjtRQUFBLEdBQUEsRUFBSyxNQUFMO09BQTNCO2FBQ1QsUUFBQSxHQUFXO0lBTEM7Ozs7S0FsQmdCOztFQTBCMUI7Ozs7Ozs7SUFDSixvQkFBQyxDQUFBLE1BQUQsQ0FBQTs7bUNBQ0EsWUFBQSxHQUFjLFNBQUE7QUFDWixVQUFBO01BQUEsUUFBQSxHQUFXLHdCQUFBLENBQXlCLElBQUMsQ0FBQSxNQUExQjtNQUNYLE1BQUEsR0FBUyxXQUFBLENBQVksSUFBQyxDQUFBLE1BQU0sQ0FBQyx1QkFBUixDQUFBLENBQVosRUFBK0M7UUFBQSxHQUFBLEVBQUssSUFBQyxDQUFBLG1CQUFELENBQUEsQ0FBTDtPQUEvQzthQUNULFFBQUEsR0FBVyxJQUFJLENBQUMsS0FBTCxDQUFXLENBQUMsTUFBQSxHQUFTLFFBQVYsQ0FBQSxHQUFzQixDQUFqQztJQUhDOzs7O0tBRm1COztFQVE3Qjs7Ozs7OztJQUNKLG9CQUFDLENBQUEsTUFBRCxDQUFBOzttQ0FDQSxZQUFBLEdBQWMsU0FBQTtBQU1aLFVBQUE7TUFBQSxnQkFBQSxHQUFtQixJQUFDLENBQUEsbUJBQUQsQ0FBQTtNQUNuQixHQUFBLEdBQU0sV0FBQSxDQUFZLElBQUMsQ0FBQSxNQUFNLENBQUMsdUJBQVIsQ0FBQSxDQUFaLEVBQStDO1FBQUEsR0FBQSxFQUFLLGdCQUFMO09BQS9DO01BQ04sTUFBQSxHQUFTLElBQUMsQ0FBQSxZQUFELENBQUEsQ0FBQSxHQUFrQjtNQUMzQixJQUFjLEdBQUEsS0FBTyxnQkFBckI7UUFBQSxNQUFBLEdBQVMsRUFBVDs7TUFDQSxNQUFBLEdBQVMsV0FBQSxDQUFZLElBQUMsQ0FBQSxRQUFELENBQVUsQ0FBQyxDQUFYLENBQVosRUFBMkI7UUFBQSxHQUFBLEVBQUssTUFBTDtPQUEzQjthQUNULEdBQUEsR0FBTTtJQVhNOzs7O0tBRm1COztFQW9CN0I7Ozs7Ozs7SUFDSixNQUFDLENBQUEsTUFBRCxDQUFRLEtBQVI7O3FCQUNBLGNBQUEsR0FBZ0I7O3FCQUVoQixxQkFBQSxHQUF1QixTQUFBO01BQ3JCLElBQUcsSUFBSSxDQUFDLEdBQUwsQ0FBUyxJQUFDLENBQUEsWUFBVixDQUFBLEtBQTJCLENBQTlCO2VBQ0UsSUFBQyxDQUFBLFNBQUQsQ0FBVyxnQ0FBWCxFQURGO09BQUEsTUFBQTtlQUdFLElBQUMsQ0FBQSxTQUFELENBQVcsZ0NBQVgsRUFIRjs7SUFEcUI7O3FCQU12QixzQkFBQSxHQUF3QixTQUFBO01BQ3RCLElBQUcsSUFBSSxDQUFDLEdBQUwsQ0FBUyxJQUFDLENBQUEsWUFBVixDQUFBLEtBQTJCLENBQTlCO2VBQ0UsSUFBQyxDQUFBLFNBQUQsQ0FBVyx3Q0FBWCxFQURGO09BQUEsTUFBQTtlQUdFLElBQUMsQ0FBQSxTQUFELENBQVcsd0NBQVgsRUFIRjs7SUFEc0I7O3FCQU14QiwwQkFBQSxHQUE0QixTQUFDLEdBQUQ7QUFDMUIsVUFBQTtNQUFBLEtBQUEsR0FBWSxJQUFBLEtBQUEsQ0FBTSxHQUFOLEVBQVcsQ0FBWDthQUNaLElBQUMsQ0FBQSxNQUFNLENBQUMsT0FBTyxDQUFDLHVCQUFoQixDQUE0QyxJQUFBLEtBQUEsQ0FBTSxLQUFOLEVBQWEsS0FBYixDQUE1QyxDQUFnRSxDQUFDO0lBRnZDOztxQkFJNUIsWUFBQSxHQUFjLFNBQUMsT0FBRCxFQUFVLEtBQVYsRUFBaUIsSUFBakI7QUFDWixVQUFBO01BQUEsWUFBQSxHQUFlO1FBQUMsR0FBQSxFQUFLLElBQUMsQ0FBQSwwQkFBRCxDQUE0QixPQUE1QixDQUFOOztNQUNmLFVBQUEsR0FBYTtRQUFDLEdBQUEsRUFBSyxJQUFDLENBQUEsMEJBQUQsQ0FBNEIsS0FBNUIsQ0FBTjs7TUFJYixJQUFBLEdBQU8sQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLE1BQUQ7VUFDTCxJQUFHLHNDQUFIO1lBQ0UsS0FBQyxDQUFBLE1BQU0sQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLFlBQTFCLENBQXVDLE1BQXZDO21CQUNBLEtBQUMsQ0FBQSxNQUFNLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxVQUExQixDQUFBLEVBRkY7O1FBREs7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBO01BS1AsUUFBQSxHQUFXLElBQUMsQ0FBQSxzQkFBRCxDQUFBO2FBQ1gsSUFBQyxDQUFBLFFBQVEsQ0FBQyxzQkFBVixDQUFpQyxZQUFqQyxFQUErQyxVQUEvQyxFQUEyRDtRQUFDLFVBQUEsUUFBRDtRQUFXLE1BQUEsSUFBWDtRQUFpQixNQUFBLElBQWpCO09BQTNEO0lBWlk7O3FCQWNkLGVBQUEsR0FBaUIsU0FBQTthQUNmLElBQUksQ0FBQyxJQUFMLENBQVUsSUFBQyxDQUFBLFlBQUQsR0FBZ0IsSUFBQyxDQUFBLE1BQU0sQ0FBQyxjQUFSLENBQUEsQ0FBaEIsR0FBMkMsSUFBQyxDQUFBLFFBQUQsQ0FBQSxDQUFyRDtJQURlOztxQkFHakIsWUFBQSxHQUFjLFNBQUMsTUFBRDtBQUNaLFVBQUE7TUFBQSxTQUFBLEdBQVksb0JBQUEsQ0FBcUIsSUFBQyxDQUFBLE1BQXRCLEVBQThCLE1BQU0sQ0FBQyxZQUFQLENBQUEsQ0FBQSxHQUF3QixJQUFDLENBQUEsZUFBRCxDQUFBLENBQXREO2FBQ1osSUFBQyxDQUFBLE1BQU0sQ0FBQyxxQkFBUixDQUE4QixTQUE5QjtJQUZZOztxQkFJZCxVQUFBLEdBQVksU0FBQyxNQUFEO0FBQ1YsVUFBQTtNQUFBLFNBQUEsR0FBWSxJQUFDLENBQUEsWUFBRCxDQUFjLE1BQWQ7TUFDWixJQUFDLENBQUEsa0JBQUQsQ0FBb0IsTUFBcEIsRUFBNEIsSUFBQyxDQUFBLFlBQUQsQ0FBYyxNQUFkLENBQTVCLEVBQW1EO1FBQUEsVUFBQSxFQUFZLEtBQVo7T0FBbkQ7TUFFQSxJQUFHLE1BQU0sQ0FBQyxZQUFQLENBQUEsQ0FBSDtRQUNFLElBQUcsSUFBQyxDQUFBLHFCQUFELENBQUEsQ0FBSDtVQUNFLElBQUMsQ0FBQSxRQUFRLENBQUMscUJBQVYsQ0FBQSxFQURGOztRQUdBLHNCQUFBLEdBQXlCLElBQUMsQ0FBQSxNQUFNLENBQUMsd0JBQVIsQ0FBQTtRQUN6Qix5QkFBQSxHQUE0QixJQUFDLENBQUEsTUFBTSxDQUFDLHFCQUFSLENBQThCLHNCQUFBLEdBQXlCLElBQUMsQ0FBQSxlQUFELENBQUEsQ0FBdkQ7UUFDNUIseUJBQUEsR0FBNEIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxxQkFBUixDQUE4Qix5QkFBOUI7UUFDNUIsSUFBQSxHQUFPLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUE7QUFDTCxnQkFBQTtZQUFBLEtBQUMsQ0FBQSxNQUFNLENBQUMsd0JBQVIsQ0FBaUMseUJBQWpDO3lFQUd5QixDQUFFLFVBQTNCLENBQUE7VUFKSztRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUE7UUFNUCxJQUFHLElBQUMsQ0FBQSxxQkFBRCxDQUFBLENBQUg7aUJBQ0UsSUFBQyxDQUFBLFlBQUQsQ0FBYyxzQkFBZCxFQUFzQyx5QkFBdEMsRUFBaUUsSUFBakUsRUFERjtTQUFBLE1BQUE7aUJBR0UsSUFBQSxDQUFBLEVBSEY7U0FiRjs7SUFKVTs7OztLQXpDTzs7RUFpRWY7Ozs7Ozs7SUFDSixvQkFBQyxDQUFBLE1BQUQsQ0FBUSxJQUFSOzttQ0FDQSxZQUFBLEdBQWMsQ0FBQzs7OztLQUZrQjs7RUFLN0I7Ozs7Ozs7SUFDSixrQkFBQyxDQUFBLE1BQUQsQ0FBQTs7aUNBQ0EsWUFBQSxHQUFjLENBQUM7Ozs7S0FGZ0I7O0VBSzNCOzs7Ozs7O0lBQ0osb0JBQUMsQ0FBQSxNQUFELENBQUE7O21DQUNBLFlBQUEsR0FBYyxDQUFDLENBQUQsR0FBSzs7OztLQUZjOztFQUs3Qjs7Ozs7OztJQUNKLGtCQUFDLENBQUEsTUFBRCxDQUFBOztpQ0FDQSxZQUFBLEdBQWMsQ0FBQyxDQUFELEdBQUs7Ozs7S0FGWTs7RUFPM0I7Ozs7Ozs7SUFDSixJQUFDLENBQUEsTUFBRCxDQUFBOzttQkFDQSxTQUFBLEdBQVc7O21CQUNYLFNBQUEsR0FBVzs7bUJBQ1gsTUFBQSxHQUFROzttQkFDUixZQUFBLEdBQWM7O21CQUNkLG1CQUFBLEdBQXFCOzttQkFFckIsa0JBQUEsR0FBb0IsU0FBQTs7UUFDbEIsSUFBQyxDQUFBOzthQUNELElBQUMsQ0FBQSxtQkFBRCxHQUF1QjtJQUZMOzttQkFJcEIsZUFBQSxHQUFpQixTQUFBO01BQ2YsSUFBQyxDQUFBLGtCQUFELENBQUE7YUFDQSwyQ0FBQSxTQUFBO0lBRmU7O21CQUlqQixVQUFBLEdBQVksU0FBQTtBQUNWLFVBQUE7TUFBQSxzQ0FBQSxTQUFBO01BRUEsSUFBd0IsSUFBQyxDQUFBLFNBQUQsQ0FBVyx3QkFBWCxDQUF4QjtRQUFBLElBQUMsQ0FBQSxpQkFBRCxDQUFBLEVBQUE7O01BQ0EsSUFBVSxJQUFDLENBQUEsVUFBRCxDQUFBLENBQVY7QUFBQSxlQUFBOztNQUVBLFFBQUEsR0FBVyxJQUFDLENBQUEsU0FBRCxDQUFXLGNBQVg7TUFFWCxJQUFJLFFBQUEsR0FBVyxDQUFmO1FBQ0UsSUFBQyxDQUFBLG1CQUFELEdBQXVCLGVBQUEsQ0FBZ0IsSUFBQyxDQUFBLE1BQWpCO1FBRXZCLE9BQUEsR0FDRTtVQUFBLGtCQUFBLEVBQW9CLElBQUMsQ0FBQSxTQUFELENBQVcsc0JBQVgsQ0FBcEI7VUFDQSxTQUFBLEVBQVcsQ0FBQSxTQUFBLEtBQUE7bUJBQUEsU0FBQyxLQUFEO2NBQUMsS0FBQyxDQUFBLFFBQUQ7Y0FBVyxJQUFHLEtBQUMsQ0FBQSxLQUFKO3VCQUFlLEtBQUMsQ0FBQSxnQkFBRCxDQUFBLEVBQWY7ZUFBQSxNQUFBO3VCQUF3QyxLQUFDLENBQUEsZUFBRCxDQUFBLEVBQXhDOztZQUFaO1VBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQURYO1VBRUEsUUFBQSxFQUFVLENBQUEsU0FBQSxLQUFBO21CQUFBLFNBQUMsaUJBQUQ7Y0FBQyxLQUFDLENBQUEsb0JBQUQ7cUJBQXVCLEtBQUMsQ0FBQSx5QkFBRCxDQUEyQixLQUFDLENBQUEsaUJBQTVCLEVBQStDLGFBQS9DO1lBQXhCO1VBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUZWO1VBR0EsUUFBQSxFQUFVLENBQUEsU0FBQSxLQUFBO21CQUFBLFNBQUE7Y0FDUixLQUFDLENBQUEsUUFBUSxDQUFDLGFBQWEsQ0FBQyxZQUF4QixDQUFBO3FCQUNBLEtBQUMsQ0FBQSxlQUFELENBQUE7WUFGUTtVQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FIVjtVQU1BLFFBQUEsRUFDRTtZQUFBLHVDQUFBLEVBQXlDLENBQUEsU0FBQSxLQUFBO3FCQUFBLFNBQUE7dUJBQUcsS0FBQyxDQUFBLGdCQUFELENBQWtCLENBQUMsQ0FBbkI7Y0FBSDtZQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBekM7WUFDQSwyQ0FBQSxFQUE2QyxDQUFBLFNBQUEsS0FBQTtxQkFBQSxTQUFBO3VCQUFJLEtBQUMsQ0FBQSxnQkFBRCxDQUFrQixDQUFDLENBQW5CO2NBQUo7WUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBRDdDO1dBUEY7VUFKSjs7O1FBY0EsVUFBVzs7TUFDWCxPQUFPLENBQUMsT0FBUixHQUFrQjtNQUNsQixPQUFPLENBQUMsUUFBUixHQUFtQjthQUVuQixJQUFDLENBQUEsVUFBRCxDQUFZLE9BQVo7SUExQlU7O21CQTRCWixnQkFBQSxHQUFrQixTQUFDLEtBQUQ7QUFDaEIsVUFBQTtNQUFBLElBQUcsSUFBQyxDQUFBLGlCQUFELElBQXVCLElBQUMsQ0FBQSxTQUFELENBQVcsbUJBQVgsQ0FBMUI7UUFDRSxLQUFBLEdBQVEsSUFBQyxDQUFBLHlCQUFELENBQTJCLElBQUMsQ0FBQSxpQkFBNUIsRUFBK0MsYUFBL0MsRUFBOEQsSUFBQyxDQUFBLFFBQUQsQ0FBVSxDQUFDLENBQVgsQ0FBQSxHQUFnQixLQUE5RSxFQUFxRixJQUFyRjtlQUNSLElBQUMsQ0FBQSxLQUFELEdBQVMsS0FBQSxHQUFRLEVBRm5COztJQURnQjs7bUJBS2xCLGlCQUFBLEdBQW1CLFNBQUE7QUFDakIsVUFBQTtNQUFBLFdBQUEsR0FBYyxJQUFDLENBQUEsUUFBUSxDQUFDLFdBQVcsQ0FBQyxHQUF0QixDQUEwQixhQUExQjtNQUNkLHFCQUFBLFdBQXdCLElBQUMsQ0FBQSxRQUFRLENBQUMsY0FBYyxDQUFDLGtCQUF6QixDQUFBLEVBQUEsS0FBa0QsTUFBbEQsSUFBQSxJQUFBLEtBQTBELGVBQTFELElBQUEsSUFBQSxLQUEyRSxNQUEzRSxJQUFBLElBQUEsS0FBbUY7TUFDM0csSUFBRyxxQkFBQSxJQUFpQixxQkFBcEI7UUFDRSxJQUFDLENBQUEsS0FBRCxHQUFTLFdBQVcsQ0FBQztlQUNyQixJQUFDLENBQUEsUUFBRCxHQUFZLEtBRmQ7O0lBSGlCOzttQkFPbkIsV0FBQSxHQUFhLFNBQUE7YUFDWCxJQUFDLENBQUE7SUFEVTs7bUJBR2IsT0FBQSxHQUFTLFNBQUE7QUFDUCxVQUFBO01BQUEsbUNBQUEsU0FBQTtNQUNBLGNBQUEsR0FBaUI7TUFDakIsSUFBNkIsSUFBQyxDQUFBLHNCQUFELENBQUEsQ0FBN0I7UUFBQSxjQUFBLElBQWtCLFFBQWxCOztNQUNBLElBQUMsQ0FBQSxNQUFNLENBQUMsU0FBUyxDQUFDLG9CQUFsQixDQUFBLENBQXdDLENBQUMsSUFBekMsQ0FBOEMsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO2lCQUM1QyxLQUFDLENBQUEseUJBQUQsQ0FBMkIsS0FBQyxDQUFBLEtBQTVCLEVBQW1DLGNBQW5DO1FBRDRDO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE5QztJQUpPOzttQkFTVCxRQUFBLEdBQVUsU0FBQyxTQUFEO0FBQ1IsVUFBQTtNQUFBLFNBQUEsR0FBWSxJQUFDLENBQUEsTUFBTSxDQUFDLHVCQUFSLENBQWdDLFNBQVMsQ0FBQyxHQUExQztNQUNaLE1BQUEsR0FBUztNQUNULEtBQUEsR0FBUSxJQUFDLENBQUEsUUFBRCxDQUFVLElBQUMsQ0FBQSxLQUFYO01BQ1IsZUFBQSxHQUFrQixJQUFDLENBQUEsUUFBRCxDQUFVLENBQUMsQ0FBWDtNQUVsQixXQUFBLEdBQWtCLElBQUEsS0FBQSxDQUFNLENBQU4sRUFBWSxJQUFDLENBQUEsV0FBRCxDQUFBLENBQUgsR0FBdUIsSUFBQyxDQUFBLE1BQXhCLEdBQW9DLENBQUMsSUFBQyxDQUFBLE1BQS9DO01BQ2xCLElBQXlELElBQUMsQ0FBQSxRQUExRDtRQUFBLFNBQUEsR0FBWSxTQUFTLENBQUMsU0FBVixDQUFvQixXQUFXLENBQUMsTUFBWixDQUFBLENBQXBCLEVBQVo7O01BRUEsSUFBRyxJQUFDLENBQUEsV0FBRCxDQUFBLENBQUg7UUFDRSxJQUFnQyxJQUFDLENBQUEsU0FBRCxDQUFXLGlCQUFYLENBQWhDO1VBQUEsU0FBUyxDQUFDLEtBQVYsR0FBa0IsS0FBSyxDQUFDLEtBQXhCOztRQUNBLElBQUMsQ0FBQSxNQUFNLENBQUMsMEJBQVIsQ0FBbUMsS0FBbkMsRUFBMEMsU0FBMUMsRUFBcUQsU0FBQyxHQUFEO0FBQ25ELGNBQUE7VUFEcUQsbUJBQU87VUFDNUQsSUFBRyxLQUFLLENBQUMsS0FBSyxDQUFDLFVBQVosQ0FBdUIsU0FBdkIsQ0FBSDtZQUNFLE1BQU0sQ0FBQyxJQUFQLENBQVksS0FBSyxDQUFDLEtBQWxCO1lBQ0EsSUFBVSxNQUFNLENBQUMsTUFBUCxHQUFnQixlQUExQjtxQkFBQSxJQUFBLENBQUEsRUFBQTthQUZGOztRQURtRCxDQUFyRCxFQUZGO09BQUEsTUFBQTtRQU9FLElBQWtELElBQUMsQ0FBQSxTQUFELENBQVcsaUJBQVgsQ0FBbEQ7VUFBQSxTQUFTLENBQUMsR0FBVixHQUFnQixJQUFDLENBQUEsTUFBTSxDQUFDLG9CQUFSLENBQUEsRUFBaEI7O1FBQ0EsSUFBQyxDQUFBLE1BQU0sQ0FBQyxpQkFBUixDQUEwQixLQUExQixFQUFpQyxTQUFqQyxFQUE0QyxTQUFDLEdBQUQ7QUFDMUMsY0FBQTtVQUQ0QyxtQkFBTztVQUNuRCxJQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsYUFBWixDQUEwQixTQUExQixDQUFIO1lBQ0UsTUFBTSxDQUFDLElBQVAsQ0FBWSxLQUFLLENBQUMsS0FBbEI7WUFDQSxJQUFVLE1BQU0sQ0FBQyxNQUFQLEdBQWdCLGVBQTFCO3FCQUFBLElBQUEsQ0FBQSxFQUFBO2FBRkY7O1FBRDBDLENBQTVDLEVBUkY7OzREQWF1QixDQUFFLFNBQXpCLENBQW1DLFdBQW5DO0lBdEJROzttQkF3QlYseUJBQUEsR0FBMkIsU0FBQyxJQUFELEVBQU8sY0FBUCxFQUF1QixLQUF2QixFQUE4QyxXQUE5Qzs7UUFBdUIsUUFBUSxJQUFDLENBQUEsUUFBRCxDQUFVLENBQUMsQ0FBWDs7O1FBQWUsY0FBYzs7TUFDckYsSUFBQSxDQUFjLElBQUMsQ0FBQSxTQUFELENBQVcsbUJBQVgsQ0FBZDtBQUFBLGVBQUE7O2FBQ0EsSUFBQyxDQUFBLFFBQVEsQ0FBQyxhQUFhLENBQUMsbUJBQXhCLENBQTRDLElBQUMsQ0FBQSxRQUFELENBQVUsSUFBVixDQUE1QyxFQUE2RCxjQUE3RCxFQUE2RSxJQUFDLENBQUEsV0FBRCxDQUFBLENBQTdFLEVBQTZGLElBQUMsQ0FBQSxNQUE5RixFQUFzRyxLQUF0RyxFQUE2RyxXQUE3RztJQUZ5Qjs7bUJBSTNCLFVBQUEsR0FBWSxTQUFDLE1BQUQ7QUFDVixVQUFBO01BQUEsS0FBQSxHQUFRLElBQUMsQ0FBQSxRQUFELENBQVUsTUFBTSxDQUFDLGlCQUFQLENBQUEsQ0FBVjtNQUNSLElBQUcsYUFBSDtRQUNFLE1BQU0sQ0FBQyxpQkFBUCxDQUF5QixLQUF6QixFQURGO09BQUEsTUFBQTtRQUdFLElBQUMsQ0FBQSxrQkFBRCxDQUFBLEVBSEY7O01BS0EsSUFBQSxDQUE2QyxJQUFDLENBQUEsUUFBOUM7ZUFBQSxJQUFDLENBQUEsV0FBVyxDQUFDLEdBQWIsQ0FBaUIsYUFBakIsRUFBZ0MsSUFBaEMsRUFBQTs7SUFQVTs7bUJBU1osUUFBQSxHQUFVLFNBQUMsSUFBRDtBQUNSLFVBQUE7TUFBQSxTQUFBLEdBQWUsSUFBQyxDQUFBLGVBQUQsQ0FBaUIsSUFBakIsQ0FBSCxHQUErQixHQUEvQixHQUF3QzthQUNoRCxJQUFBLE1BQUEsQ0FBTyxDQUFDLENBQUMsWUFBRixDQUFlLElBQWYsQ0FBUCxFQUE2QixTQUE3QjtJQUZJOzs7O0tBekdPOztFQThHYjs7Ozs7OztJQUNKLGFBQUMsQ0FBQSxNQUFELENBQUE7OzRCQUNBLFNBQUEsR0FBVzs7NEJBQ1gsU0FBQSxHQUFXOzs7O0tBSGU7O0VBTXRCOzs7Ozs7O0lBQ0osSUFBQyxDQUFBLE1BQUQsQ0FBQTs7bUJBQ0EsTUFBQSxHQUFROzttQkFFUixRQUFBLEdBQVUsU0FBQTtNQUNSLElBQUMsQ0FBQSxLQUFELEdBQVMsb0NBQUEsU0FBQTtNQUNULElBQUMsQ0FBQSxhQUFELEdBQWlCO0FBQ2pCLGFBQU8sSUFBQyxDQUFBO0lBSEE7Ozs7S0FKTzs7RUFVYjs7Ozs7OztJQUNKLGFBQUMsQ0FBQSxNQUFELENBQUE7OzRCQUNBLFNBQUEsR0FBVzs7NEJBQ1gsU0FBQSxHQUFXOzs7O0tBSGU7O0VBUXRCOzs7Ozs7O0lBQ0osVUFBQyxDQUFBLE1BQUQsQ0FBQTs7eUJBQ0EsSUFBQSxHQUFNOzt5QkFDTixZQUFBLEdBQWM7O3lCQUNkLEtBQUEsR0FBTzs7eUJBRVAsVUFBQSxHQUFZLFNBQUE7TUFDViw0Q0FBQSxTQUFBO01BQ0EsSUFBQSxDQUFtQixJQUFDLENBQUEsVUFBRCxDQUFBLENBQW5CO2VBQUEsSUFBQyxDQUFBLFFBQUQsQ0FBQSxFQUFBOztJQUZVOzt5QkFJWixRQUFBLEdBQVUsU0FBQTthQUNSLElBQUMsQ0FBQSxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQWYsQ0FBbUIsSUFBQyxDQUFBLEtBQXBCO0lBRFE7O3lCQUdWLFVBQUEsR0FBWSxTQUFDLE1BQUQ7QUFDVixVQUFBO01BQUEsSUFBRyxLQUFBLEdBQVEsSUFBQyxDQUFBLFFBQUQsQ0FBQSxDQUFYO1FBQ0UsTUFBTSxDQUFDLGlCQUFQLENBQXlCLEtBQXpCO2VBQ0EsTUFBTSxDQUFDLFVBQVAsQ0FBa0I7VUFBQSxNQUFBLEVBQVEsSUFBUjtTQUFsQixFQUZGOztJQURVOzs7O0tBYlc7O0VBbUJuQjs7Ozs7OztJQUNKLGNBQUMsQ0FBQSxNQUFELENBQUE7OzZCQUNBLElBQUEsR0FBTTs7NkJBRU4sUUFBQSxHQUFVLFNBQUE7QUFDUixVQUFBO01BQUEsSUFBRyxLQUFBLEdBQVEsOENBQUEsU0FBQSxDQUFYO2VBQ0UsSUFBQyxDQUFBLHFDQUFELENBQXVDLEtBQUssQ0FBQyxHQUE3QyxFQURGOztJQURROzs7O0tBSmlCOztFQVV2Qjs7Ozs7OztJQUNKLHVCQUFDLENBQUEsTUFBRCxDQUFBOztJQUNBLHVCQUFDLENBQUEsV0FBRCxHQUFjOztzQ0FDZCxJQUFBLEdBQU07O3NDQUNOLEtBQUEsR0FBTzs7c0NBQ1AsU0FBQSxHQUFXOztzQ0FFWCxVQUFBLEdBQVksU0FBQTtNQUNWLHlEQUFBLFNBQUE7TUFDQSxJQUFDLENBQUEsSUFBRCxHQUFRLElBQUMsQ0FBQSxXQUFELENBQWEsSUFBQyxDQUFBLEtBQWQ7TUFDUixJQUFtQixJQUFDLENBQUEsU0FBRCxLQUFjLE1BQWpDO2VBQUEsSUFBQyxDQUFBLElBQUksQ0FBQyxPQUFOLENBQUEsRUFBQTs7SUFIVTs7c0NBS1osV0FBQSxHQUFhLFNBQUMsS0FBRDtBQUNYLFVBQUE7TUFBQSxLQUFBLEdBQVcsS0FBQSxLQUFTLE9BQVosR0FBeUIsQ0FBekIsR0FBZ0M7TUFDeEMsSUFBQSxHQUFPLG9CQUFBLENBQXFCLElBQUMsQ0FBQSxNQUF0QixDQUE2QixDQUFDLEdBQTlCLENBQWtDLFNBQUMsUUFBRDtlQUN2QyxRQUFTLENBQUEsS0FBQTtNQUQ4QixDQUFsQzthQUVQLENBQUMsQ0FBQyxNQUFGLENBQVMsQ0FBQyxDQUFDLElBQUYsQ0FBTyxJQUFQLENBQVQsRUFBdUIsU0FBQyxHQUFEO2VBQVM7TUFBVCxDQUF2QjtJQUpXOztzQ0FNYixXQUFBLEdBQWEsU0FBQyxNQUFEO0FBQ1gsVUFBQTtNQUFBLFNBQUEsR0FBWSxNQUFNLENBQUMsWUFBUCxDQUFBO01BQ1osVUFBQTtBQUFhLGdCQUFPLElBQUMsQ0FBQSxTQUFSO0FBQUEsZUFDTixNQURNO21CQUNNLFNBQUMsR0FBRDtxQkFBUyxHQUFBLEdBQU07WUFBZjtBQUROLGVBRU4sTUFGTTttQkFFTSxTQUFDLEdBQUQ7cUJBQVMsR0FBQSxHQUFNO1lBQWY7QUFGTjs7YUFHYixJQUFDLENBQUEsSUFBSSxDQUFDLE1BQU4sQ0FBYSxVQUFiO0lBTFc7O3NDQU9iLFNBQUEsR0FBVyxTQUFDLE1BQUQ7YUFDVCxJQUFDLENBQUEsV0FBRCxDQUFhLE1BQWIsQ0FBcUIsQ0FBQSxDQUFBO0lBRFo7O3NDQUdYLFVBQUEsR0FBWSxTQUFDLE1BQUQ7YUFDVixJQUFDLENBQUEsb0JBQUQsQ0FBc0IsTUFBdEIsRUFBOEIsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO0FBQzVCLGNBQUE7VUFBQSxJQUFHLHVDQUFIO21CQUNFLCtCQUFBLENBQWdDLE1BQWhDLEVBQXdDLEdBQXhDLEVBREY7O1FBRDRCO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE5QjtJQURVOzs7O0tBNUJ3Qjs7RUFpQ2hDOzs7Ozs7O0lBQ0osbUJBQUMsQ0FBQSxNQUFELENBQUE7O0lBQ0EsbUJBQUMsQ0FBQSxXQUFELEdBQWM7O2tDQUNkLFNBQUEsR0FBVzs7OztLQUhxQjs7RUFLNUI7Ozs7Ozs7SUFDSixxQ0FBQyxDQUFBLE1BQUQsQ0FBQTs7SUFDQSxxQ0FBQyxDQUFBLFdBQUQsR0FBYzs7b0RBQ2QsU0FBQSxHQUFXLFNBQUMsTUFBRDtBQUNULFVBQUE7TUFBQSxlQUFBLEdBQWtCLElBQUMsQ0FBQSwwQkFBRCxDQUE0QixNQUFNLENBQUMsWUFBUCxDQUFBLENBQTVCO0FBQ2xCO0FBQUEsV0FBQSxzQ0FBQTs7UUFDRSxJQUFHLElBQUMsQ0FBQSwwQkFBRCxDQUE0QixHQUE1QixDQUFBLEtBQW9DLGVBQXZDO0FBQ0UsaUJBQU8sSUFEVDs7QUFERjthQUdBO0lBTFM7Ozs7S0FIdUM7O0VBVTlDOzs7Ozs7O0lBQ0osaUNBQUMsQ0FBQSxNQUFELENBQUE7O0lBQ0EsaUNBQUMsQ0FBQSxXQUFELEdBQWM7O2dEQUNkLFNBQUEsR0FBVzs7OztLQUhtQzs7RUFLMUM7Ozs7Ozs7SUFDSixxQkFBQyxDQUFBLE1BQUQsQ0FBQTs7SUFDQSxxQkFBQyxDQUFBLFdBQUQsR0FBYzs7b0NBQ2QsS0FBQSxHQUFPOzs7O0tBSDJCOztFQUs5Qjs7Ozs7OztJQUNKLGlCQUFDLENBQUEsTUFBRCxDQUFBOztJQUNBLGlCQUFDLENBQUEsV0FBRCxHQUFjOztnQ0FDZCxTQUFBLEdBQVc7Ozs7S0FIbUI7O0VBTTFCOzs7Ozs7O0lBQ0osc0JBQUMsQ0FBQSxNQUFELENBQUE7O0lBQ0Esc0JBQUMsQ0FBQSxXQUFELEdBQWM7O3FDQUNkLFNBQUEsR0FBVzs7cUNBQ1gsU0FBQSxHQUFXLFNBQUMsTUFBRDthQUNULENBQUMsQ0FBQyxNQUFGLENBQVMsSUFBQyxDQUFBLFdBQUQsQ0FBYSxNQUFiLENBQVQsRUFBK0IsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLEdBQUQ7aUJBQzdCLDRCQUFBLENBQTZCLEtBQUMsQ0FBQSxNQUE5QixFQUFzQyxHQUF0QztRQUQ2QjtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBL0I7SUFEUzs7OztLQUp3Qjs7RUFRL0I7Ozs7Ozs7SUFDSixrQkFBQyxDQUFBLE1BQUQsQ0FBQTs7SUFDQSxrQkFBQyxDQUFBLFdBQUQsR0FBYzs7aUNBQ2QsU0FBQSxHQUFXOzs7O0tBSG9COztFQU8zQjs7Ozs7OztJQUNKLHFCQUFDLENBQUEsTUFBRCxDQUFRLEtBQVI7O29DQUNBLFNBQUEsR0FBVzs7b0NBQ1gsS0FBQSxHQUFPOztvQ0FFUCxRQUFBLEdBQVUsU0FBQyxTQUFEO2FBQ1IsZ0NBQUEsQ0FBaUMsSUFBQyxDQUFBLE1BQWxDLEVBQTBDLFNBQTFDLEVBQXFELElBQUMsQ0FBQSxTQUF0RCxFQUFpRSxJQUFDLENBQUEsS0FBbEU7SUFEUTs7b0NBR1YsVUFBQSxHQUFZLFNBQUMsTUFBRDthQUNWLElBQUMsQ0FBQSxvQkFBRCxDQUFzQixNQUF0QixFQUE4QixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7aUJBQzVCLEtBQUMsQ0FBQSx1QkFBRCxDQUF5QixNQUF6QixFQUFpQyxLQUFDLENBQUEsUUFBRCxDQUFVLE1BQU0sQ0FBQyxpQkFBUCxDQUFBLENBQVYsQ0FBakM7UUFENEI7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTlCO0lBRFU7Ozs7S0FSc0I7O0VBWTlCOzs7Ozs7O0lBQ0osb0JBQUMsQ0FBQSxNQUFELENBQUE7O0lBQ0Esb0JBQUMsQ0FBQSxXQUFELEdBQWM7O21DQUNkLFNBQUEsR0FBVzs7bUNBQ1gsS0FBQSxHQUFPOzs7O0tBSjBCOztFQU03Qjs7Ozs7OztJQUNKLGdCQUFDLENBQUEsTUFBRCxDQUFBOztJQUNBLGdCQUFDLENBQUEsV0FBRCxHQUFjOzsrQkFDZCxTQUFBLEdBQVc7Ozs7S0FIa0I7O0VBS3pCOzs7Ozs7O0lBQ0osb0JBQUMsQ0FBQSxNQUFELENBQUE7O21DQUNBLFNBQUEsR0FBVzs7SUFDWCxvQkFBQyxDQUFBLFdBQUQsR0FBYzs7bUNBQ2QsS0FBQSxHQUFPOzs7O0tBSjBCOztFQU03Qjs7Ozs7OztJQUNKLGdCQUFDLENBQUEsTUFBRCxDQUFBOztJQUNBLGdCQUFDLENBQUEsV0FBRCxHQUFjOzsrQkFDZCxTQUFBLEdBQVc7Ozs7S0FIa0I7O0VBS3pCOzs7Ozs7O0lBQ0osb0JBQUMsQ0FBQSxNQUFELENBQUE7O0lBRUEsb0JBQUMsQ0FBQSxZQUFELEdBQWU7O21DQUNmLElBQUEsR0FBTTs7bUNBQ04sU0FBQSxHQUFXOzttQ0FFWCxTQUFBLEdBQVcsU0FBQTthQUNULElBQUMsQ0FBQSxRQUFRLENBQUMsaUJBQWlCLENBQUMsVUFBNUIsQ0FBQSxDQUF3QyxDQUFDLEdBQXpDLENBQTZDLFNBQUMsTUFBRDtlQUMzQyxNQUFNLENBQUMsY0FBUCxDQUFBO01BRDJDLENBQTdDO0lBRFM7O21DQUlYLE9BQUEsR0FBUyxTQUFBO01BQ1AsSUFBQyxDQUFBLE1BQUQsR0FBVSxJQUFDLENBQUEsUUFBUSxDQUFDLEtBQUssQ0FBQyxVQUFoQixDQUEyQixJQUFDLENBQUEsU0FBRCxDQUFBLENBQTNCO2FBQ1YsbURBQUEsU0FBQTtJQUZPOzttQ0FJVCxVQUFBLEdBQVksU0FBQyxNQUFEO0FBQ1YsVUFBQTtNQUFBLEtBQUEsR0FBUSxJQUFDLENBQUEsTUFBTyxDQUFBLFFBQUEsQ0FBUyxJQUFDLENBQUEsUUFBRCxDQUFVLE1BQU0sQ0FBQyxpQkFBUCxDQUFBLENBQVYsQ0FBVCxFQUFnRCxJQUFDLENBQUEsTUFBakQsQ0FBQTtNQUNoQixLQUFBLEdBQVEsS0FBSyxDQUFDO01BQ2QsTUFBTSxDQUFDLGlCQUFQLENBQXlCLEtBQXpCLEVBQWdDO1FBQUEsVUFBQSxFQUFZLEtBQVo7T0FBaEM7TUFFQSxJQUFHLE1BQU0sQ0FBQyxZQUFQLENBQUEsQ0FBSDtRQUNFLElBQUMsQ0FBQSxNQUFNLENBQUMsZUFBUixDQUF3QixLQUFLLENBQUMsR0FBOUI7UUFDQSwyQkFBQSxDQUE0QixJQUFDLENBQUEsTUFBN0IsRUFBcUMsS0FBckMsRUFGRjs7TUFJQSxJQUFHLElBQUMsQ0FBQSxTQUFELENBQVcseUJBQVgsQ0FBSDtlQUNFLElBQUMsQ0FBQSxRQUFRLENBQUMsS0FBVixDQUFnQixLQUFoQixFQUF1QjtVQUFBLElBQUEsRUFBTSxRQUFOO1NBQXZCLEVBREY7O0lBVFU7O21DQVlaLFFBQUEsR0FBVSxTQUFDLFNBQUQ7QUFDUixVQUFBO01BQUEsS0FBQSxHQUFRO0FBQ1I7QUFBQSxXQUFBLDhDQUFBOztjQUE2QixLQUFLLENBQUMsS0FBSyxDQUFDLGFBQVosQ0FBMEIsU0FBMUI7OztRQUMzQixLQUFBLEdBQVE7QUFDUjtBQUZGO2FBR0EsaUJBQUMsUUFBUSxDQUFULENBQUEsR0FBYyxJQUFDLENBQUEsUUFBRCxDQUFVLENBQUMsQ0FBWDtJQUxOOzs7O0tBM0J1Qjs7RUFrQzdCOzs7Ozs7O0lBQ0osd0JBQUMsQ0FBQSxNQUFELENBQUE7O3VDQUNBLFNBQUEsR0FBVzs7dUNBRVgsUUFBQSxHQUFVLFNBQUMsU0FBRDtBQUNSLFVBQUE7TUFBQSxLQUFBLEdBQVE7QUFDUjtBQUFBLFdBQUEsNENBQUE7O2NBQW1DLEtBQUssQ0FBQyxHQUFHLENBQUMsVUFBVixDQUFxQixTQUFyQjs7O1FBQ2pDLEtBQUEsR0FBUTtBQUNSO0FBRkY7YUFHQSxpQkFBQyxRQUFRLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBUixHQUFpQixDQUExQixDQUFBLEdBQStCLElBQUMsQ0FBQSxRQUFELENBQVUsQ0FBQyxDQUFYO0lBTHZCOzs7O0tBSjJCOztFQWFqQzs7Ozs7OztJQUNKLFVBQUMsQ0FBQSxNQUFELENBQUE7O3lCQUNBLFNBQUEsR0FBVzs7eUJBQ1gsSUFBQSxHQUFNOzt5QkFDTixNQUFBLEdBQVEsQ0FBQyxhQUFELEVBQWdCLGNBQWhCLEVBQWdDLGVBQWhDOzt5QkFFUixVQUFBLEdBQVksU0FBQyxNQUFEO2FBQ1YsSUFBQyxDQUFBLHVCQUFELENBQXlCLE1BQXpCLEVBQWlDLElBQUMsQ0FBQSxRQUFELENBQVUsTUFBVixDQUFqQztJQURVOzt5QkFHWixjQUFBLEdBQWdCLFNBQUMsS0FBRDtBQUNkLFVBQUE7TUFBQSxRQUFBLEdBQVcsSUFBQyxFQUFBLEdBQUEsRUFBRCxDQUFLLE1BQUwsQ0FBWSxDQUFDLFdBQWIsQ0FBeUIsS0FBekI7TUFDWCxJQUFtQixnQkFBbkI7QUFBQSxlQUFPLEtBQVA7O01BQ0MsOEJBQUQsRUFBWTtNQUNaLFNBQUEsR0FBWSxTQUFTLENBQUMsU0FBVixDQUFvQixDQUFDLENBQUQsRUFBSSxDQUFDLENBQUwsQ0FBcEIsRUFBNkIsQ0FBQyxDQUFELEVBQUksQ0FBQyxDQUFMLENBQTdCO01BQ1osVUFBQSxHQUFhLFVBQVUsQ0FBQyxTQUFYLENBQXFCLENBQUMsQ0FBRCxFQUFJLENBQUMsQ0FBTCxDQUFyQixFQUE4QixDQUFDLENBQUQsRUFBSSxDQUFDLENBQUwsQ0FBOUI7TUFDYixJQUEyQixTQUFTLENBQUMsYUFBVixDQUF3QixLQUF4QixDQUFBLElBQW1DLENBQUMsQ0FBSSxLQUFLLENBQUMsT0FBTixDQUFjLFNBQVMsQ0FBQyxHQUF4QixDQUFMLENBQTlEO0FBQUEsZUFBTyxVQUFVLENBQUMsTUFBbEI7O01BQ0EsSUFBMEIsVUFBVSxDQUFDLGFBQVgsQ0FBeUIsS0FBekIsQ0FBQSxJQUFvQyxDQUFDLENBQUksS0FBSyxDQUFDLE9BQU4sQ0FBYyxVQUFVLENBQUMsR0FBekIsQ0FBTCxDQUE5RDtBQUFBLGVBQU8sU0FBUyxDQUFDLE1BQWpCOztJQVBjOzt5QkFTaEIsUUFBQSxHQUFVLFNBQUMsTUFBRDtBQUNSLFVBQUE7TUFBQSxjQUFBLEdBQWlCLE1BQU0sQ0FBQyxpQkFBUCxDQUFBO01BQ2pCLFNBQUEsR0FBWSxjQUFjLENBQUM7TUFDM0IsSUFBZ0IsS0FBQSxHQUFRLElBQUMsQ0FBQSxjQUFELENBQWdCLGNBQWhCLENBQXhCO0FBQUEsZUFBTyxNQUFQOztNQUdBLEtBQUEsR0FBUSxJQUFDLEVBQUEsR0FBQSxFQUFELENBQUsseUJBQUwsRUFBZ0M7UUFBRSxRQUFELElBQUMsQ0FBQSxNQUFGO09BQWhDLENBQTBDLENBQUMsUUFBM0MsQ0FBb0QsTUFBTSxDQUFDLFNBQTNEO01BQ1IsSUFBbUIsYUFBbkI7QUFBQSxlQUFPLEtBQVA7O01BQ0MsbUJBQUQsRUFBUTtNQUNSLElBQUcsQ0FBQyxLQUFLLENBQUMsR0FBTixLQUFhLFNBQWQsQ0FBQSxJQUE2QixLQUFLLENBQUMsb0JBQU4sQ0FBMkIsY0FBM0IsQ0FBaEM7ZUFFRSxHQUFHLENBQUMsU0FBSixDQUFjLENBQUMsQ0FBRCxFQUFJLENBQUMsQ0FBTCxDQUFkLEVBRkY7T0FBQSxNQUdLLElBQUcsR0FBRyxDQUFDLEdBQUosS0FBVyxjQUFjLENBQUMsR0FBN0I7ZUFHSCxNQUhHOztJQVpHOzs7O0tBbEJhO0FBaHNDekIiLCJzb3VyY2VzQ29udGVudCI6WyJfID0gcmVxdWlyZSAndW5kZXJzY29yZS1wbHVzJ1xue1BvaW50LCBSYW5nZX0gPSByZXF1aXJlICdhdG9tJ1xuXG57XG4gIG1vdmVDdXJzb3JMZWZ0LCBtb3ZlQ3Vyc29yUmlnaHRcbiAgbW92ZUN1cnNvclVwU2NyZWVuLCBtb3ZlQ3Vyc29yRG93blNjcmVlblxuICBwb2ludElzQXRWaW1FbmRPZkZpbGVcbiAgZ2V0Rmlyc3RWaXNpYmxlU2NyZWVuUm93LCBnZXRMYXN0VmlzaWJsZVNjcmVlblJvd1xuICBnZXRWYWxpZFZpbVNjcmVlblJvdywgZ2V0VmFsaWRWaW1CdWZmZXJSb3dcbiAgbW92ZUN1cnNvclRvRmlyc3RDaGFyYWN0ZXJBdFJvd1xuICBzb3J0UmFuZ2VzXG4gIHBvaW50SXNPbldoaXRlU3BhY2VcbiAgbW92ZUN1cnNvclRvTmV4dE5vbldoaXRlc3BhY2VcbiAgaXNFbXB0eVJvd1xuICBnZXRDb2RlRm9sZFJvd1Jhbmdlc1xuICBnZXRMYXJnZXN0Rm9sZFJhbmdlQ29udGFpbnNCdWZmZXJSb3dcbiAgaXNJbmNsdWRlRnVuY3Rpb25TY29wZUZvclJvd1xuICBkZXRlY3RTY29wZVN0YXJ0UG9zaXRpb25Gb3JTY29wZVxuICBnZXRCdWZmZXJSb3dzXG4gIGdldFRleHRJblNjcmVlblJhbmdlXG4gIHNldEJ1ZmZlclJvd1xuICBzZXRCdWZmZXJDb2x1bW5cbiAgbGltaXROdW1iZXJcbiAgZ2V0SW5kZXhcbiAgc21hcnRTY3JvbGxUb0J1ZmZlclBvc2l0aW9uXG4gIHBvaW50SXNBdEVuZE9mTGluZUF0Tm9uRW1wdHlSb3dcbiAgZ2V0RW5kT2ZMaW5lRm9yQnVmZmVyUm93XG4gIGZpbmRSYW5nZUluQnVmZmVyUm93XG4gIHNhdmVFZGl0b3JTdGF0ZVxufSA9IHJlcXVpcmUgJy4vdXRpbHMnXG5cbkJhc2UgPSByZXF1aXJlICcuL2Jhc2UnXG5cbmNsYXNzIE1vdGlvbiBleHRlbmRzIEJhc2VcbiAgQGV4dGVuZChmYWxzZSlcbiAgQG9wZXJhdGlvbktpbmQ6ICdtb3Rpb24nXG4gIGluY2x1c2l2ZTogZmFsc2VcbiAgd2lzZTogJ2NoYXJhY3Rlcndpc2UnXG4gIGp1bXA6IGZhbHNlXG4gIHZlcnRpY2FsTW90aW9uOiBmYWxzZVxuICBtb3ZlU3VjY2VlZGVkOiBudWxsXG4gIG1vdmVTdWNjZXNzT25MaW5ld2lzZTogZmFsc2VcblxuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBzdXBlclxuXG4gICAgaWYgQG1vZGUgaXMgJ3Zpc3VhbCdcbiAgICAgIEB3aXNlID0gQHN1Ym1vZGVcbiAgICBAaW5pdGlhbGl6ZSgpXG5cbiAgaXNMaW5ld2lzZTogLT4gQHdpc2UgaXMgJ2xpbmV3aXNlJ1xuICBpc0Jsb2Nrd2lzZTogLT4gQHdpc2UgaXMgJ2Jsb2Nrd2lzZSdcblxuICBmb3JjZVdpc2U6ICh3aXNlKSAtPlxuICAgIGlmIHdpc2UgaXMgJ2NoYXJhY3Rlcndpc2UnXG4gICAgICBpZiBAd2lzZSBpcyAnbGluZXdpc2UnXG4gICAgICAgIEBpbmNsdXNpdmUgPSBmYWxzZVxuICAgICAgZWxzZVxuICAgICAgICBAaW5jbHVzaXZlID0gbm90IEBpbmNsdXNpdmVcbiAgICBAd2lzZSA9IHdpc2VcblxuICBzZXRCdWZmZXJQb3NpdGlvblNhZmVseTogKGN1cnNvciwgcG9pbnQpIC0+XG4gICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHBvaW50KSBpZiBwb2ludD9cblxuICBzZXRTY3JlZW5Qb3NpdGlvblNhZmVseTogKGN1cnNvciwgcG9pbnQpIC0+XG4gICAgY3Vyc29yLnNldFNjcmVlblBvc2l0aW9uKHBvaW50KSBpZiBwb2ludD9cblxuICBtb3ZlV2l0aFNhdmVKdW1wOiAoY3Vyc29yKSAtPlxuICAgIGlmIGN1cnNvci5pc0xhc3RDdXJzb3IoKSBhbmQgQGp1bXBcbiAgICAgIGN1cnNvclBvc2l0aW9uID0gY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKClcblxuICAgIEBtb3ZlQ3Vyc29yKGN1cnNvcilcblxuICAgIGlmIGN1cnNvclBvc2l0aW9uPyBhbmQgbm90IGN1cnNvclBvc2l0aW9uLmlzRXF1YWwoY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKCkpXG4gICAgICBAdmltU3RhdGUubWFyay5zZXQoJ2AnLCBjdXJzb3JQb3NpdGlvbilcbiAgICAgIEB2aW1TdGF0ZS5tYXJrLnNldChcIidcIiwgY3Vyc29yUG9zaXRpb24pXG5cbiAgZXhlY3V0ZTogLT5cbiAgICBpZiBAb3BlcmF0b3I/XG4gICAgICBAc2VsZWN0KClcbiAgICBlbHNlXG4gICAgICBAbW92ZVdpdGhTYXZlSnVtcChjdXJzb3IpIGZvciBjdXJzb3IgaW4gQGVkaXRvci5nZXRDdXJzb3JzKClcbiAgICBAZWRpdG9yLm1lcmdlQ3Vyc29ycygpXG4gICAgQGVkaXRvci5tZXJnZUludGVyc2VjdGluZ1NlbGVjdGlvbnMoKVxuXG4gICMgTk9URTogTW9kaWZ5IHNlbGVjdGlvbiBieSBtb2R0aW9uLCBzZWxlY3Rpb24gaXMgYWxyZWFkeSBcIm5vcm1hbGl6ZWRcIiBiZWZvcmUgdGhpcyBmdW5jdGlvbiBpcyBjYWxsZWQuXG4gIHNlbGVjdDogLT5cbiAgICBpc09yV2FzVmlzdWFsID0gQG1vZGUgaXMgJ3Zpc3VhbCcgb3IgQGlzKCdDdXJyZW50U2VsZWN0aW9uJykgIyBuZWVkIHRvIGNhcmUgd2FzIHZpc3VhbCBmb3IgYC5gIHJlcGVhdGVkLlxuICAgIGZvciBzZWxlY3Rpb24gaW4gQGVkaXRvci5nZXRTZWxlY3Rpb25zKClcbiAgICAgIHNlbGVjdGlvbi5tb2RpZnlTZWxlY3Rpb24gPT5cbiAgICAgICAgQG1vdmVXaXRoU2F2ZUp1bXAoc2VsZWN0aW9uLmN1cnNvcilcblxuICAgICAgc3VjY2VlZGVkID0gQG1vdmVTdWNjZWVkZWQgPyBub3Qgc2VsZWN0aW9uLmlzRW1wdHkoKSBvciAoQG1vdmVTdWNjZXNzT25MaW5ld2lzZSBhbmQgQGlzTGluZXdpc2UoKSlcbiAgICAgIGlmIGlzT3JXYXNWaXN1YWwgb3IgKHN1Y2NlZWRlZCBhbmQgKEBpbmNsdXNpdmUgb3IgQGlzTGluZXdpc2UoKSkpXG4gICAgICAgICRzZWxlY3Rpb24gPSBAc3dyYXAoc2VsZWN0aW9uKVxuICAgICAgICAkc2VsZWN0aW9uLnNhdmVQcm9wZXJ0aWVzKHRydWUpICMgc2F2ZSBwcm9wZXJ0eSBvZiBcImFscmVhZHktbm9ybWFsaXplZC1zZWxlY3Rpb25cIlxuICAgICAgICAkc2VsZWN0aW9uLmFwcGx5V2lzZShAd2lzZSlcblxuICAgIEB2aW1TdGF0ZS5nZXRMYXN0QmxvY2t3aXNlU2VsZWN0aW9uKCkuYXV0b3Njcm9sbCgpIGlmIEB3aXNlIGlzICdibG9ja3dpc2UnXG5cbiAgc2V0Q3Vyc29yQnVmZmVyUm93OiAoY3Vyc29yLCByb3csIG9wdGlvbnMpIC0+XG4gICAgaWYgQHZlcnRpY2FsTW90aW9uIGFuZCBub3QgQGdldENvbmZpZygnc3RheU9uVmVydGljYWxNb3Rpb24nKVxuICAgICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKEBnZXRGaXJzdENoYXJhY3RlclBvc2l0aW9uRm9yQnVmZmVyUm93KHJvdyksIG9wdGlvbnMpXG4gICAgZWxzZVxuICAgICAgc2V0QnVmZmVyUm93KGN1cnNvciwgcm93LCBvcHRpb25zKVxuXG4gICMgW05PVEVdXG4gICMgU2luY2UgdGhpcyBmdW5jdGlvbiBjaGVja3MgY3Vyc29yIHBvc2l0aW9uIGNoYW5nZSwgYSBjdXJzb3IgcG9zaXRpb24gTVVTVCBiZVxuICAjIHVwZGF0ZWQgSU4gY2FsbGJhY2soPWZuKVxuICAjIFVwZGF0aW5nIHBvaW50IG9ubHkgaW4gY2FsbGJhY2sgaXMgd3JvbmctdXNlIG9mIHRoaXMgZnVuY2l0b24sXG4gICMgc2luY2UgaXQgc3RvcHMgaW1tZWRpYXRlbHkgYmVjYXVzZSBvZiBub3QgY3Vyc29yIHBvc2l0aW9uIGNoYW5nZS5cbiAgbW92ZUN1cnNvckNvdW50VGltZXM6IChjdXJzb3IsIGZuKSAtPlxuICAgIG9sZFBvc2l0aW9uID0gY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKClcbiAgICBAY291bnRUaW1lcyBAZ2V0Q291bnQoKSwgKHN0YXRlKSAtPlxuICAgICAgZm4oc3RhdGUpXG4gICAgICBpZiAobmV3UG9zaXRpb24gPSBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKSkuaXNFcXVhbChvbGRQb3NpdGlvbilcbiAgICAgICAgc3RhdGUuc3RvcCgpXG4gICAgICBvbGRQb3NpdGlvbiA9IG5ld1Bvc2l0aW9uXG5cbiAgaXNDYXNlU2Vuc2l0aXZlOiAodGVybSkgLT5cbiAgICBpZiBAZ2V0Q29uZmlnKFwidXNlU21hcnRjYXNlRm9yI3tAY2FzZVNlbnNpdGl2aXR5S2luZH1cIilcbiAgICAgIHRlcm0uc2VhcmNoKC9bQS1aXS8pIGlzbnQgLTFcbiAgICBlbHNlXG4gICAgICBub3QgQGdldENvbmZpZyhcImlnbm9yZUNhc2VGb3Ije0BjYXNlU2Vuc2l0aXZpdHlLaW5kfVwiKVxuXG4jIFVzZWQgYXMgb3BlcmF0b3IncyB0YXJnZXQgaW4gdmlzdWFsLW1vZGUuXG5jbGFzcyBDdXJyZW50U2VsZWN0aW9uIGV4dGVuZHMgTW90aW9uXG4gIEBleHRlbmQoZmFsc2UpXG4gIHNlbGVjdGlvbkV4dGVudDogbnVsbFxuICBibG9ja3dpc2VTZWxlY3Rpb25FeHRlbnQ6IG51bGxcbiAgaW5jbHVzaXZlOiB0cnVlXG5cbiAgaW5pdGlhbGl6ZTogLT5cbiAgICBzdXBlclxuICAgIEBwb2ludEluZm9CeUN1cnNvciA9IG5ldyBNYXBcblxuICBtb3ZlQ3Vyc29yOiAoY3Vyc29yKSAtPlxuICAgIGlmIEBtb2RlIGlzICd2aXN1YWwnXG4gICAgICBpZiBAaXNCbG9ja3dpc2UoKVxuICAgICAgICBAYmxvY2t3aXNlU2VsZWN0aW9uRXh0ZW50ID0gQHN3cmFwKGN1cnNvci5zZWxlY3Rpb24pLmdldEJsb2Nrd2lzZVNlbGVjdGlvbkV4dGVudCgpXG4gICAgICBlbHNlXG4gICAgICAgIEBzZWxlY3Rpb25FeHRlbnQgPSBAZWRpdG9yLmdldFNlbGVjdGVkQnVmZmVyUmFuZ2UoKS5nZXRFeHRlbnQoKVxuICAgIGVsc2VcbiAgICAgICMgYC5gIHJlcGVhdCBjYXNlXG4gICAgICBwb2ludCA9IGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXG5cbiAgICAgIGlmIEBibG9ja3dpc2VTZWxlY3Rpb25FeHRlbnQ/XG4gICAgICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihwb2ludC50cmFuc2xhdGUoQGJsb2Nrd2lzZVNlbGVjdGlvbkV4dGVudCkpXG4gICAgICBlbHNlXG4gICAgICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihwb2ludC50cmF2ZXJzZShAc2VsZWN0aW9uRXh0ZW50KSlcblxuICBzZWxlY3Q6IC0+XG4gICAgaWYgQG1vZGUgaXMgJ3Zpc3VhbCdcbiAgICAgIHN1cGVyXG4gICAgZWxzZVxuICAgICAgZm9yIGN1cnNvciBpbiBAZWRpdG9yLmdldEN1cnNvcnMoKSB3aGVuIHBvaW50SW5mbyA9IEBwb2ludEluZm9CeUN1cnNvci5nZXQoY3Vyc29yKVxuICAgICAgICB7Y3Vyc29yUG9zaXRpb24sIHN0YXJ0T2ZTZWxlY3Rpb259ID0gcG9pbnRJbmZvXG4gICAgICAgIGlmIGN1cnNvclBvc2l0aW9uLmlzRXF1YWwoY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKCkpXG4gICAgICAgICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHN0YXJ0T2ZTZWxlY3Rpb24pXG4gICAgICBzdXBlclxuXG4gICAgIyAqIFB1cnBvc2Ugb2YgcG9pbnRJbmZvQnlDdXJzb3I/IHNlZSAjMjM1IGZvciBkZXRhaWwuXG4gICAgIyBXaGVuIHN0YXlPblRyYW5zZm9ybVN0cmluZyBpcyBlbmFibGVkLCBjdXJzb3IgcG9zIGlzIG5vdCBzZXQgb24gc3RhcnQgb2ZcbiAgICAjIG9mIHNlbGVjdGVkIHJhbmdlLlxuICAgICMgQnV0IEkgd2FudCBmb2xsb3dpbmcgYmVoYXZpb3IsIHNvIG5lZWQgdG8gcHJlc2VydmUgcG9zaXRpb24gaW5mby5cbiAgICAjICAxLiBgdmo+LmAgLT4gaW5kZW50IHNhbWUgdHdvIHJvd3MgcmVnYXJkbGVzcyBvZiBjdXJyZW50IGN1cnNvcidzIHJvdy5cbiAgICAjICAyLiBgdmo+ai5gIC0+IGluZGVudCB0d28gcm93cyBmcm9tIGN1cnNvcidzIHJvdy5cbiAgICBmb3IgY3Vyc29yIGluIEBlZGl0b3IuZ2V0Q3Vyc29ycygpXG4gICAgICBzdGFydE9mU2VsZWN0aW9uID0gY3Vyc29yLnNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpLnN0YXJ0XG4gICAgICBAb25EaWRGaW5pc2hPcGVyYXRpb24gPT5cbiAgICAgICAgY3Vyc29yUG9zaXRpb24gPSBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuICAgICAgICBAcG9pbnRJbmZvQnlDdXJzb3Iuc2V0KGN1cnNvciwge3N0YXJ0T2ZTZWxlY3Rpb24sIGN1cnNvclBvc2l0aW9ufSlcblxuY2xhc3MgTW92ZUxlZnQgZXh0ZW5kcyBNb3Rpb25cbiAgQGV4dGVuZCgpXG4gIG1vdmVDdXJzb3I6IChjdXJzb3IpIC0+XG4gICAgYWxsb3dXcmFwID0gQGdldENvbmZpZygnd3JhcExlZnRSaWdodE1vdGlvbicpXG4gICAgQG1vdmVDdXJzb3JDb3VudFRpbWVzIGN1cnNvciwgLT5cbiAgICAgIG1vdmVDdXJzb3JMZWZ0KGN1cnNvciwge2FsbG93V3JhcH0pXG5cbmNsYXNzIE1vdmVSaWdodCBleHRlbmRzIE1vdGlvblxuICBAZXh0ZW5kKClcbiAgY2FuV3JhcFRvTmV4dExpbmU6IChjdXJzb3IpIC0+XG4gICAgaWYgQGlzQXNUYXJnZXRFeGNlcHRTZWxlY3QoKSBhbmQgbm90IGN1cnNvci5pc0F0RW5kT2ZMaW5lKClcbiAgICAgIGZhbHNlXG4gICAgZWxzZVxuICAgICAgQGdldENvbmZpZygnd3JhcExlZnRSaWdodE1vdGlvbicpXG5cbiAgbW92ZUN1cnNvcjogKGN1cnNvcikgLT5cbiAgICBAbW92ZUN1cnNvckNvdW50VGltZXMgY3Vyc29yLCA9PlxuICAgICAgY3Vyc29yUG9zaXRpb24gPSBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuICAgICAgQGVkaXRvci51bmZvbGRCdWZmZXJSb3coY3Vyc29yUG9zaXRpb24ucm93KVxuICAgICAgYWxsb3dXcmFwID0gQGNhbldyYXBUb05leHRMaW5lKGN1cnNvcilcbiAgICAgIG1vdmVDdXJzb3JSaWdodChjdXJzb3IpXG4gICAgICBpZiBjdXJzb3IuaXNBdEVuZE9mTGluZSgpIGFuZCBhbGxvd1dyYXAgYW5kIG5vdCBwb2ludElzQXRWaW1FbmRPZkZpbGUoQGVkaXRvciwgY3Vyc29yUG9zaXRpb24pXG4gICAgICAgIG1vdmVDdXJzb3JSaWdodChjdXJzb3IsIHthbGxvd1dyYXB9KVxuXG5jbGFzcyBNb3ZlUmlnaHRCdWZmZXJDb2x1bW4gZXh0ZW5kcyBNb3Rpb25cbiAgQGV4dGVuZChmYWxzZSlcblxuICBtb3ZlQ3Vyc29yOiAoY3Vyc29yKSAtPlxuICAgIHNldEJ1ZmZlckNvbHVtbihjdXJzb3IsIGN1cnNvci5nZXRCdWZmZXJDb2x1bW4oKSArIEBnZXRDb3VudCgpKVxuXG5jbGFzcyBNb3ZlVXAgZXh0ZW5kcyBNb3Rpb25cbiAgQGV4dGVuZCgpXG4gIHdpc2U6ICdsaW5ld2lzZSdcbiAgd3JhcDogZmFsc2VcblxuICBnZXRCdWZmZXJSb3c6IChyb3cpIC0+XG4gICAgcm93ID0gQGdldE5leHRSb3cocm93KVxuICAgIGlmIEBlZGl0b3IuaXNGb2xkZWRBdEJ1ZmZlclJvdyhyb3cpXG4gICAgICBnZXRMYXJnZXN0Rm9sZFJhbmdlQ29udGFpbnNCdWZmZXJSb3coQGVkaXRvciwgcm93KS5zdGFydC5yb3dcbiAgICBlbHNlXG4gICAgICByb3dcblxuICBnZXROZXh0Um93OiAocm93KSAtPlxuICAgIG1pbiA9IDBcbiAgICBpZiBAd3JhcCBhbmQgcm93IGlzIG1pblxuICAgICAgQGdldFZpbUxhc3RCdWZmZXJSb3coKVxuICAgIGVsc2VcbiAgICAgIGxpbWl0TnVtYmVyKHJvdyAtIDEsIHttaW59KVxuXG4gIG1vdmVDdXJzb3I6IChjdXJzb3IpIC0+XG4gICAgQG1vdmVDdXJzb3JDb3VudFRpbWVzIGN1cnNvciwgPT5cbiAgICAgIHNldEJ1ZmZlclJvdyhjdXJzb3IsIEBnZXRCdWZmZXJSb3coY3Vyc29yLmdldEJ1ZmZlclJvdygpKSlcblxuY2xhc3MgTW92ZVVwV3JhcCBleHRlbmRzIE1vdmVVcFxuICBAZXh0ZW5kKClcbiAgd3JhcDogdHJ1ZVxuXG5jbGFzcyBNb3ZlRG93biBleHRlbmRzIE1vdmVVcFxuICBAZXh0ZW5kKClcbiAgd2lzZTogJ2xpbmV3aXNlJ1xuICB3cmFwOiBmYWxzZVxuXG4gIGdldEJ1ZmZlclJvdzogKHJvdykgLT5cbiAgICBpZiBAZWRpdG9yLmlzRm9sZGVkQXRCdWZmZXJSb3cocm93KVxuICAgICAgcm93ID0gZ2V0TGFyZ2VzdEZvbGRSYW5nZUNvbnRhaW5zQnVmZmVyUm93KEBlZGl0b3IsIHJvdykuZW5kLnJvd1xuICAgIEBnZXROZXh0Um93KHJvdylcblxuICBnZXROZXh0Um93OiAocm93KSAtPlxuICAgIG1heCA9IEBnZXRWaW1MYXN0QnVmZmVyUm93KClcbiAgICBpZiBAd3JhcCBhbmQgcm93ID49IG1heFxuICAgICAgMFxuICAgIGVsc2VcbiAgICAgIGxpbWl0TnVtYmVyKHJvdyArIDEsIHttYXh9KVxuXG5jbGFzcyBNb3ZlRG93bldyYXAgZXh0ZW5kcyBNb3ZlRG93blxuICBAZXh0ZW5kKClcbiAgd3JhcDogdHJ1ZVxuXG5jbGFzcyBNb3ZlVXBTY3JlZW4gZXh0ZW5kcyBNb3Rpb25cbiAgQGV4dGVuZCgpXG4gIHdpc2U6ICdsaW5ld2lzZSdcbiAgZGlyZWN0aW9uOiAndXAnXG5cbiAgbW92ZUN1cnNvcjogKGN1cnNvcikgLT5cbiAgICBAbW92ZUN1cnNvckNvdW50VGltZXMgY3Vyc29yLCAtPlxuICAgICAgbW92ZUN1cnNvclVwU2NyZWVuKGN1cnNvcilcblxuY2xhc3MgTW92ZURvd25TY3JlZW4gZXh0ZW5kcyBNb3ZlVXBTY3JlZW5cbiAgQGV4dGVuZCgpXG4gIHdpc2U6ICdsaW5ld2lzZSdcbiAgZGlyZWN0aW9uOiAnZG93bidcblxuICBtb3ZlQ3Vyc29yOiAoY3Vyc29yKSAtPlxuICAgIEBtb3ZlQ3Vyc29yQ291bnRUaW1lcyBjdXJzb3IsIC0+XG4gICAgICBtb3ZlQ3Vyc29yRG93blNjcmVlbihjdXJzb3IpXG5cbiMgTW92ZSBkb3duL3VwIHRvIEVkZ2VcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBTZWUgdDltZC9hdG9tLXZpbS1tb2RlLXBsdXMjMjM2XG4jIEF0IGxlYXN0IHYxLjcuMC4gYnVmZmVyUG9zaXRpb24gYW5kIHNjcmVlblBvc2l0aW9uIGNhbm5vdCBjb252ZXJ0IGFjY3VyYXRlbHlcbiMgd2hlbiByb3cgaXMgZm9sZGVkLlxuY2xhc3MgTW92ZVVwVG9FZGdlIGV4dGVuZHMgTW90aW9uXG4gIEBleHRlbmQoKVxuICB3aXNlOiAnbGluZXdpc2UnXG4gIGp1bXA6IHRydWVcbiAgZGlyZWN0aW9uOiAndXAnXG4gIEBkZXNjcmlwdGlvbjogXCJNb3ZlIGN1cnNvciB1cCB0byAqKmVkZ2UqKiBjaGFyIGF0IHNhbWUtY29sdW1uXCJcblxuICBtb3ZlQ3Vyc29yOiAoY3Vyc29yKSAtPlxuICAgIEBtb3ZlQ3Vyc29yQ291bnRUaW1lcyBjdXJzb3IsID0+XG4gICAgICBAc2V0U2NyZWVuUG9zaXRpb25TYWZlbHkoY3Vyc29yLCBAZ2V0UG9pbnQoY3Vyc29yLmdldFNjcmVlblBvc2l0aW9uKCkpKVxuXG4gIGdldFBvaW50OiAoZnJvbVBvaW50KSAtPlxuICAgIGNvbHVtbiA9IGZyb21Qb2ludC5jb2x1bW5cbiAgICBmb3Igcm93IGluIEBnZXRTY2FuUm93cyhmcm9tUG9pbnQpIHdoZW4gQGlzRWRnZShwb2ludCA9IG5ldyBQb2ludChyb3csIGNvbHVtbikpXG4gICAgICByZXR1cm4gcG9pbnRcblxuICBnZXRTY2FuUm93czogKHtyb3d9KSAtPlxuICAgIHZhbGlkUm93ID0gZ2V0VmFsaWRWaW1TY3JlZW5Sb3cuYmluZChudWxsLCBAZWRpdG9yKVxuICAgIHN3aXRjaCBAZGlyZWN0aW9uXG4gICAgICB3aGVuICd1cCcgdGhlbiBbdmFsaWRSb3cocm93IC0gMSkuLjBdXG4gICAgICB3aGVuICdkb3duJyB0aGVuIFt2YWxpZFJvdyhyb3cgKyAxKS4uQGdldFZpbUxhc3RTY3JlZW5Sb3coKV1cblxuICBpc0VkZ2U6IChwb2ludCkgLT5cbiAgICBpZiBAaXNTdG9wcGFibGVQb2ludChwb2ludClcbiAgICAgICMgSWYgb25lIG9mIGFib3ZlL2JlbG93IHBvaW50IHdhcyBub3Qgc3RvcHBhYmxlLCBpdCdzIEVkZ2UhXG4gICAgICBhYm92ZSA9IHBvaW50LnRyYW5zbGF0ZShbLTEsIDBdKVxuICAgICAgYmVsb3cgPSBwb2ludC50cmFuc2xhdGUoWysxLCAwXSlcbiAgICAgIChub3QgQGlzU3RvcHBhYmxlUG9pbnQoYWJvdmUpKSBvciAobm90IEBpc1N0b3BwYWJsZVBvaW50KGJlbG93KSlcbiAgICBlbHNlXG4gICAgICBmYWxzZVxuXG4gIGlzU3RvcHBhYmxlUG9pbnQ6IChwb2ludCkgLT5cbiAgICBpZiBAaXNOb25XaGl0ZVNwYWNlUG9pbnQocG9pbnQpXG4gICAgICB0cnVlXG4gICAgZWxzZVxuICAgICAgbGVmdFBvaW50ID0gcG9pbnQudHJhbnNsYXRlKFswLCAtMV0pXG4gICAgICByaWdodFBvaW50ID0gcG9pbnQudHJhbnNsYXRlKFswLCArMV0pXG4gICAgICBAaXNOb25XaGl0ZVNwYWNlUG9pbnQobGVmdFBvaW50KSBhbmQgQGlzTm9uV2hpdGVTcGFjZVBvaW50KHJpZ2h0UG9pbnQpXG5cbiAgaXNOb25XaGl0ZVNwYWNlUG9pbnQ6IChwb2ludCkgLT5cbiAgICBjaGFyID0gZ2V0VGV4dEluU2NyZWVuUmFuZ2UoQGVkaXRvciwgUmFuZ2UuZnJvbVBvaW50V2l0aERlbHRhKHBvaW50LCAwLCAxKSlcbiAgICBjaGFyPyBhbmQgL1xcUy8udGVzdChjaGFyKVxuXG5jbGFzcyBNb3ZlRG93blRvRWRnZSBleHRlbmRzIE1vdmVVcFRvRWRnZVxuICBAZXh0ZW5kKClcbiAgQGRlc2NyaXB0aW9uOiBcIk1vdmUgY3Vyc29yIGRvd24gdG8gKiplZGdlKiogY2hhciBhdCBzYW1lLWNvbHVtblwiXG4gIGRpcmVjdGlvbjogJ2Rvd24nXG5cbiMgd29yZFxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBNb3ZlVG9OZXh0V29yZCBleHRlbmRzIE1vdGlvblxuICBAZXh0ZW5kKClcbiAgd29yZFJlZ2V4OiBudWxsXG5cbiAgZ2V0UG9pbnQ6IChwYXR0ZXJuLCBmcm9tKSAtPlxuICAgIHdvcmRSYW5nZSA9IG51bGxcbiAgICBmb3VuZCA9IGZhbHNlXG4gICAgdmltRU9GID0gQGdldFZpbUVvZkJ1ZmZlclBvc2l0aW9uKEBlZGl0b3IpXG5cbiAgICBAc2NhbkZvcndhcmQgcGF0dGVybiwge2Zyb219LCAoe3JhbmdlLCBtYXRjaFRleHQsIHN0b3B9KSAtPlxuICAgICAgd29yZFJhbmdlID0gcmFuZ2VcbiAgICAgICMgSWdub3JlICdlbXB0eSBsaW5lJyBtYXRjaGVzIGJldHdlZW4gJ1xccicgYW5kICdcXG4nXG4gICAgICByZXR1cm4gaWYgbWF0Y2hUZXh0IGlzICcnIGFuZCByYW5nZS5zdGFydC5jb2x1bW4gaXNudCAwXG4gICAgICBpZiByYW5nZS5zdGFydC5pc0dyZWF0ZXJUaGFuKGZyb20pXG4gICAgICAgIGZvdW5kID0gdHJ1ZVxuICAgICAgICBzdG9wKClcblxuICAgIGlmIGZvdW5kXG4gICAgICBwb2ludCA9IHdvcmRSYW5nZS5zdGFydFxuICAgICAgaWYgcG9pbnRJc0F0RW5kT2ZMaW5lQXROb25FbXB0eVJvdyhAZWRpdG9yLCBwb2ludCkgYW5kIG5vdCBwb2ludC5pc0VxdWFsKHZpbUVPRilcbiAgICAgICAgcG9pbnQudHJhdmVyc2UoWzEsIDBdKVxuICAgICAgZWxzZVxuICAgICAgICBwb2ludFxuICAgIGVsc2VcbiAgICAgIHdvcmRSYW5nZT8uZW5kID8gZnJvbVxuXG4gICMgU3BlY2lhbCBjYXNlOiBcImN3XCIgYW5kIFwiY1dcIiBhcmUgdHJlYXRlZCBsaWtlIFwiY2VcIiBhbmQgXCJjRVwiIGlmIHRoZSBjdXJzb3IgaXNcbiAgIyBvbiBhIG5vbi1ibGFuay4gIFRoaXMgaXMgYmVjYXVzZSBcImN3XCIgaXMgaW50ZXJwcmV0ZWQgYXMgY2hhbmdlLXdvcmQsIGFuZCBhXG4gICMgd29yZCBkb2VzIG5vdCBpbmNsdWRlIHRoZSBmb2xsb3dpbmcgd2hpdGUgc3BhY2UuICB7Vmk6IFwiY3dcIiB3aGVuIG9uIGEgYmxhbmtcbiAgIyBmb2xsb3dlZCBieSBvdGhlciBibGFua3MgY2hhbmdlcyBvbmx5IHRoZSBmaXJzdCBibGFuazsgdGhpcyBpcyBwcm9iYWJseSBhXG4gICMgYnVnLCBiZWNhdXNlIFwiZHdcIiBkZWxldGVzIGFsbCB0aGUgYmxhbmtzfVxuICAjXG4gICMgQW5vdGhlciBzcGVjaWFsIGNhc2U6IFdoZW4gdXNpbmcgdGhlIFwid1wiIG1vdGlvbiBpbiBjb21iaW5hdGlvbiB3aXRoIGFuXG4gICMgb3BlcmF0b3IgYW5kIHRoZSBsYXN0IHdvcmQgbW92ZWQgb3ZlciBpcyBhdCB0aGUgZW5kIG9mIGEgbGluZSwgdGhlIGVuZCBvZlxuICAjIHRoYXQgd29yZCBiZWNvbWVzIHRoZSBlbmQgb2YgdGhlIG9wZXJhdGVkIHRleHQsIG5vdCB0aGUgZmlyc3Qgd29yZCBpbiB0aGVcbiAgIyBuZXh0IGxpbmUuXG4gIG1vdmVDdXJzb3I6IChjdXJzb3IpIC0+XG4gICAgY3Vyc29yUG9zaXRpb24gPSBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuICAgIHJldHVybiBpZiBwb2ludElzQXRWaW1FbmRPZkZpbGUoQGVkaXRvciwgY3Vyc29yUG9zaXRpb24pXG4gICAgd2FzT25XaGl0ZVNwYWNlID0gcG9pbnRJc09uV2hpdGVTcGFjZShAZWRpdG9yLCBjdXJzb3JQb3NpdGlvbilcblxuICAgIGlzQXNUYXJnZXRFeGNlcHRTZWxlY3QgPSBAaXNBc1RhcmdldEV4Y2VwdFNlbGVjdCgpXG4gICAgQG1vdmVDdXJzb3JDb3VudFRpbWVzIGN1cnNvciwgKHtpc0ZpbmFsfSkgPT5cbiAgICAgIGN1cnNvclBvc2l0aW9uID0gY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKClcbiAgICAgIGlmIGlzRW1wdHlSb3coQGVkaXRvciwgY3Vyc29yUG9zaXRpb24ucm93KSBhbmQgaXNBc1RhcmdldEV4Y2VwdFNlbGVjdFxuICAgICAgICBwb2ludCA9IGN1cnNvclBvc2l0aW9uLnRyYXZlcnNlKFsxLCAwXSlcbiAgICAgIGVsc2VcbiAgICAgICAgcGF0dGVybiA9IEB3b3JkUmVnZXggPyBjdXJzb3Iud29yZFJlZ0V4cCgpXG4gICAgICAgIHBvaW50ID0gQGdldFBvaW50KHBhdHRlcm4sIGN1cnNvclBvc2l0aW9uKVxuICAgICAgICBpZiBpc0ZpbmFsIGFuZCBpc0FzVGFyZ2V0RXhjZXB0U2VsZWN0XG4gICAgICAgICAgaWYgQG9wZXJhdG9yLmlzKCdDaGFuZ2UnKSBhbmQgKG5vdCB3YXNPbldoaXRlU3BhY2UpXG4gICAgICAgICAgICBwb2ludCA9IGN1cnNvci5nZXRFbmRPZkN1cnJlbnRXb3JkQnVmZmVyUG9zaXRpb24oe0B3b3JkUmVnZXh9KVxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIHBvaW50ID0gUG9pbnQubWluKHBvaW50LCBnZXRFbmRPZkxpbmVGb3JCdWZmZXJSb3coQGVkaXRvciwgY3Vyc29yUG9zaXRpb24ucm93KSlcbiAgICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihwb2ludClcblxuIyBiXG5jbGFzcyBNb3ZlVG9QcmV2aW91c1dvcmQgZXh0ZW5kcyBNb3Rpb25cbiAgQGV4dGVuZCgpXG4gIHdvcmRSZWdleDogbnVsbFxuXG4gIG1vdmVDdXJzb3I6IChjdXJzb3IpIC0+XG4gICAgQG1vdmVDdXJzb3JDb3VudFRpbWVzIGN1cnNvciwgPT5cbiAgICAgIHBvaW50ID0gY3Vyc29yLmdldEJlZ2lubmluZ09mQ3VycmVudFdvcmRCdWZmZXJQb3NpdGlvbih7QHdvcmRSZWdleH0pXG4gICAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24ocG9pbnQpXG5cbmNsYXNzIE1vdmVUb0VuZE9mV29yZCBleHRlbmRzIE1vdGlvblxuICBAZXh0ZW5kKClcbiAgd29yZFJlZ2V4OiBudWxsXG4gIGluY2x1c2l2ZTogdHJ1ZVxuXG4gIG1vdmVUb05leHRFbmRPZldvcmQ6IChjdXJzb3IpIC0+XG4gICAgbW92ZUN1cnNvclRvTmV4dE5vbldoaXRlc3BhY2UoY3Vyc29yKVxuICAgIHBvaW50ID0gY3Vyc29yLmdldEVuZE9mQ3VycmVudFdvcmRCdWZmZXJQb3NpdGlvbih7QHdvcmRSZWdleH0pLnRyYW5zbGF0ZShbMCwgLTFdKVxuICAgIHBvaW50ID0gUG9pbnQubWluKHBvaW50LCBAZ2V0VmltRW9mQnVmZmVyUG9zaXRpb24oKSlcbiAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24ocG9pbnQpXG5cbiAgbW92ZUN1cnNvcjogKGN1cnNvcikgLT5cbiAgICBAbW92ZUN1cnNvckNvdW50VGltZXMgY3Vyc29yLCA9PlxuICAgICAgb3JpZ2luYWxQb2ludCA9IGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXG4gICAgICBAbW92ZVRvTmV4dEVuZE9mV29yZChjdXJzb3IpXG4gICAgICBpZiBvcmlnaW5hbFBvaW50LmlzRXF1YWwoY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKCkpXG4gICAgICAgICMgUmV0cnkgZnJvbSByaWdodCBjb2x1bW4gaWYgY3Vyc29yIHdhcyBhbHJlYWR5IG9uIEVuZE9mV29yZFxuICAgICAgICBjdXJzb3IubW92ZVJpZ2h0KClcbiAgICAgICAgQG1vdmVUb05leHRFbmRPZldvcmQoY3Vyc29yKVxuXG4jIFtUT0RPOiBJbXByb3ZlLCBhY2N1cmFjeV1cbmNsYXNzIE1vdmVUb1ByZXZpb3VzRW5kT2ZXb3JkIGV4dGVuZHMgTW92ZVRvUHJldmlvdXNXb3JkXG4gIEBleHRlbmQoKVxuICBpbmNsdXNpdmU6IHRydWVcblxuICBtb3ZlQ3Vyc29yOiAoY3Vyc29yKSAtPlxuICAgIHRpbWVzID0gQGdldENvdW50KClcbiAgICB3b3JkUmFuZ2UgPSBjdXJzb3IuZ2V0Q3VycmVudFdvcmRCdWZmZXJSYW5nZSgpXG4gICAgY3Vyc29yUG9zaXRpb24gPSBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuXG4gICAgIyBpZiB3ZSdyZSBpbiB0aGUgbWlkZGxlIG9mIGEgd29yZCB0aGVuIHdlIG5lZWQgdG8gbW92ZSB0byBpdHMgc3RhcnRcbiAgICBpZiBjdXJzb3JQb3NpdGlvbi5pc0dyZWF0ZXJUaGFuKHdvcmRSYW5nZS5zdGFydCkgYW5kIGN1cnNvclBvc2l0aW9uLmlzTGVzc1RoYW4od29yZFJhbmdlLmVuZClcbiAgICAgIHRpbWVzICs9IDFcblxuICAgIGZvciBbMS4udGltZXNdXG4gICAgICBwb2ludCA9IGN1cnNvci5nZXRCZWdpbm5pbmdPZkN1cnJlbnRXb3JkQnVmZmVyUG9zaXRpb24oe0B3b3JkUmVnZXh9KVxuICAgICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHBvaW50KVxuXG4gICAgQG1vdmVUb05leHRFbmRPZldvcmQoY3Vyc29yKVxuICAgIGlmIGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpLmlzR3JlYXRlclRoYW5PckVxdWFsKGN1cnNvclBvc2l0aW9uKVxuICAgICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKFswLCAwXSlcblxuICBtb3ZlVG9OZXh0RW5kT2ZXb3JkOiAoY3Vyc29yKSAtPlxuICAgIHBvaW50ID0gY3Vyc29yLmdldEVuZE9mQ3VycmVudFdvcmRCdWZmZXJQb3NpdGlvbih7QHdvcmRSZWdleH0pLnRyYW5zbGF0ZShbMCwgLTFdKVxuICAgIHBvaW50ID0gUG9pbnQubWluKHBvaW50LCBAZ2V0VmltRW9mQnVmZmVyUG9zaXRpb24oKSlcbiAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24ocG9pbnQpXG5cbiMgV2hvbGUgd29yZFxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBNb3ZlVG9OZXh0V2hvbGVXb3JkIGV4dGVuZHMgTW92ZVRvTmV4dFdvcmRcbiAgQGV4dGVuZCgpXG4gIHdvcmRSZWdleDogL14kfFxcUysvZ1xuXG5jbGFzcyBNb3ZlVG9QcmV2aW91c1dob2xlV29yZCBleHRlbmRzIE1vdmVUb1ByZXZpb3VzV29yZFxuICBAZXh0ZW5kKClcbiAgd29yZFJlZ2V4OiAvXiR8XFxTKy9nXG5cbmNsYXNzIE1vdmVUb0VuZE9mV2hvbGVXb3JkIGV4dGVuZHMgTW92ZVRvRW5kT2ZXb3JkXG4gIEBleHRlbmQoKVxuICB3b3JkUmVnZXg6IC9cXFMrL1xuXG4jIFtUT0RPOiBJbXByb3ZlLCBhY2N1cmFjeV1cbmNsYXNzIE1vdmVUb1ByZXZpb3VzRW5kT2ZXaG9sZVdvcmQgZXh0ZW5kcyBNb3ZlVG9QcmV2aW91c0VuZE9mV29yZFxuICBAZXh0ZW5kKClcbiAgd29yZFJlZ2V4OiAvXFxTKy9cblxuIyBBbHBoYW51bWVyaWMgd29yZCBbRXhwZXJpbWVudGFsXVxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBNb3ZlVG9OZXh0QWxwaGFudW1lcmljV29yZCBleHRlbmRzIE1vdmVUb05leHRXb3JkXG4gIEBleHRlbmQoKVxuICBAZGVzY3JpcHRpb246IFwiTW92ZSB0byBuZXh0IGFscGhhbnVtZXJpYyhgL1xcdysvYCkgd29yZFwiXG4gIHdvcmRSZWdleDogL1xcdysvZ1xuXG5jbGFzcyBNb3ZlVG9QcmV2aW91c0FscGhhbnVtZXJpY1dvcmQgZXh0ZW5kcyBNb3ZlVG9QcmV2aW91c1dvcmRcbiAgQGV4dGVuZCgpXG4gIEBkZXNjcmlwdGlvbjogXCJNb3ZlIHRvIHByZXZpb3VzIGFscGhhbnVtZXJpYyhgL1xcdysvYCkgd29yZFwiXG4gIHdvcmRSZWdleDogL1xcdysvXG5cbmNsYXNzIE1vdmVUb0VuZE9mQWxwaGFudW1lcmljV29yZCBleHRlbmRzIE1vdmVUb0VuZE9mV29yZFxuICBAZXh0ZW5kKClcbiAgQGRlc2NyaXB0aW9uOiBcIk1vdmUgdG8gZW5kIG9mIGFscGhhbnVtZXJpYyhgL1xcdysvYCkgd29yZFwiXG4gIHdvcmRSZWdleDogL1xcdysvXG5cbiMgQWxwaGFudW1lcmljIHdvcmQgW0V4cGVyaW1lbnRhbF1cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgTW92ZVRvTmV4dFNtYXJ0V29yZCBleHRlbmRzIE1vdmVUb05leHRXb3JkXG4gIEBleHRlbmQoKVxuICBAZGVzY3JpcHRpb246IFwiTW92ZSB0byBuZXh0IHNtYXJ0IHdvcmQgKGAvW1xcdy1dKy9gKSB3b3JkXCJcbiAgd29yZFJlZ2V4OiAvW1xcdy1dKy9nXG5cbmNsYXNzIE1vdmVUb1ByZXZpb3VzU21hcnRXb3JkIGV4dGVuZHMgTW92ZVRvUHJldmlvdXNXb3JkXG4gIEBleHRlbmQoKVxuICBAZGVzY3JpcHRpb246IFwiTW92ZSB0byBwcmV2aW91cyBzbWFydCB3b3JkIChgL1tcXHctXSsvYCkgd29yZFwiXG4gIHdvcmRSZWdleDogL1tcXHctXSsvXG5cbmNsYXNzIE1vdmVUb0VuZE9mU21hcnRXb3JkIGV4dGVuZHMgTW92ZVRvRW5kT2ZXb3JkXG4gIEBleHRlbmQoKVxuICBAZGVzY3JpcHRpb246IFwiTW92ZSB0byBlbmQgb2Ygc21hcnQgd29yZCAoYC9bXFx3LV0rL2ApIHdvcmRcIlxuICB3b3JkUmVnZXg6IC9bXFx3LV0rL1xuXG4jIFN1YndvcmRcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgTW92ZVRvTmV4dFN1YndvcmQgZXh0ZW5kcyBNb3ZlVG9OZXh0V29yZFxuICBAZXh0ZW5kKClcbiAgbW92ZUN1cnNvcjogKGN1cnNvcikgLT5cbiAgICBAd29yZFJlZ2V4ID0gY3Vyc29yLnN1YndvcmRSZWdFeHAoKVxuICAgIHN1cGVyXG5cbmNsYXNzIE1vdmVUb1ByZXZpb3VzU3Vid29yZCBleHRlbmRzIE1vdmVUb1ByZXZpb3VzV29yZFxuICBAZXh0ZW5kKClcbiAgbW92ZUN1cnNvcjogKGN1cnNvcikgLT5cbiAgICBAd29yZFJlZ2V4ID0gY3Vyc29yLnN1YndvcmRSZWdFeHAoKVxuICAgIHN1cGVyXG5cbmNsYXNzIE1vdmVUb0VuZE9mU3Vid29yZCBleHRlbmRzIE1vdmVUb0VuZE9mV29yZFxuICBAZXh0ZW5kKClcbiAgbW92ZUN1cnNvcjogKGN1cnNvcikgLT5cbiAgICBAd29yZFJlZ2V4ID0gY3Vyc29yLnN1YndvcmRSZWdFeHAoKVxuICAgIHN1cGVyXG5cbiMgU2VudGVuY2VcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBTZW50ZW5jZSBpcyBkZWZpbmVkIGFzIGJlbG93XG4jICAtIGVuZCB3aXRoIFsnLicsICchJywgJz8nXVxuIyAgLSBvcHRpb25hbGx5IGZvbGxvd2VkIGJ5IFsnKScsICddJywgJ1wiJywgXCInXCJdXG4jICAtIGZvbGxvd2VkIGJ5IFsnJCcsICcgJywgJ1xcdCddXG4jICAtIHBhcmFncmFwaCBib3VuZGFyeSBpcyBhbHNvIHNlbnRlbmNlIGJvdW5kYXJ5XG4jICAtIHNlY3Rpb24gYm91bmRhcnkgaXMgYWxzbyBzZW50ZW5jZSBib3VuZGFyeShpZ25vcmUpXG5jbGFzcyBNb3ZlVG9OZXh0U2VudGVuY2UgZXh0ZW5kcyBNb3Rpb25cbiAgQGV4dGVuZCgpXG4gIGp1bXA6IHRydWVcbiAgc2VudGVuY2VSZWdleDogLy8vKD86W1xcLiFcXD9dW1xcKVxcXVwiJ10qXFxzKyl8KFxcbnxcXHJcXG4pLy8vZ1xuICBkaXJlY3Rpb246ICduZXh0J1xuXG4gIG1vdmVDdXJzb3I6IChjdXJzb3IpIC0+XG4gICAgQG1vdmVDdXJzb3JDb3VudFRpbWVzIGN1cnNvciwgPT5cbiAgICAgIEBzZXRCdWZmZXJQb3NpdGlvblNhZmVseShjdXJzb3IsIEBnZXRQb2ludChjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKSkpXG5cbiAgZ2V0UG9pbnQ6IChmcm9tUG9pbnQpIC0+XG4gICAgaWYgQGRpcmVjdGlvbiBpcyAnbmV4dCdcbiAgICAgIEBnZXROZXh0U3RhcnRPZlNlbnRlbmNlKGZyb21Qb2ludClcbiAgICBlbHNlIGlmIEBkaXJlY3Rpb24gaXMgJ3ByZXZpb3VzJ1xuICAgICAgQGdldFByZXZpb3VzU3RhcnRPZlNlbnRlbmNlKGZyb21Qb2ludClcblxuICBpc0JsYW5rUm93OiAocm93KSAtPlxuICAgIEBlZGl0b3IuaXNCdWZmZXJSb3dCbGFuayhyb3cpXG5cbiAgZ2V0TmV4dFN0YXJ0T2ZTZW50ZW5jZTogKGZyb20pIC0+XG4gICAgZm91bmRQb2ludCA9IG51bGxcbiAgICBAc2NhbkZvcndhcmQgQHNlbnRlbmNlUmVnZXgsIHtmcm9tfSwgKHtyYW5nZSwgbWF0Y2hUZXh0LCBtYXRjaCwgc3RvcH0pID0+XG4gICAgICBpZiBtYXRjaFsxXT9cbiAgICAgICAgW3N0YXJ0Um93LCBlbmRSb3ddID0gW3JhbmdlLnN0YXJ0LnJvdywgcmFuZ2UuZW5kLnJvd11cbiAgICAgICAgcmV0dXJuIGlmIEBza2lwQmxhbmtSb3cgYW5kIEBpc0JsYW5rUm93KGVuZFJvdylcbiAgICAgICAgaWYgQGlzQmxhbmtSb3coc3RhcnRSb3cpIGlzbnQgQGlzQmxhbmtSb3coZW5kUm93KVxuICAgICAgICAgIGZvdW5kUG9pbnQgPSBAZ2V0Rmlyc3RDaGFyYWN0ZXJQb3NpdGlvbkZvckJ1ZmZlclJvdyhlbmRSb3cpXG4gICAgICBlbHNlXG4gICAgICAgIGZvdW5kUG9pbnQgPSByYW5nZS5lbmRcbiAgICAgIHN0b3AoKSBpZiBmb3VuZFBvaW50P1xuICAgIGZvdW5kUG9pbnQgPyBAZ2V0VmltRW9mQnVmZmVyUG9zaXRpb24oKVxuXG4gIGdldFByZXZpb3VzU3RhcnRPZlNlbnRlbmNlOiAoZnJvbSkgLT5cbiAgICBmb3VuZFBvaW50ID0gbnVsbFxuICAgIEBzY2FuQmFja3dhcmQgQHNlbnRlbmNlUmVnZXgsIHtmcm9tfSwgKHtyYW5nZSwgbWF0Y2gsIHN0b3AsIG1hdGNoVGV4dH0pID0+XG4gICAgICBpZiBtYXRjaFsxXT9cbiAgICAgICAgW3N0YXJ0Um93LCBlbmRSb3ddID0gW3JhbmdlLnN0YXJ0LnJvdywgcmFuZ2UuZW5kLnJvd11cbiAgICAgICAgaWYgbm90IEBpc0JsYW5rUm93KGVuZFJvdykgYW5kIEBpc0JsYW5rUm93KHN0YXJ0Um93KVxuICAgICAgICAgIHBvaW50ID0gQGdldEZpcnN0Q2hhcmFjdGVyUG9zaXRpb25Gb3JCdWZmZXJSb3coZW5kUm93KVxuICAgICAgICAgIGlmIHBvaW50LmlzTGVzc1RoYW4oZnJvbSlcbiAgICAgICAgICAgIGZvdW5kUG9pbnQgPSBwb2ludFxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJldHVybiBpZiBAc2tpcEJsYW5rUm93XG4gICAgICAgICAgICBmb3VuZFBvaW50ID0gQGdldEZpcnN0Q2hhcmFjdGVyUG9zaXRpb25Gb3JCdWZmZXJSb3coc3RhcnRSb3cpXG4gICAgICBlbHNlXG4gICAgICAgIGlmIHJhbmdlLmVuZC5pc0xlc3NUaGFuKGZyb20pXG4gICAgICAgICAgZm91bmRQb2ludCA9IHJhbmdlLmVuZFxuICAgICAgc3RvcCgpIGlmIGZvdW5kUG9pbnQ/XG4gICAgZm91bmRQb2ludCA/IFswLCAwXVxuXG5jbGFzcyBNb3ZlVG9QcmV2aW91c1NlbnRlbmNlIGV4dGVuZHMgTW92ZVRvTmV4dFNlbnRlbmNlXG4gIEBleHRlbmQoKVxuICBkaXJlY3Rpb246ICdwcmV2aW91cydcblxuY2xhc3MgTW92ZVRvTmV4dFNlbnRlbmNlU2tpcEJsYW5rUm93IGV4dGVuZHMgTW92ZVRvTmV4dFNlbnRlbmNlXG4gIEBleHRlbmQoKVxuICBza2lwQmxhbmtSb3c6IHRydWVcblxuY2xhc3MgTW92ZVRvUHJldmlvdXNTZW50ZW5jZVNraXBCbGFua1JvdyBleHRlbmRzIE1vdmVUb1ByZXZpb3VzU2VudGVuY2VcbiAgQGV4dGVuZCgpXG4gIHNraXBCbGFua1JvdzogdHJ1ZVxuXG4jIFBhcmFncmFwaFxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBNb3ZlVG9OZXh0UGFyYWdyYXBoIGV4dGVuZHMgTW90aW9uXG4gIEBleHRlbmQoKVxuICBqdW1wOiB0cnVlXG4gIGRpcmVjdGlvbjogJ25leHQnXG5cbiAgbW92ZUN1cnNvcjogKGN1cnNvcikgLT5cbiAgICBAbW92ZUN1cnNvckNvdW50VGltZXMgY3Vyc29yLCA9PlxuICAgICAgQHNldEJ1ZmZlclBvc2l0aW9uU2FmZWx5KGN1cnNvciwgQGdldFBvaW50KGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpKSlcblxuICBnZXRQb2ludDogKGZyb21Qb2ludCkgLT5cbiAgICBzdGFydFJvdyA9IGZyb21Qb2ludC5yb3dcbiAgICB3YXNBdE5vbkJsYW5rUm93ID0gbm90IEBlZGl0b3IuaXNCdWZmZXJSb3dCbGFuayhzdGFydFJvdylcbiAgICBmb3Igcm93IGluIGdldEJ1ZmZlclJvd3MoQGVkaXRvciwge3N0YXJ0Um93LCBAZGlyZWN0aW9ufSlcbiAgICAgIGlmIEBlZGl0b3IuaXNCdWZmZXJSb3dCbGFuayhyb3cpXG4gICAgICAgIHJldHVybiBuZXcgUG9pbnQocm93LCAwKSBpZiB3YXNBdE5vbkJsYW5rUm93XG4gICAgICBlbHNlXG4gICAgICAgIHdhc0F0Tm9uQmxhbmtSb3cgPSB0cnVlXG5cbiAgICAjIGZhbGxiYWNrXG4gICAgc3dpdGNoIEBkaXJlY3Rpb25cbiAgICAgIHdoZW4gJ3ByZXZpb3VzJyB0aGVuIG5ldyBQb2ludCgwLCAwKVxuICAgICAgd2hlbiAnbmV4dCcgdGhlbiBAZ2V0VmltRW9mQnVmZmVyUG9zaXRpb24oKVxuXG5jbGFzcyBNb3ZlVG9QcmV2aW91c1BhcmFncmFwaCBleHRlbmRzIE1vdmVUb05leHRQYXJhZ3JhcGhcbiAgQGV4dGVuZCgpXG4gIGRpcmVjdGlvbjogJ3ByZXZpb3VzJ1xuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMga2V5bWFwOiAwXG5jbGFzcyBNb3ZlVG9CZWdpbm5pbmdPZkxpbmUgZXh0ZW5kcyBNb3Rpb25cbiAgQGV4dGVuZCgpXG5cbiAgbW92ZUN1cnNvcjogKGN1cnNvcikgLT5cbiAgICBzZXRCdWZmZXJDb2x1bW4oY3Vyc29yLCAwKVxuXG5jbGFzcyBNb3ZlVG9Db2x1bW4gZXh0ZW5kcyBNb3Rpb25cbiAgQGV4dGVuZCgpXG5cbiAgbW92ZUN1cnNvcjogKGN1cnNvcikgLT5cbiAgICBzZXRCdWZmZXJDb2x1bW4oY3Vyc29yLCBAZ2V0Q291bnQoLTEpKVxuXG5jbGFzcyBNb3ZlVG9MYXN0Q2hhcmFjdGVyT2ZMaW5lIGV4dGVuZHMgTW90aW9uXG4gIEBleHRlbmQoKVxuXG4gIG1vdmVDdXJzb3I6IChjdXJzb3IpIC0+XG4gICAgcm93ID0gZ2V0VmFsaWRWaW1CdWZmZXJSb3coQGVkaXRvciwgY3Vyc29yLmdldEJ1ZmZlclJvdygpICsgQGdldENvdW50KC0xKSlcbiAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24oW3JvdywgSW5maW5pdHldKVxuICAgIGN1cnNvci5nb2FsQ29sdW1uID0gSW5maW5pdHlcblxuY2xhc3MgTW92ZVRvTGFzdE5vbmJsYW5rQ2hhcmFjdGVyT2ZMaW5lQW5kRG93biBleHRlbmRzIE1vdGlvblxuICBAZXh0ZW5kKClcbiAgaW5jbHVzaXZlOiB0cnVlXG5cbiAgbW92ZUN1cnNvcjogKGN1cnNvcikgLT5cbiAgICBwb2ludCA9IEBnZXRQb2ludChjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKSlcbiAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24ocG9pbnQpXG5cbiAgZ2V0UG9pbnQ6ICh7cm93fSkgLT5cbiAgICByb3cgPSBsaW1pdE51bWJlcihyb3cgKyBAZ2V0Q291bnQoLTEpLCBtYXg6IEBnZXRWaW1MYXN0QnVmZmVyUm93KCkpXG4gICAgcmFuZ2UgPSBmaW5kUmFuZ2VJbkJ1ZmZlclJvdyhAZWRpdG9yLCAvXFxTfF4vLCByb3csIGRpcmVjdGlvbjogJ2JhY2t3YXJkJylcbiAgICByYW5nZT8uc3RhcnQgPyBuZXcgUG9pbnQocm93LCAwKVxuXG4jIE1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lIGZhaW1pbHlcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIF5cbmNsYXNzIE1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lIGV4dGVuZHMgTW90aW9uXG4gIEBleHRlbmQoKVxuICBtb3ZlQ3Vyc29yOiAoY3Vyc29yKSAtPlxuICAgIHBvaW50ID0gQGdldEZpcnN0Q2hhcmFjdGVyUG9zaXRpb25Gb3JCdWZmZXJSb3coY3Vyc29yLmdldEJ1ZmZlclJvdygpKVxuICAgIEBzZXRCdWZmZXJQb3NpdGlvblNhZmVseShjdXJzb3IsIHBvaW50KVxuXG5jbGFzcyBNb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZVVwIGV4dGVuZHMgTW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmVcbiAgQGV4dGVuZCgpXG4gIHdpc2U6ICdsaW5ld2lzZSdcbiAgbW92ZUN1cnNvcjogKGN1cnNvcikgLT5cbiAgICBAbW92ZUN1cnNvckNvdW50VGltZXMgY3Vyc29yLCAtPlxuICAgICAgcG9pbnQgPSBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuICAgICAgdW5sZXNzIHBvaW50LnJvdyBpcyAwXG4gICAgICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihwb2ludC50cmFuc2xhdGUoWy0xLCAwXSkpXG4gICAgc3VwZXJcblxuY2xhc3MgTW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmVEb3duIGV4dGVuZHMgTW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmVcbiAgQGV4dGVuZCgpXG4gIHdpc2U6ICdsaW5ld2lzZSdcbiAgbW92ZUN1cnNvcjogKGN1cnNvcikgLT5cbiAgICBAbW92ZUN1cnNvckNvdW50VGltZXMgY3Vyc29yLCA9PlxuICAgICAgcG9pbnQgPSBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuICAgICAgdW5sZXNzIEBnZXRWaW1MYXN0QnVmZmVyUm93KCkgaXMgcG9pbnQucm93XG4gICAgICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihwb2ludC50cmFuc2xhdGUoWysxLCAwXSkpXG4gICAgc3VwZXJcblxuY2xhc3MgTW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmVBbmREb3duIGV4dGVuZHMgTW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmVEb3duXG4gIEBleHRlbmQoKVxuICBkZWZhdWx0Q291bnQ6IDBcbiAgZ2V0Q291bnQ6IC0+IHN1cGVyIC0gMVxuXG4jIGtleW1hcDogZyBnXG5jbGFzcyBNb3ZlVG9GaXJzdExpbmUgZXh0ZW5kcyBNb3Rpb25cbiAgQGV4dGVuZCgpXG4gIHdpc2U6ICdsaW5ld2lzZSdcbiAganVtcDogdHJ1ZVxuICB2ZXJ0aWNhbE1vdGlvbjogdHJ1ZVxuICBtb3ZlU3VjY2Vzc09uTGluZXdpc2U6IHRydWVcblxuICBtb3ZlQ3Vyc29yOiAoY3Vyc29yKSAtPlxuICAgIEBzZXRDdXJzb3JCdWZmZXJSb3coY3Vyc29yLCBnZXRWYWxpZFZpbUJ1ZmZlclJvdyhAZWRpdG9yLCBAZ2V0Um93KCkpKVxuICAgIGN1cnNvci5hdXRvc2Nyb2xsKGNlbnRlcjogdHJ1ZSlcblxuICBnZXRSb3c6IC0+XG4gICAgQGdldENvdW50KC0xKVxuXG5jbGFzcyBNb3ZlVG9TY3JlZW5Db2x1bW4gZXh0ZW5kcyBNb3Rpb25cbiAgQGV4dGVuZChmYWxzZSlcbiAgbW92ZUN1cnNvcjogKGN1cnNvcikgLT5cbiAgICBhbGxvd09mZlNjcmVlblBvc2l0aW9uID0gQGdldENvbmZpZyhcImFsbG93TW92ZVRvT2ZmU2NyZWVuQ29sdW1uT25TY3JlZW5MaW5lTW90aW9uXCIpXG4gICAgcG9pbnQgPSBAdmltU3RhdGUudXRpbHMuZ2V0U2NyZWVuUG9zaXRpb25Gb3JTY3JlZW5Sb3coQGVkaXRvciwgY3Vyc29yLmdldFNjcmVlblJvdygpLCBAd2hpY2gsIHthbGxvd09mZlNjcmVlblBvc2l0aW9ufSlcbiAgICBAc2V0U2NyZWVuUG9zaXRpb25TYWZlbHkoY3Vyc29yLCBwb2ludClcblxuIyBrZXltYXA6IGcgMFxuY2xhc3MgTW92ZVRvQmVnaW5uaW5nT2ZTY3JlZW5MaW5lIGV4dGVuZHMgTW92ZVRvU2NyZWVuQ29sdW1uXG4gIEBleHRlbmQoKVxuICB3aGljaDogXCJiZWdpbm5pbmdcIlxuXG4jIGcgXjogYG1vdmUtdG8tZmlyc3QtY2hhcmFjdGVyLW9mLXNjcmVlbi1saW5lYFxuY2xhc3MgTW92ZVRvRmlyc3RDaGFyYWN0ZXJPZlNjcmVlbkxpbmUgZXh0ZW5kcyBNb3ZlVG9TY3JlZW5Db2x1bW5cbiAgQGV4dGVuZCgpXG4gIHdoaWNoOiBcImZpcnN0LWNoYXJhY3RlclwiXG5cbiMga2V5bWFwOiBnICRcbmNsYXNzIE1vdmVUb0xhc3RDaGFyYWN0ZXJPZlNjcmVlbkxpbmUgZXh0ZW5kcyBNb3ZlVG9TY3JlZW5Db2x1bW5cbiAgQGV4dGVuZCgpXG4gIHdoaWNoOiBcImxhc3QtY2hhcmFjdGVyXCJcblxuIyBrZXltYXA6IEdcbmNsYXNzIE1vdmVUb0xhc3RMaW5lIGV4dGVuZHMgTW92ZVRvRmlyc3RMaW5lXG4gIEBleHRlbmQoKVxuICBkZWZhdWx0Q291bnQ6IEluZmluaXR5XG5cbiMga2V5bWFwOiBOJSBlLmcuIDEwJVxuY2xhc3MgTW92ZVRvTGluZUJ5UGVyY2VudCBleHRlbmRzIE1vdmVUb0ZpcnN0TGluZVxuICBAZXh0ZW5kKClcblxuICBnZXRSb3c6IC0+XG4gICAgcGVyY2VudCA9IGxpbWl0TnVtYmVyKEBnZXRDb3VudCgpLCBtYXg6IDEwMClcbiAgICBNYXRoLmZsb29yKChAZWRpdG9yLmdldExpbmVDb3VudCgpIC0gMSkgKiAocGVyY2VudCAvIDEwMCkpXG5cbmNsYXNzIE1vdmVUb1JlbGF0aXZlTGluZSBleHRlbmRzIE1vdGlvblxuICBAZXh0ZW5kKGZhbHNlKVxuICB3aXNlOiAnbGluZXdpc2UnXG4gIG1vdmVTdWNjZXNzT25MaW5ld2lzZTogdHJ1ZVxuXG4gIG1vdmVDdXJzb3I6IChjdXJzb3IpIC0+XG4gICAgcm93ID0gQGdldEZvbGRFbmRSb3dGb3JSb3coY3Vyc29yLmdldEJ1ZmZlclJvdygpKVxuXG4gICAgY291bnQgPSBAZ2V0Q291bnQoLTEpXG4gICAgd2hpbGUgKGNvdW50ID4gMClcbiAgICAgIHJvdyA9IEBnZXRGb2xkRW5kUm93Rm9yUm93KHJvdyArIDEpXG4gICAgICBjb3VudC0tXG5cbiAgICBzZXRCdWZmZXJSb3coY3Vyc29yLCByb3cpXG5cbmNsYXNzIE1vdmVUb1JlbGF0aXZlTGluZU1pbmltdW1PbmUgZXh0ZW5kcyBNb3ZlVG9SZWxhdGl2ZUxpbmVcbiAgQGV4dGVuZChmYWxzZSlcblxuICBnZXRDb3VudDogLT5cbiAgICBsaW1pdE51bWJlcihzdXBlciwgbWluOiAxKVxuXG4jIFBvc2l0aW9uIGN1cnNvciB3aXRob3V0IHNjcm9sbGluZy4sIEgsIE0sIExcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBrZXltYXA6IEhcbmNsYXNzIE1vdmVUb1RvcE9mU2NyZWVuIGV4dGVuZHMgTW90aW9uXG4gIEBleHRlbmQoKVxuICB3aXNlOiAnbGluZXdpc2UnXG4gIGp1bXA6IHRydWVcbiAgc2Nyb2xsb2ZmOiAyXG4gIGRlZmF1bHRDb3VudDogMFxuICB2ZXJ0aWNhbE1vdGlvbjogdHJ1ZVxuXG4gIG1vdmVDdXJzb3I6IChjdXJzb3IpIC0+XG4gICAgYnVmZmVyUm93ID0gQGVkaXRvci5idWZmZXJSb3dGb3JTY3JlZW5Sb3coQGdldFNjcmVlblJvdygpKVxuICAgIEBzZXRDdXJzb3JCdWZmZXJSb3coY3Vyc29yLCBidWZmZXJSb3cpXG5cbiAgZ2V0U2Nyb2xsb2ZmOiAtPlxuICAgIGlmIEBpc0FzVGFyZ2V0RXhjZXB0U2VsZWN0KClcbiAgICAgIDBcbiAgICBlbHNlXG4gICAgICBAc2Nyb2xsb2ZmXG5cbiAgZ2V0U2NyZWVuUm93OiAtPlxuICAgIGZpcnN0Um93ID0gZ2V0Rmlyc3RWaXNpYmxlU2NyZWVuUm93KEBlZGl0b3IpXG4gICAgb2Zmc2V0ID0gQGdldFNjcm9sbG9mZigpXG4gICAgb2Zmc2V0ID0gMCBpZiBmaXJzdFJvdyBpcyAwXG4gICAgb2Zmc2V0ID0gbGltaXROdW1iZXIoQGdldENvdW50KC0xKSwgbWluOiBvZmZzZXQpXG4gICAgZmlyc3RSb3cgKyBvZmZzZXRcblxuIyBrZXltYXA6IE1cbmNsYXNzIE1vdmVUb01pZGRsZU9mU2NyZWVuIGV4dGVuZHMgTW92ZVRvVG9wT2ZTY3JlZW5cbiAgQGV4dGVuZCgpXG4gIGdldFNjcmVlblJvdzogLT5cbiAgICBzdGFydFJvdyA9IGdldEZpcnN0VmlzaWJsZVNjcmVlblJvdyhAZWRpdG9yKVxuICAgIGVuZFJvdyA9IGxpbWl0TnVtYmVyKEBlZGl0b3IuZ2V0TGFzdFZpc2libGVTY3JlZW5Sb3coKSwgbWF4OiBAZ2V0VmltTGFzdFNjcmVlblJvdygpKVxuICAgIHN0YXJ0Um93ICsgTWF0aC5mbG9vcigoZW5kUm93IC0gc3RhcnRSb3cpIC8gMilcblxuIyBrZXltYXA6IExcbmNsYXNzIE1vdmVUb0JvdHRvbU9mU2NyZWVuIGV4dGVuZHMgTW92ZVRvVG9wT2ZTY3JlZW5cbiAgQGV4dGVuZCgpXG4gIGdldFNjcmVlblJvdzogLT5cbiAgICAjIFtGSVhNRV1cbiAgICAjIEF0IGxlYXN0IEF0b20gdjEuNi4wLCB0aGVyZSBhcmUgdHdvIGltcGxlbWVudGF0aW9uIG9mIGdldExhc3RWaXNpYmxlU2NyZWVuUm93KClcbiAgICAjIGVkaXRvci5nZXRMYXN0VmlzaWJsZVNjcmVlblJvdygpIGFuZCBlZGl0b3JFbGVtZW50LmdldExhc3RWaXNpYmxlU2NyZWVuUm93KClcbiAgICAjIFRob3NlIHR3byBtZXRob2RzIHJldHVybiBkaWZmZXJlbnQgdmFsdWUsIGVkaXRvcidzIG9uZSBpcyBjb3JyZW50LlxuICAgICMgU28gSSBpbnRlbnRpb25hbGx5IHVzZSBlZGl0b3IuZ2V0TGFzdFNjcmVlblJvdyBoZXJlLlxuICAgIHZpbUxhc3RTY3JlZW5Sb3cgPSBAZ2V0VmltTGFzdFNjcmVlblJvdygpXG4gICAgcm93ID0gbGltaXROdW1iZXIoQGVkaXRvci5nZXRMYXN0VmlzaWJsZVNjcmVlblJvdygpLCBtYXg6IHZpbUxhc3RTY3JlZW5Sb3cpXG4gICAgb2Zmc2V0ID0gQGdldFNjcm9sbG9mZigpICsgMVxuICAgIG9mZnNldCA9IDAgaWYgcm93IGlzIHZpbUxhc3RTY3JlZW5Sb3dcbiAgICBvZmZzZXQgPSBsaW1pdE51bWJlcihAZ2V0Q291bnQoLTEpLCBtaW46IG9mZnNldClcbiAgICByb3cgLSBvZmZzZXRcblxuIyBTY3JvbGxpbmdcbiMgSGFsZjogY3RybC1kLCBjdHJsLXVcbiMgRnVsbDogY3RybC1mLCBjdHJsLWJcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBbRklYTUVdIGNvdW50IGJlaGF2ZSBkaWZmZXJlbnRseSBmcm9tIG9yaWdpbmFsIFZpbS5cbmNsYXNzIFNjcm9sbCBleHRlbmRzIE1vdGlvblxuICBAZXh0ZW5kKGZhbHNlKVxuICB2ZXJ0aWNhbE1vdGlvbjogdHJ1ZVxuXG4gIGlzU21vb3RoU2Nyb2xsRW5hYmxlZDogLT5cbiAgICBpZiBNYXRoLmFicyhAYW1vdW50T2ZQYWdlKSBpcyAxXG4gICAgICBAZ2V0Q29uZmlnKCdzbW9vdGhTY3JvbGxPbkZ1bGxTY3JvbGxNb3Rpb24nKVxuICAgIGVsc2VcbiAgICAgIEBnZXRDb25maWcoJ3Ntb290aFNjcm9sbE9uSGFsZlNjcm9sbE1vdGlvbicpXG5cbiAgZ2V0U21vb3RoU2Nyb2xsRHVhdGlvbjogLT5cbiAgICBpZiBNYXRoLmFicyhAYW1vdW50T2ZQYWdlKSBpcyAxXG4gICAgICBAZ2V0Q29uZmlnKCdzbW9vdGhTY3JvbGxPbkZ1bGxTY3JvbGxNb3Rpb25EdXJhdGlvbicpXG4gICAgZWxzZVxuICAgICAgQGdldENvbmZpZygnc21vb3RoU2Nyb2xsT25IYWxmU2Nyb2xsTW90aW9uRHVyYXRpb24nKVxuXG4gIGdldFBpeGVsUmVjdFRvcEZvclNjZWVuUm93OiAocm93KSAtPlxuICAgIHBvaW50ID0gbmV3IFBvaW50KHJvdywgMClcbiAgICBAZWRpdG9yLmVsZW1lbnQucGl4ZWxSZWN0Rm9yU2NyZWVuUmFuZ2UobmV3IFJhbmdlKHBvaW50LCBwb2ludCkpLnRvcFxuXG4gIHNtb290aFNjcm9sbDogKGZyb21Sb3csIHRvUm93LCBkb25lKSAtPlxuICAgIHRvcFBpeGVsRnJvbSA9IHt0b3A6IEBnZXRQaXhlbFJlY3RUb3BGb3JTY2VlblJvdyhmcm9tUm93KX1cbiAgICB0b3BQaXhlbFRvID0ge3RvcDogQGdldFBpeGVsUmVjdFRvcEZvclNjZWVuUm93KHRvUm93KX1cbiAgICAjIFtOT1RFXVxuICAgICMgaW50ZW50aW9uYWxseSB1c2UgYGVsZW1lbnQuY29tcG9uZW50LnNldFNjcm9sbFRvcGAgaW5zdGVhZCBvZiBgZWxlbWVudC5zZXRTY3JvbGxUb3BgLlxuICAgICMgU0luY2UgZWxlbWVudC5zZXRTY3JvbGxUb3Agd2lsbCB0aHJvdyBleGNlcHRpb24gd2hlbiBlbGVtZW50LmNvbXBvbmVudCBubyBsb25nZXIgZXhpc3RzLlxuICAgIHN0ZXAgPSAobmV3VG9wKSA9PlxuICAgICAgaWYgQGVkaXRvci5lbGVtZW50LmNvbXBvbmVudD9cbiAgICAgICAgQGVkaXRvci5lbGVtZW50LmNvbXBvbmVudC5zZXRTY3JvbGxUb3AobmV3VG9wKVxuICAgICAgICBAZWRpdG9yLmVsZW1lbnQuY29tcG9uZW50LnVwZGF0ZVN5bmMoKVxuXG4gICAgZHVyYXRpb24gPSBAZ2V0U21vb3RoU2Nyb2xsRHVhdGlvbigpXG4gICAgQHZpbVN0YXRlLnJlcXVlc3RTY3JvbGxBbmltYXRpb24odG9wUGl4ZWxGcm9tLCB0b3BQaXhlbFRvLCB7ZHVyYXRpb24sIHN0ZXAsIGRvbmV9KVxuXG4gIGdldEFtb3VudE9mUm93czogLT5cbiAgICBNYXRoLmNlaWwoQGFtb3VudE9mUGFnZSAqIEBlZGl0b3IuZ2V0Um93c1BlclBhZ2UoKSAqIEBnZXRDb3VudCgpKVxuXG4gIGdldEJ1ZmZlclJvdzogKGN1cnNvcikgLT5cbiAgICBzY3JlZW5Sb3cgPSBnZXRWYWxpZFZpbVNjcmVlblJvdyhAZWRpdG9yLCBjdXJzb3IuZ2V0U2NyZWVuUm93KCkgKyBAZ2V0QW1vdW50T2ZSb3dzKCkpXG4gICAgQGVkaXRvci5idWZmZXJSb3dGb3JTY3JlZW5Sb3coc2NyZWVuUm93KVxuXG4gIG1vdmVDdXJzb3I6IChjdXJzb3IpIC0+XG4gICAgYnVmZmVyUm93ID0gQGdldEJ1ZmZlclJvdyhjdXJzb3IpXG4gICAgQHNldEN1cnNvckJ1ZmZlclJvdyhjdXJzb3IsIEBnZXRCdWZmZXJSb3coY3Vyc29yKSwgYXV0b3Njcm9sbDogZmFsc2UpXG5cbiAgICBpZiBjdXJzb3IuaXNMYXN0Q3Vyc29yKClcbiAgICAgIGlmIEBpc1Ntb290aFNjcm9sbEVuYWJsZWQoKVxuICAgICAgICBAdmltU3RhdGUuZmluaXNoU2Nyb2xsQW5pbWF0aW9uKClcblxuICAgICAgZmlyc3RWaXNpYmlsZVNjcmVlblJvdyA9IEBlZGl0b3IuZ2V0Rmlyc3RWaXNpYmxlU2NyZWVuUm93KClcbiAgICAgIG5ld0ZpcnN0VmlzaWJpbGVCdWZmZXJSb3cgPSBAZWRpdG9yLmJ1ZmZlclJvd0ZvclNjcmVlblJvdyhmaXJzdFZpc2liaWxlU2NyZWVuUm93ICsgQGdldEFtb3VudE9mUm93cygpKVxuICAgICAgbmV3Rmlyc3RWaXNpYmlsZVNjcmVlblJvdyA9IEBlZGl0b3Iuc2NyZWVuUm93Rm9yQnVmZmVyUm93KG5ld0ZpcnN0VmlzaWJpbGVCdWZmZXJSb3cpXG4gICAgICBkb25lID0gPT5cbiAgICAgICAgQGVkaXRvci5zZXRGaXJzdFZpc2libGVTY3JlZW5Sb3cobmV3Rmlyc3RWaXNpYmlsZVNjcmVlblJvdylcbiAgICAgICAgIyBbRklYTUVdIHNvbWV0aW1lcywgc2Nyb2xsVG9wIGlzIG5vdCB1cGRhdGVkLCBjYWxsaW5nIHRoaXMgZml4LlxuICAgICAgICAjIEludmVzdGlnYXRlIGFuZCBmaW5kIGJldHRlciBhcHByb2FjaCB0aGVuIHJlbW92ZSB0aGlzIHdvcmthcm91bmQuXG4gICAgICAgIEBlZGl0b3IuZWxlbWVudC5jb21wb25lbnQ/LnVwZGF0ZVN5bmMoKVxuXG4gICAgICBpZiBAaXNTbW9vdGhTY3JvbGxFbmFibGVkKClcbiAgICAgICAgQHNtb290aFNjcm9sbChmaXJzdFZpc2liaWxlU2NyZWVuUm93LCBuZXdGaXJzdFZpc2liaWxlU2NyZWVuUm93LCBkb25lKVxuICAgICAgZWxzZVxuICAgICAgICBkb25lKClcblxuXG4jIGtleW1hcDogY3RybC1mXG5jbGFzcyBTY3JvbGxGdWxsU2NyZWVuRG93biBleHRlbmRzIFNjcm9sbFxuICBAZXh0ZW5kKHRydWUpXG4gIGFtb3VudE9mUGFnZTogKzFcblxuIyBrZXltYXA6IGN0cmwtYlxuY2xhc3MgU2Nyb2xsRnVsbFNjcmVlblVwIGV4dGVuZHMgU2Nyb2xsXG4gIEBleHRlbmQoKVxuICBhbW91bnRPZlBhZ2U6IC0xXG5cbiMga2V5bWFwOiBjdHJsLWRcbmNsYXNzIFNjcm9sbEhhbGZTY3JlZW5Eb3duIGV4dGVuZHMgU2Nyb2xsXG4gIEBleHRlbmQoKVxuICBhbW91bnRPZlBhZ2U6ICsxIC8gMlxuXG4jIGtleW1hcDogY3RybC11XG5jbGFzcyBTY3JvbGxIYWxmU2NyZWVuVXAgZXh0ZW5kcyBTY3JvbGxcbiAgQGV4dGVuZCgpXG4gIGFtb3VudE9mUGFnZTogLTEgLyAyXG5cbiMgRmluZFxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIGtleW1hcDogZlxuY2xhc3MgRmluZCBleHRlbmRzIE1vdGlvblxuICBAZXh0ZW5kKClcbiAgYmFja3dhcmRzOiBmYWxzZVxuICBpbmNsdXNpdmU6IHRydWVcbiAgb2Zmc2V0OiAwXG4gIHJlcXVpcmVJbnB1dDogdHJ1ZVxuICBjYXNlU2Vuc2l0aXZpdHlLaW5kOiBcIkZpbmRcIlxuXG4gIHJlc3RvcmVFZGl0b3JTdGF0ZTogLT5cbiAgICBAX3Jlc3RvcmVFZGl0b3JTdGF0ZT8oKVxuICAgIEBfcmVzdG9yZUVkaXRvclN0YXRlID0gbnVsbFxuXG4gIGNhbmNlbE9wZXJhdGlvbjogLT5cbiAgICBAcmVzdG9yZUVkaXRvclN0YXRlKClcbiAgICBzdXBlclxuXG4gIGluaXRpYWxpemU6IC0+XG4gICAgc3VwZXJcblxuICAgIEByZXBlYXRJZk5lY2Vzc2FyeSgpIGlmIEBnZXRDb25maWcoXCJyZXVzZUZpbmRGb3JSZXBlYXRGaW5kXCIpXG4gICAgcmV0dXJuIGlmIEBpc0NvbXBsZXRlKClcblxuICAgIGNoYXJzTWF4ID0gQGdldENvbmZpZyhcImZpbmRDaGFyc01heFwiKVxuXG4gICAgaWYgKGNoYXJzTWF4ID4gMSlcbiAgICAgIEBfcmVzdG9yZUVkaXRvclN0YXRlID0gc2F2ZUVkaXRvclN0YXRlKEBlZGl0b3IpXG5cbiAgICAgIG9wdGlvbnMgPVxuICAgICAgICBhdXRvQ29uZmlybVRpbWVvdXQ6IEBnZXRDb25maWcoXCJmaW5kQ29uZmlybUJ5VGltZW91dFwiKVxuICAgICAgICBvbkNvbmZpcm06IChAaW5wdXQpID0+IGlmIEBpbnB1dCB0aGVuIEBwcm9jZXNzT3BlcmF0aW9uKCkgZWxzZSBAY2FuY2VsT3BlcmF0aW9uKClcbiAgICAgICAgb25DaGFuZ2U6IChAcHJlQ29uZmlybWVkQ2hhcnMpID0+IEBoaWdobGlnaHRUZXh0SW5DdXJzb3JSb3dzKEBwcmVDb25maXJtZWRDaGFycywgXCJwcmUtY29uZmlybVwiKVxuICAgICAgICBvbkNhbmNlbDogPT5cbiAgICAgICAgICBAdmltU3RhdGUuaGlnaGxpZ2h0RmluZC5jbGVhck1hcmtlcnMoKVxuICAgICAgICAgIEBjYW5jZWxPcGVyYXRpb24oKVxuICAgICAgICBjb21tYW5kczpcbiAgICAgICAgICBcInZpbS1tb2RlLXBsdXM6ZmluZC1uZXh0LXByZS1jb25maXJtZWRcIjogPT4gQGZpbmRQcmVDb25maXJtZWQoKzEpXG4gICAgICAgICAgXCJ2aW0tbW9kZS1wbHVzOmZpbmQtcHJldmlvdXMtcHJlLWNvbmZpcm1lZFwiOiA9PiAgQGZpbmRQcmVDb25maXJtZWQoLTEpXG5cbiAgICBvcHRpb25zID89IHt9XG4gICAgb3B0aW9ucy5wdXJwb3NlID0gXCJmaW5kXCJcbiAgICBvcHRpb25zLmNoYXJzTWF4ID0gY2hhcnNNYXhcblxuICAgIEBmb2N1c0lucHV0KG9wdGlvbnMpXG5cbiAgZmluZFByZUNvbmZpcm1lZDogKGRlbHRhKSAtPlxuICAgIGlmIEBwcmVDb25maXJtZWRDaGFycyBhbmQgQGdldENvbmZpZyhcImhpZ2hsaWdodEZpbmRDaGFyXCIpXG4gICAgICBpbmRleCA9IEBoaWdobGlnaHRUZXh0SW5DdXJzb3JSb3dzKEBwcmVDb25maXJtZWRDaGFycywgXCJwcmUtY29uZmlybVwiLCBAZ2V0Q291bnQoLTEpICsgZGVsdGEsIHRydWUpXG4gICAgICBAY291bnQgPSBpbmRleCArIDFcblxuICByZXBlYXRJZk5lY2Vzc2FyeTogLT5cbiAgICBjdXJyZW50RmluZCA9IEB2aW1TdGF0ZS5nbG9iYWxTdGF0ZS5nZXQoXCJjdXJyZW50RmluZFwiKVxuICAgIGlzU2VxdWVudGlhbEV4ZWN1dGlvbiA9IEB2aW1TdGF0ZS5vcGVyYXRpb25TdGFjay5nZXRMYXN0Q29tbWFuZE5hbWUoKSBpbiBbXCJGaW5kXCIsIFwiRmluZEJhY2t3YXJkc1wiLCBcIlRpbGxcIiwgXCJUaWxsQmFja3dhcmRzXCJdXG4gICAgaWYgY3VycmVudEZpbmQ/IGFuZCBpc1NlcXVlbnRpYWxFeGVjdXRpb25cbiAgICAgIEBpbnB1dCA9IGN1cnJlbnRGaW5kLmlucHV0XG4gICAgICBAcmVwZWF0ZWQgPSB0cnVlXG5cbiAgaXNCYWNrd2FyZHM6IC0+XG4gICAgQGJhY2t3YXJkc1xuXG4gIGV4ZWN1dGU6IC0+XG4gICAgc3VwZXJcbiAgICBkZWNvcmF0aW9uVHlwZSA9IFwicG9zdC1jb25maXJtXCJcbiAgICBkZWNvcmF0aW9uVHlwZSArPSBcIiBsb25nXCIgaWYgQGlzQXNUYXJnZXRFeGNlcHRTZWxlY3QoKVxuICAgIEBlZGl0b3IuY29tcG9uZW50LmdldE5leHRVcGRhdGVQcm9taXNlKCkudGhlbiA9PlxuICAgICAgQGhpZ2hsaWdodFRleHRJbkN1cnNvclJvd3MoQGlucHV0LCBkZWNvcmF0aW9uVHlwZSlcblxuICAgIHJldHVybiAjIERvbid0IHJldHVybiBQcm9taXNlIGhlcmUuIE9wZXJhdGlvblN0YWNrIHRyZWF0IFByb21pc2UgZGlmZmVyZW50bHkuXG5cbiAgZ2V0UG9pbnQ6IChmcm9tUG9pbnQpIC0+XG4gICAgc2NhblJhbmdlID0gQGVkaXRvci5idWZmZXJSYW5nZUZvckJ1ZmZlclJvdyhmcm9tUG9pbnQucm93KVxuICAgIHBvaW50cyA9IFtdXG4gICAgcmVnZXggPSBAZ2V0UmVnZXgoQGlucHV0KVxuICAgIGluZGV4V2FudEFjY2VzcyA9IEBnZXRDb3VudCgtMSlcblxuICAgIHRyYW5zbGF0aW9uID0gbmV3IFBvaW50KDAsIGlmIEBpc0JhY2t3YXJkcygpIHRoZW4gQG9mZnNldCBlbHNlIC1Ab2Zmc2V0KVxuICAgIGZyb21Qb2ludCA9IGZyb21Qb2ludC50cmFuc2xhdGUodHJhbnNsYXRpb24ubmVnYXRlKCkpIGlmIEByZXBlYXRlZFxuXG4gICAgaWYgQGlzQmFja3dhcmRzKClcbiAgICAgIHNjYW5SYW5nZS5zdGFydCA9IFBvaW50LlpFUk8gaWYgQGdldENvbmZpZyhcImZpbmRBY3Jvc3NMaW5lc1wiKVxuICAgICAgQGVkaXRvci5iYWNrd2FyZHNTY2FuSW5CdWZmZXJSYW5nZSByZWdleCwgc2NhblJhbmdlLCAoe3JhbmdlLCBzdG9wfSkgLT5cbiAgICAgICAgaWYgcmFuZ2Uuc3RhcnQuaXNMZXNzVGhhbihmcm9tUG9pbnQpXG4gICAgICAgICAgcG9pbnRzLnB1c2gocmFuZ2Uuc3RhcnQpXG4gICAgICAgICAgc3RvcCgpIGlmIHBvaW50cy5sZW5ndGggPiBpbmRleFdhbnRBY2Nlc3NcbiAgICBlbHNlXG4gICAgICBzY2FuUmFuZ2UuZW5kID0gQGVkaXRvci5nZXRFb2ZCdWZmZXJQb3NpdGlvbigpIGlmIEBnZXRDb25maWcoXCJmaW5kQWNyb3NzTGluZXNcIilcbiAgICAgIEBlZGl0b3Iuc2NhbkluQnVmZmVyUmFuZ2UgcmVnZXgsIHNjYW5SYW5nZSwgKHtyYW5nZSwgc3RvcH0pIC0+XG4gICAgICAgIGlmIHJhbmdlLnN0YXJ0LmlzR3JlYXRlclRoYW4oZnJvbVBvaW50KVxuICAgICAgICAgIHBvaW50cy5wdXNoKHJhbmdlLnN0YXJ0KVxuICAgICAgICAgIHN0b3AoKSBpZiBwb2ludHMubGVuZ3RoID4gaW5kZXhXYW50QWNjZXNzXG5cbiAgICBwb2ludHNbaW5kZXhXYW50QWNjZXNzXT8udHJhbnNsYXRlKHRyYW5zbGF0aW9uKVxuXG4gIGhpZ2hsaWdodFRleHRJbkN1cnNvclJvd3M6ICh0ZXh0LCBkZWNvcmF0aW9uVHlwZSwgaW5kZXggPSBAZ2V0Q291bnQoLTEpLCBhZGp1c3RJbmRleCA9IGZhbHNlKSAtPlxuICAgIHJldHVybiB1bmxlc3MgQGdldENvbmZpZyhcImhpZ2hsaWdodEZpbmRDaGFyXCIpXG4gICAgQHZpbVN0YXRlLmhpZ2hsaWdodEZpbmQuaGlnaGxpZ2h0Q3Vyc29yUm93cyhAZ2V0UmVnZXgodGV4dCksIGRlY29yYXRpb25UeXBlLCBAaXNCYWNrd2FyZHMoKSwgQG9mZnNldCwgaW5kZXgsIGFkanVzdEluZGV4KVxuXG4gIG1vdmVDdXJzb3I6IChjdXJzb3IpIC0+XG4gICAgcG9pbnQgPSBAZ2V0UG9pbnQoY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKCkpXG4gICAgaWYgcG9pbnQ/XG4gICAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24ocG9pbnQpXG4gICAgZWxzZVxuICAgICAgQHJlc3RvcmVFZGl0b3JTdGF0ZSgpXG5cbiAgICBAZ2xvYmFsU3RhdGUuc2V0KCdjdXJyZW50RmluZCcsIHRoaXMpIHVubGVzcyBAcmVwZWF0ZWRcblxuICBnZXRSZWdleDogKHRlcm0pIC0+XG4gICAgbW9kaWZpZXJzID0gaWYgQGlzQ2FzZVNlbnNpdGl2ZSh0ZXJtKSB0aGVuICdnJyBlbHNlICdnaSdcbiAgICBuZXcgUmVnRXhwKF8uZXNjYXBlUmVnRXhwKHRlcm0pLCBtb2RpZmllcnMpXG5cbiMga2V5bWFwOiBGXG5jbGFzcyBGaW5kQmFja3dhcmRzIGV4dGVuZHMgRmluZFxuICBAZXh0ZW5kKClcbiAgaW5jbHVzaXZlOiBmYWxzZVxuICBiYWNrd2FyZHM6IHRydWVcblxuIyBrZXltYXA6IHRcbmNsYXNzIFRpbGwgZXh0ZW5kcyBGaW5kXG4gIEBleHRlbmQoKVxuICBvZmZzZXQ6IDFcblxuICBnZXRQb2ludDogLT5cbiAgICBAcG9pbnQgPSBzdXBlclxuICAgIEBtb3ZlU3VjY2VlZGVkID0gQHBvaW50P1xuICAgIHJldHVybiBAcG9pbnRcblxuIyBrZXltYXA6IFRcbmNsYXNzIFRpbGxCYWNrd2FyZHMgZXh0ZW5kcyBUaWxsXG4gIEBleHRlbmQoKVxuICBpbmNsdXNpdmU6IGZhbHNlXG4gIGJhY2t3YXJkczogdHJ1ZVxuXG4jIE1hcmtcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBrZXltYXA6IGBcbmNsYXNzIE1vdmVUb01hcmsgZXh0ZW5kcyBNb3Rpb25cbiAgQGV4dGVuZCgpXG4gIGp1bXA6IHRydWVcbiAgcmVxdWlyZUlucHV0OiB0cnVlXG4gIGlucHV0OiBudWxsICMgc2V0IHdoZW4gaW5zdGF0bnRpYXRlZCB2aWEgdmltU3RhdGU6Om1vdmVUb01hcmsoKVxuXG4gIGluaXRpYWxpemU6IC0+XG4gICAgc3VwZXJcbiAgICBAcmVhZENoYXIoKSB1bmxlc3MgQGlzQ29tcGxldGUoKVxuXG4gIGdldFBvaW50OiAtPlxuICAgIEB2aW1TdGF0ZS5tYXJrLmdldChAaW5wdXQpXG5cbiAgbW92ZUN1cnNvcjogKGN1cnNvcikgLT5cbiAgICBpZiBwb2ludCA9IEBnZXRQb2ludCgpXG4gICAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24ocG9pbnQpXG4gICAgICBjdXJzb3IuYXV0b3Njcm9sbChjZW50ZXI6IHRydWUpXG5cbiMga2V5bWFwOiAnXG5jbGFzcyBNb3ZlVG9NYXJrTGluZSBleHRlbmRzIE1vdmVUb01hcmtcbiAgQGV4dGVuZCgpXG4gIHdpc2U6ICdsaW5ld2lzZSdcblxuICBnZXRQb2ludDogLT5cbiAgICBpZiBwb2ludCA9IHN1cGVyXG4gICAgICBAZ2V0Rmlyc3RDaGFyYWN0ZXJQb3NpdGlvbkZvckJ1ZmZlclJvdyhwb2ludC5yb3cpXG5cbiMgRm9sZFxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBNb3ZlVG9QcmV2aW91c0ZvbGRTdGFydCBleHRlbmRzIE1vdGlvblxuICBAZXh0ZW5kKClcbiAgQGRlc2NyaXB0aW9uOiBcIk1vdmUgdG8gcHJldmlvdXMgZm9sZCBzdGFydFwiXG4gIHdpc2U6ICdjaGFyYWN0ZXJ3aXNlJ1xuICB3aGljaDogJ3N0YXJ0J1xuICBkaXJlY3Rpb246ICdwcmV2J1xuXG4gIGluaXRpYWxpemU6IC0+XG4gICAgc3VwZXJcbiAgICBAcm93cyA9IEBnZXRGb2xkUm93cyhAd2hpY2gpXG4gICAgQHJvd3MucmV2ZXJzZSgpIGlmIEBkaXJlY3Rpb24gaXMgJ3ByZXYnXG5cbiAgZ2V0Rm9sZFJvd3M6ICh3aGljaCkgLT5cbiAgICBpbmRleCA9IGlmIHdoaWNoIGlzICdzdGFydCcgdGhlbiAwIGVsc2UgMVxuICAgIHJvd3MgPSBnZXRDb2RlRm9sZFJvd1JhbmdlcyhAZWRpdG9yKS5tYXAgKHJvd1JhbmdlKSAtPlxuICAgICAgcm93UmFuZ2VbaW5kZXhdXG4gICAgXy5zb3J0QnkoXy51bmlxKHJvd3MpLCAocm93KSAtPiByb3cpXG5cbiAgZ2V0U2NhblJvd3M6IChjdXJzb3IpIC0+XG4gICAgY3Vyc29yUm93ID0gY3Vyc29yLmdldEJ1ZmZlclJvdygpXG4gICAgaXNWYWxpZFJvdyA9IHN3aXRjaCBAZGlyZWN0aW9uXG4gICAgICB3aGVuICdwcmV2JyB0aGVuIChyb3cpIC0+IHJvdyA8IGN1cnNvclJvd1xuICAgICAgd2hlbiAnbmV4dCcgdGhlbiAocm93KSAtPiByb3cgPiBjdXJzb3JSb3dcbiAgICBAcm93cy5maWx0ZXIoaXNWYWxpZFJvdylcblxuICBkZXRlY3RSb3c6IChjdXJzb3IpIC0+XG4gICAgQGdldFNjYW5Sb3dzKGN1cnNvcilbMF1cblxuICBtb3ZlQ3Vyc29yOiAoY3Vyc29yKSAtPlxuICAgIEBtb3ZlQ3Vyc29yQ291bnRUaW1lcyBjdXJzb3IsID0+XG4gICAgICBpZiAocm93ID0gQGRldGVjdFJvdyhjdXJzb3IpKT9cbiAgICAgICAgbW92ZUN1cnNvclRvRmlyc3RDaGFyYWN0ZXJBdFJvdyhjdXJzb3IsIHJvdylcblxuY2xhc3MgTW92ZVRvTmV4dEZvbGRTdGFydCBleHRlbmRzIE1vdmVUb1ByZXZpb3VzRm9sZFN0YXJ0XG4gIEBleHRlbmQoKVxuICBAZGVzY3JpcHRpb246IFwiTW92ZSB0byBuZXh0IGZvbGQgc3RhcnRcIlxuICBkaXJlY3Rpb246ICduZXh0J1xuXG5jbGFzcyBNb3ZlVG9QcmV2aW91c0ZvbGRTdGFydFdpdGhTYW1lSW5kZW50IGV4dGVuZHMgTW92ZVRvUHJldmlvdXNGb2xkU3RhcnRcbiAgQGV4dGVuZCgpXG4gIEBkZXNjcmlwdGlvbjogXCJNb3ZlIHRvIHByZXZpb3VzIHNhbWUtaW5kZW50ZWQgZm9sZCBzdGFydFwiXG4gIGRldGVjdFJvdzogKGN1cnNvcikgLT5cbiAgICBiYXNlSW5kZW50TGV2ZWwgPSBAZ2V0SW5kZW50TGV2ZWxGb3JCdWZmZXJSb3coY3Vyc29yLmdldEJ1ZmZlclJvdygpKVxuICAgIGZvciByb3cgaW4gQGdldFNjYW5Sb3dzKGN1cnNvcilcbiAgICAgIGlmIEBnZXRJbmRlbnRMZXZlbEZvckJ1ZmZlclJvdyhyb3cpIGlzIGJhc2VJbmRlbnRMZXZlbFxuICAgICAgICByZXR1cm4gcm93XG4gICAgbnVsbFxuXG5jbGFzcyBNb3ZlVG9OZXh0Rm9sZFN0YXJ0V2l0aFNhbWVJbmRlbnQgZXh0ZW5kcyBNb3ZlVG9QcmV2aW91c0ZvbGRTdGFydFdpdGhTYW1lSW5kZW50XG4gIEBleHRlbmQoKVxuICBAZGVzY3JpcHRpb246IFwiTW92ZSB0byBuZXh0IHNhbWUtaW5kZW50ZWQgZm9sZCBzdGFydFwiXG4gIGRpcmVjdGlvbjogJ25leHQnXG5cbmNsYXNzIE1vdmVUb1ByZXZpb3VzRm9sZEVuZCBleHRlbmRzIE1vdmVUb1ByZXZpb3VzRm9sZFN0YXJ0XG4gIEBleHRlbmQoKVxuICBAZGVzY3JpcHRpb246IFwiTW92ZSB0byBwcmV2aW91cyBmb2xkIGVuZFwiXG4gIHdoaWNoOiAnZW5kJ1xuXG5jbGFzcyBNb3ZlVG9OZXh0Rm9sZEVuZCBleHRlbmRzIE1vdmVUb1ByZXZpb3VzRm9sZEVuZFxuICBAZXh0ZW5kKClcbiAgQGRlc2NyaXB0aW9uOiBcIk1vdmUgdG8gbmV4dCBmb2xkIGVuZFwiXG4gIGRpcmVjdGlvbjogJ25leHQnXG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgTW92ZVRvUHJldmlvdXNGdW5jdGlvbiBleHRlbmRzIE1vdmVUb1ByZXZpb3VzRm9sZFN0YXJ0XG4gIEBleHRlbmQoKVxuICBAZGVzY3JpcHRpb246IFwiTW92ZSB0byBwcmV2aW91cyBmdW5jdGlvblwiXG4gIGRpcmVjdGlvbjogJ3ByZXYnXG4gIGRldGVjdFJvdzogKGN1cnNvcikgLT5cbiAgICBfLmRldGVjdCBAZ2V0U2NhblJvd3MoY3Vyc29yKSwgKHJvdykgPT5cbiAgICAgIGlzSW5jbHVkZUZ1bmN0aW9uU2NvcGVGb3JSb3coQGVkaXRvciwgcm93KVxuXG5jbGFzcyBNb3ZlVG9OZXh0RnVuY3Rpb24gZXh0ZW5kcyBNb3ZlVG9QcmV2aW91c0Z1bmN0aW9uXG4gIEBleHRlbmQoKVxuICBAZGVzY3JpcHRpb246IFwiTW92ZSB0byBuZXh0IGZ1bmN0aW9uXCJcbiAgZGlyZWN0aW9uOiAnbmV4dCdcblxuIyBTY29wZSBiYXNlZFxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBNb3ZlVG9Qb3NpdGlvbkJ5U2NvcGUgZXh0ZW5kcyBNb3Rpb25cbiAgQGV4dGVuZChmYWxzZSlcbiAgZGlyZWN0aW9uOiAnYmFja3dhcmQnXG4gIHNjb3BlOiAnLidcblxuICBnZXRQb2ludDogKGZyb21Qb2ludCkgLT5cbiAgICBkZXRlY3RTY29wZVN0YXJ0UG9zaXRpb25Gb3JTY29wZShAZWRpdG9yLCBmcm9tUG9pbnQsIEBkaXJlY3Rpb24sIEBzY29wZSlcblxuICBtb3ZlQ3Vyc29yOiAoY3Vyc29yKSAtPlxuICAgIEBtb3ZlQ3Vyc29yQ291bnRUaW1lcyBjdXJzb3IsID0+XG4gICAgICBAc2V0QnVmZmVyUG9zaXRpb25TYWZlbHkoY3Vyc29yLCBAZ2V0UG9pbnQoY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKCkpKVxuXG5jbGFzcyBNb3ZlVG9QcmV2aW91c1N0cmluZyBleHRlbmRzIE1vdmVUb1Bvc2l0aW9uQnlTY29wZVxuICBAZXh0ZW5kKClcbiAgQGRlc2NyaXB0aW9uOiBcIk1vdmUgdG8gcHJldmlvdXMgc3RyaW5nKHNlYXJjaGVkIGJ5IGBzdHJpbmcuYmVnaW5gIHNjb3BlKVwiXG4gIGRpcmVjdGlvbjogJ2JhY2t3YXJkJ1xuICBzY29wZTogJ3N0cmluZy5iZWdpbidcblxuY2xhc3MgTW92ZVRvTmV4dFN0cmluZyBleHRlbmRzIE1vdmVUb1ByZXZpb3VzU3RyaW5nXG4gIEBleHRlbmQoKVxuICBAZGVzY3JpcHRpb246IFwiTW92ZSB0byBuZXh0IHN0cmluZyhzZWFyY2hlZCBieSBgc3RyaW5nLmJlZ2luYCBzY29wZSlcIlxuICBkaXJlY3Rpb246ICdmb3J3YXJkJ1xuXG5jbGFzcyBNb3ZlVG9QcmV2aW91c051bWJlciBleHRlbmRzIE1vdmVUb1Bvc2l0aW9uQnlTY29wZVxuICBAZXh0ZW5kKClcbiAgZGlyZWN0aW9uOiAnYmFja3dhcmQnXG4gIEBkZXNjcmlwdGlvbjogXCJNb3ZlIHRvIHByZXZpb3VzIG51bWJlcihzZWFyY2hlZCBieSBgY29uc3RhbnQubnVtZXJpY2Agc2NvcGUpXCJcbiAgc2NvcGU6ICdjb25zdGFudC5udW1lcmljJ1xuXG5jbGFzcyBNb3ZlVG9OZXh0TnVtYmVyIGV4dGVuZHMgTW92ZVRvUHJldmlvdXNOdW1iZXJcbiAgQGV4dGVuZCgpXG4gIEBkZXNjcmlwdGlvbjogXCJNb3ZlIHRvIG5leHQgbnVtYmVyKHNlYXJjaGVkIGJ5IGBjb25zdGFudC5udW1lcmljYCBzY29wZSlcIlxuICBkaXJlY3Rpb246ICdmb3J3YXJkJ1xuXG5jbGFzcyBNb3ZlVG9OZXh0T2NjdXJyZW5jZSBleHRlbmRzIE1vdGlvblxuICBAZXh0ZW5kKClcbiAgIyBFbnN1cmUgdGhpcyBjb21tYW5kIGlzIGF2YWlsYWJsZSB3aGVuIGhhcy1vY2N1cnJlbmNlXG4gIEBjb21tYW5kU2NvcGU6ICdhdG9tLXRleHQtZWRpdG9yLnZpbS1tb2RlLXBsdXMuaGFzLW9jY3VycmVuY2UnXG4gIGp1bXA6IHRydWVcbiAgZGlyZWN0aW9uOiAnbmV4dCdcblxuICBnZXRSYW5nZXM6IC0+XG4gICAgQHZpbVN0YXRlLm9jY3VycmVuY2VNYW5hZ2VyLmdldE1hcmtlcnMoKS5tYXAgKG1hcmtlcikgLT5cbiAgICAgIG1hcmtlci5nZXRCdWZmZXJSYW5nZSgpXG5cbiAgZXhlY3V0ZTogLT5cbiAgICBAcmFuZ2VzID0gQHZpbVN0YXRlLnV0aWxzLnNvcnRSYW5nZXMoQGdldFJhbmdlcygpKVxuICAgIHN1cGVyXG5cbiAgbW92ZUN1cnNvcjogKGN1cnNvcikgLT5cbiAgICByYW5nZSA9IEByYW5nZXNbZ2V0SW5kZXgoQGdldEluZGV4KGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpKSwgQHJhbmdlcyldXG4gICAgcG9pbnQgPSByYW5nZS5zdGFydFxuICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihwb2ludCwgYXV0b3Njcm9sbDogZmFsc2UpXG5cbiAgICBpZiBjdXJzb3IuaXNMYXN0Q3Vyc29yKClcbiAgICAgIEBlZGl0b3IudW5mb2xkQnVmZmVyUm93KHBvaW50LnJvdylcbiAgICAgIHNtYXJ0U2Nyb2xsVG9CdWZmZXJQb3NpdGlvbihAZWRpdG9yLCBwb2ludClcblxuICAgIGlmIEBnZXRDb25maWcoJ2ZsYXNoT25Nb3ZlVG9PY2N1cnJlbmNlJylcbiAgICAgIEB2aW1TdGF0ZS5mbGFzaChyYW5nZSwgdHlwZTogJ3NlYXJjaCcpXG5cbiAgZ2V0SW5kZXg6IChmcm9tUG9pbnQpIC0+XG4gICAgaW5kZXggPSBudWxsXG4gICAgZm9yIHJhbmdlLCBpIGluIEByYW5nZXMgd2hlbiByYW5nZS5zdGFydC5pc0dyZWF0ZXJUaGFuKGZyb21Qb2ludClcbiAgICAgIGluZGV4ID0gaVxuICAgICAgYnJlYWtcbiAgICAoaW5kZXggPyAwKSArIEBnZXRDb3VudCgtMSlcblxuY2xhc3MgTW92ZVRvUHJldmlvdXNPY2N1cnJlbmNlIGV4dGVuZHMgTW92ZVRvTmV4dE9jY3VycmVuY2VcbiAgQGV4dGVuZCgpXG4gIGRpcmVjdGlvbjogJ3ByZXZpb3VzJ1xuXG4gIGdldEluZGV4OiAoZnJvbVBvaW50KSAtPlxuICAgIGluZGV4ID0gbnVsbFxuICAgIGZvciByYW5nZSwgaSBpbiBAcmFuZ2VzIGJ5IC0xIHdoZW4gcmFuZ2UuZW5kLmlzTGVzc1RoYW4oZnJvbVBvaW50KVxuICAgICAgaW5kZXggPSBpXG4gICAgICBicmVha1xuICAgIChpbmRleCA/IEByYW5nZXMubGVuZ3RoIC0gMSkgLSBAZ2V0Q291bnQoLTEpXG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBrZXltYXA6ICVcbmNsYXNzIE1vdmVUb1BhaXIgZXh0ZW5kcyBNb3Rpb25cbiAgQGV4dGVuZCgpXG4gIGluY2x1c2l2ZTogdHJ1ZVxuICBqdW1wOiB0cnVlXG4gIG1lbWJlcjogWydQYXJlbnRoZXNpcycsICdDdXJseUJyYWNrZXQnLCAnU3F1YXJlQnJhY2tldCddXG5cbiAgbW92ZUN1cnNvcjogKGN1cnNvcikgLT5cbiAgICBAc2V0QnVmZmVyUG9zaXRpb25TYWZlbHkoY3Vyc29yLCBAZ2V0UG9pbnQoY3Vyc29yKSlcblxuICBnZXRQb2ludEZvclRhZzogKHBvaW50KSAtPlxuICAgIHBhaXJJbmZvID0gQG5ldyhcIkFUYWdcIikuZ2V0UGFpckluZm8ocG9pbnQpXG4gICAgcmV0dXJuIG51bGwgdW5sZXNzIHBhaXJJbmZvP1xuICAgIHtvcGVuUmFuZ2UsIGNsb3NlUmFuZ2V9ID0gcGFpckluZm9cbiAgICBvcGVuUmFuZ2UgPSBvcGVuUmFuZ2UudHJhbnNsYXRlKFswLCArMV0sIFswLCAtMV0pXG4gICAgY2xvc2VSYW5nZSA9IGNsb3NlUmFuZ2UudHJhbnNsYXRlKFswLCArMV0sIFswLCAtMV0pXG4gICAgcmV0dXJuIGNsb3NlUmFuZ2Uuc3RhcnQgaWYgb3BlblJhbmdlLmNvbnRhaW5zUG9pbnQocG9pbnQpIGFuZCAobm90IHBvaW50LmlzRXF1YWwob3BlblJhbmdlLmVuZCkpXG4gICAgcmV0dXJuIG9wZW5SYW5nZS5zdGFydCBpZiBjbG9zZVJhbmdlLmNvbnRhaW5zUG9pbnQocG9pbnQpIGFuZCAobm90IHBvaW50LmlzRXF1YWwoY2xvc2VSYW5nZS5lbmQpKVxuXG4gIGdldFBvaW50OiAoY3Vyc29yKSAtPlxuICAgIGN1cnNvclBvc2l0aW9uID0gY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKClcbiAgICBjdXJzb3JSb3cgPSBjdXJzb3JQb3NpdGlvbi5yb3dcbiAgICByZXR1cm4gcG9pbnQgaWYgcG9pbnQgPSBAZ2V0UG9pbnRGb3JUYWcoY3Vyc29yUG9zaXRpb24pXG5cbiAgICAjIEFBbnlQYWlyQWxsb3dGb3J3YXJkaW5nIHJldHVybiBmb3J3YXJkaW5nIHJhbmdlIG9yIGVuY2xvc2luZyByYW5nZS5cbiAgICByYW5nZSA9IEBuZXcoXCJBQW55UGFpckFsbG93Rm9yd2FyZGluZ1wiLCB7QG1lbWJlcn0pLmdldFJhbmdlKGN1cnNvci5zZWxlY3Rpb24pXG4gICAgcmV0dXJuIG51bGwgdW5sZXNzIHJhbmdlP1xuICAgIHtzdGFydCwgZW5kfSA9IHJhbmdlXG4gICAgaWYgKHN0YXJ0LnJvdyBpcyBjdXJzb3JSb3cpIGFuZCBzdGFydC5pc0dyZWF0ZXJUaGFuT3JFcXVhbChjdXJzb3JQb3NpdGlvbilcbiAgICAgICMgRm9yd2FyZGluZyByYW5nZSBmb3VuZFxuICAgICAgZW5kLnRyYW5zbGF0ZShbMCwgLTFdKVxuICAgIGVsc2UgaWYgZW5kLnJvdyBpcyBjdXJzb3JQb3NpdGlvbi5yb3dcbiAgICAgICMgRW5jbG9zaW5nIHJhbmdlIHdhcyByZXR1cm5lZFxuICAgICAgIyBXZSBtb3ZlIHRvIHN0YXJ0KCBvcGVuLXBhaXIgKSBvbmx5IHdoZW4gY2xvc2UtcGFpciB3YXMgYXQgc2FtZSByb3cgYXMgY3Vyc29yLXJvdy5cbiAgICAgIHN0YXJ0XG4iXX0=
