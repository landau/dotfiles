"use babel";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

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
            var insertionCount = _this.supportInsertionCount ? _this.utils.limitNumber(_this.getCount(-1), { max: 100 }) : 0;

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL29wZXJhdG9yLWluc2VydC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxXQUFXLENBQUE7Ozs7Ozs7Ozs7ZUFFSyxPQUFPLENBQUMsTUFBTSxDQUFDOztJQUF4QixLQUFLLFlBQUwsS0FBSzs7QUFDWixJQUFNLFFBQVEsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFBOzs7Ozs7O0lBTWpELHNCQUFzQjtZQUF0QixzQkFBc0I7O1dBQXRCLHNCQUFzQjswQkFBdEIsc0JBQXNCOzsrQkFBdEIsc0JBQXNCOztTQUUxQixXQUFXLEdBQUcsS0FBSztTQUNuQixxQkFBcUIsR0FBRyxJQUFJOzs7ZUFIeEIsc0JBQXNCOzs7Ozs7Ozs7OztXQWFGLGtDQUFDLE9BQU8sRUFBRTtBQUNoQyxVQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUMsT0FBTyxDQUFDLENBQUE7QUFDcEQsYUFBTyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyx5QkFBeUIsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtLQUNuRTs7Ozs7Ozs7O1dBT2UsMEJBQUMsU0FBUyxFQUFFO0FBQzFCLFVBQUksWUFBWSxZQUFBLENBQUE7QUFDaEIsVUFBSSxJQUFJLENBQUMsVUFBVSxJQUFJLElBQUksRUFBRTswQkFDb0IsSUFBSSxDQUFDLFVBQVU7WUFBdkQsS0FBSyxlQUFMLEtBQUs7WUFBRSxTQUFTLGVBQVQsU0FBUztZQUFFLFNBQVMsZUFBVCxTQUFTO1lBQUUsT0FBTyxlQUFQLE9BQU87O0FBQzNDLFlBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLEVBQUU7QUFDdkIsY0FBTSx3QkFBd0IsR0FBRyxLQUFLLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFBO0FBQzVGLGNB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QixvQkFBb0I7QUFDcEIsMkJBQXlCLEVBQXpCLHlCQUF5QjtBQUN6Qix5QkFBdUIsRUFBdkIsdUJBQXVCO0FBQ3ZCLDBCQUF3QixFQUF4Qix3QkFBd0I7QUFDeEIsa0NBQWdDLEVBQWhDLGdDQUFnQztBQUNoQyxnQ0FBOEIsRUFBOUIsOEJBQThCO0FBQzlCLGlDQUErQixFQUEvQiwrQkFBK0I7QUFDL0IsMEJBQXdCLEVBQXhCLHdCQUF3QjtBQUN4Qix3QkFBc0IsRUFBdEIsc0JBQXNCO0FBQ3RCLDJCQUF5QixFQUF6Qix5QkFBeUI7QUFDekIsdUJBQXFCLEVBQXJCLHFCQUFxQjtBQUNyQixRQUFNLEVBQU4sTUFBTTtBQUNOLGtCQUFnQixFQUFoQixnQkFBZ0I7QUFDaEIsWUFBVSxFQUFWLFVBQVU7QUFDVixnQkFBYyxFQUFkLGNBQWM7QUFDZCxZQUFVLEVBQVYsVUFBVTtBQUNWLDZCQUEyQixFQUEzQiwyQkFBMkI7Q0FDNUIsQ0FBQSIsImZpbGUiOiIvVXNlcnMvdGxhbmRhdS9kb3RmaWxlcy8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi9vcGVyYXRvci1pbnNlcnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBiYWJlbFwiXG5cbmNvbnN0IHtSYW5nZX0gPSByZXF1aXJlKFwiYXRvbVwiKVxuY29uc3QgT3BlcmF0b3IgPSByZXF1aXJlKFwiLi9iYXNlXCIpLmdldENsYXNzKFwiT3BlcmF0b3JcIilcblxuLy8gT3BlcmF0b3Igd2hpY2ggc3RhcnQgJ2luc2VydC1tb2RlJ1xuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gW05PVEVdXG4vLyBSdWxlOiBEb24ndCBtYWtlIGFueSB0ZXh0IG11dGF0aW9uIGJlZm9yZSBjYWxsaW5nIGBAc2VsZWN0VGFyZ2V0KClgLlxuY2xhc3MgQWN0aXZhdGVJbnNlcnRNb2RlQmFzZSBleHRlbmRzIE9wZXJhdG9yIHtcbiAgc3RhdGljIGNvbW1hbmQgPSBmYWxzZVxuICBmbGFzaFRhcmdldCA9IGZhbHNlXG4gIHN1cHBvcnRJbnNlcnRpb25Db3VudCA9IHRydWVcblxuICAvLyBXaGVuIGVhY2ggbXV0YWlvbidzIGV4dGVudCBpcyBub3QgaW50ZXJzZWN0aW5nLCBtdWl0aXBsZSBjaGFuZ2VzIGFyZSByZWNvcmRlZFxuICAvLyBlLmdcbiAgLy8gIC0gTXVsdGljdXJzb3JzIGVkaXRcbiAgLy8gIC0gQ3Vyc29yIG1vdmVkIGluIGluc2VydC1tb2RlKGUuZyBjdHJsLWYsIGN0cmwtYilcbiAgLy8gQnV0IEkgZG9uJ3QgY2FyZSBtdWx0aXBsZSBjaGFuZ2VzIGp1c3QgYmVjYXVzZSBJJ20gbGF6eShzbyBub3QgcGVyZmVjdCBpbXBsZW1lbnRhdGlvbikuXG4gIC8vIEkgb25seSB0YWtlIGNhcmUgb2Ygb25lIGNoYW5nZSBoYXBwZW5lZCBhdCBlYXJsaWVzdCh0b3BDdXJzb3IncyBjaGFuZ2UpIHBvc2l0aW9uLlxuICAvLyBUaGF0cycgd2h5IEkgc2F2ZSB0b3BDdXJzb3IncyBwb3NpdGlvbiB0byBAdG9wQ3Vyc29yUG9zaXRpb25BdEluc2VydGlvblN0YXJ0IHRvIGNvbXBhcmUgdHJhdmVyc2FsIHRvIGRlbGV0aW9uU3RhcnRcbiAgLy8gV2h5IEkgdXNlIHRvcEN1cnNvcidzIGNoYW5nZT8gSnVzdCBiZWNhdXNlIGl0J3MgZWFzeSB0byB1c2UgZmlyc3QgY2hhbmdlIHJldHVybmVkIGJ5IGdldENoYW5nZVNpbmNlQ2hlY2twb2ludCgpLlxuICBnZXRDaGFuZ2VTaW5jZUNoZWNrcG9pbnQocHVycG9zZSkge1xuICAgIGNvbnN0IGNoZWNrcG9pbnQgPSB0aGlzLmdldEJ1ZmZlckNoZWNrcG9pbnQocHVycG9zZSlcbiAgICByZXR1cm4gdGhpcy5lZGl0b3IuYnVmZmVyLmdldENoYW5nZXNTaW5jZUNoZWNrcG9pbnQoY2hlY2twb2ludClbMF1cbiAgfVxuXG4gIC8vIFtCVUctQlVULU9LXSBSZXBsYXlpbmcgdGV4dC1kZWxldGlvbi1vcGVyYXRpb24gaXMgbm90IGNvbXBhdGlibGUgdG8gcHVyZSBWaW0uXG4gIC8vIFB1cmUgVmltIHJlY29yZCBhbGwgb3BlcmF0aW9uIGluIGluc2VydC1tb2RlIGFzIGtleXN0cm9rZSBsZXZlbCBhbmQgY2FuIGRpc3Rpbmd1aXNoXG4gIC8vIGNoYXJhY3RlciBkZWxldGVkIGJ5IGBEZWxldGVgIG9yIGJ5IGBjdHJsLXVgLlxuICAvLyBCdXQgSSBjYW4gbm90IGFuZCBkb24ndCB0cnlpbmcgdG8gbWluaWMgdGhpcyBsZXZlbCBvZiBjb21wYXRpYmlsaXR5LlxuICAvLyBTbyBiYXNpY2FsbHkgZGVsZXRpb24tZG9uZS1pbi1vbmUgaXMgZXhwZWN0ZWQgdG8gd29yayB3ZWxsLlxuICByZXBsYXlMYXN0Q2hhbmdlKHNlbGVjdGlvbikge1xuICAgIGxldCB0ZXh0VG9JbnNlcnRcbiAgICBpZiAodGhpcy5sYXN0Q2hhbmdlICE9IG51bGwpIHtcbiAgICAgIGNvbnN0IHtzdGFydCwgbmV3RXh0ZW50LCBvbGRFeHRlbnQsIG5ld1RleHR9ID0gdGhpcy5sYXN0Q2hhbmdlXG4gICAgICBpZiAoIW9sZEV4dGVudC5pc1plcm8oKSkge1xuICAgICAgICBjb25zdCB0cmF2ZXJzYWxUb1N0YXJ0T2ZEZWxldGUgPSBzdGFydC50cmF2ZXJzYWxGcm9tKHRoaXMudG9wQ3Vyc29yUG9zaXRpb25BdEluc2VydGlvblN0YXJ0KVxuICAgICAgICBjb25zdCBkZWxldGlvblN0YXJ0ID0gc2VsZWN0aW9uLmN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpLnRyYXZlcnNlKHRyYXZlcnNhbFRvU3RhcnRPZkRlbGV0ZSlcbiAgICAgICAgY29uc3QgZGVsZXRpb25FbmQgPSBkZWxldGlvblN0YXJ0LnRyYXZlcnNlKG9sZEV4dGVudClcbiAgICAgICAgc2VsZWN0aW9uLnNldEJ1ZmZlclJhbmdlKFtkZWxldGlvblN0YXJ0LCBkZWxldGlvbkVuZF0pXG4gICAgICB9XG4gICAgICB0ZXh0VG9JbnNlcnQgPSBuZXdUZXh0XG4gICAgfSBlbHNlIHtcbiAgICAgIHRleHRUb0luc2VydCA9IFwiXCJcbiAgICB9XG4gICAgc2VsZWN0aW9uLmluc2VydFRleHQodGV4dFRvSW5zZXJ0LCB7YXV0b0luZGVudDogdHJ1ZX0pXG4gIH1cblxuICAvLyBjYWxsZWQgd2hlbiByZXBlYXRlZFxuICAvLyBbRklYTUVdIHRvIHVzZSByZXBsYXlMYXN0Q2hhbmdlIGluIHJlcGVhdEluc2VydCBvdmVycmlkaW5nIHN1YmNsYXNzcy5cbiAgcmVwZWF0SW5zZXJ0KHNlbGVjdGlvbiwgdGV4dCkge1xuICAgIHRoaXMucmVwbGF5TGFzdENoYW5nZShzZWxlY3Rpb24pXG4gIH1cblxuICBleGVjdXRlKCkge1xuICAgIGlmICh0aGlzLnJlcGVhdGVkKSB0aGlzLmZsYXNoVGFyZ2V0ID0gdGhpcy50cmFja0NoYW5nZSA9IHRydWVcblxuICAgIHRoaXMucHJlU2VsZWN0KClcblxuICAgIGlmICh0aGlzLnNlbGVjdFRhcmdldCgpIHx8IHRoaXMudGFyZ2V0Lndpc2UgIT09IFwibGluZXdpc2VcIikge1xuICAgICAgaWYgKHRoaXMubXV0YXRlVGV4dCkgdGhpcy5tdXRhdGVUZXh0KClcblxuICAgICAgaWYgKHRoaXMucmVwZWF0ZWQpIHtcbiAgICAgICAgZm9yIChjb25zdCBzZWxlY3Rpb24gb2YgdGhpcy5lZGl0b3IuZ2V0U2VsZWN0aW9ucygpKSB7XG4gICAgICAgICAgY29uc3QgdGV4dFRvSW5zZXJ0ID0gKHRoaXMubGFzdENoYW5nZSAmJiB0aGlzLmxhc3RDaGFuZ2UubmV3VGV4dCkgfHwgXCJcIlxuICAgICAgICAgIHRoaXMucmVwZWF0SW5zZXJ0KHNlbGVjdGlvbiwgdGV4dFRvSW5zZXJ0KVxuICAgICAgICAgIHRoaXMudXRpbHMubW92ZUN1cnNvckxlZnQoc2VsZWN0aW9uLmN1cnNvcilcbiAgICAgICAgfVxuICAgICAgICB0aGlzLm11dGF0aW9uTWFuYWdlci5zZXRDaGVja3BvaW50KFwiZGlkLWZpbmlzaFwiKVxuICAgICAgICB0aGlzLmdyb3VwQ2hhbmdlc1NpbmNlQnVmZmVyQ2hlY2twb2ludChcInVuZG9cIilcbiAgICAgICAgdGhpcy5lbWl0RGlkRmluaXNoTXV0YXRpb24oKVxuICAgICAgICBpZiAodGhpcy5nZXRDb25maWcoXCJjbGVhck11bHRpcGxlQ3Vyc29yc09uRXNjYXBlSW5zZXJ0TW9kZVwiKSkgdGhpcy52aW1TdGF0ZS5jbGVhclNlbGVjdGlvbnMoKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gQXZvaWQgZnJlZXppbmcgYnkgYWNjY2lkZW50YWwgYmlnIGNvdW50KGUuZy4gYDU1NTU1NTU1NTU1NTVpYCksIFNlZSAjNTYwLCAjNTk2XG4gICAgICAgIGxldCBpbnNlcnRpb25Db3VudCA9IHRoaXMuc3VwcG9ydEluc2VydGlvbkNvdW50ID8gdGhpcy51dGlscy5saW1pdE51bWJlcih0aGlzLmdldENvdW50KC0xKSwge21heDogMTAwfSkgOiAwXG5cbiAgICAgICAgbGV0IHRleHRCeU9wZXJhdG9yID0gXCJcIlxuICAgICAgICBpZiAoaW5zZXJ0aW9uQ291bnQgPiAwKSB7XG4gICAgICAgICAgY29uc3QgY2hhbmdlID0gdGhpcy5nZXRDaGFuZ2VTaW5jZUNoZWNrcG9pbnQoXCJ1bmRvXCIpXG4gICAgICAgICAgdGV4dEJ5T3BlcmF0b3IgPSAoY2hhbmdlICYmIGNoYW5nZS5uZXdUZXh0KSB8fCBcIlwiXG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmNyZWF0ZUJ1ZmZlckNoZWNrcG9pbnQoXCJpbnNlcnRcIilcbiAgICAgICAgY29uc3QgdG9wQ3Vyc29yID0gdGhpcy5lZGl0b3IuZ2V0Q3Vyc29yc09yZGVyZWRCeUJ1ZmZlclBvc2l0aW9uKClbMF1cbiAgICAgICAgdGhpcy50b3BDdXJzb3JQb3NpdGlvbkF0SW5zZXJ0aW9uU3RhcnQgPSB0b3BDdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuXG4gICAgICAgIC8vIFNraXAgbm9ybWFsaXphdGlvbiBvZiBibG9ja3dpc2VTZWxlY3Rpb24uXG4gICAgICAgIC8vIFNpbmNlIHdhbnQgdG8ga2VlcCBtdWx0aS1jdXJzb3IgYW5kIGl0J3MgcG9zaXRpb24gaW4gd2hlbiBzaGlmdCB0byBpbnNlcnQtbW9kZS5cbiAgICAgICAgZm9yIChjb25zdCBibG9ja3dpc2VTZWxlY3Rpb24gb2YgdGhpcy5nZXRCbG9ja3dpc2VTZWxlY3Rpb25zKCkpIHtcbiAgICAgICAgICBibG9ja3dpc2VTZWxlY3Rpb24uc2tpcE5vcm1hbGl6YXRpb24oKVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZGlzcG9zYWJsZSA9IHRoaXMudmltU3RhdGUucHJlZW1wdFdpbGxEZWFjdGl2YXRlTW9kZSgoe21vZGV9KSA9PiB7XG4gICAgICAgICAgaWYgKG1vZGUgIT09IFwiaW5zZXJ0XCIpIHJldHVyblxuICAgICAgICAgIGRpc3Bvc2FibGUuZGlzcG9zZSgpXG5cbiAgICAgICAgICB0aGlzLnZpbVN0YXRlLm1hcmsuc2V0KFwiXlwiLCB0aGlzLmVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpKSAvLyBMYXN0IGluc2VydC1tb2RlIHBvc2l0aW9uXG4gICAgICAgICAgbGV0IHRleHRCeVVzZXJJbnB1dCA9IFwiXCJcbiAgICAgICAgICBjb25zdCBjaGFuZ2UgPSB0aGlzLmdldENoYW5nZVNpbmNlQ2hlY2twb2ludChcImluc2VydFwiKVxuICAgICAgICAgIGlmIChjaGFuZ2UpIHtcbiAgICAgICAgICAgIHRoaXMubGFzdENoYW5nZSA9IGNoYW5nZVxuICAgICAgICAgICAgdGhpcy5zZXRNYXJrRm9yQ2hhbmdlKG5ldyBSYW5nZShjaGFuZ2Uuc3RhcnQsIGNoYW5nZS5zdGFydC50cmF2ZXJzZShjaGFuZ2UubmV3RXh0ZW50KSkpXG4gICAgICAgICAgICB0ZXh0QnlVc2VySW5wdXQgPSBjaGFuZ2UubmV3VGV4dFxuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLnZpbVN0YXRlLnJlZ2lzdGVyLnNldChcIi5cIiwge3RleHQ6IHRleHRCeVVzZXJJbnB1dH0pIC8vIExhc3QgaW5zZXJ0ZWQgdGV4dFxuXG4gICAgICAgICAgd2hpbGUgKGluc2VydGlvbkNvdW50KSB7XG4gICAgICAgICAgICBpbnNlcnRpb25Db3VudC0tXG4gICAgICAgICAgICBmb3IgKGNvbnN0IHNlbGVjdGlvbiBvZiB0aGlzLmVkaXRvci5nZXRTZWxlY3Rpb25zKCkpIHtcbiAgICAgICAgICAgICAgc2VsZWN0aW9uLmluc2VydFRleHQodGV4dEJ5T3BlcmF0b3IgKyB0ZXh0QnlVc2VySW5wdXQsIHthdXRvSW5kZW50OiB0cnVlfSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBUaGlzIGN1cnNvciBzdGF0ZSBpcyByZXN0b3JlZCBvbiB1bmRvLlxuICAgICAgICAgIC8vIFNvIGN1cnNvciBzdGF0ZSBoYXMgdG8gYmUgdXBkYXRlZCBiZWZvcmUgbmV4dCBncm91cENoYW5nZXNTaW5jZUNoZWNrcG9pbnQoKVxuICAgICAgICAgIGlmICh0aGlzLmdldENvbmZpZyhcImNsZWFyTXVsdGlwbGVDdXJzb3JzT25Fc2NhcGVJbnNlcnRNb2RlXCIpKSB0aGlzLnZpbVN0YXRlLmNsZWFyU2VsZWN0aW9ucygpXG5cbiAgICAgICAgICAvLyBncm91cGluZyBjaGFuZ2VzIGZvciB1bmRvIGNoZWNrcG9pbnQgbmVlZCB0byBjb21lIGxhc3RcbiAgICAgICAgICB0aGlzLmdyb3VwQ2hhbmdlc1NpbmNlQnVmZmVyQ2hlY2twb2ludChcInVuZG9cIilcblxuICAgICAgICAgIGNvbnN0IHByZXZlbnRJbmNvcnJlY3RXcmFwID0gdGhpcy5lZGl0b3IuaGFzQXRvbWljU29mdFRhYnMoKVxuICAgICAgICAgIGZvciAoY29uc3QgY3Vyc29yIG9mIHRoaXMuZWRpdG9yLmdldEN1cnNvcnMoKSkge1xuICAgICAgICAgICAgdGhpcy51dGlscy5tb3ZlQ3Vyc29yTGVmdChjdXJzb3IsIHtwcmV2ZW50SW5jb3JyZWN0V3JhcH0pXG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgICBjb25zdCBzdWJtb2RlID0gdGhpcy5uYW1lID09PSBcIkFjdGl2YXRlUmVwbGFjZU1vZGVcIiA/IFwicmVwbGFjZVwiIDogdW5kZWZpbmVkXG4gICAgICAgIHRoaXMuYWN0aXZhdGVNb2RlKFwiaW5zZXJ0XCIsIHN1Ym1vZGUpXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuYWN0aXZhdGVNb2RlKFwibm9ybWFsXCIpXG4gICAgfVxuICB9XG59XG5cbmNsYXNzIEFjdGl2YXRlSW5zZXJ0TW9kZSBleHRlbmRzIEFjdGl2YXRlSW5zZXJ0TW9kZUJhc2Uge1xuICB0YXJnZXQgPSBcIkVtcHR5XCJcbiAgYWNjZXB0UHJlc2V0T2NjdXJyZW5jZSA9IGZhbHNlXG4gIGFjY2VwdFBlcnNpc3RlbnRTZWxlY3Rpb24gPSBmYWxzZVxufVxuXG5jbGFzcyBBY3RpdmF0ZVJlcGxhY2VNb2RlIGV4dGVuZHMgQWN0aXZhdGVJbnNlcnRNb2RlIHtcbiAgaW5pdGlhbGl6ZSgpIHtcbiAgICBjb25zdCByZXBsYWNlZENoYXJzQnlTZWxlY3Rpb24gPSBuZXcgV2Vha01hcCgpXG5cbiAgICBjb25zdCBvbldpbGxJbnNlcnREaXNwb3NhYmxlID0gdGhpcy5lZGl0b3Iub25XaWxsSW5zZXJ0VGV4dCgoe3RleHQgPSBcIlwiLCBjYW5jZWx9KSA9PiB7XG4gICAgICBjYW5jZWwoKVxuICAgICAgZm9yIChjb25zdCBzZWxlY3Rpb24gb2YgdGhpcy5lZGl0b3IuZ2V0U2VsZWN0aW9ucygpKSB7XG4gICAgICAgIGZvciAoY29uc3QgY2hhciBvZiB0ZXh0LnNwbGl0KFwiXCIpKSB7XG4gICAgICAgICAgaWYgKGNoYXIgIT09IFwiXFxuXCIgJiYgIXNlbGVjdGlvbi5jdXJzb3IuaXNBdEVuZE9mTGluZSgpKSBzZWxlY3Rpb24uc2VsZWN0UmlnaHQoKVxuICAgICAgICAgIGlmICghcmVwbGFjZWRDaGFyc0J5U2VsZWN0aW9uLmhhcyhzZWxlY3Rpb24pKSByZXBsYWNlZENoYXJzQnlTZWxlY3Rpb24uc2V0KHNlbGVjdGlvbiwgW10pXG4gICAgICAgICAgcmVwbGFjZWRDaGFyc0J5U2VsZWN0aW9uLmdldChzZWxlY3Rpb24pLnB1c2goc2VsZWN0aW9uLmdldFRleHQoKSlcbiAgICAgICAgICBzZWxlY3Rpb24uaW5zZXJ0VGV4dChjaGFyKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcblxuICAgIGNvbnN0IG92ZXJyaWRlQ29yZUJhY2tTcGFjZURpc3Bvc2FibGUgPSBhdG9tLmNvbW1hbmRzLmFkZCh0aGlzLmVkaXRvckVsZW1lbnQsIFwiY29yZTpiYWNrc3BhY2VcIiwgZXZlbnQgPT4ge1xuICAgICAgZXZlbnQuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKClcbiAgICAgIGZvciAoY29uc3Qgc2VsZWN0aW9uIG9mIHRoaXMuZWRpdG9yLmdldFNlbGVjdGlvbnMoKSkge1xuICAgICAgICBjb25zdCBjaGFycyA9IHJlcGxhY2VkQ2hhcnNCeVNlbGVjdGlvbi5nZXQoc2VsZWN0aW9uKVxuICAgICAgICBpZiAoY2hhcnMgJiYgY2hhcnMubGVuZ3RoKSB7XG4gICAgICAgICAgc2VsZWN0aW9uLnNlbGVjdExlZnQoKVxuICAgICAgICAgIGlmICghc2VsZWN0aW9uLmluc2VydFRleHQoY2hhcnMucG9wKCkpLmlzRW1wdHkoKSkgc2VsZWN0aW9uLmN1cnNvci5tb3ZlTGVmdCgpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuXG4gICAgY29uc3QgZGlzcG9zYWJsZSA9IHRoaXMudmltU3RhdGUucHJlZW1wdFdpbGxEZWFjdGl2YXRlTW9kZSgoe21vZGV9KSA9PiB7XG4gICAgICBpZiAobW9kZSAhPT0gXCJpbnNlcnRcIikgcmV0dXJuXG4gICAgICBkaXNwb3NhYmxlLmRpc3Bvc2UoKVxuICAgICAgb25XaWxsSW5zZXJ0RGlzcG9zYWJsZS5kaXNwb3NlKClcbiAgICAgIG92ZXJyaWRlQ29yZUJhY2tTcGFjZURpc3Bvc2FibGUuZGlzcG9zZSgpXG4gICAgfSlcblxuICAgIHN1cGVyLmluaXRpYWxpemUoKVxuICB9XG5cbiAgcmVwZWF0SW5zZXJ0KHNlbGVjdGlvbiwgdGV4dCkge1xuICAgIGZvciAoY29uc3QgY2hhciBvZiB0ZXh0KSB7XG4gICAgICBpZiAoY2hhciA9PT0gXCJcXG5cIikgY29udGludWVcbiAgICAgIGlmIChzZWxlY3Rpb24uY3Vyc29yLmlzQXRFbmRPZkxpbmUoKSkgYnJlYWtcbiAgICAgIHNlbGVjdGlvbi5zZWxlY3RSaWdodCgpXG4gICAgfVxuICAgIHNlbGVjdGlvbi5pbnNlcnRUZXh0KHRleHQsIHthdXRvSW5kZW50OiBmYWxzZX0pXG4gIH1cbn1cblxuY2xhc3MgSW5zZXJ0QWZ0ZXIgZXh0ZW5kcyBBY3RpdmF0ZUluc2VydE1vZGUge1xuICBleGVjdXRlKCkge1xuICAgIGZvciAoY29uc3QgY3Vyc29yIG9mIHRoaXMuZWRpdG9yLmdldEN1cnNvcnMoKSkge1xuICAgICAgdGhpcy51dGlscy5tb3ZlQ3Vyc29yUmlnaHQoY3Vyc29yKVxuICAgIH1cbiAgICBzdXBlci5leGVjdXRlKClcbiAgfVxufVxuXG4vLyBrZXk6ICdnIEknIGluIGFsbCBtb2RlXG5jbGFzcyBJbnNlcnRBdEJlZ2lubmluZ09mTGluZSBleHRlbmRzIEFjdGl2YXRlSW5zZXJ0TW9kZSB7XG4gIGV4ZWN1dGUoKSB7XG4gICAgaWYgKHRoaXMubW9kZSA9PT0gXCJ2aXN1YWxcIiAmJiB0aGlzLnN1Ym1vZGUgIT09IFwiYmxvY2t3aXNlXCIpIHtcbiAgICAgIHRoaXMuZWRpdG9yLnNwbGl0U2VsZWN0aW9uc0ludG9MaW5lcygpXG4gICAgfVxuICAgIGZvciAoY29uc3QgYmxvY2t3aXNlU2VsZWN0aW9uIG9mIHRoaXMuZ2V0QmxvY2t3aXNlU2VsZWN0aW9ucygpKSB7XG4gICAgICBibG9ja3dpc2VTZWxlY3Rpb24uc2tpcE5vcm1hbGl6YXRpb24oKVxuICAgIH1cbiAgICB0aGlzLmVkaXRvci5tb3ZlVG9CZWdpbm5pbmdPZkxpbmUoKVxuICAgIHN1cGVyLmV4ZWN1dGUoKVxuICB9XG59XG5cbi8vIGtleTogbm9ybWFsICdBJ1xuY2xhc3MgSW5zZXJ0QWZ0ZXJFbmRPZkxpbmUgZXh0ZW5kcyBBY3RpdmF0ZUluc2VydE1vZGUge1xuICBleGVjdXRlKCkge1xuICAgIHRoaXMuZWRpdG9yLm1vdmVUb0VuZE9mTGluZSgpXG4gICAgc3VwZXIuZXhlY3V0ZSgpXG4gIH1cbn1cblxuLy8ga2V5OiBub3JtYWwgJ0knXG5jbGFzcyBJbnNlcnRBdEZpcnN0Q2hhcmFjdGVyT2ZMaW5lIGV4dGVuZHMgQWN0aXZhdGVJbnNlcnRNb2RlIHtcbiAgZXhlY3V0ZSgpIHtcbiAgICBmb3IgKGNvbnN0IGN1cnNvciBvZiB0aGlzLmVkaXRvci5nZXRDdXJzb3JzKCkpIHtcbiAgICAgIHRoaXMudXRpbHMubW92ZUN1cnNvclRvRmlyc3RDaGFyYWN0ZXJBdFJvdyhjdXJzb3IsIGN1cnNvci5nZXRCdWZmZXJSb3coKSlcbiAgICB9XG4gICAgc3VwZXIuZXhlY3V0ZSgpXG4gIH1cbn1cblxuY2xhc3MgSW5zZXJ0QXRMYXN0SW5zZXJ0IGV4dGVuZHMgQWN0aXZhdGVJbnNlcnRNb2RlIHtcbiAgZXhlY3V0ZSgpIHtcbiAgICBjb25zdCBwb2ludCA9IHRoaXMudmltU3RhdGUubWFyay5nZXQoXCJeXCIpXG4gICAgaWYgKHBvaW50KSB7XG4gICAgICB0aGlzLmVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihwb2ludClcbiAgICAgIHRoaXMuZWRpdG9yLnNjcm9sbFRvQ3Vyc29yUG9zaXRpb24oe2NlbnRlcjogdHJ1ZX0pXG4gICAgfVxuICAgIHN1cGVyLmV4ZWN1dGUoKVxuICB9XG59XG5cbmNsYXNzIEluc2VydEFib3ZlV2l0aE5ld2xpbmUgZXh0ZW5kcyBBY3RpdmF0ZUluc2VydE1vZGUge1xuICBpbml0aWFsaXplKCkge1xuICAgIHRoaXMub3JpZ2luYWxDdXJzb3JQb3NpdGlvbk1hcmtlciA9IHRoaXMuZWRpdG9yLm1hcmtCdWZmZXJQb3NpdGlvbih0aGlzLmVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpKVxuICAgIHN1cGVyLmluaXRpYWxpemUoKVxuICB9XG5cbiAgLy8gVGhpcyBpcyBmb3IgYG9gIGFuZCBgT2Agb3BlcmF0b3IuXG4gIC8vIE9uIHVuZG8vcmVkbyBwdXQgY3Vyc29yIGF0IG9yaWdpbmFsIHBvaW50IHdoZXJlIHVzZXIgdHlwZSBgb2Agb3IgYE9gLlxuICBncm91cENoYW5nZXNTaW5jZUJ1ZmZlckNoZWNrcG9pbnQocHVycG9zZSkge1xuICAgIGlmICh0aGlzLnJlcGVhdGVkKSB7XG4gICAgICBzdXBlci5ncm91cENoYW5nZXNTaW5jZUJ1ZmZlckNoZWNrcG9pbnQocHVycG9zZSlcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGNvbnN0IGxhc3RDdXJzb3IgPSB0aGlzLmVkaXRvci5nZXRMYXN0Q3Vyc29yKClcbiAgICBjb25zdCBjdXJzb3JQb3NpdGlvbiA9IGxhc3RDdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuICAgIGxhc3RDdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24odGhpcy5vcmlnaW5hbEN1cnNvclBvc2l0aW9uTWFya2VyLmdldEhlYWRCdWZmZXJQb3NpdGlvbigpKVxuICAgIHRoaXMub3JpZ2luYWxDdXJzb3JQb3NpdGlvbk1hcmtlci5kZXN0cm95KClcbiAgICB0aGlzLm9yaWdpbmFsQ3Vyc29yUG9zaXRpb25NYXJrZXIgPSBudWxsXG5cbiAgICBpZiAodGhpcy5nZXRDb25maWcoXCJncm91cENoYW5nZXNXaGVuTGVhdmluZ0luc2VydE1vZGVcIikpIHtcbiAgICAgIHN1cGVyLmdyb3VwQ2hhbmdlc1NpbmNlQnVmZmVyQ2hlY2twb2ludChwdXJwb3NlKVxuICAgIH1cbiAgICBsYXN0Q3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKGN1cnNvclBvc2l0aW9uKVxuICB9XG5cbiAgYXV0b0luZGVudEVtcHR5Um93cygpIHtcbiAgICBmb3IgKGNvbnN0IGN1cnNvciBvZiB0aGlzLmVkaXRvci5nZXRDdXJzb3JzKCkpIHtcbiAgICAgIGNvbnN0IHJvdyA9IGN1cnNvci5nZXRCdWZmZXJSb3coKVxuICAgICAgaWYgKHRoaXMuaXNFbXB0eVJvdyhyb3cpKSB0aGlzLmVkaXRvci5hdXRvSW5kZW50QnVmZmVyUm93KHJvdylcbiAgICB9XG4gIH1cblxuICBtdXRhdGVUZXh0KCkge1xuICAgIHRoaXMuZWRpdG9yLmluc2VydE5ld2xpbmVBYm92ZSgpXG4gICAgaWYgKHRoaXMuZWRpdG9yLmF1dG9JbmRlbnQpIHRoaXMuYXV0b0luZGVudEVtcHR5Um93cygpXG4gIH1cblxuICByZXBlYXRJbnNlcnQoc2VsZWN0aW9uLCB0ZXh0KSB7XG4gICAgc2VsZWN0aW9uLmluc2VydFRleHQodGV4dC50cmltTGVmdCgpLCB7YXV0b0luZGVudDogdHJ1ZX0pXG4gIH1cbn1cblxuY2xhc3MgSW5zZXJ0QmVsb3dXaXRoTmV3bGluZSBleHRlbmRzIEluc2VydEFib3ZlV2l0aE5ld2xpbmUge1xuICBtdXRhdGVUZXh0KCkge1xuICAgIGZvciAoY29uc3QgY3Vyc29yIG9mIHRoaXMuZWRpdG9yLmdldEN1cnNvcnMoKSkge1xuICAgICAgdGhpcy51dGlscy5zZXRCdWZmZXJSb3coY3Vyc29yLCB0aGlzLmdldEZvbGRFbmRSb3dGb3JSb3coY3Vyc29yLmdldEJ1ZmZlclJvdygpKSlcbiAgICB9XG5cbiAgICB0aGlzLmVkaXRvci5pbnNlcnROZXdsaW5lQmVsb3coKVxuICAgIGlmICh0aGlzLmVkaXRvci5hdXRvSW5kZW50KSB0aGlzLmF1dG9JbmRlbnRFbXB0eVJvd3MoKVxuICB9XG59XG5cbi8vIEFkdmFuY2VkIEluc2VydGlvblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgSW5zZXJ0QnlUYXJnZXQgZXh0ZW5kcyBBY3RpdmF0ZUluc2VydE1vZGVCYXNlIHtcbiAgc3RhdGljIGNvbW1hbmQgPSBmYWxzZVxuICB3aGljaCA9IG51bGwgLy8gb25lIG9mIFsnc3RhcnQnLCAnZW5kJywgJ2hlYWQnLCAndGFpbCddXG5cbiAgaW5pdGlhbGl6ZSgpIHtcbiAgICAvLyBIQUNLXG4gICAgLy8gV2hlbiBnIGkgaXMgbWFwcGVkIHRvIGBpbnNlcnQtYXQtc3RhcnQtb2YtdGFyZ2V0YC5cbiAgICAvLyBgZyBpIDMgbGAgc3RhcnQgaW5zZXJ0IGF0IDMgY29sdW1uIHJpZ2h0IHBvc2l0aW9uLlxuICAgIC8vIEluIHRoaXMgY2FzZSwgd2UgZG9uJ3Qgd2FudCByZXBlYXQgaW5zZXJ0aW9uIDMgdGltZXMuXG4gICAgLy8gVGhpcyBAZ2V0Q291bnQoKSBjYWxsIGNhY2hlIG51bWJlciBhdCB0aGUgdGltaW5nIEJFRk9SRSAnMycgaXMgc3BlY2lmaWVkLlxuICAgIHRoaXMuZ2V0Q291bnQoKVxuICAgIHN1cGVyLmluaXRpYWxpemUoKVxuICB9XG5cbiAgZXhlY3V0ZSgpIHtcbiAgICB0aGlzLm9uRGlkU2VsZWN0VGFyZ2V0KCgpID0+IHtcbiAgICAgIC8vIEluIHZDL3ZMLCB3aGVuIG9jY3VycmVuY2UgbWFya2VyIHdhcyBOT1Qgc2VsZWN0ZWQsXG4gICAgICAvLyBpdCBiZWhhdmUncyB2ZXJ5IHNwZWNpYWxseVxuICAgICAgLy8gdkM6IGBJYCBhbmQgYEFgIGJlaGF2ZXMgYXMgc2hvZnQgaGFuZCBvZiBgY3RybC12IElgIGFuZCBgY3RybC12IEFgLlxuICAgICAgLy8gdkw6IGBJYCBhbmQgYEFgIHBsYWNlIGN1cnNvcnMgYXQgZWFjaCBzZWxlY3RlZCBsaW5lcyBvZiBzdGFydCggb3IgZW5kICkgb2Ygbm9uLXdoaXRlLXNwYWNlIGNoYXIuXG4gICAgICBpZiAoIXRoaXMub2NjdXJyZW5jZVNlbGVjdGVkICYmIHRoaXMubW9kZSA9PT0gXCJ2aXN1YWxcIiAmJiB0aGlzLnN1Ym1vZGUgIT09IFwiYmxvY2t3aXNlXCIpIHtcbiAgICAgICAgZm9yIChjb25zdCAkc2VsZWN0aW9uIG9mIHRoaXMuc3dyYXAuZ2V0U2VsZWN0aW9ucyh0aGlzLmVkaXRvcikpIHtcbiAgICAgICAgICAkc2VsZWN0aW9uLm5vcm1hbGl6ZSgpXG4gICAgICAgICAgJHNlbGVjdGlvbi5hcHBseVdpc2UoXCJibG9ja3dpc2VcIilcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLnN1Ym1vZGUgPT09IFwibGluZXdpc2VcIikge1xuICAgICAgICAgIGZvciAoY29uc3QgYmxvY2t3aXNlU2VsZWN0aW9uIG9mIHRoaXMuZ2V0QmxvY2t3aXNlU2VsZWN0aW9ucygpKSB7XG4gICAgICAgICAgICBibG9ja3dpc2VTZWxlY3Rpb24uZXhwYW5kTWVtYmVyU2VsZWN0aW9uc092ZXJMaW5lV2l0aFRyaW1SYW5nZSgpXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGZvciAoY29uc3QgJHNlbGVjdGlvbiBvZiB0aGlzLnN3cmFwLmdldFNlbGVjdGlvbnModGhpcy5lZGl0b3IpKSB7XG4gICAgICAgICRzZWxlY3Rpb24uc2V0QnVmZmVyUG9zaXRpb25Ubyh0aGlzLndoaWNoKVxuICAgICAgfVxuICAgIH0pXG4gICAgc3VwZXIuZXhlY3V0ZSgpXG4gIH1cbn1cblxuLy8ga2V5OiAnSScsIFVzZWQgaW4gJ3Zpc3VhbC1tb2RlLmNoYXJhY3Rlcndpc2UnLCB2aXN1YWwtbW9kZS5ibG9ja3dpc2VcbmNsYXNzIEluc2VydEF0U3RhcnRPZlRhcmdldCBleHRlbmRzIEluc2VydEJ5VGFyZ2V0IHtcbiAgd2hpY2ggPSBcInN0YXJ0XCJcbn1cblxuLy8ga2V5OiAnQScsIFVzZWQgaW4gJ3Zpc3VhbC1tb2RlLmNoYXJhY3Rlcndpc2UnLCAndmlzdWFsLW1vZGUuYmxvY2t3aXNlJ1xuY2xhc3MgSW5zZXJ0QXRFbmRPZlRhcmdldCBleHRlbmRzIEluc2VydEJ5VGFyZ2V0IHtcbiAgd2hpY2ggPSBcImVuZFwiXG59XG5cbmNsYXNzIEluc2VydEF0SGVhZE9mVGFyZ2V0IGV4dGVuZHMgSW5zZXJ0QnlUYXJnZXQge1xuICB3aGljaCA9IFwiaGVhZFwiXG59XG5cbmNsYXNzIEluc2VydEF0U3RhcnRPZk9jY3VycmVuY2UgZXh0ZW5kcyBJbnNlcnRBdFN0YXJ0T2ZUYXJnZXQge1xuICBvY2N1cnJlbmNlID0gdHJ1ZVxufVxuXG5jbGFzcyBJbnNlcnRBdEVuZE9mT2NjdXJyZW5jZSBleHRlbmRzIEluc2VydEF0RW5kT2ZUYXJnZXQge1xuICBvY2N1cnJlbmNlID0gdHJ1ZVxufVxuXG5jbGFzcyBJbnNlcnRBdEhlYWRPZk9jY3VycmVuY2UgZXh0ZW5kcyBJbnNlcnRBdEhlYWRPZlRhcmdldCB7XG4gIG9jY3VycmVuY2UgPSB0cnVlXG59XG5cbmNsYXNzIEluc2VydEF0U3RhcnRPZlN1YndvcmRPY2N1cnJlbmNlIGV4dGVuZHMgSW5zZXJ0QXRTdGFydE9mT2NjdXJyZW5jZSB7XG4gIG9jY3VycmVuY2VUeXBlID0gXCJzdWJ3b3JkXCJcbn1cblxuY2xhc3MgSW5zZXJ0QXRFbmRPZlN1YndvcmRPY2N1cnJlbmNlIGV4dGVuZHMgSW5zZXJ0QXRFbmRPZk9jY3VycmVuY2Uge1xuICBvY2N1cnJlbmNlVHlwZSA9IFwic3Vid29yZFwiXG59XG5cbmNsYXNzIEluc2VydEF0SGVhZE9mU3Vid29yZE9jY3VycmVuY2UgZXh0ZW5kcyBJbnNlcnRBdEhlYWRPZk9jY3VycmVuY2Uge1xuICBvY2N1cnJlbmNlVHlwZSA9IFwic3Vid29yZFwiXG59XG5cbmNsYXNzIEluc2VydEF0U3RhcnRPZlNtYXJ0V29yZCBleHRlbmRzIEluc2VydEJ5VGFyZ2V0IHtcbiAgd2hpY2ggPSBcInN0YXJ0XCJcbiAgdGFyZ2V0ID0gXCJNb3ZlVG9QcmV2aW91c1NtYXJ0V29yZFwiXG59XG5cbmNsYXNzIEluc2VydEF0RW5kT2ZTbWFydFdvcmQgZXh0ZW5kcyBJbnNlcnRCeVRhcmdldCB7XG4gIHdoaWNoID0gXCJlbmRcIlxuICB0YXJnZXQgPSBcIk1vdmVUb0VuZE9mU21hcnRXb3JkXCJcbn1cblxuY2xhc3MgSW5zZXJ0QXRQcmV2aW91c0ZvbGRTdGFydCBleHRlbmRzIEluc2VydEJ5VGFyZ2V0IHtcbiAgd2hpY2ggPSBcInN0YXJ0XCJcbiAgdGFyZ2V0ID0gXCJNb3ZlVG9QcmV2aW91c0ZvbGRTdGFydFwiXG59XG5cbmNsYXNzIEluc2VydEF0TmV4dEZvbGRTdGFydCBleHRlbmRzIEluc2VydEJ5VGFyZ2V0IHtcbiAgd2hpY2ggPSBcImVuZFwiXG4gIHRhcmdldCA9IFwiTW92ZVRvTmV4dEZvbGRTdGFydFwiXG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIENoYW5nZSBleHRlbmRzIEFjdGl2YXRlSW5zZXJ0TW9kZUJhc2Uge1xuICB0cmFja0NoYW5nZSA9IHRydWVcbiAgc3VwcG9ydEluc2VydGlvbkNvdW50ID0gZmFsc2VcblxuICBtdXRhdGVUZXh0KCkge1xuICAgIC8vIEFsbHdheXMgZHluYW1pY2FsbHkgZGV0ZXJtaW5lIHNlbGVjdGlvbiB3aXNlIHd0aG91dCBjb25zdWx0aW5nIHRhcmdldC53aXNlXG4gICAgLy8gUmVhc29uOiB3aGVuIGBjIGkge2AsIHdpc2UgaXMgJ2NoYXJhY3Rlcndpc2UnLCBidXQgYWN0dWFsbHkgc2VsZWN0ZWQgcmFuZ2UgaXMgJ2xpbmV3aXNlJ1xuICAgIC8vICAge1xuICAgIC8vICAgICBhXG4gICAgLy8gICB9XG4gICAgY29uc3QgaXNMaW5ld2lzZVRhcmdldCA9IHRoaXMuc3dyYXAuZGV0ZWN0V2lzZSh0aGlzLmVkaXRvcikgPT09IFwibGluZXdpc2VcIlxuICAgIGZvciAoY29uc3Qgc2VsZWN0aW9uIG9mIHRoaXMuZWRpdG9yLmdldFNlbGVjdGlvbnMoKSkge1xuICAgICAgaWYgKCF0aGlzLmdldENvbmZpZyhcImRvbnRVcGRhdGVSZWdpc3Rlck9uQ2hhbmdlT3JTdWJzdGl0dXRlXCIpKSB7XG4gICAgICAgIHRoaXMuc2V0VGV4dFRvUmVnaXN0ZXJGb3JTZWxlY3Rpb24oc2VsZWN0aW9uKVxuICAgICAgfVxuICAgICAgaWYgKGlzTGluZXdpc2VUYXJnZXQpIHtcbiAgICAgICAgc2VsZWN0aW9uLmluc2VydFRleHQoXCJcXG5cIiwge2F1dG9JbmRlbnQ6IHRydWV9KVxuICAgICAgICAvLyBzZWxlY3Rpb24uaW5zZXJ0VGV4dChcIlwiLCB7YXV0b0luZGVudDogdHJ1ZX0pXG4gICAgICAgIHNlbGVjdGlvbi5jdXJzb3IubW92ZUxlZnQoKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2VsZWN0aW9uLmluc2VydFRleHQoXCJcIiwge2F1dG9JbmRlbnQ6IHRydWV9KVxuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5jbGFzcyBDaGFuZ2VPY2N1cnJlbmNlIGV4dGVuZHMgQ2hhbmdlIHtcbiAgb2NjdXJyZW5jZSA9IHRydWVcbn1cblxuY2xhc3MgU3Vic3RpdHV0ZSBleHRlbmRzIENoYW5nZSB7XG4gIHRhcmdldCA9IFwiTW92ZVJpZ2h0XCJcbn1cblxuY2xhc3MgU3Vic3RpdHV0ZUxpbmUgZXh0ZW5kcyBDaGFuZ2Uge1xuICB3aXNlID0gXCJsaW5ld2lzZVwiIC8vIFtGSVhNRV0gdG8gcmUtb3ZlcnJpZGUgdGFyZ2V0Lndpc2UgaW4gdmlzdWFsLW1vZGVcbiAgdGFyZ2V0ID0gXCJNb3ZlVG9SZWxhdGl2ZUxpbmVcIlxufVxuXG4vLyBhbGlhc1xuY2xhc3MgQ2hhbmdlTGluZSBleHRlbmRzIFN1YnN0aXR1dGVMaW5lIHt9XG5cbmNsYXNzIENoYW5nZVRvTGFzdENoYXJhY3Rlck9mTGluZSBleHRlbmRzIENoYW5nZSB7XG4gIHRhcmdldCA9IFwiTW92ZVRvTGFzdENoYXJhY3Rlck9mTGluZVwiXG5cbiAgZXhlY3V0ZSgpIHtcbiAgICB0aGlzLm9uRGlkU2VsZWN0VGFyZ2V0KCgpID0+IHtcbiAgICAgIGlmICh0aGlzLnRhcmdldC53aXNlID09PSBcImJsb2Nrd2lzZVwiKSB7XG4gICAgICAgIGZvciAoY29uc3QgYmxvY2t3aXNlU2VsZWN0aW9uIG9mIHRoaXMuZ2V0QmxvY2t3aXNlU2VsZWN0aW9ucygpKSB7XG4gICAgICAgICAgYmxvY2t3aXNlU2VsZWN0aW9uLmV4dGVuZE1lbWJlclNlbGVjdGlvbnNUb0VuZE9mTGluZSgpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuICAgIHN1cGVyLmV4ZWN1dGUoKVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBBY3RpdmF0ZUluc2VydE1vZGVCYXNlLFxuICBBY3RpdmF0ZUluc2VydE1vZGUsXG4gIEFjdGl2YXRlUmVwbGFjZU1vZGUsXG4gIEluc2VydEFmdGVyLFxuICBJbnNlcnRBdEJlZ2lubmluZ09mTGluZSxcbiAgSW5zZXJ0QWZ0ZXJFbmRPZkxpbmUsXG4gIEluc2VydEF0Rmlyc3RDaGFyYWN0ZXJPZkxpbmUsXG4gIEluc2VydEF0TGFzdEluc2VydCxcbiAgSW5zZXJ0QWJvdmVXaXRoTmV3bGluZSxcbiAgSW5zZXJ0QmVsb3dXaXRoTmV3bGluZSxcbiAgSW5zZXJ0QnlUYXJnZXQsXG4gIEluc2VydEF0U3RhcnRPZlRhcmdldCxcbiAgSW5zZXJ0QXRFbmRPZlRhcmdldCxcbiAgSW5zZXJ0QXRIZWFkT2ZUYXJnZXQsXG4gIEluc2VydEF0U3RhcnRPZk9jY3VycmVuY2UsXG4gIEluc2VydEF0RW5kT2ZPY2N1cnJlbmNlLFxuICBJbnNlcnRBdEhlYWRPZk9jY3VycmVuY2UsXG4gIEluc2VydEF0U3RhcnRPZlN1YndvcmRPY2N1cnJlbmNlLFxuICBJbnNlcnRBdEVuZE9mU3Vid29yZE9jY3VycmVuY2UsXG4gIEluc2VydEF0SGVhZE9mU3Vid29yZE9jY3VycmVuY2UsXG4gIEluc2VydEF0U3RhcnRPZlNtYXJ0V29yZCxcbiAgSW5zZXJ0QXRFbmRPZlNtYXJ0V29yZCxcbiAgSW5zZXJ0QXRQcmV2aW91c0ZvbGRTdGFydCxcbiAgSW5zZXJ0QXROZXh0Rm9sZFN0YXJ0LFxuICBDaGFuZ2UsXG4gIENoYW5nZU9jY3VycmVuY2UsXG4gIFN1YnN0aXR1dGUsXG4gIFN1YnN0aXR1dGVMaW5lLFxuICBDaGFuZ2VMaW5lLFxuICBDaGFuZ2VUb0xhc3RDaGFyYWN0ZXJPZkxpbmUsXG59XG4iXX0=