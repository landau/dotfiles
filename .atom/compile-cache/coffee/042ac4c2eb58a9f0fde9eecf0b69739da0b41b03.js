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
      return this.markerLayer.findMarkers({
        containsBufferPosition: point
      })[0];
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvb2NjdXJyZW5jZS1tYW5hZ2VyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUjs7RUFDSixNQUFpQyxPQUFBLENBQVEsTUFBUixDQUFqQyxFQUFDLHFCQUFELEVBQVU7O0VBQ1YsS0FBQSxHQUFRLE9BQUEsQ0FBUSxxQkFBUjs7RUFFUixPQUdJLE9BQUEsQ0FBUSxTQUFSLENBSEosRUFDRSxrRUFERixFQUVFOztFQUdGLGVBQUEsR0FBa0IsU0FBQyxNQUFEO1dBQVksQ0FBSSxNQUFNLENBQUMsT0FBUCxDQUFBO0VBQWhCOztFQUVsQixNQUFNLENBQUMsT0FBUCxHQUNNO2dDQUNKLFFBQUEsR0FBVTs7Z0NBQ1YsYUFBQSxHQUFlO01BQUMsVUFBQSxFQUFZLFFBQWI7OztJQUVGLDJCQUFDLFFBQUQ7QUFDWCxVQUFBO01BRFksSUFBQyxDQUFBLFdBQUQ7TUFDWixPQUE0QixJQUFDLENBQUEsUUFBN0IsRUFBQyxJQUFDLENBQUEsY0FBQSxNQUFGLEVBQVUsSUFBQyxDQUFBLHFCQUFBO01BQ1gsSUFBQyxDQUFBLFdBQUQsR0FBZSxJQUFJO01BQ25CLElBQUMsQ0FBQSxXQUFXLENBQUMsR0FBYixDQUFpQixJQUFDLENBQUEsUUFBUSxDQUFDLFlBQVYsQ0FBdUIsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQWMsSUFBZCxDQUF2QixDQUFqQjtNQUNBLElBQUMsQ0FBQSxPQUFELEdBQVcsSUFBSTtNQUNmLElBQUMsQ0FBQSxRQUFELEdBQVk7TUFFWixJQUFDLENBQUEsV0FBRCxHQUFlLElBQUMsQ0FBQSxNQUFNLENBQUMsY0FBUixDQUFBO01BQ2YsaUJBQUEsR0FBb0I7UUFBQyxJQUFBLEVBQU0sV0FBUDtRQUFvQixDQUFB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QTtBQUFBLGFBQUEsd0NBQUE7O1VBQ0UsVUFBVSxDQUFDLGNBQVgsQ0FBQTtBQURGO2VBRUEsS0FkRjtPQUFBLE1BQUE7ZUFnQkUsTUFoQkY7O0lBbEJNOztnQ0F5Q1IsMkJBQUEsR0FBNkIsU0FBQyxNQUFELEVBQVMsU0FBVDtBQUMzQixVQUFBO01BQUEsS0FBQSxHQUFRLElBQUMsQ0FBQSxRQUFRLENBQUMsZUFBZSxDQUFDLG9CQUFvQixDQUFDLEdBQS9DLENBQW1ELFNBQW5ELENBQTZELENBQUM7QUFFdEUsV0FBQSx3Q0FBQTs7WUFBeUIsS0FBSyxDQUFDLGFBQU4sQ0FBb0IsS0FBcEI7QUFDdkIsaUJBQU87O0FBRFQ7TUFHQSxzQkFBQSxHQUF5QixNQUFNLENBQUMsTUFBUCxDQUFjLFNBQUMsS0FBRDtlQUFXLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBWixLQUFtQixLQUFLLENBQUM7TUFBcEMsQ0FBZDtNQUV6QixJQUFHLHNCQUFzQixDQUFDLE1BQTFCO0FBQ0UsYUFBQSwwREFBQTs7Y0FBeUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxhQUFaLENBQTBCLEtBQTFCO0FBQ3ZDLG1CQUFPOztBQURUO0FBRUEsZUFBTyxzQkFBdUIsQ0FBQSxDQUFBLEVBSGhDOztBQUtBLFdBQUEsMENBQUE7O1lBQXlCLEtBQUssQ0FBQyxLQUFLLENBQUMsYUFBWixDQUEwQixLQUExQjtBQUN2QixpQkFBTzs7QUFEVDthQUdBLE1BQU8sQ0FBQSxDQUFBO0lBaEJvQjs7Ozs7QUFuTC9CIiwic291cmNlc0NvbnRlbnQiOlsiXyA9IHJlcXVpcmUgJ3VuZGVyc2NvcmUtcGx1cydcbntFbWl0dGVyLCBDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2F0b20nXG5zd3JhcCA9IHJlcXVpcmUgJy4vc2VsZWN0aW9uLXdyYXBwZXInXG5cbntcbiAgc2hyaW5rUmFuZ2VFbmRUb0JlZm9yZU5ld0xpbmVcbiAgY29sbGVjdFJhbmdlSW5CdWZmZXJSb3dcbn0gPSByZXF1aXJlICcuL3V0aWxzJ1xuXG5pc0ludmFsaWRNYXJrZXIgPSAobWFya2VyKSAtPiBub3QgbWFya2VyLmlzVmFsaWQoKVxuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBPY2N1cnJlbmNlTWFuYWdlclxuICBwYXR0ZXJuczogbnVsbFxuICBtYXJrZXJPcHRpb25zOiB7aW52YWxpZGF0ZTogJ2luc2lkZSd9XG5cbiAgY29uc3RydWN0b3I6IChAdmltU3RhdGUpIC0+XG4gICAge0BlZGl0b3IsIEBlZGl0b3JFbGVtZW50fSA9IEB2aW1TdGF0ZVxuICAgIEBkaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG4gICAgQGRpc3Bvc2FibGVzLmFkZCBAdmltU3RhdGUub25EaWREZXN0cm95KEBkZXN0cm95LmJpbmQodGhpcykpXG4gICAgQGVtaXR0ZXIgPSBuZXcgRW1pdHRlclxuICAgIEBwYXR0ZXJucyA9IFtdXG5cbiAgICBAbWFya2VyTGF5ZXIgPSBAZWRpdG9yLmFkZE1hcmtlckxheWVyKClcbiAgICBkZWNvcmF0aW9uT3B0aW9ucyA9IHt0eXBlOiAnaGlnaGxpZ2h0JywgY2xhc3M6IFwidmltLW1vZGUtcGx1cy1vY2N1cnJlbmNlLWJhc2VcIn1cbiAgICBAZGVjb3JhdGlvbkxheWVyID0gQGVkaXRvci5kZWNvcmF0ZU1hcmtlckxheWVyKEBtYXJrZXJMYXllciwgZGVjb3JhdGlvbk9wdGlvbnMpXG5cbiAgICAjIEBwYXR0ZXJucyBpcyBzaW5nbGUgc291cmNlIG9mIHRydXRoIChTU09UKVxuICAgICMgQWxsIG1ha2VyIGNyZWF0ZS9kZXN0cm95L2Nzcy11cGRhdGUgaXMgZG9uZSBieSByZWFjdGluZyBAcGF0dGVycydzIGNoYW5nZS5cbiAgICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICBAb25EaWRDaGFuZ2VQYXR0ZXJucyAoe3BhdHRlcm4sIG9jY3VycmVuY2VUeXBlfSkgPT5cbiAgICAgIGlmIHBhdHRlcm5cbiAgICAgICAgQG1hcmtCdWZmZXJSYW5nZUJ5UGF0dGVybihwYXR0ZXJuLCBvY2N1cnJlbmNlVHlwZSlcbiAgICAgICAgQHVwZGF0ZUVkaXRvckVsZW1lbnQoKVxuICAgICAgZWxzZVxuICAgICAgICBAY2xlYXJNYXJrZXJzKClcblxuICAgIEBtYXJrZXJMYXllci5vbkRpZFVwZGF0ZShAZGVzdHJveUludmFsaWRNYXJrZXJzLmJpbmQodGhpcykpXG5cbiAgbWFya0J1ZmZlclJhbmdlQnlQYXR0ZXJuOiAocGF0dGVybiwgb2NjdXJyZW5jZVR5cGUpIC0+XG4gICAgaWYgb2NjdXJyZW5jZVR5cGUgaXMgJ3N1YndvcmQnXG4gICAgICBzdWJ3b3JkUmFuZ2VzQnlSb3cgPSB7fSAjIGNhY2hlXG4gICAgICBzdWJ3b3JkUGF0dGVybiA9IEBlZGl0b3IuZ2V0TGFzdEN1cnNvcigpLnN1YndvcmRSZWdFeHAoKVxuICAgICAgaXNTdWJ3b3JkUmFuZ2UgPSAocmFuZ2UpID0+XG4gICAgICAgIHJvdyA9IHJhbmdlLnN0YXJ0LnJvd1xuICAgICAgICBzdWJ3b3JkUmFuZ2VzID0gc3Vid29yZFJhbmdlc0J5Um93W3Jvd10gPz0gY29sbGVjdFJhbmdlSW5CdWZmZXJSb3coQGVkaXRvciwgcm93LCBzdWJ3b3JkUGF0dGVybilcbiAgICAgICAgc3Vid29yZFJhbmdlcy5zb21lIChzdWJ3b3JkUmFuZ2UpIC0+IHN1YndvcmRSYW5nZS5pc0VxdWFsKHJhbmdlKVxuXG4gICAgQGVkaXRvci5zY2FuIHBhdHRlcm4sICh7cmFuZ2UsIG1hdGNoVGV4dH0pID0+XG4gICAgICBpZiBvY2N1cnJlbmNlVHlwZSBpcyAnc3Vid29yZCdcbiAgICAgICAgcmV0dXJuIHVubGVzcyBpc1N1YndvcmRSYW5nZShyYW5nZSlcbiAgICAgIEBtYXJrZXJMYXllci5tYXJrQnVmZmVyUmFuZ2UocmFuZ2UsIEBtYXJrZXJPcHRpb25zKVxuXG4gIHVwZGF0ZUVkaXRvckVsZW1lbnQ6IC0+XG4gICAgQGVkaXRvckVsZW1lbnQuY2xhc3NMaXN0LnRvZ2dsZShcImhhcy1vY2N1cnJlbmNlXCIsIEBoYXNNYXJrZXJzKCkpXG5cbiAgIyBDYWxsYmFjayBnZXQgcGFzc2VkIGZvbGxvd2luZyBvYmplY3RcbiAgIyAtIHBhdHRlcm46IGNhbiBiZSB1bmRlZmluZWQgb24gcmVzZXQgZXZlbnRcbiAgb25EaWRDaGFuZ2VQYXR0ZXJuczogKGZuKSAtPlxuICAgIEBlbWl0dGVyLm9uKCdkaWQtY2hhbmdlLXBhdHRlcm5zJywgZm4pXG5cbiAgZGVzdHJveTogLT5cbiAgICBAZGVjb3JhdGlvbkxheWVyLmRlc3Ryb3koKVxuICAgIEBkaXNwb3NhYmxlcy5kaXNwb3NlKClcbiAgICBAbWFya2VyTGF5ZXIuZGVzdHJveSgpXG5cbiAgIyBQYXR0ZXJuc1xuICBoYXNQYXR0ZXJuczogLT5cbiAgICBAcGF0dGVybnMubGVuZ3RoID4gMFxuXG4gIHJlc2V0UGF0dGVybnM6IC0+XG4gICAgQHBhdHRlcm5zID0gW11cbiAgICBAZW1pdHRlci5lbWl0KCdkaWQtY2hhbmdlLXBhdHRlcm5zJywge30pXG5cbiAgYWRkUGF0dGVybjogKHBhdHRlcm49bnVsbCwge3Jlc2V0LCBvY2N1cnJlbmNlVHlwZX09e30pIC0+XG4gICAgQGNsZWFyTWFya2VycygpIGlmIHJlc2V0XG4gICAgQHBhdHRlcm5zLnB1c2gocGF0dGVybilcbiAgICBvY2N1cnJlbmNlVHlwZSA/PSAnYmFzZSdcbiAgICBAZW1pdHRlci5lbWl0KCdkaWQtY2hhbmdlLXBhdHRlcm5zJywge3BhdHRlcm4sIG9jY3VycmVuY2VUeXBlfSlcblxuICBzYXZlTGFzdFBhdHRlcm46IChvY2N1cnJlbmNlVHlwZT1udWxsKSAtPlxuICAgIEB2aW1TdGF0ZS5nbG9iYWxTdGF0ZS5zZXQoXCJsYXN0T2NjdXJyZW5jZVBhdHRlcm5cIiwgQGJ1aWxkUGF0dGVybigpKVxuICAgIEB2aW1TdGF0ZS5nbG9iYWxTdGF0ZS5zZXQoXCJsYXN0T2NjdXJyZW5jZVR5cGVcIiwgb2NjdXJyZW5jZVR5cGUpXG5cbiAgIyBSZXR1cm4gcmVnZXggcmVwcmVzZW50aW5nIGZpbmFsIHBhdHRlcm4uXG4gICMgVXNlZCB0byBjYWNoZSBmaW5hbCBwYXR0ZXJuIHRvIGVhY2ggaW5zdGFuY2Ugb2Ygb3BlcmF0b3Igc28gdGhhdCB3ZSBjYW5cbiAgIyByZXBlYXQgcmVjb3JkZWQgb3BlcmF0aW9uIGJ5IGAuYC5cbiAgIyBQYXR0ZXJuIGNhbiBiZSBhZGRlZCBpbnRlcmFjdGl2ZWx5IG9uZSBieSBvbmUsIGJ1dCB3ZSBzYXZlIGl0IGFzIHVuaW9uIHBhdHRlcm4uXG4gIGJ1aWxkUGF0dGVybjogLT5cbiAgICBzb3VyY2UgPSBAcGF0dGVybnMubWFwKChwYXR0ZXJuKSAtPiBwYXR0ZXJuLnNvdXJjZSkuam9pbignfCcpXG4gICAgbmV3IFJlZ0V4cChzb3VyY2UsICdnJylcblxuICAjIE1hcmtlcnNcbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIGNsZWFyTWFya2VyczogLT5cbiAgICBAbWFya2VyTGF5ZXIuY2xlYXIoKVxuICAgIEB1cGRhdGVFZGl0b3JFbGVtZW50KClcblxuICBkZXN0cm95TWFya2VyczogKG1hcmtlcnMpIC0+XG4gICAgbWFya2VyLmRlc3Ryb3koKSBmb3IgbWFya2VyIGluIG1hcmtlcnNcbiAgICAjIHdoZW5lcnZlciB3ZSBkZXN0cm95IG1hcmtlciwgd2Ugc2hvdWxkIHN5bmMgYGhhcy1vY2N1cnJlbmNlYCBzY29wZSBpbiBtYXJrZXIgc3RhdGUuLlxuICAgIEB1cGRhdGVFZGl0b3JFbGVtZW50KClcblxuICBkZXN0cm95SW52YWxpZE1hcmtlcnM6IC0+XG4gICAgQGRlc3Ryb3lNYXJrZXJzKEBnZXRNYXJrZXJzKCkuZmlsdGVyKGlzSW52YWxpZE1hcmtlcikpXG5cbiAgaGFzTWFya2VyczogLT5cbiAgICBAbWFya2VyTGF5ZXIuZ2V0TWFya2VyQ291bnQoKSA+IDBcblxuICBnZXRNYXJrZXJzOiAtPlxuICAgIEBtYXJrZXJMYXllci5nZXRNYXJrZXJzKClcblxuICBnZXRNYXJrZXJCdWZmZXJSYW5nZXM6IC0+XG4gICAgQG1hcmtlckxheWVyLmdldE1hcmtlcnMoKS5tYXAgKG1hcmtlcikgLT4gbWFya2VyLmdldEJ1ZmZlclJhbmdlKClcblxuICBnZXRNYXJrZXJDb3VudDogLT5cbiAgICBAbWFya2VyTGF5ZXIuZ2V0TWFya2VyQ291bnQoKVxuXG4gICMgUmV0dXJuIG9jY3VycmVuY2UgbWFya2VycyBpbnRlcnNlY3RpbmcgZ2l2ZW4gcmFuZ2VzXG4gIGdldE1hcmtlcnNJbnRlcnNlY3RzV2l0aFNlbGVjdGlvbjogKHNlbGVjdGlvbiwgZXhjbHVzaXZlPWZhbHNlKSAtPlxuICAgICMgZmluZG1hcmtlcnMoKSdzIGludGVyc2VjdHNCdWZmZXJSYW5nZSBwYXJhbSBoYXZlIG5vIGV4Y2x1c2l2ZSBjb250cm9sXG4gICAgIyBTbyBuZWVkIGV4dHJhIGNoZWNrIHRvIGZpbHRlciBvdXQgdW53YW50ZWQgbWFya2VyLlxuICAgICMgQnV0IGJhc2ljYWxseSBJIHNob3VsZCBwcmVmZXIgZmluZE1hcmtlciBzaW5jZSBJdCdzIGZhc3QgdGhhbiBpdGVyYXRpbmdcbiAgICAjIHdob2xlIG1hcmtlcnMgbWFudWFsbHkuXG4gICAgcmFuZ2UgPSBzaHJpbmtSYW5nZUVuZFRvQmVmb3JlTmV3TGluZShzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKSlcbiAgICBAbWFya2VyTGF5ZXIuZmluZE1hcmtlcnMoaW50ZXJzZWN0c0J1ZmZlclJhbmdlOiByYW5nZSkuZmlsdGVyIChtYXJrZXIpIC0+XG4gICAgICByYW5nZS5pbnRlcnNlY3RzV2l0aChtYXJrZXIuZ2V0QnVmZmVyUmFuZ2UoKSwgZXhjbHVzaXZlKVxuXG4gIGdldE1hcmtlckF0UG9pbnQ6IChwb2ludCkgLT5cbiAgICBAbWFya2VyTGF5ZXIuZmluZE1hcmtlcnMoY29udGFpbnNCdWZmZXJQb3NpdGlvbjogcG9pbnQpWzBdXG5cbiAgIyBTZWxlY3Qgb2NjdXJyZW5jZSBtYXJrZXIgYnVmZmVyUmFuZ2UgaW50ZXJzZWN0aW5nIGN1cnJlbnQgc2VsZWN0aW9ucy5cbiAgIyAtIFJldHVybjogdHJ1ZS9mYWxzZSB0byBpbmRpY2F0ZSBzdWNjZXNzIG9yIGZhaWxcbiAgI1xuICAjIERvIHNwZWNpYWwgaGFuZGxpbmcgZm9yIHdoaWNoIG9jY3VycmVuY2UgcmFuZ2UgYmVjb21lIGxhc3RTZWxlY3Rpb25cbiAgIyBlLmcuXG4gICMgIC0gYyhjaGFuZ2UpOiBTbyB0aGF0IGF1dG9jb21wbGV0ZStwb3B1cCBzaG93cyBhdCBvcmlnaW5hbCBjdXJzb3IgcG9zaXRpb24gb3IgbmVhci5cbiAgIyAgLSBnIFUodXBwZXItY2FzZSk6IFNvIHRoYXQgdW5kby9yZWRvIGNhbiByZXNwZWN0IGxhc3QgY3Vyc29yIHBvc2l0aW9uLlxuICBzZWxlY3Q6IC0+XG4gICAgaXNWaXN1YWxNb2RlID0gQHZpbVN0YXRlLm1vZGUgaXMgJ3Zpc3VhbCdcbiAgICBpbmRleEJ5T2xkU2VsZWN0aW9uID0gbmV3IE1hcFxuICAgIGFsbFJhbmdlcyA9IFtdXG4gICAgbWFya2Vyc1NlbGVjdGVkID0gW11cblxuICAgIGZvciBzZWxlY3Rpb24gaW4gQGVkaXRvci5nZXRTZWxlY3Rpb25zKCkgd2hlbiAobWFya2VycyA9IEBnZXRNYXJrZXJzSW50ZXJzZWN0c1dpdGhTZWxlY3Rpb24oc2VsZWN0aW9uLCBpc1Zpc3VhbE1vZGUpKS5sZW5ndGhcbiAgICAgIHJhbmdlcyA9IG1hcmtlcnMubWFwIChtYXJrZXIpIC0+IG1hcmtlci5nZXRCdWZmZXJSYW5nZSgpXG4gICAgICBtYXJrZXJzU2VsZWN0ZWQucHVzaChtYXJrZXJzLi4uKVxuICAgICAgIyBbSEFDS10gUGxhY2UgY2xvc2VzdCByYW5nZSB0byBsYXN0IHNvIHRoYXQgZmluYWwgbGFzdC1zZWxlY3Rpb24gYmVjb21lIGNsb3Nlc3Qgb25lLlxuICAgICAgIyBFLmcuXG4gICAgICAjIGBjIG8gZmAoY2hhbmdlIG9jY3VycmVuY2UgaW4gYS1mdW5jdGlvbikgc2hvdyBhdXRvY29tcGxldGUrIHBvcHVwIGF0IGNsb3Nlc3Qgb2NjdXJyZW5jZS4oIHBvcHVwIHNob3dzIGF0IGxhc3Qtc2VsZWN0aW9uIClcbiAgICAgIGNsb3Nlc3RSYW5nZSA9IEBnZXRDbG9zZXN0UmFuZ2VGb3JTZWxlY3Rpb24ocmFuZ2VzLCBzZWxlY3Rpb24pXG4gICAgICBfLnJlbW92ZShyYW5nZXMsIGNsb3Nlc3RSYW5nZSlcbiAgICAgIHJhbmdlcy5wdXNoKGNsb3Nlc3RSYW5nZSlcbiAgICAgIGFsbFJhbmdlcy5wdXNoKHJhbmdlcy4uLilcbiAgICAgIGluZGV4QnlPbGRTZWxlY3Rpb24uc2V0KHNlbGVjdGlvbiwgYWxsUmFuZ2VzLmluZGV4T2YoY2xvc2VzdFJhbmdlKSlcblxuICAgIGlmIGFsbFJhbmdlcy5sZW5ndGhcbiAgICAgIGlmIGlzVmlzdWFsTW9kZVxuICAgICAgICAjIFRvIGF2b2lkIHNlbGVjdGVkIG9jY3VycmVuY2UgcnVpbmVkIGJ5IG5vcm1hbGl6YXRpb24gd2hlbiBkaXNwb3NpbmcgY3VycmVudCBzdWJtb2RlIHRvIHNoaWZ0IHRvIG5ldyBzdWJtb2RlLlxuICAgICAgICBAdmltU3RhdGUubW9kZU1hbmFnZXIuZGVhY3RpdmF0ZSgpXG4gICAgICAgIEB2aW1TdGF0ZS5zdWJtb2RlID0gbnVsbFxuXG4gICAgICBAZWRpdG9yLnNldFNlbGVjdGVkQnVmZmVyUmFuZ2VzKGFsbFJhbmdlcylcbiAgICAgIHNlbGVjdGlvbnMgPSBAZWRpdG9yLmdldFNlbGVjdGlvbnMoKVxuICAgICAgaW5kZXhCeU9sZFNlbGVjdGlvbi5mb3JFYWNoIChpbmRleCwgc2VsZWN0aW9uKSA9PlxuICAgICAgICBAdmltU3RhdGUubXV0YXRpb25NYW5hZ2VyLm1pZ3JhdGVNdXRhdGlvbihzZWxlY3Rpb24sIHNlbGVjdGlvbnNbaW5kZXhdKVxuXG4gICAgICBAZGVzdHJveU1hcmtlcnMobWFya2Vyc1NlbGVjdGVkKVxuICAgICAgZm9yICRzZWxlY3Rpb24gaW4gc3dyYXAuZ2V0U2VsZWN0aW9ucyhAZWRpdG9yKVxuICAgICAgICAkc2VsZWN0aW9uLnNhdmVQcm9wZXJ0aWVzKClcbiAgICAgIHRydWVcbiAgICBlbHNlXG4gICAgICBmYWxzZVxuXG4gICMgV2hpY2ggb2NjdXJyZW5jZSBiZWNvbWUgbGFzdFNlbGVjdGlvbiBpcyBkZXRlcm1pbmVkIGJ5IGZvbGxvd2luZyBvcmRlclxuICAjICAxLiBPY2N1cnJlbmNlIHVuZGVyIG9yaWdpbmFsIGN1cnNvciBwb3NpdGlvblxuICAjICAyLiBmb3J3YXJkaW5nIGluIHNhbWUgcm93XG4gICMgIDMuIGZpcnN0IG9jY3VycmVuY2UgaW4gc2FtZSByb3dcbiAgIyAgNC4gZm9yd2FyZGluZyAod3JhcC1lbmQpXG4gIGdldENsb3Nlc3RSYW5nZUZvclNlbGVjdGlvbjogKHJhbmdlcywgc2VsZWN0aW9uKSAtPlxuICAgIHBvaW50ID0gQHZpbVN0YXRlLm11dGF0aW9uTWFuYWdlci5tdXRhdGlvbnNCeVNlbGVjdGlvbi5nZXQoc2VsZWN0aW9uKS5pbml0aWFsUG9pbnRcblxuICAgIGZvciByYW5nZSBpbiByYW5nZXMgd2hlbiByYW5nZS5jb250YWluc1BvaW50KHBvaW50KVxuICAgICAgcmV0dXJuIHJhbmdlXG5cbiAgICByYW5nZXNTdGFydEZyb21TYW1lUm93ID0gcmFuZ2VzLmZpbHRlcigocmFuZ2UpIC0+IHJhbmdlLnN0YXJ0LnJvdyBpcyBwb2ludC5yb3cpXG5cbiAgICBpZiByYW5nZXNTdGFydEZyb21TYW1lUm93Lmxlbmd0aFxuICAgICAgZm9yIHJhbmdlIGluIHJhbmdlc1N0YXJ0RnJvbVNhbWVSb3cgd2hlbiByYW5nZS5zdGFydC5pc0dyZWF0ZXJUaGFuKHBvaW50KVxuICAgICAgICByZXR1cm4gcmFuZ2UgIyBGb3J3YXJkaW5nXG4gICAgICByZXR1cm4gcmFuZ2VzU3RhcnRGcm9tU2FtZVJvd1swXVxuXG4gICAgZm9yIHJhbmdlIGluIHJhbmdlcyB3aGVuIHJhbmdlLnN0YXJ0LmlzR3JlYXRlclRoYW4ocG9pbnQpICAjIEZvcndhcmRpbmdcbiAgICAgIHJldHVybiByYW5nZVxuXG4gICAgcmFuZ2VzWzBdICMgcmV0dXJuIGZpcnN0IGFzIGZhbGxiYWNrXG4iXX0=
