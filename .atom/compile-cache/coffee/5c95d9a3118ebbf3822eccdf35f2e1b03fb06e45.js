(function() {
  var FlashManager, _, addDemoSuffix, flashTypes, isNotEmpty, ref, removeDemoSuffix, replaceDecorationClassBy,
    slice = [].slice;

  _ = require('underscore-plus');

  ref = require('./utils'), isNotEmpty = ref.isNotEmpty, replaceDecorationClassBy = ref.replaceDecorationClassBy;

  flashTypes = {
    operator: {
      allowMultiple: true,
      decorationOptions: {
        type: 'highlight',
        "class": 'vim-mode-plus-flash operator'
      }
    },
    'operator-long': {
      allowMultiple: true,
      decorationOptions: {
        type: 'highlight',
        "class": 'vim-mode-plus-flash operator-long'
      }
    },
    'operator-occurrence': {
      allowMultiple: true,
      decorationOptions: {
        type: 'highlight',
        "class": 'vim-mode-plus-flash operator-occurrence'
      }
    },
    'operator-remove-occurrence': {
      allowMultiple: true,
      decorationOptions: {
        type: 'highlight',
        "class": 'vim-mode-plus-flash operator-remove-occurrence'
      }
    },
    search: {
      allowMultiple: false,
      decorationOptions: {
        type: 'highlight',
        "class": 'vim-mode-plus-flash search'
      }
    },
    screen: {
      allowMultiple: true,
      decorationOptions: {
        type: 'highlight',
        "class": 'vim-mode-plus-flash screen'
      }
    },
    'undo-redo': {
      allowMultiple: true,
      decorationOptions: {
        type: 'highlight',
        "class": 'vim-mode-plus-flash undo-redo'
      }
    },
    'undo-redo-multiple-changes': {
      allowMultiple: true,
      decorationOptions: {
        type: 'highlight',
        "class": 'vim-mode-plus-flash undo-redo-multiple-changes'
      }
    },
    'undo-redo-multiple-delete': {
      allowMultiple: true,
      decorationOptions: {
        type: 'highlight',
        "class": 'vim-mode-plus-flash undo-redo-multiple-delete'
      }
    }
  };

  addDemoSuffix = replaceDecorationClassBy.bind(null, function(text) {
    return text + '-demo';
  });

  removeDemoSuffix = replaceDecorationClassBy.bind(null, function(text) {
    return text.replace(/-demo$/, '');
  });

  module.exports = FlashManager = (function() {
    function FlashManager(vimState) {
      this.vimState = vimState;
      this.editor = this.vimState.editor;
      this.markersByType = new Map;
      this.vimState.onDidDestroy(this.destroy.bind(this));
      this.postponedDestroyMarkersTasks = [];
    }

    FlashManager.prototype.destroy = function() {
      this.markersByType.forEach(function(markers) {
        var i, len, marker, results;
        results = [];
        for (i = 0, len = markers.length; i < len; i++) {
          marker = markers[i];
          results.push(marker.destroy());
        }
        return results;
      });
      return this.markersByType.clear();
    };

    FlashManager.prototype.destroyDemoModeMarkers = function() {
      var i, len, ref1, resolve;
      ref1 = this.postponedDestroyMarkersTasks;
      for (i = 0, len = ref1.length; i < len; i++) {
        resolve = ref1[i];
        resolve();
      }
      return this.postponedDestroyMarkersTasks = [];
    };

    FlashManager.prototype.destroyMarkersAfter = function(markers, timeout) {
      return setTimeout(function() {
        var i, len, marker, results;
        results = [];
        for (i = 0, len = markers.length; i < len; i++) {
          marker = markers[i];
          results.push(marker.destroy());
        }
        return results;
      }, timeout);
    };

    FlashManager.prototype.flash = function(ranges, options, rangeType) {
      var allowMultiple, decorationOptions, decorations, i, len, marker, markerOptions, markers, range, ref1, ref2, timeout, type;
      if (rangeType == null) {
        rangeType = 'buffer';
      }
      if (!_.isArray(ranges)) {
        ranges = [ranges];
      }
      ranges = ranges.filter(isNotEmpty);
      if (!ranges.length) {
        return null;
      }
      type = options.type, timeout = options.timeout;
      if (timeout == null) {
        timeout = 1000;
      }
      ref1 = flashTypes[type], allowMultiple = ref1.allowMultiple, decorationOptions = ref1.decorationOptions;
      markerOptions = {
        invalidate: 'touch'
      };
      switch (rangeType) {
        case 'buffer':
          markers = (function() {
            var i, len, results;
            results = [];
            for (i = 0, len = ranges.length; i < len; i++) {
              range = ranges[i];
              results.push(this.editor.markBufferRange(range, markerOptions));
            }
            return results;
          }).call(this);
          break;
        case 'screen':
          markers = (function() {
            var i, len, results;
            results = [];
            for (i = 0, len = ranges.length; i < len; i++) {
              range = ranges[i];
              results.push(this.editor.markScreenRange(range, markerOptions));
            }
            return results;
          }).call(this);
      }
      if (!allowMultiple) {
        if (this.markersByType.has(type)) {
          ref2 = this.markersByType.get(type);
          for (i = 0, len = ref2.length; i < len; i++) {
            marker = ref2[i];
            marker.destroy();
          }
        }
        this.markersByType.set(type, markers);
      }
      decorations = markers.map((function(_this) {
        return function(marker) {
          return _this.editor.decorateMarker(marker, decorationOptions);
        };
      })(this));
      if (this.vimState.globalState.get('demoModeIsActive')) {
        decorations.map(addDemoSuffix);
        return this.postponedDestroyMarkersTasks.push((function(_this) {
          return function() {
            decorations.map(removeDemoSuffix);
            return _this.destroyMarkersAfter(markers, timeout);
          };
        })(this));
      } else {
        return this.destroyMarkersAfter(markers, timeout);
      }
    };

    FlashManager.prototype.flashScreenRange = function() {
      var args;
      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      return this.flash.apply(this, args.concat('screen'));
    };

    return FlashManager;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvZmxhc2gtbWFuYWdlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLHVHQUFBO0lBQUE7O0VBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUjs7RUFDSixNQUF5QyxPQUFBLENBQVEsU0FBUixDQUF6QyxFQUFDLDJCQUFELEVBQWE7O0VBRWIsVUFBQSxHQUNFO0lBQUEsUUFBQSxFQUNFO01BQUEsYUFBQSxFQUFlLElBQWY7TUFDQSxpQkFBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFdBQU47UUFDQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLDhCQURQO09BRkY7S0FERjtJQUtBLGVBQUEsRUFDRTtNQUFBLGFBQUEsRUFBZSxJQUFmO01BQ0EsaUJBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxXQUFOO1FBQ0EsQ0FBQSxLQUFBLENBQUEsRUFBTyxtQ0FEUDtPQUZGO0tBTkY7SUFVQSxxQkFBQSxFQUNFO01BQUEsYUFBQSxFQUFlLElBQWY7TUFDQSxpQkFBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFdBQU47UUFDQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLHlDQURQO09BRkY7S0FYRjtJQWVBLDRCQUFBLEVBQ0U7TUFBQSxhQUFBLEVBQWUsSUFBZjtNQUNBLGlCQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sV0FBTjtRQUNBLENBQUEsS0FBQSxDQUFBLEVBQU8sZ0RBRFA7T0FGRjtLQWhCRjtJQW9CQSxNQUFBLEVBQ0U7TUFBQSxhQUFBLEVBQWUsS0FBZjtNQUNBLGlCQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sV0FBTjtRQUNBLENBQUEsS0FBQSxDQUFBLEVBQU8sNEJBRFA7T0FGRjtLQXJCRjtJQXlCQSxNQUFBLEVBQ0U7TUFBQSxhQUFBLEVBQWUsSUFBZjtNQUNBLGlCQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sV0FBTjtRQUNBLENBQUEsS0FBQSxDQUFBLEVBQU8sNEJBRFA7T0FGRjtLQTFCRjtJQThCQSxXQUFBLEVBQ0U7TUFBQSxhQUFBLEVBQWUsSUFBZjtNQUNBLGlCQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sV0FBTjtRQUNBLENBQUEsS0FBQSxDQUFBLEVBQU8sK0JBRFA7T0FGRjtLQS9CRjtJQW1DQSw0QkFBQSxFQUNFO01BQUEsYUFBQSxFQUFlLElBQWY7TUFDQSxpQkFBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFdBQU47UUFDQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLGdEQURQO09BRkY7S0FwQ0Y7SUF3Q0EsMkJBQUEsRUFDRTtNQUFBLGFBQUEsRUFBZSxJQUFmO01BQ0EsaUJBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxXQUFOO1FBQ0EsQ0FBQSxLQUFBLENBQUEsRUFBTywrQ0FEUDtPQUZGO0tBekNGOzs7RUE4Q0YsYUFBQSxHQUFnQix3QkFBd0IsQ0FBQyxJQUF6QixDQUE4QixJQUE5QixFQUFvQyxTQUFDLElBQUQ7V0FBVSxJQUFBLEdBQU87RUFBakIsQ0FBcEM7O0VBQ2hCLGdCQUFBLEdBQW1CLHdCQUF3QixDQUFDLElBQXpCLENBQThCLElBQTlCLEVBQW9DLFNBQUMsSUFBRDtXQUFVLElBQUksQ0FBQyxPQUFMLENBQWEsUUFBYixFQUF1QixFQUF2QjtFQUFWLENBQXBDOztFQUVuQixNQUFNLENBQUMsT0FBUCxHQUNNO0lBQ1Msc0JBQUMsUUFBRDtNQUFDLElBQUMsQ0FBQSxXQUFEO01BQ1gsSUFBQyxDQUFBLFNBQVUsSUFBQyxDQUFBLFNBQVg7TUFDRixJQUFDLENBQUEsYUFBRCxHQUFpQixJQUFJO01BQ3JCLElBQUMsQ0FBQSxRQUFRLENBQUMsWUFBVixDQUF1QixJQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsQ0FBYyxJQUFkLENBQXZCO01BQ0EsSUFBQyxDQUFBLDRCQUFELEdBQWdDO0lBSnJCOzsyQkFNYixPQUFBLEdBQVMsU0FBQTtNQUNQLElBQUMsQ0FBQSxhQUFhLENBQUMsT0FBZixDQUF1QixTQUFDLE9BQUQ7QUFDckIsWUFBQTtBQUFBO2FBQUEseUNBQUE7O3VCQUFBLE1BQU0sQ0FBQyxPQUFQLENBQUE7QUFBQTs7TUFEcUIsQ0FBdkI7YUFFQSxJQUFDLENBQUEsYUFBYSxDQUFDLEtBQWYsQ0FBQTtJQUhPOzsyQkFLVCxzQkFBQSxHQUF3QixTQUFBO0FBQ3RCLFVBQUE7QUFBQTtBQUFBLFdBQUEsc0NBQUE7O1FBQ0UsT0FBQSxDQUFBO0FBREY7YUFFQSxJQUFDLENBQUEsNEJBQUQsR0FBZ0M7SUFIVjs7MkJBS3hCLG1CQUFBLEdBQXFCLFNBQUMsT0FBRCxFQUFVLE9BQVY7YUFDbkIsVUFBQSxDQUFXLFNBQUE7QUFDVCxZQUFBO0FBQUE7YUFBQSx5Q0FBQTs7dUJBQ0UsTUFBTSxDQUFDLE9BQVAsQ0FBQTtBQURGOztNQURTLENBQVgsRUFHRSxPQUhGO0lBRG1COzsyQkFNckIsS0FBQSxHQUFPLFNBQUMsTUFBRCxFQUFTLE9BQVQsRUFBa0IsU0FBbEI7QUFDTCxVQUFBOztRQUR1QixZQUFVOztNQUNqQyxJQUFBLENBQXlCLENBQUMsQ0FBQyxPQUFGLENBQVUsTUFBVixDQUF6QjtRQUFBLE1BQUEsR0FBUyxDQUFDLE1BQUQsRUFBVDs7TUFDQSxNQUFBLEdBQVMsTUFBTSxDQUFDLE1BQVAsQ0FBYyxVQUFkO01BQ1QsSUFBQSxDQUFtQixNQUFNLENBQUMsTUFBMUI7QUFBQSxlQUFPLEtBQVA7O01BRUMsbUJBQUQsRUFBTzs7UUFDUCxVQUFXOztNQUVYLE9BQXFDLFVBQVcsQ0FBQSxJQUFBLENBQWhELEVBQUMsa0NBQUQsRUFBZ0I7TUFDaEIsYUFBQSxHQUFnQjtRQUFDLFVBQUEsRUFBWSxPQUFiOztBQUVoQixjQUFPLFNBQVA7QUFBQSxhQUNPLFFBRFA7VUFFSSxPQUFBOztBQUFXO2lCQUFBLHdDQUFBOzsyQkFBQSxJQUFDLENBQUEsTUFBTSxDQUFDLGVBQVIsQ0FBd0IsS0FBeEIsRUFBK0IsYUFBL0I7QUFBQTs7O0FBRFI7QUFEUCxhQUdPLFFBSFA7VUFJSSxPQUFBOztBQUFXO2lCQUFBLHdDQUFBOzsyQkFBQSxJQUFDLENBQUEsTUFBTSxDQUFDLGVBQVIsQ0FBd0IsS0FBeEIsRUFBK0IsYUFBL0I7QUFBQTs7O0FBSmY7TUFNQSxJQUFBLENBQU8sYUFBUDtRQUNFLElBQUcsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQW5CLENBQUg7QUFDRTtBQUFBLGVBQUEsc0NBQUE7O1lBQUEsTUFBTSxDQUFDLE9BQVAsQ0FBQTtBQUFBLFdBREY7O1FBRUEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQW5CLEVBQXlCLE9BQXpCLEVBSEY7O01BS0EsV0FBQSxHQUFjLE9BQU8sQ0FBQyxHQUFSLENBQVksQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLE1BQUQ7aUJBQVksS0FBQyxDQUFBLE1BQU0sQ0FBQyxjQUFSLENBQXVCLE1BQXZCLEVBQStCLGlCQUEvQjtRQUFaO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFaO01BRWQsSUFBRyxJQUFDLENBQUEsUUFBUSxDQUFDLFdBQVcsQ0FBQyxHQUF0QixDQUEwQixrQkFBMUIsQ0FBSDtRQUNFLFdBQVcsQ0FBQyxHQUFaLENBQWdCLGFBQWhCO2VBQ0EsSUFBQyxDQUFBLDRCQUE0QixDQUFDLElBQTlCLENBQW1DLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUE7WUFDakMsV0FBVyxDQUFDLEdBQVosQ0FBZ0IsZ0JBQWhCO21CQUNBLEtBQUMsQ0FBQSxtQkFBRCxDQUFxQixPQUFyQixFQUE4QixPQUE5QjtVQUZpQztRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbkMsRUFGRjtPQUFBLE1BQUE7ZUFNRSxJQUFDLENBQUEsbUJBQUQsQ0FBcUIsT0FBckIsRUFBOEIsT0FBOUIsRUFORjs7SUF4Qks7OzJCQWdDUCxnQkFBQSxHQUFrQixTQUFBO0FBQ2hCLFVBQUE7TUFEaUI7YUFDakIsSUFBQyxDQUFBLEtBQUQsYUFBTyxJQUFJLENBQUMsTUFBTCxDQUFZLFFBQVosQ0FBUDtJQURnQjs7Ozs7QUE3R3BCIiwic291cmNlc0NvbnRlbnQiOlsiXyA9IHJlcXVpcmUgJ3VuZGVyc2NvcmUtcGx1cydcbntpc05vdEVtcHR5LCByZXBsYWNlRGVjb3JhdGlvbkNsYXNzQnl9ID0gcmVxdWlyZSAnLi91dGlscydcblxuZmxhc2hUeXBlcyA9XG4gIG9wZXJhdG9yOlxuICAgIGFsbG93TXVsdGlwbGU6IHRydWVcbiAgICBkZWNvcmF0aW9uT3B0aW9uczpcbiAgICAgIHR5cGU6ICdoaWdobGlnaHQnXG4gICAgICBjbGFzczogJ3ZpbS1tb2RlLXBsdXMtZmxhc2ggb3BlcmF0b3InXG4gICdvcGVyYXRvci1sb25nJzpcbiAgICBhbGxvd011bHRpcGxlOiB0cnVlXG4gICAgZGVjb3JhdGlvbk9wdGlvbnM6XG4gICAgICB0eXBlOiAnaGlnaGxpZ2h0J1xuICAgICAgY2xhc3M6ICd2aW0tbW9kZS1wbHVzLWZsYXNoIG9wZXJhdG9yLWxvbmcnXG4gICdvcGVyYXRvci1vY2N1cnJlbmNlJzpcbiAgICBhbGxvd011bHRpcGxlOiB0cnVlXG4gICAgZGVjb3JhdGlvbk9wdGlvbnM6XG4gICAgICB0eXBlOiAnaGlnaGxpZ2h0J1xuICAgICAgY2xhc3M6ICd2aW0tbW9kZS1wbHVzLWZsYXNoIG9wZXJhdG9yLW9jY3VycmVuY2UnXG4gICdvcGVyYXRvci1yZW1vdmUtb2NjdXJyZW5jZSc6XG4gICAgYWxsb3dNdWx0aXBsZTogdHJ1ZVxuICAgIGRlY29yYXRpb25PcHRpb25zOlxuICAgICAgdHlwZTogJ2hpZ2hsaWdodCdcbiAgICAgIGNsYXNzOiAndmltLW1vZGUtcGx1cy1mbGFzaCBvcGVyYXRvci1yZW1vdmUtb2NjdXJyZW5jZSdcbiAgc2VhcmNoOlxuICAgIGFsbG93TXVsdGlwbGU6IGZhbHNlXG4gICAgZGVjb3JhdGlvbk9wdGlvbnM6XG4gICAgICB0eXBlOiAnaGlnaGxpZ2h0J1xuICAgICAgY2xhc3M6ICd2aW0tbW9kZS1wbHVzLWZsYXNoIHNlYXJjaCdcbiAgc2NyZWVuOlxuICAgIGFsbG93TXVsdGlwbGU6IHRydWVcbiAgICBkZWNvcmF0aW9uT3B0aW9uczpcbiAgICAgIHR5cGU6ICdoaWdobGlnaHQnXG4gICAgICBjbGFzczogJ3ZpbS1tb2RlLXBsdXMtZmxhc2ggc2NyZWVuJ1xuICAndW5kby1yZWRvJzpcbiAgICBhbGxvd011bHRpcGxlOiB0cnVlXG4gICAgZGVjb3JhdGlvbk9wdGlvbnM6XG4gICAgICB0eXBlOiAnaGlnaGxpZ2h0J1xuICAgICAgY2xhc3M6ICd2aW0tbW9kZS1wbHVzLWZsYXNoIHVuZG8tcmVkbydcbiAgJ3VuZG8tcmVkby1tdWx0aXBsZS1jaGFuZ2VzJzpcbiAgICBhbGxvd011bHRpcGxlOiB0cnVlXG4gICAgZGVjb3JhdGlvbk9wdGlvbnM6XG4gICAgICB0eXBlOiAnaGlnaGxpZ2h0J1xuICAgICAgY2xhc3M6ICd2aW0tbW9kZS1wbHVzLWZsYXNoIHVuZG8tcmVkby1tdWx0aXBsZS1jaGFuZ2VzJ1xuICAndW5kby1yZWRvLW11bHRpcGxlLWRlbGV0ZSc6XG4gICAgYWxsb3dNdWx0aXBsZTogdHJ1ZVxuICAgIGRlY29yYXRpb25PcHRpb25zOlxuICAgICAgdHlwZTogJ2hpZ2hsaWdodCdcbiAgICAgIGNsYXNzOiAndmltLW1vZGUtcGx1cy1mbGFzaCB1bmRvLXJlZG8tbXVsdGlwbGUtZGVsZXRlJ1xuXG5hZGREZW1vU3VmZml4ID0gcmVwbGFjZURlY29yYXRpb25DbGFzc0J5LmJpbmQobnVsbCwgKHRleHQpIC0+IHRleHQgKyAnLWRlbW8nKVxucmVtb3ZlRGVtb1N1ZmZpeCA9IHJlcGxhY2VEZWNvcmF0aW9uQ2xhc3NCeS5iaW5kKG51bGwsICh0ZXh0KSAtPiB0ZXh0LnJlcGxhY2UoLy1kZW1vJC8sICcnKSlcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgRmxhc2hNYW5hZ2VyXG4gIGNvbnN0cnVjdG9yOiAoQHZpbVN0YXRlKSAtPlxuICAgIHtAZWRpdG9yfSA9IEB2aW1TdGF0ZVxuICAgIEBtYXJrZXJzQnlUeXBlID0gbmV3IE1hcFxuICAgIEB2aW1TdGF0ZS5vbkRpZERlc3Ryb3koQGRlc3Ryb3kuYmluZCh0aGlzKSlcbiAgICBAcG9zdHBvbmVkRGVzdHJveU1hcmtlcnNUYXNrcyA9IFtdXG5cbiAgZGVzdHJveTogLT5cbiAgICBAbWFya2Vyc0J5VHlwZS5mb3JFYWNoIChtYXJrZXJzKSAtPlxuICAgICAgbWFya2VyLmRlc3Ryb3koKSBmb3IgbWFya2VyIGluIG1hcmtlcnNcbiAgICBAbWFya2Vyc0J5VHlwZS5jbGVhcigpXG5cbiAgZGVzdHJveURlbW9Nb2RlTWFya2VyczogLT5cbiAgICBmb3IgcmVzb2x2ZSBpbiBAcG9zdHBvbmVkRGVzdHJveU1hcmtlcnNUYXNrc1xuICAgICAgcmVzb2x2ZSgpXG4gICAgQHBvc3Rwb25lZERlc3Ryb3lNYXJrZXJzVGFza3MgPSBbXVxuXG4gIGRlc3Ryb3lNYXJrZXJzQWZ0ZXI6IChtYXJrZXJzLCB0aW1lb3V0KSAtPlxuICAgIHNldFRpbWVvdXQgLT5cbiAgICAgIGZvciBtYXJrZXIgaW4gbWFya2Vyc1xuICAgICAgICBtYXJrZXIuZGVzdHJveSgpXG4gICAgLCB0aW1lb3V0XG5cbiAgZmxhc2g6IChyYW5nZXMsIG9wdGlvbnMsIHJhbmdlVHlwZT0nYnVmZmVyJykgLT5cbiAgICByYW5nZXMgPSBbcmFuZ2VzXSB1bmxlc3MgXy5pc0FycmF5KHJhbmdlcylcbiAgICByYW5nZXMgPSByYW5nZXMuZmlsdGVyKGlzTm90RW1wdHkpXG4gICAgcmV0dXJuIG51bGwgdW5sZXNzIHJhbmdlcy5sZW5ndGhcblxuICAgIHt0eXBlLCB0aW1lb3V0fSA9IG9wdGlvbnNcbiAgICB0aW1lb3V0ID89IDEwMDBcblxuICAgIHthbGxvd011bHRpcGxlLCBkZWNvcmF0aW9uT3B0aW9uc30gPSBmbGFzaFR5cGVzW3R5cGVdXG4gICAgbWFya2VyT3B0aW9ucyA9IHtpbnZhbGlkYXRlOiAndG91Y2gnfVxuXG4gICAgc3dpdGNoIHJhbmdlVHlwZVxuICAgICAgd2hlbiAnYnVmZmVyJ1xuICAgICAgICBtYXJrZXJzID0gKEBlZGl0b3IubWFya0J1ZmZlclJhbmdlKHJhbmdlLCBtYXJrZXJPcHRpb25zKSBmb3IgcmFuZ2UgaW4gcmFuZ2VzKVxuICAgICAgd2hlbiAnc2NyZWVuJ1xuICAgICAgICBtYXJrZXJzID0gKEBlZGl0b3IubWFya1NjcmVlblJhbmdlKHJhbmdlLCBtYXJrZXJPcHRpb25zKSBmb3IgcmFuZ2UgaW4gcmFuZ2VzKVxuXG4gICAgdW5sZXNzIGFsbG93TXVsdGlwbGVcbiAgICAgIGlmIEBtYXJrZXJzQnlUeXBlLmhhcyh0eXBlKVxuICAgICAgICBtYXJrZXIuZGVzdHJveSgpIGZvciBtYXJrZXIgaW4gQG1hcmtlcnNCeVR5cGUuZ2V0KHR5cGUpXG4gICAgICBAbWFya2Vyc0J5VHlwZS5zZXQodHlwZSwgbWFya2VycylcblxuICAgIGRlY29yYXRpb25zID0gbWFya2Vycy5tYXAgKG1hcmtlcikgPT4gQGVkaXRvci5kZWNvcmF0ZU1hcmtlcihtYXJrZXIsIGRlY29yYXRpb25PcHRpb25zKVxuXG4gICAgaWYgQHZpbVN0YXRlLmdsb2JhbFN0YXRlLmdldCgnZGVtb01vZGVJc0FjdGl2ZScpXG4gICAgICBkZWNvcmF0aW9ucy5tYXAoYWRkRGVtb1N1ZmZpeClcbiAgICAgIEBwb3N0cG9uZWREZXN0cm95TWFya2Vyc1Rhc2tzLnB1c2ggPT5cbiAgICAgICAgZGVjb3JhdGlvbnMubWFwKHJlbW92ZURlbW9TdWZmaXgpXG4gICAgICAgIEBkZXN0cm95TWFya2Vyc0FmdGVyKG1hcmtlcnMsIHRpbWVvdXQpXG4gICAgZWxzZVxuICAgICAgQGRlc3Ryb3lNYXJrZXJzQWZ0ZXIobWFya2VycywgdGltZW91dClcblxuICBmbGFzaFNjcmVlblJhbmdlOiAoYXJncy4uLikgLT5cbiAgICBAZmxhc2goYXJncy5jb25jYXQoJ3NjcmVlbicpLi4uKVxuIl19
