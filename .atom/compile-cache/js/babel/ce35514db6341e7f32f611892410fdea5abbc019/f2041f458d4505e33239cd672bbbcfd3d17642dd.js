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
          return _this.groupChangesSinceBufferCheckpoint("undo");
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL29wZXJhdG9yLWluc2VydC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxXQUFXLENBQUE7Ozs7Ozs7Ozs7QUFFWCxJQUFNLENBQUMsR0FBRyxPQUFPLENBQUMsaUJBQWlCLENBQUMsQ0FBQTs7ZUFDcEIsT0FBTyxDQUFDLE1BQU0sQ0FBQzs7SUFBeEIsS0FBSyxZQUFMLEtBQUs7O0FBQ1osSUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQTs7Ozs7OztJQU1qRCxzQkFBc0I7WUFBdEIsc0JBQXNCOztXQUF0QixzQkFBc0I7MEJBQXRCLHNCQUFzQjs7K0JBQXRCLHNCQUFzQjs7U0FDMUIsV0FBVyxHQUFHLEtBQUs7U0FDbkIsWUFBWSxHQUFHLElBQUk7U0FDbkIscUJBQXFCLEdBQUcsSUFBSTs7O2VBSHhCLHNCQUFzQjs7V0FLRCxxQ0FBRzs7O0FBQzFCLFVBQUksVUFBVSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLHlCQUF5QixDQUFDLFVBQUMsSUFBTSxFQUFLO1lBQVYsSUFBSSxHQUFMLElBQU0sQ0FBTCxJQUFJOztBQUN6RSxZQUFJLElBQUksS0FBSyxRQUFRLEVBQUUsT0FBTTtBQUM3QixrQkFBVSxDQUFDLE9BQU8sRUFBRSxDQUFBOztBQUVwQixjQUFLLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxNQUFLLE1BQU0sQ0FBQyx1QkFBdUIsRUFBRSxDQUFDLENBQUE7QUFDbEUsWUFBSSxlQUFlLEdBQUcsRUFBRSxDQUFBO0FBQ3hCLFlBQU0sTUFBTSxHQUFHLE1BQUssd0JBQXdCLENBQUMsUUFBUSxDQUFDLENBQUE7QUFDdEQsWUFBSSxNQUFNLEVBQUU7QUFDVixnQkFBSyxVQUFVLEdBQUcsTUFBTSxDQUFBO0FBQ3hCLGdCQUFL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WkcsMkJBQTJCO0dBQVMsTUFBTTs7QUFjaEQsMkJBQTJCLENBQUMsUUFBUSxFQUFFLENBQUEiLCJmaWxlIjoiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvb3BlcmF0b3ItaW5zZXJ0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2UgYmFiZWxcIlxuXG5jb25zdCBfID0gcmVxdWlyZShcInVuZGVyc2NvcmUtcGx1c1wiKVxuY29uc3Qge1JhbmdlfSA9IHJlcXVpcmUoXCJhdG9tXCIpXG5jb25zdCBPcGVyYXRvciA9IHJlcXVpcmUoXCIuL2Jhc2VcIikuZ2V0Q2xhc3MoXCJPcGVyYXRvclwiKVxuXG4vLyBPcGVyYXRvciB3aGljaCBzdGFydCAnaW5zZXJ0LW1vZGUnXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBbTk9URV1cbi8vIFJ1bGU6IERvbid0IG1ha2UgYW55IHRleHQgbXV0YXRpb24gYmVmb3JlIGNhbGxpbmcgYEBzZWxlY3RUYXJnZXQoKWAuXG5jbGFzcyBBY3RpdmF0ZUluc2VydE1vZGVCYXNlIGV4dGVuZHMgT3BlcmF0b3Ige1xuICBmbGFzaFRhcmdldCA9IGZhbHNlXG4gIGZpbmFsU3VibW9kZSA9IG51bGxcbiAgc3VwcG9ydEluc2VydGlvbkNvdW50ID0gdHJ1ZVxuXG4gIG9ic2VydmVXaWxsRGVhY3RpdmF0ZU1vZGUoKSB7XG4gICAgbGV0IGRpc3Bvc2FibGUgPSB0aGlzLnZpbVN0YXRlLm1vZGVNYW5hZ2VyLnByZWVtcHRXaWxsRGVhY3RpdmF0ZU1vZGUoKHttb2RlfSkgPT4ge1xuICAgICAgaWYgKG1vZGUgIT09IFwiaW5zZXJ0XCIpIHJldHVyblxuICAgICAgZGlzcG9zYWJsZS5kaXNwb3NlKClcblxuICAgICAgdGhpcy52aW1TdGF0ZS5tYXJrLnNldChcIl5cIiwgdGhpcy5lZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKSkgLy8gTGFzdCBpbnNlcnQtbW9kZSBwb3NpdGlvblxuICAgICAgbGV0IHRleHRCeVVzZXJJbnB1dCA9IFwiXCJcbiAgICAgIGNvbnN0IGNoYW5nZSA9IHRoaXMuZ2V0Q2hhbmdlU2luY2VDaGVja3BvaW50KFwiaW5zZXJ0XCIpXG4gICAgICBpZiAoY2hhbmdlKSB7XG4gICAgICAgIHRoaXMubGFzdENoYW5nZSA9IGNoYW5nZVxuICAgICAgICB0aGlzLnNldE1hcmtGb3JDaGFuZ2UobmV3IFJhbmdlKGNoYW5nZS5zdGFydCwgY2hhbmdlLnN0YXJ0LnRyYXZlcnNlKGNoYW5nZS5uZXdFeHRlbnQpKSlcbiAgICAgICAgdGV4dEJ5VXNlcklucHV0ID0gY2hhbmdlLm5ld1RleHRcbiAgICAgIH1cbiAgICAgIHRoaXMudmltU3RhdGUucmVnaXN0ZXIuc2V0KFwiLlwiLCB7dGV4dDogdGV4dEJ5VXNlcklucHV0fSkgLy8gTGFzdCBpbnNlcnRlZCB0ZXh0XG5cbiAgICAgIF8udGltZXModGhpcy5nZXRJbnNlcnRpb25Db3VudCgpLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHRleHRUb0luc2VydCA9IHRoaXMudGV4dEJ5T3BlcmF0b3IgKyB0ZXh0QnlVc2VySW5wdXRcbiAgICAgICAgZm9yIChjb25zdCBzZWxlY3Rpb24gb2YgdGhpcy5lZGl0b3IuZ2V0U2VsZWN0aW9ucygpKSB7XG4gICAgICAgICAgc2VsZWN0aW9uLmluc2VydFRleHQodGV4dFRvSW5zZXJ0LCB7YXV0b0luZGVudDogdHJ1ZX0pXG4gICAgICAgIH1cbiAgICAgIH0pXG5cbiAgICAgIC8vIFRoaXMgY3Vyc29yIHN0YXRlIGlzIHJlc3RvcmVkIG9uIHVuZG8uXG4gICAgICAvLyBTbyBjdXJzb3Igc3RhdGUgaGFzIHRvIGJlIHVwZGF0ZWQgYmVmb3JlIG5leHQgZ3JvdXBDaGFuZ2VzU2luY2VDaGVja3BvaW50KClcbiAgICAgIGlmICh0aGlzLmdldENvbmZpZyhcImNsZWFyTXVsdGlwbGVDdXJzb3JzT25Fc2NhcGVJbnNlcnRNb2RlXCIpKSB7XG4gICAgICAgIHRoaXMudmltU3RhdGUuY2xlYXJTZWxlY3Rpb25zKClcbiAgICAgIH1cblxuICAgICAgLy8gZ3JvdXBpbmcgY2hhbmdlcyBmb3IgdW5kbyBjaGVja3BvaW50IG5lZWQgdG8gY29tZSBsYXN0XG4gICAgICBpZiAodGhpcy5nZXRDb25maWcoXCJncm91cENoYW5nZXNXaGVuTGVhdmluZ0luc2VydE1vZGVcIikpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ3JvdXBDaGFuZ2VzU2luY2VCdWZmZXJDaGVja3BvaW50KFwidW5kb1wiKVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICAvLyBXaGVuIGVhY2ggbXV0YWlvbidzIGV4dGVudCBpcyBub3QgaW50ZXJzZWN0aW5nLCBtdWl0aXBsZSBjaGFuZ2VzIGFyZSByZWNvcmRlZFxuICAvLyBlLmdcbiAgLy8gIC0gTXVsdGljdXJzb3JzIGVkaXRcbiAgLy8gIC0gQ3Vyc29yIG1vdmVkIGluIGluc2VydC1tb2RlKGUuZyBjdHJsLWYsIGN0cmwtYilcbiAgLy8gQnV0IEkgZG9uJ3QgY2FyZSBtdWx0aXBsZSBjaGFuZ2VzIGp1c3QgYmVjYXVzZSBJJ20gbGF6eShzbyBub3QgcGVyZmVjdCBpbXBsZW1lbnRhdGlvbikuXG4gIC8vIEkgb25seSB0YWtlIGNhcmUgb2Ygb25lIGNoYW5nZSBoYXBwZW5lZCBhdCBlYXJsaWVzdCh0b3BDdXJzb3IncyBjaGFuZ2UpIHBvc2l0aW9uLlxuICAvLyBUaGF0cycgd2h5IEkgc2F2ZSB0b3BDdXJzb3IncyBwb3NpdGlvbiB0byBAdG9wQ3Vyc29yUG9zaXRpb25BdEluc2VydGlvblN0YXJ0IHRvIGNvbXBhcmUgdHJhdmVyc2FsIHRvIGRlbGV0aW9uU3RhcnRcbiAgLy8gV2h5IEkgdXNlIHRvcEN1cnNvcidzIGNoYW5nZT8gSnVzdCBiZWNhdXNlIGl0J3MgZWFzeSB0byB1c2UgZmlyc3QgY2hhbmdlIHJldHVybmVkIGJ5IGdldENoYW5nZVNpbmNlQ2hlY2twb2ludCgpLlxuICBnZXRDaGFuZ2VTaW5jZUNoZWNrcG9pbnQocHVycG9zZSkge1xuICAgIGNvbnN0IGNoZWNrcG9pbnQgPSB0aGlzLmdldEJ1ZmZlckNoZWNrcG9pbnQocHVycG9zZSlcbiAgICByZXR1cm4gdGhpcy5lZGl0b3IuYnVmZmVyLmdldENoYW5nZXNTaW5jZUNoZWNrcG9pbnQoY2hlY2twb2ludClbMF1cbiAgfVxuXG4gIC8vIFtCVUctQlVULU9LXSBSZXBsYXlpbmcgdGV4dC1kZWxldGlvbi1vcGVyYXRpb24gaXMgbm90IGNvbXBhdGlibGUgdG8gcHVyZSBWaW0uXG4gIC8vIFB1cmUgVmltIHJlY29yZCBhbGwgb3BlcmF0aW9uIGluIGluc2VydC1tb2RlIGFzIGtleXN0cm9rZSBsZXZlbCBhbmQgY2FuIGRpc3Rpbmd1aXNoXG4gIC8vIGNoYXJhY3RlciBkZWxldGVkIGJ5IGBEZWxldGVgIG9yIGJ5IGBjdHJsLXVgLlxuICAvLyBCdXQgSSBjYW4gbm90IGFuZCBkb24ndCB0cnlpbmcgdG8gbWluaWMgdGhpcyBsZXZlbCBvZiBjb21wYXRpYmlsaXR5LlxuICAvLyBTbyBiYXNpY2FsbHkgZGVsZXRpb24tZG9uZS1pbi1vbmUgaXMgZXhwZWN0ZWQgdG8gd29yayB3ZWxsLlxuICByZXBsYXlMYXN0Q2hhbmdlKHNlbGVjdGlvbikge1xuICAgIGxldCB0ZXh0VG9JbnNlcnRcbiAgICBpZiAodGhpcy5sYXN0Q2hhbmdlICE9IG51bGwpIHtcbiAgICAgIGNvbnN0IHtzdGFydCwgbmV3RXh0ZW50LCBvbGRFeHRlbnQsIG5ld1RleHR9ID0gdGhpcy5sYXN0Q2hhbmdlXG4gICAgICBpZiAoIW9sZEV4dGVudC5pc1plcm8oKSkge1xuICAgICAgICBjb25zdCB0cmF2ZXJzYWxUb1N0YXJ0T2ZEZWxldGUgPSBzdGFydC50cmF2ZXJzYWxGcm9tKHRoaXMudG9wQ3Vyc29yUG9zaXRpb25BdEluc2VydGlvblN0YXJ0KVxuICAgICAgICBjb25zdCBkZWxldGlvblN0YXJ0ID0gc2VsZWN0aW9uLmN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpLnRyYXZlcnNlKHRyYXZlcnNhbFRvU3RhcnRPZkRlbGV0ZSlcbiAgICAgICAgY29uc3QgZGVsZXRpb25FbmQgPSBkZWxldGlvblN0YXJ0LnRyYXZlcnNlKG9sZEV4dGVudClcbiAgICAgICAgc2VsZWN0aW9uLnNldEJ1ZmZlclJhbmdlKFtkZWxldGlvblN0YXJ0LCBkZWxldGlvbkVuZF0pXG4gICAgICB9XG4gICAgICB0ZXh0VG9JbnNlcnQgPSBuZXdUZXh0XG4gICAgfSBlbHNlIHtcbiAgICAgIHRleHRUb0luc2VydCA9IFwiXCJcbiAgICB9XG4gICAgc2VsZWN0aW9uLmluc2VydFRleHQodGV4dFRvSW5zZXJ0LCB7YXV0b0luZGVudDogdHJ1ZX0pXG4gIH1cblxuICAvLyBjYWxsZWQgd2hlbiByZXBlYXRlZFxuICAvLyBbRklYTUVdIHRvIHVzZSByZXBsYXlMYXN0Q2hhbmdlIGluIHJlcGVhdEluc2VydCBvdmVycmlkaW5nIHN1YmNsYXNzcy5cbiAgcmVwZWF0SW5zZXJ0KHNlbGVjdGlvbiwgdGV4dCkge1xuICAgIHRoaXMucmVwbGF5TGFzdENoYW5nZShzZWxlY3Rpb24pXG4gIH1cblxuICBnZXRJbnNlcnRpb25Db3VudCgpIHtcbiAgICBpZiAodGhpcy5pbnNlcnRpb25Db3VudCA9PSBudWxsKSB7XG4gICAgICB0aGlzLmluc2VydGlvbkNvdW50ID0gdGhpcy5zdXBwb3J0SW5zZXJ0aW9uQ291bnQgPyB0aGlzLmdldENvdW50KC0xKSA6IDBcbiAgICB9XG4gICAgLy8gQXZvaWQgZnJlZXppbmcgYnkgYWNjY2lkZW50YWwgYmlnIGNvdW50KGUuZy4gYDU1NTU1NTU1NTU1NTVpYCksIFNlZSAjNTYwLCAjNTk2XG4gICAgcmV0dXJuIHRoaXMudXRpbHMubGltaXROdW1iZXIodGhpcy5pbnNlcnRpb25Db3VudCwge21heDogMTAwfSlcbiAgfVxuXG4gIGV4ZWN1dGUoKSB7XG4gICAgaWYgKHRoaXMucmVwZWF0ZWQpIHtcbiAgICAgIHRoaXMuZmxhc2hUYXJnZXQgPSB0aGlzLnRyYWNrQ2hhbmdlID0gdHJ1ZVxuXG4gICAgICB0aGlzLnN0YXJ0TXV0YXRpb24oKCkgPT4ge1xuICAgICAgICBpZiAodGhpcy50YXJnZXQpIHRoaXMuc2VsZWN0VGFyZ2V0KClcbiAgICAgICAgaWYgKHRoaXMubXV0YXRlVGV4dCkgdGhpcy5tdXRhdGVUZXh0KClcblxuICAgICAgICBmb3IgKGNvbnN0IHNlbGVjdGlvbiBvZiB0aGlzLmVkaXRvci5nZXRTZWxlY3Rpb25zKCkpIHtcbiAgICAgICAgICBjb25zdCB0ZXh0VG9JbnNlcnQgPSAodGhpcy5sYXN0Q2hhbmdlICYmIHRoaXMubGFzdENoYW5nZS5uZXdUZXh0KSB8fCBcIlwiXG4gICAgICAgICAgdGhpcy5yZXBlYXRJbnNlcnQoc2VsZWN0aW9uLCB0ZXh0VG9JbnNlcnQpXG4gICAgICAgICAgdGhpcy51dGlscy5tb3ZlQ3Vyc29yTGVmdChzZWxlY3Rpb24uY3Vyc29yKVxuICAgICAgICB9XG4gICAgICAgIHRoaXMubXV0YXRpb25NYW5hZ2VyLnNldENoZWNrcG9pbnQoXCJkaWQtZmluaXNoXCIpXG4gICAgICB9KVxuXG4gICAgICBpZiAodGhpcy5nZXRDb25maWcoXCJjbGVhck11bHRpcGxlQ3Vyc29yc09uRXNjYXBlSW5zZXJ0TW9kZVwiKSkgdGhpcy52aW1TdGF0ZS5jbGVhclNlbGVjdGlvbnMoKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLm5vcm1hbGl6ZVNlbGVjdGlvbnNJZk5lY2Vzc2FyeSgpXG4gICAgICB0aGlzLmNyZWF0ZUJ1ZmZlckNoZWNrcG9pbnQoXCJ1bmRvXCIpXG4gICAgICB0aGlzLnNlbGVjdFRhcmdldCgpXG4gICAgICB0aGlzLm9ic2VydmVXaWxsRGVhY3RpdmF0ZU1vZGUoKVxuICAgICAgaWYgKHRoaXMubXV0YXRlVGV4dCkgdGhpcy5tdXRhdGVUZXh0KClcblxuICAgICAgaWYgKHRoaXMuZ2V0SW5zZXJ0aW9uQ291bnQoKSA+IDApIHtcbiAgICAgICAgY29uc3QgY2hhbmdlID0gdGhpcy5nZXRDaGFuZ2VTaW5jZUNoZWNrcG9pbnQoXCJ1bmRvXCIpXG4gICAgICAgIHRoaXMudGV4dEJ5T3BlcmF0b3IgPSAoY2hhbmdlICYmIGNoYW5nZS5uZXdUZXh0KSB8fCBcIlwiXG4gICAgICB9XG5cbiAgICAgIHRoaXMuY3JlYXRlQnVmZmVyQ2hlY2twb2ludChcImluc2VydFwiKVxuICAgICAgY29uc3QgdG9wQ3Vyc29yID0gdGhpcy5lZGl0b3IuZ2V0Q3Vyc29yc09yZGVyZWRCeUJ1ZmZlclBvc2l0aW9uKClbMF1cbiAgICAgIHRoaXMudG9wQ3Vyc29yUG9zaXRpb25BdEluc2VydGlvblN0YXJ0ID0gdG9wQ3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKClcblxuICAgICAgLy8gU2tpcCBub3JtYWxpemF0aW9uIG9mIGJsb2Nrd2lzZVNlbGVjdGlvbi5cbiAgICAgIC8vIFNpbmNlIHdhbnQgdG8ga2VlcCBtdWx0aS1jdXJzb3IgYW5kIGl0J3MgcG9zaXRpb24gaW4gd2hlbiBzaGlmdCB0byBpbnNlcnQtbW9kZS5cbiAgICAgIGZvciAoY29uc3QgYmxvY2t3aXNlU2VsZWN0aW9uIG9mIHRoaXMuZ2V0QmxvY2t3aXNlU2VsZWN0aW9ucygpKSB7XG4gICAgICAgIGJsb2Nrd2lzZVNlbGVjdGlvbi5za2lwTm9ybWFsaXphdGlvbigpXG4gICAgICB9XG4gICAgICB0aGlzLmFjdGl2YXRlTW9kZShcImluc2VydFwiLCB0aGlzLmZpbmFsU3VibW9kZSlcbiAgICB9XG4gIH1cbn1cbkFjdGl2YXRlSW5zZXJ0TW9kZUJhc2UucmVnaXN0ZXIoZmFsc2UpXG5cbmNsYXNzIEFjdGl2YXRlSW5zZXJ0TW9kZSBleHRlbmRzIEFjdGl2YXRlSW5zZXJ0TW9kZUJhc2Uge1xuICB0YXJnZXQgPSBcIkVtcHR5XCJcbiAgYWNjZXB0UHJlc2V0T2NjdXJyZW5jZSA9IGZhbHNlXG4gIGFjY2VwdFBlcnNpc3RlbnRTZWxlY3Rpb24gPSBmYWxzZVxufVxuQWN0aXZhdGVJbnNlcnRNb2RlLnJlZ2lzdGVyKClcblxuY2xhc3MgQWN0aXZhdGVSZXBsYWNlTW9kZSBleHRlbmRzIEFjdGl2YXRlSW5zZXJ0TW9kZSB7XG4gIGZpbmFsU3VibW9kZSA9IFwicmVwbGFjZVwiXG5cbiAgcmVwZWF0SW5zZXJ0KHNlbGVjdGlvbiwgdGV4dCkge1xuICAgIGZvciAoY29uc3QgY2hhciBvZiB0ZXh0KSB7XG4gICAgICBpZiAoY2hhciA9PT0gXCJcXG5cIikgY29udGludWVcbiAgICAgIGlmIChzZWxlY3Rpb24uY3Vyc29yLmlzQXRFbmRPZkxpbmUoKSkgYnJlYWtcbiAgICAgIHNlbGVjdGlvbi5zZWxlY3RSaWdodCgpXG4gICAgfVxuICAgIHNlbGVjdGlvbi5pbnNlcnRUZXh0KHRleHQsIHthdXRvSW5kZW50OiBmYWxzZX0pXG4gIH1cbn1cbkFjdGl2YXRlUmVwbGFjZU1vZGUucmVnaXN0ZXIoKVxuXG5jbGFzcyBJbnNlcnRBZnRlciBleHRlbmRzIEFjdGl2YXRlSW5zZXJ0TW9kZSB7XG4gIGV4ZWN1dGUoKSB7XG4gICAgZm9yIChjb25zdCBjdXJzb3Igb2YgdGhpcy5lZGl0b3IuZ2V0Q3Vyc29ycygpKSB7XG4gICAgICB0aGlzLnV0aWxzLm1vdmVDdXJzb3JSaWdodChjdXJzb3IpXG4gICAgfVxuICAgIHN1cGVyLmV4ZWN1dGUoKVxuICB9XG59XG5JbnNlcnRBZnRlci5yZWdpc3RlcigpXG5cbi8vIGtleTogJ2cgSScgaW4gYWxsIG1vZGVcbmNsYXNzIEluc2VydEF0QmVnaW5uaW5nT2ZMaW5lIGV4dGVuZHMgQWN0aXZhdGVJbnNlcnRNb2RlIHtcbiAgZXhlY3V0ZSgpIHtcbiAgICBpZiAodGhpcy5tb2RlID09PSBcInZpc3VhbFwiICYmIHRoaXMuc3VibW9kZSAhPT0gXCJibG9ja3dpc2VcIikge1xuICAgICAgdGhpcy5lZGl0b3Iuc3BsaXRTZWxlY3Rpb25zSW50b0xpbmVzKClcbiAgICB9XG4gICAgZm9yIChjb25zdCBibG9ja3dpc2VTZWxlY3Rpb24gb2YgdGhpcy5nZXRCbG9ja3dpc2VTZWxlY3Rpb25zKCkpIHtcbiAgICAgIGJsb2Nrd2lzZVNlbGVjdGlvbi5za2lwTm9ybWFsaXphdGlvbigpXG4gICAgfVxuICAgIHRoaXMuZWRpdG9yLm1vdmVUb0JlZ2lubmluZ09mTGluZSgpXG4gICAgc3VwZXIuZXhlY3V0ZSgpXG4gIH1cbn1cbkluc2VydEF0QmVnaW5uaW5nT2ZMaW5lLnJlZ2lzdGVyKClcblxuLy8ga2V5OiBub3JtYWwgJ0EnXG5jbGFzcyBJbnNlcnRBZnRlckVuZE9mTGluZSBleHRlbmRzIEFjdGl2YXRlSW5zZXJ0TW9kZSB7XG4gIGV4ZWN1dGUoKSB7XG4gICAgdGhpcy5lZGl0b3IubW92ZVRvRW5kT2ZMaW5lKClcbiAgICBzdXBlci5leGVjdXRlKClcbiAgfVxufVxuSW5zZXJ0QWZ0ZXJFbmRPZkxpbmUucmVnaXN0ZXIoKVxuXG4vLyBrZXk6IG5vcm1hbCAnSSdcbmNsYXNzIEluc2VydEF0Rmlyc3RDaGFyYWN0ZXJPZkxpbmUgZXh0ZW5kcyBBY3RpdmF0ZUluc2VydE1vZGUge1xuICBleGVjdXRlKCkge1xuICAgIHRoaXMuZWRpdG9yLm1vdmVUb0JlZ2lubmluZ09mTGluZSgpXG4gICAgdGhpcy5lZGl0b3IubW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmUoKVxuICAgIHN1cGVyLmV4ZWN1dGUoKVxuICB9XG59XG5JbnNlcnRBdEZpcnN0Q2hhcmFjdGVyT2ZMaW5lLnJlZ2lzdGVyKClcblxuY2xhc3MgSW5zZXJ0QXRMYXN0SW5zZXJ0IGV4dGVuZHMgQWN0aXZhdGVJbnNlcnRNb2RlIHtcbiAgZXhlY3V0ZSgpIHtcbiAgICBjb25zdCBwb2ludCA9IHRoaXMudmltU3RhdGUubWFyay5nZXQoXCJeXCIpXG4gICAgaWYgKHBvaW50KSB7XG4gICAgICB0aGlzLmVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihwb2ludClcbiAgICAgIHRoaXMuZWRpdG9yLnNjcm9sbFRvQ3Vyc29yUG9zaXRpb24oe2NlbnRlcjogdHJ1ZX0pXG4gICAgfVxuICAgIHN1cGVyLmV4ZWN1dGUoKVxuICB9XG59XG5JbnNlcnRBdExhc3RJbnNlcnQucmVnaXN0ZXIoKVxuXG5jbGFzcyBJbnNlcnRBYm92ZVdpdGhOZXdsaW5lIGV4dGVuZHMgQWN0aXZhdGVJbnNlcnRNb2RlIHtcbiAgaW5pdGlhbGl6ZSgpIHtcbiAgICBpZiAodGhpcy5nZXRDb25maWcoXCJncm91cENoYW5nZXNXaGVuTGVhdmluZ0luc2VydE1vZGVcIikpIHtcbiAgICAgIHRoaXMub3JpZ2luYWxDdXJzb3JQb3NpdGlvbk1hcmtlciA9IHRoaXMuZWRpdG9yLm1hcmtCdWZmZXJQb3NpdGlvbih0aGlzLmVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpKVxuICAgIH1cbiAgICBzdXBlci5pbml0aWFsaXplKClcbiAgfVxuXG4gIC8vIFRoaXMgaXMgZm9yIGBvYCBhbmQgYE9gIG9wZXJhdG9yLlxuICAvLyBPbiB1bmRvL3JlZG8gcHV0IGN1cnNvciBhdCBvcmlnaW5hbCBwb2ludCB3aGVyZSB1c2VyIHR5cGUgYG9gIG9yIGBPYC5cbiAgZ3JvdXBDaGFuZ2VzU2luY2VCdWZmZXJDaGVja3BvaW50KHB1cnBvc2UpIHtcbiAgICBjb25zdCBsYXN0Q3Vyc29yID0gdGhpcy5lZGl0b3IuZ2V0TGFzdEN1cnNvcigpXG4gICAgY29uc3QgY3Vyc29yUG9zaXRpb24gPSBsYXN0Q3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKClcbiAgICBsYXN0Q3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHRoaXMub3JpZ2luYWxDdXJzb3JQb3NpdGlvbk1hcmtlci5nZXRIZWFkQnVmZmVyUG9zaXRpb24oKSlcbiAgICB0aGlzLm9yaWdpbmFsQ3Vyc29yUG9zaXRpb25NYXJrZXIuZGVzdHJveSgpXG5cbiAgICBzdXBlci5ncm91cENoYW5nZXNTaW5jZUJ1ZmZlckNoZWNrcG9pbnQocHVycG9zZSlcblxuICAgIGxhc3RDdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24oY3Vyc29yUG9zaXRpb24pXG4gIH1cblxuICBhdXRvSW5kZW50RW1wdHlSb3dzKCkge1xuICAgIGZvciAoY29uc3QgY3Vyc29yIG9mIHRoaXMuZWRpdG9yLmdldEN1cnNvcnMoKSkge1xuICAgICAgY29uc3Qgcm93ID0gY3Vyc29yLmdldEJ1ZmZlclJvdygpXG4gICAgICBpZiAodGhpcy51dGlscy5pc0VtcHR5Um93KHRoaXMuZWRpdG9yLCByb3cpKSB7XG4gICAgICAgIHRoaXMuZWRpdG9yLmF1dG9JbmRlbnRCdWZmZXJSb3cocm93KVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIG11dGF0ZVRleHQoKSB7XG4gICAgdGhpcy5lZGl0b3IuaW5zZXJ0TmV3bGluZUFib3ZlKClcbiAgICBpZiAodGhpcy5lZGl0b3IuYXV0b0luZGVudCkge1xuICAgICAgdGhpcy5hdXRvSW5kZW50RW1wdHlSb3dzKClcbiAgICB9XG4gIH1cblxuICByZXBlYXRJbnNlcnQoc2VsZWN0aW9uLCB0ZXh0KSB7XG4gICAgc2VsZWN0aW9uLmluc2VydFRleHQodGV4dC50cmltTGVmdCgpLCB7YXV0b0luZGVudDogdHJ1ZX0pXG4gIH1cbn1cbkluc2VydEFib3ZlV2l0aE5ld2xpbmUucmVnaXN0ZXIoKVxuXG5jbGFzcyBJbnNlcnRCZWxvd1dpdGhOZXdsaW5lIGV4dGVuZHMgSW5zZXJ0QWJvdmVXaXRoTmV3bGluZSB7XG4gIG11dGF0ZVRleHQoKSB7XG4gICAgZm9yIChjb25zdCBjdXJzb3Igb2YgdGhpcy5lZGl0b3IuZ2V0Q3Vyc29ycygpKSB7XG4gICAgICB0aGlzLnV0aWxzLnNldEJ1ZmZlclJvdyhjdXJzb3IsIHRoaXMuZ2V0Rm9sZEVuZFJvd0ZvclJvdyhjdXJzb3IuZ2V0QnVmZmVyUm93KCkpKVxuICAgIH1cblxuICAgIHRoaXMuZWRpdG9yLmluc2VydE5ld2xpbmVCZWxvdygpXG4gICAgaWYgKHRoaXMuZWRpdG9yLmF1dG9JbmRlbnQpIHRoaXMuYXV0b0luZGVudEVtcHR5Um93cygpXG4gIH1cbn1cbkluc2VydEJlbG93V2l0aE5ld2xpbmUucmVnaXN0ZXIoKVxuXG4vLyBBZHZhbmNlZCBJbnNlcnRpb25cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIEluc2VydEJ5VGFyZ2V0IGV4dGVuZHMgQWN0aXZhdGVJbnNlcnRNb2RlQmFzZSB7XG4gIHdoaWNoID0gbnVsbCAvLyBvbmUgb2YgWydzdGFydCcsICdlbmQnLCAnaGVhZCcsICd0YWlsJ11cblxuICBpbml0aWFsaXplKCkge1xuICAgIC8vIEhBQ0tcbiAgICAvLyBXaGVuIGcgaSBpcyBtYXBwZWQgdG8gYGluc2VydC1hdC1zdGFydC1vZi10YXJnZXRgLlxuICAgIC8vIGBnIGkgMyBsYCBzdGFydCBpbnNlcnQgYXQgMyBjb2x1bW4gcmlnaHQgcG9zaXRpb24uXG4gICAgLy8gSW4gdGhpcyBjYXNlLCB3ZSBkb24ndCB3YW50IHJlcGVhdCBpbnNlcnRpb24gMyB0aW1lcy5cbiAgICAvLyBUaGlzIEBnZXRDb3VudCgpIGNhbGwgY2FjaGUgbnVtYmVyIGF0IHRoZSB0aW1pbmcgQkVGT1JFICczJyBpcyBzcGVjaWZpZWQuXG4gICAgdGhpcy5nZXRDb3VudCgpXG4gICAgc3VwZXIuaW5pdGlhbGl6ZSgpXG4gIH1cblxuICBleGVjdXRlKCkge1xuICAgIHRoaXMub25EaWRTZWxlY3RUYXJnZXQoKCkgPT4ge1xuICAgICAgLy8gSW4gdkMvdkwsIHdoZW4gb2NjdXJyZW5jZSBtYXJrZXIgd2FzIE5PVCBzZWxlY3RlZCxcbiAgICAgIC8vIGl0IGJlaGF2ZSdzIHZlcnkgc3BlY2lhbGx5XG4gICAgICAvLyB2QzogYElgIGFuZCBgQWAgYmVoYXZlcyBhcyBzaG9mdCBoYW5kIG9mIGBjdHJsLXYgSWAgYW5kIGBjdHJsLXYgQWAuXG4gICAgICAvLyB2TDogYElgIGFuZCBgQWAgcGxhY2UgY3Vyc29ycyBhdCBlYWNoIHNlbGVjdGVkIGxpbmVzIG9mIHN0YXJ0KCBvciBlbmQgKSBvZiBub24td2hpdGUtc3BhY2UgY2hhci5cbiAgICAgIGlmICghdGhpcy5vY2N1cnJlbmNlU2VsZWN0ZWQgJiYgdGhpcy5tb2RlID09PSBcInZpc3VhbFwiICYmIHRoaXMuc3VibW9kZSAhPT0gXCJibG9ja3dpc2VcIikge1xuICAgICAgICBmb3IgKGNvbnN0ICRzZWxlY3Rpb24gb2YgdGhpcy5zd3JhcC5nZXRTZWxlY3Rpb25zKHRoaXMuZWRpdG9yKSkge1xuICAgICAgICAgICRzZWxlY3Rpb24ubm9ybWFsaXplKClcbiAgICAgICAgICAkc2VsZWN0aW9uLmFwcGx5V2lzZShcImJsb2Nrd2lzZVwiKVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuc3VibW9kZSA9PT0gXCJsaW5ld2lzZVwiKSB7XG4gICAgICAgICAgZm9yIChjb25zdCBibG9ja3dpc2VTZWxlY3Rpb24gb2YgdGhpcy5nZXRCbG9ja3dpc2VTZWxlY3Rpb25zKCkpIHtcbiAgICAgICAgICAgIGJsb2Nrd2lzZVNlbGVjdGlvbi5leHBhbmRNZW1iZXJTZWxlY3Rpb25zT3ZlckxpbmVXaXRoVHJpbVJhbmdlKClcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgZm9yIChjb25zdCAkc2VsZWN0aW9uIG9mIHRoaXMuc3dyYXAuZ2V0U2VsZWN0aW9ucyh0aGlzLmVkaXRvcikpIHtcbiAgICAgICAgJHNlbGVjdGlvbi5zZXRCdWZmZXJQb3NpdGlvblRvKHRoaXMud2hpY2gpXG4gICAgICB9XG4gICAgfSlcbiAgICBzdXBlci5leGVjdXRlKClcbiAgfVxufVxuSW5zZXJ0QnlUYXJnZXQucmVnaXN0ZXIoZmFsc2UpXG5cbi8vIGtleTogJ0knLCBVc2VkIGluICd2aXN1YWwtbW9kZS5jaGFyYWN0ZXJ3aXNlJywgdmlzdWFsLW1vZGUuYmxvY2t3aXNlXG5jbGFzcyBJbnNlcnRBdFN0YXJ0T2ZUYXJnZXQgZXh0ZW5kcyBJbnNlcnRCeVRhcmdldCB7XG4gIHdoaWNoID0gXCJzdGFydFwiXG59XG5JbnNlcnRBdFN0YXJ0T2ZUYXJnZXQucmVnaXN0ZXIoKVxuXG4vLyBrZXk6ICdBJywgVXNlZCBpbiAndmlzdWFsLW1vZGUuY2hhcmFjdGVyd2lzZScsICd2aXN1YWwtbW9kZS5ibG9ja3dpc2UnXG5jbGFzcyBJbnNlcnRBdEVuZE9mVGFyZ2V0IGV4dGVuZHMgSW5zZXJ0QnlUYXJnZXQge1xuICB3aGljaCA9IFwiZW5kXCJcbn1cbkluc2VydEF0RW5kT2ZUYXJnZXQucmVnaXN0ZXIoKVxuXG5jbGFzcyBJbnNlcnRBdEhlYWRPZlRhcmdldCBleHRlbmRzIEluc2VydEJ5VGFyZ2V0IHtcbiAgd2hpY2ggPSBcImhlYWRcIlxufVxuSW5zZXJ0QXRIZWFkT2ZUYXJnZXQucmVnaXN0ZXIoKVxuXG5jbGFzcyBJbnNlcnRBdFN0YXJ0T2ZPY2N1cnJlbmNlIGV4dGVuZHMgSW5zZXJ0QXRTdGFydE9mVGFyZ2V0IHtcbiAgb2NjdXJyZW5jZSA9IHRydWVcbn1cbkluc2VydEF0U3RhcnRPZk9jY3VycmVuY2UucmVnaXN0ZXIoKVxuXG5jbGFzcyBJbnNlcnRBdEVuZE9mT2NjdXJyZW5jZSBleHRlbmRzIEluc2VydEF0RW5kT2ZUYXJnZXQge1xuICBvY2N1cnJlbmNlID0gdHJ1ZVxufVxuSW5zZXJ0QXRFbmRPZk9jY3VycmVuY2UucmVnaXN0ZXIoKVxuXG5jbGFzcyBJbnNlcnRBdEhlYWRPZk9jY3VycmVuY2UgZXh0ZW5kcyBJbnNlcnRBdEhlYWRPZlRhcmdldCB7XG4gIG9jY3VycmVuY2UgPSB0cnVlXG59XG5JbnNlcnRBdEhlYWRPZk9jY3VycmVuY2UucmVnaXN0ZXIoKVxuXG5jbGFzcyBJbnNlcnRBdFN0YXJ0T2ZTdWJ3b3JkT2NjdXJyZW5jZSBleHRlbmRzIEluc2VydEF0U3RhcnRPZk9jY3VycmVuY2Uge1xuICBvY2N1cnJlbmNlVHlwZSA9IFwic3Vid29yZFwiXG59XG5JbnNlcnRBdFN0YXJ0T2ZTdWJ3b3JkT2NjdXJyZW5jZS5yZWdpc3RlcigpXG5cbmNsYXNzIEluc2VydEF0RW5kT2ZTdWJ3b3JkT2NjdXJyZW5jZSBleHRlbmRzIEluc2VydEF0RW5kT2ZPY2N1cnJlbmNlIHtcbiAgb2NjdXJyZW5jZVR5cGUgPSBcInN1YndvcmRcIlxufVxuSW5zZXJ0QXRFbmRPZlN1YndvcmRPY2N1cnJlbmNlLnJlZ2lzdGVyKClcblxuY2xhc3MgSW5zZXJ0QXRIZWFkT2ZTdWJ3b3JkT2NjdXJyZW5jZSBleHRlbmRzIEluc2VydEF0SGVhZE9mT2NjdXJyZW5jZSB7XG4gIG9jY3VycmVuY2VUeXBlID0gXCJzdWJ3b3JkXCJcbn1cbkluc2VydEF0SGVhZE9mU3Vid29yZE9jY3VycmVuY2UucmVnaXN0ZXIoKVxuXG5jbGFzcyBJbnNlcnRBdFN0YXJ0T2ZTbWFydFdvcmQgZXh0ZW5kcyBJbnNlcnRCeVRhcmdldCB7XG4gIHdoaWNoID0gXCJzdGFydFwiXG4gIHRhcmdldCA9IFwiTW92ZVRvUHJldmlvdXNTbWFydFdvcmRcIlxufVxuSW5zZXJ0QXRTdGFydE9mU21hcnRXb3JkLnJlZ2lzdGVyKClcblxuY2xhc3MgSW5zZXJ0QXRFbmRPZlNtYXJ0V29yZCBleHRlbmRzIEluc2VydEJ5VGFyZ2V0IHtcbiAgd2hpY2ggPSBcImVuZFwiXG4gIHRhcmdldCA9IFwiTW92ZVRvRW5kT2ZTbWFydFdvcmRcIlxufVxuSW5zZXJ0QXRFbmRPZlNtYXJ0V29yZC5yZWdpc3RlcigpXG5cbmNsYXNzIEluc2VydEF0UHJldmlvdXNGb2xkU3RhcnQgZXh0ZW5kcyBJbnNlcnRCeVRhcmdldCB7XG4gIHdoaWNoID0gXCJzdGFydFwiXG4gIHRhcmdldCA9IFwiTW92ZVRvUHJldmlvdXNGb2xkU3RhcnRcIlxufVxuSW5zZXJ0QXRQcmV2aW91c0ZvbGRTdGFydC5yZWdpc3RlcigpXG5cbmNsYXNzIEluc2VydEF0TmV4dEZvbGRTdGFydCBleHRlbmRzIEluc2VydEJ5VGFyZ2V0IHtcbiAgd2hpY2ggPSBcImVuZFwiXG4gIHRhcmdldCA9IFwiTW92ZVRvTmV4dEZvbGRTdGFydFwiXG59XG5JbnNlcnRBdE5leHRGb2xkU3RhcnQucmVnaXN0ZXIoKVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBDaGFuZ2UgZXh0ZW5kcyBBY3RpdmF0ZUluc2VydE1vZGVCYXNlIHtcbiAgdHJhY2tDaGFuZ2UgPSB0cnVlXG4gIHN1cHBvcnRJbnNlcnRpb25Db3VudCA9IGZhbHNlXG5cbiAgbXV0YXRlVGV4dCgpIHtcbiAgICAvLyBBbGx3YXlzIGR5bmFtaWNhbGx5IGRldGVybWluZSBzZWxlY3Rpb24gd2lzZSB3dGhvdXQgY29uc3VsdGluZyB0YXJnZXQud2lzZVxuICAgIC8vIFJlYXNvbjogd2hlbiBgYyBpIHtgLCB3aXNlIGlzICdjaGFyYWN0ZXJ3aXNlJywgYnV0IGFjdHVhbGx5IHNlbGVjdGVkIHJhbmdlIGlzICdsaW5ld2lzZSdcbiAgICAvLyAgIHtcbiAgICAvLyAgICAgYVxuICAgIC8vICAgfVxuICAgIGNvbnN0IGlzTGluZXdpc2VUYXJnZXQgPSB0aGlzLnN3cmFwLmRldGVjdFdpc2UodGhpcy5lZGl0b3IpID09PSBcImxpbmV3aXNlXCJcbiAgICBmb3IgKGNvbnN0IHNlbGVjdGlvbiBvZiB0aGlzLmVkaXRvci5nZXRTZWxlY3Rpb25zKCkpIHtcbiAgICAgIGlmICghdGhpcy5nZXRDb25maWcoXCJkb250VXBkYXRlUmVnaXN0ZXJPbkNoYW5nZU9yU3Vic3RpdHV0ZVwiKSkge1xuICAgICAgICB0aGlzLnNldFRleHRUb1JlZ2lzdGVyRm9yU2VsZWN0aW9uKHNlbGVjdGlvbilcbiAgICAgIH1cbiAgICAgIGlmIChpc0xpbmV3aXNlVGFyZ2V0KSB7XG4gICAgICAgIHNlbGVjdGlvbi5pbnNlcnRUZXh0KFwiXFxuXCIsIHthdXRvSW5kZW50OiB0cnVlfSlcbiAgICAgICAgc2VsZWN0aW9uLmN1cnNvci5tb3ZlTGVmdCgpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzZWxlY3Rpb24uaW5zZXJ0VGV4dChcIlwiLCB7YXV0b0luZGVudDogdHJ1ZX0pXG4gICAgICB9XG4gICAgfVxuICB9XG59XG5DaGFuZ2UucmVnaXN0ZXIoKVxuXG5jbGFzcyBDaGFuZ2VPY2N1cnJlbmNlIGV4dGVuZHMgQ2hhbmdlIHtcbiAgb2NjdXJyZW5jZSA9IHRydWVcbn1cbkNoYW5nZU9jY3VycmVuY2UucmVnaXN0ZXIoKVxuXG5jbGFzcyBTdWJzdGl0dXRlIGV4dGVuZHMgQ2hhbmdlIHtcbiAgdGFyZ2V0ID0gXCJNb3ZlUmlnaHRcIlxufVxuU3Vic3RpdHV0ZS5yZWdpc3RlcigpXG5cbmNsYXNzIFN1YnN0aXR1dGVMaW5lIGV4dGVuZHMgQ2hhbmdlIHtcbiAgd2lzZSA9IFwibGluZXdpc2VcIiAvLyBbRklYTUVdIHRvIHJlLW92ZXJyaWRlIHRhcmdldC53aXNlIGluIHZpc3VhbC1tb2RlXG4gIHRhcmdldCA9IFwiTW92ZVRvUmVsYXRpdmVMaW5lXCJcbn1cblN1YnN0aXR1dGVMaW5lLnJlZ2lzdGVyKClcblxuLy8gYWxpYXNcbmNsYXNzIENoYW5nZUxpbmUgZXh0ZW5kcyBTdWJzdGl0dXRlTGluZSB7fVxuQ2hhbmdlTGluZS5yZWdpc3RlcigpXG5cbmNsYXNzIENoYW5nZVRvTGFzdENoYXJhY3Rlck9mTGluZSBleHRlbmRzIENoYW5nZSB7XG4gIHRhcmdldCA9IFwiTW92ZVRvTGFzdENoYXJhY3Rlck9mTGluZVwiXG5cbiAgZXhlY3V0ZSgpIHtcbiAgICB0aGlzLm9uRGlkU2VsZWN0VGFyZ2V0KCgpID0+IHtcbiAgICAgIGlmICh0aGlzLnRhcmdldC53aXNlID09PSBcImJsb2Nrd2lzZVwiKSB7XG4gICAgICAgIGZvciAoY29uc3QgYmxvY2t3aXNlU2VsZWN0aW9uIG9mIHRoaXMuZ2V0QmxvY2t3aXNlU2VsZWN0aW9ucygpKSB7XG4gICAgICAgICAgYmxvY2t3aXNlU2VsZWN0aW9uLmV4dGVuZE1lbWJlclNlbGVjdGlvbnNUb0VuZE9mTGluZSgpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuICAgIHN1cGVyLmV4ZWN1dGUoKVxuICB9XG59XG5DaGFuZ2VUb0xhc3RDaGFyYWN0ZXJPZkxpbmUucmVnaXN0ZXIoKVxuIl19