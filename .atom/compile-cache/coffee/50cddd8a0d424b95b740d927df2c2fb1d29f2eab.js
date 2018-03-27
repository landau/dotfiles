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

    OccurrenceManager.prototype.saveLastPattern = function() {
      return this.vimState.globalState.set("lastOccurrencePattern", this.buildPattern());
    };

    OccurrenceManager.prototype.buildPattern = function() {
      var source;
      source = this.patterns.map(function(pattern) {
        return pattern.source;
      }).join('|');
      return new RegExp(source, 'g');
    };

    OccurrenceManager.prototype.clearMarkers = function() {
      return this.destroyMarkers(this.getMarkers());
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

    OccurrenceManager.prototype.getMarkersIntersectsWithRanges = function(ranges, exclusive) {
      var i, len, markers, range, results;
      if (exclusive == null) {
        exclusive = false;
      }
      ranges = ranges.map(function(range) {
        return shrinkRangeEndToBeforeNewLine(range);
      });
      results = [];
      for (i = 0, len = ranges.length; i < len; i++) {
        range = ranges[i];
        markers = this.markerLayer.findMarkers({
          intersectsBufferRange: range
        }).filter(function(marker) {
          return range.intersectsWith(marker.getBufferRange(), exclusive);
        });
        results.push.apply(results, markers);
      }
      return results;
    };

    OccurrenceManager.prototype.getMarkerAtPoint = function(point) {
      return this.markerLayer.findMarkers({
        containsBufferPosition: point
      })[0];
    };

    OccurrenceManager.prototype.select = function() {
      var isVisualMode, markers, range, ranges;
      isVisualMode = this.vimState.mode === 'visual';
      markers = this.getMarkersIntersectsWithRanges(this.editor.getSelectedBufferRanges(), isVisualMode);
      if (markers.length) {
        ranges = markers.map(function(marker) {
          return marker.getBufferRange();
        });
        this.destroyMarkers(markers);
        if (isVisualMode) {
          this.vimState.modeManager.deactivate();
          this.vimState.submode = null;
        }
        range = this.getRangeForLastSelection(ranges);
        _.remove(ranges, range);
        ranges.push(range);
        this.editor.setSelectedBufferRanges(ranges);
        return true;
      } else {
        return false;
      }
    };

    OccurrenceManager.prototype.getRangeForLastSelection = function(ranges) {
      var i, j, k, len, len1, len2, point, range, rangesStartFromSameRow;
      point = this.vimState.getOriginalCursorPosition();
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvb2NjdXJyZW5jZS1tYW5hZ2VyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUjs7RUFDSixNQUFpQyxPQUFBLENBQVEsTUFBUixDQUFqQyxFQUFDLHFCQUFELEVBQVU7O0VBRVYsT0FHSSxPQUFBLENBQVEsU0FBUixDQUhKLEVBQ0Usa0VBREYsRUFFRTs7RUFHRixlQUFBLEdBQWtCLFNBQUMsTUFBRDtXQUFZLENBQUksTUFBTSxDQUFDLE9BQVAsQ0FBQTtFQUFoQjs7RUFFbEIsTUFBTSxDQUFDLE9BQVAsR0FDTTtnQ0FDSixRQUFBLEdBQVU7O2dDQUNWLGFBQUEsR0FBZTtNQUFDLFVBQUEsRUFBWSxRQUFiOzs7SUFFRiwyQkFBQyxRQUFEO0FBQ1gsVUFBQTtNQURZLElBQUMsQ0FBQSxXQUFEO01BQ1osT0FBNEIsSUFBQyxDQUFBLFFBQTdCLEVBQUMsSUFBQyxDQUFBLGNBQUEsTUFBRixFQUFVLElBQUMsQ0FBQSxxQkFBQTtNQUNYLElBQUMsQ0FBQSxXQUFELEdBQWUsSUFBSTtNQUNuQixJQUFDLENBQUEsV0FBVyxDQUFDLEdBQWIsQ0FBaUIsSUFBQyxDQUFBLFFBQVEsQ0FBQyxZQUFWLENBQXVCLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFjLElBQWQsQ0FBdkIsQ0FBakI7TUFDQSxJQUFDLENBQUEsT0FBRCxHQUFXLElBQUk7TUFDZixJQUFDLENBQUEsUUFBRCxHQUFZO01BRVosSUFBQyxDQUFBLFdBQUQsR0FBZSxJQUFDLENBQUEsTUFBTSxDQUFDLGNBQVIsQ0FBQTtNQUNmLGlCQUFBLEdBQW9CO1FBQUMsSUFBQSxFQUFNLFdBQVA7UUFBb0IsQ0FBQSxLQUFBLENBQUEsRUFBTywrQkFBM0I7O01BQ3BCLElBQUMsQ0FBQSxlQUFELEdBQW1CLElBQUMsQ0FBQSxNQUFNLENBQUMsbUJBQVIsQ0FBNEIsSUFBQyxDQUFBLFdBQTdCLEVBQTBDLGlCQUExQztNQUtuQixJQUFDLENBQUEsbUJBQUQsQ0FBcUIsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLEdBQUQ7QUFDbkIsY0FBQTtVQURxQix1QkFBUztVQUM5QixJQUFHLE9BQUg7WUFDRSxLQUFDLENBQUEsd0JBQUQsQ0FBMEIsT0FBMUIsRUFBbUMsY0FBbkM7bUJBQ0EsS0FBQyxDQUFBLG1CQUFELENBQUEsRUFGRjtXQUFBLE1BQUE7bUJBSUUsS0FBQyxDQUFBLFlBQUQsQ0FBQSxFQUpGOztRQURtQjtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBckI7TUFPQSxJQUFDLENBQUEsV0FBVyxDQUFDLFdBQWIsQ0FBeUIsSUFBQyxDQUFBLHFCQUFxQixDQUFDLElBQXZCLENBQTRCLElBQTVCLENBQXpCO0lBckJXOztnQ0F1QmIsd0JBQUEsR0FBMEIsU0FBQyxPQUFELEVBQVUsY0FBVjtBQUN4QixVQUFBO01BQUEsSUFBRyxjQUFBLEtBQWtCLFNBQXJCO1FBQ0Usa0JBQUEsR0FBcUI7UUFDckIsY0FBQSxHQUFpQixJQUFDLENBQUEsTUFBTSxDQUFDLGFBQVIsQ0FBQSxDQUF1QixDQUFDLGFBQXhCLENBQUE7UUFDakIsY0FBQSxHQUFpQixDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFDLEtBQUQ7QUFDZixnQkFBQTtZQUFBLEdBQUEsR0FBTSxLQUFLLENBQUMsS0FBSyxDQUFDO1lBQ2xCLGFBQUEscUNBQWdCLGtCQUFtQixDQUFBLEdBQUEsSUFBbkIsa0JBQW1CLENBQUEsR0FBQSxJQUFRLHVCQUFBLENBQXdCLEtBQUMsQ0FBQSxNQUF6QixFQUFpQyxHQUFqQyxFQUFzQyxjQUF0QzttQkFDM0MsYUFBYSxDQUFDLElBQWQsQ0FBbUIsU0FBQyxZQUFEO3FCQUFrQixZQUFZLENBQUMsT0FBYixDQUFxQixLQUFyQjtZQUFsQixDQUFuQjtVQUhlO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxFQUhuQjs7YUFRQSxJQUFDLENBQUEsTUFBTSxDQUFDLElBQVIsQ0FBYSxPQUFiLEVBQXNCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxHQUFEO0FBQ3BCLGNBQUE7VUFEc0IsbUJBQU87VUFDN0IsSUFBRyxjQUFBLEtBQWtCLFNBQXJCO1lBQ0UsSUFBQSxDQUFjLGNBQUEsQ0FBZSxLQUFmLENBQWQ7QUFBQSxxQkFBQTthQURGOztpQkFFQSxLQUFDLENBQUEsV0FBVyxDQUFDLGVBQWIsQ0FBNkIsS0FBN0IsRUFBb0MsS0FBQyxDQUFBLGFBQXJDO1FBSG9CO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF0QjtJQVR3Qjs7Z0NBYzFCLG1CQUFBLEdBQXFCLFNBQUE7YUFDbkIsSUFBQyxDQUFBLGFBQWEsQ0FBQyxTQUFTLENBQUMsTUFBekIsQ0FBZ0MsZ0JBQWhDLEVBQWtELElBQUMsQ0FBQSxVQUFELENBQUEsQ0FBbEQ7SUFEbUI7O2dDQUtyQixtQkFBQSxHQUFxQixTQUFDLEVBQUQ7YUFDbkIsSUFBQyxDQUFBLE9BQU8sQ0FBQyxFQUFULENBQVkscUJBQVosRUFBbUMsRUFBbkM7SUFEbUI7O2dDQUdyQixPQUFBLEdBQVMsU0FBQTtNQUNQLElBQUMsQ0FBQSxlQUFlLENBQUMsT0FBakIsQ0FBQTtNQUNBLElBQUMsQ0FBQSxXQUFXLENBQUMsT0FBYixDQUFBO2FBQ0EsSUFBQyxDQUFBLFdBQVcsQ0FBQyxPQUFiLENBQUE7SUFITzs7Z0NBTVQsV0FBQSxHQUFhLFNBQUE7YUFDWCxJQUFDLENBQUEsUUFBUSxDQUFDLE1BQVYsR0FBbUI7SUFEUjs7Z0NBR2IsYUFBQSxHQUFlLFNBQUE7TUFDYixJQUFDLENBQUEsUUFBRCxHQUFZO2FBQ1osSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQWMscUJBQWQsRUFBcUMsRUFBckM7SUFGYTs7Z0NBSWYsVUFBQSxHQUFZLFNBQUMsT0FBRCxFQUFlLEdBQWY7QUFDVixVQUFBOztRQURXLFVBQVE7OzJCQUFNLE1BQXdCLElBQXZCLG9CQUFPO01BQ2pDLElBQW1CLEtBQW5CO1FBQUEsSUFBQyxDQUFBLFlBQUQsQ0FBQSxFQUFBOztNQUNBLElBQUMsQ0FBQSxRQUFRLENBQUMsSUFBVixDQUFlLE9BQWY7O1FBQ0EsaUJBQWtCOzthQUNsQixJQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsQ0FBYyxxQkFBZCxFQUFxQztRQUFDLFNBQUEsT0FBRDtRQUFVLGdCQUFBLGNBQVY7T0FBckM7SUFKVTs7Z0NBTVosZUFBQSxHQUFpQixTQUFBO2FBQ2YsSUFBQyxDQUFBLFFBQVEsQ0FBQyxXQUFXLENBQUMsR0FBdEIsQ0FBMEIsdUJBQTFCLEVBQW1ELElBQUMsQ0FBQSxZQUFELENBQUEsQ0FBbkQ7SUFEZTs7Z0NBT2pCLFlBQUEsR0FBYyxTQUFBO0FBQ1osVUFBQTtNQUFBLE1BQUEsR0FBUyxJQUFDLENBQUEsUUFBUSxDQUFDLEdBQVYsQ0FBYyxTQUFDLE9BQUQ7ZUFBYSxPQUFPLENBQUM7TUFBckIsQ0FBZCxDQUEwQyxDQUFDLElBQTNDLENBQWdELEdBQWhEO2FBQ0wsSUFBQSxNQUFBLENBQU8sTUFBUCxFQUFlLEdBQWY7SUFGUTs7Z0NBTWQsWUFBQSxHQUFjLFNBQUE7YUFDWixJQUFDLENBQUEsY0FBRCxDQUFnQixJQUFDLENBQUEsVUFBRCxDQUFBLENBQWhCO0lBRFk7O2dDQUdkLGNBQUEsR0FBZ0IsU0FBQyxPQUFEO0FBQ2QsVUFBQTtBQUFBLFdBQUEseUNBQUE7O1FBQUEsTUFBTSxDQUFDLE9BQVAsQ0FBQTtBQUFBO2FBRUEsSUFBQyxDQUFBLG1CQUFELENBQUE7SUFIYzs7Z0NBS2hCLHFCQUFBLEdBQXVCLFNBQUE7YUFDckIsSUFBQyxDQUFBLGNBQUQsQ0FBZ0IsSUFBQyxDQUFBLFVBQUQsQ0FBQSxDQUFhLENBQUMsTUFBZCxDQUFxQixlQUFyQixDQUFoQjtJQURxQjs7Z0NBR3ZCLFVBQUEsR0FBWSxTQUFBO2FBQ1YsSUFBQyxDQUFBLFdBQVcsQ0FBQyxjQUFiLENBQUEsQ0FBQSxHQUFnQztJQUR0Qjs7Z0NBR1osVUFBQSxHQUFZLFNBQUE7YUFDVixJQUFDLENBQUEsV0FBVyxDQUFDLFVBQWIsQ0FBQTtJQURVOztnQ0FHWixxQkFBQSxHQUF1QixTQUFBO2FBQ3JCLElBQUMsQ0FBQSxXQUFXLENBQUMsVUFBYixDQUFBLENBQXlCLENBQUMsR0FBMUIsQ0FBOEIsU0FBQyxNQUFEO2VBQVksTUFBTSxDQUFDLGNBQVAsQ0FBQTtNQUFaLENBQTlCO0lBRHFCOztnQ0FHdkIsY0FBQSxHQUFnQixTQUFBO2FBQ2QsSUFBQyxDQUFBLFdBQVcsQ0FBQyxjQUFiLENBQUE7SUFEYzs7Z0NBSWhCLDhCQUFBLEdBQWdDLFNBQUMsTUFBRCxFQUFTLFNBQVQ7QUFLOUIsVUFBQTs7UUFMdUMsWUFBVTs7TUFLakQsTUFBQSxHQUFTLE1BQU0sQ0FBQyxHQUFQLENBQVcsU0FBQyxLQUFEO2VBQVcsNkJBQUEsQ0FBOEIsS0FBOUI7TUFBWCxDQUFYO01BRVQsT0FBQSxHQUFVO0FBQ1YsV0FBQSx3Q0FBQTs7UUFDRSxPQUFBLEdBQVUsSUFBQyxDQUFBLFdBQVcsQ0FBQyxXQUFiLENBQXlCO1VBQUEscUJBQUEsRUFBdUIsS0FBdkI7U0FBekIsQ0FBc0QsQ0FBQyxNQUF2RCxDQUE4RCxTQUFDLE1BQUQ7aUJBQ3RFLEtBQUssQ0FBQyxjQUFOLENBQXFCLE1BQU0sQ0FBQyxjQUFQLENBQUEsQ0FBckIsRUFBOEMsU0FBOUM7UUFEc0UsQ0FBOUQ7UUFFVixPQUFPLENBQUMsSUFBUixnQkFBYSxPQUFiO0FBSEY7YUFJQTtJQVo4Qjs7Z0NBY2hDLGdCQUFBLEdBQWtCLFNBQUMsS0FBRDthQUNoQixJQUFDLENBQUEsV0FBVyxDQUFDLFdBQWIsQ0FBeUI7UUFBQSxzQkFBQSxFQUF3QixLQUF4QjtPQUF6QixDQUF3RCxDQUFBLENBQUE7SUFEeEM7O2dDQVVsQixNQUFBLEdBQVEsU0FBQTtBQUNOLFVBQUE7TUFBQSxZQUFBLEdBQWUsSUFBQyxDQUFBLFFBQVEsQ0FBQyxJQUFWLEtBQWtCO01BQ2pDLE9BQUEsR0FBVSxJQUFDLENBQUEsOEJBQUQsQ0FBZ0MsSUFBQyxDQUFBLE1BQU0sQ0FBQyx1QkFBUixDQUFBLENBQWhDLEVBQW1FLFlBQW5FO01BRVYsSUFBRyxPQUFPLENBQUMsTUFBWDtRQU1FLE1BQUEsR0FBUyxPQUFPLENBQUMsR0FBUixDQUFZLFNBQUMsTUFBRDtpQkFBWSxNQUFNLENBQUMsY0FBUCxDQUFBO1FBQVosQ0FBWjtRQUNULElBQUMsQ0FBQSxjQUFELENBQWdCLE9BQWhCO1FBRUEsSUFBRyxZQUFIO1VBQ0UsSUFBQyxDQUFBLFFBQVEsQ0FBQyxXQUFXLENBQUMsVUFBdEIsQ0FBQTtVQUVBLElBQUMsQ0FBQSxRQUFRLENBQUMsT0FBVixHQUFvQixLQUh0Qjs7UUFNQSxLQUFBLEdBQVEsSUFBQyxDQUFBLHdCQUFELENBQTBCLE1BQTFCO1FBQ1IsQ0FBQyxDQUFDLE1BQUYsQ0FBUyxNQUFULEVBQWlCLEtBQWpCO1FBQ0EsTUFBTSxDQUFDLElBQVAsQ0FBWSxLQUFaO1FBRUEsSUFBQyxDQUFBLE1BQU0sQ0FBQyx1QkFBUixDQUFnQyxNQUFoQztlQUVBLEtBckJGO09BQUEsTUFBQTtlQXVCRSxNQXZCRjs7SUFKTTs7Z0NBa0NSLHdCQUFBLEdBQTBCLFNBQUMsTUFBRDtBQUN4QixVQUFBO01BQUEsS0FBQSxHQUFRLElBQUMsQ0FBQSxRQUFRLENBQUMseUJBQVYsQ0FBQTtBQUVSLFdBQUEsd0NBQUE7O1lBQXlCLEtBQUssQ0FBQyxhQUFOLENBQW9CLEtBQXBCO0FBQ3ZCLGlCQUFPOztBQURUO01BR0Esc0JBQUEsR0FBeUIsTUFBTSxDQUFDLE1BQVAsQ0FBYyxTQUFDLEtBQUQ7ZUFBVyxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQVosS0FBbUIsS0FBSyxDQUFDO01BQXBDLENBQWQ7TUFFekIsSUFBRyxzQkFBc0IsQ0FBQyxNQUExQjtBQUNFLGFBQUEsMERBQUE7O2NBQXlDLEtBQUssQ0FBQyxLQUFLLENBQUMsYUFBWixDQUEwQixLQUExQjtBQUN2QyxtQkFBTzs7QUFEVDtBQUVBLGVBQU8sc0JBQXVCLENBQUEsQ0FBQSxFQUhoQzs7QUFLQSxXQUFBLDBDQUFBOztZQUF5QixLQUFLLENBQUMsS0FBSyxDQUFDLGFBQVosQ0FBMEIsS0FBMUI7QUFDdkIsaUJBQU87O0FBRFQ7YUFHQSxNQUFPLENBQUEsQ0FBQTtJQWhCaUI7Ozs7O0FBOUs1QiIsInNvdXJjZXNDb250ZW50IjpbIl8gPSByZXF1aXJlICd1bmRlcnNjb3JlLXBsdXMnXG57RW1pdHRlciwgQ29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlICdhdG9tJ1xuXG57XG4gIHNocmlua1JhbmdlRW5kVG9CZWZvcmVOZXdMaW5lXG4gIGNvbGxlY3RSYW5nZUluQnVmZmVyUm93XG59ID0gcmVxdWlyZSAnLi91dGlscydcblxuaXNJbnZhbGlkTWFya2VyID0gKG1hcmtlcikgLT4gbm90IG1hcmtlci5pc1ZhbGlkKClcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgT2NjdXJyZW5jZU1hbmFnZXJcbiAgcGF0dGVybnM6IG51bGxcbiAgbWFya2VyT3B0aW9uczoge2ludmFsaWRhdGU6ICdpbnNpZGUnfVxuXG4gIGNvbnN0cnVjdG9yOiAoQHZpbVN0YXRlKSAtPlxuICAgIHtAZWRpdG9yLCBAZWRpdG9yRWxlbWVudH0gPSBAdmltU3RhdGVcbiAgICBAZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuICAgIEBkaXNwb3NhYmxlcy5hZGQgQHZpbVN0YXRlLm9uRGlkRGVzdHJveShAZGVzdHJveS5iaW5kKHRoaXMpKVxuICAgIEBlbWl0dGVyID0gbmV3IEVtaXR0ZXJcbiAgICBAcGF0dGVybnMgPSBbXVxuXG4gICAgQG1hcmtlckxheWVyID0gQGVkaXRvci5hZGRNYXJrZXJMYXllcigpXG4gICAgZGVjb3JhdGlvbk9wdGlvbnMgPSB7dHlwZTogJ2hpZ2hsaWdodCcsIGNsYXNzOiBcInZpbS1tb2RlLXBsdXMtb2NjdXJyZW5jZS1iYXNlXCJ9XG4gICAgQGRlY29yYXRpb25MYXllciA9IEBlZGl0b3IuZGVjb3JhdGVNYXJrZXJMYXllcihAbWFya2VyTGF5ZXIsIGRlY29yYXRpb25PcHRpb25zKVxuXG4gICAgIyBAcGF0dGVybnMgaXMgc2luZ2xlIHNvdXJjZSBvZiB0cnV0aCAoU1NPVClcbiAgICAjIEFsbCBtYWtlciBjcmVhdGUvZGVzdHJveS9jc3MtdXBkYXRlIGlzIGRvbmUgYnkgcmVhY3RpbmcgQHBhdHRlcnMncyBjaGFuZ2UuXG4gICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgQG9uRGlkQ2hhbmdlUGF0dGVybnMgKHtwYXR0ZXJuLCBvY2N1cnJlbmNlVHlwZX0pID0+XG4gICAgICBpZiBwYXR0ZXJuXG4gICAgICAgIEBtYXJrQnVmZmVyUmFuZ2VCeVBhdHRlcm4ocGF0dGVybiwgb2NjdXJyZW5jZVR5cGUpXG4gICAgICAgIEB1cGRhdGVFZGl0b3JFbGVtZW50KClcbiAgICAgIGVsc2VcbiAgICAgICAgQGNsZWFyTWFya2VycygpXG5cbiAgICBAbWFya2VyTGF5ZXIub25EaWRVcGRhdGUoQGRlc3Ryb3lJbnZhbGlkTWFya2Vycy5iaW5kKHRoaXMpKVxuXG4gIG1hcmtCdWZmZXJSYW5nZUJ5UGF0dGVybjogKHBhdHRlcm4sIG9jY3VycmVuY2VUeXBlKSAtPlxuICAgIGlmIG9jY3VycmVuY2VUeXBlIGlzICdzdWJ3b3JkJ1xuICAgICAgc3Vid29yZFJhbmdlc0J5Um93ID0ge30gIyBjYWNoZVxuICAgICAgc3Vid29yZFBhdHRlcm4gPSBAZWRpdG9yLmdldExhc3RDdXJzb3IoKS5zdWJ3b3JkUmVnRXhwKClcbiAgICAgIGlzU3Vid29yZFJhbmdlID0gKHJhbmdlKSA9PlxuICAgICAgICByb3cgPSByYW5nZS5zdGFydC5yb3dcbiAgICAgICAgc3Vid29yZFJhbmdlcyA9IHN1YndvcmRSYW5nZXNCeVJvd1tyb3ddID89IGNvbGxlY3RSYW5nZUluQnVmZmVyUm93KEBlZGl0b3IsIHJvdywgc3Vid29yZFBhdHRlcm4pXG4gICAgICAgIHN1YndvcmRSYW5nZXMuc29tZSAoc3Vid29yZFJhbmdlKSAtPiBzdWJ3b3JkUmFuZ2UuaXNFcXVhbChyYW5nZSlcblxuICAgIEBlZGl0b3Iuc2NhbiBwYXR0ZXJuLCAoe3JhbmdlLCBtYXRjaFRleHR9KSA9PlxuICAgICAgaWYgb2NjdXJyZW5jZVR5cGUgaXMgJ3N1YndvcmQnXG4gICAgICAgIHJldHVybiB1bmxlc3MgaXNTdWJ3b3JkUmFuZ2UocmFuZ2UpXG4gICAgICBAbWFya2VyTGF5ZXIubWFya0J1ZmZlclJhbmdlKHJhbmdlLCBAbWFya2VyT3B0aW9ucylcblxuICB1cGRhdGVFZGl0b3JFbGVtZW50OiAtPlxuICAgIEBlZGl0b3JFbGVtZW50LmNsYXNzTGlzdC50b2dnbGUoXCJoYXMtb2NjdXJyZW5jZVwiLCBAaGFzTWFya2VycygpKVxuXG4gICMgQ2FsbGJhY2sgZ2V0IHBhc3NlZCBmb2xsb3dpbmcgb2JqZWN0XG4gICMgLSBwYXR0ZXJuOiBjYW4gYmUgdW5kZWZpbmVkIG9uIHJlc2V0IGV2ZW50XG4gIG9uRGlkQ2hhbmdlUGF0dGVybnM6IChmbikgLT5cbiAgICBAZW1pdHRlci5vbignZGlkLWNoYW5nZS1wYXR0ZXJucycsIGZuKVxuXG4gIGRlc3Ryb3k6IC0+XG4gICAgQGRlY29yYXRpb25MYXllci5kZXN0cm95KClcbiAgICBAZGlzcG9zYWJsZXMuZGlzcG9zZSgpXG4gICAgQG1hcmtlckxheWVyLmRlc3Ryb3koKVxuXG4gICMgUGF0dGVybnNcbiAgaGFzUGF0dGVybnM6IC0+XG4gICAgQHBhdHRlcm5zLmxlbmd0aCA+IDBcblxuICByZXNldFBhdHRlcm5zOiAtPlxuICAgIEBwYXR0ZXJucyA9IFtdXG4gICAgQGVtaXR0ZXIuZW1pdCgnZGlkLWNoYW5nZS1wYXR0ZXJucycsIHt9KVxuXG4gIGFkZFBhdHRlcm46IChwYXR0ZXJuPW51bGwsIHtyZXNldCwgb2NjdXJyZW5jZVR5cGV9PXt9KSAtPlxuICAgIEBjbGVhck1hcmtlcnMoKSBpZiByZXNldFxuICAgIEBwYXR0ZXJucy5wdXNoKHBhdHRlcm4pXG4gICAgb2NjdXJyZW5jZVR5cGUgPz0gJ2Jhc2UnXG4gICAgQGVtaXR0ZXIuZW1pdCgnZGlkLWNoYW5nZS1wYXR0ZXJucycsIHtwYXR0ZXJuLCBvY2N1cnJlbmNlVHlwZX0pXG5cbiAgc2F2ZUxhc3RQYXR0ZXJuOiAtPlxuICAgIEB2aW1TdGF0ZS5nbG9iYWxTdGF0ZS5zZXQoXCJsYXN0T2NjdXJyZW5jZVBhdHRlcm5cIiwgQGJ1aWxkUGF0dGVybigpKVxuXG4gICMgUmV0dXJuIHJlZ2V4IHJlcHJlc2VudGluZyBmaW5hbCBwYXR0ZXJuLlxuICAjIFVzZWQgdG8gY2FjaGUgZmluYWwgcGF0dGVybiB0byBlYWNoIGluc3RhbmNlIG9mIG9wZXJhdG9yIHNvIHRoYXQgd2UgY2FuXG4gICMgcmVwZWF0IHJlY29yZGVkIG9wZXJhdGlvbiBieSBgLmAuXG4gICMgUGF0dGVybiBjYW4gYmUgYWRkZWQgaW50ZXJhY3RpdmVseSBvbmUgYnkgb25lLCBidXQgd2Ugc2F2ZSBpdCBhcyB1bmlvbiBwYXR0ZXJuLlxuICBidWlsZFBhdHRlcm46IC0+XG4gICAgc291cmNlID0gQHBhdHRlcm5zLm1hcCgocGF0dGVybikgLT4gcGF0dGVybi5zb3VyY2UpLmpvaW4oJ3wnKVxuICAgIG5ldyBSZWdFeHAoc291cmNlLCAnZycpXG5cbiAgIyBNYXJrZXJzXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBjbGVhck1hcmtlcnM6IC0+XG4gICAgQGRlc3Ryb3lNYXJrZXJzKEBnZXRNYXJrZXJzKCkpXG5cbiAgZGVzdHJveU1hcmtlcnM6IChtYXJrZXJzKSAtPlxuICAgIG1hcmtlci5kZXN0cm95KCkgZm9yIG1hcmtlciBpbiBtYXJrZXJzXG4gICAgIyB3aGVuZXJ2ZXIgd2UgZGVzdHJveSBtYXJrZXIsIHdlIHNob3VsZCBzeW5jIGBoYXMtb2NjdXJyZW5jZWAgc2NvcGUgaW4gbWFya2VyIHN0YXRlLi5cbiAgICBAdXBkYXRlRWRpdG9yRWxlbWVudCgpXG5cbiAgZGVzdHJveUludmFsaWRNYXJrZXJzOiAtPlxuICAgIEBkZXN0cm95TWFya2VycyhAZ2V0TWFya2VycygpLmZpbHRlcihpc0ludmFsaWRNYXJrZXIpKVxuXG4gIGhhc01hcmtlcnM6IC0+XG4gICAgQG1hcmtlckxheWVyLmdldE1hcmtlckNvdW50KCkgPiAwXG5cbiAgZ2V0TWFya2VyczogLT5cbiAgICBAbWFya2VyTGF5ZXIuZ2V0TWFya2VycygpXG5cbiAgZ2V0TWFya2VyQnVmZmVyUmFuZ2VzOiAtPlxuICAgIEBtYXJrZXJMYXllci5nZXRNYXJrZXJzKCkubWFwIChtYXJrZXIpIC0+IG1hcmtlci5nZXRCdWZmZXJSYW5nZSgpXG5cbiAgZ2V0TWFya2VyQ291bnQ6IC0+XG4gICAgQG1hcmtlckxheWVyLmdldE1hcmtlckNvdW50KClcblxuICAjIFJldHVybiBvY2N1cnJlbmNlIG1hcmtlcnMgaW50ZXJzZWN0aW5nIGdpdmVuIHJhbmdlc1xuICBnZXRNYXJrZXJzSW50ZXJzZWN0c1dpdGhSYW5nZXM6IChyYW5nZXMsIGV4Y2x1c2l2ZT1mYWxzZSkgLT5cbiAgICAjIGZpbmRtYXJrZXJzKCkncyBpbnRlcnNlY3RzQnVmZmVyUmFuZ2UgcGFyYW0gaGF2ZSBubyBleGNsdXNpdmUgY29udHJvbFxuICAgICMgU28gSSBuZWVkIGV4dHJhIGNoZWNrIHRvIGZpbHRlciBvdXQgdW53YW50ZWQgbWFya2VyLlxuICAgICMgQnV0IGJhc2ljYWxseSBJIHNob3VsZCBwcmVmZXIgZmluZE1hcmtlciBzaW5jZSBJdCdzIGZhc3QgdGhhbiBpdGVyYXRpbmdcbiAgICAjIHdob2xlIG1hcmtlcnMgbWFudWFsbHkuXG4gICAgcmFuZ2VzID0gcmFuZ2VzLm1hcCAocmFuZ2UpIC0+IHNocmlua1JhbmdlRW5kVG9CZWZvcmVOZXdMaW5lKHJhbmdlKVxuXG4gICAgcmVzdWx0cyA9IFtdXG4gICAgZm9yIHJhbmdlIGluIHJhbmdlc1xuICAgICAgbWFya2VycyA9IEBtYXJrZXJMYXllci5maW5kTWFya2VycyhpbnRlcnNlY3RzQnVmZmVyUmFuZ2U6IHJhbmdlKS5maWx0ZXIgKG1hcmtlcikgLT5cbiAgICAgICAgcmFuZ2UuaW50ZXJzZWN0c1dpdGgobWFya2VyLmdldEJ1ZmZlclJhbmdlKCksIGV4Y2x1c2l2ZSlcbiAgICAgIHJlc3VsdHMucHVzaChtYXJrZXJzLi4uKVxuICAgIHJlc3VsdHNcblxuICBnZXRNYXJrZXJBdFBvaW50OiAocG9pbnQpIC0+XG4gICAgQG1hcmtlckxheWVyLmZpbmRNYXJrZXJzKGNvbnRhaW5zQnVmZmVyUG9zaXRpb246IHBvaW50KVswXVxuXG4gICMgU2VsZWN0IG9jY3VycmVuY2UgbWFya2VyIGJ1ZmZlclJhbmdlIGludGVyc2VjdGluZyBjdXJyZW50IHNlbGVjdGlvbnMuXG4gICMgLSBSZXR1cm46IHRydWUvZmFsc2UgdG8gaW5kaWNhdGUgc3VjY2VzcyBvciBmYWlsXG4gICNcbiAgIyBEbyBzcGVjaWFsIGhhbmRsaW5nIGZvciB3aGljaCBvY2N1cnJlbmNlIHJhbmdlIGJlY29tZSBsYXN0U2VsZWN0aW9uXG4gICMgZS5nLlxuICAjICAtIGMoY2hhbmdlKTogU28gdGhhdCBhdXRvY29tcGxldGUrcG9wdXAgc2hvd3MgYXQgb3JpZ2luYWwgY3Vyc29yIHBvc2l0aW9uIG9yIG5lYXIuXG4gICMgIC0gZyBVKHVwcGVyLWNhc2UpOiBTbyB0aGF0IHVuZG8vcmVkbyBjYW4gcmVzcGVjdCBsYXN0IGN1cnNvciBwb3NpdGlvbi5cbiAgc2VsZWN0OiAtPlxuICAgIGlzVmlzdWFsTW9kZSA9IEB2aW1TdGF0ZS5tb2RlIGlzICd2aXN1YWwnXG4gICAgbWFya2VycyA9IEBnZXRNYXJrZXJzSW50ZXJzZWN0c1dpdGhSYW5nZXMoQGVkaXRvci5nZXRTZWxlY3RlZEJ1ZmZlclJhbmdlcygpLCBpc1Zpc3VhbE1vZGUpXG5cbiAgICBpZiBtYXJrZXJzLmxlbmd0aFxuICAgICAgIyBOT1RFOiBpbW1lZGlhdGVseSBkZXN0cm95IG9jY3VycmVuY2UtbWFya2VyIHdoaWNoIHdlIGFyZSBvcGVyYXRlcyBvbiBmcm9tIG5vdy5cbiAgICAgICMgTWFya2VycyBhcmUgbm90IGJlZWluZyBpbW1lZGlhdGVseSBkZXN0cm95ZWQgdW5sZXNzIGV4cGxpY3RseSBkZXN0cm95LlxuICAgICAgIyBNYW51YWxseSBkZXN0cm95aW5nIG1hcmtlcnMgaGVyZSBnaXZlcyB1cyBzZXZlcmFsIGJlbmVmaXRzIGxpa2UgYmVsbG93LlxuICAgICAgIyAgLSBFYXN5IHRvIHdyaXRlIHNwZWMgc2luY2UgbWFya2VycyBhcmUgZGVzdHJveWVkIGluLXN5bmMuXG4gICAgICAjICAtIFNlbGVjdE9jY3VycmVuY2Ugb3BlcmF0aW9uIG5vdCBpbnZhbGlkYXRlIG1hcmtlciBidXQgZGVzdHJveWVkIG9uY2Ugc2VsZWN0ZWQuXG4gICAgICByYW5nZXMgPSBtYXJrZXJzLm1hcCAobWFya2VyKSAtPiBtYXJrZXIuZ2V0QnVmZmVyUmFuZ2UoKVxuICAgICAgQGRlc3Ryb3lNYXJrZXJzKG1hcmtlcnMpXG5cbiAgICAgIGlmIGlzVmlzdWFsTW9kZVxuICAgICAgICBAdmltU3RhdGUubW9kZU1hbmFnZXIuZGVhY3RpdmF0ZSgpXG4gICAgICAgICMgU28gdGhhdCBTZWxlY3RPY2N1cnJlbmNlIGNhbiBhY2l2aXZhdGUgdmlzdWFsLW1vZGUgd2l0aCBjb3JyZWN0IHJhbmdlLCB3ZSBoYXZlIHRvIHVuc2V0IHN1Ym1vZGUgaGVyZS5cbiAgICAgICAgQHZpbVN0YXRlLnN1Ym1vZGUgPSBudWxsXG5cbiAgICAgICMgSW1wb3J0YW50OiBUbyBtYWtlIGxhc3QtY3Vyc29yIGJlY29tZSBvcmlnaW5hbCBjdXJzb3IgcG9zaXRpb24uXG4gICAgICByYW5nZSA9IEBnZXRSYW5nZUZvckxhc3RTZWxlY3Rpb24ocmFuZ2VzKVxuICAgICAgXy5yZW1vdmUocmFuZ2VzLCByYW5nZSlcbiAgICAgIHJhbmdlcy5wdXNoKHJhbmdlKVxuXG4gICAgICBAZWRpdG9yLnNldFNlbGVjdGVkQnVmZmVyUmFuZ2VzKHJhbmdlcylcblxuICAgICAgdHJ1ZVxuICAgIGVsc2VcbiAgICAgIGZhbHNlXG5cbiAgIyBXaGljaCBvY2N1cnJlbmNlIGJlY29tZSBsYXN0U2VsZWN0aW9uIGlzIGRldGVybWluZWQgYnkgZm9sbG93aW5nIG9yZGVyXG4gICMgIDEuIE9jY3VycmVuY2UgdW5kZXIgb3JpZ2luYWwgY3Vyc29yIHBvc2l0aW9uXG4gICMgIDIuIGZvcndhcmRpbmcgaW4gc2FtZSByb3dcbiAgIyAgMy4gZmlyc3Qgb2NjdXJyZW5jZSBpbiBzYW1lIHJvd1xuICAjICA0LiBmb3J3YXJkaW5nICh3cmFwLWVuZClcbiAgZ2V0UmFuZ2VGb3JMYXN0U2VsZWN0aW9uOiAocmFuZ2VzKSAtPlxuICAgIHBvaW50ID0gQHZpbVN0YXRlLmdldE9yaWdpbmFsQ3Vyc29yUG9zaXRpb24oKVxuXG4gICAgZm9yIHJhbmdlIGluIHJhbmdlcyB3aGVuIHJhbmdlLmNvbnRhaW5zUG9pbnQocG9pbnQpXG4gICAgICByZXR1cm4gcmFuZ2VcblxuICAgIHJhbmdlc1N0YXJ0RnJvbVNhbWVSb3cgPSByYW5nZXMuZmlsdGVyKChyYW5nZSkgLT4gcmFuZ2Uuc3RhcnQucm93IGlzIHBvaW50LnJvdylcblxuICAgIGlmIHJhbmdlc1N0YXJ0RnJvbVNhbWVSb3cubGVuZ3RoXG4gICAgICBmb3IgcmFuZ2UgaW4gcmFuZ2VzU3RhcnRGcm9tU2FtZVJvdyB3aGVuIHJhbmdlLnN0YXJ0LmlzR3JlYXRlclRoYW4ocG9pbnQpXG4gICAgICAgIHJldHVybiByYW5nZSAjIEZvcndhcmRpbmdcbiAgICAgIHJldHVybiByYW5nZXNTdGFydEZyb21TYW1lUm93WzBdXG5cbiAgICBmb3IgcmFuZ2UgaW4gcmFuZ2VzIHdoZW4gcmFuZ2Uuc3RhcnQuaXNHcmVhdGVyVGhhbihwb2ludCkgICMgRm9yd2FyZGluZ1xuICAgICAgcmV0dXJuIHJhbmdlXG5cbiAgICByYW5nZXNbMF0gIyByZXR1cm4gZmlyc3QgYXMgZmFsbGJhY2tcbiJdfQ==
