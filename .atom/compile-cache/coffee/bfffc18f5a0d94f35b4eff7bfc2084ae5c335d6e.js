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

    Motion.prototype.selectSucceeded = false;

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

    Motion.prototype.resetState = function() {
      return this.selectSucceeded = false;
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
      var $selection, isOrWasVisual, j, len, ref2, ref3, ref4, selectSucceeded, selection;
      isOrWasVisual = ((ref2 = this.operator) != null ? ref2["instanceof"]('SelectBase') : void 0) || this.is('CurrentSelection');
      ref3 = this.editor.getSelections();
      for (j = 0, len = ref3.length; j < len; j++) {
        selection = ref3[j];
        selection.modifySelection((function(_this) {
          return function() {
            return _this.moveWithSaveJump(selection.cursor);
          };
        })(this));
        selectSucceeded = ((ref4 = this.moveSucceeded) != null ? ref4 : !selection.isEmpty()) || (this.isLinewise() && this.moveSuccessOnLinewise);
        this.selectSucceeded || (this.selectSucceeded = selectSucceeded);
        if (isOrWasVisual || (selectSucceeded && (this.inclusive || this.isLinewise()))) {
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
      if (this.isAsTargetExceptSelectInVisualMode() && !cursor.isAtEndOfLine()) {
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
      if (this.isNonWhiteSpacePoint(point) || this.isFirstRowOrLastRowAndStoppable(point)) {
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

    MoveUpToEdge.prototype.isFirstRowOrLastRowAndStoppable = function(point) {
      if (this.isMode('normal') && pointIsAtEndOfLineAtNonEmptyRow(this.editor, point)) {
        return false;
      } else {
        return point.isEqual(this.editor.clipScreenPosition(point)) && ((point.row === 0) || (point.row === this.getVimLastScreenRow()));
      }
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
      var cursorPosition, isAsTargetExceptSelectInVisualMode, wasOnWhiteSpace;
      cursorPosition = cursor.getBufferPosition();
      if (pointIsAtVimEndOfFile(this.editor, cursorPosition)) {
        return;
      }
      wasOnWhiteSpace = pointIsOnWhiteSpace(this.editor, cursorPosition);
      isAsTargetExceptSelectInVisualMode = this.isAsTargetExceptSelectInVisualMode();
      return this.moveCursorCountTimes(cursor, (function(_this) {
        return function(arg) {
          var isFinal, pattern, point, ref2;
          isFinal = arg.isFinal;
          cursorPosition = cursor.getBufferPosition();
          if (isEmptyRow(_this.editor, cursorPosition.row) && isAsTargetExceptSelectInVisualMode) {
            point = cursorPosition.traverse([1, 0]);
          } else {
            pattern = (ref2 = _this.wordRegex) != null ? ref2 : cursor.wordRegExp();
            point = _this.getPoint(pattern, cursorPosition);
            if (isFinal && isAsTargetExceptSelectInVisualMode) {
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
      if (this.isAsTargetExceptSelectInVisualMode()) {
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
      var decorationType, ref2;
      Find.__super__.execute.apply(this, arguments);
      decorationType = "post-confirm";
      if ((this.operator != null) && !((ref2 = this.operator) != null ? ref2["instanceof"]("SelectBase") : void 0)) {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvbW90aW9uLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsZzVFQUFBO0lBQUE7OztFQUFBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVI7O0VBQ0osTUFBaUIsT0FBQSxDQUFRLE1BQVIsQ0FBakIsRUFBQyxpQkFBRCxFQUFROztFQUVSLE9BMEJJLE9BQUEsQ0FBUSxTQUFSLENBMUJKLEVBQ0Usb0NBREYsRUFDa0Isc0NBRGxCLEVBRUUsNENBRkYsRUFFc0IsZ0RBRnRCLEVBR0Usa0RBSEYsRUFJRSx3REFKRixFQUk0QixzREFKNUIsRUFLRSxnREFMRixFQUt3QixnREFMeEIsRUFNRSxzRUFORixFQU9FLDRCQVBGLEVBUUUsOENBUkYsRUFTRSxrRUFURixFQVVFLDRCQVZGLEVBV0UsZ0RBWEYsRUFZRSxnRkFaRixFQWFFLGdFQWJGLEVBY0Usd0VBZEYsRUFlRSxrQ0FmRixFQWdCRSxnREFoQkYsRUFpQkUsZ0NBakJGLEVBa0JFLHNDQWxCRixFQW1CRSw4QkFuQkYsRUFvQkUsd0JBcEJGLEVBcUJFLDhEQXJCRixFQXNCRSxzRUF0QkYsRUF1QkUsd0RBdkJGLEVBd0JFLGdEQXhCRixFQXlCRTs7RUFHRixJQUFBLEdBQU8sT0FBQSxDQUFRLFFBQVI7O0VBRUQ7OztJQUNKLE1BQUMsQ0FBQSxNQUFELENBQVEsS0FBUjs7SUFDQSxNQUFDLENBQUEsYUFBRCxHQUFnQjs7cUJBQ2hCLFNBQUEsR0FBVzs7cUJBQ1gsSUFBQSxHQUFNOztxQkFDTixJQUFBLEdBQU07O3FCQUNOLGNBQUEsR0FBZ0I7O3FCQUNoQixhQUFBLEdBQWU7O3FCQUNmLHFCQUFBLEdBQXVCOztxQkFDdkIsZUFBQSxHQUFpQjs7SUFFSixnQkFBQTtNQUNYLHlDQUFBLFNBQUE7TUFFQSxJQUFHLElBQUMsQ0FBQSxJQUFELEtBQVMsUUFBWjtRQUNFLElBQUMsQ0FBQSxJQUFELEdBQVEsSUFBQyxDQUFBLFFBRFg7O01BRUEsSUFBQyxDQUFBLFVBQUQsQ0FBQTtJQUxXOztxQkFPYixVQUFBLEdBQVksU0FBQTthQUFHLElBQUMsQ0FBQSxJQUFELEtBQVM7SUFBWjs7cUJBQ1osV0FBQSxHQUFhLFNBQUE7YUFBRyxJQUFDLENBQUEsSUFBRCxLQUFTO0lBQVo7O3FCQUViLFNBQUEsR0FBVyxTQUFDLElBQUQ7TUFDVCxJQUFHLElBQUEsS0FBUSxlQUFYO1FBQ0UsSUFBRyxJQUFDLENBQUEsSUFBRCxLQUFTLFVBQVo7VUFDRSxJQUFDLENBQUEsU0FBRCxHQUFhLE1BRGY7U0FBQSxNQUFBO1VBR0UsSUFBQyxDQUFBLFNBQUQsR0FBYSxDQUFJLElBQUMsQ0FBQSxVQUhwQjtTQURGOzthQUtBLElBQUMsQ0FBQSxJQUFELEdBQVE7SUFOQzs7cUJBUVgsVUFBQSxHQUFZLFNBQUE7YUFDVixJQUFDLENBQUEsZUFBRCxHQUFtQjtJQURUOztxQkFHWix1QkFBQSxHQUF5QixTQUFDLE1BQUQsRUFBUyxLQUFUO01BQ3ZCLElBQW1DLGFBQW5DO2VBQUEsTUFBTSxDQUFDLGlCQUFQLENBQXlCLEtBQXpCLEVBQUE7O0lBRHVCOztxQkFHekIsdUJBQUEsR0FBeUIsU0FBQyxNQUFELEVBQVMsS0FBVDtNQUN2QixJQUFtQyxhQUFuQztlQUFBLE1BQU0sQ0FBQyxpQkFBUCxDQUF5QixLQUF6QixFQUFBOztJQUR1Qjs7cUJBR3pCLGdCQUFBLEdBQWtCLFNBQUMsTUFBRDtBQUNoQixVQUFBO01BQUEsSUFBRyxNQUFNLENBQUMsWUFBUCxDQUFBLENBQUEsSUFBMEIsSUFBQyxDQUFBLElBQTlCO1FBQ0UsY0FBQSxHQUFpQixNQUFNLENBQUMsaUJBQVAsQ0FBQSxFQURuQjs7TUFHQSxJQUFDLENBQUEsVUFBRCxDQUFZLE1BQVo7TUFFQSxJQUFHLHdCQUFBLElBQW9CLENBQUksY0FBYyxDQUFDLE9BQWYsQ0FBdUIsTUFBTSxDQUFDLGlCQUFQLENBQUEsQ0FBdkIsQ0FBM0I7UUFDRSxJQUFDLENBQUEsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFmLENBQW1CLEdBQW5CLEVBQXdCLGNBQXhCO2VBQ0EsSUFBQyxDQUFBLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBZixDQUFtQixHQUFuQixFQUF3QixjQUF4QixFQUZGOztJQU5nQjs7cUJBVWxCLE9BQUEsR0FBUyxTQUFBO0FBQ1AsVUFBQTtNQUFBLElBQUcscUJBQUg7UUFDRSxJQUFDLENBQUEsTUFBRCxDQUFBLEVBREY7T0FBQSxNQUFBO0FBR0U7QUFBQSxhQUFBLHNDQUFBOztVQUFBLElBQUMsQ0FBQSxnQkFBRCxDQUFrQixNQUFsQjtBQUFBLFNBSEY7O01BSUEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxZQUFSLENBQUE7YUFDQSxJQUFDLENBQUEsTUFBTSxDQUFDLDJCQUFSLENBQUE7SUFOTzs7cUJBU1QsTUFBQSxHQUFRLFNBQUE7QUFDTixVQUFBO01BQUEsYUFBQSx5Q0FBeUIsRUFBRSxVQUFGLEVBQVQsQ0FBc0IsWUFBdEIsV0FBQSxJQUF1QyxJQUFDLENBQUEsRUFBRCxDQUFJLGtCQUFKO0FBQ3ZEO0FBQUEsV0FBQSxzQ0FBQTs7UUFDRSxTQUFTLENBQUMsZUFBVixDQUEwQixDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFBO21CQUN4QixLQUFDLENBQUEsZ0JBQUQsQ0FBa0IsU0FBUyxDQUFDLE1BQTVCO1VBRHdCO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUExQjtRQUdBLGVBQUEsaURBQW1DLENBQUksU0FBUyxDQUFDLE9BQVYsQ0FBQSxFQUFyQixJQUE0QyxDQUFDLElBQUMsQ0FBQSxVQUFELENBQUEsQ0FBQSxJQUFrQixJQUFDLENBQUEscUJBQXBCO1FBQzlELElBQUMsQ0FBQSxvQkFBRCxJQUFDLENBQUEsa0JBQW9CO1FBRXJCLElBQUcsYUFBQSxJQUFpQixDQUFDLGVBQUEsSUFBb0IsQ0FBQyxJQUFDLENBQUEsU0FBRCxJQUFjLElBQUMsQ0FBQSxVQUFELENBQUEsQ0FBZixDQUFyQixDQUFwQjtVQUNFLFVBQUEsR0FBYSxJQUFDLENBQUEsS0FBRCxDQUFPLFNBQVA7VUFDYixVQUFVLENBQUMsY0FBWCxDQUEwQixJQUExQjtVQUNBLFVBQVUsQ0FBQyxTQUFYLENBQXFCLElBQUMsQ0FBQSxJQUF0QixFQUhGOztBQVBGO01BWUEsSUFBc0QsSUFBQyxDQUFBLElBQUQsS0FBUyxXQUEvRDtlQUFBLElBQUMsQ0FBQSxRQUFRLENBQUMseUJBQVYsQ0FBQSxDQUFxQyxDQUFDLFVBQXRDLENBQUEsRUFBQTs7SUFkTTs7cUJBZ0JSLGtCQUFBLEdBQW9CLFNBQUMsTUFBRCxFQUFTLEdBQVQsRUFBYyxPQUFkO01BQ2xCLElBQUcsSUFBQyxDQUFBLGNBQUQsSUFBb0IsQ0FBSSxJQUFDLENBQUEsU0FBRCxDQUFXLHNCQUFYLENBQTNCO2VBQ0UsTUFBTSxDQUFDLGlCQUFQLENBQXlCLElBQUMsQ0FBQSxxQ0FBRCxDQUF1QyxHQUF2QyxDQUF6QixFQUFzRSxPQUF0RSxFQURGO09BQUEsTUFBQTtlQUdFLFlBQUEsQ0FBYSxNQUFiLEVBQXFCLEdBQXJCLEVBQTBCLE9BQTFCLEVBSEY7O0lBRGtCOztxQkFXcEIsb0JBQUEsR0FBc0IsU0FBQyxNQUFELEVBQVMsRUFBVDtBQUNwQixVQUFBO01BQUEsV0FBQSxHQUFjLE1BQU0sQ0FBQyxpQkFBUCxDQUFBO2FBQ2QsSUFBQyxDQUFBLFVBQUQsQ0FBWSxJQUFDLENBQUEsUUFBRCxDQUFBLENBQVosRUFBeUIsU0FBQyxLQUFEO0FBQ3ZCLFlBQUE7UUFBQSxFQUFBLENBQUcsS0FBSDtRQUNBLElBQUcsQ0FBQyxXQUFBLEdBQWMsTUFBTSxDQUFDLGlCQUFQLENBQUEsQ0FBZixDQUEwQyxDQUFDLE9BQTNDLENBQW1ELFdBQW5ELENBQUg7VUFDRSxLQUFLLENBQUMsSUFBTixDQUFBLEVBREY7O2VBRUEsV0FBQSxHQUFjO01BSlMsQ0FBekI7SUFGb0I7O3FCQVF0QixlQUFBLEdBQWlCLFNBQUMsSUFBRDtNQUNmLElBQUcsSUFBQyxDQUFBLFNBQUQsQ0FBVyxpQkFBQSxHQUFrQixJQUFDLENBQUEsbUJBQTlCLENBQUg7ZUFDRSxJQUFJLENBQUMsTUFBTCxDQUFZLE9BQVosQ0FBQSxLQUEwQixDQUFDLEVBRDdCO09BQUEsTUFBQTtlQUdFLENBQUksSUFBQyxDQUFBLFNBQUQsQ0FBVyxlQUFBLEdBQWdCLElBQUMsQ0FBQSxtQkFBNUIsRUFITjs7SUFEZTs7OztLQTVGRTs7RUFtR2Y7Ozs7Ozs7SUFDSixnQkFBQyxDQUFBLE1BQUQsQ0FBUSxLQUFSOzsrQkFDQSxlQUFBLEdBQWlCOzsrQkFDakIsd0JBQUEsR0FBMEI7OytCQUMxQixTQUFBLEdBQVc7OytCQUVYLFVBQUEsR0FBWSxTQUFBO01BQ1Ysa0RBQUEsU0FBQTthQUNBLElBQUMsQ0FBQSxpQkFBRCxHQUFxQixJQUFJO0lBRmY7OytCQUlaLFVBQUEsR0FBWSxTQUFDLE1BQUQ7QUFDVixVQUFBO01BQUEsSUFBRyxJQUFDLENBQUEsSUFBRCxLQUFTLFFBQVo7UUFDRSxJQUFHLElBQUMsQ0FBQSxXQUFELENBQUEsQ0FBSDtpQkFDRSxJQUFDLENBQUEsd0JBQUQsR0FBNEIsSUFBQyxDQUFBLEtBQUQsQ0FBTyxNQUFNLENBQUMsU0FBZCxDQUF3QixDQUFDLDJCQUF6QixDQUFBLEVBRDlCO1NBQUEsTUFBQTtpQkFHRSxJQUFDLENBQUEsZUFBRCxHQUFtQixJQUFDLENBQUEsTUFBTSxDQUFDLHNCQUFSLENBQUEsQ0FBZ0MsQ0FBQyxTQUFqQyxDQUFBLEVBSHJCO1NBREY7T0FBQSxNQUFBO1FBT0UsS0FBQSxHQUFRLE1BQU0sQ0FBQyxpQkFBUCxDQUFBO1FBRVIsSUFBRyxxQ0FBSDtpQkFDRSxNQUFNLENBQUMsaUJBQVAsQ0FBeUIsS0FBSyxDQUFDLFNBQU4sQ0FBZ0IsSUFBQyxDQUFBLHdCQUFqQixDQUF6QixFQURGO1NBQUEsTUFBQTtpQkFHRSxNQUFNLENBQUMsaUJBQVAsQ0FBeUIsS0FBSyxDQUFDLFFBQU4sQ0FBZSxJQUFDLENBQUEsZUFBaEIsQ0FBekIsRUFIRjtTQVRGOztJQURVOzsrQkFlWixNQUFBLEdBQVEsU0FBQTtBQUNOLFVBQUE7TUFBQSxJQUFHLElBQUMsQ0FBQSxJQUFELEtBQVMsUUFBWjtRQUNFLDhDQUFBLFNBQUEsRUFERjtPQUFBLE1BQUE7QUFHRTtBQUFBLGFBQUEsc0NBQUE7O2dCQUF3QyxTQUFBLEdBQVksSUFBQyxDQUFBLGlCQUFpQixDQUFDLEdBQW5CLENBQXVCLE1BQXZCOzs7VUFDakQseUNBQUQsRUFBaUI7VUFDakIsSUFBRyxjQUFjLENBQUMsT0FBZixDQUF1QixNQUFNLENBQUMsaUJBQVAsQ0FBQSxDQUF2QixDQUFIO1lBQ0UsTUFBTSxDQUFDLGlCQUFQLENBQXlCLGdCQUF6QixFQURGOztBQUZGO1FBSUEsOENBQUEsU0FBQSxFQVBGOztBQWVBO0FBQUE7V0FBQSx3Q0FBQTs7UUFDRSxnQkFBQSxHQUFtQixNQUFNLENBQUMsU0FBUyxDQUFDLGNBQWpCLENBQUEsQ0FBaUMsQ0FBQztxQkFDckQsSUFBQyxDQUFBLG9CQUFELENBQXNCLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUE7WUFDcEIsY0FBQSxHQUFpQixNQUFNLENBQUMsaUJBQVAsQ0FBQTttQkFDakIsS0FBQyxDQUFBLGlCQUFpQixDQUFDLEdBQW5CLENBQXVCLE1BQXZCLEVBQStCO2NBQUMsa0JBQUEsZ0JBQUQ7Y0FBbUIsZ0JBQUEsY0FBbkI7YUFBL0I7VUFGb0I7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXRCO0FBRkY7O0lBaEJNOzs7O0tBekJxQjs7RUErQ3pCOzs7Ozs7O0lBQ0osUUFBQyxDQUFBLE1BQUQsQ0FBQTs7dUJBQ0EsVUFBQSxHQUFZLFNBQUMsTUFBRDtBQUNWLFVBQUE7TUFBQSxTQUFBLEdBQVksSUFBQyxDQUFBLFNBQUQsQ0FBVyxxQkFBWDthQUNaLElBQUMsQ0FBQSxvQkFBRCxDQUFzQixNQUF0QixFQUE4QixTQUFBO2VBQzVCLGNBQUEsQ0FBZSxNQUFmLEVBQXVCO1VBQUMsV0FBQSxTQUFEO1NBQXZCO01BRDRCLENBQTlCO0lBRlU7Ozs7S0FGUzs7RUFPakI7Ozs7Ozs7SUFDSixTQUFDLENBQUEsTUFBRCxDQUFBOzt3QkFDQSxpQkFBQSxHQUFtQixTQUFDLE1BQUQ7TUFDakIsSUFBRyxJQUFDLENBQUEsa0NBQUQsQ0FBQSxDQUFBLElBQTBDLENBQUksTUFBTSxDQUFDLGFBQVAsQ0FBQSxDQUFqRDtlQUNFLE1BREY7T0FBQSxNQUFBO2VBR0UsSUFBQyxDQUFBLFNBQUQsQ0FBVyxxQkFBWCxFQUhGOztJQURpQjs7d0JBTW5CLFVBQUEsR0FBWSxTQUFDLE1BQUQ7YUFDVixJQUFDLENBQUEsb0JBQUQsQ0FBc0IsTUFBdEIsRUFBOEIsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO0FBQzVCLGNBQUE7VUFBQSxjQUFBLEdBQWlCLE1BQU0sQ0FBQyxpQkFBUCxDQUFBO1VBQ2pCLEtBQUMsQ0FBQSxNQUFNLENBQUMsZUFBUixDQUF3QixjQUFjLENBQUMsR0FBdkM7VUFDQSxTQUFBLEdBQVksS0FBQyxDQUFBLGlCQUFELENBQW1CLE1BQW5CO1VBQ1osZUFBQSxDQUFnQixNQUFoQjtVQUNBLElBQUcsTUFBTSxDQUFDLGFBQVAsQ0FBQSxDQUFBLElBQTJCLFNBQTNCLElBQXlDLENBQUkscUJBQUEsQ0FBc0IsS0FBQyxDQUFBLE1BQXZCLEVBQStCLGNBQS9CLENBQWhEO21CQUNFLGVBQUEsQ0FBZ0IsTUFBaEIsRUFBd0I7Y0FBQyxXQUFBLFNBQUQ7YUFBeEIsRUFERjs7UUFMNEI7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTlCO0lBRFU7Ozs7S0FSVTs7RUFpQmxCOzs7Ozs7O0lBQ0oscUJBQUMsQ0FBQSxNQUFELENBQVEsS0FBUjs7b0NBRUEsVUFBQSxHQUFZLFNBQUMsTUFBRDthQUNWLGVBQUEsQ0FBZ0IsTUFBaEIsRUFBd0IsTUFBTSxDQUFDLGVBQVAsQ0FBQSxDQUFBLEdBQTJCLElBQUMsQ0FBQSxRQUFELENBQUEsQ0FBbkQ7SUFEVTs7OztLQUhzQjs7RUFNOUI7Ozs7Ozs7SUFDSixNQUFDLENBQUEsTUFBRCxDQUFBOztxQkFDQSxJQUFBLEdBQU07O3FCQUNOLElBQUEsR0FBTTs7cUJBRU4sWUFBQSxHQUFjLFNBQUMsR0FBRDtNQUNaLEdBQUEsR0FBTSxJQUFDLENBQUEsVUFBRCxDQUFZLEdBQVo7TUFDTixJQUFHLElBQUMsQ0FBQSxNQUFNLENBQUMsbUJBQVIsQ0FBNEIsR0FBNUIsQ0FBSDtlQUNFLG9DQUFBLENBQXFDLElBQUMsQ0FBQSxNQUF0QyxFQUE4QyxHQUE5QyxDQUFrRCxDQUFDLEtBQUssQ0FBQyxJQUQzRDtPQUFBLE1BQUE7ZUFHRSxJQUhGOztJQUZZOztxQkFPZCxVQUFBLEdBQVksU0FBQyxHQUFEO0FBQ1YsVUFBQTtNQUFBLEdBQUEsR0FBTTtNQUNOLElBQUcsSUFBQyxDQUFBLElBQUQsSUFBVSxHQUFBLEtBQU8sR0FBcEI7ZUFDRSxJQUFDLENBQUEsbUJBQUQsQ0FBQSxFQURGO09BQUEsTUFBQTtlQUdFLFdBQUEsQ0FBWSxHQUFBLEdBQU0sQ0FBbEIsRUFBcUI7VUFBQyxLQUFBLEdBQUQ7U0FBckIsRUFIRjs7SUFGVTs7cUJBT1osVUFBQSxHQUFZLFNBQUMsTUFBRDthQUNWLElBQUMsQ0FBQSxvQkFBRCxDQUFzQixNQUF0QixFQUE4QixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7aUJBQzVCLFlBQUEsQ0FBYSxNQUFiLEVBQXFCLEtBQUMsQ0FBQSxZQUFELENBQWMsTUFBTSxDQUFDLFlBQVAsQ0FBQSxDQUFkLENBQXJCO1FBRDRCO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE5QjtJQURVOzs7O0tBbkJPOztFQXVCZjs7Ozs7OztJQUNKLFVBQUMsQ0FBQSxNQUFELENBQUE7O3lCQUNBLElBQUEsR0FBTTs7OztLQUZpQjs7RUFJbkI7Ozs7Ozs7SUFDSixRQUFDLENBQUEsTUFBRCxDQUFBOzt1QkFDQSxJQUFBLEdBQU07O3VCQUNOLElBQUEsR0FBTTs7dUJBRU4sWUFBQSxHQUFjLFNBQUMsR0FBRDtNQUNaLElBQUcsSUFBQyxDQUFBLE1BQU0sQ0FBQyxtQkFBUixDQUE0QixHQUE1QixDQUFIO1FBQ0UsR0FBQSxHQUFNLG9DQUFBLENBQXFDLElBQUMsQ0FBQSxNQUF0QyxFQUE4QyxHQUE5QyxDQUFrRCxDQUFDLEdBQUcsQ0FBQyxJQUQvRDs7YUFFQSxJQUFDLENBQUEsVUFBRCxDQUFZLEdBQVo7SUFIWTs7dUJBS2QsVUFBQSxHQUFZLFNBQUMsR0FBRDtBQUNWLFVBQUE7TUFBQSxHQUFBLEdBQU0sSUFBQyxDQUFBLG1CQUFELENBQUE7TUFDTixJQUFHLElBQUMsQ0FBQSxJQUFELElBQVUsR0FBQSxJQUFPLEdBQXBCO2VBQ0UsRUFERjtPQUFBLE1BQUE7ZUFHRSxXQUFBLENBQVksR0FBQSxHQUFNLENBQWxCLEVBQXFCO1VBQUMsS0FBQSxHQUFEO1NBQXJCLEVBSEY7O0lBRlU7Ozs7S0FWUzs7RUFpQmpCOzs7Ozs7O0lBQ0osWUFBQyxDQUFBLE1BQUQsQ0FBQTs7MkJBQ0EsSUFBQSxHQUFNOzs7O0tBRm1COztFQUlyQjs7Ozs7OztJQUNKLFlBQUMsQ0FBQSxNQUFELENBQUE7OzJCQUNBLElBQUEsR0FBTTs7MkJBQ04sU0FBQSxHQUFXOzsyQkFFWCxVQUFBLEdBQVksU0FBQyxNQUFEO2FBQ1YsSUFBQyxDQUFBLG9CQUFELENBQXNCLE1BQXRCLEVBQThCLFNBQUE7ZUFDNUIsa0JBQUEsQ0FBbUIsTUFBbkI7TUFENEIsQ0FBOUI7SUFEVTs7OztLQUxhOztFQVNyQjs7Ozs7OztJQUNKLGNBQUMsQ0FBQSxNQUFELENBQUE7OzZCQUNBLElBQUEsR0FBTTs7NkJBQ04sU0FBQSxHQUFXOzs2QkFFWCxVQUFBLEdBQVksU0FBQyxNQUFEO2FBQ1YsSUFBQyxDQUFBLG9CQUFELENBQXNCLE1BQXRCLEVBQThCLFNBQUE7ZUFDNUIsb0JBQUEsQ0FBcUIsTUFBckI7TUFENEIsQ0FBOUI7SUFEVTs7OztLQUxlOztFQWN2Qjs7Ozs7OztJQUNKLFlBQUMsQ0FBQSxNQUFELENBQUE7OzJCQUNBLElBQUEsR0FBTTs7MkJBQ04sSUFBQSxHQUFNOzsyQkFDTixTQUFBLEdBQVc7O0lBQ1gsWUFBQyxDQUFBLFdBQUQsR0FBYzs7MkJBRWQsVUFBQSxHQUFZLFNBQUMsTUFBRDthQUNWLElBQUMsQ0FBQSxvQkFBRCxDQUFzQixNQUF0QixFQUE4QixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7aUJBQzVCLEtBQUMsQ0FBQSx1QkFBRCxDQUF5QixNQUF6QixFQUFpQyxLQUFDLENBQUEsUUFBRCxDQUFVLE1BQU0sQ0FBQyxpQkFBUCxDQUFBLENBQVYsQ0FBakM7UUFENEI7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTlCO0lBRFU7OzJCQUlaLFFBQUEsR0FBVSxTQUFDLFNBQUQ7QUFDUixVQUFBO01BQUEsTUFBQSxHQUFTLFNBQVMsQ0FBQztBQUNuQjtBQUFBLFdBQUEsc0NBQUE7O1lBQXdDLElBQUMsQ0FBQSxNQUFELENBQVEsS0FBQSxHQUFZLElBQUEsS0FBQSxDQUFNLEdBQU4sRUFBVyxNQUFYLENBQXBCO0FBQ3RDLGlCQUFPOztBQURUO0lBRlE7OzJCQUtWLFdBQUEsR0FBYSxTQUFDLEdBQUQ7QUFDWCxVQUFBO01BRGEsTUFBRDtNQUNaLFFBQUEsR0FBVyxvQkFBb0IsQ0FBQyxJQUFyQixDQUEwQixJQUExQixFQUFnQyxJQUFDLENBQUEsTUFBakM7QUFDWCxjQUFPLElBQUMsQ0FBQSxTQUFSO0FBQUEsYUFDTyxJQURQO2lCQUNpQjs7Ozs7QUFEakIsYUFFTyxNQUZQO2lCQUVtQjs7Ozs7QUFGbkI7SUFGVzs7MkJBTWIsTUFBQSxHQUFRLFNBQUMsS0FBRDtBQUNOLFVBQUE7TUFBQSxJQUFHLElBQUMsQ0FBQSxnQkFBRCxDQUFrQixLQUFsQixDQUFIO1FBRUUsS0FBQSxHQUFRLEtBQUssQ0FBQyxTQUFOLENBQWdCLENBQUMsQ0FBQyxDQUFGLEVBQUssQ0FBTCxDQUFoQjtRQUNSLEtBQUEsR0FBUSxLQUFLLENBQUMsU0FBTixDQUFnQixDQUFDLENBQUMsQ0FBRixFQUFLLENBQUwsQ0FBaEI7ZUFDUixDQUFDLENBQUksSUFBQyxDQUFBLGdCQUFELENBQWtCLEtBQWxCLENBQUwsQ0FBQSxJQUFrQyxDQUFDLENBQUksSUFBQyxDQUFBLGdCQUFELENBQWtCLEtBQWxCLENBQUwsRUFKcEM7T0FBQSxNQUFBO2VBTUUsTUFORjs7SUFETTs7MkJBU1IsZ0JBQUEsR0FBa0IsU0FBQyxLQUFEO0FBQ2hCLFVBQUE7TUFBQSxJQUFHLElBQUMsQ0FBQSxvQkFBRCxDQUFzQixLQUF0QixDQUFBLElBQWdDLElBQUMsQ0FBQSwrQkFBRCxDQUFpQyxLQUFqQyxDQUFuQztlQUNFLEtBREY7T0FBQSxNQUFBO1FBR0UsU0FBQSxHQUFZLEtBQUssQ0FBQyxTQUFOLENBQWdCLENBQUMsQ0FBRCxFQUFJLENBQUMsQ0FBTCxDQUFoQjtRQUNaLFVBQUEsR0FBYSxLQUFLLENBQUMsU0FBTixDQUFnQixDQUFDLENBQUQsRUFBSSxDQUFDLENBQUwsQ0FBaEI7ZUFDYixJQUFDLENBQUEsb0JBQUQsQ0FBc0IsU0FBdEIsQ0FBQSxJQUFxQyxJQUFDLENBQUEsb0JBQUQsQ0FBc0IsVUFBdEIsRUFMdkM7O0lBRGdCOzsyQkFRbEIsb0JBQUEsR0FBc0IsU0FBQyxLQUFEO0FBQ3BCLFVBQUE7TUFBQSxJQUFBLEdBQU8sb0JBQUEsQ0FBcUIsSUFBQyxDQUFBLE1BQXRCLEVBQThCLEtBQUssQ0FBQyxrQkFBTixDQUF5QixLQUF6QixFQUFnQyxDQUFoQyxFQUFtQyxDQUFuQyxDQUE5QjthQUNQLGNBQUEsSUFBVSxJQUFJLENBQUMsSUFBTCxDQUFVLElBQVY7SUFGVTs7MkJBSXRCLCtCQUFBLEdBQWlDLFNBQUMsS0FBRDtNQUcvQixJQUFHLElBQUMsQ0FBQSxNQUFELENBQVEsUUFBUixDQUFBLElBQXNCLCtCQUFBLENBQWdDLElBQUMsQ0FBQSxNQUFqQyxFQUF5QyxLQUF6QyxDQUF6QjtlQUNFLE1BREY7T0FBQSxNQUFBO2VBR0UsS0FBSyxDQUFDLE9BQU4sQ0FBYyxJQUFDLENBQUEsTUFBTSxDQUFDLGtCQUFSLENBQTJCLEtBQTNCLENBQWQsQ0FBQSxJQUNFLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBTixLQUFhLENBQWQsQ0FBQSxJQUFvQixDQUFDLEtBQUssQ0FBQyxHQUFOLEtBQWEsSUFBQyxDQUFBLG1CQUFELENBQUEsQ0FBZCxDQUFyQixFQUpKOztJQUgrQjs7OztLQTNDUjs7RUFvRHJCOzs7Ozs7O0lBQ0osY0FBQyxDQUFBLE1BQUQsQ0FBQTs7SUFDQSxjQUFDLENBQUEsV0FBRCxHQUFjOzs2QkFDZCxTQUFBLEdBQVc7Ozs7S0FIZ0I7O0VBT3ZCOzs7Ozs7O0lBQ0osY0FBQyxDQUFBLE1BQUQsQ0FBQTs7NkJBQ0EsU0FBQSxHQUFXOzs2QkFFWCxRQUFBLEdBQVUsU0FBQyxPQUFELEVBQVUsSUFBVjtBQUNSLFVBQUE7TUFBQSxTQUFBLEdBQVk7TUFDWixLQUFBLEdBQVE7TUFDUixNQUFBLEdBQVMsSUFBQyxDQUFBLHVCQUFELENBQXlCLElBQUMsQ0FBQSxNQUExQjtNQUVULElBQUMsQ0FBQSxXQUFELENBQWEsT0FBYixFQUFzQjtRQUFDLE1BQUEsSUFBRDtPQUF0QixFQUE4QixTQUFDLEdBQUQ7QUFDNUIsWUFBQTtRQUQ4QixtQkFBTywyQkFBVztRQUNoRCxTQUFBLEdBQVk7UUFFWixJQUFVLFNBQUEsS0FBYSxFQUFiLElBQW9CLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBWixLQUF3QixDQUF0RDtBQUFBLGlCQUFBOztRQUNBLElBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxhQUFaLENBQTBCLElBQTFCLENBQUg7VUFDRSxLQUFBLEdBQVE7aUJBQ1IsSUFBQSxDQUFBLEVBRkY7O01BSjRCLENBQTlCO01BUUEsSUFBRyxLQUFIO1FBQ0UsS0FBQSxHQUFRLFNBQVMsQ0FBQztRQUNsQixJQUFHLCtCQUFBLENBQWdDLElBQUMsQ0FBQSxNQUFqQyxFQUF5QyxLQUF6QyxDQUFBLElBQW9ELENBQUksS0FBSyxDQUFDLE9BQU4sQ0FBYyxNQUFkLENBQTNEO2lCQUNFLEtBQUssQ0FBQyxRQUFOLENBQWUsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFmLEVBREY7U0FBQSxNQUFBO2lCQUdFLE1BSEY7U0FGRjtPQUFBLE1BQUE7b0ZBT21CLEtBUG5COztJQWJROzs2QkFnQ1YsVUFBQSxHQUFZLFNBQUMsTUFBRDtBQUNWLFVBQUE7TUFBQSxjQUFBLEdBQWlCLE1BQU0sQ0FBQyxpQkFBUCxDQUFBO01BQ2pCLElBQVUscUJBQUEsQ0FBc0IsSUFBQyxDQUFBLE1BQXZCLEVBQStCLGNBQS9CLENBQVY7QUFBQSxlQUFBOztNQUNBLGVBQUEsR0FBa0IsbUJBQUEsQ0FBb0IsSUFBQyxDQUFBLE1BQXJCLEVBQTZCLGNBQTdCO01BRWxCLGtDQUFBLEdBQXFDLElBQUMsQ0FBQSxrQ0FBRCxDQUFBO2FBQ3JDLElBQUMsQ0FBQSxvQkFBRCxDQUFzQixNQUF0QixFQUE4QixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsR0FBRDtBQUM1QixjQUFBO1VBRDhCLFVBQUQ7VUFDN0IsY0FBQSxHQUFpQixNQUFNLENBQUMsaUJBQVAsQ0FBQTtVQUNqQixJQUFHLFVBQUEsQ0FBVyxLQUFDLENBQUEsTUFBWixFQUFvQixjQUFjLENBQUMsR0FBbkMsQ0FBQSxJQUE0QyxrQ0FBL0M7WUFDRSxLQUFBLEdBQVEsY0FBYyxDQUFDLFFBQWYsQ0FBd0IsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUF4QixFQURWO1dBQUEsTUFBQTtZQUdFLE9BQUEsNkNBQXVCLE1BQU0sQ0FBQyxVQUFQLENBQUE7WUFDdkIsS0FBQSxHQUFRLEtBQUMsQ0FBQSxRQUFELENBQVUsT0FBVixFQUFtQixjQUFuQjtZQUNSLElBQUcsT0FBQSxJQUFZLGtDQUFmO2NBQ0UsSUFBRyxLQUFDLENBQUEsUUFBUSxDQUFDLEVBQVYsQ0FBYSxRQUFiLENBQUEsSUFBMkIsQ0FBQyxDQUFJLGVBQUwsQ0FBOUI7Z0JBQ0UsS0FBQSxHQUFRLE1BQU0sQ0FBQyxpQ0FBUCxDQUF5QztrQkFBRSxXQUFELEtBQUMsQ0FBQSxTQUFGO2lCQUF6QyxFQURWO2VBQUEsTUFBQTtnQkFHRSxLQUFBLEdBQVEsS0FBSyxDQUFDLEdBQU4sQ0FBVSxLQUFWLEVBQWlCLHdCQUFBLENBQXlCLEtBQUMsQ0FBQSxNQUExQixFQUFrQyxjQUFjLENBQUMsR0FBakQsQ0FBakIsRUFIVjtlQURGO2FBTEY7O2lCQVVBLE1BQU0sQ0FBQyxpQkFBUCxDQUF5QixLQUF6QjtRQVo0QjtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBOUI7SUFOVTs7OztLQXBDZTs7RUF5RHZCOzs7Ozs7O0lBQ0osa0JBQUMsQ0FBQSxNQUFELENBQUE7O2lDQUNBLFNBQUEsR0FBVzs7aUNBRVgsVUFBQSxHQUFZLFNBQUMsTUFBRDthQUNWLElBQUMsQ0FBQSxvQkFBRCxDQUFzQixNQUF0QixFQUE4QixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7QUFDNUIsY0FBQTtVQUFBLEtBQUEsR0FBUSxNQUFNLENBQUMsdUNBQVAsQ0FBK0M7WUFBRSxXQUFELEtBQUMsQ0FBQSxTQUFGO1dBQS9DO2lCQUNSLE1BQU0sQ0FBQyxpQkFBUCxDQUF5QixLQUF6QjtRQUY0QjtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBOUI7SUFEVTs7OztLQUptQjs7RUFTM0I7Ozs7Ozs7SUFDSixlQUFDLENBQUEsTUFBRCxDQUFBOzs4QkFDQSxTQUFBLEdBQVc7OzhCQUNYLFNBQUEsR0FBVzs7OEJBRVgsbUJBQUEsR0FBcUIsU0FBQyxNQUFEO0FBQ25CLFVBQUE7TUFBQSw2QkFBQSxDQUE4QixNQUE5QjtNQUNBLEtBQUEsR0FBUSxNQUFNLENBQUMsaUNBQVAsQ0FBeUM7UUFBRSxXQUFELElBQUMsQ0FBQSxTQUFGO09BQXpDLENBQXNELENBQUMsU0FBdkQsQ0FBaUUsQ0FBQyxDQUFELEVBQUksQ0FBQyxDQUFMLENBQWpFO01BQ1IsS0FBQSxHQUFRLEtBQUssQ0FBQyxHQUFOLENBQVUsS0FBVixFQUFpQixJQUFDLENBQUEsdUJBQUQsQ0FBQSxDQUFqQjthQUNSLE1BQU0sQ0FBQyxpQkFBUCxDQUF5QixLQUF6QjtJQUptQjs7OEJBTXJCLFVBQUEsR0FBWSxTQUFDLE1BQUQ7YUFDVixJQUFDLENBQUEsb0JBQUQsQ0FBc0IsTUFBdEIsRUFBOEIsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO0FBQzVCLGNBQUE7VUFBQSxhQUFBLEdBQWdCLE1BQU0sQ0FBQyxpQkFBUCxDQUFBO1VBQ2hCLEtBQUMsQ0FBQSxtQkFBRCxDQUFxQixNQUFyQjtVQUNBLElBQUcsYUFBYSxDQUFDLE9BQWQsQ0FBc0IsTUFBTSxDQUFDLGlCQUFQLENBQUEsQ0FBdEIsQ0FBSDtZQUVFLE1BQU0sQ0FBQyxTQUFQLENBQUE7bUJBQ0EsS0FBQyxDQUFBLG1CQUFELENBQXFCLE1BQXJCLEVBSEY7O1FBSDRCO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE5QjtJQURVOzs7O0tBWGdCOztFQXFCeEI7Ozs7Ozs7SUFDSix1QkFBQyxDQUFBLE1BQUQsQ0FBQTs7c0NBQ0EsU0FBQSxHQUFXOztzQ0FFWCxVQUFBLEdBQVksU0FBQyxNQUFEO0FBQ1YsVUFBQTtNQUFBLEtBQUEsR0FBUSxJQUFDLENBQUEsUUFBRCxDQUFBO01BQ1IsU0FBQSxHQUFZLE1BQU0sQ0FBQyx5QkFBUCxDQUFBO01BQ1osY0FBQSxHQUFpQixNQUFNLENBQUMsaUJBQVAsQ0FBQTtNQUdqQixJQUFHLGNBQWMsQ0FBQyxhQUFmLENBQTZCLFNBQVMsQ0FBQyxLQUF2QyxDQUFBLElBQWtELGNBQWMsQ0FBQyxVQUFmLENBQTBCLFNBQVMsQ0FBQyxHQUFwQyxDQUFyRDtRQUNFLEtBQUEsSUFBUyxFQURYOztBQUdBLFdBQUksNkVBQUo7UUFDRSxLQUFBLEdBQVEsTUFBTSxDQUFDLHVDQUFQLENBQStDO1VBQUUsV0FBRCxJQUFDLENBQUEsU0FBRjtTQUEvQztRQUNSLE1BQU0sQ0FBQyxpQkFBUCxDQUF5QixLQUF6QjtBQUZGO01BSUEsSUFBQyxDQUFBLG1CQUFELENBQXFCLE1BQXJCO01BQ0EsSUFBRyxNQUFNLENBQUMsaUJBQVAsQ0FBQSxDQUEwQixDQUFDLG9CQUEzQixDQUFnRCxjQUFoRCxDQUFIO2VBQ0UsTUFBTSxDQUFDLGlCQUFQLENBQXlCLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBekIsRUFERjs7SUFkVTs7c0NBaUJaLG1CQUFBLEdBQXFCLFNBQUMsTUFBRDtBQUNuQixVQUFBO01BQUEsS0FBQSxHQUFRLE1BQU0sQ0FBQyxpQ0FBUCxDQUF5QztRQUFFLFdBQUQsSUFBQyxDQUFBLFNBQUY7T0FBekMsQ0FBc0QsQ0FBQyxTQUF2RCxDQUFpRSxDQUFDLENBQUQsRUFBSSxDQUFDLENBQUwsQ0FBakU7TUFDUixLQUFBLEdBQVEsS0FBSyxDQUFDLEdBQU4sQ0FBVSxLQUFWLEVBQWlCLElBQUMsQ0FBQSx1QkFBRCxDQUFBLENBQWpCO2FBQ1IsTUFBTSxDQUFDLGlCQUFQLENBQXlCLEtBQXpCO0lBSG1COzs7O0tBckJlOztFQTRCaEM7Ozs7Ozs7SUFDSixtQkFBQyxDQUFBLE1BQUQsQ0FBQTs7a0NBQ0EsU0FBQSxHQUFXOzs7O0tBRnFCOztFQUk1Qjs7Ozs7OztJQUNKLHVCQUFDLENBQUEsTUFBRCxDQUFBOztzQ0FDQSxTQUFBLEdBQVc7Ozs7S0FGeUI7O0VBSWhDOzs7Ozs7O0lBQ0osb0JBQUMsQ0FBQSxNQUFELENBQUE7O21DQUNBLFNBQUEsR0FBVzs7OztLQUZzQjs7RUFLN0I7Ozs7Ozs7SUFDSiw0QkFBQyxDQUFBLE1BQUQsQ0FBQTs7MkNBQ0EsU0FBQSxHQUFXOzs7O0tBRjhCOztFQU1yQzs7Ozs7OztJQUNKLDBCQUFDLENBQUEsTUFBRCxDQUFBOztJQUNBLDBCQUFDLENBQUEsV0FBRCxHQUFjOzt5Q0FDZCxTQUFBLEdBQVc7Ozs7S0FINEI7O0VBS25DOzs7Ozs7O0lBQ0osOEJBQUMsQ0FBQSxNQUFELENBQUE7O0lBQ0EsOEJBQUMsQ0FBQSxXQUFELEdBQWM7OzZDQUNkLFNBQUEsR0FBVzs7OztLQUhnQzs7RUFLdkM7Ozs7Ozs7SUFDSiwyQkFBQyxDQUFBLE1BQUQsQ0FBQTs7SUFDQSwyQkFBQyxDQUFBLFdBQUQsR0FBYzs7MENBQ2QsU0FBQSxHQUFXOzs7O0tBSDZCOztFQU9wQzs7Ozs7OztJQUNKLG1CQUFDLENBQUEsTUFBRCxDQUFBOztJQUNBLG1CQUFDLENBQUEsV0FBRCxHQUFjOztrQ0FDZCxTQUFBLEdBQVc7Ozs7S0FIcUI7O0VBSzVCOzs7Ozs7O0lBQ0osdUJBQUMsQ0FBQSxNQUFELENBQUE7O0lBQ0EsdUJBQUMsQ0FBQSxXQUFELEdBQWM7O3NDQUNkLFNBQUEsR0FBVzs7OztLQUh5Qjs7RUFLaEM7Ozs7Ozs7SUFDSixvQkFBQyxDQUFBLE1BQUQsQ0FBQTs7SUFDQSxvQkFBQyxDQUFBLFdBQUQsR0FBYzs7bUNBQ2QsU0FBQSxHQUFXOzs7O0tBSHNCOztFQU83Qjs7Ozs7OztJQUNKLGlCQUFDLENBQUEsTUFBRCxDQUFBOztnQ0FDQSxVQUFBLEdBQVksU0FBQyxNQUFEO01BQ1YsSUFBQyxDQUFBLFNBQUQsR0FBYSxNQUFNLENBQUMsYUFBUCxDQUFBO2FBQ2IsbURBQUEsU0FBQTtJQUZVOzs7O0tBRmtCOztFQU0xQjs7Ozs7OztJQUNKLHFCQUFDLENBQUEsTUFBRCxDQUFBOztvQ0FDQSxVQUFBLEdBQVksU0FBQyxNQUFEO01BQ1YsSUFBQyxDQUFBLFNBQUQsR0FBYSxNQUFNLENBQUMsYUFBUCxDQUFBO2FBQ2IsdURBQUEsU0FBQTtJQUZVOzs7O0tBRnNCOztFQU05Qjs7Ozs7OztJQUNKLGtCQUFDLENBQUEsTUFBRCxDQUFBOztpQ0FDQSxVQUFBLEdBQVksU0FBQyxNQUFEO01BQ1YsSUFBQyxDQUFBLFNBQUQsR0FBYSxNQUFNLENBQUMsYUFBUCxDQUFBO2FBQ2Isb0RBQUEsU0FBQTtJQUZVOzs7O0tBRm1COztFQWMzQjs7Ozs7OztJQUNKLGtCQUFDLENBQUEsTUFBRCxDQUFBOztpQ0FDQSxJQUFBLEdBQU07O2lDQUNOLGFBQUEsR0FBZTs7aUNBQ2YsU0FBQSxHQUFXOztpQ0FFWCxVQUFBLEdBQVksU0FBQyxNQUFEO2FBQ1YsSUFBQyxDQUFBLG9CQUFELENBQXNCLE1BQXRCLEVBQThCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtpQkFDNUIsS0FBQyxDQUFBLHVCQUFELENBQXlCLE1BQXpCLEVBQWlDLEtBQUMsQ0FBQSxRQUFELENBQVUsTUFBTSxDQUFDLGlCQUFQLENBQUEsQ0FBVixDQUFqQztRQUQ0QjtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBOUI7SUFEVTs7aUNBSVosUUFBQSxHQUFVLFNBQUMsU0FBRDtNQUNSLElBQUcsSUFBQyxDQUFBLFNBQUQsS0FBYyxNQUFqQjtlQUNFLElBQUMsQ0FBQSxzQkFBRCxDQUF3QixTQUF4QixFQURGO09BQUEsTUFFSyxJQUFHLElBQUMsQ0FBQSxTQUFELEtBQWMsVUFBakI7ZUFDSCxJQUFDLENBQUEsMEJBQUQsQ0FBNEIsU0FBNUIsRUFERzs7SUFIRzs7aUNBTVYsVUFBQSxHQUFZLFNBQUMsR0FBRDthQUNWLElBQUMsQ0FBQSxNQUFNLENBQUMsZ0JBQVIsQ0FBeUIsR0FBekI7SUFEVTs7aUNBR1osc0JBQUEsR0FBd0IsU0FBQyxJQUFEO0FBQ3RCLFVBQUE7TUFBQSxVQUFBLEdBQWE7TUFDYixJQUFDLENBQUEsV0FBRCxDQUFhLElBQUMsQ0FBQSxhQUFkLEVBQTZCO1FBQUMsTUFBQSxJQUFEO09BQTdCLEVBQXFDLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxHQUFEO0FBQ25DLGNBQUE7VUFEcUMsbUJBQU8sMkJBQVcsbUJBQU87VUFDOUQsSUFBRyxnQkFBSDtZQUNFLE9BQXFCLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFiLEVBQWtCLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBNUIsQ0FBckIsRUFBQyxrQkFBRCxFQUFXO1lBQ1gsSUFBVSxLQUFDLENBQUEsWUFBRCxJQUFrQixLQUFDLENBQUEsVUFBRCxDQUFZLE1BQVosQ0FBNUI7QUFBQSxxQkFBQTs7WUFDQSxJQUFHLEtBQUMsQ0FBQSxVQUFELENBQVksUUFBWixDQUFBLEtBQTJCLEtBQUMsQ0FBQSxVQUFELENBQVksTUFBWixDQUE5QjtjQUNFLFVBQUEsR0FBYSxLQUFDLENBQUEscUNBQUQsQ0FBdUMsTUFBdkMsRUFEZjthQUhGO1dBQUEsTUFBQTtZQU1FLFVBQUEsR0FBYSxLQUFLLENBQUMsSUFOckI7O1VBT0EsSUFBVSxrQkFBVjttQkFBQSxJQUFBLENBQUEsRUFBQTs7UUFSbUM7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXJDO2tDQVNBLGFBQWEsSUFBQyxDQUFBLHVCQUFELENBQUE7SUFYUzs7aUNBYXhCLDBCQUFBLEdBQTRCLFNBQUMsSUFBRDtBQUMxQixVQUFBO01BQUEsVUFBQSxHQUFhO01BQ2IsSUFBQyxDQUFBLFlBQUQsQ0FBYyxJQUFDLENBQUEsYUFBZixFQUE4QjtRQUFDLE1BQUEsSUFBRDtPQUE5QixFQUFzQyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsR0FBRDtBQUNwQyxjQUFBO1VBRHNDLG1CQUFPLG1CQUFPLGlCQUFNO1VBQzFELElBQUcsZ0JBQUg7WUFDRSxPQUFxQixDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBYixFQUFrQixLQUFLLENBQUMsR0FBRyxDQUFDLEdBQTVCLENBQXJCLEVBQUMsa0JBQUQsRUFBVztZQUNYLElBQUcsQ0FBSSxLQUFDLENBQUEsVUFBRCxDQUFZLE1BQVosQ0FBSixJQUE0QixLQUFDLENBQUEsVUFBRCxDQUFZLFFBQVosQ0FBL0I7Y0FDRSxLQUFBLEdBQVEsS0FBQyxDQUFBLHFDQUFELENBQXVDLE1BQXZDO2NBQ1IsSUFBRyxLQUFLLENBQUMsVUFBTixDQUFpQixJQUFqQixDQUFIO2dCQUNFLFVBQUEsR0FBYSxNQURmO2VBQUEsTUFBQTtnQkFHRSxJQUFVLEtBQUMsQ0FBQSxZQUFYO0FBQUEseUJBQUE7O2dCQUNBLFVBQUEsR0FBYSxLQUFDLENBQUEscUNBQUQsQ0FBdUMsUUFBdkMsRUFKZjtlQUZGO2FBRkY7V0FBQSxNQUFBO1lBVUUsSUFBRyxLQUFLLENBQUMsR0FBRyxDQUFDLFVBQVYsQ0FBcUIsSUFBckIsQ0FBSDtjQUNFLFVBQUEsR0FBYSxLQUFLLENBQUMsSUFEckI7YUFWRjs7VUFZQSxJQUFVLGtCQUFWO21CQUFBLElBQUEsQ0FBQSxFQUFBOztRQWJvQztNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBdEM7a0NBY0EsYUFBYSxDQUFDLENBQUQsRUFBSSxDQUFKO0lBaEJhOzs7O0tBaENHOztFQWtEM0I7Ozs7Ozs7SUFDSixzQkFBQyxDQUFBLE1BQUQsQ0FBQTs7cUNBQ0EsU0FBQSxHQUFXOzs7O0tBRndCOztFQUkvQjs7Ozs7OztJQUNKLDhCQUFDLENBQUEsTUFBRCxDQUFBOzs2Q0FDQSxZQUFBLEdBQWM7Ozs7S0FGNkI7O0VBSXZDOzs7Ozs7O0lBQ0osa0NBQUMsQ0FBQSxNQUFELENBQUE7O2lEQUNBLFlBQUEsR0FBYzs7OztLQUZpQzs7RUFNM0M7Ozs7Ozs7SUFDSixtQkFBQyxDQUFBLE1BQUQsQ0FBQTs7a0NBQ0EsSUFBQSxHQUFNOztrQ0FDTixTQUFBLEdBQVc7O2tDQUVYLFVBQUEsR0FBWSxTQUFDLE1BQUQ7YUFDVixJQUFDLENBQUEsb0JBQUQsQ0FBc0IsTUFBdEIsRUFBOEIsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO2lCQUM1QixLQUFDLENBQUEsdUJBQUQsQ0FBeUIsTUFBekIsRUFBaUMsS0FBQyxDQUFBLFFBQUQsQ0FBVSxNQUFNLENBQUMsaUJBQVAsQ0FBQSxDQUFWLENBQWpDO1FBRDRCO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE5QjtJQURVOztrQ0FJWixRQUFBLEdBQVUsU0FBQyxTQUFEO0FBQ1IsVUFBQTtNQUFBLFFBQUEsR0FBVyxTQUFTLENBQUM7TUFDckIsZ0JBQUEsR0FBbUIsQ0FBSSxJQUFDLENBQUEsTUFBTSxDQUFDLGdCQUFSLENBQXlCLFFBQXpCO0FBQ3ZCOzs7O0FBQUEsV0FBQSxzQ0FBQTs7UUFDRSxJQUFHLElBQUMsQ0FBQSxNQUFNLENBQUMsZ0JBQVIsQ0FBeUIsR0FBekIsQ0FBSDtVQUNFLElBQTRCLGdCQUE1QjtBQUFBLG1CQUFXLElBQUEsS0FBQSxDQUFNLEdBQU4sRUFBVyxDQUFYLEVBQVg7V0FERjtTQUFBLE1BQUE7VUFHRSxnQkFBQSxHQUFtQixLQUhyQjs7QUFERjtBQU9BLGNBQU8sSUFBQyxDQUFBLFNBQVI7QUFBQSxhQUNPLFVBRFA7aUJBQzJCLElBQUEsS0FBQSxDQUFNLENBQU4sRUFBUyxDQUFUO0FBRDNCLGFBRU8sTUFGUDtpQkFFbUIsSUFBQyxDQUFBLHVCQUFELENBQUE7QUFGbkI7SUFWUTs7OztLQVRzQjs7RUF1QjVCOzs7Ozs7O0lBQ0osdUJBQUMsQ0FBQSxNQUFELENBQUE7O3NDQUNBLFNBQUEsR0FBVzs7OztLQUZ5Qjs7RUFNaEM7Ozs7Ozs7SUFDSixxQkFBQyxDQUFBLE1BQUQsQ0FBQTs7b0NBRUEsVUFBQSxHQUFZLFNBQUMsTUFBRDthQUNWLGVBQUEsQ0FBZ0IsTUFBaEIsRUFBd0IsQ0FBeEI7SUFEVTs7OztLQUhzQjs7RUFNOUI7Ozs7Ozs7SUFDSixZQUFDLENBQUEsTUFBRCxDQUFBOzsyQkFFQSxVQUFBLEdBQVksU0FBQyxNQUFEO2FBQ1YsZUFBQSxDQUFnQixNQUFoQixFQUF3QixJQUFDLENBQUEsUUFBRCxDQUFVLENBQUMsQ0FBWCxDQUF4QjtJQURVOzs7O0tBSGE7O0VBTXJCOzs7Ozs7O0lBQ0oseUJBQUMsQ0FBQSxNQUFELENBQUE7O3dDQUVBLFVBQUEsR0FBWSxTQUFDLE1BQUQ7QUFDVixVQUFBO01BQUEsR0FBQSxHQUFNLG9CQUFBLENBQXFCLElBQUMsQ0FBQSxNQUF0QixFQUE4QixNQUFNLENBQUMsWUFBUCxDQUFBLENBQUEsR0FBd0IsSUFBQyxDQUFBLFFBQUQsQ0FBVSxDQUFDLENBQVgsQ0FBdEQ7TUFDTixNQUFNLENBQUMsaUJBQVAsQ0FBeUIsQ0FBQyxHQUFELEVBQU0sS0FBTixDQUF6QjthQUNBLE1BQU0sQ0FBQyxVQUFQLEdBQW9CO0lBSFY7Ozs7S0FIMEI7O0VBUWxDOzs7Ozs7O0lBQ0osd0NBQUMsQ0FBQSxNQUFELENBQUE7O3VEQUNBLFNBQUEsR0FBVzs7dURBRVgsVUFBQSxHQUFZLFNBQUMsTUFBRDtBQUNWLFVBQUE7TUFBQSxLQUFBLEdBQVEsSUFBQyxDQUFBLFFBQUQsQ0FBVSxNQUFNLENBQUMsaUJBQVAsQ0FBQSxDQUFWO2FBQ1IsTUFBTSxDQUFDLGlCQUFQLENBQXlCLEtBQXpCO0lBRlU7O3VEQUlaLFFBQUEsR0FBVSxTQUFDLEdBQUQ7QUFDUixVQUFBO01BRFUsTUFBRDtNQUNULEdBQUEsR0FBTSxXQUFBLENBQVksR0FBQSxHQUFNLElBQUMsQ0FBQSxRQUFELENBQVUsQ0FBQyxDQUFYLENBQWxCLEVBQWlDO1FBQUEsR0FBQSxFQUFLLElBQUMsQ0FBQSxtQkFBRCxDQUFBLENBQUw7T0FBakM7TUFDTixLQUFBLEdBQVEsb0JBQUEsQ0FBcUIsSUFBQyxDQUFBLE1BQXRCLEVBQThCLE1BQTlCLEVBQXNDLEdBQXRDLEVBQTJDO1FBQUEsU0FBQSxFQUFXLFVBQVg7T0FBM0M7NEVBQ1csSUFBQSxLQUFBLENBQU0sR0FBTixFQUFXLENBQVg7SUFIWDs7OztLQVIyQzs7RUFnQmpEOzs7Ozs7O0lBQ0osMEJBQUMsQ0FBQSxNQUFELENBQUE7O3lDQUNBLFVBQUEsR0FBWSxTQUFDLE1BQUQ7QUFDVixVQUFBO01BQUEsS0FBQSxHQUFRLElBQUMsQ0FBQSxxQ0FBRCxDQUF1QyxNQUFNLENBQUMsWUFBUCxDQUFBLENBQXZDO2FBQ1IsSUFBQyxDQUFBLHVCQUFELENBQXlCLE1BQXpCLEVBQWlDLEtBQWpDO0lBRlU7Ozs7S0FGMkI7O0VBTW5DOzs7Ozs7O0lBQ0osNEJBQUMsQ0FBQSxNQUFELENBQUE7OzJDQUNBLElBQUEsR0FBTTs7MkNBQ04sVUFBQSxHQUFZLFNBQUMsTUFBRDtNQUNWLElBQUMsQ0FBQSxvQkFBRCxDQUFzQixNQUF0QixFQUE4QixTQUFBO0FBQzVCLFlBQUE7UUFBQSxLQUFBLEdBQVEsTUFBTSxDQUFDLGlCQUFQLENBQUE7UUFDUixJQUFPLEtBQUssQ0FBQyxHQUFOLEtBQWEsQ0FBcEI7aUJBQ0UsTUFBTSxDQUFDLGlCQUFQLENBQXlCLEtBQUssQ0FBQyxTQUFOLENBQWdCLENBQUMsQ0FBQyxDQUFGLEVBQUssQ0FBTCxDQUFoQixDQUF6QixFQURGOztNQUY0QixDQUE5QjthQUlBLDhEQUFBLFNBQUE7SUFMVTs7OztLQUg2Qjs7RUFVckM7Ozs7Ozs7SUFDSiw4QkFBQyxDQUFBLE1BQUQsQ0FBQTs7NkNBQ0EsSUFBQSxHQUFNOzs2Q0FDTixVQUFBLEdBQVksU0FBQyxNQUFEO01BQ1YsSUFBQyxDQUFBLG9CQUFELENBQXNCLE1BQXRCLEVBQThCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtBQUM1QixjQUFBO1VBQUEsS0FBQSxHQUFRLE1BQU0sQ0FBQyxpQkFBUCxDQUFBO1VBQ1IsSUFBTyxLQUFDLENBQUEsbUJBQUQsQ0FBQSxDQUFBLEtBQTBCLEtBQUssQ0FBQyxHQUF2QzttQkFDRSxNQUFNLENBQUMsaUJBQVAsQ0FBeUIsS0FBSyxDQUFDLFNBQU4sQ0FBZ0IsQ0FBQyxDQUFDLENBQUYsRUFBSyxDQUFMLENBQWhCLENBQXpCLEVBREY7O1FBRjRCO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE5QjthQUlBLGdFQUFBLFNBQUE7SUFMVTs7OztLQUgrQjs7RUFVdkM7Ozs7Ozs7SUFDSixpQ0FBQyxDQUFBLE1BQUQsQ0FBQTs7Z0RBQ0EsWUFBQSxHQUFjOztnREFDZCxRQUFBLEdBQVUsU0FBQTthQUFHLGlFQUFBLFNBQUEsQ0FBQSxHQUFRO0lBQVg7Ozs7S0FIb0M7O0VBTTFDOzs7Ozs7O0lBQ0osZUFBQyxDQUFBLE1BQUQsQ0FBQTs7OEJBQ0EsSUFBQSxHQUFNOzs4QkFDTixJQUFBLEdBQU07OzhCQUNOLGNBQUEsR0FBZ0I7OzhCQUNoQixxQkFBQSxHQUF1Qjs7OEJBRXZCLFVBQUEsR0FBWSxTQUFDLE1BQUQ7TUFDVixJQUFDLENBQUEsa0JBQUQsQ0FBb0IsTUFBcEIsRUFBNEIsb0JBQUEsQ0FBcUIsSUFBQyxDQUFBLE1BQXRCLEVBQThCLElBQUMsQ0FBQSxNQUFELENBQUEsQ0FBOUIsQ0FBNUI7YUFDQSxNQUFNLENBQUMsVUFBUCxDQUFrQjtRQUFBLE1BQUEsRUFBUSxJQUFSO09BQWxCO0lBRlU7OzhCQUlaLE1BQUEsR0FBUSxTQUFBO2FBQ04sSUFBQyxDQUFBLFFBQUQsQ0FBVSxDQUFDLENBQVg7SUFETTs7OztLQVhvQjs7RUFjeEI7Ozs7Ozs7SUFDSixrQkFBQyxDQUFBLE1BQUQsQ0FBUSxLQUFSOztpQ0FDQSxVQUFBLEdBQVksU0FBQyxNQUFEO0FBQ1YsVUFBQTtNQUFBLHNCQUFBLEdBQXlCLElBQUMsQ0FBQSxTQUFELENBQVcsOENBQVg7TUFDekIsS0FBQSxHQUFRLElBQUMsQ0FBQSxRQUFRLENBQUMsS0FBSyxDQUFDLDZCQUFoQixDQUE4QyxJQUFDLENBQUEsTUFBL0MsRUFBdUQsTUFBTSxDQUFDLFlBQVAsQ0FBQSxDQUF2RCxFQUE4RSxJQUFDLENBQUEsS0FBL0UsRUFBc0Y7UUFBQyx3QkFBQSxzQkFBRDtPQUF0RjthQUNSLElBQUMsQ0FBQSx1QkFBRCxDQUF5QixNQUF6QixFQUFpQyxLQUFqQztJQUhVOzs7O0tBRm1COztFQVEzQjs7Ozs7OztJQUNKLDJCQUFDLENBQUEsTUFBRCxDQUFBOzswQ0FDQSxLQUFBLEdBQU87Ozs7S0FGaUM7O0VBS3BDOzs7Ozs7O0lBQ0osZ0NBQUMsQ0FBQSxNQUFELENBQUE7OytDQUNBLEtBQUEsR0FBTzs7OztLQUZzQzs7RUFLekM7Ozs7Ozs7SUFDSiwrQkFBQyxDQUFBLE1BQUQsQ0FBQTs7OENBQ0EsS0FBQSxHQUFPOzs7O0tBRnFDOztFQUt4Qzs7Ozs7OztJQUNKLGNBQUMsQ0FBQSxNQUFELENBQUE7OzZCQUNBLFlBQUEsR0FBYzs7OztLQUZhOztFQUt2Qjs7Ozs7OztJQUNKLG1CQUFDLENBQUEsTUFBRCxDQUFBOztrQ0FFQSxNQUFBLEdBQVEsU0FBQTtBQUNOLFVBQUE7TUFBQSxPQUFBLEdBQVUsV0FBQSxDQUFZLElBQUMsQ0FBQSxRQUFELENBQUEsQ0FBWixFQUF5QjtRQUFBLEdBQUEsRUFBSyxHQUFMO09BQXpCO2FBQ1YsSUFBSSxDQUFDLEtBQUwsQ0FBVyxDQUFDLElBQUMsQ0FBQSxNQUFNLENBQUMsWUFBUixDQUFBLENBQUEsR0FBeUIsQ0FBMUIsQ0FBQSxHQUErQixDQUFDLE9BQUEsR0FBVSxHQUFYLENBQTFDO0lBRk07Ozs7S0FId0I7O0VBTzVCOzs7Ozs7O0lBQ0osa0JBQUMsQ0FBQSxNQUFELENBQVEsS0FBUjs7aUNBQ0EsSUFBQSxHQUFNOztpQ0FDTixxQkFBQSxHQUF1Qjs7aUNBRXZCLFVBQUEsR0FBWSxTQUFDLE1BQUQ7QUFDVixVQUFBO01BQUEsR0FBQSxHQUFNLElBQUMsQ0FBQSxtQkFBRCxDQUFxQixNQUFNLENBQUMsWUFBUCxDQUFBLENBQXJCO01BRU4sS0FBQSxHQUFRLElBQUMsQ0FBQSxRQUFELENBQVUsQ0FBQyxDQUFYO0FBQ1IsYUFBTyxLQUFBLEdBQVEsQ0FBZjtRQUNFLEdBQUEsR0FBTSxJQUFDLENBQUEsbUJBQUQsQ0FBcUIsR0FBQSxHQUFNLENBQTNCO1FBQ04sS0FBQTtNQUZGO2FBSUEsWUFBQSxDQUFhLE1BQWIsRUFBcUIsR0FBckI7SUFSVTs7OztLQUxtQjs7RUFlM0I7Ozs7Ozs7SUFDSiw0QkFBQyxDQUFBLE1BQUQsQ0FBUSxLQUFSOzsyQ0FFQSxRQUFBLEdBQVUsU0FBQTthQUNSLFdBQUEsQ0FBWSw0REFBQSxTQUFBLENBQVosRUFBbUI7UUFBQSxHQUFBLEVBQUssQ0FBTDtPQUFuQjtJQURROzs7O0tBSCtCOztFQVNyQzs7Ozs7OztJQUNKLGlCQUFDLENBQUEsTUFBRCxDQUFBOztnQ0FDQSxJQUFBLEdBQU07O2dDQUNOLElBQUEsR0FBTTs7Z0NBQ04sU0FBQSxHQUFXOztnQ0FDWCxZQUFBLEdBQWM7O2dDQUNkLGNBQUEsR0FBZ0I7O2dDQUVoQixVQUFBLEdBQVksU0FBQyxNQUFEO0FBQ1YsVUFBQTtNQUFBLFNBQUEsR0FBWSxJQUFDLENBQUEsTUFBTSxDQUFDLHFCQUFSLENBQThCLElBQUMsQ0FBQSxZQUFELENBQUEsQ0FBOUI7YUFDWixJQUFDLENBQUEsa0JBQUQsQ0FBb0IsTUFBcEIsRUFBNEIsU0FBNUI7SUFGVTs7Z0NBSVosWUFBQSxHQUFjLFNBQUE7TUFDWixJQUFHLElBQUMsQ0FBQSxrQ0FBRCxDQUFBLENBQUg7ZUFDRSxFQURGO09BQUEsTUFBQTtlQUdFLElBQUMsQ0FBQSxVQUhIOztJQURZOztnQ0FNZCxZQUFBLEdBQWMsU0FBQTtBQUNaLFVBQUE7TUFBQSxRQUFBLEdBQVcsd0JBQUEsQ0FBeUIsSUFBQyxDQUFBLE1BQTFCO01BQ1gsTUFBQSxHQUFTLElBQUMsQ0FBQSxZQUFELENBQUE7TUFDVCxJQUFjLFFBQUEsS0FBWSxDQUExQjtRQUFBLE1BQUEsR0FBUyxFQUFUOztNQUNBLE1BQUEsR0FBUyxXQUFBLENBQVksSUFBQyxDQUFBLFFBQUQsQ0FBVSxDQUFDLENBQVgsQ0FBWixFQUEyQjtRQUFBLEdBQUEsRUFBSyxNQUFMO09BQTNCO2FBQ1QsUUFBQSxHQUFXO0lBTEM7Ozs7S0FsQmdCOztFQTBCMUI7Ozs7Ozs7SUFDSixvQkFBQyxDQUFBLE1BQUQsQ0FBQTs7bUNBQ0EsWUFBQSxHQUFjLFNBQUE7QUFDWixVQUFBO01BQUEsUUFBQSxHQUFXLHdCQUFBLENBQXlCLElBQUMsQ0FBQSxNQUExQjtNQUNYLE1BQUEsR0FBUyxXQUFBLENBQVksSUFBQyxDQUFBLE1BQU0sQ0FBQyx1QkFBUixDQUFBLENBQVosRUFBK0M7UUFBQSxHQUFBLEVBQUssSUFBQyxDQUFBLG1CQUFELENBQUEsQ0FBTDtPQUEvQzthQUNULFFBQUEsR0FBVyxJQUFJLENBQUMsS0FBTCxDQUFXLENBQUMsTUFBQSxHQUFTLFFBQVYsQ0FBQSxHQUFzQixDQUFqQztJQUhDOzs7O0tBRm1COztFQVE3Qjs7Ozs7OztJQUNKLG9CQUFDLENBQUEsTUFBRCxDQUFBOzttQ0FDQSxZQUFBLEdBQWMsU0FBQTtBQU1aLFVBQUE7TUFBQSxnQkFBQSxHQUFtQixJQUFDLENBQUEsbUJBQUQsQ0FBQTtNQUNuQixHQUFBLEdBQU0sV0FBQSxDQUFZLElBQUMsQ0FBQSxNQUFNLENBQUMsdUJBQVIsQ0FBQSxDQUFaLEVBQStDO1FBQUEsR0FBQSxFQUFLLGdCQUFMO09BQS9DO01BQ04sTUFBQSxHQUFTLElBQUMsQ0FBQSxZQUFELENBQUEsQ0FBQSxHQUFrQjtNQUMzQixJQUFjLEdBQUEsS0FBTyxnQkFBckI7UUFBQSxNQUFBLEdBQVMsRUFBVDs7TUFDQSxNQUFBLEdBQVMsV0FBQSxDQUFZLElBQUMsQ0FBQSxRQUFELENBQVUsQ0FBQyxDQUFYLENBQVosRUFBMkI7UUFBQSxHQUFBLEVBQUssTUFBTDtPQUEzQjthQUNULEdBQUEsR0FBTTtJQVhNOzs7O0tBRm1COztFQW9CN0I7Ozs7Ozs7SUFDSixNQUFDLENBQUEsTUFBRCxDQUFRLEtBQVI7O3FCQUNBLGNBQUEsR0FBZ0I7O3FCQUVoQixxQkFBQSxHQUF1QixTQUFBO01BQ3JCLElBQUcsSUFBSSxDQUFDLEdBQUwsQ0FBUyxJQUFDLENBQUEsWUFBVixDQUFBLEtBQTJCLENBQTlCO2VBQ0UsSUFBQyxDQUFBLFNBQUQsQ0FBVyxnQ0FBWCxFQURGO09BQUEsTUFBQTtlQUdFLElBQUMsQ0FBQSxTQUFELENBQVcsZ0NBQVgsRUFIRjs7SUFEcUI7O3FCQU12QixzQkFBQSxHQUF3QixTQUFBO01BQ3RCLElBQUcsSUFBSSxDQUFDLEdBQUwsQ0FBUyxJQUFDLENBQUEsWUFBVixDQUFBLEtBQTJCLENBQTlCO2VBQ0UsSUFBQyxDQUFBLFNBQUQsQ0FBVyx3Q0FBWCxFQURGO09BQUEsTUFBQTtlQUdFLElBQUMsQ0FBQSxTQUFELENBQVcsd0NBQVgsRUFIRjs7SUFEc0I7O3FCQU14QiwwQkFBQSxHQUE0QixTQUFDLEdBQUQ7QUFDMUIsVUFBQTtNQUFBLEtBQUEsR0FBWSxJQUFBLEtBQUEsQ0FBTSxHQUFOLEVBQVcsQ0FBWDthQUNaLElBQUMsQ0FBQSxNQUFNLENBQUMsT0FBTyxDQUFDLHVCQUFoQixDQUE0QyxJQUFBLEtBQUEsQ0FBTSxLQUFOLEVBQWEsS0FBYixDQUE1QyxDQUFnRSxDQUFDO0lBRnZDOztxQkFJNUIsWUFBQSxHQUFjLFNBQUMsT0FBRCxFQUFVLEtBQVYsRUFBaUIsSUFBakI7QUFDWixVQUFBO01BQUEsWUFBQSxHQUFlO1FBQUMsR0FBQSxFQUFLLElBQUMsQ0FBQSwwQkFBRCxDQUE0QixPQUE1QixDQUFOOztNQUNmLFVBQUEsR0FBYTtRQUFDLEdBQUEsRUFBSyxJQUFDLENBQUEsMEJBQUQsQ0FBNEIsS0FBNUIsQ0FBTjs7TUFJYixJQUFBLEdBQU8sQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLE1BQUQ7VUFDTCxJQUFHLHNDQUFIO1lBQ0UsS0FBQyxDQUFBLE1BQU0sQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLFlBQTFCLENBQXVDLE1BQXZDO21CQUNBLEtBQUMsQ0FBQSxNQUFNLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxVQUExQixDQUFBLEVBRkY7O1FBREs7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBO01BS1AsUUFBQSxHQUFXLElBQUMsQ0FBQSxzQkFBRCxDQUFBO2FBQ1gsSUFBQyxDQUFBLFFBQVEsQ0FBQyxzQkFBVixDQUFpQyxZQUFqQyxFQUErQyxVQUEvQyxFQUEyRDtRQUFDLFVBQUEsUUFBRDtRQUFXLE1BQUEsSUFBWDtRQUFpQixNQUFBLElBQWpCO09BQTNEO0lBWlk7O3FCQWNkLGVBQUEsR0FBaUIsU0FBQTthQUNmLElBQUksQ0FBQyxJQUFMLENBQVUsSUFBQyxDQUFBLFlBQUQsR0FBZ0IsSUFBQyxDQUFBLE1BQU0sQ0FBQyxjQUFSLENBQUEsQ0FBaEIsR0FBMkMsSUFBQyxDQUFBLFFBQUQsQ0FBQSxDQUFyRDtJQURlOztxQkFHakIsWUFBQSxHQUFjLFNBQUMsTUFBRDtBQUNaLFVBQUE7TUFBQSxTQUFBLEdBQVksb0JBQUEsQ0FBcUIsSUFBQyxDQUFBLE1BQXRCLEVBQThCLE1BQU0sQ0FBQyxZQUFQLENBQUEsQ0FBQSxHQUF3QixJQUFDLENBQUEsZUFBRCxDQUFBLENBQXREO2FBQ1osSUFBQyxDQUFBLE1BQU0sQ0FBQyxxQkFBUixDQUE4QixTQUE5QjtJQUZZOztxQkFJZCxVQUFBLEdBQVksU0FBQyxNQUFEO0FBQ1YsVUFBQTtNQUFBLFNBQUEsR0FBWSxJQUFDLENBQUEsWUFBRCxDQUFjLE1BQWQ7TUFDWixJQUFDLENBQUEsa0JBQUQsQ0FBb0IsTUFBcEIsRUFBNEIsSUFBQyxDQUFBLFlBQUQsQ0FBYyxNQUFkLENBQTVCLEVBQW1EO1FBQUEsVUFBQSxFQUFZLEtBQVo7T0FBbkQ7TUFFQSxJQUFHLE1BQU0sQ0FBQyxZQUFQLENBQUEsQ0FBSDtRQUNFLElBQUcsSUFBQyxDQUFBLHFCQUFELENBQUEsQ0FBSDtVQUNFLElBQUMsQ0FBQSxRQUFRLENBQUMscUJBQVYsQ0FBQSxFQURGOztRQUdBLHNCQUFBLEdBQXlCLElBQUMsQ0FBQSxNQUFNLENBQUMsd0JBQVIsQ0FBQTtRQUN6Qix5QkFBQSxHQUE0QixJQUFDLENBQUEsTUFBTSxDQUFDLHFCQUFSLENBQThCLHNCQUFBLEdBQXlCLElBQUMsQ0FBQSxlQUFELENBQUEsQ0FBdkQ7UUFDNUIseUJBQUEsR0FBNEIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxxQkFBUixDQUE4Qix5QkFBOUI7UUFDNUIsSUFBQSxHQUFPLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUE7QUFDTCxnQkFBQTtZQUFBLEtBQUMsQ0FBQSxNQUFNLENBQUMsd0JBQVIsQ0FBaUMseUJBQWpDO3lFQUd5QixDQUFFLFVBQTNCLENBQUE7VUFKSztRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUE7UUFNUCxJQUFHLElBQUMsQ0FBQSxxQkFBRCxDQUFBLENBQUg7aUJBQ0UsSUFBQyxDQUFBLFlBQUQsQ0FBYyxzQkFBZCxFQUFzQyx5QkFBdEMsRUFBaUUsSUFBakUsRUFERjtTQUFBLE1BQUE7aUJBR0UsSUFBQSxDQUFBLEVBSEY7U0FiRjs7SUFKVTs7OztLQXpDTzs7RUFpRWY7Ozs7Ozs7SUFDSixvQkFBQyxDQUFBLE1BQUQsQ0FBUSxJQUFSOzttQ0FDQSxZQUFBLEdBQWMsQ0FBQzs7OztLQUZrQjs7RUFLN0I7Ozs7Ozs7SUFDSixrQkFBQyxDQUFBLE1BQUQsQ0FBQTs7aUNBQ0EsWUFBQSxHQUFjLENBQUM7Ozs7S0FGZ0I7O0VBSzNCOzs7Ozs7O0lBQ0osb0JBQUMsQ0FBQSxNQUFELENBQUE7O21DQUNBLFlBQUEsR0FBYyxDQUFDLENBQUQsR0FBSzs7OztLQUZjOztFQUs3Qjs7Ozs7OztJQUNKLGtCQUFDLENBQUEsTUFBRCxDQUFBOztpQ0FDQSxZQUFBLEdBQWMsQ0FBQyxDQUFELEdBQUs7Ozs7S0FGWTs7RUFPM0I7Ozs7Ozs7SUFDSixJQUFDLENBQUEsTUFBRCxDQUFBOzttQkFDQSxTQUFBLEdBQVc7O21CQUNYLFNBQUEsR0FBVzs7bUJBQ1gsTUFBQSxHQUFROzttQkFDUixZQUFBLEdBQWM7O21CQUNkLG1CQUFBLEdBQXFCOzttQkFFckIsa0JBQUEsR0FBb0IsU0FBQTs7UUFDbEIsSUFBQyxDQUFBOzthQUNELElBQUMsQ0FBQSxtQkFBRCxHQUF1QjtJQUZMOzttQkFJcEIsZUFBQSxHQUFpQixTQUFBO01BQ2YsSUFBQyxDQUFBLGtCQUFELENBQUE7YUFDQSwyQ0FBQSxTQUFBO0lBRmU7O21CQUlqQixVQUFBLEdBQVksU0FBQTtBQUNWLFVBQUE7TUFBQSxzQ0FBQSxTQUFBO01BRUEsSUFBd0IsSUFBQyxDQUFBLFNBQUQsQ0FBVyx3QkFBWCxDQUF4QjtRQUFBLElBQUMsQ0FBQSxpQkFBRCxDQUFBLEVBQUE7O01BQ0EsSUFBVSxJQUFDLENBQUEsVUFBRCxDQUFBLENBQVY7QUFBQSxlQUFBOztNQUVBLFFBQUEsR0FBVyxJQUFDLENBQUEsU0FBRCxDQUFXLGNBQVg7TUFFWCxJQUFJLFFBQUEsR0FBVyxDQUFmO1FBQ0UsSUFBQyxDQUFBLG1CQUFELEdBQXVCLGVBQUEsQ0FBZ0IsSUFBQyxDQUFBLE1BQWpCO1FBRXZCLE9BQUEsR0FDRTtVQUFBLGtCQUFBLEVBQW9CLElBQUMsQ0FBQSxTQUFELENBQVcsc0JBQVgsQ0FBcEI7VUFDQSxTQUFBLEVBQVcsQ0FBQSxTQUFBLEtBQUE7bUJBQUEsU0FBQyxLQUFEO2NBQUMsS0FBQyxDQUFBLFFBQUQ7Y0FBVyxJQUFHLEtBQUMsQ0FBQSxLQUFKO3VCQUFlLEtBQUMsQ0FBQSxnQkFBRCxDQUFBLEVBQWY7ZUFBQSxNQUFBO3VCQUF3QyxLQUFDLENBQUEsZUFBRCxDQUFBLEVBQXhDOztZQUFaO1VBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQURYO1VBRUEsUUFBQSxFQUFVLENBQUEsU0FBQSxLQUFBO21CQUFBLFNBQUMsaUJBQUQ7Y0FBQyxLQUFDLENBQUEsb0JBQUQ7cUJBQXVCLEtBQUMsQ0FBQSx5QkFBRCxDQUEyQixLQUFDLENBQUEsaUJBQTVCLEVBQStDLGFBQS9DO1lBQXhCO1VBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUZWO1VBR0EsUUFBQSxFQUFVLENBQUEsU0FBQSxLQUFBO21CQUFBLFNBQUE7Y0FDUixLQUFDLENBQUEsUUFBUSxDQUFDLGFBQWEsQ0FBQyxZQUF4QixDQUFBO3FCQUNBLEtBQUMsQ0FBQSxlQUFELENBQUE7WUFGUTtVQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FIVjtVQU1BLFFBQUEsRUFDRTtZQUFBLHVDQUFBLEVBQXlDLENBQUEsU0FBQSxLQUFBO3FCQUFBLFNBQUE7dUJBQUcsS0FBQyxDQUFBLGdCQUFELENBQWtCLENBQUMsQ0FBbkI7Y0FBSDtZQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBekM7WUFDQSwyQ0FBQSxFQUE2QyxDQUFBLFNBQUEsS0FBQTtxQkFBQSxTQUFBO3VCQUFJLEtBQUMsQ0FBQSxnQkFBRCxDQUFrQixDQUFDLENBQW5CO2NBQUo7WUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBRDdDO1dBUEY7VUFKSjs7O1FBY0EsVUFBVzs7TUFDWCxPQUFPLENBQUMsT0FBUixHQUFrQjtNQUNsQixPQUFPLENBQUMsUUFBUixHQUFtQjthQUVuQixJQUFDLENBQUEsVUFBRCxDQUFZLE9BQVo7SUExQlU7O21CQTRCWixnQkFBQSxHQUFrQixTQUFDLEtBQUQ7QUFDaEIsVUFBQTtNQUFBLElBQUcsSUFBQyxDQUFBLGlCQUFELElBQXVCLElBQUMsQ0FBQSxTQUFELENBQVcsbUJBQVgsQ0FBMUI7UUFDRSxLQUFBLEdBQVEsSUFBQyxDQUFBLHlCQUFELENBQTJCLElBQUMsQ0FBQSxpQkFBNUIsRUFBK0MsYUFBL0MsRUFBOEQsSUFBQyxDQUFBLFFBQUQsQ0FBVSxDQUFDLENBQVgsQ0FBQSxHQUFnQixLQUE5RSxFQUFxRixJQUFyRjtlQUNSLElBQUMsQ0FBQSxLQUFELEdBQVMsS0FBQSxHQUFRLEVBRm5COztJQURnQjs7bUJBS2xCLGlCQUFBLEdBQW1CLFNBQUE7QUFDakIsVUFBQTtNQUFBLFdBQUEsR0FBYyxJQUFDLENBQUEsUUFBUSxDQUFDLFdBQVcsQ0FBQyxHQUF0QixDQUEwQixhQUExQjtNQUNkLHFCQUFBLFdBQXdCLElBQUMsQ0FBQSxRQUFRLENBQUMsY0FBYyxDQUFDLGtCQUF6QixDQUFBLEVBQUEsS0FBa0QsTUFBbEQsSUFBQSxJQUFBLEtBQTBELGVBQTFELElBQUEsSUFBQSxLQUEyRSxNQUEzRSxJQUFBLElBQUEsS0FBbUY7TUFDM0csSUFBRyxxQkFBQSxJQUFpQixxQkFBcEI7UUFDRSxJQUFDLENBQUEsS0FBRCxHQUFTLFdBQVcsQ0FBQztlQUNyQixJQUFDLENBQUEsUUFBRCxHQUFZLEtBRmQ7O0lBSGlCOzttQkFPbkIsV0FBQSxHQUFhLFNBQUE7YUFDWCxJQUFDLENBQUE7SUFEVTs7bUJBR2IsT0FBQSxHQUFTLFNBQUE7QUFDUCxVQUFBO01BQUEsbUNBQUEsU0FBQTtNQUNBLGNBQUEsR0FBaUI7TUFDakIsSUFBOEIsdUJBQUEsSUFBZSx1Q0FBYSxFQUFFLFVBQUYsRUFBVCxDQUFzQixZQUF0QixXQUFqRDtRQUFBLGNBQUEsSUFBa0IsUUFBbEI7O01BQ0EsSUFBQyxDQUFBLE1BQU0sQ0FBQyxTQUFTLENBQUMsb0JBQWxCLENBQUEsQ0FBd0MsQ0FBQyxJQUF6QyxDQUE4QyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7aUJBQzVDLEtBQUMsQ0FBQSx5QkFBRCxDQUEyQixLQUFDLENBQUEsS0FBNUIsRUFBbUMsY0FBbkM7UUFENEM7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTlDO0lBSk87O21CQVNULFFBQUEsR0FBVSxTQUFDLFNBQUQ7QUFDUixVQUFBO01BQUEsU0FBQSxHQUFZLElBQUMsQ0FBQSxNQUFNLENBQUMsdUJBQVIsQ0FBZ0MsU0FBUyxDQUFDLEdBQTFDO01BQ1osTUFBQSxHQUFTO01BQ1QsS0FBQSxHQUFRLElBQUMsQ0FBQSxRQUFELENBQVUsSUFBQyxDQUFBLEtBQVg7TUFDUixlQUFBLEdBQWtCLElBQUMsQ0FBQSxRQUFELENBQVUsQ0FBQyxDQUFYO01BRWxCLFdBQUEsR0FBa0IsSUFBQSxLQUFBLENBQU0sQ0FBTixFQUFZLElBQUMsQ0FBQSxXQUFELENBQUEsQ0FBSCxHQUF1QixJQUFDLENBQUEsTUFBeEIsR0FBb0MsQ0FBQyxJQUFDLENBQUEsTUFBL0M7TUFDbEIsSUFBeUQsSUFBQyxDQUFBLFFBQTFEO1FBQUEsU0FBQSxHQUFZLFNBQVMsQ0FBQyxTQUFWLENBQW9CLFdBQVcsQ0FBQyxNQUFaLENBQUEsQ0FBcEIsRUFBWjs7TUFFQSxJQUFHLElBQUMsQ0FBQSxXQUFELENBQUEsQ0FBSDtRQUNFLElBQWdDLElBQUMsQ0FBQSxTQUFELENBQVcsaUJBQVgsQ0FBaEM7VUFBQSxTQUFTLENBQUMsS0FBVixHQUFrQixLQUFLLENBQUMsS0FBeEI7O1FBQ0EsSUFBQyxDQUFBLE1BQU0sQ0FBQywwQkFBUixDQUFtQyxLQUFuQyxFQUEwQyxTQUExQyxFQUFxRCxTQUFDLEdBQUQ7QUFDbkQsY0FBQTtVQURxRCxtQkFBTztVQUM1RCxJQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsVUFBWixDQUF1QixTQUF2QixDQUFIO1lBQ0UsTUFBTSxDQUFDLElBQVAsQ0FBWSxLQUFLLENBQUMsS0FBbEI7WUFDQSxJQUFVLE1BQU0sQ0FBQyxNQUFQLEdBQWdCLGVBQTFCO3FCQUFBLElBQUEsQ0FBQSxFQUFBO2FBRkY7O1FBRG1ELENBQXJELEVBRkY7T0FBQSxNQUFBO1FBT0UsSUFBa0QsSUFBQyxDQUFBLFNBQUQsQ0FBVyxpQkFBWCxDQUFsRDtVQUFBLFNBQVMsQ0FBQyxHQUFWLEdBQWdCLElBQUMsQ0FBQSxNQUFNLENBQUMsb0JBQVIsQ0FBQSxFQUFoQjs7UUFDQSxJQUFDLENBQUEsTUFBTSxDQUFDLGlCQUFSLENBQTBCLEtBQTFCLEVBQWlDLFNBQWpDLEVBQTRDLFNBQUMsR0FBRDtBQUMxQyxjQUFBO1VBRDRDLG1CQUFPO1VBQ25ELElBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxhQUFaLENBQTBCLFNBQTFCLENBQUg7WUFDRSxNQUFNLENBQUMsSUFBUCxDQUFZLEtBQUssQ0FBQyxLQUFsQjtZQUNBLElBQVUsTUFBTSxDQUFDLE1BQVAsR0FBZ0IsZUFBMUI7cUJBQUEsSUFBQSxDQUFBLEVBQUE7YUFGRjs7UUFEMEMsQ0FBNUMsRUFSRjs7NERBYXVCLENBQUUsU0FBekIsQ0FBbUMsV0FBbkM7SUF0QlE7O21CQXdCVix5QkFBQSxHQUEyQixTQUFDLElBQUQsRUFBTyxjQUFQLEVBQXVCLEtBQXZCLEVBQThDLFdBQTlDOztRQUF1QixRQUFRLElBQUMsQ0FBQSxRQUFELENBQVUsQ0FBQyxDQUFYOzs7UUFBZSxjQUFjOztNQUNyRixJQUFBLENBQWMsSUFBQyxDQUFBLFNBQUQsQ0FBVyxtQkFBWCxDQUFkO0FBQUEsZUFBQTs7YUFDQSxJQUFDLENBQUEsUUFBUSxDQUFDLGFBQWEsQ0FBQyxtQkFBeEIsQ0FBNEMsSUFBQyxDQUFBLFFBQUQsQ0FBVSxJQUFWLENBQTVDLEVBQTZELGNBQTdELEVBQTZFLElBQUMsQ0FBQSxXQUFELENBQUEsQ0FBN0UsRUFBNkYsSUFBQyxDQUFBLE1BQTlGLEVBQXNHLEtBQXRHLEVBQTZHLFdBQTdHO0lBRnlCOzttQkFJM0IsVUFBQSxHQUFZLFNBQUMsTUFBRDtBQUNWLFVBQUE7TUFBQSxLQUFBLEdBQVEsSUFBQyxDQUFBLFFBQUQsQ0FBVSxNQUFNLENBQUMsaUJBQVAsQ0FBQSxDQUFWO01BQ1IsSUFBRyxhQUFIO1FBQ0UsTUFBTSxDQUFDLGlCQUFQLENBQXlCLEtBQXpCLEVBREY7T0FBQSxNQUFBO1FBR0UsSUFBQyxDQUFBLGtCQUFELENBQUEsRUFIRjs7TUFLQSxJQUFBLENBQTZDLElBQUMsQ0FBQSxRQUE5QztlQUFBLElBQUMsQ0FBQSxXQUFXLENBQUMsR0FBYixDQUFpQixhQUFqQixFQUFnQyxJQUFoQyxFQUFBOztJQVBVOzttQkFTWixRQUFBLEdBQVUsU0FBQyxJQUFEO0FBQ1IsVUFBQTtNQUFBLFNBQUEsR0FBZSxJQUFDLENBQUEsZUFBRCxDQUFpQixJQUFqQixDQUFILEdBQStCLEdBQS9CLEdBQXdDO2FBQ2hELElBQUEsTUFBQSxDQUFPLENBQUMsQ0FBQyxZQUFGLENBQWUsSUFBZixDQUFQLEVBQTZCLFNBQTdCO0lBRkk7Ozs7S0F6R087O0VBOEdiOzs7Ozs7O0lBQ0osYUFBQyxDQUFBLE1BQUQsQ0FBQTs7NEJBQ0EsU0FBQSxHQUFXOzs0QkFDWCxTQUFBLEdBQVc7Ozs7S0FIZTs7RUFNdEI7Ozs7Ozs7SUFDSixJQUFDLENBQUEsTUFBRCxDQUFBOzttQkFDQSxNQUFBLEdBQVE7O21CQUVSLFFBQUEsR0FBVSxTQUFBO01BQ1IsSUFBQyxDQUFBLEtBQUQsR0FBUyxvQ0FBQSxTQUFBO01BQ1QsSUFBQyxDQUFBLGFBQUQsR0FBaUI7QUFDakIsYUFBTyxJQUFDLENBQUE7SUFIQTs7OztLQUpPOztFQVViOzs7Ozs7O0lBQ0osYUFBQyxDQUFBLE1BQUQsQ0FBQTs7NEJBQ0EsU0FBQSxHQUFXOzs0QkFDWCxTQUFBLEdBQVc7Ozs7S0FIZTs7RUFRdEI7Ozs7Ozs7SUFDSixVQUFDLENBQUEsTUFBRCxDQUFBOzt5QkFDQSxJQUFBLEdBQU07O3lCQUNOLFlBQUEsR0FBYzs7eUJBQ2QsS0FBQSxHQUFPOzt5QkFFUCxVQUFBLEdBQVksU0FBQTtNQUNWLDRDQUFBLFNBQUE7TUFDQSxJQUFBLENBQW1CLElBQUMsQ0FBQSxVQUFELENBQUEsQ0FBbkI7ZUFBQSxJQUFDLENBQUEsUUFBRCxDQUFBLEVBQUE7O0lBRlU7O3lCQUlaLFFBQUEsR0FBVSxTQUFBO2FBQ1IsSUFBQyxDQUFBLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBZixDQUFtQixJQUFDLENBQUEsS0FBcEI7SUFEUTs7eUJBR1YsVUFBQSxHQUFZLFNBQUMsTUFBRDtBQUNWLFVBQUE7TUFBQSxJQUFHLEtBQUEsR0FBUSxJQUFDLENBQUEsUUFBRCxDQUFBLENBQVg7UUFDRSxNQUFNLENBQUMsaUJBQVAsQ0FBeUIsS0FBekI7ZUFDQSxNQUFNLENBQUMsVUFBUCxDQUFrQjtVQUFBLE1BQUEsRUFBUSxJQUFSO1NBQWxCLEVBRkY7O0lBRFU7Ozs7S0FiVzs7RUFtQm5COzs7Ozs7O0lBQ0osY0FBQyxDQUFBLE1BQUQsQ0FBQTs7NkJBQ0EsSUFBQSxHQUFNOzs2QkFFTixRQUFBLEdBQVUsU0FBQTtBQUNSLFVBQUE7TUFBQSxJQUFHLEtBQUEsR0FBUSw4Q0FBQSxTQUFBLENBQVg7ZUFDRSxJQUFDLENBQUEscUNBQUQsQ0FBdUMsS0FBSyxDQUFDLEdBQTdDLEVBREY7O0lBRFE7Ozs7S0FKaUI7O0VBVXZCOzs7Ozs7O0lBQ0osdUJBQUMsQ0FBQSxNQUFELENBQUE7O0lBQ0EsdUJBQUMsQ0FBQSxXQUFELEdBQWM7O3NDQUNkLElBQUEsR0FBTTs7c0NBQ04sS0FBQSxHQUFPOztzQ0FDUCxTQUFBLEdBQVc7O3NDQUVYLFVBQUEsR0FBWSxTQUFBO01BQ1YseURBQUEsU0FBQTtNQUNBLElBQUMsQ0FBQSxJQUFELEdBQVEsSUFBQyxDQUFBLFdBQUQsQ0FBYSxJQUFDLENBQUEsS0FBZDtNQUNSLElBQW1CLElBQUMsQ0FBQSxTQUFELEtBQWMsTUFBakM7ZUFBQSxJQUFDLENBQUEsSUFBSSxDQUFDLE9BQU4sQ0FBQSxFQUFBOztJQUhVOztzQ0FLWixXQUFBLEdBQWEsU0FBQyxLQUFEO0FBQ1gsVUFBQTtNQUFBLEtBQUEsR0FBVyxLQUFBLEtBQVMsT0FBWixHQUF5QixDQUF6QixHQUFnQztNQUN4QyxJQUFBLEdBQU8sb0JBQUEsQ0FBcUIsSUFBQyxDQUFBLE1BQXRCLENBQTZCLENBQUMsR0FBOUIsQ0FBa0MsU0FBQyxRQUFEO2VBQ3ZDLFFBQVMsQ0FBQSxLQUFBO01BRDhCLENBQWxDO2FBRVAsQ0FBQyxDQUFDLE1BQUYsQ0FBUyxDQUFDLENBQUMsSUFBRixDQUFPLElBQVAsQ0FBVCxFQUF1QixTQUFDLEdBQUQ7ZUFBUztNQUFULENBQXZCO0lBSlc7O3NDQU1iLFdBQUEsR0FBYSxTQUFDLE1BQUQ7QUFDWCxVQUFBO01BQUEsU0FBQSxHQUFZLE1BQU0sQ0FBQyxZQUFQLENBQUE7TUFDWixVQUFBO0FBQWEsZ0JBQU8sSUFBQyxDQUFBLFNBQVI7QUFBQSxlQUNOLE1BRE07bUJBQ00sU0FBQyxHQUFEO3FCQUFTLEdBQUEsR0FBTTtZQUFmO0FBRE4sZUFFTixNQUZNO21CQUVNLFNBQUMsR0FBRDtxQkFBUyxHQUFBLEdBQU07WUFBZjtBQUZOOzthQUdiLElBQUMsQ0FBQSxJQUFJLENBQUMsTUFBTixDQUFhLFVBQWI7SUFMVzs7c0NBT2IsU0FBQSxHQUFXLFNBQUMsTUFBRDthQUNULElBQUMsQ0FBQSxXQUFELENBQWEsTUFBYixDQUFxQixDQUFBLENBQUE7SUFEWjs7c0NBR1gsVUFBQSxHQUFZLFNBQUMsTUFBRDthQUNWLElBQUMsQ0FBQSxvQkFBRCxDQUFzQixNQUF0QixFQUE4QixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7QUFDNUIsY0FBQTtVQUFBLElBQUcsdUNBQUg7bUJBQ0UsK0JBQUEsQ0FBZ0MsTUFBaEMsRUFBd0MsR0FBeEMsRUFERjs7UUFENEI7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTlCO0lBRFU7Ozs7S0E1QndCOztFQWlDaEM7Ozs7Ozs7SUFDSixtQkFBQyxDQUFBLE1BQUQsQ0FBQTs7SUFDQSxtQkFBQyxDQUFBLFdBQUQsR0FBYzs7a0NBQ2QsU0FBQSxHQUFXOzs7O0tBSHFCOztFQUs1Qjs7Ozs7OztJQUNKLHFDQUFDLENBQUEsTUFBRCxDQUFBOztJQUNBLHFDQUFDLENBQUEsV0FBRCxHQUFjOztvREFDZCxTQUFBLEdBQVcsU0FBQyxNQUFEO0FBQ1QsVUFBQTtNQUFBLGVBQUEsR0FBa0IsSUFBQyxDQUFBLDBCQUFELENBQTRCLE1BQU0sQ0FBQyxZQUFQLENBQUEsQ0FBNUI7QUFDbEI7QUFBQSxXQUFBLHNDQUFBOztRQUNFLElBQUcsSUFBQyxDQUFBLDBCQUFELENBQTRCLEdBQTVCLENBQUEsS0FBb0MsZUFBdkM7QUFDRSxpQkFBTyxJQURUOztBQURGO2FBR0E7SUFMUzs7OztLQUh1Qzs7RUFVOUM7Ozs7Ozs7SUFDSixpQ0FBQyxDQUFBLE1BQUQsQ0FBQTs7SUFDQSxpQ0FBQyxDQUFBLFdBQUQsR0FBYzs7Z0RBQ2QsU0FBQSxHQUFXOzs7O0tBSG1DOztFQUsxQzs7Ozs7OztJQUNKLHFCQUFDLENBQUEsTUFBRCxDQUFBOztJQUNBLHFCQUFDLENBQUEsV0FBRCxHQUFjOztvQ0FDZCxLQUFBLEdBQU87Ozs7S0FIMkI7O0VBSzlCOzs7Ozs7O0lBQ0osaUJBQUMsQ0FBQSxNQUFELENBQUE7O0lBQ0EsaUJBQUMsQ0FBQSxXQUFELEdBQWM7O2dDQUNkLFNBQUEsR0FBVzs7OztLQUhtQjs7RUFNMUI7Ozs7Ozs7SUFDSixzQkFBQyxDQUFBLE1BQUQsQ0FBQTs7SUFDQSxzQkFBQyxDQUFBLFdBQUQsR0FBYzs7cUNBQ2QsU0FBQSxHQUFXOztxQ0FDWCxTQUFBLEdBQVcsU0FBQyxNQUFEO2FBQ1QsQ0FBQyxDQUFDLE1BQUYsQ0FBUyxJQUFDLENBQUEsV0FBRCxDQUFhLE1BQWIsQ0FBVCxFQUErQixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsR0FBRDtpQkFDN0IsNEJBQUEsQ0FBNkIsS0FBQyxDQUFBLE1BQTlCLEVBQXNDLEdBQXRDO1FBRDZCO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUEvQjtJQURTOzs7O0tBSndCOztFQVEvQjs7Ozs7OztJQUNKLGtCQUFDLENBQUEsTUFBRCxDQUFBOztJQUNBLGtCQUFDLENBQUEsV0FBRCxHQUFjOztpQ0FDZCxTQUFBLEdBQVc7Ozs7S0FIb0I7O0VBTzNCOzs7Ozs7O0lBQ0oscUJBQUMsQ0FBQSxNQUFELENBQVEsS0FBUjs7b0NBQ0EsU0FBQSxHQUFXOztvQ0FDWCxLQUFBLEdBQU87O29DQUVQLFFBQUEsR0FBVSxTQUFDLFNBQUQ7YUFDUixnQ0FBQSxDQUFpQyxJQUFDLENBQUEsTUFBbEMsRUFBMEMsU0FBMUMsRUFBcUQsSUFBQyxDQUFBLFNBQXRELEVBQWlFLElBQUMsQ0FBQSxLQUFsRTtJQURROztvQ0FHVixVQUFBLEdBQVksU0FBQyxNQUFEO2FBQ1YsSUFBQyxDQUFBLG9CQUFELENBQXNCLE1BQXRCLEVBQThCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtpQkFDNUIsS0FBQyxDQUFBLHVCQUFELENBQXlCLE1BQXpCLEVBQWlDLEtBQUMsQ0FBQSxRQUFELENBQVUsTUFBTSxDQUFDLGlCQUFQLENBQUEsQ0FBVixDQUFqQztRQUQ0QjtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBOUI7SUFEVTs7OztLQVJzQjs7RUFZOUI7Ozs7Ozs7SUFDSixvQkFBQyxDQUFBLE1BQUQsQ0FBQTs7SUFDQSxvQkFBQyxDQUFBLFdBQUQsR0FBYzs7bUNBQ2QsU0FBQSxHQUFXOzttQ0FDWCxLQUFBLEdBQU87Ozs7S0FKMEI7O0VBTTdCOzs7Ozs7O0lBQ0osZ0JBQUMsQ0FBQSxNQUFELENBQUE7O0lBQ0EsZ0JBQUMsQ0FBQSxXQUFELEdBQWM7OytCQUNkLFNBQUEsR0FBVzs7OztLQUhrQjs7RUFLekI7Ozs7Ozs7SUFDSixvQkFBQyxDQUFBLE1BQUQsQ0FBQTs7bUNBQ0EsU0FBQSxHQUFXOztJQUNYLG9CQUFDLENBQUEsV0FBRCxHQUFjOzttQ0FDZCxLQUFBLEdBQU87Ozs7S0FKMEI7O0VBTTdCOzs7Ozs7O0lBQ0osZ0JBQUMsQ0FBQSxNQUFELENBQUE7O0lBQ0EsZ0JBQUMsQ0FBQSxXQUFELEdBQWM7OytCQUNkLFNBQUEsR0FBVzs7OztLQUhrQjs7RUFLekI7Ozs7Ozs7SUFDSixvQkFBQyxDQUFBLE1BQUQsQ0FBQTs7SUFFQSxvQkFBQyxDQUFBLFlBQUQsR0FBZTs7bUNBQ2YsSUFBQSxHQUFNOzttQ0FDTixTQUFBLEdBQVc7O21DQUVYLFNBQUEsR0FBVyxTQUFBO2FBQ1QsSUFBQyxDQUFBLFFBQVEsQ0FBQyxpQkFBaUIsQ0FBQyxVQUE1QixDQUFBLENBQXdDLENBQUMsR0FBekMsQ0FBNkMsU0FBQyxNQUFEO2VBQzNDLE1BQU0sQ0FBQyxjQUFQLENBQUE7TUFEMkMsQ0FBN0M7SUFEUzs7bUNBSVgsT0FBQSxHQUFTLFNBQUE7TUFDUCxJQUFDLENBQUEsTUFBRCxHQUFVLElBQUMsQ0FBQSxRQUFRLENBQUMsS0FBSyxDQUFDLFVBQWhCLENBQTJCLElBQUMsQ0FBQSxTQUFELENBQUEsQ0FBM0I7YUFDVixtREFBQSxTQUFBO0lBRk87O21DQUlULFVBQUEsR0FBWSxTQUFDLE1BQUQ7QUFDVixVQUFBO01BQUEsS0FBQSxHQUFRLElBQUMsQ0FBQSxNQUFPLENBQUEsUUFBQSxDQUFTLElBQUMsQ0FBQSxRQUFELENBQVUsTUFBTSxDQUFDLGlCQUFQLENBQUEsQ0FBVixDQUFULEVBQWdELElBQUMsQ0FBQSxNQUFqRCxDQUFBO01BQ2hCLEtBQUEsR0FBUSxLQUFLLENBQUM7TUFDZCxNQUFNLENBQUMsaUJBQVAsQ0FBeUIsS0FBekIsRUFBZ0M7UUFBQSxVQUFBLEVBQVksS0FBWjtPQUFoQztNQUVBLElBQUcsTUFBTSxDQUFDLFlBQVAsQ0FBQSxDQUFIO1FBQ0UsSUFBQyxDQUFBLE1BQU0sQ0FBQyxlQUFSLENBQXdCLEtBQUssQ0FBQyxHQUE5QjtRQUNBLDJCQUFBLENBQTRCLElBQUMsQ0FBQSxNQUE3QixFQUFxQyxLQUFyQyxFQUZGOztNQUlBLElBQUcsSUFBQyxDQUFBLFNBQUQsQ0FBVyx5QkFBWCxDQUFIO2VBQ0UsSUFBQyxDQUFBLFFBQVEsQ0FBQyxLQUFWLENBQWdCLEtBQWhCLEVBQXVCO1VBQUEsSUFBQSxFQUFNLFFBQU47U0FBdkIsRUFERjs7SUFUVTs7bUNBWVosUUFBQSxHQUFVLFNBQUMsU0FBRDtBQUNSLFVBQUE7TUFBQSxLQUFBLEdBQVE7QUFDUjtBQUFBLFdBQUEsOENBQUE7O2NBQTZCLEtBQUssQ0FBQyxLQUFLLENBQUMsYUFBWixDQUEwQixTQUExQjs7O1FBQzNCLEtBQUEsR0FBUTtBQUNSO0FBRkY7YUFHQSxpQkFBQyxRQUFRLENBQVQsQ0FBQSxHQUFjLElBQUMsQ0FBQSxRQUFELENBQVUsQ0FBQyxDQUFYO0lBTE47Ozs7S0EzQnVCOztFQWtDN0I7Ozs7Ozs7SUFDSix3QkFBQyxDQUFBLE1BQUQsQ0FBQTs7dUNBQ0EsU0FBQSxHQUFXOzt1Q0FFWCxRQUFBLEdBQVUsU0FBQyxTQUFEO0FBQ1IsVUFBQTtNQUFBLEtBQUEsR0FBUTtBQUNSO0FBQUEsV0FBQSw0Q0FBQTs7Y0FBbUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxVQUFWLENBQXFCLFNBQXJCOzs7UUFDakMsS0FBQSxHQUFRO0FBQ1I7QUFGRjthQUdBLGlCQUFDLFFBQVEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFSLEdBQWlCLENBQTFCLENBQUEsR0FBK0IsSUFBQyxDQUFBLFFBQUQsQ0FBVSxDQUFDLENBQVg7SUFMdkI7Ozs7S0FKMkI7O0VBYWpDOzs7Ozs7O0lBQ0osVUFBQyxDQUFBLE1BQUQsQ0FBQTs7eUJBQ0EsU0FBQSxHQUFXOzt5QkFDWCxJQUFBLEdBQU07O3lCQUNOLE1BQUEsR0FBUSxDQUFDLGFBQUQsRUFBZ0IsY0FBaEIsRUFBZ0MsZUFBaEM7O3lCQUVSLFVBQUEsR0FBWSxTQUFDLE1BQUQ7YUFDVixJQUFDLENBQUEsdUJBQUQsQ0FBeUIsTUFBekIsRUFBaUMsSUFBQyxDQUFBLFFBQUQsQ0FBVSxNQUFWLENBQWpDO0lBRFU7O3lCQUdaLGNBQUEsR0FBZ0IsU0FBQyxLQUFEO0FBQ2QsVUFBQTtNQUFBLFFBQUEsR0FBVyxJQUFDLEVBQUEsR0FBQSxFQUFELENBQUssTUFBTCxDQUFZLENBQUMsV0FBYixDQUF5QixLQUF6QjtNQUNYLElBQW1CLGdCQUFuQjtBQUFBLGVBQU8sS0FBUDs7TUFDQyw4QkFBRCxFQUFZO01BQ1osU0FBQSxHQUFZLFNBQVMsQ0FBQyxTQUFWLENBQW9CLENBQUMsQ0FBRCxFQUFJLENBQUMsQ0FBTCxDQUFwQixFQUE2QixDQUFDLENBQUQsRUFBSSxDQUFDLENBQUwsQ0FBN0I7TUFDWixVQUFBLEdBQWEsVUFBVSxDQUFDLFNBQVgsQ0FBcUIsQ0FBQyxDQUFELEVBQUksQ0FBQyxDQUFMLENBQXJCLEVBQThCLENBQUMsQ0FBRCxFQUFJLENBQUMsQ0FBTCxDQUE5QjtNQUNiLElBQTJCLFNBQVMsQ0FBQyxhQUFWLENBQXdCLEtBQXhCLENBQUEsSUFBbUMsQ0FBQyxDQUFJLEtBQUssQ0FBQyxPQUFOLENBQWMsU0FBUyxDQUFDLEdBQXhCLENBQUwsQ0FBOUQ7QUFBQSxlQUFPLFVBQVUsQ0FBQyxNQUFsQjs7TUFDQSxJQUEwQixVQUFVLENBQUMsYUFBWCxDQUF5QixLQUF6QixDQUFBLElBQW9DLENBQUMsQ0FBSSxLQUFLLENBQUMsT0FBTixDQUFjLFVBQVUsQ0FBQyxHQUF6QixDQUFMLENBQTlEO0FBQUEsZUFBTyxTQUFTLENBQUMsTUFBakI7O0lBUGM7O3lCQVNoQixRQUFBLEdBQVUsU0FBQyxNQUFEO0FBQ1IsVUFBQTtNQUFBLGNBQUEsR0FBaUIsTUFBTSxDQUFDLGlCQUFQLENBQUE7TUFDakIsU0FBQSxHQUFZLGNBQWMsQ0FBQztNQUMzQixJQUFnQixLQUFBLEdBQVEsSUFBQyxDQUFBLGNBQUQsQ0FBZ0IsY0FBaEIsQ0FBeEI7QUFBQSxlQUFPLE1BQVA7O01BR0EsS0FBQSxHQUFRLElBQUMsRUFBQSxHQUFBLEVBQUQsQ0FBSyx5QkFBTCxFQUFnQztRQUFFLFFBQUQsSUFBQyxDQUFBLE1BQUY7T0FBaEMsQ0FBMEMsQ0FBQyxRQUEzQyxDQUFvRCxNQUFNLENBQUMsU0FBM0Q7TUFDUixJQUFtQixhQUFuQjtBQUFBLGVBQU8sS0FBUDs7TUFDQyxtQkFBRCxFQUFRO01BQ1IsSUFBRyxDQUFDLEtBQUssQ0FBQyxHQUFOLEtBQWEsU0FBZCxDQUFBLElBQTZCLEtBQUssQ0FBQyxvQkFBTixDQUEyQixjQUEzQixDQUFoQztlQUVFLEdBQUcsQ0FBQyxTQUFKLENBQWMsQ0FBQyxDQUFELEVBQUksQ0FBQyxDQUFMLENBQWQsRUFGRjtPQUFBLE1BR0ssSUFBRyxHQUFHLENBQUMsR0FBSixLQUFXLGNBQWMsQ0FBQyxHQUE3QjtlQUdILE1BSEc7O0lBWkc7Ozs7S0FsQmE7QUEvc0N6QiIsInNvdXJjZXNDb250ZW50IjpbIl8gPSByZXF1aXJlICd1bmRlcnNjb3JlLXBsdXMnXG57UG9pbnQsIFJhbmdlfSA9IHJlcXVpcmUgJ2F0b20nXG5cbntcbiAgbW92ZUN1cnNvckxlZnQsIG1vdmVDdXJzb3JSaWdodFxuICBtb3ZlQ3Vyc29yVXBTY3JlZW4sIG1vdmVDdXJzb3JEb3duU2NyZWVuXG4gIHBvaW50SXNBdFZpbUVuZE9mRmlsZVxuICBnZXRGaXJzdFZpc2libGVTY3JlZW5Sb3csIGdldExhc3RWaXNpYmxlU2NyZWVuUm93XG4gIGdldFZhbGlkVmltU2NyZWVuUm93LCBnZXRWYWxpZFZpbUJ1ZmZlclJvd1xuICBtb3ZlQ3Vyc29yVG9GaXJzdENoYXJhY3RlckF0Um93XG4gIHNvcnRSYW5nZXNcbiAgcG9pbnRJc09uV2hpdGVTcGFjZVxuICBtb3ZlQ3Vyc29yVG9OZXh0Tm9uV2hpdGVzcGFjZVxuICBpc0VtcHR5Um93XG4gIGdldENvZGVGb2xkUm93UmFuZ2VzXG4gIGdldExhcmdlc3RGb2xkUmFuZ2VDb250YWluc0J1ZmZlclJvd1xuICBpc0luY2x1ZGVGdW5jdGlvblNjb3BlRm9yUm93XG4gIGRldGVjdFNjb3BlU3RhcnRQb3NpdGlvbkZvclNjb3BlXG4gIGdldEJ1ZmZlclJvd3NcbiAgZ2V0VGV4dEluU2NyZWVuUmFuZ2VcbiAgc2V0QnVmZmVyUm93XG4gIHNldEJ1ZmZlckNvbHVtblxuICBsaW1pdE51bWJlclxuICBnZXRJbmRleFxuICBzbWFydFNjcm9sbFRvQnVmZmVyUG9zaXRpb25cbiAgcG9pbnRJc0F0RW5kT2ZMaW5lQXROb25FbXB0eVJvd1xuICBnZXRFbmRPZkxpbmVGb3JCdWZmZXJSb3dcbiAgZmluZFJhbmdlSW5CdWZmZXJSb3dcbiAgc2F2ZUVkaXRvclN0YXRlXG59ID0gcmVxdWlyZSAnLi91dGlscydcblxuQmFzZSA9IHJlcXVpcmUgJy4vYmFzZSdcblxuY2xhc3MgTW90aW9uIGV4dGVuZHMgQmFzZVxuICBAZXh0ZW5kKGZhbHNlKVxuICBAb3BlcmF0aW9uS2luZDogJ21vdGlvbidcbiAgaW5jbHVzaXZlOiBmYWxzZVxuICB3aXNlOiAnY2hhcmFjdGVyd2lzZSdcbiAganVtcDogZmFsc2VcbiAgdmVydGljYWxNb3Rpb246IGZhbHNlXG4gIG1vdmVTdWNjZWVkZWQ6IG51bGxcbiAgbW92ZVN1Y2Nlc3NPbkxpbmV3aXNlOiBmYWxzZVxuICBzZWxlY3RTdWNjZWVkZWQ6IGZhbHNlXG5cbiAgY29uc3RydWN0b3I6IC0+XG4gICAgc3VwZXJcblxuICAgIGlmIEBtb2RlIGlzICd2aXN1YWwnXG4gICAgICBAd2lzZSA9IEBzdWJtb2RlXG4gICAgQGluaXRpYWxpemUoKVxuXG4gIGlzTGluZXdpc2U6IC0+IEB3aXNlIGlzICdsaW5ld2lzZSdcbiAgaXNCbG9ja3dpc2U6IC0+IEB3aXNlIGlzICdibG9ja3dpc2UnXG5cbiAgZm9yY2VXaXNlOiAod2lzZSkgLT5cbiAgICBpZiB3aXNlIGlzICdjaGFyYWN0ZXJ3aXNlJ1xuICAgICAgaWYgQHdpc2UgaXMgJ2xpbmV3aXNlJ1xuICAgICAgICBAaW5jbHVzaXZlID0gZmFsc2VcbiAgICAgIGVsc2VcbiAgICAgICAgQGluY2x1c2l2ZSA9IG5vdCBAaW5jbHVzaXZlXG4gICAgQHdpc2UgPSB3aXNlXG5cbiAgcmVzZXRTdGF0ZTogLT5cbiAgICBAc2VsZWN0U3VjY2VlZGVkID0gZmFsc2VcblxuICBzZXRCdWZmZXJQb3NpdGlvblNhZmVseTogKGN1cnNvciwgcG9pbnQpIC0+XG4gICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHBvaW50KSBpZiBwb2ludD9cblxuICBzZXRTY3JlZW5Qb3NpdGlvblNhZmVseTogKGN1cnNvciwgcG9pbnQpIC0+XG4gICAgY3Vyc29yLnNldFNjcmVlblBvc2l0aW9uKHBvaW50KSBpZiBwb2ludD9cblxuICBtb3ZlV2l0aFNhdmVKdW1wOiAoY3Vyc29yKSAtPlxuICAgIGlmIGN1cnNvci5pc0xhc3RDdXJzb3IoKSBhbmQgQGp1bXBcbiAgICAgIGN1cnNvclBvc2l0aW9uID0gY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKClcblxuICAgIEBtb3ZlQ3Vyc29yKGN1cnNvcilcblxuICAgIGlmIGN1cnNvclBvc2l0aW9uPyBhbmQgbm90IGN1cnNvclBvc2l0aW9uLmlzRXF1YWwoY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKCkpXG4gICAgICBAdmltU3RhdGUubWFyay5zZXQoJ2AnLCBjdXJzb3JQb3NpdGlvbilcbiAgICAgIEB2aW1TdGF0ZS5tYXJrLnNldChcIidcIiwgY3Vyc29yUG9zaXRpb24pXG5cbiAgZXhlY3V0ZTogLT5cbiAgICBpZiBAb3BlcmF0b3I/XG4gICAgICBAc2VsZWN0KClcbiAgICBlbHNlXG4gICAgICBAbW92ZVdpdGhTYXZlSnVtcChjdXJzb3IpIGZvciBjdXJzb3IgaW4gQGVkaXRvci5nZXRDdXJzb3JzKClcbiAgICBAZWRpdG9yLm1lcmdlQ3Vyc29ycygpXG4gICAgQGVkaXRvci5tZXJnZUludGVyc2VjdGluZ1NlbGVjdGlvbnMoKVxuXG4gICMgTk9URTogTW9kaWZ5IHNlbGVjdGlvbiBieSBtb2R0aW9uLCBzZWxlY3Rpb24gaXMgYWxyZWFkeSBcIm5vcm1hbGl6ZWRcIiBiZWZvcmUgdGhpcyBmdW5jdGlvbiBpcyBjYWxsZWQuXG4gIHNlbGVjdDogLT5cbiAgICBpc09yV2FzVmlzdWFsID0gQG9wZXJhdG9yPy5pbnN0YW5jZW9mKCdTZWxlY3RCYXNlJykgb3IgQGlzKCdDdXJyZW50U2VsZWN0aW9uJykgIyBuZWVkIHRvIGNhcmUgd2FzIHZpc3VhbCBmb3IgYC5gIHJlcGVhdGVkLlxuICAgIGZvciBzZWxlY3Rpb24gaW4gQGVkaXRvci5nZXRTZWxlY3Rpb25zKClcbiAgICAgIHNlbGVjdGlvbi5tb2RpZnlTZWxlY3Rpb24gPT5cbiAgICAgICAgQG1vdmVXaXRoU2F2ZUp1bXAoc2VsZWN0aW9uLmN1cnNvcilcblxuICAgICAgc2VsZWN0U3VjY2VlZGVkID0gQG1vdmVTdWNjZWVkZWQgPyBub3Qgc2VsZWN0aW9uLmlzRW1wdHkoKSBvciAoQGlzTGluZXdpc2UoKSBhbmQgQG1vdmVTdWNjZXNzT25MaW5ld2lzZSlcbiAgICAgIEBzZWxlY3RTdWNjZWVkZWQgb3I9IHNlbGVjdFN1Y2NlZWRlZFxuXG4gICAgICBpZiBpc09yV2FzVmlzdWFsIG9yIChzZWxlY3RTdWNjZWVkZWQgYW5kIChAaW5jbHVzaXZlIG9yIEBpc0xpbmV3aXNlKCkpKVxuICAgICAgICAkc2VsZWN0aW9uID0gQHN3cmFwKHNlbGVjdGlvbilcbiAgICAgICAgJHNlbGVjdGlvbi5zYXZlUHJvcGVydGllcyh0cnVlKSAjIHNhdmUgcHJvcGVydHkgb2YgXCJhbHJlYWR5LW5vcm1hbGl6ZWQtc2VsZWN0aW9uXCJcbiAgICAgICAgJHNlbGVjdGlvbi5hcHBseVdpc2UoQHdpc2UpXG5cbiAgICBAdmltU3RhdGUuZ2V0TGFzdEJsb2Nrd2lzZVNlbGVjdGlvbigpLmF1dG9zY3JvbGwoKSBpZiBAd2lzZSBpcyAnYmxvY2t3aXNlJ1xuXG4gIHNldEN1cnNvckJ1ZmZlclJvdzogKGN1cnNvciwgcm93LCBvcHRpb25zKSAtPlxuICAgIGlmIEB2ZXJ0aWNhbE1vdGlvbiBhbmQgbm90IEBnZXRDb25maWcoJ3N0YXlPblZlcnRpY2FsTW90aW9uJylcbiAgICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihAZ2V0Rmlyc3RDaGFyYWN0ZXJQb3NpdGlvbkZvckJ1ZmZlclJvdyhyb3cpLCBvcHRpb25zKVxuICAgIGVsc2VcbiAgICAgIHNldEJ1ZmZlclJvdyhjdXJzb3IsIHJvdywgb3B0aW9ucylcblxuICAjIFtOT1RFXVxuICAjIFNpbmNlIHRoaXMgZnVuY3Rpb24gY2hlY2tzIGN1cnNvciBwb3NpdGlvbiBjaGFuZ2UsIGEgY3Vyc29yIHBvc2l0aW9uIE1VU1QgYmVcbiAgIyB1cGRhdGVkIElOIGNhbGxiYWNrKD1mbilcbiAgIyBVcGRhdGluZyBwb2ludCBvbmx5IGluIGNhbGxiYWNrIGlzIHdyb25nLXVzZSBvZiB0aGlzIGZ1bmNpdG9uLFxuICAjIHNpbmNlIGl0IHN0b3BzIGltbWVkaWF0ZWx5IGJlY2F1c2Ugb2Ygbm90IGN1cnNvciBwb3NpdGlvbiBjaGFuZ2UuXG4gIG1vdmVDdXJzb3JDb3VudFRpbWVzOiAoY3Vyc29yLCBmbikgLT5cbiAgICBvbGRQb3NpdGlvbiA9IGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXG4gICAgQGNvdW50VGltZXMgQGdldENvdW50KCksIChzdGF0ZSkgLT5cbiAgICAgIGZuKHN0YXRlKVxuICAgICAgaWYgKG5ld1Bvc2l0aW9uID0gY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKCkpLmlzRXF1YWwob2xkUG9zaXRpb24pXG4gICAgICAgIHN0YXRlLnN0b3AoKVxuICAgICAgb2xkUG9zaXRpb24gPSBuZXdQb3NpdGlvblxuXG4gIGlzQ2FzZVNlbnNpdGl2ZTogKHRlcm0pIC0+XG4gICAgaWYgQGdldENvbmZpZyhcInVzZVNtYXJ0Y2FzZUZvciN7QGNhc2VTZW5zaXRpdml0eUtpbmR9XCIpXG4gICAgICB0ZXJtLnNlYXJjaCgvW0EtWl0vKSBpc250IC0xXG4gICAgZWxzZVxuICAgICAgbm90IEBnZXRDb25maWcoXCJpZ25vcmVDYXNlRm9yI3tAY2FzZVNlbnNpdGl2aXR5S2luZH1cIilcblxuIyBVc2VkIGFzIG9wZXJhdG9yJ3MgdGFyZ2V0IGluIHZpc3VhbC1tb2RlLlxuY2xhc3MgQ3VycmVudFNlbGVjdGlvbiBleHRlbmRzIE1vdGlvblxuICBAZXh0ZW5kKGZhbHNlKVxuICBzZWxlY3Rpb25FeHRlbnQ6IG51bGxcbiAgYmxvY2t3aXNlU2VsZWN0aW9uRXh0ZW50OiBudWxsXG4gIGluY2x1c2l2ZTogdHJ1ZVxuXG4gIGluaXRpYWxpemU6IC0+XG4gICAgc3VwZXJcbiAgICBAcG9pbnRJbmZvQnlDdXJzb3IgPSBuZXcgTWFwXG5cbiAgbW92ZUN1cnNvcjogKGN1cnNvcikgLT5cbiAgICBpZiBAbW9kZSBpcyAndmlzdWFsJ1xuICAgICAgaWYgQGlzQmxvY2t3aXNlKClcbiAgICAgICAgQGJsb2Nrd2lzZVNlbGVjdGlvbkV4dGVudCA9IEBzd3JhcChjdXJzb3Iuc2VsZWN0aW9uKS5nZXRCbG9ja3dpc2VTZWxlY3Rpb25FeHRlbnQoKVxuICAgICAgZWxzZVxuICAgICAgICBAc2VsZWN0aW9uRXh0ZW50ID0gQGVkaXRvci5nZXRTZWxlY3RlZEJ1ZmZlclJhbmdlKCkuZ2V0RXh0ZW50KClcbiAgICBlbHNlXG4gICAgICAjIGAuYCByZXBlYXQgY2FzZVxuICAgICAgcG9pbnQgPSBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuXG4gICAgICBpZiBAYmxvY2t3aXNlU2VsZWN0aW9uRXh0ZW50P1xuICAgICAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24ocG9pbnQudHJhbnNsYXRlKEBibG9ja3dpc2VTZWxlY3Rpb25FeHRlbnQpKVxuICAgICAgZWxzZVxuICAgICAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24ocG9pbnQudHJhdmVyc2UoQHNlbGVjdGlvbkV4dGVudCkpXG5cbiAgc2VsZWN0OiAtPlxuICAgIGlmIEBtb2RlIGlzICd2aXN1YWwnXG4gICAgICBzdXBlclxuICAgIGVsc2VcbiAgICAgIGZvciBjdXJzb3IgaW4gQGVkaXRvci5nZXRDdXJzb3JzKCkgd2hlbiBwb2ludEluZm8gPSBAcG9pbnRJbmZvQnlDdXJzb3IuZ2V0KGN1cnNvcilcbiAgICAgICAge2N1cnNvclBvc2l0aW9uLCBzdGFydE9mU2VsZWN0aW9ufSA9IHBvaW50SW5mb1xuICAgICAgICBpZiBjdXJzb3JQb3NpdGlvbi5pc0VxdWFsKGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpKVxuICAgICAgICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihzdGFydE9mU2VsZWN0aW9uKVxuICAgICAgc3VwZXJcblxuICAgICMgKiBQdXJwb3NlIG9mIHBvaW50SW5mb0J5Q3Vyc29yPyBzZWUgIzIzNSBmb3IgZGV0YWlsLlxuICAgICMgV2hlbiBzdGF5T25UcmFuc2Zvcm1TdHJpbmcgaXMgZW5hYmxlZCwgY3Vyc29yIHBvcyBpcyBub3Qgc2V0IG9uIHN0YXJ0IG9mXG4gICAgIyBvZiBzZWxlY3RlZCByYW5nZS5cbiAgICAjIEJ1dCBJIHdhbnQgZm9sbG93aW5nIGJlaGF2aW9yLCBzbyBuZWVkIHRvIHByZXNlcnZlIHBvc2l0aW9uIGluZm8uXG4gICAgIyAgMS4gYHZqPi5gIC0+IGluZGVudCBzYW1lIHR3byByb3dzIHJlZ2FyZGxlc3Mgb2YgY3VycmVudCBjdXJzb3IncyByb3cuXG4gICAgIyAgMi4gYHZqPmouYCAtPiBpbmRlbnQgdHdvIHJvd3MgZnJvbSBjdXJzb3IncyByb3cuXG4gICAgZm9yIGN1cnNvciBpbiBAZWRpdG9yLmdldEN1cnNvcnMoKVxuICAgICAgc3RhcnRPZlNlbGVjdGlvbiA9IGN1cnNvci5zZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKS5zdGFydFxuICAgICAgQG9uRGlkRmluaXNoT3BlcmF0aW9uID0+XG4gICAgICAgIGN1cnNvclBvc2l0aW9uID0gY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKClcbiAgICAgICAgQHBvaW50SW5mb0J5Q3Vyc29yLnNldChjdXJzb3IsIHtzdGFydE9mU2VsZWN0aW9uLCBjdXJzb3JQb3NpdGlvbn0pXG5cbmNsYXNzIE1vdmVMZWZ0IGV4dGVuZHMgTW90aW9uXG4gIEBleHRlbmQoKVxuICBtb3ZlQ3Vyc29yOiAoY3Vyc29yKSAtPlxuICAgIGFsbG93V3JhcCA9IEBnZXRDb25maWcoJ3dyYXBMZWZ0UmlnaHRNb3Rpb24nKVxuICAgIEBtb3ZlQ3Vyc29yQ291bnRUaW1lcyBjdXJzb3IsIC0+XG4gICAgICBtb3ZlQ3Vyc29yTGVmdChjdXJzb3IsIHthbGxvd1dyYXB9KVxuXG5jbGFzcyBNb3ZlUmlnaHQgZXh0ZW5kcyBNb3Rpb25cbiAgQGV4dGVuZCgpXG4gIGNhbldyYXBUb05leHRMaW5lOiAoY3Vyc29yKSAtPlxuICAgIGlmIEBpc0FzVGFyZ2V0RXhjZXB0U2VsZWN0SW5WaXN1YWxNb2RlKCkgYW5kIG5vdCBjdXJzb3IuaXNBdEVuZE9mTGluZSgpXG4gICAgICBmYWxzZVxuICAgIGVsc2VcbiAgICAgIEBnZXRDb25maWcoJ3dyYXBMZWZ0UmlnaHRNb3Rpb24nKVxuXG4gIG1vdmVDdXJzb3I6IChjdXJzb3IpIC0+XG4gICAgQG1vdmVDdXJzb3JDb3VudFRpbWVzIGN1cnNvciwgPT5cbiAgICAgIGN1cnNvclBvc2l0aW9uID0gY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKClcbiAgICAgIEBlZGl0b3IudW5mb2xkQnVmZmVyUm93KGN1cnNvclBvc2l0aW9uLnJvdylcbiAgICAgIGFsbG93V3JhcCA9IEBjYW5XcmFwVG9OZXh0TGluZShjdXJzb3IpXG4gICAgICBtb3ZlQ3Vyc29yUmlnaHQoY3Vyc29yKVxuICAgICAgaWYgY3Vyc29yLmlzQXRFbmRPZkxpbmUoKSBhbmQgYWxsb3dXcmFwIGFuZCBub3QgcG9pbnRJc0F0VmltRW5kT2ZGaWxlKEBlZGl0b3IsIGN1cnNvclBvc2l0aW9uKVxuICAgICAgICBtb3ZlQ3Vyc29yUmlnaHQoY3Vyc29yLCB7YWxsb3dXcmFwfSlcblxuY2xhc3MgTW92ZVJpZ2h0QnVmZmVyQ29sdW1uIGV4dGVuZHMgTW90aW9uXG4gIEBleHRlbmQoZmFsc2UpXG5cbiAgbW92ZUN1cnNvcjogKGN1cnNvcikgLT5cbiAgICBzZXRCdWZmZXJDb2x1bW4oY3Vyc29yLCBjdXJzb3IuZ2V0QnVmZmVyQ29sdW1uKCkgKyBAZ2V0Q291bnQoKSlcblxuY2xhc3MgTW92ZVVwIGV4dGVuZHMgTW90aW9uXG4gIEBleHRlbmQoKVxuICB3aXNlOiAnbGluZXdpc2UnXG4gIHdyYXA6IGZhbHNlXG5cbiAgZ2V0QnVmZmVyUm93OiAocm93KSAtPlxuICAgIHJvdyA9IEBnZXROZXh0Um93KHJvdylcbiAgICBpZiBAZWRpdG9yLmlzRm9sZGVkQXRCdWZmZXJSb3cocm93KVxuICAgICAgZ2V0TGFyZ2VzdEZvbGRSYW5nZUNvbnRhaW5zQnVmZmVyUm93KEBlZGl0b3IsIHJvdykuc3RhcnQucm93XG4gICAgZWxzZVxuICAgICAgcm93XG5cbiAgZ2V0TmV4dFJvdzogKHJvdykgLT5cbiAgICBtaW4gPSAwXG4gICAgaWYgQHdyYXAgYW5kIHJvdyBpcyBtaW5cbiAgICAgIEBnZXRWaW1MYXN0QnVmZmVyUm93KClcbiAgICBlbHNlXG4gICAgICBsaW1pdE51bWJlcihyb3cgLSAxLCB7bWlufSlcblxuICBtb3ZlQ3Vyc29yOiAoY3Vyc29yKSAtPlxuICAgIEBtb3ZlQ3Vyc29yQ291bnRUaW1lcyBjdXJzb3IsID0+XG4gICAgICBzZXRCdWZmZXJSb3coY3Vyc29yLCBAZ2V0QnVmZmVyUm93KGN1cnNvci5nZXRCdWZmZXJSb3coKSkpXG5cbmNsYXNzIE1vdmVVcFdyYXAgZXh0ZW5kcyBNb3ZlVXBcbiAgQGV4dGVuZCgpXG4gIHdyYXA6IHRydWVcblxuY2xhc3MgTW92ZURvd24gZXh0ZW5kcyBNb3ZlVXBcbiAgQGV4dGVuZCgpXG4gIHdpc2U6ICdsaW5ld2lzZSdcbiAgd3JhcDogZmFsc2VcblxuICBnZXRCdWZmZXJSb3c6IChyb3cpIC0+XG4gICAgaWYgQGVkaXRvci5pc0ZvbGRlZEF0QnVmZmVyUm93KHJvdylcbiAgICAgIHJvdyA9IGdldExhcmdlc3RGb2xkUmFuZ2VDb250YWluc0J1ZmZlclJvdyhAZWRpdG9yLCByb3cpLmVuZC5yb3dcbiAgICBAZ2V0TmV4dFJvdyhyb3cpXG5cbiAgZ2V0TmV4dFJvdzogKHJvdykgLT5cbiAgICBtYXggPSBAZ2V0VmltTGFzdEJ1ZmZlclJvdygpXG4gICAgaWYgQHdyYXAgYW5kIHJvdyA+PSBtYXhcbiAgICAgIDBcbiAgICBlbHNlXG4gICAgICBsaW1pdE51bWJlcihyb3cgKyAxLCB7bWF4fSlcblxuY2xhc3MgTW92ZURvd25XcmFwIGV4dGVuZHMgTW92ZURvd25cbiAgQGV4dGVuZCgpXG4gIHdyYXA6IHRydWVcblxuY2xhc3MgTW92ZVVwU2NyZWVuIGV4dGVuZHMgTW90aW9uXG4gIEBleHRlbmQoKVxuICB3aXNlOiAnbGluZXdpc2UnXG4gIGRpcmVjdGlvbjogJ3VwJ1xuXG4gIG1vdmVDdXJzb3I6IChjdXJzb3IpIC0+XG4gICAgQG1vdmVDdXJzb3JDb3VudFRpbWVzIGN1cnNvciwgLT5cbiAgICAgIG1vdmVDdXJzb3JVcFNjcmVlbihjdXJzb3IpXG5cbmNsYXNzIE1vdmVEb3duU2NyZWVuIGV4dGVuZHMgTW92ZVVwU2NyZWVuXG4gIEBleHRlbmQoKVxuICB3aXNlOiAnbGluZXdpc2UnXG4gIGRpcmVjdGlvbjogJ2Rvd24nXG5cbiAgbW92ZUN1cnNvcjogKGN1cnNvcikgLT5cbiAgICBAbW92ZUN1cnNvckNvdW50VGltZXMgY3Vyc29yLCAtPlxuICAgICAgbW92ZUN1cnNvckRvd25TY3JlZW4oY3Vyc29yKVxuXG4jIE1vdmUgZG93bi91cCB0byBFZGdlXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgU2VlIHQ5bWQvYXRvbS12aW0tbW9kZS1wbHVzIzIzNlxuIyBBdCBsZWFzdCB2MS43LjAuIGJ1ZmZlclBvc2l0aW9uIGFuZCBzY3JlZW5Qb3NpdGlvbiBjYW5ub3QgY29udmVydCBhY2N1cmF0ZWx5XG4jIHdoZW4gcm93IGlzIGZvbGRlZC5cbmNsYXNzIE1vdmVVcFRvRWRnZSBleHRlbmRzIE1vdGlvblxuICBAZXh0ZW5kKClcbiAgd2lzZTogJ2xpbmV3aXNlJ1xuICBqdW1wOiB0cnVlXG4gIGRpcmVjdGlvbjogJ3VwJ1xuICBAZGVzY3JpcHRpb246IFwiTW92ZSBjdXJzb3IgdXAgdG8gKiplZGdlKiogY2hhciBhdCBzYW1lLWNvbHVtblwiXG5cbiAgbW92ZUN1cnNvcjogKGN1cnNvcikgLT5cbiAgICBAbW92ZUN1cnNvckNvdW50VGltZXMgY3Vyc29yLCA9PlxuICAgICAgQHNldFNjcmVlblBvc2l0aW9uU2FmZWx5KGN1cnNvciwgQGdldFBvaW50KGN1cnNvci5nZXRTY3JlZW5Qb3NpdGlvbigpKSlcblxuICBnZXRQb2ludDogKGZyb21Qb2ludCkgLT5cbiAgICBjb2x1bW4gPSBmcm9tUG9pbnQuY29sdW1uXG4gICAgZm9yIHJvdyBpbiBAZ2V0U2NhblJvd3MoZnJvbVBvaW50KSB3aGVuIEBpc0VkZ2UocG9pbnQgPSBuZXcgUG9pbnQocm93LCBjb2x1bW4pKVxuICAgICAgcmV0dXJuIHBvaW50XG5cbiAgZ2V0U2NhblJvd3M6ICh7cm93fSkgLT5cbiAgICB2YWxpZFJvdyA9IGdldFZhbGlkVmltU2NyZWVuUm93LmJpbmQobnVsbCwgQGVkaXRvcilcbiAgICBzd2l0Y2ggQGRpcmVjdGlvblxuICAgICAgd2hlbiAndXAnIHRoZW4gW3ZhbGlkUm93KHJvdyAtIDEpLi4wXVxuICAgICAgd2hlbiAnZG93bicgdGhlbiBbdmFsaWRSb3cocm93ICsgMSkuLkBnZXRWaW1MYXN0U2NyZWVuUm93KCldXG5cbiAgaXNFZGdlOiAocG9pbnQpIC0+XG4gICAgaWYgQGlzU3RvcHBhYmxlUG9pbnQocG9pbnQpXG4gICAgICAjIElmIG9uZSBvZiBhYm92ZS9iZWxvdyBwb2ludCB3YXMgbm90IHN0b3BwYWJsZSwgaXQncyBFZGdlIVxuICAgICAgYWJvdmUgPSBwb2ludC50cmFuc2xhdGUoWy0xLCAwXSlcbiAgICAgIGJlbG93ID0gcG9pbnQudHJhbnNsYXRlKFsrMSwgMF0pXG4gICAgICAobm90IEBpc1N0b3BwYWJsZVBvaW50KGFib3ZlKSkgb3IgKG5vdCBAaXNTdG9wcGFibGVQb2ludChiZWxvdykpXG4gICAgZWxzZVxuICAgICAgZmFsc2VcblxuICBpc1N0b3BwYWJsZVBvaW50OiAocG9pbnQpIC0+XG4gICAgaWYgQGlzTm9uV2hpdGVTcGFjZVBvaW50KHBvaW50KSBvciBAaXNGaXJzdFJvd09yTGFzdFJvd0FuZFN0b3BwYWJsZShwb2ludClcbiAgICAgIHRydWVcbiAgICBlbHNlXG4gICAgICBsZWZ0UG9pbnQgPSBwb2ludC50cmFuc2xhdGUoWzAsIC0xXSlcbiAgICAgIHJpZ2h0UG9pbnQgPSBwb2ludC50cmFuc2xhdGUoWzAsICsxXSlcbiAgICAgIEBpc05vbldoaXRlU3BhY2VQb2ludChsZWZ0UG9pbnQpIGFuZCBAaXNOb25XaGl0ZVNwYWNlUG9pbnQocmlnaHRQb2ludClcblxuICBpc05vbldoaXRlU3BhY2VQb2ludDogKHBvaW50KSAtPlxuICAgIGNoYXIgPSBnZXRUZXh0SW5TY3JlZW5SYW5nZShAZWRpdG9yLCBSYW5nZS5mcm9tUG9pbnRXaXRoRGVsdGEocG9pbnQsIDAsIDEpKVxuICAgIGNoYXI/IGFuZCAvXFxTLy50ZXN0KGNoYXIpXG5cbiAgaXNGaXJzdFJvd09yTGFzdFJvd0FuZFN0b3BwYWJsZTogKHBvaW50KSAtPlxuICAgICMgSW4gbm9ybWFsLW1vZGUgd2UgYWRqdXN0IGN1cnNvciBieSBtb3ZpbmctbGVmdCBpZiBjdXJzb3IgYXQgRU9MIG9mIG5vbi1ibGFuayByb3cuXG4gICAgIyBTbyBleHBsaWNpdGx5IGd1YXJkIHRvIG5vdCBhbnN3ZXIgaXQgc3RvcHBhYmxlLlxuICAgIGlmIEBpc01vZGUoJ25vcm1hbCcpIGFuZCBwb2ludElzQXRFbmRPZkxpbmVBdE5vbkVtcHR5Um93KEBlZGl0b3IsIHBvaW50KVxuICAgICAgZmFsc2VcbiAgICBlbHNlXG4gICAgICBwb2ludC5pc0VxdWFsKEBlZGl0b3IuY2xpcFNjcmVlblBvc2l0aW9uKHBvaW50KSkgYW5kXG4gICAgICAgICgocG9pbnQucm93IGlzIDApIG9yIChwb2ludC5yb3cgaXMgQGdldFZpbUxhc3RTY3JlZW5Sb3coKSkpXG5cbmNsYXNzIE1vdmVEb3duVG9FZGdlIGV4dGVuZHMgTW92ZVVwVG9FZGdlXG4gIEBleHRlbmQoKVxuICBAZGVzY3JpcHRpb246IFwiTW92ZSBjdXJzb3IgZG93biB0byAqKmVkZ2UqKiBjaGFyIGF0IHNhbWUtY29sdW1uXCJcbiAgZGlyZWN0aW9uOiAnZG93bidcblxuIyB3b3JkXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIE1vdmVUb05leHRXb3JkIGV4dGVuZHMgTW90aW9uXG4gIEBleHRlbmQoKVxuICB3b3JkUmVnZXg6IG51bGxcblxuICBnZXRQb2ludDogKHBhdHRlcm4sIGZyb20pIC0+XG4gICAgd29yZFJhbmdlID0gbnVsbFxuICAgIGZvdW5kID0gZmFsc2VcbiAgICB2aW1FT0YgPSBAZ2V0VmltRW9mQnVmZmVyUG9zaXRpb24oQGVkaXRvcilcblxuICAgIEBzY2FuRm9yd2FyZCBwYXR0ZXJuLCB7ZnJvbX0sICh7cmFuZ2UsIG1hdGNoVGV4dCwgc3RvcH0pIC0+XG4gICAgICB3b3JkUmFuZ2UgPSByYW5nZVxuICAgICAgIyBJZ25vcmUgJ2VtcHR5IGxpbmUnIG1hdGNoZXMgYmV0d2VlbiAnXFxyJyBhbmQgJ1xcbidcbiAgICAgIHJldHVybiBpZiBtYXRjaFRleHQgaXMgJycgYW5kIHJhbmdlLnN0YXJ0LmNvbHVtbiBpc250IDBcbiAgICAgIGlmIHJhbmdlLnN0YXJ0LmlzR3JlYXRlclRoYW4oZnJvbSlcbiAgICAgICAgZm91bmQgPSB0cnVlXG4gICAgICAgIHN0b3AoKVxuXG4gICAgaWYgZm91bmRcbiAgICAgIHBvaW50ID0gd29yZFJhbmdlLnN0YXJ0XG4gICAgICBpZiBwb2ludElzQXRFbmRPZkxpbmVBdE5vbkVtcHR5Um93KEBlZGl0b3IsIHBvaW50KSBhbmQgbm90IHBvaW50LmlzRXF1YWwodmltRU9GKVxuICAgICAgICBwb2ludC50cmF2ZXJzZShbMSwgMF0pXG4gICAgICBlbHNlXG4gICAgICAgIHBvaW50XG4gICAgZWxzZVxuICAgICAgd29yZFJhbmdlPy5lbmQgPyBmcm9tXG5cbiAgIyBTcGVjaWFsIGNhc2U6IFwiY3dcIiBhbmQgXCJjV1wiIGFyZSB0cmVhdGVkIGxpa2UgXCJjZVwiIGFuZCBcImNFXCIgaWYgdGhlIGN1cnNvciBpc1xuICAjIG9uIGEgbm9uLWJsYW5rLiAgVGhpcyBpcyBiZWNhdXNlIFwiY3dcIiBpcyBpbnRlcnByZXRlZCBhcyBjaGFuZ2Utd29yZCwgYW5kIGFcbiAgIyB3b3JkIGRvZXMgbm90IGluY2x1ZGUgdGhlIGZvbGxvd2luZyB3aGl0ZSBzcGFjZS4gIHtWaTogXCJjd1wiIHdoZW4gb24gYSBibGFua1xuICAjIGZvbGxvd2VkIGJ5IG90aGVyIGJsYW5rcyBjaGFuZ2VzIG9ubHkgdGhlIGZpcnN0IGJsYW5rOyB0aGlzIGlzIHByb2JhYmx5IGFcbiAgIyBidWcsIGJlY2F1c2UgXCJkd1wiIGRlbGV0ZXMgYWxsIHRoZSBibGFua3N9XG4gICNcbiAgIyBBbm90aGVyIHNwZWNpYWwgY2FzZTogV2hlbiB1c2luZyB0aGUgXCJ3XCIgbW90aW9uIGluIGNvbWJpbmF0aW9uIHdpdGggYW5cbiAgIyBvcGVyYXRvciBhbmQgdGhlIGxhc3Qgd29yZCBtb3ZlZCBvdmVyIGlzIGF0IHRoZSBlbmQgb2YgYSBsaW5lLCB0aGUgZW5kIG9mXG4gICMgdGhhdCB3b3JkIGJlY29tZXMgdGhlIGVuZCBvZiB0aGUgb3BlcmF0ZWQgdGV4dCwgbm90IHRoZSBmaXJzdCB3b3JkIGluIHRoZVxuICAjIG5leHQgbGluZS5cbiAgbW92ZUN1cnNvcjogKGN1cnNvcikgLT5cbiAgICBjdXJzb3JQb3NpdGlvbiA9IGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXG4gICAgcmV0dXJuIGlmIHBvaW50SXNBdFZpbUVuZE9mRmlsZShAZWRpdG9yLCBjdXJzb3JQb3NpdGlvbilcbiAgICB3YXNPbldoaXRlU3BhY2UgPSBwb2ludElzT25XaGl0ZVNwYWNlKEBlZGl0b3IsIGN1cnNvclBvc2l0aW9uKVxuXG4gICAgaXNBc1RhcmdldEV4Y2VwdFNlbGVjdEluVmlzdWFsTW9kZSA9IEBpc0FzVGFyZ2V0RXhjZXB0U2VsZWN0SW5WaXN1YWxNb2RlKClcbiAgICBAbW92ZUN1cnNvckNvdW50VGltZXMgY3Vyc29yLCAoe2lzRmluYWx9KSA9PlxuICAgICAgY3Vyc29yUG9zaXRpb24gPSBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuICAgICAgaWYgaXNFbXB0eVJvdyhAZWRpdG9yLCBjdXJzb3JQb3NpdGlvbi5yb3cpIGFuZCBpc0FzVGFyZ2V0RXhjZXB0U2VsZWN0SW5WaXN1YWxNb2RlXG4gICAgICAgIHBvaW50ID0gY3Vyc29yUG9zaXRpb24udHJhdmVyc2UoWzEsIDBdKVxuICAgICAgZWxzZVxuICAgICAgICBwYXR0ZXJuID0gQHdvcmRSZWdleCA/IGN1cnNvci53b3JkUmVnRXhwKClcbiAgICAgICAgcG9pbnQgPSBAZ2V0UG9pbnQocGF0dGVybiwgY3Vyc29yUG9zaXRpb24pXG4gICAgICAgIGlmIGlzRmluYWwgYW5kIGlzQXNUYXJnZXRFeGNlcHRTZWxlY3RJblZpc3VhbE1vZGVcbiAgICAgICAgICBpZiBAb3BlcmF0b3IuaXMoJ0NoYW5nZScpIGFuZCAobm90IHdhc09uV2hpdGVTcGFjZSlcbiAgICAgICAgICAgIHBvaW50ID0gY3Vyc29yLmdldEVuZE9mQ3VycmVudFdvcmRCdWZmZXJQb3NpdGlvbih7QHdvcmRSZWdleH0pXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgcG9pbnQgPSBQb2ludC5taW4ocG9pbnQsIGdldEVuZE9mTGluZUZvckJ1ZmZlclJvdyhAZWRpdG9yLCBjdXJzb3JQb3NpdGlvbi5yb3cpKVxuICAgICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHBvaW50KVxuXG4jIGJcbmNsYXNzIE1vdmVUb1ByZXZpb3VzV29yZCBleHRlbmRzIE1vdGlvblxuICBAZXh0ZW5kKClcbiAgd29yZFJlZ2V4OiBudWxsXG5cbiAgbW92ZUN1cnNvcjogKGN1cnNvcikgLT5cbiAgICBAbW92ZUN1cnNvckNvdW50VGltZXMgY3Vyc29yLCA9PlxuICAgICAgcG9pbnQgPSBjdXJzb3IuZ2V0QmVnaW5uaW5nT2ZDdXJyZW50V29yZEJ1ZmZlclBvc2l0aW9uKHtAd29yZFJlZ2V4fSlcbiAgICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihwb2ludClcblxuY2xhc3MgTW92ZVRvRW5kT2ZXb3JkIGV4dGVuZHMgTW90aW9uXG4gIEBleHRlbmQoKVxuICB3b3JkUmVnZXg6IG51bGxcbiAgaW5jbHVzaXZlOiB0cnVlXG5cbiAgbW92ZVRvTmV4dEVuZE9mV29yZDogKGN1cnNvcikgLT5cbiAgICBtb3ZlQ3Vyc29yVG9OZXh0Tm9uV2hpdGVzcGFjZShjdXJzb3IpXG4gICAgcG9pbnQgPSBjdXJzb3IuZ2V0RW5kT2ZDdXJyZW50V29yZEJ1ZmZlclBvc2l0aW9uKHtAd29yZFJlZ2V4fSkudHJhbnNsYXRlKFswLCAtMV0pXG4gICAgcG9pbnQgPSBQb2ludC5taW4ocG9pbnQsIEBnZXRWaW1Fb2ZCdWZmZXJQb3NpdGlvbigpKVxuICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihwb2ludClcblxuICBtb3ZlQ3Vyc29yOiAoY3Vyc29yKSAtPlxuICAgIEBtb3ZlQ3Vyc29yQ291bnRUaW1lcyBjdXJzb3IsID0+XG4gICAgICBvcmlnaW5hbFBvaW50ID0gY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKClcbiAgICAgIEBtb3ZlVG9OZXh0RW5kT2ZXb3JkKGN1cnNvcilcbiAgICAgIGlmIG9yaWdpbmFsUG9pbnQuaXNFcXVhbChjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKSlcbiAgICAgICAgIyBSZXRyeSBmcm9tIHJpZ2h0IGNvbHVtbiBpZiBjdXJzb3Igd2FzIGFscmVhZHkgb24gRW5kT2ZXb3JkXG4gICAgICAgIGN1cnNvci5tb3ZlUmlnaHQoKVxuICAgICAgICBAbW92ZVRvTmV4dEVuZE9mV29yZChjdXJzb3IpXG5cbiMgW1RPRE86IEltcHJvdmUsIGFjY3VyYWN5XVxuY2xhc3MgTW92ZVRvUHJldmlvdXNFbmRPZldvcmQgZXh0ZW5kcyBNb3ZlVG9QcmV2aW91c1dvcmRcbiAgQGV4dGVuZCgpXG4gIGluY2x1c2l2ZTogdHJ1ZVxuXG4gIG1vdmVDdXJzb3I6IChjdXJzb3IpIC0+XG4gICAgdGltZXMgPSBAZ2V0Q291bnQoKVxuICAgIHdvcmRSYW5nZSA9IGN1cnNvci5nZXRDdXJyZW50V29yZEJ1ZmZlclJhbmdlKClcbiAgICBjdXJzb3JQb3NpdGlvbiA9IGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXG5cbiAgICAjIGlmIHdlJ3JlIGluIHRoZSBtaWRkbGUgb2YgYSB3b3JkIHRoZW4gd2UgbmVlZCB0byBtb3ZlIHRvIGl0cyBzdGFydFxuICAgIGlmIGN1cnNvclBvc2l0aW9uLmlzR3JlYXRlclRoYW4od29yZFJhbmdlLnN0YXJ0KSBhbmQgY3Vyc29yUG9zaXRpb24uaXNMZXNzVGhhbih3b3JkUmFuZ2UuZW5kKVxuICAgICAgdGltZXMgKz0gMVxuXG4gICAgZm9yIFsxLi50aW1lc11cbiAgICAgIHBvaW50ID0gY3Vyc29yLmdldEJlZ2lubmluZ09mQ3VycmVudFdvcmRCdWZmZXJQb3NpdGlvbih7QHdvcmRSZWdleH0pXG4gICAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24ocG9pbnQpXG5cbiAgICBAbW92ZVRvTmV4dEVuZE9mV29yZChjdXJzb3IpXG4gICAgaWYgY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKCkuaXNHcmVhdGVyVGhhbk9yRXF1YWwoY3Vyc29yUG9zaXRpb24pXG4gICAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24oWzAsIDBdKVxuXG4gIG1vdmVUb05leHRFbmRPZldvcmQ6IChjdXJzb3IpIC0+XG4gICAgcG9pbnQgPSBjdXJzb3IuZ2V0RW5kT2ZDdXJyZW50V29yZEJ1ZmZlclBvc2l0aW9uKHtAd29yZFJlZ2V4fSkudHJhbnNsYXRlKFswLCAtMV0pXG4gICAgcG9pbnQgPSBQb2ludC5taW4ocG9pbnQsIEBnZXRWaW1Fb2ZCdWZmZXJQb3NpdGlvbigpKVxuICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihwb2ludClcblxuIyBXaG9sZSB3b3JkXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIE1vdmVUb05leHRXaG9sZVdvcmQgZXh0ZW5kcyBNb3ZlVG9OZXh0V29yZFxuICBAZXh0ZW5kKClcbiAgd29yZFJlZ2V4OiAvXiR8XFxTKy9nXG5cbmNsYXNzIE1vdmVUb1ByZXZpb3VzV2hvbGVXb3JkIGV4dGVuZHMgTW92ZVRvUHJldmlvdXNXb3JkXG4gIEBleHRlbmQoKVxuICB3b3JkUmVnZXg6IC9eJHxcXFMrL2dcblxuY2xhc3MgTW92ZVRvRW5kT2ZXaG9sZVdvcmQgZXh0ZW5kcyBNb3ZlVG9FbmRPZldvcmRcbiAgQGV4dGVuZCgpXG4gIHdvcmRSZWdleDogL1xcUysvXG5cbiMgW1RPRE86IEltcHJvdmUsIGFjY3VyYWN5XVxuY2xhc3MgTW92ZVRvUHJldmlvdXNFbmRPZldob2xlV29yZCBleHRlbmRzIE1vdmVUb1ByZXZpb3VzRW5kT2ZXb3JkXG4gIEBleHRlbmQoKVxuICB3b3JkUmVnZXg6IC9cXFMrL1xuXG4jIEFscGhhbnVtZXJpYyB3b3JkIFtFeHBlcmltZW50YWxdXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIE1vdmVUb05leHRBbHBoYW51bWVyaWNXb3JkIGV4dGVuZHMgTW92ZVRvTmV4dFdvcmRcbiAgQGV4dGVuZCgpXG4gIEBkZXNjcmlwdGlvbjogXCJNb3ZlIHRvIG5leHQgYWxwaGFudW1lcmljKGAvXFx3Ky9gKSB3b3JkXCJcbiAgd29yZFJlZ2V4OiAvXFx3Ky9nXG5cbmNsYXNzIE1vdmVUb1ByZXZpb3VzQWxwaGFudW1lcmljV29yZCBleHRlbmRzIE1vdmVUb1ByZXZpb3VzV29yZFxuICBAZXh0ZW5kKClcbiAgQGRlc2NyaXB0aW9uOiBcIk1vdmUgdG8gcHJldmlvdXMgYWxwaGFudW1lcmljKGAvXFx3Ky9gKSB3b3JkXCJcbiAgd29yZFJlZ2V4OiAvXFx3Ky9cblxuY2xhc3MgTW92ZVRvRW5kT2ZBbHBoYW51bWVyaWNXb3JkIGV4dGVuZHMgTW92ZVRvRW5kT2ZXb3JkXG4gIEBleHRlbmQoKVxuICBAZGVzY3JpcHRpb246IFwiTW92ZSB0byBlbmQgb2YgYWxwaGFudW1lcmljKGAvXFx3Ky9gKSB3b3JkXCJcbiAgd29yZFJlZ2V4OiAvXFx3Ky9cblxuIyBBbHBoYW51bWVyaWMgd29yZCBbRXhwZXJpbWVudGFsXVxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBNb3ZlVG9OZXh0U21hcnRXb3JkIGV4dGVuZHMgTW92ZVRvTmV4dFdvcmRcbiAgQGV4dGVuZCgpXG4gIEBkZXNjcmlwdGlvbjogXCJNb3ZlIHRvIG5leHQgc21hcnQgd29yZCAoYC9bXFx3LV0rL2ApIHdvcmRcIlxuICB3b3JkUmVnZXg6IC9bXFx3LV0rL2dcblxuY2xhc3MgTW92ZVRvUHJldmlvdXNTbWFydFdvcmQgZXh0ZW5kcyBNb3ZlVG9QcmV2aW91c1dvcmRcbiAgQGV4dGVuZCgpXG4gIEBkZXNjcmlwdGlvbjogXCJNb3ZlIHRvIHByZXZpb3VzIHNtYXJ0IHdvcmQgKGAvW1xcdy1dKy9gKSB3b3JkXCJcbiAgd29yZFJlZ2V4OiAvW1xcdy1dKy9cblxuY2xhc3MgTW92ZVRvRW5kT2ZTbWFydFdvcmQgZXh0ZW5kcyBNb3ZlVG9FbmRPZldvcmRcbiAgQGV4dGVuZCgpXG4gIEBkZXNjcmlwdGlvbjogXCJNb3ZlIHRvIGVuZCBvZiBzbWFydCB3b3JkIChgL1tcXHctXSsvYCkgd29yZFwiXG4gIHdvcmRSZWdleDogL1tcXHctXSsvXG5cbiMgU3Vid29yZFxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBNb3ZlVG9OZXh0U3Vid29yZCBleHRlbmRzIE1vdmVUb05leHRXb3JkXG4gIEBleHRlbmQoKVxuICBtb3ZlQ3Vyc29yOiAoY3Vyc29yKSAtPlxuICAgIEB3b3JkUmVnZXggPSBjdXJzb3Iuc3Vid29yZFJlZ0V4cCgpXG4gICAgc3VwZXJcblxuY2xhc3MgTW92ZVRvUHJldmlvdXNTdWJ3b3JkIGV4dGVuZHMgTW92ZVRvUHJldmlvdXNXb3JkXG4gIEBleHRlbmQoKVxuICBtb3ZlQ3Vyc29yOiAoY3Vyc29yKSAtPlxuICAgIEB3b3JkUmVnZXggPSBjdXJzb3Iuc3Vid29yZFJlZ0V4cCgpXG4gICAgc3VwZXJcblxuY2xhc3MgTW92ZVRvRW5kT2ZTdWJ3b3JkIGV4dGVuZHMgTW92ZVRvRW5kT2ZXb3JkXG4gIEBleHRlbmQoKVxuICBtb3ZlQ3Vyc29yOiAoY3Vyc29yKSAtPlxuICAgIEB3b3JkUmVnZXggPSBjdXJzb3Iuc3Vid29yZFJlZ0V4cCgpXG4gICAgc3VwZXJcblxuIyBTZW50ZW5jZVxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIFNlbnRlbmNlIGlzIGRlZmluZWQgYXMgYmVsb3dcbiMgIC0gZW5kIHdpdGggWycuJywgJyEnLCAnPyddXG4jICAtIG9wdGlvbmFsbHkgZm9sbG93ZWQgYnkgWycpJywgJ10nLCAnXCInLCBcIidcIl1cbiMgIC0gZm9sbG93ZWQgYnkgWyckJywgJyAnLCAnXFx0J11cbiMgIC0gcGFyYWdyYXBoIGJvdW5kYXJ5IGlzIGFsc28gc2VudGVuY2UgYm91bmRhcnlcbiMgIC0gc2VjdGlvbiBib3VuZGFyeSBpcyBhbHNvIHNlbnRlbmNlIGJvdW5kYXJ5KGlnbm9yZSlcbmNsYXNzIE1vdmVUb05leHRTZW50ZW5jZSBleHRlbmRzIE1vdGlvblxuICBAZXh0ZW5kKClcbiAganVtcDogdHJ1ZVxuICBzZW50ZW5jZVJlZ2V4OiAvLy8oPzpbXFwuIVxcP11bXFwpXFxdXCInXSpcXHMrKXwoXFxufFxcclxcbikvLy9nXG4gIGRpcmVjdGlvbjogJ25leHQnXG5cbiAgbW92ZUN1cnNvcjogKGN1cnNvcikgLT5cbiAgICBAbW92ZUN1cnNvckNvdW50VGltZXMgY3Vyc29yLCA9PlxuICAgICAgQHNldEJ1ZmZlclBvc2l0aW9uU2FmZWx5KGN1cnNvciwgQGdldFBvaW50KGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpKSlcblxuICBnZXRQb2ludDogKGZyb21Qb2ludCkgLT5cbiAgICBpZiBAZGlyZWN0aW9uIGlzICduZXh0J1xuICAgICAgQGdldE5leHRTdGFydE9mU2VudGVuY2UoZnJvbVBvaW50KVxuICAgIGVsc2UgaWYgQGRpcmVjdGlvbiBpcyAncHJldmlvdXMnXG4gICAgICBAZ2V0UHJldmlvdXNTdGFydE9mU2VudGVuY2UoZnJvbVBvaW50KVxuXG4gIGlzQmxhbmtSb3c6IChyb3cpIC0+XG4gICAgQGVkaXRvci5pc0J1ZmZlclJvd0JsYW5rKHJvdylcblxuICBnZXROZXh0U3RhcnRPZlNlbnRlbmNlOiAoZnJvbSkgLT5cbiAgICBmb3VuZFBvaW50ID0gbnVsbFxuICAgIEBzY2FuRm9yd2FyZCBAc2VudGVuY2VSZWdleCwge2Zyb219LCAoe3JhbmdlLCBtYXRjaFRleHQsIG1hdGNoLCBzdG9wfSkgPT5cbiAgICAgIGlmIG1hdGNoWzFdP1xuICAgICAgICBbc3RhcnRSb3csIGVuZFJvd10gPSBbcmFuZ2Uuc3RhcnQucm93LCByYW5nZS5lbmQucm93XVxuICAgICAgICByZXR1cm4gaWYgQHNraXBCbGFua1JvdyBhbmQgQGlzQmxhbmtSb3coZW5kUm93KVxuICAgICAgICBpZiBAaXNCbGFua1JvdyhzdGFydFJvdykgaXNudCBAaXNCbGFua1JvdyhlbmRSb3cpXG4gICAgICAgICAgZm91bmRQb2ludCA9IEBnZXRGaXJzdENoYXJhY3RlclBvc2l0aW9uRm9yQnVmZmVyUm93KGVuZFJvdylcbiAgICAgIGVsc2VcbiAgICAgICAgZm91bmRQb2ludCA9IHJhbmdlLmVuZFxuICAgICAgc3RvcCgpIGlmIGZvdW5kUG9pbnQ/XG4gICAgZm91bmRQb2ludCA/IEBnZXRWaW1Fb2ZCdWZmZXJQb3NpdGlvbigpXG5cbiAgZ2V0UHJldmlvdXNTdGFydE9mU2VudGVuY2U6IChmcm9tKSAtPlxuICAgIGZvdW5kUG9pbnQgPSBudWxsXG4gICAgQHNjYW5CYWNrd2FyZCBAc2VudGVuY2VSZWdleCwge2Zyb219LCAoe3JhbmdlLCBtYXRjaCwgc3RvcCwgbWF0Y2hUZXh0fSkgPT5cbiAgICAgIGlmIG1hdGNoWzFdP1xuICAgICAgICBbc3RhcnRSb3csIGVuZFJvd10gPSBbcmFuZ2Uuc3RhcnQucm93LCByYW5nZS5lbmQucm93XVxuICAgICAgICBpZiBub3QgQGlzQmxhbmtSb3coZW5kUm93KSBhbmQgQGlzQmxhbmtSb3coc3RhcnRSb3cpXG4gICAgICAgICAgcG9pbnQgPSBAZ2V0Rmlyc3RDaGFyYWN0ZXJQb3NpdGlvbkZvckJ1ZmZlclJvdyhlbmRSb3cpXG4gICAgICAgICAgaWYgcG9pbnQuaXNMZXNzVGhhbihmcm9tKVxuICAgICAgICAgICAgZm91bmRQb2ludCA9IHBvaW50XG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmV0dXJuIGlmIEBza2lwQmxhbmtSb3dcbiAgICAgICAgICAgIGZvdW5kUG9pbnQgPSBAZ2V0Rmlyc3RDaGFyYWN0ZXJQb3NpdGlvbkZvckJ1ZmZlclJvdyhzdGFydFJvdylcbiAgICAgIGVsc2VcbiAgICAgICAgaWYgcmFuZ2UuZW5kLmlzTGVzc1RoYW4oZnJvbSlcbiAgICAgICAgICBmb3VuZFBvaW50ID0gcmFuZ2UuZW5kXG4gICAgICBzdG9wKCkgaWYgZm91bmRQb2ludD9cbiAgICBmb3VuZFBvaW50ID8gWzAsIDBdXG5cbmNsYXNzIE1vdmVUb1ByZXZpb3VzU2VudGVuY2UgZXh0ZW5kcyBNb3ZlVG9OZXh0U2VudGVuY2VcbiAgQGV4dGVuZCgpXG4gIGRpcmVjdGlvbjogJ3ByZXZpb3VzJ1xuXG5jbGFzcyBNb3ZlVG9OZXh0U2VudGVuY2VTa2lwQmxhbmtSb3cgZXh0ZW5kcyBNb3ZlVG9OZXh0U2VudGVuY2VcbiAgQGV4dGVuZCgpXG4gIHNraXBCbGFua1JvdzogdHJ1ZVxuXG5jbGFzcyBNb3ZlVG9QcmV2aW91c1NlbnRlbmNlU2tpcEJsYW5rUm93IGV4dGVuZHMgTW92ZVRvUHJldmlvdXNTZW50ZW5jZVxuICBAZXh0ZW5kKClcbiAgc2tpcEJsYW5rUm93OiB0cnVlXG5cbiMgUGFyYWdyYXBoXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIE1vdmVUb05leHRQYXJhZ3JhcGggZXh0ZW5kcyBNb3Rpb25cbiAgQGV4dGVuZCgpXG4gIGp1bXA6IHRydWVcbiAgZGlyZWN0aW9uOiAnbmV4dCdcblxuICBtb3ZlQ3Vyc29yOiAoY3Vyc29yKSAtPlxuICAgIEBtb3ZlQ3Vyc29yQ291bnRUaW1lcyBjdXJzb3IsID0+XG4gICAgICBAc2V0QnVmZmVyUG9zaXRpb25TYWZlbHkoY3Vyc29yLCBAZ2V0UG9pbnQoY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKCkpKVxuXG4gIGdldFBvaW50OiAoZnJvbVBvaW50KSAtPlxuICAgIHN0YXJ0Um93ID0gZnJvbVBvaW50LnJvd1xuICAgIHdhc0F0Tm9uQmxhbmtSb3cgPSBub3QgQGVkaXRvci5pc0J1ZmZlclJvd0JsYW5rKHN0YXJ0Um93KVxuICAgIGZvciByb3cgaW4gZ2V0QnVmZmVyUm93cyhAZWRpdG9yLCB7c3RhcnRSb3csIEBkaXJlY3Rpb259KVxuICAgICAgaWYgQGVkaXRvci5pc0J1ZmZlclJvd0JsYW5rKHJvdylcbiAgICAgICAgcmV0dXJuIG5ldyBQb2ludChyb3csIDApIGlmIHdhc0F0Tm9uQmxhbmtSb3dcbiAgICAgIGVsc2VcbiAgICAgICAgd2FzQXROb25CbGFua1JvdyA9IHRydWVcblxuICAgICMgZmFsbGJhY2tcbiAgICBzd2l0Y2ggQGRpcmVjdGlvblxuICAgICAgd2hlbiAncHJldmlvdXMnIHRoZW4gbmV3IFBvaW50KDAsIDApXG4gICAgICB3aGVuICduZXh0JyB0aGVuIEBnZXRWaW1Fb2ZCdWZmZXJQb3NpdGlvbigpXG5cbmNsYXNzIE1vdmVUb1ByZXZpb3VzUGFyYWdyYXBoIGV4dGVuZHMgTW92ZVRvTmV4dFBhcmFncmFwaFxuICBAZXh0ZW5kKClcbiAgZGlyZWN0aW9uOiAncHJldmlvdXMnXG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBrZXltYXA6IDBcbmNsYXNzIE1vdmVUb0JlZ2lubmluZ09mTGluZSBleHRlbmRzIE1vdGlvblxuICBAZXh0ZW5kKClcblxuICBtb3ZlQ3Vyc29yOiAoY3Vyc29yKSAtPlxuICAgIHNldEJ1ZmZlckNvbHVtbihjdXJzb3IsIDApXG5cbmNsYXNzIE1vdmVUb0NvbHVtbiBleHRlbmRzIE1vdGlvblxuICBAZXh0ZW5kKClcblxuICBtb3ZlQ3Vyc29yOiAoY3Vyc29yKSAtPlxuICAgIHNldEJ1ZmZlckNvbHVtbihjdXJzb3IsIEBnZXRDb3VudCgtMSkpXG5cbmNsYXNzIE1vdmVUb0xhc3RDaGFyYWN0ZXJPZkxpbmUgZXh0ZW5kcyBNb3Rpb25cbiAgQGV4dGVuZCgpXG5cbiAgbW92ZUN1cnNvcjogKGN1cnNvcikgLT5cbiAgICByb3cgPSBnZXRWYWxpZFZpbUJ1ZmZlclJvdyhAZWRpdG9yLCBjdXJzb3IuZ2V0QnVmZmVyUm93KCkgKyBAZ2V0Q291bnQoLTEpKVxuICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihbcm93LCBJbmZpbml0eV0pXG4gICAgY3Vyc29yLmdvYWxDb2x1bW4gPSBJbmZpbml0eVxuXG5jbGFzcyBNb3ZlVG9MYXN0Tm9uYmxhbmtDaGFyYWN0ZXJPZkxpbmVBbmREb3duIGV4dGVuZHMgTW90aW9uXG4gIEBleHRlbmQoKVxuICBpbmNsdXNpdmU6IHRydWVcblxuICBtb3ZlQ3Vyc29yOiAoY3Vyc29yKSAtPlxuICAgIHBvaW50ID0gQGdldFBvaW50KGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpKVxuICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihwb2ludClcblxuICBnZXRQb2ludDogKHtyb3d9KSAtPlxuICAgIHJvdyA9IGxpbWl0TnVtYmVyKHJvdyArIEBnZXRDb3VudCgtMSksIG1heDogQGdldFZpbUxhc3RCdWZmZXJSb3coKSlcbiAgICByYW5nZSA9IGZpbmRSYW5nZUluQnVmZmVyUm93KEBlZGl0b3IsIC9cXFN8Xi8sIHJvdywgZGlyZWN0aW9uOiAnYmFja3dhcmQnKVxuICAgIHJhbmdlPy5zdGFydCA/IG5ldyBQb2ludChyb3csIDApXG5cbiMgTW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmUgZmFpbWlseVxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgXlxuY2xhc3MgTW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmUgZXh0ZW5kcyBNb3Rpb25cbiAgQGV4dGVuZCgpXG4gIG1vdmVDdXJzb3I6IChjdXJzb3IpIC0+XG4gICAgcG9pbnQgPSBAZ2V0Rmlyc3RDaGFyYWN0ZXJQb3NpdGlvbkZvckJ1ZmZlclJvdyhjdXJzb3IuZ2V0QnVmZmVyUm93KCkpXG4gICAgQHNldEJ1ZmZlclBvc2l0aW9uU2FmZWx5KGN1cnNvciwgcG9pbnQpXG5cbmNsYXNzIE1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lVXAgZXh0ZW5kcyBNb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZVxuICBAZXh0ZW5kKClcbiAgd2lzZTogJ2xpbmV3aXNlJ1xuICBtb3ZlQ3Vyc29yOiAoY3Vyc29yKSAtPlxuICAgIEBtb3ZlQ3Vyc29yQ291bnRUaW1lcyBjdXJzb3IsIC0+XG4gICAgICBwb2ludCA9IGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXG4gICAgICB1bmxlc3MgcG9pbnQucm93IGlzIDBcbiAgICAgICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHBvaW50LnRyYW5zbGF0ZShbLTEsIDBdKSlcbiAgICBzdXBlclxuXG5jbGFzcyBNb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZURvd24gZXh0ZW5kcyBNb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZVxuICBAZXh0ZW5kKClcbiAgd2lzZTogJ2xpbmV3aXNlJ1xuICBtb3ZlQ3Vyc29yOiAoY3Vyc29yKSAtPlxuICAgIEBtb3ZlQ3Vyc29yQ291bnRUaW1lcyBjdXJzb3IsID0+XG4gICAgICBwb2ludCA9IGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXG4gICAgICB1bmxlc3MgQGdldFZpbUxhc3RCdWZmZXJSb3coKSBpcyBwb2ludC5yb3dcbiAgICAgICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHBvaW50LnRyYW5zbGF0ZShbKzEsIDBdKSlcbiAgICBzdXBlclxuXG5jbGFzcyBNb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZUFuZERvd24gZXh0ZW5kcyBNb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZURvd25cbiAgQGV4dGVuZCgpXG4gIGRlZmF1bHRDb3VudDogMFxuICBnZXRDb3VudDogLT4gc3VwZXIgLSAxXG5cbiMga2V5bWFwOiBnIGdcbmNsYXNzIE1vdmVUb0ZpcnN0TGluZSBleHRlbmRzIE1vdGlvblxuICBAZXh0ZW5kKClcbiAgd2lzZTogJ2xpbmV3aXNlJ1xuICBqdW1wOiB0cnVlXG4gIHZlcnRpY2FsTW90aW9uOiB0cnVlXG4gIG1vdmVTdWNjZXNzT25MaW5ld2lzZTogdHJ1ZVxuXG4gIG1vdmVDdXJzb3I6IChjdXJzb3IpIC0+XG4gICAgQHNldEN1cnNvckJ1ZmZlclJvdyhjdXJzb3IsIGdldFZhbGlkVmltQnVmZmVyUm93KEBlZGl0b3IsIEBnZXRSb3coKSkpXG4gICAgY3Vyc29yLmF1dG9zY3JvbGwoY2VudGVyOiB0cnVlKVxuXG4gIGdldFJvdzogLT5cbiAgICBAZ2V0Q291bnQoLTEpXG5cbmNsYXNzIE1vdmVUb1NjcmVlbkNvbHVtbiBleHRlbmRzIE1vdGlvblxuICBAZXh0ZW5kKGZhbHNlKVxuICBtb3ZlQ3Vyc29yOiAoY3Vyc29yKSAtPlxuICAgIGFsbG93T2ZmU2NyZWVuUG9zaXRpb24gPSBAZ2V0Q29uZmlnKFwiYWxsb3dNb3ZlVG9PZmZTY3JlZW5Db2x1bW5PblNjcmVlbkxpbmVNb3Rpb25cIilcbiAgICBwb2ludCA9IEB2aW1TdGF0ZS51dGlscy5nZXRTY3JlZW5Qb3NpdGlvbkZvclNjcmVlblJvdyhAZWRpdG9yLCBjdXJzb3IuZ2V0U2NyZWVuUm93KCksIEB3aGljaCwge2FsbG93T2ZmU2NyZWVuUG9zaXRpb259KVxuICAgIEBzZXRTY3JlZW5Qb3NpdGlvblNhZmVseShjdXJzb3IsIHBvaW50KVxuXG4jIGtleW1hcDogZyAwXG5jbGFzcyBNb3ZlVG9CZWdpbm5pbmdPZlNjcmVlbkxpbmUgZXh0ZW5kcyBNb3ZlVG9TY3JlZW5Db2x1bW5cbiAgQGV4dGVuZCgpXG4gIHdoaWNoOiBcImJlZ2lubmluZ1wiXG5cbiMgZyBeOiBgbW92ZS10by1maXJzdC1jaGFyYWN0ZXItb2Ytc2NyZWVuLWxpbmVgXG5jbGFzcyBNb3ZlVG9GaXJzdENoYXJhY3Rlck9mU2NyZWVuTGluZSBleHRlbmRzIE1vdmVUb1NjcmVlbkNvbHVtblxuICBAZXh0ZW5kKClcbiAgd2hpY2g6IFwiZmlyc3QtY2hhcmFjdGVyXCJcblxuIyBrZXltYXA6IGcgJFxuY2xhc3MgTW92ZVRvTGFzdENoYXJhY3Rlck9mU2NyZWVuTGluZSBleHRlbmRzIE1vdmVUb1NjcmVlbkNvbHVtblxuICBAZXh0ZW5kKClcbiAgd2hpY2g6IFwibGFzdC1jaGFyYWN0ZXJcIlxuXG4jIGtleW1hcDogR1xuY2xhc3MgTW92ZVRvTGFzdExpbmUgZXh0ZW5kcyBNb3ZlVG9GaXJzdExpbmVcbiAgQGV4dGVuZCgpXG4gIGRlZmF1bHRDb3VudDogSW5maW5pdHlcblxuIyBrZXltYXA6IE4lIGUuZy4gMTAlXG5jbGFzcyBNb3ZlVG9MaW5lQnlQZXJjZW50IGV4dGVuZHMgTW92ZVRvRmlyc3RMaW5lXG4gIEBleHRlbmQoKVxuXG4gIGdldFJvdzogLT5cbiAgICBwZXJjZW50ID0gbGltaXROdW1iZXIoQGdldENvdW50KCksIG1heDogMTAwKVxuICAgIE1hdGguZmxvb3IoKEBlZGl0b3IuZ2V0TGluZUNvdW50KCkgLSAxKSAqIChwZXJjZW50IC8gMTAwKSlcblxuY2xhc3MgTW92ZVRvUmVsYXRpdmVMaW5lIGV4dGVuZHMgTW90aW9uXG4gIEBleHRlbmQoZmFsc2UpXG4gIHdpc2U6ICdsaW5ld2lzZSdcbiAgbW92ZVN1Y2Nlc3NPbkxpbmV3aXNlOiB0cnVlXG5cbiAgbW92ZUN1cnNvcjogKGN1cnNvcikgLT5cbiAgICByb3cgPSBAZ2V0Rm9sZEVuZFJvd0ZvclJvdyhjdXJzb3IuZ2V0QnVmZmVyUm93KCkpXG5cbiAgICBjb3VudCA9IEBnZXRDb3VudCgtMSlcbiAgICB3aGlsZSAoY291bnQgPiAwKVxuICAgICAgcm93ID0gQGdldEZvbGRFbmRSb3dGb3JSb3cocm93ICsgMSlcbiAgICAgIGNvdW50LS1cblxuICAgIHNldEJ1ZmZlclJvdyhjdXJzb3IsIHJvdylcblxuY2xhc3MgTW92ZVRvUmVsYXRpdmVMaW5lTWluaW11bU9uZSBleHRlbmRzIE1vdmVUb1JlbGF0aXZlTGluZVxuICBAZXh0ZW5kKGZhbHNlKVxuXG4gIGdldENvdW50OiAtPlxuICAgIGxpbWl0TnVtYmVyKHN1cGVyLCBtaW46IDEpXG5cbiMgUG9zaXRpb24gY3Vyc29yIHdpdGhvdXQgc2Nyb2xsaW5nLiwgSCwgTSwgTFxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIGtleW1hcDogSFxuY2xhc3MgTW92ZVRvVG9wT2ZTY3JlZW4gZXh0ZW5kcyBNb3Rpb25cbiAgQGV4dGVuZCgpXG4gIHdpc2U6ICdsaW5ld2lzZSdcbiAganVtcDogdHJ1ZVxuICBzY3JvbGxvZmY6IDJcbiAgZGVmYXVsdENvdW50OiAwXG4gIHZlcnRpY2FsTW90aW9uOiB0cnVlXG5cbiAgbW92ZUN1cnNvcjogKGN1cnNvcikgLT5cbiAgICBidWZmZXJSb3cgPSBAZWRpdG9yLmJ1ZmZlclJvd0ZvclNjcmVlblJvdyhAZ2V0U2NyZWVuUm93KCkpXG4gICAgQHNldEN1cnNvckJ1ZmZlclJvdyhjdXJzb3IsIGJ1ZmZlclJvdylcblxuICBnZXRTY3JvbGxvZmY6IC0+XG4gICAgaWYgQGlzQXNUYXJnZXRFeGNlcHRTZWxlY3RJblZpc3VhbE1vZGUoKVxuICAgICAgMFxuICAgIGVsc2VcbiAgICAgIEBzY3JvbGxvZmZcblxuICBnZXRTY3JlZW5Sb3c6IC0+XG4gICAgZmlyc3RSb3cgPSBnZXRGaXJzdFZpc2libGVTY3JlZW5Sb3coQGVkaXRvcilcbiAgICBvZmZzZXQgPSBAZ2V0U2Nyb2xsb2ZmKClcbiAgICBvZmZzZXQgPSAwIGlmIGZpcnN0Um93IGlzIDBcbiAgICBvZmZzZXQgPSBsaW1pdE51bWJlcihAZ2V0Q291bnQoLTEpLCBtaW46IG9mZnNldClcbiAgICBmaXJzdFJvdyArIG9mZnNldFxuXG4jIGtleW1hcDogTVxuY2xhc3MgTW92ZVRvTWlkZGxlT2ZTY3JlZW4gZXh0ZW5kcyBNb3ZlVG9Ub3BPZlNjcmVlblxuICBAZXh0ZW5kKClcbiAgZ2V0U2NyZWVuUm93OiAtPlxuICAgIHN0YXJ0Um93ID0gZ2V0Rmlyc3RWaXNpYmxlU2NyZWVuUm93KEBlZGl0b3IpXG4gICAgZW5kUm93ID0gbGltaXROdW1iZXIoQGVkaXRvci5nZXRMYXN0VmlzaWJsZVNjcmVlblJvdygpLCBtYXg6IEBnZXRWaW1MYXN0U2NyZWVuUm93KCkpXG4gICAgc3RhcnRSb3cgKyBNYXRoLmZsb29yKChlbmRSb3cgLSBzdGFydFJvdykgLyAyKVxuXG4jIGtleW1hcDogTFxuY2xhc3MgTW92ZVRvQm90dG9tT2ZTY3JlZW4gZXh0ZW5kcyBNb3ZlVG9Ub3BPZlNjcmVlblxuICBAZXh0ZW5kKClcbiAgZ2V0U2NyZWVuUm93OiAtPlxuICAgICMgW0ZJWE1FXVxuICAgICMgQXQgbGVhc3QgQXRvbSB2MS42LjAsIHRoZXJlIGFyZSB0d28gaW1wbGVtZW50YXRpb24gb2YgZ2V0TGFzdFZpc2libGVTY3JlZW5Sb3coKVxuICAgICMgZWRpdG9yLmdldExhc3RWaXNpYmxlU2NyZWVuUm93KCkgYW5kIGVkaXRvckVsZW1lbnQuZ2V0TGFzdFZpc2libGVTY3JlZW5Sb3coKVxuICAgICMgVGhvc2UgdHdvIG1ldGhvZHMgcmV0dXJuIGRpZmZlcmVudCB2YWx1ZSwgZWRpdG9yJ3Mgb25lIGlzIGNvcnJlbnQuXG4gICAgIyBTbyBJIGludGVudGlvbmFsbHkgdXNlIGVkaXRvci5nZXRMYXN0U2NyZWVuUm93IGhlcmUuXG4gICAgdmltTGFzdFNjcmVlblJvdyA9IEBnZXRWaW1MYXN0U2NyZWVuUm93KClcbiAgICByb3cgPSBsaW1pdE51bWJlcihAZWRpdG9yLmdldExhc3RWaXNpYmxlU2NyZWVuUm93KCksIG1heDogdmltTGFzdFNjcmVlblJvdylcbiAgICBvZmZzZXQgPSBAZ2V0U2Nyb2xsb2ZmKCkgKyAxXG4gICAgb2Zmc2V0ID0gMCBpZiByb3cgaXMgdmltTGFzdFNjcmVlblJvd1xuICAgIG9mZnNldCA9IGxpbWl0TnVtYmVyKEBnZXRDb3VudCgtMSksIG1pbjogb2Zmc2V0KVxuICAgIHJvdyAtIG9mZnNldFxuXG4jIFNjcm9sbGluZ1xuIyBIYWxmOiBjdHJsLWQsIGN0cmwtdVxuIyBGdWxsOiBjdHJsLWYsIGN0cmwtYlxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIFtGSVhNRV0gY291bnQgYmVoYXZlIGRpZmZlcmVudGx5IGZyb20gb3JpZ2luYWwgVmltLlxuY2xhc3MgU2Nyb2xsIGV4dGVuZHMgTW90aW9uXG4gIEBleHRlbmQoZmFsc2UpXG4gIHZlcnRpY2FsTW90aW9uOiB0cnVlXG5cbiAgaXNTbW9vdGhTY3JvbGxFbmFibGVkOiAtPlxuICAgIGlmIE1hdGguYWJzKEBhbW91bnRPZlBhZ2UpIGlzIDFcbiAgICAgIEBnZXRDb25maWcoJ3Ntb290aFNjcm9sbE9uRnVsbFNjcm9sbE1vdGlvbicpXG4gICAgZWxzZVxuICAgICAgQGdldENvbmZpZygnc21vb3RoU2Nyb2xsT25IYWxmU2Nyb2xsTW90aW9uJylcblxuICBnZXRTbW9vdGhTY3JvbGxEdWF0aW9uOiAtPlxuICAgIGlmIE1hdGguYWJzKEBhbW91bnRPZlBhZ2UpIGlzIDFcbiAgICAgIEBnZXRDb25maWcoJ3Ntb290aFNjcm9sbE9uRnVsbFNjcm9sbE1vdGlvbkR1cmF0aW9uJylcbiAgICBlbHNlXG4gICAgICBAZ2V0Q29uZmlnKCdzbW9vdGhTY3JvbGxPbkhhbGZTY3JvbGxNb3Rpb25EdXJhdGlvbicpXG5cbiAgZ2V0UGl4ZWxSZWN0VG9wRm9yU2NlZW5Sb3c6IChyb3cpIC0+XG4gICAgcG9pbnQgPSBuZXcgUG9pbnQocm93LCAwKVxuICAgIEBlZGl0b3IuZWxlbWVudC5waXhlbFJlY3RGb3JTY3JlZW5SYW5nZShuZXcgUmFuZ2UocG9pbnQsIHBvaW50KSkudG9wXG5cbiAgc21vb3RoU2Nyb2xsOiAoZnJvbVJvdywgdG9Sb3csIGRvbmUpIC0+XG4gICAgdG9wUGl4ZWxGcm9tID0ge3RvcDogQGdldFBpeGVsUmVjdFRvcEZvclNjZWVuUm93KGZyb21Sb3cpfVxuICAgIHRvcFBpeGVsVG8gPSB7dG9wOiBAZ2V0UGl4ZWxSZWN0VG9wRm9yU2NlZW5Sb3codG9Sb3cpfVxuICAgICMgW05PVEVdXG4gICAgIyBpbnRlbnRpb25hbGx5IHVzZSBgZWxlbWVudC5jb21wb25lbnQuc2V0U2Nyb2xsVG9wYCBpbnN0ZWFkIG9mIGBlbGVtZW50LnNldFNjcm9sbFRvcGAuXG4gICAgIyBTSW5jZSBlbGVtZW50LnNldFNjcm9sbFRvcCB3aWxsIHRocm93IGV4Y2VwdGlvbiB3aGVuIGVsZW1lbnQuY29tcG9uZW50IG5vIGxvbmdlciBleGlzdHMuXG4gICAgc3RlcCA9IChuZXdUb3ApID0+XG4gICAgICBpZiBAZWRpdG9yLmVsZW1lbnQuY29tcG9uZW50P1xuICAgICAgICBAZWRpdG9yLmVsZW1lbnQuY29tcG9uZW50LnNldFNjcm9sbFRvcChuZXdUb3ApXG4gICAgICAgIEBlZGl0b3IuZWxlbWVudC5jb21wb25lbnQudXBkYXRlU3luYygpXG5cbiAgICBkdXJhdGlvbiA9IEBnZXRTbW9vdGhTY3JvbGxEdWF0aW9uKClcbiAgICBAdmltU3RhdGUucmVxdWVzdFNjcm9sbEFuaW1hdGlvbih0b3BQaXhlbEZyb20sIHRvcFBpeGVsVG8sIHtkdXJhdGlvbiwgc3RlcCwgZG9uZX0pXG5cbiAgZ2V0QW1vdW50T2ZSb3dzOiAtPlxuICAgIE1hdGguY2VpbChAYW1vdW50T2ZQYWdlICogQGVkaXRvci5nZXRSb3dzUGVyUGFnZSgpICogQGdldENvdW50KCkpXG5cbiAgZ2V0QnVmZmVyUm93OiAoY3Vyc29yKSAtPlxuICAgIHNjcmVlblJvdyA9IGdldFZhbGlkVmltU2NyZWVuUm93KEBlZGl0b3IsIGN1cnNvci5nZXRTY3JlZW5Sb3coKSArIEBnZXRBbW91bnRPZlJvd3MoKSlcbiAgICBAZWRpdG9yLmJ1ZmZlclJvd0ZvclNjcmVlblJvdyhzY3JlZW5Sb3cpXG5cbiAgbW92ZUN1cnNvcjogKGN1cnNvcikgLT5cbiAgICBidWZmZXJSb3cgPSBAZ2V0QnVmZmVyUm93KGN1cnNvcilcbiAgICBAc2V0Q3Vyc29yQnVmZmVyUm93KGN1cnNvciwgQGdldEJ1ZmZlclJvdyhjdXJzb3IpLCBhdXRvc2Nyb2xsOiBmYWxzZSlcblxuICAgIGlmIGN1cnNvci5pc0xhc3RDdXJzb3IoKVxuICAgICAgaWYgQGlzU21vb3RoU2Nyb2xsRW5hYmxlZCgpXG4gICAgICAgIEB2aW1TdGF0ZS5maW5pc2hTY3JvbGxBbmltYXRpb24oKVxuXG4gICAgICBmaXJzdFZpc2liaWxlU2NyZWVuUm93ID0gQGVkaXRvci5nZXRGaXJzdFZpc2libGVTY3JlZW5Sb3coKVxuICAgICAgbmV3Rmlyc3RWaXNpYmlsZUJ1ZmZlclJvdyA9IEBlZGl0b3IuYnVmZmVyUm93Rm9yU2NyZWVuUm93KGZpcnN0VmlzaWJpbGVTY3JlZW5Sb3cgKyBAZ2V0QW1vdW50T2ZSb3dzKCkpXG4gICAgICBuZXdGaXJzdFZpc2liaWxlU2NyZWVuUm93ID0gQGVkaXRvci5zY3JlZW5Sb3dGb3JCdWZmZXJSb3cobmV3Rmlyc3RWaXNpYmlsZUJ1ZmZlclJvdylcbiAgICAgIGRvbmUgPSA9PlxuICAgICAgICBAZWRpdG9yLnNldEZpcnN0VmlzaWJsZVNjcmVlblJvdyhuZXdGaXJzdFZpc2liaWxlU2NyZWVuUm93KVxuICAgICAgICAjIFtGSVhNRV0gc29tZXRpbWVzLCBzY3JvbGxUb3AgaXMgbm90IHVwZGF0ZWQsIGNhbGxpbmcgdGhpcyBmaXguXG4gICAgICAgICMgSW52ZXN0aWdhdGUgYW5kIGZpbmQgYmV0dGVyIGFwcHJvYWNoIHRoZW4gcmVtb3ZlIHRoaXMgd29ya2Fyb3VuZC5cbiAgICAgICAgQGVkaXRvci5lbGVtZW50LmNvbXBvbmVudD8udXBkYXRlU3luYygpXG5cbiAgICAgIGlmIEBpc1Ntb290aFNjcm9sbEVuYWJsZWQoKVxuICAgICAgICBAc21vb3RoU2Nyb2xsKGZpcnN0VmlzaWJpbGVTY3JlZW5Sb3csIG5ld0ZpcnN0VmlzaWJpbGVTY3JlZW5Sb3csIGRvbmUpXG4gICAgICBlbHNlXG4gICAgICAgIGRvbmUoKVxuXG5cbiMga2V5bWFwOiBjdHJsLWZcbmNsYXNzIFNjcm9sbEZ1bGxTY3JlZW5Eb3duIGV4dGVuZHMgU2Nyb2xsXG4gIEBleHRlbmQodHJ1ZSlcbiAgYW1vdW50T2ZQYWdlOiArMVxuXG4jIGtleW1hcDogY3RybC1iXG5jbGFzcyBTY3JvbGxGdWxsU2NyZWVuVXAgZXh0ZW5kcyBTY3JvbGxcbiAgQGV4dGVuZCgpXG4gIGFtb3VudE9mUGFnZTogLTFcblxuIyBrZXltYXA6IGN0cmwtZFxuY2xhc3MgU2Nyb2xsSGFsZlNjcmVlbkRvd24gZXh0ZW5kcyBTY3JvbGxcbiAgQGV4dGVuZCgpXG4gIGFtb3VudE9mUGFnZTogKzEgLyAyXG5cbiMga2V5bWFwOiBjdHJsLXVcbmNsYXNzIFNjcm9sbEhhbGZTY3JlZW5VcCBleHRlbmRzIFNjcm9sbFxuICBAZXh0ZW5kKClcbiAgYW1vdW50T2ZQYWdlOiAtMSAvIDJcblxuIyBGaW5kXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMga2V5bWFwOiBmXG5jbGFzcyBGaW5kIGV4dGVuZHMgTW90aW9uXG4gIEBleHRlbmQoKVxuICBiYWNrd2FyZHM6IGZhbHNlXG4gIGluY2x1c2l2ZTogdHJ1ZVxuICBvZmZzZXQ6IDBcbiAgcmVxdWlyZUlucHV0OiB0cnVlXG4gIGNhc2VTZW5zaXRpdml0eUtpbmQ6IFwiRmluZFwiXG5cbiAgcmVzdG9yZUVkaXRvclN0YXRlOiAtPlxuICAgIEBfcmVzdG9yZUVkaXRvclN0YXRlPygpXG4gICAgQF9yZXN0b3JlRWRpdG9yU3RhdGUgPSBudWxsXG5cbiAgY2FuY2VsT3BlcmF0aW9uOiAtPlxuICAgIEByZXN0b3JlRWRpdG9yU3RhdGUoKVxuICAgIHN1cGVyXG5cbiAgaW5pdGlhbGl6ZTogLT5cbiAgICBzdXBlclxuXG4gICAgQHJlcGVhdElmTmVjZXNzYXJ5KCkgaWYgQGdldENvbmZpZyhcInJldXNlRmluZEZvclJlcGVhdEZpbmRcIilcbiAgICByZXR1cm4gaWYgQGlzQ29tcGxldGUoKVxuXG4gICAgY2hhcnNNYXggPSBAZ2V0Q29uZmlnKFwiZmluZENoYXJzTWF4XCIpXG5cbiAgICBpZiAoY2hhcnNNYXggPiAxKVxuICAgICAgQF9yZXN0b3JlRWRpdG9yU3RhdGUgPSBzYXZlRWRpdG9yU3RhdGUoQGVkaXRvcilcblxuICAgICAgb3B0aW9ucyA9XG4gICAgICAgIGF1dG9Db25maXJtVGltZW91dDogQGdldENvbmZpZyhcImZpbmRDb25maXJtQnlUaW1lb3V0XCIpXG4gICAgICAgIG9uQ29uZmlybTogKEBpbnB1dCkgPT4gaWYgQGlucHV0IHRoZW4gQHByb2Nlc3NPcGVyYXRpb24oKSBlbHNlIEBjYW5jZWxPcGVyYXRpb24oKVxuICAgICAgICBvbkNoYW5nZTogKEBwcmVDb25maXJtZWRDaGFycykgPT4gQGhpZ2hsaWdodFRleHRJbkN1cnNvclJvd3MoQHByZUNvbmZpcm1lZENoYXJzLCBcInByZS1jb25maXJtXCIpXG4gICAgICAgIG9uQ2FuY2VsOiA9PlxuICAgICAgICAgIEB2aW1TdGF0ZS5oaWdobGlnaHRGaW5kLmNsZWFyTWFya2VycygpXG4gICAgICAgICAgQGNhbmNlbE9wZXJhdGlvbigpXG4gICAgICAgIGNvbW1hbmRzOlxuICAgICAgICAgIFwidmltLW1vZGUtcGx1czpmaW5kLW5leHQtcHJlLWNvbmZpcm1lZFwiOiA9PiBAZmluZFByZUNvbmZpcm1lZCgrMSlcbiAgICAgICAgICBcInZpbS1tb2RlLXBsdXM6ZmluZC1wcmV2aW91cy1wcmUtY29uZmlybWVkXCI6ID0+ICBAZmluZFByZUNvbmZpcm1lZCgtMSlcblxuICAgIG9wdGlvbnMgPz0ge31cbiAgICBvcHRpb25zLnB1cnBvc2UgPSBcImZpbmRcIlxuICAgIG9wdGlvbnMuY2hhcnNNYXggPSBjaGFyc01heFxuXG4gICAgQGZvY3VzSW5wdXQob3B0aW9ucylcblxuICBmaW5kUHJlQ29uZmlybWVkOiAoZGVsdGEpIC0+XG4gICAgaWYgQHByZUNvbmZpcm1lZENoYXJzIGFuZCBAZ2V0Q29uZmlnKFwiaGlnaGxpZ2h0RmluZENoYXJcIilcbiAgICAgIGluZGV4ID0gQGhpZ2hsaWdodFRleHRJbkN1cnNvclJvd3MoQHByZUNvbmZpcm1lZENoYXJzLCBcInByZS1jb25maXJtXCIsIEBnZXRDb3VudCgtMSkgKyBkZWx0YSwgdHJ1ZSlcbiAgICAgIEBjb3VudCA9IGluZGV4ICsgMVxuXG4gIHJlcGVhdElmTmVjZXNzYXJ5OiAtPlxuICAgIGN1cnJlbnRGaW5kID0gQHZpbVN0YXRlLmdsb2JhbFN0YXRlLmdldChcImN1cnJlbnRGaW5kXCIpXG4gICAgaXNTZXF1ZW50aWFsRXhlY3V0aW9uID0gQHZpbVN0YXRlLm9wZXJhdGlvblN0YWNrLmdldExhc3RDb21tYW5kTmFtZSgpIGluIFtcIkZpbmRcIiwgXCJGaW5kQmFja3dhcmRzXCIsIFwiVGlsbFwiLCBcIlRpbGxCYWNrd2FyZHNcIl1cbiAgICBpZiBjdXJyZW50RmluZD8gYW5kIGlzU2VxdWVudGlhbEV4ZWN1dGlvblxuICAgICAgQGlucHV0ID0gY3VycmVudEZpbmQuaW5wdXRcbiAgICAgIEByZXBlYXRlZCA9IHRydWVcblxuICBpc0JhY2t3YXJkczogLT5cbiAgICBAYmFja3dhcmRzXG5cbiAgZXhlY3V0ZTogLT5cbiAgICBzdXBlclxuICAgIGRlY29yYXRpb25UeXBlID0gXCJwb3N0LWNvbmZpcm1cIlxuICAgIGRlY29yYXRpb25UeXBlICs9IFwiIGxvbmdcIiBpZiAoQG9wZXJhdG9yPyBhbmQgbm90IEBvcGVyYXRvcj8uaW5zdGFuY2VvZihcIlNlbGVjdEJhc2VcIikpXG4gICAgQGVkaXRvci5jb21wb25lbnQuZ2V0TmV4dFVwZGF0ZVByb21pc2UoKS50aGVuID0+XG4gICAgICBAaGlnaGxpZ2h0VGV4dEluQ3Vyc29yUm93cyhAaW5wdXQsIGRlY29yYXRpb25UeXBlKVxuXG4gICAgcmV0dXJuICMgRG9uJ3QgcmV0dXJuIFByb21pc2UgaGVyZS4gT3BlcmF0aW9uU3RhY2sgdHJlYXQgUHJvbWlzZSBkaWZmZXJlbnRseS5cblxuICBnZXRQb2ludDogKGZyb21Qb2ludCkgLT5cbiAgICBzY2FuUmFuZ2UgPSBAZWRpdG9yLmJ1ZmZlclJhbmdlRm9yQnVmZmVyUm93KGZyb21Qb2ludC5yb3cpXG4gICAgcG9pbnRzID0gW11cbiAgICByZWdleCA9IEBnZXRSZWdleChAaW5wdXQpXG4gICAgaW5kZXhXYW50QWNjZXNzID0gQGdldENvdW50KC0xKVxuXG4gICAgdHJhbnNsYXRpb24gPSBuZXcgUG9pbnQoMCwgaWYgQGlzQmFja3dhcmRzKCkgdGhlbiBAb2Zmc2V0IGVsc2UgLUBvZmZzZXQpXG4gICAgZnJvbVBvaW50ID0gZnJvbVBvaW50LnRyYW5zbGF0ZSh0cmFuc2xhdGlvbi5uZWdhdGUoKSkgaWYgQHJlcGVhdGVkXG5cbiAgICBpZiBAaXNCYWNrd2FyZHMoKVxuICAgICAgc2NhblJhbmdlLnN0YXJ0ID0gUG9pbnQuWkVSTyBpZiBAZ2V0Q29uZmlnKFwiZmluZEFjcm9zc0xpbmVzXCIpXG4gICAgICBAZWRpdG9yLmJhY2t3YXJkc1NjYW5JbkJ1ZmZlclJhbmdlIHJlZ2V4LCBzY2FuUmFuZ2UsICh7cmFuZ2UsIHN0b3B9KSAtPlxuICAgICAgICBpZiByYW5nZS5zdGFydC5pc0xlc3NUaGFuKGZyb21Qb2ludClcbiAgICAgICAgICBwb2ludHMucHVzaChyYW5nZS5zdGFydClcbiAgICAgICAgICBzdG9wKCkgaWYgcG9pbnRzLmxlbmd0aCA+IGluZGV4V2FudEFjY2Vzc1xuICAgIGVsc2VcbiAgICAgIHNjYW5SYW5nZS5lbmQgPSBAZWRpdG9yLmdldEVvZkJ1ZmZlclBvc2l0aW9uKCkgaWYgQGdldENvbmZpZyhcImZpbmRBY3Jvc3NMaW5lc1wiKVxuICAgICAgQGVkaXRvci5zY2FuSW5CdWZmZXJSYW5nZSByZWdleCwgc2NhblJhbmdlLCAoe3JhbmdlLCBzdG9wfSkgLT5cbiAgICAgICAgaWYgcmFuZ2Uuc3RhcnQuaXNHcmVhdGVyVGhhbihmcm9tUG9pbnQpXG4gICAgICAgICAgcG9pbnRzLnB1c2gocmFuZ2Uuc3RhcnQpXG4gICAgICAgICAgc3RvcCgpIGlmIHBvaW50cy5sZW5ndGggPiBpbmRleFdhbnRBY2Nlc3NcblxuICAgIHBvaW50c1tpbmRleFdhbnRBY2Nlc3NdPy50cmFuc2xhdGUodHJhbnNsYXRpb24pXG5cbiAgaGlnaGxpZ2h0VGV4dEluQ3Vyc29yUm93czogKHRleHQsIGRlY29yYXRpb25UeXBlLCBpbmRleCA9IEBnZXRDb3VudCgtMSksIGFkanVzdEluZGV4ID0gZmFsc2UpIC0+XG4gICAgcmV0dXJuIHVubGVzcyBAZ2V0Q29uZmlnKFwiaGlnaGxpZ2h0RmluZENoYXJcIilcbiAgICBAdmltU3RhdGUuaGlnaGxpZ2h0RmluZC5oaWdobGlnaHRDdXJzb3JSb3dzKEBnZXRSZWdleCh0ZXh0KSwgZGVjb3JhdGlvblR5cGUsIEBpc0JhY2t3YXJkcygpLCBAb2Zmc2V0LCBpbmRleCwgYWRqdXN0SW5kZXgpXG5cbiAgbW92ZUN1cnNvcjogKGN1cnNvcikgLT5cbiAgICBwb2ludCA9IEBnZXRQb2ludChjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKSlcbiAgICBpZiBwb2ludD9cbiAgICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihwb2ludClcbiAgICBlbHNlXG4gICAgICBAcmVzdG9yZUVkaXRvclN0YXRlKClcblxuICAgIEBnbG9iYWxTdGF0ZS5zZXQoJ2N1cnJlbnRGaW5kJywgdGhpcykgdW5sZXNzIEByZXBlYXRlZFxuXG4gIGdldFJlZ2V4OiAodGVybSkgLT5cbiAgICBtb2RpZmllcnMgPSBpZiBAaXNDYXNlU2Vuc2l0aXZlKHRlcm0pIHRoZW4gJ2cnIGVsc2UgJ2dpJ1xuICAgIG5ldyBSZWdFeHAoXy5lc2NhcGVSZWdFeHAodGVybSksIG1vZGlmaWVycylcblxuIyBrZXltYXA6IEZcbmNsYXNzIEZpbmRCYWNrd2FyZHMgZXh0ZW5kcyBGaW5kXG4gIEBleHRlbmQoKVxuICBpbmNsdXNpdmU6IGZhbHNlXG4gIGJhY2t3YXJkczogdHJ1ZVxuXG4jIGtleW1hcDogdFxuY2xhc3MgVGlsbCBleHRlbmRzIEZpbmRcbiAgQGV4dGVuZCgpXG4gIG9mZnNldDogMVxuXG4gIGdldFBvaW50OiAtPlxuICAgIEBwb2ludCA9IHN1cGVyXG4gICAgQG1vdmVTdWNjZWVkZWQgPSBAcG9pbnQ/XG4gICAgcmV0dXJuIEBwb2ludFxuXG4jIGtleW1hcDogVFxuY2xhc3MgVGlsbEJhY2t3YXJkcyBleHRlbmRzIFRpbGxcbiAgQGV4dGVuZCgpXG4gIGluY2x1c2l2ZTogZmFsc2VcbiAgYmFja3dhcmRzOiB0cnVlXG5cbiMgTWFya1xuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIGtleW1hcDogYFxuY2xhc3MgTW92ZVRvTWFyayBleHRlbmRzIE1vdGlvblxuICBAZXh0ZW5kKClcbiAganVtcDogdHJ1ZVxuICByZXF1aXJlSW5wdXQ6IHRydWVcbiAgaW5wdXQ6IG51bGwgIyBzZXQgd2hlbiBpbnN0YXRudGlhdGVkIHZpYSB2aW1TdGF0ZTo6bW92ZVRvTWFyaygpXG5cbiAgaW5pdGlhbGl6ZTogLT5cbiAgICBzdXBlclxuICAgIEByZWFkQ2hhcigpIHVubGVzcyBAaXNDb21wbGV0ZSgpXG5cbiAgZ2V0UG9pbnQ6IC0+XG4gICAgQHZpbVN0YXRlLm1hcmsuZ2V0KEBpbnB1dClcblxuICBtb3ZlQ3Vyc29yOiAoY3Vyc29yKSAtPlxuICAgIGlmIHBvaW50ID0gQGdldFBvaW50KClcbiAgICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihwb2ludClcbiAgICAgIGN1cnNvci5hdXRvc2Nyb2xsKGNlbnRlcjogdHJ1ZSlcblxuIyBrZXltYXA6ICdcbmNsYXNzIE1vdmVUb01hcmtMaW5lIGV4dGVuZHMgTW92ZVRvTWFya1xuICBAZXh0ZW5kKClcbiAgd2lzZTogJ2xpbmV3aXNlJ1xuXG4gIGdldFBvaW50OiAtPlxuICAgIGlmIHBvaW50ID0gc3VwZXJcbiAgICAgIEBnZXRGaXJzdENoYXJhY3RlclBvc2l0aW9uRm9yQnVmZmVyUm93KHBvaW50LnJvdylcblxuIyBGb2xkXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIE1vdmVUb1ByZXZpb3VzRm9sZFN0YXJ0IGV4dGVuZHMgTW90aW9uXG4gIEBleHRlbmQoKVxuICBAZGVzY3JpcHRpb246IFwiTW92ZSB0byBwcmV2aW91cyBmb2xkIHN0YXJ0XCJcbiAgd2lzZTogJ2NoYXJhY3Rlcndpc2UnXG4gIHdoaWNoOiAnc3RhcnQnXG4gIGRpcmVjdGlvbjogJ3ByZXYnXG5cbiAgaW5pdGlhbGl6ZTogLT5cbiAgICBzdXBlclxuICAgIEByb3dzID0gQGdldEZvbGRSb3dzKEB3aGljaClcbiAgICBAcm93cy5yZXZlcnNlKCkgaWYgQGRpcmVjdGlvbiBpcyAncHJldidcblxuICBnZXRGb2xkUm93czogKHdoaWNoKSAtPlxuICAgIGluZGV4ID0gaWYgd2hpY2ggaXMgJ3N0YXJ0JyB0aGVuIDAgZWxzZSAxXG4gICAgcm93cyA9IGdldENvZGVGb2xkUm93UmFuZ2VzKEBlZGl0b3IpLm1hcCAocm93UmFuZ2UpIC0+XG4gICAgICByb3dSYW5nZVtpbmRleF1cbiAgICBfLnNvcnRCeShfLnVuaXEocm93cyksIChyb3cpIC0+IHJvdylcblxuICBnZXRTY2FuUm93czogKGN1cnNvcikgLT5cbiAgICBjdXJzb3JSb3cgPSBjdXJzb3IuZ2V0QnVmZmVyUm93KClcbiAgICBpc1ZhbGlkUm93ID0gc3dpdGNoIEBkaXJlY3Rpb25cbiAgICAgIHdoZW4gJ3ByZXYnIHRoZW4gKHJvdykgLT4gcm93IDwgY3Vyc29yUm93XG4gICAgICB3aGVuICduZXh0JyB0aGVuIChyb3cpIC0+IHJvdyA+IGN1cnNvclJvd1xuICAgIEByb3dzLmZpbHRlcihpc1ZhbGlkUm93KVxuXG4gIGRldGVjdFJvdzogKGN1cnNvcikgLT5cbiAgICBAZ2V0U2NhblJvd3MoY3Vyc29yKVswXVxuXG4gIG1vdmVDdXJzb3I6IChjdXJzb3IpIC0+XG4gICAgQG1vdmVDdXJzb3JDb3VudFRpbWVzIGN1cnNvciwgPT5cbiAgICAgIGlmIChyb3cgPSBAZGV0ZWN0Um93KGN1cnNvcikpP1xuICAgICAgICBtb3ZlQ3Vyc29yVG9GaXJzdENoYXJhY3RlckF0Um93KGN1cnNvciwgcm93KVxuXG5jbGFzcyBNb3ZlVG9OZXh0Rm9sZFN0YXJ0IGV4dGVuZHMgTW92ZVRvUHJldmlvdXNGb2xkU3RhcnRcbiAgQGV4dGVuZCgpXG4gIEBkZXNjcmlwdGlvbjogXCJNb3ZlIHRvIG5leHQgZm9sZCBzdGFydFwiXG4gIGRpcmVjdGlvbjogJ25leHQnXG5cbmNsYXNzIE1vdmVUb1ByZXZpb3VzRm9sZFN0YXJ0V2l0aFNhbWVJbmRlbnQgZXh0ZW5kcyBNb3ZlVG9QcmV2aW91c0ZvbGRTdGFydFxuICBAZXh0ZW5kKClcbiAgQGRlc2NyaXB0aW9uOiBcIk1vdmUgdG8gcHJldmlvdXMgc2FtZS1pbmRlbnRlZCBmb2xkIHN0YXJ0XCJcbiAgZGV0ZWN0Um93OiAoY3Vyc29yKSAtPlxuICAgIGJhc2VJbmRlbnRMZXZlbCA9IEBnZXRJbmRlbnRMZXZlbEZvckJ1ZmZlclJvdyhjdXJzb3IuZ2V0QnVmZmVyUm93KCkpXG4gICAgZm9yIHJvdyBpbiBAZ2V0U2NhblJvd3MoY3Vyc29yKVxuICAgICAgaWYgQGdldEluZGVudExldmVsRm9yQnVmZmVyUm93KHJvdykgaXMgYmFzZUluZGVudExldmVsXG4gICAgICAgIHJldHVybiByb3dcbiAgICBudWxsXG5cbmNsYXNzIE1vdmVUb05leHRGb2xkU3RhcnRXaXRoU2FtZUluZGVudCBleHRlbmRzIE1vdmVUb1ByZXZpb3VzRm9sZFN0YXJ0V2l0aFNhbWVJbmRlbnRcbiAgQGV4dGVuZCgpXG4gIEBkZXNjcmlwdGlvbjogXCJNb3ZlIHRvIG5leHQgc2FtZS1pbmRlbnRlZCBmb2xkIHN0YXJ0XCJcbiAgZGlyZWN0aW9uOiAnbmV4dCdcblxuY2xhc3MgTW92ZVRvUHJldmlvdXNGb2xkRW5kIGV4dGVuZHMgTW92ZVRvUHJldmlvdXNGb2xkU3RhcnRcbiAgQGV4dGVuZCgpXG4gIEBkZXNjcmlwdGlvbjogXCJNb3ZlIHRvIHByZXZpb3VzIGZvbGQgZW5kXCJcbiAgd2hpY2g6ICdlbmQnXG5cbmNsYXNzIE1vdmVUb05leHRGb2xkRW5kIGV4dGVuZHMgTW92ZVRvUHJldmlvdXNGb2xkRW5kXG4gIEBleHRlbmQoKVxuICBAZGVzY3JpcHRpb246IFwiTW92ZSB0byBuZXh0IGZvbGQgZW5kXCJcbiAgZGlyZWN0aW9uOiAnbmV4dCdcblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBNb3ZlVG9QcmV2aW91c0Z1bmN0aW9uIGV4dGVuZHMgTW92ZVRvUHJldmlvdXNGb2xkU3RhcnRcbiAgQGV4dGVuZCgpXG4gIEBkZXNjcmlwdGlvbjogXCJNb3ZlIHRvIHByZXZpb3VzIGZ1bmN0aW9uXCJcbiAgZGlyZWN0aW9uOiAncHJldidcbiAgZGV0ZWN0Um93OiAoY3Vyc29yKSAtPlxuICAgIF8uZGV0ZWN0IEBnZXRTY2FuUm93cyhjdXJzb3IpLCAocm93KSA9PlxuICAgICAgaXNJbmNsdWRlRnVuY3Rpb25TY29wZUZvclJvdyhAZWRpdG9yLCByb3cpXG5cbmNsYXNzIE1vdmVUb05leHRGdW5jdGlvbiBleHRlbmRzIE1vdmVUb1ByZXZpb3VzRnVuY3Rpb25cbiAgQGV4dGVuZCgpXG4gIEBkZXNjcmlwdGlvbjogXCJNb3ZlIHRvIG5leHQgZnVuY3Rpb25cIlxuICBkaXJlY3Rpb246ICduZXh0J1xuXG4jIFNjb3BlIGJhc2VkXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIE1vdmVUb1Bvc2l0aW9uQnlTY29wZSBleHRlbmRzIE1vdGlvblxuICBAZXh0ZW5kKGZhbHNlKVxuICBkaXJlY3Rpb246ICdiYWNrd2FyZCdcbiAgc2NvcGU6ICcuJ1xuXG4gIGdldFBvaW50OiAoZnJvbVBvaW50KSAtPlxuICAgIGRldGVjdFNjb3BlU3RhcnRQb3NpdGlvbkZvclNjb3BlKEBlZGl0b3IsIGZyb21Qb2ludCwgQGRpcmVjdGlvbiwgQHNjb3BlKVxuXG4gIG1vdmVDdXJzb3I6IChjdXJzb3IpIC0+XG4gICAgQG1vdmVDdXJzb3JDb3VudFRpbWVzIGN1cnNvciwgPT5cbiAgICAgIEBzZXRCdWZmZXJQb3NpdGlvblNhZmVseShjdXJzb3IsIEBnZXRQb2ludChjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKSkpXG5cbmNsYXNzIE1vdmVUb1ByZXZpb3VzU3RyaW5nIGV4dGVuZHMgTW92ZVRvUG9zaXRpb25CeVNjb3BlXG4gIEBleHRlbmQoKVxuICBAZGVzY3JpcHRpb246IFwiTW92ZSB0byBwcmV2aW91cyBzdHJpbmcoc2VhcmNoZWQgYnkgYHN0cmluZy5iZWdpbmAgc2NvcGUpXCJcbiAgZGlyZWN0aW9uOiAnYmFja3dhcmQnXG4gIHNjb3BlOiAnc3RyaW5nLmJlZ2luJ1xuXG5jbGFzcyBNb3ZlVG9OZXh0U3RyaW5nIGV4dGVuZHMgTW92ZVRvUHJldmlvdXNTdHJpbmdcbiAgQGV4dGVuZCgpXG4gIEBkZXNjcmlwdGlvbjogXCJNb3ZlIHRvIG5leHQgc3RyaW5nKHNlYXJjaGVkIGJ5IGBzdHJpbmcuYmVnaW5gIHNjb3BlKVwiXG4gIGRpcmVjdGlvbjogJ2ZvcndhcmQnXG5cbmNsYXNzIE1vdmVUb1ByZXZpb3VzTnVtYmVyIGV4dGVuZHMgTW92ZVRvUG9zaXRpb25CeVNjb3BlXG4gIEBleHRlbmQoKVxuICBkaXJlY3Rpb246ICdiYWNrd2FyZCdcbiAgQGRlc2NyaXB0aW9uOiBcIk1vdmUgdG8gcHJldmlvdXMgbnVtYmVyKHNlYXJjaGVkIGJ5IGBjb25zdGFudC5udW1lcmljYCBzY29wZSlcIlxuICBzY29wZTogJ2NvbnN0YW50Lm51bWVyaWMnXG5cbmNsYXNzIE1vdmVUb05leHROdW1iZXIgZXh0ZW5kcyBNb3ZlVG9QcmV2aW91c051bWJlclxuICBAZXh0ZW5kKClcbiAgQGRlc2NyaXB0aW9uOiBcIk1vdmUgdG8gbmV4dCBudW1iZXIoc2VhcmNoZWQgYnkgYGNvbnN0YW50Lm51bWVyaWNgIHNjb3BlKVwiXG4gIGRpcmVjdGlvbjogJ2ZvcndhcmQnXG5cbmNsYXNzIE1vdmVUb05leHRPY2N1cnJlbmNlIGV4dGVuZHMgTW90aW9uXG4gIEBleHRlbmQoKVxuICAjIEVuc3VyZSB0aGlzIGNvbW1hbmQgaXMgYXZhaWxhYmxlIHdoZW4gaGFzLW9jY3VycmVuY2VcbiAgQGNvbW1hbmRTY29wZTogJ2F0b20tdGV4dC1lZGl0b3IudmltLW1vZGUtcGx1cy5oYXMtb2NjdXJyZW5jZSdcbiAganVtcDogdHJ1ZVxuICBkaXJlY3Rpb246ICduZXh0J1xuXG4gIGdldFJhbmdlczogLT5cbiAgICBAdmltU3RhdGUub2NjdXJyZW5jZU1hbmFnZXIuZ2V0TWFya2VycygpLm1hcCAobWFya2VyKSAtPlxuICAgICAgbWFya2VyLmdldEJ1ZmZlclJhbmdlKClcblxuICBleGVjdXRlOiAtPlxuICAgIEByYW5nZXMgPSBAdmltU3RhdGUudXRpbHMuc29ydFJhbmdlcyhAZ2V0UmFuZ2VzKCkpXG4gICAgc3VwZXJcblxuICBtb3ZlQ3Vyc29yOiAoY3Vyc29yKSAtPlxuICAgIHJhbmdlID0gQHJhbmdlc1tnZXRJbmRleChAZ2V0SW5kZXgoY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKCkpLCBAcmFuZ2VzKV1cbiAgICBwb2ludCA9IHJhbmdlLnN0YXJ0XG4gICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHBvaW50LCBhdXRvc2Nyb2xsOiBmYWxzZSlcblxuICAgIGlmIGN1cnNvci5pc0xhc3RDdXJzb3IoKVxuICAgICAgQGVkaXRvci51bmZvbGRCdWZmZXJSb3cocG9pbnQucm93KVxuICAgICAgc21hcnRTY3JvbGxUb0J1ZmZlclBvc2l0aW9uKEBlZGl0b3IsIHBvaW50KVxuXG4gICAgaWYgQGdldENvbmZpZygnZmxhc2hPbk1vdmVUb09jY3VycmVuY2UnKVxuICAgICAgQHZpbVN0YXRlLmZsYXNoKHJhbmdlLCB0eXBlOiAnc2VhcmNoJylcblxuICBnZXRJbmRleDogKGZyb21Qb2ludCkgLT5cbiAgICBpbmRleCA9IG51bGxcbiAgICBmb3IgcmFuZ2UsIGkgaW4gQHJhbmdlcyB3aGVuIHJhbmdlLnN0YXJ0LmlzR3JlYXRlclRoYW4oZnJvbVBvaW50KVxuICAgICAgaW5kZXggPSBpXG4gICAgICBicmVha1xuICAgIChpbmRleCA/IDApICsgQGdldENvdW50KC0xKVxuXG5jbGFzcyBNb3ZlVG9QcmV2aW91c09jY3VycmVuY2UgZXh0ZW5kcyBNb3ZlVG9OZXh0T2NjdXJyZW5jZVxuICBAZXh0ZW5kKClcbiAgZGlyZWN0aW9uOiAncHJldmlvdXMnXG5cbiAgZ2V0SW5kZXg6IChmcm9tUG9pbnQpIC0+XG4gICAgaW5kZXggPSBudWxsXG4gICAgZm9yIHJhbmdlLCBpIGluIEByYW5nZXMgYnkgLTEgd2hlbiByYW5nZS5lbmQuaXNMZXNzVGhhbihmcm9tUG9pbnQpXG4gICAgICBpbmRleCA9IGlcbiAgICAgIGJyZWFrXG4gICAgKGluZGV4ID8gQHJhbmdlcy5sZW5ndGggLSAxKSAtIEBnZXRDb3VudCgtMSlcblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIGtleW1hcDogJVxuY2xhc3MgTW92ZVRvUGFpciBleHRlbmRzIE1vdGlvblxuICBAZXh0ZW5kKClcbiAgaW5jbHVzaXZlOiB0cnVlXG4gIGp1bXA6IHRydWVcbiAgbWVtYmVyOiBbJ1BhcmVudGhlc2lzJywgJ0N1cmx5QnJhY2tldCcsICdTcXVhcmVCcmFja2V0J11cblxuICBtb3ZlQ3Vyc29yOiAoY3Vyc29yKSAtPlxuICAgIEBzZXRCdWZmZXJQb3NpdGlvblNhZmVseShjdXJzb3IsIEBnZXRQb2ludChjdXJzb3IpKVxuXG4gIGdldFBvaW50Rm9yVGFnOiAocG9pbnQpIC0+XG4gICAgcGFpckluZm8gPSBAbmV3KFwiQVRhZ1wiKS5nZXRQYWlySW5mbyhwb2ludClcbiAgICByZXR1cm4gbnVsbCB1bmxlc3MgcGFpckluZm8/XG4gICAge29wZW5SYW5nZSwgY2xvc2VSYW5nZX0gPSBwYWlySW5mb1xuICAgIG9wZW5SYW5nZSA9IG9wZW5SYW5nZS50cmFuc2xhdGUoWzAsICsxXSwgWzAsIC0xXSlcbiAgICBjbG9zZVJhbmdlID0gY2xvc2VSYW5nZS50cmFuc2xhdGUoWzAsICsxXSwgWzAsIC0xXSlcbiAgICByZXR1cm4gY2xvc2VSYW5nZS5zdGFydCBpZiBvcGVuUmFuZ2UuY29udGFpbnNQb2ludChwb2ludCkgYW5kIChub3QgcG9pbnQuaXNFcXVhbChvcGVuUmFuZ2UuZW5kKSlcbiAgICByZXR1cm4gb3BlblJhbmdlLnN0YXJ0IGlmIGNsb3NlUmFuZ2UuY29udGFpbnNQb2ludChwb2ludCkgYW5kIChub3QgcG9pbnQuaXNFcXVhbChjbG9zZVJhbmdlLmVuZCkpXG5cbiAgZ2V0UG9pbnQ6IChjdXJzb3IpIC0+XG4gICAgY3Vyc29yUG9zaXRpb24gPSBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuICAgIGN1cnNvclJvdyA9IGN1cnNvclBvc2l0aW9uLnJvd1xuICAgIHJldHVybiBwb2ludCBpZiBwb2ludCA9IEBnZXRQb2ludEZvclRhZyhjdXJzb3JQb3NpdGlvbilcblxuICAgICMgQUFueVBhaXJBbGxvd0ZvcndhcmRpbmcgcmV0dXJuIGZvcndhcmRpbmcgcmFuZ2Ugb3IgZW5jbG9zaW5nIHJhbmdlLlxuICAgIHJhbmdlID0gQG5ldyhcIkFBbnlQYWlyQWxsb3dGb3J3YXJkaW5nXCIsIHtAbWVtYmVyfSkuZ2V0UmFuZ2UoY3Vyc29yLnNlbGVjdGlvbilcbiAgICByZXR1cm4gbnVsbCB1bmxlc3MgcmFuZ2U/XG4gICAge3N0YXJ0LCBlbmR9ID0gcmFuZ2VcbiAgICBpZiAoc3RhcnQucm93IGlzIGN1cnNvclJvdykgYW5kIHN0YXJ0LmlzR3JlYXRlclRoYW5PckVxdWFsKGN1cnNvclBvc2l0aW9uKVxuICAgICAgIyBGb3J3YXJkaW5nIHJhbmdlIGZvdW5kXG4gICAgICBlbmQudHJhbnNsYXRlKFswLCAtMV0pXG4gICAgZWxzZSBpZiBlbmQucm93IGlzIGN1cnNvclBvc2l0aW9uLnJvd1xuICAgICAgIyBFbmNsb3NpbmcgcmFuZ2Ugd2FzIHJldHVybmVkXG4gICAgICAjIFdlIG1vdmUgdG8gc3RhcnQoIG9wZW4tcGFpciApIG9ubHkgd2hlbiBjbG9zZS1wYWlyIHdhcyBhdCBzYW1lIHJvdyBhcyBjdXJzb3Itcm93LlxuICAgICAgc3RhcnRcbiJdfQ==
