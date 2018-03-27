(function() {
  var Operator, Put, settings, _,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ = require('underscore-plus');

  Operator = require('./general-operators').Operator;

  settings = require('../settings');

  module.exports = Put = (function(_super) {
    __extends(Put, _super);

    Put.prototype.register = null;

    function Put(editor, vimState, _arg) {
      this.editor = editor;
      this.vimState = vimState;
      this.location = (_arg != null ? _arg : {}).location;
      if (this.location == null) {
        this.location = 'after';
      }
      this.complete = true;
      this.register = settings.defaultRegister();
    }

    Put.prototype.execute = function(count) {
      var originalPosition, selection, text, textToInsert, type, _ref;
      if (count == null) {
        count = 1;
      }
      _ref = this.vimState.getRegister(this.register) || {}, text = _ref.text, type = _ref.type;
      if (!text) {
        return;
      }
      textToInsert = _.times(count, function() {
        return text;
      }).join('');
      selection = this.editor.getSelectedBufferRange();
      if (selection.isEmpty()) {
        if (type === 'linewise') {
          textToInsert = textToInsert.replace(/\n$/, '');
          if (this.location === 'after' && this.onLastRow()) {
            textToInsert = "\n" + textToInsert;
          } else {
            textToInsert = "" + textToInsert + "\n";
          }
        }
        if (this.location === 'after') {
          if (type === 'linewise') {
            if (this.onLastRow()) {
              this.editor.moveToEndOfLine();
              originalPosition = this.editor.getCursorScreenPosition();
              originalPosition.row += 1;
            } else {
              this.editor.moveDown();
            }
          } else {
            if (!this.onLastColumn()) {
              this.editor.moveRight();
            }
          }
        }
        if (type === 'linewise' && (originalPosition == null)) {
          this.editor.moveToBeginningOfLine();
          originalPosition = this.editor.getCursorScreenPosition();
        }
      }
      this.editor.insertText(textToInsert);
      if (originalPosition != null) {
        this.editor.setCursorScreenPosition(originalPosition);
        this.editor.moveToFirstCharacterOfLine();
      }
      if (type !== 'linewise') {
        this.editor.moveLeft();
      }
      return this.vimState.activateNormalMode();
    };

    Put.prototype.onLastRow = function() {
      var column, row, _ref;
      _ref = this.editor.getCursorBufferPosition(), row = _ref.row, column = _ref.column;
      return row === this.editor.getBuffer().getLastRow();
    };

    Put.prototype.onLastColumn = function() {
      return this.editor.getLastCursor().isAtEndOfLine();
    };

    return Put;

  })(Operator);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUvbGliL29wZXJhdG9ycy9wdXQtb3BlcmF0b3IuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDBCQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSLENBQUosQ0FBQTs7QUFBQSxFQUNDLFdBQVksT0FBQSxDQUFRLHFCQUFSLEVBQVosUUFERCxDQUFBOztBQUFBLEVBRUEsUUFBQSxHQUFXLE9BQUEsQ0FBUSxhQUFSLENBRlgsQ0FBQTs7QUFBQSxFQUlBLE1BQU0sQ0FBQyxPQUFQLEdBSU07QUFDSiwwQkFBQSxDQUFBOztBQUFBLGtCQUFBLFFBQUEsR0FBVSxJQUFWLENBQUE7O0FBRWEsSUFBQSxhQUFFLE1BQUYsRUFBVyxRQUFYLEVBQXFCLElBQXJCLEdBQUE7QUFDWCxNQURZLElBQUMsQ0FBQSxTQUFBLE1BQ2IsQ0FBQTtBQUFBLE1BRHFCLElBQUMsQ0FBQSxXQUFBLFFBQ3RCLENBQUE7QUFBQSxNQURpQyxJQUFDLENBQUEsMkJBQUYsT0FBWSxJQUFWLFFBQ2xDLENBQUE7O1FBQUEsSUFBQyxDQUFBLFdBQVk7T0FBYjtBQUFBLE1BQ0EsSUFBQyxDQUFBLFFBQUQsR0FBWSxJQURaLENBQUE7QUFBQSxNQUVBLElBQUMsQ0FBQSxRQUFELEdBQVksUUFBUSxDQUFDLGVBQVQsQ0FBQSxDQUZaLENBRFc7SUFBQSxDQUZiOztBQUFBLGtCQVlBLE9BQUEsR0FBUyxTQUFDLEtBQUQsR0FBQTtBQUNQLFVBQUEsMkRBQUE7O1FBRFEsUUFBTTtPQUNkO0FBQUEsTUFBQSxPQUFlLElBQUMsQ0FBQSxRQUFRLENBQUMsV0FBVixDQUFzQixJQUFDLENBQUEsUUFBdkIsQ0FBQSxJQUFvQyxFQUFuRCxFQUFDLFlBQUEsSUFBRCxFQUFPLFlBQUEsSUFBUCxDQUFBO0FBQ0EsTUFBQSxJQUFBLENBQUEsSUFBQTtBQUFBLGNBQUEsQ0FBQTtPQURBO0FBQUEsTUFHQSxZQUFBLEdBQWUsQ0FBQyxDQUFDLEtBQUYsQ0FBUSxLQUFSLEVBQWUsU0FBQSxHQUFBO2VBQUcsS0FBSDtNQUFBLENBQWYsQ0FBdUIsQ0FBQyxJQUF4QixDQUE2QixFQUE3QixDQUhmLENBQUE7QUFBQSxNQUtBLFNBQUEsR0FBWSxJQUFDLENBQUEsTUFBTSxDQUFDLHNCQUFSLENBQUEsQ0FMWixDQUFBO0FBTUEsTUFBQSxJQUFHLFNBQVMsQ0FBQyxPQUFWLENBQUEsQ0FBSDtBQUVFLFFBQUEsSUFBRyxJQUFBLEtBQVEsVUFBWDtBQUNFLFVBQUEsWUFBQSxHQUFlLFlBQVksQ0FBQyxPQUFiLENBQXFCLEtBQXJCLEVBQTRCLEVBQTVCLENBQWYsQ0FBQTtBQUNBLFVBQUEsSUFBRyxJQUFDLENBQUEsUUFBRCxLQUFhLE9BQWIsSUFBeUIsSUFBQyxDQUFBLFNBQUQsQ0FBQSxDQUE1QjtBQUNFLFlBQUEsWUFBQSxHQUFnQixJQUFBLEdBQUksWUFBcEIsQ0FERjtXQUFBLE1BQUE7QUFHRSxZQUFBLFlBQUEsR0FBZSxFQUFBLEdBQUcsWUFBSCxHQUFnQixJQUEvQixDQUhGO1dBRkY7U0FBQTtBQU9BLFFBQUEsSUFBRyxJQUFDLENBQUEsUUFBRCxLQUFhLE9BQWhCO0FBQ0UsVUFBQSxJQUFHLElBQUEsS0FBUSxVQUFYO0FBQ0UsWUFBQSxJQUFHLElBQUMsQ0FBQSxTQUFELENBQUEsQ0FBSDtBQUNFLGNBQUEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxlQUFSLENBQUEsQ0FBQSxDQUFBO0FBQUEsY0FFQSxnQkFBQSxHQUFtQixJQUFDLENBQUEsTUFBTSxDQUFDLHVCQUFSLENBQUEsQ0FGbkIsQ0FBQTtBQUFBLGNBR0EsZ0JBQWdCLENBQUMsR0FBakIsSUFBd0IsQ0FIeEIsQ0FERjthQUFBLE1BQUE7QUFNRSxjQUFBLElBQUMsQ0FBQSxNQUFNLENBQUMsUUFBUixDQUFBLENBQUEsQ0FORjthQURGO1dBQUEsTUFBQTtBQVNFLFlBQUEsSUFBQSxDQUFBLElBQVEsQ0FBQSxZQUFELENBQUEsQ0FBUDtBQUNFLGNBQUEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxTQUFSLENBQUEsQ0FBQSxDQURGO2FBVEY7V0FERjtTQVBBO0FBb0JBLFFBQUEsSUFBRyxJQUFBLEtBQVEsVUFBUixJQUEyQiwwQkFBOUI7QUFDRSxVQUFBLElBQUMsQ0FBQSxNQUFNLENBQUMscUJBQVIsQ0FBQSxDQUFBLENBQUE7QUFBQSxVQUNBLGdCQUFBLEdBQW1CLElBQUMsQ0FBQSxNQUFNLENBQUMsdUJBQVIsQ0FBQSxDQURuQixDQURGO1NBdEJGO09BTkE7QUFBQSxNQWdDQSxJQUFDLENBQUEsTUFBTSxDQUFDLFVBQVIsQ0FBbUIsWUFBbkIsQ0FoQ0EsQ0FBQTtBQWtDQSxNQUFBLElBQUcsd0JBQUg7QUFDRSxRQUFBLElBQUMsQ0FBQSxNQUFNLENBQUMsdUJBQVIsQ0FBZ0MsZ0JBQWhDLENBQUEsQ0FBQTtBQUFBLFFBQ0EsSUFBQyxDQUFBLE1BQU0sQ0FBQywwQkFBUixDQUFBLENBREEsQ0FERjtPQWxDQTtBQXNDQSxNQUFBLElBQUcsSUFBQSxLQUFVLFVBQWI7QUFDRSxRQUFBLElBQUMsQ0FBQSxNQUFNLENBQUMsUUFBUixDQUFBLENBQUEsQ0FERjtPQXRDQTthQXdDQSxJQUFDLENBQUEsUUFBUSxDQUFDLGtCQUFWLENBQUEsRUF6Q087SUFBQSxDQVpULENBQUE7O0FBQUEsa0JBMERBLFNBQUEsR0FBVyxTQUFBLEdBQUE7QUFDVCxVQUFBLGlCQUFBO0FBQUEsTUFBQSxPQUFnQixJQUFDLENBQUEsTUFBTSxDQUFDLHVCQUFSLENBQUEsQ0FBaEIsRUFBQyxXQUFBLEdBQUQsRUFBTSxjQUFBLE1BQU4sQ0FBQTthQUNBLEdBQUEsS0FBTyxJQUFDLENBQUEsTUFBTSxDQUFDLFNBQVIsQ0FBQSxDQUFtQixDQUFDLFVBQXBCLENBQUEsRUFGRTtJQUFBLENBMURYLENBQUE7O0FBQUEsa0JBOERBLFlBQUEsR0FBYyxTQUFBLEdBQUE7YUFDWixJQUFDLENBQUEsTUFBTSxDQUFDLGFBQVIsQ0FBQSxDQUF1QixDQUFDLGFBQXhCLENBQUEsRUFEWTtJQUFBLENBOURkLENBQUE7O2VBQUE7O0tBRGdCLFNBUmxCLENBQUE7QUFBQSIKfQ==

//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/vim-mode/lib/operators/put-operator.coffee
