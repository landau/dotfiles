(function() {
  var Change, Delete, Insert, InsertAboveWithNewline, InsertAfter, InsertAfterEndOfLine, InsertAtBeginningOfLine, InsertBelowWithNewline, Motions, Operator, ReplaceMode, settings, _, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Motions = require('../motions/index');

  _ref = require('./general-operators'), Operator = _ref.Operator, Delete = _ref.Delete;

  _ = require('underscore-plus');

  settings = require('../settings');

  Insert = (function(_super) {
    __extends(Insert, _super);

    function Insert() {
      return Insert.__super__.constructor.apply(this, arguments);
    }

    Insert.prototype.standalone = true;

    Insert.prototype.isComplete = function() {
      return this.standalone || Insert.__super__.isComplete.apply(this, arguments);
    };

    Insert.prototype.confirmChanges = function(changes) {
      if (changes.length > 0) {
        return this.typedText = changes[0].newText;
      } else {
        return this.typedText = "";
      }
    };

    Insert.prototype.execute = function() {
      var cursor, _i, _len, _ref1;
      if (this.typingCompleted) {
        if (!((this.typedText != null) && this.typedText.length > 0)) {
          return;
        }
        this.editor.insertText(this.typedText, {
          normalizeLineEndings: true,
          autoIndent: true
        });
        _ref1 = this.editor.getCursors();
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          cursor = _ref1[_i];
          if (!cursor.isAtBeginningOfLine()) {
            cursor.moveLeft();
          }
        }
      } else {
        this.vimState.activateInsertMode();
        this.typingCompleted = true;
      }
    };

    Insert.prototype.inputOperator = function() {
      return true;
    };

    return Insert;

  })(Operator);

  ReplaceMode = (function(_super) {
    __extends(ReplaceMode, _super);

    function ReplaceMode() {
      return ReplaceMode.__super__.constructor.apply(this, arguments);
    }

    ReplaceMode.prototype.execute = function() {
      if (this.typingCompleted) {
        if (!((this.typedText != null) && this.typedText.length > 0)) {
          return;
        }
        return this.editor.transact((function(_this) {
          return function() {
            var count, cursor, selection, toDelete, _i, _j, _len, _len1, _ref1, _ref2, _results;
            _this.editor.insertText(_this.typedText, {
              normalizeLineEndings: true
            });
            toDelete = _this.typedText.length - _this.countChars('\n', _this.typedText);
            _ref1 = _this.editor.getSelections();
            for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
              selection = _ref1[_i];
              count = toDelete;
              while (count-- && !selection.cursor.isAtEndOfLine()) {
                selection["delete"]();
              }
            }
            _ref2 = _this.editor.getCursors();
            _results = [];
            for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
              cursor = _ref2[_j];
              if (!cursor.isAtBeginningOfLine()) {
                _results.push(cursor.moveLeft());
              } else {
                _results.push(void 0);
              }
            }
            return _results;
          };
        })(this));
      } else {
        this.vimState.activateReplaceMode();
        return this.typingCompleted = true;
      }
    };

    ReplaceMode.prototype.countChars = function(char, string) {
      return string.split(char).length - 1;
    };

    return ReplaceMode;

  })(Insert);

  InsertAfter = (function(_super) {
    __extends(InsertAfter, _super);

    function InsertAfter() {
      return InsertAfter.__super__.constructor.apply(this, arguments);
    }

    InsertAfter.prototype.execute = function() {
      if (!this.editor.getLastCursor().isAtEndOfLine()) {
        this.editor.moveRight();
      }
      return InsertAfter.__super__.execute.apply(this, arguments);
    };

    return InsertAfter;

  })(Insert);

  InsertAfterEndOfLine = (function(_super) {
    __extends(InsertAfterEndOfLine, _super);

    function InsertAfterEndOfLine() {
      return InsertAfterEndOfLine.__super__.constructor.apply(this, arguments);
    }

    InsertAfterEndOfLine.prototype.execute = function() {
      this.editor.moveToEndOfLine();
      return InsertAfterEndOfLine.__super__.execute.apply(this, arguments);
    };

    return InsertAfterEndOfLine;

  })(Insert);

  InsertAtBeginningOfLine = (function(_super) {
    __extends(InsertAtBeginningOfLine, _super);

    function InsertAtBeginningOfLine() {
      return InsertAtBeginningOfLine.__super__.constructor.apply(this, arguments);
    }

    InsertAtBeginningOfLine.prototype.execute = function() {
      this.editor.moveToBeginningOfLine();
      this.editor.moveToFirstCharacterOfLine();
      return InsertAtBeginningOfLine.__super__.execute.apply(this, arguments);
    };

    return InsertAtBeginningOfLine;

  })(Insert);

  InsertAboveWithNewline = (function(_super) {
    __extends(InsertAboveWithNewline, _super);

    function InsertAboveWithNewline() {
      return InsertAboveWithNewline.__super__.constructor.apply(this, arguments);
    }

    InsertAboveWithNewline.prototype.execute = function() {
      if (!this.typingCompleted) {
        this.vimState.setInsertionCheckpoint();
      }
      this.editor.insertNewlineAbove();
      this.editor.getLastCursor().skipLeadingWhitespace();
      if (this.typingCompleted) {
        this.typedText = this.typedText.trimLeft();
        return InsertAboveWithNewline.__super__.execute.apply(this, arguments);
      }
      this.vimState.activateInsertMode();
      return this.typingCompleted = true;
    };

    return InsertAboveWithNewline;

  })(Insert);

  InsertBelowWithNewline = (function(_super) {
    __extends(InsertBelowWithNewline, _super);

    function InsertBelowWithNewline() {
      return InsertBelowWithNewline.__super__.constructor.apply(this, arguments);
    }

    InsertBelowWithNewline.prototype.execute = function() {
      if (!this.typingCompleted) {
        this.vimState.setInsertionCheckpoint();
      }
      this.editor.insertNewlineBelow();
      this.editor.getLastCursor().skipLeadingWhitespace();
      if (this.typingCompleted) {
        this.typedText = this.typedText.trimLeft();
        return InsertBelowWithNewline.__super__.execute.apply(this, arguments);
      }
      this.vimState.activateInsertMode();
      return this.typingCompleted = true;
    };

    return InsertBelowWithNewline;

  })(Insert);

  Change = (function(_super) {
    __extends(Change, _super);

    Change.prototype.standalone = false;

    Change.prototype.register = null;

    function Change(editor, vimState) {
      this.editor = editor;
      this.vimState = vimState;
      this.register = settings.defaultRegister();
    }

    Change.prototype.execute = function(count) {
      var selection, _base, _i, _j, _len, _len1, _ref1, _ref2;
      if (_.contains(this.motion.select(count, {
        excludeWhitespace: true
      }), true)) {
        if (!this.typingCompleted) {
          this.vimState.setInsertionCheckpoint();
        }
        this.setTextRegister(this.register, this.editor.getSelectedText());
        if ((typeof (_base = this.motion).isLinewise === "function" ? _base.isLinewise() : void 0) && !this.typingCompleted) {
          _ref1 = this.editor.getSelections();
          for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
            selection = _ref1[_i];
            if (selection.getBufferRange().end.row === 0) {
              selection.deleteSelectedText();
            } else {
              selection.insertText("\n", {
                autoIndent: true
              });
            }
            selection.cursor.moveLeft();
          }
        } else {
          _ref2 = this.editor.getSelections();
          for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
            selection = _ref2[_j];
            selection.deleteSelectedText();
          }
        }
        if (this.typingCompleted) {
          return Change.__super__.execute.apply(this, arguments);
        }
        this.vimState.activateInsertMode();
        return this.typingCompleted = true;
      } else {
        return this.vimState.activateNormalMode();
      }
    };

    return Change;

  })(Insert);

  module.exports = {
    Insert: Insert,
    InsertAfter: InsertAfter,
    InsertAfterEndOfLine: InsertAfterEndOfLine,
    InsertAtBeginningOfLine: InsertAtBeginningOfLine,
    InsertAboveWithNewline: InsertAboveWithNewline,
    InsertBelowWithNewline: InsertBelowWithNewline,
    ReplaceMode: ReplaceMode,
    Change: Change
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUvbGliL29wZXJhdG9ycy9pbnB1dC5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEscUxBQUE7SUFBQTttU0FBQTs7QUFBQSxFQUFBLE9BQUEsR0FBVSxPQUFBLENBQVEsa0JBQVIsQ0FBVixDQUFBOztBQUFBLEVBQ0EsT0FBcUIsT0FBQSxDQUFRLHFCQUFSLENBQXJCLEVBQUMsZ0JBQUEsUUFBRCxFQUFXLGNBQUEsTUFEWCxDQUFBOztBQUFBLEVBRUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUixDQUZKLENBQUE7O0FBQUEsRUFHQSxRQUFBLEdBQVcsT0FBQSxDQUFRLGFBQVIsQ0FIWCxDQUFBOztBQUFBLEVBU007QUFDSiw2QkFBQSxDQUFBOzs7O0tBQUE7O0FBQUEscUJBQUEsVUFBQSxHQUFZLElBQVosQ0FBQTs7QUFBQSxxQkFFQSxVQUFBLEdBQVksU0FBQSxHQUFBO2FBQUcsSUFBQyxDQUFBLFVBQUQsSUFBZSx3Q0FBQSxTQUFBLEVBQWxCO0lBQUEsQ0FGWixDQUFBOztBQUFBLHFCQUlBLGNBQUEsR0FBZ0IsU0FBQyxPQUFELEdBQUE7QUFDZCxNQUFBLElBQUcsT0FBTyxDQUFDLE1BQVIsR0FBaUIsQ0FBcEI7ZUFDRSxJQUFDLENBQUEsU0FBRCxHQUFhLE9BQVEsQ0FBQSxDQUFBLENBQUUsQ0FBQyxRQUQxQjtPQUFBLE1BQUE7ZUFHRSxJQUFDLENBQUEsU0FBRCxHQUFhLEdBSGY7T0FEYztJQUFBLENBSmhCLENBQUE7O0FBQUEscUJBVUEsT0FBQSxHQUFTLFNBQUEsR0FBQTtBQUNQLFVBQUEsdUJBQUE7QUFBQSxNQUFBLElBQUcsSUFBQyxDQUFBLGVBQUo7QUFDRSxRQUFBLElBQUEsQ0FBQSxDQUFjLHdCQUFBLElBQWdCLElBQUMsQ0FBQSxTQUFTLENBQUMsTUFBWCxHQUFvQixDQUFsRCxDQUFBO0FBQUEsZ0JBQUEsQ0FBQTtTQUFBO0FBQUEsUUFDQSxJQUFDLENBQUEsTUFBTSxDQUFDLFVBQVIsQ0FBbUIsSUFBQyxDQUFBLFNBQXBCLEVBQStCO0FBQUEsVUFBQSxvQkFBQSxFQUFzQixJQUF0QjtBQUFBLFVBQTRCLFVBQUEsRUFBWSxJQUF4QztTQUEvQixDQURBLENBQUE7QUFFQTtBQUFBLGFBQUEsNENBQUE7NkJBQUE7QUFDRSxVQUFBLElBQUEsQ0FBQSxNQUErQixDQUFDLG1CQUFQLENBQUEsQ0FBekI7QUFBQSxZQUFBLE1BQU0sQ0FBQyxRQUFQLENBQUEsQ0FBQSxDQUFBO1dBREY7QUFBQSxTQUhGO09BQUEsTUFBQTtBQU1FLFFBQUEsSUFBQyxDQUFBLFFBQVEsQ0FBQyxrQkFBVixDQUFBLENBQUEsQ0FBQTtBQUFBLFFBQ0EsSUFBQyxDQUFBLGVBQUQsR0FBbUIsSUFEbkIsQ0FORjtPQURPO0lBQUEsQ0FWVCxDQUFBOztBQUFBLHFCQXFCQSxhQUFBLEdBQWUsU0FBQSxHQUFBO2FBQUcsS0FBSDtJQUFBLENBckJmLENBQUE7O2tCQUFBOztLQURtQixTQVRyQixDQUFBOztBQUFBLEVBaUNNO0FBRUosa0NBQUEsQ0FBQTs7OztLQUFBOztBQUFBLDBCQUFBLE9BQUEsR0FBUyxTQUFBLEdBQUE7QUFDUCxNQUFBLElBQUcsSUFBQyxDQUFBLGVBQUo7QUFDRSxRQUFBLElBQUEsQ0FBQSxDQUFjLHdCQUFBLElBQWdCLElBQUMsQ0FBQSxTQUFTLENBQUMsTUFBWCxHQUFvQixDQUFsRCxDQUFBO0FBQUEsZ0JBQUEsQ0FBQTtTQUFBO2VBQ0EsSUFBQyxDQUFBLE1BQU0sQ0FBQyxRQUFSLENBQWlCLENBQUEsU0FBQSxLQUFBLEdBQUE7aUJBQUEsU0FBQSxHQUFBO0FBQ2YsZ0JBQUEsK0VBQUE7QUFBQSxZQUFBLEtBQUMsQ0FBQSxNQUFNLENBQUMsVUFBUixDQUFtQixLQUFDLENBQUEsU0FBcEIsRUFBK0I7QUFBQSxjQUFBLG9CQUFBLEVBQXNCLElBQXRCO2FBQS9CLENBQUEsQ0FBQTtBQUFBLFlBQ0EsUUFBQSxHQUFXLEtBQUMsQ0FBQSxTQUFTLENBQUMsTUFBWCxHQUFvQixLQUFDLENBQUEsVUFBRCxDQUFZLElBQVosRUFBa0IsS0FBQyxDQUFBLFNBQW5CLENBRC9CLENBQUE7QUFFQTtBQUFBLGlCQUFBLDRDQUFBO29DQUFBO0FBQ0UsY0FBQSxLQUFBLEdBQVEsUUFBUixDQUFBO0FBQ21CLHFCQUFNLEtBQUEsRUFBQSxJQUFZLENBQUEsU0FBYSxDQUFDLE1BQU0sQ0FBQyxhQUFqQixDQUFBLENBQXRCLEdBQUE7QUFBbkIsZ0JBQUEsU0FBUyxDQUFDLFFBQUQsQ0FBVCxDQUFBLENBQUEsQ0FBbUI7Y0FBQSxDQUZyQjtBQUFBLGFBRkE7QUFLQTtBQUFBO2lCQUFBLDhDQUFBO2lDQUFBO0FBQ0UsY0FBQSxJQUFBLENBQUEsTUFBK0IsQ0FBQyxtQkFBUCxDQUFBLENBQXpCOzhCQUFBLE1BQU0sQ0FBQyxRQUFQLENBQUEsR0FBQTtlQUFBLE1BQUE7c0NBQUE7ZUFERjtBQUFBOzRCQU5lO1VBQUEsRUFBQTtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBakIsRUFGRjtPQUFBLE1BQUE7QUFXRSxRQUFBLElBQUMsQ0FBQSxRQUFRLENBQUMsbUJBQVYsQ0FBQSxDQUFBLENBQUE7ZUFDQSxJQUFDLENBQUEsZUFBRCxHQUFtQixLQVpyQjtPQURPO0lBQUEsQ0FBVCxDQUFBOztBQUFBLDBCQWVBLFVBQUEsR0FBWSxTQUFDLElBQUQsRUFBTyxNQUFQLEdBQUE7YUFDVixNQUFNLENBQUMsS0FBUCxDQUFhLElBQWIsQ0FBa0IsQ0FBQyxNQUFuQixHQUE0QixFQURsQjtJQUFBLENBZlosQ0FBQTs7dUJBQUE7O0tBRndCLE9BakMxQixDQUFBOztBQUFBLEVBcURNO0FBQ0osa0NBQUEsQ0FBQTs7OztLQUFBOztBQUFBLDBCQUFBLE9BQUEsR0FBUyxTQUFBLEdBQUE7QUFDUCxNQUFBLElBQUEsQ0FBQSxJQUE0QixDQUFBLE1BQU0sQ0FBQyxhQUFSLENBQUEsQ0FBdUIsQ0FBQyxhQUF4QixDQUFBLENBQTNCO0FBQUEsUUFBQSxJQUFDLENBQUEsTUFBTSxDQUFDLFNBQVIsQ0FBQSxDQUFBLENBQUE7T0FBQTthQUNBLDBDQUFBLFNBQUEsRUFGTztJQUFBLENBQVQsQ0FBQTs7dUJBQUE7O0tBRHdCLE9BckQxQixDQUFBOztBQUFBLEVBMERNO0FBQ0osMkNBQUEsQ0FBQTs7OztLQUFBOztBQUFBLG1DQUFBLE9BQUEsR0FBUyxTQUFBLEdBQUE7QUFDUCxNQUFBLElBQUMsQ0FBQSxNQUFNLENBQUMsZUFBUixDQUFBLENBQUEsQ0FBQTthQUNBLG1EQUFBLFNBQUEsRUFGTztJQUFBLENBQVQsQ0FBQTs7Z0NBQUE7O0tBRGlDLE9BMURuQyxDQUFBOztBQUFBLEVBK0RNO0FBQ0osOENBQUEsQ0FBQTs7OztLQUFBOztBQUFBLHNDQUFBLE9BQUEsR0FBUyxTQUFBLEdBQUE7QUFDUCxNQUFBLElBQUMsQ0FBQSxNQUFNLENBQUMscUJBQVIsQ0FBQSxDQUFBLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxNQUFNLENBQUMsMEJBQVIsQ0FBQSxDQURBLENBQUE7YUFFQSxzREFBQSxTQUFBLEVBSE87SUFBQSxDQUFULENBQUE7O21DQUFBOztLQURvQyxPQS9EdEMsQ0FBQTs7QUFBQSxFQXFFTTtBQUNKLDZDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxxQ0FBQSxPQUFBLEdBQVMsU0FBQSxHQUFBO0FBQ1AsTUFBQSxJQUFBLENBQUEsSUFBMkMsQ0FBQSxlQUEzQztBQUFBLFFBQUEsSUFBQyxDQUFBLFFBQVEsQ0FBQyxzQkFBVixDQUFBLENBQUEsQ0FBQTtPQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsTUFBTSxDQUFDLGtCQUFSLENBQUEsQ0FEQSxDQUFBO0FBQUEsTUFFQSxJQUFDLENBQUEsTUFBTSxDQUFDLGFBQVIsQ0FBQSxDQUF1QixDQUFDLHFCQUF4QixDQUFBLENBRkEsQ0FBQTtBQUlBLE1BQUEsSUFBRyxJQUFDLENBQUEsZUFBSjtBQUdFLFFBQUEsSUFBQyxDQUFBLFNBQUQsR0FBYSxJQUFDLENBQUEsU0FBUyxDQUFDLFFBQVgsQ0FBQSxDQUFiLENBQUE7QUFDQSxlQUFPLHFEQUFBLFNBQUEsQ0FBUCxDQUpGO09BSkE7QUFBQSxNQVVBLElBQUMsQ0FBQSxRQUFRLENBQUMsa0JBQVYsQ0FBQSxDQVZBLENBQUE7YUFXQSxJQUFDLENBQUEsZUFBRCxHQUFtQixLQVpaO0lBQUEsQ0FBVCxDQUFBOztrQ0FBQTs7S0FEbUMsT0FyRXJDLENBQUE7O0FBQUEsRUFvRk07QUFDSiw2Q0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEscUNBQUEsT0FBQSxHQUFTLFNBQUEsR0FBQTtBQUNQLE1BQUEsSUFBQSxDQUFBLElBQTJDLENBQUEsZUFBM0M7QUFBQSxRQUFBLElBQUMsQ0FBQSxRQUFRLENBQUMsc0JBQVYsQ0FBQSxDQUFBLENBQUE7T0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLE1BQU0sQ0FBQyxrQkFBUixDQUFBLENBREEsQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxhQUFSLENBQUEsQ0FBdUIsQ0FBQyxxQkFBeEIsQ0FBQSxDQUZBLENBQUE7QUFJQSxNQUFBLElBQUcsSUFBQyxDQUFBLGVBQUo7QUFHRSxRQUFBLElBQUMsQ0FBQSxTQUFELEdBQWEsSUFBQyxDQUFBLFNBQVMsQ0FBQyxRQUFYLENBQUEsQ0FBYixDQUFBO0FBQ0EsZUFBTyxxREFBQSxTQUFBLENBQVAsQ0FKRjtPQUpBO0FBQUEsTUFVQSxJQUFDLENBQUEsUUFBUSxDQUFDLGtCQUFWLENBQUEsQ0FWQSxDQUFBO2FBV0EsSUFBQyxDQUFBLGVBQUQsR0FBbUIsS0FaWjtJQUFBLENBQVQsQ0FBQTs7a0NBQUE7O0tBRG1DLE9BcEZyQyxDQUFBOztBQUFBLEVBc0dNO0FBQ0osNkJBQUEsQ0FBQTs7QUFBQSxxQkFBQSxVQUFBLEdBQVksS0FBWixDQUFBOztBQUFBLHFCQUNBLFFBQUEsR0FBVSxJQURWLENBQUE7O0FBR2EsSUFBQSxnQkFBRSxNQUFGLEVBQVcsUUFBWCxHQUFBO0FBQ1gsTUFEWSxJQUFDLENBQUEsU0FBQSxNQUNiLENBQUE7QUFBQSxNQURxQixJQUFDLENBQUEsV0FBQSxRQUN0QixDQUFBO0FBQUEsTUFBQSxJQUFDLENBQUEsUUFBRCxHQUFZLFFBQVEsQ0FBQyxlQUFULENBQUEsQ0FBWixDQURXO0lBQUEsQ0FIYjs7QUFBQSxxQkFXQSxPQUFBLEdBQVMsU0FBQyxLQUFELEdBQUE7QUFDUCxVQUFBLG1EQUFBO0FBQUEsTUFBQSxJQUFHLENBQUMsQ0FBQyxRQUFGLENBQVcsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFSLENBQWUsS0FBZixFQUFzQjtBQUFBLFFBQUEsaUJBQUEsRUFBbUIsSUFBbkI7T0FBdEIsQ0FBWCxFQUEyRCxJQUEzRCxDQUFIO0FBR0UsUUFBQSxJQUFBLENBQUEsSUFBMkMsQ0FBQSxlQUEzQztBQUFBLFVBQUEsSUFBQyxDQUFBLFFBQVEsQ0FBQyxzQkFBVixDQUFBLENBQUEsQ0FBQTtTQUFBO0FBQUEsUUFFQSxJQUFDLENBQUEsZUFBRCxDQUFpQixJQUFDLENBQUEsUUFBbEIsRUFBNEIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxlQUFSLENBQUEsQ0FBNUIsQ0FGQSxDQUFBO0FBR0EsUUFBQSxtRUFBVSxDQUFDLHNCQUFSLElBQTBCLENBQUEsSUFBSyxDQUFBLGVBQWxDO0FBQ0U7QUFBQSxlQUFBLDRDQUFBO2tDQUFBO0FBQ0UsWUFBQSxJQUFHLFNBQVMsQ0FBQyxjQUFWLENBQUEsQ0FBMEIsQ0FBQyxHQUFHLENBQUMsR0FBL0IsS0FBc0MsQ0FBekM7QUFDRSxjQUFBLFNBQVMsQ0FBQyxrQkFBVixDQUFBLENBQUEsQ0FERjthQUFBLE1BQUE7QUFHRSxjQUFBLFNBQVMsQ0FBQyxVQUFWLENBQXFCLElBQXJCLEVBQTJCO0FBQUEsZ0JBQUEsVUFBQSxFQUFZLElBQVo7ZUFBM0IsQ0FBQSxDQUhGO2FBQUE7QUFBQSxZQUlBLFNBQVMsQ0FBQyxNQUFNLENBQUMsUUFBakIsQ0FBQSxDQUpBLENBREY7QUFBQSxXQURGO1NBQUEsTUFBQTtBQVFFO0FBQUEsZUFBQSw4Q0FBQTtrQ0FBQTtBQUNFLFlBQUEsU0FBUyxDQUFDLGtCQUFWLENBQUEsQ0FBQSxDQURGO0FBQUEsV0FSRjtTQUhBO0FBY0EsUUFBQSxJQUFnQixJQUFDLENBQUEsZUFBakI7QUFBQSxpQkFBTyxxQ0FBQSxTQUFBLENBQVAsQ0FBQTtTQWRBO0FBQUEsUUFnQkEsSUFBQyxDQUFBLFFBQVEsQ0FBQyxrQkFBVixDQUFBLENBaEJBLENBQUE7ZUFpQkEsSUFBQyxDQUFBLGVBQUQsR0FBbUIsS0FwQnJCO09BQUEsTUFBQTtlQXNCRSxJQUFDLENBQUEsUUFBUSxDQUFDLGtCQUFWLENBQUEsRUF0QkY7T0FETztJQUFBLENBWFQsQ0FBQTs7a0JBQUE7O0tBRG1CLE9BdEdyQixDQUFBOztBQUFBLEVBNElBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCO0FBQUEsSUFDZixRQUFBLE1BRGU7QUFBQSxJQUVmLGFBQUEsV0FGZTtBQUFBLElBR2Ysc0JBQUEsb0JBSGU7QUFBQSxJQUlmLHlCQUFBLHVCQUplO0FBQUEsSUFLZix3QkFBQSxzQkFMZTtBQUFBLElBTWYsd0JBQUEsc0JBTmU7QUFBQSxJQU9mLGFBQUEsV0FQZTtBQUFBLElBUWYsUUFBQSxNQVJlO0dBNUlqQixDQUFBO0FBQUEiCn0=

//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/vim-mode/lib/operators/input.coffee
