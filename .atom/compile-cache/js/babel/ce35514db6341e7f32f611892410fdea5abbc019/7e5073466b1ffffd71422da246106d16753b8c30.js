"use babel";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, "next"); var callThrow = step.bind(null, "throw"); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _ = require("underscore-plus");
var Base = require("./base");

var Operator = (function (_Base) {
  _inherits(Operator, _Base);

  function Operator() {
    _classCallCheck(this, Operator);

    _get(Object.getPrototypeOf(Operator.prototype), "constructor", this).apply(this, arguments);

    this.recordable = true;
    this.wise = null;
    this.target = null;
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
    this.targetSelected = null;
    this.input = null;
    this.readInputAfterExecute = false;
    this.bufferCheckpointByPurpose = {};
  }

  _createClass(Operator, [{
    key: "isReady",
    value: function isReady() {
      return this.target && this.target.isReady();
    }

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
      this.bufferCheckpointByPurpose[purpose] = this.editor.createCheckpoint();
    }
  }, {
    key: "getBufferCheckpoint",
    value: function getBufferCheckpoint(purpose) {
      return this.bufferCheckpointByPurpose[purpose];
    }
  }, {
    key: "groupChangesSinceBufferCheckpoint",
    value: function groupChangesSinceBufferCheckpoint(purpose) {
      var checkpoint = this.getBufferCheckpoint(purpose);
      if (checkpoint) {
        this.editor.groupChangesSinceCheckpoint(checkpoint);
        delete this.bufferCheckpointByPurpose[purpose];
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

      if (this.mode === "visual") {
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

      var wise = this.occurrenceSelected ? this.occurrenceWise : this.target.wise;
      if (wise === "linewise" && !text.endsWith("\n")) {
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
      this.normalizeSelectionsIfNecessary();
      this.editor.transact(fn);
      this.emitDidFinishMutation();
    }
  }, {
    key: "mutateSelections",
    value: function mutateSelections() {
      for (var selection of this.editor.getSelectionsOrderedByBufferPosition()) {
        this.mutateSelection(selection);
      }
      this.mutationManager.setCheckpoint("did-finish");
      this.restoreCursorPositionsIfNecessary();
    }

    // Main
  }, {
    key: "execute",
    value: function execute() {
      var _this5 = this;

      if (this.readInputAfterExecute && !this.repeated) {
        return this.executeAsyncToReadInputAfterExecute();
      }

      this.startMutation(function () {
        if (_this5.selectTarget()) _this5.mutateSelections();
      });

      // Even though we fail to select target and fail to mutate,
      // we have to return to normal-mode from operator-pending or visual
      this.activateMode("normal");
    }
  }, {
    key: "executeAsyncToReadInputAfterExecute",
    value: _asyncToGenerator(function* () {
      this.normalizeSelectionsIfNecessary();
      this.createBufferCheckpoint("undo");

      if (this.selectTarget()) {
        try {
          this.input = yield this.focusInputPromisified(this.focusInputOptions);
        } catch (e) {
          if (this.mode !== "visual") {
            this.editor.revertToCheckpoint(this.getBufferCheckpoint("undo"));
            this.activateMode("normal");
          }
          return;
        }
        this.mutateSelections();
        this.groupChangesSinceBufferCheckpoint("undo");
      }

      this.emitDidFinishMutation();
      this.activateMode("normal");
    })

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
      var _this6 = this;

      this.startMutation(function () {
        return _this6.selectTarget();
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

// VisualModeSelect: used in visual-mode
// When text-object is invoked from normal or viusal-mode, operation would be
//  => VisualModeSelect operator with target=text-object
// When motion is invoked from visual-mode, operation would be
//  => VisualModeSelect operator with target=motion)
// ================================
// VisualModeSelect is used in TWO situation.
// - visual-mode operation
//   - e.g: `v l`, `V j`, `v i p`...
// - Directly invoke text-object from normal-mode
//   - e.g: Invoke `Inner Paragraph` from command-palette.

var VisualModeSelect = (function (_SelectBase6) {
  _inherits(VisualModeSelect, _SelectBase6);

  function VisualModeSelect() {
    _classCallCheck(this, VisualModeSelect);

    _get(Object.getPrototypeOf(VisualModeSelect.prototype), "constructor", this).apply(this, arguments);

    this.acceptPresetOccurrence = false;
    this.acceptPersistentSelection = false;
  }

  return VisualModeSelect;
})(SelectBase);

VisualModeSelect.register(false);

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
    key: "initialize",
    value: function initialize() {
      if (this.isMode("normal")) {
        var point = this.editor.getCursorBufferPosition();
        var marker = this.persistentSelection.getMarkerAtPoint(point);
        if (marker) this.target = "Empty";
      }
      _get(Object.getPrototypeOf(TogglePersistentSelection.prototype), "initialize", this).call(this);
    }
  }, {
    key: "mutateSelection",
    value: function mutateSelection(selection) {
      var point = this.getCursorPositionForSelection(selection);
      var marker = this.persistentSelection.getMarkerAtPoint(point);
      if (marker) {
        marker.destroy();
      } else {
        _get(Object.getPrototypeOf(TogglePersistentSelection.prototype), "mutateSelection", this).call(this, selection);
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
      var _this7 = this;

      this.onDidSelectTarget(function () {
        if (_this7.occurrenceSelected && _this7.occurrenceWise === "linewise") {
          _this7.flashTarget = false;
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
      var _this8 = this;

      this.onDidSelectTarget(function () {
        if (_this8.target.wise === "blockwise") {
          for (var blockwiseSelection of _this8.getBlockwiseSelections()) {
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
      var _this9 = this;

      var newRanges = [];
      this.scanForward(this.regex, { scanRange: scanRange }, function (event) {
        if (fn) {
          if (fn(event)) event.stop();else return;
        }
        var nextNumber = _this9.getNextNumber(event.matchText);
        newRanges.push(event.replace(String(nextNumber)));
      });
      return newRanges;
    }
  }, {
    key: "mutateSelection",
    value: function mutateSelection(selection) {
      var _this10 = this;

      var cursor = selection.cursor;

      if (this.target.name === "Empty") {
        (function () {
          // ctrl-a, ctrl-x in `normal-mode`
          var cursorPosition = cursor.getBufferPosition();
          var scanRange = _this10.editor.bufferRangeForBufferRow(cursorPosition.row);
          var newRanges = _this10.replaceNumberInBufferRange(scanRange, function (event) {
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
      var _this11 = this;

      this.mutationsBySelection = new Map();
      this.sequentialPaste = this.vimState.sequentialPasteManager.onExecute(this);

      this.onDidFinishMutation(function () {
        if (!_this11.cancelled) _this11.adjustCursorPosition();
      });

      _get(Object.getPrototypeOf(PutBefore.prototype), "execute", this).call(this);

      if (this.cancelled) return;

      this.onDidFinishOperation(function () {
        // TrackChange
        var newRange = _this11.mutationsBySelection.get(_this11.editor.getLastSelection());
        if (newRange) _this11.setMarkForChange(newRange);

        // Flash
        if (_this11.getConfig("flashOnOperate") && !_this11.getConfig("flashOnOperateBlacklist").includes(_this11.name)) {
          var ranges = _this11.editor.getSelections().map(function (selection) {
            return _this11.mutationsBySelection.get(selection);
          });
          _this11.vimState.flash(ranges, { type: _this11.getFlashType() });
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
// ctrl-a in normal-mode find target number in current line manually
// do manually
// do manually
// manage manually
// manage manually
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL29wZXJhdG9yLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFdBQVcsQ0FBQTs7Ozs7Ozs7Ozs7Ozs7QUFFWCxJQUFNLENBQUMsR0FBRyxPQUFPLENBQUMsaUJBQWlCLENBQUMsQ0FBQTtBQUNwQyxJQUFNLElBQUksR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUE7O0lBRXhCLFFBQVE7WUFBUixRQUFROztXQUFSLFFBQVE7MEJBQVIsUUFBUTs7K0JBQVIsUUFBUTs7U0FFWixVQUFVLEdBQUcsSUFBSTtTQUVqQixJQUFJLEdBQUcsSUFBSTtTQUNYLE1BQU0sR0FBRyxJQUFJO1NBQ2IsVUFBVSxHQUFHLEtBQUs7U0FDbEIsY0FBYyxHQUFHLE1BQU07U0FFdkIsV0FBVyxHQUFHLElBQUk7U0FDbEIsZUFBZSxHQUFHLFlBQVk7U0FDOUIsU0FBUyxHQUFHLFVBQVU7U0FDdEIsc0JBQXNCLEdBQUcscUJBQXFCO1NBQzlDLFdBQVcsR0FBRyxLQUFLO1NBRW5CLG9CQUFvQixHQUFHLElBQUk7U0FDM0Isa0JBQWtCLEdBQUcsSUFBSTtTQUN6QixjQUFjLEdBQUcsSUFBSTtTQUNyQixZQUFZLEdBQUcsS0FBSztTQUNwQixnQkFBZ0IsR0FBRyxJQUFJO1NBQ3ZCLDZCQUE2QixHQUFHLEtBQUs7U0FFckMsc0JBQXNCLEdBQUcsSUFBSTtTQUM3Qix5QkFBeUIsR0FBRyxJQUFJO1NBRWhDLHlCQUF5QixHQUFHLElBQUk7U0FFaEMsY0FBYyxHQUFHLElBQUk7U0FDckIsS0FBSyxHQUFHLElBQUk7U0FDWixxQkFBcUIsR0FBRyxLQUFLO1NBQzdCLHlCQUF5QixHQUFHLEVBQUU7OztlQTlCMUIsUUFBUTs7V0FnQ0wsbUJBQUc7QUFDUixhQUFPLElBQUksQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQTtLQUM1Qzs7Ozs7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TUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUE7S0FDL0U7OztTQVpHLGlCQUFpQjtHQUFTLFFBQVE7O0FBY3hDLGlCQUFpQixDQUFDLFFBQVEsRUFBRSxDQUFBOztJQUV0QixpQkFBaUI7WUFBakIsaUJBQWlCOztXQUFqQixpQkFBaUI7MEJBQWpCLGlCQUFpQjs7K0JBQWpCLGlCQUFpQjs7U0FDckIsS0FBSyxHQUFHLE9BQU87OztTQURYLGlCQUFpQjtHQUFTLGlCQUFpQjs7QUFHakQsaUJBQWlCLENBQUMsUUFBUSxFQUFFLENBQUEiLCJmaWxlIjoiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvb3BlcmF0b3IuanMiLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBiYWJlbFwiXG5cbmNvbnN0IF8gPSByZXF1aXJlKFwidW5kZXJzY29yZS1wbHVzXCIpXG5jb25zdCBCYXNlID0gcmVxdWlyZShcIi4vYmFzZVwiKVxuXG5jbGFzcyBPcGVyYXRvciBleHRlbmRzIEJhc2Uge1xuICBzdGF0aWMgb3BlcmF0aW9uS2luZCA9IFwib3BlcmF0b3JcIlxuICByZWNvcmRhYmxlID0gdHJ1ZVxuXG4gIHdpc2UgPSBudWxsXG4gIHRhcmdldCA9IG51bGxcbiAgb2NjdXJyZW5jZSA9IGZhbHNlXG4gIG9jY3VycmVuY2VUeXBlID0gXCJiYXNlXCJcblxuICBmbGFzaFRhcmdldCA9IHRydWVcbiAgZmxhc2hDaGVja3BvaW50ID0gXCJkaWQtZmluaXNoXCJcbiAgZmxhc2hUeXBlID0gXCJvcGVyYXRvclwiXG4gIGZsYXNoVHlwZUZvck9jY3VycmVuY2UgPSBcIm9wZXJhdG9yLW9jY3VycmVuY2VcIlxuICB0cmFja0NoYW5nZSA9IGZhbHNlXG5cbiAgcGF0dGVybkZvck9jY3VycmVuY2UgPSBudWxsXG4gIHN0YXlBdFNhbWVQb3NpdGlvbiA9IG51bGxcbiAgc3RheU9wdGlvbk5hbWUgPSBudWxsXG4gIHN0YXlCeU1hcmtlciA9IGZhbHNlXG4gIHJlc3RvcmVQb3NpdGlvbnMgPSB0cnVlXG4gIHNldFRvRmlyc3RDaGFyYWN0ZXJPbkxpbmV3aXNlID0gZmFsc2VcblxuICBhY2NlcHRQcmVzZXRPY2N1cnJlbmNlID0gdHJ1ZVxuICBhY2NlcHRQZXJzaXN0ZW50U2VsZWN0aW9uID0gdHJ1ZVxuXG4gIGJ1ZmZlckNoZWNrcG9pbnRCeVB1cnBvc2UgPSBudWxsXG5cbiAgdGFyZ2V0U2VsZWN0ZWQgPSBudWxsXG4gIGlucHV0ID0gbnVsbFxuICByZWFkSW5wdXRBZnRlckV4ZWN1dGUgPSBmYWxzZVxuICBidWZmZXJDaGVja3BvaW50QnlQdXJwb3NlID0ge31cblxuICBpc1JlYWR5KCkge1xuICAgIHJldHVybiB0aGlzLnRhcmdldCAmJiB0aGlzLnRhcmdldC5pc1JlYWR5KClcbiAgfVxuXG4gIC8vIENhbGxlZCB3aGVuIG9wZXJhdGlvbiBmaW5pc2hlZFxuICAvLyBUaGlzIGlzIGVzc2VudGlhbGx5IHRvIHJlc2V0IHN0YXRlIGZvciBgLmAgcmVwZWF0LlxuICByZXNldFN0YXRlKCkge1xuICAgIHRoaXMudGFyZ2V0U2VsZWN0ZWQgPSBudWxsXG4gICAgdGhpcy5vY2N1cnJlbmNlU2VsZWN0ZWQgPSBmYWxzZVxuICB9XG5cbiAgLy8gVHdvIGNoZWNrcG9pbnQgZm9yIGRpZmZlcmVudCBwdXJwb3NlXG4gIC8vIC0gb25lIGZvciB1bmRvKGhhbmRsZWQgYnkgbW9kZU1hbmFnZXIpXG4gIC8vIC0gb25lIGZvciBwcmVzZXJ2ZSBsYXN0IGluc2VydGVkIHRleHRcbiAgY3JlYXRlQnVmZmVyQ2hlY2twb2ludChwdXJwb3NlKSB7XG4gICAgdGhpcy5idWZmZXJDaGVja3BvaW50QnlQdXJwb3NlW3B1cnBvc2VdID0gdGhpcy5lZGl0b3IuY3JlYXRlQ2hlY2twb2ludCgpXG4gIH1cblxuICBnZXRCdWZmZXJDaGVja3BvaW50KHB1cnBvc2UpIHtcbiAgICByZXR1cm4gdGhpcy5idWZmZXJDaGVja3BvaW50QnlQdXJwb3NlW3B1cnBvc2VdXG4gIH1cblxuICBncm91cENoYW5nZXNTaW5jZUJ1ZmZlckNoZWNrcG9pbnQocHVycG9zZSkge1xuICAgIGNvbnN0IGNoZWNrcG9pbnQgPSB0aGlzLmdldEJ1ZmZlckNoZWNrcG9pbnQocHVycG9zZSlcbiAgICBpZiAoY2hlY2twb2ludCkge1xuICAgICAgdGhpcy5lZGl0b3IuZ3JvdXBDaGFuZ2VzU2luY2VDaGVja3BvaW50KGNoZWNrcG9pbnQpXG4gICAgICBkZWxldGUgdGhpcy5idWZmZXJDaGVja3BvaW50QnlQdXJwb3NlW3B1cnBvc2VdXG4gICAgfVxuICB9XG5cbiAgc2V0TWFya0ZvckNoYW5nZShyYW5nZSkge1xuICAgIHRoaXMudmltU3RhdGUubWFyay5zZXQoXCJbXCIsIHJhbmdlLnN0YXJ0KVxuICAgIHRoaXMudmltU3RhdGUubWFyay5zZXQoXCJdXCIsIHJhbmdlLmVuZClcbiAgfVxuXG4gIG5lZWRGbGFzaCgpIHtcbiAgICByZXR1cm4gKFxuICAgICAgdGhpcy5mbGFzaFRhcmdldCAmJlxuICAgICAgdGhpcy5nZXRDb25maWcoXCJmbGFzaE9uT3BlcmF0ZVwiKSAmJlxuICAgICAgIXRoaXMuZ2V0Q29uZmlnKFwiZmxhc2hPbk9wZXJhdGVCbGFja2xpc3RcIikuaW5jbHVkZXModGhpcy5uYW1lKSAmJlxuICAgICAgKHRoaXMubW9kZSAhPT0gXCJ2aXN1YWxcIiB8fCB0aGlzLnN1Ym1vZGUgIT09IHRoaXMudGFyZ2V0Lndpc2UpIC8vIGUuZy4gWSBpbiB2Q1xuICAgIClcbiAgfVxuXG4gIGZsYXNoSWZOZWNlc3NhcnkocmFuZ2VzKSB7XG4gICAgaWYgKHRoaXMubmVlZEZsYXNoKCkpIHtcbiAgICAgIHRoaXMudmltU3RhdGUuZmxhc2gocmFuZ2VzLCB7dHlwZTogdGhpcy5nZXRGbGFzaFR5cGUoKX0pXG4gICAgfVxuICB9XG5cbiAgZmxhc2hDaGFuZ2VJZk5lY2Vzc2FyeSgpIHtcbiAgICBpZiAodGhpcy5uZWVkRmxhc2goKSkge1xuICAgICAgdGhpcy5vbkRpZEZpbmlzaE9wZXJhdGlvbigoKSA9PiB7XG4gICAgICAgIGNvbnN0IHJhbmdlcyA9IHRoaXMubXV0YXRpb25NYW5hZ2VyLmdldFNlbGVjdGVkQnVmZmVyUmFuZ2VzRm9yQ2hlY2twb2ludCh0aGlzLmZsYXNoQ2hlY2twb2ludClcbiAgICAgICAgdGhpcy52aW1TdGF0ZS5mbGFzaChyYW5nZXMsIHt0eXBlOiB0aGlzLmdldEZsYXNoVHlwZSgpfSlcbiAgICAgIH0pXG4gICAgfVxuICB9XG5cbiAgZ2V0Rmxhc2hUeXBlKCkge1xuICAgIHJldHVybiB0aGlzLm9jY3VycmVuY2VTZWxlY3RlZCA/IHRoaXMuZmxhc2hUeXBlRm9yT2NjdXJyZW5jZSA6IHRoaXMuZmxhc2hUeXBlXG4gIH1cblxuICB0cmFja0NoYW5nZUlmTmVjZXNzYXJ5KCkge1xuICAgIGlmICghdGhpcy50cmFja0NoYW5nZSkgcmV0dXJuXG4gICAgdGhpcy5vbkRpZEZpbmlzaE9wZXJhdGlvbigoKSA9PiB7XG4gICAgICBjb25zdCByYW5nZSA9IHRoaXMubXV0YXRpb25NYW5hZ2VyLmdldE11dGF0ZWRCdWZmZXJSYW5nZUZvclNlbGVjdGlvbih0aGlzLmVkaXRvci5nZXRMYXN0U2VsZWN0aW9uKCkpXG4gICAgICBpZiAocmFuZ2UpIHRoaXMuc2V0TWFya0ZvckNoYW5nZShyYW5nZSlcbiAgICB9KVxuICB9XG5cbiAgaW5pdGlhbGl6ZSgpIHtcbiAgICB0aGlzLnN1YnNjcmliZVJlc2V0T2NjdXJyZW5jZVBhdHRlcm5JZk5lZWRlZCgpXG5cbiAgICAvLyBXaGVuIHByZXNldC1vY2N1cnJlbmNlIHdhcyBleGlzdHMsIG9wZXJhdGUgb24gb2NjdXJyZW5jZS13aXNlXG4gICAgaWYgKHRoaXMuYWNjZXB0UHJlc2V0T2NjdXJyZW5jZSAmJiB0aGlzLm9jY3VycmVuY2VNYW5hZ2VyLmhhc01hcmtlcnMoKSkge1xuICAgICAgdGhpcy5vY2N1cnJlbmNlID0gdHJ1ZVxuICAgIH1cblxuICAgIC8vIFtGSVhNRV0gT1JERVItTUFUVEVSXG4gICAgLy8gVG8gcGljayBjdXJzb3Itd29yZCB0byBmaW5kIG9jY3VycmVuY2UgYmFzZSBwYXR0ZXJuLlxuICAgIC8vIFRoaXMgaGFzIHRvIGJlIGRvbmUgQkVGT1JFIGNvbnZlcnRpbmcgcGVyc2lzdGVudC1zZWxlY3Rpb24gaW50byByZWFsLXNlbGVjdGlvbi5cbiAgICAvLyBTaW5jZSB3aGVuIHBlcnNpc3RlbnQtc2VsZWN0aW9uIGlzIGFjdHVhbGx5IHNlbGVjdGVkLCBpdCBjaGFuZ2UgY3Vyc29yIHBvc2l0aW9uLlxuICAgIGlmICh0aGlzLm9jY3VycmVuY2UgJiYgIXRoaXMub2NjdXJyZW5jZU1hbmFnZXIuaGFzTWFya2VycygpKSB7XG4gICAgICBjb25zdCByZWdleCA9IHRoaXMucGF0dGVybkZvck9jY3VycmVuY2UgfHwgdGhpcy5nZXRQYXR0ZXJuRm9yT2NjdXJyZW5jZVR5cGUodGhpcy5vY2N1cnJlbmNlVHlwZSlcbiAgICAgIHRoaXMub2NjdXJyZW5jZU1hbmFnZXIuYWRkUGF0dGVybihyZWdleClcbiAgICB9XG5cbiAgICAvLyBUaGlzIGNoYW5nZSBjdXJzb3IgcG9zaXRpb24uXG4gICAgaWYgKHRoaXMuc2VsZWN0UGVyc2lzdGVudFNlbGVjdGlvbklmTmVjZXNzYXJ5KCkpIHtcbiAgICAgIC8vIFtGSVhNRV0gc2VsZWN0aW9uLXdpc2UgaXMgbm90IHN5bmNoZWQgaWYgaXQgYWxyZWFkeSB2aXN1YWwtbW9kZVxuICAgICAgaWYgKHRoaXMubW9kZSAhPT0gXCJ2aXN1YWxcIikge1xuICAgICAgICB0aGlzLnZpbVN0YXRlLm1vZGVNYW5hZ2VyLmFjdGl2YXRlKFwidmlzdWFsXCIsIHRoaXMuc3dyYXAuZGV0ZWN0V2lzZSh0aGlzLmVkaXRvcikpXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHRoaXMubW9kZSA9PT0gXCJ2aXN1YWxcIikge1xuICAgICAgdGhpcy50YXJnZXQgPSBcIkN1cnJlbnRTZWxlY3Rpb25cIlxuICAgIH1cbiAgICBpZiAoXy5pc1N0cmluZyh0aGlzLnRhcmdldCkpIHtcbiAgICAgIHRoaXMuc2V0VGFyZ2V0KHRoaXMuZ2V0SW5zdGFuY2UodGhpcy50YXJnZXQpKVxuICAgIH1cblxuICAgIHN1cGVyLmluaXRpYWxpemUoKVxuICB9XG5cbiAgc3Vic2NyaWJlUmVzZXRPY2N1cnJlbmNlUGF0dGVybklmTmVlZGVkKCkge1xuICAgIC8vIFtDQVVUSU9OXVxuICAgIC8vIFRoaXMgbWV0aG9kIGhhcyB0byBiZSBjYWxsZWQgaW4gUFJPUEVSIHRpbWluZy5cbiAgICAvLyBJZiBvY2N1cnJlbmNlIGlzIHRydWUgYnV0IG5vIHByZXNldC1vY2N1cnJlbmNlXG4gICAgLy8gVHJlYXQgdGhhdCBgb2NjdXJyZW5jZWAgaXMgQk9VTkRFRCB0byBvcGVyYXRvciBpdHNlbGYsIHNvIGNsZWFucCBhdCBmaW5pc2hlZC5cbiAgICBpZiAodGhpcy5vY2N1cnJlbmNlICYmICF0aGlzLm9jY3VycmVuY2VNYW5hZ2VyLmhhc01hcmtlcnMoKSkge1xuICAgICAgdGhpcy5vbkRpZFJlc2V0T3BlcmF0aW9uU3RhY2soKCkgPT4gdGhpcy5vY2N1cnJlbmNlTWFuYWdlci5yZXNldFBhdHRlcm5zKCkpXG4gICAgfVxuICB9XG5cbiAgc2V0TW9kaWZpZXIoe3dpc2UsIG9jY3VycmVuY2UsIG9jY3VycmVuY2VUeXBlfSkge1xuICAgIGlmICh3aXNlKSB7XG4gICAgICB0aGlzLndpc2UgPSB3aXNlXG4gICAgfSBlbHNlIGlmIChvY2N1cnJlbmNlKSB7XG4gICAgICB0aGlzLm9jY3VycmVuY2UgPSBvY2N1cnJlbmNlXG4gICAgICB0aGlzLm9jY3VycmVuY2VUeXBlID0gb2NjdXJyZW5jZVR5cGVcbiAgICAgIC8vIFRoaXMgaXMgbyBtb2RpZmllciBjYXNlKGUuZy4gYGMgbyBwYCwgYGQgTyBmYClcbiAgICAgIC8vIFdlIFJFU0VUIGV4aXN0aW5nIG9jY3VyZW5jZS1tYXJrZXIgd2hlbiBgb2Agb3IgYE9gIG1vZGlmaWVyIGlzIHR5cGVkIGJ5IHVzZXIuXG4gICAgICBjb25zdCByZWdleCA9IHRoaXMuZ2V0UGF0dGVybkZvck9jY3VycmVuY2VUeXBlKG9jY3VycmVuY2VUeXBlKVxuICAgICAgdGhpcy5vY2N1cnJlbmNlTWFuYWdlci5hZGRQYXR0ZXJuKHJlZ2V4LCB7cmVzZXQ6IHRydWUsIG9jY3VycmVuY2VUeXBlfSlcbiAgICAgIHRoaXMub25EaWRSZXNldE9wZXJhdGlvblN0YWNrKCgpID0+IHRoaXMub2NjdXJyZW5jZU1hbmFnZXIucmVzZXRQYXR0ZXJucygpKVxuICAgIH1cbiAgfVxuXG4gIC8vIHJldHVybiB0cnVlL2ZhbHNlIHRvIGluZGljYXRlIHN1Y2Nlc3NcbiAgc2VsZWN0UGVyc2lzdGVudFNlbGVjdGlvbklmTmVjZXNzYXJ5KCkge1xuICAgIGlmIChcbiAgICAgIHRoaXMuYWNjZXB0UGVyc2lzdGVudFNlbGVjdGlvbiAmJlxuICAgICAgdGhpcy5nZXRDb25maWcoXCJhdXRvU2VsZWN0UGVyc2lzdGVudFNlbGVjdGlvbk9uT3BlcmF0ZVwiKSAmJlxuICAgICAgIXRoaXMucGVyc2lzdGVudFNlbGVjdGlvbi5pc0VtcHR5KClcbiAgICApIHtcbiAgICAgIHRoaXMucGVyc2lzdGVudFNlbGVjdGlvbi5zZWxlY3QoKVxuICAgICAgdGhpcy5lZGl0b3IubWVyZ2VJbnRlcnNlY3RpbmdTZWxlY3Rpb25zKClcbiAgICAgIHRoaXMuc3dyYXAuc2F2ZVByb3BlcnRpZXModGhpcy5lZGl0b3IpXG5cbiAgICAgIHJldHVybiB0cnVlXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cbiAgfVxuXG4gIGdldFBhdHRlcm5Gb3JPY2N1cnJlbmNlVHlwZShvY2N1cnJlbmNlVHlwZSkge1xuICAgIGlmIChvY2N1cnJlbmNlVHlwZSA9PT0gXCJiYXNlXCIpIHtcbiAgICAgIHJldHVybiB0aGlzLnV0aWxzLmdldFdvcmRQYXR0ZXJuQXRCdWZmZXJQb3NpdGlvbih0aGlzLmVkaXRvciwgdGhpcy5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpKVxuICAgIH0gZWxzZSBpZiAob2NjdXJyZW5jZVR5cGUgPT09IFwic3Vid29yZFwiKSB7XG4gICAgICByZXR1cm4gdGhpcy51dGlscy5nZXRTdWJ3b3JkUGF0dGVybkF0QnVmZmVyUG9zaXRpb24odGhpcy5lZGl0b3IsIHRoaXMuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKSlcbiAgICB9XG4gIH1cblxuICAvLyB0YXJnZXQgaXMgVGV4dE9iamVjdCBvciBNb3Rpb24gdG8gb3BlcmF0ZSBvbi5cbiAgc2V0VGFyZ2V0KHRhcmdldCkge1xuICAgIHRoaXMudGFyZ2V0ID0gdGFyZ2V0XG4gICAgdGhpcy50YXJnZXQub3BlcmF0b3IgPSB0aGlzXG4gICAgdGhpcy5lbWl0RGlkU2V0VGFyZ2V0KHRoaXMpXG4gIH1cblxuICBzZXRUZXh0VG9SZWdpc3RlckZvclNlbGVjdGlvbihzZWxlY3Rpb24pIHtcbiAgICB0aGlzLnNldFRleHRUb1JlZ2lzdGVyKHNlbGVjdGlvbi5nZXRUZXh0KCksIHNlbGVjdGlvbilcbiAgfVxuXG4gIHNldFRleHRUb1JlZ2lzdGVyKHRleHQsIHNlbGVjdGlvbikge1xuICAgIGlmICh0aGlzLnZpbVN0YXRlLnJlZ2lzdGVyLmlzVW5uYW1lZCgpICYmIHRoaXMuaXNCbGFja2hvbGVSZWdpc3RlcmVkT3BlcmF0b3IoKSkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgY29uc3Qgd2lzZSA9IHRoaXMub2NjdXJyZW5jZVNlbGVjdGVkID8gdGhpcy5vY2N1cnJlbmNlV2lzZSA6IHRoaXMudGFyZ2V0Lndpc2VcbiAgICBpZiAod2lzZSA9PT0gXCJsaW5ld2lzZVwiICYmICF0ZXh0LmVuZHNXaXRoKFwiXFxuXCIpKSB7XG4gICAgICB0ZXh0ICs9IFwiXFxuXCJcbiAgICB9XG5cbiAgICBpZiAodGV4dCkge1xuICAgICAgdGhpcy52aW1TdGF0ZS5yZWdpc3Rlci5zZXQobnVsbCwge3RleHQsIHNlbGVjdGlvbn0pXG5cbiAgICAgIGlmICh0aGlzLnZpbVN0YXRlLnJlZ2lzdGVyLmlzVW5uYW1lZCgpKSB7XG4gICAgICAgIGlmICh0aGlzLmluc3RhbmNlb2YoXCJEZWxldGVcIikgfHwgdGhpcy5pbnN0YW5jZW9mKFwiQ2hhbmdlXCIpKSB7XG4gICAgICAgICAgaWYgKCF0aGlzLm5lZWRTYXZlVG9OdW1iZXJlZFJlZ2lzdGVyKHRoaXMudGFyZ2V0KSAmJiB0aGlzLnV0aWxzLmlzU2luZ2xlTGluZVRleHQodGV4dCkpIHtcbiAgICAgICAgICAgIHRoaXMudmltU3RhdGUucmVnaXN0ZXIuc2V0KFwiLVwiLCB7dGV4dCwgc2VsZWN0aW9ufSkgLy8gc21hbGwtY2hhbmdlXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMudmltU3RhdGUucmVnaXN0ZXIuc2V0KFwiMVwiLCB7dGV4dCwgc2VsZWN0aW9ufSlcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5pbnN0YW5jZW9mKFwiWWFua1wiKSkge1xuICAgICAgICAgIHRoaXMudmltU3RhdGUucmVnaXN0ZXIuc2V0KFwiMFwiLCB7dGV4dCwgc2VsZWN0aW9ufSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGlzQmxhY2tob2xlUmVnaXN0ZXJlZE9wZXJhdG9yKCkge1xuICAgIGNvbnN0IG9wZXJhdG9ycyA9IHRoaXMuZ2V0Q29uZmlnKFwiYmxhY2tob2xlUmVnaXN0ZXJlZE9wZXJhdG9yc1wiKVxuICAgIGNvbnN0IHdpbGRDYXJkT3BlcmF0b3JzID0gb3BlcmF0b3JzLmZpbHRlcihuYW1lID0+IG5hbWUuZW5kc1dpdGgoXCIqXCIpKVxuICAgIGNvbnN0IGNvbW1hbmROYW1lID0gdGhpcy5nZXRDb21tYW5kTmFtZVdpdGhvdXRQcmVmaXgoKVxuICAgIHJldHVybiAoXG4gICAgICB3aWxkQ2FyZE9wZXJhdG9ycy5zb21lKG5hbWUgPT4gbmV3IFJlZ0V4cChcIl5cIiArIG5hbWUucmVwbGFjZShcIipcIiwgXCIuKlwiKSkudGVzdChjb21tYW5kTmFtZSkpIHx8XG4gICAgICBvcGVyYXRvcnMuaW5jbHVkZXMoY29tbWFuZE5hbWUpXG4gICAgKVxuICB9XG5cbiAgbmVlZFNhdmVUb051bWJlcmVkUmVnaXN0ZXIodGFyZ2V0KSB7XG4gICAgLy8gVXNlZCB0byBkZXRlcm1pbmUgd2hhdCByZWdpc3RlciB0byB1c2Ugb24gY2hhbmdlIGFuZCBkZWxldGUgb3BlcmF0aW9uLlxuICAgIC8vIEZvbGxvd2luZyBtb3Rpb24gc2hvdWxkIHNhdmUgdG8gMS05IHJlZ2lzdGVyIHJlZ2VyZGxlc3Mgb2YgY29udGVudCBpcyBzbWFsbCBvciBiaWcuXG4gICAgY29uc3QgZ29lc1RvTnVtYmVyZWRSZWdpc3Rlck1vdGlvbk5hbWVzID0gW1xuICAgICAgXCJNb3ZlVG9QYWlyXCIsIC8vICVcbiAgICAgIFwiTW92ZVRvTmV4dFNlbnRlbmNlXCIsIC8vICgsIClcbiAgICAgIFwiU2VhcmNoXCIsIC8vIC8sID8sIG4sIE5cbiAgICAgIFwiTW92ZVRvTmV4dFBhcmFncmFwaFwiLCAvLyB7LCB9XG4gICAgXVxuICAgIHJldHVybiBnb2VzVG9OdW1iZXJlZFJlZ2lzdGVyTW90aW9uTmFtZXMuc29tZShuYW1lID0+IHRhcmdldC5pbnN0YW5jZW9mKG5hbWUpKVxuICB9XG5cbiAgbm9ybWFsaXplU2VsZWN0aW9uc0lmTmVjZXNzYXJ5KCkge1xuICAgIGlmICh0aGlzLm1vZGUgPT09IFwidmlzdWFsXCIgJiYgdGhpcy50YXJnZXQgJiYgdGhpcy50YXJnZXQuaXNNb3Rpb24oKSkge1xuICAgICAgdGhpcy5zd3JhcC5ub3JtYWxpemUodGhpcy5lZGl0b3IpXG4gICAgfVxuICB9XG5cbiAgc3RhcnRNdXRhdGlvbihmbikge1xuICAgIHRoaXMubm9ybWFsaXplU2VsZWN0aW9uc0lmTmVjZXNzYXJ5KClcbiAgICB0aGlzLmVkaXRvci50cmFuc2FjdChmbilcbiAgICB0aGlzLmVtaXREaWRGaW5pc2hNdXRhdGlvbigpXG4gIH1cblxuICBtdXRhdGVTZWxlY3Rpb25zKCkge1xuICAgIGZvciAoY29uc3Qgc2VsZWN0aW9uIG9mIHRoaXMuZWRpdG9yLmdldFNlbGVjdGlvbnNPcmRlcmVkQnlCdWZmZXJQb3NpdGlvbigpKSB7XG4gICAgICB0aGlzLm11dGF0ZVNlbGVjdGlvbihzZWxlY3Rpb24pXG4gICAgfVxuICAgIHRoaXMubXV0YXRpb25NYW5hZ2VyLnNldENoZWNrcG9pbnQoXCJkaWQtZmluaXNoXCIpXG4gICAgdGhpcy5yZXN0b3JlQ3Vyc29yUG9zaXRpb25zSWZOZWNlc3NhcnkoKVxuICB9XG5cbiAgLy8gTWFpblxuICBleGVjdXRlKCkge1xuICAgIGlmICh0aGlzLnJlYWRJbnB1dEFmdGVyRXhlY3V0ZSAmJiAhdGhpcy5yZXBlYXRlZCkge1xuICAgICAgcmV0dXJuIHRoaXMuZXhlY3V0ZUFzeW5jVG9SZWFkSW5wdXRBZnRlckV4ZWN1dGUoKVxuICAgIH1cblxuICAgIHRoaXMuc3RhcnRNdXRhdGlvbigoKSA9PiB7XG4gICAgICBpZiAodGhpcy5zZWxlY3RUYXJnZXQoKSkgdGhpcy5tdXRhdGVTZWxlY3Rpb25zKClcbiAgICB9KVxuXG4gICAgLy8gRXZlbiB0aG91Z2ggd2UgZmFpbCB0byBzZWxlY3QgdGFyZ2V0IGFuZCBmYWlsIHRvIG11dGF0ZSxcbiAgICAvLyB3ZSBoYXZlIHRvIHJldHVybiB0byBub3JtYWwtbW9kZSBmcm9tIG9wZXJhdG9yLXBlbmRpbmcgb3IgdmlzdWFsXG4gICAgdGhpcy5hY3RpdmF0ZU1vZGUoXCJub3JtYWxcIilcbiAgfVxuXG4gIGFzeW5jIGV4ZWN1dGVBc3luY1RvUmVhZElucHV0QWZ0ZXJFeGVjdXRlKCkge1xuICAgIHRoaXMubm9ybWFsaXplU2VsZWN0aW9uc0lmTmVjZXNzYXJ5KClcbiAgICB0aGlzLmNyZWF0ZUJ1ZmZlckNoZWNrcG9pbnQoXCJ1bmRvXCIpXG5cbiAgICBpZiAodGhpcy5zZWxlY3RUYXJnZXQoKSkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgdGhpcy5pbnB1dCA9IGF3YWl0IHRoaXMuZm9jdXNJbnB1dFByb21pc2lmaWVkKHRoaXMuZm9jdXNJbnB1dE9wdGlvbnMpXG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGlmICh0aGlzLm1vZGUgIT09IFwidmlzdWFsXCIpIHtcbiAgICAgICAgICB0aGlzLmVkaXRvci5yZXZlcnRUb0NoZWNrcG9pbnQodGhpcy5nZXRCdWZmZXJDaGVja3BvaW50KFwidW5kb1wiKSlcbiAgICAgICAgICB0aGlzLmFjdGl2YXRlTW9kZShcIm5vcm1hbFwiKVxuICAgICAgICB9XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgdGhpcy5tdXRhdGVTZWxlY3Rpb25zKClcbiAgICAgIHRoaXMuZ3JvdXBDaGFuZ2VzU2luY2VCdWZmZXJDaGVja3BvaW50KFwidW5kb1wiKVxuICAgIH1cblxuICAgIHRoaXMuZW1pdERpZEZpbmlzaE11dGF0aW9uKClcbiAgICB0aGlzLmFjdGl2YXRlTW9kZShcIm5vcm1hbFwiKVxuICB9XG5cbiAgLy8gUmV0dXJuIHRydWUgdW5sZXNzIGFsbCBzZWxlY3Rpb24gaXMgZW1wdHkuXG4gIHNlbGVjdFRhcmdldCgpIHtcbiAgICBpZiAodGhpcy50YXJnZXRTZWxlY3RlZCAhPSBudWxsKSB7XG4gICAgICByZXR1cm4gdGhpcy50YXJnZXRTZWxlY3RlZFxuICAgIH1cbiAgICB0aGlzLm11dGF0aW9uTWFuYWdlci5pbml0KHtzdGF5QnlNYXJrZXI6IHRoaXMuc3RheUJ5TWFya2VyfSlcblxuICAgIGlmICh0aGlzLnRhcmdldC5pc01vdGlvbigpICYmIHRoaXMubW9kZSA9PT0gXCJ2aXN1YWxcIikgdGhpcy50YXJnZXQud2lzZSA9IHRoaXMuc3VibW9kZVxuICAgIGlmICh0aGlzLndpc2UgIT0gbnVsbCkgdGhpcy50YXJnZXQuZm9yY2VXaXNlKHRoaXMud2lzZSlcblxuICAgIHRoaXMuZW1pdFdpbGxTZWxlY3RUYXJnZXQoKVxuXG4gICAgLy8gQWxsb3cgY3Vyc29yIHBvc2l0aW9uIGFkanVzdG1lbnQgJ29uLXdpbGwtc2VsZWN0LXRhcmdldCcgaG9vay5cbiAgICAvLyBzbyBjaGVja3BvaW50IGNvbWVzIEFGVEVSIEBlbWl0V2lsbFNlbGVjdFRhcmdldCgpXG4gICAgdGhpcy5tdXRhdGlvbk1hbmFnZXIuc2V0Q2hlY2twb2ludChcIndpbGwtc2VsZWN0XCIpXG5cbiAgICAvLyBOT1RFOiBXaGVuIHJlcGVhdGVkLCBzZXQgb2NjdXJyZW5jZS1tYXJrZXIgZnJvbSBwYXR0ZXJuIHN0b3JlZCBhcyBzdGF0ZS5cbiAgICBpZiAodGhpcy5yZXBlYXRlZCAmJiB0aGlzLm9jY3VycmVuY2UgJiYgIXRoaXMub2NjdXJyZW5jZU1hbmFnZXIuaGFzTWFya2VycygpKSB7XG4gICAgICB0aGlzLm9jY3VycmVuY2VNYW5hZ2VyLmFkZFBhdHRlcm4odGhpcy5wYXR0ZXJuRm9yT2NjdXJyZW5jZSwge29jY3VycmVuY2VUeXBlOiB0aGlzLm9jY3VycmVuY2VUeXBlfSlcbiAgICB9XG5cbiAgICB0aGlzLnRhcmdldC5leGVjdXRlKClcblxuICAgIHRoaXMubXV0YXRpb25NYW5hZ2VyLnNldENoZWNrcG9pbnQoXCJkaWQtc2VsZWN0XCIpXG4gICAgaWYgKHRoaXMub2NjdXJyZW5jZSkge1xuICAgICAgaWYgKCF0aGlzLnBhdHRlcm5Gb3JPY2N1cnJlbmNlKSB7XG4gICAgICAgIC8vIFByZXNlcnZlIG9jY3VycmVuY2VQYXR0ZXJuIGZvciAuIHJlcGVhdC5cbiAgICAgICAgdGhpcy5wYXR0ZXJuRm9yT2NjdXJyZW5jZSA9IHRoaXMub2NjdXJyZW5jZU1hbmFnZXIuYnVpbGRQYXR0ZXJuKClcbiAgICAgIH1cblxuICAgICAgdGhpcy5vY2N1cnJlbmNlV2lzZSA9IHRoaXMud2lzZSB8fCBcImNoYXJhY3Rlcndpc2VcIlxuICAgICAgaWYgKHRoaXMub2NjdXJyZW5jZU1hbmFnZXIuc2VsZWN0KHRoaXMub2NjdXJyZW5jZVdpc2UpKSB7XG4gICAgICAgIHRoaXMub2NjdXJyZW5jZVNlbGVjdGVkID0gdHJ1ZVxuICAgICAgICB0aGlzLm11dGF0aW9uTWFuYWdlci5zZXRDaGVja3BvaW50KFwiZGlkLXNlbGVjdC1vY2N1cnJlbmNlXCIpXG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy50YXJnZXRTZWxlY3RlZCA9IHRoaXMudmltU3RhdGUuaGF2ZVNvbWVOb25FbXB0eVNlbGVjdGlvbigpIHx8IHRoaXMudGFyZ2V0Lm5hbWUgPT09IFwiRW1wdHlcIlxuICAgIGlmICh0aGlzLnRhcmdldFNlbGVjdGVkKSB7XG4gICAgICB0aGlzLmVtaXREaWRTZWxlY3RUYXJnZXQoKVxuICAgICAgdGhpcy5mbGFzaENoYW5nZUlmTmVjZXNzYXJ5KClcbiAgICAgIHRoaXMudHJhY2tDaGFuZ2VJZk5lY2Vzc2FyeSgpXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZW1pdERpZEZhaWxTZWxlY3RUYXJnZXQoKVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzLnRhcmdldFNlbGVjdGVkXG4gIH1cblxuICByZXN0b3JlQ3Vyc29yUG9zaXRpb25zSWZOZWNlc3NhcnkoKSB7XG4gICAgaWYgKCF0aGlzLnJlc3RvcmVQb3NpdGlvbnMpIHJldHVyblxuXG4gICAgY29uc3Qgc3RheSA9XG4gICAgICB0aGlzLnN0YXlBdFNhbWVQb3NpdGlvbiAhPSBudWxsXG4gICAgICAgID8gdGhpcy5zdGF5QXRTYW1lUG9zaXRpb25cbiAgICAgICAgOiB0aGlzLmdldENvbmZpZyh0aGlzLnN0YXlPcHRpb25OYW1lKSB8fCAodGhpcy5vY2N1cnJlbmNlU2VsZWN0ZWQgJiYgdGhpcy5nZXRDb25maWcoXCJzdGF5T25PY2N1cnJlbmNlXCIpKVxuICAgIGNvbnN0IHdpc2UgPSB0aGlzLm9jY3VycmVuY2VTZWxlY3RlZCA/IHRoaXMub2NjdXJyZW5jZVdpc2UgOiB0aGlzLnRhcmdldC53aXNlXG4gICAgY29uc3Qge3NldFRvRmlyc3RDaGFyYWN0ZXJPbkxpbmV3aXNlfSA9IHRoaXNcbiAgICB0aGlzLm11dGF0aW9uTWFuYWdlci5yZXN0b3JlQ3Vyc29yUG9zaXRpb25zKHtzdGF5LCB3aXNlLCBzZXRUb0ZpcnN0Q2hhcmFjdGVyT25MaW5ld2lzZX0pXG4gIH1cbn1cbk9wZXJhdG9yLnJlZ2lzdGVyKGZhbHNlKVxuXG5jbGFzcyBTZWxlY3RCYXNlIGV4dGVuZHMgT3BlcmF0b3Ige1xuICBmbGFzaFRhcmdldCA9IGZhbHNlXG4gIHJlY29yZGFibGUgPSBmYWxzZVxuXG4gIGV4ZWN1dGUoKSB7XG4gICAgdGhpcy5zdGFydE11dGF0aW9uKCgpID0+IHRoaXMuc2VsZWN0VGFyZ2V0KCkpXG5cbiAgICBpZiAodGhpcy50YXJnZXQuc2VsZWN0U3VjY2VlZGVkKSB7XG4gICAgICBpZiAodGhpcy50YXJnZXQuaXNUZXh0T2JqZWN0KCkpIHtcbiAgICAgICAgdGhpcy5lZGl0b3Iuc2Nyb2xsVG9DdXJzb3JQb3NpdGlvbigpXG4gICAgICB9XG4gICAgICBjb25zdCB3aXNlID0gdGhpcy5vY2N1cnJlbmNlU2VsZWN0ZWQgPyB0aGlzLm9jY3VycmVuY2VXaXNlIDogdGhpcy50YXJnZXQud2lzZVxuICAgICAgdGhpcy5hY3RpdmF0ZU1vZGVJZk5lY2Vzc2FyeShcInZpc3VhbFwiLCB3aXNlKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmNhbmNlbE9wZXJhdGlvbigpXG4gICAgfVxuICB9XG59XG5TZWxlY3RCYXNlLnJlZ2lzdGVyKGZhbHNlKVxuXG5jbGFzcyBTZWxlY3QgZXh0ZW5kcyBTZWxlY3RCYXNlIHtcbiAgZXhlY3V0ZSgpIHtcbiAgICB0aGlzLnN3cmFwLnNhdmVQcm9wZXJ0aWVzKHRoaXMuZWRpdG9yKVxuICAgIHN1cGVyLmV4ZWN1dGUoKVxuICB9XG59XG5TZWxlY3QucmVnaXN0ZXIoKVxuXG5jbGFzcyBTZWxlY3RMYXRlc3RDaGFuZ2UgZXh0ZW5kcyBTZWxlY3RCYXNlIHtcbiAgdGFyZ2V0ID0gXCJBTGF0ZXN0Q2hhbmdlXCJcbn1cblNlbGVjdExhdGVzdENoYW5nZS5yZWdpc3RlcigpXG5cbmNsYXNzIFNlbGVjdFByZXZpb3VzU2VsZWN0aW9uIGV4dGVuZHMgU2VsZWN0QmFzZSB7XG4gIHRhcmdldCA9IFwiUHJldmlvdXNTZWxlY3Rpb25cIlxufVxuU2VsZWN0UHJldmlvdXNTZWxlY3Rpb24ucmVnaXN0ZXIoKVxuXG5jbGFzcyBTZWxlY3RQZXJzaXN0ZW50U2VsZWN0aW9uIGV4dGVuZHMgU2VsZWN0QmFzZSB7XG4gIHRhcmdldCA9IFwiQVBlcnNpc3RlbnRTZWxlY3Rpb25cIlxuICBhY2NlcHRQZXJzaXN0ZW50U2VsZWN0aW9uID0gZmFsc2Vcbn1cblNlbGVjdFBlcnNpc3RlbnRTZWxlY3Rpb24ucmVnaXN0ZXIoKVxuXG5jbGFzcyBTZWxlY3RPY2N1cnJlbmNlIGV4dGVuZHMgU2VsZWN0QmFzZSB7XG4gIG9jY3VycmVuY2UgPSB0cnVlXG59XG5TZWxlY3RPY2N1cnJlbmNlLnJlZ2lzdGVyKClcblxuLy8gVmlzdWFsTW9kZVNlbGVjdDogdXNlZCBpbiB2aXN1YWwtbW9kZVxuLy8gV2hlbiB0ZXh0LW9iamVjdCBpcyBpbnZva2VkIGZyb20gbm9ybWFsIG9yIHZpdXNhbC1tb2RlLCBvcGVyYXRpb24gd291bGQgYmVcbi8vICA9PiBWaXN1YWxNb2RlU2VsZWN0IG9wZXJhdG9yIHdpdGggdGFyZ2V0PXRleHQtb2JqZWN0XG4vLyBXaGVuIG1vdGlvbiBpcyBpbnZva2VkIGZyb20gdmlzdWFsLW1vZGUsIG9wZXJhdGlvbiB3b3VsZCBiZVxuLy8gID0+IFZpc3VhbE1vZGVTZWxlY3Qgb3BlcmF0b3Igd2l0aCB0YXJnZXQ9bW90aW9uKVxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIFZpc3VhbE1vZGVTZWxlY3QgaXMgdXNlZCBpbiBUV08gc2l0dWF0aW9uLlxuLy8gLSB2aXN1YWwtbW9kZSBvcGVyYXRpb25cbi8vICAgLSBlLmc6IGB2IGxgLCBgViBqYCwgYHYgaSBwYC4uLlxuLy8gLSBEaXJlY3RseSBpbnZva2UgdGV4dC1vYmplY3QgZnJvbSBub3JtYWwtbW9kZVxuLy8gICAtIGUuZzogSW52b2tlIGBJbm5lciBQYXJhZ3JhcGhgIGZyb20gY29tbWFuZC1wYWxldHRlLlxuY2xhc3MgVmlzdWFsTW9kZVNlbGVjdCBleHRlbmRzIFNlbGVjdEJhc2Uge1xuICBhY2NlcHRQcmVzZXRPY2N1cnJlbmNlID0gZmFsc2VcbiAgYWNjZXB0UGVyc2lzdGVudFNlbGVjdGlvbiA9IGZhbHNlXG59XG5WaXN1YWxNb2RlU2VsZWN0LnJlZ2lzdGVyKGZhbHNlKVxuXG4vLyBQZXJzaXN0ZW50IFNlbGVjdGlvblxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PVxuY2xhc3MgQ3JlYXRlUGVyc2lzdGVudFNlbGVjdGlvbiBleHRlbmRzIE9wZXJhdG9yIHtcbiAgZmxhc2hUYXJnZXQgPSBmYWxzZVxuICBzdGF5QXRTYW1lUG9zaXRpb24gPSB0cnVlXG4gIGFjY2VwdFByZXNldE9jY3VycmVuY2UgPSBmYWxzZVxuICBhY2NlcHRQZXJzaXN0ZW50U2VsZWN0aW9uID0gZmFsc2VcblxuICBtdXRhdGVTZWxlY3Rpb24oc2VsZWN0aW9uKSB7XG4gICAgdGhpcy5wZXJzaXN0ZW50U2VsZWN0aW9uLm1hcmtCdWZmZXJSYW5nZShzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKSlcbiAgfVxufVxuQ3JlYXRlUGVyc2lzdGVudFNlbGVjdGlvbi5yZWdpc3RlcigpXG5cbmNsYXNzIFRvZ2dsZVBlcnNpc3RlbnRTZWxlY3Rpb24gZXh0ZW5kcyBDcmVhdGVQZXJzaXN0ZW50U2VsZWN0aW9uIHtcbiAgaW5pdGlhbGl6ZSgpIHtcbiAgICBpZiAodGhpcy5pc01vZGUoXCJub3JtYWxcIikpIHtcbiAgICAgIGNvbnN0IHBvaW50ID0gdGhpcy5lZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKVxuICAgICAgY29uc3QgbWFya2VyID0gdGhpcy5wZXJzaXN0ZW50U2VsZWN0aW9uLmdldE1hcmtlckF0UG9pbnQocG9pbnQpXG4gICAgICBpZiAobWFya2VyKSB0aGlzLnRhcmdldCA9IFwiRW1wdHlcIlxuICAgIH1cbiAgICBzdXBlci5pbml0aWFsaXplKClcbiAgfVxuXG4gIG11dGF0ZVNlbGVjdGlvbihzZWxlY3Rpb24pIHtcbiAgICBjb25zdCBwb2ludCA9IHRoaXMuZ2V0Q3Vyc29yUG9zaXRpb25Gb3JTZWxlY3Rpb24oc2VsZWN0aW9uKVxuICAgIGNvbnN0IG1hcmtlciA9IHRoaXMucGVyc2lzdGVudFNlbGVjdGlvbi5nZXRNYXJrZXJBdFBvaW50KHBvaW50KVxuICAgIGlmIChtYXJrZXIpIHtcbiAgICAgIG1hcmtlci5kZXN0cm95KClcbiAgICB9IGVsc2Uge1xuICAgICAgc3VwZXIubXV0YXRlU2VsZWN0aW9uKHNlbGVjdGlvbilcbiAgICB9XG4gIH1cbn1cblRvZ2dsZVBlcnNpc3RlbnRTZWxlY3Rpb24ucmVnaXN0ZXIoKVxuXG4vLyBQcmVzZXQgT2NjdXJyZW5jZVxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PVxuY2xhc3MgVG9nZ2xlUHJlc2V0T2NjdXJyZW5jZSBleHRlbmRzIE9wZXJhdG9yIHtcbiAgdGFyZ2V0ID0gXCJFbXB0eVwiXG4gIGZsYXNoVGFyZ2V0ID0gZmFsc2VcbiAgYWNjZXB0UHJlc2V0T2NjdXJyZW5jZSA9IGZhbHNlXG4gIGFjY2VwdFBlcnNpc3RlbnRTZWxlY3Rpb24gPSBmYWxzZVxuICBvY2N1cnJlbmNlVHlwZSA9IFwiYmFzZVwiXG5cbiAgZXhlY3V0ZSgpIHtcbiAgICBjb25zdCBtYXJrZXIgPSB0aGlzLm9jY3VycmVuY2VNYW5hZ2VyLmdldE1hcmtlckF0UG9pbnQodGhpcy5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpKVxuICAgIGlmIChtYXJrZXIpIHtcbiAgICAgIHRoaXMub2NjdXJyZW5jZU1hbmFnZXIuZGVzdHJveU1hcmtlcnMoW21hcmtlcl0pXG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGlzTmFycm93ZWQgPSB0aGlzLnZpbVN0YXRlLm1vZGVNYW5hZ2VyLmlzTmFycm93ZWQoKVxuXG4gICAgICBsZXQgcmVnZXhcbiAgICAgIGlmICh0aGlzLm1vZGUgPT09IFwidmlzdWFsXCIgJiYgIWlzTmFycm93ZWQpIHtcbiAgICAgICAgdGhpcy5vY2N1cnJlbmNlVHlwZSA9IFwiYmFzZVwiXG4gICAgICAgIHJlZ2V4ID0gbmV3IFJlZ0V4cChfLmVzY2FwZVJlZ0V4cCh0aGlzLmVkaXRvci5nZXRTZWxlY3RlZFRleHQoKSksIFwiZ1wiKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVnZXggPSB0aGlzLmdldFBhdHRlcm5Gb3JPY2N1cnJlbmNlVHlwZSh0aGlzLm9jY3VycmVuY2VUeXBlKVxuICAgICAgfVxuXG4gICAgICB0aGlzLm9jY3VycmVuY2VNYW5hZ2VyLmFkZFBhdHRlcm4ocmVnZXgsIHtvY2N1cnJlbmNlVHlwZTogdGhpcy5vY2N1cnJlbmNlVHlwZX0pXG4gICAgICB0aGlzLm9jY3VycmVuY2VNYW5hZ2VyLnNhdmVMYXN0UGF0dGVybih0aGlzLm9jY3VycmVuY2VUeXBlKVxuXG4gICAgICBpZiAoIWlzTmFycm93ZWQpIHRoaXMuYWN0aXZhdGVNb2RlKFwibm9ybWFsXCIpXG4gICAgfVxuICB9XG59XG5Ub2dnbGVQcmVzZXRPY2N1cnJlbmNlLnJlZ2lzdGVyKClcblxuY2xhc3MgVG9nZ2xlUHJlc2V0U3Vid29yZE9jY3VycmVuY2UgZXh0ZW5kcyBUb2dnbGVQcmVzZXRPY2N1cnJlbmNlIHtcbiAgb2NjdXJyZW5jZVR5cGUgPSBcInN1YndvcmRcIlxufVxuVG9nZ2xlUHJlc2V0U3Vid29yZE9jY3VycmVuY2UucmVnaXN0ZXIoKVxuXG4vLyBXYW50IHRvIHJlbmFtZSBSZXN0b3JlT2NjdXJyZW5jZU1hcmtlclxuY2xhc3MgQWRkUHJlc2V0T2NjdXJyZW5jZUZyb21MYXN0T2NjdXJyZW5jZVBhdHRlcm4gZXh0ZW5kcyBUb2dnbGVQcmVzZXRPY2N1cnJlbmNlIHtcbiAgZXhlY3V0ZSgpIHtcbiAgICB0aGlzLm9jY3VycmVuY2VNYW5hZ2VyLnJlc2V0UGF0dGVybnMoKVxuICAgIGNvbnN0IHJlZ2V4ID0gdGhpcy5nbG9iYWxTdGF0ZS5nZXQoXCJsYXN0T2NjdXJyZW5jZVBhdHRlcm5cIilcbiAgICBpZiAocmVnZXgpIHtcbiAgICAgIGNvbnN0IG9jY3VycmVuY2VUeXBlID0gdGhpcy5nbG9iYWxTdGF0ZS5nZXQoXCJsYXN0T2NjdXJyZW5jZVR5cGVcIilcbiAgICAgIHRoaXMub2NjdXJyZW5jZU1hbmFnZXIuYWRkUGF0dGVybihyZWdleCwge29jY3VycmVuY2VUeXBlfSlcbiAgICAgIHRoaXMuYWN0aXZhdGVNb2RlKFwibm9ybWFsXCIpXG4gICAgfVxuICB9XG59XG5BZGRQcmVzZXRPY2N1cnJlbmNlRnJvbUxhc3RPY2N1cnJlbmNlUGF0dGVybi5yZWdpc3RlcigpXG5cbi8vIERlbGV0ZVxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIERlbGV0ZSBleHRlbmRzIE9wZXJhdG9yIHtcbiAgdHJhY2tDaGFuZ2UgPSB0cnVlXG4gIGZsYXNoQ2hlY2twb2ludCA9IFwiZGlkLXNlbGVjdC1vY2N1cnJlbmNlXCJcbiAgZmxhc2hUeXBlRm9yT2NjdXJyZW5jZSA9IFwib3BlcmF0b3ItcmVtb3ZlLW9jY3VycmVuY2VcIlxuICBzdGF5T3B0aW9uTmFtZSA9IFwic3RheU9uRGVsZXRlXCJcbiAgc2V0VG9GaXJzdENoYXJhY3Rlck9uTGluZXdpc2UgPSB0cnVlXG5cbiAgZXhlY3V0ZSgpIHtcbiAgICB0aGlzLm9uRGlkU2VsZWN0VGFyZ2V0KCgpID0+IHtcbiAgICAgIGlmICh0aGlzLm9jY3VycmVuY2VTZWxlY3RlZCAmJiB0aGlzLm9jY3VycmVuY2VXaXNlID09PSBcImxpbmV3aXNlXCIpIHtcbiAgICAgICAgdGhpcy5mbGFzaFRhcmdldCA9IGZhbHNlXG4gICAgICB9XG4gICAgfSlcblxuICAgIGlmICh0aGlzLnRhcmdldC53aXNlID09PSBcImJsb2Nrd2lzZVwiKSB7XG4gICAgICB0aGlzLnJlc3RvcmVQb3NpdGlvbnMgPSBmYWxzZVxuICAgIH1cbiAgICBzdXBlci5leGVjdXRlKClcbiAgfVxuXG4gIG11dGF0ZVNlbGVjdGlvbihzZWxlY3Rpb24pIHtcbiAgICB0aGlzLnNldFRleHRUb1JlZ2lzdGVyRm9yU2VsZWN0aW9uKHNlbGVjdGlvbilcbiAgICBzZWxlY3Rpb24uZGVsZXRlU2VsZWN0ZWRUZXh0KClcbiAgfVxufVxuRGVsZXRlLnJlZ2lzdGVyKClcblxuY2xhc3MgRGVsZXRlUmlnaHQgZXh0ZW5kcyBEZWxldGUge1xuICB0YXJnZXQgPSBcIk1vdmVSaWdodFwiXG59XG5EZWxldGVSaWdodC5yZWdpc3RlcigpXG5cbmNsYXNzIERlbGV0ZUxlZnQgZXh0ZW5kcyBEZWxldGUge1xuICB0YXJnZXQgPSBcIk1vdmVMZWZ0XCJcbn1cbkRlbGV0ZUxlZnQucmVnaXN0ZXIoKVxuXG5jbGFzcyBEZWxldGVUb0xhc3RDaGFyYWN0ZXJPZkxpbmUgZXh0ZW5kcyBEZWxldGUge1xuICB0YXJnZXQgPSBcIk1vdmVUb0xhc3RDaGFyYWN0ZXJPZkxpbmVcIlxuXG4gIGV4ZWN1dGUoKSB7XG4gICAgdGhpcy5vbkRpZFNlbGVjdFRhcmdldCgoKSA9PiB7XG4gICAgICBpZiAodGhpcy50YXJnZXQud2lzZSA9PT0gXCJibG9ja3dpc2VcIikge1xuICAgICAgICBmb3IgKGNvbnN0IGJsb2Nrd2lzZVNlbGVjdGlvbiBvZiB0aGlzLmdldEJsb2Nrd2lzZVNlbGVjdGlvbnMoKSkge1xuICAgICAgICAgIGJsb2Nrd2lzZVNlbGVjdGlvbi5leHRlbmRNZW1iZXJTZWxlY3Rpb25zVG9FbmRPZkxpbmUoKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgICBzdXBlci5leGVjdXRlKClcbiAgfVxufVxuRGVsZXRlVG9MYXN0Q2hhcmFjdGVyT2ZMaW5lLnJlZ2lzdGVyKClcblxuY2xhc3MgRGVsZXRlTGluZSBleHRlbmRzIERlbGV0ZSB7XG4gIHdpc2UgPSBcImxpbmV3aXNlXCJcbiAgdGFyZ2V0ID0gXCJNb3ZlVG9SZWxhdGl2ZUxpbmVcIlxuICBmbGFzaFRhcmdldCA9IGZhbHNlXG59XG5EZWxldGVMaW5lLnJlZ2lzdGVyKClcblxuLy8gWWFua1xuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PVxuY2xhc3MgWWFuayBleHRlbmRzIE9wZXJhdG9yIHtcbiAgdHJhY2tDaGFuZ2UgPSB0cnVlXG4gIHN0YXlPcHRpb25OYW1lID0gXCJzdGF5T25ZYW5rXCJcblxuICBtdXRhdGVTZWxlY3Rpb24oc2VsZWN0aW9uKSB7XG4gICAgdGhpcy5zZXRUZXh0VG9SZWdpc3RlckZvclNlbGVjdGlvbihzZWxlY3Rpb24pXG4gIH1cbn1cbllhbmsucmVnaXN0ZXIoKVxuXG5jbGFzcyBZYW5rTGluZSBleHRlbmRzIFlhbmsge1xuICB3aXNlID0gXCJsaW5ld2lzZVwiXG4gIHRhcmdldCA9IFwiTW92ZVRvUmVsYXRpdmVMaW5lXCJcbn1cbllhbmtMaW5lLnJlZ2lzdGVyKClcblxuY2xhc3MgWWFua1RvTGFzdENoYXJhY3Rlck9mTGluZSBleHRlbmRzIFlhbmsge1xuICB0YXJnZXQgPSBcIk1vdmVUb0xhc3RDaGFyYWN0ZXJPZkxpbmVcIlxufVxuWWFua1RvTGFzdENoYXJhY3Rlck9mTGluZS5yZWdpc3RlcigpXG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFtjdHJsLWFdXG5jbGFzcyBJbmNyZWFzZSBleHRlbmRzIE9wZXJhdG9yIHtcbiAgdGFyZ2V0ID0gXCJFbXB0eVwiIC8vIGN0cmwtYSBpbiBub3JtYWwtbW9kZSBmaW5kIHRhcmdldCBudW1iZXIgaW4gY3VycmVudCBsaW5lIG1hbnVhbGx5XG4gIGZsYXNoVGFyZ2V0ID0gZmFsc2UgLy8gZG8gbWFudWFsbHlcbiAgcmVzdG9yZVBvc2l0aW9ucyA9IGZhbHNlIC8vIGRvIG1hbnVhbGx5XG4gIHN0ZXAgPSAxXG5cbiAgZXhlY3V0ZSgpIHtcbiAgICB0aGlzLm5ld1JhbmdlcyA9IFtdXG4gICAgaWYgKCF0aGlzLnJlZ2V4KSB0aGlzLnJlZ2V4ID0gbmV3IFJlZ0V4cChgJHt0aGlzLmdldENvbmZpZyhcIm51bWJlclJlZ2V4XCIpfWAsIFwiZ1wiKVxuXG4gICAgc3VwZXIuZXhlY3V0ZSgpXG5cbiAgICBpZiAodGhpcy5uZXdSYW5nZXMubGVuZ3RoKSB7XG4gICAgICBpZiAodGhpcy5nZXRDb25maWcoXCJmbGFzaE9uT3BlcmF0ZVwiKSAmJiAhdGhpcy5nZXRDb25maWcoXCJmbGFzaE9uT3BlcmF0ZUJsYWNrbGlzdFwiKS5pbmNsdWRlcyh0aGlzLm5hbWUpKSB7XG4gICAgICAgIHRoaXMudmltU3RhdGUuZmxhc2godGhpcy5uZXdSYW5nZXMsIHt0eXBlOiB0aGlzLmZsYXNoVHlwZUZvck9jY3VycmVuY2V9KVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJlcGxhY2VOdW1iZXJJbkJ1ZmZlclJhbmdlKHNjYW5SYW5nZSwgZm4pIHtcbiAgICBjb25zdCBuZXdSYW5nZXMgPSBbXVxuICAgIHRoaXMuc2NhbkZvcndhcmQodGhpcy5yZWdleCwge3NjYW5SYW5nZX0sIGV2ZW50ID0+IHtcbiAgICAgIGlmIChmbikge1xuICAgICAgICBpZiAoZm4oZXZlbnQpKSBldmVudC5zdG9wKClcbiAgICAgICAgZWxzZSByZXR1cm5cbiAgICAgIH1cbiAgICAgIGNvbnN0IG5leHROdW1iZXIgPSB0aGlzLmdldE5leHROdW1iZXIoZXZlbnQubWF0Y2hUZXh0KVxuICAgICAgbmV3UmFuZ2VzLnB1c2goZXZlbnQucmVwbGFjZShTdHJpbmcobmV4dE51bWJlcikpKVxuICAgIH0pXG4gICAgcmV0dXJuIG5ld1Jhbmdlc1xuICB9XG5cbiAgbXV0YXRlU2VsZWN0aW9uKHNlbGVjdGlvbikge1xuICAgIGNvbnN0IHtjdXJzb3J9ID0gc2VsZWN0aW9uXG4gICAgaWYgKHRoaXMudGFyZ2V0Lm5hbWUgPT09IFwiRW1wdHlcIikge1xuICAgICAgLy8gY3RybC1hLCBjdHJsLXggaW4gYG5vcm1hbC1tb2RlYFxuICAgICAgY29uc3QgY3Vyc29yUG9zaXRpb24gPSBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuICAgICAgY29uc3Qgc2NhblJhbmdlID0gdGhpcy5lZGl0b3IuYnVmZmVyUmFuZ2VGb3JCdWZmZXJSb3coY3Vyc29yUG9zaXRpb24ucm93KVxuICAgICAgY29uc3QgbmV3UmFuZ2VzID0gdGhpcy5yZXBsYWNlTnVtYmVySW5CdWZmZXJSYW5nZShzY2FuUmFuZ2UsIGV2ZW50ID0+XG4gICAgICAgIGV2ZW50LnJhbmdlLmVuZC5pc0dyZWF0ZXJUaGFuKGN1cnNvclBvc2l0aW9uKVxuICAgICAgKVxuICAgICAgY29uc3QgcG9pbnQgPSAobmV3UmFuZ2VzLmxlbmd0aCAmJiBuZXdSYW5nZXNbMF0uZW5kLnRyYW5zbGF0ZShbMCwgLTFdKSkgfHwgY3Vyc29yUG9zaXRpb25cbiAgICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihwb2ludClcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3Qgc2NhblJhbmdlID0gc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKClcbiAgICAgIHRoaXMubmV3UmFuZ2VzLnB1c2goLi4udGhpcy5yZXBsYWNlTnVtYmVySW5CdWZmZXJSYW5nZShzY2FuUmFuZ2UpKVxuICAgICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHNjYW5SYW5nZS5zdGFydClcbiAgICB9XG4gIH1cblxuICBnZXROZXh0TnVtYmVyKG51bWJlclN0cmluZykge1xuICAgIHJldHVybiBOdW1iZXIucGFyc2VJbnQobnVtYmVyU3RyaW5nLCAxMCkgKyB0aGlzLnN0ZXAgKiB0aGlzLmdldENvdW50KClcbiAgfVxufVxuSW5jcmVhc2UucmVnaXN0ZXIoKVxuXG4vLyBbY3RybC14XVxuY2xhc3MgRGVjcmVhc2UgZXh0ZW5kcyBJbmNyZWFzZSB7XG4gIHN0ZXAgPSAtMVxufVxuRGVjcmVhc2UucmVnaXN0ZXIoKVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBbZyBjdHJsLWFdXG5jbGFzcyBJbmNyZW1lbnROdW1iZXIgZXh0ZW5kcyBJbmNyZWFzZSB7XG4gIGJhc2VOdW1iZXIgPSBudWxsXG4gIHRhcmdldCA9IG51bGxcblxuICBnZXROZXh0TnVtYmVyKG51bWJlclN0cmluZykge1xuICAgIGlmICh0aGlzLmJhc2VOdW1iZXIgIT0gbnVsbCkge1xuICAgICAgdGhpcy5iYXNlTnVtYmVyICs9IHRoaXMuc3RlcCAqIHRoaXMuZ2V0Q291bnQoKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmJhc2VOdW1iZXIgPSBOdW1iZXIucGFyc2VJbnQobnVtYmVyU3RyaW5nLCAxMClcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuYmFzZU51bWJlclxuICB9XG59XG5JbmNyZW1lbnROdW1iZXIucmVnaXN0ZXIoKVxuXG4vLyBbZyBjdHJsLXhdXG5jbGFzcyBEZWNyZW1lbnROdW1iZXIgZXh0ZW5kcyBJbmNyZW1lbnROdW1iZXIge1xuICBzdGVwID0gLTFcbn1cbkRlY3JlbWVudE51bWJlci5yZWdpc3RlcigpXG5cbi8vIFB1dFxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gQ3Vyc29yIHBsYWNlbWVudDpcbi8vIC0gcGxhY2UgYXQgZW5kIG9mIG11dGF0aW9uOiBwYXN0ZSBub24tbXVsdGlsaW5lIGNoYXJhY3Rlcndpc2UgdGV4dFxuLy8gLSBwbGFjZSBhdCBzdGFydCBvZiBtdXRhdGlvbjogbm9uLW11bHRpbGluZSBjaGFyYWN0ZXJ3aXNlIHRleHQoY2hhcmFjdGVyd2lzZSwgbGluZXdpc2UpXG5jbGFzcyBQdXRCZWZvcmUgZXh0ZW5kcyBPcGVyYXRvciB7XG4gIGxvY2F0aW9uID0gXCJiZWZvcmVcIlxuICB0YXJnZXQgPSBcIkVtcHR5XCJcbiAgZmxhc2hUeXBlID0gXCJvcGVyYXRvci1sb25nXCJcbiAgcmVzdG9yZVBvc2l0aW9ucyA9IGZhbHNlIC8vIG1hbmFnZSBtYW51YWxseVxuICBmbGFzaFRhcmdldCA9IGZhbHNlIC8vIG1hbmFnZSBtYW51YWxseVxuICB0cmFja0NoYW5nZSA9IGZhbHNlIC8vIG1hbmFnZSBtYW51YWxseVxuXG4gIGluaXRpYWxpemUoKSB7XG4gICAgdGhpcy52aW1TdGF0ZS5zZXF1ZW50aWFsUGFzdGVNYW5hZ2VyLm9uSW5pdGlhbGl6ZSh0aGlzKVxuICAgIHN1cGVyLmluaXRpYWxpemUoKVxuICB9XG5cbiAgZXhlY3V0ZSgpIHtcbiAgICB0aGlzLm11dGF0aW9uc0J5U2VsZWN0aW9uID0gbmV3IE1hcCgpXG4gICAgdGhpcy5zZXF1ZW50aWFsUGFzdGUgPSB0aGlzLnZpbVN0YXRlLnNlcXVlbnRpYWxQYXN0ZU1hbmFnZXIub25FeGVjdXRlKHRoaXMpXG5cbiAgICB0aGlzLm9uRGlkRmluaXNoTXV0YXRpb24oKCkgPT4ge1xuICAgICAgaWYgKCF0aGlzLmNhbmNlbGxlZCkgdGhpcy5hZGp1c3RDdXJzb3JQb3NpdGlvbigpXG4gICAgfSlcblxuICAgIHN1cGVyLmV4ZWN1dGUoKVxuXG4gICAgaWYgKHRoaXMuY2FuY2VsbGVkKSByZXR1cm5cblxuICAgIHRoaXMub25EaWRGaW5pc2hPcGVyYXRpb24oKCkgPT4ge1xuICAgICAgLy8gVHJhY2tDaGFuZ2VcbiAgICAgIGNvbnN0IG5ld1JhbmdlID0gdGhpcy5tdXRhdGlvbnNCeVNlbGVjdGlvbi5nZXQodGhpcy5lZGl0b3IuZ2V0TGFzdFNlbGVjdGlvbigpKVxuICAgICAgaWYgKG5ld1JhbmdlKSB0aGlzLnNldE1hcmtGb3JDaGFuZ2UobmV3UmFuZ2UpXG5cbiAgICAgIC8vIEZsYXNoXG4gICAgICBpZiAodGhpcy5nZXRDb25maWcoXCJmbGFzaE9uT3BlcmF0ZVwiKSAmJiAhdGhpcy5nZXRDb25maWcoXCJmbGFzaE9uT3BlcmF0ZUJsYWNrbGlzdFwiKS5pbmNsdWRlcyh0aGlzLm5hbWUpKSB7XG4gICAgICAgIGNvbnN0IHJhbmdlcyA9IHRoaXMuZWRpdG9yLmdldFNlbGVjdGlvbnMoKS5tYXAoc2VsZWN0aW9uID0+IHRoaXMubXV0YXRpb25zQnlTZWxlY3Rpb24uZ2V0KHNlbGVjdGlvbikpXG4gICAgICAgIHRoaXMudmltU3RhdGUuZmxhc2gocmFuZ2VzLCB7dHlwZTogdGhpcy5nZXRGbGFzaFR5cGUoKX0pXG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIGFkanVzdEN1cnNvclBvc2l0aW9uKCkge1xuICAgIGZvciAoY29uc3Qgc2VsZWN0aW9uIG9mIHRoaXMuZWRpdG9yLmdldFNlbGVjdGlvbnMoKSkge1xuICAgICAgaWYgKCF0aGlzLm11dGF0aW9uc0J5U2VsZWN0aW9uLmhhcyhzZWxlY3Rpb24pKSBjb250aW51ZVxuXG4gICAgICBjb25zdCB7Y3Vyc29yfSA9IHNlbGVjdGlvblxuICAgICAgY29uc3QgbmV3UmFuZ2UgPSB0aGlzLm11dGF0aW9uc0J5U2VsZWN0aW9uLmdldChzZWxlY3Rpb24pXG4gICAgICBpZiAodGhpcy5saW5ld2lzZVBhc3RlKSB7XG4gICAgICAgIHRoaXMudXRpbHMubW92ZUN1cnNvclRvRmlyc3RDaGFyYWN0ZXJBdFJvdyhjdXJzb3IsIG5ld1JhbmdlLnN0YXJ0LnJvdylcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChuZXdSYW5nZS5pc1NpbmdsZUxpbmUoKSkge1xuICAgICAgICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihuZXdSYW5nZS5lbmQudHJhbnNsYXRlKFswLCAtMV0pKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihuZXdSYW5nZS5zdGFydClcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIG11dGF0ZVNlbGVjdGlvbihzZWxlY3Rpb24pIHtcbiAgICBjb25zdCB2YWx1ZSA9IHRoaXMudmltU3RhdGUucmVnaXN0ZXIuZ2V0KG51bGwsIHNlbGVjdGlvbiwgdGhpcy5zZXF1ZW50aWFsUGFzdGUpXG4gICAgaWYgKCF2YWx1ZS50ZXh0KSB7XG4gICAgICB0aGlzLmNhbmNlbGxlZCA9IHRydWVcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGNvbnN0IHRleHRUb1Bhc3RlID0gXy5tdWx0aXBseVN0cmluZyh2YWx1ZS50ZXh0LCB0aGlzLmdldENvdW50KCkpXG4gICAgdGhpcy5saW5ld2lzZVBhc3RlID0gdmFsdWUudHlwZSA9PT0gXCJsaW5ld2lzZVwiIHx8IHRoaXMuaXNNb2RlKFwidmlzdWFsXCIsIFwibGluZXdpc2VcIilcbiAgICBjb25zdCBuZXdSYW5nZSA9IHRoaXMucGFzdGUoc2VsZWN0aW9uLCB0ZXh0VG9QYXN0ZSwge2xpbmV3aXNlUGFzdGU6IHRoaXMubGluZXdpc2VQYXN0ZX0pXG4gICAgdGhpcy5tdXRhdGlvbnNCeVNlbGVjdGlvbi5zZXQoc2VsZWN0aW9uLCBuZXdSYW5nZSlcbiAgICB0aGlzLnZpbVN0YXRlLnNlcXVlbnRpYWxQYXN0ZU1hbmFnZXIuc2F2ZVBhc3RlZFJhbmdlRm9yU2VsZWN0aW9uKHNlbGVjdGlvbiwgbmV3UmFuZ2UpXG4gIH1cblxuICAvLyBSZXR1cm4gcGFzdGVkIHJhbmdlXG4gIHBhc3RlKHNlbGVjdGlvbiwgdGV4dCwge2xpbmV3aXNlUGFzdGV9KSB7XG4gICAgaWYgKHRoaXMuc2VxdWVudGlhbFBhc3RlKSB7XG4gICAgICByZXR1cm4gdGhpcy5wYXN0ZUNoYXJhY3Rlcndpc2Uoc2VsZWN0aW9uLCB0ZXh0KVxuICAgIH0gZWxzZSBpZiAobGluZXdpc2VQYXN0ZSkge1xuICAgICAgcmV0dXJuIHRoaXMucGFzdGVMaW5ld2lzZShzZWxlY3Rpb24sIHRleHQpXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLnBhc3RlQ2hhcmFjdGVyd2lzZShzZWxlY3Rpb24sIHRleHQpXG4gICAgfVxuICB9XG5cbiAgcGFzdGVDaGFyYWN0ZXJ3aXNlKHNlbGVjdGlvbiwgdGV4dCkge1xuICAgIGNvbnN0IHtjdXJzb3J9ID0gc2VsZWN0aW9uXG4gICAgaWYgKFxuICAgICAgc2VsZWN0aW9uLmlzRW1wdHkoKSAmJlxuICAgICAgdGhpcy5sb2NhdGlvbiA9PT0gXCJhZnRlclwiICYmXG4gICAgICAhdGhpcy51dGlscy5pc0VtcHR5Um93KHRoaXMuZWRpdG9yLCBjdXJzb3IuZ2V0QnVmZmVyUm93KCkpXG4gICAgKSB7XG4gICAgICBjdXJzb3IubW92ZVJpZ2h0KClcbiAgICB9XG4gICAgcmV0dXJuIHNlbGVjdGlvbi5pbnNlcnRUZXh0KHRleHQpXG4gIH1cblxuICAvLyBSZXR1cm4gbmV3UmFuZ2VcbiAgcGFzdGVMaW5ld2lzZShzZWxlY3Rpb24sIHRleHQpIHtcbiAgICBjb25zdCB7Y3Vyc29yfSA9IHNlbGVjdGlvblxuICAgIGNvbnN0IGN1cnNvclJvdyA9IGN1cnNvci5nZXRCdWZmZXJSb3coKVxuICAgIGlmICghdGV4dC5lbmRzV2l0aChcIlxcblwiKSkge1xuICAgICAgdGV4dCArPSBcIlxcblwiXG4gICAgfVxuICAgIGlmIChzZWxlY3Rpb24uaXNFbXB0eSgpKSB7XG4gICAgICBpZiAodGhpcy5sb2NhdGlvbiA9PT0gXCJiZWZvcmVcIikge1xuICAgICAgICByZXR1cm4gdGhpcy51dGlscy5pbnNlcnRUZXh0QXRCdWZmZXJQb3NpdGlvbih0aGlzLmVkaXRvciwgW2N1cnNvclJvdywgMF0sIHRleHQpXG4gICAgICB9IGVsc2UgaWYgKHRoaXMubG9jYXRpb24gPT09IFwiYWZ0ZXJcIikge1xuICAgICAgICBjb25zdCB0YXJnZXRSb3cgPSB0aGlzLmdldEZvbGRFbmRSb3dGb3JSb3coY3Vyc29yUm93KVxuICAgICAgICB0aGlzLnV0aWxzLmVuc3VyZUVuZHNXaXRoTmV3TGluZUZvckJ1ZmZlclJvdyh0aGlzLmVkaXRvciwgdGFyZ2V0Um93KVxuICAgICAgICByZXR1cm4gdGhpcy51dGlscy5pbnNlcnRUZXh0QXRCdWZmZXJQb3NpdGlvbih0aGlzLmVkaXRvciwgW3RhcmdldFJvdyArIDEsIDBdLCB0ZXh0KVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoIXRoaXMuaXNNb2RlKFwidmlzdWFsXCIsIFwibGluZXdpc2VcIikpIHtcbiAgICAgICAgc2VsZWN0aW9uLmluc2VydFRleHQoXCJcXG5cIilcbiAgICAgIH1cbiAgICAgIHJldHVybiBzZWxlY3Rpb24uaW5zZXJ0VGV4dCh0ZXh0KVxuICAgIH1cbiAgfVxufVxuUHV0QmVmb3JlLnJlZ2lzdGVyKClcblxuY2xhc3MgUHV0QWZ0ZXIgZXh0ZW5kcyBQdXRCZWZvcmUge1xuICBsb2NhdGlvbiA9IFwiYWZ0ZXJcIlxufVxuUHV0QWZ0ZXIucmVnaXN0ZXIoKVxuXG5jbGFzcyBQdXRCZWZvcmVXaXRoQXV0b0luZGVudCBleHRlbmRzIFB1dEJlZm9yZSB7XG4gIHBhc3RlTGluZXdpc2Uoc2VsZWN0aW9uLCB0ZXh0KSB7XG4gICAgY29uc3QgbmV3UmFuZ2UgPSBzdXBlci5wYXN0ZUxpbmV3aXNlKHNlbGVjdGlvbiwgdGV4dClcbiAgICB0aGlzLnV0aWxzLmFkanVzdEluZGVudFdpdGhLZWVwaW5nTGF5b3V0KHRoaXMuZWRpdG9yLCBuZXdSYW5nZSlcbiAgICByZXR1cm4gbmV3UmFuZ2VcbiAgfVxufVxuUHV0QmVmb3JlV2l0aEF1dG9JbmRlbnQucmVnaXN0ZXIoKVxuXG5jbGFzcyBQdXRBZnRlcldpdGhBdXRvSW5kZW50IGV4dGVuZHMgUHV0QmVmb3JlV2l0aEF1dG9JbmRlbnQge1xuICBsb2NhdGlvbiA9IFwiYWZ0ZXJcIlxufVxuUHV0QWZ0ZXJXaXRoQXV0b0luZGVudC5yZWdpc3RlcigpXG5cbmNsYXNzIEFkZEJsYW5rTGluZUJlbG93IGV4dGVuZHMgT3BlcmF0b3Ige1xuICBmbGFzaFRhcmdldCA9IGZhbHNlXG4gIHRhcmdldCA9IFwiRW1wdHlcIlxuICBzdGF5QXRTYW1lUG9zaXRpb24gPSB0cnVlXG4gIHN0YXlCeU1hcmtlciA9IHRydWVcbiAgd2hlcmUgPSBcImJlbG93XCJcblxuICBtdXRhdGVTZWxlY3Rpb24oc2VsZWN0aW9uKSB7XG4gICAgY29uc3QgcG9pbnQgPSBzZWxlY3Rpb24uZ2V0SGVhZEJ1ZmZlclBvc2l0aW9uKClcbiAgICBpZiAodGhpcy53aGVyZSA9PT0gXCJiZWxvd1wiKSBwb2ludC5yb3crK1xuICAgIHBvaW50LmNvbHVtbiA9IDBcbiAgICB0aGlzLmVkaXRvci5zZXRUZXh0SW5CdWZmZXJSYW5nZShbcG9pbnQsIHBvaW50XSwgXCJcXG5cIi5yZXBlYXQodGhpcy5nZXRDb3VudCgpKSlcbiAgfVxufVxuQWRkQmxhbmtMaW5lQmVsb3cucmVnaXN0ZXIoKVxuXG5jbGFzcyBBZGRCbGFua0xpbmVBYm92ZSBleHRlbmRzIEFkZEJsYW5rTGluZUJlbG93IHtcbiAgd2hlcmUgPSBcImFib3ZlXCJcbn1cbkFkZEJsYW5rTGluZUFib3ZlLnJlZ2lzdGVyKClcbiJdfQ==