(function() {
  var ActivateInsertMode, ActivateReplaceMode, Change, ChangeLine, ChangeOccurrence, ChangeToLastCharacterOfLine, InsertAboveWithNewline, InsertAfter, InsertAfterEndOfLine, InsertAtBeginningOfLine, InsertAtEndOfOccurrence, InsertAtEndOfSmartWord, InsertAtEndOfSubwordOccurrence, InsertAtEndOfTarget, InsertAtFirstCharacterOfLine, InsertAtLastInsert, InsertAtNextFoldStart, InsertAtPreviousFoldStart, InsertAtStartOfOccurrence, InsertAtStartOfSmartWord, InsertAtStartOfSubwordOccurrence, InsertAtStartOfTarget, InsertBelowWithNewline, InsertByTarget, Operator, Range, Substitute, SubstituteLine, _, isEmptyRow, limitNumber, moveCursorLeft, moveCursorRight, ref,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  _ = require('underscore-plus');

  Range = require('atom').Range;

  ref = require('./utils'), moveCursorLeft = ref.moveCursorLeft, moveCursorRight = ref.moveCursorRight, limitNumber = ref.limitNumber, isEmptyRow = ref.isEmptyRow;

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

    InsertAboveWithNewline.prototype.groupChangesSinceBufferCheckpoint = function() {
      var cursorPosition, lastCursor;
      lastCursor = this.editor.getLastCursor();
      cursorPosition = lastCursor.getBufferPosition();
      lastCursor.setBufferPosition(this.vimState.getOriginalCursorPositionByMarker());
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvb3BlcmF0b3ItaW5zZXJ0LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsNm9CQUFBO0lBQUE7OztFQUFBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVI7O0VBQ0gsUUFBUyxPQUFBLENBQVEsTUFBUjs7RUFFVixNQUtJLE9BQUEsQ0FBUSxTQUFSLENBTEosRUFDRSxtQ0FERixFQUVFLHFDQUZGLEVBR0UsNkJBSEYsRUFJRTs7RUFFRixRQUFBLEdBQVcsT0FBQSxDQUFRLFFBQVIsQ0FBaUIsQ0FBQyxRQUFsQixDQUEyQixVQUEzQjs7RUFNTDs7Ozs7OztJQUNKLGtCQUFDLENBQUEsTUFBRCxDQUFBOztpQ0FDQSxhQUFBLEdBQWU7O2lDQUNmLFdBQUEsR0FBYTs7aUNBQ2IsWUFBQSxHQUFjOztpQ0FDZCxxQkFBQSxHQUF1Qjs7aUNBRXZCLHlCQUFBLEdBQTJCLFNBQUE7QUFDekIsVUFBQTthQUFBLFVBQUEsR0FBYSxJQUFDLENBQUEsUUFBUSxDQUFDLFdBQVcsQ0FBQyx5QkFBdEIsQ0FBZ0QsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLEdBQUQ7QUFDM0QsY0FBQTtVQUQ2RCxPQUFEO1VBQzVELElBQWMsSUFBQSxLQUFRLFFBQXRCO0FBQUEsbUJBQUE7O1VBQ0EsVUFBVSxDQUFDLE9BQVgsQ0FBQTtVQUVBLEtBQUMsQ0FBQSxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQWYsQ0FBbUIsR0FBbkIsRUFBd0IsS0FBQyxDQUFBLE1BQU0sQ0FBQyx1QkFBUixDQUFBLENBQXhCO1VBQ0EsZUFBQSxHQUFrQjtVQUNsQixJQUFHLE1BQUEsR0FBUyxLQUFDLENBQUEsd0JBQUQsQ0FBMEIsUUFBMUIsQ0FBWjtZQUNFLEtBQUMsQ0FBQSxVQUFELEdBQWM7WUFDZCxLQUFDLENBQUEsZ0JBQUQs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QUE7OzBDQUNBLE1BQUEsR0FBUTs7MENBRVIsT0FBQSxHQUFTLFNBQUE7TUFDUCxJQUFHLElBQUMsQ0FBQSxNQUFNLENBQUMsSUFBUixLQUFnQixXQUFuQjtRQUNFLElBQUMsQ0FBQSxpQkFBRCxDQUFtQixDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFBO0FBQ2pCLGdCQUFBO0FBQUE7QUFBQTtpQkFBQSxzQ0FBQTs7MkJBQ0Usa0JBQWtCLENBQUMsaUNBQW5CLENBQUE7QUFERjs7VUFEaUI7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQW5CLEVBREY7O2FBSUEsMERBQUEsU0FBQTtJQUxPOzs7O0tBSitCO0FBelUxQyIsInNvdXJjZXNDb250ZW50IjpbIl8gPSByZXF1aXJlICd1bmRlcnNjb3JlLXBsdXMnXG57UmFuZ2V9ID0gcmVxdWlyZSAnYXRvbSdcblxue1xuICBtb3ZlQ3Vyc29yTGVmdFxuICBtb3ZlQ3Vyc29yUmlnaHRcbiAgbGltaXROdW1iZXJcbiAgaXNFbXB0eVJvd1xufSA9IHJlcXVpcmUgJy4vdXRpbHMnXG5PcGVyYXRvciA9IHJlcXVpcmUoJy4vYmFzZScpLmdldENsYXNzKCdPcGVyYXRvcicpXG5cbiMgT3BlcmF0b3Igd2hpY2ggc3RhcnQgJ2luc2VydC1tb2RlJ1xuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIFtOT1RFXVxuIyBSdWxlOiBEb24ndCBtYWtlIGFueSB0ZXh0IG11dGF0aW9uIGJlZm9yZSBjYWxsaW5nIGBAc2VsZWN0VGFyZ2V0KClgLlxuY2xhc3MgQWN0aXZhdGVJbnNlcnRNb2RlIGV4dGVuZHMgT3BlcmF0b3JcbiAgQGV4dGVuZCgpXG4gIHJlcXVpcmVUYXJnZXQ6IGZhbHNlXG4gIGZsYXNoVGFyZ2V0OiBmYWxzZVxuICBmaW5hbFN1Ym1vZGU6IG51bGxcbiAgc3VwcG9ydEluc2VydGlvbkNvdW50OiB0cnVlXG5cbiAgb2JzZXJ2ZVdpbGxEZWFjdGl2YXRlTW9kZTogLT5cbiAgICBkaXNwb3NhYmxlID0gQHZpbVN0YXRlLm1vZGVNYW5hZ2VyLnByZWVtcHRXaWxsRGVhY3RpdmF0ZU1vZGUgKHttb2RlfSkgPT5cbiAgICAgIHJldHVybiB1bmxlc3MgbW9kZSBpcyAnaW5zZXJ0J1xuICAgICAgZGlzcG9zYWJsZS5kaXNwb3NlKClcblxuICAgICAgQHZpbVN0YXRlLm1hcmsuc2V0KCdeJywgQGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpKSAjIExhc3QgaW5zZXJ0LW1vZGUgcG9zaXRpb25cbiAgICAgIHRleHRCeVVzZXJJbnB1dCA9ICcnXG4gICAgICBpZiBjaGFuZ2UgPSBAZ2V0Q2hhbmdlU2luY2VDaGVja3BvaW50KCdpbnNlcnQnKVxuICAgICAgICBAbGFzdENoYW5nZSA9IGNoYW5nZVxuICAgICAgICBAc2V0TWFya0ZvckNoYW5nZShuZXcgUmFuZ2UoY2hhbmdlLnN0YXJ0LCBjaGFuZ2Uuc3RhcnQudHJhdmVyc2UoY2hhbmdlLm5ld0V4dGVudCkpKVxuICAgICAgICB0ZXh0QnlVc2VySW5wdXQgPSBjaGFuZ2UubmV3VGV4dFxuICAgICAgQHZpbVN0YXRlLnJlZ2lzdGVyLnNldCgnLicsIHRleHQ6IHRleHRCeVVzZXJJbnB1dCkgIyBMYXN0IGluc2VydGVkIHRleHRcblxuICAgICAgXy50aW1lcyBAZ2V0SW5zZXJ0aW9uQ291bnQoKSwgPT5cbiAgICAgICAgdGV4dCA9IEB0ZXh0QnlPcGVyYXRvciArIHRleHRCeVVzZXJJbnB1dFxuICAgICAgICBmb3Igc2VsZWN0aW9uIGluIEBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpXG4gICAgICAgICAgc2VsZWN0aW9uLmluc2VydFRleHQodGV4dCwgYXV0b0luZGVudDogdHJ1ZSlcblxuICAgICAgIyBUaGlzIGN1cnNvciBzdGF0ZSBpcyByZXN0b3JlZCBvbiB1bmRvLlxuICAgICAgIyBTbyBjdXJzb3Igc3RhdGUgaGFzIHRvIGJlIHVwZGF0ZWQgYmVmb3JlIG5leHQgZ3JvdXBDaGFuZ2VzU2luY2VDaGVja3BvaW50KClcbiAgICAgIGlmIEBnZXRDb25maWcoJ2NsZWFyTXVsdGlwbGVDdXJzb3JzT25Fc2NhcGVJbnNlcnRNb2RlJylcbiAgICAgICAgQHZpbVN0YXRlLmNsZWFyU2VsZWN0aW9ucygpXG5cbiAgICAgICMgZ3JvdXBpbmcgY2hhbmdlcyBmb3IgdW5kbyBjaGVja3BvaW50IG5lZWQgdG8gY29tZSBsYXN0XG4gICAgICBpZiBAZ2V0Q29uZmlnKCdncm91cENoYW5nZXNXaGVuTGVhdmluZ0luc2VydE1vZGUnKVxuICAgICAgICBAZ3JvdXBDaGFuZ2VzU2luY2VCdWZmZXJDaGVja3BvaW50KCd1bmRvJylcblxuICAjIFdoZW4gZWFjaCBtdXRhaW9uJ3MgZXh0ZW50IGlzIG5vdCBpbnRlcnNlY3RpbmcsIG11aXRpcGxlIGNoYW5nZXMgYXJlIHJlY29yZGVkXG4gICMgZS5nXG4gICMgIC0gTXVsdGljdXJzb3JzIGVkaXRcbiAgIyAgLSBDdXJzb3IgbW92ZWQgaW4gaW5zZXJ0LW1vZGUoZS5nIGN0cmwtZiwgY3RybC1iKVxuICAjIEJ1dCBJIGRvbid0IGNhcmUgbXVsdGlwbGUgY2hhbmdlcyBqdXN0IGJlY2F1c2UgSSdtIGxhenkoc28gbm90IHBlcmZlY3QgaW1wbGVtZW50YXRpb24pLlxuICAjIEkgb25seSB0YWtlIGNhcmUgb2Ygb25lIGNoYW5nZSBoYXBwZW5lZCBhdCBlYXJsaWVzdCh0b3BDdXJzb3IncyBjaGFuZ2UpIHBvc2l0aW9uLlxuICAjIFRoYXRzJyB3aHkgSSBzYXZlIHRvcEN1cnNvcidzIHBvc2l0aW9uIHRvIEB0b3BDdXJzb3JQb3NpdGlvbkF0SW5zZXJ0aW9uU3RhcnQgdG8gY29tcGFyZSB0cmF2ZXJzYWwgdG8gZGVsZXRpb25TdGFydFxuICAjIFdoeSBJIHVzZSB0b3BDdXJzb3IncyBjaGFuZ2U/IEp1c3QgYmVjYXVzZSBpdCdzIGVhc3kgdG8gdXNlIGZpcnN0IGNoYW5nZSByZXR1cm5lZCBieSBnZXRDaGFuZ2VTaW5jZUNoZWNrcG9pbnQoKS5cbiAgZ2V0Q2hhbmdlU2luY2VDaGVja3BvaW50OiAocHVycG9zZSkgLT5cbiAgICBjaGVja3BvaW50ID0gQGdldEJ1ZmZlckNoZWNrcG9pbnQocHVycG9zZSlcbiAgICBAZWRpdG9yLmJ1ZmZlci5nZXRDaGFuZ2VzU2luY2VDaGVja3BvaW50KGNoZWNrcG9pbnQpWzBdXG5cbiAgIyBbQlVHLUJVVC1PS10gUmVwbGF5aW5nIHRleHQtZGVsZXRpb24tb3BlcmF0aW9uIGlzIG5vdCBjb21wYXRpYmxlIHRvIHB1cmUgVmltLlxuICAjIFB1cmUgVmltIHJlY29yZCBhbGwgb3BlcmF0aW9uIGluIGluc2VydC1tb2RlIGFzIGtleXN0cm9rZSBsZXZlbCBhbmQgY2FuIGRpc3Rpbmd1aXNoXG4gICMgY2hhcmFjdGVyIGRlbGV0ZWQgYnkgYERlbGV0ZWAgb3IgYnkgYGN0cmwtdWAuXG4gICMgQnV0IEkgY2FuIG5vdCBhbmQgZG9uJ3QgdHJ5aW5nIHRvIG1pbmljIHRoaXMgbGV2ZWwgb2YgY29tcGF0aWJpbGl0eS5cbiAgIyBTbyBiYXNpY2FsbHkgZGVsZXRpb24tZG9uZS1pbi1vbmUgaXMgZXhwZWN0ZWQgdG8gd29yayB3ZWxsLlxuICByZXBsYXlMYXN0Q2hhbmdlOiAoc2VsZWN0aW9uKSAtPlxuICAgIGlmIEBsYXN0Q2hhbmdlP1xuICAgICAge3N0YXJ0LCBuZXdFeHRlbnQsIG9sZEV4dGVudCwgbmV3VGV4dH0gPSBAbGFzdENoYW5nZVxuICAgICAgdW5sZXNzIG9sZEV4dGVudC5pc1plcm8oKVxuICAgICAgICB0cmF2ZXJzYWxUb1N0YXJ0T2ZEZWxldGUgPSBzdGFydC50cmF2ZXJzYWxGcm9tKEB0b3BDdXJzb3JQb3NpdGlvbkF0SW5zZXJ0aW9uU3RhcnQpXG4gICAgICAgIGRlbGV0aW9uU3RhcnQgPSBzZWxlY3Rpb24uY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKCkudHJhdmVyc2UodHJhdmVyc2FsVG9TdGFydE9mRGVsZXRlKVxuICAgICAgICBkZWxldGlvbkVuZCA9IGRlbGV0aW9uU3RhcnQudHJhdmVyc2Uob2xkRXh0ZW50KVxuICAgICAgICBzZWxlY3Rpb24uc2V0QnVmZmVyUmFuZ2UoW2RlbGV0aW9uU3RhcnQsIGRlbGV0aW9uRW5kXSlcbiAgICBlbHNlXG4gICAgICBuZXdUZXh0ID0gJydcbiAgICBzZWxlY3Rpb24uaW5zZXJ0VGV4dChuZXdUZXh0LCBhdXRvSW5kZW50OiB0cnVlKVxuXG4gICMgY2FsbGVkIHdoZW4gcmVwZWF0ZWRcbiAgIyBbRklYTUVdIHRvIHVzZSByZXBsYXlMYXN0Q2hhbmdlIGluIHJlcGVhdEluc2VydCBvdmVycmlkaW5nIHN1YmNsYXNzcy5cbiAgcmVwZWF0SW5zZXJ0OiAoc2VsZWN0aW9uLCB0ZXh0KSAtPlxuICAgIEByZXBsYXlMYXN0Q2hhbmdlKHNlbGVjdGlvbilcblxuICBnZXRJbnNlcnRpb25Db3VudDogLT5cbiAgICBAaW5zZXJ0aW9uQ291bnQgPz0gaWYgQHN1cHBvcnRJbnNlcnRpb25Db3VudCB0aGVuIEBnZXRDb3VudCgtMSkgZWxzZSAwXG4gICAgIyBBdm9pZCBmcmVlemluZyBieSBhY2NjaWRlbnRhbCBiaWcgY291bnQoZS5nLiBgNTU1NTU1NTU1NTU1NWlgKSwgU2VlICM1NjAsICM1OTZcbiAgICBsaW1pdE51bWJlcihAaW5zZXJ0aW9uQ291bnQsIG1heDogMTAwKVxuXG4gIGV4ZWN1dGU6IC0+XG4gICAgaWYgQHJlcGVhdGVkXG4gICAgICBAZmxhc2hUYXJnZXQgPSBAdHJhY2tDaGFuZ2UgPSB0cnVlXG5cbiAgICAgIEBzdGFydE11dGF0aW9uID0+XG4gICAgICAgIEBzZWxlY3RUYXJnZXQoKSBpZiBAdGFyZ2V0P1xuICAgICAgICBAbXV0YXRlVGV4dD8oKVxuICAgICAgICBmb3Igc2VsZWN0aW9uIGluIEBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpXG4gICAgICAgICAgQHJlcGVhdEluc2VydChzZWxlY3Rpb24sIEBsYXN0Q2hhbmdlPy5uZXdUZXh0ID8gJycpXG4gICAgICAgICAgbW92ZUN1cnNvckxlZnQoc2VsZWN0aW9uLmN1cnNvcilcbiAgICAgICAgQG11dGF0aW9uTWFuYWdlci5zZXRDaGVja3BvaW50KCdkaWQtZmluaXNoJylcblxuICAgICAgaWYgQGdldENvbmZpZygnY2xlYXJNdWx0aXBsZUN1cnNvcnNPbkVzY2FwZUluc2VydE1vZGUnKVxuICAgICAgICBAdmltU3RhdGUuY2xlYXJTZWxlY3Rpb25zKClcblxuICAgIGVsc2VcbiAgICAgIEBub3JtYWxpemVTZWxlY3Rpb25zSWZOZWNlc3NhcnkoKVxuICAgICAgQGNyZWF0ZUJ1ZmZlckNoZWNrcG9pbnQoJ3VuZG8nKVxuICAgICAgQHNlbGVjdFRhcmdldCgpIGlmIEB0YXJnZXQ/XG4gICAgICBAb2JzZXJ2ZVdpbGxEZWFjdGl2YXRlTW9kZSgpXG5cbiAgICAgIEBtdXRhdGVUZXh0PygpXG5cbiAgICAgIGlmIEBnZXRJbnNlcnRpb25Db3VudCgpID4gMFxuICAgICAgICBAdGV4dEJ5T3BlcmF0b3IgPSBAZ2V0Q2hhbmdlU2luY2VDaGVja3BvaW50KCd1bmRvJyk/Lm5ld1RleHQgPyAnJ1xuXG4gICAgICBAY3JlYXRlQnVmZmVyQ2hlY2twb2ludCgnaW5zZXJ0JylcbiAgICAgIHRvcEN1cnNvciA9IEBlZGl0b3IuZ2V0Q3Vyc29yc09yZGVyZWRCeUJ1ZmZlclBvc2l0aW9uKClbMF1cbiAgICAgIEB0b3BDdXJzb3JQb3NpdGlvbkF0SW5zZXJ0aW9uU3RhcnQgPSB0b3BDdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuXG4gICAgICAjIFNraXAgbm9ybWFsaXphdGlvbiBvZiBibG9ja3dpc2VTZWxlY3Rpb24uXG4gICAgICAjIFNpbmNlIHdhbnQgdG8ga2VlcCBtdWx0aS1jdXJzb3IgYW5kIGl0J3MgcG9zaXRpb24gaW4gd2hlbiBzaGlmdCB0byBpbnNlcnQtbW9kZS5cbiAgICAgIGZvciBibG9ja3dpc2VTZWxlY3Rpb24gaW4gQGdldEJsb2Nrd2lzZVNlbGVjdGlvbnMoKVxuICAgICAgICBibG9ja3dpc2VTZWxlY3Rpb24uc2tpcE5vcm1hbGl6YXRpb24oKVxuICAgICAgQGFjdGl2YXRlTW9kZSgnaW5zZXJ0JywgQGZpbmFsU3VibW9kZSlcblxuY2xhc3MgQWN0aXZhdGVSZXBsYWNlTW9kZSBleHRlbmRzIEFjdGl2YXRlSW5zZXJ0TW9kZVxuICBAZXh0ZW5kKClcbiAgZmluYWxTdWJtb2RlOiAncmVwbGFjZSdcblxuICByZXBlYXRJbnNlcnQ6IChzZWxlY3Rpb24sIHRleHQpIC0+XG4gICAgZm9yIGNoYXIgaW4gdGV4dCB3aGVuIChjaGFyIGlzbnQgXCJcXG5cIilcbiAgICAgIGJyZWFrIGlmIHNlbGVjdGlvbi5jdXJzb3IuaXNBdEVuZE9mTGluZSgpXG4gICAgICBzZWxlY3Rpb24uc2VsZWN0UmlnaHQoKVxuICAgIHNlbGVjdGlvbi5pbnNlcnRUZXh0KHRleHQsIGF1dG9JbmRlbnQ6IGZhbHNlKVxuXG5jbGFzcyBJbnNlcnRBZnRlciBleHRlbmRzIEFjdGl2YXRlSW5zZXJ0TW9kZVxuICBAZXh0ZW5kKClcbiAgZXhlY3V0ZTogLT5cbiAgICBtb3ZlQ3Vyc29yUmlnaHQoY3Vyc29yKSBmb3IgY3Vyc29yIGluIEBlZGl0b3IuZ2V0Q3Vyc29ycygpXG4gICAgc3VwZXJcblxuIyBrZXk6ICdnIEknIGluIGFsbCBtb2RlXG5jbGFzcyBJbnNlcnRBdEJlZ2lubmluZ09mTGluZSBleHRlbmRzIEFjdGl2YXRlSW5zZXJ0TW9kZVxuICBAZXh0ZW5kKClcbiAgZXhlY3V0ZTogLT5cbiAgICBpZiBAbW9kZSBpcyAndmlzdWFsJyBhbmQgQHN1Ym1vZGUgaW4gWydjaGFyYWN0ZXJ3aXNlJywgJ2xpbmV3aXNlJ11cbiAgICAgIEBlZGl0b3Iuc3BsaXRTZWxlY3Rpb25zSW50b0xpbmVzKClcbiAgICBAZWRpdG9yLm1vdmVUb0JlZ2lubmluZ09mTGluZSgpXG4gICAgc3VwZXJcblxuIyBrZXk6IG5vcm1hbCAnQSdcbmNsYXNzIEluc2VydEFmdGVyRW5kT2ZMaW5lIGV4dGVuZHMgQWN0aXZhdGVJbnNlcnRNb2RlXG4gIEBleHRlbmQoKVxuICBleGVjdXRlOiAtPlxuICAgIEBlZGl0b3IubW92ZVRvRW5kT2ZMaW5lKClcbiAgICBzdXBlclxuXG4jIGtleTogbm9ybWFsICdJJ1xuY2xhc3MgSW5zZXJ0QXRGaXJzdENoYXJhY3Rlck9mTGluZSBleHRlbmRzIEFjdGl2YXRlSW5zZXJ0TW9kZVxuICBAZXh0ZW5kKClcbiAgZXhlY3V0ZTogLT5cbiAgICBAZWRpdG9yLm1vdmVUb0JlZ2lubmluZ09mTGluZSgpXG4gICAgQGVkaXRvci5tb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZSgpXG4gICAgc3VwZXJcblxuY2xhc3MgSW5zZXJ0QXRMYXN0SW5zZXJ0IGV4dGVuZHMgQWN0aXZhdGVJbnNlcnRNb2RlXG4gIEBleHRlbmQoKVxuICBleGVjdXRlOiAtPlxuICAgIGlmIChwb2ludCA9IEB2aW1TdGF0ZS5tYXJrLmdldCgnXicpKVxuICAgICAgQGVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihwb2ludClcbiAgICAgIEBlZGl0b3Iuc2Nyb2xsVG9DdXJzb3JQb3NpdGlvbih7Y2VudGVyOiB0cnVlfSlcbiAgICBzdXBlclxuXG5jbGFzcyBJbnNlcnRBYm92ZVdpdGhOZXdsaW5lIGV4dGVuZHMgQWN0aXZhdGVJbnNlcnRNb2RlXG4gIEBleHRlbmQoKVxuXG4gICMgVGhpcyBpcyBmb3IgYG9gIGFuZCBgT2Agb3BlcmF0b3IuXG4gICMgT24gdW5kby9yZWRvIHB1dCBjdXJzb3IgYXQgb3JpZ2luYWwgcG9pbnQgd2hlcmUgdXNlciB0eXBlIGBvYCBvciBgT2AuXG4gIGdyb3VwQ2hhbmdlc1NpbmNlQnVmZmVyQ2hlY2twb2ludDogLT5cbiAgICBsYXN0Q3Vyc29yID0gQGVkaXRvci5nZXRMYXN0Q3Vyc29yKClcbiAgICBjdXJzb3JQb3NpdGlvbiA9IGxhc3RDdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuICAgIGxhc3RDdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24oQHZpbVN0YXRlLmdldE9yaWdpbmFsQ3Vyc29yUG9zaXRpb25CeU1hcmtlcigpKVxuXG4gICAgc3VwZXJcblxuICAgIGxhc3RDdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24oY3Vyc29yUG9zaXRpb24pXG5cbiAgYXV0b0luZGVudEVtcHR5Um93czogLT5cbiAgICBmb3IgY3Vyc29yIGluIEBlZGl0b3IuZ2V0Q3Vyc29ycygpXG4gICAgICByb3cgPSBjdXJzb3IuZ2V0QnVmZmVyUm93KClcbiAgICAgIEBlZGl0b3IuYXV0b0luZGVudEJ1ZmZlclJvdyhyb3cpIGlmIGlzRW1wdHlSb3coQGVkaXRvciwgcm93KVxuXG4gIG11dGF0ZVRleHQ6IC0+XG4gICAgQGVkaXRvci5pbnNlcnROZXdsaW5lQWJvdmUoKVxuICAgIEBhdXRvSW5kZW50RW1wdHlSb3dzKCkgaWYgQGVkaXRvci5hdXRvSW5kZW50XG5cbiAgcmVwZWF0SW5zZXJ0OiAoc2VsZWN0aW9uLCB0ZXh0KSAtPlxuICAgIHNlbGVjdGlvbi5pbnNlcnRUZXh0KHRleHQudHJpbUxlZnQoKSwgYXV0b0luZGVudDogdHJ1ZSlcblxuY2xhc3MgSW5zZXJ0QmVsb3dXaXRoTmV3bGluZSBleHRlbmRzIEluc2VydEFib3ZlV2l0aE5ld2xpbmVcbiAgQGV4dGVuZCgpXG4gIG11dGF0ZVRleHQ6IC0+XG4gICAgQGVkaXRvci5pbnNlcnROZXdsaW5lQmVsb3coKVxuICAgIEBhdXRvSW5kZW50RW1wdHlSb3dzKCkgaWYgQGVkaXRvci5hdXRvSW5kZW50XG5cbiMgQWR2YW5jZWQgSW5zZXJ0aW9uXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIEluc2VydEJ5VGFyZ2V0IGV4dGVuZHMgQWN0aXZhdGVJbnNlcnRNb2RlXG4gIEBleHRlbmQoZmFsc2UpXG4gIHJlcXVpcmVUYXJnZXQ6IHRydWVcbiAgd2hpY2g6IG51bGwgIyBvbmUgb2YgWydzdGFydCcsICdlbmQnLCAnaGVhZCcsICd0YWlsJ11cblxuICBpbml0aWFsaXplOiAtPlxuICAgICMgSEFDS1xuICAgICMgV2hlbiBnIGkgaXMgbWFwcGVkIHRvIGBpbnNlcnQtYXQtc3RhcnQtb2YtdGFyZ2V0YC5cbiAgICAjIGBnIGkgMyBsYCBzdGFydCBpbnNlcnQgYXQgMyBjb2x1bW4gcmlnaHQgcG9zaXRpb24uXG4gICAgIyBJbiB0aGlzIGNhc2UsIHdlIGRvbid0IHdhbnQgcmVwZWF0IGluc2VydGlvbiAzIHRpbWVzLlxuICAgICMgVGhpcyBAZ2V0Q291bnQoKSBjYWxsIGNhY2hlIG51bWJlciBhdCB0aGUgdGltaW5nIEJFRk9SRSAnMycgaXMgc3BlY2lmaWVkLlxuICAgIEBnZXRDb3VudCgpXG4gICAgc3VwZXJcblxuICBleGVjdXRlOiAtPlxuICAgIEBvbkRpZFNlbGVjdFRhcmdldCA9PlxuICAgICAgIyBJbiB2Qy92TCwgd2hlbiBvY2N1cnJlbmNlIG1hcmtlciB3YXMgTk9UIHNlbGVjdGVkLFxuICAgICAgIyBpdCBiZWhhdmUncyB2ZXJ5IHNwZWNpYWxseVxuICAgICAgIyB2QzogYElgIGFuZCBgQWAgYmVoYXZlcyBhcyBzaG9mdCBoYW5kIG9mIGBjdHJsLXYgSWAgYW5kIGBjdHJsLXYgQWAuXG4gICAgICAjIHZMOiBgSWAgYW5kIGBBYCBwbGFjZSBjdXJzb3JzIGF0IGVhY2ggc2VsZWN0ZWQgbGluZXMgb2Ygc3RhcnQoIG9yIGVuZCApIG9mIG5vbi13aGl0ZS1zcGFjZSBjaGFyLlxuICAgICAgaWYgbm90IEBvY2N1cnJlbmNlU2VsZWN0ZWQgYW5kIEBtb2RlIGlzICd2aXN1YWwnIGFuZCBAc3VibW9kZSBpbiBbJ2NoYXJhY3Rlcndpc2UnLCAnbGluZXdpc2UnXVxuICAgICAgICBmb3IgJHNlbGVjdGlvbiBpbiBAc3dyYXAuZ2V0U2VsZWN0aW9ucyhAZWRpdG9yKVxuICAgICAgICAgICRzZWxlY3Rpb24ubm9ybWFsaXplKClcbiAgICAgICAgICAkc2VsZWN0aW9uLmFwcGx5V2lzZSgnYmxvY2t3aXNlJylcblxuICAgICAgICBpZiBAc3VibW9kZSBpcyAnbGluZXdpc2UnXG4gICAgICAgICAgZm9yIGJsb2Nrd2lzZVNlbGVjdGlvbiBpbiBAZ2V0QmxvY2t3aXNlU2VsZWN0aW9ucygpXG4gICAgICAgICAgICBibG9ja3dpc2VTZWxlY3Rpb24uZXhwYW5kTWVtYmVyU2VsZWN0aW9uc092ZXJMaW5lV2l0aFRyaW1SYW5nZSgpXG5cbiAgICAgIGZvciAkc2VsZWN0aW9uIGluIEBzd3JhcC5nZXRTZWxlY3Rpb25zKEBlZGl0b3IpXG4gICAgICAgICRzZWxlY3Rpb24uc2V0QnVmZmVyUG9zaXRpb25UbyhAd2hpY2gpXG4gICAgc3VwZXJcblxuIyBrZXk6ICdJJywgVXNlZCBpbiAndmlzdWFsLW1vZGUuY2hhcmFjdGVyd2lzZScsIHZpc3VhbC1tb2RlLmJsb2Nrd2lzZVxuY2xhc3MgSW5zZXJ0QXRTdGFydE9mVGFyZ2V0IGV4dGVuZHMgSW5zZXJ0QnlUYXJnZXRcbiAgQGV4dGVuZCgpXG4gIHdoaWNoOiAnc3RhcnQnXG5cbiMga2V5OiAnQScsIFVzZWQgaW4gJ3Zpc3VhbC1tb2RlLmNoYXJhY3Rlcndpc2UnLCAndmlzdWFsLW1vZGUuYmxvY2t3aXNlJ1xuY2xhc3MgSW5zZXJ0QXRFbmRPZlRhcmdldCBleHRlbmRzIEluc2VydEJ5VGFyZ2V0XG4gIEBleHRlbmQoKVxuICB3aGljaDogJ2VuZCdcblxuY2xhc3MgSW5zZXJ0QXRTdGFydE9mT2NjdXJyZW5jZSBleHRlbmRzIEluc2VydEJ5VGFyZ2V0XG4gIEBleHRlbmQoKVxuICB3aGljaDogJ3N0YXJ0J1xuICBvY2N1cnJlbmNlOiB0cnVlXG5cbmNsYXNzIEluc2VydEF0RW5kT2ZPY2N1cnJlbmNlIGV4dGVuZHMgSW5zZXJ0QnlUYXJnZXRcbiAgQGV4dGVuZCgpXG4gIHdoaWNoOiAnZW5kJ1xuICBvY2N1cnJlbmNlOiB0cnVlXG5cbmNsYXNzIEluc2VydEF0U3RhcnRPZlN1YndvcmRPY2N1cnJlbmNlIGV4dGVuZHMgSW5zZXJ0QXRTdGFydE9mT2NjdXJyZW5jZVxuICBAZXh0ZW5kKClcbiAgb2NjdXJyZW5jZVR5cGU6ICdzdWJ3b3JkJ1xuXG5jbGFzcyBJbnNlcnRBdEVuZE9mU3Vid29yZE9jY3VycmVuY2UgZXh0ZW5kcyBJbnNlcnRBdEVuZE9mT2NjdXJyZW5jZVxuICBAZXh0ZW5kKClcbiAgb2NjdXJyZW5jZVR5cGU6ICdzdWJ3b3JkJ1xuXG5jbGFzcyBJbnNlcnRBdFN0YXJ0T2ZTbWFydFdvcmQgZXh0ZW5kcyBJbnNlcnRCeVRhcmdldFxuICBAZXh0ZW5kKClcbiAgd2hpY2g6ICdzdGFydCdcbiAgdGFyZ2V0OiBcIk1vdmVUb1ByZXZpb3VzU21hcnRXb3JkXCJcblxuY2xhc3MgSW5zZXJ0QXRFbmRPZlNtYXJ0V29yZCBleHRlbmRzIEluc2VydEJ5VGFyZ2V0XG4gIEBleHRlbmQoKVxuICB3aGljaDogJ2VuZCdcbiAgdGFyZ2V0OiBcIk1vdmVUb0VuZE9mU21hcnRXb3JkXCJcblxuY2xhc3MgSW5zZXJ0QXRQcmV2aW91c0ZvbGRTdGFydCBleHRlbmRzIEluc2VydEJ5VGFyZ2V0XG4gIEBleHRlbmQoKVxuICBAZGVzY3JpcHRpb246IFwiTW92ZSB0byBwcmV2aW91cyBmb2xkIHN0YXJ0IHRoZW4gZW50ZXIgaW5zZXJ0LW1vZGVcIlxuICB3aGljaDogJ3N0YXJ0J1xuICB0YXJnZXQ6ICdNb3ZlVG9QcmV2aW91c0ZvbGRTdGFydCdcblxuY2xhc3MgSW5zZXJ0QXROZXh0Rm9sZFN0YXJ0IGV4dGVuZHMgSW5zZXJ0QnlUYXJnZXRcbiAgQGV4dGVuZCgpXG4gIEBkZXNjcmlwdGlvbjogXCJNb3ZlIHRvIG5leHQgZm9sZCBzdGFydCB0aGVuIGVudGVyIGluc2VydC1tb2RlXCJcbiAgd2hpY2g6ICdlbmQnXG4gIHRhcmdldDogJ01vdmVUb05leHRGb2xkU3RhcnQnXG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgQ2hhbmdlIGV4dGVuZHMgQWN0aXZhdGVJbnNlcnRNb2RlXG4gIEBleHRlbmQoKVxuICByZXF1aXJlVGFyZ2V0OiB0cnVlXG4gIHRyYWNrQ2hhbmdlOiB0cnVlXG4gIHN1cHBvcnRJbnNlcnRpb25Db3VudDogZmFsc2VcblxuICBtdXRhdGVUZXh0OiAtPlxuICAgICMgQWxsd2F5cyBkeW5hbWljYWxseSBkZXRlcm1pbmUgc2VsZWN0aW9uIHdpc2Ugd3Rob3V0IGNvbnN1bHRpbmcgdGFyZ2V0Lndpc2VcbiAgICAjIFJlYXNvbjogd2hlbiBgYyBpIHtgLCB3aXNlIGlzICdjaGFyYWN0ZXJ3aXNlJywgYnV0IGFjdHVhbGx5IHNlbGVjdGVkIHJhbmdlIGlzICdsaW5ld2lzZSdcbiAgICAjICAge1xuICAgICMgICAgIGFcbiAgICAjICAgfVxuICAgIGlzTGluZXdpc2VUYXJnZXQgPSBAc3dyYXAuZGV0ZWN0V2lzZShAZWRpdG9yKSBpcyAnbGluZXdpc2UnXG4gICAgZm9yIHNlbGVjdGlvbiBpbiBAZWRpdG9yLmdldFNlbGVjdGlvbnMoKVxuICAgICAgQHNldFRleHRUb1JlZ2lzdGVyRm9yU2VsZWN0aW9uKHNlbGVjdGlvbikgdW5sZXNzIEBnZXRDb25maWcoJ2RvbnRVcGRhdGVSZWdpc3Rlck9uQ2hhbmdlT3JTdWJzdGl0dXRlJylcbiAgICAgIGlmIGlzTGluZXdpc2VUYXJnZXRcbiAgICAgICAgc2VsZWN0aW9uLmluc2VydFRleHQoXCJcXG5cIiwgYXV0b0luZGVudDogdHJ1ZSlcbiAgICAgICAgc2VsZWN0aW9uLmN1cnNvci5tb3ZlTGVmdCgpXG4gICAgICBlbHNlXG4gICAgICAgIHNlbGVjdGlvbi5pbnNlcnRUZXh0KCcnLCBhdXRvSW5kZW50OiB0cnVlKVxuXG5jbGFzcyBDaGFuZ2VPY2N1cnJlbmNlIGV4dGVuZHMgQ2hhbmdlXG4gIEBleHRlbmQoKVxuICBAZGVzY3JpcHRpb246IFwiQ2hhbmdlIGFsbCBtYXRjaGluZyB3b3JkIHdpdGhpbiB0YXJnZXQgcmFuZ2VcIlxuICBvY2N1cnJlbmNlOiB0cnVlXG5cbmNsYXNzIFN1YnN0aXR1dGUgZXh0ZW5kcyBDaGFuZ2VcbiAgQGV4dGVuZCgpXG4gIHRhcmdldDogJ01vdmVSaWdodCdcblxuY2xhc3MgU3Vic3RpdHV0ZUxpbmUgZXh0ZW5kcyBDaGFuZ2VcbiAgQGV4dGVuZCgpXG4gIHdpc2U6ICdsaW5ld2lzZScgIyBbRklYTUVdIHRvIHJlLW92ZXJyaWRlIHRhcmdldC53aXNlIGluIHZpc3VhbC1tb2RlXG4gIHRhcmdldDogJ01vdmVUb1JlbGF0aXZlTGluZSdcblxuIyBhbGlhc1xuY2xhc3MgQ2hhbmdlTGluZSBleHRlbmRzIFN1YnN0aXR1dGVMaW5lXG4gIEBleHRlbmQoKVxuXG5jbGFzcyBDaGFuZ2VUb0xhc3RDaGFyYWN0ZXJPZkxpbmUgZXh0ZW5kcyBDaGFuZ2VcbiAgQGV4dGVuZCgpXG4gIHRhcmdldDogJ01vdmVUb0xhc3RDaGFyYWN0ZXJPZkxpbmUnXG5cbiAgZXhlY3V0ZTogLT5cbiAgICBpZiBAdGFyZ2V0Lndpc2UgaXMgJ2Jsb2Nrd2lzZSdcbiAgICAgIEBvbkRpZFNlbGVjdFRhcmdldCA9PlxuICAgICAgICBmb3IgYmxvY2t3aXNlU2VsZWN0aW9uIGluIEBnZXRCbG9ja3dpc2VTZWxlY3Rpb25zKClcbiAgICAgICAgICBibG9ja3dpc2VTZWxlY3Rpb24uZXh0ZW5kTWVtYmVyU2VsZWN0aW9uc1RvRW5kT2ZMaW5lKClcbiAgICBzdXBlclxuIl19
