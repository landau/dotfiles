"use babel";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _require = require("atom");

var Range = _require.Range;

var _require2 = require("./operator");

var Operator = _require2.Operator;

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
    this.supportInsertionCount = true;
  }

  _createClass(ActivateInsertModeBase, [{
    key: "getChangeSinceCheckpoint",

    // When each mutaion's extent is not intersecting, muitiple changes are recorded
    // e.g
    //  - Multicursors edit
    //  - Cursor moved in insert-mode(e.g ctrl-f, ctrl-b)
    // But I don't care multiple changes just because I'm lazy(so not perfect implementation).
    // I only take care of one change happened at earliest(topCursor's change) position.
    // Thats' why I save topCursor's position to @topCursorPositionAtInsertionStart to compare traversal to deletionStart
    // Why I use topCursor's change? Just because it's easy to use first change returned by getChangeSinceCheckpoint().
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
    key: "execute",
    value: function execute() {
      var _this = this;

      if (this.repeated) this.flashTarget = this.trackChange = true;

      this.preSelect();

      if (this.selectTarget() || this.target.wise !== "linewise") {
        if (this.mutateText) this.mutateText();

        if (this.repeated) {
          for (var selection of this.editor.getSelections()) {
            var textToInsert = this.lastChange && this.lastChange.newText || "";
            this.repeatInsert(selection, textToInsert);
            this.utils.moveCursorLeft(selection.cursor);
          }
          this.mutationManager.setCheckpoint("did-finish");
          this.groupChangesSinceBufferCheckpoint("undo");
          this.emitDidFinishMutation();
          if (this.getConfig("clearMultipleCursorsOnEscapeInsertMode")) this.vimState.clearSelections();
        } else {
          (function () {
            // Avoid freezing by acccidental big count(e.g. `5555555555555i`), See #560, #596
            var insertionCount = _this.supportInsertionCount ? _this.limitNumber(_this.getCount() - 1, { max: 100 }) : 0;

            var textByOperator = "";
            if (insertionCount > 0) {
              var change = _this.getChangeSinceCheckpoint("undo");
              textByOperator = change && change.newText || "";
            }

            _this.createBufferCheckpoint("insert");
            var topCursor = _this.editor.getCursorsOrderedByBufferPosition()[0];
            _this.topCursorPositionAtInsertionStart = topCursor.getBufferPosition();

            // Skip normalization of blockwiseSelection.
            // Since want to keep multi-cursor and it's position in when shift to insert-mode.
            for (var blockwiseSelection of _this.getBlockwiseSelections()) {
              blockwiseSelection.skipNormalization();
            }

            var disposable = _this.vimState.preemptWillDeactivateMode(function (_ref) {
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

              while (insertionCount) {
                insertionCount--;
                for (var selection of _this.editor.getSelections()) {
                  selection.insertText(textByOperator + textByUserInput, { autoIndent: true });
                }
              }

              // This cursor state is restored on undo.
              // So cursor state has to be updated before next groupChangesSinceCheckpoint()
              if (_this.getConfig("clearMultipleCursorsOnEscapeInsertMode")) _this.vimState.clearSelections();

              // grouping changes for undo checkpoint need to come last
              _this.groupChangesSinceBufferCheckpoint("undo");

              var preventIncorrectWrap = _this.editor.hasAtomicSoftTabs();
              for (var cursor of _this.editor.getCursors()) {
                _this.utils.moveCursorLeft(cursor, { preventIncorrectWrap: preventIncorrectWrap });
              }
            });
            var submode = _this.name === "ActivateReplaceMode" ? "replace" : undefined;
            _this.activateMode("insert", submode);
          })();
        }
      } else {
        this.activateMode("normal");
      }
    }
  }], [{
    key: "command",
    value: false,
    enumerable: true
  }]);

  return ActivateInsertModeBase;
})(Operator);

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

