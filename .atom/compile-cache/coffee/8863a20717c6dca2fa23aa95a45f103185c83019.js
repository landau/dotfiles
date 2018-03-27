(function() {
  var ActivateInsertMode, ActivateReplaceMode, Change, ChangeLine, ChangeOccurrence, ChangeToLastCharacterOfLine, InsertAboveWithNewline, InsertAfter, InsertAfterEndOfLine, InsertAtBeginningOfLine, InsertAtEndOfOccurrence, InsertAtEndOfSmartWord, InsertAtEndOfSubwordOccurrence, InsertAtEndOfTarget, InsertAtFirstCharacterOfLine, InsertAtHeadOfOccurrence, InsertAtHeadOfSubwordOccurrence, InsertAtHeadOfTarget, InsertAtLastInsert, InsertAtNextFoldStart, InsertAtPreviousFoldStart, InsertAtStartOfOccurrence, InsertAtStartOfSmartWord, InsertAtStartOfSubwordOccurrence, InsertAtStartOfTarget, InsertBelowWithNewline, InsertByTarget, Operator, Range, Substitute, SubstituteLine, _, isEmptyRow, limitNumber, moveCursorLeft, moveCursorRight, ref, setBufferRow,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  _ = require('underscore-plus');

  Range = require('atom').Range;

  ref = require('./utils'), moveCursorLeft = ref.moveCursorLeft, moveCursorRight = ref.moveCursorRight, limitNumber = ref.limitNumber, isEmptyRow = ref.isEmptyRow, setBufferRow = ref.setBufferRow;

  Operator = require('./base').getClass('Operator');

  ActivateInsertMode = (function(superClass) {
    extend(ActivateInsertMode, superClass);

    function ActivateInsertMode() {
      return ActivateInsertMode.__super__.constructor.apply(this, arguments);
    }

    ActivateInsertMode.extend();

    ActivateInsertMode.prototype.requireTarget = false;

    ActivateInsertMode.prototype.flashTarget = false;

    ActivateInsertMode.prototype.finalSubmode = null;

    ActivateInsertMode.prototype.supportInsertionCount = true;

    ActivateInsertMode.prototype.observeWillDeactivateMode = function() {
      var disposable;
      return disposable = this.vimState.modeManager.preemptWillDeactivateMode((function(_this) {
        return function(arg) {
          var change, mode, textByUserInput;
          mode = arg.mode;
          if (mode !== 'insert') {
            return;
          }
          disposable.dispose();
          _this.vimState.mark.set('^', _this.editor.getCursorBufferPosition());
          textByUserInput = '';
          if (change = _this.getChangeSinceCheckpoint('insert')) {
            _this.lastChange = change;
            _this.setMarkForChange(new Range(change.start, change.start.traverse(change.newExtent)));
            textByUserInput = change.newText;
          }
          _this.vimState.register.set('.', {
            text: textByUserInput
          });
          _.times(_this.getInsertionCount(), function() {
            var i, len, ref1, results, selection, text;
            text = _this.textByOperator + textByUserInput;
            ref1 = _this.editor.getSelections();
            results = [];
            for (i = 0, len = ref1.length; i < len; i++) {
              selection = ref1[i];
              results.push(selection.insertText(text, {
                autoIndent: true
              }));
            }
            return results;
          });
          if (_this.getConfig('clearMultipleCursorsOnEscapeInsertMode')) {
            _this.vimState.clearSelections();
          }
          if (_this.getConfig('groupChangesWhenLeavingInsertMode')) {
            return _this.groupChangesSinceBufferCheckpoint('undo');
          }
        };
      })(this));
    };

    ActivateInsertMode.prototype.getChangeSinceCheckpoint = function(purpose) {
      var checkpoint;
      checkpoint = this.getBufferCheckpoint(purpose);
      return this.editor.buffer.getChangesSinceCheckpoint(checkpoint)[0];
    };

    ActivateInsertMode.prototype.replayLastChange = function(selection) {
      var deletionEnd, deletionStart, newExtent, newText, oldExtent, ref1, start, traversalToStartOfDelete;
      if (this.lastChange != null) {
        ref1 = this.lastChange, start = ref1.start, newExtent = ref1.newExtent, oldExtent = ref1.oldExtent, newText = ref1.newText;
        if (!oldExtent.isZero()) {
          traversalToStartOfDelete = start.traversalFrom(this.topCursorPositionAtInsertionStart);
          deletionStart = selection.cursor.getBufferPosition().traverse(traversalToStartOfDelete);
          deletionEnd = deletionStart.traverse(oldExtent);
          selection.setBufferRange([deletionStart, deletionEnd]);
        }
      } else {
        newText = '';
      }
      return selection.insertText(newText, {
        autoIndent: true
      });
    };

    ActivateInsertMode.prototype.repeatInsert = function(selection, text) {
      return this.replayLastChange(selection);
    };

    ActivateInsertMode.prototype.getInsertionCount = function() {
      if (this.insertionCount == null) {
        this.insertionCount = this.supportInsertionCount ? this.getCount(-1) : 0;
      }
      return limitNumber(this.insertionCount, {
        max: 100
      });
    };

    ActivateInsertMode.prototype.investigateCursorPosition = function() {
      var c1, c2, c3, ref1;
      ref1 = [], c1 = ref1[0], c2 = ref1[1], c3 = ref1[2];
      c1 = this.editor.getCursorBufferPosition();
      this.onWillActivateMode((function(_this) {
        return function(arg) {
          var mode, submode;
          mode = arg.mode, submode = arg.submode;
          c2 = _this.editor.getCursorBufferPosition();
          if (!c1.isEqual(c2)) {
            return console.info('diff c1, c2', c1.toString(), c2.toString());
          }
        };
      })(this));
      return this.onDidActivateMode((function(_this) {
        return function(arg) {
          var mode, submode;
          mode = arg.mode, submode = arg.submode;
          c3 = _this.editor.getCursorBufferPosition();
          if (c2.row !== c3.row) {
            return console.warn('dff c2, c3', c2.toString(), c3.toString());
          }
        };
      })(this));
    };

    ActivateInsertMode.prototype.execute = function() {
      var blockwiseSelection, i, len, ref1, ref2, ref3, topCursor;
      if (this.repeated) {
        this.flashTarget = this.trackChange = true;
        this.startMutation((function(_this) {
          return function() {
            var i, len, ref1, ref2, ref3, selection;
            if (_this.target != null) {
              _this.selectTarget();
            }
            if (typeof _this.mutateText === "function") {
              _this.mutateText();
            }
            ref1 = _this.editor.getSelections();
            for (i = 0, len = ref1.length; i < len; i++) {
              selection = ref1[i];
              _this.repeatInsert(selection, (ref2 = (ref3 = _this.lastChange) != null ? ref3.newText : void 0) != null ? ref2 : '');
              moveCursorLeft(selection.cursor);
            }
            return _this.mutationManager.setCheckpoint('did-finish');
          };
        })(this));
        if (this.getConfig('clearMultipleCursorsOnEscapeInsertMode')) {
          return this.vimState.clearSelections();
        }
      } else {
        if (this.getConfig("debug")) {
          this.investigateCursorPosition();
        }
        this.normalizeSelectionsIfNecessary();
        this.createBufferCheckpoint('undo');
        if (this.target != null) {
          this.selectTarget();
        }
        this.observeWillDeactivateMode();
        if (typeof this.mutateText === "function") {
          this.mutateText();
        }
        if (this.getInsertionCount() > 0) {
          this.textByOperator = (ref1 = (ref2 = this.getChangeSinceCheckpoint('undo')) != null ? ref2.newText : void 0) != null ? ref1 : '';
        }
        this.createBufferCheckpoint('insert');
        topCursor = this.editor.getCursorsOrderedByBufferPosition()[0];
        this.topCursorPositionAtInsertionStart = topCursor.getBufferPosition();
        ref3 = this.getBlockwiseSelections();
        for (i = 0, len = ref3.length; i < len; i++) {
          blockwiseSelection = ref3[i];
          blockwiseSelection.skipNormalization();
        }
        return this.activateMode('insert', this.finalSubmode);
      }
    };

    return ActivateInsertMode;

  })(Operator);

  ActivateReplaceMode = (function(superClass) {
    extend(ActivateReplaceMode, superClass);

    function ActivateReplaceMode() {
      return ActivateReplaceMode.__super__.constructor.apply(this, arguments);
    }

    ActivateReplaceMode.extend();

    ActivateReplaceMode.prototype.finalSubmode = 'replace';

    ActivateReplaceMode.prototype.repeatInsert = function(selection, text) {
      var char, i, len;
      for (i = 0, len = text.length; i < len; i++) {
        char = text[i];
        if (!(char !== "\n")) {
          continue;
        }
        if (selection.cursor.isAtEndOfLine()) {
          break;
        }
        selection.selectRight();
      }
      return selection.insertText(text, {
        autoIndent: false
      });
    };

    return ActivateReplaceMode;

  })(ActivateInsertMode);

  InsertAfter = (function(superClass) {
    extend(InsertAfter, superClass);

    function InsertAfter() {
      return InsertAfter.__super__.constructor.apply(this, arguments);
    }

    InsertAfter.extend();

    InsertAfter.prototype.execute = function() {
      var cursor, i, len, ref1;
      ref1 = this.editor.getCursors();
      for (i = 0, len = ref1.length; i < len; i++) {
        cursor = ref1[i];
        moveCursorRight(cursor);
      }
      return InsertAfter.__super__.execute.apply(this, arguments);
    };

    return InsertAfter;

  })(ActivateInsertMode);

  InsertAtBeginningOfLine = (function(superClass) {
    extend(InsertAtBeginningOfLine, superClass);

    function InsertAtBeginningOfLine() {
      return InsertAtBeginningOfLine.__super__.constructor.apply(this, arguments);
    }

    InsertAtBeginningOfLine.extend();

    InsertAtBeginningOfLine.prototype.execute = function() {
      var ref1;
      if (this.mode === 'visual' && ((ref1 = this.submode) === 'characterwise' || ref1 === 'linewise')) {
        this.editor.splitSelectionsIntoLines();
      }
      this.editor.moveToBeginningOfLine();
      return InsertAtBeginningOfLine.__super__.execute.apply(this, arguments);
    };

    return InsertAtBeginningOfLine;

  })(ActivateInsertMode);

  InsertAfterEndOfLine = (function(superClass) {
    extend(InsertAfterEndOfLine, superClass);

    function InsertAfterEndOfLine() {
      return InsertAfterEndOfLine.__super__.constructor.apply(this, arguments);
    }

    InsertAfterEndOfLine.extend();

    InsertAfterEndOfLine.prototype.execute = function() {
      this.editor.moveToEndOfLine();
      return InsertAfterEndOfLine.__super__.execute.apply(this, arguments);
    };

    return InsertAfterEndOfLine;

  })(ActivateInsertMode);

  InsertAtFirstCharacterOfLine = (function(superClass) {
    extend(InsertAtFirstCharacterOfLine, superClass);

    function InsertAtFirstCharacterOfLine() {
      return InsertAtFirstCharacterOfLine.__super__.constructor.apply(this, arguments);
    }

    InsertAtFirstCharacterOfLine.extend();

    InsertAtFirstCharacterOfLine.prototype.execute = function() {
      this.editor.moveToBeginningOfLine();
      this.editor.moveToFirstCharacterOfLine();
      return InsertAtFirstCharacterOfLine.__super__.execute.apply(this, arguments);
    };

    return InsertAtFirstCharacterOfLine;

  })(ActivateInsertMode);

  InsertAtLastInsert = (function(superClass) {
    extend(InsertAtLastInsert, superClass);

    function InsertAtLastInsert() {
      return InsertAtLastInsert.__super__.constructor.apply(this, arguments);
    }

    InsertAtLastInsert.extend();

    InsertAtLastInsert.prototype.execute = function() {
      var point;
      if ((point = this.vimState.mark.get('^'))) {
        this.editor.setCursorBufferPosition(point);
        this.editor.scrollToCursorPosition({
          center: true
        });
      }
      return InsertAtLastInsert.__super__.execute.apply(this, arguments);
    };

    return InsertAtLastInsert;

  })(ActivateInsertMode);

  InsertAboveWithNewline = (function(superClass) {
    extend(InsertAboveWithNewline, superClass);

    function InsertAboveWithNewline() {
      return InsertAboveWithNewline.__super__.constructor.apply(this, arguments);
    }

    InsertAboveWithNewline.extend();

    InsertAboveWithNewline.prototype.initialize = function() {
      if (this.getConfig('groupChangesWhenLeavingInsertMode')) {
        return this.originalCursorPositionMarker = this.editor.markBufferPosition(this.editor.getCursorBufferPosition());
      }
    };

    InsertAboveWithNewline.prototype.groupChangesSinceBufferCheckpoint = function() {
      var cursorPosition, lastCursor;
      lastCursor = this.editor.getLastCursor();
      cursorPosition = lastCursor.getBufferPosition();
      lastCursor.setBufferPosition(this.originalCursorPositionMarker.getHeadBufferPosition());
      this.originalCursorPositionMarker.destroy();
      InsertAboveWithNewline.__super__.groupChangesSinceBufferCheckpoint.apply(this, arguments);
      return lastCursor.setBufferPosition(cursorPosition);
    };

    InsertAboveWithNewline.prototype.autoIndentEmptyRows = function() {
      var cursor, i, len, ref1, results, row;
      ref1 = this.editor.getCursors();
      results = [];
      for (i = 0, len = ref1.length; i < len; i++) {
        cursor = ref1[i];
        row = cursor.getBufferRow();
        if (isEmptyRow(this.editor, row)) {
          results.push(this.editor.autoIndentBufferRow(row));
        } else {
          results.push(void 0);
        }
      }
      return results;
    };

    InsertAboveWithNewline.prototype.mutateText = function() {
      this.editor.insertNewlineAbove();
      if (this.editor.autoIndent) {
        return this.autoIndentEmptyRows();
      }
    };

    InsertAboveWithNewline.prototype.repeatInsert = function(selection, text) {
      return selection.insertText(text.trimLeft(), {
        autoIndent: true
      });
    };

    return InsertAboveWithNewline;

  })(ActivateInsertMode);

  InsertBelowWithNewline = (function(superClass) {
    extend(InsertBelowWithNewline, superClass);

    function InsertBelowWithNewline() {
      return InsertBelowWithNewline.__super__.constructor.apply(this, arguments);
    }

    InsertBelowWithNewline.extend();

    InsertBelowWithNewline.prototype.mutateText = function() {
      var cursor, cursorRow, i, len, ref1;
      ref1 = this.editor.getCursors();
      for (i = 0, len = ref1.length; i < len; i++) {
        cursor = ref1[i];
        if (cursorRow = cursor.getBufferRow()) {
          setBufferRow(cursor, this.getFoldEndRowForRow(cursorRow));
        }
      }
      this.editor.insertNewlineBelow();
      if (this.editor.autoIndent) {
        return this.autoIndentEmptyRows();
      }
    };

    return InsertBelowWithNewline;

  })(InsertAboveWithNewline);

  InsertByTarget = (function(superClass) {
    extend(InsertByTarget, superClass);

    function InsertByTarget() {
      return InsertByTarget.__super__.constructor.apply(this, arguments);
    }

    InsertByTarget.extend(false);

    InsertByTarget.prototype.requireTarget = true;

    InsertByTarget.prototype.which = null;

    InsertByTarget.prototype.initialize = function() {
      this.getCount();
      return InsertByTarget.__super__.initialize.apply(this, arguments);
    };

    InsertByTarget.prototype.execute = function() {
      this.onDidSelectTarget((function(_this) {
        return function() {
          var $selection, blockwiseSelection, i, j, k, len, len1, len2, ref1, ref2, ref3, ref4, results;
          if (!_this.occurrenceSelected && _this.mode === 'visual' && ((ref1 = _this.submode) === 'characterwise' || ref1 === 'linewise')) {
            ref2 = _this.swrap.getSelections(_this.editor);
            for (i = 0, len = ref2.length; i < len; i++) {
              $selection = ref2[i];
              $selection.normalize();
              $selection.applyWise('blockwise');
            }
            if (_this.submode === 'linewise') {
              ref3 = _this.getBlockwiseSelections();
              for (j = 0, len1 = ref3.length; j < len1; j++) {
                blockwiseSelection = ref3[j];
                blockwiseSelection.expandMemberSelectionsOverLineWithTrimRange();
              }
            }
          }
          ref4 = _this.swrap.getSelections(_this.editor);
          results = [];
          for (k = 0, len2 = ref4.length; k < len2; k++) {
            $selection = ref4[k];
            results.push($selection.setBufferPositionTo(_this.which));
          }
          return results;
        };
      })(this));
      return InsertByTarget.__super__.execute.apply(this, arguments);
    };

    return InsertByTarget;

  })(ActivateInsertMode);

  InsertAtStartOfTarget = (function(superClass) {
    extend(InsertAtStartOfTarget, superClass);

    function InsertAtStartOfTarget() {
      return InsertAtStartOfTarget.__super__.constructor.apply(this, arguments);
    }

    InsertAtStartOfTarget.extend();

    InsertAtStartOfTarget.prototype.which = 'start';

    return InsertAtStartOfTarget;

  })(InsertByTarget);

  InsertAtEndOfTarget = (function(superClass) {
    extend(InsertAtEndOfTarget, superClass);

    function InsertAtEndOfTarget() {
      return InsertAtEndOfTarget.__super__.constructor.apply(this, arguments);
    }

    InsertAtEndOfTarget.extend();

    InsertAtEndOfTarget.prototype.which = 'end';

    return InsertAtEndOfTarget;

  })(InsertByTarget);

  InsertAtHeadOfTarget = (function(superClass) {
    extend(InsertAtHeadOfTarget, superClass);

    function InsertAtHeadOfTarget() {
      return InsertAtHeadOfTarget.__super__.constructor.apply(this, arguments);
    }

    InsertAtHeadOfTarget.extend();

    InsertAtHeadOfTarget.prototype.which = 'head';

    return InsertAtHeadOfTarget;

  })(InsertByTarget);

  InsertAtStartOfOccurrence = (function(superClass) {
    extend(InsertAtStartOfOccurrence, superClass);

    function InsertAtStartOfOccurrence() {
      return InsertAtStartOfOccurrence.__super__.constructor.apply(this, arguments);
    }

    InsertAtStartOfOccurrence.extend();

    InsertAtStartOfOccurrence.prototype.occurrence = true;

    return InsertAtStartOfOccurrence;

  })(InsertAtStartOfTarget);

  InsertAtEndOfOccurrence = (function(superClass) {
    extend(InsertAtEndOfOccurrence, superClass);

    function InsertAtEndOfOccurrence() {
      return InsertAtEndOfOccurrence.__super__.constructor.apply(this, arguments);
    }

    InsertAtEndOfOccurrence.extend();

    InsertAtEndOfOccurrence.prototype.occurrence = true;

    return InsertAtEndOfOccurrence;

  })(InsertAtEndOfTarget);

  InsertAtHeadOfOccurrence = (function(superClass) {
    extend(InsertAtHeadOfOccurrence, superClass);

    function InsertAtHeadOfOccurrence() {
      return InsertAtHeadOfOccurrence.__super__.constructor.apply(this, arguments);
    }

    InsertAtHeadOfOccurrence.extend();

    InsertAtHeadOfOccurrence.prototype.occurrence = true;

    return InsertAtHeadOfOccurrence;

  })(InsertAtHeadOfTarget);

  InsertAtStartOfSubwordOccurrence = (function(superClass) {
    extend(InsertAtStartOfSubwordOccurrence, superClass);

    function InsertAtStartOfSubwordOccurrence() {
      return InsertAtStartOfSubwordOccurrence.__super__.constructor.apply(this, arguments);
    }

    InsertAtStartOfSubwordOccurrence.extend();

    InsertAtStartOfSubwordOccurrence.prototype.occurrenceType = 'subword';

    return InsertAtStartOfSubwordOccurrence;

  })(InsertAtStartOfOccurrence);

  InsertAtEndOfSubwordOccurrence = (function(superClass) {
    extend(InsertAtEndOfSubwordOccurrence, superClass);

    function InsertAtEndOfSubwordOccurrence() {
      return InsertAtEndOfSubwordOccurrence.__super__.constructor.apply(this, arguments);
    }

    InsertAtEndOfSubwordOccurrence.extend();

    InsertAtEndOfSubwordOccurrence.prototype.occurrenceType = 'subword';

    return InsertAtEndOfSubwordOccurrence;

  })(InsertAtEndOfOccurrence);

  InsertAtHeadOfSubwordOccurrence = (function(superClass) {
    extend(InsertAtHeadOfSubwordOccurrence, superClass);

    function InsertAtHeadOfSubwordOccurrence() {
      return InsertAtHeadOfSubwordOccurrence.__super__.constructor.apply(this, arguments);
    }

    InsertAtHeadOfSubwordOccurrence.extend();

    InsertAtHeadOfSubwordOccurrence.prototype.occurrenceType = 'subword';

    return InsertAtHeadOfSubwordOccurrence;

  })(InsertAtHeadOfOccurrence);

  InsertAtStartOfSmartWord = (function(superClass) {
    extend(InsertAtStartOfSmartWord, superClass);

    function InsertAtStartOfSmartWord() {
      return InsertAtStartOfSmartWord.__super__.constructor.apply(this, arguments);
    }

    InsertAtStartOfSmartWord.extend();

    InsertAtStartOfSmartWord.prototype.which = 'start';

    InsertAtStartOfSmartWord.prototype.target = "MoveToPreviousSmartWord";

    return InsertAtStartOfSmartWord;

  })(InsertByTarget);

  InsertAtEndOfSmartWord = (function(superClass) {
    extend(InsertAtEndOfSmartWord, superClass);

    function InsertAtEndOfSmartWord() {
      return InsertAtEndOfSmartWord.__super__.constructor.apply(this, arguments);
    }

    InsertAtEndOfSmartWord.extend();

    InsertAtEndOfSmartWord.prototype.which = 'end';

    InsertAtEndOfSmartWord.prototype.target = "MoveToEndOfSmartWord";

    return InsertAtEndOfSmartWord;

  })(InsertByTarget);

  InsertAtPreviousFoldStart = (function(superClass) {
    extend(InsertAtPreviousFoldStart, superClass);

    function InsertAtPreviousFoldStart() {
      return InsertAtPreviousFoldStart.__super__.constructor.apply(this, arguments);
    }

    InsertAtPreviousFoldStart.extend();

    InsertAtPreviousFoldStart.description = "Move to previous fold start then enter insert-mode";

    InsertAtPreviousFoldStart.prototype.which = 'start';

    InsertAtPreviousFoldStart.prototype.target = 'MoveToPreviousFoldStart';

    return InsertAtPreviousFoldStart;

  })(InsertByTarget);

  InsertAtNextFoldStart = (function(superClass) {
    extend(InsertAtNextFoldStart, superClass);

    function InsertAtNextFoldStart() {
      return InsertAtNextFoldStart.__super__.constructor.apply(this, arguments);
    }

    InsertAtNextFoldStart.extend();

    InsertAtNextFoldStart.description = "Move to next fold start then enter insert-mode";

    InsertAtNextFoldStart.prototype.which = 'end';

    InsertAtNextFoldStart.prototype.target = 'MoveToNextFoldStart';

    return InsertAtNextFoldStart;

  })(InsertByTarget);

  Change = (function(superClass) {
    extend(Change, superClass);

    function Change() {
      return Change.__super__.constructor.apply(this, arguments);
    }

    Change.extend();

    Change.prototype.requireTarget = true;

    Change.prototype.trackChange = true;

    Change.prototype.supportInsertionCount = false;

    Change.prototype.mutateText = function() {
      var i, isLinewiseTarget, len, ref1, results, selection;
      isLinewiseTarget = this.swrap.detectWise(this.editor) === 'linewise';
      ref1 = this.editor.getSelections();
      results = [];
      for (i = 0, len = ref1.length; i < len; i++) {
        selection = ref1[i];
        if (!this.getConfig('dontUpdateRegisterOnChangeOrSubstitute')) {
          this.setTextToRegisterForSelection(selection);
        }
        if (isLinewiseTarget) {
          selection.insertText("\n", {
            autoIndent: true
          });
          results.push(selection.cursor.moveLeft());
        } else {
          results.push(selection.insertText('', {
            autoIndent: true
          }));
        }
      }
      return results;
    };

    return Change;

  })(ActivateInsertMode);

  ChangeOccurrence = (function(superClass) {
    extend(ChangeOccurrence, superClass);

    function ChangeOccurrence() {
      return ChangeOccurrence.__super__.constructor.apply(this, arguments);
    }

    ChangeOccurrence.extend();

    ChangeOccurrence.description = "Change all matching word within target range";

    ChangeOccurrence.prototype.occurrence = true;

    return ChangeOccurrence;

  })(Change);

  Substitute = (function(superClass) {
    extend(Substitute, superClass);

    function Substitute() {
      return Substitute.__super__.constructor.apply(this, arguments);
    }

    Substitute.extend();

    Substitute.prototype.target = 'MoveRight';

    return Substitute;

  })(Change);

  SubstituteLine = (function(superClass) {
    extend(SubstituteLine, superClass);

    function SubstituteLine() {
      return SubstituteLine.__super__.constructor.apply(this, arguments);
    }

    SubstituteLine.extend();

    SubstituteLine.prototype.wise = 'linewise';

    SubstituteLine.prototype.target = 'MoveToRelativeLine';

    return SubstituteLine;

  })(Change);

  ChangeLine = (function(superClass) {
    extend(ChangeLine, superClass);

    function ChangeLine() {
      return ChangeLine.__super__.constructor.apply(this, arguments);
    }

    ChangeLine.extend();

    return ChangeLine;

  })(SubstituteLine);

  ChangeToLastCharacterOfLine = (function(superClass) {
    extend(ChangeToLastCharacterOfLine, superClass);

    function ChangeToLastCharacterOfLine() {
      return ChangeToLastCharacterOfLine.__super__.constructor.apply(this, arguments);
    }

    ChangeToLastCharacterOfLine.extend();

    ChangeToLastCharacterOfLine.prototype.target = 'MoveToLastCharacterOfLine';

    ChangeToLastCharacterOfLine.prototype.execute = function() {
      if (this.target.wise === 'blockwise') {
        this.onDidSelectTarget((function(_this) {
          return function() {
            var blockwiseSelection, i, len, ref1, results;
            ref1 = _this.getBlockwiseSelections();
            results = [];
            for (i = 0, len = ref1.length; i < len; i++) {
              blockwiseSelection = ref1[i];
              results.push(blockwiseSelection.extendMemberSelectionsToEndOfLine());
            }
            return results;
          };
        })(this));
      }
      return ChangeToLastCharacterOfLine.__super__.execute.apply(this, arguments);
    };

    return ChangeToLastCharacterOfLine;

  })(Change);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvb3BlcmF0b3ItaW5zZXJ0LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsNHVCQUFBO0lBQUE7OztFQUFBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVI7O0VBQ0gsUUFBUyxPQUFBLENBQVEsTUFBUjs7RUFFVixNQU1JLE9BQUEsQ0FBUSxTQUFSLENBTkosRUFDRSxtQ0FERixFQUVFLHFDQUZGLEVBR0UsNkJBSEYsRUFJRSwyQkFKRixFQUtFOztFQUVGLFFBQUEsR0FBVyxPQUFBLENBQVEsUUFBUixDQUFpQixDQUFDLFFBQWxCLENBQTJCLFVBQTNCOztFQU1MOzs7Ozs7O0lBQ0osa0JBQUMsQ0FBQSxNQUFELENBQUE7O2lDQUNBLGFBQUEsR0FBZTs7aUNBQ2YsV0FBQSxHQUFhOztpQ0FDYixZQUFBLEdBQWM7O2lDQUNkLHFCQUFBLEdBQXVCOztpQ0FFdkIseUJBQUEsR0FBMkIsU0FBQTtBQUN6QixVQUFBO2FBQUEsVUFBQSxHQUFhLElBQUMsQ0FBQSxRQUFRLENBQUMsV0FBVyxDQUFDLHlCQUF0QixDQUFnRCxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsR0FBRDtBQUMzRCxjQUFBO1VBRDZELE9BQUQ7VUFDNUQsSUFBYyxJQUFBLEtBQVEsUUFBdEI7QUFBQSxtQkFBQTs7VUFDQSxVQUFVLENBQUMsT0FBWCxDQUFBO1VBRUEsS0FBQyxDQUFBLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBZixDQUFtQixHQUFuQixFQUF3QixLQUFDLENBQUEsTUFBTSxDQUFDLHVCQUFSLENBQUEsQ0FBeEI7VUFDQSxlQUFBLEdBQWtCO1VBQ2xCLElBQUcsTUFBQSxHQUFTLEtBQUMsQ0FBQSx3QkFBRCxDQUEwQixRQUExQixDQUFaO1lBQ0UsS0FBQyxDQUFBLFVBQUQsR0FBYztZQUNkLEtBQUMsQ0FBQSxnQkFB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LFFBQWpCLENBQUEsR0FGRjtTQUFBLE1BQUE7dUJBSUUsU0FBUyxDQUFDLFVBQVYsQ0FBcUIsRUFBckIsRUFBeUI7WUFBQSxVQUFBLEVBQVksSUFBWjtXQUF6QixHQUpGOztBQUZGOztJQVBVOzs7O0tBTk87O0VBcUJmOzs7Ozs7O0lBQ0osZ0JBQUMsQ0FBQSxNQUFELENBQUE7O0lBQ0EsZ0JBQUMsQ0FBQSxXQUFELEdBQWM7OytCQUNkLFVBQUEsR0FBWTs7OztLQUhpQjs7RUFLekI7Ozs7Ozs7SUFDSixVQUFDLENBQUEsTUFBRCxDQUFBOzt5QkFDQSxNQUFBLEdBQVE7Ozs7S0FGZTs7RUFJbkI7Ozs7Ozs7SUFDSixjQUFDLENBQUEsTUFBRCxDQUFBOzs2QkFDQSxJQUFBLEdBQU07OzZCQUNOLE1BQUEsR0FBUTs7OztLQUhtQjs7RUFNdkI7Ozs7Ozs7SUFDSixVQUFDLENBQUEsTUFBRCxDQUFBOzs7O0tBRHVCOztFQUduQjs7Ozs7OztJQUNKLDJCQUFDLENBQUEsTUFBRCxDQUFBOzswQ0FDQSxNQUFBLEdBQVE7OzBDQUVSLE9BQUEsR0FBUyxTQUFBO01BQ1AsSUFBRyxJQUFDLENBQUEsTUFBTSxDQUFDLElBQVIsS0FBZ0IsV0FBbkI7UUFDRSxJQUFDLENBQUEsaUJBQUQsQ0FBbUIsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQTtBQUNqQixnQkFBQTtBQUFBO0FBQUE7aUJBQUEsc0NBQUE7OzJCQUNFLGtCQUFrQixDQUFDLGlDQUFuQixDQUFBO0FBREY7O1VBRGlCO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFuQixFQURGOzthQUlBLDBEQUFBLFNBQUE7SUFMTzs7OztLQUorQjtBQTNXMUMiLCJzb3VyY2VzQ29udGVudCI6WyJfID0gcmVxdWlyZSAndW5kZXJzY29yZS1wbHVzJ1xue1JhbmdlfSA9IHJlcXVpcmUgJ2F0b20nXG5cbntcbiAgbW92ZUN1cnNvckxlZnRcbiAgbW92ZUN1cnNvclJpZ2h0XG4gIGxpbWl0TnVtYmVyXG4gIGlzRW1wdHlSb3dcbiAgc2V0QnVmZmVyUm93XG59ID0gcmVxdWlyZSAnLi91dGlscydcbk9wZXJhdG9yID0gcmVxdWlyZSgnLi9iYXNlJykuZ2V0Q2xhc3MoJ09wZXJhdG9yJylcblxuIyBPcGVyYXRvciB3aGljaCBzdGFydCAnaW5zZXJ0LW1vZGUnXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgW05PVEVdXG4jIFJ1bGU6IERvbid0IG1ha2UgYW55IHRleHQgbXV0YXRpb24gYmVmb3JlIGNhbGxpbmcgYEBzZWxlY3RUYXJnZXQoKWAuXG5jbGFzcyBBY3RpdmF0ZUluc2VydE1vZGUgZXh0ZW5kcyBPcGVyYXRvclxuICBAZXh0ZW5kKClcbiAgcmVxdWlyZVRhcmdldDogZmFsc2VcbiAgZmxhc2hUYXJnZXQ6IGZhbHNlXG4gIGZpbmFsU3VibW9kZTogbnVsbFxuICBzdXBwb3J0SW5zZXJ0aW9uQ291bnQ6IHRydWVcblxuICBvYnNlcnZlV2lsbERlYWN0aXZhdGVNb2RlOiAtPlxuICAgIGRpc3Bvc2FibGUgPSBAdmltU3RhdGUubW9kZU1hbmFnZXIucHJlZW1wdFdpbGxEZWFjdGl2YXRlTW9kZSAoe21vZGV9KSA9PlxuICAgICAgcmV0dXJuIHVubGVzcyBtb2RlIGlzICdpbnNlcnQnXG4gICAgICBkaXNwb3NhYmxlLmRpc3Bvc2UoKVxuXG4gICAgICBAdmltU3RhdGUubWFyay5zZXQoJ14nLCBAZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCkpICMgTGFzdCBpbnNlcnQtbW9kZSBwb3NpdGlvblxuICAgICAgdGV4dEJ5VXNlcklucHV0ID0gJydcbiAgICAgIGlmIGNoYW5nZSA9IEBnZXRDaGFuZ2VTaW5jZUNoZWNrcG9pbnQoJ2luc2VydCcpXG4gICAgICAgIEBsYXN0Q2hhbmdlID0gY2hhbmdlXG4gICAgICAgIEBzZXRNYXJrRm9yQ2hhbmdlKG5ldyBSYW5nZShjaGFuZ2Uuc3RhcnQsIGNoYW5nZS5zdGFydC50cmF2ZXJzZShjaGFuZ2UubmV3RXh0ZW50KSkpXG4gICAgICAgIHRleHRCeVVzZXJJbnB1dCA9IGNoYW5nZS5uZXdUZXh0XG4gICAgICBAdmltU3RhdGUucmVnaXN0ZXIuc2V0KCcuJywgdGV4dDogdGV4dEJ5VXNlcklucHV0KSAjIExhc3QgaW5zZXJ0ZWQgdGV4dFxuXG4gICAgICBfLnRpbWVzIEBnZXRJbnNlcnRpb25Db3VudCgpLCA9PlxuICAgICAgICB0ZXh0ID0gQHRleHRCeU9wZXJhdG9yICsgdGV4dEJ5VXNlcklucHV0XG4gICAgICAgIGZvciBzZWxlY3Rpb24gaW4gQGVkaXRvci5nZXRTZWxlY3Rpb25zKClcbiAgICAgICAgICBzZWxlY3Rpb24uaW5zZXJ0VGV4dCh0ZXh0LCBhdXRvSW5kZW50OiB0cnVlKVxuXG4gICAgICAjIFRoaXMgY3Vyc29yIHN0YXRlIGlzIHJlc3RvcmVkIG9uIHVuZG8uXG4gICAgICAjIFNvIGN1cnNvciBzdGF0ZSBoYXMgdG8gYmUgdXBkYXRlZCBiZWZvcmUgbmV4dCBncm91cENoYW5nZXNTaW5jZUNoZWNrcG9pbnQoKVxuICAgICAgaWYgQGdldENvbmZpZygnY2xlYXJNdWx0aXBsZUN1cnNvcnNPbkVzY2FwZUluc2VydE1vZGUnKVxuICAgICAgICBAdmltU3RhdGUuY2xlYXJTZWxlY3Rpb25zKClcblxuICAgICAgIyBncm91cGluZyBjaGFuZ2VzIGZvciB1bmRvIGNoZWNrcG9pbnQgbmVlZCB0byBjb21lIGxhc3RcbiAgICAgIGlmIEBnZXRDb25maWcoJ2dyb3VwQ2hhbmdlc1doZW5MZWF2aW5nSW5zZXJ0TW9kZScpXG4gICAgICAgIEBncm91cENoYW5nZXNTaW5jZUJ1ZmZlckNoZWNrcG9pbnQoJ3VuZG8nKVxuXG4gICMgV2hlbiBlYWNoIG11dGFpb24ncyBleHRlbnQgaXMgbm90IGludGVyc2VjdGluZywgbXVpdGlwbGUgY2hhbmdlcyBhcmUgcmVjb3JkZWRcbiAgIyBlLmdcbiAgIyAgLSBNdWx0aWN1cnNvcnMgZWRpdFxuICAjICAtIEN1cnNvciBtb3ZlZCBpbiBpbnNlcnQtbW9kZShlLmcgY3RybC1mLCBjdHJsLWIpXG4gICMgQnV0IEkgZG9uJ3QgY2FyZSBtdWx0aXBsZSBjaGFuZ2VzIGp1c3QgYmVjYXVzZSBJJ20gbGF6eShzbyBub3QgcGVyZmVjdCBpbXBsZW1lbnRhdGlvbikuXG4gICMgSSBvbmx5IHRha2UgY2FyZSBvZiBvbmUgY2hhbmdlIGhhcHBlbmVkIGF0IGVhcmxpZXN0KHRvcEN1cnNvcidzIGNoYW5nZSkgcG9zaXRpb24uXG4gICMgVGhhdHMnIHdoeSBJIHNhdmUgdG9wQ3Vyc29yJ3MgcG9zaXRpb24gdG8gQHRvcEN1cnNvclBvc2l0aW9uQXRJbnNlcnRpb25TdGFydCB0byBjb21wYXJlIHRyYXZlcnNhbCB0byBkZWxldGlvblN0YXJ0XG4gICMgV2h5IEkgdXNlIHRvcEN1cnNvcidzIGNoYW5nZT8gSnVzdCBiZWNhdXNlIGl0J3MgZWFzeSB0byB1c2UgZmlyc3QgY2hhbmdlIHJldHVybmVkIGJ5IGdldENoYW5nZVNpbmNlQ2hlY2twb2ludCgpLlxuICBnZXRDaGFuZ2VTaW5jZUNoZWNrcG9pbnQ6IChwdXJwb3NlKSAtPlxuICAgIGNoZWNrcG9pbnQgPSBAZ2V0QnVmZmVyQ2hlY2twb2ludChwdXJwb3NlKVxuICAgIEBlZGl0b3IuYnVmZmVyLmdldENoYW5nZXNTaW5jZUNoZWNrcG9pbnQoY2hlY2twb2ludClbMF1cblxuICAjIFtCVUctQlVULU9LXSBSZXBsYXlpbmcgdGV4dC1kZWxldGlvbi1vcGVyYXRpb24gaXMgbm90IGNvbXBhdGlibGUgdG8gcHVyZSBWaW0uXG4gICMgUHVyZSBWaW0gcmVjb3JkIGFsbCBvcGVyYXRpb24gaW4gaW5zZXJ0LW1vZGUgYXMga2V5c3Ryb2tlIGxldmVsIGFuZCBjYW4gZGlzdGluZ3Vpc2hcbiAgIyBjaGFyYWN0ZXIgZGVsZXRlZCBieSBgRGVsZXRlYCBvciBieSBgY3RybC11YC5cbiAgIyBCdXQgSSBjYW4gbm90IGFuZCBkb24ndCB0cnlpbmcgdG8gbWluaWMgdGhpcyBsZXZlbCBvZiBjb21wYXRpYmlsaXR5LlxuICAjIFNvIGJhc2ljYWxseSBkZWxldGlvbi1kb25lLWluLW9uZSBpcyBleHBlY3RlZCB0byB3b3JrIHdlbGwuXG4gIHJlcGxheUxhc3RDaGFuZ2U6IChzZWxlY3Rpb24pIC0+XG4gICAgaWYgQGxhc3RDaGFuZ2U/XG4gICAgICB7c3RhcnQsIG5ld0V4dGVudCwgb2xkRXh0ZW50LCBuZXdUZXh0fSA9IEBsYXN0Q2hhbmdlXG4gICAgICB1bmxlc3Mgb2xkRXh0ZW50LmlzWmVybygpXG4gICAgICAgIHRyYXZlcnNhbFRvU3RhcnRPZkRlbGV0ZSA9IHN0YXJ0LnRyYXZlcnNhbEZyb20oQHRvcEN1cnNvclBvc2l0aW9uQXRJbnNlcnRpb25TdGFydClcbiAgICAgICAgZGVsZXRpb25TdGFydCA9IHNlbGVjdGlvbi5jdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKS50cmF2ZXJzZSh0cmF2ZXJzYWxUb1N0YXJ0T2ZEZWxldGUpXG4gICAgICAgIGRlbGV0aW9uRW5kID0gZGVsZXRpb25TdGFydC50cmF2ZXJzZShvbGRFeHRlbnQpXG4gICAgICAgIHNlbGVjdGlvbi5zZXRCdWZmZXJSYW5nZShbZGVsZXRpb25TdGFydCwgZGVsZXRpb25FbmRdKVxuICAgIGVsc2VcbiAgICAgIG5ld1RleHQgPSAnJ1xuICAgIHNlbGVjdGlvbi5pbnNlcnRUZXh0KG5ld1RleHQsIGF1dG9JbmRlbnQ6IHRydWUpXG5cbiAgIyBjYWxsZWQgd2hlbiByZXBlYXRlZFxuICAjIFtGSVhNRV0gdG8gdXNlIHJlcGxheUxhc3RDaGFuZ2UgaW4gcmVwZWF0SW5zZXJ0IG92ZXJyaWRpbmcgc3ViY2xhc3NzLlxuICByZXBlYXRJbnNlcnQ6IChzZWxlY3Rpb24sIHRleHQpIC0+XG4gICAgQHJlcGxheUxhc3RDaGFuZ2Uoc2VsZWN0aW9uKVxuXG4gIGdldEluc2VydGlvbkNvdW50OiAtPlxuICAgIEBpbnNlcnRpb25Db3VudCA/PSBpZiBAc3VwcG9ydEluc2VydGlvbkNvdW50IHRoZW4gQGdldENvdW50KC0xKSBlbHNlIDBcbiAgICAjIEF2b2lkIGZyZWV6aW5nIGJ5IGFjY2NpZGVudGFsIGJpZyBjb3VudChlLmcuIGA1NTU1NTU1NTU1NTU1aWApLCBTZWUgIzU2MCwgIzU5NlxuICAgIGxpbWl0TnVtYmVyKEBpbnNlcnRpb25Db3VudCwgbWF4OiAxMDApXG5cbiAgaW52ZXN0aWdhdGVDdXJzb3JQb3NpdGlvbjogLT5cbiAgICBbYzEsIGMyLCBjM10gPSBbXVxuICAgIGMxID0gQGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpXG5cbiAgICBAb25XaWxsQWN0aXZhdGVNb2RlICh7bW9kZSwgc3VibW9kZX0pID0+XG4gICAgICBjMiA9IEBlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKVxuICAgICAgY29uc29sZS5pbmZvICdkaWZmIGMxLCBjMicsIGMxLnRvU3RyaW5nKCksIGMyLnRvU3RyaW5nKCkgdW5sZXNzIGMxLmlzRXF1YWwoYzIpXG5cbiAgICBAb25EaWRBY3RpdmF0ZU1vZGUgKHttb2RlLCBzdWJtb2RlfSkgPT5cbiAgICAgIGMzID0gQGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpXG4gICAgICBpZiBjMi5yb3cgaXNudCBjMy5yb3dcbiAgICAgICAgY29uc29sZS53YXJuICdkZmYgYzIsIGMzJywgYzIudG9TdHJpbmcoKSwgYzMudG9TdHJpbmcoKVxuXG4gIGV4ZWN1dGU6IC0+XG4gICAgaWYgQHJlcGVhdGVkXG4gICAgICBAZmxhc2hUYXJnZXQgPSBAdHJhY2tDaGFuZ2UgPSB0cnVlXG5cbiAgICAgIEBzdGFydE11dGF0aW9uID0+XG4gICAgICAgIEBzZWxlY3RUYXJnZXQoKSBpZiBAdGFyZ2V0P1xuICAgICAgICBAbXV0YXRlVGV4dD8oKVxuICAgICAgICBmb3Igc2VsZWN0aW9uIGluIEBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpXG4gICAgICAgICAgQHJlcGVhdEluc2VydChzZWxlY3Rpb24sIEBsYXN0Q2hhbmdlPy5uZXdUZXh0ID8gJycpXG4gICAgICAgICAgbW92ZUN1cnNvckxlZnQoc2VsZWN0aW9uLmN1cnNvcilcbiAgICAgICAgQG11dGF0aW9uTWFuYWdlci5zZXRDaGVja3BvaW50KCdkaWQtZmluaXNoJylcblxuICAgICAgaWYgQGdldENvbmZpZygnY2xlYXJNdWx0aXBsZUN1cnNvcnNPbkVzY2FwZUluc2VydE1vZGUnKVxuICAgICAgICBAdmltU3RhdGUuY2xlYXJTZWxlY3Rpb25zKClcblxuICAgIGVsc2VcbiAgICAgIEBpbnZlc3RpZ2F0ZUN1cnNvclBvc2l0aW9uKCkgaWYgQGdldENvbmZpZyhcImRlYnVnXCIpXG5cbiAgICAgIEBub3JtYWxpemVTZWxlY3Rpb25zSWZOZWNlc3NhcnkoKVxuICAgICAgQGNyZWF0ZUJ1ZmZlckNoZWNrcG9pbnQoJ3VuZG8nKVxuICAgICAgQHNlbGVjdFRhcmdldCgpIGlmIEB0YXJnZXQ/XG4gICAgICBAb2JzZXJ2ZVdpbGxEZWFjdGl2YXRlTW9kZSgpXG5cbiAgICAgIEBtdXRhdGVUZXh0PygpXG5cbiAgICAgIGlmIEBnZXRJbnNlcnRpb25Db3VudCgpID4gMFxuICAgICAgICBAdGV4dEJ5T3BlcmF0b3IgPSBAZ2V0Q2hhbmdlU2luY2VDaGVja3BvaW50KCd1bmRvJyk/Lm5ld1RleHQgPyAnJ1xuXG4gICAgICBAY3JlYXRlQnVmZmVyQ2hlY2twb2ludCgnaW5zZXJ0JylcbiAgICAgIHRvcEN1cnNvciA9IEBlZGl0b3IuZ2V0Q3Vyc29yc09yZGVyZWRCeUJ1ZmZlclBvc2l0aW9uKClbMF1cbiAgICAgIEB0b3BDdXJzb3JQb3NpdGlvbkF0SW5zZXJ0aW9uU3RhcnQgPSB0b3BDdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuXG4gICAgICAjIFNraXAgbm9ybWFsaXphdGlvbiBvZiBibG9ja3dpc2VTZWxlY3Rpb24uXG4gICAgICAjIFNpbmNlIHdhbnQgdG8ga2VlcCBtdWx0aS1jdXJzb3IgYW5kIGl0J3MgcG9zaXRpb24gaW4gd2hlbiBzaGlmdCB0byBpbnNlcnQtbW9kZS5cbiAgICAgIGZvciBibG9ja3dpc2VTZWxlY3Rpb24gaW4gQGdldEJsb2Nrd2lzZVNlbGVjdGlvbnMoKVxuICAgICAgICBibG9ja3dpc2VTZWxlY3Rpb24uc2tpcE5vcm1hbGl6YXRpb24oKVxuICAgICAgQGFjdGl2YXRlTW9kZSgnaW5zZXJ0JywgQGZpbmFsU3VibW9kZSlcblxuY2xhc3MgQWN0aXZhdGVSZXBsYWNlTW9kZSBleHRlbmRzIEFjdGl2YXRlSW5zZXJ0TW9kZVxuICBAZXh0ZW5kKClcbiAgZmluYWxTdWJtb2RlOiAncmVwbGFjZSdcblxuICByZXBlYXRJbnNlcnQ6IChzZWxlY3Rpb24sIHRleHQpIC0+XG4gICAgZm9yIGNoYXIgaW4gdGV4dCB3aGVuIChjaGFyIGlzbnQgXCJcXG5cIilcbiAgICAgIGJyZWFrIGlmIHNlbGVjdGlvbi5jdXJzb3IuaXNBdEVuZE9mTGluZSgpXG4gICAgICBzZWxlY3Rpb24uc2VsZWN0UmlnaHQoKVxuICAgIHNlbGVjdGlvbi5pbnNlcnRUZXh0KHRleHQsIGF1dG9JbmRlbnQ6IGZhbHNlKVxuXG5jbGFzcyBJbnNlcnRBZnRlciBleHRlbmRzIEFjdGl2YXRlSW5zZXJ0TW9kZVxuICBAZXh0ZW5kKClcbiAgZXhlY3V0ZTogLT5cbiAgICBtb3ZlQ3Vyc29yUmlnaHQoY3Vyc29yKSBmb3IgY3Vyc29yIGluIEBlZGl0b3IuZ2V0Q3Vyc29ycygpXG4gICAgc3VwZXJcblxuIyBrZXk6ICdnIEknIGluIGFsbCBtb2RlXG5jbGFzcyBJbnNlcnRBdEJlZ2lubmluZ09mTGluZSBleHRlbmRzIEFjdGl2YXRlSW5zZXJ0TW9kZVxuICBAZXh0ZW5kKClcbiAgZXhlY3V0ZTogLT5cbiAgICBpZiBAbW9kZSBpcyAndmlzdWFsJyBhbmQgQHN1Ym1vZGUgaW4gWydjaGFyYWN0ZXJ3aXNlJywgJ2xpbmV3aXNlJ11cbiAgICAgIEBlZGl0b3Iuc3BsaXRTZWxlY3Rpb25zSW50b0xpbmVzKClcbiAgICBAZWRpdG9yLm1vdmVUb0JlZ2lubmluZ09mTGluZSgpXG4gICAgc3VwZXJcblxuIyBrZXk6IG5vcm1hbCAnQSdcbmNsYXNzIEluc2VydEFmdGVyRW5kT2ZMaW5lIGV4dGVuZHMgQWN0aXZhdGVJbnNlcnRNb2RlXG4gIEBleHRlbmQoKVxuICBleGVjdXRlOiAtPlxuICAgIEBlZGl0b3IubW92ZVRvRW5kT2ZMaW5lKClcbiAgICBzdXBlclxuXG4jIGtleTogbm9ybWFsICdJJ1xuY2xhc3MgSW5zZXJ0QXRGaXJzdENoYXJhY3Rlck9mTGluZSBleHRlbmRzIEFjdGl2YXRlSW5zZXJ0TW9kZVxuICBAZXh0ZW5kKClcbiAgZXhlY3V0ZTogLT5cbiAgICBAZWRpdG9yLm1vdmVUb0JlZ2lubmluZ09mTGluZSgpXG4gICAgQGVkaXRvci5tb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZSgpXG4gICAgc3VwZXJcblxuY2xhc3MgSW5zZXJ0QXRMYXN0SW5zZXJ0IGV4dGVuZHMgQWN0aXZhdGVJbnNlcnRNb2RlXG4gIEBleHRlbmQoKVxuICBleGVjdXRlOiAtPlxuICAgIGlmIChwb2ludCA9IEB2aW1TdGF0ZS5tYXJrLmdldCgnXicpKVxuICAgICAgQGVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihwb2ludClcbiAgICAgIEBlZGl0b3Iuc2Nyb2xsVG9DdXJzb3JQb3NpdGlvbih7Y2VudGVyOiB0cnVlfSlcbiAgICBzdXBlclxuXG5jbGFzcyBJbnNlcnRBYm92ZVdpdGhOZXdsaW5lIGV4dGVuZHMgQWN0aXZhdGVJbnNlcnRNb2RlXG4gIEBleHRlbmQoKVxuXG4gIGluaXRpYWxpemU6IC0+XG4gICAgaWYgQGdldENvbmZpZygnZ3JvdXBDaGFuZ2VzV2hlbkxlYXZpbmdJbnNlcnRNb2RlJylcbiAgICAgIEBvcmlnaW5hbEN1cnNvclBvc2l0aW9uTWFya2VyID0gQGVkaXRvci5tYXJrQnVmZmVyUG9zaXRpb24oQGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpKVxuXG4gICMgVGhpcyBpcyBmb3IgYG9gIGFuZCBgT2Agb3BlcmF0b3IuXG4gICMgT24gdW5kby9yZWRvIHB1dCBjdXJzb3IgYXQgb3JpZ2luYWwgcG9pbnQgd2hlcmUgdXNlciB0eXBlIGBvYCBvciBgT2AuXG4gIGdyb3VwQ2hhbmdlc1NpbmNlQnVmZmVyQ2hlY2twb2ludDogLT5cbiAgICBsYXN0Q3Vyc29yID0gQGVkaXRvci5nZXRMYXN0Q3Vyc29yKClcbiAgICBjdXJzb3JQb3NpdGlvbiA9IGxhc3RDdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuICAgIGxhc3RDdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24oQG9yaWdpbmFsQ3Vyc29yUG9zaXRpb25NYXJrZXIuZ2V0SGVhZEJ1ZmZlclBvc2l0aW9uKCkpXG4gICAgQG9yaWdpbmFsQ3Vyc29yUG9zaXRpb25NYXJrZXIuZGVzdHJveSgpXG5cbiAgICBzdXBlclxuXG4gICAgbGFzdEN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihjdXJzb3JQb3NpdGlvbilcblxuICBhdXRvSW5kZW50RW1wdHlSb3dzOiAtPlxuICAgIGZvciBjdXJzb3IgaW4gQGVkaXRvci5nZXRDdXJzb3JzKClcbiAgICAgIHJvdyA9IGN1cnNvci5nZXRCdWZmZXJSb3coKVxuICAgICAgQGVkaXRvci5hdXRvSW5kZW50QnVmZmVyUm93KHJvdykgaWYgaXNFbXB0eVJvdyhAZWRpdG9yLCByb3cpXG5cbiAgbXV0YXRlVGV4dDogLT5cbiAgICBAZWRpdG9yLmluc2VydE5ld2xpbmVBYm92ZSgpXG4gICAgQGF1dG9JbmRlbnRFbXB0eVJvd3MoKSBpZiBAZWRpdG9yLmF1dG9JbmRlbnRcblxuICByZXBlYXRJbnNlcnQ6IChzZWxlY3Rpb24sIHRleHQpIC0+XG4gICAgc2VsZWN0aW9uLmluc2VydFRleHQodGV4dC50cmltTGVmdCgpLCBhdXRvSW5kZW50OiB0cnVlKVxuXG5jbGFzcyBJbnNlcnRCZWxvd1dpdGhOZXdsaW5lIGV4dGVuZHMgSW5zZXJ0QWJvdmVXaXRoTmV3bGluZVxuICBAZXh0ZW5kKClcbiAgbXV0YXRlVGV4dDogLT5cbiAgICBmb3IgY3Vyc29yIGluIEBlZGl0b3IuZ2V0Q3Vyc29ycygpIHdoZW4gY3Vyc29yUm93ID0gY3Vyc29yLmdldEJ1ZmZlclJvdygpXG4gICAgICBzZXRCdWZmZXJSb3coY3Vyc29yLCBAZ2V0Rm9sZEVuZFJvd0ZvclJvdyhjdXJzb3JSb3cpKVxuXG4gICAgQGVkaXRvci5pbnNlcnROZXdsaW5lQmVsb3coKVxuICAgIEBhdXRvSW5kZW50RW1wdHlSb3dzKCkgaWYgQGVkaXRvci5hdXRvSW5kZW50XG5cbiMgQWR2YW5jZWQgSW5zZXJ0aW9uXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIEluc2VydEJ5VGFyZ2V0IGV4dGVuZHMgQWN0aXZhdGVJbnNlcnRNb2RlXG4gIEBleHRlbmQoZmFsc2UpXG4gIHJlcXVpcmVUYXJnZXQ6IHRydWVcbiAgd2hpY2g6IG51bGwgIyBvbmUgb2YgWydzdGFydCcsICdlbmQnLCAnaGVhZCcsICd0YWlsJ11cblxuICBpbml0aWFsaXplOiAtPlxuICAgICMgSEFDS1xuICAgICMgV2hlbiBnIGkgaXMgbWFwcGVkIHRvIGBpbnNlcnQtYXQtc3RhcnQtb2YtdGFyZ2V0YC5cbiAgICAjIGBnIGkgMyBsYCBzdGFydCBpbnNlcnQgYXQgMyBjb2x1bW4gcmlnaHQgcG9zaXRpb24uXG4gICAgIyBJbiB0aGlzIGNhc2UsIHdlIGRvbid0IHdhbnQgcmVwZWF0IGluc2VydGlvbiAzIHRpbWVzLlxuICAgICMgVGhpcyBAZ2V0Q291bnQoKSBjYWxsIGNhY2hlIG51bWJlciBhdCB0aGUgdGltaW5nIEJFRk9SRSAnMycgaXMgc3BlY2lmaWVkLlxuICAgIEBnZXRDb3VudCgpXG4gICAgc3VwZXJcblxuICBleGVjdXRlOiAtPlxuICAgIEBvbkRpZFNlbGVjdFRhcmdldCA9PlxuICAgICAgIyBJbiB2Qy92TCwgd2hlbiBvY2N1cnJlbmNlIG1hcmtlciB3YXMgTk9UIHNlbGVjdGVkLFxuICAgICAgIyBpdCBiZWhhdmUncyB2ZXJ5IHNwZWNpYWxseVxuICAgICAgIyB2QzogYElgIGFuZCBgQWAgYmVoYXZlcyBhcyBzaG9mdCBoYW5kIG9mIGBjdHJsLXYgSWAgYW5kIGBjdHJsLXYgQWAuXG4gICAgICAjIHZMOiBgSWAgYW5kIGBBYCBwbGFjZSBjdXJzb3JzIGF0IGVhY2ggc2VsZWN0ZWQgbGluZXMgb2Ygc3RhcnQoIG9yIGVuZCApIG9mIG5vbi13aGl0ZS1zcGFjZSBjaGFyLlxuICAgICAgaWYgbm90IEBvY2N1cnJlbmNlU2VsZWN0ZWQgYW5kIEBtb2RlIGlzICd2aXN1YWwnIGFuZCBAc3VibW9kZSBpbiBbJ2NoYXJhY3Rlcndpc2UnLCAnbGluZXdpc2UnXVxuICAgICAgICBmb3IgJHNlbGVjdGlvbiBpbiBAc3dyYXAuZ2V0U2VsZWN0aW9ucyhAZWRpdG9yKVxuICAgICAgICAgICRzZWxlY3Rpb24ubm9ybWFsaXplKClcbiAgICAgICAgICAkc2VsZWN0aW9uLmFwcGx5V2lzZSgnYmxvY2t3aXNlJylcblxuICAgICAgICBpZiBAc3VibW9kZSBpcyAnbGluZXdpc2UnXG4gICAgICAgICAgZm9yIGJsb2Nrd2lzZVNlbGVjdGlvbiBpbiBAZ2V0QmxvY2t3aXNlU2VsZWN0aW9ucygpXG4gICAgICAgICAgICBibG9ja3dpc2VTZWxlY3Rpb24uZXhwYW5kTWVtYmVyU2VsZWN0aW9uc092ZXJMaW5lV2l0aFRyaW1SYW5nZSgpXG5cbiAgICAgIGZvciAkc2VsZWN0aW9uIGluIEBzd3JhcC5nZXRTZWxlY3Rpb25zKEBlZGl0b3IpXG4gICAgICAgICRzZWxlY3Rpb24uc2V0QnVmZmVyUG9zaXRpb25UbyhAd2hpY2gpXG4gICAgc3VwZXJcblxuIyBrZXk6ICdJJywgVXNlZCBpbiAndmlzdWFsLW1vZGUuY2hhcmFjdGVyd2lzZScsIHZpc3VhbC1tb2RlLmJsb2Nrd2lzZVxuY2xhc3MgSW5zZXJ0QXRTdGFydE9mVGFyZ2V0IGV4dGVuZHMgSW5zZXJ0QnlUYXJnZXRcbiAgQGV4dGVuZCgpXG4gIHdoaWNoOiAnc3RhcnQnXG5cbiMga2V5OiAnQScsIFVzZWQgaW4gJ3Zpc3VhbC1tb2RlLmNoYXJhY3Rlcndpc2UnLCAndmlzdWFsLW1vZGUuYmxvY2t3aXNlJ1xuY2xhc3MgSW5zZXJ0QXRFbmRPZlRhcmdldCBleHRlbmRzIEluc2VydEJ5VGFyZ2V0XG4gIEBleHRlbmQoKVxuICB3aGljaDogJ2VuZCdcblxuY2xhc3MgSW5zZXJ0QXRIZWFkT2ZUYXJnZXQgZXh0ZW5kcyBJbnNlcnRCeVRhcmdldFxuICBAZXh0ZW5kKClcbiAgd2hpY2g6ICdoZWFkJ1xuXG5jbGFzcyBJbnNlcnRBdFN0YXJ0T2ZPY2N1cnJlbmNlIGV4dGVuZHMgSW5zZXJ0QXRTdGFydE9mVGFyZ2V0XG4gIEBleHRlbmQoKVxuICBvY2N1cnJlbmNlOiB0cnVlXG5cbmNsYXNzIEluc2VydEF0RW5kT2ZPY2N1cnJlbmNlIGV4dGVuZHMgSW5zZXJ0QXRFbmRPZlRhcmdldFxuICBAZXh0ZW5kKClcbiAgb2NjdXJyZW5jZTogdHJ1ZVxuXG5jbGFzcyBJbnNlcnRBdEhlYWRPZk9jY3VycmVuY2UgZXh0ZW5kcyBJbnNlcnRBdEhlYWRPZlRhcmdldFxuICBAZXh0ZW5kKClcbiAgb2NjdXJyZW5jZTogdHJ1ZVxuXG5jbGFzcyBJbnNlcnRBdFN0YXJ0T2ZTdWJ3b3JkT2NjdXJyZW5jZSBleHRlbmRzIEluc2VydEF0U3RhcnRPZk9jY3VycmVuY2VcbiAgQGV4dGVuZCgpXG4gIG9jY3VycmVuY2VUeXBlOiAnc3Vid29yZCdcblxuY2xhc3MgSW5zZXJ0QXRFbmRPZlN1YndvcmRPY2N1cnJlbmNlIGV4dGVuZHMgSW5zZXJ0QXRFbmRPZk9jY3VycmVuY2VcbiAgQGV4dGVuZCgpXG4gIG9jY3VycmVuY2VUeXBlOiAnc3Vid29yZCdcblxuY2xhc3MgSW5zZXJ0QXRIZWFkT2ZTdWJ3b3JkT2NjdXJyZW5jZSBleHRlbmRzIEluc2VydEF0SGVhZE9mT2NjdXJyZW5jZVxuICBAZXh0ZW5kKClcbiAgb2NjdXJyZW5jZVR5cGU6ICdzdWJ3b3JkJ1xuXG5jbGFzcyBJbnNlcnRBdFN0YXJ0T2ZTbWFydFdvcmQgZXh0ZW5kcyBJbnNlcnRCeVRhcmdldFxuICBAZXh0ZW5kKClcbiAgd2hpY2g6ICdzdGFydCdcbiAgdGFyZ2V0OiBcIk1vdmVUb1ByZXZpb3VzU21hcnRXb3JkXCJcblxuY2xhc3MgSW5zZXJ0QXRFbmRPZlNtYXJ0V29yZCBleHRlbmRzIEluc2VydEJ5VGFyZ2V0XG4gIEBleHRlbmQoKVxuICB3aGljaDogJ2VuZCdcbiAgdGFyZ2V0OiBcIk1vdmVUb0VuZE9mU21hcnRXb3JkXCJcblxuY2xhc3MgSW5zZXJ0QXRQcmV2aW91c0ZvbGRTdGFydCBleHRlbmRzIEluc2VydEJ5VGFyZ2V0XG4gIEBleHRlbmQoKVxuICBAZGVzY3JpcHRpb246IFwiTW92ZSB0byBwcmV2aW91cyBmb2xkIHN0YXJ0IHRoZW4gZW50ZXIgaW5zZXJ0LW1vZGVcIlxuICB3aGljaDogJ3N0YXJ0J1xuICB0YXJnZXQ6ICdNb3ZlVG9QcmV2aW91c0ZvbGRTdGFydCdcblxuY2xhc3MgSW5zZXJ0QXROZXh0Rm9sZFN0YXJ0IGV4dGVuZHMgSW5zZXJ0QnlUYXJnZXRcbiAgQGV4dGVuZCgpXG4gIEBkZXNjcmlwdGlvbjogXCJNb3ZlIHRvIG5leHQgZm9sZCBzdGFydCB0aGVuIGVudGVyIGluc2VydC1tb2RlXCJcbiAgd2hpY2g6ICdlbmQnXG4gIHRhcmdldDogJ01vdmVUb05leHRGb2xkU3RhcnQnXG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgQ2hhbmdlIGV4dGVuZHMgQWN0aXZhdGVJbnNlcnRNb2RlXG4gIEBleHRlbmQoKVxuICByZXF1aXJlVGFyZ2V0OiB0cnVlXG4gIHRyYWNrQ2hhbmdlOiB0cnVlXG4gIHN1cHBvcnRJbnNlcnRpb25Db3VudDogZmFsc2VcblxuICBtdXRhdGVUZXh0OiAtPlxuICAgICMgQWxsd2F5cyBkeW5hbWljYWxseSBkZXRlcm1pbmUgc2VsZWN0aW9uIHdpc2Ugd3Rob3V0IGNvbnN1bHRpbmcgdGFyZ2V0Lndpc2VcbiAgICAjIFJlYXNvbjogd2hlbiBgYyBpIHtgLCB3aXNlIGlzICdjaGFyYWN0ZXJ3aXNlJywgYnV0IGFjdHVhbGx5IHNlbGVjdGVkIHJhbmdlIGlzICdsaW5ld2lzZSdcbiAgICAjICAge1xuICAgICMgICAgIGFcbiAgICAjICAgfVxuICAgIGlzTGluZXdpc2VUYXJnZXQgPSBAc3dyYXAuZGV0ZWN0V2lzZShAZWRpdG9yKSBpcyAnbGluZXdpc2UnXG4gICAgZm9yIHNlbGVjdGlvbiBpbiBAZWRpdG9yLmdldFNlbGVjdGlvbnMoKVxuICAgICAgQHNldFRleHRUb1JlZ2lzdGVyRm9yU2VsZWN0aW9uKHNlbGVjdGlvbikgdW5sZXNzIEBnZXRDb25maWcoJ2RvbnRVcGRhdGVSZWdpc3Rlck9uQ2hhbmdlT3JTdWJzdGl0dXRlJylcbiAgICAgIGlmIGlzTGluZXdpc2VUYXJnZXRcbiAgICAgICAgc2VsZWN0aW9uLmluc2VydFRleHQoXCJcXG5cIiwgYXV0b0luZGVudDogdHJ1ZSlcbiAgICAgICAgc2VsZWN0aW9uLmN1cnNvci5tb3ZlTGVmdCgpXG4gICAgICBlbHNlXG4gICAgICAgIHNlbGVjdGlvbi5pbnNlcnRUZXh0KCcnLCBhdXRvSW5kZW50OiB0cnVlKVxuXG5jbGFzcyBDaGFuZ2VPY2N1cnJlbmNlIGV4dGVuZHMgQ2hhbmdlXG4gIEBleHRlbmQoKVxuICBAZGVzY3JpcHRpb246IFwiQ2hhbmdlIGFsbCBtYXRjaGluZyB3b3JkIHdpdGhpbiB0YXJnZXQgcmFuZ2VcIlxuICBvY2N1cnJlbmNlOiB0cnVlXG5cbmNsYXNzIFN1YnN0aXR1dGUgZXh0ZW5kcyBDaGFuZ2VcbiAgQGV4dGVuZCgpXG4gIHRhcmdldDogJ01vdmVSaWdodCdcblxuY2xhc3MgU3Vic3RpdHV0ZUxpbmUgZXh0ZW5kcyBDaGFuZ2VcbiAgQGV4dGVuZCgpXG4gIHdpc2U6ICdsaW5ld2lzZScgIyBbRklYTUVdIHRvIHJlLW92ZXJyaWRlIHRhcmdldC53aXNlIGluIHZpc3VhbC1tb2RlXG4gIHRhcmdldDogJ01vdmVUb1JlbGF0aXZlTGluZSdcblxuIyBhbGlhc1xuY2xhc3MgQ2hhbmdlTGluZSBleHRlbmRzIFN1YnN0aXR1dGVMaW5lXG4gIEBleHRlbmQoKVxuXG5jbGFzcyBDaGFuZ2VUb0xhc3RDaGFyYWN0ZXJPZkxpbmUgZXh0ZW5kcyBDaGFuZ2VcbiAgQGV4dGVuZCgpXG4gIHRhcmdldDogJ01vdmVUb0xhc3RDaGFyYWN0ZXJPZkxpbmUnXG5cbiAgZXhlY3V0ZTogLT5cbiAgICBpZiBAdGFyZ2V0Lndpc2UgaXMgJ2Jsb2Nrd2lzZSdcbiAgICAgIEBvbkRpZFNlbGVjdFRhcmdldCA9PlxuICAgICAgICBmb3IgYmxvY2t3aXNlU2VsZWN0aW9uIGluIEBnZXRCbG9ja3dpc2VTZWxlY3Rpb25zKClcbiAgICAgICAgICBibG9ja3dpc2VTZWxlY3Rpb24uZXh0ZW5kTWVtYmVyU2VsZWN0aW9uc1RvRW5kT2ZMaW5lKClcbiAgICBzdXBlclxuIl19
