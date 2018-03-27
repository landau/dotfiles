(function() {
  var Find, MotionWithInput, Point, Range, Till, ViewModel, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  MotionWithInput = require('./general-motions').MotionWithInput;

  ViewModel = require('../view-models/view-model').ViewModel;

  _ref = require('atom'), Point = _ref.Point, Range = _ref.Range;

  Find = (function(_super) {
    __extends(Find, _super);

    Find.prototype.operatesInclusively = true;

    function Find(editor, vimState, opts) {
      var orig;
      this.editor = editor;
      this.vimState = vimState;
      if (opts == null) {
        opts = {};
      }
      Find.__super__.constructor.call(this, this.editor, this.vimState);
      this.offset = 0;
      if (!opts.repeated) {
        this.viewModel = new ViewModel(this, {
          "class": 'find',
          singleChar: true,
          hidden: true
        });
        this.backwards = false;
        this.repeated = false;
        this.vimState.globalVimState.currentFind = this;
      } else {
        this.repeated = true;
        orig = this.vimState.globalVimState.currentFind;
        this.backwards = orig.backwards;
        this.complete = orig.complete;
        this.input = orig.input;
        if (opts.reverse) {
          this.reverse();
        }
      }
    }

    Find.prototype.match = function(cursor, count) {
      var currentPosition, i, index, line, _i, _j, _ref1, _ref2;
      currentPosition = cursor.getBufferPosition();
      line = this.editor.lineTextForBufferRow(currentPosition.row);
      if (this.backwards) {
        index = currentPosition.column;
        for (i = _i = 0, _ref1 = count - 1; 0 <= _ref1 ? _i <= _ref1 : _i >= _ref1; i = 0 <= _ref1 ? ++_i : --_i) {
          if (index <= 0) {
            return;
          }
          index = line.lastIndexOf(this.input.characters, index - 1 - (this.offset * this.repeated));
        }
        if (index >= 0) {
          return new Point(currentPosition.row, index + this.offset);
        }
      } else {
        index = currentPosition.column;
        for (i = _j = 0, _ref2 = count - 1; 0 <= _ref2 ? _j <= _ref2 : _j >= _ref2; i = 0 <= _ref2 ? ++_j : --_j) {
          index = line.indexOf(this.input.characters, index + 1 + (this.offset * this.repeated));
          if (index < 0) {
            return;
          }
        }
        if (index >= 0) {
          return new Point(currentPosition.row, index - this.offset);
        }
      }
    };

    Find.prototype.reverse = function() {
      this.backwards = !this.backwards;
      return this;
    };

    Find.prototype.moveCursor = function(cursor, count) {
      var match;
      if (count == null) {
        count = 1;
      }
      if ((match = this.match(cursor, count)) != null) {
        return cursor.setBufferPosition(match);
      }
    };

    return Find;

  })(MotionWithInput);

  Till = (function(_super) {
    __extends(Till, _super);

    function Till(editor, vimState, opts) {
      this.editor = editor;
      this.vimState = vimState;
      if (opts == null) {
        opts = {};
      }
      Till.__super__.constructor.call(this, this.editor, this.vimState, opts);
      this.offset = 1;
    }

    Till.prototype.match = function() {
      var retval;
      this.selectAtLeastOne = false;
      retval = Till.__super__.match.apply(this, arguments);
      if ((retval != null) && !this.backwards) {
        this.selectAtLeastOne = true;
      }
      return retval;
    };

    Till.prototype.moveSelectionInclusively = function(selection, count, options) {
      Till.__super__.moveSelectionInclusively.apply(this, arguments);
      if (selection.isEmpty() && this.selectAtLeastOne) {
        return selection.modifySelection(function() {
          return selection.cursor.moveRight();
        });
      }
    };

    return Till;

  })(Find);

  module.exports = {
    Find: Find,
    Till: Till
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUvbGliL21vdGlvbnMvZmluZC1tb3Rpb24uY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDBEQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQyxrQkFBbUIsT0FBQSxDQUFRLG1CQUFSLEVBQW5CLGVBQUQsQ0FBQTs7QUFBQSxFQUNDLFlBQWEsT0FBQSxDQUFRLDJCQUFSLEVBQWIsU0FERCxDQUFBOztBQUFBLEVBRUEsT0FBaUIsT0FBQSxDQUFRLE1BQVIsQ0FBakIsRUFBQyxhQUFBLEtBQUQsRUFBUSxhQUFBLEtBRlIsQ0FBQTs7QUFBQSxFQUlNO0FBQ0osMkJBQUEsQ0FBQTs7QUFBQSxtQkFBQSxtQkFBQSxHQUFxQixJQUFyQixDQUFBOztBQUVhLElBQUEsY0FBRSxNQUFGLEVBQVcsUUFBWCxFQUFxQixJQUFyQixHQUFBO0FBQ1gsVUFBQSxJQUFBO0FBQUEsTUFEWSxJQUFDLENBQUEsU0FBQSxNQUNiLENBQUE7QUFBQSxNQURxQixJQUFDLENBQUEsV0FBQSxRQUN0QixDQUFBOztRQURnQyxPQUFLO09BQ3JDO0FBQUEsTUFBQSxzQ0FBTSxJQUFDLENBQUEsTUFBUCxFQUFlLElBQUMsQ0FBQSxRQUFoQixDQUFBLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxNQUFELEdBQVUsQ0FEVixDQUFBO0FBR0EsTUFBQSxJQUFHLENBQUEsSUFBUSxDQUFDLFFBQVo7QUFDRSxRQUFBLElBQUMsQ0FBQSxTQUFELEdBQWlCLElBQUEsU0FBQSxDQUFVLElBQVYsRUFBZ0I7QUFBQSxVQUFBLE9BQUEsRUFBTyxNQUFQO0FBQUEsVUFBZSxVQUFBLEVBQVksSUFBM0I7QUFBQSxVQUFpQyxNQUFBLEVBQVEsSUFBekM7U0FBaEIsQ0FBakIsQ0FBQTtBQUFBLFFB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

//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/vim-mode/lib/motions/find-motion.coffee
