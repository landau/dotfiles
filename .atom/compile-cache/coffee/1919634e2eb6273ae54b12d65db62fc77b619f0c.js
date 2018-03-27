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
      this.clearMarkers();
      this.mutationsBySelection.clear();
      return this.bufferRangesForCustomCheckpoint = [];
    };

    MutationManager.prototype.clearMarkers = function(pattern) {
      var i, len, marker, ref1, results;
      ref1 = this.markerLayer.getMarkers();
      results = [];
      for (i = 0, len = ref1.length; i < len; i++) {
        marker = ref1[i];
        results.push(marker.destroy());
      }
      return results;
    };

    MutationManager.prototype.getInitialPointForSelection = function(selection, options) {
      var ref1;
      return (ref1 = this.getMutationForSelection(selection)) != null ? ref1.getInitialPoint(options) : void 0;
    };

    MutationManager.prototype.setCheckpoint = function(checkpoint) {
      var i, initialPoint, len, options, ref1, results, selection, useMarker;
      ref1 = this.editor.getSelections();
      results = [];
      for (i = 0, len = ref1.length; i < len; i++) {
        selection = ref1[i];
        if (this.mutationsBySelection.has(selection)) {
          results.push(this.mutationsBySelection.get(selection).update(checkpoint));
        } else {
          initialPoint = this.vimState.isMode('visual') ? swrap(selection).getBufferPositionFor('head', {
            fromProperty: true,
            allowFallback: true
          }) : !this.options.isSelect ? swrap(selection).getBufferPositionFor('head') : void 0;
          useMarker = this.options.useMarker;
          options = {
            selection: selection,
            initialPoint: initialPoint,
            checkpoint: checkpoint,
            markerLayer: this.markerLayer,
            useMarker: useMarker
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvbXV0YXRpb24tbWFuYWdlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLE1BQStCLE9BQUEsQ0FBUSxNQUFSLENBQS9CLEVBQUMsaUJBQUQsRUFBUTs7RUFDUixLQUFBLEdBQVEsT0FBQSxDQUFRLHFCQUFSOztFQWFSLE1BQU0sQ0FBQyxPQUFQLEdBQ007SUFDUyx5QkFBQyxRQUFEO01BQUMsSUFBQyxDQUFBLFdBQUQ7TUFDWCxJQUFDLENBQUEsU0FBVSxJQUFDLENBQUEsU0FBWDtNQUVGLElBQUMsQ0FBQSxXQUFELEdBQWUsSUFBSTtNQUNuQixJQUFDLENBQUEsV0FBVyxDQUFDLEdBQWIsQ0FBaUIsSUFBQyxDQUFBLFFBQVEsQ0FBQyxZQUFWLENBQXVCLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFjLElBQWQsQ0FBdkIsQ0FBakI7TUFFQSxJQUFDLENBQUEsV0FBRCxHQUFlLElBQUMsQ0FBQSxNQUFNLENBQUMsY0FBUixDQUFBO01BQ2YsSUFBQyxDQUFBLG9CQUFELEdBQXdCLElBQUk7TUFDNUIsSUFBQyxDQUFBLCtCQUFELEdBQW1DO0lBUnhCOzs4QkFVYixPQUFBLEdBQVMsU0FBQTtBQUNQLFVBQUE7TUFBQSxJQUFDLENBQUEsS0FBRCxDQUFBO01BQ0EsT0FBOEMsRUFBOUMsRUFBQyxJQUFDLENBQUEsNEJBQUEsb0JBQUYsRUFBd0IsSUFBQyxDQUFBLGNBQUEsTUFBekIsRUFBaUMsSUFBQyxDQUFBLGdCQUFBO2FBQ2xDLE9BQXFDLEVBQXJDLEVBQUMsSUFBQyxDQUFBLHVDQUFBLCtCQUFGLEVBQUE7SUFITzs7OEJBS1QsSUFBQSxHQUFNLFNBQUMsUUFBRDtNQUFDLElBQUMsQ0FBQSxVQUFEO2FBQ0wsSUFBQyxDQUFBLEtBQUQsQ0FBQTtJQURJOzs4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Q3BCLFVBQUE7TUFBQSxPQUFlLElBQUMsQ0FBQSxNQUFNLENBQUMsY0FBUixDQUFBLENBQWYsRUFBQyxrQkFBRCxFQUFRO01BQ1IsS0FBQSxHQUFRLEtBQUssQ0FBQyxHQUFOLENBQVUsS0FBVixFQUFpQixHQUFHLENBQUMsU0FBSixDQUFjLENBQUMsQ0FBRCxFQUFJLENBQUMsQ0FBTCxDQUFkLENBQWpCO2FBQ1IsSUFBQyxDQUFBLFNBQVMsQ0FBQyxNQUFNLENBQUMsa0JBQWxCLENBQXFDLEtBQXJDO0lBSG9COzt1QkFLdEIsZUFBQSxHQUFpQixTQUFDLEdBQUQ7QUFDZixVQUFBO01BRGlCLHNCQUFELE1BQU87TUFDdkIsS0FBQSw4R0FBdUQsSUFBQyxDQUFBO01BQ3hELElBQUcsSUFBSDtlQUNFLEtBQUssQ0FBQyxHQUFOLENBQVUsSUFBQyxDQUFBLG9CQUFELENBQUEsQ0FBVixFQUFtQyxLQUFuQyxFQURGO09BQUEsTUFBQTtlQUdFLE1BSEY7O0lBRmU7O3VCQU9qQiwyQkFBQSxHQUE2QixTQUFDLFVBQUQ7YUFDM0IsSUFBQyxDQUFBLHVCQUF3QixDQUFBLFVBQUE7SUFERTs7dUJBRzdCLGVBQUEsR0FBaUIsU0FBQyxHQUFEO0FBQ2YsVUFBQTtNQURpQixzQkFBRCxNQUFPO01BQ3ZCLElBQUcsSUFBSDtlQUNFLElBQUMsQ0FBQSxlQUFELENBQWlCO1VBQUEsSUFBQSxFQUFNLElBQU47U0FBakIsRUFERjtPQUFBLE1BQUE7MkxBR3NGLENBQUUsZUFIeEY7O0lBRGU7Ozs7O0FBdkxuQiIsInNvdXJjZXNDb250ZW50IjpbIntQb2ludCwgQ29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlICdhdG9tJ1xuc3dyYXAgPSByZXF1aXJlICcuL3NlbGVjdGlvbi13cmFwcGVyJ1xuXG4jIGtlZXAgbXV0YXRpb24gc25hcHNob3QgbmVjZXNzYXJ5IGZvciBPcGVyYXRvciBwcm9jZXNzaW5nLlxuIyBtdXRhdGlvbiBzdG9yZWQgYnkgZWFjaCBTZWxlY3Rpb24gaGF2ZSBmb2xsb3dpbmcgZmllbGRcbiMgIG1hcmtlcjpcbiMgICAgbWFya2VyIHRvIHRyYWNrIG11dGF0aW9uLiBtYXJrZXIgaXMgY3JlYXRlZCB3aGVuIGBzZXRDaGVja3BvaW50YFxuIyAgY3JlYXRlZEF0OlxuIyAgICAnc3RyaW5nJyByZXByZXNlbnRpbmcgd2hlbiBtYXJrZXIgd2FzIGNyZWF0ZWQuXG4jICBjaGVja3BvaW50OiB7fVxuIyAgICBrZXkgaXMgWyd3aWxsLXNlbGVjdCcsICdkaWQtc2VsZWN0JywgJ3dpbGwtbXV0YXRlJywgJ2RpZC1tdXRhdGUnXVxuIyAgICBrZXkgaXMgY2hlY2twb2ludCwgdmFsdWUgaXMgYnVmZmVyUmFuZ2UgZm9yIG1hcmtlciBhdCB0aGF0IGNoZWNrcG9pbnRcbiMgIHNlbGVjdGlvbjpcbiMgICAgU2VsZWN0aW9uIGJlZWluZyB0cmFja2VkXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBNdXRhdGlvbk1hbmFnZXJcbiAgY29uc3RydWN0b3I6IChAdmltU3RhdGUpIC0+XG4gICAge0BlZGl0b3J9ID0gQHZpbVN0YXRlXG5cbiAgICBAZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuICAgIEBkaXNwb3NhYmxlcy5hZGQgQHZpbVN0YXRlLm9uRGlkRGVzdHJveShAZGVzdHJveS5iaW5kKHRoaXMpKVxuXG4gICAgQG1hcmtlckxheWVyID0gQGVkaXRvci5hZGRNYXJrZXJMYXllcigpXG4gICAgQG11dGF0aW9uc0J5U2VsZWN0aW9uID0gbmV3IE1hcFxuICAgIEBidWZmZXJSYW5nZXNGb3JDdXN0b21DaGVja3BvaW50ID0gW11cblxuICBkZXN0cm95OiAtPlxuICAgIEByZXNldCgpXG4gICAge0BtdXRhdGlvbnNCeVNlbGVjdGlvbiwgQGVkaXRvciwgQHZpbVN0YXRlfSA9IHt9XG4gICAge0BidWZmZXJSYW5nZXNGb3JDdXN0b21DaGVja3BvaW50fSA9IHt9XG5cbiAgaW5pdDogKEBvcHRpb25zKSAtPlxuICAgIEByZXNldCgpXG5cbiAgcmVzZXQ6IC0+XG4gICAgQGNsZWFyTWFya2VycygpXG4gICAgQG11dGF0aW9uc0J5U2VsZWN0aW9uLmNsZWFyKClcbiAgICBAYnVmZmVyUmFuZ2VzRm9yQ3VzdG9tQ2hlY2twb2ludCA9IFtdXG5cbiAgY2xlYXJNYXJrZXJzOiAocGF0dGVybikgLT5cbiAgICBmb3IgbWFya2VyIGluIEBtYXJrZXJMYXllci5nZXRNYXJrZXJzKClcbiAgICAgIG1hcmtlci5kZXN0cm95KClcblxuICBnZXRJbml0aWFsUG9pbnRGb3JTZWxlY3Rpb246IChzZWxlY3Rpb24sIG9wdGlvbnMpIC0+XG4gICAgQGdldE11dGF0aW9uRm9yU2VsZWN0aW9uKHNlbGVjdGlvbik/LmdldEluaXRpYWxQb2ludChvcHRpb25zKVxuXG4gIHNldENoZWNrcG9pbnQ6IChjaGVja3BvaW50KSAtPlxuICAgIGZvciBzZWxlY3Rpb24gaW4gQGVkaXRvci5nZXRTZWxlY3Rpb25zKClcbiAgICAgIGlmIEBtdXRhdGlvbnNCeVNlbGVjdGlvbi5oYXMoc2VsZWN0aW9uKVxuICAgICAgICBAbXV0YXRpb25zQnlTZWxlY3Rpb24uZ2V0KHNlbGVjdGlvbikudXBkYXRlKGNoZWNrcG9pbnQpXG5cbiAgICAgIGVsc2VcbiAgICAgICAgaW5pdGlhbFBvaW50ID1cbiAgICAgICAgICBpZiBAdmltU3RhdGUuaXNNb2RlKCd2aXN1YWwnKVxuICAgICAgICAgICAgc3dyYXAoc2VsZWN0aW9uKS5nZXRCdWZmZXJQb3NpdGlvbkZvcignaGVhZCcsIGZyb21Qcm9wZXJ0eTogdHJ1ZSwgYWxsb3dGYWxsYmFjazogdHJ1ZSlcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAjIFtGSVhNRV0gaW52ZXN0aWdhdGUgV0hZIEkgZGlkOiBpbml0aWFsUG9pbnQgY2FuIGJlIG51bGwgd2hlbiBpc1NlbGVjdCB3YXMgdHJ1ZVxuICAgICAgICAgICAgc3dyYXAoc2VsZWN0aW9uKS5nZXRCdWZmZXJQb3NpdGlvbkZvcignaGVhZCcpIHVubGVzcyBAb3B0aW9ucy5pc1NlbGVjdFxuXG4gICAgICAgIHt1c2VNYXJrZXJ9ID0gQG9wdGlvbnNcbiAgICAgICAgb3B0aW9ucyA9IHtzZWxlY3Rpb24sIGluaXRpYWxQb2ludCwgY2hlY2twb2ludCwgQG1hcmtlckxheWVyLCB1c2VNYXJrZXJ9XG4gICAgICAgIEBtdXRhdGlvbnNCeVNlbGVjdGlvbi5zZXQoc2VsZWN0aW9uLCBuZXcgTXV0YXRpb24ob3B0aW9ucykpXG5cbiAgZ2V0TXV0YXRpb25Gb3JTZWxlY3Rpb246IChzZWxlY3Rpb24pIC0+XG4gICAgQG11dGF0aW9uc0J5U2VsZWN0aW9uLmdldChzZWxlY3Rpb24pXG5cbiAgZ2V0TWFya2VyQnVmZmVyUmFuZ2VzOiAtPlxuICAgIHJhbmdlcyA9IFtdXG4gICAgQG11dGF0aW9uc0J5U2VsZWN0aW9uLmZvckVhY2ggKG11dGF0aW9uLCBzZWxlY3Rpb24pIC0+XG4gICAgICBpZiByYW5nZSA9IG11dGF0aW9uLm1hcmtlcj8uZ2V0QnVmZmVyUmFuZ2UoKVxuICAgICAgICByYW5nZXMucHVzaChyYW5nZSlcbiAgICByYW5nZXNcblxuICBnZXRCdWZmZXJSYW5nZXNGb3JDaGVja3BvaW50OiAoY2hlY2twb2ludCkgLT5cbiAgICAjIFtGSVhNRV0gZGlydHkgd29ya2Fyb3VuZCBqdXN0IHVzaW5nIG11dGF0aW9uTWFuYWdlciBhcyBtZXJlbHkgc3RhdGUgcmVnaXN0cnlcbiAgICBpZiBjaGVja3BvaW50IGlzICdjdXN0b20nXG4gICAgICByZXR1cm4gQGJ1ZmZlclJhbmdlc0ZvckN1c3RvbUNoZWNrcG9pbnRcblxuICAgIHJhbmdlcyA9IFtdXG4gICAgQG11dGF0aW9uc0J5U2VsZWN0aW9uLmZvckVhY2ggKG11dGF0aW9uKSAtPlxuICAgICAgaWYgcmFuZ2UgPSBtdXRhdGlvbi5nZXRCdWZmZXJSYW5nZUZvckNoZWNrcG9pbnQoY2hlY2twb2ludClcbiAgICAgICAgcmFuZ2VzLnB1c2gocmFuZ2UpXG4gICAgcmFuZ2VzXG5cbiAgIyBbRklYTUVdIGRpcnR5IHdvcmthcm91bmQganVzdCB1c2luZyBtdXRhdGlvbm1hbmFnZXIgZm9yIHN0YXRlIHJlZ2lzdHJ5XG4gIHNldEJ1ZmZlclJhbmdlc0ZvckN1c3RvbUNoZWNrcG9pbnQ6IChyYW5nZXMpIC0+XG4gICAgQGJ1ZmZlclJhbmdlc0ZvckN1c3RvbUNoZWNrcG9pbnQgPSByYW5nZXNcblxuICByZXN0b3JlSW5pdGlhbFBvc2l0aW9uczogLT5cbiAgICBmb3Igc2VsZWN0aW9uIGluIEBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpIHdoZW4gcG9pbnQgPSBAZ2V0SW5pdGlhbFBvaW50Rm9yU2VsZWN0aW9uKHNlbGVjdGlvbilcbiAgICAgIHNlbGVjdGlvbi5jdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24ocG9pbnQpXG5cbiAgcmVzdG9yZUN1cnNvclBvc2l0aW9uczogKG9wdGlvbnMpIC0+XG4gICAge3N0YXksIG9jY3VycmVuY2VTZWxlY3RlZCwgaXNCbG9ja3dpc2V9ID0gb3B0aW9uc1xuICAgIGlmIGlzQmxvY2t3aXNlXG4gICAgICAjIFtGSVhNRV0gd2h5IEkgbmVlZCB0aGlzIGRpcmVjdCBtYW51cGlsYXRpb24/XG4gICAgICAjIEJlY2F1c2UgdGhlcmUncyBidWcgdGhhdCBibG9ja3dpc2Ugc2VsZWNjdGlvbiBpcyBub3QgYWRkZXMgdG8gZWFjaFxuICAgICAgIyBic0luc3RhbmNlLnNlbGVjdGlvbi4gTmVlZCBpbnZlc3RpZ2F0aW9uLlxuICAgICAgcG9pbnRzID0gW11cbiAgICAgIEBtdXRhdGlvbnNCeVNlbGVjdGlvbi5mb3JFYWNoIChtdXRhdGlvbiwgc2VsZWN0aW9uKSAtPlxuICAgICAgICBwb2ludHMucHVzaChtdXRhdGlvbi5idWZmZXJSYW5nZUJ5Q2hlY2twb2ludFsnd2lsbC1zZWxlY3QnXT8uc3RhcnQpXG4gICAgICBwb2ludHMgPSBwb2ludHMuc29ydCAoYSwgYikgLT4gYS5jb21wYXJlKGIpXG4gICAgICBwb2ludHMgPSBwb2ludHMuZmlsdGVyIChwb2ludCkgLT4gcG9pbnQ/XG4gICAgICBpZiBAdmltU3RhdGUuaXNNb2RlKCd2aXN1YWwnLCAnYmxvY2t3aXNlJylcbiAgICAgICAgaWYgcG9pbnQgPSBwb2ludHNbMF1cbiAgICAgICAgICBAdmltU3RhdGUuZ2V0TGFzdEJsb2Nrd2lzZVNlbGVjdGlvbigpPy5zZXRIZWFkQnVmZmVyUG9zaXRpb24ocG9pbnQpXG4gICAgICBlbHNlXG4gICAgICAgIGlmIHBvaW50ID0gcG9pbnRzWzBdXG4gICAgICAgICAgQGVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihwb2ludClcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGZvciBzZWxlY3Rpb24gaW4gQGVkaXRvci5nZXRTZWxlY3Rpb25zKClcbiAgICAgICAgICAgIHNlbGVjdGlvbi5kZXN0cm95KCkgdW5sZXNzIHNlbGVjdGlvbi5pc0xhc3RTZWxlY3Rpb24oKVxuICAgIGVsc2VcbiAgICAgIGZvciBzZWxlY3Rpb24gaW4gQGVkaXRvci5nZXRTZWxlY3Rpb25zKCkgd2hlbiBtdXRhdGlvbiA9IEBtdXRhdGlvbnNCeVNlbGVjdGlvbi5nZXQoc2VsZWN0aW9uKVxuICAgICAgICBpZiBvY2N1cnJlbmNlU2VsZWN0ZWQgYW5kIG5vdCBtdXRhdGlvbi5pc0NyZWF0ZWRBdCgnd2lsbC1zZWxlY3QnKVxuICAgICAgICAgIHNlbGVjdGlvbi5kZXN0cm95KClcblxuICAgICAgICBpZiBvY2N1cnJlbmNlU2VsZWN0ZWQgYW5kIHN0YXlcbiAgICAgICAgICAjIFRoaXMgaXMgZXNzZW5jaWFsbHkgdG8gY2xpcFRvTXV0YXRpb25FbmQgd2hlbiBgZCBvIGZgLCBgZCBvIHBgIGNhc2UuXG4gICAgICAgICAgcG9pbnQgPSBAY2xpcFRvTXV0YXRpb25FbmRJZlNvbWVNdXRhdGlvbkNvbnRhaW5zUG9pbnQoQHZpbVN0YXRlLmdldE9yaWdpbmFsQ3Vyc29yUG9zaXRpb24oKSlcbiAgICAgICAgICBzZWxlY3Rpb24uY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHBvaW50KVxuICAgICAgICBlbHNlIGlmIHBvaW50ID0gbXV0YXRpb24uZ2V0UmVzdG9yZVBvaW50KHtzdGF5fSlcbiAgICAgICAgICBzZWxlY3Rpb24uY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHBvaW50KVxuXG4gIGNsaXBUb011dGF0aW9uRW5kSWZTb21lTXV0YXRpb25Db250YWluc1BvaW50OiAocG9pbnQpIC0+XG4gICAgaWYgbXV0YXRpb24gPSBAZmluZE11dGF0aW9uQ29udGFpbnNQb2ludEF0Q2hlY2twb2ludChwb2ludCwgJ2RpZC1zZWxlY3Qtb2NjdXJyZW5jZScpXG4gICAgICBQb2ludC5taW4obXV0YXRpb24uZ2V0RW5kQnVmZmVyUG9zaXRpb24oKSwgcG9pbnQpXG4gICAgZWxzZVxuICAgICAgcG9pbnRcblxuICBmaW5kTXV0YXRpb25Db250YWluc1BvaW50QXRDaGVja3BvaW50OiAocG9pbnQsIGNoZWNrcG9pbnQpIC0+XG4gICAgIyBDb2ZmZWVzY3JpcHQgY2Fubm90IGl0ZXJhdGUgb3ZlciBpdGVyYXRvciBieSBKYXZhU2NyaXB0J3MgJ29mJyBiZWNhdXNlIG9mIHN5bnRheCBjb25mbGljdHMuXG4gICAgaXRlcmF0b3IgPSBAbXV0YXRpb25zQnlTZWxlY3Rpb24udmFsdWVzKClcbiAgICB3aGlsZSAoZW50cnkgPSBpdGVyYXRvci5uZXh0KCkpIGFuZCBub3QgZW50cnkuZG9uZVxuICAgICAgbXV0YXRpb24gPSBlbnRyeS52YWx1ZVxuICAgICAgaWYgbXV0YXRpb24uZ2V0QnVmZmVyUmFuZ2VGb3JDaGVja3BvaW50KGNoZWNrcG9pbnQpLmNvbnRhaW5zUG9pbnQocG9pbnQpXG4gICAgICAgIHJldHVybiBtdXRhdGlvblxuXG4jIE11dGF0aW9uIGluZm9ybWF0aW9uIGlzIGNyZWF0ZWQgZXZlbiBpZiBzZWxlY3Rpb24uaXNFbXB0eSgpXG4jIFNvIHRoYXQgd2UgY2FuIGZpbHRlciBzZWxlY3Rpb24gYnkgd2hlbiBpdCB3YXMgY3JlYXRlZC5cbiMgIGUuZy4gU29tZSBzZWxlY3Rpb24gaXMgY3JlYXRlZCBhdCAnd2lsbC1zZWxlY3QnIGNoZWNrcG9pbnQsIG90aGVycyBhdCAnZGlkLXNlbGVjdCcgb3IgJ2RpZC1zZWxlY3Qtb2NjdXJyZW5jZSdcbmNsYXNzIE11dGF0aW9uXG4gIGNvbnN0cnVjdG9yOiAob3B0aW9ucykgLT5cbiAgICB7QHNlbGVjdGlvbiwgQGluaXRpYWxQb2ludCwgY2hlY2twb2ludCwgQG1hcmtlckxheWVyLCBAdXNlTWFya2VyfSA9IG9wdGlvbnNcblxuICAgIEBjcmVhdGVkQXQgPSBjaGVja3BvaW50XG4gICAgaWYgQHVzZU1hcmtlclxuICAgICAgQGluaXRpYWxQb2ludE1hcmtlciA9IEBtYXJrZXJMYXllci5tYXJrQnVmZmVyUG9zaXRpb24oQGluaXRpYWxQb2ludCwgaW52YWxpZGF0ZTogJ25ldmVyJylcbiAgICBAYnVmZmVyUmFuZ2VCeUNoZWNrcG9pbnQgPSB7fVxuICAgIEBtYXJrZXIgPSBudWxsXG4gICAgQHVwZGF0ZShjaGVja3BvaW50KVxuXG4gIGlzQ3JlYXRlZEF0OiAodGltaW5nKSAtPlxuICAgIEBjcmVhdGVkQXQgaXMgdGltaW5nXG5cbiAgdXBkYXRlOiAoY2hlY2twb2ludCkgLT5cbiAgICAjIEN1cnJlbnQgbm9uLWVtcHR5IHNlbGVjdGlvbiBpcyBwcmlvcml0aXplZCBvdmVyIGV4aXN0aW5nIG1hcmtlcidzIHJhbmdlLlxuICAgICMgV2UgaW52YWxpZGF0ZSBvbGQgbWFya2VyIHRvIHJlLXRyYWNrIGZyb20gY3VycmVudCBzZWxlY3Rpb24uXG4gICAgdW5sZXNzIEBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKS5pc0VtcHR5KClcbiAgICAgIEBtYXJrZXI/LmRlc3Ryb3koKVxuICAgICAgQG1hcmtlciA9IG51bGxcblxuICAgIEBtYXJrZXIgPz0gQG1hcmtlckxheWVyLm1hcmtCdWZmZXJSYW5nZShAc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKCksIGludmFsaWRhdGU6ICduZXZlcicpXG4gICAgQGJ1ZmZlclJhbmdlQnlDaGVja3BvaW50W2NoZWNrcG9pbnRdID0gQG1hcmtlci5nZXRCdWZmZXJSYW5nZSgpXG5cbiAgZ2V0U3RhcnRCdWZmZXJQb3NpdGlvbjogLT5cbiAgICBAbWFya2VyLmdldEJ1ZmZlclJhbmdlKCkuc3RhcnRcblxuICBnZXRFbmRCdWZmZXJQb3NpdGlvbjogLT5cbiAgICB7c3RhcnQsIGVuZH0gPSBAbWFya2VyLmdldEJ1ZmZlclJhbmdlKClcbiAgICBwb2ludCA9IFBvaW50Lm1heChzdGFydCwgZW5kLnRyYW5zbGF0ZShbMCwgLTFdKSlcbiAgICBAc2VsZWN0aW9uLmVkaXRvci5jbGlwQnVmZmVyUG9zaXRpb24ocG9pbnQpXG5cbiAgZ2V0SW5pdGlhbFBvaW50OiAoe2NsaXB9PXt9KSAtPlxuICAgIHBvaW50ID0gQGluaXRpYWxQb2ludE1hcmtlcj8uZ2V0SGVhZEJ1ZmZlclBvc2l0aW9uKCkgPyBAaW5pdGlhbFBvaW50XG4gICAgaWYgY2xpcFxuICAgICAgUG9pbnQubWluKEBnZXRFbmRCdWZmZXJQb3NpdGlvbigpLCBwb2ludClcbiAgICBlbHNlXG4gICAgICBwb2ludFxuXG4gIGdldEJ1ZmZlclJhbmdlRm9yQ2hlY2twb2ludDogKGNoZWNrcG9pbnQpIC0+XG4gICAgQGJ1ZmZlclJhbmdlQnlDaGVja3BvaW50W2NoZWNrcG9pbnRdXG5cbiAgZ2V0UmVzdG9yZVBvaW50OiAoe3N0YXl9PXt9KSAtPlxuICAgIGlmIHN0YXlcbiAgICAgIEBnZXRJbml0aWFsUG9pbnQoY2xpcDogdHJ1ZSlcbiAgICBlbHNlXG4gICAgICBAYnVmZmVyUmFuZ2VCeUNoZWNrcG9pbnRbJ2RpZC1tb3ZlJ10/LnN0YXJ0ID8gQGJ1ZmZlclJhbmdlQnlDaGVja3BvaW50WydkaWQtc2VsZWN0J10/LnN0YXJ0XG4iXX0=
