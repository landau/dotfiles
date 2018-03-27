(function() {
  var AdjustIndentation, Autoindent, Indent, Operator, Outdent, _,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ = require('underscore-plus');

  Operator = require('./general-operators').Operator;

  AdjustIndentation = (function(_super) {
    __extends(AdjustIndentation, _super);

    function AdjustIndentation() {
      return AdjustIndentation.__super__.constructor.apply(this, arguments);
    }

    AdjustIndentation.prototype.execute = function(count) {
      var mode, originalRanges, range, _i, _len;
      mode = this.vimState.mode;
      this.motion.select(count);
      originalRanges = this.editor.getSelectedBufferRanges();
      if (mode === 'visual') {
        this.editor.transact((function(_this) {
          return function() {
            return _.times(count != null ? count : 1, function() {
              return _this.indent();
            });
          };
        })(this));
      } else {
        this.indent();
      }
      this.editor.clearSelections();
      this.editor.getLastCursor().setBufferPosition([originalRanges.shift().start.row, 0]);
      for (_i = 0, _len = originalRanges.length; _i < _len; _i++) {
        range = originalRanges[_i];
        this.editor.addCursorAtBufferPosition([range.start.row, 0]);
      }
      this.editor.moveToFirstCharacterOfLine();
      return this.vimState.activateNormalMode();
    };

    return AdjustIndentation;

  })(Operator);

  Indent = (function(_super) {
    __extends(Indent, _super);

    function Indent() {
      return Indent.__super__.constructor.apply(this, arguments);
    }

    Indent.prototype.indent = function() {
      return this.editor.indentSelectedRows();
    };

    return Indent;

  })(AdjustIndentation);

  Outdent = (function(_super) {
    __extends(Outdent, _super);

    function Outdent() {
      return Outdent.__super__.constructor.apply(this, arguments);
    }

    Outdent.prototype.indent = function() {
      return this.editor.outdentSelectedRows();
    };

    return Outdent;

  })(AdjustIndentation);

  Autoindent = (function(_super) {
    __extends(Autoindent, _super);

    function Autoindent() {
      return Autoindent.__super__.constructor.apply(this, arguments);
    }

    Autoindent.prototype.indent = function() {
      return this.editor.autoIndentSelectedRows();
    };

    return Autoindent;

  })(AdjustIndentation);

  module.exports = {
    Indent: Indent,
    Outdent: Outdent,
    Autoindent: Autoindent
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUvbGliL29wZXJhdG9ycy9pbmRlbnQtb3BlcmF0b3JzLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSwyREFBQTtJQUFBO21TQUFBOztBQUFBLEVBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUixDQUFKLENBQUE7O0FBQUEsRUFDQyxXQUFZLE9BQUEsQ0FBUSxxQkFBUixFQUFaLFFBREQsQ0FBQTs7QUFBQSxFQUdNO0FBQ0osd0NBQUEsQ0FBQTs7OztLQUFBOztBQUFBLGdDQUFBLE9BQUEsR0FBUyxTQUFDLEtBQUQsR0FBQTtBQUNQLFVBQUEscUNBQUE7QUFBQSxNQUFBLElBQUEsR0FBTyxJQUFDLENBQUEsUUFBUSxDQUFDLElBQWpCLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBUixDQUFlLEtBQWYsQ0FEQSxDQUFBO0FBQUEsTUFFQSxjQUFBLEdBQWlCLElBQUMsQ0FBQSxNQUFNLENBQUMsdUJBQVIsQ0FBQSxDQUZqQixDQUFBO0FBSUEsTUFBQSxJQUFHLElBQUEsS0FBUSxRQUFYO0FBQ0UsUUFBQSxJQUFDLENBQUEsTUFBTSxDQUFDLFFBQVIsQ0FBaUIsQ0FBQSxTQUFBLEtBQUEsR0FBQTtpQkFBQSxTQUFBLEdBQUE7bUJBQ2YsQ0FBQyxDQUFDLEtBQUYsaUJBQVEsUUFBUSxDQUFoQixFQUFtQixTQUFBLEdBQUE7cUJBQUcsS0FBQyxDQUFBLE1BQUQsQ0FBQSxFQUFIO1lBQUEsQ0FBbkIsRUFEZTtVQUFBLEVBQUE7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWpCLENBQUEsQ0FERjtPQUFBLE1BQUE7QUFJRSxRQUFBLElBQUMsQ0FBQSxNQUFELENBQUEsQ0FBQSxDQUpGO09BSkE7QUFBQSxNQVVBLElBQUMsQ0FBQSxNQUFNLENBQUMsZUFBUixDQUFBLENBVkEsQ0FBQTtBQUFBLE1BV0EsSUFBQyxDQUFBLE1BQU0sQ0FBQyxhQUFSLENBQUEsQ0FBdUIsQ0FBQyxpQkFBeEIsQ0FBMEMsQ0FBQyxjQUFjLENBQUMsS0FBZixDQUFBLENBQXNCLENBQUMsS0FBSyxDQUFDLEdBQTlCLEVBQW1DLENBQW5DLENBQTFDLENBWEEsQ0FBQTtBQVlBLFdBQUEscURBQUE7bUNBQUE7QUFDRSxRQUFBLElBQUMsQ0FBQSxNQUFNLENBQUMseUJBQVIsQ0FBa0MsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQWIsRUFBa0IsQ0FBbEIsQ0FBbEMsQ0FBQSxDQURGO0FBQUEsT0FaQTtBQUFBLE1BY0EsSUFBQyxDQUFBLE1BQU0sQ0FBQywwQkFBUixDQUFBLENBZEEsQ0FBQTthQWVBLElBQUMsQ0FBQSxRQUFRLENBQUMsa0JBQVYsQ0FBQSxFQWhCTztJQUFBLENBQVQsQ0FBQTs7NkJBQUE7O0tBRDhCLFNBSGhDLENBQUE7O0FBQUEsRUFzQk07QUFDSiw2QkFBQSxDQUFBOzs7O0tBQUE7O0FBQUEscUJBQUEsTUFBQSxHQUFRLFNBQUEsR0FBQTthQUNOLElBQUMsQ0FBQSxNQUFNLENBQUMsa0JBQVIsQ0FBQSxFQURNO0lBQUEsQ0FBUixDQUFBOztrQkFBQTs7S0FEbUIsa0JBdEJyQixDQUFBOztBQUFBLEVBMEJNO0FBQ0osOEJBQUEsQ0FBQTs7OztLQUFBOztBQUFBLHNCQUFBLE1BQUEsR0FBUSxTQUFBLEdBQUE7YUFDTixJQUFDLENBQUEsTUFBTSxDQUFDLG1CQUFSLENBQUEsRUFETTtJQUFBLENBQVIsQ0FBQTs7bUJBQUE7O0tBRG9CLGtCQTFCdEIsQ0FBQTs7QUFBQSxFQThCTTtBQUNKLGlDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSx5QkFBQSxNQUFBLEdBQVEsU0FBQSxHQUFBO2FBQ04sSUFBQyxDQUFBLE1BQU0sQ0FBQyxzQkFBUixDQUFBLEVBRE07SUFBQSxDQUFSLENBQUE7O3NCQUFBOztLQUR1QixrQkE5QnpCLENBQUE7O0FBQUEsRUFrQ0EsTUFBTSxDQUFDLE9BQVAsR0FBaUI7QUFBQSxJQUFDLFFBQUEsTUFBRDtBQUFBLElBQVMsU0FBQSxPQUFUO0FBQUEsSUFBa0IsWUFBQSxVQUFsQjtHQWxDakIsQ0FBQTtBQUFBIgp9

//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/vim-mode/lib/operators/indent-operators.coffee
