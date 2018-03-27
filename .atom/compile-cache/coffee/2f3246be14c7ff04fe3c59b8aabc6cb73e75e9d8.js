(function() {
  var CompositeDisposable, Mutation, MutationManager, Point, getFirstCharacterPositionForBufferRow, getVimLastBufferRow, ref, ref1, swrap;

  ref = require('atom'), Point = ref.Point, CompositeDisposable = ref.CompositeDisposable;

  ref1 = require('./utils'), getFirstCharacterPositionForBufferRow = ref1.getFirstCharacterPositionForBufferRow, getVimLastBufferRow = ref1.getVimLastBufferRow;

  swrap = require('./selection-wrapper');

  module.exports = MutationManager = (function() {
    function MutationManager(vimState) {
      this.vimState = vimState;
      this.editor = this.vimState.editor;
      this.disposables = new CompositeDisposable;
      this.disposables.add(this.vimState.onDidDestroy(this.destroy.bind(this)));
      this.markerLayer = this.editor.addMarkerLayer();
      this.mutationsBySelection = new Map;
    }

    MutationManager.prototype.destroy = function() {
      var ref2;
      this.reset();
      return ref2 = {}, this.mutationsBySelection = ref2.mutationsBySelection, this.editor = ref2.editor, this.vimState = ref2.vimState, ref2;
    };

    MutationManager.prototype.init = function(arg) {
      this.stayByMarker = arg.stayByMarker;
      return this.reset();
    };

    MutationManager.prototype.reset = function() {
      this.markerLayer.clear();
      return this.mutationsBySelection.clear();
    };

    MutationManager.prototype.setCheckpoint = function(checkpoint) {
      var i, len, ref2, results, selection;
      ref2 = this.editor.getSelections();
      results = [];
      for (i = 0, len = ref2.length; i < len; i++) {
        selection = ref2[i];
        results.push(this.setCheckpointForSelection(selection, checkpoint));
      }
      return results;
    };

    MutationManager.prototype.setCheckpointForSelection = function(selection, checkpoint) {
      var initialPoint, initialPointMarker, marker, options, resetMarker;
      if (this.mutationsBySelection.has(selection)) {
        resetMarker = !selection.getBufferRange().isEmpty();
      } else {
        resetMarker = true;
        initialPoint = swrap(selection).getBufferPositionFor('head', {
          from: ['property', 'selection']
        });
        if (this.stayByMarker) {
          initialPointMarker = this.markerLayer.markBufferPosition(initialPoint, {
            invalidate: 'never'
          });
        }
        options = {
          selection: selection,
          initialPoint: initialPoint,
          initialPointMarker: initialPointMarker,
          checkpoint: checkpoint
        };
        this.mutationsBySelection.set(selection, new Mutation(options));
      }
      if (resetMarker) {
        marker = this.markerLayer.markBufferRange(selection.getBufferRange(), {
          invalidate: 'never'
        });
      }
      return this.mutationsBySelection.get(selection).update(checkpoint, marker, this.vimState.mode);
    };

    MutationManager.prototype.migrateMutation = function(oldSelection, newSelection) {
      var mutation;
      mutation = this.mutationsBySelection.get(oldSelection);
      this.mutationsBySelection["delete"](oldSelection);
      mutation.selection = newSelection;
      return this.mutationsBySelection.set(newSelection, mutation);
    };

    MutationManager.prototype.getMutatedBufferRangeForSelection = function(selection) {
      if (this.mutationsBySelection.has(selection)) {
        return this.mutationsBySelection.get(selection).marker.getBufferRange();
      }
    };

    MutationManager.prototype.getSelectedBufferRangesForCheckpoint = function(checkpoint) {
      var ranges;
      ranges = [];
      this.mutationsBySelection.forEach(function(mutation) {
        var range;
        if (range = mutation.bufferRangeByCheckpoint[checkpoint]) {
          return ranges.push(range);
        }
      });
      return ranges;
    };

    MutationManager.prototype.restoreCursorPositions = function(arg) {
      var blockwiseSelection, head, i, j, k, len, len1, len2, mutation, point, ref2, ref3, ref4, ref5, results, results1, selection, setToFirstCharacterOnLinewise, stay, tail, wise;
      stay = arg.stay, wise = arg.wise, setToFirstCharacterOnLinewise = arg.setToFirstCharacterOnLinewise;
      if (wise === 'blockwise') {
        ref2 = this.vimState.getBlockwiseSelections();
        results = [];
        for (i = 0, len = ref2.length; i < len; i++) {
          blockwiseSelection = ref2[i];
          ref3 = blockwiseSelection.getProperties(), head = ref3.head, tail = ref3.tail;
          point = stay ? head : Point.min(head, tail);
          blockwiseSelection.setHeadBufferPosition(point);
          results.push(blockwiseSelection.skipNormalization());
        }
        return results;
      } else {
        ref4 = this.editor.getSelections();
        for (j = 0, len1 = ref4.length; j < len1; j++) {
          selection = ref4[j];
          if (mutation = this.mutationsBySelection.get(selection)) {
            if (mutation.createdAt !== 'will-select') {
              selection.destroy();
            }
          }
        }
        ref5 = this.editor.getSelections();
        results1 = [];
        for (k = 0, len2 = ref5.length; k < len2; k++) {
          selection = ref5[k];
          if (!(mutation = this.mutationsBySelection.get(selection))) {
            continue;
          }
          if (stay) {
            point = this.clipPoint(mutation.getStayPosition(wise));
          } else {
            point = this.clipPoint(mutation.startPositionOnDidSelect);
            if (setToFirstCharacterOnLinewise && wise === 'linewise') {
              point = getFirstCharacterPositionForBufferRow(this.editor, point.row);
            }
          }
          results1.push(selection.cursor.setBufferPosition(point));
        }
        return results1;
      }
    };

    MutationManager.prototype.clipPoint = function(point) {
      point.row = Math.min(getVimLastBufferRow(this.editor), point.row);
      return this.editor.clipBufferPosition(point);
    };

    return MutationManager;

  })();

  Mutation = (function() {
    function Mutation(options) {
      var checkpoint;
      this.selection = options.selection, this.initialPoint = options.initialPoint, this.initialPointMarker = options.initialPointMarker, checkpoint = options.checkpoint;
      this.createdAt = checkpoint;
      this.bufferRangeByCheckpoint = {};
      this.marker = null;
      this.startPositionOnDidSelect = null;
    }

    Mutation.prototype.update = function(checkpoint, marker, mode) {
      var from, ref2;
      if (marker != null) {
        if ((ref2 = this.marker) != null) {
          ref2.destroy();
        }
        this.marker = marker;
      }
      this.bufferRangeByCheckpoint[checkpoint] = this.marker.getBufferRange();
      if (checkpoint === 'did-select') {
        if (mode === 'visual' && !this.selection.isReversed()) {
          from = ['selection'];
        } else {
          from = ['property', 'selection'];
        }
        return this.startPositionOnDidSelect = swrap(this.selection).getBufferPositionFor('start', {
          from: from
        });
      }
    };

    Mutation.prototype.getStayPosition = function(wise) {
      var end, point, ref2, ref3, ref4, ref5, selectedRange, start;
      point = (ref2 = (ref3 = this.initialPointMarker) != null ? ref3.getHeadBufferPosition() : void 0) != null ? ref2 : this.initialPoint;
      selectedRange = (ref4 = this.bufferRangeByCheckpoint['did-select-occurrence']) != null ? ref4 : this.bufferRangeByCheckpoint['did-select'];
      if (selectedRange.isEqual(this.marker.getBufferRange())) {
        return point;
      } else {
        ref5 = this.marker.getBufferRange(), start = ref5.start, end = ref5.end;
        end = Point.max(start, end.translate([0, -1]));
        if (wise === 'linewise') {
          point.row = Math.min(end.row, point.row);
          return point;
        } else {
          return Point.min(end, point);
        }
      }
    };

    return Mutation;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvbXV0YXRpb24tbWFuYWdlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLE1BQStCLE9BQUEsQ0FBUSxNQUFSLENBQS9CLEVBQUMsaUJBQUQsRUFBUTs7RUFDUixPQUErRCxPQUFBLENBQVEsU0FBUixDQUEvRCxFQUFDLGtGQUFELEVBQXdDOztFQUN4QyxLQUFBLEdBQVEsT0FBQSxDQUFRLHFCQUFSOztFQUVSLE1BQU0sQ0FBQyxPQUFQLEdBQ007SUFDUyx5QkFBQyxRQUFEO01BQUMsSUFBQyxDQUFBLFdBQUQ7TUFDWCxJQUFDLENBQUEsU0FBVSxJQUFDLENBQUEsU0FBWDtNQUVGLElBQUMsQ0FBQSxXQUFELEdBQWUsSUFBSTtNQUNuQixJQUFDLENBQUEsV0FBVyxDQUFDLEdBQWIsQ0FBaUIsSUFBQyxDQUFBLFFBQVEsQ0FBQyxZQUFWLENBQXVCLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFjLElBQWQsQ0FBdkIsQ0FBakI7TUFFQSxJQUFDLENBQUEsV0FBRCxHQUFlLElBQUMsQ0FBQSxNQUFNLENBQUMsY0FBUixDQUFBO01BQ2YsSUFBQyxDQUFBLG9CQUFELEdBQXdCLElBQUk7SUFQakI7OzhCQVNiLE9BQUEsR0FBUyxTQUFBO0FBQ1AsVUFBQTtNQUFBLElBQUMsQ0FBQSxLQUFELENBQUE7YUFDQSxPQUE4QyxFQUE5QyxFQUFDLElBQUMsQ0FBQSw0QkFBQSxvQkFBRixFQUF3QixJQUFDLENBQUEsY0FBQSxNQUF6QixFQUFpQyxJQUFDLENBQUEsZ0JBQUEsUUFBbEMsRUFBQTtJQUZPOzs4QkFJVCxJQUFBLEdBQU0sU0FBQyxHQUFEO01BQUUsSUFBQyxDQUFBLGVBQUYsSUFBRTthQUNQLElBQUMsQ0FBQSxLQUFELENBQUE7SUFESTs7OEJBR04sS0FBQSxH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QUE7TUFDN0YsSUFBRyxhQUFhLENBQUMsT0FBZCxDQUFzQixJQUFDLENBQUEsTUFBTSxDQUFDLGNBQVIsQ0FBQSxDQUF0QixDQUFIO2VBQ0UsTUFERjtPQUFBLE1BQUE7UUFHRSxPQUFlLElBQUMsQ0FBQSxNQUFNLENBQUMsY0FBUixDQUFBLENBQWYsRUFBQyxrQkFBRCxFQUFRO1FBQ1IsR0FBQSxHQUFNLEtBQUssQ0FBQyxHQUFOLENBQVUsS0FBVixFQUFpQixHQUFHLENBQUMsU0FBSixDQUFjLENBQUMsQ0FBRCxFQUFJLENBQUMsQ0FBTCxDQUFkLENBQWpCO1FBQ04sSUFBRyxJQUFBLEtBQVEsVUFBWDtVQUNFLEtBQUssQ0FBQyxHQUFOLEdBQVksSUFBSSxDQUFDLEdBQUwsQ0FBUyxHQUFHLENBQUMsR0FBYixFQUFrQixLQUFLLENBQUMsR0FBeEI7aUJBQ1osTUFGRjtTQUFBLE1BQUE7aUJBSUUsS0FBSyxDQUFDLEdBQU4sQ0FBVSxHQUFWLEVBQWUsS0FBZixFQUpGO1NBTEY7O0lBSGU7Ozs7O0FBdkhuQiIsInNvdXJjZXNDb250ZW50IjpbIntQb2ludCwgQ29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlICdhdG9tJ1xue2dldEZpcnN0Q2hhcmFjdGVyUG9zaXRpb25Gb3JCdWZmZXJSb3csIGdldFZpbUxhc3RCdWZmZXJSb3d9ID0gcmVxdWlyZSAnLi91dGlscydcbnN3cmFwID0gcmVxdWlyZSAnLi9zZWxlY3Rpb24td3JhcHBlcidcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgTXV0YXRpb25NYW5hZ2VyXG4gIGNvbnN0cnVjdG9yOiAoQHZpbVN0YXRlKSAtPlxuICAgIHtAZWRpdG9yfSA9IEB2aW1TdGF0ZVxuXG4gICAgQGRpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcbiAgICBAZGlzcG9zYWJsZXMuYWRkIEB2aW1TdGF0ZS5vbkRpZERlc3Ryb3koQGRlc3Ryb3kuYmluZCh0aGlzKSlcblxuICAgIEBtYXJrZXJMYXllciA9IEBlZGl0b3IuYWRkTWFya2VyTGF5ZXIoKVxuICAgIEBtdXRhdGlvbnNCeVNlbGVjdGlvbiA9IG5ldyBNYXBcblxuICBkZXN0cm95OiAtPlxuICAgIEByZXNldCgpXG4gICAge0BtdXRhdGlvbnNCeVNlbGVjdGlvbiwgQGVkaXRvciwgQHZpbVN0YXRlfSA9IHt9XG5cbiAgaW5pdDogKHtAc3RheUJ5TWFya2VyfSkgLT5cbiAgICBAcmVzZXQoKVxuXG4gIHJlc2V0OiAtPlxuICAgIEBtYXJrZXJMYXllci5jbGVhcigpXG4gICAgQG11dGF0aW9uc0J5U2VsZWN0aW9uLmNsZWFyKClcblxuICBzZXRDaGVja3BvaW50OiAoY2hlY2twb2ludCkgLT5cbiAgICBmb3Igc2VsZWN0aW9uIGluIEBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpXG4gICAgICBAc2V0Q2hlY2twb2ludEZvclNlbGVjdGlvbihzZWxlY3Rpb24sIGNoZWNrcG9pbnQpXG5cbiAgc2V0Q2hlY2twb2ludEZvclNlbGVjdGlvbjogKHNlbGVjdGlvbiwgY2hlY2twb2ludCkgLT5cbiAgICBpZiBAbXV0YXRpb25zQnlTZWxlY3Rpb24uaGFzKHNlbGVjdGlvbilcbiAgICAgICMgQ3VycmVudCBub24tZW1wdHkgc2VsZWN0aW9uIGlzIHByaW9yaXRpemVkIG92ZXIgZXhpc3RpbmcgbWFya2VyJ3MgcmFuZ2UuXG4gICAgICAjIFdlIGludmFsaWRhdGUgb2xkIG1hcmtlciB0byByZS10cmFjayBmcm9tIGN1cnJlbnQgc2VsZWN0aW9uLlxuICAgICAgcmVzZXRNYXJrZXIgPSBub3Qgc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKCkuaXNFbXB0eSgpXG4gICAgZWxzZVxuICAgICAgcmVzZXRNYXJrZXIgPSB0cnVlXG4gICAgICBpbml0aWFsUG9pbnQgPSBzd3JhcChzZWxlY3Rpb24pLmdldEJ1ZmZlclBvc2l0aW9uRm9yKCdoZWFkJywgZnJvbTogWydwcm9wZXJ0eScsICdzZWxlY3Rpb24nXSlcbiAgICAgIGlmIEBzdGF5QnlNYXJrZXJcbiAgICAgICAgaW5pdGlhbFBvaW50TWFya2VyID0gQG1hcmtlckxheWVyLm1hcmtCdWZmZXJQb3NpdGlvbihpbml0aWFsUG9pbnQsIGludmFsaWRhdGU6ICduZXZlcicpXG5cbiAgICAgIG9wdGlvbnMgPSB7c2VsZWN0aW9uLCBpbml0aWFsUG9pbnQsIGluaXRpYWxQb2ludE1hcmtlciwgY2hlY2twb2ludH1cbiAgICAgIEBtdXRhdGlvbnNCeVNlbGVjdGlvbi5zZXQoc2VsZWN0aW9uLCBuZXcgTXV0YXRpb24ob3B0aW9ucykpXG5cbiAgICBpZiByZXNldE1hcmtlclxuICAgICAgbWFya2VyID0gQG1hcmtlckxheWVyLm1hcmtCdWZmZXJSYW5nZShzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKSwgaW52YWxpZGF0ZTogJ25ldmVyJylcbiAgICBAbXV0YXRpb25zQnlTZWxlY3Rpb24uZ2V0KHNlbGVjdGlvbikudXBkYXRlKGNoZWNrcG9pbnQsIG1hcmtlciwgQHZpbVN0YXRlLm1vZGUpXG5cbiAgbWlncmF0ZU11dGF0aW9uOiAob2xkU2VsZWN0aW9uLCBuZXdTZWxlY3Rpb24pIC0+XG4gICAgbXV0YXRpb24gPSBAbXV0YXRpb25zQnlTZWxlY3Rpb24uZ2V0KG9sZFNlbGVjdGlvbilcbiAgICBAbXV0YXRpb25zQnlTZWxlY3Rpb24uZGVsZXRlKG9sZFNlbGVjdGlvbilcbiAgICBtdXRhdGlvbi5zZWxlY3Rpb24gPSBuZXdTZWxlY3Rpb25cbiAgICBAbXV0YXRpb25zQnlTZWxlY3Rpb24uc2V0KG5ld1NlbGVjdGlvbiwgbXV0YXRpb24pXG5cbiAgZ2V0TXV0YXRlZEJ1ZmZlclJhbmdlRm9yU2VsZWN0aW9uOiAoc2VsZWN0aW9uKSAtPlxuICAgIGlmIEBtdXRhdGlvbnNCeVNlbGVjdGlvbi5oYXMoc2VsZWN0aW9uKVxuICAgICAgQG11dGF0aW9uc0J5U2VsZWN0aW9uLmdldChzZWxlY3Rpb24pLm1hcmtlci5nZXRCdWZmZXJSYW5nZSgpXG5cbiAgZ2V0U2VsZWN0ZWRCdWZmZXJSYW5nZXNGb3JDaGVja3BvaW50OiAoY2hlY2twb2ludCkgLT5cbiAgICByYW5nZXMgPSBbXVxuICAgIEBtdXRhdGlvbnNCeVNlbGVjdGlvbi5mb3JFYWNoIChtdXRhdGlvbikgLT5cbiAgICAgIGlmIHJhbmdlID0gbXV0YXRpb24uYnVmZmVyUmFuZ2VCeUNoZWNrcG9pbnRbY2hlY2twb2ludF1cbiAgICAgICAgcmFuZ2VzLnB1c2gocmFuZ2UpXG4gICAgcmFuZ2VzXG5cbiAgcmVzdG9yZUN1cnNvclBvc2l0aW9uczogKHtzdGF5LCB3aXNlLCBzZXRUb0ZpcnN0Q2hhcmFjdGVyT25MaW5ld2lzZX0pIC0+XG4gICAgaWYgd2lzZSBpcyAnYmxvY2t3aXNlJ1xuICAgICAgZm9yIGJsb2Nrd2lzZVNlbGVjdGlvbiBpbiBAdmltU3RhdGUuZ2V0QmxvY2t3aXNlU2VsZWN0aW9ucygpXG4gICAgICAgIHtoZWFkLCB0YWlsfSA9IGJsb2Nrd2lzZVNlbGVjdGlvbi5nZXRQcm9wZXJ0aWVzKClcbiAgICAgICAgcG9pbnQgPSBpZiBzdGF5IHRoZW4gaGVhZCBlbHNlIFBvaW50Lm1pbihoZWFkLCB0YWlsKVxuICAgICAgICBibG9ja3dpc2VTZWxlY3Rpb24uc2V0SGVhZEJ1ZmZlclBvc2l0aW9uKHBvaW50KVxuICAgICAgICBibG9ja3dpc2VTZWxlY3Rpb24uc2tpcE5vcm1hbGl6YXRpb24oKVxuICAgIGVsc2VcbiAgICAgICMgTWFrZSBzdXJlIGRlc3Ryb3lpbmcgYWxsIHRlbXBvcmFsIHNlbGVjdGlvbiBCRUZPUkUgc3RhcnRpbmcgdG8gc2V0IGN1cnNvcnMgdG8gZmluYWwgcG9zaXRpb24uXG4gICAgICAjIFRoaXMgaXMgaW1wb3J0YW50IHRvIGF2b2lkIGRlc3Ryb3kgb3JkZXIgZGVwZW5kZW50IGJ1Z3MuXG4gICAgICBmb3Igc2VsZWN0aW9uIGluIEBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpIHdoZW4gbXV0YXRpb24gPSBAbXV0YXRpb25zQnlTZWxlY3Rpb24uZ2V0KHNlbGVjdGlvbilcbiAgICAgICAgaWYgbXV0YXRpb24uY3JlYXRlZEF0IGlzbnQgJ3dpbGwtc2VsZWN0J1xuICAgICAgICAgIHNlbGVjdGlvbi5kZXN0cm95KClcblxuICAgICAgZm9yIHNlbGVjdGlvbiBpbiBAZWRpdG9yLmdldFNlbGVjdGlvbnMoKSB3aGVuIG11dGF0aW9uID0gQG11dGF0aW9uc0J5U2VsZWN0aW9uLmdldChzZWxlY3Rpb24pXG4gICAgICAgIGlmIHN0YXlcbiAgICAgICAgICBwb2ludCA9IEBjbGlwUG9pbnQobXV0YXRpb24uZ2V0U3RheVBvc2l0aW9uKHdpc2UpKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgcG9pbnQgPSBAY2xpcFBvaW50KG11dGF0aW9uLnN0YXJ0UG9zaXRpb25PbkRpZFNlbGVjdClcbiAgICAgICAgICBpZiBzZXRUb0ZpcnN0Q2hhcmFjdGVyT25MaW5ld2lzZSBhbmQgd2lzZSBpcyAnbGluZXdpc2UnXG4gICAgICAgICAgICBwb2ludCA9IGdldEZpcnN0Q2hhcmFjdGVyUG9zaXRpb25Gb3JCdWZmZXJSb3coQGVkaXRvciwgcG9pbnQucm93KVxuICAgICAgICBzZWxlY3Rpb24uY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHBvaW50KVxuXG4gIGNsaXBQb2ludDogKHBvaW50KSAtPlxuICAgIHBvaW50LnJvdyA9IE1hdGgubWluKGdldFZpbUxhc3RCdWZmZXJSb3coQGVkaXRvciksIHBvaW50LnJvdylcbiAgICBAZWRpdG9yLmNsaXBCdWZmZXJQb3NpdGlvbihwb2ludClcblxuIyBNdXRhdGlvbiBpbmZvcm1hdGlvbiBpcyBjcmVhdGVkIGV2ZW4gaWYgc2VsZWN0aW9uLmlzRW1wdHkoKVxuIyBTbyB0aGF0IHdlIGNhbiBmaWx0ZXIgc2VsZWN0aW9uIGJ5IHdoZW4gaXQgd2FzIGNyZWF0ZWQuXG4jICBlLmcuIFNvbWUgc2VsZWN0aW9uIGlzIGNyZWF0ZWQgYXQgJ3dpbGwtc2VsZWN0JyBjaGVja3BvaW50LCBvdGhlcnMgYXQgJ2RpZC1zZWxlY3QnIG9yICdkaWQtc2VsZWN0LW9jY3VycmVuY2UnXG5jbGFzcyBNdXRhdGlvblxuICBjb25zdHJ1Y3RvcjogKG9wdGlvbnMpIC0+XG4gICAge0BzZWxlY3Rpb24sIEBpbml0aWFsUG9pbnQsIEBpbml0aWFsUG9pbnRNYXJrZXIsIGNoZWNrcG9pbnR9ID0gb3B0aW9uc1xuICAgIEBjcmVhdGVkQXQgPSBjaGVja3BvaW50XG4gICAgQGJ1ZmZlclJhbmdlQnlDaGVja3BvaW50ID0ge31cbiAgICBAbWFya2VyID0gbnVsbFxuICAgIEBzdGFydFBvc2l0aW9uT25EaWRTZWxlY3QgPSBudWxsXG5cbiAgdXBkYXRlOiAoY2hlY2twb2ludCwgbWFya2VyLCBtb2RlKSAtPlxuICAgIGlmIG1hcmtlcj9cbiAgICAgIEBtYXJrZXI/LmRlc3Ryb3koKVxuICAgICAgQG1hcmtlciA9IG1hcmtlclxuICAgIEBidWZmZXJSYW5nZUJ5Q2hlY2twb2ludFtjaGVja3BvaW50XSA9IEBtYXJrZXIuZ2V0QnVmZmVyUmFuZ2UoKVxuICAgICMgTk9URTogc3R1cGlkbHkgcmVzcGVjdCBwdXJlLVZpbSdzIGJlaGF2aW9yIHdoaWNoIGlzIGluY29uc2lzdGVudC5cbiAgICAjIE1heWJlIEknbGwgcmVtb3ZlIHRoaXMgYmxpbmRseS1mb2xsb3dpbmctdG8tcHVyZS1WaW0gY29kZS5cbiAgICAjICAtIGBWIGsgeWA6IGRvbid0IG1vdmUgY3Vyc29yXG4gICAgIyAgLSBgViBqIHlgOiBtb3ZlIGN1cm9yIHRvIHN0YXJ0IG9mIHNlbGVjdGVkIGxpbmUuKEluY29uc2lzdGVudCEpXG4gICAgaWYgY2hlY2twb2ludCBpcyAnZGlkLXNlbGVjdCdcbiAgICAgIGlmIChtb2RlIGlzICd2aXN1YWwnIGFuZCBub3QgQHNlbGVjdGlvbi5pc1JldmVyc2VkKCkpXG4gICAgICAgIGZyb20gPSBbJ3NlbGVjdGlvbiddXG4gICAgICBlbHNlXG4gICAgICAgIGZyb20gPSBbJ3Byb3BlcnR5JywgJ3NlbGVjdGlvbiddXG4gICAgICBAc3RhcnRQb3NpdGlvbk9uRGlkU2VsZWN0ID0gc3dyYXAoQHNlbGVjdGlvbikuZ2V0QnVmZmVyUG9zaXRpb25Gb3IoJ3N0YXJ0Jywge2Zyb219KVxuXG4gIGdldFN0YXlQb3NpdGlvbjogKHdpc2UpIC0+XG4gICAgcG9pbnQgPSBAaW5pdGlhbFBvaW50TWFya2VyPy5nZXRIZWFkQnVmZmVyUG9zaXRpb24oKSA/IEBpbml0aWFsUG9pbnRcbiAgICBzZWxlY3RlZFJhbmdlID0gQGJ1ZmZlclJhbmdlQnlDaGVja3BvaW50WydkaWQtc2VsZWN0LW9jY3VycmVuY2UnXSA/IEBidWZmZXJSYW5nZUJ5Q2hlY2twb2ludFsnZGlkLXNlbGVjdCddXG4gICAgaWYgc2VsZWN0ZWRSYW5nZS5pc0VxdWFsKEBtYXJrZXIuZ2V0QnVmZmVyUmFuZ2UoKSkgIyBDaGVjayBpZiBuZWVkIENsaXBcbiAgICAgIHBvaW50XG4gICAgZWxzZVxuICAgICAge3N0YXJ0LCBlbmR9ID0gQG1hcmtlci5nZXRCdWZmZXJSYW5nZSgpXG4gICAgICBlbmQgPSBQb2ludC5tYXgoc3RhcnQsIGVuZC50cmFuc2xhdGUoWzAsIC0xXSkpXG4gICAgICBpZiB3aXNlIGlzICdsaW5ld2lzZSdcbiAgICAgICAgcG9pbnQucm93ID0gTWF0aC5taW4oZW5kLnJvdywgcG9pbnQucm93KVxuICAgICAgICBwb2ludFxuICAgICAgZWxzZVxuICAgICAgICBQb2ludC5taW4oZW5kLCBwb2ludClcbiJdfQ==
