(function() {
  var Mutation, MutationManager, Point,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Point = require('atom').Point;

  module.exports = MutationManager = (function() {
    function MutationManager(vimState) {
      var ref;
      this.vimState = vimState;
      this.destroy = bind(this.destroy, this);
      ref = this.vimState, this.editor = ref.editor, this.swrap = ref.swrap;
      this.vimState.onDidDestroy(this.destroy);
      this.markerLayer = this.editor.addMarkerLayer();
      this.mutationsBySelection = new Map;
    }

    MutationManager.prototype.destroy = function() {
      this.markerLayer.destroy();
      return this.mutationsBySelection.clear();
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
      var i, len, ref, results, selection;
      ref = this.editor.getSelections();
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        selection = ref[i];
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
        initialPoint = this.swrap(selection).getBufferPositionFor('head', {
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
          checkpoint: checkpoint,
          swrap: this.swrap
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
      var blockwiseSelection, head, i, j, k, len, len1, len2, mutation, point, ref, ref1, ref2, ref3, results, results1, selection, setToFirstCharacterOnLinewise, stay, tail, wise;
      stay = arg.stay, wise = arg.wise, setToFirstCharacterOnLinewise = arg.setToFirstCharacterOnLinewise;
      if (wise === 'blockwise') {
        ref = this.vimState.getBlockwiseSelections();
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          blockwiseSelection = ref[i];
          ref1 = blockwiseSelection.getProperties(), head = ref1.head, tail = ref1.tail;
          point = stay ? head : Point.min(head, tail);
          blockwiseSelection.setHeadBufferPosition(point);
          results.push(blockwiseSelection.skipNormalization());
        }
        return results;
      } else {
        ref2 = this.editor.getSelections();
        for (j = 0, len1 = ref2.length; j < len1; j++) {
          selection = ref2[j];
          if (mutation = this.mutationsBySelection.get(selection)) {
            if (mutation.createdAt !== 'will-select') {
              selection.destroy();
            }
          }
        }
        ref3 = this.editor.getSelections();
        results1 = [];
        for (k = 0, len2 = ref3.length; k < len2; k++) {
          selection = ref3[k];
          if (!(mutation = this.mutationsBySelection.get(selection))) {
            continue;
          }
          if (stay) {
            point = this.clipPoint(mutation.getStayPosition(wise));
          } else {
            point = this.clipPoint(mutation.startPositionOnDidSelect);
            if (setToFirstCharacterOnLinewise && wise === 'linewise') {
              point = this.vimState.utils.getFirstCharacterPositionForBufferRow(this.editor, point.row);
            }
          }
          results1.push(selection.cursor.setBufferPosition(point));
        }
        return results1;
      }
    };

    MutationManager.prototype.clipPoint = function(point) {
      point.row = Math.min(this.vimState.utils.getVimLastBufferRow(this.editor), point.row);
      return this.editor.clipBufferPosition(point);
    };

    return MutationManager;

  })();

  Mutation = (function() {
    function Mutation(options) {
      var checkpoint;
      this.selection = options.selection, this.initialPoint = options.initialPoint, this.initialPointMarker = options.initialPointMarker, checkpoint = options.checkpoint, this.swrap = options.swrap;
      this.createdAt = checkpoint;
      this.bufferRangeByCheckpoint = {};
      this.marker = null;
      this.startPositionOnDidSelect = null;
    }

    Mutation.prototype.update = function(checkpoint, marker, mode) {
      var from, ref;
      if (marker != null) {
        if ((ref = this.marker) != null) {
          ref.destroy();
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
        return this.startPositionOnDidSelect = this.swrap(this.selection).getBufferPositionFor('start', {
          from: from
        });
      }
    };

    Mutation.prototype.getStayPosition = function(wise) {
      var end, point, ref, ref1, ref2, ref3, selectedRange, start;
      point = (ref = (ref1 = this.initialPointMarker) != null ? ref1.getHeadBufferPosition() : void 0) != null ? ref : this.initialPoint;
      selectedRange = (ref2 = this.bufferRangeByCheckpoint['did-select-occurrence']) != null ? ref2 : this.bufferRangeByCheckpoint['did-select'];
      if (selectedRange.isEqual(this.marker.getBufferRange())) {
        return point;
      } else {
        ref3 = this.marker.getBufferRange(), start = ref3.start, end = ref3.end;
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvbXV0YXRpb24tbWFuYWdlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLGdDQUFBO0lBQUE7O0VBQUMsUUFBUyxPQUFBLENBQVEsTUFBUjs7RUFFVixNQUFNLENBQUMsT0FBUCxHQUNNO0lBQ1MseUJBQUMsUUFBRDtBQUNYLFVBQUE7TUFEWSxJQUFDLENBQUEsV0FBRDs7TUFDWixNQUFvQixJQUFDLENBQUEsUUFBckIsRUFBQyxJQUFDLENBQUEsYUFBQSxNQUFGLEVBQVUsSUFBQyxDQUFBLFlBQUE7TUFDWCxJQUFDLENBQUEsUUFBUSxDQUFDLFlBQVYsQ0FBdUIsSUFBQyxDQUFBLE9BQXhCO01BRUEsSUFBQyxDQUFBLFdBQUQsR0FBZSxJQUFDLENBQUEsTUFBTSxDQUFDLGNBQVIsQ0FBQTtNQUNmLElBQUMsQ0FBQSxvQkFBRCxHQUF3QixJQUFJO0lBTGpCOzs4QkFPYixPQUFBLEdBQVMsU0FBQTtNQUNQLElBQUMsQ0FBQSxXQUFXLENBQUMsT0FBYixDQUFBO2FBQ0EsSUFBQyxDQUFBLG9CQUFvQixDQUFDLEtBQXRCLENBQUE7SUFGTzs7OEJBSVQsSUFBQSxHQUFNLFNBQUMsR0FBRDtNQUFFLElBQUMsQ0FBQSxlQUFGLElBQUU7YUFDUCxJQUFDLENBQUEsS0FBRCxDQUFBO0lBREk7OzhCQUdOLEtBQUEsR0FBTyxTQUFBO01BQ0wsSUFBQyxDQUFBLFdBQVcsQ0FBQyxLQUFiLENBQUE7YUFDQSxJQUFDLENBQUEsb0JBQW9CLENBQUMsS0FBdEIsQ0FBQTtJQUZLOzs4QkFJUCxhQUFBLEdBQWUsU0FBQyxVQUFEO0FBQ2IsVUFBQTtBQUFBO0FBQUE7V0FBQSxxQ0FBQTs7cUJBQ0UsSUFBQyxDQUFBLHlCQUFELENBQTJCLFNBQTNCLEVBQXNDLFVBQXRDO0FBREY7O0lBRGE7OzhC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dEIsQ0FBSDtlQUNFLE1BREY7T0FBQSxNQUFBO1FBR0UsT0FBZSxJQUFDLENBQUEsTUFBTSxDQUFDLGNBQVIsQ0FBQSxDQUFmLEVBQUMsa0JBQUQsRUFBUTtRQUNSLEdBQUEsR0FBTSxLQUFLLENBQUMsR0FBTixDQUFVLEtBQVYsRUFBaUIsR0FBRyxDQUFDLFNBQUosQ0FBYyxDQUFDLENBQUQsRUFBSSxDQUFDLENBQUwsQ0FBZCxDQUFqQjtRQUNOLElBQUcsSUFBQSxLQUFRLFVBQVg7VUFDRSxLQUFLLENBQUMsR0FBTixHQUFZLElBQUksQ0FBQyxHQUFMLENBQVMsR0FBRyxDQUFDLEdBQWIsRUFBa0IsS0FBSyxDQUFDLEdBQXhCO2lCQUNaLE1BRkY7U0FBQSxNQUFBO2lCQUlFLEtBQUssQ0FBQyxHQUFOLENBQVUsR0FBVixFQUFlLEtBQWYsRUFKRjtTQUxGOztJQUhlOzs7OztBQW5IbkIiLCJzb3VyY2VzQ29udGVudCI6WyJ7UG9pbnR9ID0gcmVxdWlyZSAnYXRvbSdcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgTXV0YXRpb25NYW5hZ2VyXG4gIGNvbnN0cnVjdG9yOiAoQHZpbVN0YXRlKSAtPlxuICAgIHtAZWRpdG9yLCBAc3dyYXB9ID0gQHZpbVN0YXRlXG4gICAgQHZpbVN0YXRlLm9uRGlkRGVzdHJveShAZGVzdHJveSlcblxuICAgIEBtYXJrZXJMYXllciA9IEBlZGl0b3IuYWRkTWFya2VyTGF5ZXIoKVxuICAgIEBtdXRhdGlvbnNCeVNlbGVjdGlvbiA9IG5ldyBNYXBcblxuICBkZXN0cm95OiA9PlxuICAgIEBtYXJrZXJMYXllci5kZXN0cm95KClcbiAgICBAbXV0YXRpb25zQnlTZWxlY3Rpb24uY2xlYXIoKVxuXG4gIGluaXQ6ICh7QHN0YXlCeU1hcmtlcn0pIC0+XG4gICAgQHJlc2V0KClcblxuICByZXNldDogLT5cbiAgICBAbWFya2VyTGF5ZXIuY2xlYXIoKVxuICAgIEBtdXRhdGlvbnNCeVNlbGVjdGlvbi5jbGVhcigpXG5cbiAgc2V0Q2hlY2twb2ludDogKGNoZWNrcG9pbnQpIC0+XG4gICAgZm9yIHNlbGVjdGlvbiBpbiBAZWRpdG9yLmdldFNlbGVjdGlvbnMoKVxuICAgICAgQHNldENoZWNrcG9pbnRGb3JTZWxlY3Rpb24oc2VsZWN0aW9uLCBjaGVja3BvaW50KVxuXG4gIHNldENoZWNrcG9pbnRGb3JTZWxlY3Rpb246IChzZWxlY3Rpb24sIGNoZWNrcG9pbnQpIC0+XG4gICAgaWYgQG11dGF0aW9uc0J5U2VsZWN0aW9uLmhhcyhzZWxlY3Rpb24pXG4gICAgICAjIEN1cnJlbnQgbm9uLWVtcHR5IHNlbGVjdGlvbiBpcyBwcmlvcml0aXplZCBvdmVyIGV4aXN0aW5nIG1hcmtlcidzIHJhbmdlLlxuICAgICAgIyBXZSBpbnZhbGlkYXRlIG9sZCBtYXJrZXIgdG8gcmUtdHJhY2sgZnJvbSBjdXJyZW50IHNlbGVjdGlvbi5cbiAgICAgIHJlc2V0TWFya2VyID0gbm90IHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpLmlzRW1wdHkoKVxuICAgIGVsc2VcbiAgICAgIHJlc2V0TWFya2VyID0gdHJ1ZVxuICAgICAgaW5pdGlhbFBvaW50ID0gQHN3cmFwKHNlbGVjdGlvbikuZ2V0QnVmZmVyUG9zaXRpb25Gb3IoJ2hlYWQnLCBmcm9tOiBbJ3Byb3BlcnR5JywgJ3NlbGVjdGlvbiddKVxuICAgICAgaWYgQHN0YXlCeU1hcmtlclxuICAgICAgICBpbml0aWFsUG9pbnRNYXJrZXIgPSBAbWFya2VyTGF5ZXIubWFya0J1ZmZlclBvc2l0aW9uKGluaXRpYWxQb2ludCwgaW52YWxpZGF0ZTogJ25ldmVyJylcblxuICAgICAgb3B0aW9ucyA9IHtzZWxlY3Rpb24sIGluaXRpYWxQb2ludCwgaW5pdGlhbFBvaW50TWFya2VyLCBjaGVja3BvaW50LCBAc3dyYXB9XG4gICAgICBAbXV0YXRpb25zQnlTZWxlY3Rpb24uc2V0KHNlbGVjdGlvbiwgbmV3IE11dGF0aW9uKG9wdGlvbnMpKVxuXG4gICAgaWYgcmVzZXRNYXJrZXJcbiAgICAgIG1hcmtlciA9IEBtYXJrZXJMYXllci5tYXJrQnVmZmVyUmFuZ2Uoc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKCksIGludmFsaWRhdGU6ICduZXZlcicpXG4gICAgQG11dGF0aW9uc0J5U2VsZWN0aW9uLmdldChzZWxlY3Rpb24pLnVwZGF0ZShjaGVja3BvaW50LCBtYXJrZXIsIEB2aW1TdGF0ZS5tb2RlKVxuXG4gIG1pZ3JhdGVNdXRhdGlvbjogKG9sZFNlbGVjdGlvbiwgbmV3U2VsZWN0aW9uKSAtPlxuICAgIG11dGF0aW9uID0gQG11dGF0aW9uc0J5U2VsZWN0aW9uLmdldChvbGRTZWxlY3Rpb24pXG4gICAgQG11dGF0aW9uc0J5U2VsZWN0aW9uLmRlbGV0ZShvbGRTZWxlY3Rpb24pXG4gICAgbXV0YXRpb24uc2VsZWN0aW9uID0gbmV3U2VsZWN0aW9uXG4gICAgQG11dGF0aW9uc0J5U2VsZWN0aW9uLnNldChuZXdTZWxlY3Rpb24sIG11dGF0aW9uKVxuXG4gIGdldE11dGF0ZWRCdWZmZXJSYW5nZUZvclNlbGVjdGlvbjogKHNlbGVjdGlvbikgLT5cbiAgICBpZiBAbXV0YXRpb25zQnlTZWxlY3Rpb24uaGFzKHNlbGVjdGlvbilcbiAgICAgIEBtdXRhdGlvbnNCeVNlbGVjdGlvbi5nZXQoc2VsZWN0aW9uKS5tYXJrZXIuZ2V0QnVmZmVyUmFuZ2UoKVxuXG4gIGdldFNlbGVjdGVkQnVmZmVyUmFuZ2VzRm9yQ2hlY2twb2ludDogKGNoZWNrcG9pbnQpIC0+XG4gICAgcmFuZ2VzID0gW11cbiAgICBAbXV0YXRpb25zQnlTZWxlY3Rpb24uZm9yRWFjaCAobXV0YXRpb24pIC0+XG4gICAgICBpZiByYW5nZSA9IG11dGF0aW9uLmJ1ZmZlclJhbmdlQnlDaGVja3BvaW50W2NoZWNrcG9pbnRdXG4gICAgICAgIHJhbmdlcy5wdXNoKHJhbmdlKVxuICAgIHJhbmdlc1xuXG4gIHJlc3RvcmVDdXJzb3JQb3NpdGlvbnM6ICh7c3RheSwgd2lzZSwgc2V0VG9GaXJzdENoYXJhY3Rlck9uTGluZXdpc2V9KSAtPlxuICAgIGlmIHdpc2UgaXMgJ2Jsb2Nrd2lzZSdcbiAgICAgIGZvciBibG9ja3dpc2VTZWxlY3Rpb24gaW4gQHZpbVN0YXRlLmdldEJsb2Nrd2lzZVNlbGVjdGlvbnMoKVxuICAgICAgICB7aGVhZCwgdGFpbH0gPSBibG9ja3dpc2VTZWxlY3Rpb24uZ2V0UHJvcGVydGllcygpXG4gICAgICAgIHBvaW50ID0gaWYgc3RheSB0aGVuIGhlYWQgZWxzZSBQb2ludC5taW4oaGVhZCwgdGFpbClcbiAgICAgICAgYmxvY2t3aXNlU2VsZWN0aW9uLnNldEhlYWRCdWZmZXJQb3NpdGlvbihwb2ludClcbiAgICAgICAgYmxvY2t3aXNlU2VsZWN0aW9uLnNraXBOb3JtYWxpemF0aW9uKClcbiAgICBlbHNlXG4gICAgICAjIE1ha2Ugc3VyZSBkZXN0cm95aW5nIGFsbCB0ZW1wb3JhbCBzZWxlY3Rpb24gQkVGT1JFIHN0YXJ0aW5nIHRvIHNldCBjdXJzb3JzIHRvIGZpbmFsIHBvc2l0aW9uLlxuICAgICAgIyBUaGlzIGlzIGltcG9ydGFudCB0byBhdm9pZCBkZXN0cm95IG9yZGVyIGRlcGVuZGVudCBidWdzLlxuICAgICAgZm9yIHNlbGVjdGlvbiBpbiBAZWRpdG9yLmdldFNlbGVjdGlvbnMoKSB3aGVuIG11dGF0aW9uID0gQG11dGF0aW9uc0J5U2VsZWN0aW9uLmdldChzZWxlY3Rpb24pXG4gICAgICAgIGlmIG11dGF0aW9uLmNyZWF0ZWRBdCBpc250ICd3aWxsLXNlbGVjdCdcbiAgICAgICAgICBzZWxlY3Rpb24uZGVzdHJveSgpXG5cbiAgICAgIGZvciBzZWxlY3Rpb24gaW4gQGVkaXRvci5nZXRTZWxlY3Rpb25zKCkgd2hlbiBtdXRhdGlvbiA9IEBtdXRhdGlvbnNCeVNlbGVjdGlvbi5nZXQoc2VsZWN0aW9uKVxuICAgICAgICBpZiBzdGF5XG4gICAgICAgICAgcG9pbnQgPSBAY2xpcFBvaW50KG11dGF0aW9uLmdldFN0YXlQb3NpdGlvbih3aXNlKSlcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHBvaW50ID0gQGNsaXBQb2ludChtdXRhdGlvbi5zdGFydFBvc2l0aW9uT25EaWRTZWxlY3QpXG4gICAgICAgICAgaWYgc2V0VG9GaXJzdENoYXJhY3Rlck9uTGluZXdpc2UgYW5kIHdpc2UgaXMgJ2xpbmV3aXNlJ1xuICAgICAgICAgICAgcG9pbnQgPSBAdmltU3RhdGUudXRpbHMuZ2V0Rmlyc3RDaGFyYWN0ZXJQb3NpdGlvbkZvckJ1ZmZlclJvdyhAZWRpdG9yLCBwb2ludC5yb3cpXG4gICAgICAgIHNlbGVjdGlvbi5jdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24ocG9pbnQpXG5cbiAgY2xpcFBvaW50OiAocG9pbnQpIC0+XG4gICAgcG9pbnQucm93ID0gTWF0aC5taW4oQHZpbVN0YXRlLnV0aWxzLmdldFZpbUxhc3RCdWZmZXJSb3coQGVkaXRvciksIHBvaW50LnJvdylcbiAgICBAZWRpdG9yLmNsaXBCdWZmZXJQb3NpdGlvbihwb2ludClcblxuIyBNdXRhdGlvbiBpbmZvcm1hdGlvbiBpcyBjcmVhdGVkIGV2ZW4gaWYgc2VsZWN0aW9uLmlzRW1wdHkoKVxuIyBTbyB0aGF0IHdlIGNhbiBmaWx0ZXIgc2VsZWN0aW9uIGJ5IHdoZW4gaXQgd2FzIGNyZWF0ZWQuXG4jICBlLmcuIFNvbWUgc2VsZWN0aW9uIGlzIGNyZWF0ZWQgYXQgJ3dpbGwtc2VsZWN0JyBjaGVja3BvaW50LCBvdGhlcnMgYXQgJ2RpZC1zZWxlY3QnIG9yICdkaWQtc2VsZWN0LW9jY3VycmVuY2UnXG5jbGFzcyBNdXRhdGlvblxuICBjb25zdHJ1Y3RvcjogKG9wdGlvbnMpIC0+XG4gICAge0BzZWxlY3Rpb24sIEBpbml0aWFsUG9pbnQsIEBpbml0aWFsUG9pbnRNYXJrZXIsIGNoZWNrcG9pbnQsIEBzd3JhcH0gPSBvcHRpb25zXG4gICAgQGNyZWF0ZWRBdCA9IGNoZWNrcG9pbnRcbiAgICBAYnVmZmVyUmFuZ2VCeUNoZWNrcG9pbnQgPSB7fVxuICAgIEBtYXJrZXIgPSBudWxsXG4gICAgQHN0YXJ0UG9zaXRpb25PbkRpZFNlbGVjdCA9IG51bGxcblxuICB1cGRhdGU6IChjaGVja3BvaW50LCBtYXJrZXIsIG1vZGUpIC0+XG4gICAgaWYgbWFya2VyP1xuICAgICAgQG1hcmtlcj8uZGVzdHJveSgpXG4gICAgICBAbWFya2VyID0gbWFya2VyXG4gICAgQGJ1ZmZlclJhbmdlQnlDaGVja3BvaW50W2NoZWNrcG9pbnRdID0gQG1hcmtlci5nZXRCdWZmZXJSYW5nZSgpXG4gICAgIyBOT1RFOiBzdHVwaWRseSByZXNwZWN0IHB1cmUtVmltJ3MgYmVoYXZpb3Igd2hpY2ggaXMgaW5jb25zaXN0ZW50LlxuICAgICMgTWF5YmUgSSdsbCByZW1vdmUgdGhpcyBibGluZGx5LWZvbGxvd2luZy10by1wdXJlLVZpbSBjb2RlLlxuICAgICMgIC0gYFYgayB5YDogZG9uJ3QgbW92ZSBjdXJzb3JcbiAgICAjICAtIGBWIGogeWA6IG1vdmUgY3Vyb3IgdG8gc3RhcnQgb2Ygc2VsZWN0ZWQgbGluZS4oSW5jb25zaXN0ZW50ISlcbiAgICBpZiBjaGVja3BvaW50IGlzICdkaWQtc2VsZWN0J1xuICAgICAgaWYgKG1vZGUgaXMgJ3Zpc3VhbCcgYW5kIG5vdCBAc2VsZWN0aW9uLmlzUmV2ZXJzZWQoKSlcbiAgICAgICAgZnJvbSA9IFsnc2VsZWN0aW9uJ11cbiAgICAgIGVsc2VcbiAgICAgICAgZnJvbSA9IFsncHJvcGVydHknLCAnc2VsZWN0aW9uJ11cbiAgICAgIEBzdGFydFBvc2l0aW9uT25EaWRTZWxlY3QgPSBAc3dyYXAoQHNlbGVjdGlvbikuZ2V0QnVmZmVyUG9zaXRpb25Gb3IoJ3N0YXJ0Jywge2Zyb219KVxuXG4gIGdldFN0YXlQb3NpdGlvbjogKHdpc2UpIC0+XG4gICAgcG9pbnQgPSBAaW5pdGlhbFBvaW50TWFya2VyPy5nZXRIZWFkQnVmZmVyUG9zaXRpb24oKSA/IEBpbml0aWFsUG9pbnRcbiAgICBzZWxlY3RlZFJhbmdlID0gQGJ1ZmZlclJhbmdlQnlDaGVja3BvaW50WydkaWQtc2VsZWN0LW9jY3VycmVuY2UnXSA/IEBidWZmZXJSYW5nZUJ5Q2hlY2twb2ludFsnZGlkLXNlbGVjdCddXG4gICAgaWYgc2VsZWN0ZWRSYW5nZS5pc0VxdWFsKEBtYXJrZXIuZ2V0QnVmZmVyUmFuZ2UoKSkgIyBDaGVjayBpZiBuZWVkIENsaXBcbiAgICAgIHBvaW50XG4gICAgZWxzZVxuICAgICAge3N0YXJ0LCBlbmR9ID0gQG1hcmtlci5nZXRCdWZmZXJSYW5nZSgpXG4gICAgICBlbmQgPSBQb2ludC5tYXgoc3RhcnQsIGVuZC50cmFuc2xhdGUoWzAsIC0xXSkpXG4gICAgICBpZiB3aXNlIGlzICdsaW5ld2lzZSdcbiAgICAgICAgcG9pbnQucm93ID0gTWF0aC5taW4oZW5kLnJvdywgcG9pbnQucm93KVxuICAgICAgICBwb2ludFxuICAgICAgZWxzZVxuICAgICAgICBQb2ludC5taW4oZW5kLCBwb2ludClcbiJdfQ==
