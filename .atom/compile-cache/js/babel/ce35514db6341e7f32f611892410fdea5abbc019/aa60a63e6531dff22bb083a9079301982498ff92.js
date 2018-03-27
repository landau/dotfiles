"use babel";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _ = require("underscore-plus");

var _require = require("./utils");

var isEmptyRow = _require.isEmptyRow;
var getWordPatternAtBufferPosition = _require.getWordPatternAtBufferPosition;
var getSubwordPatternAtBufferPosition = _require.getSubwordPatternAtBufferPosition;
var insertTextAtBufferPosition = _require.insertTextAtBufferPosition;
var setBufferRow = _require.setBufferRow;
var moveCursorToFirstCharacterAtRow = _require.moveCursorToFirstCharacterAtRow;
var ensureEndsWithNewLineForBufferRow = _require.ensureEndsWithNewLineForBufferRow;
var adjustIndentWithKeepingLayout = _require.adjustIndentWithKeepingLayout;
var isSingleLineText = _require.isSingleLineText;

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
      var _this3 = this;

      this.subscribeResetOccurrencePatternIfNeeded();
      this.onDidSetOperatorModifier(function (options) {
        return _this3.setModifier(options);
      });

      // When preset-occurrence was exists, operate on occurrence-wise
      if (this.acceptPresetOccurrence && this.occurrenceManager.hasMarkers()) {
        this.occurrence = true;
      }

      // [FIXME] ORDER-MATTER
      // To pick cursor-word to find occurrence base pattern.
      // This has to be done BEFORE converting persistent-selection into real-selection.
      // Since when persistent-selection is actuall selected, it change cursor position.
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

      return _get(Object.getPrototypeOf(Operator.prototype), "initialize", this).call(this);
    }
  }, {
    key: "subscribeResetOccurrencePatternIfNeeded",
    value: function subscribeResetOccurrencePatternIfNeeded() {
      var _this4 = this;

      // [CAUTION]
      // This method has to be called in PROPER timing.
      // If occurrence is true but no preset-occurrence
      // Treat that `occurrence` is BOUNDED to operator itself, so cleanp at finished.
      if (this.occurrence && !this.occurrenceManager.hasMarkers()) {
        this.onDidResetOperationStack(function () {
          return _this4.occurrenceManager.resetPatterns();
        });
      }
    }
  }, {
    key: "setModifier",
    value: function setModifier(_ref) {
      var _this5 = this;

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
          return _this5.occurrenceManager.resetPatterns();
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
        for (var $selection of this.swrap.getSelections(this.editor)) {
          if (!$selection.hasProperties()) $selection.saveProperties();
        }

        return true;
      } else {
        return false;
      }
    }
  }, {
    key: "getPatternForOccurrenceType",
    value: function getPatternForOccurrenceType(occurrenceType) {
      if (occurrenceType === "base") {
        return getWordPatternAtBufferPosition(this.editor, this.getCursorBufferPosition());
      } else if (occurrenceType === "subword") {
        return getSubwordPatternAtBufferPosition(this.editor, this.getCursorBufferPosition());
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
      return this;
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
            if (!this.needSaveToNumberedRegister(this.target) && isSingleLineText(text)) {
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
      if (this.target && this.target.isMotion() && this.mode === "visual") {
        this.swrap.normalize(this.editor);
      }
    }
  }, {
    key: "startMutation",
    value: function startMutation(fn) {
      var _this6 = this;

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
          _this6.emitWillFinishMutation();
        });
      }

      this.emitDidFinishMutation();
    }

    // Main
  }, {
    key: "execute",
    value: function execute() {
      var _this7 = this;

      this.startMutation(function () {
        if (_this7.selectTarget()) {
          var selections = _this7.mutateSelectionOrderd ? _this7.editor.getSelectionsOrderedByBufferPosition() : _this7.editor.getSelections();

          for (var selection of selections) {
            _this7.mutateSelection(selection);
          }
          _this7.mutationManager.setCheckpoint("did-finish");
          _this7.restoreCursorPositionsIfNecessary();
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

      // NOTE
      // Since MoveToNextOccurrence, MoveToPreviousOccurrence motion move by
      //  occurrence-marker, occurrence-marker has to be created BEFORE `@target.execute()`
      // And when repeated, occurrence pattern is already cached at @patternForOccurrence
      if (this.repeated && this.occurrence && !this.occurrenceManager.hasMarkers()) {
        this.occurrenceManager.addPattern(this.patternForOccurrence, { occurrenceType: this.occurrenceType });
      }

      this.target.execute();

      this.mutationManager.setCheckpoint("did-select");
      if (this.occurrence) {
        // To repoeat(`.`) operation where multiple occurrence patterns was set.
        // Here we save patterns which represent unioned regex which @occurrenceManager knows.
        if (!this.patternForOccurrence) {
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
      var _this8 = this;

      this.startMutation(function () {
        return _this8.selectTarget();
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
      for (var $selection of this.swrap.getSelections(this.editor)) {
        if (!$selection.hasProperties()) $selection.saveProperties();
      }
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
      var marker = this.occurrenceManager.getMarkerAtPoint(this.editor.getCursorBufferPosition());
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
      var _this9 = this;

      this.onDidSelectTarget(function () {
        if (_this9.occurrenceSelected && _this9.occurrenceWise === "linewise") {
          _this9.flashTarget = false;
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
      var _this10 = this;

      this.onDidSelectTarget(function () {
        if (_this10.target.wise === "blockwise") {
          for (var blockwiseSelection of _this10.getBlockwiseSelections()) {
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
      var _this11 = this;

      var newRanges = [];
      this.scanForward(this.regex, { scanRange: scanRange }, function (event) {
        if (fn) {
          if (fn(event)) event.stop();else return;
        }
        var nextNumber = _this11.getNextNumber(event.matchText);
        newRanges.push(event.replace(String(nextNumber)));
      });
      return newRanges;
    }
  }, {
    key: "mutateSelection",
    value: function mutateSelection(selection) {
      var _this12 = this;

      var cursor = selection.cursor;

      if (this.target.is("Empty")) {
        (function () {
          // ctrl-a, ctrl-x in `normal-mode`
          var cursorPosition = cursor.getBufferPosition();
          var scanRange = _this12.editor.bufferRangeForBufferRow(cursorPosition.row);
          var newRanges = _this12.replaceNumberInBufferRange(scanRange, function (event) {
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
      return _get(Object.getPrototypeOf(PutBefore.prototype), "initialize", this).call(this);
    }
  }, {
    key: "execute",
    value: function execute() {
      var _this13 = this;

      this.mutationsBySelection = new Map();
      this.sequentialPaste = this.vimState.sequentialPasteManager.onExecute(this);

      this.onDidFinishMutation(function () {
        if (!_this13.cancelled) _this13.adjustCursorPosition();
      });

      _get(Object.getPrototypeOf(PutBefore.prototype), "execute", this).call(this);

      if (this.cancelled) return;

      this.onDidFinishOperation(function () {
        // TrackChange
        var newRange = _this13.mutationsBySelection.get(_this13.editor.getLastSelection());
        if (newRange) _this13.setMarkForChange(newRange);

        // Flash
        if (_this13.getConfig("flashOnOperate") && !_this13.getConfig("flashOnOperateBlacklist").includes(_this13.name)) {
          var ranges = _this13.editor.getSelections().map(function (selection) {
            return _this13.mutationsBySelection.get(selection);
          });
          _this13.vimState.flash(ranges, { type: _this13.getFlashType() });
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
          moveCursorToFirstCharacterAtRow(cursor, newRange.start.row);
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

      if (selection.isEmpty() && this.location === "after" && !isEmptyRow(this.editor, cursor.getBufferRow())) {
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
          return insertTextAtBufferPosition(this.editor, [cursorRow, 0], text);
        } else if (this.location === "after") {
          var targetRow = this.getFoldEndRowForRow(cursorRow);
          ensureEndsWithNewLineForBufferRow(this.editor, targetRow);
          return insertTextAtBufferPosition(this.editor, [targetRow + 1, 0], text);
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
      adjustIndentWithKeepingLayout(this.editor, newRange);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL29wZXJhdG9yLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFdBQVcsQ0FBQTs7Ozs7Ozs7Ozs7O0FBRVgsSUFBTSxDQUFDLEdBQUcsT0FBTyxDQUFDLGlCQUFpQixDQUFDLENBQUE7O2VBV2hDLE9BQU8sQ0FBQyxTQUFTLENBQUM7O0lBVHBCLFVBQVUsWUFBVixVQUFVO0lBQ1YsOEJBQThCLFlBQTlCLDhCQUE4QjtJQUM5QixpQ0FBaUMsWUFBakMsaUNBQWlDO0lBQ2pDLDBCQUEwQixZQUExQiwwQkFBMEI7SUFDMUIsWUFBWSxZQUFaLFlBQVk7SUFDWiwrQkFBK0IsWUFBL0IsK0JBQStCO0lBQy9CLGlDQUFpQyxZQUFqQyxpQ0FBaUM7SUFDakMsNkJBQTZCLFlBQTdCLDZCQUE2QjtJQUM3QixnQkFBZ0IsWUFBaEIsZ0JBQWdCOztBQUVsQixJQUFNLElBQUksR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUE7O0lBRXhCLFFBQVE7WUFBUixRQUFROztXQUFSLFFBQVE7MEJBQVIsUUFBUTs7K0JBQVIsUUFBUTs7U0FFWixhQUFhLEdBQUcsSUFBSTtTQUNwQixVQUFVLEdBQUcsSUFBSTtTQUVqQixJQUFJLEdBQUcsSUFBSTtTQUNYLFVBQVUsR0FBRyxLQUFLO1NBQ2xCLGNBQWMsR0FBRyxNQUFNO1NBRXZCLFdBQVcsR0FBRyxJQUFJO1NBQ2xCLGVBQWUsR0FBRyxZQUFZO1NBQzlCLFNBQVMsR0FBRyxVQUFVO1NBQ3RCLHNCQUFzQixHQUFHLHFCQUFxQjtTQUM5QyxXQUFXLEdBQUcsS0FBSztTQUVuQixvQkFBb0IsR0FBRyxJQUFJO1NBQzNCLGtCQUFrQixHQUFHLElBQUk7U0FDekIsY0FBYyxHQUFHLElBQUk7U0FDckIsWUFBWSxHQUFHLEtBQUs7U0FDcEIsZ0JBQWdCLEdBQUcsSUFBSTtTQUN2Qiw2QkFBNkIsR0FBRyxLQUFLO1NBRXJDLHNCQUFzQixHQUFHLElBQUk7U0FDN0IseUJBQXlCLEdBQUcsSUFBSTtTQUVoQyx5QkFBeUIsR0FBRyxJQUFJO1NBQ2hDLHFCQUFxQixHQUFHLEtBQUs7U0FJN0Isa0JBQWtCLEdBQUcsS0FBSztTQUMxQixjQUFjLEdBQUcsSUFBSTs7O2VBL0JqQixRQUFROztXQWlDRSwwQkFBRztBQUNmLGFBQU8sSUFBSSxDQUFDLGtCQUFrQixJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQTtLQUNqRDs7Ozs7Ozs7V0FLUyxzQkFBRztBQUNYLFVBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFBO0FBQzFCLFVBQUksQ0FBQyxrQkFBa0IsR0FBRyxLQUFLLENBQUE7S0FDaEM7Ozs7Ozs7V0FLcUIsZ0NBQUMsT0FBTyxFQUFFO0FBQzlCLFVBQUksQ0FBQyxJQUFJLENBQUMseUJBQXlCLEVBQUUsSUFBSSxDQUFDLHlCQUF5QixHQUFHLEVBQUUsQ0FBQTtBQUN4RSxVQUFJLENBQUMseUJBQXlCLENBQUMsT0FBTyxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsRUFBRSxDQUFBO0tBQ3pFOzs7V0FFa0IsNkJBQUMsT0FBTyxFQUFFO0FBQzNCLFVBQUksSUFBSSxDQUFDLHlCQUF5QixFQUFFO0FBQ2xDLGVBQU8sSUFBSSxDQUFDLHlCQUF5QixDQUFDLE9BQU8sQ0FBQyxDQUFBO09BQy9DO0tBQ0Y7OztXQUVxQixnQ0FBQyxPQUFPLEVBQUU7QUFDOUIsVUFBSSxJQUFJLENBQUMseUJBQXlCLEVBQUU7QUFDbEMsZUFBTyxJQUFJLENBQUMseUJBQXlCLENBQUMsT0FBTyxDQUFDLENBQUE7T0FDL0M7S0FDRjs7O1dBRWdDLDJDQUFDLE9BQU8sRUFBRTtBQUN6QyxVQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUMsT0FBTyxDQUFDLENBQUE7QUFDcEQsVUFBSSxVQUFVLEVBQUU7QUFDZCxZQUFJLENBQUMsTUFBTSxDQUFDLDJCQUEyQixDQUFDLFVBQVUsQ0FBQyxDQUFBO0FBQ25ELFlBQUksQ0FBQyxzQkFBc0IsQ0FBQyxPQUFPLENBQUMsQ0FBQTtPQUNyQztLQUNGOzs7V0FFZSwwQkFBQyxLQUFLLEVBQUU7QUFDdEIsVUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUE7QUFDeEMsVUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUE7S0FDdkM7OztXQUVRLHFCQUFHO0FBQ1YsYUFDRSxJQUFJLENBQUMsV0FBVyxJQUNoQixJQUFJLENBQUMsU0FBUyxDQUFDLGdCQUFnQixDQUFDLElBQ2hDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQzdELElBQUksQ0FBQyxJQUFJLEtBQUssUUFBUSxJQUFJLElBQUksQ0FBQyxPQUFPLEtBQUssSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUEsQUFBQztPQUM5RDtLQUNGOzs7V0FFZSwwQkFBQyxNQUFNLEVBQUU7QUFDdkIsVUFBSSxJQUFJLENBQUMsU0FBUyxFQUFFLEVBQUU7QUFDcEIsWUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLEVBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxZQUFZLEVBQUUsRUFBQyxDQUFDLENBQUE7T0FDekQ7S0FDRjs7O1dBRXFCLGtDQUFHOzs7QUFDdkIsVUFBSSxJQUFJLENBQUMsU0FBUyxFQUFFLEVBQUU7QUFDcEIsWUFBSSxDQUFDLG9CQUFvQixDQUFDLFlBQU07QUFDOUIsY0FBTSxNQUFNLEdBQUcsTUFBSyxlQUFlLENBQUMsb0NBQW9DLENBQUMsTUFBSyxlQUFlLENBQUMsQ0FBQTtBQUM5RixnQkFBSyxRQUFRLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxFQUFDLElBQUksRUFBRSxNQUFLLFlBQVksRUFBRSxFQUFDLENBQUMsQ0FBQTtTQUN6RCxDQUFDLENBQUE7T0FDSDtLQUNGOzs7V0FFVyx3QkFBRztBQUNiLGFBQU8sSUFBSSxDQUFDLGtCQUFrQixHQUFHLElBQUksQ0FBQyxzQkFBc0IsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFBO0tBQzlFOzs7V0FFcUIsa0NBQUc7OztBQUN2QixVQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxPQUFNO0FBQzdCLFVBQUksQ0FBQyxvQkFBb0IsQ0FBQyxZQUFNO0FBQzlCLFlBQU0sS0FBSyxHQUFHLE9BQUssZUFBZSxDQUFDLGlDQUFpQyxDQUFDLE9BQUssTUFBTSxDQUFDLGdCQUFnQixFQUFFLENBQUMsQ0FBQTtBQUNwRyxZQUFJLEtBQUssRUFBRSxPQUFLLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxDQUFBO09BQ3hDLENBQUMsQ0FBQTtLQUNIOzs7V0FFUyxzQkFBRzs7O0FBQ1gsVUFBSSxDQUFDLHVDQUF1QyxFQUFFLENBQUE7QUFDOUMsVUFBSSxDQUFDLHdCQUF3QixDQUFDLFVBQUEsT0FBTztlQUFJLE9BQUssV0FBVyxDQUFDLE9BQU8sQ0FBQztPQUFBLENBQUMsQ0FBQTs7O0FBR25FLFVBQUksSUFBSSxDQUFDLHNCQUFzQixJQUFJLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxVQUFVLEVBQUUsRUFBRTtBQUN0RSxZQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQTtPQUN2Qjs7Ozs7O0FBTUQsVUFBSSxJQUFJLENBQUMsVUFBVSxJQUFJLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFVBQVUsRUFBRSxFQUFFO0FBQzNELFlBQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxvQkFBb0IsSUFBSSxJQUFJLENBQUMsMkJBQTJCLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFBO0FBQ2hHLFlBQUksQ0FBQyxpQkFBaUIsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUE7T0FDekM7OztBQUdELFVBQUksSUFBSSxDQUFDLG9DQUFvQyxFQUFFLEVBQUU7O0FBRS9DLFlBQUksSUFBSSxDQUFDLElBQUksS0FBSyxRQUFRLEVBQUU7QUFDMUIsY0FBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQTtTQUNqRjtPQUNGOztBQUVELFVBQUksSUFBSSxDQUFDLElBQUksS0FBSyxRQUFRLElBQUksSUFBSSxDQUFDLGFBQWEsRUFBRTtBQUNoRCxZQUFJLENBQUMsTUFBTSxHQUFHLGtCQUFrQixDQUFBO09BQ2pDO0FBQ0QsVUFBSSxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRTtBQUMzQixZQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUE7T0FDOUM7O0FBRUQsd0NBbkpFLFFBQVEsNENBbUplO0tBQzFCOzs7V0FFc0MsbURBQUc7Ozs7Ozs7QUFLeEMsVUFBSSxJQUFJLENBQUMsVUFBVSxJQUFJLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFVBQVUsRUFBRSxFQUFFO0FBQzNELFlBQUksQ0FBQyx3QkFBd0IsQ0FBQztpQkFBTSxPQUFLLGlCQUFpQixDQUFDLGFBQWEsRUFBRTtTQUFBLENBQUMsQ0FBQTtPQUM1RTtLQUNGOzs7V0FFVSxxQkFBQyxJQUFrQyxFQUFFOzs7VUFBbkMsSUFBSSxHQUFMLElBQWtDLENBQWpDLElBQUk7VUFBRSxVQUFVLEdBQWpCLElBQWtDLENBQTNCLFVBQVU7VUFBRSxjQUFjLEdBQWpDLElBQWtDLENBQWYsY0FBYzs7QUFDM0MsVUFBSSxJQUFJLEVBQUU7QUFDUixZQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQTtPQUNqQixNQUFNLElBQUksVUFBVSxFQUFFO0FBQ3JCLFlBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFBO0FBQzVCLFlBQUksQ0FBQyxjQUFjLEdBQUcsY0FBYyxDQUFBOzs7QUFHcEMsWUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLDJCQUEyQixDQUFDLGNBQWMsQ0FBQyxDQUFBO0FBQzlELFlBQUksQ0FBQyxpQkFBaUIsQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLEVBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxjQUFjLEVBQWQsY0FBYyxFQUFDLENBQUMsQ0FBQTtBQUN2RSxZQUFJLENBQUMsd0JBQXdCLENBQUM7aUJBQU0sT0FBSyxpQkFBaUIsQ0FBQyxhQUFhLEVBQUU7U0FBQSxDQUFDLENBQUE7T0FDNUU7S0FDRjs7Ozs7V0FHbUMsZ0RBQUc7QUFDckMsVUFDRSxJQUFJLENBQUMseUJBQXlCLElBQzlCLElBQUksQ0FBQyxTQUFTLENBQUMsd0NBQXdDLENBQUMsSUFDeEQsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsT0FBTyxFQUFFLEVBQ25DO0FBQ0EsWUFBSSxDQUFDLG1CQUFtQixDQUFDLE1BQU0sRUFBRSxDQUFBO0FBQ2pDLFlBQUksQ0FBQyxNQUFNLENBQUMsMkJBQTJCLEVBQUUsQ0FBQTtBQUN6QyxhQUFLLElBQU0sVUFBVSxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRTtBQUM5RCxjQUFJLENBQUMsVUFBVSxDQUFDLGFBQWEsRUFBRSxFQUFFLFVBQVUsQ0FBQyxjQUFjLEVBQUUsQ0FBQTtTQUM3RDs7QUFFRCxlQUFPLElBQUksQ0FBQTtPQUNaLE1BQU07QUFDTCxlQUFPLEtBQUssQ0FBQTtPQUNiO0tBQ0Y7OztXQUUwQixxQ0FBQyxjQUFjLEVBQUU7QUFDMUMsVUFBSSxjQUFjLEtBQUssTUFBTSxFQUFFO0FBQzdCLGVBQU8sOEJBQThCLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsdUJBQXVCLEVBQUUsQ0FBQyxDQUFBO09BQ25GLE1BQU0sSUFBSSxjQUFjLEtBQUssU0FBUyxFQUFFO0FBQ3ZDLGVBQU8saUNBQWlDLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsdUJBQXVCLEVBQUUsQ0FBQyxDQUFBO09BQ3RGO0tBQ0Y7Ozs7O1dBR1EsbUJBQUMsTUFBTSxFQUFFO0FBQ2hCLFVBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFBO0FBQ3BCLFVBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQTtBQUMzQixVQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUE7O0FBRTNCLFVBQUksSUFBSSxDQUFDLGNBQWMsRUFBRSxFQUFFO0FBQ3pCLFlBQUksQ0FBQyw4QkFBOEIsRUFBRSxDQUFBO0FBQ3JDLFlBQUksQ0FBQyxzQkFBc0IsQ0FBQyxNQUFNLENBQUMsQ0FBQTtBQUNuQyxZQUFJLENBQUMsWUFBWSxFQUFFLENBQUE7T0FDcEI7QUFDRCxhQUFPLElBQUksQ0FBQTtLQUNaOzs7V0FFNEIsdUNBQUMsU0FBUyxFQUFFO0FBQ3ZDLFVBQUksQ0FBQyxpQkFBaUIsQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLEVBQUUsU0FBUyxDQUFDLENBQUE7S0FDdkQ7OztXQUVnQiwyQkFBQyxJQUFJLEVBQUUsU0FBUyxFQUFFO0FBQ2pDLFVBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsU0FBUyxFQUFFLElBQUksSUFBSSxDQUFDLDZCQUE2QixFQUFFLEVBQUU7QUFDOUUsZUFBTTtPQUNQOztBQUVELFVBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUU7QUFDcEQsWUFBSSxJQUFJLElBQUksQ0FBQTtPQUNiOztBQUVELFVBQUksSUFBSSxFQUFFO0FBQ1IsWUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxFQUFDLElBQUksRUFBSixJQUFJLEVBQUUsU0FBUyxFQUFULFNBQVMsRUFBQyxDQUFDLENBQUE7O0FBRW5ELFlBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsU0FBUyxFQUFFLEVBQUU7QUFDdEMsY0FBSSxJQUFJLGNBQVcsQ0FBQyxRQUFRLENBQUMsSUFBSSxJQUFJLGNBQVcsQ0FBQyxRQUFRLENBQUMsRUFBRTtBQUMxRCxnQkFBSSxDQUFDLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksZ0JBQWdCLENBQUMsSUFBSSxDQUFDLEVBQUU7QUFDM0Usa0JBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsRUFBQyxJQUFJLEVBQUosSUFBSSxFQUFFLFNBQVMsRUFBVCxTQUFTLEVBQUMsQ0FBQyxDQUFBO2FBQ25ELE1BQU07QUFDTCxvQkFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxFQUFDLElBQUksRUFBSixJQUFJLEVBQUUsU0FBUyxFQUFULFNBQVMsRUFBQyxDQUFDLENBQUE7ZUFDbkQ7V0FDRixNQUFNLElBQUksSUFBSSxjQUFXLENBQUMsTUFBTSxDQUFDLEVBQUU7QUFDbEMsZ0JBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsRUFBQyxJQUFJLEVBQUosSUFBSSxFQUFFLFNBQVMsRUFBVCxTQUFTLEVBQUMsQ0FBQyxDQUFBO1dBQ25EO1NBQ0Y7T0FDRjtLQUNGOzs7V0FFNEIseUNBQUc7QUFDOUIsVUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyw4QkFBOEIsQ0FBQyxDQUFBO0FBQ2hFLFVBQU0saUJBQWlCLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQyxVQUFBLElBQUk7ZUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQztPQUFBLENBQUMsQ0FBQTtBQUN0RSxVQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsMkJBQTJCLEVBQUUsQ0FBQTtBQUN0RCxhQUNFLGlCQUFpQixDQUFDLElBQUksQ0FBQyxVQUFBLElBQUk7ZUFBSSxJQUFJLE1BQU0sQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDO09BQUEsQ0FBQyxJQUMzRixTQUFTLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUNoQztLQUNGOzs7V0FFeUIsb0NBQUMsTUFBTSxFQUFFOzs7QUFHakMsVUFBTSxpQ0FBaUMsR0FBRyxDQUN4QyxZQUFZO0FBQ1osMEJBQW9CO0FBQ3BCLGNBQVE7QUFDUiwyQkFBcUIsQ0FDdEIsQ0FBQTs7QUFDRCxhQUFPLGlDQUFpQyxDQUFDLElBQUksQ0FBQyxVQUFBLElBQUk7ZUFBSSxNQUFNLGNBQVcsQ0FBQyxJQUFJLENBQUM7T0FBQSxDQUFDLENBQUE7S0FDL0U7OztXQUU2QiwwQ0FBRztBQUMvQixVQUFJLElBQUksQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsSUFBSSxJQUFJLENBQUMsSUFBSSxLQUFLLFFBQVEsRUFBRTtBQUNuRSxZQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUE7T0FDbEM7S0FDRjs7O1dBRVksdUJBQUMsRUFBRSxFQUFFOzs7QUFDaEIsVUFBSSxJQUFJLENBQUMsY0FBYyxFQUFFLEVBQUU7OztBQUd6QixVQUFFLEVBQUUsQ0FBQTtBQUNKLFlBQUksQ0FBQyxzQkFBc0IsRUFBRSxDQUFBO0FBQzdCLFlBQUksQ0FBQyxpQ0FBaUMsQ0FBQyxNQUFNLENBQUMsQ0FBQTtPQUMvQyxNQUFNO0FBQ0wsWUFBSSxDQUFDLDhCQUE4QixFQUFFLENBQUE7QUFDckMsWUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsWUFBTTtBQUN6QixZQUFFLEVBQUUsQ0FBQTtBQUNKLGlCQUFLLHNCQUFzQixFQUFFLENBQUE7U0FDOUIsQ0FBQyxDQUFBO09BQ0g7O0FBRUQsVUFBSSxDQUFDLHFCQUFxQixFQUFFLENBQUE7S0FDN0I7Ozs7O1dBR00sbUJBQUc7OztBQUNSLFVBQUksQ0FBQyxhQUFhLENBQUMsWUFBTTtBQUN2QixZQUFJLE9BQUssWUFBWSxFQUFFLEVBQUU7QUFDdkIsY0FBTSxVQUFVLEdBQUcsT0FBSyxxQkFBcUIsR0FDekMsT0FBSyxNQUFNLENBQUMsb0NBQW9DLEVBQUUsR0FDbEQsT0FBSyxNQUFNLENBQUMsYUFBYSxFQUFFLENBQUE7O0FBRS9CLGVBQUssSUFBTSxTQUFTLElBQUksVUFBVSxFQUFFO0FBQ2xDLG1CQUFLLGVBQWUsQ0FBQyxTQUFTLENBQUMsQ0FBQTtXQUNoQztBQUNELGlCQUFLLGVBQWUsQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDLENBQUE7QUFDaEQsaUJBQUssaUNBQWlDLEVBQUUsQ0FBQTtTQUN6QztPQUNGLENBQUMsQ0FBQTs7OztBQUlGLFVBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUE7S0FDNUI7Ozs7O1dBR1csd0JBQUc7QUFDYixVQUFJLElBQUksQ0FBQyxjQUFjLElBQUksSUFBSSxFQUFFO0FBQy9CLGVBQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQTtPQUMzQjtBQUNELFVBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLEVBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxZQUFZLEVBQUMsQ0FBQyxDQUFBOztBQUU1RCxVQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLElBQUksSUFBSSxDQUFDLElBQUksS0FBSyxRQUFRLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQTtBQUNyRixVQUFJLElBQUksQ0FBQyxJQUFJLElBQUksSUFBSSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTs7QUFFdkQsVUFBSSxDQUFDLG9CQUFvQixFQUFFLENBQUE7Ozs7QUFJM0IsVUFBSSxDQUFDLGVBQWUsQ0FBQyxhQUFhLENBQUMsYUFBYSxDQUFDLENBQUE7Ozs7OztBQU1qRCxVQUFJLElBQUksQ0FBQyxRQUFRLElBQUksSUFBSSxDQUFDLFVBQVUsSUFBSSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxVQUFVLEVBQUUsRUFBRTtBQUM1RSxZQUFJLENBQUMsaUJBQWlCLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxFQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsY0FBYyxFQUFDLENBQUMsQ0FBQTtPQUNwRzs7QUFFRCxVQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFBOztBQUVyQixVQUFJLENBQUMsZUFBZSxDQUFDLGFBQWEsQ0FBQyxZQUFZLENBQUMsQ0FBQTtBQUNoRCxVQUFJLElBQUksQ0FBQyxVQUFVLEVBQUU7OztBQUduQixZQUFJLENBQUMsSUFBSSxDQUFDLG9CQUFvQixFQUFFO0FBQzlCLGNBQUksQ0FBQyxvQkFBb0IsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsWUFBWSxFQUFFLENBQUE7U0FDbEU7O0FBRUQsWUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUMsSUFBSSxJQUFJLGVBQWUsQ0FBQTtBQUNsRCxZQUFJLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxFQUFFO0FBQ3RELGNBQUksQ0FBQyxrQkFBa0IsR0FBRyxJQUFJLENBQUE7QUFDOUIsY0FBSSxDQUFDLGVBQWUsQ0FBQyxhQUFhLENBQUMsdUJBQXVCLENBQUMsQ0FBQTtTQUM1RDtPQUNGOztBQUVELFVBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyx5QkFBeUIsRUFBRSxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxLQUFLLE9BQU8sQ0FBQTtBQUMvRixVQUFJLElBQUksQ0FBQyxjQUFjLEVBQUU7QUFDdkIsWUFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUE7QUFDMUIsWUFBSSxDQUFDLHNCQUFzQixFQUFFLENBQUE7QUFDN0IsWUFBSSxDQUFDLHNCQUFzQixFQUFFLENBQUE7T0FDOUIsTUFBTTtBQUNMLFlBQUksQ0FBQyx1QkFBdUIsRUFBRSxDQUFBO09BQy9COztBQUVELGFBQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQTtLQUMzQjs7O1dBRWdDLDZDQUFHO0FBQ2xDLFVBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsT0FBTTs7QUFFbEMsVUFBTSxJQUFJLEdBQ1IsSUFBSSxDQUFDLGtCQUFrQixJQUFJLElBQUksR0FDM0IsSUFBSSxDQUFDLGtCQUFrQixHQUN2QixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSyxJQUFJLENBQUMsa0JBQWtCLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxrQkFBa0IsQ0FBQyxBQUFDLENBQUE7QUFDNUcsVUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixHQUFHLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUE7VUFDdEUsNkJBQTZCLEdBQUksSUFBSSxDQUFyQyw2QkFBNkI7O0FBQ3BDLFVBQUksQ0FBQyxlQUFlLENBQUMsc0JBQXNCLENBQUMsRUFBQyxJQUFJLEVBQUosSUFBSSxFQUFFLElBQUksRUFBSixJQUFJLEVBQUUsNkJBQTZCLEVBQTdCLDZCQUE2QixFQUFDLENBQUMsQ0FBQTtLQUN6Rjs7O1dBdFhzQixVQUFVOzs7O1NBRDdCLFFBQVE7R0FBUyxJQUFJOztBQXlYM0IsUUFBUSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQTs7SUFFbEIsVUFBVTtZQUFWLFVBQVU7O1dBQVYsVUFBVTswQkFBVixVQUFVOzsrQkFBVixVQUFVOztTQUNkLFdBQVcsR0FBRyxLQUFLO1NBQ25CLFVBQVUsR0FBRyxLQUFLOzs7ZUFGZCxVQUFVOztXQUlQLG1CQUFHOzs7QUFDUixVQUFJLENBQUMsYUFBYSxDQUFDO2VBQU0sT0FBSyxZQUFZLEVBQUU7T0FBQSxDQUFDLENBQUE7O0FBRTdDLFVBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxlQUFlLEVBQUU7QUFDL0IsWUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRSxFQUFFO0FBQzlCLGNBQUksQ0FBQyxNQUFNLENBQUMsc0JBQXNCLEVBQUUsQ0FBQTtTQUNyQztBQUNELFlBQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxJQUFJLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFBO0FBQzdFLFlBQUksQ0FBQyx1QkFBdUIsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUE7T0FDN0MsTUFBTTtBQUNMLFlBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQTtPQUN2QjtLQUNGOzs7U0FoQkcsVUFBVTtHQUFTLFFBQVE7O0FBa0JqQyxVQUFVLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFBOztJQUVwQixNQUFNO1lBQU4sTUFBTTs7V0FBTixNQUFNOzBCQUFOLE1BQU07OytCQUFOLE1BQU07OztlQUFOLE1BQU07O1dBQ0gsbUJBQUc7QUFDUixXQUFLLElBQU0sVUFBVSxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRTtBQUM5RCxZQUFJLENBQUMsVUFBVSxDQUFDLGFBQWEsRUFBRSxFQUFFLFVBQVUsQ0FBQyxjQUFjLEVBQUUsQ0FBQTtPQUM3RDtBQUNELGlDQUxFLE1BQU0seUNBS087S0FDaEI7OztTQU5HLE1BQU07R0FBUyxVQUFVOztBQVEvQixNQUFNLENBQUMsUUFBUSxFQUFFLENBQUE7O0lBRVgsa0JBQWtCO1lBQWxCLGtCQUFrQjs7V0FBbEIsa0JBQWtCOzBCQUFsQixrQkFBa0I7OytCQUFsQixrQkFBa0I7O1NBQ3RCLE1BQU0sR0FBRyxlQUFlOzs7U0FEcEIsa0JBQWtCO0dBQVMsVUFBVTs7QUFHM0Msa0JBQWtCLENBQUMsUUFBUSxFQUFFLENBQUE7O0lBRXZCLHVCQUF1QjtZQUF2Qix1QkFBdUI7O1dBQXZCLHVCQUF1QjswQkFBdkIsdUJBQXVCOzsrQkFBdkIsdUJBQXVCOztTQUMzQixNQUFNLEdBQUcsbUJBQW1COzs7U0FEeEIsdUJBQXVCO0dBQVMsVUFBVTs7QUFHaEQsdUJBQXVCLENBQUMsUUFBUSxFQUFFLENBQUE7O0lBRTVCLHlCQUF5QjtZQUF6Qix5QkFBeUI7O1dBQXpCLHlCQUF5QjswQkFBekIseUJBQXlCOzsrQkFBekIseUJBQXlCOztTQUM3QixNQUFNLEdBQUcsc0JBQXNCO1NBQy9CLHlCQUF5QixHQUFHLEtBQUs7OztTQUY3Qix5QkFBeUI7R0FBUyxVQUFVOztBQUlsRCx5QkFBeUIsQ0FBQyxRQUFRLEVBQUUsQ0FBQTs7SUFFOUIsZ0JBQWdCO1lBQWhCLGdCQUFnQjs7V0FBaEIsZ0JBQWdCOzBCQUFoQixnQkFBZ0I7OytCQUFoQixnQkFBZ0I7O1NBQ3BCLFVBQVUsR0FBRyxJQUFJOzs7U0FEYixnQkFBZ0I7R0FBUyxVQUFVOztBQUd6QyxnQkFBZ0IsQ0FBQyxRQUFRLEVBQUUsQ0FBQTs7Ozs7Ozs7Ozs7Ozs7SUFhckIsa0JBQWtCO1lBQWxCLGtCQUFrQjs7V0FBbEIsa0JBQWtCOzBCQUFsQixrQkFBa0I7OytCQUFsQixrQkFBa0I7O1NBQ3RCLHNCQUFzQixHQUFHLEtBQUs7U0FDOUIseUJBQXlCLEdBQUcsS0FBSzs7O1NBRjdCLGtCQUFrQjtHQUFTLFVBQVU7O0FBSTNDLGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQTs7Ozs7SUFJNUIseUJBQXlCO1lBQXpCLHlCQUF5Qjs7V0FBekIseUJBQXlCOzBCQUF6Qix5QkFBeUI7OytCQUF6Qix5QkFBeUI7O1NBQzdCLFdBQVcsR0FBRyxLQUFLO1NBQ25CLGtCQUFrQixHQUFHLElBQUk7U0FDekIsc0JBQXNCLEdBQUcsS0FBSztTQUM5Qix5QkFBeUIsR0FBRyxLQUFLOzs7ZUFKN0IseUJBQXlCOztXQU1kLHlCQUFDLFNBQVMsRUFBRTtBQUN6QixVQUFJLENBQUMsbUJBQW1CLENBQUMsZUFBZSxDQUFDLFNBQVMsQ0FBQyxjQUFjLEVBQUUsQ0FBQyxDQUFBO0tBQ3JFOzs7U0FSRyx5QkFBeUI7R0FBUyxRQUFROztBQVVoRCx5QkFBeUIsQ0FBQyxRQUFRLEVBQUUsQ0FBQTs7SUFFOUIseUJBQXlCO1lBQXpCLHlCQUF5Qjs7V0FBekIseUJBQXlCOzBCQUF6Qix5QkFBeUI7OytCQUF6Qix5QkFBeUI7OztlQUF6Qix5QkFBeUI7O1dBQ25CLHNCQUFHO0FBQ1gsVUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyx1QkFBdUIsRUFBRSxDQUFBO0FBQ25ELFVBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxDQUFBO0FBQ3RFLGFBQU8sSUFBSSxDQUFDLGNBQWMsK0JBSnhCLHlCQUF5QiwyQ0FJcUIsQ0FBQTtLQUNqRDs7O1dBRU0sbUJBQUc7QUFDUixVQUFJLElBQUksQ0FBQyxjQUFjLEVBQUU7QUFDdkIsWUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtPQUM5QixNQUFNO0FBQ0wsbUNBWEEseUJBQXlCLHlDQVdWO09BQ2hCO0tBQ0Y7OztTQWJHLHlCQUF5QjtHQUFTLHlCQUF5Qjs7QUFlakUseUJBQXlCLENBQUMsUUFBUSxFQUFFLENBQUE7Ozs7O0lBSTlCLHNCQUFzQjtZQUF0QixzQkFBc0I7O1dBQXRCLHNCQUFzQjswQkFBdEIsc0JBQXNCOzsrQkFBdEIsc0JBQXNCOztTQUMxQixNQUFNLEdBQUcsT0FBTztTQUNoQixXQUFXLEdBQUcsS0FBSztTQUNuQixzQkFBc0IsR0FBRyxLQUFLO1NBQzlCLHlCQUF5QixHQUFHLEtBQUs7U0FDakMsY0FBYyxHQUFHLE1BQU07OztlQUxuQixzQkFBc0I7O1dBT25CLG1CQUFHO0FBQ1IsVUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsdUJBQXVCLEVBQUUsQ0FBQyxDQUFBO0FBQzdGLFVBQUksTUFBTSxFQUFFO0FBQ1YsWUFBSSxDQUFDLGlCQUFpQixDQUFDLGNBQWMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUE7T0FDaEQsTUFBTTtBQUNMLFlBQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLFVBQVUsRUFBRSxDQUFBOztBQUV6RCxZQUFJLEtBQUssWUFBQSxDQUFBO0FBQ1QsWUFBSSxJQUFJLENBQUMsSUFBSSxLQUFLLFFBQVEsSUFBSSxDQUFDLFVBQVUsRUFBRTtBQUN6QyxjQUFJLENBQUMsY0FBYyxHQUFHLE1BQU0sQ0FBQTtBQUM1QixlQUFLLEdBQUcsSUFBSSxNQUFNLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLGVBQWUsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUE7U0FDdkUsTUFBTTtBQUNMLGVBQUssR0FBRyxJQUFJLENBQUMsMkJBQTJCLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFBO1NBQzlEOztBQUVELFlBQUksQ0FBQyxpQkFBaUIsQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLEVBQUMsY0FBYyxFQUFFLElBQUksQ0FBQyxjQUFjLEVBQUMsQ0FBQyxDQUFBO0FBQy9FLFlBQUksQ0FBQyxpQkFBaUIsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFBOztBQUUzRCxZQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUE7T0FDN0M7S0FDRjs7O1NBM0JHLHNCQUFzQjtHQUFTLFFBQVE7O0FBNkI3QyxzQkFBc0IsQ0FBQyxRQUFRLEVBQUUsQ0FBQTs7SUFFM0IsNkJBQTZCO1lBQTdCLDZCQUE2Qjs7V0FBN0IsNkJBQTZCOzBCQUE3Qiw2QkFBNkI7OytCQUE3Qiw2QkFBNkI7O1NBQ2pDLGNBQWMsR0FBRyxTQUFTOzs7U0FEdEIsNkJBQTZCO0dBQVMsc0JBQXNCOztBQUdsRSw2QkFBNkIsQ0FBQyxRQUFRLEVBQUUsQ0FBQTs7OztJQUdsQyw0Q0FBNEM7WUFBNUMsNENBQTRDOztXQUE1Qyw0Q0FBNEM7MEJBQTVDLDRDQUE0Qzs7K0JBQTVDLDRDQUE0Qzs7O2VBQTVDLDRDQUE0Qzs7V0FDekMsbUJBQUc7QUFDUixVQUFJLENBQUMsaUJBQWlCLENBQUMsYUFBYSxFQUFFLENBQUE7QUFDdEMsVUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsdUJBQXVCLENBQUMsQ0FBQTtBQUMzRCxVQUFJLEtBQUssRUFBRTtBQUNULFlBQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLG9CQUFvQixDQUFDLENBQUE7QUFDakUsWUFBSSxDQUFDLGlCQUFpQixDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsRUFBQyxjQUFjLEVBQWQsY0FBYyxFQUFDLENBQUMsQ0FBQTtBQUMxRCxZQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFBO09BQzVCO0tBQ0Y7OztTQVRHLDRDQUE0QztHQUFTLHNCQUFzQjs7QUFXakYsNENBQTRDLENBQUMsUUFBUSxFQUFFLENBQUE7Ozs7O0lBSWpELE1BQU07WUFBTixNQUFNOztXQUFOLE1BQU07MEJBQU4sTUFBTTs7K0JBQU4sTUFBTTs7U0FDVixXQUFXLEdBQUcsSUFBSTtTQUNsQixlQUFlLEdBQUcsdUJBQXVCO1NBQ3pDLHNCQUFzQixHQUFHLDRCQUE0QjtTQUNyRCxjQUFjLEdBQUcsY0FBYztTQUMvQiw2QkFBNkIsR0FBRyxJQUFJOzs7ZUFMaEMsTUFBTTs7V0FPSCxtQkFBRzs7O0FBQ1IsVUFBSSxDQUFDLGlCQUFpQixDQUFDLFlBQU07QUFDM0IsWUFBSSxPQUFLLGtCQUFrQixJQUFJLE9BQUssY0FBYyxLQUFLLFVBQVUsRUFBRTtBQUNqRSxpQkFBSyxXQUFXLEdBQUcsS0FBSyxDQUFBO1NBQ3pCO09BQ0YsQ0FBQyxDQUFBOztBQUVGLFVBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEtBQUssV0FBVyxFQUFFO0FBQ3BDLFlBQUksQ0FBQyxnQkFBZ0IsR0FBRyxLQUFLLENBQUE7T0FDOUI7QUFDRCxpQ0FqQkUsTUFBTSx5Q0FpQk87S0FDaEI7OztXQUVjLHlCQUFDLFNBQVMsRUFBRTtBQUN6QixVQUFJLENBQUMsNkJBQTZCLENBQUMsU0FBUyxDQUFDLENBQUE7QUFDN0MsZUFBUyxDQUFDLGtCQUFrQixFQUFFLENBQUE7S0FDL0I7OztTQXZCRyxNQUFNO0dBQVMsUUFBUTs7QUF5QjdCLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQTs7SUFFWCxXQUFXO1lBQVgsV0FBVzs7V0FBWCxXQUFXOzBCQUFYLFdBQVc7OytCQUFYLFdBQVc7O1NBQ2YsTUFBTSxHQUFHLFdBQVc7OztTQURoQixXQUFXO0dBQVMsTUFBTTs7QUFHaEMsV0FBVyxDQUFDLFFBQVEsRUFBRSxDQUFBOztJQUVoQixVQUFVO1lBQVYsVUFBVTs7V0FBVixVQUFVOzBCQUFWLFVBQVU7OytCQUFWLFVBQVU7O1NBQ2QsTUFBTSxHQUFHLFVBQVU7OztTQURmLFVBQVU7R0FBUyxNQUFNOztBQUcvQixVQUFVLENBQUMsUUFBUSxFQUFFLENBQUE7O0lBRWYsMkJBQTJCO1lBQTNCLDJCQUEyQjs7V0FBM0IsMkJBQTJCOzBCQUEzQiwyQkFBMkI7OytCQUEzQiwyQkFBMkI7O1NBQy9CLE1BQU0sR0FBRywyQkFBMkI7OztlQURoQywyQkFBMkI7O1dBR3hCLG1CQUFHOzs7QUFDUixVQUFJLENBQUMsaUJBQWlCLENBQUMsWUFBTTtBQUMzQixZQUFJLFFBQUssTUFBTSxDQUFDLElBQUksS0FBSyxXQUFXLEVBQUU7QUFDcEMsZUFBSyxJQUFNLGtCQUFrQixJQUFJLFFBQUssc0JBQXNCLEVBQUUsRUFBRTtBQUM5RCw4QkFBa0IsQ0FBQyxpQ0FBaUMsRUFBRSxDQUFBO1dBQ3ZEO1NBQ0Y7T0FDRixDQUFDLENBQUE7QUFDRixpQ0FYRSwyQkFBMkIseUNBV2Q7S0FDaEI7OztTQVpHLDJCQUEyQjtHQUFTLE1BQU07O0FBY2hELDJCQUEyQixDQUFDLFFBQVEsRUFBRSxDQUFBOztJQUVoQyxVQUFVO1lBQVYsVUFBVTs7V0FBVixVQUFVOzBCQUFWLFVBQVU7OytCQUFWLFVBQVU7O1NBQ2QsSUFBSSxHQUFHLFVBQVU7U0FDakIsTUFBTSxHQUFHLG9CQUFvQjtTQUM3QixXQUFXLEdBQUcsS0FBSzs7O1NBSGYsVUFBVTtHQUFTLE1BQU07O0FBSy9CLFVBQVUsQ0FBQyxRQUFRLEVBQUUsQ0FBQTs7Ozs7SUFJZixJQUFJO1lBQUosSUFBSTs7V0FBSixJQUFJOzBCQUFKLElBQUk7OytCQUFKLElBQUk7O1NBQ1IsV0FBVyxHQUFHLElBQUk7U0FDbEIsY0FBYyxHQUFHLFlBQVk7OztlQUZ6QixJQUFJOztXQUlPLHlCQUFDLFNBQVMsRUFBRTtBQUN6QixVQUFJLENBQUMsNkJBQTZCLENBQUMsU0FBUyxDQUFDLENBQUE7S0FDOUM7OztTQU5HLElBQUk7R0FBUyxRQUFROztBQVEzQixJQUFJLENBQUMsUUFBUSxFQUFFLENBQUE7O0lBRVQsUUFBUTtZQUFSLFFBQVE7O1dBQVIsUUFBUTswQkFBUixRQUFROzsrQkFBUixRQUFROztTQUNaLElBQUksR0FBRyxVQUFVO1NBQ2pCLE1BQU0sR0FBRyxvQkFBb0I7OztTQUZ6QixRQUFRO0dBQVMsSUFBSTs7QUFJM0IsUUFBUSxDQUFDLFFBQVEsRUFBRSxDQUFBOztJQUViLHlCQUF5QjtZQUF6Qix5QkFBeUI7O1dBQXpCLHlCQUF5QjswQkFBekIseUJBQXlCOzsrQkFBekIseUJBQXlCOztTQUM3QixNQUFNLEdBQUcsMkJBQTJCOzs7U0FEaEMseUJBQXlCO0dBQVMsSUFBSTs7QUFHNUMseUJBQXlCLENBQUMsUUFBUSxFQUFFLENBQUE7Ozs7O0lBSTlCLFFBQVE7WUFBUixRQUFROztXQUFSLFFBQVE7MEJBQVIsUUFBUTs7K0JBQVIsUUFBUTs7U0FDWixNQUFNLEdBQUcsT0FBTztTQUNoQixXQUFXLEdBQUcsS0FBSztTQUNuQixnQkFBZ0IsR0FBRyxLQUFLO1NBQ3hCLElBQUksR0FBRyxDQUFDOzs7ZUFKSixRQUFROztXQU1MLG1CQUFHO0FBQ1IsVUFBSSxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUE7QUFDbkIsVUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLE1BQU0sTUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQyxFQUFJLEdBQUcsQ0FBQyxDQUFBOztBQUVqRixpQ0FWRSxRQUFRLHlDQVVLOztBQUVmLFVBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUU7QUFDekIsWUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLHlCQUF5QixDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRTtBQUN0RyxjQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLEVBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxzQkFBc0IsRUFBQyxDQUFDLENBQUE7U0FDekU7T0FDRjtLQUNGOzs7V0FFeUIsb0NBQUMsU0FBUyxFQUFFLEVBQUUsRUFBRTs7O0FBQ3hDLFVBQU0sU0FBUyxHQUFHLEVBQUUsQ0FBQTtBQUNwQixVQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsRUFBQyxTQUFTLEVBQVQsU0FBUyxFQUFDLEVBQUUsVUFBQSxLQUFLLEVBQUk7QUFDakQsWUFBSSxFQUFFLEVBQUU7QUFDTixjQUFJLEVBQUUsQ0FBQyxLQUFLLENBQUMsRUFBRSxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUEsS0FDdEIsT0FBTTtTQUNaO0FBQ0QsWUFBTSxVQUFVLEdBQUcsUUFBSyxhQUFhLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFBO0FBQ3RELGlCQUFTLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQTtPQUNsRCxDQUFDLENBQUE7QUFDRixhQUFPLFNBQVMsQ0FBQTtLQUNqQjs7O1dBRWMseUJBQUMsU0FBUyxFQUFFOzs7VUFDbEIsTUFBTSxHQUFJLFNBQVMsQ0FBbkIsTUFBTTs7QUFDYixVQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxFQUFFOzs7QUFFM0IsY0FBTSxjQUFjLEdBQUcsTUFBTSxDQUFDLGlCQUFpQixFQUFFLENBQUE7QUFDakQsY0FBTSxTQUFTLEdBQUcsUUFBSyxNQUFNLENBQUMsdUJBQXVCLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0FBQ3pFLGNBQU0sU0FBUyxHQUFHLFFBQUssMEJBQTBCLENBQUMsU0FBUyxFQUFFLFVBQUEsS0FBSzttQkFDaEUsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLGNBQWMsQ0FBQztXQUFBLENBQzlDLENBQUE7QUFDRCxjQUFNLEtBQUssR0FBRyxBQUFDLFNBQVMsQ0FBQyxNQUFNLElBQUksU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFLLGNBQWMsQ0FBQTtBQUN6RixnQkFBTSxDQUFDLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxDQUFBOztPQUNoQyxNQUFNOzs7QUFDTCxZQUFNLFNBQVMsR0FBRyxTQUFTLENBQUMsY0FBYyxFQUFFLENBQUE7QUFDNUMsc0JBQUEsSUFBSSxDQUFDLFNBQVMsRUFBQyxJQUFJLE1BQUEsZ0NBQUksSUFBSSxDQUFDLDBCQUEwQixDQUFDLFNBQVMsQ0FBQyxFQUFDLENBQUE7QUFDbEUsY0FBTSxDQUFDLGlCQUFpQixDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQTtPQUMxQztLQUNGOzs7V0FFWSx1QkFBQyxZQUFZLEVBQUU7QUFDMUIsYUFBTyxNQUFNLENBQUMsUUFBUSxDQUFDLFlBQVksRUFBRSxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQTtLQUN2RTs7O1NBcERHLFFBQVE7R0FBUyxRQUFROztBQXNEL0IsUUFBUSxDQUFDLFFBQVEsRUFBRSxDQUFBOzs7O0lBR2IsUUFBUTtZQUFSLFFBQVE7O1dBQVIsUUFBUTswQkFBUixRQUFROzsrQkFBUixRQUFROztTQUNaLElBQUksR0FBRyxDQUFDLENBQUM7OztTQURMLFFBQVE7R0FBUyxRQUFROztBQUcvQixRQUFRLENBQUMsUUFBUSxFQUFFLENBQUE7Ozs7O0lBSWIsZUFBZTtZQUFmLGVBQWU7O1dBQWYsZUFBZTswQkFBZixlQUFlOzsrQkFBZixlQUFlOztTQUNuQixVQUFVLEdBQUcsSUFBSTtTQUNqQixNQUFNLEdBQUcsSUFBSTtTQUNiLHFCQUFxQixHQUFHLElBQUk7OztlQUh4QixlQUFlOztXQUtOLHVCQUFDLFlBQVksRUFBRTtBQUMxQixVQUFJLElBQUksQ0FBQyxVQUFVLElBQUksSUFBSSxFQUFFO0FBQzNCLFlBQUksQ0FBQyxVQUFVLElBQUksSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUE7T0FDL0MsTUFBTTtBQUNMLFlBQUksQ0FBQyxVQUFVLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxZQUFZLEVBQUUsRUFBRSxDQUFDLENBQUE7T0FDcEQ7QUFDRCxhQUFPLElBQUksQ0FBQyxVQUFVLENBQUE7S0FDdkI7OztTQVpHLGVBQWU7R0FBUyxRQUFROztBQWN0QyxlQUFlLENBQUMsUUFBUSxFQUFFLENBQUE7Ozs7SUFHcEIsZUFBZTtZQUFmLGVBQWU7O1dBQWYsZUFBZTswQkFBZixlQUFlOzsrQkFBZixlQUFlOztTQUNuQixJQUFJLEdBQUcsQ0FBQyxDQUFDOzs7U0FETCxlQUFlO0dBQVMsZUFBZTs7QUFHN0MsZUFBZSxDQUFDLFFBQVEsRUFBRSxDQUFBOzs7Ozs7OztJQU9wQixTQUFTO1lBQVQsU0FBUzs7V0FBVCxTQUFTOzBCQUFULFNBQVM7OytCQUFULFNBQVM7O1NBQ2IsUUFBUSxHQUFHLFFBQVE7U0FDbkIsTUFBTSxHQUFHLE9BQU87U0FDaEIsU0FBUyxHQUFHLGVBQWU7U0FDM0IsZ0JBQWdCLEdBQUcsS0FBSztTQUN4QixXQUFXLEdBQUcsS0FBSztTQUNuQixXQUFXLEdBQUcsS0FBSzs7O2VBTmYsU0FBUzs7OztXQVFILHNCQUFHO0FBQ1gsVUFBSSxDQUFDLFFBQVEsQ0FBQyxzQkFBc0IsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUE7QUFDdkQsd0NBVkUsU0FBUyw0Q0FVYztLQUMxQjs7O1dBRU0sbUJBQUc7OztBQUNSLFVBQUksQ0FBQyxvQkFBb0IsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFBO0FBQ3JDLFVBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxzQkFBc0IsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUE7O0FBRTNFLFVBQUksQ0FBQyxtQkFBbUIsQ0FBQyxZQUFNO0FBQzdCLFlBQUksQ0FBQyxRQUFLLFNBQVMsRUFBRSxRQUFLLG9CQUFvQixFQUFFLENBQUE7T0FDakQsQ0FBQyxDQUFBOztBQUVGLGlDQXJCRSxTQUFTLHlDQXFCSTs7QUFFZixVQUFJLElBQUksQ0FBQyxTQUFTLEVBQUUsT0FBTTs7QUFFMUIsVUFBSSxDQUFDLG9CQUFvQixDQUFDLFlBQU07O0FBRTlCLFlBQU0sUUFBUSxHQUFHLFFBQUssb0JBQW9CLENBQUMsR0FBRyxDQUFDLFFBQUssTUFBTSxDQUFDLGdCQUFnQixFQUFFLENBQUMsQ0FBQTtBQUM5RSxZQUFJLFFBQVEsRUFBRSxRQUFLLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxDQUFBOzs7QUFHN0MsWUFBSSxRQUFLLFNBQVMsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsUUFBSyxTQUFTLENBQUMseUJBQXlCLENBQUMsQ0FBQyxRQUFRLENBQUMsUUFBSyxJQUFJLENBQUMsRUFBRTtBQUN0RyxjQUFNLE1BQU0sR0FBRyxRQUFLLE1BQU0sQ0FBQyxhQUFhLEVBQUUsQ0FBQyxHQUFHLENBQUMsVUFBQSxTQUFTO21CQUFJLFFBQUssb0JBQW9CLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQztXQUFBLENBQUMsQ0FBQTtBQUNyRyxrQkFBSyxRQUFRLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxFQUFDLElBQUksRUFBRSxRQUFLLFlBQVksRUFBRSxFQUFDLENBQUMsQ0FBQTtTQUN6RDtPQUNGLENBQUMsQ0FBQTtLQUNIOzs7V0FFbUIsZ0NBQUc7QUFDckIsV0FBSyxJQUFNLFNBQVMsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLGFBQWEsRUFBRSxFQUFFO0FBQ25ELFlBQUksQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxFQUFFLFNBQVE7O1lBRWhELE1BQU0sR0FBSSxTQUFTLENBQW5CLE1BQU07O0FBQ2IsWUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQTtBQUN6RCxZQUFJLElBQUksQ0FBQyxhQUFhLEVBQUU7QUFDdEIseUNBQStCLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUE7U0FDNUQsTUFBTTtBQUNMLGNBQUksUUFBUSxDQUFDLFlBQVksRUFBRSxFQUFFO0FBQzNCLGtCQUFNLENBQUMsaUJBQWlCLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7V0FDMUQsTUFBTTtBQUNMLGtCQUFNLENBQUMsaUJBQWlCLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFBO1dBQ3pDO1NBQ0Y7T0FDRjtLQUNGOzs7V0FFYyx5QkFBQyxTQUFTLEVBQUU7QUFDekIsVUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxTQUFTLEVBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFBO0FBQy9FLFVBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFO0FBQ2YsWUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUE7QUFDckIsZUFBTTtPQUNQOztBQUVELFVBQU0sV0FBVyxHQUFHLENBQUMsQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQTtBQUNqRSxVQUFJLENBQUMsYUFBYSxHQUFHLEtBQUssQ0FBQyxJQUFJLEtBQUssVUFBVSxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLFVBQVUsQ0FBQyxDQUFBO0FBQ25GLFVBQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFFLFdBQVcsRUFBRSxFQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsYUFBYSxFQUFDLENBQUMsQ0FBQTtBQUN4RixVQUFJLENBQUMsb0JBQW9CLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQTtBQUNsRCxVQUFJLENBQUMsUUFBUSxDQUFDLHNCQUFzQixDQUFDLDJCQUEyQixDQUFDLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQTtLQUN0Rjs7Ozs7V0FHSSxlQUFDLFNBQVMsRUFBRSxJQUFJLEVBQUUsS0FBZSxFQUFFO1VBQWhCLGFBQWEsR0FBZCxLQUFlLENBQWQsYUFBYTs7QUFDbkMsVUFBSSxJQUFJLENBQUMsZUFBZSxFQUFFO0FBQ3hCLGVBQU8sSUFBSSxDQUFDLGtCQUFrQixDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQTtPQUNoRCxNQUFNLElBQUksYUFBYSxFQUFFO0FBQ3hCLGVBQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUE7T0FDM0MsTUFBTTtBQUNMLGVBQU8sSUFBSSxDQUFDLGtCQUFrQixDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQTtPQUNoRDtLQUNGOzs7V0FFaUIsNEJBQUMsU0FBUyxFQUFFLElBQUksRUFBRTtVQUMzQixNQUFNLEdBQUksU0FBUyxDQUFuQixNQUFNOztBQUNiLFVBQUksU0FBUyxDQUFDLE9BQU8sRUFBRSxJQUFJLElBQUksQ0FBQyxRQUFRLEtBQUssT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLFlBQVksRUFBRSxDQUFDLEVBQUU7QUFDdkcsY0FBTSxDQUFDLFNBQVMsRUFBRSxDQUFBO09BQ25CO0FBQ0QsYUFBTyxTQUFTLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFBO0tBQ2xDOzs7OztXQUdZLHVCQUFDLFNBQVMsRUFBRSxJQUFJLEVBQUU7VUFDdEIsTUFBTSxHQUFJLFNBQVMsQ0FBbkIsTUFBTTs7QUFDYixVQUFNLFNBQVMsR0FBRyxNQUFNLENBQUMsWUFBWSxFQUFFLENBQUE7QUFDdkMsVUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUU7QUFDeEIsWUFBSSxJQUFJLElBQUksQ0FBQTtPQUNiO0FBQ0QsVUFBSSxTQUFTLENBQUMsT0FBTyxFQUFFLEVBQUU7QUFDdkIsWUFBSSxJQUFJLENBQUMsUUFBUSxLQUFLLFFBQVEsRUFBRTtBQUM5QixpQkFBTywwQkFBMEIsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFBO1NBQ3JFLE1BQU0sSUFBSSxJQUFJLENBQUMsUUFBUSxLQUFLLE9BQU8sRUFBRTtBQUNwQyxjQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUMsU0FBUyxDQUFDLENBQUE7QUFDckQsMkNBQWlDLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxTQUFTLENBQUMsQ0FBQTtBQUN6RCxpQkFBTywwQkFBMEIsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsU0FBUyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQTtTQUN6RTtPQUNGLE1BQU07QUFDTCxZQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsVUFBVSxDQUFDLEVBQUU7QUFDdEMsbUJBQVMsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUE7U0FDM0I7QUFDRCxlQUFPLFNBQVMsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUE7T0FDbEM7S0FDRjs7O1NBOUdHLFNBQVM7R0FBUyxRQUFROztBQWdIaEMsU0FBUyxDQUFDLFFBQVEsRUFBRSxDQUFBOztJQUVkLFFBQVE7WUFBUixRQUFROztXQUFSLFFBQVE7MEJBQVIsUUFBUTs7K0JBQVIsUUFBUTs7U0FDWixRQUFRLEdBQUcsT0FBTzs7O1NBRGQsUUFBUTtHQUFTLFNBQVM7O0FBR2hDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsQ0FBQTs7SUFFYix1QkFBdUI7WUFBdkIsdUJBQXVCOztXQUF2Qix1QkFBdUI7MEJBQXZCLHVCQUF1Qjs7K0JBQXZCLHVCQUF1Qjs7O2VBQXZCLHVCQUF1Qjs7V0FDZCx1QkFBQyxTQUFTLEVBQUUsSUFBSSxFQUFFO0FBQzdCLFVBQU0sUUFBUSw4QkFGWix1QkFBdUIsK0NBRVksU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFBO0FBQ3JELG1DQUE2QixDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUE7QUFDcEQsYUFBTyxRQUFRLENBQUE7S0FDaEI7OztTQUxHLHVCQUF1QjtHQUFTLFNBQVM7O0FBTy9DLHVCQUF1QixDQUFDLFFBQVEsRUFBRSxDQUFBOztJQUU1QixzQkFBc0I7WUFBdEIsc0JBQXNCOztXQUF0QixzQkFBc0I7MEJBQXRCLHNCQUFzQjs7K0JBQXRCLHNCQUFzQjs7U0FDMUIsUUFBUSxHQUFHLE9BQU87OztTQURkLHNCQUFzQjtHQUFTLHVCQUF1Qjs7QUFHNUQsc0JBQXNCLENBQUMsUUFBUSxFQUFFLENBQUE7O0lBRTNCLGlCQUFpQjtZQUFqQixpQkFBaUI7O1dBQWpCLGlCQUFpQjswQkFBakIsaUJBQWlCOzsrQkFBakIsaUJBQWlCOztTQUNyQixXQUFXLEdBQUcsS0FBSztTQUNuQixNQUFNLEdBQUcsT0FBTztTQUNoQixrQkFBa0IsR0FBRyxJQUFJO1NBQ3pCLFlBQVksR0FBRyxJQUFJO1NBQ25CLEtBQUssR0FBRyxPQUFPOzs7ZUFMWCxpQkFBaUI7O1dBT04seUJBQUMsU0FBUyxFQUFFO0FBQ3pCLFVBQU0sS0FBSyxHQUFHLFNBQVMsQ0FBQyxxQkFBcUIsRUFBRSxDQUFBO0FBQy9DLFVBQUksSUFBSSxDQUFDLEtBQUssS0FBSyxPQUFPLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFBO0FBQ3ZDLFdBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFBO0FBQ2hCLFVBQUksQ0FBQyxNQUFNLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFBO0tBQy9FOzs7U0FaRyxpQkFBaUI7R0FBUyxRQUFROztBQWN4QyxpQkFBaUIsQ0FBQyxRQUFRLEVBQUUsQ0FBQTs7SUFFdEIsaUJBQWlCO1lBQWpCLGlCQUFpQjs7V0FBakIsaUJBQWlCOzBCQUFqQixpQkFBaUI7OytCQUFqQixpQkFBaUI7O1NBQ3JCLEtBQUssR0FBRyxPQUFPOzs7U0FEWCxpQkFBaUI7R0FBUyxpQkFBaUI7O0FBR2pELGlCQUFpQixDQUFDLFFBQVEsRUFBRSxDQUFBIiwiZmlsZSI6Ii9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL29wZXJhdG9yLmpzIiwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2UgYmFiZWxcIlxuXG5jb25zdCBfID0gcmVxdWlyZShcInVuZGVyc2NvcmUtcGx1c1wiKVxuY29uc3Qge1xuICBpc0VtcHR5Um93LFxuICBnZXRXb3JkUGF0dGVybkF0QnVmZmVyUG9zaXRpb24sXG4gIGdldFN1YndvcmRQYXR0ZXJuQXRCdWZmZXJQb3NpdGlvbixcbiAgaW5zZXJ0VGV4dEF0QnVmZmVyUG9zaXRpb24sXG4gIHNldEJ1ZmZlclJvdyxcbiAgbW92ZUN1cnNvclRvRmlyc3RDaGFyYWN0ZXJBdFJvdyxcbiAgZW5zdXJlRW5kc1dpdGhOZXdMaW5lRm9yQnVmZmVyUm93LFxuICBhZGp1c3RJbmRlbnRXaXRoS2VlcGluZ0xheW91dCxcbiAgaXNTaW5nbGVMaW5lVGV4dCxcbn0gPSByZXF1aXJlKFwiLi91dGlsc1wiKVxuY29uc3QgQmFzZSA9IHJlcXVpcmUoXCIuL2Jhc2VcIilcblxuY2xhc3MgT3BlcmF0b3IgZXh0ZW5kcyBCYXNlIHtcbiAgc3RhdGljIG9wZXJhdGlvbktpbmQgPSBcIm9wZXJhdG9yXCJcbiAgcmVxdWlyZVRhcmdldCA9IHRydWVcbiAgcmVjb3JkYWJsZSA9IHRydWVcblxuICB3aXNlID0gbnVsbFxuICBvY2N1cnJlbmNlID0gZmFsc2VcbiAgb2NjdXJyZW5jZVR5cGUgPSBcImJhc2VcIlxuXG4gIGZsYXNoVGFyZ2V0ID0gdHJ1ZVxuICBmbGFzaENoZWNrcG9pbnQgPSBcImRpZC1maW5pc2hcIlxuICBmbGFzaFR5cGUgPSBcIm9wZXJhdG9yXCJcbiAgZmxhc2hUeXBlRm9yT2NjdXJyZW5jZSA9IFwib3BlcmF0b3Itb2NjdXJyZW5jZVwiXG4gIHRyYWNrQ2hhbmdlID0gZmFsc2VcblxuICBwYXR0ZXJuRm9yT2NjdXJyZW5jZSA9IG51bGxcbiAgc3RheUF0U2FtZVBvc2l0aW9uID0gbnVsbFxuICBzdGF5T3B0aW9uTmFtZSA9IG51bGxcbiAgc3RheUJ5TWFya2VyID0gZmFsc2VcbiAgcmVzdG9yZVBvc2l0aW9ucyA9IHRydWVcbiAgc2V0VG9GaXJzdENoYXJhY3Rlck9uTGluZXdpc2UgPSBmYWxzZVxuXG4gIGFjY2VwdFByZXNldE9jY3VycmVuY2UgPSB0cnVlXG4gIGFjY2VwdFBlcnNpc3RlbnRTZWxlY3Rpb24gPSB0cnVlXG5cbiAgYnVmZmVyQ2hlY2twb2ludEJ5UHVycG9zZSA9IG51bGxcbiAgbXV0YXRlU2VsZWN0aW9uT3JkZXJkID0gZmFsc2VcblxuICAvLyBFeHBlcmltZW50YWx5IGFsbG93IHNlbGVjdFRhcmdldCBiZWZvcmUgaW5wdXQgQ29tcGxldGVcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBzdXBwb3J0RWFybHlTZWxlY3QgPSBmYWxzZVxuICB0YXJnZXRTZWxlY3RlZCA9IG51bGxcblxuICBjYW5FYXJseVNlbGVjdCgpIHtcbiAgICByZXR1cm4gdGhpcy5zdXBwb3J0RWFybHlTZWxlY3QgJiYgIXRoaXMucmVwZWF0ZWRcbiAgfVxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gQ2FsbGVkIHdoZW4gb3BlcmF0aW9uIGZpbmlzaGVkXG4gIC8vIFRoaXMgaXMgZXNzZW50aWFsbHkgdG8gcmVzZXQgc3RhdGUgZm9yIGAuYCByZXBlYXQuXG4gIHJlc2V0U3RhdGUoKSB7XG4gICAgdGhpcy50YXJnZXRTZWxlY3RlZCA9IG51bGxcbiAgICB0aGlzLm9jY3VycmVuY2VTZWxlY3RlZCA9IGZhbHNlXG4gIH1cblxuICAvLyBUd28gY2hlY2twb2ludCBmb3IgZGlmZmVyZW50IHB1cnBvc2VcbiAgLy8gLSBvbmUgZm9yIHVuZG8oaGFuZGxlZCBieSBtb2RlTWFuYWdlcilcbiAgLy8gLSBvbmUgZm9yIHByZXNlcnZlIGxhc3QgaW5zZXJ0ZWQgdGV4dFxuICBjcmVhdGVCdWZmZXJDaGVja3BvaW50KHB1cnBvc2UpIHtcbiAgICBpZiAoIXRoaXMuYnVmZmVyQ2hlY2twb2ludEJ5UHVycG9zZSkgdGhpcy5idWZmZXJDaGVja3BvaW50QnlQdXJwb3NlID0ge31cbiAgICB0aGlzLmJ1ZmZlckNoZWNrcG9pbnRCeVB1cnBvc2VbcHVycG9zZV0gPSB0aGlzLmVkaXRvci5jcmVhdGVDaGVja3BvaW50KClcbiAgfVxuXG4gIGdldEJ1ZmZlckNoZWNrcG9pbnQocHVycG9zZSkge1xuICAgIGlmICh0aGlzLmJ1ZmZlckNoZWNrcG9pbnRCeVB1cnBvc2UpIHtcbiAgICAgIHJldHVybiB0aGlzLmJ1ZmZlckNoZWNrcG9pbnRCeVB1cnBvc2VbcHVycG9zZV1cbiAgICB9XG4gIH1cblxuICBkZWxldGVCdWZmZXJDaGVja3BvaW50KHB1cnBvc2UpIHtcbiAgICBpZiAodGhpcy5idWZmZXJDaGVja3BvaW50QnlQdXJwb3NlKSB7XG4gICAgICBkZWxldGUgdGhpcy5idWZmZXJDaGVja3BvaW50QnlQdXJwb3NlW3B1cnBvc2VdXG4gICAgfVxuICB9XG5cbiAgZ3JvdXBDaGFuZ2VzU2luY2VCdWZmZXJDaGVja3BvaW50KHB1cnBvc2UpIHtcbiAgICBjb25zdCBjaGVja3BvaW50ID0gdGhpcy5nZXRCdWZmZXJDaGVja3BvaW50KHB1cnBvc2UpXG4gICAgaWYgKGNoZWNrcG9pbnQpIHtcbiAgICAgIHRoaXMuZWRpdG9yLmdyb3VwQ2hhbmdlc1NpbmNlQ2hlY2twb2ludChjaGVja3BvaW50KVxuICAgICAgdGhpcy5kZWxldGVCdWZmZXJDaGVja3BvaW50KHB1cnBvc2UpXG4gICAgfVxuICB9XG5cbiAgc2V0TWFya0ZvckNoYW5nZShyYW5nZSkge1xuICAgIHRoaXMudmltU3RhdGUubWFyay5zZXQoXCJbXCIsIHJhbmdlLnN0YXJ0KVxuICAgIHRoaXMudmltU3RhdGUubWFyay5zZXQoXCJdXCIsIHJhbmdlLmVuZClcbiAgfVxuXG4gIG5lZWRGbGFzaCgpIHtcbiAgICByZXR1cm4gKFxuICAgICAgdGhpcy5mbGFzaFRhcmdldCAmJlxuICAgICAgdGhpcy5nZXRDb25maWcoXCJmbGFzaE9uT3BlcmF0ZVwiKSAmJlxuICAgICAgIXRoaXMuZ2V0Q29uZmlnKFwiZmxhc2hPbk9wZXJhdGVCbGFja2xpc3RcIikuaW5jbHVkZXModGhpcy5uYW1lKSAmJlxuICAgICAgKHRoaXMubW9kZSAhPT0gXCJ2aXN1YWxcIiB8fCB0aGlzLnN1Ym1vZGUgIT09IHRoaXMudGFyZ2V0Lndpc2UpIC8vIGUuZy4gWSBpbiB2Q1xuICAgIClcbiAgfVxuXG4gIGZsYXNoSWZOZWNlc3NhcnkocmFuZ2VzKSB7XG4gICAgaWYgKHRoaXMubmVlZEZsYXNoKCkpIHtcbiAgICAgIHRoaXMudmltU3RhdGUuZmxhc2gocmFuZ2VzLCB7dHlwZTogdGhpcy5nZXRGbGFzaFR5cGUoKX0pXG4gICAgfVxuICB9XG5cbiAgZmxhc2hDaGFuZ2VJZk5lY2Vzc2FyeSgpIHtcbiAgICBpZiAodGhpcy5uZWVkRmxhc2goKSkge1xuICAgICAgdGhpcy5vbkRpZEZpbmlzaE9wZXJhdGlvbigoKSA9PiB7XG4gICAgICAgIGNvbnN0IHJhbmdlcyA9IHRoaXMubXV0YXRpb25NYW5hZ2VyLmdldFNlbGVjdGVkQnVmZmVyUmFuZ2VzRm9yQ2hlY2twb2ludCh0aGlzLmZsYXNoQ2hlY2twb2ludClcbiAgICAgICAgdGhpcy52aW1TdGF0ZS5mbGFzaChyYW5nZXMsIHt0eXBlOiB0aGlzLmdldEZsYXNoVHlwZSgpfSlcbiAgICAgIH0pXG4gICAgfVxuICB9XG5cbiAgZ2V0Rmxhc2hUeXBlKCkge1xuICAgIHJldHVybiB0aGlzLm9jY3VycmVuY2VTZWxlY3RlZCA/IHRoaXMuZmxhc2hUeXBlRm9yT2NjdXJyZW5jZSA6IHRoaXMuZmxhc2hUeXBlXG4gIH1cblxuICB0cmFja0NoYW5nZUlmTmVjZXNzYXJ5KCkge1xuICAgIGlmICghdGhpcy50cmFja0NoYW5nZSkgcmV0dXJuXG4gICAgdGhpcy5vbkRpZEZpbmlzaE9wZXJhdGlvbigoKSA9PiB7XG4gICAgICBjb25zdCByYW5nZSA9IHRoaXMubXV0YXRpb25NYW5hZ2VyLmdldE11dGF0ZWRCdWZmZXJSYW5nZUZvclNlbGVjdGlvbih0aGlzLmVkaXRvci5nZXRMYXN0U2VsZWN0aW9uKCkpXG4gICAgICBpZiAocmFuZ2UpIHRoaXMuc2V0TWFya0ZvckNoYW5nZShyYW5nZSlcbiAgICB9KVxuICB9XG5cbiAgaW5pdGlhbGl6ZSgpIHtcbiAgICB0aGlzLnN1YnNjcmliZVJlc2V0T2NjdXJyZW5jZVBhdHRlcm5JZk5lZWRlZCgpXG4gICAgdGhpcy5vbkRpZFNldE9wZXJhdG9yTW9kaWZpZXIob3B0aW9ucyA9PiB0aGlzLnNldE1vZGlmaWVyKG9wdGlvbnMpKVxuXG4gICAgLy8gV2hlbiBwcmVzZXQtb2NjdXJyZW5jZSB3YXMgZXhpc3RzLCBvcGVyYXRlIG9uIG9jY3VycmVuY2Utd2lzZVxuICAgIGlmICh0aGlzLmFjY2VwdFByZXNldE9jY3VycmVuY2UgJiYgdGhpcy5vY2N1cnJlbmNlTWFuYWdlci5oYXNNYXJrZXJzKCkpIHtcbiAgICAgIHRoaXMub2NjdXJyZW5jZSA9IHRydWVcbiAgICB9XG5cbiAgICAvLyBbRklYTUVdIE9SREVSLU1BVFRFUlxuICAgIC8vIFRvIHBpY2sgY3Vyc29yLXdvcmQgdG8gZmluZCBvY2N1cnJlbmNlIGJhc2UgcGF0dGVybi5cbiAgICAvLyBUaGlzIGhhcyB0byBiZSBkb25lIEJFRk9SRSBjb252ZXJ0aW5nIHBlcnNpc3RlbnQtc2VsZWN0aW9uIGludG8gcmVhbC1zZWxlY3Rpb24uXG4gICAgLy8gU2luY2Ugd2hlbiBwZXJzaXN0ZW50LXNlbGVjdGlvbiBpcyBhY3R1YWxsIHNlbGVjdGVkLCBpdCBjaGFuZ2UgY3Vyc29yIHBvc2l0aW9uLlxuICAgIGlmICh0aGlzLm9jY3VycmVuY2UgJiYgIXRoaXMub2NjdXJyZW5jZU1hbmFnZXIuaGFzTWFya2VycygpKSB7XG4gICAgICBjb25zdCByZWdleCA9IHRoaXMucGF0dGVybkZvck9jY3VycmVuY2UgfHwgdGhpcy5nZXRQYXR0ZXJuRm9yT2NjdXJyZW5jZVR5cGUodGhpcy5vY2N1cnJlbmNlVHlwZSlcbiAgICAgIHRoaXMub2NjdXJyZW5jZU1hbmFnZXIuYWRkUGF0dGVybihyZWdleClcbiAgICB9XG5cbiAgICAvLyBUaGlzIGNoYW5nZSBjdXJzb3IgcG9zaXRpb24uXG4gICAgaWYgKHRoaXMuc2VsZWN0UGVyc2lzdGVudFNlbGVjdGlvbklmTmVjZXNzYXJ5KCkpIHtcbiAgICAgIC8vIFtGSVhNRV0gc2VsZWN0aW9uLXdpc2UgaXMgbm90IHN5bmNoZWQgaWYgaXQgYWxyZWFkeSB2aXN1YWwtbW9kZVxuICAgICAgaWYgKHRoaXMubW9kZSAhPT0gXCJ2aXN1YWxcIikge1xuICAgICAgICB0aGlzLnZpbVN0YXRlLm1vZGVNYW5hZ2VyLmFjdGl2YXRlKFwidmlzdWFsXCIsIHRoaXMuc3dyYXAuZGV0ZWN0V2lzZSh0aGlzLmVkaXRvcikpXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHRoaXMubW9kZSA9PT0gXCJ2aXN1YWxcIiAmJiB0aGlzLnJlcXVpcmVUYXJnZXQpIHtcbiAgICAgIHRoaXMudGFyZ2V0ID0gXCJDdXJyZW50U2VsZWN0aW9uXCJcbiAgICB9XG4gICAgaWYgKF8uaXNTdHJpbmcodGhpcy50YXJnZXQpKSB7XG4gICAgICB0aGlzLnNldFRhcmdldCh0aGlzLmdldEluc3RhbmNlKHRoaXMudGFyZ2V0KSlcbiAgICB9XG5cbiAgICByZXR1cm4gc3VwZXIuaW5pdGlhbGl6ZSgpXG4gIH1cblxuICBzdWJzY3JpYmVSZXNldE9jY3VycmVuY2VQYXR0ZXJuSWZOZWVkZWQoKSB7XG4gICAgLy8gW0NBVVRJT05dXG4gICAgLy8gVGhpcyBtZXRob2QgaGFzIHRvIGJlIGNhbGxlZCBpbiBQUk9QRVIgdGltaW5nLlxuICAgIC8vIElmIG9jY3VycmVuY2UgaXMgdHJ1ZSBidXQgbm8gcHJlc2V0LW9jY3VycmVuY2VcbiAgICAvLyBUcmVhdCB0aGF0IGBvY2N1cnJlbmNlYCBpcyBCT1VOREVEIHRvIG9wZXJhdG9yIGl0c2VsZiwgc28gY2xlYW5wIGF0IGZpbmlzaGVkLlxuICAgIGlmICh0aGlzLm9jY3VycmVuY2UgJiYgIXRoaXMub2NjdXJyZW5jZU1hbmFnZXIuaGFzTWFya2VycygpKSB7XG4gICAgICB0aGlzLm9uRGlkUmVzZXRPcGVyYXRpb25TdGFjaygoKSA9PiB0aGlzLm9jY3VycmVuY2VNYW5hZ2VyLnJlc2V0UGF0dGVybnMoKSlcbiAgICB9XG4gIH1cblxuICBzZXRNb2RpZmllcih7d2lzZSwgb2NjdXJyZW5jZSwgb2NjdXJyZW5jZVR5cGV9KSB7XG4gICAgaWYgKHdpc2UpIHtcbiAgICAgIHRoaXMud2lzZSA9IHdpc2VcbiAgICB9IGVsc2UgaWYgKG9jY3VycmVuY2UpIHtcbiAgICAgIHRoaXMub2NjdXJyZW5jZSA9IG9jY3VycmVuY2VcbiAgICAgIHRoaXMub2NjdXJyZW5jZVR5cGUgPSBvY2N1cnJlbmNlVHlwZVxuICAgICAgLy8gVGhpcyBpcyBvIG1vZGlmaWVyIGNhc2UoZS5nLiBgYyBvIHBgLCBgZCBPIGZgKVxuICAgICAgLy8gV2UgUkVTRVQgZXhpc3Rpbmcgb2NjdXJlbmNlLW1hcmtlciB3aGVuIGBvYCBvciBgT2AgbW9kaWZpZXIgaXMgdHlwZWQgYnkgdXNlci5cbiAgICAgIGNvbnN0IHJlZ2V4ID0gdGhpcy5nZXRQYXR0ZXJuRm9yT2NjdXJyZW5jZVR5cGUob2NjdXJyZW5jZVR5cGUpXG4gICAgICB0aGlzLm9jY3VycmVuY2VNYW5hZ2VyLmFkZFBhdHRlcm4ocmVnZXgsIHtyZXNldDogdHJ1ZSwgb2NjdXJyZW5jZVR5cGV9KVxuICAgICAgdGhpcy5vbkRpZFJlc2V0T3BlcmF0aW9uU3RhY2soKCkgPT4gdGhpcy5vY2N1cnJlbmNlTWFuYWdlci5yZXNldFBhdHRlcm5zKCkpXG4gICAgfVxuICB9XG5cbiAgLy8gcmV0dXJuIHRydWUvZmFsc2UgdG8gaW5kaWNhdGUgc3VjY2Vzc1xuICBzZWxlY3RQZXJzaXN0ZW50U2VsZWN0aW9uSWZOZWNlc3NhcnkoKSB7XG4gICAgaWYgKFxuICAgICAgdGhpcy5hY2NlcHRQZXJzaXN0ZW50U2VsZWN0aW9uICYmXG4gICAgICB0aGlzLmdldENvbmZpZyhcImF1dG9TZWxlY3RQZXJzaXN0ZW50U2VsZWN0aW9uT25PcGVyYXRlXCIpICYmXG4gICAgICAhdGhpcy5wZXJzaXN0ZW50U2VsZWN0aW9uLmlzRW1wdHkoKVxuICAgICkge1xuICAgICAgdGhpcy5wZXJzaXN0ZW50U2VsZWN0aW9uLnNlbGVjdCgpXG4gICAgICB0aGlzLmVkaXRvci5tZXJnZUludGVyc2VjdGluZ1NlbGVjdGlvbnMoKVxuICAgICAgZm9yIChjb25zdCAkc2VsZWN0aW9uIG9mIHRoaXMuc3dyYXAuZ2V0U2VsZWN0aW9ucyh0aGlzLmVkaXRvcikpIHtcbiAgICAgICAgaWYgKCEkc2VsZWN0aW9uLmhhc1Byb3BlcnRpZXMoKSkgJHNlbGVjdGlvbi5zYXZlUHJvcGVydGllcygpXG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0cnVlXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cbiAgfVxuXG4gIGdldFBhdHRlcm5Gb3JPY2N1cnJlbmNlVHlwZShvY2N1cnJlbmNlVHlwZSkge1xuICAgIGlmIChvY2N1cnJlbmNlVHlwZSA9PT0gXCJiYXNlXCIpIHtcbiAgICAgIHJldHVybiBnZXRXb3JkUGF0dGVybkF0QnVmZmVyUG9zaXRpb24odGhpcy5lZGl0b3IsIHRoaXMuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKSlcbiAgICB9IGVsc2UgaWYgKG9jY3VycmVuY2VUeXBlID09PSBcInN1YndvcmRcIikge1xuICAgICAgcmV0dXJuIGdldFN1YndvcmRQYXR0ZXJuQXRCdWZmZXJQb3NpdGlvbih0aGlzLmVkaXRvciwgdGhpcy5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpKVxuICAgIH1cbiAgfVxuXG4gIC8vIHRhcmdldCBpcyBUZXh0T2JqZWN0IG9yIE1vdGlvbiB0byBvcGVyYXRlIG9uLlxuICBzZXRUYXJnZXQodGFyZ2V0KSB7XG4gICAgdGhpcy50YXJnZXQgPSB0YXJnZXRcbiAgICB0aGlzLnRhcmdldC5vcGVyYXRvciA9IHRoaXNcbiAgICB0aGlzLmVtaXREaWRTZXRUYXJnZXQodGhpcylcblxuICAgIGlmICh0aGlzLmNhbkVhcmx5U2VsZWN0KCkpIHtcbiAgICAgIHRoaXMubm9ybWFsaXplU2VsZWN0aW9uc0lmTmVjZXNzYXJ5KClcbiAgICAgIHRoaXMuY3JlYXRlQnVmZmVyQ2hlY2twb2ludChcInVuZG9cIilcbiAgICAgIHRoaXMuc2VsZWN0VGFyZ2V0KClcbiAgICB9XG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIHNldFRleHRUb1JlZ2lzdGVyRm9yU2VsZWN0aW9uKHNlbGVjdGlvbikge1xuICAgIHRoaXMuc2V0VGV4dFRvUmVnaXN0ZXIoc2VsZWN0aW9uLmdldFRleHQoKSwgc2VsZWN0aW9uKVxuICB9XG5cbiAgc2V0VGV4dFRvUmVnaXN0ZXIodGV4dCwgc2VsZWN0aW9uKSB7XG4gICAgaWYgKHRoaXMudmltU3RhdGUucmVnaXN0ZXIuaXNVbm5hbWVkKCkgJiYgdGhpcy5pc0JsYWNraG9sZVJlZ2lzdGVyZWRPcGVyYXRvcigpKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBpZiAodGhpcy50YXJnZXQuaXNMaW5ld2lzZSgpICYmICF0ZXh0LmVuZHNXaXRoKFwiXFxuXCIpKSB7XG4gICAgICB0ZXh0ICs9IFwiXFxuXCJcbiAgICB9XG5cbiAgICBpZiAodGV4dCkge1xuICAgICAgdGhpcy52aW1TdGF0ZS5yZWdpc3Rlci5zZXQobnVsbCwge3RleHQsIHNlbGVjdGlvbn0pXG5cbiAgICAgIGlmICh0aGlzLnZpbVN0YXRlLnJlZ2lzdGVyLmlzVW5uYW1lZCgpKSB7XG4gICAgICAgIGlmICh0aGlzLmluc3RhbmNlb2YoXCJEZWxldGVcIikgfHwgdGhpcy5pbnN0YW5jZW9mKFwiQ2hhbmdlXCIpKSB7XG4gICAgICAgICAgaWYgKCF0aGlzLm5lZWRTYXZlVG9OdW1iZXJlZFJlZ2lzdGVyKHRoaXMudGFyZ2V0KSAmJiBpc1NpbmdsZUxpbmVUZXh0KHRleHQpKSB7XG4gICAgICAgICAgICB0aGlzLnZpbVN0YXRlLnJlZ2lzdGVyLnNldChcIi1cIiwge3RleHQsIHNlbGVjdGlvbn0pIC8vIHNtYWxsLWNoYW5nZVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnZpbVN0YXRlLnJlZ2lzdGVyLnNldChcIjFcIiwge3RleHQsIHNlbGVjdGlvbn0pXG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuaW5zdGFuY2VvZihcIllhbmtcIikpIHtcbiAgICAgICAgICB0aGlzLnZpbVN0YXRlLnJlZ2lzdGVyLnNldChcIjBcIiwge3RleHQsIHNlbGVjdGlvbn0pXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBpc0JsYWNraG9sZVJlZ2lzdGVyZWRPcGVyYXRvcigpIHtcbiAgICBjb25zdCBvcGVyYXRvcnMgPSB0aGlzLmdldENvbmZpZyhcImJsYWNraG9sZVJlZ2lzdGVyZWRPcGVyYXRvcnNcIilcbiAgICBjb25zdCB3aWxkQ2FyZE9wZXJhdG9ycyA9IG9wZXJhdG9ycy5maWx0ZXIobmFtZSA9PiBuYW1lLmVuZHNXaXRoKFwiKlwiKSlcbiAgICBjb25zdCBjb21tYW5kTmFtZSA9IHRoaXMuZ2V0Q29tbWFuZE5hbWVXaXRob3V0UHJlZml4KClcbiAgICByZXR1cm4gKFxuICAgICAgd2lsZENhcmRPcGVyYXRvcnMuc29tZShuYW1lID0+IG5ldyBSZWdFeHAoXCJeXCIgKyBuYW1lLnJlcGxhY2UoXCIqXCIsIFwiLipcIikpLnRlc3QoY29tbWFuZE5hbWUpKSB8fFxuICAgICAgb3BlcmF0b3JzLmluY2x1ZGVzKGNvbW1hbmROYW1lKVxuICAgIClcbiAgfVxuXG4gIG5lZWRTYXZlVG9OdW1iZXJlZFJlZ2lzdGVyKHRhcmdldCkge1xuICAgIC8vIFVzZWQgdG8gZGV0ZXJtaW5lIHdoYXQgcmVnaXN0ZXIgdG8gdXNlIG9uIGNoYW5nZSBhbmQgZGVsZXRlIG9wZXJhdGlvbi5cbiAgICAvLyBGb2xsb3dpbmcgbW90aW9uIHNob3VsZCBzYXZlIHRvIDEtOSByZWdpc3RlciByZWdlcmRsZXNzIG9mIGNvbnRlbnQgaXMgc21hbGwgb3IgYmlnLlxuICAgIGNvbnN0IGdvZXNUb051bWJlcmVkUmVnaXN0ZXJNb3Rpb25OYW1lcyA9IFtcbiAgICAgIFwiTW92ZVRvUGFpclwiLCAvLyAlXG4gICAgICBcIk1vdmVUb05leHRTZW50ZW5jZVwiLCAvLyAoLCApXG4gICAgICBcIlNlYXJjaFwiLCAvLyAvLCA/LCBuLCBOXG4gICAgICBcIk1vdmVUb05leHRQYXJhZ3JhcGhcIiwgLy8geywgfVxuICAgIF1cbiAgICByZXR1cm4gZ29lc1RvTnVtYmVyZWRSZWdpc3Rlck1vdGlvbk5hbWVzLnNvbWUobmFtZSA9PiB0YXJnZXQuaW5zdGFuY2VvZihuYW1lKSlcbiAgfVxuXG4gIG5vcm1hbGl6ZVNlbGVjdGlvbnNJZk5lY2Vzc2FyeSgpIHtcbiAgICBpZiAodGhpcy50YXJnZXQgJiYgdGhpcy50YXJnZXQuaXNNb3Rpb24oKSAmJiB0aGlzLm1vZGUgPT09IFwidmlzdWFsXCIpIHtcbiAgICAgIHRoaXMuc3dyYXAubm9ybWFsaXplKHRoaXMuZWRpdG9yKVxuICAgIH1cbiAgfVxuXG4gIHN0YXJ0TXV0YXRpb24oZm4pIHtcbiAgICBpZiAodGhpcy5jYW5FYXJseVNlbGVjdCgpKSB7XG4gICAgICAvLyAtIFNraXAgc2VsZWN0aW9uIG5vcm1hbGl6YXRpb246IGFscmVhZHkgbm9ybWFsaXplZCBiZWZvcmUgQHNlbGVjdFRhcmdldCgpXG4gICAgICAvLyAtIE1hbnVhbCBjaGVja3BvaW50IGdyb3VwaW5nOiB0byBjcmVhdGUgY2hlY2twb2ludCBiZWZvcmUgQHNlbGVjdFRhcmdldCgpXG4gICAgICBmbigpXG4gICAgICB0aGlzLmVtaXRXaWxsRmluaXNoTXV0YXRpb24oKVxuICAgICAgdGhpcy5ncm91cENoYW5nZXNTaW5jZUJ1ZmZlckNoZWNrcG9pbnQoXCJ1bmRvXCIpXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMubm9ybWFsaXplU2VsZWN0aW9uc0lmTmVjZXNzYXJ5KClcbiAgICAgIHRoaXMuZWRpdG9yLnRyYW5zYWN0KCgpID0+IHtcbiAgICAgICAgZm4oKVxuICAgICAgICB0aGlzLmVtaXRXaWxsRmluaXNoTXV0YXRpb24oKVxuICAgICAgfSlcbiAgICB9XG5cbiAgICB0aGlzLmVtaXREaWRGaW5pc2hNdXRhdGlvbigpXG4gIH1cblxuICAvLyBNYWluXG4gIGV4ZWN1dGUoKSB7XG4gICAgdGhpcy5zdGFydE11dGF0aW9uKCgpID0+IHtcbiAgICAgIGlmICh0aGlzLnNlbGVjdFRhcmdldCgpKSB7XG4gICAgICAgIGNvbnN0IHNlbGVjdGlvbnMgPSB0aGlzLm11dGF0ZVNlbGVjdGlvbk9yZGVyZFxuICAgICAgICAgID8gdGhpcy5lZGl0b3IuZ2V0U2VsZWN0aW9uc09yZGVyZWRCeUJ1ZmZlclBvc2l0aW9uKClcbiAgICAgICAgICA6IHRoaXMuZWRpdG9yLmdldFNlbGVjdGlvbnMoKVxuXG4gICAgICAgIGZvciAoY29uc3Qgc2VsZWN0aW9uIG9mIHNlbGVjdGlvbnMpIHtcbiAgICAgICAgICB0aGlzLm11dGF0ZVNlbGVjdGlvbihzZWxlY3Rpb24pXG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5tdXRhdGlvbk1hbmFnZXIuc2V0Q2hlY2twb2ludChcImRpZC1maW5pc2hcIilcbiAgICAgICAgdGhpcy5yZXN0b3JlQ3Vyc29yUG9zaXRpb25zSWZOZWNlc3NhcnkoKVxuICAgICAgfVxuICAgIH0pXG5cbiAgICAvLyBFdmVuIHRob3VnaCB3ZSBmYWlsIHRvIHNlbGVjdCB0YXJnZXQgYW5kIGZhaWwgdG8gbXV0YXRlLFxuICAgIC8vIHdlIGhhdmUgdG8gcmV0dXJuIHRvIG5vcm1hbC1tb2RlIGZyb20gb3BlcmF0b3ItcGVuZGluZyBvciB2aXN1YWxcbiAgICB0aGlzLmFjdGl2YXRlTW9kZShcIm5vcm1hbFwiKVxuICB9XG5cbiAgLy8gUmV0dXJuIHRydWUgdW5sZXNzIGFsbCBzZWxlY3Rpb24gaXMgZW1wdHkuXG4gIHNlbGVjdFRhcmdldCgpIHtcbiAgICBpZiAodGhpcy50YXJnZXRTZWxlY3RlZCAhPSBudWxsKSB7XG4gICAgICByZXR1cm4gdGhpcy50YXJnZXRTZWxlY3RlZFxuICAgIH1cbiAgICB0aGlzLm11dGF0aW9uTWFuYWdlci5pbml0KHtzdGF5QnlNYXJrZXI6IHRoaXMuc3RheUJ5TWFya2VyfSlcblxuICAgIGlmICh0aGlzLnRhcmdldC5pc01vdGlvbigpICYmIHRoaXMubW9kZSA9PT0gXCJ2aXN1YWxcIikgdGhpcy50YXJnZXQud2lzZSA9IHRoaXMuc3VibW9kZVxuICAgIGlmICh0aGlzLndpc2UgIT0gbnVsbCkgdGhpcy50YXJnZXQuZm9yY2VXaXNlKHRoaXMud2lzZSlcblxuICAgIHRoaXMuZW1pdFdpbGxTZWxlY3RUYXJnZXQoKVxuXG4gICAgLy8gQWxsb3cgY3Vyc29yIHBvc2l0aW9uIGFkanVzdG1lbnQgJ29uLXdpbGwtc2VsZWN0LXRhcmdldCcgaG9vay5cbiAgICAvLyBzbyBjaGVja3BvaW50IGNvbWVzIEFGVEVSIEBlbWl0V2lsbFNlbGVjdFRhcmdldCgpXG4gICAgdGhpcy5tdXRhdGlvbk1hbmFnZXIuc2V0Q2hlY2twb2ludChcIndpbGwtc2VsZWN0XCIpXG5cbiAgICAvLyBOT1RFXG4gICAgLy8gU2luY2UgTW92ZVRvTmV4dE9jY3VycmVuY2UsIE1vdmVUb1ByZXZpb3VzT2NjdXJyZW5jZSBtb3Rpb24gbW92ZSBieVxuICAgIC8vICBvY2N1cnJlbmNlLW1hcmtlciwgb2NjdXJyZW5jZS1tYXJrZXIgaGFzIHRvIGJlIGNyZWF0ZWQgQkVGT1JFIGBAdGFyZ2V0LmV4ZWN1dGUoKWBcbiAgICAvLyBBbmQgd2hlbiByZXBlYXRlZCwgb2NjdXJyZW5jZSBwYXR0ZXJuIGlzIGFscmVhZHkgY2FjaGVkIGF0IEBwYXR0ZXJuRm9yT2NjdXJyZW5jZVxuICAgIGlmICh0aGlzLnJlcGVhdGVkICYmIHRoaXMub2NjdXJyZW5jZSAmJiAhdGhpcy5vY2N1cnJlbmNlTWFuYWdlci5oYXNNYXJrZXJzKCkpIHtcbiAgICAgIHRoaXMub2NjdXJyZW5jZU1hbmFnZXIuYWRkUGF0dGVybih0aGlzLnBhdHRlcm5Gb3JPY2N1cnJlbmNlLCB7b2NjdXJyZW5jZVR5cGU6IHRoaXMub2NjdXJyZW5jZVR5cGV9KVxuICAgIH1cblxuICAgIHRoaXMudGFyZ2V0LmV4ZWN1dGUoKVxuXG4gICAgdGhpcy5tdXRhdGlvbk1hbmFnZXIuc2V0Q2hlY2twb2ludChcImRpZC1zZWxlY3RcIilcbiAgICBpZiAodGhpcy5vY2N1cnJlbmNlKSB7XG4gICAgICAvLyBUbyByZXBvZWF0KGAuYCkgb3BlcmF0aW9uIHdoZXJlIG11bHRpcGxlIG9jY3VycmVuY2UgcGF0dGVybnMgd2FzIHNldC5cbiAgICAgIC8vIEhlcmUgd2Ugc2F2ZSBwYXR0ZXJucyB3aGljaCByZXByZXNlbnQgdW5pb25lZCByZWdleCB3aGljaCBAb2NjdXJyZW5jZU1hbmFnZXIga25vd3MuXG4gICAgICBpZiAoIXRoaXMucGF0dGVybkZvck9jY3VycmVuY2UpIHtcbiAgICAgICAgdGhpcy5wYXR0ZXJuRm9yT2NjdXJyZW5jZSA9IHRoaXMub2NjdXJyZW5jZU1hbmFnZXIuYnVpbGRQYXR0ZXJuKClcbiAgICAgIH1cblxuICAgICAgdGhpcy5vY2N1cnJlbmNlV2lzZSA9IHRoaXMud2lzZSB8fCBcImNoYXJhY3Rlcndpc2VcIlxuICAgICAgaWYgKHRoaXMub2NjdXJyZW5jZU1hbmFnZXIuc2VsZWN0KHRoaXMub2NjdXJyZW5jZVdpc2UpKSB7XG4gICAgICAgIHRoaXMub2NjdXJyZW5jZVNlbGVjdGVkID0gdHJ1ZVxuICAgICAgICB0aGlzLm11dGF0aW9uTWFuYWdlci5zZXRDaGVja3BvaW50KFwiZGlkLXNlbGVjdC1vY2N1cnJlbmNlXCIpXG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy50YXJnZXRTZWxlY3RlZCA9IHRoaXMudmltU3RhdGUuaGF2ZVNvbWVOb25FbXB0eVNlbGVjdGlvbigpIHx8IHRoaXMudGFyZ2V0Lm5hbWUgPT09IFwiRW1wdHlcIlxuICAgIGlmICh0aGlzLnRhcmdldFNlbGVjdGVkKSB7XG4gICAgICB0aGlzLmVtaXREaWRTZWxlY3RUYXJnZXQoKVxuICAgICAgdGhpcy5mbGFzaENoYW5nZUlmTmVjZXNzYXJ5KClcbiAgICAgIHRoaXMudHJhY2tDaGFuZ2VJZk5lY2Vzc2FyeSgpXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZW1pdERpZEZhaWxTZWxlY3RUYXJnZXQoKVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzLnRhcmdldFNlbGVjdGVkXG4gIH1cblxuICByZXN0b3JlQ3Vyc29yUG9zaXRpb25zSWZOZWNlc3NhcnkoKSB7XG4gICAgaWYgKCF0aGlzLnJlc3RvcmVQb3NpdGlvbnMpIHJldHVyblxuXG4gICAgY29uc3Qgc3RheSA9XG4gICAgICB0aGlzLnN0YXlBdFNhbWVQb3NpdGlvbiAhPSBudWxsXG4gICAgICAgID8gdGhpcy5zdGF5QXRTYW1lUG9zaXRpb25cbiAgICAgICAgOiB0aGlzLmdldENvbmZpZyh0aGlzLnN0YXlPcHRpb25OYW1lKSB8fCAodGhpcy5vY2N1cnJlbmNlU2VsZWN0ZWQgJiYgdGhpcy5nZXRDb25maWcoXCJzdGF5T25PY2N1cnJlbmNlXCIpKVxuICAgIGNvbnN0IHdpc2UgPSB0aGlzLm9jY3VycmVuY2VTZWxlY3RlZCA/IHRoaXMub2NjdXJyZW5jZVdpc2UgOiB0aGlzLnRhcmdldC53aXNlXG4gICAgY29uc3Qge3NldFRvRmlyc3RDaGFyYWN0ZXJPbkxpbmV3aXNlfSA9IHRoaXNcbiAgICB0aGlzLm11dGF0aW9uTWFuYWdlci5yZXN0b3JlQ3Vyc29yUG9zaXRpb25zKHtzdGF5LCB3aXNlLCBzZXRUb0ZpcnN0Q2hhcmFjdGVyT25MaW5ld2lzZX0pXG4gIH1cbn1cbk9wZXJhdG9yLnJlZ2lzdGVyKGZhbHNlKVxuXG5jbGFzcyBTZWxlY3RCYXNlIGV4dGVuZHMgT3BlcmF0b3Ige1xuICBmbGFzaFRhcmdldCA9IGZhbHNlXG4gIHJlY29yZGFibGUgPSBmYWxzZVxuXG4gIGV4ZWN1dGUoKSB7XG4gICAgdGhpcy5zdGFydE11dGF0aW9uKCgpID0+IHRoaXMuc2VsZWN0VGFyZ2V0KCkpXG5cbiAgICBpZiAodGhpcy50YXJnZXQuc2VsZWN0U3VjY2VlZGVkKSB7XG4gICAgICBpZiAodGhpcy50YXJnZXQuaXNUZXh0T2JqZWN0KCkpIHtcbiAgICAgICAgdGhpcy5lZGl0b3Iuc2Nyb2xsVG9DdXJzb3JQb3NpdGlvbigpXG4gICAgICB9XG4gICAgICBjb25zdCB3aXNlID0gdGhpcy5vY2N1cnJlbmNlU2VsZWN0ZWQgPyB0aGlzLm9jY3VycmVuY2VXaXNlIDogdGhpcy50YXJnZXQud2lzZVxuICAgICAgdGhpcy5hY3RpdmF0ZU1vZGVJZk5lY2Vzc2FyeShcInZpc3VhbFwiLCB3aXNlKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmNhbmNlbE9wZXJhdGlvbigpXG4gICAgfVxuICB9XG59XG5TZWxlY3RCYXNlLnJlZ2lzdGVyKGZhbHNlKVxuXG5jbGFzcyBTZWxlY3QgZXh0ZW5kcyBTZWxlY3RCYXNlIHtcbiAgZXhlY3V0ZSgpIHtcbiAgICBmb3IgKGNvbnN0ICRzZWxlY3Rpb24gb2YgdGhpcy5zd3JhcC5nZXRTZWxlY3Rpb25zKHRoaXMuZWRpdG9yKSkge1xuICAgICAgaWYgKCEkc2VsZWN0aW9uLmhhc1Byb3BlcnRpZXMoKSkgJHNlbGVjdGlvbi5zYXZlUHJvcGVydGllcygpXG4gICAgfVxuICAgIHN1cGVyLmV4ZWN1dGUoKVxuICB9XG59XG5TZWxlY3QucmVnaXN0ZXIoKVxuXG5jbGFzcyBTZWxlY3RMYXRlc3RDaGFuZ2UgZXh0ZW5kcyBTZWxlY3RCYXNlIHtcbiAgdGFyZ2V0ID0gXCJBTGF0ZXN0Q2hhbmdlXCJcbn1cblNlbGVjdExhdGVzdENoYW5nZS5yZWdpc3RlcigpXG5cbmNsYXNzIFNlbGVjdFByZXZpb3VzU2VsZWN0aW9uIGV4dGVuZHMgU2VsZWN0QmFzZSB7XG4gIHRhcmdldCA9IFwiUHJldmlvdXNTZWxlY3Rpb25cIlxufVxuU2VsZWN0UHJldmlvdXNTZWxlY3Rpb24ucmVnaXN0ZXIoKVxuXG5jbGFzcyBTZWxlY3RQZXJzaXN0ZW50U2VsZWN0aW9uIGV4dGVuZHMgU2VsZWN0QmFzZSB7XG4gIHRhcmdldCA9IFwiQVBlcnNpc3RlbnRTZWxlY3Rpb25cIlxuICBhY2NlcHRQZXJzaXN0ZW50U2VsZWN0aW9uID0gZmFsc2Vcbn1cblNlbGVjdFBlcnNpc3RlbnRTZWxlY3Rpb24ucmVnaXN0ZXIoKVxuXG5jbGFzcyBTZWxlY3RPY2N1cnJlbmNlIGV4dGVuZHMgU2VsZWN0QmFzZSB7XG4gIG9jY3VycmVuY2UgPSB0cnVlXG59XG5TZWxlY3RPY2N1cnJlbmNlLnJlZ2lzdGVyKClcblxuLy8gU2VsZWN0SW5WaXN1YWxNb2RlOiB1c2VkIGluIHZpc3VhbC1tb2RlXG4vLyBXaGVuIHRleHQtb2JqZWN0IGlzIGludm9rZWQgZnJvbSBub3JtYWwgb3Igdml1c2FsLW1vZGUsIG9wZXJhdGlvbiB3b3VsZCBiZVxuLy8gID0+IFNlbGVjdEluVmlzdWFsTW9kZSBvcGVyYXRvciB3aXRoIHRhcmdldD10ZXh0LW9iamVjdFxuLy8gV2hlbiBtb3Rpb24gaXMgaW52b2tlZCBmcm9tIHZpc3VhbC1tb2RlLCBvcGVyYXRpb24gd291bGQgYmVcbi8vICA9PiBTZWxlY3RJblZpc3VhbE1vZGUgb3BlcmF0b3Igd2l0aCB0YXJnZXQ9bW90aW9uKVxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIFNlbGVjdEluVmlzdWFsTW9kZSBpcyB1c2VkIGluIFRXTyBzaXR1YXRpb24uXG4vLyAtIHZpc3VhbC1tb2RlIG9wZXJhdGlvblxuLy8gICAtIGUuZzogYHYgbGAsIGBWIGpgLCBgdiBpIHBgLi4uXG4vLyAtIERpcmVjdGx5IGludm9rZSB0ZXh0LW9iamVjdCBmcm9tIG5vcm1hbC1tb2RlXG4vLyAgIC0gZS5nOiBJbnZva2UgYElubmVyIFBhcmFncmFwaGAgZnJvbSBjb21tYW5kLXBhbGV0dGUuXG5jbGFzcyBTZWxlY3RJblZpc3VhbE1vZGUgZXh0ZW5kcyBTZWxlY3RCYXNlIHtcbiAgYWNjZXB0UHJlc2V0T2NjdXJyZW5jZSA9IGZhbHNlXG4gIGFjY2VwdFBlcnNpc3RlbnRTZWxlY3Rpb24gPSBmYWxzZVxufVxuU2VsZWN0SW5WaXN1YWxNb2RlLnJlZ2lzdGVyKGZhbHNlKVxuXG4vLyBQZXJzaXN0ZW50IFNlbGVjdGlvblxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PVxuY2xhc3MgQ3JlYXRlUGVyc2lzdGVudFNlbGVjdGlvbiBleHRlbmRzIE9wZXJhdG9yIHtcbiAgZmxhc2hUYXJnZXQgPSBmYWxzZVxuICBzdGF5QXRTYW1lUG9zaXRpb24gPSB0cnVlXG4gIGFjY2VwdFByZXNldE9jY3VycmVuY2UgPSBmYWxzZVxuICBhY2NlcHRQZXJzaXN0ZW50U2VsZWN0aW9uID0gZmFsc2VcblxuICBtdXRhdGVTZWxlY3Rpb24oc2VsZWN0aW9uKSB7XG4gICAgdGhpcy5wZXJzaXN0ZW50U2VsZWN0aW9uLm1hcmtCdWZmZXJSYW5nZShzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKSlcbiAgfVxufVxuQ3JlYXRlUGVyc2lzdGVudFNlbGVjdGlvbi5yZWdpc3RlcigpXG5cbmNsYXNzIFRvZ2dsZVBlcnNpc3RlbnRTZWxlY3Rpb24gZXh0ZW5kcyBDcmVhdGVQZXJzaXN0ZW50U2VsZWN0aW9uIHtcbiAgaXNDb21wbGV0ZSgpIHtcbiAgICBjb25zdCBwb2ludCA9IHRoaXMuZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKClcbiAgICB0aGlzLm1hcmtlclRvUmVtb3ZlID0gdGhpcy5wZXJzaXN0ZW50U2VsZWN0aW9uLmdldE1hcmtlckF0UG9pbnQocG9pbnQpXG4gICAgcmV0dXJuIHRoaXMubWFya2VyVG9SZW1vdmUgfHwgc3VwZXIuaXNDb21wbGV0ZSgpXG4gIH1cblxuICBleGVjdXRlKCkge1xuICAgIGlmICh0aGlzLm1hcmtlclRvUmVtb3ZlKSB7XG4gICAgICB0aGlzLm1hcmtlclRvUmVtb3ZlLmRlc3Ryb3koKVxuICAgIH0gZWxzZSB7XG4gICAgICBzdXBlci5leGVjdXRlKClcbiAgICB9XG4gIH1cbn1cblRvZ2dsZVBlcnNpc3RlbnRTZWxlY3Rpb24ucmVnaXN0ZXIoKVxuXG4vLyBQcmVzZXQgT2NjdXJyZW5jZVxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PVxuY2xhc3MgVG9nZ2xlUHJlc2V0T2NjdXJyZW5jZSBleHRlbmRzIE9wZXJhdG9yIHtcbiAgdGFyZ2V0ID0gXCJFbXB0eVwiXG4gIGZsYXNoVGFyZ2V0ID0gZmFsc2VcbiAgYWNjZXB0UHJlc2V0T2NjdXJyZW5jZSA9IGZhbHNlXG4gIGFjY2VwdFBlcnNpc3RlbnRTZWxlY3Rpb24gPSBmYWxzZVxuICBvY2N1cnJlbmNlVHlwZSA9IFwiYmFzZVwiXG5cbiAgZXhlY3V0ZSgpIHtcbiAgICBjb25zdCBtYXJrZXIgPSB0aGlzLm9jY3VycmVuY2VNYW5hZ2VyLmdldE1hcmtlckF0UG9pbnQodGhpcy5lZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKSlcbiAgICBpZiAobWFya2VyKSB7XG4gICAgICB0aGlzLm9jY3VycmVuY2VNYW5hZ2VyLmRlc3Ryb3lNYXJrZXJzKFttYXJrZXJdKVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBpc05hcnJvd2VkID0gdGhpcy52aW1TdGF0ZS5tb2RlTWFuYWdlci5pc05hcnJvd2VkKClcblxuICAgICAgbGV0IHJlZ2V4XG4gICAgICBpZiAodGhpcy5tb2RlID09PSBcInZpc3VhbFwiICYmICFpc05hcnJvd2VkKSB7XG4gICAgICAgIHRoaXMub2NjdXJyZW5jZVR5cGUgPSBcImJhc2VcIlxuICAgICAgICByZWdleCA9IG5ldyBSZWdFeHAoXy5lc2NhcGVSZWdFeHAodGhpcy5lZGl0b3IuZ2V0U2VsZWN0ZWRUZXh0KCkpLCBcImdcIilcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlZ2V4ID0gdGhpcy5nZXRQYXR0ZXJuRm9yT2NjdXJyZW5jZVR5cGUodGhpcy5vY2N1cnJlbmNlVHlwZSlcbiAgICAgIH1cblxuICAgICAgdGhpcy5vY2N1cnJlbmNlTWFuYWdlci5hZGRQYXR0ZXJuKHJlZ2V4LCB7b2NjdXJyZW5jZVR5cGU6IHRoaXMub2NjdXJyZW5jZVR5cGV9KVxuICAgICAgdGhpcy5vY2N1cnJlbmNlTWFuYWdlci5zYXZlTGFzdFBhdHRlcm4odGhpcy5vY2N1cnJlbmNlVHlwZSlcblxuICAgICAgaWYgKCFpc05hcnJvd2VkKSB0aGlzLmFjdGl2YXRlTW9kZShcIm5vcm1hbFwiKVxuICAgIH1cbiAgfVxufVxuVG9nZ2xlUHJlc2V0T2NjdXJyZW5jZS5yZWdpc3RlcigpXG5cbmNsYXNzIFRvZ2dsZVByZXNldFN1YndvcmRPY2N1cnJlbmNlIGV4dGVuZHMgVG9nZ2xlUHJlc2V0T2NjdXJyZW5jZSB7XG4gIG9jY3VycmVuY2VUeXBlID0gXCJzdWJ3b3JkXCJcbn1cblRvZ2dsZVByZXNldFN1YndvcmRPY2N1cnJlbmNlLnJlZ2lzdGVyKClcblxuLy8gV2FudCB0byByZW5hbWUgUmVzdG9yZU9jY3VycmVuY2VNYXJrZXJcbmNsYXNzIEFkZFByZXNldE9jY3VycmVuY2VGcm9tTGFzdE9jY3VycmVuY2VQYXR0ZXJuIGV4dGVuZHMgVG9nZ2xlUHJlc2V0T2NjdXJyZW5jZSB7XG4gIGV4ZWN1dGUoKSB7XG4gICAgdGhpcy5vY2N1cnJlbmNlTWFuYWdlci5yZXNldFBhdHRlcm5zKClcbiAgICBjb25zdCByZWdleCA9IHRoaXMuZ2xvYmFsU3RhdGUuZ2V0KFwibGFzdE9jY3VycmVuY2VQYXR0ZXJuXCIpXG4gICAgaWYgKHJlZ2V4KSB7XG4gICAgICBjb25zdCBvY2N1cnJlbmNlVHlwZSA9IHRoaXMuZ2xvYmFsU3RhdGUuZ2V0KFwibGFzdE9jY3VycmVuY2VUeXBlXCIpXG4gICAgICB0aGlzLm9jY3VycmVuY2VNYW5hZ2VyLmFkZFBhdHRlcm4ocmVnZXgsIHtvY2N1cnJlbmNlVHlwZX0pXG4gICAgICB0aGlzLmFjdGl2YXRlTW9kZShcIm5vcm1hbFwiKVxuICAgIH1cbiAgfVxufVxuQWRkUHJlc2V0T2NjdXJyZW5jZUZyb21MYXN0T2NjdXJyZW5jZVBhdHRlcm4ucmVnaXN0ZXIoKVxuXG4vLyBEZWxldGVcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5jbGFzcyBEZWxldGUgZXh0ZW5kcyBPcGVyYXRvciB7XG4gIHRyYWNrQ2hhbmdlID0gdHJ1ZVxuICBmbGFzaENoZWNrcG9pbnQgPSBcImRpZC1zZWxlY3Qtb2NjdXJyZW5jZVwiXG4gIGZsYXNoVHlwZUZvck9jY3VycmVuY2UgPSBcIm9wZXJhdG9yLXJlbW92ZS1vY2N1cnJlbmNlXCJcbiAgc3RheU9wdGlvbk5hbWUgPSBcInN0YXlPbkRlbGV0ZVwiXG4gIHNldFRvRmlyc3RDaGFyYWN0ZXJPbkxpbmV3aXNlID0gdHJ1ZVxuXG4gIGV4ZWN1dGUoKSB7XG4gICAgdGhpcy5vbkRpZFNlbGVjdFRhcmdldCgoKSA9PiB7XG4gICAgICBpZiAodGhpcy5vY2N1cnJlbmNlU2VsZWN0ZWQgJiYgdGhpcy5vY2N1cnJlbmNlV2lzZSA9PT0gXCJsaW5ld2lzZVwiKSB7XG4gICAgICAgIHRoaXMuZmxhc2hUYXJnZXQgPSBmYWxzZVxuICAgICAgfVxuICAgIH0pXG5cbiAgICBpZiAodGhpcy50YXJnZXQud2lzZSA9PT0gXCJibG9ja3dpc2VcIikge1xuICAgICAgdGhpcy5yZXN0b3JlUG9zaXRpb25zID0gZmFsc2VcbiAgICB9XG4gICAgc3VwZXIuZXhlY3V0ZSgpXG4gIH1cblxuICBtdXRhdGVTZWxlY3Rpb24oc2VsZWN0aW9uKSB7XG4gICAgdGhpcy5zZXRUZXh0VG9SZWdpc3RlckZvclNlbGVjdGlvbihzZWxlY3Rpb24pXG4gICAgc2VsZWN0aW9uLmRlbGV0ZVNlbGVjdGVkVGV4dCgpXG4gIH1cbn1cbkRlbGV0ZS5yZWdpc3RlcigpXG5cbmNsYXNzIERlbGV0ZVJpZ2h0IGV4dGVuZHMgRGVsZXRlIHtcbiAgdGFyZ2V0ID0gXCJNb3ZlUmlnaHRcIlxufVxuRGVsZXRlUmlnaHQucmVnaXN0ZXIoKVxuXG5jbGFzcyBEZWxldGVMZWZ0IGV4dGVuZHMgRGVsZXRlIHtcbiAgdGFyZ2V0ID0gXCJNb3ZlTGVmdFwiXG59XG5EZWxldGVMZWZ0LnJlZ2lzdGVyKClcblxuY2xhc3MgRGVsZXRlVG9MYXN0Q2hhcmFjdGVyT2ZMaW5lIGV4dGVuZHMgRGVsZXRlIHtcbiAgdGFyZ2V0ID0gXCJNb3ZlVG9MYXN0Q2hhcmFjdGVyT2ZMaW5lXCJcblxuICBleGVjdXRlKCkge1xuICAgIHRoaXMub25EaWRTZWxlY3RUYXJnZXQoKCkgPT4ge1xuICAgICAgaWYgKHRoaXMudGFyZ2V0Lndpc2UgPT09IFwiYmxvY2t3aXNlXCIpIHtcbiAgICAgICAgZm9yIChjb25zdCBibG9ja3dpc2VTZWxlY3Rpb24gb2YgdGhpcy5nZXRCbG9ja3dpc2VTZWxlY3Rpb25zKCkpIHtcbiAgICAgICAgICBibG9ja3dpc2VTZWxlY3Rpb24uZXh0ZW5kTWVtYmVyU2VsZWN0aW9uc1RvRW5kT2ZMaW5lKClcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gICAgc3VwZXIuZXhlY3V0ZSgpXG4gIH1cbn1cbkRlbGV0ZVRvTGFzdENoYXJhY3Rlck9mTGluZS5yZWdpc3RlcigpXG5cbmNsYXNzIERlbGV0ZUxpbmUgZXh0ZW5kcyBEZWxldGUge1xuICB3aXNlID0gXCJsaW5ld2lzZVwiXG4gIHRhcmdldCA9IFwiTW92ZVRvUmVsYXRpdmVMaW5lXCJcbiAgZmxhc2hUYXJnZXQgPSBmYWxzZVxufVxuRGVsZXRlTGluZS5yZWdpc3RlcigpXG5cbi8vIFlhbmtcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIFlhbmsgZXh0ZW5kcyBPcGVyYXRvciB7XG4gIHRyYWNrQ2hhbmdlID0gdHJ1ZVxuICBzdGF5T3B0aW9uTmFtZSA9IFwic3RheU9uWWFua1wiXG5cbiAgbXV0YXRlU2VsZWN0aW9uKHNlbGVjdGlvbikge1xuICAgIHRoaXMuc2V0VGV4dFRvUmVnaXN0ZXJGb3JTZWxlY3Rpb24oc2VsZWN0aW9uKVxuICB9XG59XG5ZYW5rLnJlZ2lzdGVyKClcblxuY2xhc3MgWWFua0xpbmUgZXh0ZW5kcyBZYW5rIHtcbiAgd2lzZSA9IFwibGluZXdpc2VcIlxuICB0YXJnZXQgPSBcIk1vdmVUb1JlbGF0aXZlTGluZVwiXG59XG5ZYW5rTGluZS5yZWdpc3RlcigpXG5cbmNsYXNzIFlhbmtUb0xhc3RDaGFyYWN0ZXJPZkxpbmUgZXh0ZW5kcyBZYW5rIHtcbiAgdGFyZ2V0ID0gXCJNb3ZlVG9MYXN0Q2hhcmFjdGVyT2ZMaW5lXCJcbn1cbllhbmtUb0xhc3RDaGFyYWN0ZXJPZkxpbmUucmVnaXN0ZXIoKVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBbY3RybC1hXVxuY2xhc3MgSW5jcmVhc2UgZXh0ZW5kcyBPcGVyYXRvciB7XG4gIHRhcmdldCA9IFwiRW1wdHlcIiAvLyBjdHJsLWEgaW4gbm9ybWFsLW1vZGUgZmluZCB0YXJnZXQgbnVtYmVyIGluIGN1cnJlbnQgbGluZSBtYW51YWxseVxuICBmbGFzaFRhcmdldCA9IGZhbHNlIC8vIGRvIG1hbnVhbGx5XG4gIHJlc3RvcmVQb3NpdGlvbnMgPSBmYWxzZSAvLyBkbyBtYW51YWxseVxuICBzdGVwID0gMVxuXG4gIGV4ZWN1dGUoKSB7XG4gICAgdGhpcy5uZXdSYW5nZXMgPSBbXVxuICAgIGlmICghdGhpcy5yZWdleCkgdGhpcy5yZWdleCA9IG5ldyBSZWdFeHAoYCR7dGhpcy5nZXRDb25maWcoXCJudW1iZXJSZWdleFwiKX1gLCBcImdcIilcblxuICAgIHN1cGVyLmV4ZWN1dGUoKVxuXG4gICAgaWYgKHRoaXMubmV3UmFuZ2VzLmxlbmd0aCkge1xuICAgICAgaWYgKHRoaXMuZ2V0Q29uZmlnKFwiZmxhc2hPbk9wZXJhdGVcIikgJiYgIXRoaXMuZ2V0Q29uZmlnKFwiZmxhc2hPbk9wZXJhdGVCbGFja2xpc3RcIikuaW5jbHVkZXModGhpcy5uYW1lKSkge1xuICAgICAgICB0aGlzLnZpbVN0YXRlLmZsYXNoKHRoaXMubmV3UmFuZ2VzLCB7dHlwZTogdGhpcy5mbGFzaFR5cGVGb3JPY2N1cnJlbmNlfSlcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXBsYWNlTnVtYmVySW5CdWZmZXJSYW5nZShzY2FuUmFuZ2UsIGZuKSB7XG4gICAgY29uc3QgbmV3UmFuZ2VzID0gW11cbiAgICB0aGlzLnNjYW5Gb3J3YXJkKHRoaXMucmVnZXgsIHtzY2FuUmFuZ2V9LCBldmVudCA9PiB7XG4gICAgICBpZiAoZm4pIHtcbiAgICAgICAgaWYgKGZuKGV2ZW50KSkgZXZlbnQuc3RvcCgpXG4gICAgICAgIGVsc2UgcmV0dXJuXG4gICAgICB9XG4gICAgICBjb25zdCBuZXh0TnVtYmVyID0gdGhpcy5nZXROZXh0TnVtYmVyKGV2ZW50Lm1hdGNoVGV4dClcbiAgICAgIG5ld1Jhbmdlcy5wdXNoKGV2ZW50LnJlcGxhY2UoU3RyaW5nKG5leHROdW1iZXIpKSlcbiAgICB9KVxuICAgIHJldHVybiBuZXdSYW5nZXNcbiAgfVxuXG4gIG11dGF0ZVNlbGVjdGlvbihzZWxlY3Rpb24pIHtcbiAgICBjb25zdCB7Y3Vyc29yfSA9IHNlbGVjdGlvblxuICAgIGlmICh0aGlzLnRhcmdldC5pcyhcIkVtcHR5XCIpKSB7XG4gICAgICAvLyBjdHJsLWEsIGN0cmwteCBpbiBgbm9ybWFsLW1vZGVgXG4gICAgICBjb25zdCBjdXJzb3JQb3NpdGlvbiA9IGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXG4gICAgICBjb25zdCBzY2FuUmFuZ2UgPSB0aGlzLmVkaXRvci5idWZmZXJSYW5nZUZvckJ1ZmZlclJvdyhjdXJzb3JQb3NpdGlvbi5yb3cpXG4gICAgICBjb25zdCBuZXdSYW5nZXMgPSB0aGlzLnJlcGxhY2VOdW1iZXJJbkJ1ZmZlclJhbmdlKHNjYW5SYW5nZSwgZXZlbnQgPT5cbiAgICAgICAgZXZlbnQucmFuZ2UuZW5kLmlzR3JlYXRlclRoYW4oY3Vyc29yUG9zaXRpb24pXG4gICAgICApXG4gICAgICBjb25zdCBwb2ludCA9IChuZXdSYW5nZXMubGVuZ3RoICYmIG5ld1Jhbmdlc1swXS5lbmQudHJhbnNsYXRlKFswLCAtMV0pKSB8fCBjdXJzb3JQb3NpdGlvblxuICAgICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHBvaW50KVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBzY2FuUmFuZ2UgPSBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKVxuICAgICAgdGhpcy5uZXdSYW5nZXMucHVzaCguLi50aGlzLnJlcGxhY2VOdW1iZXJJbkJ1ZmZlclJhbmdlKHNjYW5SYW5nZSkpXG4gICAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24oc2NhblJhbmdlLnN0YXJ0KVxuICAgIH1cbiAgfVxuXG4gIGdldE5leHROdW1iZXIobnVtYmVyU3RyaW5nKSB7XG4gICAgcmV0dXJuIE51bWJlci5wYXJzZUludChudW1iZXJTdHJpbmcsIDEwKSArIHRoaXMuc3RlcCAqIHRoaXMuZ2V0Q291bnQoKVxuICB9XG59XG5JbmNyZWFzZS5yZWdpc3RlcigpXG5cbi8vIFtjdHJsLXhdXG5jbGFzcyBEZWNyZWFzZSBleHRlbmRzIEluY3JlYXNlIHtcbiAgc3RlcCA9IC0xXG59XG5EZWNyZWFzZS5yZWdpc3RlcigpXG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFtnIGN0cmwtYV1cbmNsYXNzIEluY3JlbWVudE51bWJlciBleHRlbmRzIEluY3JlYXNlIHtcbiAgYmFzZU51bWJlciA9IG51bGxcbiAgdGFyZ2V0ID0gbnVsbFxuICBtdXRhdGVTZWxlY3Rpb25PcmRlcmQgPSB0cnVlXG5cbiAgZ2V0TmV4dE51bWJlcihudW1iZXJTdHJpbmcpIHtcbiAgICBpZiAodGhpcy5iYXNlTnVtYmVyICE9IG51bGwpIHtcbiAgICAgIHRoaXMuYmFzZU51bWJlciArPSB0aGlzLnN0ZXAgKiB0aGlzLmdldENvdW50KClcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5iYXNlTnVtYmVyID0gTnVtYmVyLnBhcnNlSW50KG51bWJlclN0cmluZywgMTApXG4gICAgfVxuICAgIHJldHVybiB0aGlzLmJhc2VOdW1iZXJcbiAgfVxufVxuSW5jcmVtZW50TnVtYmVyLnJlZ2lzdGVyKClcblxuLy8gW2cgY3RybC14XVxuY2xhc3MgRGVjcmVtZW50TnVtYmVyIGV4dGVuZHMgSW5jcmVtZW50TnVtYmVyIHtcbiAgc3RlcCA9IC0xXG59XG5EZWNyZW1lbnROdW1iZXIucmVnaXN0ZXIoKVxuXG4vLyBQdXRcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEN1cnNvciBwbGFjZW1lbnQ6XG4vLyAtIHBsYWNlIGF0IGVuZCBvZiBtdXRhdGlvbjogcGFzdGUgbm9uLW11bHRpbGluZSBjaGFyYWN0ZXJ3aXNlIHRleHRcbi8vIC0gcGxhY2UgYXQgc3RhcnQgb2YgbXV0YXRpb246IG5vbi1tdWx0aWxpbmUgY2hhcmFjdGVyd2lzZSB0ZXh0KGNoYXJhY3Rlcndpc2UsIGxpbmV3aXNlKVxuY2xhc3MgUHV0QmVmb3JlIGV4dGVuZHMgT3BlcmF0b3Ige1xuICBsb2NhdGlvbiA9IFwiYmVmb3JlXCJcbiAgdGFyZ2V0ID0gXCJFbXB0eVwiXG4gIGZsYXNoVHlwZSA9IFwib3BlcmF0b3ItbG9uZ1wiXG4gIHJlc3RvcmVQb3NpdGlvbnMgPSBmYWxzZSAvLyBtYW5hZ2UgbWFudWFsbHlcbiAgZmxhc2hUYXJnZXQgPSBmYWxzZSAvLyBtYW5hZ2UgbWFudWFsbHlcbiAgdHJhY2tDaGFuZ2UgPSBmYWxzZSAvLyBtYW5hZ2UgbWFudWFsbHlcblxuICBpbml0aWFsaXplKCkge1xuICAgIHRoaXMudmltU3RhdGUuc2VxdWVudGlhbFBhc3RlTWFuYWdlci5vbkluaXRpYWxpemUodGhpcylcbiAgICByZXR1cm4gc3VwZXIuaW5pdGlhbGl6ZSgpXG4gIH1cblxuICBleGVjdXRlKCkge1xuICAgIHRoaXMubXV0YXRpb25zQnlTZWxlY3Rpb24gPSBuZXcgTWFwKClcbiAgICB0aGlzLnNlcXVlbnRpYWxQYXN0ZSA9IHRoaXMudmltU3RhdGUuc2VxdWVudGlhbFBhc3RlTWFuYWdlci5vbkV4ZWN1dGUodGhpcylcblxuICAgIHRoaXMub25EaWRGaW5pc2hNdXRhdGlvbigoKSA9PiB7XG4gICAgICBpZiAoIXRoaXMuY2FuY2VsbGVkKSB0aGlzLmFkanVzdEN1cnNvclBvc2l0aW9uKClcbiAgICB9KVxuXG4gICAgc3VwZXIuZXhlY3V0ZSgpXG5cbiAgICBpZiAodGhpcy5jYW5jZWxsZWQpIHJldHVyblxuXG4gICAgdGhpcy5vbkRpZEZpbmlzaE9wZXJhdGlvbigoKSA9PiB7XG4gICAgICAvLyBUcmFja0NoYW5nZVxuICAgICAgY29uc3QgbmV3UmFuZ2UgPSB0aGlzLm11dGF0aW9uc0J5U2VsZWN0aW9uLmdldCh0aGlzLmVkaXRvci5nZXRMYXN0U2VsZWN0aW9uKCkpXG4gICAgICBpZiAobmV3UmFuZ2UpIHRoaXMuc2V0TWFya0ZvckNoYW5nZShuZXdSYW5nZSlcblxuICAgICAgLy8gRmxhc2hcbiAgICAgIGlmICh0aGlzLmdldENvbmZpZyhcImZsYXNoT25PcGVyYXRlXCIpICYmICF0aGlzLmdldENvbmZpZyhcImZsYXNoT25PcGVyYXRlQmxhY2tsaXN0XCIpLmluY2x1ZGVzKHRoaXMubmFtZSkpIHtcbiAgICAgICAgY29uc3QgcmFuZ2VzID0gdGhpcy5lZGl0b3IuZ2V0U2VsZWN0aW9ucygpLm1hcChzZWxlY3Rpb24gPT4gdGhpcy5tdXRhdGlvbnNCeVNlbGVjdGlvbi5nZXQoc2VsZWN0aW9uKSlcbiAgICAgICAgdGhpcy52aW1TdGF0ZS5mbGFzaChyYW5nZXMsIHt0eXBlOiB0aGlzLmdldEZsYXNoVHlwZSgpfSlcbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgYWRqdXN0Q3Vyc29yUG9zaXRpb24oKSB7XG4gICAgZm9yIChjb25zdCBzZWxlY3Rpb24gb2YgdGhpcy5lZGl0b3IuZ2V0U2VsZWN0aW9ucygpKSB7XG4gICAgICBpZiAoIXRoaXMubXV0YXRpb25zQnlTZWxlY3Rpb24uaGFzKHNlbGVjdGlvbikpIGNvbnRpbnVlXG5cbiAgICAgIGNvbnN0IHtjdXJzb3J9ID0gc2VsZWN0aW9uXG4gICAgICBjb25zdCBuZXdSYW5nZSA9IHRoaXMubXV0YXRpb25zQnlTZWxlY3Rpb24uZ2V0KHNlbGVjdGlvbilcbiAgICAgIGlmICh0aGlzLmxpbmV3aXNlUGFzdGUpIHtcbiAgICAgICAgbW92ZUN1cnNvclRvRmlyc3RDaGFyYWN0ZXJBdFJvdyhjdXJzb3IsIG5ld1JhbmdlLnN0YXJ0LnJvdylcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChuZXdSYW5nZS5pc1NpbmdsZUxpbmUoKSkge1xuICAgICAgICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihuZXdSYW5nZS5lbmQudHJhbnNsYXRlKFswLCAtMV0pKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihuZXdSYW5nZS5zdGFydClcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIG11dGF0ZVNlbGVjdGlvbihzZWxlY3Rpb24pIHtcbiAgICBjb25zdCB2YWx1ZSA9IHRoaXMudmltU3RhdGUucmVnaXN0ZXIuZ2V0KG51bGwsIHNlbGVjdGlvbiwgdGhpcy5zZXF1ZW50aWFsUGFzdGUpXG4gICAgaWYgKCF2YWx1ZS50ZXh0KSB7XG4gICAgICB0aGlzLmNhbmNlbGxlZCA9IHRydWVcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGNvbnN0IHRleHRUb1Bhc3RlID0gXy5tdWx0aXBseVN0cmluZyh2YWx1ZS50ZXh0LCB0aGlzLmdldENvdW50KCkpXG4gICAgdGhpcy5saW5ld2lzZVBhc3RlID0gdmFsdWUudHlwZSA9PT0gXCJsaW5ld2lzZVwiIHx8IHRoaXMuaXNNb2RlKFwidmlzdWFsXCIsIFwibGluZXdpc2VcIilcbiAgICBjb25zdCBuZXdSYW5nZSA9IHRoaXMucGFzdGUoc2VsZWN0aW9uLCB0ZXh0VG9QYXN0ZSwge2xpbmV3aXNlUGFzdGU6IHRoaXMubGluZXdpc2VQYXN0ZX0pXG4gICAgdGhpcy5tdXRhdGlvbnNCeVNlbGVjdGlvbi5zZXQoc2VsZWN0aW9uLCBuZXdSYW5nZSlcbiAgICB0aGlzLnZpbVN0YXRlLnNlcXVlbnRpYWxQYXN0ZU1hbmFnZXIuc2F2ZVBhc3RlZFJhbmdlRm9yU2VsZWN0aW9uKHNlbGVjdGlvbiwgbmV3UmFuZ2UpXG4gIH1cblxuICAvLyBSZXR1cm4gcGFzdGVkIHJhbmdlXG4gIHBhc3RlKHNlbGVjdGlvbiwgdGV4dCwge2xpbmV3aXNlUGFzdGV9KSB7XG4gICAgaWYgKHRoaXMuc2VxdWVudGlhbFBhc3RlKSB7XG4gICAgICByZXR1cm4gdGhpcy5wYXN0ZUNoYXJhY3Rlcndpc2Uoc2VsZWN0aW9uLCB0ZXh0KVxuICAgIH0gZWxzZSBpZiAobGluZXdpc2VQYXN0ZSkge1xuICAgICAgcmV0dXJuIHRoaXMucGFzdGVMaW5ld2lzZShzZWxlY3Rpb24sIHRleHQpXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLnBhc3RlQ2hhcmFjdGVyd2lzZShzZWxlY3Rpb24sIHRleHQpXG4gICAgfVxuICB9XG5cbiAgcGFzdGVDaGFyYWN0ZXJ3aXNlKHNlbGVjdGlvbiwgdGV4dCkge1xuICAgIGNvbnN0IHtjdXJzb3J9ID0gc2VsZWN0aW9uXG4gICAgaWYgKHNlbGVjdGlvbi5pc0VtcHR5KCkgJiYgdGhpcy5sb2NhdGlvbiA9PT0gXCJhZnRlclwiICYmICFpc0VtcHR5Um93KHRoaXMuZWRpdG9yLCBjdXJzb3IuZ2V0QnVmZmVyUm93KCkpKSB7XG4gICAgICBjdXJzb3IubW92ZVJpZ2h0KClcbiAgICB9XG4gICAgcmV0dXJuIHNlbGVjdGlvbi5pbnNlcnRUZXh0KHRleHQpXG4gIH1cblxuICAvLyBSZXR1cm4gbmV3UmFuZ2VcbiAgcGFzdGVMaW5ld2lzZShzZWxlY3Rpb24sIHRleHQpIHtcbiAgICBjb25zdCB7Y3Vyc29yfSA9IHNlbGVjdGlvblxuICAgIGNvbnN0IGN1cnNvclJvdyA9IGN1cnNvci5nZXRCdWZmZXJSb3coKVxuICAgIGlmICghdGV4dC5lbmRzV2l0aChcIlxcblwiKSkge1xuICAgICAgdGV4dCArPSBcIlxcblwiXG4gICAgfVxuICAgIGlmIChzZWxlY3Rpb24uaXNFbXB0eSgpKSB7XG4gICAgICBpZiAodGhpcy5sb2NhdGlvbiA9PT0gXCJiZWZvcmVcIikge1xuICAgICAgICByZXR1cm4gaW5zZXJ0VGV4dEF0QnVmZmVyUG9zaXRpb24odGhpcy5lZGl0b3IsIFtjdXJzb3JSb3csIDBdLCB0ZXh0KVxuICAgICAgfSBlbHNlIGlmICh0aGlzLmxvY2F0aW9uID09PSBcImFmdGVyXCIpIHtcbiAgICAgICAgY29uc3QgdGFyZ2V0Um93ID0gdGhpcy5nZXRGb2xkRW5kUm93Rm9yUm93KGN1cnNvclJvdylcbiAgICAgICAgZW5zdXJlRW5kc1dpdGhOZXdMaW5lRm9yQnVmZmVyUm93KHRoaXMuZWRpdG9yLCB0YXJnZXRSb3cpXG4gICAgICAgIHJldHVybiBpbnNlcnRUZXh0QXRCdWZmZXJQb3NpdGlvbih0aGlzLmVkaXRvciwgW3RhcmdldFJvdyArIDEsIDBdLCB0ZXh0KVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoIXRoaXMuaXNNb2RlKFwidmlzdWFsXCIsIFwibGluZXdpc2VcIikpIHtcbiAgICAgICAgc2VsZWN0aW9uLmluc2VydFRleHQoXCJcXG5cIilcbiAgICAgIH1cbiAgICAgIHJldHVybiBzZWxlY3Rpb24uaW5zZXJ0VGV4dCh0ZXh0KVxuICAgIH1cbiAgfVxufVxuUHV0QmVmb3JlLnJlZ2lzdGVyKClcblxuY2xhc3MgUHV0QWZ0ZXIgZXh0ZW5kcyBQdXRCZWZvcmUge1xuICBsb2NhdGlvbiA9IFwiYWZ0ZXJcIlxufVxuUHV0QWZ0ZXIucmVnaXN0ZXIoKVxuXG5jbGFzcyBQdXRCZWZvcmVXaXRoQXV0b0luZGVudCBleHRlbmRzIFB1dEJlZm9yZSB7XG4gIHBhc3RlTGluZXdpc2Uoc2VsZWN0aW9uLCB0ZXh0KSB7XG4gICAgY29uc3QgbmV3UmFuZ2UgPSBzdXBlci5wYXN0ZUxpbmV3aXNlKHNlbGVjdGlvbiwgdGV4dClcbiAgICBhZGp1c3RJbmRlbnRXaXRoS2VlcGluZ0xheW91dCh0aGlzLmVkaXRvciwgbmV3UmFuZ2UpXG4gICAgcmV0dXJuIG5ld1JhbmdlXG4gIH1cbn1cblB1dEJlZm9yZVdpdGhBdXRvSW5kZW50LnJlZ2lzdGVyKClcblxuY2xhc3MgUHV0QWZ0ZXJXaXRoQXV0b0luZGVudCBleHRlbmRzIFB1dEJlZm9yZVdpdGhBdXRvSW5kZW50IHtcbiAgbG9jYXRpb24gPSBcImFmdGVyXCJcbn1cblB1dEFmdGVyV2l0aEF1dG9JbmRlbnQucmVnaXN0ZXIoKVxuXG5jbGFzcyBBZGRCbGFua0xpbmVCZWxvdyBleHRlbmRzIE9wZXJhdG9yIHtcbiAgZmxhc2hUYXJnZXQgPSBmYWxzZVxuICB0YXJnZXQgPSBcIkVtcHR5XCJcbiAgc3RheUF0U2FtZVBvc2l0aW9uID0gdHJ1ZVxuICBzdGF5QnlNYXJrZXIgPSB0cnVlXG4gIHdoZXJlID0gXCJiZWxvd1wiXG5cbiAgbXV0YXRlU2VsZWN0aW9uKHNlbGVjdGlvbikge1xuICAgIGNvbnN0IHBvaW50ID0gc2VsZWN0aW9uLmdldEhlYWRCdWZmZXJQb3NpdGlvbigpXG4gICAgaWYgKHRoaXMud2hlcmUgPT09IFwiYmVsb3dcIikgcG9pbnQucm93KytcbiAgICBwb2ludC5jb2x1bW4gPSAwXG4gICAgdGhpcy5lZGl0b3Iuc2V0VGV4dEluQnVmZmVyUmFuZ2UoW3BvaW50LCBwb2ludF0sIFwiXFxuXCIucmVwZWF0KHRoaXMuZ2V0Q291bnQoKSkpXG4gIH1cbn1cbkFkZEJsYW5rTGluZUJlbG93LnJlZ2lzdGVyKClcblxuY2xhc3MgQWRkQmxhbmtMaW5lQWJvdmUgZXh0ZW5kcyBBZGRCbGFua0xpbmVCZWxvdyB7XG4gIHdoZXJlID0gXCJhYm92ZVwiXG59XG5BZGRCbGFua0xpbmVBYm92ZS5yZWdpc3RlcigpXG4iXX0=