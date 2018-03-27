(function() {
  var AddBlankLineAbove, AddBlankLineBelow, AddPresetOccurrenceFromLastOccurrencePattern, Base, CreatePersistentSelection, Decrease, DecrementNumber, Delete, DeleteLeft, DeleteLine, DeleteRight, DeleteToLastCharacterOfLine, Increase, IncrementNumber, Operator, PutAfter, PutAfterWithAutoIndent, PutBefore, PutBeforeWithAutoIndent, Select, SelectLatestChange, SelectOccurrence, SelectPersistentSelection, SelectPreviousSelection, TogglePersistentSelection, TogglePresetOccurrence, TogglePresetSubwordOccurrence, Yank, YankLine, YankToLastCharacterOfLine, _, adjustIndentWithKeepingLayout, ensureEndsWithNewLineForBufferRow, getSubwordPatternAtBufferPosition, getWordPatternAtBufferPosition, insertTextAtBufferPosition, isEmptyRow, moveCursorToFirstCharacterAtRow, ref, setBufferRow,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  _ = require('underscore-plus');

  ref = require('./utils'), isEmptyRow = ref.isEmptyRow, getWordPatternAtBufferPosition = ref.getWordPatternAtBufferPosition, getSubwordPatternAtBufferPosition = ref.getSubwordPatternAtBufferPosition, insertTextAtBufferPosition = ref.insertTextAtBufferPosition, setBufferRow = ref.setBufferRow, moveCursorToFirstCharacterAtRow = ref.moveCursorToFirstCharacterAtRow, ensureEndsWithNewLineForBufferRow = ref.ensureEndsWithNewLineForBufferRow, adjustIndentWithKeepingLayout = ref.adjustIndentWithKeepingLayout;

  Base = require('./base');

  Operator = (function(superClass) {
    extend(Operator, superClass);

    Operator.extend(false);

    Operator.operationKind = 'operator';

    Operator.prototype.requireTarget = true;

    Operator.prototype.recordable = true;

    Operator.prototype.wise = null;

    Operator.prototype.occurrence = false;

    Operator.prototype.occurrenceType = 'base';

    Operator.prototype.flashTarget = true;

    Operator.prototype.flashCheckpoint = 'did-finish';

    Operator.prototype.flashType = 'operator';

    Operator.prototype.flashTypeForOccurrence = 'operator-occurrence';

    Operator.prototype.trackChange = false;

    Operator.prototype.patternForOccurrence = null;

    Operator.prototype.stayAtSamePosition = null;

    Operator.prototype.stayOptionName = null;

    Operator.prototype.stayByMarker = false;

    Operator.prototype.restorePositions = true;

    Operator.prototype.setToFirstCharacterOnLinewise = false;

    Operator.prototype.acceptPresetOccurrence = true;

    Operator.prototype.acceptPersistentSelection = true;

    Operator.prototype.bufferCheckpointByPurpose = null;

    Operator.prototype.mutateSelectionOrderd = false;

    Operator.prototype.supportEarlySelect = false;

    Operator.prototype.targetSelected = null;

    Operator.prototype.canEarlySelect = function() {
      return this.supportEarlySelect && !this.repeated;
    };

    Operator.prototype.resetState = function() {
      this.targetSelected = null;
      return this.occurrenceSelected = false;
    };

    Operator.prototype.createBufferCheckpoint = function(purpose) {
      if (this.bufferCheckpointByPurpose == null) {
        this.bufferCheckpointByPurpose = {};
      }
      return this.bufferCheckpointByPurpose[purpose] = this.editor.createCheckpoint();
    };

    Operator.prototype.getBufferCheckpoint = function(purpose) {
      var ref1;
      return (ref1 = this.bufferCheckpointByPurpose) != null ? ref1[purpose] : void 0;
    };

    Operator.prototype.deleteBufferCheckpoint = function(purpose) {
      if (this.bufferCheckpointByPurpose != null) {
        return delete this.bufferCheckpointByPurpose[purpose];
      }
    };

    Operator.prototype.groupChangesSinceBufferCheckpoint = function(purpose) {
      var checkpoint;
      if (checkpoint = this.getBufferCheckpoint(purpose)) {
        this.editor.groupChangesSinceCheckpoint(checkpoint);
        return this.deleteBufferCheckpoint(purpose);
      }
    };

    Operator.prototype.setMarkForChange = function(range) {
      this.vimState.mark.set('[', range.start);
      return this.vimState.mark.set(']', range.end);
    };

    Operator.prototype.needFlash = function() {
      var ref1;
      return this.flashTarget && this.getConfig('flashOnOperate') && (ref1 = this.name, indexOf.call(this.getConfig('flashOnOperateBlacklist'), ref1) < 0) && ((this.mode !== 'visual') || (this.submode !== this.target.wise));
    };

    Operator.prototype.flashIfNecessary = function(ranges) {
      if (this.needFlash()) {
        return this.vimState.flash(ranges, {
          type: this.getFlashType()
        });
      }
    };

    Operator.prototype.flashChangeIfNecessary = function() {
      if (this.needFlash()) {
        return this.onDidFinishOperation((function(_this) {
          return function() {
            var ranges;
            ranges = _this.mutationManager.getSelectedBufferRangesForCheckpoint(_this.flashCheckpoint);
            return _this.vimState.flash(ranges, {
              type: _this.getFlashType()
            });
          };
        })(this));
      }
    };

    Operator.prototype.getFlashType = function() {
      if (this.occurrenceSelected) {
        return this.flashTypeForOccurrence;
      } else {
        return this.flashType;
      }
    };

    Operator.prototype.trackChangeIfNecessary = function() {
      if (!this.trackChange) {
        return;
      }
      return this.onDidFinishOperation((function(_this) {
        return function() {
          var range;
          if (range = _this.mutationManager.getMutatedBufferRangeForSelection(_this.editor.getLastSelection())) {
            return _this.setMarkForChange(range);
          }
        };
      })(this));
    };

    function Operator() {
      var ref1, ref2;
      Operator.__super__.constructor.apply(this, arguments);
      ref1 = this.vimState, this.mutationManager = ref1.mutationManager, this.occurrenceManager = ref1.occurrenceManager, this.persistentSelection = ref1.persistentSelection;
      this.subscribeResetOccurrencePatternIfNeeded();
      this.initialize();
      this.onDidSetOperatorModifier(this.setModifier.bind(this));
      if (this.acceptPresetOccurrence && this.occurrenceManager.hasMarkers()) {
        this.occurrence = true;
      }
      if (this.occurrence && !this.occurrenceManager.hasMarkers()) {
        this.occurrenceManager.addPattern((ref2 = this.patternForOccurrence) != null ? ref2 : this.getPatternForOccurrenceType(this.occurrenceType));
      }
      if (this.selectPersistentSelectionIfNecessary()) {
        if (this.mode !== 'visual') {
          this.vimState.modeManager.activate('visual', this.swrap.detectWise(this.editor));
        }
      }
      if (this.mode === 'visual' && this.requireTarget) {
        this.target = 'CurrentSelection';
      }
      if (_.isString(this.target)) {
        this.setTarget(this["new"](this.target));
      }
    }

    Operator.prototype.subscribeResetOccurrencePatternIfNeeded = function() {
      if (this.occurrence && !this.occurrenceManager.hasMarkers()) {
        return this.onDidResetOperationStack((function(_this) {
          return function() {
            return _this.occurrenceManager.resetPatterns();
          };
        })(this));
      }
    };

    Operator.prototype.setModifier = function(options) {
      var pattern;
      if (options.wise != null) {
        this.wise = options.wise;
        return;
      }
      if (options.occurrence != null) {
        this.occurrence = options.occurrence;
        if (this.occurrence) {
          this.occurrenceType = options.occurrenceType;
          pattern = this.getPatternForOccurrenceType(this.occurrenceType);
          this.occurrenceManager.addPattern(pattern, {
            reset: true,
            occurrenceType: this.occurrenceType
          });
          return this.onDidResetOperationStack((function(_this) {
            return function() {
              return _this.occurrenceManager.resetPatterns();
            };
          })(this));
        }
      }
    };

    Operator.prototype.selectPersistentSelectionIfNecessary = function() {
      var $selection, i, len, ref1;
      if (this.acceptPersistentSelection && this.getConfig('autoSelectPersistentSelectionOnOperate') && !this.persistentSelection.isEmpty()) {
        this.persistentSelection.select();
        this.editor.mergeIntersectingSelections();
        ref1 = this.swrap.getSelections(this.editor);
        for (i = 0, len = ref1.length; i < len; i++) {
          $selection = ref1[i];
          if (!$selection.hasProperties()) {
            $selection.saveProperties();
          }
        }
        return true;
      } else {
        return false;
      }
    };

    Operator.prototype.getPatternForOccurrenceType = function(occurrenceType) {
      switch (occurrenceType) {
        case 'base':
          return getWordPatternAtBufferPosition(this.editor, this.getCursorBufferPosition());
        case 'subword':
          return getSubwordPatternAtBufferPosition(this.editor, this.getCursorBufferPosition());
      }
    };

    Operator.prototype.setTarget = function(target) {
      this.target = target;
      this.target.operator = this;
      this.emitDidSetTarget(this);
      if (this.canEarlySelect()) {
        this.normalizeSelectionsIfNecessary();
        this.createBufferCheckpoint('undo');
        this.selectTarget();
      }
      return this;
    };

    Operator.prototype.setTextToRegisterForSelection = function(selection) {
      return this.setTextToRegister(selection.getText(), selection);
    };

    Operator.prototype.setTextToRegister = function(text, selection) {
      if (this.target.isLinewise() && (!text.endsWith('\n'))) {
        text += "\n";
      }
      if (text) {
        return this.vimState.register.set(null, {
          text: text,
          selection: selection
        });
      }
    };

    Operator.prototype.normalizeSelectionsIfNecessary = function() {
      var ref1;
      if (((ref1 = this.target) != null ? ref1.isMotion() : void 0) && (this.mode === 'visual')) {
        return this.swrap.normalize(this.editor);
      }
    };

    Operator.prototype.startMutation = function(fn) {
      if (this.canEarlySelect()) {
        fn();
        this.emitWillFinishMutation();
        this.groupChangesSinceBufferCheckpoint('undo');
      } else {
        this.normalizeSelectionsIfNecessary();
        this.editor.transact((function(_this) {
          return function() {
            fn();
            return _this.emitWillFinishMutation();
          };
        })(this));
      }
      return this.emitDidFinishMutation();
    };

    Operator.prototype.execute = function() {
      this.startMutation((function(_this) {
        return function() {
          var i, len, selection, selections;
          if (_this.selectTarget()) {
            if (_this.mutateSelectionOrderd) {
              selections = _this.editor.getSelectionsOrderedByBufferPosition();
            } else {
              selections = _this.editor.getSelections();
            }
            for (i = 0, len = selections.length; i < len; i++) {
              selection = selections[i];
              _this.mutateSelection(selection);
            }
            _this.mutationManager.setCheckpoint('did-finish');
            return _this.restoreCursorPositionsIfNecessary();
          }
        };
      })(this));
      return this.activateMode('normal');
    };

    Operator.prototype.selectTarget = function() {
      if (this.targetSelected != null) {
        return this.targetSelected;
      }
      this.mutationManager.init({
        stayByMarker: this.stayByMarker
      });
      if (this.wise != null) {
        this.target.forceWise(this.wise);
      }
      this.emitWillSelectTarget();
      this.mutationManager.setCheckpoint('will-select');
      if (this.repeated && this.occurrence && !this.occurrenceManager.hasMarkers()) {
        this.occurrenceManager.addPattern(this.patternForOccurrence, {
          occurrenceType: this.occurrenceType
        });
      }
      this.target.execute();
      this.mutationManager.setCheckpoint('did-select');
      if (this.occurrence) {
        if (this.patternForOccurrence == null) {
          this.patternForOccurrence = this.occurrenceManager.buildPattern();
        }
        if (this.occurrenceManager.select()) {
          this.occurrenceSelected = true;
          this.mutationManager.setCheckpoint('did-select-occurrence');
        }
      }
      if (this.targetSelected = this.vimState.haveSomeNonEmptySelection() || this.target.name === "Empty") {
        this.emitDidSelectTarget();
        this.flashChangeIfNecessary();
        this.trackChangeIfNecessary();
      } else {
        this.emitDidFailSelectTarget();
      }
      return this.targetSelected;
    };

    Operator.prototype.restoreCursorPositionsIfNecessary = function() {
      var ref1, stay, wise;
      if (!this.restorePositions) {
        return;
      }
      stay = ((ref1 = this.stayAtSamePosition) != null ? ref1 : this.getConfig(this.stayOptionName)) || (this.occurrenceSelected && this.getConfig('stayOnOccurrence'));
      wise = this.occurrenceSelected ? 'characterwise' : this.target.wise;
      return this.mutationManager.restoreCursorPositions({
        stay: stay,
        wise: wise,
        setToFirstCharacterOnLinewise: this.setToFirstCharacterOnLinewise
      });
    };

    return Operator;

  })(Base);

  Select = (function(superClass) {
    extend(Select, superClass);

    function Select() {
      return Select.__super__.constructor.apply(this, arguments);
    }

    Select.extend(false);

    Select.prototype.flashTarget = false;

    Select.prototype.recordable = false;

    Select.prototype.acceptPresetOccurrence = false;

    Select.prototype.acceptPersistentSelection = false;

    Select.prototype.execute = function() {
      this.startMutation(this.selectTarget.bind(this));
      if (this.target.isTextObject() && this.target.selectSucceeded) {
        this.editor.scrollToCursorPosition();
        return this.activateModeIfNecessary('visual', this.target.wise);
      }
    };

    return Select;

  })(Operator);

  SelectLatestChange = (function(superClass) {
    extend(SelectLatestChange, superClass);

    function SelectLatestChange() {
      return SelectLatestChange.__super__.constructor.apply(this, arguments);
    }

    SelectLatestChange.extend();

    SelectLatestChange.description = "Select latest yanked or changed range";

    SelectLatestChange.prototype.target = 'ALatestChange';

    return SelectLatestChange;

  })(Select);

  SelectPreviousSelection = (function(superClass) {
    extend(SelectPreviousSelection, superClass);

    function SelectPreviousSelection() {
      return SelectPreviousSelection.__super__.constructor.apply(this, arguments);
    }

    SelectPreviousSelection.extend();

    SelectPreviousSelection.prototype.target = "PreviousSelection";

    return SelectPreviousSelection;

  })(Select);

  SelectPersistentSelection = (function(superClass) {
    extend(SelectPersistentSelection, superClass);

    function SelectPersistentSelection() {
      return SelectPersistentSelection.__super__.constructor.apply(this, arguments);
    }

    SelectPersistentSelection.extend();

    SelectPersistentSelection.description = "Select persistent-selection and clear all persistent-selection, it's like convert to real-selection";

    SelectPersistentSelection.prototype.target = "APersistentSelection";

    return SelectPersistentSelection;

  })(Select);

  SelectOccurrence = (function(superClass) {
    extend(SelectOccurrence, superClass);

    function SelectOccurrence() {
      return SelectOccurrence.__super__.constructor.apply(this, arguments);
    }

    SelectOccurrence.extend();

    SelectOccurrence.description = "Add selection onto each matching word within target range";

    SelectOccurrence.prototype.occurrence = true;

    SelectOccurrence.prototype.execute = function() {
      return this.startMutation((function(_this) {
        return function() {
          if (_this.selectTarget()) {
            return _this.activateModeIfNecessary('visual', 'characterwise');
          }
        };
      })(this));
    };

    return SelectOccurrence;

  })(Operator);

  CreatePersistentSelection = (function(superClass) {
    extend(CreatePersistentSelection, superClass);

    function CreatePersistentSelection() {
      return CreatePersistentSelection.__super__.constructor.apply(this, arguments);
    }

    CreatePersistentSelection.extend();

    CreatePersistentSelection.prototype.flashTarget = false;

    CreatePersistentSelection.prototype.stayAtSamePosition = true;

    CreatePersistentSelection.prototype.acceptPresetOccurrence = false;

    CreatePersistentSelection.prototype.acceptPersistentSelection = false;

    CreatePersistentSelection.prototype.mutateSelection = function(selection) {
      return this.persistentSelection.markBufferRange(selection.getBufferRange());
    };

    return CreatePersistentSelection;

  })(Operator);

  TogglePersistentSelection = (function(superClass) {
    extend(TogglePersistentSelection, superClass);

    function TogglePersistentSelection() {
      return TogglePersistentSelection.__super__.constructor.apply(this, arguments);
    }

    TogglePersistentSelection.extend();

    TogglePersistentSelection.prototype.isComplete = function() {
      var point;
      point = this.editor.getCursorBufferPosition();
      this.markerToRemove = this.persistentSelection.getMarkerAtPoint(point);
      if (this.markerToRemove) {
        return true;
      } else {
        return TogglePersistentSelection.__super__.isComplete.apply(this, arguments);
      }
    };

    TogglePersistentSelection.prototype.execute = function() {
      if (this.markerToRemove) {
        return this.markerToRemove.destroy();
      } else {
        return TogglePersistentSelection.__super__.execute.apply(this, arguments);
      }
    };

    return TogglePersistentSelection;

  })(CreatePersistentSelection);

  TogglePresetOccurrence = (function(superClass) {
    extend(TogglePresetOccurrence, superClass);

    function TogglePresetOccurrence() {
      return TogglePresetOccurrence.__super__.constructor.apply(this, arguments);
    }

    TogglePresetOccurrence.extend();

    TogglePresetOccurrence.prototype.target = "Empty";

    TogglePresetOccurrence.prototype.flashTarget = false;

    TogglePresetOccurrence.prototype.acceptPresetOccurrence = false;

    TogglePresetOccurrence.prototype.acceptPersistentSelection = false;

    TogglePresetOccurrence.prototype.occurrenceType = 'base';

    TogglePresetOccurrence.prototype.execute = function() {
      var isNarrowed, marker, pattern;
      if (marker = this.occurrenceManager.getMarkerAtPoint(this.editor.getCursorBufferPosition())) {
        return this.occurrenceManager.destroyMarkers([marker]);
      } else {
        pattern = null;
        isNarrowed = this.vimState.modeManager.isNarrowed();
        if (this.mode === 'visual' && !isNarrowed) {
          this.occurrenceType = 'base';
          pattern = new RegExp(_.escapeRegExp(this.editor.getSelectedText()), 'g');
        } else {
          pattern = this.getPatternForOccurrenceType(this.occurrenceType);
        }
        this.occurrenceManager.addPattern(pattern, {
          occurrenceType: this.occurrenceType
        });
        this.occurrenceManager.saveLastPattern(this.occurrenceType);
        if (!isNarrowed) {
          return this.activateMode('normal');
        }
      }
    };

    return TogglePresetOccurrence;

  })(Operator);

  TogglePresetSubwordOccurrence = (function(superClass) {
    extend(TogglePresetSubwordOccurrence, superClass);

    function TogglePresetSubwordOccurrence() {
      return TogglePresetSubwordOccurrence.__super__.constructor.apply(this, arguments);
    }

    TogglePresetSubwordOccurrence.extend();

    TogglePresetSubwordOccurrence.prototype.occurrenceType = 'subword';

    return TogglePresetSubwordOccurrence;

  })(TogglePresetOccurrence);

  AddPresetOccurrenceFromLastOccurrencePattern = (function(superClass) {
    extend(AddPresetOccurrenceFromLastOccurrencePattern, superClass);

    function AddPresetOccurrenceFromLastOccurrencePattern() {
      return AddPresetOccurrenceFromLastOccurrencePattern.__super__.constructor.apply(this, arguments);
    }

    AddPresetOccurrenceFromLastOccurrencePattern.extend();

    AddPresetOccurrenceFromLastOccurrencePattern.prototype.execute = function() {
      var occurrenceType, pattern;
      this.occurrenceManager.resetPatterns();
      if (pattern = this.vimState.globalState.get('lastOccurrencePattern')) {
        occurrenceType = this.vimState.globalState.get("lastOccurrenceType");
        this.occurrenceManager.addPattern(pattern, {
          occurrenceType: occurrenceType
        });
        return this.activateMode('normal');
      }
    };

    return AddPresetOccurrenceFromLastOccurrencePattern;

  })(TogglePresetOccurrence);

  Delete = (function(superClass) {
    extend(Delete, superClass);

    function Delete() {
      this.mutateSelection = bind(this.mutateSelection, this);
      return Delete.__super__.constructor.apply(this, arguments);
    }

    Delete.extend();

    Delete.prototype.trackChange = true;

    Delete.prototype.flashCheckpoint = 'did-select-occurrence';

    Delete.prototype.flashTypeForOccurrence = 'operator-remove-occurrence';

    Delete.prototype.stayOptionName = 'stayOnDelete';

    Delete.prototype.setToFirstCharacterOnLinewise = true;

    Delete.prototype.execute = function() {
      if (this.target.wise === 'blockwise') {
        this.restorePositions = false;
      }
      return Delete.__super__.execute.apply(this, arguments);
    };

    Delete.prototype.mutateSelection = function(selection) {
      this.setTextToRegisterForSelection(selection);
      return selection.deleteSelectedText();
    };

    return Delete;

  })(Operator);

  DeleteRight = (function(superClass) {
    extend(DeleteRight, superClass);

    function DeleteRight() {
      return DeleteRight.__super__.constructor.apply(this, arguments);
    }

    DeleteRight.extend();

    DeleteRight.prototype.target = 'MoveRight';

    return DeleteRight;

  })(Delete);

  DeleteLeft = (function(superClass) {
    extend(DeleteLeft, superClass);

    function DeleteLeft() {
      return DeleteLeft.__super__.constructor.apply(this, arguments);
    }

    DeleteLeft.extend();

    DeleteLeft.prototype.target = 'MoveLeft';

    return DeleteLeft;

  })(Delete);

  DeleteToLastCharacterOfLine = (function(superClass) {
    extend(DeleteToLastCharacterOfLine, superClass);

    function DeleteToLastCharacterOfLine() {
      return DeleteToLastCharacterOfLine.__super__.constructor.apply(this, arguments);
    }

    DeleteToLastCharacterOfLine.extend();

    DeleteToLastCharacterOfLine.prototype.target = 'MoveToLastCharacterOfLine';

    DeleteToLastCharacterOfLine.prototype.execute = function() {
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
      return DeleteToLastCharacterOfLine.__super__.execute.apply(this, arguments);
    };

    return DeleteToLastCharacterOfLine;

  })(Delete);

  DeleteLine = (function(superClass) {
    extend(DeleteLine, superClass);

    function DeleteLine() {
      return DeleteLine.__super__.constructor.apply(this, arguments);
    }

    DeleteLine.extend();

    DeleteLine.prototype.wise = 'linewise';

    DeleteLine.prototype.target = "MoveToRelativeLine";

    return DeleteLine;

  })(Delete);

  Yank = (function(superClass) {
    extend(Yank, superClass);

    function Yank() {
      return Yank.__super__.constructor.apply(this, arguments);
    }

    Yank.extend();

    Yank.prototype.trackChange = true;

    Yank.prototype.stayOptionName = 'stayOnYank';

    Yank.prototype.mutateSelection = function(selection) {
      return this.setTextToRegisterForSelection(selection);
    };

    return Yank;

  })(Operator);

  YankLine = (function(superClass) {
    extend(YankLine, superClass);

    function YankLine() {
      return YankLine.__super__.constructor.apply(this, arguments);
    }

    YankLine.extend();

    YankLine.prototype.wise = 'linewise';

    YankLine.prototype.target = "MoveToRelativeLine";

    return YankLine;

  })(Yank);

  YankToLastCharacterOfLine = (function(superClass) {
    extend(YankToLastCharacterOfLine, superClass);

    function YankToLastCharacterOfLine() {
      return YankToLastCharacterOfLine.__super__.constructor.apply(this, arguments);
    }

    YankToLastCharacterOfLine.extend();

    YankToLastCharacterOfLine.prototype.target = 'MoveToLastCharacterOfLine';

    return YankToLastCharacterOfLine;

  })(Yank);

  Increase = (function(superClass) {
    extend(Increase, superClass);

    function Increase() {
      return Increase.__super__.constructor.apply(this, arguments);
    }

    Increase.extend();

    Increase.prototype.target = "Empty";

    Increase.prototype.flashTarget = false;

    Increase.prototype.restorePositions = false;

    Increase.prototype.step = 1;

    Increase.prototype.execute = function() {
      var ref1;
      this.newRanges = [];
      Increase.__super__.execute.apply(this, arguments);
      if (this.newRanges.length) {
        if (this.getConfig('flashOnOperate') && (ref1 = this.name, indexOf.call(this.getConfig('flashOnOperateBlacklist'), ref1) < 0)) {
          return this.vimState.flash(this.newRanges, {
            type: this.flashTypeForOccurrence
          });
        }
      }
    };

    Increase.prototype.replaceNumberInBufferRange = function(scanRange, fn) {
      var newRanges;
      if (fn == null) {
        fn = null;
      }
      newRanges = [];
      if (this.pattern == null) {
        this.pattern = RegExp("" + (this.getConfig('numberRegex')), "g");
      }
      this.scanForward(this.pattern, {
        scanRange: scanRange
      }, (function(_this) {
        return function(event) {
          var matchText, nextNumber, replace;
          if ((fn != null) && !fn(event)) {
            return;
          }
          matchText = event.matchText, replace = event.replace;
          nextNumber = _this.getNextNumber(matchText);
          return newRanges.push(replace(String(nextNumber)));
        };
      })(this));
      return newRanges;
    };

    Increase.prototype.mutateSelection = function(selection) {
      var cursor, cursorPosition, newRanges, point, ref1, ref2, ref3, scanRange;
      cursor = selection.cursor;
      if (this.target.is('Empty')) {
        cursorPosition = cursor.getBufferPosition();
        scanRange = this.editor.bufferRangeForBufferRow(cursorPosition.row);
        newRanges = this.replaceNumberInBufferRange(scanRange, function(arg) {
          var range, stop;
          range = arg.range, stop = arg.stop;
          if (range.end.isGreaterThan(cursorPosition)) {
            stop();
            return true;
          } else {
            return false;
          }
        });
        point = (ref1 = (ref2 = newRanges[0]) != null ? ref2.end.translate([0, -1]) : void 0) != null ? ref1 : cursorPosition;
        return cursor.setBufferPosition(point);
      } else {
        scanRange = selection.getBufferRange();
        (ref3 = this.newRanges).push.apply(ref3, this.replaceNumberInBufferRange(scanRange));
        return cursor.setBufferPosition(scanRange.start);
      }
    };

    Increase.prototype.getNextNumber = function(numberString) {
      return Number.parseInt(numberString, 10) + this.step * this.getCount();
    };

    return Increase;

  })(Operator);

  Decrease = (function(superClass) {
    extend(Decrease, superClass);

    function Decrease() {
      return Decrease.__super__.constructor.apply(this, arguments);
    }

    Decrease.extend();

    Decrease.prototype.step = -1;

    return Decrease;

  })(Increase);

  IncrementNumber = (function(superClass) {
    extend(IncrementNumber, superClass);

    function IncrementNumber() {
      return IncrementNumber.__super__.constructor.apply(this, arguments);
    }

    IncrementNumber.extend();

    IncrementNumber.prototype.baseNumber = null;

    IncrementNumber.prototype.target = null;

    IncrementNumber.prototype.mutateSelectionOrderd = true;

    IncrementNumber.prototype.getNextNumber = function(numberString) {
      if (this.baseNumber != null) {
        this.baseNumber += this.step * this.getCount();
      } else {
        this.baseNumber = Number.parseInt(numberString, 10);
      }
      return this.baseNumber;
    };

    return IncrementNumber;

  })(Increase);

  DecrementNumber = (function(superClass) {
    extend(DecrementNumber, superClass);

    function DecrementNumber() {
      return DecrementNumber.__super__.constructor.apply(this, arguments);
    }

    DecrementNumber.extend();

    DecrementNumber.prototype.step = -1;

    return DecrementNumber;

  })(IncrementNumber);

  PutBefore = (function(superClass) {
    extend(PutBefore, superClass);

    function PutBefore() {
      return PutBefore.__super__.constructor.apply(this, arguments);
    }

    PutBefore.extend();

    PutBefore.prototype.location = 'before';

    PutBefore.prototype.target = 'Empty';

    PutBefore.prototype.flashType = 'operator-long';

    PutBefore.prototype.restorePositions = false;

    PutBefore.prototype.flashTarget = true;

    PutBefore.prototype.trackChange = false;

    PutBefore.prototype.execute = function() {
      var ref1, text, type;
      this.mutationsBySelection = new Map();
      ref1 = this.vimState.register.get(null, this.editor.getLastSelection()), text = ref1.text, type = ref1.type;
      if (!text) {
        return;
      }
      this.onDidFinishMutation(this.adjustCursorPosition.bind(this));
      this.onDidFinishOperation((function(_this) {
        return function() {
          var newRange, ref2, toRange;
          if (newRange = _this.mutationsBySelection.get(_this.editor.getLastSelection())) {
            _this.setMarkForChange(newRange);
          }
          if (_this.getConfig('flashOnOperate') && (ref2 = _this.name, indexOf.call(_this.getConfig('flashOnOperateBlacklist'), ref2) < 0)) {
            toRange = function(selection) {
              return _this.mutationsBySelection.get(selection);
            };
            return _this.vimState.flash(_this.editor.getSelections().map(toRange), {
              type: _this.getFlashType()
            });
          }
        };
      })(this));
      return PutBefore.__super__.execute.apply(this, arguments);
    };

    PutBefore.prototype.adjustCursorPosition = function() {
      var cursor, end, i, len, newRange, ref1, ref2, results, selection, start;
      ref1 = this.editor.getSelections();
      results = [];
      for (i = 0, len = ref1.length; i < len; i++) {
        selection = ref1[i];
        if (!(this.mutationsBySelection.has(selection))) {
          continue;
        }
        cursor = selection.cursor;
        ref2 = newRange = this.mutationsBySelection.get(selection), start = ref2.start, end = ref2.end;
        if (this.linewisePaste) {
          results.push(moveCursorToFirstCharacterAtRow(cursor, start.row));
        } else {
          if (newRange.isSingleLine()) {
            results.push(cursor.setBufferPosition(end.translate([0, -1])));
          } else {
            results.push(cursor.setBufferPosition(start));
          }
        }
      }
      return results;
    };

    PutBefore.prototype.mutateSelection = function(selection) {
      var newRange, ref1, text, type;
      ref1 = this.vimState.register.get(null, selection), text = ref1.text, type = ref1.type;
      text = _.multiplyString(text, this.getCount());
      this.linewisePaste = type === 'linewise' || this.isMode('visual', 'linewise');
      newRange = this.paste(selection, text, {
        linewisePaste: this.linewisePaste
      });
      return this.mutationsBySelection.set(selection, newRange);
    };

    PutBefore.prototype.paste = function(selection, text, arg) {
      var linewisePaste;
      linewisePaste = arg.linewisePaste;
      if (linewisePaste) {
        return this.pasteLinewise(selection, text);
      } else {
        return this.pasteCharacterwise(selection, text);
      }
    };

    PutBefore.prototype.pasteCharacterwise = function(selection, text) {
      var cursor;
      cursor = selection.cursor;
      if (selection.isEmpty() && this.location === 'after' && !isEmptyRow(this.editor, cursor.getBufferRow())) {
        cursor.moveRight();
      }
      return selection.insertText(text);
    };

    PutBefore.prototype.pasteLinewise = function(selection, text) {
      var cursor, cursorRow, newRange, targetRow;
      cursor = selection.cursor;
      cursorRow = cursor.getBufferRow();
      if (!text.endsWith("\n")) {
        text += "\n";
      }
      newRange = null;
      if (selection.isEmpty()) {
        if (this.location === 'before') {
          newRange = insertTextAtBufferPosition(this.editor, [cursorRow, 0], text);
          setBufferRow(cursor, newRange.start.row);
        } else if (this.location === 'after') {
          targetRow = this.getFoldEndRowForRow(cursorRow);
          ensureEndsWithNewLineForBufferRow(this.editor, targetRow);
          newRange = insertTextAtBufferPosition(this.editor, [targetRow + 1, 0], text);
        }
      } else {
        if (!this.isMode('visual', 'linewise')) {
          selection.insertText("\n");
        }
        newRange = selection.insertText(text);
      }
      return newRange;
    };

    return PutBefore;

  })(Operator);

  PutAfter = (function(superClass) {
    extend(PutAfter, superClass);

    function PutAfter() {
      return PutAfter.__super__.constructor.apply(this, arguments);
    }

    PutAfter.extend();

    PutAfter.prototype.location = 'after';

    return PutAfter;

  })(PutBefore);

  PutBeforeWithAutoIndent = (function(superClass) {
    extend(PutBeforeWithAutoIndent, superClass);

    function PutBeforeWithAutoIndent() {
      return PutBeforeWithAutoIndent.__super__.constructor.apply(this, arguments);
    }

    PutBeforeWithAutoIndent.extend();

    PutBeforeWithAutoIndent.prototype.pasteLinewise = function(selection, text) {
      var newRange;
      newRange = PutBeforeWithAutoIndent.__super__.pasteLinewise.apply(this, arguments);
      adjustIndentWithKeepingLayout(this.editor, newRange);
      return newRange;
    };

    return PutBeforeWithAutoIndent;

  })(PutBefore);

  PutAfterWithAutoIndent = (function(superClass) {
    extend(PutAfterWithAutoIndent, superClass);

    function PutAfterWithAutoIndent() {
      return PutAfterWithAutoIndent.__super__.constructor.apply(this, arguments);
    }

    PutAfterWithAutoIndent.extend();

    PutAfterWithAutoIndent.prototype.location = 'after';

    return PutAfterWithAutoIndent;

  })(PutBeforeWithAutoIndent);

  AddBlankLineBelow = (function(superClass) {
    extend(AddBlankLineBelow, superClass);

    function AddBlankLineBelow() {
      return AddBlankLineBelow.__super__.constructor.apply(this, arguments);
    }

    AddBlankLineBelow.extend();

    AddBlankLineBelow.prototype.flashTarget = false;

    AddBlankLineBelow.prototype.target = "Empty";

    AddBlankLineBelow.prototype.stayAtSamePosition = true;

    AddBlankLineBelow.prototype.stayByMarker = true;

    AddBlankLineBelow.prototype.where = 'below';

    AddBlankLineBelow.prototype.mutateSelection = function(selection) {
      var point, row;
      row = selection.getHeadBufferPosition().row;
      if (this.where === 'below') {
        row += 1;
      }
      point = [row, 0];
      return this.editor.setTextInBufferRange([point, point], "\n".repeat(this.getCount()));
    };

    return AddBlankLineBelow;

  })(Operator);

  AddBlankLineAbove = (function(superClass) {
    extend(AddBlankLineAbove, superClass);

    function AddBlankLineAbove() {
      return AddBlankLineAbove.__super__.constructor.apply(this, arguments);
    }

    AddBlankLineAbove.extend();

    AddBlankLineAbove.prototype.where = 'above';

    return AddBlankLineAbove;

  })(AddBlankLineBelow);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvb3BlcmF0b3IuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSxzd0JBQUE7SUFBQTs7Ozs7RUFBQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSOztFQUNKLE1BU0ksT0FBQSxDQUFRLFNBQVIsQ0FUSixFQUNFLDJCQURGLEVBRUUsbUVBRkYsRUFHRSx5RUFIRixFQUlFLDJEQUpGLEVBS0UsK0JBTEYsRUFNRSxxRUFORixFQU9FLHlFQVBGLEVBUUU7O0VBRUYsSUFBQSxHQUFPLE9BQUEsQ0FBUSxRQUFSOztFQUVEOzs7SUFDSixRQUFDLENBQUEsTUFBRCxDQUFRLEtBQVI7O0lBQ0EsUUFBQyxDQUFBLGFBQUQsR0FBZ0I7O3VCQUNoQixhQUFBLEdBQWU7O3VCQUNmLFVBQUEsR0FBWTs7dUJBRVosSUFBQSxHQUFNOzt1QkFDTixVQUFBLEdBQVk7O3VCQUNaLGNBQUEsR0FBZ0I7O3VCQUVoQixXQUFBLEdBQWE7O3VCQUNiLGVBQUEsR0FBaUI7O3VCQUNqQixTQUFBLEdBQVc7O3VCQUNYLHNCQUFBLEdBQXdCOzt1QkFDeEIsV0FBQSxHQUFhOzt1QkFFYixvQkFBQSxHQUFzQjs7dUJBQ3RCLGtCQUFBLEdBQW9COzt1QkFDcEIsY0FBQSxHQUFnQjs7dUJBQ2hCLFlBQUEsR0FBYzs7dUJBQ2QsZ0JBQUEsR0FBa0I7O3VCQUNsQiw2QkFBQSxHQUErQjs7dUJBRS9CLHNCQUFBLEdBQXdCOzt1QkFDeEIseUJBQUEsR0FBMkI7O3VCQUUzQix5QkFBQSxHQUEyQjs7dUJBQzNCLHFCQUFBLEdBQXVCOzt1QkFJdkIsa0JBQUEsR0FBb0I7O3VCQUNwQixjQUFBLEdBQWdCOzt1QkFDaEIsY0FBQSxHQUFnQixTQUFBO2FBQ2QsSUFBQyxDQUFBLGtCQUFELElBQXdCLENBQUksSUFBQyxDQUFBO0lBRGY7O3VCQU1o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QUEsTUFBRCxDQUFBOztnQ0FDQSxXQUFBLEdBQWE7O2dDQUNiLE1BQUEsR0FBUTs7Z0NBQ1Isa0JBQUEsR0FBb0I7O2dDQUNwQixZQUFBLEdBQWM7O2dDQUNkLEtBQUEsR0FBTzs7Z0NBRVAsZUFBQSxHQUFpQixTQUFDLFNBQUQ7QUFDZixVQUFBO01BQUEsR0FBQSxHQUFNLFNBQVMsQ0FBQyxxQkFBVixDQUFBLENBQWlDLENBQUM7TUFDeEMsSUFBWSxJQUFDLENBQUEsS0FBRCxLQUFVLE9BQXRCO1FBQUEsR0FBQSxJQUFPLEVBQVA7O01BQ0EsS0FBQSxHQUFRLENBQUMsR0FBRCxFQUFNLENBQU47YUFDUixJQUFDLENBQUEsTUFBTSxDQUFDLG9CQUFSLENBQTZCLENBQUMsS0FBRCxFQUFRLEtBQVIsQ0FBN0IsRUFBNkMsSUFBSSxDQUFDLE1BQUwsQ0FBWSxJQUFDLENBQUEsUUFBRCxDQUFBLENBQVosQ0FBN0M7SUFKZTs7OztLQVJhOztFQWMxQjs7Ozs7OztJQUNKLGlCQUFDLENBQUEsTUFBRCxDQUFBOztnQ0FDQSxLQUFBLEdBQU87Ozs7S0FGdUI7QUF2b0JoQyIsInNvdXJjZXNDb250ZW50IjpbIl8gPSByZXF1aXJlICd1bmRlcnNjb3JlLXBsdXMnXG57XG4gIGlzRW1wdHlSb3dcbiAgZ2V0V29yZFBhdHRlcm5BdEJ1ZmZlclBvc2l0aW9uXG4gIGdldFN1YndvcmRQYXR0ZXJuQXRCdWZmZXJQb3NpdGlvblxuICBpbnNlcnRUZXh0QXRCdWZmZXJQb3NpdGlvblxuICBzZXRCdWZmZXJSb3dcbiAgbW92ZUN1cnNvclRvRmlyc3RDaGFyYWN0ZXJBdFJvd1xuICBlbnN1cmVFbmRzV2l0aE5ld0xpbmVGb3JCdWZmZXJSb3dcbiAgYWRqdXN0SW5kZW50V2l0aEtlZXBpbmdMYXlvdXRcbn0gPSByZXF1aXJlICcuL3V0aWxzJ1xuQmFzZSA9IHJlcXVpcmUgJy4vYmFzZSdcblxuY2xhc3MgT3BlcmF0b3IgZXh0ZW5kcyBCYXNlXG4gIEBleHRlbmQoZmFsc2UpXG4gIEBvcGVyYXRpb25LaW5kOiAnb3BlcmF0b3InXG4gIHJlcXVpcmVUYXJnZXQ6IHRydWVcbiAgcmVjb3JkYWJsZTogdHJ1ZVxuXG4gIHdpc2U6IG51bGxcbiAgb2NjdXJyZW5jZTogZmFsc2VcbiAgb2NjdXJyZW5jZVR5cGU6ICdiYXNlJ1xuXG4gIGZsYXNoVGFyZ2V0OiB0cnVlXG4gIGZsYXNoQ2hlY2twb2ludDogJ2RpZC1maW5pc2gnXG4gIGZsYXNoVHlwZTogJ29wZXJhdG9yJ1xuICBmbGFzaFR5cGVGb3JPY2N1cnJlbmNlOiAnb3BlcmF0b3Itb2NjdXJyZW5jZSdcbiAgdHJhY2tDaGFuZ2U6IGZhbHNlXG5cbiAgcGF0dGVybkZvck9jY3VycmVuY2U6IG51bGxcbiAgc3RheUF0U2FtZVBvc2l0aW9uOiBudWxsXG4gIHN0YXlPcHRpb25OYW1lOiBudWxsXG4gIHN0YXlCeU1hcmtlcjogZmFsc2VcbiAgcmVzdG9yZVBvc2l0aW9uczogdHJ1ZVxuICBzZXRUb0ZpcnN0Q2hhcmFjdGVyT25MaW5ld2lzZTogZmFsc2VcblxuICBhY2NlcHRQcmVzZXRPY2N1cnJlbmNlOiB0cnVlXG4gIGFjY2VwdFBlcnNpc3RlbnRTZWxlY3Rpb246IHRydWVcblxuICBidWZmZXJDaGVja3BvaW50QnlQdXJwb3NlOiBudWxsXG4gIG11dGF0ZVNlbGVjdGlvbk9yZGVyZDogZmFsc2VcblxuICAjIEV4cGVyaW1lbnRhbHkgYWxsb3cgc2VsZWN0VGFyZ2V0IGJlZm9yZSBpbnB1dCBDb21wbGV0ZVxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgc3VwcG9ydEVhcmx5U2VsZWN0OiBmYWxzZVxuICB0YXJnZXRTZWxlY3RlZDogbnVsbFxuICBjYW5FYXJseVNlbGVjdDogLT5cbiAgICBAc3VwcG9ydEVhcmx5U2VsZWN0IGFuZCBub3QgQHJlcGVhdGVkXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gICMgQ2FsbGVkIHdoZW4gb3BlcmF0aW9uIGZpbmlzaGVkXG4gICMgVGhpcyBpcyBlc3NlbnRpYWxseSB0byByZXNldCBzdGF0ZSBmb3IgYC5gIHJlcGVhdC5cbiAgcmVzZXRTdGF0ZTogLT5cbiAgICBAdGFyZ2V0U2VsZWN0ZWQgPSBudWxsXG4gICAgQG9jY3VycmVuY2VTZWxlY3RlZCA9IGZhbHNlXG5cbiAgIyBUd28gY2hlY2twb2ludCBmb3IgZGlmZmVyZW50IHB1cnBvc2VcbiAgIyAtIG9uZSBmb3IgdW5kbyhoYW5kbGVkIGJ5IG1vZGVNYW5hZ2VyKVxuICAjIC0gb25lIGZvciBwcmVzZXJ2ZSBsYXN0IGluc2VydGVkIHRleHRcbiAgY3JlYXRlQnVmZmVyQ2hlY2twb2ludDogKHB1cnBvc2UpIC0+XG4gICAgQGJ1ZmZlckNoZWNrcG9pbnRCeVB1cnBvc2UgPz0ge31cbiAgICBAYnVmZmVyQ2hlY2twb2ludEJ5UHVycG9zZVtwdXJwb3NlXSA9IEBlZGl0b3IuY3JlYXRlQ2hlY2twb2ludCgpXG5cbiAgZ2V0QnVmZmVyQ2hlY2twb2ludDogKHB1cnBvc2UpIC0+XG4gICAgQGJ1ZmZlckNoZWNrcG9pbnRCeVB1cnBvc2U/W3B1cnBvc2VdXG5cbiAgZGVsZXRlQnVmZmVyQ2hlY2twb2ludDogKHB1cnBvc2UpIC0+XG4gICAgaWYgQGJ1ZmZlckNoZWNrcG9pbnRCeVB1cnBvc2U/XG4gICAgICBkZWxldGUgQGJ1ZmZlckNoZWNrcG9pbnRCeVB1cnBvc2VbcHVycG9zZV1cblxuICBncm91cENoYW5nZXNTaW5jZUJ1ZmZlckNoZWNrcG9pbnQ6IChwdXJwb3NlKSAtPlxuICAgIGlmIGNoZWNrcG9pbnQgPSBAZ2V0QnVmZmVyQ2hlY2twb2ludChwdXJwb3NlKVxuICAgICAgQGVkaXRvci5ncm91cENoYW5nZXNTaW5jZUNoZWNrcG9pbnQoY2hlY2twb2ludClcbiAgICAgIEBkZWxldGVCdWZmZXJDaGVja3BvaW50KHB1cnBvc2UpXG5cbiAgc2V0TWFya0ZvckNoYW5nZTogKHJhbmdlKSAtPlxuICAgIEB2aW1TdGF0ZS5tYXJrLnNldCgnWycsIHJhbmdlLnN0YXJ0KVxuICAgIEB2aW1TdGF0ZS5tYXJrLnNldCgnXScsIHJhbmdlLmVuZClcblxuICBuZWVkRmxhc2g6IC0+XG4gICAgQGZsYXNoVGFyZ2V0IGFuZCBAZ2V0Q29uZmlnKCdmbGFzaE9uT3BlcmF0ZScpIGFuZFxuICAgICAgKEBuYW1lIG5vdCBpbiBAZ2V0Q29uZmlnKCdmbGFzaE9uT3BlcmF0ZUJsYWNrbGlzdCcpKSBhbmRcbiAgICAgICgoQG1vZGUgaXNudCAndmlzdWFsJykgb3IgKEBzdWJtb2RlIGlzbnQgQHRhcmdldC53aXNlKSkgIyBlLmcuIFkgaW4gdkNcblxuICBmbGFzaElmTmVjZXNzYXJ5OiAocmFuZ2VzKSAtPlxuICAgIGlmIEBuZWVkRmxhc2goKVxuICAgICAgQHZpbVN0YXRlLmZsYXNoKHJhbmdlcywgdHlwZTogQGdldEZsYXNoVHlwZSgpKVxuXG4gIGZsYXNoQ2hhbmdlSWZOZWNlc3Nhcnk6IC0+XG4gICAgaWYgQG5lZWRGbGFzaCgpXG4gICAgICBAb25EaWRGaW5pc2hPcGVyYXRpb24gPT5cbiAgICAgICAgcmFuZ2VzID0gQG11dGF0aW9uTWFuYWdlci5nZXRTZWxlY3RlZEJ1ZmZlclJhbmdlc0ZvckNoZWNrcG9pbnQoQGZsYXNoQ2hlY2twb2ludClcbiAgICAgICAgQHZpbVN0YXRlLmZsYXNoKHJhbmdlcywgdHlwZTogQGdldEZsYXNoVHlwZSgpKVxuXG4gIGdldEZsYXNoVHlwZTogLT5cbiAgICBpZiBAb2NjdXJyZW5jZVNlbGVjdGVkXG4gICAgICBAZmxhc2hUeXBlRm9yT2NjdXJyZW5jZVxuICAgIGVsc2VcbiAgICAgIEBmbGFzaFR5cGVcblxuICB0cmFja0NoYW5nZUlmTmVjZXNzYXJ5OiAtPlxuICAgIHJldHVybiB1bmxlc3MgQHRyYWNrQ2hhbmdlXG5cbiAgICBAb25EaWRGaW5pc2hPcGVyYXRpb24gPT5cbiAgICAgIGlmIHJhbmdlID0gQG11dGF0aW9uTWFuYWdlci5nZXRNdXRhdGVkQnVmZmVyUmFuZ2VGb3JTZWxlY3Rpb24oQGVkaXRvci5nZXRMYXN0U2VsZWN0aW9uKCkpXG4gICAgICAgIEBzZXRNYXJrRm9yQ2hhbmdlKHJhbmdlKVxuXG4gIGNvbnN0cnVjdG9yOiAtPlxuICAgIHN1cGVyXG4gICAge0BtdXRhdGlvbk1hbmFnZXIsIEBvY2N1cnJlbmNlTWFuYWdlciwgQHBlcnNpc3RlbnRTZWxlY3Rpb259ID0gQHZpbVN0YXRlXG4gICAgQHN1YnNjcmliZVJlc2V0T2NjdXJyZW5jZVBhdHRlcm5JZk5lZWRlZCgpXG4gICAgQGluaXRpYWxpemUoKVxuICAgIEBvbkRpZFNldE9wZXJhdG9yTW9kaWZpZXIoQHNldE1vZGlmaWVyLmJpbmQodGhpcykpXG5cbiAgICAjIFdoZW4gcHJlc2V0LW9jY3VycmVuY2Ugd2FzIGV4aXN0cywgb3BlcmF0ZSBvbiBvY2N1cnJlbmNlLXdpc2VcbiAgICBpZiBAYWNjZXB0UHJlc2V0T2NjdXJyZW5jZSBhbmQgQG9jY3VycmVuY2VNYW5hZ2VyLmhhc01hcmtlcnMoKVxuICAgICAgQG9jY3VycmVuY2UgPSB0cnVlXG5cbiAgICAjIFtGSVhNRV0gT1JERVItTUFUVEVSXG4gICAgIyBUbyBwaWNrIGN1cnNvci13b3JkIHRvIGZpbmQgb2NjdXJyZW5jZSBiYXNlIHBhdHRlcm4uXG4gICAgIyBUaGlzIGhhcyB0byBiZSBkb25lIEJFRk9SRSBjb252ZXJ0aW5nIHBlcnNpc3RlbnQtc2VsZWN0aW9uIGludG8gcmVhbC1zZWxlY3Rpb24uXG4gICAgIyBTaW5jZSB3aGVuIHBlcnNpc3RlbnQtc2VsZWN0aW9uIGlzIGFjdHVhbGwgc2VsZWN0ZWQsIGl0IGNoYW5nZSBjdXJzb3IgcG9zaXRpb24uXG4gICAgaWYgQG9jY3VycmVuY2UgYW5kIG5vdCBAb2NjdXJyZW5jZU1hbmFnZXIuaGFzTWFya2VycygpXG4gICAgICBAb2NjdXJyZW5jZU1hbmFnZXIuYWRkUGF0dGVybihAcGF0dGVybkZvck9jY3VycmVuY2UgPyBAZ2V0UGF0dGVybkZvck9jY3VycmVuY2VUeXBlKEBvY2N1cnJlbmNlVHlwZSkpXG5cblxuICAgICMgVGhpcyBjaGFuZ2UgY3Vyc29yIHBvc2l0aW9uLlxuICAgIGlmIEBzZWxlY3RQZXJzaXN0ZW50U2VsZWN0aW9uSWZOZWNlc3NhcnkoKVxuICAgICAgIyBbRklYTUVdIHNlbGVjdGlvbi13aXNlIGlzIG5vdCBzeW5jaGVkIGlmIGl0IGFscmVhZHkgdmlzdWFsLW1vZGVcbiAgICAgIHVubGVzcyBAbW9kZSBpcyAndmlzdWFsJ1xuICAgICAgICBAdmltU3RhdGUubW9kZU1hbmFnZXIuYWN0aXZhdGUoJ3Zpc3VhbCcsIEBzd3JhcC5kZXRlY3RXaXNlKEBlZGl0b3IpKVxuXG4gICAgQHRhcmdldCA9ICdDdXJyZW50U2VsZWN0aW9uJyBpZiBAbW9kZSBpcyAndmlzdWFsJyBhbmQgQHJlcXVpcmVUYXJnZXRcbiAgICBAc2V0VGFyZ2V0KEBuZXcoQHRhcmdldCkpIGlmIF8uaXNTdHJpbmcoQHRhcmdldClcblxuICBzdWJzY3JpYmVSZXNldE9jY3VycmVuY2VQYXR0ZXJuSWZOZWVkZWQ6IC0+XG4gICAgIyBbQ0FVVElPTl1cbiAgICAjIFRoaXMgbWV0aG9kIGhhcyB0byBiZSBjYWxsZWQgaW4gUFJPUEVSIHRpbWluZy5cbiAgICAjIElmIG9jY3VycmVuY2UgaXMgdHJ1ZSBidXQgbm8gcHJlc2V0LW9jY3VycmVuY2VcbiAgICAjIFRyZWF0IHRoYXQgYG9jY3VycmVuY2VgIGlzIEJPVU5ERUQgdG8gb3BlcmF0b3IgaXRzZWxmLCBzbyBjbGVhbnAgYXQgZmluaXNoZWQuXG4gICAgaWYgQG9jY3VycmVuY2UgYW5kIG5vdCBAb2NjdXJyZW5jZU1hbmFnZXIuaGFzTWFya2VycygpXG4gICAgICBAb25EaWRSZXNldE9wZXJhdGlvblN0YWNrKD0+IEBvY2N1cnJlbmNlTWFuYWdlci5yZXNldFBhdHRlcm5zKCkpXG5cbiAgc2V0TW9kaWZpZXI6IChvcHRpb25zKSAtPlxuICAgIGlmIG9wdGlvbnMud2lzZT9cbiAgICAgIEB3aXNlID0gb3B0aW9ucy53aXNlXG4gICAgICByZXR1cm5cblxuICAgIGlmIG9wdGlvbnMub2NjdXJyZW5jZT9cbiAgICAgIEBvY2N1cnJlbmNlID0gb3B0aW9ucy5vY2N1cnJlbmNlXG4gICAgICBpZiBAb2NjdXJyZW5jZVxuICAgICAgICBAb2NjdXJyZW5jZVR5cGUgPSBvcHRpb25zLm9jY3VycmVuY2VUeXBlXG4gICAgICAgICMgVGhpcyBpcyBvIG1vZGlmaWVyIGNhc2UoZS5nLiBgYyBvIHBgLCBgZCBPIGZgKVxuICAgICAgICAjIFdlIFJFU0VUIGV4aXN0aW5nIG9jY3VyZW5jZS1tYXJrZXIgd2hlbiBgb2Agb3IgYE9gIG1vZGlmaWVyIGlzIHR5cGVkIGJ5IHVzZXIuXG4gICAgICAgIHBhdHRlcm4gPSBAZ2V0UGF0dGVybkZvck9jY3VycmVuY2VUeXBlKEBvY2N1cnJlbmNlVHlwZSlcbiAgICAgICAgQG9jY3VycmVuY2VNYW5hZ2VyLmFkZFBhdHRlcm4ocGF0dGVybiwge3Jlc2V0OiB0cnVlLCBAb2NjdXJyZW5jZVR5cGV9KVxuICAgICAgICBAb25EaWRSZXNldE9wZXJhdGlvblN0YWNrKD0+IEBvY2N1cnJlbmNlTWFuYWdlci5yZXNldFBhdHRlcm5zKCkpXG5cbiAgIyByZXR1cm4gdHJ1ZS9mYWxzZSB0byBpbmRpY2F0ZSBzdWNjZXNzXG4gIHNlbGVjdFBlcnNpc3RlbnRTZWxlY3Rpb25JZk5lY2Vzc2FyeTogLT5cbiAgICBpZiBAYWNjZXB0UGVyc2lzdGVudFNlbGVjdGlvbiBhbmRcbiAgICAgICAgQGdldENvbmZpZygnYXV0b1NlbGVjdFBlcnNpc3RlbnRTZWxlY3Rpb25Pbk9wZXJhdGUnKSBhbmRcbiAgICAgICAgbm90IEBwZXJzaXN0ZW50U2VsZWN0aW9uLmlzRW1wdHkoKVxuXG4gICAgICBAcGVyc2lzdGVudFNlbGVjdGlvbi5zZWxlY3QoKVxuICAgICAgQGVkaXRvci5tZXJnZUludGVyc2VjdGluZ1NlbGVjdGlvbnMoKVxuICAgICAgZm9yICRzZWxlY3Rpb24gaW4gQHN3cmFwLmdldFNlbGVjdGlvbnMoQGVkaXRvcikgd2hlbiBub3QgJHNlbGVjdGlvbi5oYXNQcm9wZXJ0aWVzKClcbiAgICAgICAgJHNlbGVjdGlvbi5zYXZlUHJvcGVydGllcygpXG4gICAgICB0cnVlXG4gICAgZWxzZVxuICAgICAgZmFsc2VcblxuICBnZXRQYXR0ZXJuRm9yT2NjdXJyZW5jZVR5cGU6IChvY2N1cnJlbmNlVHlwZSkgLT5cbiAgICBzd2l0Y2ggb2NjdXJyZW5jZVR5cGVcbiAgICAgIHdoZW4gJ2Jhc2UnXG4gICAgICAgIGdldFdvcmRQYXR0ZXJuQXRCdWZmZXJQb3NpdGlvbihAZWRpdG9yLCBAZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKSlcbiAgICAgIHdoZW4gJ3N1YndvcmQnXG4gICAgICAgIGdldFN1YndvcmRQYXR0ZXJuQXRCdWZmZXJQb3NpdGlvbihAZWRpdG9yLCBAZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKSlcblxuICAjIHRhcmdldCBpcyBUZXh0T2JqZWN0IG9yIE1vdGlvbiB0byBvcGVyYXRlIG9uLlxuICBzZXRUYXJnZXQ6IChAdGFyZ2V0KSAtPlxuICAgIEB0YXJnZXQub3BlcmF0b3IgPSB0aGlzXG4gICAgQGVtaXREaWRTZXRUYXJnZXQodGhpcylcblxuICAgIGlmIEBjYW5FYXJseVNlbGVjdCgpXG4gICAgICBAbm9ybWFsaXplU2VsZWN0aW9uc0lmTmVjZXNzYXJ5KClcbiAgICAgIEBjcmVhdGVCdWZmZXJDaGVja3BvaW50KCd1bmRvJylcbiAgICAgIEBzZWxlY3RUYXJnZXQoKVxuICAgIHRoaXNcblxuICBzZXRUZXh0VG9SZWdpc3RlckZvclNlbGVjdGlvbjogKHNlbGVjdGlvbikgLT5cbiAgICBAc2V0VGV4dFRvUmVnaXN0ZXIoc2VsZWN0aW9uLmdldFRleHQoKSwgc2VsZWN0aW9uKVxuXG4gIHNldFRleHRUb1JlZ2lzdGVyOiAodGV4dCwgc2VsZWN0aW9uKSAtPlxuICAgIHRleHQgKz0gXCJcXG5cIiBpZiAoQHRhcmdldC5pc0xpbmV3aXNlKCkgYW5kIChub3QgdGV4dC5lbmRzV2l0aCgnXFxuJykpKVxuICAgIEB2aW1TdGF0ZS5yZWdpc3Rlci5zZXQobnVsbCwge3RleHQsIHNlbGVjdGlvbn0pIGlmIHRleHRcblxuICBub3JtYWxpemVTZWxlY3Rpb25zSWZOZWNlc3Nhcnk6IC0+XG4gICAgaWYgQHRhcmdldD8uaXNNb3Rpb24oKSBhbmQgKEBtb2RlIGlzICd2aXN1YWwnKVxuICAgICAgQHN3cmFwLm5vcm1hbGl6ZShAZWRpdG9yKVxuXG4gIHN0YXJ0TXV0YXRpb246IChmbikgLT5cbiAgICBpZiBAY2FuRWFybHlTZWxlY3QoKVxuICAgICAgIyAtIFNraXAgc2VsZWN0aW9uIG5vcm1hbGl6YXRpb246IGFscmVhZHkgbm9ybWFsaXplZCBiZWZvcmUgQHNlbGVjdFRhcmdldCgpXG4gICAgICAjIC0gTWFudWFsIGNoZWNrcG9pbnQgZ3JvdXBpbmc6IHRvIGNyZWF0ZSBjaGVja3BvaW50IGJlZm9yZSBAc2VsZWN0VGFyZ2V0KClcbiAgICAgIGZuKClcbiAgICAgIEBlbWl0V2lsbEZpbmlzaE11dGF0aW9uKClcbiAgICAgIEBncm91cENoYW5nZXNTaW5jZUJ1ZmZlckNoZWNrcG9pbnQoJ3VuZG8nKVxuXG4gICAgZWxzZVxuICAgICAgQG5vcm1hbGl6ZVNlbGVjdGlvbnNJZk5lY2Vzc2FyeSgpXG4gICAgICBAZWRpdG9yLnRyYW5zYWN0ID0+XG4gICAgICAgIGZuKClcbiAgICAgICAgQGVtaXRXaWxsRmluaXNoTXV0YXRpb24oKVxuXG4gICAgQGVtaXREaWRGaW5pc2hNdXRhdGlvbigpXG5cbiAgIyBNYWluXG4gIGV4ZWN1dGU6IC0+XG4gICAgQHN0YXJ0TXV0YXRpb24gPT5cbiAgICAgIGlmIEBzZWxlY3RUYXJnZXQoKVxuICAgICAgICBpZiBAbXV0YXRlU2VsZWN0aW9uT3JkZXJkXG4gICAgICAgICAgc2VsZWN0aW9ucyA9IEBlZGl0b3IuZ2V0U2VsZWN0aW9uc09yZGVyZWRCeUJ1ZmZlclBvc2l0aW9uKClcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHNlbGVjdGlvbnMgPSBAZWRpdG9yLmdldFNlbGVjdGlvbnMoKVxuICAgICAgICBmb3Igc2VsZWN0aW9uIGluIHNlbGVjdGlvbnNcbiAgICAgICAgICBAbXV0YXRlU2VsZWN0aW9uKHNlbGVjdGlvbilcbiAgICAgICAgQG11dGF0aW9uTWFuYWdlci5zZXRDaGVja3BvaW50KCdkaWQtZmluaXNoJylcbiAgICAgICAgQHJlc3RvcmVDdXJzb3JQb3NpdGlvbnNJZk5lY2Vzc2FyeSgpXG5cbiAgICAjIEV2ZW4gdGhvdWdoIHdlIGZhaWwgdG8gc2VsZWN0IHRhcmdldCBhbmQgZmFpbCB0byBtdXRhdGUsXG4gICAgIyB3ZSBoYXZlIHRvIHJldHVybiB0byBub3JtYWwtbW9kZSBmcm9tIG9wZXJhdG9yLXBlbmRpbmcgb3IgdmlzdWFsXG4gICAgQGFjdGl2YXRlTW9kZSgnbm9ybWFsJylcblxuICAjIFJldHVybiB0cnVlIHVubGVzcyBhbGwgc2VsZWN0aW9uIGlzIGVtcHR5LlxuICBzZWxlY3RUYXJnZXQ6IC0+XG4gICAgcmV0dXJuIEB0YXJnZXRTZWxlY3RlZCBpZiBAdGFyZ2V0U2VsZWN0ZWQ/XG4gICAgQG11dGF0aW9uTWFuYWdlci5pbml0KHtAc3RheUJ5TWFya2VyfSlcblxuICAgIEB0YXJnZXQuZm9yY2VXaXNlKEB3aXNlKSBpZiBAd2lzZT9cbiAgICBAZW1pdFdpbGxTZWxlY3RUYXJnZXQoKVxuXG4gICAgIyBBbGxvdyBjdXJzb3IgcG9zaXRpb24gYWRqdXN0bWVudCAnb24td2lsbC1zZWxlY3QtdGFyZ2V0JyBob29rLlxuICAgICMgc28gY2hlY2twb2ludCBjb21lcyBBRlRFUiBAZW1pdFdpbGxTZWxlY3RUYXJnZXQoKVxuICAgIEBtdXRhdGlvbk1hbmFnZXIuc2V0Q2hlY2twb2ludCgnd2lsbC1zZWxlY3QnKVxuXG4gICAgIyBOT1RFXG4gICAgIyBTaW5jZSBNb3ZlVG9OZXh0T2NjdXJyZW5jZSwgTW92ZVRvUHJldmlvdXNPY2N1cnJlbmNlIG1vdGlvbiBtb3ZlIGJ5XG4gICAgIyAgb2NjdXJyZW5jZS1tYXJrZXIsIG9jY3VycmVuY2UtbWFya2VyIGhhcyB0byBiZSBjcmVhdGVkIEJFRk9SRSBgQHRhcmdldC5leGVjdXRlKClgXG4gICAgIyBBbmQgd2hlbiByZXBlYXRlZCwgb2NjdXJyZW5jZSBwYXR0ZXJuIGlzIGFscmVhZHkgY2FjaGVkIGF0IEBwYXR0ZXJuRm9yT2NjdXJyZW5jZVxuICAgIGlmIEByZXBlYXRlZCBhbmQgQG9jY3VycmVuY2UgYW5kIG5vdCBAb2NjdXJyZW5jZU1hbmFnZXIuaGFzTWFya2VycygpXG4gICAgICBAb2NjdXJyZW5jZU1hbmFnZXIuYWRkUGF0dGVybihAcGF0dGVybkZvck9jY3VycmVuY2UsIHtAb2NjdXJyZW5jZVR5cGV9KVxuXG4gICAgQHRhcmdldC5leGVjdXRlKClcblxuICAgIEBtdXRhdGlvbk1hbmFnZXIuc2V0Q2hlY2twb2ludCgnZGlkLXNlbGVjdCcpXG4gICAgaWYgQG9jY3VycmVuY2VcbiAgICAgICMgVG8gcmVwb2VhdChgLmApIG9wZXJhdGlvbiB3aGVyZSBtdWx0aXBsZSBvY2N1cnJlbmNlIHBhdHRlcm5zIHdhcyBzZXQuXG4gICAgICAjIEhlcmUgd2Ugc2F2ZSBwYXR0ZXJucyB3aGljaCByZXByZXNlbnQgdW5pb25lZCByZWdleCB3aGljaCBAb2NjdXJyZW5jZU1hbmFnZXIga25vd3MuXG4gICAgICBAcGF0dGVybkZvck9jY3VycmVuY2UgPz0gQG9jY3VycmVuY2VNYW5hZ2VyLmJ1aWxkUGF0dGVybigpXG5cbiAgICAgIGlmIEBvY2N1cnJlbmNlTWFuYWdlci5zZWxlY3QoKVxuICAgICAgICBAb2NjdXJyZW5jZVNlbGVjdGVkID0gdHJ1ZVxuICAgICAgICBAbXV0YXRpb25NYW5hZ2VyLnNldENoZWNrcG9pbnQoJ2RpZC1zZWxlY3Qtb2NjdXJyZW5jZScpXG5cbiAgICBpZiBAdGFyZ2V0U2VsZWN0ZWQgPSBAdmltU3RhdGUuaGF2ZVNvbWVOb25FbXB0eVNlbGVjdGlvbigpIG9yIEB0YXJnZXQubmFtZSBpcyBcIkVtcHR5XCJcbiAgICAgIEBlbWl0RGlkU2VsZWN0VGFyZ2V0KClcbiAgICAgIEBmbGFzaENoYW5nZUlmTmVjZXNzYXJ5KClcbiAgICAgIEB0cmFja0NoYW5nZUlmTmVjZXNzYXJ5KClcbiAgICBlbHNlXG4gICAgICBAZW1pdERpZEZhaWxTZWxlY3RUYXJnZXQoKVxuICAgIHJldHVybiBAdGFyZ2V0U2VsZWN0ZWRcblxuICByZXN0b3JlQ3Vyc29yUG9zaXRpb25zSWZOZWNlc3Nhcnk6IC0+XG4gICAgcmV0dXJuIHVubGVzcyBAcmVzdG9yZVBvc2l0aW9uc1xuICAgIHN0YXkgPSBAc3RheUF0U2FtZVBvc2l0aW9uID8gQGdldENvbmZpZyhAc3RheU9wdGlvbk5hbWUpIG9yIChAb2NjdXJyZW5jZVNlbGVjdGVkIGFuZCBAZ2V0Q29uZmlnKCdzdGF5T25PY2N1cnJlbmNlJykpXG4gICAgd2lzZSA9IGlmIEBvY2N1cnJlbmNlU2VsZWN0ZWQgdGhlbiAnY2hhcmFjdGVyd2lzZScgZWxzZSBAdGFyZ2V0Lndpc2VcbiAgICBAbXV0YXRpb25NYW5hZ2VyLnJlc3RvcmVDdXJzb3JQb3NpdGlvbnMoe3N0YXksIHdpc2UsIEBzZXRUb0ZpcnN0Q2hhcmFjdGVyT25MaW5ld2lzZX0pXG5cbiMgU2VsZWN0XG4jIFdoZW4gdGV4dC1vYmplY3QgaXMgaW52b2tlZCBmcm9tIG5vcm1hbCBvciB2aXVzYWwtbW9kZSwgb3BlcmF0aW9uIHdvdWxkIGJlXG4jICA9PiBTZWxlY3Qgb3BlcmF0b3Igd2l0aCB0YXJnZXQ9dGV4dC1vYmplY3RcbiMgV2hlbiBtb3Rpb24gaXMgaW52b2tlZCBmcm9tIHZpc3VhbC1tb2RlLCBvcGVyYXRpb24gd291bGQgYmVcbiMgID0+IFNlbGVjdCBvcGVyYXRvciB3aXRoIHRhcmdldD1tb3Rpb24pXG4jID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4jIFNlbGVjdCBpcyB1c2VkIGluIFRXTyBzaXR1YXRpb24uXG4jIC0gdmlzdWFsLW1vZGUgb3BlcmF0aW9uXG4jICAgLSBlLmc6IGB2IGxgLCBgViBqYCwgYHYgaSBwYC4uLlxuIyAtIERpcmVjdGx5IGludm9rZSB0ZXh0LW9iamVjdCBmcm9tIG5vcm1hbC1tb2RlXG4jICAgLSBlLmc6IEludm9rZSBgSW5uZXIgUGFyYWdyYXBoYCBmcm9tIGNvbW1hbmQtcGFsZXR0ZS5cbmNsYXNzIFNlbGVjdCBleHRlbmRzIE9wZXJhdG9yXG4gIEBleHRlbmQoZmFsc2UpXG4gIGZsYXNoVGFyZ2V0OiBmYWxzZVxuICByZWNvcmRhYmxlOiBmYWxzZVxuICBhY2NlcHRQcmVzZXRPY2N1cnJlbmNlOiBmYWxzZVxuICBhY2NlcHRQZXJzaXN0ZW50U2VsZWN0aW9uOiBmYWxzZVxuXG4gIGV4ZWN1dGU6IC0+XG4gICAgQHN0YXJ0TXV0YXRpb24oQHNlbGVjdFRhcmdldC5iaW5kKHRoaXMpKVxuXG4gICAgaWYgQHRhcmdldC5pc1RleHRPYmplY3QoKSBhbmQgQHRhcmdldC5zZWxlY3RTdWNjZWVkZWRcbiAgICAgIEBlZGl0b3Iuc2Nyb2xsVG9DdXJzb3JQb3NpdGlvbigpXG4gICAgICBAYWN0aXZhdGVNb2RlSWZOZWNlc3NhcnkoJ3Zpc3VhbCcsIEB0YXJnZXQud2lzZSlcblxuY2xhc3MgU2VsZWN0TGF0ZXN0Q2hhbmdlIGV4dGVuZHMgU2VsZWN0XG4gIEBleHRlbmQoKVxuICBAZGVzY3JpcHRpb246IFwiU2VsZWN0IGxhdGVzdCB5YW5rZWQgb3IgY2hhbmdlZCByYW5nZVwiXG4gIHRhcmdldDogJ0FMYXRlc3RDaGFuZ2UnXG5cbmNsYXNzIFNlbGVjdFByZXZpb3VzU2VsZWN0aW9uIGV4dGVuZHMgU2VsZWN0XG4gIEBleHRlbmQoKVxuICB0YXJnZXQ6IFwiUHJldmlvdXNTZWxlY3Rpb25cIlxuXG5jbGFzcyBTZWxlY3RQZXJzaXN0ZW50U2VsZWN0aW9uIGV4dGVuZHMgU2VsZWN0XG4gIEBleHRlbmQoKVxuICBAZGVzY3JpcHRpb246IFwiU2VsZWN0IHBlcnNpc3RlbnQtc2VsZWN0aW9uIGFuZCBjbGVhciBhbGwgcGVyc2lzdGVudC1zZWxlY3Rpb24sIGl0J3MgbGlrZSBjb252ZXJ0IHRvIHJlYWwtc2VsZWN0aW9uXCJcbiAgdGFyZ2V0OiBcIkFQZXJzaXN0ZW50U2VsZWN0aW9uXCJcblxuY2xhc3MgU2VsZWN0T2NjdXJyZW5jZSBleHRlbmRzIE9wZXJhdG9yXG4gIEBleHRlbmQoKVxuICBAZGVzY3JpcHRpb246IFwiQWRkIHNlbGVjdGlvbiBvbnRvIGVhY2ggbWF0Y2hpbmcgd29yZCB3aXRoaW4gdGFyZ2V0IHJhbmdlXCJcbiAgb2NjdXJyZW5jZTogdHJ1ZVxuXG4gIGV4ZWN1dGU6IC0+XG4gICAgQHN0YXJ0TXV0YXRpb24gPT5cbiAgICAgIGlmIEBzZWxlY3RUYXJnZXQoKVxuICAgICAgICBAYWN0aXZhdGVNb2RlSWZOZWNlc3NhcnkoJ3Zpc3VhbCcsICdjaGFyYWN0ZXJ3aXNlJylcblxuIyBQZXJzaXN0ZW50IFNlbGVjdGlvblxuIyA9PT09PT09PT09PT09PT09PT09PT09PT09XG5jbGFzcyBDcmVhdGVQZXJzaXN0ZW50U2VsZWN0aW9uIGV4dGVuZHMgT3BlcmF0b3JcbiAgQGV4dGVuZCgpXG4gIGZsYXNoVGFyZ2V0OiBmYWxzZVxuICBzdGF5QXRTYW1lUG9zaXRpb246IHRydWVcbiAgYWNjZXB0UHJlc2V0T2NjdXJyZW5jZTogZmFsc2VcbiAgYWNjZXB0UGVyc2lzdGVudFNlbGVjdGlvbjogZmFsc2VcblxuICBtdXRhdGVTZWxlY3Rpb246IChzZWxlY3Rpb24pIC0+XG4gICAgQHBlcnNpc3RlbnRTZWxlY3Rpb24ubWFya0J1ZmZlclJhbmdlKHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpKVxuXG5jbGFzcyBUb2dnbGVQZXJzaXN0ZW50U2VsZWN0aW9uIGV4dGVuZHMgQ3JlYXRlUGVyc2lzdGVudFNlbGVjdGlvblxuICBAZXh0ZW5kKClcblxuICBpc0NvbXBsZXRlOiAtPlxuICAgIHBvaW50ID0gQGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpXG4gICAgQG1hcmtlclRvUmVtb3ZlID0gQHBlcnNpc3RlbnRTZWxlY3Rpb24uZ2V0TWFya2VyQXRQb2ludChwb2ludClcbiAgICBpZiBAbWFya2VyVG9SZW1vdmVcbiAgICAgIHRydWVcbiAgICBlbHNlXG4gICAgICBzdXBlclxuXG4gIGV4ZWN1dGU6IC0+XG4gICAgaWYgQG1hcmtlclRvUmVtb3ZlXG4gICAgICBAbWFya2VyVG9SZW1vdmUuZGVzdHJveSgpXG4gICAgZWxzZVxuICAgICAgc3VwZXJcblxuIyBQcmVzZXQgT2NjdXJyZW5jZVxuIyA9PT09PT09PT09PT09PT09PT09PT09PT09XG5jbGFzcyBUb2dnbGVQcmVzZXRPY2N1cnJlbmNlIGV4dGVuZHMgT3BlcmF0b3JcbiAgQGV4dGVuZCgpXG4gIHRhcmdldDogXCJFbXB0eVwiXG4gIGZsYXNoVGFyZ2V0OiBmYWxzZVxuICBhY2NlcHRQcmVzZXRPY2N1cnJlbmNlOiBmYWxzZVxuICBhY2NlcHRQZXJzaXN0ZW50U2VsZWN0aW9uOiBmYWxzZVxuICBvY2N1cnJlbmNlVHlwZTogJ2Jhc2UnXG5cbiAgZXhlY3V0ZTogLT5cbiAgICBpZiBtYXJrZXIgPSBAb2NjdXJyZW5jZU1hbmFnZXIuZ2V0TWFya2VyQXRQb2ludChAZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCkpXG4gICAgICBAb2NjdXJyZW5jZU1hbmFnZXIuZGVzdHJveU1hcmtlcnMoW21hcmtlcl0pXG4gICAgZWxzZVxuICAgICAgcGF0dGVybiA9IG51bGxcbiAgICAgIGlzTmFycm93ZWQgPSBAdmltU3RhdGUubW9kZU1hbmFnZXIuaXNOYXJyb3dlZCgpXG5cbiAgICAgIGlmIEBtb2RlIGlzICd2aXN1YWwnIGFuZCBub3QgaXNOYXJyb3dlZFxuICAgICAgICBAb2NjdXJyZW5jZVR5cGUgPSAnYmFzZSdcbiAgICAgICAgcGF0dGVybiA9IG5ldyBSZWdFeHAoXy5lc2NhcGVSZWdFeHAoQGVkaXRvci5nZXRTZWxlY3RlZFRleHQoKSksICdnJylcbiAgICAgIGVsc2VcbiAgICAgICAgcGF0dGVybiA9IEBnZXRQYXR0ZXJuRm9yT2NjdXJyZW5jZVR5cGUoQG9jY3VycmVuY2VUeXBlKVxuXG4gICAgICBAb2NjdXJyZW5jZU1hbmFnZXIuYWRkUGF0dGVybihwYXR0ZXJuLCB7QG9jY3VycmVuY2VUeXBlfSlcbiAgICAgIEBvY2N1cnJlbmNlTWFuYWdlci5zYXZlTGFzdFBhdHRlcm4oQG9jY3VycmVuY2VUeXBlKVxuXG4gICAgICBAYWN0aXZhdGVNb2RlKCdub3JtYWwnKSB1bmxlc3MgaXNOYXJyb3dlZFxuXG5jbGFzcyBUb2dnbGVQcmVzZXRTdWJ3b3JkT2NjdXJyZW5jZSBleHRlbmRzIFRvZ2dsZVByZXNldE9jY3VycmVuY2VcbiAgQGV4dGVuZCgpXG4gIG9jY3VycmVuY2VUeXBlOiAnc3Vid29yZCdcblxuIyBXYW50IHRvIHJlbmFtZSBSZXN0b3JlT2NjdXJyZW5jZU1hcmtlclxuY2xhc3MgQWRkUHJlc2V0T2NjdXJyZW5jZUZyb21MYXN0T2NjdXJyZW5jZVBhdHRlcm4gZXh0ZW5kcyBUb2dnbGVQcmVzZXRPY2N1cnJlbmNlXG4gIEBleHRlbmQoKVxuICBleGVjdXRlOiAtPlxuICAgIEBvY2N1cnJlbmNlTWFuYWdlci5yZXNldFBhdHRlcm5zKClcbiAgICBpZiBwYXR0ZXJuID0gQHZpbVN0YXRlLmdsb2JhbFN0YXRlLmdldCgnbGFzdE9jY3VycmVuY2VQYXR0ZXJuJylcbiAgICAgIG9jY3VycmVuY2VUeXBlID0gQHZpbVN0YXRlLmdsb2JhbFN0YXRlLmdldChcImxhc3RPY2N1cnJlbmNlVHlwZVwiKVxuICAgICAgQG9jY3VycmVuY2VNYW5hZ2VyLmFkZFBhdHRlcm4ocGF0dGVybiwge29jY3VycmVuY2VUeXBlfSlcbiAgICAgIEBhY3RpdmF0ZU1vZGUoJ25vcm1hbCcpXG5cbiMgRGVsZXRlXG4jID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5jbGFzcyBEZWxldGUgZXh0ZW5kcyBPcGVyYXRvclxuICBAZXh0ZW5kKClcbiAgdHJhY2tDaGFuZ2U6IHRydWVcbiAgZmxhc2hDaGVja3BvaW50OiAnZGlkLXNlbGVjdC1vY2N1cnJlbmNlJ1xuICBmbGFzaFR5cGVGb3JPY2N1cnJlbmNlOiAnb3BlcmF0b3ItcmVtb3ZlLW9jY3VycmVuY2UnXG4gIHN0YXlPcHRpb25OYW1lOiAnc3RheU9uRGVsZXRlJ1xuICBzZXRUb0ZpcnN0Q2hhcmFjdGVyT25MaW5ld2lzZTogdHJ1ZVxuXG4gIGV4ZWN1dGU6IC0+XG4gICAgaWYgQHRhcmdldC53aXNlIGlzICdibG9ja3dpc2UnXG4gICAgICBAcmVzdG9yZVBvc2l0aW9ucyA9IGZhbHNlXG4gICAgc3VwZXJcblxuICBtdXRhdGVTZWxlY3Rpb246IChzZWxlY3Rpb24pID0+XG4gICAgQHNldFRleHRUb1JlZ2lzdGVyRm9yU2VsZWN0aW9uKHNlbGVjdGlvbilcbiAgICBzZWxlY3Rpb24uZGVsZXRlU2VsZWN0ZWRUZXh0KClcblxuY2xhc3MgRGVsZXRlUmlnaHQgZXh0ZW5kcyBEZWxldGVcbiAgQGV4dGVuZCgpXG4gIHRhcmdldDogJ01vdmVSaWdodCdcblxuY2xhc3MgRGVsZXRlTGVmdCBleHRlbmRzIERlbGV0ZVxuICBAZXh0ZW5kKClcbiAgdGFyZ2V0OiAnTW92ZUxlZnQnXG5cbmNsYXNzIERlbGV0ZVRvTGFzdENoYXJhY3Rlck9mTGluZSBleHRlbmRzIERlbGV0ZVxuICBAZXh0ZW5kKClcbiAgdGFyZ2V0OiAnTW92ZVRvTGFzdENoYXJhY3Rlck9mTGluZSdcblxuICBleGVjdXRlOiAtPlxuICAgIGlmIEB0YXJnZXQud2lzZSBpcyAnYmxvY2t3aXNlJ1xuICAgICAgQG9uRGlkU2VsZWN0VGFyZ2V0ID0+XG4gICAgICAgIGZvciBibG9ja3dpc2VTZWxlY3Rpb24gaW4gQGdldEJsb2Nrd2lzZVNlbGVjdGlvbnMoKVxuICAgICAgICAgIGJsb2Nrd2lzZVNlbGVjdGlvbi5leHRlbmRNZW1iZXJTZWxlY3Rpb25zVG9FbmRPZkxpbmUoKVxuICAgIHN1cGVyXG5cbmNsYXNzIERlbGV0ZUxpbmUgZXh0ZW5kcyBEZWxldGVcbiAgQGV4dGVuZCgpXG4gIHdpc2U6ICdsaW5ld2lzZSdcbiAgdGFyZ2V0OiBcIk1vdmVUb1JlbGF0aXZlTGluZVwiXG5cbiMgWWFua1xuIyA9PT09PT09PT09PT09PT09PT09PT09PT09XG5jbGFzcyBZYW5rIGV4dGVuZHMgT3BlcmF0b3JcbiAgQGV4dGVuZCgpXG4gIHRyYWNrQ2hhbmdlOiB0cnVlXG4gIHN0YXlPcHRpb25OYW1lOiAnc3RheU9uWWFuaydcblxuICBtdXRhdGVTZWxlY3Rpb246IChzZWxlY3Rpb24pIC0+XG4gICAgQHNldFRleHRUb1JlZ2lzdGVyRm9yU2VsZWN0aW9uKHNlbGVjdGlvbilcblxuY2xhc3MgWWFua0xpbmUgZXh0ZW5kcyBZYW5rXG4gIEBleHRlbmQoKVxuICB3aXNlOiAnbGluZXdpc2UnXG4gIHRhcmdldDogXCJNb3ZlVG9SZWxhdGl2ZUxpbmVcIlxuXG5jbGFzcyBZYW5rVG9MYXN0Q2hhcmFjdGVyT2ZMaW5lIGV4dGVuZHMgWWFua1xuICBAZXh0ZW5kKClcbiAgdGFyZ2V0OiAnTW92ZVRvTGFzdENoYXJhY3Rlck9mTGluZSdcblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIFtjdHJsLWFdXG5jbGFzcyBJbmNyZWFzZSBleHRlbmRzIE9wZXJhdG9yXG4gIEBleHRlbmQoKVxuICB0YXJnZXQ6IFwiRW1wdHlcIiAjIGN0cmwtYSBpbiBub3JtYWwtbW9kZSBmaW5kIHRhcmdldCBudW1iZXIgaW4gY3VycmVudCBsaW5lIG1hbnVhbGx5XG4gIGZsYXNoVGFyZ2V0OiBmYWxzZSAjIGRvIG1hbnVhbGx5XG4gIHJlc3RvcmVQb3NpdGlvbnM6IGZhbHNlICMgZG8gbWFudWFsbHlcbiAgc3RlcDogMVxuXG4gIGV4ZWN1dGU6IC0+XG4gICAgQG5ld1JhbmdlcyA9IFtdXG4gICAgc3VwZXJcbiAgICBpZiBAbmV3UmFuZ2VzLmxlbmd0aFxuICAgICAgaWYgQGdldENvbmZpZygnZmxhc2hPbk9wZXJhdGUnKSBhbmQgQG5hbWUgbm90IGluIEBnZXRDb25maWcoJ2ZsYXNoT25PcGVyYXRlQmxhY2tsaXN0JylcbiAgICAgICAgQHZpbVN0YXRlLmZsYXNoKEBuZXdSYW5nZXMsIHR5cGU6IEBmbGFzaFR5cGVGb3JPY2N1cnJlbmNlKVxuXG4gIHJlcGxhY2VOdW1iZXJJbkJ1ZmZlclJhbmdlOiAoc2NhblJhbmdlLCBmbj1udWxsKSAtPlxuICAgIG5ld1JhbmdlcyA9IFtdXG4gICAgQHBhdHRlcm4gPz0gLy8vI3tAZ2V0Q29uZmlnKCdudW1iZXJSZWdleCcpfS8vL2dcbiAgICBAc2NhbkZvcndhcmQgQHBhdHRlcm4sIHtzY2FuUmFuZ2V9LCAoZXZlbnQpID0+XG4gICAgICByZXR1cm4gaWYgZm4/IGFuZCBub3QgZm4oZXZlbnQpXG4gICAgICB7bWF0Y2hUZXh0LCByZXBsYWNlfSA9IGV2ZW50XG4gICAgICBuZXh0TnVtYmVyID0gQGdldE5leHROdW1iZXIobWF0Y2hUZXh0KVxuICAgICAgbmV3UmFuZ2VzLnB1c2gocmVwbGFjZShTdHJpbmcobmV4dE51bWJlcikpKVxuICAgIG5ld1Jhbmdlc1xuXG4gIG11dGF0ZVNlbGVjdGlvbjogKHNlbGVjdGlvbikgLT5cbiAgICB7Y3Vyc29yfSA9IHNlbGVjdGlvblxuICAgIGlmIEB0YXJnZXQuaXMoJ0VtcHR5JykgIyBjdHJsLWEsIGN0cmwteCBpbiBgbm9ybWFsLW1vZGVgXG4gICAgICBjdXJzb3JQb3NpdGlvbiA9IGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXG4gICAgICBzY2FuUmFuZ2UgPSBAZWRpdG9yLmJ1ZmZlclJhbmdlRm9yQnVmZmVyUm93KGN1cnNvclBvc2l0aW9uLnJvdylcbiAgICAgIG5ld1JhbmdlcyA9IEByZXBsYWNlTnVtYmVySW5CdWZmZXJSYW5nZSBzY2FuUmFuZ2UsICh7cmFuZ2UsIHN0b3B9KSAtPlxuICAgICAgICBpZiByYW5nZS5lbmQuaXNHcmVhdGVyVGhhbihjdXJzb3JQb3NpdGlvbilcbiAgICAgICAgICBzdG9wKClcbiAgICAgICAgICB0cnVlXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBmYWxzZVxuXG4gICAgICBwb2ludCA9IG5ld1Jhbmdlc1swXT8uZW5kLnRyYW5zbGF0ZShbMCwgLTFdKSA/IGN1cnNvclBvc2l0aW9uXG4gICAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24ocG9pbnQpXG4gICAgZWxzZVxuICAgICAgc2NhblJhbmdlID0gc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKClcbiAgICAgIEBuZXdSYW5nZXMucHVzaChAcmVwbGFjZU51bWJlckluQnVmZmVyUmFuZ2Uoc2NhblJhbmdlKS4uLilcbiAgICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihzY2FuUmFuZ2Uuc3RhcnQpXG5cbiAgZ2V0TmV4dE51bWJlcjogKG51bWJlclN0cmluZykgLT5cbiAgICBOdW1iZXIucGFyc2VJbnQobnVtYmVyU3RyaW5nLCAxMCkgKyBAc3RlcCAqIEBnZXRDb3VudCgpXG5cbiMgW2N0cmwteF1cbmNsYXNzIERlY3JlYXNlIGV4dGVuZHMgSW5jcmVhc2VcbiAgQGV4dGVuZCgpXG4gIHN0ZXA6IC0xXG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBbZyBjdHJsLWFdXG5jbGFzcyBJbmNyZW1lbnROdW1iZXIgZXh0ZW5kcyBJbmNyZWFzZVxuICBAZXh0ZW5kKClcbiAgYmFzZU51bWJlcjogbnVsbFxuICB0YXJnZXQ6IG51bGxcbiAgbXV0YXRlU2VsZWN0aW9uT3JkZXJkOiB0cnVlXG5cbiAgZ2V0TmV4dE51bWJlcjogKG51bWJlclN0cmluZykgLT5cbiAgICBpZiBAYmFzZU51bWJlcj9cbiAgICAgIEBiYXNlTnVtYmVyICs9IEBzdGVwICogQGdldENvdW50KClcbiAgICBlbHNlXG4gICAgICBAYmFzZU51bWJlciA9IE51bWJlci5wYXJzZUludChudW1iZXJTdHJpbmcsIDEwKVxuICAgIEBiYXNlTnVtYmVyXG5cbiMgW2cgY3RybC14XVxuY2xhc3MgRGVjcmVtZW50TnVtYmVyIGV4dGVuZHMgSW5jcmVtZW50TnVtYmVyXG4gIEBleHRlbmQoKVxuICBzdGVwOiAtMVxuXG4jIFB1dFxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIEN1cnNvciBwbGFjZW1lbnQ6XG4jIC0gcGxhY2UgYXQgZW5kIG9mIG11dGF0aW9uOiBwYXN0ZSBub24tbXVsdGlsaW5lIGNoYXJhY3Rlcndpc2UgdGV4dFxuIyAtIHBsYWNlIGF0IHN0YXJ0IG9mIG11dGF0aW9uOiBub24tbXVsdGlsaW5lIGNoYXJhY3Rlcndpc2UgdGV4dChjaGFyYWN0ZXJ3aXNlLCBsaW5ld2lzZSlcbmNsYXNzIFB1dEJlZm9yZSBleHRlbmRzIE9wZXJhdG9yXG4gIEBleHRlbmQoKVxuICBsb2NhdGlvbjogJ2JlZm9yZSdcbiAgdGFyZ2V0OiAnRW1wdHknXG4gIGZsYXNoVHlwZTogJ29wZXJhdG9yLWxvbmcnXG4gIHJlc3RvcmVQb3NpdGlvbnM6IGZhbHNlICMgbWFuYWdlIG1hbnVhbGx5XG4gIGZsYXNoVGFyZ2V0OiB0cnVlICMgbWFuYWdlIG1hbnVhbGx5XG4gIHRyYWNrQ2hhbmdlOiBmYWxzZSAjIG1hbmFnZSBtYW51YWxseVxuXG4gIGV4ZWN1dGU6IC0+XG4gICAgQG11dGF0aW9uc0J5U2VsZWN0aW9uID0gbmV3IE1hcCgpXG4gICAge3RleHQsIHR5cGV9ID0gQHZpbVN0YXRlLnJlZ2lzdGVyLmdldChudWxsLCBAZWRpdG9yLmdldExhc3RTZWxlY3Rpb24oKSlcbiAgICByZXR1cm4gdW5sZXNzIHRleHRcbiAgICBAb25EaWRGaW5pc2hNdXRhdGlvbihAYWRqdXN0Q3Vyc29yUG9zaXRpb24uYmluZCh0aGlzKSlcblxuICAgIEBvbkRpZEZpbmlzaE9wZXJhdGlvbiA9PlxuICAgICAgIyBUcmFja0NoYW5nZVxuICAgICAgaWYgbmV3UmFuZ2UgPSBAbXV0YXRpb25zQnlTZWxlY3Rpb24uZ2V0KEBlZGl0b3IuZ2V0TGFzdFNlbGVjdGlvbigpKVxuICAgICAgICBAc2V0TWFya0ZvckNoYW5nZShuZXdSYW5nZSlcblxuICAgICAgIyBGbGFzaFxuICAgICAgaWYgQGdldENvbmZpZygnZmxhc2hPbk9wZXJhdGUnKSBhbmQgQG5hbWUgbm90IGluIEBnZXRDb25maWcoJ2ZsYXNoT25PcGVyYXRlQmxhY2tsaXN0JylcbiAgICAgICAgdG9SYW5nZSA9IChzZWxlY3Rpb24pID0+IEBtdXRhdGlvbnNCeVNlbGVjdGlvbi5nZXQoc2VsZWN0aW9uKVxuICAgICAgICBAdmltU3RhdGUuZmxhc2goQGVkaXRvci5nZXRTZWxlY3Rpb25zKCkubWFwKHRvUmFuZ2UpLCB0eXBlOiBAZ2V0Rmxhc2hUeXBlKCkpXG5cbiAgICBzdXBlclxuXG4gIGFkanVzdEN1cnNvclBvc2l0aW9uOiAtPlxuICAgIGZvciBzZWxlY3Rpb24gaW4gQGVkaXRvci5nZXRTZWxlY3Rpb25zKCkgd2hlbiBAbXV0YXRpb25zQnlTZWxlY3Rpb24uaGFzKHNlbGVjdGlvbilcbiAgICAgIHtjdXJzb3J9ID0gc2VsZWN0aW9uXG4gICAgICB7c3RhcnQsIGVuZH0gPSBuZXdSYW5nZSA9IEBtdXRhdGlvbnNCeVNlbGVjdGlvbi5nZXQoc2VsZWN0aW9uKVxuICAgICAgaWYgQGxpbmV3aXNlUGFzdGVcbiAgICAgICAgbW92ZUN1cnNvclRvRmlyc3RDaGFyYWN0ZXJBdFJvdyhjdXJzb3IsIHN0YXJ0LnJvdylcbiAgICAgIGVsc2VcbiAgICAgICAgaWYgbmV3UmFuZ2UuaXNTaW5nbGVMaW5lKClcbiAgICAgICAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24oZW5kLnRyYW5zbGF0ZShbMCwgLTFdKSlcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihzdGFydClcblxuICBtdXRhdGVTZWxlY3Rpb246IChzZWxlY3Rpb24pIC0+XG4gICAge3RleHQsIHR5cGV9ID0gQHZpbVN0YXRlLnJlZ2lzdGVyLmdldChudWxsLCBzZWxlY3Rpb24pXG4gICAgdGV4dCA9IF8ubXVsdGlwbHlTdHJpbmcodGV4dCwgQGdldENvdW50KCkpXG4gICAgQGxpbmV3aXNlUGFzdGUgPSB0eXBlIGlzICdsaW5ld2lzZScgb3IgQGlzTW9kZSgndmlzdWFsJywgJ2xpbmV3aXNlJylcbiAgICBuZXdSYW5nZSA9IEBwYXN0ZShzZWxlY3Rpb24sIHRleHQsIHtAbGluZXdpc2VQYXN0ZX0pXG4gICAgQG11dGF0aW9uc0J5U2VsZWN0aW9uLnNldChzZWxlY3Rpb24sIG5ld1JhbmdlKVxuXG4gIHBhc3RlOiAoc2VsZWN0aW9uLCB0ZXh0LCB7bGluZXdpc2VQYXN0ZX0pIC0+XG4gICAgaWYgbGluZXdpc2VQYXN0ZVxuICAgICAgQHBhc3RlTGluZXdpc2Uoc2VsZWN0aW9uLCB0ZXh0KVxuICAgIGVsc2VcbiAgICAgIEBwYXN0ZUNoYXJhY3Rlcndpc2Uoc2VsZWN0aW9uLCB0ZXh0KVxuXG4gIHBhc3RlQ2hhcmFjdGVyd2lzZTogKHNlbGVjdGlvbiwgdGV4dCkgLT5cbiAgICB7Y3Vyc29yfSA9IHNlbGVjdGlvblxuICAgIGlmIHNlbGVjdGlvbi5pc0VtcHR5KCkgYW5kIEBsb2NhdGlvbiBpcyAnYWZ0ZXInIGFuZCBub3QgaXNFbXB0eVJvdyhAZWRpdG9yLCBjdXJzb3IuZ2V0QnVmZmVyUm93KCkpXG4gICAgICBjdXJzb3IubW92ZVJpZ2h0KClcbiAgICByZXR1cm4gc2VsZWN0aW9uLmluc2VydFRleHQodGV4dClcblxuICAjIFJldHVybiBuZXdSYW5nZVxuICBwYXN0ZUxpbmV3aXNlOiAoc2VsZWN0aW9uLCB0ZXh0KSAtPlxuICAgIHtjdXJzb3J9ID0gc2VsZWN0aW9uXG4gICAgY3Vyc29yUm93ID0gY3Vyc29yLmdldEJ1ZmZlclJvdygpXG4gICAgdGV4dCArPSBcIlxcblwiIHVubGVzcyB0ZXh0LmVuZHNXaXRoKFwiXFxuXCIpXG4gICAgbmV3UmFuZ2UgPSBudWxsXG4gICAgaWYgc2VsZWN0aW9uLmlzRW1wdHkoKVxuICAgICAgaWYgQGxvY2F0aW9uIGlzICdiZWZvcmUnXG4gICAgICAgIG5ld1JhbmdlID0gaW5zZXJ0VGV4dEF0QnVmZmVyUG9zaXRpb24oQGVkaXRvciwgW2N1cnNvclJvdywgMF0sIHRleHQpXG4gICAgICAgIHNldEJ1ZmZlclJvdyhjdXJzb3IsIG5ld1JhbmdlLnN0YXJ0LnJvdylcbiAgICAgIGVsc2UgaWYgQGxvY2F0aW9uIGlzICdhZnRlcidcbiAgICAgICAgdGFyZ2V0Um93ID0gQGdldEZvbGRFbmRSb3dGb3JSb3coY3Vyc29yUm93KVxuICAgICAgICBlbnN1cmVFbmRzV2l0aE5ld0xpbmVGb3JCdWZmZXJSb3coQGVkaXRvciwgdGFyZ2V0Um93KVxuICAgICAgICBuZXdSYW5nZSA9IGluc2VydFRleHRBdEJ1ZmZlclBvc2l0aW9uKEBlZGl0b3IsIFt0YXJnZXRSb3cgKyAxLCAwXSwgdGV4dClcbiAgICBlbHNlXG4gICAgICBzZWxlY3Rpb24uaW5zZXJ0VGV4dChcIlxcblwiKSB1bmxlc3MgQGlzTW9kZSgndmlzdWFsJywgJ2xpbmV3aXNlJylcbiAgICAgIG5ld1JhbmdlID0gc2VsZWN0aW9uLmluc2VydFRleHQodGV4dClcblxuICAgIHJldHVybiBuZXdSYW5nZVxuXG5jbGFzcyBQdXRBZnRlciBleHRlbmRzIFB1dEJlZm9yZVxuICBAZXh0ZW5kKClcbiAgbG9jYXRpb246ICdhZnRlcidcblxuY2xhc3MgUHV0QmVmb3JlV2l0aEF1dG9JbmRlbnQgZXh0ZW5kcyBQdXRCZWZvcmVcbiAgQGV4dGVuZCgpXG5cbiAgcGFzdGVMaW5ld2lzZTogKHNlbGVjdGlvbiwgdGV4dCkgLT5cbiAgICBuZXdSYW5nZSA9IHN1cGVyXG4gICAgYWRqdXN0SW5kZW50V2l0aEtlZXBpbmdMYXlvdXQoQGVkaXRvciwgbmV3UmFuZ2UpXG4gICAgcmV0dXJuIG5ld1JhbmdlXG5cbmNsYXNzIFB1dEFmdGVyV2l0aEF1dG9JbmRlbnQgZXh0ZW5kcyBQdXRCZWZvcmVXaXRoQXV0b0luZGVudFxuICBAZXh0ZW5kKClcbiAgbG9jYXRpb246ICdhZnRlcidcblxuY2xhc3MgQWRkQmxhbmtMaW5lQmVsb3cgZXh0ZW5kcyBPcGVyYXRvclxuICBAZXh0ZW5kKClcbiAgZmxhc2hUYXJnZXQ6IGZhbHNlXG4gIHRhcmdldDogXCJFbXB0eVwiXG4gIHN0YXlBdFNhbWVQb3NpdGlvbjogdHJ1ZVxuICBzdGF5QnlNYXJrZXI6IHRydWVcbiAgd2hlcmU6ICdiZWxvdydcblxuICBtdXRhdGVTZWxlY3Rpb246IChzZWxlY3Rpb24pIC0+XG4gICAgcm93ID0gc2VsZWN0aW9uLmdldEhlYWRCdWZmZXJQb3NpdGlvbigpLnJvd1xuICAgIHJvdyArPSAxIGlmIEB3aGVyZSBpcyAnYmVsb3cnXG4gICAgcG9pbnQgPSBbcm93LCAwXVxuICAgIEBlZGl0b3Iuc2V0VGV4dEluQnVmZmVyUmFuZ2UoW3BvaW50LCBwb2ludF0sIFwiXFxuXCIucmVwZWF0KEBnZXRDb3VudCgpKSlcblxuY2xhc3MgQWRkQmxhbmtMaW5lQWJvdmUgZXh0ZW5kcyBBZGRCbGFua0xpbmVCZWxvd1xuICBAZXh0ZW5kKClcbiAgd2hlcmU6ICdhYm92ZSdcbiJdfQ==
