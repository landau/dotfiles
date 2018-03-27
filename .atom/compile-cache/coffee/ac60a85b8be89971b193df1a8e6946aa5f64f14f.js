(function() {
  var FlashManager, _, flashTypes, isNotEmpty,
    slice = [].slice;

  _ = require('underscore-plus');

  isNotEmpty = require('./utils').isNotEmpty;

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

  module.exports = FlashManager = (function() {
    function FlashManager(vimState) {
      this.vimState = vimState;
      this.editor = this.vimState.editor;
      this.markersByType = new Map;
      this.vimState.onDidDestroy(this.destroy.bind(this));
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

    FlashManager.prototype.flash = function(ranges, options, rangeType) {
      var allowMultiple, decorationOptions, i, j, len, len1, marker, markerOptions, markers, range, ref, ref1, timeout, type;
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
      ref = flashTypes[type], allowMultiple = ref.allowMultiple, decorationOptions = ref.decorationOptions;
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
          ref1 = this.markersByType.get(type);
          for (i = 0, len = ref1.length; i < len; i++) {
            marker = ref1[i];
            marker.destroy();
          }
        }
        this.markersByType.set(type, markers);
      }
      for (j = 0, len1 = markers.length; j < len1; j++) {
        marker = markers[j];
        this.editor.decorateMarker(marker, decorationOptions);
      }
      return setTimeout(function() {
        var k, len2, results;
        results = [];
        for (k = 0, len2 = markers.length; k < len2; k++) {
          marker = markers[k];
          results.push(marker.destroy());
        }
        return results;
      }, timeout);
    };

    FlashManager.prototype.flashScreenRange = function() {
      var args;
      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      return this.flash.apply(this, args.concat('screen'));
    };

    return FlashManager;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvZmxhc2gtbWFuYWdlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLHVDQUFBO0lBQUE7O0VBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUjs7RUFDSCxhQUFjLE9BQUEsQ0FBUSxTQUFSOztFQUVmLFVBQUEsR0FDRTtJQUFBLFFBQUEsRUFDRTtNQUFBLGFBQUEsRUFBZSxJQUFmO01BQ0EsaUJBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxXQUFOO1FBQ0EsQ0FBQSxLQUFBLENBQUEsRUFBTyw4QkFEUDtPQUZGO0tBREY7SUFLQSxlQUFBLEVBQ0U7TUFBQSxhQUFBLEVBQWUsSUFBZjtNQUNBLGlCQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sV0FBTjtRQUNBLENBQUEsS0FBQSxDQUFBLEVBQU8sbUNBRFA7T0FGRjtLQU5GO0lBVUEscUJBQUEsRUFDRTtNQUFBLGFBQUEsRUFBZSxJQUFmO01BQ0EsaUJBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxXQUFOO1FBQ0EsQ0FBQSxLQUFBLENBQUEsRUFBTyx5Q0FEUDtPQUZGO0tBWEY7SUFlQSw0QkFBQSxFQUNFO01BQUEsYUFBQSxFQUFlLElBQWY7TUFDQSxpQkFBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFdBQU47UUFDQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLGdEQURQO09BRkY7S0FoQkY7SUFvQkEsTUFBQSxFQUNFO01BQUEsYUFBQSxFQUFlLEtBQWY7TUFDQSxpQkFBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFdBQU47UUFDQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLDRCQURQO09BRkY7S0FyQkY7SUF5QkEsTUFBQSxFQUNFO01BQUEsYUFBQSxFQUFlLElBQWY7TUFDQSxpQkFBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFdBQU47UUFDQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLDRCQURQO09BRkY7S0ExQkY7SUE4QkEsV0FBQSxFQUNFO01BQUEsYUFBQSxFQUFlLElBQWY7TUFDQSxpQkFBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFdBQU47UUFDQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLCtCQURQO09BRkY7S0EvQkY7SUFtQ0EsNEJBQUEsRUFDRTtNQUFBLGFBQUEsRUFBZSxJQUFmO01BQ0EsaUJBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxXQUFOO1FBQ0EsQ0FBQSxLQUFBLENBQUEsRUFBTyxnREFEUDtPQUZGO0tBcENGO0lBd0NBLDJCQUFBLEVBQ0U7TUFBQSxhQUFBLEVBQWUsSUFBZjtNQUNBLGlCQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sV0FBTjtRQUNBLENBQUEsS0FBQSxDQUFBLEVBQU8sK0NBRFA7T0FGRjtLQXpDRjs7O0VBOENGLE1BQU0sQ0FBQyxPQUFQLEdBQ007SUFDUyxzQkFBQyxRQUFEO01BQUMsSUFBQyxDQUFBLFdBQUQ7TUFDWCxJQUFDLENBQUEsU0FBVSxJQUFDLENBQUEsU0FBWDtNQUNGLElBQUMsQ0FBQSxhQUFELEdBQWlCLElBQUk7TUFDckIsSUFBQyxDQUFBLFFBQVEsQ0FBQyxZQUFWLENBQXVCLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFjLElBQWQsQ0FBdkI7SUFIVzs7MkJBS2IsT0FBQSxHQUFTLFNBQUE7TUFDUCxJQUFDLENBQUEsYUFBYSxDQUFDLE9BQWYsQ0FBdUIsU0FBQyxPQUFEO0FBQ3JCLFlBQUE7QUFBQTthQUFBLHlDQUFBOzt1QkFBQSxNQUFNLENBQUMsT0FBUCxDQUFBO0FBQUE7O01BRHFCLENBQXZCO2FBRUEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxLQUFmLENBQUE7SUFITzs7MkJBS1QsS0FBQSxHQUFPLFNBQUMsTUFBRCxFQUFTLE9BQVQsRUFBa0IsU0FBbEI7QUFDTCxVQUFBOztRQUR1QixZQUFVOztNQUNqQyxJQUFBLENBQXlCLENBQUMsQ0FBQyxPQUFGLENBQVUsTUFBVixDQUF6QjtRQUFBLE1BQUEsR0FBUyxDQUFDLE1BQUQsRUFBVDs7TUFDQSxNQUFBLEdBQVMsTUFBTSxDQUFDLE1BQVAsQ0FBYyxVQUFkO01BQ1QsSUFBQSxDQUFtQixNQUFNLENBQUMsTUFBMUI7QUFBQSxlQUFPLEtBQVA7O01BRUMsbUJBQUQsRUFBTzs7UUFDUCxVQUFXOztNQUVYLE1BQXFDLFVBQVcsQ0FBQSxJQUFBLENBQWhELEVBQUMsaUNBQUQsRUFBZ0I7TUFDaEIsYUFBQSxHQUFnQjtRQUFDLFVBQUEsRUFBWSxPQUFiOztBQUVoQixjQUFPLFNBQVA7QUFBQSxhQUNPLFFBRFA7VUFFSSxPQUFBOztBQUFXO2lCQUFBLHdDQUFBOzsyQkFBQSxJQUFDLENBQUEsTUFBTSxDQUFDLGVBQVIsQ0FBd0IsS0FBeEIsRUFBK0IsYUFBL0I7QUFBQTs7O0FBRFI7QUFEUCxhQUdPLFFBSFA7VUFJSSxPQUFBOztBQUFXO2lCQUFBLHdDQUFBOzsyQkFBQSxJQUFDLENBQUEsTUFBTSxDQUFDLGVBQVIsQ0FBd0IsS0FBeEIsRUFBK0IsYUFBL0I7QUFBQTs7O0FBSmY7TUFNQSxJQUFBLENBQU8sYUFBUDtRQUNFLElBQUcsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQW5CLENBQUg7QUFDRTtBQUFBLGVBQUEsc0NBQUE7O1lBQUEsTUFBTSxDQUFDLE9BQVAsQ0FBQTtBQUFBLFdBREY7O1FBRUEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQW5CLEVBQXlCLE9BQXpCLEVBSEY7O0FBS0EsV0FBQSwyQ0FBQTs7UUFBQSxJQUFDLENBQUEsTUFBTSxDQUFDLGNBQVIsQ0FBdUIsTUFBdkIsRUFBK0IsaUJBQS9CO0FBQUE7YUFFQSxVQUFBLENBQVcsU0FBQTtBQUNULFlBQUE7QUFBQTthQUFBLDJDQUFBOzt1QkFDRSxNQUFNLENBQUMsT0FBUCxDQUFBO0FBREY7O01BRFMsQ0FBWCxFQUdFLE9BSEY7SUF4Qks7OzJCQTZCUCxnQkFBQSxHQUFrQixTQUFBO0FBQ2hCLFVBQUE7TUFEaUI7YUFDakIsSUFBQyxDQUFBLEtBQUQsYUFBTyxJQUFJLENBQUMsTUFBTCxDQUFZLFFBQVosQ0FBUDtJQURnQjs7Ozs7QUEzRnBCIiwic291cmNlc0NvbnRlbnQiOlsiXyA9IHJlcXVpcmUgJ3VuZGVyc2NvcmUtcGx1cydcbntpc05vdEVtcHR5fSA9IHJlcXVpcmUgJy4vdXRpbHMnXG5cbmZsYXNoVHlwZXMgPVxuICBvcGVyYXRvcjpcbiAgICBhbGxvd011bHRpcGxlOiB0cnVlXG4gICAgZGVjb3JhdGlvbk9wdGlvbnM6XG4gICAgICB0eXBlOiAnaGlnaGxpZ2h0J1xuICAgICAgY2xhc3M6ICd2aW0tbW9kZS1wbHVzLWZsYXNoIG9wZXJhdG9yJ1xuICAnb3BlcmF0b3ItbG9uZyc6XG4gICAgYWxsb3dNdWx0aXBsZTogdHJ1ZVxuICAgIGRlY29yYXRpb25PcHRpb25zOlxuICAgICAgdHlwZTogJ2hpZ2hsaWdodCdcbiAgICAgIGNsYXNzOiAndmltLW1vZGUtcGx1cy1mbGFzaCBvcGVyYXRvci1sb25nJ1xuICAnb3BlcmF0b3Itb2NjdXJyZW5jZSc6XG4gICAgYWxsb3dNdWx0aXBsZTogdHJ1ZVxuICAgIGRlY29yYXRpb25PcHRpb25zOlxuICAgICAgdHlwZTogJ2hpZ2hsaWdodCdcbiAgICAgIGNsYXNzOiAndmltLW1vZGUtcGx1cy1mbGFzaCBvcGVyYXRvci1vY2N1cnJlbmNlJ1xuICAnb3BlcmF0b3ItcmVtb3ZlLW9jY3VycmVuY2UnOlxuICAgIGFsbG93TXVsdGlwbGU6IHRydWVcbiAgICBkZWNvcmF0aW9uT3B0aW9uczpcbiAgICAgIHR5cGU6ICdoaWdobGlnaHQnXG4gICAgICBjbGFzczogJ3ZpbS1tb2RlLXBsdXMtZmxhc2ggb3BlcmF0b3ItcmVtb3ZlLW9jY3VycmVuY2UnXG4gIHNlYXJjaDpcbiAgICBhbGxvd011bHRpcGxlOiBmYWxzZVxuICAgIGRlY29yYXRpb25PcHRpb25zOlxuICAgICAgdHlwZTogJ2hpZ2hsaWdodCdcbiAgICAgIGNsYXNzOiAndmltLW1vZGUtcGx1cy1mbGFzaCBzZWFyY2gnXG4gIHNjcmVlbjpcbiAgICBhbGxvd011bHRpcGxlOiB0cnVlXG4gICAgZGVjb3JhdGlvbk9wdGlvbnM6XG4gICAgICB0eXBlOiAnaGlnaGxpZ2h0J1xuICAgICAgY2xhc3M6ICd2aW0tbW9kZS1wbHVzLWZsYXNoIHNjcmVlbidcbiAgJ3VuZG8tcmVkbyc6XG4gICAgYWxsb3dNdWx0aXBsZTogdHJ1ZVxuICAgIGRlY29yYXRpb25PcHRpb25zOlxuICAgICAgdHlwZTogJ2hpZ2hsaWdodCdcbiAgICAgIGNsYXNzOiAndmltLW1vZGUtcGx1cy1mbGFzaCB1bmRvLXJlZG8nXG4gICd1bmRvLXJlZG8tbXVsdGlwbGUtY2hhbmdlcyc6XG4gICAgYWxsb3dNdWx0aXBsZTogdHJ1ZVxuICAgIGRlY29yYXRpb25PcHRpb25zOlxuICAgICAgdHlwZTogJ2hpZ2hsaWdodCdcbiAgICAgIGNsYXNzOiAndmltLW1vZGUtcGx1cy1mbGFzaCB1bmRvLXJlZG8tbXVsdGlwbGUtY2hhbmdlcydcbiAgJ3VuZG8tcmVkby1tdWx0aXBsZS1kZWxldGUnOlxuICAgIGFsbG93TXVsdGlwbGU6IHRydWVcbiAgICBkZWNvcmF0aW9uT3B0aW9uczpcbiAgICAgIHR5cGU6ICdoaWdobGlnaHQnXG4gICAgICBjbGFzczogJ3ZpbS1tb2RlLXBsdXMtZmxhc2ggdW5kby1yZWRvLW11bHRpcGxlLWRlbGV0ZSdcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgRmxhc2hNYW5hZ2VyXG4gIGNvbnN0cnVjdG9yOiAoQHZpbVN0YXRlKSAtPlxuICAgIHtAZWRpdG9yfSA9IEB2aW1TdGF0ZVxuICAgIEBtYXJrZXJzQnlUeXBlID0gbmV3IE1hcFxuICAgIEB2aW1TdGF0ZS5vbkRpZERlc3Ryb3koQGRlc3Ryb3kuYmluZCh0aGlzKSlcblxuICBkZXN0cm95OiAtPlxuICAgIEBtYXJrZXJzQnlUeXBlLmZvckVhY2ggKG1hcmtlcnMpIC0+XG4gICAgICBtYXJrZXIuZGVzdHJveSgpIGZvciBtYXJrZXIgaW4gbWFya2Vyc1xuICAgIEBtYXJrZXJzQnlUeXBlLmNsZWFyKClcblxuICBmbGFzaDogKHJhbmdlcywgb3B0aW9ucywgcmFuZ2VUeXBlPSdidWZmZXInKSAtPlxuICAgIHJhbmdlcyA9IFtyYW5nZXNdIHVubGVzcyBfLmlzQXJyYXkocmFuZ2VzKVxuICAgIHJhbmdlcyA9IHJhbmdlcy5maWx0ZXIoaXNOb3RFbXB0eSlcbiAgICByZXR1cm4gbnVsbCB1bmxlc3MgcmFuZ2VzLmxlbmd0aFxuXG4gICAge3R5cGUsIHRpbWVvdXR9ID0gb3B0aW9uc1xuICAgIHRpbWVvdXQgPz0gMTAwMFxuXG4gICAge2FsbG93TXVsdGlwbGUsIGRlY29yYXRpb25PcHRpb25zfSA9IGZsYXNoVHlwZXNbdHlwZV1cbiAgICBtYXJrZXJPcHRpb25zID0ge2ludmFsaWRhdGU6ICd0b3VjaCd9XG5cbiAgICBzd2l0Y2ggcmFuZ2VUeXBlXG4gICAgICB3aGVuICdidWZmZXInXG4gICAgICAgIG1hcmtlcnMgPSAoQGVkaXRvci5tYXJrQnVmZmVyUmFuZ2UocmFuZ2UsIG1hcmtlck9wdGlvbnMpIGZvciByYW5nZSBpbiByYW5nZXMpXG4gICAgICB3aGVuICdzY3JlZW4nXG4gICAgICAgIG1hcmtlcnMgPSAoQGVkaXRvci5tYXJrU2NyZWVuUmFuZ2UocmFuZ2UsIG1hcmtlck9wdGlvbnMpIGZvciByYW5nZSBpbiByYW5nZXMpXG5cbiAgICB1bmxlc3MgYWxsb3dNdWx0aXBsZVxuICAgICAgaWYgQG1hcmtlcnNCeVR5cGUuaGFzKHR5cGUpXG4gICAgICAgIG1hcmtlci5kZXN0cm95KCkgZm9yIG1hcmtlciBpbiBAbWFya2Vyc0J5VHlwZS5nZXQodHlwZSlcbiAgICAgIEBtYXJrZXJzQnlUeXBlLnNldCh0eXBlLCBtYXJrZXJzKVxuXG4gICAgQGVkaXRvci5kZWNvcmF0ZU1hcmtlcihtYXJrZXIsIGRlY29yYXRpb25PcHRpb25zKSBmb3IgbWFya2VyIGluIG1hcmtlcnNcblxuICAgIHNldFRpbWVvdXQgLT5cbiAgICAgIGZvciBtYXJrZXIgaW4gbWFya2Vyc1xuICAgICAgICBtYXJrZXIuZGVzdHJveSgpXG4gICAgLCB0aW1lb3V0XG5cbiAgZmxhc2hTY3JlZW5SYW5nZTogKGFyZ3MuLi4pIC0+XG4gICAgQGZsYXNoKGFyZ3MuY29uY2F0KCdzY3JlZW4nKS4uLilcbiJdfQ==
