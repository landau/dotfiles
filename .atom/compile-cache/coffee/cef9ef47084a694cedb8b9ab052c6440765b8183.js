(function() {
  var CompositeDisposable, Mutation, MutationManager, Point, ref, swrap;

  ref = require('atom'), Point = ref.Point, CompositeDisposable = ref.CompositeDisposable;

  swrap = require('./selection-wrapper');

  module.exports = MutationManager = (function() {
    function MutationManager(vimState) {
      this.vimState = vimState;
      this.editor = this.vimState.editor;
      this.disposables = new CompositeDisposable;
      this.disposables.add(this.vimState.onDidDestroy(this.destroy.bind(this)));
      this.markerLayer = this.editor.addMarkerLayer();
      this.mutationsBySelection = new Map;
      this.bufferRangesForCustomCheckpoint = [];
    }

    MutationManager.prototype.destroy = function() {
      var ref1, ref2;
      this.reset();
      ref1 = {}, this.mutationsBySelection = ref1.mutationsBySelection, this.editor = ref1.editor, this.vimState = ref1.vimState;
      return ref2 = {}, this.bufferRangesForCustomCheckpoint = ref2.bufferRangesForCustomCheckpoint, ref2;
    };

    MutationManager.prototype.init = function(options1) {
      this.options = options1;
      return this.reset();
    };

    MutationManager.prototype.reset = function() {
      this.markerLayer.clear();
      this.mutationsBySelection.clear();
      return this.bufferRangesForCustomCheckpoint = [];
    };

    MutationManager.prototype.getInitialPointForSelection = function(selection, options) {
      var ref1;
      return (ref1 = this.getMutationForSelection(selection)) != null ? ref1.getInitialPoint(options) : void 0;
    };

    MutationManager.prototype.setCheckpoint = function(checkpoint) {
      var i, initialPoint, len, options, ref1, results, selection;
      ref1 = this.editor.getSelections();
      results = [];
      for (i = 0, len = ref1.length; i < len; i++) {
        selection = ref1[i];
        if (this.mutationsBySelection.has(selection)) {
          results.push(this.mutationsBySelection.get(selection).update(checkpoint));
        } else {
          if (this.vimState.isMode('visual')) {
            initialPoint = swrap(selection).getBufferPositionFor('head', {
              from: ['property', 'selection']
            });
          } else {
            initialPoint = swrap(selection).getBufferPositionFor('head');
          }
          options = {
            selection: selection,
            initialPoint: initialPoint,
            checkpoint: checkpoint,
            markerLayer: this.markerLayer,
            useMarker: this.options.useMarker
          };
          results.push(this.mutationsBySelection.set(selection, new Mutation(options)));
        }
      }
      return results;
    };

    MutationManager.prototype.getMutationForSelection = function(selection) {
      return this.mutationsBySelection.get(selection);
    };

    MutationManager.prototype.getMarkerBufferRanges = function() {
      var ranges;
      ranges = [];
      this.mutationsBySelection.forEach(function(mutation, selection) {
        var range, ref1;
        if (range = (ref1 = mutation.marker) != null ? ref1.getBufferRange() : void 0) {
          return ranges.push(range);
        }
      });
      return ranges;
    };

    MutationManager.prototype.getBufferRangesForCheckpoint = function(checkpoint) {
      var ranges;
      if (checkpoint === 'custom') {
        return this.bufferRangesForCustomCheckpoint;
      }
      ranges = [];
      this.mutationsBySelection.forEach(function(mutation) {
        var range;
        if (range = mutation.getBufferRangeForCheckpoint(checkpoint)) {
          return ranges.push(range);
        }
      });
      return ranges;
    };

    MutationManager.prototype.setBufferRangesForCustomCheckpoint = function(ranges) {
      return this.bufferRangesForCustomCheckpoint = ranges;
    };

    MutationManager.prototype.restoreInitialPositions = function() {
      var i, len, point, ref1, results, selection;
      ref1 = this.editor.getSelections();
      results = [];
      for (i = 0, len = ref1.length; i < len; i++) {
        selection = ref1[i];
        if (point = this.getInitialPointForSelection(selection)) {
          results.push(selection.cursor.setBufferPosition(point));
        }
      }
      return results;
    };

    MutationManager.prototype.restoreCursorPositions = function(options) {
      var i, isBlockwise, j, len, len1, mutation, occurrenceSelected, point, points, ref1, ref2, ref3, results, results1, selection, stay;
      stay = options.stay, occurrenceSelected = options.occurrenceSelected, isBlockwise = options.isBlockwise;
      if (isBlockwise) {
        points = [];
        this.mutationsBySelection.forEach(function(mutation, selection) {
          var ref1;
          return points.push((ref1 = mutation.bufferRangeByCheckpoint['will-select']) != null ? ref1.start : void 0);
        });
        points = points.sort(function(a, b) {
          return a.compare(b);
        });
        points = points.filter(function(point) {
          return point != null;
        });
        if (this.vimState.isMode('visual', 'blockwise')) {
          if (point = points[0]) {
            return (ref1 = this.vimState.getLastBlockwiseSelection()) != null ? ref1.setHeadBufferPosition(point) : void 0;
          }
        } else {
          if (point = points[0]) {
            return this.editor.setCursorBufferPosition(point);
          } else {
            ref2 = this.editor.getSelections();
            results = [];
            for (i = 0, len = ref2.length; i < len; i++) {
              selection = ref2[i];
              if (!selection.isLastSelection()) {
                results.push(selection.destroy());
              } else {
                results.push(void 0);
              }
            }
            return results;
          }
        }
      } else {
        ref3 = this.editor.getSelections();
        results1 = [];
        for (j = 0, len1 = ref3.length; j < len1; j++) {
          selection = ref3[j];
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
            stay: stay
          })) {
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
      this.selection = options.selection, this.initialPoint = options.initialPoint, checkpoint = options.checkpoint, this.markerLayer = options.markerLayer, this.useMarker = options.useMarker;
      this.createdAt = checkpoint;
      if (this.useMarker) {
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
      var ref1;
      if (!this.selection.getBufferRange().isEmpty()) {
        if ((ref1 = this.marker) != null) {
          ref1.destroy();
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
      var end, point, ref1, start;
      ref1 = this.marker.getBufferRange(), start = ref1.start, end = ref1.end;
      point = Point.max(start, end.translate([0, -1]));
      return this.selection.editor.clipBufferPosition(point);
    };

    Mutation.prototype.getInitialPoint = function(arg) {
      var clip, point, ref1, ref2;
      clip = (arg != null ? arg : {}).clip;
      point = (ref1 = (ref2 = this.initialPointMarker) != null ? ref2.getHeadBufferPosition() : void 0) != null ? ref1 : this.initialPoint;
      if (clip) {
        return Point.min(this.getEndBufferPosition(), point);
      } else {
        return point;
      }
    };

    Mutation.prototype.getBufferRangeForCheckpoint = function(checkpoint) {
      return this.bufferRangeByCheckpoint[checkpoint];
    };

    Mutation.prototype.getRestorePoint = function(arg) {
      var ref1, ref2, ref3, stay;
      stay = (arg != null ? arg : {}).stay;
      if (stay) {
        return this.getInitialPoint({
          clip: true
        });
      } else {
        return (ref1 = (ref2 = this.bufferRangeByCheckpoint['did-move']) != null ? ref2.start : void 0) != null ? ref1 : (ref3 = this.bufferRangeByCheckpoint['did-select']) != null ? ref3.start : void 0;
      }
    };

    return Mutation;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvbXV0YXRpb24tbWFuYWdlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLE1BQStCLE9BQUEsQ0FBUSxNQUFSLENBQS9CLEVBQUMsaUJBQUQsRUFBUTs7RUFDUixLQUFBLEdBQVEsT0FBQSxDQUFRLHFCQUFSOztFQWFSLE1BQU0sQ0FBQyxPQUFQLEdBQ007SUFDUyx5QkFBQyxRQUFEO01BQUMsSUFBQyxDQUFBLFdBQUQ7TUFDWCxJQUFDLENBQUEsU0FBVSxJQUFDLENBQUEsU0FBWDtNQUVGLElBQUMsQ0FBQSxXQUFELEdBQWUsSUFBSTtNQUNuQixJQUFDLENBQUEsV0FBVyxDQUFDLEdBQWIsQ0FBaUIsSUFBQyxDQUFBLFFBQVEsQ0FBQyxZQUFWLENBQXVCLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFjLElBQWQsQ0FBdkIsQ0FBakI7TUFFQSxJQUFDLENBQUEsV0FBRCxHQUFlLElBQUMsQ0FBQSxNQUFNLENBQUMsY0FBUixDQUFBO01BQ2YsSUFBQyxDQUFBLG9CQUFELEdBQXdCLElBQUk7TUFDNUIsSUFBQyxDQUFBLCtCQUFELEdBQW1DO0lBUnhCOzs4QkFVYixPQUFBLEdBQVMsU0FBQTtBQUNQLFVBQUE7TUFBQSxJQUFDLENBQUEsS0FBRCxDQUFBO01BQ0EsT0FBOEMsRUFBOUMsRUFBQyxJQUFDLENBQUEsNEJBQUEsb0JBQUYsRUFBd0IsSUFBQyxDQUFBLGNBQUEsTUFBekIsRUFBaUMsSUFBQyxDQUFBLGdCQUFBO2FBQ2xDLE9BQXFDLEVBQXJDLEVBQUMsSUFBQyxDQUFBLHVDQUFBLCtCQUFGLEVBQUE7SUFITzs7OEJBS1QsSUFBQSxHQUFNLFNBQUMsUUFBRDtNQUFDLElBQUMsQ0FBQSxVQUFEO2FBQ0wsSUFBQyxDQUFBLEtBQUQsQ0FBQTtJQURJOzs4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TixDQUFVLEtBQVYsRUFBaUIsR0FBRyxDQUFDLFNBQUosQ0FBYyxDQUFDLENBQUQsRUFBSSxDQUFDLENBQUwsQ0FBZCxDQUFqQjthQUNSLElBQUMsQ0FBQSxTQUFTLENBQUMsTUFBTSxDQUFDLGtCQUFsQixDQUFxQyxLQUFyQztJQUhvQjs7dUJBS3RCLGVBQUEsR0FBaUIsU0FBQyxHQUFEO0FBQ2YsVUFBQTtNQURpQixzQkFBRCxNQUFPO01BQ3ZCLEtBQUEsOEdBQXVELElBQUMsQ0FBQTtNQUN4RCxJQUFHLElBQUg7ZUFDRSxLQUFLLENBQUMsR0FBTixDQUFVLElBQUMsQ0FBQSxvQkFBRCxDQUFBLENBQVYsRUFBbUMsS0FBbkMsRUFERjtPQUFBLE1BQUE7ZUFHRSxNQUhGOztJQUZlOzt1QkFPakIsMkJBQUEsR0FBNkIsU0FBQyxVQUFEO2FBQzNCLElBQUMsQ0FBQSx1QkFBd0IsQ0FBQSxVQUFBO0lBREU7O3VCQUc3QixlQUFBLEdBQWlCLFNBQUMsR0FBRDtBQUNmLFVBQUE7TUFEaUIsc0JBQUQsTUFBTztNQUN2QixJQUFHLElBQUg7ZUFDRSxJQUFDLENBQUEsZUFBRCxDQUFpQjtVQUFBLElBQUEsRUFBTSxJQUFOO1NBQWpCLEVBREY7T0FBQSxNQUFBOzJMQUdzRixDQUFFLGVBSHhGOztJQURlOzs7OztBQS9LbkIiLCJzb3VyY2VzQ29udGVudCI6WyJ7UG9pbnQsIENvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSAnYXRvbSdcbnN3cmFwID0gcmVxdWlyZSAnLi9zZWxlY3Rpb24td3JhcHBlcidcblxuIyBrZWVwIG11dGF0aW9uIHNuYXBzaG90IG5lY2Vzc2FyeSBmb3IgT3BlcmF0b3IgcHJvY2Vzc2luZy5cbiMgbXV0YXRpb24gc3RvcmVkIGJ5IGVhY2ggU2VsZWN0aW9uIGhhdmUgZm9sbG93aW5nIGZpZWxkXG4jICBtYXJrZXI6XG4jICAgIG1hcmtlciB0byB0cmFjayBtdXRhdGlvbi4gbWFya2VyIGlzIGNyZWF0ZWQgd2hlbiBgc2V0Q2hlY2twb2ludGBcbiMgIGNyZWF0ZWRBdDpcbiMgICAgJ3N0cmluZycgcmVwcmVzZW50aW5nIHdoZW4gbWFya2VyIHdhcyBjcmVhdGVkLlxuIyAgY2hlY2twb2ludDoge31cbiMgICAga2V5IGlzIFsnd2lsbC1zZWxlY3QnLCAnZGlkLXNlbGVjdCcsICd3aWxsLW11dGF0ZScsICdkaWQtbXV0YXRlJ11cbiMgICAga2V5IGlzIGNoZWNrcG9pbnQsIHZhbHVlIGlzIGJ1ZmZlclJhbmdlIGZvciBtYXJrZXIgYXQgdGhhdCBjaGVja3BvaW50XG4jICBzZWxlY3Rpb246XG4jICAgIFNlbGVjdGlvbiBiZWVpbmcgdHJhY2tlZFxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgTXV0YXRpb25NYW5hZ2VyXG4gIGNvbnN0cnVjdG9yOiAoQHZpbVN0YXRlKSAtPlxuICAgIHtAZWRpdG9yfSA9IEB2aW1TdGF0ZVxuXG4gICAgQGRpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcbiAgICBAZGlzcG9zYWJsZXMuYWRkIEB2aW1TdGF0ZS5vbkRpZERlc3Ryb3koQGRlc3Ryb3kuYmluZCh0aGlzKSlcblxuICAgIEBtYXJrZXJMYXllciA9IEBlZGl0b3IuYWRkTWFya2VyTGF5ZXIoKVxuICAgIEBtdXRhdGlvbnNCeVNlbGVjdGlvbiA9IG5ldyBNYXBcbiAgICBAYnVmZmVyUmFuZ2VzRm9yQ3VzdG9tQ2hlY2twb2ludCA9IFtdXG5cbiAgZGVzdHJveTogLT5cbiAgICBAcmVzZXQoKVxuICAgIHtAbXV0YXRpb25zQnlTZWxlY3Rpb24sIEBlZGl0b3IsIEB2aW1TdGF0ZX0gPSB7fVxuICAgIHtAYnVmZmVyUmFuZ2VzRm9yQ3VzdG9tQ2hlY2twb2ludH0gPSB7fVxuXG4gIGluaXQ6IChAb3B0aW9ucykgLT5cbiAgICBAcmVzZXQoKVxuXG4gIHJlc2V0OiAtPlxuICAgIEBtYXJrZXJMYXllci5jbGVhcigpXG4gICAgQG11dGF0aW9uc0J5U2VsZWN0aW9uLmNsZWFyKClcbiAgICBAYnVmZmVyUmFuZ2VzRm9yQ3VzdG9tQ2hlY2twb2ludCA9IFtdXG5cbiAgZ2V0SW5pdGlhbFBvaW50Rm9yU2VsZWN0aW9uOiAoc2VsZWN0aW9uLCBvcHRpb25zKSAtPlxuICAgIEBnZXRNdXRhdGlvbkZvclNlbGVjdGlvbihzZWxlY3Rpb24pPy5nZXRJbml0aWFsUG9pbnQob3B0aW9ucylcblxuICBzZXRDaGVja3BvaW50OiAoY2hlY2twb2ludCkgLT5cbiAgICBmb3Igc2VsZWN0aW9uIGluIEBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpXG4gICAgICBpZiBAbXV0YXRpb25zQnlTZWxlY3Rpb24uaGFzKHNlbGVjdGlvbilcbiAgICAgICAgQG11dGF0aW9uc0J5U2VsZWN0aW9uLmdldChzZWxlY3Rpb24pLnVwZGF0ZShjaGVja3BvaW50KVxuICAgICAgZWxzZVxuICAgICAgICBpZiBAdmltU3RhdGUuaXNNb2RlKCd2aXN1YWwnKVxuICAgICAgICAgIGluaXRpYWxQb2ludCA9IHN3cmFwKHNlbGVjdGlvbikuZ2V0QnVmZmVyUG9zaXRpb25Gb3IoJ2hlYWQnLCBmcm9tOiBbJ3Byb3BlcnR5JywgJ3NlbGVjdGlvbiddKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgaW5pdGlhbFBvaW50ID0gc3dyYXAoc2VsZWN0aW9uKS5nZXRCdWZmZXJQb3NpdGlvbkZvcignaGVhZCcpXG5cbiAgICAgICAgb3B0aW9ucyA9IHtzZWxlY3Rpb24sIGluaXRpYWxQb2ludCwgY2hlY2twb2ludCwgQG1hcmtlckxheWVyLCB1c2VNYXJrZXI6IEBvcHRpb25zLnVzZU1hcmtlcn1cbiAgICAgICAgQG11dGF0aW9uc0J5U2VsZWN0aW9uLnNldChzZWxlY3Rpb24sIG5ldyBNdXRhdGlvbihvcHRpb25zKSlcblxuICBnZXRNdXRhdGlvbkZvclNlbGVjdGlvbjogKHNlbGVjdGlvbikgLT5cbiAgICBAbXV0YXRpb25zQnlTZWxlY3Rpb24uZ2V0KHNlbGVjdGlvbilcblxuICBnZXRNYXJrZXJCdWZmZXJSYW5nZXM6IC0+XG4gICAgcmFuZ2VzID0gW11cbiAgICBAbXV0YXRpb25zQnlTZWxlY3Rpb24uZm9yRWFjaCAobXV0YXRpb24sIHNlbGVjdGlvbikgLT5cbiAgICAgIGlmIHJhbmdlID0gbXV0YXRpb24ubWFya2VyPy5nZXRCdWZmZXJSYW5nZSgpXG4gICAgICAgIHJhbmdlcy5wdXNoKHJhbmdlKVxuICAgIHJhbmdlc1xuXG4gIGdldEJ1ZmZlclJhbmdlc0ZvckNoZWNrcG9pbnQ6IChjaGVja3BvaW50KSAtPlxuICAgICMgW0ZJWE1FXSBkaXJ0eSB3b3JrYXJvdW5kIGp1c3QgdXNpbmcgbXV0YXRpb25NYW5hZ2VyIGFzIG1lcmVseSBzdGF0ZSByZWdpc3RyeVxuICAgIGlmIGNoZWNrcG9pbnQgaXMgJ2N1c3RvbSdcbiAgICAgIHJldHVybiBAYnVmZmVyUmFuZ2VzRm9yQ3VzdG9tQ2hlY2twb2ludFxuXG4gICAgcmFuZ2VzID0gW11cbiAgICBAbXV0YXRpb25zQnlTZWxlY3Rpb24uZm9yRWFjaCAobXV0YXRpb24pIC0+XG4gICAgICBpZiByYW5nZSA9IG11dGF0aW9uLmdldEJ1ZmZlclJhbmdlRm9yQ2hlY2twb2ludChjaGVja3BvaW50KVxuICAgICAgICByYW5nZXMucHVzaChyYW5nZSlcbiAgICByYW5nZXNcblxuICAjIFtGSVhNRV0gZGlydHkgd29ya2Fyb3VuZCBqdXN0IHVzaW5nIG11dGF0aW9ubWFuYWdlciBmb3Igc3RhdGUgcmVnaXN0cnlcbiAgc2V0QnVmZmVyUmFuZ2VzRm9yQ3VzdG9tQ2hlY2twb2ludDogKHJhbmdlcykgLT5cbiAgICBAYnVmZmVyUmFuZ2VzRm9yQ3VzdG9tQ2hlY2twb2ludCA9IHJhbmdlc1xuXG4gIHJlc3RvcmVJbml0aWFsUG9zaXRpb25zOiAtPlxuICAgIGZvciBzZWxlY3Rpb24gaW4gQGVkaXRvci5nZXRTZWxlY3Rpb25zKCkgd2hlbiBwb2ludCA9IEBnZXRJbml0aWFsUG9pbnRGb3JTZWxlY3Rpb24oc2VsZWN0aW9uKVxuICAgICAgc2VsZWN0aW9uLmN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihwb2ludClcblxuICByZXN0b3JlQ3Vyc29yUG9zaXRpb25zOiAob3B0aW9ucykgLT5cbiAgICB7c3RheSwgb2NjdXJyZW5jZVNlbGVjdGVkLCBpc0Jsb2Nrd2lzZX0gPSBvcHRpb25zXG4gICAgaWYgaXNCbG9ja3dpc2VcbiAgICAgICMgW0ZJWE1FXSB3aHkgSSBuZWVkIHRoaXMgZGlyZWN0IG1hbnVwaWxhdGlvbj9cbiAgICAgICMgQmVjYXVzZSB0aGVyZSdzIGJ1ZyB0aGF0IGJsb2Nrd2lzZSBzZWxlY2N0aW9uIGlzIG5vdCBhZGRlcyB0byBlYWNoXG4gICAgICAjIGJzSW5zdGFuY2Uuc2VsZWN0aW9uLiBOZWVkIGludmVzdGlnYXRpb24uXG4gICAgICBwb2ludHMgPSBbXVxuICAgICAgQG11dGF0aW9uc0J5U2VsZWN0aW9uLmZvckVhY2ggKG11dGF0aW9uLCBzZWxlY3Rpb24pIC0+XG4gICAgICAgIHBvaW50cy5wdXNoKG11dGF0aW9uLmJ1ZmZlclJhbmdlQnlDaGVja3BvaW50Wyd3aWxsLXNlbGVjdCddPy5zdGFydClcbiAgICAgIHBvaW50cyA9IHBvaW50cy5zb3J0IChhLCBiKSAtPiBhLmNvbXBhcmUoYilcbiAgICAgIHBvaW50cyA9IHBvaW50cy5maWx0ZXIgKHBvaW50KSAtPiBwb2ludD9cbiAgICAgIGlmIEB2aW1TdGF0ZS5pc01vZGUoJ3Zpc3VhbCcsICdibG9ja3dpc2UnKVxuICAgICAgICBpZiBwb2ludCA9IHBvaW50c1swXVxuICAgICAgICAgIEB2aW1TdGF0ZS5nZXRMYXN0QmxvY2t3aXNlU2VsZWN0aW9uKCk/LnNldEhlYWRCdWZmZXJQb3NpdGlvbihwb2ludClcbiAgICAgIGVsc2VcbiAgICAgICAgaWYgcG9pbnQgPSBwb2ludHNbMF1cbiAgICAgICAgICBAZWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKHBvaW50KVxuICAgICAgICBlbHNlXG4gICAgICAgICAgZm9yIHNlbGVjdGlvbiBpbiBAZWRpdG9yLmdldFNlbGVjdGlvbnMoKVxuICAgICAgICAgICAgc2VsZWN0aW9uLmRlc3Ryb3koKSB1bmxlc3Mgc2VsZWN0aW9uLmlzTGFzdFNlbGVjdGlvbigpXG4gICAgZWxzZVxuICAgICAgZm9yIHNlbGVjdGlvbiBpbiBAZWRpdG9yLmdldFNlbGVjdGlvbnMoKSB3aGVuIG11dGF0aW9uID0gQG11dGF0aW9uc0J5U2VsZWN0aW9uLmdldChzZWxlY3Rpb24pXG4gICAgICAgIGlmIG9jY3VycmVuY2VTZWxlY3RlZCBhbmQgbm90IG11dGF0aW9uLmlzQ3JlYXRlZEF0KCd3aWxsLXNlbGVjdCcpXG4gICAgICAgICAgc2VsZWN0aW9uLmRlc3Ryb3koKVxuXG4gICAgICAgIGlmIG9jY3VycmVuY2VTZWxlY3RlZCBhbmQgc3RheVxuICAgICAgICAgICMgVGhpcyBpcyBlc3NlbmNpYWxseSB0byBjbGlwVG9NdXRhdGlvbkVuZCB3aGVuIGBkIG8gZmAsIGBkIG8gcGAgY2FzZS5cbiAgICAgICAgICBwb2ludCA9IEBjbGlwVG9NdXRhdGlvbkVuZElmU29tZU11dGF0aW9uQ29udGFpbnNQb2ludChAdmltU3RhdGUuZ2V0T3JpZ2luYWxDdXJzb3JQb3NpdGlvbigpKVxuICAgICAgICAgIHNlbGVjdGlvbi5jdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24ocG9pbnQpXG4gICAgICAgIGVsc2UgaWYgcG9pbnQgPSBtdXRhdGlvbi5nZXRSZXN0b3JlUG9pbnQoe3N0YXl9KVxuICAgICAgICAgIHNlbGVjdGlvbi5jdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24ocG9pbnQpXG5cbiAgY2xpcFRvTXV0YXRpb25FbmRJZlNvbWVNdXRhdGlvbkNvbnRhaW5zUG9pbnQ6IChwb2ludCkgLT5cbiAgICBpZiBtdXRhdGlvbiA9IEBmaW5kTXV0YXRpb25Db250YWluc1BvaW50QXRDaGVja3BvaW50KHBvaW50LCAnZGlkLXNlbGVjdC1vY2N1cnJlbmNlJylcbiAgICAgIFBvaW50Lm1pbihtdXRhdGlvbi5nZXRFbmRCdWZmZXJQb3NpdGlvbigpLCBwb2ludClcbiAgICBlbHNlXG4gICAgICBwb2ludFxuXG4gIGZpbmRNdXRhdGlvbkNvbnRhaW5zUG9pbnRBdENoZWNrcG9pbnQ6IChwb2ludCwgY2hlY2twb2ludCkgLT5cbiAgICAjIENvZmZlZXNjcmlwdCBjYW5ub3QgaXRlcmF0ZSBvdmVyIGl0ZXJhdG9yIGJ5IEphdmFTY3JpcHQncyAnb2YnIGJlY2F1c2Ugb2Ygc3ludGF4IGNvbmZsaWN0cy5cbiAgICBpdGVyYXRvciA9IEBtdXRhdGlvbnNCeVNlbGVjdGlvbi52YWx1ZXMoKVxuICAgIHdoaWxlIChlbnRyeSA9IGl0ZXJhdG9yLm5leHQoKSkgYW5kIG5vdCBlbnRyeS5kb25lXG4gICAgICBtdXRhdGlvbiA9IGVudHJ5LnZhbHVlXG4gICAgICBpZiBtdXRhdGlvbi5nZXRCdWZmZXJSYW5nZUZvckNoZWNrcG9pbnQoY2hlY2twb2ludCkuY29udGFpbnNQb2ludChwb2ludClcbiAgICAgICAgcmV0dXJuIG11dGF0aW9uXG5cbiMgTXV0YXRpb24gaW5mb3JtYXRpb24gaXMgY3JlYXRlZCBldmVuIGlmIHNlbGVjdGlvbi5pc0VtcHR5KClcbiMgU28gdGhhdCB3ZSBjYW4gZmlsdGVyIHNlbGVjdGlvbiBieSB3aGVuIGl0IHdhcyBjcmVhdGVkLlxuIyAgZS5nLiBTb21lIHNlbGVjdGlvbiBpcyBjcmVhdGVkIGF0ICd3aWxsLXNlbGVjdCcgY2hlY2twb2ludCwgb3RoZXJzIGF0ICdkaWQtc2VsZWN0JyBvciAnZGlkLXNlbGVjdC1vY2N1cnJlbmNlJ1xuY2xhc3MgTXV0YXRpb25cbiAgY29uc3RydWN0b3I6IChvcHRpb25zKSAtPlxuICAgIHtAc2VsZWN0aW9uLCBAaW5pdGlhbFBvaW50LCBjaGVja3BvaW50LCBAbWFya2VyTGF5ZXIsIEB1c2VNYXJrZXJ9ID0gb3B0aW9uc1xuXG4gICAgQGNyZWF0ZWRBdCA9IGNoZWNrcG9pbnRcbiAgICBpZiBAdXNlTWFya2VyXG4gICAgICBAaW5pdGlhbFBvaW50TWFya2VyID0gQG1hcmtlckxheWVyLm1hcmtCdWZmZXJQb3NpdGlvbihAaW5pdGlhbFBvaW50LCBpbnZhbGlkYXRlOiAnbmV2ZXInKVxuICAgIEBidWZmZXJSYW5nZUJ5Q2hlY2twb2ludCA9IHt9XG4gICAgQG1hcmtlciA9IG51bGxcbiAgICBAdXBkYXRlKGNoZWNrcG9pbnQpXG5cbiAgaXNDcmVhdGVkQXQ6ICh0aW1pbmcpIC0+XG4gICAgQGNyZWF0ZWRBdCBpcyB0aW1pbmdcblxuICB1cGRhdGU6IChjaGVja3BvaW50KSAtPlxuICAgICMgQ3VycmVudCBub24tZW1wdHkgc2VsZWN0aW9uIGlzIHByaW9yaXRpemVkIG92ZXIgZXhpc3RpbmcgbWFya2VyJ3MgcmFuZ2UuXG4gICAgIyBXZSBpbnZhbGlkYXRlIG9sZCBtYXJrZXIgdG8gcmUtdHJhY2sgZnJvbSBjdXJyZW50IHNlbGVjdGlvbi5cbiAgICB1bmxlc3MgQHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpLmlzRW1wdHkoKVxuICAgICAgQG1hcmtlcj8uZGVzdHJveSgpXG4gICAgICBAbWFya2VyID0gbnVsbFxuXG4gICAgQG1hcmtlciA/PSBAbWFya2VyTGF5ZXIubWFya0J1ZmZlclJhbmdlKEBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKSwgaW52YWxpZGF0ZTogJ25ldmVyJylcbiAgICBAYnVmZmVyUmFuZ2VCeUNoZWNrcG9pbnRbY2hlY2twb2ludF0gPSBAbWFya2VyLmdldEJ1ZmZlclJhbmdlKClcblxuICBnZXRTdGFydEJ1ZmZlclBvc2l0aW9uOiAtPlxuICAgIEBtYXJrZXIuZ2V0QnVmZmVyUmFuZ2UoKS5zdGFydFxuXG4gIGdldEVuZEJ1ZmZlclBvc2l0aW9uOiAtPlxuICAgIHtzdGFydCwgZW5kfSA9IEBtYXJrZXIuZ2V0QnVmZmVyUmFuZ2UoKVxuICAgIHBvaW50ID0gUG9pbnQubWF4KHN0YXJ0LCBlbmQudHJhbnNsYXRlKFswLCAtMV0pKVxuICAgIEBzZWxlY3Rpb24uZWRpdG9yLmNsaXBCdWZmZXJQb3NpdGlvbihwb2ludClcblxuICBnZXRJbml0aWFsUG9pbnQ6ICh7Y2xpcH09e30pIC0+XG4gICAgcG9pbnQgPSBAaW5pdGlhbFBvaW50TWFya2VyPy5nZXRIZWFkQnVmZmVyUG9zaXRpb24oKSA/IEBpbml0aWFsUG9pbnRcbiAgICBpZiBjbGlwXG4gICAgICBQb2ludC5taW4oQGdldEVuZEJ1ZmZlclBvc2l0aW9uKCksIHBvaW50KVxuICAgIGVsc2VcbiAgICAgIHBvaW50XG5cbiAgZ2V0QnVmZmVyUmFuZ2VGb3JDaGVja3BvaW50OiAoY2hlY2twb2ludCkgLT5cbiAgICBAYnVmZmVyUmFuZ2VCeUNoZWNrcG9pbnRbY2hlY2twb2ludF1cblxuICBnZXRSZXN0b3JlUG9pbnQ6ICh7c3RheX09e30pIC0+XG4gICAgaWYgc3RheVxuICAgICAgQGdldEluaXRpYWxQb2ludChjbGlwOiB0cnVlKVxuICAgIGVsc2VcbiAgICAgIEBidWZmZXJSYW5nZUJ5Q2hlY2twb2ludFsnZGlkLW1vdmUnXT8uc3RhcnQgPyBAYnVmZmVyUmFuZ2VCeUNoZWNrcG9pbnRbJ2RpZC1zZWxlY3QnXT8uc3RhcnRcbiJdfQ==
