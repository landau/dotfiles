(function() {
  var AddBlankLineAbove, AddBlankLineBelow, AddPresetOccurrenceFromLastOccurrencePattern, Base, CreatePersistentSelection, Decrease, DecrementNumber, Delete, DeleteLeft, DeleteLine, DeleteRight, DeleteToLastCharacterOfLine, Disposable, Increase, IncrementNumber, LineEndingRegExp, Operator, Point, PutAfter, PutBefore, Range, Select, SelectLatestChange, SelectOccurrence, SelectPersistentSelection, SelectPreviousSelection, TogglePersistentSelection, TogglePresetOccurrence, TogglePresetSubwordOccurrence, Yank, YankLine, YankToLastCharacterOfLine, _, ensureEndsWithNewLineForBufferRow, getSubwordPatternAtBufferPosition, getValidVimBufferRow, getWordPatternAtBufferPosition, haveSomeNonEmptySelection, inspect, isEmptyRow, isNotEmpty, moveCursorToFirstCharacterAtRow, ref, ref1, setBufferRow, setTextAtBufferPosition, settings, swrap,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  LineEndingRegExp = /(?:\n|\r\n)$/;

  _ = require('underscore-plus');

  ref = require('atom'), Point = ref.Point, Range = ref.Range, Disposable = ref.Disposable;

  inspect = require('util').inspect;

  ref1 = require('./utils'), haveSomeNonEmptySelection = ref1.haveSomeNonEmptySelection, getValidVimBufferRow = ref1.getValidVimBufferRow, isEmptyRow = ref1.isEmptyRow, getWordPatternAtBufferPosition = ref1.getWordPatternAtBufferPosition, getSubwordPatternAtBufferPosition = ref1.getSubwordPatternAtBufferPosition, setTextAtBufferPosition = ref1.setTextAtBufferPosition, setBufferRow = ref1.setBufferRow, moveCursorToFirstCharacterAtRow = ref1.moveCursorToFirstCharacterAtRow, ensureEndsWithNewLineForBufferRow = ref1.ensureEndsWithNewLineForBufferRow, isNotEmpty = ref1.isNotEmpty;

  swrap = require('./selection-wrapper');

  settings = require('./settings');

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
      var ref2;
      return (ref2 = this.bufferCheckpointByPurpose) != null ? ref2[purpose] : void 0;
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
      var ref2;
      return ((ref2 = this.stayAtSamePosition) != null ? ref2 : this.isOccurrence() && settings.get('stayOnOccurrence')) || settings.get(this.stayOptionName);
    };

    Operator.prototype.needStayOnRestore = function() {
      var ref2;
      return ((ref2 = this.stayAtSamePosition) != null ? ref2 : this.isOccurrence() && settings.get('stayOnOccurrence') && this.occurrenceSelected) || settings.get(this.stayOptionName);
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
      var mode, ref2, ref3, submode;
      if (!this.flashTarget) {
        return;
      }
      ref2 = this.vimState, mode = ref2.mode, submode = ref2.submode;
      if (mode !== 'visual' || (this.target.isMotion() && submode !== this.target.wise)) {
        return settings.get('flashOnOperate') && (ref3 = this.getName(), indexOf.call(settings.get('flashOnOperateBlacklist'), ref3) < 0);
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
          var marker, ref2;
          if (marker = (ref2 = _this.mutationManager.getMutationForSelection(_this.editor.getLastSelection())) != null ? ref2.marker : void 0) {
            return _this.setMarkForChange(marker.getBufferRange());
          }
        };
      })(this));
    };

    function Operator() {
      var ref2, ref3;
      Operator.__super__.constructor.apply(this, arguments);
      ref2 = this.vimState, this.mutationManager = ref2.mutationManager, this.occurrenceManager = ref2.occurrenceManager, this.persistentSelection = ref2.persistentSelection;
      this.subscribeResetOccurrencePatternIfNeeded();
      this.initialize();
      this.onDidSetOperatorModifier(this.setModifier.bind(this));
      if (this.acceptPresetOccurrence && this.occurrenceManager.hasMarkers()) {
        this.setOccurrence(true);
      }
      if (this.isOccurrence() && !this.occurrenceManager.hasMarkers()) {
        this.occurrenceManager.addPattern((ref3 = this.patternForOccurrence) != null ? ref3 : this.getPatternForOccurrenceType(this.occurrenceType));
      }
      if (this.selectPersistentSelectionIfNecessary()) {
        if (this.isMode('visual')) {
          null;
        } else {
          this.vimState.modeManager.activate('visual', swrap.detectVisualModeSubmode(this.editor));
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
      if (this.acceptPersistentSelection && settings.get('autoSelectPersistentSelectionOnOperate') && !this.persistentSelection.isEmpty()) {
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
      var ref2;
      if (((ref2 = this.target) != null ? ref2.isMotion() : void 0) && this.isMode('visual')) {
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
        isSelect: this["instanceof"]('Select'),
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
      var options, ref2;
      if (!this.restorePositions) {
        return;
      }
      options = {
        stay: this.needStayOnRestore(),
        occurrenceSelected: this.occurrenceSelected,
        isBlockwise: (ref2 = this.target) != null ? typeof ref2.isBlockwise === "function" ? ref2.isBlockwise() : void 0 : void 0
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
          var submode;
          if (_this.selectTarget()) {
            submode = swrap.detectVisualModeSubmode(_this.editor);
            return _this.activateModeIfNecessary('visual', submode);
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
        this.occurrenceManager.saveLastPattern();
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
      var pattern;
      this.occurrenceManager.resetPatterns();
      if (pattern = this.vimState.globalState.get('lastOccurrencePattern')) {
        this.occurrenceManager.addPattern(pattern);
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
              var cursor, i, len, ref2, results;
              ref2 = _this.editor.getCursors();
              results = [];
              for (i = 0, len = ref2.length; i < len; i++) {
                cursor = ref2[i];
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
      var ref2;
      this.newRanges = [];
      Increase.__super__.execute.apply(this, arguments);
      if (this.newRanges.length) {
        if (settings.get('flashOnOperate') && (ref2 = this.getName(), indexOf.call(settings.get('flashOnOperateBlacklist'), ref2) < 0)) {
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
        this.pattern = RegExp("" + (settings.get('numberRegex')), "g");
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
      var initialPoint, newRanges, point, ref2, ref3, ref4, scanRange;
      scanRange = selection.getBufferRange();
      if (this["instanceof"]('IncrementNumber') || this.target.is('CurrentSelection')) {
        (ref2 = this.newRanges).push.apply(ref2, this.replaceNumberInBufferRange(scanRange));
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
        point = (ref3 = (ref4 = newRanges[0]) != null ? ref4.end.translate([0, -1]) : void 0) != null ? ref3 : initialPoint;
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
      var i, len, ref2, register, selection;
      this.mutationsBySelection = new Map();
      this.registerBySelection = new Map();
      ref2 = this.editor.getSelections();
      for (i = 0, len = ref2.length; i < len; i++) {
        selection = ref2[i];
        register = this.vimState.register.get(null, selection);
        if (register.text != null) {
          this.registerBySelection.set(selection, register);
        }
      }
      if (!this.registerBySelection.size) {
        return;
      }
      this.onDidFinishMutation(this.adjustCursorPosition.bind(this));
      this.onDidFinishOperation((function(_this) {
        return function() {
          var newRange, ref3, toRange;
          if (newRange = _this.mutationsBySelection.get(_this.editor.getLastSelection())) {
            _this.setMarkForChange(newRange);
          }
          if (settings.get('flashOnOperate') && (ref3 = _this.getName(), indexOf.call(settings.get('flashOnOperateBlacklist'), ref3) < 0)) {
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
      var cursor, end, i, len, newRange, ref2, ref3, results, selection, start;
      ref2 = this.editor.getSelections();
      results = [];
      for (i = 0, len = ref2.length; i < len; i++) {
        selection = ref2[i];
        cursor = selection.cursor;
        ref3 = newRange = this.mutationsBySelection.get(selection), start = ref3.start, end = ref3.end;
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
      var newRange, ref2, text, type;
      ref2 = this.registerBySelection.get(selection), text = ref2.text, type = ref2.type;
      if (!text) {
        return;
      }
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
          newRange = setTextAtBufferPosition(this.editor, [cursorRow, 0], text);
          setBufferRow(cursor, newRange.start.row);
        } else if (this.location === 'after') {
          ensureEndsWithNewLineForBufferRow(this.editor, cursorRow);
          newRange = setTextAtBufferPosition(this.editor, [cursorRow + 1, 0], text);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvb3BlcmF0b3IuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSw0ekJBQUE7SUFBQTs7Ozs7RUFBQSxnQkFBQSxHQUFtQjs7RUFDbkIsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUjs7RUFDSixNQUE2QixPQUFBLENBQVEsTUFBUixDQUE3QixFQUFDLGlCQUFELEVBQVEsaUJBQVIsRUFBZTs7RUFFZCxVQUFXLE9BQUEsQ0FBUSxNQUFSOztFQUNaLE9BV0ksT0FBQSxDQUFRLFNBQVIsQ0FYSixFQUNFLDBEQURGLEVBRUUsZ0RBRkYsRUFHRSw0QkFIRixFQUlFLG9FQUpGLEVBS0UsMEVBTEYsRUFNRSxzREFORixFQU9FLGdDQVBGLEVBUUUsc0VBUkYsRUFTRSwwRUFURixFQVVFOztFQUVGLEtBQUEsR0FBUSxPQUFBLENBQVEscUJBQVI7O0VBQ1IsUUFBQSxHQUFXLE9BQUEsQ0FBUSxZQUFSOztFQUNYLElBQUEsR0FBTyxPQUFBLENBQVEsUUFBUjs7RUFFRDs7O0lBQ0osUUFBQyxDQUFBLE1BQUQsQ0FBUSxLQUFSOzt1QkFDQSxhQUFBLEdBQWU7O3VCQUNmLFVBQUEsR0FBWTs7dUJBRVosSUFBQSxHQUFNOzt1QkFDTixVQUFBLEdBQVk7O3VCQUNaLGNBQUEsR0FBZ0I7O3VCQUVoQixXQUFBLEdBQWE7O3VCQUNiLGVBQUEsR0FBaUI7O3VCQUNqQixTQUFBLEdBQVc7O3VCQUNYLHNCQUFBLEdBQXdCOzt1QkFDeEIsV0FBQSxHQUFhOzt1QkFFYixvQkFBQSxHQUFzQjs7dUJBQ3RCLGtCQUFBLEdBQW9COzt1QkFDcEIsY0FBQSxHQUFnQjs7dUJBQ2hCLFlBQUEsR0FBYzs7dUJBQ2QsZ0JBQUEsR0FBa0I7O3VCQUVsQixzQkFBQSxHQUF3Qjs7dUJBQ3hCLHlCQUFBLEdBQTJCOzt1QkFD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QTtRQVFFLElBQUEsQ0FBa0MsSUFBQyxDQUFBLE1BQUQsQ0FBUSxRQUFSLEVBQWtCLFVBQWxCLENBQWxDO1VBQUEsU0FBUyxDQUFDLFVBQVYsQ0FBcUIsSUFBckIsRUFBQTs7UUFDQSxRQUFBLEdBQVcsU0FBUyxDQUFDLFVBQVYsQ0FBcUIsSUFBckIsRUFUYjs7QUFXQSxhQUFPO0lBaEJNOzs7O0tBbEVPOztFQW9GbEI7Ozs7Ozs7SUFDSixRQUFDLENBQUEsTUFBRCxDQUFBOzt1QkFDQSxRQUFBLEdBQVU7Ozs7S0FGVzs7RUFJakI7Ozs7Ozs7SUFDSixpQkFBQyxDQUFBLE1BQUQsQ0FBQTs7Z0NBQ0EsV0FBQSxHQUFhOztnQ0FDYixNQUFBLEdBQVE7O2dDQUNSLGtCQUFBLEdBQW9COztnQ0FDcEIsWUFBQSxHQUFjOztnQ0FDZCxLQUFBLEdBQU87O2dDQUVQLGVBQUEsR0FBaUIsU0FBQyxTQUFEO0FBQ2YsVUFBQTtNQUFBLEdBQUEsR0FBTSxTQUFTLENBQUMscUJBQVYsQ0FBQSxDQUFpQyxDQUFDO01BQ3hDLElBQVksSUFBQyxDQUFBLEtBQUQsS0FBVSxPQUF0QjtRQUFBLEdBQUEsSUFBTyxFQUFQOztNQUNBLEtBQUEsR0FBUSxDQUFDLEdBQUQsRUFBTSxDQUFOO2FBQ1IsSUFBQyxDQUFBLE1BQU0sQ0FBQyxvQkFBUixDQUE2QixDQUFDLEtBQUQsRUFBUSxLQUFSLENBQTdCLEVBQTZDLElBQUksQ0FBQyxNQUFMLENBQVksSUFBQyxDQUFBLFFBQUQsQ0FBQSxDQUFaLENBQTdDO0lBSmU7Ozs7S0FSYTs7RUFjMUI7Ozs7Ozs7SUFDSixpQkFBQyxDQUFBLE1BQUQsQ0FBQTs7Z0NBQ0EsS0FBQSxHQUFPOzs7O0tBRnVCO0FBanJCaEMiLCJzb3VyY2VzQ29udGVudCI6WyJMaW5lRW5kaW5nUmVnRXhwID0gLyg/OlxcbnxcXHJcXG4pJC9cbl8gPSByZXF1aXJlICd1bmRlcnNjb3JlLXBsdXMnXG57UG9pbnQsIFJhbmdlLCBEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2F0b20nXG5cbntpbnNwZWN0fSA9IHJlcXVpcmUgJ3V0aWwnXG57XG4gIGhhdmVTb21lTm9uRW1wdHlTZWxlY3Rpb25cbiAgZ2V0VmFsaWRWaW1CdWZmZXJSb3dcbiAgaXNFbXB0eVJvd1xuICBnZXRXb3JkUGF0dGVybkF0QnVmZmVyUG9zaXRpb25cbiAgZ2V0U3Vid29yZFBhdHRlcm5BdEJ1ZmZlclBvc2l0aW9uXG4gIHNldFRleHRBdEJ1ZmZlclBvc2l0aW9uXG4gIHNldEJ1ZmZlclJvd1xuICBtb3ZlQ3Vyc29yVG9GaXJzdENoYXJhY3RlckF0Um93XG4gIGVuc3VyZUVuZHNXaXRoTmV3TGluZUZvckJ1ZmZlclJvd1xuICBpc05vdEVtcHR5XG59ID0gcmVxdWlyZSAnLi91dGlscydcbnN3cmFwID0gcmVxdWlyZSAnLi9zZWxlY3Rpb24td3JhcHBlcidcbnNldHRpbmdzID0gcmVxdWlyZSAnLi9zZXR0aW5ncydcbkJhc2UgPSByZXF1aXJlICcuL2Jhc2UnXG5cbmNsYXNzIE9wZXJhdG9yIGV4dGVuZHMgQmFzZVxuICBAZXh0ZW5kKGZhbHNlKVxuICByZXF1aXJlVGFyZ2V0OiB0cnVlXG4gIHJlY29yZGFibGU6IHRydWVcblxuICB3aXNlOiBudWxsXG4gIG9jY3VycmVuY2U6IGZhbHNlXG4gIG9jY3VycmVuY2VUeXBlOiAnYmFzZSdcblxuICBmbGFzaFRhcmdldDogdHJ1ZVxuICBmbGFzaENoZWNrcG9pbnQ6ICdkaWQtZmluaXNoJ1xuICBmbGFzaFR5cGU6ICdvcGVyYXRvcidcbiAgZmxhc2hUeXBlRm9yT2NjdXJyZW5jZTogJ29wZXJhdG9yLW9jY3VycmVuY2UnXG4gIHRyYWNrQ2hhbmdlOiBmYWxzZVxuXG4gIHBhdHRlcm5Gb3JPY2N1cnJlbmNlOiBudWxsXG4gIHN0YXlBdFNhbWVQb3NpdGlvbjogbnVsbFxuICBzdGF5T3B0aW9uTmFtZTogbnVsbFxuICBzdGF5QnlNYXJrZXI6IGZhbHNlXG4gIHJlc3RvcmVQb3NpdGlvbnM6IHRydWVcblxuICBhY2NlcHRQcmVzZXRPY2N1cnJlbmNlOiB0cnVlXG4gIGFjY2VwdFBlcnNpc3RlbnRTZWxlY3Rpb246IHRydWVcbiAgYWNjZXB0Q3VycmVudFNlbGVjdGlvbjogdHJ1ZVxuXG4gIGJ1ZmZlckNoZWNrcG9pbnRCeVB1cnBvc2U6IG51bGxcbiAgbXV0YXRlU2VsZWN0aW9uT3JkZXJkOiBmYWxzZVxuXG4gICMgRXhwZXJpbWVudGFseSBhbGxvdyBzZWxlY3RUYXJnZXQgYmVmb3JlIGlucHV0IENvbXBsZXRlXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBzdXBwb3J0RWFybHlTZWxlY3Q6IGZhbHNlXG4gIHRhcmdldFNlbGVjdGVkOiBudWxsXG4gIGNhbkVhcmx5U2VsZWN0OiAtPlxuICAgIEBzdXBwb3J0RWFybHlTZWxlY3QgYW5kIG5vdCBAaXNSZXBlYXRlZCgpXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gICMgQ2FsbGVkIHdoZW4gb3BlcmF0aW9uIGZpbmlzaGVkXG4gICMgVGhpcyBpcyBlc3NlbnRpYWxseSB0byByZXNldCBzdGF0ZSBmb3IgYC5gIHJlcGVhdC5cbiAgcmVzZXRTdGF0ZTogLT5cbiAgICBAdGFyZ2V0U2VsZWN0ZWQgPSBudWxsXG4gICAgQG9jY3VycmVuY2VTZWxlY3RlZCA9IGZhbHNlXG5cbiAgIyBUd28gY2hlY2twb2ludCBmb3IgZGlmZmVyZW50IHB1cnBvc2VcbiAgIyAtIG9uZSBmb3IgdW5kbyhoYW5kbGVkIGJ5IG1vZGVNYW5hZ2VyKVxuICAjIC0gb25lIGZvciBwcmVzZXJ2ZSBsYXN0IGluc2VydGVkIHRleHRcbiAgY3JlYXRlQnVmZmVyQ2hlY2twb2ludDogKHB1cnBvc2UpIC0+XG4gICAgQGJ1ZmZlckNoZWNrcG9pbnRCeVB1cnBvc2UgPz0ge31cbiAgICBAYnVmZmVyQ2hlY2twb2ludEJ5UHVycG9zZVtwdXJwb3NlXSA9IEBlZGl0b3IuY3JlYXRlQ2hlY2twb2ludCgpXG5cbiAgZ2V0QnVmZmVyQ2hlY2twb2ludDogKHB1cnBvc2UpIC0+XG4gICAgQGJ1ZmZlckNoZWNrcG9pbnRCeVB1cnBvc2U/W3B1cnBvc2VdXG5cbiAgZGVsZXRlQnVmZmVyQ2hlY2twb2ludDogKHB1cnBvc2UpIC0+XG4gICAgaWYgQGJ1ZmZlckNoZWNrcG9pbnRCeVB1cnBvc2U/XG4gICAgICBkZWxldGUgQGJ1ZmZlckNoZWNrcG9pbnRCeVB1cnBvc2VbcHVycG9zZV1cblxuICBncm91cENoYW5nZXNTaW5jZUJ1ZmZlckNoZWNrcG9pbnQ6IChwdXJwb3NlKSAtPlxuICAgIGlmIGNoZWNrcG9pbnQgPSBAZ2V0QnVmZmVyQ2hlY2twb2ludChwdXJwb3NlKVxuICAgICAgQGVkaXRvci5ncm91cENoYW5nZXNTaW5jZUNoZWNrcG9pbnQoY2hlY2twb2ludClcbiAgICAgIEBkZWxldGVCdWZmZXJDaGVja3BvaW50KHB1cnBvc2UpXG5cbiAgbmVlZFN0YXk6IC0+XG4gICAgQHN0YXlBdFNhbWVQb3NpdGlvbiA/XG4gICAgICAoQGlzT2NjdXJyZW5jZSgpIGFuZCBzZXR0aW5ncy5nZXQoJ3N0YXlPbk9jY3VycmVuY2UnKSkgb3Igc2V0dGluZ3MuZ2V0KEBzdGF5T3B0aW9uTmFtZSlcblxuICBuZWVkU3RheU9uUmVzdG9yZTogLT5cbiAgICBAc3RheUF0U2FtZVBvc2l0aW9uID9cbiAgICAgIChAaXNPY2N1cnJlbmNlKCkgYW5kIHNldHRpbmdzLmdldCgnc3RheU9uT2NjdXJyZW5jZScpIGFuZCBAb2NjdXJyZW5jZVNlbGVjdGVkKSBvciBzZXR0aW5ncy5nZXQoQHN0YXlPcHRpb25OYW1lKVxuXG4gIGlzT2NjdXJyZW5jZTogLT5cbiAgICBAb2NjdXJyZW5jZVxuXG4gIHNldE9jY3VycmVuY2U6IChAb2NjdXJyZW5jZSkgLT5cbiAgICBAb2NjdXJyZW5jZVxuXG4gIHNldE1hcmtGb3JDaGFuZ2U6IChyYW5nZSkgLT5cbiAgICBAdmltU3RhdGUubWFyay5zZXRSYW5nZSgnWycsICddJywgcmFuZ2UpXG5cbiAgbmVlZEZsYXNoOiAtPlxuICAgIHJldHVybiB1bmxlc3MgQGZsYXNoVGFyZ2V0XG4gICAge21vZGUsIHN1Ym1vZGV9ID0gQHZpbVN0YXRlXG4gICAgaWYgbW9kZSBpc250ICd2aXN1YWwnIG9yIChAdGFyZ2V0LmlzTW90aW9uKCkgYW5kIHN1Ym1vZGUgaXNudCBAdGFyZ2V0Lndpc2UpXG4gICAgICBzZXR0aW5ncy5nZXQoJ2ZsYXNoT25PcGVyYXRlJykgYW5kIChAZ2V0TmFtZSgpIG5vdCBpbiBzZXR0aW5ncy5nZXQoJ2ZsYXNoT25PcGVyYXRlQmxhY2tsaXN0JykpXG5cbiAgZmxhc2hJZk5lY2Vzc2FyeTogKHJhbmdlcykgLT5cbiAgICByZXR1cm4gdW5sZXNzIEBuZWVkRmxhc2goKVxuICAgIEB2aW1TdGF0ZS5mbGFzaChyYW5nZXMsIHR5cGU6IEBnZXRGbGFzaFR5cGUoKSlcblxuICBmbGFzaENoYW5nZUlmTmVjZXNzYXJ5OiAtPlxuICAgIHJldHVybiB1bmxlc3MgQG5lZWRGbGFzaCgpXG5cbiAgICBAb25EaWRGaW5pc2hPcGVyYXRpb24gPT5cbiAgICAgIGlmIEBmbGFzaENoZWNrcG9pbnQgaXMgJ2RpZC1maW5pc2gnXG4gICAgICAgIHJhbmdlcyA9IEBtdXRhdGlvbk1hbmFnZXIuZ2V0TWFya2VyQnVmZmVyUmFuZ2VzKCkuZmlsdGVyIChyYW5nZSkgLT4gbm90IHJhbmdlLmlzRW1wdHkoKVxuICAgICAgZWxzZVxuICAgICAgICByYW5nZXMgPSBAbXV0YXRpb25NYW5hZ2VyLmdldEJ1ZmZlclJhbmdlc0ZvckNoZWNrcG9pbnQoQGZsYXNoQ2hlY2twb2ludClcbiAgICAgIEB2aW1TdGF0ZS5mbGFzaChyYW5nZXMsIHR5cGU6IEBnZXRGbGFzaFR5cGUoKSlcblxuICBnZXRGbGFzaFR5cGU6IC0+XG4gICAgaWYgQG9jY3VycmVuY2VTZWxlY3RlZFxuICAgICAgQGZsYXNoVHlwZUZvck9jY3VycmVuY2VcbiAgICBlbHNlXG4gICAgICBAZmxhc2hUeXBlXG5cbiAgdHJhY2tDaGFuZ2VJZk5lY2Vzc2FyeTogLT5cbiAgICByZXR1cm4gdW5sZXNzIEB0cmFja0NoYW5nZVxuXG4gICAgQG9uRGlkRmluaXNoT3BlcmF0aW9uID0+XG4gICAgICBpZiBtYXJrZXIgPSBAbXV0YXRpb25NYW5hZ2VyLmdldE11dGF0aW9uRm9yU2VsZWN0aW9uKEBlZGl0b3IuZ2V0TGFzdFNlbGVjdGlvbigpKT8ubWFya2VyXG4gICAgICAgIEBzZXRNYXJrRm9yQ2hhbmdlKG1hcmtlci5nZXRCdWZmZXJSYW5nZSgpKVxuXG4gIGNvbnN0cnVjdG9yOiAtPlxuICAgIHN1cGVyXG4gICAge0BtdXRhdGlvbk1hbmFnZXIsIEBvY2N1cnJlbmNlTWFuYWdlciwgQHBlcnNpc3RlbnRTZWxlY3Rpb259ID0gQHZpbVN0YXRlXG4gICAgQHN1YnNjcmliZVJlc2V0T2NjdXJyZW5jZVBhdHRlcm5JZk5lZWRlZCgpXG4gICAgQGluaXRpYWxpemUoKVxuICAgIEBvbkRpZFNldE9wZXJhdG9yTW9kaWZpZXIoQHNldE1vZGlmaWVyLmJpbmQodGhpcykpXG5cbiAgICAjIFdoZW4gcHJlc2V0LW9jY3VycmVuY2Ugd2FzIGV4aXN0cywgb3BlcmF0ZSBvbiBvY2N1cnJlbmNlLXdpc2VcbiAgICBpZiBAYWNjZXB0UHJlc2V0T2NjdXJyZW5jZSBhbmQgQG9jY3VycmVuY2VNYW5hZ2VyLmhhc01hcmtlcnMoKVxuICAgICAgQHNldE9jY3VycmVuY2UodHJ1ZSlcblxuICAgICMgW0ZJWE1FXSBPUkRFUi1NQVRURVJcbiAgICAjIFRvIHBpY2sgY3Vyc29yLXdvcmQgdG8gZmluZCBvY2N1cnJlbmNlIGJhc2UgcGF0dGVybi5cbiAgICAjIFRoaXMgaGFzIHRvIGJlIGRvbmUgQkVGT1JFIGNvbnZlcnRpbmcgcGVyc2lzdGVudC1zZWxlY3Rpb24gaW50byByZWFsLXNlbGVjdGlvbi5cbiAgICAjIFNpbmNlIHdoZW4gcGVyc2lzdGVudC1zZWxlY3Rpb24gaXMgYWN0dWFsbCBzZWxlY3RlZCwgaXQgY2hhbmdlIGN1cnNvciBwb3NpdGlvbi5cbiAgICBpZiBAaXNPY2N1cnJlbmNlKCkgYW5kIG5vdCBAb2NjdXJyZW5jZU1hbmFnZXIuaGFzTWFya2VycygpXG4gICAgICBAb2NjdXJyZW5jZU1hbmFnZXIuYWRkUGF0dGVybihAcGF0dGVybkZvck9jY3VycmVuY2UgPyBAZ2V0UGF0dGVybkZvck9jY3VycmVuY2VUeXBlKEBvY2N1cnJlbmNlVHlwZSkpXG5cbiAgICAjIFRoaXMgY2hhbmdlIGN1cnNvciBwb3NpdGlvbi5cbiAgICBpZiBAc2VsZWN0UGVyc2lzdGVudFNlbGVjdGlvbklmTmVjZXNzYXJ5KClcbiAgICAgIGlmIEBpc01vZGUoJ3Zpc3VhbCcpXG4gICAgICAgICMgW0ZJWE1FXSBTeW5jIHNlbGVjdGlvbi13aXNlIHRoaXMgcGhhc2U/XG4gICAgICAgICMgZS5nLiBzZWxlY3RlZCBwZXJzaXN0ZWQgc2VsZWN0aW9uIGNvbnZlcnQgdG8gdkIgc2VsIGluIHZCLW1vZGU/XG4gICAgICAgIG51bGxcbiAgICAgIGVsc2VcbiAgICAgICAgQHZpbVN0YXRlLm1vZGVNYW5hZ2VyLmFjdGl2YXRlKCd2aXN1YWwnLCBzd3JhcC5kZXRlY3RWaXN1YWxNb2RlU3VibW9kZShAZWRpdG9yKSlcblxuICAgIEB0YXJnZXQgPSAnQ3VycmVudFNlbGVjdGlvbicgaWYgQGlzTW9kZSgndmlzdWFsJykgYW5kIEBhY2NlcHRDdXJyZW50U2VsZWN0aW9uXG4gICAgQHNldFRhcmdldChAbmV3KEB0YXJnZXQpKSBpZiBfLmlzU3RyaW5nKEB0YXJnZXQpXG5cbiAgc3Vic2NyaWJlUmVzZXRPY2N1cnJlbmNlUGF0dGVybklmTmVlZGVkOiAtPlxuICAgICMgW0NBVVRJT05dXG4gICAgIyBUaGlzIG1ldGhvZCBoYXMgdG8gYmUgY2FsbGVkIGluIFBST1BFUiB0aW1pbmcuXG4gICAgIyBJZiBvY2N1cnJlbmNlIGlzIHRydWUgYnV0IG5vIHByZXNldC1vY2N1cnJlbmNlXG4gICAgIyBUcmVhdCB0aGF0IGBvY2N1cnJlbmNlYCBpcyBCT1VOREVEIHRvIG9wZXJhdG9yIGl0c2VsZiwgc28gY2xlYW5wIGF0IGZpbmlzaGVkLlxuICAgIGlmIEBvY2N1cnJlbmNlIGFuZCBub3QgQG9jY3VycmVuY2VNYW5hZ2VyLmhhc01hcmtlcnMoKVxuICAgICAgQG9uRGlkUmVzZXRPcGVyYXRpb25TdGFjayg9PiBAb2NjdXJyZW5jZU1hbmFnZXIucmVzZXRQYXR0ZXJucygpKVxuXG4gIHNldE1vZGlmaWVyOiAob3B0aW9ucykgLT5cbiAgICBpZiBvcHRpb25zLndpc2U/XG4gICAgICBAd2lzZSA9IG9wdGlvbnMud2lzZVxuICAgICAgcmV0dXJuXG5cbiAgICBpZiBvcHRpb25zLm9jY3VycmVuY2U/XG4gICAgICBAc2V0T2NjdXJyZW5jZShvcHRpb25zLm9jY3VycmVuY2UpXG4gICAgICBpZiBAaXNPY2N1cnJlbmNlKClcbiAgICAgICAgQG9jY3VycmVuY2VUeXBlID0gb3B0aW9ucy5vY2N1cnJlbmNlVHlwZVxuICAgICAgICAjIFRoaXMgaXMgbyBtb2RpZmllciBjYXNlKGUuZy4gYGMgbyBwYCwgYGQgTyBmYClcbiAgICAgICAgIyBXZSBSRVNFVCBleGlzdGluZyBvY2N1cmVuY2UtbWFya2VyIHdoZW4gYG9gIG9yIGBPYCBtb2RpZmllciBpcyB0eXBlZCBieSB1c2VyLlxuICAgICAgICBwYXR0ZXJuID0gQGdldFBhdHRlcm5Gb3JPY2N1cnJlbmNlVHlwZShAb2NjdXJyZW5jZVR5cGUpXG4gICAgICAgIEBvY2N1cnJlbmNlTWFuYWdlci5hZGRQYXR0ZXJuKHBhdHRlcm4sIHtyZXNldDogdHJ1ZSwgQG9jY3VycmVuY2VUeXBlfSlcbiAgICAgICAgQG9uRGlkUmVzZXRPcGVyYXRpb25TdGFjayg9PiBAb2NjdXJyZW5jZU1hbmFnZXIucmVzZXRQYXR0ZXJucygpKVxuXG4gICMgcmV0dXJuIHRydWUvZmFsc2UgdG8gaW5kaWNhdGUgc3VjY2Vzc1xuICBzZWxlY3RQZXJzaXN0ZW50U2VsZWN0aW9uSWZOZWNlc3Nhcnk6IC0+XG4gICAgaWYgQGFjY2VwdFBlcnNpc3RlbnRTZWxlY3Rpb24gYW5kXG4gICAgICAgIHNldHRpbmdzLmdldCgnYXV0b1NlbGVjdFBlcnNpc3RlbnRTZWxlY3Rpb25Pbk9wZXJhdGUnKSBhbmRcbiAgICAgICAgbm90IEBwZXJzaXN0ZW50U2VsZWN0aW9uLmlzRW1wdHkoKVxuXG4gICAgICBAcGVyc2lzdGVudFNlbGVjdGlvbi5zZWxlY3QoKVxuICAgICAgQGVkaXRvci5tZXJnZUludGVyc2VjdGluZ1NlbGVjdGlvbnMoKVxuICAgICAgc3dyYXAuc2F2ZVByb3BlcnRpZXMoQGVkaXRvcilcblxuICAgICAgdHJ1ZVxuICAgIGVsc2VcbiAgICAgIGZhbHNlXG5cbiAgZ2V0UGF0dGVybkZvck9jY3VycmVuY2VUeXBlOiAob2NjdXJyZW5jZVR5cGUpIC0+XG4gICAgc3dpdGNoIG9jY3VycmVuY2VUeXBlXG4gICAgICB3aGVuICdiYXNlJ1xuICAgICAgICBnZXRXb3JkUGF0dGVybkF0QnVmZmVyUG9zaXRpb24oQGVkaXRvciwgQGdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCkpXG4gICAgICB3aGVuICdzdWJ3b3JkJ1xuICAgICAgICBnZXRTdWJ3b3JkUGF0dGVybkF0QnVmZmVyUG9zaXRpb24oQGVkaXRvciwgQGdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCkpXG5cbiAgIyB0YXJnZXQgaXMgVGV4dE9iamVjdCBvciBNb3Rpb24gdG8gb3BlcmF0ZSBvbi5cbiAgc2V0VGFyZ2V0OiAoQHRhcmdldCkgLT5cbiAgICBAdGFyZ2V0LnNldE9wZXJhdG9yKHRoaXMpXG4gICAgQGVtaXREaWRTZXRUYXJnZXQodGhpcylcblxuICAgIGlmIEBjYW5FYXJseVNlbGVjdCgpXG4gICAgICBAbm9ybWFsaXplU2VsZWN0aW9uc0lmTmVjZXNzYXJ5KClcbiAgICAgIEBjcmVhdGVCdWZmZXJDaGVja3BvaW50KCd1bmRvJylcbiAgICAgIEBzZWxlY3RUYXJnZXQoKVxuICAgIHRoaXNcblxuICBzZXRUZXh0VG9SZWdpc3RlckZvclNlbGVjdGlvbjogKHNlbGVjdGlvbikgLT5cbiAgICBAc2V0VGV4dFRvUmVnaXN0ZXIoc2VsZWN0aW9uLmdldFRleHQoKSwgc2VsZWN0aW9uKVxuXG4gIHNldFRleHRUb1JlZ2lzdGVyOiAodGV4dCwgc2VsZWN0aW9uKSAtPlxuICAgIHRleHQgKz0gXCJcXG5cIiBpZiAoQHRhcmdldC5pc0xpbmV3aXNlKCkgYW5kIChub3QgdGV4dC5lbmRzV2l0aCgnXFxuJykpKVxuICAgIEB2aW1TdGF0ZS5yZWdpc3Rlci5zZXQoe3RleHQsIHNlbGVjdGlvbn0pIGlmIHRleHRcblxuICBub3JtYWxpemVTZWxlY3Rpb25zSWZOZWNlc3Nhcnk6IC0+XG4gICAgaWYgQHRhcmdldD8uaXNNb3Rpb24oKSBhbmQgQGlzTW9kZSgndmlzdWFsJylcbiAgICAgIEB2aW1TdGF0ZS5tb2RlTWFuYWdlci5ub3JtYWxpemVTZWxlY3Rpb25zKClcblxuICBzdGFydE11dGF0aW9uOiAoZm4pIC0+XG4gICAgaWYgQGNhbkVhcmx5U2VsZWN0KClcbiAgICAgICMgLSBTa2lwIHNlbGVjdGlvbiBub3JtYWxpemF0aW9uOiBhbHJlYWR5IG5vcm1hbGl6ZWQgYmVmb3JlIEBzZWxlY3RUYXJnZXQoKVxuICAgICAgIyAtIE1hbnVhbCBjaGVja3BvaW50IGdyb3VwaW5nOiB0byBjcmVhdGUgY2hlY2twb2ludCBiZWZvcmUgQHNlbGVjdFRhcmdldCgpXG4gICAgICBmbigpXG4gICAgICBAZW1pdFdpbGxGaW5pc2hNdXRhdGlvbigpXG4gICAgICBAZ3JvdXBDaGFuZ2VzU2luY2VCdWZmZXJDaGVja3BvaW50KCd1bmRvJylcblxuICAgIGVsc2VcbiAgICAgIEBub3JtYWxpemVTZWxlY3Rpb25zSWZOZWNlc3NhcnkoKVxuICAgICAgQGVkaXRvci50cmFuc2FjdCA9PlxuICAgICAgICBmbigpXG4gICAgICAgIEBlbWl0V2lsbEZpbmlzaE11dGF0aW9uKClcblxuICAgIEBlbWl0RGlkRmluaXNoTXV0YXRpb24oKVxuXG4gICMgTWFpblxuICBleGVjdXRlOiAtPlxuICAgIEBzdGFydE11dGF0aW9uID0+XG4gICAgICBpZiBAc2VsZWN0VGFyZ2V0KClcbiAgICAgICAgaWYgQG11dGF0ZVNlbGVjdGlvbk9yZGVyZFxuICAgICAgICAgIHNlbGVjdGlvbnMgPSBAZWRpdG9yLmdldFNlbGVjdGlvbnNPcmRlcmVkQnlCdWZmZXJQb3NpdGlvbigpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBzZWxlY3Rpb25zID0gQGVkaXRvci5nZXRTZWxlY3Rpb25zKClcbiAgICAgICAgZm9yIHNlbGVjdGlvbiBpbiBzZWxlY3Rpb25zXG4gICAgICAgICAgQG11dGF0ZVNlbGVjdGlvbihzZWxlY3Rpb24pXG4gICAgICAgIEByZXN0b3JlQ3Vyc29yUG9zaXRpb25zSWZOZWNlc3NhcnkoKVxuXG4gICAgIyBFdmVuIHRob3VnaCB3ZSBmYWlsIHRvIHNlbGVjdCB0YXJnZXQgYW5kIGZhaWwgdG8gbXV0YXRlLFxuICAgICMgd2UgaGF2ZSB0byByZXR1cm4gdG8gbm9ybWFsLW1vZGUgZnJvbSBvcGVyYXRvci1wZW5kaW5nIG9yIHZpc3VhbFxuICAgIEBhY3RpdmF0ZU1vZGUoJ25vcm1hbCcpXG5cbiAgIyBSZXR1cm4gdHJ1ZSB1bmxlc3MgYWxsIHNlbGVjdGlvbiBpcyBlbXB0eS5cbiAgc2VsZWN0VGFyZ2V0OiAtPlxuICAgIHJldHVybiBAdGFyZ2V0U2VsZWN0ZWQgaWYgQHRhcmdldFNlbGVjdGVkP1xuICAgIEBtdXRhdGlvbk1hbmFnZXIuaW5pdChcbiAgICAgIGlzU2VsZWN0OiBAaW5zdGFuY2VvZignU2VsZWN0JylcbiAgICAgIHVzZU1hcmtlcjogQG5lZWRTdGF5KCkgYW5kIEBzdGF5QnlNYXJrZXJcbiAgICApXG5cbiAgICAjIEN1cnJlbnRseSBvbmx5IG1vdGlvbiBoYXZlIGZvcmNlV2lzZSBtZXRob2RzXG4gICAgQHRhcmdldC5mb3JjZVdpc2U/KEB3aXNlKSBpZiBAd2lzZT9cbiAgICBAZW1pdFdpbGxTZWxlY3RUYXJnZXQoKVxuXG4gICAgIyBBbGxvdyBjdXJzb3IgcG9zaXRpb24gYWRqdXN0bWVudCAnb24td2lsbC1zZWxlY3QtdGFyZ2V0JyBob29rLlxuICAgICMgc28gY2hlY2twb2ludCBjb21lcyBBRlRFUiBAZW1pdFdpbGxTZWxlY3RUYXJnZXQoKVxuICAgIEBtdXRhdGlvbk1hbmFnZXIuc2V0Q2hlY2twb2ludCgnd2lsbC1zZWxlY3QnKVxuXG4gICAgIyBOT1RFXG4gICAgIyBTaW5jZSBNb3ZlVG9OZXh0T2NjdXJyZW5jZSwgTW92ZVRvUHJldmlvdXNPY2N1cnJlbmNlIG1vdGlvbiBtb3ZlIGJ5XG4gICAgIyAgb2NjdXJyZW5jZS1tYXJrZXIsIG9jY3VycmVuY2UtbWFya2VyIGhhcyB0byBiZSBjcmVhdGVkIEJFRk9SRSBgQHRhcmdldC5leGVjdXRlKClgXG4gICAgIyBBbmQgd2hlbiByZXBlYXRlZCwgb2NjdXJyZW5jZSBwYXR0ZXJuIGlzIGFscmVhZHkgY2FjaGVkIGF0IEBwYXR0ZXJuRm9yT2NjdXJyZW5jZVxuICAgIGlmIEBpc1JlcGVhdGVkKCkgYW5kIEBpc09jY3VycmVuY2UoKSBhbmQgbm90IEBvY2N1cnJlbmNlTWFuYWdlci5oYXNNYXJrZXJzKClcbiAgICAgIEBvY2N1cnJlbmNlTWFuYWdlci5hZGRQYXR0ZXJuKEBwYXR0ZXJuRm9yT2NjdXJyZW5jZSwge0BvY2N1cnJlbmNlVHlwZX0pXG5cbiAgICBAdGFyZ2V0LmV4ZWN1dGUoKVxuXG4gICAgQG11dGF0aW9uTWFuYWdlci5zZXRDaGVja3BvaW50KCdkaWQtc2VsZWN0JylcbiAgICBpZiBAaXNPY2N1cnJlbmNlKClcbiAgICAgICMgVG8gcmVwb2VhdChgLmApIG9wZXJhdGlvbiB3aGVyZSBtdWx0aXBsZSBvY2N1cnJlbmNlIHBhdHRlcm5zIHdhcyBzZXQuXG4gICAgICAjIEhlcmUgd2Ugc2F2ZSBwYXR0ZXJucyB3aGljaCByZXByZXNlbnQgdW5pb25lZCByZWdleCB3aGljaCBAb2NjdXJyZW5jZU1hbmFnZXIga25vd3MuXG4gICAgICBAcGF0dGVybkZvck9jY3VycmVuY2UgPz0gQG9jY3VycmVuY2VNYW5hZ2VyLmJ1aWxkUGF0dGVybigpXG5cbiAgICAgIGlmIEBvY2N1cnJlbmNlTWFuYWdlci5zZWxlY3QoKVxuICAgICAgICAjIFRvIHNraXAgcmVzdG9yZWluZyBwb3NpdGlvbiBmcm9tIHNlbGVjdGlvbiBwcm9wIHdoZW4gc2hpZnQgdmlzdWFsLW1vZGUgc3VibW9kZSBvbiBTZWxlY3RPY2N1cnJlbmNlXG4gICAgICAgIHN3cmFwLmNsZWFyUHJvcGVydGllcyhAZWRpdG9yKVxuXG4gICAgICAgIEBvY2N1cnJlbmNlU2VsZWN0ZWQgPSB0cnVlXG4gICAgICAgIEBtdXRhdGlvbk1hbmFnZXIuc2V0Q2hlY2twb2ludCgnZGlkLXNlbGVjdC1vY2N1cnJlbmNlJylcblxuICAgIGlmIGhhdmVTb21lTm9uRW1wdHlTZWxlY3Rpb24oQGVkaXRvcikgb3IgQHRhcmdldC5nZXROYW1lKCkgaXMgXCJFbXB0eVwiXG4gICAgICBAZW1pdERpZFNlbGVjdFRhcmdldCgpXG4gICAgICBAZmxhc2hDaGFuZ2VJZk5lY2Vzc2FyeSgpXG4gICAgICBAdHJhY2tDaGFuZ2VJZk5lY2Vzc2FyeSgpXG4gICAgICBAdGFyZ2V0U2VsZWN0ZWQgPSB0cnVlXG4gICAgICB0cnVlXG4gICAgZWxzZVxuICAgICAgQGVtaXREaWRGYWlsU2VsZWN0VGFyZ2V0KClcbiAgICAgIEB0YXJnZXRTZWxlY3RlZCA9IGZhbHNlXG4gICAgICBmYWxzZVxuXG4gIHJlc3RvcmVDdXJzb3JQb3NpdGlvbnNJZk5lY2Vzc2FyeTogLT5cbiAgICByZXR1cm4gdW5sZXNzIEByZXN0b3JlUG9zaXRpb25zXG5cbiAgICBvcHRpb25zID1cbiAgICAgIHN0YXk6IEBuZWVkU3RheU9uUmVzdG9yZSgpXG4gICAgICBvY2N1cnJlbmNlU2VsZWN0ZWQ6IEBvY2N1cnJlbmNlU2VsZWN0ZWRcbiAgICAgIGlzQmxvY2t3aXNlOiBAdGFyZ2V0Py5pc0Jsb2Nrd2lzZT8oKVxuXG4gICAgQG11dGF0aW9uTWFuYWdlci5yZXN0b3JlQ3Vyc29yUG9zaXRpb25zKG9wdGlvbnMpXG4gICAgQGVtaXREaWRSZXN0b3JlQ3Vyc29yUG9zaXRpb25zKClcblxuIyBTZWxlY3RcbiMgV2hlbiB0ZXh0LW9iamVjdCBpcyBpbnZva2VkIGZyb20gbm9ybWFsIG9yIHZpdXNhbC1tb2RlLCBvcGVyYXRpb24gd291bGQgYmVcbiMgID0+IFNlbGVjdCBvcGVyYXRvciB3aXRoIHRhcmdldD10ZXh0LW9iamVjdFxuIyBXaGVuIG1vdGlvbiBpcyBpbnZva2VkIGZyb20gdmlzdWFsLW1vZGUsIG9wZXJhdGlvbiB3b3VsZCBiZVxuIyAgPT4gU2VsZWN0IG9wZXJhdG9yIHdpdGggdGFyZ2V0PW1vdGlvbilcbiMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIFNlbGVjdCBleHRlbmRzIE9wZXJhdG9yXG4gIEBleHRlbmQoZmFsc2UpXG4gIGZsYXNoVGFyZ2V0OiBmYWxzZVxuICByZWNvcmRhYmxlOiBmYWxzZVxuICBhY2NlcHRQcmVzZXRPY2N1cnJlbmNlOiBmYWxzZVxuICBhY2NlcHRQZXJzaXN0ZW50U2VsZWN0aW9uOiBmYWxzZVxuXG4gIGV4ZWN1dGU6IC0+XG4gICAgQHN0YXJ0TXV0YXRpb24oQHNlbGVjdFRhcmdldC5iaW5kKHRoaXMpKVxuICAgIGlmIEB0YXJnZXQuaXNUZXh0T2JqZWN0KCkgYW5kIHdpc2UgPSBAdGFyZ2V0LmdldFdpc2UoKVxuICAgICAgQGFjdGl2YXRlTW9kZUlmTmVjZXNzYXJ5KCd2aXN1YWwnLCB3aXNlKVxuXG5jbGFzcyBTZWxlY3RMYXRlc3RDaGFuZ2UgZXh0ZW5kcyBTZWxlY3RcbiAgQGV4dGVuZCgpXG4gIEBkZXNjcmlwdGlvbjogXCJTZWxlY3QgbGF0ZXN0IHlhbmtlZCBvciBjaGFuZ2VkIHJhbmdlXCJcbiAgdGFyZ2V0OiAnQUxhdGVzdENoYW5nZSdcblxuY2xhc3MgU2VsZWN0UHJldmlvdXNTZWxlY3Rpb24gZXh0ZW5kcyBTZWxlY3RcbiAgQGV4dGVuZCgpXG4gIHRhcmdldDogXCJQcmV2aW91c1NlbGVjdGlvblwiXG5cbmNsYXNzIFNlbGVjdFBlcnNpc3RlbnRTZWxlY3Rpb24gZXh0ZW5kcyBTZWxlY3RcbiAgQGV4dGVuZCgpXG4gIEBkZXNjcmlwdGlvbjogXCJTZWxlY3QgcGVyc2lzdGVudC1zZWxlY3Rpb24gYW5kIGNsZWFyIGFsbCBwZXJzaXN0ZW50LXNlbGVjdGlvbiwgaXQncyBsaWtlIGNvbnZlcnQgdG8gcmVhbC1zZWxlY3Rpb25cIlxuICB0YXJnZXQ6IFwiQVBlcnNpc3RlbnRTZWxlY3Rpb25cIlxuXG5jbGFzcyBTZWxlY3RPY2N1cnJlbmNlIGV4dGVuZHMgT3BlcmF0b3JcbiAgQGV4dGVuZCgpXG4gIEBkZXNjcmlwdGlvbjogXCJBZGQgc2VsZWN0aW9uIG9udG8gZWFjaCBtYXRjaGluZyB3b3JkIHdpdGhpbiB0YXJnZXQgcmFuZ2VcIlxuICBvY2N1cnJlbmNlOiB0cnVlXG5cbiAgZXhlY3V0ZTogLT5cbiAgICBAc3RhcnRNdXRhdGlvbiA9PlxuICAgICAgaWYgQHNlbGVjdFRhcmdldCgpXG4gICAgICAgIHN1Ym1vZGUgPSBzd3JhcC5kZXRlY3RWaXN1YWxNb2RlU3VibW9kZShAZWRpdG9yKVxuICAgICAgICBAYWN0aXZhdGVNb2RlSWZOZWNlc3NhcnkoJ3Zpc3VhbCcsIHN1Ym1vZGUpXG5cbiMgUGVyc2lzdGVudCBTZWxlY3Rpb25cbiMgPT09PT09PT09PT09PT09PT09PT09PT09PVxuY2xhc3MgQ3JlYXRlUGVyc2lzdGVudFNlbGVjdGlvbiBleHRlbmRzIE9wZXJhdG9yXG4gIEBleHRlbmQoKVxuICBmbGFzaFRhcmdldDogZmFsc2VcbiAgc3RheUF0U2FtZVBvc2l0aW9uOiB0cnVlXG4gIGFjY2VwdFByZXNldE9jY3VycmVuY2U6IGZhbHNlXG4gIGFjY2VwdFBlcnNpc3RlbnRTZWxlY3Rpb246IGZhbHNlXG5cbiAgZXhlY3V0ZTogLT5cbiAgICBAcmVzdG9yZVBvc2l0aW9ucyA9IG5vdCBAaXNNb2RlKCd2aXN1YWwnLCAnYmxvY2t3aXNlJylcbiAgICBzdXBlclxuXG4gIG11dGF0ZVNlbGVjdGlvbjogKHNlbGVjdGlvbikgLT5cbiAgICBAcGVyc2lzdGVudFNlbGVjdGlvbi5tYXJrQnVmZmVyUmFuZ2Uoc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKCkpXG5cbmNsYXNzIFRvZ2dsZVBlcnNpc3RlbnRTZWxlY3Rpb24gZXh0ZW5kcyBDcmVhdGVQZXJzaXN0ZW50U2VsZWN0aW9uXG4gIEBleHRlbmQoKVxuXG4gIGlzQ29tcGxldGU6IC0+XG4gICAgcG9pbnQgPSBAZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKClcbiAgICBAbWFya2VyVG9SZW1vdmUgPSBAcGVyc2lzdGVudFNlbGVjdGlvbi5nZXRNYXJrZXJBdFBvaW50KHBvaW50KVxuICAgIGlmIEBtYXJrZXJUb1JlbW92ZVxuICAgICAgdHJ1ZVxuICAgIGVsc2VcbiAgICAgIHN1cGVyXG5cbiAgZXhlY3V0ZTogLT5cbiAgICBpZiBAbWFya2VyVG9SZW1vdmVcbiAgICAgIEBtYXJrZXJUb1JlbW92ZS5kZXN0cm95KClcbiAgICBlbHNlXG4gICAgICBzdXBlclxuXG4jIFByZXNldCBPY2N1cnJlbmNlXG4jID09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIFRvZ2dsZVByZXNldE9jY3VycmVuY2UgZXh0ZW5kcyBPcGVyYXRvclxuICBAZXh0ZW5kKClcbiAgZmxhc2hUYXJnZXQ6IGZhbHNlXG4gIHJlcXVpcmVUYXJnZXQ6IGZhbHNlXG4gIGFjY2VwdFByZXNldE9jY3VycmVuY2U6IGZhbHNlXG4gIGFjY2VwdFBlcnNpc3RlbnRTZWxlY3Rpb246IGZhbHNlXG4gIG9jY3VycmVuY2VUeXBlOiAnYmFzZSdcblxuICBleGVjdXRlOiAtPlxuICAgIGlmIG1hcmtlciA9IEBvY2N1cnJlbmNlTWFuYWdlci5nZXRNYXJrZXJBdFBvaW50KEBlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKSlcbiAgICAgIEBvY2N1cnJlbmNlTWFuYWdlci5kZXN0cm95TWFya2VycyhbbWFya2VyXSlcbiAgICBlbHNlXG4gICAgICBwYXR0ZXJuID0gbnVsbFxuICAgICAgaXNOYXJyb3dlZCA9IEB2aW1TdGF0ZS5tb2RlTWFuYWdlci5pc05hcnJvd2VkKClcblxuICAgICAgaWYgQGlzTW9kZSgndmlzdWFsJykgYW5kIG5vdCBpc05hcnJvd2VkXG4gICAgICAgIEBvY2N1cnJlbmNlVHlwZSA9ICdiYXNlJ1xuICAgICAgICBwYXR0ZXJuID0gbmV3IFJlZ0V4cChfLmVzY2FwZVJlZ0V4cChAZWRpdG9yLmdldFNlbGVjdGVkVGV4dCgpKSwgJ2cnKVxuICAgICAgZWxzZVxuICAgICAgICBwYXR0ZXJuID0gQGdldFBhdHRlcm5Gb3JPY2N1cnJlbmNlVHlwZShAb2NjdXJyZW5jZVR5cGUpXG5cbiAgICAgIEBvY2N1cnJlbmNlTWFuYWdlci5hZGRQYXR0ZXJuKHBhdHRlcm4sIHtAb2NjdXJyZW5jZVR5cGV9KVxuICAgICAgQG9jY3VycmVuY2VNYW5hZ2VyLnNhdmVMYXN0UGF0dGVybigpXG5cbiAgICAgIEBhY3RpdmF0ZU1vZGUoJ25vcm1hbCcpIHVubGVzcyBpc05hcnJvd2VkXG5cbmNsYXNzIFRvZ2dsZVByZXNldFN1YndvcmRPY2N1cnJlbmNlIGV4dGVuZHMgVG9nZ2xlUHJlc2V0T2NjdXJyZW5jZVxuICBAZXh0ZW5kKClcbiAgb2NjdXJyZW5jZVR5cGU6ICdzdWJ3b3JkJ1xuXG4jIFdhbnQgdG8gcmVuYW1lIFJlc3RvcmVPY2N1cnJlbmNlTWFya2VyXG5jbGFzcyBBZGRQcmVzZXRPY2N1cnJlbmNlRnJvbUxhc3RPY2N1cnJlbmNlUGF0dGVybiBleHRlbmRzIFRvZ2dsZVByZXNldE9jY3VycmVuY2VcbiAgQGV4dGVuZCgpXG4gIGV4ZWN1dGU6IC0+XG4gICAgQG9jY3VycmVuY2VNYW5hZ2VyLnJlc2V0UGF0dGVybnMoKVxuICAgIGlmIHBhdHRlcm4gPSBAdmltU3RhdGUuZ2xvYmFsU3RhdGUuZ2V0KCdsYXN0T2NjdXJyZW5jZVBhdHRlcm4nKVxuICAgICAgIyBCVUc6IE5PVCBjb3JyZWN0bHkgcmVzdG9yZWQgZm9yIHN1YndvcmQgbWFya2VyXG4gICAgICBAb2NjdXJyZW5jZU1hbmFnZXIuYWRkUGF0dGVybihwYXR0ZXJuKVxuICAgICAgQGFjdGl2YXRlTW9kZSgnbm9ybWFsJylcblxuIyBEZWxldGVcbiMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIERlbGV0ZSBleHRlbmRzIE9wZXJhdG9yXG4gIEBleHRlbmQoKVxuICB0cmFja0NoYW5nZTogdHJ1ZVxuICBmbGFzaENoZWNrcG9pbnQ6ICdkaWQtc2VsZWN0LW9jY3VycmVuY2UnXG4gIGZsYXNoVHlwZUZvck9jY3VycmVuY2U6ICdvcGVyYXRvci1yZW1vdmUtb2NjdXJyZW5jZSdcbiAgc3RheU9wdGlvbk5hbWU6ICdzdGF5T25EZWxldGUnXG5cbiAgZXhlY3V0ZTogLT5cbiAgICBAb25EaWRTZWxlY3RUYXJnZXQgPT5cbiAgICAgIHJldHVybiBpZiBAb2NjdXJyZW5jZVNlbGVjdGVkXG4gICAgICBpZiBAdGFyZ2V0LmlzTGluZXdpc2UoKVxuICAgICAgICBAb25EaWRSZXN0b3JlQ3Vyc29yUG9zaXRpb25zID0+XG4gICAgICAgICAgQGFkanVzdEN1cnNvcihjdXJzb3IpIGZvciBjdXJzb3IgaW4gQGVkaXRvci5nZXRDdXJzb3JzKClcbiAgICBzdXBlclxuXG4gIG11dGF0ZVNlbGVjdGlvbjogKHNlbGVjdGlvbikgPT5cbiAgICBAc2V0VGV4dFRvUmVnaXN0ZXJGb3JTZWxlY3Rpb24oc2VsZWN0aW9uKVxuICAgIHNlbGVjdGlvbi5kZWxldGVTZWxlY3RlZFRleHQoKVxuXG4gIGFkanVzdEN1cnNvcjogKGN1cnNvcikgLT5cbiAgICByb3cgPSBnZXRWYWxpZFZpbUJ1ZmZlclJvdyhAZWRpdG9yLCBjdXJzb3IuZ2V0QnVmZmVyUm93KCkpXG4gICAgaWYgQG5lZWRTdGF5T25SZXN0b3JlKClcbiAgICAgIHBvaW50ID0gQG11dGF0aW9uTWFuYWdlci5nZXRJbml0aWFsUG9pbnRGb3JTZWxlY3Rpb24oY3Vyc29yLnNlbGVjdGlvbilcbiAgICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihbcm93LCBwb2ludC5jb2x1bW5dKVxuICAgIGVsc2VcbiAgICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihAZ2V0Rmlyc3RDaGFyYWN0ZXJQb3NpdGlvbkZvckJ1ZmZlclJvdyhyb3cpKVxuXG5jbGFzcyBEZWxldGVSaWdodCBleHRlbmRzIERlbGV0ZVxuICBAZXh0ZW5kKClcbiAgdGFyZ2V0OiAnTW92ZVJpZ2h0J1xuXG5jbGFzcyBEZWxldGVMZWZ0IGV4dGVuZHMgRGVsZXRlXG4gIEBleHRlbmQoKVxuICB0YXJnZXQ6ICdNb3ZlTGVmdCdcblxuY2xhc3MgRGVsZXRlVG9MYXN0Q2hhcmFjdGVyT2ZMaW5lIGV4dGVuZHMgRGVsZXRlXG4gIEBleHRlbmQoKVxuICB0YXJnZXQ6ICdNb3ZlVG9MYXN0Q2hhcmFjdGVyT2ZMaW5lJ1xuICBpbml0aWFsaXplOiAtPlxuICAgIGlmIEBpc01vZGUoJ3Zpc3VhbCcsICdibG9ja3dpc2UnKVxuICAgICAgIyBGSVhNRSBNYXliZSBiZWNhdXNlIG9mIGJ1ZyBvZiBDdXJyZW50U2VsZWN0aW9uLFxuICAgICAgIyB3ZSB1c2UgTW92ZVRvTGFzdENoYXJhY3Rlck9mTGluZSBhcyB0YXJnZXRcbiAgICAgIEBhY2NlcHRDdXJyZW50U2VsZWN0aW9uID0gZmFsc2VcbiAgICAgIHN3cmFwLnNldFJldmVyc2VkU3RhdGUoQGVkaXRvciwgZmFsc2UpICMgRW5zdXJlIGFsbCBzZWxlY3Rpb25zIHRvIHVuLXJldmVyc2VkXG4gICAgc3VwZXJcblxuY2xhc3MgRGVsZXRlTGluZSBleHRlbmRzIERlbGV0ZVxuICBAZXh0ZW5kKClcbiAgd2lzZTogJ2xpbmV3aXNlJ1xuICB0YXJnZXQ6IFwiTW92ZVRvUmVsYXRpdmVMaW5lXCJcblxuIyBZYW5rXG4jID09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIFlhbmsgZXh0ZW5kcyBPcGVyYXRvclxuICBAZXh0ZW5kKClcbiAgdHJhY2tDaGFuZ2U6IHRydWVcbiAgc3RheU9wdGlvbk5hbWU6ICdzdGF5T25ZYW5rJ1xuXG4gIG11dGF0ZVNlbGVjdGlvbjogKHNlbGVjdGlvbikgLT5cbiAgICBAc2V0VGV4dFRvUmVnaXN0ZXJGb3JTZWxlY3Rpb24oc2VsZWN0aW9uKVxuXG5jbGFzcyBZYW5rTGluZSBleHRlbmRzIFlhbmtcbiAgQGV4dGVuZCgpXG4gIHdpc2U6ICdsaW5ld2lzZSdcbiAgdGFyZ2V0OiBcIk1vdmVUb1JlbGF0aXZlTGluZVwiXG5cbmNsYXNzIFlhbmtUb0xhc3RDaGFyYWN0ZXJPZkxpbmUgZXh0ZW5kcyBZYW5rXG4gIEBleHRlbmQoKVxuICB0YXJnZXQ6ICdNb3ZlVG9MYXN0Q2hhcmFjdGVyT2ZMaW5lJ1xuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgW2N0cmwtYV1cbmNsYXNzIEluY3JlYXNlIGV4dGVuZHMgT3BlcmF0b3JcbiAgQGV4dGVuZCgpXG4gIHRhcmdldDogXCJJbm5lckN1cnJlbnRMaW5lXCIgIyBjdHJsLWEgaW4gbm9ybWFsLW1vZGUgZmluZCB0YXJnZXQgbnVtYmVyIGluIEN1cnJlbnRMaW5lXG4gIGZsYXNoVGFyZ2V0OiBmYWxzZSAjIGRvIG1hbnVhbGx5XG4gIHJlc3RvcmVQb3NpdGlvbnM6IGZhbHNlICMgZG8gbWFudWFsbHlcbiAgc3RlcDogMVxuXG4gIGV4ZWN1dGU6IC0+XG4gICAgQG5ld1JhbmdlcyA9IFtdXG4gICAgc3VwZXJcbiAgICBpZiBAbmV3UmFuZ2VzLmxlbmd0aFxuICAgICAgaWYgc2V0dGluZ3MuZ2V0KCdmbGFzaE9uT3BlcmF0ZScpIGFuZCAoQGdldE5hbWUoKSBub3QgaW4gc2V0dGluZ3MuZ2V0KCdmbGFzaE9uT3BlcmF0ZUJsYWNrbGlzdCcpKVxuICAgICAgICBAdmltU3RhdGUuZmxhc2goQG5ld1JhbmdlcywgdHlwZTogQGZsYXNoVHlwZUZvck9jY3VycmVuY2UpXG5cbiAgcmVwbGFjZU51bWJlckluQnVmZmVyUmFuZ2U6IChzY2FuUmFuZ2UsIGZuPW51bGwpIC0+XG4gICAgbmV3UmFuZ2VzID0gW11cbiAgICBAcGF0dGVybiA/PSAvLy8je3NldHRpbmdzLmdldCgnbnVtYmVyUmVnZXgnKX0vLy9nXG4gICAgQHNjYW5Gb3J3YXJkIEBwYXR0ZXJuLCB7c2NhblJhbmdlfSwgKGV2ZW50KSA9PlxuICAgICAgcmV0dXJuIGlmIGZuPyBhbmQgbm90IGZuKGV2ZW50KVxuICAgICAge21hdGNoVGV4dCwgcmVwbGFjZX0gPSBldmVudFxuICAgICAgbmV4dE51bWJlciA9IEBnZXROZXh0TnVtYmVyKG1hdGNoVGV4dClcbiAgICAgIG5ld1Jhbmdlcy5wdXNoKHJlcGxhY2UoU3RyaW5nKG5leHROdW1iZXIpKSlcbiAgICBuZXdSYW5nZXNcblxuICBtdXRhdGVTZWxlY3Rpb246IChzZWxlY3Rpb24pIC0+XG4gICAgc2NhblJhbmdlID0gc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKClcbiAgICBpZiBAaW5zdGFuY2VvZignSW5jcmVtZW50TnVtYmVyJykgb3IgQHRhcmdldC5pcygnQ3VycmVudFNlbGVjdGlvbicpXG4gICAgICBAbmV3UmFuZ2VzLnB1c2goQHJlcGxhY2VOdW1iZXJJbkJ1ZmZlclJhbmdlKHNjYW5SYW5nZSkuLi4pXG4gICAgICBzZWxlY3Rpb24uY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHNjYW5SYW5nZS5zdGFydClcbiAgICBlbHNlXG4gICAgICAjIGN0cmwtYSwgY3RybC14IGluIGBub3JtYWwtbW9kZWBcbiAgICAgIGluaXRpYWxQb2ludCA9IEBtdXRhdGlvbk1hbmFnZXIuZ2V0SW5pdGlhbFBvaW50Rm9yU2VsZWN0aW9uKHNlbGVjdGlvbilcbiAgICAgIG5ld1JhbmdlcyA9IEByZXBsYWNlTnVtYmVySW5CdWZmZXJSYW5nZSBzY2FuUmFuZ2UsICh7cmFuZ2UsIHN0b3B9KSAtPlxuICAgICAgICBpZiByYW5nZS5lbmQuaXNHcmVhdGVyVGhhbihpbml0aWFsUG9pbnQpXG4gICAgICAgICAgc3RvcCgpXG4gICAgICAgICAgdHJ1ZVxuICAgICAgICBlbHNlXG4gICAgICAgICAgZmFsc2VcblxuICAgICAgcG9pbnQgPSBuZXdSYW5nZXNbMF0/LmVuZC50cmFuc2xhdGUoWzAsIC0xXSkgPyBpbml0aWFsUG9pbnRcbiAgICAgIHNlbGVjdGlvbi5jdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24ocG9pbnQpXG5cbiAgZ2V0TmV4dE51bWJlcjogKG51bWJlclN0cmluZykgLT5cbiAgICBOdW1iZXIucGFyc2VJbnQobnVtYmVyU3RyaW5nLCAxMCkgKyBAc3RlcCAqIEBnZXRDb3VudCgpXG5cbiMgW2N0cmwteF1cbmNsYXNzIERlY3JlYXNlIGV4dGVuZHMgSW5jcmVhc2VcbiAgQGV4dGVuZCgpXG4gIHN0ZXA6IC0xXG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBbZyBjdHJsLWFdXG5jbGFzcyBJbmNyZW1lbnROdW1iZXIgZXh0ZW5kcyBJbmNyZWFzZVxuICBAZXh0ZW5kKClcbiAgYmFzZU51bWJlcjogbnVsbFxuICB0YXJnZXQ6IG51bGxcbiAgbXV0YXRlU2VsZWN0aW9uT3JkZXJkOiB0cnVlXG5cbiAgZ2V0TmV4dE51bWJlcjogKG51bWJlclN0cmluZykgLT5cbiAgICBpZiBAYmFzZU51bWJlcj9cbiAgICAgIEBiYXNlTnVtYmVyICs9IEBzdGVwICogQGdldENvdW50KClcbiAgICBlbHNlXG4gICAgICBAYmFzZU51bWJlciA9IE51bWJlci5wYXJzZUludChudW1iZXJTdHJpbmcsIDEwKVxuICAgIEBiYXNlTnVtYmVyXG5cbiMgW2cgY3RybC14XVxuY2xhc3MgRGVjcmVtZW50TnVtYmVyIGV4dGVuZHMgSW5jcmVtZW50TnVtYmVyXG4gIEBleHRlbmQoKVxuICBzdGVwOiAtMVxuXG4jIFB1dFxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIEN1cnNvciBwbGFjZW1lbnQ6XG4jIC0gcGxhY2UgYXQgZW5kIG9mIG11dGF0aW9uOiBwYXN0ZSBub24tbXVsdGlsaW5lIGNoYXJhY3Rlcndpc2UgdGV4dFxuIyAtIHBsYWNlIGF0IHN0YXJ0IG9mIG11dGF0aW9uOiBub24tbXVsdGlsaW5lIGNoYXJhY3Rlcndpc2UgdGV4dChjaGFyYWN0ZXJ3aXNlLCBsaW5ld2lzZSlcbmNsYXNzIFB1dEJlZm9yZSBleHRlbmRzIE9wZXJhdG9yXG4gIEBleHRlbmQoKVxuICBsb2NhdGlvbjogJ2JlZm9yZSdcbiAgdGFyZ2V0OiAnRW1wdHknXG4gIGZsYXNoVHlwZTogJ29wZXJhdG9yLWxvbmcnXG4gIHJlc3RvcmVQb3NpdGlvbnM6IGZhbHNlICMgbWFuYWdlIG1hbnVhbGx5XG4gIGZsYXNoVGFyZ2V0OiB0cnVlICMgbWFuYWdlIG1hbnVhbGx5XG4gIHRyYWNrQ2hhbmdlOiBmYWxzZSAjIG1hbmFnZSBtYW51YWxseVxuXG4gIGV4ZWN1dGU6IC0+XG4gICAgQG11dGF0aW9uc0J5U2VsZWN0aW9uID0gbmV3IE1hcCgpXG4gICAgQHJlZ2lzdGVyQnlTZWxlY3Rpb24gPSBuZXcgTWFwKClcbiAgICBmb3Igc2VsZWN0aW9uIGluIEBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpXG4gICAgICByZWdpc3RlciA9IEB2aW1TdGF0ZS5yZWdpc3Rlci5nZXQobnVsbCwgc2VsZWN0aW9uKVxuICAgICAgaWYgcmVnaXN0ZXIudGV4dD9cbiAgICAgICAgQHJlZ2lzdGVyQnlTZWxlY3Rpb24uc2V0KHNlbGVjdGlvbiwgcmVnaXN0ZXIpXG5cbiAgICByZXR1cm4gdW5sZXNzIEByZWdpc3RlckJ5U2VsZWN0aW9uLnNpemVcblxuICAgIEBvbkRpZEZpbmlzaE11dGF0aW9uKEBhZGp1c3RDdXJzb3JQb3NpdGlvbi5iaW5kKHRoaXMpKVxuXG4gICAgQG9uRGlkRmluaXNoT3BlcmF0aW9uID0+XG4gICAgICAjIFRyYWNrQ2hhbmdlXG4gICAgICBpZiBuZXdSYW5nZSA9IEBtdXRhdGlvbnNCeVNlbGVjdGlvbi5nZXQoQGVkaXRvci5nZXRMYXN0U2VsZWN0aW9uKCkpXG4gICAgICAgIEBzZXRNYXJrRm9yQ2hhbmdlKG5ld1JhbmdlKVxuXG4gICAgICAjIEZsYXNoXG4gICAgICBpZiBzZXR0aW5ncy5nZXQoJ2ZsYXNoT25PcGVyYXRlJykgYW5kIChAZ2V0TmFtZSgpIG5vdCBpbiBzZXR0aW5ncy5nZXQoJ2ZsYXNoT25PcGVyYXRlQmxhY2tsaXN0JykpXG4gICAgICAgIHRvUmFuZ2UgPSAoc2VsZWN0aW9uKSA9PiBAbXV0YXRpb25zQnlTZWxlY3Rpb24uZ2V0KHNlbGVjdGlvbilcbiAgICAgICAgQHZpbVN0YXRlLmZsYXNoKEBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpLm1hcCh0b1JhbmdlKSwgdHlwZTogQGdldEZsYXNoVHlwZSgpKVxuXG4gICAgc3VwZXJcblxuICBhZGp1c3RDdXJzb3JQb3NpdGlvbjogLT5cbiAgICBmb3Igc2VsZWN0aW9uIGluIEBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpXG4gICAgICB7Y3Vyc29yfSA9IHNlbGVjdGlvblxuICAgICAge3N0YXJ0LCBlbmR9ID0gbmV3UmFuZ2UgPSBAbXV0YXRpb25zQnlTZWxlY3Rpb24uZ2V0KHNlbGVjdGlvbilcbiAgICAgIGlmIEBsaW5ld2lzZVBhc3RlXG4gICAgICAgIG1vdmVDdXJzb3JUb0ZpcnN0Q2hhcmFjdGVyQXRSb3coY3Vyc29yLCBzdGFydC5yb3cpXG4gICAgICBlbHNlXG4gICAgICAgIGlmIG5ld1JhbmdlLmlzU2luZ2xlTGluZSgpXG4gICAgICAgICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKGVuZC50cmFuc2xhdGUoWzAsIC0xXSkpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24oc3RhcnQpXG5cbiAgbXV0YXRlU2VsZWN0aW9uOiAoc2VsZWN0aW9uKSAtPlxuICAgIHt0ZXh0LCB0eXBlfSA9IEByZWdpc3RlckJ5U2VsZWN0aW9uLmdldChzZWxlY3Rpb24pXG4gICAgcmV0dXJuIHVubGVzcyB0ZXh0XG4gICAgdGV4dCA9IF8ubXVsdGlwbHlTdHJpbmcodGV4dCwgQGdldENvdW50KCkpXG4gICAgQGxpbmV3aXNlUGFzdGUgPSB0eXBlIGlzICdsaW5ld2lzZScgb3IgQGlzTW9kZSgndmlzdWFsJywgJ2xpbmV3aXNlJylcbiAgICBuZXdSYW5nZSA9IEBwYXN0ZShzZWxlY3Rpb24sIHRleHQsIHtAbGluZXdpc2VQYXN0ZX0pXG4gICAgQG11dGF0aW9uc0J5U2VsZWN0aW9uLnNldChzZWxlY3Rpb24sIG5ld1JhbmdlKVxuXG4gIHBhc3RlOiAoc2VsZWN0aW9uLCB0ZXh0LCB7bGluZXdpc2VQYXN0ZX0pIC0+XG4gICAgaWYgbGluZXdpc2VQYXN0ZVxuICAgICAgQHBhc3RlTGluZXdpc2Uoc2VsZWN0aW9uLCB0ZXh0KVxuICAgIGVsc2VcbiAgICAgIEBwYXN0ZUNoYXJhY3Rlcndpc2Uoc2VsZWN0aW9uLCB0ZXh0KVxuXG4gIHBhc3RlQ2hhcmFjdGVyd2lzZTogKHNlbGVjdGlvbiwgdGV4dCkgLT5cbiAgICB7Y3Vyc29yfSA9IHNlbGVjdGlvblxuICAgIGlmIHNlbGVjdGlvbi5pc0VtcHR5KCkgYW5kIEBsb2NhdGlvbiBpcyAnYWZ0ZXInIGFuZCBub3QgaXNFbXB0eVJvdyhAZWRpdG9yLCBjdXJzb3IuZ2V0QnVmZmVyUm93KCkpXG4gICAgICBjdXJzb3IubW92ZVJpZ2h0KClcbiAgICByZXR1cm4gc2VsZWN0aW9uLmluc2VydFRleHQodGV4dClcblxuICAjIFJldHVybiBuZXdSYW5nZVxuICBwYXN0ZUxpbmV3aXNlOiAoc2VsZWN0aW9uLCB0ZXh0KSAtPlxuICAgIHtjdXJzb3J9ID0gc2VsZWN0aW9uXG4gICAgY3Vyc29yUm93ID0gY3Vyc29yLmdldEJ1ZmZlclJvdygpXG4gICAgdGV4dCArPSBcIlxcblwiIHVubGVzcyB0ZXh0LmVuZHNXaXRoKFwiXFxuXCIpXG4gICAgbmV3UmFuZ2UgPSBudWxsXG4gICAgaWYgc2VsZWN0aW9uLmlzRW1wdHkoKVxuICAgICAgaWYgQGxvY2F0aW9uIGlzICdiZWZvcmUnXG4gICAgICAgIG5ld1JhbmdlID0gc2V0VGV4dEF0QnVmZmVyUG9zaXRpb24oQGVkaXRvciwgW2N1cnNvclJvdywgMF0sIHRleHQpXG4gICAgICAgIHNldEJ1ZmZlclJvdyhjdXJzb3IsIG5ld1JhbmdlLnN0YXJ0LnJvdylcbiAgICAgIGVsc2UgaWYgQGxvY2F0aW9uIGlzICdhZnRlcidcbiAgICAgICAgZW5zdXJlRW5kc1dpdGhOZXdMaW5lRm9yQnVmZmVyUm93KEBlZGl0b3IsIGN1cnNvclJvdylcbiAgICAgICAgbmV3UmFuZ2UgPSBzZXRUZXh0QXRCdWZmZXJQb3NpdGlvbihAZWRpdG9yLCBbY3Vyc29yUm93ICsgMSwgMF0sIHRleHQpXG4gICAgZWxzZVxuICAgICAgc2VsZWN0aW9uLmluc2VydFRleHQoXCJcXG5cIikgdW5sZXNzIEBpc01vZGUoJ3Zpc3VhbCcsICdsaW5ld2lzZScpXG4gICAgICBuZXdSYW5nZSA9IHNlbGVjdGlvbi5pbnNlcnRUZXh0KHRleHQpXG5cbiAgICByZXR1cm4gbmV3UmFuZ2VcblxuY2xhc3MgUHV0QWZ0ZXIgZXh0ZW5kcyBQdXRCZWZvcmVcbiAgQGV4dGVuZCgpXG4gIGxvY2F0aW9uOiAnYWZ0ZXInXG5cbmNsYXNzIEFkZEJsYW5rTGluZUJlbG93IGV4dGVuZHMgT3BlcmF0b3JcbiAgQGV4dGVuZCgpXG4gIGZsYXNoVGFyZ2V0OiBmYWxzZVxuICB0YXJnZXQ6IFwiRW1wdHlcIlxuICBzdGF5QXRTYW1lUG9zaXRpb246IHRydWVcbiAgc3RheUJ5TWFya2VyOiB0cnVlXG4gIHdoZXJlOiAnYmVsb3cnXG5cbiAgbXV0YXRlU2VsZWN0aW9uOiAoc2VsZWN0aW9uKSAtPlxuICAgIHJvdyA9IHNlbGVjdGlvbi5nZXRIZWFkQnVmZmVyUG9zaXRpb24oKS5yb3dcbiAgICByb3cgKz0gMSBpZiBAd2hlcmUgaXMgJ2JlbG93J1xuICAgIHBvaW50ID0gW3JvdywgMF1cbiAgICBAZWRpdG9yLnNldFRleHRJbkJ1ZmZlclJhbmdlKFtwb2ludCwgcG9pbnRdLCBcIlxcblwiLnJlcGVhdChAZ2V0Q291bnQoKSkpXG5cbmNsYXNzIEFkZEJsYW5rTGluZUFib3ZlIGV4dGVuZHMgQWRkQmxhbmtMaW5lQmVsb3dcbiAgQGV4dGVuZCgpXG4gIHdoZXJlOiAnYWJvdmUnXG4iXX0=
