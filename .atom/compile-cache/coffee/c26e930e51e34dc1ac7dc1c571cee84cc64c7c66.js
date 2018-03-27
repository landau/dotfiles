(function() {
  var ActivateInsertMode, ActivateReplaceMode, Change, ChangeLine, ChangeOccurrence, ChangeToLastCharacterOfLine, InsertAboveWithNewline, InsertAfter, InsertAfterEndOfLine, InsertAtBeginningOfLine, InsertAtEndOfOccurrence, InsertAtEndOfSmartWord, InsertAtEndOfTarget, InsertAtFirstCharacterOfLine, InsertAtLastInsert, InsertAtNextFoldStart, InsertAtPreviousFoldStart, InsertAtStartOfOccurrence, InsertAtStartOfSmartWord, InsertAtStartOfTarget, InsertBelowWithNewline, InsertByTarget, Operator, Range, Substitute, SubstituteLine, _, limitNumber, moveCursorLeft, moveCursorRight, ref, shrinkRangeEndToBeforeNewLine, swrap,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  _ = require('underscore-plus');

  Range = require('atom').Range;

  ref = require('./utils'), moveCursorLeft = ref.moveCursorLeft, moveCursorRight = ref.moveCursorRight, limitNumber = ref.limitNumber, shrinkRangeEndToBeforeNewLine = ref.shrinkRangeEndToBeforeNewLine;

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
      var end, i, len, newRange, range, ref1, ref2, results, selection, start;
      switch (this.vimState.submode) {
        case 'characterwise':
          this.vimState.selectBlockwise();
          return this.vimState.clearBlockwiseSelections();
        case 'linewise':
          this.editor.splitSelectionsIntoLines();
          ref1 = this.editor.getSelections();
          results = [];
          for (i = 0, len = ref1.length; i < len; i++) {
            selection = ref1[i];
            ref2 = range = selection.getBufferRange(), start = ref2.start, end = ref2.end;
            if (this.which === 'start') {
              newRange = [this.getFirstCharacterPositionForBufferRow(start.row), end];
            } else {
              newRange = shrinkRangeEndToBeforeNewLine(range);
            }
            results.push(selection.setBufferRange(newRange));
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvb3BlcmF0b3ItaW5zZXJ0LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEscW1CQUFBO0lBQUE7OztFQUFBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVI7O0VBQ0gsUUFBUyxPQUFBLENBQVEsTUFBUjs7RUFFVixNQUtJLE9BQUEsQ0FBUSxTQUFSLENBTEosRUFDRSxtQ0FERixFQUVFLHFDQUZGLEVBR0UsNkJBSEYsRUFJRTs7RUFFRixLQUFBLEdBQVEsT0FBQSxDQUFRLHFCQUFSOztFQUNSLFFBQUEsR0FBVyxPQUFBLENBQVEsUUFBUixDQUFpQixDQUFDLFFBQWxCLENBQTJCLFVBQTNCOztFQU1MOzs7Ozs7O0lBQ0osa0JBQUMsQ0FBQSxNQUFELENBQUE7O2lDQUNBLGFBQUEsR0FBZTs7aUNBQ2YsV0FBQSxHQUFhOztpQ0FDYixZQUFBLEdBQWM7O2lDQUNkLHFCQUFBLEdBQXVCOztpQ0FDdkIsZUFBQSxHQUFpQjs7aUNBRWpCLHlCQUFBLEdBQTJCLFNBQUE7QUFDekIsVUFBQTthQUFBLFVBQUEsR0FBYSxJQUFDLENBQUEsUUFBUSxDQUFDLFdBQVcsQ0FBQyx5QkFBdEIsQ0FBZ0QsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLEdBQUQ7QUFDM0QsY0FBQTtVQUQ2RCxPQUFEO1VBQzVELElBQWMsSUFBQSxLQUFRLFFBQXRCO0FBQUEsbUJBQUE7O1VBQ0EsVUFBVSxDQUFDLE9BQVgsQ0FBQTtVQUVBLEtBQUMsQ0FBQSxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQWYsQ0FBbUIsR0FBbkIsRUFBd0IsS0FBQyxDQUFBLE1BQU0sQ0FBQyx1QkFBUixDQUFBLENBQXhCO1VBQ0EsZUFBQSxHQUFrQjtVQUNsQixJQUFHLE1BQUEsR0FBUyxLQUFDLENBQUEsd0JBQUQsQ0FBMEIsUUFBMUIs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QyxDQUFBLHNCQUFELEdBQTBCO1FBQzFCLEtBQUssQ0FBQyxnQkFBTixDQUF1QixJQUFDLENBQUEsTUFBeEIsRUFBZ0MsS0FBaEMsRUFKRjs7YUFLQSw2REFBQSxTQUFBO0lBTlU7Ozs7S0FKNEI7QUEvVDFDIiwic291cmNlc0NvbnRlbnQiOlsiXyA9IHJlcXVpcmUgJ3VuZGVyc2NvcmUtcGx1cydcbntSYW5nZX0gPSByZXF1aXJlICdhdG9tJ1xuXG57XG4gIG1vdmVDdXJzb3JMZWZ0XG4gIG1vdmVDdXJzb3JSaWdodFxuICBsaW1pdE51bWJlclxuICBzaHJpbmtSYW5nZUVuZFRvQmVmb3JlTmV3TGluZVxufSA9IHJlcXVpcmUgJy4vdXRpbHMnXG5zd3JhcCA9IHJlcXVpcmUgJy4vc2VsZWN0aW9uLXdyYXBwZXInXG5PcGVyYXRvciA9IHJlcXVpcmUoJy4vYmFzZScpLmdldENsYXNzKCdPcGVyYXRvcicpXG5cbiMgSW5zZXJ0IGVudGVyaW5nIG9wZXJhdGlvblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIFtOT1RFXVxuIyBSdWxlOiBEb24ndCBtYWtlIGFueSB0ZXh0IG11dGF0aW9uIGJlZm9yZSBjYWxsaW5nIGBAc2VsZWN0VGFyZ2V0KClgLlxuY2xhc3MgQWN0aXZhdGVJbnNlcnRNb2RlIGV4dGVuZHMgT3BlcmF0b3JcbiAgQGV4dGVuZCgpXG4gIHJlcXVpcmVUYXJnZXQ6IGZhbHNlXG4gIGZsYXNoVGFyZ2V0OiBmYWxzZVxuICBmaW5hbFN1Ym1vZGU6IG51bGxcbiAgc3VwcG9ydEluc2VydGlvbkNvdW50OiB0cnVlXG4gIGZsYXNoQ2hlY2twb2ludDogJ2N1c3RvbSdcblxuICBvYnNlcnZlV2lsbERlYWN0aXZhdGVNb2RlOiAtPlxuICAgIGRpc3Bvc2FibGUgPSBAdmltU3RhdGUubW9kZU1hbmFnZXIucHJlZW1wdFdpbGxEZWFjdGl2YXRlTW9kZSAoe21vZGV9KSA9PlxuICAgICAgcmV0dXJuIHVubGVzcyBtb2RlIGlzICdpbnNlcnQnXG4gICAgICBkaXNwb3NhYmxlLmRpc3Bvc2UoKVxuXG4gICAgICBAdmltU3RhdGUubWFyay5zZXQoJ14nLCBAZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCkpICMgTGFzdCBpbnNlcnQtbW9kZSBwb3NpdGlvblxuICAgICAgdGV4dEJ5VXNlcklucHV0ID0gJydcbiAgICAgIGlmIGNoYW5nZSA9IEBnZXRDaGFuZ2VTaW5jZUNoZWNrcG9pbnQoJ2luc2VydCcpXG4gICAgICAgIEBsYXN0Q2hhbmdlID0gY2hhbmdlXG4gICAgICAgIGNoYW5nZWRSYW5nZSA9IG5ldyBSYW5nZShjaGFuZ2Uuc3RhcnQsIGNoYW5nZS5zdGFydC50cmF2ZXJzZShjaGFuZ2UubmV3RXh0ZW50KSlcbiAgICAgICAgQHZpbVN0YXRlLm1hcmsuc2V0UmFuZ2UoJ1snLCAnXScsIGNoYW5nZWRSYW5nZSlcbiAgICAgICAgdGV4dEJ5VXNlcklucHV0ID0gY2hhbmdlLm5ld1RleHRcbiAgICAgIEB2aW1TdGF0ZS5yZWdpc3Rlci5zZXQoJy4nLCB0ZXh0OiB0ZXh0QnlVc2VySW5wdXQpICMgTGFzdCBpbnNlcnRlZCB0ZXh0XG5cbiAgICAgIF8udGltZXMgQGdldEluc2VydGlvbkNvdW50KCksID0+XG4gICAgICAgIHRleHQgPSBAdGV4dEJ5T3BlcmF0b3IgKyB0ZXh0QnlVc2VySW5wdXRcbiAgICAgICAgZm9yIHNlbGVjdGlvbiBpbiBAZWRpdG9yLmdldFNlbGVjdGlvbnMoKVxuICAgICAgICAgIHNlbGVjdGlvbi5pbnNlcnRUZXh0KHRleHQsIGF1dG9JbmRlbnQ6IHRydWUpXG5cbiAgICAgICMgVGhpcyBjdXJzb3Igc3RhdGUgaXMgcmVzdG9yZWQgb24gdW5kby5cbiAgICAgICMgU28gY3Vyc29yIHN0YXRlIGhhcyB0byBiZSB1cGRhdGVkIGJlZm9yZSBuZXh0IGdyb3VwQ2hhbmdlc1NpbmNlQ2hlY2twb2ludCgpXG4gICAgICBpZiBAZ2V0Q29uZmlnKCdjbGVhck11bHRpcGxlQ3Vyc29yc09uRXNjYXBlSW5zZXJ0TW9kZScpXG4gICAgICAgIEB2aW1TdGF0ZS5jbGVhclNlbGVjdGlvbnMoKVxuXG4gICAgICAjIGdyb3VwaW5nIGNoYW5nZXMgZm9yIHVuZG8gY2hlY2twb2ludCBuZWVkIHRvIGNvbWUgbGFzdFxuICAgICAgaWYgQGdldENvbmZpZygnZ3JvdXBDaGFuZ2VzV2hlbkxlYXZpbmdJbnNlcnRNb2RlJylcbiAgICAgICAgQGdyb3VwQ2hhbmdlc1NpbmNlQnVmZmVyQ2hlY2twb2ludCgndW5kbycpXG5cbiAgIyBXaGVuIGVhY2ggbXV0YWlvbidzIGV4dGVudCBpcyBub3QgaW50ZXJzZWN0aW5nLCBtdWl0aXBsZSBjaGFuZ2VzIGFyZSByZWNvcmRlZFxuICAjIGUuZ1xuICAjICAtIE11bHRpY3Vyc29ycyBlZGl0XG4gICMgIC0gQ3Vyc29yIG1vdmVkIGluIGluc2VydC1tb2RlKGUuZyBjdHJsLWYsIGN0cmwtYilcbiAgIyBCdXQgSSBkb24ndCBjYXJlIG11bHRpcGxlIGNoYW5nZXMganVzdCBiZWNhdXNlIEknbSBsYXp5KHNvIG5vdCBwZXJmZWN0IGltcGxlbWVudGF0aW9uKS5cbiAgIyBJIG9ubHkgdGFrZSBjYXJlIG9mIG9uZSBjaGFuZ2UgaGFwcGVuZWQgYXQgZWFybGllc3QodG9wQ3Vyc29yJ3MgY2hhbmdlKSBwb3NpdGlvbi5cbiAgIyBUaGF0cycgd2h5IEkgc2F2ZSB0b3BDdXJzb3IncyBwb3NpdGlvbiB0byBAdG9wQ3Vyc29yUG9zaXRpb25BdEluc2VydGlvblN0YXJ0IHRvIGNvbXBhcmUgdHJhdmVyc2FsIHRvIGRlbGV0aW9uU3RhcnRcbiAgIyBXaHkgSSB1c2UgdG9wQ3Vyc29yJ3MgY2hhbmdlPyBKdXN0IGJlY2F1c2UgaXQncyBlYXN5IHRvIHVzZSBmaXJzdCBjaGFuZ2UgcmV0dXJuZWQgYnkgZ2V0Q2hhbmdlU2luY2VDaGVja3BvaW50KCkuXG4gIGdldENoYW5nZVNpbmNlQ2hlY2twb2ludDogKHB1cnBvc2UpIC0+XG4gICAgY2hlY2twb2ludCA9IEBnZXRCdWZmZXJDaGVja3BvaW50KHB1cnBvc2UpXG4gICAgQGVkaXRvci5idWZmZXIuZ2V0Q2hhbmdlc1NpbmNlQ2hlY2twb2ludChjaGVja3BvaW50KVswXVxuXG4gICMgW0JVRy1CVVQtT0tdIFJlcGxheWluZyB0ZXh0LWRlbGV0aW9uLW9wZXJhdGlvbiBpcyBub3QgY29tcGF0aWJsZSB0byBwdXJlIFZpbS5cbiAgIyBQdXJlIFZpbSByZWNvcmQgYWxsIG9wZXJhdGlvbiBpbiBpbnNlcnQtbW9kZSBhcyBrZXlzdHJva2UgbGV2ZWwgYW5kIGNhbiBkaXN0aW5ndWlzaFxuICAjIGNoYXJhY3RlciBkZWxldGVkIGJ5IGBEZWxldGVgIG9yIGJ5IGBjdHJsLXVgLlxuICAjIEJ1dCBJIGNhbiBub3QgYW5kIGRvbid0IHRyeWluZyB0byBtaW5pYyB0aGlzIGxldmVsIG9mIGNvbXBhdGliaWxpdHkuXG4gICMgU28gYmFzaWNhbGx5IGRlbGV0aW9uLWRvbmUtaW4tb25lIGlzIGV4cGVjdGVkIHRvIHdvcmsgd2VsbC5cbiAgcmVwbGF5TGFzdENoYW5nZTogKHNlbGVjdGlvbikgLT5cbiAgICBpZiBAbGFzdENoYW5nZT9cbiAgICAgIHtzdGFydCwgbmV3RXh0ZW50LCBvbGRFeHRlbnQsIG5ld1RleHR9ID0gQGxhc3RDaGFuZ2VcbiAgICAgIHVubGVzcyBvbGRFeHRlbnQuaXNaZXJvKClcbiAgICAgICAgdHJhdmVyc2FsVG9TdGFydE9mRGVsZXRlID0gc3RhcnQudHJhdmVyc2FsRnJvbShAdG9wQ3Vyc29yUG9zaXRpb25BdEluc2VydGlvblN0YXJ0KVxuICAgICAgICBkZWxldGlvblN0YXJ0ID0gc2VsZWN0aW9uLmN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpLnRyYXZlcnNlKHRyYXZlcnNhbFRvU3RhcnRPZkRlbGV0ZSlcbiAgICAgICAgZGVsZXRpb25FbmQgPSBkZWxldGlvblN0YXJ0LnRyYXZlcnNlKG9sZEV4dGVudClcbiAgICAgICAgc2VsZWN0aW9uLnNldEJ1ZmZlclJhbmdlKFtkZWxldGlvblN0YXJ0LCBkZWxldGlvbkVuZF0pXG4gICAgZWxzZVxuICAgICAgbmV3VGV4dCA9ICcnXG4gICAgc2VsZWN0aW9uLmluc2VydFRleHQobmV3VGV4dCwgYXV0b0luZGVudDogdHJ1ZSlcblxuICAjIGNhbGxlZCB3aGVuIHJlcGVhdGVkXG4gICMgW0ZJWE1FXSB0byB1c2UgcmVwbGF5TGFzdENoYW5nZSBpbiByZXBlYXRJbnNlcnQgb3ZlcnJpZGluZyBzdWJjbGFzc3MuXG4gIHJlcGVhdEluc2VydDogKHNlbGVjdGlvbiwgdGV4dCkgLT5cbiAgICBAcmVwbGF5TGFzdENoYW5nZShzZWxlY3Rpb24pXG5cbiAgZ2V0SW5zZXJ0aW9uQ291bnQ6IC0+XG4gICAgQGluc2VydGlvbkNvdW50ID89IGlmIEBzdXBwb3J0SW5zZXJ0aW9uQ291bnQgdGhlbiBAZ2V0Q291bnQoLTEpIGVsc2UgMFxuICAgICMgQXZvaWQgZnJlZXppbmcgYnkgYWNjY2lkZW50YWwgYmlnIGNvdW50KGUuZy4gYDU1NTU1NTU1NTU1NTVpYCksIFNlZSAjNTYwLCAjNTk2XG4gICAgbGltaXROdW1iZXIoQGluc2VydGlvbkNvdW50LCBtYXg6IDEwMClcblxuICBleGVjdXRlOiAtPlxuICAgIGlmIEBpc1JlcGVhdGVkKClcbiAgICAgIEBmbGFzaFRhcmdldCA9IEB0cmFja0NoYW5nZSA9IHRydWVcblxuICAgICAgQHN0YXJ0TXV0YXRpb24gPT5cbiAgICAgICAgQHNlbGVjdFRhcmdldCgpIGlmIEBpc1JlcXVpcmVUYXJnZXQoKVxuICAgICAgICBAbXV0YXRlVGV4dD8oKVxuICAgICAgICBtdXRhdGVkUmFuZ2VzID0gW11cbiAgICAgICAgZm9yIHNlbGVjdGlvbiBpbiBAZWRpdG9yLmdldFNlbGVjdGlvbnMoKVxuICAgICAgICAgIG11dGF0ZWRSYW5nZXMucHVzaChAcmVwZWF0SW5zZXJ0KHNlbGVjdGlvbiwgQGxhc3RDaGFuZ2U/Lm5ld1RleHQgPyAnJykpXG4gICAgICAgICAgbW92ZUN1cnNvckxlZnQoc2VsZWN0aW9uLmN1cnNvcilcbiAgICAgICAgQG11dGF0aW9uTWFuYWdlci5zZXRCdWZmZXJSYW5nZXNGb3JDdXN0b21DaGVja3BvaW50KG11dGF0ZWRSYW5nZXMpXG5cbiAgICAgIGlmIEBnZXRDb25maWcoJ2NsZWFyTXVsdGlwbGVDdXJzb3JzT25Fc2NhcGVJbnNlcnRNb2RlJylcbiAgICAgICAgQHZpbVN0YXRlLmNsZWFyU2VsZWN0aW9ucygpXG5cbiAgICBlbHNlXG4gICAgICBAbm9ybWFsaXplU2VsZWN0aW9uc0lmTmVjZXNzYXJ5KCkgaWYgQGlzUmVxdWlyZVRhcmdldCgpXG4gICAgICBAY3JlYXRlQnVmZmVyQ2hlY2twb2ludCgndW5kbycpXG4gICAgICBAc2VsZWN0VGFyZ2V0KCkgaWYgQGlzUmVxdWlyZVRhcmdldCgpXG4gICAgICBAb2JzZXJ2ZVdpbGxEZWFjdGl2YXRlTW9kZSgpXG5cbiAgICAgIEBtdXRhdGVUZXh0PygpXG5cbiAgICAgIGlmIEBnZXRJbnNlcnRpb25Db3VudCgpID4gMFxuICAgICAgICBAdGV4dEJ5T3BlcmF0b3IgPSBAZ2V0Q2hhbmdlU2luY2VDaGVja3BvaW50KCd1bmRvJyk/Lm5ld1RleHQgPyAnJ1xuXG4gICAgICBAY3JlYXRlQnVmZmVyQ2hlY2twb2ludCgnaW5zZXJ0JylcbiAgICAgIHRvcEN1cnNvciA9IEBlZGl0b3IuZ2V0Q3Vyc29yc09yZGVyZWRCeUJ1ZmZlclBvc2l0aW9uKClbMF1cbiAgICAgIEB0b3BDdXJzb3JQb3NpdGlvbkF0SW5zZXJ0aW9uU3RhcnQgPSB0b3BDdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuICAgICAgQHZpbVN0YXRlLmFjdGl2YXRlKCdpbnNlcnQnLCBAZmluYWxTdWJtb2RlKVxuXG5jbGFzcyBBY3RpdmF0ZVJlcGxhY2VNb2RlIGV4dGVuZHMgQWN0aXZhdGVJbnNlcnRNb2RlXG4gIEBleHRlbmQoKVxuICBmaW5hbFN1Ym1vZGU6ICdyZXBsYWNlJ1xuXG4gIHJlcGVhdEluc2VydDogKHNlbGVjdGlvbiwgdGV4dCkgLT5cbiAgICBmb3IgY2hhciBpbiB0ZXh0IHdoZW4gKGNoYXIgaXNudCBcIlxcblwiKVxuICAgICAgYnJlYWsgaWYgc2VsZWN0aW9uLmN1cnNvci5pc0F0RW5kT2ZMaW5lKClcbiAgICAgIHNlbGVjdGlvbi5zZWxlY3RSaWdodCgpXG4gICAgc2VsZWN0aW9uLmluc2VydFRleHQodGV4dCwgYXV0b0luZGVudDogZmFsc2UpXG5cbmNsYXNzIEluc2VydEFmdGVyIGV4dGVuZHMgQWN0aXZhdGVJbnNlcnRNb2RlXG4gIEBleHRlbmQoKVxuICBleGVjdXRlOiAtPlxuICAgIG1vdmVDdXJzb3JSaWdodChjdXJzb3IpIGZvciBjdXJzb3IgaW4gQGVkaXRvci5nZXRDdXJzb3JzKClcbiAgICBzdXBlclxuXG4jIGtleTogJ2cgSScgaW4gYWxsIG1vZGVcbmNsYXNzIEluc2VydEF0QmVnaW5uaW5nT2ZMaW5lIGV4dGVuZHMgQWN0aXZhdGVJbnNlcnRNb2RlXG4gIEBleHRlbmQoKVxuICBleGVjdXRlOiAtPlxuICAgIGlmIEBpc01vZGUoJ3Zpc3VhbCcsIFsnY2hhcmFjdGVyd2lzZScsICdsaW5ld2lzZSddKVxuICAgICAgQGVkaXRvci5zcGxpdFNlbGVjdGlvbnNJbnRvTGluZXMoKVxuICAgIEBlZGl0b3IubW92ZVRvQmVnaW5uaW5nT2ZMaW5lKClcbiAgICBzdXBlclxuXG4jIGtleTogbm9ybWFsICdBJ1xuY2xhc3MgSW5zZXJ0QWZ0ZXJFbmRPZkxpbmUgZXh0ZW5kcyBBY3RpdmF0ZUluc2VydE1vZGVcbiAgQGV4dGVuZCgpXG4gIGV4ZWN1dGU6IC0+XG4gICAgQGVkaXRvci5tb3ZlVG9FbmRPZkxpbmUoKVxuICAgIHN1cGVyXG5cbiMga2V5OiBub3JtYWwgJ0knXG5jbGFzcyBJbnNlcnRBdEZpcnN0Q2hhcmFjdGVyT2ZMaW5lIGV4dGVuZHMgQWN0aXZhdGVJbnNlcnRNb2RlXG4gIEBleHRlbmQoKVxuICBleGVjdXRlOiAtPlxuICAgIEBlZGl0b3IubW92ZVRvQmVnaW5uaW5nT2ZMaW5lKClcbiAgICBAZWRpdG9yLm1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lKClcbiAgICBzdXBlclxuXG5jbGFzcyBJbnNlcnRBdExhc3RJbnNlcnQgZXh0ZW5kcyBBY3RpdmF0ZUluc2VydE1vZGVcbiAgQGV4dGVuZCgpXG4gIGV4ZWN1dGU6IC0+XG4gICAgaWYgKHBvaW50ID0gQHZpbVN0YXRlLm1hcmsuZ2V0KCdeJykpXG4gICAgICBAZWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKHBvaW50KVxuICAgICAgQGVkaXRvci5zY3JvbGxUb0N1cnNvclBvc2l0aW9uKHtjZW50ZXI6IHRydWV9KVxuICAgIHN1cGVyXG5cbmNsYXNzIEluc2VydEFib3ZlV2l0aE5ld2xpbmUgZXh0ZW5kcyBBY3RpdmF0ZUluc2VydE1vZGVcbiAgQGV4dGVuZCgpXG5cbiAgIyBUaGlzIGlzIGZvciBgb2AgYW5kIGBPYCBvcGVyYXRvci5cbiAgIyBPbiB1bmRvL3JlZG8gcHV0IGN1cnNvciBhdCBvcmlnaW5hbCBwb2ludCB3aGVyZSB1c2VyIHR5cGUgYG9gIG9yIGBPYC5cbiAgZ3JvdXBDaGFuZ2VzU2luY2VCdWZmZXJDaGVja3BvaW50OiAtPlxuICAgIGxhc3RDdXJzb3IgPSBAZWRpdG9yLmdldExhc3RDdXJzb3IoKVxuICAgIGN1cnNvclBvc2l0aW9uID0gbGFzdEN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXG4gICAgbGFzdEN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihAdmltU3RhdGUuZ2V0T3JpZ2luYWxDdXJzb3JQb3NpdGlvbkJ5TWFya2VyKCkpXG5cbiAgICBzdXBlclxuXG4gICAgbGFzdEN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihjdXJzb3JQb3NpdGlvbilcblxuICBtdXRhdGVUZXh0OiAtPlxuICAgIEBlZGl0b3IuaW5zZXJ0TmV3bGluZUFib3ZlKClcblxuICByZXBlYXRJbnNlcnQ6IChzZWxlY3Rpb24sIHRleHQpIC0+XG4gICAgc2VsZWN0aW9uLmluc2VydFRleHQodGV4dC50cmltTGVmdCgpLCBhdXRvSW5kZW50OiB0cnVlKVxuXG5jbGFzcyBJbnNlcnRCZWxvd1dpdGhOZXdsaW5lIGV4dGVuZHMgSW5zZXJ0QWJvdmVXaXRoTmV3bGluZVxuICBAZXh0ZW5kKClcbiAgbXV0YXRlVGV4dDogLT5cbiAgICBAZWRpdG9yLmluc2VydE5ld2xpbmVCZWxvdygpXG5cbiMgQWR2YW5jZWQgSW5zZXJ0aW9uXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIEluc2VydEJ5VGFyZ2V0IGV4dGVuZHMgQWN0aXZhdGVJbnNlcnRNb2RlXG4gIEBleHRlbmQoZmFsc2UpXG4gIHJlcXVpcmVUYXJnZXQ6IHRydWVcbiAgd2hpY2g6IG51bGwgIyBvbmUgb2YgWydzdGFydCcsICdlbmQnLCAnaGVhZCcsICd0YWlsJ11cblxuICBpbml0aWFsaXplOiAtPlxuICAgICMgSEFDS1xuICAgICMgV2hlbiBnIGkgaXMgbWFwcGVkIHRvIGBpbnNlcnQtYXQtc3RhcnQtb2YtdGFyZ2V0YC5cbiAgICAjIGBnIGkgMyBsYCBzdGFydCBpbnNlcnQgYXQgMyBjb2x1bW4gcmlnaHQgcG9zaXRpb24uXG4gICAgIyBJbiB0aGlzIGNhc2UsIHdlIGRvbid0IHdhbnQgcmVwZWF0IGluc2VydGlvbiAzIHRpbWVzLlxuICAgICMgVGhpcyBAZ2V0Q291bnQoKSBjYWxsIGNhY2hlIG51bWJlciBhdCB0aGUgdGltaW5nIEJFRk9SRSAnMycgaXMgc3BlY2lmaWVkLlxuICAgIEBnZXRDb3VudCgpXG4gICAgc3VwZXJcblxuICBleGVjdXRlOiAtPlxuICAgIEBvbkRpZFNlbGVjdFRhcmdldCA9PlxuICAgICAgQG1vZGlmeVNlbGVjdGlvbigpIGlmIEB2aW1TdGF0ZS5pc01vZGUoJ3Zpc3VhbCcpXG4gICAgICBmb3Igc2VsZWN0aW9uIGluIEBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpXG4gICAgICAgIHN3cmFwKHNlbGVjdGlvbikuc2V0QnVmZmVyUG9zaXRpb25UbyhAd2hpY2gpXG4gICAgc3VwZXJcblxuICBtb2RpZnlTZWxlY3Rpb246IC0+XG4gICAgc3dpdGNoIEB2aW1TdGF0ZS5zdWJtb2RlXG4gICAgICB3aGVuICdjaGFyYWN0ZXJ3aXNlJ1xuICAgICAgICAjIGBJKG9yIEEpYCBpcyBzaG9ydC1oYW5kIG9mIGBjdHJsLXYgSShvciBBKWBcbiAgICAgICAgQHZpbVN0YXRlLnNlbGVjdEJsb2Nrd2lzZSgpXG4gICAgICAgIEB2aW1TdGF0ZS5jbGVhckJsb2Nrd2lzZVNlbGVjdGlvbnMoKSAjIGp1c3QgcmVzZXQgdmltU3RhdGUncyBzdG9yYWdlLlxuXG4gICAgICB3aGVuICdsaW5ld2lzZSdcbiAgICAgICAgQGVkaXRvci5zcGxpdFNlbGVjdGlvbnNJbnRvTGluZXMoKVxuICAgICAgICBmb3Igc2VsZWN0aW9uIGluIEBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpXG4gICAgICAgICAge3N0YXJ0LCBlbmR9ID0gcmFuZ2UgPSBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKVxuICAgICAgICAgIGlmIEB3aGljaCBpcyAnc3RhcnQnXG4gICAgICAgICAgICBuZXdSYW5nZSA9IFtAZ2V0Rmlyc3RDaGFyYWN0ZXJQb3NpdGlvbkZvckJ1ZmZlclJvdyhzdGFydC5yb3cpLCBlbmRdXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgbmV3UmFuZ2UgPSBzaHJpbmtSYW5nZUVuZFRvQmVmb3JlTmV3TGluZShyYW5nZSlcblxuICAgICAgICAgIHNlbGVjdGlvbi5zZXRCdWZmZXJSYW5nZShuZXdSYW5nZSlcblxuIyBrZXk6ICdJJywgVXNlZCBpbiAndmlzdWFsLW1vZGUuY2hhcmFjdGVyd2lzZScsIHZpc3VhbC1tb2RlLmJsb2Nrd2lzZVxuY2xhc3MgSW5zZXJ0QXRTdGFydE9mVGFyZ2V0IGV4dGVuZHMgSW5zZXJ0QnlUYXJnZXRcbiAgQGV4dGVuZCgpXG4gIHdoaWNoOiAnc3RhcnQnXG5cbiMga2V5OiAnQScsIFVzZWQgaW4gJ3Zpc3VhbC1tb2RlLmNoYXJhY3Rlcndpc2UnLCAndmlzdWFsLW1vZGUuYmxvY2t3aXNlJ1xuY2xhc3MgSW5zZXJ0QXRFbmRPZlRhcmdldCBleHRlbmRzIEluc2VydEJ5VGFyZ2V0XG4gIEBleHRlbmQoKVxuICB3aGljaDogJ2VuZCdcblxuY2xhc3MgSW5zZXJ0QXRTdGFydE9mT2NjdXJyZW5jZSBleHRlbmRzIEluc2VydEJ5VGFyZ2V0XG4gIEBleHRlbmQoKVxuICB3aGljaDogJ3N0YXJ0J1xuICBvY2N1cnJlbmNlOiB0cnVlXG5cbmNsYXNzIEluc2VydEF0RW5kT2ZPY2N1cnJlbmNlIGV4dGVuZHMgSW5zZXJ0QnlUYXJnZXRcbiAgQGV4dGVuZCgpXG4gIHdoaWNoOiAnZW5kJ1xuICBvY2N1cnJlbmNlOiB0cnVlXG5cbmNsYXNzIEluc2VydEF0U3RhcnRPZlNtYXJ0V29yZCBleHRlbmRzIEluc2VydEJ5VGFyZ2V0XG4gIEBleHRlbmQoKVxuICB3aGljaDogJ3N0YXJ0J1xuICB0YXJnZXQ6IFwiTW92ZVRvUHJldmlvdXNTbWFydFdvcmRcIlxuXG5jbGFzcyBJbnNlcnRBdEVuZE9mU21hcnRXb3JkIGV4dGVuZHMgSW5zZXJ0QnlUYXJnZXRcbiAgQGV4dGVuZCgpXG4gIHdoaWNoOiAnZW5kJ1xuICB0YXJnZXQ6IFwiTW92ZVRvRW5kT2ZTbWFydFdvcmRcIlxuXG5jbGFzcyBJbnNlcnRBdFByZXZpb3VzRm9sZFN0YXJ0IGV4dGVuZHMgSW5zZXJ0QnlUYXJnZXRcbiAgQGV4dGVuZCgpXG4gIEBkZXNjcmlwdGlvbjogXCJNb3ZlIHRvIHByZXZpb3VzIGZvbGQgc3RhcnQgdGhlbiBlbnRlciBpbnNlcnQtbW9kZVwiXG4gIHdoaWNoOiAnc3RhcnQnXG4gIHRhcmdldDogJ01vdmVUb1ByZXZpb3VzRm9sZFN0YXJ0J1xuXG5jbGFzcyBJbnNlcnRBdE5leHRGb2xkU3RhcnQgZXh0ZW5kcyBJbnNlcnRCeVRhcmdldFxuICBAZXh0ZW5kKClcbiAgQGRlc2NyaXB0aW9uOiBcIk1vdmUgdG8gbmV4dCBmb2xkIHN0YXJ0IHRoZW4gZW50ZXIgaW5zZXJ0LW1vZGVcIlxuICB3aGljaDogJ2VuZCdcbiAgdGFyZ2V0OiAnTW92ZVRvTmV4dEZvbGRTdGFydCdcblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBDaGFuZ2UgZXh0ZW5kcyBBY3RpdmF0ZUluc2VydE1vZGVcbiAgQGV4dGVuZCgpXG4gIHJlcXVpcmVUYXJnZXQ6IHRydWVcbiAgdHJhY2tDaGFuZ2U6IHRydWVcbiAgc3VwcG9ydEluc2VydGlvbkNvdW50OiBmYWxzZVxuXG4gIG11dGF0ZVRleHQ6IC0+XG4gICAgIyBBbGx3YXlzIGR5bmFtaWNhbGx5IGRldGVybWluZSBzZWxlY3Rpb24gd2lzZSB3dGhvdXQgY29uc3VsdGluZyB0YXJnZXQud2lzZVxuICAgICMgUmVhc29uOiB3aGVuIGBjIGkge2AsIHdpc2UgaXMgJ2NoYXJhY3Rlcndpc2UnLCBidXQgYWN0dWFsbHkgc2VsZWN0ZWQgcmFuZ2UgaXMgJ2xpbmV3aXNlJ1xuICAgICMgICB7XG4gICAgIyAgICAgYVxuICAgICMgICB9XG4gICAgaXNMaW5ld2lzZVRhcmdldCA9IHN3cmFwLmRldGVjdFdpc2UoQGVkaXRvcikgaXMgJ2xpbmV3aXNlJ1xuICAgIGZvciBzZWxlY3Rpb24gaW4gQGVkaXRvci5nZXRTZWxlY3Rpb25zKClcbiAgICAgIEBzZXRUZXh0VG9SZWdpc3RlckZvclNlbGVjdGlvbihzZWxlY3Rpb24pXG4gICAgICBpZiBpc0xpbmV3aXNlVGFyZ2V0XG4gICAgICAgIHNlbGVjdGlvbi5pbnNlcnRUZXh0KFwiXFxuXCIsIGF1dG9JbmRlbnQ6IHRydWUpXG4gICAgICAgIHNlbGVjdGlvbi5jdXJzb3IubW92ZUxlZnQoKVxuICAgICAgZWxzZVxuICAgICAgICBzZWxlY3Rpb24uaW5zZXJ0VGV4dCgnJywgYXV0b0luZGVudDogdHJ1ZSlcblxuY2xhc3MgQ2hhbmdlT2NjdXJyZW5jZSBleHRlbmRzIENoYW5nZVxuICBAZXh0ZW5kKClcbiAgQGRlc2NyaXB0aW9uOiBcIkNoYW5nZSBhbGwgbWF0Y2hpbmcgd29yZCB3aXRoaW4gdGFyZ2V0IHJhbmdlXCJcbiAgb2NjdXJyZW5jZTogdHJ1ZVxuXG5jbGFzcyBTdWJzdGl0dXRlIGV4dGVuZHMgQ2hhbmdlXG4gIEBleHRlbmQoKVxuICB0YXJnZXQ6ICdNb3ZlUmlnaHQnXG5cbmNsYXNzIFN1YnN0aXR1dGVMaW5lIGV4dGVuZHMgQ2hhbmdlXG4gIEBleHRlbmQoKVxuICB3aXNlOiAnbGluZXdpc2UnICMgW0ZJWE1FXSB0byByZS1vdmVycmlkZSB0YXJnZXQud2lzZSBpbiB2aXN1YWwtbW9kZVxuICB0YXJnZXQ6ICdNb3ZlVG9SZWxhdGl2ZUxpbmUnXG5cbiMgYWxpYXNcbmNsYXNzIENoYW5nZUxpbmUgZXh0ZW5kcyBTdWJzdGl0dXRlTGluZVxuICBAZXh0ZW5kKClcblxuY2xhc3MgQ2hhbmdlVG9MYXN0Q2hhcmFjdGVyT2ZMaW5lIGV4dGVuZHMgQ2hhbmdlXG4gIEBleHRlbmQoKVxuICB0YXJnZXQ6ICdNb3ZlVG9MYXN0Q2hhcmFjdGVyT2ZMaW5lJ1xuXG4gIGluaXRpYWxpemU6IC0+XG4gICAgaWYgQGlzTW9kZSgndmlzdWFsJywgJ2Jsb2Nrd2lzZScpXG4gICAgICAjIEZJWE1FIE1heWJlIGJlY2F1c2Ugb2YgYnVnIG9mIEN1cnJlbnRTZWxlY3Rpb24sXG4gICAgICAjIHdlIHVzZSBNb3ZlVG9MYXN0Q2hhcmFjdGVyT2ZMaW5lIGFzIHRhcmdldFxuICAgICAgQGFjY2VwdEN1cnJlbnRTZWxlY3Rpb24gPSBmYWxzZVxuICAgICAgc3dyYXAuc2V0UmV2ZXJzZWRTdGF0ZShAZWRpdG9yLCBmYWxzZSkgIyBFbnN1cmUgYWxsIHNlbGVjdGlvbnMgdG8gdW4tcmV2ZXJzZWRcbiAgICBzdXBlclxuIl19
