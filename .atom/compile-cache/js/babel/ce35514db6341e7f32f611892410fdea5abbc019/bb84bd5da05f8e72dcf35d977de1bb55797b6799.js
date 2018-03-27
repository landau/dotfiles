"use babel";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _ = require("underscore-plus");

var _require = require("atom");

var Range = _require.Range;

var Operator = require("./base").getClass("Operator");

// Operator which start 'insert-mode'
// -------------------------
// [NOTE]
// Rule: Don't make any text mutation before calling `@selectTarget()`.

var ActivateInsertModeBase = (function (_Operator) {
  _inherits(ActivateInsertModeBase, _Operator);

  function ActivateInsertModeBase() {
    _classCallCheck(this, ActivateInsertModeBase);

    _get(Object.getPrototypeOf(ActivateInsertModeBase.prototype), "constructor", this).apply(this, arguments);

    this.flashTarget = false;
    this.finalSubmode = null;
    this.supportInsertionCount = true;
  }

  _createClass(ActivateInsertModeBase, [{
    key: "observeWillDeactivateMode",
    value: function observeWillDeactivateMode() {
      var _this = this;

      var disposable = this.vimState.modeManager.preemptWillDeactivateMode(function (_ref) {
        var mode = _ref.mode;

        if (mode !== "insert") return;
        disposable.dispose();

        _this.vimState.mark.set("^", _this.editor.getCursorBufferPosition()); // Last insert-mode position
        var textByUserInput = "";
        var change = _this.getChangeSinceCheckpoint("insert");
        if (change) {
          _this.lastChange = change;
          _this.setMarkForChange(new Range(change.start, change.start.traverse(change.newExtent)));
          textByUserInput = change.newText;
        }
        _this.vimState.register.set(".", { text: textByUserInput }); // Last inserted text

        _.times(_this.getInsertionCount(), function () {
          var textToInsert = _this.textByOperator + textByUserInput;
          for (var selection of _this.editor.getSelections()) {
            selection.insertText(textToInsert, { autoIndent: true });
          }
        });

        // This cursor state is restored on undo.
        // So cursor state has to be updated before next groupChangesSinceCheckpoint()
        if (_this.getConfig("clearMultipleCursorsOnEscapeInsertMode")) {
          _this.vimState.clearSelections();
        }

        // grouping changes for undo checkpoint need to come last
        if (_this.getConfig("groupChangesWhenLeavingInsertMode")) {
          _this.groupChangesSinceBufferCheckpoint("undo");
        }
      });
    }

    // When each mutaion's extent is not intersecting, muitiple changes are recorded
    // e.g
    //  - Multicursors edit
    //  - Cursor moved in insert-mode(e.g ctrl-f, ctrl-b)
    // But I don't care multiple changes just because I'm lazy(so not perfect implementation).
    // I only take care of one change happened at earliest(topCursor's change) position.
    // Thats' why I save topCursor's position to @topCursorPositionAtInsertionStart to compare traversal to deletionStart
    // Why I use topCursor's change? Just because it's easy to use first change returned by getChangeSinceCheckpoint().
  }, {
    key: "getChangeSinceCheckpoint",
    value: function getChangeSinceCheckpoint(purpose) {
      var checkpoint = this.getBufferCheckpoint(purpose);
      return this.editor.buffer.getChangesSinceCheckpoint(checkpoint)[0];
    }

    // [BUG-BUT-OK] Replaying text-deletion-operation is not compatible to pure Vim.
    // Pure Vim record all operation in insert-mode as keystroke level and can distinguish
    // character deleted by `Delete` or by `ctrl-u`.
    // But I can not and don't trying to minic this level of compatibility.
    // So basically deletion-done-in-one is expected to work well.
  }, {
    key: "replayLastChange",
    value: function replayLastChange(selection) {
      var textToInsert = undefined;
      if (this.lastChange != null) {
        var _lastChange = this.lastChange;
        var start = _lastChange.start;
        var newExtent = _lastChange.newExtent;
        var oldExtent = _lastChange.oldExtent;
        var newText = _lastChange.newText;

        if (!oldExtent.isZero()) {
          var traversalToStartOfDelete = start.traversalFrom(this.topCursorPositionAtInsertionStart);
          var deletionStart = selection.cursor.getBufferPosition().traverse(traversalToStartOfDelete);
          var deletionEnd = deletionStart.traverse(oldExtent);
          selection.setBufferRange([deletionStart, deletionEnd]);
        }
        textToInsert = newText;
      } else {
        textToInsert = "";
      }
      selection.insertText(textToInsert, { autoIndent: true });
    }

    // called when repeated
    // [FIXME] to use replayLastChange in repeatInsert overriding subclasss.
  }, {
    key: "repeatInsert",
    value: function repeatInsert(selection, text) {
      this.replayLastChange(selection);
    }
  }, {
    key: "getInsertionCount",
    value: function getInsertionCount() {
      if (this.insertionCount == null) {
        this.insertionCount = this.supportInsertionCount ? this.getCount(-1) : 0;
      }
      // Avoid freezing by acccidental big count(e.g. `5555555555555i`), See #560, #596
      return this.utils.limitNumber(this.insertionCount, { max: 100 });
    }
  }, {
    key: "execute",
    value: function execute() {
      var _this2 = this;

      if (this.repeated) {
        this.flashTarget = this.trackChange = true;

        this.startMutation(function () {
          if (_this2.target) _this2.selectTarget();
          if (_this2.mutateText) _this2.mutateText();

          for (var selection of _this2.editor.getSelections()) {
            var textToInsert = _this2.lastChange && _this2.lastChange.newText || "";
            _this2.repeatInsert(selection, textToInsert);
            _this2.utils.moveCursorLeft(selection.cursor);
          }
          _this2.mutationManager.setCheckpoint("did-finish");
        });

        if (this.getConfig("clearMultipleCursorsOnEscapeInsertMode")) this.vimState.clearSelections();
      } else {
        this.normalizeSelectionsIfNecessary();
        this.createBufferCheckpoint("undo");
        this.selectTarget();
        this.observeWillDeactivateMode();
        if (this.mutateText) this.mutateText();

        if (this.getInsertionCount() > 0) {
          var change = this.getChangeSinceCheckpoint("undo");
          this.textByOperator = change && change.newText || "";
        }

        this.createBufferCheckpoint("insert");
        var topCursor = this.editor.getCursorsOrderedByBufferPosition()[0];
        this.topCursorPositionAtInsertionStart = topCursor.getBufferPosition();

        // Skip normalization of blockwiseSelection.
        // Since want to keep multi-cursor and it's position in when shift to insert-mode.
        for (var blockwiseSelection of this.getBlockwiseSelections()) {
          blockwiseSelection.skipNormalization();
        }
        this.activateMode("insert", this.finalSubmode);
      }
    }
  }]);

  return ActivateInsertModeBase;
})(Operator);

ActivateInsertModeBase.register(false);

var ActivateInsertMode = (function (_ActivateInsertModeBase) {
  _inherits(ActivateInsertMode, _ActivateInsertModeBase);

  function ActivateInsertMode() {
    _classCallCheck(this, ActivateInsertMode);

    _get(Object.getPrototypeOf(ActivateInsertMode.prototype), "constructor", this).apply(this, arguments);

    this.target = "Empty";
    this.acceptPresetOccurrence = false;
    this.acceptPersistentSelection = false;
  }

  return ActivateInsertMode;
})(ActivateInsertModeBase);

ActivateInsertMode.register();

var ActivateReplaceMode = (function (_ActivateInsertMode) {
  _inherits(ActivateReplaceMode, _ActivateInsertMode);

  function ActivateReplaceMode() {
    _classCallCheck(this, ActivateReplaceMode);

    _get(Object.getPrototypeOf(ActivateReplaceMode.prototype), "constructor", this).apply(this, arguments);

    this.finalSubmode = "replace";
  }

  _createClass(ActivateReplaceMode, [{
    key: "repeatInsert",
    value: function repeatInsert(selection, text) {
      for (var char of text) {
        if (char === "\n") continue;
        if (selection.cursor.isAtEndOfLine()) break;
        selection.selectRight();
      }
      selection.insertText(text, { autoIndent: false });
    }
  }]);

  return ActivateReplaceMode;
})(ActivateInsertMode);

ActivateReplaceMode.register();

