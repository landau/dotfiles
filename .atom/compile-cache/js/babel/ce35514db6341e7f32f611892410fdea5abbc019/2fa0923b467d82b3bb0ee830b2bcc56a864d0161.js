"use babel";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _ = require("underscore-plus");

var _require = require("atom");

var Range = _require.Range;

var _require2 = require("./utils");

var moveCursorLeft = _require2.moveCursorLeft;
var moveCursorRight = _require2.moveCursorRight;
var limitNumber = _require2.limitNumber;
var isEmptyRow = _require2.isEmptyRow;
var setBufferRow = _require2.setBufferRow;

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
      return limitNumber(this.insertionCount, { max: 100 });
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
            moveCursorLeft(selection.cursor);
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
        moveCursorRight(cursor);
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
      return _get(Object.getPrototypeOf(InsertAboveWithNewline.prototype), "initialize", this).call(this);
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
        if (isEmptyRow(this.editor, row)) {
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
        setBufferRow(cursor, this.getFoldEndRowForRow(cursor.getBufferRow()));
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
      return _get(Object.getPrototypeOf(InsertByTarget.prototype), "initialize", this).call(this);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL29wZXJhdG9yLWluc2VydC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxXQUFXLENBQUE7Ozs7Ozs7Ozs7QUFFWCxJQUFNLENBQUMsR0FBRyxPQUFPLENBQUMsaUJBQWlCLENBQUMsQ0FBQTs7ZUFDcEIsT0FBTyxDQUFDLE1BQU0sQ0FBQzs7SUFBeEIsS0FBSyxZQUFMLEtBQUs7O2dCQUVxRSxPQUFPLENBQUMsU0FBUyxDQUFDOztJQUE1RixjQUFjLGFBQWQsY0FBYztJQUFFLGVBQWUsYUFBZixlQUFlO0lBQUUsV0FBVyxhQUFYLFdBQVc7SUFBRSxVQUFVLGFBQVYsVUFBVTtJQUFFLFlBQVksYUFBWixZQUFZOztBQUM3RSxJQUFNLFFBQVEsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFBOzs7Ozs7O0lBTWpELGtCQUFrQjtZQUFsQixrQkFBa0I7O1dBQWxCLGtCQUFrQjswQkFBbEIsa0JBQWtCOzsrQkFBbEIsa0JBQWtCOztTQUN0QixhQUFhLEdBQUcsS0FBSztTQUNyQixXQUFXLEdBQUcsS0FBSztTQUNuQixZQUFZLEdBQUcsSUFBSTtTQUNuQixxQkFBcUIsR0FBRyxJQUFJOzs7ZUFKeEIsa0JBQWtCOztXQU1HLHFDQUFHOzs7QUFDMUIsVUFBSSxVQUFVLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMseUJBQXlCLENBQUMsVUFBQyxJQUFNLEVBQUs7WUFBVixJQUFJLEdBQUwsSUFBTSxDQUFMLElBQUk7O0FBQ3pFLFlBQUksSUFBSSxLQUFLLFFBQVEsRUFBRSxPQUFNO0FBQzdCLGtCQUFVLENBQUMsT0FBTyxFQUFFLENBQUE7O0FBRXBCLGNBQUssUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLE1BQUssTUFBTSxDQUFDLHVCQUF1QixFQUFFLENBQUMs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V0FBVixVQUFVOzBCQUFWLFVBQVU7OytCQUFWLFVBQVU7O1NBQ2QsTUFBTSxHQUFHLFdBQVc7OztTQURoQixVQUFVO0dBQVMsTUFBTTs7QUFHL0IsVUFBVSxDQUFDLFFBQVEsRUFBRSxDQUFBOztJQUVmLGNBQWM7WUFBZCxjQUFjOztXQUFkLGNBQWM7MEJBQWQsY0FBYzs7K0JBQWQsY0FBYzs7U0FDbEIsSUFBSSxHQUFHLFVBQVU7U0FDakIsTUFBTSxHQUFHLG9CQUFvQjs7O1NBRnpCLGNBQWM7R0FBUyxNQUFNOztBQUluQyxjQUFjLENBQUMsUUFBUSxFQUFFLENBQUE7Ozs7SUFHbkIsVUFBVTtZQUFWLFVBQVU7O1dBQVYsVUFBVTswQkFBVixVQUFVOzsrQkFBVixVQUFVOzs7U0FBVixVQUFVO0dBQVMsY0FBYzs7QUFDdkMsVUFBVSxDQUFDLFFBQVEsRUFBRSxDQUFBOztJQUVmLDJCQUEyQjtZQUEzQiwyQkFBMkI7O1dBQTNCLDJCQUEyQjswQkFBM0IsMkJBQTJCOzsrQkFBM0IsMkJBQTJCOztTQUMvQixNQUFNLEdBQUcsMkJBQTJCOzs7ZUFEaEMsMkJBQTJCOztXQUd4QixtQkFBRzs7O0FBQ1IsVUFBSSxDQUFDLGlCQUFpQixDQUFDLFlBQU07QUFDM0IsWUFBSSxPQUFLLE1BQU0sQ0FBQyxJQUFJLEtBQUssV0FBVyxFQUFFO0FBQ3BDLGVBQUssSUFBTSxrQkFBa0IsSUFBSSxPQUFLLHNCQUFzQixFQUFFLEVBQUU7QUFDOUQsOEJBQWtCLENBQUMsaUNBQWlDLEVBQUUsQ0FBQTtXQUN2RDtTQUNGO09BQ0YsQ0FBQyxDQUFBO0FBQ0YsaUNBWEUsMkJBQTJCLHlDQVdkO0tBQ2hCOzs7U0FaRywyQkFBMkI7R0FBUyxNQUFNOztBQWNoRCwyQkFBMkIsQ0FBQyxRQUFRLEVBQUUsQ0FBQSIsImZpbGUiOiIvVXNlcnMvdGxhbmRhdS9kb3RmaWxlcy8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi9vcGVyYXRvci1pbnNlcnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBiYWJlbFwiXG5cbmNvbnN0IF8gPSByZXF1aXJlKFwidW5kZXJzY29yZS1wbHVzXCIpXG5jb25zdCB7UmFuZ2V9ID0gcmVxdWlyZShcImF0b21cIilcblxuY29uc3Qge21vdmVDdXJzb3JMZWZ0LCBtb3ZlQ3Vyc29yUmlnaHQsIGxpbWl0TnVtYmVyLCBpc0VtcHR5Um93LCBzZXRCdWZmZXJSb3d9ID0gcmVxdWlyZShcIi4vdXRpbHNcIilcbmNvbnN0IE9wZXJhdG9yID0gcmVxdWlyZShcIi4vYmFzZVwiKS5nZXRDbGFzcyhcIk9wZXJhdG9yXCIpXG5cbi8vIE9wZXJhdG9yIHdoaWNoIHN0YXJ0ICdpbnNlcnQtbW9kZSdcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFtOT1RFXVxuLy8gUnVsZTogRG9uJ3QgbWFrZSBhbnkgdGV4dCBtdXRhdGlvbiBiZWZvcmUgY2FsbGluZyBgQHNlbGVjdFRhcmdldCgpYC5cbmNsYXNzIEFjdGl2YXRlSW5zZXJ0TW9kZSBleHRlbmRzIE9wZXJhdG9yIHtcbiAgcmVxdWlyZVRhcmdldCA9IGZhbHNlXG4gIGZsYXNoVGFyZ2V0ID0gZmFsc2VcbiAgZmluYWxTdWJtb2RlID0gbnVsbFxuICBzdXBwb3J0SW5zZXJ0aW9uQ291bnQgPSB0cnVlXG5cbiAgb2JzZXJ2ZVdpbGxEZWFjdGl2YXRlTW9kZSgpIHtcbiAgICBsZXQgZGlzcG9zYWJsZSA9IHRoaXMudmltU3RhdGUubW9kZU1hbmFnZXIucHJlZW1wdFdpbGxEZWFjdGl2YXRlTW9kZSgoe21vZGV9KSA9PiB7XG4gICAgICBpZiAobW9kZSAhPT0gXCJpbnNlcnRcIikgcmV0dXJuXG4gICAgICBkaXNwb3NhYmxlLmRpc3Bvc2UoKVxuXG4gICAgICB0aGlzLnZpbVN0YXRlLm1hcmsuc2V0KFwiXlwiLCB0aGlzLmVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpKSAvLyBMYXN0IGluc2VydC1tb2RlIHBvc2l0aW9uXG4gICAgICBsZXQgdGV4dEJ5VXNlcklucHV0ID0gXCJcIlxuICAgICAgY29uc3QgY2hhbmdlID0gdGhpcy5nZXRDaGFuZ2VTaW5jZUNoZWNrcG9pbnQoXCJpbnNlcnRcIilcbiAgICAgIGlmIChjaGFuZ2UpIHtcbiAgICAgICAgdGhpcy5sYXN0Q2hhbmdlID0gY2hhbmdlXG4gICAgICAgIHRoaXMuc2V0TWFya0ZvckNoYW5nZShuZXcgUmFuZ2UoY2hhbmdlLnN0YXJ0LCBjaGFuZ2Uuc3RhcnQudHJhdmVyc2UoY2hhbmdlLm5ld0V4dGVudCkpKVxuICAgICAgICB0ZXh0QnlVc2VySW5wdXQgPSBjaGFuZ2UubmV3VGV4dFxuICAgICAgfVxuICAgICAgdGhpcy52aW1TdGF0ZS5yZWdpc3Rlci5zZXQoXCIuXCIsIHt0ZXh0OiB0ZXh0QnlVc2VySW5wdXR9KSAvLyBMYXN0IGluc2VydGVkIHRleHRcblxuICAgICAgXy50aW1lcyh0aGlzLmdldEluc2VydGlvbkNvdW50KCksICgpID0+IHtcbiAgICAgICAgY29uc3QgdGV4dFRvSW5zZXJ0ID0gdGhpcy50ZXh0QnlPcGVyYXRvciArIHRleHRCeVVzZXJJbnB1dFxuICAgICAgICBmb3IgKGNvbnN0IHNlbGVjdGlvbiBvZiB0aGlzLmVkaXRvci5nZXRTZWxlY3Rpb25zKCkpIHtcbiAgICAgICAgICBzZWxlY3Rpb24uaW5zZXJ0VGV4dCh0ZXh0VG9JbnNlcnQsIHthdXRvSW5kZW50OiB0cnVlfSlcbiAgICAgICAgfVxuICAgICAgfSlcblxuICAgICAgLy8gVGhpcyBjdXJzb3Igc3RhdGUgaXMgcmVzdG9yZWQgb24gdW5kby5cbiAgICAgIC8vIFNvIGN1cnNvciBzdGF0ZSBoYXMgdG8gYmUgdXBkYXRlZCBiZWZvcmUgbmV4dCBncm91cENoYW5nZXNTaW5jZUNoZWNrcG9pbnQoKVxuICAgICAgaWYgKHRoaXMuZ2V0Q29uZmlnKFwiY2xlYXJNdWx0aXBsZUN1cnNvcnNPbkVzY2FwZUluc2VydE1vZGVcIikpIHtcbiAgICAgICAgdGhpcy52aW1TdGF0ZS5jbGVhclNlbGVjdGlvbnMoKVxuICAgICAgfVxuXG4gICAgICAvLyBncm91cGluZyBjaGFuZ2VzIGZvciB1bmRvIGNoZWNrcG9pbnQgbmVlZCB0byBjb21lIGxhc3RcbiAgICAgIGlmICh0aGlzLmdldENvbmZpZyhcImdyb3VwQ2hhbmdlc1doZW5MZWF2aW5nSW5zZXJ0TW9kZVwiKSkge1xuICAgICAgICByZXR1cm4gdGhpcy5ncm91cENoYW5nZXNTaW5jZUJ1ZmZlckNoZWNrcG9pbnQoXCJ1bmRvXCIpXG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIC8vIFdoZW4gZWFjaCBtdXRhaW9uJ3MgZXh0ZW50IGlzIG5vdCBpbnRlcnNlY3RpbmcsIG11aXRpcGxlIGNoYW5nZXMgYXJlIHJlY29yZGVkXG4gIC8vIGUuZ1xuICAvLyAgLSBNdWx0aWN1cnNvcnMgZWRpdFxuICAvLyAgLSBDdXJzb3IgbW92ZWQgaW4gaW5zZXJ0LW1vZGUoZS5nIGN0cmwtZiwgY3RybC1iKVxuICAvLyBCdXQgSSBkb24ndCBjYXJlIG11bHRpcGxlIGNoYW5nZXMganVzdCBiZWNhdXNlIEknbSBsYXp5KHNvIG5vdCBwZXJmZWN0IGltcGxlbWVudGF0aW9uKS5cbiAgLy8gSSBvbmx5IHRha2UgY2FyZSBvZiBvbmUgY2hhbmdlIGhhcHBlbmVkIGF0IGVhcmxpZXN0KHRvcEN1cnNvcidzIGNoYW5nZSkgcG9zaXRpb24uXG4gIC8vIFRoYXRzJyB3aHkgSSBzYXZlIHRvcEN1cnNvcidzIHBvc2l0aW9uIHRvIEB0b3BDdXJzb3JQb3NpdGlvbkF0SW5zZXJ0aW9uU3RhcnQgdG8gY29tcGFyZSB0cmF2ZXJzYWwgdG8gZGVsZXRpb25TdGFydFxuICAvLyBXaHkgSSB1c2UgdG9wQ3Vyc29yJ3MgY2hhbmdlPyBKdXN0IGJlY2F1c2UgaXQncyBlYXN5IHRvIHVzZSBmaXJzdCBjaGFuZ2UgcmV0dXJuZWQgYnkgZ2V0Q2hhbmdlU2luY2VDaGVja3BvaW50KCkuXG4gIGdldENoYW5nZVNpbmNlQ2hlY2twb2ludChwdXJwb3NlKSB7XG4gICAgY29uc3QgY2hlY2twb2ludCA9IHRoaXMuZ2V0QnVmZmVyQ2hlY2twb2ludChwdXJwb3NlKVxuICAgIHJldHVybiB0aGlzLmVkaXRvci5idWZmZXIuZ2V0Q2hhbmdlc1NpbmNlQ2hlY2twb2ludChjaGVja3BvaW50KVswXVxuICB9XG5cbiAgLy8gW0JVRy1CVVQtT0tdIFJlcGxheWluZyB0ZXh0LWRlbGV0aW9uLW9wZXJhdGlvbiBpcyBub3QgY29tcGF0aWJsZSB0byBwdXJlIFZpbS5cbiAgLy8gUHVyZSBWaW0gcmVjb3JkIGFsbCBvcGVyYXRpb24gaW4gaW5zZXJ0LW1vZGUgYXMga2V5c3Ryb2tlIGxldmVsIGFuZCBjYW4gZGlzdGluZ3Vpc2hcbiAgLy8gY2hhcmFjdGVyIGRlbGV0ZWQgYnkgYERlbGV0ZWAgb3IgYnkgYGN0cmwtdWAuXG4gIC8vIEJ1dCBJIGNhbiBub3QgYW5kIGRvbid0IHRyeWluZyB0byBtaW5pYyB0aGlzIGxldmVsIG9mIGNvbXBhdGliaWxpdHkuXG4gIC8vIFNvIGJhc2ljYWxseSBkZWxldGlvbi1kb25lLWluLW9uZSBpcyBleHBlY3RlZCB0byB3b3JrIHdlbGwuXG4gIHJlcGxheUxhc3RDaGFuZ2Uoc2VsZWN0aW9uKSB7XG4gICAgbGV0IHRleHRUb0luc2VydFxuICAgIGlmICh0aGlzLmxhc3RDaGFuZ2UgIT0gbnVsbCkge1xuICAgICAgY29uc3Qge3N0YXJ0LCBuZXdFeHRlbnQsIG9sZEV4dGVudCwgbmV3VGV4dH0gPSB0aGlzLmxhc3RDaGFuZ2VcbiAgICAgIGlmICghb2xkRXh0ZW50LmlzWmVybygpKSB7XG4gICAgICAgIGNvbnN0IHRyYXZlcnNhbFRvU3RhcnRPZkRlbGV0ZSA9IHN0YXJ0LnRyYXZlcnNhbEZyb20odGhpcy50b3BDdXJzb3JQb3NpdGlvbkF0SW5zZXJ0aW9uU3RhcnQpXG4gICAgICAgIGNvbnN0IGRlbGV0aW9uU3RhcnQgPSBzZWxlY3Rpb24uY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKCkudHJhdmVyc2UodHJhdmVyc2FsVG9TdGFydE9mRGVsZXRlKVxuICAgICAgICBjb25zdCBkZWxldGlvbkVuZCA9IGRlbGV0aW9uU3RhcnQudHJhdmVyc2Uob2xkRXh0ZW50KVxuICAgICAgICBzZWxlY3Rpb24uc2V0QnVmZmVyUmFuZ2UoW2RlbGV0aW9uU3RhcnQsIGRlbGV0aW9uRW5kXSlcbiAgICAgIH1cbiAgICAgIHRleHRUb0luc2VydCA9IG5ld1RleHRcbiAgICB9IGVsc2Uge1xuICAgICAgdGV4dFRvSW5zZXJ0ID0gXCJcIlxuICAgIH1cbiAgICBzZWxlY3Rpb24uaW5zZXJ0VGV4dCh0ZXh0VG9JbnNlcnQsIHthdXRvSW5kZW50OiB0cnVlfSlcbiAgfVxuXG4gIC8vIGNhbGxlZCB3aGVuIHJlcGVhdGVkXG4gIC8vIFtGSVhNRV0gdG8gdXNlIHJlcGxheUxhc3RDaGFuZ2UgaW4gcmVwZWF0SW5zZXJ0IG92ZXJyaWRpbmcgc3ViY2xhc3NzLlxuICByZXBlYXRJbnNlcnQoc2VsZWN0aW9uLCB0ZXh0KSB7XG4gICAgdGhpcy5yZXBsYXlMYXN0Q2hhbmdlKHNlbGVjdGlvbilcbiAgfVxuXG4gIGdldEluc2VydGlvbkNvdW50KCkge1xuICAgIGlmICh0aGlzLmluc2VydGlvbkNvdW50ID09IG51bGwpIHtcbiAgICAgIHRoaXMuaW5zZXJ0aW9uQ291bnQgPSB0aGlzLnN1cHBvcnRJbnNlcnRpb25Db3VudCA/IHRoaXMuZ2V0Q291bnQoLTEpIDogMFxuICAgIH1cbiAgICAvLyBBdm9pZCBmcmVlemluZyBieSBhY2NjaWRlbnRhbCBiaWcgY291bnQoZS5nLiBgNTU1NTU1NTU1NTU1NWlgKSwgU2VlICM1NjAsICM1OTZcbiAgICByZXR1cm4gbGltaXROdW1iZXIodGhpcy5pbnNlcnRpb25Db3VudCwge21heDogMTAwfSlcbiAgfVxuXG4gIGV4ZWN1dGUoKSB7XG4gICAgaWYgKHRoaXMucmVwZWF0ZWQpIHtcbiAgICAgIHRoaXMuZmxhc2hUYXJnZXQgPSB0aGlzLnRyYWNrQ2hhbmdlID0gdHJ1ZVxuXG4gICAgICB0aGlzLnN0YXJ0TXV0YXRpb24oKCkgPT4ge1xuICAgICAgICBpZiAodGhpcy50YXJnZXQpIHRoaXMuc2VsZWN0VGFyZ2V0KClcbiAgICAgICAgaWYgKHRoaXMubXV0YXRlVGV4dCkgdGhpcy5tdXRhdGVUZXh0KClcblxuICAgICAgICBmb3IgKGNvbnN0IHNlbGVjdGlvbiBvZiB0aGlzLmVkaXRvci5nZXRTZWxlY3Rpb25zKCkpIHtcbiAgICAgICAgICBjb25zdCB0ZXh0VG9JbnNlcnQgPSAodGhpcy5sYXN0Q2hhbmdlICYmIHRoaXMubGFzdENoYW5nZS5uZXdUZXh0KSB8fCBcIlwiXG4gICAgICAgICAgdGhpcy5yZXBlYXRJbnNlcnQoc2VsZWN0aW9uLCB0ZXh0VG9JbnNlcnQpXG4gICAgICAgICAgbW92ZUN1cnNvckxlZnQoc2VsZWN0aW9uLmN1cnNvcilcbiAgICAgICAgfVxuICAgICAgICB0aGlzLm11dGF0aW9uTWFuYWdlci5zZXRDaGVja3BvaW50KFwiZGlkLWZpbmlzaFwiKVxuICAgICAgfSlcblxuICAgICAgaWYgKHRoaXMuZ2V0Q29uZmlnKFwiY2xlYXJNdWx0aXBsZUN1cnNvcnNPbkVzY2FwZUluc2VydE1vZGVcIikpIHRoaXMudmltU3RhdGUuY2xlYXJTZWxlY3Rpb25zKClcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5ub3JtYWxpemVTZWxlY3Rpb25zSWZOZWNlc3NhcnkoKVxuICAgICAgdGhpcy5jcmVhdGVCdWZmZXJDaGVja3BvaW50KFwidW5kb1wiKVxuICAgICAgaWYgKHRoaXMudGFyZ2V0KSB0aGlzLnNlbGVjdFRhcmdldCgpXG4gICAgICB0aGlzLm9ic2VydmVXaWxsRGVhY3RpdmF0ZU1vZGUoKVxuICAgICAgaWYgKHRoaXMubXV0YXRlVGV4dCkgdGhpcy5tdXRhdGVUZXh0KClcblxuICAgICAgaWYgKHRoaXMuZ2V0SW5zZXJ0aW9uQ291bnQoKSA+IDApIHtcbiAgICAgICAgY29uc3QgY2hhbmdlID0gdGhpcy5nZXRDaGFuZ2VTaW5jZUNoZWNrcG9pbnQoXCJ1bmRvXCIpXG4gICAgICAgIHRoaXMudGV4dEJ5T3BlcmF0b3IgPSAoY2hhbmdlICYmIGNoYW5nZS5uZXdUZXh0KSB8fCBcIlwiXG4gICAgICB9XG5cbiAgICAgIHRoaXMuY3JlYXRlQnVmZmVyQ2hlY2twb2ludChcImluc2VydFwiKVxuICAgICAgY29uc3QgdG9wQ3Vyc29yID0gdGhpcy5lZGl0b3IuZ2V0Q3Vyc29yc09yZGVyZWRCeUJ1ZmZlclBvc2l0aW9uKClbMF1cbiAgICAgIHRoaXMudG9wQ3Vyc29yUG9zaXRpb25BdEluc2VydGlvblN0YXJ0ID0gdG9wQ3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKClcblxuICAgICAgLy8gU2tpcCBub3JtYWxpemF0aW9uIG9mIGJsb2Nrd2lzZVNlbGVjdGlvbi5cbiAgICAgIC8vIFNpbmNlIHdhbnQgdG8ga2VlcCBtdWx0aS1jdXJzb3IgYW5kIGl0J3MgcG9zaXRpb24gaW4gd2hlbiBzaGlmdCB0byBpbnNlcnQtbW9kZS5cbiAgICAgIGZvciAoY29uc3QgYmxvY2t3aXNlU2VsZWN0aW9uIG9mIHRoaXMuZ2V0QmxvY2t3aXNlU2VsZWN0aW9ucygpKSB7XG4gICAgICAgIGJsb2Nrd2lzZVNlbGVjdGlvbi5za2lwTm9ybWFsaXphdGlvbigpXG4gICAgICB9XG4gICAgICB0aGlzLmFjdGl2YXRlTW9kZShcImluc2VydFwiLCB0aGlzLmZpbmFsU3VibW9kZSlcbiAgICB9XG4gIH1cbn1cbkFjdGl2YXRlSW5zZXJ0TW9kZS5yZWdpc3RlcigpXG5cbmNsYXNzIEFjdGl2YXRlUmVwbGFjZU1vZGUgZXh0ZW5kcyBBY3RpdmF0ZUluc2VydE1vZGUge1xuICBmaW5hbFN1Ym1vZGUgPSBcInJlcGxhY2VcIlxuXG4gIHJlcGVhdEluc2VydChzZWxlY3Rpb24sIHRleHQpIHtcbiAgICBmb3IgKGNvbnN0IGNoYXIgb2YgdGV4dCkge1xuICAgICAgaWYgKGNoYXIgPT09IFwiXFxuXCIpIGNvbnRpbnVlXG4gICAgICBpZiAoc2VsZWN0aW9uLmN1cnNvci5pc0F0RW5kT2ZMaW5lKCkpIGJyZWFrXG4gICAgICBzZWxlY3Rpb24uc2VsZWN0UmlnaHQoKVxuICAgIH1cbiAgICBzZWxlY3Rpb24uaW5zZXJ0VGV4dCh0ZXh0LCB7YXV0b0luZGVudDogZmFsc2V9KVxuICB9XG59XG5BY3RpdmF0ZVJlcGxhY2VNb2RlLnJlZ2lzdGVyKClcblxuY2xhc3MgSW5zZXJ0QWZ0ZXIgZXh0ZW5kcyBBY3RpdmF0ZUluc2VydE1vZGUge1xuICBleGVjdXRlKCkge1xuICAgIGZvciAoY29uc3QgY3Vyc29yIG9mIHRoaXMuZWRpdG9yLmdldEN1cnNvcnMoKSkge1xuICAgICAgbW92ZUN1cnNvclJpZ2h0KGN1cnNvcilcbiAgICB9XG4gICAgc3VwZXIuZXhlY3V0ZSgpXG4gIH1cbn1cbkluc2VydEFmdGVyLnJlZ2lzdGVyKClcblxuLy8ga2V5OiAnZyBJJyBpbiBhbGwgbW9kZVxuY2xhc3MgSW5zZXJ0QXRCZWdpbm5pbmdPZkxpbmUgZXh0ZW5kcyBBY3RpdmF0ZUluc2VydE1vZGUge1xuICBleGVjdXRlKCkge1xuICAgIGlmICh0aGlzLm1vZGUgPT09IFwidmlzdWFsXCIgJiYgdGhpcy5zdWJtb2RlICE9PSBcImJsb2Nrd2lzZVwiKSB7XG4gICAgICB0aGlzLmVkaXRvci5zcGxpdFNlbGVjdGlvbnNJbnRvTGluZXMoKVxuICAgIH1cbiAgICB0aGlzLmVkaXRvci5tb3ZlVG9CZWdpbm5pbmdPZkxpbmUoKVxuICAgIHN1cGVyLmV4ZWN1dGUoKVxuICB9XG59XG5JbnNlcnRBdEJlZ2lubmluZ09mTGluZS5yZWdpc3RlcigpXG5cbi8vIGtleTogbm9ybWFsICdBJ1xuY2xhc3MgSW5zZXJ0QWZ0ZXJFbmRPZkxpbmUgZXh0ZW5kcyBBY3RpdmF0ZUluc2VydE1vZGUge1xuICBleGVjdXRlKCkge1xuICAgIHRoaXMuZWRpdG9yLm1vdmVUb0VuZE9mTGluZSgpXG4gICAgc3VwZXIuZXhlY3V0ZSgpXG4gIH1cbn1cbkluc2VydEFmdGVyRW5kT2ZMaW5lLnJlZ2lzdGVyKClcblxuLy8ga2V5OiBub3JtYWwgJ0knXG5jbGFzcyBJbnNlcnRBdEZpcnN0Q2hhcmFjdGVyT2ZMaW5lIGV4dGVuZHMgQWN0aXZhdGVJbnNlcnRNb2RlIHtcbiAgZXhlY3V0ZSgpIHtcbiAgICB0aGlzLmVkaXRvci5tb3ZlVG9CZWdpbm5pbmdPZkxpbmUoKVxuICAgIHRoaXMuZWRpdG9yLm1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lKClcbiAgICBzdXBlci5leGVjdXRlKClcbiAgfVxufVxuSW5zZXJ0QXRGaXJzdENoYXJhY3Rlck9mTGluZS5yZWdpc3RlcigpXG5cbmNsYXNzIEluc2VydEF0TGFzdEluc2VydCBleHRlbmRzIEFjdGl2YXRlSW5zZXJ0TW9kZSB7XG4gIGV4ZWN1dGUoKSB7XG4gICAgY29uc3QgcG9pbnQgPSB0aGlzLnZpbVN0YXRlLm1hcmsuZ2V0KFwiXlwiKVxuICAgIGlmIChwb2ludCkge1xuICAgICAgdGhpcy5lZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24ocG9pbnQpXG4gICAgICB0aGlzLmVkaXRvci5zY3JvbGxUb0N1cnNvclBvc2l0aW9uKHtjZW50ZXI6IHRydWV9KVxuICAgIH1cbiAgICBzdXBlci5leGVjdXRlKClcbiAgfVxufVxuSW5zZXJ0QXRMYXN0SW5zZXJ0LnJlZ2lzdGVyKClcblxuY2xhc3MgSW5zZXJ0QWJvdmVXaXRoTmV3bGluZSBleHRlbmRzIEFjdGl2YXRlSW5zZXJ0TW9kZSB7XG4gIGluaXRpYWxpemUoKSB7XG4gICAgaWYgKHRoaXMuZ2V0Q29uZmlnKFwiZ3JvdXBDaGFuZ2VzV2hlbkxlYXZpbmdJbnNlcnRNb2RlXCIpKSB7XG4gICAgICB0aGlzLm9yaWdpbmFsQ3Vyc29yUG9zaXRpb25NYXJrZXIgPSB0aGlzLmVkaXRvci5tYXJrQnVmZmVyUG9zaXRpb24odGhpcy5lZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKSlcbiAgICB9XG4gICAgcmV0dXJuIHN1cGVyLmluaXRpYWxpemUoKVxuICB9XG5cbiAgLy8gVGhpcyBpcyBmb3IgYG9gIGFuZCBgT2Agb3BlcmF0b3IuXG4gIC8vIE9uIHVuZG8vcmVkbyBwdXQgY3Vyc29yIGF0IG9yaWdpbmFsIHBvaW50IHdoZXJlIHVzZXIgdHlwZSBgb2Agb3IgYE9gLlxuICBncm91cENoYW5nZXNTaW5jZUJ1ZmZlckNoZWNrcG9pbnQocHVycG9zZSkge1xuICAgIGNvbnN0IGxhc3RDdXJzb3IgPSB0aGlzLmVkaXRvci5nZXRMYXN0Q3Vyc29yKClcbiAgICBjb25zdCBjdXJzb3JQb3NpdGlvbiA9IGxhc3RDdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuICAgIGxhc3RDdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24odGhpcy5vcmlnaW5hbEN1cnNvclBvc2l0aW9uTWFya2VyLmdldEhlYWRCdWZmZXJQb3NpdGlvbigpKVxuICAgIHRoaXMub3JpZ2luYWxDdXJzb3JQb3NpdGlvbk1hcmtlci5kZXN0cm95KClcblxuICAgIHN1cGVyLmdyb3VwQ2hhbmdlc1NpbmNlQnVmZmVyQ2hlY2twb2ludChwdXJwb3NlKVxuXG4gICAgbGFzdEN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihjdXJzb3JQb3NpdGlvbilcbiAgfVxuXG4gIGF1dG9JbmRlbnRFbXB0eVJvd3MoKSB7XG4gICAgZm9yIChjb25zdCBjdXJzb3Igb2YgdGhpcy5lZGl0b3IuZ2V0Q3Vyc29ycygpKSB7XG4gICAgICBjb25zdCByb3cgPSBjdXJzb3IuZ2V0QnVmZmVyUm93KClcbiAgICAgIGlmIChpc0VtcHR5Um93KHRoaXMuZWRpdG9yLCByb3cpKSB7XG4gICAgICAgIHRoaXMuZWRpdG9yLmF1dG9JbmRlbnRCdWZmZXJSb3cocm93KVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIG11dGF0ZVRleHQoKSB7XG4gICAgdGhpcy5lZGl0b3IuaW5zZXJ0TmV3bGluZUFib3ZlKClcbiAgICBpZiAodGhpcy5lZGl0b3IuYXV0b0luZGVudCkge1xuICAgICAgdGhpcy5hdXRvSW5kZW50RW1wdHlSb3dzKClcbiAgICB9XG4gIH1cblxuICByZXBlYXRJbnNlcnQoc2VsZWN0aW9uLCB0ZXh0KSB7XG4gICAgc2VsZWN0aW9uLmluc2VydFRleHQodGV4dC50cmltTGVmdCgpLCB7YXV0b0luZGVudDogdHJ1ZX0pXG4gIH1cbn1cbkluc2VydEFib3ZlV2l0aE5ld2xpbmUucmVnaXN0ZXIoKVxuXG5jbGFzcyBJbnNlcnRCZWxvd1dpdGhOZXdsaW5lIGV4dGVuZHMgSW5zZXJ0QWJvdmVXaXRoTmV3bGluZSB7XG4gIG11dGF0ZVRleHQoKSB7XG4gICAgZm9yIChjb25zdCBjdXJzb3Igb2YgdGhpcy5lZGl0b3IuZ2V0Q3Vyc29ycygpKSB7XG4gICAgICBzZXRCdWZmZXJSb3coY3Vyc29yLCB0aGlzLmdldEZvbGRFbmRSb3dGb3JSb3coY3Vyc29yLmdldEJ1ZmZlclJvdygpKSlcbiAgICB9XG5cbiAgICB0aGlzLmVkaXRvci5pbnNlcnROZXdsaW5lQmVsb3coKVxuICAgIGlmICh0aGlzLmVkaXRvci5hdXRvSW5kZW50KSB0aGlzLmF1dG9JbmRlbnRFbXB0eVJvd3MoKVxuICB9XG59XG5JbnNlcnRCZWxvd1dpdGhOZXdsaW5lLnJlZ2lzdGVyKClcblxuLy8gQWR2YW5jZWQgSW5zZXJ0aW9uXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBJbnNlcnRCeVRhcmdldCBleHRlbmRzIEFjdGl2YXRlSW5zZXJ0TW9kZSB7XG4gIHJlcXVpcmVUYXJnZXQgPSB0cnVlXG4gIHdoaWNoID0gbnVsbCAvLyBvbmUgb2YgWydzdGFydCcsICdlbmQnLCAnaGVhZCcsICd0YWlsJ11cblxuICBpbml0aWFsaXplKCkge1xuICAgIC8vIEhBQ0tcbiAgICAvLyBXaGVuIGcgaSBpcyBtYXBwZWQgdG8gYGluc2VydC1hdC1zdGFydC1vZi10YXJnZXRgLlxuICAgIC8vIGBnIGkgMyBsYCBzdGFydCBpbnNlcnQgYXQgMyBjb2x1bW4gcmlnaHQgcG9zaXRpb24uXG4gICAgLy8gSW4gdGhpcyBjYXNlLCB3ZSBkb24ndCB3YW50IHJlcGVhdCBpbnNlcnRpb24gMyB0aW1lcy5cbiAgICAvLyBUaGlzIEBnZXRDb3VudCgpIGNhbGwgY2FjaGUgbnVtYmVyIGF0IHRoZSB0aW1pbmcgQkVGT1JFICczJyBpcyBzcGVjaWZpZWQuXG4gICAgdGhpcy5nZXRDb3VudCgpXG4gICAgcmV0dXJuIHN1cGVyLmluaXRpYWxpemUoKVxuICB9XG5cbiAgZXhlY3V0ZSgpIHtcbiAgICB0aGlzLm9uRGlkU2VsZWN0VGFyZ2V0KCgpID0+IHtcbiAgICAgIC8vIEluIHZDL3ZMLCB3aGVuIG9jY3VycmVuY2UgbWFya2VyIHdhcyBOT1Qgc2VsZWN0ZWQsXG4gICAgICAvLyBpdCBiZWhhdmUncyB2ZXJ5IHNwZWNpYWxseVxuICAgICAgLy8gdkM6IGBJYCBhbmQgYEFgIGJlaGF2ZXMgYXMgc2hvZnQgaGFuZCBvZiBgY3RybC12IElgIGFuZCBgY3RybC12IEFgLlxuICAgICAgLy8gdkw6IGBJYCBhbmQgYEFgIHBsYWNlIGN1cnNvcnMgYXQgZWFjaCBzZWxlY3RlZCBsaW5lcyBvZiBzdGFydCggb3IgZW5kICkgb2Ygbm9uLXdoaXRlLXNwYWNlIGNoYXIuXG4gICAgICBpZiAoIXRoaXMub2NjdXJyZW5jZVNlbGVjdGVkICYmIHRoaXMubW9kZSA9PT0gXCJ2aXN1YWxcIiAmJiB0aGlzLnN1Ym1vZGUgIT09IFwiYmxvY2t3aXNlXCIpIHtcbiAgICAgICAgZm9yIChjb25zdCAkc2VsZWN0aW9uIG9mIHRoaXMuc3dyYXAuZ2V0U2VsZWN0aW9ucyh0aGlzLmVkaXRvcikpIHtcbiAgICAgICAgICAkc2VsZWN0aW9uLm5vcm1hbGl6ZSgpXG4gICAgICAgICAgJHNlbGVjdGlvbi5hcHBseVdpc2UoXCJibG9ja3dpc2VcIilcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLnN1Ym1vZGUgPT09IFwibGluZXdpc2VcIikge1xuICAgICAgICAgIGZvciAoY29uc3QgYmxvY2t3aXNlU2VsZWN0aW9uIG9mIHRoaXMuZ2V0QmxvY2t3aXNlU2VsZWN0aW9ucygpKSB7XG4gICAgICAgICAgICBibG9ja3dpc2VTZWxlY3Rpb24uZXhwYW5kTWVtYmVyU2VsZWN0aW9uc092ZXJMaW5lV2l0aFRyaW1SYW5nZSgpXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGZvciAoY29uc3QgJHNlbGVjdGlvbiBvZiB0aGlzLnN3cmFwLmdldFNlbGVjdGlvbnModGhpcy5lZGl0b3IpKSB7XG4gICAgICAgICRzZWxlY3Rpb24uc2V0QnVmZmVyUG9zaXRpb25Ubyh0aGlzLndoaWNoKVxuICAgICAgfVxuICAgIH0pXG4gICAgc3VwZXIuZXhlY3V0ZSgpXG4gIH1cbn1cbkluc2VydEJ5VGFyZ2V0LnJlZ2lzdGVyKGZhbHNlKVxuXG4vLyBrZXk6ICdJJywgVXNlZCBpbiAndmlzdWFsLW1vZGUuY2hhcmFjdGVyd2lzZScsIHZpc3VhbC1tb2RlLmJsb2Nrd2lzZVxuY2xhc3MgSW5zZXJ0QXRTdGFydE9mVGFyZ2V0IGV4dGVuZHMgSW5zZXJ0QnlUYXJnZXQge1xuICB3aGljaCA9IFwic3RhcnRcIlxufVxuSW5zZXJ0QXRTdGFydE9mVGFyZ2V0LnJlZ2lzdGVyKClcblxuLy8ga2V5OiAnQScsIFVzZWQgaW4gJ3Zpc3VhbC1tb2RlLmNoYXJhY3Rlcndpc2UnLCAndmlzdWFsLW1vZGUuYmxvY2t3aXNlJ1xuY2xhc3MgSW5zZXJ0QXRFbmRPZlRhcmdldCBleHRlbmRzIEluc2VydEJ5VGFyZ2V0IHtcbiAgd2hpY2ggPSBcImVuZFwiXG59XG5JbnNlcnRBdEVuZE9mVGFyZ2V0LnJlZ2lzdGVyKClcblxuY2xhc3MgSW5zZXJ0QXRIZWFkT2ZUYXJnZXQgZXh0ZW5kcyBJbnNlcnRCeVRhcmdldCB7XG4gIHdoaWNoID0gXCJoZWFkXCJcbn1cbkluc2VydEF0SGVhZE9mVGFyZ2V0LnJlZ2lzdGVyKClcblxuY2xhc3MgSW5zZXJ0QXRTdGFydE9mT2NjdXJyZW5jZSBleHRlbmRzIEluc2VydEF0U3RhcnRPZlRhcmdldCB7XG4gIG9jY3VycmVuY2UgPSB0cnVlXG59XG5JbnNlcnRBdFN0YXJ0T2ZPY2N1cnJlbmNlLnJlZ2lzdGVyKClcblxuY2xhc3MgSW5zZXJ0QXRFbmRPZk9jY3VycmVuY2UgZXh0ZW5kcyBJbnNlcnRBdEVuZE9mVGFyZ2V0IHtcbiAgb2NjdXJyZW5jZSA9IHRydWVcbn1cbkluc2VydEF0RW5kT2ZPY2N1cnJlbmNlLnJlZ2lzdGVyKClcblxuY2xhc3MgSW5zZXJ0QXRIZWFkT2ZPY2N1cnJlbmNlIGV4dGVuZHMgSW5zZXJ0QXRIZWFkT2ZUYXJnZXQge1xuICBvY2N1cnJlbmNlID0gdHJ1ZVxufVxuSW5zZXJ0QXRIZWFkT2ZPY2N1cnJlbmNlLnJlZ2lzdGVyKClcblxuY2xhc3MgSW5zZXJ0QXRTdGFydE9mU3Vid29yZE9jY3VycmVuY2UgZXh0ZW5kcyBJbnNlcnRBdFN0YXJ0T2ZPY2N1cnJlbmNlIHtcbiAgb2NjdXJyZW5jZVR5cGUgPSBcInN1YndvcmRcIlxufVxuSW5zZXJ0QXRTdGFydE9mU3Vid29yZE9jY3VycmVuY2UucmVnaXN0ZXIoKVxuXG5jbGFzcyBJbnNlcnRBdEVuZE9mU3Vid29yZE9jY3VycmVuY2UgZXh0ZW5kcyBJbnNlcnRBdEVuZE9mT2NjdXJyZW5jZSB7XG4gIG9jY3VycmVuY2VUeXBlID0gXCJzdWJ3b3JkXCJcbn1cbkluc2VydEF0RW5kT2ZTdWJ3b3JkT2NjdXJyZW5jZS5yZWdpc3RlcigpXG5cbmNsYXNzIEluc2VydEF0SGVhZE9mU3Vid29yZE9jY3VycmVuY2UgZXh0ZW5kcyBJbnNlcnRBdEhlYWRPZk9jY3VycmVuY2Uge1xuICBvY2N1cnJlbmNlVHlwZSA9IFwic3Vid29yZFwiXG59XG5JbnNlcnRBdEhlYWRPZlN1YndvcmRPY2N1cnJlbmNlLnJlZ2lzdGVyKClcblxuY2xhc3MgSW5zZXJ0QXRTdGFydE9mU21hcnRXb3JkIGV4dGVuZHMgSW5zZXJ0QnlUYXJnZXQge1xuICB3aGljaCA9IFwic3RhcnRcIlxuICB0YXJnZXQgPSBcIk1vdmVUb1ByZXZpb3VzU21hcnRXb3JkXCJcbn1cbkluc2VydEF0U3RhcnRPZlNtYXJ0V29yZC5yZWdpc3RlcigpXG5cbmNsYXNzIEluc2VydEF0RW5kT2ZTbWFydFdvcmQgZXh0ZW5kcyBJbnNlcnRCeVRhcmdldCB7XG4gIHdoaWNoID0gXCJlbmRcIlxuICB0YXJnZXQgPSBcIk1vdmVUb0VuZE9mU21hcnRXb3JkXCJcbn1cbkluc2VydEF0RW5kT2ZTbWFydFdvcmQucmVnaXN0ZXIoKVxuXG5jbGFzcyBJbnNlcnRBdFByZXZpb3VzRm9sZFN0YXJ0IGV4dGVuZHMgSW5zZXJ0QnlUYXJnZXQge1xuICB3aGljaCA9IFwic3RhcnRcIlxuICB0YXJnZXQgPSBcIk1vdmVUb1ByZXZpb3VzRm9sZFN0YXJ0XCJcbn1cbkluc2VydEF0UHJldmlvdXNGb2xkU3RhcnQucmVnaXN0ZXIoKVxuXG5jbGFzcyBJbnNlcnRBdE5leHRGb2xkU3RhcnQgZXh0ZW5kcyBJbnNlcnRCeVRhcmdldCB7XG4gIHdoaWNoID0gXCJlbmRcIlxuICB0YXJnZXQgPSBcIk1vdmVUb05leHRGb2xkU3RhcnRcIlxufVxuSW5zZXJ0QXROZXh0Rm9sZFN0YXJ0LnJlZ2lzdGVyKClcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgQ2hhbmdlIGV4dGVuZHMgQWN0aXZhdGVJbnNlcnRNb2RlIHtcbiAgcmVxdWlyZVRhcmdldCA9IHRydWVcbiAgdHJhY2tDaGFuZ2UgPSB0cnVlXG4gIHN1cHBvcnRJbnNlcnRpb25Db3VudCA9IGZhbHNlXG5cbiAgbXV0YXRlVGV4dCgpIHtcbiAgICAvLyBBbGx3YXlzIGR5bmFtaWNhbGx5IGRldGVybWluZSBzZWxlY3Rpb24gd2lzZSB3dGhvdXQgY29uc3VsdGluZyB0YXJnZXQud2lzZVxuICAgIC8vIFJlYXNvbjogd2hlbiBgYyBpIHtgLCB3aXNlIGlzICdjaGFyYWN0ZXJ3aXNlJywgYnV0IGFjdHVhbGx5IHNlbGVjdGVkIHJhbmdlIGlzICdsaW5ld2lzZSdcbiAgICAvLyAgIHtcbiAgICAvLyAgICAgYVxuICAgIC8vICAgfVxuICAgIGNvbnN0IGlzTGluZXdpc2VUYXJnZXQgPSB0aGlzLnN3cmFwLmRldGVjdFdpc2UodGhpcy5lZGl0b3IpID09PSBcImxpbmV3aXNlXCJcbiAgICBmb3IgKGNvbnN0IHNlbGVjdGlvbiBvZiB0aGlzLmVkaXRvci5nZXRTZWxlY3Rpb25zKCkpIHtcbiAgICAgIGlmICghdGhpcy5nZXRDb25maWcoXCJkb250VXBkYXRlUmVnaXN0ZXJPbkNoYW5nZU9yU3Vic3RpdHV0ZVwiKSkge1xuICAgICAgICB0aGlzLnNldFRleHRUb1JlZ2lzdGVyRm9yU2VsZWN0aW9uKHNlbGVjdGlvbilcbiAgICAgIH1cbiAgICAgIGlmIChpc0xpbmV3aXNlVGFyZ2V0KSB7XG4gICAgICAgIHNlbGVjdGlvbi5pbnNlcnRUZXh0KFwiXFxuXCIsIHthdXRvSW5kZW50OiB0cnVlfSlcbiAgICAgICAgc2VsZWN0aW9uLmN1cnNvci5tb3ZlTGVmdCgpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzZWxlY3Rpb24uaW5zZXJ0VGV4dChcIlwiLCB7YXV0b0luZGVudDogdHJ1ZX0pXG4gICAgICB9XG4gICAgfVxuICB9XG59XG5DaGFuZ2UucmVnaXN0ZXIoKVxuXG5jbGFzcyBDaGFuZ2VPY2N1cnJlbmNlIGV4dGVuZHMgQ2hhbmdlIHtcbiAgb2NjdXJyZW5jZSA9IHRydWVcbn1cbkNoYW5nZU9jY3VycmVuY2UucmVnaXN0ZXIoKVxuXG5jbGFzcyBTdWJzdGl0dXRlIGV4dGVuZHMgQ2hhbmdlIHtcbiAgdGFyZ2V0ID0gXCJNb3ZlUmlnaHRcIlxufVxuU3Vic3RpdHV0ZS5yZWdpc3RlcigpXG5cbmNsYXNzIFN1YnN0aXR1dGVMaW5lIGV4dGVuZHMgQ2hhbmdlIHtcbiAgd2lzZSA9IFwibGluZXdpc2VcIiAvLyBbRklYTUVdIHRvIHJlLW92ZXJyaWRlIHRhcmdldC53aXNlIGluIHZpc3VhbC1tb2RlXG4gIHRhcmdldCA9IFwiTW92ZVRvUmVsYXRpdmVMaW5lXCJcbn1cblN1YnN0aXR1dGVMaW5lLnJlZ2lzdGVyKClcblxuLy8gYWxpYXNcbmNsYXNzIENoYW5nZUxpbmUgZXh0ZW5kcyBTdWJzdGl0dXRlTGluZSB7fVxuQ2hhbmdlTGluZS5yZWdpc3RlcigpXG5cbmNsYXNzIENoYW5nZVRvTGFzdENoYXJhY3Rlck9mTGluZSBleHRlbmRzIENoYW5nZSB7XG4gIHRhcmdldCA9IFwiTW92ZVRvTGFzdENoYXJhY3Rlck9mTGluZVwiXG5cbiAgZXhlY3V0ZSgpIHtcbiAgICB0aGlzLm9uRGlkU2VsZWN0VGFyZ2V0KCgpID0+IHtcbiAgICAgIGlmICh0aGlzLnRhcmdldC53aXNlID09PSBcImJsb2Nrd2lzZVwiKSB7XG4gICAgICAgIGZvciAoY29uc3QgYmxvY2t3aXNlU2VsZWN0aW9uIG9mIHRoaXMuZ2V0QmxvY2t3aXNlU2VsZWN0aW9ucygpKSB7XG4gICAgICAgICAgYmxvY2t3aXNlU2VsZWN0aW9uLmV4dGVuZE1lbWJlclNlbGVjdGlvbnNUb0VuZE9mTGluZSgpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuICAgIHN1cGVyLmV4ZWN1dGUoKVxuICB9XG59XG5DaGFuZ2VUb0xhc3RDaGFyYWN0ZXJPZkxpbmUucmVnaXN0ZXIoKVxuIl19