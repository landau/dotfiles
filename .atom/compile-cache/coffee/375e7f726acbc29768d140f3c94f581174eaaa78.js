(function() {
  var BlockwiseSelection, _, __swrap, assertWithException, ref, settings, sortRanges, swrap, trimRange,
    slice = [].slice;

  _ = require('underscore-plus');

  ref = require('./utils'), sortRanges = ref.sortRanges, assertWithException = ref.assertWithException, trimRange = ref.trimRange;

  settings = require('./settings');

  __swrap = null;

  swrap = function() {
    var args;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    if (__swrap == null) {
      __swrap = require('./selection-wrapper');
    }
    return __swrap.apply(null, args);
  };

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
      this.needSkipNormalization = false;
      this.properties = {};
      this.editor = selection.editor;
      $selection = swrap(selection);
      if (!$selection.hasProperties()) {
        if (settings.get('strictAssertion')) {
          assertWithException(false, "Trying to instantiate vB from properties-less selection");
        }
        $selection.saveProperties();
      }
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvYmxvY2t3aXNlLXNlbGVjdGlvbi5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLGdHQUFBO0lBQUE7O0VBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUjs7RUFFSixNQUErQyxPQUFBLENBQVEsU0FBUixDQUEvQyxFQUFDLDJCQUFELEVBQWEsNkNBQWIsRUFBa0M7O0VBQ2xDLFFBQUEsR0FBVyxPQUFBLENBQVEsWUFBUjs7RUFFWCxPQUFBLEdBQVU7O0VBQ1YsS0FBQSxHQUFRLFNBQUE7QUFDTixRQUFBO0lBRE87O01BQ1AsVUFBVyxPQUFBLENBQVEscUJBQVI7O1dBQ1gsT0FBQSxhQUFRLElBQVI7RUFGTTs7RUFJRjtpQ0FDSixNQUFBLEdBQVE7O2lDQUNSLFVBQUEsR0FBWTs7aUNBQ1osVUFBQSxHQUFZOztpQ0FDWixRQUFBLEdBQVU7O0lBRVYsa0JBQUMsQ0FBQSwyQkFBRCxHQUFtQyxJQUFBLEdBQUEsQ0FBQTs7SUFFbkMsa0JBQUMsQ0FBQSxlQUFELEdBQWtCLFNBQUMsTUFBRDthQUNoQixJQUFDLENBQUEsMkJBQTJCLEVBQUMsTUFBRCxFQUE1QixDQUFvQyxNQUFwQztJQURnQjs7SUFHbEIsa0JBQUMsQ0FBQSxHQUFELEdBQU0sU0FBQyxNQUFEO2FBQ0osSUFBQyxDQUFBLDJCQUEyQixDQUFDLEdBQTdCLENBQWlDLE1BQWpDO0lBREk7O0lBR04sa0JBQUMsQ0FBQSxhQUFELEdBQWdCLFNBQUMsTUFBRDtBQUNkLFVBQUE7b0ZBQTJDO0lBRDdCOztJQUdoQixrQkFBQyxDQUFBLG9DQUFELEdBQXVDLFNBQUMsTUFBRDthQUNyQyxJQUFDLENBQUEsYUFBRCxDQUFlLE1BQWYsQ0FBc0IsQ0FBQyxJQUF2QixDQUE0QixTQUFDLENBQUQsRUFBSSxDQUFKO2VBQzFCLENB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T0FBUCxHQUFpQjtBQXhNakIiLCJzb3VyY2VzQ29udGVudCI6WyJfID0gcmVxdWlyZSAndW5kZXJzY29yZS1wbHVzJ1xuXG57c29ydFJhbmdlcywgYXNzZXJ0V2l0aEV4Y2VwdGlvbiwgdHJpbVJhbmdlfSA9IHJlcXVpcmUgJy4vdXRpbHMnXG5zZXR0aW5ncyA9IHJlcXVpcmUgJy4vc2V0dGluZ3MnXG5cbl9fc3dyYXAgPSBudWxsXG5zd3JhcCA9IChhcmdzLi4uKSAtPlxuICBfX3N3cmFwID89IHJlcXVpcmUgJy4vc2VsZWN0aW9uLXdyYXBwZXInXG4gIF9fc3dyYXAoYXJncy4uLilcblxuY2xhc3MgQmxvY2t3aXNlU2VsZWN0aW9uXG4gIGVkaXRvcjogbnVsbFxuICBzZWxlY3Rpb25zOiBudWxsXG4gIGdvYWxDb2x1bW46IG51bGxcbiAgcmV2ZXJzZWQ6IGZhbHNlXG5cbiAgQGJsb2Nrd2lzZVNlbGVjdGlvbnNCeUVkaXRvciA9IG5ldyBNYXAoKVxuXG4gIEBjbGVhclNlbGVjdGlvbnM6IChlZGl0b3IpIC0+XG4gICAgQGJsb2Nrd2lzZVNlbGVjdGlvbnNCeUVkaXRvci5kZWxldGUoZWRpdG9yKVxuXG4gIEBoYXM6IChlZGl0b3IpIC0+XG4gICAgQGJsb2Nrd2lzZVNlbGVjdGlvbnNCeUVkaXRvci5oYXMoZWRpdG9yKVxuXG4gIEBnZXRTZWxlY3Rpb25zOiAoZWRpdG9yKSAtPlxuICAgIEBibG9ja3dpc2VTZWxlY3Rpb25zQnlFZGl0b3IuZ2V0KGVkaXRvcikgPyBbXVxuXG4gIEBnZXRTZWxlY3Rpb25zT3JkZXJlZEJ5QnVmZmVyUG9zaXRpb246IChlZGl0b3IpIC0+XG4gICAgQGdldFNlbGVjdGlvbnMoZWRpdG9yKS5zb3J0IChhLCBiKSAtPlxuICAgICAgYS5nZXRTdGFydFNlbGVjdGlvbigpLmNvbXBhcmUoYi5nZXRTdGFydFNlbGVjdGlvbigpKVxuXG4gIEBnZXRMYXN0U2VsZWN0aW9uOiAoZWRpdG9yKSAtPlxuICAgIF8ubGFzdChAYmxvY2t3aXNlU2VsZWN0aW9uc0J5RWRpdG9yLmdldChlZGl0b3IpKVxuXG4gIEBzYXZlU2VsZWN0aW9uOiAoYmxvY2t3aXNlU2VsZWN0aW9uKSAtPlxuICAgIGVkaXRvciA9IGJsb2Nrd2lzZVNlbGVjdGlvbi5lZGl0b3JcbiAgICBAYmxvY2t3aXNlU2VsZWN0aW9uc0J5RWRpdG9yLnNldChlZGl0b3IsIFtdKSB1bmxlc3MgQGhhcyhlZGl0b3IpXG4gICAgQGJsb2Nrd2lzZVNlbGVjdGlvbnNCeUVkaXRvci5nZXQoZWRpdG9yKS5wdXNoKGJsb2Nrd2lzZVNlbGVjdGlvbilcblxuICBjb25zdHJ1Y3RvcjogKHNlbGVjdGlvbikgLT5cbiAgICBAbmVlZFNraXBOb3JtYWxpemF0aW9uID0gZmFsc2VcbiAgICBAcHJvcGVydGllcyA9IHt9XG4gICAgQGVkaXRvciA9IHNlbGVjdGlvbi5lZGl0b3JcbiAgICAkc2VsZWN0aW9uID0gc3dyYXAoc2VsZWN0aW9uKVxuICAgIHVubGVzcyAkc2VsZWN0aW9uLmhhc1Byb3BlcnRpZXMoKVxuICAgICAgaWYgc2V0dGluZ3MuZ2V0KCdzdHJpY3RBc3NlcnRpb24nKVxuICAgICAgICBhc3NlcnRXaXRoRXhjZXB0aW9uKGZhbHNlLCBcIlRyeWluZyB0byBpbnN0YW50aWF0ZSB2QiBmcm9tIHByb3BlcnRpZXMtbGVzcyBzZWxlY3Rpb25cIilcbiAgICAgICRzZWxlY3Rpb24uc2F2ZVByb3BlcnRpZXMoKVxuXG4gICAgQGdvYWxDb2x1bW4gPSBzZWxlY3Rpb24uY3Vyc29yLmdvYWxDb2x1bW5cbiAgICBAcmV2ZXJzZWQgPSBtZW1iZXJSZXZlcnNlZCA9IHNlbGVjdGlvbi5pc1JldmVyc2VkKClcblxuICAgIHtoZWFkOiB7Y29sdW1uOiBoZWFkQ29sdW1ufSwgdGFpbDoge2NvbHVtbjogdGFpbENvbHVtbn19ID0gJHNlbGVjdGlvbi5nZXRQcm9wZXJ0aWVzKClcbiAgICBzdGFydCA9ICRzZWxlY3Rpb24uZ2V0QnVmZmVyUG9zaXRpb25Gb3IoJ3N0YXJ0JywgZnJvbTogWydwcm9wZXJ0eSddKVxuICAgIGVuZCA9ICRzZWxlY3Rpb24uZ2V0QnVmZmVyUG9zaXRpb25Gb3IoJ2VuZCcsIGZyb206IFsncHJvcGVydHknXSlcblxuICAgICMgUmVzcGVjdCBnb2FsQ29sdW1uIG9ubHkgd2hlbiBpdCdzIHZhbHVlIGlzIEluZmluaXR5IGFuZCBzZWxlY3Rpb24ncyBoZWFkLWNvbHVtbiBpcyBiaWdnZXIgdGhhbiB0YWlsLWNvbHVtblxuICAgIGlmIChAZ29hbENvbHVtbiBpcyBJbmZpbml0eSkgYW5kIGhlYWRDb2x1bW4gPj0gdGFpbENvbHVtblxuICAgICAgaWYgc2VsZWN0aW9uLmlzUmV2ZXJzZWQoKVxuICAgICAgICBzdGFydC5jb2x1bW4gPSBAZ29hbENvbHVtblxuICAgICAgZWxzZVxuICAgICAgICBlbmQuY29sdW1uID0gQGdvYWxDb2x1bW5cblxuICAgIGlmIHN0YXJ0LmNvbHVtbiA+IGVuZC5jb2x1bW5cbiAgICAgIG1lbWJlclJldmVyc2VkID0gbm90IG1lbWJlclJldmVyc2VkXG4gICAgICBzdGFydENvbHVtbiA9IGVuZC5jb2x1bW5cbiAgICAgIGVuZENvbHVtbiA9IHN0YXJ0LmNvbHVtbiArIDFcbiAgICBlbHNlXG4gICAgICBzdGFydENvbHVtbiA9IHN0YXJ0LmNvbHVtblxuICAgICAgZW5kQ29sdW1uID0gZW5kLmNvbHVtbiArIDFcblxuICAgIHJhbmdlcyA9IFtzdGFydC5yb3cuLmVuZC5yb3ddLm1hcCAocm93KSAtPlxuICAgICAgW1tyb3csIHN0YXJ0Q29sdW1uXSwgW3JvdywgZW5kQ29sdW1uXV1cblxuICAgIHNlbGVjdGlvbi5zZXRCdWZmZXJSYW5nZShyYW5nZXMuc2hpZnQoKSwgcmV2ZXJzZWQ6IG1lbWJlclJldmVyc2VkKVxuICAgIEBzZWxlY3Rpb25zID0gW3NlbGVjdGlvbl1cbiAgICBmb3IgcmFuZ2UgaW4gcmFuZ2VzXG4gICAgICBAc2VsZWN0aW9ucy5wdXNoKEBlZGl0b3IuYWRkU2VsZWN0aW9uRm9yQnVmZmVyUmFuZ2UocmFuZ2UsIHJldmVyc2VkOiBtZW1iZXJSZXZlcnNlZCkpXG4gICAgQHVwZGF0ZUdvYWxDb2x1bW4oKVxuXG4gICAgZm9yIG1lbWJlclNlbGVjdGlvbiBpbiBAZ2V0U2VsZWN0aW9ucygpIHdoZW4gJG1lbWJlclNlbGVjdGlvbiA9IHN3cmFwKG1lbWJlclNlbGVjdGlvbilcbiAgICAgICRtZW1iZXJTZWxlY3Rpb24uc2F2ZVByb3BlcnRpZXMoKSAjIFRPRE8jNjk4ICByZW1vdmUgdGhpcz9cbiAgICAgICRtZW1iZXJTZWxlY3Rpb24uZ2V0UHJvcGVydGllcygpLmhlYWQuY29sdW1uID0gaGVhZENvbHVtblxuICAgICAgJG1lbWJlclNlbGVjdGlvbi5nZXRQcm9wZXJ0aWVzKCkudGFpbC5jb2x1bW4gPSB0YWlsQ29sdW1uXG5cbiAgICBAY29uc3RydWN0b3Iuc2F2ZVNlbGVjdGlvbih0aGlzKVxuXG4gIGdldFNlbGVjdGlvbnM6IC0+XG4gICAgQHNlbGVjdGlvbnNcblxuICBleHRlbmRNZW1iZXJTZWxlY3Rpb25zVG9FbmRPZkxpbmU6IC0+XG4gICAgZm9yIHNlbGVjdGlvbiBpbiBAZ2V0U2VsZWN0aW9ucygpXG4gICAgICB7c3RhcnQsIGVuZH0gPSBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKVxuICAgICAgZW5kLmNvbHVtbiA9IEluZmluaXR5XG4gICAgICBzZWxlY3Rpb24uc2V0QnVmZmVyUmFuZ2UoW3N0YXJ0LCBlbmRdKVxuXG4gIGV4cGFuZE1lbWJlclNlbGVjdGlvbnNPdmVyTGluZVdpdGhUcmltUmFuZ2U6IC0+XG4gICAgZm9yIHNlbGVjdGlvbiBpbiBAZ2V0U2VsZWN0aW9ucygpXG4gICAgICBzdGFydCA9IHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpLnN0YXJ0XG4gICAgICByYW5nZSA9IHRyaW1SYW5nZShAZWRpdG9yLCBAZWRpdG9yLmJ1ZmZlclJhbmdlRm9yQnVmZmVyUm93KHN0YXJ0LnJvdykpXG4gICAgICBzZWxlY3Rpb24uc2V0QnVmZmVyUmFuZ2UocmFuZ2UpXG5cbiAgaXNSZXZlcnNlZDogLT5cbiAgICBAcmV2ZXJzZWRcblxuICByZXZlcnNlOiAtPlxuICAgIEByZXZlcnNlZCA9IG5vdCBAcmV2ZXJzZWRcblxuICBnZXRQcm9wZXJ0aWVzOiAtPlxuICAgIHtcbiAgICAgIGhlYWQ6IHN3cmFwKEBnZXRIZWFkU2VsZWN0aW9uKCkpLmdldFByb3BlcnRpZXMoKS5oZWFkXG4gICAgICB0YWlsOiBzd3JhcChAZ2V0VGFpbFNlbGVjdGlvbigpKS5nZXRQcm9wZXJ0aWVzKCkudGFpbFxuICAgIH1cblxuICB1cGRhdGVHb2FsQ29sdW1uOiAtPlxuICAgIGlmIEBnb2FsQ29sdW1uP1xuICAgICAgZm9yIHNlbGVjdGlvbiBpbiBAc2VsZWN0aW9uc1xuICAgICAgICBzZWxlY3Rpb24uY3Vyc29yLmdvYWxDb2x1bW4gPSBAZ29hbENvbHVtblxuXG4gIGlzU2luZ2xlUm93OiAtPlxuICAgIEBzZWxlY3Rpb25zLmxlbmd0aCBpcyAxXG5cbiAgZ2V0SGVpZ2h0OiAtPlxuICAgIFtzdGFydFJvdywgZW5kUm93XSA9IEBnZXRCdWZmZXJSb3dSYW5nZSgpXG4gICAgKGVuZFJvdyAtIHN0YXJ0Um93KSArIDFcblxuICBnZXRTdGFydFNlbGVjdGlvbjogLT5cbiAgICBAc2VsZWN0aW9uc1swXVxuXG4gIGdldEVuZFNlbGVjdGlvbjogLT5cbiAgICBfLmxhc3QoQHNlbGVjdGlvbnMpXG5cbiAgZ2V0SGVhZFNlbGVjdGlvbjogLT5cbiAgICBpZiBAaXNSZXZlcnNlZCgpXG4gICAgICBAZ2V0U3RhcnRTZWxlY3Rpb24oKVxuICAgIGVsc2VcbiAgICAgIEBnZXRFbmRTZWxlY3Rpb24oKVxuXG4gIGdldFRhaWxTZWxlY3Rpb246IC0+XG4gICAgaWYgQGlzUmV2ZXJzZWQoKVxuICAgICAgQGdldEVuZFNlbGVjdGlvbigpXG4gICAgZWxzZVxuICAgICAgQGdldFN0YXJ0U2VsZWN0aW9uKClcblxuICBnZXRCdWZmZXJSb3dSYW5nZTogLT5cbiAgICBzdGFydFJvdyA9IEBnZXRTdGFydFNlbGVjdGlvbigpLmdldEJ1ZmZlclJvd1JhbmdlKClbMF1cbiAgICBlbmRSb3cgPSBAZ2V0RW5kU2VsZWN0aW9uKCkuZ2V0QnVmZmVyUm93UmFuZ2UoKVswXVxuICAgIFtzdGFydFJvdywgZW5kUm93XVxuXG4gICMgW05PVEVdIFVzZWQgYnkgcGx1Z2luIHBhY2thZ2Ugdm1wOm1vdmUtc2VsZWN0ZWQtdGV4dFxuICBzZXRTZWxlY3RlZEJ1ZmZlclJhbmdlczogKHJhbmdlcywge3JldmVyc2VkfSkgLT5cbiAgICBzb3J0UmFuZ2VzKHJhbmdlcylcbiAgICByYW5nZSA9IHJhbmdlcy5zaGlmdCgpXG5cbiAgICBoZWFkID0gQGdldEhlYWRTZWxlY3Rpb24oKVxuICAgIEByZW1vdmVTZWxlY3Rpb25zKGV4Y2VwdDogaGVhZClcbiAgICB7Z29hbENvbHVtbn0gPSBoZWFkLmN1cnNvclxuICAgICMgV2hlbiByZXZlcnNlZCBzdGF0ZSBvZiBzZWxlY3Rpb24gY2hhbmdlLCBnb2FsQ29sdW1uIGlzIGNsZWFyZWQuXG4gICAgIyBCdXQgaGVyZSBmb3IgYmxvY2t3aXNlLCBJIHdhbnQgdG8ga2VlcCBnb2FsQ29sdW1uIHVuY2hhbmdlZC5cbiAgICAjIFRoaXMgYmVoYXZpb3IgaXMgbm90IGNvbXBhdGlibGUgd2l0aCBwdXJlLVZpbSBJIGtub3cuXG4gICAgIyBCdXQgSSBiZWxpZXZlIHRoaXMgaXMgbW9yZSB1bm5vaXN5IGFuZCBsZXNzIGNvbmZ1c2lvbiB3aGlsZSBtb3ZpbmdcbiAgICAjIGN1cnNvciBpbiB2aXN1YWwtYmxvY2sgbW9kZS5cbiAgICBoZWFkLnNldEJ1ZmZlclJhbmdlKHJhbmdlLCB7cmV2ZXJzZWR9KVxuICAgIGhlYWQuY3Vyc29yLmdvYWxDb2x1bW4gPz0gZ29hbENvbHVtbiBpZiBnb2FsQ29sdW1uP1xuXG4gICAgZm9yIHJhbmdlIGluIHJhbmdlc1xuICAgICAgQHNlbGVjdGlvbnMucHVzaCBAZWRpdG9yLmFkZFNlbGVjdGlvbkZvckJ1ZmZlclJhbmdlKHJhbmdlLCB7cmV2ZXJzZWR9KVxuICAgIEB1cGRhdGVHb2FsQ29sdW1uKClcblxuICByZW1vdmVTZWxlY3Rpb25zOiAoe2V4Y2VwdH09e30pIC0+XG4gICAgZm9yIHNlbGVjdGlvbiBpbiBAc2VsZWN0aW9ucy5zbGljZSgpIHdoZW4gKHNlbGVjdGlvbiBpc250IGV4Y2VwdClcbiAgICAgIHN3cmFwKHNlbGVjdGlvbikuY2xlYXJQcm9wZXJ0aWVzKClcbiAgICAgIF8ucmVtb3ZlKEBzZWxlY3Rpb25zLCBzZWxlY3Rpb24pXG4gICAgICBzZWxlY3Rpb24uZGVzdHJveSgpXG5cbiAgc2V0SGVhZEJ1ZmZlclBvc2l0aW9uOiAocG9pbnQpIC0+XG4gICAgaGVhZCA9IEBnZXRIZWFkU2VsZWN0aW9uKClcbiAgICBAcmVtb3ZlU2VsZWN0aW9ucyhleGNlcHQ6IGhlYWQpXG4gICAgaGVhZC5jdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24ocG9pbnQpXG5cbiAgc2tpcE5vcm1hbGl6YXRpb246IC0+XG4gICAgQG5lZWRTa2lwTm9ybWFsaXphdGlvbiA9IHRydWVcblxuICBub3JtYWxpemU6IC0+XG4gICAgcmV0dXJuIGlmIEBuZWVkU2tpcE5vcm1hbGl6YXRpb25cblxuICAgIHByb3BlcnRpZXMgPSBAZ2V0UHJvcGVydGllcygpICMgU2F2ZSBwcm9wIEJFRk9SRSByZW1vdmluZyBtZW1iZXIgc2VsZWN0aW9ucy5cblxuICAgIGhlYWQgPSBAZ2V0SGVhZFNlbGVjdGlvbigpXG4gICAgQHJlbW92ZVNlbGVjdGlvbnMoZXhjZXB0OiBoZWFkKVxuXG4gICAge2dvYWxDb2x1bW59ID0gaGVhZC5jdXJzb3IgIyBGSVhNRSB0aGlzIHNob3VsZCBub3QgYmUgbmVjZXNzYXJ5XG4gICAgJHNlbGVjdGlvbiA9IHN3cmFwKGhlYWQpXG4gICAgJHNlbGVjdGlvbi5zZWxlY3RCeVByb3BlcnRpZXMocHJvcGVydGllcylcbiAgICAkc2VsZWN0aW9uLnNhdmVQcm9wZXJ0aWVzKHRydWUpXG4gICAgaGVhZC5jdXJzb3IuZ29hbENvbHVtbiA/PSBnb2FsQ29sdW1uIGlmIGdvYWxDb2x1bW4gIyBGSVhNRSB0aGlzIHNob3VsZCBub3QgYmUgbmVjZXNzYXJ5XG5cbiAgYXV0b3Njcm9sbDogLT5cbiAgICBAZ2V0SGVhZFNlbGVjdGlvbigpLmF1dG9zY3JvbGwoKVxuXG5tb2R1bGUuZXhwb3J0cyA9IEJsb2Nrd2lzZVNlbGVjdGlvblxuIl19
