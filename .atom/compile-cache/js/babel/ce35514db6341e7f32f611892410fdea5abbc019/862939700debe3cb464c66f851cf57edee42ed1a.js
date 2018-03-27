"use babel";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _ = require("underscore-plus");
var Base = require("./base");

var Operator = (function (_Base) {
  _inherits(Operator, _Base);

  function Operator() {
    _classCallCheck(this, Operator);

    _get(Object.getPrototypeOf(Operator.prototype), "constructor", this).apply(this, arguments);

    this.requireTarget = true;
    this.recordable = true;
    this.wise = null;
    this.occurrence = false;
    this.occurrenceType = "base";
    this.flashTarget = true;
    this.flashCheckpoint = "did-finish";
    this.flashType = "operator";
    this.flashTypeForOccurrence = "operator-occurrence";
    this.trackChange = false;
    this.patternForOccurrence = null;
    this.stayAtSamePosition = null;
    this.stayOptionName = null;
    this.stayByMarker = false;
    this.restorePositions = true;
    this.setToFirstCharacterOnLinewise = false;
    this.acceptPresetOccurrence = true;
    this.acceptPersistentSelection = true;
    this.bufferCheckpointByPurpose = null;
    this.mutateSelectionOrderd = false;
    this.supportEarlySelect = false;
    this.targetSelected = null;
  }

  _createClass(Operator, [{
    key: "canEarlySelect",
    value: function canEarlySelect() {
      return this.supportEarlySelect && !this.repeated;
    }

    // -------------------------

    // Called when operation finished
    // This is essentially to reset state for `.` repeat.
  }, {
    key: "resetState",
    value: function resetState() {
      this.targetSelected = null;
      this.occurrenceSelected = false;
    }

    // Two checkpoint for different purpose
    // - one for undo(handled by modeManager)
    // - one for preserve last inserted text
  }, {
    key: "createBufferCheckpoint",
    value: function createBufferCheckpoint(purpose) {
      if (!this.bufferCheckpointByPurpose) this.bufferCheckpointByPurpose = {};
      this.bufferCheckpointByPurpose[purpose] = this.editor.createCheckpoint();
    }
  }, {
    key: "getBufferCheckpoint",
    value: function getBufferCheckpoint(purpose) {
      if (this.bufferCheckpointByPurpose) {
        return this.bufferCheckpointByPurpose[purpose];
      }
    }
  }, {
    key: "deleteBufferCheckpoint",
    value: function deleteBufferCheckpoint(purpose) {
      if (this.bufferCheckpointByPurpose) {
        delete this.bufferCheckpointByPurpose[purpose];
      }
    }
  }, {
    key: "groupChangesSinceBufferCheckpoint",
    value: function groupChangesSinceBufferCheckpoint(purpose) {
      var checkpoint = this.getBufferCheckpoint(purpose);
      if (checkpoint) {
        this.editor.groupChangesSinceCheckpoint(checkpoint);
        this.deleteBufferCheckpoint(purpose);
      }
    }
  }, {
    key: "setMarkForChange",
    value: function setMarkForChange(range) {
      this.vimState.mark.set("[", range.start);
      this.vimState.mark.set("]", range.end);
    }
  }, {
    key: "needFlash",
    value: function needFlash() {
      return this.flashTarget && this.getConfig("flashOnOperate") && !this.getConfig("flashOnOperateBlacklist").includes(this.name) && (this.mode !== "visual" || this.submode !== this.target.wise) // e.g. Y in vC
      ;
    }
  }, {
    key: "flashIfNecessary",
    value: function flashIfNecessary(ranges) {
      if (this.needFlash()) {
        this.vimState.flash(ranges, { type: this.getFlashType() });
      }
    }
  }, {
    key: "flashChangeIfNecessary",
    value: function flashChangeIfNecessary() {
      var _this = this;

      if (this.needFlash()) {
        this.onDidFinishOperation(function () {
          var ranges = _this.mutationManager.getSelectedBufferRangesForCheckpoint(_this.flashCheckpoint);
          _this.vimState.flash(ranges, { type: _this.getFlashType() });
        });
      }
    }
  }, {
    key: "getFlashType",
    value: function getFlashType() {
      return this.occurrenceSelected ? this.flashTypeForOccurrence : this.flashType;
    }
  }, {
    key: "trackChangeIfNecessary",
    value: function trackChangeIfNecessary() {
      var _this2 = this;

      if (!this.trackChange) return;
      this.onDidFinishOperation(function () {
        var range = _this2.mutationManager.getMutatedBufferRangeForSelection(_this2.editor.getLastSelection());
        if (range) _this2.setMarkForChange(range);
      });
    }
  }, {
    key: "initialize",
    value: function initialize() {
      this.subscribeResetOccurrencePatternIfNeeded();

      // When preset-occurrence was exists, operate on occurrence-wise
      if (this.acceptPresetOccurrence && this.occurrenceManager.hasMarkers()) {
        this.occurrence = true;
      }

      // [FIXME] ORDER-MATTER
      // To pick cursor-word to find occurrence base pattern.
      // This has to be done BEFORE converting persistent-selection into real-selection.
      // Since when persistent-selection is actually selected, it change cursor position.
      if (this.occurrence && !this.occurrenceManager.hasMarkers()) {
        var regex = this.patternForOccurrence || this.getPatternForOccurrenceType(this.occurrenceType);
        this.occurrenceManager.addPattern(regex);
      }

      // This change cursor position.
      if (this.selectPersistentSelectionIfNecessary()) {
        // [FIXME] selection-wise is not synched if it already visual-mode
        if (this.mode !== "visual") {
          this.vimState.modeManager.activate("visual", this.swrap.detectWise(this.editor));
        }
      }

      if (this.mode === "visual" && this.requireTarget) {
        this.target = "CurrentSelection";
      }
      if (_.isString(this.target)) {
        this.setTarget(this.getInstance(this.target));
      }

      _get(Object.getPrototypeOf(Operator.prototype), "initialize", this).call(this);
    }
  }, {
    key: "subscribeResetOccurrencePatternIfNeeded",
    value: function subscribeResetOccurrencePatternIfNeeded() {
      var _this3 = this;

      // [CAUTION]
      // This method has to be called in PROPER timing.
      // If occurrence is true but no preset-occurrence
      // Treat that `occurrence` is BOUNDED to operator itself, so cleanp at finished.
      if (this.occurrence && !this.occurrenceManager.hasMarkers()) {
        this.onDidResetOperationStack(function () {
          return _this3.occurrenceManager.resetPatterns();
        });
      }
    }
  }, {
    key: "setModifier",
    value: function setModifier(_ref) {
      var _this4 = this;

      var wise = _ref.wise;
      var occurrence = _ref.occurrence;
      var occurrenceType = _ref.occurrenceType;

      if (wise) {
        this.wise = wise;
      } else if (occurrence) {
        this.occurrence = occurrence;
        this.occurrenceType = occurrenceType;
        // This is o modifier case(e.g. `c o p`, `d O f`)
        // We RESET existing occurence-marker when `o` or `O` modifier is typed by user.
        var regex = this.getPatternForOccurrenceType(occurrenceType);
        this.occurrenceManager.addPattern(regex, { reset: true, occurrenceType: occurrenceType });
        this.onDidResetOperationStack(function () {
          return _this4.occurrenceManager.resetPatterns();
        });
      }
    }

    // return true/false to indicate success
  }, {
    key: "selectPersistentSelectionIfNecessary",
    value: function selectPersistentSelectionIfNecessary() {
      if (this.acceptPersistentSelection && this.getConfig("autoSelectPersistentSelectionOnOperate") && !this.persistentSelection.isEmpty()) {
        this.persistentSelection.select();
        this.editor.mergeIntersectingSelections();
        this.swrap.saveProperties(this.editor);

        return true;
      } else {
        return false;
      }
    }
  }, {
    key: "getPatternForOccurrenceType",
    value: function getPatternForOccurrenceType(occurrenceType) {
      if (occurrenceType === "base") {
        return this.utils.getWordPatternAtBufferPosition(this.editor, this.getCursorBufferPosition());
      } else if (occurrenceType === "subword") {
        return this.utils.getSubwordPatternAtBufferPosition(this.editor, this.getCursorBufferPosition());
      }
    }

    // target is TextObject or Motion to operate on.
  }, {
    key: "setTarget",
    value: function setTarget(target) {
      this.target = target;
      this.target.operator = this;
      this.emitDidSetTarget(this);

      if (this.canEarlySelect()) {
        this.normalizeSelectionsIfNecessary();
        this.createBufferCheckpoint("undo");
        this.selectTarget();
      }
    }
  }, {
    key: "setTextToRegisterForSelection",
    value: function setTextToRegisterForSelection(selection) {
      this.setTextToRegister(selection.getText(), selection);
    }
  }, {
    key: "setTextToRegister",
    value: function setTextToRegister(text, selection) {
      if (this.vimState.register.isUnnamed() && this.isBlackholeRegisteredOperator()) {
        return;
      }

      if (this.target.isLinewise() && !text.endsWith("\n")) {
        text += "\n";
      }

      if (text) {
        this.vimState.register.set(null, { text: text, selection: selection });

        if (this.vimState.register.isUnnamed()) {
          if (this["instanceof"]("Delete") || this["instanceof"]("Change")) {
            if (!this.needSaveToNumberedRegister(this.target) && this.utils.isSingleLineText(text)) {
              this.vimState.register.set("-", { text: text, selection: selection }); // small-change
            } else {
                this.vimState.register.set("1", { text: text, selection: selection });
              }
          } else if (this["instanceof"]("Yank")) {
            this.vimState.register.set("0", { text: text, selection: selection });
          }
        }
      }
    }
  }, {
    key: "isBlackholeRegisteredOperator",
    value: function isBlackholeRegisteredOperator() {
      var operators = this.getConfig("blackholeRegisteredOperators");
      var wildCardOperators = operators.filter(function (name) {
        return name.endsWith("*");
      });
      var commandName = this.getCommandNameWithoutPrefix();
      return wildCardOperators.some(function (name) {
        return new RegExp("^" + name.replace("*", ".*")).test(commandName);
      }) || operators.includes(commandName);
    }
  }, {
    key: "needSaveToNumberedRegister",
    value: function needSaveToNumberedRegister(target) {
      // Used to determine what register to use on change and delete operation.
      // Following motion should save to 1-9 register regerdless of content is small or big.
      var goesToNumberedRegisterMotionNames = ["MoveToPair", // %
      "MoveToNextSentence", // (, )
      "Search", // /, ?, n, N
      "MoveToNextParagraph"];
      // {, }
      return goesToNumberedRegisterMotionNames.some(function (name) {
        return target["instanceof"](name);
      });
    }
  }, {
    key: "normalizeSelectionsIfNecessary",
    value: function normalizeSelectionsIfNecessary() {
      if (this.mode === "visual" && this.target && this.target.isMotion()) {
        this.swrap.normalize(this.editor);
      }
    }
  }, {
    key: "startMutation",
    value: function startMutation(fn) {
      var _this5 = this;

      if (this.canEarlySelect()) {
        // - Skip selection normalization: already normalized before @selectTarget()
        // - Manual checkpoint grouping: to create checkpoint before @selectTarget()
        fn();
        this.emitWillFinishMutation();
        this.groupChangesSinceBufferCheckpoint("undo");
      } else {
        this.normalizeSelectionsIfNecessary();
        this.editor.transact(function () {
          fn();
          _this5.emitWillFinishMutation();
        });
      }

      this.emitDidFinishMutation();
    }

    // Main
  }, {
    key: "execute",
    value: function execute() {
      var _this6 = this;

      this.startMutation(function () {
        if (_this6.selectTarget()) {
          var selections = _this6.mutateSelectionOrderd ? _this6.editor.getSelectionsOrderedByBufferPosition() : _this6.editor.getSelections();

          for (var selection of selections) {
            _this6.mutateSelection(selection);
          }
          _this6.mutationManager.setCheckpoint("did-finish");
          _this6.restoreCursorPositionsIfNecessary();
        }
      });

      // Even though we fail to select target and fail to mutate,
      // we have to return to normal-mode from operator-pending or visual
      this.activateMode("normal");
    }

    // Return true unless all selection is empty.
  }, {
    key: "selectTarget",
    value: function selectTarget() {
      if (this.targetSelected != null) {
        return this.targetSelected;
      }
      this.mutationManager.init({ stayByMarker: this.stayByMarker });

      if (this.target.isMotion() && this.mode === "visual") this.target.wise = this.submode;
      if (this.wise != null) this.target.forceWise(this.wise);

      this.emitWillSelectTarget();

      // Allow cursor position adjustment 'on-will-select-target' hook.
      // so checkpoint comes AFTER @emitWillSelectTarget()
      this.mutationManager.setCheckpoint("will-select");

      // NOTE: When repeated, set occurrence-marker from pattern stored as state.
      if (this.repeated && this.occurrence && !this.occurrenceManager.hasMarkers()) {
        this.occurrenceManager.addPattern(this.patternForOccurrence, { occurrenceType: this.occurrenceType });
      }

      this.target.execute();

      this.mutationManager.setCheckpoint("did-select");
      if (this.occurrence) {
        if (!this.patternForOccurrence) {
          // Preserve occurrencePattern for . repeat.
          this.patternForOccurrence = this.occurrenceManager.buildPattern();
        }

        this.occurrenceWise = this.wise || "characterwise";
        if (this.occurrenceManager.select(this.occurrenceWise)) {
          this.occurrenceSelected = true;
          this.mutationManager.setCheckpoint("did-select-occurrence");
        }
      }

      this.targetSelected = this.vimState.haveSomeNonEmptySelection() || this.target.name === "Empty";
      if (this.targetSelected) {
        this.emitDidSelectTarget();
        this.flashChangeIfNecessary();
        this.trackChangeIfNecessary();
      } else {
        this.emitDidFailSelectTarget();
      }

      return this.targetSelected;
    }
  }, {
    key: "restoreCursorPositionsIfNecessary",
    value: function restoreCursorPositionsIfNecessary() {
      if (!this.restorePositions) return;

      var stay = this.stayAtSamePosition != null ? this.stayAtSamePosition : this.getConfig(this.stayOptionName) || this.occurrenceSelected && this.getConfig("stayOnOccurrence");
      var wise = this.occurrenceSelected ? this.occurrenceWise : this.target.wise;
      var setToFirstCharacterOnLinewise = this.setToFirstCharacterOnLinewise;

      this.mutationManager.restoreCursorPositions({ stay: stay, wise: wise, setToFirstCharacterOnLinewise: setToFirstCharacterOnLinewise });
    }
  }], [{
    key: "operationKind",
    value: "operator",
    enumerable: true
  }]);

  return Operator;
})(Base);

Operator.register(false);

var SelectBase = (function (_Operator) {
  _inherits(SelectBase, _Operator);

  function SelectBase() {
    _classCallCheck(this, SelectBase);

    _get(Object.getPrototypeOf(SelectBase.prototype), "constructor", this).apply(this, arguments);

    this.flashTarget = false;
    this.recordable = false;
  }

  _createClass(SelectBase, [{
    key: "execute",
    value: function execute() {
      var _this7 = this;

      this.startMutation(function () {
        return _this7.selectTarget();
      });

      if (this.target.selectSucceeded) {
        if (this.target.isTextObject()) {
          this.editor.scrollToCursorPosition();
        }
        var wise = this.occurrenceSelected ? this.occurrenceWise : this.target.wise;
        this.activateModeIfNecessary("visual", wise);
      } else {
        this.cancelOperation();
      }
    }
  }]);

  return SelectBase;
})(Operator);

SelectBase.register(false);

