(function() {
  var BlockwiseSelection, Disposable, Point, Range, SelectionWrapper, assertWithException, getBufferRangeForRowRange, getEndOfLineForBufferRow, getFoldEndRowForRow, getRangeByTranslatePointAndClip, isLinewiseRange, limitNumber, propertyStore, ref, ref1, settings, swrap, translatePointAndClip;

  ref = require('atom'), Range = ref.Range, Point = ref.Point, Disposable = ref.Disposable;

  ref1 = require('./utils'), translatePointAndClip = ref1.translatePointAndClip, getRangeByTranslatePointAndClip = ref1.getRangeByTranslatePointAndClip, getEndOfLineForBufferRow = ref1.getEndOfLineForBufferRow, getBufferRangeForRowRange = ref1.getBufferRangeForRowRange, limitNumber = ref1.limitNumber, isLinewiseRange = ref1.isLinewiseRange, assertWithException = ref1.assertWithException, getFoldEndRowForRow = ref1.getFoldEndRowForRow;

  settings = require('./settings');

  BlockwiseSelection = require('./blockwise-selection');

  propertyStore = new Map;

  SelectionWrapper = (function() {
    function SelectionWrapper(selection1) {
      this.selection = selection1;
    }

    SelectionWrapper.prototype.hasProperties = function() {
      return propertyStore.has(this.selection);
    };

    SelectionWrapper.prototype.getProperties = function() {
      return propertyStore.get(this.selection);
    };

    SelectionWrapper.prototype.setProperties = function(prop) {
      return propertyStore.set(this.selection, prop);
    };

    SelectionWrapper.prototype.clearProperties = function() {
      return propertyStore["delete"](this.selection);
    };

    SelectionWrapper.prototype.setBufferRangeSafely = function(range, options) {
      if (range) {
        return this.setBufferRange(range, options);
      }
    };

    SelectionWrapper.prototype.getBufferRange = function() {
      return this.selection.getBufferRange();
    };

    SelectionWrapper.prototype.getBufferPositionFor = function(which, arg) {
      var _from, from, i, len, properties, ref2;
      from = (arg != null ? arg : {}).from;
      ref2 = from != null ? from : ['selection'];
      for (i = 0, len = ref2.length; i < len; i++) {
        _from = ref2[i];
        switch (_from) {
          case 'property':
            if (!this.hasProperties()) {
              continue;
            }
            properties = this.getProperties();
            switch (which) {
              case 'start':
                if (this.selection.isReversed()) {
                  return properties.head;
                } else {
                  return properties.tail;
                }
              case 'end':
                if (this.selection.isReversed()) {
                  return properties.tail;
                } else {
                  return properties.head;
                }
              case 'head':
                return properties.head;
              case 'tail':
                return properties.tail;
            }
          case 'selection':
            switch (which) {
              case 'start':
                return this.selection.getBufferRange().start;
              case 'end':
                return this.selection.getBufferRange().end;
              case 'head':
                return this.selection.getHeadBufferPosition();
              case 'tail':
                return this.selection.getTailBufferPosition();
            }
        }
      }
      return null;
    };

    SelectionWrapper.prototype.setBufferPositionTo = function(which) {
      return this.selection.cursor.setBufferPosition(this.getBufferPositionFor(which));
    };

    SelectionWrapper.prototype.setReversedState = function(isReversed) {
      var head, ref2, tail;
      if (this.selection.isReversed() === isReversed) {
        return;
      }
      assertWithException(this.hasProperties(), "trying to reverse selection which is non-empty and property-lesss");
      ref2 = this.getProperties(), head = ref2.head, tail = ref2.tail;
      this.setProperties({
        head: tail,
        tail: head
      });
      return this.setBufferRange(this.getBufferRange(), {
        autoscroll: true,
        reversed: isReversed,
        keepGoalColumn: false
      });
    };

    SelectionWrapper.prototype.getRows = function() {
      var endRow, i, ref2, results, startRow;
      ref2 = this.selection.getBufferRowRange(), startRow = ref2[0], endRow = ref2[1];
      return (function() {
        results = [];
        for (var i = startRow; startRow <= endRow ? i <= endRow : i >= endRow; startRow <= endRow ? i++ : i--){ results.push(i); }
        return results;
      }).apply(this);
    };

    SelectionWrapper.prototype.getRowCount = function() {
      return this.getRows().length;
    };

    SelectionWrapper.prototype.getTailBufferRange = function() {
      var editor, point, tailPoint;
      editor = this.selection.editor;
      tailPoint = this.selection.getTailBufferPosition();
      if (this.selection.isReversed()) {
        point = translatePointAndClip(editor, tailPoint, 'backward');
        return new Range(point, tailPoint);
      } else {
        point = translatePointAndClip(editor, tailPoint, 'forward');
        return new Range(tailPoint, point);
      }
    };

    SelectionWrapper.prototype.saveProperties = function(isNormalized) {
      var end, head, properties, tail;
      head = this.selection.getHeadBufferPosition();
      tail = this.selection.getTailBufferPosition();
      if (this.selection.isEmpty() || isNormalized) {
        properties = {
          head: head,
          tail: tail
        };
      } else {
        end = translatePointAndClip(this.selection.editor, this.getBufferRange().end, 'backward');
        if (this.selection.isReversed()) {
          properties = {
            head: head,
            tail: end
          };
        } else {
          properties = {
            head: end,
            tail: tail
          };
        }
      }
      return this.setProperties(properties);
    };

    SelectionWrapper.prototype.fixPropertyRowToRowRange = function() {
      var head, ref2, ref3, ref4, tail;
      ref2 = this.getProperties(), head = ref2.head, tail = ref2.tail;
      if (this.selection.isReversed()) {
        return ref3 = this.selection.getBufferRowRange(), head.row = ref3[0], tail.row = ref3[1], ref3;
      } else {
        return ref4 = this.selection.getBufferRowRange(), tail.row = ref4[0], head.row = ref4[1], ref4;
      }
    };

    SelectionWrapper.prototype.applyWise = function(wise) {
      var end, endRow, ref2, start;
      switch (wise) {
        case 'characterwise':
          return this.translateSelectionEndAndClip('forward');
        case 'linewise':
          ref2 = this.getBufferRange(), start = ref2.start, end = ref2.end;
          endRow = getFoldEndRowForRow(this.selection.editor, end.row);
          return this.setBufferRange(getBufferRangeForRowRange(this.selection.editor, [start.row, endRow]));
        case 'blockwise':
          return new BlockwiseSelection(this.selection);
      }
    };

    SelectionWrapper.prototype.selectByProperties = function(arg) {
      var head, tail;
      head = arg.head, tail = arg.tail;
      return this.setBufferRange([tail, head], {
        autoscroll: true,
        reversed: head.isLessThan(tail),
        keepGoalColumn: false
      });
    };

    SelectionWrapper.prototype.setBufferRange = function(range, options) {
      var goalColumn, ref2;
      if (options == null) {
        options = {};
      }
      if ((ref2 = options.keepGoalColumn) != null ? ref2 : true) {
        goalColumn = this.selection.cursor.goalColumn;
      }
      delete options.keepGoalColumn;
      if (options.autoscroll == null) {
        options.autoscroll = false;
      }
      if (options.preserveFolds == null) {
        options.preserveFolds = true;
      }
      this.selection.setBufferRange(range, options);
      if (goalColumn != null) {
        return this.selection.cursor.goalColumn = goalColumn;
      }
    };

    SelectionWrapper.prototype.isSingleRow = function() {
      var endRow, ref2, startRow;
      ref2 = this.selection.getBufferRowRange(), startRow = ref2[0], endRow = ref2[1];
      return startRow === endRow;
    };

    SelectionWrapper.prototype.isLinewiseRange = function() {
      return isLinewiseRange(this.getBufferRange());
    };

    SelectionWrapper.prototype.detectWise = function() {
      if (this.isLinewiseRange()) {
        return 'linewise';
      } else {
        return 'characterwise';
      }
    };

    SelectionWrapper.prototype.translateSelectionEndAndClip = function(direction) {
      var newRange;
      newRange = getRangeByTranslatePointAndClip(this.selection.editor, this.getBufferRange(), "end", direction);
      return this.setBufferRange(newRange);
    };

    SelectionWrapper.prototype.getBlockwiseSelectionExtent = function() {
      var head, tail;
      head = this.selection.getHeadBufferPosition();
      tail = this.selection.getTailBufferPosition();
      return new Point(head.row - tail.row, head.column - tail.column);
    };

    SelectionWrapper.prototype.normalize = function() {
      var head, ref2, tail;
      if (this.selection.isEmpty()) {
        return;
      }
      if (!this.hasProperties()) {
        if (settings.get('strictAssertion')) {
          assertWithException(false, "attempted to normalize but no properties to restore");
        }
        this.saveProperties();
      }
      ref2 = this.getProperties(), head = ref2.head, tail = ref2.tail;
      return this.setBufferRange([tail, head]);
    };

    return SelectionWrapper;

  })();

  swrap = function(selection) {
    return new SelectionWrapper(selection);
  };

  swrap.getBlockwiseSelections = function(editor) {
    return BlockwiseSelection.getSelections(editor);
  };

  swrap.getLastBlockwiseSelections = function(editor) {
    return BlockwiseSelection.getLastSelection(editor);
  };

  swrap.getBlockwiseSelectionsOrderedByBufferPosition = function(editor) {
    return BlockwiseSelection.getSelectionsOrderedByBufferPosition(editor);
  };

  swrap.clearBlockwiseSelections = function(editor) {
    return BlockwiseSelection.clearSelections(editor);
  };

  swrap.getSelections = function(editor) {
    return editor.getSelections(editor).map(swrap);
  };

  swrap.setReversedState = function(editor, reversed) {
    var $selection, i, len, ref2, results;
    ref2 = this.getSelections(editor);
    results = [];
    for (i = 0, len = ref2.length; i < len; i++) {
      $selection = ref2[i];
      results.push($selection.setReversedState(reversed));
    }
    return results;
  };

  swrap.detectWise = function(editor) {
    if (this.getSelections(editor).every(function($selection) {
      return $selection.detectWise() === 'linewise';
    })) {
      return 'linewise';
    } else {
      return 'characterwise';
    }
  };

  swrap.clearProperties = function(editor) {
    var $selection, i, len, ref2, results;
    ref2 = this.getSelections(editor);
    results = [];
    for (i = 0, len = ref2.length; i < len; i++) {
      $selection = ref2[i];
      results.push($selection.clearProperties());
    }
    return results;
  };

  swrap.dumpProperties = function(editor) {
    var $selection, i, inspect, len, ref2, results;
    inspect = require('util').inspect;
    ref2 = this.getSelections(editor);
    results = [];
    for (i = 0, len = ref2.length; i < len; i++) {
      $selection = ref2[i];
      if ($selection.hasProperties()) {
        results.push(console.log(inspect($selection.getProperties())));
      }
    }
    return results;
  };

  swrap.normalize = function(editor) {
    var $selection, blockwiseSelection, i, j, len, len1, ref2, ref3, results;
    if (BlockwiseSelection.has(editor)) {
      ref2 = BlockwiseSelection.getSelections(editor);
      for (i = 0, len = ref2.length; i < len; i++) {
        blockwiseSelection = ref2[i];
        blockwiseSelection.normalize();
      }
      return BlockwiseSelection.clearSelections(editor);
    } else {
      ref3 = this.getSelections(editor);
      results = [];
      for (j = 0, len1 = ref3.length; j < len1; j++) {
        $selection = ref3[j];
        results.push($selection.normalize());
      }
      return results;
    }
  };

  swrap.hasProperties = function(editor) {
    return this.getSelections(editor).every(function($selection) {
      return $selection.hasProperties();
    });
  };

  swrap.switchToLinewise = function(editor) {
    var $selection, i, len, ref2;
    ref2 = swrap.getSelections(editor);
    for (i = 0, len = ref2.length; i < len; i++) {
      $selection = ref2[i];
      $selection.saveProperties();
      $selection.applyWise('linewise');
    }
    return new Disposable(function() {
      var j, len1, ref3, results;
      ref3 = swrap.getSelections(editor);
      results = [];
      for (j = 0, len1 = ref3.length; j < len1; j++) {
        $selection = ref3[j];
        $selection.normalize();
        results.push($selection.applyWise('characterwise'));
      }
      return results;
    });
  };

  swrap.getPropertyStore = function() {
    return propertyStore;
  };

  module.exports = swrap;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvc2VsZWN0aW9uLXdyYXBwZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxNQUE2QixPQUFBLENBQVEsTUFBUixDQUE3QixFQUFDLGlCQUFELEVBQVEsaUJBQVIsRUFBZTs7RUFDZixPQVNJLE9BQUEsQ0FBUSxTQUFSLENBVEosRUFDRSxrREFERixFQUVFLHNFQUZGLEVBR0Usd0RBSEYsRUFJRSwwREFKRixFQUtFLDhCQUxGLEVBTUUsc0NBTkYsRUFPRSw4Q0FQRixFQVFFOztFQUVGLFFBQUEsR0FBVyxPQUFBLENBQVEsWUFBUjs7RUFDWCxrQkFBQSxHQUFxQixPQUFBLENBQVEsdUJBQVI7O0VBRXJCLGFBQUEsR0FBZ0IsSUFBSTs7RUFFZDtJQUNTLDBCQUFDLFVBQUQ7TUFBQyxJQUFDLENBQUEsWUFBRDtJQUFEOzsrQkFDYixhQUFBLEdBQWUsU0FBQTthQUFHLGFBQWEsQ0FBQyxHQUFkLENBQWtCLElBQUMsQ0FBQSxTQUFuQjtJQUFIOzsrQkFDZixhQUFBLEdBQWUsU0FBQTthQUFHLGFBQWEsQ0FBQyxHQUFkLENBQWtCLElBQUMsQ0FBQSxTQUFuQjtJQUFIOzsrQkFDZixhQUFBLEdBQWUsU0FBQyxJQUFEO2FBQVUsYUFBYSxDQUFDLEdBQWQsQ0FBa0IsSUFBQyxDQUFBLFNBQW5CLEVBQThCLElBQTlCO0lBQVY7OytCQUNmLGVBQUEsR0FBaUIsU0FBQTthQUFHLGFBQWEsRUFBQyxNQUFELEVBQWIsQ0FBcUIsSUFBQyxDQUFBLFNBQXRCO0lBQUg7OytCQUVqQixvQkFBQSxHQUFzQixTQUFDLEtBQUQsRUFBUSxPQUFSO01BQ3BCLElBQUcsS0FBSDtlQUNFLElBQUMsQ0FBQSxjQUFELENBQWdCLEtBQWhCLEVBQXVCLE9BQXZCLEVBREY7O0lBRG9COzsrQkFJdEIsY0FBQSxHQUFn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LEdBQXNCLFNBQUMsTUFBRDtXQUNwQixJQUFDLENBQUEsYUFBRCxDQUFlLE1BQWYsQ0FBc0IsQ0FBQyxLQUF2QixDQUE2QixTQUFDLFVBQUQ7YUFBZ0IsVUFBVSxDQUFDLGFBQVgsQ0FBQTtJQUFoQixDQUE3QjtFQURvQjs7RUFLdEIsS0FBSyxDQUFDLGdCQUFOLEdBQXlCLFNBQUMsTUFBRDtBQUN2QixRQUFBO0FBQUE7QUFBQSxTQUFBLHNDQUFBOztNQUNFLFVBQVUsQ0FBQyxjQUFYLENBQUE7TUFDQSxVQUFVLENBQUMsU0FBWCxDQUFxQixVQUFyQjtBQUZGO1dBR0ksSUFBQSxVQUFBLENBQVcsU0FBQTtBQUNiLFVBQUE7QUFBQTtBQUFBO1dBQUEsd0NBQUE7O1FBQ0UsVUFBVSxDQUFDLFNBQVgsQ0FBQTtxQkFDQSxVQUFVLENBQUMsU0FBWCxDQUFxQixlQUFyQjtBQUZGOztJQURhLENBQVg7RUFKbUI7O0VBU3pCLEtBQUssQ0FBQyxnQkFBTixHQUF5QixTQUFBO1dBQ3ZCO0VBRHVCOztFQUd6QixNQUFNLENBQUMsT0FBUCxHQUFpQjtBQTdPakIiLCJzb3VyY2VzQ29udGVudCI6WyJ7UmFuZ2UsIFBvaW50LCBEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2F0b20nXG57XG4gIHRyYW5zbGF0ZVBvaW50QW5kQ2xpcFxuICBnZXRSYW5nZUJ5VHJhbnNsYXRlUG9pbnRBbmRDbGlwXG4gIGdldEVuZE9mTGluZUZvckJ1ZmZlclJvd1xuICBnZXRCdWZmZXJSYW5nZUZvclJvd1JhbmdlXG4gIGxpbWl0TnVtYmVyXG4gIGlzTGluZXdpc2VSYW5nZVxuICBhc3NlcnRXaXRoRXhjZXB0aW9uXG4gIGdldEZvbGRFbmRSb3dGb3JSb3dcbn0gPSByZXF1aXJlICcuL3V0aWxzJ1xuc2V0dGluZ3MgPSByZXF1aXJlICcuL3NldHRpbmdzJ1xuQmxvY2t3aXNlU2VsZWN0aW9uID0gcmVxdWlyZSAnLi9ibG9ja3dpc2Utc2VsZWN0aW9uJ1xuXG5wcm9wZXJ0eVN0b3JlID0gbmV3IE1hcFxuXG5jbGFzcyBTZWxlY3Rpb25XcmFwcGVyXG4gIGNvbnN0cnVjdG9yOiAoQHNlbGVjdGlvbikgLT5cbiAgaGFzUHJvcGVydGllczogLT4gcHJvcGVydHlTdG9yZS5oYXMoQHNlbGVjdGlvbilcbiAgZ2V0UHJvcGVydGllczogLT4gcHJvcGVydHlTdG9yZS5nZXQoQHNlbGVjdGlvbilcbiAgc2V0UHJvcGVydGllczogKHByb3ApIC0+IHByb3BlcnR5U3RvcmUuc2V0KEBzZWxlY3Rpb24sIHByb3ApXG4gIGNsZWFyUHJvcGVydGllczogLT4gcHJvcGVydHlTdG9yZS5kZWxldGUoQHNlbGVjdGlvbilcblxuICBzZXRCdWZmZXJSYW5nZVNhZmVseTogKHJhbmdlLCBvcHRpb25zKSAtPlxuICAgIGlmIHJhbmdlXG4gICAgICBAc2V0QnVmZmVyUmFuZ2UocmFuZ2UsIG9wdGlvbnMpXG5cbiAgZ2V0QnVmZmVyUmFuZ2U6IC0+XG4gICAgQHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpXG5cbiAgZ2V0QnVmZmVyUG9zaXRpb25Gb3I6ICh3aGljaCwge2Zyb219PXt9KSAtPlxuICAgIGZvciBfZnJvbSBpbiBmcm9tID8gWydzZWxlY3Rpb24nXVxuICAgICAgc3dpdGNoIF9mcm9tXG4gICAgICAgIHdoZW4gJ3Byb3BlcnR5J1xuICAgICAgICAgIGNvbnRpbnVlIHVubGVzcyBAaGFzUHJvcGVydGllcygpXG5cbiAgICAgICAgICBwcm9wZXJ0aWVzID0gQGdldFByb3BlcnRpZXMoKVxuICAgICAgICAgIHJldHVybiBzd2l0Y2ggd2hpY2hcbiAgICAgICAgICAgIHdoZW4gJ3N0YXJ0JyB0aGVuIChpZiBAc2VsZWN0aW9uLmlzUmV2ZXJzZWQoKSB0aGVuIHByb3BlcnRpZXMuaGVhZCBlbHNlIHByb3BlcnRpZXMudGFpbClcbiAgICAgICAgICAgIHdoZW4gJ2VuZCcgdGhlbiAoaWYgQHNlbGVjdGlvbi5pc1JldmVyc2VkKCkgdGhlbiBwcm9wZXJ0aWVzLnRhaWwgZWxzZSBwcm9wZXJ0aWVzLmhlYWQpXG4gICAgICAgICAgICB3aGVuICdoZWFkJyB0aGVuIHByb3BlcnRpZXMuaGVhZFxuICAgICAgICAgICAgd2hlbiAndGFpbCcgdGhlbiBwcm9wZXJ0aWVzLnRhaWxcblxuICAgICAgICB3aGVuICdzZWxlY3Rpb24nXG4gICAgICAgICAgcmV0dXJuIHN3aXRjaCB3aGljaFxuICAgICAgICAgICAgd2hlbiAnc3RhcnQnIHRoZW4gQHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpLnN0YXJ0XG4gICAgICAgICAgICB3aGVuICdlbmQnIHRoZW4gQHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpLmVuZFxuICAgICAgICAgICAgd2hlbiAnaGVhZCcgdGhlbiBAc2VsZWN0aW9uLmdldEhlYWRCdWZmZXJQb3NpdGlvbigpXG4gICAgICAgICAgICB3aGVuICd0YWlsJyB0aGVuIEBzZWxlY3Rpb24uZ2V0VGFpbEJ1ZmZlclBvc2l0aW9uKClcbiAgICBudWxsXG5cbiAgc2V0QnVmZmVyUG9zaXRpb25UbzogKHdoaWNoKSAtPlxuICAgIEBzZWxlY3Rpb24uY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKEBnZXRCdWZmZXJQb3NpdGlvbkZvcih3aGljaCkpXG5cbiAgc2V0UmV2ZXJzZWRTdGF0ZTogKGlzUmV2ZXJzZWQpIC0+XG4gICAgcmV0dXJuIGlmIEBzZWxlY3Rpb24uaXNSZXZlcnNlZCgpIGlzIGlzUmV2ZXJzZWRcbiAgICBhc3NlcnRXaXRoRXhjZXB0aW9uKEBoYXNQcm9wZXJ0aWVzKCksIFwidHJ5aW5nIHRvIHJldmVyc2Ugc2VsZWN0aW9uIHdoaWNoIGlzIG5vbi1lbXB0eSBhbmQgcHJvcGVydHktbGVzc3NcIilcblxuICAgIHtoZWFkLCB0YWlsfSA9IEBnZXRQcm9wZXJ0aWVzKClcbiAgICBAc2V0UHJvcGVydGllcyhoZWFkOiB0YWlsLCB0YWlsOiBoZWFkKVxuXG4gICAgQHNldEJ1ZmZlclJhbmdlIEBnZXRCdWZmZXJSYW5nZSgpLFxuICAgICAgYXV0b3Njcm9sbDogdHJ1ZVxuICAgICAgcmV2ZXJzZWQ6IGlzUmV2ZXJzZWRcbiAgICAgIGtlZXBHb2FsQ29sdW1uOiBmYWxzZVxuXG4gIGdldFJvd3M6IC0+XG4gICAgW3N0YXJ0Um93LCBlbmRSb3ddID0gQHNlbGVjdGlvbi5nZXRCdWZmZXJSb3dSYW5nZSgpXG4gICAgW3N0YXJ0Um93Li5lbmRSb3ddXG5cbiAgZ2V0Um93Q291bnQ6IC0+XG4gICAgQGdldFJvd3MoKS5sZW5ndGhcblxuICBnZXRUYWlsQnVmZmVyUmFuZ2U6IC0+XG4gICAge2VkaXRvcn0gPSBAc2VsZWN0aW9uXG4gICAgdGFpbFBvaW50ID0gQHNlbGVjdGlvbi5nZXRUYWlsQnVmZmVyUG9zaXRpb24oKVxuICAgIGlmIEBzZWxlY3Rpb24uaXNSZXZlcnNlZCgpXG4gICAgICBwb2ludCA9IHRyYW5zbGF0ZVBvaW50QW5kQ2xpcChlZGl0b3IsIHRhaWxQb2ludCwgJ2JhY2t3YXJkJylcbiAgICAgIG5ldyBSYW5nZShwb2ludCwgdGFpbFBvaW50KVxuICAgIGVsc2VcbiAgICAgIHBvaW50ID0gdHJhbnNsYXRlUG9pbnRBbmRDbGlwKGVkaXRvciwgdGFpbFBvaW50LCAnZm9yd2FyZCcpXG4gICAgICBuZXcgUmFuZ2UodGFpbFBvaW50LCBwb2ludClcblxuICBzYXZlUHJvcGVydGllczogKGlzTm9ybWFsaXplZCkgLT5cbiAgICBoZWFkID0gQHNlbGVjdGlvbi5nZXRIZWFkQnVmZmVyUG9zaXRpb24oKVxuICAgIHRhaWwgPSBAc2VsZWN0aW9uLmdldFRhaWxCdWZmZXJQb3NpdGlvbigpXG4gICAgaWYgQHNlbGVjdGlvbi5pc0VtcHR5KCkgb3IgaXNOb3JtYWxpemVkXG4gICAgICBwcm9wZXJ0aWVzID0ge2hlYWQsIHRhaWx9XG4gICAgZWxzZVxuICAgICAgIyBXZSBzZWxlY3RSaWdodC1lZCBpbiB2aXN1YWwtbW9kZSwgdGhpcyB0cmFuc2xhdGlvbiBkZS1lZmZlY3Qgc2VsZWN0LXJpZ2h0LWVmZmVjdFxuICAgICAgIyBTbyB0aGF0IHdlIGNhbiBhY3RpdmF0ZS12aXN1YWwtbW9kZSB3aXRob3V0IHNwZWNpYWwgdHJhbnNsYXRpb24gYWZ0ZXIgcmVzdG9yZWluZyBwcm9wZXJ0aWVzLlxuICAgICAgZW5kID0gdHJhbnNsYXRlUG9pbnRBbmRDbGlwKEBzZWxlY3Rpb24uZWRpdG9yLCBAZ2V0QnVmZmVyUmFuZ2UoKS5lbmQsICdiYWNrd2FyZCcpXG4gICAgICBpZiBAc2VsZWN0aW9uLmlzUmV2ZXJzZWQoKVxuICAgICAgICBwcm9wZXJ0aWVzID0ge2hlYWQ6IGhlYWQsIHRhaWw6IGVuZH1cbiAgICAgIGVsc2VcbiAgICAgICAgcHJvcGVydGllcyA9IHtoZWFkOiBlbmQsIHRhaWw6IHRhaWx9XG4gICAgQHNldFByb3BlcnRpZXMocHJvcGVydGllcylcblxuICBmaXhQcm9wZXJ0eVJvd1RvUm93UmFuZ2U6IC0+XG4gICAge2hlYWQsIHRhaWx9ID0gQGdldFByb3BlcnRpZXMoKVxuICAgIGlmIEBzZWxlY3Rpb24uaXNSZXZlcnNlZCgpXG4gICAgICBbaGVhZC5yb3csIHRhaWwucm93XSA9IEBzZWxlY3Rpb24uZ2V0QnVmZmVyUm93UmFuZ2UoKVxuICAgIGVsc2VcbiAgICAgIFt0YWlsLnJvdywgaGVhZC5yb3ddID0gQHNlbGVjdGlvbi5nZXRCdWZmZXJSb3dSYW5nZSgpXG5cbiAgIyBOT1RFOlxuICAjICd3aXNlJyBtdXN0IGJlICdjaGFyYWN0ZXJ3aXNlJyBvciAnbGluZXdpc2UnXG4gICMgVXNlIHRoaXMgZm9yIG5vcm1hbGl6ZWQobm9uLXNlbGVjdC1yaWdodC1lZCkgc2VsZWN0aW9uLlxuICBhcHBseVdpc2U6ICh3aXNlKSAtPlxuICAgIHN3aXRjaCB3aXNlXG4gICAgICB3aGVuICdjaGFyYWN0ZXJ3aXNlJ1xuICAgICAgICBAdHJhbnNsYXRlU2VsZWN0aW9uRW5kQW5kQ2xpcCgnZm9yd2FyZCcpICMgZXF1aXZhbGVudCB0byBjb3JlIHNlbGVjdGlvbi5zZWxlY3RSaWdodCBidXQga2VlcCBnb2FsQ29sdW1uXG4gICAgICB3aGVuICdsaW5ld2lzZSdcbiAgICAgICAgIyBFdmVuIGlmIGVuZC5jb2x1bW4gaXMgMCwgZXhwYW5kIG92ZXIgdGhhdCBlbmQucm93KCBkb24ndCB1c2Ugc2VsZWN0aW9uLmdldFJvd1JhbmdlKCkgKVxuICAgICAgICB7c3RhcnQsIGVuZH0gPSBAZ2V0QnVmZmVyUmFuZ2UoKVxuICAgICAgICBlbmRSb3cgPSBnZXRGb2xkRW5kUm93Rm9yUm93KEBzZWxlY3Rpb24uZWRpdG9yLCBlbmQucm93KSAjIGNvdmVyIGZvbGRlZCByb3dSYW5nZVxuICAgICAgICBAc2V0QnVmZmVyUmFuZ2UoZ2V0QnVmZmVyUmFuZ2VGb3JSb3dSYW5nZShAc2VsZWN0aW9uLmVkaXRvciwgW3N0YXJ0LnJvdywgZW5kUm93XSkpXG4gICAgICB3aGVuICdibG9ja3dpc2UnXG4gICAgICAgIG5ldyBCbG9ja3dpc2VTZWxlY3Rpb24oQHNlbGVjdGlvbilcblxuICBzZWxlY3RCeVByb3BlcnRpZXM6ICh7aGVhZCwgdGFpbH0pIC0+XG4gICAgIyBObyBwcm9ibGVtIGlmIGhlYWQgaXMgZ3JlYXRlciB0aGFuIHRhaWwsIFJhbmdlIGNvbnN0cnVjdG9yIHN3YXAgc3RhcnQvZW5kLlxuICAgIEBzZXRCdWZmZXJSYW5nZSBbdGFpbCwgaGVhZF0sXG4gICAgICBhdXRvc2Nyb2xsOiB0cnVlXG4gICAgICByZXZlcnNlZDogaGVhZC5pc0xlc3NUaGFuKHRhaWwpXG4gICAgICBrZWVwR29hbENvbHVtbjogZmFsc2VcblxuICAjIHNldCBzZWxlY3Rpb25zIGJ1ZmZlclJhbmdlIHdpdGggZGVmYXVsdCBvcHRpb24ge2F1dG9zY3JvbGw6IGZhbHNlLCBwcmVzZXJ2ZUZvbGRzOiB0cnVlfVxuICBzZXRCdWZmZXJSYW5nZTogKHJhbmdlLCBvcHRpb25zPXt9KSAtPlxuICAgIGlmIG9wdGlvbnMua2VlcEdvYWxDb2x1bW4gPyB0cnVlXG4gICAgICBnb2FsQ29sdW1uID0gQHNlbGVjdGlvbi5jdXJzb3IuZ29hbENvbHVtblxuICAgIGRlbGV0ZSBvcHRpb25zLmtlZXBHb2FsQ29sdW1uXG4gICAgb3B0aW9ucy5hdXRvc2Nyb2xsID89IGZhbHNlXG4gICAgb3B0aW9ucy5wcmVzZXJ2ZUZvbGRzID89IHRydWVcbiAgICBAc2VsZWN0aW9uLnNldEJ1ZmZlclJhbmdlKHJhbmdlLCBvcHRpb25zKVxuICAgIEBzZWxlY3Rpb24uY3Vyc29yLmdvYWxDb2x1bW4gPSBnb2FsQ29sdW1uIGlmIGdvYWxDb2x1bW4/XG5cbiAgaXNTaW5nbGVSb3c6IC0+XG4gICAgW3N0YXJ0Um93LCBlbmRSb3ddID0gQHNlbGVjdGlvbi5nZXRCdWZmZXJSb3dSYW5nZSgpXG4gICAgc3RhcnRSb3cgaXMgZW5kUm93XG5cbiAgaXNMaW5ld2lzZVJhbmdlOiAtPlxuICAgIGlzTGluZXdpc2VSYW5nZShAZ2V0QnVmZmVyUmFuZ2UoKSlcblxuICBkZXRlY3RXaXNlOiAtPlxuICAgIGlmIEBpc0xpbmV3aXNlUmFuZ2UoKVxuICAgICAgJ2xpbmV3aXNlJ1xuICAgIGVsc2VcbiAgICAgICdjaGFyYWN0ZXJ3aXNlJ1xuXG4gICMgZGlyZWN0aW9uIG11c3QgYmUgb25lIG9mIFsnZm9yd2FyZCcsICdiYWNrd2FyZCddXG4gIHRyYW5zbGF0ZVNlbGVjdGlvbkVuZEFuZENsaXA6IChkaXJlY3Rpb24pIC0+XG4gICAgbmV3UmFuZ2UgPSBnZXRSYW5nZUJ5VHJhbnNsYXRlUG9pbnRBbmRDbGlwKEBzZWxlY3Rpb24uZWRpdG9yLCBAZ2V0QnVmZmVyUmFuZ2UoKSwgXCJlbmRcIiwgZGlyZWN0aW9uKVxuICAgIEBzZXRCdWZmZXJSYW5nZShuZXdSYW5nZSlcblxuICAjIFJldHVybiBzZWxlY3Rpb24gZXh0ZW50IHRvIHJlcGxheSBibG9ja3dpc2Ugc2VsZWN0aW9uIG9uIGAuYCByZXBlYXRpbmcuXG4gIGdldEJsb2Nrd2lzZVNlbGVjdGlvbkV4dGVudDogLT5cbiAgICBoZWFkID0gQHNlbGVjdGlvbi5nZXRIZWFkQnVmZmVyUG9zaXRpb24oKVxuICAgIHRhaWwgPSBAc2VsZWN0aW9uLmdldFRhaWxCdWZmZXJQb3NpdGlvbigpXG4gICAgbmV3IFBvaW50KGhlYWQucm93IC0gdGFpbC5yb3csIGhlYWQuY29sdW1uIC0gdGFpbC5jb2x1bW4pXG5cbiAgIyBXaGF0J3MgdGhlIG5vcm1hbGl6ZT9cbiAgIyBOb3JtYWxpemF0aW9uIGlzIHJlc3RvcmUgc2VsZWN0aW9uIHJhbmdlIGZyb20gcHJvcGVydHkuXG4gICMgQXMgYSByZXN1bHQgaXQgcmFuZ2UgYmVjYW1lIHJhbmdlIHdoZXJlIGVuZCBvZiBzZWxlY3Rpb24gbW92ZWQgdG8gbGVmdC5cbiAgIyBUaGlzIGVuZC1tb3ZlLXRvLWxlZnQgZGUtZWZlY3Qgb2YgZW5kLW1vZGUtdG8tcmlnaHQgZWZmZWN0KCB0aGlzIGlzIHZpc3VhbC1tb2RlIG9yaWVudGF0aW9uIClcbiAgbm9ybWFsaXplOiAtPlxuICAgICMgZW1wdHkgc2VsZWN0aW9uIElTIGFscmVhZHkgJ25vcm1hbGl6ZWQnXG4gICAgcmV0dXJuIGlmIEBzZWxlY3Rpb24uaXNFbXB0eSgpXG4gICAgdW5sZXNzIEBoYXNQcm9wZXJ0aWVzKClcbiAgICAgIGlmIHNldHRpbmdzLmdldCgnc3RyaWN0QXNzZXJ0aW9uJylcbiAgICAgICAgYXNzZXJ0V2l0aEV4Y2VwdGlvbihmYWxzZSwgXCJhdHRlbXB0ZWQgdG8gbm9ybWFsaXplIGJ1dCBubyBwcm9wZXJ0aWVzIHRvIHJlc3RvcmVcIilcbiAgICAgIEBzYXZlUHJvcGVydGllcygpXG4gICAge2hlYWQsIHRhaWx9ID0gQGdldFByb3BlcnRpZXMoKVxuICAgIEBzZXRCdWZmZXJSYW5nZShbdGFpbCwgaGVhZF0pXG5cbnN3cmFwID0gKHNlbGVjdGlvbikgLT5cbiAgbmV3IFNlbGVjdGlvbldyYXBwZXIoc2VsZWN0aW9uKVxuXG4jIEJsb2Nrd2lzZVNlbGVjdGlvbiBwcm94eVxuc3dyYXAuZ2V0QmxvY2t3aXNlU2VsZWN0aW9ucyA9IChlZGl0b3IpIC0+XG4gIEJsb2Nrd2lzZVNlbGVjdGlvbi5nZXRTZWxlY3Rpb25zKGVkaXRvcilcblxuc3dyYXAuZ2V0TGFzdEJsb2Nrd2lzZVNlbGVjdGlvbnMgPSAoZWRpdG9yKSAtPlxuICBCbG9ja3dpc2VTZWxlY3Rpb24uZ2V0TGFzdFNlbGVjdGlvbihlZGl0b3IpXG5cbnN3cmFwLmdldEJsb2Nrd2lzZVNlbGVjdGlvbnNPcmRlcmVkQnlCdWZmZXJQb3NpdGlvbiA9IChlZGl0b3IpIC0+XG4gIEJsb2Nrd2lzZVNlbGVjdGlvbi5nZXRTZWxlY3Rpb25zT3JkZXJlZEJ5QnVmZmVyUG9zaXRpb24oZWRpdG9yKVxuXG5zd3JhcC5jbGVhckJsb2Nrd2lzZVNlbGVjdGlvbnMgPSAoZWRpdG9yKSAtPlxuICBCbG9ja3dpc2VTZWxlY3Rpb24uY2xlYXJTZWxlY3Rpb25zKGVkaXRvcilcblxuc3dyYXAuZ2V0U2VsZWN0aW9ucyA9IChlZGl0b3IpIC0+XG4gIGVkaXRvci5nZXRTZWxlY3Rpb25zKGVkaXRvcikubWFwKHN3cmFwKVxuXG5zd3JhcC5zZXRSZXZlcnNlZFN0YXRlID0gKGVkaXRvciwgcmV2ZXJzZWQpIC0+XG4gICRzZWxlY3Rpb24uc2V0UmV2ZXJzZWRTdGF0ZShyZXZlcnNlZCkgZm9yICRzZWxlY3Rpb24gaW4gQGdldFNlbGVjdGlvbnMoZWRpdG9yKVxuXG5zd3JhcC5kZXRlY3RXaXNlID0gKGVkaXRvcikgLT5cbiAgaWYgQGdldFNlbGVjdGlvbnMoZWRpdG9yKS5ldmVyeSgoJHNlbGVjdGlvbikgLT4gJHNlbGVjdGlvbi5kZXRlY3RXaXNlKCkgaXMgJ2xpbmV3aXNlJylcbiAgICAnbGluZXdpc2UnXG4gIGVsc2VcbiAgICAnY2hhcmFjdGVyd2lzZSdcblxuc3dyYXAuY2xlYXJQcm9wZXJ0aWVzID0gKGVkaXRvcikgLT5cbiAgJHNlbGVjdGlvbi5jbGVhclByb3BlcnRpZXMoKSBmb3IgJHNlbGVjdGlvbiBpbiBAZ2V0U2VsZWN0aW9ucyhlZGl0b3IpXG5cbnN3cmFwLmR1bXBQcm9wZXJ0aWVzID0gKGVkaXRvcikgLT5cbiAge2luc3BlY3R9ID0gcmVxdWlyZSAndXRpbCdcbiAgZm9yICRzZWxlY3Rpb24gaW4gQGdldFNlbGVjdGlvbnMoZWRpdG9yKSB3aGVuICRzZWxlY3Rpb24uaGFzUHJvcGVydGllcygpXG4gICAgY29uc29sZS5sb2cgaW5zcGVjdCgkc2VsZWN0aW9uLmdldFByb3BlcnRpZXMoKSlcblxuc3dyYXAubm9ybWFsaXplID0gKGVkaXRvcikgLT5cbiAgaWYgQmxvY2t3aXNlU2VsZWN0aW9uLmhhcyhlZGl0b3IpXG4gICAgZm9yIGJsb2Nrd2lzZVNlbGVjdGlvbiBpbiBCbG9ja3dpc2VTZWxlY3Rpb24uZ2V0U2VsZWN0aW9ucyhlZGl0b3IpXG4gICAgICBibG9ja3dpc2VTZWxlY3Rpb24ubm9ybWFsaXplKClcbiAgICBCbG9ja3dpc2VTZWxlY3Rpb24uY2xlYXJTZWxlY3Rpb25zKGVkaXRvcilcbiAgZWxzZVxuICAgIGZvciAkc2VsZWN0aW9uIGluIEBnZXRTZWxlY3Rpb25zKGVkaXRvcilcbiAgICAgICRzZWxlY3Rpb24ubm9ybWFsaXplKClcblxuc3dyYXAuaGFzUHJvcGVydGllcyA9IChlZGl0b3IpIC0+XG4gIEBnZXRTZWxlY3Rpb25zKGVkaXRvcikuZXZlcnkgKCRzZWxlY3Rpb24pIC0+ICRzZWxlY3Rpb24uaGFzUHJvcGVydGllcygpXG5cbiMgUmV0dXJuIGZ1bmN0aW9uIHRvIHJlc3RvcmVcbiMgVXNlZCBpbiB2bXAtbW92ZS1zZWxlY3RlZC10ZXh0XG5zd3JhcC5zd2l0Y2hUb0xpbmV3aXNlID0gKGVkaXRvcikgLT5cbiAgZm9yICRzZWxlY3Rpb24gaW4gc3dyYXAuZ2V0U2VsZWN0aW9ucyhlZGl0b3IpXG4gICAgJHNlbGVjdGlvbi5zYXZlUHJvcGVydGllcygpXG4gICAgJHNlbGVjdGlvbi5hcHBseVdpc2UoJ2xpbmV3aXNlJylcbiAgbmV3IERpc3Bvc2FibGUgLT5cbiAgICBmb3IgJHNlbGVjdGlvbiBpbiBzd3JhcC5nZXRTZWxlY3Rpb25zKGVkaXRvcilcbiAgICAgICRzZWxlY3Rpb24ubm9ybWFsaXplKClcbiAgICAgICRzZWxlY3Rpb24uYXBwbHlXaXNlKCdjaGFyYWN0ZXJ3aXNlJylcblxuc3dyYXAuZ2V0UHJvcGVydHlTdG9yZSA9IC0+XG4gIHByb3BlcnR5U3RvcmVcblxubW9kdWxlLmV4cG9ydHMgPSBzd3JhcFxuIl19
