(function() {
  var ActivateInsertMode, ActivateReplaceMode, Change, ChangeLine, ChangeOccurrence, ChangeToLastCharacterOfLine, InsertAboveWithNewline, InsertAfter, InsertAfterEndOfLine, InsertAtBeginningOfLine, InsertAtEndOfOccurrence, InsertAtEndOfSmartWord, InsertAtEndOfTarget, InsertAtFirstCharacterOfLine, InsertAtLastInsert, InsertAtNextFoldStart, InsertAtPreviousFoldStart, InsertAtStartOfOccurrence, InsertAtStartOfSmartWord, InsertAtStartOfTarget, InsertBelowWithNewline, InsertByTarget, Operator, Range, Substitute, SubstituteLine, _, limitNumber, moveCursorLeft, moveCursorRight, ref, swrap,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  _ = require('underscore-plus');

  Range = require('atom').Range;

  ref = require('./utils'), moveCursorLeft = ref.moveCursorLeft, moveCursorRight = ref.moveCursorRight, limitNumber = ref.limitNumber;

  swrap = require('./selection-wrapper');

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
          var change, changedRange, mode, textByUserInput;
          mode = arg.mode;
          if (mode !== 'insert') {
            return;
          }
          disposable.dispose();
          _this.vimState.mark.set('^', _this.editor.getCursorBufferPosition());
          textByUserInput = '';
          if (change = _this.getChangeSinceCheckpoint('insert')) {
            _this.lastChange = change;
            changedRange = new Range(change.start, change.start.traverse(change.newExtent));
            _this.vimState.mark.setRange('[', ']', changedRange);
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
      if (this.isRepeated()) {
        this.flashTarget = this.trackChange = true;
        this.startMutation((function(_this) {
          return function() {
            var i, len, ref1, ref2, ref3, selection;
            if (_this.isRequireTarget()) {
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
        if (this.isRequireTarget()) {
          this.normalizeSelectionsIfNecessary();
        }
        this.createBufferCheckpoint('undo');
        if (this.isRequireTarget()) {
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

    InsertAboveWithNewline.prototype.mutateText = function() {
      return this.editor.insertNewlineAbove();
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
      return this.editor.insertNewlineBelow();
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
          var $selection, blockwiseSelection, i, j, k, len, len1, len2, ref1, ref2, ref3, ref4, results, selection;
          if (!_this.occurrenceSelected && _this.mode === 'visual' && ((ref1 = _this.submode) === 'characterwise' || ref1 === 'linewise')) {
            ref2 = swrap.getSelections(_this.editor);
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
          ref4 = _this.editor.getSelections();
          results = [];
          for (k = 0, len2 = ref4.length; k < len2; k++) {
            selection = ref4[k];
            results.push(swrap(selection).setBufferPositionTo(_this.which));
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
      isLinewiseTarget = swrap.detectWise(this.editor) === 'linewise';
      ref1 = this.editor.getSelections();
      results = [];
      for (i = 0, len = ref1.length; i < len; i++) {
        selection = ref1[i];
        this.setTextToRegisterForSelection(selection);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvb3BlcmF0b3ItaW5zZXJ0LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsc2tCQUFBO0lBQUE7OztFQUFBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVI7O0VBQ0gsUUFBUyxPQUFBLENBQVEsTUFBUjs7RUFFVixNQUlJLE9BQUEsQ0FBUSxTQUFSLENBSkosRUFDRSxtQ0FERixFQUVFLHFDQUZGLEVBR0U7O0VBRUYsS0FBQSxHQUFRLE9BQUEsQ0FBUSxxQkFBUjs7RUFDUixRQUFBLEdBQVcsT0FBQSxDQUFRLFFBQVIsQ0FBaUIsQ0FBQyxRQUFsQixDQUEyQixVQUEzQjs7RUFNTDs7Ozs7OztJQUNKLGtCQUFDLENBQUEsTUFBRCxDQUFBOztpQ0FDQSxhQUFBLEdBQWU7O2lDQUNmLFdBQUEsR0FBYTs7aUNBQ2IsWUFBQSxHQUFjOztpQ0FDZCxxQkFBQSxHQUF1Qjs7aUNBRXZCLHlCQUFBLEdBQTJCLFNBQUE7QUFDekIsVUFBQTthQUFBLFVBQUEsR0FBYSxJQUFDLENBQUEsUUFBUSxDQUFDLFdBQVcsQ0FBQyx5QkFBdEIsQ0FBZ0QsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLEdBQUQ7QUFDM0QsY0FBQTtVQUQ2RCxPQUFEO1VBQzVELElBQWMsSUFBQSxLQUFRLFFBQXRCO0FBQUEsbUJBQUE7O1VBQ0EsVUFBVSxDQUFDLE9BQVgsQ0FBQTtVQUVBLEtBQUMsQ0FBQSxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQWYsQ0FBbUIsR0FBbkIsRUFBd0IsS0FBQyxDQUFBLE1BQU0sQ0FBQyx1QkFBUixDQUFBLENBQXhCO1VBQ0EsZUFBQSxHQUFrQjtVQUNsQixJQUFHLE1BQUEsR0FBUyxLQUFDLENBQUEsd0JBQUQsQ0FBMEIsUUFBMUIsQ0FBWjtZQUNFLEtBQUMsQ0FBQSxVQUFELEdBQWM7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QkFBSDtVQUNFLFNBQVMsQ0FBQyxVQUFWLENBQXFCLElBQXJCLEVBQTJCO1lBQUEsVUFBQSxFQUFZLElBQVo7V0FBM0I7dUJBQ0EsU0FBUyxDQUFDLE1BQU0sQ0FBQyxRQUFqQixDQUFBLEdBRkY7U0FBQSxNQUFBO3VCQUlFLFNBQVMsQ0FBQyxVQUFWLENBQXFCLEVBQXJCLEVBQXlCO1lBQUEsVUFBQSxFQUFZLElBQVo7V0FBekIsR0FKRjs7QUFGRjs7SUFQVTs7OztLQU5POztFQXFCZjs7Ozs7OztJQUNKLGdCQUFDLENBQUEsTUFBRCxDQUFBOztJQUNBLGdCQUFDLENBQUEsV0FBRCxHQUFjOzsrQkFDZCxVQUFBLEdBQVk7Ozs7S0FIaUI7O0VBS3pCOzs7Ozs7O0lBQ0osVUFBQyxDQUFBLE1BQUQsQ0FBQTs7eUJBQ0EsTUFBQSxHQUFROzs7O0tBRmU7O0VBSW5COzs7Ozs7O0lBQ0osY0FBQyxDQUFBLE1BQUQsQ0FBQTs7NkJBQ0EsSUFBQSxHQUFNOzs2QkFDTixNQUFBLEdBQVE7Ozs7S0FIbUI7O0VBTXZCOzs7Ozs7O0lBQ0osVUFBQyxDQUFBLE1BQUQsQ0FBQTs7OztLQUR1Qjs7RUFHbkI7Ozs7Ozs7SUFDSiwyQkFBQyxDQUFBLE1BQUQsQ0FBQTs7MENBQ0EsTUFBQSxHQUFROzswQ0FFUixPQUFBLEdBQVMsU0FBQTtNQUNQLElBQUcsSUFBQyxDQUFBLE1BQU0sQ0FBQyxJQUFSLEtBQWdCLFdBQW5CO1FBQ0UsSUFBQyxDQUFBLGlCQUFELENBQW1CLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUE7QUFDakIsZ0JBQUE7QUFBQTtBQUFBO2lCQUFBLHNDQUFBOzsyQkFDRSxrQkFBa0IsQ0FBQyxpQ0FBbkIsQ0FBQTtBQURGOztVQURpQjtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbkIsRUFERjs7YUFJQSwwREFBQSxTQUFBO0lBTE87Ozs7S0FKK0I7QUEzVDFDIiwic291cmNlc0NvbnRlbnQiOlsiXyA9IHJlcXVpcmUgJ3VuZGVyc2NvcmUtcGx1cydcbntSYW5nZX0gPSByZXF1aXJlICdhdG9tJ1xuXG57XG4gIG1vdmVDdXJzb3JMZWZ0XG4gIG1vdmVDdXJzb3JSaWdodFxuICBsaW1pdE51bWJlclxufSA9IHJlcXVpcmUgJy4vdXRpbHMnXG5zd3JhcCA9IHJlcXVpcmUgJy4vc2VsZWN0aW9uLXdyYXBwZXInXG5PcGVyYXRvciA9IHJlcXVpcmUoJy4vYmFzZScpLmdldENsYXNzKCdPcGVyYXRvcicpXG5cbiMgSW5zZXJ0IGVudGVyaW5nIG9wZXJhdGlvblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIFtOT1RFXVxuIyBSdWxlOiBEb24ndCBtYWtlIGFueSB0ZXh0IG11dGF0aW9uIGJlZm9yZSBjYWxsaW5nIGBAc2VsZWN0VGFyZ2V0KClgLlxuY2xhc3MgQWN0aXZhdGVJbnNlcnRNb2RlIGV4dGVuZHMgT3BlcmF0b3JcbiAgQGV4dGVuZCgpXG4gIHJlcXVpcmVUYXJnZXQ6IGZhbHNlXG4gIGZsYXNoVGFyZ2V0OiBmYWxzZVxuICBmaW5hbFN1Ym1vZGU6IG51bGxcbiAgc3VwcG9ydEluc2VydGlvbkNvdW50OiB0cnVlXG5cbiAgb2JzZXJ2ZVdpbGxEZWFjdGl2YXRlTW9kZTogLT5cbiAgICBkaXNwb3NhYmxlID0gQHZpbVN0YXRlLm1vZGVNYW5hZ2VyLnByZWVtcHRXaWxsRGVhY3RpdmF0ZU1vZGUgKHttb2RlfSkgPT5cbiAgICAgIHJldHVybiB1bmxlc3MgbW9kZSBpcyAnaW5zZXJ0J1xuICAgICAgZGlzcG9zYWJsZS5kaXNwb3NlKClcblxuICAgICAgQHZpbVN0YXRlLm1hcmsuc2V0KCdeJywgQGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpKSAjIExhc3QgaW5zZXJ0LW1vZGUgcG9zaXRpb25cbiAgICAgIHRleHRCeVVzZXJJbnB1dCA9ICcnXG4gICAgICBpZiBjaGFuZ2UgPSBAZ2V0Q2hhbmdlU2luY2VDaGVja3BvaW50KCdpbnNlcnQnKVxuICAgICAgICBAbGFzdENoYW5nZSA9IGNoYW5nZVxuICAgICAgICBjaGFuZ2VkUmFuZ2UgPSBuZXcgUmFuZ2UoY2hhbmdlLnN0YXJ0LCBjaGFuZ2Uuc3RhcnQudHJhdmVyc2UoY2hhbmdlLm5ld0V4dGVudCkpXG4gICAgICAgIEB2aW1TdGF0ZS5tYXJrLnNldFJhbmdlKCdbJywgJ10nLCBjaGFuZ2VkUmFuZ2UpXG4gICAgICAgIHRleHRCeVVzZXJJbnB1dCA9IGNoYW5nZS5uZXdUZXh0XG4gICAgICBAdmltU3RhdGUucmVnaXN0ZXIuc2V0KCcuJywgdGV4dDogdGV4dEJ5VXNlcklucHV0KSAjIExhc3QgaW5zZXJ0ZWQgdGV4dFxuXG4gICAgICBfLnRpbWVzIEBnZXRJbnNlcnRpb25Db3VudCgpLCA9PlxuICAgICAgICB0ZXh0ID0gQHRleHRCeU9wZXJhdG9yICsgdGV4dEJ5VXNlcklucHV0XG4gICAgICAgIGZvciBzZWxlY3Rpb24gaW4gQGVkaXRvci5nZXRTZWxlY3Rpb25zKClcbiAgICAgICAgICBzZWxlY3Rpb24uaW5zZXJ0VGV4dCh0ZXh0LCBhdXRvSW5kZW50OiB0cnVlKVxuXG4gICAgICAjIFRoaXMgY3Vyc29yIHN0YXRlIGlzIHJlc3RvcmVkIG9uIHVuZG8uXG4gICAgICAjIFNvIGN1cnNvciBzdGF0ZSBoYXMgdG8gYmUgdXBkYXRlZCBiZWZvcmUgbmV4dCBncm91cENoYW5nZXNTaW5jZUNoZWNrcG9pbnQoKVxuICAgICAgaWYgQGdldENvbmZpZygnY2xlYXJNdWx0aXBsZUN1cnNvcnNPbkVzY2FwZUluc2VydE1vZGUnKVxuICAgICAgICBAdmltU3RhdGUuY2xlYXJTZWxlY3Rpb25zKClcblxuICAgICAgIyBncm91cGluZyBjaGFuZ2VzIGZvciB1bmRvIGNoZWNrcG9pbnQgbmVlZCB0byBjb21lIGxhc3RcbiAgICAgIGlmIEBnZXRDb25maWcoJ2dyb3VwQ2hhbmdlc1doZW5MZWF2aW5nSW5zZXJ0TW9kZScpXG4gICAgICAgIEBncm91cENoYW5nZXNTaW5jZUJ1ZmZlckNoZWNrcG9pbnQoJ3VuZG8nKVxuXG4gICMgV2hlbiBlYWNoIG11dGFpb24ncyBleHRlbnQgaXMgbm90IGludGVyc2VjdGluZywgbXVpdGlwbGUgY2hhbmdlcyBhcmUgcmVjb3JkZWRcbiAgIyBlLmdcbiAgIyAgLSBNdWx0aWN1cnNvcnMgZWRpdFxuICAjICAtIEN1cnNvciBtb3ZlZCBpbiBpbnNlcnQtbW9kZShlLmcgY3RybC1mLCBjdHJsLWIpXG4gICMgQnV0IEkgZG9uJ3QgY2FyZSBtdWx0aXBsZSBjaGFuZ2VzIGp1c3QgYmVjYXVzZSBJJ20gbGF6eShzbyBub3QgcGVyZmVjdCBpbXBsZW1lbnRhdGlvbikuXG4gICMgSSBvbmx5IHRha2UgY2FyZSBvZiBvbmUgY2hhbmdlIGhhcHBlbmVkIGF0IGVhcmxpZXN0KHRvcEN1cnNvcidzIGNoYW5nZSkgcG9zaXRpb24uXG4gICMgVGhhdHMnIHdoeSBJIHNhdmUgdG9wQ3Vyc29yJ3MgcG9zaXRpb24gdG8gQHRvcEN1cnNvclBvc2l0aW9uQXRJbnNlcnRpb25TdGFydCB0byBjb21wYXJlIHRyYXZlcnNhbCB0byBkZWxldGlvblN0YXJ0XG4gICMgV2h5IEkgdXNlIHRvcEN1cnNvcidzIGNoYW5nZT8gSnVzdCBiZWNhdXNlIGl0J3MgZWFzeSB0byB1c2UgZmlyc3QgY2hhbmdlIHJldHVybmVkIGJ5IGdldENoYW5nZVNpbmNlQ2hlY2twb2ludCgpLlxuICBnZXRDaGFuZ2VTaW5jZUNoZWNrcG9pbnQ6IChwdXJwb3NlKSAtPlxuICAgIGNoZWNrcG9pbnQgPSBAZ2V0QnVmZmVyQ2hlY2twb2ludChwdXJwb3NlKVxuICAgIEBlZGl0b3IuYnVmZmVyLmdldENoYW5nZXNTaW5jZUNoZWNrcG9pbnQoY2hlY2twb2ludClbMF1cblxuICAjIFtCVUctQlVULU9LXSBSZXBsYXlpbmcgdGV4dC1kZWxldGlvbi1vcGVyYXRpb24gaXMgbm90IGNvbXBhdGlibGUgdG8gcHVyZSBWaW0uXG4gICMgUHVyZSBWaW0gcmVjb3JkIGFsbCBvcGVyYXRpb24gaW4gaW5zZXJ0LW1vZGUgYXMga2V5c3Ryb2tlIGxldmVsIGFuZCBjYW4gZGlzdGluZ3Vpc2hcbiAgIyBjaGFyYWN0ZXIgZGVsZXRlZCBieSBgRGVsZXRlYCBvciBieSBgY3RybC11YC5cbiAgIyBCdXQgSSBjYW4gbm90IGFuZCBkb24ndCB0cnlpbmcgdG8gbWluaWMgdGhpcyBsZXZlbCBvZiBjb21wYXRpYmlsaXR5LlxuICAjIFNvIGJhc2ljYWxseSBkZWxldGlvbi1kb25lLWluLW9uZSBpcyBleHBlY3RlZCB0byB3b3JrIHdlbGwuXG4gIHJlcGxheUxhc3RDaGFuZ2U6IChzZWxlY3Rpb24pIC0+XG4gICAgaWYgQGxhc3RDaGFuZ2U/XG4gICAgICB7c3RhcnQsIG5ld0V4dGVudCwgb2xkRXh0ZW50LCBuZXdUZXh0fSA9IEBsYXN0Q2hhbmdlXG4gICAgICB1bmxlc3Mgb2xkRXh0ZW50LmlzWmVybygpXG4gICAgICAgIHRyYXZlcnNhbFRvU3RhcnRPZkRlbGV0ZSA9IHN0YXJ0LnRyYXZlcnNhbEZyb20oQHRvcEN1cnNvclBvc2l0aW9uQXRJbnNlcnRpb25TdGFydClcbiAgICAgICAgZGVsZXRpb25TdGFydCA9IHNlbGVjdGlvbi5jdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKS50cmF2ZXJzZSh0cmF2ZXJzYWxUb1N0YXJ0T2ZEZWxldGUpXG4gICAgICAgIGRlbGV0aW9uRW5kID0gZGVsZXRpb25TdGFydC50cmF2ZXJzZShvbGRFeHRlbnQpXG4gICAgICAgIHNlbGVjdGlvbi5zZXRCdWZmZXJSYW5nZShbZGVsZXRpb25TdGFydCwgZGVsZXRpb25FbmRdKVxuICAgIGVsc2VcbiAgICAgIG5ld1RleHQgPSAnJ1xuICAgIHNlbGVjdGlvbi5pbnNlcnRUZXh0KG5ld1RleHQsIGF1dG9JbmRlbnQ6IHRydWUpXG5cbiAgIyBjYWxsZWQgd2hlbiByZXBlYXRlZFxuICAjIFtGSVhNRV0gdG8gdXNlIHJlcGxheUxhc3RDaGFuZ2UgaW4gcmVwZWF0SW5zZXJ0IG92ZXJyaWRpbmcgc3ViY2xhc3NzLlxuICByZXBlYXRJbnNlcnQ6IChzZWxlY3Rpb24sIHRleHQpIC0+XG4gICAgQHJlcGxheUxhc3RDaGFuZ2Uoc2VsZWN0aW9uKVxuXG4gIGdldEluc2VydGlvbkNvdW50OiAtPlxuICAgIEBpbnNlcnRpb25Db3VudCA/PSBpZiBAc3VwcG9ydEluc2VydGlvbkNvdW50IHRoZW4gQGdldENvdW50KC0xKSBlbHNlIDBcbiAgICAjIEF2b2lkIGZyZWV6aW5nIGJ5IGFjY2NpZGVudGFsIGJpZyBjb3VudChlLmcuIGA1NTU1NTU1NTU1NTU1aWApLCBTZWUgIzU2MCwgIzU5NlxuICAgIGxpbWl0TnVtYmVyKEBpbnNlcnRpb25Db3VudCwgbWF4OiAxMDApXG5cbiAgZXhlY3V0ZTogLT5cbiAgICBpZiBAaXNSZXBlYXRlZCgpXG4gICAgICBAZmxhc2hUYXJnZXQgPSBAdHJhY2tDaGFuZ2UgPSB0cnVlXG5cbiAgICAgIEBzdGFydE11dGF0aW9uID0+XG4gICAgICAgIEBzZWxlY3RUYXJnZXQoKSBpZiBAaXNSZXF1aXJlVGFyZ2V0KClcbiAgICAgICAgQG11dGF0ZVRleHQ/KClcbiAgICAgICAgZm9yIHNlbGVjdGlvbiBpbiBAZWRpdG9yLmdldFNlbGVjdGlvbnMoKVxuICAgICAgICAgIEByZXBlYXRJbnNlcnQoc2VsZWN0aW9uLCBAbGFzdENoYW5nZT8ubmV3VGV4dCA/ICcnKVxuICAgICAgICAgIG1vdmVDdXJzb3JMZWZ0KHNlbGVjdGlvbi5jdXJzb3IpXG4gICAgICAgIEBtdXRhdGlvbk1hbmFnZXIuc2V0Q2hlY2twb2ludCgnZGlkLWZpbmlzaCcpXG5cbiAgICAgIGlmIEBnZXRDb25maWcoJ2NsZWFyTXVsdGlwbGVDdXJzb3JzT25Fc2NhcGVJbnNlcnRNb2RlJylcbiAgICAgICAgQHZpbVN0YXRlLmNsZWFyU2VsZWN0aW9ucygpXG5cbiAgICBlbHNlXG4gICAgICBAbm9ybWFsaXplU2VsZWN0aW9uc0lmTmVjZXNzYXJ5KCkgaWYgQGlzUmVxdWlyZVRhcmdldCgpXG4gICAgICBAY3JlYXRlQnVmZmVyQ2hlY2twb2ludCgndW5kbycpXG4gICAgICBAc2VsZWN0VGFyZ2V0KCkgaWYgQGlzUmVxdWlyZVRhcmdldCgpXG4gICAgICBAb2JzZXJ2ZVdpbGxEZWFjdGl2YXRlTW9kZSgpXG5cbiAgICAgIEBtdXRhdGVUZXh0PygpXG5cbiAgICAgIGlmIEBnZXRJbnNlcnRpb25Db3VudCgpID4gMFxuICAgICAgICBAdGV4dEJ5T3BlcmF0b3IgPSBAZ2V0Q2hhbmdlU2luY2VDaGVja3BvaW50KCd1bmRvJyk/Lm5ld1RleHQgPyAnJ1xuXG4gICAgICBAY3JlYXRlQnVmZmVyQ2hlY2twb2ludCgnaW5zZXJ0JylcbiAgICAgIHRvcEN1cnNvciA9IEBlZGl0b3IuZ2V0Q3Vyc29yc09yZGVyZWRCeUJ1ZmZlclBvc2l0aW9uKClbMF1cbiAgICAgIEB0b3BDdXJzb3JQb3NpdGlvbkF0SW5zZXJ0aW9uU3RhcnQgPSB0b3BDdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuXG4gICAgICAjIFNraXAgbm9ybWFsaXphdGlvbiBvZiBibG9ja3dpc2VTZWxlY3Rpb24uXG4gICAgICAjIFNpbmNlIHdhbnQgdG8ga2VlcCBtdWx0aS1jdXJzb3IgYW5kIGl0J3MgcG9zaXRpb24gaW4gd2hlbiBzaGlmdCB0byBpbnNlcnQtbW9kZS5cbiAgICAgIGZvciBibG9ja3dpc2VTZWxlY3Rpb24gaW4gQGdldEJsb2Nrd2lzZVNlbGVjdGlvbnMoKVxuICAgICAgICBibG9ja3dpc2VTZWxlY3Rpb24uc2tpcE5vcm1hbGl6YXRpb24oKVxuICAgICAgQGFjdGl2YXRlTW9kZSgnaW5zZXJ0JywgQGZpbmFsU3VibW9kZSlcblxuY2xhc3MgQWN0aXZhdGVSZXBsYWNlTW9kZSBleHRlbmRzIEFjdGl2YXRlSW5zZXJ0TW9kZVxuICBAZXh0ZW5kKClcbiAgZmluYWxTdWJtb2RlOiAncmVwbGFjZSdcblxuICByZXBlYXRJbnNlcnQ6IChzZWxlY3Rpb24sIHRleHQpIC0+XG4gICAgZm9yIGNoYXIgaW4gdGV4dCB3aGVuIChjaGFyIGlzbnQgXCJcXG5cIilcbiAgICAgIGJyZWFrIGlmIHNlbGVjdGlvbi5jdXJzb3IuaXNBdEVuZE9mTGluZSgpXG4gICAgICBzZWxlY3Rpb24uc2VsZWN0UmlnaHQoKVxuICAgIHNlbGVjdGlvbi5pbnNlcnRUZXh0KHRleHQsIGF1dG9JbmRlbnQ6IGZhbHNlKVxuXG5jbGFzcyBJbnNlcnRBZnRlciBleHRlbmRzIEFjdGl2YXRlSW5zZXJ0TW9kZVxuICBAZXh0ZW5kKClcbiAgZXhlY3V0ZTogLT5cbiAgICBtb3ZlQ3Vyc29yUmlnaHQoY3Vyc29yKSBmb3IgY3Vyc29yIGluIEBlZGl0b3IuZ2V0Q3Vyc29ycygpXG4gICAgc3VwZXJcblxuIyBrZXk6ICdnIEknIGluIGFsbCBtb2RlXG5jbGFzcyBJbnNlcnRBdEJlZ2lubmluZ09mTGluZSBleHRlbmRzIEFjdGl2YXRlSW5zZXJ0TW9kZVxuICBAZXh0ZW5kKClcbiAgZXhlY3V0ZTogLT5cbiAgICBpZiBAbW9kZSBpcyAndmlzdWFsJyBhbmQgQHN1Ym1vZGUgaW4gWydjaGFyYWN0ZXJ3aXNlJywgJ2xpbmV3aXNlJ11cbiAgICAgIEBlZGl0b3Iuc3BsaXRTZWxlY3Rpb25zSW50b0xpbmVzKClcbiAgICBAZWRpdG9yLm1vdmVUb0JlZ2lubmluZ09mTGluZSgpXG4gICAgc3VwZXJcblxuIyBrZXk6IG5vcm1hbCAnQSdcbmNsYXNzIEluc2VydEFmdGVyRW5kT2ZMaW5lIGV4dGVuZHMgQWN0aXZhdGVJbnNlcnRNb2RlXG4gIEBleHRlbmQoKVxuICBleGVjdXRlOiAtPlxuICAgIEBlZGl0b3IubW92ZVRvRW5kT2ZMaW5lKClcbiAgICBzdXBlclxuXG4jIGtleTogbm9ybWFsICdJJ1xuY2xhc3MgSW5zZXJ0QXRGaXJzdENoYXJhY3Rlck9mTGluZSBleHRlbmRzIEFjdGl2YXRlSW5zZXJ0TW9kZVxuICBAZXh0ZW5kKClcbiAgZXhlY3V0ZTogLT5cbiAgICBAZWRpdG9yLm1vdmVUb0JlZ2lubmluZ09mTGluZSgpXG4gICAgQGVkaXRvci5tb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZSgpXG4gICAgc3VwZXJcblxuY2xhc3MgSW5zZXJ0QXRMYXN0SW5zZXJ0IGV4dGVuZHMgQWN0aXZhdGVJbnNlcnRNb2RlXG4gIEBleHRlbmQoKVxuICBleGVjdXRlOiAtPlxuICAgIGlmIChwb2ludCA9IEB2aW1TdGF0ZS5tYXJrLmdldCgnXicpKVxuICAgICAgQGVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihwb2ludClcbiAgICAgIEBlZGl0b3Iuc2Nyb2xsVG9DdXJzb3JQb3NpdGlvbih7Y2VudGVyOiB0cnVlfSlcbiAgICBzdXBlclxuXG5jbGFzcyBJbnNlcnRBYm92ZVdpdGhOZXdsaW5lIGV4dGVuZHMgQWN0aXZhdGVJbnNlcnRNb2RlXG4gIEBleHRlbmQoKVxuXG4gICMgVGhpcyBpcyBmb3IgYG9gIGFuZCBgT2Agb3BlcmF0b3IuXG4gICMgT24gdW5kby9yZWRvIHB1dCBjdXJzb3IgYXQgb3JpZ2luYWwgcG9pbnQgd2hlcmUgdXNlciB0eXBlIGBvYCBvciBgT2AuXG4gIGdyb3VwQ2hhbmdlc1NpbmNlQnVmZmVyQ2hlY2twb2ludDogLT5cbiAgICBsYXN0Q3Vyc29yID0gQGVkaXRvci5nZXRMYXN0Q3Vyc29yKClcbiAgICBjdXJzb3JQb3NpdGlvbiA9IGxhc3RDdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuICAgIGxhc3RDdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24oQHZpbVN0YXRlLmdldE9yaWdpbmFsQ3Vyc29yUG9zaXRpb25CeU1hcmtlcigpKVxuXG4gICAgc3VwZXJcblxuICAgIGxhc3RDdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24oY3Vyc29yUG9zaXRpb24pXG5cbiAgbXV0YXRlVGV4dDogLT5cbiAgICBAZWRpdG9yLmluc2VydE5ld2xpbmVBYm92ZSgpXG5cbiAgcmVwZWF0SW5zZXJ0OiAoc2VsZWN0aW9uLCB0ZXh0KSAtPlxuICAgIHNlbGVjdGlvbi5pbnNlcnRUZXh0KHRleHQudHJpbUxlZnQoKSwgYXV0b0luZGVudDogdHJ1ZSlcblxuY2xhc3MgSW5zZXJ0QmVsb3dXaXRoTmV3bGluZSBleHRlbmRzIEluc2VydEFib3ZlV2l0aE5ld2xpbmVcbiAgQGV4dGVuZCgpXG4gIG11dGF0ZVRleHQ6IC0+XG4gICAgQGVkaXRvci5pbnNlcnROZXdsaW5lQmVsb3coKVxuXG4jIEFkdmFuY2VkIEluc2VydGlvblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBJbnNlcnRCeVRhcmdldCBleHRlbmRzIEFjdGl2YXRlSW5zZXJ0TW9kZVxuICBAZXh0ZW5kKGZhbHNlKVxuICByZXF1aXJlVGFyZ2V0OiB0cnVlXG4gIHdoaWNoOiBudWxsICMgb25lIG9mIFsnc3RhcnQnLCAnZW5kJywgJ2hlYWQnLCAndGFpbCddXG5cbiAgaW5pdGlhbGl6ZTogLT5cbiAgICAjIEhBQ0tcbiAgICAjIFdoZW4gZyBpIGlzIG1hcHBlZCB0byBgaW5zZXJ0LWF0LXN0YXJ0LW9mLXRhcmdldGAuXG4gICAgIyBgZyBpIDMgbGAgc3RhcnQgaW5zZXJ0IGF0IDMgY29sdW1uIHJpZ2h0IHBvc2l0aW9uLlxuICAgICMgSW4gdGhpcyBjYXNlLCB3ZSBkb24ndCB3YW50IHJlcGVhdCBpbnNlcnRpb24gMyB0aW1lcy5cbiAgICAjIFRoaXMgQGdldENvdW50KCkgY2FsbCBjYWNoZSBudW1iZXIgYXQgdGhlIHRpbWluZyBCRUZPUkUgJzMnIGlzIHNwZWNpZmllZC5cbiAgICBAZ2V0Q291bnQoKVxuICAgIHN1cGVyXG5cbiAgZXhlY3V0ZTogLT5cbiAgICBAb25EaWRTZWxlY3RUYXJnZXQgPT5cbiAgICAgICMgSW4gdkMvdkwsIHdoZW4gb2NjdXJyZW5jZSBtYXJrZXIgd2FzIE5PVCBzZWxlY3RlZCxcbiAgICAgICMgaXQgYmVoYXZlJ3MgdmVyeSBzcGVjaWFsbHlcbiAgICAgICMgdkM6IGBJYCBhbmQgYEFgIGJlaGF2ZXMgYXMgc2hvZnQgaGFuZCBvZiBgY3RybC12IElgIGFuZCBgY3RybC12IEFgLlxuICAgICAgIyB2TDogYElgIGFuZCBgQWAgcGxhY2UgY3Vyc29ycyBhdCBlYWNoIHNlbGVjdGVkIGxpbmVzIG9mIHN0YXJ0KCBvciBlbmQgKSBvZiBub24td2hpdGUtc3BhY2UgY2hhci5cbiAgICAgIGlmIG5vdCBAb2NjdXJyZW5jZVNlbGVjdGVkIGFuZCBAbW9kZSBpcyAndmlzdWFsJyBhbmQgQHN1Ym1vZGUgaW4gWydjaGFyYWN0ZXJ3aXNlJywgJ2xpbmV3aXNlJ11cbiAgICAgICAgZm9yICRzZWxlY3Rpb24gaW4gc3dyYXAuZ2V0U2VsZWN0aW9ucyhAZWRpdG9yKVxuICAgICAgICAgICRzZWxlY3Rpb24ubm9ybWFsaXplKClcbiAgICAgICAgICAkc2VsZWN0aW9uLmFwcGx5V2lzZSgnYmxvY2t3aXNlJylcblxuICAgICAgICBpZiBAc3VibW9kZSBpcyAnbGluZXdpc2UnXG4gICAgICAgICAgZm9yIGJsb2Nrd2lzZVNlbGVjdGlvbiBpbiBAZ2V0QmxvY2t3aXNlU2VsZWN0aW9ucygpXG4gICAgICAgICAgICBibG9ja3dpc2VTZWxlY3Rpb24uZXhwYW5kTWVtYmVyU2VsZWN0aW9uc092ZXJMaW5lV2l0aFRyaW1SYW5nZSgpXG5cbiAgICAgIGZvciBzZWxlY3Rpb24gaW4gQGVkaXRvci5nZXRTZWxlY3Rpb25zKClcbiAgICAgICAgc3dyYXAoc2VsZWN0aW9uKS5zZXRCdWZmZXJQb3NpdGlvblRvKEB3aGljaClcbiAgICBzdXBlclxuXG4jIGtleTogJ0knLCBVc2VkIGluICd2aXN1YWwtbW9kZS5jaGFyYWN0ZXJ3aXNlJywgdmlzdWFsLW1vZGUuYmxvY2t3aXNlXG5jbGFzcyBJbnNlcnRBdFN0YXJ0T2ZUYXJnZXQgZXh0ZW5kcyBJbnNlcnRCeVRhcmdldFxuICBAZXh0ZW5kKClcbiAgd2hpY2g6ICdzdGFydCdcblxuIyBrZXk6ICdBJywgVXNlZCBpbiAndmlzdWFsLW1vZGUuY2hhcmFjdGVyd2lzZScsICd2aXN1YWwtbW9kZS5ibG9ja3dpc2UnXG5jbGFzcyBJbnNlcnRBdEVuZE9mVGFyZ2V0IGV4dGVuZHMgSW5zZXJ0QnlUYXJnZXRcbiAgQGV4dGVuZCgpXG4gIHdoaWNoOiAnZW5kJ1xuXG5jbGFzcyBJbnNlcnRBdFN0YXJ0T2ZPY2N1cnJlbmNlIGV4dGVuZHMgSW5zZXJ0QnlUYXJnZXRcbiAgQGV4dGVuZCgpXG4gIHdoaWNoOiAnc3RhcnQnXG4gIG9jY3VycmVuY2U6IHRydWVcblxuY2xhc3MgSW5zZXJ0QXRFbmRPZk9jY3VycmVuY2UgZXh0ZW5kcyBJbnNlcnRCeVRhcmdldFxuICBAZXh0ZW5kKClcbiAgd2hpY2g6ICdlbmQnXG4gIG9jY3VycmVuY2U6IHRydWVcblxuY2xhc3MgSW5zZXJ0QXRTdGFydE9mU21hcnRXb3JkIGV4dGVuZHMgSW5zZXJ0QnlUYXJnZXRcbiAgQGV4dGVuZCgpXG4gIHdoaWNoOiAnc3RhcnQnXG4gIHRhcmdldDogXCJNb3ZlVG9QcmV2aW91c1NtYXJ0V29yZFwiXG5cbmNsYXNzIEluc2VydEF0RW5kT2ZTbWFydFdvcmQgZXh0ZW5kcyBJbnNlcnRCeVRhcmdldFxuICBAZXh0ZW5kKClcbiAgd2hpY2g6ICdlbmQnXG4gIHRhcmdldDogXCJNb3ZlVG9FbmRPZlNtYXJ0V29yZFwiXG5cbmNsYXNzIEluc2VydEF0UHJldmlvdXNGb2xkU3RhcnQgZXh0ZW5kcyBJbnNlcnRCeVRhcmdldFxuICBAZXh0ZW5kKClcbiAgQGRlc2NyaXB0aW9uOiBcIk1vdmUgdG8gcHJldmlvdXMgZm9sZCBzdGFydCB0aGVuIGVudGVyIGluc2VydC1tb2RlXCJcbiAgd2hpY2g6ICdzdGFydCdcbiAgdGFyZ2V0OiAnTW92ZVRvUHJldmlvdXNGb2xkU3RhcnQnXG5cbmNsYXNzIEluc2VydEF0TmV4dEZvbGRTdGFydCBleHRlbmRzIEluc2VydEJ5VGFyZ2V0XG4gIEBleHRlbmQoKVxuICBAZGVzY3JpcHRpb246IFwiTW92ZSB0byBuZXh0IGZvbGQgc3RhcnQgdGhlbiBlbnRlciBpbnNlcnQtbW9kZVwiXG4gIHdoaWNoOiAnZW5kJ1xuICB0YXJnZXQ6ICdNb3ZlVG9OZXh0Rm9sZFN0YXJ0J1xuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIENoYW5nZSBleHRlbmRzIEFjdGl2YXRlSW5zZXJ0TW9kZVxuICBAZXh0ZW5kKClcbiAgcmVxdWlyZVRhcmdldDogdHJ1ZVxuICB0cmFja0NoYW5nZTogdHJ1ZVxuICBzdXBwb3J0SW5zZXJ0aW9uQ291bnQ6IGZhbHNlXG5cbiAgbXV0YXRlVGV4dDogLT5cbiAgICAjIEFsbHdheXMgZHluYW1pY2FsbHkgZGV0ZXJtaW5lIHNlbGVjdGlvbiB3aXNlIHd0aG91dCBjb25zdWx0aW5nIHRhcmdldC53aXNlXG4gICAgIyBSZWFzb246IHdoZW4gYGMgaSB7YCwgd2lzZSBpcyAnY2hhcmFjdGVyd2lzZScsIGJ1dCBhY3R1YWxseSBzZWxlY3RlZCByYW5nZSBpcyAnbGluZXdpc2UnXG4gICAgIyAgIHtcbiAgICAjICAgICBhXG4gICAgIyAgIH1cbiAgICBpc0xpbmV3aXNlVGFyZ2V0ID0gc3dyYXAuZGV0ZWN0V2lzZShAZWRpdG9yKSBpcyAnbGluZXdpc2UnXG4gICAgZm9yIHNlbGVjdGlvbiBpbiBAZWRpdG9yLmdldFNlbGVjdGlvbnMoKVxuICAgICAgQHNldFRleHRUb1JlZ2lzdGVyRm9yU2VsZWN0aW9uKHNlbGVjdGlvbilcbiAgICAgIGlmIGlzTGluZXdpc2VUYXJnZXRcbiAgICAgICAgc2VsZWN0aW9uLmluc2VydFRleHQoXCJcXG5cIiwgYXV0b0luZGVudDogdHJ1ZSlcbiAgICAgICAgc2VsZWN0aW9uLmN1cnNvci5tb3ZlTGVmdCgpXG4gICAgICBlbHNlXG4gICAgICAgIHNlbGVjdGlvbi5pbnNlcnRUZXh0KCcnLCBhdXRvSW5kZW50OiB0cnVlKVxuXG5jbGFzcyBDaGFuZ2VPY2N1cnJlbmNlIGV4dGVuZHMgQ2hhbmdlXG4gIEBleHRlbmQoKVxuICBAZGVzY3JpcHRpb246IFwiQ2hhbmdlIGFsbCBtYXRjaGluZyB3b3JkIHdpdGhpbiB0YXJnZXQgcmFuZ2VcIlxuICBvY2N1cnJlbmNlOiB0cnVlXG5cbmNsYXNzIFN1YnN0aXR1dGUgZXh0ZW5kcyBDaGFuZ2VcbiAgQGV4dGVuZCgpXG4gIHRhcmdldDogJ01vdmVSaWdodCdcblxuY2xhc3MgU3Vic3RpdHV0ZUxpbmUgZXh0ZW5kcyBDaGFuZ2VcbiAgQGV4dGVuZCgpXG4gIHdpc2U6ICdsaW5ld2lzZScgIyBbRklYTUVdIHRvIHJlLW92ZXJyaWRlIHRhcmdldC53aXNlIGluIHZpc3VhbC1tb2RlXG4gIHRhcmdldDogJ01vdmVUb1JlbGF0aXZlTGluZSdcblxuIyBhbGlhc1xuY2xhc3MgQ2hhbmdlTGluZSBleHRlbmRzIFN1YnN0aXR1dGVMaW5lXG4gIEBleHRlbmQoKVxuXG5jbGFzcyBDaGFuZ2VUb0xhc3RDaGFyYWN0ZXJPZkxpbmUgZXh0ZW5kcyBDaGFuZ2VcbiAgQGV4dGVuZCgpXG4gIHRhcmdldDogJ01vdmVUb0xhc3RDaGFyYWN0ZXJPZkxpbmUnXG5cbiAgZXhlY3V0ZTogLT5cbiAgICBpZiBAdGFyZ2V0Lndpc2UgaXMgJ2Jsb2Nrd2lzZSdcbiAgICAgIEBvbkRpZFNlbGVjdFRhcmdldCA9PlxuICAgICAgICBmb3IgYmxvY2t3aXNlU2VsZWN0aW9uIGluIEBnZXRCbG9ja3dpc2VTZWxlY3Rpb25zKClcbiAgICAgICAgICBibG9ja3dpc2VTZWxlY3Rpb24uZXh0ZW5kTWVtYmVyU2VsZWN0aW9uc1RvRW5kT2ZMaW5lKClcbiAgICBzdXBlclxuIl19
