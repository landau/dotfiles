(function() {
  var BlockwiseSelection, _, assertWithException, ref, sortRanges, swrap, trimRange;

  _ = require('underscore-plus');

  ref = require('./utils'), sortRanges = ref.sortRanges, assertWithException = ref.assertWithException, trimRange = ref.trimRange;

  swrap = require('./selection-wrapper');

  BlockwiseSelection = (function() {
    BlockwiseSelection.prototype.editor = null;

    BlockwiseSelection.prototype.selections = null;

    BlockwiseSelection.prototype.goalColumn = null;

    BlockwiseSelection.prototype.reversed = false;

    BlockwiseSelection.blockwiseSelectionsByEditor = new Map();

    BlockwiseSelection.clearSelections = function(editor) {
      return this.blockwiseSelectionsByEditor["delete"](editor);
    };

    BlockwiseSelection.has = function(editor) {
      return this.blockwiseSelectionsByEditor.has(editor);
    };

    BlockwiseSelection.getSelections = function(editor) {
      var ref1;
      return (ref1 = this.blockwiseSelectionsByEditor.get(editor)) != null ? ref1 : [];
    };

    BlockwiseSelection.getSelectionsOrderedByBufferPosition = function(editor) {
      return this.getSelections(editor).sort(function(a, b) {
        return a.getStartSelection().compare(b.getStartSelection());
      });
    };

    BlockwiseSelection.getLastSelection = function(editor) {
      return _.last(this.blockwiseSelectionsByEditor.get(editor));
    };

    BlockwiseSelection.saveSelection = function(blockwiseSelection) {
      var editor;
      editor = blockwiseSelection.editor;
      if (!this.has(editor)) {
        this.blockwiseSelectionsByEditor.set(editor, []);
      }
      return this.blockwiseSelectionsByEditor.get(editor).push(blockwiseSelection);
    };

    function BlockwiseSelection(selection) {
      var $memberSelection, $selection, end, endColumn, headColumn, i, j, k, len, len1, memberReversed, memberSelection, range, ranges, ref1, ref2, ref3, ref4, ref5, ref6, results, start, startColumn, tailColumn;
      assertWithException(swrap(selection).hasProperties(), "Trying to instantiate vB from properties-less selection");
      this.needSkipNormalization = false;
      this.properties = {};
      this.editor = selection.editor;
      $selection = swrap(selection);
      this.goalColumn = selection.cursor.goalColumn;
      this.reversed = memberReversed = selection.isReversed();
      ref1 = $selection.getProperties(), (ref2 = ref1.head, headColumn = ref2.column), (ref3 = ref1.tail, tailColumn = ref3.column);
      start = $selection.getBufferPositionFor('start', {
        from: ['property']
      });
      end = $selection.getBufferPositionFor('end', {
        from: ['property']
      });
      if ((this.goalColumn === 2e308) && headColumn >= tailColumn) {
        if (selection.isReversed()) {
          start.column = this.goalColumn;
        } else {
          end.column = this.goalColumn;
        }
      }
      if (start.column > end.column) {
        memberReversed = !memberReversed;
        startColumn = end.column;
        endColumn = start.column + 1;
      } else {
        startColumn = start.column;
        endColumn = end.column + 1;
      }
      ranges = (function() {
        results = [];
        for (var i = ref4 = start.row, ref5 = end.row; ref4 <= ref5 ? i <= ref5 : i >= ref5; ref4 <= ref5 ? i++ : i--){ results.push(i); }
        return results;
      }).apply(this).map(function(row) {
        return [[row, startColumn], [row, endColumn]];
      });
      selection.setBufferRange(ranges.shift(), {
        reversed: memberReversed
      });
      this.selections = [selection];
      for (j = 0, len = ranges.length; j < len; j++) {
        range = ranges[j];
        this.selections.push(this.editor.addSelectionForBufferRange(range, {
          reversed: memberReversed
        }));
      }
      this.updateGoalColumn();
      ref6 = this.getSelections();
      for (k = 0, len1 = ref6.length; k < len1; k++) {
        memberSelection = ref6[k];
        if (!($memberSelection = swrap(memberSelection))) {
          continue;
        }
        $memberSelection.saveProperties();
        $memberSelection.getProperties().head.column = headColumn;
        $memberSelection.getProperties().tail.column = tailColumn;
      }
      this.constructor.saveSelection(this);
    }

    BlockwiseSelection.prototype.getSelections = function() {
      return this.selections;
    };

    BlockwiseSelection.prototype.extendMemberSelectionsToEndOfLine = function() {
      var end, i, len, ref1, ref2, results, selection, start;
      ref1 = this.getSelections();
      results = [];
      for (i = 0, len = ref1.length; i < len; i++) {
        selection = ref1[i];
        ref2 = selection.getBufferRange(), start = ref2.start, end = ref2.end;
        end.column = 2e308;
        results.push(selection.setBufferRange([start, end]));
      }
      return results;
    };

    BlockwiseSelection.prototype.expandMemberSelectionsOverLineWithTrimRange = function() {
      var i, len, range, ref1, results, selection, start;
      ref1 = this.getSelections();
      results = [];
      for (i = 0, len = ref1.length; i < len; i++) {
        selection = ref1[i];
        start = selection.getBufferRange().start;
        range = trimRange(this.editor, this.editor.bufferRangeForBufferRow(start.row));
        results.push(selection.setBufferRange(range));
      }
      return results;
    };

    BlockwiseSelection.prototype.isReversed = function() {
      return this.reversed;
    };

    BlockwiseSelection.prototype.reverse = function() {
      return this.reversed = !this.reversed;
    };

    BlockwiseSelection.prototype.getProperties = function() {
      return {
        head: swrap(this.getHeadSelection()).getProperties().head,
        tail: swrap(this.getTailSelection()).getProperties().tail
      };
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

    BlockwiseSelection.prototype.getBufferRowRange = function() {
      var endRow, startRow;
      startRow = this.getStartSelection().getBufferRowRange()[0];
      endRow = this.getEndSelection().getBufferRowRange()[0];
      return [startRow, endRow];
    };

    BlockwiseSelection.prototype.setSelectedBufferRanges = function(ranges, arg) {
      var base, goalColumn, head, i, len, range, reversed;
      reversed = arg.reversed;
      sortRanges(ranges);
      range = ranges.shift();
      head = this.getHeadSelection();
      this.removeSelections({
        except: head
      });
      goalColumn = head.cursor.goalColumn;
      head.setBufferRange(range, {
        reversed: reversed
      });
      if (goalColumn != null) {
        if ((base = head.cursor).goalColumn == null) {
          base.goalColumn = goalColumn;
        }
      }
      for (i = 0, len = ranges.length; i < len; i++) {
        range = ranges[i];
        this.selections.push(this.editor.addSelectionForBufferRange(range, {
          reversed: reversed
        }));
      }
      return this.updateGoalColumn();
    };

    BlockwiseSelection.prototype.removeSelections = function(arg) {
      var except, i, len, ref1, results, selection;
      except = (arg != null ? arg : {}).except;
      ref1 = this.selections.slice();
      results = [];
      for (i = 0, len = ref1.length; i < len; i++) {
        selection = ref1[i];
        if (!(selection !== except)) {
          continue;
        }
        swrap(selection).clearProperties();
        _.remove(this.selections, selection);
        results.push(selection.destroy());
      }
      return results;
    };

    BlockwiseSelection.prototype.setHeadBufferPosition = function(point) {
      var head;
      head = this.getHeadSelection();
      this.removeSelections({
        except: head
      });
      return head.cursor.setBufferPosition(point);
    };

    BlockwiseSelection.prototype.skipNormalization = function() {
      return this.needSkipNormalization = true;
    };

    BlockwiseSelection.prototype.normalize = function() {
      var $selection, base, goalColumn, head, properties;
      if (this.needSkipNormalization) {
        return;
      }
      properties = this.getProperties();
      head = this.getHeadSelection();
      this.removeSelections({
        except: head
      });
      goalColumn = head.cursor.goalColumn;
      $selection = swrap(head);
      $selection.selectByProperties(properties);
      $selection.saveProperties(true);
      if (goalColumn) {
        return (base = head.cursor).goalColumn != null ? base.goalColumn : base.goalColumn = goalColumn;
      }
    };

    BlockwiseSelection.prototype.autoscroll = function() {
      return this.getHeadSelection().autoscroll();
    };

    return BlockwiseSelection;

  })();

  module.exports = BlockwiseSelection;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvYmxvY2t3aXNlLXNlbGVjdGlvbi5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVI7O0VBRUosTUFBK0MsT0FBQSxDQUFRLFNBQVIsQ0FBL0MsRUFBQywyQkFBRCxFQUFhLDZDQUFiLEVBQWtDOztFQUNsQyxLQUFBLEdBQVEsT0FBQSxDQUFRLHFCQUFSOztFQUVGO2lDQUNKLE1BQUEsR0FBUTs7aUNBQ1IsVUFBQSxHQUFZOztpQ0FDWixVQUFBLEdBQVk7O2lDQUNaLFFBQUEsR0FBVTs7SUFFVixrQkFBQyxDQUFBLDJCQUFELEdBQW1DLElBQUEsR0FBQSxDQUFBOztJQUVuQyxrQkFBQyxDQUFBLGVBQUQsR0FBa0IsU0FBQyxNQUFEO2FBQ2hCLElBQUMsQ0FBQSwyQkFBMkIsRUFBQyxNQUFELEVBQTVCLENBQW9DLE1BQXBDO0lBRGdCOztJQUdsQixrQkFBQyxDQUFBLEdBQUQsR0FBTSxTQUFDLE1BQUQ7YUFDSixJQUFDLENBQUEsMkJBQTJCLENBQUMsR0FBN0IsQ0FBaUMsTUFBakM7SUFESTs7SUFHTixrQkFBQyxDQUFBLGFBQUQsR0FBZ0IsU0FBQyxNQUFEO0FBQ2QsVUFBQTtvRkFBMkM7SUFEN0I7O0lBR2hCLGtCQUFDLENBQUEsb0NBQUQsR0FBdUMsU0FBQyxNQUFEO2FBQ3JDLElBQUMsQ0FBQSxhQUFELENBQWUsTUFBZixDQUFzQixDQUFDLElBQXZCLENBQTRCLFNBQUMsQ0FBRCxFQUFJLENBQUo7ZUFDMUIsQ0FBQyxDQUFDLGlCQUFGLENBQUEsQ0FBcUIsQ0FBQyxPQUF0QixDQUE4QixDQUFDLENBQUMsaUJBQUYsQ0FBQSxDQUE5QjtNQUQwQixDQUE1QjtJQURxQzs7SUFJdkMsa0JBQUMsQ0FBQSxnQkFBRCxHQUFt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SUFEZ0I7O2lDQU1sQixxQkFBQSxHQUF1QixTQUFDLEtBQUQ7QUFDckIsVUFBQTtNQUFBLElBQUEsR0FBTyxJQUFDLENBQUEsZ0JBQUQsQ0FBQTtNQUNQLElBQUMsQ0FBQSxnQkFBRCxDQUFrQjtRQUFBLE1BQUEsRUFBUSxJQUFSO09BQWxCO2FBQ0EsSUFBSSxDQUFDLE1BQU0sQ0FBQyxpQkFBWixDQUE4QixLQUE5QjtJQUhxQjs7aUNBS3ZCLGlCQUFBLEdBQW1CLFNBQUE7YUFDakIsSUFBQyxDQUFBLHFCQUFELEdBQXlCO0lBRFI7O2lDQUduQixTQUFBLEdBQVcsU0FBQTtBQUNULFVBQUE7TUFBQSxJQUFVLElBQUMsQ0FBQSxxQkFBWDtBQUFBLGVBQUE7O01BRUEsVUFBQSxHQUFhLElBQUMsQ0FBQSxhQUFELENBQUE7TUFFYixJQUFBLEdBQU8sSUFBQyxDQUFBLGdCQUFELENBQUE7TUFDUCxJQUFDLENBQUEsZ0JBQUQsQ0FBa0I7UUFBQSxNQUFBLEVBQVEsSUFBUjtPQUFsQjtNQUVDLGFBQWMsSUFBSSxDQUFDO01BQ3BCLFVBQUEsR0FBYSxLQUFBLENBQU0sSUFBTjtNQUNiLFVBQVUsQ0FBQyxrQkFBWCxDQUE4QixVQUE5QjtNQUNBLFVBQVUsQ0FBQyxjQUFYLENBQTBCLElBQTFCO01BQ0EsSUFBd0MsVUFBeEM7NkRBQVcsQ0FBQyxpQkFBRCxDQUFDLGFBQWMsV0FBMUI7O0lBWlM7O2lDQWNYLFVBQUEsR0FBWSxTQUFBO2FBQ1YsSUFBQyxDQUFBLGdCQUFELENBQUEsQ0FBbUIsQ0FBQyxVQUFwQixDQUFBO0lBRFU7Ozs7OztFQUdkLE1BQU0sQ0FBQyxPQUFQLEdBQWlCO0FBaE1qQiIsInNvdXJjZXNDb250ZW50IjpbIl8gPSByZXF1aXJlICd1bmRlcnNjb3JlLXBsdXMnXG5cbntzb3J0UmFuZ2VzLCBhc3NlcnRXaXRoRXhjZXB0aW9uLCB0cmltUmFuZ2V9ID0gcmVxdWlyZSAnLi91dGlscydcbnN3cmFwID0gcmVxdWlyZSAnLi9zZWxlY3Rpb24td3JhcHBlcidcblxuY2xhc3MgQmxvY2t3aXNlU2VsZWN0aW9uXG4gIGVkaXRvcjogbnVsbFxuICBzZWxlY3Rpb25zOiBudWxsXG4gIGdvYWxDb2x1bW46IG51bGxcbiAgcmV2ZXJzZWQ6IGZhbHNlXG5cbiAgQGJsb2Nrd2lzZVNlbGVjdGlvbnNCeUVkaXRvciA9IG5ldyBNYXAoKVxuXG4gIEBjbGVhclNlbGVjdGlvbnM6IChlZGl0b3IpIC0+XG4gICAgQGJsb2Nrd2lzZVNlbGVjdGlvbnNCeUVkaXRvci5kZWxldGUoZWRpdG9yKVxuXG4gIEBoYXM6IChlZGl0b3IpIC0+XG4gICAgQGJsb2Nrd2lzZVNlbGVjdGlvbnNCeUVkaXRvci5oYXMoZWRpdG9yKVxuXG4gIEBnZXRTZWxlY3Rpb25zOiAoZWRpdG9yKSAtPlxuICAgIEBibG9ja3dpc2VTZWxlY3Rpb25zQnlFZGl0b3IuZ2V0KGVkaXRvcikgPyBbXVxuXG4gIEBnZXRTZWxlY3Rpb25zT3JkZXJlZEJ5QnVmZmVyUG9zaXRpb246IChlZGl0b3IpIC0+XG4gICAgQGdldFNlbGVjdGlvbnMoZWRpdG9yKS5zb3J0IChhLCBiKSAtPlxuICAgICAgYS5nZXRTdGFydFNlbGVjdGlvbigpLmNvbXBhcmUoYi5nZXRTdGFydFNlbGVjdGlvbigpKVxuXG4gIEBnZXRMYXN0U2VsZWN0aW9uOiAoZWRpdG9yKSAtPlxuICAgIF8ubGFzdChAYmxvY2t3aXNlU2VsZWN0aW9uc0J5RWRpdG9yLmdldChlZGl0b3IpKVxuXG4gIEBzYXZlU2VsZWN0aW9uOiAoYmxvY2t3aXNlU2VsZWN0aW9uKSAtPlxuICAgIGVkaXRvciA9IGJsb2Nrd2lzZVNlbGVjdGlvbi5lZGl0b3JcbiAgICBAYmxvY2t3aXNlU2VsZWN0aW9uc0J5RWRpdG9yLnNldChlZGl0b3IsIFtdKSB1bmxlc3MgQGhhcyhlZGl0b3IpXG4gICAgQGJsb2Nrd2lzZVNlbGVjdGlvbnNCeUVkaXRvci5nZXQoZWRpdG9yKS5wdXNoKGJsb2Nrd2lzZVNlbGVjdGlvbilcblxuICBjb25zdHJ1Y3RvcjogKHNlbGVjdGlvbikgLT5cbiAgICBhc3NlcnRXaXRoRXhjZXB0aW9uKHN3cmFwKHNlbGVjdGlvbikuaGFzUHJvcGVydGllcygpLCBcIlRyeWluZyB0byBpbnN0YW50aWF0ZSB2QiBmcm9tIHByb3BlcnRpZXMtbGVzcyBzZWxlY3Rpb25cIilcbiAgICBAbmVlZFNraXBOb3JtYWxpemF0aW9uID0gZmFsc2VcbiAgICBAcHJvcGVydGllcyA9IHt9XG4gICAgQGVkaXRvciA9IHNlbGVjdGlvbi5lZGl0b3JcbiAgICAkc2VsZWN0aW9uID0gc3dyYXAoc2VsZWN0aW9uKVxuXG4gICAgQGdvYWxDb2x1bW4gPSBzZWxlY3Rpb24uY3Vyc29yLmdvYWxDb2x1bW5cbiAgICBAcmV2ZXJzZWQgPSBtZW1iZXJSZXZlcnNlZCA9IHNlbGVjdGlvbi5pc1JldmVyc2VkKClcblxuICAgIHtoZWFkOiB7Y29sdW1uOiBoZWFkQ29sdW1ufSwgdGFpbDoge2NvbHVtbjogdGFpbENvbHVtbn19ID0gJHNlbGVjdGlvbi5nZXRQcm9wZXJ0aWVzKClcbiAgICBzdGFydCA9ICRzZWxlY3Rpb24uZ2V0QnVmZmVyUG9zaXRpb25Gb3IoJ3N0YXJ0JywgZnJvbTogWydwcm9wZXJ0eSddKVxuICAgIGVuZCA9ICRzZWxlY3Rpb24uZ2V0QnVmZmVyUG9zaXRpb25Gb3IoJ2VuZCcsIGZyb206IFsncHJvcGVydHknXSlcblxuICAgICMgUmVzcGVjdCBnb2FsQ29sdW1uIG9ubHkgd2hlbiBpdCdzIHZhbHVlIGlzIEluZmluaXR5IGFuZCBzZWxlY3Rpb24ncyBoZWFkLWNvbHVtbiBpcyBiaWdnZXIgdGhhbiB0YWlsLWNvbHVtblxuICAgIGlmIChAZ29hbENvbHVtbiBpcyBJbmZpbml0eSkgYW5kIGhlYWRDb2x1bW4gPj0gdGFpbENvbHVtblxuICAgICAgaWYgc2VsZWN0aW9uLmlzUmV2ZXJzZWQoKVxuICAgICAgICBzdGFydC5jb2x1bW4gPSBAZ29hbENvbHVtblxuICAgICAgZWxzZVxuICAgICAgICBlbmQuY29sdW1uID0gQGdvYWxDb2x1bW5cblxuICAgIGlmIHN0YXJ0LmNvbHVtbiA+IGVuZC5jb2x1bW5cbiAgICAgIG1lbWJlclJldmVyc2VkID0gbm90IG1lbWJlclJldmVyc2VkXG4gICAgICBzdGFydENvbHVtbiA9IGVuZC5jb2x1bW5cbiAgICAgIGVuZENvbHVtbiA9IHN0YXJ0LmNvbHVtbiArIDFcbiAgICBlbHNlXG4gICAgICBzdGFydENvbHVtbiA9IHN0YXJ0LmNvbHVtblxuICAgICAgZW5kQ29sdW1uID0gZW5kLmNvbHVtbiArIDFcblxuICAgIHJhbmdlcyA9IFtzdGFydC5yb3cuLmVuZC5yb3ddLm1hcCAocm93KSAtPlxuICAgICAgW1tyb3csIHN0YXJ0Q29sdW1uXSwgW3JvdywgZW5kQ29sdW1uXV1cblxuICAgIHNlbGVjdGlvbi5zZXRCdWZmZXJSYW5nZShyYW5nZXMuc2hpZnQoKSwgcmV2ZXJzZWQ6IG1lbWJlclJldmVyc2VkKVxuICAgIEBzZWxlY3Rpb25zID0gW3NlbGVjdGlvbl1cbiAgICBmb3IgcmFuZ2UgaW4gcmFuZ2VzXG4gICAgICBAc2VsZWN0aW9ucy5wdXNoKEBlZGl0b3IuYWRkU2VsZWN0aW9uRm9yQnVmZmVyUmFuZ2UocmFuZ2UsIHJldmVyc2VkOiBtZW1iZXJSZXZlcnNlZCkpXG4gICAgQHVwZGF0ZUdvYWxDb2x1bW4oKVxuXG4gICAgZm9yIG1lbWJlclNlbGVjdGlvbiBpbiBAZ2V0U2VsZWN0aW9ucygpIHdoZW4gJG1lbWJlclNlbGVjdGlvbiA9IHN3cmFwKG1lbWJlclNlbGVjdGlvbilcbiAgICAgICRtZW1iZXJTZWxlY3Rpb24uc2F2ZVByb3BlcnRpZXMoKSAjIFRPRE8jNjk4ICByZW1vdmUgdGhpcz9cbiAgICAgICRtZW1iZXJTZWxlY3Rpb24uZ2V0UHJvcGVydGllcygpLmhlYWQuY29sdW1uID0gaGVhZENvbHVtblxuICAgICAgJG1lbWJlclNlbGVjdGlvbi5nZXRQcm9wZXJ0aWVzKCkudGFpbC5jb2x1bW4gPSB0YWlsQ29sdW1uXG5cbiAgICBAY29uc3RydWN0b3Iuc2F2ZVNlbGVjdGlvbih0aGlzKVxuXG4gIGdldFNlbGVjdGlvbnM6IC0+XG4gICAgQHNlbGVjdGlvbnNcblxuICBleHRlbmRNZW1iZXJTZWxlY3Rpb25zVG9FbmRPZkxpbmU6IC0+XG4gICAgZm9yIHNlbGVjdGlvbiBpbiBAZ2V0U2VsZWN0aW9ucygpXG4gICAgICB7c3RhcnQsIGVuZH0gPSBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKVxuICAgICAgZW5kLmNvbHVtbiA9IEluZmluaXR5XG4gICAgICBzZWxlY3Rpb24uc2V0QnVmZmVyUmFuZ2UoW3N0YXJ0LCBlbmRdKVxuXG4gIGV4cGFuZE1lbWJlclNlbGVjdGlvbnNPdmVyTGluZVdpdGhUcmltUmFuZ2U6IC0+XG4gICAgZm9yIHNlbGVjdGlvbiBpbiBAZ2V0U2VsZWN0aW9ucygpXG4gICAgICBzdGFydCA9IHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpLnN0YXJ0XG4gICAgICByYW5nZSA9IHRyaW1SYW5nZShAZWRpdG9yLCBAZWRpdG9yLmJ1ZmZlclJhbmdlRm9yQnVmZmVyUm93KHN0YXJ0LnJvdykpXG4gICAgICBzZWxlY3Rpb24uc2V0QnVmZmVyUmFuZ2UocmFuZ2UpXG5cbiAgaXNSZXZlcnNlZDogLT5cbiAgICBAcmV2ZXJzZWRcblxuICByZXZlcnNlOiAtPlxuICAgIEByZXZlcnNlZCA9IG5vdCBAcmV2ZXJzZWRcblxuICBnZXRQcm9wZXJ0aWVzOiAtPlxuICAgIHtcbiAgICAgIGhlYWQ6IHN3cmFwKEBnZXRIZWFkU2VsZWN0aW9uKCkpLmdldFByb3BlcnRpZXMoKS5oZWFkXG4gICAgICB0YWlsOiBzd3JhcChAZ2V0VGFpbFNlbGVjdGlvbigpKS5nZXRQcm9wZXJ0aWVzKCkudGFpbFxuICAgIH1cblxuICB1cGRhdGVHb2FsQ29sdW1uOiAtPlxuICAgIGlmIEBnb2FsQ29sdW1uP1xuICAgICAgZm9yIHNlbGVjdGlvbiBpbiBAc2VsZWN0aW9uc1xuICAgICAgICBzZWxlY3Rpb24uY3Vyc29yLmdvYWxDb2x1bW4gPSBAZ29hbENvbHVtblxuXG4gIGlzU2luZ2xlUm93OiAtPlxuICAgIEBzZWxlY3Rpb25zLmxlbmd0aCBpcyAxXG5cbiAgZ2V0SGVpZ2h0OiAtPlxuICAgIFtzdGFydFJvdywgZW5kUm93XSA9IEBnZXRCdWZmZXJSb3dSYW5nZSgpXG4gICAgKGVuZFJvdyAtIHN0YXJ0Um93KSArIDFcblxuICBnZXRTdGFydFNlbGVjdGlvbjogLT5cbiAgICBAc2VsZWN0aW9uc1swXVxuXG4gIGdldEVuZFNlbGVjdGlvbjogLT5cbiAgICBfLmxhc3QoQHNlbGVjdGlvbnMpXG5cbiAgZ2V0SGVhZFNlbGVjdGlvbjogLT5cbiAgICBpZiBAaXNSZXZlcnNlZCgpXG4gICAgICBAZ2V0U3RhcnRTZWxlY3Rpb24oKVxuICAgIGVsc2VcbiAgICAgIEBnZXRFbmRTZWxlY3Rpb24oKVxuXG4gIGdldFRhaWxTZWxlY3Rpb246IC0+XG4gICAgaWYgQGlzUmV2ZXJzZWQoKVxuICAgICAgQGdldEVuZFNlbGVjdGlvbigpXG4gICAgZWxzZVxuICAgICAgQGdldFN0YXJ0U2VsZWN0aW9uKClcblxuICBnZXRCdWZmZXJSb3dSYW5nZTogLT5cbiAgICBzdGFydFJvdyA9IEBnZXRTdGFydFNlbGVjdGlvbigpLmdldEJ1ZmZlclJvd1JhbmdlKClbMF1cbiAgICBlbmRSb3cgPSBAZ2V0RW5kU2VsZWN0aW9uKCkuZ2V0QnVmZmVyUm93UmFuZ2UoKVswXVxuICAgIFtzdGFydFJvdywgZW5kUm93XVxuXG4gICMgW05PVEVdIFVzZWQgYnkgcGx1Z2luIHBhY2thZ2Ugdm1wOm1vdmUtc2VsZWN0ZWQtdGV4dFxuICBzZXRTZWxlY3RlZEJ1ZmZlclJhbmdlczogKHJhbmdlcywge3JldmVyc2VkfSkgLT5cbiAgICBzb3J0UmFuZ2VzKHJhbmdlcylcbiAgICByYW5nZSA9IHJhbmdlcy5zaGlmdCgpXG5cbiAgICBoZWFkID0gQGdldEhlYWRTZWxlY3Rpb24oKVxuICAgIEByZW1vdmVTZWxlY3Rpb25zKGV4Y2VwdDogaGVhZClcbiAgICB7Z29hbENvbHVtbn0gPSBoZWFkLmN1cnNvclxuICAgICMgV2hlbiByZXZlcnNlZCBzdGF0ZSBvZiBzZWxlY3Rpb24gY2hhbmdlLCBnb2FsQ29sdW1uIGlzIGNsZWFyZWQuXG4gICAgIyBCdXQgaGVyZSBmb3IgYmxvY2t3aXNlLCBJIHdhbnQgdG8ga2VlcCBnb2FsQ29sdW1uIHVuY2hhbmdlZC5cbiAgICAjIFRoaXMgYmVoYXZpb3IgaXMgbm90IGNvbXBhdGlibGUgd2l0aCBwdXJlLVZpbSBJIGtub3cuXG4gICAgIyBCdXQgSSBiZWxpZXZlIHRoaXMgaXMgbW9yZSB1bm5vaXN5IGFuZCBsZXNzIGNvbmZ1c2lvbiB3aGlsZSBtb3ZpbmdcbiAgICAjIGN1cnNvciBpbiB2aXN1YWwtYmxvY2sgbW9kZS5cbiAgICBoZWFkLnNldEJ1ZmZlclJhbmdlKHJhbmdlLCB7cmV2ZXJzZWR9KVxuICAgIGhlYWQuY3Vyc29yLmdvYWxDb2x1bW4gPz0gZ29hbENvbHVtbiBpZiBnb2FsQ29sdW1uP1xuXG4gICAgZm9yIHJhbmdlIGluIHJhbmdlc1xuICAgICAgQHNlbGVjdGlvbnMucHVzaCBAZWRpdG9yLmFkZFNlbGVjdGlvbkZvckJ1ZmZlclJhbmdlKHJhbmdlLCB7cmV2ZXJzZWR9KVxuICAgIEB1cGRhdGVHb2FsQ29sdW1uKClcblxuICByZW1vdmVTZWxlY3Rpb25zOiAoe2V4Y2VwdH09e30pIC0+XG4gICAgZm9yIHNlbGVjdGlvbiBpbiBAc2VsZWN0aW9ucy5zbGljZSgpIHdoZW4gKHNlbGVjdGlvbiBpc250IGV4Y2VwdClcbiAgICAgIHN3cmFwKHNlbGVjdGlvbikuY2xlYXJQcm9wZXJ0aWVzKClcbiAgICAgIF8ucmVtb3ZlKEBzZWxlY3Rpb25zLCBzZWxlY3Rpb24pXG4gICAgICBzZWxlY3Rpb24uZGVzdHJveSgpXG5cbiAgc2V0SGVhZEJ1ZmZlclBvc2l0aW9uOiAocG9pbnQpIC0+XG4gICAgaGVhZCA9IEBnZXRIZWFkU2VsZWN0aW9uKClcbiAgICBAcmVtb3ZlU2VsZWN0aW9ucyhleGNlcHQ6IGhlYWQpXG4gICAgaGVhZC5jdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24ocG9pbnQpXG5cbiAgc2tpcE5vcm1hbGl6YXRpb246IC0+XG4gICAgQG5lZWRTa2lwTm9ybWFsaXphdGlvbiA9IHRydWVcblxuICBub3JtYWxpemU6IC0+XG4gICAgcmV0dXJuIGlmIEBuZWVkU2tpcE5vcm1hbGl6YXRpb25cblxuICAgIHByb3BlcnRpZXMgPSBAZ2V0UHJvcGVydGllcygpICMgU2F2ZSBwcm9wIEJFRk9SRSByZW1vdmluZyBtZW1iZXIgc2VsZWN0aW9ucy5cblxuICAgIGhlYWQgPSBAZ2V0SGVhZFNlbGVjdGlvbigpXG4gICAgQHJlbW92ZVNlbGVjdGlvbnMoZXhjZXB0OiBoZWFkKVxuXG4gICAge2dvYWxDb2x1bW59ID0gaGVhZC5jdXJzb3IgIyBGSVhNRSB0aGlzIHNob3VsZCBub3QgYmUgbmVjZXNzYXJ5XG4gICAgJHNlbGVjdGlvbiA9IHN3cmFwKGhlYWQpXG4gICAgJHNlbGVjdGlvbi5zZWxlY3RCeVByb3BlcnRpZXMocHJvcGVydGllcylcbiAgICAkc2VsZWN0aW9uLnNhdmVQcm9wZXJ0aWVzKHRydWUpXG4gICAgaGVhZC5jdXJzb3IuZ29hbENvbHVtbiA/PSBnb2FsQ29sdW1uIGlmIGdvYWxDb2x1bW4gIyBGSVhNRSB0aGlzIHNob3VsZCBub3QgYmUgbmVjZXNzYXJ5XG5cbiAgYXV0b3Njcm9sbDogLT5cbiAgICBAZ2V0SGVhZFNlbGVjdGlvbigpLmF1dG9zY3JvbGwoKVxuXG5tb2R1bGUuZXhwb3J0cyA9IEJsb2Nrd2lzZVNlbGVjdGlvblxuIl19
