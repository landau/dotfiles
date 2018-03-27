(function() {
  var Base, CurrentSelection, Find, FindBackwards, Motion, MoveDown, MoveDownScreen, MoveDownToEdge, MoveLeft, MoveRight, MoveRightBufferColumn, MoveToBeginningOfLine, MoveToBottomOfScreen, MoveToColumn, MoveToEndOfAlphanumericWord, MoveToEndOfSmartWord, MoveToEndOfSubword, MoveToEndOfWholeWord, MoveToEndOfWord, MoveToFirstCharacterOfLine, MoveToFirstCharacterOfLineAndDown, MoveToFirstCharacterOfLineDown, MoveToFirstCharacterOfLineUp, MoveToFirstLine, MoveToLastCharacterOfLine, MoveToLastLine, MoveToLastNonblankCharacterOfLineAndDown, MoveToLineByPercent, MoveToMark, MoveToMarkLine, MoveToMiddleOfScreen, MoveToNextAlphanumericWord, MoveToNextFoldEnd, MoveToNextFoldStart, MoveToNextFoldStartWithSameIndent, MoveToNextFunction, MoveToNextNumber, MoveToNextOccurrence, MoveToNextParagraph, MoveToNextSentence, MoveToNextSentenceSkipBlankRow, MoveToNextSmartWord, MoveToNextString, MoveToNextSubword, MoveToNextWholeWord, MoveToNextWord, MoveToPair, MoveToPositionByScope, MoveToPreviousAlphanumericWord, MoveToPreviousEndOfWholeWord, MoveToPreviousEndOfWord, MoveToPreviousFoldEnd, MoveToPreviousFoldStart, MoveToPreviousFoldStartWithSameIndent, MoveToPreviousFunction, MoveToPreviousNumber, MoveToPreviousOccurrence, MoveToPreviousParagraph, MoveToPreviousSentence, MoveToPreviousSentenceSkipBlankRow, MoveToPreviousSmartWord, MoveToPreviousString, MoveToPreviousSubword, MoveToPreviousWholeWord, MoveToPreviousWord, MoveToRelativeLine, MoveToRelativeLineMinimumOne, MoveToTopOfScreen, MoveUp, MoveUpScreen, MoveUpToEdge, Point, Range, Scroll, ScrollFullScreenDown, ScrollFullScreenUp, ScrollHalfScreenDown, ScrollHalfScreenUp, Till, TillBackwards, _, cursorIsAtEndOfLineAtNonEmptyRow, cursorIsAtVimEndOfFile, detectScopeStartPositionForScope, findRangeInBufferRow, getBufferRows, getCodeFoldRowRanges, getEndOfLineForBufferRow, getFirstVisibleScreenRow, getIndentLevelForBufferRow, getIndex, getKeystrokeForEvent, getLargestFoldRangeContainsBufferRow, getLastVisibleScreenRow, getTextInScreenRange, getValidVimBufferRow, getValidVimScreenRow, isEmptyRow, isIncludeFunctionScopeForRow, limitNumber, moveCursorDownBuffer, moveCursorDownScreen, moveCursorLeft, moveCursorRight, moveCursorToFirstCharacterAtRow, moveCursorToNextNonWhitespace, moveCursorUpBuffer, moveCursorUpScreen, pointIsAtEndOfLineAtNonEmptyRow, pointIsOnWhiteSpace, ref, ref1, setBufferColumn, setBufferRow, settings, smartScrollToBufferPosition, sortRanges, swrap,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  _ = require('underscore-plus');

  ref = require('atom'), Point = ref.Point, Range = ref.Range;

  ref1 = require('./utils'), moveCursorLeft = ref1.moveCursorLeft, moveCursorRight = ref1.moveCursorRight, moveCursorUpScreen = ref1.moveCursorUpScreen, moveCursorDownScreen = ref1.moveCursorDownScreen, moveCursorDownBuffer = ref1.moveCursorDownBuffer, moveCursorUpBuffer = ref1.moveCursorUpBuffer, cursorIsAtVimEndOfFile = ref1.cursorIsAtVimEndOfFile, getFirstVisibleScreenRow = ref1.getFirstVisibleScreenRow, getLastVisibleScreenRow = ref1.getLastVisibleScreenRow, getValidVimScreenRow = ref1.getValidVimScreenRow, getValidVimBufferRow = ref1.getValidVimBufferRow, moveCursorToFirstCharacterAtRow = ref1.moveCursorToFirstCharacterAtRow, sortRanges = ref1.sortRanges, getIndentLevelForBufferRow = ref1.getIndentLevelForBufferRow, pointIsOnWhiteSpace = ref1.pointIsOnWhiteSpace, moveCursorToNextNonWhitespace = ref1.moveCursorToNextNonWhitespace, isEmptyRow = ref1.isEmptyRow, getCodeFoldRowRanges = ref1.getCodeFoldRowRanges, getLargestFoldRangeContainsBufferRow = ref1.getLargestFoldRangeContainsBufferRow, isIncludeFunctionScopeForRow = ref1.isIncludeFunctionScopeForRow, detectScopeStartPositionForScope = ref1.detectScopeStartPositionForScope, getBufferRows = ref1.getBufferRows, getTextInScreenRange = ref1.getTextInScreenRange, cursorIsAtEndOfLineAtNonEmptyRow = ref1.cursorIsAtEndOfLineAtNonEmptyRow, setBufferRow = ref1.setBufferRow, setBufferColumn = ref1.setBufferColumn, limitNumber = ref1.limitNumber, getIndex = ref1.getIndex, smartScrollToBufferPosition = ref1.smartScrollToBufferPosition, getKeystrokeForEvent = ref1.getKeystrokeForEvent, pointIsAtEndOfLineAtNonEmptyRow = ref1.pointIsAtEndOfLineAtNonEmptyRow, getEndOfLineForBufferRow = ref1.getEndOfLineForBufferRow, findRangeInBufferRow = ref1.findRangeInBufferRow;

  swrap = require('./selection-wrapper');

  settings = require('./settings');

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
      if (this.hasOperator()) {
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
      if (this.hasOperator()) {
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
      if (this.isVerticalMotion() && settings.get('moveToFirstCharacterOnVerticalMotion')) {
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
      allowWrap = settings.get('wrapLeftRightMotion');
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
      if (this.isAsOperatorTarget() && !cursor.isAtEndOfLine()) {
        return false;
      } else {
        return settings.get('wrapLeftRightMotion');
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

    MoveUp.prototype.getBufferRow = function(row) {
      row = limitNumber(row - 1, {
        min: 0
      });
      if (this.editor.isFoldedAtBufferRow(row)) {
        return getLargestFoldRangeContainsBufferRow(this.editor, row).start.row;
      } else {
        return row;
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

  MoveDown = (function(superClass) {
    extend(MoveDown, superClass);

    function MoveDown() {
      return MoveDown.__super__.constructor.apply(this, arguments);
    }

    MoveDown.extend();

    MoveDown.prototype.wise = 'linewise';

    MoveDown.prototype.getBufferRow = function(row) {
      if (this.editor.isFoldedAtBufferRow(row)) {
        row = getLargestFoldRangeContainsBufferRow(this.editor, row).end.row;
      }
      return limitNumber(row + 1, {
        max: this.getVimLastBufferRow()
      });
    };

    return MoveDown;

  })(MoveUp);

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
      var isAsOperatorTarget, wasOnWhiteSpace;
      if (cursorIsAtVimEndOfFile(cursor)) {
        return;
      }
      wasOnWhiteSpace = pointIsOnWhiteSpace(this.editor, cursor.getBufferPosition());
      isAsOperatorTarget = this.isAsOperatorTarget();
      return this.moveCursorCountTimes(cursor, (function(_this) {
        return function(arg) {
          var cursorPosition, isFinal, pattern, point, ref2;
          isFinal = arg.isFinal;
          cursorPosition = cursor.getBufferPosition();
          if (isEmptyRow(_this.editor, cursorPosition.row) && isAsOperatorTarget) {
            point = cursorPosition.traverse([1, 0]);
          } else {
            pattern = (ref2 = _this.wordRegex) != null ? ref2 : cursor.wordRegExp();
            point = _this.getPoint(pattern, cursorPosition);
            if (isFinal && isAsOperatorTarget) {
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

    MoveToPreviousWholeWord.prototype.wordRegex = /^$|\S+/;

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
      if (this.isAsOperatorTarget()) {
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
        return settings.get('smoothScrollOnFullScrollMotion');
      } else {
        return settings.get('smoothScrollOnHalfScrollMotion');
      }
    };

    Scroll.prototype.getSmoothScrollDuation = function() {
      if (Math.abs(this.amountOfPage) === 1) {
        return settings.get('smoothScrollOnFullScrollMotionDuration');
      } else {
        return settings.get('smoothScrollOnHalfScrollMotionDuration');
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

    MoveToNextOccurrence.prototype.jump = true;

    MoveToNextOccurrence.prototype.direction = 'next';

    MoveToNextOccurrence.prototype.initialize = function() {
      if (this.vimState.occurrenceManager.hasMarkers()) {
        return MoveToNextOccurrence.__super__.initialize.apply(this, arguments);
      } else {
        if (settings.get('fallbackTabAndShiftTabInNormalMode')) {
          switch (getKeystrokeForEvent(this.vimState._event)) {
            case 'tab':
              atom.commands.dispatch(this.editorElement, 'editor:indent');
              break;
            case 'shift-tab':
              atom.commands.dispatch(this.editorElement, 'editor:outdent-selected-rows');
          }
        }
        return this.abort();
      }
    };

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
        if (settings.get('flashOnMoveToOccurrence')) {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvbW90aW9uLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsaTRFQUFBO0lBQUE7OztFQUFBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVI7O0VBQ0osTUFBaUIsT0FBQSxDQUFRLE1BQVIsQ0FBakIsRUFBQyxpQkFBRCxFQUFROztFQUVSLE9BOEJJLE9BQUEsQ0FBUSxTQUFSLENBOUJKLEVBQ0Usb0NBREYsRUFDa0Isc0NBRGxCLEVBRUUsNENBRkYsRUFFc0IsZ0RBRnRCLEVBR0UsZ0RBSEYsRUFJRSw0Q0FKRixFQUtFLG9EQUxGLEVBTUUsd0RBTkYsRUFNNEIsc0RBTjVCLEVBT0UsZ0RBUEYsRUFPd0IsZ0RBUHhCLEVBUUUsc0VBUkYsRUFTRSw0QkFURixFQVVFLDREQVZGLEVBV0UsOENBWEYsRUFZRSxrRUFaRixFQWFFLDRCQWJGLEVBY0UsZ0RBZEYsRUFlRSxnRkFmRixFQWdCRSxnRUFoQkYsRUFpQkUsd0VBakJGLEVBa0JFLGtDQWxCRixFQW1CRSxnREFuQkYsRUFvQkUsd0VBcEJGLEVBcUJFLGdDQXJCRixFQXNCRSxzQ0F0QkYsRUF1QkUsOEJBdkJGLEVBd0JFLHdCQXhCRixFQXlCRSw4REF6QkYsRUEwQkUsZ0RBMUJGLEVBMkJFLHNFQTNCRixFQTRCRSx3REE1QkYsRUE2QkU7O0VBR0YsS0FBQSxHQUFRLE9BQUEsQ0FBUSxxQkFBUjs7RUFDUixRQUFBLEdBQVcsT0FBQSxDQUFRLFlBQVI7O0VBQ1gsSUFBQSxHQUFPLE9BQUEsQ0FBUSxRQUFSOztFQUVEOzs7SUFDSixNQUFDLENBQUEsTUFBRCxDQUFRLEtBQVI7O3FCQUNBLFNBQUEsR0FBVzs7cUJBQ1gsSUFBQSxHQUFNOztxQkFDTixJQUFBLEdBQU07O3FCQUNOLGNBQUEsR0FBZ0I7O0lBRUgsZ0JBQUE7TUFDWCx5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QixTQUFDLEtBQUQ7ZUFDeEQsS0FBSyxDQUFDLGFBQU4sQ0FBb0IsY0FBcEIsRUFBb0MsSUFBcEM7TUFEd0QsQ0FBcEIsQ0FBdEMsRUFBQyx5QkFBRCxFQUFrQjtNQUVsQixjQUFBLEdBQWlCLENBQUMsQ0FBQyxJQUFGLENBQU8sVUFBQSxDQUFXLGVBQVgsQ0FBUDtNQUNqQixnQkFBQSxHQUFtQixVQUFBLENBQVcsZ0JBQVg7TUFFbkIsSUFBRyxjQUFIO1FBQ0UsZ0JBQUEsR0FBbUIsZ0JBQWdCLENBQUMsTUFBakIsQ0FBd0IsU0FBQyxLQUFEO2lCQUN6QyxjQUFjLENBQUMsYUFBZixDQUE2QixLQUE3QjtRQUR5QyxDQUF4QixFQURyQjs7eURBSW1CLENBQUUsR0FBRyxDQUFDLFNBQXpCLENBQW1DLENBQUMsQ0FBRCxFQUFJLENBQUMsQ0FBTCxDQUFuQyxXQUFBLDhCQUErQyxjQUFjLENBQUU7SUFuQ3ZEOzs7O0tBVGE7QUF4bUN6QiIsInNvdXJjZXNDb250ZW50IjpbIl8gPSByZXF1aXJlICd1bmRlcnNjb3JlLXBsdXMnXG57UG9pbnQsIFJhbmdlfSA9IHJlcXVpcmUgJ2F0b20nXG5cbntcbiAgbW92ZUN1cnNvckxlZnQsIG1vdmVDdXJzb3JSaWdodFxuICBtb3ZlQ3Vyc29yVXBTY3JlZW4sIG1vdmVDdXJzb3JEb3duU2NyZWVuXG4gIG1vdmVDdXJzb3JEb3duQnVmZmVyXG4gIG1vdmVDdXJzb3JVcEJ1ZmZlclxuICBjdXJzb3JJc0F0VmltRW5kT2ZGaWxlXG4gIGdldEZpcnN0VmlzaWJsZVNjcmVlblJvdywgZ2V0TGFzdFZpc2libGVTY3JlZW5Sb3dcbiAgZ2V0VmFsaWRWaW1TY3JlZW5Sb3csIGdldFZhbGlkVmltQnVmZmVyUm93XG4gIG1vdmVDdXJzb3JUb0ZpcnN0Q2hhcmFjdGVyQXRSb3dcbiAgc29ydFJhbmdlc1xuICBnZXRJbmRlbnRMZXZlbEZvckJ1ZmZlclJvd1xuICBwb2ludElzT25XaGl0ZVNwYWNlXG4gIG1vdmVDdXJzb3JUb05leHROb25XaGl0ZXNwYWNlXG4gIGlzRW1wdHlSb3dcbiAgZ2V0Q29kZUZvbGRSb3dSYW5nZXNcbiAgZ2V0TGFyZ2VzdEZvbGRSYW5nZUNvbnRhaW5zQnVmZmVyUm93XG4gIGlzSW5jbHVkZUZ1bmN0aW9uU2NvcGVGb3JSb3dcbiAgZGV0ZWN0U2NvcGVTdGFydFBvc2l0aW9uRm9yU2NvcGVcbiAgZ2V0QnVmZmVyUm93c1xuICBnZXRUZXh0SW5TY3JlZW5SYW5nZVxuICBjdXJzb3JJc0F0RW5kT2ZMaW5lQXROb25FbXB0eVJvd1xuICBzZXRCdWZmZXJSb3dcbiAgc2V0QnVmZmVyQ29sdW1uXG4gIGxpbWl0TnVtYmVyXG4gIGdldEluZGV4XG4gIHNtYXJ0U2Nyb2xsVG9CdWZmZXJQb3NpdGlvblxuICBnZXRLZXlzdHJva2VGb3JFdmVudFxuICBwb2ludElzQXRFbmRPZkxpbmVBdE5vbkVtcHR5Um93XG4gIGdldEVuZE9mTGluZUZvckJ1ZmZlclJvd1xuICBmaW5kUmFuZ2VJbkJ1ZmZlclJvd1xufSA9IHJlcXVpcmUgJy4vdXRpbHMnXG5cbnN3cmFwID0gcmVxdWlyZSAnLi9zZWxlY3Rpb24td3JhcHBlcidcbnNldHRpbmdzID0gcmVxdWlyZSAnLi9zZXR0aW5ncydcbkJhc2UgPSByZXF1aXJlICcuL2Jhc2UnXG5cbmNsYXNzIE1vdGlvbiBleHRlbmRzIEJhc2VcbiAgQGV4dGVuZChmYWxzZSlcbiAgaW5jbHVzaXZlOiBmYWxzZVxuICB3aXNlOiAnY2hhcmFjdGVyd2lzZSdcbiAganVtcDogZmFsc2VcbiAgdmVydGljYWxNb3Rpb246IGZhbHNlXG5cbiAgY29uc3RydWN0b3I6IC0+XG4gICAgc3VwZXJcblxuICAgICMgdmlzdWFsIG1vZGUgY2FuIG92ZXJ3cml0ZSBkZWZhdWx0IHdpc2UgYW5kIGluY2x1c2l2ZW5lc3NcbiAgICBpZiBAdmltU3RhdGUubW9kZSBpcyAndmlzdWFsJ1xuICAgICAgQGluY2x1c2l2ZSA9IHRydWVcbiAgICAgIEB3aXNlID0gQHZpbVN0YXRlLnN1Ym1vZGVcbiAgICBAaW5pdGlhbGl6ZSgpXG5cbiAgaXNJbmNsdXNpdmU6IC0+XG4gICAgQGluY2x1c2l2ZVxuXG4gIGlzSnVtcDogLT5cbiAgICBAanVtcFxuXG4gIGlzVmVydGljYWxNb3Rpb246IC0+XG4gICAgQHZlcnRpY2FsTW90aW9uXG5cbiAgaXNDaGFyYWN0ZXJ3aXNlOiAtPlxuICAgIEB3aXNlIGlzICdjaGFyYWN0ZXJ3aXNlJ1xuXG4gIGlzTGluZXdpc2U6IC0+XG4gICAgQHdpc2UgaXMgJ2xpbmV3aXNlJ1xuXG4gIGlzQmxvY2t3aXNlOiAtPlxuICAgIEB3aXNlIGlzICdibG9ja3dpc2UnXG5cbiAgZm9yY2VXaXNlOiAod2lzZSkgLT5cbiAgICBpZiB3aXNlIGlzICdjaGFyYWN0ZXJ3aXNlJ1xuICAgICAgaWYgQHdpc2UgaXMgJ2xpbmV3aXNlJ1xuICAgICAgICBAaW5jbHVzaXZlID0gZmFsc2VcbiAgICAgIGVsc2VcbiAgICAgICAgQGluY2x1c2l2ZSA9IG5vdCBAaW5jbHVzaXZlXG4gICAgQHdpc2UgPSB3aXNlXG5cbiAgc2V0QnVmZmVyUG9zaXRpb25TYWZlbHk6IChjdXJzb3IsIHBvaW50KSAtPlxuICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihwb2ludCkgaWYgcG9pbnQ/XG5cbiAgc2V0U2NyZWVuUG9zaXRpb25TYWZlbHk6IChjdXJzb3IsIHBvaW50KSAtPlxuICAgIGN1cnNvci5zZXRTY3JlZW5Qb3NpdGlvbihwb2ludCkgaWYgcG9pbnQ/XG5cbiAgbW92ZVdpdGhTYXZlSnVtcDogKGN1cnNvcikgLT5cbiAgICBpZiBjdXJzb3IuaXNMYXN0Q3Vyc29yKCkgYW5kIEBpc0p1bXAoKVxuICAgICAgY3Vyc29yUG9zaXRpb24gPSBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuXG4gICAgQG1vdmVDdXJzb3IoY3Vyc29yKVxuXG4gICAgaWYgY3Vyc29yUG9zaXRpb24/IGFuZCBub3QgY3Vyc29yUG9zaXRpb24uaXNFcXVhbChjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKSlcbiAgICAgIEB2aW1TdGF0ZS5tYXJrLnNldCgnYCcsIGN1cnNvclBvc2l0aW9uKVxuICAgICAgQHZpbVN0YXRlLm1hcmsuc2V0KFwiJ1wiLCBjdXJzb3JQb3NpdGlvbilcblxuICBleGVjdXRlOiAtPlxuICAgIGlmIEBoYXNPcGVyYXRvcigpXG4gICAgICBAc2VsZWN0KClcbiAgICBlbHNlXG4gICAgICBAZWRpdG9yLm1vdmVDdXJzb3JzIChjdXJzb3IpID0+XG4gICAgICAgIEBtb3ZlV2l0aFNhdmVKdW1wKGN1cnNvcilcblxuICBzZWxlY3Q6IC0+XG4gICAgZm9yIHNlbGVjdGlvbiBpbiBAZWRpdG9yLmdldFNlbGVjdGlvbnMoKVxuICAgICAgQHNlbGVjdEJ5TW90aW9uKHNlbGVjdGlvbilcblxuICAgIEBlZGl0b3IubWVyZ2VDdXJzb3JzKClcbiAgICBAZWRpdG9yLm1lcmdlSW50ZXJzZWN0aW5nU2VsZWN0aW9ucygpXG5cbiAgICBpZiBAaXNNb2RlKCd2aXN1YWwnKVxuICAgICAgIyBXZSBoYXZlIHRvIHVwZGF0ZSBzZWxlY3Rpb24gcHJvcFxuICAgICAgIyBBRlRFUiBjdXJzb3IgbW92ZSBhbmQgQkVGT1JFIHJldHVybiB0byBzdWJtb2RlLXdpc2Ugc3RhdGVcbiAgICAgIHN3cmFwLnNhdmVQcm9wZXJ0aWVzKEBlZGl0b3IpXG5cbiAgICBpZiBAaGFzT3BlcmF0b3IoKVxuICAgICAgaWYgQGlzTW9kZSgndmlzdWFsJylcbiAgICAgICAgaWYgQGlzTW9kZSgndmlzdWFsJywgJ2xpbmV3aXNlJykgYW5kIEBlZGl0b3IuZ2V0TGFzdFNlbGVjdGlvbigpLmlzUmV2ZXJzZWQoKVxuICAgICAgICAgIEB2aW1TdGF0ZS5tdXRhdGlvbk1hbmFnZXIuc2V0Q2hlY2twb2ludCgnZGlkLW1vdmUnKVxuICAgICAgZWxzZVxuICAgICAgICBAdmltU3RhdGUubXV0YXRpb25NYW5hZ2VyLnNldENoZWNrcG9pbnQoJ2RpZC1tb3ZlJylcblxuICAgICMgTW9kaWZ5IHNlbGVjdGlvbiB0byBzdWJtb2RlLXdpc2VseVxuICAgIHN3aXRjaCBAd2lzZVxuICAgICAgd2hlbiAnbGluZXdpc2UnXG4gICAgICAgIEB2aW1TdGF0ZS5zZWxlY3RMaW5ld2lzZSgpXG4gICAgICB3aGVuICdibG9ja3dpc2UnXG4gICAgICAgIEB2aW1TdGF0ZS5zZWxlY3RCbG9ja3dpc2UoKVxuXG4gIHNlbGVjdEJ5TW90aW9uOiAoc2VsZWN0aW9uKSAtPlxuICAgIHtjdXJzb3J9ID0gc2VsZWN0aW9uXG5cbiAgICBzZWxlY3Rpb24ubW9kaWZ5U2VsZWN0aW9uID0+XG4gICAgICBAbW92ZVdpdGhTYXZlSnVtcChjdXJzb3IpXG5cbiAgICBpZiBub3QgQGlzTW9kZSgndmlzdWFsJykgYW5kIG5vdCBAaXMoJ0N1cnJlbnRTZWxlY3Rpb24nKSBhbmQgc2VsZWN0aW9uLmlzRW1wdHkoKSAjIEZhaWxlZCB0byBtb3ZlLlxuICAgICAgcmV0dXJuXG4gICAgcmV0dXJuIHVubGVzcyBAaXNJbmNsdXNpdmUoKSBvciBAaXNMaW5ld2lzZSgpXG5cbiAgICBpZiBAaXNNb2RlKCd2aXN1YWwnKSBhbmQgY3Vyc29ySXNBdEVuZE9mTGluZUF0Tm9uRW1wdHlSb3coY3Vyc29yKVxuICAgICAgIyBBdm9pZCBwdXRpbmcgY3Vyc29yIG9uIEVPTCBpbiB2aXN1YWwtbW9kZSBhcyBsb25nIGFzIGN1cnNvcidzIHJvdyB3YXMgbm9uLWVtcHR5LlxuICAgICAgc3dyYXAoc2VsZWN0aW9uKS50cmFuc2xhdGVTZWxlY3Rpb25IZWFkQW5kQ2xpcCgnYmFja3dhcmQnKVxuICAgICMgdG8gc2VsZWN0IEBpbmNsdXNpdmUtbHlcbiAgICBzd3JhcChzZWxlY3Rpb24pLnRyYW5zbGF0ZVNlbGVjdGlvbkVuZEFuZENsaXAoJ2ZvcndhcmQnKVxuXG4gIHNldEN1cnNvckJ1ZmZlUm93OiAoY3Vyc29yLCByb3csIG9wdGlvbnMpIC0+XG4gICAgaWYgQGlzVmVydGljYWxNb3Rpb24oKSBhbmQgc2V0dGluZ3MuZ2V0KCdtb3ZlVG9GaXJzdENoYXJhY3Rlck9uVmVydGljYWxNb3Rpb24nKVxuICAgICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKEBnZXRGaXJzdENoYXJhY3RlclBvc2l0aW9uRm9yQnVmZmVyUm93KHJvdyksIG9wdGlvbnMpXG4gICAgZWxzZVxuICAgICAgc2V0QnVmZmVyUm93KGN1cnNvciwgcm93LCBvcHRpb25zKVxuXG4gICMgW05PVEVdXG4gICMgU2luY2UgdGhpcyBmdW5jdGlvbiBjaGVja3MgY3Vyc29yIHBvc2l0aW9uIGNoYW5nZSwgYSBjdXJzb3IgcG9zaXRpb24gTVVTVCBiZVxuICAjIHVwZGF0ZWQgSU4gY2FsbGJhY2soPWZuKVxuICAjIFVwZGF0aW5nIHBvaW50IG9ubHkgaW4gY2FsbGJhY2sgaXMgd3JvbmctdXNlIG9mIHRoaXMgZnVuY2l0b24sXG4gICMgc2luY2UgaXQgc3RvcHMgaW1tZWRpYXRlbHkgYmVjYXVzZSBvZiBub3QgY3Vyc29yIHBvc2l0aW9uIGNoYW5nZS5cbiAgbW92ZUN1cnNvckNvdW50VGltZXM6IChjdXJzb3IsIGZuKSAtPlxuICAgIG9sZFBvc2l0aW9uID0gY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKClcbiAgICBAY291bnRUaW1lcyBAZ2V0Q291bnQoKSwgKHN0YXRlKSAtPlxuICAgICAgZm4oc3RhdGUpXG4gICAgICBpZiAobmV3UG9zaXRpb24gPSBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKSkuaXNFcXVhbChvbGRQb3NpdGlvbilcbiAgICAgICAgc3RhdGUuc3RvcCgpXG4gICAgICBvbGRQb3NpdGlvbiA9IG5ld1Bvc2l0aW9uXG5cbiMgVXNlZCBhcyBvcGVyYXRvcidzIHRhcmdldCBpbiB2aXN1YWwtbW9kZS5cbmNsYXNzIEN1cnJlbnRTZWxlY3Rpb24gZXh0ZW5kcyBNb3Rpb25cbiAgQGV4dGVuZChmYWxzZSlcbiAgc2VsZWN0aW9uRXh0ZW50OiBudWxsXG4gIGJsb2Nrd2lzZVNlbGVjdGlvbkV4dGVudDogbnVsbFxuICBpbmNsdXNpdmU6IHRydWVcblxuICBpbml0aWFsaXplOiAtPlxuICAgIHN1cGVyXG4gICAgQHBvaW50SW5mb0J5Q3Vyc29yID0gbmV3IE1hcFxuXG4gIG1vdmVDdXJzb3I6IChjdXJzb3IpIC0+XG4gICAgaWYgQGlzTW9kZSgndmlzdWFsJylcbiAgICAgIGlmIEBpc0Jsb2Nrd2lzZSgpXG4gICAgICAgIEBibG9ja3dpc2VTZWxlY3Rpb25FeHRlbnQgPSBzd3JhcChjdXJzb3Iuc2VsZWN0aW9uKS5nZXRCbG9ja3dpc2VTZWxlY3Rpb25FeHRlbnQoKVxuICAgICAgZWxzZVxuICAgICAgICBAc2VsZWN0aW9uRXh0ZW50ID0gQGVkaXRvci5nZXRTZWxlY3RlZEJ1ZmZlclJhbmdlKCkuZ2V0RXh0ZW50KClcbiAgICBlbHNlXG4gICAgICAjIGAuYCByZXBlYXQgY2FzZVxuICAgICAgcG9pbnQgPSBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuXG4gICAgICBpZiBAYmxvY2t3aXNlU2VsZWN0aW9uRXh0ZW50P1xuICAgICAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24ocG9pbnQudHJhbnNsYXRlKEBibG9ja3dpc2VTZWxlY3Rpb25FeHRlbnQpKVxuICAgICAgZWxzZVxuICAgICAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24ocG9pbnQudHJhdmVyc2UoQHNlbGVjdGlvbkV4dGVudCkpXG5cbiAgc2VsZWN0OiAtPlxuICAgIGlmIEBpc01vZGUoJ3Zpc3VhbCcpXG4gICAgICBzdXBlclxuICAgIGVsc2VcbiAgICAgIGZvciBjdXJzb3IgaW4gQGVkaXRvci5nZXRDdXJzb3JzKCkgd2hlbiBwb2ludEluZm8gPSBAcG9pbnRJbmZvQnlDdXJzb3IuZ2V0KGN1cnNvcilcbiAgICAgICAge2N1cnNvclBvc2l0aW9uLCBzdGFydE9mU2VsZWN0aW9uLCBhdEVPTH0gPSBwb2ludEluZm9cbiAgICAgICAgaWYgYXRFT0wgb3IgY3Vyc29yUG9zaXRpb24uaXNFcXVhbChjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKSlcbiAgICAgICAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24oc3RhcnRPZlNlbGVjdGlvbilcbiAgICAgIHN1cGVyXG5cbiAgICAjICogUHVycG9zZSBvZiBwb2ludEluZm9CeUN1cnNvcj8gc2VlICMyMzUgZm9yIGRldGFpbC5cbiAgICAjIFdoZW4gc3RheU9uVHJhbnNmb3JtU3RyaW5nIGlzIGVuYWJsZWQsIGN1cnNvciBwb3MgaXMgbm90IHNldCBvbiBzdGFydCBvZlxuICAgICMgb2Ygc2VsZWN0ZWQgcmFuZ2UuXG4gICAgIyBCdXQgSSB3YW50IGZvbGxvd2luZyBiZWhhdmlvciwgc28gbmVlZCB0byBwcmVzZXJ2ZSBwb3NpdGlvbiBpbmZvLlxuICAgICMgIDEuIGB2aj4uYCAtPiBpbmRlbnQgc2FtZSB0d28gcm93cyByZWdhcmRsZXNzIG9mIGN1cnJlbnQgY3Vyc29yJ3Mgcm93LlxuICAgICMgIDIuIGB2aj5qLmAgLT4gaW5kZW50IHR3byByb3dzIGZyb20gY3Vyc29yJ3Mgcm93LlxuICAgIGZvciBjdXJzb3IgaW4gQGVkaXRvci5nZXRDdXJzb3JzKClcbiAgICAgIHN0YXJ0T2ZTZWxlY3Rpb24gPSBjdXJzb3Iuc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKCkuc3RhcnRcbiAgICAgIEBvbkRpZEZpbmlzaE9wZXJhdGlvbiA9PlxuICAgICAgICBjdXJzb3JQb3NpdGlvbiA9IGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXG4gICAgICAgIGF0RU9MID0gY3Vyc29yLmlzQXRFbmRPZkxpbmUoKVxuICAgICAgICBAcG9pbnRJbmZvQnlDdXJzb3Iuc2V0KGN1cnNvciwge3N0YXJ0T2ZTZWxlY3Rpb24sIGN1cnNvclBvc2l0aW9uLCBhdEVPTH0pXG5cbmNsYXNzIE1vdmVMZWZ0IGV4dGVuZHMgTW90aW9uXG4gIEBleHRlbmQoKVxuICBtb3ZlQ3Vyc29yOiAoY3Vyc29yKSAtPlxuICAgIGFsbG93V3JhcCA9IHNldHRpbmdzLmdldCgnd3JhcExlZnRSaWdodE1vdGlvbicpXG4gICAgQG1vdmVDdXJzb3JDb3VudFRpbWVzIGN1cnNvciwgLT5cbiAgICAgIG1vdmVDdXJzb3JMZWZ0KGN1cnNvciwge2FsbG93V3JhcH0pXG5cbmNsYXNzIE1vdmVSaWdodCBleHRlbmRzIE1vdGlvblxuICBAZXh0ZW5kKClcbiAgY2FuV3JhcFRvTmV4dExpbmU6IChjdXJzb3IpIC0+XG4gICAgaWYgQGlzQXNPcGVyYXRvclRhcmdldCgpIGFuZCBub3QgY3Vyc29yLmlzQXRFbmRPZkxpbmUoKVxuICAgICAgZmFsc2VcbiAgICBlbHNlXG4gICAgICBzZXR0aW5ncy5nZXQoJ3dyYXBMZWZ0UmlnaHRNb3Rpb24nKVxuXG4gIG1vdmVDdXJzb3I6IChjdXJzb3IpIC0+XG4gICAgQG1vdmVDdXJzb3JDb3VudFRpbWVzIGN1cnNvciwgPT5cbiAgICAgIEBlZGl0b3IudW5mb2xkQnVmZmVyUm93KGN1cnNvci5nZXRCdWZmZXJSb3coKSlcbiAgICAgIGFsbG93V3JhcCA9IEBjYW5XcmFwVG9OZXh0TGluZShjdXJzb3IpXG4gICAgICBtb3ZlQ3Vyc29yUmlnaHQoY3Vyc29yKVxuICAgICAgaWYgY3Vyc29yLmlzQXRFbmRPZkxpbmUoKSBhbmQgYWxsb3dXcmFwIGFuZCBub3QgY3Vyc29ySXNBdFZpbUVuZE9mRmlsZShjdXJzb3IpXG4gICAgICAgIG1vdmVDdXJzb3JSaWdodChjdXJzb3IsIHthbGxvd1dyYXB9KVxuXG5jbGFzcyBNb3ZlUmlnaHRCdWZmZXJDb2x1bW4gZXh0ZW5kcyBNb3Rpb25cbiAgQGV4dGVuZChmYWxzZSlcblxuICBtb3ZlQ3Vyc29yOiAoY3Vyc29yKSAtPlxuICAgIHNldEJ1ZmZlckNvbHVtbihjdXJzb3IsIGN1cnNvci5nZXRCdWZmZXJDb2x1bW4oKSArIEBnZXRDb3VudCgpKVxuXG5jbGFzcyBNb3ZlVXAgZXh0ZW5kcyBNb3Rpb25cbiAgQGV4dGVuZCgpXG4gIHdpc2U6ICdsaW5ld2lzZSdcblxuICBnZXRCdWZmZXJSb3c6IChyb3cpIC0+XG4gICAgcm93ID0gbGltaXROdW1iZXIocm93IC0gMSwgbWluOiAwKVxuICAgIGlmIEBlZGl0b3IuaXNGb2xkZWRBdEJ1ZmZlclJvdyhyb3cpXG4gICAgICBnZXRMYXJnZXN0Rm9sZFJhbmdlQ29udGFpbnNCdWZmZXJSb3coQGVkaXRvciwgcm93KS5zdGFydC5yb3dcbiAgICBlbHNlXG4gICAgICByb3dcblxuICBtb3ZlQ3Vyc29yOiAoY3Vyc29yKSAtPlxuICAgIEBtb3ZlQ3Vyc29yQ291bnRUaW1lcyBjdXJzb3IsID0+XG4gICAgICBzZXRCdWZmZXJSb3coY3Vyc29yLCBAZ2V0QnVmZmVyUm93KGN1cnNvci5nZXRCdWZmZXJSb3coKSkpXG5cbmNsYXNzIE1vdmVEb3duIGV4dGVuZHMgTW92ZVVwXG4gIEBleHRlbmQoKVxuICB3aXNlOiAnbGluZXdpc2UnXG5cbiAgZ2V0QnVmZmVyUm93OiAocm93KSAtPlxuICAgIGlmIEBlZGl0b3IuaXNGb2xkZWRBdEJ1ZmZlclJvdyhyb3cpXG4gICAgICByb3cgPSBnZXRMYXJnZXN0Rm9sZFJhbmdlQ29udGFpbnNCdWZmZXJSb3coQGVkaXRvciwgcm93KS5lbmQucm93XG4gICAgbGltaXROdW1iZXIocm93ICsgMSwgbWF4OiBAZ2V0VmltTGFzdEJ1ZmZlclJvdygpKVxuXG5jbGFzcyBNb3ZlVXBTY3JlZW4gZXh0ZW5kcyBNb3Rpb25cbiAgQGV4dGVuZCgpXG4gIHdpc2U6ICdsaW5ld2lzZSdcbiAgZGlyZWN0aW9uOiAndXAnXG5cbiAgbW92ZUN1cnNvcjogKGN1cnNvcikgLT5cbiAgICBAbW92ZUN1cnNvckNvdW50VGltZXMgY3Vyc29yLCAtPlxuICAgICAgbW92ZUN1cnNvclVwU2NyZWVuKGN1cnNvcilcblxuY2xhc3MgTW92ZURvd25TY3JlZW4gZXh0ZW5kcyBNb3ZlVXBTY3JlZW5cbiAgQGV4dGVuZCgpXG4gIHdpc2U6ICdsaW5ld2lzZSdcbiAgZGlyZWN0aW9uOiAnZG93bidcblxuICBtb3ZlQ3Vyc29yOiAoY3Vyc29yKSAtPlxuICAgIEBtb3ZlQ3Vyc29yQ291bnRUaW1lcyBjdXJzb3IsIC0+XG4gICAgICBtb3ZlQ3Vyc29yRG93blNjcmVlbihjdXJzb3IpXG5cbiMgTW92ZSBkb3duL3VwIHRvIEVkZ2VcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBTZWUgdDltZC9hdG9tLXZpbS1tb2RlLXBsdXMjMjM2XG4jIEF0IGxlYXN0IHYxLjcuMC4gYnVmZmVyUG9zaXRpb24gYW5kIHNjcmVlblBvc2l0aW9uIGNhbm5vdCBjb252ZXJ0IGFjY3VyYXRlbHlcbiMgd2hlbiByb3cgaXMgZm9sZGVkLlxuY2xhc3MgTW92ZVVwVG9FZGdlIGV4dGVuZHMgTW90aW9uXG4gIEBleHRlbmQoKVxuICB3aXNlOiAnbGluZXdpc2UnXG4gIGp1bXA6IHRydWVcbiAgZGlyZWN0aW9uOiAndXAnXG4gIEBkZXNjcmlwdGlvbjogXCJNb3ZlIGN1cnNvciB1cCB0byAqKmVkZ2UqKiBjaGFyIGF0IHNhbWUtY29sdW1uXCJcblxuICBtb3ZlQ3Vyc29yOiAoY3Vyc29yKSAtPlxuICAgIEBtb3ZlQ3Vyc29yQ291bnRUaW1lcyBjdXJzb3IsID0+XG4gICAgICBAc2V0U2NyZWVuUG9zaXRpb25TYWZlbHkoY3Vyc29yLCBAZ2V0UG9pbnQoY3Vyc29yLmdldFNjcmVlblBvc2l0aW9uKCkpKVxuXG4gIGdldFBvaW50OiAoZnJvbVBvaW50KSAtPlxuICAgIGNvbHVtbiA9IGZyb21Qb2ludC5jb2x1bW5cbiAgICBmb3Igcm93IGluIEBnZXRTY2FuUm93cyhmcm9tUG9pbnQpIHdoZW4gQGlzRWRnZShwb2ludCA9IG5ldyBQb2ludChyb3csIGNvbHVtbikpXG4gICAgICByZXR1cm4gcG9pbnRcblxuICBnZXRTY2FuUm93czogKHtyb3d9KSAtPlxuICAgIHZhbGlkUm93ID0gZ2V0VmFsaWRWaW1TY3JlZW5Sb3cuYmluZChudWxsLCBAZWRpdG9yKVxuICAgIHN3aXRjaCBAZGlyZWN0aW9uXG4gICAgICB3aGVuICd1cCcgdGhlbiBbdmFsaWRSb3cocm93IC0gMSkuLjBdXG4gICAgICB3aGVuICdkb3duJyB0aGVuIFt2YWxpZFJvdyhyb3cgKyAxKS4uQGdldFZpbUxhc3RTY3JlZW5Sb3coKV1cblxuICBpc0VkZ2U6IChwb2ludCkgLT5cbiAgICBpZiBAaXNTdG9wcGFibGVQb2ludChwb2ludClcbiAgICAgICMgSWYgb25lIG9mIGFib3ZlL2JlbG93IHBvaW50IHdhcyBub3Qgc3RvcHBhYmxlLCBpdCdzIEVkZ2UhXG4gICAgICBhYm92ZSA9IHBvaW50LnRyYW5zbGF0ZShbLTEsIDBdKVxuICAgICAgYmVsb3cgPSBwb2ludC50cmFuc2xhdGUoWysxLCAwXSlcbiAgICAgIChub3QgQGlzU3RvcHBhYmxlUG9pbnQoYWJvdmUpKSBvciAobm90IEBpc1N0b3BwYWJsZVBvaW50KGJlbG93KSlcbiAgICBlbHNlXG4gICAgICBmYWxzZVxuXG4gIGlzU3RvcHBhYmxlUG9pbnQ6IChwb2ludCkgLT5cbiAgICBpZiBAaXNOb25XaGl0ZVNwYWNlUG9pbnQocG9pbnQpXG4gICAgICB0cnVlXG4gICAgZWxzZVxuICAgICAgbGVmdFBvaW50ID0gcG9pbnQudHJhbnNsYXRlKFswLCAtMV0pXG4gICAgICByaWdodFBvaW50ID0gcG9pbnQudHJhbnNsYXRlKFswLCArMV0pXG4gICAgICBAaXNOb25XaGl0ZVNwYWNlUG9pbnQobGVmdFBvaW50KSBhbmQgQGlzTm9uV2hpdGVTcGFjZVBvaW50KHJpZ2h0UG9pbnQpXG5cbiAgaXNOb25XaGl0ZVNwYWNlUG9pbnQ6IChwb2ludCkgLT5cbiAgICBjaGFyID0gZ2V0VGV4dEluU2NyZWVuUmFuZ2UoQGVkaXRvciwgUmFuZ2UuZnJvbVBvaW50V2l0aERlbHRhKHBvaW50LCAwLCAxKSlcbiAgICBjaGFyPyBhbmQgL1xcUy8udGVzdChjaGFyKVxuXG5jbGFzcyBNb3ZlRG93blRvRWRnZSBleHRlbmRzIE1vdmVVcFRvRWRnZVxuICBAZXh0ZW5kKClcbiAgQGRlc2NyaXB0aW9uOiBcIk1vdmUgY3Vyc29yIGRvd24gdG8gKiplZGdlKiogY2hhciBhdCBzYW1lLWNvbHVtblwiXG4gIGRpcmVjdGlvbjogJ2Rvd24nXG5cbiMgd29yZFxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBNb3ZlVG9OZXh0V29yZCBleHRlbmRzIE1vdGlvblxuICBAZXh0ZW5kKClcbiAgd29yZFJlZ2V4OiBudWxsXG5cbiAgZ2V0UG9pbnQ6IChwYXR0ZXJuLCBmcm9tKSAtPlxuICAgIHdvcmRSYW5nZSA9IG51bGxcbiAgICBmb3VuZCA9IGZhbHNlXG4gICAgdmltRU9GID0gQGdldFZpbUVvZkJ1ZmZlclBvc2l0aW9uKEBlZGl0b3IpXG5cbiAgICBAc2NhbkZvcndhcmQgcGF0dGVybiwge2Zyb219LCAoe3JhbmdlLCBtYXRjaFRleHQsIHN0b3B9KSAtPlxuICAgICAgd29yZFJhbmdlID0gcmFuZ2VcbiAgICAgICMgSWdub3JlICdlbXB0eSBsaW5lJyBtYXRjaGVzIGJldHdlZW4gJ1xccicgYW5kICdcXG4nXG4gICAgICByZXR1cm4gaWYgbWF0Y2hUZXh0IGlzICcnIGFuZCByYW5nZS5zdGFydC5jb2x1bW4gaXNudCAwXG4gICAgICBpZiByYW5nZS5zdGFydC5pc0dyZWF0ZXJUaGFuKGZyb20pXG4gICAgICAgIGZvdW5kID0gdHJ1ZVxuICAgICAgICBzdG9wKClcblxuICAgIGlmIGZvdW5kXG4gICAgICBwb2ludCA9IHdvcmRSYW5nZS5zdGFydFxuICAgICAgaWYgcG9pbnRJc0F0RW5kT2ZMaW5lQXROb25FbXB0eVJvdyhAZWRpdG9yLCBwb2ludCkgYW5kIG5vdCBwb2ludC5pc0VxdWFsKHZpbUVPRilcbiAgICAgICAgcG9pbnQudHJhdmVyc2UoWzEsIDBdKVxuICAgICAgZWxzZVxuICAgICAgICBwb2ludFxuICAgIGVsc2VcbiAgICAgIHdvcmRSYW5nZT8uZW5kID8gZnJvbVxuXG4gICMgU3BlY2lhbCBjYXNlOiBcImN3XCIgYW5kIFwiY1dcIiBhcmUgdHJlYXRlZCBsaWtlIFwiY2VcIiBhbmQgXCJjRVwiIGlmIHRoZSBjdXJzb3IgaXNcbiAgIyBvbiBhIG5vbi1ibGFuay4gIFRoaXMgaXMgYmVjYXVzZSBcImN3XCIgaXMgaW50ZXJwcmV0ZWQgYXMgY2hhbmdlLXdvcmQsIGFuZCBhXG4gICMgd29yZCBkb2VzIG5vdCBpbmNsdWRlIHRoZSBmb2xsb3dpbmcgd2hpdGUgc3BhY2UuICB7Vmk6IFwiY3dcIiB3aGVuIG9uIGEgYmxhbmtcbiAgIyBmb2xsb3dlZCBieSBvdGhlciBibGFua3MgY2hhbmdlcyBvbmx5IHRoZSBmaXJzdCBibGFuazsgdGhpcyBpcyBwcm9iYWJseSBhXG4gICMgYnVnLCBiZWNhdXNlIFwiZHdcIiBkZWxldGVzIGFsbCB0aGUgYmxhbmtzfVxuICAjXG4gICMgQW5vdGhlciBzcGVjaWFsIGNhc2U6IFdoZW4gdXNpbmcgdGhlIFwid1wiIG1vdGlvbiBpbiBjb21iaW5hdGlvbiB3aXRoIGFuXG4gICMgb3BlcmF0b3IgYW5kIHRoZSBsYXN0IHdvcmQgbW92ZWQgb3ZlciBpcyBhdCB0aGUgZW5kIG9mIGEgbGluZSwgdGhlIGVuZCBvZlxuICAjIHRoYXQgd29yZCBiZWNvbWVzIHRoZSBlbmQgb2YgdGhlIG9wZXJhdGVkIHRleHQsIG5vdCB0aGUgZmlyc3Qgd29yZCBpbiB0aGVcbiAgIyBuZXh0IGxpbmUuXG4gIG1vdmVDdXJzb3I6IChjdXJzb3IpIC0+XG4gICAgcmV0dXJuIGlmIGN1cnNvcklzQXRWaW1FbmRPZkZpbGUoY3Vyc29yKVxuICAgIHdhc09uV2hpdGVTcGFjZSA9IHBvaW50SXNPbldoaXRlU3BhY2UoQGVkaXRvciwgY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKCkpXG4gICAgaXNBc09wZXJhdG9yVGFyZ2V0ID0gQGlzQXNPcGVyYXRvclRhcmdldCgpXG4gICAgQG1vdmVDdXJzb3JDb3VudFRpbWVzIGN1cnNvciwgKHtpc0ZpbmFsfSkgPT5cbiAgICAgIGN1cnNvclBvc2l0aW9uID0gY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKClcbiAgICAgIGlmIGlzRW1wdHlSb3coQGVkaXRvciwgY3Vyc29yUG9zaXRpb24ucm93KSBhbmQgaXNBc09wZXJhdG9yVGFyZ2V0XG4gICAgICAgIHBvaW50ID0gY3Vyc29yUG9zaXRpb24udHJhdmVyc2UoWzEsIDBdKVxuICAgICAgZWxzZVxuICAgICAgICBwYXR0ZXJuID0gQHdvcmRSZWdleCA/IGN1cnNvci53b3JkUmVnRXhwKClcbiAgICAgICAgcG9pbnQgPSBAZ2V0UG9pbnQocGF0dGVybiwgY3Vyc29yUG9zaXRpb24pXG4gICAgICAgIGlmIGlzRmluYWwgYW5kIGlzQXNPcGVyYXRvclRhcmdldFxuICAgICAgICAgIGlmIEBnZXRPcGVyYXRvcigpLmlzKCdDaGFuZ2UnKSBhbmQgKG5vdCB3YXNPbldoaXRlU3BhY2UpXG4gICAgICAgICAgICBwb2ludCA9IGN1cnNvci5nZXRFbmRPZkN1cnJlbnRXb3JkQnVmZmVyUG9zaXRpb24oe0B3b3JkUmVnZXh9KVxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIHBvaW50ID0gUG9pbnQubWluKHBvaW50LCBnZXRFbmRPZkxpbmVGb3JCdWZmZXJSb3coQGVkaXRvciwgY3Vyc29yUG9zaXRpb24ucm93KSlcbiAgICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihwb2ludClcblxuIyBiXG5jbGFzcyBNb3ZlVG9QcmV2aW91c1dvcmQgZXh0ZW5kcyBNb3Rpb25cbiAgQGV4dGVuZCgpXG4gIHdvcmRSZWdleDogbnVsbFxuXG4gIG1vdmVDdXJzb3I6IChjdXJzb3IpIC0+XG4gICAgQG1vdmVDdXJzb3JDb3VudFRpbWVzIGN1cnNvciwgPT5cbiAgICAgIHBvaW50ID0gY3Vyc29yLmdldEJlZ2lubmluZ09mQ3VycmVudFdvcmRCdWZmZXJQb3NpdGlvbih7QHdvcmRSZWdleH0pXG4gICAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24ocG9pbnQpXG5cbmNsYXNzIE1vdmVUb0VuZE9mV29yZCBleHRlbmRzIE1vdGlvblxuICBAZXh0ZW5kKClcbiAgd29yZFJlZ2V4OiBudWxsXG4gIGluY2x1c2l2ZTogdHJ1ZVxuXG4gIG1vdmVUb05leHRFbmRPZldvcmQ6IChjdXJzb3IpIC0+XG4gICAgbW92ZUN1cnNvclRvTmV4dE5vbldoaXRlc3BhY2UoY3Vyc29yKVxuICAgIHBvaW50ID0gY3Vyc29yLmdldEVuZE9mQ3VycmVudFdvcmRCdWZmZXJQb3NpdGlvbih7QHdvcmRSZWdleH0pLnRyYW5zbGF0ZShbMCwgLTFdKVxuICAgIHBvaW50ID0gUG9pbnQubWluKHBvaW50LCBAZ2V0VmltRW9mQnVmZmVyUG9zaXRpb24oKSlcbiAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24ocG9pbnQpXG5cbiAgbW92ZUN1cnNvcjogKGN1cnNvcikgLT5cbiAgICBAbW92ZUN1cnNvckNvdW50VGltZXMgY3Vyc29yLCA9PlxuICAgICAgb3JpZ2luYWxQb2ludCA9IGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXG4gICAgICBAbW92ZVRvTmV4dEVuZE9mV29yZChjdXJzb3IpXG4gICAgICBpZiBvcmlnaW5hbFBvaW50LmlzRXF1YWwoY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKCkpXG4gICAgICAgICMgUmV0cnkgZnJvbSByaWdodCBjb2x1bW4gaWYgY3Vyc29yIHdhcyBhbHJlYWR5IG9uIEVuZE9mV29yZFxuICAgICAgICBjdXJzb3IubW92ZVJpZ2h0KClcbiAgICAgICAgQG1vdmVUb05leHRFbmRPZldvcmQoY3Vyc29yKVxuXG4jIFtUT0RPOiBJbXByb3ZlLCBhY2N1cmFjeV1cbmNsYXNzIE1vdmVUb1ByZXZpb3VzRW5kT2ZXb3JkIGV4dGVuZHMgTW92ZVRvUHJldmlvdXNXb3JkXG4gIEBleHRlbmQoKVxuICBpbmNsdXNpdmU6IHRydWVcblxuICBtb3ZlQ3Vyc29yOiAoY3Vyc29yKSAtPlxuICAgIHRpbWVzID0gQGdldENvdW50KClcbiAgICB3b3JkUmFuZ2UgPSBjdXJzb3IuZ2V0Q3VycmVudFdvcmRCdWZmZXJSYW5nZSgpXG4gICAgY3Vyc29yUG9zaXRpb24gPSBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuXG4gICAgIyBpZiB3ZSdyZSBpbiB0aGUgbWlkZGxlIG9mIGEgd29yZCB0aGVuIHdlIG5lZWQgdG8gbW92ZSB0byBpdHMgc3RhcnRcbiAgICBpZiBjdXJzb3JQb3NpdGlvbi5pc0dyZWF0ZXJUaGFuKHdvcmRSYW5nZS5zdGFydCkgYW5kIGN1cnNvclBvc2l0aW9uLmlzTGVzc1RoYW4od29yZFJhbmdlLmVuZClcbiAgICAgIHRpbWVzICs9IDFcblxuICAgIGZvciBbMS4udGltZXNdXG4gICAgICBwb2ludCA9IGN1cnNvci5nZXRCZWdpbm5pbmdPZkN1cnJlbnRXb3JkQnVmZmVyUG9zaXRpb24oe0B3b3JkUmVnZXh9KVxuICAgICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHBvaW50KVxuXG4gICAgQG1vdmVUb05leHRFbmRPZldvcmQoY3Vyc29yKVxuICAgIGlmIGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpLmlzR3JlYXRlclRoYW5PckVxdWFsKGN1cnNvclBvc2l0aW9uKVxuICAgICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKFswLCAwXSlcblxuICBtb3ZlVG9OZXh0RW5kT2ZXb3JkOiAoY3Vyc29yKSAtPlxuICAgIHBvaW50ID0gY3Vyc29yLmdldEVuZE9mQ3VycmVudFdvcmRCdWZmZXJQb3NpdGlvbih7QHdvcmRSZWdleH0pLnRyYW5zbGF0ZShbMCwgLTFdKVxuICAgIHBvaW50ID0gUG9pbnQubWluKHBvaW50LCBAZ2V0VmltRW9mQnVmZmVyUG9zaXRpb24oKSlcbiAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24ocG9pbnQpXG5cbiMgV2hvbGUgd29yZFxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBNb3ZlVG9OZXh0V2hvbGVXb3JkIGV4dGVuZHMgTW92ZVRvTmV4dFdvcmRcbiAgQGV4dGVuZCgpXG4gIHdvcmRSZWdleDogL14kfFxcUysvZ1xuXG5jbGFzcyBNb3ZlVG9QcmV2aW91c1dob2xlV29yZCBleHRlbmRzIE1vdmVUb1ByZXZpb3VzV29yZFxuICBAZXh0ZW5kKClcbiAgd29yZFJlZ2V4OiAvXiR8XFxTKy9cblxuY2xhc3MgTW92ZVRvRW5kT2ZXaG9sZVdvcmQgZXh0ZW5kcyBNb3ZlVG9FbmRPZldvcmRcbiAgQGV4dGVuZCgpXG4gIHdvcmRSZWdleDogL1xcUysvXG5cbiMgW1RPRE86IEltcHJvdmUsIGFjY3VyYWN5XVxuY2xhc3MgTW92ZVRvUHJldmlvdXNFbmRPZldob2xlV29yZCBleHRlbmRzIE1vdmVUb1ByZXZpb3VzRW5kT2ZXb3JkXG4gIEBleHRlbmQoKVxuICB3b3JkUmVnZXg6IC9cXFMrL1xuXG4jIEFscGhhbnVtZXJpYyB3b3JkIFtFeHBlcmltZW50YWxdXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIE1vdmVUb05leHRBbHBoYW51bWVyaWNXb3JkIGV4dGVuZHMgTW92ZVRvTmV4dFdvcmRcbiAgQGV4dGVuZCgpXG4gIEBkZXNjcmlwdGlvbjogXCJNb3ZlIHRvIG5leHQgYWxwaGFudW1lcmljKGAvXFx3Ky9gKSB3b3JkXCJcbiAgd29yZFJlZ2V4OiAvXFx3Ky9nXG5cbmNsYXNzIE1vdmVUb1ByZXZpb3VzQWxwaGFudW1lcmljV29yZCBleHRlbmRzIE1vdmVUb1ByZXZpb3VzV29yZFxuICBAZXh0ZW5kKClcbiAgQGRlc2NyaXB0aW9uOiBcIk1vdmUgdG8gcHJldmlvdXMgYWxwaGFudW1lcmljKGAvXFx3Ky9gKSB3b3JkXCJcbiAgd29yZFJlZ2V4OiAvXFx3Ky9cblxuY2xhc3MgTW92ZVRvRW5kT2ZBbHBoYW51bWVyaWNXb3JkIGV4dGVuZHMgTW92ZVRvRW5kT2ZXb3JkXG4gIEBleHRlbmQoKVxuICBAZGVzY3JpcHRpb246IFwiTW92ZSB0byBlbmQgb2YgYWxwaGFudW1lcmljKGAvXFx3Ky9gKSB3b3JkXCJcbiAgd29yZFJlZ2V4OiAvXFx3Ky9cblxuIyBBbHBoYW51bWVyaWMgd29yZCBbRXhwZXJpbWVudGFsXVxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBNb3ZlVG9OZXh0U21hcnRXb3JkIGV4dGVuZHMgTW92ZVRvTmV4dFdvcmRcbiAgQGV4dGVuZCgpXG4gIEBkZXNjcmlwdGlvbjogXCJNb3ZlIHRvIG5leHQgc21hcnQgd29yZCAoYC9bXFx3LV0rL2ApIHdvcmRcIlxuICB3b3JkUmVnZXg6IC9bXFx3LV0rL2dcblxuY2xhc3MgTW92ZVRvUHJldmlvdXNTbWFydFdvcmQgZXh0ZW5kcyBNb3ZlVG9QcmV2aW91c1dvcmRcbiAgQGV4dGVuZCgpXG4gIEBkZXNjcmlwdGlvbjogXCJNb3ZlIHRvIHByZXZpb3VzIHNtYXJ0IHdvcmQgKGAvW1xcdy1dKy9gKSB3b3JkXCJcbiAgd29yZFJlZ2V4OiAvW1xcdy1dKy9cblxuY2xhc3MgTW92ZVRvRW5kT2ZTbWFydFdvcmQgZXh0ZW5kcyBNb3ZlVG9FbmRPZldvcmRcbiAgQGV4dGVuZCgpXG4gIEBkZXNjcmlwdGlvbjogXCJNb3ZlIHRvIGVuZCBvZiBzbWFydCB3b3JkIChgL1tcXHctXSsvYCkgd29yZFwiXG4gIHdvcmRSZWdleDogL1tcXHctXSsvXG5cbiMgU3Vid29yZFxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBNb3ZlVG9OZXh0U3Vid29yZCBleHRlbmRzIE1vdmVUb05leHRXb3JkXG4gIEBleHRlbmQoKVxuICBtb3ZlQ3Vyc29yOiAoY3Vyc29yKSAtPlxuICAgIEB3b3JkUmVnZXggPSBjdXJzb3Iuc3Vid29yZFJlZ0V4cCgpXG4gICAgc3VwZXJcblxuY2xhc3MgTW92ZVRvUHJldmlvdXNTdWJ3b3JkIGV4dGVuZHMgTW92ZVRvUHJldmlvdXNXb3JkXG4gIEBleHRlbmQoKVxuICBtb3ZlQ3Vyc29yOiAoY3Vyc29yKSAtPlxuICAgIEB3b3JkUmVnZXggPSBjdXJzb3Iuc3Vid29yZFJlZ0V4cCgpXG4gICAgc3VwZXJcblxuY2xhc3MgTW92ZVRvRW5kT2ZTdWJ3b3JkIGV4dGVuZHMgTW92ZVRvRW5kT2ZXb3JkXG4gIEBleHRlbmQoKVxuICBtb3ZlQ3Vyc29yOiAoY3Vyc29yKSAtPlxuICAgIEB3b3JkUmVnZXggPSBjdXJzb3Iuc3Vid29yZFJlZ0V4cCgpXG4gICAgc3VwZXJcblxuIyBTZW50ZW5jZVxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIFNlbnRlbmNlIGlzIGRlZmluZWQgYXMgYmVsb3dcbiMgIC0gZW5kIHdpdGggWycuJywgJyEnLCAnPyddXG4jICAtIG9wdGlvbmFsbHkgZm9sbG93ZWQgYnkgWycpJywgJ10nLCAnXCInLCBcIidcIl1cbiMgIC0gZm9sbG93ZWQgYnkgWyckJywgJyAnLCAnXFx0J11cbiMgIC0gcGFyYWdyYXBoIGJvdW5kYXJ5IGlzIGFsc28gc2VudGVuY2UgYm91bmRhcnlcbiMgIC0gc2VjdGlvbiBib3VuZGFyeSBpcyBhbHNvIHNlbnRlbmNlIGJvdW5kYXJ5KGlnbm9yZSlcbmNsYXNzIE1vdmVUb05leHRTZW50ZW5jZSBleHRlbmRzIE1vdGlvblxuICBAZXh0ZW5kKClcbiAganVtcDogdHJ1ZVxuICBzZW50ZW5jZVJlZ2V4OiAvLy8oPzpbXFwuIVxcP11bXFwpXFxdXCInXSpcXHMrKXwoXFxufFxcclxcbikvLy9nXG4gIGRpcmVjdGlvbjogJ25leHQnXG5cbiAgbW92ZUN1cnNvcjogKGN1cnNvcikgLT5cbiAgICBAbW92ZUN1cnNvckNvdW50VGltZXMgY3Vyc29yLCA9PlxuICAgICAgQHNldEJ1ZmZlclBvc2l0aW9uU2FmZWx5KGN1cnNvciwgQGdldFBvaW50KGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpKSlcblxuICBnZXRQb2ludDogKGZyb21Qb2ludCkgLT5cbiAgICBpZiBAZGlyZWN0aW9uIGlzICduZXh0J1xuICAgICAgQGdldE5leHRTdGFydE9mU2VudGVuY2UoZnJvbVBvaW50KVxuICAgIGVsc2UgaWYgQGRpcmVjdGlvbiBpcyAncHJldmlvdXMnXG4gICAgICBAZ2V0UHJldmlvdXNTdGFydE9mU2VudGVuY2UoZnJvbVBvaW50KVxuXG4gIGlzQmxhbmtSb3c6IChyb3cpIC0+XG4gICAgQGVkaXRvci5pc0J1ZmZlclJvd0JsYW5rKHJvdylcblxuICBnZXROZXh0U3RhcnRPZlNlbnRlbmNlOiAoZnJvbSkgLT5cbiAgICBmb3VuZFBvaW50ID0gbnVsbFxuICAgIEBzY2FuRm9yd2FyZCBAc2VudGVuY2VSZWdleCwge2Zyb219LCAoe3JhbmdlLCBtYXRjaFRleHQsIG1hdGNoLCBzdG9wfSkgPT5cbiAgICAgIGlmIG1hdGNoWzFdP1xuICAgICAgICBbc3RhcnRSb3csIGVuZFJvd10gPSBbcmFuZ2Uuc3RhcnQucm93LCByYW5nZS5lbmQucm93XVxuICAgICAgICByZXR1cm4gaWYgQHNraXBCbGFua1JvdyBhbmQgQGlzQmxhbmtSb3coZW5kUm93KVxuICAgICAgICBpZiBAaXNCbGFua1JvdyhzdGFydFJvdykgaXNudCBAaXNCbGFua1JvdyhlbmRSb3cpXG4gICAgICAgICAgZm91bmRQb2ludCA9IEBnZXRGaXJzdENoYXJhY3RlclBvc2l0aW9uRm9yQnVmZmVyUm93KGVuZFJvdylcbiAgICAgIGVsc2VcbiAgICAgICAgZm91bmRQb2ludCA9IHJhbmdlLmVuZFxuICAgICAgc3RvcCgpIGlmIGZvdW5kUG9pbnQ/XG4gICAgZm91bmRQb2ludCA/IEBnZXRWaW1Fb2ZCdWZmZXJQb3NpdGlvbigpXG5cbiAgZ2V0UHJldmlvdXNTdGFydE9mU2VudGVuY2U6IChmcm9tKSAtPlxuICAgIGZvdW5kUG9pbnQgPSBudWxsXG4gICAgQHNjYW5CYWNrd2FyZCBAc2VudGVuY2VSZWdleCwge2Zyb219LCAoe3JhbmdlLCBtYXRjaCwgc3RvcCwgbWF0Y2hUZXh0fSkgPT5cbiAgICAgIGlmIG1hdGNoWzFdP1xuICAgICAgICBbc3RhcnRSb3csIGVuZFJvd10gPSBbcmFuZ2Uuc3RhcnQucm93LCByYW5nZS5lbmQucm93XVxuICAgICAgICBpZiBub3QgQGlzQmxhbmtSb3coZW5kUm93KSBhbmQgQGlzQmxhbmtSb3coc3RhcnRSb3cpXG4gICAgICAgICAgcG9pbnQgPSBAZ2V0Rmlyc3RDaGFyYWN0ZXJQb3NpdGlvbkZvckJ1ZmZlclJvdyhlbmRSb3cpXG4gICAgICAgICAgaWYgcG9pbnQuaXNMZXNzVGhhbihmcm9tKVxuICAgICAgICAgICAgZm91bmRQb2ludCA9IHBvaW50XG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmV0dXJuIGlmIEBza2lwQmxhbmtSb3dcbiAgICAgICAgICAgIGZvdW5kUG9pbnQgPSBAZ2V0Rmlyc3RDaGFyYWN0ZXJQb3NpdGlvbkZvckJ1ZmZlclJvdyhzdGFydFJvdylcbiAgICAgIGVsc2VcbiAgICAgICAgaWYgcmFuZ2UuZW5kLmlzTGVzc1RoYW4oZnJvbSlcbiAgICAgICAgICBmb3VuZFBvaW50ID0gcmFuZ2UuZW5kXG4gICAgICBzdG9wKCkgaWYgZm91bmRQb2ludD9cbiAgICBmb3VuZFBvaW50ID8gWzAsIDBdXG5cbmNsYXNzIE1vdmVUb1ByZXZpb3VzU2VudGVuY2UgZXh0ZW5kcyBNb3ZlVG9OZXh0U2VudGVuY2VcbiAgQGV4dGVuZCgpXG4gIGRpcmVjdGlvbjogJ3ByZXZpb3VzJ1xuXG5jbGFzcyBNb3ZlVG9OZXh0U2VudGVuY2VTa2lwQmxhbmtSb3cgZXh0ZW5kcyBNb3ZlVG9OZXh0U2VudGVuY2VcbiAgQGV4dGVuZCgpXG4gIHNraXBCbGFua1JvdzogdHJ1ZVxuXG5jbGFzcyBNb3ZlVG9QcmV2aW91c1NlbnRlbmNlU2tpcEJsYW5rUm93IGV4dGVuZHMgTW92ZVRvUHJldmlvdXNTZW50ZW5jZVxuICBAZXh0ZW5kKClcbiAgc2tpcEJsYW5rUm93OiB0cnVlXG5cbiMgUGFyYWdyYXBoXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIE1vdmVUb05leHRQYXJhZ3JhcGggZXh0ZW5kcyBNb3Rpb25cbiAgQGV4dGVuZCgpXG4gIGp1bXA6IHRydWVcbiAgZGlyZWN0aW9uOiAnbmV4dCdcblxuICBtb3ZlQ3Vyc29yOiAoY3Vyc29yKSAtPlxuICAgIEBtb3ZlQ3Vyc29yQ291bnRUaW1lcyBjdXJzb3IsID0+XG4gICAgICBAc2V0QnVmZmVyUG9zaXRpb25TYWZlbHkoY3Vyc29yLCBAZ2V0UG9pbnQoY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKCkpKVxuXG4gIGdldFBvaW50OiAoZnJvbVBvaW50KSAtPlxuICAgIHN0YXJ0Um93ID0gZnJvbVBvaW50LnJvd1xuICAgIHdhc0F0Tm9uQmxhbmtSb3cgPSBub3QgQGVkaXRvci5pc0J1ZmZlclJvd0JsYW5rKHN0YXJ0Um93KVxuICAgIGZvciByb3cgaW4gZ2V0QnVmZmVyUm93cyhAZWRpdG9yLCB7c3RhcnRSb3csIEBkaXJlY3Rpb259KVxuICAgICAgaWYgQGVkaXRvci5pc0J1ZmZlclJvd0JsYW5rKHJvdylcbiAgICAgICAgcmV0dXJuIG5ldyBQb2ludChyb3csIDApIGlmIHdhc0F0Tm9uQmxhbmtSb3dcbiAgICAgIGVsc2VcbiAgICAgICAgd2FzQXROb25CbGFua1JvdyA9IHRydWVcblxuICAgICMgZmFsbGJhY2tcbiAgICBzd2l0Y2ggQGRpcmVjdGlvblxuICAgICAgd2hlbiAncHJldmlvdXMnIHRoZW4gbmV3IFBvaW50KDAsIDApXG4gICAgICB3aGVuICduZXh0JyB0aGVuIEBnZXRWaW1Fb2ZCdWZmZXJQb3NpdGlvbigpXG5cbmNsYXNzIE1vdmVUb1ByZXZpb3VzUGFyYWdyYXBoIGV4dGVuZHMgTW92ZVRvTmV4dFBhcmFncmFwaFxuICBAZXh0ZW5kKClcbiAgZGlyZWN0aW9uOiAncHJldmlvdXMnXG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgTW92ZVRvQmVnaW5uaW5nT2ZMaW5lIGV4dGVuZHMgTW90aW9uXG4gIEBleHRlbmQoKVxuXG4gIG1vdmVDdXJzb3I6IChjdXJzb3IpIC0+XG4gICAgc2V0QnVmZmVyQ29sdW1uKGN1cnNvciwgMClcblxuY2xhc3MgTW92ZVRvQ29sdW1uIGV4dGVuZHMgTW90aW9uXG4gIEBleHRlbmQoKVxuXG4gIG1vdmVDdXJzb3I6IChjdXJzb3IpIC0+XG4gICAgc2V0QnVmZmVyQ29sdW1uKGN1cnNvciwgQGdldENvdW50KC0xKSlcblxuY2xhc3MgTW92ZVRvTGFzdENoYXJhY3Rlck9mTGluZSBleHRlbmRzIE1vdGlvblxuICBAZXh0ZW5kKClcblxuICBtb3ZlQ3Vyc29yOiAoY3Vyc29yKSAtPlxuICAgIHJvdyA9IGdldFZhbGlkVmltQnVmZmVyUm93KEBlZGl0b3IsIGN1cnNvci5nZXRCdWZmZXJSb3coKSArIEBnZXRDb3VudCgtMSkpXG4gICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKFtyb3csIEluZmluaXR5XSlcbiAgICBjdXJzb3IuZ29hbENvbHVtbiA9IEluZmluaXR5XG5cbmNsYXNzIE1vdmVUb0xhc3ROb25ibGFua0NoYXJhY3Rlck9mTGluZUFuZERvd24gZXh0ZW5kcyBNb3Rpb25cbiAgQGV4dGVuZCgpXG4gIGluY2x1c2l2ZTogdHJ1ZVxuXG4gIG1vdmVDdXJzb3I6IChjdXJzb3IpIC0+XG4gICAgcG9pbnQgPSBAZ2V0UG9pbnQoY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKCkpXG4gICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHBvaW50KVxuXG4gIGdldFBvaW50OiAoe3Jvd30pIC0+XG4gICAgcm93ID0gbGltaXROdW1iZXIocm93ICsgQGdldENvdW50KC0xKSwgbWF4OiBAZ2V0VmltTGFzdEJ1ZmZlclJvdygpKVxuICAgIHJhbmdlID0gZmluZFJhbmdlSW5CdWZmZXJSb3coQGVkaXRvciwgL1xcU3xeLywgcm93LCBkaXJlY3Rpb246ICdiYWNrd2FyZCcpXG4gICAgcmFuZ2U/LnN0YXJ0ID8gbmV3IFBvaW50KHJvdywgMClcblxuIyBNb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZSBmYWltaWx5XG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgTW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmUgZXh0ZW5kcyBNb3Rpb25cbiAgQGV4dGVuZCgpXG4gIG1vdmVDdXJzb3I6IChjdXJzb3IpIC0+XG4gICAgcG9pbnQgPSBAZ2V0Rmlyc3RDaGFyYWN0ZXJQb3NpdGlvbkZvckJ1ZmZlclJvdyhjdXJzb3IuZ2V0QnVmZmVyUm93KCkpXG4gICAgQHNldEJ1ZmZlclBvc2l0aW9uU2FmZWx5KGN1cnNvciwgcG9pbnQpXG5cbmNsYXNzIE1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lVXAgZXh0ZW5kcyBNb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZVxuICBAZXh0ZW5kKClcbiAgd2lzZTogJ2xpbmV3aXNlJ1xuICBtb3ZlQ3Vyc29yOiAoY3Vyc29yKSAtPlxuICAgIEBtb3ZlQ3Vyc29yQ291bnRUaW1lcyBjdXJzb3IsIC0+XG4gICAgICBtb3ZlQ3Vyc29yVXBCdWZmZXIoY3Vyc29yKVxuICAgIHN1cGVyXG5cbmNsYXNzIE1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lRG93biBleHRlbmRzIE1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lXG4gIEBleHRlbmQoKVxuICB3aXNlOiAnbGluZXdpc2UnXG4gIG1vdmVDdXJzb3I6IChjdXJzb3IpIC0+XG4gICAgQG1vdmVDdXJzb3JDb3VudFRpbWVzIGN1cnNvciwgLT5cbiAgICAgIG1vdmVDdXJzb3JEb3duQnVmZmVyKGN1cnNvcilcbiAgICBzdXBlclxuXG5jbGFzcyBNb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZUFuZERvd24gZXh0ZW5kcyBNb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZURvd25cbiAgQGV4dGVuZCgpXG4gIGRlZmF1bHRDb3VudDogMFxuICBnZXRDb3VudDogLT4gc3VwZXIgLSAxXG5cbiMga2V5bWFwOiBnIGdcbmNsYXNzIE1vdmVUb0ZpcnN0TGluZSBleHRlbmRzIE1vdGlvblxuICBAZXh0ZW5kKClcbiAgd2lzZTogJ2xpbmV3aXNlJ1xuICBqdW1wOiB0cnVlXG4gIHZlcnRpY2FsTW90aW9uOiB0cnVlXG5cbiAgbW92ZUN1cnNvcjogKGN1cnNvcikgLT5cbiAgICBAc2V0Q3Vyc29yQnVmZmVSb3coY3Vyc29yLCBnZXRWYWxpZFZpbUJ1ZmZlclJvdyhAZWRpdG9yLCBAZ2V0Um93KCkpKVxuICAgIGN1cnNvci5hdXRvc2Nyb2xsKGNlbnRlcjogdHJ1ZSlcblxuICBnZXRSb3c6IC0+XG4gICAgQGdldENvdW50KC0xKVxuXG4jIGtleW1hcDogR1xuY2xhc3MgTW92ZVRvTGFzdExpbmUgZXh0ZW5kcyBNb3ZlVG9GaXJzdExpbmVcbiAgQGV4dGVuZCgpXG4gIGRlZmF1bHRDb3VudDogSW5maW5pdHlcblxuIyBrZXltYXA6IE4lIGUuZy4gMTAlXG5jbGFzcyBNb3ZlVG9MaW5lQnlQZXJjZW50IGV4dGVuZHMgTW92ZVRvRmlyc3RMaW5lXG4gIEBleHRlbmQoKVxuXG4gIGdldFJvdzogLT5cbiAgICBwZXJjZW50ID0gbGltaXROdW1iZXIoQGdldENvdW50KCksIG1heDogMTAwKVxuICAgIE1hdGguZmxvb3IoKEBlZGl0b3IuZ2V0TGluZUNvdW50KCkgLSAxKSAqIChwZXJjZW50IC8gMTAwKSlcblxuY2xhc3MgTW92ZVRvUmVsYXRpdmVMaW5lIGV4dGVuZHMgTW90aW9uXG4gIEBleHRlbmQoZmFsc2UpXG4gIHdpc2U6ICdsaW5ld2lzZSdcblxuICBtb3ZlQ3Vyc29yOiAoY3Vyc29yKSAtPlxuICAgIHNldEJ1ZmZlclJvdyhjdXJzb3IsIGN1cnNvci5nZXRCdWZmZXJSb3coKSArIEBnZXRDb3VudCgtMSkpXG5cbmNsYXNzIE1vdmVUb1JlbGF0aXZlTGluZU1pbmltdW1PbmUgZXh0ZW5kcyBNb3ZlVG9SZWxhdGl2ZUxpbmVcbiAgQGV4dGVuZChmYWxzZSlcblxuICBnZXRDb3VudDogLT5cbiAgICBsaW1pdE51bWJlcihzdXBlciwgbWluOiAxKVxuXG4jIFBvc2l0aW9uIGN1cnNvciB3aXRob3V0IHNjcm9sbGluZy4sIEgsIE0sIExcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBrZXltYXA6IEhcbmNsYXNzIE1vdmVUb1RvcE9mU2NyZWVuIGV4dGVuZHMgTW90aW9uXG4gIEBleHRlbmQoKVxuICB3aXNlOiAnbGluZXdpc2UnXG4gIGp1bXA6IHRydWVcbiAgc2Nyb2xsb2ZmOiAyXG4gIGRlZmF1bHRDb3VudDogMFxuICB2ZXJ0aWNhbE1vdGlvbjogdHJ1ZVxuXG4gIG1vdmVDdXJzb3I6IChjdXJzb3IpIC0+XG4gICAgYnVmZmVyUm93ID0gQGVkaXRvci5idWZmZXJSb3dGb3JTY3JlZW5Sb3coQGdldFNjcmVlblJvdygpKVxuICAgIEBzZXRDdXJzb3JCdWZmZVJvdyhjdXJzb3IsIGJ1ZmZlclJvdylcblxuICBnZXRTY3JvbGxvZmY6IC0+XG4gICAgaWYgQGlzQXNPcGVyYXRvclRhcmdldCgpXG4gICAgICAwXG4gICAgZWxzZVxuICAgICAgQHNjcm9sbG9mZlxuXG4gIGdldFNjcmVlblJvdzogLT5cbiAgICBmaXJzdFJvdyA9IGdldEZpcnN0VmlzaWJsZVNjcmVlblJvdyhAZWRpdG9yKVxuICAgIG9mZnNldCA9IEBnZXRTY3JvbGxvZmYoKVxuICAgIG9mZnNldCA9IDAgaWYgZmlyc3RSb3cgaXMgMFxuICAgIG9mZnNldCA9IGxpbWl0TnVtYmVyKEBnZXRDb3VudCgtMSksIG1pbjogb2Zmc2V0KVxuICAgIGZpcnN0Um93ICsgb2Zmc2V0XG5cbiMga2V5bWFwOiBNXG5jbGFzcyBNb3ZlVG9NaWRkbGVPZlNjcmVlbiBleHRlbmRzIE1vdmVUb1RvcE9mU2NyZWVuXG4gIEBleHRlbmQoKVxuICBnZXRTY3JlZW5Sb3c6IC0+XG4gICAgc3RhcnRSb3cgPSBnZXRGaXJzdFZpc2libGVTY3JlZW5Sb3coQGVkaXRvcilcbiAgICBlbmRSb3cgPSBsaW1pdE51bWJlcihAZWRpdG9yLmdldExhc3RWaXNpYmxlU2NyZWVuUm93KCksIG1heDogQGdldFZpbUxhc3RTY3JlZW5Sb3coKSlcbiAgICBzdGFydFJvdyArIE1hdGguZmxvb3IoKGVuZFJvdyAtIHN0YXJ0Um93KSAvIDIpXG5cbiMga2V5bWFwOiBMXG5jbGFzcyBNb3ZlVG9Cb3R0b21PZlNjcmVlbiBleHRlbmRzIE1vdmVUb1RvcE9mU2NyZWVuXG4gIEBleHRlbmQoKVxuICBnZXRTY3JlZW5Sb3c6IC0+XG4gICAgIyBbRklYTUVdXG4gICAgIyBBdCBsZWFzdCBBdG9tIHYxLjYuMCwgdGhlcmUgYXJlIHR3byBpbXBsZW1lbnRhdGlvbiBvZiBnZXRMYXN0VmlzaWJsZVNjcmVlblJvdygpXG4gICAgIyBlZGl0b3IuZ2V0TGFzdFZpc2libGVTY3JlZW5Sb3coKSBhbmQgZWRpdG9yRWxlbWVudC5nZXRMYXN0VmlzaWJsZVNjcmVlblJvdygpXG4gICAgIyBUaG9zZSB0d28gbWV0aG9kcyByZXR1cm4gZGlmZmVyZW50IHZhbHVlLCBlZGl0b3IncyBvbmUgaXMgY29ycmVudC5cbiAgICAjIFNvIEkgaW50ZW50aW9uYWxseSB1c2UgZWRpdG9yLmdldExhc3RTY3JlZW5Sb3cgaGVyZS5cbiAgICB2aW1MYXN0U2NyZWVuUm93ID0gQGdldFZpbUxhc3RTY3JlZW5Sb3coKVxuICAgIHJvdyA9IGxpbWl0TnVtYmVyKEBlZGl0b3IuZ2V0TGFzdFZpc2libGVTY3JlZW5Sb3coKSwgbWF4OiB2aW1MYXN0U2NyZWVuUm93KVxuICAgIG9mZnNldCA9IEBnZXRTY3JvbGxvZmYoKSArIDFcbiAgICBvZmZzZXQgPSAwIGlmIHJvdyBpcyB2aW1MYXN0U2NyZWVuUm93XG4gICAgb2Zmc2V0ID0gbGltaXROdW1iZXIoQGdldENvdW50KC0xKSwgbWluOiBvZmZzZXQpXG4gICAgcm93IC0gb2Zmc2V0XG5cbiMgU2Nyb2xsaW5nXG4jIEhhbGY6IGN0cmwtZCwgY3RybC11XG4jIEZ1bGw6IGN0cmwtZiwgY3RybC1iXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgW0ZJWE1FXSBjb3VudCBiZWhhdmUgZGlmZmVyZW50bHkgZnJvbSBvcmlnaW5hbCBWaW0uXG5jbGFzcyBTY3JvbGwgZXh0ZW5kcyBNb3Rpb25cbiAgQGV4dGVuZChmYWxzZSlcbiAgdmVydGljYWxNb3Rpb246IHRydWVcblxuICBpc1Ntb290aFNjcm9sbEVuYWJsZWQ6IC0+XG4gICAgaWYgTWF0aC5hYnMoQGFtb3VudE9mUGFnZSkgaXMgMVxuICAgICAgc2V0dGluZ3MuZ2V0KCdzbW9vdGhTY3JvbGxPbkZ1bGxTY3JvbGxNb3Rpb24nKVxuICAgIGVsc2VcbiAgICAgIHNldHRpbmdzLmdldCgnc21vb3RoU2Nyb2xsT25IYWxmU2Nyb2xsTW90aW9uJylcblxuICBnZXRTbW9vdGhTY3JvbGxEdWF0aW9uOiAtPlxuICAgIGlmIE1hdGguYWJzKEBhbW91bnRPZlBhZ2UpIGlzIDFcbiAgICAgIHNldHRpbmdzLmdldCgnc21vb3RoU2Nyb2xsT25GdWxsU2Nyb2xsTW90aW9uRHVyYXRpb24nKVxuICAgIGVsc2VcbiAgICAgIHNldHRpbmdzLmdldCgnc21vb3RoU2Nyb2xsT25IYWxmU2Nyb2xsTW90aW9uRHVyYXRpb24nKVxuXG4gIGdldFBpeGVsUmVjdFRvcEZvclNjZWVuUm93OiAocm93KSAtPlxuICAgIHBvaW50ID0gbmV3IFBvaW50KHJvdywgMClcbiAgICBAZWRpdG9yLmVsZW1lbnQucGl4ZWxSZWN0Rm9yU2NyZWVuUmFuZ2UobmV3IFJhbmdlKHBvaW50LCBwb2ludCkpLnRvcFxuXG4gIHNtb290aFNjcm9sbDogKGZyb21Sb3csIHRvUm93LCBvcHRpb25zPXt9KSAtPlxuICAgIHRvcFBpeGVsRnJvbSA9IHt0b3A6IEBnZXRQaXhlbFJlY3RUb3BGb3JTY2VlblJvdyhmcm9tUm93KX1cbiAgICB0b3BQaXhlbFRvID0ge3RvcDogQGdldFBpeGVsUmVjdFRvcEZvclNjZWVuUm93KHRvUm93KX1cbiAgICBvcHRpb25zLnN0ZXAgPSAobmV3VG9wKSA9PiBAZWRpdG9yLmVsZW1lbnQuc2V0U2Nyb2xsVG9wKG5ld1RvcClcbiAgICBvcHRpb25zLmR1cmF0aW9uID0gQGdldFNtb290aFNjcm9sbER1YXRpb24oKVxuICAgIEB2aW1TdGF0ZS5yZXF1ZXN0U2Nyb2xsQW5pbWF0aW9uKHRvcFBpeGVsRnJvbSwgdG9wUGl4ZWxUbywgb3B0aW9ucylcblxuICBnZXRBbW91bnRPZlJvd3M6IC0+XG4gICAgTWF0aC5jZWlsKEBhbW91bnRPZlBhZ2UgKiBAZWRpdG9yLmdldFJvd3NQZXJQYWdlKCkgKiBAZ2V0Q291bnQoKSlcblxuICBnZXRCdWZmZXJSb3c6IChjdXJzb3IpIC0+XG4gICAgc2NyZWVuUm93ID0gZ2V0VmFsaWRWaW1TY3JlZW5Sb3coQGVkaXRvciwgY3Vyc29yLmdldFNjcmVlblJvdygpICsgQGdldEFtb3VudE9mUm93cygpKVxuICAgIEBlZGl0b3IuYnVmZmVyUm93Rm9yU2NyZWVuUm93KHNjcmVlblJvdylcblxuICBtb3ZlQ3Vyc29yOiAoY3Vyc29yKSAtPlxuICAgIGJ1ZmZlclJvdyA9IEBnZXRCdWZmZXJSb3coY3Vyc29yKVxuICAgIEBzZXRDdXJzb3JCdWZmZVJvdyhjdXJzb3IsIEBnZXRCdWZmZXJSb3coY3Vyc29yKSwgYXV0b3Njcm9sbDogZmFsc2UpXG5cbiAgICBpZiBjdXJzb3IuaXNMYXN0Q3Vyc29yKClcbiAgICAgIGlmIEBpc1Ntb290aFNjcm9sbEVuYWJsZWQoKVxuICAgICAgICBAdmltU3RhdGUuZmluaXNoU2Nyb2xsQW5pbWF0aW9uKClcblxuICAgICAgZmlyc3RWaXNpYmlsZVNjcmVlblJvdyA9IEBlZGl0b3IuZ2V0Rmlyc3RWaXNpYmxlU2NyZWVuUm93KClcbiAgICAgIG5ld0ZpcnN0VmlzaWJpbGVCdWZmZXJSb3cgPSBAZWRpdG9yLmJ1ZmZlclJvd0ZvclNjcmVlblJvdyhmaXJzdFZpc2liaWxlU2NyZWVuUm93ICsgQGdldEFtb3VudE9mUm93cygpKVxuICAgICAgbmV3Rmlyc3RWaXNpYmlsZVNjcmVlblJvdyA9IEBlZGl0b3Iuc2NyZWVuUm93Rm9yQnVmZmVyUm93KG5ld0ZpcnN0VmlzaWJpbGVCdWZmZXJSb3cpXG4gICAgICBkb25lID0gPT5cbiAgICAgICAgQGVkaXRvci5zZXRGaXJzdFZpc2libGVTY3JlZW5Sb3cobmV3Rmlyc3RWaXNpYmlsZVNjcmVlblJvdylcbiAgICAgICAgIyBbRklYTUVdIHNvbWV0aW1lcywgc2Nyb2xsVG9wIGlzIG5vdCB1cGRhdGVkLCBjYWxsaW5nIHRoaXMgZml4LlxuICAgICAgICAjIEludmVzdGlnYXRlIGFuZCBmaW5kIGJldHRlciBhcHByb2FjaCB0aGVuIHJlbW92ZSB0aGlzIHdvcmthcm91bmQuXG4gICAgICAgIEBlZGl0b3IuZWxlbWVudC5jb21wb25lbnQudXBkYXRlU3luYygpXG5cbiAgICAgIGlmIEBpc1Ntb290aFNjcm9sbEVuYWJsZWQoKVxuICAgICAgICBAc21vb3RoU2Nyb2xsKGZpcnN0VmlzaWJpbGVTY3JlZW5Sb3csIG5ld0ZpcnN0VmlzaWJpbGVTY3JlZW5Sb3csIHtkb25lfSlcbiAgICAgIGVsc2VcbiAgICAgICAgZG9uZSgpXG5cblxuIyBrZXltYXA6IGN0cmwtZlxuY2xhc3MgU2Nyb2xsRnVsbFNjcmVlbkRvd24gZXh0ZW5kcyBTY3JvbGxcbiAgQGV4dGVuZCh0cnVlKVxuICBhbW91bnRPZlBhZ2U6ICsxXG5cbiMga2V5bWFwOiBjdHJsLWJcbmNsYXNzIFNjcm9sbEZ1bGxTY3JlZW5VcCBleHRlbmRzIFNjcm9sbFxuICBAZXh0ZW5kKClcbiAgYW1vdW50T2ZQYWdlOiAtMVxuXG4jIGtleW1hcDogY3RybC1kXG5jbGFzcyBTY3JvbGxIYWxmU2NyZWVuRG93biBleHRlbmRzIFNjcm9sbFxuICBAZXh0ZW5kKClcbiAgYW1vdW50T2ZQYWdlOiArMSAvIDJcblxuIyBrZXltYXA6IGN0cmwtdVxuY2xhc3MgU2Nyb2xsSGFsZlNjcmVlblVwIGV4dGVuZHMgU2Nyb2xsXG4gIEBleHRlbmQoKVxuICBhbW91bnRPZlBhZ2U6IC0xIC8gMlxuXG4jIEZpbmRcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBrZXltYXA6IGZcbmNsYXNzIEZpbmQgZXh0ZW5kcyBNb3Rpb25cbiAgQGV4dGVuZCgpXG4gIGJhY2t3YXJkczogZmFsc2VcbiAgaW5jbHVzaXZlOiB0cnVlXG4gIG9mZnNldDogMFxuICByZXF1aXJlSW5wdXQ6IHRydWVcblxuICBpbml0aWFsaXplOiAtPlxuICAgIHN1cGVyXG4gICAgQGZvY3VzSW5wdXQoKSB1bmxlc3MgQGlzQ29tcGxldGUoKVxuXG4gIGlzQmFja3dhcmRzOiAtPlxuICAgIEBiYWNrd2FyZHNcblxuICBnZXRQb2ludDogKGZyb21Qb2ludCkgLT5cbiAgICB7c3RhcnQsIGVuZH0gPSBAZWRpdG9yLmJ1ZmZlclJhbmdlRm9yQnVmZmVyUm93KGZyb21Qb2ludC5yb3cpXG5cbiAgICBvZmZzZXQgPSBpZiBAaXNCYWNrd2FyZHMoKSB0aGVuIEBvZmZzZXQgZWxzZSAtQG9mZnNldFxuICAgIHVuT2Zmc2V0ID0gLW9mZnNldCAqIEBpc1JlcGVhdGVkKClcbiAgICBpZiBAaXNCYWNrd2FyZHMoKVxuICAgICAgc2NhblJhbmdlID0gW3N0YXJ0LCBmcm9tUG9pbnQudHJhbnNsYXRlKFswLCB1bk9mZnNldF0pXVxuICAgICAgbWV0aG9kID0gJ2JhY2t3YXJkc1NjYW5JbkJ1ZmZlclJhbmdlJ1xuICAgIGVsc2VcbiAgICAgIHNjYW5SYW5nZSA9IFtmcm9tUG9pbnQudHJhbnNsYXRlKFswLCAxICsgdW5PZmZzZXRdKSwgZW5kXVxuICAgICAgbWV0aG9kID0gJ3NjYW5JbkJ1ZmZlclJhbmdlJ1xuXG4gICAgcG9pbnRzID0gW11cbiAgICBAZWRpdG9yW21ldGhvZF0gLy8vI3tfLmVzY2FwZVJlZ0V4cChAaW5wdXQpfS8vL2csIHNjYW5SYW5nZSwgKHtyYW5nZX0pIC0+XG4gICAgICBwb2ludHMucHVzaChyYW5nZS5zdGFydClcbiAgICBwb2ludHNbQGdldENvdW50KC0xKV0/LnRyYW5zbGF0ZShbMCwgb2Zmc2V0XSlcblxuICBtb3ZlQ3Vyc29yOiAoY3Vyc29yKSAtPlxuICAgIHBvaW50ID0gQGdldFBvaW50KGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpKVxuICAgIEBzZXRCdWZmZXJQb3NpdGlvblNhZmVseShjdXJzb3IsIHBvaW50KVxuICAgIEBnbG9iYWxTdGF0ZS5zZXQoJ2N1cnJlbnRGaW5kJywgdGhpcykgdW5sZXNzIEBpc1JlcGVhdGVkKClcblxuIyBrZXltYXA6IEZcbmNsYXNzIEZpbmRCYWNrd2FyZHMgZXh0ZW5kcyBGaW5kXG4gIEBleHRlbmQoKVxuICBpbmNsdXNpdmU6IGZhbHNlXG4gIGJhY2t3YXJkczogdHJ1ZVxuXG4jIGtleW1hcDogdFxuY2xhc3MgVGlsbCBleHRlbmRzIEZpbmRcbiAgQGV4dGVuZCgpXG4gIG9mZnNldDogMVxuXG4gIGdldFBvaW50OiAtPlxuICAgIEBwb2ludCA9IHN1cGVyXG5cbiAgc2VsZWN0QnlNb3Rpb246IChzZWxlY3Rpb24pIC0+XG4gICAgc3VwZXJcbiAgICBpZiBzZWxlY3Rpb24uaXNFbXB0eSgpIGFuZCAoQHBvaW50PyBhbmQgbm90IEBiYWNrd2FyZHMpXG4gICAgICBzd3JhcChzZWxlY3Rpb24pLnRyYW5zbGF0ZVNlbGVjdGlvbkVuZEFuZENsaXAoJ2ZvcndhcmQnKVxuXG4jIGtleW1hcDogVFxuY2xhc3MgVGlsbEJhY2t3YXJkcyBleHRlbmRzIFRpbGxcbiAgQGV4dGVuZCgpXG4gIGluY2x1c2l2ZTogZmFsc2VcbiAgYmFja3dhcmRzOiB0cnVlXG5cbiMgTWFya1xuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIGtleW1hcDogYFxuY2xhc3MgTW92ZVRvTWFyayBleHRlbmRzIE1vdGlvblxuICBAZXh0ZW5kKClcbiAganVtcDogdHJ1ZVxuICByZXF1aXJlSW5wdXQ6IHRydWVcbiAgaW5wdXQ6IG51bGwgIyBzZXQgd2hlbiBpbnN0YXRudGlhdGVkIHZpYSB2aW1TdGF0ZTo6bW92ZVRvTWFyaygpXG5cbiAgaW5pdGlhbGl6ZTogLT5cbiAgICBzdXBlclxuICAgIEBmb2N1c0lucHV0KCkgdW5sZXNzIEBpc0NvbXBsZXRlKClcblxuICBnZXRQb2ludDogLT5cbiAgICBAdmltU3RhdGUubWFyay5nZXQoQGdldElucHV0KCkpXG5cbiAgbW92ZUN1cnNvcjogKGN1cnNvcikgLT5cbiAgICBpZiBwb2ludCA9IEBnZXRQb2ludCgpXG4gICAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24ocG9pbnQpXG4gICAgICBjdXJzb3IuYXV0b3Njcm9sbChjZW50ZXI6IHRydWUpXG5cbiMga2V5bWFwOiAnXG5jbGFzcyBNb3ZlVG9NYXJrTGluZSBleHRlbmRzIE1vdmVUb01hcmtcbiAgQGV4dGVuZCgpXG4gIHdpc2U6ICdsaW5ld2lzZSdcblxuICBnZXRQb2ludDogLT5cbiAgICBpZiBwb2ludCA9IHN1cGVyXG4gICAgICBAZ2V0Rmlyc3RDaGFyYWN0ZXJQb3NpdGlvbkZvckJ1ZmZlclJvdyhwb2ludC5yb3cpXG5cbiMgRm9sZFxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBNb3ZlVG9QcmV2aW91c0ZvbGRTdGFydCBleHRlbmRzIE1vdGlvblxuICBAZXh0ZW5kKClcbiAgQGRlc2NyaXB0aW9uOiBcIk1vdmUgdG8gcHJldmlvdXMgZm9sZCBzdGFydFwiXG4gIHdpc2U6ICdjaGFyYWN0ZXJ3aXNlJ1xuICB3aGljaDogJ3N0YXJ0J1xuICBkaXJlY3Rpb246ICdwcmV2J1xuXG4gIGluaXRpYWxpemU6IC0+XG4gICAgc3VwZXJcbiAgICBAcm93cyA9IEBnZXRGb2xkUm93cyhAd2hpY2gpXG4gICAgQHJvd3MucmV2ZXJzZSgpIGlmIEBkaXJlY3Rpb24gaXMgJ3ByZXYnXG5cbiAgZ2V0Rm9sZFJvd3M6ICh3aGljaCkgLT5cbiAgICBpbmRleCA9IGlmIHdoaWNoIGlzICdzdGFydCcgdGhlbiAwIGVsc2UgMVxuICAgIHJvd3MgPSBnZXRDb2RlRm9sZFJvd1JhbmdlcyhAZWRpdG9yKS5tYXAgKHJvd1JhbmdlKSAtPlxuICAgICAgcm93UmFuZ2VbaW5kZXhdXG4gICAgXy5zb3J0QnkoXy51bmlxKHJvd3MpLCAocm93KSAtPiByb3cpXG5cbiAgZ2V0U2NhblJvd3M6IChjdXJzb3IpIC0+XG4gICAgY3Vyc29yUm93ID0gY3Vyc29yLmdldEJ1ZmZlclJvdygpXG4gICAgaXNWYWxpZFJvdyA9IHN3aXRjaCBAZGlyZWN0aW9uXG4gICAgICB3aGVuICdwcmV2JyB0aGVuIChyb3cpIC0+IHJvdyA8IGN1cnNvclJvd1xuICAgICAgd2hlbiAnbmV4dCcgdGhlbiAocm93KSAtPiByb3cgPiBjdXJzb3JSb3dcbiAgICBAcm93cy5maWx0ZXIoaXNWYWxpZFJvdylcblxuICBkZXRlY3RSb3c6IChjdXJzb3IpIC0+XG4gICAgQGdldFNjYW5Sb3dzKGN1cnNvcilbMF1cblxuICBtb3ZlQ3Vyc29yOiAoY3Vyc29yKSAtPlxuICAgIEBtb3ZlQ3Vyc29yQ291bnRUaW1lcyBjdXJzb3IsID0+XG4gICAgICBpZiAocm93ID0gQGRldGVjdFJvdyhjdXJzb3IpKT9cbiAgICAgICAgbW92ZUN1cnNvclRvRmlyc3RDaGFyYWN0ZXJBdFJvdyhjdXJzb3IsIHJvdylcblxuY2xhc3MgTW92ZVRvTmV4dEZvbGRTdGFydCBleHRlbmRzIE1vdmVUb1ByZXZpb3VzRm9sZFN0YXJ0XG4gIEBleHRlbmQoKVxuICBAZGVzY3JpcHRpb246IFwiTW92ZSB0byBuZXh0IGZvbGQgc3RhcnRcIlxuICBkaXJlY3Rpb246ICduZXh0J1xuXG5jbGFzcyBNb3ZlVG9QcmV2aW91c0ZvbGRTdGFydFdpdGhTYW1lSW5kZW50IGV4dGVuZHMgTW92ZVRvUHJldmlvdXNGb2xkU3RhcnRcbiAgQGV4dGVuZCgpXG4gIEBkZXNjcmlwdGlvbjogXCJNb3ZlIHRvIHByZXZpb3VzIHNhbWUtaW5kZW50ZWQgZm9sZCBzdGFydFwiXG4gIGRldGVjdFJvdzogKGN1cnNvcikgLT5cbiAgICBiYXNlSW5kZW50TGV2ZWwgPSBnZXRJbmRlbnRMZXZlbEZvckJ1ZmZlclJvdyhAZWRpdG9yLCBjdXJzb3IuZ2V0QnVmZmVyUm93KCkpXG4gICAgZm9yIHJvdyBpbiBAZ2V0U2NhblJvd3MoY3Vyc29yKVxuICAgICAgaWYgZ2V0SW5kZW50TGV2ZWxGb3JCdWZmZXJSb3coQGVkaXRvciwgcm93KSBpcyBiYXNlSW5kZW50TGV2ZWxcbiAgICAgICAgcmV0dXJuIHJvd1xuICAgIG51bGxcblxuY2xhc3MgTW92ZVRvTmV4dEZvbGRTdGFydFdpdGhTYW1lSW5kZW50IGV4dGVuZHMgTW92ZVRvUHJldmlvdXNGb2xkU3RhcnRXaXRoU2FtZUluZGVudFxuICBAZXh0ZW5kKClcbiAgQGRlc2NyaXB0aW9uOiBcIk1vdmUgdG8gbmV4dCBzYW1lLWluZGVudGVkIGZvbGQgc3RhcnRcIlxuICBkaXJlY3Rpb246ICduZXh0J1xuXG5jbGFzcyBNb3ZlVG9QcmV2aW91c0ZvbGRFbmQgZXh0ZW5kcyBNb3ZlVG9QcmV2aW91c0ZvbGRTdGFydFxuICBAZXh0ZW5kKClcbiAgQGRlc2NyaXB0aW9uOiBcIk1vdmUgdG8gcHJldmlvdXMgZm9sZCBlbmRcIlxuICB3aGljaDogJ2VuZCdcblxuY2xhc3MgTW92ZVRvTmV4dEZvbGRFbmQgZXh0ZW5kcyBNb3ZlVG9QcmV2aW91c0ZvbGRFbmRcbiAgQGV4dGVuZCgpXG4gIEBkZXNjcmlwdGlvbjogXCJNb3ZlIHRvIG5leHQgZm9sZCBlbmRcIlxuICBkaXJlY3Rpb246ICduZXh0J1xuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIE1vdmVUb1ByZXZpb3VzRnVuY3Rpb24gZXh0ZW5kcyBNb3ZlVG9QcmV2aW91c0ZvbGRTdGFydFxuICBAZXh0ZW5kKClcbiAgQGRlc2NyaXB0aW9uOiBcIk1vdmUgdG8gcHJldmlvdXMgZnVuY3Rpb25cIlxuICBkaXJlY3Rpb246ICdwcmV2J1xuICBkZXRlY3RSb3c6IChjdXJzb3IpIC0+XG4gICAgXy5kZXRlY3QgQGdldFNjYW5Sb3dzKGN1cnNvciksIChyb3cpID0+XG4gICAgICBpc0luY2x1ZGVGdW5jdGlvblNjb3BlRm9yUm93KEBlZGl0b3IsIHJvdylcblxuY2xhc3MgTW92ZVRvTmV4dEZ1bmN0aW9uIGV4dGVuZHMgTW92ZVRvUHJldmlvdXNGdW5jdGlvblxuICBAZXh0ZW5kKClcbiAgQGRlc2NyaXB0aW9uOiBcIk1vdmUgdG8gbmV4dCBmdW5jdGlvblwiXG4gIGRpcmVjdGlvbjogJ25leHQnXG5cbiMgU2NvcGUgYmFzZWRcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgTW92ZVRvUG9zaXRpb25CeVNjb3BlIGV4dGVuZHMgTW90aW9uXG4gIEBleHRlbmQoZmFsc2UpXG4gIGRpcmVjdGlvbjogJ2JhY2t3YXJkJ1xuICBzY29wZTogJy4nXG5cbiAgZ2V0UG9pbnQ6IChmcm9tUG9pbnQpIC0+XG4gICAgZGV0ZWN0U2NvcGVTdGFydFBvc2l0aW9uRm9yU2NvcGUoQGVkaXRvciwgZnJvbVBvaW50LCBAZGlyZWN0aW9uLCBAc2NvcGUpXG5cbiAgbW92ZUN1cnNvcjogKGN1cnNvcikgLT5cbiAgICBAbW92ZUN1cnNvckNvdW50VGltZXMgY3Vyc29yLCA9PlxuICAgICAgQHNldEJ1ZmZlclBvc2l0aW9uU2FmZWx5KGN1cnNvciwgQGdldFBvaW50KGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpKSlcblxuY2xhc3MgTW92ZVRvUHJldmlvdXNTdHJpbmcgZXh0ZW5kcyBNb3ZlVG9Qb3NpdGlvbkJ5U2NvcGVcbiAgQGV4dGVuZCgpXG4gIEBkZXNjcmlwdGlvbjogXCJNb3ZlIHRvIHByZXZpb3VzIHN0cmluZyhzZWFyY2hlZCBieSBgc3RyaW5nLmJlZ2luYCBzY29wZSlcIlxuICBkaXJlY3Rpb246ICdiYWNrd2FyZCdcbiAgc2NvcGU6ICdzdHJpbmcuYmVnaW4nXG5cbmNsYXNzIE1vdmVUb05leHRTdHJpbmcgZXh0ZW5kcyBNb3ZlVG9QcmV2aW91c1N0cmluZ1xuICBAZXh0ZW5kKClcbiAgQGRlc2NyaXB0aW9uOiBcIk1vdmUgdG8gbmV4dCBzdHJpbmcoc2VhcmNoZWQgYnkgYHN0cmluZy5iZWdpbmAgc2NvcGUpXCJcbiAgZGlyZWN0aW9uOiAnZm9yd2FyZCdcblxuY2xhc3MgTW92ZVRvUHJldmlvdXNOdW1iZXIgZXh0ZW5kcyBNb3ZlVG9Qb3NpdGlvbkJ5U2NvcGVcbiAgQGV4dGVuZCgpXG4gIGRpcmVjdGlvbjogJ2JhY2t3YXJkJ1xuICBAZGVzY3JpcHRpb246IFwiTW92ZSB0byBwcmV2aW91cyBudW1iZXIoc2VhcmNoZWQgYnkgYGNvbnN0YW50Lm51bWVyaWNgIHNjb3BlKVwiXG4gIHNjb3BlOiAnY29uc3RhbnQubnVtZXJpYydcblxuY2xhc3MgTW92ZVRvTmV4dE51bWJlciBleHRlbmRzIE1vdmVUb1ByZXZpb3VzTnVtYmVyXG4gIEBleHRlbmQoKVxuICBAZGVzY3JpcHRpb246IFwiTW92ZSB0byBuZXh0IG51bWJlcihzZWFyY2hlZCBieSBgY29uc3RhbnQubnVtZXJpY2Agc2NvcGUpXCJcbiAgZGlyZWN0aW9uOiAnZm9yd2FyZCdcblxuY2xhc3MgTW92ZVRvTmV4dE9jY3VycmVuY2UgZXh0ZW5kcyBNb3Rpb25cbiAgQGV4dGVuZCgpXG4gIGp1bXA6IHRydWVcbiAgZGlyZWN0aW9uOiAnbmV4dCdcblxuICBpbml0aWFsaXplOiAtPlxuICAgIGlmIEB2aW1TdGF0ZS5vY2N1cnJlbmNlTWFuYWdlci5oYXNNYXJrZXJzKClcbiAgICAgIHN1cGVyXG4gICAgZWxzZVxuICAgICAgaWYgc2V0dGluZ3MuZ2V0KCdmYWxsYmFja1RhYkFuZFNoaWZ0VGFiSW5Ob3JtYWxNb2RlJylcbiAgICAgICAgc3dpdGNoIGdldEtleXN0cm9rZUZvckV2ZW50KEB2aW1TdGF0ZS5fZXZlbnQpXG4gICAgICAgICAgd2hlbiAndGFiJ1xuICAgICAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChAZWRpdG9yRWxlbWVudCwgJ2VkaXRvcjppbmRlbnQnKVxuICAgICAgICAgIHdoZW4gJ3NoaWZ0LXRhYidcbiAgICAgICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goQGVkaXRvckVsZW1lbnQsICdlZGl0b3I6b3V0ZGVudC1zZWxlY3RlZC1yb3dzJylcbiAgICAgIEBhYm9ydCgpXG5cbiAgZ2V0UmFuZ2VzOiAtPlxuICAgIEB2aW1TdGF0ZS5vY2N1cnJlbmNlTWFuYWdlci5nZXRNYXJrZXJzKCkubWFwIChtYXJrZXIpIC0+XG4gICAgICBtYXJrZXIuZ2V0QnVmZmVyUmFuZ2UoKVxuXG4gIGV4ZWN1dGU6IC0+XG4gICAgQHJhbmdlcyA9IEBnZXRSYW5nZXMoKVxuICAgIHN1cGVyXG5cbiAgbW92ZUN1cnNvcjogKGN1cnNvcikgLT5cbiAgICBpbmRleCA9IEBnZXRJbmRleChjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKSlcbiAgICBpZiBpbmRleD9cbiAgICAgIG9mZnNldCA9IHN3aXRjaCBAZGlyZWN0aW9uXG4gICAgICAgIHdoZW4gJ25leHQnIHRoZW4gQGdldENvdW50KC0xKVxuICAgICAgICB3aGVuICdwcmV2aW91cycgdGhlbiAtQGdldENvdW50KC0xKVxuICAgICAgcmFuZ2UgPSBAcmFuZ2VzW2dldEluZGV4KGluZGV4ICsgb2Zmc2V0LCBAcmFuZ2VzKV1cbiAgICAgIHBvaW50ID0gcmFuZ2Uuc3RhcnRcblxuICAgICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHBvaW50LCBhdXRvc2Nyb2xsOiBmYWxzZSlcblxuICAgICAgaWYgY3Vyc29yLmlzTGFzdEN1cnNvcigpXG4gICAgICAgIEBlZGl0b3IudW5mb2xkQnVmZmVyUm93KHBvaW50LnJvdylcbiAgICAgICAgc21hcnRTY3JvbGxUb0J1ZmZlclBvc2l0aW9uKEBlZGl0b3IsIHBvaW50KVxuXG4gICAgICBpZiBzZXR0aW5ncy5nZXQoJ2ZsYXNoT25Nb3ZlVG9PY2N1cnJlbmNlJylcbiAgICAgICAgQHZpbVN0YXRlLmZsYXNoKHJhbmdlLCB0eXBlOiAnc2VhcmNoJylcblxuICBnZXRJbmRleDogKGZyb21Qb2ludCkgLT5cbiAgICBmb3IgcmFuZ2UsIGkgaW4gQHJhbmdlcyB3aGVuIHJhbmdlLnN0YXJ0LmlzR3JlYXRlclRoYW4oZnJvbVBvaW50KVxuICAgICAgcmV0dXJuIGlcbiAgICAwXG5cbmNsYXNzIE1vdmVUb1ByZXZpb3VzT2NjdXJyZW5jZSBleHRlbmRzIE1vdmVUb05leHRPY2N1cnJlbmNlXG4gIEBleHRlbmQoKVxuICBkaXJlY3Rpb246ICdwcmV2aW91cydcblxuICBnZXRJbmRleDogKGZyb21Qb2ludCkgLT5cbiAgICBmb3IgcmFuZ2UsIGkgaW4gQHJhbmdlcyBieSAtMSB3aGVuIHJhbmdlLmVuZC5pc0xlc3NUaGFuKGZyb21Qb2ludClcbiAgICAgIHJldHVybiBpXG4gICAgQHJhbmdlcy5sZW5ndGggLSAxXG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBrZXltYXA6ICVcbmNsYXNzIE1vdmVUb1BhaXIgZXh0ZW5kcyBNb3Rpb25cbiAgQGV4dGVuZCgpXG4gIGluY2x1c2l2ZTogdHJ1ZVxuICBqdW1wOiB0cnVlXG4gIG1lbWJlcjogWydQYXJlbnRoZXNpcycsICdDdXJseUJyYWNrZXQnLCAnU3F1YXJlQnJhY2tldCcsICdBbmdsZUJyYWNrZXQnXVxuXG4gIG1vdmVDdXJzb3I6IChjdXJzb3IpIC0+XG4gICAgQHNldEJ1ZmZlclBvc2l0aW9uU2FmZWx5KGN1cnNvciwgQGdldFBvaW50KGN1cnNvcikpXG5cbiAgZ2V0UG9pbnQ6IChjdXJzb3IpIC0+XG4gICAgY3Vyc29yUG9zaXRpb24gPSBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuICAgIGN1cnNvclJvdyA9IGN1cnNvclBvc2l0aW9uLnJvd1xuXG4gICAgZ2V0UG9pbnRGb3JUYWcgPSA9PlxuICAgICAgcCA9IGN1cnNvclBvc2l0aW9uXG4gICAgICBwYWlySW5mbyA9IEBuZXcoXCJBVGFnXCIpLmdldFBhaXJJbmZvKHApXG4gICAgICByZXR1cm4gbnVsbCB1bmxlc3MgcGFpckluZm8/XG4gICAgICB7b3BlblJhbmdlLCBjbG9zZVJhbmdlfSA9IHBhaXJJbmZvXG4gICAgICBvcGVuUmFuZ2UgPSBvcGVuUmFuZ2UudHJhbnNsYXRlKFswLCArMV0sIFswLCAtMV0pXG4gICAgICBjbG9zZVJhbmdlID0gY2xvc2VSYW5nZS50cmFuc2xhdGUoWzAsICsxXSwgWzAsIC0xXSlcbiAgICAgIHJldHVybiBjbG9zZVJhbmdlLnN0YXJ0IGlmIG9wZW5SYW5nZS5jb250YWluc1BvaW50KHApIGFuZCAobm90IHAuaXNFcXVhbChvcGVuUmFuZ2UuZW5kKSlcbiAgICAgIHJldHVybiBvcGVuUmFuZ2Uuc3RhcnQgaWYgY2xvc2VSYW5nZS5jb250YWluc1BvaW50KHApIGFuZCAobm90IHAuaXNFcXVhbChjbG9zZVJhbmdlLmVuZCkpXG5cbiAgICBwb2ludCA9IGdldFBvaW50Rm9yVGFnKClcbiAgICByZXR1cm4gcG9pbnQgaWYgcG9pbnQ/XG5cbiAgICByYW5nZXMgPSBAbmV3KFwiQUFueVBhaXJcIiwge2FsbG93Rm9yd2FyZGluZzogdHJ1ZSwgQG1lbWJlcn0pLmdldFJhbmdlcyhjdXJzb3Iuc2VsZWN0aW9uKVxuICAgIHJhbmdlcyA9IHJhbmdlcy5maWx0ZXIgKHtzdGFydCwgZW5kfSkgLT5cbiAgICAgIHAgPSBjdXJzb3JQb3NpdGlvblxuICAgICAgKHAucm93IGlzIHN0YXJ0LnJvdykgYW5kIHN0YXJ0LmlzR3JlYXRlclRoYW5PckVxdWFsKHApIG9yXG4gICAgICAgIChwLnJvdyBpcyBlbmQucm93KSBhbmQgZW5kLmlzR3JlYXRlclRoYW5PckVxdWFsKHApXG5cbiAgICByZXR1cm4gbnVsbCB1bmxlc3MgcmFuZ2VzLmxlbmd0aFxuICAgICMgQ2FsbGluZyBjb250YWluc1BvaW50IGV4Y2x1c2l2ZShwYXNzIHRydWUgYXMgMm5kIGFyZykgbWFrZSBvcGVuaW5nIHBhaXIgdW5kZXJcbiAgICAjIGN1cnNvciBpcyBncm91cGVkIHRvIGZvcndhcmRpbmdSYW5nZXNcbiAgICBbZW5jbG9zaW5nUmFuZ2VzLCBmb3J3YXJkaW5nUmFuZ2VzXSA9IF8ucGFydGl0aW9uIHJhbmdlcywgKHJhbmdlKSAtPlxuICAgICAgcmFuZ2UuY29udGFpbnNQb2ludChjdXJzb3JQb3NpdGlvbiwgdHJ1ZSlcbiAgICBlbmNsb3NpbmdSYW5nZSA9IF8ubGFzdChzb3J0UmFuZ2VzKGVuY2xvc2luZ1JhbmdlcykpXG4gICAgZm9yd2FyZGluZ1JhbmdlcyA9IHNvcnRSYW5nZXMoZm9yd2FyZGluZ1JhbmdlcylcblxuICAgIGlmIGVuY2xvc2luZ1JhbmdlXG4gICAgICBmb3J3YXJkaW5nUmFuZ2VzID0gZm9yd2FyZGluZ1Jhbmdlcy5maWx0ZXIgKHJhbmdlKSAtPlxuICAgICAgICBlbmNsb3NpbmdSYW5nZS5jb250YWluc1JhbmdlKHJhbmdlKVxuXG4gICAgZm9yd2FyZGluZ1Jhbmdlc1swXT8uZW5kLnRyYW5zbGF0ZShbMCwgLTFdKSBvciBlbmNsb3NpbmdSYW5nZT8uc3RhcnRcbiJdfQ==
