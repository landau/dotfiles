(function() {
  var CompositeDisposable, Mutation, MutationManager, Point, getFirstCharacterPositionForBufferRow, getValidVimBufferRow, ref, ref1, swrap;

  ref = require('atom'), Point = ref.Point, CompositeDisposable = ref.CompositeDisposable;

  ref1 = require('./utils'), getFirstCharacterPositionForBufferRow = ref1.getFirstCharacterPositionForBufferRow, getValidVimBufferRow = ref1.getValidVimBufferRow;

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
      var initialPoint, options;
      if (this.mutationsBySelection.has(selection)) {
        return this.mutationsBySelection.get(selection).update(checkpoint);
      } else {
        initialPoint = swrap(selection).getBufferPositionFor('head', {
          from: ['property', 'selection']
        });
        options = {
          selection: selection,
          initialPoint: initialPoint,
          checkpoint: checkpoint,
          markerLayer: this.markerLayer,
          stayByMarker: this.stayByMarker,
          vimState: this.vimState
        };
        return this.mutationsBySelection.set(selection, new Mutation(options));
      }
    };

    MutationManager.prototype.getMutatedBufferRange = function(selection) {
      var marker, ref2;
      if (marker = (ref2 = this.getMutationForSelection(selection)) != null ? ref2.marker : void 0) {
        return marker.getBufferRange();
      }
    };

    MutationManager.prototype.getMutationForSelection = function(selection) {
      return this.mutationsBySelection.get(selection);
    };

    MutationManager.prototype.getBufferRangesForCheckpoint = function(checkpoint) {
      var ranges;
      ranges = [];
      this.mutationsBySelection.forEach(function(mutation) {
        var range;
        if (range = mutation.getBufferRangeForCheckpoint(checkpoint)) {
          return ranges.push(range);
        }
      });
      return ranges;
    };

    MutationManager.prototype.restoreCursorPositions = function(options) {
      var blockwiseSelection, head, i, j, len, len1, mutation, occurrenceSelected, point, ref2, ref3, ref4, results, results1, selection, setToFirstCharacterOnLinewise, stay, tail, wise;
      stay = options.stay, wise = options.wise, occurrenceSelected = options.occurrenceSelected, setToFirstCharacterOnLinewise = options.setToFirstCharacterOnLinewise;
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
        results1 = [];
        for (j = 0, len1 = ref4.length; j < len1; j++) {
          selection = ref4[j];
          if (!(mutation = this.mutationsBySelection.get(selection))) {
            continue;
          }
          if (occurrenceSelected && !mutation.isCreatedAt('will-select')) {
            selection.destroy();
          }
          if (occurrenceSelected && stay) {
            point = this.clipToMutationEndIfSomeMutationContainsPoint(this.vimState.getOriginalCursorPosition());
            results1.push(selection.cursor.setBufferPosition(point));
          } else if (point = mutation.getRestorePoint({
            stay: stay,
            wise: wise
          })) {
            if ((!stay) && setToFirstCharacterOnLinewise && (wise === 'linewise')) {
              point = getFirstCharacterPositionForBufferRow(this.editor, point.row);
            }
            results1.push(selection.cursor.setBufferPosition(point));
          } else {
            results1.push(void 0);
          }
        }
        return results1;
      }
    };

    MutationManager.prototype.clipToMutationEndIfSomeMutationContainsPoint = function(point) {
      var mutation;
      if (mutation = this.findMutationContainsPointAtCheckpoint(point, 'did-select-occurrence')) {
        return Point.min(mutation.getEndBufferPosition(), point);
      } else {
        return point;
      }
    };

    MutationManager.prototype.findMutationContainsPointAtCheckpoint = function(point, checkpoint) {
      var entry, iterator, mutation;
      iterator = this.mutationsBySelection.values();
      while ((entry = iterator.next()) && !entry.done) {
        mutation = entry.value;
        if (mutation.getBufferRangeForCheckpoint(checkpoint).containsPoint(point)) {
          return mutation;
        }
      }
    };

    return MutationManager;

  })();

  Mutation = (function() {
    function Mutation(options) {
      var checkpoint;
      this.selection = options.selection, this.initialPoint = options.initialPoint, checkpoint = options.checkpoint, this.markerLayer = options.markerLayer, this.stayByMarker = options.stayByMarker, this.vimState = options.vimState;
      this.createdAt = checkpoint;
      if (this.stayByMarker) {
        this.initialPointMarker = this.markerLayer.markBufferPosition(this.initialPoint, {
          invalidate: 'never'
        });
      }
      this.bufferRangeByCheckpoint = {};
      this.marker = null;
      this.update(checkpoint);
    }

    Mutation.prototype.isCreatedAt = function(timing) {
      return this.createdAt === timing;
    };

    Mutation.prototype.update = function(checkpoint) {
      var ref2;
      if (!this.selection.getBufferRange().isEmpty()) {
        if ((ref2 = this.marker) != null) {
          ref2.destroy();
        }
        this.marker = null;
      }
      if (this.marker == null) {
        this.marker = this.markerLayer.markBufferRange(this.selection.getBufferRange(), {
          invalidate: 'never'
        });
      }
      return this.bufferRangeByCheckpoint[checkpoint] = this.marker.getBufferRange();
    };

    Mutation.prototype.getStartBufferPosition = function() {
      return this.marker.getBufferRange().start;
    };

    Mutation.prototype.getEndBufferPosition = function() {
      var end, point, ref2, start;
      ref2 = this.marker.getBufferRange(), start = ref2.start, end = ref2.end;
      point = Point.max(start, end.translate([0, -1]));
      return this.selection.editor.clipBufferPosition(point);
    };

    Mutation.prototype.getInitialPoint = function(arg) {
      var clip, point, ref2, ref3, ref4, ref5, wise;
      ref2 = arg != null ? arg : {}, clip = ref2.clip, wise = ref2.wise;
      point = (ref3 = (ref4 = this.initialPointMarker) != null ? ref4.getHeadBufferPosition() : void 0) != null ? ref3 : this.initialPoint;
      if (clip == null) {
        clip = !((ref5 = this.getBufferRangeForCheckpoint('did-select')) != null ? ref5.isEqual(this.marker.getBufferRange()) : void 0);
      }
      if (clip) {
        if (wise === 'linewise') {
          return Point.min([this.getEndBufferPosition().row, point.column], point);
        } else {
          return Point.min(this.getEndBufferPosition(), point);
        }
      } else {
        return point;
      }
    };

    Mutation.prototype.getBufferRangeForCheckpoint = function(checkpoint) {
      return this.bufferRangeByCheckpoint[checkpoint];
    };

    Mutation.prototype.getRestorePoint = function(arg) {
      var mode, point, ref2, ref3, ref4, stay, submode, wise;
      ref2 = arg != null ? arg : {}, stay = ref2.stay, wise = ref2.wise;
      if (stay) {
        point = this.getInitialPoint({
          wise: wise
        });
      } else {
        ref3 = this.vimState, mode = ref3.mode, submode = ref3.submode;
        if ((mode !== 'visual') || (submode === 'linewise' && this.selection.isReversed())) {
          point = swrap(this.selection).getBufferPositionFor('start', {
            from: ['property']
          });
        }
        point = point != null ? point : (ref4 = this.bufferRangeByCheckpoint['did-select']) != null ? ref4.start : void 0;
      }
      if (point != null) {
        point.row = getValidVimBufferRow(this.selection.editor, point.row);
      }
      return point;
    };

    return Mutation;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvbXV0YXRpb24tbWFuYWdlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLE1BQStCLE9BQUEsQ0FBUSxNQUFSLENBQS9CLEVBQUMsaUJBQUQsRUFBUTs7RUFDUixPQUFnRSxPQUFBLENBQVEsU0FBUixDQUFoRSxFQUFDLGtGQUFELEVBQXdDOztFQUN4QyxLQUFBLEdBQVEsT0FBQSxDQUFRLHFCQUFSOztFQWFSLE1BQU0sQ0FBQyxPQUFQLEdBQ007SUFDUyx5QkFBQyxRQUFEO01BQUMsSUFBQyxDQUFBLFdBQUQ7TUFDWCxJQUFDLENBQUEsU0FBVSxJQUFDLENBQUEsU0FBWDtNQUVGLElBQUMsQ0FBQSxXQUFELEdBQWUsSUFBSTtNQUNuQixJQUFDLENBQUEsV0FBVyxDQUFDLEdBQWIsQ0FBaUIsSUFBQyxDQUFBLFFBQVEsQ0FBQyxZQUFWLENBQXVCLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFjLElBQWQsQ0FBdkIsQ0FBakI7TUFFQSxJQUFDLENBQUEsV0FBRCxHQUFlLElBQUMsQ0FBQSxNQUFNLENBQUMsY0FBUixDQUFBO01BQ2YsSUFBQyxDQUFBLG9CQUFELEdBQXdCLElBQUk7SUFQakI7OzhCQVNiLE9BQUEsR0FBUyxTQUFBO0FBQ1AsVUFBQTtNQUFBLElBQUMsQ0FBQSxLQUFELENBQUE7YUFDQSxPQUE4QyxFQUE5QyxFQUFDLElBQUMsQ0FBQSw0QkFBQSxvQkFBRixFQUF3QixJQUFDLENBQUEsY0FBQSxNQUF6QixFQUFpQyxJQUFDLENBQUEsZ0JBQUEsUUFBbEMsRUFBQTtJQUZPOzs4QkFJVCxJQUFBLEdBQU0sU0FBQyxHQUFEO01BQUUsSUFBQyxDQUFBLGVBQUYsSUFBRTthQUNQLElBQUMsQ0FBQSxLQUFELENBQUE7SUFESTs7OEJBR04sS0FBQSxH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LElBQUMsQ0FBQSxRQUFuQixFQUFDLGdCQUFELEVBQU87UUFDUCxJQUFHLENBQUMsSUFBQSxLQUFVLFFBQVgsQ0FBQSxJQUF3QixDQUFDLE9BQUEsS0FBVyxVQUFYLElBQTBCLElBQUMsQ0FBQSxTQUFTLENBQUMsVUFBWCxDQUFBLENBQTNCLENBQTNCO1VBQ0UsS0FBQSxHQUFRLEtBQUEsQ0FBTSxJQUFDLENBQUEsU0FBUCxDQUFpQixDQUFDLG9CQUFsQixDQUF1QyxPQUF2QyxFQUFnRDtZQUFBLElBQUEsRUFBTSxDQUFDLFVBQUQsQ0FBTjtXQUFoRCxFQURWOztRQUVBLEtBQUEsbUJBQVEsMEVBQThDLENBQUUsZUFOMUQ7O01BUUEsSUFBRyxhQUFIO1FBQ0UsS0FBSyxDQUFDLEdBQU4sR0FBWSxvQkFBQSxDQUFxQixJQUFDLENBQUEsU0FBUyxDQUFDLE1BQWhDLEVBQXdDLEtBQUssQ0FBQyxHQUE5QyxFQURkOzthQUVBO0lBWGU7Ozs7O0FBcEpuQiIsInNvdXJjZXNDb250ZW50IjpbIntQb2ludCwgQ29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlICdhdG9tJ1xue2dldEZpcnN0Q2hhcmFjdGVyUG9zaXRpb25Gb3JCdWZmZXJSb3csIGdldFZhbGlkVmltQnVmZmVyUm93fSA9IHJlcXVpcmUgJy4vdXRpbHMnXG5zd3JhcCA9IHJlcXVpcmUgJy4vc2VsZWN0aW9uLXdyYXBwZXInXG5cbiMga2VlcCBtdXRhdGlvbiBzbmFwc2hvdCBuZWNlc3NhcnkgZm9yIE9wZXJhdG9yIHByb2Nlc3NpbmcuXG4jIG11dGF0aW9uIHN0b3JlZCBieSBlYWNoIFNlbGVjdGlvbiBoYXZlIGZvbGxvd2luZyBmaWVsZFxuIyAgbWFya2VyOlxuIyAgICBtYXJrZXIgdG8gdHJhY2sgbXV0YXRpb24uIG1hcmtlciBpcyBjcmVhdGVkIHdoZW4gYHNldENoZWNrcG9pbnRgXG4jICBjcmVhdGVkQXQ6XG4jICAgICdzdHJpbmcnIHJlcHJlc2VudGluZyB3aGVuIG1hcmtlciB3YXMgY3JlYXRlZC5cbiMgIGNoZWNrcG9pbnQ6IHt9XG4jICAgIGtleSBpcyBbJ3dpbGwtc2VsZWN0JywgJ2RpZC1zZWxlY3QnLCAnd2lsbC1tdXRhdGUnLCAnZGlkLW11dGF0ZSddXG4jICAgIGtleSBpcyBjaGVja3BvaW50LCB2YWx1ZSBpcyBidWZmZXJSYW5nZSBmb3IgbWFya2VyIGF0IHRoYXQgY2hlY2twb2ludFxuIyAgc2VsZWN0aW9uOlxuIyAgICBTZWxlY3Rpb24gYmVlaW5nIHRyYWNrZWRcbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIE11dGF0aW9uTWFuYWdlclxuICBjb25zdHJ1Y3RvcjogKEB2aW1TdGF0ZSkgLT5cbiAgICB7QGVkaXRvcn0gPSBAdmltU3RhdGVcblxuICAgIEBkaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG4gICAgQGRpc3Bvc2FibGVzLmFkZCBAdmltU3RhdGUub25EaWREZXN0cm95KEBkZXN0cm95LmJpbmQodGhpcykpXG5cbiAgICBAbWFya2VyTGF5ZXIgPSBAZWRpdG9yLmFkZE1hcmtlckxheWVyKClcbiAgICBAbXV0YXRpb25zQnlTZWxlY3Rpb24gPSBuZXcgTWFwXG5cbiAgZGVzdHJveTogLT5cbiAgICBAcmVzZXQoKVxuICAgIHtAbXV0YXRpb25zQnlTZWxlY3Rpb24sIEBlZGl0b3IsIEB2aW1TdGF0ZX0gPSB7fVxuXG4gIGluaXQ6ICh7QHN0YXlCeU1hcmtlcn0pIC0+XG4gICAgQHJlc2V0KClcblxuICByZXNldDogLT5cbiAgICBAbWFya2VyTGF5ZXIuY2xlYXIoKVxuICAgIEBtdXRhdGlvbnNCeVNlbGVjdGlvbi5jbGVhcigpXG5cbiAgc2V0Q2hlY2twb2ludDogKGNoZWNrcG9pbnQpIC0+XG4gICAgZm9yIHNlbGVjdGlvbiBpbiBAZWRpdG9yLmdldFNlbGVjdGlvbnMoKVxuICAgICAgQHNldENoZWNrcG9pbnRGb3JTZWxlY3Rpb24oc2VsZWN0aW9uLCBjaGVja3BvaW50KVxuXG4gIHNldENoZWNrcG9pbnRGb3JTZWxlY3Rpb246IChzZWxlY3Rpb24sIGNoZWNrcG9pbnQpIC0+XG4gICAgaWYgQG11dGF0aW9uc0J5U2VsZWN0aW9uLmhhcyhzZWxlY3Rpb24pXG4gICAgICBAbXV0YXRpb25zQnlTZWxlY3Rpb24uZ2V0KHNlbGVjdGlvbikudXBkYXRlKGNoZWNrcG9pbnQpXG4gICAgZWxzZVxuICAgICAgaW5pdGlhbFBvaW50ID0gc3dyYXAoc2VsZWN0aW9uKS5nZXRCdWZmZXJQb3NpdGlvbkZvcignaGVhZCcsIGZyb206IFsncHJvcGVydHknLCAnc2VsZWN0aW9uJ10pXG4gICAgICBvcHRpb25zID0ge3NlbGVjdGlvbiwgaW5pdGlhbFBvaW50LCBjaGVja3BvaW50LCBAbWFya2VyTGF5ZXIsIEBzdGF5QnlNYXJrZXIsIEB2aW1TdGF0ZX1cbiAgICAgIEBtdXRhdGlvbnNCeVNlbGVjdGlvbi5zZXQoc2VsZWN0aW9uLCBuZXcgTXV0YXRpb24ob3B0aW9ucykpXG5cbiAgZ2V0TXV0YXRlZEJ1ZmZlclJhbmdlOiAoc2VsZWN0aW9uKSAtPlxuICAgIGlmIG1hcmtlciA9IEBnZXRNdXRhdGlvbkZvclNlbGVjdGlvbihzZWxlY3Rpb24pPy5tYXJrZXJcbiAgICAgIG1hcmtlci5nZXRCdWZmZXJSYW5nZSgpXG5cbiAgZ2V0TXV0YXRpb25Gb3JTZWxlY3Rpb246IChzZWxlY3Rpb24pIC0+XG4gICAgQG11dGF0aW9uc0J5U2VsZWN0aW9uLmdldChzZWxlY3Rpb24pXG5cbiAgZ2V0QnVmZmVyUmFuZ2VzRm9yQ2hlY2twb2ludDogKGNoZWNrcG9pbnQpIC0+XG4gICAgcmFuZ2VzID0gW11cbiAgICBAbXV0YXRpb25zQnlTZWxlY3Rpb24uZm9yRWFjaCAobXV0YXRpb24pIC0+XG4gICAgICBpZiByYW5nZSA9IG11dGF0aW9uLmdldEJ1ZmZlclJhbmdlRm9yQ2hlY2twb2ludChjaGVja3BvaW50KVxuICAgICAgICByYW5nZXMucHVzaChyYW5nZSlcbiAgICByYW5nZXNcblxuICByZXN0b3JlQ3Vyc29yUG9zaXRpb25zOiAob3B0aW9ucykgLT5cbiAgICB7c3RheSwgd2lzZSwgb2NjdXJyZW5jZVNlbGVjdGVkLCBzZXRUb0ZpcnN0Q2hhcmFjdGVyT25MaW5ld2lzZX0gPSBvcHRpb25zXG4gICAgaWYgd2lzZSBpcyAnYmxvY2t3aXNlJ1xuICAgICAgZm9yIGJsb2Nrd2lzZVNlbGVjdGlvbiBpbiBAdmltU3RhdGUuZ2V0QmxvY2t3aXNlU2VsZWN0aW9ucygpXG4gICAgICAgIHtoZWFkLCB0YWlsfSA9IGJsb2Nrd2lzZVNlbGVjdGlvbi5nZXRQcm9wZXJ0aWVzKClcbiAgICAgICAgcG9pbnQgPSBpZiBzdGF5IHRoZW4gaGVhZCBlbHNlIFBvaW50Lm1pbihoZWFkLCB0YWlsKVxuICAgICAgICBibG9ja3dpc2VTZWxlY3Rpb24uc2V0SGVhZEJ1ZmZlclBvc2l0aW9uKHBvaW50KVxuICAgICAgICBibG9ja3dpc2VTZWxlY3Rpb24uc2tpcE5vcm1hbGl6YXRpb24oKVxuICAgIGVsc2VcbiAgICAgIGZvciBzZWxlY3Rpb24gaW4gQGVkaXRvci5nZXRTZWxlY3Rpb25zKCkgd2hlbiBtdXRhdGlvbiA9IEBtdXRhdGlvbnNCeVNlbGVjdGlvbi5nZXQoc2VsZWN0aW9uKVxuICAgICAgICBpZiBvY2N1cnJlbmNlU2VsZWN0ZWQgYW5kIG5vdCBtdXRhdGlvbi5pc0NyZWF0ZWRBdCgnd2lsbC1zZWxlY3QnKVxuICAgICAgICAgIHNlbGVjdGlvbi5kZXN0cm95KClcblxuICAgICAgICBpZiBvY2N1cnJlbmNlU2VsZWN0ZWQgYW5kIHN0YXlcbiAgICAgICAgICAjIFRoaXMgaXMgZXNzZW5jaWFsbHkgdG8gY2xpcFRvTXV0YXRpb25FbmQgd2hlbiBgZCBvIGZgLCBgZCBvIHBgIGNhc2UuXG4gICAgICAgICAgcG9pbnQgPSBAY2xpcFRvTXV0YXRpb25FbmRJZlNvbWVNdXRhdGlvbkNvbnRhaW5zUG9pbnQoQHZpbVN0YXRlLmdldE9yaWdpbmFsQ3Vyc29yUG9zaXRpb24oKSlcbiAgICAgICAgICBzZWxlY3Rpb24uY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHBvaW50KVxuICAgICAgICBlbHNlIGlmIHBvaW50ID0gbXV0YXRpb24uZ2V0UmVzdG9yZVBvaW50KHtzdGF5LCB3aXNlfSlcbiAgICAgICAgICBpZiAobm90IHN0YXkpIGFuZCBzZXRUb0ZpcnN0Q2hhcmFjdGVyT25MaW5ld2lzZSBhbmQgKHdpc2UgaXMgJ2xpbmV3aXNlJylcbiAgICAgICAgICAgIHBvaW50ID0gZ2V0Rmlyc3RDaGFyYWN0ZXJQb3NpdGlvbkZvckJ1ZmZlclJvdyhAZWRpdG9yLCBwb2ludC5yb3cpXG4gICAgICAgICAgc2VsZWN0aW9uLmN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihwb2ludClcblxuICBjbGlwVG9NdXRhdGlvbkVuZElmU29tZU11dGF0aW9uQ29udGFpbnNQb2ludDogKHBvaW50KSAtPlxuICAgIGlmIG11dGF0aW9uID0gQGZpbmRNdXRhdGlvbkNvbnRhaW5zUG9pbnRBdENoZWNrcG9pbnQocG9pbnQsICdkaWQtc2VsZWN0LW9jY3VycmVuY2UnKVxuICAgICAgUG9pbnQubWluKG11dGF0aW9uLmdldEVuZEJ1ZmZlclBvc2l0aW9uKCksIHBvaW50KVxuICAgIGVsc2VcbiAgICAgIHBvaW50XG5cbiAgZmluZE11dGF0aW9uQ29udGFpbnNQb2ludEF0Q2hlY2twb2ludDogKHBvaW50LCBjaGVja3BvaW50KSAtPlxuICAgICMgQ29mZmVlc2NyaXB0IGNhbm5vdCBpdGVyYXRlIG92ZXIgaXRlcmF0b3IgYnkgSmF2YVNjcmlwdCdzICdvZicgYmVjYXVzZSBvZiBzeW50YXggY29uZmxpY3RzLlxuICAgIGl0ZXJhdG9yID0gQG11dGF0aW9uc0J5U2VsZWN0aW9uLnZhbHVlcygpXG4gICAgd2hpbGUgKGVudHJ5ID0gaXRlcmF0b3IubmV4dCgpKSBhbmQgbm90IGVudHJ5LmRvbmVcbiAgICAgIG11dGF0aW9uID0gZW50cnkudmFsdWVcbiAgICAgIGlmIG11dGF0aW9uLmdldEJ1ZmZlclJhbmdlRm9yQ2hlY2twb2ludChjaGVja3BvaW50KS5jb250YWluc1BvaW50KHBvaW50KVxuICAgICAgICByZXR1cm4gbXV0YXRpb25cblxuIyBNdXRhdGlvbiBpbmZvcm1hdGlvbiBpcyBjcmVhdGVkIGV2ZW4gaWYgc2VsZWN0aW9uLmlzRW1wdHkoKVxuIyBTbyB0aGF0IHdlIGNhbiBmaWx0ZXIgc2VsZWN0aW9uIGJ5IHdoZW4gaXQgd2FzIGNyZWF0ZWQuXG4jICBlLmcuIFNvbWUgc2VsZWN0aW9uIGlzIGNyZWF0ZWQgYXQgJ3dpbGwtc2VsZWN0JyBjaGVja3BvaW50LCBvdGhlcnMgYXQgJ2RpZC1zZWxlY3QnIG9yICdkaWQtc2VsZWN0LW9jY3VycmVuY2UnXG5jbGFzcyBNdXRhdGlvblxuICBjb25zdHJ1Y3RvcjogKG9wdGlvbnMpIC0+XG4gICAge0BzZWxlY3Rpb24sIEBpbml0aWFsUG9pbnQsIGNoZWNrcG9pbnQsIEBtYXJrZXJMYXllciwgQHN0YXlCeU1hcmtlciwgQHZpbVN0YXRlfSA9IG9wdGlvbnNcblxuICAgIEBjcmVhdGVkQXQgPSBjaGVja3BvaW50XG4gICAgaWYgQHN0YXlCeU1hcmtlclxuICAgICAgQGluaXRpYWxQb2ludE1hcmtlciA9IEBtYXJrZXJMYXllci5tYXJrQnVmZmVyUG9zaXRpb24oQGluaXRpYWxQb2ludCwgaW52YWxpZGF0ZTogJ25ldmVyJylcbiAgICBAYnVmZmVyUmFuZ2VCeUNoZWNrcG9pbnQgPSB7fVxuICAgIEBtYXJrZXIgPSBudWxsXG4gICAgQHVwZGF0ZShjaGVja3BvaW50KVxuXG4gIGlzQ3JlYXRlZEF0OiAodGltaW5nKSAtPlxuICAgIEBjcmVhdGVkQXQgaXMgdGltaW5nXG5cbiAgdXBkYXRlOiAoY2hlY2twb2ludCkgLT5cbiAgICAjIEN1cnJlbnQgbm9uLWVtcHR5IHNlbGVjdGlvbiBpcyBwcmlvcml0aXplZCBvdmVyIGV4aXN0aW5nIG1hcmtlcidzIHJhbmdlLlxuICAgICMgV2UgaW52YWxpZGF0ZSBvbGQgbWFya2VyIHRvIHJlLXRyYWNrIGZyb20gY3VycmVudCBzZWxlY3Rpb24uXG4gICAgdW5sZXNzIEBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKS5pc0VtcHR5KClcbiAgICAgIEBtYXJrZXI/LmRlc3Ryb3koKVxuICAgICAgQG1hcmtlciA9IG51bGxcblxuICAgIEBtYXJrZXIgPz0gQG1hcmtlckxheWVyLm1hcmtCdWZmZXJSYW5nZShAc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKCksIGludmFsaWRhdGU6ICduZXZlcicpXG4gICAgQGJ1ZmZlclJhbmdlQnlDaGVja3BvaW50W2NoZWNrcG9pbnRdID0gQG1hcmtlci5nZXRCdWZmZXJSYW5nZSgpXG5cbiAgZ2V0U3RhcnRCdWZmZXJQb3NpdGlvbjogLT5cbiAgICBAbWFya2VyLmdldEJ1ZmZlclJhbmdlKCkuc3RhcnRcblxuICBnZXRFbmRCdWZmZXJQb3NpdGlvbjogLT5cbiAgICB7c3RhcnQsIGVuZH0gPSBAbWFya2VyLmdldEJ1ZmZlclJhbmdlKClcbiAgICBwb2ludCA9IFBvaW50Lm1heChzdGFydCwgZW5kLnRyYW5zbGF0ZShbMCwgLTFdKSlcbiAgICBAc2VsZWN0aW9uLmVkaXRvci5jbGlwQnVmZmVyUG9zaXRpb24ocG9pbnQpXG5cbiAgZ2V0SW5pdGlhbFBvaW50OiAoe2NsaXAsIHdpc2V9PXt9KSAtPlxuICAgIHBvaW50ID0gQGluaXRpYWxQb2ludE1hcmtlcj8uZ2V0SGVhZEJ1ZmZlclBvc2l0aW9uKCkgPyBAaW5pdGlhbFBvaW50XG4gICAgY2xpcCA/PSBub3QgQGdldEJ1ZmZlclJhbmdlRm9yQ2hlY2twb2ludCgnZGlkLXNlbGVjdCcpPy5pc0VxdWFsKEBtYXJrZXIuZ2V0QnVmZmVyUmFuZ2UoKSlcbiAgICBpZiBjbGlwXG4gICAgICBpZiB3aXNlIGlzICdsaW5ld2lzZSdcbiAgICAgICAgUG9pbnQubWluKFtAZ2V0RW5kQnVmZmVyUG9zaXRpb24oKS5yb3csIHBvaW50LmNvbHVtbl0sIHBvaW50KVxuICAgICAgZWxzZVxuICAgICAgICBQb2ludC5taW4oQGdldEVuZEJ1ZmZlclBvc2l0aW9uKCksIHBvaW50KVxuICAgIGVsc2VcbiAgICAgIHBvaW50XG5cbiAgZ2V0QnVmZmVyUmFuZ2VGb3JDaGVja3BvaW50OiAoY2hlY2twb2ludCkgLT5cbiAgICBAYnVmZmVyUmFuZ2VCeUNoZWNrcG9pbnRbY2hlY2twb2ludF1cblxuICBnZXRSZXN0b3JlUG9pbnQ6ICh7c3RheSwgd2lzZX09e30pIC0+XG4gICAgaWYgc3RheVxuICAgICAgcG9pbnQgPSBAZ2V0SW5pdGlhbFBvaW50KHt3aXNlfSlcbiAgICBlbHNlXG4gICAgICB7bW9kZSwgc3VibW9kZX0gPSBAdmltU3RhdGVcbiAgICAgIGlmIChtb2RlIGlzbnQgJ3Zpc3VhbCcpIG9yIChzdWJtb2RlIGlzICdsaW5ld2lzZScgYW5kIEBzZWxlY3Rpb24uaXNSZXZlcnNlZCgpKVxuICAgICAgICBwb2ludCA9IHN3cmFwKEBzZWxlY3Rpb24pLmdldEJ1ZmZlclBvc2l0aW9uRm9yKCdzdGFydCcsIGZyb206IFsncHJvcGVydHknXSlcbiAgICAgIHBvaW50ID0gcG9pbnQgPyBAYnVmZmVyUmFuZ2VCeUNoZWNrcG9pbnRbJ2RpZC1zZWxlY3QnXT8uc3RhcnRcblxuICAgIGlmIHBvaW50P1xuICAgICAgcG9pbnQucm93ID0gZ2V0VmFsaWRWaW1CdWZmZXJSb3coQHNlbGVjdGlvbi5lZGl0b3IsIHBvaW50LnJvdylcbiAgICBwb2ludFxuIl19
