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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL29wZXJhdG9yLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFdBQVcsQ0FBQTs7Ozs7Ozs7Ozs7Ozs7QUFFWCxJQUFNLENBQUMsR0FBRyxPQUFPLENBQUMsaUJBQWlCLENBQUMsQ0FBQTtBQUNwQyxJQUFNLElBQUksR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUE7O0lBRXhCLFFBQVE7WUFBUixRQUFROztXQUFSLFFBQVE7MEJBQVIsUUFBUTs7K0JBQVIsUUFBUTs7U0FHWixVQUFVLEdBQUcsSUFBSTtTQUVqQixJQUFJLEdBQUcsSUFBSTtTQUNYLE1BQU0sR0FBRyxJQUFJO1NBQ2IsVUFBVSxHQUFHLEtBQUs7U0FDbEIsY0FBYyxHQUFHLE1BQU07U0FFdkIsV0FBVyxHQUFHLElBQUk7U0FDbEIsZUFBZSxHQUFHLFlBQVk7U0FDOUIsU0FBUyxHQUFHLFVBQVU7U0FDdEIsc0JBQXNCLEdBQUcscUJBQXFCO1NBQzlDLFdBQVcsR0FBRyxLQUFLO1NBRW5CLG9CQUFvQixHQUFHLElBQUk7U0FDM0Isa0JBQWtCLEdBQUcsSUFBSTtTQUN6QixjQUFjLEdBQUcsSUFBSTtTQUNyQixZQUFZLEdBQUcsS0FBSztTQUNwQixnQkFBZ0IsR0FBRyxJQUFJO1NBQ3ZCLDZCQUE2QixHQUFHLEtBQUs7U0FFckMsc0JBQXNCLEdBQUcsSUFBSTtTQUM3Qix5QkFBeUIsR0FBRyxJQUFJO1NBRWhDLHlCQUF5QixHQUFHLElBQUk7U0FFaEMsY0FBYyxHQUFHLElBQUk7U0FDckIsS0FBSyxHQUFHLElBQUk7U0FDWixvQkFBb0IsR0FBRyxLQUFLO1NBQzVCLHlCQUF5QixHQUFHLEVBQUU7OztlQS9CMUIsUUFBUTs7V0FpQ0wsbUJBQUc7QUFDUixhQUFPLElBQUksQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQTtLQUM1Qzs7Ozs7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QUFPOzs7U0FEWCxpQkFBaUI7R0FBUyxpQkFBaUI7O0FBSWpELE1BQU0sQ0FBQyxPQUFPLEdBQUc7QUFDZixVQUFRLEVBQVIsUUFBUTtBQUNSLFlBQVUsRUFBVixVQUFVO0FBQ1YsUUFBTSxFQUFOLE1BQU07QUFDTixvQkFBa0IsRUFBbEIsa0JBQWtCO0FBQ2xCLHlCQUF1QixFQUF2Qix1QkFBdUI7QUFDdkIsMkJBQXlCLEVBQXpCLHlCQUF5QjtBQUN6QixrQkFBZ0IsRUFBaEIsZ0JBQWdCO0FBQ2hCLGtCQUFnQixFQUFoQixnQkFBZ0I7QUFDaEIsMkJBQXlCLEVBQXpCLHlCQUF5QjtBQUN6QiwyQkFBeUIsRUFBekIseUJBQXlCO0FBQ3pCLHdCQUFzQixFQUF0QixzQkFBc0I7QUFDdEIsK0JBQTZCLEVBQTdCLDZCQUE2QjtBQUM3Qiw4Q0FBNEMsRUFBNUMsNENBQTRDO0FBQzVDLFFBQU0sRUFBTixNQUFNO0FBQ04sYUFBVyxFQUFYLFdBQVc7QUFDWCxZQUFVLEVBQVYsVUFBVTtBQUNWLDZCQUEyQixFQUEzQiwyQkFBMkI7QUFDM0IsWUFBVSxFQUFWLFVBQVU7QUFDVixNQUFJLEVBQUosSUFBSTtBQUNKLFVBQVEsRUFBUixRQUFRO0FBQ1IsMkJBQXlCLEVBQXpCLHlCQUF5QjtBQUN6QixVQUFRLEVBQVIsUUFBUTtBQUNSLFVBQVEsRUFBUixRQUFRO0FBQ1IsaUJBQWUsRUFBZixlQUFlO0FBQ2YsaUJBQWUsRUFBZixlQUFlO0FBQ2YsV0FBUyxFQUFULFNBQVM7QUFDVCxVQUFRLEVBQVIsUUFBUTtBQUNSLHlCQUF1QixFQUF2Qix1QkFBdUI7QUFDdkIsd0JBQXNCLEVBQXRCLHNCQUFzQjtBQUN0QixtQkFBaUIsRUFBakIsaUJBQWlCO0FBQ2pCLG1CQUFpQixFQUFqQixpQkFBaUI7Q0FDbEIsQ0FBQSIsImZpbGUiOiIvVXNlcnMvdGxhbmRhdS9kb3RmaWxlcy8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi9vcGVyYXRvci5qcyIsInNvdXJjZXNDb250ZW50IjpbIlwidXNlIGJhYmVsXCJcblxuY29uc3QgXyA9IHJlcXVpcmUoXCJ1bmRlcnNjb3JlLXBsdXNcIilcbmNvbnN0IEJhc2UgPSByZXF1aXJlKFwiLi9iYXNlXCIpXG5cbmNsYXNzIE9wZXJhdG9yIGV4dGVuZHMgQmFzZSB7XG4gIHN0YXRpYyBvcGVyYXRpb25LaW5kID0gXCJvcGVyYXRvclwiXG4gIHN0YXRpYyBjb21tYW5kID0gZmFsc2VcbiAgcmVjb3JkYWJsZSA9IHRydWVcblxuICB3aXNlID0gbnVsbFxuICB0YXJnZXQgPSBudWxsXG4gIG9jY3VycmVuY2UgPSBmYWxzZVxuICBvY2N1cnJlbmNlVHlwZSA9IFwiYmFzZVwiXG5cbiAgZmxhc2hUYXJnZXQgPSB0cnVlXG4gIGZsYXNoQ2hlY2twb2ludCA9IFwiZGlkLWZpbmlzaFwiXG4gIGZsYXNoVHlwZSA9IFwib3BlcmF0b3JcIlxuICBmbGFzaFR5cGVGb3JPY2N1cnJlbmNlID0gXCJvcGVyYXRvci1vY2N1cnJlbmNlXCJcbiAgdHJhY2tDaGFuZ2UgPSBmYWxzZVxuXG4gIHBhdHRlcm5Gb3JPY2N1cnJlbmNlID0gbnVsbFxuICBzdGF5QXRTYW1lUG9zaXRpb24gPSBudWxsXG4gIHN0YXlPcHRpb25OYW1lID0gbnVsbFxuICBzdGF5QnlNYXJrZXIgPSBmYWxzZVxuICByZXN0b3JlUG9zaXRpb25zID0gdHJ1ZVxuICBzZXRUb0ZpcnN0Q2hhcmFjdGVyT25MaW5ld2lzZSA9IGZhbHNlXG5cbiAgYWNjZXB0UHJlc2V0T2NjdXJyZW5jZSA9IHRydWVcbiAgYWNjZXB0UGVyc2lzdGVudFNlbGVjdGlvbiA9IHRydWVcblxuICBidWZmZXJDaGVja3BvaW50QnlQdXJwb3NlID0gbnVsbFxuXG4gIHRhcmdldFNlbGVjdGVkID0gbnVsbFxuICBpbnB1dCA9IG51bGxcbiAgcmVhZElucHV0QWZ0ZXJTZWxlY3QgPSBmYWxzZVxuICBidWZmZXJDaGVja3BvaW50QnlQdXJwb3NlID0ge31cblxuICBpc1JlYWR5KCkge1xuICAgIHJldHVybiB0aGlzLnRhcmdldCAmJiB0aGlzLnRhcmdldC5pc1JlYWR5KClcbiAgfVxuXG4gIC8vIENhbGxlZCB3aGVuIG9wZXJhdGlvbiBmaW5pc2hlZFxuICAvLyBUaGlzIGlzIGVzc2VudGlhbGx5IHRvIHJlc2V0IHN0YXRlIGZvciBgLmAgcmVwZWF0LlxuICByZXNldFN0YXRlKCkge1xuICAgIHRoaXMudGFyZ2V0U2VsZWN0ZWQgPSBudWxsXG4gICAgdGhpcy5vY2N1cnJlbmNlU2VsZWN0ZWQgPSBmYWxzZVxuICB9XG5cbiAgLy8gVHdvIGNoZWNrcG9pbnQgZm9yIGRpZmZlcmVudCBwdXJwb3NlXG4gIC8vIC0gb25lIGZvciB1bmRvXG4gIC8vIC0gb25lIGZvciBwcmVzZXJ2ZSBsYXN0IGluc2VydGVkIHRleHRcbiAgY3JlYXRlQnVmZmVyQ2hlY2twb2ludChwdXJwb3NlKSB7XG4gICAgdGhpcy5idWZmZXJDaGVja3BvaW50QnlQdXJwb3NlW3B1cnBvc2VdID0gdGhpcy5lZGl0b3IuY3JlYXRlQ2hlY2twb2ludCgpXG4gIH1cblxuICBnZXRCdWZmZXJDaGVja3BvaW50KHB1cnBvc2UpIHtcbiAgICByZXR1cm4gdGhpcy5idWZmZXJDaGVja3BvaW50QnlQdXJwb3NlW3B1cnBvc2VdXG4gIH1cblxuICBncm91cENoYW5nZXNTaW5jZUJ1ZmZlckNoZWNrcG9pbnQocHVycG9zZSkge1xuICAgIGNvbnN0IGNoZWNrcG9pbnQgPSB0aGlzLmdldEJ1ZmZlckNoZWNrcG9pbnQocHVycG9zZSlcbiAgICBpZiAoY2hlY2twb2ludCkge1xuICAgICAgdGhpcy5lZGl0b3IuZ3JvdXBDaGFuZ2VzU2luY2VDaGVja3BvaW50KGNoZWNrcG9pbnQpXG4gICAgICBkZWxldGUgdGhpcy5idWZmZXJDaGVja3BvaW50QnlQdXJwb3NlW3B1cnBvc2VdXG4gICAgfVxuICB9XG5cbiAgc2V0TWFya0ZvckNoYW5nZShyYW5nZSkge1xuICAgIHRoaXMudmltU3RhdGUubWFyay5zZXQoXCJbXCIsIHJhbmdlLnN0YXJ0KVxuICAgIHRoaXMudmltU3RhdGUubWFyay5zZXQoXCJdXCIsIHJhbmdlLmVuZClcbiAgfVxuXG4gIG5lZWRGbGFzaCgpIHtcbiAgICByZXR1cm4gKFxuICAgICAgdGhpcy5mbGFzaFRhcmdldCAmJlxuICAgICAgdGhpcy5nZXRDb25maWcoXCJmbGFzaE9uT3BlcmF0ZVwiKSAmJlxuICAgICAgIXRoaXMuZ2V0Q29uZmlnKFwiZmxhc2hPbk9wZXJhdGVCbGFja2xpc3RcIikuaW5jbHVkZXModGhpcy5uYW1lKSAmJlxuICAgICAgKHRoaXMubW9kZSAhPT0gXCJ2aXN1YWxcIiB8fCB0aGlzLnN1Ym1vZGUgIT09IHRoaXMudGFyZ2V0Lndpc2UpIC8vIGUuZy4gWSBpbiB2Q1xuICAgIClcbiAgfVxuXG4gIGZsYXNoSWZOZWNlc3NhcnkocmFuZ2VzKSB7XG4gICAgaWYgKHRoaXMubmVlZEZsYXNoKCkpIHtcbiAgICAgIHRoaXMudmltU3RhdGUuZmxhc2gocmFuZ2VzLCB7dHlwZTogdGhpcy5nZXRGbGFzaFR5cGUoKX0pXG4gICAgfVxuICB9XG5cbiAgZmxhc2hDaGFuZ2VJZk5lY2Vzc2FyeSgpIHtcbiAgICBpZiAodGhpcy5uZWVkRmxhc2goKSkge1xuICAgICAgdGhpcy5vbkRpZEZpbmlzaE9wZXJhdGlvbigoKSA9PiB7XG4gICAgICAgIGNvbnN0IHJhbmdlcyA9IHRoaXMubXV0YXRpb25NYW5hZ2VyLmdldFNlbGVjdGVkQnVmZmVyUmFuZ2VzRm9yQ2hlY2twb2ludCh0aGlzLmZsYXNoQ2hlY2twb2ludClcbiAgICAgICAgdGhpcy52aW1TdGF0ZS5mbGFzaChyYW5nZXMsIHt0eXBlOiB0aGlzLmdldEZsYXNoVHlwZSgpfSlcbiAgICAgIH0pXG4gICAgfVxuICB9XG5cbiAgZ2V0Rmxhc2hUeXBlKCkge1xuICAgIHJldHVybiB0aGlzLm9jY3VycmVuY2VTZWxlY3RlZCA/IHRoaXMuZmxhc2hUeXBlRm9yT2NjdXJyZW5jZSA6IHRoaXMuZmxhc2hUeXBlXG4gIH1cblxuICB0cmFja0NoYW5nZUlmTmVjZXNzYXJ5KCkge1xuICAgIGlmICghdGhpcy50cmFja0NoYW5nZSkgcmV0dXJuXG4gICAgdGhpcy5vbkRpZEZpbmlzaE9wZXJhdGlvbigoKSA9PiB7XG4gICAgICBjb25zdCByYW5nZSA9IHRoaXMubXV0YXRpb25NYW5hZ2VyLmdldE11dGF0ZWRCdWZmZXJSYW5nZUZvclNlbGVjdGlvbih0aGlzLmVkaXRvci5nZXRMYXN0U2VsZWN0aW9uKCkpXG4gICAgICBpZiAocmFuZ2UpIHRoaXMuc2V0TWFya0ZvckNoYW5nZShyYW5nZSlcbiAgICB9KVxuICB9XG5cbiAgaW5pdGlhbGl6ZSgpIHtcbiAgICB0aGlzLnN1YnNjcmliZVJlc2V0T2NjdXJyZW5jZVBhdHRlcm5JZk5lZWRlZCgpXG5cbiAgICAvLyBXaGVuIHByZXNldC1vY2N1cnJlbmNlIHdhcyBleGlzdHMsIG9wZXJhdGUgb24gb2NjdXJyZW5jZS13aXNlXG4gICAgaWYgKHRoaXMuYWNjZXB0UHJlc2V0T2NjdXJyZW5jZSAmJiB0aGlzLm9jY3VycmVuY2VNYW5hZ2VyLmhhc01hcmtlcnMoKSkge1xuICAgICAgdGhpcy5vY2N1cnJlbmNlID0gdHJ1ZVxuICAgIH1cblxuICAgIC8vIFtGSVhNRV0gT1JERVItTUFUVEVSXG4gICAgLy8gVG8gcGljayBjdXJzb3Itd29yZCB0byBmaW5kIG9jY3VycmVuY2UgYmFzZSBwYXR0ZXJuLlxuICAgIC8vIFRoaXMgaGFzIHRvIGJlIGRvbmUgQkVGT1JFIGNvbnZlcnRpbmcgcGVyc2lzdGVudC1zZWxlY3Rpb24gaW50byByZWFsLXNlbGVjdGlvbi5cbiAgICAvLyBTaW5jZSB3aGVuIHBlcnNpc3RlbnQtc2VsZWN0aW9uIGlzIGFjdHVhbGx5IHNlbGVjdGVkLCBpdCBjaGFuZ2UgY3Vyc29yIHBvc2l0aW9uLlxuICAgIGlmICh0aGlzLm9jY3VycmVuY2UgJiYgIXRoaXMub2NjdXJyZW5jZU1hbmFnZXIuaGFzTWFya2VycygpKSB7XG4gICAgICBjb25zdCByZWdleCA9IHRoaXMucGF0dGVybkZvck9jY3VycmVuY2UgfHwgdGhpcy5nZXRQYXR0ZXJuRm9yT2NjdXJyZW5jZVR5cGUodGhpcy5vY2N1cnJlbmNlVHlwZSlcbiAgICAgIHRoaXMub2NjdXJyZW5jZU1hbmFnZXIuYWRkUGF0dGVybihyZWdleClcbiAgICB9XG5cbiAgICAvLyBUaGlzIGNoYW5nZSBjdXJzb3IgcG9zaXRpb24uXG4gICAgaWYgKHRoaXMuc2VsZWN0UGVyc2lzdGVudFNlbGVjdGlvbklmTmVjZXNzYXJ5KCkpIHtcbiAgICAgIC8vIFtGSVhNRV0gc2VsZWN0aW9uLXdpc2UgaXMgbm90IHN5bmNoZWQgaWYgaXQgYWxyZWFkeSB2aXN1YWwtbW9kZVxuICAgICAgaWYgKHRoaXMubW9kZSAhPT0gXCJ2aXN1YWxcIikge1xuICAgICAgICB0aGlzLnZpbVN0YXRlLmFjdGl2YXRlKFwidmlzdWFsXCIsIHRoaXMuc3dyYXAuZGV0ZWN0V2lzZSh0aGlzLmVkaXRvcikpXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHRoaXMubW9kZSA9PT0gXCJ2aXN1YWxcIikge1xuICAgICAgdGhpcy50YXJnZXQgPSBcIkN1cnJlbnRTZWxlY3Rpb25cIlxuICAgIH1cbiAgICBpZiAoXy5pc1N0cmluZyh0aGlzLnRhcmdldCkpIHtcbiAgICAgIHRoaXMuc2V0VGFyZ2V0KHRoaXMuZ2V0SW5zdGFuY2UodGhpcy50YXJnZXQpKVxuICAgIH1cblxuICAgIHN1cGVyLmluaXRpYWxpemUoKVxuICB9XG5cbiAgc3Vic2NyaWJlUmVzZXRPY2N1cnJlbmNlUGF0dGVybklmTmVlZGVkKCkge1xuICAgIC8vIFtDQVVUSU9OXVxuICAgIC8vIFRoaXMgbWV0aG9kIGhhcyB0byBiZSBjYWxsZWQgaW4gUFJPUEVSIHRpbWluZy5cbiAgICAvLyBJZiBvY2N1cnJlbmNlIGlzIHRydWUgYnV0IG5vIHByZXNldC1vY2N1cnJlbmNlXG4gICAgLy8gVHJlYXQgdGhhdCBgb2NjdXJyZW5jZWAgaXMgQk9VTkRFRCB0byBvcGVyYXRvciBpdHNlbGYsIHNvIGNsZWFucCBhdCBmaW5pc2hlZC5cbiAgICBpZiAodGhpcy5vY2N1cnJlbmNlICYmICF0aGlzLm9jY3VycmVuY2VNYW5hZ2VyLmhhc01hcmtlcnMoKSkge1xuICAgICAgdGhpcy5vbkRpZFJlc2V0T3BlcmF0aW9uU3RhY2soKCkgPT4gdGhpcy5vY2N1cnJlbmNlTWFuYWdlci5yZXNldFBhdHRlcm5zKCkpXG4gICAgfVxuICB9XG5cbiAgc2V0TW9kaWZpZXIoe3dpc2UsIG9jY3VycmVuY2UsIG9jY3VycmVuY2VUeXBlfSkge1xuICAgIGlmICh3aXNlKSB7XG4gICAgICB0aGlzLndpc2UgPSB3aXNlXG4gICAgfSBlbHNlIGlmIChvY2N1cnJlbmNlKSB7XG4gICAgICB0aGlzLm9jY3VycmVuY2UgPSBvY2N1cnJlbmNlXG4gICAgICB0aGlzLm9jY3VycmVuY2VUeXBlID0gb2NjdXJyZW5jZVR5cGVcbiAgICAgIC8vIFRoaXMgaXMgbyBtb2RpZmllciBjYXNlKGUuZy4gYGMgbyBwYCwgYGQgTyBmYClcbiAgICAgIC8vIFdlIFJFU0VUIGV4aXN0aW5nIG9jY3VyZW5jZS1tYXJrZXIgd2hlbiBgb2Agb3IgYE9gIG1vZGlmaWVyIGlzIHR5cGVkIGJ5IHVzZXIuXG4gICAgICBjb25zdCByZWdleCA9IHRoaXMuZ2V0UGF0dGVybkZvck9jY3VycmVuY2VUeXBlKG9jY3VycmVuY2VUeXBlKVxuICAgICAgdGhpcy5vY2N1cnJlbmNlTWFuYWdlci5hZGRQYXR0ZXJuKHJlZ2V4LCB7cmVzZXQ6IHRydWUsIG9jY3VycmVuY2VUeXBlfSlcbiAgICAgIHRoaXMub25EaWRSZXNldE9wZXJhdGlvblN0YWNrKCgpID0+IHRoaXMub2NjdXJyZW5jZU1hbmFnZXIucmVzZXRQYXR0ZXJucygpKVxuICAgIH1cbiAgfVxuXG4gIC8vIHJldHVybiB0cnVlL2ZhbHNlIHRvIGluZGljYXRlIHN1Y2Nlc3NcbiAgc2VsZWN0UGVyc2lzdGVudFNlbGVjdGlvbklmTmVjZXNzYXJ5KCkge1xuICAgIGlmIChcbiAgICAgIHRoaXMuYWNjZXB0UGVyc2lzdGVudFNlbGVjdGlvbiAmJlxuICAgICAgdGhpcy5nZXRDb25maWcoXCJhdXRvU2VsZWN0UGVyc2lzdGVudFNlbGVjdGlvbk9uT3BlcmF0ZVwiKSAmJlxuICAgICAgIXRoaXMucGVyc2lzdGVudFNlbGVjdGlvbi5pc0VtcHR5KClcbiAgICApIHtcbiAgICAgIHRoaXMucGVyc2lzdGVudFNlbGVjdGlvbi5zZWxlY3QoKVxuICAgICAgdGhpcy5lZGl0b3IubWVyZ2VJbnRlcnNlY3RpbmdTZWxlY3Rpb25zKClcbiAgICAgIHRoaXMuc3dyYXAuc2F2ZVByb3BlcnRpZXModGhpcy5lZGl0b3IpXG5cbiAgICAgIHJldHVybiB0cnVlXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cbiAgfVxuXG4gIGdldFBhdHRlcm5Gb3JPY2N1cnJlbmNlVHlwZShvY2N1cnJlbmNlVHlwZSkge1xuICAgIGlmIChvY2N1cnJlbmNlVHlwZSA9PT0gXCJiYXNlXCIpIHtcbiAgICAgIHJldHVybiB0aGlzLnV0aWxzLmdldFdvcmRQYXR0ZXJuQXRCdWZmZXJQb3NpdGlvbih0aGlzLmVkaXRvciwgdGhpcy5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpKVxuICAgIH0gZWxzZSBpZiAob2NjdXJyZW5jZVR5cGUgPT09IFwic3Vid29yZFwiKSB7XG4gICAgICByZXR1cm4gdGhpcy51dGlscy5nZXRTdWJ3b3JkUGF0dGVybkF0QnVmZmVyUG9zaXRpb24odGhpcy5lZGl0b3IsIHRoaXMuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKSlcbiAgICB9XG4gIH1cblxuICAvLyB0YXJnZXQgaXMgVGV4dE9iamVjdCBvciBNb3Rpb24gdG8gb3BlcmF0ZSBvbi5cbiAgc2V0VGFyZ2V0KHRhcmdldCkge1xuICAgIHRoaXMudGFyZ2V0ID0gdGFyZ2V0XG4gICAgdGhpcy50YXJnZXQub3BlcmF0b3IgPSB0aGlzXG4gICAgdGhpcy5lbWl0RGlkU2V0VGFyZ2V0KHRoaXMpXG4gIH1cblxuICBzZXRUZXh0VG9SZWdpc3RlckZvclNlbGVjdGlvbihzZWxlY3Rpb24pIHtcbiAgICB0aGlzLnNldFRleHRUb1JlZ2lzdGVyKHNlbGVjdGlvbi5nZXRUZXh0KCksIHNlbGVjdGlvbilcbiAgfVxuXG4gIHNldFRleHRUb1JlZ2lzdGVyKHRleHQsIHNlbGVjdGlvbikge1xuICAgIGlmICh0aGlzLnZpbVN0YXRlLnJlZ2lzdGVyLmlzVW5uYW1lZCgpICYmIHRoaXMuaXNCbGFja2hvbGVSZWdpc3RlcmVkT3BlcmF0b3IoKSkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgY29uc3Qgd2lzZSA9IHRoaXMub2NjdXJyZW5jZVNlbGVjdGVkID8gdGhpcy5vY2N1cnJlbmNlV2lzZSA6IHRoaXMudGFyZ2V0Lndpc2VcbiAgICBpZiAod2lzZSA9PT0gXCJsaW5ld2lzZVwiICYmICF0ZXh0LmVuZHNXaXRoKFwiXFxuXCIpKSB7XG4gICAgICB0ZXh0ICs9IFwiXFxuXCJcbiAgICB9XG5cbiAgICBpZiAodGV4dCkge1xuICAgICAgdGhpcy52aW1TdGF0ZS5yZWdpc3Rlci5zZXQobnVsbCwge3RleHQsIHNlbGVjdGlvbn0pXG5cbiAgICAgIGlmICh0aGlzLnZpbVN0YXRlLnJlZ2lzdGVyLmlzVW5uYW1lZCgpKSB7XG4gICAgICAgIGlmICh0aGlzLmluc3RhbmNlb2YoXCJEZWxldGVcIikgfHwgdGhpcy5pbnN0YW5jZW9mKFwiQ2hhbmdlXCIpKSB7XG4gICAgICAgICAgaWYgKCF0aGlzLm5lZWRTYXZlVG9OdW1iZXJlZFJlZ2lzdGVyKHRoaXMudGFyZ2V0KSAmJiB0aGlzLnV0aWxzLmlzU2luZ2xlTGluZVRleHQodGV4dCkpIHtcbiAgICAgICAgICAgIHRoaXMudmltU3RhdGUucmVnaXN0ZXIuc2V0KFwiLVwiLCB7dGV4dCwgc2VsZWN0aW9ufSkgLy8gc21hbGwtY2hhbmdlXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMudmltU3RhdGUucmVnaXN0ZXIuc2V0KFwiMVwiLCB7dGV4dCwgc2VsZWN0aW9ufSlcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5pbnN0YW5jZW9mKFwiWWFua1wiKSkge1xuICAgICAgICAgIHRoaXMudmltU3RhdGUucmVnaXN0ZXIuc2V0KFwiMFwiLCB7dGV4dCwgc2VsZWN0aW9ufSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGlzQmxhY2tob2xlUmVnaXN0ZXJlZE9wZXJhdG9yKCkge1xuICAgIGNvbnN0IG9wZXJhdG9ycyA9IHRoaXMuZ2V0Q29uZmlnKFwiYmxhY2tob2xlUmVnaXN0ZXJlZE9wZXJhdG9yc1wiKVxuICAgIGNvbnN0IHdpbGRDYXJkT3BlcmF0b3JzID0gb3BlcmF0b3JzLmZpbHRlcihuYW1lID0+IG5hbWUuZW5kc1dpdGgoXCIqXCIpKVxuICAgIGNvbnN0IGNvbW1hbmROYW1lID0gdGhpcy5nZXRDb21tYW5kTmFtZVdpdGhvdXRQcmVmaXgoKVxuICAgIHJldHVybiAoXG4gICAgICB3aWxkQ2FyZE9wZXJhdG9ycy5zb21lKG5hbWUgPT4gbmV3IFJlZ0V4cChcIl5cIiArIG5hbWUucmVwbGFjZShcIipcIiwgXCIuKlwiKSkudGVzdChjb21tYW5kTmFtZSkpIHx8XG4gICAgICBvcGVyYXRvcnMuaW5jbHVkZXMoY29tbWFuZE5hbWUpXG4gICAgKVxuICB9XG5cbiAgbmVlZFNhdmVUb051bWJlcmVkUmVnaXN0ZXIodGFyZ2V0KSB7XG4gICAgLy8gVXNlZCB0byBkZXRlcm1pbmUgd2hhdCByZWdpc3RlciB0byB1c2Ugb24gY2hhbmdlIGFuZCBkZWxldGUgb3BlcmF0aW9uLlxuICAgIC8vIEZvbGxvd2luZyBtb3Rpb24gc2hvdWxkIHNhdmUgdG8gMS05IHJlZ2lzdGVyIHJlZ2VyZGxlc3Mgb2YgY29udGVudCBpcyBzbWFsbCBvciBiaWcuXG4gICAgY29uc3QgZ29lc1RvTnVtYmVyZWRSZWdpc3Rlck1vdGlvbk5hbWVzID0gW1xuICAgICAgXCJNb3ZlVG9QYWlyXCIsIC8vICVcbiAgICAgIFwiTW92ZVRvTmV4dFNlbnRlbmNlXCIsIC8vICgsIClcbiAgICAgIFwiU2VhcmNoXCIsIC8vIC8sID8sIG4sIE5cbiAgICAgIFwiTW92ZVRvTmV4dFBhcmFncmFwaFwiLCAvLyB7LCB9XG4gICAgXVxuICAgIHJldHVybiBnb2VzVG9OdW1iZXJlZFJlZ2lzdGVyTW90aW9uTmFtZXMuc29tZShuYW1lID0+IHRhcmdldC5pbnN0YW5jZW9mKG5hbWUpKVxuICB9XG5cbiAgbm9ybWFsaXplU2VsZWN0aW9uc0lmTmVjZXNzYXJ5KCkge1xuICAgIGlmICh0aGlzLm1vZGUgPT09IFwidmlzdWFsXCIgJiYgdGhpcy50YXJnZXQgJiYgdGhpcy50YXJnZXQuaXNNb3Rpb24oKSkge1xuICAgICAgdGhpcy5zd3JhcC5ub3JtYWxpemUodGhpcy5lZGl0b3IpXG4gICAgfVxuICB9XG5cbiAgbXV0YXRlU2VsZWN0aW9ucygpIHtcbiAgICBmb3IgKGNvbnN0IHNlbGVjdGlvbiBvZiB0aGlzLmVkaXRvci5nZXRTZWxlY3Rpb25zT3JkZXJlZEJ5QnVmZmVyUG9zaXRpb24oKSkge1xuICAgICAgdGhpcy5tdXRhdGVTZWxlY3Rpb24oc2VsZWN0aW9uKVxuICAgIH1cbiAgICB0aGlzLm11dGF0aW9uTWFuYWdlci5zZXRDaGVja3BvaW50KFwiZGlkLWZpbmlzaFwiKVxuICAgIHRoaXMucmVzdG9yZUN1cnNvclBvc2l0aW9uc0lmTmVjZXNzYXJ5KClcbiAgfVxuXG4gIHByZVNlbGVjdCgpIHtcbiAgICB0aGlzLm5vcm1hbGl6ZVNlbGVjdGlvbnNJZk5lY2Vzc2FyeSgpXG4gICAgdGhpcy5jcmVhdGVCdWZmZXJDaGVja3BvaW50KFwidW5kb1wiKVxuICB9XG5cbiAgcG9zdE11dGF0ZSgpIHtcbiAgICB0aGlzLmdyb3VwQ2hhbmdlc1NpbmNlQnVmZmVyQ2hlY2twb2ludChcInVuZG9cIilcbiAgICB0aGlzLmVtaXREaWRGaW5pc2hNdXRhdGlvbigpXG5cbiAgICAvLyBFdmVuIHRob3VnaCB3ZSBmYWlsIHRvIHNlbGVjdCB0YXJnZXQgYW5kIGZhaWwgdG8gbXV0YXRlLFxuICAgIC8vIHdlIGhhdmUgdG8gcmV0dXJuIHRvIG5vcm1hbC1tb2RlIGZyb20gb3BlcmF0b3ItcGVuZGluZyBvciB2aXN1YWxcbiAgICB0aGlzLmFjdGl2YXRlTW9kZShcIm5vcm1hbFwiKVxuICB9XG5cbiAgLy8gTWFpblxuICBleGVjdXRlKCkge1xuICAgIHRoaXMucHJlU2VsZWN0KClcblxuICAgIGlmICh0aGlzLnJlYWRJbnB1dEFmdGVyU2VsZWN0ICYmICF0aGlzLnJlcGVhdGVkKSB7XG4gICAgICByZXR1cm4gdGhpcy5leGVjdXRlQXN5bmNUb1JlYWRJbnB1dEFmdGVyU2VsZWN0KClcbiAgICB9XG5cbiAgICBpZiAodGhpcy5zZWxlY3RUYXJnZXQoKSkgdGhpcy5tdXRhdGVTZWxlY3Rpb25zKClcbiAgICB0aGlzLnBvc3RNdXRhdGUoKVxuICB9XG5cbiAgYXN5bmMgZXhlY3V0ZUFzeW5jVG9SZWFkSW5wdXRBZnRlclNlbGVjdCgpIHtcbiAgICBpZiAodGhpcy5zZWxlY3RUYXJnZXQoKSkge1xuICAgICAgdGhpcy5pbnB1dCA9IGF3YWl0IHRoaXMuZm9jdXNJbnB1dFByb21pc2VkKHRoaXMuZm9jdXNJbnB1dE9wdGlvbnMpXG4gICAgICBpZiAodGhpcy5pbnB1dCA9PSBudWxsKSB7XG4gICAgICAgIGlmICh0aGlzLm1vZGUgIT09IFwidmlzdWFsXCIpIHtcbiAgICAgICAgICB0aGlzLmVkaXRvci5yZXZlcnRUb0NoZWNrcG9pbnQodGhpcy5nZXRCdWZmZXJDaGVja3BvaW50KFwidW5kb1wiKSlcbiAgICAgICAgICB0aGlzLmFjdGl2YXRlTW9kZShcIm5vcm1hbFwiKVxuICAgICAgICB9XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgdGhpcy5tdXRhdGVTZWxlY3Rpb25zKClcbiAgICB9XG4gICAgdGhpcy5wb3N0TXV0YXRlKClcbiAgfVxuXG4gIC8vIFJldHVybiB0cnVlIHVubGVzcyBhbGwgc2VsZWN0aW9uIGlzIGVtcHR5LlxuICBzZWxlY3RUYXJnZXQoKSB7XG4gICAgaWYgKHRoaXMudGFyZ2V0U2VsZWN0ZWQgIT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHRoaXMudGFyZ2V0U2VsZWN0ZWRcbiAgICB9XG4gICAgdGhpcy5tdXRhdGlvbk1hbmFnZXIuaW5pdCh7c3RheUJ5TWFya2VyOiB0aGlzLnN0YXlCeU1hcmtlcn0pXG5cbiAgICBpZiAodGhpcy50YXJnZXQuaXNNb3Rpb24oKSAmJiB0aGlzLm1vZGUgPT09IFwidmlzdWFsXCIpIHRoaXMudGFyZ2V0Lndpc2UgPSB0aGlzLnN1Ym1vZGVcbiAgICBpZiAodGhpcy53aXNlICE9IG51bGwpIHRoaXMudGFyZ2V0LmZvcmNlV2lzZSh0aGlzLndpc2UpXG5cbiAgICB0aGlzLmVtaXRXaWxsU2VsZWN0VGFyZ2V0KClcblxuICAgIC8vIEFsbG93IGN1cnNvciBwb3NpdGlvbiBhZGp1c3RtZW50ICdvbi13aWxsLXNlbGVjdC10YXJnZXQnIGhvb2suXG4gICAgLy8gc28gY2hlY2twb2ludCBjb21lcyBBRlRFUiBAZW1pdFdpbGxTZWxlY3RUYXJnZXQoKVxuICAgIHRoaXMubXV0YXRpb25NYW5hZ2VyLnNldENoZWNrcG9pbnQoXCJ3aWxsLXNlbGVjdFwiKVxuXG4gICAgLy8gTk9URTogV2hlbiByZXBlYXRlZCwgc2V0IG9jY3VycmVuY2UtbWFya2VyIGZyb20gcGF0dGVybiBzdG9yZWQgYXMgc3RhdGUuXG4gICAgaWYgKHRoaXMucmVwZWF0ZWQgJiYgdGhpcy5vY2N1cnJlbmNlICYmICF0aGlzLm9jY3VycmVuY2VNYW5hZ2VyLmhhc01hcmtlcnMoKSkge1xuICAgICAgdGhpcy5vY2N1cnJlbmNlTWFuYWdlci5hZGRQYXR0ZXJuKHRoaXMucGF0dGVybkZvck9jY3VycmVuY2UsIHtvY2N1cnJlbmNlVHlwZTogdGhpcy5vY2N1cnJlbmNlVHlwZX0pXG4gICAgfVxuXG4gICAgdGhpcy50YXJnZXQuZXhlY3V0ZSgpXG5cbiAgICB0aGlzLm11dGF0aW9uTWFuYWdlci5zZXRDaGVja3BvaW50KFwiZGlkLXNlbGVjdFwiKVxuICAgIGlmICh0aGlzLm9jY3VycmVuY2UpIHtcbiAgICAgIGlmICghdGhpcy5wYXR0ZXJuRm9yT2NjdXJyZW5jZSkge1xuICAgICAgICAvLyBQcmVzZXJ2ZSBvY2N1cnJlbmNlUGF0dGVybiBmb3IgLiByZXBlYXQuXG4gICAgICAgIHRoaXMucGF0dGVybkZvck9jY3VycmVuY2UgPSB0aGlzLm9jY3VycmVuY2VNYW5hZ2VyLmJ1aWxkUGF0dGVybigpXG4gICAgICB9XG5cbiAgICAgIHRoaXMub2NjdXJyZW5jZVdpc2UgPSB0aGlzLndpc2UgfHwgXCJjaGFyYWN0ZXJ3aXNlXCJcbiAgICAgIGlmICh0aGlzLm9jY3VycmVuY2VNYW5hZ2VyLnNlbGVjdCh0aGlzLm9jY3VycmVuY2VXaXNlKSkge1xuICAgICAgICB0aGlzLm9jY3VycmVuY2VTZWxlY3RlZCA9IHRydWVcbiAgICAgICAgdGhpcy5tdXRhdGlvbk1hbmFnZXIuc2V0Q2hlY2twb2ludChcImRpZC1zZWxlY3Qtb2NjdXJyZW5jZVwiKVxuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMudGFyZ2V0U2VsZWN0ZWQgPSB0aGlzLnZpbVN0YXRlLmhhdmVTb21lTm9uRW1wdHlTZWxlY3Rpb24oKSB8fCB0aGlzLnRhcmdldC5uYW1lID09PSBcIkVtcHR5XCJcbiAgICBpZiAodGhpcy50YXJnZXRTZWxlY3RlZCkge1xuICAgICAgdGhpcy5lbWl0RGlkU2VsZWN0VGFyZ2V0KClcbiAgICAgIHRoaXMuZmxhc2hDaGFuZ2VJZk5lY2Vzc2FyeSgpXG4gICAgICB0aGlzLnRyYWNrQ2hhbmdlSWZOZWNlc3NhcnkoKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmVtaXREaWRGYWlsU2VsZWN0VGFyZ2V0KClcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy50YXJnZXRTZWxlY3RlZFxuICB9XG5cbiAgcmVzdG9yZUN1cnNvclBvc2l0aW9uc0lmTmVjZXNzYXJ5KCkge1xuICAgIGlmICghdGhpcy5yZXN0b3JlUG9zaXRpb25zKSByZXR1cm5cblxuICAgIGNvbnN0IHN0YXkgPVxuICAgICAgdGhpcy5zdGF5QXRTYW1lUG9zaXRpb24gIT0gbnVsbFxuICAgICAgICA/IHRoaXMuc3RheUF0U2FtZVBvc2l0aW9uXG4gICAgICAgIDogdGhpcy5nZXRDb25maWcodGhpcy5zdGF5T3B0aW9uTmFtZSkgfHwgKHRoaXMub2NjdXJyZW5jZVNlbGVjdGVkICYmIHRoaXMuZ2V0Q29uZmlnKFwic3RheU9uT2NjdXJyZW5jZVwiKSlcbiAgICBjb25zdCB3aXNlID0gdGhpcy5vY2N1cnJlbmNlU2VsZWN0ZWQgPyB0aGlzLm9jY3VycmVuY2VXaXNlIDogdGhpcy50YXJnZXQud2lzZVxuICAgIGNvbnN0IHtzZXRUb0ZpcnN0Q2hhcmFjdGVyT25MaW5ld2lzZX0gPSB0aGlzXG4gICAgdGhpcy5tdXRhdGlvbk1hbmFnZXIucmVzdG9yZUN1cnNvclBvc2l0aW9ucyh7c3RheSwgd2lzZSwgc2V0VG9GaXJzdENoYXJhY3Rlck9uTGluZXdpc2V9KVxuICB9XG59XG5cbmNsYXNzIFNlbGVjdEJhc2UgZXh0ZW5kcyBPcGVyYXRvciB7XG4gIHN0YXRpYyBjb21tYW5kID0gZmFsc2VcbiAgZmxhc2hUYXJnZXQgPSBmYWxzZVxuICByZWNvcmRhYmxlID0gZmFsc2VcblxuICBleGVjdXRlKCkge1xuICAgIHRoaXMubm9ybWFsaXplU2VsZWN0aW9uc0lmTmVjZXNzYXJ5KClcbiAgICB0aGlzLnNlbGVjdFRhcmdldCgpXG5cbiAgICBpZiAodGhpcy50YXJnZXQuc2VsZWN0U3VjY2VlZGVkKSB7XG4gICAgICBpZiAodGhpcy50YXJnZXQuaXNUZXh0T2JqZWN0KCkpIHtcbiAgICAgICAgdGhpcy5lZGl0b3Iuc2Nyb2xsVG9DdXJzb3JQb3NpdGlvbigpXG4gICAgICB9XG4gICAgICBjb25zdCB3aXNlID0gdGhpcy5vY2N1cnJlbmNlU2VsZWN0ZWQgPyB0aGlzLm9jY3VycmVuY2VXaXNlIDogdGhpcy50YXJnZXQud2lzZVxuICAgICAgdGhpcy5hY3RpdmF0ZU1vZGVJZk5lY2Vzc2FyeShcInZpc3VhbFwiLCB3aXNlKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmNhbmNlbE9wZXJhdGlvbigpXG4gICAgfVxuICB9XG59XG5cbmNsYXNzIFNlbGVjdCBleHRlbmRzIFNlbGVjdEJhc2Uge1xuICBleGVjdXRlKCkge1xuICAgIHRoaXMuc3dyYXAuc2F2ZVByb3BlcnRpZXModGhpcy5lZGl0b3IpXG4gICAgc3VwZXIuZXhlY3V0ZSgpXG4gIH1cbn1cblxuY2xhc3MgU2VsZWN0TGF0ZXN0Q2hhbmdlIGV4dGVuZHMgU2VsZWN0QmFzZSB7XG4gIHRhcmdldCA9IFwiQUxhdGVzdENoYW5nZVwiXG59XG5cbmNsYXNzIFNlbGVjdFByZXZpb3VzU2VsZWN0aW9uIGV4dGVuZHMgU2VsZWN0QmFzZSB7XG4gIHRhcmdldCA9IFwiUHJldmlvdXNTZWxlY3Rpb25cIlxufVxuXG5jbGFzcyBTZWxlY3RQZXJzaXN0ZW50U2VsZWN0aW9uIGV4dGVuZHMgU2VsZWN0QmFzZSB7XG4gIHRhcmdldCA9IFwiQVBlcnNpc3RlbnRTZWxlY3Rpb25cIlxuICBhY2NlcHRQZXJzaXN0ZW50U2VsZWN0aW9uID0gZmFsc2Vcbn1cblxuY2xhc3MgU2VsZWN0T2NjdXJyZW5jZSBleHRlbmRzIFNlbGVjdEJhc2Uge1xuICBvY2N1cnJlbmNlID0gdHJ1ZVxufVxuXG4vLyBWaXN1YWxNb2RlU2VsZWN0OiB1c2VkIGluIHZpc3VhbC1tb2RlXG4vLyBXaGVuIHRleHQtb2JqZWN0IGlzIGludm9rZWQgZnJvbSBub3JtYWwgb3Igdml1c2FsLW1vZGUsIG9wZXJhdGlvbiB3b3VsZCBiZVxuLy8gID0+IFZpc3VhbE1vZGVTZWxlY3Qgb3BlcmF0b3Igd2l0aCB0YXJnZXQ9dGV4dC1vYmplY3Rcbi8vIFdoZW4gbW90aW9uIGlzIGludm9rZWQgZnJvbSB2aXN1YWwtbW9kZSwgb3BlcmF0aW9uIHdvdWxkIGJlXG4vLyAgPT4gVmlzdWFsTW9kZVNlbGVjdCBvcGVyYXRvciB3aXRoIHRhcmdldD1tb3Rpb24pXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gVmlzdWFsTW9kZVNlbGVjdCBpcyB1c2VkIGluIFRXTyBzaXR1YXRpb24uXG4vLyAtIHZpc3VhbC1tb2RlIG9wZXJhdGlvblxuLy8gICAtIGUuZzogYHYgbGAsIGBWIGpgLCBgdiBpIHBgLi4uXG4vLyAtIERpcmVjdGx5IGludm9rZSB0ZXh0LW9iamVjdCBmcm9tIG5vcm1hbC1tb2RlXG4vLyAgIC0gZS5nOiBJbnZva2UgYElubmVyIFBhcmFncmFwaGAgZnJvbSBjb21tYW5kLXBhbGV0dGUuXG5jbGFzcyBWaXN1YWxNb2RlU2VsZWN0IGV4dGVuZHMgU2VsZWN0QmFzZSB7XG4gIHN0YXRpYyBjb21tYW5kID0gZmFsc2VcbiAgYWNjZXB0UHJlc2V0T2NjdXJyZW5jZSA9IGZhbHNlXG4gIGFjY2VwdFBlcnNpc3RlbnRTZWxlY3Rpb24gPSBmYWxzZVxufVxuXG4vLyBQZXJzaXN0ZW50IFNlbGVjdGlvblxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PVxuY2xhc3MgQ3JlYXRlUGVyc2lzdGVudFNlbGVjdGlvbiBleHRlbmRzIE9wZXJhdG9yIHtcbiAgZmxhc2hUYXJnZXQgPSBmYWxzZVxuICBzdGF5QXRTYW1lUG9zaXRpb24gPSB0cnVlXG4gIGFjY2VwdFByZXNldE9jY3VycmVuY2UgPSBmYWxzZVxuICBhY2NlcHRQZXJzaXN0ZW50U2VsZWN0aW9uID0gZmFsc2VcblxuICBtdXRhdGVTZWxlY3Rpb24oc2VsZWN0aW9uKSB7XG4gICAgdGhpcy5wZXJzaXN0ZW50U2VsZWN0aW9uLm1hcmtCdWZmZXJSYW5nZShzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKSlcbiAgfVxufVxuXG5jbGFzcyBUb2dnbGVQZXJzaXN0ZW50U2VsZWN0aW9uIGV4dGVuZHMgQ3JlYXRlUGVyc2lzdGVudFNlbGVjdGlvbiB7XG4gIGluaXRpYWxpemUoKSB7XG4gICAgaWYgKHRoaXMubW9kZSA9PT0gXCJub3JtYWxcIikge1xuICAgICAgY29uc3QgcG9pbnQgPSB0aGlzLmVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpXG4gICAgICBjb25zdCBtYXJrZXIgPSB0aGlzLnBlcnNpc3RlbnRTZWxlY3Rpb24uZ2V0TWFya2VyQXRQb2ludChwb2ludClcbiAgICAgIGlmIChtYXJrZXIpIHRoaXMudGFyZ2V0ID0gXCJFbXB0eVwiXG4gICAgfVxuICAgIHN1cGVyLmluaXRpYWxpemUoKVxuICB9XG5cbiAgbXV0YXRlU2VsZWN0aW9uKHNlbGVjdGlvbikge1xuICAgIGNvbnN0IHBvaW50ID0gdGhpcy5nZXRDdXJzb3JQb3NpdGlvbkZvclNlbGVjdGlvbihzZWxlY3Rpb24pXG4gICAgY29uc3QgbWFya2VyID0gdGhpcy5wZXJzaXN0ZW50U2VsZWN0aW9uLmdldE1hcmtlckF0UG9pbnQocG9pbnQpXG4gICAgaWYgKG1hcmtlcikge1xuICAgICAgbWFya2VyLmRlc3Ryb3koKVxuICAgIH0gZWxzZSB7XG4gICAgICBzdXBlci5tdXRhdGVTZWxlY3Rpb24oc2VsZWN0aW9uKVxuICAgIH1cbiAgfVxufVxuXG4vLyBQcmVzZXQgT2NjdXJyZW5jZVxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PVxuY2xhc3MgVG9nZ2xlUHJlc2V0T2NjdXJyZW5jZSBleHRlbmRzIE9wZXJhdG9yIHtcbiAgdGFyZ2V0ID0gXCJFbXB0eVwiXG4gIGZsYXNoVGFyZ2V0ID0gZmFsc2VcbiAgYWNjZXB0UHJlc2V0T2NjdXJyZW5jZSA9IGZhbHNlXG4gIGFjY2VwdFBlcnNpc3RlbnRTZWxlY3Rpb24gPSBmYWxzZVxuICBvY2N1cnJlbmNlVHlwZSA9IFwiYmFzZVwiXG5cbiAgZXhlY3V0ZSgpIHtcbiAgICBjb25zdCBtYXJrZXIgPSB0aGlzLm9jY3VycmVuY2VNYW5hZ2VyLmdldE1hcmtlckF0UG9pbnQodGhpcy5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpKVxuICAgIGlmIChtYXJrZXIpIHtcbiAgICAgIHRoaXMub2NjdXJyZW5jZU1hbmFnZXIuZGVzdHJveU1hcmtlcnMoW21hcmtlcl0pXG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGlzTmFycm93ZWQgPSB0aGlzLnZpbVN0YXRlLmlzTmFycm93ZWQoKVxuXG4gICAgICBsZXQgcmVnZXhcbiAgICAgIGlmICh0aGlzLm1vZGUgPT09IFwidmlzdWFsXCIgJiYgIWlzTmFycm93ZWQpIHtcbiAgICAgICAgdGhpcy5vY2N1cnJlbmNlVHlwZSA9IFwiYmFzZVwiXG4gICAgICAgIHJlZ2V4ID0gbmV3IFJlZ0V4cChfLmVzY2FwZVJlZ0V4cCh0aGlzLmVkaXRvci5nZXRTZWxlY3RlZFRleHQoKSksIFwiZ1wiKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVnZXggPSB0aGlzLmdldFBhdHRlcm5Gb3JPY2N1cnJlbmNlVHlwZSh0aGlzLm9jY3VycmVuY2VUeXBlKVxuICAgICAgfVxuXG4gICAgICB0aGlzLm9jY3VycmVuY2VNYW5hZ2VyLmFkZFBhdHRlcm4ocmVnZXgsIHtvY2N1cnJlbmNlVHlwZTogdGhpcy5vY2N1cnJlbmNlVHlwZX0pXG4gICAgICB0aGlzLm9jY3VycmVuY2VNYW5hZ2VyLnNhdmVMYXN0UGF0dGVybih0aGlzLm9jY3VycmVuY2VUeXBlKVxuXG4gICAgICBpZiAoIWlzTmFycm93ZWQpIHRoaXMuYWN0aXZhdGVNb2RlKFwibm9ybWFsXCIpXG4gICAgfVxuICB9XG59XG5cbmNsYXNzIFRvZ2dsZVByZXNldFN1YndvcmRPY2N1cnJlbmNlIGV4dGVuZHMgVG9nZ2xlUHJlc2V0T2NjdXJyZW5jZSB7XG4gIG9jY3VycmVuY2VUeXBlID0gXCJzdWJ3b3JkXCJcbn1cblxuLy8gV2FudCB0byByZW5hbWUgUmVzdG9yZU9jY3VycmVuY2VNYXJrZXJcbmNsYXNzIEFkZFByZXNldE9jY3VycmVuY2VGcm9tTGFzdE9jY3VycmVuY2VQYXR0ZXJuIGV4dGVuZHMgVG9nZ2xlUHJlc2V0T2NjdXJyZW5jZSB7XG4gIGV4ZWN1dGUoKSB7XG4gICAgdGhpcy5vY2N1cnJlbmNlTWFuYWdlci5yZXNldFBhdHRlcm5zKClcbiAgICBjb25zdCByZWdleCA9IHRoaXMuZ2xvYmFsU3RhdGUuZ2V0KFwibGFzdE9jY3VycmVuY2VQYXR0ZXJuXCIpXG4gICAgaWYgKHJlZ2V4KSB7XG4gICAgICBjb25zdCBvY2N1cnJlbmNlVHlwZSA9IHRoaXMuZ2xvYmFsU3RhdGUuZ2V0KFwibGFzdE9jY3VycmVuY2VUeXBlXCIpXG4gICAgICB0aGlzLm9jY3VycmVuY2VNYW5hZ2VyLmFkZFBhdHRlcm4ocmVnZXgsIHtvY2N1cnJlbmNlVHlwZX0pXG4gICAgICB0aGlzLmFjdGl2YXRlTW9kZShcIm5vcm1hbFwiKVxuICAgIH1cbiAgfVxufVxuXG4vLyBEZWxldGVcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5jbGFzcyBEZWxldGUgZXh0ZW5kcyBPcGVyYXRvciB7XG4gIHRyYWNrQ2hhbmdlID0gdHJ1ZVxuICBmbGFzaENoZWNrcG9pbnQgPSBcImRpZC1zZWxlY3Qtb2NjdXJyZW5jZVwiXG4gIGZsYXNoVHlwZUZvck9jY3VycmVuY2UgPSBcIm9wZXJhdG9yLXJlbW92ZS1vY2N1cnJlbmNlXCJcbiAgc3RheU9wdGlvbk5hbWUgPSBcInN0YXlPbkRlbGV0ZVwiXG4gIHNldFRvRmlyc3RDaGFyYWN0ZXJPbkxpbmV3aXNlID0gdHJ1ZVxuXG4gIGV4ZWN1dGUoKSB7XG4gICAgdGhpcy5vbkRpZFNlbGVjdFRhcmdldCgoKSA9PiB7XG4gICAgICBpZiAodGhpcy5vY2N1cnJlbmNlU2VsZWN0ZWQgJiYgdGhpcy5vY2N1cnJlbmNlV2lzZSA9PT0gXCJsaW5ld2lzZVwiKSB7XG4gICAgICAgIHRoaXMuZmxhc2hUYXJnZXQgPSBmYWxzZVxuICAgICAgfVxuICAgIH0pXG5cbiAgICBpZiAodGhpcy50YXJnZXQud2lzZSA9PT0gXCJibG9ja3dpc2VcIikge1xuICAgICAgdGhpcy5yZXN0b3JlUG9zaXRpb25zID0gZmFsc2VcbiAgICB9XG4gICAgc3VwZXIuZXhlY3V0ZSgpXG4gIH1cblxuICBtdXRhdGVTZWxlY3Rpb24oc2VsZWN0aW9uKSB7XG4gICAgdGhpcy5zZXRUZXh0VG9SZWdpc3RlckZvclNlbGVjdGlvbihzZWxlY3Rpb24pXG4gICAgc2VsZWN0aW9uLmRlbGV0ZVNlbGVjdGVkVGV4dCgpXG4gIH1cbn1cblxuY2xhc3MgRGVsZXRlUmlnaHQgZXh0ZW5kcyBEZWxldGUge1xuICB0YXJnZXQgPSBcIk1vdmVSaWdodFwiXG59XG5cbmNsYXNzIERlbGV0ZUxlZnQgZXh0ZW5kcyBEZWxldGUge1xuICB0YXJnZXQgPSBcIk1vdmVMZWZ0XCJcbn1cblxuY2xhc3MgRGVsZXRlVG9MYXN0Q2hhcmFjdGVyT2ZMaW5lIGV4dGVuZHMgRGVsZXRlIHtcbiAgdGFyZ2V0ID0gXCJNb3ZlVG9MYXN0Q2hhcmFjdGVyT2ZMaW5lXCJcblxuICBleGVjdXRlKCkge1xuICAgIHRoaXMub25EaWRTZWxlY3RUYXJnZXQoKCkgPT4ge1xuICAgICAgaWYgKHRoaXMudGFyZ2V0Lndpc2UgPT09IFwiYmxvY2t3aXNlXCIpIHtcbiAgICAgICAgZm9yIChjb25zdCBibG9ja3dpc2VTZWxlY3Rpb24gb2YgdGhpcy5nZXRCbG9ja3dpc2VTZWxlY3Rpb25zKCkpIHtcbiAgICAgICAgICBibG9ja3dpc2VTZWxlY3Rpb24uZXh0ZW5kTWVtYmVyU2VsZWN0aW9uc1RvRW5kT2ZMaW5lKClcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gICAgc3VwZXIuZXhlY3V0ZSgpXG4gIH1cbn1cblxuY2xhc3MgRGVsZXRlTGluZSBleHRlbmRzIERlbGV0ZSB7XG4gIHdpc2UgPSBcImxpbmV3aXNlXCJcbiAgdGFyZ2V0ID0gXCJNb3ZlVG9SZWxhdGl2ZUxpbmVcIlxuICBmbGFzaFRhcmdldCA9IGZhbHNlXG59XG5cbi8vIFlhbmtcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIFlhbmsgZXh0ZW5kcyBPcGVyYXRvciB7XG4gIHRyYWNrQ2hhbmdlID0gdHJ1ZVxuICBzdGF5T3B0aW9uTmFtZSA9IFwic3RheU9uWWFua1wiXG5cbiAgbXV0YXRlU2VsZWN0aW9uKHNlbGVjdGlvbikge1xuICAgIHRoaXMuc2V0VGV4dFRvUmVnaXN0ZXJGb3JTZWxlY3Rpb24oc2VsZWN0aW9uKVxuICB9XG59XG5cbmNsYXNzIFlhbmtMaW5lIGV4dGVuZHMgWWFuayB7XG4gIHdpc2UgPSBcImxpbmV3aXNlXCJcbiAgdGFyZ2V0ID0gXCJNb3ZlVG9SZWxhdGl2ZUxpbmVcIlxufVxuXG5jbGFzcyBZYW5rVG9MYXN0Q2hhcmFjdGVyT2ZMaW5lIGV4dGVuZHMgWWFuayB7XG4gIHRhcmdldCA9IFwiTW92ZVRvTGFzdENoYXJhY3Rlck9mTGluZVwiXG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFtjdHJsLWFdXG5jbGFzcyBJbmNyZWFzZSBleHRlbmRzIE9wZXJhdG9yIHtcbiAgdGFyZ2V0ID0gXCJFbXB0eVwiIC8vIGN0cmwtYSBpbiBub3JtYWwtbW9kZSBmaW5kIHRhcmdldCBudW1iZXIgaW4gY3VycmVudCBsaW5lIG1hbnVhbGx5XG4gIGZsYXNoVGFyZ2V0ID0gZmFsc2UgLy8gZG8gbWFudWFsbHlcbiAgcmVzdG9yZVBvc2l0aW9ucyA9IGZhbHNlIC8vIGRvIG1hbnVhbGx5XG4gIHN0ZXAgPSAxXG5cbiAgZXhlY3V0ZSgpIHtcbiAgICB0aGlzLm5ld1JhbmdlcyA9IFtdXG4gICAgaWYgKCF0aGlzLnJlZ2V4KSB0aGlzLnJlZ2V4ID0gbmV3IFJlZ0V4cChgJHt0aGlzLmdldENvbmZpZyhcIm51bWJlclJlZ2V4XCIpfWAsIFwiZ1wiKVxuXG4gICAgc3VwZXIuZXhlY3V0ZSgpXG5cbiAgICBpZiAodGhpcy5uZXdSYW5nZXMubGVuZ3RoKSB7XG4gICAgICBpZiAodGhpcy5nZXRDb25maWcoXCJmbGFzaE9uT3BlcmF0ZVwiKSAmJiAhdGhpcy5nZXRDb25maWcoXCJmbGFzaE9uT3BlcmF0ZUJsYWNrbGlzdFwiKS5pbmNsdWRlcyh0aGlzLm5hbWUpKSB7XG4gICAgICAgIHRoaXMudmltU3RhdGUuZmxhc2godGhpcy5uZXdSYW5nZXMsIHt0eXBlOiB0aGlzLmZsYXNoVHlwZUZvck9jY3VycmVuY2V9KVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJlcGxhY2VOdW1iZXJJbkJ1ZmZlclJhbmdlKHNjYW5SYW5nZSwgZm4pIHtcbiAgICBjb25zdCBuZXdSYW5nZXMgPSBbXVxuICAgIHRoaXMuc2NhbkVkaXRvcihcImZvcndhcmRcIiwgdGhpcy5yZWdleCwge3NjYW5SYW5nZX0sIGV2ZW50ID0+IHtcbiAgICAgIGlmIChmbikge1xuICAgICAgICBpZiAoZm4oZXZlbnQpKSBldmVudC5zdG9wKClcbiAgICAgICAgZWxzZSByZXR1cm5cbiAgICAgIH1cbiAgICAgIGNvbnN0IG5leHROdW1iZXIgPSB0aGlzLmdldE5leHROdW1iZXIoZXZlbnQubWF0Y2hUZXh0KVxuICAgICAgbmV3UmFuZ2VzLnB1c2goZXZlbnQucmVwbGFjZShTdHJpbmcobmV4dE51bWJlcikpKVxuICAgIH0pXG4gICAgcmV0dXJuIG5ld1Jhbmdlc1xuICB9XG5cbiAgbXV0YXRlU2VsZWN0aW9uKHNlbGVjdGlvbikge1xuICAgIGNvbnN0IHtjdXJzb3J9ID0gc2VsZWN0aW9uXG4gICAgaWYgKHRoaXMudGFyZ2V0Lm5hbWUgPT09IFwiRW1wdHlcIikge1xuICAgICAgLy8gY3RybC1hLCBjdHJsLXggaW4gYG5vcm1hbC1tb2RlYFxuICAgICAgY29uc3QgY3Vyc29yUG9zaXRpb24gPSBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuICAgICAgY29uc3Qgc2NhblJhbmdlID0gdGhpcy5lZGl0b3IuYnVmZmVyUmFuZ2VGb3JCdWZmZXJSb3coY3Vyc29yUG9zaXRpb24ucm93KVxuICAgICAgY29uc3QgbmV3UmFuZ2VzID0gdGhpcy5yZXBsYWNlTnVtYmVySW5CdWZmZXJSYW5nZShzY2FuUmFuZ2UsIGV2ZW50ID0+XG4gICAgICAgIGV2ZW50LnJhbmdlLmVuZC5pc0dyZWF0ZXJUaGFuKGN1cnNvclBvc2l0aW9uKVxuICAgICAgKVxuICAgICAgY29uc3QgcG9pbnQgPSAobmV3UmFuZ2VzLmxlbmd0aCAmJiBuZXdSYW5nZXNbMF0uZW5kLnRyYW5zbGF0ZShbMCwgLTFdKSkgfHwgY3Vyc29yUG9zaXRpb25cbiAgICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihwb2ludClcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3Qgc2NhblJhbmdlID0gc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKClcbiAgICAgIHRoaXMubmV3UmFuZ2VzLnB1c2goLi4udGhpcy5yZXBsYWNlTnVtYmVySW5CdWZmZXJSYW5nZShzY2FuUmFuZ2UpKVxuICAgICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHNjYW5SYW5nZS5zdGFydClcbiAgICB9XG4gIH1cblxuICBnZXROZXh0TnVtYmVyKG51bWJlclN0cmluZykge1xuICAgIHJldHVybiBOdW1iZXIucGFyc2VJbnQobnVtYmVyU3RyaW5nLCAxMCkgKyB0aGlzLnN0ZXAgKiB0aGlzLmdldENvdW50KClcbiAgfVxufVxuXG4vLyBbY3RybC14XVxuY2xhc3MgRGVjcmVhc2UgZXh0ZW5kcyBJbmNyZWFzZSB7XG4gIHN0ZXAgPSAtMVxufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBbZyBjdHJsLWFdXG5jbGFzcyBJbmNyZW1lbnROdW1iZXIgZXh0ZW5kcyBJbmNyZWFzZSB7XG4gIGJhc2VOdW1iZXIgPSBudWxsXG4gIHRhcmdldCA9IG51bGxcblxuICBnZXROZXh0TnVtYmVyKG51bWJlclN0cmluZykge1xuICAgIGlmICh0aGlzLmJhc2VOdW1iZXIgIT0gbnVsbCkge1xuICAgICAgdGhpcy5iYXNlTnVtYmVyICs9IHRoaXMuc3RlcCAqIHRoaXMuZ2V0Q291bnQoKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmJhc2VOdW1iZXIgPSBOdW1iZXIucGFyc2VJbnQobnVtYmVyU3RyaW5nLCAxMClcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuYmFzZU51bWJlclxuICB9XG59XG5cbi8vIFtnIGN0cmwteF1cbmNsYXNzIERlY3JlbWVudE51bWJlciBleHRlbmRzIEluY3JlbWVudE51bWJlciB7XG4gIHN0ZXAgPSAtMVxufVxuXG4vLyBQdXRcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEN1cnNvciBwbGFjZW1lbnQ6XG4vLyAtIHBsYWNlIGF0IGVuZCBvZiBtdXRhdGlvbjogcGFzdGUgbm9uLW11bHRpbGluZSBjaGFyYWN0ZXJ3aXNlIHRleHRcbi8vIC0gcGxhY2UgYXQgc3RhcnQgb2YgbXV0YXRpb246IG5vbi1tdWx0aWxpbmUgY2hhcmFjdGVyd2lzZSB0ZXh0KGNoYXJhY3Rlcndpc2UsIGxpbmV3aXNlKVxuY2xhc3MgUHV0QmVmb3JlIGV4dGVuZHMgT3BlcmF0b3Ige1xuICBsb2NhdGlvbiA9IFwiYmVmb3JlXCJcbiAgdGFyZ2V0ID0gXCJFbXB0eVwiXG4gIGZsYXNoVHlwZSA9IFwib3BlcmF0b3ItbG9uZ1wiXG4gIHJlc3RvcmVQb3NpdGlvbnMgPSBmYWxzZSAvLyBtYW5hZ2UgbWFudWFsbHlcbiAgZmxhc2hUYXJnZXQgPSBmYWxzZSAvLyBtYW5hZ2UgbWFudWFsbHlcbiAgdHJhY2tDaGFuZ2UgPSBmYWxzZSAvLyBtYW5hZ2UgbWFudWFsbHlcblxuICBpbml0aWFsaXplKCkge1xuICAgIHRoaXMudmltU3RhdGUuc2VxdWVudGlhbFBhc3RlTWFuYWdlci5vbkluaXRpYWxpemUodGhpcylcbiAgICBzdXBlci5pbml0aWFsaXplKClcbiAgfVxuXG4gIGV4ZWN1dGUoKSB7XG4gICAgdGhpcy5tdXRhdGlvbnNCeVNlbGVjdGlvbiA9IG5ldyBNYXAoKVxuICAgIHRoaXMuc2VxdWVudGlhbFBhc3RlID0gdGhpcy52aW1TdGF0ZS5zZXF1ZW50aWFsUGFzdGVNYW5hZ2VyLm9uRXhlY3V0ZSh0aGlzKVxuXG4gICAgdGhpcy5vbkRpZEZpbmlzaE11dGF0aW9uKCgpID0+IHtcbiAgICAgIGlmICghdGhpcy5jYW5jZWxsZWQpIHRoaXMuYWRqdXN0Q3Vyc29yUG9zaXRpb24oKVxuICAgIH0pXG5cbiAgICBzdXBlci5leGVjdXRlKClcblxuICAgIGlmICh0aGlzLmNhbmNlbGxlZCkgcmV0dXJuXG5cbiAgICB0aGlzLm9uRGlkRmluaXNoT3BlcmF0aW9uKCgpID0+IHtcbiAgICAgIC8vIFRyYWNrQ2hhbmdlXG4gICAgICBjb25zdCBuZXdSYW5nZSA9IHRoaXMubXV0YXRpb25zQnlTZWxlY3Rpb24uZ2V0KHRoaXMuZWRpdG9yLmdldExhc3RTZWxlY3Rpb24oKSlcbiAgICAgIGlmIChuZXdSYW5nZSkgdGhpcy5zZXRNYXJrRm9yQ2hhbmdlKG5ld1JhbmdlKVxuXG4gICAgICAvLyBGbGFzaFxuICAgICAgaWYgKHRoaXMuZ2V0Q29uZmlnKFwiZmxhc2hPbk9wZXJhdGVcIikgJiYgIXRoaXMuZ2V0Q29uZmlnKFwiZmxhc2hPbk9wZXJhdGVCbGFja2xpc3RcIikuaW5jbHVkZXModGhpcy5uYW1lKSkge1xuICAgICAgICBjb25zdCByYW5nZXMgPSB0aGlzLmVkaXRvci5nZXRTZWxlY3Rpb25zKCkubWFwKHNlbGVjdGlvbiA9PiB0aGlzLm11dGF0aW9uc0J5U2VsZWN0aW9uLmdldChzZWxlY3Rpb24pKVxuICAgICAgICB0aGlzLnZpbVN0YXRlLmZsYXNoKHJhbmdlcywge3R5cGU6IHRoaXMuZ2V0Rmxhc2hUeXBlKCl9KVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICBhZGp1c3RDdXJzb3JQb3NpdGlvbigpIHtcbiAgICBmb3IgKGNvbnN0IHNlbGVjdGlvbiBvZiB0aGlzLmVkaXRvci5nZXRTZWxlY3Rpb25zKCkpIHtcbiAgICAgIGlmICghdGhpcy5tdXRhdGlvbnNCeVNlbGVjdGlvbi5oYXMoc2VsZWN0aW9uKSkgY29udGludWVcblxuICAgICAgY29uc3Qge2N1cnNvcn0gPSBzZWxlY3Rpb25cbiAgICAgIGNvbnN0IG5ld1JhbmdlID0gdGhpcy5tdXRhdGlvbnNCeVNlbGVjdGlvbi5nZXQoc2VsZWN0aW9uKVxuICAgICAgaWYgKHRoaXMubGluZXdpc2VQYXN0ZSkge1xuICAgICAgICB0aGlzLnV0aWxzLm1vdmVDdXJzb3JUb0ZpcnN0Q2hhcmFjdGVyQXRSb3coY3Vyc29yLCBuZXdSYW5nZS5zdGFydC5yb3cpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAobmV3UmFuZ2UuaXNTaW5nbGVMaW5lKCkpIHtcbiAgICAgICAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24obmV3UmFuZ2UuZW5kLnRyYW5zbGF0ZShbMCwgLTFdKSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24obmV3UmFuZ2Uuc3RhcnQpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBtdXRhdGVTZWxlY3Rpb24oc2VsZWN0aW9uKSB7XG4gICAgY29uc3QgdmFsdWUgPSB0aGlzLnZpbVN0YXRlLnJlZ2lzdGVyLmdldChudWxsLCBzZWxlY3Rpb24sIHRoaXMuc2VxdWVudGlhbFBhc3RlKVxuICAgIGlmICghdmFsdWUudGV4dCkge1xuICAgICAgdGhpcy5jYW5jZWxsZWQgPSB0cnVlXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBjb25zdCB0ZXh0VG9QYXN0ZSA9IF8ubXVsdGlwbHlTdHJpbmcodmFsdWUudGV4dCwgdGhpcy5nZXRDb3VudCgpKVxuICAgIHRoaXMubGluZXdpc2VQYXN0ZSA9IHZhbHVlLnR5cGUgPT09IFwibGluZXdpc2VcIiB8fCB0aGlzLmlzTW9kZShcInZpc3VhbFwiLCBcImxpbmV3aXNlXCIpXG4gICAgY29uc3QgbmV3UmFuZ2UgPSB0aGlzLnBhc3RlKHNlbGVjdGlvbiwgdGV4dFRvUGFzdGUsIHtsaW5ld2lzZVBhc3RlOiB0aGlzLmxpbmV3aXNlUGFzdGV9KVxuICAgIHRoaXMubXV0YXRpb25zQnlTZWxlY3Rpb24uc2V0KHNlbGVjdGlvbiwgbmV3UmFuZ2UpXG4gICAgdGhpcy52aW1TdGF0ZS5zZXF1ZW50aWFsUGFzdGVNYW5hZ2VyLnNhdmVQYXN0ZWRSYW5nZUZvclNlbGVjdGlvbihzZWxlY3Rpb24sIG5ld1JhbmdlKVxuICB9XG5cbiAgLy8gUmV0dXJuIHBhc3RlZCByYW5nZVxuICBwYXN0ZShzZWxlY3Rpb24sIHRleHQsIHtsaW5ld2lzZVBhc3RlfSkge1xuICAgIGlmICh0aGlzLnNlcXVlbnRpYWxQYXN0ZSkge1xuICAgICAgcmV0dXJuIHRoaXMucGFzdGVDaGFyYWN0ZXJ3aXNlKHNlbGVjdGlvbiwgdGV4dClcbiAgICB9IGVsc2UgaWYgKGxpbmV3aXNlUGFzdGUpIHtcbiAgICAgIHJldHVybiB0aGlzLnBhc3RlTGluZXdpc2Uoc2VsZWN0aW9uLCB0ZXh0KVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5wYXN0ZUNoYXJhY3Rlcndpc2Uoc2VsZWN0aW9uLCB0ZXh0KVxuICAgIH1cbiAgfVxuXG4gIHBhc3RlQ2hhcmFjdGVyd2lzZShzZWxlY3Rpb24sIHRleHQpIHtcbiAgICBjb25zdCB7Y3Vyc29yfSA9IHNlbGVjdGlvblxuICAgIGlmIChzZWxlY3Rpb24uaXNFbXB0eSgpICYmIHRoaXMubG9jYXRpb24gPT09IFwiYWZ0ZXJcIiAmJiAhdGhpcy5pc0VtcHR5Um93KGN1cnNvci5nZXRCdWZmZXJSb3coKSkpIHtcbiAgICAgIGN1cnNvci5tb3ZlUmlnaHQoKVxuICAgIH1cbiAgICByZXR1cm4gc2VsZWN0aW9uLmluc2VydFRleHQodGV4dClcbiAgfVxuXG4gIC8vIFJldHVybiBuZXdSYW5nZVxuICBwYXN0ZUxpbmV3aXNlKHNlbGVjdGlvbiwgdGV4dCkge1xuICAgIGNvbnN0IHtjdXJzb3J9ID0gc2VsZWN0aW9uXG4gICAgY29uc3QgY3Vyc29yUm93ID0gY3Vyc29yLmdldEJ1ZmZlclJvdygpXG4gICAgaWYgKCF0ZXh0LmVuZHNXaXRoKFwiXFxuXCIpKSB7XG4gICAgICB0ZXh0ICs9IFwiXFxuXCJcbiAgICB9XG4gICAgaWYgKHNlbGVjdGlvbi5pc0VtcHR5KCkpIHtcbiAgICAgIGlmICh0aGlzLmxvY2F0aW9uID09PSBcImJlZm9yZVwiKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnV0aWxzLmluc2VydFRleHRBdEJ1ZmZlclBvc2l0aW9uKHRoaXMuZWRpdG9yLCBbY3Vyc29yUm93LCAwXSwgdGV4dClcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5sb2NhdGlvbiA9PT0gXCJhZnRlclwiKSB7XG4gICAgICAgIGNvbnN0IHRhcmdldFJvdyA9IHRoaXMuZ2V0Rm9sZEVuZFJvd0ZvclJvdyhjdXJzb3JSb3cpXG4gICAgICAgIHRoaXMudXRpbHMuZW5zdXJlRW5kc1dpdGhOZXdMaW5lRm9yQnVmZmVyUm93KHRoaXMuZWRpdG9yLCB0YXJnZXRSb3cpXG4gICAgICAgIHJldHVybiB0aGlzLnV0aWxzLmluc2VydFRleHRBdEJ1ZmZlclBvc2l0aW9uKHRoaXMuZWRpdG9yLCBbdGFyZ2V0Um93ICsgMSwgMF0sIHRleHQpXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICghdGhpcy5pc01vZGUoXCJ2aXN1YWxcIiwgXCJsaW5ld2lzZVwiKSkge1xuICAgICAgICBzZWxlY3Rpb24uaW5zZXJ0VGV4dChcIlxcblwiKVxuICAgICAgfVxuICAgICAgcmV0dXJuIHNlbGVjdGlvbi5pbnNlcnRUZXh0KHRleHQpXG4gICAgfVxuICB9XG59XG5cbmNsYXNzIFB1dEFmdGVyIGV4dGVuZHMgUHV0QmVmb3JlIHtcbiAgbG9jYXRpb24gPSBcImFmdGVyXCJcbn1cblxuY2xhc3MgUHV0QmVmb3JlV2l0aEF1dG9JbmRlbnQgZXh0ZW5kcyBQdXRCZWZvcmUge1xuICBwYXN0ZUxpbmV3aXNlKHNlbGVjdGlvbiwgdGV4dCkge1xuICAgIGNvbnN0IG5ld1JhbmdlID0gc3VwZXIucGFzdGVMaW5ld2lzZShzZWxlY3Rpb24sIHRleHQpXG4gICAgdGhpcy51dGlscy5hZGp1c3RJbmRlbnRXaXRoS2VlcGluZ0xheW91dCh0aGlzLmVkaXRvciwgbmV3UmFuZ2UpXG4gICAgcmV0dXJuIG5ld1JhbmdlXG4gIH1cbn1cblxuY2xhc3MgUHV0QWZ0ZXJXaXRoQXV0b0luZGVudCBleHRlbmRzIFB1dEJlZm9yZVdpdGhBdXRvSW5kZW50IHtcbiAgbG9jYXRpb24gPSBcImFmdGVyXCJcbn1cblxuY2xhc3MgQWRkQmxhbmtMaW5lQmVsb3cgZXh0ZW5kcyBPcGVyYXRvciB7XG4gIGZsYXNoVGFyZ2V0ID0gZmFsc2VcbiAgdGFyZ2V0ID0gXCJFbXB0eVwiXG4gIHN0YXlBdFNhbWVQb3NpdGlvbiA9IHRydWVcbiAgc3RheUJ5TWFya2VyID0gdHJ1ZVxuICB3aGVyZSA9IFwiYmVsb3dcIlxuXG4gIG11dGF0ZVNlbGVjdGlvbihzZWxlY3Rpb24pIHtcbiAgICBjb25zdCBwb2ludCA9IHNlbGVjdGlvbi5nZXRIZWFkQnVmZmVyUG9zaXRpb24oKVxuICAgIGlmICh0aGlzLndoZXJlID09PSBcImJlbG93XCIpIHBvaW50LnJvdysrXG4gICAgcG9pbnQuY29sdW1uID0gMFxuICAgIHRoaXMuZWRpdG9yLnNldFRleHRJbkJ1ZmZlclJhbmdlKFtwb2ludCwgcG9pbnRdLCBcIlxcblwiLnJlcGVhdCh0aGlzLmdldENvdW50KCkpKVxuICB9XG59XG5cbmNsYXNzIEFkZEJsYW5rTGluZUFib3ZlIGV4dGVuZHMgQWRkQmxhbmtMaW5lQmVsb3cge1xuICB3aGVyZSA9IFwiYWJvdmVcIlxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgT3BlcmF0b3IsXG4gIFNlbGVjdEJhc2UsXG4gIFNlbGVjdCxcbiAgU2VsZWN0TGF0ZXN0Q2hhbmdlLFxuICBTZWxlY3RQcmV2aW91c1NlbGVjdGlvbixcbiAgU2VsZWN0UGVyc2lzdGVudFNlbGVjdGlvbixcbiAgU2VsZWN0T2NjdXJyZW5jZSxcbiAgVmlzdWFsTW9kZVNlbGVjdCxcbiAgQ3JlYXRlUGVyc2lzdGVudFNlbGVjdGlvbixcbiAgVG9nZ2xlUGVyc2lzdGVudFNlbGVjdGlvbixcbiAgVG9nZ2xlUHJlc2V0T2NjdXJyZW5jZSxcbiAgVG9nZ2xlUHJlc2V0U3Vid29yZE9jY3VycmVuY2UsXG4gIEFkZFByZXNldE9jY3VycmVuY2VGcm9tTGFzdE9jY3VycmVuY2VQYXR0ZXJuLFxuICBEZWxldGUsXG4gIERlbGV0ZVJpZ2h0LFxuICBEZWxldGVMZWZ0LFxuICBEZWxldGVUb0xhc3RDaGFyYWN0ZXJPZkxpbmUsXG4gIERlbGV0ZUxpbmUsXG4gIFlhbmssXG4gIFlhbmtMaW5lLFxuICBZYW5rVG9MYXN0Q2hhcmFjdGVyT2ZMaW5lLFxuICBJbmNyZWFzZSxcbiAgRGVjcmVhc2UsXG4gIEluY3JlbWVudE51bWJlcixcbiAgRGVjcmVtZW50TnVtYmVyLFxuICBQdXRCZWZvcmUsXG4gIFB1dEFmdGVyLFxuICBQdXRCZWZvcmVXaXRoQXV0b0luZGVudCxcbiAgUHV0QWZ0ZXJXaXRoQXV0b0luZGVudCxcbiAgQWRkQmxhbmtMaW5lQmVsb3csXG4gIEFkZEJsYW5rTGluZUFib3ZlLFxufVxuIl19