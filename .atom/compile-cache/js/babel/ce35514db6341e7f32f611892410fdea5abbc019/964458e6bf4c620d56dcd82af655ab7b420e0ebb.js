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

var ActivateInsertMode = (function (_Operator) {
  _inherits(ActivateInsertMode, _Operator);

  function ActivateInsertMode() {
    _classCallCheck(this, ActivateInsertMode);

    _get(Object.getPrototypeOf(ActivateInsertMode.prototype), "constructor", this).apply(this, arguments);

    this.requireTarget = false;
    this.flashTarget = false;
    this.finalSubmode = null;
    this.supportInsertionCount = true;
  }

  _createClass(ActivateInsertMode, [{
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
        if (this.target) this.selectTarget();
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

  return ActivateInsertMode;
})(Operator);

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

var InsertByTarget = (function (_ActivateInsertMode8) {
  _inherits(InsertByTarget, _ActivateInsertMode8);

  function InsertByTarget() {
    _classCallCheck(this, InsertByTarget);

    _get(Object.getPrototypeOf(InsertByTarget.prototype), "constructor", this).apply(this, arguments);

    this.requireTarget = true;
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
})(ActivateInsertMode);

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

var Change = (function (_ActivateInsertMode9) {
  _inherits(Change, _ActivateInsertMode9);

  function Change() {
    _classCallCheck(this, Change);

    _get(Object.getPrototypeOf(Change.prototype), "constructor", this).apply(this, arguments);

    this.requireTarget = true;
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
})(ActivateInsertMode);

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL29wZXJhdG9yLWluc2VydC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxXQUFXLENBQUE7Ozs7Ozs7Ozs7QUFFWCxJQUFNLENBQUMsR0FBRyxPQUFPLENBQUMsaUJBQWlCLENBQUMsQ0FBQTs7ZUFDcEIsT0FBTyxDQUFDLE1BQU0sQ0FBQzs7SUFBeEIsS0FBSyxZQUFMLEtBQUs7O0FBQ1osSUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQTs7Ozs7OztJQU1qRCxrQkFBa0I7WUFBbEIsa0JBQWtCOztXQUFsQixrQkFBa0I7MEJBQWxCLGtCQUFrQjs7K0JBQWxCLGtCQUFrQjs7U0FDdEIsYUFBYSxHQUFHLEtBQUs7U0FDckIsV0FBVyxHQUFHLEtBQUs7U0FDbkIsWUFBWSxHQUFHLElBQUk7U0FDbkIscUJBQXFCLEdBQUcsSUFBSTs7O2VBSnhCLGtCQUFrQjs7V0FNRyxxQ0FBRzs7O0FBQzFCLFVBQUksVUFBVSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLHlCQUF5QixDQUFDLFVBQUMsSUFBTSxFQUFLO1lBQVYsSUFBSSxHQUFMLElBQU0sQ0FBTCxJQUFJOztBQUN6RSxZQUFJLElBQUksS0FBSyxRQUFRLEVBQUUsT0FBTTtBQUM3QixrQkFBVSxDQUFDLE9BQU8sRUFBRSxDQUFBOztBQUVwQixjQUFLLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxNQUFLLE1BQU0sQ0FBQyx1QkFBdUIsRUFBRSxDQUFDLENBQUE7QUFDbEUsWUFBSSxlQUFlLEdBQUcsRUFBRSxDQUFBO0FBQ3hCLFlBQU0sTUFBTSxHQUFHLE1BQUssd0JBQXdCLENBQUMsUUFBUSxDQUFDLENBQUE7QUFDdEQsWUFBSSxNQUFNLEVBQUU7QUFDVixnQkFBSyxVQUFVLEdBQUcs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LE1BQU0sR0FBRyxXQUFXOzs7U0FEaEIsVUFBVTtHQUFTLE1BQU07O0FBRy9CLFVBQVUsQ0FBQyxRQUFRLEVBQUUsQ0FBQTs7SUFFZixjQUFjO1lBQWQsY0FBYzs7V0FBZCxjQUFjOzBCQUFkLGNBQWM7OytCQUFkLGNBQWM7O1NBQ2xCLElBQUksR0FBRyxVQUFVO1NBQ2pCLE1BQU0sR0FBRyxvQkFBb0I7OztTQUZ6QixjQUFjO0dBQVMsTUFBTTs7QUFJbkMsY0FBYyxDQUFDLFFBQVEsRUFBRSxDQUFBOzs7O0lBR25CLFVBQVU7WUFBVixVQUFVOztXQUFWLFVBQVU7MEJBQVYsVUFBVTs7K0JBQVYsVUFBVTs7O1NBQVYsVUFBVTtHQUFTLGNBQWM7O0FBQ3ZDLFVBQVUsQ0FBQyxRQUFRLEVBQUUsQ0FBQTs7SUFFZiwyQkFBMkI7WUFBM0IsMkJBQTJCOztXQUEzQiwyQkFBMkI7MEJBQTNCLDJCQUEyQjs7K0JBQTNCLDJCQUEyQjs7U0FDL0IsTUFBTSxHQUFHLDJCQUEyQjs7O2VBRGhDLDJCQUEyQjs7V0FHeEIsbUJBQUc7OztBQUNSLFVBQUksQ0FBQyxpQkFBaUIsQ0FBQyxZQUFNO0FBQzNCLFlBQUksT0FBSyxNQUFNLENBQUMsSUFBSSxLQUFLLFdBQVcsRUFBRTtBQUNwQyxlQUFLLElBQU0sa0JBQWtCLElBQUksT0FBSyxzQkFBc0IsRUFBRSxFQUFFO0FBQzlELDhCQUFrQixDQUFDLGlDQUFpQyxFQUFFLENBQUE7V0FDdkQ7U0FDRjtPQUNGLENBQUMsQ0FBQTtBQUNGLGlDQVhFLDJCQUEyQix5Q0FXZDtLQUNoQjs7O1NBWkcsMkJBQTJCO0dBQVMsTUFBTTs7QUFjaEQsMkJBQTJCLENBQUMsUUFBUSxFQUFFLENBQUEiLCJmaWxlIjoiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvb3BlcmF0b3ItaW5zZXJ0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2UgYmFiZWxcIlxuXG5jb25zdCBfID0gcmVxdWlyZShcInVuZGVyc2NvcmUtcGx1c1wiKVxuY29uc3Qge1JhbmdlfSA9IHJlcXVpcmUoXCJhdG9tXCIpXG5jb25zdCBPcGVyYXRvciA9IHJlcXVpcmUoXCIuL2Jhc2VcIikuZ2V0Q2xhc3MoXCJPcGVyYXRvclwiKVxuXG4vLyBPcGVyYXRvciB3aGljaCBzdGFydCAnaW5zZXJ0LW1vZGUnXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBbTk9URV1cbi8vIFJ1bGU6IERvbid0IG1ha2UgYW55IHRleHQgbXV0YXRpb24gYmVmb3JlIGNhbGxpbmcgYEBzZWxlY3RUYXJnZXQoKWAuXG5jbGFzcyBBY3RpdmF0ZUluc2VydE1vZGUgZXh0ZW5kcyBPcGVyYXRvciB7XG4gIHJlcXVpcmVUYXJnZXQgPSBmYWxzZVxuICBmbGFzaFRhcmdldCA9IGZhbHNlXG4gIGZpbmFsU3VibW9kZSA9IG51bGxcbiAgc3VwcG9ydEluc2VydGlvbkNvdW50ID0gdHJ1ZVxuXG4gIG9ic2VydmVXaWxsRGVhY3RpdmF0ZU1vZGUoKSB7XG4gICAgbGV0IGRpc3Bvc2FibGUgPSB0aGlzLnZpbVN0YXRlLm1vZGVNYW5hZ2VyLnByZWVtcHRXaWxsRGVhY3RpdmF0ZU1vZGUoKHttb2RlfSkgPT4ge1xuICAgICAgaWYgKG1vZGUgIT09IFwiaW5zZXJ0XCIpIHJldHVyblxuICAgICAgZGlzcG9zYWJsZS5kaXNwb3NlKClcblxuICAgICAgdGhpcy52aW1TdGF0ZS5tYXJrLnNldChcIl5cIiwgdGhpcy5lZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKSkgLy8gTGFzdCBpbnNlcnQtbW9kZSBwb3NpdGlvblxuICAgICAgbGV0IHRleHRCeVVzZXJJbnB1dCA9IFwiXCJcbiAgICAgIGNvbnN0IGNoYW5nZSA9IHRoaXMuZ2V0Q2hhbmdlU2luY2VDaGVja3BvaW50KFwiaW5zZXJ0XCIpXG4gICAgICBpZiAoY2hhbmdlKSB7XG4gICAgICAgIHRoaXMubGFzdENoYW5nZSA9IGNoYW5nZVxuICAgICAgICB0aGlzLnNldE1hcmtGb3JDaGFuZ2UobmV3IFJhbmdlKGNoYW5nZS5zdGFydCwgY2hhbmdlLnN0YXJ0LnRyYXZlcnNlKGNoYW5nZS5uZXdFeHRlbnQpKSlcbiAgICAgICAgdGV4dEJ5VXNlcklucHV0ID0gY2hhbmdlLm5ld1RleHRcbiAgICAgIH1cbiAgICAgIHRoaXMudmltU3RhdGUucmVnaXN0ZXIuc2V0KFwiLlwiLCB7dGV4dDogdGV4dEJ5VXNlcklucHV0fSkgLy8gTGFzdCBpbnNlcnRlZCB0ZXh0XG5cbiAgICAgIF8udGltZXModGhpcy5nZXRJbnNlcnRpb25Db3VudCgpLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHRleHRUb0luc2VydCA9IHRoaXMudGV4dEJ5T3BlcmF0b3IgKyB0ZXh0QnlVc2VySW5wdXRcbiAgICAgICAgZm9yIChjb25zdCBzZWxlY3Rpb24gb2YgdGhpcy5lZGl0b3IuZ2V0U2VsZWN0aW9ucygpKSB7XG4gICAgICAgICAgc2VsZWN0aW9uLmluc2VydFRleHQodGV4dFRvSW5zZXJ0LCB7YXV0b0luZGVudDogdHJ1ZX0pXG4gICAgICAgIH1cbiAgICAgIH0pXG5cbiAgICAgIC8vIFRoaXMgY3Vyc29yIHN0YXRlIGlzIHJlc3RvcmVkIG9uIHVuZG8uXG4gICAgICAvLyBTbyBjdXJzb3Igc3RhdGUgaGFzIHRvIGJlIHVwZGF0ZWQgYmVmb3JlIG5leHQgZ3JvdXBDaGFuZ2VzU2luY2VDaGVja3BvaW50KClcbiAgICAgIGlmICh0aGlzLmdldENvbmZpZyhcImNsZWFyTXVsdGlwbGVDdXJzb3JzT25Fc2NhcGVJbnNlcnRNb2RlXCIpKSB7XG4gICAgICAgIHRoaXMudmltU3RhdGUuY2xlYXJTZWxlY3Rpb25zKClcbiAgICAgIH1cblxuICAgICAgLy8gZ3JvdXBpbmcgY2hhbmdlcyBmb3IgdW5kbyBjaGVja3BvaW50IG5lZWQgdG8gY29tZSBsYXN0XG4gICAgICBpZiAodGhpcy5nZXRDb25maWcoXCJncm91cENoYW5nZXNXaGVuTGVhdmluZ0luc2VydE1vZGVcIikpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ3JvdXBDaGFuZ2VzU2luY2VCdWZmZXJDaGVja3BvaW50KFwidW5kb1wiKVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICAvLyBXaGVuIGVhY2ggbXV0YWlvbidzIGV4dGVudCBpcyBub3QgaW50ZXJzZWN0aW5nLCBtdWl0aXBsZSBjaGFuZ2VzIGFyZSByZWNvcmRlZFxuICAvLyBlLmdcbiAgLy8gIC0gTXVsdGljdXJzb3JzIGVkaXRcbiAgLy8gIC0gQ3Vyc29yIG1vdmVkIGluIGluc2VydC1tb2RlKGUuZyBjdHJsLWYsIGN0cmwtYilcbiAgLy8gQnV0IEkgZG9uJ3QgY2FyZSBtdWx0aXBsZSBjaGFuZ2VzIGp1c3QgYmVjYXVzZSBJJ20gbGF6eShzbyBub3QgcGVyZmVjdCBpbXBsZW1lbnRhdGlvbikuXG4gIC8vIEkgb25seSB0YWtlIGNhcmUgb2Ygb25lIGNoYW5nZSBoYXBwZW5lZCBhdCBlYXJsaWVzdCh0b3BDdXJzb3IncyBjaGFuZ2UpIHBvc2l0aW9uLlxuICAvLyBUaGF0cycgd2h5IEkgc2F2ZSB0b3BDdXJzb3IncyBwb3NpdGlvbiB0byBAdG9wQ3Vyc29yUG9zaXRpb25BdEluc2VydGlvblN0YXJ0IHRvIGNvbXBhcmUgdHJhdmVyc2FsIHRvIGRlbGV0aW9uU3RhcnRcbiAgLy8gV2h5IEkgdXNlIHRvcEN1cnNvcidzIGNoYW5nZT8gSnVzdCBiZWNhdXNlIGl0J3MgZWFzeSB0byB1c2UgZmlyc3QgY2hhbmdlIHJldHVybmVkIGJ5IGdldENoYW5nZVNpbmNlQ2hlY2twb2ludCgpLlxuICBnZXRDaGFuZ2VTaW5jZUNoZWNrcG9pbnQocHVycG9zZSkge1xuICAgIGNvbnN0IGNoZWNrcG9pbnQgPSB0aGlzLmdldEJ1ZmZlckNoZWNrcG9pbnQocHVycG9zZSlcbiAgICByZXR1cm4gdGhpcy5lZGl0b3IuYnVmZmVyLmdldENoYW5nZXNTaW5jZUNoZWNrcG9pbnQoY2hlY2twb2ludClbMF1cbiAgfVxuXG4gIC8vIFtCVUctQlVULU9LXSBSZXBsYXlpbmcgdGV4dC1kZWxldGlvbi1vcGVyYXRpb24gaXMgbm90IGNvbXBhdGlibGUgdG8gcHVyZSBWaW0uXG4gIC8vIFB1cmUgVmltIHJlY29yZCBhbGwgb3BlcmF0aW9uIGluIGluc2VydC1tb2RlIGFzIGtleXN0cm9rZSBsZXZlbCBhbmQgY2FuIGRpc3Rpbmd1aXNoXG4gIC8vIGNoYXJhY3RlciBkZWxldGVkIGJ5IGBEZWxldGVgIG9yIGJ5IGBjdHJsLXVgLlxuICAvLyBCdXQgSSBjYW4gbm90IGFuZCBkb24ndCB0cnlpbmcgdG8gbWluaWMgdGhpcyBsZXZlbCBvZiBjb21wYXRpYmlsaXR5LlxuICAvLyBTbyBiYXNpY2FsbHkgZGVsZXRpb24tZG9uZS1pbi1vbmUgaXMgZXhwZWN0ZWQgdG8gd29yayB3ZWxsLlxuICByZXBsYXlMYXN0Q2hhbmdlKHNlbGVjdGlvbikge1xuICAgIGxldCB0ZXh0VG9JbnNlcnRcbiAgICBpZiAodGhpcy5sYXN0Q2hhbmdlICE9IG51bGwpIHtcbiAgICAgIGNvbnN0IHtzdGFydCwgbmV3RXh0ZW50LCBvbGRFeHRlbnQsIG5ld1RleHR9ID0gdGhpcy5sYXN0Q2hhbmdlXG4gICAgICBpZiAoIW9sZEV4dGVudC5pc1plcm8oKSkge1xuICAgICAgICBjb25zdCB0cmF2ZXJzYWxUb1N0YXJ0T2ZEZWxldGUgPSBzdGFydC50cmF2ZXJzYWxGcm9tKHRoaXMudG9wQ3Vyc29yUG9zaXRpb25BdEluc2VydGlvblN0YXJ0KVxuICAgICAgICBjb25zdCBkZWxldGlvblN0YXJ0ID0gc2VsZWN0aW9uLmN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpLnRyYXZlcnNlKHRyYXZlcnNhbFRvU3RhcnRPZkRlbGV0ZSlcbiAgICAgICAgY29uc3QgZGVsZXRpb25FbmQgPSBkZWxldGlvblN0YXJ0LnRyYXZlcnNlKG9sZEV4dGVudClcbiAgICAgICAgc2VsZWN0aW9uLnNldEJ1ZmZlclJhbmdlKFtkZWxldGlvblN0YXJ0LCBkZWxldGlvbkVuZF0pXG4gICAgICB9XG4gICAgICB0ZXh0VG9JbnNlcnQgPSBuZXdUZXh0XG4gICAgfSBlbHNlIHtcbiAgICAgIHRleHRUb0luc2VydCA9IFwiXCJcbiAgICB9XG4gICAgc2VsZWN0aW9uLmluc2VydFRleHQodGV4dFRvSW5zZXJ0LCB7YXV0b0luZGVudDogdHJ1ZX0pXG4gIH1cblxuICAvLyBjYWxsZWQgd2hlbiByZXBlYXRlZFxuICAvLyBbRklYTUVdIHRvIHVzZSByZXBsYXlMYXN0Q2hhbmdlIGluIHJlcGVhdEluc2VydCBvdmVycmlkaW5nIHN1YmNsYXNzcy5cbiAgcmVwZWF0SW5zZXJ0KHNlbGVjdGlvbiwgdGV4dCkge1xuICAgIHRoaXMucmVwbGF5TGFzdENoYW5nZShzZWxlY3Rpb24pXG4gIH1cblxuICBnZXRJbnNlcnRpb25Db3VudCgpIHtcbiAgICBpZiAodGhpcy5pbnNlcnRpb25Db3VudCA9PSBudWxsKSB7XG4gICAgICB0aGlzLmluc2VydGlvbkNvdW50ID0gdGhpcy5zdXBwb3J0SW5zZXJ0aW9uQ291bnQgPyB0aGlzLmdldENvdW50KC0xKSA6IDBcbiAgICB9XG4gICAgLy8gQXZvaWQgZnJlZXppbmcgYnkgYWNjY2lkZW50YWwgYmlnIGNvdW50KGUuZy4gYDU1NTU1NTU1NTU1NTVpYCksIFNlZSAjNTYwLCAjNTk2XG4gICAgcmV0dXJuIHRoaXMudXRpbHMubGltaXROdW1iZXIodGhpcy5pbnNlcnRpb25Db3VudCwge21heDogMTAwfSlcbiAgfVxuXG4gIGV4ZWN1dGUoKSB7XG4gICAgaWYgKHRoaXMucmVwZWF0ZWQpIHtcbiAgICAgIHRoaXMuZmxhc2hUYXJnZXQgPSB0aGlzLnRyYWNrQ2hhbmdlID0gdHJ1ZVxuXG4gICAgICB0aGlzLnN0YXJ0TXV0YXRpb24oKCkgPT4ge1xuICAgICAgICBpZiAodGhpcy50YXJnZXQpIHRoaXMuc2VsZWN0VGFyZ2V0KClcbiAgICAgICAgaWYgKHRoaXMubXV0YXRlVGV4dCkgdGhpcy5tdXRhdGVUZXh0KClcblxuICAgICAgICBmb3IgKGNvbnN0IHNlbGVjdGlvbiBvZiB0aGlzLmVkaXRvci5nZXRTZWxlY3Rpb25zKCkpIHtcbiAgICAgICAgICBjb25zdCB0ZXh0VG9JbnNlcnQgPSAodGhpcy5sYXN0Q2hhbmdlICYmIHRoaXMubGFzdENoYW5nZS5uZXdUZXh0KSB8fCBcIlwiXG4gICAgICAgICAgdGhpcy5yZXBlYXRJbnNlcnQoc2VsZWN0aW9uLCB0ZXh0VG9JbnNlcnQpXG4gICAgICAgICAgdGhpcy51dGlscy5tb3ZlQ3Vyc29yTGVmdChzZWxlY3Rpb24uY3Vyc29yKVxuICAgICAgICB9XG4gICAgICAgIHRoaXMubXV0YXRpb25NYW5hZ2VyLnNldENoZWNrcG9pbnQoXCJkaWQtZmluaXNoXCIpXG4gICAgICB9KVxuXG4gICAgICBpZiAodGhpcy5nZXRDb25maWcoXCJjbGVhck11bHRpcGxlQ3Vyc29yc09uRXNjYXBlSW5zZXJ0TW9kZVwiKSkgdGhpcy52aW1TdGF0ZS5jbGVhclNlbGVjdGlvbnMoKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLm5vcm1hbGl6ZVNlbGVjdGlvbnNJZk5lY2Vzc2FyeSgpXG4gICAgICB0aGlzLmNyZWF0ZUJ1ZmZlckNoZWNrcG9pbnQoXCJ1bmRvXCIpXG4gICAgICBpZiAodGhpcy50YXJnZXQpIHRoaXMuc2VsZWN0VGFyZ2V0KClcbiAgICAgIHRoaXMub2JzZXJ2ZVdpbGxEZWFjdGl2YXRlTW9kZSgpXG4gICAgICBpZiAodGhpcy5tdXRhdGVUZXh0KSB0aGlzLm11dGF0ZVRleHQoKVxuXG4gICAgICBpZiAodGhpcy5nZXRJbnNlcnRpb25Db3VudCgpID4gMCkge1xuICAgICAgICBjb25zdCBjaGFuZ2UgPSB0aGlzLmdldENoYW5nZVNpbmNlQ2hlY2twb2ludChcInVuZG9cIilcbiAgICAgICAgdGhpcy50ZXh0QnlPcGVyYXRvciA9IChjaGFuZ2UgJiYgY2hhbmdlLm5ld1RleHQpIHx8IFwiXCJcbiAgICAgIH1cblxuICAgICAgdGhpcy5jcmVhdGVCdWZmZXJDaGVja3BvaW50KFwiaW5zZXJ0XCIpXG4gICAgICBjb25zdCB0b3BDdXJzb3IgPSB0aGlzLmVkaXRvci5nZXRDdXJzb3JzT3JkZXJlZEJ5QnVmZmVyUG9zaXRpb24oKVswXVxuICAgICAgdGhpcy50b3BDdXJzb3JQb3NpdGlvbkF0SW5zZXJ0aW9uU3RhcnQgPSB0b3BDdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuXG4gICAgICAvLyBTa2lwIG5vcm1hbGl6YXRpb24gb2YgYmxvY2t3aXNlU2VsZWN0aW9uLlxuICAgICAgLy8gU2luY2Ugd2FudCB0byBrZWVwIG11bHRpLWN1cnNvciBhbmQgaXQncyBwb3NpdGlvbiBpbiB3aGVuIHNoaWZ0IHRvIGluc2VydC1tb2RlLlxuICAgICAgZm9yIChjb25zdCBibG9ja3dpc2VTZWxlY3Rpb24gb2YgdGhpcy5nZXRCbG9ja3dpc2VTZWxlY3Rpb25zKCkpIHtcbiAgICAgICAgYmxvY2t3aXNlU2VsZWN0aW9uLnNraXBOb3JtYWxpemF0aW9uKClcbiAgICAgIH1cbiAgICAgIHRoaXMuYWN0aXZhdGVNb2RlKFwiaW5zZXJ0XCIsIHRoaXMuZmluYWxTdWJtb2RlKVxuICAgIH1cbiAgfVxufVxuQWN0aXZhdGVJbnNlcnRNb2RlLnJlZ2lzdGVyKClcblxuY2xhc3MgQWN0aXZhdGVSZXBsYWNlTW9kZSBleHRlbmRzIEFjdGl2YXRlSW5zZXJ0TW9kZSB7XG4gIGZpbmFsU3VibW9kZSA9IFwicmVwbGFjZVwiXG5cbiAgcmVwZWF0SW5zZXJ0KHNlbGVjdGlvbiwgdGV4dCkge1xuICAgIGZvciAoY29uc3QgY2hhciBvZiB0ZXh0KSB7XG4gICAgICBpZiAoY2hhciA9PT0gXCJcXG5cIikgY29udGludWVcbiAgICAgIGlmIChzZWxlY3Rpb24uY3Vyc29yLmlzQXRFbmRPZkxpbmUoKSkgYnJlYWtcbiAgICAgIHNlbGVjdGlvbi5zZWxlY3RSaWdodCgpXG4gICAgfVxuICAgIHNlbGVjdGlvbi5pbnNlcnRUZXh0KHRleHQsIHthdXRvSW5kZW50OiBmYWxzZX0pXG4gIH1cbn1cbkFjdGl2YXRlUmVwbGFjZU1vZGUucmVnaXN0ZXIoKVxuXG5jbGFzcyBJbnNlcnRBZnRlciBleHRlbmRzIEFjdGl2YXRlSW5zZXJ0TW9kZSB7XG4gIGV4ZWN1dGUoKSB7XG4gICAgZm9yIChjb25zdCBjdXJzb3Igb2YgdGhpcy5lZGl0b3IuZ2V0Q3Vyc29ycygpKSB7XG4gICAgICB0aGlzLnV0aWxzLm1vdmVDdXJzb3JSaWdodChjdXJzb3IpXG4gICAgfVxuICAgIHN1cGVyLmV4ZWN1dGUoKVxuICB9XG59XG5JbnNlcnRBZnRlci5yZWdpc3RlcigpXG5cbi8vIGtleTogJ2cgSScgaW4gYWxsIG1vZGVcbmNsYXNzIEluc2VydEF0QmVnaW5uaW5nT2ZMaW5lIGV4dGVuZHMgQWN0aXZhdGVJbnNlcnRNb2RlIHtcbiAgZXhlY3V0ZSgpIHtcbiAgICBpZiAodGhpcy5tb2RlID09PSBcInZpc3VhbFwiICYmIHRoaXMuc3VibW9kZSAhPT0gXCJibG9ja3dpc2VcIikge1xuICAgICAgdGhpcy5lZGl0b3Iuc3BsaXRTZWxlY3Rpb25zSW50b0xpbmVzKClcbiAgICB9XG4gICAgdGhpcy5lZGl0b3IubW92ZVRvQmVnaW5uaW5nT2ZMaW5lKClcbiAgICBzdXBlci5leGVjdXRlKClcbiAgfVxufVxuSW5zZXJ0QXRCZWdpbm5pbmdPZkxpbmUucmVnaXN0ZXIoKVxuXG4vLyBrZXk6IG5vcm1hbCAnQSdcbmNsYXNzIEluc2VydEFmdGVyRW5kT2ZMaW5lIGV4dGVuZHMgQWN0aXZhdGVJbnNlcnRNb2RlIHtcbiAgZXhlY3V0ZSgpIHtcbiAgICB0aGlzLmVkaXRvci5tb3ZlVG9FbmRPZkxpbmUoKVxuICAgIHN1cGVyLmV4ZWN1dGUoKVxuICB9XG59XG5JbnNlcnRBZnRlckVuZE9mTGluZS5yZWdpc3RlcigpXG5cbi8vIGtleTogbm9ybWFsICdJJ1xuY2xhc3MgSW5zZXJ0QXRGaXJzdENoYXJhY3Rlck9mTGluZSBleHRlbmRzIEFjdGl2YXRlSW5zZXJ0TW9kZSB7XG4gIGV4ZWN1dGUoKSB7XG4gICAgdGhpcy5lZGl0b3IubW92ZVRvQmVnaW5uaW5nT2ZMaW5lKClcbiAgICB0aGlzLmVkaXRvci5tb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZSgpXG4gICAgc3VwZXIuZXhlY3V0ZSgpXG4gIH1cbn1cbkluc2VydEF0Rmlyc3RDaGFyYWN0ZXJPZkxpbmUucmVnaXN0ZXIoKVxuXG5jbGFzcyBJbnNlcnRBdExhc3RJbnNlcnQgZXh0ZW5kcyBBY3RpdmF0ZUluc2VydE1vZGUge1xuICBleGVjdXRlKCkge1xuICAgIGNvbnN0IHBvaW50ID0gdGhpcy52aW1TdGF0ZS5tYXJrLmdldChcIl5cIilcbiAgICBpZiAocG9pbnQpIHtcbiAgICAgIHRoaXMuZWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKHBvaW50KVxuICAgICAgdGhpcy5lZGl0b3Iuc2Nyb2xsVG9DdXJzb3JQb3NpdGlvbih7Y2VudGVyOiB0cnVlfSlcbiAgICB9XG4gICAgc3VwZXIuZXhlY3V0ZSgpXG4gIH1cbn1cbkluc2VydEF0TGFzdEluc2VydC5yZWdpc3RlcigpXG5cbmNsYXNzIEluc2VydEFib3ZlV2l0aE5ld2xpbmUgZXh0ZW5kcyBBY3RpdmF0ZUluc2VydE1vZGUge1xuICBpbml0aWFsaXplKCkge1xuICAgIGlmICh0aGlzLmdldENvbmZpZyhcImdyb3VwQ2hhbmdlc1doZW5MZWF2aW5nSW5zZXJ0TW9kZVwiKSkge1xuICAgICAgdGhpcy5vcmlnaW5hbEN1cnNvclBvc2l0aW9uTWFya2VyID0gdGhpcy5lZGl0b3IubWFya0J1ZmZlclBvc2l0aW9uKHRoaXMuZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCkpXG4gICAgfVxuICAgIHN1cGVyLmluaXRpYWxpemUoKVxuICB9XG5cbiAgLy8gVGhpcyBpcyBmb3IgYG9gIGFuZCBgT2Agb3BlcmF0b3IuXG4gIC8vIE9uIHVuZG8vcmVkbyBwdXQgY3Vyc29yIGF0IG9yaWdpbmFsIHBvaW50IHdoZXJlIHVzZXIgdHlwZSBgb2Agb3IgYE9gLlxuICBncm91cENoYW5nZXNTaW5jZUJ1ZmZlckNoZWNrcG9pbnQocHVycG9zZSkge1xuICAgIGNvbnN0IGxhc3RDdXJzb3IgPSB0aGlzLmVkaXRvci5nZXRMYXN0Q3Vyc29yKClcbiAgICBjb25zdCBjdXJzb3JQb3NpdGlvbiA9IGxhc3RDdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuICAgIGxhc3RDdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24odGhpcy5vcmlnaW5hbEN1cnNvclBvc2l0aW9uTWFya2VyLmdldEhlYWRCdWZmZXJQb3NpdGlvbigpKVxuICAgIHRoaXMub3JpZ2luYWxDdXJzb3JQb3NpdGlvbk1hcmtlci5kZXN0cm95KClcblxuICAgIHN1cGVyLmdyb3VwQ2hhbmdlc1NpbmNlQnVmZmVyQ2hlY2twb2ludChwdXJwb3NlKVxuXG4gICAgbGFzdEN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihjdXJzb3JQb3NpdGlvbilcbiAgfVxuXG4gIGF1dG9JbmRlbnRFbXB0eVJvd3MoKSB7XG4gICAgZm9yIChjb25zdCBjdXJzb3Igb2YgdGhpcy5lZGl0b3IuZ2V0Q3Vyc29ycygpKSB7XG4gICAgICBjb25zdCByb3cgPSBjdXJzb3IuZ2V0QnVmZmVyUm93KClcbiAgICAgIGlmICh0aGlzLnV0aWxzLmlzRW1wdHlSb3codGhpcy5lZGl0b3IsIHJvdykpIHtcbiAgICAgICAgdGhpcy5lZGl0b3IuYXV0b0luZGVudEJ1ZmZlclJvdyhyb3cpXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgbXV0YXRlVGV4dCgpIHtcbiAgICB0aGlzLmVkaXRvci5pbnNlcnROZXdsaW5lQWJvdmUoKVxuICAgIGlmICh0aGlzLmVkaXRvci5hdXRvSW5kZW50KSB7XG4gICAgICB0aGlzLmF1dG9JbmRlbnRFbXB0eVJvd3MoKVxuICAgIH1cbiAgfVxuXG4gIHJlcGVhdEluc2VydChzZWxlY3Rpb24sIHRleHQpIHtcbiAgICBzZWxlY3Rpb24uaW5zZXJ0VGV4dCh0ZXh0LnRyaW1MZWZ0KCksIHthdXRvSW5kZW50OiB0cnVlfSlcbiAgfVxufVxuSW5zZXJ0QWJvdmVXaXRoTmV3bGluZS5yZWdpc3RlcigpXG5cbmNsYXNzIEluc2VydEJlbG93V2l0aE5ld2xpbmUgZXh0ZW5kcyBJbnNlcnRBYm92ZVdpdGhOZXdsaW5lIHtcbiAgbXV0YXRlVGV4dCgpIHtcbiAgICBmb3IgKGNvbnN0IGN1cnNvciBvZiB0aGlzLmVkaXRvci5nZXRDdXJzb3JzKCkpIHtcbiAgICAgIHRoaXMudXRpbHMuc2V0QnVmZmVyUm93KGN1cnNvciwgdGhpcy5nZXRGb2xkRW5kUm93Rm9yUm93KGN1cnNvci5nZXRCdWZmZXJSb3coKSkpXG4gICAgfVxuXG4gICAgdGhpcy5lZGl0b3IuaW5zZXJ0TmV3bGluZUJlbG93KClcbiAgICBpZiAodGhpcy5lZGl0b3IuYXV0b0luZGVudCkgdGhpcy5hdXRvSW5kZW50RW1wdHlSb3dzKClcbiAgfVxufVxuSW5zZXJ0QmVsb3dXaXRoTmV3bGluZS5yZWdpc3RlcigpXG5cbi8vIEFkdmFuY2VkIEluc2VydGlvblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgSW5zZXJ0QnlUYXJnZXQgZXh0ZW5kcyBBY3RpdmF0ZUluc2VydE1vZGUge1xuICByZXF1aXJlVGFyZ2V0ID0gdHJ1ZVxuICB3aGljaCA9IG51bGwgLy8gb25lIG9mIFsnc3RhcnQnLCAnZW5kJywgJ2hlYWQnLCAndGFpbCddXG5cbiAgaW5pdGlhbGl6ZSgpIHtcbiAgICAvLyBIQUNLXG4gICAgLy8gV2hlbiBnIGkgaXMgbWFwcGVkIHRvIGBpbnNlcnQtYXQtc3RhcnQtb2YtdGFyZ2V0YC5cbiAgICAvLyBgZyBpIDMgbGAgc3RhcnQgaW5zZXJ0IGF0IDMgY29sdW1uIHJpZ2h0IHBvc2l0aW9uLlxuICAgIC8vIEluIHRoaXMgY2FzZSwgd2UgZG9uJ3Qgd2FudCByZXBlYXQgaW5zZXJ0aW9uIDMgdGltZXMuXG4gICAgLy8gVGhpcyBAZ2V0Q291bnQoKSBjYWxsIGNhY2hlIG51bWJlciBhdCB0aGUgdGltaW5nIEJFRk9SRSAnMycgaXMgc3BlY2lmaWVkLlxuICAgIHRoaXMuZ2V0Q291bnQoKVxuICAgIHN1cGVyLmluaXRpYWxpemUoKVxuICB9XG5cbiAgZXhlY3V0ZSgpIHtcbiAgICB0aGlzLm9uRGlkU2VsZWN0VGFyZ2V0KCgpID0+IHtcbiAgICAgIC8vIEluIHZDL3ZMLCB3aGVuIG9jY3VycmVuY2UgbWFya2VyIHdhcyBOT1Qgc2VsZWN0ZWQsXG4gICAgICAvLyBpdCBiZWhhdmUncyB2ZXJ5IHNwZWNpYWxseVxuICAgICAgLy8gdkM6IGBJYCBhbmQgYEFgIGJlaGF2ZXMgYXMgc2hvZnQgaGFuZCBvZiBgY3RybC12IElgIGFuZCBgY3RybC12IEFgLlxuICAgICAgLy8gdkw6IGBJYCBhbmQgYEFgIHBsYWNlIGN1cnNvcnMgYXQgZWFjaCBzZWxlY3RlZCBsaW5lcyBvZiBzdGFydCggb3IgZW5kICkgb2Ygbm9uLXdoaXRlLXNwYWNlIGNoYXIuXG4gICAgICBpZiAoIXRoaXMub2NjdXJyZW5jZVNlbGVjdGVkICYmIHRoaXMubW9kZSA9PT0gXCJ2aXN1YWxcIiAmJiB0aGlzLnN1Ym1vZGUgIT09IFwiYmxvY2t3aXNlXCIpIHtcbiAgICAgICAgZm9yIChjb25zdCAkc2VsZWN0aW9uIG9mIHRoaXMuc3dyYXAuZ2V0U2VsZWN0aW9ucyh0aGlzLmVkaXRvcikpIHtcbiAgICAgICAgICAkc2VsZWN0aW9uLm5vcm1hbGl6ZSgpXG4gICAgICAgICAgJHNlbGVjdGlvbi5hcHBseVdpc2UoXCJibG9ja3dpc2VcIilcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLnN1Ym1vZGUgPT09IFwibGluZXdpc2VcIikge1xuICAgICAgICAgIGZvciAoY29uc3QgYmxvY2t3aXNlU2VsZWN0aW9uIG9mIHRoaXMuZ2V0QmxvY2t3aXNlU2VsZWN0aW9ucygpKSB7XG4gICAgICAgICAgICBibG9ja3dpc2VTZWxlY3Rpb24uZXhwYW5kTWVtYmVyU2VsZWN0aW9uc092ZXJMaW5lV2l0aFRyaW1SYW5nZSgpXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGZvciAoY29uc3QgJHNlbGVjdGlvbiBvZiB0aGlzLnN3cmFwLmdldFNlbGVjdGlvbnModGhpcy5lZGl0b3IpKSB7XG4gICAgICAgICRzZWxlY3Rpb24uc2V0QnVmZmVyUG9zaXRpb25Ubyh0aGlzLndoaWNoKVxuICAgICAgfVxuICAgIH0pXG4gICAgc3VwZXIuZXhlY3V0ZSgpXG4gIH1cbn1cbkluc2VydEJ5VGFyZ2V0LnJlZ2lzdGVyKGZhbHNlKVxuXG4vLyBrZXk6ICdJJywgVXNlZCBpbiAndmlzdWFsLW1vZGUuY2hhcmFjdGVyd2lzZScsIHZpc3VhbC1tb2RlLmJsb2Nrd2lzZVxuY2xhc3MgSW5zZXJ0QXRTdGFydE9mVGFyZ2V0IGV4dGVuZHMgSW5zZXJ0QnlUYXJnZXQge1xuICB3aGljaCA9IFwic3RhcnRcIlxufVxuSW5zZXJ0QXRTdGFydE9mVGFyZ2V0LnJlZ2lzdGVyKClcblxuLy8ga2V5OiAnQScsIFVzZWQgaW4gJ3Zpc3VhbC1tb2RlLmNoYXJhY3Rlcndpc2UnLCAndmlzdWFsLW1vZGUuYmxvY2t3aXNlJ1xuY2xhc3MgSW5zZXJ0QXRFbmRPZlRhcmdldCBleHRlbmRzIEluc2VydEJ5VGFyZ2V0IHtcbiAgd2hpY2ggPSBcImVuZFwiXG59XG5JbnNlcnRBdEVuZE9mVGFyZ2V0LnJlZ2lzdGVyKClcblxuY2xhc3MgSW5zZXJ0QXRIZWFkT2ZUYXJnZXQgZXh0ZW5kcyBJbnNlcnRCeVRhcmdldCB7XG4gIHdoaWNoID0gXCJoZWFkXCJcbn1cbkluc2VydEF0SGVhZE9mVGFyZ2V0LnJlZ2lzdGVyKClcblxuY2xhc3MgSW5zZXJ0QXRTdGFydE9mT2NjdXJyZW5jZSBleHRlbmRzIEluc2VydEF0U3RhcnRPZlRhcmdldCB7XG4gIG9jY3VycmVuY2UgPSB0cnVlXG59XG5JbnNlcnRBdFN0YXJ0T2ZPY2N1cnJlbmNlLnJlZ2lzdGVyKClcblxuY2xhc3MgSW5zZXJ0QXRFbmRPZk9jY3VycmVuY2UgZXh0ZW5kcyBJbnNlcnRBdEVuZE9mVGFyZ2V0IHtcbiAgb2NjdXJyZW5jZSA9IHRydWVcbn1cbkluc2VydEF0RW5kT2ZPY2N1cnJlbmNlLnJlZ2lzdGVyKClcblxuY2xhc3MgSW5zZXJ0QXRIZWFkT2ZPY2N1cnJlbmNlIGV4dGVuZHMgSW5zZXJ0QXRIZWFkT2ZUYXJnZXQge1xuICBvY2N1cnJlbmNlID0gdHJ1ZVxufVxuSW5zZXJ0QXRIZWFkT2ZPY2N1cnJlbmNlLnJlZ2lzdGVyKClcblxuY2xhc3MgSW5zZXJ0QXRTdGFydE9mU3Vid29yZE9jY3VycmVuY2UgZXh0ZW5kcyBJbnNlcnRBdFN0YXJ0T2ZPY2N1cnJlbmNlIHtcbiAgb2NjdXJyZW5jZVR5cGUgPSBcInN1YndvcmRcIlxufVxuSW5zZXJ0QXRTdGFydE9mU3Vid29yZE9jY3VycmVuY2UucmVnaXN0ZXIoKVxuXG5jbGFzcyBJbnNlcnRBdEVuZE9mU3Vid29yZE9jY3VycmVuY2UgZXh0ZW5kcyBJbnNlcnRBdEVuZE9mT2NjdXJyZW5jZSB7XG4gIG9jY3VycmVuY2VUeXBlID0gXCJzdWJ3b3JkXCJcbn1cbkluc2VydEF0RW5kT2ZTdWJ3b3JkT2NjdXJyZW5jZS5yZWdpc3RlcigpXG5cbmNsYXNzIEluc2VydEF0SGVhZE9mU3Vid29yZE9jY3VycmVuY2UgZXh0ZW5kcyBJbnNlcnRBdEhlYWRPZk9jY3VycmVuY2Uge1xuICBvY2N1cnJlbmNlVHlwZSA9IFwic3Vid29yZFwiXG59XG5JbnNlcnRBdEhlYWRPZlN1YndvcmRPY2N1cnJlbmNlLnJlZ2lzdGVyKClcblxuY2xhc3MgSW5zZXJ0QXRTdGFydE9mU21hcnRXb3JkIGV4dGVuZHMgSW5zZXJ0QnlUYXJnZXQge1xuICB3aGljaCA9IFwic3RhcnRcIlxuICB0YXJnZXQgPSBcIk1vdmVUb1ByZXZpb3VzU21hcnRXb3JkXCJcbn1cbkluc2VydEF0U3RhcnRPZlNtYXJ0V29yZC5yZWdpc3RlcigpXG5cbmNsYXNzIEluc2VydEF0RW5kT2ZTbWFydFdvcmQgZXh0ZW5kcyBJbnNlcnRCeVRhcmdldCB7XG4gIHdoaWNoID0gXCJlbmRcIlxuICB0YXJnZXQgPSBcIk1vdmVUb0VuZE9mU21hcnRXb3JkXCJcbn1cbkluc2VydEF0RW5kT2ZTbWFydFdvcmQucmVnaXN0ZXIoKVxuXG5jbGFzcyBJbnNlcnRBdFByZXZpb3VzRm9sZFN0YXJ0IGV4dGVuZHMgSW5zZXJ0QnlUYXJnZXQge1xuICB3aGljaCA9IFwic3RhcnRcIlxuICB0YXJnZXQgPSBcIk1vdmVUb1ByZXZpb3VzRm9sZFN0YXJ0XCJcbn1cbkluc2VydEF0UHJldmlvdXNGb2xkU3RhcnQucmVnaXN0ZXIoKVxuXG5jbGFzcyBJbnNlcnRBdE5leHRGb2xkU3RhcnQgZXh0ZW5kcyBJbnNlcnRCeVRhcmdldCB7XG4gIHdoaWNoID0gXCJlbmRcIlxuICB0YXJnZXQgPSBcIk1vdmVUb05leHRGb2xkU3RhcnRcIlxufVxuSW5zZXJ0QXROZXh0Rm9sZFN0YXJ0LnJlZ2lzdGVyKClcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgQ2hhbmdlIGV4dGVuZHMgQWN0aXZhdGVJbnNlcnRNb2RlIHtcbiAgcmVxdWlyZVRhcmdldCA9IHRydWVcbiAgdHJhY2tDaGFuZ2UgPSB0cnVlXG4gIHN1cHBvcnRJbnNlcnRpb25Db3VudCA9IGZhbHNlXG5cbiAgbXV0YXRlVGV4dCgpIHtcbiAgICAvLyBBbGx3YXlzIGR5bmFtaWNhbGx5IGRldGVybWluZSBzZWxlY3Rpb24gd2lzZSB3dGhvdXQgY29uc3VsdGluZyB0YXJnZXQud2lzZVxuICAgIC8vIFJlYXNvbjogd2hlbiBgYyBpIHtgLCB3aXNlIGlzICdjaGFyYWN0ZXJ3aXNlJywgYnV0IGFjdHVhbGx5IHNlbGVjdGVkIHJhbmdlIGlzICdsaW5ld2lzZSdcbiAgICAvLyAgIHtcbiAgICAvLyAgICAgYVxuICAgIC8vICAgfVxuICAgIGNvbnN0IGlzTGluZXdpc2VUYXJnZXQgPSB0aGlzLnN3cmFwLmRldGVjdFdpc2UodGhpcy5lZGl0b3IpID09PSBcImxpbmV3aXNlXCJcbiAgICBmb3IgKGNvbnN0IHNlbGVjdGlvbiBvZiB0aGlzLmVkaXRvci5nZXRTZWxlY3Rpb25zKCkpIHtcbiAgICAgIGlmICghdGhpcy5nZXRDb25maWcoXCJkb250VXBkYXRlUmVnaXN0ZXJPbkNoYW5nZU9yU3Vic3RpdHV0ZVwiKSkge1xuICAgICAgICB0aGlzLnNldFRleHRUb1JlZ2lzdGVyRm9yU2VsZWN0aW9uKHNlbGVjdGlvbilcbiAgICAgIH1cbiAgICAgIGlmIChpc0xpbmV3aXNlVGFyZ2V0KSB7XG4gICAgICAgIHNlbGVjdGlvbi5pbnNlcnRUZXh0KFwiXFxuXCIsIHthdXRvSW5kZW50OiB0cnVlfSlcbiAgICAgICAgc2VsZWN0aW9uLmN1cnNvci5tb3ZlTGVmdCgpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzZWxlY3Rpb24uaW5zZXJ0VGV4dChcIlwiLCB7YXV0b0luZGVudDogdHJ1ZX0pXG4gICAgICB9XG4gICAgfVxuICB9XG59XG5DaGFuZ2UucmVnaXN0ZXIoKVxuXG5jbGFzcyBDaGFuZ2VPY2N1cnJlbmNlIGV4dGVuZHMgQ2hhbmdlIHtcbiAgb2NjdXJyZW5jZSA9IHRydWVcbn1cbkNoYW5nZU9jY3VycmVuY2UucmVnaXN0ZXIoKVxuXG5jbGFzcyBTdWJzdGl0dXRlIGV4dGVuZHMgQ2hhbmdlIHtcbiAgdGFyZ2V0ID0gXCJNb3ZlUmlnaHRcIlxufVxuU3Vic3RpdHV0ZS5yZWdpc3RlcigpXG5cbmNsYXNzIFN1YnN0aXR1dGVMaW5lIGV4dGVuZHMgQ2hhbmdlIHtcbiAgd2lzZSA9IFwibGluZXdpc2VcIiAvLyBbRklYTUVdIHRvIHJlLW92ZXJyaWRlIHRhcmdldC53aXNlIGluIHZpc3VhbC1tb2RlXG4gIHRhcmdldCA9IFwiTW92ZVRvUmVsYXRpdmVMaW5lXCJcbn1cblN1YnN0aXR1dGVMaW5lLnJlZ2lzdGVyKClcblxuLy8gYWxpYXNcbmNsYXNzIENoYW5nZUxpbmUgZXh0ZW5kcyBTdWJzdGl0dXRlTGluZSB7fVxuQ2hhbmdlTGluZS5yZWdpc3RlcigpXG5cbmNsYXNzIENoYW5nZVRvTGFzdENoYXJhY3Rlck9mTGluZSBleHRlbmRzIENoYW5nZSB7XG4gIHRhcmdldCA9IFwiTW92ZVRvTGFzdENoYXJhY3Rlck9mTGluZVwiXG5cbiAgZXhlY3V0ZSgpIHtcbiAgICB0aGlzLm9uRGlkU2VsZWN0VGFyZ2V0KCgpID0+IHtcbiAgICAgIGlmICh0aGlzLnRhcmdldC53aXNlID09PSBcImJsb2Nrd2lzZVwiKSB7XG4gICAgICAgIGZvciAoY29uc3QgYmxvY2t3aXNlU2VsZWN0aW9uIG9mIHRoaXMuZ2V0QmxvY2t3aXNlU2VsZWN0aW9ucygpKSB7XG4gICAgICAgICAgYmxvY2t3aXNlU2VsZWN0aW9uLmV4dGVuZE1lbWJlclNlbGVjdGlvbnNUb0VuZE9mTGluZSgpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuICAgIHN1cGVyLmV4ZWN1dGUoKVxuICB9XG59XG5DaGFuZ2VUb0xhc3RDaGFyYWN0ZXJPZkxpbmUucmVnaXN0ZXIoKVxuIl19