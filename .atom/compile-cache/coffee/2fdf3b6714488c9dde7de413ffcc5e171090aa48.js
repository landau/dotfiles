(function() {
  var CompositeDisposable, Emitter, OccurrenceManager, _, collectRangeInBufferRow, isInvalidMarker, ref, ref1, shrinkRangeEndToBeforeNewLine;

  _ = require('underscore-plus');

  ref = require('atom'), Emitter = ref.Emitter, CompositeDisposable = ref.CompositeDisposable;

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
      ref2 = this.vimState, this.editor = ref2.editor, this.editorElement = ref2.editorElement, this.swrap = ref2.swrap;
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
        ref3 = this.swrap.getSelections(this.editor);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvb2NjdXJyZW5jZS1tYW5hZ2VyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUjs7RUFDSixNQUFpQyxPQUFBLENBQVEsTUFBUixDQUFqQyxFQUFDLHFCQUFELEVBQVU7O0VBQ1YsT0FHSSxPQUFBLENBQVEsU0FBUixDQUhKLEVBQ0Usa0VBREYsRUFFRTs7RUFHRixlQUFBLEdBQWtCLFNBQUMsTUFBRDtXQUFZLENBQUksTUFBTSxDQUFDLE9BQVAsQ0FBQTtFQUFoQjs7RUFFbEIsTUFBTSxDQUFDLE9BQVAsR0FDTTtnQ0FDSixRQUFBLEdBQVU7O2dDQUNWLGFBQUEsR0FBZTtNQUFDLFVBQUEsRUFBWSxRQUFiOzs7SUFFRiwyQkFBQyxRQUFEO0FBQ1gsVUFBQTtNQURZLElBQUMsQ0FBQSxXQUFEO01BQ1osT0FBb0MsSUFBQyxDQUFBLFFBQXJDLEVBQUMsSUFBQyxDQUFBLGNBQUEsTUFBRixFQUFVLElBQUMsQ0FBQSxxQkFBQSxhQUFYLEVBQTBCLElBQUMsQ0FBQSxhQUFBO01BQzNCLElBQUMsQ0FBQSxXQUFELEdBQWUsSUFBSTtNQUNuQixJQUFDLENBQUEsV0FBVyxDQUFDLEdBQWIsQ0FBaUIsSUFBQyxDQUFBLFFBQVEsQ0FBQyxZQUFWLENBQXVCLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFjLElBQWQsQ0FBdkIsQ0FBakI7TUFDQSxJQUFDLENBQUEsT0FBRCxHQUFXLElBQUk7TUFDZixJQUFDLENBQUEsUUFBRCxHQUFZO01BRVosSUFBQyxDQUFBLFdBQUQsR0FBZSxJQUFDLENBQUEsTUFBTSxDQUFDLGNBQVIsQ0FBQTtNQUNmLGlCQUFBLEdBQW9CO1FBQUMsSUFBQSxFQUFNLFdBQVA7UUFBb0IsQ0FBQSxLQUFB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RUFBcUQsVUFBVyxDQUFBLEtBQUEsQ0FBaEU7VUFEMEI7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTVCO1FBR0EsSUFBQyxDQUFBLGNBQUQsQ0FBZ0IsZUFBaEI7QUFDQTtBQUFBLGFBQUEsd0NBQUE7O1VBQ0UsVUFBVSxDQUFDLGNBQVgsQ0FBQTtBQURGO2VBRUEsS0FkRjtPQUFBLE1BQUE7ZUFnQkUsTUFoQkY7O0lBbEJNOztnQ0F5Q1IsMkJBQUEsR0FBNkIsU0FBQyxNQUFELEVBQVMsU0FBVDtBQUMzQixVQUFBO01BQUEsS0FBQSxHQUFRLElBQUMsQ0FBQSxRQUFRLENBQUMsZUFBZSxDQUFDLG9CQUFvQixDQUFDLEdBQS9DLENBQW1ELFNBQW5ELENBQTZELENBQUM7QUFFdEUsV0FBQSx3Q0FBQTs7WUFBeUIsS0FBSyxDQUFDLGFBQU4sQ0FBb0IsS0FBcEI7QUFDdkIsaUJBQU87O0FBRFQ7TUFHQSxzQkFBQSxHQUF5QixNQUFNLENBQUMsTUFBUCxDQUFjLFNBQUMsS0FBRDtlQUFXLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBWixLQUFtQixLQUFLLENBQUM7TUFBcEMsQ0FBZDtNQUV6QixJQUFHLHNCQUFzQixDQUFDLE1BQTFCO0FBQ0UsYUFBQSwwREFBQTs7Y0FBeUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxhQUFaLENBQTBCLEtBQTFCO0FBQ3ZDLG1CQUFPOztBQURUO0FBRUEsZUFBTyxzQkFBdUIsQ0FBQSxDQUFBLEVBSGhDOztBQUtBLFdBQUEsMENBQUE7O1lBQXlCLEtBQUssQ0FBQyxLQUFLLENBQUMsYUFBWixDQUEwQixLQUExQjtBQUN2QixpQkFBTzs7QUFEVDthQUdBLE1BQU8sQ0FBQSxDQUFBO0lBaEJvQjs7Ozs7QUF0TC9CIiwic291cmNlc0NvbnRlbnQiOlsiXyA9IHJlcXVpcmUgJ3VuZGVyc2NvcmUtcGx1cydcbntFbWl0dGVyLCBDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2F0b20nXG57XG4gIHNocmlua1JhbmdlRW5kVG9CZWZvcmVOZXdMaW5lXG4gIGNvbGxlY3RSYW5nZUluQnVmZmVyUm93XG59ID0gcmVxdWlyZSAnLi91dGlscydcblxuaXNJbnZhbGlkTWFya2VyID0gKG1hcmtlcikgLT4gbm90IG1hcmtlci5pc1ZhbGlkKClcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgT2NjdXJyZW5jZU1hbmFnZXJcbiAgcGF0dGVybnM6IG51bGxcbiAgbWFya2VyT3B0aW9uczoge2ludmFsaWRhdGU6ICdpbnNpZGUnfVxuXG4gIGNvbnN0cnVjdG9yOiAoQHZpbVN0YXRlKSAtPlxuICAgIHtAZWRpdG9yLCBAZWRpdG9yRWxlbWVudCwgQHN3cmFwfSA9IEB2aW1TdGF0ZVxuICAgIEBkaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG4gICAgQGRpc3Bvc2FibGVzLmFkZCBAdmltU3RhdGUub25EaWREZXN0cm95KEBkZXN0cm95LmJpbmQodGhpcykpXG4gICAgQGVtaXR0ZXIgPSBuZXcgRW1pdHRlclxuICAgIEBwYXR0ZXJucyA9IFtdXG5cbiAgICBAbWFya2VyTGF5ZXIgPSBAZWRpdG9yLmFkZE1hcmtlckxheWVyKClcbiAgICBkZWNvcmF0aW9uT3B0aW9ucyA9IHt0eXBlOiAnaGlnaGxpZ2h0JywgY2xhc3M6IFwidmltLW1vZGUtcGx1cy1vY2N1cnJlbmNlLWJhc2VcIn1cbiAgICBAZGVjb3JhdGlvbkxheWVyID0gQGVkaXRvci5kZWNvcmF0ZU1hcmtlckxheWVyKEBtYXJrZXJMYXllciwgZGVjb3JhdGlvbk9wdGlvbnMpXG5cbiAgICAjIEBwYXR0ZXJucyBpcyBzaW5nbGUgc291cmNlIG9mIHRydXRoIChTU09UKVxuICAgICMgQWxsIG1ha2VyIGNyZWF0ZS9kZXN0cm95L2Nzcy11cGRhdGUgaXMgZG9uZSBieSByZWFjdGluZyBAcGF0dGVycydzIGNoYW5nZS5cbiAgICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICBAb25EaWRDaGFuZ2VQYXR0ZXJucyAoe3BhdHRlcm4sIG9jY3VycmVuY2VUeXBlfSkgPT5cbiAgICAgIGlmIHBhdHRlcm5cbiAgICAgICAgQG1hcmtCdWZmZXJSYW5nZUJ5UGF0dGVybihwYXR0ZXJuLCBvY2N1cnJlbmNlVHlwZSlcbiAgICAgICAgQHVwZGF0ZUVkaXRvckVsZW1lbnQoKVxuICAgICAgZWxzZVxuICAgICAgICBAY2xlYXJNYXJrZXJzKClcblxuICAgIEBtYXJrZXJMYXllci5vbkRpZFVwZGF0ZShAZGVzdHJveUludmFsaWRNYXJrZXJzLmJpbmQodGhpcykpXG5cbiAgbWFya0J1ZmZlclJhbmdlQnlQYXR0ZXJuOiAocGF0dGVybiwgb2NjdXJyZW5jZVR5cGUpIC0+XG4gICAgaWYgb2NjdXJyZW5jZVR5cGUgaXMgJ3N1YndvcmQnXG4gICAgICBzdWJ3b3JkUmFuZ2VzQnlSb3cgPSB7fSAjIGNhY2hlXG4gICAgICBzdWJ3b3JkUGF0dGVybiA9IEBlZGl0b3IuZ2V0TGFzdEN1cnNvcigpLnN1YndvcmRSZWdFeHAoKVxuICAgICAgaXNTdWJ3b3JkUmFuZ2UgPSAocmFuZ2UpID0+XG4gICAgICAgIHJvdyA9IHJhbmdlLnN0YXJ0LnJvd1xuICAgICAgICBzdWJ3b3JkUmFuZ2VzID0gc3Vid29yZFJhbmdlc0J5Um93W3Jvd10gPz0gY29sbGVjdFJhbmdlSW5CdWZmZXJSb3coQGVkaXRvciwgcm93LCBzdWJ3b3JkUGF0dGVybilcbiAgICAgICAgc3Vid29yZFJhbmdlcy5zb21lIChzdWJ3b3JkUmFuZ2UpIC0+IHN1YndvcmRSYW5nZS5pc0VxdWFsKHJhbmdlKVxuXG4gICAgQGVkaXRvci5zY2FuIHBhdHRlcm4sICh7cmFuZ2UsIG1hdGNoVGV4dH0pID0+XG4gICAgICBpZiBvY2N1cnJlbmNlVHlwZSBpcyAnc3Vid29yZCdcbiAgICAgICAgcmV0dXJuIHVubGVzcyBpc1N1YndvcmRSYW5nZShyYW5nZSlcbiAgICAgIEBtYXJrZXJMYXllci5tYXJrQnVmZmVyUmFuZ2UocmFuZ2UsIEBtYXJrZXJPcHRpb25zKVxuXG4gIHVwZGF0ZUVkaXRvckVsZW1lbnQ6IC0+XG4gICAgQGVkaXRvckVsZW1lbnQuY2xhc3NMaXN0LnRvZ2dsZShcImhhcy1vY2N1cnJlbmNlXCIsIEBoYXNNYXJrZXJzKCkpXG5cbiAgIyBDYWxsYmFjayBnZXQgcGFzc2VkIGZvbGxvd2luZyBvYmplY3RcbiAgIyAtIHBhdHRlcm46IGNhbiBiZSB1bmRlZmluZWQgb24gcmVzZXQgZXZlbnRcbiAgb25EaWRDaGFuZ2VQYXR0ZXJuczogKGZuKSAtPlxuICAgIEBlbWl0dGVyLm9uKCdkaWQtY2hhbmdlLXBhdHRlcm5zJywgZm4pXG5cbiAgZGVzdHJveTogLT5cbiAgICBAZGVjb3JhdGlvbkxheWVyLmRlc3Ryb3koKVxuICAgIEBkaXNwb3NhYmxlcy5kaXNwb3NlKClcbiAgICBAbWFya2VyTGF5ZXIuZGVzdHJveSgpXG5cbiAgIyBQYXR0ZXJuc1xuICBoYXNQYXR0ZXJuczogLT5cbiAgICBAcGF0dGVybnMubGVuZ3RoID4gMFxuXG4gIHJlc2V0UGF0dGVybnM6IC0+XG4gICAgQHBhdHRlcm5zID0gW11cbiAgICBAZW1pdHRlci5lbWl0KCdkaWQtY2hhbmdlLXBhdHRlcm5zJywge30pXG5cbiAgYWRkUGF0dGVybjogKHBhdHRlcm49bnVsbCwge3Jlc2V0LCBvY2N1cnJlbmNlVHlwZX09e30pIC0+XG4gICAgQGNsZWFyTWFya2VycygpIGlmIHJlc2V0XG4gICAgQHBhdHRlcm5zLnB1c2gocGF0dGVybilcbiAgICBvY2N1cnJlbmNlVHlwZSA/PSAnYmFzZSdcbiAgICBAZW1pdHRlci5lbWl0KCdkaWQtY2hhbmdlLXBhdHRlcm5zJywge3BhdHRlcm4sIG9jY3VycmVuY2VUeXBlfSlcblxuICBzYXZlTGFzdFBhdHRlcm46IChvY2N1cnJlbmNlVHlwZT1udWxsKSAtPlxuICAgIEB2aW1TdGF0ZS5nbG9iYWxTdGF0ZS5zZXQoXCJsYXN0T2NjdXJyZW5jZVBhdHRlcm5cIiwgQGJ1aWxkUGF0dGVybigpKVxuICAgIEB2aW1TdGF0ZS5nbG9iYWxTdGF0ZS5zZXQoXCJsYXN0T2NjdXJyZW5jZVR5cGVcIiwgb2NjdXJyZW5jZVR5cGUpXG5cbiAgIyBSZXR1cm4gcmVnZXggcmVwcmVzZW50aW5nIGZpbmFsIHBhdHRlcm4uXG4gICMgVXNlZCB0byBjYWNoZSBmaW5hbCBwYXR0ZXJuIHRvIGVhY2ggaW5zdGFuY2Ugb2Ygb3BlcmF0b3Igc28gdGhhdCB3ZSBjYW5cbiAgIyByZXBlYXQgcmVjb3JkZWQgb3BlcmF0aW9uIGJ5IGAuYC5cbiAgIyBQYXR0ZXJuIGNhbiBiZSBhZGRlZCBpbnRlcmFjdGl2ZWx5IG9uZSBieSBvbmUsIGJ1dCB3ZSBzYXZlIGl0IGFzIHVuaW9uIHBhdHRlcm4uXG4gIGJ1aWxkUGF0dGVybjogLT5cbiAgICBzb3VyY2UgPSBAcGF0dGVybnMubWFwKChwYXR0ZXJuKSAtPiBwYXR0ZXJuLnNvdXJjZSkuam9pbignfCcpXG4gICAgbmV3IFJlZ0V4cChzb3VyY2UsICdnJylcblxuICAjIE1hcmtlcnNcbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIGNsZWFyTWFya2VyczogLT5cbiAgICBAbWFya2VyTGF5ZXIuY2xlYXIoKVxuICAgIEB1cGRhdGVFZGl0b3JFbGVtZW50KClcblxuICBkZXN0cm95TWFya2VyczogKG1hcmtlcnMpIC0+XG4gICAgbWFya2VyLmRlc3Ryb3koKSBmb3IgbWFya2VyIGluIG1hcmtlcnNcbiAgICAjIHdoZW5lcnZlciB3ZSBkZXN0cm95IG1hcmtlciwgd2Ugc2hvdWxkIHN5bmMgYGhhcy1vY2N1cnJlbmNlYCBzY29wZSBpbiBtYXJrZXIgc3RhdGUuLlxuICAgIEB1cGRhdGVFZGl0b3JFbGVtZW50KClcblxuICBkZXN0cm95SW52YWxpZE1hcmtlcnM6IC0+XG4gICAgQGRlc3Ryb3lNYXJrZXJzKEBnZXRNYXJrZXJzKCkuZmlsdGVyKGlzSW52YWxpZE1hcmtlcikpXG5cbiAgaGFzTWFya2VyczogLT5cbiAgICBAbWFya2VyTGF5ZXIuZ2V0TWFya2VyQ291bnQoKSA+IDBcblxuICBnZXRNYXJrZXJzOiAtPlxuICAgIEBtYXJrZXJMYXllci5nZXRNYXJrZXJzKClcblxuICBnZXRNYXJrZXJCdWZmZXJSYW5nZXM6IC0+XG4gICAgQG1hcmtlckxheWVyLmdldE1hcmtlcnMoKS5tYXAgKG1hcmtlcikgLT4gbWFya2VyLmdldEJ1ZmZlclJhbmdlKClcblxuICBnZXRNYXJrZXJDb3VudDogLT5cbiAgICBAbWFya2VyTGF5ZXIuZ2V0TWFya2VyQ291bnQoKVxuXG4gICMgUmV0dXJuIG9jY3VycmVuY2UgbWFya2VycyBpbnRlcnNlY3RpbmcgZ2l2ZW4gcmFuZ2VzXG4gIGdldE1hcmtlcnNJbnRlcnNlY3RzV2l0aFNlbGVjdGlvbjogKHNlbGVjdGlvbiwgZXhjbHVzaXZlPWZhbHNlKSAtPlxuICAgICMgZmluZG1hcmtlcnMoKSdzIGludGVyc2VjdHNCdWZmZXJSYW5nZSBwYXJhbSBoYXZlIG5vIGV4Y2x1c2l2ZSBjb250cm9sXG4gICAgIyBTbyBuZWVkIGV4dHJhIGNoZWNrIHRvIGZpbHRlciBvdXQgdW53YW50ZWQgbWFya2VyLlxuICAgICMgQnV0IGJhc2ljYWxseSBJIHNob3VsZCBwcmVmZXIgZmluZE1hcmtlciBzaW5jZSBJdCdzIGZhc3QgdGhhbiBpdGVyYXRpbmdcbiAgICAjIHdob2xlIG1hcmtlcnMgbWFudWFsbHkuXG4gICAgcmFuZ2UgPSBzaHJpbmtSYW5nZUVuZFRvQmVmb3JlTmV3TGluZShzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKSlcbiAgICBAbWFya2VyTGF5ZXIuZmluZE1hcmtlcnMoaW50ZXJzZWN0c0J1ZmZlclJhbmdlOiByYW5nZSkuZmlsdGVyIChtYXJrZXIpIC0+XG4gICAgICByYW5nZS5pbnRlcnNlY3RzV2l0aChtYXJrZXIuZ2V0QnVmZmVyUmFuZ2UoKSwgZXhjbHVzaXZlKVxuXG4gIGdldE1hcmtlckF0UG9pbnQ6IChwb2ludCkgLT5cbiAgICBtYXJrZXJzID0gQG1hcmtlckxheWVyLmZpbmRNYXJrZXJzKGNvbnRhaW5zQnVmZmVyUG9zaXRpb246IHBvaW50KVxuICAgICMgV2UgaGF2ZSB0byBjaGVjayBhbGwgcmV0dXJuZWQgbWFya2VyIHVudGlsIGZvdW5kLCBzaW5jZSB3ZSBkbyBhZGl0aW9uYWwgbWFya2VyIHZhbGlkYXRpb24uXG4gICAgIyBlLmcuIEZvciB0ZXh0IGBhYmMoKWAsIG1hcmsgZm9yIGBhYmNgIGFuZCBgKGAuIGN1cnNvciBvbiBgKGAgY2hhciByZXR1cm4gbXVsdGlwbGUgbWFya2VyXG4gICAgIyBhbmQgd2UgcGljayBgKGAgYnkgaXNHcmVhdGVyVGhhbiBjaGVjay5cbiAgICBmb3IgbWFya2VyIGluIG1hcmtlcnMgd2hlbiBtYXJrZXIuZ2V0QnVmZmVyUmFuZ2UoKS5lbmQuaXNHcmVhdGVyVGhhbihwb2ludClcbiAgICAgIHJldHVybiBtYXJrZXJcblxuICAjIFNlbGVjdCBvY2N1cnJlbmNlIG1hcmtlciBidWZmZXJSYW5nZSBpbnRlcnNlY3RpbmcgY3VycmVudCBzZWxlY3Rpb25zLlxuICAjIC0gUmV0dXJuOiB0cnVlL2ZhbHNlIHRvIGluZGljYXRlIHN1Y2Nlc3Mgb3IgZmFpbFxuICAjXG4gICMgRG8gc3BlY2lhbCBoYW5kbGluZyBmb3Igd2hpY2ggb2NjdXJyZW5jZSByYW5nZSBiZWNvbWUgbGFzdFNlbGVjdGlvblxuICAjIGUuZy5cbiAgIyAgLSBjKGNoYW5nZSk6IFNvIHRoYXQgYXV0b2NvbXBsZXRlK3BvcHVwIHNob3dzIGF0IG9yaWdpbmFsIGN1cnNvciBwb3NpdGlvbiBvciBuZWFyLlxuICAjICAtIGcgVSh1cHBlci1jYXNlKTogU28gdGhhdCB1bmRvL3JlZG8gY2FuIHJlc3BlY3QgbGFzdCBjdXJzb3IgcG9zaXRpb24uXG4gIHNlbGVjdDogLT5cbiAgICBpc1Zpc3VhbE1vZGUgPSBAdmltU3RhdGUubW9kZSBpcyAndmlzdWFsJ1xuICAgIGluZGV4QnlPbGRTZWxlY3Rpb24gPSBuZXcgTWFwXG4gICAgYWxsUmFuZ2VzID0gW11cbiAgICBtYXJrZXJzU2VsZWN0ZWQgPSBbXVxuXG4gICAgZm9yIHNlbGVjdGlvbiBpbiBAZWRpdG9yLmdldFNlbGVjdGlvbnMoKSB3aGVuIChtYXJrZXJzID0gQGdldE1hcmtlcnNJbnRlcnNlY3RzV2l0aFNlbGVjdGlvbihzZWxlY3Rpb24sIGlzVmlzdWFsTW9kZSkpLmxlbmd0aFxuICAgICAgcmFuZ2VzID0gbWFya2Vycy5tYXAgKG1hcmtlcikgLT4gbWFya2VyLmdldEJ1ZmZlclJhbmdlKClcbiAgICAgIG1hcmtlcnNTZWxlY3RlZC5wdXNoKG1hcmtlcnMuLi4pXG4gICAgICAjIFtIQUNLXSBQbGFjZSBjbG9zZXN0IHJhbmdlIHRvIGxhc3Qgc28gdGhhdCBmaW5hbCBsYXN0LXNlbGVjdGlvbiBiZWNvbWUgY2xvc2VzdCBvbmUuXG4gICAgICAjIEUuZy5cbiAgICAgICMgYGMgbyBmYChjaGFuZ2Ugb2NjdXJyZW5jZSBpbiBhLWZ1bmN0aW9uKSBzaG93IGF1dG9jb21wbGV0ZSsgcG9wdXAgYXQgY2xvc2VzdCBvY2N1cnJlbmNlLiggcG9wdXAgc2hvd3MgYXQgbGFzdC1zZWxlY3Rpb24gKVxuICAgICAgY2xvc2VzdFJhbmdlID0gQGdldENsb3Nlc3RSYW5nZUZvclNlbGVjdGlvbihyYW5nZXMsIHNlbGVjdGlvbilcbiAgICAgIF8ucmVtb3ZlKHJhbmdlcywgY2xvc2VzdFJhbmdlKVxuICAgICAgcmFuZ2VzLnB1c2goY2xvc2VzdFJhbmdlKVxuICAgICAgYWxsUmFuZ2VzLnB1c2gocmFuZ2VzLi4uKVxuICAgICAgaW5kZXhCeU9sZFNlbGVjdGlvbi5zZXQoc2VsZWN0aW9uLCBhbGxSYW5nZXMuaW5kZXhPZihjbG9zZXN0UmFuZ2UpKVxuXG4gICAgaWYgYWxsUmFuZ2VzLmxlbmd0aFxuICAgICAgaWYgaXNWaXN1YWxNb2RlXG4gICAgICAgICMgVG8gYXZvaWQgc2VsZWN0ZWQgb2NjdXJyZW5jZSBydWluZWQgYnkgbm9ybWFsaXphdGlvbiB3aGVuIGRpc3Bvc2luZyBjdXJyZW50IHN1Ym1vZGUgdG8gc2hpZnQgdG8gbmV3IHN1Ym1vZGUuXG4gICAgICAgIEB2aW1TdGF0ZS5tb2RlTWFuYWdlci5kZWFjdGl2YXRlKClcbiAgICAgICAgQHZpbVN0YXRlLnN1Ym1vZGUgPSBudWxsXG5cbiAgICAgIEBlZGl0b3Iuc2V0U2VsZWN0ZWRCdWZmZXJSYW5nZXMoYWxsUmFuZ2VzKVxuICAgICAgc2VsZWN0aW9ucyA9IEBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpXG4gICAgICBpbmRleEJ5T2xkU2VsZWN0aW9uLmZvckVhY2ggKGluZGV4LCBzZWxlY3Rpb24pID0+XG4gICAgICAgIEB2aW1TdGF0ZS5tdXRhdGlvbk1hbmFnZXIubWlncmF0ZU11dGF0aW9uKHNlbGVjdGlvbiwgc2VsZWN0aW9uc1tpbmRleF0pXG5cbiAgICAgIEBkZXN0cm95TWFya2VycyhtYXJrZXJzU2VsZWN0ZWQpXG4gICAgICBmb3IgJHNlbGVjdGlvbiBpbiBAc3dyYXAuZ2V0U2VsZWN0aW9ucyhAZWRpdG9yKVxuICAgICAgICAkc2VsZWN0aW9uLnNhdmVQcm9wZXJ0aWVzKClcbiAgICAgIHRydWVcbiAgICBlbHNlXG4gICAgICBmYWxzZVxuXG4gICMgV2hpY2ggb2NjdXJyZW5jZSBiZWNvbWUgbGFzdFNlbGVjdGlvbiBpcyBkZXRlcm1pbmVkIGJ5IGZvbGxvd2luZyBvcmRlclxuICAjICAxLiBPY2N1cnJlbmNlIHVuZGVyIG9yaWdpbmFsIGN1cnNvciBwb3NpdGlvblxuICAjICAyLiBmb3J3YXJkaW5nIGluIHNhbWUgcm93XG4gICMgIDMuIGZpcnN0IG9jY3VycmVuY2UgaW4gc2FtZSByb3dcbiAgIyAgNC4gZm9yd2FyZGluZyAod3JhcC1lbmQpXG4gIGdldENsb3Nlc3RSYW5nZUZvclNlbGVjdGlvbjogKHJhbmdlcywgc2VsZWN0aW9uKSAtPlxuICAgIHBvaW50ID0gQHZpbVN0YXRlLm11dGF0aW9uTWFuYWdlci5tdXRhdGlvbnNCeVNlbGVjdGlvbi5nZXQoc2VsZWN0aW9uKS5pbml0aWFsUG9pbnRcblxuICAgIGZvciByYW5nZSBpbiByYW5nZXMgd2hlbiByYW5nZS5jb250YWluc1BvaW50KHBvaW50KVxuICAgICAgcmV0dXJuIHJhbmdlXG5cbiAgICByYW5nZXNTdGFydEZyb21TYW1lUm93ID0gcmFuZ2VzLmZpbHRlcigocmFuZ2UpIC0+IHJhbmdlLnN0YXJ0LnJvdyBpcyBwb2ludC5yb3cpXG5cbiAgICBpZiByYW5nZXNTdGFydEZyb21TYW1lUm93Lmxlbmd0aFxuICAgICAgZm9yIHJhbmdlIGluIHJhbmdlc1N0YXJ0RnJvbVNhbWVSb3cgd2hlbiByYW5nZS5zdGFydC5pc0dyZWF0ZXJUaGFuKHBvaW50KVxuICAgICAgICByZXR1cm4gcmFuZ2UgIyBGb3J3YXJkaW5nXG4gICAgICByZXR1cm4gcmFuZ2VzU3RhcnRGcm9tU2FtZVJvd1swXVxuXG4gICAgZm9yIHJhbmdlIGluIHJhbmdlcyB3aGVuIHJhbmdlLnN0YXJ0LmlzR3JlYXRlclRoYW4ocG9pbnQpICAjIEZvcndhcmRpbmdcbiAgICAgIHJldHVybiByYW5nZVxuXG4gICAgcmFuZ2VzWzBdICMgcmV0dXJuIGZpcnN0IGFzIGZhbGxiYWNrXG4iXX0=
