(function() {
  var CompositeDisposable, Emitter, OccurrenceManager, _, collectRangeInBufferRow, isInvalidMarker, ref, ref1, shrinkRangeEndToBeforeNewLine, swrap;

  _ = require('underscore-plus');

  ref = require('atom'), Emitter = ref.Emitter, CompositeDisposable = ref.CompositeDisposable;

  swrap = require('./selection-wrapper');

  ref1 = require('./utils'), shrinkRangeEndToBeforeNewLine = ref1.shrinkRangeEndToBeforeNewLine, collectRangeInBufferRow = ref1.collectRangeInBufferRow;

  isInvalidMarker = function(marker) {
    return !marker.isValid();
  };

  module.exports = OccurrenceManager = (function() {
    OccurrenceManager.prototype.patterns = null;

    OccurrenceManager.prototype.markerOptions = {
      invalidate: 'inside'
    };

    function OccurrenceManager(vimState) {
      var decorationOptions, ref2;
      this.vimState = vimState;
      ref2 = this.vimState, this.editor = ref2.editor, this.editorElement = ref2.editorElement;
      this.disposables = new CompositeDisposable;
      this.disposables.add(this.vimState.onDidDestroy(this.destroy.bind(this)));
      this.emitter = new Emitter;
      this.patterns = [];
      this.markerLayer = this.editor.addMarkerLayer();
      decorationOptions = {
        type: 'highlight',
        "class": "vim-mode-plus-occurrence-base"
      };
      this.decorationLayer = this.editor.decorateMarkerLayer(this.markerLayer, decorationOptions);
      this.onDidChangePatterns((function(_this) {
        return function(arg) {
          var occurrenceType, pattern;
          pattern = arg.pattern, occurrenceType = arg.occurrenceType;
          if (pattern) {
            _this.markBufferRangeByPattern(pattern, occurrenceType);
            return _this.updateEditorElement();
          } else {
            return _this.clearMarkers();
          }
        };
      })(this));
      this.markerLayer.onDidUpdate(this.destroyInvalidMarkers.bind(this));
    }

    OccurrenceManager.prototype.markBufferRangeByPattern = function(pattern, occurrenceType) {
      var isSubwordRange, subwordPattern, subwordRangesByRow;
      if (occurrenceType === 'subword') {
        subwordRangesByRow = {};
        subwordPattern = this.editor.getLastCursor().subwordRegExp();
        isSubwordRange = (function(_this) {
          return function(range) {
            var row, subwordRanges;
            row = range.start.row;
            subwordRanges = subwordRangesByRow[row] != null ? subwordRangesByRow[row] : subwordRangesByRow[row] = collectRangeInBufferRow(_this.editor, row, subwordPattern);
            return subwordRanges.some(function(subwordRange) {
              return subwordRange.isEqual(range);
            });
          };
        })(this);
      }
      return this.editor.scan(pattern, (function(_this) {
        return function(arg) {
          var matchText, range;
          range = arg.range, matchText = arg.matchText;
          if (occurrenceType === 'subword') {
            if (!isSubwordRange(range)) {
              return;
            }
          }
          return _this.markerLayer.markBufferRange(range, _this.markerOptions);
        };
      })(this));
    };

    OccurrenceManager.prototype.updateEditorElement = function() {
      return this.editorElement.classList.toggle("has-occurrence", this.hasMarkers());
    };

    OccurrenceManager.prototype.onDidChangePatterns = function(fn) {
      return this.emitter.on('did-change-patterns', fn);
    };

    OccurrenceManager.prototype.destroy = function() {
      this.decorationLayer.destroy();
      this.disposables.dispose();
      return this.markerLayer.destroy();
    };

    OccurrenceManager.prototype.hasPatterns = function() {
      return this.patterns.length > 0;
    };

    OccurrenceManager.prototype.resetPatterns = function() {
      this.patterns = [];
      return this.emitter.emit('did-change-patterns', {});
    };

    OccurrenceManager.prototype.addPattern = function(pattern, arg) {
      var occurrenceType, ref2, reset;
      if (pattern == null) {
        pattern = null;
      }
      ref2 = arg != null ? arg : {}, reset = ref2.reset, occurrenceType = ref2.occurrenceType;
      if (reset) {
        this.clearMarkers();
      }
      this.patterns.push(pattern);
      if (occurrenceType == null) {
        occurrenceType = 'base';
      }
      return this.emitter.emit('did-change-patterns', {
        pattern: pattern,
        occurrenceType: occurrenceType
      });
    };

    OccurrenceManager.prototype.saveLastPattern = function(occurrenceType) {
      if (occurrenceType == null) {
        occurrenceType = null;
      }
      this.vimState.globalState.set("lastOccurrencePattern", this.buildPattern());
      return this.vimState.globalState.set("lastOccurrenceType", occurrenceType);
    };

    OccurrenceManager.prototype.buildPattern = function() {
      var source;
      source = this.patterns.map(function(pattern) {
        return pattern.source;
      }).join('|');
      return new RegExp(source, 'g');
    };

    OccurrenceManager.prototype.clearMarkers = function() {
      this.markerLayer.clear();
      return this.updateEditorElement();
    };

    OccurrenceManager.prototype.destroyMarkers = function(markers) {
      var i, len, marker;
      for (i = 0, len = markers.length; i < len; i++) {
        marker = markers[i];
        marker.destroy();
      }
      return this.updateEditorElement();
    };

    OccurrenceManager.prototype.destroyInvalidMarkers = function() {
      return this.destroyMarkers(this.getMarkers().filter(isInvalidMarker));
    };

    OccurrenceManager.prototype.hasMarkers = function() {
      return this.markerLayer.getMarkerCount() > 0;
    };

    OccurrenceManager.prototype.getMarkers = function() {
      return this.markerLayer.getMarkers();
    };

    OccurrenceManager.prototype.getMarkerBufferRanges = function() {
      return this.markerLayer.getMarkers().map(function(marker) {
        return marker.getBufferRange();
      });
    };

    OccurrenceManager.prototype.getMarkerCount = function() {
      return this.markerLayer.getMarkerCount();
    };

    OccurrenceManager.prototype.getMarkersIntersectsWithSelection = function(selection, exclusive) {
      var range;
      if (exclusive == null) {
        exclusive = false;
      }
      range = shrinkRangeEndToBeforeNewLine(selection.getBufferRange());
      return this.markerLayer.findMarkers({
        intersectsBufferRange: range
      }).filter(function(marker) {
        return range.intersectsWith(marker.getBufferRange(), exclusive);
      });
    };

    OccurrenceManager.prototype.getMarkerAtPoint = function(point) {
      var i, len, marker, markers;
      markers = this.markerLayer.findMarkers({
        containsBufferPosition: point
      });
      for (i = 0, len = markers.length; i < len; i++) {
        marker = markers[i];
        if (marker.getBufferRange().end.isGreaterThan(point)) {
          return marker;
        }
      }
    };

    OccurrenceManager.prototype.select = function() {
      var $selection, allRanges, closestRange, i, indexByOldSelection, isVisualMode, j, len, len1, markers, markersSelected, ranges, ref2, ref3, selection, selections;
      isVisualMode = this.vimState.mode === 'visual';
      indexByOldSelection = new Map;
      allRanges = [];
      markersSelected = [];
      ref2 = this.editor.getSelections();
      for (i = 0, len = ref2.length; i < len; i++) {
        selection = ref2[i];
        if (!(markers = this.getMarkersIntersectsWithSelection(selection, isVisualMode)).length) {
          continue;
        }
        ranges = markers.map(function(marker) {
          return marker.getBufferRange();
        });
        markersSelected.push.apply(markersSelected, markers);
        closestRange = this.getClosestRangeForSelection(ranges, selection);
        _.remove(ranges, closestRange);
        ranges.push(closestRange);
        allRanges.push.apply(allRanges, ranges);
        indexByOldSelection.set(selection, allRanges.indexOf(closestRange));
      }
      if (allRanges.length) {
        if (isVisualMode) {
          this.vimState.modeManager.deactivate();
          this.vimState.submode = null;
        }
        this.editor.setSelectedBufferRanges(allRanges);
        selections = this.editor.getSelections();
        indexByOldSelection.forEach((function(_this) {
          return function(index, selection) {
            return _this.vimState.mutationManager.migrateMutation(selection, selections[index]);
          };
        })(this));
        this.destroyMarkers(markersSelected);
        ref3 = swrap.getSelections(this.editor);
        for (j = 0, len1 = ref3.length; j < len1; j++) {
          $selection = ref3[j];
          $selection.saveProperties();
        }
        return true;
      } else {
        return false;
      }
    };

    OccurrenceManager.prototype.getClosestRangeForSelection = function(ranges, selection) {
      var i, j, k, len, len1, len2, point, range, rangesStartFromSameRow;
      point = this.vimState.mutationManager.mutationsBySelection.get(selection).initialPoint;
      for (i = 0, len = ranges.length; i < len; i++) {
        range = ranges[i];
        if (range.containsPoint(point)) {
          return range;
        }
      }
      rangesStartFromSameRow = ranges.filter(function(range) {
        return range.start.row === point.row;
      });
      if (rangesStartFromSameRow.length) {
        for (j = 0, len1 = rangesStartFromSameRow.length; j < len1; j++) {
          range = rangesStartFromSameRow[j];
          if (range.start.isGreaterThan(point)) {
            return range;
          }
        }
        return rangesStartFromSameRow[0];
      }
      for (k = 0, len2 = ranges.length; k < len2; k++) {
        range = ranges[k];
        if (range.start.isGreaterThan(point)) {
          return range;
        }
      }
      return ranges[0];
    };

    return OccurrenceManager;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvb2NjdXJyZW5jZS1tYW5hZ2VyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUjs7RUFDSixNQUFpQyxPQUFBLENBQVEsTUFBUixDQUFqQyxFQUFDLHFCQUFELEVBQVU7O0VBQ1YsS0FBQSxHQUFRLE9BQUEsQ0FBUSxxQkFBUjs7RUFFUixPQUdJLE9BQUEsQ0FBUSxTQUFSLENBSEosRUFDRSxrRUFERixFQUVFOztFQUdGLGVBQUEsR0FBa0IsU0FBQyxNQUFEO1dBQVksQ0FBSSxNQUFNLENBQUMsT0FBUCxDQUFBO0VBQWhCOztFQUVsQixNQUFNLENBQUMsT0FBUCxHQUNNO2dDQUNKLFFBQUEsR0FBVTs7Z0NBQ1YsYUFBQSxHQUFlO01BQUMsVUFBQSxFQUFZLFFBQWI7OztJQUVGLDJCQUFDLFFBQUQ7QUFDWCxVQUFBO01BRFksSUFBQyxDQUFBLFdBQUQ7TUFDWixPQUE0QixJQUFDLENBQUEsUUFBN0IsRUFBQyxJQUFDLENBQUEsY0FBQSxNQUFGLEVBQVUsSUFBQyxDQUFBLHFCQUFBO01BQ1gsSUFBQyxDQUFBLFdBQUQsR0FBZSxJQUFJO01BQ25CLElBQUMsQ0FBQSxXQUFXLENBQUMsR0FBYixDQUFpQixJQUFDLENBQUEsUUFBUSxDQUFDLFlBQVYsQ0FBdUIsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQWMsSUFBZCxDQUF2QixDQUFqQjtNQUNBLElBQUMsQ0FBQSxPQUFELEdBQVcsSUFBSTtNQUNmLElBQUMsQ0FBQSxRQUFELEdBQVk7TUFFWixJQUFDLENBQUEsV0FBRCxHQUFlLElBQUMsQ0FBQSxNQUFNLENBQUMsY0FBUixDQUFBO01BQ2YsaUJBQUEsR0FBb0I7UUFBQyxJQUFBLEVBQU0sV0FBUDtRQUFvQixDQUFB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QUExQyxFQUFxRCxVQUFXLENBQUEsS0FBQSxDQUFoRTtVQUQwQjtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBNUI7UUFHQSxJQUFDLENBQUEsY0FBRCxDQUFnQixlQUFoQjtBQUNBO0FBQUEsYUFBQSx3Q0FBQTs7VUFDRSxVQUFVLENBQUMsY0FBWCxDQUFBO0FBREY7ZUFFQSxLQWRGO09BQUEsTUFBQTtlQWdCRSxNQWhCRjs7SUFsQk07O2dDQXlDUiwyQkFBQSxHQUE2QixTQUFDLE1BQUQsRUFBUyxTQUFUO0FBQzNCLFVBQUE7TUFBQSxLQUFBLEdBQVEsSUFBQyxDQUFBLFFBQVEsQ0FBQyxlQUFlLENBQUMsb0JBQW9CLENBQUMsR0FBL0MsQ0FBbUQsU0FBbkQsQ0FBNkQsQ0FBQztBQUV0RSxXQUFBLHdDQUFBOztZQUF5QixLQUFLLENBQUMsYUFBTixDQUFvQixLQUFwQjtBQUN2QixpQkFBTzs7QUFEVDtNQUdBLHNCQUFBLEdBQXlCLE1BQU0sQ0FBQyxNQUFQLENBQWMsU0FBQyxLQUFEO2VBQVcsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFaLEtBQW1CLEtBQUssQ0FBQztNQUFwQyxDQUFkO01BRXpCLElBQUcsc0JBQXNCLENBQUMsTUFBMUI7QUFDRSxhQUFBLDBEQUFBOztjQUF5QyxLQUFLLENBQUMsS0FBSyxDQUFDLGFBQVosQ0FBMEIsS0FBMUI7QUFDdkMsbUJBQU87O0FBRFQ7QUFFQSxlQUFPLHNCQUF1QixDQUFBLENBQUEsRUFIaEM7O0FBS0EsV0FBQSwwQ0FBQTs7WUFBeUIsS0FBSyxDQUFDLEtBQUssQ0FBQyxhQUFaLENBQTBCLEtBQTFCO0FBQ3ZCLGlCQUFPOztBQURUO2FBR0EsTUFBTyxDQUFBLENBQUE7SUFoQm9COzs7OztBQXhML0IiLCJzb3VyY2VzQ29udGVudCI6WyJfID0gcmVxdWlyZSAndW5kZXJzY29yZS1wbHVzJ1xue0VtaXR0ZXIsIENvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSAnYXRvbSdcbnN3cmFwID0gcmVxdWlyZSAnLi9zZWxlY3Rpb24td3JhcHBlcidcblxue1xuICBzaHJpbmtSYW5nZUVuZFRvQmVmb3JlTmV3TGluZVxuICBjb2xsZWN0UmFuZ2VJbkJ1ZmZlclJvd1xufSA9IHJlcXVpcmUgJy4vdXRpbHMnXG5cbmlzSW52YWxpZE1hcmtlciA9IChtYXJrZXIpIC0+IG5vdCBtYXJrZXIuaXNWYWxpZCgpXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIE9jY3VycmVuY2VNYW5hZ2VyXG4gIHBhdHRlcm5zOiBudWxsXG4gIG1hcmtlck9wdGlvbnM6IHtpbnZhbGlkYXRlOiAnaW5zaWRlJ31cblxuICBjb25zdHJ1Y3RvcjogKEB2aW1TdGF0ZSkgLT5cbiAgICB7QGVkaXRvciwgQGVkaXRvckVsZW1lbnR9ID0gQHZpbVN0YXRlXG4gICAgQGRpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcbiAgICBAZGlzcG9zYWJsZXMuYWRkIEB2aW1TdGF0ZS5vbkRpZERlc3Ryb3koQGRlc3Ryb3kuYmluZCh0aGlzKSlcbiAgICBAZW1pdHRlciA9IG5ldyBFbWl0dGVyXG4gICAgQHBhdHRlcm5zID0gW11cblxuICAgIEBtYXJrZXJMYXllciA9IEBlZGl0b3IuYWRkTWFya2VyTGF5ZXIoKVxuICAgIGRlY29yYXRpb25PcHRpb25zID0ge3R5cGU6ICdoaWdobGlnaHQnLCBjbGFzczogXCJ2aW0tbW9kZS1wbHVzLW9jY3VycmVuY2UtYmFzZVwifVxuICAgIEBkZWNvcmF0aW9uTGF5ZXIgPSBAZWRpdG9yLmRlY29yYXRlTWFya2VyTGF5ZXIoQG1hcmtlckxheWVyLCBkZWNvcmF0aW9uT3B0aW9ucylcblxuICAgICMgQHBhdHRlcm5zIGlzIHNpbmdsZSBzb3VyY2Ugb2YgdHJ1dGggKFNTT1QpXG4gICAgIyBBbGwgbWFrZXIgY3JlYXRlL2Rlc3Ryb3kvY3NzLXVwZGF0ZSBpcyBkb25lIGJ5IHJlYWN0aW5nIEBwYXR0ZXJzJ3MgY2hhbmdlLlxuICAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIEBvbkRpZENoYW5nZVBhdHRlcm5zICh7cGF0dGVybiwgb2NjdXJyZW5jZVR5cGV9KSA9PlxuICAgICAgaWYgcGF0dGVyblxuICAgICAgICBAbWFya0J1ZmZlclJhbmdlQnlQYXR0ZXJuKHBhdHRlcm4sIG9jY3VycmVuY2VUeXBlKVxuICAgICAgICBAdXBkYXRlRWRpdG9yRWxlbWVudCgpXG4gICAgICBlbHNlXG4gICAgICAgIEBjbGVhck1hcmtlcnMoKVxuXG4gICAgQG1hcmtlckxheWVyLm9uRGlkVXBkYXRlKEBkZXN0cm95SW52YWxpZE1hcmtlcnMuYmluZCh0aGlzKSlcblxuICBtYXJrQnVmZmVyUmFuZ2VCeVBhdHRlcm46IChwYXR0ZXJuLCBvY2N1cnJlbmNlVHlwZSkgLT5cbiAgICBpZiBvY2N1cnJlbmNlVHlwZSBpcyAnc3Vid29yZCdcbiAgICAgIHN1YndvcmRSYW5nZXNCeVJvdyA9IHt9ICMgY2FjaGVcbiAgICAgIHN1YndvcmRQYXR0ZXJuID0gQGVkaXRvci5nZXRMYXN0Q3Vyc29yKCkuc3Vid29yZFJlZ0V4cCgpXG4gICAgICBpc1N1YndvcmRSYW5nZSA9IChyYW5nZSkgPT5cbiAgICAgICAgcm93ID0gcmFuZ2Uuc3RhcnQucm93XG4gICAgICAgIHN1YndvcmRSYW5nZXMgPSBzdWJ3b3JkUmFuZ2VzQnlSb3dbcm93XSA/PSBjb2xsZWN0UmFuZ2VJbkJ1ZmZlclJvdyhAZWRpdG9yLCByb3csIHN1YndvcmRQYXR0ZXJuKVxuICAgICAgICBzdWJ3b3JkUmFuZ2VzLnNvbWUgKHN1YndvcmRSYW5nZSkgLT4gc3Vid29yZFJhbmdlLmlzRXF1YWwocmFuZ2UpXG5cbiAgICBAZWRpdG9yLnNjYW4gcGF0dGVybiwgKHtyYW5nZSwgbWF0Y2hUZXh0fSkgPT5cbiAgICAgIGlmIG9jY3VycmVuY2VUeXBlIGlzICdzdWJ3b3JkJ1xuICAgICAgICByZXR1cm4gdW5sZXNzIGlzU3Vid29yZFJhbmdlKHJhbmdlKVxuICAgICAgQG1hcmtlckxheWVyLm1hcmtCdWZmZXJSYW5nZShyYW5nZSwgQG1hcmtlck9wdGlvbnMpXG5cbiAgdXBkYXRlRWRpdG9yRWxlbWVudDogLT5cbiAgICBAZWRpdG9yRWxlbWVudC5jbGFzc0xpc3QudG9nZ2xlKFwiaGFzLW9jY3VycmVuY2VcIiwgQGhhc01hcmtlcnMoKSlcblxuICAjIENhbGxiYWNrIGdldCBwYXNzZWQgZm9sbG93aW5nIG9iamVjdFxuICAjIC0gcGF0dGVybjogY2FuIGJlIHVuZGVmaW5lZCBvbiByZXNldCBldmVudFxuICBvbkRpZENoYW5nZVBhdHRlcm5zOiAoZm4pIC0+XG4gICAgQGVtaXR0ZXIub24oJ2RpZC1jaGFuZ2UtcGF0dGVybnMnLCBmbilcblxuICBkZXN0cm95OiAtPlxuICAgIEBkZWNvcmF0aW9uTGF5ZXIuZGVzdHJveSgpXG4gICAgQGRpc3Bvc2FibGVzLmRpc3Bvc2UoKVxuICAgIEBtYXJrZXJMYXllci5kZXN0cm95KClcblxuICAjIFBhdHRlcm5zXG4gIGhhc1BhdHRlcm5zOiAtPlxuICAgIEBwYXR0ZXJucy5sZW5ndGggPiAwXG5cbiAgcmVzZXRQYXR0ZXJuczogLT5cbiAgICBAcGF0dGVybnMgPSBbXVxuICAgIEBlbWl0dGVyLmVtaXQoJ2RpZC1jaGFuZ2UtcGF0dGVybnMnLCB7fSlcblxuICBhZGRQYXR0ZXJuOiAocGF0dGVybj1udWxsLCB7cmVzZXQsIG9jY3VycmVuY2VUeXBlfT17fSkgLT5cbiAgICBAY2xlYXJNYXJrZXJzKCkgaWYgcmVzZXRcbiAgICBAcGF0dGVybnMucHVzaChwYXR0ZXJuKVxuICAgIG9jY3VycmVuY2VUeXBlID89ICdiYXNlJ1xuICAgIEBlbWl0dGVyLmVtaXQoJ2RpZC1jaGFuZ2UtcGF0dGVybnMnLCB7cGF0dGVybiwgb2NjdXJyZW5jZVR5cGV9KVxuXG4gIHNhdmVMYXN0UGF0dGVybjogKG9jY3VycmVuY2VUeXBlPW51bGwpIC0+XG4gICAgQHZpbVN0YXRlLmdsb2JhbFN0YXRlLnNldChcImxhc3RPY2N1cnJlbmNlUGF0dGVyblwiLCBAYnVpbGRQYXR0ZXJuKCkpXG4gICAgQHZpbVN0YXRlLmdsb2JhbFN0YXRlLnNldChcImxhc3RPY2N1cnJlbmNlVHlwZVwiLCBvY2N1cnJlbmNlVHlwZSlcblxuICAjIFJldHVybiByZWdleCByZXByZXNlbnRpbmcgZmluYWwgcGF0dGVybi5cbiAgIyBVc2VkIHRvIGNhY2hlIGZpbmFsIHBhdHRlcm4gdG8gZWFjaCBpbnN0YW5jZSBvZiBvcGVyYXRvciBzbyB0aGF0IHdlIGNhblxuICAjIHJlcGVhdCByZWNvcmRlZCBvcGVyYXRpb24gYnkgYC5gLlxuICAjIFBhdHRlcm4gY2FuIGJlIGFkZGVkIGludGVyYWN0aXZlbHkgb25lIGJ5IG9uZSwgYnV0IHdlIHNhdmUgaXQgYXMgdW5pb24gcGF0dGVybi5cbiAgYnVpbGRQYXR0ZXJuOiAtPlxuICAgIHNvdXJjZSA9IEBwYXR0ZXJucy5tYXAoKHBhdHRlcm4pIC0+IHBhdHRlcm4uc291cmNlKS5qb2luKCd8JylcbiAgICBuZXcgUmVnRXhwKHNvdXJjZSwgJ2cnKVxuXG4gICMgTWFya2Vyc1xuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgY2xlYXJNYXJrZXJzOiAtPlxuICAgIEBtYXJrZXJMYXllci5jbGVhcigpXG4gICAgQHVwZGF0ZUVkaXRvckVsZW1lbnQoKVxuXG4gIGRlc3Ryb3lNYXJrZXJzOiAobWFya2VycykgLT5cbiAgICBtYXJrZXIuZGVzdHJveSgpIGZvciBtYXJrZXIgaW4gbWFya2Vyc1xuICAgICMgd2hlbmVydmVyIHdlIGRlc3Ryb3kgbWFya2VyLCB3ZSBzaG91bGQgc3luYyBgaGFzLW9jY3VycmVuY2VgIHNjb3BlIGluIG1hcmtlciBzdGF0ZS4uXG4gICAgQHVwZGF0ZUVkaXRvckVsZW1lbnQoKVxuXG4gIGRlc3Ryb3lJbnZhbGlkTWFya2VyczogLT5cbiAgICBAZGVzdHJveU1hcmtlcnMoQGdldE1hcmtlcnMoKS5maWx0ZXIoaXNJbnZhbGlkTWFya2VyKSlcblxuICBoYXNNYXJrZXJzOiAtPlxuICAgIEBtYXJrZXJMYXllci5nZXRNYXJrZXJDb3VudCgpID4gMFxuXG4gIGdldE1hcmtlcnM6IC0+XG4gICAgQG1hcmtlckxheWVyLmdldE1hcmtlcnMoKVxuXG4gIGdldE1hcmtlckJ1ZmZlclJhbmdlczogLT5cbiAgICBAbWFya2VyTGF5ZXIuZ2V0TWFya2VycygpLm1hcCAobWFya2VyKSAtPiBtYXJrZXIuZ2V0QnVmZmVyUmFuZ2UoKVxuXG4gIGdldE1hcmtlckNvdW50OiAtPlxuICAgIEBtYXJrZXJMYXllci5nZXRNYXJrZXJDb3VudCgpXG5cbiAgIyBSZXR1cm4gb2NjdXJyZW5jZSBtYXJrZXJzIGludGVyc2VjdGluZyBnaXZlbiByYW5nZXNcbiAgZ2V0TWFya2Vyc0ludGVyc2VjdHNXaXRoU2VsZWN0aW9uOiAoc2VsZWN0aW9uLCBleGNsdXNpdmU9ZmFsc2UpIC0+XG4gICAgIyBmaW5kbWFya2VycygpJ3MgaW50ZXJzZWN0c0J1ZmZlclJhbmdlIHBhcmFtIGhhdmUgbm8gZXhjbHVzaXZlIGNvbnRyb2xcbiAgICAjIFNvIG5lZWQgZXh0cmEgY2hlY2sgdG8gZmlsdGVyIG91dCB1bndhbnRlZCBtYXJrZXIuXG4gICAgIyBCdXQgYmFzaWNhbGx5IEkgc2hvdWxkIHByZWZlciBmaW5kTWFya2VyIHNpbmNlIEl0J3MgZmFzdCB0aGFuIGl0ZXJhdGluZ1xuICAgICMgd2hvbGUgbWFya2VycyBtYW51YWxseS5cbiAgICByYW5nZSA9IHNocmlua1JhbmdlRW5kVG9CZWZvcmVOZXdMaW5lKHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpKVxuICAgIEBtYXJrZXJMYXllci5maW5kTWFya2VycyhpbnRlcnNlY3RzQnVmZmVyUmFuZ2U6IHJhbmdlKS5maWx0ZXIgKG1hcmtlcikgLT5cbiAgICAgIHJhbmdlLmludGVyc2VjdHNXaXRoKG1hcmtlci5nZXRCdWZmZXJSYW5nZSgpLCBleGNsdXNpdmUpXG5cbiAgZ2V0TWFya2VyQXRQb2ludDogKHBvaW50KSAtPlxuICAgIG1hcmtlcnMgPSBAbWFya2VyTGF5ZXIuZmluZE1hcmtlcnMoY29udGFpbnNCdWZmZXJQb3NpdGlvbjogcG9pbnQpXG4gICAgIyBXZSBoYXZlIHRvIGNoZWNrIGFsbCByZXR1cm5lZCBtYXJrZXIgdW50aWwgZm91bmQsIHNpbmNlIHdlIGRvIGFkaXRpb25hbCBtYXJrZXIgdmFsaWRhdGlvbi5cbiAgICAjIGUuZy4gRm9yIHRleHQgYGFiYygpYCwgbWFyayBmb3IgYGFiY2AgYW5kIGAoYC4gY3Vyc29yIG9uIGAoYCBjaGFyIHJldHVybiBtdWx0aXBsZSBtYXJrZXJcbiAgICAjIGFuZCB3ZSBwaWNrIGAoYCBieSBpc0dyZWF0ZXJUaGFuIGNoZWNrLlxuICAgIGZvciBtYXJrZXIgaW4gbWFya2VycyB3aGVuIG1hcmtlci5nZXRCdWZmZXJSYW5nZSgpLmVuZC5pc0dyZWF0ZXJUaGFuKHBvaW50KVxuICAgICAgcmV0dXJuIG1hcmtlclxuXG4gICMgU2VsZWN0IG9jY3VycmVuY2UgbWFya2VyIGJ1ZmZlclJhbmdlIGludGVyc2VjdGluZyBjdXJyZW50IHNlbGVjdGlvbnMuXG4gICMgLSBSZXR1cm46IHRydWUvZmFsc2UgdG8gaW5kaWNhdGUgc3VjY2VzcyBvciBmYWlsXG4gICNcbiAgIyBEbyBzcGVjaWFsIGhhbmRsaW5nIGZvciB3aGljaCBvY2N1cnJlbmNlIHJhbmdlIGJlY29tZSBsYXN0U2VsZWN0aW9uXG4gICMgZS5nLlxuICAjICAtIGMoY2hhbmdlKTogU28gdGhhdCBhdXRvY29tcGxldGUrcG9wdXAgc2hvd3MgYXQgb3JpZ2luYWwgY3Vyc29yIHBvc2l0aW9uIG9yIG5lYXIuXG4gICMgIC0gZyBVKHVwcGVyLWNhc2UpOiBTbyB0aGF0IHVuZG8vcmVkbyBjYW4gcmVzcGVjdCBsYXN0IGN1cnNvciBwb3NpdGlvbi5cbiAgc2VsZWN0OiAtPlxuICAgIGlzVmlzdWFsTW9kZSA9IEB2aW1TdGF0ZS5tb2RlIGlzICd2aXN1YWwnXG4gICAgaW5kZXhCeU9sZFNlbGVjdGlvbiA9IG5ldyBNYXBcbiAgICBhbGxSYW5nZXMgPSBbXVxuICAgIG1hcmtlcnNTZWxlY3RlZCA9IFtdXG5cbiAgICBmb3Igc2VsZWN0aW9uIGluIEBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpIHdoZW4gKG1hcmtlcnMgPSBAZ2V0TWFya2Vyc0ludGVyc2VjdHNXaXRoU2VsZWN0aW9uKHNlbGVjdGlvbiwgaXNWaXN1YWxNb2RlKSkubGVuZ3RoXG4gICAgICByYW5nZXMgPSBtYXJrZXJzLm1hcCAobWFya2VyKSAtPiBtYXJrZXIuZ2V0QnVmZmVyUmFuZ2UoKVxuICAgICAgbWFya2Vyc1NlbGVjdGVkLnB1c2gobWFya2Vycy4uLilcbiAgICAgICMgW0hBQ0tdIFBsYWNlIGNsb3Nlc3QgcmFuZ2UgdG8gbGFzdCBzbyB0aGF0IGZpbmFsIGxhc3Qtc2VsZWN0aW9uIGJlY29tZSBjbG9zZXN0IG9uZS5cbiAgICAgICMgRS5nLlxuICAgICAgIyBgYyBvIGZgKGNoYW5nZSBvY2N1cnJlbmNlIGluIGEtZnVuY3Rpb24pIHNob3cgYXV0b2NvbXBsZXRlKyBwb3B1cCBhdCBjbG9zZXN0IG9jY3VycmVuY2UuKCBwb3B1cCBzaG93cyBhdCBsYXN0LXNlbGVjdGlvbiApXG4gICAgICBjbG9zZXN0UmFuZ2UgPSBAZ2V0Q2xvc2VzdFJhbmdlRm9yU2VsZWN0aW9uKHJhbmdlcywgc2VsZWN0aW9uKVxuICAgICAgXy5yZW1vdmUocmFuZ2VzLCBjbG9zZXN0UmFuZ2UpXG4gICAgICByYW5nZXMucHVzaChjbG9zZXN0UmFuZ2UpXG4gICAgICBhbGxSYW5nZXMucHVzaChyYW5nZXMuLi4pXG4gICAgICBpbmRleEJ5T2xkU2VsZWN0aW9uLnNldChzZWxlY3Rpb24sIGFsbFJhbmdlcy5pbmRleE9mKGNsb3Nlc3RSYW5nZSkpXG5cbiAgICBpZiBhbGxSYW5nZXMubGVuZ3RoXG4gICAgICBpZiBpc1Zpc3VhbE1vZGVcbiAgICAgICAgIyBUbyBhdm9pZCBzZWxlY3RlZCBvY2N1cnJlbmNlIHJ1aW5lZCBieSBub3JtYWxpemF0aW9uIHdoZW4gZGlzcG9zaW5nIGN1cnJlbnQgc3VibW9kZSB0byBzaGlmdCB0byBuZXcgc3VibW9kZS5cbiAgICAgICAgQHZpbVN0YXRlLm1vZGVNYW5hZ2VyLmRlYWN0aXZhdGUoKVxuICAgICAgICBAdmltU3RhdGUuc3VibW9kZSA9IG51bGxcblxuICAgICAgQGVkaXRvci5zZXRTZWxlY3RlZEJ1ZmZlclJhbmdlcyhhbGxSYW5nZXMpXG4gICAgICBzZWxlY3Rpb25zID0gQGVkaXRvci5nZXRTZWxlY3Rpb25zKClcbiAgICAgIGluZGV4QnlPbGRTZWxlY3Rpb24uZm9yRWFjaCAoaW5kZXgsIHNlbGVjdGlvbikgPT5cbiAgICAgICAgQHZpbVN0YXRlLm11dGF0aW9uTWFuYWdlci5taWdyYXRlTXV0YXRpb24oc2VsZWN0aW9uLCBzZWxlY3Rpb25zW2luZGV4XSlcblxuICAgICAgQGRlc3Ryb3lNYXJrZXJzKG1hcmtlcnNTZWxlY3RlZClcbiAgICAgIGZvciAkc2VsZWN0aW9uIGluIHN3cmFwLmdldFNlbGVjdGlvbnMoQGVkaXRvcilcbiAgICAgICAgJHNlbGVjdGlvbi5zYXZlUHJvcGVydGllcygpXG4gICAgICB0cnVlXG4gICAgZWxzZVxuICAgICAgZmFsc2VcblxuICAjIFdoaWNoIG9jY3VycmVuY2UgYmVjb21lIGxhc3RTZWxlY3Rpb24gaXMgZGV0ZXJtaW5lZCBieSBmb2xsb3dpbmcgb3JkZXJcbiAgIyAgMS4gT2NjdXJyZW5jZSB1bmRlciBvcmlnaW5hbCBjdXJzb3IgcG9zaXRpb25cbiAgIyAgMi4gZm9yd2FyZGluZyBpbiBzYW1lIHJvd1xuICAjICAzLiBmaXJzdCBvY2N1cnJlbmNlIGluIHNhbWUgcm93XG4gICMgIDQuIGZvcndhcmRpbmcgKHdyYXAtZW5kKVxuICBnZXRDbG9zZXN0UmFuZ2VGb3JTZWxlY3Rpb246IChyYW5nZXMsIHNlbGVjdGlvbikgLT5cbiAgICBwb2ludCA9IEB2aW1TdGF0ZS5tdXRhdGlvbk1hbmFnZXIubXV0YXRpb25zQnlTZWxlY3Rpb24uZ2V0KHNlbGVjdGlvbikuaW5pdGlhbFBvaW50XG5cbiAgICBmb3IgcmFuZ2UgaW4gcmFuZ2VzIHdoZW4gcmFuZ2UuY29udGFpbnNQb2ludChwb2ludClcbiAgICAgIHJldHVybiByYW5nZVxuXG4gICAgcmFuZ2VzU3RhcnRGcm9tU2FtZVJvdyA9IHJhbmdlcy5maWx0ZXIoKHJhbmdlKSAtPiByYW5nZS5zdGFydC5yb3cgaXMgcG9pbnQucm93KVxuXG4gICAgaWYgcmFuZ2VzU3RhcnRGcm9tU2FtZVJvdy5sZW5ndGhcbiAgICAgIGZvciByYW5nZSBpbiByYW5nZXNTdGFydEZyb21TYW1lUm93IHdoZW4gcmFuZ2Uuc3RhcnQuaXNHcmVhdGVyVGhhbihwb2ludClcbiAgICAgICAgcmV0dXJuIHJhbmdlICMgRm9yd2FyZGluZ1xuICAgICAgcmV0dXJuIHJhbmdlc1N0YXJ0RnJvbVNhbWVSb3dbMF1cblxuICAgIGZvciByYW5nZSBpbiByYW5nZXMgd2hlbiByYW5nZS5zdGFydC5pc0dyZWF0ZXJUaGFuKHBvaW50KSAgIyBGb3J3YXJkaW5nXG4gICAgICByZXR1cm4gcmFuZ2VcblxuICAgIHJhbmdlc1swXSAjIHJldHVybiBmaXJzdCBhcyBmYWxsYmFja1xuIl19
