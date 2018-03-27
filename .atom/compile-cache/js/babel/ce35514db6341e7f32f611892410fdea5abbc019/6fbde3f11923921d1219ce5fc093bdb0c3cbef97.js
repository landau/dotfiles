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

      if (this.target.is("Empty")) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL29wZXJhdG9yLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFdBQVcsQ0FBQTs7Ozs7Ozs7Ozs7Ozs7QUFFWCxJQUFNLENBQUMsR0FBRyxPQUFPLENBQUMsaUJBQWlCLENBQUMsQ0FBQTtBQUNwQyxJQUFNLElBQUksR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUE7O0lBRXhCLFFBQVE7WUFBUixRQUFROztXQUFSLFFBQVE7MEJBQVIsUUFBUTs7K0JBQVIsUUFBUTs7U0FFWixVQUFVLEdBQUcsSUFBSTtTQUVqQixJQUFJLEdBQUcsSUFBSTtTQUNYLE1BQU0sR0FBRyxJQUFJO1NBQ2IsVUFBVSxHQUFHLEtBQUs7U0FDbEIsY0FBYyxHQUFHLE1BQU07U0FFdkIsV0FBVyxHQUFHLElBQUk7U0FDbEIsZUFBZSxHQUFHLFlBQVk7U0FDOUIsU0FBUyxHQUFHLFVBQVU7U0FDdEIsc0JBQXNCLEdBQUcscUJBQXFCO1NBQzlDLFdBQVcsR0FBRyxLQUFLO1NBRW5CLG9CQUFvQixHQUFHLElBQUk7U0FDM0Isa0JBQWtCLEdBQUcsSUFBSTtTQUN6QixjQUFjLEdBQUcsSUFBSTtTQUNyQixZQUFZLEdBQUcsS0FBSztTQUNwQixnQkFBZ0IsR0FBRyxJQUFJO1NBQ3ZCLDZCQUE2QixHQUFHLEtBQUs7U0FFckMsc0JBQXNCLEdBQUcsSUFBSTtTQUM3Qix5QkFBeUIsR0FBRyxJQUFJO1NBRWhDLHlCQUF5QixHQUFHLElBQUk7U0FFaEMsY0FBYyxHQUFHLElBQUk7U0FDckIsS0FBSyxHQUFHLElBQUk7U0FDWixxQkFBcUIsR0FBRyxLQUFLOzs7ZUE3QnpCLFFBQVE7O1dBK0JMLG1CQUFHO0FBQ1IsYUFBTyxJQUFJLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUE7S0FDNUM7Ozs7OztXQUlTLHNCQUFHO0FBQ1gsVUFBSSxD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QUFDLHFCQUFxQixFQUFFLENBQUE7QUFDL0MsVUFBSSxJQUFJLENBQUMsS0FBSyxLQUFLLE9BQU8sRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUE7QUFDdkMsV0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUE7QUFDaEIsVUFBSSxDQUFDLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUE7S0FDL0U7OztTQVpHLGlCQUFpQjtHQUFTLFFBQVE7O0FBY3hDLGlCQUFpQixDQUFDLFFBQVEsRUFBRSxDQUFBOztJQUV0QixpQkFBaUI7WUFBakIsaUJBQWlCOztXQUFqQixpQkFBaUI7MEJBQWpCLGlCQUFpQjs7K0JBQWpCLGlCQUFpQjs7U0FDckIsS0FBSyxHQUFHLE9BQU87OztTQURYLGlCQUFpQjtHQUFTLGlCQUFpQjs7QUFHakQsaUJBQWlCLENBQUMsUUFBUSxFQUFFLENBQUEiLCJmaWxlIjoiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvb3BlcmF0b3IuanMiLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBiYWJlbFwiXG5cbmNvbnN0IF8gPSByZXF1aXJlKFwidW5kZXJzY29yZS1wbHVzXCIpXG5jb25zdCBCYXNlID0gcmVxdWlyZShcIi4vYmFzZVwiKVxuXG5jbGFzcyBPcGVyYXRvciBleHRlbmRzIEJhc2Uge1xuICBzdGF0aWMgb3BlcmF0aW9uS2luZCA9IFwib3BlcmF0b3JcIlxuICByZWNvcmRhYmxlID0gdHJ1ZVxuXG4gIHdpc2UgPSBudWxsXG4gIHRhcmdldCA9IG51bGxcbiAgb2NjdXJyZW5jZSA9IGZhbHNlXG4gIG9jY3VycmVuY2VUeXBlID0gXCJiYXNlXCJcblxuICBmbGFzaFRhcmdldCA9IHRydWVcbiAgZmxhc2hDaGVja3BvaW50ID0gXCJkaWQtZmluaXNoXCJcbiAgZmxhc2hUeXBlID0gXCJvcGVyYXRvclwiXG4gIGZsYXNoVHlwZUZvck9jY3VycmVuY2UgPSBcIm9wZXJhdG9yLW9jY3VycmVuY2VcIlxuICB0cmFja0NoYW5nZSA9IGZhbHNlXG5cbiAgcGF0dGVybkZvck9jY3VycmVuY2UgPSBudWxsXG4gIHN0YXlBdFNhbWVQb3NpdGlvbiA9IG51bGxcbiAgc3RheU9wdGlvbk5hbWUgPSBudWxsXG4gIHN0YXlCeU1hcmtlciA9IGZhbHNlXG4gIHJlc3RvcmVQb3NpdGlvbnMgPSB0cnVlXG4gIHNldFRvRmlyc3RDaGFyYWN0ZXJPbkxpbmV3aXNlID0gZmFsc2VcblxuICBhY2NlcHRQcmVzZXRPY2N1cnJlbmNlID0gdHJ1ZVxuICBhY2NlcHRQZXJzaXN0ZW50U2VsZWN0aW9uID0gdHJ1ZVxuXG4gIGJ1ZmZlckNoZWNrcG9pbnRCeVB1cnBvc2UgPSBudWxsXG5cbiAgdGFyZ2V0U2VsZWN0ZWQgPSBudWxsXG4gIGlucHV0ID0gbnVsbFxuICByZWFkSW5wdXRBZnRlckV4ZWN1dGUgPSBmYWxzZVxuXG4gIGlzUmVhZHkoKSB7XG4gICAgcmV0dXJuIHRoaXMudGFyZ2V0ICYmIHRoaXMudGFyZ2V0LmlzUmVhZHkoKVxuICB9XG5cbiAgLy8gQ2FsbGVkIHdoZW4gb3BlcmF0aW9uIGZpbmlzaGVkXG4gIC8vIFRoaXMgaXMgZXNzZW50aWFsbHkgdG8gcmVzZXQgc3RhdGUgZm9yIGAuYCByZXBlYXQuXG4gIHJlc2V0U3RhdGUoKSB7XG4gICAgdGhpcy50YXJnZXRTZWxlY3RlZCA9IG51bGxcbiAgICB0aGlzLm9jY3VycmVuY2VTZWxlY3RlZCA9IGZhbHNlXG4gIH1cblxuICAvLyBUd28gY2hlY2twb2ludCBmb3IgZGlmZmVyZW50IHB1cnBvc2VcbiAgLy8gLSBvbmUgZm9yIHVuZG8oaGFuZGxlZCBieSBtb2RlTWFuYWdlcilcbiAgLy8gLSBvbmUgZm9yIHByZXNlcnZlIGxhc3QgaW5zZXJ0ZWQgdGV4dFxuICBjcmVhdGVCdWZmZXJDaGVja3BvaW50KHB1cnBvc2UpIHtcbiAgICBpZiAoIXRoaXMuYnVmZmVyQ2hlY2twb2ludEJ5UHVycG9zZSkgdGhpcy5idWZmZXJDaGVja3BvaW50QnlQdXJwb3NlID0ge31cbiAgICB0aGlzLmJ1ZmZlckNoZWNrcG9pbnRCeVB1cnBvc2VbcHVycG9zZV0gPSB0aGlzLmVkaXRvci5jcmVhdGVDaGVja3BvaW50KClcbiAgfVxuXG4gIGdldEJ1ZmZlckNoZWNrcG9pbnQocHVycG9zZSkge1xuICAgIGlmICh0aGlzLmJ1ZmZlckNoZWNrcG9pbnRCeVB1cnBvc2UpIHtcbiAgICAgIHJldHVybiB0aGlzLmJ1ZmZlckNoZWNrcG9pbnRCeVB1cnBvc2VbcHVycG9zZV1cbiAgICB9XG4gIH1cblxuICBkZWxldGVCdWZmZXJDaGVja3BvaW50KHB1cnBvc2UpIHtcbiAgICBpZiAodGhpcy5idWZmZXJDaGVja3BvaW50QnlQdXJwb3NlKSB7XG4gICAgICBkZWxldGUgdGhpcy5idWZmZXJDaGVja3BvaW50QnlQdXJwb3NlW3B1cnBvc2VdXG4gICAgfVxuICB9XG5cbiAgZ3JvdXBDaGFuZ2VzU2luY2VCdWZmZXJDaGVja3BvaW50KHB1cnBvc2UpIHtcbiAgICBjb25zdCBjaGVja3BvaW50ID0gdGhpcy5nZXRCdWZmZXJDaGVja3BvaW50KHB1cnBvc2UpXG4gICAgaWYgKGNoZWNrcG9pbnQpIHtcbiAgICAgIHRoaXMuZWRpdG9yLmdyb3VwQ2hhbmdlc1NpbmNlQ2hlY2twb2ludChjaGVja3BvaW50KVxuICAgICAgdGhpcy5kZWxldGVCdWZmZXJDaGVja3BvaW50KHB1cnBvc2UpXG4gICAgfVxuICB9XG5cbiAgc2V0TWFya0ZvckNoYW5nZShyYW5nZSkge1xuICAgIHRoaXMudmltU3RhdGUubWFyay5zZXQoXCJbXCIsIHJhbmdlLnN0YXJ0KVxuICAgIHRoaXMudmltU3RhdGUubWFyay5zZXQoXCJdXCIsIHJhbmdlLmVuZClcbiAgfVxuXG4gIG5lZWRGbGFzaCgpIHtcbiAgICByZXR1cm4gKFxuICAgICAgdGhpcy5mbGFzaFRhcmdldCAmJlxuICAgICAgdGhpcy5nZXRDb25maWcoXCJmbGFzaE9uT3BlcmF0ZVwiKSAmJlxuICAgICAgIXRoaXMuZ2V0Q29uZmlnKFwiZmxhc2hPbk9wZXJhdGVCbGFja2xpc3RcIikuaW5jbHVkZXModGhpcy5uYW1lKSAmJlxuICAgICAgKHRoaXMubW9kZSAhPT0gXCJ2aXN1YWxcIiB8fCB0aGlzLnN1Ym1vZGUgIT09IHRoaXMudGFyZ2V0Lndpc2UpIC8vIGUuZy4gWSBpbiB2Q1xuICAgIClcbiAgfVxuXG4gIGZsYXNoSWZOZWNlc3NhcnkocmFuZ2VzKSB7XG4gICAgaWYgKHRoaXMubmVlZEZsYXNoKCkpIHtcbiAgICAgIHRoaXMudmltU3RhdGUuZmxhc2gocmFuZ2VzLCB7dHlwZTogdGhpcy5nZXRGbGFzaFR5cGUoKX0pXG4gICAgfVxuICB9XG5cbiAgZmxhc2hDaGFuZ2VJZk5lY2Vzc2FyeSgpIHtcbiAgICBpZiAodGhpcy5uZWVkRmxhc2goKSkge1xuICAgICAgdGhpcy5vbkRpZEZpbmlzaE9wZXJhdGlvbigoKSA9PiB7XG4gICAgICAgIGNvbnN0IHJhbmdlcyA9IHRoaXMubXV0YXRpb25NYW5hZ2VyLmdldFNlbGVjdGVkQnVmZmVyUmFuZ2VzRm9yQ2hlY2twb2ludCh0aGlzLmZsYXNoQ2hlY2twb2ludClcbiAgICAgICAgdGhpcy52aW1TdGF0ZS5mbGFzaChyYW5nZXMsIHt0eXBlOiB0aGlzLmdldEZsYXNoVHlwZSgpfSlcbiAgICAgIH0pXG4gICAgfVxuICB9XG5cbiAgZ2V0Rmxhc2hUeXBlKCkge1xuICAgIHJldHVybiB0aGlzLm9jY3VycmVuY2VTZWxlY3RlZCA/IHRoaXMuZmxhc2hUeXBlRm9yT2NjdXJyZW5jZSA6IHRoaXMuZmxhc2hUeXBlXG4gIH1cblxuICB0cmFja0NoYW5nZUlmTmVjZXNzYXJ5KCkge1xuICAgIGlmICghdGhpcy50cmFja0NoYW5nZSkgcmV0dXJuXG4gICAgdGhpcy5vbkRpZEZpbmlzaE9wZXJhdGlvbigoKSA9PiB7XG4gICAgICBjb25zdCByYW5nZSA9IHRoaXMubXV0YXRpb25NYW5hZ2VyLmdldE11dGF0ZWRCdWZmZXJSYW5nZUZvclNlbGVjdGlvbih0aGlzLmVkaXRvci5nZXRMYXN0U2VsZWN0aW9uKCkpXG4gICAgICBpZiAocmFuZ2UpIHRoaXMuc2V0TWFya0ZvckNoYW5nZShyYW5nZSlcbiAgICB9KVxuICB9XG5cbiAgaW5pdGlhbGl6ZSgpIHtcbiAgICB0aGlzLnN1YnNjcmliZVJlc2V0T2NjdXJyZW5jZVBhdHRlcm5JZk5lZWRlZCgpXG5cbiAgICAvLyBXaGVuIHByZXNldC1vY2N1cnJlbmNlIHdhcyBleGlzdHMsIG9wZXJhdGUgb24gb2NjdXJyZW5jZS13aXNlXG4gICAgaWYgKHRoaXMuYWNjZXB0UHJlc2V0T2NjdXJyZW5jZSAmJiB0aGlzLm9jY3VycmVuY2VNYW5hZ2VyLmhhc01hcmtlcnMoKSkge1xuICAgICAgdGhpcy5vY2N1cnJlbmNlID0gdHJ1ZVxuICAgIH1cblxuICAgIC8vIFtGSVhNRV0gT1JERVItTUFUVEVSXG4gICAgLy8gVG8gcGljayBjdXJzb3Itd29yZCB0byBmaW5kIG9jY3VycmVuY2UgYmFzZSBwYXR0ZXJuLlxuICAgIC8vIFRoaXMgaGFzIHRvIGJlIGRvbmUgQkVGT1JFIGNvbnZlcnRpbmcgcGVyc2lzdGVudC1zZWxlY3Rpb24gaW50byByZWFsLXNlbGVjdGlvbi5cbiAgICAvLyBTaW5jZSB3aGVuIHBlcnNpc3RlbnQtc2VsZWN0aW9uIGlzIGFjdHVhbGx5IHNlbGVjdGVkLCBpdCBjaGFuZ2UgY3Vyc29yIHBvc2l0aW9uLlxuICAgIGlmICh0aGlzLm9jY3VycmVuY2UgJiYgIXRoaXMub2NjdXJyZW5jZU1hbmFnZXIuaGFzTWFya2VycygpKSB7XG4gICAgICBjb25zdCByZWdleCA9IHRoaXMucGF0dGVybkZvck9jY3VycmVuY2UgfHwgdGhpcy5nZXRQYXR0ZXJuRm9yT2NjdXJyZW5jZVR5cGUodGhpcy5vY2N1cnJlbmNlVHlwZSlcbiAgICAgIHRoaXMub2NjdXJyZW5jZU1hbmFnZXIuYWRkUGF0dGVybihyZWdleClcbiAgICB9XG5cbiAgICAvLyBUaGlzIGNoYW5nZSBjdXJzb3IgcG9zaXRpb24uXG4gICAgaWYgKHRoaXMuc2VsZWN0UGVyc2lzdGVudFNlbGVjdGlvbklmTmVjZXNzYXJ5KCkpIHtcbiAgICAgIC8vIFtGSVhNRV0gc2VsZWN0aW9uLXdpc2UgaXMgbm90IHN5bmNoZWQgaWYgaXQgYWxyZWFkeSB2aXN1YWwtbW9kZVxuICAgICAgaWYgKHRoaXMubW9kZSAhPT0gXCJ2aXN1YWxcIikge1xuICAgICAgICB0aGlzLnZpbVN0YXRlLm1vZGVNYW5hZ2VyLmFjdGl2YXRlKFwidmlzdWFsXCIsIHRoaXMuc3dyYXAuZGV0ZWN0V2lzZSh0aGlzLmVkaXRvcikpXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHRoaXMubW9kZSA9PT0gXCJ2aXN1YWxcIikge1xuICAgICAgdGhpcy50YXJnZXQgPSBcIkN1cnJlbnRTZWxlY3Rpb25cIlxuICAgIH1cbiAgICBpZiAoXy5pc1N0cmluZyh0aGlzLnRhcmdldCkpIHtcbiAgICAgIHRoaXMuc2V0VGFyZ2V0KHRoaXMuZ2V0SW5zdGFuY2UodGhpcy50YXJnZXQpKVxuICAgIH1cblxuICAgIHN1cGVyLmluaXRpYWxpemUoKVxuICB9XG5cbiAgc3Vic2NyaWJlUmVzZXRPY2N1cnJlbmNlUGF0dGVybklmTmVlZGVkKCkge1xuICAgIC8vIFtDQVVUSU9OXVxuICAgIC8vIFRoaXMgbWV0aG9kIGhhcyB0byBiZSBjYWxsZWQgaW4gUFJPUEVSIHRpbWluZy5cbiAgICAvLyBJZiBvY2N1cnJlbmNlIGlzIHRydWUgYnV0IG5vIHByZXNldC1vY2N1cnJlbmNlXG4gICAgLy8gVHJlYXQgdGhhdCBgb2NjdXJyZW5jZWAgaXMgQk9VTkRFRCB0byBvcGVyYXRvciBpdHNlbGYsIHNvIGNsZWFucCBhdCBmaW5pc2hlZC5cbiAgICBpZiAodGhpcy5vY2N1cnJlbmNlICYmICF0aGlzLm9jY3VycmVuY2VNYW5hZ2VyLmhhc01hcmtlcnMoKSkge1xuICAgICAgdGhpcy5vbkRpZFJlc2V0T3BlcmF0aW9uU3RhY2soKCkgPT4gdGhpcy5vY2N1cnJlbmNlTWFuYWdlci5yZXNldFBhdHRlcm5zKCkpXG4gICAgfVxuICB9XG5cbiAgc2V0TW9kaWZpZXIoe3dpc2UsIG9jY3VycmVuY2UsIG9jY3VycmVuY2VUeXBlfSkge1xuICAgIGlmICh3aXNlKSB7XG4gICAgICB0aGlzLndpc2UgPSB3aXNlXG4gICAgfSBlbHNlIGlmIChvY2N1cnJlbmNlKSB7XG4gICAgICB0aGlzLm9jY3VycmVuY2UgPSBvY2N1cnJlbmNlXG4gICAgICB0aGlzLm9jY3VycmVuY2VUeXBlID0gb2NjdXJyZW5jZVR5cGVcbiAgICAgIC8vIFRoaXMgaXMgbyBtb2RpZmllciBjYXNlKGUuZy4gYGMgbyBwYCwgYGQgTyBmYClcbiAgICAgIC8vIFdlIFJFU0VUIGV4aXN0aW5nIG9jY3VyZW5jZS1tYXJrZXIgd2hlbiBgb2Agb3IgYE9gIG1vZGlmaWVyIGlzIHR5cGVkIGJ5IHVzZXIuXG4gICAgICBjb25zdCByZWdleCA9IHRoaXMuZ2V0UGF0dGVybkZvck9jY3VycmVuY2VUeXBlKG9jY3VycmVuY2VUeXBlKVxuICAgICAgdGhpcy5vY2N1cnJlbmNlTWFuYWdlci5hZGRQYXR0ZXJuKHJlZ2V4LCB7cmVzZXQ6IHRydWUsIG9jY3VycmVuY2VUeXBlfSlcbiAgICAgIHRoaXMub25EaWRSZXNldE9wZXJhdGlvblN0YWNrKCgpID0+IHRoaXMub2NjdXJyZW5jZU1hbmFnZXIucmVzZXRQYXR0ZXJucygpKVxuICAgIH1cbiAgfVxuXG4gIC8vIHJldHVybiB0cnVlL2ZhbHNlIHRvIGluZGljYXRlIHN1Y2Nlc3NcbiAgc2VsZWN0UGVyc2lzdGVudFNlbGVjdGlvbklmTmVjZXNzYXJ5KCkge1xuICAgIGlmIChcbiAgICAgIHRoaXMuYWNjZXB0UGVyc2lzdGVudFNlbGVjdGlvbiAmJlxuICAgICAgdGhpcy5nZXRDb25maWcoXCJhdXRvU2VsZWN0UGVyc2lzdGVudFNlbGVjdGlvbk9uT3BlcmF0ZVwiKSAmJlxuICAgICAgIXRoaXMucGVyc2lzdGVudFNlbGVjdGlvbi5pc0VtcHR5KClcbiAgICApIHtcbiAgICAgIHRoaXMucGVyc2lzdGVudFNlbGVjdGlvbi5zZWxlY3QoKVxuICAgICAgdGhpcy5lZGl0b3IubWVyZ2VJbnRlcnNlY3RpbmdTZWxlY3Rpb25zKClcbiAgICAgIHRoaXMuc3dyYXAuc2F2ZVByb3BlcnRpZXModGhpcy5lZGl0b3IpXG5cbiAgICAgIHJldHVybiB0cnVlXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cbiAgfVxuXG4gIGdldFBhdHRlcm5Gb3JPY2N1cnJlbmNlVHlwZShvY2N1cnJlbmNlVHlwZSkge1xuICAgIGlmIChvY2N1cnJlbmNlVHlwZSA9PT0gXCJiYXNlXCIpIHtcbiAgICAgIHJldHVybiB0aGlzLnV0aWxzLmdldFdvcmRQYXR0ZXJuQXRCdWZmZXJQb3NpdGlvbih0aGlzLmVkaXRvciwgdGhpcy5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpKVxuICAgIH0gZWxzZSBpZiAob2NjdXJyZW5jZVR5cGUgPT09IFwic3Vid29yZFwiKSB7XG4gICAgICByZXR1cm4gdGhpcy51dGlscy5nZXRTdWJ3b3JkUGF0dGVybkF0QnVmZmVyUG9zaXRpb24odGhpcy5lZGl0b3IsIHRoaXMuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKSlcbiAgICB9XG4gIH1cblxuICAvLyB0YXJnZXQgaXMgVGV4dE9iamVjdCBvciBNb3Rpb24gdG8gb3BlcmF0ZSBvbi5cbiAgc2V0VGFyZ2V0KHRhcmdldCkge1xuICAgIHRoaXMudGFyZ2V0ID0gdGFyZ2V0XG4gICAgdGhpcy50YXJnZXQub3BlcmF0b3IgPSB0aGlzXG4gICAgdGhpcy5lbWl0RGlkU2V0VGFyZ2V0KHRoaXMpXG4gIH1cblxuICBzZXRUZXh0VG9SZWdpc3RlckZvclNlbGVjdGlvbihzZWxlY3Rpb24pIHtcbiAgICB0aGlzLnNldFRleHRUb1JlZ2lzdGVyKHNlbGVjdGlvbi5nZXRUZXh0KCksIHNlbGVjdGlvbilcbiAgfVxuXG4gIHNldFRleHRUb1JlZ2lzdGVyKHRleHQsIHNlbGVjdGlvbikge1xuICAgIGlmICh0aGlzLnZpbVN0YXRlLnJlZ2lzdGVyLmlzVW5uYW1lZCgpICYmIHRoaXMuaXNCbGFja2hvbGVSZWdpc3RlcmVkT3BlcmF0b3IoKSkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgY29uc3Qgd2lzZSA9IHRoaXMub2NjdXJyZW5jZVNlbGVjdGVkID8gdGhpcy5vY2N1cnJlbmNlV2lzZSA6IHRoaXMudGFyZ2V0Lndpc2VcbiAgICBpZiAod2lzZSA9PT0gXCJsaW5ld2lzZVwiICYmICF0ZXh0LmVuZHNXaXRoKFwiXFxuXCIpKSB7XG4gICAgICB0ZXh0ICs9IFwiXFxuXCJcbiAgICB9XG5cbiAgICBpZiAodGV4dCkge1xuICAgICAgdGhpcy52aW1TdGF0ZS5yZWdpc3Rlci5zZXQobnVsbCwge3RleHQsIHNlbGVjdGlvbn0pXG5cbiAgICAgIGlmICh0aGlzLnZpbVN0YXRlLnJlZ2lzdGVyLmlzVW5uYW1lZCgpKSB7XG4gICAgICAgIGlmICh0aGlzLmluc3RhbmNlb2YoXCJEZWxldGVcIikgfHwgdGhpcy5pbnN0YW5jZW9mKFwiQ2hhbmdlXCIpKSB7XG4gICAgICAgICAgaWYgKCF0aGlzLm5lZWRTYXZlVG9OdW1iZXJlZFJlZ2lzdGVyKHRoaXMudGFyZ2V0KSAmJiB0aGlzLnV0aWxzLmlzU2luZ2xlTGluZVRleHQodGV4dCkpIHtcbiAgICAgICAgICAgIHRoaXMudmltU3RhdGUucmVnaXN0ZXIuc2V0KFwiLVwiLCB7dGV4dCwgc2VsZWN0aW9ufSkgLy8gc21hbGwtY2hhbmdlXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMudmltU3RhdGUucmVnaXN0ZXIuc2V0KFwiMVwiLCB7dGV4dCwgc2VsZWN0aW9ufSlcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5pbnN0YW5jZW9mKFwiWWFua1wiKSkge1xuICAgICAgICAgIHRoaXMudmltU3RhdGUucmVnaXN0ZXIuc2V0KFwiMFwiLCB7dGV4dCwgc2VsZWN0aW9ufSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGlzQmxhY2tob2xlUmVnaXN0ZXJlZE9wZXJhdG9yKCkge1xuICAgIGNvbnN0IG9wZXJhdG9ycyA9IHRoaXMuZ2V0Q29uZmlnKFwiYmxhY2tob2xlUmVnaXN0ZXJlZE9wZXJhdG9yc1wiKVxuICAgIGNvbnN0IHdpbGRDYXJkT3BlcmF0b3JzID0gb3BlcmF0b3JzLmZpbHRlcihuYW1lID0+IG5hbWUuZW5kc1dpdGgoXCIqXCIpKVxuICAgIGNvbnN0IGNvbW1hbmROYW1lID0gdGhpcy5nZXRDb21tYW5kTmFtZVdpdGhvdXRQcmVmaXgoKVxuICAgIHJldHVybiAoXG4gICAgICB3aWxkQ2FyZE9wZXJhdG9ycy5zb21lKG5hbWUgPT4gbmV3IFJlZ0V4cChcIl5cIiArIG5hbWUucmVwbGFjZShcIipcIiwgXCIuKlwiKSkudGVzdChjb21tYW5kTmFtZSkpIHx8XG4gICAgICBvcGVyYXRvcnMuaW5jbHVkZXMoY29tbWFuZE5hbWUpXG4gICAgKVxuICB9XG5cbiAgbmVlZFNhdmVUb051bWJlcmVkUmVnaXN0ZXIodGFyZ2V0KSB7XG4gICAgLy8gVXNlZCB0byBkZXRlcm1pbmUgd2hhdCByZWdpc3RlciB0byB1c2Ugb24gY2hhbmdlIGFuZCBkZWxldGUgb3BlcmF0aW9uLlxuICAgIC8vIEZvbGxvd2luZyBtb3Rpb24gc2hvdWxkIHNhdmUgdG8gMS05IHJlZ2lzdGVyIHJlZ2VyZGxlc3Mgb2YgY29udGVudCBpcyBzbWFsbCBvciBiaWcuXG4gICAgY29uc3QgZ29lc1RvTnVtYmVyZWRSZWdpc3Rlck1vdGlvbk5hbWVzID0gW1xuICAgICAgXCJNb3ZlVG9QYWlyXCIsIC8vICVcbiAgICAgIFwiTW92ZVRvTmV4dFNlbnRlbmNlXCIsIC8vICgsIClcbiAgICAgIFwiU2VhcmNoXCIsIC8vIC8sID8sIG4sIE5cbiAgICAgIFwiTW92ZVRvTmV4dFBhcmFncmFwaFwiLCAvLyB7LCB9XG4gICAgXVxuICAgIHJldHVybiBnb2VzVG9OdW1iZXJlZFJlZ2lzdGVyTW90aW9uTmFtZXMuc29tZShuYW1lID0+IHRhcmdldC5pbnN0YW5jZW9mKG5hbWUpKVxuICB9XG5cbiAgbm9ybWFsaXplU2VsZWN0aW9uc0lmTmVjZXNzYXJ5KCkge1xuICAgIGlmICh0aGlzLm1vZGUgPT09IFwidmlzdWFsXCIgJiYgdGhpcy50YXJnZXQgJiYgdGhpcy50YXJnZXQuaXNNb3Rpb24oKSkge1xuICAgICAgdGhpcy5zd3JhcC5ub3JtYWxpemUodGhpcy5lZGl0b3IpXG4gICAgfVxuICB9XG5cbiAgc3RhcnRNdXRhdGlvbihmbikge1xuICAgIHRoaXMubm9ybWFsaXplU2VsZWN0aW9uc0lmTmVjZXNzYXJ5KClcbiAgICB0aGlzLmVkaXRvci50cmFuc2FjdChmbilcbiAgICB0aGlzLmVtaXREaWRGaW5pc2hNdXRhdGlvbigpXG4gIH1cblxuICBtdXRhdGVTZWxlY3Rpb25zKCkge1xuICAgIGZvciAoY29uc3Qgc2VsZWN0aW9uIG9mIHRoaXMuZWRpdG9yLmdldFNlbGVjdGlvbnNPcmRlcmVkQnlCdWZmZXJQb3NpdGlvbigpKSB7XG4gICAgICB0aGlzLm11dGF0ZVNlbGVjdGlvbihzZWxlY3Rpb24pXG4gICAgfVxuICAgIHRoaXMubXV0YXRpb25NYW5hZ2VyLnNldENoZWNrcG9pbnQoXCJkaWQtZmluaXNoXCIpXG4gICAgdGhpcy5yZXN0b3JlQ3Vyc29yUG9zaXRpb25zSWZOZWNlc3NhcnkoKVxuICB9XG5cbiAgLy8gTWFpblxuICBleGVjdXRlKCkge1xuICAgIGlmICh0aGlzLnJlYWRJbnB1dEFmdGVyRXhlY3V0ZSAmJiAhdGhpcy5yZXBlYXRlZCkge1xuICAgICAgcmV0dXJuIHRoaXMuZXhlY3V0ZUFzeW5jVG9SZWFkSW5wdXRBZnRlckV4ZWN1dGUoKVxuICAgIH1cblxuICAgIHRoaXMuc3RhcnRNdXRhdGlvbigoKSA9PiB7XG4gICAgICBpZiAodGhpcy5zZWxlY3RUYXJnZXQoKSkgdGhpcy5tdXRhdGVTZWxlY3Rpb25zKClcbiAgICB9KVxuXG4gICAgLy8gRXZlbiB0aG91Z2ggd2UgZmFpbCB0byBzZWxlY3QgdGFyZ2V0IGFuZCBmYWlsIHRvIG11dGF0ZSxcbiAgICAvLyB3ZSBoYXZlIHRvIHJldHVybiB0byBub3JtYWwtbW9kZSBmcm9tIG9wZXJhdG9yLXBlbmRpbmcgb3IgdmlzdWFsXG4gICAgdGhpcy5hY3RpdmF0ZU1vZGUoXCJub3JtYWxcIilcbiAgfVxuXG4gIGFzeW5jIGV4ZWN1dGVBc3luY1RvUmVhZElucHV0QWZ0ZXJFeGVjdXRlKCkge1xuICAgIHRoaXMubm9ybWFsaXplU2VsZWN0aW9uc0lmTmVjZXNzYXJ5KClcbiAgICB0aGlzLmNyZWF0ZUJ1ZmZlckNoZWNrcG9pbnQoXCJ1bmRvXCIpXG5cbiAgICBpZiAodGhpcy5zZWxlY3RUYXJnZXQoKSkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgdGhpcy5pbnB1dCA9IGF3YWl0IHRoaXMuZm9jdXNJbnB1dFByb21pc2lmaWVkKHRoaXMuZm9jdXNJbnB1dE9wdGlvbnMpXG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGlmICh0aGlzLm1vZGUgIT09IFwidmlzdWFsXCIpIHtcbiAgICAgICAgICB0aGlzLmVkaXRvci5yZXZlcnRUb0NoZWNrcG9pbnQodGhpcy5nZXRCdWZmZXJDaGVja3BvaW50KFwidW5kb1wiKSlcbiAgICAgICAgICB0aGlzLmFjdGl2YXRlTW9kZShcIm5vcm1hbFwiKVxuICAgICAgICB9XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgdGhpcy5tdXRhdGVTZWxlY3Rpb25zKClcbiAgICAgIHRoaXMuZ3JvdXBDaGFuZ2VzU2luY2VCdWZmZXJDaGVja3BvaW50KFwidW5kb1wiKVxuICAgIH1cblxuICAgIHRoaXMuZW1pdERpZEZpbmlzaE11dGF0aW9uKClcbiAgICB0aGlzLmFjdGl2YXRlTW9kZShcIm5vcm1hbFwiKVxuICB9XG5cbiAgLy8gUmV0dXJuIHRydWUgdW5sZXNzIGFsbCBzZWxlY3Rpb24gaXMgZW1wdHkuXG4gIHNlbGVjdFRhcmdldCgpIHtcbiAgICBpZiAodGhpcy50YXJnZXRTZWxlY3RlZCAhPSBudWxsKSB7XG4gICAgICByZXR1cm4gdGhpcy50YXJnZXRTZWxlY3RlZFxuICAgIH1cbiAgICB0aGlzLm11dGF0aW9uTWFuYWdlci5pbml0KHtzdGF5QnlNYXJrZXI6IHRoaXMuc3RheUJ5TWFya2VyfSlcblxuICAgIGlmICh0aGlzLnRhcmdldC5pc01vdGlvbigpICYmIHRoaXMubW9kZSA9PT0gXCJ2aXN1YWxcIikgdGhpcy50YXJnZXQud2lzZSA9IHRoaXMuc3VibW9kZVxuICAgIGlmICh0aGlzLndpc2UgIT0gbnVsbCkgdGhpcy50YXJnZXQuZm9yY2VXaXNlKHRoaXMud2lzZSlcblxuICAgIHRoaXMuZW1pdFdpbGxTZWxlY3RUYXJnZXQoKVxuXG4gICAgLy8gQWxsb3cgY3Vyc29yIHBvc2l0aW9uIGFkanVzdG1lbnQgJ29uLXdpbGwtc2VsZWN0LXRhcmdldCcgaG9vay5cbiAgICAvLyBzbyBjaGVja3BvaW50IGNvbWVzIEFGVEVSIEBlbWl0V2lsbFNlbGVjdFRhcmdldCgpXG4gICAgdGhpcy5tdXRhdGlvbk1hbmFnZXIuc2V0Q2hlY2twb2ludChcIndpbGwtc2VsZWN0XCIpXG5cbiAgICAvLyBOT1RFOiBXaGVuIHJlcGVhdGVkLCBzZXQgb2NjdXJyZW5jZS1tYXJrZXIgZnJvbSBwYXR0ZXJuIHN0b3JlZCBhcyBzdGF0ZS5cbiAgICBpZiAodGhpcy5yZXBlYXRlZCAmJiB0aGlzLm9jY3VycmVuY2UgJiYgIXRoaXMub2NjdXJyZW5jZU1hbmFnZXIuaGFzTWFya2VycygpKSB7XG4gICAgICB0aGlzLm9jY3VycmVuY2VNYW5hZ2VyLmFkZFBhdHRlcm4odGhpcy5wYXR0ZXJuRm9yT2NjdXJyZW5jZSwge29jY3VycmVuY2VUeXBlOiB0aGlzLm9jY3VycmVuY2VUeXBlfSlcbiAgICB9XG5cbiAgICB0aGlzLnRhcmdldC5leGVjdXRlKClcblxuICAgIHRoaXMubXV0YXRpb25NYW5hZ2VyLnNldENoZWNrcG9pbnQoXCJkaWQtc2VsZWN0XCIpXG4gICAgaWYgKHRoaXMub2NjdXJyZW5jZSkge1xuICAgICAgaWYgKCF0aGlzLnBhdHRlcm5Gb3JPY2N1cnJlbmNlKSB7XG4gICAgICAgIC8vIFByZXNlcnZlIG9jY3VycmVuY2VQYXR0ZXJuIGZvciAuIHJlcGVhdC5cbiAgICAgICAgdGhpcy5wYXR0ZXJuRm9yT2NjdXJyZW5jZSA9IHRoaXMub2NjdXJyZW5jZU1hbmFnZXIuYnVpbGRQYXR0ZXJuKClcbiAgICAgIH1cblxuICAgICAgdGhpcy5vY2N1cnJlbmNlV2lzZSA9IHRoaXMud2lzZSB8fCBcImNoYXJhY3Rlcndpc2VcIlxuICAgICAgaWYgKHRoaXMub2NjdXJyZW5jZU1hbmFnZXIuc2VsZWN0KHRoaXMub2NjdXJyZW5jZVdpc2UpKSB7XG4gICAgICAgIHRoaXMub2NjdXJyZW5jZVNlbGVjdGVkID0gdHJ1ZVxuICAgICAgICB0aGlzLm11dGF0aW9uTWFuYWdlci5zZXRDaGVja3BvaW50KFwiZGlkLXNlbGVjdC1vY2N1cnJlbmNlXCIpXG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy50YXJnZXRTZWxlY3RlZCA9IHRoaXMudmltU3RhdGUuaGF2ZVNvbWVOb25FbXB0eVNlbGVjdGlvbigpIHx8IHRoaXMudGFyZ2V0Lm5hbWUgPT09IFwiRW1wdHlcIlxuICAgIGlmICh0aGlzLnRhcmdldFNlbGVjdGVkKSB7XG4gICAgICB0aGlzLmVtaXREaWRTZWxlY3RUYXJnZXQoKVxuICAgICAgdGhpcy5mbGFzaENoYW5nZUlmTmVjZXNzYXJ5KClcbiAgICAgIHRoaXMudHJhY2tDaGFuZ2VJZk5lY2Vzc2FyeSgpXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZW1pdERpZEZhaWxTZWxlY3RUYXJnZXQoKVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzLnRhcmdldFNlbGVjdGVkXG4gIH1cblxuICByZXN0b3JlQ3Vyc29yUG9zaXRpb25zSWZOZWNlc3NhcnkoKSB7XG4gICAgaWYgKCF0aGlzLnJlc3RvcmVQb3NpdGlvbnMpIHJldHVyblxuXG4gICAgY29uc3Qgc3RheSA9XG4gICAgICB0aGlzLnN0YXlBdFNhbWVQb3NpdGlvbiAhPSBudWxsXG4gICAgICAgID8gdGhpcy5zdGF5QXRTYW1lUG9zaXRpb25cbiAgICAgICAgOiB0aGlzLmdldENvbmZpZyh0aGlzLnN0YXlPcHRpb25OYW1lKSB8fCAodGhpcy5vY2N1cnJlbmNlU2VsZWN0ZWQgJiYgdGhpcy5nZXRDb25maWcoXCJzdGF5T25PY2N1cnJlbmNlXCIpKVxuICAgIGNvbnN0IHdpc2UgPSB0aGlzLm9jY3VycmVuY2VTZWxlY3RlZCA/IHRoaXMub2NjdXJyZW5jZVdpc2UgOiB0aGlzLnRhcmdldC53aXNlXG4gICAgY29uc3Qge3NldFRvRmlyc3RDaGFyYWN0ZXJPbkxpbmV3aXNlfSA9IHRoaXNcbiAgICB0aGlzLm11dGF0aW9uTWFuYWdlci5yZXN0b3JlQ3Vyc29yUG9zaXRpb25zKHtzdGF5LCB3aXNlLCBzZXRUb0ZpcnN0Q2hhcmFjdGVyT25MaW5ld2lzZX0pXG4gIH1cbn1cbk9wZXJhdG9yLnJlZ2lzdGVyKGZhbHNlKVxuXG5jbGFzcyBTZWxlY3RCYXNlIGV4dGVuZHMgT3BlcmF0b3Ige1xuICBmbGFzaFRhcmdldCA9IGZhbHNlXG4gIHJlY29yZGFibGUgPSBmYWxzZVxuXG4gIGV4ZWN1dGUoKSB7XG4gICAgdGhpcy5zdGFydE11dGF0aW9uKCgpID0+IHRoaXMuc2VsZWN0VGFyZ2V0KCkpXG5cbiAgICBpZiAodGhpcy50YXJnZXQuc2VsZWN0U3VjY2VlZGVkKSB7XG4gICAgICBpZiAodGhpcy50YXJnZXQuaXNUZXh0T2JqZWN0KCkpIHtcbiAgICAgICAgdGhpcy5lZGl0b3Iuc2Nyb2xsVG9DdXJzb3JQb3NpdGlvbigpXG4gICAgICB9XG4gICAgICBjb25zdCB3aXNlID0gdGhpcy5vY2N1cnJlbmNlU2VsZWN0ZWQgPyB0aGlzLm9jY3VycmVuY2VXaXNlIDogdGhpcy50YXJnZXQud2lzZVxuICAgICAgdGhpcy5hY3RpdmF0ZU1vZGVJZk5lY2Vzc2FyeShcInZpc3VhbFwiLCB3aXNlKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmNhbmNlbE9wZXJhdGlvbigpXG4gICAgfVxuICB9XG59XG5TZWxlY3RCYXNlLnJlZ2lzdGVyKGZhbHNlKVxuXG5jbGFzcyBTZWxlY3QgZXh0ZW5kcyBTZWxlY3RCYXNlIHtcbiAgZXhlY3V0ZSgpIHtcbiAgICB0aGlzLnN3cmFwLnNhdmVQcm9wZXJ0aWVzKHRoaXMuZWRpdG9yKVxuICAgIHN1cGVyLmV4ZWN1dGUoKVxuICB9XG59XG5TZWxlY3QucmVnaXN0ZXIoKVxuXG5jbGFzcyBTZWxlY3RMYXRlc3RDaGFuZ2UgZXh0ZW5kcyBTZWxlY3RCYXNlIHtcbiAgdGFyZ2V0ID0gXCJBTGF0ZXN0Q2hhbmdlXCJcbn1cblNlbGVjdExhdGVzdENoYW5nZS5yZWdpc3RlcigpXG5cbmNsYXNzIFNlbGVjdFByZXZpb3VzU2VsZWN0aW9uIGV4dGVuZHMgU2VsZWN0QmFzZSB7XG4gIHRhcmdldCA9IFwiUHJldmlvdXNTZWxlY3Rpb25cIlxufVxuU2VsZWN0UHJldmlvdXNTZWxlY3Rpb24ucmVnaXN0ZXIoKVxuXG5jbGFzcyBTZWxlY3RQZXJzaXN0ZW50U2VsZWN0aW9uIGV4dGVuZHMgU2VsZWN0QmFzZSB7XG4gIHRhcmdldCA9IFwiQVBlcnNpc3RlbnRTZWxlY3Rpb25cIlxuICBhY2NlcHRQZXJzaXN0ZW50U2VsZWN0aW9uID0gZmFsc2Vcbn1cblNlbGVjdFBlcnNpc3RlbnRTZWxlY3Rpb24ucmVnaXN0ZXIoKVxuXG5jbGFzcyBTZWxlY3RPY2N1cnJlbmNlIGV4dGVuZHMgU2VsZWN0QmFzZSB7XG4gIG9jY3VycmVuY2UgPSB0cnVlXG59XG5TZWxlY3RPY2N1cnJlbmNlLnJlZ2lzdGVyKClcblxuLy8gVmlzdWFsTW9kZVNlbGVjdDogdXNlZCBpbiB2aXN1YWwtbW9kZVxuLy8gV2hlbiB0ZXh0LW9iamVjdCBpcyBpbnZva2VkIGZyb20gbm9ybWFsIG9yIHZpdXNhbC1tb2RlLCBvcGVyYXRpb24gd291bGQgYmVcbi8vICA9PiBWaXN1YWxNb2RlU2VsZWN0IG9wZXJhdG9yIHdpdGggdGFyZ2V0PXRleHQtb2JqZWN0XG4vLyBXaGVuIG1vdGlvbiBpcyBpbnZva2VkIGZyb20gdmlzdWFsLW1vZGUsIG9wZXJhdGlvbiB3b3VsZCBiZVxuLy8gID0+IFZpc3VhbE1vZGVTZWxlY3Qgb3BlcmF0b3Igd2l0aCB0YXJnZXQ9bW90aW9uKVxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIFZpc3VhbE1vZGVTZWxlY3QgaXMgdXNlZCBpbiBUV08gc2l0dWF0aW9uLlxuLy8gLSB2aXN1YWwtbW9kZSBvcGVyYXRpb25cbi8vICAgLSBlLmc6IGB2IGxgLCBgViBqYCwgYHYgaSBwYC4uLlxuLy8gLSBEaXJlY3RseSBpbnZva2UgdGV4dC1vYmplY3QgZnJvbSBub3JtYWwtbW9kZVxuLy8gICAtIGUuZzogSW52b2tlIGBJbm5lciBQYXJhZ3JhcGhgIGZyb20gY29tbWFuZC1wYWxldHRlLlxuY2xhc3MgVmlzdWFsTW9kZVNlbGVjdCBleHRlbmRzIFNlbGVjdEJhc2Uge1xuICBhY2NlcHRQcmVzZXRPY2N1cnJlbmNlID0gZmFsc2VcbiAgYWNjZXB0UGVyc2lzdGVudFNlbGVjdGlvbiA9IGZhbHNlXG59XG5WaXN1YWxNb2RlU2VsZWN0LnJlZ2lzdGVyKGZhbHNlKVxuXG4vLyBQZXJzaXN0ZW50IFNlbGVjdGlvblxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PVxuY2xhc3MgQ3JlYXRlUGVyc2lzdGVudFNlbGVjdGlvbiBleHRlbmRzIE9wZXJhdG9yIHtcbiAgZmxhc2hUYXJnZXQgPSBmYWxzZVxuICBzdGF5QXRTYW1lUG9zaXRpb24gPSB0cnVlXG4gIGFjY2VwdFByZXNldE9jY3VycmVuY2UgPSBmYWxzZVxuICBhY2NlcHRQZXJzaXN0ZW50U2VsZWN0aW9uID0gZmFsc2VcblxuICBtdXRhdGVTZWxlY3Rpb24oc2VsZWN0aW9uKSB7XG4gICAgdGhpcy5wZXJzaXN0ZW50U2VsZWN0aW9uLm1hcmtCdWZmZXJSYW5nZShzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKSlcbiAgfVxufVxuQ3JlYXRlUGVyc2lzdGVudFNlbGVjdGlvbi5yZWdpc3RlcigpXG5cbmNsYXNzIFRvZ2dsZVBlcnNpc3RlbnRTZWxlY3Rpb24gZXh0ZW5kcyBDcmVhdGVQZXJzaXN0ZW50U2VsZWN0aW9uIHtcbiAgaW5pdGlhbGl6ZSgpIHtcbiAgICBpZiAodGhpcy5pc01vZGUoXCJub3JtYWxcIikpIHtcbiAgICAgIGNvbnN0IHBvaW50ID0gdGhpcy5lZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKVxuICAgICAgY29uc3QgbWFya2VyID0gdGhpcy5wZXJzaXN0ZW50U2VsZWN0aW9uLmdldE1hcmtlckF0UG9pbnQocG9pbnQpXG4gICAgICBpZiAobWFya2VyKSB0aGlzLnRhcmdldCA9IFwiRW1wdHlcIlxuICAgIH1cbiAgICBzdXBlci5pbml0aWFsaXplKClcbiAgfVxuXG4gIG11dGF0ZVNlbGVjdGlvbihzZWxlY3Rpb24pIHtcbiAgICBjb25zdCBwb2ludCA9IHRoaXMuZ2V0Q3Vyc29yUG9zaXRpb25Gb3JTZWxlY3Rpb24oc2VsZWN0aW9uKVxuICAgIGNvbnN0IG1hcmtlciA9IHRoaXMucGVyc2lzdGVudFNlbGVjdGlvbi5nZXRNYXJrZXJBdFBvaW50KHBvaW50KVxuICAgIGlmIChtYXJrZXIpIHtcbiAgICAgIG1hcmtlci5kZXN0cm95KClcbiAgICB9IGVsc2Uge1xuICAgICAgc3VwZXIubXV0YXRlU2VsZWN0aW9uKHNlbGVjdGlvbilcbiAgICB9XG4gIH1cbn1cblRvZ2dsZVBlcnNpc3RlbnRTZWxlY3Rpb24ucmVnaXN0ZXIoKVxuXG4vLyBQcmVzZXQgT2NjdXJyZW5jZVxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PVxuY2xhc3MgVG9nZ2xlUHJlc2V0T2NjdXJyZW5jZSBleHRlbmRzIE9wZXJhdG9yIHtcbiAgdGFyZ2V0ID0gXCJFbXB0eVwiXG4gIGZsYXNoVGFyZ2V0ID0gZmFsc2VcbiAgYWNjZXB0UHJlc2V0T2NjdXJyZW5jZSA9IGZhbHNlXG4gIGFjY2VwdFBlcnNpc3RlbnRTZWxlY3Rpb24gPSBmYWxzZVxuICBvY2N1cnJlbmNlVHlwZSA9IFwiYmFzZVwiXG5cbiAgZXhlY3V0ZSgpIHtcbiAgICBjb25zdCBtYXJrZXIgPSB0aGlzLm9jY3VycmVuY2VNYW5hZ2VyLmdldE1hcmtlckF0UG9pbnQodGhpcy5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpKVxuICAgIGlmIChtYXJrZXIpIHtcbiAgICAgIHRoaXMub2NjdXJyZW5jZU1hbmFnZXIuZGVzdHJveU1hcmtlcnMoW21hcmtlcl0pXG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGlzTmFycm93ZWQgPSB0aGlzLnZpbVN0YXRlLm1vZGVNYW5hZ2VyLmlzTmFycm93ZWQoKVxuXG4gICAgICBsZXQgcmVnZXhcbiAgICAgIGlmICh0aGlzLm1vZGUgPT09IFwidmlzdWFsXCIgJiYgIWlzTmFycm93ZWQpIHtcbiAgICAgICAgdGhpcy5vY2N1cnJlbmNlVHlwZSA9IFwiYmFzZVwiXG4gICAgICAgIHJlZ2V4ID0gbmV3IFJlZ0V4cChfLmVzY2FwZVJlZ0V4cCh0aGlzLmVkaXRvci5nZXRTZWxlY3RlZFRleHQoKSksIFwiZ1wiKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVnZXggPSB0aGlzLmdldFBhdHRlcm5Gb3JPY2N1cnJlbmNlVHlwZSh0aGlzLm9jY3VycmVuY2VUeXBlKVxuICAgICAgfVxuXG4gICAgICB0aGlzLm9jY3VycmVuY2VNYW5hZ2VyLmFkZFBhdHRlcm4ocmVnZXgsIHtvY2N1cnJlbmNlVHlwZTogdGhpcy5vY2N1cnJlbmNlVHlwZX0pXG4gICAgICB0aGlzLm9jY3VycmVuY2VNYW5hZ2VyLnNhdmVMYXN0UGF0dGVybih0aGlzLm9jY3VycmVuY2VUeXBlKVxuXG4gICAgICBpZiAoIWlzTmFycm93ZWQpIHRoaXMuYWN0aXZhdGVNb2RlKFwibm9ybWFsXCIpXG4gICAgfVxuICB9XG59XG5Ub2dnbGVQcmVzZXRPY2N1cnJlbmNlLnJlZ2lzdGVyKClcblxuY2xhc3MgVG9nZ2xlUHJlc2V0U3Vid29yZE9jY3VycmVuY2UgZXh0ZW5kcyBUb2dnbGVQcmVzZXRPY2N1cnJlbmNlIHtcbiAgb2NjdXJyZW5jZVR5cGUgPSBcInN1YndvcmRcIlxufVxuVG9nZ2xlUHJlc2V0U3Vid29yZE9jY3VycmVuY2UucmVnaXN0ZXIoKVxuXG4vLyBXYW50IHRvIHJlbmFtZSBSZXN0b3JlT2NjdXJyZW5jZU1hcmtlclxuY2xhc3MgQWRkUHJlc2V0T2NjdXJyZW5jZUZyb21MYXN0T2NjdXJyZW5jZVBhdHRlcm4gZXh0ZW5kcyBUb2dnbGVQcmVzZXRPY2N1cnJlbmNlIHtcbiAgZXhlY3V0ZSgpIHtcbiAgICB0aGlzLm9jY3VycmVuY2VNYW5hZ2VyLnJlc2V0UGF0dGVybnMoKVxuICAgIGNvbnN0IHJlZ2V4ID0gdGhpcy5nbG9iYWxTdGF0ZS5nZXQoXCJsYXN0T2NjdXJyZW5jZVBhdHRlcm5cIilcbiAgICBpZiAocmVnZXgpIHtcbiAgICAgIGNvbnN0IG9jY3VycmVuY2VUeXBlID0gdGhpcy5nbG9iYWxTdGF0ZS5nZXQoXCJsYXN0T2NjdXJyZW5jZVR5cGVcIilcbiAgICAgIHRoaXMub2NjdXJyZW5jZU1hbmFnZXIuYWRkUGF0dGVybihyZWdleCwge29jY3VycmVuY2VUeXBlfSlcbiAgICAgIHRoaXMuYWN0aXZhdGVNb2RlKFwibm9ybWFsXCIpXG4gICAgfVxuICB9XG59XG5BZGRQcmVzZXRPY2N1cnJlbmNlRnJvbUxhc3RPY2N1cnJlbmNlUGF0dGVybi5yZWdpc3RlcigpXG5cbi8vIERlbGV0ZVxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIERlbGV0ZSBleHRlbmRzIE9wZXJhdG9yIHtcbiAgdHJhY2tDaGFuZ2UgPSB0cnVlXG4gIGZsYXNoQ2hlY2twb2ludCA9IFwiZGlkLXNlbGVjdC1vY2N1cnJlbmNlXCJcbiAgZmxhc2hUeXBlRm9yT2NjdXJyZW5jZSA9IFwib3BlcmF0b3ItcmVtb3ZlLW9jY3VycmVuY2VcIlxuICBzdGF5T3B0aW9uTmFtZSA9IFwic3RheU9uRGVsZXRlXCJcbiAgc2V0VG9GaXJzdENoYXJhY3Rlck9uTGluZXdpc2UgPSB0cnVlXG5cbiAgZXhlY3V0ZSgpIHtcbiAgICB0aGlzLm9uRGlkU2VsZWN0VGFyZ2V0KCgpID0+IHtcbiAgICAgIGlmICh0aGlzLm9jY3VycmVuY2VTZWxlY3RlZCAmJiB0aGlzLm9jY3VycmVuY2VXaXNlID09PSBcImxpbmV3aXNlXCIpIHtcbiAgICAgICAgdGhpcy5mbGFzaFRhcmdldCA9IGZhbHNlXG4gICAgICB9XG4gICAgfSlcblxuICAgIGlmICh0aGlzLnRhcmdldC53aXNlID09PSBcImJsb2Nrd2lzZVwiKSB7XG4gICAgICB0aGlzLnJlc3RvcmVQb3NpdGlvbnMgPSBmYWxzZVxuICAgIH1cbiAgICBzdXBlci5leGVjdXRlKClcbiAgfVxuXG4gIG11dGF0ZVNlbGVjdGlvbihzZWxlY3Rpb24pIHtcbiAgICB0aGlzLnNldFRleHRUb1JlZ2lzdGVyRm9yU2VsZWN0aW9uKHNlbGVjdGlvbilcbiAgICBzZWxlY3Rpb24uZGVsZXRlU2VsZWN0ZWRUZXh0KClcbiAgfVxufVxuRGVsZXRlLnJlZ2lzdGVyKClcblxuY2xhc3MgRGVsZXRlUmlnaHQgZXh0ZW5kcyBEZWxldGUge1xuICB0YXJnZXQgPSBcIk1vdmVSaWdodFwiXG59XG5EZWxldGVSaWdodC5yZWdpc3RlcigpXG5cbmNsYXNzIERlbGV0ZUxlZnQgZXh0ZW5kcyBEZWxldGUge1xuICB0YXJnZXQgPSBcIk1vdmVMZWZ0XCJcbn1cbkRlbGV0ZUxlZnQucmVnaXN0ZXIoKVxuXG5jbGFzcyBEZWxldGVUb0xhc3RDaGFyYWN0ZXJPZkxpbmUgZXh0ZW5kcyBEZWxldGUge1xuICB0YXJnZXQgPSBcIk1vdmVUb0xhc3RDaGFyYWN0ZXJPZkxpbmVcIlxuXG4gIGV4ZWN1dGUoKSB7XG4gICAgdGhpcy5vbkRpZFNlbGVjdFRhcmdldCgoKSA9PiB7XG4gICAgICBpZiAodGhpcy50YXJnZXQud2lzZSA9PT0gXCJibG9ja3dpc2VcIikge1xuICAgICAgICBmb3IgKGNvbnN0IGJsb2Nrd2lzZVNlbGVjdGlvbiBvZiB0aGlzLmdldEJsb2Nrd2lzZVNlbGVjdGlvbnMoKSkge1xuICAgICAgICAgIGJsb2Nrd2lzZVNlbGVjdGlvbi5leHRlbmRNZW1iZXJTZWxlY3Rpb25zVG9FbmRPZkxpbmUoKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgICBzdXBlci5leGVjdXRlKClcbiAgfVxufVxuRGVsZXRlVG9MYXN0Q2hhcmFjdGVyT2ZMaW5lLnJlZ2lzdGVyKClcblxuY2xhc3MgRGVsZXRlTGluZSBleHRlbmRzIERlbGV0ZSB7XG4gIHdpc2UgPSBcImxpbmV3aXNlXCJcbiAgdGFyZ2V0ID0gXCJNb3ZlVG9SZWxhdGl2ZUxpbmVcIlxuICBmbGFzaFRhcmdldCA9IGZhbHNlXG59XG5EZWxldGVMaW5lLnJlZ2lzdGVyKClcblxuLy8gWWFua1xuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PVxuY2xhc3MgWWFuayBleHRlbmRzIE9wZXJhdG9yIHtcbiAgdHJhY2tDaGFuZ2UgPSB0cnVlXG4gIHN0YXlPcHRpb25OYW1lID0gXCJzdGF5T25ZYW5rXCJcblxuICBtdXRhdGVTZWxlY3Rpb24oc2VsZWN0aW9uKSB7XG4gICAgdGhpcy5zZXRUZXh0VG9SZWdpc3RlckZvclNlbGVjdGlvbihzZWxlY3Rpb24pXG4gIH1cbn1cbllhbmsucmVnaXN0ZXIoKVxuXG5jbGFzcyBZYW5rTGluZSBleHRlbmRzIFlhbmsge1xuICB3aXNlID0gXCJsaW5ld2lzZVwiXG4gIHRhcmdldCA9IFwiTW92ZVRvUmVsYXRpdmVMaW5lXCJcbn1cbllhbmtMaW5lLnJlZ2lzdGVyKClcblxuY2xhc3MgWWFua1RvTGFzdENoYXJhY3Rlck9mTGluZSBleHRlbmRzIFlhbmsge1xuICB0YXJnZXQgPSBcIk1vdmVUb0xhc3RDaGFyYWN0ZXJPZkxpbmVcIlxufVxuWWFua1RvTGFzdENoYXJhY3Rlck9mTGluZS5yZWdpc3RlcigpXG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFtjdHJsLWFdXG5jbGFzcyBJbmNyZWFzZSBleHRlbmRzIE9wZXJhdG9yIHtcbiAgdGFyZ2V0ID0gXCJFbXB0eVwiIC8vIGN0cmwtYSBpbiBub3JtYWwtbW9kZSBmaW5kIHRhcmdldCBudW1iZXIgaW4gY3VycmVudCBsaW5lIG1hbnVhbGx5XG4gIGZsYXNoVGFyZ2V0ID0gZmFsc2UgLy8gZG8gbWFudWFsbHlcbiAgcmVzdG9yZVBvc2l0aW9ucyA9IGZhbHNlIC8vIGRvIG1hbnVhbGx5XG4gIHN0ZXAgPSAxXG5cbiAgZXhlY3V0ZSgpIHtcbiAgICB0aGlzLm5ld1JhbmdlcyA9IFtdXG4gICAgaWYgKCF0aGlzLnJlZ2V4KSB0aGlzLnJlZ2V4ID0gbmV3IFJlZ0V4cChgJHt0aGlzLmdldENvbmZpZyhcIm51bWJlclJlZ2V4XCIpfWAsIFwiZ1wiKVxuXG4gICAgc3VwZXIuZXhlY3V0ZSgpXG5cbiAgICBpZiAodGhpcy5uZXdSYW5nZXMubGVuZ3RoKSB7XG4gICAgICBpZiAodGhpcy5nZXRDb25maWcoXCJmbGFzaE9uT3BlcmF0ZVwiKSAmJiAhdGhpcy5nZXRDb25maWcoXCJmbGFzaE9uT3BlcmF0ZUJsYWNrbGlzdFwiKS5pbmNsdWRlcyh0aGlzLm5hbWUpKSB7XG4gICAgICAgIHRoaXMudmltU3RhdGUuZmxhc2godGhpcy5uZXdSYW5nZXMsIHt0eXBlOiB0aGlzLmZsYXNoVHlwZUZvck9jY3VycmVuY2V9KVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJlcGxhY2VOdW1iZXJJbkJ1ZmZlclJhbmdlKHNjYW5SYW5nZSwgZm4pIHtcbiAgICBjb25zdCBuZXdSYW5nZXMgPSBbXVxuICAgIHRoaXMuc2NhbkZvcndhcmQodGhpcy5yZWdleCwge3NjYW5SYW5nZX0sIGV2ZW50ID0+IHtcbiAgICAgIGlmIChmbikge1xuICAgICAgICBpZiAoZm4oZXZlbnQpKSBldmVudC5zdG9wKClcbiAgICAgICAgZWxzZSByZXR1cm5cbiAgICAgIH1cbiAgICAgIGNvbnN0IG5leHROdW1iZXIgPSB0aGlzLmdldE5leHROdW1iZXIoZXZlbnQubWF0Y2hUZXh0KVxuICAgICAgbmV3UmFuZ2VzLnB1c2goZXZlbnQucmVwbGFjZShTdHJpbmcobmV4dE51bWJlcikpKVxuICAgIH0pXG4gICAgcmV0dXJuIG5ld1Jhbmdlc1xuICB9XG5cbiAgbXV0YXRlU2VsZWN0aW9uKHNlbGVjdGlvbikge1xuICAgIGNvbnN0IHtjdXJzb3J9ID0gc2VsZWN0aW9uXG4gICAgaWYgKHRoaXMudGFyZ2V0LmlzKFwiRW1wdHlcIikpIHtcbiAgICAgIC8vIGN0cmwtYSwgY3RybC14IGluIGBub3JtYWwtbW9kZWBcbiAgICAgIGNvbnN0IGN1cnNvclBvc2l0aW9uID0gY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKClcbiAgICAgIGNvbnN0IHNjYW5SYW5nZSA9IHRoaXMuZWRpdG9yLmJ1ZmZlclJhbmdlRm9yQnVmZmVyUm93KGN1cnNvclBvc2l0aW9uLnJvdylcbiAgICAgIGNvbnN0IG5ld1JhbmdlcyA9IHRoaXMucmVwbGFjZU51bWJlckluQnVmZmVyUmFuZ2Uoc2NhblJhbmdlLCBldmVudCA9PlxuICAgICAgICBldmVudC5yYW5nZS5lbmQuaXNHcmVhdGVyVGhhbihjdXJzb3JQb3NpdGlvbilcbiAgICAgIClcbiAgICAgIGNvbnN0IHBvaW50ID0gKG5ld1Jhbmdlcy5sZW5ndGggJiYgbmV3UmFuZ2VzWzBdLmVuZC50cmFuc2xhdGUoWzAsIC0xXSkpIHx8IGN1cnNvclBvc2l0aW9uXG4gICAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24ocG9pbnQpXG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHNjYW5SYW5nZSA9IHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpXG4gICAgICB0aGlzLm5ld1Jhbmdlcy5wdXNoKC4uLnRoaXMucmVwbGFjZU51bWJlckluQnVmZmVyUmFuZ2Uoc2NhblJhbmdlKSlcbiAgICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihzY2FuUmFuZ2Uuc3RhcnQpXG4gICAgfVxuICB9XG5cbiAgZ2V0TmV4dE51bWJlcihudW1iZXJTdHJpbmcpIHtcbiAgICByZXR1cm4gTnVtYmVyLnBhcnNlSW50KG51bWJlclN0cmluZywgMTApICsgdGhpcy5zdGVwICogdGhpcy5nZXRDb3VudCgpXG4gIH1cbn1cbkluY3JlYXNlLnJlZ2lzdGVyKClcblxuLy8gW2N0cmwteF1cbmNsYXNzIERlY3JlYXNlIGV4dGVuZHMgSW5jcmVhc2Uge1xuICBzdGVwID0gLTFcbn1cbkRlY3JlYXNlLnJlZ2lzdGVyKClcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gW2cgY3RybC1hXVxuY2xhc3MgSW5jcmVtZW50TnVtYmVyIGV4dGVuZHMgSW5jcmVhc2Uge1xuICBiYXNlTnVtYmVyID0gbnVsbFxuICB0YXJnZXQgPSBudWxsXG5cbiAgZ2V0TmV4dE51bWJlcihudW1iZXJTdHJpbmcpIHtcbiAgICBpZiAodGhpcy5iYXNlTnVtYmVyICE9IG51bGwpIHtcbiAgICAgIHRoaXMuYmFzZU51bWJlciArPSB0aGlzLnN0ZXAgKiB0aGlzLmdldENvdW50KClcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5iYXNlTnVtYmVyID0gTnVtYmVyLnBhcnNlSW50KG51bWJlclN0cmluZywgMTApXG4gICAgfVxuICAgIHJldHVybiB0aGlzLmJhc2VOdW1iZXJcbiAgfVxufVxuSW5jcmVtZW50TnVtYmVyLnJlZ2lzdGVyKClcblxuLy8gW2cgY3RybC14XVxuY2xhc3MgRGVjcmVtZW50TnVtYmVyIGV4dGVuZHMgSW5jcmVtZW50TnVtYmVyIHtcbiAgc3RlcCA9IC0xXG59XG5EZWNyZW1lbnROdW1iZXIucmVnaXN0ZXIoKVxuXG4vLyBQdXRcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEN1cnNvciBwbGFjZW1lbnQ6XG4vLyAtIHBsYWNlIGF0IGVuZCBvZiBtdXRhdGlvbjogcGFzdGUgbm9uLW11bHRpbGluZSBjaGFyYWN0ZXJ3aXNlIHRleHRcbi8vIC0gcGxhY2UgYXQgc3RhcnQgb2YgbXV0YXRpb246IG5vbi1tdWx0aWxpbmUgY2hhcmFjdGVyd2lzZSB0ZXh0KGNoYXJhY3Rlcndpc2UsIGxpbmV3aXNlKVxuY2xhc3MgUHV0QmVmb3JlIGV4dGVuZHMgT3BlcmF0b3Ige1xuICBsb2NhdGlvbiA9IFwiYmVmb3JlXCJcbiAgdGFyZ2V0ID0gXCJFbXB0eVwiXG4gIGZsYXNoVHlwZSA9IFwib3BlcmF0b3ItbG9uZ1wiXG4gIHJlc3RvcmVQb3NpdGlvbnMgPSBmYWxzZSAvLyBtYW5hZ2UgbWFudWFsbHlcbiAgZmxhc2hUYXJnZXQgPSBmYWxzZSAvLyBtYW5hZ2UgbWFudWFsbHlcbiAgdHJhY2tDaGFuZ2UgPSBmYWxzZSAvLyBtYW5hZ2UgbWFudWFsbHlcblxuICBpbml0aWFsaXplKCkge1xuICAgIHRoaXMudmltU3RhdGUuc2VxdWVudGlhbFBhc3RlTWFuYWdlci5vbkluaXRpYWxpemUodGhpcylcbiAgICBzdXBlci5pbml0aWFsaXplKClcbiAgfVxuXG4gIGV4ZWN1dGUoKSB7XG4gICAgdGhpcy5tdXRhdGlvbnNCeVNlbGVjdGlvbiA9IG5ldyBNYXAoKVxuICAgIHRoaXMuc2VxdWVudGlhbFBhc3RlID0gdGhpcy52aW1TdGF0ZS5zZXF1ZW50aWFsUGFzdGVNYW5hZ2VyLm9uRXhlY3V0ZSh0aGlzKVxuXG4gICAgdGhpcy5vbkRpZEZpbmlzaE11dGF0aW9uKCgpID0+IHtcbiAgICAgIGlmICghdGhpcy5jYW5jZWxsZWQpIHRoaXMuYWRqdXN0Q3Vyc29yUG9zaXRpb24oKVxuICAgIH0pXG5cbiAgICBzdXBlci5leGVjdXRlKClcblxuICAgIGlmICh0aGlzLmNhbmNlbGxlZCkgcmV0dXJuXG5cbiAgICB0aGlzLm9uRGlkRmluaXNoT3BlcmF0aW9uKCgpID0+IHtcbiAgICAgIC8vIFRyYWNrQ2hhbmdlXG4gICAgICBjb25zdCBuZXdSYW5nZSA9IHRoaXMubXV0YXRpb25zQnlTZWxlY3Rpb24uZ2V0KHRoaXMuZWRpdG9yLmdldExhc3RTZWxlY3Rpb24oKSlcbiAgICAgIGlmIChuZXdSYW5nZSkgdGhpcy5zZXRNYXJrRm9yQ2hhbmdlKG5ld1JhbmdlKVxuXG4gICAgICAvLyBGbGFzaFxuICAgICAgaWYgKHRoaXMuZ2V0Q29uZmlnKFwiZmxhc2hPbk9wZXJhdGVcIikgJiYgIXRoaXMuZ2V0Q29uZmlnKFwiZmxhc2hPbk9wZXJhdGVCbGFja2xpc3RcIikuaW5jbHVkZXModGhpcy5uYW1lKSkge1xuICAgICAgICBjb25zdCByYW5nZXMgPSB0aGlzLmVkaXRvci5nZXRTZWxlY3Rpb25zKCkubWFwKHNlbGVjdGlvbiA9PiB0aGlzLm11dGF0aW9uc0J5U2VsZWN0aW9uLmdldChzZWxlY3Rpb24pKVxuICAgICAgICB0aGlzLnZpbVN0YXRlLmZsYXNoKHJhbmdlcywge3R5cGU6IHRoaXMuZ2V0Rmxhc2hUeXBlKCl9KVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICBhZGp1c3RDdXJzb3JQb3NpdGlvbigpIHtcbiAgICBmb3IgKGNvbnN0IHNlbGVjdGlvbiBvZiB0aGlzLmVkaXRvci5nZXRTZWxlY3Rpb25zKCkpIHtcbiAgICAgIGlmICghdGhpcy5tdXRhdGlvbnNCeVNlbGVjdGlvbi5oYXMoc2VsZWN0aW9uKSkgY29udGludWVcblxuICAgICAgY29uc3Qge2N1cnNvcn0gPSBzZWxlY3Rpb25cbiAgICAgIGNvbnN0IG5ld1JhbmdlID0gdGhpcy5tdXRhdGlvbnNCeVNlbGVjdGlvbi5nZXQoc2VsZWN0aW9uKVxuICAgICAgaWYgKHRoaXMubGluZXdpc2VQYXN0ZSkge1xuICAgICAgICB0aGlzLnV0aWxzLm1vdmVDdXJzb3JUb0ZpcnN0Q2hhcmFjdGVyQXRSb3coY3Vyc29yLCBuZXdSYW5nZS5zdGFydC5yb3cpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAobmV3UmFuZ2UuaXNTaW5nbGVMaW5lKCkpIHtcbiAgICAgICAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24obmV3UmFuZ2UuZW5kLnRyYW5zbGF0ZShbMCwgLTFdKSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24obmV3UmFuZ2Uuc3RhcnQpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBtdXRhdGVTZWxlY3Rpb24oc2VsZWN0aW9uKSB7XG4gICAgY29uc3QgdmFsdWUgPSB0aGlzLnZpbVN0YXRlLnJlZ2lzdGVyLmdldChudWxsLCBzZWxlY3Rpb24sIHRoaXMuc2VxdWVudGlhbFBhc3RlKVxuICAgIGlmICghdmFsdWUudGV4dCkge1xuICAgICAgdGhpcy5jYW5jZWxsZWQgPSB0cnVlXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBjb25zdCB0ZXh0VG9QYXN0ZSA9IF8ubXVsdGlwbHlTdHJpbmcodmFsdWUudGV4dCwgdGhpcy5nZXRDb3VudCgpKVxuICAgIHRoaXMubGluZXdpc2VQYXN0ZSA9IHZhbHVlLnR5cGUgPT09IFwibGluZXdpc2VcIiB8fCB0aGlzLmlzTW9kZShcInZpc3VhbFwiLCBcImxpbmV3aXNlXCIpXG4gICAgY29uc3QgbmV3UmFuZ2UgPSB0aGlzLnBhc3RlKHNlbGVjdGlvbiwgdGV4dFRvUGFzdGUsIHtsaW5ld2lzZVBhc3RlOiB0aGlzLmxpbmV3aXNlUGFzdGV9KVxuICAgIHRoaXMubXV0YXRpb25zQnlTZWxlY3Rpb24uc2V0KHNlbGVjdGlvbiwgbmV3UmFuZ2UpXG4gICAgdGhpcy52aW1TdGF0ZS5zZXF1ZW50aWFsUGFzdGVNYW5hZ2VyLnNhdmVQYXN0ZWRSYW5nZUZvclNlbGVjdGlvbihzZWxlY3Rpb24sIG5ld1JhbmdlKVxuICB9XG5cbiAgLy8gUmV0dXJuIHBhc3RlZCByYW5nZVxuICBwYXN0ZShzZWxlY3Rpb24sIHRleHQsIHtsaW5ld2lzZVBhc3RlfSkge1xuICAgIGlmICh0aGlzLnNlcXVlbnRpYWxQYXN0ZSkge1xuICAgICAgcmV0dXJuIHRoaXMucGFzdGVDaGFyYWN0ZXJ3aXNlKHNlbGVjdGlvbiwgdGV4dClcbiAgICB9IGVsc2UgaWYgKGxpbmV3aXNlUGFzdGUpIHtcbiAgICAgIHJldHVybiB0aGlzLnBhc3RlTGluZXdpc2Uoc2VsZWN0aW9uLCB0ZXh0KVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5wYXN0ZUNoYXJhY3Rlcndpc2Uoc2VsZWN0aW9uLCB0ZXh0KVxuICAgIH1cbiAgfVxuXG4gIHBhc3RlQ2hhcmFjdGVyd2lzZShzZWxlY3Rpb24sIHRleHQpIHtcbiAgICBjb25zdCB7Y3Vyc29yfSA9IHNlbGVjdGlvblxuICAgIGlmIChcbiAgICAgIHNlbGVjdGlvbi5pc0VtcHR5KCkgJiZcbiAgICAgIHRoaXMubG9jYXRpb24gPT09IFwiYWZ0ZXJcIiAmJlxuICAgICAgIXRoaXMudXRpbHMuaXNFbXB0eVJvdyh0aGlzLmVkaXRvciwgY3Vyc29yLmdldEJ1ZmZlclJvdygpKVxuICAgICkge1xuICAgICAgY3Vyc29yLm1vdmVSaWdodCgpXG4gICAgfVxuICAgIHJldHVybiBzZWxlY3Rpb24uaW5zZXJ0VGV4dCh0ZXh0KVxuICB9XG5cbiAgLy8gUmV0dXJuIG5ld1JhbmdlXG4gIHBhc3RlTGluZXdpc2Uoc2VsZWN0aW9uLCB0ZXh0KSB7XG4gICAgY29uc3Qge2N1cnNvcn0gPSBzZWxlY3Rpb25cbiAgICBjb25zdCBjdXJzb3JSb3cgPSBjdXJzb3IuZ2V0QnVmZmVyUm93KClcbiAgICBpZiAoIXRleHQuZW5kc1dpdGgoXCJcXG5cIikpIHtcbiAgICAgIHRleHQgKz0gXCJcXG5cIlxuICAgIH1cbiAgICBpZiAoc2VsZWN0aW9uLmlzRW1wdHkoKSkge1xuICAgICAgaWYgKHRoaXMubG9jYXRpb24gPT09IFwiYmVmb3JlXCIpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudXRpbHMuaW5zZXJ0VGV4dEF0QnVmZmVyUG9zaXRpb24odGhpcy5lZGl0b3IsIFtjdXJzb3JSb3csIDBdLCB0ZXh0KVxuICAgICAgfSBlbHNlIGlmICh0aGlzLmxvY2F0aW9uID09PSBcImFmdGVyXCIpIHtcbiAgICAgICAgY29uc3QgdGFyZ2V0Um93ID0gdGhpcy5nZXRGb2xkRW5kUm93Rm9yUm93KGN1cnNvclJvdylcbiAgICAgICAgdGhpcy51dGlscy5lbnN1cmVFbmRzV2l0aE5ld0xpbmVGb3JCdWZmZXJSb3codGhpcy5lZGl0b3IsIHRhcmdldFJvdylcbiAgICAgICAgcmV0dXJuIHRoaXMudXRpbHMuaW5zZXJ0VGV4dEF0QnVmZmVyUG9zaXRpb24odGhpcy5lZGl0b3IsIFt0YXJnZXRSb3cgKyAxLCAwXSwgdGV4dClcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKCF0aGlzLmlzTW9kZShcInZpc3VhbFwiLCBcImxpbmV3aXNlXCIpKSB7XG4gICAgICAgIHNlbGVjdGlvbi5pbnNlcnRUZXh0KFwiXFxuXCIpXG4gICAgICB9XG4gICAgICByZXR1cm4gc2VsZWN0aW9uLmluc2VydFRleHQodGV4dClcbiAgICB9XG4gIH1cbn1cblB1dEJlZm9yZS5yZWdpc3RlcigpXG5cbmNsYXNzIFB1dEFmdGVyIGV4dGVuZHMgUHV0QmVmb3JlIHtcbiAgbG9jYXRpb24gPSBcImFmdGVyXCJcbn1cblB1dEFmdGVyLnJlZ2lzdGVyKClcblxuY2xhc3MgUHV0QmVmb3JlV2l0aEF1dG9JbmRlbnQgZXh0ZW5kcyBQdXRCZWZvcmUge1xuICBwYXN0ZUxpbmV3aXNlKHNlbGVjdGlvbiwgdGV4dCkge1xuICAgIGNvbnN0IG5ld1JhbmdlID0gc3VwZXIucGFzdGVMaW5ld2lzZShzZWxlY3Rpb24sIHRleHQpXG4gICAgdGhpcy51dGlscy5hZGp1c3RJbmRlbnRXaXRoS2VlcGluZ0xheW91dCh0aGlzLmVkaXRvciwgbmV3UmFuZ2UpXG4gICAgcmV0dXJuIG5ld1JhbmdlXG4gIH1cbn1cblB1dEJlZm9yZVdpdGhBdXRvSW5kZW50LnJlZ2lzdGVyKClcblxuY2xhc3MgUHV0QWZ0ZXJXaXRoQXV0b0luZGVudCBleHRlbmRzIFB1dEJlZm9yZVdpdGhBdXRvSW5kZW50IHtcbiAgbG9jYXRpb24gPSBcImFmdGVyXCJcbn1cblB1dEFmdGVyV2l0aEF1dG9JbmRlbnQucmVnaXN0ZXIoKVxuXG5jbGFzcyBBZGRCbGFua0xpbmVCZWxvdyBleHRlbmRzIE9wZXJhdG9yIHtcbiAgZmxhc2hUYXJnZXQgPSBmYWxzZVxuICB0YXJnZXQgPSBcIkVtcHR5XCJcbiAgc3RheUF0U2FtZVBvc2l0aW9uID0gdHJ1ZVxuICBzdGF5QnlNYXJrZXIgPSB0cnVlXG4gIHdoZXJlID0gXCJiZWxvd1wiXG5cbiAgbXV0YXRlU2VsZWN0aW9uKHNlbGVjdGlvbikge1xuICAgIGNvbnN0IHBvaW50ID0gc2VsZWN0aW9uLmdldEhlYWRCdWZmZXJQb3NpdGlvbigpXG4gICAgaWYgKHRoaXMud2hlcmUgPT09IFwiYmVsb3dcIikgcG9pbnQucm93KytcbiAgICBwb2ludC5jb2x1bW4gPSAwXG4gICAgdGhpcy5lZGl0b3Iuc2V0VGV4dEluQnVmZmVyUmFuZ2UoW3BvaW50LCBwb2ludF0sIFwiXFxuXCIucmVwZWF0KHRoaXMuZ2V0Q291bnQoKSkpXG4gIH1cbn1cbkFkZEJsYW5rTGluZUJlbG93LnJlZ2lzdGVyKClcblxuY2xhc3MgQWRkQmxhbmtMaW5lQWJvdmUgZXh0ZW5kcyBBZGRCbGFua0xpbmVCZWxvdyB7XG4gIHdoZXJlID0gXCJhYm92ZVwiXG59XG5BZGRCbGFua0xpbmVBYm92ZS5yZWdpc3RlcigpXG4iXX0=