(function() {
  var ActivateInsertMode, ActivateReplaceMode, Change, ChangeLine, ChangeOccurrence, ChangeToLastCharacterOfLine, InsertAboveWithNewline, InsertAfter, InsertAfterEndOfLine, InsertAtBeginningOfLine, InsertAtEndOfOccurrence, InsertAtEndOfSmartWord, InsertAtEndOfSubwordOccurrence, InsertAtEndOfTarget, InsertAtFirstCharacterOfLine, InsertAtHeadOfTarget, InsertAtLastInsert, InsertAtNextFoldStart, InsertAtPreviousFoldStart, InsertAtStartOfOccurrence, InsertAtStartOfSmartWord, InsertAtStartOfSubwordOccurrence, InsertAtStartOfTarget, InsertBelowWithNewline, InsertByTarget, Operator, Range, Substitute, SubstituteLine, _, isEmptyRow, limitNumber, moveCursorLeft, moveCursorRight, ref, setBufferRow,
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

    InsertAtStartOfOccurrence.prototype.which = 'start';

    InsertAtStartOfOccurrence.prototype.occurrence = true;

    return InsertAtStartOfOccurrence;

  })(InsertByTarget);

  InsertAtEndOfOccurrence = (function(superClass) {
    extend(InsertAtEndOfOccurrence, superClass);

    function InsertAtEndOfOccurrence() {
      return InsertAtEndOfOccurrence.__super__.constructor.apply(this, arguments);
    }

    InsertAtEndOfOccurrence.extend();

    InsertAtEndOfOccurrence.prototype.which = 'end';

    InsertAtEndOfOccurrence.prototype.occurrence = true;

    return InsertAtEndOfOccurrence;

  })(InsertByTarget);

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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvb3BlcmF0b3ItaW5zZXJ0LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsaXJCQUFBO0lBQUE7OztFQUFBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVI7O0VBQ0gsUUFBUyxPQUFBLENBQVEsTUFBUjs7RUFFVixNQU1JLE9BQUEsQ0FBUSxTQUFSLENBTkosRUFDRSxtQ0FERixFQUVFLHFDQUZGLEVBR0UsNkJBSEYsRUFJRSwyQkFKRixFQUtFOztFQUVGLFFBQUEsR0FBVyxPQUFBLENBQVEsUUFBUixDQUFpQixDQUFDLFFBQWxCLENBQTJCLFVBQTNCOztFQU1MOzs7Ozs7O0lBQ0osa0JBQUMsQ0FBQSxNQUFELENBQUE7O2lDQUNBLGFBQUEsR0FBZTs7aUNBQ2YsV0FBQSxHQUFhOztpQ0FDYixZQUFBLEdBQWM7O2lDQUNkLHFCQUFBLEdBQXVCOztpQ0FFdkIseUJBQUEsR0FBMkIsU0FBQTtBQUN6QixVQUFBO2FBQUEsVUFBQSxHQUFhLElBQUMsQ0FBQSxRQUFRLENBQUMsV0FBVyxDQUFDLHlCQUF0QixDQUFnRCxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsR0FBRDtBQUMzRCxjQUFBO1VBRDZELE9BQUQ7VUFDNUQsSUFBYyxJQUFBLEtBQVEsUUFBdEI7QUFBQSxtQkFBQTs7VUFDQSxVQUFVLENBQUMsT0FBWCxDQUFBO1VBRUEsS0FBQyxDQUFBLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBZixDQUFtQixHQUFuQixFQUF3QixLQUFDLENBQUEsTUFBTSxDQUFDLHVCQUFSLENBQUEsQ0FBeEI7VUFDQSxlQUFBLEdBQWtCO1VBQ2xCLElBQUcsTUFBQSxHQUFTLEtBQUMsQ0FBQSx3QkFBRCxDQUEwQixRQUExQixDQUFaO1lBQ0UsS0FBQyxDQUFBLFVBQUQsR0FBYztZQUNkLEtBQUMsQ0FBQSxnQkFB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O0FBRkY7O0lBUFU7Ozs7S0FOTzs7RUFxQmY7Ozs7Ozs7SUFDSixnQkFBQyxDQUFBLE1BQUQsQ0FBQTs7SUFDQSxnQkFBQyxDQUFBLFdBQUQsR0FBYzs7K0JBQ2QsVUFBQSxHQUFZOzs7O0tBSGlCOztFQUt6Qjs7Ozs7OztJQUNKLFVBQUMsQ0FBQSxNQUFELENBQUE7O3lCQUNBLE1BQUEsR0FBUTs7OztLQUZlOztFQUluQjs7Ozs7OztJQUNKLGNBQUMsQ0FBQSxNQUFELENBQUE7OzZCQUNBLElBQUEsR0FBTTs7NkJBQ04sTUFBQSxHQUFROzs7O0tBSG1COztFQU12Qjs7Ozs7OztJQUNKLFVBQUMsQ0FBQSxNQUFELENBQUE7Ozs7S0FEdUI7O0VBR25COzs7Ozs7O0lBQ0osMkJBQUMsQ0FBQSxNQUFELENBQUE7OzBDQUNBLE1BQUEsR0FBUTs7MENBRVIsT0FBQSxHQUFTLFNBQUE7TUFDUCxJQUFHLElBQUMsQ0FBQSxNQUFNLENBQUMsSUFBUixLQUFnQixXQUFuQjtRQUNFLElBQUMsQ0FBQSxpQkFBRCxDQUFtQixDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFBO0FBQ2pCLGdCQUFBO0FBQUE7QUFBQTtpQkFBQSxzQ0FBQTs7MkJBQ0Usa0JBQWtCLENBQUMsaUNBQW5CLENBQUE7QUFERjs7VUFEaUI7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQW5CLEVBREY7O2FBSUEsMERBQUEsU0FBQTtJQUxPOzs7O0tBSitCO0FBclcxQyIsInNvdXJjZXNDb250ZW50IjpbIl8gPSByZXF1aXJlICd1bmRlcnNjb3JlLXBsdXMnXG57UmFuZ2V9ID0gcmVxdWlyZSAnYXRvbSdcblxue1xuICBtb3ZlQ3Vyc29yTGVmdFxuICBtb3ZlQ3Vyc29yUmlnaHRcbiAgbGltaXROdW1iZXJcbiAgaXNFbXB0eVJvd1xuICBzZXRCdWZmZXJSb3dcbn0gPSByZXF1aXJlICcuL3V0aWxzJ1xuT3BlcmF0b3IgPSByZXF1aXJlKCcuL2Jhc2UnKS5nZXRDbGFzcygnT3BlcmF0b3InKVxuXG4jIE9wZXJhdG9yIHdoaWNoIHN0YXJ0ICdpbnNlcnQtbW9kZSdcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBbTk9URV1cbiMgUnVsZTogRG9uJ3QgbWFrZSBhbnkgdGV4dCBtdXRhdGlvbiBiZWZvcmUgY2FsbGluZyBgQHNlbGVjdFRhcmdldCgpYC5cbmNsYXNzIEFjdGl2YXRlSW5zZXJ0TW9kZSBleHRlbmRzIE9wZXJhdG9yXG4gIEBleHRlbmQoKVxuICByZXF1aXJlVGFyZ2V0OiBmYWxzZVxuICBmbGFzaFRhcmdldDogZmFsc2VcbiAgZmluYWxTdWJtb2RlOiBudWxsXG4gIHN1cHBvcnRJbnNlcnRpb25Db3VudDogdHJ1ZVxuXG4gIG9ic2VydmVXaWxsRGVhY3RpdmF0ZU1vZGU6IC0+XG4gICAgZGlzcG9zYWJsZSA9IEB2aW1TdGF0ZS5tb2RlTWFuYWdlci5wcmVlbXB0V2lsbERlYWN0aXZhdGVNb2RlICh7bW9kZX0pID0+XG4gICAgICByZXR1cm4gdW5sZXNzIG1vZGUgaXMgJ2luc2VydCdcbiAgICAgIGRpc3Bvc2FibGUuZGlzcG9zZSgpXG5cbiAgICAgIEB2aW1TdGF0ZS5tYXJrLnNldCgnXicsIEBlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKSkgIyBMYXN0IGluc2VydC1tb2RlIHBvc2l0aW9uXG4gICAgICB0ZXh0QnlVc2VySW5wdXQgPSAnJ1xuICAgICAgaWYgY2hhbmdlID0gQGdldENoYW5nZVNpbmNlQ2hlY2twb2ludCgnaW5zZXJ0JylcbiAgICAgICAgQGxhc3RDaGFuZ2UgPSBjaGFuZ2VcbiAgICAgICAgQHNldE1hcmtGb3JDaGFuZ2UobmV3IFJhbmdlKGNoYW5nZS5zdGFydCwgY2hhbmdlLnN0YXJ0LnRyYXZlcnNlKGNoYW5nZS5uZXdFeHRlbnQpKSlcbiAgICAgICAgdGV4dEJ5VXNlcklucHV0ID0gY2hhbmdlLm5ld1RleHRcbiAgICAgIEB2aW1TdGF0ZS5yZWdpc3Rlci5zZXQoJy4nLCB0ZXh0OiB0ZXh0QnlVc2VySW5wdXQpICMgTGFzdCBpbnNlcnRlZCB0ZXh0XG5cbiAgICAgIF8udGltZXMgQGdldEluc2VydGlvbkNvdW50KCksID0+XG4gICAgICAgIHRleHQgPSBAdGV4dEJ5T3BlcmF0b3IgKyB0ZXh0QnlVc2VySW5wdXRcbiAgICAgICAgZm9yIHNlbGVjdGlvbiBpbiBAZWRpdG9yLmdldFNlbGVjdGlvbnMoKVxuICAgICAgICAgIHNlbGVjdGlvbi5pbnNlcnRUZXh0KHRleHQsIGF1dG9JbmRlbnQ6IHRydWUpXG5cbiAgICAgICMgVGhpcyBjdXJzb3Igc3RhdGUgaXMgcmVzdG9yZWQgb24gdW5kby5cbiAgICAgICMgU28gY3Vyc29yIHN0YXRlIGhhcyB0byBiZSB1cGRhdGVkIGJlZm9yZSBuZXh0IGdyb3VwQ2hhbmdlc1NpbmNlQ2hlY2twb2ludCgpXG4gICAgICBpZiBAZ2V0Q29uZmlnKCdjbGVhck11bHRpcGxlQ3Vyc29yc09uRXNjYXBlSW5zZXJ0TW9kZScpXG4gICAgICAgIEB2aW1TdGF0ZS5jbGVhclNlbGVjdGlvbnMoKVxuXG4gICAgICAjIGdyb3VwaW5nIGNoYW5nZXMgZm9yIHVuZG8gY2hlY2twb2ludCBuZWVkIHRvIGNvbWUgbGFzdFxuICAgICAgaWYgQGdldENvbmZpZygnZ3JvdXBDaGFuZ2VzV2hlbkxlYXZpbmdJbnNlcnRNb2RlJylcbiAgICAgICAgQGdyb3VwQ2hhbmdlc1NpbmNlQnVmZmVyQ2hlY2twb2ludCgndW5kbycpXG5cbiAgIyBXaGVuIGVhY2ggbXV0YWlvbidzIGV4dGVudCBpcyBub3QgaW50ZXJzZWN0aW5nLCBtdWl0aXBsZSBjaGFuZ2VzIGFyZSByZWNvcmRlZFxuICAjIGUuZ1xuICAjICAtIE11bHRpY3Vyc29ycyBlZGl0XG4gICMgIC0gQ3Vyc29yIG1vdmVkIGluIGluc2VydC1tb2RlKGUuZyBjdHJsLWYsIGN0cmwtYilcbiAgIyBCdXQgSSBkb24ndCBjYXJlIG11bHRpcGxlIGNoYW5nZXMganVzdCBiZWNhdXNlIEknbSBsYXp5KHNvIG5vdCBwZXJmZWN0IGltcGxlbWVudGF0aW9uKS5cbiAgIyBJIG9ubHkgdGFrZSBjYXJlIG9mIG9uZSBjaGFuZ2UgaGFwcGVuZWQgYXQgZWFybGllc3QodG9wQ3Vyc29yJ3MgY2hhbmdlKSBwb3NpdGlvbi5cbiAgIyBUaGF0cycgd2h5IEkgc2F2ZSB0b3BDdXJzb3IncyBwb3NpdGlvbiB0byBAdG9wQ3Vyc29yUG9zaXRpb25BdEluc2VydGlvblN0YXJ0IHRvIGNvbXBhcmUgdHJhdmVyc2FsIHRvIGRlbGV0aW9uU3RhcnRcbiAgIyBXaHkgSSB1c2UgdG9wQ3Vyc29yJ3MgY2hhbmdlPyBKdXN0IGJlY2F1c2UgaXQncyBlYXN5IHRvIHVzZSBmaXJzdCBjaGFuZ2UgcmV0dXJuZWQgYnkgZ2V0Q2hhbmdlU2luY2VDaGVja3BvaW50KCkuXG4gIGdldENoYW5nZVNpbmNlQ2hlY2twb2ludDogKHB1cnBvc2UpIC0+XG4gICAgY2hlY2twb2ludCA9IEBnZXRCdWZmZXJDaGVja3BvaW50KHB1cnBvc2UpXG4gICAgQGVkaXRvci5idWZmZXIuZ2V0Q2hhbmdlc1NpbmNlQ2hlY2twb2ludChjaGVja3BvaW50KVswXVxuXG4gICMgW0JVRy1CVVQtT0tdIFJlcGxheWluZyB0ZXh0LWRlbGV0aW9uLW9wZXJhdGlvbiBpcyBub3QgY29tcGF0aWJsZSB0byBwdXJlIFZpbS5cbiAgIyBQdXJlIFZpbSByZWNvcmQgYWxsIG9wZXJhdGlvbiBpbiBpbnNlcnQtbW9kZSBhcyBrZXlzdHJva2UgbGV2ZWwgYW5kIGNhbiBkaXN0aW5ndWlzaFxuICAjIGNoYXJhY3RlciBkZWxldGVkIGJ5IGBEZWxldGVgIG9yIGJ5IGBjdHJsLXVgLlxuICAjIEJ1dCBJIGNhbiBub3QgYW5kIGRvbid0IHRyeWluZyB0byBtaW5pYyB0aGlzIGxldmVsIG9mIGNvbXBhdGliaWxpdHkuXG4gICMgU28gYmFzaWNhbGx5IGRlbGV0aW9uLWRvbmUtaW4tb25lIGlzIGV4cGVjdGVkIHRvIHdvcmsgd2VsbC5cbiAgcmVwbGF5TGFzdENoYW5nZTogKHNlbGVjdGlvbikgLT5cbiAgICBpZiBAbGFzdENoYW5nZT9cbiAgICAgIHtzdGFydCwgbmV3RXh0ZW50LCBvbGRFeHRlbnQsIG5ld1RleHR9ID0gQGxhc3RDaGFuZ2VcbiAgICAgIHVubGVzcyBvbGRFeHRlbnQuaXNaZXJvKClcbiAgICAgICAgdHJhdmVyc2FsVG9TdGFydE9mRGVsZXRlID0gc3RhcnQudHJhdmVyc2FsRnJvbShAdG9wQ3Vyc29yUG9zaXRpb25BdEluc2VydGlvblN0YXJ0KVxuICAgICAgICBkZWxldGlvblN0YXJ0ID0gc2VsZWN0aW9uLmN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpLnRyYXZlcnNlKHRyYXZlcnNhbFRvU3RhcnRPZkRlbGV0ZSlcbiAgICAgICAgZGVsZXRpb25FbmQgPSBkZWxldGlvblN0YXJ0LnRyYXZlcnNlKG9sZEV4dGVudClcbiAgICAgICAgc2VsZWN0aW9uLnNldEJ1ZmZlclJhbmdlKFtkZWxldGlvblN0YXJ0LCBkZWxldGlvbkVuZF0pXG4gICAgZWxzZVxuICAgICAgbmV3VGV4dCA9ICcnXG4gICAgc2VsZWN0aW9uLmluc2VydFRleHQobmV3VGV4dCwgYXV0b0luZGVudDogdHJ1ZSlcblxuICAjIGNhbGxlZCB3aGVuIHJlcGVhdGVkXG4gICMgW0ZJWE1FXSB0byB1c2UgcmVwbGF5TGFzdENoYW5nZSBpbiByZXBlYXRJbnNlcnQgb3ZlcnJpZGluZyBzdWJjbGFzc3MuXG4gIHJlcGVhdEluc2VydDogKHNlbGVjdGlvbiwgdGV4dCkgLT5cbiAgICBAcmVwbGF5TGFzdENoYW5nZShzZWxlY3Rpb24pXG5cbiAgZ2V0SW5zZXJ0aW9uQ291bnQ6IC0+XG4gICAgQGluc2VydGlvbkNvdW50ID89IGlmIEBzdXBwb3J0SW5zZXJ0aW9uQ291bnQgdGhlbiBAZ2V0Q291bnQoLTEpIGVsc2UgMFxuICAgICMgQXZvaWQgZnJlZXppbmcgYnkgYWNjY2lkZW50YWwgYmlnIGNvdW50KGUuZy4gYDU1NTU1NTU1NTU1NTVpYCksIFNlZSAjNTYwLCAjNTk2XG4gICAgbGltaXROdW1iZXIoQGluc2VydGlvbkNvdW50LCBtYXg6IDEwMClcblxuICBpbnZlc3RpZ2F0ZUN1cnNvclBvc2l0aW9uOiAtPlxuICAgIFtjMSwgYzIsIGMzXSA9IFtdXG4gICAgYzEgPSBAZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKClcblxuICAgIEBvbldpbGxBY3RpdmF0ZU1vZGUgKHttb2RlLCBzdWJtb2RlfSkgPT5cbiAgICAgIGMyID0gQGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpXG4gICAgICBjb25zb2xlLmluZm8gJ2RpZmYgYzEsIGMyJywgYzEudG9TdHJpbmcoKSwgYzIudG9TdHJpbmcoKSB1bmxlc3MgYzEuaXNFcXVhbChjMilcblxuICAgIEBvbkRpZEFjdGl2YXRlTW9kZSAoe21vZGUsIHN1Ym1vZGV9KSA9PlxuICAgICAgYzMgPSBAZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKClcbiAgICAgIGlmIGMyLnJvdyBpc250IGMzLnJvd1xuICAgICAgICBjb25zb2xlLndhcm4gJ2RmZiBjMiwgYzMnLCBjMi50b1N0cmluZygpLCBjMy50b1N0cmluZygpXG5cbiAgZXhlY3V0ZTogLT5cbiAgICBpZiBAcmVwZWF0ZWRcbiAgICAgIEBmbGFzaFRhcmdldCA9IEB0cmFja0NoYW5nZSA9IHRydWVcblxuICAgICAgQHN0YXJ0TXV0YXRpb24gPT5cbiAgICAgICAgQHNlbGVjdFRhcmdldCgpIGlmIEB0YXJnZXQ/XG4gICAgICAgIEBtdXRhdGVUZXh0PygpXG4gICAgICAgIGZvciBzZWxlY3Rpb24gaW4gQGVkaXRvci5nZXRTZWxlY3Rpb25zKClcbiAgICAgICAgICBAcmVwZWF0SW5zZXJ0KHNlbGVjdGlvbiwgQGxhc3RDaGFuZ2U/Lm5ld1RleHQgPyAnJylcbiAgICAgICAgICBtb3ZlQ3Vyc29yTGVmdChzZWxlY3Rpb24uY3Vyc29yKVxuICAgICAgICBAbXV0YXRpb25NYW5hZ2VyLnNldENoZWNrcG9pbnQoJ2RpZC1maW5pc2gnKVxuXG4gICAgICBpZiBAZ2V0Q29uZmlnKCdjbGVhck11bHRpcGxlQ3Vyc29yc09uRXNjYXBlSW5zZXJ0TW9kZScpXG4gICAgICAgIEB2aW1TdGF0ZS5jbGVhclNlbGVjdGlvbnMoKVxuXG4gICAgZWxzZVxuICAgICAgQGludmVzdGlnYXRlQ3Vyc29yUG9zaXRpb24oKSBpZiBAZ2V0Q29uZmlnKFwiZGVidWdcIilcbiAgICAgIFxuICAgICAgQG5vcm1hbGl6ZVNlbGVjdGlvbnNJZk5lY2Vzc2FyeSgpXG4gICAgICBAY3JlYXRlQnVmZmVyQ2hlY2twb2ludCgndW5kbycpXG4gICAgICBAc2VsZWN0VGFyZ2V0KCkgaWYgQHRhcmdldD9cbiAgICAgIEBvYnNlcnZlV2lsbERlYWN0aXZhdGVNb2RlKClcblxuICAgICAgQG11dGF0ZVRleHQ/KClcblxuICAgICAgaWYgQGdldEluc2VydGlvbkNvdW50KCkgPiAwXG4gICAgICAgIEB0ZXh0QnlPcGVyYXRvciA9IEBnZXRDaGFuZ2VTaW5jZUNoZWNrcG9pbnQoJ3VuZG8nKT8ubmV3VGV4dCA/ICcnXG5cbiAgICAgIEBjcmVhdGVCdWZmZXJDaGVja3BvaW50KCdpbnNlcnQnKVxuICAgICAgdG9wQ3Vyc29yID0gQGVkaXRvci5nZXRDdXJzb3JzT3JkZXJlZEJ5QnVmZmVyUG9zaXRpb24oKVswXVxuICAgICAgQHRvcEN1cnNvclBvc2l0aW9uQXRJbnNlcnRpb25TdGFydCA9IHRvcEN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXG5cbiAgICAgICMgU2tpcCBub3JtYWxpemF0aW9uIG9mIGJsb2Nrd2lzZVNlbGVjdGlvbi5cbiAgICAgICMgU2luY2Ugd2FudCB0byBrZWVwIG11bHRpLWN1cnNvciBhbmQgaXQncyBwb3NpdGlvbiBpbiB3aGVuIHNoaWZ0IHRvIGluc2VydC1tb2RlLlxuICAgICAgZm9yIGJsb2Nrd2lzZVNlbGVjdGlvbiBpbiBAZ2V0QmxvY2t3aXNlU2VsZWN0aW9ucygpXG4gICAgICAgIGJsb2Nrd2lzZVNlbGVjdGlvbi5za2lwTm9ybWFsaXphdGlvbigpXG4gICAgICBAYWN0aXZhdGVNb2RlKCdpbnNlcnQnLCBAZmluYWxTdWJtb2RlKVxuXG5jbGFzcyBBY3RpdmF0ZVJlcGxhY2VNb2RlIGV4dGVuZHMgQWN0aXZhdGVJbnNlcnRNb2RlXG4gIEBleHRlbmQoKVxuICBmaW5hbFN1Ym1vZGU6ICdyZXBsYWNlJ1xuXG4gIHJlcGVhdEluc2VydDogKHNlbGVjdGlvbiwgdGV4dCkgLT5cbiAgICBmb3IgY2hhciBpbiB0ZXh0IHdoZW4gKGNoYXIgaXNudCBcIlxcblwiKVxuICAgICAgYnJlYWsgaWYgc2VsZWN0aW9uLmN1cnNvci5pc0F0RW5kT2ZMaW5lKClcbiAgICAgIHNlbGVjdGlvbi5zZWxlY3RSaWdodCgpXG4gICAgc2VsZWN0aW9uLmluc2VydFRleHQodGV4dCwgYXV0b0luZGVudDogZmFsc2UpXG5cbmNsYXNzIEluc2VydEFmdGVyIGV4dGVuZHMgQWN0aXZhdGVJbnNlcnRNb2RlXG4gIEBleHRlbmQoKVxuICBleGVjdXRlOiAtPlxuICAgIG1vdmVDdXJzb3JSaWdodChjdXJzb3IpIGZvciBjdXJzb3IgaW4gQGVkaXRvci5nZXRDdXJzb3JzKClcbiAgICBzdXBlclxuXG4jIGtleTogJ2cgSScgaW4gYWxsIG1vZGVcbmNsYXNzIEluc2VydEF0QmVnaW5uaW5nT2ZMaW5lIGV4dGVuZHMgQWN0aXZhdGVJbnNlcnRNb2RlXG4gIEBleHRlbmQoKVxuICBleGVjdXRlOiAtPlxuICAgIGlmIEBtb2RlIGlzICd2aXN1YWwnIGFuZCBAc3VibW9kZSBpbiBbJ2NoYXJhY3Rlcndpc2UnLCAnbGluZXdpc2UnXVxuICAgICAgQGVkaXRvci5zcGxpdFNlbGVjdGlvbnNJbnRvTGluZXMoKVxuICAgIEBlZGl0b3IubW92ZVRvQmVnaW5uaW5nT2ZMaW5lKClcbiAgICBzdXBlclxuXG4jIGtleTogbm9ybWFsICdBJ1xuY2xhc3MgSW5zZXJ0QWZ0ZXJFbmRPZkxpbmUgZXh0ZW5kcyBBY3RpdmF0ZUluc2VydE1vZGVcbiAgQGV4dGVuZCgpXG4gIGV4ZWN1dGU6IC0+XG4gICAgQGVkaXRvci5tb3ZlVG9FbmRPZkxpbmUoKVxuICAgIHN1cGVyXG5cbiMga2V5OiBub3JtYWwgJ0knXG5jbGFzcyBJbnNlcnRBdEZpcnN0Q2hhcmFjdGVyT2ZMaW5lIGV4dGVuZHMgQWN0aXZhdGVJbnNlcnRNb2RlXG4gIEBleHRlbmQoKVxuICBleGVjdXRlOiAtPlxuICAgIEBlZGl0b3IubW92ZVRvQmVnaW5uaW5nT2ZMaW5lKClcbiAgICBAZWRpdG9yLm1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lKClcbiAgICBzdXBlclxuXG5jbGFzcyBJbnNlcnRBdExhc3RJbnNlcnQgZXh0ZW5kcyBBY3RpdmF0ZUluc2VydE1vZGVcbiAgQGV4dGVuZCgpXG4gIGV4ZWN1dGU6IC0+XG4gICAgaWYgKHBvaW50ID0gQHZpbVN0YXRlLm1hcmsuZ2V0KCdeJykpXG4gICAgICBAZWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKHBvaW50KVxuICAgICAgQGVkaXRvci5zY3JvbGxUb0N1cnNvclBvc2l0aW9uKHtjZW50ZXI6IHRydWV9KVxuICAgIHN1cGVyXG5cbmNsYXNzIEluc2VydEFib3ZlV2l0aE5ld2xpbmUgZXh0ZW5kcyBBY3RpdmF0ZUluc2VydE1vZGVcbiAgQGV4dGVuZCgpXG5cbiAgaW5pdGlhbGl6ZTogLT5cbiAgICBpZiBAZ2V0Q29uZmlnKCdncm91cENoYW5nZXNXaGVuTGVhdmluZ0luc2VydE1vZGUnKVxuICAgICAgQG9yaWdpbmFsQ3Vyc29yUG9zaXRpb25NYXJrZXIgPSBAZWRpdG9yLm1hcmtCdWZmZXJQb3NpdGlvbihAZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCkpXG5cbiAgIyBUaGlzIGlzIGZvciBgb2AgYW5kIGBPYCBvcGVyYXRvci5cbiAgIyBPbiB1bmRvL3JlZG8gcHV0IGN1cnNvciBhdCBvcmlnaW5hbCBwb2ludCB3aGVyZSB1c2VyIHR5cGUgYG9gIG9yIGBPYC5cbiAgZ3JvdXBDaGFuZ2VzU2luY2VCdWZmZXJDaGVja3BvaW50OiAtPlxuICAgIGxhc3RDdXJzb3IgPSBAZWRpdG9yLmdldExhc3RDdXJzb3IoKVxuICAgIGN1cnNvclBvc2l0aW9uID0gbGFzdEN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXG4gICAgbGFzdEN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihAb3JpZ2luYWxDdXJzb3JQb3NpdGlvbk1hcmtlci5nZXRIZWFkQnVmZmVyUG9zaXRpb24oKSlcbiAgICBAb3JpZ2luYWxDdXJzb3JQb3NpdGlvbk1hcmtlci5kZXN0cm95KClcblxuICAgIHN1cGVyXG5cbiAgICBsYXN0Q3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKGN1cnNvclBvc2l0aW9uKVxuXG4gIGF1dG9JbmRlbnRFbXB0eVJvd3M6IC0+XG4gICAgZm9yIGN1cnNvciBpbiBAZWRpdG9yLmdldEN1cnNvcnMoKVxuICAgICAgcm93ID0gY3Vyc29yLmdldEJ1ZmZlclJvdygpXG4gICAgICBAZWRpdG9yLmF1dG9JbmRlbnRCdWZmZXJSb3cocm93KSBpZiBpc0VtcHR5Um93KEBlZGl0b3IsIHJvdylcblxuICBtdXRhdGVUZXh0OiAtPlxuICAgIEBlZGl0b3IuaW5zZXJ0TmV3bGluZUFib3ZlKClcbiAgICBAYXV0b0luZGVudEVtcHR5Um93cygpIGlmIEBlZGl0b3IuYXV0b0luZGVudFxuXG4gIHJlcGVhdEluc2VydDogKHNlbGVjdGlvbiwgdGV4dCkgLT5cbiAgICBzZWxlY3Rpb24uaW5zZXJ0VGV4dCh0ZXh0LnRyaW1MZWZ0KCksIGF1dG9JbmRlbnQ6IHRydWUpXG5cbmNsYXNzIEluc2VydEJlbG93V2l0aE5ld2xpbmUgZXh0ZW5kcyBJbnNlcnRBYm92ZVdpdGhOZXdsaW5lXG4gIEBleHRlbmQoKVxuICBtdXRhdGVUZXh0OiAtPlxuICAgIGZvciBjdXJzb3IgaW4gQGVkaXRvci5nZXRDdXJzb3JzKCkgd2hlbiBjdXJzb3JSb3cgPSBjdXJzb3IuZ2V0QnVmZmVyUm93KClcbiAgICAgIHNldEJ1ZmZlclJvdyhjdXJzb3IsIEBnZXRGb2xkRW5kUm93Rm9yUm93KGN1cnNvclJvdykpXG5cbiAgICBAZWRpdG9yLmluc2VydE5ld2xpbmVCZWxvdygpXG4gICAgQGF1dG9JbmRlbnRFbXB0eVJvd3MoKSBpZiBAZWRpdG9yLmF1dG9JbmRlbnRcblxuIyBBZHZhbmNlZCBJbnNlcnRpb25cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgSW5zZXJ0QnlUYXJnZXQgZXh0ZW5kcyBBY3RpdmF0ZUluc2VydE1vZGVcbiAgQGV4dGVuZChmYWxzZSlcbiAgcmVxdWlyZVRhcmdldDogdHJ1ZVxuICB3aGljaDogbnVsbCAjIG9uZSBvZiBbJ3N0YXJ0JywgJ2VuZCcsICdoZWFkJywgJ3RhaWwnXVxuXG4gIGluaXRpYWxpemU6IC0+XG4gICAgIyBIQUNLXG4gICAgIyBXaGVuIGcgaSBpcyBtYXBwZWQgdG8gYGluc2VydC1hdC1zdGFydC1vZi10YXJnZXRgLlxuICAgICMgYGcgaSAzIGxgIHN0YXJ0IGluc2VydCBhdCAzIGNvbHVtbiByaWdodCBwb3NpdGlvbi5cbiAgICAjIEluIHRoaXMgY2FzZSwgd2UgZG9uJ3Qgd2FudCByZXBlYXQgaW5zZXJ0aW9uIDMgdGltZXMuXG4gICAgIyBUaGlzIEBnZXRDb3VudCgpIGNhbGwgY2FjaGUgbnVtYmVyIGF0IHRoZSB0aW1pbmcgQkVGT1JFICczJyBpcyBzcGVjaWZpZWQuXG4gICAgQGdldENvdW50KClcbiAgICBzdXBlclxuXG4gIGV4ZWN1dGU6IC0+XG4gICAgQG9uRGlkU2VsZWN0VGFyZ2V0ID0+XG4gICAgICAjIEluIHZDL3ZMLCB3aGVuIG9jY3VycmVuY2UgbWFya2VyIHdhcyBOT1Qgc2VsZWN0ZWQsXG4gICAgICAjIGl0IGJlaGF2ZSdzIHZlcnkgc3BlY2lhbGx5XG4gICAgICAjIHZDOiBgSWAgYW5kIGBBYCBiZWhhdmVzIGFzIHNob2Z0IGhhbmQgb2YgYGN0cmwtdiBJYCBhbmQgYGN0cmwtdiBBYC5cbiAgICAgICMgdkw6IGBJYCBhbmQgYEFgIHBsYWNlIGN1cnNvcnMgYXQgZWFjaCBzZWxlY3RlZCBsaW5lcyBvZiBzdGFydCggb3IgZW5kICkgb2Ygbm9uLXdoaXRlLXNwYWNlIGNoYXIuXG4gICAgICBpZiBub3QgQG9jY3VycmVuY2VTZWxlY3RlZCBhbmQgQG1vZGUgaXMgJ3Zpc3VhbCcgYW5kIEBzdWJtb2RlIGluIFsnY2hhcmFjdGVyd2lzZScsICdsaW5ld2lzZSddXG4gICAgICAgIGZvciAkc2VsZWN0aW9uIGluIEBzd3JhcC5nZXRTZWxlY3Rpb25zKEBlZGl0b3IpXG4gICAgICAgICAgJHNlbGVjdGlvbi5ub3JtYWxpemUoKVxuICAgICAgICAgICRzZWxlY3Rpb24uYXBwbHlXaXNlKCdibG9ja3dpc2UnKVxuXG4gICAgICAgIGlmIEBzdWJtb2RlIGlzICdsaW5ld2lzZSdcbiAgICAgICAgICBmb3IgYmxvY2t3aXNlU2VsZWN0aW9uIGluIEBnZXRCbG9ja3dpc2VTZWxlY3Rpb25zKClcbiAgICAgICAgICAgIGJsb2Nrd2lzZVNlbGVjdGlvbi5leHBhbmRNZW1iZXJTZWxlY3Rpb25zT3ZlckxpbmVXaXRoVHJpbVJhbmdlKClcblxuICAgICAgZm9yICRzZWxlY3Rpb24gaW4gQHN3cmFwLmdldFNlbGVjdGlvbnMoQGVkaXRvcilcbiAgICAgICAgJHNlbGVjdGlvbi5zZXRCdWZmZXJQb3NpdGlvblRvKEB3aGljaClcbiAgICBzdXBlclxuXG4jIGtleTogJ0knLCBVc2VkIGluICd2aXN1YWwtbW9kZS5jaGFyYWN0ZXJ3aXNlJywgdmlzdWFsLW1vZGUuYmxvY2t3aXNlXG5jbGFzcyBJbnNlcnRBdFN0YXJ0T2ZUYXJnZXQgZXh0ZW5kcyBJbnNlcnRCeVRhcmdldFxuICBAZXh0ZW5kKClcbiAgd2hpY2g6ICdzdGFydCdcblxuIyBrZXk6ICdBJywgVXNlZCBpbiAndmlzdWFsLW1vZGUuY2hhcmFjdGVyd2lzZScsICd2aXN1YWwtbW9kZS5ibG9ja3dpc2UnXG5jbGFzcyBJbnNlcnRBdEVuZE9mVGFyZ2V0IGV4dGVuZHMgSW5zZXJ0QnlUYXJnZXRcbiAgQGV4dGVuZCgpXG4gIHdoaWNoOiAnZW5kJ1xuXG5jbGFzcyBJbnNlcnRBdEhlYWRPZlRhcmdldCBleHRlbmRzIEluc2VydEJ5VGFyZ2V0XG4gIEBleHRlbmQoKVxuICB3aGljaDogJ2hlYWQnXG5cbmNsYXNzIEluc2VydEF0U3RhcnRPZk9jY3VycmVuY2UgZXh0ZW5kcyBJbnNlcnRCeVRhcmdldFxuICBAZXh0ZW5kKClcbiAgd2hpY2g6ICdzdGFydCdcbiAgb2NjdXJyZW5jZTogdHJ1ZVxuXG5jbGFzcyBJbnNlcnRBdEVuZE9mT2NjdXJyZW5jZSBleHRlbmRzIEluc2VydEJ5VGFyZ2V0XG4gIEBleHRlbmQoKVxuICB3aGljaDogJ2VuZCdcbiAgb2NjdXJyZW5jZTogdHJ1ZVxuXG5jbGFzcyBJbnNlcnRBdFN0YXJ0T2ZTdWJ3b3JkT2NjdXJyZW5jZSBleHRlbmRzIEluc2VydEF0U3RhcnRPZk9jY3VycmVuY2VcbiAgQGV4dGVuZCgpXG4gIG9jY3VycmVuY2VUeXBlOiAnc3Vid29yZCdcblxuY2xhc3MgSW5zZXJ0QXRFbmRPZlN1YndvcmRPY2N1cnJlbmNlIGV4dGVuZHMgSW5zZXJ0QXRFbmRPZk9jY3VycmVuY2VcbiAgQGV4dGVuZCgpXG4gIG9jY3VycmVuY2VUeXBlOiAnc3Vid29yZCdcblxuY2xhc3MgSW5zZXJ0QXRTdGFydE9mU21hcnRXb3JkIGV4dGVuZHMgSW5zZXJ0QnlUYXJnZXRcbiAgQGV4dGVuZCgpXG4gIHdoaWNoOiAnc3RhcnQnXG4gIHRhcmdldDogXCJNb3ZlVG9QcmV2aW91c1NtYXJ0V29yZFwiXG5cbmNsYXNzIEluc2VydEF0RW5kT2ZTbWFydFdvcmQgZXh0ZW5kcyBJbnNlcnRCeVRhcmdldFxuICBAZXh0ZW5kKClcbiAgd2hpY2g6ICdlbmQnXG4gIHRhcmdldDogXCJNb3ZlVG9FbmRPZlNtYXJ0V29yZFwiXG5cbmNsYXNzIEluc2VydEF0UHJldmlvdXNGb2xkU3RhcnQgZXh0ZW5kcyBJbnNlcnRCeVRhcmdldFxuICBAZXh0ZW5kKClcbiAgQGRlc2NyaXB0aW9uOiBcIk1vdmUgdG8gcHJldmlvdXMgZm9sZCBzdGFydCB0aGVuIGVudGVyIGluc2VydC1tb2RlXCJcbiAgd2hpY2g6ICdzdGFydCdcbiAgdGFyZ2V0OiAnTW92ZVRvUHJldmlvdXNGb2xkU3RhcnQnXG5cbmNsYXNzIEluc2VydEF0TmV4dEZvbGRTdGFydCBleHRlbmRzIEluc2VydEJ5VGFyZ2V0XG4gIEBleHRlbmQoKVxuICBAZGVzY3JpcHRpb246IFwiTW92ZSB0byBuZXh0IGZvbGQgc3RhcnQgdGhlbiBlbnRlciBpbnNlcnQtbW9kZVwiXG4gIHdoaWNoOiAnZW5kJ1xuICB0YXJnZXQ6ICdNb3ZlVG9OZXh0Rm9sZFN0YXJ0J1xuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIENoYW5nZSBleHRlbmRzIEFjdGl2YXRlSW5zZXJ0TW9kZVxuICBAZXh0ZW5kKClcbiAgcmVxdWlyZVRhcmdldDogdHJ1ZVxuICB0cmFja0NoYW5nZTogdHJ1ZVxuICBzdXBwb3J0SW5zZXJ0aW9uQ291bnQ6IGZhbHNlXG5cbiAgbXV0YXRlVGV4dDogLT5cbiAgICAjIEFsbHdheXMgZHluYW1pY2FsbHkgZGV0ZXJtaW5lIHNlbGVjdGlvbiB3aXNlIHd0aG91dCBjb25zdWx0aW5nIHRhcmdldC53aXNlXG4gICAgIyBSZWFzb246IHdoZW4gYGMgaSB7YCwgd2lzZSBpcyAnY2hhcmFjdGVyd2lzZScsIGJ1dCBhY3R1YWxseSBzZWxlY3RlZCByYW5nZSBpcyAnbGluZXdpc2UnXG4gICAgIyAgIHtcbiAgICAjICAgICBhXG4gICAgIyAgIH1cbiAgICBpc0xpbmV3aXNlVGFyZ2V0ID0gQHN3cmFwLmRldGVjdFdpc2UoQGVkaXRvcikgaXMgJ2xpbmV3aXNlJ1xuICAgIGZvciBzZWxlY3Rpb24gaW4gQGVkaXRvci5nZXRTZWxlY3Rpb25zKClcbiAgICAgIEBzZXRUZXh0VG9SZWdpc3RlckZvclNlbGVjdGlvbihzZWxlY3Rpb24pIHVubGVzcyBAZ2V0Q29uZmlnKCdkb250VXBkYXRlUmVnaXN0ZXJPbkNoYW5nZU9yU3Vic3RpdHV0ZScpXG4gICAgICBpZiBpc0xpbmV3aXNlVGFyZ2V0XG4gICAgICAgIHNlbGVjdGlvbi5pbnNlcnRUZXh0KFwiXFxuXCIsIGF1dG9JbmRlbnQ6IHRydWUpXG4gICAgICAgIHNlbGVjdGlvbi5jdXJzb3IubW92ZUxlZnQoKVxuICAgICAgZWxzZVxuICAgICAgICBzZWxlY3Rpb24uaW5zZXJ0VGV4dCgnJywgYXV0b0luZGVudDogdHJ1ZSlcblxuY2xhc3MgQ2hhbmdlT2NjdXJyZW5jZSBleHRlbmRzIENoYW5nZVxuICBAZXh0ZW5kKClcbiAgQGRlc2NyaXB0aW9uOiBcIkNoYW5nZSBhbGwgbWF0Y2hpbmcgd29yZCB3aXRoaW4gdGFyZ2V0IHJhbmdlXCJcbiAgb2NjdXJyZW5jZTogdHJ1ZVxuXG5jbGFzcyBTdWJzdGl0dXRlIGV4dGVuZHMgQ2hhbmdlXG4gIEBleHRlbmQoKVxuICB0YXJnZXQ6ICdNb3ZlUmlnaHQnXG5cbmNsYXNzIFN1YnN0aXR1dGVMaW5lIGV4dGVuZHMgQ2hhbmdlXG4gIEBleHRlbmQoKVxuICB3aXNlOiAnbGluZXdpc2UnICMgW0ZJWE1FXSB0byByZS1vdmVycmlkZSB0YXJnZXQud2lzZSBpbiB2aXN1YWwtbW9kZVxuICB0YXJnZXQ6ICdNb3ZlVG9SZWxhdGl2ZUxpbmUnXG5cbiMgYWxpYXNcbmNsYXNzIENoYW5nZUxpbmUgZXh0ZW5kcyBTdWJzdGl0dXRlTGluZVxuICBAZXh0ZW5kKClcblxuY2xhc3MgQ2hhbmdlVG9MYXN0Q2hhcmFjdGVyT2ZMaW5lIGV4dGVuZHMgQ2hhbmdlXG4gIEBleHRlbmQoKVxuICB0YXJnZXQ6ICdNb3ZlVG9MYXN0Q2hhcmFjdGVyT2ZMaW5lJ1xuXG4gIGV4ZWN1dGU6IC0+XG4gICAgaWYgQHRhcmdldC53aXNlIGlzICdibG9ja3dpc2UnXG4gICAgICBAb25EaWRTZWxlY3RUYXJnZXQgPT5cbiAgICAgICAgZm9yIGJsb2Nrd2lzZVNlbGVjdGlvbiBpbiBAZ2V0QmxvY2t3aXNlU2VsZWN0aW9ucygpXG4gICAgICAgICAgYmxvY2t3aXNlU2VsZWN0aW9uLmV4dGVuZE1lbWJlclNlbGVjdGlvbnNUb0VuZE9mTGluZSgpXG4gICAgc3VwZXJcbiJdfQ==
