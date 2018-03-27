(function() {
  var BlockwiseSelection, Disposable, Point, Range, SelectionWrapper, assertWithException, getBufferRangeForRowRange, getEndOfLineForBufferRow, getRangeByTranslatePointAndClip, isLinewiseRange, limitNumber, propertyStore, ref, ref1, settings, swrap, translatePointAndClip;

  ref = require('atom'), Range = ref.Range, Point = ref.Point, Disposable = ref.Disposable;

  ref1 = require('./utils'), translatePointAndClip = ref1.translatePointAndClip, getRangeByTranslatePointAndClip = ref1.getRangeByTranslatePointAndClip, getEndOfLineForBufferRow = ref1.getEndOfLineForBufferRow, getBufferRangeForRowRange = ref1.getBufferRangeForRowRange, limitNumber = ref1.limitNumber, isLinewiseRange = ref1.isLinewiseRange, assertWithException = ref1.assertWithException;

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
      var end, ref2, start;
      switch (wise) {
        case 'characterwise':
          return this.translateSelectionEndAndClip('forward');
        case 'linewise':
          ref2 = this.getBufferRange(), start = ref2.start, end = ref2.end;
          return this.setBufferRange(getBufferRangeForRowRange(this.selection.editor, [start.row, end.row]));
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvc2VsZWN0aW9uLXdyYXBwZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxNQUE2QixPQUFBLENBQVEsTUFBUixDQUE3QixFQUFDLGlCQUFELEVBQVEsaUJBQVIsRUFBZTs7RUFDZixPQVFJLE9BQUEsQ0FBUSxTQUFSLENBUkosRUFDRSxrREFERixFQUVFLHNFQUZGLEVBR0Usd0RBSEYsRUFJRSwwREFKRixFQUtFLDhCQUxGLEVBTUUsc0NBTkYsRUFPRTs7RUFFRixRQUFBLEdBQVcsT0FBQSxDQUFRLFlBQVI7O0VBQ1gsa0JBQUEsR0FBcUIsT0FBQSxDQUFRLHVCQUFSOztFQUVyQixhQUFBLEdBQWdCLElBQUk7O0VBRWQ7SUFDUywwQkFBQyxVQUFEO01BQUMsSUFBQyxDQUFBLFlBQUQ7SUFBRDs7K0JBQ2IsYUFBQSxHQUFlLFNBQUE7YUFBRyxhQUFhLENBQUMsR0FBZCxDQUFrQixJQUFDLENBQUEsU0FBbkI7SUFBSDs7K0JBQ2YsYUFBQSxHQUFlLFNBQUE7YUFBRyxhQUFhLENBQUMsR0FBZCxDQUFrQixJQUFDLENBQUEsU0FBbkI7SUFBSDs7K0JBQ2YsYUFBQSxHQUFlLFNBQUMsSUFBRDthQUFVLGFBQWEsQ0FBQyxHQUFkLENBQWtCLElBQUMsQ0FBQSxTQUFuQixFQUE4QixJQUE5QjtJQUFWOzsrQkFDZixlQUFBLEdBQWlCLFNBQUE7YUFBRyxhQUFhLEVBQUMsTUFBRCxFQUFiLENBQXFCLElBQUMsQ0FBQSxTQUF0QjtJQUFIOzsrQkFFakIsb0JBQUEsR0FBc0IsU0FBQyxLQUFELEVBQVEsT0FBUjtNQUNwQixJQUFHLEtBQUg7ZUFDRSxJQUFDLENBQUEsY0FBRCxDQUFnQixLQUFoQixFQUF1QixPQUF2QixFQURGOztJQURvQjs7K0JBSXRCLGNBQUEsR0FBZ0Is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QUE2QixTQUFDLFVBQUQ7YUFBZ0IsVUFBVSxDQUFDLGFBQVgsQ0FBQTtJQUFoQixDQUE3QjtFQURvQjs7RUFLdEIsS0FBSyxDQUFDLGdCQUFOLEdBQXlCLFNBQUMsTUFBRDtBQUN2QixRQUFBO0FBQUE7QUFBQSxTQUFBLHNDQUFBOztNQUNFLFVBQVUsQ0FBQyxjQUFYLENBQUE7TUFDQSxVQUFVLENBQUMsU0FBWCxDQUFxQixVQUFyQjtBQUZGO1dBR0ksSUFBQSxVQUFBLENBQVcsU0FBQTtBQUNiLFVBQUE7QUFBQTtBQUFBO1dBQUEsd0NBQUE7O1FBQ0UsVUFBVSxDQUFDLFNBQVgsQ0FBQTtxQkFDQSxVQUFVLENBQUMsU0FBWCxDQUFxQixlQUFyQjtBQUZGOztJQURhLENBQVg7RUFKbUI7O0VBU3pCLEtBQUssQ0FBQyxnQkFBTixHQUF5QixTQUFBO1dBQ3ZCO0VBRHVCOztFQUd6QixNQUFNLENBQUMsT0FBUCxHQUFpQjtBQTNPakIiLCJzb3VyY2VzQ29udGVudCI6WyJ7UmFuZ2UsIFBvaW50LCBEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2F0b20nXG57XG4gIHRyYW5zbGF0ZVBvaW50QW5kQ2xpcFxuICBnZXRSYW5nZUJ5VHJhbnNsYXRlUG9pbnRBbmRDbGlwXG4gIGdldEVuZE9mTGluZUZvckJ1ZmZlclJvd1xuICBnZXRCdWZmZXJSYW5nZUZvclJvd1JhbmdlXG4gIGxpbWl0TnVtYmVyXG4gIGlzTGluZXdpc2VSYW5nZVxuICBhc3NlcnRXaXRoRXhjZXB0aW9uXG59ID0gcmVxdWlyZSAnLi91dGlscydcbnNldHRpbmdzID0gcmVxdWlyZSAnLi9zZXR0aW5ncydcbkJsb2Nrd2lzZVNlbGVjdGlvbiA9IHJlcXVpcmUgJy4vYmxvY2t3aXNlLXNlbGVjdGlvbidcblxucHJvcGVydHlTdG9yZSA9IG5ldyBNYXBcblxuY2xhc3MgU2VsZWN0aW9uV3JhcHBlclxuICBjb25zdHJ1Y3RvcjogKEBzZWxlY3Rpb24pIC0+XG4gIGhhc1Byb3BlcnRpZXM6IC0+IHByb3BlcnR5U3RvcmUuaGFzKEBzZWxlY3Rpb24pXG4gIGdldFByb3BlcnRpZXM6IC0+IHByb3BlcnR5U3RvcmUuZ2V0KEBzZWxlY3Rpb24pXG4gIHNldFByb3BlcnRpZXM6IChwcm9wKSAtPiBwcm9wZXJ0eVN0b3JlLnNldChAc2VsZWN0aW9uLCBwcm9wKVxuICBjbGVhclByb3BlcnRpZXM6IC0+IHByb3BlcnR5U3RvcmUuZGVsZXRlKEBzZWxlY3Rpb24pXG5cbiAgc2V0QnVmZmVyUmFuZ2VTYWZlbHk6IChyYW5nZSwgb3B0aW9ucykgLT5cbiAgICBpZiByYW5nZVxuICAgICAgQHNldEJ1ZmZlclJhbmdlKHJhbmdlLCBvcHRpb25zKVxuXG4gIGdldEJ1ZmZlclJhbmdlOiAtPlxuICAgIEBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKVxuXG4gIGdldEJ1ZmZlclBvc2l0aW9uRm9yOiAod2hpY2gsIHtmcm9tfT17fSkgLT5cbiAgICBmb3IgX2Zyb20gaW4gZnJvbSA/IFsnc2VsZWN0aW9uJ11cbiAgICAgIHN3aXRjaCBfZnJvbVxuICAgICAgICB3aGVuICdwcm9wZXJ0eSdcbiAgICAgICAgICBjb250aW51ZSB1bmxlc3MgQGhhc1Byb3BlcnRpZXMoKVxuXG4gICAgICAgICAgcHJvcGVydGllcyA9IEBnZXRQcm9wZXJ0aWVzKClcbiAgICAgICAgICByZXR1cm4gc3dpdGNoIHdoaWNoXG4gICAgICAgICAgICB3aGVuICdzdGFydCcgdGhlbiAoaWYgQHNlbGVjdGlvbi5pc1JldmVyc2VkKCkgdGhlbiBwcm9wZXJ0aWVzLmhlYWQgZWxzZSBwcm9wZXJ0aWVzLnRhaWwpXG4gICAgICAgICAgICB3aGVuICdlbmQnIHRoZW4gKGlmIEBzZWxlY3Rpb24uaXNSZXZlcnNlZCgpIHRoZW4gcHJvcGVydGllcy50YWlsIGVsc2UgcHJvcGVydGllcy5oZWFkKVxuICAgICAgICAgICAgd2hlbiAnaGVhZCcgdGhlbiBwcm9wZXJ0aWVzLmhlYWRcbiAgICAgICAgICAgIHdoZW4gJ3RhaWwnIHRoZW4gcHJvcGVydGllcy50YWlsXG5cbiAgICAgICAgd2hlbiAnc2VsZWN0aW9uJ1xuICAgICAgICAgIHJldHVybiBzd2l0Y2ggd2hpY2hcbiAgICAgICAgICAgIHdoZW4gJ3N0YXJ0JyB0aGVuIEBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKS5zdGFydFxuICAgICAgICAgICAgd2hlbiAnZW5kJyB0aGVuIEBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKS5lbmRcbiAgICAgICAgICAgIHdoZW4gJ2hlYWQnIHRoZW4gQHNlbGVjdGlvbi5nZXRIZWFkQnVmZmVyUG9zaXRpb24oKVxuICAgICAgICAgICAgd2hlbiAndGFpbCcgdGhlbiBAc2VsZWN0aW9uLmdldFRhaWxCdWZmZXJQb3NpdGlvbigpXG4gICAgbnVsbFxuXG4gIHNldEJ1ZmZlclBvc2l0aW9uVG86ICh3aGljaCkgLT5cbiAgICBAc2VsZWN0aW9uLmN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihAZ2V0QnVmZmVyUG9zaXRpb25Gb3Iod2hpY2gpKVxuXG4gIHNldFJldmVyc2VkU3RhdGU6IChpc1JldmVyc2VkKSAtPlxuICAgIHJldHVybiBpZiBAc2VsZWN0aW9uLmlzUmV2ZXJzZWQoKSBpcyBpc1JldmVyc2VkXG4gICAgYXNzZXJ0V2l0aEV4Y2VwdGlvbihAaGFzUHJvcGVydGllcygpLCBcInRyeWluZyB0byByZXZlcnNlIHNlbGVjdGlvbiB3aGljaCBpcyBub24tZW1wdHkgYW5kIHByb3BlcnR5LWxlc3NzXCIpXG5cbiAgICB7aGVhZCwgdGFpbH0gPSBAZ2V0UHJvcGVydGllcygpXG4gICAgQHNldFByb3BlcnRpZXMoaGVhZDogdGFpbCwgdGFpbDogaGVhZClcblxuICAgIEBzZXRCdWZmZXJSYW5nZSBAZ2V0QnVmZmVyUmFuZ2UoKSxcbiAgICAgIGF1dG9zY3JvbGw6IHRydWVcbiAgICAgIHJldmVyc2VkOiBpc1JldmVyc2VkXG4gICAgICBrZWVwR29hbENvbHVtbjogZmFsc2VcblxuICBnZXRSb3dzOiAtPlxuICAgIFtzdGFydFJvdywgZW5kUm93XSA9IEBzZWxlY3Rpb24uZ2V0QnVmZmVyUm93UmFuZ2UoKVxuICAgIFtzdGFydFJvdy4uZW5kUm93XVxuXG4gIGdldFJvd0NvdW50OiAtPlxuICAgIEBnZXRSb3dzKCkubGVuZ3RoXG5cbiAgZ2V0VGFpbEJ1ZmZlclJhbmdlOiAtPlxuICAgIHtlZGl0b3J9ID0gQHNlbGVjdGlvblxuICAgIHRhaWxQb2ludCA9IEBzZWxlY3Rpb24uZ2V0VGFpbEJ1ZmZlclBvc2l0aW9uKClcbiAgICBpZiBAc2VsZWN0aW9uLmlzUmV2ZXJzZWQoKVxuICAgICAgcG9pbnQgPSB0cmFuc2xhdGVQb2ludEFuZENsaXAoZWRpdG9yLCB0YWlsUG9pbnQsICdiYWNrd2FyZCcpXG4gICAgICBuZXcgUmFuZ2UocG9pbnQsIHRhaWxQb2ludClcbiAgICBlbHNlXG4gICAgICBwb2ludCA9IHRyYW5zbGF0ZVBvaW50QW5kQ2xpcChlZGl0b3IsIHRhaWxQb2ludCwgJ2ZvcndhcmQnKVxuICAgICAgbmV3IFJhbmdlKHRhaWxQb2ludCwgcG9pbnQpXG5cbiAgc2F2ZVByb3BlcnRpZXM6IChpc05vcm1hbGl6ZWQpIC0+XG4gICAgaGVhZCA9IEBzZWxlY3Rpb24uZ2V0SGVhZEJ1ZmZlclBvc2l0aW9uKClcbiAgICB0YWlsID0gQHNlbGVjdGlvbi5nZXRUYWlsQnVmZmVyUG9zaXRpb24oKVxuICAgIGlmIEBzZWxlY3Rpb24uaXNFbXB0eSgpIG9yIGlzTm9ybWFsaXplZFxuICAgICAgcHJvcGVydGllcyA9IHtoZWFkLCB0YWlsfVxuICAgIGVsc2VcbiAgICAgICMgV2Ugc2VsZWN0UmlnaHQtZWQgaW4gdmlzdWFsLW1vZGUsIHRoaXMgdHJhbnNsYXRpb24gZGUtZWZmZWN0IHNlbGVjdC1yaWdodC1lZmZlY3RcbiAgICAgICMgU28gdGhhdCB3ZSBjYW4gYWN0aXZhdGUtdmlzdWFsLW1vZGUgd2l0aG91dCBzcGVjaWFsIHRyYW5zbGF0aW9uIGFmdGVyIHJlc3RvcmVpbmcgcHJvcGVydGllcy5cbiAgICAgIGVuZCA9IHRyYW5zbGF0ZVBvaW50QW5kQ2xpcChAc2VsZWN0aW9uLmVkaXRvciwgQGdldEJ1ZmZlclJhbmdlKCkuZW5kLCAnYmFja3dhcmQnKVxuICAgICAgaWYgQHNlbGVjdGlvbi5pc1JldmVyc2VkKClcbiAgICAgICAgcHJvcGVydGllcyA9IHtoZWFkOiBoZWFkLCB0YWlsOiBlbmR9XG4gICAgICBlbHNlXG4gICAgICAgIHByb3BlcnRpZXMgPSB7aGVhZDogZW5kLCB0YWlsOiB0YWlsfVxuICAgIEBzZXRQcm9wZXJ0aWVzKHByb3BlcnRpZXMpXG5cbiAgZml4UHJvcGVydHlSb3dUb1Jvd1JhbmdlOiAtPlxuICAgIHtoZWFkLCB0YWlsfSA9IEBnZXRQcm9wZXJ0aWVzKClcbiAgICBpZiBAc2VsZWN0aW9uLmlzUmV2ZXJzZWQoKVxuICAgICAgW2hlYWQucm93LCB0YWlsLnJvd10gPSBAc2VsZWN0aW9uLmdldEJ1ZmZlclJvd1JhbmdlKClcbiAgICBlbHNlXG4gICAgICBbdGFpbC5yb3csIGhlYWQucm93XSA9IEBzZWxlY3Rpb24uZ2V0QnVmZmVyUm93UmFuZ2UoKVxuXG4gICMgTk9URTpcbiAgIyAnd2lzZScgbXVzdCBiZSAnY2hhcmFjdGVyd2lzZScgb3IgJ2xpbmV3aXNlJ1xuICAjIFVzZSB0aGlzIGZvciBub3JtYWxpemVkKG5vbi1zZWxlY3QtcmlnaHQtZWQpIHNlbGVjdGlvbi5cbiAgYXBwbHlXaXNlOiAod2lzZSkgLT5cbiAgICBzd2l0Y2ggd2lzZVxuICAgICAgd2hlbiAnY2hhcmFjdGVyd2lzZSdcbiAgICAgICAgQHRyYW5zbGF0ZVNlbGVjdGlvbkVuZEFuZENsaXAoJ2ZvcndhcmQnKSAjIGVxdWl2YWxlbnQgdG8gY29yZSBzZWxlY3Rpb24uc2VsZWN0UmlnaHQgYnV0IGtlZXAgZ29hbENvbHVtblxuICAgICAgd2hlbiAnbGluZXdpc2UnXG4gICAgICAgICMgRXZlbiBpZiBlbmQuY29sdW1uIGlzIDAsIGV4cGFuZCBvdmVyIHRoYXQgZW5kLnJvdyggZG9uJ3QgdXNlIHNlbGVjdGlvbi5nZXRSb3dSYW5nZSgpIClcbiAgICAgICAge3N0YXJ0LCBlbmR9ID0gQGdldEJ1ZmZlclJhbmdlKClcbiAgICAgICAgQHNldEJ1ZmZlclJhbmdlKGdldEJ1ZmZlclJhbmdlRm9yUm93UmFuZ2UoQHNlbGVjdGlvbi5lZGl0b3IsIFtzdGFydC5yb3csIGVuZC5yb3ddKSlcbiAgICAgIHdoZW4gJ2Jsb2Nrd2lzZSdcbiAgICAgICAgbmV3IEJsb2Nrd2lzZVNlbGVjdGlvbihAc2VsZWN0aW9uKVxuXG4gIHNlbGVjdEJ5UHJvcGVydGllczogKHtoZWFkLCB0YWlsfSkgLT5cbiAgICAjIE5vIHByb2JsZW0gaWYgaGVhZCBpcyBncmVhdGVyIHRoYW4gdGFpbCwgUmFuZ2UgY29uc3RydWN0b3Igc3dhcCBzdGFydC9lbmQuXG4gICAgQHNldEJ1ZmZlclJhbmdlIFt0YWlsLCBoZWFkXSxcbiAgICAgIGF1dG9zY3JvbGw6IHRydWVcbiAgICAgIHJldmVyc2VkOiBoZWFkLmlzTGVzc1RoYW4odGFpbClcbiAgICAgIGtlZXBHb2FsQ29sdW1uOiBmYWxzZVxuXG4gICMgc2V0IHNlbGVjdGlvbnMgYnVmZmVyUmFuZ2Ugd2l0aCBkZWZhdWx0IG9wdGlvbiB7YXV0b3Njcm9sbDogZmFsc2UsIHByZXNlcnZlRm9sZHM6IHRydWV9XG4gIHNldEJ1ZmZlclJhbmdlOiAocmFuZ2UsIG9wdGlvbnM9e30pIC0+XG4gICAgaWYgb3B0aW9ucy5rZWVwR29hbENvbHVtbiA/IHRydWVcbiAgICAgIGdvYWxDb2x1bW4gPSBAc2VsZWN0aW9uLmN1cnNvci5nb2FsQ29sdW1uXG4gICAgZGVsZXRlIG9wdGlvbnMua2VlcEdvYWxDb2x1bW5cbiAgICBvcHRpb25zLmF1dG9zY3JvbGwgPz0gZmFsc2VcbiAgICBvcHRpb25zLnByZXNlcnZlRm9sZHMgPz0gdHJ1ZVxuICAgIEBzZWxlY3Rpb24uc2V0QnVmZmVyUmFuZ2UocmFuZ2UsIG9wdGlvbnMpXG4gICAgQHNlbGVjdGlvbi5jdXJzb3IuZ29hbENvbHVtbiA9IGdvYWxDb2x1bW4gaWYgZ29hbENvbHVtbj9cblxuICBpc1NpbmdsZVJvdzogLT5cbiAgICBbc3RhcnRSb3csIGVuZFJvd10gPSBAc2VsZWN0aW9uLmdldEJ1ZmZlclJvd1JhbmdlKClcbiAgICBzdGFydFJvdyBpcyBlbmRSb3dcblxuICBpc0xpbmV3aXNlUmFuZ2U6IC0+XG4gICAgaXNMaW5ld2lzZVJhbmdlKEBnZXRCdWZmZXJSYW5nZSgpKVxuXG4gIGRldGVjdFdpc2U6IC0+XG4gICAgaWYgQGlzTGluZXdpc2VSYW5nZSgpXG4gICAgICAnbGluZXdpc2UnXG4gICAgZWxzZVxuICAgICAgJ2NoYXJhY3Rlcndpc2UnXG5cbiAgIyBkaXJlY3Rpb24gbXVzdCBiZSBvbmUgb2YgWydmb3J3YXJkJywgJ2JhY2t3YXJkJ11cbiAgdHJhbnNsYXRlU2VsZWN0aW9uRW5kQW5kQ2xpcDogKGRpcmVjdGlvbikgLT5cbiAgICBuZXdSYW5nZSA9IGdldFJhbmdlQnlUcmFuc2xhdGVQb2ludEFuZENsaXAoQHNlbGVjdGlvbi5lZGl0b3IsIEBnZXRCdWZmZXJSYW5nZSgpLCBcImVuZFwiLCBkaXJlY3Rpb24pXG4gICAgQHNldEJ1ZmZlclJhbmdlKG5ld1JhbmdlKVxuXG4gICMgUmV0dXJuIHNlbGVjdGlvbiBleHRlbnQgdG8gcmVwbGF5IGJsb2Nrd2lzZSBzZWxlY3Rpb24gb24gYC5gIHJlcGVhdGluZy5cbiAgZ2V0QmxvY2t3aXNlU2VsZWN0aW9uRXh0ZW50OiAtPlxuICAgIGhlYWQgPSBAc2VsZWN0aW9uLmdldEhlYWRCdWZmZXJQb3NpdGlvbigpXG4gICAgdGFpbCA9IEBzZWxlY3Rpb24uZ2V0VGFpbEJ1ZmZlclBvc2l0aW9uKClcbiAgICBuZXcgUG9pbnQoaGVhZC5yb3cgLSB0YWlsLnJvdywgaGVhZC5jb2x1bW4gLSB0YWlsLmNvbHVtbilcblxuICAjIFdoYXQncyB0aGUgbm9ybWFsaXplP1xuICAjIE5vcm1hbGl6YXRpb24gaXMgcmVzdG9yZSBzZWxlY3Rpb24gcmFuZ2UgZnJvbSBwcm9wZXJ0eS5cbiAgIyBBcyBhIHJlc3VsdCBpdCByYW5nZSBiZWNhbWUgcmFuZ2Ugd2hlcmUgZW5kIG9mIHNlbGVjdGlvbiBtb3ZlZCB0byBsZWZ0LlxuICAjIFRoaXMgZW5kLW1vdmUtdG8tbGVmdCBkZS1lZmVjdCBvZiBlbmQtbW9kZS10by1yaWdodCBlZmZlY3QoIHRoaXMgaXMgdmlzdWFsLW1vZGUgb3JpZW50YXRpb24gKVxuICBub3JtYWxpemU6IC0+XG4gICAgIyBlbXB0eSBzZWxlY3Rpb24gSVMgYWxyZWFkeSAnbm9ybWFsaXplZCdcbiAgICByZXR1cm4gaWYgQHNlbGVjdGlvbi5pc0VtcHR5KClcbiAgICB1bmxlc3MgQGhhc1Byb3BlcnRpZXMoKVxuICAgICAgaWYgc2V0dGluZ3MuZ2V0KCdzdHJpY3RBc3NlcnRpb24nKVxuICAgICAgICBhc3NlcnRXaXRoRXhjZXB0aW9uKGZhbHNlLCBcImF0dGVtcHRlZCB0byBub3JtYWxpemUgYnV0IG5vIHByb3BlcnRpZXMgdG8gcmVzdG9yZVwiKVxuICAgICAgQHNhdmVQcm9wZXJ0aWVzKClcbiAgICB7aGVhZCwgdGFpbH0gPSBAZ2V0UHJvcGVydGllcygpXG4gICAgQHNldEJ1ZmZlclJhbmdlKFt0YWlsLCBoZWFkXSlcblxuc3dyYXAgPSAoc2VsZWN0aW9uKSAtPlxuICBuZXcgU2VsZWN0aW9uV3JhcHBlcihzZWxlY3Rpb24pXG5cbiMgQmxvY2t3aXNlU2VsZWN0aW9uIHByb3h5XG5zd3JhcC5nZXRCbG9ja3dpc2VTZWxlY3Rpb25zID0gKGVkaXRvcikgLT5cbiAgQmxvY2t3aXNlU2VsZWN0aW9uLmdldFNlbGVjdGlvbnMoZWRpdG9yKVxuXG5zd3JhcC5nZXRMYXN0QmxvY2t3aXNlU2VsZWN0aW9ucyA9IChlZGl0b3IpIC0+XG4gIEJsb2Nrd2lzZVNlbGVjdGlvbi5nZXRMYXN0U2VsZWN0aW9uKGVkaXRvcilcblxuc3dyYXAuZ2V0QmxvY2t3aXNlU2VsZWN0aW9uc09yZGVyZWRCeUJ1ZmZlclBvc2l0aW9uID0gKGVkaXRvcikgLT5cbiAgQmxvY2t3aXNlU2VsZWN0aW9uLmdldFNlbGVjdGlvbnNPcmRlcmVkQnlCdWZmZXJQb3NpdGlvbihlZGl0b3IpXG5cbnN3cmFwLmNsZWFyQmxvY2t3aXNlU2VsZWN0aW9ucyA9IChlZGl0b3IpIC0+XG4gIEJsb2Nrd2lzZVNlbGVjdGlvbi5jbGVhclNlbGVjdGlvbnMoZWRpdG9yKVxuXG5zd3JhcC5nZXRTZWxlY3Rpb25zID0gKGVkaXRvcikgLT5cbiAgZWRpdG9yLmdldFNlbGVjdGlvbnMoZWRpdG9yKS5tYXAoc3dyYXApXG5cbnN3cmFwLnNldFJldmVyc2VkU3RhdGUgPSAoZWRpdG9yLCByZXZlcnNlZCkgLT5cbiAgJHNlbGVjdGlvbi5zZXRSZXZlcnNlZFN0YXRlKHJldmVyc2VkKSBmb3IgJHNlbGVjdGlvbiBpbiBAZ2V0U2VsZWN0aW9ucyhlZGl0b3IpXG5cbnN3cmFwLmRldGVjdFdpc2UgPSAoZWRpdG9yKSAtPlxuICBpZiBAZ2V0U2VsZWN0aW9ucyhlZGl0b3IpLmV2ZXJ5KCgkc2VsZWN0aW9uKSAtPiAkc2VsZWN0aW9uLmRldGVjdFdpc2UoKSBpcyAnbGluZXdpc2UnKVxuICAgICdsaW5ld2lzZSdcbiAgZWxzZVxuICAgICdjaGFyYWN0ZXJ3aXNlJ1xuXG5zd3JhcC5jbGVhclByb3BlcnRpZXMgPSAoZWRpdG9yKSAtPlxuICAkc2VsZWN0aW9uLmNsZWFyUHJvcGVydGllcygpIGZvciAkc2VsZWN0aW9uIGluIEBnZXRTZWxlY3Rpb25zKGVkaXRvcilcblxuc3dyYXAuZHVtcFByb3BlcnRpZXMgPSAoZWRpdG9yKSAtPlxuICB7aW5zcGVjdH0gPSByZXF1aXJlICd1dGlsJ1xuICBmb3IgJHNlbGVjdGlvbiBpbiBAZ2V0U2VsZWN0aW9ucyhlZGl0b3IpIHdoZW4gJHNlbGVjdGlvbi5oYXNQcm9wZXJ0aWVzKClcbiAgICBjb25zb2xlLmxvZyBpbnNwZWN0KCRzZWxlY3Rpb24uZ2V0UHJvcGVydGllcygpKVxuXG5zd3JhcC5ub3JtYWxpemUgPSAoZWRpdG9yKSAtPlxuICBpZiBCbG9ja3dpc2VTZWxlY3Rpb24uaGFzKGVkaXRvcilcbiAgICBmb3IgYmxvY2t3aXNlU2VsZWN0aW9uIGluIEJsb2Nrd2lzZVNlbGVjdGlvbi5nZXRTZWxlY3Rpb25zKGVkaXRvcilcbiAgICAgIGJsb2Nrd2lzZVNlbGVjdGlvbi5ub3JtYWxpemUoKVxuICAgIEJsb2Nrd2lzZVNlbGVjdGlvbi5jbGVhclNlbGVjdGlvbnMoZWRpdG9yKVxuICBlbHNlXG4gICAgZm9yICRzZWxlY3Rpb24gaW4gQGdldFNlbGVjdGlvbnMoZWRpdG9yKVxuICAgICAgJHNlbGVjdGlvbi5ub3JtYWxpemUoKVxuXG5zd3JhcC5oYXNQcm9wZXJ0aWVzID0gKGVkaXRvcikgLT5cbiAgQGdldFNlbGVjdGlvbnMoZWRpdG9yKS5ldmVyeSAoJHNlbGVjdGlvbikgLT4gJHNlbGVjdGlvbi5oYXNQcm9wZXJ0aWVzKClcblxuIyBSZXR1cm4gZnVuY3Rpb24gdG8gcmVzdG9yZVxuIyBVc2VkIGluIHZtcC1tb3ZlLXNlbGVjdGVkLXRleHRcbnN3cmFwLnN3aXRjaFRvTGluZXdpc2UgPSAoZWRpdG9yKSAtPlxuICBmb3IgJHNlbGVjdGlvbiBpbiBzd3JhcC5nZXRTZWxlY3Rpb25zKGVkaXRvcilcbiAgICAkc2VsZWN0aW9uLnNhdmVQcm9wZXJ0aWVzKClcbiAgICAkc2VsZWN0aW9uLmFwcGx5V2lzZSgnbGluZXdpc2UnKVxuICBuZXcgRGlzcG9zYWJsZSAtPlxuICAgIGZvciAkc2VsZWN0aW9uIGluIHN3cmFwLmdldFNlbGVjdGlvbnMoZWRpdG9yKVxuICAgICAgJHNlbGVjdGlvbi5ub3JtYWxpemUoKVxuICAgICAgJHNlbGVjdGlvbi5hcHBseVdpc2UoJ2NoYXJhY3Rlcndpc2UnKVxuXG5zd3JhcC5nZXRQcm9wZXJ0eVN0b3JlID0gLT5cbiAgcHJvcGVydHlTdG9yZVxuXG5tb2R1bGUuZXhwb3J0cyA9IHN3cmFwXG4iXX0=
