(function() {
  var AddBlankLineAbove, AddBlankLineBelow, AddPresetOccurrenceFromLastOccurrencePattern, Base, CreatePersistentSelection, Decrease, DecrementNumber, Delete, DeleteLeft, DeleteLine, DeleteRight, DeleteToLastCharacterOfLine, Increase, IncrementNumber, Operator, PutAfter, PutAfterWithAutoIndent, PutBefore, PutBeforeWithAutoIndent, Select, SelectBase, SelectInVisualMode, SelectLatestChange, SelectOccurrence, SelectPersistentSelection, SelectPreviousSelection, TogglePersistentSelection, TogglePresetOccurrence, TogglePresetSubwordOccurrence, Yank, YankLine, YankToLastCharacterOfLine, _, adjustIndentWithKeepingLayout, ensureEndsWithNewLineForBufferRow, getSubwordPatternAtBufferPosition, getWordPatternAtBufferPosition, insertTextAtBufferPosition, isEmptyRow, isSingleLineText, moveCursorToFirstCharacterAtRow, ref, setBufferRow,
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

  SelectBase = (function(superClass) {
    extend(SelectBase, superClass);

    function SelectBase() {
      return SelectBase.__super__.constructor.apply(this, arguments);
    }

    SelectBase.extend(false);

    SelectBase.prototype.flashTarget = false;

    SelectBase.prototype.recordable = false;

    SelectBase.prototype.execute = function() {
      var wise;
      this.startMutation((function(_this) {
        return function() {
          return _this.selectTarget();
        };
      })(this));
      if (this.target.selectSucceeded) {
        if (this.target.isTextObject()) {
          this.editor.scrollToCursorPosition();
        }
        wise = this.occurrenceSelected ? this.occurrenceWise : this.target.wise;
        return this.activateModeIfNecessary('visual', wise);
      } else {
        return this.cancelOperation();
      }
    };

    return SelectBase;

  })(Operator);

  Select = (function(superClass) {
    extend(Select, superClass);

    function Select() {
      return Select.__super__.constructor.apply(this, arguments);
    }

    Select.extend();

    Select.prototype.execute = function() {
      var $selection, i, len, ref1;
      ref1 = this.swrap.getSelections(this.editor);
      for (i = 0, len = ref1.length; i < len; i++) {
        $selection = ref1[i];
        if (!$selection.hasProperties()) {
          $selection.saveProperties();
        }
      }
      return Select.__super__.execute.apply(this, arguments);
    };

    return Select;

  })(SelectBase);

  SelectLatestChange = (function(superClass) {
    extend(SelectLatestChange, superClass);

    function SelectLatestChange() {
      return SelectLatestChange.__super__.constructor.apply(this, arguments);
    }

    SelectLatestChange.extend();

    SelectLatestChange.description = "Select latest yanked or changed range";

    SelectLatestChange.prototype.target = 'ALatestChange';

    return SelectLatestChange;

  })(SelectBase);

  SelectPreviousSelection = (function(superClass) {
    extend(SelectPreviousSelection, superClass);

    function SelectPreviousSelection() {
      return SelectPreviousSelection.__super__.constructor.apply(this, arguments);
    }

    SelectPreviousSelection.extend();

    SelectPreviousSelection.prototype.target = "PreviousSelection";

    return SelectPreviousSelection;

  })(SelectBase);

  SelectPersistentSelection = (function(superClass) {
    extend(SelectPersistentSelection, superClass);

    function SelectPersistentSelection() {
      return SelectPersistentSelection.__super__.constructor.apply(this, arguments);
    }

    SelectPersistentSelection.extend();

    SelectPersistentSelection.description = "Select persistent-selection and clear all persistent-selection, it's like convert to real-selection";

    SelectPersistentSelection.prototype.target = "APersistentSelection";

    SelectPersistentSelection.prototype.acceptPersistentSelection = false;

    return SelectPersistentSelection;

  })(SelectBase);

  SelectOccurrence = (function(superClass) {
    extend(SelectOccurrence, superClass);

    function SelectOccurrence() {
      return SelectOccurrence.__super__.constructor.apply(this, arguments);
    }

    SelectOccurrence.extend();

    SelectOccurrence.description = "Add selection onto each matching word within target range";

    SelectOccurrence.prototype.occurrence = true;

    return SelectOccurrence;

  })(SelectBase);

  SelectInVisualMode = (function(superClass) {
    extend(SelectInVisualMode, superClass);

    function SelectInVisualMode() {
      return SelectInVisualMode.__super__.constructor.apply(this, arguments);
    }

    SelectInVisualMode.extend(false);

    SelectInVisualMode.prototype.acceptPresetOccurrence = false;

    SelectInVisualMode.prototype.acceptPersistentSelection = false;

    return SelectInVisualMode;

  })(SelectBase);

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
      return (this.markerToRemove != null) || TogglePersistentSelection.__super__.isComplete.apply(this, arguments);
    };

    TogglePersistentSelection.prototype.execute = function() {
      if (this.markerToRemove != null) {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvb3BlcmF0b3IuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSx3ekJBQUE7SUFBQTs7OztFQUFBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVI7O0VBQ0osTUFVSSxPQUFBLENBQVEsU0FBUixDQVZKLEVBQ0UsMkJBREYsRUFFRSxtRUFGRixFQUdFLHlFQUhGLEVBSUUsMkRBSkYsRUFLRSwrQkFMRixFQU1FLHFFQU5GLEVBT0UseUVBUEYsRUFRRSxpRUFSRixFQVNFOztFQUVGLElBQUEsR0FBTyxPQUFBLENBQVEsUUFBUjs7RUFFRDs7O0lBQ0osUUFBQyxDQUFBLE1BQUQsQ0FBUSxLQUFSOztJQUNBLFFBQUMsQ0FBQSxhQUFELEdBQWdCOzt1QkFDaEIsYUFBQSxHQUFlOzt1QkFDZixVQUFBLEdBQVk7O3VCQUVaLElBQUEsR0FBTTs7dUJBQ04sVUFBQSxHQUFZOzt1QkFDWixjQUFBLEdBQWdCOzt1QkFFaEIsV0FBQSxHQUFhOzt1QkFDYixlQUFBLEdBQWlCOzt1QkFDakIsU0FBQSxHQUFXOzt1QkFDWCxzQkFBQSxHQUF3Qjs7dUJBQ3hCLFdBQUEsR0FBYTs7dUJBRWIsb0JBQUEsR0FBc0I7O3VCQUN0QixrQkFBQSxHQUFvQjs7dUJBQ3BCLGNBQUEsR0FBZ0I7O3VCQUNoQixZQUFBLEdBQWM7O3VCQUNkLGdCQUFBLEdBQWtCOzt1QkFDbEIsNkJBQUEsR0FBK0I7O3VCQUUvQixzQkFBQSxHQUF3Qjs7dUJBQ3hCLHlCQUFBLEdBQTJCOzt1QkFFM0IseUJBQUEsR0FBMkI7O3VCQUMzQixxQkFBQSxHQUF1Qjs7dUJBSXZCLGtCQUFBLEdBQW9COzt1QkFDcEIsY0FBQSxHQUFnQjs7dUJBQ2hCLGNBQUEsR0FBZ0IsU0FBQTthQUNkLElBQUMsQ0FBQSxrQkFBRCxJQUF3QixDQUFJLElBQUMsQ0FBQTtJ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NkIsQ0FBQyxLQUFELEVBQVEsS0FBUixDQUE3QixFQUE2QyxJQUFJLENBQUMsTUFBTCxDQUFZLElBQUMsQ0FBQSxRQUFELENBQUEsQ0FBWixDQUE3QztJQUplOzs7O0tBUmE7O0VBYzFCOzs7Ozs7O0lBQ0osaUJBQUMsQ0FBQSxNQUFELENBQUE7O2dDQUNBLEtBQUEsR0FBTzs7OztLQUZ1QjtBQWpyQmhDIiwic291cmNlc0NvbnRlbnQiOlsiXyA9IHJlcXVpcmUgJ3VuZGVyc2NvcmUtcGx1cydcbntcbiAgaXNFbXB0eVJvd1xuICBnZXRXb3JkUGF0dGVybkF0QnVmZmVyUG9zaXRpb25cbiAgZ2V0U3Vid29yZFBhdHRlcm5BdEJ1ZmZlclBvc2l0aW9uXG4gIGluc2VydFRleHRBdEJ1ZmZlclBvc2l0aW9uXG4gIHNldEJ1ZmZlclJvd1xuICBtb3ZlQ3Vyc29yVG9GaXJzdENoYXJhY3RlckF0Um93XG4gIGVuc3VyZUVuZHNXaXRoTmV3TGluZUZvckJ1ZmZlclJvd1xuICBhZGp1c3RJbmRlbnRXaXRoS2VlcGluZ0xheW91dFxuICBpc1NpbmdsZUxpbmVUZXh0XG59ID0gcmVxdWlyZSAnLi91dGlscydcbkJhc2UgPSByZXF1aXJlICcuL2Jhc2UnXG5cbmNsYXNzIE9wZXJhdG9yIGV4dGVuZHMgQmFzZVxuICBAZXh0ZW5kKGZhbHNlKVxuICBAb3BlcmF0aW9uS2luZDogJ29wZXJhdG9yJ1xuICByZXF1aXJlVGFyZ2V0OiB0cnVlXG4gIHJlY29yZGFibGU6IHRydWVcblxuICB3aXNlOiBudWxsXG4gIG9jY3VycmVuY2U6IGZhbHNlXG4gIG9jY3VycmVuY2VUeXBlOiAnYmFzZSdcblxuICBmbGFzaFRhcmdldDogdHJ1ZVxuICBmbGFzaENoZWNrcG9pbnQ6ICdkaWQtZmluaXNoJ1xuICBmbGFzaFR5cGU6ICdvcGVyYXRvcidcbiAgZmxhc2hUeXBlRm9yT2NjdXJyZW5jZTogJ29wZXJhdG9yLW9jY3VycmVuY2UnXG4gIHRyYWNrQ2hhbmdlOiBmYWxzZVxuXG4gIHBhdHRlcm5Gb3JPY2N1cnJlbmNlOiBudWxsXG4gIHN0YXlBdFNhbWVQb3NpdGlvbjogbnVsbFxuICBzdGF5T3B0aW9uTmFtZTogbnVsbFxuICBzdGF5QnlNYXJrZXI6IGZhbHNlXG4gIHJlc3RvcmVQb3NpdGlvbnM6IHRydWVcbiAgc2V0VG9GaXJzdENoYXJhY3Rlck9uTGluZXdpc2U6IGZhbHNlXG5cbiAgYWNjZXB0UHJlc2V0T2NjdXJyZW5jZTogdHJ1ZVxuICBhY2NlcHRQZXJzaXN0ZW50U2VsZWN0aW9uOiB0cnVlXG5cbiAgYnVmZmVyQ2hlY2twb2ludEJ5UHVycG9zZTogbnVsbFxuICBtdXRhdGVTZWxlY3Rpb25PcmRlcmQ6IGZhbHNlXG5cbiAgIyBFeHBlcmltZW50YWx5IGFsbG93IHNlbGVjdFRhcmdldCBiZWZvcmUgaW5wdXQgQ29tcGxldGVcbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIHN1cHBvcnRFYXJseVNlbGVjdDogZmFsc2VcbiAgdGFyZ2V0U2VsZWN0ZWQ6IG51bGxcbiAgY2FuRWFybHlTZWxlY3Q6IC0+XG4gICAgQHN1cHBvcnRFYXJseVNlbGVjdCBhbmQgbm90IEByZXBlYXRlZFxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAjIENhbGxlZCB3aGVuIG9wZXJhdGlvbiBmaW5pc2hlZFxuICAjIFRoaXMgaXMgZXNzZW50aWFsbHkgdG8gcmVzZXQgc3RhdGUgZm9yIGAuYCByZXBlYXQuXG4gIHJlc2V0U3RhdGU6IC0+XG4gICAgQHRhcmdldFNlbGVjdGVkID0gbnVsbFxuICAgIEBvY2N1cnJlbmNlU2VsZWN0ZWQgPSBmYWxzZVxuXG4gICMgVHdvIGNoZWNrcG9pbnQgZm9yIGRpZmZlcmVudCBwdXJwb3NlXG4gICMgLSBvbmUgZm9yIHVuZG8oaGFuZGxlZCBieSBtb2RlTWFuYWdlcilcbiAgIyAtIG9uZSBmb3IgcHJlc2VydmUgbGFzdCBpbnNlcnRlZCB0ZXh0XG4gIGNyZWF0ZUJ1ZmZlckNoZWNrcG9pbnQ6IChwdXJwb3NlKSAtPlxuICAgIEBidWZmZXJDaGVja3BvaW50QnlQdXJwb3NlID89IHt9XG4gICAgQGJ1ZmZlckNoZWNrcG9pbnRCeVB1cnBvc2VbcHVycG9zZV0gPSBAZWRpdG9yLmNyZWF0ZUNoZWNrcG9pbnQoKVxuXG4gIGdldEJ1ZmZlckNoZWNrcG9pbnQ6IChwdXJwb3NlKSAtPlxuICAgIEBidWZmZXJDaGVja3BvaW50QnlQdXJwb3NlP1twdXJwb3NlXVxuXG4gIGRlbGV0ZUJ1ZmZlckNoZWNrcG9pbnQ6IChwdXJwb3NlKSAtPlxuICAgIGlmIEBidWZmZXJDaGVja3BvaW50QnlQdXJwb3NlP1xuICAgICAgZGVsZXRlIEBidWZmZXJDaGVja3BvaW50QnlQdXJwb3NlW3B1cnBvc2VdXG5cbiAgZ3JvdXBDaGFuZ2VzU2luY2VCdWZmZXJDaGVja3BvaW50OiAocHVycG9zZSkgLT5cbiAgICBpZiBjaGVja3BvaW50ID0gQGdldEJ1ZmZlckNoZWNrcG9pbnQocHVycG9zZSlcbiAgICAgIEBlZGl0b3IuZ3JvdXBDaGFuZ2VzU2luY2VDaGVja3BvaW50KGNoZWNrcG9pbnQpXG4gICAgICBAZGVsZXRlQnVmZmVyQ2hlY2twb2ludChwdXJwb3NlKVxuXG4gIHNldE1hcmtGb3JDaGFuZ2U6IChyYW5nZSkgLT5cbiAgICBAdmltU3RhdGUubWFyay5zZXQoJ1snLCByYW5nZS5zdGFydClcbiAgICBAdmltU3RhdGUubWFyay5zZXQoJ10nLCByYW5nZS5lbmQpXG5cbiAgbmVlZEZsYXNoOiAtPlxuICAgIEBmbGFzaFRhcmdldCBhbmQgQGdldENvbmZpZygnZmxhc2hPbk9wZXJhdGUnKSBhbmRcbiAgICAgIChAbmFtZSBub3QgaW4gQGdldENvbmZpZygnZmxhc2hPbk9wZXJhdGVCbGFja2xpc3QnKSkgYW5kXG4gICAgICAoKEBtb2RlIGlzbnQgJ3Zpc3VhbCcpIG9yIChAc3VibW9kZSBpc250IEB0YXJnZXQud2lzZSkpICMgZS5nLiBZIGluIHZDXG5cbiAgZmxhc2hJZk5lY2Vzc2FyeTogKHJhbmdlcykgLT5cbiAgICBpZiBAbmVlZEZsYXNoKClcbiAgICAgIEB2aW1TdGF0ZS5mbGFzaChyYW5nZXMsIHR5cGU6IEBnZXRGbGFzaFR5cGUoKSlcblxuICBmbGFzaENoYW5nZUlmTmVjZXNzYXJ5OiAtPlxuICAgIGlmIEBuZWVkRmxhc2goKVxuICAgICAgQG9uRGlkRmluaXNoT3BlcmF0aW9uID0+XG4gICAgICAgIHJhbmdlcyA9IEBtdXRhdGlvbk1hbmFnZXIuZ2V0U2VsZWN0ZWRCdWZmZXJSYW5nZXNGb3JDaGVja3BvaW50KEBmbGFzaENoZWNrcG9pbnQpXG4gICAgICAgIEB2aW1TdGF0ZS5mbGFzaChyYW5nZXMsIHR5cGU6IEBnZXRGbGFzaFR5cGUoKSlcblxuICBnZXRGbGFzaFR5cGU6IC0+XG4gICAgaWYgQG9jY3VycmVuY2VTZWxlY3RlZFxuICAgICAgQGZsYXNoVHlwZUZvck9jY3VycmVuY2VcbiAgICBlbHNlXG4gICAgICBAZmxhc2hUeXBlXG5cbiAgdHJhY2tDaGFuZ2VJZk5lY2Vzc2FyeTogLT5cbiAgICByZXR1cm4gdW5sZXNzIEB0cmFja0NoYW5nZVxuXG4gICAgQG9uRGlkRmluaXNoT3BlcmF0aW9uID0+XG4gICAgICBpZiByYW5nZSA9IEBtdXRhdGlvbk1hbmFnZXIuZ2V0TXV0YXRlZEJ1ZmZlclJhbmdlRm9yU2VsZWN0aW9uKEBlZGl0b3IuZ2V0TGFzdFNlbGVjdGlvbigpKVxuICAgICAgICBAc2V0TWFya0ZvckNoYW5nZShyYW5nZSlcblxuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBzdXBlclxuICAgIHtAbXV0YXRpb25NYW5hZ2VyLCBAb2NjdXJyZW5jZU1hbmFnZXIsIEBwZXJzaXN0ZW50U2VsZWN0aW9ufSA9IEB2aW1TdGF0ZVxuICAgIEBzdWJzY3JpYmVSZXNldE9jY3VycmVuY2VQYXR0ZXJuSWZOZWVkZWQoKVxuICAgIEBpbml0aWFsaXplKClcbiAgICBAb25EaWRTZXRPcGVyYXRvck1vZGlmaWVyKEBzZXRNb2RpZmllci5iaW5kKHRoaXMpKVxuXG4gICAgIyBXaGVuIHByZXNldC1vY2N1cnJlbmNlIHdhcyBleGlzdHMsIG9wZXJhdGUgb24gb2NjdXJyZW5jZS13aXNlXG4gICAgaWYgQGFjY2VwdFByZXNldE9jY3VycmVuY2UgYW5kIEBvY2N1cnJlbmNlTWFuYWdlci5oYXNNYXJrZXJzKClcbiAgICAgIEBvY2N1cnJlbmNlID0gdHJ1ZVxuXG4gICAgIyBbRklYTUVdIE9SREVSLU1BVFRFUlxuICAgICMgVG8gcGljayBjdXJzb3Itd29yZCB0byBmaW5kIG9jY3VycmVuY2UgYmFzZSBwYXR0ZXJuLlxuICAgICMgVGhpcyBoYXMgdG8gYmUgZG9uZSBCRUZPUkUgY29udmVydGluZyBwZXJzaXN0ZW50LXNlbGVjdGlvbiBpbnRvIHJlYWwtc2VsZWN0aW9uLlxuICAgICMgU2luY2Ugd2hlbiBwZXJzaXN0ZW50LXNlbGVjdGlvbiBpcyBhY3R1YWxsIHNlbGVjdGVkLCBpdCBjaGFuZ2UgY3Vyc29yIHBvc2l0aW9uLlxuICAgIGlmIEBvY2N1cnJlbmNlIGFuZCBub3QgQG9jY3VycmVuY2VNYW5hZ2VyLmhhc01hcmtlcnMoKVxuICAgICAgQG9jY3VycmVuY2VNYW5hZ2VyLmFkZFBhdHRlcm4oQHBhdHRlcm5Gb3JPY2N1cnJlbmNlID8gQGdldFBhdHRlcm5Gb3JPY2N1cnJlbmNlVHlwZShAb2NjdXJyZW5jZVR5cGUpKVxuXG5cbiAgICAjIFRoaXMgY2hhbmdlIGN1cnNvciBwb3NpdGlvbi5cbiAgICBpZiBAc2VsZWN0UGVyc2lzdGVudFNlbGVjdGlvbklmTmVjZXNzYXJ5KClcbiAgICAgICMgW0ZJWE1FXSBzZWxlY3Rpb24td2lzZSBpcyBub3Qgc3luY2hlZCBpZiBpdCBhbHJlYWR5IHZpc3VhbC1tb2RlXG4gICAgICB1bmxlc3MgQG1vZGUgaXMgJ3Zpc3VhbCdcbiAgICAgICAgQHZpbVN0YXRlLm1vZGVNYW5hZ2VyLmFjdGl2YXRlKCd2aXN1YWwnLCBAc3dyYXAuZGV0ZWN0V2lzZShAZWRpdG9yKSlcblxuICAgIEB0YXJnZXQgPSAnQ3VycmVudFNlbGVjdGlvbicgaWYgQG1vZGUgaXMgJ3Zpc3VhbCcgYW5kIEByZXF1aXJlVGFyZ2V0XG4gICAgQHNldFRhcmdldChAbmV3KEB0YXJnZXQpKSBpZiBfLmlzU3RyaW5nKEB0YXJnZXQpXG5cbiAgc3Vic2NyaWJlUmVzZXRPY2N1cnJlbmNlUGF0dGVybklmTmVlZGVkOiAtPlxuICAgICMgW0NBVVRJT05dXG4gICAgIyBUaGlzIG1ldGhvZCBoYXMgdG8gYmUgY2FsbGVkIGluIFBST1BFUiB0aW1pbmcuXG4gICAgIyBJZiBvY2N1cnJlbmNlIGlzIHRydWUgYnV0IG5vIHByZXNldC1vY2N1cnJlbmNlXG4gICAgIyBUcmVhdCB0aGF0IGBvY2N1cnJlbmNlYCBpcyBCT1VOREVEIHRvIG9wZXJhdG9yIGl0c2VsZiwgc28gY2xlYW5wIGF0IGZpbmlzaGVkLlxuICAgIGlmIEBvY2N1cnJlbmNlIGFuZCBub3QgQG9jY3VycmVuY2VNYW5hZ2VyLmhhc01hcmtlcnMoKVxuICAgICAgQG9uRGlkUmVzZXRPcGVyYXRpb25TdGFjayg9PiBAb2NjdXJyZW5jZU1hbmFnZXIucmVzZXRQYXR0ZXJucygpKVxuXG4gIHNldE1vZGlmaWVyOiAob3B0aW9ucykgLT5cbiAgICBpZiBvcHRpb25zLndpc2U/XG4gICAgICBAd2lzZSA9IG9wdGlvbnMud2lzZVxuICAgICAgcmV0dXJuXG5cbiAgICBpZiBvcHRpb25zLm9jY3VycmVuY2U/XG4gICAgICBAb2NjdXJyZW5jZSA9IG9wdGlvbnMub2NjdXJyZW5jZVxuICAgICAgaWYgQG9jY3VycmVuY2VcbiAgICAgICAgQG9jY3VycmVuY2VUeXBlID0gb3B0aW9ucy5vY2N1cnJlbmNlVHlwZVxuICAgICAgICAjIFRoaXMgaXMgbyBtb2RpZmllciBjYXNlKGUuZy4gYGMgbyBwYCwgYGQgTyBmYClcbiAgICAgICAgIyBXZSBSRVNFVCBleGlzdGluZyBvY2N1cmVuY2UtbWFya2VyIHdoZW4gYG9gIG9yIGBPYCBtb2RpZmllciBpcyB0eXBlZCBieSB1c2VyLlxuICAgICAgICBwYXR0ZXJuID0gQGdldFBhdHRlcm5Gb3JPY2N1cnJlbmNlVHlwZShAb2NjdXJyZW5jZVR5cGUpXG4gICAgICAgIEBvY2N1cnJlbmNlTWFuYWdlci5hZGRQYXR0ZXJuKHBhdHRlcm4sIHtyZXNldDogdHJ1ZSwgQG9jY3VycmVuY2VUeXBlfSlcbiAgICAgICAgQG9uRGlkUmVzZXRPcGVyYXRpb25TdGFjayg9PiBAb2NjdXJyZW5jZU1hbmFnZXIucmVzZXRQYXR0ZXJucygpKVxuXG4gICMgcmV0dXJuIHRydWUvZmFsc2UgdG8gaW5kaWNhdGUgc3VjY2Vzc1xuICBzZWxlY3RQZXJzaXN0ZW50U2VsZWN0aW9uSWZOZWNlc3Nhcnk6IC0+XG4gICAgaWYgQGFjY2VwdFBlcnNpc3RlbnRTZWxlY3Rpb24gYW5kXG4gICAgICAgIEBnZXRDb25maWcoJ2F1dG9TZWxlY3RQZXJzaXN0ZW50U2VsZWN0aW9uT25PcGVyYXRlJykgYW5kXG4gICAgICAgIG5vdCBAcGVyc2lzdGVudFNlbGVjdGlvbi5pc0VtcHR5KClcblxuICAgICAgQHBlcnNpc3RlbnRTZWxlY3Rpb24uc2VsZWN0KClcbiAgICAgIEBlZGl0b3IubWVyZ2VJbnRlcnNlY3RpbmdTZWxlY3Rpb25zKClcbiAgICAgIGZvciAkc2VsZWN0aW9uIGluIEBzd3JhcC5nZXRTZWxlY3Rpb25zKEBlZGl0b3IpIHdoZW4gbm90ICRzZWxlY3Rpb24uaGFzUHJvcGVydGllcygpXG4gICAgICAgICRzZWxlY3Rpb24uc2F2ZVByb3BlcnRpZXMoKVxuICAgICAgdHJ1ZVxuICAgIGVsc2VcbiAgICAgIGZhbHNlXG5cbiAgZ2V0UGF0dGVybkZvck9jY3VycmVuY2VUeXBlOiAob2NjdXJyZW5jZVR5cGUpIC0+XG4gICAgc3dpdGNoIG9jY3VycmVuY2VUeXBlXG4gICAgICB3aGVuICdiYXNlJ1xuICAgICAgICBnZXRXb3JkUGF0dGVybkF0QnVmZmVyUG9zaXRpb24oQGVkaXRvciwgQGdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCkpXG4gICAgICB3aGVuICdzdWJ3b3JkJ1xuICAgICAgICBnZXRTdWJ3b3JkUGF0dGVybkF0QnVmZmVyUG9zaXRpb24oQGVkaXRvciwgQGdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCkpXG5cbiAgIyB0YXJnZXQgaXMgVGV4dE9iamVjdCBvciBNb3Rpb24gdG8gb3BlcmF0ZSBvbi5cbiAgc2V0VGFyZ2V0OiAoQHRhcmdldCkgLT5cbiAgICBAdGFyZ2V0Lm9wZXJhdG9yID0gdGhpc1xuICAgIEBlbWl0RGlkU2V0VGFyZ2V0KHRoaXMpXG5cbiAgICBpZiBAY2FuRWFybHlTZWxlY3QoKVxuICAgICAgQG5vcm1hbGl6ZVNlbGVjdGlvbnNJZk5lY2Vzc2FyeSgpXG4gICAgICBAY3JlYXRlQnVmZmVyQ2hlY2twb2ludCgndW5kbycpXG4gICAgICBAc2VsZWN0VGFyZ2V0KClcbiAgICB0aGlzXG5cbiAgc2V0VGV4dFRvUmVnaXN0ZXJGb3JTZWxlY3Rpb246IChzZWxlY3Rpb24pIC0+XG4gICAgQHNldFRleHRUb1JlZ2lzdGVyKHNlbGVjdGlvbi5nZXRUZXh0KCksIHNlbGVjdGlvbilcblxuICBzZXRUZXh0VG9SZWdpc3RlcjogKHRleHQsIHNlbGVjdGlvbikgLT5cbiAgICB0ZXh0ICs9IFwiXFxuXCIgaWYgKEB0YXJnZXQuaXNMaW5ld2lzZSgpIGFuZCAobm90IHRleHQuZW5kc1dpdGgoJ1xcbicpKSlcbiAgICBpZiB0ZXh0XG4gICAgICBAdmltU3RhdGUucmVnaXN0ZXIuc2V0KG51bGwsIHt0ZXh0LCBzZWxlY3Rpb259KVxuXG4gICAgICBpZiBAdmltU3RhdGUucmVnaXN0ZXIuaXNVbm5hbWVkKClcbiAgICAgICAgaWYgQGluc3RhbmNlb2YoXCJEZWxldGVcIikgb3IgQGluc3RhbmNlb2YoXCJDaGFuZ2VcIilcbiAgICAgICAgICBpZiBub3QgQG5lZWRTYXZlVG9OdW1iZXJlZFJlZ2lzdGVyKEB0YXJnZXQpIGFuZCBpc1NpbmdsZUxpbmVUZXh0KHRleHQpICMgc21hbGwtY2hhbmdlXG4gICAgICAgICAgICBAdmltU3RhdGUucmVnaXN0ZXIuc2V0KCctJywge3RleHQsIHNlbGVjdGlvbn0pXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgQHZpbVN0YXRlLnJlZ2lzdGVyLnNldCgnMScsIHt0ZXh0LCBzZWxlY3Rpb259KVxuXG4gICAgICAgIGVsc2UgaWYgQGluc3RhbmNlb2YoXCJZYW5rXCIpXG4gICAgICAgICAgQHZpbVN0YXRlLnJlZ2lzdGVyLnNldCgnMCcsIHt0ZXh0LCBzZWxlY3Rpb259KVxuXG4gIG5lZWRTYXZlVG9OdW1iZXJlZFJlZ2lzdGVyOiAodGFyZ2V0KSAtPlxuICAgICMgVXNlZCB0byBkZXRlcm1pbmUgd2hhdCByZWdpc3RlciB0byB1c2Ugb24gY2hhbmdlIGFuZCBkZWxldGUgb3BlcmF0aW9uLlxuICAgICMgRm9sbG93aW5nIG1vdGlvbiBzaG91bGQgc2F2ZSB0byAxLTkgcmVnaXN0ZXIgcmVnZXJkbGVzcyBvZiBjb250ZW50IGlzIHNtYWxsIG9yIGJpZy5cbiAgICBnb2VzVG9OdW1iZXJlZFJlZ2lzdGVyTW90aW9uTmFtZXMgPSBbXG4gICAgICBcIk1vdmVUb1BhaXJcIiAjICVcbiAgICAgIFwiTW92ZVRvTmV4dFNlbnRlbmNlXCIgIyAoLCApXG4gICAgICBcIlNlYXJjaFwiICMgLywgPywgbiwgTlxuICAgICAgXCJNb3ZlVG9OZXh0UGFyYWdyYXBoXCIgIyB7LCB9XG4gICAgXVxuICAgIGdvZXNUb051bWJlcmVkUmVnaXN0ZXJNb3Rpb25OYW1lcy5zb21lKChuYW1lKSAtPiB0YXJnZXQuaW5zdGFuY2VvZihuYW1lKSlcblxuICBub3JtYWxpemVTZWxlY3Rpb25zSWZOZWNlc3Nhcnk6IC0+XG4gICAgaWYgQHRhcmdldD8uaXNNb3Rpb24oKSBhbmQgKEBtb2RlIGlzICd2aXN1YWwnKVxuICAgICAgQHN3cmFwLm5vcm1hbGl6ZShAZWRpdG9yKVxuXG4gIHN0YXJ0TXV0YXRpb246IChmbikgLT5cbiAgICBpZiBAY2FuRWFybHlTZWxlY3QoKVxuICAgICAgIyAtIFNraXAgc2VsZWN0aW9uIG5vcm1hbGl6YXRpb246IGFscmVhZHkgbm9ybWFsaXplZCBiZWZvcmUgQHNlbGVjdFRhcmdldCgpXG4gICAgICAjIC0gTWFudWFsIGNoZWNrcG9pbnQgZ3JvdXBpbmc6IHRvIGNyZWF0ZSBjaGVja3BvaW50IGJlZm9yZSBAc2VsZWN0VGFyZ2V0KClcbiAgICAgIGZuKClcbiAgICAgIEBlbWl0V2lsbEZpbmlzaE11dGF0aW9uKClcbiAgICAgIEBncm91cENoYW5nZXNTaW5jZUJ1ZmZlckNoZWNrcG9pbnQoJ3VuZG8nKVxuXG4gICAgZWxzZVxuICAgICAgQG5vcm1hbGl6ZVNlbGVjdGlvbnNJZk5lY2Vzc2FyeSgpXG4gICAgICBAZWRpdG9yLnRyYW5zYWN0ID0+XG4gICAgICAgIGZuKClcbiAgICAgICAgQGVtaXRXaWxsRmluaXNoTXV0YXRpb24oKVxuXG4gICAgQGVtaXREaWRGaW5pc2hNdXRhdGlvbigpXG5cbiAgIyBNYWluXG4gIGV4ZWN1dGU6IC0+XG4gICAgQHN0YXJ0TXV0YXRpb24gPT5cbiAgICAgIGlmIEBzZWxlY3RUYXJnZXQoKVxuICAgICAgICBpZiBAbXV0YXRlU2VsZWN0aW9uT3JkZXJkXG4gICAgICAgICAgc2VsZWN0aW9ucyA9IEBlZGl0b3IuZ2V0U2VsZWN0aW9uc09yZGVyZWRCeUJ1ZmZlclBvc2l0aW9uKClcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHNlbGVjdGlvbnMgPSBAZWRpdG9yLmdldFNlbGVjdGlvbnMoKVxuICAgICAgICBmb3Igc2VsZWN0aW9uIGluIHNlbGVjdGlvbnNcbiAgICAgICAgICBAbXV0YXRlU2VsZWN0aW9uKHNlbGVjdGlvbilcbiAgICAgICAgQG11dGF0aW9uTWFuYWdlci5zZXRDaGVja3BvaW50KCdkaWQtZmluaXNoJylcbiAgICAgICAgQHJlc3RvcmVDdXJzb3JQb3NpdGlvbnNJZk5lY2Vzc2FyeSgpXG5cbiAgICAjIEV2ZW4gdGhvdWdoIHdlIGZhaWwgdG8gc2VsZWN0IHRhcmdldCBhbmQgZmFpbCB0byBtdXRhdGUsXG4gICAgIyB3ZSBoYXZlIHRvIHJldHVybiB0byBub3JtYWwtbW9kZSBmcm9tIG9wZXJhdG9yLXBlbmRpbmcgb3IgdmlzdWFsXG4gICAgQGFjdGl2YXRlTW9kZSgnbm9ybWFsJylcblxuICAjIFJldHVybiB0cnVlIHVubGVzcyBhbGwgc2VsZWN0aW9uIGlzIGVtcHR5LlxuICBzZWxlY3RUYXJnZXQ6IC0+XG4gICAgcmV0dXJuIEB0YXJnZXRTZWxlY3RlZCBpZiBAdGFyZ2V0U2VsZWN0ZWQ/XG4gICAgQG11dGF0aW9uTWFuYWdlci5pbml0KHtAc3RheUJ5TWFya2VyfSlcblxuICAgIEB0YXJnZXQuZm9yY2VXaXNlKEB3aXNlKSBpZiBAd2lzZT9cbiAgICBAZW1pdFdpbGxTZWxlY3RUYXJnZXQoKVxuXG4gICAgIyBBbGxvdyBjdXJzb3IgcG9zaXRpb24gYWRqdXN0bWVudCAnb24td2lsbC1zZWxlY3QtdGFyZ2V0JyBob29rLlxuICAgICMgc28gY2hlY2twb2ludCBjb21lcyBBRlRFUiBAZW1pdFdpbGxTZWxlY3RUYXJnZXQoKVxuICAgIEBtdXRhdGlvbk1hbmFnZXIuc2V0Q2hlY2twb2ludCgnd2lsbC1zZWxlY3QnKVxuXG4gICAgIyBOT1RFXG4gICAgIyBTaW5jZSBNb3ZlVG9OZXh0T2NjdXJyZW5jZSwgTW92ZVRvUHJldmlvdXNPY2N1cnJlbmNlIG1vdGlvbiBtb3ZlIGJ5XG4gICAgIyAgb2NjdXJyZW5jZS1tYXJrZXIsIG9jY3VycmVuY2UtbWFya2VyIGhhcyB0byBiZSBjcmVhdGVkIEJFRk9SRSBgQHRhcmdldC5leGVjdXRlKClgXG4gICAgIyBBbmQgd2hlbiByZXBlYXRlZCwgb2NjdXJyZW5jZSBwYXR0ZXJuIGlzIGFscmVhZHkgY2FjaGVkIGF0IEBwYXR0ZXJuRm9yT2NjdXJyZW5jZVxuICAgIGlmIEByZXBlYXRlZCBhbmQgQG9jY3VycmVuY2UgYW5kIG5vdCBAb2NjdXJyZW5jZU1hbmFnZXIuaGFzTWFya2VycygpXG4gICAgICBAb2NjdXJyZW5jZU1hbmFnZXIuYWRkUGF0dGVybihAcGF0dGVybkZvck9jY3VycmVuY2UsIHtAb2NjdXJyZW5jZVR5cGV9KVxuXG4gICAgQHRhcmdldC5leGVjdXRlKClcblxuICAgIEBtdXRhdGlvbk1hbmFnZXIuc2V0Q2hlY2twb2ludCgnZGlkLXNlbGVjdCcpXG4gICAgaWYgQG9jY3VycmVuY2VcbiAgICAgICMgVG8gcmVwb2VhdChgLmApIG9wZXJhdGlvbiB3aGVyZSBtdWx0aXBsZSBvY2N1cnJlbmNlIHBhdHRlcm5zIHdhcyBzZXQuXG4gICAgICAjIEhlcmUgd2Ugc2F2ZSBwYXR0ZXJucyB3aGljaCByZXByZXNlbnQgdW5pb25lZCByZWdleCB3aGljaCBAb2NjdXJyZW5jZU1hbmFnZXIga25vd3MuXG4gICAgICBAcGF0dGVybkZvck9jY3VycmVuY2UgPz0gQG9jY3VycmVuY2VNYW5hZ2VyLmJ1aWxkUGF0dGVybigpXG5cbiAgICAgIEBvY2N1cnJlbmNlV2lzZSA9IEB3aXNlID8gXCJjaGFyYWN0ZXJ3aXNlXCJcbiAgICAgIGlmIEBvY2N1cnJlbmNlTWFuYWdlci5zZWxlY3QoQG9jY3VycmVuY2VXaXNlKVxuICAgICAgICBAb2NjdXJyZW5jZVNlbGVjdGVkID0gdHJ1ZVxuICAgICAgICBAbXV0YXRpb25NYW5hZ2VyLnNldENoZWNrcG9pbnQoJ2RpZC1zZWxlY3Qtb2NjdXJyZW5jZScpXG5cbiAgICBpZiBAdGFyZ2V0U2VsZWN0ZWQgPSBAdmltU3RhdGUuaGF2ZVNvbWVOb25FbXB0eVNlbGVjdGlvbigpIG9yIEB0YXJnZXQubmFtZSBpcyBcIkVtcHR5XCJcbiAgICAgIEBlbWl0RGlkU2VsZWN0VGFyZ2V0KClcbiAgICAgIEBmbGFzaENoYW5nZUlmTmVjZXNzYXJ5KClcbiAgICAgIEB0cmFja0NoYW5nZUlmTmVjZXNzYXJ5KClcbiAgICBlbHNlXG4gICAgICBAZW1pdERpZEZhaWxTZWxlY3RUYXJnZXQoKVxuICAgIHJldHVybiBAdGFyZ2V0U2VsZWN0ZWRcblxuICByZXN0b3JlQ3Vyc29yUG9zaXRpb25zSWZOZWNlc3Nhcnk6IC0+XG4gICAgcmV0dXJuIHVubGVzcyBAcmVzdG9yZVBvc2l0aW9uc1xuICAgIHN0YXkgPSBAc3RheUF0U2FtZVBvc2l0aW9uID8gQGdldENvbmZpZyhAc3RheU9wdGlvbk5hbWUpIG9yIChAb2NjdXJyZW5jZVNlbGVjdGVkIGFuZCBAZ2V0Q29uZmlnKCdzdGF5T25PY2N1cnJlbmNlJykpXG4gICAgd2lzZSA9IGlmIEBvY2N1cnJlbmNlU2VsZWN0ZWQgdGhlbiBAb2NjdXJyZW5jZVdpc2UgZWxzZSBAdGFyZ2V0Lndpc2VcbiAgICBAbXV0YXRpb25NYW5hZ2VyLnJlc3RvcmVDdXJzb3JQb3NpdGlvbnMoe3N0YXksIHdpc2UsIEBzZXRUb0ZpcnN0Q2hhcmFjdGVyT25MaW5ld2lzZX0pXG5cbmNsYXNzIFNlbGVjdEJhc2UgZXh0ZW5kcyBPcGVyYXRvclxuICBAZXh0ZW5kKGZhbHNlKVxuICBmbGFzaFRhcmdldDogZmFsc2VcbiAgcmVjb3JkYWJsZTogZmFsc2VcblxuICBleGVjdXRlOiAtPlxuICAgIEBzdGFydE11dGF0aW9uID0+IEBzZWxlY3RUYXJnZXQoKVxuXG4gICAgaWYgKEB0YXJnZXQuc2VsZWN0U3VjY2VlZGVkKVxuICAgICAgQGVkaXRvci5zY3JvbGxUb0N1cnNvclBvc2l0aW9uKCkgaWYgQHRhcmdldC5pc1RleHRPYmplY3QoKVxuICAgICAgd2lzZSA9IGlmIEBvY2N1cnJlbmNlU2VsZWN0ZWQgdGhlbiBAb2NjdXJyZW5jZVdpc2UgZWxzZSBAdGFyZ2V0Lndpc2VcbiAgICAgIEBhY3RpdmF0ZU1vZGVJZk5lY2Vzc2FyeSgndmlzdWFsJywgd2lzZSlcbiAgICBlbHNlXG4gICAgICBAY2FuY2VsT3BlcmF0aW9uKClcblxuY2xhc3MgU2VsZWN0IGV4dGVuZHMgU2VsZWN0QmFzZVxuICBAZXh0ZW5kKClcbiAgZXhlY3V0ZTogLT5cbiAgICBmb3IgJHNlbGVjdGlvbiBpbiBAc3dyYXAuZ2V0U2VsZWN0aW9ucyhAZWRpdG9yKSB3aGVuIG5vdCAkc2VsZWN0aW9uLmhhc1Byb3BlcnRpZXMoKVxuICAgICAgJHNlbGVjdGlvbi5zYXZlUHJvcGVydGllcygpXG4gICAgc3VwZXJcblxuY2xhc3MgU2VsZWN0TGF0ZXN0Q2hhbmdlIGV4dGVuZHMgU2VsZWN0QmFzZVxuICBAZXh0ZW5kKClcbiAgQGRlc2NyaXB0aW9uOiBcIlNlbGVjdCBsYXRlc3QgeWFua2VkIG9yIGNoYW5nZWQgcmFuZ2VcIlxuICB0YXJnZXQ6ICdBTGF0ZXN0Q2hhbmdlJ1xuXG5jbGFzcyBTZWxlY3RQcmV2aW91c1NlbGVjdGlvbiBleHRlbmRzIFNlbGVjdEJhc2VcbiAgQGV4dGVuZCgpXG4gIHRhcmdldDogXCJQcmV2aW91c1NlbGVjdGlvblwiXG5cbmNsYXNzIFNlbGVjdFBlcnNpc3RlbnRTZWxlY3Rpb24gZXh0ZW5kcyBTZWxlY3RCYXNlXG4gIEBleHRlbmQoKVxuICBAZGVzY3JpcHRpb246IFwiU2VsZWN0IHBlcnNpc3RlbnQtc2VsZWN0aW9uIGFuZCBjbGVhciBhbGwgcGVyc2lzdGVudC1zZWxlY3Rpb24sIGl0J3MgbGlrZSBjb252ZXJ0IHRvIHJlYWwtc2VsZWN0aW9uXCJcbiAgdGFyZ2V0OiBcIkFQZXJzaXN0ZW50U2VsZWN0aW9uXCJcbiAgYWNjZXB0UGVyc2lzdGVudFNlbGVjdGlvbjogZmFsc2VcblxuY2xhc3MgU2VsZWN0T2NjdXJyZW5jZSBleHRlbmRzIFNlbGVjdEJhc2VcbiAgQGV4dGVuZCgpXG4gIEBkZXNjcmlwdGlvbjogXCJBZGQgc2VsZWN0aW9uIG9udG8gZWFjaCBtYXRjaGluZyB3b3JkIHdpdGhpbiB0YXJnZXQgcmFuZ2VcIlxuICBvY2N1cnJlbmNlOiB0cnVlXG5cbiMgU2VsZWN0SW5WaXN1YWxNb2RlOiB1c2VkIGluIHZpc3VhbC1tb2RlXG4jIFdoZW4gdGV4dC1vYmplY3QgaXMgaW52b2tlZCBmcm9tIG5vcm1hbCBvciB2aXVzYWwtbW9kZSwgb3BlcmF0aW9uIHdvdWxkIGJlXG4jICA9PiBTZWxlY3RJblZpc3VhbE1vZGUgb3BlcmF0b3Igd2l0aCB0YXJnZXQ9dGV4dC1vYmplY3RcbiMgV2hlbiBtb3Rpb24gaXMgaW52b2tlZCBmcm9tIHZpc3VhbC1tb2RlLCBvcGVyYXRpb24gd291bGQgYmVcbiMgID0+IFNlbGVjdEluVmlzdWFsTW9kZSBvcGVyYXRvciB3aXRoIHRhcmdldD1tb3Rpb24pXG4jID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4jIFNlbGVjdEluVmlzdWFsTW9kZSBpcyB1c2VkIGluIFRXTyBzaXR1YXRpb24uXG4jIC0gdmlzdWFsLW1vZGUgb3BlcmF0aW9uXG4jICAgLSBlLmc6IGB2IGxgLCBgViBqYCwgYHYgaSBwYC4uLlxuIyAtIERpcmVjdGx5IGludm9rZSB0ZXh0LW9iamVjdCBmcm9tIG5vcm1hbC1tb2RlXG4jICAgLSBlLmc6IEludm9rZSBgSW5uZXIgUGFyYWdyYXBoYCBmcm9tIGNvbW1hbmQtcGFsZXR0ZS5cbmNsYXNzIFNlbGVjdEluVmlzdWFsTW9kZSBleHRlbmRzIFNlbGVjdEJhc2VcbiAgQGV4dGVuZChmYWxzZSlcbiAgYWNjZXB0UHJlc2V0T2NjdXJyZW5jZTogZmFsc2VcbiAgYWNjZXB0UGVyc2lzdGVudFNlbGVjdGlvbjogZmFsc2VcblxuIyBQZXJzaXN0ZW50IFNlbGVjdGlvblxuIyA9PT09PT09PT09PT09PT09PT09PT09PT09XG5jbGFzcyBDcmVhdGVQZXJzaXN0ZW50U2VsZWN0aW9uIGV4dGVuZHMgT3BlcmF0b3JcbiAgQGV4dGVuZCgpXG4gIGZsYXNoVGFyZ2V0OiBmYWxzZVxuICBzdGF5QXRTYW1lUG9zaXRpb246IHRydWVcbiAgYWNjZXB0UHJlc2V0T2NjdXJyZW5jZTogZmFsc2VcbiAgYWNjZXB0UGVyc2lzdGVudFNlbGVjdGlvbjogZmFsc2VcblxuICBtdXRhdGVTZWxlY3Rpb246IChzZWxlY3Rpb24pIC0+XG4gICAgQHBlcnNpc3RlbnRTZWxlY3Rpb24ubWFya0J1ZmZlclJhbmdlKHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpKVxuXG5jbGFzcyBUb2dnbGVQZXJzaXN0ZW50U2VsZWN0aW9uIGV4dGVuZHMgQ3JlYXRlUGVyc2lzdGVudFNlbGVjdGlvblxuICBAZXh0ZW5kKClcblxuICBpc0NvbXBsZXRlOiAtPlxuICAgIHBvaW50ID0gQGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpXG4gICAgQG1hcmtlclRvUmVtb3ZlID0gQHBlcnNpc3RlbnRTZWxlY3Rpb24uZ2V0TWFya2VyQXRQb2ludChwb2ludClcbiAgICBAbWFya2VyVG9SZW1vdmU/IG9yIHN1cGVyXG5cbiAgZXhlY3V0ZTogLT5cbiAgICBpZiBAbWFya2VyVG9SZW1vdmU/XG4gICAgICBAbWFya2VyVG9SZW1vdmUuZGVzdHJveSgpXG4gICAgZWxzZVxuICAgICAgc3VwZXJcblxuIyBQcmVzZXQgT2NjdXJyZW5jZVxuIyA9PT09PT09PT09PT09PT09PT09PT09PT09XG5jbGFzcyBUb2dnbGVQcmVzZXRPY2N1cnJlbmNlIGV4dGVuZHMgT3BlcmF0b3JcbiAgQGV4dGVuZCgpXG4gIHRhcmdldDogXCJFbXB0eVwiXG4gIGZsYXNoVGFyZ2V0OiBmYWxzZVxuICBhY2NlcHRQcmVzZXRPY2N1cnJlbmNlOiBmYWxzZVxuICBhY2NlcHRQZXJzaXN0ZW50U2VsZWN0aW9uOiBmYWxzZVxuICBvY2N1cnJlbmNlVHlwZTogJ2Jhc2UnXG5cbiAgZXhlY3V0ZTogLT5cbiAgICBpZiBtYXJrZXIgPSBAb2NjdXJyZW5jZU1hbmFnZXIuZ2V0TWFya2VyQXRQb2ludChAZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCkpXG4gICAgICBAb2NjdXJyZW5jZU1hbmFnZXIuZGVzdHJveU1hcmtlcnMoW21hcmtlcl0pXG4gICAgZWxzZVxuICAgICAgcGF0dGVybiA9IG51bGxcbiAgICAgIGlzTmFycm93ZWQgPSBAdmltU3RhdGUubW9kZU1hbmFnZXIuaXNOYXJyb3dlZCgpXG5cbiAgICAgIGlmIEBtb2RlIGlzICd2aXN1YWwnIGFuZCBub3QgaXNOYXJyb3dlZFxuICAgICAgICBAb2NjdXJyZW5jZVR5cGUgPSAnYmFzZSdcbiAgICAgICAgcGF0dGVybiA9IG5ldyBSZWdFeHAoXy5lc2NhcGVSZWdFeHAoQGVkaXRvci5nZXRTZWxlY3RlZFRleHQoKSksICdnJylcbiAgICAgIGVsc2VcbiAgICAgICAgcGF0dGVybiA9IEBnZXRQYXR0ZXJuRm9yT2NjdXJyZW5jZVR5cGUoQG9jY3VycmVuY2VUeXBlKVxuXG4gICAgICBAb2NjdXJyZW5jZU1hbmFnZXIuYWRkUGF0dGVybihwYXR0ZXJuLCB7QG9jY3VycmVuY2VUeXBlfSlcbiAgICAgIEBvY2N1cnJlbmNlTWFuYWdlci5zYXZlTGFzdFBhdHRlcm4oQG9jY3VycmVuY2VUeXBlKVxuXG4gICAgICBAYWN0aXZhdGVNb2RlKCdub3JtYWwnKSB1bmxlc3MgaXNOYXJyb3dlZFxuXG5jbGFzcyBUb2dnbGVQcmVzZXRTdWJ3b3JkT2NjdXJyZW5jZSBleHRlbmRzIFRvZ2dsZVByZXNldE9jY3VycmVuY2VcbiAgQGV4dGVuZCgpXG4gIG9jY3VycmVuY2VUeXBlOiAnc3Vid29yZCdcblxuIyBXYW50IHRvIHJlbmFtZSBSZXN0b3JlT2NjdXJyZW5jZU1hcmtlclxuY2xhc3MgQWRkUHJlc2V0T2NjdXJyZW5jZUZyb21MYXN0T2NjdXJyZW5jZVBhdHRlcm4gZXh0ZW5kcyBUb2dnbGVQcmVzZXRPY2N1cnJlbmNlXG4gIEBleHRlbmQoKVxuICBleGVjdXRlOiAtPlxuICAgIEBvY2N1cnJlbmNlTWFuYWdlci5yZXNldFBhdHRlcm5zKClcbiAgICBpZiBwYXR0ZXJuID0gQHZpbVN0YXRlLmdsb2JhbFN0YXRlLmdldCgnbGFzdE9jY3VycmVuY2VQYXR0ZXJuJylcbiAgICAgIG9jY3VycmVuY2VUeXBlID0gQHZpbVN0YXRlLmdsb2JhbFN0YXRlLmdldChcImxhc3RPY2N1cnJlbmNlVHlwZVwiKVxuICAgICAgQG9jY3VycmVuY2VNYW5hZ2VyLmFkZFBhdHRlcm4ocGF0dGVybiwge29jY3VycmVuY2VUeXBlfSlcbiAgICAgIEBhY3RpdmF0ZU1vZGUoJ25vcm1hbCcpXG5cbiMgRGVsZXRlXG4jID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5jbGFzcyBEZWxldGUgZXh0ZW5kcyBPcGVyYXRvclxuICBAZXh0ZW5kKClcbiAgdHJhY2tDaGFuZ2U6IHRydWVcbiAgZmxhc2hDaGVja3BvaW50OiAnZGlkLXNlbGVjdC1vY2N1cnJlbmNlJ1xuICBmbGFzaFR5cGVGb3JPY2N1cnJlbmNlOiAnb3BlcmF0b3ItcmVtb3ZlLW9jY3VycmVuY2UnXG4gIHN0YXlPcHRpb25OYW1lOiAnc3RheU9uRGVsZXRlJ1xuICBzZXRUb0ZpcnN0Q2hhcmFjdGVyT25MaW5ld2lzZTogdHJ1ZVxuXG4gIGV4ZWN1dGU6IC0+XG4gICAgQG9uRGlkU2VsZWN0VGFyZ2V0ID0+XG4gICAgICBAZmxhc2hUYXJnZXQgPSBmYWxzZSBpZiAoQG9jY3VycmVuY2VTZWxlY3RlZCBhbmQgQG9jY3VycmVuY2VXaXNlIGlzIFwibGluZXdpc2VcIilcblxuICAgIEByZXN0b3JlUG9zaXRpb25zID0gZmFsc2UgIGlmIEB0YXJnZXQud2lzZSBpcyAnYmxvY2t3aXNlJ1xuICAgIHN1cGVyXG5cbiAgbXV0YXRlU2VsZWN0aW9uOiAoc2VsZWN0aW9uKSAtPlxuICAgIEBzZXRUZXh0VG9SZWdpc3RlckZvclNlbGVjdGlvbihzZWxlY3Rpb24pXG4gICAgc2VsZWN0aW9uLmRlbGV0ZVNlbGVjdGVkVGV4dCgpXG5cbmNsYXNzIERlbGV0ZVJpZ2h0IGV4dGVuZHMgRGVsZXRlXG4gIEBleHRlbmQoKVxuICB0YXJnZXQ6ICdNb3ZlUmlnaHQnXG5cbmNsYXNzIERlbGV0ZUxlZnQgZXh0ZW5kcyBEZWxldGVcbiAgQGV4dGVuZCgpXG4gIHRhcmdldDogJ01vdmVMZWZ0J1xuXG5jbGFzcyBEZWxldGVUb0xhc3RDaGFyYWN0ZXJPZkxpbmUgZXh0ZW5kcyBEZWxldGVcbiAgQGV4dGVuZCgpXG4gIHRhcmdldDogJ01vdmVUb0xhc3RDaGFyYWN0ZXJPZkxpbmUnXG5cbiAgZXhlY3V0ZTogLT5cbiAgICBpZiBAdGFyZ2V0Lndpc2UgaXMgJ2Jsb2Nrd2lzZSdcbiAgICAgIEBvbkRpZFNlbGVjdFRhcmdldCA9PlxuICAgICAgICBmb3IgYmxvY2t3aXNlU2VsZWN0aW9uIGluIEBnZXRCbG9ja3dpc2VTZWxlY3Rpb25zKClcbiAgICAgICAgICBibG9ja3dpc2VTZWxlY3Rpb24uZXh0ZW5kTWVtYmVyU2VsZWN0aW9uc1RvRW5kT2ZMaW5lKClcbiAgICBzdXBlclxuXG5jbGFzcyBEZWxldGVMaW5lIGV4dGVuZHMgRGVsZXRlXG4gIEBleHRlbmQoKVxuICB3aXNlOiAnbGluZXdpc2UnXG4gIHRhcmdldDogXCJNb3ZlVG9SZWxhdGl2ZUxpbmVcIlxuICBmbGFzaFRhcmdldDogZmFsc2VcblxuIyBZYW5rXG4jID09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIFlhbmsgZXh0ZW5kcyBPcGVyYXRvclxuICBAZXh0ZW5kKClcbiAgdHJhY2tDaGFuZ2U6IHRydWVcbiAgc3RheU9wdGlvbk5hbWU6ICdzdGF5T25ZYW5rJ1xuXG4gIG11dGF0ZVNlbGVjdGlvbjogKHNlbGVjdGlvbikgLT5cbiAgICBAc2V0VGV4dFRvUmVnaXN0ZXJGb3JTZWxlY3Rpb24oc2VsZWN0aW9uKVxuXG5jbGFzcyBZYW5rTGluZSBleHRlbmRzIFlhbmtcbiAgQGV4dGVuZCgpXG4gIHdpc2U6ICdsaW5ld2lzZSdcbiAgdGFyZ2V0OiBcIk1vdmVUb1JlbGF0aXZlTGluZVwiXG5cbmNsYXNzIFlhbmtUb0xhc3RDaGFyYWN0ZXJPZkxpbmUgZXh0ZW5kcyBZYW5rXG4gIEBleHRlbmQoKVxuICB0YXJnZXQ6ICdNb3ZlVG9MYXN0Q2hhcmFjdGVyT2ZMaW5lJ1xuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgW2N0cmwtYV1cbmNsYXNzIEluY3JlYXNlIGV4dGVuZHMgT3BlcmF0b3JcbiAgQGV4dGVuZCgpXG4gIHRhcmdldDogXCJFbXB0eVwiICMgY3RybC1hIGluIG5vcm1hbC1tb2RlIGZpbmQgdGFyZ2V0IG51bWJlciBpbiBjdXJyZW50IGxpbmUgbWFudWFsbHlcbiAgZmxhc2hUYXJnZXQ6IGZhbHNlICMgZG8gbWFudWFsbHlcbiAgcmVzdG9yZVBvc2l0aW9uczogZmFsc2UgIyBkbyBtYW51YWxseVxuICBzdGVwOiAxXG5cbiAgZXhlY3V0ZTogLT5cbiAgICBAbmV3UmFuZ2VzID0gW11cbiAgICBzdXBlclxuICAgIGlmIEBuZXdSYW5nZXMubGVuZ3RoXG4gICAgICBpZiBAZ2V0Q29uZmlnKCdmbGFzaE9uT3BlcmF0ZScpIGFuZCBAbmFtZSBub3QgaW4gQGdldENvbmZpZygnZmxhc2hPbk9wZXJhdGVCbGFja2xpc3QnKVxuICAgICAgICBAdmltU3RhdGUuZmxhc2goQG5ld1JhbmdlcywgdHlwZTogQGZsYXNoVHlwZUZvck9jY3VycmVuY2UpXG5cbiAgcmVwbGFjZU51bWJlckluQnVmZmVyUmFuZ2U6IChzY2FuUmFuZ2UsIGZuPW51bGwpIC0+XG4gICAgbmV3UmFuZ2VzID0gW11cbiAgICBAcGF0dGVybiA/PSAvLy8je0BnZXRDb25maWcoJ251bWJlclJlZ2V4Jyl9Ly8vZ1xuICAgIEBzY2FuRm9yd2FyZCBAcGF0dGVybiwge3NjYW5SYW5nZX0sIChldmVudCkgPT5cbiAgICAgIHJldHVybiBpZiBmbj8gYW5kIG5vdCBmbihldmVudClcbiAgICAgIHttYXRjaFRleHQsIHJlcGxhY2V9ID0gZXZlbnRcbiAgICAgIG5leHROdW1iZXIgPSBAZ2V0TmV4dE51bWJlcihtYXRjaFRleHQpXG4gICAgICBuZXdSYW5nZXMucHVzaChyZXBsYWNlKFN0cmluZyhuZXh0TnVtYmVyKSkpXG4gICAgbmV3UmFuZ2VzXG5cbiAgbXV0YXRlU2VsZWN0aW9uOiAoc2VsZWN0aW9uKSAtPlxuICAgIHtjdXJzb3J9ID0gc2VsZWN0aW9uXG4gICAgaWYgQHRhcmdldC5pcygnRW1wdHknKSAjIGN0cmwtYSwgY3RybC14IGluIGBub3JtYWwtbW9kZWBcbiAgICAgIGN1cnNvclBvc2l0aW9uID0gY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKClcbiAgICAgIHNjYW5SYW5nZSA9IEBlZGl0b3IuYnVmZmVyUmFuZ2VGb3JCdWZmZXJSb3coY3Vyc29yUG9zaXRpb24ucm93KVxuICAgICAgbmV3UmFuZ2VzID0gQHJlcGxhY2VOdW1iZXJJbkJ1ZmZlclJhbmdlIHNjYW5SYW5nZSwgKHtyYW5nZSwgc3RvcH0pIC0+XG4gICAgICAgIGlmIHJhbmdlLmVuZC5pc0dyZWF0ZXJUaGFuKGN1cnNvclBvc2l0aW9uKVxuICAgICAgICAgIHN0b3AoKVxuICAgICAgICAgIHRydWVcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGZhbHNlXG5cbiAgICAgIHBvaW50ID0gbmV3UmFuZ2VzWzBdPy5lbmQudHJhbnNsYXRlKFswLCAtMV0pID8gY3Vyc29yUG9zaXRpb25cbiAgICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihwb2ludClcbiAgICBlbHNlXG4gICAgICBzY2FuUmFuZ2UgPSBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKVxuICAgICAgQG5ld1Jhbmdlcy5wdXNoKEByZXBsYWNlTnVtYmVySW5CdWZmZXJSYW5nZShzY2FuUmFuZ2UpLi4uKVxuICAgICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHNjYW5SYW5nZS5zdGFydClcblxuICBnZXROZXh0TnVtYmVyOiAobnVtYmVyU3RyaW5nKSAtPlxuICAgIE51bWJlci5wYXJzZUludChudW1iZXJTdHJpbmcsIDEwKSArIEBzdGVwICogQGdldENvdW50KClcblxuIyBbY3RybC14XVxuY2xhc3MgRGVjcmVhc2UgZXh0ZW5kcyBJbmNyZWFzZVxuICBAZXh0ZW5kKClcbiAgc3RlcDogLTFcblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIFtnIGN0cmwtYV1cbmNsYXNzIEluY3JlbWVudE51bWJlciBleHRlbmRzIEluY3JlYXNlXG4gIEBleHRlbmQoKVxuICBiYXNlTnVtYmVyOiBudWxsXG4gIHRhcmdldDogbnVsbFxuICBtdXRhdGVTZWxlY3Rpb25PcmRlcmQ6IHRydWVcblxuICBnZXROZXh0TnVtYmVyOiAobnVtYmVyU3RyaW5nKSAtPlxuICAgIGlmIEBiYXNlTnVtYmVyP1xuICAgICAgQGJhc2VOdW1iZXIgKz0gQHN0ZXAgKiBAZ2V0Q291bnQoKVxuICAgIGVsc2VcbiAgICAgIEBiYXNlTnVtYmVyID0gTnVtYmVyLnBhcnNlSW50KG51bWJlclN0cmluZywgMTApXG4gICAgQGJhc2VOdW1iZXJcblxuIyBbZyBjdHJsLXhdXG5jbGFzcyBEZWNyZW1lbnROdW1iZXIgZXh0ZW5kcyBJbmNyZW1lbnROdW1iZXJcbiAgQGV4dGVuZCgpXG4gIHN0ZXA6IC0xXG5cbiMgUHV0XG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgQ3Vyc29yIHBsYWNlbWVudDpcbiMgLSBwbGFjZSBhdCBlbmQgb2YgbXV0YXRpb246IHBhc3RlIG5vbi1tdWx0aWxpbmUgY2hhcmFjdGVyd2lzZSB0ZXh0XG4jIC0gcGxhY2UgYXQgc3RhcnQgb2YgbXV0YXRpb246IG5vbi1tdWx0aWxpbmUgY2hhcmFjdGVyd2lzZSB0ZXh0KGNoYXJhY3Rlcndpc2UsIGxpbmV3aXNlKVxuY2xhc3MgUHV0QmVmb3JlIGV4dGVuZHMgT3BlcmF0b3JcbiAgQGV4dGVuZCgpXG4gIGxvY2F0aW9uOiAnYmVmb3JlJ1xuICB0YXJnZXQ6ICdFbXB0eSdcbiAgZmxhc2hUeXBlOiAnb3BlcmF0b3ItbG9uZydcbiAgcmVzdG9yZVBvc2l0aW9uczogZmFsc2UgIyBtYW5hZ2UgbWFudWFsbHlcbiAgZmxhc2hUYXJnZXQ6IGZhbHNlICMgbWFuYWdlIG1hbnVhbGx5XG4gIHRyYWNrQ2hhbmdlOiBmYWxzZSAjIG1hbmFnZSBtYW51YWxseVxuXG4gIGluaXRpYWxpemU6IC0+XG4gICAgQHZpbVN0YXRlLnNlcXVlbnRpYWxQYXN0ZU1hbmFnZXIub25Jbml0aWFsaXplKHRoaXMpXG5cbiAgZXhlY3V0ZTogLT5cbiAgICBAbXV0YXRpb25zQnlTZWxlY3Rpb24gPSBuZXcgTWFwKClcbiAgICBAc2VxdWVudGlhbFBhc3RlID0gQHZpbVN0YXRlLnNlcXVlbnRpYWxQYXN0ZU1hbmFnZXIub25FeGVjdXRlKHRoaXMpXG5cbiAgICBAb25EaWRGaW5pc2hNdXRhdGlvbiA9PlxuICAgICAgQGFkanVzdEN1cnNvclBvc2l0aW9uKCkgdW5sZXNzIEBjYW5jZWxsZWRcblxuICAgIHN1cGVyXG5cbiAgICByZXR1cm4gaWYgQGNhbmNlbGxlZFxuXG4gICAgQG9uRGlkRmluaXNoT3BlcmF0aW9uID0+XG4gICAgICAjIFRyYWNrQ2hhbmdlXG4gICAgICBpZiBuZXdSYW5nZSA9IEBtdXRhdGlvbnNCeVNlbGVjdGlvbi5nZXQoQGVkaXRvci5nZXRMYXN0U2VsZWN0aW9uKCkpXG4gICAgICAgIEBzZXRNYXJrRm9yQ2hhbmdlKG5ld1JhbmdlKVxuXG4gICAgICAjIEZsYXNoXG4gICAgICBpZiBAZ2V0Q29uZmlnKCdmbGFzaE9uT3BlcmF0ZScpIGFuZCBAbmFtZSBub3QgaW4gQGdldENvbmZpZygnZmxhc2hPbk9wZXJhdGVCbGFja2xpc3QnKVxuICAgICAgICB0b1JhbmdlID0gKHNlbGVjdGlvbikgPT4gQG11dGF0aW9uc0J5U2VsZWN0aW9uLmdldChzZWxlY3Rpb24pXG4gICAgICAgIEB2aW1TdGF0ZS5mbGFzaChAZWRpdG9yLmdldFNlbGVjdGlvbnMoKS5tYXAodG9SYW5nZSksIHR5cGU6IEBnZXRGbGFzaFR5cGUoKSlcblxuICBhZGp1c3RDdXJzb3JQb3NpdGlvbjogLT5cbiAgICBmb3Igc2VsZWN0aW9uIGluIEBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpIHdoZW4gQG11dGF0aW9uc0J5U2VsZWN0aW9uLmhhcyhzZWxlY3Rpb24pXG4gICAgICB7Y3Vyc29yfSA9IHNlbGVjdGlvblxuICAgICAge3N0YXJ0LCBlbmR9ID0gbmV3UmFuZ2UgPSBAbXV0YXRpb25zQnlTZWxlY3Rpb24uZ2V0KHNlbGVjdGlvbilcbiAgICAgIGlmIEBsaW5ld2lzZVBhc3RlXG4gICAgICAgIG1vdmVDdXJzb3JUb0ZpcnN0Q2hhcmFjdGVyQXRSb3coY3Vyc29yLCBzdGFydC5yb3cpXG4gICAgICBlbHNlXG4gICAgICAgIGlmIG5ld1JhbmdlLmlzU2luZ2xlTGluZSgpXG4gICAgICAgICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKGVuZC50cmFuc2xhdGUoWzAsIC0xXSkpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24oc3RhcnQpXG5cbiAgbXV0YXRlU2VsZWN0aW9uOiAoc2VsZWN0aW9uKSAtPlxuICAgIHt0ZXh0LCB0eXBlfSA9IEB2aW1TdGF0ZS5yZWdpc3Rlci5nZXQobnVsbCwgc2VsZWN0aW9uLCBAc2VxdWVudGlhbFBhc3RlKVxuICAgIHVubGVzcyB0ZXh0XG4gICAgICBAY2FuY2VsbGVkID0gdHJ1ZVxuICAgICAgcmV0dXJuXG5cbiAgICB0ZXh0ID0gXy5tdWx0aXBseVN0cmluZyh0ZXh0LCBAZ2V0Q291bnQoKSlcbiAgICBAbGluZXdpc2VQYXN0ZSA9IHR5cGUgaXMgJ2xpbmV3aXNlJyBvciBAaXNNb2RlKCd2aXN1YWwnLCAnbGluZXdpc2UnKVxuICAgIG5ld1JhbmdlID0gQHBhc3RlKHNlbGVjdGlvbiwgdGV4dCwge0BsaW5ld2lzZVBhc3RlfSlcbiAgICBAbXV0YXRpb25zQnlTZWxlY3Rpb24uc2V0KHNlbGVjdGlvbiwgbmV3UmFuZ2UpXG4gICAgQHZpbVN0YXRlLnNlcXVlbnRpYWxQYXN0ZU1hbmFnZXIuc2F2ZVBhc3RlZFJhbmdlRm9yU2VsZWN0aW9uKHNlbGVjdGlvbiwgbmV3UmFuZ2UpXG5cbiAgcGFzdGU6IChzZWxlY3Rpb24sIHRleHQsIHtsaW5ld2lzZVBhc3RlfSkgLT5cbiAgICBpZiBAc2VxdWVudGlhbFBhc3RlXG4gICAgICBAcGFzdGVDaGFyYWN0ZXJ3aXNlKHNlbGVjdGlvbiwgdGV4dClcbiAgICBlbHNlIGlmIGxpbmV3aXNlUGFzdGVcbiAgICAgIEBwYXN0ZUxpbmV3aXNlKHNlbGVjdGlvbiwgdGV4dClcbiAgICBlbHNlXG4gICAgICBAcGFzdGVDaGFyYWN0ZXJ3aXNlKHNlbGVjdGlvbiwgdGV4dClcblxuICBwYXN0ZUNoYXJhY3Rlcndpc2U6IChzZWxlY3Rpb24sIHRleHQpIC0+XG4gICAge2N1cnNvcn0gPSBzZWxlY3Rpb25cbiAgICBpZiBzZWxlY3Rpb24uaXNFbXB0eSgpIGFuZCBAbG9jYXRpb24gaXMgJ2FmdGVyJyBhbmQgbm90IGlzRW1wdHlSb3coQGVkaXRvciwgY3Vyc29yLmdldEJ1ZmZlclJvdygpKVxuICAgICAgY3Vyc29yLm1vdmVSaWdodCgpXG4gICAgcmV0dXJuIHNlbGVjdGlvbi5pbnNlcnRUZXh0KHRleHQpXG5cbiAgIyBSZXR1cm4gbmV3UmFuZ2VcbiAgcGFzdGVMaW5ld2lzZTogKHNlbGVjdGlvbiwgdGV4dCkgLT5cbiAgICB7Y3Vyc29yfSA9IHNlbGVjdGlvblxuICAgIGN1cnNvclJvdyA9IGN1cnNvci5nZXRCdWZmZXJSb3coKVxuICAgIHRleHQgKz0gXCJcXG5cIiB1bmxlc3MgdGV4dC5lbmRzV2l0aChcIlxcblwiKVxuICAgIGlmIHNlbGVjdGlvbi5pc0VtcHR5KClcbiAgICAgIGlmIEBsb2NhdGlvbiBpcyAnYmVmb3JlJ1xuICAgICAgICBpbnNlcnRUZXh0QXRCdWZmZXJQb3NpdGlvbihAZWRpdG9yLCBbY3Vyc29yUm93LCAwXSwgdGV4dClcbiAgICAgIGVsc2UgaWYgQGxvY2F0aW9uIGlzICdhZnRlcidcbiAgICAgICAgdGFyZ2V0Um93ID0gQGdldEZvbGRFbmRSb3dGb3JSb3coY3Vyc29yUm93KVxuICAgICAgICBlbnN1cmVFbmRzV2l0aE5ld0xpbmVGb3JCdWZmZXJSb3coQGVkaXRvciwgdGFyZ2V0Um93KVxuICAgICAgICBpbnNlcnRUZXh0QXRCdWZmZXJQb3NpdGlvbihAZWRpdG9yLCBbdGFyZ2V0Um93ICsgMSwgMF0sIHRleHQpXG4gICAgZWxzZVxuICAgICAgc2VsZWN0aW9uLmluc2VydFRleHQoXCJcXG5cIikgdW5sZXNzIEBpc01vZGUoJ3Zpc3VhbCcsICdsaW5ld2lzZScpXG4gICAgICBzZWxlY3Rpb24uaW5zZXJ0VGV4dCh0ZXh0KVxuXG5jbGFzcyBQdXRBZnRlciBleHRlbmRzIFB1dEJlZm9yZVxuICBAZXh0ZW5kKClcbiAgbG9jYXRpb246ICdhZnRlcidcblxuY2xhc3MgUHV0QmVmb3JlV2l0aEF1dG9JbmRlbnQgZXh0ZW5kcyBQdXRCZWZvcmVcbiAgQGV4dGVuZCgpXG5cbiAgcGFzdGVMaW5ld2lzZTogKHNlbGVjdGlvbiwgdGV4dCkgLT5cbiAgICBuZXdSYW5nZSA9IHN1cGVyXG4gICAgYWRqdXN0SW5kZW50V2l0aEtlZXBpbmdMYXlvdXQoQGVkaXRvciwgbmV3UmFuZ2UpXG4gICAgcmV0dXJuIG5ld1JhbmdlXG5cbmNsYXNzIFB1dEFmdGVyV2l0aEF1dG9JbmRlbnQgZXh0ZW5kcyBQdXRCZWZvcmVXaXRoQXV0b0luZGVudFxuICBAZXh0ZW5kKClcbiAgbG9jYXRpb246ICdhZnRlcidcblxuY2xhc3MgQWRkQmxhbmtMaW5lQmVsb3cgZXh0ZW5kcyBPcGVyYXRvclxuICBAZXh0ZW5kKClcbiAgZmxhc2hUYXJnZXQ6IGZhbHNlXG4gIHRhcmdldDogXCJFbXB0eVwiXG4gIHN0YXlBdFNhbWVQb3NpdGlvbjogdHJ1ZVxuICBzdGF5QnlNYXJrZXI6IHRydWVcbiAgd2hlcmU6ICdiZWxvdydcblxuICBtdXRhdGVTZWxlY3Rpb246IChzZWxlY3Rpb24pIC0+XG4gICAgcm93ID0gc2VsZWN0aW9uLmdldEhlYWRCdWZmZXJQb3NpdGlvbigpLnJvd1xuICAgIHJvdyArPSAxIGlmIEB3aGVyZSBpcyAnYmVsb3cnXG4gICAgcG9pbnQgPSBbcm93LCAwXVxuICAgIEBlZGl0b3Iuc2V0VGV4dEluQnVmZmVyUmFuZ2UoW3BvaW50LCBwb2ludF0sIFwiXFxuXCIucmVwZWF0KEBnZXRDb3VudCgpKSlcblxuY2xhc3MgQWRkQmxhbmtMaW5lQWJvdmUgZXh0ZW5kcyBBZGRCbGFua0xpbmVCZWxvd1xuICBAZXh0ZW5kKClcbiAgd2hlcmU6ICdhYm92ZSdcbiJdfQ==
