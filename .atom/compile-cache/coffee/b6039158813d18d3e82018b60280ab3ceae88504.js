(function() {
  var BlockwiseSelection, Disposable, Point, Range, SelectionWrapper, assertWithException, getBufferRangeForRowRange, getEndOfLineForBufferRow, getRangeByTranslatePointAndClip, isLinewiseRange, limitNumber, propertyStore, ref, ref1, swrap, translatePointAndClip;

  ref = require('atom'), Range = ref.Range, Point = ref.Point, Disposable = ref.Disposable;

  ref1 = require('./utils'), translatePointAndClip = ref1.translatePointAndClip, getRangeByTranslatePointAndClip = ref1.getRangeByTranslatePointAndClip, getEndOfLineForBufferRow = ref1.getEndOfLineForBufferRow, getBufferRangeForRowRange = ref1.getBufferRangeForRowRange, limitNumber = ref1.limitNumber, isLinewiseRange = ref1.isLinewiseRange, assertWithException = ref1.assertWithException;

  BlockwiseSelection = null;

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
      if (this.hasProperties()) {
        ref2 = this.getProperties(), head = ref2.head, tail = ref2.tail;
        this.setProperties({
          head: tail,
          tail: head
        });
      }
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
      var end, ref2, start;
      assertWithException(this.hasProperties(), "trying to applyWise " + wise + " on properties-less selection");
      switch (wise) {
        case 'characterwise':
          return this.translateSelectionEndAndClip('forward');
        case 'linewise':
          ref2 = this.getBufferRange(), start = ref2.start, end = ref2.end;
          return this.setBufferRange(getBufferRangeForRowRange(this.selection.editor, [start.row, end.row]));
        case 'blockwise':
          if (BlockwiseSelection == null) {
            BlockwiseSelection = require('./blockwise-selection');
          }
          return new BlockwiseSelection(this.selection);
      }
    };

    SelectionWrapper.prototype.selectByProperties = function(arg, options) {
      var head, tail;
      head = arg.head, tail = arg.tail;
      this.setBufferRange([tail, head], options);
      return this.setReversedState(head.isLessThan(tail));
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
      if (this.selection.isEmpty()) {
        return;
      }
      assertWithException(this.hasProperties(), "attempted to normalize but no properties to restore");
      this.fixPropertyRowToRowRange();
      return this.selectByProperties(this.getProperties());
    };

    return SelectionWrapper;

  })();

  swrap = function(selection) {
    return new SelectionWrapper(selection);
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
    if (BlockwiseSelection == null) {
      BlockwiseSelection = require('./blockwise-selection');
    }
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvc2VsZWN0aW9uLXdyYXBwZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxNQUE2QixPQUFBLENBQVEsTUFBUixDQUE3QixFQUFDLGlCQUFELEVBQVEsaUJBQVIsRUFBZTs7RUFDZixPQVFJLE9BQUEsQ0FBUSxTQUFSLENBUkosRUFDRSxrREFERixFQUVFLHNFQUZGLEVBR0Usd0RBSEYsRUFJRSwwREFKRixFQUtFLDhCQUxGLEVBTUUsc0NBTkYsRUFPRTs7RUFFRixrQkFBQSxHQUFxQjs7RUFFckIsYUFBQSxHQUFnQixJQUFJOztFQUVkO0lBQ1MsMEJBQUMsVUFBRDtNQUFDLElBQUMsQ0FBQSxZQUFEO0lBQUQ7OytCQUNiLGFBQUEsR0FBZSxTQUFBO2FBQUcsYUFBYSxDQUFDLEdBQWQsQ0FBa0IsSUFBQyxDQUFBLFNBQW5CO0lBQUg7OytCQUNmLGFBQUEsR0FBZSxTQUFBO2FBQUcsYUFBYSxDQUFDLEdBQWQsQ0FBa0IsSUFBQyxDQUFBLFNBQW5CO0lBQUg7OytCQUNmLGFBQUEsR0FBZSxTQUFDLElBQUQ7YUFBVSxhQUFhLENBQUMsR0FBZCxDQUFrQixJQUFDLENBQUEsU0FBbkIsRUFBOEIsSUFBOUI7SUFBVjs7K0JBQ2YsZUFBQSxHQUFpQixTQUFBO2FBQUcsYUFBYSxFQUFDLE1BQUQsRUFBYixDQUFxQixJQUFDLENBQUEsU0FBdEI7SUFBSDs7K0JBRWpCLG9CQUFBLEdBQXNCLFNBQUMsS0FBRCxFQUFRLE9BQVI7TUFDcEIsSUFBRyxLQUFIO2VBQ0UsSUFBQyxDQUFBLGNBQUQsQ0FBZ0IsS0FBaEIsRUFBdUIsT0FBdkIsRUFERjs7SUFEb0I7OytCQUl0QixjQUFBLEdBQWdCLFNBQUE7YUFDZCxJQUFDLENBQUEsU0FBUyxDQUFDLGNBQVgsQ0FBQTtJQURjOzsr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QVAsR0FBaUI7QUEzTmpCIiwic291cmNlc0NvbnRlbnQiOlsie1JhbmdlLCBQb2ludCwgRGlzcG9zYWJsZX0gPSByZXF1aXJlICdhdG9tJ1xue1xuICB0cmFuc2xhdGVQb2ludEFuZENsaXBcbiAgZ2V0UmFuZ2VCeVRyYW5zbGF0ZVBvaW50QW5kQ2xpcFxuICBnZXRFbmRPZkxpbmVGb3JCdWZmZXJSb3dcbiAgZ2V0QnVmZmVyUmFuZ2VGb3JSb3dSYW5nZVxuICBsaW1pdE51bWJlclxuICBpc0xpbmV3aXNlUmFuZ2VcbiAgYXNzZXJ0V2l0aEV4Y2VwdGlvblxufSA9IHJlcXVpcmUgJy4vdXRpbHMnXG5CbG9ja3dpc2VTZWxlY3Rpb24gPSBudWxsXG5cbnByb3BlcnR5U3RvcmUgPSBuZXcgTWFwXG5cbmNsYXNzIFNlbGVjdGlvbldyYXBwZXJcbiAgY29uc3RydWN0b3I6IChAc2VsZWN0aW9uKSAtPlxuICBoYXNQcm9wZXJ0aWVzOiAtPiBwcm9wZXJ0eVN0b3JlLmhhcyhAc2VsZWN0aW9uKVxuICBnZXRQcm9wZXJ0aWVzOiAtPiBwcm9wZXJ0eVN0b3JlLmdldChAc2VsZWN0aW9uKVxuICBzZXRQcm9wZXJ0aWVzOiAocHJvcCkgLT4gcHJvcGVydHlTdG9yZS5zZXQoQHNlbGVjdGlvbiwgcHJvcClcbiAgY2xlYXJQcm9wZXJ0aWVzOiAtPiBwcm9wZXJ0eVN0b3JlLmRlbGV0ZShAc2VsZWN0aW9uKVxuXG4gIHNldEJ1ZmZlclJhbmdlU2FmZWx5OiAocmFuZ2UsIG9wdGlvbnMpIC0+XG4gICAgaWYgcmFuZ2VcbiAgICAgIEBzZXRCdWZmZXJSYW5nZShyYW5nZSwgb3B0aW9ucylcblxuICBnZXRCdWZmZXJSYW5nZTogLT5cbiAgICBAc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKClcblxuICBnZXRCdWZmZXJQb3NpdGlvbkZvcjogKHdoaWNoLCB7ZnJvbX09e30pIC0+XG4gICAgZm9yIF9mcm9tIGluIGZyb20gPyBbJ3NlbGVjdGlvbiddXG4gICAgICBzd2l0Y2ggX2Zyb21cbiAgICAgICAgd2hlbiAncHJvcGVydHknXG4gICAgICAgICAgY29udGludWUgdW5sZXNzIEBoYXNQcm9wZXJ0aWVzKClcblxuICAgICAgICAgIHByb3BlcnRpZXMgPSBAZ2V0UHJvcGVydGllcygpXG4gICAgICAgICAgcmV0dXJuIHN3aXRjaCB3aGljaFxuICAgICAgICAgICAgd2hlbiAnc3RhcnQnIHRoZW4gKGlmIEBzZWxlY3Rpb24uaXNSZXZlcnNlZCgpIHRoZW4gcHJvcGVydGllcy5oZWFkIGVsc2UgcHJvcGVydGllcy50YWlsKVxuICAgICAgICAgICAgd2hlbiAnZW5kJyB0aGVuIChpZiBAc2VsZWN0aW9uLmlzUmV2ZXJzZWQoKSB0aGVuIHByb3BlcnRpZXMudGFpbCBlbHNlIHByb3BlcnRpZXMuaGVhZClcbiAgICAgICAgICAgIHdoZW4gJ2hlYWQnIHRoZW4gcHJvcGVydGllcy5oZWFkXG4gICAgICAgICAgICB3aGVuICd0YWlsJyB0aGVuIHByb3BlcnRpZXMudGFpbFxuXG4gICAgICAgIHdoZW4gJ3NlbGVjdGlvbidcbiAgICAgICAgICByZXR1cm4gc3dpdGNoIHdoaWNoXG4gICAgICAgICAgICB3aGVuICdzdGFydCcgdGhlbiBAc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKCkuc3RhcnRcbiAgICAgICAgICAgIHdoZW4gJ2VuZCcgdGhlbiBAc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKCkuZW5kXG4gICAgICAgICAgICB3aGVuICdoZWFkJyB0aGVuIEBzZWxlY3Rpb24uZ2V0SGVhZEJ1ZmZlclBvc2l0aW9uKClcbiAgICAgICAgICAgIHdoZW4gJ3RhaWwnIHRoZW4gQHNlbGVjdGlvbi5nZXRUYWlsQnVmZmVyUG9zaXRpb24oKVxuICAgIG51bGxcblxuICBzZXRCdWZmZXJQb3NpdGlvblRvOiAod2hpY2gpIC0+XG4gICAgQHNlbGVjdGlvbi5jdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24oQGdldEJ1ZmZlclBvc2l0aW9uRm9yKHdoaWNoKSlcblxuICBzZXRSZXZlcnNlZFN0YXRlOiAoaXNSZXZlcnNlZCkgLT5cbiAgICByZXR1cm4gaWYgQHNlbGVjdGlvbi5pc1JldmVyc2VkKCkgaXMgaXNSZXZlcnNlZFxuXG4gICAgaWYgQGhhc1Byb3BlcnRpZXMoKVxuICAgICAge2hlYWQsIHRhaWx9ID0gQGdldFByb3BlcnRpZXMoKVxuICAgICAgQHNldFByb3BlcnRpZXMoaGVhZDogdGFpbCwgdGFpbDogaGVhZClcblxuICAgIEBzZXRCdWZmZXJSYW5nZSBAZ2V0QnVmZmVyUmFuZ2UoKSxcbiAgICAgIGF1dG9zY3JvbGw6IHRydWVcbiAgICAgIHJldmVyc2VkOiBpc1JldmVyc2VkXG4gICAgICBrZWVwR29hbENvbHVtbjogZmFsc2VcblxuICBnZXRSb3dzOiAtPlxuICAgIFtzdGFydFJvdywgZW5kUm93XSA9IEBzZWxlY3Rpb24uZ2V0QnVmZmVyUm93UmFuZ2UoKVxuICAgIFtzdGFydFJvdy4uZW5kUm93XVxuXG4gIGdldFJvd0NvdW50OiAtPlxuICAgIEBnZXRSb3dzKCkubGVuZ3RoXG5cbiAgZ2V0VGFpbEJ1ZmZlclJhbmdlOiAtPlxuICAgIHtlZGl0b3J9ID0gQHNlbGVjdGlvblxuICAgIHRhaWxQb2ludCA9IEBzZWxlY3Rpb24uZ2V0VGFpbEJ1ZmZlclBvc2l0aW9uKClcbiAgICBpZiBAc2VsZWN0aW9uLmlzUmV2ZXJzZWQoKVxuICAgICAgcG9pbnQgPSB0cmFuc2xhdGVQb2ludEFuZENsaXAoZWRpdG9yLCB0YWlsUG9pbnQsICdiYWNrd2FyZCcpXG4gICAgICBuZXcgUmFuZ2UocG9pbnQsIHRhaWxQb2ludClcbiAgICBlbHNlXG4gICAgICBwb2ludCA9IHRyYW5zbGF0ZVBvaW50QW5kQ2xpcChlZGl0b3IsIHRhaWxQb2ludCwgJ2ZvcndhcmQnKVxuICAgICAgbmV3IFJhbmdlKHRhaWxQb2ludCwgcG9pbnQpXG5cbiAgc2F2ZVByb3BlcnRpZXM6IChpc05vcm1hbGl6ZWQpIC0+XG4gICAgaGVhZCA9IEBzZWxlY3Rpb24uZ2V0SGVhZEJ1ZmZlclBvc2l0aW9uKClcbiAgICB0YWlsID0gQHNlbGVjdGlvbi5nZXRUYWlsQnVmZmVyUG9zaXRpb24oKVxuICAgIGlmIEBzZWxlY3Rpb24uaXNFbXB0eSgpIG9yIGlzTm9ybWFsaXplZFxuICAgICAgcHJvcGVydGllcyA9IHtoZWFkLCB0YWlsfVxuICAgIGVsc2VcbiAgICAgICMgV2Ugc2VsZWN0UmlnaHQtZWQgaW4gdmlzdWFsLW1vZGUsIHRoaXMgdHJhbnNsYXRpb24gZGUtZWZmZWN0IHNlbGVjdC1yaWdodC1lZmZlY3RcbiAgICAgICMgU28gdGhhdCB3ZSBjYW4gYWN0aXZhdGUtdmlzdWFsLW1vZGUgd2l0aG91dCBzcGVjaWFsIHRyYW5zbGF0aW9uIGFmdGVyIHJlc3RvcmVpbmcgcHJvcGVydGllcy5cbiAgICAgIGVuZCA9IHRyYW5zbGF0ZVBvaW50QW5kQ2xpcChAc2VsZWN0aW9uLmVkaXRvciwgQGdldEJ1ZmZlclJhbmdlKCkuZW5kLCAnYmFja3dhcmQnKVxuICAgICAgaWYgQHNlbGVjdGlvbi5pc1JldmVyc2VkKClcbiAgICAgICAgcHJvcGVydGllcyA9IHtoZWFkOiBoZWFkLCB0YWlsOiBlbmR9XG4gICAgICBlbHNlXG4gICAgICAgIHByb3BlcnRpZXMgPSB7aGVhZDogZW5kLCB0YWlsOiB0YWlsfVxuICAgIEBzZXRQcm9wZXJ0aWVzKHByb3BlcnRpZXMpXG5cbiAgZml4UHJvcGVydHlSb3dUb1Jvd1JhbmdlOiAtPlxuICAgIHtoZWFkLCB0YWlsfSA9IEBnZXRQcm9wZXJ0aWVzKClcbiAgICBpZiBAc2VsZWN0aW9uLmlzUmV2ZXJzZWQoKVxuICAgICAgW2hlYWQucm93LCB0YWlsLnJvd10gPSBAc2VsZWN0aW9uLmdldEJ1ZmZlclJvd1JhbmdlKClcbiAgICBlbHNlXG4gICAgICBbdGFpbC5yb3csIGhlYWQucm93XSA9IEBzZWxlY3Rpb24uZ2V0QnVmZmVyUm93UmFuZ2UoKVxuXG4gICMgTk9URTpcbiAgIyAnd2lzZScgbXVzdCBiZSAnY2hhcmFjdGVyd2lzZScgb3IgJ2xpbmV3aXNlJ1xuICAjIFVzZSB0aGlzIGZvciBub3JtYWxpemVkKG5vbi1zZWxlY3QtcmlnaHQtZWQpIHNlbGVjdGlvbi5cbiAgYXBwbHlXaXNlOiAod2lzZSkgLT5cbiAgICBhc3NlcnRXaXRoRXhjZXB0aW9uKEBoYXNQcm9wZXJ0aWVzKCksIFwidHJ5aW5nIHRvIGFwcGx5V2lzZSAje3dpc2V9IG9uIHByb3BlcnRpZXMtbGVzcyBzZWxlY3Rpb25cIilcbiAgICBzd2l0Y2ggd2lzZVxuICAgICAgd2hlbiAnY2hhcmFjdGVyd2lzZSdcbiAgICAgICAgQHRyYW5zbGF0ZVNlbGVjdGlvbkVuZEFuZENsaXAoJ2ZvcndhcmQnKSAjIGVxdWl2YWxlbnQgdG8gY29yZSBzZWxlY3Rpb24uc2VsZWN0UmlnaHQgYnV0IGtlZXAgZ29hbENvbHVtblxuICAgICAgd2hlbiAnbGluZXdpc2UnXG4gICAgICAgICMgRXZlbiBpZiBlbmQuY29sdW1uIGlzIDAsIGV4cGFuZCBvdmVyIHRoYXQgZW5kLnJvdyggZG9uJ3QgY2FyZSBzZWxlY3Rpb24uZ2V0Um93UmFuZ2UoKSApXG4gICAgICAgIHtzdGFydCwgZW5kfSA9IEBnZXRCdWZmZXJSYW5nZSgpXG4gICAgICAgIEBzZXRCdWZmZXJSYW5nZShnZXRCdWZmZXJSYW5nZUZvclJvd1JhbmdlKEBzZWxlY3Rpb24uZWRpdG9yLCBbc3RhcnQucm93LCBlbmQucm93XSkpXG4gICAgICB3aGVuICdibG9ja3dpc2UnXG4gICAgICAgIEJsb2Nrd2lzZVNlbGVjdGlvbiA/PSByZXF1aXJlICcuL2Jsb2Nrd2lzZS1zZWxlY3Rpb24nXG4gICAgICAgIG5ldyBCbG9ja3dpc2VTZWxlY3Rpb24oQHNlbGVjdGlvbilcblxuICBzZWxlY3RCeVByb3BlcnRpZXM6ICh7aGVhZCwgdGFpbH0sIG9wdGlvbnMpIC0+XG4gICAgIyBObyBwcm9ibGVtIGlmIGhlYWQgaXMgZ3JlYXRlciB0aGFuIHRhaWwsIFJhbmdlIGNvbnN0cnVjdG9yIHN3YXAgc3RhcnQvZW5kLlxuICAgIEBzZXRCdWZmZXJSYW5nZShbdGFpbCwgaGVhZF0sIG9wdGlvbnMpXG4gICAgQHNldFJldmVyc2VkU3RhdGUoaGVhZC5pc0xlc3NUaGFuKHRhaWwpKVxuXG4gICMgc2V0IHNlbGVjdGlvbnMgYnVmZmVyUmFuZ2Ugd2l0aCBkZWZhdWx0IG9wdGlvbiB7YXV0b3Njcm9sbDogZmFsc2UsIHByZXNlcnZlRm9sZHM6IHRydWV9XG4gIHNldEJ1ZmZlclJhbmdlOiAocmFuZ2UsIG9wdGlvbnM9e30pIC0+XG4gICAgaWYgb3B0aW9ucy5rZWVwR29hbENvbHVtbiA/IHRydWVcbiAgICAgIGdvYWxDb2x1bW4gPSBAc2VsZWN0aW9uLmN1cnNvci5nb2FsQ29sdW1uXG4gICAgZGVsZXRlIG9wdGlvbnMua2VlcEdvYWxDb2x1bW5cbiAgICBvcHRpb25zLmF1dG9zY3JvbGwgPz0gZmFsc2VcbiAgICBvcHRpb25zLnByZXNlcnZlRm9sZHMgPz0gdHJ1ZVxuICAgIEBzZWxlY3Rpb24uc2V0QnVmZmVyUmFuZ2UocmFuZ2UsIG9wdGlvbnMpXG4gICAgQHNlbGVjdGlvbi5jdXJzb3IuZ29hbENvbHVtbiA9IGdvYWxDb2x1bW4gaWYgZ29hbENvbHVtbj9cblxuICBpc1NpbmdsZVJvdzogLT5cbiAgICBbc3RhcnRSb3csIGVuZFJvd10gPSBAc2VsZWN0aW9uLmdldEJ1ZmZlclJvd1JhbmdlKClcbiAgICBzdGFydFJvdyBpcyBlbmRSb3dcblxuICBpc0xpbmV3aXNlUmFuZ2U6IC0+XG4gICAgaXNMaW5ld2lzZVJhbmdlKEBnZXRCdWZmZXJSYW5nZSgpKVxuXG4gIGRldGVjdFdpc2U6IC0+XG4gICAgaWYgQGlzTGluZXdpc2VSYW5nZSgpXG4gICAgICAnbGluZXdpc2UnXG4gICAgZWxzZVxuICAgICAgJ2NoYXJhY3Rlcndpc2UnXG5cbiAgIyBkaXJlY3Rpb24gbXVzdCBiZSBvbmUgb2YgWydmb3J3YXJkJywgJ2JhY2t3YXJkJ11cbiAgdHJhbnNsYXRlU2VsZWN0aW9uRW5kQW5kQ2xpcDogKGRpcmVjdGlvbikgLT5cbiAgICBuZXdSYW5nZSA9IGdldFJhbmdlQnlUcmFuc2xhdGVQb2ludEFuZENsaXAoQHNlbGVjdGlvbi5lZGl0b3IsIEBnZXRCdWZmZXJSYW5nZSgpLCBcImVuZFwiLCBkaXJlY3Rpb24pXG4gICAgQHNldEJ1ZmZlclJhbmdlKG5ld1JhbmdlKVxuXG4gICMgUmV0dXJuIHNlbGVjdGlvbiBleHRlbnQgdG8gcmVwbGF5IGJsb2Nrd2lzZSBzZWxlY3Rpb24gb24gYC5gIHJlcGVhdGluZy5cbiAgZ2V0QmxvY2t3aXNlU2VsZWN0aW9uRXh0ZW50OiAtPlxuICAgIGhlYWQgPSBAc2VsZWN0aW9uLmdldEhlYWRCdWZmZXJQb3NpdGlvbigpXG4gICAgdGFpbCA9IEBzZWxlY3Rpb24uZ2V0VGFpbEJ1ZmZlclBvc2l0aW9uKClcbiAgICBuZXcgUG9pbnQoaGVhZC5yb3cgLSB0YWlsLnJvdywgaGVhZC5jb2x1bW4gLSB0YWlsLmNvbHVtbilcblxuICAjIFdoYXQncyB0aGUgbm9ybWFsaXplP1xuICAjIE5vcm1hbGl6YXRpb24gaXMgcmVzdG9yZSBzZWxlY3Rpb24gcmFuZ2UgZnJvbSBwcm9wZXJ0eS5cbiAgIyBBcyBhIHJlc3VsdCBpdCByYW5nZSBiZWNhbWUgcmFuZ2Ugd2hlcmUgZW5kIG9mIHNlbGVjdGlvbiBtb3ZlZCB0byBsZWZ0LlxuICAjIFRoaXMgZW5kLW1vdmUtdG8tbGVmdCBkZS1lZmVjdCBvZiBlbmQtbW9kZS10by1yaWdodCBlZmZlY3QoIHRoaXMgaXMgdmlzdWFsLW1vZGUgb3JpZW50YXRpb24gKVxuICBub3JtYWxpemU6IC0+XG4gICAgIyBlbXB0eSBzZWxlY3Rpb24gSVMgYWxyZWFkeSAnbm9ybWFsaXplZCdcbiAgICByZXR1cm4gaWYgQHNlbGVjdGlvbi5pc0VtcHR5KClcbiAgICBhc3NlcnRXaXRoRXhjZXB0aW9uKEBoYXNQcm9wZXJ0aWVzKCksIFwiYXR0ZW1wdGVkIHRvIG5vcm1hbGl6ZSBidXQgbm8gcHJvcGVydGllcyB0byByZXN0b3JlXCIpXG4gICAgQGZpeFByb3BlcnR5Um93VG9Sb3dSYW5nZSgpXG4gICAgQHNlbGVjdEJ5UHJvcGVydGllcyhAZ2V0UHJvcGVydGllcygpKVxuXG5zd3JhcCA9IChzZWxlY3Rpb24pIC0+XG4gIG5ldyBTZWxlY3Rpb25XcmFwcGVyKHNlbGVjdGlvbilcblxuc3dyYXAuZ2V0U2VsZWN0aW9ucyA9IChlZGl0b3IpIC0+XG4gIGVkaXRvci5nZXRTZWxlY3Rpb25zKGVkaXRvcikubWFwKHN3cmFwKVxuXG5zd3JhcC5zZXRSZXZlcnNlZFN0YXRlID0gKGVkaXRvciwgcmV2ZXJzZWQpIC0+XG4gICRzZWxlY3Rpb24uc2V0UmV2ZXJzZWRTdGF0ZShyZXZlcnNlZCkgZm9yICRzZWxlY3Rpb24gaW4gQGdldFNlbGVjdGlvbnMoZWRpdG9yKVxuXG5zd3JhcC5kZXRlY3RXaXNlID0gKGVkaXRvcikgLT5cbiAgaWYgQGdldFNlbGVjdGlvbnMoZWRpdG9yKS5ldmVyeSgoJHNlbGVjdGlvbikgLT4gJHNlbGVjdGlvbi5kZXRlY3RXaXNlKCkgaXMgJ2xpbmV3aXNlJylcbiAgICAnbGluZXdpc2UnXG4gIGVsc2VcbiAgICAnY2hhcmFjdGVyd2lzZSdcblxuc3dyYXAuY2xlYXJQcm9wZXJ0aWVzID0gKGVkaXRvcikgLT5cbiAgJHNlbGVjdGlvbi5jbGVhclByb3BlcnRpZXMoKSBmb3IgJHNlbGVjdGlvbiBpbiBAZ2V0U2VsZWN0aW9ucyhlZGl0b3IpXG5cbnN3cmFwLmR1bXBQcm9wZXJ0aWVzID0gKGVkaXRvcikgLT5cbiAge2luc3BlY3R9ID0gcmVxdWlyZSAndXRpbCdcbiAgZm9yICRzZWxlY3Rpb24gaW4gQGdldFNlbGVjdGlvbnMoZWRpdG9yKSB3aGVuICRzZWxlY3Rpb24uaGFzUHJvcGVydGllcygpXG4gICAgY29uc29sZS5sb2cgaW5zcGVjdCgkc2VsZWN0aW9uLmdldFByb3BlcnRpZXMoKSlcblxuc3dyYXAubm9ybWFsaXplID0gKGVkaXRvcikgLT5cbiAgQmxvY2t3aXNlU2VsZWN0aW9uID89IHJlcXVpcmUgJy4vYmxvY2t3aXNlLXNlbGVjdGlvbidcbiAgaWYgQmxvY2t3aXNlU2VsZWN0aW9uLmhhcyhlZGl0b3IpI2Jsb2Nrd2lzZVNlbGVjdGlvbnMgPVxuICAgIGZvciBibG9ja3dpc2VTZWxlY3Rpb24gaW4gQmxvY2t3aXNlU2VsZWN0aW9uLmdldFNlbGVjdGlvbnMoZWRpdG9yKVxuICAgICAgYmxvY2t3aXNlU2VsZWN0aW9uLm5vcm1hbGl6ZSgpXG4gICAgQmxvY2t3aXNlU2VsZWN0aW9uLmNsZWFyU2VsZWN0aW9ucyhlZGl0b3IpXG4gIGVsc2VcbiAgICBmb3IgJHNlbGVjdGlvbiBpbiBAZ2V0U2VsZWN0aW9ucyhlZGl0b3IpXG4gICAgICAkc2VsZWN0aW9uLm5vcm1hbGl6ZSgpXG5cbnN3cmFwLmhhc1Byb3BlcnRpZXMgPSAoZWRpdG9yKSAtPlxuICBAZ2V0U2VsZWN0aW9ucyhlZGl0b3IpLmV2ZXJ5ICgkc2VsZWN0aW9uKSAtPiAkc2VsZWN0aW9uLmhhc1Byb3BlcnRpZXMoKVxuXG4jIFJldHVybiBmdW5jdGlvbiB0byByZXN0b3JlXG4jIFVzZWQgaW4gdm1wLW1vdmUtc2VsZWN0ZWQtdGV4dFxuc3dyYXAuc3dpdGNoVG9MaW5ld2lzZSA9IChlZGl0b3IpIC0+XG4gIGZvciAkc2VsZWN0aW9uIGluIHN3cmFwLmdldFNlbGVjdGlvbnMoZWRpdG9yKVxuICAgICRzZWxlY3Rpb24uc2F2ZVByb3BlcnRpZXMoKVxuICAgICRzZWxlY3Rpb24uYXBwbHlXaXNlKCdsaW5ld2lzZScpXG4gIG5ldyBEaXNwb3NhYmxlIC0+XG4gICAgZm9yICRzZWxlY3Rpb24gaW4gc3dyYXAuZ2V0U2VsZWN0aW9ucyhlZGl0b3IpXG4gICAgICAkc2VsZWN0aW9uLm5vcm1hbGl6ZSgpXG4gICAgICAkc2VsZWN0aW9uLmFwcGx5V2lzZSgnY2hhcmFjdGVyd2lzZScpXG5cbnN3cmFwLmdldFByb3BlcnR5U3RvcmUgPSAtPlxuICBwcm9wZXJ0eVN0b3JlXG5cbm1vZHVsZS5leHBvcnRzID0gc3dyYXBcbiJdfQ==
