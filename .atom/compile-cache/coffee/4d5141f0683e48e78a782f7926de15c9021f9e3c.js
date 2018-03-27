(function() {
  var ActivateInsertMode, ActivateReplaceMode, Change, ChangeLine, ChangeOccurrence, ChangeToLastCharacterOfLine, InsertAboveWithNewline, InsertAfter, InsertAfterEndOfLine, InsertAtBeginningOfLine, InsertAtEndOfOccurrence, InsertAtEndOfSmartWord, InsertAtEndOfTarget, InsertAtFirstCharacterOfLine, InsertAtLastInsert, InsertAtNextFoldStart, InsertAtPreviousFoldStart, InsertAtStartOfOccurrence, InsertAtStartOfSmartWord, InsertAtStartOfTarget, InsertBelowWithNewline, InsertByTarget, Operator, Range, Substitute, SubstituteLine, _, limitNumber, moveCursorLeft, moveCursorRight, ref, settings, swrap,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  _ = require('underscore-plus');

  Range = require('atom').Range;

  ref = require('./utils'), moveCursorLeft = ref.moveCursorLeft, moveCursorRight = ref.moveCursorRight, limitNumber = ref.limitNumber;

  swrap = require('./selection-wrapper');

  settings = require('./settings');

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

    ActivateInsertMode.prototype.flashCheckpoint = 'custom';

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
          if (settings.get('clearMultipleCursorsOnEscapeInsertMode')) {
            _this.vimState.clearSelections();
          }
          if (settings.get('groupChangesWhenLeavingInsertMode')) {
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
      var ref1, ref2, topCursor;
      if (this.isRepeated()) {
        this.flashTarget = this.trackChange = true;
        this.startMutation((function(_this) {
          return function() {
            var i, len, mutatedRanges, ref1, ref2, ref3, selection;
            if (_this.isRequireTarget()) {
              _this.selectTarget();
            }
            if (typeof _this.mutateText === "function") {
              _this.mutateText();
            }
            mutatedRanges = [];
            ref1 = _this.editor.getSelections();
            for (i = 0, len = ref1.length; i < len; i++) {
              selection = ref1[i];
              mutatedRanges.push(_this.repeatInsert(selection, (ref2 = (ref3 = _this.lastChange) != null ? ref3.newText : void 0) != null ? ref2 : ''));
              moveCursorLeft(selection.cursor);
            }
            return _this.mutationManager.setBufferRangesForCustomCheckpoint(mutatedRanges);
          };
        })(this));
        if (settings.get('clearMultipleCursorsOnEscapeInsertMode')) {
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
        return this.vimState.activate('insert', this.finalSubmode);
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
      if (this.isMode('visual', ['characterwise', 'linewise'])) {
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
          var i, len, ref1, results, selection;
          if (_this.vimState.isMode('visual')) {
            _this.modifySelection();
          }
          ref1 = _this.editor.getSelections();
          results = [];
          for (i = 0, len = ref1.length; i < len; i++) {
            selection = ref1[i];
            results.push(swrap(selection).setBufferPositionTo(_this.which));
          }
          return results;
        };
      })(this));
      return InsertByTarget.__super__.execute.apply(this, arguments);
    };

    InsertByTarget.prototype.modifySelection = function() {
      var i, len, methodName, ref1, results, selection;
      switch (this.vimState.submode) {
        case 'characterwise':
          this.vimState.selectBlockwise();
          return this.vimState.clearBlockwiseSelections();
        case 'linewise':
          this.editor.splitSelectionsIntoLines();
          methodName = this.which === 'start' ? 'setStartToFirstCharacterOfLine' : this.which === 'end' ? 'shrinkEndToBeforeNewLine' : void 0;
          ref1 = this.editor.getSelections();
          results = [];
          for (i = 0, len = ref1.length; i < len; i++) {
            selection = ref1[i];
            results.push(swrap(selection)[methodName]());
          }
          return results;
      }
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
      isLinewiseTarget = swrap.detectVisualModeSubmode(this.editor) === 'linewise';
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

    ChangeToLastCharacterOfLine.prototype.initialize = function() {
      if (this.isMode('visual', 'blockwise')) {
        this.acceptCurrentSelection = false;
        swrap.setReversedState(this.editor, false);
      }
      return ChangeToLastCharacterOfLine.__super__.initialize.apply(this, arguments);
    };

    return ChangeToLastCharacterOfLine;

  })(Change);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvb3BlcmF0b3ItaW5zZXJ0LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsZ2xCQUFBO0lBQUE7OztFQUFBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVI7O0VBQ0gsUUFBUyxPQUFBLENBQVEsTUFBUjs7RUFFVixNQUlJLE9BQUEsQ0FBUSxTQUFSLENBSkosRUFDRSxtQ0FERixFQUVFLHFDQUZGLEVBR0U7O0VBRUYsS0FBQSxHQUFRLE9BQUEsQ0FBUSxxQkFBUjs7RUFDUixRQUFBLEdBQVcsT0FBQSxDQUFRLFlBQVI7O0VBQ1gsUUFBQSxHQUFXLE9BQUEsQ0FBUSxRQUFSLENBQWlCLENBQUMsUUFBbEIsQ0FBMkIsVUFBM0I7O0VBTUw7Ozs7Ozs7SUFDSixrQkFBQyxDQUFBLE1BQUQsQ0FBQTs7aUNBQ0EsYUFBQSxHQUFlOztpQ0FDZixXQUFBLEdBQWE7O2lDQUNiLFlBQUEsR0FBYzs7aUNBQ2QscUJBQUEsR0FBdUI7O2lDQUN2QixlQUFBLEdBQWlCOztpQ0FFakIseUJBQUEsR0FBMkIsU0FBQTtBQUN6QixVQUFBO2FBQUEsVUFBQSxHQUFhLElBQUMsQ0FBQSxRQUFRLENBQUMsV0FBVyxDQUFDLHlCQUF0QixDQUFnRCxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsR0FBRDtBQUMzRCxjQUFBO1VBRDZELE9BQUQ7VUFDNUQsSUFBYyxJQUFBLEtBQVEsUUFBdEI7QUFBQSxtQkFBQTs7VUFDQSxVQUFVLENBQUMsT0FBWCxDQUFBO1VBRUEsS0FBQyxDQUFBLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBZixDQUFtQixHQUFuQixFQUF3QixLQUFDLENBQUEsTUFBTSxDQUFDLHVCQUFSLENBQUEsQ0FBeEI7VUFDQSxlQUFBLEdBQWtCO1VBQ2xCLElBQUcsTUFBQSxHQUFTLEtBQUMsQ0FBQSx3QkFBRCxDQUEwQixRQUExQixDQUFaO1lBQ0UsS0FBQyxDQUFBLFVBQUQsR0FBYztZQUNkLFlBQUEsR0FBbUIsSUFBQSxLQUFBLENBQU0sTUFBTSxDQUFDLEtBQWIsRUFBb0IsTUFBTSxDQUFDLEtBQUssQ0FBQyxRQUFiLENBQXNCLE1BQU0sQ0FBQyxTQUE3QixDQUFwQjtZQUNuQixLQUFDLENBQUEsUUFBUSxDQUFDLElBQUksQ0FBQyxRQUFmLENBQXdCLEdBQXhCLEVBQTZCLEdBQTdCLEVBQWtDLFlBQWxDO1lBQ0EsZUFBQSxHQUFrQixNQUFNLENBQUMsUUFKM0I7O1VBS0EsS0FBQyxDQUFBLFFBQVEsQ0FBQyxRQUFRLENBQUMsR0FBbkIsQ0FBdUIsR0FBdkIsRUFBNEI7WUFBQSxJQUFBLEVBQU0sZUFBTjtXQUE1QjtVQUVBLENBQUMsQ0FBQyxLQUFGLENBQVEsS0FBQyxDQUFBLGlCQUFELENBQUEsQ0FBUixFQUE4QixTQUFBO0FBQzVCLGdCQUFBO1lBQUEsSUFBQSxHQUFPLEtBQUMsQ0FBQSxjQUFELEdBQWtCO0FBQ3pCO0FBQUE7aUJBQUEsc0NBQUE7OzJCQUNFLFNBQVMsQ0FBQyxVQUFWLENBQXFCLElBQXJCLEVBQTJCO2dCQUFBLFVBQUEsRUFBWSxJQUFaO2VBQTNCO0FBREY7O1VBRjRCLENBQTlCO1VBT0EsSUFBRyxRQUFRLENBQUMsR0FBVCxDQUFhLHdDQUFiLENBQUg7WUFDRSxLQUFDLENBQUEsUUFBUSxDQUFDLGVBQVYsQ0FBQSxFQURGOztVQUlBLElBQUcsUUFBUSxDQUFDLEdBQVQsQ0FBYSxtQ0FBYixDQUFIO21CQUNFLEtBQUMsQ0FBQSxpQ0FBRCxDQUFtQyxNQUFuQyxFQURGOztRQXhCMkQ7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWhEO0lBRFk7O2lDQW9DM0Isd0JBQUEsR0FBMEIsU0FBQyxPQUFEO0FBQ3hCLFVBQUE7TUFBQSxVQUFBLEdBQWEsSUFBQyxDQUFBLG1CQUFELENBQXFCLE9BQXJCO2FBQ2IsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFNLENBQUMseUJBQWYsQ0FBeUMsVUFBekMsQ0FBcUQsQ0FBQSxDQUFBO0lBRjdCOztpQ0FTMUIsZ0JBQUEsR0FBa0IsU0FBQyxTQUFEO0FBQ2hCLFVBQUE7TUFBQSxJQUFHLHVCQUFIO1FBQ0UsT0FBeUMsSUFBQyxDQUFBLFVBQTFDLEVBQUMsa0JBQUQsRUFBUSwwQkFBUixFQUFtQiwwQkFBbkIsRUFBOEI7UUFDOUIsSUFBQSxDQUFPLFNBQVMsQ0FBQyxNQUFWLENBQUEsQ0FBUDtVQUNFLHdCQUFBLEdBQTJCLEtBQUssQ0FBQyxhQUFOLENBQW9CLElBQUMsQ0FBQSxpQ0FBckI7VUFDM0IsYUFBQSxHQUFnQixTQUFTLENBQUMsTUFBTSxDQUFDLGlCQUFqQixDQUFBLENBQW9DLENBQUMsUUFBckMsQ0FBOEMsd0JBQTlDO1VBQ2hCLFdBQUEsR0FBYyxhQUFhLENBQUMsUUFBZCxDQUF1QixTQUF2QjtVQUNkLFNBQVMsQ0FBQyxjQUFWLENBQXlCLENBQUMsYUFBRCxFQUFnQixXQUFoQixDQUF6QixFQUpGO1NBRkY7T0FBQSxNQUFBO1FBUUUsT0FBQSxHQUFVLEdBUlo7O2FBU0EsU0FBUyxDQUFDLFVBQVYsQ0FBcUIsT0FBckIsRUFBOEI7UUFBQSxVQUFBLEVBQVksSUFBWjtPQUE5QjtJQVZnQjs7aUNBY2xCLFlBQUEsR0FBYyxTQUFDLFNBQUQsRUFBWSxJQUFaO2FBQ1osSUFBQyxDQUFBLGdCQUFELENBQWtCLFNBQWxCO0lBRFk7O2lDQUdkLGlCQUFBLEdBQW1CLFNBQUE7O1FBQ2pCLElBQUMsQ0FBQSxpQkFBcUIsSUFBQyxDQUFBLHFCQUFKLEdBQStCLElBQUMsQ0FBQSxRQUFELENBQVUsQ0FBQyxDQUFYLENBQS9CLEdBQWtEOzthQUVyRSxXQUFBLENBQVksSUFBQyxDQUFBLGNBQWIsRUFBNkI7UUFBQSxHQUFBLEVBQUssR0FBTDtPQUE3QjtJQUhpQjs7aUNBS25CLE9BQUEsR0FBUyxTQUFBO0FBQ1AsVUFBQTtNQUFBLElBQUcsSUFBQyxDQUFBLFVBQUQsQ0FBQSxDQUFIO1FBQ0UsSUFBQyxDQUFBLFdBQUQsR0FBZSxJQUFDLENBQUEsV0FBRCxHQUFlO1FBRTlCLElBQUMsQ0FBQSxhQUFELENBQWUsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQTtBQUNiLGdCQUFBO1lBQUEsSUFBbUIsS0FBQyxDQUFBLGVBQUQsQ0FBQSxDQUFuQjtjQUFBLEtBQUMsQ0FBQSxZQUFELENBQUEsRUFBQTs7O2NBQ0EsS0FBQyxDQUFBOztZQUNELGFBQUEsR0FBZ0I7QUFDaEI7QUFBQSxpQkFBQSxzQ0FBQTs7Y0FDRSxhQUFhLENBQUMsSUFBZCxDQUFtQixLQUFDLENBQUEsWUFBRCxDQUFjLFNBQWQsc0ZBQWdELEVBQWhELENBQW5CO2NBQ0EsY0FBQSxDQUFlLFNBQVMsQ0FBQyxNQUF6QjtBQUZGO21CQUdBLEtBQUMsQ0FBQSxlQUFlLENBQUMsa0NBQWpCLENBQW9ELGFBQXBEO1VBUGE7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWY7UUFTQSxJQUFHLFFBQVEsQ0FBQyxHQUFULENBQWEsd0NBQWIsQ0FBSDtpQkFDRSxJQUFDLENBQUEsUUFBUSxDQUFDLGVBQVYsQ0FBQSxFQURGO1NBWkY7T0FBQSxNQUFBO1FBZ0JFLElBQXFDLElBQUMsQ0FBQSxlQUFELENBQUEsQ0FBckM7VUFBQSxJQUFDLENBQUEsOEJBQUQsQ0FBQSxFQUFBOztRQUNBLElBQUMsQ0FBQSxzQkFBRCxDQUF3QixNQUF4QjtRQUNBLElBQW1CLElBQUMsQ0FBQSxlQUFELENBQUEsQ0FBbkI7VUFBQSxJQUFDLENBQUEsWUFBRCxDQUFBLEVBQUE7O1FBQ0EsSUFBQyxDQUFBLHlCQUFELENBQUE7O1VBRUEsSUFBQyxDQUFBOztRQUVELElBQUcsSUFBQyxDQUFBLGlCQUFELENBQUEsQ0FBQSxHQUF1QixDQUExQjtVQUNFLElBQUMsQ0FBQSxjQUFELDRHQUErRCxHQURqRTs7UUFHQSxJQUFDLENBQUEsc0JBQUQsQ0FBd0IsUUFBeEI7UUFDQSxTQUFBLEdBQVksSUFBQyxDQUFBLE1BQU0sQ0FBQyxpQ0FBUixDQUFBLENBQTRDLENBQUEsQ0FBQTtRQUN4RCxJQUFDLENBQUEsaUNBQUQsR0FBcUMsU0FBUyxDQUFDLGlCQUFWLENBQUE7ZUFDckMsSUFBQyxDQUFBLFFBQVEsQ0FBQyxRQUFWLENBQW1CLFFBQW5CLEVBQTZCLElBQUMsQ0FBQSxZQUE5QixFQTdCRjs7SUFETzs7OztLQTNFc0I7O0VBMkczQjs7Ozs7OztJQUNKLG1CQUFDLENBQUEsTUFBRCxDQUFBOztrQ0FDQSxZQUFBLEdBQWM7O2tDQUVkLFlBQUEsR0FBYyxTQUFDLFNBQUQsRUFBWSxJQUFaO0FBQ1osVUFBQTtBQUFBLFdBQUEsc0NBQUE7O2NBQXVCLElBQUEsS0FBVTs7O1FBQy9CLElBQVMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxhQUFqQixDQUFBLENBQVQ7QUFBQSxnQkFBQTs7UUFDQSxTQUFTLENBQUMsV0FBVixDQUFBO0FBRkY7YUFHQSxTQUFTLENBQUMsVUFBVixDQUFxQixJQUFyQixFQUEyQjtRQUFBLFVBQUEsRUFBWSxLQUFaO09BQTNCO0lBSlk7Ozs7S0FKa0I7O0VBVTVCOzs7Ozs7O0lBQ0osV0FBQyxDQUFBLE1BQUQsQ0FBQTs7MEJBQ0EsT0FBQSxHQUFTLFNBQUE7QUFDUCxVQUFBO0FBQUE7QUFBQSxXQUFBLHNDQUFBOztRQUFBLGVBQUEsQ0FBZ0IsTUFBaEI7QUFBQTthQUNBLDBDQUFBLFNBQUE7SUFGTzs7OztLQUZlOztFQU9wQjs7Ozs7OztJQUNKLHVCQUFDLENBQUEsTUFBRCxDQUFBOztzQ0FDQSxPQUFBLEdBQVMsU0FBQTtNQUNQLElBQUcsSUFBQyxDQUFBLE1BQUQsQ0FBUSxRQUFSLEVBQWtCLENBQUMsZUFBRCxFQUFrQixVQUFsQixDQUFsQixDQUFIO1FBQ0UsSUFBQyxDQUFBLE1BQU0sQ0FBQyx3QkFBUixDQUFBLEVBREY7O01BRUEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxxQkFBUixDQUFBO2FBQ0Esc0RBQUEsU0FBQTtJQUpPOzs7O0tBRjJCOztFQVNoQzs7Ozs7OztJQUNKLG9CQUFDLENBQUEsTUFBRCxDQUFBOzttQ0FDQSxPQUFBLEdBQVMsU0FBQTtNQUNQLElBQUMsQ0FBQSxNQUFNLENBQUMsZUFBUixDQUFBO2FBQ0EsbURBQUEsU0FBQTtJQUZPOzs7O0tBRndCOztFQU83Qjs7Ozs7OztJQUNKLDRCQUFDLENBQUEsTUFBRCxDQUFBOzsyQ0FDQSxPQUFBLEdBQVMsU0FBQTtNQUNQLElBQUMsQ0FBQSxNQUFNLENBQUMscUJBQVIsQ0FBQTtNQUNBLElBQUMsQ0FBQSxNQUFNLENBQUMsMEJBQVIsQ0FBQTthQUNBLDJEQUFBLFNBQUE7SUFITzs7OztLQUZnQzs7RUFPckM7Ozs7Ozs7SUFDSixrQkFBQyxDQUFBLE1BQUQsQ0FBQTs7aUNBQ0EsT0FBQSxHQUFTLFNBQUE7QUFDUCxVQUFBO01BQUEsSUFBRyxDQUFDLEtBQUEsR0FBUSxJQUFDLENBQUEsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFmLENBQW1CLEdBQW5CLENBQVQsQ0FBSDtRQUNFLElBQUMsQ0FBQSxNQUFNLENBQUMsdUJBQVIsQ0FBZ0MsS0FBaEM7UUFDQSxJQUFDLENBQUEsTUFBTSxDQUFDLHNCQUFSLENBQStCO1VBQUMsTUFBQSxFQUFRLElBQVQ7U0FBL0IsRUFGRjs7YUFHQSxpREFBQSxTQUFBO0lBSk87Ozs7S0FGc0I7O0VBUTNCOzs7Ozs7O0lBQ0osc0JBQUMsQ0FBQSxNQUFELENBQUE7O3FDQUlBLGlDQUFBLEdBQW1DLFNBQUE7QUFDakMsVUFBQTtNQUFBLFVBQUEsR0FBYSxJQUFDLENBQUEsTUFBTSxDQUFDLGFBQVIsQ0FBQTtNQUNiLGNBQUEsR0FBaUIsVUFBVSxDQUFDLGlCQUFYLENBQUE7TUFDakIsVUFBVSxDQUFDLGlCQUFYLENBQTZCLElBQUMsQ0FBQSxRQUFRLENBQUMsaUNBQVYsQ0FBQSxDQUE3QjtNQUVBLCtFQUFBLFNBQUE7YUFFQSxVQUFVLENBQUMsaUJBQVgsQ0FBNkIsY0FBN0I7SUFQaUM7O3FDQVNuQyxVQUFBLEdBQVksU0FBQTthQUNWLElBQUMsQ0FBQSxNQUFNLENBQUMsa0JBQVIsQ0FBQTtJQURVOztxQ0FHWixZQUFBLEdBQWMsU0FBQyxTQUFELEVBQVksSUFBWjthQUNaLFNBQVMsQ0FBQyxVQUFWLENBQXFCLElBQUksQ0FBQyxRQUFMLENBQUEsQ0FBckIsRUFBc0M7UUFBQSxVQUFBLEVBQVksSUFBWjtPQUF0QztJQURZOzs7O0tBakJxQjs7RUFvQi9COzs7Ozs7O0lBQ0osc0JBQUMsQ0FBQSxNQUFELENBQUE7O3FDQUNBLFVBQUEsR0FBWSxTQUFBO2FBQ1YsSUFBQyxDQUFBLE1BQU0sQ0FBQyxrQkFBUixDQUFBO0lBRFU7Ozs7S0FGdUI7O0VBTy9COzs7Ozs7O0lBQ0osY0FBQyxDQUFBLE1BQUQsQ0FBUSxLQUFSOzs2QkFDQSxhQUFBLEdBQWU7OzZCQUNmLEtBQUEsR0FBTzs7NkJBRVAsVUFBQSxHQUFZLFNBQUE7TUFNVixJQUFDLENBQUEsUUFBRCxDQUFBO2FBQ0EsZ0RBQUEsU0FBQTtJQVBVOzs2QkFTWixPQUFBLEdBQVMsU0FBQTtNQUNQLElBQUMsQ0FBQSxpQkFBRCxDQUFtQixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7QUFDakIsY0FBQTtVQUFBLElBQXNCLEtBQUMsQ0FBQSxRQUFRLENBQUMsTUFBVixDQUFpQixRQUFqQixDQUF0QjtZQUFBLEtBQUMsQ0FBQSxlQUFELENBQUEsRUFBQTs7QUFDQTtBQUFBO2VBQUEsc0NBQUE7O3lCQUNFLEtBQUEsQ0FBTSxTQUFOLENBQWdCLENBQUMsbUJBQWpCLENBQXFDLEtBQUMsQ0FBQSxLQUF0QztBQURGOztRQUZpQjtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbkI7YUFJQSw2Q0FBQSxTQUFBO0lBTE87OzZCQU9ULGVBQUEsR0FBaUIsU0FBQTtBQUNmLFVBQUE7QUFBQSxjQUFPLElBQUMsQ0FBQSxRQUFRLENBQUMsT0FBakI7QUFBQSxhQUNPLGVBRFA7VUFHSSxJQUFDLENBQUEsUUFBUSxDQUFDLGVBQVYsQ0FBQTtpQkFDQSxJQUFDLENBQUEsUUFBUSxDQUFDLHdCQUFWLENBQUE7QUFKSixhQU1PLFVBTlA7VUFPSSxJQUFDLENBQUEsTUFBTSxDQUFDLHdCQUFSLENBQUE7VUFDQSxVQUFBLEdBQ0ssSUFBQyxDQUFBLEtBQUQsS0FBVSxPQUFiLEdBQ0UsZ0NBREYsR0FFUSxJQUFDLENBQUEsS0FBRCxLQUFVLEtBQWIsR0FDSCwwQkFERyxHQUFBO0FBR1A7QUFBQTtlQUFBLHNDQUFBOzt5QkFDRSxLQUFBLENBQU0sU0FBTixDQUFpQixDQUFBLFVBQUEsQ0FBakIsQ0FBQTtBQURGOztBQWRKO0lBRGU7Ozs7S0FyQlU7O0VBd0N2Qjs7Ozs7OztJQUNKLHFCQUFDLENBQUEsTUFBRCxDQUFBOztvQ0FDQSxLQUFBLEdBQU87Ozs7S0FGMkI7O0VBSzlCOzs7Ozs7O0lBQ0osbUJBQUMsQ0FBQSxNQUFELENBQUE7O2tDQUNBLEtBQUEsR0FBTzs7OztLQUZ5Qjs7RUFJNUI7Ozs7Ozs7SUFDSix5QkFBQyxDQUFBLE1BQUQsQ0FBQTs7d0NBQ0EsS0FBQSxHQUFPOzt3Q0FDUCxVQUFBLEdBQVk7Ozs7S0FIMEI7O0VBS2xDOzs7Ozs7O0lBQ0osdUJBQUMsQ0FBQSxNQUFELENBQUE7O3NDQUNBLEtBQUEsR0FBTzs7c0NBQ1AsVUFBQSxHQUFZOzs7O0tBSHdCOztFQUtoQzs7Ozs7OztJQUNKLHdCQUFDLENBQUEsTUFBRCxDQUFBOzt1Q0FDQSxLQUFBLEdBQU87O3VDQUNQLE1BQUEsR0FBUTs7OztLQUg2Qjs7RUFLakM7Ozs7Ozs7SUFDSixzQkFBQyxDQUFBLE1BQUQsQ0FBQTs7cUNBQ0EsS0FBQSxHQUFPOztxQ0FDUCxNQUFBLEdBQVE7Ozs7S0FIMkI7O0VBSy9COzs7Ozs7O0lBQ0oseUJBQUMsQ0FBQSxNQUFELENBQUE7O0lBQ0EseUJBQUMsQ0FBQSxXQUFELEdBQWM7O3dDQUNkLEtBQUEsR0FBTzs7d0NBQ1AsTUFBQSxHQUFROzs7O0tBSjhCOztFQU1sQzs7Ozs7OztJQUNKLHFCQUFDLENBQUEsTUFBRCxDQUFBOztJQUNBLHFCQUFDLENBQUEsV0FBRCxHQUFjOztvQ0FDZCxLQUFBLEdBQU87O29DQUNQLE1BQUEsR0FBUTs7OztLQUowQjs7RUFPOUI7Ozs7Ozs7SUFDSixNQUFDLENBQUEsTUFBRCxDQUFBOztxQkFDQSxhQUFBLEdBQWU7O3FCQUNmLFdBQUEsR0FBYTs7cUJBQ2IscUJBQUEsR0FBdUI7O3FCQUV2QixVQUFBLEdBQVksU0FBQTtBQU1WLFVBQUE7TUFBQSxnQkFBQSxHQUFtQixLQUFLLENBQUMsdUJBQU4sQ0FBOEIsSUFBQyxDQUFBLE1BQS9CLENBQUEsS0FBMEM7QUFDN0Q7QUFBQTtXQUFBLHNDQUFBOztRQUNFLElBQUMsQ0FBQSw2QkFBRCxDQUErQixTQUEvQjtRQUNBLElBQUcsZ0JBQUg7VUFDRSxTQUFTLENBQUMsVUFBVixDQUFxQixJQUFyQixFQUEyQjtZQUFBLFVBQUEsRUFBWSxJQUFaO1dBQTNCO3VCQUNBLFNBQVMsQ0FBQyxNQUFNLENBQUMsUUFBakIsQ0FBQSxHQUZGO1NBQUEsTUFBQTt1QkFJRSxTQUFTLENBQUMsVUFBVixDQUFxQixFQUFyQixFQUF5QjtZQUFBLFVBQUEsRUFBWSxJQUFaO1dBQXpCLEdBSkY7O0FBRkY7O0lBUFU7Ozs7S0FOTzs7RUFxQmY7Ozs7Ozs7SUFDSixnQkFBQyxDQUFBLE1BQUQsQ0FBQTs7SUFDQSxnQkFBQyxDQUFBLFdBQUQsR0FBYzs7K0JBQ2QsVUFBQSxHQUFZOzs7O0tBSGlCOztFQUt6Qjs7Ozs7OztJQUNKLFVBQUMsQ0FBQSxNQUFELENBQUE7O3lCQUNBLE1BQUEsR0FBUTs7OztLQUZlOztFQUluQjs7Ozs7OztJQUNKLGNBQUMsQ0FBQSxNQUFELENBQUE7OzZCQUNBLElBQUEsR0FBTTs7NkJBQ04sTUFBQSxHQUFROzs7O0tBSG1COztFQU12Qjs7Ozs7OztJQUNKLFVBQUMsQ0FBQSxNQUFELENBQUE7Ozs7S0FEdUI7O0VBR25COzs7Ozs7O0lBQ0osMkJBQUMsQ0FBQSxNQUFELENBQUE7OzBDQUNBLE1BQUEsR0FBUTs7MENBRVIsVUFBQSxHQUFZLFNBQUE7TUFDVixJQUFHLElBQUMsQ0FBQSxNQUFELENBQVEsUUFBUixFQUFrQixXQUFsQixDQUFIO1FBR0UsSUFBQyxDQUFBLHNCQUFELEdBQTBCO1FBQzFCLEtBQUssQ0FBQyxnQkFBTixDQUF1QixJQUFDLENBQUEsTUFBeEIsRUFBZ0MsS0FBaEMsRUFKRjs7YUFLQSw2REFBQSxTQUFBO0lBTlU7Ozs7S0FKNEI7QUEvVDFDIiwic291cmNlc0NvbnRlbnQiOlsiXyA9IHJlcXVpcmUgJ3VuZGVyc2NvcmUtcGx1cydcbntSYW5nZX0gPSByZXF1aXJlICdhdG9tJ1xuXG57XG4gIG1vdmVDdXJzb3JMZWZ0XG4gIG1vdmVDdXJzb3JSaWdodFxuICBsaW1pdE51bWJlclxufSA9IHJlcXVpcmUgJy4vdXRpbHMnXG5zd3JhcCA9IHJlcXVpcmUgJy4vc2VsZWN0aW9uLXdyYXBwZXInXG5zZXR0aW5ncyA9IHJlcXVpcmUgJy4vc2V0dGluZ3MnXG5PcGVyYXRvciA9IHJlcXVpcmUoJy4vYmFzZScpLmdldENsYXNzKCdPcGVyYXRvcicpXG5cbiMgSW5zZXJ0IGVudGVyaW5nIG9wZXJhdGlvblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIFtOT1RFXVxuIyBSdWxlOiBEb24ndCBtYWtlIGFueSB0ZXh0IG11dGF0aW9uIGJlZm9yZSBjYWxsaW5nIGBAc2VsZWN0VGFyZ2V0KClgLlxuY2xhc3MgQWN0aXZhdGVJbnNlcnRNb2RlIGV4dGVuZHMgT3BlcmF0b3JcbiAgQGV4dGVuZCgpXG4gIHJlcXVpcmVUYXJnZXQ6IGZhbHNlXG4gIGZsYXNoVGFyZ2V0OiBmYWxzZVxuICBmaW5hbFN1Ym1vZGU6IG51bGxcbiAgc3VwcG9ydEluc2VydGlvbkNvdW50OiB0cnVlXG4gIGZsYXNoQ2hlY2twb2ludDogJ2N1c3RvbSdcblxuICBvYnNlcnZlV2lsbERlYWN0aXZhdGVNb2RlOiAtPlxuICAgIGRpc3Bvc2FibGUgPSBAdmltU3RhdGUubW9kZU1hbmFnZXIucHJlZW1wdFdpbGxEZWFjdGl2YXRlTW9kZSAoe21vZGV9KSA9PlxuICAgICAgcmV0dXJuIHVubGVzcyBtb2RlIGlzICdpbnNlcnQnXG4gICAgICBkaXNwb3NhYmxlLmRpc3Bvc2UoKVxuXG4gICAgICBAdmltU3RhdGUubWFyay5zZXQoJ14nLCBAZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCkpICMgTGFzdCBpbnNlcnQtbW9kZSBwb3NpdGlvblxuICAgICAgdGV4dEJ5VXNlcklucHV0ID0gJydcbiAgICAgIGlmIGNoYW5nZSA9IEBnZXRDaGFuZ2VTaW5jZUNoZWNrcG9pbnQoJ2luc2VydCcpXG4gICAgICAgIEBsYXN0Q2hhbmdlID0gY2hhbmdlXG4gICAgICAgIGNoYW5nZWRSYW5nZSA9IG5ldyBSYW5nZShjaGFuZ2Uuc3RhcnQsIGNoYW5nZS5zdGFydC50cmF2ZXJzZShjaGFuZ2UubmV3RXh0ZW50KSlcbiAgICAgICAgQHZpbVN0YXRlLm1hcmsuc2V0UmFuZ2UoJ1snLCAnXScsIGNoYW5nZWRSYW5nZSlcbiAgICAgICAgdGV4dEJ5VXNlcklucHV0ID0gY2hhbmdlLm5ld1RleHRcbiAgICAgIEB2aW1TdGF0ZS5yZWdpc3Rlci5zZXQoJy4nLCB0ZXh0OiB0ZXh0QnlVc2VySW5wdXQpICMgTGFzdCBpbnNlcnRlZCB0ZXh0XG5cbiAgICAgIF8udGltZXMgQGdldEluc2VydGlvbkNvdW50KCksID0+XG4gICAgICAgIHRleHQgPSBAdGV4dEJ5T3BlcmF0b3IgKyB0ZXh0QnlVc2VySW5wdXRcbiAgICAgICAgZm9yIHNlbGVjdGlvbiBpbiBAZWRpdG9yLmdldFNlbGVjdGlvbnMoKVxuICAgICAgICAgIHNlbGVjdGlvbi5pbnNlcnRUZXh0KHRleHQsIGF1dG9JbmRlbnQ6IHRydWUpXG5cbiAgICAgICMgVGhpcyBjdXJzb3Igc3RhdGUgaXMgcmVzdG9yZWQgb24gdW5kby5cbiAgICAgICMgU28gY3Vyc29yIHN0YXRlIGhhcyB0byBiZSB1cGRhdGVkIGJlZm9yZSBuZXh0IGdyb3VwQ2hhbmdlc1NpbmNlQ2hlY2twb2ludCgpXG4gICAgICBpZiBzZXR0aW5ncy5nZXQoJ2NsZWFyTXVsdGlwbGVDdXJzb3JzT25Fc2NhcGVJbnNlcnRNb2RlJylcbiAgICAgICAgQHZpbVN0YXRlLmNsZWFyU2VsZWN0aW9ucygpXG5cbiAgICAgICMgZ3JvdXBpbmcgY2hhbmdlcyBmb3IgdW5kbyBjaGVja3BvaW50IG5lZWQgdG8gY29tZSBsYXN0XG4gICAgICBpZiBzZXR0aW5ncy5nZXQoJ2dyb3VwQ2hhbmdlc1doZW5MZWF2aW5nSW5zZXJ0TW9kZScpXG4gICAgICAgIEBncm91cENoYW5nZXNTaW5jZUJ1ZmZlckNoZWNrcG9pbnQoJ3VuZG8nKVxuXG4gICMgV2hlbiBlYWNoIG11dGFpb24ncyBleHRlbnQgaXMgbm90IGludGVyc2VjdGluZywgbXVpdGlwbGUgY2hhbmdlcyBhcmUgcmVjb3JkZWRcbiAgIyBlLmdcbiAgIyAgLSBNdWx0aWN1cnNvcnMgZWRpdFxuICAjICAtIEN1cnNvciBtb3ZlZCBpbiBpbnNlcnQtbW9kZShlLmcgY3RybC1mLCBjdHJsLWIpXG4gICMgQnV0IEkgZG9uJ3QgY2FyZSBtdWx0aXBsZSBjaGFuZ2VzIGp1c3QgYmVjYXVzZSBJJ20gbGF6eShzbyBub3QgcGVyZmVjdCBpbXBsZW1lbnRhdGlvbikuXG4gICMgSSBvbmx5IHRha2UgY2FyZSBvZiBvbmUgY2hhbmdlIGhhcHBlbmVkIGF0IGVhcmxpZXN0KHRvcEN1cnNvcidzIGNoYW5nZSkgcG9zaXRpb24uXG4gICMgVGhhdHMnIHdoeSBJIHNhdmUgdG9wQ3Vyc29yJ3MgcG9zaXRpb24gdG8gQHRvcEN1cnNvclBvc2l0aW9uQXRJbnNlcnRpb25TdGFydCB0byBjb21wYXJlIHRyYXZlcnNhbCB0byBkZWxldGlvblN0YXJ0XG4gICMgV2h5IEkgdXNlIHRvcEN1cnNvcidzIGNoYW5nZT8gSnVzdCBiZWNhdXNlIGl0J3MgZWFzeSB0byB1c2UgZmlyc3QgY2hhbmdlIHJldHVybmVkIGJ5IGdldENoYW5nZVNpbmNlQ2hlY2twb2ludCgpLlxuICBnZXRDaGFuZ2VTaW5jZUNoZWNrcG9pbnQ6IChwdXJwb3NlKSAtPlxuICAgIGNoZWNrcG9pbnQgPSBAZ2V0QnVmZmVyQ2hlY2twb2ludChwdXJwb3NlKVxuICAgIEBlZGl0b3IuYnVmZmVyLmdldENoYW5nZXNTaW5jZUNoZWNrcG9pbnQoY2hlY2twb2ludClbMF1cblxuICAjIFtCVUctQlVULU9LXSBSZXBsYXlpbmcgdGV4dC1kZWxldGlvbi1vcGVyYXRpb24gaXMgbm90IGNvbXBhdGlibGUgdG8gcHVyZSBWaW0uXG4gICMgUHVyZSBWaW0gcmVjb3JkIGFsbCBvcGVyYXRpb24gaW4gaW5zZXJ0LW1vZGUgYXMga2V5c3Ryb2tlIGxldmVsIGFuZCBjYW4gZGlzdGluZ3Vpc2hcbiAgIyBjaGFyYWN0ZXIgZGVsZXRlZCBieSBgRGVsZXRlYCBvciBieSBgY3RybC11YC5cbiAgIyBCdXQgSSBjYW4gbm90IGFuZCBkb24ndCB0cnlpbmcgdG8gbWluaWMgdGhpcyBsZXZlbCBvZiBjb21wYXRpYmlsaXR5LlxuICAjIFNvIGJhc2ljYWxseSBkZWxldGlvbi1kb25lLWluLW9uZSBpcyBleHBlY3RlZCB0byB3b3JrIHdlbGwuXG4gIHJlcGxheUxhc3RDaGFuZ2U6IChzZWxlY3Rpb24pIC0+XG4gICAgaWYgQGxhc3RDaGFuZ2U/XG4gICAgICB7c3RhcnQsIG5ld0V4dGVudCwgb2xkRXh0ZW50LCBuZXdUZXh0fSA9IEBsYXN0Q2hhbmdlXG4gICAgICB1bmxlc3Mgb2xkRXh0ZW50LmlzWmVybygpXG4gICAgICAgIHRyYXZlcnNhbFRvU3RhcnRPZkRlbGV0ZSA9IHN0YXJ0LnRyYXZlcnNhbEZyb20oQHRvcEN1cnNvclBvc2l0aW9uQXRJbnNlcnRpb25TdGFydClcbiAgICAgICAgZGVsZXRpb25TdGFydCA9IHNlbGVjdGlvbi5jdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKS50cmF2ZXJzZSh0cmF2ZXJzYWxUb1N0YXJ0T2ZEZWxldGUpXG4gICAgICAgIGRlbGV0aW9uRW5kID0gZGVsZXRpb25TdGFydC50cmF2ZXJzZShvbGRFeHRlbnQpXG4gICAgICAgIHNlbGVjdGlvbi5zZXRCdWZmZXJSYW5nZShbZGVsZXRpb25TdGFydCwgZGVsZXRpb25FbmRdKVxuICAgIGVsc2VcbiAgICAgIG5ld1RleHQgPSAnJ1xuICAgIHNlbGVjdGlvbi5pbnNlcnRUZXh0KG5ld1RleHQsIGF1dG9JbmRlbnQ6IHRydWUpXG5cbiAgIyBjYWxsZWQgd2hlbiByZXBlYXRlZFxuICAjIFtGSVhNRV0gdG8gdXNlIHJlcGxheUxhc3RDaGFuZ2UgaW4gcmVwZWF0SW5zZXJ0IG92ZXJyaWRpbmcgc3ViY2xhc3NzLlxuICByZXBlYXRJbnNlcnQ6IChzZWxlY3Rpb24sIHRleHQpIC0+XG4gICAgQHJlcGxheUxhc3RDaGFuZ2Uoc2VsZWN0aW9uKVxuXG4gIGdldEluc2VydGlvbkNvdW50OiAtPlxuICAgIEBpbnNlcnRpb25Db3VudCA/PSBpZiBAc3VwcG9ydEluc2VydGlvbkNvdW50IHRoZW4gQGdldENvdW50KC0xKSBlbHNlIDBcbiAgICAjIEF2b2lkIGZyZWV6aW5nIGJ5IGFjY2NpZGVudGFsIGJpZyBjb3VudChlLmcuIGA1NTU1NTU1NTU1NTU1aWApLCBTZWUgIzU2MCwgIzU5NlxuICAgIGxpbWl0TnVtYmVyKEBpbnNlcnRpb25Db3VudCwgbWF4OiAxMDApXG5cbiAgZXhlY3V0ZTogLT5cbiAgICBpZiBAaXNSZXBlYXRlZCgpXG4gICAgICBAZmxhc2hUYXJnZXQgPSBAdHJhY2tDaGFuZ2UgPSB0cnVlXG5cbiAgICAgIEBzdGFydE11dGF0aW9uID0+XG4gICAgICAgIEBzZWxlY3RUYXJnZXQoKSBpZiBAaXNSZXF1aXJlVGFyZ2V0KClcbiAgICAgICAgQG11dGF0ZVRleHQ/KClcbiAgICAgICAgbXV0YXRlZFJhbmdlcyA9IFtdXG4gICAgICAgIGZvciBzZWxlY3Rpb24gaW4gQGVkaXRvci5nZXRTZWxlY3Rpb25zKClcbiAgICAgICAgICBtdXRhdGVkUmFuZ2VzLnB1c2goQHJlcGVhdEluc2VydChzZWxlY3Rpb24sIEBsYXN0Q2hhbmdlPy5uZXdUZXh0ID8gJycpKVxuICAgICAgICAgIG1vdmVDdXJzb3JMZWZ0KHNlbGVjdGlvbi5jdXJzb3IpXG4gICAgICAgIEBtdXRhdGlvbk1hbmFnZXIuc2V0QnVmZmVyUmFuZ2VzRm9yQ3VzdG9tQ2hlY2twb2ludChtdXRhdGVkUmFuZ2VzKVxuXG4gICAgICBpZiBzZXR0aW5ncy5nZXQoJ2NsZWFyTXVsdGlwbGVDdXJzb3JzT25Fc2NhcGVJbnNlcnRNb2RlJylcbiAgICAgICAgQHZpbVN0YXRlLmNsZWFyU2VsZWN0aW9ucygpXG5cbiAgICBlbHNlXG4gICAgICBAbm9ybWFsaXplU2VsZWN0aW9uc0lmTmVjZXNzYXJ5KCkgaWYgQGlzUmVxdWlyZVRhcmdldCgpXG4gICAgICBAY3JlYXRlQnVmZmVyQ2hlY2twb2ludCgndW5kbycpXG4gICAgICBAc2VsZWN0VGFyZ2V0KCkgaWYgQGlzUmVxdWlyZVRhcmdldCgpXG4gICAgICBAb2JzZXJ2ZVdpbGxEZWFjdGl2YXRlTW9kZSgpXG5cbiAgICAgIEBtdXRhdGVUZXh0PygpXG5cbiAgICAgIGlmIEBnZXRJbnNlcnRpb25Db3VudCgpID4gMFxuICAgICAgICBAdGV4dEJ5T3BlcmF0b3IgPSBAZ2V0Q2hhbmdlU2luY2VDaGVja3BvaW50KCd1bmRvJyk/Lm5ld1RleHQgPyAnJ1xuXG4gICAgICBAY3JlYXRlQnVmZmVyQ2hlY2twb2ludCgnaW5zZXJ0JylcbiAgICAgIHRvcEN1cnNvciA9IEBlZGl0b3IuZ2V0Q3Vyc29yc09yZGVyZWRCeUJ1ZmZlclBvc2l0aW9uKClbMF1cbiAgICAgIEB0b3BDdXJzb3JQb3NpdGlvbkF0SW5zZXJ0aW9uU3RhcnQgPSB0b3BDdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuICAgICAgQHZpbVN0YXRlLmFjdGl2YXRlKCdpbnNlcnQnLCBAZmluYWxTdWJtb2RlKVxuXG5jbGFzcyBBY3RpdmF0ZVJlcGxhY2VNb2RlIGV4dGVuZHMgQWN0aXZhdGVJbnNlcnRNb2RlXG4gIEBleHRlbmQoKVxuICBmaW5hbFN1Ym1vZGU6ICdyZXBsYWNlJ1xuXG4gIHJlcGVhdEluc2VydDogKHNlbGVjdGlvbiwgdGV4dCkgLT5cbiAgICBmb3IgY2hhciBpbiB0ZXh0IHdoZW4gKGNoYXIgaXNudCBcIlxcblwiKVxuICAgICAgYnJlYWsgaWYgc2VsZWN0aW9uLmN1cnNvci5pc0F0RW5kT2ZMaW5lKClcbiAgICAgIHNlbGVjdGlvbi5zZWxlY3RSaWdodCgpXG4gICAgc2VsZWN0aW9uLmluc2VydFRleHQodGV4dCwgYXV0b0luZGVudDogZmFsc2UpXG5cbmNsYXNzIEluc2VydEFmdGVyIGV4dGVuZHMgQWN0aXZhdGVJbnNlcnRNb2RlXG4gIEBleHRlbmQoKVxuICBleGVjdXRlOiAtPlxuICAgIG1vdmVDdXJzb3JSaWdodChjdXJzb3IpIGZvciBjdXJzb3IgaW4gQGVkaXRvci5nZXRDdXJzb3JzKClcbiAgICBzdXBlclxuXG4jIGtleTogJ2cgSScgaW4gYWxsIG1vZGVcbmNsYXNzIEluc2VydEF0QmVnaW5uaW5nT2ZMaW5lIGV4dGVuZHMgQWN0aXZhdGVJbnNlcnRNb2RlXG4gIEBleHRlbmQoKVxuICBleGVjdXRlOiAtPlxuICAgIGlmIEBpc01vZGUoJ3Zpc3VhbCcsIFsnY2hhcmFjdGVyd2lzZScsICdsaW5ld2lzZSddKVxuICAgICAgQGVkaXRvci5zcGxpdFNlbGVjdGlvbnNJbnRvTGluZXMoKVxuICAgIEBlZGl0b3IubW92ZVRvQmVnaW5uaW5nT2ZMaW5lKClcbiAgICBzdXBlclxuXG4jIGtleTogbm9ybWFsICdBJ1xuY2xhc3MgSW5zZXJ0QWZ0ZXJFbmRPZkxpbmUgZXh0ZW5kcyBBY3RpdmF0ZUluc2VydE1vZGVcbiAgQGV4dGVuZCgpXG4gIGV4ZWN1dGU6IC0+XG4gICAgQGVkaXRvci5tb3ZlVG9FbmRPZkxpbmUoKVxuICAgIHN1cGVyXG5cbiMga2V5OiBub3JtYWwgJ0knXG5jbGFzcyBJbnNlcnRBdEZpcnN0Q2hhcmFjdGVyT2ZMaW5lIGV4dGVuZHMgQWN0aXZhdGVJbnNlcnRNb2RlXG4gIEBleHRlbmQoKVxuICBleGVjdXRlOiAtPlxuICAgIEBlZGl0b3IubW92ZVRvQmVnaW5uaW5nT2ZMaW5lKClcbiAgICBAZWRpdG9yLm1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lKClcbiAgICBzdXBlclxuXG5jbGFzcyBJbnNlcnRBdExhc3RJbnNlcnQgZXh0ZW5kcyBBY3RpdmF0ZUluc2VydE1vZGVcbiAgQGV4dGVuZCgpXG4gIGV4ZWN1dGU6IC0+XG4gICAgaWYgKHBvaW50ID0gQHZpbVN0YXRlLm1hcmsuZ2V0KCdeJykpXG4gICAgICBAZWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKHBvaW50KVxuICAgICAgQGVkaXRvci5zY3JvbGxUb0N1cnNvclBvc2l0aW9uKHtjZW50ZXI6IHRydWV9KVxuICAgIHN1cGVyXG5cbmNsYXNzIEluc2VydEFib3ZlV2l0aE5ld2xpbmUgZXh0ZW5kcyBBY3RpdmF0ZUluc2VydE1vZGVcbiAgQGV4dGVuZCgpXG5cbiAgIyBUaGlzIGlzIGZvciBgb2AgYW5kIGBPYCBvcGVyYXRvci5cbiAgIyBPbiB1bmRvL3JlZG8gcHV0IGN1cnNvciBhdCBvcmlnaW5hbCBwb2ludCB3aGVyZSB1c2VyIHR5cGUgYG9gIG9yIGBPYC5cbiAgZ3JvdXBDaGFuZ2VzU2luY2VCdWZmZXJDaGVja3BvaW50OiAtPlxuICAgIGxhc3RDdXJzb3IgPSBAZWRpdG9yLmdldExhc3RDdXJzb3IoKVxuICAgIGN1cnNvclBvc2l0aW9uID0gbGFzdEN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXG4gICAgbGFzdEN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihAdmltU3RhdGUuZ2V0T3JpZ2luYWxDdXJzb3JQb3NpdGlvbkJ5TWFya2VyKCkpXG5cbiAgICBzdXBlclxuXG4gICAgbGFzdEN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihjdXJzb3JQb3NpdGlvbilcblxuICBtdXRhdGVUZXh0OiAtPlxuICAgIEBlZGl0b3IuaW5zZXJ0TmV3bGluZUFib3ZlKClcblxuICByZXBlYXRJbnNlcnQ6IChzZWxlY3Rpb24sIHRleHQpIC0+XG4gICAgc2VsZWN0aW9uLmluc2VydFRleHQodGV4dC50cmltTGVmdCgpLCBhdXRvSW5kZW50OiB0cnVlKVxuXG5jbGFzcyBJbnNlcnRCZWxvd1dpdGhOZXdsaW5lIGV4dGVuZHMgSW5zZXJ0QWJvdmVXaXRoTmV3bGluZVxuICBAZXh0ZW5kKClcbiAgbXV0YXRlVGV4dDogLT5cbiAgICBAZWRpdG9yLmluc2VydE5ld2xpbmVCZWxvdygpXG5cbiMgQWR2YW5jZWQgSW5zZXJ0aW9uXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIEluc2VydEJ5VGFyZ2V0IGV4dGVuZHMgQWN0aXZhdGVJbnNlcnRNb2RlXG4gIEBleHRlbmQoZmFsc2UpXG4gIHJlcXVpcmVUYXJnZXQ6IHRydWVcbiAgd2hpY2g6IG51bGwgIyBvbmUgb2YgWydzdGFydCcsICdlbmQnLCAnaGVhZCcsICd0YWlsJ11cblxuICBpbml0aWFsaXplOiAtPlxuICAgICMgSEFDS1xuICAgICMgV2hlbiBnIGkgaXMgbWFwcGVkIHRvIGBpbnNlcnQtYXQtc3RhcnQtb2YtdGFyZ2V0YC5cbiAgICAjIGBnIGkgMyBsYCBzdGFydCBpbnNlcnQgYXQgMyBjb2x1bW4gcmlnaHQgcG9zaXRpb24uXG4gICAgIyBJbiB0aGlzIGNhc2UsIHdlIGRvbid0IHdhbnQgcmVwZWF0IGluc2VydGlvbiAzIHRpbWVzLlxuICAgICMgVGhpcyBAZ2V0Q291bnQoKSBjYWxsIGNhY2hlIG51bWJlciBhdCB0aGUgdGltaW5nIEJFRk9SRSAnMycgaXMgc3BlY2lmaWVkLlxuICAgIEBnZXRDb3VudCgpXG4gICAgc3VwZXJcblxuICBleGVjdXRlOiAtPlxuICAgIEBvbkRpZFNlbGVjdFRhcmdldCA9PlxuICAgICAgQG1vZGlmeVNlbGVjdGlvbigpIGlmIEB2aW1TdGF0ZS5pc01vZGUoJ3Zpc3VhbCcpXG4gICAgICBmb3Igc2VsZWN0aW9uIGluIEBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpXG4gICAgICAgIHN3cmFwKHNlbGVjdGlvbikuc2V0QnVmZmVyUG9zaXRpb25UbyhAd2hpY2gpXG4gICAgc3VwZXJcblxuICBtb2RpZnlTZWxlY3Rpb246IC0+XG4gICAgc3dpdGNoIEB2aW1TdGF0ZS5zdWJtb2RlXG4gICAgICB3aGVuICdjaGFyYWN0ZXJ3aXNlJ1xuICAgICAgICAjIGBJKG9yIEEpYCBpcyBzaG9ydC1oYW5kIG9mIGBjdHJsLXYgSShvciBBKWBcbiAgICAgICAgQHZpbVN0YXRlLnNlbGVjdEJsb2Nrd2lzZSgpXG4gICAgICAgIEB2aW1TdGF0ZS5jbGVhckJsb2Nrd2lzZVNlbGVjdGlvbnMoKSAjIGp1c3QgcmVzZXQgdmltU3RhdGUncyBzdG9yYWdlLlxuXG4gICAgICB3aGVuICdsaW5ld2lzZSdcbiAgICAgICAgQGVkaXRvci5zcGxpdFNlbGVjdGlvbnNJbnRvTGluZXMoKVxuICAgICAgICBtZXRob2ROYW1lID1cbiAgICAgICAgICBpZiBAd2hpY2ggaXMgJ3N0YXJ0J1xuICAgICAgICAgICAgJ3NldFN0YXJ0VG9GaXJzdENoYXJhY3Rlck9mTGluZSdcbiAgICAgICAgICBlbHNlIGlmIEB3aGljaCBpcyAnZW5kJ1xuICAgICAgICAgICAgJ3Nocmlua0VuZFRvQmVmb3JlTmV3TGluZSdcblxuICAgICAgICBmb3Igc2VsZWN0aW9uIGluIEBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpXG4gICAgICAgICAgc3dyYXAoc2VsZWN0aW9uKVttZXRob2ROYW1lXSgpXG5cbiMga2V5OiAnSScsIFVzZWQgaW4gJ3Zpc3VhbC1tb2RlLmNoYXJhY3Rlcndpc2UnLCB2aXN1YWwtbW9kZS5ibG9ja3dpc2VcbmNsYXNzIEluc2VydEF0U3RhcnRPZlRhcmdldCBleHRlbmRzIEluc2VydEJ5VGFyZ2V0XG4gIEBleHRlbmQoKVxuICB3aGljaDogJ3N0YXJ0J1xuXG4jIGtleTogJ0EnLCBVc2VkIGluICd2aXN1YWwtbW9kZS5jaGFyYWN0ZXJ3aXNlJywgJ3Zpc3VhbC1tb2RlLmJsb2Nrd2lzZSdcbmNsYXNzIEluc2VydEF0RW5kT2ZUYXJnZXQgZXh0ZW5kcyBJbnNlcnRCeVRhcmdldFxuICBAZXh0ZW5kKClcbiAgd2hpY2g6ICdlbmQnXG5cbmNsYXNzIEluc2VydEF0U3RhcnRPZk9jY3VycmVuY2UgZXh0ZW5kcyBJbnNlcnRCeVRhcmdldFxuICBAZXh0ZW5kKClcbiAgd2hpY2g6ICdzdGFydCdcbiAgb2NjdXJyZW5jZTogdHJ1ZVxuXG5jbGFzcyBJbnNlcnRBdEVuZE9mT2NjdXJyZW5jZSBleHRlbmRzIEluc2VydEJ5VGFyZ2V0XG4gIEBleHRlbmQoKVxuICB3aGljaDogJ2VuZCdcbiAgb2NjdXJyZW5jZTogdHJ1ZVxuXG5jbGFzcyBJbnNlcnRBdFN0YXJ0T2ZTbWFydFdvcmQgZXh0ZW5kcyBJbnNlcnRCeVRhcmdldFxuICBAZXh0ZW5kKClcbiAgd2hpY2g6ICdzdGFydCdcbiAgdGFyZ2V0OiBcIk1vdmVUb1ByZXZpb3VzU21hcnRXb3JkXCJcblxuY2xhc3MgSW5zZXJ0QXRFbmRPZlNtYXJ0V29yZCBleHRlbmRzIEluc2VydEJ5VGFyZ2V0XG4gIEBleHRlbmQoKVxuICB3aGljaDogJ2VuZCdcbiAgdGFyZ2V0OiBcIk1vdmVUb0VuZE9mU21hcnRXb3JkXCJcblxuY2xhc3MgSW5zZXJ0QXRQcmV2aW91c0ZvbGRTdGFydCBleHRlbmRzIEluc2VydEJ5VGFyZ2V0XG4gIEBleHRlbmQoKVxuICBAZGVzY3JpcHRpb246IFwiTW92ZSB0byBwcmV2aW91cyBmb2xkIHN0YXJ0IHRoZW4gZW50ZXIgaW5zZXJ0LW1vZGVcIlxuICB3aGljaDogJ3N0YXJ0J1xuICB0YXJnZXQ6ICdNb3ZlVG9QcmV2aW91c0ZvbGRTdGFydCdcblxuY2xhc3MgSW5zZXJ0QXROZXh0Rm9sZFN0YXJ0IGV4dGVuZHMgSW5zZXJ0QnlUYXJnZXRcbiAgQGV4dGVuZCgpXG4gIEBkZXNjcmlwdGlvbjogXCJNb3ZlIHRvIG5leHQgZm9sZCBzdGFydCB0aGVuIGVudGVyIGluc2VydC1tb2RlXCJcbiAgd2hpY2g6ICdlbmQnXG4gIHRhcmdldDogJ01vdmVUb05leHRGb2xkU3RhcnQnXG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgQ2hhbmdlIGV4dGVuZHMgQWN0aXZhdGVJbnNlcnRNb2RlXG4gIEBleHRlbmQoKVxuICByZXF1aXJlVGFyZ2V0OiB0cnVlXG4gIHRyYWNrQ2hhbmdlOiB0cnVlXG4gIHN1cHBvcnRJbnNlcnRpb25Db3VudDogZmFsc2VcblxuICBtdXRhdGVUZXh0OiAtPlxuICAgICMgQWxsd2F5cyBkeW5hbWljYWxseSBkZXRlcm1pbmUgc2VsZWN0aW9uIHdpc2Ugd3Rob3V0IGNvbnN1bHRpbmcgdGFyZ2V0Lndpc2VcbiAgICAjIFJlYXNvbjogd2hlbiBgYyBpIHtgLCB3aXNlIGlzICdjaGFyYWN0ZXJ3aXNlJywgYnV0IGFjdHVhbGx5IHNlbGVjdGVkIHJhbmdlIGlzICdsaW5ld2lzZSdcbiAgICAjICAge1xuICAgICMgICAgIGFcbiAgICAjICAgfVxuICAgIGlzTGluZXdpc2VUYXJnZXQgPSBzd3JhcC5kZXRlY3RWaXN1YWxNb2RlU3VibW9kZShAZWRpdG9yKSBpcyAnbGluZXdpc2UnXG4gICAgZm9yIHNlbGVjdGlvbiBpbiBAZWRpdG9yLmdldFNlbGVjdGlvbnMoKVxuICAgICAgQHNldFRleHRUb1JlZ2lzdGVyRm9yU2VsZWN0aW9uKHNlbGVjdGlvbilcbiAgICAgIGlmIGlzTGluZXdpc2VUYXJnZXRcbiAgICAgICAgc2VsZWN0aW9uLmluc2VydFRleHQoXCJcXG5cIiwgYXV0b0luZGVudDogdHJ1ZSlcbiAgICAgICAgc2VsZWN0aW9uLmN1cnNvci5tb3ZlTGVmdCgpXG4gICAgICBlbHNlXG4gICAgICAgIHNlbGVjdGlvbi5pbnNlcnRUZXh0KCcnLCBhdXRvSW5kZW50OiB0cnVlKVxuXG5jbGFzcyBDaGFuZ2VPY2N1cnJlbmNlIGV4dGVuZHMgQ2hhbmdlXG4gIEBleHRlbmQoKVxuICBAZGVzY3JpcHRpb246IFwiQ2hhbmdlIGFsbCBtYXRjaGluZyB3b3JkIHdpdGhpbiB0YXJnZXQgcmFuZ2VcIlxuICBvY2N1cnJlbmNlOiB0cnVlXG5cbmNsYXNzIFN1YnN0aXR1dGUgZXh0ZW5kcyBDaGFuZ2VcbiAgQGV4dGVuZCgpXG4gIHRhcmdldDogJ01vdmVSaWdodCdcblxuY2xhc3MgU3Vic3RpdHV0ZUxpbmUgZXh0ZW5kcyBDaGFuZ2VcbiAgQGV4dGVuZCgpXG4gIHdpc2U6ICdsaW5ld2lzZScgIyBbRklYTUVdIHRvIHJlLW92ZXJyaWRlIHRhcmdldC53aXNlIGluIHZpc3VhbC1tb2RlXG4gIHRhcmdldDogJ01vdmVUb1JlbGF0aXZlTGluZSdcblxuIyBhbGlhc1xuY2xhc3MgQ2hhbmdlTGluZSBleHRlbmRzIFN1YnN0aXR1dGVMaW5lXG4gIEBleHRlbmQoKVxuXG5jbGFzcyBDaGFuZ2VUb0xhc3RDaGFyYWN0ZXJPZkxpbmUgZXh0ZW5kcyBDaGFuZ2VcbiAgQGV4dGVuZCgpXG4gIHRhcmdldDogJ01vdmVUb0xhc3RDaGFyYWN0ZXJPZkxpbmUnXG5cbiAgaW5pdGlhbGl6ZTogLT5cbiAgICBpZiBAaXNNb2RlKCd2aXN1YWwnLCAnYmxvY2t3aXNlJylcbiAgICAgICMgRklYTUUgTWF5YmUgYmVjYXVzZSBvZiBidWcgb2YgQ3VycmVudFNlbGVjdGlvbixcbiAgICAgICMgd2UgdXNlIE1vdmVUb0xhc3RDaGFyYWN0ZXJPZkxpbmUgYXMgdGFyZ2V0XG4gICAgICBAYWNjZXB0Q3VycmVudFNlbGVjdGlvbiA9IGZhbHNlXG4gICAgICBzd3JhcC5zZXRSZXZlcnNlZFN0YXRlKEBlZGl0b3IsIGZhbHNlKSAjIEVuc3VyZSBhbGwgc2VsZWN0aW9ucyB0byB1bi1yZXZlcnNlZFxuICAgIHN1cGVyXG4iXX0=
