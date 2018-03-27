(function() {
  var Disposable, Point, Range, SelectionWrapper, assertWithException, getBufferRangeForRowRange, getEndOfLineForBufferRow, getRangeByTranslatePointAndClip, isLinewiseRange, limitNumber, propertyStore, ref, ref1, swrap, translatePointAndClip,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  ref = require('atom'), Range = ref.Range, Point = ref.Point, Disposable = ref.Disposable;

  ref1 = require('./utils'), translatePointAndClip = ref1.translatePointAndClip, getRangeByTranslatePointAndClip = ref1.getRangeByTranslatePointAndClip, getEndOfLineForBufferRow = ref1.getEndOfLineForBufferRow, getBufferRangeForRowRange = ref1.getBufferRangeForRowRange, limitNumber = ref1.limitNumber, isLinewiseRange = ref1.isLinewiseRange, assertWithException = ref1.assertWithException;

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

    SelectionWrapper.prototype.setWiseProperty = function(value) {
      return this.getProperties().wise = value;
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
      var end, from, getPosition, head, ref2, ref3, ref4, ref5, start, tail;
      from = (arg != null ? arg : {}).from;
      if (from == null) {
        from = ['selection'];
      }
      getPosition = function(which) {
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
      if ((indexOf.call(from, 'property') >= 0) && this.hasProperties()) {
        ref2 = this.getProperties(), head = ref2.head, tail = ref2.tail;
        if (head.isGreaterThanOrEqual(tail)) {
          ref3 = [tail, head], start = ref3[0], end = ref3[1];
        } else {
          ref4 = [head, tail], start = ref4[0], end = ref4[1];
        }
        return getPosition(which);
      }
      if (indexOf.call(from, 'selection') >= 0) {
        ref5 = this.selection.getBufferRange(), start = ref5.start, end = ref5.end;
        head = this.selection.getHeadBufferPosition();
        tail = this.selection.getTailBufferPosition();
        return getPosition(which);
      }
    };

    SelectionWrapper.prototype.setBufferPositionTo = function(which, options) {
      var point;
      point = this.getBufferPositionFor(which, options);
      return this.selection.cursor.setBufferPosition(point);
    };

    SelectionWrapper.prototype.setReversedState = function(isReversed) {
      var head, ref2, tail, wise;
      if (this.selection.isReversed() === isReversed) {
        return;
      }
      if (this.hasProperties()) {
        ref2 = this.getProperties(), head = ref2.head, tail = ref2.tail, wise = ref2.wise;
        this.setProperties({
          head: tail,
          tail: head,
          wise: wise
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

    SelectionWrapper.prototype.expandOverLine = function() {
      var range, rowRange;
      rowRange = this.selection.getBufferRowRange();
      range = getBufferRangeForRowRange(this.selection.editor, rowRange);
      return this.setBufferRange(range);
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
        point = translatePointAndClip(editor, tailPoint, 'forward');
        return new Range(tailPoint, point);
      }
    };

    SelectionWrapper.prototype.saveProperties = function() {
      var endPoint, properties;
      properties = this.captureProperties();
      if (!this.selection.isEmpty()) {
        endPoint = this.getBufferRange().end.translate([0, -1]);
        endPoint = this.selection.editor.clipBufferPosition(endPoint);
        if (this.selection.isReversed()) {
          properties.tail = endPoint;
        } else {
          properties.head = endPoint;
        }
      }
      return this.setProperties(properties);
    };

    SelectionWrapper.prototype.fixPropertiesForLinewise = function() {
      var end, head, ref2, ref3, ref4, ref5, start, tail;
      assertWithException(this.hasProperties(), "trying to fixPropertiesForLinewise on properties-less selection");
      ref2 = this.getProperties(), head = ref2.head, tail = ref2.tail;
      if (this.selection.isReversed()) {
        ref3 = [head, tail], start = ref3[0], end = ref3[1];
      } else {
        ref4 = [tail, head], start = ref4[0], end = ref4[1];
      }
      return ref5 = this.selection.getBufferRowRange(), start.row = ref5[0], end.row = ref5[1], ref5;
    };

    SelectionWrapper.prototype.applyWise = function(newWise) {
      switch (newWise) {
        case 'characterwise':
          this.translateSelectionEndAndClip('forward');
          this.saveProperties();
          return this.setWiseProperty(newWise);
        case 'linewise':
          this.complementGoalColumn();
          this.expandOverLine();
          if (!this.hasProperties()) {
            this.saveProperties();
          }
          this.setWiseProperty(newWise);
          return this.fixPropertiesForLinewise();
      }
    };

    SelectionWrapper.prototype.complementGoalColumn = function() {
      var column;
      if (this.selection.cursor.goalColumn == null) {
        column = this.getBufferPositionFor('head', {
          from: ['property', 'selection']
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
      var head, tail;
      head = this.selection.getHeadBufferPosition();
      tail = this.selection.getTailBufferPosition();
      return {
        head: head,
        tail: tail
      };
    };

    SelectionWrapper.prototype.selectByProperties = function(arg, options) {
      var head, tail;
      head = arg.head, tail = arg.tail;
      this.setBufferRange([tail, head], options);
      return this.setReversedState(head.isLessThan(tail));
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
      this.setBufferRange([start, end]);
      return this.translateSelectionEndAndClip('backward', {
        translate: false
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

    SelectionWrapper.prototype.detectWise = function() {
      if (isLinewiseRange(this.getBufferRange())) {
        return 'linewise';
      } else {
        return 'characterwise';
      }
    };

    SelectionWrapper.prototype.translateSelectionEndAndClip = function(direction, options) {
      var editor, newRange, range;
      editor = this.selection.editor;
      range = this.getBufferRange();
      newRange = getRangeByTranslatePointAndClip(editor, range, "end", direction, options);
      return this.setBufferRange(newRange);
    };

    SelectionWrapper.prototype.translateSelectionHeadAndClip = function(direction, options) {
      var editor, newRange, range, which;
      editor = this.selection.editor;
      which = this.selection.isReversed() ? 'start' : 'end';
      range = this.getBufferRange();
      newRange = getRangeByTranslatePointAndClip(editor, range, which, direction, options);
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
        if (this.hasProperties() && this.getProperties().wise === 'linewise') {
          this.applyColumnFromProperties();
        } else {
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
    var i, len, ref2, results, selection;
    ref2 = editor.getSelections();
    results = [];
    for (i = 0, len = ref2.length; i < len; i++) {
      selection = ref2[i];
      results.push(swrap(selection).setReversedState(reversed));
    }
    return results;
  };

  swrap.detectWise = function(editor) {
    var selectionWiseIsLinewise;
    selectionWiseIsLinewise = function(selection) {
      return swrap(selection).detectWise() === 'linewise';
    };
    if (editor.getSelections().every(selectionWiseIsLinewise)) {
      return 'linewise';
    } else {
      return 'characterwise';
    }
  };

  swrap.saveProperties = function(editor) {
    var i, len, ref2, results, selection;
    ref2 = editor.getSelections();
    results = [];
    for (i = 0, len = ref2.length; i < len; i++) {
      selection = ref2[i];
      results.push(swrap(selection).saveProperties());
    }
    return results;
  };

  swrap.clearProperties = function(editor) {
    var i, len, ref2, results, selection;
    ref2 = editor.getSelections();
    results = [];
    for (i = 0, len = ref2.length; i < len; i++) {
      selection = ref2[i];
      results.push(swrap(selection).clearProperties());
    }
    return results;
  };

  swrap.normalize = function(editor) {
    var i, len, ref2, results, selection;
    ref2 = editor.getSelections();
    results = [];
    for (i = 0, len = ref2.length; i < len; i++) {
      selection = ref2[i];
      results.push(swrap(selection).normalize());
    }
    return results;
  };

  swrap.applyWise = function(editor, value) {
    var i, len, ref2, results, selection;
    ref2 = editor.getSelections();
    results = [];
    for (i = 0, len = ref2.length; i < len; i++) {
      selection = ref2[i];
      results.push(swrap(selection).applyWise(value));
    }
    return results;
  };

  swrap.fixPropertiesForLinewise = function(editor) {
    var i, len, ref2, results, selection;
    ref2 = editor.getSelections();
    results = [];
    for (i = 0, len = ref2.length; i < len; i++) {
      selection = ref2[i];
      results.push(swrap(selection).fixPropertiesForLinewise());
    }
    return results;
  };

  swrap.switchToLinewise = function(editor) {
    swrap.saveProperties(editor);
    swrap.applyWise(editor, 'linewise');
    return new Disposable(function() {
      swrap.normalize(editor);
      return swrap.applyWise(editor, 'characterwise');
    });
  };

  module.exports = swrap;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvc2VsZWN0aW9uLXdyYXBwZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSwyT0FBQTtJQUFBOztFQUFBLE1BQTZCLE9BQUEsQ0FBUSxNQUFSLENBQTdCLEVBQUMsaUJBQUQsRUFBUSxpQkFBUixFQUFlOztFQUNmLE9BUUksT0FBQSxDQUFRLFNBQVIsQ0FSSixFQUNFLGtEQURGLEVBRUUsc0VBRkYsRUFHRSx3REFIRixFQUlFLDBEQUpGLEVBS0UsOEJBTEYsRUFNRSxzQ0FORixFQU9FOztFQUdGLGFBQUEsR0FBZ0IsSUFBSTs7RUFFZDtJQUNTLDBCQUFDLFVBQUQ7TUFBQyxJQUFDLENBQUEsWUFBRDtJQUFEOzsrQkFFYixhQUFBLEdBQWUsU0FBQTthQUFHLGFBQWEsQ0FBQyxHQUFkLENBQWtCLElBQUMsQ0FBQSxTQUFuQjtJQUFIOzsrQkFDZixhQUFBLEdBQWUsU0FBQTthQUFHLGFBQWEsQ0FBQyxHQUFkLENBQWtCLElBQUMsQ0FBQSxTQUFuQjtJQUFIOzsrQkFDZixhQUFBLEdBQWUsU0FBQyxJQUFEO2FBQVUsYUFBYSxDQUFDLEdBQWQsQ0FBa0IsSUFBQyxDQUFBLFNBQW5CLEVBQThCLElBQTlCO0lBQVY7OytCQUNmLGVBQUEsR0FBaUIsU0FBQTthQUFHLGFBQWEsRUFBQyxNQUFELEVBQWIsQ0FBcUIsSUFBQyxDQUFBLFNBQXRCO0lBQUg7OytCQUNqQixlQUFBLEdBQWlCLFNBQUMsS0FBRDthQUFXLElBQUMsQ0FBQSxhQUFELENBQUEsQ0FBZ0IsQ0FBQyxJQUFqQixHQUF3QjtJQUFuQzs7K0JBRWpCLG9CQUFBLEdBQXNCLFNBQUMsS0FBRCxFQUFRLE9BQVI7TUFDcEIsSUFBRyxLQUFIO2VBQ0UsSUFBQyxDQUFBLGNBQUQsQ0FBZ0IsS0FBaEIsRUFBdUIsT0FBdkIsRUFE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QUFBO1NBQUEsc0NBQUE7O21CQUNFLEtBQUEsQ0FBTSxTQUFOLENBQWdCLENBQUMsU0FBakIsQ0FBQTtBQURGOztFQURnQjs7RUFJbEIsS0FBSyxDQUFDLFNBQU4sR0FBa0IsU0FBQyxNQUFELEVBQVMsS0FBVDtBQUNoQixRQUFBO0FBQUE7QUFBQTtTQUFBLHNDQUFBOzttQkFDRSxLQUFBLENBQU0sU0FBTixDQUFnQixDQUFDLFNBQWpCLENBQTJCLEtBQTNCO0FBREY7O0VBRGdCOztFQUlsQixLQUFLLENBQUMsd0JBQU4sR0FBaUMsU0FBQyxNQUFEO0FBQy9CLFFBQUE7QUFBQTtBQUFBO1NBQUEsc0NBQUE7O21CQUNFLEtBQUEsQ0FBTSxTQUFOLENBQWdCLENBQUMsd0JBQWpCLENBQUE7QUFERjs7RUFEK0I7O0VBTWpDLEtBQUssQ0FBQyxnQkFBTixHQUF5QixTQUFDLE1BQUQ7SUFDdkIsS0FBSyxDQUFDLGNBQU4sQ0FBcUIsTUFBckI7SUFDQSxLQUFLLENBQUMsU0FBTixDQUFnQixNQUFoQixFQUF3QixVQUF4QjtXQUNJLElBQUEsVUFBQSxDQUFXLFNBQUE7TUFDYixLQUFLLENBQUMsU0FBTixDQUFnQixNQUFoQjthQUNBLEtBQUssQ0FBQyxTQUFOLENBQWdCLE1BQWhCLEVBQXdCLGVBQXhCO0lBRmEsQ0FBWDtFQUhtQjs7RUFPekIsTUFBTSxDQUFDLE9BQVAsR0FBaUI7QUF0U2pCIiwic291cmNlc0NvbnRlbnQiOlsie1JhbmdlLCBQb2ludCwgRGlzcG9zYWJsZX0gPSByZXF1aXJlICdhdG9tJ1xue1xuICB0cmFuc2xhdGVQb2ludEFuZENsaXBcbiAgZ2V0UmFuZ2VCeVRyYW5zbGF0ZVBvaW50QW5kQ2xpcFxuICBnZXRFbmRPZkxpbmVGb3JCdWZmZXJSb3dcbiAgZ2V0QnVmZmVyUmFuZ2VGb3JSb3dSYW5nZVxuICBsaW1pdE51bWJlclxuICBpc0xpbmV3aXNlUmFuZ2VcbiAgYXNzZXJ0V2l0aEV4Y2VwdGlvblxufSA9IHJlcXVpcmUgJy4vdXRpbHMnXG5cbnByb3BlcnR5U3RvcmUgPSBuZXcgTWFwXG5cbmNsYXNzIFNlbGVjdGlvbldyYXBwZXJcbiAgY29uc3RydWN0b3I6IChAc2VsZWN0aW9uKSAtPlxuXG4gIGhhc1Byb3BlcnRpZXM6IC0+IHByb3BlcnR5U3RvcmUuaGFzKEBzZWxlY3Rpb24pXG4gIGdldFByb3BlcnRpZXM6IC0+IHByb3BlcnR5U3RvcmUuZ2V0KEBzZWxlY3Rpb24pXG4gIHNldFByb3BlcnRpZXM6IChwcm9wKSAtPiBwcm9wZXJ0eVN0b3JlLnNldChAc2VsZWN0aW9uLCBwcm9wKVxuICBjbGVhclByb3BlcnRpZXM6IC0+IHByb3BlcnR5U3RvcmUuZGVsZXRlKEBzZWxlY3Rpb24pXG4gIHNldFdpc2VQcm9wZXJ0eTogKHZhbHVlKSAtPiBAZ2V0UHJvcGVydGllcygpLndpc2UgPSB2YWx1ZVxuXG4gIHNldEJ1ZmZlclJhbmdlU2FmZWx5OiAocmFuZ2UsIG9wdGlvbnMpIC0+XG4gICAgaWYgcmFuZ2VcbiAgICAgIEBzZXRCdWZmZXJSYW5nZShyYW5nZSwgb3B0aW9ucylcblxuICBnZXRCdWZmZXJSYW5nZTogLT5cbiAgICBAc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKClcblxuICBnZXRCdWZmZXJQb3NpdGlvbkZvcjogKHdoaWNoLCB7ZnJvbX09e30pIC0+XG4gICAgZnJvbSA/PSBbJ3NlbGVjdGlvbiddXG5cbiAgICBnZXRQb3NpdGlvbiA9ICh3aGljaCkgLT5cbiAgICAgIHN3aXRjaCB3aGljaFxuICAgICAgICB3aGVuICdzdGFydCcgdGhlbiBzdGFydFxuICAgICAgICB3aGVuICdlbmQnIHRoZW4gZW5kXG4gICAgICAgIHdoZW4gJ2hlYWQnIHRoZW4gaGVhZFxuICAgICAgICB3aGVuICd0YWlsJyB0aGVuIHRhaWxcblxuICAgIGlmICgncHJvcGVydHknIGluIGZyb20pIGFuZCBAaGFzUHJvcGVydGllcygpXG4gICAgICB7aGVhZCwgdGFpbH0gPSBAZ2V0UHJvcGVydGllcygpXG4gICAgICBpZiBoZWFkLmlzR3JlYXRlclRoYW5PckVxdWFsKHRhaWwpXG4gICAgICAgIFtzdGFydCwgZW5kXSA9IFt0YWlsLCBoZWFkXVxuICAgICAgZWxzZVxuICAgICAgICBbc3RhcnQsIGVuZF0gPSBbaGVhZCwgdGFpbF1cbiAgICAgIHJldHVybiBnZXRQb3NpdGlvbih3aGljaClcblxuICAgIGlmICdzZWxlY3Rpb24nIGluIGZyb21cbiAgICAgIHtzdGFydCwgZW5kfSA9IEBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKVxuICAgICAgaGVhZCA9IEBzZWxlY3Rpb24uZ2V0SGVhZEJ1ZmZlclBvc2l0aW9uKClcbiAgICAgIHRhaWwgPSBAc2VsZWN0aW9uLmdldFRhaWxCdWZmZXJQb3NpdGlvbigpXG4gICAgICByZXR1cm4gZ2V0UG9zaXRpb24od2hpY2gpXG5cbiAgc2V0QnVmZmVyUG9zaXRpb25UbzogKHdoaWNoLCBvcHRpb25zKSAtPlxuICAgIHBvaW50ID0gQGdldEJ1ZmZlclBvc2l0aW9uRm9yKHdoaWNoLCBvcHRpb25zKVxuICAgIEBzZWxlY3Rpb24uY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHBvaW50KVxuXG4gIHNldFJldmVyc2VkU3RhdGU6IChpc1JldmVyc2VkKSAtPlxuICAgIHJldHVybiBpZiBAc2VsZWN0aW9uLmlzUmV2ZXJzZWQoKSBpcyBpc1JldmVyc2VkXG5cbiAgICBpZiBAaGFzUHJvcGVydGllcygpXG4gICAgICB7aGVhZCwgdGFpbCwgd2lzZX0gPSBAZ2V0UHJvcGVydGllcygpXG4gICAgICBAc2V0UHJvcGVydGllcyhoZWFkOiB0YWlsLCB0YWlsOiBoZWFkLCB3aXNlOiB3aXNlKVxuXG4gICAgQHNldEJ1ZmZlclJhbmdlIEBnZXRCdWZmZXJSYW5nZSgpLFxuICAgICAgYXV0b3Njcm9sbDogdHJ1ZVxuICAgICAgcmV2ZXJzZWQ6IGlzUmV2ZXJzZWRcbiAgICAgIGtlZXBHb2FsQ29sdW1uOiBmYWxzZVxuXG4gIGdldFJvd3M6IC0+XG4gICAgW3N0YXJ0Um93LCBlbmRSb3ddID0gQHNlbGVjdGlvbi5nZXRCdWZmZXJSb3dSYW5nZSgpXG4gICAgW3N0YXJ0Um93Li5lbmRSb3ddXG5cbiAgZ2V0Um93Q291bnQ6IC0+XG4gICAgQGdldFJvd3MoKS5sZW5ndGhcblxuICAjIE5hdGl2ZSBzZWxlY3Rpb24uZXhwYW5kT3ZlckxpbmUgaXMgbm90IGF3YXJlIG9mIGFjdHVhbCByb3dSYW5nZSBvZiBzZWxlY3Rpb24uXG4gIGV4cGFuZE92ZXJMaW5lOiAtPlxuICAgIHJvd1JhbmdlID0gQHNlbGVjdGlvbi5nZXRCdWZmZXJSb3dSYW5nZSgpXG4gICAgcmFuZ2UgPSBnZXRCdWZmZXJSYW5nZUZvclJvd1JhbmdlKEBzZWxlY3Rpb24uZWRpdG9yLCByb3dSYW5nZSlcbiAgICBAc2V0QnVmZmVyUmFuZ2UocmFuZ2UpXG5cbiAgZ2V0Um93Rm9yOiAod2hlcmUpIC0+XG4gICAgW3N0YXJ0Um93LCBlbmRSb3ddID0gQHNlbGVjdGlvbi5nZXRCdWZmZXJSb3dSYW5nZSgpXG4gICAgaWYgQHNlbGVjdGlvbi5pc1JldmVyc2VkKClcbiAgICAgIFtoZWFkUm93LCB0YWlsUm93XSA9IFtzdGFydFJvdywgZW5kUm93XVxuICAgIGVsc2VcbiAgICAgIFtoZWFkUm93LCB0YWlsUm93XSA9IFtlbmRSb3csIHN0YXJ0Um93XVxuXG4gICAgc3dpdGNoIHdoZXJlXG4gICAgICB3aGVuICdzdGFydCcgdGhlbiBzdGFydFJvd1xuICAgICAgd2hlbiAnZW5kJyB0aGVuIGVuZFJvd1xuICAgICAgd2hlbiAnaGVhZCcgdGhlbiBoZWFkUm93XG4gICAgICB3aGVuICd0YWlsJyB0aGVuIHRhaWxSb3dcblxuICBnZXRIZWFkUm93OiAtPiBAZ2V0Um93Rm9yKCdoZWFkJylcbiAgZ2V0VGFpbFJvdzogLT4gQGdldFJvd0ZvcigndGFpbCcpXG4gIGdldFN0YXJ0Um93OiAtPiBAZ2V0Um93Rm9yKCdzdGFydCcpXG4gIGdldEVuZFJvdzogLT4gQGdldFJvd0ZvcignZW5kJylcblxuICBnZXRUYWlsQnVmZmVyUmFuZ2U6IC0+XG4gICAge2VkaXRvcn0gPSBAc2VsZWN0aW9uXG4gICAgdGFpbFBvaW50ID0gQHNlbGVjdGlvbi5nZXRUYWlsQnVmZmVyUG9zaXRpb24oKVxuICAgIGlmIEBzZWxlY3Rpb24uaXNSZXZlcnNlZCgpXG4gICAgICBwb2ludCA9IHRyYW5zbGF0ZVBvaW50QW5kQ2xpcChlZGl0b3IsIHRhaWxQb2ludCwgJ2JhY2t3YXJkJylcbiAgICAgIG5ldyBSYW5nZShwb2ludCwgdGFpbFBvaW50KVxuICAgIGVsc2VcbiAgICAgIHBvaW50ID0gdHJhbnNsYXRlUG9pbnRBbmRDbGlwKGVkaXRvciwgdGFpbFBvaW50LCAnZm9yd2FyZCcpXG4gICAgICBuZXcgUmFuZ2UodGFpbFBvaW50LCBwb2ludClcblxuICBzYXZlUHJvcGVydGllczogLT5cbiAgICBwcm9wZXJ0aWVzID0gQGNhcHR1cmVQcm9wZXJ0aWVzKClcbiAgICB1bmxlc3MgQHNlbGVjdGlvbi5pc0VtcHR5KClcbiAgICAgICMgV2Ugc2VsZWN0UmlnaHQtZWQgaW4gdmlzdWFsLW1vZGUsIHRoaXMgdHJhbnNsYXRpb24gZGUtZWZmZWN0IHNlbGVjdC1yaWdodC1lZmZlY3RcbiAgICAgICMgU28gdGhhdCB3ZSBjYW4gYWN0aXZhdGUtdmlzdWFsLW1vZGUgd2l0aG91dCBzcGVjaWFsIHRyYW5zbGF0aW9uIGFmdGVyIHJlc3RvcmVpbmcgcHJvcGVydGllcy5cbiAgICAgIGVuZFBvaW50ID0gQGdldEJ1ZmZlclJhbmdlKCkuZW5kLnRyYW5zbGF0ZShbMCwgLTFdKVxuICAgICAgZW5kUG9pbnQgPSBAc2VsZWN0aW9uLmVkaXRvci5jbGlwQnVmZmVyUG9zaXRpb24oZW5kUG9pbnQpXG4gICAgICBpZiBAc2VsZWN0aW9uLmlzUmV2ZXJzZWQoKVxuICAgICAgICBwcm9wZXJ0aWVzLnRhaWwgPSBlbmRQb2ludFxuICAgICAgZWxzZVxuICAgICAgICBwcm9wZXJ0aWVzLmhlYWQgPSBlbmRQb2ludFxuICAgIEBzZXRQcm9wZXJ0aWVzKHByb3BlcnRpZXMpXG5cbiAgZml4UHJvcGVydGllc0ZvckxpbmV3aXNlOiAtPlxuICAgIGFzc2VydFdpdGhFeGNlcHRpb24oQGhhc1Byb3BlcnRpZXMoKSwgXCJ0cnlpbmcgdG8gZml4UHJvcGVydGllc0ZvckxpbmV3aXNlIG9uIHByb3BlcnRpZXMtbGVzcyBzZWxlY3Rpb25cIilcblxuICAgIHtoZWFkLCB0YWlsfSA9IEBnZXRQcm9wZXJ0aWVzKClcbiAgICBpZiBAc2VsZWN0aW9uLmlzUmV2ZXJzZWQoKVxuICAgICAgW3N0YXJ0LCBlbmRdID0gW2hlYWQsIHRhaWxdXG4gICAgZWxzZVxuICAgICAgW3N0YXJ0LCBlbmRdID0gW3RhaWwsIGhlYWRdXG4gICAgW3N0YXJ0LnJvdywgZW5kLnJvd10gPSBAc2VsZWN0aW9uLmdldEJ1ZmZlclJvd1JhbmdlKClcblxuICBhcHBseVdpc2U6IChuZXdXaXNlKSAtPlxuICAgICMgTk9URTpcbiAgICAjIE11c3QgY2FsbCBhZ2FpbnN0IG5vcm1hbGl6ZWQgc2VsZWN0aW9uXG4gICAgIyBEb24ndCBjYWxsIG5vbi1ub3JtYWxpemVkIHNlbGVjdGlvblxuICAgIHN3aXRjaCBuZXdXaXNlXG4gICAgICB3aGVuICdjaGFyYWN0ZXJ3aXNlJ1xuICAgICAgICBAdHJhbnNsYXRlU2VsZWN0aW9uRW5kQW5kQ2xpcCgnZm9yd2FyZCcpXG4gICAgICAgIEBzYXZlUHJvcGVydGllcygpXG4gICAgICAgIEBzZXRXaXNlUHJvcGVydHkobmV3V2lzZSlcbiAgICAgIHdoZW4gJ2xpbmV3aXNlJ1xuICAgICAgICBAY29tcGxlbWVudEdvYWxDb2x1bW4oKVxuICAgICAgICBAZXhwYW5kT3ZlckxpbmUoKVxuICAgICAgICBAc2F2ZVByb3BlcnRpZXMoKSB1bmxlc3MgQGhhc1Byb3BlcnRpZXMoKVxuICAgICAgICBAc2V0V2lzZVByb3BlcnR5KG5ld1dpc2UpXG4gICAgICAgIEBmaXhQcm9wZXJ0aWVzRm9yTGluZXdpc2UoKVxuXG4gIGNvbXBsZW1lbnRHb2FsQ29sdW1uOiAtPlxuICAgIHVubGVzcyBAc2VsZWN0aW9uLmN1cnNvci5nb2FsQ29sdW1uP1xuICAgICAgY29sdW1uID0gQGdldEJ1ZmZlclBvc2l0aW9uRm9yKCdoZWFkJywgZnJvbTogWydwcm9wZXJ0eScsICdzZWxlY3Rpb24nXSkuY29sdW1uXG4gICAgICBAc2VsZWN0aW9uLmN1cnNvci5nb2FsQ29sdW1uID0gY29sdW1uXG5cbiAgIyBbRklYTUVdXG4gICMgV2hlbiBga2VlcENvbHVtbk9uU2VsZWN0VGV4dE9iamVjdGAgd2FzIHRydWUsXG4gICMgIGN1cnNvciBtYXJrZXIgaW4gdkwtbW9kZSBleGNlZWQgRU9MIGlmIGluaXRpYWwgcm93IGlzIGxvbmdlciB0aGFuIGVuZFJvdyBvZlxuICAjICBzZWxlY3RlZCB0ZXh0LW9iamVjdC5cbiAgIyBUbyBhdm9pZCB0aGlzIHdpcmVkIGN1cnNvciBwb3NpdGlvbiByZXByZXNlbnRhdGlvbiwgdGhpcyBmdWNudGlvbiBjbGlwXG4gICMgIHNlbGVjdGlvbiBwcm9wZXJ0aWVzIG5vdCBleGNlZWRzIEVPTC5cbiAgIyBCdXQgdGhpcyBzaG91bGQgYmUgdGVtcG9yYWwgd29ya2Fyb3VuZCwgZGVwZW5kaW5nIHRoaXMga2luZCBvZiBhZC1ob2MgYWRqdXN0bWVudCBpc1xuICAjIGJhc2ljYWxseSBiYWQgaW4gdGhlIGxvbmcgcnVuLlxuICBjbGlwUHJvcGVydGllc1RpbGxFbmRPZkxpbmU6IC0+XG4gICAgcmV0dXJuIHVubGVzcyBAaGFzUHJvcGVydGllcygpXG5cbiAgICBlZGl0b3IgPSBAc2VsZWN0aW9uLmVkaXRvclxuICAgIGhlYWRSb3dFT0wgPSBnZXRFbmRPZkxpbmVGb3JCdWZmZXJSb3coZWRpdG9yLCBAZ2V0SGVhZFJvdygpKVxuICAgIHRhaWxSb3dFT0wgPSBnZXRFbmRPZkxpbmVGb3JCdWZmZXJSb3coZWRpdG9yLCBAZ2V0VGFpbFJvdygpKVxuICAgIGhlYWRNYXhDb2x1bW4gPSBsaW1pdE51bWJlcihoZWFkUm93RU9MLmNvbHVtbiAtIDEsIG1pbjogMClcbiAgICB0YWlsTWF4Q29sdW1uID0gbGltaXROdW1iZXIodGFpbFJvd0VPTC5jb2x1bW4gLSAxLCBtaW46IDApXG5cbiAgICBwcm9wZXJ0aWVzID0gQGdldFByb3BlcnRpZXMoKVxuICAgIGlmIHByb3BlcnRpZXMuaGVhZC5jb2x1bW4gPiBoZWFkTWF4Q29sdW1uXG4gICAgICBwcm9wZXJ0aWVzLmhlYWQuY29sdW1uID0gaGVhZE1heENvbHVtblxuXG4gICAgaWYgcHJvcGVydGllcy50YWlsLmNvbHVtbiA+IHRhaWxNYXhDb2x1bW5cbiAgICAgIHByb3BlcnRpZXMudGFpbC5jb2x1bW4gPSB0YWlsTWF4Q29sdW1uXG5cbiAgY2FwdHVyZVByb3BlcnRpZXM6IC0+XG4gICAgaGVhZCA9IEBzZWxlY3Rpb24uZ2V0SGVhZEJ1ZmZlclBvc2l0aW9uKClcbiAgICB0YWlsID0gQHNlbGVjdGlvbi5nZXRUYWlsQnVmZmVyUG9zaXRpb24oKVxuICAgIHtoZWFkLCB0YWlsfVxuXG4gIHNlbGVjdEJ5UHJvcGVydGllczogKHtoZWFkLCB0YWlsfSwgb3B0aW9ucykgLT5cbiAgICAjIE5vIHByb2JsZW0gaWYgaGVhZCBpcyBncmVhdGVyIHRoYW4gdGFpbCwgUmFuZ2UgY29uc3RydWN0b3Igc3dhcCBzdGFydC9lbmQuXG4gICAgQHNldEJ1ZmZlclJhbmdlKFt0YWlsLCBoZWFkXSwgb3B0aW9ucylcbiAgICBAc2V0UmV2ZXJzZWRTdGF0ZShoZWFkLmlzTGVzc1RoYW4odGFpbCkpXG5cbiAgYXBwbHlDb2x1bW5Gcm9tUHJvcGVydGllczogLT5cbiAgICBzZWxlY3Rpb25Qcm9wZXJ0aWVzID0gQGdldFByb3BlcnRpZXMoKVxuICAgIHJldHVybiB1bmxlc3Mgc2VsZWN0aW9uUHJvcGVydGllcz9cbiAgICB7aGVhZCwgdGFpbH0gPSBzZWxlY3Rpb25Qcm9wZXJ0aWVzXG5cbiAgICBpZiBAc2VsZWN0aW9uLmlzUmV2ZXJzZWQoKVxuICAgICAgW3N0YXJ0LCBlbmRdID0gW2hlYWQsIHRhaWxdXG4gICAgZWxzZVxuICAgICAgW3N0YXJ0LCBlbmRdID0gW3RhaWwsIGhlYWRdXG4gICAgW3N0YXJ0LnJvdywgZW5kLnJvd10gPSBAc2VsZWN0aW9uLmdldEJ1ZmZlclJvd1JhbmdlKClcbiAgICBAc2V0QnVmZmVyUmFuZ2UoW3N0YXJ0LCBlbmRdKVxuICAgIEB0cmFuc2xhdGVTZWxlY3Rpb25FbmRBbmRDbGlwKCdiYWNrd2FyZCcsIHRyYW5zbGF0ZTogZmFsc2UpXG5cbiAgIyBzZXQgc2VsZWN0aW9ucyBidWZmZXJSYW5nZSB3aXRoIGRlZmF1bHQgb3B0aW9uIHthdXRvc2Nyb2xsOiBmYWxzZSwgcHJlc2VydmVGb2xkczogdHJ1ZX1cbiAgc2V0QnVmZmVyUmFuZ2U6IChyYW5nZSwgb3B0aW9ucz17fSkgLT5cbiAgICBpZiBvcHRpb25zLmtlZXBHb2FsQ29sdW1uID8gdHJ1ZVxuICAgICAgZ29hbENvbHVtbiA9IEBzZWxlY3Rpb24uY3Vyc29yLmdvYWxDb2x1bW5cbiAgICBkZWxldGUgb3B0aW9ucy5rZWVwR29hbENvbHVtblxuICAgIG9wdGlvbnMuYXV0b3Njcm9sbCA/PSBmYWxzZVxuICAgIG9wdGlvbnMucHJlc2VydmVGb2xkcyA/PSB0cnVlXG4gICAgQHNlbGVjdGlvbi5zZXRCdWZmZXJSYW5nZShyYW5nZSwgb3B0aW9ucylcbiAgICBAc2VsZWN0aW9uLmN1cnNvci5nb2FsQ29sdW1uID0gZ29hbENvbHVtbiBpZiBnb2FsQ29sdW1uP1xuXG4gIGlzU2luZ2xlUm93OiAtPlxuICAgIFtzdGFydFJvdywgZW5kUm93XSA9IEBzZWxlY3Rpb24uZ2V0QnVmZmVyUm93UmFuZ2UoKVxuICAgIHN0YXJ0Um93IGlzIGVuZFJvd1xuXG4gIGRldGVjdFdpc2U6IC0+XG4gICAgaWYgaXNMaW5ld2lzZVJhbmdlKEBnZXRCdWZmZXJSYW5nZSgpKVxuICAgICAgJ2xpbmV3aXNlJ1xuICAgIGVsc2VcbiAgICAgICdjaGFyYWN0ZXJ3aXNlJ1xuXG4gICMgZGlyZWN0aW9uIG11c3QgYmUgb25lIG9mIFsnZm9yd2FyZCcsICdiYWNrd2FyZCddXG4gICMgb3B0aW9uczoge3RyYW5zbGF0ZTogdHJ1ZSBvciBmYWxzZX0gZGVmYXVsdCB0cnVlXG4gIHRyYW5zbGF0ZVNlbGVjdGlvbkVuZEFuZENsaXA6IChkaXJlY3Rpb24sIG9wdGlvbnMpIC0+XG4gICAgZWRpdG9yID0gQHNlbGVjdGlvbi5lZGl0b3JcbiAgICByYW5nZSA9IEBnZXRCdWZmZXJSYW5nZSgpXG4gICAgbmV3UmFuZ2UgPSBnZXRSYW5nZUJ5VHJhbnNsYXRlUG9pbnRBbmRDbGlwKGVkaXRvciwgcmFuZ2UsIFwiZW5kXCIsIGRpcmVjdGlvbiwgb3B0aW9ucylcbiAgICBAc2V0QnVmZmVyUmFuZ2UobmV3UmFuZ2UpXG5cbiAgdHJhbnNsYXRlU2VsZWN0aW9uSGVhZEFuZENsaXA6IChkaXJlY3Rpb24sIG9wdGlvbnMpIC0+XG4gICAgZWRpdG9yID0gQHNlbGVjdGlvbi5lZGl0b3JcbiAgICB3aGljaCA9IGlmIEBzZWxlY3Rpb24uaXNSZXZlcnNlZCgpIHRoZW4gJ3N0YXJ0JyBlbHNlICdlbmQnXG5cbiAgICByYW5nZSA9IEBnZXRCdWZmZXJSYW5nZSgpXG4gICAgbmV3UmFuZ2UgPSBnZXRSYW5nZUJ5VHJhbnNsYXRlUG9pbnRBbmRDbGlwKGVkaXRvciwgcmFuZ2UsIHdoaWNoLCBkaXJlY3Rpb24sIG9wdGlvbnMpXG4gICAgQHNldEJ1ZmZlclJhbmdlKG5ld1JhbmdlKVxuXG4gICMgUmV0dXJuIHNlbGVjdGlvbiBleHRlbnQgdG8gcmVwbGF5IGJsb2Nrd2lzZSBzZWxlY3Rpb24gb24gYC5gIHJlcGVhdGluZy5cbiAgZ2V0QmxvY2t3aXNlU2VsZWN0aW9uRXh0ZW50OiAtPlxuICAgIGhlYWQgPSBAc2VsZWN0aW9uLmdldEhlYWRCdWZmZXJQb3NpdGlvbigpXG4gICAgdGFpbCA9IEBzZWxlY3Rpb24uZ2V0VGFpbEJ1ZmZlclBvc2l0aW9uKClcbiAgICBuZXcgUG9pbnQoaGVhZC5yb3cgLSB0YWlsLnJvdywgaGVhZC5jb2x1bW4gLSB0YWlsLmNvbHVtbilcblxuICBub3JtYWxpemU6IC0+XG4gICAgdW5sZXNzIEBzZWxlY3Rpb24uaXNFbXB0eSgpXG4gICAgICBpZiBAaGFzUHJvcGVydGllcygpIGFuZCBAZ2V0UHJvcGVydGllcygpLndpc2UgaXMgJ2xpbmV3aXNlJ1xuICAgICAgICBAYXBwbHlDb2x1bW5Gcm9tUHJvcGVydGllcygpXG4gICAgICBlbHNlXG4gICAgICAgIEB0cmFuc2xhdGVTZWxlY3Rpb25FbmRBbmRDbGlwKCdiYWNrd2FyZCcpXG4gICAgQGNsZWFyUHJvcGVydGllcygpXG5cbnN3cmFwID0gKHNlbGVjdGlvbikgLT5cbiAgbmV3IFNlbGVjdGlvbldyYXBwZXIoc2VsZWN0aW9uKVxuXG5zd3JhcC5zZXRSZXZlcnNlZFN0YXRlID0gKGVkaXRvciwgcmV2ZXJzZWQpIC0+XG4gIGZvciBzZWxlY3Rpb24gaW4gZWRpdG9yLmdldFNlbGVjdGlvbnMoKVxuICAgIHN3cmFwKHNlbGVjdGlvbikuc2V0UmV2ZXJzZWRTdGF0ZShyZXZlcnNlZClcblxuc3dyYXAuZGV0ZWN0V2lzZSA9IChlZGl0b3IpIC0+XG4gIHNlbGVjdGlvbldpc2VJc0xpbmV3aXNlID0gKHNlbGVjdGlvbikgLT4gc3dyYXAoc2VsZWN0aW9uKS5kZXRlY3RXaXNlKCkgaXMgJ2xpbmV3aXNlJ1xuICBpZiBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpLmV2ZXJ5KHNlbGVjdGlvbldpc2VJc0xpbmV3aXNlKVxuICAgICdsaW5ld2lzZSdcbiAgZWxzZVxuICAgICdjaGFyYWN0ZXJ3aXNlJ1xuXG5zd3JhcC5zYXZlUHJvcGVydGllcyA9IChlZGl0b3IpIC0+XG4gIGZvciBzZWxlY3Rpb24gaW4gZWRpdG9yLmdldFNlbGVjdGlvbnMoKVxuICAgIHN3cmFwKHNlbGVjdGlvbikuc2F2ZVByb3BlcnRpZXMoKVxuXG5zd3JhcC5jbGVhclByb3BlcnRpZXMgPSAoZWRpdG9yKSAtPlxuICBmb3Igc2VsZWN0aW9uIGluIGVkaXRvci5nZXRTZWxlY3Rpb25zKClcbiAgICBzd3JhcChzZWxlY3Rpb24pLmNsZWFyUHJvcGVydGllcygpXG5cbnN3cmFwLm5vcm1hbGl6ZSA9IChlZGl0b3IpIC0+XG4gIGZvciBzZWxlY3Rpb24gaW4gZWRpdG9yLmdldFNlbGVjdGlvbnMoKVxuICAgIHN3cmFwKHNlbGVjdGlvbikubm9ybWFsaXplKClcblxuc3dyYXAuYXBwbHlXaXNlID0gKGVkaXRvciwgdmFsdWUpIC0+XG4gIGZvciBzZWxlY3Rpb24gaW4gZWRpdG9yLmdldFNlbGVjdGlvbnMoKVxuICAgIHN3cmFwKHNlbGVjdGlvbikuYXBwbHlXaXNlKHZhbHVlKVxuXG5zd3JhcC5maXhQcm9wZXJ0aWVzRm9yTGluZXdpc2UgPSAoZWRpdG9yKSAtPlxuICBmb3Igc2VsZWN0aW9uIGluIGVkaXRvci5nZXRTZWxlY3Rpb25zKClcbiAgICBzd3JhcChzZWxlY3Rpb24pLmZpeFByb3BlcnRpZXNGb3JMaW5ld2lzZSgpXG5cbiMgUmV0dXJuIGZ1bmN0aW9uIHRvIHJlc3RvcmVcbiMgVXNlZCBpbiB2bXAtbW92ZS1zZWxlY3RlZC10ZXh0XG5zd3JhcC5zd2l0Y2hUb0xpbmV3aXNlID0gKGVkaXRvcikgLT5cbiAgc3dyYXAuc2F2ZVByb3BlcnRpZXMoZWRpdG9yKVxuICBzd3JhcC5hcHBseVdpc2UoZWRpdG9yLCAnbGluZXdpc2UnKVxuICBuZXcgRGlzcG9zYWJsZSAtPlxuICAgIHN3cmFwLm5vcm1hbGl6ZShlZGl0b3IpXG4gICAgc3dyYXAuYXBwbHlXaXNlKGVkaXRvciwgJ2NoYXJhY3Rlcndpc2UnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IHN3cmFwXG4iXX0=
