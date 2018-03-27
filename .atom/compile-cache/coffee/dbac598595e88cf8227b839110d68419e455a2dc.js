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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvb3BlcmF0b3IuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSxzd0JBQUE7SUFBQTs7Ozs7RUFBQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSOztFQUNKLE1BU0ksT0FBQSxDQUFRLFNBQVIsQ0FUSixFQUNFLDJCQURGLEVBRUUsbUVBRkYsRUFHRSx5RUFIRixFQUlFLDJEQUpGLEVBS0UsK0JBTEYsRUFNRSxxRUFORixFQU9FLHlFQVBGLEVBUUU7O0VBRUYsSUFBQSxHQUFPLE9BQUEsQ0FBUSxRQUFSOztFQUVEOzs7SUFDSixRQUFDLENBQUEsTUFBRCxDQUFRLEtBQVI7O0lBQ0EsUUFBQyxDQUFBLGFBQUQsR0FBZ0I7O3VCQUNoQixhQUFBLEdBQWU7O3VCQUNmLFVBQUEsR0FBWTs7dUJBRVosSUFBQSxHQUFNOzt1QkFDTixVQUFBLEdBQVk7O3VCQUNaLGNBQUEsR0FBZ0I7O3VCQUVoQixXQUFBLEdBQWE7O3VCQUNiLGVBQUEsR0FBaUI7O3VCQUNqQixTQUFBLEdBQVc7O3VCQUNYLHNCQUFBLEdBQXdCOzt1QkFDeEIsV0FBQSxHQUFhOzt1QkFFYixvQkFBQSxHQUFzQjs7dUJBQ3RCLGtCQUFBLEdBQW9COzt1QkFDcEIsY0FBQSxHQUFnQjs7dUJBQ2hCLFlBQUEsR0FBYzs7dUJBQ2QsZ0JBQUEsR0FBa0I7O3VCQUNsQiw2QkFBQSxHQUErQjs7dUJBRS9CLHNCQUFBLEdBQXdCOzt1QkFDeEIseUJBQUEsR0FBMkI7O3VCQUUzQix5QkFBQSxHQUEyQjs7dUJBQzNCLHFCQUFBLEdBQXVCOzt1QkFJdkIsa0JBQUEsR0FBb0I7O3VCQUNwQixjQUFBLEdBQWdCOzt1QkFDaEIsY0FBQSxHQUFnQixTQUFBO2FBQ2QsSUFBQyxDQUFBLGtCQUFELElBQXdCLENBQUksSUFBQyxDQUFBO0lB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OztnQ0FDZCxLQUFBLEdBQU87O2dDQUVQLGVBQUEsR0FBaUIsU0FBQyxTQUFEO0FBQ2YsVUFBQTtNQUFBLEdBQUEsR0FBTSxTQUFTLENBQUMscUJBQVYsQ0FBQSxDQUFpQyxDQUFDO01BQ3hDLElBQVksSUFBQyxDQUFBLEtBQUQsS0FBVSxPQUF0QjtRQUFBLEdBQUEsSUFBTyxFQUFQOztNQUNBLEtBQUEsR0FBUSxDQUFDLEdBQUQsRUFBTSxDQUFOO2FBQ1IsSUFBQyxDQUFBLE1BQU0sQ0FBQyxvQkFBUixDQUE2QixDQUFDLEtBQUQsRUFBUSxLQUFSLENBQTdCLEVBQTZDLElBQUksQ0FBQyxNQUFMLENBQVksSUFBQyxDQUFBLFFBQUQsQ0FBQSxDQUFaLENBQTdDO0lBSmU7Ozs7S0FSYTs7RUFjMUI7Ozs7Ozs7SUFDSixpQkFBQyxDQUFBLE1BQUQsQ0FBQTs7Z0NBQ0EsS0FBQSxHQUFPOzs7O0tBRnVCO0FBdG9CaEMiLCJzb3VyY2VzQ29udGVudCI6WyJfID0gcmVxdWlyZSAndW5kZXJzY29yZS1wbHVzJ1xue1xuICBpc0VtcHR5Um93XG4gIGdldFdvcmRQYXR0ZXJuQXRCdWZmZXJQb3NpdGlvblxuICBnZXRTdWJ3b3JkUGF0dGVybkF0QnVmZmVyUG9zaXRpb25cbiAgaW5zZXJ0VGV4dEF0QnVmZmVyUG9zaXRpb25cbiAgc2V0QnVmZmVyUm93XG4gIG1vdmVDdXJzb3JUb0ZpcnN0Q2hhcmFjdGVyQXRSb3dcbiAgZW5zdXJlRW5kc1dpdGhOZXdMaW5lRm9yQnVmZmVyUm93XG4gIGFkanVzdEluZGVudFdpdGhLZWVwaW5nTGF5b3V0XG59ID0gcmVxdWlyZSAnLi91dGlscydcbkJhc2UgPSByZXF1aXJlICcuL2Jhc2UnXG5cbmNsYXNzIE9wZXJhdG9yIGV4dGVuZHMgQmFzZVxuICBAZXh0ZW5kKGZhbHNlKVxuICBAb3BlcmF0aW9uS2luZDogJ29wZXJhdG9yJ1xuICByZXF1aXJlVGFyZ2V0OiB0cnVlXG4gIHJlY29yZGFibGU6IHRydWVcblxuICB3aXNlOiBudWxsXG4gIG9jY3VycmVuY2U6IGZhbHNlXG4gIG9jY3VycmVuY2VUeXBlOiAnYmFzZSdcblxuICBmbGFzaFRhcmdldDogdHJ1ZVxuICBmbGFzaENoZWNrcG9pbnQ6ICdkaWQtZmluaXNoJ1xuICBmbGFzaFR5cGU6ICdvcGVyYXRvcidcbiAgZmxhc2hUeXBlRm9yT2NjdXJyZW5jZTogJ29wZXJhdG9yLW9jY3VycmVuY2UnXG4gIHRyYWNrQ2hhbmdlOiBmYWxzZVxuXG4gIHBhdHRlcm5Gb3JPY2N1cnJlbmNlOiBudWxsXG4gIHN0YXlBdFNhbWVQb3NpdGlvbjogbnVsbFxuICBzdGF5T3B0aW9uTmFtZTogbnVsbFxuICBzdGF5QnlNYXJrZXI6IGZhbHNlXG4gIHJlc3RvcmVQb3NpdGlvbnM6IHRydWVcbiAgc2V0VG9GaXJzdENoYXJhY3Rlck9uTGluZXdpc2U6IGZhbHNlXG5cbiAgYWNjZXB0UHJlc2V0T2NjdXJyZW5jZTogdHJ1ZVxuICBhY2NlcHRQZXJzaXN0ZW50U2VsZWN0aW9uOiB0cnVlXG5cbiAgYnVmZmVyQ2hlY2twb2ludEJ5UHVycG9zZTogbnVsbFxuICBtdXRhdGVTZWxlY3Rpb25PcmRlcmQ6IGZhbHNlXG5cbiAgIyBFeHBlcmltZW50YWx5IGFsbG93IHNlbGVjdFRhcmdldCBiZWZvcmUgaW5wdXQgQ29tcGxldGVcbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIHN1cHBvcnRFYXJseVNlbGVjdDogZmFsc2VcbiAgdGFyZ2V0U2VsZWN0ZWQ6IG51bGxcbiAgY2FuRWFybHlTZWxlY3Q6IC0+XG4gICAgQHN1cHBvcnRFYXJseVNlbGVjdCBhbmQgbm90IEByZXBlYXRlZFxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAjIENhbGxlZCB3aGVuIG9wZXJhdGlvbiBmaW5pc2hlZFxuICAjIFRoaXMgaXMgZXNzZW50aWFsbHkgdG8gcmVzZXQgc3RhdGUgZm9yIGAuYCByZXBlYXQuXG4gIHJlc2V0U3RhdGU6IC0+XG4gICAgQHRhcmdldFNlbGVjdGVkID0gbnVsbFxuICAgIEBvY2N1cnJlbmNlU2VsZWN0ZWQgPSBmYWxzZVxuXG4gICMgVHdvIGNoZWNrcG9pbnQgZm9yIGRpZmZlcmVudCBwdXJwb3NlXG4gICMgLSBvbmUgZm9yIHVuZG8oaGFuZGxlZCBieSBtb2RlTWFuYWdlcilcbiAgIyAtIG9uZSBmb3IgcHJlc2VydmUgbGFzdCBpbnNlcnRlZCB0ZXh0XG4gIGNyZWF0ZUJ1ZmZlckNoZWNrcG9pbnQ6IChwdXJwb3NlKSAtPlxuICAgIEBidWZmZXJDaGVja3BvaW50QnlQdXJwb3NlID89IHt9XG4gICAgQGJ1ZmZlckNoZWNrcG9pbnRCeVB1cnBvc2VbcHVycG9zZV0gPSBAZWRpdG9yLmNyZWF0ZUNoZWNrcG9pbnQoKVxuXG4gIGdldEJ1ZmZlckNoZWNrcG9pbnQ6IChwdXJwb3NlKSAtPlxuICAgIEBidWZmZXJDaGVja3BvaW50QnlQdXJwb3NlP1twdXJwb3NlXVxuXG4gIGRlbGV0ZUJ1ZmZlckNoZWNrcG9pbnQ6IChwdXJwb3NlKSAtPlxuICAgIGlmIEBidWZmZXJDaGVja3BvaW50QnlQdXJwb3NlP1xuICAgICAgZGVsZXRlIEBidWZmZXJDaGVja3BvaW50QnlQdXJwb3NlW3B1cnBvc2VdXG5cbiAgZ3JvdXBDaGFuZ2VzU2luY2VCdWZmZXJDaGVja3BvaW50OiAocHVycG9zZSkgLT5cbiAgICBpZiBjaGVja3BvaW50ID0gQGdldEJ1ZmZlckNoZWNrcG9pbnQocHVycG9zZSlcbiAgICAgIEBlZGl0b3IuZ3JvdXBDaGFuZ2VzU2luY2VDaGVja3BvaW50KGNoZWNrcG9pbnQpXG4gICAgICBAZGVsZXRlQnVmZmVyQ2hlY2twb2ludChwdXJwb3NlKVxuXG4gIHNldE1hcmtGb3JDaGFuZ2U6IChyYW5nZSkgLT5cbiAgICBAdmltU3RhdGUubWFyay5zZXQoJ1snLCByYW5nZS5zdGFydClcbiAgICBAdmltU3RhdGUubWFyay5zZXQoJ10nLCByYW5nZS5lbmQpXG5cbiAgbmVlZEZsYXNoOiAtPlxuICAgIEBmbGFzaFRhcmdldCBhbmQgQGdldENvbmZpZygnZmxhc2hPbk9wZXJhdGUnKSBhbmRcbiAgICAgIChAbmFtZSBub3QgaW4gQGdldENvbmZpZygnZmxhc2hPbk9wZXJhdGVCbGFja2xpc3QnKSkgYW5kXG4gICAgICAoKEBtb2RlIGlzbnQgJ3Zpc3VhbCcpIG9yIChAc3VibW9kZSBpc250IEB0YXJnZXQud2lzZSkpICMgZS5nLiBZIGluIHZDXG5cbiAgZmxhc2hJZk5lY2Vzc2FyeTogKHJhbmdlcykgLT5cbiAgICBpZiBAbmVlZEZsYXNoKClcbiAgICAgIEB2aW1TdGF0ZS5mbGFzaChyYW5nZXMsIHR5cGU6IEBnZXRGbGFzaFR5cGUoKSlcblxuICBmbGFzaENoYW5nZUlmTmVjZXNzYXJ5OiAtPlxuICAgIGlmIEBuZWVkRmxhc2goKVxuICAgICAgQG9uRGlkRmluaXNoT3BlcmF0aW9uID0+XG4gICAgICAgIHJhbmdlcyA9IEBtdXRhdGlvbk1hbmFnZXIuZ2V0U2VsZWN0ZWRCdWZmZXJSYW5nZXNGb3JDaGVja3BvaW50KEBmbGFzaENoZWNrcG9pbnQpXG4gICAgICAgIEB2aW1TdGF0ZS5mbGFzaChyYW5nZXMsIHR5cGU6IEBnZXRGbGFzaFR5cGUoKSlcblxuICBnZXRGbGFzaFR5cGU6IC0+XG4gICAgaWYgQG9jY3VycmVuY2VTZWxlY3RlZFxuICAgICAgQGZsYXNoVHlwZUZvck9jY3VycmVuY2VcbiAgICBlbHNlXG4gICAgICBAZmxhc2hUeXBlXG5cbiAgdHJhY2tDaGFuZ2VJZk5lY2Vzc2FyeTogLT5cbiAgICByZXR1cm4gdW5sZXNzIEB0cmFja0NoYW5nZVxuXG4gICAgQG9uRGlkRmluaXNoT3BlcmF0aW9uID0+XG4gICAgICBpZiByYW5nZSA9IEBtdXRhdGlvbk1hbmFnZXIuZ2V0TXV0YXRlZEJ1ZmZlclJhbmdlRm9yU2VsZWN0aW9uKEBlZGl0b3IuZ2V0TGFzdFNlbGVjdGlvbigpKVxuICAgICAgICBAc2V0TWFya0ZvckNoYW5nZShyYW5nZSlcblxuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBzdXBlclxuICAgIHtAbXV0YXRpb25NYW5hZ2VyLCBAb2NjdXJyZW5jZU1hbmFnZXIsIEBwZXJzaXN0ZW50U2VsZWN0aW9ufSA9IEB2aW1TdGF0ZVxuICAgIEBzdWJzY3JpYmVSZXNldE9jY3VycmVuY2VQYXR0ZXJuSWZOZWVkZWQoKVxuICAgIEBpbml0aWFsaXplKClcbiAgICBAb25EaWRTZXRPcGVyYXRvck1vZGlmaWVyKEBzZXRNb2RpZmllci5iaW5kKHRoaXMpKVxuXG4gICAgIyBXaGVuIHByZXNldC1vY2N1cnJlbmNlIHdhcyBleGlzdHMsIG9wZXJhdGUgb24gb2NjdXJyZW5jZS13aXNlXG4gICAgaWYgQGFjY2VwdFByZXNldE9jY3VycmVuY2UgYW5kIEBvY2N1cnJlbmNlTWFuYWdlci5oYXNNYXJrZXJzKClcbiAgICAgIEBvY2N1cnJlbmNlID0gdHJ1ZVxuXG4gICAgIyBbRklYTUVdIE9SREVSLU1BVFRFUlxuICAgICMgVG8gcGljayBjdXJzb3Itd29yZCB0byBmaW5kIG9jY3VycmVuY2UgYmFzZSBwYXR0ZXJuLlxuICAgICMgVGhpcyBoYXMgdG8gYmUgZG9uZSBCRUZPUkUgY29udmVydGluZyBwZXJzaXN0ZW50LXNlbGVjdGlvbiBpbnRvIHJlYWwtc2VsZWN0aW9uLlxuICAgICMgU2luY2Ugd2hlbiBwZXJzaXN0ZW50LXNlbGVjdGlvbiBpcyBhY3R1YWxsIHNlbGVjdGVkLCBpdCBjaGFuZ2UgY3Vyc29yIHBvc2l0aW9uLlxuICAgIGlmIEBvY2N1cnJlbmNlIGFuZCBub3QgQG9jY3VycmVuY2VNYW5hZ2VyLmhhc01hcmtlcnMoKVxuICAgICAgQG9jY3VycmVuY2VNYW5hZ2VyLmFkZFBhdHRlcm4oQHBhdHRlcm5Gb3JPY2N1cnJlbmNlID8gQGdldFBhdHRlcm5Gb3JPY2N1cnJlbmNlVHlwZShAb2NjdXJyZW5jZVR5cGUpKVxuXG5cbiAgICAjIFRoaXMgY2hhbmdlIGN1cnNvciBwb3NpdGlvbi5cbiAgICBpZiBAc2VsZWN0UGVyc2lzdGVudFNlbGVjdGlvbklmTmVjZXNzYXJ5KClcbiAgICAgICMgW0ZJWE1FXSBzZWxlY3Rpb24td2lzZSBpcyBub3Qgc3luY2hlZCBpZiBpdCBhbHJlYWR5IHZpc3VhbC1tb2RlXG4gICAgICB1bmxlc3MgQG1vZGUgaXMgJ3Zpc3VhbCdcbiAgICAgICAgQHZpbVN0YXRlLm1vZGVNYW5hZ2VyLmFjdGl2YXRlKCd2aXN1YWwnLCBAc3dyYXAuZGV0ZWN0V2lzZShAZWRpdG9yKSlcblxuICAgIEB0YXJnZXQgPSAnQ3VycmVudFNlbGVjdGlvbicgaWYgQG1vZGUgaXMgJ3Zpc3VhbCcgYW5kIEByZXF1aXJlVGFyZ2V0XG4gICAgQHNldFRhcmdldChAbmV3KEB0YXJnZXQpKSBpZiBfLmlzU3RyaW5nKEB0YXJnZXQpXG5cbiAgc3Vic2NyaWJlUmVzZXRPY2N1cnJlbmNlUGF0dGVybklmTmVlZGVkOiAtPlxuICAgICMgW0NBVVRJT05dXG4gICAgIyBUaGlzIG1ldGhvZCBoYXMgdG8gYmUgY2FsbGVkIGluIFBST1BFUiB0aW1pbmcuXG4gICAgIyBJZiBvY2N1cnJlbmNlIGlzIHRydWUgYnV0IG5vIHByZXNldC1vY2N1cnJlbmNlXG4gICAgIyBUcmVhdCB0aGF0IGBvY2N1cnJlbmNlYCBpcyBCT1VOREVEIHRvIG9wZXJhdG9yIGl0c2VsZiwgc28gY2xlYW5wIGF0IGZpbmlzaGVkLlxuICAgIGlmIEBvY2N1cnJlbmNlIGFuZCBub3QgQG9jY3VycmVuY2VNYW5hZ2VyLmhhc01hcmtlcnMoKVxuICAgICAgQG9uRGlkUmVzZXRPcGVyYXRpb25TdGFjayg9PiBAb2NjdXJyZW5jZU1hbmFnZXIucmVzZXRQYXR0ZXJucygpKVxuXG4gIHNldE1vZGlmaWVyOiAob3B0aW9ucykgLT5cbiAgICBpZiBvcHRpb25zLndpc2U/XG4gICAgICBAd2lzZSA9IG9wdGlvbnMud2lzZVxuICAgICAgcmV0dXJuXG5cbiAgICBpZiBvcHRpb25zLm9jY3VycmVuY2U/XG4gICAgICBAb2NjdXJyZW5jZSA9IG9wdGlvbnMub2NjdXJyZW5jZVxuICAgICAgaWYgQG9jY3VycmVuY2VcbiAgICAgICAgQG9jY3VycmVuY2VUeXBlID0gb3B0aW9ucy5vY2N1cnJlbmNlVHlwZVxuICAgICAgICAjIFRoaXMgaXMgbyBtb2RpZmllciBjYXNlKGUuZy4gYGMgbyBwYCwgYGQgTyBmYClcbiAgICAgICAgIyBXZSBSRVNFVCBleGlzdGluZyBvY2N1cmVuY2UtbWFya2VyIHdoZW4gYG9gIG9yIGBPYCBtb2RpZmllciBpcyB0eXBlZCBieSB1c2VyLlxuICAgICAgICBwYXR0ZXJuID0gQGdldFBhdHRlcm5Gb3JPY2N1cnJlbmNlVHlwZShAb2NjdXJyZW5jZVR5cGUpXG4gICAgICAgIEBvY2N1cnJlbmNlTWFuYWdlci5hZGRQYXR0ZXJuKHBhdHRlcm4sIHtyZXNldDogdHJ1ZSwgQG9jY3VycmVuY2VUeXBlfSlcbiAgICAgICAgQG9uRGlkUmVzZXRPcGVyYXRpb25TdGFjayg9PiBAb2NjdXJyZW5jZU1hbmFnZXIucmVzZXRQYXR0ZXJucygpKVxuXG4gICMgcmV0dXJuIHRydWUvZmFsc2UgdG8gaW5kaWNhdGUgc3VjY2Vzc1xuICBzZWxlY3RQZXJzaXN0ZW50U2VsZWN0aW9uSWZOZWNlc3Nhcnk6IC0+XG4gICAgaWYgQGFjY2VwdFBlcnNpc3RlbnRTZWxlY3Rpb24gYW5kXG4gICAgICAgIEBnZXRDb25maWcoJ2F1dG9TZWxlY3RQZXJzaXN0ZW50U2VsZWN0aW9uT25PcGVyYXRlJykgYW5kXG4gICAgICAgIG5vdCBAcGVyc2lzdGVudFNlbGVjdGlvbi5pc0VtcHR5KClcblxuICAgICAgQHBlcnNpc3RlbnRTZWxlY3Rpb24uc2VsZWN0KClcbiAgICAgIEBlZGl0b3IubWVyZ2VJbnRlcnNlY3RpbmdTZWxlY3Rpb25zKClcbiAgICAgIGZvciAkc2VsZWN0aW9uIGluIEBzd3JhcC5nZXRTZWxlY3Rpb25zKEBlZGl0b3IpIHdoZW4gbm90ICRzZWxlY3Rpb24uaGFzUHJvcGVydGllcygpXG4gICAgICAgICRzZWxlY3Rpb24uc2F2ZVByb3BlcnRpZXMoKVxuICAgICAgdHJ1ZVxuICAgIGVsc2VcbiAgICAgIGZhbHNlXG5cbiAgZ2V0UGF0dGVybkZvck9jY3VycmVuY2VUeXBlOiAob2NjdXJyZW5jZVR5cGUpIC0+XG4gICAgc3dpdGNoIG9jY3VycmVuY2VUeXBlXG4gICAgICB3aGVuICdiYXNlJ1xuICAgICAgICBnZXRXb3JkUGF0dGVybkF0QnVmZmVyUG9zaXRpb24oQGVkaXRvciwgQGdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCkpXG4gICAgICB3aGVuICdzdWJ3b3JkJ1xuICAgICAgICBnZXRTdWJ3b3JkUGF0dGVybkF0QnVmZmVyUG9zaXRpb24oQGVkaXRvciwgQGdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCkpXG5cbiAgIyB0YXJnZXQgaXMgVGV4dE9iamVjdCBvciBNb3Rpb24gdG8gb3BlcmF0ZSBvbi5cbiAgc2V0VGFyZ2V0OiAoQHRhcmdldCkgLT5cbiAgICBAdGFyZ2V0Lm9wZXJhdG9yID0gdGhpc1xuICAgIEBlbWl0RGlkU2V0VGFyZ2V0KHRoaXMpXG5cbiAgICBpZiBAY2FuRWFybHlTZWxlY3QoKVxuICAgICAgQG5vcm1hbGl6ZVNlbGVjdGlvbnNJZk5lY2Vzc2FyeSgpXG4gICAgICBAY3JlYXRlQnVmZmVyQ2hlY2twb2ludCgndW5kbycpXG4gICAgICBAc2VsZWN0VGFyZ2V0KClcbiAgICB0aGlzXG5cbiAgc2V0VGV4dFRvUmVnaXN0ZXJGb3JTZWxlY3Rpb246IChzZWxlY3Rpb24pIC0+XG4gICAgQHNldFRleHRUb1JlZ2lzdGVyKHNlbGVjdGlvbi5nZXRUZXh0KCksIHNlbGVjdGlvbilcblxuICBzZXRUZXh0VG9SZWdpc3RlcjogKHRleHQsIHNlbGVjdGlvbikgLT5cbiAgICB0ZXh0ICs9IFwiXFxuXCIgaWYgKEB0YXJnZXQuaXNMaW5ld2lzZSgpIGFuZCAobm90IHRleHQuZW5kc1dpdGgoJ1xcbicpKSlcbiAgICBAdmltU3RhdGUucmVnaXN0ZXIuc2V0KG51bGwsIHt0ZXh0LCBzZWxlY3Rpb259KSBpZiB0ZXh0XG5cbiAgbm9ybWFsaXplU2VsZWN0aW9uc0lmTmVjZXNzYXJ5OiAtPlxuICAgIGlmIEB0YXJnZXQ/LmlzTW90aW9uKCkgYW5kIChAbW9kZSBpcyAndmlzdWFsJylcbiAgICAgIEBzd3JhcC5ub3JtYWxpemUoQGVkaXRvcilcblxuICBzdGFydE11dGF0aW9uOiAoZm4pIC0+XG4gICAgaWYgQGNhbkVhcmx5U2VsZWN0KClcbiAgICAgICMgLSBTa2lwIHNlbGVjdGlvbiBub3JtYWxpemF0aW9uOiBhbHJlYWR5IG5vcm1hbGl6ZWQgYmVmb3JlIEBzZWxlY3RUYXJnZXQoKVxuICAgICAgIyAtIE1hbnVhbCBjaGVja3BvaW50IGdyb3VwaW5nOiB0byBjcmVhdGUgY2hlY2twb2ludCBiZWZvcmUgQHNlbGVjdFRhcmdldCgpXG4gICAgICBmbigpXG4gICAgICBAZW1pdFdpbGxGaW5pc2hNdXRhdGlvbigpXG4gICAgICBAZ3JvdXBDaGFuZ2VzU2luY2VCdWZmZXJDaGVja3BvaW50KCd1bmRvJylcblxuICAgIGVsc2VcbiAgICAgIEBub3JtYWxpemVTZWxlY3Rpb25zSWZOZWNlc3NhcnkoKVxuICAgICAgQGVkaXRvci50cmFuc2FjdCA9PlxuICAgICAgICBmbigpXG4gICAgICAgIEBlbWl0V2lsbEZpbmlzaE11dGF0aW9uKClcblxuICAgIEBlbWl0RGlkRmluaXNoTXV0YXRpb24oKVxuXG4gICMgTWFpblxuICBleGVjdXRlOiAtPlxuICAgIEBzdGFydE11dGF0aW9uID0+XG4gICAgICBpZiBAc2VsZWN0VGFyZ2V0KClcbiAgICAgICAgaWYgQG11dGF0ZVNlbGVjdGlvbk9yZGVyZFxuICAgICAgICAgIHNlbGVjdGlvbnMgPSBAZWRpdG9yLmdldFNlbGVjdGlvbnNPcmRlcmVkQnlCdWZmZXJQb3NpdGlvbigpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBzZWxlY3Rpb25zID0gQGVkaXRvci5nZXRTZWxlY3Rpb25zKClcbiAgICAgICAgZm9yIHNlbGVjdGlvbiBpbiBzZWxlY3Rpb25zXG4gICAgICAgICAgQG11dGF0ZVNlbGVjdGlvbihzZWxlY3Rpb24pXG4gICAgICAgIEBtdXRhdGlvbk1hbmFnZXIuc2V0Q2hlY2twb2ludCgnZGlkLWZpbmlzaCcpXG4gICAgICAgIEByZXN0b3JlQ3Vyc29yUG9zaXRpb25zSWZOZWNlc3NhcnkoKVxuXG4gICAgIyBFdmVuIHRob3VnaCB3ZSBmYWlsIHRvIHNlbGVjdCB0YXJnZXQgYW5kIGZhaWwgdG8gbXV0YXRlLFxuICAgICMgd2UgaGF2ZSB0byByZXR1cm4gdG8gbm9ybWFsLW1vZGUgZnJvbSBvcGVyYXRvci1wZW5kaW5nIG9yIHZpc3VhbFxuICAgIEBhY3RpdmF0ZU1vZGUoJ25vcm1hbCcpXG5cbiAgIyBSZXR1cm4gdHJ1ZSB1bmxlc3MgYWxsIHNlbGVjdGlvbiBpcyBlbXB0eS5cbiAgc2VsZWN0VGFyZ2V0OiAtPlxuICAgIHJldHVybiBAdGFyZ2V0U2VsZWN0ZWQgaWYgQHRhcmdldFNlbGVjdGVkP1xuICAgIEBtdXRhdGlvbk1hbmFnZXIuaW5pdCh7QHN0YXlCeU1hcmtlcn0pXG5cbiAgICBAdGFyZ2V0LmZvcmNlV2lzZShAd2lzZSkgaWYgQHdpc2U/XG4gICAgQGVtaXRXaWxsU2VsZWN0VGFyZ2V0KClcblxuICAgICMgQWxsb3cgY3Vyc29yIHBvc2l0aW9uIGFkanVzdG1lbnQgJ29uLXdpbGwtc2VsZWN0LXRhcmdldCcgaG9vay5cbiAgICAjIHNvIGNoZWNrcG9pbnQgY29tZXMgQUZURVIgQGVtaXRXaWxsU2VsZWN0VGFyZ2V0KClcbiAgICBAbXV0YXRpb25NYW5hZ2VyLnNldENoZWNrcG9pbnQoJ3dpbGwtc2VsZWN0JylcblxuICAgICMgTk9URVxuICAgICMgU2luY2UgTW92ZVRvTmV4dE9jY3VycmVuY2UsIE1vdmVUb1ByZXZpb3VzT2NjdXJyZW5jZSBtb3Rpb24gbW92ZSBieVxuICAgICMgIG9jY3VycmVuY2UtbWFya2VyLCBvY2N1cnJlbmNlLW1hcmtlciBoYXMgdG8gYmUgY3JlYXRlZCBCRUZPUkUgYEB0YXJnZXQuZXhlY3V0ZSgpYFxuICAgICMgQW5kIHdoZW4gcmVwZWF0ZWQsIG9jY3VycmVuY2UgcGF0dGVybiBpcyBhbHJlYWR5IGNhY2hlZCBhdCBAcGF0dGVybkZvck9jY3VycmVuY2VcbiAgICBpZiBAcmVwZWF0ZWQgYW5kIEBvY2N1cnJlbmNlIGFuZCBub3QgQG9jY3VycmVuY2VNYW5hZ2VyLmhhc01hcmtlcnMoKVxuICAgICAgQG9jY3VycmVuY2VNYW5hZ2VyLmFkZFBhdHRlcm4oQHBhdHRlcm5Gb3JPY2N1cnJlbmNlLCB7QG9jY3VycmVuY2VUeXBlfSlcblxuICAgIEB0YXJnZXQuZXhlY3V0ZSgpXG5cbiAgICBAbXV0YXRpb25NYW5hZ2VyLnNldENoZWNrcG9pbnQoJ2RpZC1zZWxlY3QnKVxuICAgIGlmIEBvY2N1cnJlbmNlXG4gICAgICAjIFRvIHJlcG9lYXQoYC5gKSBvcGVyYXRpb24gd2hlcmUgbXVsdGlwbGUgb2NjdXJyZW5jZSBwYXR0ZXJucyB3YXMgc2V0LlxuICAgICAgIyBIZXJlIHdlIHNhdmUgcGF0dGVybnMgd2hpY2ggcmVwcmVzZW50IHVuaW9uZWQgcmVnZXggd2hpY2ggQG9jY3VycmVuY2VNYW5hZ2VyIGtub3dzLlxuICAgICAgQHBhdHRlcm5Gb3JPY2N1cnJlbmNlID89IEBvY2N1cnJlbmNlTWFuYWdlci5idWlsZFBhdHRlcm4oKVxuXG4gICAgICBpZiBAb2NjdXJyZW5jZU1hbmFnZXIuc2VsZWN0KClcbiAgICAgICAgQG9jY3VycmVuY2VTZWxlY3RlZCA9IHRydWVcbiAgICAgICAgQG11dGF0aW9uTWFuYWdlci5zZXRDaGVja3BvaW50KCdkaWQtc2VsZWN0LW9jY3VycmVuY2UnKVxuXG4gICAgaWYgQHRhcmdldFNlbGVjdGVkID0gQHZpbVN0YXRlLmhhdmVTb21lTm9uRW1wdHlTZWxlY3Rpb24oKSBvciBAdGFyZ2V0Lm5hbWUgaXMgXCJFbXB0eVwiXG4gICAgICBAZW1pdERpZFNlbGVjdFRhcmdldCgpXG4gICAgICBAZmxhc2hDaGFuZ2VJZk5lY2Vzc2FyeSgpXG4gICAgICBAdHJhY2tDaGFuZ2VJZk5lY2Vzc2FyeSgpXG4gICAgZWxzZVxuICAgICAgQGVtaXREaWRGYWlsU2VsZWN0VGFyZ2V0KClcbiAgICByZXR1cm4gQHRhcmdldFNlbGVjdGVkXG5cbiAgcmVzdG9yZUN1cnNvclBvc2l0aW9uc0lmTmVjZXNzYXJ5OiAtPlxuICAgIHJldHVybiB1bmxlc3MgQHJlc3RvcmVQb3NpdGlvbnNcbiAgICBzdGF5ID0gQHN0YXlBdFNhbWVQb3NpdGlvbiA/IEBnZXRDb25maWcoQHN0YXlPcHRpb25OYW1lKSBvciAoQG9jY3VycmVuY2VTZWxlY3RlZCBhbmQgQGdldENvbmZpZygnc3RheU9uT2NjdXJyZW5jZScpKVxuICAgIHdpc2UgPSBpZiBAb2NjdXJyZW5jZVNlbGVjdGVkIHRoZW4gJ2NoYXJhY3Rlcndpc2UnIGVsc2UgQHRhcmdldC53aXNlXG4gICAgQG11dGF0aW9uTWFuYWdlci5yZXN0b3JlQ3Vyc29yUG9zaXRpb25zKHtzdGF5LCB3aXNlLCBAc2V0VG9GaXJzdENoYXJhY3Rlck9uTGluZXdpc2V9KVxuXG4jIFNlbGVjdFxuIyBXaGVuIHRleHQtb2JqZWN0IGlzIGludm9rZWQgZnJvbSBub3JtYWwgb3Igdml1c2FsLW1vZGUsIG9wZXJhdGlvbiB3b3VsZCBiZVxuIyAgPT4gU2VsZWN0IG9wZXJhdG9yIHdpdGggdGFyZ2V0PXRleHQtb2JqZWN0XG4jIFdoZW4gbW90aW9uIGlzIGludm9rZWQgZnJvbSB2aXN1YWwtbW9kZSwgb3BlcmF0aW9uIHdvdWxkIGJlXG4jICA9PiBTZWxlY3Qgb3BlcmF0b3Igd2l0aCB0YXJnZXQ9bW90aW9uKVxuIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuIyBTZWxlY3QgaXMgdXNlZCBpbiBUV08gc2l0dWF0aW9uLlxuIyAtIHZpc3VhbC1tb2RlIG9wZXJhdGlvblxuIyAgIC0gZS5nOiBgdiBsYCwgYFYgamAsIGB2IGkgcGAuLi5cbiMgLSBEaXJlY3RseSBpbnZva2UgdGV4dC1vYmplY3QgZnJvbSBub3JtYWwtbW9kZVxuIyAgIC0gZS5nOiBJbnZva2UgYElubmVyIFBhcmFncmFwaGAgZnJvbSBjb21tYW5kLXBhbGV0dGUuXG5jbGFzcyBTZWxlY3QgZXh0ZW5kcyBPcGVyYXRvclxuICBAZXh0ZW5kKGZhbHNlKVxuICBmbGFzaFRhcmdldDogZmFsc2VcbiAgcmVjb3JkYWJsZTogZmFsc2VcbiAgYWNjZXB0UHJlc2V0T2NjdXJyZW5jZTogZmFsc2VcbiAgYWNjZXB0UGVyc2lzdGVudFNlbGVjdGlvbjogZmFsc2VcblxuICBleGVjdXRlOiAtPlxuICAgIEBzdGFydE11dGF0aW9uKEBzZWxlY3RUYXJnZXQuYmluZCh0aGlzKSlcblxuICAgIGlmIEB0YXJnZXQuaXNUZXh0T2JqZWN0KCkgYW5kIEB0YXJnZXQuc2VsZWN0U3VjY2VlZGVkXG4gICAgICBAZWRpdG9yLnNjcm9sbFRvQ3Vyc29yUG9zaXRpb24oKVxuICAgICAgQGFjdGl2YXRlTW9kZUlmTmVjZXNzYXJ5KCd2aXN1YWwnLCBAdGFyZ2V0Lndpc2UpXG5cbmNsYXNzIFNlbGVjdExhdGVzdENoYW5nZSBleHRlbmRzIFNlbGVjdFxuICBAZXh0ZW5kKClcbiAgQGRlc2NyaXB0aW9uOiBcIlNlbGVjdCBsYXRlc3QgeWFua2VkIG9yIGNoYW5nZWQgcmFuZ2VcIlxuICB0YXJnZXQ6ICdBTGF0ZXN0Q2hhbmdlJ1xuXG5jbGFzcyBTZWxlY3RQcmV2aW91c1NlbGVjdGlvbiBleHRlbmRzIFNlbGVjdFxuICBAZXh0ZW5kKClcbiAgdGFyZ2V0OiBcIlByZXZpb3VzU2VsZWN0aW9uXCJcblxuY2xhc3MgU2VsZWN0UGVyc2lzdGVudFNlbGVjdGlvbiBleHRlbmRzIFNlbGVjdFxuICBAZXh0ZW5kKClcbiAgQGRlc2NyaXB0aW9uOiBcIlNlbGVjdCBwZXJzaXN0ZW50LXNlbGVjdGlvbiBhbmQgY2xlYXIgYWxsIHBlcnNpc3RlbnQtc2VsZWN0aW9uLCBpdCdzIGxpa2UgY29udmVydCB0byByZWFsLXNlbGVjdGlvblwiXG4gIHRhcmdldDogXCJBUGVyc2lzdGVudFNlbGVjdGlvblwiXG5cbmNsYXNzIFNlbGVjdE9jY3VycmVuY2UgZXh0ZW5kcyBPcGVyYXRvclxuICBAZXh0ZW5kKClcbiAgQGRlc2NyaXB0aW9uOiBcIkFkZCBzZWxlY3Rpb24gb250byBlYWNoIG1hdGNoaW5nIHdvcmQgd2l0aGluIHRhcmdldCByYW5nZVwiXG4gIG9jY3VycmVuY2U6IHRydWVcblxuICBleGVjdXRlOiAtPlxuICAgIEBzdGFydE11dGF0aW9uID0+XG4gICAgICBpZiBAc2VsZWN0VGFyZ2V0KClcbiAgICAgICAgQGFjdGl2YXRlTW9kZUlmTmVjZXNzYXJ5KCd2aXN1YWwnLCAnY2hhcmFjdGVyd2lzZScpXG5cbiMgUGVyc2lzdGVudCBTZWxlY3Rpb25cbiMgPT09PT09PT09PT09PT09PT09PT09PT09PVxuY2xhc3MgQ3JlYXRlUGVyc2lzdGVudFNlbGVjdGlvbiBleHRlbmRzIE9wZXJhdG9yXG4gIEBleHRlbmQoKVxuICBmbGFzaFRhcmdldDogZmFsc2VcbiAgc3RheUF0U2FtZVBvc2l0aW9uOiB0cnVlXG4gIGFjY2VwdFByZXNldE9jY3VycmVuY2U6IGZhbHNlXG4gIGFjY2VwdFBlcnNpc3RlbnRTZWxlY3Rpb246IGZhbHNlXG5cbiAgbXV0YXRlU2VsZWN0aW9uOiAoc2VsZWN0aW9uKSAtPlxuICAgIEBwZXJzaXN0ZW50U2VsZWN0aW9uLm1hcmtCdWZmZXJSYW5nZShzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKSlcblxuY2xhc3MgVG9nZ2xlUGVyc2lzdGVudFNlbGVjdGlvbiBleHRlbmRzIENyZWF0ZVBlcnNpc3RlbnRTZWxlY3Rpb25cbiAgQGV4dGVuZCgpXG5cbiAgaXNDb21wbGV0ZTogLT5cbiAgICBwb2ludCA9IEBlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKVxuICAgIEBtYXJrZXJUb1JlbW92ZSA9IEBwZXJzaXN0ZW50U2VsZWN0aW9uLmdldE1hcmtlckF0UG9pbnQocG9pbnQpXG4gICAgaWYgQG1hcmtlclRvUmVtb3ZlXG4gICAgICB0cnVlXG4gICAgZWxzZVxuICAgICAgc3VwZXJcblxuICBleGVjdXRlOiAtPlxuICAgIGlmIEBtYXJrZXJUb1JlbW92ZVxuICAgICAgQG1hcmtlclRvUmVtb3ZlLmRlc3Ryb3koKVxuICAgIGVsc2VcbiAgICAgIHN1cGVyXG5cbiMgUHJlc2V0IE9jY3VycmVuY2VcbiMgPT09PT09PT09PT09PT09PT09PT09PT09PVxuY2xhc3MgVG9nZ2xlUHJlc2V0T2NjdXJyZW5jZSBleHRlbmRzIE9wZXJhdG9yXG4gIEBleHRlbmQoKVxuICB0YXJnZXQ6IFwiRW1wdHlcIlxuICBmbGFzaFRhcmdldDogZmFsc2VcbiAgYWNjZXB0UHJlc2V0T2NjdXJyZW5jZTogZmFsc2VcbiAgYWNjZXB0UGVyc2lzdGVudFNlbGVjdGlvbjogZmFsc2VcbiAgb2NjdXJyZW5jZVR5cGU6ICdiYXNlJ1xuXG4gIGV4ZWN1dGU6IC0+XG4gICAgaWYgbWFya2VyID0gQG9jY3VycmVuY2VNYW5hZ2VyLmdldE1hcmtlckF0UG9pbnQoQGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpKVxuICAgICAgQG9jY3VycmVuY2VNYW5hZ2VyLmRlc3Ryb3lNYXJrZXJzKFttYXJrZXJdKVxuICAgIGVsc2VcbiAgICAgIHBhdHRlcm4gPSBudWxsXG4gICAgICBpc05hcnJvd2VkID0gQHZpbVN0YXRlLm1vZGVNYW5hZ2VyLmlzTmFycm93ZWQoKVxuXG4gICAgICBpZiBAbW9kZSBpcyAndmlzdWFsJyBhbmQgbm90IGlzTmFycm93ZWRcbiAgICAgICAgQG9jY3VycmVuY2VUeXBlID0gJ2Jhc2UnXG4gICAgICAgIHBhdHRlcm4gPSBuZXcgUmVnRXhwKF8uZXNjYXBlUmVnRXhwKEBlZGl0b3IuZ2V0U2VsZWN0ZWRUZXh0KCkpLCAnZycpXG4gICAgICBlbHNlXG4gICAgICAgIHBhdHRlcm4gPSBAZ2V0UGF0dGVybkZvck9jY3VycmVuY2VUeXBlKEBvY2N1cnJlbmNlVHlwZSlcblxuICAgICAgQG9jY3VycmVuY2VNYW5hZ2VyLmFkZFBhdHRlcm4ocGF0dGVybiwge0BvY2N1cnJlbmNlVHlwZX0pXG4gICAgICBAb2NjdXJyZW5jZU1hbmFnZXIuc2F2ZUxhc3RQYXR0ZXJuKEBvY2N1cnJlbmNlVHlwZSlcblxuICAgICAgQGFjdGl2YXRlTW9kZSgnbm9ybWFsJykgdW5sZXNzIGlzTmFycm93ZWRcblxuY2xhc3MgVG9nZ2xlUHJlc2V0U3Vid29yZE9jY3VycmVuY2UgZXh0ZW5kcyBUb2dnbGVQcmVzZXRPY2N1cnJlbmNlXG4gIEBleHRlbmQoKVxuICBvY2N1cnJlbmNlVHlwZTogJ3N1YndvcmQnXG5cbiMgV2FudCB0byByZW5hbWUgUmVzdG9yZU9jY3VycmVuY2VNYXJrZXJcbmNsYXNzIEFkZFByZXNldE9jY3VycmVuY2VGcm9tTGFzdE9jY3VycmVuY2VQYXR0ZXJuIGV4dGVuZHMgVG9nZ2xlUHJlc2V0T2NjdXJyZW5jZVxuICBAZXh0ZW5kKClcbiAgZXhlY3V0ZTogLT5cbiAgICBAb2NjdXJyZW5jZU1hbmFnZXIucmVzZXRQYXR0ZXJucygpXG4gICAgaWYgcGF0dGVybiA9IEB2aW1TdGF0ZS5nbG9iYWxTdGF0ZS5nZXQoJ2xhc3RPY2N1cnJlbmNlUGF0dGVybicpXG4gICAgICBvY2N1cnJlbmNlVHlwZSA9IEB2aW1TdGF0ZS5nbG9iYWxTdGF0ZS5nZXQoXCJsYXN0T2NjdXJyZW5jZVR5cGVcIilcbiAgICAgIEBvY2N1cnJlbmNlTWFuYWdlci5hZGRQYXR0ZXJuKHBhdHRlcm4sIHtvY2N1cnJlbmNlVHlwZX0pXG4gICAgICBAYWN0aXZhdGVNb2RlKCdub3JtYWwnKVxuXG4jIERlbGV0ZVxuIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuY2xhc3MgRGVsZXRlIGV4dGVuZHMgT3BlcmF0b3JcbiAgQGV4dGVuZCgpXG4gIHRyYWNrQ2hhbmdlOiB0cnVlXG4gIGZsYXNoQ2hlY2twb2ludDogJ2RpZC1zZWxlY3Qtb2NjdXJyZW5jZSdcbiAgZmxhc2hUeXBlRm9yT2NjdXJyZW5jZTogJ29wZXJhdG9yLXJlbW92ZS1vY2N1cnJlbmNlJ1xuICBzdGF5T3B0aW9uTmFtZTogJ3N0YXlPbkRlbGV0ZSdcbiAgc2V0VG9GaXJzdENoYXJhY3Rlck9uTGluZXdpc2U6IHRydWVcblxuICBleGVjdXRlOiAtPlxuICAgIGlmIEB0YXJnZXQud2lzZSBpcyAnYmxvY2t3aXNlJ1xuICAgICAgQHJlc3RvcmVQb3NpdGlvbnMgPSBmYWxzZVxuICAgIHN1cGVyXG5cbiAgbXV0YXRlU2VsZWN0aW9uOiAoc2VsZWN0aW9uKSA9PlxuICAgIEBzZXRUZXh0VG9SZWdpc3RlckZvclNlbGVjdGlvbihzZWxlY3Rpb24pXG4gICAgc2VsZWN0aW9uLmRlbGV0ZVNlbGVjdGVkVGV4dCgpXG5cbmNsYXNzIERlbGV0ZVJpZ2h0IGV4dGVuZHMgRGVsZXRlXG4gIEBleHRlbmQoKVxuICB0YXJnZXQ6ICdNb3ZlUmlnaHQnXG5cbmNsYXNzIERlbGV0ZUxlZnQgZXh0ZW5kcyBEZWxldGVcbiAgQGV4dGVuZCgpXG4gIHRhcmdldDogJ01vdmVMZWZ0J1xuXG5jbGFzcyBEZWxldGVUb0xhc3RDaGFyYWN0ZXJPZkxpbmUgZXh0ZW5kcyBEZWxldGVcbiAgQGV4dGVuZCgpXG4gIHRhcmdldDogJ01vdmVUb0xhc3RDaGFyYWN0ZXJPZkxpbmUnXG5cbiAgZXhlY3V0ZTogLT5cbiAgICBpZiBAdGFyZ2V0Lndpc2UgaXMgJ2Jsb2Nrd2lzZSdcbiAgICAgIEBvbkRpZFNlbGVjdFRhcmdldCA9PlxuICAgICAgICBmb3IgYmxvY2t3aXNlU2VsZWN0aW9uIGluIEBnZXRCbG9ja3dpc2VTZWxlY3Rpb25zKClcbiAgICAgICAgICBibG9ja3dpc2VTZWxlY3Rpb24uZXh0ZW5kTWVtYmVyU2VsZWN0aW9uc1RvRW5kT2ZMaW5lKClcbiAgICBzdXBlclxuXG5jbGFzcyBEZWxldGVMaW5lIGV4dGVuZHMgRGVsZXRlXG4gIEBleHRlbmQoKVxuICB3aXNlOiAnbGluZXdpc2UnXG4gIHRhcmdldDogXCJNb3ZlVG9SZWxhdGl2ZUxpbmVcIlxuXG4jIFlhbmtcbiMgPT09PT09PT09PT09PT09PT09PT09PT09PVxuY2xhc3MgWWFuayBleHRlbmRzIE9wZXJhdG9yXG4gIEBleHRlbmQoKVxuICB0cmFja0NoYW5nZTogdHJ1ZVxuICBzdGF5T3B0aW9uTmFtZTogJ3N0YXlPbllhbmsnXG5cbiAgbXV0YXRlU2VsZWN0aW9uOiAoc2VsZWN0aW9uKSAtPlxuICAgIEBzZXRUZXh0VG9SZWdpc3RlckZvclNlbGVjdGlvbihzZWxlY3Rpb24pXG5cbmNsYXNzIFlhbmtMaW5lIGV4dGVuZHMgWWFua1xuICBAZXh0ZW5kKClcbiAgd2lzZTogJ2xpbmV3aXNlJ1xuICB0YXJnZXQ6IFwiTW92ZVRvUmVsYXRpdmVMaW5lXCJcblxuY2xhc3MgWWFua1RvTGFzdENoYXJhY3Rlck9mTGluZSBleHRlbmRzIFlhbmtcbiAgQGV4dGVuZCgpXG4gIHRhcmdldDogJ01vdmVUb0xhc3RDaGFyYWN0ZXJPZkxpbmUnXG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBbY3RybC1hXVxuY2xhc3MgSW5jcmVhc2UgZXh0ZW5kcyBPcGVyYXRvclxuICBAZXh0ZW5kKClcbiAgdGFyZ2V0OiBcIkVtcHR5XCIgIyBjdHJsLWEgaW4gbm9ybWFsLW1vZGUgZmluZCB0YXJnZXQgbnVtYmVyIGluIGN1cnJlbnQgbGluZSBtYW51YWxseVxuICBmbGFzaFRhcmdldDogZmFsc2UgIyBkbyBtYW51YWxseVxuICByZXN0b3JlUG9zaXRpb25zOiBmYWxzZSAjIGRvIG1hbnVhbGx5XG4gIHN0ZXA6IDFcblxuICBleGVjdXRlOiAtPlxuICAgIEBuZXdSYW5nZXMgPSBbXVxuICAgIHN1cGVyXG4gICAgaWYgQG5ld1Jhbmdlcy5sZW5ndGhcbiAgICAgIGlmIEBnZXRDb25maWcoJ2ZsYXNoT25PcGVyYXRlJykgYW5kIEBuYW1lIG5vdCBpbiBAZ2V0Q29uZmlnKCdmbGFzaE9uT3BlcmF0ZUJsYWNrbGlzdCcpXG4gICAgICAgIEB2aW1TdGF0ZS5mbGFzaChAbmV3UmFuZ2VzLCB0eXBlOiBAZmxhc2hUeXBlRm9yT2NjdXJyZW5jZSlcblxuICByZXBsYWNlTnVtYmVySW5CdWZmZXJSYW5nZTogKHNjYW5SYW5nZSwgZm49bnVsbCkgLT5cbiAgICBuZXdSYW5nZXMgPSBbXVxuICAgIEBwYXR0ZXJuID89IC8vLyN7QGdldENvbmZpZygnbnVtYmVyUmVnZXgnKX0vLy9nXG4gICAgQHNjYW5Gb3J3YXJkIEBwYXR0ZXJuLCB7c2NhblJhbmdlfSwgKGV2ZW50KSA9PlxuICAgICAgcmV0dXJuIGlmIGZuPyBhbmQgbm90IGZuKGV2ZW50KVxuICAgICAge21hdGNoVGV4dCwgcmVwbGFjZX0gPSBldmVudFxuICAgICAgbmV4dE51bWJlciA9IEBnZXROZXh0TnVtYmVyKG1hdGNoVGV4dClcbiAgICAgIG5ld1Jhbmdlcy5wdXNoKHJlcGxhY2UoU3RyaW5nKG5leHROdW1iZXIpKSlcbiAgICBuZXdSYW5nZXNcblxuICBtdXRhdGVTZWxlY3Rpb246IChzZWxlY3Rpb24pIC0+XG4gICAge2N1cnNvcn0gPSBzZWxlY3Rpb25cbiAgICBpZiBAdGFyZ2V0LmlzKCdFbXB0eScpICMgY3RybC1hLCBjdHJsLXggaW4gYG5vcm1hbC1tb2RlYFxuICAgICAgY3Vyc29yUG9zaXRpb24gPSBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuICAgICAgc2NhblJhbmdlID0gQGVkaXRvci5idWZmZXJSYW5nZUZvckJ1ZmZlclJvdyhjdXJzb3JQb3NpdGlvbi5yb3cpXG4gICAgICBuZXdSYW5nZXMgPSBAcmVwbGFjZU51bWJlckluQnVmZmVyUmFuZ2Ugc2NhblJhbmdlLCAoe3JhbmdlLCBzdG9wfSkgLT5cbiAgICAgICAgaWYgcmFuZ2UuZW5kLmlzR3JlYXRlclRoYW4oY3Vyc29yUG9zaXRpb24pXG4gICAgICAgICAgc3RvcCgpXG4gICAgICAgICAgdHJ1ZVxuICAgICAgICBlbHNlXG4gICAgICAgICAgZmFsc2VcblxuICAgICAgcG9pbnQgPSBuZXdSYW5nZXNbMF0/LmVuZC50cmFuc2xhdGUoWzAsIC0xXSkgPyBjdXJzb3JQb3NpdGlvblxuICAgICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHBvaW50KVxuICAgIGVsc2VcbiAgICAgIHNjYW5SYW5nZSA9IHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpXG4gICAgICBAbmV3UmFuZ2VzLnB1c2goQHJlcGxhY2VOdW1iZXJJbkJ1ZmZlclJhbmdlKHNjYW5SYW5nZSkuLi4pXG4gICAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24oc2NhblJhbmdlLnN0YXJ0KVxuXG4gIGdldE5leHROdW1iZXI6IChudW1iZXJTdHJpbmcpIC0+XG4gICAgTnVtYmVyLnBhcnNlSW50KG51bWJlclN0cmluZywgMTApICsgQHN0ZXAgKiBAZ2V0Q291bnQoKVxuXG4jIFtjdHJsLXhdXG5jbGFzcyBEZWNyZWFzZSBleHRlbmRzIEluY3JlYXNlXG4gIEBleHRlbmQoKVxuICBzdGVwOiAtMVxuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgW2cgY3RybC1hXVxuY2xhc3MgSW5jcmVtZW50TnVtYmVyIGV4dGVuZHMgSW5jcmVhc2VcbiAgQGV4dGVuZCgpXG4gIGJhc2VOdW1iZXI6IG51bGxcbiAgdGFyZ2V0OiBudWxsXG4gIG11dGF0ZVNlbGVjdGlvbk9yZGVyZDogdHJ1ZVxuXG4gIGdldE5leHROdW1iZXI6IChudW1iZXJTdHJpbmcpIC0+XG4gICAgaWYgQGJhc2VOdW1iZXI/XG4gICAgICBAYmFzZU51bWJlciArPSBAc3RlcCAqIEBnZXRDb3VudCgpXG4gICAgZWxzZVxuICAgICAgQGJhc2VOdW1iZXIgPSBOdW1iZXIucGFyc2VJbnQobnVtYmVyU3RyaW5nLCAxMClcbiAgICBAYmFzZU51bWJlclxuXG4jIFtnIGN0cmwteF1cbmNsYXNzIERlY3JlbWVudE51bWJlciBleHRlbmRzIEluY3JlbWVudE51bWJlclxuICBAZXh0ZW5kKClcbiAgc3RlcDogLTFcblxuIyBQdXRcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBDdXJzb3IgcGxhY2VtZW50OlxuIyAtIHBsYWNlIGF0IGVuZCBvZiBtdXRhdGlvbjogcGFzdGUgbm9uLW11bHRpbGluZSBjaGFyYWN0ZXJ3aXNlIHRleHRcbiMgLSBwbGFjZSBhdCBzdGFydCBvZiBtdXRhdGlvbjogbm9uLW11bHRpbGluZSBjaGFyYWN0ZXJ3aXNlIHRleHQoY2hhcmFjdGVyd2lzZSwgbGluZXdpc2UpXG5jbGFzcyBQdXRCZWZvcmUgZXh0ZW5kcyBPcGVyYXRvclxuICBAZXh0ZW5kKClcbiAgbG9jYXRpb246ICdiZWZvcmUnXG4gIHRhcmdldDogJ0VtcHR5J1xuICBmbGFzaFR5cGU6ICdvcGVyYXRvci1sb25nJ1xuICByZXN0b3JlUG9zaXRpb25zOiBmYWxzZSAjIG1hbmFnZSBtYW51YWxseVxuICBmbGFzaFRhcmdldDogdHJ1ZSAjIG1hbmFnZSBtYW51YWxseVxuICB0cmFja0NoYW5nZTogZmFsc2UgIyBtYW5hZ2UgbWFudWFsbHlcblxuICBleGVjdXRlOiAtPlxuICAgIEBtdXRhdGlvbnNCeVNlbGVjdGlvbiA9IG5ldyBNYXAoKVxuICAgIHt0ZXh0LCB0eXBlfSA9IEB2aW1TdGF0ZS5yZWdpc3Rlci5nZXQobnVsbCwgQGVkaXRvci5nZXRMYXN0U2VsZWN0aW9uKCkpXG4gICAgcmV0dXJuIHVubGVzcyB0ZXh0XG4gICAgQG9uRGlkRmluaXNoTXV0YXRpb24oQGFkanVzdEN1cnNvclBvc2l0aW9uLmJpbmQodGhpcykpXG5cbiAgICBAb25EaWRGaW5pc2hPcGVyYXRpb24gPT5cbiAgICAgICMgVHJhY2tDaGFuZ2VcbiAgICAgIGlmIG5ld1JhbmdlID0gQG11dGF0aW9uc0J5U2VsZWN0aW9uLmdldChAZWRpdG9yLmdldExhc3RTZWxlY3Rpb24oKSlcbiAgICAgICAgQHNldE1hcmtGb3JDaGFuZ2UobmV3UmFuZ2UpXG5cbiAgICAgICMgRmxhc2hcbiAgICAgIGlmIEBnZXRDb25maWcoJ2ZsYXNoT25PcGVyYXRlJykgYW5kIEBuYW1lIG5vdCBpbiBAZ2V0Q29uZmlnKCdmbGFzaE9uT3BlcmF0ZUJsYWNrbGlzdCcpXG4gICAgICAgIHRvUmFuZ2UgPSAoc2VsZWN0aW9uKSA9PiBAbXV0YXRpb25zQnlTZWxlY3Rpb24uZ2V0KHNlbGVjdGlvbilcbiAgICAgICAgQHZpbVN0YXRlLmZsYXNoKEBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpLm1hcCh0b1JhbmdlKSwgdHlwZTogQGdldEZsYXNoVHlwZSgpKVxuXG4gICAgc3VwZXJcblxuICBhZGp1c3RDdXJzb3JQb3NpdGlvbjogLT5cbiAgICBmb3Igc2VsZWN0aW9uIGluIEBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpXG4gICAgICB7Y3Vyc29yfSA9IHNlbGVjdGlvblxuICAgICAge3N0YXJ0LCBlbmR9ID0gbmV3UmFuZ2UgPSBAbXV0YXRpb25zQnlTZWxlY3Rpb24uZ2V0KHNlbGVjdGlvbilcbiAgICAgIGlmIEBsaW5ld2lzZVBhc3RlXG4gICAgICAgIG1vdmVDdXJzb3JUb0ZpcnN0Q2hhcmFjdGVyQXRSb3coY3Vyc29yLCBzdGFydC5yb3cpXG4gICAgICBlbHNlXG4gICAgICAgIGlmIG5ld1JhbmdlLmlzU2luZ2xlTGluZSgpXG4gICAgICAgICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKGVuZC50cmFuc2xhdGUoWzAsIC0xXSkpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24oc3RhcnQpXG5cbiAgbXV0YXRlU2VsZWN0aW9uOiAoc2VsZWN0aW9uKSAtPlxuICAgIHt0ZXh0LCB0eXBlfSA9IEB2aW1TdGF0ZS5yZWdpc3Rlci5nZXQobnVsbCwgc2VsZWN0aW9uKVxuICAgIHRleHQgPSBfLm11bHRpcGx5U3RyaW5nKHRleHQsIEBnZXRDb3VudCgpKVxuICAgIEBsaW5ld2lzZVBhc3RlID0gdHlwZSBpcyAnbGluZXdpc2UnIG9yIEBpc01vZGUoJ3Zpc3VhbCcsICdsaW5ld2lzZScpXG4gICAgbmV3UmFuZ2UgPSBAcGFzdGUoc2VsZWN0aW9uLCB0ZXh0LCB7QGxpbmV3aXNlUGFzdGV9KVxuICAgIEBtdXRhdGlvbnNCeVNlbGVjdGlvbi5zZXQoc2VsZWN0aW9uLCBuZXdSYW5nZSlcblxuICBwYXN0ZTogKHNlbGVjdGlvbiwgdGV4dCwge2xpbmV3aXNlUGFzdGV9KSAtPlxuICAgIGlmIGxpbmV3aXNlUGFzdGVcbiAgICAgIEBwYXN0ZUxpbmV3aXNlKHNlbGVjdGlvbiwgdGV4dClcbiAgICBlbHNlXG4gICAgICBAcGFzdGVDaGFyYWN0ZXJ3aXNlKHNlbGVjdGlvbiwgdGV4dClcblxuICBwYXN0ZUNoYXJhY3Rlcndpc2U6IChzZWxlY3Rpb24sIHRleHQpIC0+XG4gICAge2N1cnNvcn0gPSBzZWxlY3Rpb25cbiAgICBpZiBzZWxlY3Rpb24uaXNFbXB0eSgpIGFuZCBAbG9jYXRpb24gaXMgJ2FmdGVyJyBhbmQgbm90IGlzRW1wdHlSb3coQGVkaXRvciwgY3Vyc29yLmdldEJ1ZmZlclJvdygpKVxuICAgICAgY3Vyc29yLm1vdmVSaWdodCgpXG4gICAgcmV0dXJuIHNlbGVjdGlvbi5pbnNlcnRUZXh0KHRleHQpXG5cbiAgIyBSZXR1cm4gbmV3UmFuZ2VcbiAgcGFzdGVMaW5ld2lzZTogKHNlbGVjdGlvbiwgdGV4dCkgLT5cbiAgICB7Y3Vyc29yfSA9IHNlbGVjdGlvblxuICAgIGN1cnNvclJvdyA9IGN1cnNvci5nZXRCdWZmZXJSb3coKVxuICAgIHRleHQgKz0gXCJcXG5cIiB1bmxlc3MgdGV4dC5lbmRzV2l0aChcIlxcblwiKVxuICAgIG5ld1JhbmdlID0gbnVsbFxuICAgIGlmIHNlbGVjdGlvbi5pc0VtcHR5KClcbiAgICAgIGlmIEBsb2NhdGlvbiBpcyAnYmVmb3JlJ1xuICAgICAgICBuZXdSYW5nZSA9IGluc2VydFRleHRBdEJ1ZmZlclBvc2l0aW9uKEBlZGl0b3IsIFtjdXJzb3JSb3csIDBdLCB0ZXh0KVxuICAgICAgICBzZXRCdWZmZXJSb3coY3Vyc29yLCBuZXdSYW5nZS5zdGFydC5yb3cpXG4gICAgICBlbHNlIGlmIEBsb2NhdGlvbiBpcyAnYWZ0ZXInXG4gICAgICAgIGVuc3VyZUVuZHNXaXRoTmV3TGluZUZvckJ1ZmZlclJvdyhAZWRpdG9yLCBjdXJzb3JSb3cpXG4gICAgICAgIG5ld1JhbmdlID0gaW5zZXJ0VGV4dEF0QnVmZmVyUG9zaXRpb24oQGVkaXRvciwgW2N1cnNvclJvdyArIDEsIDBdLCB0ZXh0KVxuICAgIGVsc2VcbiAgICAgIHNlbGVjdGlvbi5pbnNlcnRUZXh0KFwiXFxuXCIpIHVubGVzcyBAaXNNb2RlKCd2aXN1YWwnLCAnbGluZXdpc2UnKVxuICAgICAgbmV3UmFuZ2UgPSBzZWxlY3Rpb24uaW5zZXJ0VGV4dCh0ZXh0KVxuXG4gICAgcmV0dXJuIG5ld1JhbmdlXG5cbmNsYXNzIFB1dEFmdGVyIGV4dGVuZHMgUHV0QmVmb3JlXG4gIEBleHRlbmQoKVxuICBsb2NhdGlvbjogJ2FmdGVyJ1xuXG5jbGFzcyBQdXRCZWZvcmVXaXRoQXV0b0luZGVudCBleHRlbmRzIFB1dEJlZm9yZVxuICBAZXh0ZW5kKClcblxuICBwYXN0ZUxpbmV3aXNlOiAoc2VsZWN0aW9uLCB0ZXh0KSAtPlxuICAgIG5ld1JhbmdlID0gc3VwZXJcbiAgICBhZGp1c3RJbmRlbnRXaXRoS2VlcGluZ0xheW91dChAZWRpdG9yLCBuZXdSYW5nZSlcbiAgICByZXR1cm4gbmV3UmFuZ2VcblxuY2xhc3MgUHV0QWZ0ZXJXaXRoQXV0b0luZGVudCBleHRlbmRzIFB1dEJlZm9yZVdpdGhBdXRvSW5kZW50XG4gIEBleHRlbmQoKVxuICBsb2NhdGlvbjogJ2FmdGVyJ1xuXG5jbGFzcyBBZGRCbGFua0xpbmVCZWxvdyBleHRlbmRzIE9wZXJhdG9yXG4gIEBleHRlbmQoKVxuICBmbGFzaFRhcmdldDogZmFsc2VcbiAgdGFyZ2V0OiBcIkVtcHR5XCJcbiAgc3RheUF0U2FtZVBvc2l0aW9uOiB0cnVlXG4gIHN0YXlCeU1hcmtlcjogdHJ1ZVxuICB3aGVyZTogJ2JlbG93J1xuXG4gIG11dGF0ZVNlbGVjdGlvbjogKHNlbGVjdGlvbikgLT5cbiAgICByb3cgPSBzZWxlY3Rpb24uZ2V0SGVhZEJ1ZmZlclBvc2l0aW9uKCkucm93XG4gICAgcm93ICs9IDEgaWYgQHdoZXJlIGlzICdiZWxvdydcbiAgICBwb2ludCA9IFtyb3csIDBdXG4gICAgQGVkaXRvci5zZXRUZXh0SW5CdWZmZXJSYW5nZShbcG9pbnQsIHBvaW50XSwgXCJcXG5cIi5yZXBlYXQoQGdldENvdW50KCkpKVxuXG5jbGFzcyBBZGRCbGFua0xpbmVBYm92ZSBleHRlbmRzIEFkZEJsYW5rTGluZUJlbG93XG4gIEBleHRlbmQoKVxuICB3aGVyZTogJ2Fib3ZlJ1xuIl19
