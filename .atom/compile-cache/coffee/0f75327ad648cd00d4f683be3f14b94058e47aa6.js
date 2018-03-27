(function() {
  var AddBlankLineAbove, AddBlankLineBelow, AddPresetOccurrenceFromLastOccurrencePattern, Base, CreatePersistentSelection, Decrease, DecrementNumber, Delete, DeleteLeft, DeleteLine, DeleteRight, DeleteToLastCharacterOfLine, Increase, IncrementNumber, Operator, PutAfter, PutBefore, Select, SelectLatestChange, SelectOccurrence, SelectPersistentSelection, SelectPreviousSelection, TogglePersistentSelection, TogglePresetOccurrence, TogglePresetSubwordOccurrence, Yank, YankLine, YankToLastCharacterOfLine, _, ensureEndsWithNewLineForBufferRow, getSubwordPatternAtBufferPosition, getValidVimBufferRow, getWordPatternAtBufferPosition, haveSomeNonEmptySelection, insertTextAtBufferPosition, isEmptyRow, moveCursorToFirstCharacterAtRow, ref, setBufferRow, swrap,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  _ = require('underscore-plus');

  ref = require('./utils'), haveSomeNonEmptySelection = ref.haveSomeNonEmptySelection, getValidVimBufferRow = ref.getValidVimBufferRow, isEmptyRow = ref.isEmptyRow, getWordPatternAtBufferPosition = ref.getWordPatternAtBufferPosition, getSubwordPatternAtBufferPosition = ref.getSubwordPatternAtBufferPosition, insertTextAtBufferPosition = ref.insertTextAtBufferPosition, setBufferRow = ref.setBufferRow, moveCursorToFirstCharacterAtRow = ref.moveCursorToFirstCharacterAtRow, ensureEndsWithNewLineForBufferRow = ref.ensureEndsWithNewLineForBufferRow;

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

    Operator.prototype.acceptPresetOccurrence = true;

    Operator.prototype.acceptPersistentSelection = true;

    Operator.prototype.acceptCurrentSelection = true;

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

    Operator.prototype.needStay = function() {
      var ref1;
      return ((ref1 = this.stayAtSamePosition) != null ? ref1 : this.isOccurrence() && this.getConfig('stayOnOccurrence')) || this.getConfig(this.stayOptionName);
    };

    Operator.prototype.needStayOnRestore = function() {
      var ref1;
      return ((ref1 = this.stayAtSamePosition) != null ? ref1 : this.isOccurrence() && this.getConfig('stayOnOccurrence') && this.occurrenceSelected) || this.getConfig(this.stayOptionName);
    };

    Operator.prototype.isOccurrence = function() {
      return this.occurrence;
    };

    Operator.prototype.setOccurrence = function(occurrence) {
      this.occurrence = occurrence;
      return this.occurrence;
    };

    Operator.prototype.setMarkForChange = function(range) {
      return this.vimState.mark.setRange('[', ']', range);
    };

    Operator.prototype.needFlash = function() {
      var mode, ref1, ref2, submode;
      if (!this.flashTarget) {
        return;
      }
      ref1 = this.vimState, mode = ref1.mode, submode = ref1.submode;
      if (mode !== 'visual' || (this.target.isMotion() && submode !== this.target.wise)) {
        return this.getConfig('flashOnOperate') && (ref2 = this.getName(), indexOf.call(this.getConfig('flashOnOperateBlacklist'), ref2) < 0);
      }
    };

    Operator.prototype.flashIfNecessary = function(ranges) {
      if (!this.needFlash()) {
        return;
      }
      return this.vimState.flash(ranges, {
        type: this.getFlashType()
      });
    };

    Operator.prototype.flashChangeIfNecessary = function() {
      if (!this.needFlash()) {
        return;
      }
      return this.onDidFinishOperation((function(_this) {
        return function() {
          var ranges;
          if (_this.flashCheckpoint === 'did-finish') {
            ranges = _this.mutationManager.getMarkerBufferRanges().filter(function(range) {
              return !range.isEmpty();
            });
          } else {
            ranges = _this.mutationManager.getBufferRangesForCheckpoint(_this.flashCheckpoint);
          }
          return _this.vimState.flash(ranges, {
            type: _this.getFlashType()
          });
        };
      })(this));
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
          var marker, ref1;
          if (marker = (ref1 = _this.mutationManager.getMutationForSelection(_this.editor.getLastSelection())) != null ? ref1.marker : void 0) {
            return _this.setMarkForChange(marker.getBufferRange());
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
        this.setOccurrence(true);
      }
      if (this.isOccurrence() && !this.occurrenceManager.hasMarkers()) {
        this.occurrenceManager.addPattern((ref2 = this.patternForOccurrence) != null ? ref2 : this.getPatternForOccurrenceType(this.occurrenceType));
      }
      if (this.selectPersistentSelectionIfNecessary()) {
        if (this.isMode('visual')) {
          null;
        } else {
          this.vimState.modeManager.activate('visual', swrap.detectWise(this.editor));
        }
      }
      if (this.isMode('visual') && this.acceptCurrentSelection) {
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
        this.setOccurrence(options.occurrence);
        if (this.isOccurrence()) {
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
      if (this.acceptPersistentSelection && this.getConfig('autoSelectPersistentSelectionOnOperate') && !this.persistentSelection.isEmpty()) {
        this.persistentSelection.select();
        this.editor.mergeIntersectingSelections();
        swrap.saveProperties(this.editor);
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
      if (((ref1 = this.target) != null ? ref1.isMotion() : void 0) && this.isMode('visual')) {
        return this.vimState.modeManager.normalizeSelections();
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
            return _this.restoreCursorPositionsIfNecessary();
          }
        };
      })(this));
      return this.activateMode('normal');
    };

    Operator.prototype.selectTarget = function() {
      var base;
      if (this.targetSelected != null) {
        return this.targetSelected;
      }
      this.mutationManager.init({
        useMarker: this.needStay() && this.stayByMarker
      });
      if (this.wise != null) {
        if (typeof (base = this.target).forceWise === "function") {
          base.forceWise(this.wise);
        }
      }
      this.emitWillSelectTarget();
      this.mutationManager.setCheckpoint('will-select');
      if (this.isRepeated() && this.isOccurrence() && !this.occurrenceManager.hasMarkers()) {
        this.occurrenceManager.addPattern(this.patternForOccurrence, {
          occurrenceType: this.occurrenceType
        });
      }
      this.target.execute();
      this.mutationManager.setCheckpoint('did-select');
      if (this.isOccurrence()) {
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
      var options, ref1;
      if (!this.restorePositions) {
        return;
      }
      options = {
        stay: this.needStayOnRestore(),
        occurrenceSelected: this.occurrenceSelected,
        isBlockwise: (ref1 = this.target) != null ? typeof ref1.isBlockwise === "function" ? ref1.isBlockwise() : void 0 : void 0
      };
      this.mutationManager.restoreCursorPositions(options);
      return this.emitDidRestoreCursorPositions();
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
      var wise;
      this.startMutation(this.selectTarget.bind(this));
      if (this.target.isTextObject() && (wise = this.target.getWise())) {
        if (this.isMode('visual')) {
          switch (wise) {
            case 'characterwise':
              swrap.saveProperties(this.editor);
              break;
            case 'linewise':
              swrap.fixPropertiesForLinewise(this.editor);
          }
        }
        return this.activateModeIfNecessary('visual', wise);
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
            return _this.activateModeIfNecessary('visual', swrap.detectWise(_this.editor));
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

    CreatePersistentSelection.prototype.execute = function() {
      this.restorePositions = !this.isMode('visual', 'blockwise');
      return CreatePersistentSelection.__super__.execute.apply(this, arguments);
    };

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
        if (this.isMode('visual') && !isNarrowed) {
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

    Delete.prototype.execute = function() {
      this.onDidSelectTarget((function(_this) {
        return function() {
          if (_this.occurrenceSelected) {
            return;
          }
          if (_this.target.isLinewise()) {
            return _this.onDidRestoreCursorPositions(function() {
              var cursor, i, len, ref1, results;
              ref1 = _this.editor.getCursors();
              results = [];
              for (i = 0, len = ref1.length; i < len; i++) {
                cursor = ref1[i];
                results.push(_this.adjustCursor(cursor));
              }
              return results;
            });
          }
        };
      })(this));
      return Delete.__super__.execute.apply(this, arguments);
    };

    Delete.prototype.mutateSelection = function(selection) {
      this.setTextToRegisterForSelection(selection);
      return selection.deleteSelectedText();
    };

    Delete.prototype.adjustCursor = function(cursor) {
      var point, row;
      row = getValidVimBufferRow(this.editor, cursor.getBufferRow());
      if (this.needStayOnRestore()) {
        point = this.mutationManager.getInitialPointForSelection(cursor.selection);
        return cursor.setBufferPosition([row, point.column]);
      } else {
        return cursor.setBufferPosition(this.getFirstCharacterPositionForBufferRow(row));
      }
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

    DeleteToLastCharacterOfLine.prototype.initialize = function() {
      if (this.isMode('visual', 'blockwise')) {
        this.acceptCurrentSelection = false;
        swrap.setReversedState(this.editor, false);
      }
      return DeleteToLastCharacterOfLine.__super__.initialize.apply(this, arguments);
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

    Increase.prototype.target = "InnerCurrentLine";

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
      var initialPoint, newRanges, point, ref1, ref2, ref3, scanRange;
      scanRange = selection.getBufferRange();
      if (this["instanceof"]('IncrementNumber') || this.target.is('CurrentSelection')) {
        (ref1 = this.newRanges).push.apply(ref1, this.replaceNumberInBufferRange(scanRange));
        return selection.cursor.setBufferPosition(scanRange.start);
      } else {
        initialPoint = this.mutationManager.getInitialPointForSelection(selection);
        newRanges = this.replaceNumberInBufferRange(scanRange, function(arg) {
          var range, stop;
          range = arg.range, stop = arg.stop;
          if (range.end.isGreaterThan(initialPoint)) {
            stop();
            return true;
          } else {
            return false;
          }
        });
        point = (ref2 = (ref3 = newRanges[0]) != null ? ref3.end.translate([0, -1]) : void 0) != null ? ref2 : initialPoint;
        return selection.cursor.setBufferPosition(point);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvb3BlcmF0b3IuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSw4dUJBQUE7SUFBQTs7Ozs7RUFBQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSOztFQUNKLE1BVUksT0FBQSxDQUFRLFNBQVIsQ0FWSixFQUNFLHlEQURGLEVBRUUsK0NBRkYsRUFHRSwyQkFIRixFQUlFLG1FQUpGLEVBS0UseUVBTEYsRUFNRSwyREFORixFQU9FLCtCQVBGLEVBUUUscUVBUkYsRUFTRTs7RUFFRixLQUFBLEdBQVEsT0FBQSxDQUFRLHFCQUFSOztFQUNSLElBQUEsR0FBTyxPQUFBLENBQVEsUUFBUjs7RUFFRDs7O0lBQ0osUUFBQyxDQUFBLE1BQUQsQ0FBUSxLQUFSOzt1QkFDQSxhQUFBLEdBQWU7O3VCQUNmLFVBQUEsR0FBWTs7dUJBRVosSUFBQSxHQUFNOzt1QkFDTixVQUFBLEdBQVk7O3VCQUNaLGNBQUEsR0FBZ0I7O3VCQUVoQixXQUFBLEdBQWE7O3VCQUNiLGVBQUEsR0FBaUI7O3VCQUNqQixTQUFBLEdBQVc7O3VCQUNYLHNCQUFBLEdBQXdCOzt1QkFDeEIsV0FBQSxHQUFhOzt1QkFFYixvQkFBQSxHQUFzQjs7dUJBQ3RCLGtCQUFBLEdBQW9COzt1QkFDcEIsY0FBQSxHQUFnQjs7dUJBQ2hCLFlBQUEsR0FBYzs7dUJBQ2QsZ0JBQUEsR0FBa0I7O3VCQUVsQixzQkFBQSxHQUF3Qjs7dUJBQ3hCLHlCQUFBLEdBQTJCOzt1QkFDM0Isc0JBQUEsR0FBd0I7O3VCQUV4Qix5QkFBQSxHQUEyQjs7dUJBQzNCLHFCQUFBLEdBQXVCOzt1QkFJdkIsa0JBQUEsR0FBb0I7O3VCQUNwQixjQUFBLEdBQWdCOzt1QkFDaEIsY0FBQSxHQUFnQixTQUFBO2FBQ2QsSUFBQyxDQUFBLGtCQUFELElBQXdCLENB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QWxDO1VBQUEsU0FBUyxDQUFDLFVBQVYsQ0FBcUIsSUFBckIsRUFBQTs7UUFDQSxRQUFBLEdBQVcsU0FBUyxDQUFDLFVBQVYsQ0FBcUIsSUFBckIsRUFUYjs7QUFXQSxhQUFPO0lBaEJNOzs7O0tBM0RPOztFQTZFbEI7Ozs7Ozs7SUFDSixRQUFDLENBQUEsTUFBRCxDQUFBOzt1QkFDQSxRQUFBLEdBQVU7Ozs7S0FGVzs7RUFJakI7Ozs7Ozs7SUFDSixpQkFBQyxDQUFBLE1BQUQsQ0FBQTs7Z0NBQ0EsV0FBQSxHQUFhOztnQ0FDYixNQUFBLEdBQVE7O2dDQUNSLGtCQUFBLEdBQW9COztnQ0FDcEIsWUFBQSxHQUFjOztnQ0FDZCxLQUFBLEdBQU87O2dDQUVQLGVBQUEsR0FBaUIsU0FBQyxTQUFEO0FBQ2YsVUFBQTtNQUFBLEdBQUEsR0FBTSxTQUFTLENBQUMscUJBQVYsQ0FBQSxDQUFpQyxDQUFDO01BQ3hDLElBQVksSUFBQyxDQUFBLEtBQUQsS0FBVSxPQUF0QjtRQUFBLEdBQUEsSUFBTyxFQUFQOztNQUNBLEtBQUEsR0FBUSxDQUFDLEdBQUQsRUFBTSxDQUFOO2FBQ1IsSUFBQyxDQUFBLE1BQU0sQ0FBQyxvQkFBUixDQUE2QixDQUFDLEtBQUQsRUFBUSxLQUFSLENBQTdCLEVBQTZDLElBQUksQ0FBQyxNQUFMLENBQVksSUFBQyxDQUFBLFFBQUQsQ0FBQSxDQUFaLENBQTdDO0lBSmU7Ozs7S0FSYTs7RUFjMUI7Ozs7Ozs7SUFDSixpQkFBQyxDQUFBLE1BQUQsQ0FBQTs7Z0NBQ0EsS0FBQSxHQUFPOzs7O0tBRnVCO0FBcnFCaEMiLCJzb3VyY2VzQ29udGVudCI6WyJfID0gcmVxdWlyZSAndW5kZXJzY29yZS1wbHVzJ1xue1xuICBoYXZlU29tZU5vbkVtcHR5U2VsZWN0aW9uXG4gIGdldFZhbGlkVmltQnVmZmVyUm93XG4gIGlzRW1wdHlSb3dcbiAgZ2V0V29yZFBhdHRlcm5BdEJ1ZmZlclBvc2l0aW9uXG4gIGdldFN1YndvcmRQYXR0ZXJuQXRCdWZmZXJQb3NpdGlvblxuICBpbnNlcnRUZXh0QXRCdWZmZXJQb3NpdGlvblxuICBzZXRCdWZmZXJSb3dcbiAgbW92ZUN1cnNvclRvRmlyc3RDaGFyYWN0ZXJBdFJvd1xuICBlbnN1cmVFbmRzV2l0aE5ld0xpbmVGb3JCdWZmZXJSb3dcbn0gPSByZXF1aXJlICcuL3V0aWxzJ1xuc3dyYXAgPSByZXF1aXJlICcuL3NlbGVjdGlvbi13cmFwcGVyJ1xuQmFzZSA9IHJlcXVpcmUgJy4vYmFzZSdcblxuY2xhc3MgT3BlcmF0b3IgZXh0ZW5kcyBCYXNlXG4gIEBleHRlbmQoZmFsc2UpXG4gIHJlcXVpcmVUYXJnZXQ6IHRydWVcbiAgcmVjb3JkYWJsZTogdHJ1ZVxuXG4gIHdpc2U6IG51bGxcbiAgb2NjdXJyZW5jZTogZmFsc2VcbiAgb2NjdXJyZW5jZVR5cGU6ICdiYXNlJ1xuXG4gIGZsYXNoVGFyZ2V0OiB0cnVlXG4gIGZsYXNoQ2hlY2twb2ludDogJ2RpZC1maW5pc2gnXG4gIGZsYXNoVHlwZTogJ29wZXJhdG9yJ1xuICBmbGFzaFR5cGVGb3JPY2N1cnJlbmNlOiAnb3BlcmF0b3Itb2NjdXJyZW5jZSdcbiAgdHJhY2tDaGFuZ2U6IGZhbHNlXG5cbiAgcGF0dGVybkZvck9jY3VycmVuY2U6IG51bGxcbiAgc3RheUF0U2FtZVBvc2l0aW9uOiBudWxsXG4gIHN0YXlPcHRpb25OYW1lOiBudWxsXG4gIHN0YXlCeU1hcmtlcjogZmFsc2VcbiAgcmVzdG9yZVBvc2l0aW9uczogdHJ1ZVxuXG4gIGFjY2VwdFByZXNldE9jY3VycmVuY2U6IHRydWVcbiAgYWNjZXB0UGVyc2lzdGVudFNlbGVjdGlvbjogdHJ1ZVxuICBhY2NlcHRDdXJyZW50U2VsZWN0aW9uOiB0cnVlXG5cbiAgYnVmZmVyQ2hlY2twb2ludEJ5UHVycG9zZTogbnVsbFxuICBtdXRhdGVTZWxlY3Rpb25PcmRlcmQ6IGZhbHNlXG5cbiAgIyBFeHBlcmltZW50YWx5IGFsbG93IHNlbGVjdFRhcmdldCBiZWZvcmUgaW5wdXQgQ29tcGxldGVcbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIHN1cHBvcnRFYXJseVNlbGVjdDogZmFsc2VcbiAgdGFyZ2V0U2VsZWN0ZWQ6IG51bGxcbiAgY2FuRWFybHlTZWxlY3Q6IC0+XG4gICAgQHN1cHBvcnRFYXJseVNlbGVjdCBhbmQgbm90IEBpc1JlcGVhdGVkKClcbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgIyBDYWxsZWQgd2hlbiBvcGVyYXRpb24gZmluaXNoZWRcbiAgIyBUaGlzIGlzIGVzc2VudGlhbGx5IHRvIHJlc2V0IHN0YXRlIGZvciBgLmAgcmVwZWF0LlxuICByZXNldFN0YXRlOiAtPlxuICAgIEB0YXJnZXRTZWxlY3RlZCA9IG51bGxcbiAgICBAb2NjdXJyZW5jZVNlbGVjdGVkID0gZmFsc2VcblxuICAjIFR3byBjaGVja3BvaW50IGZvciBkaWZmZXJlbnQgcHVycG9zZVxuICAjIC0gb25lIGZvciB1bmRvKGhhbmRsZWQgYnkgbW9kZU1hbmFnZXIpXG4gICMgLSBvbmUgZm9yIHByZXNlcnZlIGxhc3QgaW5zZXJ0ZWQgdGV4dFxuICBjcmVhdGVCdWZmZXJDaGVja3BvaW50OiAocHVycG9zZSkgLT5cbiAgICBAYnVmZmVyQ2hlY2twb2ludEJ5UHVycG9zZSA/PSB7fVxuICAgIEBidWZmZXJDaGVja3BvaW50QnlQdXJwb3NlW3B1cnBvc2VdID0gQGVkaXRvci5jcmVhdGVDaGVja3BvaW50KClcblxuICBnZXRCdWZmZXJDaGVja3BvaW50OiAocHVycG9zZSkgLT5cbiAgICBAYnVmZmVyQ2hlY2twb2ludEJ5UHVycG9zZT9bcHVycG9zZV1cblxuICBkZWxldGVCdWZmZXJDaGVja3BvaW50OiAocHVycG9zZSkgLT5cbiAgICBpZiBAYnVmZmVyQ2hlY2twb2ludEJ5UHVycG9zZT9cbiAgICAgIGRlbGV0ZSBAYnVmZmVyQ2hlY2twb2ludEJ5UHVycG9zZVtwdXJwb3NlXVxuXG4gIGdyb3VwQ2hhbmdlc1NpbmNlQnVmZmVyQ2hlY2twb2ludDogKHB1cnBvc2UpIC0+XG4gICAgaWYgY2hlY2twb2ludCA9IEBnZXRCdWZmZXJDaGVja3BvaW50KHB1cnBvc2UpXG4gICAgICBAZWRpdG9yLmdyb3VwQ2hhbmdlc1NpbmNlQ2hlY2twb2ludChjaGVja3BvaW50KVxuICAgICAgQGRlbGV0ZUJ1ZmZlckNoZWNrcG9pbnQocHVycG9zZSlcblxuICBuZWVkU3RheTogLT5cbiAgICBAc3RheUF0U2FtZVBvc2l0aW9uID9cbiAgICAgIChAaXNPY2N1cnJlbmNlKCkgYW5kIEBnZXRDb25maWcoJ3N0YXlPbk9jY3VycmVuY2UnKSkgb3IgQGdldENvbmZpZyhAc3RheU9wdGlvbk5hbWUpXG5cbiAgbmVlZFN0YXlPblJlc3RvcmU6IC0+XG4gICAgQHN0YXlBdFNhbWVQb3NpdGlvbiA/XG4gICAgICAoQGlzT2NjdXJyZW5jZSgpIGFuZCBAZ2V0Q29uZmlnKCdzdGF5T25PY2N1cnJlbmNlJykgYW5kIEBvY2N1cnJlbmNlU2VsZWN0ZWQpIG9yIEBnZXRDb25maWcoQHN0YXlPcHRpb25OYW1lKVxuXG4gIGlzT2NjdXJyZW5jZTogLT5cbiAgICBAb2NjdXJyZW5jZVxuXG4gIHNldE9jY3VycmVuY2U6IChAb2NjdXJyZW5jZSkgLT5cbiAgICBAb2NjdXJyZW5jZVxuXG4gIHNldE1hcmtGb3JDaGFuZ2U6IChyYW5nZSkgLT5cbiAgICBAdmltU3RhdGUubWFyay5zZXRSYW5nZSgnWycsICddJywgcmFuZ2UpXG5cbiAgbmVlZEZsYXNoOiAtPlxuICAgIHJldHVybiB1bmxlc3MgQGZsYXNoVGFyZ2V0XG4gICAge21vZGUsIHN1Ym1vZGV9ID0gQHZpbVN0YXRlXG4gICAgaWYgbW9kZSBpc250ICd2aXN1YWwnIG9yIChAdGFyZ2V0LmlzTW90aW9uKCkgYW5kIHN1Ym1vZGUgaXNudCBAdGFyZ2V0Lndpc2UpXG4gICAgICBAZ2V0Q29uZmlnKCdmbGFzaE9uT3BlcmF0ZScpIGFuZCAoQGdldE5hbWUoKSBub3QgaW4gQGdldENvbmZpZygnZmxhc2hPbk9wZXJhdGVCbGFja2xpc3QnKSlcblxuICBmbGFzaElmTmVjZXNzYXJ5OiAocmFuZ2VzKSAtPlxuICAgIHJldHVybiB1bmxlc3MgQG5lZWRGbGFzaCgpXG4gICAgQHZpbVN0YXRlLmZsYXNoKHJhbmdlcywgdHlwZTogQGdldEZsYXNoVHlwZSgpKVxuXG4gIGZsYXNoQ2hhbmdlSWZOZWNlc3Nhcnk6IC0+XG4gICAgcmV0dXJuIHVubGVzcyBAbmVlZEZsYXNoKClcblxuICAgIEBvbkRpZEZpbmlzaE9wZXJhdGlvbiA9PlxuICAgICAgaWYgQGZsYXNoQ2hlY2twb2ludCBpcyAnZGlkLWZpbmlzaCdcbiAgICAgICAgcmFuZ2VzID0gQG11dGF0aW9uTWFuYWdlci5nZXRNYXJrZXJCdWZmZXJSYW5nZXMoKS5maWx0ZXIgKHJhbmdlKSAtPiBub3QgcmFuZ2UuaXNFbXB0eSgpXG4gICAgICBlbHNlXG4gICAgICAgIHJhbmdlcyA9IEBtdXRhdGlvbk1hbmFnZXIuZ2V0QnVmZmVyUmFuZ2VzRm9yQ2hlY2twb2ludChAZmxhc2hDaGVja3BvaW50KVxuICAgICAgQHZpbVN0YXRlLmZsYXNoKHJhbmdlcywgdHlwZTogQGdldEZsYXNoVHlwZSgpKVxuXG4gIGdldEZsYXNoVHlwZTogLT5cbiAgICBpZiBAb2NjdXJyZW5jZVNlbGVjdGVkXG4gICAgICBAZmxhc2hUeXBlRm9yT2NjdXJyZW5jZVxuICAgIGVsc2VcbiAgICAgIEBmbGFzaFR5cGVcblxuICB0cmFja0NoYW5nZUlmTmVjZXNzYXJ5OiAtPlxuICAgIHJldHVybiB1bmxlc3MgQHRyYWNrQ2hhbmdlXG5cbiAgICBAb25EaWRGaW5pc2hPcGVyYXRpb24gPT5cbiAgICAgIGlmIG1hcmtlciA9IEBtdXRhdGlvbk1hbmFnZXIuZ2V0TXV0YXRpb25Gb3JTZWxlY3Rpb24oQGVkaXRvci5nZXRMYXN0U2VsZWN0aW9uKCkpPy5tYXJrZXJcbiAgICAgICAgQHNldE1hcmtGb3JDaGFuZ2UobWFya2VyLmdldEJ1ZmZlclJhbmdlKCkpXG5cbiAgY29uc3RydWN0b3I6IC0+XG4gICAgc3VwZXJcbiAgICB7QG11dGF0aW9uTWFuYWdlciwgQG9jY3VycmVuY2VNYW5hZ2VyLCBAcGVyc2lzdGVudFNlbGVjdGlvbn0gPSBAdmltU3RhdGVcbiAgICBAc3Vic2NyaWJlUmVzZXRPY2N1cnJlbmNlUGF0dGVybklmTmVlZGVkKClcbiAgICBAaW5pdGlhbGl6ZSgpXG4gICAgQG9uRGlkU2V0T3BlcmF0b3JNb2RpZmllcihAc2V0TW9kaWZpZXIuYmluZCh0aGlzKSlcblxuICAgICMgV2hlbiBwcmVzZXQtb2NjdXJyZW5jZSB3YXMgZXhpc3RzLCBvcGVyYXRlIG9uIG9jY3VycmVuY2Utd2lzZVxuICAgIGlmIEBhY2NlcHRQcmVzZXRPY2N1cnJlbmNlIGFuZCBAb2NjdXJyZW5jZU1hbmFnZXIuaGFzTWFya2VycygpXG4gICAgICBAc2V0T2NjdXJyZW5jZSh0cnVlKVxuXG4gICAgIyBbRklYTUVdIE9SREVSLU1BVFRFUlxuICAgICMgVG8gcGljayBjdXJzb3Itd29yZCB0byBmaW5kIG9jY3VycmVuY2UgYmFzZSBwYXR0ZXJuLlxuICAgICMgVGhpcyBoYXMgdG8gYmUgZG9uZSBCRUZPUkUgY29udmVydGluZyBwZXJzaXN0ZW50LXNlbGVjdGlvbiBpbnRvIHJlYWwtc2VsZWN0aW9uLlxuICAgICMgU2luY2Ugd2hlbiBwZXJzaXN0ZW50LXNlbGVjdGlvbiBpcyBhY3R1YWxsIHNlbGVjdGVkLCBpdCBjaGFuZ2UgY3Vyc29yIHBvc2l0aW9uLlxuICAgIGlmIEBpc09jY3VycmVuY2UoKSBhbmQgbm90IEBvY2N1cnJlbmNlTWFuYWdlci5oYXNNYXJrZXJzKClcbiAgICAgIEBvY2N1cnJlbmNlTWFuYWdlci5hZGRQYXR0ZXJuKEBwYXR0ZXJuRm9yT2NjdXJyZW5jZSA/IEBnZXRQYXR0ZXJuRm9yT2NjdXJyZW5jZVR5cGUoQG9jY3VycmVuY2VUeXBlKSlcblxuICAgICMgVGhpcyBjaGFuZ2UgY3Vyc29yIHBvc2l0aW9uLlxuICAgIGlmIEBzZWxlY3RQZXJzaXN0ZW50U2VsZWN0aW9uSWZOZWNlc3NhcnkoKVxuICAgICAgaWYgQGlzTW9kZSgndmlzdWFsJylcbiAgICAgICAgIyBbRklYTUVdIFN5bmMgc2VsZWN0aW9uLXdpc2UgdGhpcyBwaGFzZT9cbiAgICAgICAgIyBlLmcuIHNlbGVjdGVkIHBlcnNpc3RlZCBzZWxlY3Rpb24gY29udmVydCB0byB2QiBzZWwgaW4gdkItbW9kZT9cbiAgICAgICAgbnVsbFxuICAgICAgZWxzZVxuICAgICAgICBAdmltU3RhdGUubW9kZU1hbmFnZXIuYWN0aXZhdGUoJ3Zpc3VhbCcsIHN3cmFwLmRldGVjdFdpc2UoQGVkaXRvcikpXG5cbiAgICBAdGFyZ2V0ID0gJ0N1cnJlbnRTZWxlY3Rpb24nIGlmIEBpc01vZGUoJ3Zpc3VhbCcpIGFuZCBAYWNjZXB0Q3VycmVudFNlbGVjdGlvblxuICAgIEBzZXRUYXJnZXQoQG5ldyhAdGFyZ2V0KSkgaWYgXy5pc1N0cmluZyhAdGFyZ2V0KVxuXG4gIHN1YnNjcmliZVJlc2V0T2NjdXJyZW5jZVBhdHRlcm5JZk5lZWRlZDogLT5cbiAgICAjIFtDQVVUSU9OXVxuICAgICMgVGhpcyBtZXRob2QgaGFzIHRvIGJlIGNhbGxlZCBpbiBQUk9QRVIgdGltaW5nLlxuICAgICMgSWYgb2NjdXJyZW5jZSBpcyB0cnVlIGJ1dCBubyBwcmVzZXQtb2NjdXJyZW5jZVxuICAgICMgVHJlYXQgdGhhdCBgb2NjdXJyZW5jZWAgaXMgQk9VTkRFRCB0byBvcGVyYXRvciBpdHNlbGYsIHNvIGNsZWFucCBhdCBmaW5pc2hlZC5cbiAgICBpZiBAb2NjdXJyZW5jZSBhbmQgbm90IEBvY2N1cnJlbmNlTWFuYWdlci5oYXNNYXJrZXJzKClcbiAgICAgIEBvbkRpZFJlc2V0T3BlcmF0aW9uU3RhY2soPT4gQG9jY3VycmVuY2VNYW5hZ2VyLnJlc2V0UGF0dGVybnMoKSlcblxuICBzZXRNb2RpZmllcjogKG9wdGlvbnMpIC0+XG4gICAgaWYgb3B0aW9ucy53aXNlP1xuICAgICAgQHdpc2UgPSBvcHRpb25zLndpc2VcbiAgICAgIHJldHVyblxuXG4gICAgaWYgb3B0aW9ucy5vY2N1cnJlbmNlP1xuICAgICAgQHNldE9jY3VycmVuY2Uob3B0aW9ucy5vY2N1cnJlbmNlKVxuICAgICAgaWYgQGlzT2NjdXJyZW5jZSgpXG4gICAgICAgIEBvY2N1cnJlbmNlVHlwZSA9IG9wdGlvbnMub2NjdXJyZW5jZVR5cGVcbiAgICAgICAgIyBUaGlzIGlzIG8gbW9kaWZpZXIgY2FzZShlLmcuIGBjIG8gcGAsIGBkIE8gZmApXG4gICAgICAgICMgV2UgUkVTRVQgZXhpc3Rpbmcgb2NjdXJlbmNlLW1hcmtlciB3aGVuIGBvYCBvciBgT2AgbW9kaWZpZXIgaXMgdHlwZWQgYnkgdXNlci5cbiAgICAgICAgcGF0dGVybiA9IEBnZXRQYXR0ZXJuRm9yT2NjdXJyZW5jZVR5cGUoQG9jY3VycmVuY2VUeXBlKVxuICAgICAgICBAb2NjdXJyZW5jZU1hbmFnZXIuYWRkUGF0dGVybihwYXR0ZXJuLCB7cmVzZXQ6IHRydWUsIEBvY2N1cnJlbmNlVHlwZX0pXG4gICAgICAgIEBvbkRpZFJlc2V0T3BlcmF0aW9uU3RhY2soPT4gQG9jY3VycmVuY2VNYW5hZ2VyLnJlc2V0UGF0dGVybnMoKSlcblxuICAjIHJldHVybiB0cnVlL2ZhbHNlIHRvIGluZGljYXRlIHN1Y2Nlc3NcbiAgc2VsZWN0UGVyc2lzdGVudFNlbGVjdGlvbklmTmVjZXNzYXJ5OiAtPlxuICAgIGlmIEBhY2NlcHRQZXJzaXN0ZW50U2VsZWN0aW9uIGFuZFxuICAgICAgICBAZ2V0Q29uZmlnKCdhdXRvU2VsZWN0UGVyc2lzdGVudFNlbGVjdGlvbk9uT3BlcmF0ZScpIGFuZFxuICAgICAgICBub3QgQHBlcnNpc3RlbnRTZWxlY3Rpb24uaXNFbXB0eSgpXG5cbiAgICAgIEBwZXJzaXN0ZW50U2VsZWN0aW9uLnNlbGVjdCgpXG4gICAgICBAZWRpdG9yLm1lcmdlSW50ZXJzZWN0aW5nU2VsZWN0aW9ucygpXG4gICAgICBzd3JhcC5zYXZlUHJvcGVydGllcyhAZWRpdG9yKVxuXG4gICAgICB0cnVlXG4gICAgZWxzZVxuICAgICAgZmFsc2VcblxuICBnZXRQYXR0ZXJuRm9yT2NjdXJyZW5jZVR5cGU6IChvY2N1cnJlbmNlVHlwZSkgLT5cbiAgICBzd2l0Y2ggb2NjdXJyZW5jZVR5cGVcbiAgICAgIHdoZW4gJ2Jhc2UnXG4gICAgICAgIGdldFdvcmRQYXR0ZXJuQXRCdWZmZXJQb3NpdGlvbihAZWRpdG9yLCBAZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKSlcbiAgICAgIHdoZW4gJ3N1YndvcmQnXG4gICAgICAgIGdldFN1YndvcmRQYXR0ZXJuQXRCdWZmZXJQb3NpdGlvbihAZWRpdG9yLCBAZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKSlcblxuICAjIHRhcmdldCBpcyBUZXh0T2JqZWN0IG9yIE1vdGlvbiB0byBvcGVyYXRlIG9uLlxuICBzZXRUYXJnZXQ6IChAdGFyZ2V0KSAtPlxuICAgIEB0YXJnZXQuc2V0T3BlcmF0b3IodGhpcylcbiAgICBAZW1pdERpZFNldFRhcmdldCh0aGlzKVxuXG4gICAgaWYgQGNhbkVhcmx5U2VsZWN0KClcbiAgICAgIEBub3JtYWxpemVTZWxlY3Rpb25zSWZOZWNlc3NhcnkoKVxuICAgICAgQGNyZWF0ZUJ1ZmZlckNoZWNrcG9pbnQoJ3VuZG8nKVxuICAgICAgQHNlbGVjdFRhcmdldCgpXG4gICAgdGhpc1xuXG4gIHNldFRleHRUb1JlZ2lzdGVyRm9yU2VsZWN0aW9uOiAoc2VsZWN0aW9uKSAtPlxuICAgIEBzZXRUZXh0VG9SZWdpc3RlcihzZWxlY3Rpb24uZ2V0VGV4dCgpLCBzZWxlY3Rpb24pXG5cbiAgc2V0VGV4dFRvUmVnaXN0ZXI6ICh0ZXh0LCBzZWxlY3Rpb24pIC0+XG4gICAgdGV4dCArPSBcIlxcblwiIGlmIChAdGFyZ2V0LmlzTGluZXdpc2UoKSBhbmQgKG5vdCB0ZXh0LmVuZHNXaXRoKCdcXG4nKSkpXG4gICAgQHZpbVN0YXRlLnJlZ2lzdGVyLnNldCh7dGV4dCwgc2VsZWN0aW9ufSkgaWYgdGV4dFxuXG4gIG5vcm1hbGl6ZVNlbGVjdGlvbnNJZk5lY2Vzc2FyeTogLT5cbiAgICBpZiBAdGFyZ2V0Py5pc01vdGlvbigpIGFuZCBAaXNNb2RlKCd2aXN1YWwnKVxuICAgICAgQHZpbVN0YXRlLm1vZGVNYW5hZ2VyLm5vcm1hbGl6ZVNlbGVjdGlvbnMoKVxuXG4gIHN0YXJ0TXV0YXRpb246IChmbikgLT5cbiAgICBpZiBAY2FuRWFybHlTZWxlY3QoKVxuICAgICAgIyAtIFNraXAgc2VsZWN0aW9uIG5vcm1hbGl6YXRpb246IGFscmVhZHkgbm9ybWFsaXplZCBiZWZvcmUgQHNlbGVjdFRhcmdldCgpXG4gICAgICAjIC0gTWFudWFsIGNoZWNrcG9pbnQgZ3JvdXBpbmc6IHRvIGNyZWF0ZSBjaGVja3BvaW50IGJlZm9yZSBAc2VsZWN0VGFyZ2V0KClcbiAgICAgIGZuKClcbiAgICAgIEBlbWl0V2lsbEZpbmlzaE11dGF0aW9uKClcbiAgICAgIEBncm91cENoYW5nZXNTaW5jZUJ1ZmZlckNoZWNrcG9pbnQoJ3VuZG8nKVxuXG4gICAgZWxzZVxuICAgICAgQG5vcm1hbGl6ZVNlbGVjdGlvbnNJZk5lY2Vzc2FyeSgpXG4gICAgICBAZWRpdG9yLnRyYW5zYWN0ID0+XG4gICAgICAgIGZuKClcbiAgICAgICAgQGVtaXRXaWxsRmluaXNoTXV0YXRpb24oKVxuXG4gICAgQGVtaXREaWRGaW5pc2hNdXRhdGlvbigpXG5cbiAgIyBNYWluXG4gIGV4ZWN1dGU6IC0+XG4gICAgQHN0YXJ0TXV0YXRpb24gPT5cbiAgICAgIGlmIEBzZWxlY3RUYXJnZXQoKVxuICAgICAgICBpZiBAbXV0YXRlU2VsZWN0aW9uT3JkZXJkXG4gICAgICAgICAgc2VsZWN0aW9ucyA9IEBlZGl0b3IuZ2V0U2VsZWN0aW9uc09yZGVyZWRCeUJ1ZmZlclBvc2l0aW9uKClcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHNlbGVjdGlvbnMgPSBAZWRpdG9yLmdldFNlbGVjdGlvbnMoKVxuICAgICAgICBmb3Igc2VsZWN0aW9uIGluIHNlbGVjdGlvbnNcbiAgICAgICAgICBAbXV0YXRlU2VsZWN0aW9uKHNlbGVjdGlvbilcbiAgICAgICAgQHJlc3RvcmVDdXJzb3JQb3NpdGlvbnNJZk5lY2Vzc2FyeSgpXG5cbiAgICAjIEV2ZW4gdGhvdWdoIHdlIGZhaWwgdG8gc2VsZWN0IHRhcmdldCBhbmQgZmFpbCB0byBtdXRhdGUsXG4gICAgIyB3ZSBoYXZlIHRvIHJldHVybiB0byBub3JtYWwtbW9kZSBmcm9tIG9wZXJhdG9yLXBlbmRpbmcgb3IgdmlzdWFsXG4gICAgQGFjdGl2YXRlTW9kZSgnbm9ybWFsJylcblxuICAjIFJldHVybiB0cnVlIHVubGVzcyBhbGwgc2VsZWN0aW9uIGlzIGVtcHR5LlxuICBzZWxlY3RUYXJnZXQ6IC0+XG4gICAgcmV0dXJuIEB0YXJnZXRTZWxlY3RlZCBpZiBAdGFyZ2V0U2VsZWN0ZWQ/XG4gICAgQG11dGF0aW9uTWFuYWdlci5pbml0KHVzZU1hcmtlcjogQG5lZWRTdGF5KCkgYW5kIEBzdGF5QnlNYXJrZXIpXG5cbiAgICAjIEN1cnJlbnRseSBvbmx5IG1vdGlvbiBoYXZlIGZvcmNlV2lzZSBtZXRob2RzXG4gICAgQHRhcmdldC5mb3JjZVdpc2U/KEB3aXNlKSBpZiBAd2lzZT9cbiAgICBAZW1pdFdpbGxTZWxlY3RUYXJnZXQoKVxuXG4gICAgIyBBbGxvdyBjdXJzb3IgcG9zaXRpb24gYWRqdXN0bWVudCAnb24td2lsbC1zZWxlY3QtdGFyZ2V0JyBob29rLlxuICAgICMgc28gY2hlY2twb2ludCBjb21lcyBBRlRFUiBAZW1pdFdpbGxTZWxlY3RUYXJnZXQoKVxuICAgIEBtdXRhdGlvbk1hbmFnZXIuc2V0Q2hlY2twb2ludCgnd2lsbC1zZWxlY3QnKVxuXG4gICAgIyBOT1RFXG4gICAgIyBTaW5jZSBNb3ZlVG9OZXh0T2NjdXJyZW5jZSwgTW92ZVRvUHJldmlvdXNPY2N1cnJlbmNlIG1vdGlvbiBtb3ZlIGJ5XG4gICAgIyAgb2NjdXJyZW5jZS1tYXJrZXIsIG9jY3VycmVuY2UtbWFya2VyIGhhcyB0byBiZSBjcmVhdGVkIEJFRk9SRSBgQHRhcmdldC5leGVjdXRlKClgXG4gICAgIyBBbmQgd2hlbiByZXBlYXRlZCwgb2NjdXJyZW5jZSBwYXR0ZXJuIGlzIGFscmVhZHkgY2FjaGVkIGF0IEBwYXR0ZXJuRm9yT2NjdXJyZW5jZVxuICAgIGlmIEBpc1JlcGVhdGVkKCkgYW5kIEBpc09jY3VycmVuY2UoKSBhbmQgbm90IEBvY2N1cnJlbmNlTWFuYWdlci5oYXNNYXJrZXJzKClcbiAgICAgIEBvY2N1cnJlbmNlTWFuYWdlci5hZGRQYXR0ZXJuKEBwYXR0ZXJuRm9yT2NjdXJyZW5jZSwge0BvY2N1cnJlbmNlVHlwZX0pXG5cbiAgICBAdGFyZ2V0LmV4ZWN1dGUoKVxuXG4gICAgQG11dGF0aW9uTWFuYWdlci5zZXRDaGVja3BvaW50KCdkaWQtc2VsZWN0JylcbiAgICBpZiBAaXNPY2N1cnJlbmNlKClcbiAgICAgICMgVG8gcmVwb2VhdChgLmApIG9wZXJhdGlvbiB3aGVyZSBtdWx0aXBsZSBvY2N1cnJlbmNlIHBhdHRlcm5zIHdhcyBzZXQuXG4gICAgICAjIEhlcmUgd2Ugc2F2ZSBwYXR0ZXJucyB3aGljaCByZXByZXNlbnQgdW5pb25lZCByZWdleCB3aGljaCBAb2NjdXJyZW5jZU1hbmFnZXIga25vd3MuXG4gICAgICBAcGF0dGVybkZvck9jY3VycmVuY2UgPz0gQG9jY3VycmVuY2VNYW5hZ2VyLmJ1aWxkUGF0dGVybigpXG5cbiAgICAgIGlmIEBvY2N1cnJlbmNlTWFuYWdlci5zZWxlY3QoKVxuICAgICAgICAjIFRvIHNraXAgcmVzdG9yZWluZyBwb3NpdGlvbiBmcm9tIHNlbGVjdGlvbiBwcm9wIHdoZW4gc2hpZnQgdmlzdWFsLW1vZGUgc3VibW9kZSBvbiBTZWxlY3RPY2N1cnJlbmNlXG4gICAgICAgIHN3cmFwLmNsZWFyUHJvcGVydGllcyhAZWRpdG9yKVxuXG4gICAgICAgIEBvY2N1cnJlbmNlU2VsZWN0ZWQgPSB0cnVlXG4gICAgICAgIEBtdXRhdGlvbk1hbmFnZXIuc2V0Q2hlY2twb2ludCgnZGlkLXNlbGVjdC1vY2N1cnJlbmNlJylcblxuICAgIGlmIGhhdmVTb21lTm9uRW1wdHlTZWxlY3Rpb24oQGVkaXRvcikgb3IgQHRhcmdldC5nZXROYW1lKCkgaXMgXCJFbXB0eVwiXG4gICAgICBAZW1pdERpZFNlbGVjdFRhcmdldCgpXG4gICAgICBAZmxhc2hDaGFuZ2VJZk5lY2Vzc2FyeSgpXG4gICAgICBAdHJhY2tDaGFuZ2VJZk5lY2Vzc2FyeSgpXG4gICAgICBAdGFyZ2V0U2VsZWN0ZWQgPSB0cnVlXG4gICAgICB0cnVlXG4gICAgZWxzZVxuICAgICAgQGVtaXREaWRGYWlsU2VsZWN0VGFyZ2V0KClcbiAgICAgIEB0YXJnZXRTZWxlY3RlZCA9IGZhbHNlXG4gICAgICBmYWxzZVxuXG4gIHJlc3RvcmVDdXJzb3JQb3NpdGlvbnNJZk5lY2Vzc2FyeTogLT5cbiAgICByZXR1cm4gdW5sZXNzIEByZXN0b3JlUG9zaXRpb25zXG4gICAgb3B0aW9ucyA9XG4gICAgICBzdGF5OiBAbmVlZFN0YXlPblJlc3RvcmUoKVxuICAgICAgb2NjdXJyZW5jZVNlbGVjdGVkOiBAb2NjdXJyZW5jZVNlbGVjdGVkXG4gICAgICBpc0Jsb2Nrd2lzZTogQHRhcmdldD8uaXNCbG9ja3dpc2U/KClcblxuICAgIEBtdXRhdGlvbk1hbmFnZXIucmVzdG9yZUN1cnNvclBvc2l0aW9ucyhvcHRpb25zKVxuICAgIEBlbWl0RGlkUmVzdG9yZUN1cnNvclBvc2l0aW9ucygpXG5cbiMgU2VsZWN0XG4jIFdoZW4gdGV4dC1vYmplY3QgaXMgaW52b2tlZCBmcm9tIG5vcm1hbCBvciB2aXVzYWwtbW9kZSwgb3BlcmF0aW9uIHdvdWxkIGJlXG4jICA9PiBTZWxlY3Qgb3BlcmF0b3Igd2l0aCB0YXJnZXQ9dGV4dC1vYmplY3RcbiMgV2hlbiBtb3Rpb24gaXMgaW52b2tlZCBmcm9tIHZpc3VhbC1tb2RlLCBvcGVyYXRpb24gd291bGQgYmVcbiMgID0+IFNlbGVjdCBvcGVyYXRvciB3aXRoIHRhcmdldD1tb3Rpb24pXG4jID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5jbGFzcyBTZWxlY3QgZXh0ZW5kcyBPcGVyYXRvclxuICBAZXh0ZW5kKGZhbHNlKVxuICBmbGFzaFRhcmdldDogZmFsc2VcbiAgcmVjb3JkYWJsZTogZmFsc2VcbiAgYWNjZXB0UHJlc2V0T2NjdXJyZW5jZTogZmFsc2VcbiAgYWNjZXB0UGVyc2lzdGVudFNlbGVjdGlvbjogZmFsc2VcblxuICBleGVjdXRlOiAtPlxuICAgIEBzdGFydE11dGF0aW9uKEBzZWxlY3RUYXJnZXQuYmluZCh0aGlzKSlcbiAgICBpZiBAdGFyZ2V0LmlzVGV4dE9iamVjdCgpIGFuZCB3aXNlID0gQHRhcmdldC5nZXRXaXNlKClcbiAgICAgIGlmIEBpc01vZGUoJ3Zpc3VhbCcpXG4gICAgICAgIHN3aXRjaCB3aXNlXG4gICAgICAgICAgd2hlbiAnY2hhcmFjdGVyd2lzZSdcbiAgICAgICAgICAgIHN3cmFwLnNhdmVQcm9wZXJ0aWVzKEBlZGl0b3IpXG4gICAgICAgICAgd2hlbiAnbGluZXdpc2UnXG4gICAgICAgICAgICBzd3JhcC5maXhQcm9wZXJ0aWVzRm9yTGluZXdpc2UoQGVkaXRvcilcbiAgICAgIEBhY3RpdmF0ZU1vZGVJZk5lY2Vzc2FyeSgndmlzdWFsJywgd2lzZSlcblxuY2xhc3MgU2VsZWN0TGF0ZXN0Q2hhbmdlIGV4dGVuZHMgU2VsZWN0XG4gIEBleHRlbmQoKVxuICBAZGVzY3JpcHRpb246IFwiU2VsZWN0IGxhdGVzdCB5YW5rZWQgb3IgY2hhbmdlZCByYW5nZVwiXG4gIHRhcmdldDogJ0FMYXRlc3RDaGFuZ2UnXG5cbmNsYXNzIFNlbGVjdFByZXZpb3VzU2VsZWN0aW9uIGV4dGVuZHMgU2VsZWN0XG4gIEBleHRlbmQoKVxuICB0YXJnZXQ6IFwiUHJldmlvdXNTZWxlY3Rpb25cIlxuXG5jbGFzcyBTZWxlY3RQZXJzaXN0ZW50U2VsZWN0aW9uIGV4dGVuZHMgU2VsZWN0XG4gIEBleHRlbmQoKVxuICBAZGVzY3JpcHRpb246IFwiU2VsZWN0IHBlcnNpc3RlbnQtc2VsZWN0aW9uIGFuZCBjbGVhciBhbGwgcGVyc2lzdGVudC1zZWxlY3Rpb24sIGl0J3MgbGlrZSBjb252ZXJ0IHRvIHJlYWwtc2VsZWN0aW9uXCJcbiAgdGFyZ2V0OiBcIkFQZXJzaXN0ZW50U2VsZWN0aW9uXCJcblxuY2xhc3MgU2VsZWN0T2NjdXJyZW5jZSBleHRlbmRzIE9wZXJhdG9yXG4gIEBleHRlbmQoKVxuICBAZGVzY3JpcHRpb246IFwiQWRkIHNlbGVjdGlvbiBvbnRvIGVhY2ggbWF0Y2hpbmcgd29yZCB3aXRoaW4gdGFyZ2V0IHJhbmdlXCJcbiAgb2NjdXJyZW5jZTogdHJ1ZVxuXG4gIGV4ZWN1dGU6IC0+XG4gICAgQHN0YXJ0TXV0YXRpb24gPT5cbiAgICAgIGlmIEBzZWxlY3RUYXJnZXQoKVxuICAgICAgICBAYWN0aXZhdGVNb2RlSWZOZWNlc3NhcnkoJ3Zpc3VhbCcsIHN3cmFwLmRldGVjdFdpc2UoQGVkaXRvcikpXG5cbiMgUGVyc2lzdGVudCBTZWxlY3Rpb25cbiMgPT09PT09PT09PT09PT09PT09PT09PT09PVxuY2xhc3MgQ3JlYXRlUGVyc2lzdGVudFNlbGVjdGlvbiBleHRlbmRzIE9wZXJhdG9yXG4gIEBleHRlbmQoKVxuICBmbGFzaFRhcmdldDogZmFsc2VcbiAgc3RheUF0U2FtZVBvc2l0aW9uOiB0cnVlXG4gIGFjY2VwdFByZXNldE9jY3VycmVuY2U6IGZhbHNlXG4gIGFjY2VwdFBlcnNpc3RlbnRTZWxlY3Rpb246IGZhbHNlXG5cbiAgZXhlY3V0ZTogLT5cbiAgICBAcmVzdG9yZVBvc2l0aW9ucyA9IG5vdCBAaXNNb2RlKCd2aXN1YWwnLCAnYmxvY2t3aXNlJylcbiAgICBzdXBlclxuXG4gIG11dGF0ZVNlbGVjdGlvbjogKHNlbGVjdGlvbikgLT5cbiAgICBAcGVyc2lzdGVudFNlbGVjdGlvbi5tYXJrQnVmZmVyUmFuZ2Uoc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKCkpXG5cbmNsYXNzIFRvZ2dsZVBlcnNpc3RlbnRTZWxlY3Rpb24gZXh0ZW5kcyBDcmVhdGVQZXJzaXN0ZW50U2VsZWN0aW9uXG4gIEBleHRlbmQoKVxuXG4gIGlzQ29tcGxldGU6IC0+XG4gICAgcG9pbnQgPSBAZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKClcbiAgICBAbWFya2VyVG9SZW1vdmUgPSBAcGVyc2lzdGVudFNlbGVjdGlvbi5nZXRNYXJrZXJBdFBvaW50KHBvaW50KVxuICAgIGlmIEBtYXJrZXJUb1JlbW92ZVxuICAgICAgdHJ1ZVxuICAgIGVsc2VcbiAgICAgIHN1cGVyXG5cbiAgZXhlY3V0ZTogLT5cbiAgICBpZiBAbWFya2VyVG9SZW1vdmVcbiAgICAgIEBtYXJrZXJUb1JlbW92ZS5kZXN0cm95KClcbiAgICBlbHNlXG4gICAgICBzdXBlclxuXG4jIFByZXNldCBPY2N1cnJlbmNlXG4jID09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIFRvZ2dsZVByZXNldE9jY3VycmVuY2UgZXh0ZW5kcyBPcGVyYXRvclxuICBAZXh0ZW5kKClcbiAgZmxhc2hUYXJnZXQ6IGZhbHNlXG4gIHJlcXVpcmVUYXJnZXQ6IGZhbHNlXG4gIGFjY2VwdFByZXNldE9jY3VycmVuY2U6IGZhbHNlXG4gIGFjY2VwdFBlcnNpc3RlbnRTZWxlY3Rpb246IGZhbHNlXG4gIG9jY3VycmVuY2VUeXBlOiAnYmFzZSdcblxuICBleGVjdXRlOiAtPlxuICAgIGlmIG1hcmtlciA9IEBvY2N1cnJlbmNlTWFuYWdlci5nZXRNYXJrZXJBdFBvaW50KEBlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKSlcbiAgICAgIEBvY2N1cnJlbmNlTWFuYWdlci5kZXN0cm95TWFya2VycyhbbWFya2VyXSlcbiAgICBlbHNlXG4gICAgICBwYXR0ZXJuID0gbnVsbFxuICAgICAgaXNOYXJyb3dlZCA9IEB2aW1TdGF0ZS5tb2RlTWFuYWdlci5pc05hcnJvd2VkKClcblxuICAgICAgaWYgQGlzTW9kZSgndmlzdWFsJykgYW5kIG5vdCBpc05hcnJvd2VkXG4gICAgICAgIEBvY2N1cnJlbmNlVHlwZSA9ICdiYXNlJ1xuICAgICAgICBwYXR0ZXJuID0gbmV3IFJlZ0V4cChfLmVzY2FwZVJlZ0V4cChAZWRpdG9yLmdldFNlbGVjdGVkVGV4dCgpKSwgJ2cnKVxuICAgICAgZWxzZVxuICAgICAgICBwYXR0ZXJuID0gQGdldFBhdHRlcm5Gb3JPY2N1cnJlbmNlVHlwZShAb2NjdXJyZW5jZVR5cGUpXG5cbiAgICAgIEBvY2N1cnJlbmNlTWFuYWdlci5hZGRQYXR0ZXJuKHBhdHRlcm4sIHtAb2NjdXJyZW5jZVR5cGV9KVxuICAgICAgQG9jY3VycmVuY2VNYW5hZ2VyLnNhdmVMYXN0UGF0dGVybihAb2NjdXJyZW5jZVR5cGUpXG5cbiAgICAgIEBhY3RpdmF0ZU1vZGUoJ25vcm1hbCcpIHVubGVzcyBpc05hcnJvd2VkXG5cbmNsYXNzIFRvZ2dsZVByZXNldFN1YndvcmRPY2N1cnJlbmNlIGV4dGVuZHMgVG9nZ2xlUHJlc2V0T2NjdXJyZW5jZVxuICBAZXh0ZW5kKClcbiAgb2NjdXJyZW5jZVR5cGU6ICdzdWJ3b3JkJ1xuXG4jIFdhbnQgdG8gcmVuYW1lIFJlc3RvcmVPY2N1cnJlbmNlTWFya2VyXG5jbGFzcyBBZGRQcmVzZXRPY2N1cnJlbmNlRnJvbUxhc3RPY2N1cnJlbmNlUGF0dGVybiBleHRlbmRzIFRvZ2dsZVByZXNldE9jY3VycmVuY2VcbiAgQGV4dGVuZCgpXG4gIGV4ZWN1dGU6IC0+XG4gICAgQG9jY3VycmVuY2VNYW5hZ2VyLnJlc2V0UGF0dGVybnMoKVxuICAgIGlmIHBhdHRlcm4gPSBAdmltU3RhdGUuZ2xvYmFsU3RhdGUuZ2V0KCdsYXN0T2NjdXJyZW5jZVBhdHRlcm4nKVxuICAgICAgb2NjdXJyZW5jZVR5cGUgPSBAdmltU3RhdGUuZ2xvYmFsU3RhdGUuZ2V0KFwibGFzdE9jY3VycmVuY2VUeXBlXCIpXG4gICAgICBAb2NjdXJyZW5jZU1hbmFnZXIuYWRkUGF0dGVybihwYXR0ZXJuLCB7b2NjdXJyZW5jZVR5cGV9KVxuICAgICAgQGFjdGl2YXRlTW9kZSgnbm9ybWFsJylcblxuIyBEZWxldGVcbiMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIERlbGV0ZSBleHRlbmRzIE9wZXJhdG9yXG4gIEBleHRlbmQoKVxuICB0cmFja0NoYW5nZTogdHJ1ZVxuICBmbGFzaENoZWNrcG9pbnQ6ICdkaWQtc2VsZWN0LW9jY3VycmVuY2UnXG4gIGZsYXNoVHlwZUZvck9jY3VycmVuY2U6ICdvcGVyYXRvci1yZW1vdmUtb2NjdXJyZW5jZSdcbiAgc3RheU9wdGlvbk5hbWU6ICdzdGF5T25EZWxldGUnXG5cbiAgZXhlY3V0ZTogLT5cbiAgICBAb25EaWRTZWxlY3RUYXJnZXQgPT5cbiAgICAgIHJldHVybiBpZiBAb2NjdXJyZW5jZVNlbGVjdGVkXG4gICAgICBpZiBAdGFyZ2V0LmlzTGluZXdpc2UoKVxuICAgICAgICBAb25EaWRSZXN0b3JlQ3Vyc29yUG9zaXRpb25zID0+XG4gICAgICAgICAgQGFkanVzdEN1cnNvcihjdXJzb3IpIGZvciBjdXJzb3IgaW4gQGVkaXRvci5nZXRDdXJzb3JzKClcbiAgICBzdXBlclxuXG4gIG11dGF0ZVNlbGVjdGlvbjogKHNlbGVjdGlvbikgPT5cbiAgICBAc2V0VGV4dFRvUmVnaXN0ZXJGb3JTZWxlY3Rpb24oc2VsZWN0aW9uKVxuICAgIHNlbGVjdGlvbi5kZWxldGVTZWxlY3RlZFRleHQoKVxuXG4gIGFkanVzdEN1cnNvcjogKGN1cnNvcikgLT5cbiAgICByb3cgPSBnZXRWYWxpZFZpbUJ1ZmZlclJvdyhAZWRpdG9yLCBjdXJzb3IuZ2V0QnVmZmVyUm93KCkpXG4gICAgaWYgQG5lZWRTdGF5T25SZXN0b3JlKClcbiAgICAgIHBvaW50ID0gQG11dGF0aW9uTWFuYWdlci5nZXRJbml0aWFsUG9pbnRGb3JTZWxlY3Rpb24oY3Vyc29yLnNlbGVjdGlvbilcbiAgICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihbcm93LCBwb2ludC5jb2x1bW5dKVxuICAgIGVsc2VcbiAgICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihAZ2V0Rmlyc3RDaGFyYWN0ZXJQb3NpdGlvbkZvckJ1ZmZlclJvdyhyb3cpKVxuXG5jbGFzcyBEZWxldGVSaWdodCBleHRlbmRzIERlbGV0ZVxuICBAZXh0ZW5kKClcbiAgdGFyZ2V0OiAnTW92ZVJpZ2h0J1xuXG5jbGFzcyBEZWxldGVMZWZ0IGV4dGVuZHMgRGVsZXRlXG4gIEBleHRlbmQoKVxuICB0YXJnZXQ6ICdNb3ZlTGVmdCdcblxuY2xhc3MgRGVsZXRlVG9MYXN0Q2hhcmFjdGVyT2ZMaW5lIGV4dGVuZHMgRGVsZXRlXG4gIEBleHRlbmQoKVxuICB0YXJnZXQ6ICdNb3ZlVG9MYXN0Q2hhcmFjdGVyT2ZMaW5lJ1xuICBpbml0aWFsaXplOiAtPlxuICAgIGlmIEBpc01vZGUoJ3Zpc3VhbCcsICdibG9ja3dpc2UnKVxuICAgICAgIyBGSVhNRSBNYXliZSBiZWNhdXNlIG9mIGJ1ZyBvZiBDdXJyZW50U2VsZWN0aW9uLFxuICAgICAgIyB3ZSB1c2UgTW92ZVRvTGFzdENoYXJhY3Rlck9mTGluZSBhcyB0YXJnZXRcbiAgICAgIEBhY2NlcHRDdXJyZW50U2VsZWN0aW9uID0gZmFsc2VcbiAgICAgIHN3cmFwLnNldFJldmVyc2VkU3RhdGUoQGVkaXRvciwgZmFsc2UpICMgRW5zdXJlIGFsbCBzZWxlY3Rpb25zIHRvIHVuLXJldmVyc2VkXG4gICAgc3VwZXJcblxuY2xhc3MgRGVsZXRlTGluZSBleHRlbmRzIERlbGV0ZVxuICBAZXh0ZW5kKClcbiAgd2lzZTogJ2xpbmV3aXNlJ1xuICB0YXJnZXQ6IFwiTW92ZVRvUmVsYXRpdmVMaW5lXCJcblxuIyBZYW5rXG4jID09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIFlhbmsgZXh0ZW5kcyBPcGVyYXRvclxuICBAZXh0ZW5kKClcbiAgdHJhY2tDaGFuZ2U6IHRydWVcbiAgc3RheU9wdGlvbk5hbWU6ICdzdGF5T25ZYW5rJ1xuXG4gIG11dGF0ZVNlbGVjdGlvbjogKHNlbGVjdGlvbikgLT5cbiAgICBAc2V0VGV4dFRvUmVnaXN0ZXJGb3JTZWxlY3Rpb24oc2VsZWN0aW9uKVxuXG5jbGFzcyBZYW5rTGluZSBleHRlbmRzIFlhbmtcbiAgQGV4dGVuZCgpXG4gIHdpc2U6ICdsaW5ld2lzZSdcbiAgdGFyZ2V0OiBcIk1vdmVUb1JlbGF0aXZlTGluZVwiXG5cbmNsYXNzIFlhbmtUb0xhc3RDaGFyYWN0ZXJPZkxpbmUgZXh0ZW5kcyBZYW5rXG4gIEBleHRlbmQoKVxuICB0YXJnZXQ6ICdNb3ZlVG9MYXN0Q2hhcmFjdGVyT2ZMaW5lJ1xuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgW2N0cmwtYV1cbmNsYXNzIEluY3JlYXNlIGV4dGVuZHMgT3BlcmF0b3JcbiAgQGV4dGVuZCgpXG4gIHRhcmdldDogXCJJbm5lckN1cnJlbnRMaW5lXCIgIyBjdHJsLWEgaW4gbm9ybWFsLW1vZGUgZmluZCB0YXJnZXQgbnVtYmVyIGluIEN1cnJlbnRMaW5lXG4gIGZsYXNoVGFyZ2V0OiBmYWxzZSAjIGRvIG1hbnVhbGx5XG4gIHJlc3RvcmVQb3NpdGlvbnM6IGZhbHNlICMgZG8gbWFudWFsbHlcbiAgc3RlcDogMVxuXG4gIGV4ZWN1dGU6IC0+XG4gICAgQG5ld1JhbmdlcyA9IFtdXG4gICAgc3VwZXJcbiAgICBpZiBAbmV3UmFuZ2VzLmxlbmd0aFxuICAgICAgaWYgQGdldENvbmZpZygnZmxhc2hPbk9wZXJhdGUnKSBhbmQgKEBnZXROYW1lKCkgbm90IGluIEBnZXRDb25maWcoJ2ZsYXNoT25PcGVyYXRlQmxhY2tsaXN0JykpXG4gICAgICAgIEB2aW1TdGF0ZS5mbGFzaChAbmV3UmFuZ2VzLCB0eXBlOiBAZmxhc2hUeXBlRm9yT2NjdXJyZW5jZSlcblxuICByZXBsYWNlTnVtYmVySW5CdWZmZXJSYW5nZTogKHNjYW5SYW5nZSwgZm49bnVsbCkgLT5cbiAgICBuZXdSYW5nZXMgPSBbXVxuICAgIEBwYXR0ZXJuID89IC8vLyN7QGdldENvbmZpZygnbnVtYmVyUmVnZXgnKX0vLy9nXG4gICAgQHNjYW5Gb3J3YXJkIEBwYXR0ZXJuLCB7c2NhblJhbmdlfSwgKGV2ZW50KSA9PlxuICAgICAgcmV0dXJuIGlmIGZuPyBhbmQgbm90IGZuKGV2ZW50KVxuICAgICAge21hdGNoVGV4dCwgcmVwbGFjZX0gPSBldmVudFxuICAgICAgbmV4dE51bWJlciA9IEBnZXROZXh0TnVtYmVyKG1hdGNoVGV4dClcbiAgICAgIG5ld1Jhbmdlcy5wdXNoKHJlcGxhY2UoU3RyaW5nKG5leHROdW1iZXIpKSlcbiAgICBuZXdSYW5nZXNcblxuICBtdXRhdGVTZWxlY3Rpb246IChzZWxlY3Rpb24pIC0+XG4gICAgc2NhblJhbmdlID0gc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKClcbiAgICBpZiBAaW5zdGFuY2VvZignSW5jcmVtZW50TnVtYmVyJykgb3IgQHRhcmdldC5pcygnQ3VycmVudFNlbGVjdGlvbicpXG4gICAgICBAbmV3UmFuZ2VzLnB1c2goQHJlcGxhY2VOdW1iZXJJbkJ1ZmZlclJhbmdlKHNjYW5SYW5nZSkuLi4pXG4gICAgICBzZWxlY3Rpb24uY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHNjYW5SYW5nZS5zdGFydClcbiAgICBlbHNlXG4gICAgICAjIGN0cmwtYSwgY3RybC14IGluIGBub3JtYWwtbW9kZWBcbiAgICAgIGluaXRpYWxQb2ludCA9IEBtdXRhdGlvbk1hbmFnZXIuZ2V0SW5pdGlhbFBvaW50Rm9yU2VsZWN0aW9uKHNlbGVjdGlvbilcbiAgICAgIG5ld1JhbmdlcyA9IEByZXBsYWNlTnVtYmVySW5CdWZmZXJSYW5nZSBzY2FuUmFuZ2UsICh7cmFuZ2UsIHN0b3B9KSAtPlxuICAgICAgICBpZiByYW5nZS5lbmQuaXNHcmVhdGVyVGhhbihpbml0aWFsUG9pbnQpXG4gICAgICAgICAgc3RvcCgpXG4gICAgICAgICAgdHJ1ZVxuICAgICAgICBlbHNlXG4gICAgICAgICAgZmFsc2VcblxuICAgICAgcG9pbnQgPSBuZXdSYW5nZXNbMF0/LmVuZC50cmFuc2xhdGUoWzAsIC0xXSkgPyBpbml0aWFsUG9pbnRcbiAgICAgIHNlbGVjdGlvbi5jdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24ocG9pbnQpXG5cbiAgZ2V0TmV4dE51bWJlcjogKG51bWJlclN0cmluZykgLT5cbiAgICBOdW1iZXIucGFyc2VJbnQobnVtYmVyU3RyaW5nLCAxMCkgKyBAc3RlcCAqIEBnZXRDb3VudCgpXG5cbiMgW2N0cmwteF1cbmNsYXNzIERlY3JlYXNlIGV4dGVuZHMgSW5jcmVhc2VcbiAgQGV4dGVuZCgpXG4gIHN0ZXA6IC0xXG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBbZyBjdHJsLWFdXG5jbGFzcyBJbmNyZW1lbnROdW1iZXIgZXh0ZW5kcyBJbmNyZWFzZVxuICBAZXh0ZW5kKClcbiAgYmFzZU51bWJlcjogbnVsbFxuICB0YXJnZXQ6IG51bGxcbiAgbXV0YXRlU2VsZWN0aW9uT3JkZXJkOiB0cnVlXG5cbiAgZ2V0TmV4dE51bWJlcjogKG51bWJlclN0cmluZykgLT5cbiAgICBpZiBAYmFzZU51bWJlcj9cbiAgICAgIEBiYXNlTnVtYmVyICs9IEBzdGVwICogQGdldENvdW50KClcbiAgICBlbHNlXG4gICAgICBAYmFzZU51bWJlciA9IE51bWJlci5wYXJzZUludChudW1iZXJTdHJpbmcsIDEwKVxuICAgIEBiYXNlTnVtYmVyXG5cbiMgW2cgY3RybC14XVxuY2xhc3MgRGVjcmVtZW50TnVtYmVyIGV4dGVuZHMgSW5jcmVtZW50TnVtYmVyXG4gIEBleHRlbmQoKVxuICBzdGVwOiAtMVxuXG4jIFB1dFxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIEN1cnNvciBwbGFjZW1lbnQ6XG4jIC0gcGxhY2UgYXQgZW5kIG9mIG11dGF0aW9uOiBwYXN0ZSBub24tbXVsdGlsaW5lIGNoYXJhY3Rlcndpc2UgdGV4dFxuIyAtIHBsYWNlIGF0IHN0YXJ0IG9mIG11dGF0aW9uOiBub24tbXVsdGlsaW5lIGNoYXJhY3Rlcndpc2UgdGV4dChjaGFyYWN0ZXJ3aXNlLCBsaW5ld2lzZSlcbmNsYXNzIFB1dEJlZm9yZSBleHRlbmRzIE9wZXJhdG9yXG4gIEBleHRlbmQoKVxuICBsb2NhdGlvbjogJ2JlZm9yZSdcbiAgdGFyZ2V0OiAnRW1wdHknXG4gIGZsYXNoVHlwZTogJ29wZXJhdG9yLWxvbmcnXG4gIHJlc3RvcmVQb3NpdGlvbnM6IGZhbHNlICMgbWFuYWdlIG1hbnVhbGx5XG4gIGZsYXNoVGFyZ2V0OiB0cnVlICMgbWFuYWdlIG1hbnVhbGx5XG4gIHRyYWNrQ2hhbmdlOiBmYWxzZSAjIG1hbmFnZSBtYW51YWxseVxuXG4gIGV4ZWN1dGU6IC0+XG4gICAgQG11dGF0aW9uc0J5U2VsZWN0aW9uID0gbmV3IE1hcCgpXG4gICAge3RleHQsIHR5cGV9ID0gQHZpbVN0YXRlLnJlZ2lzdGVyLmdldChudWxsLCBAZWRpdG9yLmdldExhc3RTZWxlY3Rpb24oKSlcbiAgICByZXR1cm4gdW5sZXNzIHRleHRcbiAgICBAb25EaWRGaW5pc2hNdXRhdGlvbihAYWRqdXN0Q3Vyc29yUG9zaXRpb24uYmluZCh0aGlzKSlcblxuICAgIEBvbkRpZEZpbmlzaE9wZXJhdGlvbiA9PlxuICAgICAgIyBUcmFja0NoYW5nZVxuICAgICAgaWYgbmV3UmFuZ2UgPSBAbXV0YXRpb25zQnlTZWxlY3Rpb24uZ2V0KEBlZGl0b3IuZ2V0TGFzdFNlbGVjdGlvbigpKVxuICAgICAgICBAc2V0TWFya0ZvckNoYW5nZShuZXdSYW5nZSlcblxuICAgICAgIyBGbGFzaFxuICAgICAgaWYgQGdldENvbmZpZygnZmxhc2hPbk9wZXJhdGUnKSBhbmQgKEBnZXROYW1lKCkgbm90IGluIEBnZXRDb25maWcoJ2ZsYXNoT25PcGVyYXRlQmxhY2tsaXN0JykpXG4gICAgICAgIHRvUmFuZ2UgPSAoc2VsZWN0aW9uKSA9PiBAbXV0YXRpb25zQnlTZWxlY3Rpb24uZ2V0KHNlbGVjdGlvbilcbiAgICAgICAgQHZpbVN0YXRlLmZsYXNoKEBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpLm1hcCh0b1JhbmdlKSwgdHlwZTogQGdldEZsYXNoVHlwZSgpKVxuXG4gICAgc3VwZXJcblxuICBhZGp1c3RDdXJzb3JQb3NpdGlvbjogLT5cbiAgICBmb3Igc2VsZWN0aW9uIGluIEBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpXG4gICAgICB7Y3Vyc29yfSA9IHNlbGVjdGlvblxuICAgICAge3N0YXJ0LCBlbmR9ID0gbmV3UmFuZ2UgPSBAbXV0YXRpb25zQnlTZWxlY3Rpb24uZ2V0KHNlbGVjdGlvbilcbiAgICAgIGlmIEBsaW5ld2lzZVBhc3RlXG4gICAgICAgIG1vdmVDdXJzb3JUb0ZpcnN0Q2hhcmFjdGVyQXRSb3coY3Vyc29yLCBzdGFydC5yb3cpXG4gICAgICBlbHNlXG4gICAgICAgIGlmIG5ld1JhbmdlLmlzU2luZ2xlTGluZSgpXG4gICAgICAgICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKGVuZC50cmFuc2xhdGUoWzAsIC0xXSkpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24oc3RhcnQpXG5cbiAgbXV0YXRlU2VsZWN0aW9uOiAoc2VsZWN0aW9uKSAtPlxuICAgIHt0ZXh0LCB0eXBlfSA9IEB2aW1TdGF0ZS5yZWdpc3Rlci5nZXQobnVsbCwgc2VsZWN0aW9uKVxuICAgIHRleHQgPSBfLm11bHRpcGx5U3RyaW5nKHRleHQsIEBnZXRDb3VudCgpKVxuICAgIEBsaW5ld2lzZVBhc3RlID0gdHlwZSBpcyAnbGluZXdpc2UnIG9yIEBpc01vZGUoJ3Zpc3VhbCcsICdsaW5ld2lzZScpXG4gICAgbmV3UmFuZ2UgPSBAcGFzdGUoc2VsZWN0aW9uLCB0ZXh0LCB7QGxpbmV3aXNlUGFzdGV9KVxuICAgIEBtdXRhdGlvbnNCeVNlbGVjdGlvbi5zZXQoc2VsZWN0aW9uLCBuZXdSYW5nZSlcblxuICBwYXN0ZTogKHNlbGVjdGlvbiwgdGV4dCwge2xpbmV3aXNlUGFzdGV9KSAtPlxuICAgIGlmIGxpbmV3aXNlUGFzdGVcbiAgICAgIEBwYXN0ZUxpbmV3aXNlKHNlbGVjdGlvbiwgdGV4dClcbiAgICBlbHNlXG4gICAgICBAcGFzdGVDaGFyYWN0ZXJ3aXNlKHNlbGVjdGlvbiwgdGV4dClcblxuICBwYXN0ZUNoYXJhY3Rlcndpc2U6IChzZWxlY3Rpb24sIHRleHQpIC0+XG4gICAge2N1cnNvcn0gPSBzZWxlY3Rpb25cbiAgICBpZiBzZWxlY3Rpb24uaXNFbXB0eSgpIGFuZCBAbG9jYXRpb24gaXMgJ2FmdGVyJyBhbmQgbm90IGlzRW1wdHlSb3coQGVkaXRvciwgY3Vyc29yLmdldEJ1ZmZlclJvdygpKVxuICAgICAgY3Vyc29yLm1vdmVSaWdodCgpXG4gICAgcmV0dXJuIHNlbGVjdGlvbi5pbnNlcnRUZXh0KHRleHQpXG5cbiAgIyBSZXR1cm4gbmV3UmFuZ2VcbiAgcGFzdGVMaW5ld2lzZTogKHNlbGVjdGlvbiwgdGV4dCkgLT5cbiAgICB7Y3Vyc29yfSA9IHNlbGVjdGlvblxuICAgIGN1cnNvclJvdyA9IGN1cnNvci5nZXRCdWZmZXJSb3coKVxuICAgIHRleHQgKz0gXCJcXG5cIiB1bmxlc3MgdGV4dC5lbmRzV2l0aChcIlxcblwiKVxuICAgIG5ld1JhbmdlID0gbnVsbFxuICAgIGlmIHNlbGVjdGlvbi5pc0VtcHR5KClcbiAgICAgIGlmIEBsb2NhdGlvbiBpcyAnYmVmb3JlJ1xuICAgICAgICBuZXdSYW5nZSA9IGluc2VydFRleHRBdEJ1ZmZlclBvc2l0aW9uKEBlZGl0b3IsIFtjdXJzb3JSb3csIDBdLCB0ZXh0KVxuICAgICAgICBzZXRCdWZmZXJSb3coY3Vyc29yLCBuZXdSYW5nZS5zdGFydC5yb3cpXG4gICAgICBlbHNlIGlmIEBsb2NhdGlvbiBpcyAnYWZ0ZXInXG4gICAgICAgIGVuc3VyZUVuZHNXaXRoTmV3TGluZUZvckJ1ZmZlclJvdyhAZWRpdG9yLCBjdXJzb3JSb3cpXG4gICAgICAgIG5ld1JhbmdlID0gaW5zZXJ0VGV4dEF0QnVmZmVyUG9zaXRpb24oQGVkaXRvciwgW2N1cnNvclJvdyArIDEsIDBdLCB0ZXh0KVxuICAgIGVsc2VcbiAgICAgIHNlbGVjdGlvbi5pbnNlcnRUZXh0KFwiXFxuXCIpIHVubGVzcyBAaXNNb2RlKCd2aXN1YWwnLCAnbGluZXdpc2UnKVxuICAgICAgbmV3UmFuZ2UgPSBzZWxlY3Rpb24uaW5zZXJ0VGV4dCh0ZXh0KVxuXG4gICAgcmV0dXJuIG5ld1JhbmdlXG5cbmNsYXNzIFB1dEFmdGVyIGV4dGVuZHMgUHV0QmVmb3JlXG4gIEBleHRlbmQoKVxuICBsb2NhdGlvbjogJ2FmdGVyJ1xuXG5jbGFzcyBBZGRCbGFua0xpbmVCZWxvdyBleHRlbmRzIE9wZXJhdG9yXG4gIEBleHRlbmQoKVxuICBmbGFzaFRhcmdldDogZmFsc2VcbiAgdGFyZ2V0OiBcIkVtcHR5XCJcbiAgc3RheUF0U2FtZVBvc2l0aW9uOiB0cnVlXG4gIHN0YXlCeU1hcmtlcjogdHJ1ZVxuICB3aGVyZTogJ2JlbG93J1xuXG4gIG11dGF0ZVNlbGVjdGlvbjogKHNlbGVjdGlvbikgLT5cbiAgICByb3cgPSBzZWxlY3Rpb24uZ2V0SGVhZEJ1ZmZlclBvc2l0aW9uKCkucm93XG4gICAgcm93ICs9IDEgaWYgQHdoZXJlIGlzICdiZWxvdydcbiAgICBwb2ludCA9IFtyb3csIDBdXG4gICAgQGVkaXRvci5zZXRUZXh0SW5CdWZmZXJSYW5nZShbcG9pbnQsIHBvaW50XSwgXCJcXG5cIi5yZXBlYXQoQGdldENvdW50KCkpKVxuXG5jbGFzcyBBZGRCbGFua0xpbmVBYm92ZSBleHRlbmRzIEFkZEJsYW5rTGluZUJlbG93XG4gIEBleHRlbmQoKVxuICB3aGVyZTogJ2Fib3ZlJ1xuIl19
