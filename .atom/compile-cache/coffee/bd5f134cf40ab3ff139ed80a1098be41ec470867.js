(function() {
  var AddBlankLineAbove, AddBlankLineBelow, AddPresetOccurrenceFromLastOccurrencePattern, Base, CreatePersistentSelection, Decrease, DecrementNumber, Delete, DeleteLeft, DeleteLine, DeleteRight, DeleteToLastCharacterOfLine, Increase, IncrementNumber, Operator, PutAfter, PutBefore, Select, SelectLatestChange, SelectOccurrence, SelectPersistentSelection, SelectPreviousSelection, TogglePersistentSelection, TogglePresetOccurrence, TogglePresetSubwordOccurrence, Yank, YankLine, YankToLastCharacterOfLine, _, assertWithException, ensureEndsWithNewLineForBufferRow, getSubwordPatternAtBufferPosition, getWordPatternAtBufferPosition, haveSomeNonEmptySelection, insertTextAtBufferPosition, isEmptyRow, moveCursorToFirstCharacterAtRow, ref, setBufferRow, swrap,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  _ = require('underscore-plus');

  ref = require('./utils'), haveSomeNonEmptySelection = ref.haveSomeNonEmptySelection, isEmptyRow = ref.isEmptyRow, getWordPatternAtBufferPosition = ref.getWordPatternAtBufferPosition, getSubwordPatternAtBufferPosition = ref.getSubwordPatternAtBufferPosition, insertTextAtBufferPosition = ref.insertTextAtBufferPosition, setBufferRow = ref.setBufferRow, moveCursorToFirstCharacterAtRow = ref.moveCursorToFirstCharacterAtRow, ensureEndsWithNewLineForBufferRow = ref.ensureEndsWithNewLineForBufferRow, assertWithException = ref.assertWithException;

  swrap = require('./selection-wrapper');

  Base = require('./base');

  Operator = (function(superClass) {
    extend(Operator, superClass);

    Operator.extend(false);

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
      return this.supportEarlySelect && !this.isRepeated();
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
      return this.vimState.mark.setRange('[', ']', range);
    };

    Operator.prototype.needFlash = function() {
      var ref1;
      if (!this.flashTarget) {
        return;
      }
      if (!this.getConfig('flashOnOperate')) {
        return;
      }
      if (ref1 = this.getName(), indexOf.call(this.getConfig('flashOnOperateBlacklist'), ref1) >= 0) {
        return;
      }
      return (this.mode !== 'visual') || (this.submode !== this.target.wise);
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
            return _this.vimState.flash(_this.mutationManager.getBufferRangesForCheckpoint(_this.flashCheckpoint), {
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
          if (range = _this.mutationManager.getMutatedBufferRange(_this.editor.getLastSelection())) {
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
      if (this.mode === 'visual') {
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
      this.target.setOperator(this);
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
        return this.vimState.register.set({
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
      if (this.isRepeated() && this.occurrence && !this.occurrenceManager.hasMarkers()) {
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
          swrap.clearProperties(this.editor);
          this.occurrenceSelected = true;
          this.mutationManager.setCheckpoint('did-select-occurrence');
        }
      }
      if (haveSomeNonEmptySelection(this.editor) || this.target.getName() === "Empty") {
        this.emitDidSelectTarget();
        this.flashChangeIfNecessary();
        this.trackChangeIfNecessary();
        this.targetSelected = true;
        return true;
      } else {
        this.emitDidFailSelectTarget();
        this.targetSelected = false;
        return false;
      }
    };

    Operator.prototype.restoreCursorPositionsIfNecessary = function() {
      var ref1, stay, wise;
      if (!this.restorePositions) {
        return;
      }
      stay = ((ref1 = this.stayAtSamePosition) != null ? ref1 : this.getConfig(this.stayOptionName)) || (this.occurrenceSelected && this.getConfig('stayOnOccurrence'));
      wise = this.target.wise;
      this.mutationManager.restoreCursorPositions({
        stay: stay,
        wise: wise,
        occurrenceSelected: this.occurrenceSelected,
        setToFirstCharacterOnLinewise: this.setToFirstCharacterOnLinewise
      });
      return this.emitDidRestoreCursorPositions({
        stay: stay
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

    TogglePresetOccurrence.prototype.flashTarget = false;

    TogglePresetOccurrence.prototype.requireTarget = false;

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
        if (this.getConfig('flashOnOperate') && (ref1 = this.getName(), indexOf.call(this.getConfig('flashOnOperateBlacklist'), ref1) < 0)) {
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
          if (_this.getConfig('flashOnOperate') && (ref2 = _this.getName(), indexOf.call(_this.getConfig('flashOnOperateBlacklist'), ref2) < 0)) {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvb3BlcmF0b3IuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSw2dUJBQUE7SUFBQTs7Ozs7RUFBQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSOztFQUNKLE1BVUksT0FBQSxDQUFRLFNBQVIsQ0FWSixFQUNFLHlEQURGLEVBRUUsMkJBRkYsRUFHRSxtRUFIRixFQUlFLHlFQUpGLEVBS0UsMkRBTEYsRUFNRSwrQkFORixFQU9FLHFFQVBGLEVBUUUseUVBUkYsRUFTRTs7RUFFRixLQUFBLEdBQVEsT0FBQSxDQUFRLHFCQUFSOztFQUNSLElBQUEsR0FBTyxPQUFBLENBQVEsUUFBUjs7RUFFRDs7O0lBQ0osUUFBQyxDQUFBLE1BQUQsQ0FBUSxLQUFSOzt1QkFDQSxhQUFBLEdBQWU7O3VCQUNmLFVBQUEsR0FBWTs7dUJBRVosSUFBQSxHQUFNOzt1QkFDTixVQUFBLEdBQVk7O3VCQUNaLGNBQUEsR0FBZ0I7O3VCQUVoQixXQUFBLEdBQWE7O3VCQUNiLGVBQUEsR0FBaUI7O3VCQUNqQixTQUFBLEdBQVc7O3VCQUNYLHNCQUFBLEdBQXdCOzt1QkFDeEIsV0FBQSxHQUFhOzt1QkFFYixvQkFBQSxHQUFzQjs7dUJBQ3RCLGtCQUFBLEdBQW9COzt1QkFDcEIsY0FBQSxHQUFnQjs7dUJBQ2hCLFlBQUEsR0FBYzs7dUJBQ2QsZ0JBQUEsR0FBa0I7O3VCQUNsQiw2QkFBQSxHQUErQjs7dUJBRS9CLHNCQUFBLEdBQXdCOzt1QkFDeEIseUJBQUEsR0FBMkI7O3VCQUUzQix5QkFBQSxHQUEyQjs7dUJBQzNCLHFCQUFBLEdBQXVCOzt1QkFJdkIsa0JBQUEsR0FBb0I7O3VCQUNwQixjQUFBLEdBQWdCOzt1QkFDaEIsY0FBQSxHQUFnQixTQUFBO2FBQ2QsSUFBQyxDQUFBLGtCQUFELElBQXdCLENB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R0FBUSxDQUFDLEdBQUQsRUFBTSxDQUFOO2FBQ1IsSUFBQyxDQUFBLE1BQU0sQ0FBQyxvQkFBUixDQUE2QixDQUFDLEtBQUQsRUFBUSxLQUFSLENBQTdCLEVBQTZDLElBQUksQ0FBQyxNQUFMLENBQVksSUFBQyxDQUFBLFFBQUQsQ0FBQSxDQUFaLENBQTdDO0lBSmU7Ozs7S0FSYTs7RUFjMUI7Ozs7Ozs7SUFDSixpQkFBQyxDQUFBLE1BQUQsQ0FBQTs7Z0NBQ0EsS0FBQSxHQUFPOzs7O0tBRnVCO0FBM25CaEMiLCJzb3VyY2VzQ29udGVudCI6WyJfID0gcmVxdWlyZSAndW5kZXJzY29yZS1wbHVzJ1xue1xuICBoYXZlU29tZU5vbkVtcHR5U2VsZWN0aW9uXG4gIGlzRW1wdHlSb3dcbiAgZ2V0V29yZFBhdHRlcm5BdEJ1ZmZlclBvc2l0aW9uXG4gIGdldFN1YndvcmRQYXR0ZXJuQXRCdWZmZXJQb3NpdGlvblxuICBpbnNlcnRUZXh0QXRCdWZmZXJQb3NpdGlvblxuICBzZXRCdWZmZXJSb3dcbiAgbW92ZUN1cnNvclRvRmlyc3RDaGFyYWN0ZXJBdFJvd1xuICBlbnN1cmVFbmRzV2l0aE5ld0xpbmVGb3JCdWZmZXJSb3dcbiAgYXNzZXJ0V2l0aEV4Y2VwdGlvblxufSA9IHJlcXVpcmUgJy4vdXRpbHMnXG5zd3JhcCA9IHJlcXVpcmUgJy4vc2VsZWN0aW9uLXdyYXBwZXInXG5CYXNlID0gcmVxdWlyZSAnLi9iYXNlJ1xuXG5jbGFzcyBPcGVyYXRvciBleHRlbmRzIEJhc2VcbiAgQGV4dGVuZChmYWxzZSlcbiAgcmVxdWlyZVRhcmdldDogdHJ1ZVxuICByZWNvcmRhYmxlOiB0cnVlXG5cbiAgd2lzZTogbnVsbFxuICBvY2N1cnJlbmNlOiBmYWxzZVxuICBvY2N1cnJlbmNlVHlwZTogJ2Jhc2UnXG5cbiAgZmxhc2hUYXJnZXQ6IHRydWVcbiAgZmxhc2hDaGVja3BvaW50OiAnZGlkLWZpbmlzaCdcbiAgZmxhc2hUeXBlOiAnb3BlcmF0b3InXG4gIGZsYXNoVHlwZUZvck9jY3VycmVuY2U6ICdvcGVyYXRvci1vY2N1cnJlbmNlJ1xuICB0cmFja0NoYW5nZTogZmFsc2VcblxuICBwYXR0ZXJuRm9yT2NjdXJyZW5jZTogbnVsbFxuICBzdGF5QXRTYW1lUG9zaXRpb246IG51bGxcbiAgc3RheU9wdGlvbk5hbWU6IG51bGxcbiAgc3RheUJ5TWFya2VyOiBmYWxzZVxuICByZXN0b3JlUG9zaXRpb25zOiB0cnVlXG4gIHNldFRvRmlyc3RDaGFyYWN0ZXJPbkxpbmV3aXNlOiBmYWxzZVxuXG4gIGFjY2VwdFByZXNldE9jY3VycmVuY2U6IHRydWVcbiAgYWNjZXB0UGVyc2lzdGVudFNlbGVjdGlvbjogdHJ1ZVxuXG4gIGJ1ZmZlckNoZWNrcG9pbnRCeVB1cnBvc2U6IG51bGxcbiAgbXV0YXRlU2VsZWN0aW9uT3JkZXJkOiBmYWxzZVxuXG4gICMgRXhwZXJpbWVudGFseSBhbGxvdyBzZWxlY3RUYXJnZXQgYmVmb3JlIGlucHV0IENvbXBsZXRlXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBzdXBwb3J0RWFybHlTZWxlY3Q6IGZhbHNlXG4gIHRhcmdldFNlbGVjdGVkOiBudWxsXG4gIGNhbkVhcmx5U2VsZWN0OiAtPlxuICAgIEBzdXBwb3J0RWFybHlTZWxlY3QgYW5kIG5vdCBAaXNSZXBlYXRlZCgpXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gICMgQ2FsbGVkIHdoZW4gb3BlcmF0aW9uIGZpbmlzaGVkXG4gICMgVGhpcyBpcyBlc3NlbnRpYWxseSB0byByZXNldCBzdGF0ZSBmb3IgYC5gIHJlcGVhdC5cbiAgcmVzZXRTdGF0ZTogLT5cbiAgICBAdGFyZ2V0U2VsZWN0ZWQgPSBudWxsXG4gICAgQG9jY3VycmVuY2VTZWxlY3RlZCA9IGZhbHNlXG5cbiAgIyBUd28gY2hlY2twb2ludCBmb3IgZGlmZmVyZW50IHB1cnBvc2VcbiAgIyAtIG9uZSBmb3IgdW5kbyhoYW5kbGVkIGJ5IG1vZGVNYW5hZ2VyKVxuICAjIC0gb25lIGZvciBwcmVzZXJ2ZSBsYXN0IGluc2VydGVkIHRleHRcbiAgY3JlYXRlQnVmZmVyQ2hlY2twb2ludDogKHB1cnBvc2UpIC0+XG4gICAgQGJ1ZmZlckNoZWNrcG9pbnRCeVB1cnBvc2UgPz0ge31cbiAgICBAYnVmZmVyQ2hlY2twb2ludEJ5UHVycG9zZVtwdXJwb3NlXSA9IEBlZGl0b3IuY3JlYXRlQ2hlY2twb2ludCgpXG5cbiAgZ2V0QnVmZmVyQ2hlY2twb2ludDogKHB1cnBvc2UpIC0+XG4gICAgQGJ1ZmZlckNoZWNrcG9pbnRCeVB1cnBvc2U/W3B1cnBvc2VdXG5cbiAgZGVsZXRlQnVmZmVyQ2hlY2twb2ludDogKHB1cnBvc2UpIC0+XG4gICAgaWYgQGJ1ZmZlckNoZWNrcG9pbnRCeVB1cnBvc2U/XG4gICAgICBkZWxldGUgQGJ1ZmZlckNoZWNrcG9pbnRCeVB1cnBvc2VbcHVycG9zZV1cblxuICBncm91cENoYW5nZXNTaW5jZUJ1ZmZlckNoZWNrcG9pbnQ6IChwdXJwb3NlKSAtPlxuICAgIGlmIGNoZWNrcG9pbnQgPSBAZ2V0QnVmZmVyQ2hlY2twb2ludChwdXJwb3NlKVxuICAgICAgQGVkaXRvci5ncm91cENoYW5nZXNTaW5jZUNoZWNrcG9pbnQoY2hlY2twb2ludClcbiAgICAgIEBkZWxldGVCdWZmZXJDaGVja3BvaW50KHB1cnBvc2UpXG5cbiAgc2V0TWFya0ZvckNoYW5nZTogKHJhbmdlKSAtPlxuICAgIEB2aW1TdGF0ZS5tYXJrLnNldFJhbmdlKCdbJywgJ10nLCByYW5nZSlcblxuICBuZWVkRmxhc2g6IC0+XG4gICAgcmV0dXJuIHVubGVzcyBAZmxhc2hUYXJnZXRcbiAgICByZXR1cm4gdW5sZXNzIEBnZXRDb25maWcoJ2ZsYXNoT25PcGVyYXRlJylcbiAgICByZXR1cm4gaWYgQGdldE5hbWUoKSBpbiBAZ2V0Q29uZmlnKCdmbGFzaE9uT3BlcmF0ZUJsYWNrbGlzdCcpXG4gICAgKEBtb2RlIGlzbnQgJ3Zpc3VhbCcpIG9yIChAc3VibW9kZSBpc250IEB0YXJnZXQud2lzZSkgIyBlLmcuIFkgaW4gdkNcblxuICBmbGFzaElmTmVjZXNzYXJ5OiAocmFuZ2VzKSAtPlxuICAgIGlmIEBuZWVkRmxhc2goKVxuICAgICAgQHZpbVN0YXRlLmZsYXNoKHJhbmdlcywgdHlwZTogQGdldEZsYXNoVHlwZSgpKVxuXG4gIGZsYXNoQ2hhbmdlSWZOZWNlc3Nhcnk6IC0+XG4gICAgaWYgQG5lZWRGbGFzaCgpXG4gICAgICBAb25EaWRGaW5pc2hPcGVyYXRpb24gPT5cbiAgICAgICAgQHZpbVN0YXRlLmZsYXNoKEBtdXRhdGlvbk1hbmFnZXIuZ2V0QnVmZmVyUmFuZ2VzRm9yQ2hlY2twb2ludChAZmxhc2hDaGVja3BvaW50KSwgdHlwZTogQGdldEZsYXNoVHlwZSgpKVxuXG4gIGdldEZsYXNoVHlwZTogLT5cbiAgICBpZiBAb2NjdXJyZW5jZVNlbGVjdGVkXG4gICAgICBAZmxhc2hUeXBlRm9yT2NjdXJyZW5jZVxuICAgIGVsc2VcbiAgICAgIEBmbGFzaFR5cGVcblxuICB0cmFja0NoYW5nZUlmTmVjZXNzYXJ5OiAtPlxuICAgIHJldHVybiB1bmxlc3MgQHRyYWNrQ2hhbmdlXG5cbiAgICBAb25EaWRGaW5pc2hPcGVyYXRpb24gPT5cbiAgICAgIGlmIHJhbmdlID0gQG11dGF0aW9uTWFuYWdlci5nZXRNdXRhdGVkQnVmZmVyUmFuZ2UoQGVkaXRvci5nZXRMYXN0U2VsZWN0aW9uKCkpXG4gICAgICAgIEBzZXRNYXJrRm9yQ2hhbmdlKHJhbmdlKVxuXG4gIGNvbnN0cnVjdG9yOiAtPlxuICAgIHN1cGVyXG4gICAge0BtdXRhdGlvbk1hbmFnZXIsIEBvY2N1cnJlbmNlTWFuYWdlciwgQHBlcnNpc3RlbnRTZWxlY3Rpb259ID0gQHZpbVN0YXRlXG4gICAgQHN1YnNjcmliZVJlc2V0T2NjdXJyZW5jZVBhdHRlcm5JZk5lZWRlZCgpXG4gICAgQGluaXRpYWxpemUoKVxuICAgIEBvbkRpZFNldE9wZXJhdG9yTW9kaWZpZXIoQHNldE1vZGlmaWVyLmJpbmQodGhpcykpXG5cbiAgICAjIFdoZW4gcHJlc2V0LW9jY3VycmVuY2Ugd2FzIGV4aXN0cywgb3BlcmF0ZSBvbiBvY2N1cnJlbmNlLXdpc2VcbiAgICBpZiBAYWNjZXB0UHJlc2V0T2NjdXJyZW5jZSBhbmQgQG9jY3VycmVuY2VNYW5hZ2VyLmhhc01hcmtlcnMoKVxuICAgICAgQG9jY3VycmVuY2UgPSB0cnVlXG5cbiAgICAjIFtGSVhNRV0gT1JERVItTUFUVEVSXG4gICAgIyBUbyBwaWNrIGN1cnNvci13b3JkIHRvIGZpbmQgb2NjdXJyZW5jZSBiYXNlIHBhdHRlcm4uXG4gICAgIyBUaGlzIGhhcyB0byBiZSBkb25lIEJFRk9SRSBjb252ZXJ0aW5nIHBlcnNpc3RlbnQtc2VsZWN0aW9uIGludG8gcmVhbC1zZWxlY3Rpb24uXG4gICAgIyBTaW5jZSB3aGVuIHBlcnNpc3RlbnQtc2VsZWN0aW9uIGlzIGFjdHVhbGwgc2VsZWN0ZWQsIGl0IGNoYW5nZSBjdXJzb3IgcG9zaXRpb24uXG4gICAgaWYgQG9jY3VycmVuY2UgYW5kIG5vdCBAb2NjdXJyZW5jZU1hbmFnZXIuaGFzTWFya2VycygpXG4gICAgICBAb2NjdXJyZW5jZU1hbmFnZXIuYWRkUGF0dGVybihAcGF0dGVybkZvck9jY3VycmVuY2UgPyBAZ2V0UGF0dGVybkZvck9jY3VycmVuY2VUeXBlKEBvY2N1cnJlbmNlVHlwZSkpXG5cbiAgICAjIFRoaXMgY2hhbmdlIGN1cnNvciBwb3NpdGlvbi5cbiAgICBpZiBAc2VsZWN0UGVyc2lzdGVudFNlbGVjdGlvbklmTmVjZXNzYXJ5KClcbiAgICAgICMgW0ZJWE1FXSBzZWxlY3Rpb24td2lzZSBpcyBub3Qgc3luY2hlZCBpZiBpdCBhbHJlYWR5IHZpc3VhbC1tb2RlXG4gICAgICB1bmxlc3MgQG1vZGUgaXMgJ3Zpc3VhbCdcbiAgICAgICAgQHZpbVN0YXRlLm1vZGVNYW5hZ2VyLmFjdGl2YXRlKCd2aXN1YWwnLCBzd3JhcC5kZXRlY3RXaXNlKEBlZGl0b3IpKVxuXG4gICAgQHRhcmdldCA9ICdDdXJyZW50U2VsZWN0aW9uJyBpZiBAbW9kZSBpcyAndmlzdWFsJ1xuICAgIEBzZXRUYXJnZXQoQG5ldyhAdGFyZ2V0KSkgaWYgXy5pc1N0cmluZyhAdGFyZ2V0KVxuXG4gIHN1YnNjcmliZVJlc2V0T2NjdXJyZW5jZVBhdHRlcm5JZk5lZWRlZDogLT5cbiAgICAjIFtDQVVUSU9OXVxuICAgICMgVGhpcyBtZXRob2QgaGFzIHRvIGJlIGNhbGxlZCBpbiBQUk9QRVIgdGltaW5nLlxuICAgICMgSWYgb2NjdXJyZW5jZSBpcyB0cnVlIGJ1dCBubyBwcmVzZXQtb2NjdXJyZW5jZVxuICAgICMgVHJlYXQgdGhhdCBgb2NjdXJyZW5jZWAgaXMgQk9VTkRFRCB0byBvcGVyYXRvciBpdHNlbGYsIHNvIGNsZWFucCBhdCBmaW5pc2hlZC5cbiAgICBpZiBAb2NjdXJyZW5jZSBhbmQgbm90IEBvY2N1cnJlbmNlTWFuYWdlci5oYXNNYXJrZXJzKClcbiAgICAgIEBvbkRpZFJlc2V0T3BlcmF0aW9uU3RhY2soPT4gQG9jY3VycmVuY2VNYW5hZ2VyLnJlc2V0UGF0dGVybnMoKSlcblxuICBzZXRNb2RpZmllcjogKG9wdGlvbnMpIC0+XG4gICAgaWYgb3B0aW9ucy53aXNlP1xuICAgICAgQHdpc2UgPSBvcHRpb25zLndpc2VcbiAgICAgIHJldHVyblxuXG4gICAgaWYgb3B0aW9ucy5vY2N1cnJlbmNlP1xuICAgICAgQG9jY3VycmVuY2UgPSBvcHRpb25zLm9jY3VycmVuY2VcbiAgICAgIGlmIEBvY2N1cnJlbmNlXG4gICAgICAgIEBvY2N1cnJlbmNlVHlwZSA9IG9wdGlvbnMub2NjdXJyZW5jZVR5cGVcbiAgICAgICAgIyBUaGlzIGlzIG8gbW9kaWZpZXIgY2FzZShlLmcuIGBjIG8gcGAsIGBkIE8gZmApXG4gICAgICAgICMgV2UgUkVTRVQgZXhpc3Rpbmcgb2NjdXJlbmNlLW1hcmtlciB3aGVuIGBvYCBvciBgT2AgbW9kaWZpZXIgaXMgdHlwZWQgYnkgdXNlci5cbiAgICAgICAgcGF0dGVybiA9IEBnZXRQYXR0ZXJuRm9yT2NjdXJyZW5jZVR5cGUoQG9jY3VycmVuY2VUeXBlKVxuICAgICAgICBAb2NjdXJyZW5jZU1hbmFnZXIuYWRkUGF0dGVybihwYXR0ZXJuLCB7cmVzZXQ6IHRydWUsIEBvY2N1cnJlbmNlVHlwZX0pXG4gICAgICAgIEBvbkRpZFJlc2V0T3BlcmF0aW9uU3RhY2soPT4gQG9jY3VycmVuY2VNYW5hZ2VyLnJlc2V0UGF0dGVybnMoKSlcblxuICAjIHJldHVybiB0cnVlL2ZhbHNlIHRvIGluZGljYXRlIHN1Y2Nlc3NcbiAgc2VsZWN0UGVyc2lzdGVudFNlbGVjdGlvbklmTmVjZXNzYXJ5OiAtPlxuICAgIGlmIEBhY2NlcHRQZXJzaXN0ZW50U2VsZWN0aW9uIGFuZFxuICAgICAgICBAZ2V0Q29uZmlnKCdhdXRvU2VsZWN0UGVyc2lzdGVudFNlbGVjdGlvbk9uT3BlcmF0ZScpIGFuZFxuICAgICAgICBub3QgQHBlcnNpc3RlbnRTZWxlY3Rpb24uaXNFbXB0eSgpXG5cbiAgICAgIEBwZXJzaXN0ZW50U2VsZWN0aW9uLnNlbGVjdCgpXG4gICAgICBAZWRpdG9yLm1lcmdlSW50ZXJzZWN0aW5nU2VsZWN0aW9ucygpXG4gICAgICBmb3IgJHNlbGVjdGlvbiBpbiBzd3JhcC5nZXRTZWxlY3Rpb25zKEBlZGl0b3IpIHdoZW4gbm90ICRzZWxlY3Rpb24uaGFzUHJvcGVydGllcygpXG4gICAgICAgICRzZWxlY3Rpb24uc2F2ZVByb3BlcnRpZXMoKVxuICAgICAgdHJ1ZVxuICAgIGVsc2VcbiAgICAgIGZhbHNlXG5cbiAgZ2V0UGF0dGVybkZvck9jY3VycmVuY2VUeXBlOiAob2NjdXJyZW5jZVR5cGUpIC0+XG4gICAgc3dpdGNoIG9jY3VycmVuY2VUeXBlXG4gICAgICB3aGVuICdiYXNlJ1xuICAgICAgICBnZXRXb3JkUGF0dGVybkF0QnVmZmVyUG9zaXRpb24oQGVkaXRvciwgQGdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCkpXG4gICAgICB3aGVuICdzdWJ3b3JkJ1xuICAgICAgICBnZXRTdWJ3b3JkUGF0dGVybkF0QnVmZmVyUG9zaXRpb24oQGVkaXRvciwgQGdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCkpXG5cbiAgIyB0YXJnZXQgaXMgVGV4dE9iamVjdCBvciBNb3Rpb24gdG8gb3BlcmF0ZSBvbi5cbiAgc2V0VGFyZ2V0OiAoQHRhcmdldCkgLT5cbiAgICBAdGFyZ2V0LnNldE9wZXJhdG9yKHRoaXMpXG4gICAgQGVtaXREaWRTZXRUYXJnZXQodGhpcylcblxuICAgIGlmIEBjYW5FYXJseVNlbGVjdCgpXG4gICAgICBAbm9ybWFsaXplU2VsZWN0aW9uc0lmTmVjZXNzYXJ5KClcbiAgICAgIEBjcmVhdGVCdWZmZXJDaGVja3BvaW50KCd1bmRvJylcbiAgICAgIEBzZWxlY3RUYXJnZXQoKVxuICAgIHRoaXNcblxuICBzZXRUZXh0VG9SZWdpc3RlckZvclNlbGVjdGlvbjogKHNlbGVjdGlvbikgLT5cbiAgICBAc2V0VGV4dFRvUmVnaXN0ZXIoc2VsZWN0aW9uLmdldFRleHQoKSwgc2VsZWN0aW9uKVxuXG4gIHNldFRleHRUb1JlZ2lzdGVyOiAodGV4dCwgc2VsZWN0aW9uKSAtPlxuICAgIHRleHQgKz0gXCJcXG5cIiBpZiAoQHRhcmdldC5pc0xpbmV3aXNlKCkgYW5kIChub3QgdGV4dC5lbmRzV2l0aCgnXFxuJykpKVxuICAgIEB2aW1TdGF0ZS5yZWdpc3Rlci5zZXQoe3RleHQsIHNlbGVjdGlvbn0pIGlmIHRleHRcblxuICBub3JtYWxpemVTZWxlY3Rpb25zSWZOZWNlc3Nhcnk6IC0+XG4gICAgaWYgQHRhcmdldD8uaXNNb3Rpb24oKSBhbmQgKEBtb2RlIGlzICd2aXN1YWwnKVxuICAgICAgc3dyYXAubm9ybWFsaXplKEBlZGl0b3IpXG5cbiAgc3RhcnRNdXRhdGlvbjogKGZuKSAtPlxuICAgIGlmIEBjYW5FYXJseVNlbGVjdCgpXG4gICAgICAjIC0gU2tpcCBzZWxlY3Rpb24gbm9ybWFsaXphdGlvbjogYWxyZWFkeSBub3JtYWxpemVkIGJlZm9yZSBAc2VsZWN0VGFyZ2V0KClcbiAgICAgICMgLSBNYW51YWwgY2hlY2twb2ludCBncm91cGluZzogdG8gY3JlYXRlIGNoZWNrcG9pbnQgYmVmb3JlIEBzZWxlY3RUYXJnZXQoKVxuICAgICAgZm4oKVxuICAgICAgQGVtaXRXaWxsRmluaXNoTXV0YXRpb24oKVxuICAgICAgQGdyb3VwQ2hhbmdlc1NpbmNlQnVmZmVyQ2hlY2twb2ludCgndW5kbycpXG5cbiAgICBlbHNlXG4gICAgICBAbm9ybWFsaXplU2VsZWN0aW9uc0lmTmVjZXNzYXJ5KClcbiAgICAgIEBlZGl0b3IudHJhbnNhY3QgPT5cbiAgICAgICAgZm4oKVxuICAgICAgICBAZW1pdFdpbGxGaW5pc2hNdXRhdGlvbigpXG5cbiAgICBAZW1pdERpZEZpbmlzaE11dGF0aW9uKClcblxuICAjIE1haW5cbiAgZXhlY3V0ZTogLT5cbiAgICBAc3RhcnRNdXRhdGlvbiA9PlxuICAgICAgaWYgQHNlbGVjdFRhcmdldCgpXG4gICAgICAgIGlmIEBtdXRhdGVTZWxlY3Rpb25PcmRlcmRcbiAgICAgICAgICBzZWxlY3Rpb25zID0gQGVkaXRvci5nZXRTZWxlY3Rpb25zT3JkZXJlZEJ5QnVmZmVyUG9zaXRpb24oKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgc2VsZWN0aW9ucyA9IEBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpXG4gICAgICAgIGZvciBzZWxlY3Rpb24gaW4gc2VsZWN0aW9uc1xuICAgICAgICAgIEBtdXRhdGVTZWxlY3Rpb24oc2VsZWN0aW9uKVxuICAgICAgICBAbXV0YXRpb25NYW5hZ2VyLnNldENoZWNrcG9pbnQoJ2RpZC1maW5pc2gnKVxuICAgICAgICBAcmVzdG9yZUN1cnNvclBvc2l0aW9uc0lmTmVjZXNzYXJ5KClcblxuICAgICMgRXZlbiB0aG91Z2ggd2UgZmFpbCB0byBzZWxlY3QgdGFyZ2V0IGFuZCBmYWlsIHRvIG11dGF0ZSxcbiAgICAjIHdlIGhhdmUgdG8gcmV0dXJuIHRvIG5vcm1hbC1tb2RlIGZyb20gb3BlcmF0b3ItcGVuZGluZyBvciB2aXN1YWxcbiAgICBAYWN0aXZhdGVNb2RlKCdub3JtYWwnKVxuXG4gICMgUmV0dXJuIHRydWUgdW5sZXNzIGFsbCBzZWxlY3Rpb24gaXMgZW1wdHkuXG4gIHNlbGVjdFRhcmdldDogLT5cbiAgICByZXR1cm4gQHRhcmdldFNlbGVjdGVkIGlmIEB0YXJnZXRTZWxlY3RlZD9cbiAgICBAbXV0YXRpb25NYW5hZ2VyLmluaXQoe0BzdGF5QnlNYXJrZXJ9KVxuXG4gICAgQHRhcmdldC5mb3JjZVdpc2UoQHdpc2UpIGlmIEB3aXNlP1xuICAgIEBlbWl0V2lsbFNlbGVjdFRhcmdldCgpXG5cbiAgICAjIEFsbG93IGN1cnNvciBwb3NpdGlvbiBhZGp1c3RtZW50ICdvbi13aWxsLXNlbGVjdC10YXJnZXQnIGhvb2suXG4gICAgIyBzbyBjaGVja3BvaW50IGNvbWVzIEFGVEVSIEBlbWl0V2lsbFNlbGVjdFRhcmdldCgpXG4gICAgQG11dGF0aW9uTWFuYWdlci5zZXRDaGVja3BvaW50KCd3aWxsLXNlbGVjdCcpXG5cbiAgICAjIE5PVEVcbiAgICAjIFNpbmNlIE1vdmVUb05leHRPY2N1cnJlbmNlLCBNb3ZlVG9QcmV2aW91c09jY3VycmVuY2UgbW90aW9uIG1vdmUgYnlcbiAgICAjICBvY2N1cnJlbmNlLW1hcmtlciwgb2NjdXJyZW5jZS1tYXJrZXIgaGFzIHRvIGJlIGNyZWF0ZWQgQkVGT1JFIGBAdGFyZ2V0LmV4ZWN1dGUoKWBcbiAgICAjIEFuZCB3aGVuIHJlcGVhdGVkLCBvY2N1cnJlbmNlIHBhdHRlcm4gaXMgYWxyZWFkeSBjYWNoZWQgYXQgQHBhdHRlcm5Gb3JPY2N1cnJlbmNlXG4gICAgaWYgQGlzUmVwZWF0ZWQoKSBhbmQgQG9jY3VycmVuY2UgYW5kIG5vdCBAb2NjdXJyZW5jZU1hbmFnZXIuaGFzTWFya2VycygpXG4gICAgICBAb2NjdXJyZW5jZU1hbmFnZXIuYWRkUGF0dGVybihAcGF0dGVybkZvck9jY3VycmVuY2UsIHtAb2NjdXJyZW5jZVR5cGV9KVxuXG4gICAgQHRhcmdldC5leGVjdXRlKClcblxuICAgIEBtdXRhdGlvbk1hbmFnZXIuc2V0Q2hlY2twb2ludCgnZGlkLXNlbGVjdCcpXG4gICAgaWYgQG9jY3VycmVuY2VcbiAgICAgICMgVG8gcmVwb2VhdChgLmApIG9wZXJhdGlvbiB3aGVyZSBtdWx0aXBsZSBvY2N1cnJlbmNlIHBhdHRlcm5zIHdhcyBzZXQuXG4gICAgICAjIEhlcmUgd2Ugc2F2ZSBwYXR0ZXJucyB3aGljaCByZXByZXNlbnQgdW5pb25lZCByZWdleCB3aGljaCBAb2NjdXJyZW5jZU1hbmFnZXIga25vd3MuXG4gICAgICBAcGF0dGVybkZvck9jY3VycmVuY2UgPz0gQG9jY3VycmVuY2VNYW5hZ2VyLmJ1aWxkUGF0dGVybigpXG5cbiAgICAgIGlmIEBvY2N1cnJlbmNlTWFuYWdlci5zZWxlY3QoKVxuICAgICAgICAjIFRvIHNraXAgcmVzdG9yZWluZyBwb3NpdGlvbiBmcm9tIHNlbGVjdGlvbiBwcm9wIHdoZW4gc2hpZnQgdmlzdWFsLW1vZGUgc3VibW9kZSBvbiBTZWxlY3RPY2N1cnJlbmNlXG4gICAgICAgIHN3cmFwLmNsZWFyUHJvcGVydGllcyhAZWRpdG9yKVxuXG4gICAgICAgIEBvY2N1cnJlbmNlU2VsZWN0ZWQgPSB0cnVlXG4gICAgICAgIEBtdXRhdGlvbk1hbmFnZXIuc2V0Q2hlY2twb2ludCgnZGlkLXNlbGVjdC1vY2N1cnJlbmNlJylcblxuICAgIGlmIGhhdmVTb21lTm9uRW1wdHlTZWxlY3Rpb24oQGVkaXRvcikgb3IgQHRhcmdldC5nZXROYW1lKCkgaXMgXCJFbXB0eVwiXG4gICAgICBAZW1pdERpZFNlbGVjdFRhcmdldCgpXG4gICAgICBAZmxhc2hDaGFuZ2VJZk5lY2Vzc2FyeSgpXG4gICAgICBAdHJhY2tDaGFuZ2VJZk5lY2Vzc2FyeSgpXG4gICAgICBAdGFyZ2V0U2VsZWN0ZWQgPSB0cnVlXG4gICAgICB0cnVlXG4gICAgZWxzZVxuICAgICAgQGVtaXREaWRGYWlsU2VsZWN0VGFyZ2V0KClcbiAgICAgIEB0YXJnZXRTZWxlY3RlZCA9IGZhbHNlXG4gICAgICBmYWxzZVxuXG4gIHJlc3RvcmVDdXJzb3JQb3NpdGlvbnNJZk5lY2Vzc2FyeTogLT5cbiAgICByZXR1cm4gdW5sZXNzIEByZXN0b3JlUG9zaXRpb25zXG4gICAgc3RheSA9IEBzdGF5QXRTYW1lUG9zaXRpb24gPyBAZ2V0Q29uZmlnKEBzdGF5T3B0aW9uTmFtZSkgb3IgKEBvY2N1cnJlbmNlU2VsZWN0ZWQgYW5kIEBnZXRDb25maWcoJ3N0YXlPbk9jY3VycmVuY2UnKSlcbiAgICB3aXNlID0gQHRhcmdldC53aXNlXG4gICAgQG11dGF0aW9uTWFuYWdlci5yZXN0b3JlQ3Vyc29yUG9zaXRpb25zKHtzdGF5LCB3aXNlLCBAb2NjdXJyZW5jZVNlbGVjdGVkLCBAc2V0VG9GaXJzdENoYXJhY3Rlck9uTGluZXdpc2V9KVxuICAgIEBlbWl0RGlkUmVzdG9yZUN1cnNvclBvc2l0aW9ucyh7c3RheX0pXG5cbiMgU2VsZWN0XG4jIFdoZW4gdGV4dC1vYmplY3QgaXMgaW52b2tlZCBmcm9tIG5vcm1hbCBvciB2aXVzYWwtbW9kZSwgb3BlcmF0aW9uIHdvdWxkIGJlXG4jICA9PiBTZWxlY3Qgb3BlcmF0b3Igd2l0aCB0YXJnZXQ9dGV4dC1vYmplY3RcbiMgV2hlbiBtb3Rpb24gaXMgaW52b2tlZCBmcm9tIHZpc3VhbC1tb2RlLCBvcGVyYXRpb24gd291bGQgYmVcbiMgID0+IFNlbGVjdCBvcGVyYXRvciB3aXRoIHRhcmdldD1tb3Rpb24pXG4jID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5jbGFzcyBTZWxlY3QgZXh0ZW5kcyBPcGVyYXRvclxuICBAZXh0ZW5kKGZhbHNlKVxuICBmbGFzaFRhcmdldDogZmFsc2VcbiAgcmVjb3JkYWJsZTogZmFsc2VcbiAgYWNjZXB0UHJlc2V0T2NjdXJyZW5jZTogZmFsc2VcbiAgYWNjZXB0UGVyc2lzdGVudFNlbGVjdGlvbjogZmFsc2VcblxuICBleGVjdXRlOiAtPlxuICAgIEBzdGFydE11dGF0aW9uKEBzZWxlY3RUYXJnZXQuYmluZCh0aGlzKSlcblxuICAgIGlmIEB0YXJnZXQuaXNUZXh0T2JqZWN0KCkgYW5kIEB0YXJnZXQuc2VsZWN0U3VjY2VlZGVkXG4gICAgICBAZWRpdG9yLnNjcm9sbFRvQ3Vyc29yUG9zaXRpb24oKVxuICAgICAgQGFjdGl2YXRlTW9kZUlmTmVjZXNzYXJ5KCd2aXN1YWwnLCBAdGFyZ2V0Lndpc2UpXG5cbmNsYXNzIFNlbGVjdExhdGVzdENoYW5nZSBleHRlbmRzIFNlbGVjdFxuICBAZXh0ZW5kKClcbiAgQGRlc2NyaXB0aW9uOiBcIlNlbGVjdCBsYXRlc3QgeWFua2VkIG9yIGNoYW5nZWQgcmFuZ2VcIlxuICB0YXJnZXQ6ICdBTGF0ZXN0Q2hhbmdlJ1xuXG5jbGFzcyBTZWxlY3RQcmV2aW91c1NlbGVjdGlvbiBleHRlbmRzIFNlbGVjdFxuICBAZXh0ZW5kKClcbiAgdGFyZ2V0OiBcIlByZXZpb3VzU2VsZWN0aW9uXCJcblxuY2xhc3MgU2VsZWN0UGVyc2lzdGVudFNlbGVjdGlvbiBleHRlbmRzIFNlbGVjdFxuICBAZXh0ZW5kKClcbiAgQGRlc2NyaXB0aW9uOiBcIlNlbGVjdCBwZXJzaXN0ZW50LXNlbGVjdGlvbiBhbmQgY2xlYXIgYWxsIHBlcnNpc3RlbnQtc2VsZWN0aW9uLCBpdCdzIGxpa2UgY29udmVydCB0byByZWFsLXNlbGVjdGlvblwiXG4gIHRhcmdldDogXCJBUGVyc2lzdGVudFNlbGVjdGlvblwiXG5cbmNsYXNzIFNlbGVjdE9jY3VycmVuY2UgZXh0ZW5kcyBPcGVyYXRvclxuICBAZXh0ZW5kKClcbiAgQGRlc2NyaXB0aW9uOiBcIkFkZCBzZWxlY3Rpb24gb250byBlYWNoIG1hdGNoaW5nIHdvcmQgd2l0aGluIHRhcmdldCByYW5nZVwiXG4gIG9jY3VycmVuY2U6IHRydWVcblxuICBleGVjdXRlOiAtPlxuICAgIEBzdGFydE11dGF0aW9uID0+XG4gICAgICBpZiBAc2VsZWN0VGFyZ2V0KClcbiAgICAgICAgQGFjdGl2YXRlTW9kZUlmTmVjZXNzYXJ5KCd2aXN1YWwnLCAnY2hhcmFjdGVyd2lzZScpXG5cbiMgUGVyc2lzdGVudCBTZWxlY3Rpb25cbiMgPT09PT09PT09PT09PT09PT09PT09PT09PVxuY2xhc3MgQ3JlYXRlUGVyc2lzdGVudFNlbGVjdGlvbiBleHRlbmRzIE9wZXJhdG9yXG4gIEBleHRlbmQoKVxuICBmbGFzaFRhcmdldDogZmFsc2VcbiAgc3RheUF0U2FtZVBvc2l0aW9uOiB0cnVlXG4gIGFjY2VwdFByZXNldE9jY3VycmVuY2U6IGZhbHNlXG4gIGFjY2VwdFBlcnNpc3RlbnRTZWxlY3Rpb246IGZhbHNlXG5cbiAgbXV0YXRlU2VsZWN0aW9uOiAoc2VsZWN0aW9uKSAtPlxuICAgIEBwZXJzaXN0ZW50U2VsZWN0aW9uLm1hcmtCdWZmZXJSYW5nZShzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKSlcblxuY2xhc3MgVG9nZ2xlUGVyc2lzdGVudFNlbGVjdGlvbiBleHRlbmRzIENyZWF0ZVBlcnNpc3RlbnRTZWxlY3Rpb25cbiAgQGV4dGVuZCgpXG5cbiAgaXNDb21wbGV0ZTogLT5cbiAgICBwb2ludCA9IEBlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKVxuICAgIEBtYXJrZXJUb1JlbW92ZSA9IEBwZXJzaXN0ZW50U2VsZWN0aW9uLmdldE1hcmtlckF0UG9pbnQocG9pbnQpXG4gICAgaWYgQG1hcmtlclRvUmVtb3ZlXG4gICAgICB0cnVlXG4gICAgZWxzZVxuICAgICAgc3VwZXJcblxuICBleGVjdXRlOiAtPlxuICAgIGlmIEBtYXJrZXJUb1JlbW92ZVxuICAgICAgQG1hcmtlclRvUmVtb3ZlLmRlc3Ryb3koKVxuICAgIGVsc2VcbiAgICAgIHN1cGVyXG5cbiMgUHJlc2V0IE9jY3VycmVuY2VcbiMgPT09PT09PT09PT09PT09PT09PT09PT09PVxuY2xhc3MgVG9nZ2xlUHJlc2V0T2NjdXJyZW5jZSBleHRlbmRzIE9wZXJhdG9yXG4gIEBleHRlbmQoKVxuICBmbGFzaFRhcmdldDogZmFsc2VcbiAgcmVxdWlyZVRhcmdldDogZmFsc2VcbiAgYWNjZXB0UHJlc2V0T2NjdXJyZW5jZTogZmFsc2VcbiAgYWNjZXB0UGVyc2lzdGVudFNlbGVjdGlvbjogZmFsc2VcbiAgb2NjdXJyZW5jZVR5cGU6ICdiYXNlJ1xuXG4gIGV4ZWN1dGU6IC0+XG4gICAgaWYgbWFya2VyID0gQG9jY3VycmVuY2VNYW5hZ2VyLmdldE1hcmtlckF0UG9pbnQoQGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpKVxuICAgICAgQG9jY3VycmVuY2VNYW5hZ2VyLmRlc3Ryb3lNYXJrZXJzKFttYXJrZXJdKVxuICAgIGVsc2VcbiAgICAgIHBhdHRlcm4gPSBudWxsXG4gICAgICBpc05hcnJvd2VkID0gQHZpbVN0YXRlLm1vZGVNYW5hZ2VyLmlzTmFycm93ZWQoKVxuXG4gICAgICBpZiBAbW9kZSBpcyAndmlzdWFsJyBhbmQgbm90IGlzTmFycm93ZWRcbiAgICAgICAgQG9jY3VycmVuY2VUeXBlID0gJ2Jhc2UnXG4gICAgICAgIHBhdHRlcm4gPSBuZXcgUmVnRXhwKF8uZXNjYXBlUmVnRXhwKEBlZGl0b3IuZ2V0U2VsZWN0ZWRUZXh0KCkpLCAnZycpXG4gICAgICBlbHNlXG4gICAgICAgIHBhdHRlcm4gPSBAZ2V0UGF0dGVybkZvck9jY3VycmVuY2VUeXBlKEBvY2N1cnJlbmNlVHlwZSlcblxuICAgICAgQG9jY3VycmVuY2VNYW5hZ2VyLmFkZFBhdHRlcm4ocGF0dGVybiwge0BvY2N1cnJlbmNlVHlwZX0pXG4gICAgICBAb2NjdXJyZW5jZU1hbmFnZXIuc2F2ZUxhc3RQYXR0ZXJuKEBvY2N1cnJlbmNlVHlwZSlcblxuICAgICAgQGFjdGl2YXRlTW9kZSgnbm9ybWFsJykgdW5sZXNzIGlzTmFycm93ZWRcblxuY2xhc3MgVG9nZ2xlUHJlc2V0U3Vid29yZE9jY3VycmVuY2UgZXh0ZW5kcyBUb2dnbGVQcmVzZXRPY2N1cnJlbmNlXG4gIEBleHRlbmQoKVxuICBvY2N1cnJlbmNlVHlwZTogJ3N1YndvcmQnXG5cbiMgV2FudCB0byByZW5hbWUgUmVzdG9yZU9jY3VycmVuY2VNYXJrZXJcbmNsYXNzIEFkZFByZXNldE9jY3VycmVuY2VGcm9tTGFzdE9jY3VycmVuY2VQYXR0ZXJuIGV4dGVuZHMgVG9nZ2xlUHJlc2V0T2NjdXJyZW5jZVxuICBAZXh0ZW5kKClcbiAgZXhlY3V0ZTogLT5cbiAgICBAb2NjdXJyZW5jZU1hbmFnZXIucmVzZXRQYXR0ZXJucygpXG4gICAgaWYgcGF0dGVybiA9IEB2aW1TdGF0ZS5nbG9iYWxTdGF0ZS5nZXQoJ2xhc3RPY2N1cnJlbmNlUGF0dGVybicpXG4gICAgICBvY2N1cnJlbmNlVHlwZSA9IEB2aW1TdGF0ZS5nbG9iYWxTdGF0ZS5nZXQoXCJsYXN0T2NjdXJyZW5jZVR5cGVcIilcbiAgICAgIEBvY2N1cnJlbmNlTWFuYWdlci5hZGRQYXR0ZXJuKHBhdHRlcm4sIHtvY2N1cnJlbmNlVHlwZX0pXG4gICAgICBAYWN0aXZhdGVNb2RlKCdub3JtYWwnKVxuXG4jIERlbGV0ZVxuIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuY2xhc3MgRGVsZXRlIGV4dGVuZHMgT3BlcmF0b3JcbiAgQGV4dGVuZCgpXG4gIHRyYWNrQ2hhbmdlOiB0cnVlXG4gIGZsYXNoQ2hlY2twb2ludDogJ2RpZC1zZWxlY3Qtb2NjdXJyZW5jZSdcbiAgZmxhc2hUeXBlRm9yT2NjdXJyZW5jZTogJ29wZXJhdG9yLXJlbW92ZS1vY2N1cnJlbmNlJ1xuICBzdGF5T3B0aW9uTmFtZTogJ3N0YXlPbkRlbGV0ZSdcbiAgc2V0VG9GaXJzdENoYXJhY3Rlck9uTGluZXdpc2U6IHRydWVcblxuICBleGVjdXRlOiAtPlxuICAgIGlmIEB0YXJnZXQud2lzZSBpcyAnYmxvY2t3aXNlJ1xuICAgICAgQHJlc3RvcmVQb3NpdGlvbnMgPSBmYWxzZVxuICAgIHN1cGVyXG5cbiAgbXV0YXRlU2VsZWN0aW9uOiAoc2VsZWN0aW9uKSA9PlxuICAgIEBzZXRUZXh0VG9SZWdpc3RlckZvclNlbGVjdGlvbihzZWxlY3Rpb24pXG4gICAgc2VsZWN0aW9uLmRlbGV0ZVNlbGVjdGVkVGV4dCgpXG5cbmNsYXNzIERlbGV0ZVJpZ2h0IGV4dGVuZHMgRGVsZXRlXG4gIEBleHRlbmQoKVxuICB0YXJnZXQ6ICdNb3ZlUmlnaHQnXG5cbmNsYXNzIERlbGV0ZUxlZnQgZXh0ZW5kcyBEZWxldGVcbiAgQGV4dGVuZCgpXG4gIHRhcmdldDogJ01vdmVMZWZ0J1xuXG5jbGFzcyBEZWxldGVUb0xhc3RDaGFyYWN0ZXJPZkxpbmUgZXh0ZW5kcyBEZWxldGVcbiAgQGV4dGVuZCgpXG4gIHRhcmdldDogJ01vdmVUb0xhc3RDaGFyYWN0ZXJPZkxpbmUnXG5cbiAgZXhlY3V0ZTogLT5cbiAgICBpZiBAdGFyZ2V0Lndpc2UgaXMgJ2Jsb2Nrd2lzZSdcbiAgICAgIEBvbkRpZFNlbGVjdFRhcmdldCA9PlxuICAgICAgICBmb3IgYmxvY2t3aXNlU2VsZWN0aW9uIGluIEBnZXRCbG9ja3dpc2VTZWxlY3Rpb25zKClcbiAgICAgICAgICBibG9ja3dpc2VTZWxlY3Rpb24uZXh0ZW5kTWVtYmVyU2VsZWN0aW9uc1RvRW5kT2ZMaW5lKClcbiAgICBzdXBlclxuXG5jbGFzcyBEZWxldGVMaW5lIGV4dGVuZHMgRGVsZXRlXG4gIEBleHRlbmQoKVxuICB3aXNlOiAnbGluZXdpc2UnXG4gIHRhcmdldDogXCJNb3ZlVG9SZWxhdGl2ZUxpbmVcIlxuXG4jIFlhbmtcbiMgPT09PT09PT09PT09PT09PT09PT09PT09PVxuY2xhc3MgWWFuayBleHRlbmRzIE9wZXJhdG9yXG4gIEBleHRlbmQoKVxuICB0cmFja0NoYW5nZTogdHJ1ZVxuICBzdGF5T3B0aW9uTmFtZTogJ3N0YXlPbllhbmsnXG5cbiAgbXV0YXRlU2VsZWN0aW9uOiAoc2VsZWN0aW9uKSAtPlxuICAgIEBzZXRUZXh0VG9SZWdpc3RlckZvclNlbGVjdGlvbihzZWxlY3Rpb24pXG5cbmNsYXNzIFlhbmtMaW5lIGV4dGVuZHMgWWFua1xuICBAZXh0ZW5kKClcbiAgd2lzZTogJ2xpbmV3aXNlJ1xuICB0YXJnZXQ6IFwiTW92ZVRvUmVsYXRpdmVMaW5lXCJcblxuY2xhc3MgWWFua1RvTGFzdENoYXJhY3Rlck9mTGluZSBleHRlbmRzIFlhbmtcbiAgQGV4dGVuZCgpXG4gIHRhcmdldDogJ01vdmVUb0xhc3RDaGFyYWN0ZXJPZkxpbmUnXG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBbY3RybC1hXVxuY2xhc3MgSW5jcmVhc2UgZXh0ZW5kcyBPcGVyYXRvclxuICBAZXh0ZW5kKClcbiAgdGFyZ2V0OiBcIkVtcHR5XCIgIyBjdHJsLWEgaW4gbm9ybWFsLW1vZGUgZmluZCB0YXJnZXQgbnVtYmVyIGluIGN1cnJlbnQgbGluZSBtYW51YWxseVxuICBmbGFzaFRhcmdldDogZmFsc2UgIyBkbyBtYW51YWxseVxuICByZXN0b3JlUG9zaXRpb25zOiBmYWxzZSAjIGRvIG1hbnVhbGx5XG4gIHN0ZXA6IDFcblxuICBleGVjdXRlOiAtPlxuICAgIEBuZXdSYW5nZXMgPSBbXVxuICAgIHN1cGVyXG4gICAgaWYgQG5ld1Jhbmdlcy5sZW5ndGhcbiAgICAgIGlmIEBnZXRDb25maWcoJ2ZsYXNoT25PcGVyYXRlJykgYW5kIChAZ2V0TmFtZSgpIG5vdCBpbiBAZ2V0Q29uZmlnKCdmbGFzaE9uT3BlcmF0ZUJsYWNrbGlzdCcpKVxuICAgICAgICBAdmltU3RhdGUuZmxhc2goQG5ld1JhbmdlcywgdHlwZTogQGZsYXNoVHlwZUZvck9jY3VycmVuY2UpXG5cbiAgcmVwbGFjZU51bWJlckluQnVmZmVyUmFuZ2U6IChzY2FuUmFuZ2UsIGZuPW51bGwpIC0+XG4gICAgbmV3UmFuZ2VzID0gW11cbiAgICBAcGF0dGVybiA/PSAvLy8je0BnZXRDb25maWcoJ251bWJlclJlZ2V4Jyl9Ly8vZ1xuICAgIEBzY2FuRm9yd2FyZCBAcGF0dGVybiwge3NjYW5SYW5nZX0sIChldmVudCkgPT5cbiAgICAgIHJldHVybiBpZiBmbj8gYW5kIG5vdCBmbihldmVudClcbiAgICAgIHttYXRjaFRleHQsIHJlcGxhY2V9ID0gZXZlbnRcbiAgICAgIG5leHROdW1iZXIgPSBAZ2V0TmV4dE51bWJlcihtYXRjaFRleHQpXG4gICAgICBuZXdSYW5nZXMucHVzaChyZXBsYWNlKFN0cmluZyhuZXh0TnVtYmVyKSkpXG4gICAgbmV3UmFuZ2VzXG5cbiAgbXV0YXRlU2VsZWN0aW9uOiAoc2VsZWN0aW9uKSAtPlxuICAgIHtjdXJzb3J9ID0gc2VsZWN0aW9uXG4gICAgaWYgQHRhcmdldC5pcygnRW1wdHknKSAjIGN0cmwtYSwgY3RybC14IGluIGBub3JtYWwtbW9kZWBcbiAgICAgIGN1cnNvclBvc2l0aW9uID0gY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKClcbiAgICAgIHNjYW5SYW5nZSA9IEBlZGl0b3IuYnVmZmVyUmFuZ2VGb3JCdWZmZXJSb3coY3Vyc29yUG9zaXRpb24ucm93KVxuICAgICAgbmV3UmFuZ2VzID0gQHJlcGxhY2VOdW1iZXJJbkJ1ZmZlclJhbmdlIHNjYW5SYW5nZSwgKHtyYW5nZSwgc3RvcH0pIC0+XG4gICAgICAgIGlmIHJhbmdlLmVuZC5pc0dyZWF0ZXJUaGFuKGN1cnNvclBvc2l0aW9uKVxuICAgICAgICAgIHN0b3AoKVxuICAgICAgICAgIHRydWVcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGZhbHNlXG5cbiAgICAgIHBvaW50ID0gbmV3UmFuZ2VzWzBdPy5lbmQudHJhbnNsYXRlKFswLCAtMV0pID8gY3Vyc29yUG9zaXRpb25cbiAgICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihwb2ludClcbiAgICBlbHNlXG4gICAgICBzY2FuUmFuZ2UgPSBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKVxuICAgICAgQG5ld1Jhbmdlcy5wdXNoKEByZXBsYWNlTnVtYmVySW5CdWZmZXJSYW5nZShzY2FuUmFuZ2UpLi4uKVxuICAgICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHNjYW5SYW5nZS5zdGFydClcblxuICBnZXROZXh0TnVtYmVyOiAobnVtYmVyU3RyaW5nKSAtPlxuICAgIE51bWJlci5wYXJzZUludChudW1iZXJTdHJpbmcsIDEwKSArIEBzdGVwICogQGdldENvdW50KClcblxuIyBbY3RybC14XVxuY2xhc3MgRGVjcmVhc2UgZXh0ZW5kcyBJbmNyZWFzZVxuICBAZXh0ZW5kKClcbiAgc3RlcDogLTFcblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIFtnIGN0cmwtYV1cbmNsYXNzIEluY3JlbWVudE51bWJlciBleHRlbmRzIEluY3JlYXNlXG4gIEBleHRlbmQoKVxuICBiYXNlTnVtYmVyOiBudWxsXG4gIHRhcmdldDogbnVsbFxuICBtdXRhdGVTZWxlY3Rpb25PcmRlcmQ6IHRydWVcblxuICBnZXROZXh0TnVtYmVyOiAobnVtYmVyU3RyaW5nKSAtPlxuICAgIGlmIEBiYXNlTnVtYmVyP1xuICAgICAgQGJhc2VOdW1iZXIgKz0gQHN0ZXAgKiBAZ2V0Q291bnQoKVxuICAgIGVsc2VcbiAgICAgIEBiYXNlTnVtYmVyID0gTnVtYmVyLnBhcnNlSW50KG51bWJlclN0cmluZywgMTApXG4gICAgQGJhc2VOdW1iZXJcblxuIyBbZyBjdHJsLXhdXG5jbGFzcyBEZWNyZW1lbnROdW1iZXIgZXh0ZW5kcyBJbmNyZW1lbnROdW1iZXJcbiAgQGV4dGVuZCgpXG4gIHN0ZXA6IC0xXG5cbiMgUHV0XG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgQ3Vyc29yIHBsYWNlbWVudDpcbiMgLSBwbGFjZSBhdCBlbmQgb2YgbXV0YXRpb246IHBhc3RlIG5vbi1tdWx0aWxpbmUgY2hhcmFjdGVyd2lzZSB0ZXh0XG4jIC0gcGxhY2UgYXQgc3RhcnQgb2YgbXV0YXRpb246IG5vbi1tdWx0aWxpbmUgY2hhcmFjdGVyd2lzZSB0ZXh0KGNoYXJhY3Rlcndpc2UsIGxpbmV3aXNlKVxuY2xhc3MgUHV0QmVmb3JlIGV4dGVuZHMgT3BlcmF0b3JcbiAgQGV4dGVuZCgpXG4gIGxvY2F0aW9uOiAnYmVmb3JlJ1xuICB0YXJnZXQ6ICdFbXB0eSdcbiAgZmxhc2hUeXBlOiAnb3BlcmF0b3ItbG9uZydcbiAgcmVzdG9yZVBvc2l0aW9uczogZmFsc2UgIyBtYW5hZ2UgbWFudWFsbHlcbiAgZmxhc2hUYXJnZXQ6IHRydWUgIyBtYW5hZ2UgbWFudWFsbHlcbiAgdHJhY2tDaGFuZ2U6IGZhbHNlICMgbWFuYWdlIG1hbnVhbGx5XG5cbiAgZXhlY3V0ZTogLT5cbiAgICBAbXV0YXRpb25zQnlTZWxlY3Rpb24gPSBuZXcgTWFwKClcbiAgICB7dGV4dCwgdHlwZX0gPSBAdmltU3RhdGUucmVnaXN0ZXIuZ2V0KG51bGwsIEBlZGl0b3IuZ2V0TGFzdFNlbGVjdGlvbigpKVxuICAgIHJldHVybiB1bmxlc3MgdGV4dFxuICAgIEBvbkRpZEZpbmlzaE11dGF0aW9uKEBhZGp1c3RDdXJzb3JQb3NpdGlvbi5iaW5kKHRoaXMpKVxuXG4gICAgQG9uRGlkRmluaXNoT3BlcmF0aW9uID0+XG4gICAgICAjIFRyYWNrQ2hhbmdlXG4gICAgICBpZiBuZXdSYW5nZSA9IEBtdXRhdGlvbnNCeVNlbGVjdGlvbi5nZXQoQGVkaXRvci5nZXRMYXN0U2VsZWN0aW9uKCkpXG4gICAgICAgIEBzZXRNYXJrRm9yQ2hhbmdlKG5ld1JhbmdlKVxuXG4gICAgICAjIEZsYXNoXG4gICAgICBpZiBAZ2V0Q29uZmlnKCdmbGFzaE9uT3BlcmF0ZScpIGFuZCAoQGdldE5hbWUoKSBub3QgaW4gQGdldENvbmZpZygnZmxhc2hPbk9wZXJhdGVCbGFja2xpc3QnKSlcbiAgICAgICAgdG9SYW5nZSA9IChzZWxlY3Rpb24pID0+IEBtdXRhdGlvbnNCeVNlbGVjdGlvbi5nZXQoc2VsZWN0aW9uKVxuICAgICAgICBAdmltU3RhdGUuZmxhc2goQGVkaXRvci5nZXRTZWxlY3Rpb25zKCkubWFwKHRvUmFuZ2UpLCB0eXBlOiBAZ2V0Rmxhc2hUeXBlKCkpXG5cbiAgICBzdXBlclxuXG4gIGFkanVzdEN1cnNvclBvc2l0aW9uOiAtPlxuICAgIGZvciBzZWxlY3Rpb24gaW4gQGVkaXRvci5nZXRTZWxlY3Rpb25zKClcbiAgICAgIHtjdXJzb3J9ID0gc2VsZWN0aW9uXG4gICAgICB7c3RhcnQsIGVuZH0gPSBuZXdSYW5nZSA9IEBtdXRhdGlvbnNCeVNlbGVjdGlvbi5nZXQoc2VsZWN0aW9uKVxuICAgICAgaWYgQGxpbmV3aXNlUGFzdGVcbiAgICAgICAgbW92ZUN1cnNvclRvRmlyc3RDaGFyYWN0ZXJBdFJvdyhjdXJzb3IsIHN0YXJ0LnJvdylcbiAgICAgIGVsc2VcbiAgICAgICAgaWYgbmV3UmFuZ2UuaXNTaW5nbGVMaW5lKClcbiAgICAgICAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24oZW5kLnRyYW5zbGF0ZShbMCwgLTFdKSlcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihzdGFydClcblxuICBtdXRhdGVTZWxlY3Rpb246IChzZWxlY3Rpb24pIC0+XG4gICAge3RleHQsIHR5cGV9ID0gQHZpbVN0YXRlLnJlZ2lzdGVyLmdldChudWxsLCBzZWxlY3Rpb24pXG4gICAgdGV4dCA9IF8ubXVsdGlwbHlTdHJpbmcodGV4dCwgQGdldENvdW50KCkpXG4gICAgQGxpbmV3aXNlUGFzdGUgPSB0eXBlIGlzICdsaW5ld2lzZScgb3IgQGlzTW9kZSgndmlzdWFsJywgJ2xpbmV3aXNlJylcbiAgICBuZXdSYW5nZSA9IEBwYXN0ZShzZWxlY3Rpb24sIHRleHQsIHtAbGluZXdpc2VQYXN0ZX0pXG4gICAgQG11dGF0aW9uc0J5U2VsZWN0aW9uLnNldChzZWxlY3Rpb24sIG5ld1JhbmdlKVxuXG4gIHBhc3RlOiAoc2VsZWN0aW9uLCB0ZXh0LCB7bGluZXdpc2VQYXN0ZX0pIC0+XG4gICAgaWYgbGluZXdpc2VQYXN0ZVxuICAgICAgQHBhc3RlTGluZXdpc2Uoc2VsZWN0aW9uLCB0ZXh0KVxuICAgIGVsc2VcbiAgICAgIEBwYXN0ZUNoYXJhY3Rlcndpc2Uoc2VsZWN0aW9uLCB0ZXh0KVxuXG4gIHBhc3RlQ2hhcmFjdGVyd2lzZTogKHNlbGVjdGlvbiwgdGV4dCkgLT5cbiAgICB7Y3Vyc29yfSA9IHNlbGVjdGlvblxuICAgIGlmIHNlbGVjdGlvbi5pc0VtcHR5KCkgYW5kIEBsb2NhdGlvbiBpcyAnYWZ0ZXInIGFuZCBub3QgaXNFbXB0eVJvdyhAZWRpdG9yLCBjdXJzb3IuZ2V0QnVmZmVyUm93KCkpXG4gICAgICBjdXJzb3IubW92ZVJpZ2h0KClcbiAgICByZXR1cm4gc2VsZWN0aW9uLmluc2VydFRleHQodGV4dClcblxuICAjIFJldHVybiBuZXdSYW5nZVxuICBwYXN0ZUxpbmV3aXNlOiAoc2VsZWN0aW9uLCB0ZXh0KSAtPlxuICAgIHtjdXJzb3J9ID0gc2VsZWN0aW9uXG4gICAgY3Vyc29yUm93ID0gY3Vyc29yLmdldEJ1ZmZlclJvdygpXG4gICAgdGV4dCArPSBcIlxcblwiIHVubGVzcyB0ZXh0LmVuZHNXaXRoKFwiXFxuXCIpXG4gICAgbmV3UmFuZ2UgPSBudWxsXG4gICAgaWYgc2VsZWN0aW9uLmlzRW1wdHkoKVxuICAgICAgaWYgQGxvY2F0aW9uIGlzICdiZWZvcmUnXG4gICAgICAgIG5ld1JhbmdlID0gaW5zZXJ0VGV4dEF0QnVmZmVyUG9zaXRpb24oQGVkaXRvciwgW2N1cnNvclJvdywgMF0sIHRleHQpXG4gICAgICAgIHNldEJ1ZmZlclJvdyhjdXJzb3IsIG5ld1JhbmdlLnN0YXJ0LnJvdylcbiAgICAgIGVsc2UgaWYgQGxvY2F0aW9uIGlzICdhZnRlcidcbiAgICAgICAgZW5zdXJlRW5kc1dpdGhOZXdMaW5lRm9yQnVmZmVyUm93KEBlZGl0b3IsIGN1cnNvclJvdylcbiAgICAgICAgbmV3UmFuZ2UgPSBpbnNlcnRUZXh0QXRCdWZmZXJQb3NpdGlvbihAZWRpdG9yLCBbY3Vyc29yUm93ICsgMSwgMF0sIHRleHQpXG4gICAgZWxzZVxuICAgICAgc2VsZWN0aW9uLmluc2VydFRleHQoXCJcXG5cIikgdW5sZXNzIEBpc01vZGUoJ3Zpc3VhbCcsICdsaW5ld2lzZScpXG4gICAgICBuZXdSYW5nZSA9IHNlbGVjdGlvbi5pbnNlcnRUZXh0KHRleHQpXG5cbiAgICByZXR1cm4gbmV3UmFuZ2VcblxuY2xhc3MgUHV0QWZ0ZXIgZXh0ZW5kcyBQdXRCZWZvcmVcbiAgQGV4dGVuZCgpXG4gIGxvY2F0aW9uOiAnYWZ0ZXInXG5cbmNsYXNzIEFkZEJsYW5rTGluZUJlbG93IGV4dGVuZHMgT3BlcmF0b3JcbiAgQGV4dGVuZCgpXG4gIGZsYXNoVGFyZ2V0OiBmYWxzZVxuICB0YXJnZXQ6IFwiRW1wdHlcIlxuICBzdGF5QXRTYW1lUG9zaXRpb246IHRydWVcbiAgc3RheUJ5TWFya2VyOiB0cnVlXG4gIHdoZXJlOiAnYmVsb3cnXG5cbiAgbXV0YXRlU2VsZWN0aW9uOiAoc2VsZWN0aW9uKSAtPlxuICAgIHJvdyA9IHNlbGVjdGlvbi5nZXRIZWFkQnVmZmVyUG9zaXRpb24oKS5yb3dcbiAgICByb3cgKz0gMSBpZiBAd2hlcmUgaXMgJ2JlbG93J1xuICAgIHBvaW50ID0gW3JvdywgMF1cbiAgICBAZWRpdG9yLnNldFRleHRJbkJ1ZmZlclJhbmdlKFtwb2ludCwgcG9pbnRdLCBcIlxcblwiLnJlcGVhdChAZ2V0Q291bnQoKSkpXG5cbmNsYXNzIEFkZEJsYW5rTGluZUFib3ZlIGV4dGVuZHMgQWRkQmxhbmtMaW5lQmVsb3dcbiAgQGV4dGVuZCgpXG4gIHdoZXJlOiAnYWJvdmUnXG4iXX0=
