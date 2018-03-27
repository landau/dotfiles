(function() {
  var AddBlankLineAbove, AddBlankLineBelow, AddPresetOccurrenceFromLastOccurrencePattern, Base, CreatePersistentSelection, Decrease, DecrementNumber, Delete, DeleteLeft, DeleteLine, DeleteRight, DeleteToLastCharacterOfLine, Increase, IncrementNumber, Operator, PutAfter, PutAfterWithAutoIndent, PutBefore, PutBeforeWithAutoIndent, Select, SelectLatestChange, SelectOccurrence, SelectPersistentSelection, SelectPreviousSelection, TogglePersistentSelection, TogglePresetOccurrence, TogglePresetSubwordOccurrence, Yank, YankLine, YankToLastCharacterOfLine, _, adjustIndentWithKeepingLayout, ensureEndsWithNewLineForBufferRow, getSubwordPatternAtBufferPosition, getWordPatternAtBufferPosition, insertTextAtBufferPosition, isEmptyRow, isSingleLineText, moveCursorToFirstCharacterAtRow, ref, setBufferRow,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  _ = require('underscore-plus');

  ref = require('./utils'), isEmptyRow = ref.isEmptyRow, getWordPatternAtBufferPosition = ref.getWordPatternAtBufferPosition, getSubwordPatternAtBufferPosition = ref.getSubwordPatternAtBufferPosition, insertTextAtBufferPosition = ref.insertTextAtBufferPosition, setBufferRow = ref.setBufferRow, moveCursorToFirstCharacterAtRow = ref.moveCursorToFirstCharacterAtRow, ensureEndsWithNewLineForBufferRow = ref.ensureEndsWithNewLineForBufferRow, adjustIndentWithKeepingLayout = ref.adjustIndentWithKeepingLayout, isSingleLineText = ref.isSingleLineText;

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

    Operator.prototype.setTarget = function(target1) {
      this.target = target1;
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
        this.vimState.register.set(null, {
          text: text,
          selection: selection
        });
        if (this.vimState.register.isUnnamed()) {
          if (this["instanceof"]("Delete") || this["instanceof"]("Change")) {
            if (!this.needSaveToNumberedRegister(this.target) && isSingleLineText(text)) {
              return this.vimState.register.set('-', {
                text: text,
                selection: selection
              });
            } else {
              return this.vimState.register.set('1', {
                text: text,
                selection: selection
              });
            }
          } else if (this["instanceof"]("Yank")) {
            return this.vimState.register.set('0', {
              text: text,
              selection: selection
            });
          }
        }
      }
    };

    Operator.prototype.needSaveToNumberedRegister = function(target) {
      var goesToNumberedRegisterMotionNames;
      goesToNumberedRegisterMotionNames = ["MoveToPair", "MoveToNextSentence", "Search", "MoveToNextParagraph"];
      return goesToNumberedRegisterMotionNames.some(function(name) {
        return target["instanceof"](name);
      });
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
      var ref1;
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
        this.occurrenceWise = (ref1 = this.wise) != null ? ref1 : "characterwise";
        if (this.occurrenceManager.select(this.occurrenceWise)) {
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
      wise = this.occurrenceSelected ? this.occurrenceWise : this.target.wise;
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
      return Delete.__super__.constructor.apply(this, arguments);
    }

    Delete.extend();

    Delete.prototype.trackChange = true;

    Delete.prototype.flashCheckpoint = 'did-select-occurrence';

    Delete.prototype.flashTypeForOccurrence = 'operator-remove-occurrence';

    Delete.prototype.stayOptionName = 'stayOnDelete';

    Delete.prototype.setToFirstCharacterOnLinewise = true;

    Delete.prototype.execute = function() {
      this.onDidSelectTarget((function(_this) {
        return function() {
          if (_this.occurrenceSelected && _this.occurrenceWise === "linewise") {
            return _this.flashTarget = false;
          }
        };
      })(this));
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

    DeleteLine.prototype.flashTarget = false;

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

    PutBefore.prototype.flashTarget = false;

    PutBefore.prototype.trackChange = false;

    PutBefore.prototype.initialize = function() {
      return this.vimState.sequentialPasteManager.onInitialize(this);
    };

    PutBefore.prototype.execute = function() {
      this.mutationsBySelection = new Map();
      this.sequentialPaste = this.vimState.sequentialPasteManager.onExecute(this);
      this.onDidFinishMutation((function(_this) {
        return function() {
          if (!_this.cancelled) {
            return _this.adjustCursorPosition();
          }
        };
      })(this));
      PutBefore.__super__.execute.apply(this, arguments);
      if (this.cancelled) {
        return;
      }
      return this.onDidFinishOperation((function(_this) {
        return function() {
          var newRange, ref1, toRange;
          if (newRange = _this.mutationsBySelection.get(_this.editor.getLastSelection())) {
            _this.setMarkForChange(newRange);
          }
          if (_this.getConfig('flashOnOperate') && (ref1 = _this.name, indexOf.call(_this.getConfig('flashOnOperateBlacklist'), ref1) < 0)) {
            toRange = function(selection) {
              return _this.mutationsBySelection.get(selection);
            };
            return _this.vimState.flash(_this.editor.getSelections().map(toRange), {
              type: _this.getFlashType()
            });
          }
        };
      })(this));
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
      ref1 = this.vimState.register.get(null, selection, this.sequentialPaste), text = ref1.text, type = ref1.type;
      if (!text) {
        this.cancelled = true;
        return;
      }
      text = _.multiplyString(text, this.getCount());
      this.linewisePaste = type === 'linewise' || this.isMode('visual', 'linewise');
      newRange = this.paste(selection, text, {
        linewisePaste: this.linewisePaste
      });
      this.mutationsBySelection.set(selection, newRange);
      return this.vimState.sequentialPasteManager.savePastedRangeForSelection(selection, newRange);
    };

    PutBefore.prototype.paste = function(selection, text, arg) {
      var linewisePaste;
      linewisePaste = arg.linewisePaste;
      if (this.sequentialPaste) {
        return this.pasteCharacterwise(selection, text);
      } else if (linewisePaste) {
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
      var cursor, cursorRow, targetRow;
      cursor = selection.cursor;
      cursorRow = cursor.getBufferRow();
      if (!text.endsWith("\n")) {
        text += "\n";
      }
      if (selection.isEmpty()) {
        if (this.location === 'before') {
          return insertTextAtBufferPosition(this.editor, [cursorRow, 0], text);
        } else if (this.location === 'after') {
          targetRow = this.getFoldEndRowForRow(cursorRow);
          ensureEndsWithNewLineForBufferRow(this.editor, targetRow);
          return insertTextAtBufferPosition(this.editor, [targetRow + 1, 0], text);
        }
      } else {
        if (!this.isMode('visual', 'linewise')) {
          selection.insertText("\n");
        }
        return selection.insertText(text);
      }
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvb3BlcmF0b3IuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSx3eEJBQUE7SUFBQTs7OztFQUFBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVI7O0VBQ0osTUFVSSxPQUFBLENBQVEsU0FBUixDQVZKLEVBQ0UsMkJBREYsRUFFRSxtRUFGRixFQUdFLHlFQUhGLEVBSUUsMkRBSkYsRUFLRSwrQkFMRixFQU1FLHFFQU5GLEVBT0UseUVBUEYsRUFRRSxpRUFSRixFQVNFOztFQUVGLElBQUEsR0FBTyxPQUFBLENBQVEsUUFBUjs7RUFFRDs7O0lBQ0osUUFBQyxDQUFBLE1BQUQsQ0FBUSxLQUFSOztJQUNBLFFBQUMsQ0FBQSxhQUFELEdBQWdCOzt1QkFDaEIsYUFBQSxHQUFlOzt1QkFDZixVQUFBLEdBQVk7O3VCQUVaLElBQUEsR0FBTTs7dUJBQ04sVUFBQSxHQUFZOzt1QkFDWixjQUFBLEdBQWdCOzt1QkFFaEIsV0FBQSxHQUFhOzt1QkFDYixlQUFBLEdBQWlCOzt1QkFDakIsU0FBQSxHQUFXOzt1QkFDWCxzQkFBQSxHQUF3Qjs7dUJBQ3hCLFdBQUEsR0FBYTs7dUJBRWIsb0JBQUEsR0FBc0I7O3VCQUN0QixrQkFBQSxHQUFvQjs7dUJBQ3BCLGNBQUEsR0FBZ0I7O3VCQUNoQixZQUFBLEdBQWM7O3VCQUNkLGdCQUFBLEdBQWtCOzt1QkFDbEIsNkJBQUEsR0FBK0I7O3VCQUUvQixzQkFBQSxHQUF3Qjs7dUJBQ3hCLHlCQUFBLEdBQTJCOzt1QkFFM0IseUJBQUEsR0FBMkI7O3VCQUMzQixxQkFBQSxHQUF1Qjs7dUJBSXZCLGtCQUFBLEdBQW9COzt1QkFDcEIsY0FBQSxHQUFnQjs7dUJBQ2hCLGNBQUEsR0FBZ0IsU0FBQTthQUNkLElBQUMsQ0FBQSxrQkFBRCxJQUF3QixDQUFJLElBQUMsQ0FBQTtJQURmOzt1QkFNaEIsVUFBQSxHQUFZLFNBQUE7TUFDVixJQUFDLENBQUEsY0FBRCxHQUFrQjthQUNsQixJQUFDLENBQUEsa0JBQUQsR0FBc0I7SUFGWjs7dUJBT1osc0JBQUEsR0FBd0IsU0FBQyxPQUFEOztRQUN0QixJQUFDLENBQUEsNEJBQTZCOzthQUM5QixJQUFDLENBQUEseUJBQTBCLENBQUEsT0FBQSxDQUEzQixHQUFzQyxJQUFDLENBQUEsTUFBTSxDQUFDLGdCQUFSLENBQUE7SUFGaEI7O3VCQUl4QixtQkFBQSxHQUFxQixTQUFDLE9BQUQ7QUFDbkIsVUFBQTttRUFBNEIsQ0FBQSxPQUFBO0lBRFQ7O3VCQUdyQixzQkFBQSxHQUF3QixTQUFDLE9BQUQ7TUFDdEIsSUFBRyxzQ0FBSDtlQUNFLE9BQU8sSUFBQyxDQUFBLHlCQUEwQixDQUFBLE9BQUEsRUFEcEM7O0lBRHNCOzt1QkFJeEIsaUNBQUEsR0FBbUMsU0FBQyxPQUFEO0FBQ2pDLFVBQUE7TUFBQSxJQUFHLFVBQUEsR0FBYSxJQUFDLENBQUEsbUJBQUQsQ0FBcUIsT0FBckIsQ0FBaEI7UUFDRSxJQUFDLENBQUEsTUFBTSxDQUFDLDJCQUFSLENBQW9DLFVBQXBDO2VBQ0EsSUFBQyxDQUFBLHNCQUFELENBQXdCLE9BQXhCLEVBRkY7O0lBRGlDOzt1QkFLbkMsZ0JBQUEsR0FBa0IsU0FBQyxLQUFEO01BQ2hCLElBQUMsQ0FBQSxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQWYsQ0FBbUIsR0FBbkIsRUFBd0IsS0FBSyxDQUFDLEtBQTlCO2FBQ0EsSUFBQyxDQUFBLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBZixDQUFtQixHQUFuQixFQUF3QixLQUFLLENBQUMsR0FBOUI7SUFGZ0I7O3VCQUlsQixTQUFBLEdBQVcsU0FBQTtBQUNULFVBQUE7YUFBQSxJQUFDLENBQUEsV0FBRCxJQUFpQixJQUFDLENBQUEsU0FBRCxDQUFXLGdCQUFYLENBQWpCLElBQ0UsUUFBQyxJQUFDLENBQUEsSUFBRCxFQUFBLGFBQWEsSUFBQyxDQUFBLFNBQUQsQ0FBVyx5QkFBWCxDQUFiLEVBQUEsSUFBQSxLQUFELENBREYsSUFFRSxDQUFDLENBQUMsSUFBQyxDQUFBLElBQUQsS0FBVyxRQUFaLENBQUEsSUFBeUIsQ0FBQyxJQUFDLENBQUEsT0FBRCxLQUFjLElBQUMsQ0FBQSxNQUFNLENBQUMsSUFBdkIsQ0FBMUI7SUFITzs7dUJBS1gsZ0JBQUEsR0FBa0IsU0FBQyxNQUFEO01BQ2hCLElBQUcsSUFBQyxDQUFBLFNBQUQsQ0FBQSxDQUFIO2VBQ0UsSUFBQyxDQUFBLFFBQVEsQ0FBQyxLQUFWLENBQWdCLE1BQWhCLEVBQXdCO1VBQUEsSUFBQSxFQUFNLElBQUMsQ0FBQSxZQUFELENBQUEsQ0FBTjtTQUF4QixFQURGOztJQURnQjs7dUJBSWxCLHNCQUFBLEdBQXdCLFNBQUE7TUFDdEIsSUFBRyxJQUFDLENBQUEsU0FBRCxDQUFBLENBQUg7ZUFDRSxJQUFDLENBQUEsb0JBQUQsQ0FBc0IsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQTtBQUNwQixnQkFBQTtZQUFBLE1BQUEsR0FBUyxLQUFDLENBQUEsZUFBZSxDQUFDLG9DQUFqQixDQUFzRCxLQUFDLENBQUEsZUFBdkQ7bUJBQ1QsS0FBQyxDQUFBLFFBQVEsQ0FBQyxLQUFWLENBQWdCLE1BQWhCLEVBQXdCO2NBQUEsSUFBQSxFQUFNLEtBQUMsQ0FBQSxZQUFELENBQUEsQ0FBTjthQUF4QjtVQUZvQjtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBdEIsRUFERjs7SUFEc0I7O3VCQU14QixZQUFBLEdBQWMsU0FBQTtNQUNaLElBQUcsSUFBQyxDQUFBLGtCQUFKO2VBQ0UsSUFBQyxDQUFBLHVCQURIO09BQUEsTUFBQTtlQUdFLElBQUMsQ0FBQSxVQUhIOztJQURZOzt1QkFNZCxzQkFBQSxHQUF3QixTQUFBO01BQ3RCLElBQUEsQ0FBYyxJQUFDLENBQUEsV0FBZjtBQUFBLGVBQUE7O2FBRUEsSUFBQyxDQUFBLG9CQUFELENBQXNCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtBQUNwQixjQUFBO1VBQUEsSUFBRyxLQUFBLEdBQVEsS0FBQyxDQUFBLGVBQWUsQ0FBQyxpQ0FBakIsQ0FBbUQsS0FBQyxDQUFBLE1BQU0sQ0FBQyxnQkFBUixDQUFBLENBQW5ELENBQVg7bUJBQ0UsS0FBQyxDQUFBLGdCQUFELENBQWtCLEtBQWxCLEVBREY7O1FBRG9CO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF0QjtJQUhzQjs7SUFPWCxrQkFBQTtBQUNYLFVBQUE7TUFBQSwyQ0FBQSxTQUFBO01BQ0EsT0FBK0QsSUFBQyxDQUFBLFFBQWhFLEVBQUMsSUFBQyxDQUFBLHVCQUFBLGVBQUYsRUFBbUIsSUFBQyxDQUFBLHlCQUFBLGlCQUFwQixFQUF1QyxJQUFDLENBQUEsMkJBQUE7TUFDeEMsSUFBQyxDQUFBLHVDQUFELENBQUE7TUFDQSxJQUFDLENBQUEsVUFBRCxDQUFBO01BQ0EsSUFBQyxDQUFBLHdCQUFELENBQTBCLElBQUMsQ0FBQSxXQUFXLENBQUMsSUFBYixDQUFrQixJQUFsQixDQUExQjtNQUdBLElBQUcsSUFBQyxDQUFBLHNCQUFELElBQTRCLElBQUMsQ0FBQSxpQkFBaUIsQ0FBQyxVQUFuQixDQUFBLENBQS9CO1FBQ0UsSUFBQyxDQUFBLFVBQUQsR0FBYyxLQURoQjs7TUFPQSxJQUFHLElBQUMsQ0FBQSxVQUFELElBQWdCLENBQUksSUFBQyxDQUFBLGlCQUFpQixDQUFDLFVBQW5CLENBQUEsQ0FBdkI7UUFDRSxJQUFDLENBQUEsaUJBQWlCLENBQUMsVUFBbkIscURBQXNELElBQUMsQ0FBQSwyQkFBRCxDQUE2QixJQUFDLENBQUEsY0FBOUIsQ0FBdEQsRUFERjs7TUFLQSxJQUFHLElBQUMsQ0FBQSxvQ0FBRCxDQUFBLENBQUg7UUFFRSxJQUFPLElBQUMsQ0FBQSxJQUFELEtBQVMsUUFBaEI7VUFDRSxJQUFDLENBQUEsUUFBUSxDQUFDLFdBQVcsQ0FBQyxRQUF0QixDQUErQixRQUEvQixFQUF5QyxJQUFDLENBQUEsS0FBSyxDQUFDLFVBQVAsQ0FBa0IsSUFBQyxDQUFBLE1BQW5CLENBQXpDLEVBREY7U0FGRjs7TUFLQSxJQUFnQyxJQUFDLENBQUEsSUFBRCxLQUFTLFFBQVQsSUFBc0IsSUFBQyxDQUFBLGFBQXZEO1FBQUEsSUFBQyxDQUFBLE1BQUQsR0FBVSxtQkFBVjs7TUFDQSxJQUE2QixDQUFDLENBQUMsUUFBRixDQUFXLElBQUMsQ0FBQSxNQUFaLENBQTdCO1FBQUEsSUFBQyxDQUFBLFNBQUQsQ0FBVyxJQUFDLEVBQUEsR0FBQSxFQUFELENBQUssSUFBQyxDQUFBLE1BQU4sQ0FBWCxFQUFBOztJQTFCVzs7dUJBNEJiLHVDQUFBLEdBQXlDLFNBQUE7TUFLdkMsSUFBRyxJQUFDLENBQUEsVUFBRCxJQUFnQixDQUFJLElBQUMsQ0FBQSxpQkFBaUIsQ0FBQyxVQUFuQixDQUFBLENBQXZCO2VBQ0UsSUFBQyxDQUFBLHdCQUFELENBQTBCLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUE7bUJBQUcsS0FBQyxDQUFBLGlCQUFpQixDQUFDLGFBQW5CLENBQUE7VUFBSDtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBMUIsRUFERjs7SUFMdUM7O3VCQVF6QyxXQUFBLEdBQWEsU0FBQyxPQUFEO0FBQ1gsVUFBQTtNQUFBLElBQUcsb0JBQUg7UUFDRSxJQUFDLENBQUEsSUFBRCxHQUFRLE9BQU8sQ0FBQztBQUNoQixlQUZGOztNQUlBLElBQUcsMEJBQUg7UUFDRSxJQUFDLENBQUEsVUFBRCxHQUFjLE9BQU8sQ0FBQztRQUN0QixJQUFHLElBQUMsQ0FBQSxVQUFKO1VBQ0UsSUFBQyxDQUFBLGNBQUQsR0FBa0IsT0FBTyxDQUFDO1VBRzFCLE9BQUEsR0FBVSxJQUFDLENBQUEsMkJBQUQsQ0FBNkIsSUFBQyxDQUFBLGNBQTlCO1VBQ1YsSUFBQyxDQUFBLGlCQUFpQixDQUFDLFVBQW5CLENBQThCLE9BQTlCLEVBQXVDO1lBQUMsS0FBQSxFQUFPLElBQVI7WUFBZSxnQkFBRCxJQUFDLENBQUEsY0FBZjtXQUF2QztpQkFDQSxJQUFDLENBQUEsd0JBQUQsQ0FBMEIsQ0FBQSxTQUFBLEtBQUE7bUJBQUEsU0FBQTtxQkFBRyxLQUFDLENBQUEsaUJBQWlCLENBQUMsYUFBbkIsQ0FBQTtZQUFIO1VBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUExQixFQU5GO1NBRkY7O0lBTFc7O3VCQWdCYixvQ0FBQSxHQUFzQyxTQUFBO0FBQ3BDLFVBQUE7TUFBQSxJQUFHLElBQUMsQ0FBQSx5QkFBRCxJQUNDLElBQUMsQ0FBQSxTQUFELENBQVcsd0NBQVgsQ0FERCxJQUVDLENBQUksSUFBQyxDQUFBLG1CQUFtQixDQUFDLE9BQXJCLENBQUEsQ0FGUjtRQUlFLElBQUMsQ0FBQSxtQkFBbUIsQ0FBQyxNQUFyQixDQUFBO1FBQ0EsSUFBQyxDQUFBLE1BQU0sQ0FBQywyQkFBUixDQUFBO0FBQ0E7QUFBQSxhQUFBLHNDQUFBOztjQUFxRCxDQUFJLFVBQVUsQ0FBQyxhQUFYLENBQUE7WUFDdkQsVUFBVSxDQUFDLGNBQVgsQ0FBQTs7QUFERjtlQUVBLEtBUkY7T0FBQSxNQUFBO2VBVUUsTUFWRjs7SUFEb0M7O3VCQWF0QywyQkFBQSxHQUE2QixTQUFDLGNBQUQ7QUFDM0IsY0FBTyxjQUFQO0FBQUEsYUFDTyxNQURQO2lCQUVJLDhCQUFBLENBQStCLElBQUMsQ0FBQSxNQUFoQyxFQUF3QyxJQUFDLENBQUEsdUJBQUQsQ0FBQSxDQUF4QztBQUZKLGFBR08sU0FIUDtpQkFJSSxpQ0FBQSxDQUFrQyxJQUFDLENBQUEsTUFBbkMsRUFBMkMsSUFBQyxDQUFBLHVCQUFELENBQUEsQ0FBM0M7QUFKSjtJQUQyQjs7dUJBUTdCLFNBQUEsR0FBVyxTQUFDLE9BQUQ7TUFBQyxJQUFDLENBQUEsU0FBRDtNQUNWLElBQUMsQ0FBQSxNQUFNLENBQUMsUUFBUixHQUFtQjtNQUNuQixJQUFDLENBQUEsZ0JBQUQsQ0FBa0IsSUFBbEI7TUFFQSxJQUFHLElBQUMsQ0FBQSxjQUFELENBQUEsQ0FBSDtRQUNFLElBQUMsQ0FBQSw4QkFBRCxDQUFBO1FBQ0EsSUFBQyxDQUFBLHNCQUFELENBQXdCLE1BQXhCO1FBQ0EsSUFBQyxDQUFBLFlBQUQsQ0FBQSxFQUhGOzthQUlBO0lBUlM7O3VCQVVYLDZCQUFBLEdBQStCLFNBQUMsU0FBRDthQUM3QixJQUFDLENBQUEsaUJBQUQsQ0FBbUIsU0FBUyxDQUFDLE9BQVYsQ0FBQSxDQUFuQixFQUF3QyxTQUF4QztJQUQ2Qjs7dUJBRy9CLGlCQUFBLEdBQW1CLFNBQUMsSUFBRCxFQUFPLFNBQVA7TUFDakIsSUFBaUIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxVQUFSLENBQUEsQ0FBQSxJQUF5QixDQUFDLENBQUksSUFBSSxDQUFDLFFBQUwsQ0FBYyxJQUFkLENBQUwsQ0FBMUM7UUFBQSxJQUFBLElBQVEsS0FBUjs7TUFDQSxJQUFHLElBQUg7UUFDRSxJQUFDLENBQUEsUUFBUSxDQUFDLFFBQVEsQ0FBQyxHQUFuQixDQUF1QixJQUF2QixFQUE2QjtVQUFDLE1BQUEsSUFBRDtVQUFPLFdBQUEsU0FBUDtTQUE3QjtRQUVBLElBQUcsSUFBQyxDQUFBLFFBQVEsQ0FBQyxRQUFRLENBQUMsU0FBbkIsQ0FBQSxDQUFIO1VBQ0UsSUFBRyxJQUFDLEVBQUEsVUFBQSxFQUFELENBQVksUUFBWixDQUFBLElBQXlCLElBQUMsRUFBQSxVQUFBLEVBQUQsQ0FBWSxRQUFaLENBQTVCO1lBQ0UsSUFBRyxDQUFJLElBQUMsQ0FBQSwwQkFBRCxDQUE0QixJQUFDLENBQUEsTUFBN0IsQ0FBSixJQUE2QyxnQkFBQSxDQUFpQixJQUFqQixDQUFoRDtxQkFDRSxJQUFDLENBQUEsUUFBUSxDQUFDLFFBQVEsQ0FBQyxHQUFuQixDQUF1QixHQUF2QixFQUE0QjtnQkFBQyxNQUFBLElBQUQ7Z0JBQU8sV0FBQSxTQUFQO2VBQTVCLEVBREY7YUFBQSxNQUFBO3FCQUdFLElBQUMsQ0FBQSxRQUFRLENBQUMsUUFBUSxDQUFDLEdBQW5CLENBQXVCLEdBQXZCLEVBQTRCO2dCQUFDLE1BQUEsSUFBRDtnQkFBTyxXQUFBLFNBQVA7ZUFBNUIsRUFIRjthQURGO1dBQUEsTUFNSyxJQUFHLElBQUMsRUFBQSxVQUFBLEVBQUQsQ0FBWSxNQUFaLENBQUg7bUJBQ0gsSUFBQyxDQUFBLFFBQVEsQ0FBQyxRQUFRLENBQUMsR0FBbkIsQ0FBdUIsR0FBdkIsRUFBNEI7Y0FBQyxNQUFBLElBQUQ7Y0FBTyxXQUFBLFNBQVA7YUFBNUIsRUFERztXQVBQO1NBSEY7O0lBRmlCOzt1QkFlbkIsMEJBQUEsR0FBNEIsU0FBQyxNQUFEO0FBRzFCLFVBQUE7TUFBQSxpQ0FBQSxHQUFvQyxDQUNsQyxZQURrQyxFQUVsQyxvQkFGa0MsRUFHbEMsUUFIa0MsRUFJbEMscUJBSmtDO2FBTXBDLGlDQUFpQyxDQUFDLElBQWxDLENBQXVDLFNBQUMsSUFBRDtlQUFVLE1BQU0sRUFBQyxVQUFELEVBQU4sQ0FBa0IsSUFBbEI7TUFBVixDQUF2QztJQVQwQjs7dUJBVzVCLDhCQUFBLEdBQWdDLFNBQUE7QUFDOUIsVUFBQTtNQUFBLHdDQUFVLENBQUUsUUFBVCxDQUFBLFdBQUEsSUFBd0IsQ0FBQyxJQUFDLENBQUEsSUFBRCxLQUFTLFFBQVYsQ0FBM0I7ZUFDRSxJQUFDLENBQUEsS0FBSyxDQUFDLFNBQVAsQ0FBaUIsSUFBQyxDQUFBLE1BQWxCLEVBREY7O0lBRDhCOzt1QkFJaEMsYUFBQSxHQUFlLFNBQUMsRUFBRDtNQUNiLElBQUcsSUFBQyxDQUFBLGNBQUQsQ0FBQSxDQUFIO1FBR0UsRUFBQSxDQUFBO1FBQ0EsSUFBQyxDQUFBLHNCQUFELENBQUE7UUFDQSxJQUFDLENBQUEsaUNBQUQsQ0FBbUMsTUFBbkMsRUFMRjtPQUFBLE1BQUE7UUFRRSxJQUFDLENBQUEsOEJBQUQsQ0FBQTtRQUNBLElBQUMsQ0FBQSxNQUFNLENBQUMsUUFBUixDQUFpQixDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFBO1lBQ2YsRUFBQSxDQUFBO21CQUNBLEtBQUMsQ0FBQSxzQkFBRCxDQUFBO1VBRmU7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWpCLEVBVEY7O2FBYUEsSUFBQyxDQUFBLHFCQUFELENBQUE7SUFkYTs7dUJBaUJmLE9BQUEsR0FBUyxTQUFBO01BQ1AsSUFBQyxDQUFBLGFBQUQsQ0FBZSxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7QUFDYixjQUFBO1VBQUEsSUFBRyxLQUFDLENBQUEsWUFBRCxDQUFBLENBQUg7WUFDRSxJQUFHLEtBQUMsQ0FBQSxxQkFBSjtjQUNFLFVBQUEsR0FBYSxLQUFDLENBQUEsTUFBTSxDQUFDLG9DQUFSLENBQUEsRUFEZjthQUFBLE1BQUE7Y0FHRSxVQUFBLEdBQWEsS0FBQyxDQUFBLE1BQU0sQ0FBQyxhQUFSLENBQUEsRUFIZjs7QUFJQSxpQkFBQSw0Q0FBQTs7Y0FDRSxLQUFDLENBQUEsZUFBRCxDQUFpQixTQUFqQjtBQURGO1lBRUEsS0FBQyxDQUFBLGVBQWUsQ0FBQyxhQUFqQixDQUErQixZQUEvQjttQkFDQSxLQUFDLENBQUEsaUNBQUQsQ0FBQSxFQVJGOztRQURhO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFmO2FBYUEsSUFBQyxDQUFBLFlBQUQsQ0FBYyxRQUFkO0lBZE87O3VCQWlCVCxZQUFBLEdBQWMsU0FBQTtBQUNaLFVBQUE7TUFBQSxJQUEwQiwyQkFBMUI7QUFBQSxlQUFPLElBQUMsQ0FBQSxlQUFSOztNQUNBLElBQUMsQ0FBQSxlQUFlLENBQUMsSUFBakIsQ0FBc0I7UUFBRSxjQUFELElBQUMsQ0FBQSxZQUFGO09BQXRCO01BRUEsSUFBNEIsaUJBQTVCO1FBQUEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxTQUFSLENBQWtCLElBQUMsQ0FBQSxJQUFuQixFQUFBOztNQUNBLElBQUMsQ0FBQSxvQkFBRCxDQUFBO01BSUEsSUFBQyxDQUFBLGVBQWUsQ0FBQyxhQUFqQixDQUErQixhQUEvQjtNQU1BLElBQUcsSUFBQyxDQUFBLFFBQUQsSUFBYyxJQUFDLENBQUEsVUFBZixJQUE4QixDQUFJLElBQUMsQ0FBQSxpQkFBaUIsQ0FBQyxVQUFuQixDQUFBLENBQXJDO1FBQ0UsSUFBQyxDQUFBLGlCQUFpQixDQUFDLFVBQW5CLENBQThCLElBQUMsQ0FBQSxvQkFBL0IsRUFBcUQ7VUFBRSxnQkFBRCxJQUFDLENBQUEsY0FBRjtTQUFyRCxFQURGOztNQUdBLElBQUMsQ0FBQSxNQUFNLENBQUMsT0FBUixDQUFBO01BRUEsSUFBQyxDQUFBLGVBQWUsQ0FBQyxhQUFqQixDQUErQixZQUEvQjtNQUNBLElBQUcsSUFBQyxDQUFBLFVBQUo7O1VBR0UsSUFBQyxDQUFBLHVCQUF3QixJQUFDLENBQUEsaUJBQWlCLENBQUMsWUFBbkIsQ0FBQTs7UUFFekIsSUFBQyxDQUFBLGNBQUQsdUNBQTBCO1FBQzFCLElBQUcsSUFBQyxDQUFBLGlCQUFpQixDQUFDLE1BQW5CLENBQTBCLElBQUMsQ0FBQSxjQUEzQixDQUFIO1VBQ0UsSUFBQyxDQUFBLGtCQUFELEdBQXNCO1VBQ3RCLElBQUMsQ0FBQSxlQUFlLENBQUMsYUFBakIsQ0FBK0IsdUJBQS9CLEVBRkY7U0FORjs7TUFVQSxJQUFHLElBQUMsQ0FBQSxjQUFELEdBQWtCLElBQUMsQ0FBQSxRQUFRLENBQUMseUJBQVYsQ0FBQSxDQUFBLElBQXlDLElBQUMsQ0FBQSxNQUFNLENBQUMsSUFBUixLQUFnQixPQUE5RTtRQUNFLElBQUMsQ0FBQSxtQkFBRCxDQUFBO1FBQ0EsSUFBQyxDQUFBLHNCQUFELENBQUE7UUFDQSxJQUFDLENBQUEsc0JBQUQsQ0FBQSxFQUhGO09BQUEsTUFBQTtRQUtFLElBQUMsQ0FBQSx1QkFBRCxDQUFBLEVBTEY7O0FBTUEsYUFBTyxJQUFDLENBQUE7SUFyQ0k7O3VCQXVDZCxpQ0FBQSxHQUFtQyxTQUFBO0FBQ2pDLFVBQUE7TUFBQSxJQUFBLENBQWMsSUFBQyxDQUFBLGdCQUFmO0FBQUEsZUFBQTs7TUFDQSxJQUFBLHNEQUE2QixJQUFDLENBQUEsU0FBRCxDQUFXLElBQUMsQ0FBQSxjQUFaLEVBQXRCLElBQXFELENBQUMsSUFBQyxDQUFBLGtCQUFELElBQXdCLElBQUMsQ0FBQSxTQUFELENBQVcsa0JBQVgsQ0FBekI7TUFDNUQsSUFBQSxHQUFVLElBQUMsQ0FBQSxrQkFBSixHQUE0QixJQUFDLENBQUEsY0FBN0IsR0FBaUQsSUFBQyxDQUFBLE1BQU0sQ0FBQzthQUNoRSxJQUFDLENBQUEsZUFBZSxDQUFDLHNCQUFqQixDQUF3QztRQUFDLE1BQUEsSUFBRDtRQUFPLE1BQUEsSUFBUDtRQUFjLCtCQUFELElBQUMsQ0FBQSw2QkFBZDtPQUF4QztJQUppQzs7OztLQTNSZDs7RUE0U2pCOzs7Ozs7O0lBQ0osTUFBQyxDQUFBLE1BQUQsQ0FBUSxLQUFSOztxQkFDQSxXQUFBLEdBQWE7O3FCQUNiLFVBQUEsR0FBWTs7cUJBQ1osc0JBQUEsR0FBd0I7O3FCQUN4Qix5QkFBQSxHQUEyQjs7cUJBRTNCLE9BQUEsR0FBUyxTQUFBO01BQ1AsSUFBQyxDQUFBLGFBQUQsQ0FBZSxJQUFDLENBQUEsWUFBWSxDQUFDLElBQWQsQ0FBbUIsSUFBbkIsQ0FBZjtNQUVBLElBQUcsSUFBQyxDQUFBLE1BQU0sQ0FBQyxZQUFSLENBQUEsQ0FBQSxJQUEyQixJQUFDLENBQUEsTUFBTSxDQUFDLGVBQXRDO1FBQ0UsSUFBQyxDQUFBLE1BQU0sQ0FBQyxzQkFBUixDQUFBO2VBQ0EsSUFBQyxDQUFBLHVCQUFELENBQXlCLFFBQXpCLEVBQW1DLElBQUMsQ0FBQSxNQUFNLENBQUMsSUFBM0MsRUFGRjs7SUFITzs7OztLQVBVOztFQWNmOzs7Ozs7O0lBQ0osa0JBQUMsQ0FBQSxNQUFELENBQUE7O0lBQ0Esa0JBQUMsQ0FBQSxXQUFELEdBQWM7O2lDQUNkLE1BQUEsR0FBUTs7OztLQUh1Qjs7RUFLM0I7Ozs7Ozs7SUFDSix1QkFBQyxDQUFBLE1BQUQsQ0FBQTs7c0NBQ0EsTUFBQSxHQUFROzs7O0tBRjRCOztFQUloQzs7Ozs7OztJQUNKLHlCQUFDLENBQUEsTUFBRCxDQUFBOztJQUNBLHlCQUFDLENBQUEsV0FBRCxHQUFjOzt3Q0FDZCxNQUFBLEdBQVE7Ozs7S0FIOEI7O0VBS2xDOzs7Ozs7O0lBQ0osZ0JBQUMsQ0FBQSxNQUFELENBQUE7O0lBQ0EsZ0JBQUMsQ0FBQSxXQUFELEdBQWM7OytCQUNkLFVBQUEsR0FBWTs7K0JBRVosT0FBQSxHQUFTLFNBQUE7YUFDUCxJQUFDLENBQUEsYUFBRCxDQUFlLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtVQUNiLElBQUcsS0FBQyxDQUFBLFlBQUQsQ0FBQSxDQUFIO21CQUNFLEtBQUMsQ0FBQSx1QkFBRCxDQUF5QixRQUF6QixFQUFtQyxlQUFuQyxFQURGOztRQURhO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFmO0lBRE87Ozs7S0FMb0I7O0VBWXpCOzs7Ozs7O0lBQ0oseUJBQUMsQ0FBQSxNQUFELENBQUE7O3dDQUNBLFdBQUEsR0FBYTs7d0NBQ2Isa0JBQUEsR0FBb0I7O3dDQUNwQixzQkFBQSxHQUF3Qjs7d0NBQ3hCLHlCQUFBLEdBQTJCOzt3Q0FFM0IsZUFBQSxHQUFpQixTQUFDLFNBQUQ7YUFDZixJQUFDLENBQUEsbUJBQW1CLENBQUMsZUFBckIsQ0FBcUMsU0FBUyxDQUFDLGNBQVYsQ0FBQSxDQUFyQztJQURlOzs7O0tBUHFCOztFQVVsQzs7Ozs7OztJQUNKLHlCQUFDLENBQUEsTUFBRCxDQUFBOzt3Q0FFQSxVQUFBLEdBQVksU0FBQTtBQUNWLFVBQUE7TUFBQSxLQUFBLEdBQVEsSUFBQyxDQUFBLE1BQU0sQ0FBQyx1QkFBUixDQUFBO01BQ1IsSUFBQyxDQUFBLGNBQUQsR0FBa0IsSUFBQyxDQUFBLG1CQUFtQixDQUFDLGdCQUFyQixDQUFzQyxLQUF0QztNQUNsQixJQUFHLElBQUMsQ0FBQSxjQUFKO2VBQ0UsS0FERjtPQUFBLE1BQUE7ZUFHRSwyREFBQSxTQUFBLEVBSEY7O0lBSFU7O3dDQVFaLE9BQUEsR0FBUyxTQUFBO01BQ1AsSUFBRyxJQUFDLENBQUEsY0FBSjtlQUNFLElBQUMsQ0FBQSxjQUFjLENBQUMsT0FBaEIsQ0FBQSxFQURGO09BQUEsTUFBQTtlQUdFLHdEQUFBLFNBQUEsRUFIRjs7SUFETzs7OztLQVg2Qjs7RUFtQmxDOzs7Ozs7O0lBQ0osc0JBQUMsQ0FBQSxNQUFELENBQUE7O3FDQUNBLE1BQUEsR0FBUTs7cUNBQ1IsV0FBQSxHQUFhOztxQ0FDYixzQkFBQSxHQUF3Qjs7cUNBQ3hCLHlCQUFBLEdBQTJCOztxQ0FDM0IsY0FBQSxHQUFnQjs7cUNBRWhCLE9BQUEsR0FBUyxTQUFBO0FBQ1AsVUFBQTtNQUFBLElBQUcsTUFBQSxHQUFTLElBQUMsQ0FBQSxpQkFBaUIsQ0FBQyxnQkFBbkIsQ0FBb0MsSUFBQyxDQUFBLE1BQU0sQ0FBQyx1QkFBUixDQUFBLENBQXBDLENBQVo7ZUFDRSxJQUFDLENBQUEsaUJBQWlCLENBQUMsY0FBbkIsQ0FBa0MsQ0FBQyxNQUFELENBQWxDLEVBREY7T0FBQSxNQUFBO1FBR0UsT0FBQSxHQUFVO1FBQ1YsVUFBQSxHQUFhLElBQUMsQ0FBQSxRQUFRLENBQUMsV0FBVyxDQUFDLFVBQXRCLENBQUE7UUFFYixJQUFHLElBQUMsQ0FBQSxJQUFELEtBQVMsUUFBVCxJQUFzQixDQUFJLFVBQTdCO1VBQ0UsSUFBQyxDQUFBLGNBQUQsR0FBa0I7VUFDbEIsT0FBQSxHQUFjLElBQUEsTUFBQSxDQUFPLENBQUMsQ0FBQyxZQUFGLENBQWUsSUFBQyxDQUFBLE1BQU0sQ0FBQyxlQUFSLENBQUEsQ0FBZixDQUFQLEVBQWtELEdBQWxELEVBRmhCO1NBQUEsTUFBQTtVQUlFLE9BQUEsR0FBVSxJQUFDLENBQUEsMkJBQUQsQ0FBNkIsSUFBQyxDQUFBLGNBQTlCLEVBSlo7O1FBTUEsSUFBQyxDQUFBLGlCQUFpQixDQUFDLFVBQW5CLENBQThCLE9BQTlCLEVBQXVDO1VBQUUsZ0JBQUQsSUFBQyxDQUFBLGNBQUY7U0FBdkM7UUFDQSxJQUFDLENBQUEsaUJBQWlCLENBQUMsZUFBbkIsQ0FBbUMsSUFBQyxDQUFBLGNBQXBDO1FBRUEsSUFBQSxDQUErQixVQUEvQjtpQkFBQSxJQUFDLENBQUEsWUFBRCxDQUFjLFFBQWQsRUFBQTtTQWZGOztJQURPOzs7O0tBUjBCOztFQTBCL0I7Ozs7Ozs7SUFDSiw2QkFBQyxDQUFBLE1BQUQsQ0FBQTs7NENBQ0EsY0FBQSxHQUFnQjs7OztLQUYwQjs7RUFLdEM7Ozs7Ozs7SUFDSiw0Q0FBQyxDQUFBLE1BQUQsQ0FBQTs7MkRBQ0EsT0FBQSxHQUFTLFNBQUE7QUFDUCxVQUFBO01BQUEsSUFBQyxDQUFBLGlCQUFpQixDQUFDLGFBQW5CLENBQUE7TUFDQSxJQUFHLE9BQUEsR0FBVSxJQUFDLENBQUEsUUFBUSxDQUFDLFdBQVcsQ0FBQyxHQUF0QixDQUEwQix1QkFBMUIsQ0FBYjtRQUNFLGNBQUEsR0FBaUIsSUFBQyxDQUFBLFFBQVEsQ0FBQyxXQUFXLENBQUMsR0FBdEIsQ0FBMEIsb0JBQTFCO1FBQ2pCLElBQUMsQ0FBQSxpQkFBaUIsQ0FBQyxVQUFuQixDQUE4QixPQUE5QixFQUF1QztVQUFDLGdCQUFBLGNBQUQ7U0FBdkM7ZUFDQSxJQUFDLENBQUEsWUFBRCxDQUFjLFFBQWQsRUFIRjs7SUFGTzs7OztLQUZnRDs7RUFXckQ7Ozs7Ozs7SUFDSixNQUFDLENBQUEsTUFBRCxDQUFBOztxQkFDQSxXQUFBLEdBQWE7O3FCQUNiLGVBQUEsR0FBaUI7O3FCQUNqQixzQkFBQSxHQUF3Qjs7cUJBQ3hCLGNBQUEsR0FBZ0I7O3FCQUNoQiw2QkFBQSxHQUErQjs7cUJBRS9CLE9BQUEsR0FBUyxTQUFBO01BQ1AsSUFBQyxDQUFBLGlCQUFELENBQW1CLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtVQUNqQixJQUF5QixLQUFDLENBQUEsa0JBQUQsSUFBd0IsS0FBQyxDQUFBLGNBQUQsS0FBbUIsVUFBcEU7bUJBQUEsS0FBQyxDQUFBLFdBQUQsR0FBZSxNQUFmOztRQURpQjtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbkI7TUFHQSxJQUE4QixJQUFDLENBQUEsTUFBTSxDQUFDLElBQVIsS0FBZ0IsV0FBOUM7UUFBQSxJQUFDLENBQUEsZ0JBQUQsR0FBb0IsTUFBcEI7O2FBQ0EscUNBQUEsU0FBQTtJQUxPOztxQkFPVCxlQUFBLEdBQWlCLFNBQUMsU0FBRDtNQUNmLElBQUMsQ0FBQSw2QkFBRCxDQUErQixTQUEvQjthQUNBLFNBQVMsQ0FBQyxrQkFBVixDQUFBO0lBRmU7Ozs7S0FmRTs7RUFtQmY7Ozs7Ozs7SUFDSixXQUFDLENBQUEsTUFBRCxDQUFBOzswQkFDQSxNQUFBLEdBQVE7Ozs7S0FGZ0I7O0VBSXBCOzs7Ozs7O0lBQ0osVUFBQyxDQUFBLE1BQUQsQ0FBQTs7eUJBQ0EsTUFBQSxHQUFROzs7O0tBRmU7O0VBSW5COzs7Ozs7O0lBQ0osMkJBQUMsQ0FBQSxNQUFELENBQUE7OzBDQUNBLE1BQUEsR0FBUTs7MENBRVIsT0FBQSxHQUFTLFNBQUE7TUFDUCxJQUFHLElBQUMsQ0FBQSxNQUFNLENBQUMsSUFBUixLQUFnQixXQUFuQjtRQUNFLElBQUMsQ0FBQSxpQkFBRCxDQUFtQixDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFBO0FBQ2pCLGdCQUFBO0FBQUE7QUFBQTtpQkFBQSxzQ0FBQTs7MkJBQ0Usa0JBQWtCLENBQUMsaUNBQW5CLENBQUE7QUFERjs7VUFEaUI7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQW5CLEVBREY7O2FBSUEsMERBQUEsU0FBQTtJQUxPOzs7O0tBSitCOztFQVdwQzs7Ozs7OztJQUNKLFVBQUMsQ0FBQSxNQUFELENBQUE7O3lCQUNBLElBQUEsR0FBTTs7eUJBQ04sTUFBQSxHQUFROzt5QkFDUixXQUFBLEdBQWE7Ozs7S0FKVTs7RUFRbkI7Ozs7Ozs7SUFDSixJQUFDLENBQUEsTUFBRCxDQUFBOzttQkFDQSxXQUFBLEdBQWE7O21CQUNiLGNBQUEsR0FBZ0I7O21CQUVoQixlQUFBLEdBQWlCLFNBQUMsU0FBRDthQUNmLElBQUMsQ0FBQSw2QkFBRCxDQUErQixTQUEvQjtJQURlOzs7O0tBTEE7O0VBUWI7Ozs7Ozs7SUFDSixRQUFDLENBQUEsTUFBRCxDQUFBOzt1QkFDQSxJQUFBLEdBQU07O3VCQUNOLE1BQUEsR0FBUTs7OztLQUhhOztFQUtqQjs7Ozs7OztJQUNKLHlCQUFDLENBQUEsTUFBRCxDQUFBOzt3Q0FDQSxNQUFBLEdBQVE7Ozs7S0FGOEI7O0VBTWxDOzs7Ozs7O0lBQ0osUUFBQyxDQUFBLE1BQUQsQ0FBQTs7dUJBQ0EsTUFBQSxHQUFROzt1QkFDUixXQUFBLEdBQWE7O3VCQUNiLGdCQUFBLEdBQWtCOzt1QkFDbEIsSUFBQSxHQUFNOzt1QkFFTixPQUFBLEdBQVMsU0FBQTtBQUNQLFVBQUE7TUFBQSxJQUFDLENBQUEsU0FBRCxHQUFhO01BQ2IsdUNBQUEsU0FBQTtNQUNBLElBQUcsSUFBQyxDQUFBLFNBQVMsQ0FBQyxNQUFkO1FBQ0UsSUFBRyxJQUFDLENBQUEsU0FBRCxDQUFXLGdCQUFYLENBQUEsSUFBaUMsUUFBQSxJQUFDLENBQUEsSUFBRCxFQUFBLGFBQWEsSUFBQyxDQUFBLFNBQUQsQ0FBVyx5QkFBWCxDQUFiLEVBQUEsSUFBQSxLQUFBLENBQXBDO2lCQUNFLElBQUMsQ0FBQSxRQUFRLENBQUMsS0FBVixDQUFnQixJQUFDLENBQUEsU0FBakIsRUFBNEI7WUFBQSxJQUFBLEVBQU0sSUFBQyxDQUFBLHNCQUFQO1dBQTVCLEVBREY7U0FERjs7SUFITzs7dUJBT1QsMEJBQUEsR0FBNEIsU0FBQyxTQUFELEVBQVksRUFBWjtBQUMxQixVQUFBOztRQURzQyxLQUFHOztNQUN6QyxTQUFBLEdBQVk7O1FBQ1osSUFBQyxDQUFBLFVBQVcsTUFBQSxDQUFBLEVBQUEsR0FBSSxDQUFDLElBQUMsQ0FBQSxTQUFELENBQVcsYUFBWCxDQUFELENBQUosRUFBa0MsR0FBbEM7O01BQ1osSUFBQyxDQUFBLFdBQUQsQ0FBYSxJQUFDLENBQUEsT0FBZCxFQUF1QjtRQUFDLFdBQUEsU0FBRDtPQUF2QixFQUFvQyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsS0FBRDtBQUNsQyxjQUFBO1VBQUEsSUFBVSxZQUFBLElBQVEsQ0FBSSxFQUFBLENBQUcsS0FBSCxDQUF0QjtBQUFBLG1CQUFBOztVQUNDLDJCQUFELEVBQVk7VUFDWixVQUFBLEdBQWEsS0FBQyxDQUFBLGFBQUQsQ0FBZSxTQUFmO2lCQUNiLFNBQVMsQ0FBQyxJQUFWLENBQWUsT0FBQSxDQUFRLE1BQUEsQ0FBTyxVQUFQLENBQVIsQ0FBZjtRQUprQztNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBcEM7YUFLQTtJQVIwQjs7dUJBVTVCLGVBQUEsR0FBaUIsU0FBQyxTQUFEO0FBQ2YsVUFBQTtNQUFDLFNBQVU7TUFDWCxJQUFHLElBQUMsQ0FBQSxNQUFNLENBQUMsRUFBUixDQUFXLE9BQVgsQ0FBSDtRQUNFLGNBQUEsR0FBaUIsTUFBTSxDQUFDLGlCQUFQLENBQUE7UUFDakIsU0FBQSxHQUFZLElBQUMsQ0FBQSxNQUFNLENBQUMsdUJBQVIsQ0FBZ0MsY0FBYyxDQUFDLEdBQS9DO1FBQ1osU0FBQSxHQUFZLElBQUMsQ0FBQSwwQkFBRCxDQUE0QixTQUE1QixFQUF1QyxTQUFDLEdBQUQ7QUFDakQsY0FBQTtVQURtRCxtQkFBTztVQUMxRCxJQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsYUFBVixDQUF3QixjQUF4QixDQUFIO1lBQ0UsSUFBQSxDQUFBO21CQUNBLEtBRkY7V0FBQSxNQUFBO21CQUlFLE1BSkY7O1FBRGlELENBQXZDO1FBT1osS0FBQSxrR0FBK0M7ZUFDL0MsTUFBTSxDQUFDLGlCQUFQLENBQXlCLEtBQXpCLEVBWEY7T0FBQSxNQUFBO1FBYUUsU0FBQSxHQUFZLFNBQVMsQ0FBQyxjQUFWLENBQUE7UUFDWixRQUFBLElBQUMsQ0FBQSxTQUFELENBQVUsQ0FBQyxJQUFYLGFBQWdCLElBQUMsQ0FBQSwwQkFBRCxDQUE0QixTQUE1QixDQUFoQjtlQUNBLE1BQU0sQ0FBQyxpQkFBUCxDQUF5QixTQUFTLENBQUMsS0FBbkMsRUFmRjs7SUFGZTs7dUJBbUJqQixhQUFBLEdBQWUsU0FBQyxZQUFEO2FBQ2IsTUFBTSxDQUFDLFFBQVAsQ0FBZ0IsWUFBaEIsRUFBOEIsRUFBOUIsQ0FBQSxHQUFvQyxJQUFDLENBQUEsSUFBRCxHQUFRLElBQUMsQ0FBQSxRQUFELENBQUE7SUFEL0I7Ozs7S0EzQ007O0VBK0NqQjs7Ozs7OztJQUNKLFFBQUMsQ0FBQSxNQUFELENBQUE7O3VCQUNBLElBQUEsR0FBTSxDQUFDOzs7O0tBRmM7O0VBTWpCOzs7Ozs7O0lBQ0osZUFBQyxDQUFBLE1BQUQsQ0FBQTs7OEJBQ0EsVUFBQSxHQUFZOzs4QkFDWixNQUFBLEdBQVE7OzhCQUNSLHFCQUFBLEdBQXVCOzs4QkFFdkIsYUFBQSxHQUFlLFNBQUMsWUFBRDtNQUNiLElBQUcsdUJBQUg7UUFDRSxJQUFDLENBQUEsVUFBRCxJQUFlLElBQUMsQ0FBQSxJQUFELEdBQVEsSUFBQyxDQUFBLFFBQUQsQ0FBQSxFQUR6QjtPQUFBLE1BQUE7UUFHRSxJQUFDLENBQUEsVUFBRCxHQUFjLE1BQU0sQ0FBQyxRQUFQLENBQWdCLFlBQWhCLEVBQThCLEVBQTlCLEVBSGhCOzthQUlBLElBQUMsQ0FBQTtJQUxZOzs7O0tBTmE7O0VBY3hCOzs7Ozs7O0lBQ0osZUFBQyxDQUFBLE1BQUQsQ0FBQTs7OEJBQ0EsSUFBQSxHQUFNLENBQUM7Ozs7S0FGcUI7O0VBU3hCOzs7Ozs7O0lBQ0osU0FBQyxDQUFBLE1BQUQsQ0FBQTs7d0JBQ0EsUUFBQSxHQUFVOzt3QkFDVixNQUFBLEdBQVE7O3dCQUNSLFNBQUEsR0FBVzs7d0JBQ1gsZ0JBQUEsR0FBa0I7O3dCQUNsQixXQUFBLEdBQWE7O3dCQUNiLFdBQUEsR0FBYTs7d0JBRWIsVUFBQSxHQUFZLFNBQUE7YUFDVixJQUFDLENBQUEsUUFBUSxDQUFDLHNCQUFzQixDQUFDLFlBQWpDLENBQThDLElBQTlDO0lBRFU7O3dCQUdaLE9BQUEsR0FBUyxTQUFBO01BQ1AsSUFBQyxDQUFBLG9CQUFELEdBQTRCLElBQUEsR0FBQSxDQUFBO01BQzVCLElBQUMsQ0FBQSxlQUFELEdBQW1CLElBQUMsQ0FBQSxRQUFRLENBQUMsc0JBQXNCLENBQUMsU0FBakMsQ0FBMkMsSUFBM0M7TUFFbkIsSUFBQyxDQUFBLG1CQUFELENBQXFCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtVQUNuQixJQUFBLENBQStCLEtBQUMsQ0FBQSxTQUFoQzttQkFBQSxLQUFDLENBQUEsb0JBQUQsQ0FBQSxFQUFBOztRQURtQjtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBckI7TUFHQSx3Q0FBQSxTQUFBO01BRUEsSUFBVSxJQUFDLENBQUEsU0FBWDtBQUFBLGVBQUE7O2FBRUEsSUFBQyxDQUFBLG9CQUFELENBQXNCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtBQUVwQixjQUFBO1VBQUEsSUFBRyxRQUFBLEdBQVcsS0FBQyxDQUFBLG9CQUFvQixDQUFDLEdBQXRCLENBQTBCLEtBQUMsQ0FBQSxNQUFNLENBQUMsZ0JBQVIsQ0FBQSxDQUExQixDQUFkO1lBQ0UsS0FBQyxDQUFBLGdCQUFELENBQWtCLFFBQWxCLEVBREY7O1VBSUEsSUFBRyxLQUFDLENBQUEsU0FBRCxDQUFXLGdCQUFYLENBQUEsSUFBaUMsUUFBQSxLQUFDLENBQUEsSUFBRCxFQUFBLGFBQWEsS0FBQyxDQUFBLFNBQUQsQ0FBVyx5QkFBWCxDQUFiLEVBQUEsSUFBQSxLQUFBLENBQXBDO1lBQ0UsT0FBQSxHQUFVLFNBQUMsU0FBRDtxQkFBZSxLQUFDLENBQUEsb0JBQW9CLENBQUMsR0FBdEIsQ0FBMEIsU0FBMUI7WUFBZjttQkFDVixLQUFDLENBQUEsUUFBUSxDQUFDLEtBQVYsQ0FBZ0IsS0FBQyxDQUFBLE1BQU0sQ0FBQyxhQUFSLENBQUEsQ0FBdUIsQ0FBQyxHQUF4QixDQUE0QixPQUE1QixDQUFoQixFQUFzRDtjQUFBLElBQUEsRUFBTSxLQUFDLENBQUEsWUFBRCxDQUFBLENBQU47YUFBdEQsRUFGRjs7UUFOb0I7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXRCO0lBWE87O3dCQXFCVCxvQkFBQSxHQUFzQixTQUFBO0FBQ3BCLFVBQUE7QUFBQTtBQUFBO1dBQUEsc0NBQUE7O2NBQThDLElBQUMsQ0FBQSxvQkFBb0IsQ0FBQyxHQUF0QixDQUEwQixTQUExQjs7O1FBQzNDLFNBQVU7UUFDWCxPQUFlLFFBQUEsR0FBVyxJQUFDLENBQUEsb0JBQW9CLENBQUMsR0FBdEIsQ0FBMEIsU0FBMUIsQ0FBMUIsRUFBQyxrQkFBRCxFQUFRO1FBQ1IsSUFBRyxJQUFDLENBQUEsYUFBSjt1QkFDRSwrQkFBQSxDQUFnQyxNQUFoQyxFQUF3QyxLQUFLLENBQUMsR0FBOUMsR0FERjtTQUFBLE1BQUE7VUFHRSxJQUFHLFFBQVEsQ0FBQyxZQUFULENBQUEsQ0FBSDt5QkFDRSxNQUFNLENBQUMsaUJBQVAsQ0FBeUIsR0FBRyxDQUFDLFNBQUosQ0FBYyxDQUFDLENBQUQsRUFBSSxDQUFDLENBQUwsQ0FBZCxDQUF6QixHQURGO1dBQUEsTUFBQTt5QkFHRSxNQUFNLENBQUMsaUJBQVAsQ0FBeUIsS0FBekIsR0FIRjtXQUhGOztBQUhGOztJQURvQjs7d0JBWXRCLGVBQUEsR0FBaUIsU0FBQyxTQUFEO0FBQ2YsVUFBQTtNQUFBLE9BQWUsSUFBQyxDQUFBLFFBQVEsQ0FBQyxRQUFRLENBQUMsR0FBbkIsQ0FBdUIsSUFBdkIsRUFBNkIsU0FBN0IsRUFBd0MsSUFBQyxDQUFBLGVBQXpDLENBQWYsRUFBQyxnQkFBRCxFQUFPO01BQ1AsSUFBQSxDQUFPLElBQVA7UUFDRSxJQUFDLENBQUEsU0FBRCxHQUFhO0FBQ2IsZUFGRjs7TUFJQSxJQUFBLEdBQU8sQ0FBQyxDQUFDLGNBQUYsQ0FBaUIsSUFBakIsRUFBdUIsSUFBQyxDQUFBLFFBQUQsQ0FBQSxDQUF2QjtNQUNQLElBQUMsQ0FBQSxhQUFELEdBQWlCLElBQUEsS0FBUSxVQUFSLElBQXNCLElBQUMsQ0FBQSxNQUFELENBQVEsUUFBUixFQUFrQixVQUFsQjtNQUN2QyxRQUFBLEdBQVcsSUFBQyxDQUFBLEtBQUQsQ0FBTyxTQUFQLEVBQWtCLElBQWxCLEVBQXdCO1FBQUUsZUFBRCxJQUFDLENBQUEsYUFBRjtPQUF4QjtNQUNYLElBQUMsQ0FBQSxvQkFBb0IsQ0FBQyxHQUF0QixDQUEwQixTQUExQixFQUFxQyxRQUFyQzthQUNBLElBQUMsQ0FBQSxRQUFRLENBQUMsc0JBQXNCLENBQUMsMkJBQWpDLENBQTZELFNBQTdELEVBQXdFLFFBQXhFO0lBVmU7O3dCQVlqQixLQUFBLEdBQU8sU0FBQyxTQUFELEVBQVksSUFBWixFQUFrQixHQUFsQjtBQUNMLFVBQUE7TUFEd0IsZ0JBQUQ7TUFDdkIsSUFBRyxJQUFDLENBQUEsZUFBSjtlQUNFLElBQUMsQ0FBQSxrQkFBRCxDQUFvQixTQUFwQixFQUErQixJQUEvQixFQURGO09BQUEsTUFFSyxJQUFHLGFBQUg7ZUFDSCxJQUFDLENBQUEsYUFBRCxDQUFlLFNBQWYsRUFBMEIsSUFBMUIsRUFERztPQUFBLE1BQUE7ZUFHSCxJQUFDLENBQUEsa0JBQUQsQ0FBb0IsU0FBcEIsRUFBK0IsSUFBL0IsRUFIRzs7SUFIQTs7d0JBUVAsa0JBQUEsR0FBb0IsU0FBQyxTQUFELEVBQVksSUFBWjtBQUNsQixVQUFBO01BQUMsU0FBVTtNQUNYLElBQUcsU0FBUyxDQUFDLE9BQVYsQ0FBQSxDQUFBLElBQXdCLElBQUMsQ0FBQSxRQUFELEtBQWEsT0FBckMsSUFBaUQsQ0FBSSxVQUFBLENBQVcsSUFBQyxDQUFBLE1BQVosRUFBb0IsTUFBTSxDQUFDLFlBQVAsQ0FBQSxDQUFwQixDQUF4RDtRQUNFLE1BQU0sQ0FBQyxTQUFQLENBQUEsRUFERjs7QUFFQSxhQUFPLFNBQVMsQ0FBQyxVQUFWLENBQXFCLElBQXJCO0lBSlc7O3dCQU9wQixhQUFBLEdBQWUsU0FBQyxTQUFELEVBQVksSUFBWjtBQUNiLFVBQUE7TUFBQyxTQUFVO01BQ1gsU0FBQSxHQUFZLE1BQU0sQ0FBQyxZQUFQLENBQUE7TUFDWixJQUFBLENBQW9CLElBQUksQ0FBQyxRQUFMLENBQWMsSUFBZCxDQUFwQjtRQUFBLElBQUEsSUFBUSxLQUFSOztNQUNBLElBQUcsU0FBUyxDQUFDLE9BQVYsQ0FBQSxDQUFIO1FBQ0UsSUFBRyxJQUFDLENBQUEsUUFBRCxLQUFhLFFBQWhCO2lCQUNFLDBCQUFBLENBQTJCLElBQUMsQ0FBQSxNQUE1QixFQUFvQyxDQUFDLFNBQUQsRUFBWSxDQUFaLENBQXBDLEVBQW9ELElBQXBELEVBREY7U0FBQSxNQUVLLElBQUcsSUFBQyxDQUFBLFFBQUQsS0FBYSxPQUFoQjtVQUNILFNBQUEsR0FBWSxJQUFDLENBQUEsbUJBQUQsQ0FBcUIsU0FBckI7VUFDWixpQ0FBQSxDQUFrQyxJQUFDLENBQUEsTUFBbkMsRUFBMkMsU0FBM0M7aUJBQ0EsMEJBQUEsQ0FBMkIsSUFBQyxDQUFBLE1BQTVCLEVBQW9DLENBQUMsU0FBQSxHQUFZLENBQWIsRUFBZ0IsQ0FBaEIsQ0FBcEMsRUFBd0QsSUFBeEQsRUFIRztTQUhQO09BQUEsTUFBQTtRQVFFLElBQUEsQ0FBa0MsSUFBQyxDQUFBLE1BQUQsQ0FBUSxRQUFSLEVBQWtCLFVBQWxCLENBQWxDO1VBQUEsU0FBUyxDQUFDLFVBQVYsQ0FBcUIsSUFBckIsRUFBQTs7ZUFDQSxTQUFTLENBQUMsVUFBVixDQUFxQixJQUFyQixFQVRGOztJQUphOzs7O0tBeEVPOztFQXVGbEI7Ozs7Ozs7SUFDSixRQUFDLENBQUEsTUFBRCxDQUFBOzt1QkFDQSxRQUFBLEdBQVU7Ozs7S0FGVzs7RUFJakI7Ozs7Ozs7SUFDSix1QkFBQyxDQUFBLE1BQUQsQ0FBQTs7c0NBRUEsYUFBQSxHQUFlLFNBQUMsU0FBRCxFQUFZLElBQVo7QUFDYixVQUFBO01BQUEsUUFBQSxHQUFXLDREQUFBLFNBQUE7TUFDWCw2QkFBQSxDQUE4QixJQUFDLENBQUEsTUFBL0IsRUFBdUMsUUFBdkM7QUFDQSxhQUFPO0lBSE07Ozs7S0FIcUI7O0VBUWhDOzs7Ozs7O0lBQ0osc0JBQUMsQ0FBQSxNQUFELENBQUE7O3FDQUNBLFFBQUEsR0FBVTs7OztLQUZ5Qjs7RUFJL0I7Ozs7Ozs7SUFDSixpQkFBQyxDQUFBLE1BQUQsQ0FBQTs7Z0NBQ0EsV0FBQSxHQUFhOztnQ0FDYixNQUFBLEdBQVE7O2dDQUNSLGtCQUFBLEdBQW9COztnQ0FDcEIsWUFBQSxHQUFjOztnQ0FDZCxLQUFBLEdBQU87O2dDQUVQLGVBQUEsR0FBaUIsU0FBQyxTQUFEO0FBQ2YsVUFBQTtNQUFBLEdBQUEsR0FBTSxTQUFTLENBQUMscUJBQVYsQ0FBQSxDQUFpQyxDQUFDO01BQ3hDLElBQVksSUFBQyxDQUFBLEtBQUQsS0FBVSxPQUF0QjtRQUFBLEdBQUEsSUFBTyxFQUFQOztNQUNBLEtBQUEsR0FBUSxDQUFDLEdBQUQsRUFBTSxDQUFOO2FBQ1IsSUFBQyxDQUFBLE1BQU0sQ0FBQyxvQkFBUixDQUE2QixDQUFDLEtBQUQsRUFBUSxLQUFSLENBQTdCLEVBQTZDLElBQUksQ0FBQyxNQUFMLENBQVksSUFBQyxDQUFBLFFBQUQsQ0FBQSxDQUFaLENBQTdDO0lBSmU7Ozs7S0FSYTs7RUFjMUI7Ozs7Ozs7SUFDSixpQkFBQyxDQUFBLE1BQUQsQ0FBQTs7Z0NBQ0EsS0FBQSxHQUFPOzs7O0tBRnVCO0FBM3FCaEMiLCJzb3VyY2VzQ29udGVudCI6WyJfID0gcmVxdWlyZSAndW5kZXJzY29yZS1wbHVzJ1xue1xuICBpc0VtcHR5Um93XG4gIGdldFdvcmRQYXR0ZXJuQXRCdWZmZXJQb3NpdGlvblxuICBnZXRTdWJ3b3JkUGF0dGVybkF0QnVmZmVyUG9zaXRpb25cbiAgaW5zZXJ0VGV4dEF0QnVmZmVyUG9zaXRpb25cbiAgc2V0QnVmZmVyUm93XG4gIG1vdmVDdXJzb3JUb0ZpcnN0Q2hhcmFjdGVyQXRSb3dcbiAgZW5zdXJlRW5kc1dpdGhOZXdMaW5lRm9yQnVmZmVyUm93XG4gIGFkanVzdEluZGVudFdpdGhLZWVwaW5nTGF5b3V0XG4gIGlzU2luZ2xlTGluZVRleHRcbn0gPSByZXF1aXJlICcuL3V0aWxzJ1xuQmFzZSA9IHJlcXVpcmUgJy4vYmFzZSdcblxuY2xhc3MgT3BlcmF0b3IgZXh0ZW5kcyBCYXNlXG4gIEBleHRlbmQoZmFsc2UpXG4gIEBvcGVyYXRpb25LaW5kOiAnb3BlcmF0b3InXG4gIHJlcXVpcmVUYXJnZXQ6IHRydWVcbiAgcmVjb3JkYWJsZTogdHJ1ZVxuXG4gIHdpc2U6IG51bGxcbiAgb2NjdXJyZW5jZTogZmFsc2VcbiAgb2NjdXJyZW5jZVR5cGU6ICdiYXNlJ1xuXG4gIGZsYXNoVGFyZ2V0OiB0cnVlXG4gIGZsYXNoQ2hlY2twb2ludDogJ2RpZC1maW5pc2gnXG4gIGZsYXNoVHlwZTogJ29wZXJhdG9yJ1xuICBmbGFzaFR5cGVGb3JPY2N1cnJlbmNlOiAnb3BlcmF0b3Itb2NjdXJyZW5jZSdcbiAgdHJhY2tDaGFuZ2U6IGZhbHNlXG5cbiAgcGF0dGVybkZvck9jY3VycmVuY2U6IG51bGxcbiAgc3RheUF0U2FtZVBvc2l0aW9uOiBudWxsXG4gIHN0YXlPcHRpb25OYW1lOiBudWxsXG4gIHN0YXlCeU1hcmtlcjogZmFsc2VcbiAgcmVzdG9yZVBvc2l0aW9uczogdHJ1ZVxuICBzZXRUb0ZpcnN0Q2hhcmFjdGVyT25MaW5ld2lzZTogZmFsc2VcblxuICBhY2NlcHRQcmVzZXRPY2N1cnJlbmNlOiB0cnVlXG4gIGFjY2VwdFBlcnNpc3RlbnRTZWxlY3Rpb246IHRydWVcblxuICBidWZmZXJDaGVja3BvaW50QnlQdXJwb3NlOiBudWxsXG4gIG11dGF0ZVNlbGVjdGlvbk9yZGVyZDogZmFsc2VcblxuICAjIEV4cGVyaW1lbnRhbHkgYWxsb3cgc2VsZWN0VGFyZ2V0IGJlZm9yZSBpbnB1dCBDb21wbGV0ZVxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgc3VwcG9ydEVhcmx5U2VsZWN0OiBmYWxzZVxuICB0YXJnZXRTZWxlY3RlZDogbnVsbFxuICBjYW5FYXJseVNlbGVjdDogLT5cbiAgICBAc3VwcG9ydEVhcmx5U2VsZWN0IGFuZCBub3QgQHJlcGVhdGVkXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gICMgQ2FsbGVkIHdoZW4gb3BlcmF0aW9uIGZpbmlzaGVkXG4gICMgVGhpcyBpcyBlc3NlbnRpYWxseSB0byByZXNldCBzdGF0ZSBmb3IgYC5gIHJlcGVhdC5cbiAgcmVzZXRTdGF0ZTogLT5cbiAgICBAdGFyZ2V0U2VsZWN0ZWQgPSBudWxsXG4gICAgQG9jY3VycmVuY2VTZWxlY3RlZCA9IGZhbHNlXG5cbiAgIyBUd28gY2hlY2twb2ludCBmb3IgZGlmZmVyZW50IHB1cnBvc2VcbiAgIyAtIG9uZSBmb3IgdW5kbyhoYW5kbGVkIGJ5IG1vZGVNYW5hZ2VyKVxuICAjIC0gb25lIGZvciBwcmVzZXJ2ZSBsYXN0IGluc2VydGVkIHRleHRcbiAgY3JlYXRlQnVmZmVyQ2hlY2twb2ludDogKHB1cnBvc2UpIC0+XG4gICAgQGJ1ZmZlckNoZWNrcG9pbnRCeVB1cnBvc2UgPz0ge31cbiAgICBAYnVmZmVyQ2hlY2twb2ludEJ5UHVycG9zZVtwdXJwb3NlXSA9IEBlZGl0b3IuY3JlYXRlQ2hlY2twb2ludCgpXG5cbiAgZ2V0QnVmZmVyQ2hlY2twb2ludDogKHB1cnBvc2UpIC0+XG4gICAgQGJ1ZmZlckNoZWNrcG9pbnRCeVB1cnBvc2U/W3B1cnBvc2VdXG5cbiAgZGVsZXRlQnVmZmVyQ2hlY2twb2ludDogKHB1cnBvc2UpIC0+XG4gICAgaWYgQGJ1ZmZlckNoZWNrcG9pbnRCeVB1cnBvc2U/XG4gICAgICBkZWxldGUgQGJ1ZmZlckNoZWNrcG9pbnRCeVB1cnBvc2VbcHVycG9zZV1cblxuICBncm91cENoYW5nZXNTaW5jZUJ1ZmZlckNoZWNrcG9pbnQ6IChwdXJwb3NlKSAtPlxuICAgIGlmIGNoZWNrcG9pbnQgPSBAZ2V0QnVmZmVyQ2hlY2twb2ludChwdXJwb3NlKVxuICAgICAgQGVkaXRvci5ncm91cENoYW5nZXNTaW5jZUNoZWNrcG9pbnQoY2hlY2twb2ludClcbiAgICAgIEBkZWxldGVCdWZmZXJDaGVja3BvaW50KHB1cnBvc2UpXG5cbiAgc2V0TWFya0ZvckNoYW5nZTogKHJhbmdlKSAtPlxuICAgIEB2aW1TdGF0ZS5tYXJrLnNldCgnWycsIHJhbmdlLnN0YXJ0KVxuICAgIEB2aW1TdGF0ZS5tYXJrLnNldCgnXScsIHJhbmdlLmVuZClcblxuICBuZWVkRmxhc2g6IC0+XG4gICAgQGZsYXNoVGFyZ2V0IGFuZCBAZ2V0Q29uZmlnKCdmbGFzaE9uT3BlcmF0ZScpIGFuZFxuICAgICAgKEBuYW1lIG5vdCBpbiBAZ2V0Q29uZmlnKCdmbGFzaE9uT3BlcmF0ZUJsYWNrbGlzdCcpKSBhbmRcbiAgICAgICgoQG1vZGUgaXNudCAndmlzdWFsJykgb3IgKEBzdWJtb2RlIGlzbnQgQHRhcmdldC53aXNlKSkgIyBlLmcuIFkgaW4gdkNcblxuICBmbGFzaElmTmVjZXNzYXJ5OiAocmFuZ2VzKSAtPlxuICAgIGlmIEBuZWVkRmxhc2goKVxuICAgICAgQHZpbVN0YXRlLmZsYXNoKHJhbmdlcywgdHlwZTogQGdldEZsYXNoVHlwZSgpKVxuXG4gIGZsYXNoQ2hhbmdlSWZOZWNlc3Nhcnk6IC0+XG4gICAgaWYgQG5lZWRGbGFzaCgpXG4gICAgICBAb25EaWRGaW5pc2hPcGVyYXRpb24gPT5cbiAgICAgICAgcmFuZ2VzID0gQG11dGF0aW9uTWFuYWdlci5nZXRTZWxlY3RlZEJ1ZmZlclJhbmdlc0ZvckNoZWNrcG9pbnQoQGZsYXNoQ2hlY2twb2ludClcbiAgICAgICAgQHZpbVN0YXRlLmZsYXNoKHJhbmdlcywgdHlwZTogQGdldEZsYXNoVHlwZSgpKVxuXG4gIGdldEZsYXNoVHlwZTogLT5cbiAgICBpZiBAb2NjdXJyZW5jZVNlbGVjdGVkXG4gICAgICBAZmxhc2hUeXBlRm9yT2NjdXJyZW5jZVxuICAgIGVsc2VcbiAgICAgIEBmbGFzaFR5cGVcblxuICB0cmFja0NoYW5nZUlmTmVjZXNzYXJ5OiAtPlxuICAgIHJldHVybiB1bmxlc3MgQHRyYWNrQ2hhbmdlXG5cbiAgICBAb25EaWRGaW5pc2hPcGVyYXRpb24gPT5cbiAgICAgIGlmIHJhbmdlID0gQG11dGF0aW9uTWFuYWdlci5nZXRNdXRhdGVkQnVmZmVyUmFuZ2VGb3JTZWxlY3Rpb24oQGVkaXRvci5nZXRMYXN0U2VsZWN0aW9uKCkpXG4gICAgICAgIEBzZXRNYXJrRm9yQ2hhbmdlKHJhbmdlKVxuXG4gIGNvbnN0cnVjdG9yOiAtPlxuICAgIHN1cGVyXG4gICAge0BtdXRhdGlvbk1hbmFnZXIsIEBvY2N1cnJlbmNlTWFuYWdlciwgQHBlcnNpc3RlbnRTZWxlY3Rpb259ID0gQHZpbVN0YXRlXG4gICAgQHN1YnNjcmliZVJlc2V0T2NjdXJyZW5jZVBhdHRlcm5JZk5lZWRlZCgpXG4gICAgQGluaXRpYWxpemUoKVxuICAgIEBvbkRpZFNldE9wZXJhdG9yTW9kaWZpZXIoQHNldE1vZGlmaWVyLmJpbmQodGhpcykpXG5cbiAgICAjIFdoZW4gcHJlc2V0LW9jY3VycmVuY2Ugd2FzIGV4aXN0cywgb3BlcmF0ZSBvbiBvY2N1cnJlbmNlLXdpc2VcbiAgICBpZiBAYWNjZXB0UHJlc2V0T2NjdXJyZW5jZSBhbmQgQG9jY3VycmVuY2VNYW5hZ2VyLmhhc01hcmtlcnMoKVxuICAgICAgQG9jY3VycmVuY2UgPSB0cnVlXG5cbiAgICAjIFtGSVhNRV0gT1JERVItTUFUVEVSXG4gICAgIyBUbyBwaWNrIGN1cnNvci13b3JkIHRvIGZpbmQgb2NjdXJyZW5jZSBiYXNlIHBhdHRlcm4uXG4gICAgIyBUaGlzIGhhcyB0byBiZSBkb25lIEJFRk9SRSBjb252ZXJ0aW5nIHBlcnNpc3RlbnQtc2VsZWN0aW9uIGludG8gcmVhbC1zZWxlY3Rpb24uXG4gICAgIyBTaW5jZSB3aGVuIHBlcnNpc3RlbnQtc2VsZWN0aW9uIGlzIGFjdHVhbGwgc2VsZWN0ZWQsIGl0IGNoYW5nZSBjdXJzb3IgcG9zaXRpb24uXG4gICAgaWYgQG9jY3VycmVuY2UgYW5kIG5vdCBAb2NjdXJyZW5jZU1hbmFnZXIuaGFzTWFya2VycygpXG4gICAgICBAb2NjdXJyZW5jZU1hbmFnZXIuYWRkUGF0dGVybihAcGF0dGVybkZvck9jY3VycmVuY2UgPyBAZ2V0UGF0dGVybkZvck9jY3VycmVuY2VUeXBlKEBvY2N1cnJlbmNlVHlwZSkpXG5cblxuICAgICMgVGhpcyBjaGFuZ2UgY3Vyc29yIHBvc2l0aW9uLlxuICAgIGlmIEBzZWxlY3RQZXJzaXN0ZW50U2VsZWN0aW9uSWZOZWNlc3NhcnkoKVxuICAgICAgIyBbRklYTUVdIHNlbGVjdGlvbi13aXNlIGlzIG5vdCBzeW5jaGVkIGlmIGl0IGFscmVhZHkgdmlzdWFsLW1vZGVcbiAgICAgIHVubGVzcyBAbW9kZSBpcyAndmlzdWFsJ1xuICAgICAgICBAdmltU3RhdGUubW9kZU1hbmFnZXIuYWN0aXZhdGUoJ3Zpc3VhbCcsIEBzd3JhcC5kZXRlY3RXaXNlKEBlZGl0b3IpKVxuXG4gICAgQHRhcmdldCA9ICdDdXJyZW50U2VsZWN0aW9uJyBpZiBAbW9kZSBpcyAndmlzdWFsJyBhbmQgQHJlcXVpcmVUYXJnZXRcbiAgICBAc2V0VGFyZ2V0KEBuZXcoQHRhcmdldCkpIGlmIF8uaXNTdHJpbmcoQHRhcmdldClcblxuICBzdWJzY3JpYmVSZXNldE9jY3VycmVuY2VQYXR0ZXJuSWZOZWVkZWQ6IC0+XG4gICAgIyBbQ0FVVElPTl1cbiAgICAjIFRoaXMgbWV0aG9kIGhhcyB0byBiZSBjYWxsZWQgaW4gUFJPUEVSIHRpbWluZy5cbiAgICAjIElmIG9jY3VycmVuY2UgaXMgdHJ1ZSBidXQgbm8gcHJlc2V0LW9jY3VycmVuY2VcbiAgICAjIFRyZWF0IHRoYXQgYG9jY3VycmVuY2VgIGlzIEJPVU5ERUQgdG8gb3BlcmF0b3IgaXRzZWxmLCBzbyBjbGVhbnAgYXQgZmluaXNoZWQuXG4gICAgaWYgQG9jY3VycmVuY2UgYW5kIG5vdCBAb2NjdXJyZW5jZU1hbmFnZXIuaGFzTWFya2VycygpXG4gICAgICBAb25EaWRSZXNldE9wZXJhdGlvblN0YWNrKD0+IEBvY2N1cnJlbmNlTWFuYWdlci5yZXNldFBhdHRlcm5zKCkpXG5cbiAgc2V0TW9kaWZpZXI6IChvcHRpb25zKSAtPlxuICAgIGlmIG9wdGlvbnMud2lzZT9cbiAgICAgIEB3aXNlID0gb3B0aW9ucy53aXNlXG4gICAgICByZXR1cm5cblxuICAgIGlmIG9wdGlvbnMub2NjdXJyZW5jZT9cbiAgICAgIEBvY2N1cnJlbmNlID0gb3B0aW9ucy5vY2N1cnJlbmNlXG4gICAgICBpZiBAb2NjdXJyZW5jZVxuICAgICAgICBAb2NjdXJyZW5jZVR5cGUgPSBvcHRpb25zLm9jY3VycmVuY2VUeXBlXG4gICAgICAgICMgVGhpcyBpcyBvIG1vZGlmaWVyIGNhc2UoZS5nLiBgYyBvIHBgLCBgZCBPIGZgKVxuICAgICAgICAjIFdlIFJFU0VUIGV4aXN0aW5nIG9jY3VyZW5jZS1tYXJrZXIgd2hlbiBgb2Agb3IgYE9gIG1vZGlmaWVyIGlzIHR5cGVkIGJ5IHVzZXIuXG4gICAgICAgIHBhdHRlcm4gPSBAZ2V0UGF0dGVybkZvck9jY3VycmVuY2VUeXBlKEBvY2N1cnJlbmNlVHlwZSlcbiAgICAgICAgQG9jY3VycmVuY2VNYW5hZ2VyLmFkZFBhdHRlcm4ocGF0dGVybiwge3Jlc2V0OiB0cnVlLCBAb2NjdXJyZW5jZVR5cGV9KVxuICAgICAgICBAb25EaWRSZXNldE9wZXJhdGlvblN0YWNrKD0+IEBvY2N1cnJlbmNlTWFuYWdlci5yZXNldFBhdHRlcm5zKCkpXG5cbiAgIyByZXR1cm4gdHJ1ZS9mYWxzZSB0byBpbmRpY2F0ZSBzdWNjZXNzXG4gIHNlbGVjdFBlcnNpc3RlbnRTZWxlY3Rpb25JZk5lY2Vzc2FyeTogLT5cbiAgICBpZiBAYWNjZXB0UGVyc2lzdGVudFNlbGVjdGlvbiBhbmRcbiAgICAgICAgQGdldENvbmZpZygnYXV0b1NlbGVjdFBlcnNpc3RlbnRTZWxlY3Rpb25Pbk9wZXJhdGUnKSBhbmRcbiAgICAgICAgbm90IEBwZXJzaXN0ZW50U2VsZWN0aW9uLmlzRW1wdHkoKVxuXG4gICAgICBAcGVyc2lzdGVudFNlbGVjdGlvbi5zZWxlY3QoKVxuICAgICAgQGVkaXRvci5tZXJnZUludGVyc2VjdGluZ1NlbGVjdGlvbnMoKVxuICAgICAgZm9yICRzZWxlY3Rpb24gaW4gQHN3cmFwLmdldFNlbGVjdGlvbnMoQGVkaXRvcikgd2hlbiBub3QgJHNlbGVjdGlvbi5oYXNQcm9wZXJ0aWVzKClcbiAgICAgICAgJHNlbGVjdGlvbi5zYXZlUHJvcGVydGllcygpXG4gICAgICB0cnVlXG4gICAgZWxzZVxuICAgICAgZmFsc2VcblxuICBnZXRQYXR0ZXJuRm9yT2NjdXJyZW5jZVR5cGU6IChvY2N1cnJlbmNlVHlwZSkgLT5cbiAgICBzd2l0Y2ggb2NjdXJyZW5jZVR5cGVcbiAgICAgIHdoZW4gJ2Jhc2UnXG4gICAgICAgIGdldFdvcmRQYXR0ZXJuQXRCdWZmZXJQb3NpdGlvbihAZWRpdG9yLCBAZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKSlcbiAgICAgIHdoZW4gJ3N1YndvcmQnXG4gICAgICAgIGdldFN1YndvcmRQYXR0ZXJuQXRCdWZmZXJQb3NpdGlvbihAZWRpdG9yLCBAZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKSlcblxuICAjIHRhcmdldCBpcyBUZXh0T2JqZWN0IG9yIE1vdGlvbiB0byBvcGVyYXRlIG9uLlxuICBzZXRUYXJnZXQ6IChAdGFyZ2V0KSAtPlxuICAgIEB0YXJnZXQub3BlcmF0b3IgPSB0aGlzXG4gICAgQGVtaXREaWRTZXRUYXJnZXQodGhpcylcblxuICAgIGlmIEBjYW5FYXJseVNlbGVjdCgpXG4gICAgICBAbm9ybWFsaXplU2VsZWN0aW9uc0lmTmVjZXNzYXJ5KClcbiAgICAgIEBjcmVhdGVCdWZmZXJDaGVja3BvaW50KCd1bmRvJylcbiAgICAgIEBzZWxlY3RUYXJnZXQoKVxuICAgIHRoaXNcblxuICBzZXRUZXh0VG9SZWdpc3RlckZvclNlbGVjdGlvbjogKHNlbGVjdGlvbikgLT5cbiAgICBAc2V0VGV4dFRvUmVnaXN0ZXIoc2VsZWN0aW9uLmdldFRleHQoKSwgc2VsZWN0aW9uKVxuXG4gIHNldFRleHRUb1JlZ2lzdGVyOiAodGV4dCwgc2VsZWN0aW9uKSAtPlxuICAgIHRleHQgKz0gXCJcXG5cIiBpZiAoQHRhcmdldC5pc0xpbmV3aXNlKCkgYW5kIChub3QgdGV4dC5lbmRzV2l0aCgnXFxuJykpKVxuICAgIGlmIHRleHRcbiAgICAgIEB2aW1TdGF0ZS5yZWdpc3Rlci5zZXQobnVsbCwge3RleHQsIHNlbGVjdGlvbn0pXG5cbiAgICAgIGlmIEB2aW1TdGF0ZS5yZWdpc3Rlci5pc1VubmFtZWQoKVxuICAgICAgICBpZiBAaW5zdGFuY2VvZihcIkRlbGV0ZVwiKSBvciBAaW5zdGFuY2VvZihcIkNoYW5nZVwiKVxuICAgICAgICAgIGlmIG5vdCBAbmVlZFNhdmVUb051bWJlcmVkUmVnaXN0ZXIoQHRhcmdldCkgYW5kIGlzU2luZ2xlTGluZVRleHQodGV4dCkgIyBzbWFsbC1jaGFuZ2VcbiAgICAgICAgICAgIEB2aW1TdGF0ZS5yZWdpc3Rlci5zZXQoJy0nLCB7dGV4dCwgc2VsZWN0aW9ufSlcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBAdmltU3RhdGUucmVnaXN0ZXIuc2V0KCcxJywge3RleHQsIHNlbGVjdGlvbn0pXG5cbiAgICAgICAgZWxzZSBpZiBAaW5zdGFuY2VvZihcIllhbmtcIilcbiAgICAgICAgICBAdmltU3RhdGUucmVnaXN0ZXIuc2V0KCcwJywge3RleHQsIHNlbGVjdGlvbn0pXG5cbiAgbmVlZFNhdmVUb051bWJlcmVkUmVnaXN0ZXI6ICh0YXJnZXQpIC0+XG4gICAgIyBVc2VkIHRvIGRldGVybWluZSB3aGF0IHJlZ2lzdGVyIHRvIHVzZSBvbiBjaGFuZ2UgYW5kIGRlbGV0ZSBvcGVyYXRpb24uXG4gICAgIyBGb2xsb3dpbmcgbW90aW9uIHNob3VsZCBzYXZlIHRvIDEtOSByZWdpc3RlciByZWdlcmRsZXNzIG9mIGNvbnRlbnQgaXMgc21hbGwgb3IgYmlnLlxuICAgIGdvZXNUb051bWJlcmVkUmVnaXN0ZXJNb3Rpb25OYW1lcyA9IFtcbiAgICAgIFwiTW92ZVRvUGFpclwiICMgJVxuICAgICAgXCJNb3ZlVG9OZXh0U2VudGVuY2VcIiAjICgsIClcbiAgICAgIFwiU2VhcmNoXCIgIyAvLCA/LCBuLCBOXG4gICAgICBcIk1vdmVUb05leHRQYXJhZ3JhcGhcIiAjIHssIH1cbiAgICBdXG4gICAgZ29lc1RvTnVtYmVyZWRSZWdpc3Rlck1vdGlvbk5hbWVzLnNvbWUoKG5hbWUpIC0+IHRhcmdldC5pbnN0YW5jZW9mKG5hbWUpKVxuXG4gIG5vcm1hbGl6ZVNlbGVjdGlvbnNJZk5lY2Vzc2FyeTogLT5cbiAgICBpZiBAdGFyZ2V0Py5pc01vdGlvbigpIGFuZCAoQG1vZGUgaXMgJ3Zpc3VhbCcpXG4gICAgICBAc3dyYXAubm9ybWFsaXplKEBlZGl0b3IpXG5cbiAgc3RhcnRNdXRhdGlvbjogKGZuKSAtPlxuICAgIGlmIEBjYW5FYXJseVNlbGVjdCgpXG4gICAgICAjIC0gU2tpcCBzZWxlY3Rpb24gbm9ybWFsaXphdGlvbjogYWxyZWFkeSBub3JtYWxpemVkIGJlZm9yZSBAc2VsZWN0VGFyZ2V0KClcbiAgICAgICMgLSBNYW51YWwgY2hlY2twb2ludCBncm91cGluZzogdG8gY3JlYXRlIGNoZWNrcG9pbnQgYmVmb3JlIEBzZWxlY3RUYXJnZXQoKVxuICAgICAgZm4oKVxuICAgICAgQGVtaXRXaWxsRmluaXNoTXV0YXRpb24oKVxuICAgICAgQGdyb3VwQ2hhbmdlc1NpbmNlQnVmZmVyQ2hlY2twb2ludCgndW5kbycpXG5cbiAgICBlbHNlXG4gICAgICBAbm9ybWFsaXplU2VsZWN0aW9uc0lmTmVjZXNzYXJ5KClcbiAgICAgIEBlZGl0b3IudHJhbnNhY3QgPT5cbiAgICAgICAgZm4oKVxuICAgICAgICBAZW1pdFdpbGxGaW5pc2hNdXRhdGlvbigpXG5cbiAgICBAZW1pdERpZEZpbmlzaE11dGF0aW9uKClcblxuICAjIE1haW5cbiAgZXhlY3V0ZTogLT5cbiAgICBAc3RhcnRNdXRhdGlvbiA9PlxuICAgICAgaWYgQHNlbGVjdFRhcmdldCgpXG4gICAgICAgIGlmIEBtdXRhdGVTZWxlY3Rpb25PcmRlcmRcbiAgICAgICAgICBzZWxlY3Rpb25zID0gQGVkaXRvci5nZXRTZWxlY3Rpb25zT3JkZXJlZEJ5QnVmZmVyUG9zaXRpb24oKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgc2VsZWN0aW9ucyA9IEBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpXG4gICAgICAgIGZvciBzZWxlY3Rpb24gaW4gc2VsZWN0aW9uc1xuICAgICAgICAgIEBtdXRhdGVTZWxlY3Rpb24oc2VsZWN0aW9uKVxuICAgICAgICBAbXV0YXRpb25NYW5hZ2VyLnNldENoZWNrcG9pbnQoJ2RpZC1maW5pc2gnKVxuICAgICAgICBAcmVzdG9yZUN1cnNvclBvc2l0aW9uc0lmTmVjZXNzYXJ5KClcblxuICAgICMgRXZlbiB0aG91Z2ggd2UgZmFpbCB0byBzZWxlY3QgdGFyZ2V0IGFuZCBmYWlsIHRvIG11dGF0ZSxcbiAgICAjIHdlIGhhdmUgdG8gcmV0dXJuIHRvIG5vcm1hbC1tb2RlIGZyb20gb3BlcmF0b3ItcGVuZGluZyBvciB2aXN1YWxcbiAgICBAYWN0aXZhdGVNb2RlKCdub3JtYWwnKVxuXG4gICMgUmV0dXJuIHRydWUgdW5sZXNzIGFsbCBzZWxlY3Rpb24gaXMgZW1wdHkuXG4gIHNlbGVjdFRhcmdldDogLT5cbiAgICByZXR1cm4gQHRhcmdldFNlbGVjdGVkIGlmIEB0YXJnZXRTZWxlY3RlZD9cbiAgICBAbXV0YXRpb25NYW5hZ2VyLmluaXQoe0BzdGF5QnlNYXJrZXJ9KVxuXG4gICAgQHRhcmdldC5mb3JjZVdpc2UoQHdpc2UpIGlmIEB3aXNlP1xuICAgIEBlbWl0V2lsbFNlbGVjdFRhcmdldCgpXG5cbiAgICAjIEFsbG93IGN1cnNvciBwb3NpdGlvbiBhZGp1c3RtZW50ICdvbi13aWxsLXNlbGVjdC10YXJnZXQnIGhvb2suXG4gICAgIyBzbyBjaGVja3BvaW50IGNvbWVzIEFGVEVSIEBlbWl0V2lsbFNlbGVjdFRhcmdldCgpXG4gICAgQG11dGF0aW9uTWFuYWdlci5zZXRDaGVja3BvaW50KCd3aWxsLXNlbGVjdCcpXG5cbiAgICAjIE5PVEVcbiAgICAjIFNpbmNlIE1vdmVUb05leHRPY2N1cnJlbmNlLCBNb3ZlVG9QcmV2aW91c09jY3VycmVuY2UgbW90aW9uIG1vdmUgYnlcbiAgICAjICBvY2N1cnJlbmNlLW1hcmtlciwgb2NjdXJyZW5jZS1tYXJrZXIgaGFzIHRvIGJlIGNyZWF0ZWQgQkVGT1JFIGBAdGFyZ2V0LmV4ZWN1dGUoKWBcbiAgICAjIEFuZCB3aGVuIHJlcGVhdGVkLCBvY2N1cnJlbmNlIHBhdHRlcm4gaXMgYWxyZWFkeSBjYWNoZWQgYXQgQHBhdHRlcm5Gb3JPY2N1cnJlbmNlXG4gICAgaWYgQHJlcGVhdGVkIGFuZCBAb2NjdXJyZW5jZSBhbmQgbm90IEBvY2N1cnJlbmNlTWFuYWdlci5oYXNNYXJrZXJzKClcbiAgICAgIEBvY2N1cnJlbmNlTWFuYWdlci5hZGRQYXR0ZXJuKEBwYXR0ZXJuRm9yT2NjdXJyZW5jZSwge0BvY2N1cnJlbmNlVHlwZX0pXG5cbiAgICBAdGFyZ2V0LmV4ZWN1dGUoKVxuXG4gICAgQG11dGF0aW9uTWFuYWdlci5zZXRDaGVja3BvaW50KCdkaWQtc2VsZWN0JylcbiAgICBpZiBAb2NjdXJyZW5jZVxuICAgICAgIyBUbyByZXBvZWF0KGAuYCkgb3BlcmF0aW9uIHdoZXJlIG11bHRpcGxlIG9jY3VycmVuY2UgcGF0dGVybnMgd2FzIHNldC5cbiAgICAgICMgSGVyZSB3ZSBzYXZlIHBhdHRlcm5zIHdoaWNoIHJlcHJlc2VudCB1bmlvbmVkIHJlZ2V4IHdoaWNoIEBvY2N1cnJlbmNlTWFuYWdlciBrbm93cy5cbiAgICAgIEBwYXR0ZXJuRm9yT2NjdXJyZW5jZSA/PSBAb2NjdXJyZW5jZU1hbmFnZXIuYnVpbGRQYXR0ZXJuKClcblxuICAgICAgQG9jY3VycmVuY2VXaXNlID0gQHdpc2UgPyBcImNoYXJhY3Rlcndpc2VcIlxuICAgICAgaWYgQG9jY3VycmVuY2VNYW5hZ2VyLnNlbGVjdChAb2NjdXJyZW5jZVdpc2UpXG4gICAgICAgIEBvY2N1cnJlbmNlU2VsZWN0ZWQgPSB0cnVlXG4gICAgICAgIEBtdXRhdGlvbk1hbmFnZXIuc2V0Q2hlY2twb2ludCgnZGlkLXNlbGVjdC1vY2N1cnJlbmNlJylcblxuICAgIGlmIEB0YXJnZXRTZWxlY3RlZCA9IEB2aW1TdGF0ZS5oYXZlU29tZU5vbkVtcHR5U2VsZWN0aW9uKCkgb3IgQHRhcmdldC5uYW1lIGlzIFwiRW1wdHlcIlxuICAgICAgQGVtaXREaWRTZWxlY3RUYXJnZXQoKVxuICAgICAgQGZsYXNoQ2hhbmdlSWZOZWNlc3NhcnkoKVxuICAgICAgQHRyYWNrQ2hhbmdlSWZOZWNlc3NhcnkoKVxuICAgIGVsc2VcbiAgICAgIEBlbWl0RGlkRmFpbFNlbGVjdFRhcmdldCgpXG4gICAgcmV0dXJuIEB0YXJnZXRTZWxlY3RlZFxuXG4gIHJlc3RvcmVDdXJzb3JQb3NpdGlvbnNJZk5lY2Vzc2FyeTogLT5cbiAgICByZXR1cm4gdW5sZXNzIEByZXN0b3JlUG9zaXRpb25zXG4gICAgc3RheSA9IEBzdGF5QXRTYW1lUG9zaXRpb24gPyBAZ2V0Q29uZmlnKEBzdGF5T3B0aW9uTmFtZSkgb3IgKEBvY2N1cnJlbmNlU2VsZWN0ZWQgYW5kIEBnZXRDb25maWcoJ3N0YXlPbk9jY3VycmVuY2UnKSlcbiAgICB3aXNlID0gaWYgQG9jY3VycmVuY2VTZWxlY3RlZCB0aGVuIEBvY2N1cnJlbmNlV2lzZSBlbHNlIEB0YXJnZXQud2lzZVxuICAgIEBtdXRhdGlvbk1hbmFnZXIucmVzdG9yZUN1cnNvclBvc2l0aW9ucyh7c3RheSwgd2lzZSwgQHNldFRvRmlyc3RDaGFyYWN0ZXJPbkxpbmV3aXNlfSlcblxuIyBTZWxlY3RcbiMgV2hlbiB0ZXh0LW9iamVjdCBpcyBpbnZva2VkIGZyb20gbm9ybWFsIG9yIHZpdXNhbC1tb2RlLCBvcGVyYXRpb24gd291bGQgYmVcbiMgID0+IFNlbGVjdCBvcGVyYXRvciB3aXRoIHRhcmdldD10ZXh0LW9iamVjdFxuIyBXaGVuIG1vdGlvbiBpcyBpbnZva2VkIGZyb20gdmlzdWFsLW1vZGUsIG9wZXJhdGlvbiB3b3VsZCBiZVxuIyAgPT4gU2VsZWN0IG9wZXJhdG9yIHdpdGggdGFyZ2V0PW1vdGlvbilcbiMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiMgU2VsZWN0IGlzIHVzZWQgaW4gVFdPIHNpdHVhdGlvbi5cbiMgLSB2aXN1YWwtbW9kZSBvcGVyYXRpb25cbiMgICAtIGUuZzogYHYgbGAsIGBWIGpgLCBgdiBpIHBgLi4uXG4jIC0gRGlyZWN0bHkgaW52b2tlIHRleHQtb2JqZWN0IGZyb20gbm9ybWFsLW1vZGVcbiMgICAtIGUuZzogSW52b2tlIGBJbm5lciBQYXJhZ3JhcGhgIGZyb20gY29tbWFuZC1wYWxldHRlLlxuY2xhc3MgU2VsZWN0IGV4dGVuZHMgT3BlcmF0b3JcbiAgQGV4dGVuZChmYWxzZSlcbiAgZmxhc2hUYXJnZXQ6IGZhbHNlXG4gIHJlY29yZGFibGU6IGZhbHNlXG4gIGFjY2VwdFByZXNldE9jY3VycmVuY2U6IGZhbHNlXG4gIGFjY2VwdFBlcnNpc3RlbnRTZWxlY3Rpb246IGZhbHNlXG5cbiAgZXhlY3V0ZTogLT5cbiAgICBAc3RhcnRNdXRhdGlvbihAc2VsZWN0VGFyZ2V0LmJpbmQodGhpcykpXG5cbiAgICBpZiBAdGFyZ2V0LmlzVGV4dE9iamVjdCgpIGFuZCBAdGFyZ2V0LnNlbGVjdFN1Y2NlZWRlZFxuICAgICAgQGVkaXRvci5zY3JvbGxUb0N1cnNvclBvc2l0aW9uKClcbiAgICAgIEBhY3RpdmF0ZU1vZGVJZk5lY2Vzc2FyeSgndmlzdWFsJywgQHRhcmdldC53aXNlKVxuXG5jbGFzcyBTZWxlY3RMYXRlc3RDaGFuZ2UgZXh0ZW5kcyBTZWxlY3RcbiAgQGV4dGVuZCgpXG4gIEBkZXNjcmlwdGlvbjogXCJTZWxlY3QgbGF0ZXN0IHlhbmtlZCBvciBjaGFuZ2VkIHJhbmdlXCJcbiAgdGFyZ2V0OiAnQUxhdGVzdENoYW5nZSdcblxuY2xhc3MgU2VsZWN0UHJldmlvdXNTZWxlY3Rpb24gZXh0ZW5kcyBTZWxlY3RcbiAgQGV4dGVuZCgpXG4gIHRhcmdldDogXCJQcmV2aW91c1NlbGVjdGlvblwiXG5cbmNsYXNzIFNlbGVjdFBlcnNpc3RlbnRTZWxlY3Rpb24gZXh0ZW5kcyBTZWxlY3RcbiAgQGV4dGVuZCgpXG4gIEBkZXNjcmlwdGlvbjogXCJTZWxlY3QgcGVyc2lzdGVudC1zZWxlY3Rpb24gYW5kIGNsZWFyIGFsbCBwZXJzaXN0ZW50LXNlbGVjdGlvbiwgaXQncyBsaWtlIGNvbnZlcnQgdG8gcmVhbC1zZWxlY3Rpb25cIlxuICB0YXJnZXQ6IFwiQVBlcnNpc3RlbnRTZWxlY3Rpb25cIlxuXG5jbGFzcyBTZWxlY3RPY2N1cnJlbmNlIGV4dGVuZHMgT3BlcmF0b3JcbiAgQGV4dGVuZCgpXG4gIEBkZXNjcmlwdGlvbjogXCJBZGQgc2VsZWN0aW9uIG9udG8gZWFjaCBtYXRjaGluZyB3b3JkIHdpdGhpbiB0YXJnZXQgcmFuZ2VcIlxuICBvY2N1cnJlbmNlOiB0cnVlXG5cbiAgZXhlY3V0ZTogLT5cbiAgICBAc3RhcnRNdXRhdGlvbiA9PlxuICAgICAgaWYgQHNlbGVjdFRhcmdldCgpXG4gICAgICAgIEBhY3RpdmF0ZU1vZGVJZk5lY2Vzc2FyeSgndmlzdWFsJywgJ2NoYXJhY3Rlcndpc2UnKVxuXG4jIFBlcnNpc3RlbnQgU2VsZWN0aW9uXG4jID09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIENyZWF0ZVBlcnNpc3RlbnRTZWxlY3Rpb24gZXh0ZW5kcyBPcGVyYXRvclxuICBAZXh0ZW5kKClcbiAgZmxhc2hUYXJnZXQ6IGZhbHNlXG4gIHN0YXlBdFNhbWVQb3NpdGlvbjogdHJ1ZVxuICBhY2NlcHRQcmVzZXRPY2N1cnJlbmNlOiBmYWxzZVxuICBhY2NlcHRQZXJzaXN0ZW50U2VsZWN0aW9uOiBmYWxzZVxuXG4gIG11dGF0ZVNlbGVjdGlvbjogKHNlbGVjdGlvbikgLT5cbiAgICBAcGVyc2lzdGVudFNlbGVjdGlvbi5tYXJrQnVmZmVyUmFuZ2Uoc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKCkpXG5cbmNsYXNzIFRvZ2dsZVBlcnNpc3RlbnRTZWxlY3Rpb24gZXh0ZW5kcyBDcmVhdGVQZXJzaXN0ZW50U2VsZWN0aW9uXG4gIEBleHRlbmQoKVxuXG4gIGlzQ29tcGxldGU6IC0+XG4gICAgcG9pbnQgPSBAZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKClcbiAgICBAbWFya2VyVG9SZW1vdmUgPSBAcGVyc2lzdGVudFNlbGVjdGlvbi5nZXRNYXJrZXJBdFBvaW50KHBvaW50KVxuICAgIGlmIEBtYXJrZXJUb1JlbW92ZVxuICAgICAgdHJ1ZVxuICAgIGVsc2VcbiAgICAgIHN1cGVyXG5cbiAgZXhlY3V0ZTogLT5cbiAgICBpZiBAbWFya2VyVG9SZW1vdmVcbiAgICAgIEBtYXJrZXJUb1JlbW92ZS5kZXN0cm95KClcbiAgICBlbHNlXG4gICAgICBzdXBlclxuXG4jIFByZXNldCBPY2N1cnJlbmNlXG4jID09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIFRvZ2dsZVByZXNldE9jY3VycmVuY2UgZXh0ZW5kcyBPcGVyYXRvclxuICBAZXh0ZW5kKClcbiAgdGFyZ2V0OiBcIkVtcHR5XCJcbiAgZmxhc2hUYXJnZXQ6IGZhbHNlXG4gIGFjY2VwdFByZXNldE9jY3VycmVuY2U6IGZhbHNlXG4gIGFjY2VwdFBlcnNpc3RlbnRTZWxlY3Rpb246IGZhbHNlXG4gIG9jY3VycmVuY2VUeXBlOiAnYmFzZSdcblxuICBleGVjdXRlOiAtPlxuICAgIGlmIG1hcmtlciA9IEBvY2N1cnJlbmNlTWFuYWdlci5nZXRNYXJrZXJBdFBvaW50KEBlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKSlcbiAgICAgIEBvY2N1cnJlbmNlTWFuYWdlci5kZXN0cm95TWFya2VycyhbbWFya2VyXSlcbiAgICBlbHNlXG4gICAgICBwYXR0ZXJuID0gbnVsbFxuICAgICAgaXNOYXJyb3dlZCA9IEB2aW1TdGF0ZS5tb2RlTWFuYWdlci5pc05hcnJvd2VkKClcblxuICAgICAgaWYgQG1vZGUgaXMgJ3Zpc3VhbCcgYW5kIG5vdCBpc05hcnJvd2VkXG4gICAgICAgIEBvY2N1cnJlbmNlVHlwZSA9ICdiYXNlJ1xuICAgICAgICBwYXR0ZXJuID0gbmV3IFJlZ0V4cChfLmVzY2FwZVJlZ0V4cChAZWRpdG9yLmdldFNlbGVjdGVkVGV4dCgpKSwgJ2cnKVxuICAgICAgZWxzZVxuICAgICAgICBwYXR0ZXJuID0gQGdldFBhdHRlcm5Gb3JPY2N1cnJlbmNlVHlwZShAb2NjdXJyZW5jZVR5cGUpXG5cbiAgICAgIEBvY2N1cnJlbmNlTWFuYWdlci5hZGRQYXR0ZXJuKHBhdHRlcm4sIHtAb2NjdXJyZW5jZVR5cGV9KVxuICAgICAgQG9jY3VycmVuY2VNYW5hZ2VyLnNhdmVMYXN0UGF0dGVybihAb2NjdXJyZW5jZVR5cGUpXG5cbiAgICAgIEBhY3RpdmF0ZU1vZGUoJ25vcm1hbCcpIHVubGVzcyBpc05hcnJvd2VkXG5cbmNsYXNzIFRvZ2dsZVByZXNldFN1YndvcmRPY2N1cnJlbmNlIGV4dGVuZHMgVG9nZ2xlUHJlc2V0T2NjdXJyZW5jZVxuICBAZXh0ZW5kKClcbiAgb2NjdXJyZW5jZVR5cGU6ICdzdWJ3b3JkJ1xuXG4jIFdhbnQgdG8gcmVuYW1lIFJlc3RvcmVPY2N1cnJlbmNlTWFya2VyXG5jbGFzcyBBZGRQcmVzZXRPY2N1cnJlbmNlRnJvbUxhc3RPY2N1cnJlbmNlUGF0dGVybiBleHRlbmRzIFRvZ2dsZVByZXNldE9jY3VycmVuY2VcbiAgQGV4dGVuZCgpXG4gIGV4ZWN1dGU6IC0+XG4gICAgQG9jY3VycmVuY2VNYW5hZ2VyLnJlc2V0UGF0dGVybnMoKVxuICAgIGlmIHBhdHRlcm4gPSBAdmltU3RhdGUuZ2xvYmFsU3RhdGUuZ2V0KCdsYXN0T2NjdXJyZW5jZVBhdHRlcm4nKVxuICAgICAgb2NjdXJyZW5jZVR5cGUgPSBAdmltU3RhdGUuZ2xvYmFsU3RhdGUuZ2V0KFwibGFzdE9jY3VycmVuY2VUeXBlXCIpXG4gICAgICBAb2NjdXJyZW5jZU1hbmFnZXIuYWRkUGF0dGVybihwYXR0ZXJuLCB7b2NjdXJyZW5jZVR5cGV9KVxuICAgICAgQGFjdGl2YXRlTW9kZSgnbm9ybWFsJylcblxuIyBEZWxldGVcbiMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIERlbGV0ZSBleHRlbmRzIE9wZXJhdG9yXG4gIEBleHRlbmQoKVxuICB0cmFja0NoYW5nZTogdHJ1ZVxuICBmbGFzaENoZWNrcG9pbnQ6ICdkaWQtc2VsZWN0LW9jY3VycmVuY2UnXG4gIGZsYXNoVHlwZUZvck9jY3VycmVuY2U6ICdvcGVyYXRvci1yZW1vdmUtb2NjdXJyZW5jZSdcbiAgc3RheU9wdGlvbk5hbWU6ICdzdGF5T25EZWxldGUnXG4gIHNldFRvRmlyc3RDaGFyYWN0ZXJPbkxpbmV3aXNlOiB0cnVlXG5cbiAgZXhlY3V0ZTogLT5cbiAgICBAb25EaWRTZWxlY3RUYXJnZXQgPT5cbiAgICAgIEBmbGFzaFRhcmdldCA9IGZhbHNlIGlmIChAb2NjdXJyZW5jZVNlbGVjdGVkIGFuZCBAb2NjdXJyZW5jZVdpc2UgaXMgXCJsaW5ld2lzZVwiKVxuXG4gICAgQHJlc3RvcmVQb3NpdGlvbnMgPSBmYWxzZSAgaWYgQHRhcmdldC53aXNlIGlzICdibG9ja3dpc2UnXG4gICAgc3VwZXJcblxuICBtdXRhdGVTZWxlY3Rpb246IChzZWxlY3Rpb24pIC0+XG4gICAgQHNldFRleHRUb1JlZ2lzdGVyRm9yU2VsZWN0aW9uKHNlbGVjdGlvbilcbiAgICBzZWxlY3Rpb24uZGVsZXRlU2VsZWN0ZWRUZXh0KClcblxuY2xhc3MgRGVsZXRlUmlnaHQgZXh0ZW5kcyBEZWxldGVcbiAgQGV4dGVuZCgpXG4gIHRhcmdldDogJ01vdmVSaWdodCdcblxuY2xhc3MgRGVsZXRlTGVmdCBleHRlbmRzIERlbGV0ZVxuICBAZXh0ZW5kKClcbiAgdGFyZ2V0OiAnTW92ZUxlZnQnXG5cbmNsYXNzIERlbGV0ZVRvTGFzdENoYXJhY3Rlck9mTGluZSBleHRlbmRzIERlbGV0ZVxuICBAZXh0ZW5kKClcbiAgdGFyZ2V0OiAnTW92ZVRvTGFzdENoYXJhY3Rlck9mTGluZSdcblxuICBleGVjdXRlOiAtPlxuICAgIGlmIEB0YXJnZXQud2lzZSBpcyAnYmxvY2t3aXNlJ1xuICAgICAgQG9uRGlkU2VsZWN0VGFyZ2V0ID0+XG4gICAgICAgIGZvciBibG9ja3dpc2VTZWxlY3Rpb24gaW4gQGdldEJsb2Nrd2lzZVNlbGVjdGlvbnMoKVxuICAgICAgICAgIGJsb2Nrd2lzZVNlbGVjdGlvbi5leHRlbmRNZW1iZXJTZWxlY3Rpb25zVG9FbmRPZkxpbmUoKVxuICAgIHN1cGVyXG5cbmNsYXNzIERlbGV0ZUxpbmUgZXh0ZW5kcyBEZWxldGVcbiAgQGV4dGVuZCgpXG4gIHdpc2U6ICdsaW5ld2lzZSdcbiAgdGFyZ2V0OiBcIk1vdmVUb1JlbGF0aXZlTGluZVwiXG4gIGZsYXNoVGFyZ2V0OiBmYWxzZVxuXG4jIFlhbmtcbiMgPT09PT09PT09PT09PT09PT09PT09PT09PVxuY2xhc3MgWWFuayBleHRlbmRzIE9wZXJhdG9yXG4gIEBleHRlbmQoKVxuICB0cmFja0NoYW5nZTogdHJ1ZVxuICBzdGF5T3B0aW9uTmFtZTogJ3N0YXlPbllhbmsnXG5cbiAgbXV0YXRlU2VsZWN0aW9uOiAoc2VsZWN0aW9uKSAtPlxuICAgIEBzZXRUZXh0VG9SZWdpc3RlckZvclNlbGVjdGlvbihzZWxlY3Rpb24pXG5cbmNsYXNzIFlhbmtMaW5lIGV4dGVuZHMgWWFua1xuICBAZXh0ZW5kKClcbiAgd2lzZTogJ2xpbmV3aXNlJ1xuICB0YXJnZXQ6IFwiTW92ZVRvUmVsYXRpdmVMaW5lXCJcblxuY2xhc3MgWWFua1RvTGFzdENoYXJhY3Rlck9mTGluZSBleHRlbmRzIFlhbmtcbiAgQGV4dGVuZCgpXG4gIHRhcmdldDogJ01vdmVUb0xhc3RDaGFyYWN0ZXJPZkxpbmUnXG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBbY3RybC1hXVxuY2xhc3MgSW5jcmVhc2UgZXh0ZW5kcyBPcGVyYXRvclxuICBAZXh0ZW5kKClcbiAgdGFyZ2V0OiBcIkVtcHR5XCIgIyBjdHJsLWEgaW4gbm9ybWFsLW1vZGUgZmluZCB0YXJnZXQgbnVtYmVyIGluIGN1cnJlbnQgbGluZSBtYW51YWxseVxuICBmbGFzaFRhcmdldDogZmFsc2UgIyBkbyBtYW51YWxseVxuICByZXN0b3JlUG9zaXRpb25zOiBmYWxzZSAjIGRvIG1hbnVhbGx5XG4gIHN0ZXA6IDFcblxuICBleGVjdXRlOiAtPlxuICAgIEBuZXdSYW5nZXMgPSBbXVxuICAgIHN1cGVyXG4gICAgaWYgQG5ld1Jhbmdlcy5sZW5ndGhcbiAgICAgIGlmIEBnZXRDb25maWcoJ2ZsYXNoT25PcGVyYXRlJykgYW5kIEBuYW1lIG5vdCBpbiBAZ2V0Q29uZmlnKCdmbGFzaE9uT3BlcmF0ZUJsYWNrbGlzdCcpXG4gICAgICAgIEB2aW1TdGF0ZS5mbGFzaChAbmV3UmFuZ2VzLCB0eXBlOiBAZmxhc2hUeXBlRm9yT2NjdXJyZW5jZSlcblxuICByZXBsYWNlTnVtYmVySW5CdWZmZXJSYW5nZTogKHNjYW5SYW5nZSwgZm49bnVsbCkgLT5cbiAgICBuZXdSYW5nZXMgPSBbXVxuICAgIEBwYXR0ZXJuID89IC8vLyN7QGdldENvbmZpZygnbnVtYmVyUmVnZXgnKX0vLy9nXG4gICAgQHNjYW5Gb3J3YXJkIEBwYXR0ZXJuLCB7c2NhblJhbmdlfSwgKGV2ZW50KSA9PlxuICAgICAgcmV0dXJuIGlmIGZuPyBhbmQgbm90IGZuKGV2ZW50KVxuICAgICAge21hdGNoVGV4dCwgcmVwbGFjZX0gPSBldmVudFxuICAgICAgbmV4dE51bWJlciA9IEBnZXROZXh0TnVtYmVyKG1hdGNoVGV4dClcbiAgICAgIG5ld1Jhbmdlcy5wdXNoKHJlcGxhY2UoU3RyaW5nKG5leHROdW1iZXIpKSlcbiAgICBuZXdSYW5nZXNcblxuICBtdXRhdGVTZWxlY3Rpb246IChzZWxlY3Rpb24pIC0+XG4gICAge2N1cnNvcn0gPSBzZWxlY3Rpb25cbiAgICBpZiBAdGFyZ2V0LmlzKCdFbXB0eScpICMgY3RybC1hLCBjdHJsLXggaW4gYG5vcm1hbC1tb2RlYFxuICAgICAgY3Vyc29yUG9zaXRpb24gPSBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuICAgICAgc2NhblJhbmdlID0gQGVkaXRvci5idWZmZXJSYW5nZUZvckJ1ZmZlclJvdyhjdXJzb3JQb3NpdGlvbi5yb3cpXG4gICAgICBuZXdSYW5nZXMgPSBAcmVwbGFjZU51bWJlckluQnVmZmVyUmFuZ2Ugc2NhblJhbmdlLCAoe3JhbmdlLCBzdG9wfSkgLT5cbiAgICAgICAgaWYgcmFuZ2UuZW5kLmlzR3JlYXRlclRoYW4oY3Vyc29yUG9zaXRpb24pXG4gICAgICAgICAgc3RvcCgpXG4gICAgICAgICAgdHJ1ZVxuICAgICAgICBlbHNlXG4gICAgICAgICAgZmFsc2VcblxuICAgICAgcG9pbnQgPSBuZXdSYW5nZXNbMF0/LmVuZC50cmFuc2xhdGUoWzAsIC0xXSkgPyBjdXJzb3JQb3NpdGlvblxuICAgICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHBvaW50KVxuICAgIGVsc2VcbiAgICAgIHNjYW5SYW5nZSA9IHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpXG4gICAgICBAbmV3UmFuZ2VzLnB1c2goQHJlcGxhY2VOdW1iZXJJbkJ1ZmZlclJhbmdlKHNjYW5SYW5nZSkuLi4pXG4gICAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24oc2NhblJhbmdlLnN0YXJ0KVxuXG4gIGdldE5leHROdW1iZXI6IChudW1iZXJTdHJpbmcpIC0+XG4gICAgTnVtYmVyLnBhcnNlSW50KG51bWJlclN0cmluZywgMTApICsgQHN0ZXAgKiBAZ2V0Q291bnQoKVxuXG4jIFtjdHJsLXhdXG5jbGFzcyBEZWNyZWFzZSBleHRlbmRzIEluY3JlYXNlXG4gIEBleHRlbmQoKVxuICBzdGVwOiAtMVxuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgW2cgY3RybC1hXVxuY2xhc3MgSW5jcmVtZW50TnVtYmVyIGV4dGVuZHMgSW5jcmVhc2VcbiAgQGV4dGVuZCgpXG4gIGJhc2VOdW1iZXI6IG51bGxcbiAgdGFyZ2V0OiBudWxsXG4gIG11dGF0ZVNlbGVjdGlvbk9yZGVyZDogdHJ1ZVxuXG4gIGdldE5leHROdW1iZXI6IChudW1iZXJTdHJpbmcpIC0+XG4gICAgaWYgQGJhc2VOdW1iZXI/XG4gICAgICBAYmFzZU51bWJlciArPSBAc3RlcCAqIEBnZXRDb3VudCgpXG4gICAgZWxzZVxuICAgICAgQGJhc2VOdW1iZXIgPSBOdW1iZXIucGFyc2VJbnQobnVtYmVyU3RyaW5nLCAxMClcbiAgICBAYmFzZU51bWJlclxuXG4jIFtnIGN0cmwteF1cbmNsYXNzIERlY3JlbWVudE51bWJlciBleHRlbmRzIEluY3JlbWVudE51bWJlclxuICBAZXh0ZW5kKClcbiAgc3RlcDogLTFcblxuIyBQdXRcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBDdXJzb3IgcGxhY2VtZW50OlxuIyAtIHBsYWNlIGF0IGVuZCBvZiBtdXRhdGlvbjogcGFzdGUgbm9uLW11bHRpbGluZSBjaGFyYWN0ZXJ3aXNlIHRleHRcbiMgLSBwbGFjZSBhdCBzdGFydCBvZiBtdXRhdGlvbjogbm9uLW11bHRpbGluZSBjaGFyYWN0ZXJ3aXNlIHRleHQoY2hhcmFjdGVyd2lzZSwgbGluZXdpc2UpXG5jbGFzcyBQdXRCZWZvcmUgZXh0ZW5kcyBPcGVyYXRvclxuICBAZXh0ZW5kKClcbiAgbG9jYXRpb246ICdiZWZvcmUnXG4gIHRhcmdldDogJ0VtcHR5J1xuICBmbGFzaFR5cGU6ICdvcGVyYXRvci1sb25nJ1xuICByZXN0b3JlUG9zaXRpb25zOiBmYWxzZSAjIG1hbmFnZSBtYW51YWxseVxuICBmbGFzaFRhcmdldDogZmFsc2UgIyBtYW5hZ2UgbWFudWFsbHlcbiAgdHJhY2tDaGFuZ2U6IGZhbHNlICMgbWFuYWdlIG1hbnVhbGx5XG5cbiAgaW5pdGlhbGl6ZTogLT5cbiAgICBAdmltU3RhdGUuc2VxdWVudGlhbFBhc3RlTWFuYWdlci5vbkluaXRpYWxpemUodGhpcylcblxuICBleGVjdXRlOiAtPlxuICAgIEBtdXRhdGlvbnNCeVNlbGVjdGlvbiA9IG5ldyBNYXAoKVxuICAgIEBzZXF1ZW50aWFsUGFzdGUgPSBAdmltU3RhdGUuc2VxdWVudGlhbFBhc3RlTWFuYWdlci5vbkV4ZWN1dGUodGhpcylcblxuICAgIEBvbkRpZEZpbmlzaE11dGF0aW9uID0+XG4gICAgICBAYWRqdXN0Q3Vyc29yUG9zaXRpb24oKSB1bmxlc3MgQGNhbmNlbGxlZFxuXG4gICAgc3VwZXJcblxuICAgIHJldHVybiBpZiBAY2FuY2VsbGVkXG5cbiAgICBAb25EaWRGaW5pc2hPcGVyYXRpb24gPT5cbiAgICAgICMgVHJhY2tDaGFuZ2VcbiAgICAgIGlmIG5ld1JhbmdlID0gQG11dGF0aW9uc0J5U2VsZWN0aW9uLmdldChAZWRpdG9yLmdldExhc3RTZWxlY3Rpb24oKSlcbiAgICAgICAgQHNldE1hcmtGb3JDaGFuZ2UobmV3UmFuZ2UpXG5cbiAgICAgICMgRmxhc2hcbiAgICAgIGlmIEBnZXRDb25maWcoJ2ZsYXNoT25PcGVyYXRlJykgYW5kIEBuYW1lIG5vdCBpbiBAZ2V0Q29uZmlnKCdmbGFzaE9uT3BlcmF0ZUJsYWNrbGlzdCcpXG4gICAgICAgIHRvUmFuZ2UgPSAoc2VsZWN0aW9uKSA9PiBAbXV0YXRpb25zQnlTZWxlY3Rpb24uZ2V0KHNlbGVjdGlvbilcbiAgICAgICAgQHZpbVN0YXRlLmZsYXNoKEBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpLm1hcCh0b1JhbmdlKSwgdHlwZTogQGdldEZsYXNoVHlwZSgpKVxuXG4gIGFkanVzdEN1cnNvclBvc2l0aW9uOiAtPlxuICAgIGZvciBzZWxlY3Rpb24gaW4gQGVkaXRvci5nZXRTZWxlY3Rpb25zKCkgd2hlbiBAbXV0YXRpb25zQnlTZWxlY3Rpb24uaGFzKHNlbGVjdGlvbilcbiAgICAgIHtjdXJzb3J9ID0gc2VsZWN0aW9uXG4gICAgICB7c3RhcnQsIGVuZH0gPSBuZXdSYW5nZSA9IEBtdXRhdGlvbnNCeVNlbGVjdGlvbi5nZXQoc2VsZWN0aW9uKVxuICAgICAgaWYgQGxpbmV3aXNlUGFzdGVcbiAgICAgICAgbW92ZUN1cnNvclRvRmlyc3RDaGFyYWN0ZXJBdFJvdyhjdXJzb3IsIHN0YXJ0LnJvdylcbiAgICAgIGVsc2VcbiAgICAgICAgaWYgbmV3UmFuZ2UuaXNTaW5nbGVMaW5lKClcbiAgICAgICAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24oZW5kLnRyYW5zbGF0ZShbMCwgLTFdKSlcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihzdGFydClcblxuICBtdXRhdGVTZWxlY3Rpb246IChzZWxlY3Rpb24pIC0+XG4gICAge3RleHQsIHR5cGV9ID0gQHZpbVN0YXRlLnJlZ2lzdGVyLmdldChudWxsLCBzZWxlY3Rpb24sIEBzZXF1ZW50aWFsUGFzdGUpXG4gICAgdW5sZXNzIHRleHRcbiAgICAgIEBjYW5jZWxsZWQgPSB0cnVlXG4gICAgICByZXR1cm5cblxuICAgIHRleHQgPSBfLm11bHRpcGx5U3RyaW5nKHRleHQsIEBnZXRDb3VudCgpKVxuICAgIEBsaW5ld2lzZVBhc3RlID0gdHlwZSBpcyAnbGluZXdpc2UnIG9yIEBpc01vZGUoJ3Zpc3VhbCcsICdsaW5ld2lzZScpXG4gICAgbmV3UmFuZ2UgPSBAcGFzdGUoc2VsZWN0aW9uLCB0ZXh0LCB7QGxpbmV3aXNlUGFzdGV9KVxuICAgIEBtdXRhdGlvbnNCeVNlbGVjdGlvbi5zZXQoc2VsZWN0aW9uLCBuZXdSYW5nZSlcbiAgICBAdmltU3RhdGUuc2VxdWVudGlhbFBhc3RlTWFuYWdlci5zYXZlUGFzdGVkUmFuZ2VGb3JTZWxlY3Rpb24oc2VsZWN0aW9uLCBuZXdSYW5nZSlcblxuICBwYXN0ZTogKHNlbGVjdGlvbiwgdGV4dCwge2xpbmV3aXNlUGFzdGV9KSAtPlxuICAgIGlmIEBzZXF1ZW50aWFsUGFzdGVcbiAgICAgIEBwYXN0ZUNoYXJhY3Rlcndpc2Uoc2VsZWN0aW9uLCB0ZXh0KVxuICAgIGVsc2UgaWYgbGluZXdpc2VQYXN0ZVxuICAgICAgQHBhc3RlTGluZXdpc2Uoc2VsZWN0aW9uLCB0ZXh0KVxuICAgIGVsc2VcbiAgICAgIEBwYXN0ZUNoYXJhY3Rlcndpc2Uoc2VsZWN0aW9uLCB0ZXh0KVxuXG4gIHBhc3RlQ2hhcmFjdGVyd2lzZTogKHNlbGVjdGlvbiwgdGV4dCkgLT5cbiAgICB7Y3Vyc29yfSA9IHNlbGVjdGlvblxuICAgIGlmIHNlbGVjdGlvbi5pc0VtcHR5KCkgYW5kIEBsb2NhdGlvbiBpcyAnYWZ0ZXInIGFuZCBub3QgaXNFbXB0eVJvdyhAZWRpdG9yLCBjdXJzb3IuZ2V0QnVmZmVyUm93KCkpXG4gICAgICBjdXJzb3IubW92ZVJpZ2h0KClcbiAgICByZXR1cm4gc2VsZWN0aW9uLmluc2VydFRleHQodGV4dClcblxuICAjIFJldHVybiBuZXdSYW5nZVxuICBwYXN0ZUxpbmV3aXNlOiAoc2VsZWN0aW9uLCB0ZXh0KSAtPlxuICAgIHtjdXJzb3J9ID0gc2VsZWN0aW9uXG4gICAgY3Vyc29yUm93ID0gY3Vyc29yLmdldEJ1ZmZlclJvdygpXG4gICAgdGV4dCArPSBcIlxcblwiIHVubGVzcyB0ZXh0LmVuZHNXaXRoKFwiXFxuXCIpXG4gICAgaWYgc2VsZWN0aW9uLmlzRW1wdHkoKVxuICAgICAgaWYgQGxvY2F0aW9uIGlzICdiZWZvcmUnXG4gICAgICAgIGluc2VydFRleHRBdEJ1ZmZlclBvc2l0aW9uKEBlZGl0b3IsIFtjdXJzb3JSb3csIDBdLCB0ZXh0KVxuICAgICAgZWxzZSBpZiBAbG9jYXRpb24gaXMgJ2FmdGVyJ1xuICAgICAgICB0YXJnZXRSb3cgPSBAZ2V0Rm9sZEVuZFJvd0ZvclJvdyhjdXJzb3JSb3cpXG4gICAgICAgIGVuc3VyZUVuZHNXaXRoTmV3TGluZUZvckJ1ZmZlclJvdyhAZWRpdG9yLCB0YXJnZXRSb3cpXG4gICAgICAgIGluc2VydFRleHRBdEJ1ZmZlclBvc2l0aW9uKEBlZGl0b3IsIFt0YXJnZXRSb3cgKyAxLCAwXSwgdGV4dClcbiAgICBlbHNlXG4gICAgICBzZWxlY3Rpb24uaW5zZXJ0VGV4dChcIlxcblwiKSB1bmxlc3MgQGlzTW9kZSgndmlzdWFsJywgJ2xpbmV3aXNlJylcbiAgICAgIHNlbGVjdGlvbi5pbnNlcnRUZXh0KHRleHQpXG5cbmNsYXNzIFB1dEFmdGVyIGV4dGVuZHMgUHV0QmVmb3JlXG4gIEBleHRlbmQoKVxuICBsb2NhdGlvbjogJ2FmdGVyJ1xuXG5jbGFzcyBQdXRCZWZvcmVXaXRoQXV0b0luZGVudCBleHRlbmRzIFB1dEJlZm9yZVxuICBAZXh0ZW5kKClcblxuICBwYXN0ZUxpbmV3aXNlOiAoc2VsZWN0aW9uLCB0ZXh0KSAtPlxuICAgIG5ld1JhbmdlID0gc3VwZXJcbiAgICBhZGp1c3RJbmRlbnRXaXRoS2VlcGluZ0xheW91dChAZWRpdG9yLCBuZXdSYW5nZSlcbiAgICByZXR1cm4gbmV3UmFuZ2VcblxuY2xhc3MgUHV0QWZ0ZXJXaXRoQXV0b0luZGVudCBleHRlbmRzIFB1dEJlZm9yZVdpdGhBdXRvSW5kZW50XG4gIEBleHRlbmQoKVxuICBsb2NhdGlvbjogJ2FmdGVyJ1xuXG5jbGFzcyBBZGRCbGFua0xpbmVCZWxvdyBleHRlbmRzIE9wZXJhdG9yXG4gIEBleHRlbmQoKVxuICBmbGFzaFRhcmdldDogZmFsc2VcbiAgdGFyZ2V0OiBcIkVtcHR5XCJcbiAgc3RheUF0U2FtZVBvc2l0aW9uOiB0cnVlXG4gIHN0YXlCeU1hcmtlcjogdHJ1ZVxuICB3aGVyZTogJ2JlbG93J1xuXG4gIG11dGF0ZVNlbGVjdGlvbjogKHNlbGVjdGlvbikgLT5cbiAgICByb3cgPSBzZWxlY3Rpb24uZ2V0SGVhZEJ1ZmZlclBvc2l0aW9uKCkucm93XG4gICAgcm93ICs9IDEgaWYgQHdoZXJlIGlzICdiZWxvdydcbiAgICBwb2ludCA9IFtyb3csIDBdXG4gICAgQGVkaXRvci5zZXRUZXh0SW5CdWZmZXJSYW5nZShbcG9pbnQsIHBvaW50XSwgXCJcXG5cIi5yZXBlYXQoQGdldENvdW50KCkpKVxuXG5jbGFzcyBBZGRCbGFua0xpbmVBYm92ZSBleHRlbmRzIEFkZEJsYW5rTGluZUJlbG93XG4gIEBleHRlbmQoKVxuICB3aGVyZTogJ2Fib3ZlJ1xuIl19