var InsertAfter = (function (_ActivateInsertMode2) {
  _inherits(InsertAfter, _ActivateInsertMode2);

  function InsertAfter() {
    _classCallCheck(this, InsertAfter);

    _get(Object.getPrototypeOf(InsertAfter.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(InsertAfter, [{
    key: "execute",
    value: function execute() {
      for (var cursor of this.editor.getCursors()) {
        this.utils.moveCursorRight(cursor);
      }
      _get(Object.getPrototypeOf(InsertAfter.prototype), "execute", this).call(this);
    }
  }]);

  return InsertAfter;
})(ActivateInsertMode);

InsertAfter.register();

// key: 'g I' in all mode

var InsertAtBeginningOfLine = (function (_ActivateInsertMode3) {
  _inherits(InsertAtBeginningOfLine, _ActivateInsertMode3);

  function InsertAtBeginningOfLine() {
    _classCallCheck(this, InsertAtBeginningOfLine);

    _get(Object.getPrototypeOf(InsertAtBeginningOfLine.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(InsertAtBeginningOfLine, [{
    key: "execute",
    value: function execute() {
      if (this.mode === "visual" && this.submode !== "blockwise") {
        this.editor.splitSelectionsIntoLines();
      }
      for (var blockwiseSelection of this.getBlockwiseSelections()) {
        blockwiseSelection.skipNormalization();
      }
      this.editor.moveToBeginningOfLine();
      _get(Object.getPrototypeOf(InsertAtBeginningOfLine.prototype), "execute", this).call(this);
    }
  }]);

  return InsertAtBeginningOfLine;
})(ActivateInsertMode);

InsertAtBeginningOfLine.register();

// key: normal 'A'

var InsertAfterEndOfLine = (function (_ActivateInsertMode4) {
  _inherits(InsertAfterEndOfLine, _ActivateInsertMode4);

  function InsertAfterEndOfLine() {
    _classCallCheck(this, InsertAfterEndOfLine);

    _get(Object.getPrototypeOf(InsertAfterEndOfLine.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(InsertAfterEndOfLine, [{
    key: "execute",
    value: function execute() {
      this.editor.moveToEndOfLine();
      _get(Object.getPrototypeOf(InsertAfterEndOfLine.prototype), "execute", this).call(this);
    }
  }]);

  return InsertAfterEndOfLine;
})(ActivateInsertMode);

InsertAfterEndOfLine.register();

// key: normal 'I'

var InsertAtFirstCharacterOfLine = (function (_ActivateInsertMode5) {
  _inherits(InsertAtFirstCharacterOfLine, _ActivateInsertMode5);

  function InsertAtFirstCharacterOfLine() {
    _classCallCheck(this, InsertAtFirstCharacterOfLine);

    _get(Object.getPrototypeOf(InsertAtFirstCharacterOfLine.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(InsertAtFirstCharacterOfLine, [{
    key: "execute",
    value: function execute() {
      this.editor.moveToBeginningOfLine();
      this.editor.moveToFirstCharacterOfLine();
      _get(Object.getPrototypeOf(InsertAtFirstCharacterOfLine.prototype), "execute", this).call(this);
    }
  }]);

  return InsertAtFirstCharacterOfLine;
})(ActivateInsertMode);

InsertAtFirstCharacterOfLine.register();

var InsertAtLastInsert = (function (_ActivateInsertMode6) {
  _inherits(InsertAtLastInsert, _ActivateInsertMode6);

  function InsertAtLastInsert() {
    _classCallCheck(this, InsertAtLastInsert);

    _get(Object.getPrototypeOf(InsertAtLastInsert.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(InsertAtLastInsert, [{
    key: "execute",
    value: function execute() {
      var point = this.vimState.mark.get("^");
      if (point) {
        this.editor.setCursorBufferPosition(point);
        this.editor.scrollToCursorPosition({ center: true });
      }
      _get(Object.getPrototypeOf(InsertAtLastInsert.prototype), "execute", this).call(this);
    }
  }]);

  return InsertAtLastInsert;
})(ActivateInsertMode);

InsertAtLastInsert.register();

var InsertAboveWithNewline = (function (_ActivateInsertMode7) {
  _inherits(InsertAboveWithNewline, _ActivateInsertMode7);

  function InsertAboveWithNewline() {
    _classCallCheck(this, InsertAboveWithNewline);

    _get(Object.getPrototypeOf(InsertAboveWithNewline.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(InsertAboveWithNewline, [{
    key: "initialize",
    value: function initialize() {
      if (this.getConfig("groupChangesWhenLeavingInsertMode")) {
        this.originalCursorPositionMarker = this.editor.markBufferPosition(this.editor.getCursorBufferPosition());
      }
      _get(Object.getPrototypeOf(InsertAboveWithNewline.prototype), "initialize", this).call(this);
    }

    // This is for `o` and `O` operator.
    // On undo/redo put cursor at original point where user type `o` or `O`.
  }, {
    key: "groupChangesSinceBufferCheckpoint",
    value: function groupChangesSinceBufferCheckpoint(purpose) {
      var lastCursor = this.editor.getLastCursor();
      var cursorPosition = lastCursor.getBufferPosition();
      lastCursor.setBufferPosition(this.originalCursorPositionMarker.getHeadBufferPosition());
      this.originalCursorPositionMarker.destroy();

      _get(Object.getPrototypeOf(InsertAboveWithNewline.prototype), "groupChangesSinceBufferCheckpoint", this).call(this, purpose);

      lastCursor.setBufferPosition(cursorPosition);
    }
  }, {
    key: "autoIndentEmptyRows",
    value: function autoIndentEmptyRows() {
      for (var cursor of this.editor.getCursors()) {
        var row = cursor.getBufferRow();
        if (this.utils.isEmptyRow(this.editor, row)) {
          this.editor.autoIndentBufferRow(row);
        }
      }
    }
  }, {
    key: "mutateText",
    value: function mutateText() {
      this.editor.insertNewlineAbove();
      if (this.editor.autoIndent) {
        this.autoIndentEmptyRows();
      }
    }
  }, {
    key: "repeatInsert",
    value: function repeatInsert(selection, text) {
      selection.insertText(text.trimLeft(), { autoIndent: true });
    }
  }]);

  return InsertAboveWithNewline;
})(ActivateInsertMode);

InsertAboveWithNewline.register();

var InsertBelowWithNewline = (function (_InsertAboveWithNewline) {
  _inherits(InsertBelowWithNewline, _InsertAboveWithNewline);

  function InsertBelowWithNewline() {
    _classCallCheck(this, InsertBelowWithNewline);

    _get(Object.getPrototypeOf(InsertBelowWithNewline.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(InsertBelowWithNewline, [{
    key: "mutateText",
    value: function mutateText() {
      for (var cursor of this.editor.getCursors()) {
        this.utils.setBufferRow(cursor, this.getFoldEndRowForRow(cursor.getBufferRow()));
      }

      this.editor.insertNewlineBelow();
      if (this.editor.autoIndent) this.autoIndentEmptyRows();
    }
  }]);

  return InsertBelowWithNewline;
})(InsertAboveWithNewline);

InsertBelowWithNewline.register();

// Advanced Insertion
// -------------------------

var InsertByTarget = (function (_ActivateInsertModeBase2) {
  _inherits(InsertByTarget, _ActivateInsertModeBase2);

  function InsertByTarget() {
    _classCallCheck(this, InsertByTarget);

    _get(Object.getPrototypeOf(InsertByTarget.prototype), "constructor", this).apply(this, arguments);

    this.which = null;
  }

  _createClass(InsertByTarget, [{
    key: "initialize",
    // one of ['start', 'end', 'head', 'tail']

    value: function initialize() {
      // HACK
      // When g i is mapped to `insert-at-start-of-target`.
      // `g i 3 l` start insert at 3 column right position.
      // In this case, we don't want repeat insertion 3 times.
      // This @getCount() call cache number at the timing BEFORE '3' is specified.
      this.getCount();
      _get(Object.getPrototypeOf(InsertByTarget.prototype), "initialize", this).call(this);
    }
  }, {
    key: "execute",
    value: function execute() {
      var _this3 = this;

      this.onDidSelectTarget(function () {
        // In vC/vL, when occurrence marker was NOT selected,
        // it behave's very specially
        // vC: `I` and `A` behaves as shoft hand of `ctrl-v I` and `ctrl-v A`.
        // vL: `I` and `A` place cursors at each selected lines of start( or end ) of non-white-space char.
        if (!_this3.occurrenceSelected && _this3.mode === "visual" && _this3.submode !== "blockwise") {
          for (var $selection of _this3.swrap.getSelections(_this3.editor)) {
            $selection.normalize();
            $selection.applyWise("blockwise");
          }

          if (_this3.submode === "linewise") {
            for (var blockwiseSelection of _this3.getBlockwiseSelections()) {
              blockwiseSelection.expandMemberSelectionsOverLineWithTrimRange();
            }
          }
        }

        for (var $selection of _this3.swrap.getSelections(_this3.editor)) {
          $selection.setBufferPositionTo(_this3.which);
        }
      });
      _get(Object.getPrototypeOf(InsertByTarget.prototype), "execute", this).call(this);
    }
  }]);

  return InsertByTarget;
})(ActivateInsertModeBase);

InsertByTarget.register(false);

// key: 'I', Used in 'visual-mode.characterwise', visual-mode.blockwise

var InsertAtStartOfTarget = (function (_InsertByTarget) {
  _inherits(InsertAtStartOfTarget, _InsertByTarget);

  function InsertAtStartOfTarget() {
    _classCallCheck(this, InsertAtStartOfTarget);

    _get(Object.getPrototypeOf(InsertAtStartOfTarget.prototype), "constructor", this).apply(this, arguments);

    this.which = "start";
  }

  return InsertAtStartOfTarget;
})(InsertByTarget);

InsertAtStartOfTarget.register();

// key: 'A', Used in 'visual-mode.characterwise', 'visual-mode.blockwise'

var InsertAtEndOfTarget = (function (_InsertByTarget2) {
  _inherits(InsertAtEndOfTarget, _InsertByTarget2);

  function InsertAtEndOfTarget() {
    _classCallCheck(this, InsertAtEndOfTarget);

    _get(Object.getPrototypeOf(InsertAtEndOfTarget.prototype), "constructor", this).apply(this, arguments);

    this.which = "end";
  }

  return InsertAtEndOfTarget;
})(InsertByTarget);

InsertAtEndOfTarget.register();

var InsertAtHeadOfTarget = (function (_InsertByTarget3) {
  _inherits(InsertAtHeadOfTarget, _InsertByTarget3);

  function InsertAtHeadOfTarget() {
    _classCallCheck(this, InsertAtHeadOfTarget);

    _get(Object.getPrototypeOf(InsertAtHeadOfTarget.prototype), "constructor", this).apply(this, arguments);

    this.which = "head";
  }

  return InsertAtHeadOfTarget;
})(InsertByTarget);

InsertAtHeadOfTarget.register();

var InsertAtStartOfOccurrence = (function (_InsertAtStartOfTarget) {
  _inherits(InsertAtStartOfOccurrence, _InsertAtStartOfTarget);

  function InsertAtStartOfOccurrence() {
    _classCallCheck(this, InsertAtStartOfOccurrence);

    _get(Object.getPrototypeOf(InsertAtStartOfOccurrence.prototype), "constructor", this).apply(this, arguments);

    this.occurrence = true;
  }

  return InsertAtStartOfOccurrence;
})(InsertAtStartOfTarget);

InsertAtStartOfOccurrence.register();

var InsertAtEndOfOccurrence = (function (_InsertAtEndOfTarget) {
  _inherits(InsertAtEndOfOccurrence, _InsertAtEndOfTarget);

  function InsertAtEndOfOccurrence() {
    _classCallCheck(this, InsertAtEndOfOccurrence);

    _get(Object.getPrototypeOf(InsertAtEndOfOccurrence.prototype), "constructor", this).apply(this, arguments);

    this.occurrence = true;
  }

  return InsertAtEndOfOccurrence;
})(InsertAtEndOfTarget);

InsertAtEndOfOccurrence.register();

var InsertAtHeadOfOccurrence = (function (_InsertAtHeadOfTarget) {
  _inherits(InsertAtHeadOfOccurrence, _InsertAtHeadOfTarget);

  function InsertAtHeadOfOccurrence() {
    _classCallCheck(this, InsertAtHeadOfOccurrence);

    _get(Object.getPrototypeOf(InsertAtHeadOfOccurrence.prototype), "constructor", this).apply(this, arguments);

    this.occurrence = true;
  }

  return InsertAtHeadOfOccurrence;
})(InsertAtHeadOfTarget);

InsertAtHeadOfOccurrence.register();

var InsertAtStartOfSubwordOccurrence = (function (_InsertAtStartOfOccurrence) {
  _inherits(InsertAtStartOfSubwordOccurrence, _InsertAtStartOfOccurrence);

  function InsertAtStartOfSubwordOccurrence() {
    _classCallCheck(this, InsertAtStartOfSubwordOccurrence);

    _get(Object.getPrototypeOf(InsertAtStartOfSubwordOccurrence.prototype), "constructor", this).apply(this, arguments);

    this.occurrenceType = "subword";
  }

  return InsertAtStartOfSubwordOccurrence;
})(InsertAtStartOfOccurrence);

InsertAtStartOfSubwordOccurrence.register();

var InsertAtEndOfSubwordOccurrence = (function (_InsertAtEndOfOccurrence) {
  _inherits(InsertAtEndOfSubwordOccurrence, _InsertAtEndOfOccurrence);

  function InsertAtEndOfSubwordOccurrence() {
    _classCallCheck(this, InsertAtEndOfSubwordOccurrence);

    _get(Object.getPrototypeOf(InsertAtEndOfSubwordOccurrence.prototype), "constructor", this).apply(this, arguments);

    this.occurrenceType = "subword";
  }

  return InsertAtEndOfSubwordOccurrence;
})(InsertAtEndOfOccurrence);

InsertAtEndOfSubwordOccurrence.register();

var InsertAtHeadOfSubwordOccurrence = (function (_InsertAtHeadOfOccurrence) {
  _inherits(InsertAtHeadOfSubwordOccurrence, _InsertAtHeadOfOccurrence);

  function InsertAtHeadOfSubwordOccurrence() {
    _classCallCheck(this, InsertAtHeadOfSubwordOccurrence);

    _get(Object.getPrototypeOf(InsertAtHeadOfSubwordOccurrence.prototype), "constructor", this).apply(this, arguments);

    this.occurrenceType = "subword";
  }

  return InsertAtHeadOfSubwordOccurrence;
})(InsertAtHeadOfOccurrence);

InsertAtHeadOfSubwordOccurrence.register();

var InsertAtStartOfSmartWord = (function (_InsertByTarget4) {
  _inherits(InsertAtStartOfSmartWord, _InsertByTarget4);

  function InsertAtStartOfSmartWord() {
    _classCallCheck(this, InsertAtStartOfSmartWord);

    _get(Object.getPrototypeOf(InsertAtStartOfSmartWord.prototype), "constructor", this).apply(this, arguments);

    this.which = "start";
    this.target = "MoveToPreviousSmartWord";
  }

  return InsertAtStartOfSmartWord;
})(InsertByTarget);

InsertAtStartOfSmartWord.register();

var InsertAtEndOfSmartWord = (function (_InsertByTarget5) {
  _inherits(InsertAtEndOfSmartWord, _InsertByTarget5);

  function InsertAtEndOfSmartWord() {
    _classCallCheck(this, InsertAtEndOfSmartWord);

    _get(Object.getPrototypeOf(InsertAtEndOfSmartWord.prototype), "constructor", this).apply(this, arguments);

    this.which = "end";
    this.target = "MoveToEndOfSmartWord";
  }

  return InsertAtEndOfSmartWord;
})(InsertByTarget);

InsertAtEndOfSmartWord.register();

var InsertAtPreviousFoldStart = (function (_InsertByTarget6) {
  _inherits(InsertAtPreviousFoldStart, _InsertByTarget6);

  function InsertAtPreviousFoldStart() {
    _classCallCheck(this, InsertAtPreviousFoldStart);

    _get(Object.getPrototypeOf(InsertAtPreviousFoldStart.prototype), "constructor", this).apply(this, arguments);

    this.which = "start";
    this.target = "MoveToPreviousFoldStart";
  }

  return InsertAtPreviousFoldStart;
})(InsertByTarget);

InsertAtPreviousFoldStart.register();

var InsertAtNextFoldStart = (function (_InsertByTarget7) {
  _inherits(InsertAtNextFoldStart, _InsertByTarget7);

  function InsertAtNextFoldStart() {
    _classCallCheck(this, InsertAtNextFoldStart);

    _get(Object.getPrototypeOf(InsertAtNextFoldStart.prototype), "constructor", this).apply(this, arguments);

    this.which = "end";
    this.target = "MoveToNextFoldStart";
  }

  return InsertAtNextFoldStart;
})(InsertByTarget);

InsertAtNextFoldStart.register();

// -------------------------

var Change = (function (_ActivateInsertModeBase3) {
  _inherits(Change, _ActivateInsertModeBase3);

  function Change() {
    _classCallCheck(this, Change);

    _get(Object.getPrototypeOf(Change.prototype), "constructor", this).apply(this, arguments);

    this.trackChange = true;
    this.supportInsertionCount = false;
  }

  _createClass(Change, [{
    key: "mutateText",
    value: function mutateText() {
      // Allways dynamically determine selection wise wthout consulting target.wise
      // Reason: when `c i {`, wise is 'characterwise', but actually selected range is 'linewise'
      //   {
      //     a
      //   }
      var isLinewiseTarget = this.swrap.detectWise(this.editor) === "linewise";
      for (var selection of this.editor.getSelections()) {
        if (!this.getConfig("dontUpdateRegisterOnChangeOrSubstitute")) {
          this.setTextToRegisterForSelection(selection);
        }
        if (isLinewiseTarget) {
          selection.insertText("\n", { autoIndent: true });
          selection.cursor.moveLeft();
        } else {
          selection.insertText("", { autoIndent: true });
        }
      }
    }
  }]);

  return Change;
})(ActivateInsertModeBase);

Change.register();

var ChangeOccurrence = (function (_Change) {
  _inherits(ChangeOccurrence, _Change);

  function ChangeOccurrence() {
    _classCallCheck(this, ChangeOccurrence);

    _get(Object.getPrototypeOf(ChangeOccurrence.prototype), "constructor", this).apply(this, arguments);

    this.occurrence = true;
  }

  return ChangeOccurrence;
})(Change);

ChangeOccurrence.register();

var Substitute = (function (_Change2) {
  _inherits(Substitute, _Change2);

  function Substitute() {
    _classCallCheck(this, Substitute);

    _get(Object.getPrototypeOf(Substitute.prototype), "constructor", this).apply(this, arguments);

    this.target = "MoveRight";
  }

  return Substitute;
})(Change);

Substitute.register();

var SubstituteLine = (function (_Change3) {
  _inherits(SubstituteLine, _Change3);

  function SubstituteLine() {
    _classCallCheck(this, SubstituteLine);

    _get(Object.getPrototypeOf(SubstituteLine.prototype), "constructor", this).apply(this, arguments);

    this.wise = "linewise";
    this.target = "MoveToRelativeLine";
  }

  return SubstituteLine;
})(Change);

SubstituteLine.register();

// alias

var ChangeLine = (function (_SubstituteLine) {
  _inherits(ChangeLine, _SubstituteLine);

  function ChangeLine() {
    _classCallCheck(this, ChangeLine);

    _get(Object.getPrototypeOf(ChangeLine.prototype), "constructor", this).apply(this, arguments);
  }

  return ChangeLine;
})(SubstituteLine);

ChangeLine.register();

var ChangeToLastCharacterOfLine = (function (_Change4) {
  _inherits(ChangeToLastCharacterOfLine, _Change4);

  function ChangeToLastCharacterOfLine() {
    _classCallCheck(this, ChangeToLastCharacterOfLine);

    _get(Object.getPrototypeOf(ChangeToLastCharacterOfLine.prototype), "constructor", this).apply(this, arguments);

    this.target = "MoveToLastCharacterOfLine";
  }

  _createClass(ChangeToLastCharacterOfLine, [{
    key: "execute",
    value: function execute() {
      var _this4 = this;

      this.onDidSelectTarget(function () {
        if (_this4.target.wise === "blockwise") {
          for (var blockwiseSelection of _this4.getBlockwiseSelections()) {
            blockwiseSelection.extendMemberSelectionsToEndOfLine();
          }
        }
      });
      _get(Object.getPrototypeOf(ChangeToLastCharacterOfLine.prototype), "execute", this).call(this);
    }
  }]);

  return ChangeToLastCharacterOfLine;
})(Change);

ChangeToLastCharacterOfLine.register();
// [FIXME] to re-override target.wise in visual-mode
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL29wZXJhdG9yLWluc2VydC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxXQUFXLENBQUE7Ozs7Ozs7Ozs7QUFFWCxJQUFNLENBQUMsR0FBRyxPQUFPLENBQUMsaUJBQWlCLENBQUMsQ0FBQTs7ZUFDcEIsT0FBTyxDQUFDLE1BQU0sQ0FBQzs7SUFBeEIsS0FBSyxZQUFMLEtBQUs7O0FBQ1osSUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQTs7Ozs7OztJQU1qRCxzQkFBc0I7WUFBdEIsc0JBQXNCOztXQUF0QixzQkFBc0I7MEJBQXRCLHNCQUFzQjs7K0JBQXRCLHNCQUFzQjs7U0FDMUIsV0FBVyxHQUFHLEtBQUs7U0FDbkIsWUFBWSxHQUFHLElBQUk7U0FDbkIscUJBQXFCLEdBQUcsSUFBSTs7O2VBSHhCLHNCQUFzQjs7V0FLRCxxQ0FBRzs7O0FBQzFCLFVBQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLHlCQUF5QixDQUFDLFVBQUMsSUFBTSxFQUFLO1lBQVYsSUFBSSxHQUFMLElBQU0sQ0FBTCxJQUFJOztBQUMzRSxZQUFJLElBQUksS0FBSyxRQUFRLEVBQUUsT0FBTTtBQUM3QixrQkFBVSxDQUFDLE9BQU8sRUFBRSxDQUFBOztBQUVwQixjQUFLLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxNQUFLLE1BQU0sQ0FBQyx1QkFBdUIsRUFBRSxDQUFDLENBQUE7QUFDbEUsWUFBSSxlQUFlLEdBQUcsRUFBRSxDQUFBO0FBQ3hCLFlBQU0sTUFBTSxHQUFHLE1BQUssd0JBQXdCLENBQUMsUUFBUSxDQUFDLENBQUE7QUFDdEQsWUFBSSxNQUFNLEVBQUU7QUFDVixnQkFBSyxVQUFVLEdBQUcsTUFBTSxDQUFBO0FBQ3hCLGdCQUFL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QUEyQjtHQUFTLE1BQU07O0FBY2hELDJCQUEyQixDQUFDLFFBQVEsRUFBRSxDQUFBIiwiZmlsZSI6Ii9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL29wZXJhdG9yLWluc2VydC5qcyIsInNvdXJjZXNDb250ZW50IjpbIlwidXNlIGJhYmVsXCJcblxuY29uc3QgXyA9IHJlcXVpcmUoXCJ1bmRlcnNjb3JlLXBsdXNcIilcbmNvbnN0IHtSYW5nZX0gPSByZXF1aXJlKFwiYXRvbVwiKVxuY29uc3QgT3BlcmF0b3IgPSByZXF1aXJlKFwiLi9iYXNlXCIpLmdldENsYXNzKFwiT3BlcmF0b3JcIilcblxuLy8gT3BlcmF0b3Igd2hpY2ggc3RhcnQgJ2luc2VydC1tb2RlJ1xuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gW05PVEVdXG4vLyBSdWxlOiBEb24ndCBtYWtlIGFueSB0ZXh0IG11dGF0aW9uIGJlZm9yZSBjYWxsaW5nIGBAc2VsZWN0VGFyZ2V0KClgLlxuY2xhc3MgQWN0aXZhdGVJbnNlcnRNb2RlQmFzZSBleHRlbmRzIE9wZXJhdG9yIHtcbiAgZmxhc2hUYXJnZXQgPSBmYWxzZVxuICBmaW5hbFN1Ym1vZGUgPSBudWxsXG4gIHN1cHBvcnRJbnNlcnRpb25Db3VudCA9IHRydWVcblxuICBvYnNlcnZlV2lsbERlYWN0aXZhdGVNb2RlKCkge1xuICAgIGNvbnN0IGRpc3Bvc2FibGUgPSB0aGlzLnZpbVN0YXRlLm1vZGVNYW5hZ2VyLnByZWVtcHRXaWxsRGVhY3RpdmF0ZU1vZGUoKHttb2RlfSkgPT4ge1xuICAgICAgaWYgKG1vZGUgIT09IFwiaW5zZXJ0XCIpIHJldHVyblxuICAgICAgZGlzcG9zYWJsZS5kaXNwb3NlKClcblxuICAgICAgdGhpcy52aW1TdGF0ZS5tYXJrLnNldChcIl5cIiwgdGhpcy5lZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKSkgLy8gTGFzdCBpbnNlcnQtbW9kZSBwb3NpdGlvblxuICAgICAgbGV0IHRleHRCeVVzZXJJbnB1dCA9IFwiXCJcbiAgICAgIGNvbnN0IGNoYW5nZSA9IHRoaXMuZ2V0Q2hhbmdlU2luY2VDaGVja3BvaW50KFwiaW5zZXJ0XCIpXG4gICAgICBpZiAoY2hhbmdlKSB7XG4gICAgICAgIHRoaXMubGFzdENoYW5nZSA9IGNoYW5nZVxuICAgICAgICB0aGlzLnNldE1hcmtGb3JDaGFuZ2UobmV3IFJhbmdlKGNoYW5nZS5zdGFydCwgY2hhbmdlLnN0YXJ0LnRyYXZlcnNlKGNoYW5nZS5uZXdFeHRlbnQpKSlcbiAgICAgICAgdGV4dEJ5VXNlcklucHV0ID0gY2hhbmdlLm5ld1RleHRcbiAgICAgIH1cbiAgICAgIHRoaXMudmltU3RhdGUucmVnaXN0ZXIuc2V0KFwiLlwiLCB7dGV4dDogdGV4dEJ5VXNlcklucHV0fSkgLy8gTGFzdCBpbnNlcnRlZCB0ZXh0XG5cbiAgICAgIF8udGltZXModGhpcy5nZXRJbnNlcnRpb25Db3VudCgpLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHRleHRUb0luc2VydCA9IHRoaXMudGV4dEJ5T3BlcmF0b3IgKyB0ZXh0QnlVc2VySW5wdXRcbiAgICAgICAgZm9yIChjb25zdCBzZWxlY3Rpb24gb2YgdGhpcy5lZGl0b3IuZ2V0U2VsZWN0aW9ucygpKSB7XG4gICAgICAgICAgc2VsZWN0aW9uLmluc2VydFRleHQodGV4dFRvSW5zZXJ0LCB7YXV0b0luZGVudDogdHJ1ZX0pXG4gICAgICAgIH1cbiAgICAgIH0pXG5cbiAgICAgIC8vIFRoaXMgY3Vyc29yIHN0YXRlIGlzIHJlc3RvcmVkIG9uIHVuZG8uXG4gICAgICAvLyBTbyBjdXJzb3Igc3RhdGUgaGFzIHRvIGJlIHVwZGF0ZWQgYmVmb3JlIG5leHQgZ3JvdXBDaGFuZ2VzU2luY2VDaGVja3BvaW50KClcbiAgICAgIGlmICh0aGlzLmdldENvbmZpZyhcImNsZWFyTXVsdGlwbGVDdXJzb3JzT25Fc2NhcGVJbnNlcnRNb2RlXCIpKSB7XG4gICAgICAgIHRoaXMudmltU3RhdGUuY2xlYXJTZWxlY3Rpb25zKClcbiAgICAgIH1cblxuICAgICAgLy8gZ3JvdXBpbmcgY2hhbmdlcyBmb3IgdW5kbyBjaGVja3BvaW50IG5lZWQgdG8gY29tZSBsYXN0XG4gICAgICBpZiAodGhpcy5nZXRDb25maWcoXCJncm91cENoYW5nZXNXaGVuTGVhdmluZ0luc2VydE1vZGVcIikpIHtcbiAgICAgICAgdGhpcy5ncm91cENoYW5nZXNTaW5jZUJ1ZmZlckNoZWNrcG9pbnQoXCJ1bmRvXCIpXG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIC8vIFdoZW4gZWFjaCBtdXRhaW9uJ3MgZXh0ZW50IGlzIG5vdCBpbnRlcnNlY3RpbmcsIG11aXRpcGxlIGNoYW5nZXMgYXJlIHJlY29yZGVkXG4gIC8vIGUuZ1xuICAvLyAgLSBNdWx0aWN1cnNvcnMgZWRpdFxuICAvLyAgLSBDdXJzb3IgbW92ZWQgaW4gaW5zZXJ0LW1vZGUoZS5nIGN0cmwtZiwgY3RybC1iKVxuICAvLyBCdXQgSSBkb24ndCBjYXJlIG11bHRpcGxlIGNoYW5nZXMganVzdCBiZWNhdXNlIEknbSBsYXp5KHNvIG5vdCBwZXJmZWN0IGltcGxlbWVudGF0aW9uKS5cbiAgLy8gSSBvbmx5IHRha2UgY2FyZSBvZiBvbmUgY2hhbmdlIGhhcHBlbmVkIGF0IGVhcmxpZXN0KHRvcEN1cnNvcidzIGNoYW5nZSkgcG9zaXRpb24uXG4gIC8vIFRoYXRzJyB3aHkgSSBzYXZlIHRvcEN1cnNvcidzIHBvc2l0aW9uIHRvIEB0b3BDdXJzb3JQb3NpdGlvbkF0SW5zZXJ0aW9uU3RhcnQgdG8gY29tcGFyZSB0cmF2ZXJzYWwgdG8gZGVsZXRpb25TdGFydFxuICAvLyBXaHkgSSB1c2UgdG9wQ3Vyc29yJ3MgY2hhbmdlPyBKdXN0IGJlY2F1c2UgaXQncyBlYXN5IHRvIHVzZSBmaXJzdCBjaGFuZ2UgcmV0dXJuZWQgYnkgZ2V0Q2hhbmdlU2luY2VDaGVja3BvaW50KCkuXG4gIGdldENoYW5nZVNpbmNlQ2hlY2twb2ludChwdXJwb3NlKSB7XG4gICAgY29uc3QgY2hlY2twb2ludCA9IHRoaXMuZ2V0QnVmZmVyQ2hlY2twb2ludChwdXJwb3NlKVxuICAgIHJldHVybiB0aGlzLmVkaXRvci5idWZmZXIuZ2V0Q2hhbmdlc1NpbmNlQ2hlY2twb2ludChjaGVja3BvaW50KVswXVxuICB9XG5cbiAgLy8gW0JVRy1CVVQtT0tdIFJlcGxheWluZyB0ZXh0LWRlbGV0aW9uLW9wZXJhdGlvbiBpcyBub3QgY29tcGF0aWJsZSB0byBwdXJlIFZpbS5cbiAgLy8gUHVyZSBWaW0gcmVjb3JkIGFsbCBvcGVyYXRpb24gaW4gaW5zZXJ0LW1vZGUgYXMga2V5c3Ryb2tlIGxldmVsIGFuZCBjYW4gZGlzdGluZ3Vpc2hcbiAgLy8gY2hhcmFjdGVyIGRlbGV0ZWQgYnkgYERlbGV0ZWAgb3IgYnkgYGN0cmwtdWAuXG4gIC8vIEJ1dCBJIGNhbiBub3QgYW5kIGRvbid0IHRyeWluZyB0byBtaW5pYyB0aGlzIGxldmVsIG9mIGNvbXBhdGliaWxpdHkuXG4gIC8vIFNvIGJhc2ljYWxseSBkZWxldGlvbi1kb25lLWluLW9uZSBpcyBleHBlY3RlZCB0byB3b3JrIHdlbGwuXG4gIHJlcGxheUxhc3RDaGFuZ2Uoc2VsZWN0aW9uKSB7XG4gICAgbGV0IHRleHRUb0luc2VydFxuICAgIGlmICh0aGlzLmxhc3RDaGFuZ2UgIT0gbnVsbCkge1xuICAgICAgY29uc3Qge3N0YXJ0LCBuZXdFeHRlbnQsIG9sZEV4dGVudCwgbmV3VGV4dH0gPSB0aGlzLmxhc3RDaGFuZ2VcbiAgICAgIGlmICghb2xkRXh0ZW50LmlzWmVybygpKSB7XG4gICAgICAgIGNvbnN0IHRyYXZlcnNhbFRvU3RhcnRPZkRlbGV0ZSA9IHN0YXJ0LnRyYXZlcnNhbEZyb20odGhpcy50b3BDdXJzb3JQb3NpdGlvbkF0SW5zZXJ0aW9uU3RhcnQpXG4gICAgICAgIGNvbnN0IGRlbGV0aW9uU3RhcnQgPSBzZWxlY3Rpb24uY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKCkudHJhdmVyc2UodHJhdmVyc2FsVG9TdGFydE9mRGVsZXRlKVxuICAgICAgICBjb25zdCBkZWxldGlvbkVuZCA9IGRlbGV0aW9uU3RhcnQudHJhdmVyc2Uob2xkRXh0ZW50KVxuICAgICAgICBzZWxlY3Rpb24uc2V0QnVmZmVyUmFuZ2UoW2RlbGV0aW9uU3RhcnQsIGRlbGV0aW9uRW5kXSlcbiAgICAgIH1cbiAgICAgIHRleHRUb0luc2VydCA9IG5ld1RleHRcbiAgICB9IGVsc2Uge1xuICAgICAgdGV4dFRvSW5zZXJ0ID0gXCJcIlxuICAgIH1cbiAgICBzZWxlY3Rpb24uaW5zZXJ0VGV4dCh0ZXh0VG9JbnNlcnQsIHthdXRvSW5kZW50OiB0cnVlfSlcbiAgfVxuXG4gIC8vIGNhbGxlZCB3aGVuIHJlcGVhdGVkXG4gIC8vIFtGSVhNRV0gdG8gdXNlIHJlcGxheUxhc3RDaGFuZ2UgaW4gcmVwZWF0SW5zZXJ0IG92ZXJyaWRpbmcgc3ViY2xhc3NzLlxuICByZXBlYXRJbnNlcnQoc2VsZWN0aW9uLCB0ZXh0KSB7XG4gICAgdGhpcy5yZXBsYXlMYXN0Q2hhbmdlKHNlbGVjdGlvbilcbiAgfVxuXG4gIGdldEluc2VydGlvbkNvdW50KCkge1xuICAgIGlmICh0aGlzLmluc2VydGlvbkNvdW50ID09IG51bGwpIHtcbiAgICAgIHRoaXMuaW5zZXJ0aW9uQ291bnQgPSB0aGlzLnN1cHBvcnRJbnNlcnRpb25Db3VudCA/IHRoaXMuZ2V0Q291bnQoLTEpIDogMFxuICAgIH1cbiAgICAvLyBBdm9pZCBmcmVlemluZyBieSBhY2NjaWRlbnRhbCBiaWcgY291bnQoZS5nLiBgNTU1NTU1NTU1NTU1NWlgKSwgU2VlICM1NjAsICM1OTZcbiAgICByZXR1cm4gdGhpcy51dGlscy5saW1pdE51bWJlcih0aGlzLmluc2VydGlvbkNvdW50LCB7bWF4OiAxMDB9KVxuICB9XG5cbiAgZXhlY3V0ZSgpIHtcbiAgICBpZiAodGhpcy5yZXBlYXRlZCkge1xuICAgICAgdGhpcy5mbGFzaFRhcmdldCA9IHRoaXMudHJhY2tDaGFuZ2UgPSB0cnVlXG5cbiAgICAgIHRoaXMuc3RhcnRNdXRhdGlvbigoKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLnRhcmdldCkgdGhpcy5zZWxlY3RUYXJnZXQoKVxuICAgICAgICBpZiAodGhpcy5tdXRhdGVUZXh0KSB0aGlzLm11dGF0ZVRleHQoKVxuXG4gICAgICAgIGZvciAoY29uc3Qgc2VsZWN0aW9uIG9mIHRoaXMuZWRpdG9yLmdldFNlbGVjdGlvbnMoKSkge1xuICAgICAgICAgIGNvbnN0IHRleHRUb0luc2VydCA9ICh0aGlzLmxhc3RDaGFuZ2UgJiYgdGhpcy5sYXN0Q2hhbmdlLm5ld1RleHQpIHx8IFwiXCJcbiAgICAgICAgICB0aGlzLnJlcGVhdEluc2VydChzZWxlY3Rpb24sIHRleHRUb0luc2VydClcbiAgICAgICAgICB0aGlzLnV0aWxzLm1vdmVDdXJzb3JMZWZ0KHNlbGVjdGlvbi5jdXJzb3IpXG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5tdXRhdGlvbk1hbmFnZXIuc2V0Q2hlY2twb2ludChcImRpZC1maW5pc2hcIilcbiAgICAgIH0pXG5cbiAgICAgIGlmICh0aGlzLmdldENvbmZpZyhcImNsZWFyTXVsdGlwbGVDdXJzb3JzT25Fc2NhcGVJbnNlcnRNb2RlXCIpKSB0aGlzLnZpbVN0YXRlLmNsZWFyU2VsZWN0aW9ucygpXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMubm9ybWFsaXplU2VsZWN0aW9uc0lmTmVjZXNzYXJ5KClcbiAgICAgIHRoaXMuY3JlYXRlQnVmZmVyQ2hlY2twb2ludChcInVuZG9cIilcbiAgICAgIHRoaXMuc2VsZWN0VGFyZ2V0KClcbiAgICAgIHRoaXMub2JzZXJ2ZVdpbGxEZWFjdGl2YXRlTW9kZSgpXG4gICAgICBpZiAodGhpcy5tdXRhdGVUZXh0KSB0aGlzLm11dGF0ZVRleHQoKVxuXG4gICAgICBpZiAodGhpcy5nZXRJbnNlcnRpb25Db3VudCgpID4gMCkge1xuICAgICAgICBjb25zdCBjaGFuZ2UgPSB0aGlzLmdldENoYW5nZVNpbmNlQ2hlY2twb2ludChcInVuZG9cIilcbiAgICAgICAgdGhpcy50ZXh0QnlPcGVyYXRvciA9IChjaGFuZ2UgJiYgY2hhbmdlLm5ld1RleHQpIHx8IFwiXCJcbiAgICAgIH1cblxuICAgICAgdGhpcy5jcmVhdGVCdWZmZXJDaGVja3BvaW50KFwiaW5zZXJ0XCIpXG4gICAgICBjb25zdCB0b3BDdXJzb3IgPSB0aGlzLmVkaXRvci5nZXRDdXJzb3JzT3JkZXJlZEJ5QnVmZmVyUG9zaXRpb24oKVswXVxuICAgICAgdGhpcy50b3BDdXJzb3JQb3NpdGlvbkF0SW5zZXJ0aW9uU3RhcnQgPSB0b3BDdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuXG4gICAgICAvLyBTa2lwIG5vcm1hbGl6YXRpb24gb2YgYmxvY2t3aXNlU2VsZWN0aW9uLlxuICAgICAgLy8gU2luY2Ugd2FudCB0byBrZWVwIG11bHRpLWN1cnNvciBhbmQgaXQncyBwb3NpdGlvbiBpbiB3aGVuIHNoaWZ0IHRvIGluc2VydC1tb2RlLlxuICAgICAgZm9yIChjb25zdCBibG9ja3dpc2VTZWxlY3Rpb24gb2YgdGhpcy5nZXRCbG9ja3dpc2VTZWxlY3Rpb25zKCkpIHtcbiAgICAgICAgYmxvY2t3aXNlU2VsZWN0aW9uLnNraXBOb3JtYWxpemF0aW9uKClcbiAgICAgIH1cbiAgICAgIHRoaXMuYWN0aXZhdGVNb2RlKFwiaW5zZXJ0XCIsIHRoaXMuZmluYWxTdWJtb2RlKVxuICAgIH1cbiAgfVxufVxuQWN0aXZhdGVJbnNlcnRNb2RlQmFzZS5yZWdpc3RlcihmYWxzZSlcblxuY2xhc3MgQWN0aXZhdGVJbnNlcnRNb2RlIGV4dGVuZHMgQWN0aXZhdGVJbnNlcnRNb2RlQmFzZSB7XG4gIHRhcmdldCA9IFwiRW1wdHlcIlxuICBhY2NlcHRQcmVzZXRPY2N1cnJlbmNlID0gZmFsc2VcbiAgYWNjZXB0UGVyc2lzdGVudFNlbGVjdGlvbiA9IGZhbHNlXG59XG5BY3RpdmF0ZUluc2VydE1vZGUucmVnaXN0ZXIoKVxuXG5jbGFzcyBBY3RpdmF0ZVJlcGxhY2VNb2RlIGV4dGVuZHMgQWN0aXZhdGVJbnNlcnRNb2RlIHtcbiAgZmluYWxTdWJtb2RlID0gXCJyZXBsYWNlXCJcblxuICByZXBlYXRJbnNlcnQoc2VsZWN0aW9uLCB0ZXh0KSB7XG4gICAgZm9yIChjb25zdCBjaGFyIG9mIHRleHQpIHtcbiAgICAgIGlmIChjaGFyID09PSBcIlxcblwiKSBjb250aW51ZVxuICAgICAgaWYgKHNlbGVjdGlvbi5jdXJzb3IuaXNBdEVuZE9mTGluZSgpKSBicmVha1xuICAgICAgc2VsZWN0aW9uLnNlbGVjdFJpZ2h0KClcbiAgICB9XG4gICAgc2VsZWN0aW9uLmluc2VydFRleHQodGV4dCwge2F1dG9JbmRlbnQ6IGZhbHNlfSlcbiAgfVxufVxuQWN0aXZhdGVSZXBsYWNlTW9kZS5yZWdpc3RlcigpXG5cbmNsYXNzIEluc2VydEFmdGVyIGV4dGVuZHMgQWN0aXZhdGVJbnNlcnRNb2RlIHtcbiAgZXhlY3V0ZSgpIHtcbiAgICBmb3IgKGNvbnN0IGN1cnNvciBvZiB0aGlzLmVkaXRvci5nZXRDdXJzb3JzKCkpIHtcbiAgICAgIHRoaXMudXRpbHMubW92ZUN1cnNvclJpZ2h0KGN1cnNvcilcbiAgICB9XG4gICAgc3VwZXIuZXhlY3V0ZSgpXG4gIH1cbn1cbkluc2VydEFmdGVyLnJlZ2lzdGVyKClcblxuLy8ga2V5OiAnZyBJJyBpbiBhbGwgbW9kZVxuY2xhc3MgSW5zZXJ0QXRCZWdpbm5pbmdPZkxpbmUgZXh0ZW5kcyBBY3RpdmF0ZUluc2VydE1vZGUge1xuICBleGVjdXRlKCkge1xuICAgIGlmICh0aGlzLm1vZGUgPT09IFwidmlzdWFsXCIgJiYgdGhpcy5zdWJtb2RlICE9PSBcImJsb2Nrd2lzZVwiKSB7XG4gICAgICB0aGlzLmVkaXRvci5zcGxpdFNlbGVjdGlvbnNJbnRvTGluZXMoKVxuICAgIH1cbiAgICBmb3IgKGNvbnN0IGJsb2Nrd2lzZVNlbGVjdGlvbiBvZiB0aGlzLmdldEJsb2Nrd2lzZVNlbGVjdGlvbnMoKSkge1xuICAgICAgYmxvY2t3aXNlU2VsZWN0aW9uLnNraXBOb3JtYWxpemF0aW9uKClcbiAgICB9XG4gICAgdGhpcy5lZGl0b3IubW92ZVRvQmVnaW5uaW5nT2ZMaW5lKClcbiAgICBzdXBlci5leGVjdXRlKClcbiAgfVxufVxuSW5zZXJ0QXRCZWdpbm5pbmdPZkxpbmUucmVnaXN0ZXIoKVxuXG4vLyBrZXk6IG5vcm1hbCAnQSdcbmNsYXNzIEluc2VydEFmdGVyRW5kT2ZMaW5lIGV4dGVuZHMgQWN0aXZhdGVJbnNlcnRNb2RlIHtcbiAgZXhlY3V0ZSgpIHtcbiAgICB0aGlzLmVkaXRvci5tb3ZlVG9FbmRPZkxpbmUoKVxuICAgIHN1cGVyLmV4ZWN1dGUoKVxuICB9XG59XG5JbnNlcnRBZnRlckVuZE9mTGluZS5yZWdpc3RlcigpXG5cbi8vIGtleTogbm9ybWFsICdJJ1xuY2xhc3MgSW5zZXJ0QXRGaXJzdENoYXJhY3Rlck9mTGluZSBleHRlbmRzIEFjdGl2YXRlSW5zZXJ0TW9kZSB7XG4gIGV4ZWN1dGUoKSB7XG4gICAgdGhpcy5lZGl0b3IubW92ZVRvQmVnaW5uaW5nT2ZMaW5lKClcbiAgICB0aGlzLmVkaXRvci5tb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZSgpXG4gICAgc3VwZXIuZXhlY3V0ZSgpXG4gIH1cbn1cbkluc2VydEF0Rmlyc3RDaGFyYWN0ZXJPZkxpbmUucmVnaXN0ZXIoKVxuXG5jbGFzcyBJbnNlcnRBdExhc3RJbnNlcnQgZXh0ZW5kcyBBY3RpdmF0ZUluc2VydE1vZGUge1xuICBleGVjdXRlKCkge1xuICAgIGNvbnN0IHBvaW50ID0gdGhpcy52aW1TdGF0ZS5tYXJrLmdldChcIl5cIilcbiAgICBpZiAocG9pbnQpIHtcbiAgICAgIHRoaXMuZWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKHBvaW50KVxuICAgICAgdGhpcy5lZGl0b3Iuc2Nyb2xsVG9DdXJzb3JQb3NpdGlvbih7Y2VudGVyOiB0cnVlfSlcbiAgICB9XG4gICAgc3VwZXIuZXhlY3V0ZSgpXG4gIH1cbn1cbkluc2VydEF0TGFzdEluc2VydC5yZWdpc3RlcigpXG5cbmNsYXNzIEluc2VydEFib3ZlV2l0aE5ld2xpbmUgZXh0ZW5kcyBBY3RpdmF0ZUluc2VydE1vZGUge1xuICBpbml0aWFsaXplKCkge1xuICAgIGlmICh0aGlzLmdldENvbmZpZyhcImdyb3VwQ2hhbmdlc1doZW5MZWF2aW5nSW5zZXJ0TW9kZVwiKSkge1xuICAgICAgdGhpcy5vcmlnaW5hbEN1cnNvclBvc2l0aW9uTWFya2VyID0gdGhpcy5lZGl0b3IubWFya0J1ZmZlclBvc2l0aW9uKHRoaXMuZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCkpXG4gICAgfVxuICAgIHN1cGVyLmluaXRpYWxpemUoKVxuICB9XG5cbiAgLy8gVGhpcyBpcyBmb3IgYG9gIGFuZCBgT2Agb3BlcmF0b3IuXG4gIC8vIE9uIHVuZG8vcmVkbyBwdXQgY3Vyc29yIGF0IG9yaWdpbmFsIHBvaW50IHdoZXJlIHVzZXIgdHlwZSBgb2Agb3IgYE9gLlxuICBncm91cENoYW5nZXNTaW5jZUJ1ZmZlckNoZWNrcG9pbnQocHVycG9zZSkge1xuICAgIGNvbnN0IGxhc3RDdXJzb3IgPSB0aGlzLmVkaXRvci5nZXRMYXN0Q3Vyc29yKClcbiAgICBjb25zdCBjdXJzb3JQb3NpdGlvbiA9IGxhc3RDdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuICAgIGxhc3RDdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24odGhpcy5vcmlnaW5hbEN1cnNvclBvc2l0aW9uTWFya2VyLmdldEhlYWRCdWZmZXJQb3NpdGlvbigpKVxuICAgIHRoaXMub3JpZ2luYWxDdXJzb3JQb3NpdGlvbk1hcmtlci5kZXN0cm95KClcblxuICAgIHN1cGVyLmdyb3VwQ2hhbmdlc1NpbmNlQnVmZmVyQ2hlY2twb2ludChwdXJwb3NlKVxuXG4gICAgbGFzdEN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihjdXJzb3JQb3NpdGlvbilcbiAgfVxuXG4gIGF1dG9JbmRlbnRFbXB0eVJvd3MoKSB7XG4gICAgZm9yIChjb25zdCBjdXJzb3Igb2YgdGhpcy5lZGl0b3IuZ2V0Q3Vyc29ycygpKSB7XG4gICAgICBjb25zdCByb3cgPSBjdXJzb3IuZ2V0QnVmZmVyUm93KClcbiAgICAgIGlmICh0aGlzLnV0aWxzLmlzRW1wdHlSb3codGhpcy5lZGl0b3IsIHJvdykpIHtcbiAgICAgICAgdGhpcy5lZGl0b3IuYXV0b0luZGVudEJ1ZmZlclJvdyhyb3cpXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgbXV0YXRlVGV4dCgpIHtcbiAgICB0aGlzLmVkaXRvci5pbnNlcnROZXdsaW5lQWJvdmUoKVxuICAgIGlmICh0aGlzLmVkaXRvci5hdXRvSW5kZW50KSB7XG4gICAgICB0aGlzLmF1dG9JbmRlbnRFbXB0eVJvd3MoKVxuICAgIH1cbiAgfVxuXG4gIHJlcGVhdEluc2VydChzZWxlY3Rpb24sIHRleHQpIHtcbiAgICBzZWxlY3Rpb24uaW5zZXJ0VGV4dCh0ZXh0LnRyaW1MZWZ0KCksIHthdXRvSW5kZW50OiB0cnVlfSlcbiAgfVxufVxuSW5zZXJ0QWJvdmVXaXRoTmV3bGluZS5yZWdpc3RlcigpXG5cbmNsYXNzIEluc2VydEJlbG93V2l0aE5ld2xpbmUgZXh0ZW5kcyBJbnNlcnRBYm92ZVdpdGhOZXdsaW5lIHtcbiAgbXV0YXRlVGV4dCgpIHtcbiAgICBmb3IgKGNvbnN0IGN1cnNvciBvZiB0aGlzLmVkaXRvci5nZXRDdXJzb3JzKCkpIHtcbiAgICAgIHRoaXMudXRpbHMuc2V0QnVmZmVyUm93KGN1cnNvciwgdGhpcy5nZXRGb2xkRW5kUm93Rm9yUm93KGN1cnNvci5nZXRCdWZmZXJSb3coKSkpXG4gICAgfVxuXG4gICAgdGhpcy5lZGl0b3IuaW5zZXJ0TmV3bGluZUJlbG93KClcbiAgICBpZiAodGhpcy5lZGl0b3IuYXV0b0luZGVudCkgdGhpcy5hdXRvSW5kZW50RW1wdHlSb3dzKClcbiAgfVxufVxuSW5zZXJ0QmVsb3dXaXRoTmV3bGluZS5yZWdpc3RlcigpXG5cbi8vIEFkdmFuY2VkIEluc2VydGlvblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgSW5zZXJ0QnlUYXJnZXQgZXh0ZW5kcyBBY3RpdmF0ZUluc2VydE1vZGVCYXNlIHtcbiAgd2hpY2ggPSBudWxsIC8vIG9uZSBvZiBbJ3N0YXJ0JywgJ2VuZCcsICdoZWFkJywgJ3RhaWwnXVxuXG4gIGluaXRpYWxpemUoKSB7XG4gICAgLy8gSEFDS1xuICAgIC8vIFdoZW4gZyBpIGlzIG1hcHBlZCB0byBgaW5zZXJ0LWF0LXN0YXJ0LW9mLXRhcmdldGAuXG4gICAgLy8gYGcgaSAzIGxgIHN0YXJ0IGluc2VydCBhdCAzIGNvbHVtbiByaWdodCBwb3NpdGlvbi5cbiAgICAvLyBJbiB0aGlzIGNhc2UsIHdlIGRvbid0IHdhbnQgcmVwZWF0IGluc2VydGlvbiAzIHRpbWVzLlxuICAgIC8vIFRoaXMgQGdldENvdW50KCkgY2FsbCBjYWNoZSBudW1iZXIgYXQgdGhlIHRpbWluZyBCRUZPUkUgJzMnIGlzIHNwZWNpZmllZC5cbiAgICB0aGlzLmdldENvdW50KClcbiAgICBzdXBlci5pbml0aWFsaXplKClcbiAgfVxuXG4gIGV4ZWN1dGUoKSB7XG4gICAgdGhpcy5vbkRpZFNlbGVjdFRhcmdldCgoKSA9PiB7XG4gICAgICAvLyBJbiB2Qy92TCwgd2hlbiBvY2N1cnJlbmNlIG1hcmtlciB3YXMgTk9UIHNlbGVjdGVkLFxuICAgICAgLy8gaXQgYmVoYXZlJ3MgdmVyeSBzcGVjaWFsbHlcbiAgICAgIC8vIHZDOiBgSWAgYW5kIGBBYCBiZWhhdmVzIGFzIHNob2Z0IGhhbmQgb2YgYGN0cmwtdiBJYCBhbmQgYGN0cmwtdiBBYC5cbiAgICAgIC8vIHZMOiBgSWAgYW5kIGBBYCBwbGFjZSBjdXJzb3JzIGF0IGVhY2ggc2VsZWN0ZWQgbGluZXMgb2Ygc3RhcnQoIG9yIGVuZCApIG9mIG5vbi13aGl0ZS1zcGFjZSBjaGFyLlxuICAgICAgaWYgKCF0aGlzLm9jY3VycmVuY2VTZWxlY3RlZCAmJiB0aGlzLm1vZGUgPT09IFwidmlzdWFsXCIgJiYgdGhpcy5zdWJtb2RlICE9PSBcImJsb2Nrd2lzZVwiKSB7XG4gICAgICAgIGZvciAoY29uc3QgJHNlbGVjdGlvbiBvZiB0aGlzLnN3cmFwLmdldFNlbGVjdGlvbnModGhpcy5lZGl0b3IpKSB7XG4gICAgICAgICAgJHNlbGVjdGlvbi5ub3JtYWxpemUoKVxuICAgICAgICAgICRzZWxlY3Rpb24uYXBwbHlXaXNlKFwiYmxvY2t3aXNlXCIpXG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5zdWJtb2RlID09PSBcImxpbmV3aXNlXCIpIHtcbiAgICAgICAgICBmb3IgKGNvbnN0IGJsb2Nrd2lzZVNlbGVjdGlvbiBvZiB0aGlzLmdldEJsb2Nrd2lzZVNlbGVjdGlvbnMoKSkge1xuICAgICAgICAgICAgYmxvY2t3aXNlU2VsZWN0aW9uLmV4cGFuZE1lbWJlclNlbGVjdGlvbnNPdmVyTGluZVdpdGhUcmltUmFuZ2UoKVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBmb3IgKGNvbnN0ICRzZWxlY3Rpb24gb2YgdGhpcy5zd3JhcC5nZXRTZWxlY3Rpb25zKHRoaXMuZWRpdG9yKSkge1xuICAgICAgICAkc2VsZWN0aW9uLnNldEJ1ZmZlclBvc2l0aW9uVG8odGhpcy53aGljaClcbiAgICAgIH1cbiAgICB9KVxuICAgIHN1cGVyLmV4ZWN1dGUoKVxuICB9XG59XG5JbnNlcnRCeVRhcmdldC5yZWdpc3RlcihmYWxzZSlcblxuLy8ga2V5OiAnSScsIFVzZWQgaW4gJ3Zpc3VhbC1tb2RlLmNoYXJhY3Rlcndpc2UnLCB2aXN1YWwtbW9kZS5ibG9ja3dpc2VcbmNsYXNzIEluc2VydEF0U3RhcnRPZlRhcmdldCBleHRlbmRzIEluc2VydEJ5VGFyZ2V0IHtcbiAgd2hpY2ggPSBcInN0YXJ0XCJcbn1cbkluc2VydEF0U3RhcnRPZlRhcmdldC5yZWdpc3RlcigpXG5cbi8vIGtleTogJ0EnLCBVc2VkIGluICd2aXN1YWwtbW9kZS5jaGFyYWN0ZXJ3aXNlJywgJ3Zpc3VhbC1tb2RlLmJsb2Nrd2lzZSdcbmNsYXNzIEluc2VydEF0RW5kT2ZUYXJnZXQgZXh0ZW5kcyBJbnNlcnRCeVRhcmdldCB7XG4gIHdoaWNoID0gXCJlbmRcIlxufVxuSW5zZXJ0QXRFbmRPZlRhcmdldC5yZWdpc3RlcigpXG5cbmNsYXNzIEluc2VydEF0SGVhZE9mVGFyZ2V0IGV4dGVuZHMgSW5zZXJ0QnlUYXJnZXQge1xuICB3aGljaCA9IFwiaGVhZFwiXG59XG5JbnNlcnRBdEhlYWRPZlRhcmdldC5yZWdpc3RlcigpXG5cbmNsYXNzIEluc2VydEF0U3RhcnRPZk9jY3VycmVuY2UgZXh0ZW5kcyBJbnNlcnRBdFN0YXJ0T2ZUYXJnZXQge1xuICBvY2N1cnJlbmNlID0gdHJ1ZVxufVxuSW5zZXJ0QXRTdGFydE9mT2NjdXJyZW5jZS5yZWdpc3RlcigpXG5cbmNsYXNzIEluc2VydEF0RW5kT2ZPY2N1cnJlbmNlIGV4dGVuZHMgSW5zZXJ0QXRFbmRPZlRhcmdldCB7XG4gIG9jY3VycmVuY2UgPSB0cnVlXG59XG5JbnNlcnRBdEVuZE9mT2NjdXJyZW5jZS5yZWdpc3RlcigpXG5cbmNsYXNzIEluc2VydEF0SGVhZE9mT2NjdXJyZW5jZSBleHRlbmRzIEluc2VydEF0SGVhZE9mVGFyZ2V0IHtcbiAgb2NjdXJyZW5jZSA9IHRydWVcbn1cbkluc2VydEF0SGVhZE9mT2NjdXJyZW5jZS5yZWdpc3RlcigpXG5cbmNsYXNzIEluc2VydEF0U3RhcnRPZlN1YndvcmRPY2N1cnJlbmNlIGV4dGVuZHMgSW5zZXJ0QXRTdGFydE9mT2NjdXJyZW5jZSB7XG4gIG9jY3VycmVuY2VUeXBlID0gXCJzdWJ3b3JkXCJcbn1cbkluc2VydEF0U3RhcnRPZlN1YndvcmRPY2N1cnJlbmNlLnJlZ2lzdGVyKClcblxuY2xhc3MgSW5zZXJ0QXRFbmRPZlN1YndvcmRPY2N1cnJlbmNlIGV4dGVuZHMgSW5zZXJ0QXRFbmRPZk9jY3VycmVuY2Uge1xuICBvY2N1cnJlbmNlVHlwZSA9IFwic3Vid29yZFwiXG59XG5JbnNlcnRBdEVuZE9mU3Vid29yZE9jY3VycmVuY2UucmVnaXN0ZXIoKVxuXG5jbGFzcyBJbnNlcnRBdEhlYWRPZlN1YndvcmRPY2N1cnJlbmNlIGV4dGVuZHMgSW5zZXJ0QXRIZWFkT2ZPY2N1cnJlbmNlIHtcbiAgb2NjdXJyZW5jZVR5cGUgPSBcInN1YndvcmRcIlxufVxuSW5zZXJ0QXRIZWFkT2ZTdWJ3b3JkT2NjdXJyZW5jZS5yZWdpc3RlcigpXG5cbmNsYXNzIEluc2VydEF0U3RhcnRPZlNtYXJ0V29yZCBleHRlbmRzIEluc2VydEJ5VGFyZ2V0IHtcbiAgd2hpY2ggPSBcInN0YXJ0XCJcbiAgdGFyZ2V0ID0gXCJNb3ZlVG9QcmV2aW91c1NtYXJ0V29yZFwiXG59XG5JbnNlcnRBdFN0YXJ0T2ZTbWFydFdvcmQucmVnaXN0ZXIoKVxuXG5jbGFzcyBJbnNlcnRBdEVuZE9mU21hcnRXb3JkIGV4dGVuZHMgSW5zZXJ0QnlUYXJnZXQge1xuICB3aGljaCA9IFwiZW5kXCJcbiAgdGFyZ2V0ID0gXCJNb3ZlVG9FbmRPZlNtYXJ0V29yZFwiXG59XG5JbnNlcnRBdEVuZE9mU21hcnRXb3JkLnJlZ2lzdGVyKClcblxuY2xhc3MgSW5zZXJ0QXRQcmV2aW91c0ZvbGRTdGFydCBleHRlbmRzIEluc2VydEJ5VGFyZ2V0IHtcbiAgd2hpY2ggPSBcInN0YXJ0XCJcbiAgdGFyZ2V0ID0gXCJNb3ZlVG9QcmV2aW91c0ZvbGRTdGFydFwiXG59XG5JbnNlcnRBdFByZXZpb3VzRm9sZFN0YXJ0LnJlZ2lzdGVyKClcblxuY2xhc3MgSW5zZXJ0QXROZXh0Rm9sZFN0YXJ0IGV4dGVuZHMgSW5zZXJ0QnlUYXJnZXQge1xuICB3aGljaCA9IFwiZW5kXCJcbiAgdGFyZ2V0ID0gXCJNb3ZlVG9OZXh0Rm9sZFN0YXJ0XCJcbn1cbkluc2VydEF0TmV4dEZvbGRTdGFydC5yZWdpc3RlcigpXG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIENoYW5nZSBleHRlbmRzIEFjdGl2YXRlSW5zZXJ0TW9kZUJhc2Uge1xuICB0cmFja0NoYW5nZSA9IHRydWVcbiAgc3VwcG9ydEluc2VydGlvbkNvdW50ID0gZmFsc2VcblxuICBtdXRhdGVUZXh0KCkge1xuICAgIC8vIEFsbHdheXMgZHluYW1pY2FsbHkgZGV0ZXJtaW5lIHNlbGVjdGlvbiB3aXNlIHd0aG91dCBjb25zdWx0aW5nIHRhcmdldC53aXNlXG4gICAgLy8gUmVhc29uOiB3aGVuIGBjIGkge2AsIHdpc2UgaXMgJ2NoYXJhY3Rlcndpc2UnLCBidXQgYWN0dWFsbHkgc2VsZWN0ZWQgcmFuZ2UgaXMgJ2xpbmV3aXNlJ1xuICAgIC8vICAge1xuICAgIC8vICAgICBhXG4gICAgLy8gICB9XG4gICAgY29uc3QgaXNMaW5ld2lzZVRhcmdldCA9IHRoaXMuc3dyYXAuZGV0ZWN0V2lzZSh0aGlzLmVkaXRvcikgPT09IFwibGluZXdpc2VcIlxuICAgIGZvciAoY29uc3Qgc2VsZWN0aW9uIG9mIHRoaXMuZWRpdG9yLmdldFNlbGVjdGlvbnMoKSkge1xuICAgICAgaWYgKCF0aGlzLmdldENvbmZpZyhcImRvbnRVcGRhdGVSZWdpc3Rlck9uQ2hhbmdlT3JTdWJzdGl0dXRlXCIpKSB7XG4gICAgICAgIHRoaXMuc2V0VGV4dFRvUmVnaXN0ZXJGb3JTZWxlY3Rpb24oc2VsZWN0aW9uKVxuICAgICAgfVxuICAgICAgaWYgKGlzTGluZXdpc2VUYXJnZXQpIHtcbiAgICAgICAgc2VsZWN0aW9uLmluc2VydFRleHQoXCJcXG5cIiwge2F1dG9JbmRlbnQ6IHRydWV9KVxuICAgICAgICBzZWxlY3Rpb24uY3Vyc29yLm1vdmVMZWZ0KClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNlbGVjdGlvbi5pbnNlcnRUZXh0KFwiXCIsIHthdXRvSW5kZW50OiB0cnVlfSlcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cbkNoYW5nZS5yZWdpc3RlcigpXG5cbmNsYXNzIENoYW5nZU9jY3VycmVuY2UgZXh0ZW5kcyBDaGFuZ2Uge1xuICBvY2N1cnJlbmNlID0gdHJ1ZVxufVxuQ2hhbmdlT2NjdXJyZW5jZS5yZWdpc3RlcigpXG5cbmNsYXNzIFN1YnN0aXR1dGUgZXh0ZW5kcyBDaGFuZ2Uge1xuICB0YXJnZXQgPSBcIk1vdmVSaWdodFwiXG59XG5TdWJzdGl0dXRlLnJlZ2lzdGVyKClcblxuY2xhc3MgU3Vic3RpdHV0ZUxpbmUgZXh0ZW5kcyBDaGFuZ2Uge1xuICB3aXNlID0gXCJsaW5ld2lzZVwiIC8vIFtGSVhNRV0gdG8gcmUtb3ZlcnJpZGUgdGFyZ2V0Lndpc2UgaW4gdmlzdWFsLW1vZGVcbiAgdGFyZ2V0ID0gXCJNb3ZlVG9SZWxhdGl2ZUxpbmVcIlxufVxuU3Vic3RpdHV0ZUxpbmUucmVnaXN0ZXIoKVxuXG4vLyBhbGlhc1xuY2xhc3MgQ2hhbmdlTGluZSBleHRlbmRzIFN1YnN0aXR1dGVMaW5lIHt9XG5DaGFuZ2VMaW5lLnJlZ2lzdGVyKClcblxuY2xhc3MgQ2hhbmdlVG9MYXN0Q2hhcmFjdGVyT2ZMaW5lIGV4dGVuZHMgQ2hhbmdlIHtcbiAgdGFyZ2V0ID0gXCJNb3ZlVG9MYXN0Q2hhcmFjdGVyT2ZMaW5lXCJcblxuICBleGVjdXRlKCkge1xuICAgIHRoaXMub25EaWRTZWxlY3RUYXJnZXQoKCkgPT4ge1xuICAgICAgaWYgKHRoaXMudGFyZ2V0Lndpc2UgPT09IFwiYmxvY2t3aXNlXCIpIHtcbiAgICAgICAgZm9yIChjb25zdCBibG9ja3dpc2VTZWxlY3Rpb24gb2YgdGhpcy5nZXRCbG9ja3dpc2VTZWxlY3Rpb25zKCkpIHtcbiAgICAgICAgICBibG9ja3dpc2VTZWxlY3Rpb24uZXh0ZW5kTWVtYmVyU2VsZWN0aW9uc1RvRW5kT2ZMaW5lKClcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gICAgc3VwZXIuZXhlY3V0ZSgpXG4gIH1cbn1cbkNoYW5nZVRvTGFzdENoYXJhY3Rlck9mTGluZS5yZWdpc3RlcigpXG4iXX0=