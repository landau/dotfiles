(function() {
  var Disposable, Point, Range, SelectionWrapper, _, getEndOfLineForBufferRow, getFirstCharacterPositionForBufferRow, getRangeByTranslatePointAndClip, limitNumber, propertyStore, ref, ref1, shrinkRangeEndToBeforeNewLine, swrap, translatePointAndClip;

  _ = require('underscore-plus');

  ref = require('atom'), Range = ref.Range, Point = ref.Point, Disposable = ref.Disposable;

  ref1 = require('./utils'), translatePointAndClip = ref1.translatePointAndClip, getRangeByTranslatePointAndClip = ref1.getRangeByTranslatePointAndClip, shrinkRangeEndToBeforeNewLine = ref1.shrinkRangeEndToBeforeNewLine, getFirstCharacterPositionForBufferRow = ref1.getFirstCharacterPositionForBufferRow, getEndOfLineForBufferRow = ref1.getEndOfLineForBufferRow, limitNumber = ref1.limitNumber;

  propertyStore = new Map;

  SelectionWrapper = (function() {
    function SelectionWrapper(selection1) {
      this.selection = selection1;
    }

    SelectionWrapper.prototype.hasProperties = function() {
      return propertyStore.has(this.selection);
    };

    SelectionWrapper.prototype.getProperties = function() {
      var ref2;
      return (ref2 = propertyStore.get(this.selection)) != null ? ref2 : {};
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
      var allowFallback, end, fromProperty, head, ref2, ref3, ref4, ref5, ref6, start, tail;
      ref2 = arg != null ? arg : {}, fromProperty = ref2.fromProperty, allowFallback = ref2.allowFallback;
      if (fromProperty == null) {
        fromProperty = false;
      }
      if (allowFallback == null) {
        allowFallback = false;
      }
      if (fromProperty && (!this.hasProperties()) && allowFallback) {
        fromProperty = false;
      }
      if (fromProperty) {
        ref3 = this.getProperties(), head = ref3.head, tail = ref3.tail;
        if (head.isGreaterThanOrEqual(tail)) {
          ref4 = [tail, head], start = ref4[0], end = ref4[1];
        } else {
          ref5 = [head, tail], start = ref5[0], end = ref5[1];
        }
      } else {
        ref6 = this.selection.getBufferRange(), start = ref6.start, end = ref6.end;
        head = this.selection.getHeadBufferPosition();
        tail = this.selection.getTailBufferPosition();
      }
      switch (which) {
        case 'start':
          return start;
        case 'end':
          return end;
        case 'head':
          return head;
        case 'tail':
          return tail;
      }
    };

    SelectionWrapper.prototype.setBufferPositionTo = function(which, options) {
      var point;
      point = this.getBufferPositionFor(which, options);
      return this.selection.cursor.setBufferPosition(point);
    };

    SelectionWrapper.prototype.mergeBufferRange = function(range, option) {
      return this.setBufferRange(this.getBufferRange().union(range), option);
    };

    SelectionWrapper.prototype.extendToEOL = function() {
      var endRow, endRowRange, newRange, ref2, startRow;
      ref2 = this.selection.getBufferRowRange(), startRow = ref2[0], endRow = ref2[1];
      endRowRange = this.selection.editor.bufferRangeForBufferRow(endRow);
      newRange = new Range(this.getBufferRange().start, endRowRange.end);
      return this.setBufferRange(newRange);
    };

    SelectionWrapper.prototype.reverse = function() {
      return this.setReversedState(!this.selection.isReversed());
    };

    SelectionWrapper.prototype.setReversedState = function(reversed) {
      var head, options, ref2, tail;
      if (this.selection.isReversed() === reversed) {
        return;
      }
      ref2 = this.getProperties(), head = ref2.head, tail = ref2.tail;
      if ((head != null) && (tail != null)) {
        this.setProperties({
          head: tail,
          tail: head
        });
      }
      options = {
        autoscroll: true,
        reversed: reversed,
        preserveFolds: true
      };
      return this.setBufferRange(this.getBufferRange(), options);
    };

    SelectionWrapper.prototype.getRows = function() {
      var endRow, i, ref2, results1, startRow;
      ref2 = this.selection.getBufferRowRange(), startRow = ref2[0], endRow = ref2[1];
      return (function() {
        results1 = [];
        for (var i = startRow; startRow <= endRow ? i <= endRow : i >= endRow; startRow <= endRow ? i++ : i--){ results1.push(i); }
        return results1;
      }).apply(this);
    };

    SelectionWrapper.prototype.getRowCount = function() {
      return this.getRows().length;
    };

    SelectionWrapper.prototype.selectRowRange = function(rowRange) {
      var editor, endRange, range, ref2, startRange;
      editor = this.selection.editor;
      ref2 = rowRange.map(function(row) {
        return editor.bufferRangeForBufferRow(row, {
          includeNewline: true
        });
      }), startRange = ref2[0], endRange = ref2[1];
      range = startRange.union(endRange);
      return this.setBufferRange(range, {
        preserveFolds: true
      });
    };

    SelectionWrapper.prototype.expandOverLine = function(arg) {
      var goalColumn, preserveGoalColumn;
      preserveGoalColumn = (arg != null ? arg : {}).preserveGoalColumn;
      if (preserveGoalColumn) {
        goalColumn = this.selection.cursor.goalColumn;
      }
      this.selectRowRange(this.selection.getBufferRowRange());
      if (goalColumn) {
        return this.selection.cursor.goalColumn = goalColumn;
      }
    };

    SelectionWrapper.prototype.getRowFor = function(where) {
      var endRow, headRow, ref2, ref3, ref4, startRow, tailRow;
      ref2 = this.selection.getBufferRowRange(), startRow = ref2[0], endRow = ref2[1];
      if (this.selection.isReversed()) {
        ref3 = [startRow, endRow], headRow = ref3[0], tailRow = ref3[1];
      } else {
        ref4 = [endRow, startRow], headRow = ref4[0], tailRow = ref4[1];
      }
      switch (where) {
        case 'start':
          return startRow;
        case 'end':
          return endRow;
        case 'head':
          return headRow;
        case 'tail':
          return tailRow;
      }
    };

    SelectionWrapper.prototype.getHeadRow = function() {
      return this.getRowFor('head');
    };

    SelectionWrapper.prototype.getTailRow = function() {
      return this.getRowFor('tail');
    };

    SelectionWrapper.prototype.getStartRow = function() {
      return this.getRowFor('start');
    };

    SelectionWrapper.prototype.getEndRow = function() {
      return this.getRowFor('end');
    };

    SelectionWrapper.prototype.getTailBufferRange = function() {
      var editor, point, tailPoint;
      editor = this.selection.editor;
      tailPoint = this.selection.getTailBufferPosition();
      if (this.selection.isReversed()) {
        point = translatePointAndClip(editor, tailPoint, 'backward');
        return new Range(point, tailPoint);
      } else {
        point = translatePointAndClip(editor, tailPoint, 'forward', {
          hello: 'when getting tailRange'
        });
        return new Range(tailPoint, point);
      }
    };

    SelectionWrapper.prototype.saveProperties = function() {
      var endPoint, properties;
      properties = this.captureProperties();
      if (!this.selection.isEmpty()) {
        endPoint = this.selection.getBufferRange().end.translate([0, -1]);
        endPoint = this.selection.editor.clipBufferPosition(endPoint);
        if (this.selection.isReversed()) {
          properties.tail = endPoint;
        } else {
          properties.head = endPoint;
        }
      }
      return this.setProperties(properties);
    };

    SelectionWrapper.prototype.setWise = function(value) {
      var properties;
      if (!this.hasProperties()) {
        this.saveProperties();
      }
      properties = this.getProperties();
      return properties.wise = value;
    };

    SelectionWrapper.prototype.getWise = function() {
      var ref2, ref3;
      return (ref2 = (ref3 = this.getProperties()) != null ? ref3.wise : void 0) != null ? ref2 : 'characterwise';
    };

    SelectionWrapper.prototype.applyWise = function(newWise) {
      switch (newWise) {
        case 'characterwise':
          this.translateSelectionEndAndClip('forward');
          this.saveProperties();
          return this.setWise('characterwise');
        case 'linewise':
          this.complementGoalColumn();
          this.expandOverLine({
            preserveGoalColumn: true
          });
          return this.setWise('linewise');
      }
    };

    SelectionWrapper.prototype.complementGoalColumn = function() {
      var column;
      if (this.selection.cursor.goalColumn == null) {
        column = this.getBufferPositionFor('head', {
          fromProperty: true,
          allowFallback: true
        }).column;
        return this.selection.cursor.goalColumn = column;
      }
    };

    SelectionWrapper.prototype.clipPropertiesTillEndOfLine = function() {
      var editor, headMaxColumn, headRowEOL, properties, tailMaxColumn, tailRowEOL;
      if (!this.hasProperties()) {
        return;
      }
      editor = this.selection.editor;
      headRowEOL = getEndOfLineForBufferRow(editor, this.getHeadRow());
      tailRowEOL = getEndOfLineForBufferRow(editor, this.getTailRow());
      headMaxColumn = limitNumber(headRowEOL.column - 1, {
        min: 0
      });
      tailMaxColumn = limitNumber(tailRowEOL.column - 1, {
        min: 0
      });
      properties = this.getProperties();
      if (properties.head.column > headMaxColumn) {
        properties.head.column = headMaxColumn;
      }
      if (properties.tail.column > tailMaxColumn) {
        return properties.tail.column = tailMaxColumn;
      }
    };

    SelectionWrapper.prototype.captureProperties = function() {
      return {
        head: this.selection.getHeadBufferPosition(),
        tail: this.selection.getTailBufferPosition()
      };
    };

    SelectionWrapper.prototype.selectByProperties = function(arg) {
      var head, tail;
      head = arg.head, tail = arg.tail;
      this.setBufferRange([tail, head]);
      return this.setReversedState(head.isLessThan(tail));
    };

    SelectionWrapper.prototype.isForwarding = function() {
      var head, tail;
      head = this.selection.getHeadBufferPosition();
      tail = this.selection.getTailBufferPosition();
      return head.isGreaterThan(tail);
    };

    SelectionWrapper.prototype.applyColumnFromProperties = function() {
      var end, head, ref2, ref3, ref4, selectionProperties, start, tail;
      selectionProperties = this.getProperties();
      if (selectionProperties == null) {
        return;
      }
      head = selectionProperties.head, tail = selectionProperties.tail;
      if (this.selection.isReversed()) {
        ref2 = [head, tail], start = ref2[0], end = ref2[1];
      } else {
        ref3 = [tail, head], start = ref3[0], end = ref3[1];
      }
      ref4 = this.selection.getBufferRowRange(), start.row = ref4[0], end.row = ref4[1];
      return this.withKeepingGoalColumn((function(_this) {
        return function() {
          _this.setBufferRange([start, end], {
            preserveFolds: true
          });
          return _this.translateSelectionEndAndClip('backward', {
            translate: false
          });
        };
      })(this));
    };

    SelectionWrapper.prototype.setBufferRange = function(range, options) {
      var keepGoalColumn, setBufferRange;
      if (options == null) {
        options = {};
      }
      keepGoalColumn = options.keepGoalColumn;
      delete options.keepGoalColumn;
      if (options.autoscroll == null) {
        options.autoscroll = false;
      }
      setBufferRange = (function(_this) {
        return function() {
          return _this.selection.setBufferRange(range, options);
        };
      })(this);
      if (keepGoalColumn) {
        return this.withKeepingGoalColumn(setBufferRange);
      } else {
        return setBufferRange();
      }
    };

    SelectionWrapper.prototype.replace = function(text) {
      var originalText;
      originalText = this.selection.getText();
      this.selection.insertText(text);
      return originalText;
    };

    SelectionWrapper.prototype.lineTextForBufferRows = function() {
      var editor;
      editor = this.selection.editor;
      return this.getRows().map(function(row) {
        return editor.lineTextForBufferRow(row);
      });
    };

    SelectionWrapper.prototype.mapToLineText = function(fn, arg) {
      var editor, includeNewline, textForRow;
      includeNewline = (arg != null ? arg : {}).includeNewline;
      editor = this.selection.editor;
      textForRow = function(row) {
        var range;
        range = editor.bufferRangeForBufferRow(row, {
          includeNewline: includeNewline
        });
        return editor.getTextInBufferRange(range);
      };
      return this.getRows().map(textForRow).map(fn);
    };

    SelectionWrapper.prototype.translate = function(startDelta, endDelta, options) {
      var newRange;
      if (endDelta == null) {
        endDelta = startDelta;
      }
      newRange = this.getBufferRange().translate(startDelta, endDelta);
      return this.setBufferRange(newRange, options);
    };

    SelectionWrapper.prototype.isSingleRow = function() {
      var endRow, ref2, startRow;
      ref2 = this.selection.getBufferRowRange(), startRow = ref2[0], endRow = ref2[1];
      return startRow === endRow;
    };

    SelectionWrapper.prototype.isLinewise = function() {
      var end, ref2, ref3, start;
      ref2 = this.getBufferRange(), start = ref2.start, end = ref2.end;
      return (start.row !== end.row) && ((start.column === (ref3 = end.column) && ref3 === 0));
    };

    SelectionWrapper.prototype.detectVisualModeSubmode = function() {
      if (this.selection.isEmpty()) {
        return null;
      } else if (this.isLinewise()) {
        return 'linewise';
      } else {
        return 'characterwise';
      }
    };

    SelectionWrapper.prototype.withKeepingGoalColumn = function(fn) {
      var end, goalColumn, ref2, start;
      goalColumn = this.selection.cursor.goalColumn;
      ref2 = this.getBufferRange(), start = ref2.start, end = ref2.end;
      fn();
      if (goalColumn != null) {
        return this.selection.cursor.goalColumn = goalColumn;
      }
    };

    SelectionWrapper.prototype.translateSelectionEndAndClip = function(direction, options) {
      var editor, newRange, range;
      editor = this.selection.editor;
      range = this.getBufferRange();
      newRange = getRangeByTranslatePointAndClip(editor, range, "end", direction, options);
      return this.withKeepingGoalColumn((function(_this) {
        return function() {
          return _this.setBufferRange(newRange, {
            preserveFolds: true
          });
        };
      })(this));
    };

    SelectionWrapper.prototype.translateSelectionHeadAndClip = function(direction, options) {
      var editor, newRange, range, which;
      editor = this.selection.editor;
      which = this.selection.isReversed() ? 'start' : 'end';
      range = this.getBufferRange();
      newRange = getRangeByTranslatePointAndClip(editor, range, which, direction, options);
      return this.withKeepingGoalColumn((function(_this) {
        return function() {
          return _this.setBufferRange(newRange, {
            preserveFolds: true
          });
        };
      })(this));
    };

    SelectionWrapper.prototype.shrinkEndToBeforeNewLine = function() {
      var newRange;
      newRange = shrinkRangeEndToBeforeNewLine(this.getBufferRange());
      return this.setBufferRange(newRange);
    };

    SelectionWrapper.prototype.setStartToFirstCharacterOfLine = function() {
      var end, newRange, newStart, ref2, start;
      ref2 = this.getBufferRange(), start = ref2.start, end = ref2.end;
      newStart = getFirstCharacterPositionForBufferRow(this.selection.editor, start.row);
      newRange = new Range(newStart, end);
      return this.setBufferRange(newRange);
    };

    SelectionWrapper.prototype.getBlockwiseSelectionExtent = function() {
      var head, tail;
      head = this.selection.getHeadBufferPosition();
      tail = this.selection.getTailBufferPosition();
      return new Point(head.row - tail.row, head.column - tail.column);
    };

    SelectionWrapper.prototype.normalize = function() {
      if (!this.selection.isEmpty()) {
        switch (this.getWise()) {
          case 'characterwise':
            this.translateSelectionEndAndClip('backward');
            break;
          case 'linewise':
            this.applyColumnFromProperties();
            break;
          case 'blockwise':
            this.translateSelectionEndAndClip('backward');
        }
      }
      return this.clearProperties();
    };

    return SelectionWrapper;

  })();

  swrap = function(selection) {
    return new SelectionWrapper(selection);
  };

  swrap.setReversedState = function(editor, reversed) {
    return editor.getSelections().forEach(function(selection) {
      return swrap(selection).setReversedState(reversed);
    });
  };

  swrap.expandOverLine = function(editor, options) {
    return editor.getSelections().forEach(function(selection) {
      return swrap(selection).expandOverLine(options);
    });
  };

  swrap.reverse = function(editor) {
    return editor.getSelections().forEach(function(selection) {
      return swrap(selection).reverse();
    });
  };

  swrap.clearProperties = function(editor) {
    return editor.getSelections().forEach(function(selection) {
      return swrap(selection).clearProperties();
    });
  };

  swrap.detectVisualModeSubmode = function(editor) {
    var results, selection, selections;
    selections = editor.getSelections();
    results = (function() {
      var i, len, results1;
      results1 = [];
      for (i = 0, len = selections.length; i < len; i++) {
        selection = selections[i];
        results1.push(swrap(selection).detectVisualModeSubmode());
      }
      return results1;
    })();
    if (results.every(function(r) {
      return r === 'linewise';
    })) {
      return 'linewise';
    } else if (results.some(function(r) {
      return r === 'characterwise';
    })) {
      return 'characterwise';
    } else {
      return null;
    }
  };

  swrap.saveProperties = function(editor) {
    var i, len, ref2, results1, selection;
    ref2 = editor.getSelections();
    results1 = [];
    for (i = 0, len = ref2.length; i < len; i++) {
      selection = ref2[i];
      results1.push(swrap(selection).saveProperties());
    }
    return results1;
  };

  swrap.complementGoalColumn = function(editor) {
    var i, len, ref2, results1, selection;
    ref2 = editor.getSelections();
    results1 = [];
    for (i = 0, len = ref2.length; i < len; i++) {
      selection = ref2[i];
      results1.push(swrap(selection).complementGoalColumn());
    }
    return results1;
  };

  swrap.normalize = function(editor) {
    var i, len, ref2, results1, selection;
    ref2 = editor.getSelections();
    results1 = [];
    for (i = 0, len = ref2.length; i < len; i++) {
      selection = ref2[i];
      results1.push(swrap(selection).normalize());
    }
    return results1;
  };

  swrap.setWise = function(editor, value) {
    var i, len, ref2, results1, selection;
    ref2 = editor.getSelections();
    results1 = [];
    for (i = 0, len = ref2.length; i < len; i++) {
      selection = ref2[i];
      results1.push(swrap(selection).setWise(value));
    }
    return results1;
  };

  swrap.applyWise = function(editor, value) {
    var i, len, ref2, results1, selection;
    ref2 = editor.getSelections();
    results1 = [];
    for (i = 0, len = ref2.length; i < len; i++) {
      selection = ref2[i];
      results1.push(swrap(selection).applyWise(value));
    }
    return results1;
  };

  swrap.clearProperties = function(editor) {
    var i, len, ref2, results1, selection;
    ref2 = editor.getSelections();
    results1 = [];
    for (i = 0, len = ref2.length; i < len; i++) {
      selection = ref2[i];
      results1.push(swrap(selection).clearProperties());
    }
    return results1;
  };

  module.exports = swrap;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvc2VsZWN0aW9uLXdyYXBwZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSOztFQUNKLE1BQTZCLE9BQUEsQ0FBUSxNQUFSLENBQTdCLEVBQUMsaUJBQUQsRUFBUSxpQkFBUixFQUFlOztFQUNmLE9BT0ksT0FBQSxDQUFRLFNBQVIsQ0FQSixFQUNFLGtEQURGLEVBRUUsc0VBRkYsRUFHRSxrRUFIRixFQUlFLGtGQUpGLEVBS0Usd0RBTEYsRUFNRTs7RUFHRixhQUFBLEdBQWdCLElBQUk7O0VBRWQ7SUFDUywwQkFBQyxVQUFEO01BQUMsSUFBQyxDQUFBLFlBQUQ7SUFBRDs7K0JBRWIsYUFBQSxHQUFlLFNBQUE7YUFBRyxhQUFhLENBQUMsR0FBZCxDQUFrQixJQUFDLENBQUEsU0FBbkI7SUFBSDs7K0JBQ2YsYUFBQSxHQUFlLFNBQUE7QUFBRyxVQUFBO3lFQUFnQztJQUFuQzs7K0JBQ2YsYUFBQSxHQUFlLFNBQUMsSUFBRDthQUFVLGFBQWEsQ0FBQyxHQUFkLENBQWtCLElBQUMsQ0FBQSxTQUFuQixFQUE4QixJQUE5QjtJQUFWOzsrQkFDZixlQUFBLEdBQWlCLFNBQUE7YUFBRyxhQUFhLEVBQUMsTUFBRCxFQUFiLENBQXFCLElBQUMsQ0FBQSxTQUF0QjtJQUFIOzsrQkFFakIsb0JBQUEsR0FBc0IsU0FBQyxLQUFELEVBQVEsT0FBUjtNQUNwQixJQUFHLEtBQUg7ZUFDRSxJQUFDLENBQUEsY0FBRCxDQUFnQixLQUFoQixFQUF1QixPQUF2QixFQURGOztJQURvQjs7K0JBSXRCLGNBQUEsR0FBZ0IsU0FBQTthQUNkLElBQUMsQ0FBQSxTQUFTLENBQUMsY0FBWCxDQUFBO0lBRGM7OytCQUdoQixvQkFBQSxHQUFzQixTQUFD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QUEsQ0FBTSxTQUFOLENBQWdCLENBQUMsU0FBakIsQ0FBMkIsS0FBM0I7QUFERjs7RUFEZ0I7O0VBSWxCLEtBQUssQ0FBQyxlQUFOLEdBQXdCLFNBQUMsTUFBRDtBQUN0QixRQUFBO0FBQUE7QUFBQTtTQUFBLHNDQUFBOztvQkFDRSxLQUFBLENBQU0sU0FBTixDQUFnQixDQUFDLGVBQWpCLENBQUE7QUFERjs7RUFEc0I7O0VBSXhCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCO0FBN1hqQiIsInNvdXJjZXNDb250ZW50IjpbIl8gPSByZXF1aXJlICd1bmRlcnNjb3JlLXBsdXMnXG57UmFuZ2UsIFBvaW50LCBEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2F0b20nXG57XG4gIHRyYW5zbGF0ZVBvaW50QW5kQ2xpcFxuICBnZXRSYW5nZUJ5VHJhbnNsYXRlUG9pbnRBbmRDbGlwXG4gIHNocmlua1JhbmdlRW5kVG9CZWZvcmVOZXdMaW5lXG4gIGdldEZpcnN0Q2hhcmFjdGVyUG9zaXRpb25Gb3JCdWZmZXJSb3dcbiAgZ2V0RW5kT2ZMaW5lRm9yQnVmZmVyUm93XG4gIGxpbWl0TnVtYmVyXG59ID0gcmVxdWlyZSAnLi91dGlscydcblxucHJvcGVydHlTdG9yZSA9IG5ldyBNYXBcblxuY2xhc3MgU2VsZWN0aW9uV3JhcHBlclxuICBjb25zdHJ1Y3RvcjogKEBzZWxlY3Rpb24pIC0+XG5cbiAgaGFzUHJvcGVydGllczogLT4gcHJvcGVydHlTdG9yZS5oYXMoQHNlbGVjdGlvbilcbiAgZ2V0UHJvcGVydGllczogLT4gcHJvcGVydHlTdG9yZS5nZXQoQHNlbGVjdGlvbikgPyB7fVxuICBzZXRQcm9wZXJ0aWVzOiAocHJvcCkgLT4gcHJvcGVydHlTdG9yZS5zZXQoQHNlbGVjdGlvbiwgcHJvcClcbiAgY2xlYXJQcm9wZXJ0aWVzOiAtPiBwcm9wZXJ0eVN0b3JlLmRlbGV0ZShAc2VsZWN0aW9uKVxuXG4gIHNldEJ1ZmZlclJhbmdlU2FmZWx5OiAocmFuZ2UsIG9wdGlvbnMpIC0+XG4gICAgaWYgcmFuZ2VcbiAgICAgIEBzZXRCdWZmZXJSYW5nZShyYW5nZSwgb3B0aW9ucylcblxuICBnZXRCdWZmZXJSYW5nZTogLT5cbiAgICBAc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKClcblxuICBnZXRCdWZmZXJQb3NpdGlvbkZvcjogKHdoaWNoLCB7ZnJvbVByb3BlcnR5LCBhbGxvd0ZhbGxiYWNrfT17fSkgLT5cbiAgICBmcm9tUHJvcGVydHkgPz0gZmFsc2VcbiAgICBhbGxvd0ZhbGxiYWNrID89IGZhbHNlXG5cbiAgICBpZiBmcm9tUHJvcGVydHkgYW5kIChub3QgQGhhc1Byb3BlcnRpZXMoKSkgYW5kIGFsbG93RmFsbGJhY2tcbiAgICAgIGZyb21Qcm9wZXJ0eSA9IGZhbHNlXG5cbiAgICBpZiBmcm9tUHJvcGVydHlcbiAgICAgIHtoZWFkLCB0YWlsfSA9IEBnZXRQcm9wZXJ0aWVzKClcbiAgICAgIGlmIGhlYWQuaXNHcmVhdGVyVGhhbk9yRXF1YWwodGFpbClcbiAgICAgICAgW3N0YXJ0LCBlbmRdID0gW3RhaWwsIGhlYWRdXG4gICAgICBlbHNlXG4gICAgICAgIFtzdGFydCwgZW5kXSA9IFtoZWFkLCB0YWlsXVxuICAgIGVsc2VcbiAgICAgIHtzdGFydCwgZW5kfSA9IEBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKVxuICAgICAgaGVhZCA9IEBzZWxlY3Rpb24uZ2V0SGVhZEJ1ZmZlclBvc2l0aW9uKClcbiAgICAgIHRhaWwgPSBAc2VsZWN0aW9uLmdldFRhaWxCdWZmZXJQb3NpdGlvbigpXG5cbiAgICBzd2l0Y2ggd2hpY2hcbiAgICAgIHdoZW4gJ3N0YXJ0JyB0aGVuIHN0YXJ0XG4gICAgICB3aGVuICdlbmQnIHRoZW4gZW5kXG4gICAgICB3aGVuICdoZWFkJyB0aGVuIGhlYWRcbiAgICAgIHdoZW4gJ3RhaWwnIHRoZW4gdGFpbFxuXG4gICMgb3B0aW9uczoge2Zyb21Qcm9wZXJ0eX1cbiAgc2V0QnVmZmVyUG9zaXRpb25UbzogKHdoaWNoLCBvcHRpb25zKSAtPlxuICAgIHBvaW50ID0gQGdldEJ1ZmZlclBvc2l0aW9uRm9yKHdoaWNoLCBvcHRpb25zKVxuICAgIEBzZWxlY3Rpb24uY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHBvaW50KVxuXG4gIG1lcmdlQnVmZmVyUmFuZ2U6IChyYW5nZSwgb3B0aW9uKSAtPlxuICAgIEBzZXRCdWZmZXJSYW5nZShAZ2V0QnVmZmVyUmFuZ2UoKS51bmlvbihyYW5nZSksIG9wdGlvbilcblxuICBleHRlbmRUb0VPTDogLT5cbiAgICBbc3RhcnRSb3csIGVuZFJvd10gPSBAc2VsZWN0aW9uLmdldEJ1ZmZlclJvd1JhbmdlKClcbiAgICBlbmRSb3dSYW5nZSA9IEBzZWxlY3Rpb24uZWRpdG9yLmJ1ZmZlclJhbmdlRm9yQnVmZmVyUm93KGVuZFJvdylcbiAgICBuZXdSYW5nZSA9IG5ldyBSYW5nZShAZ2V0QnVmZmVyUmFuZ2UoKS5zdGFydCwgZW5kUm93UmFuZ2UuZW5kKVxuICAgIEBzZXRCdWZmZXJSYW5nZShuZXdSYW5nZSlcblxuICByZXZlcnNlOiAtPlxuICAgIEBzZXRSZXZlcnNlZFN0YXRlKG5vdCBAc2VsZWN0aW9uLmlzUmV2ZXJzZWQoKSlcblxuICBzZXRSZXZlcnNlZFN0YXRlOiAocmV2ZXJzZWQpIC0+XG4gICAgcmV0dXJuIGlmIEBzZWxlY3Rpb24uaXNSZXZlcnNlZCgpIGlzIHJldmVyc2VkXG4gICAge2hlYWQsIHRhaWx9ID0gQGdldFByb3BlcnRpZXMoKVxuICAgIGlmIGhlYWQ/IGFuZCB0YWlsP1xuICAgICAgQHNldFByb3BlcnRpZXMoaGVhZDogdGFpbCwgdGFpbDogaGVhZClcblxuICAgIG9wdGlvbnMgPSB7YXV0b3Njcm9sbDogdHJ1ZSwgcmV2ZXJzZWQsIHByZXNlcnZlRm9sZHM6IHRydWV9XG4gICAgQHNldEJ1ZmZlclJhbmdlKEBnZXRCdWZmZXJSYW5nZSgpLCBvcHRpb25zKVxuXG4gIGdldFJvd3M6IC0+XG4gICAgW3N0YXJ0Um93LCBlbmRSb3ddID0gQHNlbGVjdGlvbi5nZXRCdWZmZXJSb3dSYW5nZSgpXG4gICAgW3N0YXJ0Um93Li5lbmRSb3ddXG5cbiAgZ2V0Um93Q291bnQ6IC0+XG4gICAgQGdldFJvd3MoKS5sZW5ndGhcblxuICBzZWxlY3RSb3dSYW5nZTogKHJvd1JhbmdlKSAtPlxuICAgIHtlZGl0b3J9ID0gQHNlbGVjdGlvblxuICAgIFtzdGFydFJhbmdlLCBlbmRSYW5nZV0gPSByb3dSYW5nZS5tYXAgKHJvdykgLT5cbiAgICAgIGVkaXRvci5idWZmZXJSYW5nZUZvckJ1ZmZlclJvdyhyb3csIGluY2x1ZGVOZXdsaW5lOiB0cnVlKVxuICAgIHJhbmdlID0gc3RhcnRSYW5nZS51bmlvbihlbmRSYW5nZSlcbiAgICBAc2V0QnVmZmVyUmFuZ2UocmFuZ2UsIHByZXNlcnZlRm9sZHM6IHRydWUpXG5cbiAgIyBOYXRpdmUgc2VsZWN0aW9uLmV4cGFuZE92ZXJMaW5lIGlzIG5vdCBhd2FyZSBvZiBhY3R1YWwgcm93UmFuZ2Ugb2Ygc2VsZWN0aW9uLlxuICBleHBhbmRPdmVyTGluZTogKHtwcmVzZXJ2ZUdvYWxDb2x1bW59PXt9KSAtPlxuICAgIGlmIHByZXNlcnZlR29hbENvbHVtblxuICAgICAge2dvYWxDb2x1bW59ID0gQHNlbGVjdGlvbi5jdXJzb3JcblxuICAgIEBzZWxlY3RSb3dSYW5nZShAc2VsZWN0aW9uLmdldEJ1ZmZlclJvd1JhbmdlKCkpXG4gICAgQHNlbGVjdGlvbi5jdXJzb3IuZ29hbENvbHVtbiA9IGdvYWxDb2x1bW4gaWYgZ29hbENvbHVtblxuXG4gIGdldFJvd0ZvcjogKHdoZXJlKSAtPlxuICAgIFtzdGFydFJvdywgZW5kUm93XSA9IEBzZWxlY3Rpb24uZ2V0QnVmZmVyUm93UmFuZ2UoKVxuICAgIGlmIEBzZWxlY3Rpb24uaXNSZXZlcnNlZCgpXG4gICAgICBbaGVhZFJvdywgdGFpbFJvd10gPSBbc3RhcnRSb3csIGVuZFJvd11cbiAgICBlbHNlXG4gICAgICBbaGVhZFJvdywgdGFpbFJvd10gPSBbZW5kUm93LCBzdGFydFJvd11cblxuICAgIHN3aXRjaCB3aGVyZVxuICAgICAgd2hlbiAnc3RhcnQnIHRoZW4gc3RhcnRSb3dcbiAgICAgIHdoZW4gJ2VuZCcgdGhlbiBlbmRSb3dcbiAgICAgIHdoZW4gJ2hlYWQnIHRoZW4gaGVhZFJvd1xuICAgICAgd2hlbiAndGFpbCcgdGhlbiB0YWlsUm93XG5cbiAgZ2V0SGVhZFJvdzogLT4gQGdldFJvd0ZvcignaGVhZCcpXG4gIGdldFRhaWxSb3c6IC0+IEBnZXRSb3dGb3IoJ3RhaWwnKVxuICBnZXRTdGFydFJvdzogLT4gQGdldFJvd0Zvcignc3RhcnQnKVxuICBnZXRFbmRSb3c6IC0+IEBnZXRSb3dGb3IoJ2VuZCcpXG5cbiAgZ2V0VGFpbEJ1ZmZlclJhbmdlOiAtPlxuICAgIHtlZGl0b3J9ID0gQHNlbGVjdGlvblxuICAgIHRhaWxQb2ludCA9IEBzZWxlY3Rpb24uZ2V0VGFpbEJ1ZmZlclBvc2l0aW9uKClcbiAgICBpZiBAc2VsZWN0aW9uLmlzUmV2ZXJzZWQoKVxuICAgICAgcG9pbnQgPSB0cmFuc2xhdGVQb2ludEFuZENsaXAoZWRpdG9yLCB0YWlsUG9pbnQsICdiYWNrd2FyZCcpXG4gICAgICBuZXcgUmFuZ2UocG9pbnQsIHRhaWxQb2ludClcbiAgICBlbHNlXG4gICAgICBwb2ludCA9IHRyYW5zbGF0ZVBvaW50QW5kQ2xpcChlZGl0b3IsIHRhaWxQb2ludCwgJ2ZvcndhcmQnLCBoZWxsbzogJ3doZW4gZ2V0dGluZyB0YWlsUmFuZ2UnKVxuICAgICAgbmV3IFJhbmdlKHRhaWxQb2ludCwgcG9pbnQpXG5cbiAgc2F2ZVByb3BlcnRpZXM6IC0+XG4gICAgcHJvcGVydGllcyA9IEBjYXB0dXJlUHJvcGVydGllcygpXG4gICAgdW5sZXNzIEBzZWxlY3Rpb24uaXNFbXB0eSgpXG4gICAgICAjIFdlIHNlbGVjdCByaWdodGVkIGluIHZpc3VhbC1tb2RlLCB0aGlzIHRyYW5zbGF0aW9uIGRlLWVmZmVjdCBzZWxlY3QtcmlnaHQtZWZmZWN0XG4gICAgICAjIHNvIHRoYXQgYWZ0ZXIgcmVzdG9yaW5nIHByZXNlcnZlZCBwb3BlcnR5IHdlIGNhbiBkbyBhY3RpdmF0ZS12aXN1YWwgbW9kZSB3aXRob3V0XG4gICAgICAjIHNwZWNpYWwgY2FyZVxuICAgICAgZW5kUG9pbnQgPSBAc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKCkuZW5kLnRyYW5zbGF0ZShbMCwgLTFdKVxuICAgICAgZW5kUG9pbnQgPSBAc2VsZWN0aW9uLmVkaXRvci5jbGlwQnVmZmVyUG9zaXRpb24oZW5kUG9pbnQpXG4gICAgICBpZiBAc2VsZWN0aW9uLmlzUmV2ZXJzZWQoKVxuICAgICAgICBwcm9wZXJ0aWVzLnRhaWwgPSBlbmRQb2ludFxuICAgICAgZWxzZVxuICAgICAgICBwcm9wZXJ0aWVzLmhlYWQgPSBlbmRQb2ludFxuICAgIEBzZXRQcm9wZXJ0aWVzKHByb3BlcnRpZXMpXG5cbiAgc2V0V2lzZTogKHZhbHVlKSAtPlxuICAgIEBzYXZlUHJvcGVydGllcygpIHVubGVzcyBAaGFzUHJvcGVydGllcygpXG4gICAgcHJvcGVydGllcyA9IEBnZXRQcm9wZXJ0aWVzKClcbiAgICBwcm9wZXJ0aWVzLndpc2UgPSB2YWx1ZVxuXG4gIGdldFdpc2U6IC0+XG4gICAgQGdldFByb3BlcnRpZXMoKT8ud2lzZSA/ICdjaGFyYWN0ZXJ3aXNlJ1xuXG4gIGFwcGx5V2lzZTogKG5ld1dpc2UpIC0+XG4gICAgIyBOT1RFOlxuICAgICMgTXVzdCBjYWxsIGFnYWluc3Qgbm9ybWFsaXplZCBzZWxlY3Rpb25cbiAgICAjIERvbid0IGNhbGwgbm9uLW5vcm1hbGl6ZWQgc2VsZWN0aW9uXG5cbiAgICBzd2l0Y2ggbmV3V2lzZVxuICAgICAgd2hlbiAnY2hhcmFjdGVyd2lzZSdcbiAgICAgICAgQHRyYW5zbGF0ZVNlbGVjdGlvbkVuZEFuZENsaXAoJ2ZvcndhcmQnKVxuICAgICAgICBAc2F2ZVByb3BlcnRpZXMoKVxuICAgICAgICBAc2V0V2lzZSgnY2hhcmFjdGVyd2lzZScpXG4gICAgICB3aGVuICdsaW5ld2lzZSdcbiAgICAgICAgQGNvbXBsZW1lbnRHb2FsQ29sdW1uKClcbiAgICAgICAgQGV4cGFuZE92ZXJMaW5lKHByZXNlcnZlR29hbENvbHVtbjogdHJ1ZSlcbiAgICAgICAgQHNldFdpc2UoJ2xpbmV3aXNlJylcblxuICBjb21wbGVtZW50R29hbENvbHVtbjogLT5cbiAgICB1bmxlc3MgQHNlbGVjdGlvbi5jdXJzb3IuZ29hbENvbHVtbj9cbiAgICAgIGNvbHVtbiA9IEBnZXRCdWZmZXJQb3NpdGlvbkZvcignaGVhZCcsIGZyb21Qcm9wZXJ0eTogdHJ1ZSwgYWxsb3dGYWxsYmFjazogdHJ1ZSkuY29sdW1uXG4gICAgICBAc2VsZWN0aW9uLmN1cnNvci5nb2FsQ29sdW1uID0gY29sdW1uXG5cbiAgIyBbRklYTUVdXG4gICMgV2hlbiBga2VlcENvbHVtbk9uU2VsZWN0VGV4dE9iamVjdGAgd2FzIHRydWUsXG4gICMgIGN1cnNvciBtYXJrZXIgaW4gdkwtbW9kZSBleGNlZWQgRU9MIGlmIGluaXRpYWwgcm93IGlzIGxvbmdlciB0aGFuIGVuZFJvdyBvZlxuICAjICBzZWxlY3RlZCB0ZXh0LW9iamVjdC5cbiAgIyBUbyBhdm9pZCB0aGlzIHdpcmVkIGN1cnNvciBwb3NpdGlvbiByZXByZXNlbnRhdGlvbiwgdGhpcyBmdWNudGlvbiBjbGlwXG4gICMgIHNlbGVjdGlvbiBwcm9wZXJ0aWVzIG5vdCBleGNlZWRzIEVPTC5cbiAgIyBCdXQgdGhpcyBzaG91bGQgYmUgdGVtcG9yYWwgd29ya2Fyb3VuZCwgZGVwZW5kaW5nIHRoaXMga2luZCBvZiBhZC1ob2MgYWRqdXN0bWVudCBpc1xuICAjIGJhc2ljYWxseSBiYWQgaW4gdGhlIGxvbmcgcnVuLlxuICBjbGlwUHJvcGVydGllc1RpbGxFbmRPZkxpbmU6IC0+XG4gICAgcmV0dXJuIHVubGVzcyBAaGFzUHJvcGVydGllcygpXG5cbiAgICBlZGl0b3IgPSBAc2VsZWN0aW9uLmVkaXRvclxuICAgIGhlYWRSb3dFT0wgPSBnZXRFbmRPZkxpbmVGb3JCdWZmZXJSb3coZWRpdG9yLCBAZ2V0SGVhZFJvdygpKVxuICAgIHRhaWxSb3dFT0wgPSBnZXRFbmRPZkxpbmVGb3JCdWZmZXJSb3coZWRpdG9yLCBAZ2V0VGFpbFJvdygpKVxuICAgIGhlYWRNYXhDb2x1bW4gPSBsaW1pdE51bWJlcihoZWFkUm93RU9MLmNvbHVtbiAtIDEsIG1pbjogMClcbiAgICB0YWlsTWF4Q29sdW1uID0gbGltaXROdW1iZXIodGFpbFJvd0VPTC5jb2x1bW4gLSAxLCBtaW46IDApXG5cbiAgICBwcm9wZXJ0aWVzID0gQGdldFByb3BlcnRpZXMoKVxuICAgIGlmIHByb3BlcnRpZXMuaGVhZC5jb2x1bW4gPiBoZWFkTWF4Q29sdW1uXG4gICAgICBwcm9wZXJ0aWVzLmhlYWQuY29sdW1uID0gaGVhZE1heENvbHVtblxuXG4gICAgaWYgcHJvcGVydGllcy50YWlsLmNvbHVtbiA+IHRhaWxNYXhDb2x1bW5cbiAgICAgIHByb3BlcnRpZXMudGFpbC5jb2x1bW4gPSB0YWlsTWF4Q29sdW1uXG5cbiAgY2FwdHVyZVByb3BlcnRpZXM6IC0+XG4gICAgaGVhZDogQHNlbGVjdGlvbi5nZXRIZWFkQnVmZmVyUG9zaXRpb24oKVxuICAgIHRhaWw6IEBzZWxlY3Rpb24uZ2V0VGFpbEJ1ZmZlclBvc2l0aW9uKClcblxuICBzZWxlY3RCeVByb3BlcnRpZXM6ICh7aGVhZCwgdGFpbH0pIC0+XG4gICAgIyBObyBwcm9ibGVtIGlmIGhlYWQgaXMgZ3JlYXRlciB0aGFuIHRhaWwsIFJhbmdlIGNvbnN0cnVjdG9yIHN3YXAgc3RhcnQvZW5kLlxuICAgIEBzZXRCdWZmZXJSYW5nZShbdGFpbCwgaGVhZF0pXG4gICAgQHNldFJldmVyc2VkU3RhdGUoaGVhZC5pc0xlc3NUaGFuKHRhaWwpKVxuXG4gICMgUmV0dXJuIHRydWUgaWYgc2VsZWN0aW9uIHdhcyBub24tZW1wdHkgYW5kIG5vbi1yZXZlcnNlZCBzZWxlY3Rpb24uXG4gICMgRXF1aXZhbGVudCB0byBub3Qgc2VsZWN0aW9uLmlzRW1wdHkoKSBhbmQgbm90IHNlbGVjdGlvbi5pc1JldmVyc2VkKClcIlxuICBpc0ZvcndhcmRpbmc6IC0+XG4gICAgaGVhZCA9IEBzZWxlY3Rpb24uZ2V0SGVhZEJ1ZmZlclBvc2l0aW9uKClcbiAgICB0YWlsID0gQHNlbGVjdGlvbi5nZXRUYWlsQnVmZmVyUG9zaXRpb24oKVxuICAgIGhlYWQuaXNHcmVhdGVyVGhhbih0YWlsKVxuXG4gIGFwcGx5Q29sdW1uRnJvbVByb3BlcnRpZXM6IC0+XG4gICAgc2VsZWN0aW9uUHJvcGVydGllcyA9IEBnZXRQcm9wZXJ0aWVzKClcbiAgICByZXR1cm4gdW5sZXNzIHNlbGVjdGlvblByb3BlcnRpZXM/XG4gICAge2hlYWQsIHRhaWx9ID0gc2VsZWN0aW9uUHJvcGVydGllc1xuXG4gICAgaWYgQHNlbGVjdGlvbi5pc1JldmVyc2VkKClcbiAgICAgIFtzdGFydCwgZW5kXSA9IFtoZWFkLCB0YWlsXVxuICAgIGVsc2VcbiAgICAgIFtzdGFydCwgZW5kXSA9IFt0YWlsLCBoZWFkXVxuICAgIFtzdGFydC5yb3csIGVuZC5yb3ddID0gQHNlbGVjdGlvbi5nZXRCdWZmZXJSb3dSYW5nZSgpXG4gICAgQHdpdGhLZWVwaW5nR29hbENvbHVtbiA9PlxuICAgICAgQHNldEJ1ZmZlclJhbmdlKFtzdGFydCwgZW5kXSwgcHJlc2VydmVGb2xkczogdHJ1ZSlcbiAgICAgIEB0cmFuc2xhdGVTZWxlY3Rpb25FbmRBbmRDbGlwKCdiYWNrd2FyZCcsIHRyYW5zbGF0ZTogZmFsc2UpXG5cbiAgIyBPbmx5IGZvciBzZXR0aW5nIGF1dG9zY3JvbGwgb3B0aW9uIHRvIGZhbHNlIGJ5IGRlZmF1bHRcbiAgc2V0QnVmZmVyUmFuZ2U6IChyYW5nZSwgb3B0aW9ucz17fSkgLT5cbiAgICB7a2VlcEdvYWxDb2x1bW59ID0gb3B0aW9uc1xuICAgIGRlbGV0ZSBvcHRpb25zLmtlZXBHb2FsQ29sdW1uXG4gICAgb3B0aW9ucy5hdXRvc2Nyb2xsID89IGZhbHNlXG4gICAgc2V0QnVmZmVyUmFuZ2UgPSA9PlxuICAgICAgQHNlbGVjdGlvbi5zZXRCdWZmZXJSYW5nZShyYW5nZSwgb3B0aW9ucylcblxuICAgIGlmIGtlZXBHb2FsQ29sdW1uXG4gICAgICBAd2l0aEtlZXBpbmdHb2FsQ29sdW1uKHNldEJ1ZmZlclJhbmdlKVxuICAgIGVsc2VcbiAgICAgIHNldEJ1ZmZlclJhbmdlKClcblxuICAjIFJldHVybiBvcmlnaW5hbCB0ZXh0XG4gIHJlcGxhY2U6ICh0ZXh0KSAtPlxuICAgIG9yaWdpbmFsVGV4dCA9IEBzZWxlY3Rpb24uZ2V0VGV4dCgpXG4gICAgQHNlbGVjdGlvbi5pbnNlcnRUZXh0KHRleHQpXG4gICAgb3JpZ2luYWxUZXh0XG5cbiAgbGluZVRleHRGb3JCdWZmZXJSb3dzOiAtPlxuICAgIHtlZGl0b3J9ID0gQHNlbGVjdGlvblxuICAgIEBnZXRSb3dzKCkubWFwIChyb3cpIC0+XG4gICAgICBlZGl0b3IubGluZVRleHRGb3JCdWZmZXJSb3cocm93KVxuXG4gIG1hcFRvTGluZVRleHQ6IChmbiwge2luY2x1ZGVOZXdsaW5lfT17fSkgLT5cbiAgICB7ZWRpdG9yfSA9IEBzZWxlY3Rpb25cbiAgICB0ZXh0Rm9yUm93ID0gKHJvdykgLT5cbiAgICAgIHJhbmdlID0gZWRpdG9yLmJ1ZmZlclJhbmdlRm9yQnVmZmVyUm93KHJvdywge2luY2x1ZGVOZXdsaW5lfSlcbiAgICAgIGVkaXRvci5nZXRUZXh0SW5CdWZmZXJSYW5nZShyYW5nZSlcblxuICAgIEBnZXRSb3dzKCkubWFwKHRleHRGb3JSb3cpLm1hcChmbilcblxuICB0cmFuc2xhdGU6IChzdGFydERlbHRhLCBlbmREZWx0YT1zdGFydERlbHRhLCBvcHRpb25zKSAtPlxuICAgIG5ld1JhbmdlID0gQGdldEJ1ZmZlclJhbmdlKCkudHJhbnNsYXRlKHN0YXJ0RGVsdGEsIGVuZERlbHRhKVxuICAgIEBzZXRCdWZmZXJSYW5nZShuZXdSYW5nZSwgb3B0aW9ucylcblxuICBpc1NpbmdsZVJvdzogLT5cbiAgICBbc3RhcnRSb3csIGVuZFJvd10gPSBAc2VsZWN0aW9uLmdldEJ1ZmZlclJvd1JhbmdlKClcbiAgICBzdGFydFJvdyBpcyBlbmRSb3dcblxuICBpc0xpbmV3aXNlOiAtPlxuICAgIHtzdGFydCwgZW5kfSA9IEBnZXRCdWZmZXJSYW5nZSgpXG4gICAgKHN0YXJ0LnJvdyBpc250IGVuZC5yb3cpIGFuZCAoc3RhcnQuY29sdW1uIGlzIGVuZC5jb2x1bW4gaXMgMClcblxuICBkZXRlY3RWaXN1YWxNb2RlU3VibW9kZTogLT5cbiAgICBpZiBAc2VsZWN0aW9uLmlzRW1wdHkoKVxuICAgICAgbnVsbFxuICAgIGVsc2UgaWYgQGlzTGluZXdpc2UoKVxuICAgICAgJ2xpbmV3aXNlJ1xuICAgIGVsc2VcbiAgICAgICdjaGFyYWN0ZXJ3aXNlJ1xuXG4gIHdpdGhLZWVwaW5nR29hbENvbHVtbjogKGZuKSAtPlxuICAgIHtnb2FsQ29sdW1ufSA9IEBzZWxlY3Rpb24uY3Vyc29yXG4gICAge3N0YXJ0LCBlbmR9ID0gQGdldEJ1ZmZlclJhbmdlKClcbiAgICBmbigpXG4gICAgQHNlbGVjdGlvbi5jdXJzb3IuZ29hbENvbHVtbiA9IGdvYWxDb2x1bW4gaWYgZ29hbENvbHVtbj9cblxuICAjIGRpcmVjdGlvbiBtdXN0IGJlIG9uZSBvZiBbJ2ZvcndhcmQnLCAnYmFja3dhcmQnXVxuICAjIG9wdGlvbnM6IHt0cmFuc2xhdGU6IHRydWUgb3IgZmFsc2V9IGRlZmF1bHQgdHJ1ZVxuICB0cmFuc2xhdGVTZWxlY3Rpb25FbmRBbmRDbGlwOiAoZGlyZWN0aW9uLCBvcHRpb25zKSAtPlxuICAgIGVkaXRvciA9IEBzZWxlY3Rpb24uZWRpdG9yXG4gICAgcmFuZ2UgPSBAZ2V0QnVmZmVyUmFuZ2UoKVxuICAgIG5ld1JhbmdlID0gZ2V0UmFuZ2VCeVRyYW5zbGF0ZVBvaW50QW5kQ2xpcChlZGl0b3IsIHJhbmdlLCBcImVuZFwiLCBkaXJlY3Rpb24sIG9wdGlvbnMpXG4gICAgQHdpdGhLZWVwaW5nR29hbENvbHVtbiA9PlxuICAgICAgQHNldEJ1ZmZlclJhbmdlKG5ld1JhbmdlLCBwcmVzZXJ2ZUZvbGRzOiB0cnVlKVxuXG4gIHRyYW5zbGF0ZVNlbGVjdGlvbkhlYWRBbmRDbGlwOiAoZGlyZWN0aW9uLCBvcHRpb25zKSAtPlxuICAgIGVkaXRvciA9IEBzZWxlY3Rpb24uZWRpdG9yXG4gICAgd2hpY2ggID0gaWYgQHNlbGVjdGlvbi5pc1JldmVyc2VkKCkgdGhlbiAnc3RhcnQnIGVsc2UgJ2VuZCdcblxuICAgIHJhbmdlID0gQGdldEJ1ZmZlclJhbmdlKClcbiAgICBuZXdSYW5nZSA9IGdldFJhbmdlQnlUcmFuc2xhdGVQb2ludEFuZENsaXAoZWRpdG9yLCByYW5nZSwgd2hpY2gsIGRpcmVjdGlvbiwgb3B0aW9ucylcbiAgICBAd2l0aEtlZXBpbmdHb2FsQ29sdW1uID0+XG4gICAgICBAc2V0QnVmZmVyUmFuZ2UobmV3UmFuZ2UsIHByZXNlcnZlRm9sZHM6IHRydWUpXG5cbiAgc2hyaW5rRW5kVG9CZWZvcmVOZXdMaW5lOiAtPlxuICAgIG5ld1JhbmdlID0gc2hyaW5rUmFuZ2VFbmRUb0JlZm9yZU5ld0xpbmUoQGdldEJ1ZmZlclJhbmdlKCkpXG4gICAgQHNldEJ1ZmZlclJhbmdlKG5ld1JhbmdlKVxuXG4gIHNldFN0YXJ0VG9GaXJzdENoYXJhY3Rlck9mTGluZTogLT5cbiAgICB7c3RhcnQsIGVuZH0gPSBAZ2V0QnVmZmVyUmFuZ2UoKVxuICAgIG5ld1N0YXJ0ID0gZ2V0Rmlyc3RDaGFyYWN0ZXJQb3NpdGlvbkZvckJ1ZmZlclJvdyhAc2VsZWN0aW9uLmVkaXRvciwgc3RhcnQucm93KVxuICAgIG5ld1JhbmdlID0gbmV3IFJhbmdlKG5ld1N0YXJ0LCBlbmQpXG4gICAgQHNldEJ1ZmZlclJhbmdlKG5ld1JhbmdlKVxuXG4gICMgUmV0dXJuIHNlbGVjdGlvbiBleHRlbnQgdG8gcmVwbGF5IGJsb2Nrd2lzZSBzZWxlY3Rpb24gb24gYC5gIHJlcGVhdGluZy5cbiAgZ2V0QmxvY2t3aXNlU2VsZWN0aW9uRXh0ZW50OiAtPlxuICAgIGhlYWQgPSBAc2VsZWN0aW9uLmdldEhlYWRCdWZmZXJQb3NpdGlvbigpXG4gICAgdGFpbCA9IEBzZWxlY3Rpb24uZ2V0VGFpbEJ1ZmZlclBvc2l0aW9uKClcbiAgICBuZXcgUG9pbnQoaGVhZC5yb3cgLSB0YWlsLnJvdywgaGVhZC5jb2x1bW4gLSB0YWlsLmNvbHVtbilcblxuICBub3JtYWxpemU6IC0+XG4gICAgdW5sZXNzIEBzZWxlY3Rpb24uaXNFbXB0eSgpXG4gICAgICBzd2l0Y2ggQGdldFdpc2UoKVxuICAgICAgICB3aGVuICdjaGFyYWN0ZXJ3aXNlJ1xuICAgICAgICAgIEB0cmFuc2xhdGVTZWxlY3Rpb25FbmRBbmRDbGlwKCdiYWNrd2FyZCcpXG4gICAgICAgIHdoZW4gJ2xpbmV3aXNlJ1xuICAgICAgICAgIEBhcHBseUNvbHVtbkZyb21Qcm9wZXJ0aWVzKClcbiAgICAgICAgd2hlbiAnYmxvY2t3aXNlJ1xuICAgICAgICAgIEB0cmFuc2xhdGVTZWxlY3Rpb25FbmRBbmRDbGlwKCdiYWNrd2FyZCcpXG4gICAgQGNsZWFyUHJvcGVydGllcygpXG5cbnN3cmFwID0gKHNlbGVjdGlvbikgLT5cbiAgbmV3IFNlbGVjdGlvbldyYXBwZXIoc2VsZWN0aW9uKVxuXG5zd3JhcC5zZXRSZXZlcnNlZFN0YXRlID0gKGVkaXRvciwgcmV2ZXJzZWQpIC0+XG4gIGVkaXRvci5nZXRTZWxlY3Rpb25zKCkuZm9yRWFjaCAoc2VsZWN0aW9uKSAtPlxuICAgIHN3cmFwKHNlbGVjdGlvbikuc2V0UmV2ZXJzZWRTdGF0ZShyZXZlcnNlZClcblxuc3dyYXAuZXhwYW5kT3ZlckxpbmUgPSAoZWRpdG9yLCBvcHRpb25zKSAtPlxuICBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpLmZvckVhY2ggKHNlbGVjdGlvbikgLT5cbiAgICBzd3JhcChzZWxlY3Rpb24pLmV4cGFuZE92ZXJMaW5lKG9wdGlvbnMpXG5cbnN3cmFwLnJldmVyc2UgPSAoZWRpdG9yKSAtPlxuICBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpLmZvckVhY2ggKHNlbGVjdGlvbikgLT5cbiAgICBzd3JhcChzZWxlY3Rpb24pLnJldmVyc2UoKVxuXG5zd3JhcC5jbGVhclByb3BlcnRpZXMgPSAoZWRpdG9yKSAtPlxuICBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpLmZvckVhY2ggKHNlbGVjdGlvbikgLT5cbiAgICBzd3JhcChzZWxlY3Rpb24pLmNsZWFyUHJvcGVydGllcygpXG5cbnN3cmFwLmRldGVjdFZpc3VhbE1vZGVTdWJtb2RlID0gKGVkaXRvcikgLT5cbiAgc2VsZWN0aW9ucyA9IGVkaXRvci5nZXRTZWxlY3Rpb25zKClcbiAgcmVzdWx0cyA9IChzd3JhcChzZWxlY3Rpb24pLmRldGVjdFZpc3VhbE1vZGVTdWJtb2RlKCkgZm9yIHNlbGVjdGlvbiBpbiBzZWxlY3Rpb25zKVxuXG4gIGlmIHJlc3VsdHMuZXZlcnkoKHIpIC0+IHIgaXMgJ2xpbmV3aXNlJylcbiAgICAnbGluZXdpc2UnXG4gIGVsc2UgaWYgcmVzdWx0cy5zb21lKChyKSAtPiByIGlzICdjaGFyYWN0ZXJ3aXNlJylcbiAgICAnY2hhcmFjdGVyd2lzZSdcbiAgZWxzZVxuICAgIG51bGxcblxuc3dyYXAuc2F2ZVByb3BlcnRpZXMgPSAoZWRpdG9yKSAtPlxuICBmb3Igc2VsZWN0aW9uIGluIGVkaXRvci5nZXRTZWxlY3Rpb25zKClcbiAgICBzd3JhcChzZWxlY3Rpb24pLnNhdmVQcm9wZXJ0aWVzKClcblxuc3dyYXAuY29tcGxlbWVudEdvYWxDb2x1bW4gPSAoZWRpdG9yKSAtPlxuICBmb3Igc2VsZWN0aW9uIGluIGVkaXRvci5nZXRTZWxlY3Rpb25zKClcbiAgICBzd3JhcChzZWxlY3Rpb24pLmNvbXBsZW1lbnRHb2FsQ29sdW1uKClcblxuc3dyYXAubm9ybWFsaXplID0gKGVkaXRvcikgLT5cbiAgZm9yIHNlbGVjdGlvbiBpbiBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpXG4gICAgc3dyYXAoc2VsZWN0aW9uKS5ub3JtYWxpemUoKVxuXG5zd3JhcC5zZXRXaXNlID0gKGVkaXRvciwgdmFsdWUpIC0+XG4gIGZvciBzZWxlY3Rpb24gaW4gZWRpdG9yLmdldFNlbGVjdGlvbnMoKVxuICAgIHN3cmFwKHNlbGVjdGlvbikuc2V0V2lzZSh2YWx1ZSlcblxuc3dyYXAuYXBwbHlXaXNlID0gKGVkaXRvciwgdmFsdWUpIC0+XG4gIGZvciBzZWxlY3Rpb24gaW4gZWRpdG9yLmdldFNlbGVjdGlvbnMoKVxuICAgIHN3cmFwKHNlbGVjdGlvbikuYXBwbHlXaXNlKHZhbHVlKVxuXG5zd3JhcC5jbGVhclByb3BlcnRpZXMgPSAoZWRpdG9yKSAtPlxuICBmb3Igc2VsZWN0aW9uIGluIGVkaXRvci5nZXRTZWxlY3Rpb25zKClcbiAgICBzd3JhcChzZWxlY3Rpb24pLmNsZWFyUHJvcGVydGllcygpXG5cbm1vZHVsZS5leHBvcnRzID0gc3dyYXBcbiJdfQ==
