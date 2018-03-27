(function() {
  var AddBlankLineAbove, AddBlankLineBelow, AddPresetOccurrenceFromLastOccurrencePattern, Base, CreatePersistentSelection, Decrease, DecrementNumber, Delete, DeleteLeft, DeleteLine, DeleteRight, DeleteToLastCharacterOfLine, Increase, IncrementNumber, Operator, PutAfter, PutAfterWithAutoIndent, PutBefore, PutBeforeWithAutoIndent, Select, SelectLatestChange, SelectOccurrence, SelectPersistentSelection, SelectPreviousSelection, TogglePersistentSelection, TogglePresetOccurrence, TogglePresetSubwordOccurrence, Yank, YankLine, YankToLastCharacterOfLine, _, adjustIndentWithKeepingLayout, ensureEndsWithNewLineForBufferRow, getSubwordPatternAtBufferPosition, getWordPatternAtBufferPosition, haveSomeNonEmptySelection, insertTextAtBufferPosition, isEmptyRow, moveCursorToFirstCharacterAtRow, ref, setBufferRow, swrap,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  _ = require('underscore-plus');

  ref = require('./utils'), haveSomeNonEmptySelection = ref.haveSomeNonEmptySelection, isEmptyRow = ref.isEmptyRow, getWordPatternAtBufferPosition = ref.getWordPatternAtBufferPosition, getSubwordPatternAtBufferPosition = ref.getSubwordPatternAtBufferPosition, insertTextAtBufferPosition = ref.insertTextAtBufferPosition, setBufferRow = ref.setBufferRow, moveCursorToFirstCharacterAtRow = ref.moveCursorToFirstCharacterAtRow, ensureEndsWithNewLineForBufferRow = ref.ensureEndsWithNewLineForBufferRow, adjustIndentWithKeepingLayout = ref.adjustIndentWithKeepingLayout;

  swrap = require('./selection-wrapper');

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
          this.vimState.modeManager.activate('visual', swrap.detectWise(this.editor));
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
        ref1 = swrap.getSelections(this.editor);
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
        return swrap.normalize(this.editor);
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
      if (this.targetSelected = haveSomeNonEmptySelection(this.editor) || this.target.name === "Empty") {
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
      var cursor, cursorRow, newRange;
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
          ensureEndsWithNewLineForBufferRow(this.editor, cursorRow);
          newRange = insertTextAtBufferPosition(this.editor, [cursorRow + 1, 0], text);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvb3BlcmF0b3IuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSx3eUJBQUE7SUFBQTs7Ozs7RUFBQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSOztFQUNKLE1BVUksT0FBQSxDQUFRLFNBQVIsQ0FWSixFQUNFLHlEQURGLEVBRUUsMkJBRkYsRUFHRSxtRUFIRixFQUlFLHlFQUpGLEVBS0UsMkRBTEYsRUFNRSwrQkFORixFQU9FLHFFQVBGLEVBUUUseUVBUkYsRUFTRTs7RUFFRixLQUFBLEdBQVEsT0FBQSxDQUFRLHFCQUFSOztFQUNSLElBQUEsR0FBTyxPQUFBLENBQVEsUUFBUjs7RUFFRDs7O0lBQ0osUUFBQyxDQUFBLE1BQUQsQ0FBUSxLQUFSOztJQUNBLFFBQUMsQ0FBQSxhQUFELEdBQWdCOzt1QkFDaEIsYUFBQSxHQUFlOzt1QkFDZixVQUFBLEdBQVk7O3VCQUVaLElBQUEsR0FBTTs7dUJBQ04sVUFBQSxHQUFZOzt1QkFDWixjQUFBLEdBQWdCOzt1QkFFaEIsV0FBQSxHQUFhOzt1QkFDYixlQUFBLEdBQWlCOzt1QkFDakIsU0FBQSxHQUFXOzt1QkFDWCxzQkFBQSxHQUF3Qjs7dUJBQ3hCLFdBQUEsR0FBYTs7dUJBRWIsb0JBQUEsR0FBc0I7O3VCQUN0QixrQkFBQSxHQUFvQjs7dUJBQ3BCLGNBQUEsR0FBZ0I7O3VCQUNoQixZQUFBLEdBQWM7O3VCQUNkLGdCQUFBLEdBQWtCOzt1QkFDbEIsNkJBQUEsR0FBK0I7O3VCQUUvQixzQkFBQSxHQUF3Qjs7dUJBQ3hCLHlCQUFBLEdBQTJCOzt1QkFFM0IseUJBQUEsR0FBMkI7O3VCQUMzQixxQkFBQSxHQUF1Qjs7dUJBSXZCLGtCQUFBLEdBQW9COzt1QkFDcEIsY0FBQSxHQUFnQjs7dUJBQ2hCLGNBQUEsR0FBZ0IsU0FBQTth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b0I7O2dDQUNwQixZQUFBLEdBQWM7O2dDQUNkLEtBQUEsR0FBTzs7Z0NBRVAsZUFBQSxHQUFpQixTQUFDLFNBQUQ7QUFDZixVQUFBO01BQUEsR0FBQSxHQUFNLFNBQVMsQ0FBQyxxQkFBVixDQUFBLENBQWlDLENBQUM7TUFDeEMsSUFBWSxJQUFDLENBQUEsS0FBRCxLQUFVLE9BQXRCO1FBQUEsR0FBQSxJQUFPLEVBQVA7O01BQ0EsS0FBQSxHQUFRLENBQUMsR0FBRCxFQUFNLENBQU47YUFDUixJQUFDLENBQUEsTUFBTSxDQUFDLG9CQUFSLENBQTZCLENBQUMsS0FBRCxFQUFRLEtBQVIsQ0FBN0IsRUFBNkMsSUFBSSxDQUFDLE1BQUwsQ0FBWSxJQUFDLENBQUEsUUFBRCxDQUFBLENBQVosQ0FBN0M7SUFKZTs7OztLQVJhOztFQWMxQjs7Ozs7OztJQUNKLGlCQUFDLENBQUEsTUFBRCxDQUFBOztnQ0FDQSxLQUFBLEdBQU87Ozs7S0FGdUI7QUF4b0JoQyIsInNvdXJjZXNDb250ZW50IjpbIl8gPSByZXF1aXJlICd1bmRlcnNjb3JlLXBsdXMnXG57XG4gIGhhdmVTb21lTm9uRW1wdHlTZWxlY3Rpb25cbiAgaXNFbXB0eVJvd1xuICBnZXRXb3JkUGF0dGVybkF0QnVmZmVyUG9zaXRpb25cbiAgZ2V0U3Vid29yZFBhdHRlcm5BdEJ1ZmZlclBvc2l0aW9uXG4gIGluc2VydFRleHRBdEJ1ZmZlclBvc2l0aW9uXG4gIHNldEJ1ZmZlclJvd1xuICBtb3ZlQ3Vyc29yVG9GaXJzdENoYXJhY3RlckF0Um93XG4gIGVuc3VyZUVuZHNXaXRoTmV3TGluZUZvckJ1ZmZlclJvd1xuICBhZGp1c3RJbmRlbnRXaXRoS2VlcGluZ0xheW91dFxufSA9IHJlcXVpcmUgJy4vdXRpbHMnXG5zd3JhcCA9IHJlcXVpcmUgJy4vc2VsZWN0aW9uLXdyYXBwZXInXG5CYXNlID0gcmVxdWlyZSAnLi9iYXNlJ1xuXG5jbGFzcyBPcGVyYXRvciBleHRlbmRzIEJhc2VcbiAgQGV4dGVuZChmYWxzZSlcbiAgQG9wZXJhdGlvbktpbmQ6ICdvcGVyYXRvcidcbiAgcmVxdWlyZVRhcmdldDogdHJ1ZVxuICByZWNvcmRhYmxlOiB0cnVlXG5cbiAgd2lzZTogbnVsbFxuICBvY2N1cnJlbmNlOiBmYWxzZVxuICBvY2N1cnJlbmNlVHlwZTogJ2Jhc2UnXG5cbiAgZmxhc2hUYXJnZXQ6IHRydWVcbiAgZmxhc2hDaGVja3BvaW50OiAnZGlkLWZpbmlzaCdcbiAgZmxhc2hUeXBlOiAnb3BlcmF0b3InXG4gIGZsYXNoVHlwZUZvck9jY3VycmVuY2U6ICdvcGVyYXRvci1vY2N1cnJlbmNlJ1xuICB0cmFja0NoYW5nZTogZmFsc2VcblxuICBwYXR0ZXJuRm9yT2NjdXJyZW5jZTogbnVsbFxuICBzdGF5QXRTYW1lUG9zaXRpb246IG51bGxcbiAgc3RheU9wdGlvbk5hbWU6IG51bGxcbiAgc3RheUJ5TWFya2VyOiBmYWxzZVxuICByZXN0b3JlUG9zaXRpb25zOiB0cnVlXG4gIHNldFRvRmlyc3RDaGFyYWN0ZXJPbkxpbmV3aXNlOiBmYWxzZVxuXG4gIGFjY2VwdFByZXNldE9jY3VycmVuY2U6IHRydWVcbiAgYWNjZXB0UGVyc2lzdGVudFNlbGVjdGlvbjogdHJ1ZVxuXG4gIGJ1ZmZlckNoZWNrcG9pbnRCeVB1cnBvc2U6IG51bGxcbiAgbXV0YXRlU2VsZWN0aW9uT3JkZXJkOiBmYWxzZVxuXG4gICMgRXhwZXJpbWVudGFseSBhbGxvdyBzZWxlY3RUYXJnZXQgYmVmb3JlIGlucHV0IENvbXBsZXRlXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBzdXBwb3J0RWFybHlTZWxlY3Q6IGZhbHNlXG4gIHRhcmdldFNlbGVjdGVkOiBudWxsXG4gIGNhbkVhcmx5U2VsZWN0OiAtPlxuICAgIEBzdXBwb3J0RWFybHlTZWxlY3QgYW5kIG5vdCBAcmVwZWF0ZWRcbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgIyBDYWxsZWQgd2hlbiBvcGVyYXRpb24gZmluaXNoZWRcbiAgIyBUaGlzIGlzIGVzc2VudGlhbGx5IHRvIHJlc2V0IHN0YXRlIGZvciBgLmAgcmVwZWF0LlxuICByZXNldFN0YXRlOiAtPlxuICAgIEB0YXJnZXRTZWxlY3RlZCA9IG51bGxcbiAgICBAb2NjdXJyZW5jZVNlbGVjdGVkID0gZmFsc2VcblxuICAjIFR3byBjaGVja3BvaW50IGZvciBkaWZmZXJlbnQgcHVycG9zZVxuICAjIC0gb25lIGZvciB1bmRvKGhhbmRsZWQgYnkgbW9kZU1hbmFnZXIpXG4gICMgLSBvbmUgZm9yIHByZXNlcnZlIGxhc3QgaW5zZXJ0ZWQgdGV4dFxuICBjcmVhdGVCdWZmZXJDaGVja3BvaW50OiAocHVycG9zZSkgLT5cbiAgICBAYnVmZmVyQ2hlY2twb2ludEJ5UHVycG9zZSA/PSB7fVxuICAgIEBidWZmZXJDaGVja3BvaW50QnlQdXJwb3NlW3B1cnBvc2VdID0gQGVkaXRvci5jcmVhdGVDaGVja3BvaW50KClcblxuICBnZXRCdWZmZXJDaGVja3BvaW50OiAocHVycG9zZSkgLT5cbiAgICBAYnVmZmVyQ2hlY2twb2ludEJ5UHVycG9zZT9bcHVycG9zZV1cblxuICBkZWxldGVCdWZmZXJDaGVja3BvaW50OiAocHVycG9zZSkgLT5cbiAgICBpZiBAYnVmZmVyQ2hlY2twb2ludEJ5UHVycG9zZT9cbiAgICAgIGRlbGV0ZSBAYnVmZmVyQ2hlY2twb2ludEJ5UHVycG9zZVtwdXJwb3NlXVxuXG4gIGdyb3VwQ2hhbmdlc1NpbmNlQnVmZmVyQ2hlY2twb2ludDogKHB1cnBvc2UpIC0+XG4gICAgaWYgY2hlY2twb2ludCA9IEBnZXRCdWZmZXJDaGVja3BvaW50KHB1cnBvc2UpXG4gICAgICBAZWRpdG9yLmdyb3VwQ2hhbmdlc1NpbmNlQ2hlY2twb2ludChjaGVja3BvaW50KVxuICAgICAgQGRlbGV0ZUJ1ZmZlckNoZWNrcG9pbnQocHVycG9zZSlcblxuICBzZXRNYXJrRm9yQ2hhbmdlOiAocmFuZ2UpIC0+XG4gICAgQHZpbVN0YXRlLm1hcmsuc2V0KCdbJywgcmFuZ2Uuc3RhcnQpXG4gICAgQHZpbVN0YXRlLm1hcmsuc2V0KCddJywgcmFuZ2UuZW5kKVxuXG4gIG5lZWRGbGFzaDogLT5cbiAgICBAZmxhc2hUYXJnZXQgYW5kIEBnZXRDb25maWcoJ2ZsYXNoT25PcGVyYXRlJykgYW5kXG4gICAgICAoQG5hbWUgbm90IGluIEBnZXRDb25maWcoJ2ZsYXNoT25PcGVyYXRlQmxhY2tsaXN0JykpIGFuZFxuICAgICAgKChAbW9kZSBpc250ICd2aXN1YWwnKSBvciAoQHN1Ym1vZGUgaXNudCBAdGFyZ2V0Lndpc2UpKSAjIGUuZy4gWSBpbiB2Q1xuXG4gIGZsYXNoSWZOZWNlc3Nhcnk6IChyYW5nZXMpIC0+XG4gICAgaWYgQG5lZWRGbGFzaCgpXG4gICAgICBAdmltU3RhdGUuZmxhc2gocmFuZ2VzLCB0eXBlOiBAZ2V0Rmxhc2hUeXBlKCkpXG5cbiAgZmxhc2hDaGFuZ2VJZk5lY2Vzc2FyeTogLT5cbiAgICBpZiBAbmVlZEZsYXNoKClcbiAgICAgIEBvbkRpZEZpbmlzaE9wZXJhdGlvbiA9PlxuICAgICAgICByYW5nZXMgPSBAbXV0YXRpb25NYW5hZ2VyLmdldFNlbGVjdGVkQnVmZmVyUmFuZ2VzRm9yQ2hlY2twb2ludChAZmxhc2hDaGVja3BvaW50KVxuICAgICAgICBAdmltU3RhdGUuZmxhc2gocmFuZ2VzLCB0eXBlOiBAZ2V0Rmxhc2hUeXBlKCkpXG5cbiAgZ2V0Rmxhc2hUeXBlOiAtPlxuICAgIGlmIEBvY2N1cnJlbmNlU2VsZWN0ZWRcbiAgICAgIEBmbGFzaFR5cGVGb3JPY2N1cnJlbmNlXG4gICAgZWxzZVxuICAgICAgQGZsYXNoVHlwZVxuXG4gIHRyYWNrQ2hhbmdlSWZOZWNlc3Nhcnk6IC0+XG4gICAgcmV0dXJuIHVubGVzcyBAdHJhY2tDaGFuZ2VcblxuICAgIEBvbkRpZEZpbmlzaE9wZXJhdGlvbiA9PlxuICAgICAgaWYgcmFuZ2UgPSBAbXV0YXRpb25NYW5hZ2VyLmdldE11dGF0ZWRCdWZmZXJSYW5nZUZvclNlbGVjdGlvbihAZWRpdG9yLmdldExhc3RTZWxlY3Rpb24oKSlcbiAgICAgICAgQHNldE1hcmtGb3JDaGFuZ2UocmFuZ2UpXG5cbiAgY29uc3RydWN0b3I6IC0+XG4gICAgc3VwZXJcbiAgICB7QG11dGF0aW9uTWFuYWdlciwgQG9jY3VycmVuY2VNYW5hZ2VyLCBAcGVyc2lzdGVudFNlbGVjdGlvbn0gPSBAdmltU3RhdGVcbiAgICBAc3Vic2NyaWJlUmVzZXRPY2N1cnJlbmNlUGF0dGVybklmTmVlZGVkKClcbiAgICBAaW5pdGlhbGl6ZSgpXG4gICAgQG9uRGlkU2V0T3BlcmF0b3JNb2RpZmllcihAc2V0TW9kaWZpZXIuYmluZCh0aGlzKSlcblxuICAgICMgV2hlbiBwcmVzZXQtb2NjdXJyZW5jZSB3YXMgZXhpc3RzLCBvcGVyYXRlIG9uIG9jY3VycmVuY2Utd2lzZVxuICAgIGlmIEBhY2NlcHRQcmVzZXRPY2N1cnJlbmNlIGFuZCBAb2NjdXJyZW5jZU1hbmFnZXIuaGFzTWFya2VycygpXG4gICAgICBAb2NjdXJyZW5jZSA9IHRydWVcblxuICAgICMgW0ZJWE1FXSBPUkRFUi1NQVRURVJcbiAgICAjIFRvIHBpY2sgY3Vyc29yLXdvcmQgdG8gZmluZCBvY2N1cnJlbmNlIGJhc2UgcGF0dGVybi5cbiAgICAjIFRoaXMgaGFzIHRvIGJlIGRvbmUgQkVGT1JFIGNvbnZlcnRpbmcgcGVyc2lzdGVudC1zZWxlY3Rpb24gaW50byByZWFsLXNlbGVjdGlvbi5cbiAgICAjIFNpbmNlIHdoZW4gcGVyc2lzdGVudC1zZWxlY3Rpb24gaXMgYWN0dWFsbCBzZWxlY3RlZCwgaXQgY2hhbmdlIGN1cnNvciBwb3NpdGlvbi5cbiAgICBpZiBAb2NjdXJyZW5jZSBhbmQgbm90IEBvY2N1cnJlbmNlTWFuYWdlci5oYXNNYXJrZXJzKClcbiAgICAgIEBvY2N1cnJlbmNlTWFuYWdlci5hZGRQYXR0ZXJuKEBwYXR0ZXJuRm9yT2NjdXJyZW5jZSA/IEBnZXRQYXR0ZXJuRm9yT2NjdXJyZW5jZVR5cGUoQG9jY3VycmVuY2VUeXBlKSlcblxuXG4gICAgIyBUaGlzIGNoYW5nZSBjdXJzb3IgcG9zaXRpb24uXG4gICAgaWYgQHNlbGVjdFBlcnNpc3RlbnRTZWxlY3Rpb25JZk5lY2Vzc2FyeSgpXG4gICAgICAjIFtGSVhNRV0gc2VsZWN0aW9uLXdpc2UgaXMgbm90IHN5bmNoZWQgaWYgaXQgYWxyZWFkeSB2aXN1YWwtbW9kZVxuICAgICAgdW5sZXNzIEBtb2RlIGlzICd2aXN1YWwnXG4gICAgICAgIEB2aW1TdGF0ZS5tb2RlTWFuYWdlci5hY3RpdmF0ZSgndmlzdWFsJywgc3dyYXAuZGV0ZWN0V2lzZShAZWRpdG9yKSlcblxuICAgIEB0YXJnZXQgPSAnQ3VycmVudFNlbGVjdGlvbicgaWYgQG1vZGUgaXMgJ3Zpc3VhbCcgYW5kIEByZXF1aXJlVGFyZ2V0XG4gICAgQHNldFRhcmdldChAbmV3KEB0YXJnZXQpKSBpZiBfLmlzU3RyaW5nKEB0YXJnZXQpXG5cbiAgc3Vic2NyaWJlUmVzZXRPY2N1cnJlbmNlUGF0dGVybklmTmVlZGVkOiAtPlxuICAgICMgW0NBVVRJT05dXG4gICAgIyBUaGlzIG1ldGhvZCBoYXMgdG8gYmUgY2FsbGVkIGluIFBST1BFUiB0aW1pbmcuXG4gICAgIyBJZiBvY2N1cnJlbmNlIGlzIHRydWUgYnV0IG5vIHByZXNldC1vY2N1cnJlbmNlXG4gICAgIyBUcmVhdCB0aGF0IGBvY2N1cnJlbmNlYCBpcyBCT1VOREVEIHRvIG9wZXJhdG9yIGl0c2VsZiwgc28gY2xlYW5wIGF0IGZpbmlzaGVkLlxuICAgIGlmIEBvY2N1cnJlbmNlIGFuZCBub3QgQG9jY3VycmVuY2VNYW5hZ2VyLmhhc01hcmtlcnMoKVxuICAgICAgQG9uRGlkUmVzZXRPcGVyYXRpb25TdGFjayg9PiBAb2NjdXJyZW5jZU1hbmFnZXIucmVzZXRQYXR0ZXJucygpKVxuXG4gIHNldE1vZGlmaWVyOiAob3B0aW9ucykgLT5cbiAgICBpZiBvcHRpb25zLndpc2U/XG4gICAgICBAd2lzZSA9IG9wdGlvbnMud2lzZVxuICAgICAgcmV0dXJuXG5cbiAgICBpZiBvcHRpb25zLm9jY3VycmVuY2U/XG4gICAgICBAb2NjdXJyZW5jZSA9IG9wdGlvbnMub2NjdXJyZW5jZVxuICAgICAgaWYgQG9jY3VycmVuY2VcbiAgICAgICAgQG9jY3VycmVuY2VUeXBlID0gb3B0aW9ucy5vY2N1cnJlbmNlVHlwZVxuICAgICAgICAjIFRoaXMgaXMgbyBtb2RpZmllciBjYXNlKGUuZy4gYGMgbyBwYCwgYGQgTyBmYClcbiAgICAgICAgIyBXZSBSRVNFVCBleGlzdGluZyBvY2N1cmVuY2UtbWFya2VyIHdoZW4gYG9gIG9yIGBPYCBtb2RpZmllciBpcyB0eXBlZCBieSB1c2VyLlxuICAgICAgICBwYXR0ZXJuID0gQGdldFBhdHRlcm5Gb3JPY2N1cnJlbmNlVHlwZShAb2NjdXJyZW5jZVR5cGUpXG4gICAgICAgIEBvY2N1cnJlbmNlTWFuYWdlci5hZGRQYXR0ZXJuKHBhdHRlcm4sIHtyZXNldDogdHJ1ZSwgQG9jY3VycmVuY2VUeXBlfSlcbiAgICAgICAgQG9uRGlkUmVzZXRPcGVyYXRpb25TdGFjayg9PiBAb2NjdXJyZW5jZU1hbmFnZXIucmVzZXRQYXR0ZXJucygpKVxuXG4gICMgcmV0dXJuIHRydWUvZmFsc2UgdG8gaW5kaWNhdGUgc3VjY2Vzc1xuICBzZWxlY3RQZXJzaXN0ZW50U2VsZWN0aW9uSWZOZWNlc3Nhcnk6IC0+XG4gICAgaWYgQGFjY2VwdFBlcnNpc3RlbnRTZWxlY3Rpb24gYW5kXG4gICAgICAgIEBnZXRDb25maWcoJ2F1dG9TZWxlY3RQZXJzaXN0ZW50U2VsZWN0aW9uT25PcGVyYXRlJykgYW5kXG4gICAgICAgIG5vdCBAcGVyc2lzdGVudFNlbGVjdGlvbi5pc0VtcHR5KClcblxuICAgICAgQHBlcnNpc3RlbnRTZWxlY3Rpb24uc2VsZWN0KClcbiAgICAgIEBlZGl0b3IubWVyZ2VJbnRlcnNlY3RpbmdTZWxlY3Rpb25zKClcbiAgICAgIGZvciAkc2VsZWN0aW9uIGluIHN3cmFwLmdldFNlbGVjdGlvbnMoQGVkaXRvcikgd2hlbiBub3QgJHNlbGVjdGlvbi5oYXNQcm9wZXJ0aWVzKClcbiAgICAgICAgJHNlbGVjdGlvbi5zYXZlUHJvcGVydGllcygpXG4gICAgICB0cnVlXG4gICAgZWxzZVxuICAgICAgZmFsc2VcblxuICBnZXRQYXR0ZXJuRm9yT2NjdXJyZW5jZVR5cGU6IChvY2N1cnJlbmNlVHlwZSkgLT5cbiAgICBzd2l0Y2ggb2NjdXJyZW5jZVR5cGVcbiAgICAgIHdoZW4gJ2Jhc2UnXG4gICAgICAgIGdldFdvcmRQYXR0ZXJuQXRCdWZmZXJQb3NpdGlvbihAZWRpdG9yLCBAZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKSlcbiAgICAgIHdoZW4gJ3N1YndvcmQnXG4gICAgICAgIGdldFN1YndvcmRQYXR0ZXJuQXRCdWZmZXJQb3NpdGlvbihAZWRpdG9yLCBAZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKSlcblxuICAjIHRhcmdldCBpcyBUZXh0T2JqZWN0IG9yIE1vdGlvbiB0byBvcGVyYXRlIG9uLlxuICBzZXRUYXJnZXQ6IChAdGFyZ2V0KSAtPlxuICAgIEB0YXJnZXQub3BlcmF0b3IgPSB0aGlzXG4gICAgQGVtaXREaWRTZXRUYXJnZXQodGhpcylcblxuICAgIGlmIEBjYW5FYXJseVNlbGVjdCgpXG4gICAgICBAbm9ybWFsaXplU2VsZWN0aW9uc0lmTmVjZXNzYXJ5KClcbiAgICAgIEBjcmVhdGVCdWZmZXJDaGVja3BvaW50KCd1bmRvJylcbiAgICAgIEBzZWxlY3RUYXJnZXQoKVxuICAgIHRoaXNcblxuICBzZXRUZXh0VG9SZWdpc3RlckZvclNlbGVjdGlvbjogKHNlbGVjdGlvbikgLT5cbiAgICBAc2V0VGV4dFRvUmVnaXN0ZXIoc2VsZWN0aW9uLmdldFRleHQoKSwgc2VsZWN0aW9uKVxuXG4gIHNldFRleHRUb1JlZ2lzdGVyOiAodGV4dCwgc2VsZWN0aW9uKSAtPlxuICAgIHRleHQgKz0gXCJcXG5cIiBpZiAoQHRhcmdldC5pc0xpbmV3aXNlKCkgYW5kIChub3QgdGV4dC5lbmRzV2l0aCgnXFxuJykpKVxuICAgIEB2aW1TdGF0ZS5yZWdpc3Rlci5zZXQobnVsbCwge3RleHQsIHNlbGVjdGlvbn0pIGlmIHRleHRcblxuICBub3JtYWxpemVTZWxlY3Rpb25zSWZOZWNlc3Nhcnk6IC0+XG4gICAgaWYgQHRhcmdldD8uaXNNb3Rpb24oKSBhbmQgKEBtb2RlIGlzICd2aXN1YWwnKVxuICAgICAgc3dyYXAubm9ybWFsaXplKEBlZGl0b3IpXG5cbiAgc3RhcnRNdXRhdGlvbjogKGZuKSAtPlxuICAgIGlmIEBjYW5FYXJseVNlbGVjdCgpXG4gICAgICAjIC0gU2tpcCBzZWxlY3Rpb24gbm9ybWFsaXphdGlvbjogYWxyZWFkeSBub3JtYWxpemVkIGJlZm9yZSBAc2VsZWN0VGFyZ2V0KClcbiAgICAgICMgLSBNYW51YWwgY2hlY2twb2ludCBncm91cGluZzogdG8gY3JlYXRlIGNoZWNrcG9pbnQgYmVmb3JlIEBzZWxlY3RUYXJnZXQoKVxuICAgICAgZm4oKVxuICAgICAgQGVtaXRXaWxsRmluaXNoTXV0YXRpb24oKVxuICAgICAgQGdyb3VwQ2hhbmdlc1NpbmNlQnVmZmVyQ2hlY2twb2ludCgndW5kbycpXG5cbiAgICBlbHNlXG4gICAgICBAbm9ybWFsaXplU2VsZWN0aW9uc0lmTmVjZXNzYXJ5KClcbiAgICAgIEBlZGl0b3IudHJhbnNhY3QgPT5cbiAgICAgICAgZm4oKVxuICAgICAgICBAZW1pdFdpbGxGaW5pc2hNdXRhdGlvbigpXG5cbiAgICBAZW1pdERpZEZpbmlzaE11dGF0aW9uKClcblxuICAjIE1haW5cbiAgZXhlY3V0ZTogLT5cbiAgICBAc3RhcnRNdXRhdGlvbiA9PlxuICAgICAgaWYgQHNlbGVjdFRhcmdldCgpXG4gICAgICAgIGlmIEBtdXRhdGVTZWxlY3Rpb25PcmRlcmRcbiAgICAgICAgICBzZWxlY3Rpb25zID0gQGVkaXRvci5nZXRTZWxlY3Rpb25zT3JkZXJlZEJ5QnVmZmVyUG9zaXRpb24oKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgc2VsZWN0aW9ucyA9IEBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpXG4gICAgICAgIGZvciBzZWxlY3Rpb24gaW4gc2VsZWN0aW9uc1xuICAgICAgICAgIEBtdXRhdGVTZWxlY3Rpb24oc2VsZWN0aW9uKVxuICAgICAgICBAbXV0YXRpb25NYW5hZ2VyLnNldENoZWNrcG9pbnQoJ2RpZC1maW5pc2gnKVxuICAgICAgICBAcmVzdG9yZUN1cnNvclBvc2l0aW9uc0lmTmVjZXNzYXJ5KClcblxuICAgICMgRXZlbiB0aG91Z2ggd2UgZmFpbCB0byBzZWxlY3QgdGFyZ2V0IGFuZCBmYWlsIHRvIG11dGF0ZSxcbiAgICAjIHdlIGhhdmUgdG8gcmV0dXJuIHRvIG5vcm1hbC1tb2RlIGZyb20gb3BlcmF0b3ItcGVuZGluZyBvciB2aXN1YWxcbiAgICBAYWN0aXZhdGVNb2RlKCdub3JtYWwnKVxuXG4gICMgUmV0dXJuIHRydWUgdW5sZXNzIGFsbCBzZWxlY3Rpb24gaXMgZW1wdHkuXG4gIHNlbGVjdFRhcmdldDogLT5cbiAgICByZXR1cm4gQHRhcmdldFNlbGVjdGVkIGlmIEB0YXJnZXRTZWxlY3RlZD9cbiAgICBAbXV0YXRpb25NYW5hZ2VyLmluaXQoe0BzdGF5QnlNYXJrZXJ9KVxuXG4gICAgQHRhcmdldC5mb3JjZVdpc2UoQHdpc2UpIGlmIEB3aXNlP1xuICAgIEBlbWl0V2lsbFNlbGVjdFRhcmdldCgpXG5cbiAgICAjIEFsbG93IGN1cnNvciBwb3NpdGlvbiBhZGp1c3RtZW50ICdvbi13aWxsLXNlbGVjdC10YXJnZXQnIGhvb2suXG4gICAgIyBzbyBjaGVja3BvaW50IGNvbWVzIEFGVEVSIEBlbWl0V2lsbFNlbGVjdFRhcmdldCgpXG4gICAgQG11dGF0aW9uTWFuYWdlci5zZXRDaGVja3BvaW50KCd3aWxsLXNlbGVjdCcpXG5cbiAgICAjIE5PVEVcbiAgICAjIFNpbmNlIE1vdmVUb05leHRPY2N1cnJlbmNlLCBNb3ZlVG9QcmV2aW91c09jY3VycmVuY2UgbW90aW9uIG1vdmUgYnlcbiAgICAjICBvY2N1cnJlbmNlLW1hcmtlciwgb2NjdXJyZW5jZS1tYXJrZXIgaGFzIHRvIGJlIGNyZWF0ZWQgQkVGT1JFIGBAdGFyZ2V0LmV4ZWN1dGUoKWBcbiAgICAjIEFuZCB3aGVuIHJlcGVhdGVkLCBvY2N1cnJlbmNlIHBhdHRlcm4gaXMgYWxyZWFkeSBjYWNoZWQgYXQgQHBhdHRlcm5Gb3JPY2N1cnJlbmNlXG4gICAgaWYgQHJlcGVhdGVkIGFuZCBAb2NjdXJyZW5jZSBhbmQgbm90IEBvY2N1cnJlbmNlTWFuYWdlci5oYXNNYXJrZXJzKClcbiAgICAgIEBvY2N1cnJlbmNlTWFuYWdlci5hZGRQYXR0ZXJuKEBwYXR0ZXJuRm9yT2NjdXJyZW5jZSwge0BvY2N1cnJlbmNlVHlwZX0pXG5cbiAgICBAdGFyZ2V0LmV4ZWN1dGUoKVxuXG4gICAgQG11dGF0aW9uTWFuYWdlci5zZXRDaGVja3BvaW50KCdkaWQtc2VsZWN0JylcbiAgICBpZiBAb2NjdXJyZW5jZVxuICAgICAgIyBUbyByZXBvZWF0KGAuYCkgb3BlcmF0aW9uIHdoZXJlIG11bHRpcGxlIG9jY3VycmVuY2UgcGF0dGVybnMgd2FzIHNldC5cbiAgICAgICMgSGVyZSB3ZSBzYXZlIHBhdHRlcm5zIHdoaWNoIHJlcHJlc2VudCB1bmlvbmVkIHJlZ2V4IHdoaWNoIEBvY2N1cnJlbmNlTWFuYWdlciBrbm93cy5cbiAgICAgIEBwYXR0ZXJuRm9yT2NjdXJyZW5jZSA/PSBAb2NjdXJyZW5jZU1hbmFnZXIuYnVpbGRQYXR0ZXJuKClcblxuICAgICAgaWYgQG9jY3VycmVuY2VNYW5hZ2VyLnNlbGVjdCgpXG4gICAgICAgIEBvY2N1cnJlbmNlU2VsZWN0ZWQgPSB0cnVlXG4gICAgICAgIEBtdXRhdGlvbk1hbmFnZXIuc2V0Q2hlY2twb2ludCgnZGlkLXNlbGVjdC1vY2N1cnJlbmNlJylcblxuICAgIGlmIEB0YXJnZXRTZWxlY3RlZCA9IGhhdmVTb21lTm9uRW1wdHlTZWxlY3Rpb24oQGVkaXRvcikgb3IgQHRhcmdldC5uYW1lIGlzIFwiRW1wdHlcIlxuICAgICAgQGVtaXREaWRTZWxlY3RUYXJnZXQoKVxuICAgICAgQGZsYXNoQ2hhbmdlSWZOZWNlc3NhcnkoKVxuICAgICAgQHRyYWNrQ2hhbmdlSWZOZWNlc3NhcnkoKVxuICAgIGVsc2VcbiAgICAgIEBlbWl0RGlkRmFpbFNlbGVjdFRhcmdldCgpXG4gICAgcmV0dXJuIEB0YXJnZXRTZWxlY3RlZFxuXG4gIHJlc3RvcmVDdXJzb3JQb3NpdGlvbnNJZk5lY2Vzc2FyeTogLT5cbiAgICByZXR1cm4gdW5sZXNzIEByZXN0b3JlUG9zaXRpb25zXG4gICAgc3RheSA9IEBzdGF5QXRTYW1lUG9zaXRpb24gPyBAZ2V0Q29uZmlnKEBzdGF5T3B0aW9uTmFtZSkgb3IgKEBvY2N1cnJlbmNlU2VsZWN0ZWQgYW5kIEBnZXRDb25maWcoJ3N0YXlPbk9jY3VycmVuY2UnKSlcbiAgICB3aXNlID0gaWYgQG9jY3VycmVuY2VTZWxlY3RlZCB0aGVuICdjaGFyYWN0ZXJ3aXNlJyBlbHNlIEB0YXJnZXQud2lzZVxuICAgIEBtdXRhdGlvbk1hbmFnZXIucmVzdG9yZUN1cnNvclBvc2l0aW9ucyh7c3RheSwgd2lzZSwgQHNldFRvRmlyc3RDaGFyYWN0ZXJPbkxpbmV3aXNlfSlcblxuIyBTZWxlY3RcbiMgV2hlbiB0ZXh0LW9iamVjdCBpcyBpbnZva2VkIGZyb20gbm9ybWFsIG9yIHZpdXNhbC1tb2RlLCBvcGVyYXRpb24gd291bGQgYmVcbiMgID0+IFNlbGVjdCBvcGVyYXRvciB3aXRoIHRhcmdldD10ZXh0LW9iamVjdFxuIyBXaGVuIG1vdGlvbiBpcyBpbnZva2VkIGZyb20gdmlzdWFsLW1vZGUsIG9wZXJhdGlvbiB3b3VsZCBiZVxuIyAgPT4gU2VsZWN0IG9wZXJhdG9yIHdpdGggdGFyZ2V0PW1vdGlvbilcbiMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiMgU2VsZWN0IGlzIHVzZWQgaW4gVFdPIHNpdHVhdGlvbi5cbiMgLSB2aXN1YWwtbW9kZSBvcGVyYXRpb25cbiMgICAtIGUuZzogYHYgbGAsIGBWIGpgLCBgdiBpIHBgLi4uXG4jIC0gRGlyZWN0bHkgaW52b2tlIHRleHQtb2JqZWN0IGZyb20gbm9ybWFsLW1vZGVcbiMgICAtIGUuZzogSW52b2tlIGBJbm5lciBQYXJhZ3JhcGhgIGZyb20gY29tbWFuZC1wYWxldHRlLlxuY2xhc3MgU2VsZWN0IGV4dGVuZHMgT3BlcmF0b3JcbiAgQGV4dGVuZChmYWxzZSlcbiAgZmxhc2hUYXJnZXQ6IGZhbHNlXG4gIHJlY29yZGFibGU6IGZhbHNlXG4gIGFjY2VwdFByZXNldE9jY3VycmVuY2U6IGZhbHNlXG4gIGFjY2VwdFBlcnNpc3RlbnRTZWxlY3Rpb246IGZhbHNlXG5cbiAgZXhlY3V0ZTogLT5cbiAgICBAc3RhcnRNdXRhdGlvbihAc2VsZWN0VGFyZ2V0LmJpbmQodGhpcykpXG5cbiAgICBpZiBAdGFyZ2V0LmlzVGV4dE9iamVjdCgpIGFuZCBAdGFyZ2V0LnNlbGVjdFN1Y2NlZWRlZFxuICAgICAgQGVkaXRvci5zY3JvbGxUb0N1cnNvclBvc2l0aW9uKClcbiAgICAgIEBhY3RpdmF0ZU1vZGVJZk5lY2Vzc2FyeSgndmlzdWFsJywgQHRhcmdldC53aXNlKVxuXG5jbGFzcyBTZWxlY3RMYXRlc3RDaGFuZ2UgZXh0ZW5kcyBTZWxlY3RcbiAgQGV4dGVuZCgpXG4gIEBkZXNjcmlwdGlvbjogXCJTZWxlY3QgbGF0ZXN0IHlhbmtlZCBvciBjaGFuZ2VkIHJhbmdlXCJcbiAgdGFyZ2V0OiAnQUxhdGVzdENoYW5nZSdcblxuY2xhc3MgU2VsZWN0UHJldmlvdXNTZWxlY3Rpb24gZXh0ZW5kcyBTZWxlY3RcbiAgQGV4dGVuZCgpXG4gIHRhcmdldDogXCJQcmV2aW91c1NlbGVjdGlvblwiXG5cbmNsYXNzIFNlbGVjdFBlcnNpc3RlbnRTZWxlY3Rpb24gZXh0ZW5kcyBTZWxlY3RcbiAgQGV4dGVuZCgpXG4gIEBkZXNjcmlwdGlvbjogXCJTZWxlY3QgcGVyc2lzdGVudC1zZWxlY3Rpb24gYW5kIGNsZWFyIGFsbCBwZXJzaXN0ZW50LXNlbGVjdGlvbiwgaXQncyBsaWtlIGNvbnZlcnQgdG8gcmVhbC1zZWxlY3Rpb25cIlxuICB0YXJnZXQ6IFwiQVBlcnNpc3RlbnRTZWxlY3Rpb25cIlxuXG5jbGFzcyBTZWxlY3RPY2N1cnJlbmNlIGV4dGVuZHMgT3BlcmF0b3JcbiAgQGV4dGVuZCgpXG4gIEBkZXNjcmlwdGlvbjogXCJBZGQgc2VsZWN0aW9uIG9udG8gZWFjaCBtYXRjaGluZyB3b3JkIHdpdGhpbiB0YXJnZXQgcmFuZ2VcIlxuICBvY2N1cnJlbmNlOiB0cnVlXG5cbiAgZXhlY3V0ZTogLT5cbiAgICBAc3RhcnRNdXRhdGlvbiA9PlxuICAgICAgaWYgQHNlbGVjdFRhcmdldCgpXG4gICAgICAgIEBhY3RpdmF0ZU1vZGVJZk5lY2Vzc2FyeSgndmlzdWFsJywgJ2NoYXJhY3Rlcndpc2UnKVxuXG4jIFBlcnNpc3RlbnQgU2VsZWN0aW9uXG4jID09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIENyZWF0ZVBlcnNpc3RlbnRTZWxlY3Rpb24gZXh0ZW5kcyBPcGVyYXRvclxuICBAZXh0ZW5kKClcbiAgZmxhc2hUYXJnZXQ6IGZhbHNlXG4gIHN0YXlBdFNhbWVQb3NpdGlvbjogdHJ1ZVxuICBhY2NlcHRQcmVzZXRPY2N1cnJlbmNlOiBmYWxzZVxuICBhY2NlcHRQZXJzaXN0ZW50U2VsZWN0aW9uOiBmYWxzZVxuXG4gIG11dGF0ZVNlbGVjdGlvbjogKHNlbGVjdGlvbikgLT5cbiAgICBAcGVyc2lzdGVudFNlbGVjdGlvbi5tYXJrQnVmZmVyUmFuZ2Uoc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKCkpXG5cbmNsYXNzIFRvZ2dsZVBlcnNpc3RlbnRTZWxlY3Rpb24gZXh0ZW5kcyBDcmVhdGVQZXJzaXN0ZW50U2VsZWN0aW9uXG4gIEBleHRlbmQoKVxuXG4gIGlzQ29tcGxldGU6IC0+XG4gICAgcG9pbnQgPSBAZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKClcbiAgICBAbWFya2VyVG9SZW1vdmUgPSBAcGVyc2lzdGVudFNlbGVjdGlvbi5nZXRNYXJrZXJBdFBvaW50KHBvaW50KVxuICAgIGlmIEBtYXJrZXJUb1JlbW92ZVxuICAgICAgdHJ1ZVxuICAgIGVsc2VcbiAgICAgIHN1cGVyXG5cbiAgZXhlY3V0ZTogLT5cbiAgICBpZiBAbWFya2VyVG9SZW1vdmVcbiAgICAgIEBtYXJrZXJUb1JlbW92ZS5kZXN0cm95KClcbiAgICBlbHNlXG4gICAgICBzdXBlclxuXG4jIFByZXNldCBPY2N1cnJlbmNlXG4jID09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIFRvZ2dsZVByZXNldE9jY3VycmVuY2UgZXh0ZW5kcyBPcGVyYXRvclxuICBAZXh0ZW5kKClcbiAgdGFyZ2V0OiBcIkVtcHR5XCJcbiAgZmxhc2hUYXJnZXQ6IGZhbHNlXG4gIGFjY2VwdFByZXNldE9jY3VycmVuY2U6IGZhbHNlXG4gIGFjY2VwdFBlcnNpc3RlbnRTZWxlY3Rpb246IGZhbHNlXG4gIG9jY3VycmVuY2VUeXBlOiAnYmFzZSdcblxuICBleGVjdXRlOiAtPlxuICAgIGlmIG1hcmtlciA9IEBvY2N1cnJlbmNlTWFuYWdlci5nZXRNYXJrZXJBdFBvaW50KEBlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKSlcbiAgICAgIEBvY2N1cnJlbmNlTWFuYWdlci5kZXN0cm95TWFya2VycyhbbWFya2VyXSlcbiAgICBlbHNlXG4gICAgICBwYXR0ZXJuID0gbnVsbFxuICAgICAgaXNOYXJyb3dlZCA9IEB2aW1TdGF0ZS5tb2RlTWFuYWdlci5pc05hcnJvd2VkKClcblxuICAgICAgaWYgQG1vZGUgaXMgJ3Zpc3VhbCcgYW5kIG5vdCBpc05hcnJvd2VkXG4gICAgICAgIEBvY2N1cnJlbmNlVHlwZSA9ICdiYXNlJ1xuICAgICAgICBwYXR0ZXJuID0gbmV3IFJlZ0V4cChfLmVzY2FwZVJlZ0V4cChAZWRpdG9yLmdldFNlbGVjdGVkVGV4dCgpKSwgJ2cnKVxuICAgICAgZWxzZVxuICAgICAgICBwYXR0ZXJuID0gQGdldFBhdHRlcm5Gb3JPY2N1cnJlbmNlVHlwZShAb2NjdXJyZW5jZVR5cGUpXG5cbiAgICAgIEBvY2N1cnJlbmNlTWFuYWdlci5hZGRQYXR0ZXJuKHBhdHRlcm4sIHtAb2NjdXJyZW5jZVR5cGV9KVxuICAgICAgQG9jY3VycmVuY2VNYW5hZ2VyLnNhdmVMYXN0UGF0dGVybihAb2NjdXJyZW5jZVR5cGUpXG5cbiAgICAgIEBhY3RpdmF0ZU1vZGUoJ25vcm1hbCcpIHVubGVzcyBpc05hcnJvd2VkXG5cbmNsYXNzIFRvZ2dsZVByZXNldFN1YndvcmRPY2N1cnJlbmNlIGV4dGVuZHMgVG9nZ2xlUHJlc2V0T2NjdXJyZW5jZVxuICBAZXh0ZW5kKClcbiAgb2NjdXJyZW5jZVR5cGU6ICdzdWJ3b3JkJ1xuXG4jIFdhbnQgdG8gcmVuYW1lIFJlc3RvcmVPY2N1cnJlbmNlTWFya2VyXG5jbGFzcyBBZGRQcmVzZXRPY2N1cnJlbmNlRnJvbUxhc3RPY2N1cnJlbmNlUGF0dGVybiBleHRlbmRzIFRvZ2dsZVByZXNldE9jY3VycmVuY2VcbiAgQGV4dGVuZCgpXG4gIGV4ZWN1dGU6IC0+XG4gICAgQG9jY3VycmVuY2VNYW5hZ2VyLnJlc2V0UGF0dGVybnMoKVxuICAgIGlmIHBhdHRlcm4gPSBAdmltU3RhdGUuZ2xvYmFsU3RhdGUuZ2V0KCdsYXN0T2NjdXJyZW5jZVBhdHRlcm4nKVxuICAgICAgb2NjdXJyZW5jZVR5cGUgPSBAdmltU3RhdGUuZ2xvYmFsU3RhdGUuZ2V0KFwibGFzdE9jY3VycmVuY2VUeXBlXCIpXG4gICAgICBAb2NjdXJyZW5jZU1hbmFnZXIuYWRkUGF0dGVybihwYXR0ZXJuLCB7b2NjdXJyZW5jZVR5cGV9KVxuICAgICAgQGFjdGl2YXRlTW9kZSgnbm9ybWFsJylcblxuIyBEZWxldGVcbiMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIERlbGV0ZSBleHRlbmRzIE9wZXJhdG9yXG4gIEBleHRlbmQoKVxuICB0cmFja0NoYW5nZTogdHJ1ZVxuICBmbGFzaENoZWNrcG9pbnQ6ICdkaWQtc2VsZWN0LW9jY3VycmVuY2UnXG4gIGZsYXNoVHlwZUZvck9jY3VycmVuY2U6ICdvcGVyYXRvci1yZW1vdmUtb2NjdXJyZW5jZSdcbiAgc3RheU9wdGlvbk5hbWU6ICdzdGF5T25EZWxldGUnXG4gIHNldFRvRmlyc3RDaGFyYWN0ZXJPbkxpbmV3aXNlOiB0cnVlXG5cbiAgZXhlY3V0ZTogLT5cbiAgICBpZiBAdGFyZ2V0Lndpc2UgaXMgJ2Jsb2Nrd2lzZSdcbiAgICAgIEByZXN0b3JlUG9zaXRpb25zID0gZmFsc2VcbiAgICBzdXBlclxuXG4gIG11dGF0ZVNlbGVjdGlvbjogKHNlbGVjdGlvbikgPT5cbiAgICBAc2V0VGV4dFRvUmVnaXN0ZXJGb3JTZWxlY3Rpb24oc2VsZWN0aW9uKVxuICAgIHNlbGVjdGlvbi5kZWxldGVTZWxlY3RlZFRleHQoKVxuXG5jbGFzcyBEZWxldGVSaWdodCBleHRlbmRzIERlbGV0ZVxuICBAZXh0ZW5kKClcbiAgdGFyZ2V0OiAnTW92ZVJpZ2h0J1xuXG5jbGFzcyBEZWxldGVMZWZ0IGV4dGVuZHMgRGVsZXRlXG4gIEBleHRlbmQoKVxuICB0YXJnZXQ6ICdNb3ZlTGVmdCdcblxuY2xhc3MgRGVsZXRlVG9MYXN0Q2hhcmFjdGVyT2ZMaW5lIGV4dGVuZHMgRGVsZXRlXG4gIEBleHRlbmQoKVxuICB0YXJnZXQ6ICdNb3ZlVG9MYXN0Q2hhcmFjdGVyT2ZMaW5lJ1xuXG4gIGV4ZWN1dGU6IC0+XG4gICAgaWYgQHRhcmdldC53aXNlIGlzICdibG9ja3dpc2UnXG4gICAgICBAb25EaWRTZWxlY3RUYXJnZXQgPT5cbiAgICAgICAgZm9yIGJsb2Nrd2lzZVNlbGVjdGlvbiBpbiBAZ2V0QmxvY2t3aXNlU2VsZWN0aW9ucygpXG4gICAgICAgICAgYmxvY2t3aXNlU2VsZWN0aW9uLmV4dGVuZE1lbWJlclNlbGVjdGlvbnNUb0VuZE9mTGluZSgpXG4gICAgc3VwZXJcblxuY2xhc3MgRGVsZXRlTGluZSBleHRlbmRzIERlbGV0ZVxuICBAZXh0ZW5kKClcbiAgd2lzZTogJ2xpbmV3aXNlJ1xuICB0YXJnZXQ6IFwiTW92ZVRvUmVsYXRpdmVMaW5lXCJcblxuIyBZYW5rXG4jID09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIFlhbmsgZXh0ZW5kcyBPcGVyYXRvclxuICBAZXh0ZW5kKClcbiAgdHJhY2tDaGFuZ2U6IHRydWVcbiAgc3RheU9wdGlvbk5hbWU6ICdzdGF5T25ZYW5rJ1xuXG4gIG11dGF0ZVNlbGVjdGlvbjogKHNlbGVjdGlvbikgLT5cbiAgICBAc2V0VGV4dFRvUmVnaXN0ZXJGb3JTZWxlY3Rpb24oc2VsZWN0aW9uKVxuXG5jbGFzcyBZYW5rTGluZSBleHRlbmRzIFlhbmtcbiAgQGV4dGVuZCgpXG4gIHdpc2U6ICdsaW5ld2lzZSdcbiAgdGFyZ2V0OiBcIk1vdmVUb1JlbGF0aXZlTGluZVwiXG5cbmNsYXNzIFlhbmtUb0xhc3RDaGFyYWN0ZXJPZkxpbmUgZXh0ZW5kcyBZYW5rXG4gIEBleHRlbmQoKVxuICB0YXJnZXQ6ICdNb3ZlVG9MYXN0Q2hhcmFjdGVyT2ZMaW5lJ1xuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgW2N0cmwtYV1cbmNsYXNzIEluY3JlYXNlIGV4dGVuZHMgT3BlcmF0b3JcbiAgQGV4dGVuZCgpXG4gIHRhcmdldDogXCJFbXB0eVwiICMgY3RybC1hIGluIG5vcm1hbC1tb2RlIGZpbmQgdGFyZ2V0IG51bWJlciBpbiBjdXJyZW50IGxpbmUgbWFudWFsbHlcbiAgZmxhc2hUYXJnZXQ6IGZhbHNlICMgZG8gbWFudWFsbHlcbiAgcmVzdG9yZVBvc2l0aW9uczogZmFsc2UgIyBkbyBtYW51YWxseVxuICBzdGVwOiAxXG5cbiAgZXhlY3V0ZTogLT5cbiAgICBAbmV3UmFuZ2VzID0gW11cbiAgICBzdXBlclxuICAgIGlmIEBuZXdSYW5nZXMubGVuZ3RoXG4gICAgICBpZiBAZ2V0Q29uZmlnKCdmbGFzaE9uT3BlcmF0ZScpIGFuZCBAbmFtZSBub3QgaW4gQGdldENvbmZpZygnZmxhc2hPbk9wZXJhdGVCbGFja2xpc3QnKVxuICAgICAgICBAdmltU3RhdGUuZmxhc2goQG5ld1JhbmdlcywgdHlwZTogQGZsYXNoVHlwZUZvck9jY3VycmVuY2UpXG5cbiAgcmVwbGFjZU51bWJlckluQnVmZmVyUmFuZ2U6IChzY2FuUmFuZ2UsIGZuPW51bGwpIC0+XG4gICAgbmV3UmFuZ2VzID0gW11cbiAgICBAcGF0dGVybiA/PSAvLy8je0BnZXRDb25maWcoJ251bWJlclJlZ2V4Jyl9Ly8vZ1xuICAgIEBzY2FuRm9yd2FyZCBAcGF0dGVybiwge3NjYW5SYW5nZX0sIChldmVudCkgPT5cbiAgICAgIHJldHVybiBpZiBmbj8gYW5kIG5vdCBmbihldmVudClcbiAgICAgIHttYXRjaFRleHQsIHJlcGxhY2V9ID0gZXZlbnRcbiAgICAgIG5leHROdW1iZXIgPSBAZ2V0TmV4dE51bWJlcihtYXRjaFRleHQpXG4gICAgICBuZXdSYW5nZXMucHVzaChyZXBsYWNlKFN0cmluZyhuZXh0TnVtYmVyKSkpXG4gICAgbmV3UmFuZ2VzXG5cbiAgbXV0YXRlU2VsZWN0aW9uOiAoc2VsZWN0aW9uKSAtPlxuICAgIHtjdXJzb3J9ID0gc2VsZWN0aW9uXG4gICAgaWYgQHRhcmdldC5pcygnRW1wdHknKSAjIGN0cmwtYSwgY3RybC14IGluIGBub3JtYWwtbW9kZWBcbiAgICAgIGN1cnNvclBvc2l0aW9uID0gY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKClcbiAgICAgIHNjYW5SYW5nZSA9IEBlZGl0b3IuYnVmZmVyUmFuZ2VGb3JCdWZmZXJSb3coY3Vyc29yUG9zaXRpb24ucm93KVxuICAgICAgbmV3UmFuZ2VzID0gQHJlcGxhY2VOdW1iZXJJbkJ1ZmZlclJhbmdlIHNjYW5SYW5nZSwgKHtyYW5nZSwgc3RvcH0pIC0+XG4gICAgICAgIGlmIHJhbmdlLmVuZC5pc0dyZWF0ZXJUaGFuKGN1cnNvclBvc2l0aW9uKVxuICAgICAgICAgIHN0b3AoKVxuICAgICAgICAgIHRydWVcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGZhbHNlXG5cbiAgICAgIHBvaW50ID0gbmV3UmFuZ2VzWzBdPy5lbmQudHJhbnNsYXRlKFswLCAtMV0pID8gY3Vyc29yUG9zaXRpb25cbiAgICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihwb2ludClcbiAgICBlbHNlXG4gICAgICBzY2FuUmFuZ2UgPSBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKVxuICAgICAgQG5ld1Jhbmdlcy5wdXNoKEByZXBsYWNlTnVtYmVySW5CdWZmZXJSYW5nZShzY2FuUmFuZ2UpLi4uKVxuICAgICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHNjYW5SYW5nZS5zdGFydClcblxuICBnZXROZXh0TnVtYmVyOiAobnVtYmVyU3RyaW5nKSAtPlxuICAgIE51bWJlci5wYXJzZUludChudW1iZXJTdHJpbmcsIDEwKSArIEBzdGVwICogQGdldENvdW50KClcblxuIyBbY3RybC14XVxuY2xhc3MgRGVjcmVhc2UgZXh0ZW5kcyBJbmNyZWFzZVxuICBAZXh0ZW5kKClcbiAgc3RlcDogLTFcblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIFtnIGN0cmwtYV1cbmNsYXNzIEluY3JlbWVudE51bWJlciBleHRlbmRzIEluY3JlYXNlXG4gIEBleHRlbmQoKVxuICBiYXNlTnVtYmVyOiBudWxsXG4gIHRhcmdldDogbnVsbFxuICBtdXRhdGVTZWxlY3Rpb25PcmRlcmQ6IHRydWVcblxuICBnZXROZXh0TnVtYmVyOiAobnVtYmVyU3RyaW5nKSAtPlxuICAgIGlmIEBiYXNlTnVtYmVyP1xuICAgICAgQGJhc2VOdW1iZXIgKz0gQHN0ZXAgKiBAZ2V0Q291bnQoKVxuICAgIGVsc2VcbiAgICAgIEBiYXNlTnVtYmVyID0gTnVtYmVyLnBhcnNlSW50KG51bWJlclN0cmluZywgMTApXG4gICAgQGJhc2VOdW1iZXJcblxuIyBbZyBjdHJsLXhdXG5jbGFzcyBEZWNyZW1lbnROdW1iZXIgZXh0ZW5kcyBJbmNyZW1lbnROdW1iZXJcbiAgQGV4dGVuZCgpXG4gIHN0ZXA6IC0xXG5cbiMgUHV0XG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgQ3Vyc29yIHBsYWNlbWVudDpcbiMgLSBwbGFjZSBhdCBlbmQgb2YgbXV0YXRpb246IHBhc3RlIG5vbi1tdWx0aWxpbmUgY2hhcmFjdGVyd2lzZSB0ZXh0XG4jIC0gcGxhY2UgYXQgc3RhcnQgb2YgbXV0YXRpb246IG5vbi1tdWx0aWxpbmUgY2hhcmFjdGVyd2lzZSB0ZXh0KGNoYXJhY3Rlcndpc2UsIGxpbmV3aXNlKVxuY2xhc3MgUHV0QmVmb3JlIGV4dGVuZHMgT3BlcmF0b3JcbiAgQGV4dGVuZCgpXG4gIGxvY2F0aW9uOiAnYmVmb3JlJ1xuICB0YXJnZXQ6ICdFbXB0eSdcbiAgZmxhc2hUeXBlOiAnb3BlcmF0b3ItbG9uZydcbiAgcmVzdG9yZVBvc2l0aW9uczogZmFsc2UgIyBtYW5hZ2UgbWFudWFsbHlcbiAgZmxhc2hUYXJnZXQ6IHRydWUgIyBtYW5hZ2UgbWFudWFsbHlcbiAgdHJhY2tDaGFuZ2U6IGZhbHNlICMgbWFuYWdlIG1hbnVhbGx5XG5cbiAgZXhlY3V0ZTogLT5cbiAgICBAbXV0YXRpb25zQnlTZWxlY3Rpb24gPSBuZXcgTWFwKClcbiAgICB7dGV4dCwgdHlwZX0gPSBAdmltU3RhdGUucmVnaXN0ZXIuZ2V0KG51bGwsIEBlZGl0b3IuZ2V0TGFzdFNlbGVjdGlvbigpKVxuICAgIHJldHVybiB1bmxlc3MgdGV4dFxuICAgIEBvbkRpZEZpbmlzaE11dGF0aW9uKEBhZGp1c3RDdXJzb3JQb3NpdGlvbi5iaW5kKHRoaXMpKVxuXG4gICAgQG9uRGlkRmluaXNoT3BlcmF0aW9uID0+XG4gICAgICAjIFRyYWNrQ2hhbmdlXG4gICAgICBpZiBuZXdSYW5nZSA9IEBtdXRhdGlvbnNCeVNlbGVjdGlvbi5nZXQoQGVkaXRvci5nZXRMYXN0U2VsZWN0aW9uKCkpXG4gICAgICAgIEBzZXRNYXJrRm9yQ2hhbmdlKG5ld1JhbmdlKVxuXG4gICAgICAjIEZsYXNoXG4gICAgICBpZiBAZ2V0Q29uZmlnKCdmbGFzaE9uT3BlcmF0ZScpIGFuZCBAbmFtZSBub3QgaW4gQGdldENvbmZpZygnZmxhc2hPbk9wZXJhdGVCbGFja2xpc3QnKVxuICAgICAgICB0b1JhbmdlID0gKHNlbGVjdGlvbikgPT4gQG11dGF0aW9uc0J5U2VsZWN0aW9uLmdldChzZWxlY3Rpb24pXG4gICAgICAgIEB2aW1TdGF0ZS5mbGFzaChAZWRpdG9yLmdldFNlbGVjdGlvbnMoKS5tYXAodG9SYW5nZSksIHR5cGU6IEBnZXRGbGFzaFR5cGUoKSlcblxuICAgIHN1cGVyXG5cbiAgYWRqdXN0Q3Vyc29yUG9zaXRpb246IC0+XG4gICAgZm9yIHNlbGVjdGlvbiBpbiBAZWRpdG9yLmdldFNlbGVjdGlvbnMoKVxuICAgICAge2N1cnNvcn0gPSBzZWxlY3Rpb25cbiAgICAgIHtzdGFydCwgZW5kfSA9IG5ld1JhbmdlID0gQG11dGF0aW9uc0J5U2VsZWN0aW9uLmdldChzZWxlY3Rpb24pXG4gICAgICBpZiBAbGluZXdpc2VQYXN0ZVxuICAgICAgICBtb3ZlQ3Vyc29yVG9GaXJzdENoYXJhY3RlckF0Um93KGN1cnNvciwgc3RhcnQucm93KVxuICAgICAgZWxzZVxuICAgICAgICBpZiBuZXdSYW5nZS5pc1NpbmdsZUxpbmUoKVxuICAgICAgICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihlbmQudHJhbnNsYXRlKFswLCAtMV0pKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHN0YXJ0KVxuXG4gIG11dGF0ZVNlbGVjdGlvbjogKHNlbGVjdGlvbikgLT5cbiAgICB7dGV4dCwgdHlwZX0gPSBAdmltU3RhdGUucmVnaXN0ZXIuZ2V0KG51bGwsIHNlbGVjdGlvbilcbiAgICB0ZXh0ID0gXy5tdWx0aXBseVN0cmluZyh0ZXh0LCBAZ2V0Q291bnQoKSlcbiAgICBAbGluZXdpc2VQYXN0ZSA9IHR5cGUgaXMgJ2xpbmV3aXNlJyBvciBAaXNNb2RlKCd2aXN1YWwnLCAnbGluZXdpc2UnKVxuICAgIG5ld1JhbmdlID0gQHBhc3RlKHNlbGVjdGlvbiwgdGV4dCwge0BsaW5ld2lzZVBhc3RlfSlcbiAgICBAbXV0YXRpb25zQnlTZWxlY3Rpb24uc2V0KHNlbGVjdGlvbiwgbmV3UmFuZ2UpXG5cbiAgcGFzdGU6IChzZWxlY3Rpb24sIHRleHQsIHtsaW5ld2lzZVBhc3RlfSkgLT5cbiAgICBpZiBsaW5ld2lzZVBhc3RlXG4gICAgICBAcGFzdGVMaW5ld2lzZShzZWxlY3Rpb24sIHRleHQpXG4gICAgZWxzZVxuICAgICAgQHBhc3RlQ2hhcmFjdGVyd2lzZShzZWxlY3Rpb24sIHRleHQpXG5cbiAgcGFzdGVDaGFyYWN0ZXJ3aXNlOiAoc2VsZWN0aW9uLCB0ZXh0KSAtPlxuICAgIHtjdXJzb3J9ID0gc2VsZWN0aW9uXG4gICAgaWYgc2VsZWN0aW9uLmlzRW1wdHkoKSBhbmQgQGxvY2F0aW9uIGlzICdhZnRlcicgYW5kIG5vdCBpc0VtcHR5Um93KEBlZGl0b3IsIGN1cnNvci5nZXRCdWZmZXJSb3coKSlcbiAgICAgIGN1cnNvci5tb3ZlUmlnaHQoKVxuICAgIHJldHVybiBzZWxlY3Rpb24uaW5zZXJ0VGV4dCh0ZXh0KVxuXG4gICMgUmV0dXJuIG5ld1JhbmdlXG4gIHBhc3RlTGluZXdpc2U6IChzZWxlY3Rpb24sIHRleHQpIC0+XG4gICAge2N1cnNvcn0gPSBzZWxlY3Rpb25cbiAgICBjdXJzb3JSb3cgPSBjdXJzb3IuZ2V0QnVmZmVyUm93KClcbiAgICB0ZXh0ICs9IFwiXFxuXCIgdW5sZXNzIHRleHQuZW5kc1dpdGgoXCJcXG5cIilcbiAgICBuZXdSYW5nZSA9IG51bGxcbiAgICBpZiBzZWxlY3Rpb24uaXNFbXB0eSgpXG4gICAgICBpZiBAbG9jYXRpb24gaXMgJ2JlZm9yZSdcbiAgICAgICAgbmV3UmFuZ2UgPSBpbnNlcnRUZXh0QXRCdWZmZXJQb3NpdGlvbihAZWRpdG9yLCBbY3Vyc29yUm93LCAwXSwgdGV4dClcbiAgICAgICAgc2V0QnVmZmVyUm93KGN1cnNvciwgbmV3UmFuZ2Uuc3RhcnQucm93KVxuICAgICAgZWxzZSBpZiBAbG9jYXRpb24gaXMgJ2FmdGVyJ1xuICAgICAgICBlbnN1cmVFbmRzV2l0aE5ld0xpbmVGb3JCdWZmZXJSb3coQGVkaXRvciwgY3Vyc29yUm93KVxuICAgICAgICBuZXdSYW5nZSA9IGluc2VydFRleHRBdEJ1ZmZlclBvc2l0aW9uKEBlZGl0b3IsIFtjdXJzb3JSb3cgKyAxLCAwXSwgdGV4dClcbiAgICBlbHNlXG4gICAgICBzZWxlY3Rpb24uaW5zZXJ0VGV4dChcIlxcblwiKSB1bmxlc3MgQGlzTW9kZSgndmlzdWFsJywgJ2xpbmV3aXNlJylcbiAgICAgIG5ld1JhbmdlID0gc2VsZWN0aW9uLmluc2VydFRleHQodGV4dClcblxuICAgIHJldHVybiBuZXdSYW5nZVxuXG5jbGFzcyBQdXRBZnRlciBleHRlbmRzIFB1dEJlZm9yZVxuICBAZXh0ZW5kKClcbiAgbG9jYXRpb246ICdhZnRlcidcblxuY2xhc3MgUHV0QmVmb3JlV2l0aEF1dG9JbmRlbnQgZXh0ZW5kcyBQdXRCZWZvcmVcbiAgQGV4dGVuZCgpXG5cbiAgcGFzdGVMaW5ld2lzZTogKHNlbGVjdGlvbiwgdGV4dCkgLT5cbiAgICBuZXdSYW5nZSA9IHN1cGVyXG4gICAgYWRqdXN0SW5kZW50V2l0aEtlZXBpbmdMYXlvdXQoQGVkaXRvciwgbmV3UmFuZ2UpXG4gICAgcmV0dXJuIG5ld1JhbmdlXG5cbmNsYXNzIFB1dEFmdGVyV2l0aEF1dG9JbmRlbnQgZXh0ZW5kcyBQdXRCZWZvcmVXaXRoQXV0b0luZGVudFxuICBAZXh0ZW5kKClcbiAgbG9jYXRpb246ICdhZnRlcidcblxuY2xhc3MgQWRkQmxhbmtMaW5lQmVsb3cgZXh0ZW5kcyBPcGVyYXRvclxuICBAZXh0ZW5kKClcbiAgZmxhc2hUYXJnZXQ6IGZhbHNlXG4gIHRhcmdldDogXCJFbXB0eVwiXG4gIHN0YXlBdFNhbWVQb3NpdGlvbjogdHJ1ZVxuICBzdGF5QnlNYXJrZXI6IHRydWVcbiAgd2hlcmU6ICdiZWxvdydcblxuICBtdXRhdGVTZWxlY3Rpb246IChzZWxlY3Rpb24pIC0+XG4gICAgcm93ID0gc2VsZWN0aW9uLmdldEhlYWRCdWZmZXJQb3NpdGlvbigpLnJvd1xuICAgIHJvdyArPSAxIGlmIEB3aGVyZSBpcyAnYmVsb3cnXG4gICAgcG9pbnQgPSBbcm93LCAwXVxuICAgIEBlZGl0b3Iuc2V0VGV4dEluQnVmZmVyUmFuZ2UoW3BvaW50LCBwb2ludF0sIFwiXFxuXCIucmVwZWF0KEBnZXRDb3VudCgpKSlcblxuY2xhc3MgQWRkQmxhbmtMaW5lQWJvdmUgZXh0ZW5kcyBBZGRCbGFua0xpbmVCZWxvd1xuICBAZXh0ZW5kKClcbiAgd2hlcmU6ICdhYm92ZSdcbiJdfQ==
