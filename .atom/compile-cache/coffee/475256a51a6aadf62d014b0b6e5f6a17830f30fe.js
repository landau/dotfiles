(function() {
  var BlockwiseSelection, _, isEmpty, ref, sortRanges, swrap;

  _ = require('underscore-plus');

  ref = require('./utils'), sortRanges = ref.sortRanges, isEmpty = ref.isEmpty;

  swrap = require('./selection-wrapper');

  BlockwiseSelection = (function() {
    BlockwiseSelection.prototype.editor = null;

    BlockwiseSelection.prototype.selections = null;

    BlockwiseSelection.prototype.goalColumn = null;

    BlockwiseSelection.prototype.reversed = false;

    function BlockwiseSelection(selection) {
      var i, len, memberSelection, ref1;
      this.editor = selection.editor;
      this.initialize(selection);
      ref1 = this.getSelections();
      for (i = 0, len = ref1.length; i < len; i++) {
        memberSelection = ref1[i];
        swrap(memberSelection).saveProperties();
        swrap(memberSelection).setWiseProperty('blockwise');
      }
    }

    BlockwiseSelection.prototype.getSelections = function() {
      return this.selections;
    };

    BlockwiseSelection.prototype.isEmpty = function() {
      return this.getSelections().every(isEmpty);
    };

    BlockwiseSelection.prototype.initialize = function(selection) {
      var end, i, j, len, range, ranges, ref1, ref2, results, reversed, start, wasReversed;
      this.goalColumn = selection.cursor.goalColumn;
      this.selections = [selection];
      wasReversed = reversed = selection.isReversed();
      range = selection.getBufferRange();
      if (range.end.column === 0) {
        range.end.row -= 1;
      }
      if (this.goalColumn != null) {
        if (wasReversed) {
          range.start.column = this.goalColumn;
        } else {
          range.end.column = this.goalColumn + 1;
        }
      }
      if (range.start.column >= range.end.column) {
        reversed = !reversed;
        range = range.translate([0, 1], [0, -1]);
      }
      start = range.start, end = range.end;
      ranges = (function() {
        results = [];
        for (var i = ref1 = start.row, ref2 = end.row; ref1 <= ref2 ? i <= ref2 : i >= ref2; ref1 <= ref2 ? i++ : i--){ results.push(i); }
        return results;
      }).apply(this).map(function(row) {
        return [[row, start.column], [row, end.column]];
      });
      selection.setBufferRange(ranges.shift(), {
        reversed: reversed
      });
      for (j = 0, len = ranges.length; j < len; j++) {
        range = ranges[j];
        this.selections.push(this.editor.addSelectionForBufferRange(range, {
          reversed: reversed
        }));
      }
      if (wasReversed) {
        this.reverse();
      }
      return this.updateGoalColumn();
    };

    BlockwiseSelection.prototype.isReversed = function() {
      return this.reversed;
    };

    BlockwiseSelection.prototype.reverse = function() {
      return this.reversed = !this.reversed;
    };

    BlockwiseSelection.prototype.updateGoalColumn = function() {
      var i, len, ref1, results, selection;
      if (this.goalColumn != null) {
        ref1 = this.selections;
        results = [];
        for (i = 0, len = ref1.length; i < len; i++) {
          selection = ref1[i];
          results.push(selection.cursor.goalColumn = this.goalColumn);
        }
        return results;
      }
    };

    BlockwiseSelection.prototype.isSingleRow = function() {
      return this.selections.length === 1;
    };

    BlockwiseSelection.prototype.getHeight = function() {
      var endRow, ref1, startRow;
      ref1 = this.getBufferRowRange(), startRow = ref1[0], endRow = ref1[1];
      return (endRow - startRow) + 1;
    };

    BlockwiseSelection.prototype.getStartSelection = function() {
      return this.selections[0];
    };

    BlockwiseSelection.prototype.getEndSelection = function() {
      return _.last(this.selections);
    };

    BlockwiseSelection.prototype.getHeadSelection = function() {
      if (this.isReversed()) {
        return this.getStartSelection();
      } else {
        return this.getEndSelection();
      }
    };

    BlockwiseSelection.prototype.getTailSelection = function() {
      if (this.isReversed()) {
        return this.getEndSelection();
      } else {
        return this.getStartSelection();
      }
    };

    BlockwiseSelection.prototype.getHeadBufferPosition = function() {
      return this.getHeadSelection().getHeadBufferPosition();
    };

    BlockwiseSelection.prototype.getTailBufferPosition = function() {
      return this.getTailSelection().getTailBufferPosition();
    };

    BlockwiseSelection.prototype.getStartBufferPosition = function() {
      return this.getStartSelection().getBufferRange().start;
    };

    BlockwiseSelection.prototype.getEndBufferPosition = function() {
      return this.getEndSelection().getBufferRange().end;
    };

    BlockwiseSelection.prototype.getBufferRowRange = function() {
      var endRow, startRow;
      startRow = this.getStartSelection().getBufferRowRange()[0];
      endRow = this.getEndSelection().getBufferRowRange()[0];
      return [startRow, endRow];
    };

    BlockwiseSelection.prototype.headReversedStateIsInSync = function() {
      return this.isReversed() === this.getHeadSelection().isReversed();
    };

    BlockwiseSelection.prototype.setSelectedBufferRanges = function(ranges, arg) {
      var i, len, range, reversed;
      reversed = arg.reversed;
      sortRanges(ranges);
      range = ranges.shift();
      this.setHeadBufferRange(range, {
        reversed: reversed
      });
      for (i = 0, len = ranges.length; i < len; i++) {
        range = ranges[i];
        this.selections.push(this.editor.addSelectionForBufferRange(range, {
          reversed: reversed
        }));
      }
      return this.updateGoalColumn();
    };

    BlockwiseSelection.prototype.setPositionForSelections = function(which) {
      var i, len, ref1, results, selection;
      ref1 = this.selections;
      results = [];
      for (i = 0, len = ref1.length; i < len; i++) {
        selection = ref1[i];
        results.push(swrap(selection).setBufferPositionTo(which));
      }
      return results;
    };

    BlockwiseSelection.prototype.clearSelections = function(arg) {
      var except, i, len, ref1, results, selection;
      except = (arg != null ? arg : {}).except;
      ref1 = this.selections.slice();
      results = [];
      for (i = 0, len = ref1.length; i < len; i++) {
        selection = ref1[i];
        if (selection !== except) {
          results.push(this.removeSelection(selection));
        }
      }
      return results;
    };

    BlockwiseSelection.prototype.setHeadBufferPosition = function(point) {
      var head;
      head = this.getHeadSelection();
      this.clearSelections({
        except: head
      });
      return head.cursor.setBufferPosition(point);
    };

    BlockwiseSelection.prototype.removeSelection = function(selection) {
      _.remove(this.selections, selection);
      return selection.destroy();
    };

    BlockwiseSelection.prototype.setHeadBufferRange = function(range, options) {
      var base, goalColumn, head;
      head = this.getHeadSelection();
      this.clearSelections({
        except: head
      });
      goalColumn = head.cursor.goalColumn;
      head.setBufferRange(range, options);
      if (goalColumn != null) {
        return (base = head.cursor).goalColumn != null ? base.goalColumn : base.goalColumn = goalColumn;
      }
    };

    BlockwiseSelection.prototype.getCharacterwiseProperties = function() {
      var end, head, ref1, ref2, start, tail;
      head = this.getHeadBufferPosition();
      tail = this.getTailBufferPosition();
      if (this.isReversed()) {
        ref1 = [head, tail], start = ref1[0], end = ref1[1];
      } else {
        ref2 = [tail, head], start = ref2[0], end = ref2[1];
      }
      if (!(this.isSingleRow() || this.headReversedStateIsInSync())) {
        start.column -= 1;
        end.column += 1;
      }
      return {
        head: head,
        tail: tail
      };
    };

    BlockwiseSelection.prototype.getBufferRange = function() {
      var end, start;
      if (this.headReversedStateIsInSync()) {
        start = this.getStartSelection.getBufferrange().start;
        end = this.getEndSelection.getBufferrange().end;
      } else {
        start = this.getStartSelection.getBufferrange().end.translate([0, -1]);
        end = this.getEndSelection.getBufferrange().start.translate([0, +1]);
      }
      return {
        start: start,
        end: end
      };
    };

    BlockwiseSelection.prototype.restoreCharacterwise = function() {
      var head, properties;
      if (this.isEmpty()) {
        return;
      }
      properties = this.getCharacterwiseProperties();
      head = this.getHeadSelection();
      this.clearSelections({
        except: head
      });
      swrap(head).selectByProperties(properties);
      if (head.getBufferRange().end.column === 0) {
        return swrap(head).translateSelectionEndAndClip('forward');
      }
    };

    BlockwiseSelection.prototype.autoscroll = function(options) {
      return this.getHeadSelection().autoscroll(options);
    };

    BlockwiseSelection.prototype.autoscrollIfReversed = function(options) {
      if (this.isReversed()) {
        return this.autoscroll(options);
      }
    };

    return BlockwiseSelection;

  })();

  module.exports = BlockwiseSelection;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvYmxvY2t3aXNlLXNlbGVjdGlvbi5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVI7O0VBRUosTUFBd0IsT0FBQSxDQUFRLFNBQVIsQ0FBeEIsRUFBQywyQkFBRCxFQUFhOztFQUNiLEtBQUEsR0FBUSxPQUFBLENBQVEscUJBQVI7O0VBRUY7aUNBQ0osTUFBQSxHQUFROztpQ0FDUixVQUFBLEdBQVk7O2lDQUNaLFVBQUEsR0FBWTs7aUNBQ1osUUFBQSxHQUFVOztJQUVHLDRCQUFDLFNBQUQ7QUFDWCxVQUFBO01BQUMsSUFBQyxDQUFBLFNBQVUsVUFBVjtNQUNGLElBQUMsQ0FBQSxVQUFELENBQVksU0FBWjtBQUVBO0FBQUEsV0FBQSxzQ0FBQTs7UUFDRSxLQUFBLENBQU0sZUFBTixDQUFzQixDQUFDLGNBQXZCLENBQUE7UUFDQSxLQUFBLENBQU0sZUFBTixDQUFzQixDQUFDLGVBQXZCLENBQXVDLFdBQXZDO0FBRkY7SUFKVzs7aUNBUWIsYUFBQSxHQUFlLFNBQUE7YUFDYixJQUFDLENBQUE7SUFEWTs7aUNBR2YsT0FBQSxHQUFTLFNBQUE7YUFDUCxJQUFDLENBQUEsYUFBRCxDQUFBLENBQWdCLENBQUMsS0FBakIsQ0FBdUIsT0FBdkI7SUFETzs7aUNBR1QsVUFBQSxHQUFZLFNBQUMsU0FBRDtBQUNWLFVBQUE7TUFBQyxJQUFDLENBQUEsYUFBYyxTQUFTLENBQUMsT0FBeEI7TUFDRixJQUFDLENBQUEsVUFBRCxHQUFjLENBQUMsU0FBRDtNQUNkLFdBQUEsR0FBYyxRQUFBLEdBQVcsU0FBUyxDQUFDLFVBQVYsQ0FBQTtNQUV6QixLQUFBLEdBQVEsU0FBUyxDQUFDLGNBQVYsQ0FBQTtNQUNSLElBQUcsS0FBSyxDQUFDLEdB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QixVQUFBO01BQUEsSUFBVSxJQUFDLENBQUEsT0FBRCxDQUFBLENBQVY7QUFBQSxlQUFBOztNQUVBLFVBQUEsR0FBYSxJQUFDLENBQUEsMEJBQUQsQ0FBQTtNQUNiLElBQUEsR0FBTyxJQUFDLENBQUEsZ0JBQUQsQ0FBQTtNQUNQLElBQUMsQ0FBQSxlQUFELENBQWlCO1FBQUEsTUFBQSxFQUFRLElBQVI7T0FBakI7TUFDQSxLQUFBLENBQU0sSUFBTixDQUFXLENBQUMsa0JBQVosQ0FBK0IsVUFBL0I7TUFDQSxJQUFHLElBQUksQ0FBQyxjQUFMLENBQUEsQ0FBcUIsQ0FBQyxHQUFHLENBQUMsTUFBMUIsS0FBb0MsQ0FBdkM7ZUFDRSxLQUFBLENBQU0sSUFBTixDQUFXLENBQUMsNEJBQVosQ0FBeUMsU0FBekMsRUFERjs7SUFUb0I7O2lDQVl0QixVQUFBLEdBQVksU0FBQyxPQUFEO2FBQ1YsSUFBQyxDQUFBLGdCQUFELENBQUEsQ0FBbUIsQ0FBQyxVQUFwQixDQUErQixPQUEvQjtJQURVOztpQ0FHWixvQkFBQSxHQUFzQixTQUFDLE9BQUQ7TUFHcEIsSUFBd0IsSUFBQyxDQUFBLFVBQUQsQ0FBQSxDQUF4QjtlQUFBLElBQUMsQ0FBQSxVQUFELENBQVksT0FBWixFQUFBOztJQUhvQjs7Ozs7O0VBS3hCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCO0FBak1qQiIsInNvdXJjZXNDb250ZW50IjpbIl8gPSByZXF1aXJlICd1bmRlcnNjb3JlLXBsdXMnXG5cbntzb3J0UmFuZ2VzLCBpc0VtcHR5fSA9IHJlcXVpcmUgJy4vdXRpbHMnXG5zd3JhcCA9IHJlcXVpcmUgJy4vc2VsZWN0aW9uLXdyYXBwZXInXG5cbmNsYXNzIEJsb2Nrd2lzZVNlbGVjdGlvblxuICBlZGl0b3I6IG51bGxcbiAgc2VsZWN0aW9uczogbnVsbFxuICBnb2FsQ29sdW1uOiBudWxsXG4gIHJldmVyc2VkOiBmYWxzZVxuXG4gIGNvbnN0cnVjdG9yOiAoc2VsZWN0aW9uKSAtPlxuICAgIHtAZWRpdG9yfSA9IHNlbGVjdGlvblxuICAgIEBpbml0aWFsaXplKHNlbGVjdGlvbilcblxuICAgIGZvciBtZW1iZXJTZWxlY3Rpb24gaW4gQGdldFNlbGVjdGlvbnMoKVxuICAgICAgc3dyYXAobWVtYmVyU2VsZWN0aW9uKS5zYXZlUHJvcGVydGllcygpXG4gICAgICBzd3JhcChtZW1iZXJTZWxlY3Rpb24pLnNldFdpc2VQcm9wZXJ0eSgnYmxvY2t3aXNlJylcblxuICBnZXRTZWxlY3Rpb25zOiAtPlxuICAgIEBzZWxlY3Rpb25zXG5cbiAgaXNFbXB0eTogLT5cbiAgICBAZ2V0U2VsZWN0aW9ucygpLmV2ZXJ5KGlzRW1wdHkpXG5cbiAgaW5pdGlhbGl6ZTogKHNlbGVjdGlvbikgLT5cbiAgICB7QGdvYWxDb2x1bW59ID0gc2VsZWN0aW9uLmN1cnNvclxuICAgIEBzZWxlY3Rpb25zID0gW3NlbGVjdGlvbl1cbiAgICB3YXNSZXZlcnNlZCA9IHJldmVyc2VkID0gc2VsZWN0aW9uLmlzUmV2ZXJzZWQoKVxuXG4gICAgcmFuZ2UgPSBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKVxuICAgIGlmIHJhbmdlLmVuZC5jb2x1bW4gaXMgMFxuICAgICAgcmFuZ2UuZW5kLnJvdyAtPSAxXG5cbiAgICBpZiBAZ29hbENvbHVtbj9cbiAgICAgIGlmIHdhc1JldmVyc2VkXG4gICAgICAgIHJhbmdlLnN0YXJ0LmNvbHVtbiA9IEBnb2FsQ29sdW1uXG4gICAgICBlbHNlXG4gICAgICAgIHJhbmdlLmVuZC5jb2x1bW4gPSBAZ29hbENvbHVtbiArIDFcblxuICAgIGlmIHJhbmdlLnN0YXJ0LmNvbHVtbiA+PSByYW5nZS5lbmQuY29sdW1uXG4gICAgICByZXZlcnNlZCA9IG5vdCByZXZlcnNlZFxuICAgICAgcmFuZ2UgPSByYW5nZS50cmFuc2xhdGUoWzAsIDFdLCBbMCwgLTFdKVxuXG4gICAge3N0YXJ0LCBlbmR9ID0gcmFuZ2VcbiAgICByYW5nZXMgPSBbc3RhcnQucm93Li5lbmQucm93XS5tYXAgKHJvdykgLT5cbiAgICAgIFtbcm93LCBzdGFydC5jb2x1bW5dLCBbcm93LCBlbmQuY29sdW1uXV1cblxuICAgIHNlbGVjdGlvbi5zZXRCdWZmZXJSYW5nZShyYW5nZXMuc2hpZnQoKSwge3JldmVyc2VkfSlcbiAgICBmb3IgcmFuZ2UgaW4gcmFuZ2VzXG4gICAgICBAc2VsZWN0aW9ucy5wdXNoKEBlZGl0b3IuYWRkU2VsZWN0aW9uRm9yQnVmZmVyUmFuZ2UocmFuZ2UsIHtyZXZlcnNlZH0pKVxuICAgIEByZXZlcnNlKCkgaWYgd2FzUmV2ZXJzZWRcbiAgICBAdXBkYXRlR29hbENvbHVtbigpXG5cbiAgaXNSZXZlcnNlZDogLT5cbiAgICBAcmV2ZXJzZWRcblxuICByZXZlcnNlOiAtPlxuICAgIEByZXZlcnNlZCA9IG5vdCBAcmV2ZXJzZWRcblxuICB1cGRhdGVHb2FsQ29sdW1uOiAtPlxuICAgIGlmIEBnb2FsQ29sdW1uP1xuICAgICAgZm9yIHNlbGVjdGlvbiBpbiBAc2VsZWN0aW9uc1xuICAgICAgICBzZWxlY3Rpb24uY3Vyc29yLmdvYWxDb2x1bW4gPSBAZ29hbENvbHVtblxuXG4gIGlzU2luZ2xlUm93OiAtPlxuICAgIEBzZWxlY3Rpb25zLmxlbmd0aCBpcyAxXG5cbiAgZ2V0SGVpZ2h0OiAtPlxuICAgIFtzdGFydFJvdywgZW5kUm93XSA9IEBnZXRCdWZmZXJSb3dSYW5nZSgpXG4gICAgKGVuZFJvdyAtIHN0YXJ0Um93KSArIDFcblxuICBnZXRTdGFydFNlbGVjdGlvbjogLT5cbiAgICBAc2VsZWN0aW9uc1swXVxuXG4gIGdldEVuZFNlbGVjdGlvbjogLT5cbiAgICBfLmxhc3QoQHNlbGVjdGlvbnMpXG5cbiAgZ2V0SGVhZFNlbGVjdGlvbjogLT5cbiAgICBpZiBAaXNSZXZlcnNlZCgpXG4gICAgICBAZ2V0U3RhcnRTZWxlY3Rpb24oKVxuICAgIGVsc2VcbiAgICAgIEBnZXRFbmRTZWxlY3Rpb24oKVxuXG4gIGdldFRhaWxTZWxlY3Rpb246IC0+XG4gICAgaWYgQGlzUmV2ZXJzZWQoKVxuICAgICAgQGdldEVuZFNlbGVjdGlvbigpXG4gICAgZWxzZVxuICAgICAgQGdldFN0YXJ0U2VsZWN0aW9uKClcblxuICBnZXRIZWFkQnVmZmVyUG9zaXRpb246IC0+XG4gICAgQGdldEhlYWRTZWxlY3Rpb24oKS5nZXRIZWFkQnVmZmVyUG9zaXRpb24oKVxuXG4gIGdldFRhaWxCdWZmZXJQb3NpdGlvbjogLT5cbiAgICBAZ2V0VGFpbFNlbGVjdGlvbigpLmdldFRhaWxCdWZmZXJQb3NpdGlvbigpXG5cbiAgZ2V0U3RhcnRCdWZmZXJQb3NpdGlvbjogLT5cbiAgICBAZ2V0U3RhcnRTZWxlY3Rpb24oKS5nZXRCdWZmZXJSYW5nZSgpLnN0YXJ0XG5cbiAgZ2V0RW5kQnVmZmVyUG9zaXRpb246IC0+XG4gICAgQGdldEVuZFNlbGVjdGlvbigpLmdldEJ1ZmZlclJhbmdlKCkuZW5kXG5cbiAgZ2V0QnVmZmVyUm93UmFuZ2U6IC0+XG4gICAgc3RhcnRSb3cgPSBAZ2V0U3RhcnRTZWxlY3Rpb24oKS5nZXRCdWZmZXJSb3dSYW5nZSgpWzBdXG4gICAgZW5kUm93ID0gQGdldEVuZFNlbGVjdGlvbigpLmdldEJ1ZmZlclJvd1JhbmdlKClbMF1cbiAgICBbc3RhcnRSb3csIGVuZFJvd11cblxuICBoZWFkUmV2ZXJzZWRTdGF0ZUlzSW5TeW5jOiAtPlxuICAgIEBpc1JldmVyc2VkKCkgaXMgQGdldEhlYWRTZWxlY3Rpb24oKS5pc1JldmVyc2VkKClcblxuICAjIFtOT1RFXSBVc2VkIGJ5IHBsdWdpbiBwYWNrYWdlIHZtcDptb3ZlLXNlbGVjdGVkLXRleHRcbiAgc2V0U2VsZWN0ZWRCdWZmZXJSYW5nZXM6IChyYW5nZXMsIHtyZXZlcnNlZH0pIC0+XG4gICAgc29ydFJhbmdlcyhyYW5nZXMpXG4gICAgcmFuZ2UgPSByYW5nZXMuc2hpZnQoKVxuICAgIEBzZXRIZWFkQnVmZmVyUmFuZ2UocmFuZ2UsIHtyZXZlcnNlZH0pXG4gICAgZm9yIHJhbmdlIGluIHJhbmdlc1xuICAgICAgQHNlbGVjdGlvbnMucHVzaCBAZWRpdG9yLmFkZFNlbGVjdGlvbkZvckJ1ZmZlclJhbmdlKHJhbmdlLCB7cmV2ZXJzZWR9KVxuICAgIEB1cGRhdGVHb2FsQ29sdW1uKClcblxuICAjIHdoaWNoIG11c3Qgb25lIG9mIFsnc3RhcnQnLCAnZW5kJywgJ2hlYWQnLCAndGFpbCddXG4gIHNldFBvc2l0aW9uRm9yU2VsZWN0aW9uczogKHdoaWNoKSAtPlxuICAgIGZvciBzZWxlY3Rpb24gaW4gQHNlbGVjdGlvbnNcbiAgICAgIHN3cmFwKHNlbGVjdGlvbikuc2V0QnVmZmVyUG9zaXRpb25Ubyh3aGljaClcblxuICBjbGVhclNlbGVjdGlvbnM6ICh7ZXhjZXB0fT17fSkgLT5cbiAgICBmb3Igc2VsZWN0aW9uIGluIEBzZWxlY3Rpb25zLnNsaWNlKCkgd2hlbiAoc2VsZWN0aW9uIGlzbnQgZXhjZXB0KVxuICAgICAgQHJlbW92ZVNlbGVjdGlvbihzZWxlY3Rpb24pXG5cbiAgc2V0SGVhZEJ1ZmZlclBvc2l0aW9uOiAocG9pbnQpIC0+XG4gICAgaGVhZCA9IEBnZXRIZWFkU2VsZWN0aW9uKClcbiAgICBAY2xlYXJTZWxlY3Rpb25zKGV4Y2VwdDogaGVhZClcbiAgICBoZWFkLmN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihwb2ludClcblxuICByZW1vdmVTZWxlY3Rpb246IChzZWxlY3Rpb24pIC0+XG4gICAgXy5yZW1vdmUoQHNlbGVjdGlvbnMsIHNlbGVjdGlvbilcbiAgICBzZWxlY3Rpb24uZGVzdHJveSgpXG5cbiAgc2V0SGVhZEJ1ZmZlclJhbmdlOiAocmFuZ2UsIG9wdGlvbnMpIC0+XG4gICAgaGVhZCA9IEBnZXRIZWFkU2VsZWN0aW9uKClcbiAgICBAY2xlYXJTZWxlY3Rpb25zKGV4Y2VwdDogaGVhZClcbiAgICB7Z29hbENvbHVtbn0gPSBoZWFkLmN1cnNvclxuICAgICMgV2hlbiByZXZlcnNlZCBzdGF0ZSBvZiBzZWxlY3Rpb24gY2hhbmdlLCBnb2FsQ29sdW1uIGlzIGNsZWFyZWQuXG4gICAgIyBCdXQgaGVyZSBmb3IgYmxvY2t3aXNlLCBJIHdhbnQgdG8ga2VlcCBnb2FsQ29sdW1uIHVuY2hhbmdlZC5cbiAgICAjIFRoaXMgYmVoYXZpb3IgaXMgbm90IGlkZW50aWNhbCB0byBwdXJlIFZpbSBJIGtub3cuXG4gICAgIyBCdXQgSSBiZWxpZXZlIHRoaXMgaXMgbW9yZSB1bm5vaXN5IGFuZCBsZXNzIGNvbmZ1c2lvbiB3aGlsZSBtb3ZpbmdcbiAgICAjIGN1cnNvciBpbiB2aXN1YWwtYmxvY2sgbW9kZS5cbiAgICBoZWFkLnNldEJ1ZmZlclJhbmdlKHJhbmdlLCBvcHRpb25zKVxuICAgIGhlYWQuY3Vyc29yLmdvYWxDb2x1bW4gPz0gZ29hbENvbHVtbiBpZiBnb2FsQ29sdW1uP1xuXG4gIGdldENoYXJhY3Rlcndpc2VQcm9wZXJ0aWVzOiAtPlxuICAgIGhlYWQgPSBAZ2V0SGVhZEJ1ZmZlclBvc2l0aW9uKClcbiAgICB0YWlsID0gQGdldFRhaWxCdWZmZXJQb3NpdGlvbigpXG5cbiAgICBpZiBAaXNSZXZlcnNlZCgpXG4gICAgICBbc3RhcnQsIGVuZF0gPSBbaGVhZCwgdGFpbF1cbiAgICBlbHNlXG4gICAgICBbc3RhcnQsIGVuZF0gPSBbdGFpbCwgaGVhZF1cblxuICAgIHVubGVzcyAoQGlzU2luZ2xlUm93KCkgb3IgQGhlYWRSZXZlcnNlZFN0YXRlSXNJblN5bmMoKSlcbiAgICAgIHN0YXJ0LmNvbHVtbiAtPSAxXG4gICAgICBlbmQuY29sdW1uICs9IDFcbiAgICB7aGVhZCwgdGFpbH1cblxuICBnZXRCdWZmZXJSYW5nZTogLT5cbiAgICBpZiBAaGVhZFJldmVyc2VkU3RhdGVJc0luU3luYygpXG4gICAgICBzdGFydCA9IEBnZXRTdGFydFNlbGVjdGlvbi5nZXRCdWZmZXJyYW5nZSgpLnN0YXJ0XG4gICAgICBlbmQgPSBAZ2V0RW5kU2VsZWN0aW9uLmdldEJ1ZmZlcnJhbmdlKCkuZW5kXG4gICAgZWxzZVxuICAgICAgc3RhcnQgPSBAZ2V0U3RhcnRTZWxlY3Rpb24uZ2V0QnVmZmVycmFuZ2UoKS5lbmQudHJhbnNsYXRlKFswLCAtMV0pXG4gICAgICBlbmQgPSBAZ2V0RW5kU2VsZWN0aW9uLmdldEJ1ZmZlcnJhbmdlKCkuc3RhcnQudHJhbnNsYXRlKFswLCArMV0pXG4gICAge3N0YXJ0LCBlbmR9XG5cbiAgIyBbRklYTUVdIGR1cGxpY2F0ZSBjb2RlcyB3aXRoIHNldEhlYWRCdWZmZXJSYW5nZVxuICByZXN0b3JlQ2hhcmFjdGVyd2lzZTogLT5cbiAgICAjIFdoZW4gYWxsIHNlbGVjdGlvbiBpcyBlbXB0eSwgd2UgZG9uJ3Qgd2FudCB0byBsb29zZSBtdWx0aS1jdXJzb3JcbiAgICAjIGJ5IHJlc3RvcmVpbmcgY2hhcmFjdGVyd2lzZSByYW5nZS5cbiAgICByZXR1cm4gaWYgQGlzRW1wdHkoKVxuXG4gICAgcHJvcGVydGllcyA9IEBnZXRDaGFyYWN0ZXJ3aXNlUHJvcGVydGllcygpXG4gICAgaGVhZCA9IEBnZXRIZWFkU2VsZWN0aW9uKClcbiAgICBAY2xlYXJTZWxlY3Rpb25zKGV4Y2VwdDogaGVhZClcbiAgICBzd3JhcChoZWFkKS5zZWxlY3RCeVByb3BlcnRpZXMocHJvcGVydGllcylcbiAgICBpZiBoZWFkLmdldEJ1ZmZlclJhbmdlKCkuZW5kLmNvbHVtbiBpcyAwXG4gICAgICBzd3JhcChoZWFkKS50cmFuc2xhdGVTZWxlY3Rpb25FbmRBbmRDbGlwKCdmb3J3YXJkJylcblxuICBhdXRvc2Nyb2xsOiAob3B0aW9ucykgLT5cbiAgICBAZ2V0SGVhZFNlbGVjdGlvbigpLmF1dG9zY3JvbGwob3B0aW9ucylcblxuICBhdXRvc2Nyb2xsSWZSZXZlcnNlZDogKG9wdGlvbnMpIC0+XG4gICAgIyBTZWUgIzU0NiBjdXJzb3Igb3V0LW9mLXNjcmVlbiBpc3N1ZSBoYXBwZW5zIG9ubHkgaW4gcmV2ZXJzZWQuXG4gICAgIyBTbyBza2lwIGhlcmUgZm9yIHBlcmZvcm1hbmNlKGJ1dCBkb24ndCBrbm93IGlmIGl0J3Mgd29ydGgpXG4gICAgQGF1dG9zY3JvbGwob3B0aW9ucykgaWYgQGlzUmV2ZXJzZWQoKVxuXG5tb2R1bGUuZXhwb3J0cyA9IEJsb2Nrd2lzZVNlbGVjdGlvblxuIl19