var ActivateReplaceMode = (function (_ActivateInsertMode) {
  _inherits(ActivateReplaceMode, _ActivateInsertMode);

  function ActivateReplaceMode() {
    _classCallCheck(this, ActivateReplaceMode);

    _get(Object.getPrototypeOf(ActivateReplaceMode.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(ActivateReplaceMode, [{
    key: "initialize",
    value: function initialize() {
      var _this2 = this;

      var replacedCharsBySelection = new WeakMap();

      var onWillInsertDisposable = this.editor.onWillInsertText(function (_ref2) {
        var _ref2$text = _ref2.text;
        var text = _ref2$text === undefined ? "" : _ref2$text;
        var cancel = _ref2.cancel;

        cancel();
        for (var selection of _this2.editor.getSelections()) {
          for (var char of text.split("")) {
            if (char !== "\n" && !selection.cursor.isAtEndOfLine()) selection.selectRight();
            if (!replacedCharsBySelection.has(selection)) replacedCharsBySelection.set(selection, []);
            replacedCharsBySelection.get(selection).push(selection.getText());
            selection.insertText(char);
          }
        }
      });

      var overrideCoreBackSpaceDisposable = atom.commands.add(this.editorElement, "core:backspace", function (event) {
        event.stopImmediatePropagation();
        for (var selection of _this2.editor.getSelections()) {
          var chars = replacedCharsBySelection.get(selection);
          if (chars && chars.length) {
            selection.selectLeft();
            if (!selection.insertText(chars.pop()).isEmpty()) selection.cursor.moveLeft();
          }
        }
      });

      var disposable = this.vimState.preemptWillDeactivateMode(function (_ref3) {
        var mode = _ref3.mode;

        if (mode !== "insert") return;
        disposable.dispose();
        onWillInsertDisposable.dispose();
        overrideCoreBackSpaceDisposable.dispose();
      });

      _get(Object.getPrototypeOf(ActivateReplaceMode.prototype), "initialize", this).call(this);
    }
  }, {
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

var InsertAfter = (function (_ActivateInsertMode2) {
  _inherits(InsertAfter, _ActivateInsertMode2);

  function InsertAfter() {
    _classCallCheck(this, InsertAfter);

    _get(Object.getPrototypeOf(InsertAfter.prototype), "constructor", this).apply(this, arguments);
  }

  // key: 'g I' in all mode

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

var InsertAtBeginningOfLine = (function (_ActivateInsertMode3) {
  _inherits(InsertAtBeginningOfLine, _ActivateInsertMode3);

  function InsertAtBeginningOfLine() {
    _classCallCheck(this, InsertAtBeginningOfLine);

    _get(Object.getPrototypeOf(InsertAtBeginningOfLine.prototype), "constructor", this).apply(this, arguments);
  }

  // key: normal 'A'

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

var InsertAfterEndOfLine = (function (_ActivateInsertMode4) {
  _inherits(InsertAfterEndOfLine, _ActivateInsertMode4);

  function InsertAfterEndOfLine() {
    _classCallCheck(this, InsertAfterEndOfLine);

    _get(Object.getPrototypeOf(InsertAfterEndOfLine.prototype), "constructor", this).apply(this, arguments);
  }

  // key: normal 'I'

  _createClass(InsertAfterEndOfLine, [{
    key: "execute",
    value: function execute() {
      this.editor.moveToEndOfLine();
      _get(Object.getPrototypeOf(InsertAfterEndOfLine.prototype), "execute", this).call(this);
    }
  }]);

  return InsertAfterEndOfLine;
})(ActivateInsertMode);

var InsertAtFirstCharacterOfLine = (function (_ActivateInsertMode5) {
  _inherits(InsertAtFirstCharacterOfLine, _ActivateInsertMode5);

  function InsertAtFirstCharacterOfLine() {
    _classCallCheck(this, InsertAtFirstCharacterOfLine);

    _get(Object.getPrototypeOf(InsertAtFirstCharacterOfLine.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(InsertAtFirstCharacterOfLine, [{
    key: "execute",
    value: function execute() {
      for (var cursor of this.editor.getCursors()) {
        this.utils.moveCursorToFirstCharacterAtRow(cursor, cursor.getBufferRow());
      }
      _get(Object.getPrototypeOf(InsertAtFirstCharacterOfLine.prototype), "execute", this).call(this);
    }
  }]);

  return InsertAtFirstCharacterOfLine;
})(ActivateInsertMode);

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

var InsertAboveWithNewline = (function (_ActivateInsertMode7) {
  _inherits(InsertAboveWithNewline, _ActivateInsertMode7);

  function InsertAboveWithNewline() {
    _classCallCheck(this, InsertAboveWithNewline);

    _get(Object.getPrototypeOf(InsertAboveWithNewline.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(InsertAboveWithNewline, [{
    key: "initialize",
    value: function initialize() {
      this.originalCursorPositionMarker = this.editor.markBufferPosition(this.editor.getCursorBufferPosition());
      _get(Object.getPrototypeOf(InsertAboveWithNewline.prototype), "initialize", this).call(this);
    }

    // This is for `o` and `O` operator.
    // On undo/redo put cursor at original point where user type `o` or `O`.
  }, {
    key: "groupChangesSinceBufferCheckpoint",
    value: function groupChangesSinceBufferCheckpoint(purpose) {
      if (this.repeated) {
        _get(Object.getPrototypeOf(InsertAboveWithNewline.prototype), "groupChangesSinceBufferCheckpoint", this).call(this, purpose);
        return;
      }

      var lastCursor = this.editor.getLastCursor();
      var cursorPosition = lastCursor.getBufferPosition();
      lastCursor.setBufferPosition(this.originalCursorPositionMarker.getHeadBufferPosition());
      this.originalCursorPositionMarker.destroy();
      this.originalCursorPositionMarker = null;

      if (this.getConfig("groupChangesWhenLeavingInsertMode")) {
        _get(Object.getPrototypeOf(InsertAboveWithNewline.prototype), "groupChangesSinceBufferCheckpoint", this).call(this, purpose);
      }
      lastCursor.setBufferPosition(cursorPosition);
    }
  }, {
    key: "autoIndentEmptyRows",
    value: function autoIndentEmptyRows() {
      for (var cursor of this.editor.getCursors()) {
        var row = cursor.getBufferRow();
        if (this.isEmptyRow(row)) this.editor.autoIndentBufferRow(row);
      }
    }
  }, {
    key: "mutateText",
    value: function mutateText() {
      this.editor.insertNewlineAbove();
      if (this.editor.autoIndent) this.autoIndentEmptyRows();
    }
  }, {
    key: "repeatInsert",
    value: function repeatInsert(selection, text) {
      selection.insertText(text.trimLeft(), { autoIndent: true });
    }
  }]);

  return InsertAboveWithNewline;
})(ActivateInsertMode);

var InsertBelowWithNewline = (function (_InsertAboveWithNewline) {
  _inherits(InsertBelowWithNewline, _InsertAboveWithNewline);

  function InsertBelowWithNewline() {
    _classCallCheck(this, InsertBelowWithNewline);

    _get(Object.getPrototypeOf(InsertBelowWithNewline.prototype), "constructor", this).apply(this, arguments);
  }

  // Advanced Insertion
  // -------------------------

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

var InsertByTarget = (function (_ActivateInsertModeBase2) {
  _inherits(InsertByTarget, _ActivateInsertModeBase2);

  function InsertByTarget() {
    _classCallCheck(this, InsertByTarget);

    _get(Object.getPrototypeOf(InsertByTarget.prototype), "constructor", this).apply(this, arguments);

    this.which = null;
  }

  // key: 'I', Used in 'visual-mode.characterwise', visual-mode.blockwise

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
  }], [{
    key: "command",
    value: false,
    enumerable: true
  }]);

  return InsertByTarget;
})(ActivateInsertModeBase);

var InsertAtStartOfTarget = (function (_InsertByTarget) {
  _inherits(InsertAtStartOfTarget, _InsertByTarget);

  function InsertAtStartOfTarget() {
    _classCallCheck(this, InsertAtStartOfTarget);

    _get(Object.getPrototypeOf(InsertAtStartOfTarget.prototype), "constructor", this).apply(this, arguments);

    this.which = "start";
  }

  // key: 'A', Used in 'visual-mode.characterwise', 'visual-mode.blockwise'
  return InsertAtStartOfTarget;
})(InsertByTarget);

var InsertAtEndOfTarget = (function (_InsertByTarget2) {
  _inherits(InsertAtEndOfTarget, _InsertByTarget2);

  function InsertAtEndOfTarget() {
    _classCallCheck(this, InsertAtEndOfTarget);

    _get(Object.getPrototypeOf(InsertAtEndOfTarget.prototype), "constructor", this).apply(this, arguments);

    this.which = "end";
  }

  return InsertAtEndOfTarget;
})(InsertByTarget);

var InsertAtHeadOfTarget = (function (_InsertByTarget3) {
  _inherits(InsertAtHeadOfTarget, _InsertByTarget3);

  function InsertAtHeadOfTarget() {
    _classCallCheck(this, InsertAtHeadOfTarget);

    _get(Object.getPrototypeOf(InsertAtHeadOfTarget.prototype), "constructor", this).apply(this, arguments);

    this.which = "head";
  }

  return InsertAtHeadOfTarget;
})(InsertByTarget);

var InsertAtStartOfOccurrence = (function (_InsertAtStartOfTarget) {
  _inherits(InsertAtStartOfOccurrence, _InsertAtStartOfTarget);

  function InsertAtStartOfOccurrence() {
    _classCallCheck(this, InsertAtStartOfOccurrence);

    _get(Object.getPrototypeOf(InsertAtStartOfOccurrence.prototype), "constructor", this).apply(this, arguments);

    this.occurrence = true;
  }

  return InsertAtStartOfOccurrence;
})(InsertAtStartOfTarget);

var InsertAtEndOfOccurrence = (function (_InsertAtEndOfTarget) {
  _inherits(InsertAtEndOfOccurrence, _InsertAtEndOfTarget);

  function InsertAtEndOfOccurrence() {
    _classCallCheck(this, InsertAtEndOfOccurrence);

    _get(Object.getPrototypeOf(InsertAtEndOfOccurrence.prototype), "constructor", this).apply(this, arguments);

    this.occurrence = true;
  }

  return InsertAtEndOfOccurrence;
})(InsertAtEndOfTarget);

var InsertAtHeadOfOccurrence = (function (_InsertAtHeadOfTarget) {
  _inherits(InsertAtHeadOfOccurrence, _InsertAtHeadOfTarget);

  function InsertAtHeadOfOccurrence() {
    _classCallCheck(this, InsertAtHeadOfOccurrence);

    _get(Object.getPrototypeOf(InsertAtHeadOfOccurrence.prototype), "constructor", this).apply(this, arguments);

    this.occurrence = true;
  }

  return InsertAtHeadOfOccurrence;
})(InsertAtHeadOfTarget);

var InsertAtStartOfSubwordOccurrence = (function (_InsertAtStartOfOccurrence) {
  _inherits(InsertAtStartOfSubwordOccurrence, _InsertAtStartOfOccurrence);

  function InsertAtStartOfSubwordOccurrence() {
    _classCallCheck(this, InsertAtStartOfSubwordOccurrence);

    _get(Object.getPrototypeOf(InsertAtStartOfSubwordOccurrence.prototype), "constructor", this).apply(this, arguments);

    this.occurrenceType = "subword";
  }

  return InsertAtStartOfSubwordOccurrence;
})(InsertAtStartOfOccurrence);

var InsertAtEndOfSubwordOccurrence = (function (_InsertAtEndOfOccurrence) {
  _inherits(InsertAtEndOfSubwordOccurrence, _InsertAtEndOfOccurrence);

  function InsertAtEndOfSubwordOccurrence() {
    _classCallCheck(this, InsertAtEndOfSubwordOccurrence);

    _get(Object.getPrototypeOf(InsertAtEndOfSubwordOccurrence.prototype), "constructor", this).apply(this, arguments);

    this.occurrenceType = "subword";
  }

  return InsertAtEndOfSubwordOccurrence;
})(InsertAtEndOfOccurrence);

var InsertAtHeadOfSubwordOccurrence = (function (_InsertAtHeadOfOccurrence) {
  _inherits(InsertAtHeadOfSubwordOccurrence, _InsertAtHeadOfOccurrence);

  function InsertAtHeadOfSubwordOccurrence() {
    _classCallCheck(this, InsertAtHeadOfSubwordOccurrence);

    _get(Object.getPrototypeOf(InsertAtHeadOfSubwordOccurrence.prototype), "constructor", this).apply(this, arguments);

    this.occurrenceType = "subword";
  }

  return InsertAtHeadOfSubwordOccurrence;
})(InsertAtHeadOfOccurrence);

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

var InsertAtNextFoldStart = (function (_InsertByTarget7) {
  _inherits(InsertAtNextFoldStart, _InsertByTarget7);

  function InsertAtNextFoldStart() {
    _classCallCheck(this, InsertAtNextFoldStart);

    _get(Object.getPrototypeOf(InsertAtNextFoldStart.prototype), "constructor", this).apply(this, arguments);

    this.which = "end";
    this.target = "MoveToNextFoldStart";
  }

  // -------------------------
  return InsertAtNextFoldStart;
})(InsertByTarget);

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
          // selection.insertText("", {autoIndent: true})
          selection.cursor.moveLeft();
        } else {
          selection.insertText("", { autoIndent: true });
        }
      }
    }
  }]);

  return Change;
})(ActivateInsertModeBase);

var ChangeOccurrence = (function (_Change) {
  _inherits(ChangeOccurrence, _Change);

  function ChangeOccurrence() {
    _classCallCheck(this, ChangeOccurrence);

    _get(Object.getPrototypeOf(ChangeOccurrence.prototype), "constructor", this).apply(this, arguments);

    this.occurrence = true;
  }

  return ChangeOccurrence;
})(Change);

var Substitute = (function (_Change2) {
  _inherits(Substitute, _Change2);

  function Substitute() {
    _classCallCheck(this, Substitute);

    _get(Object.getPrototypeOf(Substitute.prototype), "constructor", this).apply(this, arguments);

    this.target = "MoveRight";
  }

  return Substitute;
})(Change);

var SubstituteLine = (function (_Change3) {
  _inherits(SubstituteLine, _Change3);

  function SubstituteLine() {
    _classCallCheck(this, SubstituteLine);

    _get(Object.getPrototypeOf(SubstituteLine.prototype), "constructor", this).apply(this, arguments);

    this.wise = "linewise";
    this.target = "MoveToRelativeLine";
  }

  // alias
  return SubstituteLine;
})(Change);

var ChangeLine = (function (_SubstituteLine) {
  _inherits(ChangeLine, _SubstituteLine);

  function ChangeLine() {
    _classCallCheck(this, ChangeLine);

    _get(Object.getPrototypeOf(ChangeLine.prototype), "constructor", this).apply(this, arguments);
  }

  return ChangeLine;
})(SubstituteLine);

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

module.exports = {
  ActivateInsertModeBase: ActivateInsertModeBase,
  ActivateInsertMode: ActivateInsertMode,
  ActivateReplaceMode: ActivateReplaceMode,
  InsertAfter: InsertAfter,
  InsertAtBeginningOfLine: InsertAtBeginningOfLine,
  InsertAfterEndOfLine: InsertAfterEndOfLine,
  InsertAtFirstCharacterOfLine: InsertAtFirstCharacterOfLine,
  InsertAtLastInsert: InsertAtLastInsert,
  InsertAboveWithNewline: InsertAboveWithNewline,
  InsertBelowWithNewline: InsertBelowWithNewline,
  InsertByTarget: InsertByTarget,
  InsertAtStartOfTarget: InsertAtStartOfTarget,
  InsertAtEndOfTarget: InsertAtEndOfTarget,
  InsertAtHeadOfTarget: InsertAtHeadOfTarget,
  InsertAtStartOfOccurrence: InsertAtStartOfOccurrence,
  InsertAtEndOfOccurrence: InsertAtEndOfOccurrence,
  InsertAtHeadOfOccurrence: InsertAtHeadOfOccurrence,
  InsertAtStartOfSubwordOccurrence: InsertAtStartOfSubwordOccurrence,
  InsertAtEndOfSubwordOccurrence: InsertAtEndOfSubwordOccurrence,
  InsertAtHeadOfSubwordOccurrence: InsertAtHeadOfSubwordOccurrence,
  InsertAtStartOfSmartWord: InsertAtStartOfSmartWord,
  InsertAtEndOfSmartWord: InsertAtEndOfSmartWord,
  InsertAtPreviousFoldStart: InsertAtPreviousFoldStart,
  InsertAtNextFoldStart: InsertAtNextFoldStart,
  Change: Change,
  ChangeOccurrence: ChangeOccurrence,
  Substitute: Substitute,
  SubstituteLine: SubstituteLine,
  ChangeLine: ChangeLine,
  ChangeToLastCharacterOfLine: ChangeToLastCharacterOfLine
};
// [FIXME] to re-override target.wise in visual-mode
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL29wZXJhdG9yLWluc2VydC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxXQUFXLENBQUE7Ozs7Ozs7Ozs7ZUFFSyxPQUFPLENBQUMsTUFBTSxDQUFDOztJQUF4QixLQUFLLFlBQUwsS0FBSzs7Z0JBQ08sT0FBTyxDQUFDLFlBQVksQ0FBQzs7SUFBakMsUUFBUSxhQUFSLFFBQVE7Ozs7Ozs7SUFNVCxzQkFBc0I7WUFBdEIsc0JBQXNCOztXQUF0QixzQkFBc0I7MEJBQXRCLHNCQUFzQjs7K0JBQXRCLHNCQUFzQjs7U0FFMUIsV0FBVyxHQUFHLEtBQUs7U0FDbkIscUJBQXFCLEdBQUcsSUFBSTs7O2VBSHhCLHNCQUFzQjs7Ozs7Ozs7Ozs7V0FhRixrQ0FBQyxPQUFPLEVBQUU7QUFDaEMsVUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDLE9BQU8sQ0FBQyxDQUFBO0FBQ3BELGFBQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMseUJBQXlCLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7S0FDbkU7Ozs7Ozs7OztXQU9lLDBCQUFDLFNBQVMsRUFBRTtBQUMxQixVQUFJLFlBQVksWUFBQSxDQUFBO0FBQ2hCLFVBQUksSUFBSSxDQUFDLFVBQVUsSUFBSSxJQUFJLEVBQUU7MEJBQ29CLElBQUksQ0FBQyxVQUFVO1lBQXZELEtBQUssZUFBTCxLQUFLO1lBQUUsU0FBUyxlQUFULFNBQVM7WUFBRSxTQUFTLGVBQVQsU0FBUztZQUFFLE9BQU8sZUFBUCxPQUFPOztBQUMzQyxZQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxFQUFFO0FBQ3ZCLGNBQU0sd0JBQXdCLEdBQUcsS0FBSyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsaUNBQWlDLENBQUMsQ0FBQTtBQUM1RixjQUFNLGFBQWEsR0FBRyxTQUFTLENBQUMs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ekIseUJBQXVCLEVBQXZCLHVCQUF1QjtBQUN2QiwwQkFBd0IsRUFBeEIsd0JBQXdCO0FBQ3hCLGtDQUFnQyxFQUFoQyxnQ0FBZ0M7QUFDaEMsZ0NBQThCLEVBQTlCLDhCQUE4QjtBQUM5QixpQ0FBK0IsRUFBL0IsK0JBQStCO0FBQy9CLDBCQUF3QixFQUF4Qix3QkFBd0I7QUFDeEIsd0JBQXNCLEVBQXRCLHNCQUFzQjtBQUN0QiwyQkFBeUIsRUFBekIseUJBQXlCO0FBQ3pCLHVCQUFxQixFQUFyQixxQkFBcUI7QUFDckIsUUFBTSxFQUFOLE1BQU07QUFDTixrQkFBZ0IsRUFBaEIsZ0JBQWdCO0FBQ2hCLFlBQVUsRUFBVixVQUFVO0FBQ1YsZ0JBQWMsRUFBZCxjQUFjO0FBQ2QsWUFBVSxFQUFWLFVBQVU7QUFDViw2QkFBMkIsRUFBM0IsMkJBQTJCO0NBQzVCLENBQUEiLCJmaWxlIjoiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvb3BlcmF0b3ItaW5zZXJ0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2UgYmFiZWxcIlxuXG5jb25zdCB7UmFuZ2V9ID0gcmVxdWlyZShcImF0b21cIilcbmNvbnN0IHtPcGVyYXRvcn0gPSByZXF1aXJlKFwiLi9vcGVyYXRvclwiKVxuXG4vLyBPcGVyYXRvciB3aGljaCBzdGFydCAnaW5zZXJ0LW1vZGUnXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBbTk9URV1cbi8vIFJ1bGU6IERvbid0IG1ha2UgYW55IHRleHQgbXV0YXRpb24gYmVmb3JlIGNhbGxpbmcgYEBzZWxlY3RUYXJnZXQoKWAuXG5jbGFzcyBBY3RpdmF0ZUluc2VydE1vZGVCYXNlIGV4dGVuZHMgT3BlcmF0b3Ige1xuICBzdGF0aWMgY29tbWFuZCA9IGZhbHNlXG4gIGZsYXNoVGFyZ2V0ID0gZmFsc2VcbiAgc3VwcG9ydEluc2VydGlvbkNvdW50ID0gdHJ1ZVxuXG4gIC8vIFdoZW4gZWFjaCBtdXRhaW9uJ3MgZXh0ZW50IGlzIG5vdCBpbnRlcnNlY3RpbmcsIG11aXRpcGxlIGNoYW5nZXMgYXJlIHJlY29yZGVkXG4gIC8vIGUuZ1xuICAvLyAgLSBNdWx0aWN1cnNvcnMgZWRpdFxuICAvLyAgLSBDdXJzb3IgbW92ZWQgaW4gaW5zZXJ0LW1vZGUoZS5nIGN0cmwtZiwgY3RybC1iKVxuICAvLyBCdXQgSSBkb24ndCBjYXJlIG11bHRpcGxlIGNoYW5nZXMganVzdCBiZWNhdXNlIEknbSBsYXp5KHNvIG5vdCBwZXJmZWN0IGltcGxlbWVudGF0aW9uKS5cbiAgLy8gSSBvbmx5IHRha2UgY2FyZSBvZiBvbmUgY2hhbmdlIGhhcHBlbmVkIGF0IGVhcmxpZXN0KHRvcEN1cnNvcidzIGNoYW5nZSkgcG9zaXRpb24uXG4gIC8vIFRoYXRzJyB3aHkgSSBzYXZlIHRvcEN1cnNvcidzIHBvc2l0aW9uIHRvIEB0b3BDdXJzb3JQb3NpdGlvbkF0SW5zZXJ0aW9uU3RhcnQgdG8gY29tcGFyZSB0cmF2ZXJzYWwgdG8gZGVsZXRpb25TdGFydFxuICAvLyBXaHkgSSB1c2UgdG9wQ3Vyc29yJ3MgY2hhbmdlPyBKdXN0IGJlY2F1c2UgaXQncyBlYXN5IHRvIHVzZSBmaXJzdCBjaGFuZ2UgcmV0dXJuZWQgYnkgZ2V0Q2hhbmdlU2luY2VDaGVja3BvaW50KCkuXG4gIGdldENoYW5nZVNpbmNlQ2hlY2twb2ludChwdXJwb3NlKSB7XG4gICAgY29uc3QgY2hlY2twb2ludCA9IHRoaXMuZ2V0QnVmZmVyQ2hlY2twb2ludChwdXJwb3NlKVxuICAgIHJldHVybiB0aGlzLmVkaXRvci5idWZmZXIuZ2V0Q2hhbmdlc1NpbmNlQ2hlY2twb2ludChjaGVja3BvaW50KVswXVxuICB9XG5cbiAgLy8gW0JVRy1CVVQtT0tdIFJlcGxheWluZyB0ZXh0LWRlbGV0aW9uLW9wZXJhdGlvbiBpcyBub3QgY29tcGF0aWJsZSB0byBwdXJlIFZpbS5cbiAgLy8gUHVyZSBWaW0gcmVjb3JkIGFsbCBvcGVyYXRpb24gaW4gaW5zZXJ0LW1vZGUgYXMga2V5c3Ryb2tlIGxldmVsIGFuZCBjYW4gZGlzdGluZ3Vpc2hcbiAgLy8gY2hhcmFjdGVyIGRlbGV0ZWQgYnkgYERlbGV0ZWAgb3IgYnkgYGN0cmwtdWAuXG4gIC8vIEJ1dCBJIGNhbiBub3QgYW5kIGRvbid0IHRyeWluZyB0byBtaW5pYyB0aGlzIGxldmVsIG9mIGNvbXBhdGliaWxpdHkuXG4gIC8vIFNvIGJhc2ljYWxseSBkZWxldGlvbi1kb25lLWluLW9uZSBpcyBleHBlY3RlZCB0byB3b3JrIHdlbGwuXG4gIHJlcGxheUxhc3RDaGFuZ2Uoc2VsZWN0aW9uKSB7XG4gICAgbGV0IHRleHRUb0luc2VydFxuICAgIGlmICh0aGlzLmxhc3RDaGFuZ2UgIT0gbnVsbCkge1xuICAgICAgY29uc3Qge3N0YXJ0LCBuZXdFeHRlbnQsIG9sZEV4dGVudCwgbmV3VGV4dH0gPSB0aGlzLmxhc3RDaGFuZ2VcbiAgICAgIGlmICghb2xkRXh0ZW50LmlzWmVybygpKSB7XG4gICAgICAgIGNvbnN0IHRyYXZlcnNhbFRvU3RhcnRPZkRlbGV0ZSA9IHN0YXJ0LnRyYXZlcnNhbEZyb20odGhpcy50b3BDdXJzb3JQb3NpdGlvbkF0SW5zZXJ0aW9uU3RhcnQpXG4gICAgICAgIGNvbnN0IGRlbGV0aW9uU3RhcnQgPSBzZWxlY3Rpb24uY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKCkudHJhdmVyc2UodHJhdmVyc2FsVG9TdGFydE9mRGVsZXRlKVxuICAgICAgICBjb25zdCBkZWxldGlvbkVuZCA9IGRlbGV0aW9uU3RhcnQudHJhdmVyc2Uob2xkRXh0ZW50KVxuICAgICAgICBzZWxlY3Rpb24uc2V0QnVmZmVyUmFuZ2UoW2RlbGV0aW9uU3RhcnQsIGRlbGV0aW9uRW5kXSlcbiAgICAgIH1cbiAgICAgIHRleHRUb0luc2VydCA9IG5ld1RleHRcbiAgICB9IGVsc2Uge1xuICAgICAgdGV4dFRvSW5zZXJ0ID0gXCJcIlxuICAgIH1cbiAgICBzZWxlY3Rpb24uaW5zZXJ0VGV4dCh0ZXh0VG9JbnNlcnQsIHthdXRvSW5kZW50OiB0cnVlfSlcbiAgfVxuXG4gIC8vIGNhbGxlZCB3aGVuIHJlcGVhdGVkXG4gIC8vIFtGSVhNRV0gdG8gdXNlIHJlcGxheUxhc3RDaGFuZ2UgaW4gcmVwZWF0SW5zZXJ0IG92ZXJyaWRpbmcgc3ViY2xhc3NzLlxuICByZXBlYXRJbnNlcnQoc2VsZWN0aW9uLCB0ZXh0KSB7XG4gICAgdGhpcy5yZXBsYXlMYXN0Q2hhbmdlKHNlbGVjdGlvbilcbiAgfVxuXG4gIGV4ZWN1dGUoKSB7XG4gICAgaWYgKHRoaXMucmVwZWF0ZWQpIHRoaXMuZmxhc2hUYXJnZXQgPSB0aGlzLnRyYWNrQ2hhbmdlID0gdHJ1ZVxuXG4gICAgdGhpcy5wcmVTZWxlY3QoKVxuXG4gICAgaWYgKHRoaXMuc2VsZWN0VGFyZ2V0KCkgfHwgdGhpcy50YXJnZXQud2lzZSAhPT0gXCJsaW5ld2lzZVwiKSB7XG4gICAgICBpZiAodGhpcy5tdXRhdGVUZXh0KSB0aGlzLm11dGF0ZVRleHQoKVxuXG4gICAgICBpZiAodGhpcy5yZXBlYXRlZCkge1xuICAgICAgICBmb3IgKGNvbnN0IHNlbGVjdGlvbiBvZiB0aGlzLmVkaXRvci5nZXRTZWxlY3Rpb25zKCkpIHtcbiAgICAgICAgICBjb25zdCB0ZXh0VG9JbnNlcnQgPSAodGhpcy5sYXN0Q2hhbmdlICYmIHRoaXMubGFzdENoYW5nZS5uZXdUZXh0KSB8fCBcIlwiXG4gICAgICAgICAgdGhpcy5yZXBlYXRJbnNlcnQoc2VsZWN0aW9uLCB0ZXh0VG9JbnNlcnQpXG4gICAgICAgICAgdGhpcy51dGlscy5tb3ZlQ3Vyc29yTGVmdChzZWxlY3Rpb24uY3Vyc29yKVxuICAgICAgICB9XG4gICAgICAgIHRoaXMubXV0YXRpb25NYW5hZ2VyLnNldENoZWNrcG9pbnQoXCJkaWQtZmluaXNoXCIpXG4gICAgICAgIHRoaXMuZ3JvdXBDaGFuZ2VzU2luY2VCdWZmZXJDaGVja3BvaW50KFwidW5kb1wiKVxuICAgICAgICB0aGlzLmVtaXREaWRGaW5pc2hNdXRhdGlvbigpXG4gICAgICAgIGlmICh0aGlzLmdldENvbmZpZyhcImNsZWFyTXVsdGlwbGVDdXJzb3JzT25Fc2NhcGVJbnNlcnRNb2RlXCIpKSB0aGlzLnZpbVN0YXRlLmNsZWFyU2VsZWN0aW9ucygpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBBdm9pZCBmcmVlemluZyBieSBhY2NjaWRlbnRhbCBiaWcgY291bnQoZS5nLiBgNTU1NTU1NTU1NTU1NWlgKSwgU2VlICM1NjAsICM1OTZcbiAgICAgICAgbGV0IGluc2VydGlvbkNvdW50ID0gdGhpcy5zdXBwb3J0SW5zZXJ0aW9uQ291bnQgPyB0aGlzLmxpbWl0TnVtYmVyKHRoaXMuZ2V0Q291bnQoKSAtIDEsIHttYXg6IDEwMH0pIDogMFxuXG4gICAgICAgIGxldCB0ZXh0QnlPcGVyYXRvciA9IFwiXCJcbiAgICAgICAgaWYgKGluc2VydGlvbkNvdW50ID4gMCkge1xuICAgICAgICAgIGNvbnN0IGNoYW5nZSA9IHRoaXMuZ2V0Q2hhbmdlU2luY2VDaGVja3BvaW50KFwidW5kb1wiKVxuICAgICAgICAgIHRleHRCeU9wZXJhdG9yID0gKGNoYW5nZSAmJiBjaGFuZ2UubmV3VGV4dCkgfHwgXCJcIlxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5jcmVhdGVCdWZmZXJDaGVja3BvaW50KFwiaW5zZXJ0XCIpXG4gICAgICAgIGNvbnN0IHRvcEN1cnNvciA9IHRoaXMuZWRpdG9yLmdldEN1cnNvcnNPcmRlcmVkQnlCdWZmZXJQb3NpdGlvbigpWzBdXG4gICAgICAgIHRoaXMudG9wQ3Vyc29yUG9zaXRpb25BdEluc2VydGlvblN0YXJ0ID0gdG9wQ3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKClcblxuICAgICAgICAvLyBTa2lwIG5vcm1hbGl6YXRpb24gb2YgYmxvY2t3aXNlU2VsZWN0aW9uLlxuICAgICAgICAvLyBTaW5jZSB3YW50IHRvIGtlZXAgbXVsdGktY3Vyc29yIGFuZCBpdCdzIHBvc2l0aW9uIGluIHdoZW4gc2hpZnQgdG8gaW5zZXJ0LW1vZGUuXG4gICAgICAgIGZvciAoY29uc3QgYmxvY2t3aXNlU2VsZWN0aW9uIG9mIHRoaXMuZ2V0QmxvY2t3aXNlU2VsZWN0aW9ucygpKSB7XG4gICAgICAgICAgYmxvY2t3aXNlU2VsZWN0aW9uLnNraXBOb3JtYWxpemF0aW9uKClcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGRpc3Bvc2FibGUgPSB0aGlzLnZpbVN0YXRlLnByZWVtcHRXaWxsRGVhY3RpdmF0ZU1vZGUoKHttb2RlfSkgPT4ge1xuICAgICAgICAgIGlmIChtb2RlICE9PSBcImluc2VydFwiKSByZXR1cm5cbiAgICAgICAgICBkaXNwb3NhYmxlLmRpc3Bvc2UoKVxuXG4gICAgICAgICAgdGhpcy52aW1TdGF0ZS5tYXJrLnNldChcIl5cIiwgdGhpcy5lZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKSkgLy8gTGFzdCBpbnNlcnQtbW9kZSBwb3NpdGlvblxuICAgICAgICAgIGxldCB0ZXh0QnlVc2VySW5wdXQgPSBcIlwiXG4gICAgICAgICAgY29uc3QgY2hhbmdlID0gdGhpcy5nZXRDaGFuZ2VTaW5jZUNoZWNrcG9pbnQoXCJpbnNlcnRcIilcbiAgICAgICAgICBpZiAoY2hhbmdlKSB7XG4gICAgICAgICAgICB0aGlzLmxhc3RDaGFuZ2UgPSBjaGFuZ2VcbiAgICAgICAgICAgIHRoaXMuc2V0TWFya0ZvckNoYW5nZShuZXcgUmFuZ2UoY2hhbmdlLnN0YXJ0LCBjaGFuZ2Uuc3RhcnQudHJhdmVyc2UoY2hhbmdlLm5ld0V4dGVudCkpKVxuICAgICAgICAgICAgdGV4dEJ5VXNlcklucHV0ID0gY2hhbmdlLm5ld1RleHRcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy52aW1TdGF0ZS5yZWdpc3Rlci5zZXQoXCIuXCIsIHt0ZXh0OiB0ZXh0QnlVc2VySW5wdXR9KSAvLyBMYXN0IGluc2VydGVkIHRleHRcblxuICAgICAgICAgIHdoaWxlIChpbnNlcnRpb25Db3VudCkge1xuICAgICAgICAgICAgaW5zZXJ0aW9uQ291bnQtLVxuICAgICAgICAgICAgZm9yIChjb25zdCBzZWxlY3Rpb24gb2YgdGhpcy5lZGl0b3IuZ2V0U2VsZWN0aW9ucygpKSB7XG4gICAgICAgICAgICAgIHNlbGVjdGlvbi5pbnNlcnRUZXh0KHRleHRCeU9wZXJhdG9yICsgdGV4dEJ5VXNlcklucHV0LCB7YXV0b0luZGVudDogdHJ1ZX0pXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gVGhpcyBjdXJzb3Igc3RhdGUgaXMgcmVzdG9yZWQgb24gdW5kby5cbiAgICAgICAgICAvLyBTbyBjdXJzb3Igc3RhdGUgaGFzIHRvIGJlIHVwZGF0ZWQgYmVmb3JlIG5leHQgZ3JvdXBDaGFuZ2VzU2luY2VDaGVja3BvaW50KClcbiAgICAgICAgICBpZiAodGhpcy5nZXRDb25maWcoXCJjbGVhck11bHRpcGxlQ3Vyc29yc09uRXNjYXBlSW5zZXJ0TW9kZVwiKSkgdGhpcy52aW1TdGF0ZS5jbGVhclNlbGVjdGlvbnMoKVxuXG4gICAgICAgICAgLy8gZ3JvdXBpbmcgY2hhbmdlcyBmb3IgdW5kbyBjaGVja3BvaW50IG5lZWQgdG8gY29tZSBsYXN0XG4gICAgICAgICAgdGhpcy5ncm91cENoYW5nZXNTaW5jZUJ1ZmZlckNoZWNrcG9pbnQoXCJ1bmRvXCIpXG5cbiAgICAgICAgICBjb25zdCBwcmV2ZW50SW5jb3JyZWN0V3JhcCA9IHRoaXMuZWRpdG9yLmhhc0F0b21pY1NvZnRUYWJzKClcbiAgICAgICAgICBmb3IgKGNvbnN0IGN1cnNvciBvZiB0aGlzLmVkaXRvci5nZXRDdXJzb3JzKCkpIHtcbiAgICAgICAgICAgIHRoaXMudXRpbHMubW92ZUN1cnNvckxlZnQoY3Vyc29yLCB7cHJldmVudEluY29ycmVjdFdyYXB9KVxuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgICAgY29uc3Qgc3VibW9kZSA9IHRoaXMubmFtZSA9PT0gXCJBY3RpdmF0ZVJlcGxhY2VNb2RlXCIgPyBcInJlcGxhY2VcIiA6IHVuZGVmaW5lZFxuICAgICAgICB0aGlzLmFjdGl2YXRlTW9kZShcImluc2VydFwiLCBzdWJtb2RlKVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmFjdGl2YXRlTW9kZShcIm5vcm1hbFwiKVxuICAgIH1cbiAgfVxufVxuXG5jbGFzcyBBY3RpdmF0ZUluc2VydE1vZGUgZXh0ZW5kcyBBY3RpdmF0ZUluc2VydE1vZGVCYXNlIHtcbiAgdGFyZ2V0ID0gXCJFbXB0eVwiXG4gIGFjY2VwdFByZXNldE9jY3VycmVuY2UgPSBmYWxzZVxuICBhY2NlcHRQZXJzaXN0ZW50U2VsZWN0aW9uID0gZmFsc2Vcbn1cblxuY2xhc3MgQWN0aXZhdGVSZXBsYWNlTW9kZSBleHRlbmRzIEFjdGl2YXRlSW5zZXJ0TW9kZSB7XG4gIGluaXRpYWxpemUoKSB7XG4gICAgY29uc3QgcmVwbGFjZWRDaGFyc0J5U2VsZWN0aW9uID0gbmV3IFdlYWtNYXAoKVxuXG4gICAgY29uc3Qgb25XaWxsSW5zZXJ0RGlzcG9zYWJsZSA9IHRoaXMuZWRpdG9yLm9uV2lsbEluc2VydFRleHQoKHt0ZXh0ID0gXCJcIiwgY2FuY2VsfSkgPT4ge1xuICAgICAgY2FuY2VsKClcbiAgICAgIGZvciAoY29uc3Qgc2VsZWN0aW9uIG9mIHRoaXMuZWRpdG9yLmdldFNlbGVjdGlvbnMoKSkge1xuICAgICAgICBmb3IgKGNvbnN0IGNoYXIgb2YgdGV4dC5zcGxpdChcIlwiKSkge1xuICAgICAgICAgIGlmIChjaGFyICE9PSBcIlxcblwiICYmICFzZWxlY3Rpb24uY3Vyc29yLmlzQXRFbmRPZkxpbmUoKSkgc2VsZWN0aW9uLnNlbGVjdFJpZ2h0KClcbiAgICAgICAgICBpZiAoIXJlcGxhY2VkQ2hhcnNCeVNlbGVjdGlvbi5oYXMoc2VsZWN0aW9uKSkgcmVwbGFjZWRDaGFyc0J5U2VsZWN0aW9uLnNldChzZWxlY3Rpb24sIFtdKVxuICAgICAgICAgIHJlcGxhY2VkQ2hhcnNCeVNlbGVjdGlvbi5nZXQoc2VsZWN0aW9uKS5wdXNoKHNlbGVjdGlvbi5nZXRUZXh0KCkpXG4gICAgICAgICAgc2VsZWN0aW9uLmluc2VydFRleHQoY2hhcilcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG5cbiAgICBjb25zdCBvdmVycmlkZUNvcmVCYWNrU3BhY2VEaXNwb3NhYmxlID0gYXRvbS5jb21tYW5kcy5hZGQodGhpcy5lZGl0b3JFbGVtZW50LCBcImNvcmU6YmFja3NwYWNlXCIsIGV2ZW50ID0+IHtcbiAgICAgIGV2ZW50LnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpXG4gICAgICBmb3IgKGNvbnN0IHNlbGVjdGlvbiBvZiB0aGlzLmVkaXRvci5nZXRTZWxlY3Rpb25zKCkpIHtcbiAgICAgICAgY29uc3QgY2hhcnMgPSByZXBsYWNlZENoYXJzQnlTZWxlY3Rpb24uZ2V0KHNlbGVjdGlvbilcbiAgICAgICAgaWYgKGNoYXJzICYmIGNoYXJzLmxlbmd0aCkge1xuICAgICAgICAgIHNlbGVjdGlvbi5zZWxlY3RMZWZ0KClcbiAgICAgICAgICBpZiAoIXNlbGVjdGlvbi5pbnNlcnRUZXh0KGNoYXJzLnBvcCgpKS5pc0VtcHR5KCkpIHNlbGVjdGlvbi5jdXJzb3IubW92ZUxlZnQoKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcblxuICAgIGNvbnN0IGRpc3Bvc2FibGUgPSB0aGlzLnZpbVN0YXRlLnByZWVtcHRXaWxsRGVhY3RpdmF0ZU1vZGUoKHttb2RlfSkgPT4ge1xuICAgICAgaWYgKG1vZGUgIT09IFwiaW5zZXJ0XCIpIHJldHVyblxuICAgICAgZGlzcG9zYWJsZS5kaXNwb3NlKClcbiAgICAgIG9uV2lsbEluc2VydERpc3Bvc2FibGUuZGlzcG9zZSgpXG4gICAgICBvdmVycmlkZUNvcmVCYWNrU3BhY2VEaXNwb3NhYmxlLmRpc3Bvc2UoKVxuICAgIH0pXG5cbiAgICBzdXBlci5pbml0aWFsaXplKClcbiAgfVxuXG4gIHJlcGVhdEluc2VydChzZWxlY3Rpb24sIHRleHQpIHtcbiAgICBmb3IgKGNvbnN0IGNoYXIgb2YgdGV4dCkge1xuICAgICAgaWYgKGNoYXIgPT09IFwiXFxuXCIpIGNvbnRpbnVlXG4gICAgICBpZiAoc2VsZWN0aW9uLmN1cnNvci5pc0F0RW5kT2ZMaW5lKCkpIGJyZWFrXG4gICAgICBzZWxlY3Rpb24uc2VsZWN0UmlnaHQoKVxuICAgIH1cbiAgICBzZWxlY3Rpb24uaW5zZXJ0VGV4dCh0ZXh0LCB7YXV0b0luZGVudDogZmFsc2V9KVxuICB9XG59XG5cbmNsYXNzIEluc2VydEFmdGVyIGV4dGVuZHMgQWN0aXZhdGVJbnNlcnRNb2RlIHtcbiAgZXhlY3V0ZSgpIHtcbiAgICBmb3IgKGNvbnN0IGN1cnNvciBvZiB0aGlzLmVkaXRvci5nZXRDdXJzb3JzKCkpIHtcbiAgICAgIHRoaXMudXRpbHMubW92ZUN1cnNvclJpZ2h0KGN1cnNvcilcbiAgICB9XG4gICAgc3VwZXIuZXhlY3V0ZSgpXG4gIH1cbn1cblxuLy8ga2V5OiAnZyBJJyBpbiBhbGwgbW9kZVxuY2xhc3MgSW5zZXJ0QXRCZWdpbm5pbmdPZkxpbmUgZXh0ZW5kcyBBY3RpdmF0ZUluc2VydE1vZGUge1xuICBleGVjdXRlKCkge1xuICAgIGlmICh0aGlzLm1vZGUgPT09IFwidmlzdWFsXCIgJiYgdGhpcy5zdWJtb2RlICE9PSBcImJsb2Nrd2lzZVwiKSB7XG4gICAgICB0aGlzLmVkaXRvci5zcGxpdFNlbGVjdGlvbnNJbnRvTGluZXMoKVxuICAgIH1cbiAgICBmb3IgKGNvbnN0IGJsb2Nrd2lzZVNlbGVjdGlvbiBvZiB0aGlzLmdldEJsb2Nrd2lzZVNlbGVjdGlvbnMoKSkge1xuICAgICAgYmxvY2t3aXNlU2VsZWN0aW9uLnNraXBOb3JtYWxpemF0aW9uKClcbiAgICB9XG4gICAgdGhpcy5lZGl0b3IubW92ZVRvQmVnaW5uaW5nT2ZMaW5lKClcbiAgICBzdXBlci5leGVjdXRlKClcbiAgfVxufVxuXG4vLyBrZXk6IG5vcm1hbCAnQSdcbmNsYXNzIEluc2VydEFmdGVyRW5kT2ZMaW5lIGV4dGVuZHMgQWN0aXZhdGVJbnNlcnRNb2RlIHtcbiAgZXhlY3V0ZSgpIHtcbiAgICB0aGlzLmVkaXRvci5tb3ZlVG9FbmRPZkxpbmUoKVxuICAgIHN1cGVyLmV4ZWN1dGUoKVxuICB9XG59XG5cbi8vIGtleTogbm9ybWFsICdJJ1xuY2xhc3MgSW5zZXJ0QXRGaXJzdENoYXJhY3Rlck9mTGluZSBleHRlbmRzIEFjdGl2YXRlSW5zZXJ0TW9kZSB7XG4gIGV4ZWN1dGUoKSB7XG4gICAgZm9yIChjb25zdCBjdXJzb3Igb2YgdGhpcy5lZGl0b3IuZ2V0Q3Vyc29ycygpKSB7XG4gICAgICB0aGlzLnV0aWxzLm1vdmVDdXJzb3JUb0ZpcnN0Q2hhcmFjdGVyQXRSb3coY3Vyc29yLCBjdXJzb3IuZ2V0QnVmZmVyUm93KCkpXG4gICAgfVxuICAgIHN1cGVyLmV4ZWN1dGUoKVxuICB9XG59XG5cbmNsYXNzIEluc2VydEF0TGFzdEluc2VydCBleHRlbmRzIEFjdGl2YXRlSW5zZXJ0TW9kZSB7XG4gIGV4ZWN1dGUoKSB7XG4gICAgY29uc3QgcG9pbnQgPSB0aGlzLnZpbVN0YXRlLm1hcmsuZ2V0KFwiXlwiKVxuICAgIGlmIChwb2ludCkge1xuICAgICAgdGhpcy5lZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24ocG9pbnQpXG4gICAgICB0aGlzLmVkaXRvci5zY3JvbGxUb0N1cnNvclBvc2l0aW9uKHtjZW50ZXI6IHRydWV9KVxuICAgIH1cbiAgICBzdXBlci5leGVjdXRlKClcbiAgfVxufVxuXG5jbGFzcyBJbnNlcnRBYm92ZVdpdGhOZXdsaW5lIGV4dGVuZHMgQWN0aXZhdGVJbnNlcnRNb2RlIHtcbiAgaW5pdGlhbGl6ZSgpIHtcbiAgICB0aGlzLm9yaWdpbmFsQ3Vyc29yUG9zaXRpb25NYXJrZXIgPSB0aGlzLmVkaXRvci5tYXJrQnVmZmVyUG9zaXRpb24odGhpcy5lZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKSlcbiAgICBzdXBlci5pbml0aWFsaXplKClcbiAgfVxuXG4gIC8vIFRoaXMgaXMgZm9yIGBvYCBhbmQgYE9gIG9wZXJhdG9yLlxuICAvLyBPbiB1bmRvL3JlZG8gcHV0IGN1cnNvciBhdCBvcmlnaW5hbCBwb2ludCB3aGVyZSB1c2VyIHR5cGUgYG9gIG9yIGBPYC5cbiAgZ3JvdXBDaGFuZ2VzU2luY2VCdWZmZXJDaGVja3BvaW50KHB1cnBvc2UpIHtcbiAgICBpZiAodGhpcy5yZXBlYXRlZCkge1xuICAgICAgc3VwZXIuZ3JvdXBDaGFuZ2VzU2luY2VCdWZmZXJDaGVja3BvaW50KHB1cnBvc2UpXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBjb25zdCBsYXN0Q3Vyc29yID0gdGhpcy5lZGl0b3IuZ2V0TGFzdEN1cnNvcigpXG4gICAgY29uc3QgY3Vyc29yUG9zaXRpb24gPSBsYXN0Q3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKClcbiAgICBsYXN0Q3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHRoaXMub3JpZ2luYWxDdXJzb3JQb3NpdGlvbk1hcmtlci5nZXRIZWFkQnVmZmVyUG9zaXRpb24oKSlcbiAgICB0aGlzLm9yaWdpbmFsQ3Vyc29yUG9zaXRpb25NYXJrZXIuZGVzdHJveSgpXG4gICAgdGhpcy5vcmlnaW5hbEN1cnNvclBvc2l0aW9uTWFya2VyID0gbnVsbFxuXG4gICAgaWYgKHRoaXMuZ2V0Q29uZmlnKFwiZ3JvdXBDaGFuZ2VzV2hlbkxlYXZpbmdJbnNlcnRNb2RlXCIpKSB7XG4gICAgICBzdXBlci5ncm91cENoYW5nZXNTaW5jZUJ1ZmZlckNoZWNrcG9pbnQocHVycG9zZSlcbiAgICB9XG4gICAgbGFzdEN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihjdXJzb3JQb3NpdGlvbilcbiAgfVxuXG4gIGF1dG9JbmRlbnRFbXB0eVJvd3MoKSB7XG4gICAgZm9yIChjb25zdCBjdXJzb3Igb2YgdGhpcy5lZGl0b3IuZ2V0Q3Vyc29ycygpKSB7XG4gICAgICBjb25zdCByb3cgPSBjdXJzb3IuZ2V0QnVmZmVyUm93KClcbiAgICAgIGlmICh0aGlzLmlzRW1wdHlSb3cocm93KSkgdGhpcy5lZGl0b3IuYXV0b0luZGVudEJ1ZmZlclJvdyhyb3cpXG4gICAgfVxuICB9XG5cbiAgbXV0YXRlVGV4dCgpIHtcbiAgICB0aGlzLmVkaXRvci5pbnNlcnROZXdsaW5lQWJvdmUoKVxuICAgIGlmICh0aGlzLmVkaXRvci5hdXRvSW5kZW50KSB0aGlzLmF1dG9JbmRlbnRFbXB0eVJvd3MoKVxuICB9XG5cbiAgcmVwZWF0SW5zZXJ0KHNlbGVjdGlvbiwgdGV4dCkge1xuICAgIHNlbGVjdGlvbi5pbnNlcnRUZXh0KHRleHQudHJpbUxlZnQoKSwge2F1dG9JbmRlbnQ6IHRydWV9KVxuICB9XG59XG5cbmNsYXNzIEluc2VydEJlbG93V2l0aE5ld2xpbmUgZXh0ZW5kcyBJbnNlcnRBYm92ZVdpdGhOZXdsaW5lIHtcbiAgbXV0YXRlVGV4dCgpIHtcbiAgICBmb3IgKGNvbnN0IGN1cnNvciBvZiB0aGlzLmVkaXRvci5nZXRDdXJzb3JzKCkpIHtcbiAgICAgIHRoaXMudXRpbHMuc2V0QnVmZmVyUm93KGN1cnNvciwgdGhpcy5nZXRGb2xkRW5kUm93Rm9yUm93KGN1cnNvci5nZXRCdWZmZXJSb3coKSkpXG4gICAgfVxuXG4gICAgdGhpcy5lZGl0b3IuaW5zZXJ0TmV3bGluZUJlbG93KClcbiAgICBpZiAodGhpcy5lZGl0b3IuYXV0b0luZGVudCkgdGhpcy5hdXRvSW5kZW50RW1wdHlSb3dzKClcbiAgfVxufVxuXG4vLyBBZHZhbmNlZCBJbnNlcnRpb25cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIEluc2VydEJ5VGFyZ2V0IGV4dGVuZHMgQWN0aXZhdGVJbnNlcnRNb2RlQmFzZSB7XG4gIHN0YXRpYyBjb21tYW5kID0gZmFsc2VcbiAgd2hpY2ggPSBudWxsIC8vIG9uZSBvZiBbJ3N0YXJ0JywgJ2VuZCcsICdoZWFkJywgJ3RhaWwnXVxuXG4gIGluaXRpYWxpemUoKSB7XG4gICAgLy8gSEFDS1xuICAgIC8vIFdoZW4gZyBpIGlzIG1hcHBlZCB0byBgaW5zZXJ0LWF0LXN0YXJ0LW9mLXRhcmdldGAuXG4gICAgLy8gYGcgaSAzIGxgIHN0YXJ0IGluc2VydCBhdCAzIGNvbHVtbiByaWdodCBwb3NpdGlvbi5cbiAgICAvLyBJbiB0aGlzIGNhc2UsIHdlIGRvbid0IHdhbnQgcmVwZWF0IGluc2VydGlvbiAzIHRpbWVzLlxuICAgIC8vIFRoaXMgQGdldENvdW50KCkgY2FsbCBjYWNoZSBudW1iZXIgYXQgdGhlIHRpbWluZyBCRUZPUkUgJzMnIGlzIHNwZWNpZmllZC5cbiAgICB0aGlzLmdldENvdW50KClcbiAgICBzdXBlci5pbml0aWFsaXplKClcbiAgfVxuXG4gIGV4ZWN1dGUoKSB7XG4gICAgdGhpcy5vbkRpZFNlbGVjdFRhcmdldCgoKSA9PiB7XG4gICAgICAvLyBJbiB2Qy92TCwgd2hlbiBvY2N1cnJlbmNlIG1hcmtlciB3YXMgTk9UIHNlbGVjdGVkLFxuICAgICAgLy8gaXQgYmVoYXZlJ3MgdmVyeSBzcGVjaWFsbHlcbiAgICAgIC8vIHZDOiBgSWAgYW5kIGBBYCBiZWhhdmVzIGFzIHNob2Z0IGhhbmQgb2YgYGN0cmwtdiBJYCBhbmQgYGN0cmwtdiBBYC5cbiAgICAgIC8vIHZMOiBgSWAgYW5kIGBBYCBwbGFjZSBjdXJzb3JzIGF0IGVhY2ggc2VsZWN0ZWQgbGluZXMgb2Ygc3RhcnQoIG9yIGVuZCApIG9mIG5vbi13aGl0ZS1zcGFjZSBjaGFyLlxuICAgICAgaWYgKCF0aGlzLm9jY3VycmVuY2VTZWxlY3RlZCAmJiB0aGlzLm1vZGUgPT09IFwidmlzdWFsXCIgJiYgdGhpcy5zdWJtb2RlICE9PSBcImJsb2Nrd2lzZVwiKSB7XG4gICAgICAgIGZvciAoY29uc3QgJHNlbGVjdGlvbiBvZiB0aGlzLnN3cmFwLmdldFNlbGVjdGlvbnModGhpcy5lZGl0b3IpKSB7XG4gICAgICAgICAgJHNlbGVjdGlvbi5ub3JtYWxpemUoKVxuICAgICAgICAgICRzZWxlY3Rpb24uYXBwbHlXaXNlKFwiYmxvY2t3aXNlXCIpXG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5zdWJtb2RlID09PSBcImxpbmV3aXNlXCIpIHtcbiAgICAgICAgICBmb3IgKGNvbnN0IGJsb2Nrd2lzZVNlbGVjdGlvbiBvZiB0aGlzLmdldEJsb2Nrd2lzZVNlbGVjdGlvbnMoKSkge1xuICAgICAgICAgICAgYmxvY2t3aXNlU2VsZWN0aW9uLmV4cGFuZE1lbWJlclNlbGVjdGlvbnNPdmVyTGluZVdpdGhUcmltUmFuZ2UoKVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBmb3IgKGNvbnN0ICRzZWxlY3Rpb24gb2YgdGhpcy5zd3JhcC5nZXRTZWxlY3Rpb25zKHRoaXMuZWRpdG9yKSkge1xuICAgICAgICAkc2VsZWN0aW9uLnNldEJ1ZmZlclBvc2l0aW9uVG8odGhpcy53aGljaClcbiAgICAgIH1cbiAgICB9KVxuICAgIHN1cGVyLmV4ZWN1dGUoKVxuICB9XG59XG5cbi8vIGtleTogJ0knLCBVc2VkIGluICd2aXN1YWwtbW9kZS5jaGFyYWN0ZXJ3aXNlJywgdmlzdWFsLW1vZGUuYmxvY2t3aXNlXG5jbGFzcyBJbnNlcnRBdFN0YXJ0T2ZUYXJnZXQgZXh0ZW5kcyBJbnNlcnRCeVRhcmdldCB7XG4gIHdoaWNoID0gXCJzdGFydFwiXG59XG5cbi8vIGtleTogJ0EnLCBVc2VkIGluICd2aXN1YWwtbW9kZS5jaGFyYWN0ZXJ3aXNlJywgJ3Zpc3VhbC1tb2RlLmJsb2Nrd2lzZSdcbmNsYXNzIEluc2VydEF0RW5kT2ZUYXJnZXQgZXh0ZW5kcyBJbnNlcnRCeVRhcmdldCB7XG4gIHdoaWNoID0gXCJlbmRcIlxufVxuXG5jbGFzcyBJbnNlcnRBdEhlYWRPZlRhcmdldCBleHRlbmRzIEluc2VydEJ5VGFyZ2V0IHtcbiAgd2hpY2ggPSBcImhlYWRcIlxufVxuXG5jbGFzcyBJbnNlcnRBdFN0YXJ0T2ZPY2N1cnJlbmNlIGV4dGVuZHMgSW5zZXJ0QXRTdGFydE9mVGFyZ2V0IHtcbiAgb2NjdXJyZW5jZSA9IHRydWVcbn1cblxuY2xhc3MgSW5zZXJ0QXRFbmRPZk9jY3VycmVuY2UgZXh0ZW5kcyBJbnNlcnRBdEVuZE9mVGFyZ2V0IHtcbiAgb2NjdXJyZW5jZSA9IHRydWVcbn1cblxuY2xhc3MgSW5zZXJ0QXRIZWFkT2ZPY2N1cnJlbmNlIGV4dGVuZHMgSW5zZXJ0QXRIZWFkT2ZUYXJnZXQge1xuICBvY2N1cnJlbmNlID0gdHJ1ZVxufVxuXG5jbGFzcyBJbnNlcnRBdFN0YXJ0T2ZTdWJ3b3JkT2NjdXJyZW5jZSBleHRlbmRzIEluc2VydEF0U3RhcnRPZk9jY3VycmVuY2Uge1xuICBvY2N1cnJlbmNlVHlwZSA9IFwic3Vid29yZFwiXG59XG5cbmNsYXNzIEluc2VydEF0RW5kT2ZTdWJ3b3JkT2NjdXJyZW5jZSBleHRlbmRzIEluc2VydEF0RW5kT2ZPY2N1cnJlbmNlIHtcbiAgb2NjdXJyZW5jZVR5cGUgPSBcInN1YndvcmRcIlxufVxuXG5jbGFzcyBJbnNlcnRBdEhlYWRPZlN1YndvcmRPY2N1cnJlbmNlIGV4dGVuZHMgSW5zZXJ0QXRIZWFkT2ZPY2N1cnJlbmNlIHtcbiAgb2NjdXJyZW5jZVR5cGUgPSBcInN1YndvcmRcIlxufVxuXG5jbGFzcyBJbnNlcnRBdFN0YXJ0T2ZTbWFydFdvcmQgZXh0ZW5kcyBJbnNlcnRCeVRhcmdldCB7XG4gIHdoaWNoID0gXCJzdGFydFwiXG4gIHRhcmdldCA9IFwiTW92ZVRvUHJldmlvdXNTbWFydFdvcmRcIlxufVxuXG5jbGFzcyBJbnNlcnRBdEVuZE9mU21hcnRXb3JkIGV4dGVuZHMgSW5zZXJ0QnlUYXJnZXQge1xuICB3aGljaCA9IFwiZW5kXCJcbiAgdGFyZ2V0ID0gXCJNb3ZlVG9FbmRPZlNtYXJ0V29yZFwiXG59XG5cbmNsYXNzIEluc2VydEF0UHJldmlvdXNGb2xkU3RhcnQgZXh0ZW5kcyBJbnNlcnRCeVRhcmdldCB7XG4gIHdoaWNoID0gXCJzdGFydFwiXG4gIHRhcmdldCA9IFwiTW92ZVRvUHJldmlvdXNGb2xkU3RhcnRcIlxufVxuXG5jbGFzcyBJbnNlcnRBdE5leHRGb2xkU3RhcnQgZXh0ZW5kcyBJbnNlcnRCeVRhcmdldCB7XG4gIHdoaWNoID0gXCJlbmRcIlxuICB0YXJnZXQgPSBcIk1vdmVUb05leHRGb2xkU3RhcnRcIlxufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBDaGFuZ2UgZXh0ZW5kcyBBY3RpdmF0ZUluc2VydE1vZGVCYXNlIHtcbiAgdHJhY2tDaGFuZ2UgPSB0cnVlXG4gIHN1cHBvcnRJbnNlcnRpb25Db3VudCA9IGZhbHNlXG5cbiAgbXV0YXRlVGV4dCgpIHtcbiAgICAvLyBBbGx3YXlzIGR5bmFtaWNhbGx5IGRldGVybWluZSBzZWxlY3Rpb24gd2lzZSB3dGhvdXQgY29uc3VsdGluZyB0YXJnZXQud2lzZVxuICAgIC8vIFJlYXNvbjogd2hlbiBgYyBpIHtgLCB3aXNlIGlzICdjaGFyYWN0ZXJ3aXNlJywgYnV0IGFjdHVhbGx5IHNlbGVjdGVkIHJhbmdlIGlzICdsaW5ld2lzZSdcbiAgICAvLyAgIHtcbiAgICAvLyAgICAgYVxuICAgIC8vICAgfVxuICAgIGNvbnN0IGlzTGluZXdpc2VUYXJnZXQgPSB0aGlzLnN3cmFwLmRldGVjdFdpc2UodGhpcy5lZGl0b3IpID09PSBcImxpbmV3aXNlXCJcbiAgICBmb3IgKGNvbnN0IHNlbGVjdGlvbiBvZiB0aGlzLmVkaXRvci5nZXRTZWxlY3Rpb25zKCkpIHtcbiAgICAgIGlmICghdGhpcy5nZXRDb25maWcoXCJkb250VXBkYXRlUmVnaXN0ZXJPbkNoYW5nZU9yU3Vic3RpdHV0ZVwiKSkge1xuICAgICAgICB0aGlzLnNldFRleHRUb1JlZ2lzdGVyRm9yU2VsZWN0aW9uKHNlbGVjdGlvbilcbiAgICAgIH1cbiAgICAgIGlmIChpc0xpbmV3aXNlVGFyZ2V0KSB7XG4gICAgICAgIHNlbGVjdGlvbi5pbnNlcnRUZXh0KFwiXFxuXCIsIHthdXRvSW5kZW50OiB0cnVlfSlcbiAgICAgICAgLy8gc2VsZWN0aW9uLmluc2VydFRleHQoXCJcIiwge2F1dG9JbmRlbnQ6IHRydWV9KVxuICAgICAgICBzZWxlY3Rpb24uY3Vyc29yLm1vdmVMZWZ0KClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNlbGVjdGlvbi5pbnNlcnRUZXh0KFwiXCIsIHthdXRvSW5kZW50OiB0cnVlfSlcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuY2xhc3MgQ2hhbmdlT2NjdXJyZW5jZSBleHRlbmRzIENoYW5nZSB7XG4gIG9jY3VycmVuY2UgPSB0cnVlXG59XG5cbmNsYXNzIFN1YnN0aXR1dGUgZXh0ZW5kcyBDaGFuZ2Uge1xuICB0YXJnZXQgPSBcIk1vdmVSaWdodFwiXG59XG5cbmNsYXNzIFN1YnN0aXR1dGVMaW5lIGV4dGVuZHMgQ2hhbmdlIHtcbiAgd2lzZSA9IFwibGluZXdpc2VcIiAvLyBbRklYTUVdIHRvIHJlLW92ZXJyaWRlIHRhcmdldC53aXNlIGluIHZpc3VhbC1tb2RlXG4gIHRhcmdldCA9IFwiTW92ZVRvUmVsYXRpdmVMaW5lXCJcbn1cblxuLy8gYWxpYXNcbmNsYXNzIENoYW5nZUxpbmUgZXh0ZW5kcyBTdWJzdGl0dXRlTGluZSB7fVxuXG5jbGFzcyBDaGFuZ2VUb0xhc3RDaGFyYWN0ZXJPZkxpbmUgZXh0ZW5kcyBDaGFuZ2Uge1xuICB0YXJnZXQgPSBcIk1vdmVUb0xhc3RDaGFyYWN0ZXJPZkxpbmVcIlxuXG4gIGV4ZWN1dGUoKSB7XG4gICAgdGhpcy5vbkRpZFNlbGVjdFRhcmdldCgoKSA9PiB7XG4gICAgICBpZiAodGhpcy50YXJnZXQud2lzZSA9PT0gXCJibG9ja3dpc2VcIikge1xuICAgICAgICBmb3IgKGNvbnN0IGJsb2Nrd2lzZVNlbGVjdGlvbiBvZiB0aGlzLmdldEJsb2Nrd2lzZVNlbGVjdGlvbnMoKSkge1xuICAgICAgICAgIGJsb2Nrd2lzZVNlbGVjdGlvbi5leHRlbmRNZW1iZXJTZWxlY3Rpb25zVG9FbmRPZkxpbmUoKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgICBzdXBlci5leGVjdXRlKClcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgQWN0aXZhdGVJbnNlcnRNb2RlQmFzZSxcbiAgQWN0aXZhdGVJbnNlcnRNb2RlLFxuICBBY3RpdmF0ZVJlcGxhY2VNb2RlLFxuICBJbnNlcnRBZnRlcixcbiAgSW5zZXJ0QXRCZWdpbm5pbmdPZkxpbmUsXG4gIEluc2VydEFmdGVyRW5kT2ZMaW5lLFxuICBJbnNlcnRBdEZpcnN0Q2hhcmFjdGVyT2ZMaW5lLFxuICBJbnNlcnRBdExhc3RJbnNlcnQsXG4gIEluc2VydEFib3ZlV2l0aE5ld2xpbmUsXG4gIEluc2VydEJlbG93V2l0aE5ld2xpbmUsXG4gIEluc2VydEJ5VGFyZ2V0LFxuICBJbnNlcnRBdFN0YXJ0T2ZUYXJnZXQsXG4gIEluc2VydEF0RW5kT2ZUYXJnZXQsXG4gIEluc2VydEF0SGVhZE9mVGFyZ2V0LFxuICBJbnNlcnRBdFN0YXJ0T2ZPY2N1cnJlbmNlLFxuICBJbnNlcnRBdEVuZE9mT2NjdXJyZW5jZSxcbiAgSW5zZXJ0QXRIZWFkT2ZPY2N1cnJlbmNlLFxuICBJbnNlcnRBdFN0YXJ0T2ZTdWJ3b3JkT2NjdXJyZW5jZSxcbiAgSW5zZXJ0QXRFbmRPZlN1YndvcmRPY2N1cnJlbmNlLFxuICBJbnNlcnRBdEhlYWRPZlN1YndvcmRPY2N1cnJlbmNlLFxuICBJbnNlcnRBdFN0YXJ0T2ZTbWFydFdvcmQsXG4gIEluc2VydEF0RW5kT2ZTbWFydFdvcmQsXG4gIEluc2VydEF0UHJldmlvdXNGb2xkU3RhcnQsXG4gIEluc2VydEF0TmV4dEZvbGRTdGFydCxcbiAgQ2hhbmdlLFxuICBDaGFuZ2VPY2N1cnJlbmNlLFxuICBTdWJzdGl0dXRlLFxuICBTdWJzdGl0dXRlTGluZSxcbiAgQ2hhbmdlTGluZSxcbiAgQ2hhbmdlVG9MYXN0Q2hhcmFjdGVyT2ZMaW5lLFxufVxuIl19