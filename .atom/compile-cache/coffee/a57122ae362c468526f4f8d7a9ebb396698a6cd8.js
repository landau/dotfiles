(function() {
  var OperatorWithInput, Range, Replace, ViewModel, _,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ = require('underscore-plus');

  OperatorWithInput = require('./general-operators').OperatorWithInput;

  ViewModel = require('../view-models/view-model').ViewModel;

  Range = require('atom').Range;

  module.exports = Replace = (function(_super) {
    __extends(Replace, _super);

    function Replace(editor, vimState) {
      this.editor = editor;
      this.vimState = vimState;
      Replace.__super__.constructor.call(this, this.editor, this.vimState);
      this.viewModel = new ViewModel(this, {
        "class": 'replace',
        hidden: true,
        singleChar: true,
        defaultText: '\n'
      });
    }

    Replace.prototype.execute = function(count) {
      if (count == null) {
        count = 1;
      }
      if (this.input.characters === "") {
        if (this.vimState.mode === "visual") {
          this.vimState.resetVisualMode();
        } else {
          this.vimState.activateNormalMode();
        }
        return;
      }
      this.editor.transact((function(_this) {
        return function() {
          var currentRowLength, cursor, point, pos, selection, _i, _j, _len, _len1, _ref, _ref1, _results;
          if (_this.motion != null) {
            if (_.contains(_this.motion.select(), true)) {
              _this.editor.replaceSelectedText(null, function(text) {
                return text.replace(/./g, _this.input.characters);
              });
              _ref = _this.editor.getSelections();
              _results = [];
              for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                selection = _ref[_i];
                point = selection.getBufferRange().start;
                _results.push(selection.setBufferRange(Range.fromPointWithDelta(point, 0, 0)));
              }
              return _results;
            }
          } else {
            _ref1 = _this.editor.getCursors();
            for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
              cursor = _ref1[_j];
              pos = cursor.getBufferPosition();
              currentRowLength = _this.editor.lineTextForBufferRow(pos.row).length;
              if (!(currentRowLength - pos.column >= count)) {
                continue;
              }
              _.times(count, function() {
                point = cursor.getBufferPosition();
                _this.editor.setTextInBufferRange(Range.fromPointWithDelta(point, 0, 1), _this.input.characters);
                return cursor.moveRight();
              });
              cursor.setBufferPosition(pos);
            }
            if (_this.input.characters === "\n") {
              _.times(count, function() {
                return _this.editor.moveDown();
              });
              return _this.editor.moveToFirstCharacterOfLine();
            }
          }
        };
      })(this));
      return this.vimState.activateNormalMode();
    };

    return Replace;

  })(OperatorWithInput);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUvbGliL29wZXJhdG9ycy9yZXBsYWNlLW9wZXJhdG9yLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSwrQ0FBQTtJQUFBO21TQUFBOztBQUFBLEVBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUixDQUFKLENBQUE7O0FBQUEsRUFDQyxvQkFBcUIsT0FBQSxDQUFRLHFCQUFSLEVBQXJCLGlCQURELENBQUE7O0FBQUEsRUFFQyxZQUFhLE9BQUEsQ0FBUSwyQkFBUixFQUFiLFNBRkQsQ0FBQTs7QUFBQSxFQUdDLFFBQVMsT0FBQSxDQUFRLE1BQVIsRUFBVCxLQUhELENBQUE7O0FBQUEsRUFLQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ0osOEJBQUEsQ0FBQTs7QUFBYSxJQUFBLGlCQUFFLE1BQUYsRUFBVyxRQUFYLEdBQUE7QUFDWCxNQURZLElBQUMsQ0FBQSxTQUFBLE1BQ2IsQ0FBQTtBQUFBLE1BRHFCLElBQUMsQ0FBQSxXQUFBLFFBQ3RCLENBQUE7QUFBQSxNQUFBLHlDQUFNLElBQUMsQ0FBQSxNQUFQLEVBQWUsSUFBQyxDQUFBLFFBQWhCLENBQUEsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLFNBQUQsR0FBaUIsSUFBQSxTQUFBLENBQVUsSUFBVixFQUFnQjtBQUFBLFFBQUEsT0FBQSxFQUFPLFNBQVA7QUFBQSxRQUFrQixNQUFBLEVBQVEsSUFBMUI7QUFBQSxRQUFnQyxVQUFBLEVBQVksSUFBNUM7QUFBQSxRQUFrRCxXQUFBLEVBQWEsSUFBL0Q7T0FBaEIsQ0FEakIsQ0FEVztJQUFBLENBQWI7O0FBQUEsc0JBSUEsT0FBQSxHQUFTLFNBQUMsS0FBRCxHQUFBOztRQUFDLFFBQU07T0FDZDtBQUFBLE1BQUEsSUFBRyxJQUFDLENB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

//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/vim-mode/lib/operators/replace-operator.coffee
