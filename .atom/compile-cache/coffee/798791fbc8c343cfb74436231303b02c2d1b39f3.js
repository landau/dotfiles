(function() {
  var Decrease, Increase, Operator, Range, settings,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Operator = require('./general-operators').Operator;

  Range = require('atom').Range;

  settings = require('../settings');

  Increase = (function(_super) {
    __extends(Increase, _super);

    Increase.prototype.step = 1;

    function Increase() {
      Increase.__super__.constructor.apply(this, arguments);
      this.complete = true;
      this.numberRegex = new RegExp(settings.numberRegex());
    }

    Increase.prototype.execute = function(count) {
      if (count == null) {
        count = 1;
      }
      return this.editor.transact((function(_this) {
        return function() {
          var cursor, increased, _i, _len, _ref;
          increased = false;
          _ref = _this.editor.getCursors();
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            cursor = _ref[_i];
            if (_this.increaseNumber(count, cursor)) {
              increased = true;
            }
          }
          if (!increased) {
            return atom.beep();
          }
        };
      })(this));
    };

    Increase.prototype.increaseNumber = function(count, cursor) {
      var cursorPosition, newValue, numEnd, numStart, number, range;
      cursorPosition = cursor.getBufferPosition();
      numEnd = cursor.getEndOfCurrentWordBufferPosition({
        wordRegex: this.numberRegex,
        allowNext: false
      });
      if (numEnd.column === cursorPosition.column) {
        numEnd = cursor.getEndOfCurrentWordBufferPosition({
          wordRegex: this.numberRegex,
          allowNext: true
        });
        if (numEnd.row !== cursorPosition.row) {
          return;
        }
        if (numEnd.column === cursorPosition.column) {
          return;
        }
      }
      cursor.setBufferPosition(numEnd);
      numStart = cursor.getBeginningOfCurrentWordBufferPosition({
        wordRegex: this.numberRegex,
        allowPrevious: false
      });
      range = new Range(numStart, numEnd);
      number = parseInt(this.editor.getTextInBufferRange(range), 10);
      if (isNaN(number)) {
        cursor.setBufferPosition(cursorPosition);
        return;
      }
      number += this.step * count;
      newValue = String(number);
      this.editor.setTextInBufferRange(range, newValue, {
        normalizeLineEndings: false
      });
      cursor.setBufferPosition({
        row: numStart.row,
        column: numStart.column - 1 + newValue.length
      });
      return true;
    };

    return Increase;

  })(Operator);

  Decrease = (function(_super) {
    __extends(Decrease, _super);

    function Decrease() {
      return Decrease.__super__.constructor.apply(this, arguments);
    }

    Decrease.prototype.step = -1;

    return Decrease;

  })(Increase);

  module.exports = {
    Increase: Increase,
    Decrease: Decrease
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUvbGliL29wZXJhdG9ycy9pbmNyZWFzZS1vcGVyYXRvcnMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDZDQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQyxXQUFZLE9BQUEsQ0FBUSxxQkFBUixFQUFaLFFBQUQsQ0FBQTs7QUFBQSxFQUNDLFFBQVMsT0FBQSxDQUFRLE1BQVIsRUFBVCxLQURELENBQUE7O0FBQUEsRUFFQSxRQUFBLEdBQVcsT0FBQSxDQUFRLGFBQVIsQ0FGWCxDQUFBOztBQUFBLEVBT007QUFDSiwrQkFBQSxDQUFBOztBQUFBLHVCQUFBLElBQUEsR0FBTSxDQUFOLENBQUE7O0FBRWEsSUFBQSxrQkFBQSxHQUFBO0FBQ1gsTUFBQSwyQ0FBQSxTQUFBLENBQUEsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLFFBQUQsR0FBWSxJQURaLENBQUE7QUFBQSxNQUVBLElBQUMsQ0FBQSxXQUFELEdBQW1CLElBQUEsTUFBQSxDQUFPLFFBQVEsQ0FBQyxXQUFULENBQUEsQ0FBUCxDQUZuQixDQURXO0lBQUEsQ0FGYjs7QUFBQSx1QkFPQSxPQUFBLEdBQVMsU0FBQyxLQUFELEdBQUE7O1FBQUMsUUFBTTtPQUNkO2FBQUEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxRQUFSLENBQWlCLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7QUFDZixjQUFBLGlDQUFBO0FBQUEsVUFBQSxTQUFBLEdBQVksS0FBWixDQUFBO0FBQ0E7QUFBQSxlQUFBLDJDQUFBOzhCQUFBO0FBQ0UsWUFBQSxJQUFHLEtBQUMsQ0FBQSxjQUFELENBQWdCLEtBQWhCLEVBQXVCLE1BQXZCLENBQUg7QUFBdUMsY0FBQSxTQUFBLEdBQVksSUFBWixDQUF2Qzth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

//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/vim-mode/lib/operators/increase-operators.coffee
