"use babel";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, "next"); var callThrow = step.bind(null, "throw"); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

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
    this.readInputAfterSelect = false;
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
    // - one for undo
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
          this.vimState.activate("visual", this.swrap.detectWise(this.editor));
        }
      }

      if (this.mode === "visual") {
        this.target = "CurrentSelection";
      }
      if (typeof this.target === "string") {
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
    key: "mutateSelections",
    value: function mutateSelections() {
      for (var selection of this.editor.getSelectionsOrderedByBufferPosition()) {
        this.mutateSelection(selection);
      }
      this.mutationManager.setCheckpoint("did-finish");
      this.restoreCursorPositionsIfNecessary();
    }
  }, {
    key: "preSelect",
    value: function preSelect() {
      this.normalizeSelectionsIfNecessary();
      this.createBufferCheckpoint("undo");
    }
  }, {
    key: "postMutate",
    value: function postMutate() {
      this.groupChangesSinceBufferCheckpoint("undo");
      this.emitDidFinishMutation();

      // Even though we fail to select target and fail to mutate,
      // we have to return to normal-mode from operator-pending or visual
      this.activateMode("normal");
    }

    // Main
  }, {
    key: "execute",
    value: function execute() {
      this.preSelect();

      if (this.readInputAfterSelect && !this.repeated) {
        return this.executeAsyncToReadInputAfterSelect();
      }

      if (this.selectTarget()) this.mutateSelections();
      this.postMutate();
    }
  }, {
    key: "executeAsyncToReadInputAfterSelect",
    value: _asyncToGenerator(function* () {
      if (this.selectTarget()) {
        this.input = yield this.focusInputPromised(this.focusInputOptions);
        if (this.input == null) {
          if (this.mode !== "visual") {
            this.editor.revertToCheckpoint(this.getBufferCheckpoint("undo"));
            this.activateMode("normal");
          }
          return;
        }
        this.mutateSelections();
      }
      this.postMutate();
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
  }, {
    key: "command",
    value: false,
    enumerable: true
  }]);

  return Operator;
})(Base);

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
      this.normalizeSelectionsIfNecessary();
      this.selectTarget();

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
  }], [{
    key: "command",
    value: false,
    enumerable: true
  }]);

  return SelectBase;
})(Operator);

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

var SelectLatestChange = (function (_SelectBase2) {
  _inherits(SelectLatestChange, _SelectBase2);

  function SelectLatestChange() {
    _classCallCheck(this, SelectLatestChange);

    _get(Object.getPrototypeOf(SelectLatestChange.prototype), "constructor", this).apply(this, arguments);

    this.target = "ALatestChange";
  }

  return SelectLatestChange;
})(SelectBase);

var SelectPreviousSelection = (function (_SelectBase3) {
  _inherits(SelectPreviousSelection, _SelectBase3);

  function SelectPreviousSelection() {
    _classCallCheck(this, SelectPreviousSelection);

    _get(Object.getPrototypeOf(SelectPreviousSelection.prototype), "constructor", this).apply(this, arguments);

    this.target = "PreviousSelection";
  }

  return SelectPreviousSelection;
})(SelectBase);

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

var SelectOccurrence = (function (_SelectBase5) {
  _inherits(SelectOccurrence, _SelectBase5);

  function SelectOccurrence() {
    _classCallCheck(this, SelectOccurrence);

    _get(Object.getPrototypeOf(SelectOccurrence.prototype), "constructor", this).apply(this, arguments);

    this.occurrence = true;
  }

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
  return SelectOccurrence;
})(SelectBase);

var VisualModeSelect = (function (_SelectBase6) {
  _inherits(VisualModeSelect, _SelectBase6);

  function VisualModeSelect() {
    _classCallCheck(this, VisualModeSelect);

    _get(Object.getPrototypeOf(VisualModeSelect.prototype), "constructor", this).apply(this, arguments);

    this.acceptPresetOccurrence = false;
    this.acceptPersistentSelection = false;
  }

  // Persistent Selection
  // =========================

  _createClass(VisualModeSelect, null, [{
    key: "command",
    value: false,
    enumerable: true
  }]);

  return VisualModeSelect;
})(SelectBase);

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

