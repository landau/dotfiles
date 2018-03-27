(function() {
  var Base, CurrentSelection, Find, FindBackwards, Motion, MoveDown, MoveDownScreen, MoveDownToEdge, MoveDownWrap, MoveLeft, MoveRight, MoveRightBufferColumn, MoveToBeginningOfLine, MoveToBottomOfScreen, MoveToColumn, MoveToEndOfAlphanumericWord, MoveToEndOfSmartWord, MoveToEndOfSubword, MoveToEndOfWholeWord, MoveToEndOfWord, MoveToFirstCharacterOfLine, MoveToFirstCharacterOfLineAndDown, MoveToFirstCharacterOfLineDown, MoveToFirstCharacterOfLineUp, MoveToFirstLine, MoveToLastCharacterOfLine, MoveToLastLine, MoveToLastNonblankCharacterOfLineAndDown, MoveToLineByPercent, MoveToMark, MoveToMarkLine, MoveToMiddleOfScreen, MoveToNextAlphanumericWord, MoveToNextFoldEnd, MoveToNextFoldStart, MoveToNextFoldStartWithSameIndent, MoveToNextFunction, MoveToNextNumber, MoveToNextOccurrence, MoveToNextParagraph, MoveToNextSentence, MoveToNextSentenceSkipBlankRow, MoveToNextSmartWord, MoveToNextString, MoveToNextSubword, MoveToNextWholeWord, MoveToNextWord, MoveToPair, MoveToPositionByScope, MoveToPreviousAlphanumericWord, MoveToPreviousEndOfWholeWord, MoveToPreviousEndOfWord, MoveToPreviousFoldEnd, MoveToPreviousFoldStart, MoveToPreviousFoldStartWithSameIndent, MoveToPreviousFunction, MoveToPreviousNumber, MoveToPreviousOccurrence, MoveToPreviousParagraph, MoveToPreviousSentence, MoveToPreviousSentenceSkipBlankRow, MoveToPreviousSmartWord, MoveToPreviousString, MoveToPreviousSubword, MoveToPreviousWholeWord, MoveToPreviousWord, MoveToRelativeLine, MoveToRelativeLineMinimumOne, MoveToTopOfScreen, MoveUp, MoveUpScreen, MoveUpToEdge, MoveUpWrap, Point, Range, Scroll, ScrollFullScreenDown, ScrollFullScreenUp, ScrollHalfScreenDown, ScrollHalfScreenUp, Till, TillBackwards, _, cursorIsAtEndOfLineAtNonEmptyRow, cursorIsAtVimEndOfFile, detectScopeStartPositionForScope, findRangeInBufferRow, getBufferRows, getCodeFoldRowRanges, getEndOfLineForBufferRow, getFirstVisibleScreenRow, getIndentLevelForBufferRow, getIndex, getLargestFoldRangeContainsBufferRow, getLastVisibleScreenRow, getTextInScreenRange, getValidVimBufferRow, getValidVimScreenRow, isEmptyRow, isIncludeFunctionScopeForRow, limitNumber, moveCursorDownBuffer, moveCursorDownScreen, moveCursorLeft, moveCursorRight, moveCursorToFirstCharacterAtRow, moveCursorToNextNonWhitespace, moveCursorUpBuffer, moveCursorUpScreen, pointIsAtEndOfLineAtNonEmptyRow, pointIsOnWhiteSpace, ref, ref1, setBufferColumn, setBufferRow, smartScrollToBufferPosition, sortRanges, swrap,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  _ = require('underscore-plus');

  ref = require('atom'), Point = ref.Point, Range = ref.Range;

  ref1 = require('./utils'), moveCursorLeft = ref1.moveCursorLeft, moveCursorRight = ref1.moveCursorRight, moveCursorUpScreen = ref1.moveCursorUpScreen, moveCursorDownScreen = ref1.moveCursorDownScreen, moveCursorDownBuffer = ref1.moveCursorDownBuffer, moveCursorUpBuffer = ref1.moveCursorUpBuffer, cursorIsAtVimEndOfFile = ref1.cursorIsAtVimEndOfFile, getFirstVisibleScreenRow = ref1.getFirstVisibleScreenRow, getLastVisibleScreenRow = ref1.getLastVisibleScreenRow, getValidVimScreenRow = ref1.getValidVimScreenRow, getValidVimBufferRow = ref1.getValidVimBufferRow, moveCursorToFirstCharacterAtRow = ref1.moveCursorToFirstCharacterAtRow, sortRanges = ref1.sortRanges, getIndentLevelForBufferRow = ref1.getIndentLevelForBufferRow, pointIsOnWhiteSpace = ref1.pointIsOnWhiteSpace, moveCursorToNextNonWhitespace = ref1.moveCursorToNextNonWhitespace, isEmptyRow = ref1.isEmptyRow, getCodeFoldRowRanges = ref1.getCodeFoldRowRanges, getLargestFoldRangeContainsBufferRow = ref1.getLargestFoldRangeContainsBufferRow, isIncludeFunctionScopeForRow = ref1.isIncludeFunctionScopeForRow, detectScopeStartPositionForScope = ref1.detectScopeStartPositionForScope, getBufferRows = ref1.getBufferRows, getTextInScreenRange = ref1.getTextInScreenRange, cursorIsAtEndOfLineAtNonEmptyRow = ref1.cursorIsAtEndOfLineAtNonEmptyRow, setBufferRow = ref1.setBufferRow, setBufferColumn = ref1.setBufferColumn, limitNumber = ref1.limitNumber, getIndex = ref1.getIndex, smartScrollToBufferPosition = ref1.smartScrollToBufferPosition, pointIsAtEndOfLineAtNonEmptyRow = ref1.pointIsAtEndOfLineAtNonEmptyRow, getEndOfLineForBufferRow = ref1.getEndOfLineForBufferRow, findRangeInBufferRow = ref1.findRangeInBufferRow;

  swrap = require('./selection-wrapper');

  Base = require('./base');

  Motion = (function(superClass) {
    extend(Motion, superClass);

    Motion.extend(false);

    Motion.prototype.inclusive = false;

    Motion.prototype.wise = 'characterwise';

    Motion.prototype.jump = false;

    Motion.prototype.verticalMotion = false;

    function Motion() {
      Motion.__super__.constructor.apply(this, arguments);
      if (this.vimState.mode === 'visual') {
        this.inclusive = true;
        this.wise = this.vimState.submode;
      }
      this.initialize();
    }

    Motion.prototype.isInclusive = function() {
      return this.inclusive;
    };

    Motion.prototype.isJump = function() {
      return this.jump;
    };

    Motion.prototype.isVerticalMotion = function() {
      return this.verticalMotion;
    };

    Motion.prototype.isCharacterwise = function() {
      return this.wise === 'characterwise';
    };

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
      if (cursor.isLastCursor() && this.isJump()) {
        cursorPosition = cursor.getBufferPosition();
      }
      this.moveCursor(cursor);
      if ((cursorPosition != null) && !cursorPosition.isEqual(cursor.getBufferPosition())) {
        this.vimState.mark.set('`', cursorPosition);
        return this.vimState.mark.set("'", cursorPosition);
      }
    };

    Motion.prototype.execute = function() {
      if (this.operator != null) {
        return this.select();
      } else {
        return this.editor.moveCursors((function(_this) {
          return function(cursor) {
            return _this.moveWithSaveJump(cursor);
          };
        })(this));
      }
    };

    Motion.prototype.select = function() {
      var j, len, ref2, selection;
      ref2 = this.editor.getSelections();
      for (j = 0, len = ref2.length; j < len; j++) {
        selection = ref2[j];
        this.selectByMotion(selection);
      }
      this.editor.mergeCursors();
      this.editor.mergeIntersectingSelections();
      if (this.isMode('visual')) {
        swrap.saveProperties(this.editor);
      }
      if (this.operator != null) {
        if (this.isMode('visual')) {
          if (this.isMode('visual', 'linewise') && this.editor.getLastSelection().isReversed()) {
            this.vimState.mutationManager.setCheckpoint('did-move');
          }
        } else {
          this.vimState.mutationManager.setCheckpoint('did-move');
        }
      }
      switch (this.wise) {
        case 'linewise':
          return this.vimState.selectLinewise();
        case 'blockwise':
          return this.vimState.selectBlockwise();
      }
    };

    Motion.prototype.selectByMotion = function(selection) {
      var cursor;
      cursor = selection.cursor;
      selection.modifySelection((function(_this) {
        return function() {
          return _this.moveWithSaveJump(cursor);
        };
      })(this));
      if (!this.isMode('visual') && !this.is('CurrentSelection') && selection.isEmpty()) {
        return;
      }
      if (!(this.isInclusive() || this.isLinewise())) {
        return;
      }
      if (this.isMode('visual') && cursorIsAtEndOfLineAtNonEmptyRow(cursor)) {
        swrap(selection).translateSelectionHeadAndClip('backward');
      }
      return swrap(selection).translateSelectionEndAndClip('forward');
    };

    Motion.prototype.setCursorBuffeRow = function(cursor, row, options) {
      if (this.isVerticalMotion() && this.getConfig('moveToFirstCharacterOnVerticalMotion')) {
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
      if (this.isMode('visual')) {
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
      var atEOL, cursor, cursorPosition, j, k, len, len1, pointInfo, ref2, ref3, results, startOfSelection;
      if (this.isMode('visual')) {
        CurrentSelection.__super__.select.apply(this, arguments);
      } else {
        ref2 = this.editor.getCursors();
        for (j = 0, len = ref2.length; j < len; j++) {
          cursor = ref2[j];
          if (!(pointInfo = this.pointInfoByCursor.get(cursor))) {
            continue;
          }
          cursorPosition = pointInfo.cursorPosition, startOfSelection = pointInfo.startOfSelection, atEOL = pointInfo.atEOL;
          if (atEOL || cursorPosition.isEqual(cursor.getBufferPosition())) {
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
            atEOL = cursor.isAtEndOfLine();
            return _this.pointInfoByCursor.set(cursor, {
              startOfSelection: startOfSelection,
              cursorPosition: cursorPosition,
              atEOL: atEOL
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

    MoveToFirstLine.prototype.moveCursor = function(cursor) {
      this.setCursorBuffeRow(cursor, getValidVimBufferRow(this.editor, this.getRow()));
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
      return this.setCursorBuffeRow(cursor, bufferRow);
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
      this.setCursorBuffeRow(cursor, this.getBufferRow(cursor), {
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
      return this.point = Till.__super__.getPoint.apply(this, arguments);
    };

    Till.prototype.selectByMotion = function(selection) {
      Till.__super__.selectByMotion.apply(this, arguments);
      if (selection.isEmpty() && ((this.point != null) && !this.backwards)) {
        return swrap(selection).translateSelectionEndAndClip('forward');
      }
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
      baseIndentLevel = getIndentLevelForBufferRow(this.editor, cursor.getBufferRow());
      ref2 = this.getScanRows(cursor);
      for (j = 0, len = ref2.length; j < len; j++) {
        row = ref2[j];
        if (getIndentLevelForBufferRow(this.editor, row) === baseIndentLevel) {
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

    MoveToPair.prototype.getPoint = function(cursor) {
      var cursorPosition, cursorRow, enclosingRange, enclosingRanges, forwardingRanges, getPointForTag, point, ranges, ref2, ref3;
      cursorPosition = cursor.getBufferPosition();
      cursorRow = cursorPosition.row;
      getPointForTag = (function(_this) {
        return function() {
          var closeRange, openRange, p, pairInfo;
          p = cursorPosition;
          pairInfo = _this["new"]("ATag").getPairInfo(p);
          if (pairInfo == null) {
            return null;
          }
          openRange = pairInfo.openRange, closeRange = pairInfo.closeRange;
          openRange = openRange.translate([0, +1], [0, -1]);
          closeRange = closeRange.translate([0, +1], [0, -1]);
          if (openRange.containsPoint(p) && (!p.isEqual(openRange.end))) {
            return closeRange.start;
          }
          if (closeRange.containsPoint(p) && (!p.isEqual(closeRange.end))) {
            return openRange.start;
          }
        };
      })(this);
      point = getPointForTag();
      if (point != null) {
        return point;
      }
      ranges = this["new"]("AAnyPair", {
        allowForwarding: true,
        member: this.member
      }).getRanges(cursor.selection);
      ranges = ranges.filter(function(arg) {
        var end, p, start;
        start = arg.start, end = arg.end;
        p = cursorPosition;
        return (p.row === start.row) && start.isGreaterThanOrEqual(p) || (p.row === end.row) && end.isGreaterThanOrEqual(p);
      });
      if (!ranges.length) {
        return null;
      }
      ref2 = _.partition(ranges, function(range) {
        return range.containsPoint(cursorPosition, true);
      }), enclosingRanges = ref2[0], forwardingRanges = ref2[1];
      enclosingRange = _.last(sortRanges(enclosingRanges));
      forwardingRanges = sortRanges(forwardingRanges);
      if (enclosingRange) {
        forwardingRanges = forwardingRanges.filter(function(range) {
          return enclosingRange.containsRange(range);
        });
      }
      return ((ref3 = forwardingRanges[0]) != null ? ref3.end.translate([0, -1]) : void 0) || (enclosingRange != null ? enclosingRange.start : void 0);
    };

    return MoveToPair;

  })(Motion);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvbW90aW9uLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsMjNFQUFBO0lBQUE7OztFQUFBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVI7O0VBQ0osTUFBaUIsT0FBQSxDQUFRLE1BQVIsQ0FBakIsRUFBQyxpQkFBRCxFQUFROztFQUVSLE9BNkJJLE9BQUEsQ0FBUSxTQUFSLENBN0JKLEVBQ0Usb0NBREYsRUFDa0Isc0NBRGxCLEVBRUUsNENBRkYsRUFFc0IsZ0RBRnRCLEVBR0UsZ0RBSEYsRUFJRSw0Q0FKRixFQUtFLG9EQUxGLEVBTUUsd0RBTkYsRUFNNEIsc0RBTjVCLEVBT0UsZ0RBUEYsRUFPd0IsZ0RBUHhCLEVBUUUsc0VBUkYsRUFTRSw0QkFURixFQVVFLDREQVZGLEVBV0UsOENBWEYsRUFZRSxrRUFaRixFQWFFLDRCQWJGLEVBY0UsZ0RBZEYsRUFlRSxnRkFmRixFQWdCRSxnRUFoQkYsRUFpQkUsd0VBakJGLEVBa0JFLGtDQWxCRixFQW1CRSxnREFuQkYsRUFvQkUsd0VBcEJGLEVBcUJFLGdDQXJCRixFQXNCRSxzQ0F0QkYsRUF1QkUsOEJBdkJGLEVBd0JFLHdCQXhCRixFQXlCRSw4REF6QkYsRUEwQkUsc0VBMUJGLEVBMkJFLHdEQTNCRixFQTRCRTs7RUFHRixLQUFBLEdBQVEsT0FBQSxDQUFRLHFCQUFSOztFQUNSLElBQUEsR0FBTyxPQUFBLENBQVEsUUFBUjs7RUFFRDs7O0lBQ0osTUFBQyxDQUFBLE1BQUQsQ0FBUSxLQUFSOztxQkFDQSxTQUFBLEdBQVc7O3FCQUNYLElBQUEsR0FBTTs7cUJBQ04sSUFBQSxHQUFNOztxQkFDTixjQUFBLEdBQWdCOztJQUVILGdCQUFBO01BQ1gseUNBQUEsU0FBQTtNQUdBLElBQUcsSUFBQyxDQUFBLFFBQVEsQ0FBQyxJQUFW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LFNBQUYsQ0FBWSxNQUFaLEVBQW9CLFNBQUMsS0FBRDtlQUN4RCxLQUFLLENBQUMsYUFBTixDQUFvQixjQUFwQixFQUFvQyxJQUFwQztNQUR3RCxDQUFwQixDQUF0QyxFQUFDLHlCQUFELEVBQWtCO01BRWxCLGNBQUEsR0FBaUIsQ0FBQyxDQUFDLElBQUYsQ0FBTyxVQUFBLENBQVcsZUFBWCxDQUFQO01BQ2pCLGdCQUFBLEdBQW1CLFVBQUEsQ0FBVyxnQkFBWDtNQUVuQixJQUFHLGNBQUg7UUFDRSxnQkFBQSxHQUFtQixnQkFBZ0IsQ0FBQyxNQUFqQixDQUF3QixTQUFDLEtBQUQ7aUJBQ3pDLGNBQWMsQ0FBQyxhQUFmLENBQTZCLEtBQTdCO1FBRHlDLENBQXhCLEVBRHJCOzt5REFJbUIsQ0FBRSxHQUFHLENBQUMsU0FBekIsQ0FBbUMsQ0FBQyxDQUFELEVBQUksQ0FBQyxDQUFMLENBQW5DLFdBQUEsOEJBQStDLGNBQWMsQ0FBRTtJQW5DdkQ7Ozs7S0FUYTtBQXJuQ3pCIiwic291cmNlc0NvbnRlbnQiOlsiXyA9IHJlcXVpcmUgJ3VuZGVyc2NvcmUtcGx1cydcbntQb2ludCwgUmFuZ2V9ID0gcmVxdWlyZSAnYXRvbSdcblxue1xuICBtb3ZlQ3Vyc29yTGVmdCwgbW92ZUN1cnNvclJpZ2h0XG4gIG1vdmVDdXJzb3JVcFNjcmVlbiwgbW92ZUN1cnNvckRvd25TY3JlZW5cbiAgbW92ZUN1cnNvckRvd25CdWZmZXJcbiAgbW92ZUN1cnNvclVwQnVmZmVyXG4gIGN1cnNvcklzQXRWaW1FbmRPZkZpbGVcbiAgZ2V0Rmlyc3RWaXNpYmxlU2NyZWVuUm93LCBnZXRMYXN0VmlzaWJsZVNjcmVlblJvd1xuICBnZXRWYWxpZFZpbVNjcmVlblJvdywgZ2V0VmFsaWRWaW1CdWZmZXJSb3dcbiAgbW92ZUN1cnNvclRvRmlyc3RDaGFyYWN0ZXJBdFJvd1xuICBzb3J0UmFuZ2VzXG4gIGdldEluZGVudExldmVsRm9yQnVmZmVyUm93XG4gIHBvaW50SXNPbldoaXRlU3BhY2VcbiAgbW92ZUN1cnNvclRvTmV4dE5vbldoaXRlc3BhY2VcbiAgaXNFbXB0eVJvd1xuICBnZXRDb2RlRm9sZFJvd1Jhbmdlc1xuICBnZXRMYXJnZXN0Rm9sZFJhbmdlQ29udGFpbnNCdWZmZXJSb3dcbiAgaXNJbmNsdWRlRnVuY3Rpb25TY29wZUZvclJvd1xuICBkZXRlY3RTY29wZVN0YXJ0UG9zaXRpb25Gb3JTY29wZVxuICBnZXRCdWZmZXJSb3dzXG4gIGdldFRleHRJblNjcmVlblJhbmdlXG4gIGN1cnNvcklzQXRFbmRPZkxpbmVBdE5vbkVtcHR5Um93XG4gIHNldEJ1ZmZlclJvd1xuICBzZXRCdWZmZXJDb2x1bW5cbiAgbGltaXROdW1iZXJcbiAgZ2V0SW5kZXhcbiAgc21hcnRTY3JvbGxUb0J1ZmZlclBvc2l0aW9uXG4gIHBvaW50SXNBdEVuZE9mTGluZUF0Tm9uRW1wdHlSb3dcbiAgZ2V0RW5kT2ZMaW5lRm9yQnVmZmVyUm93XG4gIGZpbmRSYW5nZUluQnVmZmVyUm93XG59ID0gcmVxdWlyZSAnLi91dGlscydcblxuc3dyYXAgPSByZXF1aXJlICcuL3NlbGVjdGlvbi13cmFwcGVyJ1xuQmFzZSA9IHJlcXVpcmUgJy4vYmFzZSdcblxuY2xhc3MgTW90aW9uIGV4dGVuZHMgQmFzZVxuICBAZXh0ZW5kKGZhbHNlKVxuICBpbmNsdXNpdmU6IGZhbHNlXG4gIHdpc2U6ICdjaGFyYWN0ZXJ3aXNlJ1xuICBqdW1wOiBmYWxzZVxuICB2ZXJ0aWNhbE1vdGlvbjogZmFsc2VcblxuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBzdXBlclxuXG4gICAgIyB2aXN1YWwgbW9kZSBjYW4gb3ZlcndyaXRlIGRlZmF1bHQgd2lzZSBhbmQgaW5jbHVzaXZlbmVzc1xuICAgIGlmIEB2aW1TdGF0ZS5tb2RlIGlzICd2aXN1YWwnXG4gICAgICBAaW5jbHVzaXZlID0gdHJ1ZVxuICAgICAgQHdpc2UgPSBAdmltU3RhdGUuc3VibW9kZVxuICAgIEBpbml0aWFsaXplKClcblxuICBpc0luY2x1c2l2ZTogLT5cbiAgICBAaW5jbHVzaXZlXG5cbiAgaXNKdW1wOiAtPlxuICAgIEBqdW1wXG5cbiAgaXNWZXJ0aWNhbE1vdGlvbjogLT5cbiAgICBAdmVydGljYWxNb3Rpb25cblxuICBpc0NoYXJhY3Rlcndpc2U6IC0+XG4gICAgQHdpc2UgaXMgJ2NoYXJhY3Rlcndpc2UnXG5cbiAgaXNMaW5ld2lzZTogLT5cbiAgICBAd2lzZSBpcyAnbGluZXdpc2UnXG5cbiAgaXNCbG9ja3dpc2U6IC0+XG4gICAgQHdpc2UgaXMgJ2Jsb2Nrd2lzZSdcblxuICBmb3JjZVdpc2U6ICh3aXNlKSAtPlxuICAgIGlmIHdpc2UgaXMgJ2NoYXJhY3Rlcndpc2UnXG4gICAgICBpZiBAd2lzZSBpcyAnbGluZXdpc2UnXG4gICAgICAgIEBpbmNsdXNpdmUgPSBmYWxzZVxuICAgICAgZWxzZVxuICAgICAgICBAaW5jbHVzaXZlID0gbm90IEBpbmNsdXNpdmVcbiAgICBAd2lzZSA9IHdpc2VcblxuICBzZXRCdWZmZXJQb3NpdGlvblNhZmVseTogKGN1cnNvciwgcG9pbnQpIC0+XG4gICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHBvaW50KSBpZiBwb2ludD9cblxuICBzZXRTY3JlZW5Qb3NpdGlvblNhZmVseTogKGN1cnNvciwgcG9pbnQpIC0+XG4gICAgY3Vyc29yLnNldFNjcmVlblBvc2l0aW9uKHBvaW50KSBpZiBwb2ludD9cblxuICBtb3ZlV2l0aFNhdmVKdW1wOiAoY3Vyc29yKSAtPlxuICAgIGlmIGN1cnNvci5pc0xhc3RDdXJzb3IoKSBhbmQgQGlzSnVtcCgpXG4gICAgICBjdXJzb3JQb3NpdGlvbiA9IGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXG5cbiAgICBAbW92ZUN1cnNvcihjdXJzb3IpXG5cbiAgICBpZiBjdXJzb3JQb3NpdGlvbj8gYW5kIG5vdCBjdXJzb3JQb3NpdGlvbi5pc0VxdWFsKGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpKVxuICAgICAgQHZpbVN0YXRlLm1hcmsuc2V0KCdgJywgY3Vyc29yUG9zaXRpb24pXG4gICAgICBAdmltU3RhdGUubWFyay5zZXQoXCInXCIsIGN1cnNvclBvc2l0aW9uKVxuXG4gIGV4ZWN1dGU6IC0+XG4gICAgaWYgQG9wZXJhdG9yP1xuICAgICAgQHNlbGVjdCgpXG4gICAgZWxzZVxuICAgICAgQGVkaXRvci5tb3ZlQ3Vyc29ycyAoY3Vyc29yKSA9PlxuICAgICAgICBAbW92ZVdpdGhTYXZlSnVtcChjdXJzb3IpXG5cbiAgc2VsZWN0OiAtPlxuICAgIGZvciBzZWxlY3Rpb24gaW4gQGVkaXRvci5nZXRTZWxlY3Rpb25zKClcbiAgICAgIEBzZWxlY3RCeU1vdGlvbihzZWxlY3Rpb24pXG5cbiAgICBAZWRpdG9yLm1lcmdlQ3Vyc29ycygpXG4gICAgQGVkaXRvci5tZXJnZUludGVyc2VjdGluZ1NlbGVjdGlvbnMoKVxuXG4gICAgaWYgQGlzTW9kZSgndmlzdWFsJylcbiAgICAgICMgV2UgaGF2ZSB0byB1cGRhdGUgc2VsZWN0aW9uIHByb3BcbiAgICAgICMgQUZURVIgY3Vyc29yIG1vdmUgYW5kIEJFRk9SRSByZXR1cm4gdG8gc3VibW9kZS13aXNlIHN0YXRlXG4gICAgICBzd3JhcC5zYXZlUHJvcGVydGllcyhAZWRpdG9yKVxuXG4gICAgaWYgQG9wZXJhdG9yP1xuICAgICAgaWYgQGlzTW9kZSgndmlzdWFsJylcbiAgICAgICAgaWYgQGlzTW9kZSgndmlzdWFsJywgJ2xpbmV3aXNlJykgYW5kIEBlZGl0b3IuZ2V0TGFzdFNlbGVjdGlvbigpLmlzUmV2ZXJzZWQoKVxuICAgICAgICAgIEB2aW1TdGF0ZS5tdXRhdGlvbk1hbmFnZXIuc2V0Q2hlY2twb2ludCgnZGlkLW1vdmUnKVxuICAgICAgZWxzZVxuICAgICAgICBAdmltU3RhdGUubXV0YXRpb25NYW5hZ2VyLnNldENoZWNrcG9pbnQoJ2RpZC1tb3ZlJylcblxuICAgICMgTW9kaWZ5IHNlbGVjdGlvbiB0byBzdWJtb2RlLXdpc2VseVxuICAgIHN3aXRjaCBAd2lzZVxuICAgICAgd2hlbiAnbGluZXdpc2UnXG4gICAgICAgIEB2aW1TdGF0ZS5zZWxlY3RMaW5ld2lzZSgpXG4gICAgICB3aGVuICdibG9ja3dpc2UnXG4gICAgICAgIEB2aW1TdGF0ZS5zZWxlY3RCbG9ja3dpc2UoKVxuXG4gIHNlbGVjdEJ5TW90aW9uOiAoc2VsZWN0aW9uKSAtPlxuICAgIHtjdXJzb3J9ID0gc2VsZWN0aW9uXG5cbiAgICBzZWxlY3Rpb24ubW9kaWZ5U2VsZWN0aW9uID0+XG4gICAgICBAbW92ZVdpdGhTYXZlSnVtcChjdXJzb3IpXG5cbiAgICBpZiBub3QgQGlzTW9kZSgndmlzdWFsJykgYW5kIG5vdCBAaXMoJ0N1cnJlbnRTZWxlY3Rpb24nKSBhbmQgc2VsZWN0aW9uLmlzRW1wdHkoKSAjIEZhaWxlZCB0byBtb3ZlLlxuICAgICAgcmV0dXJuXG4gICAgcmV0dXJuIHVubGVzcyBAaXNJbmNsdXNpdmUoKSBvciBAaXNMaW5ld2lzZSgpXG5cbiAgICBpZiBAaXNNb2RlKCd2aXN1YWwnKSBhbmQgY3Vyc29ySXNBdEVuZE9mTGluZUF0Tm9uRW1wdHlSb3coY3Vyc29yKVxuICAgICAgIyBBdm9pZCBwdXRpbmcgY3Vyc29yIG9uIEVPTCBpbiB2aXN1YWwtbW9kZSBhcyBsb25nIGFzIGN1cnNvcidzIHJvdyB3YXMgbm9uLWVtcHR5LlxuICAgICAgc3dyYXAoc2VsZWN0aW9uKS50cmFuc2xhdGVTZWxlY3Rpb25IZWFkQW5kQ2xpcCgnYmFja3dhcmQnKVxuICAgICMgdG8gc2VsZWN0IEBpbmNsdXNpdmUtbHlcbiAgICBzd3JhcChzZWxlY3Rpb24pLnRyYW5zbGF0ZVNlbGVjdGlvbkVuZEFuZENsaXAoJ2ZvcndhcmQnKVxuXG4gIHNldEN1cnNvckJ1ZmZlUm93OiAoY3Vyc29yLCByb3csIG9wdGlvbnMpIC0+XG4gICAgaWYgQGlzVmVydGljYWxNb3Rpb24oKSBhbmQgQGdldENvbmZpZygnbW92ZVRvRmlyc3RDaGFyYWN0ZXJPblZlcnRpY2FsTW90aW9uJylcbiAgICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihAZ2V0Rmlyc3RDaGFyYWN0ZXJQb3NpdGlvbkZvckJ1ZmZlclJvdyhyb3cpLCBvcHRpb25zKVxuICAgIGVsc2VcbiAgICAgIHNldEJ1ZmZlclJvdyhjdXJzb3IsIHJvdywgb3B0aW9ucylcblxuICAjIFtOT1RFXVxuICAjIFNpbmNlIHRoaXMgZnVuY3Rpb24gY2hlY2tzIGN1cnNvciBwb3NpdGlvbiBjaGFuZ2UsIGEgY3Vyc29yIHBvc2l0aW9uIE1VU1QgYmVcbiAgIyB1cGRhdGVkIElOIGNhbGxiYWNrKD1mbilcbiAgIyBVcGRhdGluZyBwb2ludCBvbmx5IGluIGNhbGxiYWNrIGlzIHdyb25nLXVzZSBvZiB0aGlzIGZ1bmNpdG9uLFxuICAjIHNpbmNlIGl0IHN0b3BzIGltbWVkaWF0ZWx5IGJlY2F1c2Ugb2Ygbm90IGN1cnNvciBwb3NpdGlvbiBjaGFuZ2UuXG4gIG1vdmVDdXJzb3JDb3VudFRpbWVzOiAoY3Vyc29yLCBmbikgLT5cbiAgICBvbGRQb3NpdGlvbiA9IGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXG4gICAgQGNvdW50VGltZXMgQGdldENvdW50KCksIChzdGF0ZSkgLT5cbiAgICAgIGZuKHN0YXRlKVxuICAgICAgaWYgKG5ld1Bvc2l0aW9uID0gY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKCkpLmlzRXF1YWwob2xkUG9zaXRpb24pXG4gICAgICAgIHN0YXRlLnN0b3AoKVxuICAgICAgb2xkUG9zaXRpb24gPSBuZXdQb3NpdGlvblxuXG4jIFVzZWQgYXMgb3BlcmF0b3IncyB0YXJnZXQgaW4gdmlzdWFsLW1vZGUuXG5jbGFzcyBDdXJyZW50U2VsZWN0aW9uIGV4dGVuZHMgTW90aW9uXG4gIEBleHRlbmQoZmFsc2UpXG4gIHNlbGVjdGlvbkV4dGVudDogbnVsbFxuICBibG9ja3dpc2VTZWxlY3Rpb25FeHRlbnQ6IG51bGxcbiAgaW5jbHVzaXZlOiB0cnVlXG5cbiAgaW5pdGlhbGl6ZTogLT5cbiAgICBzdXBlclxuICAgIEBwb2ludEluZm9CeUN1cnNvciA9IG5ldyBNYXBcblxuICBtb3ZlQ3Vyc29yOiAoY3Vyc29yKSAtPlxuICAgIGlmIEBpc01vZGUoJ3Zpc3VhbCcpXG4gICAgICBpZiBAaXNCbG9ja3dpc2UoKVxuICAgICAgICBAYmxvY2t3aXNlU2VsZWN0aW9uRXh0ZW50ID0gc3dyYXAoY3Vyc29yLnNlbGVjdGlvbikuZ2V0QmxvY2t3aXNlU2VsZWN0aW9uRXh0ZW50KClcbiAgICAgIGVsc2VcbiAgICAgICAgQHNlbGVjdGlvbkV4dGVudCA9IEBlZGl0b3IuZ2V0U2VsZWN0ZWRCdWZmZXJSYW5nZSgpLmdldEV4dGVudCgpXG4gICAgZWxzZVxuICAgICAgIyBgLmAgcmVwZWF0IGNhc2VcbiAgICAgIHBvaW50ID0gY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKClcblxuICAgICAgaWYgQGJsb2Nrd2lzZVNlbGVjdGlvbkV4dGVudD9cbiAgICAgICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHBvaW50LnRyYW5zbGF0ZShAYmxvY2t3aXNlU2VsZWN0aW9uRXh0ZW50KSlcbiAgICAgIGVsc2VcbiAgICAgICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHBvaW50LnRyYXZlcnNlKEBzZWxlY3Rpb25FeHRlbnQpKVxuXG4gIHNlbGVjdDogLT5cbiAgICBpZiBAaXNNb2RlKCd2aXN1YWwnKVxuICAgICAgc3VwZXJcbiAgICBlbHNlXG4gICAgICBmb3IgY3Vyc29yIGluIEBlZGl0b3IuZ2V0Q3Vyc29ycygpIHdoZW4gcG9pbnRJbmZvID0gQHBvaW50SW5mb0J5Q3Vyc29yLmdldChjdXJzb3IpXG4gICAgICAgIHtjdXJzb3JQb3NpdGlvbiwgc3RhcnRPZlNlbGVjdGlvbiwgYXRFT0x9ID0gcG9pbnRJbmZvXG4gICAgICAgIGlmIGF0RU9MIG9yIGN1cnNvclBvc2l0aW9uLmlzRXF1YWwoY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKCkpXG4gICAgICAgICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHN0YXJ0T2ZTZWxlY3Rpb24pXG4gICAgICBzdXBlclxuXG4gICAgIyAqIFB1cnBvc2Ugb2YgcG9pbnRJbmZvQnlDdXJzb3I/IHNlZSAjMjM1IGZvciBkZXRhaWwuXG4gICAgIyBXaGVuIHN0YXlPblRyYW5zZm9ybVN0cmluZyBpcyBlbmFibGVkLCBjdXJzb3IgcG9zIGlzIG5vdCBzZXQgb24gc3RhcnQgb2ZcbiAgICAjIG9mIHNlbGVjdGVkIHJhbmdlLlxuICAgICMgQnV0IEkgd2FudCBmb2xsb3dpbmcgYmVoYXZpb3IsIHNvIG5lZWQgdG8gcHJlc2VydmUgcG9zaXRpb24gaW5mby5cbiAgICAjICAxLiBgdmo+LmAgLT4gaW5kZW50IHNhbWUgdHdvIHJvd3MgcmVnYXJkbGVzcyBvZiBjdXJyZW50IGN1cnNvcidzIHJvdy5cbiAgICAjICAyLiBgdmo+ai5gIC0+IGluZGVudCB0d28gcm93cyBmcm9tIGN1cnNvcidzIHJvdy5cbiAgICBmb3IgY3Vyc29yIGluIEBlZGl0b3IuZ2V0Q3Vyc29ycygpXG4gICAgICBzdGFydE9mU2VsZWN0aW9uID0gY3Vyc29yLnNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpLnN0YXJ0XG4gICAgICBAb25EaWRGaW5pc2hPcGVyYXRpb24gPT5cbiAgICAgICAgY3Vyc29yUG9zaXRpb24gPSBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuICAgICAgICBhdEVPTCA9IGN1cnNvci5pc0F0RW5kT2ZMaW5lKClcbiAgICAgICAgQHBvaW50SW5mb0J5Q3Vyc29yLnNldChjdXJzb3IsIHtzdGFydE9mU2VsZWN0aW9uLCBjdXJzb3JQb3NpdGlvbiwgYXRFT0x9KVxuXG5jbGFzcyBNb3ZlTGVmdCBleHRlbmRzIE1vdGlvblxuICBAZXh0ZW5kKClcbiAgbW92ZUN1cnNvcjogKGN1cnNvcikgLT5cbiAgICBhbGxvd1dyYXAgPSBAZ2V0Q29uZmlnKCd3cmFwTGVmdFJpZ2h0TW90aW9uJylcbiAgICBAbW92ZUN1cnNvckNvdW50VGltZXMgY3Vyc29yLCAtPlxuICAgICAgbW92ZUN1cnNvckxlZnQoY3Vyc29yLCB7YWxsb3dXcmFwfSlcblxuY2xhc3MgTW92ZVJpZ2h0IGV4dGVuZHMgTW90aW9uXG4gIEBleHRlbmQoKVxuICBjYW5XcmFwVG9OZXh0TGluZTogKGN1cnNvcikgLT5cbiAgICBpZiBAaXNBc1RhcmdldEV4Y2VwdFNlbGVjdCgpIGFuZCBub3QgY3Vyc29yLmlzQXRFbmRPZkxpbmUoKVxuICAgICAgZmFsc2VcbiAgICBlbHNlXG4gICAgICBAZ2V0Q29uZmlnKCd3cmFwTGVmdFJpZ2h0TW90aW9uJylcblxuICBtb3ZlQ3Vyc29yOiAoY3Vyc29yKSAtPlxuICAgIEBtb3ZlQ3Vyc29yQ291bnRUaW1lcyBjdXJzb3IsID0+XG4gICAgICBAZWRpdG9yLnVuZm9sZEJ1ZmZlclJvdyhjdXJzb3IuZ2V0QnVmZmVyUm93KCkpXG4gICAgICBhbGxvd1dyYXAgPSBAY2FuV3JhcFRvTmV4dExpbmUoY3Vyc29yKVxuICAgICAgbW92ZUN1cnNvclJpZ2h0KGN1cnNvcilcbiAgICAgIGlmIGN1cnNvci5pc0F0RW5kT2ZMaW5lKCkgYW5kIGFsbG93V3JhcCBhbmQgbm90IGN1cnNvcklzQXRWaW1FbmRPZkZpbGUoY3Vyc29yKVxuICAgICAgICBtb3ZlQ3Vyc29yUmlnaHQoY3Vyc29yLCB7YWxsb3dXcmFwfSlcblxuY2xhc3MgTW92ZVJpZ2h0QnVmZmVyQ29sdW1uIGV4dGVuZHMgTW90aW9uXG4gIEBleHRlbmQoZmFsc2UpXG5cbiAgbW92ZUN1cnNvcjogKGN1cnNvcikgLT5cbiAgICBzZXRCdWZmZXJDb2x1bW4oY3Vyc29yLCBjdXJzb3IuZ2V0QnVmZmVyQ29sdW1uKCkgKyBAZ2V0Q291bnQoKSlcblxuY2xhc3MgTW92ZVVwIGV4dGVuZHMgTW90aW9uXG4gIEBleHRlbmQoKVxuICB3aXNlOiAnbGluZXdpc2UnXG4gIHdyYXA6IGZhbHNlXG5cbiAgZ2V0QnVmZmVyUm93OiAocm93KSAtPlxuICAgIHJvdyA9IEBnZXROZXh0Um93KHJvdylcbiAgICBpZiBAZWRpdG9yLmlzRm9sZGVkQXRCdWZmZXJSb3cocm93KVxuICAgICAgZ2V0TGFyZ2VzdEZvbGRSYW5nZUNvbnRhaW5zQnVmZmVyUm93KEBlZGl0b3IsIHJvdykuc3RhcnQucm93XG4gICAgZWxzZVxuICAgICAgcm93XG5cbiAgZ2V0TmV4dFJvdzogKHJvdykgLT5cbiAgICBtaW4gPSAwXG4gICAgaWYgQHdyYXAgYW5kIHJvdyBpcyBtaW5cbiAgICAgIEBnZXRWaW1MYXN0QnVmZmVyUm93KClcbiAgICBlbHNlXG4gICAgICBsaW1pdE51bWJlcihyb3cgLSAxLCB7bWlufSlcblxuICBtb3ZlQ3Vyc29yOiAoY3Vyc29yKSAtPlxuICAgIEBtb3ZlQ3Vyc29yQ291bnRUaW1lcyBjdXJzb3IsID0+XG4gICAgICBzZXRCdWZmZXJSb3coY3Vyc29yLCBAZ2V0QnVmZmVyUm93KGN1cnNvci5nZXRCdWZmZXJSb3coKSkpXG5cbmNsYXNzIE1vdmVVcFdyYXAgZXh0ZW5kcyBNb3ZlVXBcbiAgQGV4dGVuZCgpXG4gIHdyYXA6IHRydWVcblxuY2xhc3MgTW92ZURvd24gZXh0ZW5kcyBNb3ZlVXBcbiAgQGV4dGVuZCgpXG4gIHdpc2U6ICdsaW5ld2lzZSdcbiAgd3JhcDogZmFsc2VcblxuICBnZXRCdWZmZXJSb3c6IChyb3cpIC0+XG4gICAgaWYgQGVkaXRvci5pc0ZvbGRlZEF0QnVmZmVyUm93KHJvdylcbiAgICAgIHJvdyA9IGdldExhcmdlc3RGb2xkUmFuZ2VDb250YWluc0J1ZmZlclJvdyhAZWRpdG9yLCByb3cpLmVuZC5yb3dcbiAgICBAZ2V0TmV4dFJvdyhyb3cpXG5cbiAgZ2V0TmV4dFJvdzogKHJvdykgLT5cbiAgICBtYXggPSBAZ2V0VmltTGFzdEJ1ZmZlclJvdygpXG4gICAgaWYgQHdyYXAgYW5kIHJvdyA+PSBtYXhcbiAgICAgIDBcbiAgICBlbHNlXG4gICAgICBsaW1pdE51bWJlcihyb3cgKyAxLCB7bWF4fSlcblxuY2xhc3MgTW92ZURvd25XcmFwIGV4dGVuZHMgTW92ZURvd25cbiAgQGV4dGVuZCgpXG4gIHdyYXA6IHRydWVcblxuY2xhc3MgTW92ZVVwU2NyZWVuIGV4dGVuZHMgTW90aW9uXG4gIEBleHRlbmQoKVxuICB3aXNlOiAnbGluZXdpc2UnXG4gIGRpcmVjdGlvbjogJ3VwJ1xuXG4gIG1vdmVDdXJzb3I6IChjdXJzb3IpIC0+XG4gICAgQG1vdmVDdXJzb3JDb3VudFRpbWVzIGN1cnNvciwgLT5cbiAgICAgIG1vdmVDdXJzb3JVcFNjcmVlbihjdXJzb3IpXG5cbmNsYXNzIE1vdmVEb3duU2NyZWVuIGV4dGVuZHMgTW92ZVVwU2NyZWVuXG4gIEBleHRlbmQoKVxuICB3aXNlOiAnbGluZXdpc2UnXG4gIGRpcmVjdGlvbjogJ2Rvd24nXG5cbiAgbW92ZUN1cnNvcjogKGN1cnNvcikgLT5cbiAgICBAbW92ZUN1cnNvckNvdW50VGltZXMgY3Vyc29yLCAtPlxuICAgICAgbW92ZUN1cnNvckRvd25TY3JlZW4oY3Vyc29yKVxuXG4jIE1vdmUgZG93bi91cCB0byBFZGdlXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgU2VlIHQ5bWQvYXRvbS12aW0tbW9kZS1wbHVzIzIzNlxuIyBBdCBsZWFzdCB2MS43LjAuIGJ1ZmZlclBvc2l0aW9uIGFuZCBzY3JlZW5Qb3NpdGlvbiBjYW5ub3QgY29udmVydCBhY2N1cmF0ZWx5XG4jIHdoZW4gcm93IGlzIGZvbGRlZC5cbmNsYXNzIE1vdmVVcFRvRWRnZSBleHRlbmRzIE1vdGlvblxuICBAZXh0ZW5kKClcbiAgd2lzZTogJ2xpbmV3aXNlJ1xuICBqdW1wOiB0cnVlXG4gIGRpcmVjdGlvbjogJ3VwJ1xuICBAZGVzY3JpcHRpb246IFwiTW92ZSBjdXJzb3IgdXAgdG8gKiplZGdlKiogY2hhciBhdCBzYW1lLWNvbHVtblwiXG5cbiAgbW92ZUN1cnNvcjogKGN1cnNvcikgLT5cbiAgICBAbW92ZUN1cnNvckNvdW50VGltZXMgY3Vyc29yLCA9PlxuICAgICAgQHNldFNjcmVlblBvc2l0aW9uU2FmZWx5KGN1cnNvciwgQGdldFBvaW50KGN1cnNvci5nZXRTY3JlZW5Qb3NpdGlvbigpKSlcblxuICBnZXRQb2ludDogKGZyb21Qb2ludCkgLT5cbiAgICBjb2x1bW4gPSBmcm9tUG9pbnQuY29sdW1uXG4gICAgZm9yIHJvdyBpbiBAZ2V0U2NhblJvd3MoZnJvbVBvaW50KSB3aGVuIEBpc0VkZ2UocG9pbnQgPSBuZXcgUG9pbnQocm93LCBjb2x1bW4pKVxuICAgICAgcmV0dXJuIHBvaW50XG5cbiAgZ2V0U2NhblJvd3M6ICh7cm93fSkgLT5cbiAgICB2YWxpZFJvdyA9IGdldFZhbGlkVmltU2NyZWVuUm93LmJpbmQobnVsbCwgQGVkaXRvcilcbiAgICBzd2l0Y2ggQGRpcmVjdGlvblxuICAgICAgd2hlbiAndXAnIHRoZW4gW3ZhbGlkUm93KHJvdyAtIDEpLi4wXVxuICAgICAgd2hlbiAnZG93bicgdGhlbiBbdmFsaWRSb3cocm93ICsgMSkuLkBnZXRWaW1MYXN0U2NyZWVuUm93KCldXG5cbiAgaXNFZGdlOiAocG9pbnQpIC0+XG4gICAgaWYgQGlzU3RvcHBhYmxlUG9pbnQocG9pbnQpXG4gICAgICAjIElmIG9uZSBvZiBhYm92ZS9iZWxvdyBwb2ludCB3YXMgbm90IHN0b3BwYWJsZSwgaXQncyBFZGdlIVxuICAgICAgYWJvdmUgPSBwb2ludC50cmFuc2xhdGUoWy0xLCAwXSlcbiAgICAgIGJlbG93ID0gcG9pbnQudHJhbnNsYXRlKFsrMSwgMF0pXG4gICAgICAobm90IEBpc1N0b3BwYWJsZVBvaW50KGFib3ZlKSkgb3IgKG5vdCBAaXNTdG9wcGFibGVQb2ludChiZWxvdykpXG4gICAgZWxzZVxuICAgICAgZmFsc2VcblxuICBpc1N0b3BwYWJsZVBvaW50OiAocG9pbnQpIC0+XG4gICAgaWYgQGlzTm9uV2hpdGVTcGFjZVBvaW50KHBvaW50KVxuICAgICAgdHJ1ZVxuICAgIGVsc2VcbiAgICAgIGxlZnRQb2ludCA9IHBvaW50LnRyYW5zbGF0ZShbMCwgLTFdKVxuICAgICAgcmlnaHRQb2ludCA9IHBvaW50LnRyYW5zbGF0ZShbMCwgKzFdKVxuICAgICAgQGlzTm9uV2hpdGVTcGFjZVBvaW50KGxlZnRQb2ludCkgYW5kIEBpc05vbldoaXRlU3BhY2VQb2ludChyaWdodFBvaW50KVxuXG4gIGlzTm9uV2hpdGVTcGFjZVBvaW50OiAocG9pbnQpIC0+XG4gICAgY2hhciA9IGdldFRleHRJblNjcmVlblJhbmdlKEBlZGl0b3IsIFJhbmdlLmZyb21Qb2ludFdpdGhEZWx0YShwb2ludCwgMCwgMSkpXG4gICAgY2hhcj8gYW5kIC9cXFMvLnRlc3QoY2hhcilcblxuY2xhc3MgTW92ZURvd25Ub0VkZ2UgZXh0ZW5kcyBNb3ZlVXBUb0VkZ2VcbiAgQGV4dGVuZCgpXG4gIEBkZXNjcmlwdGlvbjogXCJNb3ZlIGN1cnNvciBkb3duIHRvICoqZWRnZSoqIGNoYXIgYXQgc2FtZS1jb2x1bW5cIlxuICBkaXJlY3Rpb246ICdkb3duJ1xuXG4jIHdvcmRcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgTW92ZVRvTmV4dFdvcmQgZXh0ZW5kcyBNb3Rpb25cbiAgQGV4dGVuZCgpXG4gIHdvcmRSZWdleDogbnVsbFxuXG4gIGdldFBvaW50OiAocGF0dGVybiwgZnJvbSkgLT5cbiAgICB3b3JkUmFuZ2UgPSBudWxsXG4gICAgZm91bmQgPSBmYWxzZVxuICAgIHZpbUVPRiA9IEBnZXRWaW1Fb2ZCdWZmZXJQb3NpdGlvbihAZWRpdG9yKVxuXG4gICAgQHNjYW5Gb3J3YXJkIHBhdHRlcm4sIHtmcm9tfSwgKHtyYW5nZSwgbWF0Y2hUZXh0LCBzdG9wfSkgLT5cbiAgICAgIHdvcmRSYW5nZSA9IHJhbmdlXG4gICAgICAjIElnbm9yZSAnZW1wdHkgbGluZScgbWF0Y2hlcyBiZXR3ZWVuICdcXHInIGFuZCAnXFxuJ1xuICAgICAgcmV0dXJuIGlmIG1hdGNoVGV4dCBpcyAnJyBhbmQgcmFuZ2Uuc3RhcnQuY29sdW1uIGlzbnQgMFxuICAgICAgaWYgcmFuZ2Uuc3RhcnQuaXNHcmVhdGVyVGhhbihmcm9tKVxuICAgICAgICBmb3VuZCA9IHRydWVcbiAgICAgICAgc3RvcCgpXG5cbiAgICBpZiBmb3VuZFxuICAgICAgcG9pbnQgPSB3b3JkUmFuZ2Uuc3RhcnRcbiAgICAgIGlmIHBvaW50SXNBdEVuZE9mTGluZUF0Tm9uRW1wdHlSb3coQGVkaXRvciwgcG9pbnQpIGFuZCBub3QgcG9pbnQuaXNFcXVhbCh2aW1FT0YpXG4gICAgICAgIHBvaW50LnRyYXZlcnNlKFsxLCAwXSlcbiAgICAgIGVsc2VcbiAgICAgICAgcG9pbnRcbiAgICBlbHNlXG4gICAgICB3b3JkUmFuZ2U/LmVuZCA/IGZyb21cblxuICAjIFNwZWNpYWwgY2FzZTogXCJjd1wiIGFuZCBcImNXXCIgYXJlIHRyZWF0ZWQgbGlrZSBcImNlXCIgYW5kIFwiY0VcIiBpZiB0aGUgY3Vyc29yIGlzXG4gICMgb24gYSBub24tYmxhbmsuICBUaGlzIGlzIGJlY2F1c2UgXCJjd1wiIGlzIGludGVycHJldGVkIGFzIGNoYW5nZS13b3JkLCBhbmQgYVxuICAjIHdvcmQgZG9lcyBub3QgaW5jbHVkZSB0aGUgZm9sbG93aW5nIHdoaXRlIHNwYWNlLiAge1ZpOiBcImN3XCIgd2hlbiBvbiBhIGJsYW5rXG4gICMgZm9sbG93ZWQgYnkgb3RoZXIgYmxhbmtzIGNoYW5nZXMgb25seSB0aGUgZmlyc3QgYmxhbms7IHRoaXMgaXMgcHJvYmFibHkgYVxuICAjIGJ1ZywgYmVjYXVzZSBcImR3XCIgZGVsZXRlcyBhbGwgdGhlIGJsYW5rc31cbiAgI1xuICAjIEFub3RoZXIgc3BlY2lhbCBjYXNlOiBXaGVuIHVzaW5nIHRoZSBcIndcIiBtb3Rpb24gaW4gY29tYmluYXRpb24gd2l0aCBhblxuICAjIG9wZXJhdG9yIGFuZCB0aGUgbGFzdCB3b3JkIG1vdmVkIG92ZXIgaXMgYXQgdGhlIGVuZCBvZiBhIGxpbmUsIHRoZSBlbmQgb2ZcbiAgIyB0aGF0IHdvcmQgYmVjb21lcyB0aGUgZW5kIG9mIHRoZSBvcGVyYXRlZCB0ZXh0LCBub3QgdGhlIGZpcnN0IHdvcmQgaW4gdGhlXG4gICMgbmV4dCBsaW5lLlxuICBtb3ZlQ3Vyc29yOiAoY3Vyc29yKSAtPlxuICAgIHJldHVybiBpZiBjdXJzb3JJc0F0VmltRW5kT2ZGaWxlKGN1cnNvcilcbiAgICB3YXNPbldoaXRlU3BhY2UgPSBwb2ludElzT25XaGl0ZVNwYWNlKEBlZGl0b3IsIGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpKVxuXG4gICAgaXNBc1RhcmdldEV4Y2VwdFNlbGVjdCA9IEBpc0FzVGFyZ2V0RXhjZXB0U2VsZWN0KClcbiAgICBAbW92ZUN1cnNvckNvdW50VGltZXMgY3Vyc29yLCAoe2lzRmluYWx9KSA9PlxuICAgICAgY3Vyc29yUG9zaXRpb24gPSBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuICAgICAgaWYgaXNFbXB0eVJvdyhAZWRpdG9yLCBjdXJzb3JQb3NpdGlvbi5yb3cpIGFuZCBpc0FzVGFyZ2V0RXhjZXB0U2VsZWN0XG4gICAgICAgIHBvaW50ID0gY3Vyc29yUG9zaXRpb24udHJhdmVyc2UoWzEsIDBdKVxuICAgICAgZWxzZVxuICAgICAgICBwYXR0ZXJuID0gQHdvcmRSZWdleCA/IGN1cnNvci53b3JkUmVnRXhwKClcbiAgICAgICAgcG9pbnQgPSBAZ2V0UG9pbnQocGF0dGVybiwgY3Vyc29yUG9zaXRpb24pXG4gICAgICAgIGlmIGlzRmluYWwgYW5kIGlzQXNUYXJnZXRFeGNlcHRTZWxlY3RcbiAgICAgICAgICBpZiBAZ2V0T3BlcmF0b3IoKS5pcygnQ2hhbmdlJykgYW5kIChub3Qgd2FzT25XaGl0ZVNwYWNlKVxuICAgICAgICAgICAgcG9pbnQgPSBjdXJzb3IuZ2V0RW5kT2ZDdXJyZW50V29yZEJ1ZmZlclBvc2l0aW9uKHtAd29yZFJlZ2V4fSlcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBwb2ludCA9IFBvaW50Lm1pbihwb2ludCwgZ2V0RW5kT2ZMaW5lRm9yQnVmZmVyUm93KEBlZGl0b3IsIGN1cnNvclBvc2l0aW9uLnJvdykpXG4gICAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24ocG9pbnQpXG5cbiMgYlxuY2xhc3MgTW92ZVRvUHJldmlvdXNXb3JkIGV4dGVuZHMgTW90aW9uXG4gIEBleHRlbmQoKVxuICB3b3JkUmVnZXg6IG51bGxcblxuICBtb3ZlQ3Vyc29yOiAoY3Vyc29yKSAtPlxuICAgIEBtb3ZlQ3Vyc29yQ291bnRUaW1lcyBjdXJzb3IsID0+XG4gICAgICBwb2ludCA9IGN1cnNvci5nZXRCZWdpbm5pbmdPZkN1cnJlbnRXb3JkQnVmZmVyUG9zaXRpb24oe0B3b3JkUmVnZXh9KVxuICAgICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHBvaW50KVxuXG5jbGFzcyBNb3ZlVG9FbmRPZldvcmQgZXh0ZW5kcyBNb3Rpb25cbiAgQGV4dGVuZCgpXG4gIHdvcmRSZWdleDogbnVsbFxuICBpbmNsdXNpdmU6IHRydWVcblxuICBtb3ZlVG9OZXh0RW5kT2ZXb3JkOiAoY3Vyc29yKSAtPlxuICAgIG1vdmVDdXJzb3JUb05leHROb25XaGl0ZXNwYWNlKGN1cnNvcilcbiAgICBwb2ludCA9IGN1cnNvci5nZXRFbmRPZkN1cnJlbnRXb3JkQnVmZmVyUG9zaXRpb24oe0B3b3JkUmVnZXh9KS50cmFuc2xhdGUoWzAsIC0xXSlcbiAgICBwb2ludCA9IFBvaW50Lm1pbihwb2ludCwgQGdldFZpbUVvZkJ1ZmZlclBvc2l0aW9uKCkpXG4gICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHBvaW50KVxuXG4gIG1vdmVDdXJzb3I6IChjdXJzb3IpIC0+XG4gICAgQG1vdmVDdXJzb3JDb3VudFRpbWVzIGN1cnNvciwgPT5cbiAgICAgIG9yaWdpbmFsUG9pbnQgPSBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuICAgICAgQG1vdmVUb05leHRFbmRPZldvcmQoY3Vyc29yKVxuICAgICAgaWYgb3JpZ2luYWxQb2ludC5pc0VxdWFsKGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpKVxuICAgICAgICAjIFJldHJ5IGZyb20gcmlnaHQgY29sdW1uIGlmIGN1cnNvciB3YXMgYWxyZWFkeSBvbiBFbmRPZldvcmRcbiAgICAgICAgY3Vyc29yLm1vdmVSaWdodCgpXG4gICAgICAgIEBtb3ZlVG9OZXh0RW5kT2ZXb3JkKGN1cnNvcilcblxuIyBbVE9ETzogSW1wcm92ZSwgYWNjdXJhY3ldXG5jbGFzcyBNb3ZlVG9QcmV2aW91c0VuZE9mV29yZCBleHRlbmRzIE1vdmVUb1ByZXZpb3VzV29yZFxuICBAZXh0ZW5kKClcbiAgaW5jbHVzaXZlOiB0cnVlXG5cbiAgbW92ZUN1cnNvcjogKGN1cnNvcikgLT5cbiAgICB0aW1lcyA9IEBnZXRDb3VudCgpXG4gICAgd29yZFJhbmdlID0gY3Vyc29yLmdldEN1cnJlbnRXb3JkQnVmZmVyUmFuZ2UoKVxuICAgIGN1cnNvclBvc2l0aW9uID0gY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKClcblxuICAgICMgaWYgd2UncmUgaW4gdGhlIG1pZGRsZSBvZiBhIHdvcmQgdGhlbiB3ZSBuZWVkIHRvIG1vdmUgdG8gaXRzIHN0YXJ0XG4gICAgaWYgY3Vyc29yUG9zaXRpb24uaXNHcmVhdGVyVGhhbih3b3JkUmFuZ2Uuc3RhcnQpIGFuZCBjdXJzb3JQb3NpdGlvbi5pc0xlc3NUaGFuKHdvcmRSYW5nZS5lbmQpXG4gICAgICB0aW1lcyArPSAxXG5cbiAgICBmb3IgWzEuLnRpbWVzXVxuICAgICAgcG9pbnQgPSBjdXJzb3IuZ2V0QmVnaW5uaW5nT2ZDdXJyZW50V29yZEJ1ZmZlclBvc2l0aW9uKHtAd29yZFJlZ2V4fSlcbiAgICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihwb2ludClcblxuICAgIEBtb3ZlVG9OZXh0RW5kT2ZXb3JkKGN1cnNvcilcbiAgICBpZiBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKS5pc0dyZWF0ZXJUaGFuT3JFcXVhbChjdXJzb3JQb3NpdGlvbilcbiAgICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihbMCwgMF0pXG5cbiAgbW92ZVRvTmV4dEVuZE9mV29yZDogKGN1cnNvcikgLT5cbiAgICBwb2ludCA9IGN1cnNvci5nZXRFbmRPZkN1cnJlbnRXb3JkQnVmZmVyUG9zaXRpb24oe0B3b3JkUmVnZXh9KS50cmFuc2xhdGUoWzAsIC0xXSlcbiAgICBwb2ludCA9IFBvaW50Lm1pbihwb2ludCwgQGdldFZpbUVvZkJ1ZmZlclBvc2l0aW9uKCkpXG4gICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHBvaW50KVxuXG4jIFdob2xlIHdvcmRcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgTW92ZVRvTmV4dFdob2xlV29yZCBleHRlbmRzIE1vdmVUb05leHRXb3JkXG4gIEBleHRlbmQoKVxuICB3b3JkUmVnZXg6IC9eJHxcXFMrL2dcblxuY2xhc3MgTW92ZVRvUHJldmlvdXNXaG9sZVdvcmQgZXh0ZW5kcyBNb3ZlVG9QcmV2aW91c1dvcmRcbiAgQGV4dGVuZCgpXG4gIHdvcmRSZWdleDogL14kfFxcUysvZ1xuXG5jbGFzcyBNb3ZlVG9FbmRPZldob2xlV29yZCBleHRlbmRzIE1vdmVUb0VuZE9mV29yZFxuICBAZXh0ZW5kKClcbiAgd29yZFJlZ2V4OiAvXFxTKy9cblxuIyBbVE9ETzogSW1wcm92ZSwgYWNjdXJhY3ldXG5jbGFzcyBNb3ZlVG9QcmV2aW91c0VuZE9mV2hvbGVXb3JkIGV4dGVuZHMgTW92ZVRvUHJldmlvdXNFbmRPZldvcmRcbiAgQGV4dGVuZCgpXG4gIHdvcmRSZWdleDogL1xcUysvXG5cbiMgQWxwaGFudW1lcmljIHdvcmQgW0V4cGVyaW1lbnRhbF1cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgTW92ZVRvTmV4dEFscGhhbnVtZXJpY1dvcmQgZXh0ZW5kcyBNb3ZlVG9OZXh0V29yZFxuICBAZXh0ZW5kKClcbiAgQGRlc2NyaXB0aW9uOiBcIk1vdmUgdG8gbmV4dCBhbHBoYW51bWVyaWMoYC9cXHcrL2ApIHdvcmRcIlxuICB3b3JkUmVnZXg6IC9cXHcrL2dcblxuY2xhc3MgTW92ZVRvUHJldmlvdXNBbHBoYW51bWVyaWNXb3JkIGV4dGVuZHMgTW92ZVRvUHJldmlvdXNXb3JkXG4gIEBleHRlbmQoKVxuICBAZGVzY3JpcHRpb246IFwiTW92ZSB0byBwcmV2aW91cyBhbHBoYW51bWVyaWMoYC9cXHcrL2ApIHdvcmRcIlxuICB3b3JkUmVnZXg6IC9cXHcrL1xuXG5jbGFzcyBNb3ZlVG9FbmRPZkFscGhhbnVtZXJpY1dvcmQgZXh0ZW5kcyBNb3ZlVG9FbmRPZldvcmRcbiAgQGV4dGVuZCgpXG4gIEBkZXNjcmlwdGlvbjogXCJNb3ZlIHRvIGVuZCBvZiBhbHBoYW51bWVyaWMoYC9cXHcrL2ApIHdvcmRcIlxuICB3b3JkUmVnZXg6IC9cXHcrL1xuXG4jIEFscGhhbnVtZXJpYyB3b3JkIFtFeHBlcmltZW50YWxdXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIE1vdmVUb05leHRTbWFydFdvcmQgZXh0ZW5kcyBNb3ZlVG9OZXh0V29yZFxuICBAZXh0ZW5kKClcbiAgQGRlc2NyaXB0aW9uOiBcIk1vdmUgdG8gbmV4dCBzbWFydCB3b3JkIChgL1tcXHctXSsvYCkgd29yZFwiXG4gIHdvcmRSZWdleDogL1tcXHctXSsvZ1xuXG5jbGFzcyBNb3ZlVG9QcmV2aW91c1NtYXJ0V29yZCBleHRlbmRzIE1vdmVUb1ByZXZpb3VzV29yZFxuICBAZXh0ZW5kKClcbiAgQGRlc2NyaXB0aW9uOiBcIk1vdmUgdG8gcHJldmlvdXMgc21hcnQgd29yZCAoYC9bXFx3LV0rL2ApIHdvcmRcIlxuICB3b3JkUmVnZXg6IC9bXFx3LV0rL1xuXG5jbGFzcyBNb3ZlVG9FbmRPZlNtYXJ0V29yZCBleHRlbmRzIE1vdmVUb0VuZE9mV29yZFxuICBAZXh0ZW5kKClcbiAgQGRlc2NyaXB0aW9uOiBcIk1vdmUgdG8gZW5kIG9mIHNtYXJ0IHdvcmQgKGAvW1xcdy1dKy9gKSB3b3JkXCJcbiAgd29yZFJlZ2V4OiAvW1xcdy1dKy9cblxuIyBTdWJ3b3JkXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIE1vdmVUb05leHRTdWJ3b3JkIGV4dGVuZHMgTW92ZVRvTmV4dFdvcmRcbiAgQGV4dGVuZCgpXG4gIG1vdmVDdXJzb3I6IChjdXJzb3IpIC0+XG4gICAgQHdvcmRSZWdleCA9IGN1cnNvci5zdWJ3b3JkUmVnRXhwKClcbiAgICBzdXBlclxuXG5jbGFzcyBNb3ZlVG9QcmV2aW91c1N1YndvcmQgZXh0ZW5kcyBNb3ZlVG9QcmV2aW91c1dvcmRcbiAgQGV4dGVuZCgpXG4gIG1vdmVDdXJzb3I6IChjdXJzb3IpIC0+XG4gICAgQHdvcmRSZWdleCA9IGN1cnNvci5zdWJ3b3JkUmVnRXhwKClcbiAgICBzdXBlclxuXG5jbGFzcyBNb3ZlVG9FbmRPZlN1YndvcmQgZXh0ZW5kcyBNb3ZlVG9FbmRPZldvcmRcbiAgQGV4dGVuZCgpXG4gIG1vdmVDdXJzb3I6IChjdXJzb3IpIC0+XG4gICAgQHdvcmRSZWdleCA9IGN1cnNvci5zdWJ3b3JkUmVnRXhwKClcbiAgICBzdXBlclxuXG4jIFNlbnRlbmNlXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgU2VudGVuY2UgaXMgZGVmaW5lZCBhcyBiZWxvd1xuIyAgLSBlbmQgd2l0aCBbJy4nLCAnIScsICc/J11cbiMgIC0gb3B0aW9uYWxseSBmb2xsb3dlZCBieSBbJyknLCAnXScsICdcIicsIFwiJ1wiXVxuIyAgLSBmb2xsb3dlZCBieSBbJyQnLCAnICcsICdcXHQnXVxuIyAgLSBwYXJhZ3JhcGggYm91bmRhcnkgaXMgYWxzbyBzZW50ZW5jZSBib3VuZGFyeVxuIyAgLSBzZWN0aW9uIGJvdW5kYXJ5IGlzIGFsc28gc2VudGVuY2UgYm91bmRhcnkoaWdub3JlKVxuY2xhc3MgTW92ZVRvTmV4dFNlbnRlbmNlIGV4dGVuZHMgTW90aW9uXG4gIEBleHRlbmQoKVxuICBqdW1wOiB0cnVlXG4gIHNlbnRlbmNlUmVnZXg6IC8vLyg/OltcXC4hXFw/XVtcXClcXF1cIiddKlxccyspfChcXG58XFxyXFxuKS8vL2dcbiAgZGlyZWN0aW9uOiAnbmV4dCdcblxuICBtb3ZlQ3Vyc29yOiAoY3Vyc29yKSAtPlxuICAgIEBtb3ZlQ3Vyc29yQ291bnRUaW1lcyBjdXJzb3IsID0+XG4gICAgICBAc2V0QnVmZmVyUG9zaXRpb25TYWZlbHkoY3Vyc29yLCBAZ2V0UG9pbnQoY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKCkpKVxuXG4gIGdldFBvaW50OiAoZnJvbVBvaW50KSAtPlxuICAgIGlmIEBkaXJlY3Rpb24gaXMgJ25leHQnXG4gICAgICBAZ2V0TmV4dFN0YXJ0T2ZTZW50ZW5jZShmcm9tUG9pbnQpXG4gICAgZWxzZSBpZiBAZGlyZWN0aW9uIGlzICdwcmV2aW91cydcbiAgICAgIEBnZXRQcmV2aW91c1N0YXJ0T2ZTZW50ZW5jZShmcm9tUG9pbnQpXG5cbiAgaXNCbGFua1JvdzogKHJvdykgLT5cbiAgICBAZWRpdG9yLmlzQnVmZmVyUm93Qmxhbmsocm93KVxuXG4gIGdldE5leHRTdGFydE9mU2VudGVuY2U6IChmcm9tKSAtPlxuICAgIGZvdW5kUG9pbnQgPSBudWxsXG4gICAgQHNjYW5Gb3J3YXJkIEBzZW50ZW5jZVJlZ2V4LCB7ZnJvbX0sICh7cmFuZ2UsIG1hdGNoVGV4dCwgbWF0Y2gsIHN0b3B9KSA9PlxuICAgICAgaWYgbWF0Y2hbMV0/XG4gICAgICAgIFtzdGFydFJvdywgZW5kUm93XSA9IFtyYW5nZS5zdGFydC5yb3csIHJhbmdlLmVuZC5yb3ddXG4gICAgICAgIHJldHVybiBpZiBAc2tpcEJsYW5rUm93IGFuZCBAaXNCbGFua1JvdyhlbmRSb3cpXG4gICAgICAgIGlmIEBpc0JsYW5rUm93KHN0YXJ0Um93KSBpc250IEBpc0JsYW5rUm93KGVuZFJvdylcbiAgICAgICAgICBmb3VuZFBvaW50ID0gQGdldEZpcnN0Q2hhcmFjdGVyUG9zaXRpb25Gb3JCdWZmZXJSb3coZW5kUm93KVxuICAgICAgZWxzZVxuICAgICAgICBmb3VuZFBvaW50ID0gcmFuZ2UuZW5kXG4gICAgICBzdG9wKCkgaWYgZm91bmRQb2ludD9cbiAgICBmb3VuZFBvaW50ID8gQGdldFZpbUVvZkJ1ZmZlclBvc2l0aW9uKClcblxuICBnZXRQcmV2aW91c1N0YXJ0T2ZTZW50ZW5jZTogKGZyb20pIC0+XG4gICAgZm91bmRQb2ludCA9IG51bGxcbiAgICBAc2NhbkJhY2t3YXJkIEBzZW50ZW5jZVJlZ2V4LCB7ZnJvbX0sICh7cmFuZ2UsIG1hdGNoLCBzdG9wLCBtYXRjaFRleHR9KSA9PlxuICAgICAgaWYgbWF0Y2hbMV0/XG4gICAgICAgIFtzdGFydFJvdywgZW5kUm93XSA9IFtyYW5nZS5zdGFydC5yb3csIHJhbmdlLmVuZC5yb3ddXG4gICAgICAgIGlmIG5vdCBAaXNCbGFua1JvdyhlbmRSb3cpIGFuZCBAaXNCbGFua1JvdyhzdGFydFJvdylcbiAgICAgICAgICBwb2ludCA9IEBnZXRGaXJzdENoYXJhY3RlclBvc2l0aW9uRm9yQnVmZmVyUm93KGVuZFJvdylcbiAgICAgICAgICBpZiBwb2ludC5pc0xlc3NUaGFuKGZyb20pXG4gICAgICAgICAgICBmb3VuZFBvaW50ID0gcG9pbnRcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXR1cm4gaWYgQHNraXBCbGFua1Jvd1xuICAgICAgICAgICAgZm91bmRQb2ludCA9IEBnZXRGaXJzdENoYXJhY3RlclBvc2l0aW9uRm9yQnVmZmVyUm93KHN0YXJ0Um93KVxuICAgICAgZWxzZVxuICAgICAgICBpZiByYW5nZS5lbmQuaXNMZXNzVGhhbihmcm9tKVxuICAgICAgICAgIGZvdW5kUG9pbnQgPSByYW5nZS5lbmRcbiAgICAgIHN0b3AoKSBpZiBmb3VuZFBvaW50P1xuICAgIGZvdW5kUG9pbnQgPyBbMCwgMF1cblxuY2xhc3MgTW92ZVRvUHJldmlvdXNTZW50ZW5jZSBleHRlbmRzIE1vdmVUb05leHRTZW50ZW5jZVxuICBAZXh0ZW5kKClcbiAgZGlyZWN0aW9uOiAncHJldmlvdXMnXG5cbmNsYXNzIE1vdmVUb05leHRTZW50ZW5jZVNraXBCbGFua1JvdyBleHRlbmRzIE1vdmVUb05leHRTZW50ZW5jZVxuICBAZXh0ZW5kKClcbiAgc2tpcEJsYW5rUm93OiB0cnVlXG5cbmNsYXNzIE1vdmVUb1ByZXZpb3VzU2VudGVuY2VTa2lwQmxhbmtSb3cgZXh0ZW5kcyBNb3ZlVG9QcmV2aW91c1NlbnRlbmNlXG4gIEBleHRlbmQoKVxuICBza2lwQmxhbmtSb3c6IHRydWVcblxuIyBQYXJhZ3JhcGhcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgTW92ZVRvTmV4dFBhcmFncmFwaCBleHRlbmRzIE1vdGlvblxuICBAZXh0ZW5kKClcbiAganVtcDogdHJ1ZVxuICBkaXJlY3Rpb246ICduZXh0J1xuXG4gIG1vdmVDdXJzb3I6IChjdXJzb3IpIC0+XG4gICAgQG1vdmVDdXJzb3JDb3VudFRpbWVzIGN1cnNvciwgPT5cbiAgICAgIEBzZXRCdWZmZXJQb3NpdGlvblNhZmVseShjdXJzb3IsIEBnZXRQb2ludChjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKSkpXG5cbiAgZ2V0UG9pbnQ6IChmcm9tUG9pbnQpIC0+XG4gICAgc3RhcnRSb3cgPSBmcm9tUG9pbnQucm93XG4gICAgd2FzQXROb25CbGFua1JvdyA9IG5vdCBAZWRpdG9yLmlzQnVmZmVyUm93Qmxhbmsoc3RhcnRSb3cpXG4gICAgZm9yIHJvdyBpbiBnZXRCdWZmZXJSb3dzKEBlZGl0b3IsIHtzdGFydFJvdywgQGRpcmVjdGlvbn0pXG4gICAgICBpZiBAZWRpdG9yLmlzQnVmZmVyUm93Qmxhbmsocm93KVxuICAgICAgICByZXR1cm4gbmV3IFBvaW50KHJvdywgMCkgaWYgd2FzQXROb25CbGFua1Jvd1xuICAgICAgZWxzZVxuICAgICAgICB3YXNBdE5vbkJsYW5rUm93ID0gdHJ1ZVxuXG4gICAgIyBmYWxsYmFja1xuICAgIHN3aXRjaCBAZGlyZWN0aW9uXG4gICAgICB3aGVuICdwcmV2aW91cycgdGhlbiBuZXcgUG9pbnQoMCwgMClcbiAgICAgIHdoZW4gJ25leHQnIHRoZW4gQGdldFZpbUVvZkJ1ZmZlclBvc2l0aW9uKClcblxuY2xhc3MgTW92ZVRvUHJldmlvdXNQYXJhZ3JhcGggZXh0ZW5kcyBNb3ZlVG9OZXh0UGFyYWdyYXBoXG4gIEBleHRlbmQoKVxuICBkaXJlY3Rpb246ICdwcmV2aW91cydcblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBNb3ZlVG9CZWdpbm5pbmdPZkxpbmUgZXh0ZW5kcyBNb3Rpb25cbiAgQGV4dGVuZCgpXG5cbiAgbW92ZUN1cnNvcjogKGN1cnNvcikgLT5cbiAgICBzZXRCdWZmZXJDb2x1bW4oY3Vyc29yLCAwKVxuXG5jbGFzcyBNb3ZlVG9Db2x1bW4gZXh0ZW5kcyBNb3Rpb25cbiAgQGV4dGVuZCgpXG5cbiAgbW92ZUN1cnNvcjogKGN1cnNvcikgLT5cbiAgICBzZXRCdWZmZXJDb2x1bW4oY3Vyc29yLCBAZ2V0Q291bnQoLTEpKVxuXG5jbGFzcyBNb3ZlVG9MYXN0Q2hhcmFjdGVyT2ZMaW5lIGV4dGVuZHMgTW90aW9uXG4gIEBleHRlbmQoKVxuXG4gIG1vdmVDdXJzb3I6IChjdXJzb3IpIC0+XG4gICAgcm93ID0gZ2V0VmFsaWRWaW1CdWZmZXJSb3coQGVkaXRvciwgY3Vyc29yLmdldEJ1ZmZlclJvdygpICsgQGdldENvdW50KC0xKSlcbiAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24oW3JvdywgSW5maW5pdHldKVxuICAgIGN1cnNvci5nb2FsQ29sdW1uID0gSW5maW5pdHlcblxuY2xhc3MgTW92ZVRvTGFzdE5vbmJsYW5rQ2hhcmFjdGVyT2ZMaW5lQW5kRG93biBleHRlbmRzIE1vdGlvblxuICBAZXh0ZW5kKClcbiAgaW5jbHVzaXZlOiB0cnVlXG5cbiAgbW92ZUN1cnNvcjogKGN1cnNvcikgLT5cbiAgICBwb2ludCA9IEBnZXRQb2ludChjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKSlcbiAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24ocG9pbnQpXG5cbiAgZ2V0UG9pbnQ6ICh7cm93fSkgLT5cbiAgICByb3cgPSBsaW1pdE51bWJlcihyb3cgKyBAZ2V0Q291bnQoLTEpLCBtYXg6IEBnZXRWaW1MYXN0QnVmZmVyUm93KCkpXG4gICAgcmFuZ2UgPSBmaW5kUmFuZ2VJbkJ1ZmZlclJvdyhAZWRpdG9yLCAvXFxTfF4vLCByb3csIGRpcmVjdGlvbjogJ2JhY2t3YXJkJylcbiAgICByYW5nZT8uc3RhcnQgPyBuZXcgUG9pbnQocm93LCAwKVxuXG4jIE1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lIGZhaW1pbHlcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBNb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZSBleHRlbmRzIE1vdGlvblxuICBAZXh0ZW5kKClcbiAgbW92ZUN1cnNvcjogKGN1cnNvcikgLT5cbiAgICBwb2ludCA9IEBnZXRGaXJzdENoYXJhY3RlclBvc2l0aW9uRm9yQnVmZmVyUm93KGN1cnNvci5nZXRCdWZmZXJSb3coKSlcbiAgICBAc2V0QnVmZmVyUG9zaXRpb25TYWZlbHkoY3Vyc29yLCBwb2ludClcblxuY2xhc3MgTW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmVVcCBleHRlbmRzIE1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lXG4gIEBleHRlbmQoKVxuICB3aXNlOiAnbGluZXdpc2UnXG4gIG1vdmVDdXJzb3I6IChjdXJzb3IpIC0+XG4gICAgQG1vdmVDdXJzb3JDb3VudFRpbWVzIGN1cnNvciwgLT5cbiAgICAgIG1vdmVDdXJzb3JVcEJ1ZmZlcihjdXJzb3IpXG4gICAgc3VwZXJcblxuY2xhc3MgTW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmVEb3duIGV4dGVuZHMgTW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmVcbiAgQGV4dGVuZCgpXG4gIHdpc2U6ICdsaW5ld2lzZSdcbiAgbW92ZUN1cnNvcjogKGN1cnNvcikgLT5cbiAgICBAbW92ZUN1cnNvckNvdW50VGltZXMgY3Vyc29yLCAtPlxuICAgICAgbW92ZUN1cnNvckRvd25CdWZmZXIoY3Vyc29yKVxuICAgIHN1cGVyXG5cbmNsYXNzIE1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lQW5kRG93biBleHRlbmRzIE1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lRG93blxuICBAZXh0ZW5kKClcbiAgZGVmYXVsdENvdW50OiAwXG4gIGdldENvdW50OiAtPiBzdXBlciAtIDFcblxuIyBrZXltYXA6IGcgZ1xuY2xhc3MgTW92ZVRvRmlyc3RMaW5lIGV4dGVuZHMgTW90aW9uXG4gIEBleHRlbmQoKVxuICB3aXNlOiAnbGluZXdpc2UnXG4gIGp1bXA6IHRydWVcbiAgdmVydGljYWxNb3Rpb246IHRydWVcblxuICBtb3ZlQ3Vyc29yOiAoY3Vyc29yKSAtPlxuICAgIEBzZXRDdXJzb3JCdWZmZVJvdyhjdXJzb3IsIGdldFZhbGlkVmltQnVmZmVyUm93KEBlZGl0b3IsIEBnZXRSb3coKSkpXG4gICAgY3Vyc29yLmF1dG9zY3JvbGwoY2VudGVyOiB0cnVlKVxuXG4gIGdldFJvdzogLT5cbiAgICBAZ2V0Q291bnQoLTEpXG5cbiMga2V5bWFwOiBHXG5jbGFzcyBNb3ZlVG9MYXN0TGluZSBleHRlbmRzIE1vdmVUb0ZpcnN0TGluZVxuICBAZXh0ZW5kKClcbiAgZGVmYXVsdENvdW50OiBJbmZpbml0eVxuXG4jIGtleW1hcDogTiUgZS5nLiAxMCVcbmNsYXNzIE1vdmVUb0xpbmVCeVBlcmNlbnQgZXh0ZW5kcyBNb3ZlVG9GaXJzdExpbmVcbiAgQGV4dGVuZCgpXG5cbiAgZ2V0Um93OiAtPlxuICAgIHBlcmNlbnQgPSBsaW1pdE51bWJlcihAZ2V0Q291bnQoKSwgbWF4OiAxMDApXG4gICAgTWF0aC5mbG9vcigoQGVkaXRvci5nZXRMaW5lQ291bnQoKSAtIDEpICogKHBlcmNlbnQgLyAxMDApKVxuXG5jbGFzcyBNb3ZlVG9SZWxhdGl2ZUxpbmUgZXh0ZW5kcyBNb3Rpb25cbiAgQGV4dGVuZChmYWxzZSlcbiAgd2lzZTogJ2xpbmV3aXNlJ1xuXG4gIG1vdmVDdXJzb3I6IChjdXJzb3IpIC0+XG4gICAgc2V0QnVmZmVyUm93KGN1cnNvciwgY3Vyc29yLmdldEJ1ZmZlclJvdygpICsgQGdldENvdW50KC0xKSlcblxuY2xhc3MgTW92ZVRvUmVsYXRpdmVMaW5lTWluaW11bU9uZSBleHRlbmRzIE1vdmVUb1JlbGF0aXZlTGluZVxuICBAZXh0ZW5kKGZhbHNlKVxuXG4gIGdldENvdW50OiAtPlxuICAgIGxpbWl0TnVtYmVyKHN1cGVyLCBtaW46IDEpXG5cbiMgUG9zaXRpb24gY3Vyc29yIHdpdGhvdXQgc2Nyb2xsaW5nLiwgSCwgTSwgTFxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIGtleW1hcDogSFxuY2xhc3MgTW92ZVRvVG9wT2ZTY3JlZW4gZXh0ZW5kcyBNb3Rpb25cbiAgQGV4dGVuZCgpXG4gIHdpc2U6ICdsaW5ld2lzZSdcbiAganVtcDogdHJ1ZVxuICBzY3JvbGxvZmY6IDJcbiAgZGVmYXVsdENvdW50OiAwXG4gIHZlcnRpY2FsTW90aW9uOiB0cnVlXG5cbiAgbW92ZUN1cnNvcjogKGN1cnNvcikgLT5cbiAgICBidWZmZXJSb3cgPSBAZWRpdG9yLmJ1ZmZlclJvd0ZvclNjcmVlblJvdyhAZ2V0U2NyZWVuUm93KCkpXG4gICAgQHNldEN1cnNvckJ1ZmZlUm93KGN1cnNvciwgYnVmZmVyUm93KVxuXG4gIGdldFNjcm9sbG9mZjogLT5cbiAgICBpZiBAaXNBc1RhcmdldEV4Y2VwdFNlbGVjdCgpXG4gICAgICAwXG4gICAgZWxzZVxuICAgICAgQHNjcm9sbG9mZlxuXG4gIGdldFNjcmVlblJvdzogLT5cbiAgICBmaXJzdFJvdyA9IGdldEZpcnN0VmlzaWJsZVNjcmVlblJvdyhAZWRpdG9yKVxuICAgIG9mZnNldCA9IEBnZXRTY3JvbGxvZmYoKVxuICAgIG9mZnNldCA9IDAgaWYgZmlyc3RSb3cgaXMgMFxuICAgIG9mZnNldCA9IGxpbWl0TnVtYmVyKEBnZXRDb3VudCgtMSksIG1pbjogb2Zmc2V0KVxuICAgIGZpcnN0Um93ICsgb2Zmc2V0XG5cbiMga2V5bWFwOiBNXG5jbGFzcyBNb3ZlVG9NaWRkbGVPZlNjcmVlbiBleHRlbmRzIE1vdmVUb1RvcE9mU2NyZWVuXG4gIEBleHRlbmQoKVxuICBnZXRTY3JlZW5Sb3c6IC0+XG4gICAgc3RhcnRSb3cgPSBnZXRGaXJzdFZpc2libGVTY3JlZW5Sb3coQGVkaXRvcilcbiAgICBlbmRSb3cgPSBsaW1pdE51bWJlcihAZWRpdG9yLmdldExhc3RWaXNpYmxlU2NyZWVuUm93KCksIG1heDogQGdldFZpbUxhc3RTY3JlZW5Sb3coKSlcbiAgICBzdGFydFJvdyArIE1hdGguZmxvb3IoKGVuZFJvdyAtIHN0YXJ0Um93KSAvIDIpXG5cbiMga2V5bWFwOiBMXG5jbGFzcyBNb3ZlVG9Cb3R0b21PZlNjcmVlbiBleHRlbmRzIE1vdmVUb1RvcE9mU2NyZWVuXG4gIEBleHRlbmQoKVxuICBnZXRTY3JlZW5Sb3c6IC0+XG4gICAgIyBbRklYTUVdXG4gICAgIyBBdCBsZWFzdCBBdG9tIHYxLjYuMCwgdGhlcmUgYXJlIHR3byBpbXBsZW1lbnRhdGlvbiBvZiBnZXRMYXN0VmlzaWJsZVNjcmVlblJvdygpXG4gICAgIyBlZGl0b3IuZ2V0TGFzdFZpc2libGVTY3JlZW5Sb3coKSBhbmQgZWRpdG9yRWxlbWVudC5nZXRMYXN0VmlzaWJsZVNjcmVlblJvdygpXG4gICAgIyBUaG9zZSB0d28gbWV0aG9kcyByZXR1cm4gZGlmZmVyZW50IHZhbHVlLCBlZGl0b3IncyBvbmUgaXMgY29ycmVudC5cbiAgICAjIFNvIEkgaW50ZW50aW9uYWxseSB1c2UgZWRpdG9yLmdldExhc3RTY3JlZW5Sb3cgaGVyZS5cbiAgICB2aW1MYXN0U2NyZWVuUm93ID0gQGdldFZpbUxhc3RTY3JlZW5Sb3coKVxuICAgIHJvdyA9IGxpbWl0TnVtYmVyKEBlZGl0b3IuZ2V0TGFzdFZpc2libGVTY3JlZW5Sb3coKSwgbWF4OiB2aW1MYXN0U2NyZWVuUm93KVxuICAgIG9mZnNldCA9IEBnZXRTY3JvbGxvZmYoKSArIDFcbiAgICBvZmZzZXQgPSAwIGlmIHJvdyBpcyB2aW1MYXN0U2NyZWVuUm93XG4gICAgb2Zmc2V0ID0gbGltaXROdW1iZXIoQGdldENvdW50KC0xKSwgbWluOiBvZmZzZXQpXG4gICAgcm93IC0gb2Zmc2V0XG5cbiMgU2Nyb2xsaW5nXG4jIEhhbGY6IGN0cmwtZCwgY3RybC11XG4jIEZ1bGw6IGN0cmwtZiwgY3RybC1iXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgW0ZJWE1FXSBjb3VudCBiZWhhdmUgZGlmZmVyZW50bHkgZnJvbSBvcmlnaW5hbCBWaW0uXG5jbGFzcyBTY3JvbGwgZXh0ZW5kcyBNb3Rpb25cbiAgQGV4dGVuZChmYWxzZSlcbiAgdmVydGljYWxNb3Rpb246IHRydWVcblxuICBpc1Ntb290aFNjcm9sbEVuYWJsZWQ6IC0+XG4gICAgaWYgTWF0aC5hYnMoQGFtb3VudE9mUGFnZSkgaXMgMVxuICAgICAgQGdldENvbmZpZygnc21vb3RoU2Nyb2xsT25GdWxsU2Nyb2xsTW90aW9uJylcbiAgICBlbHNlXG4gICAgICBAZ2V0Q29uZmlnKCdzbW9vdGhTY3JvbGxPbkhhbGZTY3JvbGxNb3Rpb24nKVxuXG4gIGdldFNtb290aFNjcm9sbER1YXRpb246IC0+XG4gICAgaWYgTWF0aC5hYnMoQGFtb3VudE9mUGFnZSkgaXMgMVxuICAgICAgQGdldENvbmZpZygnc21vb3RoU2Nyb2xsT25GdWxsU2Nyb2xsTW90aW9uRHVyYXRpb24nKVxuICAgIGVsc2VcbiAgICAgIEBnZXRDb25maWcoJ3Ntb290aFNjcm9sbE9uSGFsZlNjcm9sbE1vdGlvbkR1cmF0aW9uJylcblxuICBnZXRQaXhlbFJlY3RUb3BGb3JTY2VlblJvdzogKHJvdykgLT5cbiAgICBwb2ludCA9IG5ldyBQb2ludChyb3csIDApXG4gICAgQGVkaXRvci5lbGVtZW50LnBpeGVsUmVjdEZvclNjcmVlblJhbmdlKG5ldyBSYW5nZShwb2ludCwgcG9pbnQpKS50b3BcblxuICBzbW9vdGhTY3JvbGw6IChmcm9tUm93LCB0b1Jvdywgb3B0aW9ucz17fSkgLT5cbiAgICB0b3BQaXhlbEZyb20gPSB7dG9wOiBAZ2V0UGl4ZWxSZWN0VG9wRm9yU2NlZW5Sb3coZnJvbVJvdyl9XG4gICAgdG9wUGl4ZWxUbyA9IHt0b3A6IEBnZXRQaXhlbFJlY3RUb3BGb3JTY2VlblJvdyh0b1Jvdyl9XG4gICAgb3B0aW9ucy5zdGVwID0gKG5ld1RvcCkgPT4gQGVkaXRvci5lbGVtZW50LnNldFNjcm9sbFRvcChuZXdUb3ApXG4gICAgb3B0aW9ucy5kdXJhdGlvbiA9IEBnZXRTbW9vdGhTY3JvbGxEdWF0aW9uKClcbiAgICBAdmltU3RhdGUucmVxdWVzdFNjcm9sbEFuaW1hdGlvbih0b3BQaXhlbEZyb20sIHRvcFBpeGVsVG8sIG9wdGlvbnMpXG5cbiAgZ2V0QW1vdW50T2ZSb3dzOiAtPlxuICAgIE1hdGguY2VpbChAYW1vdW50T2ZQYWdlICogQGVkaXRvci5nZXRSb3dzUGVyUGFnZSgpICogQGdldENvdW50KCkpXG5cbiAgZ2V0QnVmZmVyUm93OiAoY3Vyc29yKSAtPlxuICAgIHNjcmVlblJvdyA9IGdldFZhbGlkVmltU2NyZWVuUm93KEBlZGl0b3IsIGN1cnNvci5nZXRTY3JlZW5Sb3coKSArIEBnZXRBbW91bnRPZlJvd3MoKSlcbiAgICBAZWRpdG9yLmJ1ZmZlclJvd0ZvclNjcmVlblJvdyhzY3JlZW5Sb3cpXG5cbiAgbW92ZUN1cnNvcjogKGN1cnNvcikgLT5cbiAgICBidWZmZXJSb3cgPSBAZ2V0QnVmZmVyUm93KGN1cnNvcilcbiAgICBAc2V0Q3Vyc29yQnVmZmVSb3coY3Vyc29yLCBAZ2V0QnVmZmVyUm93KGN1cnNvciksIGF1dG9zY3JvbGw6IGZhbHNlKVxuXG4gICAgaWYgY3Vyc29yLmlzTGFzdEN1cnNvcigpXG4gICAgICBpZiBAaXNTbW9vdGhTY3JvbGxFbmFibGVkKClcbiAgICAgICAgQHZpbVN0YXRlLmZpbmlzaFNjcm9sbEFuaW1hdGlvbigpXG5cbiAgICAgIGZpcnN0VmlzaWJpbGVTY3JlZW5Sb3cgPSBAZWRpdG9yLmdldEZpcnN0VmlzaWJsZVNjcmVlblJvdygpXG4gICAgICBuZXdGaXJzdFZpc2liaWxlQnVmZmVyUm93ID0gQGVkaXRvci5idWZmZXJSb3dGb3JTY3JlZW5Sb3coZmlyc3RWaXNpYmlsZVNjcmVlblJvdyArIEBnZXRBbW91bnRPZlJvd3MoKSlcbiAgICAgIG5ld0ZpcnN0VmlzaWJpbGVTY3JlZW5Sb3cgPSBAZWRpdG9yLnNjcmVlblJvd0ZvckJ1ZmZlclJvdyhuZXdGaXJzdFZpc2liaWxlQnVmZmVyUm93KVxuICAgICAgZG9uZSA9ID0+XG4gICAgICAgIEBlZGl0b3Iuc2V0Rmlyc3RWaXNpYmxlU2NyZWVuUm93KG5ld0ZpcnN0VmlzaWJpbGVTY3JlZW5Sb3cpXG4gICAgICAgICMgW0ZJWE1FXSBzb21ldGltZXMsIHNjcm9sbFRvcCBpcyBub3QgdXBkYXRlZCwgY2FsbGluZyB0aGlzIGZpeC5cbiAgICAgICAgIyBJbnZlc3RpZ2F0ZSBhbmQgZmluZCBiZXR0ZXIgYXBwcm9hY2ggdGhlbiByZW1vdmUgdGhpcyB3b3JrYXJvdW5kLlxuICAgICAgICBAZWRpdG9yLmVsZW1lbnQuY29tcG9uZW50LnVwZGF0ZVN5bmMoKVxuXG4gICAgICBpZiBAaXNTbW9vdGhTY3JvbGxFbmFibGVkKClcbiAgICAgICAgQHNtb290aFNjcm9sbChmaXJzdFZpc2liaWxlU2NyZWVuUm93LCBuZXdGaXJzdFZpc2liaWxlU2NyZWVuUm93LCB7ZG9uZX0pXG4gICAgICBlbHNlXG4gICAgICAgIGRvbmUoKVxuXG5cbiMga2V5bWFwOiBjdHJsLWZcbmNsYXNzIFNjcm9sbEZ1bGxTY3JlZW5Eb3duIGV4dGVuZHMgU2Nyb2xsXG4gIEBleHRlbmQodHJ1ZSlcbiAgYW1vdW50T2ZQYWdlOiArMVxuXG4jIGtleW1hcDogY3RybC1iXG5jbGFzcyBTY3JvbGxGdWxsU2NyZWVuVXAgZXh0ZW5kcyBTY3JvbGxcbiAgQGV4dGVuZCgpXG4gIGFtb3VudE9mUGFnZTogLTFcblxuIyBrZXltYXA6IGN0cmwtZFxuY2xhc3MgU2Nyb2xsSGFsZlNjcmVlbkRvd24gZXh0ZW5kcyBTY3JvbGxcbiAgQGV4dGVuZCgpXG4gIGFtb3VudE9mUGFnZTogKzEgLyAyXG5cbiMga2V5bWFwOiBjdHJsLXVcbmNsYXNzIFNjcm9sbEhhbGZTY3JlZW5VcCBleHRlbmRzIFNjcm9sbFxuICBAZXh0ZW5kKClcbiAgYW1vdW50T2ZQYWdlOiAtMSAvIDJcblxuIyBGaW5kXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMga2V5bWFwOiBmXG5jbGFzcyBGaW5kIGV4dGVuZHMgTW90aW9uXG4gIEBleHRlbmQoKVxuICBiYWNrd2FyZHM6IGZhbHNlXG4gIGluY2x1c2l2ZTogdHJ1ZVxuICBvZmZzZXQ6IDBcbiAgcmVxdWlyZUlucHV0OiB0cnVlXG5cbiAgaW5pdGlhbGl6ZTogLT5cbiAgICBzdXBlclxuICAgIEBmb2N1c0lucHV0KCkgdW5sZXNzIEBpc0NvbXBsZXRlKClcblxuICBpc0JhY2t3YXJkczogLT5cbiAgICBAYmFja3dhcmRzXG5cbiAgZ2V0UG9pbnQ6IChmcm9tUG9pbnQpIC0+XG4gICAge3N0YXJ0LCBlbmR9ID0gQGVkaXRvci5idWZmZXJSYW5nZUZvckJ1ZmZlclJvdyhmcm9tUG9pbnQucm93KVxuXG4gICAgb2Zmc2V0ID0gaWYgQGlzQmFja3dhcmRzKCkgdGhlbiBAb2Zmc2V0IGVsc2UgLUBvZmZzZXRcbiAgICB1bk9mZnNldCA9IC1vZmZzZXQgKiBAaXNSZXBlYXRlZCgpXG4gICAgaWYgQGlzQmFja3dhcmRzKClcbiAgICAgIHNjYW5SYW5nZSA9IFtzdGFydCwgZnJvbVBvaW50LnRyYW5zbGF0ZShbMCwgdW5PZmZzZXRdKV1cbiAgICAgIG1ldGhvZCA9ICdiYWNrd2FyZHNTY2FuSW5CdWZmZXJSYW5nZSdcbiAgICBlbHNlXG4gICAgICBzY2FuUmFuZ2UgPSBbZnJvbVBvaW50LnRyYW5zbGF0ZShbMCwgMSArIHVuT2Zmc2V0XSksIGVuZF1cbiAgICAgIG1ldGhvZCA9ICdzY2FuSW5CdWZmZXJSYW5nZSdcblxuICAgIHBvaW50cyA9IFtdXG4gICAgQGVkaXRvclttZXRob2RdIC8vLyN7Xy5lc2NhcGVSZWdFeHAoQGlucHV0KX0vLy9nLCBzY2FuUmFuZ2UsICh7cmFuZ2V9KSAtPlxuICAgICAgcG9pbnRzLnB1c2gocmFuZ2Uuc3RhcnQpXG4gICAgcG9pbnRzW0BnZXRDb3VudCgtMSldPy50cmFuc2xhdGUoWzAsIG9mZnNldF0pXG5cbiAgbW92ZUN1cnNvcjogKGN1cnNvcikgLT5cbiAgICBwb2ludCA9IEBnZXRQb2ludChjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKSlcbiAgICBAc2V0QnVmZmVyUG9zaXRpb25TYWZlbHkoY3Vyc29yLCBwb2ludClcbiAgICBAZ2xvYmFsU3RhdGUuc2V0KCdjdXJyZW50RmluZCcsIHRoaXMpIHVubGVzcyBAaXNSZXBlYXRlZCgpXG5cbiMga2V5bWFwOiBGXG5jbGFzcyBGaW5kQmFja3dhcmRzIGV4dGVuZHMgRmluZFxuICBAZXh0ZW5kKClcbiAgaW5jbHVzaXZlOiBmYWxzZVxuICBiYWNrd2FyZHM6IHRydWVcblxuIyBrZXltYXA6IHRcbmNsYXNzIFRpbGwgZXh0ZW5kcyBGaW5kXG4gIEBleHRlbmQoKVxuICBvZmZzZXQ6IDFcblxuICBnZXRQb2ludDogLT5cbiAgICBAcG9pbnQgPSBzdXBlclxuXG4gIHNlbGVjdEJ5TW90aW9uOiAoc2VsZWN0aW9uKSAtPlxuICAgIHN1cGVyXG4gICAgaWYgc2VsZWN0aW9uLmlzRW1wdHkoKSBhbmQgKEBwb2ludD8gYW5kIG5vdCBAYmFja3dhcmRzKVxuICAgICAgc3dyYXAoc2VsZWN0aW9uKS50cmFuc2xhdGVTZWxlY3Rpb25FbmRBbmRDbGlwKCdmb3J3YXJkJylcblxuIyBrZXltYXA6IFRcbmNsYXNzIFRpbGxCYWNrd2FyZHMgZXh0ZW5kcyBUaWxsXG4gIEBleHRlbmQoKVxuICBpbmNsdXNpdmU6IGZhbHNlXG4gIGJhY2t3YXJkczogdHJ1ZVxuXG4jIE1hcmtcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBrZXltYXA6IGBcbmNsYXNzIE1vdmVUb01hcmsgZXh0ZW5kcyBNb3Rpb25cbiAgQGV4dGVuZCgpXG4gIGp1bXA6IHRydWVcbiAgcmVxdWlyZUlucHV0OiB0cnVlXG4gIGlucHV0OiBudWxsICMgc2V0IHdoZW4gaW5zdGF0bnRpYXRlZCB2aWEgdmltU3RhdGU6Om1vdmVUb01hcmsoKVxuXG4gIGluaXRpYWxpemU6IC0+XG4gICAgc3VwZXJcbiAgICBAZm9jdXNJbnB1dCgpIHVubGVzcyBAaXNDb21wbGV0ZSgpXG5cbiAgZ2V0UG9pbnQ6IC0+XG4gICAgQHZpbVN0YXRlLm1hcmsuZ2V0KEBnZXRJbnB1dCgpKVxuXG4gIG1vdmVDdXJzb3I6IChjdXJzb3IpIC0+XG4gICAgaWYgcG9pbnQgPSBAZ2V0UG9pbnQoKVxuICAgICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHBvaW50KVxuICAgICAgY3Vyc29yLmF1dG9zY3JvbGwoY2VudGVyOiB0cnVlKVxuXG4jIGtleW1hcDogJ1xuY2xhc3MgTW92ZVRvTWFya0xpbmUgZXh0ZW5kcyBNb3ZlVG9NYXJrXG4gIEBleHRlbmQoKVxuICB3aXNlOiAnbGluZXdpc2UnXG5cbiAgZ2V0UG9pbnQ6IC0+XG4gICAgaWYgcG9pbnQgPSBzdXBlclxuICAgICAgQGdldEZpcnN0Q2hhcmFjdGVyUG9zaXRpb25Gb3JCdWZmZXJSb3cocG9pbnQucm93KVxuXG4jIEZvbGRcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgTW92ZVRvUHJldmlvdXNGb2xkU3RhcnQgZXh0ZW5kcyBNb3Rpb25cbiAgQGV4dGVuZCgpXG4gIEBkZXNjcmlwdGlvbjogXCJNb3ZlIHRvIHByZXZpb3VzIGZvbGQgc3RhcnRcIlxuICB3aXNlOiAnY2hhcmFjdGVyd2lzZSdcbiAgd2hpY2g6ICdzdGFydCdcbiAgZGlyZWN0aW9uOiAncHJldidcblxuICBpbml0aWFsaXplOiAtPlxuICAgIHN1cGVyXG4gICAgQHJvd3MgPSBAZ2V0Rm9sZFJvd3MoQHdoaWNoKVxuICAgIEByb3dzLnJldmVyc2UoKSBpZiBAZGlyZWN0aW9uIGlzICdwcmV2J1xuXG4gIGdldEZvbGRSb3dzOiAod2hpY2gpIC0+XG4gICAgaW5kZXggPSBpZiB3aGljaCBpcyAnc3RhcnQnIHRoZW4gMCBlbHNlIDFcbiAgICByb3dzID0gZ2V0Q29kZUZvbGRSb3dSYW5nZXMoQGVkaXRvcikubWFwIChyb3dSYW5nZSkgLT5cbiAgICAgIHJvd1JhbmdlW2luZGV4XVxuICAgIF8uc29ydEJ5KF8udW5pcShyb3dzKSwgKHJvdykgLT4gcm93KVxuXG4gIGdldFNjYW5Sb3dzOiAoY3Vyc29yKSAtPlxuICAgIGN1cnNvclJvdyA9IGN1cnNvci5nZXRCdWZmZXJSb3coKVxuICAgIGlzVmFsaWRSb3cgPSBzd2l0Y2ggQGRpcmVjdGlvblxuICAgICAgd2hlbiAncHJldicgdGhlbiAocm93KSAtPiByb3cgPCBjdXJzb3JSb3dcbiAgICAgIHdoZW4gJ25leHQnIHRoZW4gKHJvdykgLT4gcm93ID4gY3Vyc29yUm93XG4gICAgQHJvd3MuZmlsdGVyKGlzVmFsaWRSb3cpXG5cbiAgZGV0ZWN0Um93OiAoY3Vyc29yKSAtPlxuICAgIEBnZXRTY2FuUm93cyhjdXJzb3IpWzBdXG5cbiAgbW92ZUN1cnNvcjogKGN1cnNvcikgLT5cbiAgICBAbW92ZUN1cnNvckNvdW50VGltZXMgY3Vyc29yLCA9PlxuICAgICAgaWYgKHJvdyA9IEBkZXRlY3RSb3coY3Vyc29yKSk/XG4gICAgICAgIG1vdmVDdXJzb3JUb0ZpcnN0Q2hhcmFjdGVyQXRSb3coY3Vyc29yLCByb3cpXG5cbmNsYXNzIE1vdmVUb05leHRGb2xkU3RhcnQgZXh0ZW5kcyBNb3ZlVG9QcmV2aW91c0ZvbGRTdGFydFxuICBAZXh0ZW5kKClcbiAgQGRlc2NyaXB0aW9uOiBcIk1vdmUgdG8gbmV4dCBmb2xkIHN0YXJ0XCJcbiAgZGlyZWN0aW9uOiAnbmV4dCdcblxuY2xhc3MgTW92ZVRvUHJldmlvdXNGb2xkU3RhcnRXaXRoU2FtZUluZGVudCBleHRlbmRzIE1vdmVUb1ByZXZpb3VzRm9sZFN0YXJ0XG4gIEBleHRlbmQoKVxuICBAZGVzY3JpcHRpb246IFwiTW92ZSB0byBwcmV2aW91cyBzYW1lLWluZGVudGVkIGZvbGQgc3RhcnRcIlxuICBkZXRlY3RSb3c6IChjdXJzb3IpIC0+XG4gICAgYmFzZUluZGVudExldmVsID0gZ2V0SW5kZW50TGV2ZWxGb3JCdWZmZXJSb3coQGVkaXRvciwgY3Vyc29yLmdldEJ1ZmZlclJvdygpKVxuICAgIGZvciByb3cgaW4gQGdldFNjYW5Sb3dzKGN1cnNvcilcbiAgICAgIGlmIGdldEluZGVudExldmVsRm9yQnVmZmVyUm93KEBlZGl0b3IsIHJvdykgaXMgYmFzZUluZGVudExldmVsXG4gICAgICAgIHJldHVybiByb3dcbiAgICBudWxsXG5cbmNsYXNzIE1vdmVUb05leHRGb2xkU3RhcnRXaXRoU2FtZUluZGVudCBleHRlbmRzIE1vdmVUb1ByZXZpb3VzRm9sZFN0YXJ0V2l0aFNhbWVJbmRlbnRcbiAgQGV4dGVuZCgpXG4gIEBkZXNjcmlwdGlvbjogXCJNb3ZlIHRvIG5leHQgc2FtZS1pbmRlbnRlZCBmb2xkIHN0YXJ0XCJcbiAgZGlyZWN0aW9uOiAnbmV4dCdcblxuY2xhc3MgTW92ZVRvUHJldmlvdXNGb2xkRW5kIGV4dGVuZHMgTW92ZVRvUHJldmlvdXNGb2xkU3RhcnRcbiAgQGV4dGVuZCgpXG4gIEBkZXNjcmlwdGlvbjogXCJNb3ZlIHRvIHByZXZpb3VzIGZvbGQgZW5kXCJcbiAgd2hpY2g6ICdlbmQnXG5cbmNsYXNzIE1vdmVUb05leHRGb2xkRW5kIGV4dGVuZHMgTW92ZVRvUHJldmlvdXNGb2xkRW5kXG4gIEBleHRlbmQoKVxuICBAZGVzY3JpcHRpb246IFwiTW92ZSB0byBuZXh0IGZvbGQgZW5kXCJcbiAgZGlyZWN0aW9uOiAnbmV4dCdcblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBNb3ZlVG9QcmV2aW91c0Z1bmN0aW9uIGV4dGVuZHMgTW92ZVRvUHJldmlvdXNGb2xkU3RhcnRcbiAgQGV4dGVuZCgpXG4gIEBkZXNjcmlwdGlvbjogXCJNb3ZlIHRvIHByZXZpb3VzIGZ1bmN0aW9uXCJcbiAgZGlyZWN0aW9uOiAncHJldidcbiAgZGV0ZWN0Um93OiAoY3Vyc29yKSAtPlxuICAgIF8uZGV0ZWN0IEBnZXRTY2FuUm93cyhjdXJzb3IpLCAocm93KSA9PlxuICAgICAgaXNJbmNsdWRlRnVuY3Rpb25TY29wZUZvclJvdyhAZWRpdG9yLCByb3cpXG5cbmNsYXNzIE1vdmVUb05leHRGdW5jdGlvbiBleHRlbmRzIE1vdmVUb1ByZXZpb3VzRnVuY3Rpb25cbiAgQGV4dGVuZCgpXG4gIEBkZXNjcmlwdGlvbjogXCJNb3ZlIHRvIG5leHQgZnVuY3Rpb25cIlxuICBkaXJlY3Rpb246ICduZXh0J1xuXG4jIFNjb3BlIGJhc2VkXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIE1vdmVUb1Bvc2l0aW9uQnlTY29wZSBleHRlbmRzIE1vdGlvblxuICBAZXh0ZW5kKGZhbHNlKVxuICBkaXJlY3Rpb246ICdiYWNrd2FyZCdcbiAgc2NvcGU6ICcuJ1xuXG4gIGdldFBvaW50OiAoZnJvbVBvaW50KSAtPlxuICAgIGRldGVjdFNjb3BlU3RhcnRQb3NpdGlvbkZvclNjb3BlKEBlZGl0b3IsIGZyb21Qb2ludCwgQGRpcmVjdGlvbiwgQHNjb3BlKVxuXG4gIG1vdmVDdXJzb3I6IChjdXJzb3IpIC0+XG4gICAgQG1vdmVDdXJzb3JDb3VudFRpbWVzIGN1cnNvciwgPT5cbiAgICAgIEBzZXRCdWZmZXJQb3NpdGlvblNhZmVseShjdXJzb3IsIEBnZXRQb2ludChjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKSkpXG5cbmNsYXNzIE1vdmVUb1ByZXZpb3VzU3RyaW5nIGV4dGVuZHMgTW92ZVRvUG9zaXRpb25CeVNjb3BlXG4gIEBleHRlbmQoKVxuICBAZGVzY3JpcHRpb246IFwiTW92ZSB0byBwcmV2aW91cyBzdHJpbmcoc2VhcmNoZWQgYnkgYHN0cmluZy5iZWdpbmAgc2NvcGUpXCJcbiAgZGlyZWN0aW9uOiAnYmFja3dhcmQnXG4gIHNjb3BlOiAnc3RyaW5nLmJlZ2luJ1xuXG5jbGFzcyBNb3ZlVG9OZXh0U3RyaW5nIGV4dGVuZHMgTW92ZVRvUHJldmlvdXNTdHJpbmdcbiAgQGV4dGVuZCgpXG4gIEBkZXNjcmlwdGlvbjogXCJNb3ZlIHRvIG5leHQgc3RyaW5nKHNlYXJjaGVkIGJ5IGBzdHJpbmcuYmVnaW5gIHNjb3BlKVwiXG4gIGRpcmVjdGlvbjogJ2ZvcndhcmQnXG5cbmNsYXNzIE1vdmVUb1ByZXZpb3VzTnVtYmVyIGV4dGVuZHMgTW92ZVRvUG9zaXRpb25CeVNjb3BlXG4gIEBleHRlbmQoKVxuICBkaXJlY3Rpb246ICdiYWNrd2FyZCdcbiAgQGRlc2NyaXB0aW9uOiBcIk1vdmUgdG8gcHJldmlvdXMgbnVtYmVyKHNlYXJjaGVkIGJ5IGBjb25zdGFudC5udW1lcmljYCBzY29wZSlcIlxuICBzY29wZTogJ2NvbnN0YW50Lm51bWVyaWMnXG5cbmNsYXNzIE1vdmVUb05leHROdW1iZXIgZXh0ZW5kcyBNb3ZlVG9QcmV2aW91c051bWJlclxuICBAZXh0ZW5kKClcbiAgQGRlc2NyaXB0aW9uOiBcIk1vdmUgdG8gbmV4dCBudW1iZXIoc2VhcmNoZWQgYnkgYGNvbnN0YW50Lm51bWVyaWNgIHNjb3BlKVwiXG4gIGRpcmVjdGlvbjogJ2ZvcndhcmQnXG5cbmNsYXNzIE1vdmVUb05leHRPY2N1cnJlbmNlIGV4dGVuZHMgTW90aW9uXG4gIEBleHRlbmQoKVxuICAjIEVuc3VyZSB0aGlzIGNvbW1hbmQgaXMgYXZhaWxhYmxlIHdoZW4gaGFzLW9jY3VycmVuY2VcbiAgQGNvbW1hbmRTY29wZTogJ2F0b20tdGV4dC1lZGl0b3IudmltLW1vZGUtcGx1cy5oYXMtb2NjdXJyZW5jZSdcbiAganVtcDogdHJ1ZVxuICBkaXJlY3Rpb246ICduZXh0J1xuXG4gIGdldFJhbmdlczogLT5cbiAgICBAdmltU3RhdGUub2NjdXJyZW5jZU1hbmFnZXIuZ2V0TWFya2VycygpLm1hcCAobWFya2VyKSAtPlxuICAgICAgbWFya2VyLmdldEJ1ZmZlclJhbmdlKClcblxuICBleGVjdXRlOiAtPlxuICAgIEByYW5nZXMgPSBAZ2V0UmFuZ2VzKClcbiAgICBzdXBlclxuXG4gIG1vdmVDdXJzb3I6IChjdXJzb3IpIC0+XG4gICAgaW5kZXggPSBAZ2V0SW5kZXgoY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKCkpXG4gICAgaWYgaW5kZXg/XG4gICAgICBvZmZzZXQgPSBzd2l0Y2ggQGRpcmVjdGlvblxuICAgICAgICB3aGVuICduZXh0JyB0aGVuIEBnZXRDb3VudCgtMSlcbiAgICAgICAgd2hlbiAncHJldmlvdXMnIHRoZW4gLUBnZXRDb3VudCgtMSlcbiAgICAgIHJhbmdlID0gQHJhbmdlc1tnZXRJbmRleChpbmRleCArIG9mZnNldCwgQHJhbmdlcyldXG4gICAgICBwb2ludCA9IHJhbmdlLnN0YXJ0XG5cbiAgICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihwb2ludCwgYXV0b3Njcm9sbDogZmFsc2UpXG5cbiAgICAgIGlmIGN1cnNvci5pc0xhc3RDdXJzb3IoKVxuICAgICAgICBAZWRpdG9yLnVuZm9sZEJ1ZmZlclJvdyhwb2ludC5yb3cpXG4gICAgICAgIHNtYXJ0U2Nyb2xsVG9CdWZmZXJQb3NpdGlvbihAZWRpdG9yLCBwb2ludClcblxuICAgICAgaWYgQGdldENvbmZpZygnZmxhc2hPbk1vdmVUb09jY3VycmVuY2UnKVxuICAgICAgICBAdmltU3RhdGUuZmxhc2gocmFuZ2UsIHR5cGU6ICdzZWFyY2gnKVxuXG4gIGdldEluZGV4OiAoZnJvbVBvaW50KSAtPlxuICAgIGZvciByYW5nZSwgaSBpbiBAcmFuZ2VzIHdoZW4gcmFuZ2Uuc3RhcnQuaXNHcmVhdGVyVGhhbihmcm9tUG9pbnQpXG4gICAgICByZXR1cm4gaVxuICAgIDBcblxuY2xhc3MgTW92ZVRvUHJldmlvdXNPY2N1cnJlbmNlIGV4dGVuZHMgTW92ZVRvTmV4dE9jY3VycmVuY2VcbiAgQGV4dGVuZCgpXG4gIGRpcmVjdGlvbjogJ3ByZXZpb3VzJ1xuXG4gIGdldEluZGV4OiAoZnJvbVBvaW50KSAtPlxuICAgIGZvciByYW5nZSwgaSBpbiBAcmFuZ2VzIGJ5IC0xIHdoZW4gcmFuZ2UuZW5kLmlzTGVzc1RoYW4oZnJvbVBvaW50KVxuICAgICAgcmV0dXJuIGlcbiAgICBAcmFuZ2VzLmxlbmd0aCAtIDFcblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIGtleW1hcDogJVxuY2xhc3MgTW92ZVRvUGFpciBleHRlbmRzIE1vdGlvblxuICBAZXh0ZW5kKClcbiAgaW5jbHVzaXZlOiB0cnVlXG4gIGp1bXA6IHRydWVcbiAgbWVtYmVyOiBbJ1BhcmVudGhlc2lzJywgJ0N1cmx5QnJhY2tldCcsICdTcXVhcmVCcmFja2V0JywgJ0FuZ2xlQnJhY2tldCddXG5cbiAgbW92ZUN1cnNvcjogKGN1cnNvcikgLT5cbiAgICBAc2V0QnVmZmVyUG9zaXRpb25TYWZlbHkoY3Vyc29yLCBAZ2V0UG9pbnQoY3Vyc29yKSlcblxuICBnZXRQb2ludDogKGN1cnNvcikgLT5cbiAgICBjdXJzb3JQb3NpdGlvbiA9IGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXG4gICAgY3Vyc29yUm93ID0gY3Vyc29yUG9zaXRpb24ucm93XG5cbiAgICBnZXRQb2ludEZvclRhZyA9ID0+XG4gICAgICBwID0gY3Vyc29yUG9zaXRpb25cbiAgICAgIHBhaXJJbmZvID0gQG5ldyhcIkFUYWdcIikuZ2V0UGFpckluZm8ocClcbiAgICAgIHJldHVybiBudWxsIHVubGVzcyBwYWlySW5mbz9cbiAgICAgIHtvcGVuUmFuZ2UsIGNsb3NlUmFuZ2V9ID0gcGFpckluZm9cbiAgICAgIG9wZW5SYW5nZSA9IG9wZW5SYW5nZS50cmFuc2xhdGUoWzAsICsxXSwgWzAsIC0xXSlcbiAgICAgIGNsb3NlUmFuZ2UgPSBjbG9zZVJhbmdlLnRyYW5zbGF0ZShbMCwgKzFdLCBbMCwgLTFdKVxuICAgICAgcmV0dXJuIGNsb3NlUmFuZ2Uuc3RhcnQgaWYgb3BlblJhbmdlLmNvbnRhaW5zUG9pbnQocCkgYW5kIChub3QgcC5pc0VxdWFsKG9wZW5SYW5nZS5lbmQpKVxuICAgICAgcmV0dXJuIG9wZW5SYW5nZS5zdGFydCBpZiBjbG9zZVJhbmdlLmNvbnRhaW5zUG9pbnQocCkgYW5kIChub3QgcC5pc0VxdWFsKGNsb3NlUmFuZ2UuZW5kKSlcblxuICAgIHBvaW50ID0gZ2V0UG9pbnRGb3JUYWcoKVxuICAgIHJldHVybiBwb2ludCBpZiBwb2ludD9cblxuICAgIHJhbmdlcyA9IEBuZXcoXCJBQW55UGFpclwiLCB7YWxsb3dGb3J3YXJkaW5nOiB0cnVlLCBAbWVtYmVyfSkuZ2V0UmFuZ2VzKGN1cnNvci5zZWxlY3Rpb24pXG4gICAgcmFuZ2VzID0gcmFuZ2VzLmZpbHRlciAoe3N0YXJ0LCBlbmR9KSAtPlxuICAgICAgcCA9IGN1cnNvclBvc2l0aW9uXG4gICAgICAocC5yb3cgaXMgc3RhcnQucm93KSBhbmQgc3RhcnQuaXNHcmVhdGVyVGhhbk9yRXF1YWwocCkgb3JcbiAgICAgICAgKHAucm93IGlzIGVuZC5yb3cpIGFuZCBlbmQuaXNHcmVhdGVyVGhhbk9yRXF1YWwocClcblxuICAgIHJldHVybiBudWxsIHVubGVzcyByYW5nZXMubGVuZ3RoXG4gICAgIyBDYWxsaW5nIGNvbnRhaW5zUG9pbnQgZXhjbHVzaXZlKHBhc3MgdHJ1ZSBhcyAybmQgYXJnKSBtYWtlIG9wZW5pbmcgcGFpciB1bmRlclxuICAgICMgY3Vyc29yIGlzIGdyb3VwZWQgdG8gZm9yd2FyZGluZ1Jhbmdlc1xuICAgIFtlbmNsb3NpbmdSYW5nZXMsIGZvcndhcmRpbmdSYW5nZXNdID0gXy5wYXJ0aXRpb24gcmFuZ2VzLCAocmFuZ2UpIC0+XG4gICAgICByYW5nZS5jb250YWluc1BvaW50KGN1cnNvclBvc2l0aW9uLCB0cnVlKVxuICAgIGVuY2xvc2luZ1JhbmdlID0gXy5sYXN0KHNvcnRSYW5nZXMoZW5jbG9zaW5nUmFuZ2VzKSlcbiAgICBmb3J3YXJkaW5nUmFuZ2VzID0gc29ydFJhbmdlcyhmb3J3YXJkaW5nUmFuZ2VzKVxuXG4gICAgaWYgZW5jbG9zaW5nUmFuZ2VcbiAgICAgIGZvcndhcmRpbmdSYW5nZXMgPSBmb3J3YXJkaW5nUmFuZ2VzLmZpbHRlciAocmFuZ2UpIC0+XG4gICAgICAgIGVuY2xvc2luZ1JhbmdlLmNvbnRhaW5zUmFuZ2UocmFuZ2UpXG5cbiAgICBmb3J3YXJkaW5nUmFuZ2VzWzBdPy5lbmQudHJhbnNsYXRlKFswLCAtMV0pIG9yIGVuY2xvc2luZ1JhbmdlPy5zdGFydFxuIl19
