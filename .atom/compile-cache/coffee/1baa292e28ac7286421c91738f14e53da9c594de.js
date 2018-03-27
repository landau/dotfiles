(function() {
  var MotionWithInput, MoveToFirstCharacterOfLine, MoveToMark, Point, Range, ViewModel, _ref, _ref1,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ref = require('./general-motions'), MotionWithInput = _ref.MotionWithInput, MoveToFirstCharacterOfLine = _ref.MoveToFirstCharacterOfLine;

  ViewModel = require('../view-models/view-model').ViewModel;

  _ref1 = require('atom'), Point = _ref1.Point, Range = _ref1.Range;

  module.exports = MoveToMark = (function(_super) {
    __extends(MoveToMark, _super);

    function MoveToMark(editor, vimState, linewise) {
      this.editor = editor;
      this.vimState = vimState;
      this.linewise = linewise != null ? linewise : true;
      MoveToMark.__super__.constructor.call(this, this.editor, this.vimState);
      this.operatesLinewise = this.linewise;
      this.viewModel = new ViewModel(this, {
        "class": 'move-to-mark',
        singleChar: true,
        hidden: true
      });
    }

    MoveToMark.prototype.isLinewise = function() {
      return this.linewise;
    };

    MoveToMark.prototype.moveCursor = function(cursor, count) {
      var markPosition;
      if (count == null) {
        count = 1;
      }
      markPosition = this.vimState.getMark(this.input.characters);
      if (this.input.characters === '`') {
        if (markPosition == null) {
          markPosition = [0, 0];
        }
        this.vimState.setMark('`', cursor.getBufferPosition());
      }
      if (markPosition != null) {
        cursor.setBufferPosition(markPosition);
      }
      if (this.linewise) {
        return cursor.moveToFirstCharacterOfLine();
      }
    };

    return MoveToMark;

  })(MotionWithInput);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUvbGliL21vdGlvbnMvbW92ZS10by1tYXJrLW1vdGlvbi5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsNkZBQUE7SUFBQTttU0FBQTs7QUFBQSxFQUFBLE9BQWdELE9BQUEsQ0FBUSxtQkFBUixDQUFoRCxFQUFDLHVCQUFBLGVBQUQsRUFBa0Isa0NBQUEsMEJBQWxCLENBQUE7O0FBQUEsRUFDQyxZQUFhLE9BQUEsQ0FBUSwyQkFBUixFQUFiLFNBREQsQ0FBQTs7QUFBQSxFQUVBLFFBQWlCLE9BQUEsQ0FBUSxNQUFSLENBQWpCLEVBQUMsY0FBQSxLQUFELEVBQVEsY0FBQSxLQUZSLENBQUE7O0FBQUEsRUFJQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ0osaUNBQUEsQ0FBQTs7QUFBYSxJQUFBLG9CQUFFLE1BQUYsRUFBVyxRQUFYLEVBQXNCLFFBQXRCLEdBQUE7QUFDWCxNQURZLElBQUMsQ0FBQSxTQUFBLE1BQ2IsQ0FBQTtBQUFBLE1BRHFCLElBQUMsQ0FBQSxXQUFBLFFBQ3RCLENBQUE7QUFBQSxNQURnQyxJQUFDLENBQUEsOEJBQUEsV0FBUyxJQUMxQyxDQUFBO0FBQUEsTUFBQSw0Q0FBTSxJQUFDLENBQUEsTUFBUCxFQUFlLElBQUMsQ0FBQSxRQUFoQixDQUFBLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxnQkFBRCxHQUFvQixJQUFDLENBQUEsUUFEckIsQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLFNBQUQsR0FBaUIsSUFBQSxTQUFBLENBQVUsSUFBVixFQUFnQjtBQUFBLFFBQUEsT0FBQSxFQUFPLGNBQVA7QUFBQSxRQUF1QixVQUFBLEVBQVksSUFBbkM7QUFBQSxRQUF5QyxNQUFBLEVBQVEsSUFBakQ7T0FBaEIsQ0FGakIsQ0FEVztJQUFBLENBQWI7O0FBQUEseUJBS0EsVUFBQSxHQUFZLFNBQUEsR0FBQTthQUFHLElBQUMsQ0FBQSxTQUFKO0lBQUEsQ0FMWixDQUFBOztBQUFBLHlCQU9BLFVBQUEsR0FBWSxTQUFDLE1BQUQsRUFBUyxLQUFULEdBQUE7QUFDVixVQUFBLFlBQUE7O1FBRG1CLFFBQU07T0FDekI7QUFBQSxNQUFBLFlBQUEsR0FBZSxJQUFDLENBQUEsUUFBUSxDQUFDLE9BQVYsQ0FBa0IsSUFBQyxDQUFBLEtBQUssQ0FBQyxVQUF6QixDQUFmLENBQUE7QUFFQSxNQUFBLElBQUcsSUFBQyxDQUFBLEtBQUssQ0FBQyxVQUFQLEtBQXFCLEdBQXhCOztVQUNFLGVBQWdCLENBQUMsQ0FBRCxFQUFJLENBQUo7U0FBaEI7QUFBQSxRQUNBLElBQUMsQ0FBQSxRQUFRLENBQUMsT0FBVixDQUFrQixHQUFsQixFQUF1QixNQUFNLENBQUMsaUJBQVAsQ0FBQSxDQUF2QixDQURBLENBREY7T0FGQTtBQU1BLE1BQUEsSUFBMEMsb0JBQTFDO0FBQUEsUUFBQSxNQUFNLENBQUMsaUJBQVAsQ0FBeUIsWUFBekIsQ0FBQSxDQUFBO09BTkE7QUFPQSxNQUFBLElBQUcsSUFBQyxDQUFBLFFBQUo7ZUFDRSxNQUFNLENBQUMsMEJBQVAsQ0FBQSxFQURGO09BUlU7SUFBQSxDQVBaLENBQUE7O3NCQUFBOztLQUR1QixnQkFMekIsQ0FBQTtBQUFBIgp9

//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/vim-mode/lib/motions/move-to-mark-motion.coffee