var TogglePersistentSelection = (function (_CreatePersistentSelection) {
  _inherits(TogglePersistentSelection, _CreatePersistentSelection);

  function TogglePersistentSelection() {
    _classCallCheck(this, TogglePersistentSelection);

    _get(Object.getPrototypeOf(TogglePersistentSelection.prototype), "constructor", this).apply(this, arguments);
  }

  // Preset Occurrence
  // =========================

  _createClass(TogglePersistentSelection, [{
    key: "initialize",
    value: function initialize() {
      if (this.mode === "normal") {
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
        var isNarrowed = this.vimState.isNarrowed();

        var regex = undefined;
        if (this.mode === "visual" && !isNarrowed) {
          this.occurrenceType = "base";
          regex = new RegExp(this._.escapeRegExp(this.editor.getSelectedText()), "g");
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

var TogglePresetSubwordOccurrence = (function (_TogglePresetOccurrence) {
  _inherits(TogglePresetSubwordOccurrence, _TogglePresetOccurrence);

  function TogglePresetSubwordOccurrence() {
    _classCallCheck(this, TogglePresetSubwordOccurrence);

    _get(Object.getPrototypeOf(TogglePresetSubwordOccurrence.prototype), "constructor", this).apply(this, arguments);

    this.occurrenceType = "subword";
  }

  // Want to rename RestoreOccurrenceMarker
  return TogglePresetSubwordOccurrence;
})(TogglePresetOccurrence);

var AddPresetOccurrenceFromLastOccurrencePattern = (function (_TogglePresetOccurrence2) {
  _inherits(AddPresetOccurrenceFromLastOccurrencePattern, _TogglePresetOccurrence2);

  function AddPresetOccurrenceFromLastOccurrencePattern() {
    _classCallCheck(this, AddPresetOccurrenceFromLastOccurrencePattern);

    _get(Object.getPrototypeOf(AddPresetOccurrenceFromLastOccurrencePattern.prototype), "constructor", this).apply(this, arguments);
  }

  // Delete
  // ================================

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
      var _this5 = this;

      this.onDidSelectTarget(function () {
        if (_this5.occurrenceSelected && _this5.occurrenceWise === "linewise") {
          _this5.flashTarget = false;
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

var DeleteRight = (function (_Delete) {
  _inherits(DeleteRight, _Delete);

  function DeleteRight() {
    _classCallCheck(this, DeleteRight);

    _get(Object.getPrototypeOf(DeleteRight.prototype), "constructor", this).apply(this, arguments);

    this.target = "MoveRight";
  }

  return DeleteRight;
})(Delete);

var DeleteLeft = (function (_Delete2) {
  _inherits(DeleteLeft, _Delete2);

  function DeleteLeft() {
    _classCallCheck(this, DeleteLeft);

    _get(Object.getPrototypeOf(DeleteLeft.prototype), "constructor", this).apply(this, arguments);

    this.target = "MoveLeft";
  }

  return DeleteLeft;
})(Delete);

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
      var _this6 = this;

      this.onDidSelectTarget(function () {
        if (_this6.target.wise === "blockwise") {
          for (var blockwiseSelection of _this6.getBlockwiseSelections()) {
            blockwiseSelection.extendMemberSelectionsToEndOfLine();
          }
        }
      });
      _get(Object.getPrototypeOf(DeleteToLastCharacterOfLine.prototype), "execute", this).call(this);
    }
  }]);

  return DeleteToLastCharacterOfLine;
})(Delete);

var DeleteLine = (function (_Delete4) {
  _inherits(DeleteLine, _Delete4);

  function DeleteLine() {
    _classCallCheck(this, DeleteLine);

    _get(Object.getPrototypeOf(DeleteLine.prototype), "constructor", this).apply(this, arguments);

    this.wise = "linewise";
    this.target = "MoveToRelativeLine";
    this.flashTarget = false;
  }

  // Yank
  // =========================
  return DeleteLine;
})(Delete);

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

var YankToLastCharacterOfLine = (function (_Yank2) {
  _inherits(YankToLastCharacterOfLine, _Yank2);

  function YankToLastCharacterOfLine() {
    _classCallCheck(this, YankToLastCharacterOfLine);

    _get(Object.getPrototypeOf(YankToLastCharacterOfLine.prototype), "constructor", this).apply(this, arguments);

    this.target = "MoveToLastCharacterOfLine";
  }

  // -------------------------
  // [ctrl-a]
  return YankToLastCharacterOfLine;
})(Yank);

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

  // [ctrl-x]

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
      var _this7 = this;

      var newRanges = [];
      this.scanEditor("forward", this.regex, { scanRange: scanRange }, function (event) {
        if (fn) {
          if (fn(event)) event.stop();else return;
        }
        var nextNumber = _this7.getNextNumber(event.matchText);
        newRanges.push(event.replace(String(nextNumber)));
      });
      return newRanges;
    }
  }, {
    key: "mutateSelection",
    value: function mutateSelection(selection) {
      var _this8 = this;

      var cursor = selection.cursor;

      if (this.target.name === "Empty") {
        (function () {
          // ctrl-a, ctrl-x in `normal-mode`
          var cursorPosition = cursor.getBufferPosition();
          var scanRange = _this8.editor.bufferRangeForBufferRow(cursorPosition.row);
          var newRanges = _this8.replaceNumberInBufferRange(scanRange, function (event) {
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

var Decrease = (function (_Increase) {
  _inherits(Decrease, _Increase);

  function Decrease() {
    _classCallCheck(this, Decrease);

    _get(Object.getPrototypeOf(Decrease.prototype), "constructor", this).apply(this, arguments);

    this.step = -1;
  }

  // -------------------------
  // [g ctrl-a]
  return Decrease;
})(Increase);

var IncrementNumber = (function (_Increase2) {
  _inherits(IncrementNumber, _Increase2);

  function IncrementNumber() {
    _classCallCheck(this, IncrementNumber);

    _get(Object.getPrototypeOf(IncrementNumber.prototype), "constructor", this).apply(this, arguments);

    this.baseNumber = null;
    this.target = null;
  }

  // [g ctrl-x]

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

var DecrementNumber = (function (_IncrementNumber) {
  _inherits(DecrementNumber, _IncrementNumber);

  function DecrementNumber() {
    _classCallCheck(this, DecrementNumber);

    _get(Object.getPrototypeOf(DecrementNumber.prototype), "constructor", this).apply(this, arguments);

    this.step = -1;
  }

  // Put
  // -------------------------
  // Cursor placement:
  // - place at end of mutation: paste non-multiline characterwise text
  // - place at start of mutation: non-multiline characterwise text(characterwise, linewise)
  return DecrementNumber;
})(IncrementNumber);

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
      var _this9 = this;

      this.mutationsBySelection = new Map();
      this.sequentialPaste = this.vimState.sequentialPasteManager.onExecute(this);

      this.onDidFinishMutation(function () {
        if (!_this9.cancelled) _this9.adjustCursorPosition();
      });

      _get(Object.getPrototypeOf(PutBefore.prototype), "execute", this).call(this);

      if (this.cancelled) return;

      this.onDidFinishOperation(function () {
        // TrackChange
        var newRange = _this9.mutationsBySelection.get(_this9.editor.getLastSelection());
        if (newRange) _this9.setMarkForChange(newRange);

        // Flash
        if (_this9.getConfig("flashOnOperate") && !_this9.getConfig("flashOnOperateBlacklist").includes(_this9.name)) {
          var ranges = _this9.editor.getSelections().map(function (selection) {
            return _this9.mutationsBySelection.get(selection);
          });
          _this9.vimState.flash(ranges, { type: _this9.getFlashType() });
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

      var textToPaste = value.text.repeat(this.getCount());
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

      if (selection.isEmpty() && this.location === "after" && !this.isEmptyRow(cursor.getBufferRow())) {
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

var PutAfter = (function (_PutBefore) {
  _inherits(PutAfter, _PutBefore);

  function PutAfter() {
    _classCallCheck(this, PutAfter);

    _get(Object.getPrototypeOf(PutAfter.prototype), "constructor", this).apply(this, arguments);

    this.location = "after";
  }

  return PutAfter;
})(PutBefore);

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

var PutAfterWithAutoIndent = (function (_PutBeforeWithAutoIndent) {
  _inherits(PutAfterWithAutoIndent, _PutBeforeWithAutoIndent);

  function PutAfterWithAutoIndent() {
    _classCallCheck(this, PutAfterWithAutoIndent);

    _get(Object.getPrototypeOf(PutAfterWithAutoIndent.prototype), "constructor", this).apply(this, arguments);

    this.location = "after";
  }

  return PutAfterWithAutoIndent;
})(PutBeforeWithAutoIndent);

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

var AddBlankLineAbove = (function (_AddBlankLineBelow) {
  _inherits(AddBlankLineAbove, _AddBlankLineBelow);

  function AddBlankLineAbove() {
    _classCallCheck(this, AddBlankLineAbove);

    _get(Object.getPrototypeOf(AddBlankLineAbove.prototype), "constructor", this).apply(this, arguments);

    this.where = "above";
  }

  return AddBlankLineAbove;
})(AddBlankLineBelow);

module.exports = {
  Operator: Operator,
  SelectBase: SelectBase,
  Select: Select,
  SelectLatestChange: SelectLatestChange,
  SelectPreviousSelection: SelectPreviousSelection,
  SelectPersistentSelection: SelectPersistentSelection,
  SelectOccurrence: SelectOccurrence,
  VisualModeSelect: VisualModeSelect,
  CreatePersistentSelection: CreatePersistentSelection,
  TogglePersistentSelection: TogglePersistentSelection,
  TogglePresetOccurrence: TogglePresetOccurrence,
  TogglePresetSubwordOccurrence: TogglePresetSubwordOccurrence,
  AddPresetOccurrenceFromLastOccurrencePattern: AddPresetOccurrenceFromLastOccurrencePattern,
  Delete: Delete,
  DeleteRight: DeleteRight,
  DeleteLeft: DeleteLeft,
  DeleteToLastCharacterOfLine: DeleteToLastCharacterOfLine,
  DeleteLine: DeleteLine,
  Yank: Yank,
  YankLine: YankLine,
  YankToLastCharacterOfLine: YankToLastCharacterOfLine,
  Increase: Increase,
  Decrease: Decrease,
  IncrementNumber: IncrementNumber,
  DecrementNumber: DecrementNumber,
  PutBefore: PutBefore,
  PutAfter: PutAfter,
  PutBeforeWithAutoIndent: PutBeforeWithAutoIndent,
  PutAfterWithAutoIndent: PutAfterWithAutoIndent,
  AddBlankLineBelow: AddBlankLineBelow,
  AddBlankLineAbove: AddBlankLineAbove
};
// ctrl-a in normal-mode find target number in current line manually
// do manually
// do manually
// manage manually
// manage manually
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL29wZXJhdG9yLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFdBQVcsQ0FBQTs7Ozs7Ozs7Ozs7Ozs7QUFFWCxJQUFNLElBQUksR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUE7O0lBRXhCLFFBQVE7WUFBUixRQUFROztXQUFSLFFBQVE7MEJBQVIsUUFBUTs7K0JBQVIsUUFBUTs7U0FHWixVQUFVLEdBQUcsSUFBSTtTQUVqQixJQUFJLEdBQUcsSUFBSTtTQUNYLE1BQU0sR0FBRyxJQUFJO1NBQ2IsVUFBVSxHQUFHLEtBQUs7U0FDbEIsY0FBYyxHQUFHLE1BQU07U0FFdkIsV0FBVyxHQUFHLElBQUk7U0FDbEIsZUFBZSxHQUFHLFlBQVk7U0FDOUIsU0FBUyxHQUFHLFVBQVU7U0FDdEIsc0JBQXNCLEdBQUcscUJBQXFCO1NBQzlDLFdBQVcsR0FBRyxLQUFLO1NBRW5CLG9CQUFvQixHQUFHLElBQUk7U0FDM0Isa0JBQWtCLEdBQUcsSUFBSTtTQUN6QixjQUFjLEdBQUcsSUFBSTtTQUNyQixZQUFZLEdBQUcsS0FBSztTQUNwQixnQkFBZ0IsR0FBRyxJQUFJO1NBQ3ZCLDZCQUE2QixHQUFHLEtBQUs7U0FFckMsc0JBQXNCLEdBQUcsSUFBSTtTQUM3Qix5QkFBeUIsR0FBRyxJQUFJO1NBRWhDLHlCQUF5QixHQUFHLElBQUk7U0FFaEMsY0FBYyxHQUFHLElBQUk7U0FDckIsS0FBSyxHQUFHLElBQUk7U0FDWixvQkFBb0IsR0FBRyxLQUFLO1NBQzVCLHlCQUF5QixHQUFHLEVBQUU7OztlQS9CMUIsUUFBUTs7V0FpQ0wsbUJBQUc7QUFDUixhQUFPLElBQUksQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQTtLQUM1Qzs7Ozs7O1dBSVMsc0JBQUc7QUFDWCxVQUFJLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQTtB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QUNmLFVBQVEsRUFBUixRQUFRO0FBQ1IsWUFBVSxFQUFWLFVBQVU7QUFDVixRQUFNLEVBQU4sTUFBTTtBQUNOLG9CQUFrQixFQUFsQixrQkFBa0I7QUFDbEIseUJBQXVCLEVBQXZCLHVCQUF1QjtBQUN2QiwyQkFBeUIsRUFBekIseUJBQXlCO0FBQ3pCLGtCQUFnQixFQUFoQixnQkFBZ0I7QUFDaEIsa0JBQWdCLEVBQWhCLGdCQUFnQjtBQUNoQiwyQkFBeUIsRUFBekIseUJBQXlCO0FBQ3pCLDJCQUF5QixFQUF6Qix5QkFBeUI7QUFDekIsd0JBQXNCLEVBQXRCLHNCQUFzQjtBQUN0QiwrQkFBNkIsRUFBN0IsNkJBQTZCO0FBQzdCLDhDQUE0QyxFQUE1Qyw0Q0FBNEM7QUFDNUMsUUFBTSxFQUFOLE1BQU07QUFDTixhQUFXLEVBQVgsV0FBVztBQUNYLFlBQVUsRUFBVixVQUFVO0FBQ1YsNkJBQTJCLEVBQTNCLDJCQUEyQjtBQUMzQixZQUFVLEVBQVYsVUFBVTtBQUNWLE1BQUksRUFBSixJQUFJO0FBQ0osVUFBUSxFQUFSLFFBQVE7QUFDUiwyQkFBeUIsRUFBekIseUJBQXlCO0FBQ3pCLFVBQVEsRUFBUixRQUFRO0FBQ1IsVUFBUSxFQUFSLFFBQVE7QUFDUixpQkFBZSxFQUFmLGVBQWU7QUFDZixpQkFBZSxFQUFmLGVBQWU7QUFDZixXQUFTLEVBQVQsU0FBUztBQUNULFVBQVEsRUFBUixRQUFRO0FBQ1IseUJBQXVCLEVBQXZCLHVCQUF1QjtBQUN2Qix3QkFBc0IsRUFBdEIsc0JBQXNCO0FBQ3RCLG1CQUFpQixFQUFqQixpQkFBaUI7QUFDakIsbUJBQWlCLEVBQWpCLGlCQUFpQjtDQUNsQixDQUFBIiwiZmlsZSI6Ii9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL29wZXJhdG9yLmpzIiwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2UgYmFiZWxcIlxuXG5jb25zdCBCYXNlID0gcmVxdWlyZShcIi4vYmFzZVwiKVxuXG5jbGFzcyBPcGVyYXRvciBleHRlbmRzIEJhc2Uge1xuICBzdGF0aWMgb3BlcmF0aW9uS2luZCA9IFwib3BlcmF0b3JcIlxuICBzdGF0aWMgY29tbWFuZCA9IGZhbHNlXG4gIHJlY29yZGFibGUgPSB0cnVlXG5cbiAgd2lzZSA9IG51bGxcbiAgdGFyZ2V0ID0gbnVsbFxuICBvY2N1cnJlbmNlID0gZmFsc2VcbiAgb2NjdXJyZW5jZVR5cGUgPSBcImJhc2VcIlxuXG4gIGZsYXNoVGFyZ2V0ID0gdHJ1ZVxuICBmbGFzaENoZWNrcG9pbnQgPSBcImRpZC1maW5pc2hcIlxuICBmbGFzaFR5cGUgPSBcIm9wZXJhdG9yXCJcbiAgZmxhc2hUeXBlRm9yT2NjdXJyZW5jZSA9IFwib3BlcmF0b3Itb2NjdXJyZW5jZVwiXG4gIHRyYWNrQ2hhbmdlID0gZmFsc2VcblxuICBwYXR0ZXJuRm9yT2NjdXJyZW5jZSA9IG51bGxcbiAgc3RheUF0U2FtZVBvc2l0aW9uID0gbnVsbFxuICBzdGF5T3B0aW9uTmFtZSA9IG51bGxcbiAgc3RheUJ5TWFya2VyID0gZmFsc2VcbiAgcmVzdG9yZVBvc2l0aW9ucyA9IHRydWVcbiAgc2V0VG9GaXJzdENoYXJhY3Rlck9uTGluZXdpc2UgPSBmYWxzZVxuXG4gIGFjY2VwdFByZXNldE9jY3VycmVuY2UgPSB0cnVlXG4gIGFjY2VwdFBlcnNpc3RlbnRTZWxlY3Rpb24gPSB0cnVlXG5cbiAgYnVmZmVyQ2hlY2twb2ludEJ5UHVycG9zZSA9IG51bGxcblxuICB0YXJnZXRTZWxlY3RlZCA9IG51bGxcbiAgaW5wdXQgPSBudWxsXG4gIHJlYWRJbnB1dEFmdGVyU2VsZWN0ID0gZmFsc2VcbiAgYnVmZmVyQ2hlY2twb2ludEJ5UHVycG9zZSA9IHt9XG5cbiAgaXNSZWFkeSgpIHtcbiAgICByZXR1cm4gdGhpcy50YXJnZXQgJiYgdGhpcy50YXJnZXQuaXNSZWFkeSgpXG4gIH1cblxuICAvLyBDYWxsZWQgd2hlbiBvcGVyYXRpb24gZmluaXNoZWRcbiAgLy8gVGhpcyBpcyBlc3NlbnRpYWxseSB0byByZXNldCBzdGF0ZSBmb3IgYC5gIHJlcGVhdC5cbiAgcmVzZXRTdGF0ZSgpIHtcbiAgICB0aGlzLnRhcmdldFNlbGVjdGVkID0gbnVsbFxuICAgIHRoaXMub2NjdXJyZW5jZVNlbGVjdGVkID0gZmFsc2VcbiAgfVxuXG4gIC8vIFR3byBjaGVja3BvaW50IGZvciBkaWZmZXJlbnQgcHVycG9zZVxuICAvLyAtIG9uZSBmb3IgdW5kb1xuICAvLyAtIG9uZSBmb3IgcHJlc2VydmUgbGFzdCBpbnNlcnRlZCB0ZXh0XG4gIGNyZWF0ZUJ1ZmZlckNoZWNrcG9pbnQocHVycG9zZSkge1xuICAgIHRoaXMuYnVmZmVyQ2hlY2twb2ludEJ5UHVycG9zZVtwdXJwb3NlXSA9IHRoaXMuZWRpdG9yLmNyZWF0ZUNoZWNrcG9pbnQoKVxuICB9XG5cbiAgZ2V0QnVmZmVyQ2hlY2twb2ludChwdXJwb3NlKSB7XG4gICAgcmV0dXJuIHRoaXMuYnVmZmVyQ2hlY2twb2ludEJ5UHVycG9zZVtwdXJwb3NlXVxuICB9XG5cbiAgZ3JvdXBDaGFuZ2VzU2luY2VCdWZmZXJDaGVja3BvaW50KHB1cnBvc2UpIHtcbiAgICBjb25zdCBjaGVja3BvaW50ID0gdGhpcy5nZXRCdWZmZXJDaGVja3BvaW50KHB1cnBvc2UpXG4gICAgaWYgKGNoZWNrcG9pbnQpIHtcbiAgICAgIHRoaXMuZWRpdG9yLmdyb3VwQ2hhbmdlc1NpbmNlQ2hlY2twb2ludChjaGVja3BvaW50KVxuICAgICAgZGVsZXRlIHRoaXMuYnVmZmVyQ2hlY2twb2ludEJ5UHVycG9zZVtwdXJwb3NlXVxuICAgIH1cbiAgfVxuXG4gIHNldE1hcmtGb3JDaGFuZ2UocmFuZ2UpIHtcbiAgICB0aGlzLnZpbVN0YXRlLm1hcmsuc2V0KFwiW1wiLCByYW5nZS5zdGFydClcbiAgICB0aGlzLnZpbVN0YXRlLm1hcmsuc2V0KFwiXVwiLCByYW5nZS5lbmQpXG4gIH1cblxuICBuZWVkRmxhc2goKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIHRoaXMuZmxhc2hUYXJnZXQgJiZcbiAgICAgIHRoaXMuZ2V0Q29uZmlnKFwiZmxhc2hPbk9wZXJhdGVcIikgJiZcbiAgICAgICF0aGlzLmdldENvbmZpZyhcImZsYXNoT25PcGVyYXRlQmxhY2tsaXN0XCIpLmluY2x1ZGVzKHRoaXMubmFtZSkgJiZcbiAgICAgICh0aGlzLm1vZGUgIT09IFwidmlzdWFsXCIgfHwgdGhpcy5zdWJtb2RlICE9PSB0aGlzLnRhcmdldC53aXNlKSAvLyBlLmcuIFkgaW4gdkNcbiAgICApXG4gIH1cblxuICBmbGFzaElmTmVjZXNzYXJ5KHJhbmdlcykge1xuICAgIGlmICh0aGlzLm5lZWRGbGFzaCgpKSB7XG4gICAgICB0aGlzLnZpbVN0YXRlLmZsYXNoKHJhbmdlcywge3R5cGU6IHRoaXMuZ2V0Rmxhc2hUeXBlKCl9KVxuICAgIH1cbiAgfVxuXG4gIGZsYXNoQ2hhbmdlSWZOZWNlc3NhcnkoKSB7XG4gICAgaWYgKHRoaXMubmVlZEZsYXNoKCkpIHtcbiAgICAgIHRoaXMub25EaWRGaW5pc2hPcGVyYXRpb24oKCkgPT4ge1xuICAgICAgICBjb25zdCByYW5nZXMgPSB0aGlzLm11dGF0aW9uTWFuYWdlci5nZXRTZWxlY3RlZEJ1ZmZlclJhbmdlc0ZvckNoZWNrcG9pbnQodGhpcy5mbGFzaENoZWNrcG9pbnQpXG4gICAgICAgIHRoaXMudmltU3RhdGUuZmxhc2gocmFuZ2VzLCB7dHlwZTogdGhpcy5nZXRGbGFzaFR5cGUoKX0pXG4gICAgICB9KVxuICAgIH1cbiAgfVxuXG4gIGdldEZsYXNoVHlwZSgpIHtcbiAgICByZXR1cm4gdGhpcy5vY2N1cnJlbmNlU2VsZWN0ZWQgPyB0aGlzLmZsYXNoVHlwZUZvck9jY3VycmVuY2UgOiB0aGlzLmZsYXNoVHlwZVxuICB9XG5cbiAgdHJhY2tDaGFuZ2VJZk5lY2Vzc2FyeSgpIHtcbiAgICBpZiAoIXRoaXMudHJhY2tDaGFuZ2UpIHJldHVyblxuICAgIHRoaXMub25EaWRGaW5pc2hPcGVyYXRpb24oKCkgPT4ge1xuICAgICAgY29uc3QgcmFuZ2UgPSB0aGlzLm11dGF0aW9uTWFuYWdlci5nZXRNdXRhdGVkQnVmZmVyUmFuZ2VGb3JTZWxlY3Rpb24odGhpcy5lZGl0b3IuZ2V0TGFzdFNlbGVjdGlvbigpKVxuICAgICAgaWYgKHJhbmdlKSB0aGlzLnNldE1hcmtGb3JDaGFuZ2UocmFuZ2UpXG4gICAgfSlcbiAgfVxuXG4gIGluaXRpYWxpemUoKSB7XG4gICAgdGhpcy5zdWJzY3JpYmVSZXNldE9jY3VycmVuY2VQYXR0ZXJuSWZOZWVkZWQoKVxuXG4gICAgLy8gV2hlbiBwcmVzZXQtb2NjdXJyZW5jZSB3YXMgZXhpc3RzLCBvcGVyYXRlIG9uIG9jY3VycmVuY2Utd2lzZVxuICAgIGlmICh0aGlzLmFjY2VwdFByZXNldE9jY3VycmVuY2UgJiYgdGhpcy5vY2N1cnJlbmNlTWFuYWdlci5oYXNNYXJrZXJzKCkpIHtcbiAgICAgIHRoaXMub2NjdXJyZW5jZSA9IHRydWVcbiAgICB9XG5cbiAgICAvLyBbRklYTUVdIE9SREVSLU1BVFRFUlxuICAgIC8vIFRvIHBpY2sgY3Vyc29yLXdvcmQgdG8gZmluZCBvY2N1cnJlbmNlIGJhc2UgcGF0dGVybi5cbiAgICAvLyBUaGlzIGhhcyB0byBiZSBkb25lIEJFRk9SRSBjb252ZXJ0aW5nIHBlcnNpc3RlbnQtc2VsZWN0aW9uIGludG8gcmVhbC1zZWxlY3Rpb24uXG4gICAgLy8gU2luY2Ugd2hlbiBwZXJzaXN0ZW50LXNlbGVjdGlvbiBpcyBhY3R1YWxseSBzZWxlY3RlZCwgaXQgY2hhbmdlIGN1cnNvciBwb3NpdGlvbi5cbiAgICBpZiAodGhpcy5vY2N1cnJlbmNlICYmICF0aGlzLm9jY3VycmVuY2VNYW5hZ2VyLmhhc01hcmtlcnMoKSkge1xuICAgICAgY29uc3QgcmVnZXggPSB0aGlzLnBhdHRlcm5Gb3JPY2N1cnJlbmNlIHx8IHRoaXMuZ2V0UGF0dGVybkZvck9jY3VycmVuY2VUeXBlKHRoaXMub2NjdXJyZW5jZVR5cGUpXG4gICAgICB0aGlzLm9jY3VycmVuY2VNYW5hZ2VyLmFkZFBhdHRlcm4ocmVnZXgpXG4gICAgfVxuXG4gICAgLy8gVGhpcyBjaGFuZ2UgY3Vyc29yIHBvc2l0aW9uLlxuICAgIGlmICh0aGlzLnNlbGVjdFBlcnNpc3RlbnRTZWxlY3Rpb25JZk5lY2Vzc2FyeSgpKSB7XG4gICAgICAvLyBbRklYTUVdIHNlbGVjdGlvbi13aXNlIGlzIG5vdCBzeW5jaGVkIGlmIGl0IGFscmVhZHkgdmlzdWFsLW1vZGVcbiAgICAgIGlmICh0aGlzLm1vZGUgIT09IFwidmlzdWFsXCIpIHtcbiAgICAgICAgdGhpcy52aW1TdGF0ZS5hY3RpdmF0ZShcInZpc3VhbFwiLCB0aGlzLnN3cmFwLmRldGVjdFdpc2UodGhpcy5lZGl0b3IpKVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0aGlzLm1vZGUgPT09IFwidmlzdWFsXCIpIHtcbiAgICAgIHRoaXMudGFyZ2V0ID0gXCJDdXJyZW50U2VsZWN0aW9uXCJcbiAgICB9XG4gICAgaWYgKHR5cGVvZiB0aGlzLnRhcmdldCA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgdGhpcy5zZXRUYXJnZXQodGhpcy5nZXRJbnN0YW5jZSh0aGlzLnRhcmdldCkpXG4gICAgfVxuXG4gICAgc3VwZXIuaW5pdGlhbGl6ZSgpXG4gIH1cblxuICBzdWJzY3JpYmVSZXNldE9jY3VycmVuY2VQYXR0ZXJuSWZOZWVkZWQoKSB7XG4gICAgLy8gW0NBVVRJT05dXG4gICAgLy8gVGhpcyBtZXRob2QgaGFzIHRvIGJlIGNhbGxlZCBpbiBQUk9QRVIgdGltaW5nLlxuICAgIC8vIElmIG9jY3VycmVuY2UgaXMgdHJ1ZSBidXQgbm8gcHJlc2V0LW9jY3VycmVuY2VcbiAgICAvLyBUcmVhdCB0aGF0IGBvY2N1cnJlbmNlYCBpcyBCT1VOREVEIHRvIG9wZXJhdG9yIGl0c2VsZiwgc28gY2xlYW5wIGF0IGZpbmlzaGVkLlxuICAgIGlmICh0aGlzLm9jY3VycmVuY2UgJiYgIXRoaXMub2NjdXJyZW5jZU1hbmFnZXIuaGFzTWFya2VycygpKSB7XG4gICAgICB0aGlzLm9uRGlkUmVzZXRPcGVyYXRpb25TdGFjaygoKSA9PiB0aGlzLm9jY3VycmVuY2VNYW5hZ2VyLnJlc2V0UGF0dGVybnMoKSlcbiAgICB9XG4gIH1cblxuICBzZXRNb2RpZmllcih7d2lzZSwgb2NjdXJyZW5jZSwgb2NjdXJyZW5jZVR5cGV9KSB7XG4gICAgaWYgKHdpc2UpIHtcbiAgICAgIHRoaXMud2lzZSA9IHdpc2VcbiAgICB9IGVsc2UgaWYgKG9jY3VycmVuY2UpIHtcbiAgICAgIHRoaXMub2NjdXJyZW5jZSA9IG9jY3VycmVuY2VcbiAgICAgIHRoaXMub2NjdXJyZW5jZVR5cGUgPSBvY2N1cnJlbmNlVHlwZVxuICAgICAgLy8gVGhpcyBpcyBvIG1vZGlmaWVyIGNhc2UoZS5nLiBgYyBvIHBgLCBgZCBPIGZgKVxuICAgICAgLy8gV2UgUkVTRVQgZXhpc3Rpbmcgb2NjdXJlbmNlLW1hcmtlciB3aGVuIGBvYCBvciBgT2AgbW9kaWZpZXIgaXMgdHlwZWQgYnkgdXNlci5cbiAgICAgIGNvbnN0IHJlZ2V4ID0gdGhpcy5nZXRQYXR0ZXJuRm9yT2NjdXJyZW5jZVR5cGUob2NjdXJyZW5jZVR5cGUpXG4gICAgICB0aGlzLm9jY3VycmVuY2VNYW5hZ2VyLmFkZFBhdHRlcm4ocmVnZXgsIHtyZXNldDogdHJ1ZSwgb2NjdXJyZW5jZVR5cGV9KVxuICAgICAgdGhpcy5vbkRpZFJlc2V0T3BlcmF0aW9uU3RhY2soKCkgPT4gdGhpcy5vY2N1cnJlbmNlTWFuYWdlci5yZXNldFBhdHRlcm5zKCkpXG4gICAgfVxuICB9XG5cbiAgLy8gcmV0dXJuIHRydWUvZmFsc2UgdG8gaW5kaWNhdGUgc3VjY2Vzc1xuICBzZWxlY3RQZXJzaXN0ZW50U2VsZWN0aW9uSWZOZWNlc3NhcnkoKSB7XG4gICAgaWYgKFxuICAgICAgdGhpcy5hY2NlcHRQZXJzaXN0ZW50U2VsZWN0aW9uICYmXG4gICAgICB0aGlzLmdldENvbmZpZyhcImF1dG9TZWxlY3RQZXJzaXN0ZW50U2VsZWN0aW9uT25PcGVyYXRlXCIpICYmXG4gICAgICAhdGhpcy5wZXJzaXN0ZW50U2VsZWN0aW9uLmlzRW1wdHkoKVxuICAgICkge1xuICAgICAgdGhpcy5wZXJzaXN0ZW50U2VsZWN0aW9uLnNlbGVjdCgpXG4gICAgICB0aGlzLmVkaXRvci5tZXJnZUludGVyc2VjdGluZ1NlbGVjdGlvbnMoKVxuICAgICAgdGhpcy5zd3JhcC5zYXZlUHJvcGVydGllcyh0aGlzLmVkaXRvcilcblxuICAgICAgcmV0dXJuIHRydWVcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuICB9XG5cbiAgZ2V0UGF0dGVybkZvck9jY3VycmVuY2VUeXBlKG9jY3VycmVuY2VUeXBlKSB7XG4gICAgaWYgKG9jY3VycmVuY2VUeXBlID09PSBcImJhc2VcIikge1xuICAgICAgcmV0dXJuIHRoaXMudXRpbHMuZ2V0V29yZFBhdHRlcm5BdEJ1ZmZlclBvc2l0aW9uKHRoaXMuZWRpdG9yLCB0aGlzLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCkpXG4gICAgfSBlbHNlIGlmIChvY2N1cnJlbmNlVHlwZSA9PT0gXCJzdWJ3b3JkXCIpIHtcbiAgICAgIHJldHVybiB0aGlzLnV0aWxzLmdldFN1YndvcmRQYXR0ZXJuQXRCdWZmZXJQb3NpdGlvbih0aGlzLmVkaXRvciwgdGhpcy5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpKVxuICAgIH1cbiAgfVxuXG4gIC8vIHRhcmdldCBpcyBUZXh0T2JqZWN0IG9yIE1vdGlvbiB0byBvcGVyYXRlIG9uLlxuICBzZXRUYXJnZXQodGFyZ2V0KSB7XG4gICAgdGhpcy50YXJnZXQgPSB0YXJnZXRcbiAgICB0aGlzLnRhcmdldC5vcGVyYXRvciA9IHRoaXNcbiAgICB0aGlzLmVtaXREaWRTZXRUYXJnZXQodGhpcylcbiAgfVxuXG4gIHNldFRleHRUb1JlZ2lzdGVyRm9yU2VsZWN0aW9uKHNlbGVjdGlvbikge1xuICAgIHRoaXMuc2V0VGV4dFRvUmVnaXN0ZXIoc2VsZWN0aW9uLmdldFRleHQoKSwgc2VsZWN0aW9uKVxuICB9XG5cbiAgc2V0VGV4dFRvUmVnaXN0ZXIodGV4dCwgc2VsZWN0aW9uKSB7XG4gICAgaWYgKHRoaXMudmltU3RhdGUucmVnaXN0ZXIuaXNVbm5hbWVkKCkgJiYgdGhpcy5pc0JsYWNraG9sZVJlZ2lzdGVyZWRPcGVyYXRvcigpKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBjb25zdCB3aXNlID0gdGhpcy5vY2N1cnJlbmNlU2VsZWN0ZWQgPyB0aGlzLm9jY3VycmVuY2VXaXNlIDogdGhpcy50YXJnZXQud2lzZVxuICAgIGlmICh3aXNlID09PSBcImxpbmV3aXNlXCIgJiYgIXRleHQuZW5kc1dpdGgoXCJcXG5cIikpIHtcbiAgICAgIHRleHQgKz0gXCJcXG5cIlxuICAgIH1cblxuICAgIGlmICh0ZXh0KSB7XG4gICAgICB0aGlzLnZpbVN0YXRlLnJlZ2lzdGVyLnNldChudWxsLCB7dGV4dCwgc2VsZWN0aW9ufSlcblxuICAgICAgaWYgKHRoaXMudmltU3RhdGUucmVnaXN0ZXIuaXNVbm5hbWVkKCkpIHtcbiAgICAgICAgaWYgKHRoaXMuaW5zdGFuY2VvZihcIkRlbGV0ZVwiKSB8fCB0aGlzLmluc3RhbmNlb2YoXCJDaGFuZ2VcIikpIHtcbiAgICAgICAgICBpZiAoIXRoaXMubmVlZFNhdmVUb051bWJlcmVkUmVnaXN0ZXIodGhpcy50YXJnZXQpICYmIHRoaXMudXRpbHMuaXNTaW5nbGVMaW5lVGV4dCh0ZXh0KSkge1xuICAgICAgICAgICAgdGhpcy52aW1TdGF0ZS5yZWdpc3Rlci5zZXQoXCItXCIsIHt0ZXh0LCBzZWxlY3Rpb259KSAvLyBzbWFsbC1jaGFuZ2VcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy52aW1TdGF0ZS5yZWdpc3Rlci5zZXQoXCIxXCIsIHt0ZXh0LCBzZWxlY3Rpb259KVxuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLmluc3RhbmNlb2YoXCJZYW5rXCIpKSB7XG4gICAgICAgICAgdGhpcy52aW1TdGF0ZS5yZWdpc3Rlci5zZXQoXCIwXCIsIHt0ZXh0LCBzZWxlY3Rpb259KVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgaXNCbGFja2hvbGVSZWdpc3RlcmVkT3BlcmF0b3IoKSB7XG4gICAgY29uc3Qgb3BlcmF0b3JzID0gdGhpcy5nZXRDb25maWcoXCJibGFja2hvbGVSZWdpc3RlcmVkT3BlcmF0b3JzXCIpXG4gICAgY29uc3Qgd2lsZENhcmRPcGVyYXRvcnMgPSBvcGVyYXRvcnMuZmlsdGVyKG5hbWUgPT4gbmFtZS5lbmRzV2l0aChcIipcIikpXG4gICAgY29uc3QgY29tbWFuZE5hbWUgPSB0aGlzLmdldENvbW1hbmROYW1lV2l0aG91dFByZWZpeCgpXG4gICAgcmV0dXJuIChcbiAgICAgIHdpbGRDYXJkT3BlcmF0b3JzLnNvbWUobmFtZSA9PiBuZXcgUmVnRXhwKFwiXlwiICsgbmFtZS5yZXBsYWNlKFwiKlwiLCBcIi4qXCIpKS50ZXN0KGNvbW1hbmROYW1lKSkgfHxcbiAgICAgIG9wZXJhdG9ycy5pbmNsdWRlcyhjb21tYW5kTmFtZSlcbiAgICApXG4gIH1cblxuICBuZWVkU2F2ZVRvTnVtYmVyZWRSZWdpc3Rlcih0YXJnZXQpIHtcbiAgICAvLyBVc2VkIHRvIGRldGVybWluZSB3aGF0IHJlZ2lzdGVyIHRvIHVzZSBvbiBjaGFuZ2UgYW5kIGRlbGV0ZSBvcGVyYXRpb24uXG4gICAgLy8gRm9sbG93aW5nIG1vdGlvbiBzaG91bGQgc2F2ZSB0byAxLTkgcmVnaXN0ZXIgcmVnZXJkbGVzcyBvZiBjb250ZW50IGlzIHNtYWxsIG9yIGJpZy5cbiAgICBjb25zdCBnb2VzVG9OdW1iZXJlZFJlZ2lzdGVyTW90aW9uTmFtZXMgPSBbXG4gICAgICBcIk1vdmVUb1BhaXJcIiwgLy8gJVxuICAgICAgXCJNb3ZlVG9OZXh0U2VudGVuY2VcIiwgLy8gKCwgKVxuICAgICAgXCJTZWFyY2hcIiwgLy8gLywgPywgbiwgTlxuICAgICAgXCJNb3ZlVG9OZXh0UGFyYWdyYXBoXCIsIC8vIHssIH1cbiAgICBdXG4gICAgcmV0dXJuIGdvZXNUb051bWJlcmVkUmVnaXN0ZXJNb3Rpb25OYW1lcy5zb21lKG5hbWUgPT4gdGFyZ2V0Lmluc3RhbmNlb2YobmFtZSkpXG4gIH1cblxuICBub3JtYWxpemVTZWxlY3Rpb25zSWZOZWNlc3NhcnkoKSB7XG4gICAgaWYgKHRoaXMubW9kZSA9PT0gXCJ2aXN1YWxcIiAmJiB0aGlzLnRhcmdldCAmJiB0aGlzLnRhcmdldC5pc01vdGlvbigpKSB7XG4gICAgICB0aGlzLnN3cmFwLm5vcm1hbGl6ZSh0aGlzLmVkaXRvcilcbiAgICB9XG4gIH1cblxuICBtdXRhdGVTZWxlY3Rpb25zKCkge1xuICAgIGZvciAoY29uc3Qgc2VsZWN0aW9uIG9mIHRoaXMuZWRpdG9yLmdldFNlbGVjdGlvbnNPcmRlcmVkQnlCdWZmZXJQb3NpdGlvbigpKSB7XG4gICAgICB0aGlzLm11dGF0ZVNlbGVjdGlvbihzZWxlY3Rpb24pXG4gICAgfVxuICAgIHRoaXMubXV0YXRpb25NYW5hZ2VyLnNldENoZWNrcG9pbnQoXCJkaWQtZmluaXNoXCIpXG4gICAgdGhpcy5yZXN0b3JlQ3Vyc29yUG9zaXRpb25zSWZOZWNlc3NhcnkoKVxuICB9XG5cbiAgcHJlU2VsZWN0KCkge1xuICAgIHRoaXMubm9ybWFsaXplU2VsZWN0aW9uc0lmTmVjZXNzYXJ5KClcbiAgICB0aGlzLmNyZWF0ZUJ1ZmZlckNoZWNrcG9pbnQoXCJ1bmRvXCIpXG4gIH1cblxuICBwb3N0TXV0YXRlKCkge1xuICAgIHRoaXMuZ3JvdXBDaGFuZ2VzU2luY2VCdWZmZXJDaGVja3BvaW50KFwidW5kb1wiKVxuICAgIHRoaXMuZW1pdERpZEZpbmlzaE11dGF0aW9uKClcblxuICAgIC8vIEV2ZW4gdGhvdWdoIHdlIGZhaWwgdG8gc2VsZWN0IHRhcmdldCBhbmQgZmFpbCB0byBtdXRhdGUsXG4gICAgLy8gd2UgaGF2ZSB0byByZXR1cm4gdG8gbm9ybWFsLW1vZGUgZnJvbSBvcGVyYXRvci1wZW5kaW5nIG9yIHZpc3VhbFxuICAgIHRoaXMuYWN0aXZhdGVNb2RlKFwibm9ybWFsXCIpXG4gIH1cblxuICAvLyBNYWluXG4gIGV4ZWN1dGUoKSB7XG4gICAgdGhpcy5wcmVTZWxlY3QoKVxuXG4gICAgaWYgKHRoaXMucmVhZElucHV0QWZ0ZXJTZWxlY3QgJiYgIXRoaXMucmVwZWF0ZWQpIHtcbiAgICAgIHJldHVybiB0aGlzLmV4ZWN1dGVBc3luY1RvUmVhZElucHV0QWZ0ZXJTZWxlY3QoKVxuICAgIH1cblxuICAgIGlmICh0aGlzLnNlbGVjdFRhcmdldCgpKSB0aGlzLm11dGF0ZVNlbGVjdGlvbnMoKVxuICAgIHRoaXMucG9zdE11dGF0ZSgpXG4gIH1cblxuICBhc3luYyBleGVjdXRlQXN5bmNUb1JlYWRJbnB1dEFmdGVyU2VsZWN0KCkge1xuICAgIGlmICh0aGlzLnNlbGVjdFRhcmdldCgpKSB7XG4gICAgICB0aGlzLmlucHV0ID0gYXdhaXQgdGhpcy5mb2N1c0lucHV0UHJvbWlzZWQodGhpcy5mb2N1c0lucHV0T3B0aW9ucylcbiAgICAgIGlmICh0aGlzLmlucHV0ID09IG51bGwpIHtcbiAgICAgICAgaWYgKHRoaXMubW9kZSAhPT0gXCJ2aXN1YWxcIikge1xuICAgICAgICAgIHRoaXMuZWRpdG9yLnJldmVydFRvQ2hlY2twb2ludCh0aGlzLmdldEJ1ZmZlckNoZWNrcG9pbnQoXCJ1bmRvXCIpKVxuICAgICAgICAgIHRoaXMuYWN0aXZhdGVNb2RlKFwibm9ybWFsXCIpXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICB0aGlzLm11dGF0ZVNlbGVjdGlvbnMoKVxuICAgIH1cbiAgICB0aGlzLnBvc3RNdXRhdGUoKVxuICB9XG5cbiAgLy8gUmV0dXJuIHRydWUgdW5sZXNzIGFsbCBzZWxlY3Rpb24gaXMgZW1wdHkuXG4gIHNlbGVjdFRhcmdldCgpIHtcbiAgICBpZiAodGhpcy50YXJnZXRTZWxlY3RlZCAhPSBudWxsKSB7XG4gICAgICByZXR1cm4gdGhpcy50YXJnZXRTZWxlY3RlZFxuICAgIH1cbiAgICB0aGlzLm11dGF0aW9uTWFuYWdlci5pbml0KHtzdGF5QnlNYXJrZXI6IHRoaXMuc3RheUJ5TWFya2VyfSlcblxuICAgIGlmICh0aGlzLnRhcmdldC5pc01vdGlvbigpICYmIHRoaXMubW9kZSA9PT0gXCJ2aXN1YWxcIikgdGhpcy50YXJnZXQud2lzZSA9IHRoaXMuc3VibW9kZVxuICAgIGlmICh0aGlzLndpc2UgIT0gbnVsbCkgdGhpcy50YXJnZXQuZm9yY2VXaXNlKHRoaXMud2lzZSlcblxuICAgIHRoaXMuZW1pdFdpbGxTZWxlY3RUYXJnZXQoKVxuXG4gICAgLy8gQWxsb3cgY3Vyc29yIHBvc2l0aW9uIGFkanVzdG1lbnQgJ29uLXdpbGwtc2VsZWN0LXRhcmdldCcgaG9vay5cbiAgICAvLyBzbyBjaGVja3BvaW50IGNvbWVzIEFGVEVSIEBlbWl0V2lsbFNlbGVjdFRhcmdldCgpXG4gICAgdGhpcy5tdXRhdGlvbk1hbmFnZXIuc2V0Q2hlY2twb2ludChcIndpbGwtc2VsZWN0XCIpXG5cbiAgICAvLyBOT1RFOiBXaGVuIHJlcGVhdGVkLCBzZXQgb2NjdXJyZW5jZS1tYXJrZXIgZnJvbSBwYXR0ZXJuIHN0b3JlZCBhcyBzdGF0ZS5cbiAgICBpZiAodGhpcy5yZXBlYXRlZCAmJiB0aGlzLm9jY3VycmVuY2UgJiYgIXRoaXMub2NjdXJyZW5jZU1hbmFnZXIuaGFzTWFya2VycygpKSB7XG4gICAgICB0aGlzLm9jY3VycmVuY2VNYW5hZ2VyLmFkZFBhdHRlcm4odGhpcy5wYXR0ZXJuRm9yT2NjdXJyZW5jZSwge29jY3VycmVuY2VUeXBlOiB0aGlzLm9jY3VycmVuY2VUeXBlfSlcbiAgICB9XG5cbiAgICB0aGlzLnRhcmdldC5leGVjdXRlKClcblxuICAgIHRoaXMubXV0YXRpb25NYW5hZ2VyLnNldENoZWNrcG9pbnQoXCJkaWQtc2VsZWN0XCIpXG4gICAgaWYgKHRoaXMub2NjdXJyZW5jZSkge1xuICAgICAgaWYgKCF0aGlzLnBhdHRlcm5Gb3JPY2N1cnJlbmNlKSB7XG4gICAgICAgIC8vIFByZXNlcnZlIG9jY3VycmVuY2VQYXR0ZXJuIGZvciAuIHJlcGVhdC5cbiAgICAgICAgdGhpcy5wYXR0ZXJuRm9yT2NjdXJyZW5jZSA9IHRoaXMub2NjdXJyZW5jZU1hbmFnZXIuYnVpbGRQYXR0ZXJuKClcbiAgICAgIH1cblxuICAgICAgdGhpcy5vY2N1cnJlbmNlV2lzZSA9IHRoaXMud2lzZSB8fCBcImNoYXJhY3Rlcndpc2VcIlxuICAgICAgaWYgKHRoaXMub2NjdXJyZW5jZU1hbmFnZXIuc2VsZWN0KHRoaXMub2NjdXJyZW5jZVdpc2UpKSB7XG4gICAgICAgIHRoaXMub2NjdXJyZW5jZVNlbGVjdGVkID0gdHJ1ZVxuICAgICAgICB0aGlzLm11dGF0aW9uTWFuYWdlci5zZXRDaGVja3BvaW50KFwiZGlkLXNlbGVjdC1vY2N1cnJlbmNlXCIpXG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy50YXJnZXRTZWxlY3RlZCA9IHRoaXMudmltU3RhdGUuaGF2ZVNvbWVOb25FbXB0eVNlbGVjdGlvbigpIHx8IHRoaXMudGFyZ2V0Lm5hbWUgPT09IFwiRW1wdHlcIlxuICAgIGlmICh0aGlzLnRhcmdldFNlbGVjdGVkKSB7XG4gICAgICB0aGlzLmVtaXREaWRTZWxlY3RUYXJnZXQoKVxuICAgICAgdGhpcy5mbGFzaENoYW5nZUlmTmVjZXNzYXJ5KClcbiAgICAgIHRoaXMudHJhY2tDaGFuZ2VJZk5lY2Vzc2FyeSgpXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZW1pdERpZEZhaWxTZWxlY3RUYXJnZXQoKVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzLnRhcmdldFNlbGVjdGVkXG4gIH1cblxuICByZXN0b3JlQ3Vyc29yUG9zaXRpb25zSWZOZWNlc3NhcnkoKSB7XG4gICAgaWYgKCF0aGlzLnJlc3RvcmVQb3NpdGlvbnMpIHJldHVyblxuXG4gICAgY29uc3Qgc3RheSA9XG4gICAgICB0aGlzLnN0YXlBdFNhbWVQb3NpdGlvbiAhPSBudWxsXG4gICAgICAgID8gdGhpcy5zdGF5QXRTYW1lUG9zaXRpb25cbiAgICAgICAgOiB0aGlzLmdldENvbmZpZyh0aGlzLnN0YXlPcHRpb25OYW1lKSB8fCAodGhpcy5vY2N1cnJlbmNlU2VsZWN0ZWQgJiYgdGhpcy5nZXRDb25maWcoXCJzdGF5T25PY2N1cnJlbmNlXCIpKVxuICAgIGNvbnN0IHdpc2UgPSB0aGlzLm9jY3VycmVuY2VTZWxlY3RlZCA/IHRoaXMub2NjdXJyZW5jZVdpc2UgOiB0aGlzLnRhcmdldC53aXNlXG4gICAgY29uc3Qge3NldFRvRmlyc3RDaGFyYWN0ZXJPbkxpbmV3aXNlfSA9IHRoaXNcbiAgICB0aGlzLm11dGF0aW9uTWFuYWdlci5yZXN0b3JlQ3Vyc29yUG9zaXRpb25zKHtzdGF5LCB3aXNlLCBzZXRUb0ZpcnN0Q2hhcmFjdGVyT25MaW5ld2lzZX0pXG4gIH1cbn1cblxuY2xhc3MgU2VsZWN0QmFzZSBleHRlbmRzIE9wZXJhdG9yIHtcbiAgc3RhdGljIGNvbW1hbmQgPSBmYWxzZVxuICBmbGFzaFRhcmdldCA9IGZhbHNlXG4gIHJlY29yZGFibGUgPSBmYWxzZVxuXG4gIGV4ZWN1dGUoKSB7XG4gICAgdGhpcy5ub3JtYWxpemVTZWxlY3Rpb25zSWZOZWNlc3NhcnkoKVxuICAgIHRoaXMuc2VsZWN0VGFyZ2V0KClcblxuICAgIGlmICh0aGlzLnRhcmdldC5zZWxlY3RTdWNjZWVkZWQpIHtcbiAgICAgIGlmICh0aGlzLnRhcmdldC5pc1RleHRPYmplY3QoKSkge1xuICAgICAgICB0aGlzLmVkaXRvci5zY3JvbGxUb0N1cnNvclBvc2l0aW9uKClcbiAgICAgIH1cbiAgICAgIGNvbnN0IHdpc2UgPSB0aGlzLm9jY3VycmVuY2VTZWxlY3RlZCA/IHRoaXMub2NjdXJyZW5jZVdpc2UgOiB0aGlzLnRhcmdldC53aXNlXG4gICAgICB0aGlzLmFjdGl2YXRlTW9kZUlmTmVjZXNzYXJ5KFwidmlzdWFsXCIsIHdpc2UpXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuY2FuY2VsT3BlcmF0aW9uKClcbiAgICB9XG4gIH1cbn1cblxuY2xhc3MgU2VsZWN0IGV4dGVuZHMgU2VsZWN0QmFzZSB7XG4gIGV4ZWN1dGUoKSB7XG4gICAgdGhpcy5zd3JhcC5zYXZlUHJvcGVydGllcyh0aGlzLmVkaXRvcilcbiAgICBzdXBlci5leGVjdXRlKClcbiAgfVxufVxuXG5jbGFzcyBTZWxlY3RMYXRlc3RDaGFuZ2UgZXh0ZW5kcyBTZWxlY3RCYXNlIHtcbiAgdGFyZ2V0ID0gXCJBTGF0ZXN0Q2hhbmdlXCJcbn1cblxuY2xhc3MgU2VsZWN0UHJldmlvdXNTZWxlY3Rpb24gZXh0ZW5kcyBTZWxlY3RCYXNlIHtcbiAgdGFyZ2V0ID0gXCJQcmV2aW91c1NlbGVjdGlvblwiXG59XG5cbmNsYXNzIFNlbGVjdFBlcnNpc3RlbnRTZWxlY3Rpb24gZXh0ZW5kcyBTZWxlY3RCYXNlIHtcbiAgdGFyZ2V0ID0gXCJBUGVyc2lzdGVudFNlbGVjdGlvblwiXG4gIGFjY2VwdFBlcnNpc3RlbnRTZWxlY3Rpb24gPSBmYWxzZVxufVxuXG5jbGFzcyBTZWxlY3RPY2N1cnJlbmNlIGV4dGVuZHMgU2VsZWN0QmFzZSB7XG4gIG9jY3VycmVuY2UgPSB0cnVlXG59XG5cbi8vIFZpc3VhbE1vZGVTZWxlY3Q6IHVzZWQgaW4gdmlzdWFsLW1vZGVcbi8vIFdoZW4gdGV4dC1vYmplY3QgaXMgaW52b2tlZCBmcm9tIG5vcm1hbCBvciB2aXVzYWwtbW9kZSwgb3BlcmF0aW9uIHdvdWxkIGJlXG4vLyAgPT4gVmlzdWFsTW9kZVNlbGVjdCBvcGVyYXRvciB3aXRoIHRhcmdldD10ZXh0LW9iamVjdFxuLy8gV2hlbiBtb3Rpb24gaXMgaW52b2tlZCBmcm9tIHZpc3VhbC1tb2RlLCBvcGVyYXRpb24gd291bGQgYmVcbi8vICA9PiBWaXN1YWxNb2RlU2VsZWN0IG9wZXJhdG9yIHdpdGggdGFyZ2V0PW1vdGlvbilcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBWaXN1YWxNb2RlU2VsZWN0IGlzIHVzZWQgaW4gVFdPIHNpdHVhdGlvbi5cbi8vIC0gdmlzdWFsLW1vZGUgb3BlcmF0aW9uXG4vLyAgIC0gZS5nOiBgdiBsYCwgYFYgamAsIGB2IGkgcGAuLi5cbi8vIC0gRGlyZWN0bHkgaW52b2tlIHRleHQtb2JqZWN0IGZyb20gbm9ybWFsLW1vZGVcbi8vICAgLSBlLmc6IEludm9rZSBgSW5uZXIgUGFyYWdyYXBoYCBmcm9tIGNvbW1hbmQtcGFsZXR0ZS5cbmNsYXNzIFZpc3VhbE1vZGVTZWxlY3QgZXh0ZW5kcyBTZWxlY3RCYXNlIHtcbiAgc3RhdGljIGNvbW1hbmQgPSBmYWxzZVxuICBhY2NlcHRQcmVzZXRPY2N1cnJlbmNlID0gZmFsc2VcbiAgYWNjZXB0UGVyc2lzdGVudFNlbGVjdGlvbiA9IGZhbHNlXG59XG5cbi8vIFBlcnNpc3RlbnQgU2VsZWN0aW9uXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09XG5jbGFzcyBDcmVhdGVQZXJzaXN0ZW50U2VsZWN0aW9uIGV4dGVuZHMgT3BlcmF0b3Ige1xuICBmbGFzaFRhcmdldCA9IGZhbHNlXG4gIHN0YXlBdFNhbWVQb3NpdGlvbiA9IHRydWVcbiAgYWNjZXB0UHJlc2V0T2NjdXJyZW5jZSA9IGZhbHNlXG4gIGFjY2VwdFBlcnNpc3RlbnRTZWxlY3Rpb24gPSBmYWxzZVxuXG4gIG11dGF0ZVNlbGVjdGlvbihzZWxlY3Rpb24pIHtcbiAgICB0aGlzLnBlcnNpc3RlbnRTZWxlY3Rpb24ubWFya0J1ZmZlclJhbmdlKHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpKVxuICB9XG59XG5cbmNsYXNzIFRvZ2dsZVBlcnNpc3RlbnRTZWxlY3Rpb24gZXh0ZW5kcyBDcmVhdGVQZXJzaXN0ZW50U2VsZWN0aW9uIHtcbiAgaW5pdGlhbGl6ZSgpIHtcbiAgICBpZiAodGhpcy5tb2RlID09PSBcIm5vcm1hbFwiKSB7XG4gICAgICBjb25zdCBwb2ludCA9IHRoaXMuZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKClcbiAgICAgIGNvbnN0IG1hcmtlciA9IHRoaXMucGVyc2lzdGVudFNlbGVjdGlvbi5nZXRNYXJrZXJBdFBvaW50KHBvaW50KVxuICAgICAgaWYgKG1hcmtlcikgdGhpcy50YXJnZXQgPSBcIkVtcHR5XCJcbiAgICB9XG4gICAgc3VwZXIuaW5pdGlhbGl6ZSgpXG4gIH1cblxuICBtdXRhdGVTZWxlY3Rpb24oc2VsZWN0aW9uKSB7XG4gICAgY29uc3QgcG9pbnQgPSB0aGlzLmdldEN1cnNvclBvc2l0aW9uRm9yU2VsZWN0aW9uKHNlbGVjdGlvbilcbiAgICBjb25zdCBtYXJrZXIgPSB0aGlzLnBlcnNpc3RlbnRTZWxlY3Rpb24uZ2V0TWFya2VyQXRQb2ludChwb2ludClcbiAgICBpZiAobWFya2VyKSB7XG4gICAgICBtYXJrZXIuZGVzdHJveSgpXG4gICAgfSBlbHNlIHtcbiAgICAgIHN1cGVyLm11dGF0ZVNlbGVjdGlvbihzZWxlY3Rpb24pXG4gICAgfVxuICB9XG59XG5cbi8vIFByZXNldCBPY2N1cnJlbmNlXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09XG5jbGFzcyBUb2dnbGVQcmVzZXRPY2N1cnJlbmNlIGV4dGVuZHMgT3BlcmF0b3Ige1xuICB0YXJnZXQgPSBcIkVtcHR5XCJcbiAgZmxhc2hUYXJnZXQgPSBmYWxzZVxuICBhY2NlcHRQcmVzZXRPY2N1cnJlbmNlID0gZmFsc2VcbiAgYWNjZXB0UGVyc2lzdGVudFNlbGVjdGlvbiA9IGZhbHNlXG4gIG9jY3VycmVuY2VUeXBlID0gXCJiYXNlXCJcblxuICBleGVjdXRlKCkge1xuICAgIGNvbnN0IG1hcmtlciA9IHRoaXMub2NjdXJyZW5jZU1hbmFnZXIuZ2V0TWFya2VyQXRQb2ludCh0aGlzLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCkpXG4gICAgaWYgKG1hcmtlcikge1xuICAgICAgdGhpcy5vY2N1cnJlbmNlTWFuYWdlci5kZXN0cm95TWFya2VycyhbbWFya2VyXSlcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgaXNOYXJyb3dlZCA9IHRoaXMudmltU3RhdGUuaXNOYXJyb3dlZCgpXG5cbiAgICAgIGxldCByZWdleFxuICAgICAgaWYgKHRoaXMubW9kZSA9PT0gXCJ2aXN1YWxcIiAmJiAhaXNOYXJyb3dlZCkge1xuICAgICAgICB0aGlzLm9jY3VycmVuY2VUeXBlID0gXCJiYXNlXCJcbiAgICAgICAgcmVnZXggPSBuZXcgUmVnRXhwKHRoaXMuXy5lc2NhcGVSZWdFeHAodGhpcy5lZGl0b3IuZ2V0U2VsZWN0ZWRUZXh0KCkpLCBcImdcIilcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlZ2V4ID0gdGhpcy5nZXRQYXR0ZXJuRm9yT2NjdXJyZW5jZVR5cGUodGhpcy5vY2N1cnJlbmNlVHlwZSlcbiAgICAgIH1cblxuICAgICAgdGhpcy5vY2N1cnJlbmNlTWFuYWdlci5hZGRQYXR0ZXJuKHJlZ2V4LCB7b2NjdXJyZW5jZVR5cGU6IHRoaXMub2NjdXJyZW5jZVR5cGV9KVxuICAgICAgdGhpcy5vY2N1cnJlbmNlTWFuYWdlci5zYXZlTGFzdFBhdHRlcm4odGhpcy5vY2N1cnJlbmNlVHlwZSlcblxuICAgICAgaWYgKCFpc05hcnJvd2VkKSB0aGlzLmFjdGl2YXRlTW9kZShcIm5vcm1hbFwiKVxuICAgIH1cbiAgfVxufVxuXG5jbGFzcyBUb2dnbGVQcmVzZXRTdWJ3b3JkT2NjdXJyZW5jZSBleHRlbmRzIFRvZ2dsZVByZXNldE9jY3VycmVuY2Uge1xuICBvY2N1cnJlbmNlVHlwZSA9IFwic3Vid29yZFwiXG59XG5cbi8vIFdhbnQgdG8gcmVuYW1lIFJlc3RvcmVPY2N1cnJlbmNlTWFya2VyXG5jbGFzcyBBZGRQcmVzZXRPY2N1cnJlbmNlRnJvbUxhc3RPY2N1cnJlbmNlUGF0dGVybiBleHRlbmRzIFRvZ2dsZVByZXNldE9jY3VycmVuY2Uge1xuICBleGVjdXRlKCkge1xuICAgIHRoaXMub2NjdXJyZW5jZU1hbmFnZXIucmVzZXRQYXR0ZXJucygpXG4gICAgY29uc3QgcmVnZXggPSB0aGlzLmdsb2JhbFN0YXRlLmdldChcImxhc3RPY2N1cnJlbmNlUGF0dGVyblwiKVxuICAgIGlmIChyZWdleCkge1xuICAgICAgY29uc3Qgb2NjdXJyZW5jZVR5cGUgPSB0aGlzLmdsb2JhbFN0YXRlLmdldChcImxhc3RPY2N1cnJlbmNlVHlwZVwiKVxuICAgICAgdGhpcy5vY2N1cnJlbmNlTWFuYWdlci5hZGRQYXR0ZXJuKHJlZ2V4LCB7b2NjdXJyZW5jZVR5cGV9KVxuICAgICAgdGhpcy5hY3RpdmF0ZU1vZGUoXCJub3JtYWxcIilcbiAgICB9XG4gIH1cbn1cblxuLy8gRGVsZXRlXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuY2xhc3MgRGVsZXRlIGV4dGVuZHMgT3BlcmF0b3Ige1xuICB0cmFja0NoYW5nZSA9IHRydWVcbiAgZmxhc2hDaGVja3BvaW50ID0gXCJkaWQtc2VsZWN0LW9jY3VycmVuY2VcIlxuICBmbGFzaFR5cGVGb3JPY2N1cnJlbmNlID0gXCJvcGVyYXRvci1yZW1vdmUtb2NjdXJyZW5jZVwiXG4gIHN0YXlPcHRpb25OYW1lID0gXCJzdGF5T25EZWxldGVcIlxuICBzZXRUb0ZpcnN0Q2hhcmFjdGVyT25MaW5ld2lzZSA9IHRydWVcblxuICBleGVjdXRlKCkge1xuICAgIHRoaXMub25EaWRTZWxlY3RUYXJnZXQoKCkgPT4ge1xuICAgICAgaWYgKHRoaXMub2NjdXJyZW5jZVNlbGVjdGVkICYmIHRoaXMub2NjdXJyZW5jZVdpc2UgPT09IFwibGluZXdpc2VcIikge1xuICAgICAgICB0aGlzLmZsYXNoVGFyZ2V0ID0gZmFsc2VcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgaWYgKHRoaXMudGFyZ2V0Lndpc2UgPT09IFwiYmxvY2t3aXNlXCIpIHtcbiAgICAgIHRoaXMucmVzdG9yZVBvc2l0aW9ucyA9IGZhbHNlXG4gICAgfVxuICAgIHN1cGVyLmV4ZWN1dGUoKVxuICB9XG5cbiAgbXV0YXRlU2VsZWN0aW9uKHNlbGVjdGlvbikge1xuICAgIHRoaXMuc2V0VGV4dFRvUmVnaXN0ZXJGb3JTZWxlY3Rpb24oc2VsZWN0aW9uKVxuICAgIHNlbGVjdGlvbi5kZWxldGVTZWxlY3RlZFRleHQoKVxuICB9XG59XG5cbmNsYXNzIERlbGV0ZVJpZ2h0IGV4dGVuZHMgRGVsZXRlIHtcbiAgdGFyZ2V0ID0gXCJNb3ZlUmlnaHRcIlxufVxuXG5jbGFzcyBEZWxldGVMZWZ0IGV4dGVuZHMgRGVsZXRlIHtcbiAgdGFyZ2V0ID0gXCJNb3ZlTGVmdFwiXG59XG5cbmNsYXNzIERlbGV0ZVRvTGFzdENoYXJhY3Rlck9mTGluZSBleHRlbmRzIERlbGV0ZSB7XG4gIHRhcmdldCA9IFwiTW92ZVRvTGFzdENoYXJhY3Rlck9mTGluZVwiXG5cbiAgZXhlY3V0ZSgpIHtcbiAgICB0aGlzLm9uRGlkU2VsZWN0VGFyZ2V0KCgpID0+IHtcbiAgICAgIGlmICh0aGlzLnRhcmdldC53aXNlID09PSBcImJsb2Nrd2lzZVwiKSB7XG4gICAgICAgIGZvciAoY29uc3QgYmxvY2t3aXNlU2VsZWN0aW9uIG9mIHRoaXMuZ2V0QmxvY2t3aXNlU2VsZWN0aW9ucygpKSB7XG4gICAgICAgICAgYmxvY2t3aXNlU2VsZWN0aW9uLmV4dGVuZE1lbWJlclNlbGVjdGlvbnNUb0VuZE9mTGluZSgpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuICAgIHN1cGVyLmV4ZWN1dGUoKVxuICB9XG59XG5cbmNsYXNzIERlbGV0ZUxpbmUgZXh0ZW5kcyBEZWxldGUge1xuICB3aXNlID0gXCJsaW5ld2lzZVwiXG4gIHRhcmdldCA9IFwiTW92ZVRvUmVsYXRpdmVMaW5lXCJcbiAgZmxhc2hUYXJnZXQgPSBmYWxzZVxufVxuXG4vLyBZYW5rXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09XG5jbGFzcyBZYW5rIGV4dGVuZHMgT3BlcmF0b3Ige1xuICB0cmFja0NoYW5nZSA9IHRydWVcbiAgc3RheU9wdGlvbk5hbWUgPSBcInN0YXlPbllhbmtcIlxuXG4gIG11dGF0ZVNlbGVjdGlvbihzZWxlY3Rpb24pIHtcbiAgICB0aGlzLnNldFRleHRUb1JlZ2lzdGVyRm9yU2VsZWN0aW9uKHNlbGVjdGlvbilcbiAgfVxufVxuXG5jbGFzcyBZYW5rTGluZSBleHRlbmRzIFlhbmsge1xuICB3aXNlID0gXCJsaW5ld2lzZVwiXG4gIHRhcmdldCA9IFwiTW92ZVRvUmVsYXRpdmVMaW5lXCJcbn1cblxuY2xhc3MgWWFua1RvTGFzdENoYXJhY3Rlck9mTGluZSBleHRlbmRzIFlhbmsge1xuICB0YXJnZXQgPSBcIk1vdmVUb0xhc3RDaGFyYWN0ZXJPZkxpbmVcIlxufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBbY3RybC1hXVxuY2xhc3MgSW5jcmVhc2UgZXh0ZW5kcyBPcGVyYXRvciB7XG4gIHRhcmdldCA9IFwiRW1wdHlcIiAvLyBjdHJsLWEgaW4gbm9ybWFsLW1vZGUgZmluZCB0YXJnZXQgbnVtYmVyIGluIGN1cnJlbnQgbGluZSBtYW51YWxseVxuICBmbGFzaFRhcmdldCA9IGZhbHNlIC8vIGRvIG1hbnVhbGx5XG4gIHJlc3RvcmVQb3NpdGlvbnMgPSBmYWxzZSAvLyBkbyBtYW51YWxseVxuICBzdGVwID0gMVxuXG4gIGV4ZWN1dGUoKSB7XG4gICAgdGhpcy5uZXdSYW5nZXMgPSBbXVxuICAgIGlmICghdGhpcy5yZWdleCkgdGhpcy5yZWdleCA9IG5ldyBSZWdFeHAoYCR7dGhpcy5nZXRDb25maWcoXCJudW1iZXJSZWdleFwiKX1gLCBcImdcIilcblxuICAgIHN1cGVyLmV4ZWN1dGUoKVxuXG4gICAgaWYgKHRoaXMubmV3UmFuZ2VzLmxlbmd0aCkge1xuICAgICAgaWYgKHRoaXMuZ2V0Q29uZmlnKFwiZmxhc2hPbk9wZXJhdGVcIikgJiYgIXRoaXMuZ2V0Q29uZmlnKFwiZmxhc2hPbk9wZXJhdGVCbGFja2xpc3RcIikuaW5jbHVkZXModGhpcy5uYW1lKSkge1xuICAgICAgICB0aGlzLnZpbVN0YXRlLmZsYXNoKHRoaXMubmV3UmFuZ2VzLCB7dHlwZTogdGhpcy5mbGFzaFR5cGVGb3JPY2N1cnJlbmNlfSlcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXBsYWNlTnVtYmVySW5CdWZmZXJSYW5nZShzY2FuUmFuZ2UsIGZuKSB7XG4gICAgY29uc3QgbmV3UmFuZ2VzID0gW11cbiAgICB0aGlzLnNjYW5FZGl0b3IoXCJmb3J3YXJkXCIsIHRoaXMucmVnZXgsIHtzY2FuUmFuZ2V9LCBldmVudCA9PiB7XG4gICAgICBpZiAoZm4pIHtcbiAgICAgICAgaWYgKGZuKGV2ZW50KSkgZXZlbnQuc3RvcCgpXG4gICAgICAgIGVsc2UgcmV0dXJuXG4gICAgICB9XG4gICAgICBjb25zdCBuZXh0TnVtYmVyID0gdGhpcy5nZXROZXh0TnVtYmVyKGV2ZW50Lm1hdGNoVGV4dClcbiAgICAgIG5ld1Jhbmdlcy5wdXNoKGV2ZW50LnJlcGxhY2UoU3RyaW5nKG5leHROdW1iZXIpKSlcbiAgICB9KVxuICAgIHJldHVybiBuZXdSYW5nZXNcbiAgfVxuXG4gIG11dGF0ZVNlbGVjdGlvbihzZWxlY3Rpb24pIHtcbiAgICBjb25zdCB7Y3Vyc29yfSA9IHNlbGVjdGlvblxuICAgIGlmICh0aGlzLnRhcmdldC5uYW1lID09PSBcIkVtcHR5XCIpIHtcbiAgICAgIC8vIGN0cmwtYSwgY3RybC14IGluIGBub3JtYWwtbW9kZWBcbiAgICAgIGNvbnN0IGN1cnNvclBvc2l0aW9uID0gY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKClcbiAgICAgIGNvbnN0IHNjYW5SYW5nZSA9IHRoaXMuZWRpdG9yLmJ1ZmZlclJhbmdlRm9yQnVmZmVyUm93KGN1cnNvclBvc2l0aW9uLnJvdylcbiAgICAgIGNvbnN0IG5ld1JhbmdlcyA9IHRoaXMucmVwbGFjZU51bWJlckluQnVmZmVyUmFuZ2Uoc2NhblJhbmdlLCBldmVudCA9PlxuICAgICAgICBldmVudC5yYW5nZS5lbmQuaXNHcmVhdGVyVGhhbihjdXJzb3JQb3NpdGlvbilcbiAgICAgIClcbiAgICAgIGNvbnN0IHBvaW50ID0gKG5ld1Jhbmdlcy5sZW5ndGggJiYgbmV3UmFuZ2VzWzBdLmVuZC50cmFuc2xhdGUoWzAsIC0xXSkpIHx8IGN1cnNvclBvc2l0aW9uXG4gICAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24ocG9pbnQpXG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHNjYW5SYW5nZSA9IHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpXG4gICAgICB0aGlzLm5ld1Jhbmdlcy5wdXNoKC4uLnRoaXMucmVwbGFjZU51bWJlckluQnVmZmVyUmFuZ2Uoc2NhblJhbmdlKSlcbiAgICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihzY2FuUmFuZ2Uuc3RhcnQpXG4gICAgfVxuICB9XG5cbiAgZ2V0TmV4dE51bWJlcihudW1iZXJTdHJpbmcpIHtcbiAgICByZXR1cm4gTnVtYmVyLnBhcnNlSW50KG51bWJlclN0cmluZywgMTApICsgdGhpcy5zdGVwICogdGhpcy5nZXRDb3VudCgpXG4gIH1cbn1cblxuLy8gW2N0cmwteF1cbmNsYXNzIERlY3JlYXNlIGV4dGVuZHMgSW5jcmVhc2Uge1xuICBzdGVwID0gLTFcbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gW2cgY3RybC1hXVxuY2xhc3MgSW5jcmVtZW50TnVtYmVyIGV4dGVuZHMgSW5jcmVhc2Uge1xuICBiYXNlTnVtYmVyID0gbnVsbFxuICB0YXJnZXQgPSBudWxsXG5cbiAgZ2V0TmV4dE51bWJlcihudW1iZXJTdHJpbmcpIHtcbiAgICBpZiAodGhpcy5iYXNlTnVtYmVyICE9IG51bGwpIHtcbiAgICAgIHRoaXMuYmFzZU51bWJlciArPSB0aGlzLnN0ZXAgKiB0aGlzLmdldENvdW50KClcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5iYXNlTnVtYmVyID0gTnVtYmVyLnBhcnNlSW50KG51bWJlclN0cmluZywgMTApXG4gICAgfVxuICAgIHJldHVybiB0aGlzLmJhc2VOdW1iZXJcbiAgfVxufVxuXG4vLyBbZyBjdHJsLXhdXG5jbGFzcyBEZWNyZW1lbnROdW1iZXIgZXh0ZW5kcyBJbmNyZW1lbnROdW1iZXIge1xuICBzdGVwID0gLTFcbn1cblxuLy8gUHV0XG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBDdXJzb3IgcGxhY2VtZW50OlxuLy8gLSBwbGFjZSBhdCBlbmQgb2YgbXV0YXRpb246IHBhc3RlIG5vbi1tdWx0aWxpbmUgY2hhcmFjdGVyd2lzZSB0ZXh0XG4vLyAtIHBsYWNlIGF0IHN0YXJ0IG9mIG11dGF0aW9uOiBub24tbXVsdGlsaW5lIGNoYXJhY3Rlcndpc2UgdGV4dChjaGFyYWN0ZXJ3aXNlLCBsaW5ld2lzZSlcbmNsYXNzIFB1dEJlZm9yZSBleHRlbmRzIE9wZXJhdG9yIHtcbiAgbG9jYXRpb24gPSBcImJlZm9yZVwiXG4gIHRhcmdldCA9IFwiRW1wdHlcIlxuICBmbGFzaFR5cGUgPSBcIm9wZXJhdG9yLWxvbmdcIlxuICByZXN0b3JlUG9zaXRpb25zID0gZmFsc2UgLy8gbWFuYWdlIG1hbnVhbGx5XG4gIGZsYXNoVGFyZ2V0ID0gZmFsc2UgLy8gbWFuYWdlIG1hbnVhbGx5XG4gIHRyYWNrQ2hhbmdlID0gZmFsc2UgLy8gbWFuYWdlIG1hbnVhbGx5XG5cbiAgaW5pdGlhbGl6ZSgpIHtcbiAgICB0aGlzLnZpbVN0YXRlLnNlcXVlbnRpYWxQYXN0ZU1hbmFnZXIub25Jbml0aWFsaXplKHRoaXMpXG4gICAgc3VwZXIuaW5pdGlhbGl6ZSgpXG4gIH1cblxuICBleGVjdXRlKCkge1xuICAgIHRoaXMubXV0YXRpb25zQnlTZWxlY3Rpb24gPSBuZXcgTWFwKClcbiAgICB0aGlzLnNlcXVlbnRpYWxQYXN0ZSA9IHRoaXMudmltU3RhdGUuc2VxdWVudGlhbFBhc3RlTWFuYWdlci5vbkV4ZWN1dGUodGhpcylcblxuICAgIHRoaXMub25EaWRGaW5pc2hNdXRhdGlvbigoKSA9PiB7XG4gICAgICBpZiAoIXRoaXMuY2FuY2VsbGVkKSB0aGlzLmFkanVzdEN1cnNvclBvc2l0aW9uKClcbiAgICB9KVxuXG4gICAgc3VwZXIuZXhlY3V0ZSgpXG5cbiAgICBpZiAodGhpcy5jYW5jZWxsZWQpIHJldHVyblxuXG4gICAgdGhpcy5vbkRpZEZpbmlzaE9wZXJhdGlvbigoKSA9PiB7XG4gICAgICAvLyBUcmFja0NoYW5nZVxuICAgICAgY29uc3QgbmV3UmFuZ2UgPSB0aGlzLm11dGF0aW9uc0J5U2VsZWN0aW9uLmdldCh0aGlzLmVkaXRvci5nZXRMYXN0U2VsZWN0aW9uKCkpXG4gICAgICBpZiAobmV3UmFuZ2UpIHRoaXMuc2V0TWFya0ZvckNoYW5nZShuZXdSYW5nZSlcblxuICAgICAgLy8gRmxhc2hcbiAgICAgIGlmICh0aGlzLmdldENvbmZpZyhcImZsYXNoT25PcGVyYXRlXCIpICYmICF0aGlzLmdldENvbmZpZyhcImZsYXNoT25PcGVyYXRlQmxhY2tsaXN0XCIpLmluY2x1ZGVzKHRoaXMubmFtZSkpIHtcbiAgICAgICAgY29uc3QgcmFuZ2VzID0gdGhpcy5lZGl0b3IuZ2V0U2VsZWN0aW9ucygpLm1hcChzZWxlY3Rpb24gPT4gdGhpcy5tdXRhdGlvbnNCeVNlbGVjdGlvbi5nZXQoc2VsZWN0aW9uKSlcbiAgICAgICAgdGhpcy52aW1TdGF0ZS5mbGFzaChyYW5nZXMsIHt0eXBlOiB0aGlzLmdldEZsYXNoVHlwZSgpfSlcbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgYWRqdXN0Q3Vyc29yUG9zaXRpb24oKSB7XG4gICAgZm9yIChjb25zdCBzZWxlY3Rpb24gb2YgdGhpcy5lZGl0b3IuZ2V0U2VsZWN0aW9ucygpKSB7XG4gICAgICBpZiAoIXRoaXMubXV0YXRpb25zQnlTZWxlY3Rpb24uaGFzKHNlbGVjdGlvbikpIGNvbnRpbnVlXG5cbiAgICAgIGNvbnN0IHtjdXJzb3J9ID0gc2VsZWN0aW9uXG4gICAgICBjb25zdCBuZXdSYW5nZSA9IHRoaXMubXV0YXRpb25zQnlTZWxlY3Rpb24uZ2V0KHNlbGVjdGlvbilcbiAgICAgIGlmICh0aGlzLmxpbmV3aXNlUGFzdGUpIHtcbiAgICAgICAgdGhpcy51dGlscy5tb3ZlQ3Vyc29yVG9GaXJzdENoYXJhY3RlckF0Um93KGN1cnNvciwgbmV3UmFuZ2Uuc3RhcnQucm93KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKG5ld1JhbmdlLmlzU2luZ2xlTGluZSgpKSB7XG4gICAgICAgICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKG5ld1JhbmdlLmVuZC50cmFuc2xhdGUoWzAsIC0xXSkpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKG5ld1JhbmdlLnN0YXJ0KVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgbXV0YXRlU2VsZWN0aW9uKHNlbGVjdGlvbikge1xuICAgIGNvbnN0IHZhbHVlID0gdGhpcy52aW1TdGF0ZS5yZWdpc3Rlci5nZXQobnVsbCwgc2VsZWN0aW9uLCB0aGlzLnNlcXVlbnRpYWxQYXN0ZSlcbiAgICBpZiAoIXZhbHVlLnRleHQpIHtcbiAgICAgIHRoaXMuY2FuY2VsbGVkID0gdHJ1ZVxuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgY29uc3QgdGV4dFRvUGFzdGUgPSB2YWx1ZS50ZXh0LnJlcGVhdCh0aGlzLmdldENvdW50KCkpXG4gICAgdGhpcy5saW5ld2lzZVBhc3RlID0gdmFsdWUudHlwZSA9PT0gXCJsaW5ld2lzZVwiIHx8IHRoaXMuaXNNb2RlKFwidmlzdWFsXCIsIFwibGluZXdpc2VcIilcbiAgICBjb25zdCBuZXdSYW5nZSA9IHRoaXMucGFzdGUoc2VsZWN0aW9uLCB0ZXh0VG9QYXN0ZSwge2xpbmV3aXNlUGFzdGU6IHRoaXMubGluZXdpc2VQYXN0ZX0pXG4gICAgdGhpcy5tdXRhdGlvbnNCeVNlbGVjdGlvbi5zZXQoc2VsZWN0aW9uLCBuZXdSYW5nZSlcbiAgICB0aGlzLnZpbVN0YXRlLnNlcXVlbnRpYWxQYXN0ZU1hbmFnZXIuc2F2ZVBhc3RlZFJhbmdlRm9yU2VsZWN0aW9uKHNlbGVjdGlvbiwgbmV3UmFuZ2UpXG4gIH1cblxuICAvLyBSZXR1cm4gcGFzdGVkIHJhbmdlXG4gIHBhc3RlKHNlbGVjdGlvbiwgdGV4dCwge2xpbmV3aXNlUGFzdGV9KSB7XG4gICAgaWYgKHRoaXMuc2VxdWVudGlhbFBhc3RlKSB7XG4gICAgICByZXR1cm4gdGhpcy5wYXN0ZUNoYXJhY3Rlcndpc2Uoc2VsZWN0aW9uLCB0ZXh0KVxuICAgIH0gZWxzZSBpZiAobGluZXdpc2VQYXN0ZSkge1xuICAgICAgcmV0dXJuIHRoaXMucGFzdGVMaW5ld2lzZShzZWxlY3Rpb24sIHRleHQpXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLnBhc3RlQ2hhcmFjdGVyd2lzZShzZWxlY3Rpb24sIHRleHQpXG4gICAgfVxuICB9XG5cbiAgcGFzdGVDaGFyYWN0ZXJ3aXNlKHNlbGVjdGlvbiwgdGV4dCkge1xuICAgIGNvbnN0IHtjdXJzb3J9ID0gc2VsZWN0aW9uXG4gICAgaWYgKHNlbGVjdGlvbi5pc0VtcHR5KCkgJiYgdGhpcy5sb2NhdGlvbiA9PT0gXCJhZnRlclwiICYmICF0aGlzLmlzRW1wdHlSb3coY3Vyc29yLmdldEJ1ZmZlclJvdygpKSkge1xuICAgICAgY3Vyc29yLm1vdmVSaWdodCgpXG4gICAgfVxuICAgIHJldHVybiBzZWxlY3Rpb24uaW5zZXJ0VGV4dCh0ZXh0KVxuICB9XG5cbiAgLy8gUmV0dXJuIG5ld1JhbmdlXG4gIHBhc3RlTGluZXdpc2Uoc2VsZWN0aW9uLCB0ZXh0KSB7XG4gICAgY29uc3Qge2N1cnNvcn0gPSBzZWxlY3Rpb25cbiAgICBjb25zdCBjdXJzb3JSb3cgPSBjdXJzb3IuZ2V0QnVmZmVyUm93KClcbiAgICBpZiAoIXRleHQuZW5kc1dpdGgoXCJcXG5cIikpIHtcbiAgICAgIHRleHQgKz0gXCJcXG5cIlxuICAgIH1cbiAgICBpZiAoc2VsZWN0aW9uLmlzRW1wdHkoKSkge1xuICAgICAgaWYgKHRoaXMubG9jYXRpb24gPT09IFwiYmVmb3JlXCIpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudXRpbHMuaW5zZXJ0VGV4dEF0QnVmZmVyUG9zaXRpb24odGhpcy5lZGl0b3IsIFtjdXJzb3JSb3csIDBdLCB0ZXh0KVxuICAgICAgfSBlbHNlIGlmICh0aGlzLmxvY2F0aW9uID09PSBcImFmdGVyXCIpIHtcbiAgICAgICAgY29uc3QgdGFyZ2V0Um93ID0gdGhpcy5nZXRGb2xkRW5kUm93Rm9yUm93KGN1cnNvclJvdylcbiAgICAgICAgdGhpcy51dGlscy5lbnN1cmVFbmRzV2l0aE5ld0xpbmVGb3JCdWZmZXJSb3codGhpcy5lZGl0b3IsIHRhcmdldFJvdylcbiAgICAgICAgcmV0dXJuIHRoaXMudXRpbHMuaW5zZXJ0VGV4dEF0QnVmZmVyUG9zaXRpb24odGhpcy5lZGl0b3IsIFt0YXJnZXRSb3cgKyAxLCAwXSwgdGV4dClcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKCF0aGlzLmlzTW9kZShcInZpc3VhbFwiLCBcImxpbmV3aXNlXCIpKSB7XG4gICAgICAgIHNlbGVjdGlvbi5pbnNlcnRUZXh0KFwiXFxuXCIpXG4gICAgICB9XG4gICAgICByZXR1cm4gc2VsZWN0aW9uLmluc2VydFRleHQodGV4dClcbiAgICB9XG4gIH1cbn1cblxuY2xhc3MgUHV0QWZ0ZXIgZXh0ZW5kcyBQdXRCZWZvcmUge1xuICBsb2NhdGlvbiA9IFwiYWZ0ZXJcIlxufVxuXG5jbGFzcyBQdXRCZWZvcmVXaXRoQXV0b0luZGVudCBleHRlbmRzIFB1dEJlZm9yZSB7XG4gIHBhc3RlTGluZXdpc2Uoc2VsZWN0aW9uLCB0ZXh0KSB7XG4gICAgY29uc3QgbmV3UmFuZ2UgPSBzdXBlci5wYXN0ZUxpbmV3aXNlKHNlbGVjdGlvbiwgdGV4dClcbiAgICB0aGlzLnV0aWxzLmFkanVzdEluZGVudFdpdGhLZWVwaW5nTGF5b3V0KHRoaXMuZWRpdG9yLCBuZXdSYW5nZSlcbiAgICByZXR1cm4gbmV3UmFuZ2VcbiAgfVxufVxuXG5jbGFzcyBQdXRBZnRlcldpdGhBdXRvSW5kZW50IGV4dGVuZHMgUHV0QmVmb3JlV2l0aEF1dG9JbmRlbnQge1xuICBsb2NhdGlvbiA9IFwiYWZ0ZXJcIlxufVxuXG5jbGFzcyBBZGRCbGFua0xpbmVCZWxvdyBleHRlbmRzIE9wZXJhdG9yIHtcbiAgZmxhc2hUYXJnZXQgPSBmYWxzZVxuICB0YXJnZXQgPSBcIkVtcHR5XCJcbiAgc3RheUF0U2FtZVBvc2l0aW9uID0gdHJ1ZVxuICBzdGF5QnlNYXJrZXIgPSB0cnVlXG4gIHdoZXJlID0gXCJiZWxvd1wiXG5cbiAgbXV0YXRlU2VsZWN0aW9uKHNlbGVjdGlvbikge1xuICAgIGNvbnN0IHBvaW50ID0gc2VsZWN0aW9uLmdldEhlYWRCdWZmZXJQb3NpdGlvbigpXG4gICAgaWYgKHRoaXMud2hlcmUgPT09IFwiYmVsb3dcIikgcG9pbnQucm93KytcbiAgICBwb2ludC5jb2x1bW4gPSAwXG4gICAgdGhpcy5lZGl0b3Iuc2V0VGV4dEluQnVmZmVyUmFuZ2UoW3BvaW50LCBwb2ludF0sIFwiXFxuXCIucmVwZWF0KHRoaXMuZ2V0Q291bnQoKSkpXG4gIH1cbn1cblxuY2xhc3MgQWRkQmxhbmtMaW5lQWJvdmUgZXh0ZW5kcyBBZGRCbGFua0xpbmVCZWxvdyB7XG4gIHdoZXJlID0gXCJhYm92ZVwiXG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBPcGVyYXRvcixcbiAgU2VsZWN0QmFzZSxcbiAgU2VsZWN0LFxuICBTZWxlY3RMYXRlc3RDaGFuZ2UsXG4gIFNlbGVjdFByZXZpb3VzU2VsZWN0aW9uLFxuICBTZWxlY3RQZXJzaXN0ZW50U2VsZWN0aW9uLFxuICBTZWxlY3RPY2N1cnJlbmNlLFxuICBWaXN1YWxNb2RlU2VsZWN0LFxuICBDcmVhdGVQZXJzaXN0ZW50U2VsZWN0aW9uLFxuICBUb2dnbGVQZXJzaXN0ZW50U2VsZWN0aW9uLFxuICBUb2dnbGVQcmVzZXRPY2N1cnJlbmNlLFxuICBUb2dnbGVQcmVzZXRTdWJ3b3JkT2NjdXJyZW5jZSxcbiAgQWRkUHJlc2V0T2NjdXJyZW5jZUZyb21MYXN0T2NjdXJyZW5jZVBhdHRlcm4sXG4gIERlbGV0ZSxcbiAgRGVsZXRlUmlnaHQsXG4gIERlbGV0ZUxlZnQsXG4gIERlbGV0ZVRvTGFzdENoYXJhY3Rlck9mTGluZSxcbiAgRGVsZXRlTGluZSxcbiAgWWFuayxcbiAgWWFua0xpbmUsXG4gIFlhbmtUb0xhc3RDaGFyYWN0ZXJPZkxpbmUsXG4gIEluY3JlYXNlLFxuICBEZWNyZWFzZSxcbiAgSW5jcmVtZW50TnVtYmVyLFxuICBEZWNyZW1lbnROdW1iZXIsXG4gIFB1dEJlZm9yZSxcbiAgUHV0QWZ0ZXIsXG4gIFB1dEJlZm9yZVdpdGhBdXRvSW5kZW50LFxuICBQdXRBZnRlcldpdGhBdXRvSW5kZW50LFxuICBBZGRCbGFua0xpbmVCZWxvdyxcbiAgQWRkQmxhbmtMaW5lQWJvdmUsXG59XG4iXX0=