var Select = (function (_SelectBase) {
  _inherits(Select, _SelectBase);

  function Select() {
    _classCallCheck(this, Select);

    _get(Object.getPrototypeOf(Select.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(Select, [{
    key: "execute",
    value: function execute() {
      this.swrap.saveProperties(this.editor);
      _get(Object.getPrototypeOf(Select.prototype), "execute", this).call(this);
    }
  }]);

  return Select;
})(SelectBase);

Select.register();

var SelectLatestChange = (function (_SelectBase2) {
  _inherits(SelectLatestChange, _SelectBase2);

  function SelectLatestChange() {
    _classCallCheck(this, SelectLatestChange);

    _get(Object.getPrototypeOf(SelectLatestChange.prototype), "constructor", this).apply(this, arguments);

    this.target = "ALatestChange";
  }

  return SelectLatestChange;
})(SelectBase);

SelectLatestChange.register();

var SelectPreviousSelection = (function (_SelectBase3) {
  _inherits(SelectPreviousSelection, _SelectBase3);

  function SelectPreviousSelection() {
    _classCallCheck(this, SelectPreviousSelection);

    _get(Object.getPrototypeOf(SelectPreviousSelection.prototype), "constructor", this).apply(this, arguments);

    this.target = "PreviousSelection";
  }

  return SelectPreviousSelection;
})(SelectBase);

SelectPreviousSelection.register();

var SelectPersistentSelection = (function (_SelectBase4) {
  _inherits(SelectPersistentSelection, _SelectBase4);

  function SelectPersistentSelection() {
    _classCallCheck(this, SelectPersistentSelection);

    _get(Object.getPrototypeOf(SelectPersistentSelection.prototype), "constructor", this).apply(this, arguments);

    this.target = "APersistentSelection";
    this.acceptPersistentSelection = false;
  }

  return SelectPersistentSelection;
})(SelectBase);

SelectPersistentSelection.register();

var SelectOccurrence = (function (_SelectBase5) {
  _inherits(SelectOccurrence, _SelectBase5);

  function SelectOccurrence() {
    _classCallCheck(this, SelectOccurrence);

    _get(Object.getPrototypeOf(SelectOccurrence.prototype), "constructor", this).apply(this, arguments);

    this.occurrence = true;
  }

  return SelectOccurrence;
})(SelectBase);

SelectOccurrence.register();

// SelectInVisualMode: used in visual-mode
// When text-object is invoked from normal or viusal-mode, operation would be
//  => SelectInVisualMode operator with target=text-object
// When motion is invoked from visual-mode, operation would be
//  => SelectInVisualMode operator with target=motion)
// ================================
// SelectInVisualMode is used in TWO situation.
// - visual-mode operation
//   - e.g: `v l`, `V j`, `v i p`...
// - Directly invoke text-object from normal-mode
//   - e.g: Invoke `Inner Paragraph` from command-palette.

var SelectInVisualMode = (function (_SelectBase6) {
  _inherits(SelectInVisualMode, _SelectBase6);

  function SelectInVisualMode() {
    _classCallCheck(this, SelectInVisualMode);

    _get(Object.getPrototypeOf(SelectInVisualMode.prototype), "constructor", this).apply(this, arguments);

    this.acceptPresetOccurrence = false;
    this.acceptPersistentSelection = false;
  }

  return SelectInVisualMode;
})(SelectBase);

SelectInVisualMode.register(false);

// Persistent Selection
// =========================

var CreatePersistentSelection = (function (_Operator2) {
  _inherits(CreatePersistentSelection, _Operator2);

  function CreatePersistentSelection() {
    _classCallCheck(this, CreatePersistentSelection);

    _get(Object.getPrototypeOf(CreatePersistentSelection.prototype), "constructor", this).apply(this, arguments);

    this.flashTarget = false;
    this.stayAtSamePosition = true;
    this.acceptPresetOccurrence = false;
    this.acceptPersistentSelection = false;
  }

  _createClass(CreatePersistentSelection, [{
    key: "mutateSelection",
    value: function mutateSelection(selection) {
      this.persistentSelection.markBufferRange(selection.getBufferRange());
    }
  }]);

  return CreatePersistentSelection;
})(Operator);

CreatePersistentSelection.register();

var TogglePersistentSelection = (function (_CreatePersistentSelection) {
  _inherits(TogglePersistentSelection, _CreatePersistentSelection);

  function TogglePersistentSelection() {
    _classCallCheck(this, TogglePersistentSelection);

    _get(Object.getPrototypeOf(TogglePersistentSelection.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(TogglePersistentSelection, [{
    key: "isComplete",
    value: function isComplete() {
      var point = this.editor.getCursorBufferPosition();
      this.markerToRemove = this.persistentSelection.getMarkerAtPoint(point);
      return this.markerToRemove || _get(Object.getPrototypeOf(TogglePersistentSelection.prototype), "isComplete", this).call(this);
    }
  }, {
    key: "execute",
    value: function execute() {
      if (this.markerToRemove) {
        this.markerToRemove.destroy();
      } else {
        _get(Object.getPrototypeOf(TogglePersistentSelection.prototype), "execute", this).call(this);
      }
    }
  }]);

  return TogglePersistentSelection;
})(CreatePersistentSelection);

TogglePersistentSelection.register();

// Preset Occurrence
// =========================

var TogglePresetOccurrence = (function (_Operator3) {
  _inherits(TogglePresetOccurrence, _Operator3);

  function TogglePresetOccurrence() {
    _classCallCheck(this, TogglePresetOccurrence);

    _get(Object.getPrototypeOf(TogglePresetOccurrence.prototype), "constructor", this).apply(this, arguments);

    this.target = "Empty";
    this.flashTarget = false;
    this.acceptPresetOccurrence = false;
    this.acceptPersistentSelection = false;
    this.occurrenceType = "base";
  }

  _createClass(TogglePresetOccurrence, [{
    key: "execute",
    value: function execute() {
      var marker = this.occurrenceManager.getMarkerAtPoint(this.getCursorBufferPosition());
      if (marker) {
        this.occurrenceManager.destroyMarkers([marker]);
      } else {
        var isNarrowed = this.vimState.modeManager.isNarrowed();

        var regex = undefined;
        if (this.mode === "visual" && !isNarrowed) {
          this.occurrenceType = "base";
          regex = new RegExp(_.escapeRegExp(this.editor.getSelectedText()), "g");
        } else {
          regex = this.getPatternForOccurrenceType(this.occurrenceType);
        }

        this.occurrenceManager.addPattern(regex, { occurrenceType: this.occurrenceType });
        this.occurrenceManager.saveLastPattern(this.occurrenceType);

        if (!isNarrowed) this.activateMode("normal");
      }
    }
  }]);

  return TogglePresetOccurrence;
})(Operator);

TogglePresetOccurrence.register();

var TogglePresetSubwordOccurrence = (function (_TogglePresetOccurrence) {
  _inherits(TogglePresetSubwordOccurrence, _TogglePresetOccurrence);

  function TogglePresetSubwordOccurrence() {
    _classCallCheck(this, TogglePresetSubwordOccurrence);

    _get(Object.getPrototypeOf(TogglePresetSubwordOccurrence.prototype), "constructor", this).apply(this, arguments);

    this.occurrenceType = "subword";
  }

  return TogglePresetSubwordOccurrence;
})(TogglePresetOccurrence);

TogglePresetSubwordOccurrence.register();

// Want to rename RestoreOccurrenceMarker

var AddPresetOccurrenceFromLastOccurrencePattern = (function (_TogglePresetOccurrence2) {
  _inherits(AddPresetOccurrenceFromLastOccurrencePattern, _TogglePresetOccurrence2);

  function AddPresetOccurrenceFromLastOccurrencePattern() {
    _classCallCheck(this, AddPresetOccurrenceFromLastOccurrencePattern);

    _get(Object.getPrototypeOf(AddPresetOccurrenceFromLastOccurrencePattern.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(AddPresetOccurrenceFromLastOccurrencePattern, [{
    key: "execute",
    value: function execute() {
      this.occurrenceManager.resetPatterns();
      var regex = this.globalState.get("lastOccurrencePattern");
      if (regex) {
        var occurrenceType = this.globalState.get("lastOccurrenceType");
        this.occurrenceManager.addPattern(regex, { occurrenceType: occurrenceType });
        this.activateMode("normal");
      }
    }
  }]);

  return AddPresetOccurrenceFromLastOccurrencePattern;
})(TogglePresetOccurrence);

AddPresetOccurrenceFromLastOccurrencePattern.register();

// Delete
// ================================

var Delete = (function (_Operator4) {
  _inherits(Delete, _Operator4);

  function Delete() {
    _classCallCheck(this, Delete);

    _get(Object.getPrototypeOf(Delete.prototype), "constructor", this).apply(this, arguments);

    this.trackChange = true;
    this.flashCheckpoint = "did-select-occurrence";
    this.flashTypeForOccurrence = "operator-remove-occurrence";
    this.stayOptionName = "stayOnDelete";
    this.setToFirstCharacterOnLinewise = true;
  }

  _createClass(Delete, [{
    key: "execute",
    value: function execute() {
      var _this8 = this;

      this.onDidSelectTarget(function () {
        if (_this8.occurrenceSelected && _this8.occurrenceWise === "linewise") {
          _this8.flashTarget = false;
        }
      });

      if (this.target.wise === "blockwise") {
        this.restorePositions = false;
      }
      _get(Object.getPrototypeOf(Delete.prototype), "execute", this).call(this);
    }
  }, {
    key: "mutateSelection",
    value: function mutateSelection(selection) {
      this.setTextToRegisterForSelection(selection);
      selection.deleteSelectedText();
    }
  }]);

  return Delete;
})(Operator);

Delete.register();

var DeleteRight = (function (_Delete) {
  _inherits(DeleteRight, _Delete);

  function DeleteRight() {
    _classCallCheck(this, DeleteRight);

    _get(Object.getPrototypeOf(DeleteRight.prototype), "constructor", this).apply(this, arguments);

    this.target = "MoveRight";
  }

  return DeleteRight;
})(Delete);

DeleteRight.register();

var DeleteLeft = (function (_Delete2) {
  _inherits(DeleteLeft, _Delete2);

  function DeleteLeft() {
    _classCallCheck(this, DeleteLeft);

    _get(Object.getPrototypeOf(DeleteLeft.prototype), "constructor", this).apply(this, arguments);

    this.target = "MoveLeft";
  }

  return DeleteLeft;
})(Delete);

DeleteLeft.register();

var DeleteToLastCharacterOfLine = (function (_Delete3) {
  _inherits(DeleteToLastCharacterOfLine, _Delete3);

  function DeleteToLastCharacterOfLine() {
    _classCallCheck(this, DeleteToLastCharacterOfLine);

    _get(Object.getPrototypeOf(DeleteToLastCharacterOfLine.prototype), "constructor", this).apply(this, arguments);

    this.target = "MoveToLastCharacterOfLine";
  }

  _createClass(DeleteToLastCharacterOfLine, [{
    key: "execute",
    value: function execute() {
      var _this9 = this;

      this.onDidSelectTarget(function () {
        if (_this9.target.wise === "blockwise") {
          for (var blockwiseSelection of _this9.getBlockwiseSelections()) {
            blockwiseSelection.extendMemberSelectionsToEndOfLine();
          }
        }
      });
      _get(Object.getPrototypeOf(DeleteToLastCharacterOfLine.prototype), "execute", this).call(this);
    }
  }]);

  return DeleteToLastCharacterOfLine;
})(Delete);

DeleteToLastCharacterOfLine.register();

var DeleteLine = (function (_Delete4) {
  _inherits(DeleteLine, _Delete4);

  function DeleteLine() {
    _classCallCheck(this, DeleteLine);

    _get(Object.getPrototypeOf(DeleteLine.prototype), "constructor", this).apply(this, arguments);

    this.wise = "linewise";
    this.target = "MoveToRelativeLine";
    this.flashTarget = false;
  }

  return DeleteLine;
})(Delete);

DeleteLine.register();

// Yank
// =========================

var Yank = (function (_Operator5) {
  _inherits(Yank, _Operator5);

  function Yank() {
    _classCallCheck(this, Yank);

    _get(Object.getPrototypeOf(Yank.prototype), "constructor", this).apply(this, arguments);

    this.trackChange = true;
    this.stayOptionName = "stayOnYank";
  }

  _createClass(Yank, [{
    key: "mutateSelection",
    value: function mutateSelection(selection) {
      this.setTextToRegisterForSelection(selection);
    }
  }]);

  return Yank;
})(Operator);

Yank.register();

var YankLine = (function (_Yank) {
  _inherits(YankLine, _Yank);

  function YankLine() {
    _classCallCheck(this, YankLine);

    _get(Object.getPrototypeOf(YankLine.prototype), "constructor", this).apply(this, arguments);

    this.wise = "linewise";
    this.target = "MoveToRelativeLine";
  }

  return YankLine;
})(Yank);

YankLine.register();

var YankToLastCharacterOfLine = (function (_Yank2) {
  _inherits(YankToLastCharacterOfLine, _Yank2);

  function YankToLastCharacterOfLine() {
    _classCallCheck(this, YankToLastCharacterOfLine);

    _get(Object.getPrototypeOf(YankToLastCharacterOfLine.prototype), "constructor", this).apply(this, arguments);

    this.target = "MoveToLastCharacterOfLine";
  }

  return YankToLastCharacterOfLine;
})(Yank);

YankToLastCharacterOfLine.register();

// -------------------------
// [ctrl-a]

var Increase = (function (_Operator6) {
  _inherits(Increase, _Operator6);

  function Increase() {
    _classCallCheck(this, Increase);

    _get(Object.getPrototypeOf(Increase.prototype), "constructor", this).apply(this, arguments);

    this.target = "Empty";
    this.flashTarget = false;
    this.restorePositions = false;
    this.step = 1;
  }

  _createClass(Increase, [{
    key: "execute",
    value: function execute() {
      this.newRanges = [];
      if (!this.regex) this.regex = new RegExp("" + this.getConfig("numberRegex"), "g");

      _get(Object.getPrototypeOf(Increase.prototype), "execute", this).call(this);

      if (this.newRanges.length) {
        if (this.getConfig("flashOnOperate") && !this.getConfig("flashOnOperateBlacklist").includes(this.name)) {
          this.vimState.flash(this.newRanges, { type: this.flashTypeForOccurrence });
        }
      }
    }
  }, {
    key: "replaceNumberInBufferRange",
    value: function replaceNumberInBufferRange(scanRange, fn) {
      var _this10 = this;

      var newRanges = [];
      this.scanForward(this.regex, { scanRange: scanRange }, function (event) {
        if (fn) {
          if (fn(event)) event.stop();else return;
        }
        var nextNumber = _this10.getNextNumber(event.matchText);
        newRanges.push(event.replace(String(nextNumber)));
      });
      return newRanges;
    }
  }, {
    key: "mutateSelection",
    value: function mutateSelection(selection) {
      var _this11 = this;

      var cursor = selection.cursor;

      if (this.target.is("Empty")) {
        (function () {
          // ctrl-a, ctrl-x in `normal-mode`
          var cursorPosition = cursor.getBufferPosition();
          var scanRange = _this11.editor.bufferRangeForBufferRow(cursorPosition.row);
          var newRanges = _this11.replaceNumberInBufferRange(scanRange, function (event) {
            return event.range.end.isGreaterThan(cursorPosition);
          });
          var point = newRanges.length && newRanges[0].end.translate([0, -1]) || cursorPosition;
          cursor.setBufferPosition(point);
        })();
      } else {
        var _newRanges;

        var scanRange = selection.getBufferRange();
        (_newRanges = this.newRanges).push.apply(_newRanges, _toConsumableArray(this.replaceNumberInBufferRange(scanRange)));
        cursor.setBufferPosition(scanRange.start);
      }
    }
  }, {
    key: "getNextNumber",
    value: function getNextNumber(numberString) {
      return Number.parseInt(numberString, 10) + this.step * this.getCount();
    }
  }]);

  return Increase;
})(Operator);

Increase.register();

// [ctrl-x]

var Decrease = (function (_Increase) {
  _inherits(Decrease, _Increase);

  function Decrease() {
    _classCallCheck(this, Decrease);

    _get(Object.getPrototypeOf(Decrease.prototype), "constructor", this).apply(this, arguments);

    this.step = -1;
  }

  return Decrease;
})(Increase);

Decrease.register();

// -------------------------
// [g ctrl-a]

var IncrementNumber = (function (_Increase2) {
  _inherits(IncrementNumber, _Increase2);

  function IncrementNumber() {
    _classCallCheck(this, IncrementNumber);

    _get(Object.getPrototypeOf(IncrementNumber.prototype), "constructor", this).apply(this, arguments);

    this.baseNumber = null;
    this.target = null;
    this.mutateSelectionOrderd = true;
  }

  _createClass(IncrementNumber, [{
    key: "getNextNumber",
    value: function getNextNumber(numberString) {
      if (this.baseNumber != null) {
        this.baseNumber += this.step * this.getCount();
      } else {
        this.baseNumber = Number.parseInt(numberString, 10);
      }
      return this.baseNumber;
    }
  }]);

  return IncrementNumber;
})(Increase);

IncrementNumber.register();

// [g ctrl-x]

var DecrementNumber = (function (_IncrementNumber) {
  _inherits(DecrementNumber, _IncrementNumber);

  function DecrementNumber() {
    _classCallCheck(this, DecrementNumber);

    _get(Object.getPrototypeOf(DecrementNumber.prototype), "constructor", this).apply(this, arguments);

    this.step = -1;
  }

  return DecrementNumber;
})(IncrementNumber);

DecrementNumber.register();

// Put
// -------------------------
// Cursor placement:
// - place at end of mutation: paste non-multiline characterwise text
// - place at start of mutation: non-multiline characterwise text(characterwise, linewise)

var PutBefore = (function (_Operator7) {
  _inherits(PutBefore, _Operator7);

  function PutBefore() {
    _classCallCheck(this, PutBefore);

    _get(Object.getPrototypeOf(PutBefore.prototype), "constructor", this).apply(this, arguments);

    this.location = "before";
    this.target = "Empty";
    this.flashType = "operator-long";
    this.restorePositions = false;
    this.flashTarget = false;
    this.trackChange = false;
  }

  _createClass(PutBefore, [{
    key: "initialize",
    // manage manually

    value: function initialize() {
      this.vimState.sequentialPasteManager.onInitialize(this);
      _get(Object.getPrototypeOf(PutBefore.prototype), "initialize", this).call(this);
    }
  }, {
    key: "execute",
    value: function execute() {
      var _this12 = this;

      this.mutationsBySelection = new Map();
      this.sequentialPaste = this.vimState.sequentialPasteManager.onExecute(this);

      this.onDidFinishMutation(function () {
        if (!_this12.cancelled) _this12.adjustCursorPosition();
      });

      _get(Object.getPrototypeOf(PutBefore.prototype), "execute", this).call(this);

      if (this.cancelled) return;

      this.onDidFinishOperation(function () {
        // TrackChange
        var newRange = _this12.mutationsBySelection.get(_this12.editor.getLastSelection());
        if (newRange) _this12.setMarkForChange(newRange);

        // Flash
        if (_this12.getConfig("flashOnOperate") && !_this12.getConfig("flashOnOperateBlacklist").includes(_this12.name)) {
          var ranges = _this12.editor.getSelections().map(function (selection) {
            return _this12.mutationsBySelection.get(selection);
          });
          _this12.vimState.flash(ranges, { type: _this12.getFlashType() });
        }
      });
    }
  }, {
    key: "adjustCursorPosition",
    value: function adjustCursorPosition() {
      for (var selection of this.editor.getSelections()) {
        if (!this.mutationsBySelection.has(selection)) continue;

        var cursor = selection.cursor;

        var newRange = this.mutationsBySelection.get(selection);
        if (this.linewisePaste) {
          this.utils.moveCursorToFirstCharacterAtRow(cursor, newRange.start.row);
        } else {
          if (newRange.isSingleLine()) {
            cursor.setBufferPosition(newRange.end.translate([0, -1]));
          } else {
            cursor.setBufferPosition(newRange.start);
          }
        }
      }
    }
  }, {
    key: "mutateSelection",
    value: function mutateSelection(selection) {
      var value = this.vimState.register.get(null, selection, this.sequentialPaste);
      if (!value.text) {
        this.cancelled = true;
        return;
      }

      var textToPaste = _.multiplyString(value.text, this.getCount());
      this.linewisePaste = value.type === "linewise" || this.isMode("visual", "linewise");
      var newRange = this.paste(selection, textToPaste, { linewisePaste: this.linewisePaste });
      this.mutationsBySelection.set(selection, newRange);
      this.vimState.sequentialPasteManager.savePastedRangeForSelection(selection, newRange);
    }

    // Return pasted range
  }, {
    key: "paste",
    value: function paste(selection, text, _ref2) {
      var linewisePaste = _ref2.linewisePaste;

      if (this.sequentialPaste) {
        return this.pasteCharacterwise(selection, text);
      } else if (linewisePaste) {
        return this.pasteLinewise(selection, text);
      } else {
        return this.pasteCharacterwise(selection, text);
      }
    }
  }, {
    key: "pasteCharacterwise",
    value: function pasteCharacterwise(selection, text) {
      var cursor = selection.cursor;

      if (selection.isEmpty() && this.location === "after" && !this.utils.isEmptyRow(this.editor, cursor.getBufferRow())) {
        cursor.moveRight();
      }
      return selection.insertText(text);
    }

    // Return newRange
  }, {
    key: "pasteLinewise",
    value: function pasteLinewise(selection, text) {
      var cursor = selection.cursor;

      var cursorRow = cursor.getBufferRow();
      if (!text.endsWith("\n")) {
        text += "\n";
      }
      if (selection.isEmpty()) {
        if (this.location === "before") {
          return this.utils.insertTextAtBufferPosition(this.editor, [cursorRow, 0], text);
        } else if (this.location === "after") {
          var targetRow = this.getFoldEndRowForRow(cursorRow);
          this.utils.ensureEndsWithNewLineForBufferRow(this.editor, targetRow);
          return this.utils.insertTextAtBufferPosition(this.editor, [targetRow + 1, 0], text);
        }
      } else {
        if (!this.isMode("visual", "linewise")) {
          selection.insertText("\n");
        }
        return selection.insertText(text);
      }
    }
  }]);

  return PutBefore;
})(Operator);

PutBefore.register();

var PutAfter = (function (_PutBefore) {
  _inherits(PutAfter, _PutBefore);

  function PutAfter() {
    _classCallCheck(this, PutAfter);

    _get(Object.getPrototypeOf(PutAfter.prototype), "constructor", this).apply(this, arguments);

    this.location = "after";
  }

  return PutAfter;
})(PutBefore);

PutAfter.register();

var PutBeforeWithAutoIndent = (function (_PutBefore2) {
  _inherits(PutBeforeWithAutoIndent, _PutBefore2);

  function PutBeforeWithAutoIndent() {
    _classCallCheck(this, PutBeforeWithAutoIndent);

    _get(Object.getPrototypeOf(PutBeforeWithAutoIndent.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(PutBeforeWithAutoIndent, [{
    key: "pasteLinewise",
    value: function pasteLinewise(selection, text) {
      var newRange = _get(Object.getPrototypeOf(PutBeforeWithAutoIndent.prototype), "pasteLinewise", this).call(this, selection, text);
      this.utils.adjustIndentWithKeepingLayout(this.editor, newRange);
      return newRange;
    }
  }]);

  return PutBeforeWithAutoIndent;
})(PutBefore);

PutBeforeWithAutoIndent.register();

var PutAfterWithAutoIndent = (function (_PutBeforeWithAutoIndent) {
  _inherits(PutAfterWithAutoIndent, _PutBeforeWithAutoIndent);

  function PutAfterWithAutoIndent() {
    _classCallCheck(this, PutAfterWithAutoIndent);

    _get(Object.getPrototypeOf(PutAfterWithAutoIndent.prototype), "constructor", this).apply(this, arguments);

    this.location = "after";
  }

  return PutAfterWithAutoIndent;
})(PutBeforeWithAutoIndent);

PutAfterWithAutoIndent.register();

var AddBlankLineBelow = (function (_Operator8) {
  _inherits(AddBlankLineBelow, _Operator8);

  function AddBlankLineBelow() {
    _classCallCheck(this, AddBlankLineBelow);

    _get(Object.getPrototypeOf(AddBlankLineBelow.prototype), "constructor", this).apply(this, arguments);

    this.flashTarget = false;
    this.target = "Empty";
    this.stayAtSamePosition = true;
    this.stayByMarker = true;
    this.where = "below";
  }

  _createClass(AddBlankLineBelow, [{
    key: "mutateSelection",
    value: function mutateSelection(selection) {
      var point = selection.getHeadBufferPosition();
      if (this.where === "below") point.row++;
      point.column = 0;
      this.editor.setTextInBufferRange([point, point], "\n".repeat(this.getCount()));
    }
  }]);

  return AddBlankLineBelow;
})(Operator);

AddBlankLineBelow.register();

var AddBlankLineAbove = (function (_AddBlankLineBelow) {
  _inherits(AddBlankLineAbove, _AddBlankLineBelow);

  function AddBlankLineAbove() {
    _classCallCheck(this, AddBlankLineAbove);

    _get(Object.getPrototypeOf(AddBlankLineAbove.prototype), "constructor", this).apply(this, arguments);

    this.where = "above";
  }

  return AddBlankLineAbove;
})(AddBlankLineBelow);

AddBlankLineAbove.register();

// Experimentaly allow selectTarget before input Complete
// -------------------------
// ctrl-a in normal-mode find target number in current line manually
// do manually
// do manually
// manage manually
// manage manually
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL29wZXJhdG9yLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFdBQVcsQ0FBQTs7Ozs7Ozs7Ozs7O0FBRVgsSUFBTSxDQUFDLEdBQUcsT0FBTyxDQUFDLGlCQUFpQixDQUFDLENBQUE7QUFDcEMsSUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFBOztJQUV4QixRQUFRO1lBQVIsUUFBUTs7V0FBUixRQUFROzBCQUFSLFFBQVE7OytCQUFSLFFBQVE7O1NBRVosYUFBYSxHQUFHLElBQUk7U0FDcEIsVUFBVSxHQUFHLElBQUk7U0FFakIsSUFBSSxHQUFHLElBQUk7U0FDWCxVQUFVLEdBQUcsS0FBSztTQUNsQixjQUFjLEdBQUcsTUFBTTtTQUV2QixXQUFXLEdBQUcsSUFBSTtTQUNsQixlQUFlLEdBQUcsWUFBWTtTQUM5QixTQUFTLEdBQUcsVUFBVTtTQUN0QixzQkFBc0IsR0FBRyxxQkFBcUI7U0FDOUMsV0FBVyxHQUFHLEtBQUs7U0FFbkIsb0JBQW9CLEdBQUcsSUFBSTtTQUMzQixrQkFBa0IsR0FBRyxJQUFJO1NBQ3pCLGNBQWMsR0FBRyxJQUFJO1NBQ3JCLFlBQVksR0FBRyxLQUFLO1NBQ3BCLGdCQUFnQixHQUFHLElBQUk7U0FDdkIsNkJBQTZCLEdBQUcsS0FBSztTQUVyQyxzQkFBc0IsR0FBRyxJQUFJO1NBQzdCLHlCQUF5QixHQUFHLElBQUk7U0FFaEMseUJBQXlCLEdBQUcsSUFBSTtTQUNoQyxxQkFBcUIsR0FBRyxLQUFLO1NBSTdCLGtCQUFrQixHQUFHLEtBQUs7U0FDMUIsY0FBYyxHQUFHLElBQUk7OztlQS9CakIsUUFBUTs7V0FpQ0UsMEJBQUc7QUFDZixhQUFPLElBQUksQ0FBQyxrQkFBa0IsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUE7S0FDakQ7Ozs7Ozs7O1dBS1Msc0JBQUc7QUFDWCxVQUFJLENBQUMs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QkFBdEIsc0JBQXNCOzsrQkFBdEIsc0JBQXNCOztTQUMxQixRQUFRLEdBQUcsT0FBTzs7O1NBRGQsc0JBQXNCO0dBQVMsdUJBQXVCOztBQUc1RCxzQkFBc0IsQ0FBQyxRQUFRLEVBQUUsQ0FBQTs7SUFFM0IsaUJBQWlCO1lBQWpCLGlCQUFpQjs7V0FBakIsaUJBQWlCOzBCQUFqQixpQkFBaUI7OytCQUFqQixpQkFBaUI7O1NBQ3JCLFdBQVcsR0FBRyxLQUFLO1NBQ25CLE1BQU0sR0FBRyxPQUFPO1NBQ2hCLGtCQUFrQixHQUFHLElBQUk7U0FDekIsWUFBWSxHQUFHLElBQUk7U0FDbkIsS0FBSyxHQUFHLE9BQU87OztlQUxYLGlCQUFpQjs7V0FPTix5QkFBQyxTQUFTLEVBQUU7QUFDekIsVUFBTSxLQUFLLEdBQUcsU0FBUyxDQUFDLHFCQUFxQixFQUFFLENBQUE7QUFDL0MsVUFBSSxJQUFJLENBQUMsS0FBSyxLQUFLLE9BQU8sRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUE7QUFDdkMsV0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUE7QUFDaEIsVUFBSSxDQUFDLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUE7S0FDL0U7OztTQVpHLGlCQUFpQjtHQUFTLFFBQVE7O0FBY3hDLGlCQUFpQixDQUFDLFFBQVEsRUFBRSxDQUFBOztJQUV0QixpQkFBaUI7WUFBakIsaUJBQWlCOztXQUFqQixpQkFBaUI7MEJBQWpCLGlCQUFpQjs7K0JBQWpCLGlCQUFpQjs7U0FDckIsS0FBSyxHQUFHLE9BQU87OztTQURYLGlCQUFpQjtHQUFTLGlCQUFpQjs7QUFHakQsaUJBQWlCLENBQUMsUUFBUSxFQUFFLENBQUEiLCJmaWxlIjoiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvb3BlcmF0b3IuanMiLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBiYWJlbFwiXG5cbmNvbnN0IF8gPSByZXF1aXJlKFwidW5kZXJzY29yZS1wbHVzXCIpXG5jb25zdCBCYXNlID0gcmVxdWlyZShcIi4vYmFzZVwiKVxuXG5jbGFzcyBPcGVyYXRvciBleHRlbmRzIEJhc2Uge1xuICBzdGF0aWMgb3BlcmF0aW9uS2luZCA9IFwib3BlcmF0b3JcIlxuICByZXF1aXJlVGFyZ2V0ID0gdHJ1ZVxuICByZWNvcmRhYmxlID0gdHJ1ZVxuXG4gIHdpc2UgPSBudWxsXG4gIG9jY3VycmVuY2UgPSBmYWxzZVxuICBvY2N1cnJlbmNlVHlwZSA9IFwiYmFzZVwiXG5cbiAgZmxhc2hUYXJnZXQgPSB0cnVlXG4gIGZsYXNoQ2hlY2twb2ludCA9IFwiZGlkLWZpbmlzaFwiXG4gIGZsYXNoVHlwZSA9IFwib3BlcmF0b3JcIlxuICBmbGFzaFR5cGVGb3JPY2N1cnJlbmNlID0gXCJvcGVyYXRvci1vY2N1cnJlbmNlXCJcbiAgdHJhY2tDaGFuZ2UgPSBmYWxzZVxuXG4gIHBhdHRlcm5Gb3JPY2N1cnJlbmNlID0gbnVsbFxuICBzdGF5QXRTYW1lUG9zaXRpb24gPSBudWxsXG4gIHN0YXlPcHRpb25OYW1lID0gbnVsbFxuICBzdGF5QnlNYXJrZXIgPSBmYWxzZVxuICByZXN0b3JlUG9zaXRpb25zID0gdHJ1ZVxuICBzZXRUb0ZpcnN0Q2hhcmFjdGVyT25MaW5ld2lzZSA9IGZhbHNlXG5cbiAgYWNjZXB0UHJlc2V0T2NjdXJyZW5jZSA9IHRydWVcbiAgYWNjZXB0UGVyc2lzdGVudFNlbGVjdGlvbiA9IHRydWVcblxuICBidWZmZXJDaGVja3BvaW50QnlQdXJwb3NlID0gbnVsbFxuICBtdXRhdGVTZWxlY3Rpb25PcmRlcmQgPSBmYWxzZVxuXG4gIC8vIEV4cGVyaW1lbnRhbHkgYWxsb3cgc2VsZWN0VGFyZ2V0IGJlZm9yZSBpbnB1dCBDb21wbGV0ZVxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIHN1cHBvcnRFYXJseVNlbGVjdCA9IGZhbHNlXG4gIHRhcmdldFNlbGVjdGVkID0gbnVsbFxuXG4gIGNhbkVhcmx5U2VsZWN0KCkge1xuICAgIHJldHVybiB0aGlzLnN1cHBvcnRFYXJseVNlbGVjdCAmJiAhdGhpcy5yZXBlYXRlZFxuICB9XG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAvLyBDYWxsZWQgd2hlbiBvcGVyYXRpb24gZmluaXNoZWRcbiAgLy8gVGhpcyBpcyBlc3NlbnRpYWxseSB0byByZXNldCBzdGF0ZSBmb3IgYC5gIHJlcGVhdC5cbiAgcmVzZXRTdGF0ZSgpIHtcbiAgICB0aGlzLnRhcmdldFNlbGVjdGVkID0gbnVsbFxuICAgIHRoaXMub2NjdXJyZW5jZVNlbGVjdGVkID0gZmFsc2VcbiAgfVxuXG4gIC8vIFR3byBjaGVja3BvaW50IGZvciBkaWZmZXJlbnQgcHVycG9zZVxuICAvLyAtIG9uZSBmb3IgdW5kbyhoYW5kbGVkIGJ5IG1vZGVNYW5hZ2VyKVxuICAvLyAtIG9uZSBmb3IgcHJlc2VydmUgbGFzdCBpbnNlcnRlZCB0ZXh0XG4gIGNyZWF0ZUJ1ZmZlckNoZWNrcG9pbnQocHVycG9zZSkge1xuICAgIGlmICghdGhpcy5idWZmZXJDaGVja3BvaW50QnlQdXJwb3NlKSB0aGlzLmJ1ZmZlckNoZWNrcG9pbnRCeVB1cnBvc2UgPSB7fVxuICAgIHRoaXMuYnVmZmVyQ2hlY2twb2ludEJ5UHVycG9zZVtwdXJwb3NlXSA9IHRoaXMuZWRpdG9yLmNyZWF0ZUNoZWNrcG9pbnQoKVxuICB9XG5cbiAgZ2V0QnVmZmVyQ2hlY2twb2ludChwdXJwb3NlKSB7XG4gICAgaWYgKHRoaXMuYnVmZmVyQ2hlY2twb2ludEJ5UHVycG9zZSkge1xuICAgICAgcmV0dXJuIHRoaXMuYnVmZmVyQ2hlY2twb2ludEJ5UHVycG9zZVtwdXJwb3NlXVxuICAgIH1cbiAgfVxuXG4gIGRlbGV0ZUJ1ZmZlckNoZWNrcG9pbnQocHVycG9zZSkge1xuICAgIGlmICh0aGlzLmJ1ZmZlckNoZWNrcG9pbnRCeVB1cnBvc2UpIHtcbiAgICAgIGRlbGV0ZSB0aGlzLmJ1ZmZlckNoZWNrcG9pbnRCeVB1cnBvc2VbcHVycG9zZV1cbiAgICB9XG4gIH1cblxuICBncm91cENoYW5nZXNTaW5jZUJ1ZmZlckNoZWNrcG9pbnQocHVycG9zZSkge1xuICAgIGNvbnN0IGNoZWNrcG9pbnQgPSB0aGlzLmdldEJ1ZmZlckNoZWNrcG9pbnQocHVycG9zZSlcbiAgICBpZiAoY2hlY2twb2ludCkge1xuICAgICAgdGhpcy5lZGl0b3IuZ3JvdXBDaGFuZ2VzU2luY2VDaGVja3BvaW50KGNoZWNrcG9pbnQpXG4gICAgICB0aGlzLmRlbGV0ZUJ1ZmZlckNoZWNrcG9pbnQocHVycG9zZSlcbiAgICB9XG4gIH1cblxuICBzZXRNYXJrRm9yQ2hhbmdlKHJhbmdlKSB7XG4gICAgdGhpcy52aW1TdGF0ZS5tYXJrLnNldChcIltcIiwgcmFuZ2Uuc3RhcnQpXG4gICAgdGhpcy52aW1TdGF0ZS5tYXJrLnNldChcIl1cIiwgcmFuZ2UuZW5kKVxuICB9XG5cbiAgbmVlZEZsYXNoKCkge1xuICAgIHJldHVybiAoXG4gICAgICB0aGlzLmZsYXNoVGFyZ2V0ICYmXG4gICAgICB0aGlzLmdldENvbmZpZyhcImZsYXNoT25PcGVyYXRlXCIpICYmXG4gICAgICAhdGhpcy5nZXRDb25maWcoXCJmbGFzaE9uT3BlcmF0ZUJsYWNrbGlzdFwiKS5pbmNsdWRlcyh0aGlzLm5hbWUpICYmXG4gICAgICAodGhpcy5tb2RlICE9PSBcInZpc3VhbFwiIHx8IHRoaXMuc3VibW9kZSAhPT0gdGhpcy50YXJnZXQud2lzZSkgLy8gZS5nLiBZIGluIHZDXG4gICAgKVxuICB9XG5cbiAgZmxhc2hJZk5lY2Vzc2FyeShyYW5nZXMpIHtcbiAgICBpZiAodGhpcy5uZWVkRmxhc2goKSkge1xuICAgICAgdGhpcy52aW1TdGF0ZS5mbGFzaChyYW5nZXMsIHt0eXBlOiB0aGlzLmdldEZsYXNoVHlwZSgpfSlcbiAgICB9XG4gIH1cblxuICBmbGFzaENoYW5nZUlmTmVjZXNzYXJ5KCkge1xuICAgIGlmICh0aGlzLm5lZWRGbGFzaCgpKSB7XG4gICAgICB0aGlzLm9uRGlkRmluaXNoT3BlcmF0aW9uKCgpID0+IHtcbiAgICAgICAgY29uc3QgcmFuZ2VzID0gdGhpcy5tdXRhdGlvbk1hbmFnZXIuZ2V0U2VsZWN0ZWRCdWZmZXJSYW5nZXNGb3JDaGVja3BvaW50KHRoaXMuZmxhc2hDaGVja3BvaW50KVxuICAgICAgICB0aGlzLnZpbVN0YXRlLmZsYXNoKHJhbmdlcywge3R5cGU6IHRoaXMuZ2V0Rmxhc2hUeXBlKCl9KVxuICAgICAgfSlcbiAgICB9XG4gIH1cblxuICBnZXRGbGFzaFR5cGUoKSB7XG4gICAgcmV0dXJuIHRoaXMub2NjdXJyZW5jZVNlbGVjdGVkID8gdGhpcy5mbGFzaFR5cGVGb3JPY2N1cnJlbmNlIDogdGhpcy5mbGFzaFR5cGVcbiAgfVxuXG4gIHRyYWNrQ2hhbmdlSWZOZWNlc3NhcnkoKSB7XG4gICAgaWYgKCF0aGlzLnRyYWNrQ2hhbmdlKSByZXR1cm5cbiAgICB0aGlzLm9uRGlkRmluaXNoT3BlcmF0aW9uKCgpID0+IHtcbiAgICAgIGNvbnN0IHJhbmdlID0gdGhpcy5tdXRhdGlvbk1hbmFnZXIuZ2V0TXV0YXRlZEJ1ZmZlclJhbmdlRm9yU2VsZWN0aW9uKHRoaXMuZWRpdG9yLmdldExhc3RTZWxlY3Rpb24oKSlcbiAgICAgIGlmIChyYW5nZSkgdGhpcy5zZXRNYXJrRm9yQ2hhbmdlKHJhbmdlKVxuICAgIH0pXG4gIH1cblxuICBpbml0aWFsaXplKCkge1xuICAgIHRoaXMuc3Vic2NyaWJlUmVzZXRPY2N1cnJlbmNlUGF0dGVybklmTmVlZGVkKClcblxuICAgIC8vIFdoZW4gcHJlc2V0LW9jY3VycmVuY2Ugd2FzIGV4aXN0cywgb3BlcmF0ZSBvbiBvY2N1cnJlbmNlLXdpc2VcbiAgICBpZiAodGhpcy5hY2NlcHRQcmVzZXRPY2N1cnJlbmNlICYmIHRoaXMub2NjdXJyZW5jZU1hbmFnZXIuaGFzTWFya2VycygpKSB7XG4gICAgICB0aGlzLm9jY3VycmVuY2UgPSB0cnVlXG4gICAgfVxuXG4gICAgLy8gW0ZJWE1FXSBPUkRFUi1NQVRURVJcbiAgICAvLyBUbyBwaWNrIGN1cnNvci13b3JkIHRvIGZpbmQgb2NjdXJyZW5jZSBiYXNlIHBhdHRlcm4uXG4gICAgLy8gVGhpcyBoYXMgdG8gYmUgZG9uZSBCRUZPUkUgY29udmVydGluZyBwZXJzaXN0ZW50LXNlbGVjdGlvbiBpbnRvIHJlYWwtc2VsZWN0aW9uLlxuICAgIC8vIFNpbmNlIHdoZW4gcGVyc2lzdGVudC1zZWxlY3Rpb24gaXMgYWN0dWFsbHkgc2VsZWN0ZWQsIGl0IGNoYW5nZSBjdXJzb3IgcG9zaXRpb24uXG4gICAgaWYgKHRoaXMub2NjdXJyZW5jZSAmJiAhdGhpcy5vY2N1cnJlbmNlTWFuYWdlci5oYXNNYXJrZXJzKCkpIHtcbiAgICAgIGNvbnN0IHJlZ2V4ID0gdGhpcy5wYXR0ZXJuRm9yT2NjdXJyZW5jZSB8fCB0aGlzLmdldFBhdHRlcm5Gb3JPY2N1cnJlbmNlVHlwZSh0aGlzLm9jY3VycmVuY2VUeXBlKVxuICAgICAgdGhpcy5vY2N1cnJlbmNlTWFuYWdlci5hZGRQYXR0ZXJuKHJlZ2V4KVxuICAgIH1cblxuICAgIC8vIFRoaXMgY2hhbmdlIGN1cnNvciBwb3NpdGlvbi5cbiAgICBpZiAodGhpcy5zZWxlY3RQZXJzaXN0ZW50U2VsZWN0aW9uSWZOZWNlc3NhcnkoKSkge1xuICAgICAgLy8gW0ZJWE1FXSBzZWxlY3Rpb24td2lzZSBpcyBub3Qgc3luY2hlZCBpZiBpdCBhbHJlYWR5IHZpc3VhbC1tb2RlXG4gICAgICBpZiAodGhpcy5tb2RlICE9PSBcInZpc3VhbFwiKSB7XG4gICAgICAgIHRoaXMudmltU3RhdGUubW9kZU1hbmFnZXIuYWN0aXZhdGUoXCJ2aXN1YWxcIiwgdGhpcy5zd3JhcC5kZXRlY3RXaXNlKHRoaXMuZWRpdG9yKSlcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodGhpcy5tb2RlID09PSBcInZpc3VhbFwiICYmIHRoaXMucmVxdWlyZVRhcmdldCkge1xuICAgICAgdGhpcy50YXJnZXQgPSBcIkN1cnJlbnRTZWxlY3Rpb25cIlxuICAgIH1cbiAgICBpZiAoXy5pc1N0cmluZyh0aGlzLnRhcmdldCkpIHtcbiAgICAgIHRoaXMuc2V0VGFyZ2V0KHRoaXMuZ2V0SW5zdGFuY2UodGhpcy50YXJnZXQpKVxuICAgIH1cblxuICAgIHN1cGVyLmluaXRpYWxpemUoKVxuICB9XG5cbiAgc3Vic2NyaWJlUmVzZXRPY2N1cnJlbmNlUGF0dGVybklmTmVlZGVkKCkge1xuICAgIC8vIFtDQVVUSU9OXVxuICAgIC8vIFRoaXMgbWV0aG9kIGhhcyB0byBiZSBjYWxsZWQgaW4gUFJPUEVSIHRpbWluZy5cbiAgICAvLyBJZiBvY2N1cnJlbmNlIGlzIHRydWUgYnV0IG5vIHByZXNldC1vY2N1cnJlbmNlXG4gICAgLy8gVHJlYXQgdGhhdCBgb2NjdXJyZW5jZWAgaXMgQk9VTkRFRCB0byBvcGVyYXRvciBpdHNlbGYsIHNvIGNsZWFucCBhdCBmaW5pc2hlZC5cbiAgICBpZiAodGhpcy5vY2N1cnJlbmNlICYmICF0aGlzLm9jY3VycmVuY2VNYW5hZ2VyLmhhc01hcmtlcnMoKSkge1xuICAgICAgdGhpcy5vbkRpZFJlc2V0T3BlcmF0aW9uU3RhY2soKCkgPT4gdGhpcy5vY2N1cnJlbmNlTWFuYWdlci5yZXNldFBhdHRlcm5zKCkpXG4gICAgfVxuICB9XG5cbiAgc2V0TW9kaWZpZXIoe3dpc2UsIG9jY3VycmVuY2UsIG9jY3VycmVuY2VUeXBlfSkge1xuICAgIGlmICh3aXNlKSB7XG4gICAgICB0aGlzLndpc2UgPSB3aXNlXG4gICAgfSBlbHNlIGlmIChvY2N1cnJlbmNlKSB7XG4gICAgICB0aGlzLm9jY3VycmVuY2UgPSBvY2N1cnJlbmNlXG4gICAgICB0aGlzLm9jY3VycmVuY2VUeXBlID0gb2NjdXJyZW5jZVR5cGVcbiAgICAgIC8vIFRoaXMgaXMgbyBtb2RpZmllciBjYXNlKGUuZy4gYGMgbyBwYCwgYGQgTyBmYClcbiAgICAgIC8vIFdlIFJFU0VUIGV4aXN0aW5nIG9jY3VyZW5jZS1tYXJrZXIgd2hlbiBgb2Agb3IgYE9gIG1vZGlmaWVyIGlzIHR5cGVkIGJ5IHVzZXIuXG4gICAgICBjb25zdCByZWdleCA9IHRoaXMuZ2V0UGF0dGVybkZvck9jY3VycmVuY2VUeXBlKG9jY3VycmVuY2VUeXBlKVxuICAgICAgdGhpcy5vY2N1cnJlbmNlTWFuYWdlci5hZGRQYXR0ZXJuKHJlZ2V4LCB7cmVzZXQ6IHRydWUsIG9jY3VycmVuY2VUeXBlfSlcbiAgICAgIHRoaXMub25EaWRSZXNldE9wZXJhdGlvblN0YWNrKCgpID0+IHRoaXMub2NjdXJyZW5jZU1hbmFnZXIucmVzZXRQYXR0ZXJucygpKVxuICAgIH1cbiAgfVxuXG4gIC8vIHJldHVybiB0cnVlL2ZhbHNlIHRvIGluZGljYXRlIHN1Y2Nlc3NcbiAgc2VsZWN0UGVyc2lzdGVudFNlbGVjdGlvbklmTmVjZXNzYXJ5KCkge1xuICAgIGlmIChcbiAgICAgIHRoaXMuYWNjZXB0UGVyc2lzdGVudFNlbGVjdGlvbiAmJlxuICAgICAgdGhpcy5nZXRDb25maWcoXCJhdXRvU2VsZWN0UGVyc2lzdGVudFNlbGVjdGlvbk9uT3BlcmF0ZVwiKSAmJlxuICAgICAgIXRoaXMucGVyc2lzdGVudFNlbGVjdGlvbi5pc0VtcHR5KClcbiAgICApIHtcbiAgICAgIHRoaXMucGVyc2lzdGVudFNlbGVjdGlvbi5zZWxlY3QoKVxuICAgICAgdGhpcy5lZGl0b3IubWVyZ2VJbnRlcnNlY3RpbmdTZWxlY3Rpb25zKClcbiAgICAgIHRoaXMuc3dyYXAuc2F2ZVByb3BlcnRpZXModGhpcy5lZGl0b3IpXG5cbiAgICAgIHJldHVybiB0cnVlXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cbiAgfVxuXG4gIGdldFBhdHRlcm5Gb3JPY2N1cnJlbmNlVHlwZShvY2N1cnJlbmNlVHlwZSkge1xuICAgIGlmIChvY2N1cnJlbmNlVHlwZSA9PT0gXCJiYXNlXCIpIHtcbiAgICAgIHJldHVybiB0aGlzLnV0aWxzLmdldFdvcmRQYXR0ZXJuQXRCdWZmZXJQb3NpdGlvbih0aGlzLmVkaXRvciwgdGhpcy5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpKVxuICAgIH0gZWxzZSBpZiAob2NjdXJyZW5jZVR5cGUgPT09IFwic3Vid29yZFwiKSB7XG4gICAgICByZXR1cm4gdGhpcy51dGlscy5nZXRTdWJ3b3JkUGF0dGVybkF0QnVmZmVyUG9zaXRpb24odGhpcy5lZGl0b3IsIHRoaXMuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKSlcbiAgICB9XG4gIH1cblxuICAvLyB0YXJnZXQgaXMgVGV4dE9iamVjdCBvciBNb3Rpb24gdG8gb3BlcmF0ZSBvbi5cbiAgc2V0VGFyZ2V0KHRhcmdldCkge1xuICAgIHRoaXMudGFyZ2V0ID0gdGFyZ2V0XG4gICAgdGhpcy50YXJnZXQub3BlcmF0b3IgPSB0aGlzXG4gICAgdGhpcy5lbWl0RGlkU2V0VGFyZ2V0KHRoaXMpXG5cbiAgICBpZiAodGhpcy5jYW5FYXJseVNlbGVjdCgpKSB7XG4gICAgICB0aGlzLm5vcm1hbGl6ZVNlbGVjdGlvbnNJZk5lY2Vzc2FyeSgpXG4gICAgICB0aGlzLmNyZWF0ZUJ1ZmZlckNoZWNrcG9pbnQoXCJ1bmRvXCIpXG4gICAgICB0aGlzLnNlbGVjdFRhcmdldCgpXG4gICAgfVxuICB9XG5cbiAgc2V0VGV4dFRvUmVnaXN0ZXJGb3JTZWxlY3Rpb24oc2VsZWN0aW9uKSB7XG4gICAgdGhpcy5zZXRUZXh0VG9SZWdpc3RlcihzZWxlY3Rpb24uZ2V0VGV4dCgpLCBzZWxlY3Rpb24pXG4gIH1cblxuICBzZXRUZXh0VG9SZWdpc3Rlcih0ZXh0LCBzZWxlY3Rpb24pIHtcbiAgICBpZiAodGhpcy52aW1TdGF0ZS5yZWdpc3Rlci5pc1VubmFtZWQoKSAmJiB0aGlzLmlzQmxhY2tob2xlUmVnaXN0ZXJlZE9wZXJhdG9yKCkpIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGlmICh0aGlzLnRhcmdldC5pc0xpbmV3aXNlKCkgJiYgIXRleHQuZW5kc1dpdGgoXCJcXG5cIikpIHtcbiAgICAgIHRleHQgKz0gXCJcXG5cIlxuICAgIH1cblxuICAgIGlmICh0ZXh0KSB7XG4gICAgICB0aGlzLnZpbVN0YXRlLnJlZ2lzdGVyLnNldChudWxsLCB7dGV4dCwgc2VsZWN0aW9ufSlcblxuICAgICAgaWYgKHRoaXMudmltU3RhdGUucmVnaXN0ZXIuaXNVbm5hbWVkKCkpIHtcbiAgICAgICAgaWYgKHRoaXMuaW5zdGFuY2VvZihcIkRlbGV0ZVwiKSB8fCB0aGlzLmluc3RhbmNlb2YoXCJDaGFuZ2VcIikpIHtcbiAgICAgICAgICBpZiAoIXRoaXMubmVlZFNhdmVUb051bWJlcmVkUmVnaXN0ZXIodGhpcy50YXJnZXQpICYmIHRoaXMudXRpbHMuaXNTaW5nbGVMaW5lVGV4dCh0ZXh0KSkge1xuICAgICAgICAgICAgdGhpcy52aW1TdGF0ZS5yZWdpc3Rlci5zZXQoXCItXCIsIHt0ZXh0LCBzZWxlY3Rpb259KSAvLyBzbWFsbC1jaGFuZ2VcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy52aW1TdGF0ZS5yZWdpc3Rlci5zZXQoXCIxXCIsIHt0ZXh0LCBzZWxlY3Rpb259KVxuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLmluc3RhbmNlb2YoXCJZYW5rXCIpKSB7XG4gICAgICAgICAgdGhpcy52aW1TdGF0ZS5yZWdpc3Rlci5zZXQoXCIwXCIsIHt0ZXh0LCBzZWxlY3Rpb259KVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgaXNCbGFja2hvbGVSZWdpc3RlcmVkT3BlcmF0b3IoKSB7XG4gICAgY29uc3Qgb3BlcmF0b3JzID0gdGhpcy5nZXRDb25maWcoXCJibGFja2hvbGVSZWdpc3RlcmVkT3BlcmF0b3JzXCIpXG4gICAgY29uc3Qgd2lsZENhcmRPcGVyYXRvcnMgPSBvcGVyYXRvcnMuZmlsdGVyKG5hbWUgPT4gbmFtZS5lbmRzV2l0aChcIipcIikpXG4gICAgY29uc3QgY29tbWFuZE5hbWUgPSB0aGlzLmdldENvbW1hbmROYW1lV2l0aG91dFByZWZpeCgpXG4gICAgcmV0dXJuIChcbiAgICAgIHdpbGRDYXJkT3BlcmF0b3JzLnNvbWUobmFtZSA9PiBuZXcgUmVnRXhwKFwiXlwiICsgbmFtZS5yZXBsYWNlKFwiKlwiLCBcIi4qXCIpKS50ZXN0KGNvbW1hbmROYW1lKSkgfHxcbiAgICAgIG9wZXJhdG9ycy5pbmNsdWRlcyhjb21tYW5kTmFtZSlcbiAgICApXG4gIH1cblxuICBuZWVkU2F2ZVRvTnVtYmVyZWRSZWdpc3Rlcih0YXJnZXQpIHtcbiAgICAvLyBVc2VkIHRvIGRldGVybWluZSB3aGF0IHJlZ2lzdGVyIHRvIHVzZSBvbiBjaGFuZ2UgYW5kIGRlbGV0ZSBvcGVyYXRpb24uXG4gICAgLy8gRm9sbG93aW5nIG1vdGlvbiBzaG91bGQgc2F2ZSB0byAxLTkgcmVnaXN0ZXIgcmVnZXJkbGVzcyBvZiBjb250ZW50IGlzIHNtYWxsIG9yIGJpZy5cbiAgICBjb25zdCBnb2VzVG9OdW1iZXJlZFJlZ2lzdGVyTW90aW9uTmFtZXMgPSBbXG4gICAgICBcIk1vdmVUb1BhaXJcIiwgLy8gJVxuICAgICAgXCJNb3ZlVG9OZXh0U2VudGVuY2VcIiwgLy8gKCwgKVxuICAgICAgXCJTZWFyY2hcIiwgLy8gLywgPywgbiwgTlxuICAgICAgXCJNb3ZlVG9OZXh0UGFyYWdyYXBoXCIsIC8vIHssIH1cbiAgICBdXG4gICAgcmV0dXJuIGdvZXNUb051bWJlcmVkUmVnaXN0ZXJNb3Rpb25OYW1lcy5zb21lKG5hbWUgPT4gdGFyZ2V0Lmluc3RhbmNlb2YobmFtZSkpXG4gIH1cblxuICBub3JtYWxpemVTZWxlY3Rpb25zSWZOZWNlc3NhcnkoKSB7XG4gICAgaWYgKHRoaXMubW9kZSA9PT0gXCJ2aXN1YWxcIiAmJiB0aGlzLnRhcmdldCAmJiB0aGlzLnRhcmdldC5pc01vdGlvbigpKSB7XG4gICAgICB0aGlzLnN3cmFwLm5vcm1hbGl6ZSh0aGlzLmVkaXRvcilcbiAgICB9XG4gIH1cblxuICBzdGFydE11dGF0aW9uKGZuKSB7XG4gICAgaWYgKHRoaXMuY2FuRWFybHlTZWxlY3QoKSkge1xuICAgICAgLy8gLSBTa2lwIHNlbGVjdGlvbiBub3JtYWxpemF0aW9uOiBhbHJlYWR5IG5vcm1hbGl6ZWQgYmVmb3JlIEBzZWxlY3RUYXJnZXQoKVxuICAgICAgLy8gLSBNYW51YWwgY2hlY2twb2ludCBncm91cGluZzogdG8gY3JlYXRlIGNoZWNrcG9pbnQgYmVmb3JlIEBzZWxlY3RUYXJnZXQoKVxuICAgICAgZm4oKVxuICAgICAgdGhpcy5lbWl0V2lsbEZpbmlzaE11dGF0aW9uKClcbiAgICAgIHRoaXMuZ3JvdXBDaGFuZ2VzU2luY2VCdWZmZXJDaGVja3BvaW50KFwidW5kb1wiKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLm5vcm1hbGl6ZVNlbGVjdGlvbnNJZk5lY2Vzc2FyeSgpXG4gICAgICB0aGlzLmVkaXRvci50cmFuc2FjdCgoKSA9PiB7XG4gICAgICAgIGZuKClcbiAgICAgICAgdGhpcy5lbWl0V2lsbEZpbmlzaE11dGF0aW9uKClcbiAgICAgIH0pXG4gICAgfVxuXG4gICAgdGhpcy5lbWl0RGlkRmluaXNoTXV0YXRpb24oKVxuICB9XG5cbiAgLy8gTWFpblxuICBleGVjdXRlKCkge1xuICAgIHRoaXMuc3RhcnRNdXRhdGlvbigoKSA9PiB7XG4gICAgICBpZiAodGhpcy5zZWxlY3RUYXJnZXQoKSkge1xuICAgICAgICBjb25zdCBzZWxlY3Rpb25zID0gdGhpcy5tdXRhdGVTZWxlY3Rpb25PcmRlcmRcbiAgICAgICAgICA/IHRoaXMuZWRpdG9yLmdldFNlbGVjdGlvbnNPcmRlcmVkQnlCdWZmZXJQb3NpdGlvbigpXG4gICAgICAgICAgOiB0aGlzLmVkaXRvci5nZXRTZWxlY3Rpb25zKClcblxuICAgICAgICBmb3IgKGNvbnN0IHNlbGVjdGlvbiBvZiBzZWxlY3Rpb25zKSB7XG4gICAgICAgICAgdGhpcy5tdXRhdGVTZWxlY3Rpb24oc2VsZWN0aW9uKVxuICAgICAgICB9XG4gICAgICAgIHRoaXMubXV0YXRpb25NYW5hZ2VyLnNldENoZWNrcG9pbnQoXCJkaWQtZmluaXNoXCIpXG4gICAgICAgIHRoaXMucmVzdG9yZUN1cnNvclBvc2l0aW9uc0lmTmVjZXNzYXJ5KClcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgLy8gRXZlbiB0aG91Z2ggd2UgZmFpbCB0byBzZWxlY3QgdGFyZ2V0IGFuZCBmYWlsIHRvIG11dGF0ZSxcbiAgICAvLyB3ZSBoYXZlIHRvIHJldHVybiB0byBub3JtYWwtbW9kZSBmcm9tIG9wZXJhdG9yLXBlbmRpbmcgb3IgdmlzdWFsXG4gICAgdGhpcy5hY3RpdmF0ZU1vZGUoXCJub3JtYWxcIilcbiAgfVxuXG4gIC8vIFJldHVybiB0cnVlIHVubGVzcyBhbGwgc2VsZWN0aW9uIGlzIGVtcHR5LlxuICBzZWxlY3RUYXJnZXQoKSB7XG4gICAgaWYgKHRoaXMudGFyZ2V0U2VsZWN0ZWQgIT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHRoaXMudGFyZ2V0U2VsZWN0ZWRcbiAgICB9XG4gICAgdGhpcy5tdXRhdGlvbk1hbmFnZXIuaW5pdCh7c3RheUJ5TWFya2VyOiB0aGlzLnN0YXlCeU1hcmtlcn0pXG5cbiAgICBpZiAodGhpcy50YXJnZXQuaXNNb3Rpb24oKSAmJiB0aGlzLm1vZGUgPT09IFwidmlzdWFsXCIpIHRoaXMudGFyZ2V0Lndpc2UgPSB0aGlzLnN1Ym1vZGVcbiAgICBpZiAodGhpcy53aXNlICE9IG51bGwpIHRoaXMudGFyZ2V0LmZvcmNlV2lzZSh0aGlzLndpc2UpXG5cbiAgICB0aGlzLmVtaXRXaWxsU2VsZWN0VGFyZ2V0KClcblxuICAgIC8vIEFsbG93IGN1cnNvciBwb3NpdGlvbiBhZGp1c3RtZW50ICdvbi13aWxsLXNlbGVjdC10YXJnZXQnIGhvb2suXG4gICAgLy8gc28gY2hlY2twb2ludCBjb21lcyBBRlRFUiBAZW1pdFdpbGxTZWxlY3RUYXJnZXQoKVxuICAgIHRoaXMubXV0YXRpb25NYW5hZ2VyLnNldENoZWNrcG9pbnQoXCJ3aWxsLXNlbGVjdFwiKVxuXG4gICAgLy8gTk9URTogV2hlbiByZXBlYXRlZCwgc2V0IG9jY3VycmVuY2UtbWFya2VyIGZyb20gcGF0dGVybiBzdG9yZWQgYXMgc3RhdGUuXG4gICAgaWYgKHRoaXMucmVwZWF0ZWQgJiYgdGhpcy5vY2N1cnJlbmNlICYmICF0aGlzLm9jY3VycmVuY2VNYW5hZ2VyLmhhc01hcmtlcnMoKSkge1xuICAgICAgdGhpcy5vY2N1cnJlbmNlTWFuYWdlci5hZGRQYXR0ZXJuKHRoaXMucGF0dGVybkZvck9jY3VycmVuY2UsIHtvY2N1cnJlbmNlVHlwZTogdGhpcy5vY2N1cnJlbmNlVHlwZX0pXG4gICAgfVxuXG4gICAgdGhpcy50YXJnZXQuZXhlY3V0ZSgpXG5cbiAgICB0aGlzLm11dGF0aW9uTWFuYWdlci5zZXRDaGVja3BvaW50KFwiZGlkLXNlbGVjdFwiKVxuICAgIGlmICh0aGlzLm9jY3VycmVuY2UpIHtcbiAgICAgIGlmICghdGhpcy5wYXR0ZXJuRm9yT2NjdXJyZW5jZSkge1xuICAgICAgICAvLyBQcmVzZXJ2ZSBvY2N1cnJlbmNlUGF0dGVybiBmb3IgLiByZXBlYXQuXG4gICAgICAgIHRoaXMucGF0dGVybkZvck9jY3VycmVuY2UgPSB0aGlzLm9jY3VycmVuY2VNYW5hZ2VyLmJ1aWxkUGF0dGVybigpXG4gICAgICB9XG5cbiAgICAgIHRoaXMub2NjdXJyZW5jZVdpc2UgPSB0aGlzLndpc2UgfHwgXCJjaGFyYWN0ZXJ3aXNlXCJcbiAgICAgIGlmICh0aGlzLm9jY3VycmVuY2VNYW5hZ2VyLnNlbGVjdCh0aGlzLm9jY3VycmVuY2VXaXNlKSkge1xuICAgICAgICB0aGlzLm9jY3VycmVuY2VTZWxlY3RlZCA9IHRydWVcbiAgICAgICAgdGhpcy5tdXRhdGlvbk1hbmFnZXIuc2V0Q2hlY2twb2ludChcImRpZC1zZWxlY3Qtb2NjdXJyZW5jZVwiKVxuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMudGFyZ2V0U2VsZWN0ZWQgPSB0aGlzLnZpbVN0YXRlLmhhdmVTb21lTm9uRW1wdHlTZWxlY3Rpb24oKSB8fCB0aGlzLnRhcmdldC5uYW1lID09PSBcIkVtcHR5XCJcbiAgICBpZiAodGhpcy50YXJnZXRTZWxlY3RlZCkge1xuICAgICAgdGhpcy5lbWl0RGlkU2VsZWN0VGFyZ2V0KClcbiAgICAgIHRoaXMuZmxhc2hDaGFuZ2VJZk5lY2Vzc2FyeSgpXG4gICAgICB0aGlzLnRyYWNrQ2hhbmdlSWZOZWNlc3NhcnkoKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmVtaXREaWRGYWlsU2VsZWN0VGFyZ2V0KClcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy50YXJnZXRTZWxlY3RlZFxuICB9XG5cbiAgcmVzdG9yZUN1cnNvclBvc2l0aW9uc0lmTmVjZXNzYXJ5KCkge1xuICAgIGlmICghdGhpcy5yZXN0b3JlUG9zaXRpb25zKSByZXR1cm5cblxuICAgIGNvbnN0IHN0YXkgPVxuICAgICAgdGhpcy5zdGF5QXRTYW1lUG9zaXRpb24gIT0gbnVsbFxuICAgICAgICA/IHRoaXMuc3RheUF0U2FtZVBvc2l0aW9uXG4gICAgICAgIDogdGhpcy5nZXRDb25maWcodGhpcy5zdGF5T3B0aW9uTmFtZSkgfHwgKHRoaXMub2NjdXJyZW5jZVNlbGVjdGVkICYmIHRoaXMuZ2V0Q29uZmlnKFwic3RheU9uT2NjdXJyZW5jZVwiKSlcbiAgICBjb25zdCB3aXNlID0gdGhpcy5vY2N1cnJlbmNlU2VsZWN0ZWQgPyB0aGlzLm9jY3VycmVuY2VXaXNlIDogdGhpcy50YXJnZXQud2lzZVxuICAgIGNvbnN0IHtzZXRUb0ZpcnN0Q2hhcmFjdGVyT25MaW5ld2lzZX0gPSB0aGlzXG4gICAgdGhpcy5tdXRhdGlvbk1hbmFnZXIucmVzdG9yZUN1cnNvclBvc2l0aW9ucyh7c3RheSwgd2lzZSwgc2V0VG9GaXJzdENoYXJhY3Rlck9uTGluZXdpc2V9KVxuICB9XG59XG5PcGVyYXRvci5yZWdpc3RlcihmYWxzZSlcblxuY2xhc3MgU2VsZWN0QmFzZSBleHRlbmRzIE9wZXJhdG9yIHtcbiAgZmxhc2hUYXJnZXQgPSBmYWxzZVxuICByZWNvcmRhYmxlID0gZmFsc2VcblxuICBleGVjdXRlKCkge1xuICAgIHRoaXMuc3RhcnRNdXRhdGlvbigoKSA9PiB0aGlzLnNlbGVjdFRhcmdldCgpKVxuXG4gICAgaWYgKHRoaXMudGFyZ2V0LnNlbGVjdFN1Y2NlZWRlZCkge1xuICAgICAgaWYgKHRoaXMudGFyZ2V0LmlzVGV4dE9iamVjdCgpKSB7XG4gICAgICAgIHRoaXMuZWRpdG9yLnNjcm9sbFRvQ3Vyc29yUG9zaXRpb24oKVxuICAgICAgfVxuICAgICAgY29uc3Qgd2lzZSA9IHRoaXMub2NjdXJyZW5jZVNlbGVjdGVkID8gdGhpcy5vY2N1cnJlbmNlV2lzZSA6IHRoaXMudGFyZ2V0Lndpc2VcbiAgICAgIHRoaXMuYWN0aXZhdGVNb2RlSWZOZWNlc3NhcnkoXCJ2aXN1YWxcIiwgd2lzZSlcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5jYW5jZWxPcGVyYXRpb24oKVxuICAgIH1cbiAgfVxufVxuU2VsZWN0QmFzZS5yZWdpc3RlcihmYWxzZSlcblxuY2xhc3MgU2VsZWN0IGV4dGVuZHMgU2VsZWN0QmFzZSB7XG4gIGV4ZWN1dGUoKSB7XG4gICAgdGhpcy5zd3JhcC5zYXZlUHJvcGVydGllcyh0aGlzLmVkaXRvcilcbiAgICBzdXBlci5leGVjdXRlKClcbiAgfVxufVxuU2VsZWN0LnJlZ2lzdGVyKClcblxuY2xhc3MgU2VsZWN0TGF0ZXN0Q2hhbmdlIGV4dGVuZHMgU2VsZWN0QmFzZSB7XG4gIHRhcmdldCA9IFwiQUxhdGVzdENoYW5nZVwiXG59XG5TZWxlY3RMYXRlc3RDaGFuZ2UucmVnaXN0ZXIoKVxuXG5jbGFzcyBTZWxlY3RQcmV2aW91c1NlbGVjdGlvbiBleHRlbmRzIFNlbGVjdEJhc2Uge1xuICB0YXJnZXQgPSBcIlByZXZpb3VzU2VsZWN0aW9uXCJcbn1cblNlbGVjdFByZXZpb3VzU2VsZWN0aW9uLnJlZ2lzdGVyKClcblxuY2xhc3MgU2VsZWN0UGVyc2lzdGVudFNlbGVjdGlvbiBleHRlbmRzIFNlbGVjdEJhc2Uge1xuICB0YXJnZXQgPSBcIkFQZXJzaXN0ZW50U2VsZWN0aW9uXCJcbiAgYWNjZXB0UGVyc2lzdGVudFNlbGVjdGlvbiA9IGZhbHNlXG59XG5TZWxlY3RQZXJzaXN0ZW50U2VsZWN0aW9uLnJlZ2lzdGVyKClcblxuY2xhc3MgU2VsZWN0T2NjdXJyZW5jZSBleHRlbmRzIFNlbGVjdEJhc2Uge1xuICBvY2N1cnJlbmNlID0gdHJ1ZVxufVxuU2VsZWN0T2NjdXJyZW5jZS5yZWdpc3RlcigpXG5cbi8vIFNlbGVjdEluVmlzdWFsTW9kZTogdXNlZCBpbiB2aXN1YWwtbW9kZVxuLy8gV2hlbiB0ZXh0LW9iamVjdCBpcyBpbnZva2VkIGZyb20gbm9ybWFsIG9yIHZpdXNhbC1tb2RlLCBvcGVyYXRpb24gd291bGQgYmVcbi8vICA9PiBTZWxlY3RJblZpc3VhbE1vZGUgb3BlcmF0b3Igd2l0aCB0YXJnZXQ9dGV4dC1vYmplY3Rcbi8vIFdoZW4gbW90aW9uIGlzIGludm9rZWQgZnJvbSB2aXN1YWwtbW9kZSwgb3BlcmF0aW9uIHdvdWxkIGJlXG4vLyAgPT4gU2VsZWN0SW5WaXN1YWxNb2RlIG9wZXJhdG9yIHdpdGggdGFyZ2V0PW1vdGlvbilcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBTZWxlY3RJblZpc3VhbE1vZGUgaXMgdXNlZCBpbiBUV08gc2l0dWF0aW9uLlxuLy8gLSB2aXN1YWwtbW9kZSBvcGVyYXRpb25cbi8vICAgLSBlLmc6IGB2IGxgLCBgViBqYCwgYHYgaSBwYC4uLlxuLy8gLSBEaXJlY3RseSBpbnZva2UgdGV4dC1vYmplY3QgZnJvbSBub3JtYWwtbW9kZVxuLy8gICAtIGUuZzogSW52b2tlIGBJbm5lciBQYXJhZ3JhcGhgIGZyb20gY29tbWFuZC1wYWxldHRlLlxuY2xhc3MgU2VsZWN0SW5WaXN1YWxNb2RlIGV4dGVuZHMgU2VsZWN0QmFzZSB7XG4gIGFjY2VwdFByZXNldE9jY3VycmVuY2UgPSBmYWxzZVxuICBhY2NlcHRQZXJzaXN0ZW50U2VsZWN0aW9uID0gZmFsc2Vcbn1cblNlbGVjdEluVmlzdWFsTW9kZS5yZWdpc3RlcihmYWxzZSlcblxuLy8gUGVyc2lzdGVudCBTZWxlY3Rpb25cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIENyZWF0ZVBlcnNpc3RlbnRTZWxlY3Rpb24gZXh0ZW5kcyBPcGVyYXRvciB7XG4gIGZsYXNoVGFyZ2V0ID0gZmFsc2VcbiAgc3RheUF0U2FtZVBvc2l0aW9uID0gdHJ1ZVxuICBhY2NlcHRQcmVzZXRPY2N1cnJlbmNlID0gZmFsc2VcbiAgYWNjZXB0UGVyc2lzdGVudFNlbGVjdGlvbiA9IGZhbHNlXG5cbiAgbXV0YXRlU2VsZWN0aW9uKHNlbGVjdGlvbikge1xuICAgIHRoaXMucGVyc2lzdGVudFNlbGVjdGlvbi5tYXJrQnVmZmVyUmFuZ2Uoc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKCkpXG4gIH1cbn1cbkNyZWF0ZVBlcnNpc3RlbnRTZWxlY3Rpb24ucmVnaXN0ZXIoKVxuXG5jbGFzcyBUb2dnbGVQZXJzaXN0ZW50U2VsZWN0aW9uIGV4dGVuZHMgQ3JlYXRlUGVyc2lzdGVudFNlbGVjdGlvbiB7XG4gIGlzQ29tcGxldGUoKSB7XG4gICAgY29uc3QgcG9pbnQgPSB0aGlzLmVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpXG4gICAgdGhpcy5tYXJrZXJUb1JlbW92ZSA9IHRoaXMucGVyc2lzdGVudFNlbGVjdGlvbi5nZXRNYXJrZXJBdFBvaW50KHBvaW50KVxuICAgIHJldHVybiB0aGlzLm1hcmtlclRvUmVtb3ZlIHx8IHN1cGVyLmlzQ29tcGxldGUoKVxuICB9XG5cbiAgZXhlY3V0ZSgpIHtcbiAgICBpZiAodGhpcy5tYXJrZXJUb1JlbW92ZSkge1xuICAgICAgdGhpcy5tYXJrZXJUb1JlbW92ZS5kZXN0cm95KClcbiAgICB9IGVsc2Uge1xuICAgICAgc3VwZXIuZXhlY3V0ZSgpXG4gICAgfVxuICB9XG59XG5Ub2dnbGVQZXJzaXN0ZW50U2VsZWN0aW9uLnJlZ2lzdGVyKClcblxuLy8gUHJlc2V0IE9jY3VycmVuY2Vcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIFRvZ2dsZVByZXNldE9jY3VycmVuY2UgZXh0ZW5kcyBPcGVyYXRvciB7XG4gIHRhcmdldCA9IFwiRW1wdHlcIlxuICBmbGFzaFRhcmdldCA9IGZhbHNlXG4gIGFjY2VwdFByZXNldE9jY3VycmVuY2UgPSBmYWxzZVxuICBhY2NlcHRQZXJzaXN0ZW50U2VsZWN0aW9uID0gZmFsc2VcbiAgb2NjdXJyZW5jZVR5cGUgPSBcImJhc2VcIlxuXG4gIGV4ZWN1dGUoKSB7XG4gICAgY29uc3QgbWFya2VyID0gdGhpcy5vY2N1cnJlbmNlTWFuYWdlci5nZXRNYXJrZXJBdFBvaW50KHRoaXMuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKSlcbiAgICBpZiAobWFya2VyKSB7XG4gICAgICB0aGlzLm9jY3VycmVuY2VNYW5hZ2VyLmRlc3Ryb3lNYXJrZXJzKFttYXJrZXJdKVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBpc05hcnJvd2VkID0gdGhpcy52aW1TdGF0ZS5tb2RlTWFuYWdlci5pc05hcnJvd2VkKClcblxuICAgICAgbGV0IHJlZ2V4XG4gICAgICBpZiAodGhpcy5tb2RlID09PSBcInZpc3VhbFwiICYmICFpc05hcnJvd2VkKSB7XG4gICAgICAgIHRoaXMub2NjdXJyZW5jZVR5cGUgPSBcImJhc2VcIlxuICAgICAgICByZWdleCA9IG5ldyBSZWdFeHAoXy5lc2NhcGVSZWdFeHAodGhpcy5lZGl0b3IuZ2V0U2VsZWN0ZWRUZXh0KCkpLCBcImdcIilcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlZ2V4ID0gdGhpcy5nZXRQYXR0ZXJuRm9yT2NjdXJyZW5jZVR5cGUodGhpcy5vY2N1cnJlbmNlVHlwZSlcbiAgICAgIH1cblxuICAgICAgdGhpcy5vY2N1cnJlbmNlTWFuYWdlci5hZGRQYXR0ZXJuKHJlZ2V4LCB7b2NjdXJyZW5jZVR5cGU6IHRoaXMub2NjdXJyZW5jZVR5cGV9KVxuICAgICAgdGhpcy5vY2N1cnJlbmNlTWFuYWdlci5zYXZlTGFzdFBhdHRlcm4odGhpcy5vY2N1cnJlbmNlVHlwZSlcblxuICAgICAgaWYgKCFpc05hcnJvd2VkKSB0aGlzLmFjdGl2YXRlTW9kZShcIm5vcm1hbFwiKVxuICAgIH1cbiAgfVxufVxuVG9nZ2xlUHJlc2V0T2NjdXJyZW5jZS5yZWdpc3RlcigpXG5cbmNsYXNzIFRvZ2dsZVByZXNldFN1YndvcmRPY2N1cnJlbmNlIGV4dGVuZHMgVG9nZ2xlUHJlc2V0T2NjdXJyZW5jZSB7XG4gIG9jY3VycmVuY2VUeXBlID0gXCJzdWJ3b3JkXCJcbn1cblRvZ2dsZVByZXNldFN1YndvcmRPY2N1cnJlbmNlLnJlZ2lzdGVyKClcblxuLy8gV2FudCB0byByZW5hbWUgUmVzdG9yZU9jY3VycmVuY2VNYXJrZXJcbmNsYXNzIEFkZFByZXNldE9jY3VycmVuY2VGcm9tTGFzdE9jY3VycmVuY2VQYXR0ZXJuIGV4dGVuZHMgVG9nZ2xlUHJlc2V0T2NjdXJyZW5jZSB7XG4gIGV4ZWN1dGUoKSB7XG4gICAgdGhpcy5vY2N1cnJlbmNlTWFuYWdlci5yZXNldFBhdHRlcm5zKClcbiAgICBjb25zdCByZWdleCA9IHRoaXMuZ2xvYmFsU3RhdGUuZ2V0KFwibGFzdE9jY3VycmVuY2VQYXR0ZXJuXCIpXG4gICAgaWYgKHJlZ2V4KSB7XG4gICAgICBjb25zdCBvY2N1cnJlbmNlVHlwZSA9IHRoaXMuZ2xvYmFsU3RhdGUuZ2V0KFwibGFzdE9jY3VycmVuY2VUeXBlXCIpXG4gICAgICB0aGlzLm9jY3VycmVuY2VNYW5hZ2VyLmFkZFBhdHRlcm4ocmVnZXgsIHtvY2N1cnJlbmNlVHlwZX0pXG4gICAgICB0aGlzLmFjdGl2YXRlTW9kZShcIm5vcm1hbFwiKVxuICAgIH1cbiAgfVxufVxuQWRkUHJlc2V0T2NjdXJyZW5jZUZyb21MYXN0T2NjdXJyZW5jZVBhdHRlcm4ucmVnaXN0ZXIoKVxuXG4vLyBEZWxldGVcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5jbGFzcyBEZWxldGUgZXh0ZW5kcyBPcGVyYXRvciB7XG4gIHRyYWNrQ2hhbmdlID0gdHJ1ZVxuICBmbGFzaENoZWNrcG9pbnQgPSBcImRpZC1zZWxlY3Qtb2NjdXJyZW5jZVwiXG4gIGZsYXNoVHlwZUZvck9jY3VycmVuY2UgPSBcIm9wZXJhdG9yLXJlbW92ZS1vY2N1cnJlbmNlXCJcbiAgc3RheU9wdGlvbk5hbWUgPSBcInN0YXlPbkRlbGV0ZVwiXG4gIHNldFRvRmlyc3RDaGFyYWN0ZXJPbkxpbmV3aXNlID0gdHJ1ZVxuXG4gIGV4ZWN1dGUoKSB7XG4gICAgdGhpcy5vbkRpZFNlbGVjdFRhcmdldCgoKSA9PiB7XG4gICAgICBpZiAodGhpcy5vY2N1cnJlbmNlU2VsZWN0ZWQgJiYgdGhpcy5vY2N1cnJlbmNlV2lzZSA9PT0gXCJsaW5ld2lzZVwiKSB7XG4gICAgICAgIHRoaXMuZmxhc2hUYXJnZXQgPSBmYWxzZVxuICAgICAgfVxuICAgIH0pXG5cbiAgICBpZiAodGhpcy50YXJnZXQud2lzZSA9PT0gXCJibG9ja3dpc2VcIikge1xuICAgICAgdGhpcy5yZXN0b3JlUG9zaXRpb25zID0gZmFsc2VcbiAgICB9XG4gICAgc3VwZXIuZXhlY3V0ZSgpXG4gIH1cblxuICBtdXRhdGVTZWxlY3Rpb24oc2VsZWN0aW9uKSB7XG4gICAgdGhpcy5zZXRUZXh0VG9SZWdpc3RlckZvclNlbGVjdGlvbihzZWxlY3Rpb24pXG4gICAgc2VsZWN0aW9uLmRlbGV0ZVNlbGVjdGVkVGV4dCgpXG4gIH1cbn1cbkRlbGV0ZS5yZWdpc3RlcigpXG5cbmNsYXNzIERlbGV0ZVJpZ2h0IGV4dGVuZHMgRGVsZXRlIHtcbiAgdGFyZ2V0ID0gXCJNb3ZlUmlnaHRcIlxufVxuRGVsZXRlUmlnaHQucmVnaXN0ZXIoKVxuXG5jbGFzcyBEZWxldGVMZWZ0IGV4dGVuZHMgRGVsZXRlIHtcbiAgdGFyZ2V0ID0gXCJNb3ZlTGVmdFwiXG59XG5EZWxldGVMZWZ0LnJlZ2lzdGVyKClcblxuY2xhc3MgRGVsZXRlVG9MYXN0Q2hhcmFjdGVyT2ZMaW5lIGV4dGVuZHMgRGVsZXRlIHtcbiAgdGFyZ2V0ID0gXCJNb3ZlVG9MYXN0Q2hhcmFjdGVyT2ZMaW5lXCJcblxuICBleGVjdXRlKCkge1xuICAgIHRoaXMub25EaWRTZWxlY3RUYXJnZXQoKCkgPT4ge1xuICAgICAgaWYgKHRoaXMudGFyZ2V0Lndpc2UgPT09IFwiYmxvY2t3aXNlXCIpIHtcbiAgICAgICAgZm9yIChjb25zdCBibG9ja3dpc2VTZWxlY3Rpb24gb2YgdGhpcy5nZXRCbG9ja3dpc2VTZWxlY3Rpb25zKCkpIHtcbiAgICAgICAgICBibG9ja3dpc2VTZWxlY3Rpb24uZXh0ZW5kTWVtYmVyU2VsZWN0aW9uc1RvRW5kT2ZMaW5lKClcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gICAgc3VwZXIuZXhlY3V0ZSgpXG4gIH1cbn1cbkRlbGV0ZVRvTGFzdENoYXJhY3Rlck9mTGluZS5yZWdpc3RlcigpXG5cbmNsYXNzIERlbGV0ZUxpbmUgZXh0ZW5kcyBEZWxldGUge1xuICB3aXNlID0gXCJsaW5ld2lzZVwiXG4gIHRhcmdldCA9IFwiTW92ZVRvUmVsYXRpdmVMaW5lXCJcbiAgZmxhc2hUYXJnZXQgPSBmYWxzZVxufVxuRGVsZXRlTGluZS5yZWdpc3RlcigpXG5cbi8vIFlhbmtcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIFlhbmsgZXh0ZW5kcyBPcGVyYXRvciB7XG4gIHRyYWNrQ2hhbmdlID0gdHJ1ZVxuICBzdGF5T3B0aW9uTmFtZSA9IFwic3RheU9uWWFua1wiXG5cbiAgbXV0YXRlU2VsZWN0aW9uKHNlbGVjdGlvbikge1xuICAgIHRoaXMuc2V0VGV4dFRvUmVnaXN0ZXJGb3JTZWxlY3Rpb24oc2VsZWN0aW9uKVxuICB9XG59XG5ZYW5rLnJlZ2lzdGVyKClcblxuY2xhc3MgWWFua0xpbmUgZXh0ZW5kcyBZYW5rIHtcbiAgd2lzZSA9IFwibGluZXdpc2VcIlxuICB0YXJnZXQgPSBcIk1vdmVUb1JlbGF0aXZlTGluZVwiXG59XG5ZYW5rTGluZS5yZWdpc3RlcigpXG5cbmNsYXNzIFlhbmtUb0xhc3RDaGFyYWN0ZXJPZkxpbmUgZXh0ZW5kcyBZYW5rIHtcbiAgdGFyZ2V0ID0gXCJNb3ZlVG9MYXN0Q2hhcmFjdGVyT2ZMaW5lXCJcbn1cbllhbmtUb0xhc3RDaGFyYWN0ZXJPZkxpbmUucmVnaXN0ZXIoKVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBbY3RybC1hXVxuY2xhc3MgSW5jcmVhc2UgZXh0ZW5kcyBPcGVyYXRvciB7XG4gIHRhcmdldCA9IFwiRW1wdHlcIiAvLyBjdHJsLWEgaW4gbm9ybWFsLW1vZGUgZmluZCB0YXJnZXQgbnVtYmVyIGluIGN1cnJlbnQgbGluZSBtYW51YWxseVxuICBmbGFzaFRhcmdldCA9IGZhbHNlIC8vIGRvIG1hbnVhbGx5XG4gIHJlc3RvcmVQb3NpdGlvbnMgPSBmYWxzZSAvLyBkbyBtYW51YWxseVxuICBzdGVwID0gMVxuXG4gIGV4ZWN1dGUoKSB7XG4gICAgdGhpcy5uZXdSYW5nZXMgPSBbXVxuICAgIGlmICghdGhpcy5yZWdleCkgdGhpcy5yZWdleCA9IG5ldyBSZWdFeHAoYCR7dGhpcy5nZXRDb25maWcoXCJudW1iZXJSZWdleFwiKX1gLCBcImdcIilcblxuICAgIHN1cGVyLmV4ZWN1dGUoKVxuXG4gICAgaWYgKHRoaXMubmV3UmFuZ2VzLmxlbmd0aCkge1xuICAgICAgaWYgKHRoaXMuZ2V0Q29uZmlnKFwiZmxhc2hPbk9wZXJhdGVcIikgJiYgIXRoaXMuZ2V0Q29uZmlnKFwiZmxhc2hPbk9wZXJhdGVCbGFja2xpc3RcIikuaW5jbHVkZXModGhpcy5uYW1lKSkge1xuICAgICAgICB0aGlzLnZpbVN0YXRlLmZsYXNoKHRoaXMubmV3UmFuZ2VzLCB7dHlwZTogdGhpcy5mbGFzaFR5cGVGb3JPY2N1cnJlbmNlfSlcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXBsYWNlTnVtYmVySW5CdWZmZXJSYW5nZShzY2FuUmFuZ2UsIGZuKSB7XG4gICAgY29uc3QgbmV3UmFuZ2VzID0gW11cbiAgICB0aGlzLnNjYW5Gb3J3YXJkKHRoaXMucmVnZXgsIHtzY2FuUmFuZ2V9LCBldmVudCA9PiB7XG4gICAgICBpZiAoZm4pIHtcbiAgICAgICAgaWYgKGZuKGV2ZW50KSkgZXZlbnQuc3RvcCgpXG4gICAgICAgIGVsc2UgcmV0dXJuXG4gICAgICB9XG4gICAgICBjb25zdCBuZXh0TnVtYmVyID0gdGhpcy5nZXROZXh0TnVtYmVyKGV2ZW50Lm1hdGNoVGV4dClcbiAgICAgIG5ld1Jhbmdlcy5wdXNoKGV2ZW50LnJlcGxhY2UoU3RyaW5nKG5leHROdW1iZXIpKSlcbiAgICB9KVxuICAgIHJldHVybiBuZXdSYW5nZXNcbiAgfVxuXG4gIG11dGF0ZVNlbGVjdGlvbihzZWxlY3Rpb24pIHtcbiAgICBjb25zdCB7Y3Vyc29yfSA9IHNlbGVjdGlvblxuICAgIGlmICh0aGlzLnRhcmdldC5pcyhcIkVtcHR5XCIpKSB7XG4gICAgICAvLyBjdHJsLWEsIGN0cmwteCBpbiBgbm9ybWFsLW1vZGVgXG4gICAgICBjb25zdCBjdXJzb3JQb3NpdGlvbiA9IGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXG4gICAgICBjb25zdCBzY2FuUmFuZ2UgPSB0aGlzLmVkaXRvci5idWZmZXJSYW5nZUZvckJ1ZmZlclJvdyhjdXJzb3JQb3NpdGlvbi5yb3cpXG4gICAgICBjb25zdCBuZXdSYW5nZXMgPSB0aGlzLnJlcGxhY2VOdW1iZXJJbkJ1ZmZlclJhbmdlKHNjYW5SYW5nZSwgZXZlbnQgPT5cbiAgICAgICAgZXZlbnQucmFuZ2UuZW5kLmlzR3JlYXRlclRoYW4oY3Vyc29yUG9zaXRpb24pXG4gICAgICApXG4gICAgICBjb25zdCBwb2ludCA9IChuZXdSYW5nZXMubGVuZ3RoICYmIG5ld1Jhbmdlc1swXS5lbmQudHJhbnNsYXRlKFswLCAtMV0pKSB8fCBjdXJzb3JQb3NpdGlvblxuICAgICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHBvaW50KVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBzY2FuUmFuZ2UgPSBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKVxuICAgICAgdGhpcy5uZXdSYW5nZXMucHVzaCguLi50aGlzLnJlcGxhY2VOdW1iZXJJbkJ1ZmZlclJhbmdlKHNjYW5SYW5nZSkpXG4gICAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24oc2NhblJhbmdlLnN0YXJ0KVxuICAgIH1cbiAgfVxuXG4gIGdldE5leHROdW1iZXIobnVtYmVyU3RyaW5nKSB7XG4gICAgcmV0dXJuIE51bWJlci5wYXJzZUludChudW1iZXJTdHJpbmcsIDEwKSArIHRoaXMuc3RlcCAqIHRoaXMuZ2V0Q291bnQoKVxuICB9XG59XG5JbmNyZWFzZS5yZWdpc3RlcigpXG5cbi8vIFtjdHJsLXhdXG5jbGFzcyBEZWNyZWFzZSBleHRlbmRzIEluY3JlYXNlIHtcbiAgc3RlcCA9IC0xXG59XG5EZWNyZWFzZS5yZWdpc3RlcigpXG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFtnIGN0cmwtYV1cbmNsYXNzIEluY3JlbWVudE51bWJlciBleHRlbmRzIEluY3JlYXNlIHtcbiAgYmFzZU51bWJlciA9IG51bGxcbiAgdGFyZ2V0ID0gbnVsbFxuICBtdXRhdGVTZWxlY3Rpb25PcmRlcmQgPSB0cnVlXG5cbiAgZ2V0TmV4dE51bWJlcihudW1iZXJTdHJpbmcpIHtcbiAgICBpZiAodGhpcy5iYXNlTnVtYmVyICE9IG51bGwpIHtcbiAgICAgIHRoaXMuYmFzZU51bWJlciArPSB0aGlzLnN0ZXAgKiB0aGlzLmdldENvdW50KClcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5iYXNlTnVtYmVyID0gTnVtYmVyLnBhcnNlSW50KG51bWJlclN0cmluZywgMTApXG4gICAgfVxuICAgIHJldHVybiB0aGlzLmJhc2VOdW1iZXJcbiAgfVxufVxuSW5jcmVtZW50TnVtYmVyLnJlZ2lzdGVyKClcblxuLy8gW2cgY3RybC14XVxuY2xhc3MgRGVjcmVtZW50TnVtYmVyIGV4dGVuZHMgSW5jcmVtZW50TnVtYmVyIHtcbiAgc3RlcCA9IC0xXG59XG5EZWNyZW1lbnROdW1iZXIucmVnaXN0ZXIoKVxuXG4vLyBQdXRcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEN1cnNvciBwbGFjZW1lbnQ6XG4vLyAtIHBsYWNlIGF0IGVuZCBvZiBtdXRhdGlvbjogcGFzdGUgbm9uLW11bHRpbGluZSBjaGFyYWN0ZXJ3aXNlIHRleHRcbi8vIC0gcGxhY2UgYXQgc3RhcnQgb2YgbXV0YXRpb246IG5vbi1tdWx0aWxpbmUgY2hhcmFjdGVyd2lzZSB0ZXh0KGNoYXJhY3Rlcndpc2UsIGxpbmV3aXNlKVxuY2xhc3MgUHV0QmVmb3JlIGV4dGVuZHMgT3BlcmF0b3Ige1xuICBsb2NhdGlvbiA9IFwiYmVmb3JlXCJcbiAgdGFyZ2V0ID0gXCJFbXB0eVwiXG4gIGZsYXNoVHlwZSA9IFwib3BlcmF0b3ItbG9uZ1wiXG4gIHJlc3RvcmVQb3NpdGlvbnMgPSBmYWxzZSAvLyBtYW5hZ2UgbWFudWFsbHlcbiAgZmxhc2hUYXJnZXQgPSBmYWxzZSAvLyBtYW5hZ2UgbWFudWFsbHlcbiAgdHJhY2tDaGFuZ2UgPSBmYWxzZSAvLyBtYW5hZ2UgbWFudWFsbHlcblxuICBpbml0aWFsaXplKCkge1xuICAgIHRoaXMudmltU3RhdGUuc2VxdWVudGlhbFBhc3RlTWFuYWdlci5vbkluaXRpYWxpemUodGhpcylcbiAgICBzdXBlci5pbml0aWFsaXplKClcbiAgfVxuXG4gIGV4ZWN1dGUoKSB7XG4gICAgdGhpcy5tdXRhdGlvbnNCeVNlbGVjdGlvbiA9IG5ldyBNYXAoKVxuICAgIHRoaXMuc2VxdWVudGlhbFBhc3RlID0gdGhpcy52aW1TdGF0ZS5zZXF1ZW50aWFsUGFzdGVNYW5hZ2VyLm9uRXhlY3V0ZSh0aGlzKVxuXG4gICAgdGhpcy5vbkRpZEZpbmlzaE11dGF0aW9uKCgpID0+IHtcbiAgICAgIGlmICghdGhpcy5jYW5jZWxsZWQpIHRoaXMuYWRqdXN0Q3Vyc29yUG9zaXRpb24oKVxuICAgIH0pXG5cbiAgICBzdXBlci5leGVjdXRlKClcblxuICAgIGlmICh0aGlzLmNhbmNlbGxlZCkgcmV0dXJuXG5cbiAgICB0aGlzLm9uRGlkRmluaXNoT3BlcmF0aW9uKCgpID0+IHtcbiAgICAgIC8vIFRyYWNrQ2hhbmdlXG4gICAgICBjb25zdCBuZXdSYW5nZSA9IHRoaXMubXV0YXRpb25zQnlTZWxlY3Rpb24uZ2V0KHRoaXMuZWRpdG9yLmdldExhc3RTZWxlY3Rpb24oKSlcbiAgICAgIGlmIChuZXdSYW5nZSkgdGhpcy5zZXRNYXJrRm9yQ2hhbmdlKG5ld1JhbmdlKVxuXG4gICAgICAvLyBGbGFzaFxuICAgICAgaWYgKHRoaXMuZ2V0Q29uZmlnKFwiZmxhc2hPbk9wZXJhdGVcIikgJiYgIXRoaXMuZ2V0Q29uZmlnKFwiZmxhc2hPbk9wZXJhdGVCbGFja2xpc3RcIikuaW5jbHVkZXModGhpcy5uYW1lKSkge1xuICAgICAgICBjb25zdCByYW5nZXMgPSB0aGlzLmVkaXRvci5nZXRTZWxlY3Rpb25zKCkubWFwKHNlbGVjdGlvbiA9PiB0aGlzLm11dGF0aW9uc0J5U2VsZWN0aW9uLmdldChzZWxlY3Rpb24pKVxuICAgICAgICB0aGlzLnZpbVN0YXRlLmZsYXNoKHJhbmdlcywge3R5cGU6IHRoaXMuZ2V0Rmxhc2hUeXBlKCl9KVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICBhZGp1c3RDdXJzb3JQb3NpdGlvbigpIHtcbiAgICBmb3IgKGNvbnN0IHNlbGVjdGlvbiBvZiB0aGlzLmVkaXRvci5nZXRTZWxlY3Rpb25zKCkpIHtcbiAgICAgIGlmICghdGhpcy5tdXRhdGlvbnNCeVNlbGVjdGlvbi5oYXMoc2VsZWN0aW9uKSkgY29udGludWVcblxuICAgICAgY29uc3Qge2N1cnNvcn0gPSBzZWxlY3Rpb25cbiAgICAgIGNvbnN0IG5ld1JhbmdlID0gdGhpcy5tdXRhdGlvbnNCeVNlbGVjdGlvbi5nZXQoc2VsZWN0aW9uKVxuICAgICAgaWYgKHRoaXMubGluZXdpc2VQYXN0ZSkge1xuICAgICAgICB0aGlzLnV0aWxzLm1vdmVDdXJzb3JUb0ZpcnN0Q2hhcmFjdGVyQXRSb3coY3Vyc29yLCBuZXdSYW5nZS5zdGFydC5yb3cpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAobmV3UmFuZ2UuaXNTaW5nbGVMaW5lKCkpIHtcbiAgICAgICAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24obmV3UmFuZ2UuZW5kLnRyYW5zbGF0ZShbMCwgLTFdKSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24obmV3UmFuZ2Uuc3RhcnQpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBtdXRhdGVTZWxlY3Rpb24oc2VsZWN0aW9uKSB7XG4gICAgY29uc3QgdmFsdWUgPSB0aGlzLnZpbVN0YXRlLnJlZ2lzdGVyLmdldChudWxsLCBzZWxlY3Rpb24sIHRoaXMuc2VxdWVudGlhbFBhc3RlKVxuICAgIGlmICghdmFsdWUudGV4dCkge1xuICAgICAgdGhpcy5jYW5jZWxsZWQgPSB0cnVlXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBjb25zdCB0ZXh0VG9QYXN0ZSA9IF8ubXVsdGlwbHlTdHJpbmcodmFsdWUudGV4dCwgdGhpcy5nZXRDb3VudCgpKVxuICAgIHRoaXMubGluZXdpc2VQYXN0ZSA9IHZhbHVlLnR5cGUgPT09IFwibGluZXdpc2VcIiB8fCB0aGlzLmlzTW9kZShcInZpc3VhbFwiLCBcImxpbmV3aXNlXCIpXG4gICAgY29uc3QgbmV3UmFuZ2UgPSB0aGlzLnBhc3RlKHNlbGVjdGlvbiwgdGV4dFRvUGFzdGUsIHtsaW5ld2lzZVBhc3RlOiB0aGlzLmxpbmV3aXNlUGFzdGV9KVxuICAgIHRoaXMubXV0YXRpb25zQnlTZWxlY3Rpb24uc2V0KHNlbGVjdGlvbiwgbmV3UmFuZ2UpXG4gICAgdGhpcy52aW1TdGF0ZS5zZXF1ZW50aWFsUGFzdGVNYW5hZ2VyLnNhdmVQYXN0ZWRSYW5nZUZvclNlbGVjdGlvbihzZWxlY3Rpb24sIG5ld1JhbmdlKVxuICB9XG5cbiAgLy8gUmV0dXJuIHBhc3RlZCByYW5nZVxuICBwYXN0ZShzZWxlY3Rpb24sIHRleHQsIHtsaW5ld2lzZVBhc3RlfSkge1xuICAgIGlmICh0aGlzLnNlcXVlbnRpYWxQYXN0ZSkge1xuICAgICAgcmV0dXJuIHRoaXMucGFzdGVDaGFyYWN0ZXJ3aXNlKHNlbGVjdGlvbiwgdGV4dClcbiAgICB9IGVsc2UgaWYgKGxpbmV3aXNlUGFzdGUpIHtcbiAgICAgIHJldHVybiB0aGlzLnBhc3RlTGluZXdpc2Uoc2VsZWN0aW9uLCB0ZXh0KVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5wYXN0ZUNoYXJhY3Rlcndpc2Uoc2VsZWN0aW9uLCB0ZXh0KVxuICAgIH1cbiAgfVxuXG4gIHBhc3RlQ2hhcmFjdGVyd2lzZShzZWxlY3Rpb24sIHRleHQpIHtcbiAgICBjb25zdCB7Y3Vyc29yfSA9IHNlbGVjdGlvblxuICAgIGlmIChcbiAgICAgIHNlbGVjdGlvbi5pc0VtcHR5KCkgJiZcbiAgICAgIHRoaXMubG9jYXRpb24gPT09IFwiYWZ0ZXJcIiAmJlxuICAgICAgIXRoaXMudXRpbHMuaXNFbXB0eVJvdyh0aGlzLmVkaXRvciwgY3Vyc29yLmdldEJ1ZmZlclJvdygpKVxuICAgICkge1xuICAgICAgY3Vyc29yLm1vdmVSaWdodCgpXG4gICAgfVxuICAgIHJldHVybiBzZWxlY3Rpb24uaW5zZXJ0VGV4dCh0ZXh0KVxuICB9XG5cbiAgLy8gUmV0dXJuIG5ld1JhbmdlXG4gIHBhc3RlTGluZXdpc2Uoc2VsZWN0aW9uLCB0ZXh0KSB7XG4gICAgY29uc3Qge2N1cnNvcn0gPSBzZWxlY3Rpb25cbiAgICBjb25zdCBjdXJzb3JSb3cgPSBjdXJzb3IuZ2V0QnVmZmVyUm93KClcbiAgICBpZiAoIXRleHQuZW5kc1dpdGgoXCJcXG5cIikpIHtcbiAgICAgIHRleHQgKz0gXCJcXG5cIlxuICAgIH1cbiAgICBpZiAoc2VsZWN0aW9uLmlzRW1wdHkoKSkge1xuICAgICAgaWYgKHRoaXMubG9jYXRpb24gPT09IFwiYmVmb3JlXCIpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudXRpbHMuaW5zZXJ0VGV4dEF0QnVmZmVyUG9zaXRpb24odGhpcy5lZGl0b3IsIFtjdXJzb3JSb3csIDBdLCB0ZXh0KVxuICAgICAgfSBlbHNlIGlmICh0aGlzLmxvY2F0aW9uID09PSBcImFmdGVyXCIpIHtcbiAgICAgICAgY29uc3QgdGFyZ2V0Um93ID0gdGhpcy5nZXRGb2xkRW5kUm93Rm9yUm93KGN1cnNvclJvdylcbiAgICAgICAgdGhpcy51dGlscy5lbnN1cmVFbmRzV2l0aE5ld0xpbmVGb3JCdWZmZXJSb3codGhpcy5lZGl0b3IsIHRhcmdldFJvdylcbiAgICAgICAgcmV0dXJuIHRoaXMudXRpbHMuaW5zZXJ0VGV4dEF0QnVmZmVyUG9zaXRpb24odGhpcy5lZGl0b3IsIFt0YXJnZXRSb3cgKyAxLCAwXSwgdGV4dClcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKCF0aGlzLmlzTW9kZShcInZpc3VhbFwiLCBcImxpbmV3aXNlXCIpKSB7XG4gICAgICAgIHNlbGVjdGlvbi5pbnNlcnRUZXh0KFwiXFxuXCIpXG4gICAgICB9XG4gICAgICByZXR1cm4gc2VsZWN0aW9uLmluc2VydFRleHQodGV4dClcbiAgICB9XG4gIH1cbn1cblB1dEJlZm9yZS5yZWdpc3RlcigpXG5cbmNsYXNzIFB1dEFmdGVyIGV4dGVuZHMgUHV0QmVmb3JlIHtcbiAgbG9jYXRpb24gPSBcImFmdGVyXCJcbn1cblB1dEFmdGVyLnJlZ2lzdGVyKClcblxuY2xhc3MgUHV0QmVmb3JlV2l0aEF1dG9JbmRlbnQgZXh0ZW5kcyBQdXRCZWZvcmUge1xuICBwYXN0ZUxpbmV3aXNlKHNlbGVjdGlvbiwgdGV4dCkge1xuICAgIGNvbnN0IG5ld1JhbmdlID0gc3VwZXIucGFzdGVMaW5ld2lzZShzZWxlY3Rpb24sIHRleHQpXG4gICAgdGhpcy51dGlscy5hZGp1c3RJbmRlbnRXaXRoS2VlcGluZ0xheW91dCh0aGlzLmVkaXRvciwgbmV3UmFuZ2UpXG4gICAgcmV0dXJuIG5ld1JhbmdlXG4gIH1cbn1cblB1dEJlZm9yZVdpdGhBdXRvSW5kZW50LnJlZ2lzdGVyKClcblxuY2xhc3MgUHV0QWZ0ZXJXaXRoQXV0b0luZGVudCBleHRlbmRzIFB1dEJlZm9yZVdpdGhBdXRvSW5kZW50IHtcbiAgbG9jYXRpb24gPSBcImFmdGVyXCJcbn1cblB1dEFmdGVyV2l0aEF1dG9JbmRlbnQucmVnaXN0ZXIoKVxuXG5jbGFzcyBBZGRCbGFua0xpbmVCZWxvdyBleHRlbmRzIE9wZXJhdG9yIHtcbiAgZmxhc2hUYXJnZXQgPSBmYWxzZVxuICB0YXJnZXQgPSBcIkVtcHR5XCJcbiAgc3RheUF0U2FtZVBvc2l0aW9uID0gdHJ1ZVxuICBzdGF5QnlNYXJrZXIgPSB0cnVlXG4gIHdoZXJlID0gXCJiZWxvd1wiXG5cbiAgbXV0YXRlU2VsZWN0aW9uKHNlbGVjdGlvbikge1xuICAgIGNvbnN0IHBvaW50ID0gc2VsZWN0aW9uLmdldEhlYWRCdWZmZXJQb3NpdGlvbigpXG4gICAgaWYgKHRoaXMud2hlcmUgPT09IFwiYmVsb3dcIikgcG9pbnQucm93KytcbiAgICBwb2ludC5jb2x1bW4gPSAwXG4gICAgdGhpcy5lZGl0b3Iuc2V0VGV4dEluQnVmZmVyUmFuZ2UoW3BvaW50LCBwb2ludF0sIFwiXFxuXCIucmVwZWF0KHRoaXMuZ2V0Q291bnQoKSkpXG4gIH1cbn1cbkFkZEJsYW5rTGluZUJlbG93LnJlZ2lzdGVyKClcblxuY2xhc3MgQWRkQmxhbmtMaW5lQWJvdmUgZXh0ZW5kcyBBZGRCbGFua0xpbmVCZWxvdyB7XG4gIHdoZXJlID0gXCJhYm92ZVwiXG59XG5BZGRCbGFua0xpbmVBYm92ZS5yZWdpc3RlcigpXG4iXX0=