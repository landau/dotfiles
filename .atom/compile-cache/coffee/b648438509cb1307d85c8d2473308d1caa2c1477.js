(function() {
  var PersistentSelectionManager, _, decorationOptions,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  _ = require('underscore-plus');

  decorationOptions = {
    type: 'highlight',
    "class": 'vim-mode-plus-persistent-selection'
  };

  module.exports = PersistentSelectionManager = (function() {
    PersistentSelectionManager.prototype.patterns = null;

    function PersistentSelectionManager(vimState) {
      var ref;
      this.vimState = vimState;
      this.destroy = bind(this.destroy, this);
      ref = this.vimState, this.editor = ref.editor, this.editorElement = ref.editorElement;
      this.vimState.onDidDestroy(this.destroy);
      this.markerLayer = this.editor.addMarkerLayer();
      this.decorationLayer = this.editor.decorateMarkerLayer(this.markerLayer, decorationOptions);
      this.markerLayer.onDidUpdate((function(_this) {
        return function() {
          return _this.editorElement.classList.toggle("has-persistent-selection", _this.hasMarkers());
        };
      })(this));
    }

    PersistentSelectionManager.prototype.destroy = function() {
      this.decorationLayer.destroy();
      return this.markerLayer.destroy();
    };

    PersistentSelectionManager.prototype.select = function() {
      var i, len, range, ref;
      ref = this.getMarkerBufferRanges();
      for (i = 0, len = ref.length; i < len; i++) {
        range = ref[i];
        this.editor.addSelectionForBufferRange(range);
      }
      return this.clear();
    };

    PersistentSelectionManager.prototype.setSelectedBufferRanges = function() {
      this.editor.setSelectedBufferRanges(this.getMarkerBufferRanges());
      return this.clear();
    };

    PersistentSelectionManager.prototype.clear = function() {
      return this.clearMarkers();
    };

    PersistentSelectionManager.prototype.isEmpty = function() {
      return this.markerLayer.getMarkerCount() === 0;
    };

    PersistentSelectionManager.prototype.markBufferRange = function(range) {
      return this.markerLayer.markBufferRange(range);
    };

    PersistentSelectionManager.prototype.hasMarkers = function() {
      return this.markerLayer.getMarkerCount() > 0;
    };

    PersistentSelectionManager.prototype.getMarkers = function() {
      return this.markerLayer.getMarkers();
    };

    PersistentSelectionManager.prototype.getMarkerCount = function() {
      return this.markerLayer.getMarkerCount();
    };

    PersistentSelectionManager.prototype.clearMarkers = function() {
      return this.markerLayer.clear();
    };

    PersistentSelectionManager.prototype.getMarkerBufferRanges = function() {
      return this.markerLayer.getMarkers().map(function(marker) {
        return marker.getBufferRange();
      });
    };

    PersistentSelectionManager.prototype.getMarkerAtPoint = function(point) {
      return this.markerLayer.findMarkers({
        containsBufferPosition: point
      })[0];
    };

    return PersistentSelectionManager;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvcGVyc2lzdGVudC1zZWxlY3Rpb24tbWFuYWdlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLGdEQUFBO0lBQUE7O0VBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUjs7RUFFSixpQkFBQSxHQUFvQjtJQUFDLElBQUEsRUFBTSxXQUFQO0lBQW9CLENBQUEsS0FBQSxDQUFBLEVBQU8sb0NBQTNCOzs7RUFFcEIsTUFBTSxDQUFDLE9BQVAsR0FDTTt5Q0FDSixRQUFBLEdBQVU7O0lBRUcsb0NBQUMsUUFBRDtBQUNYLFVBQUE7TUFEWSxJQUFDLENBQUEsV0FBRDs7TUFDWixNQUE0QixJQUFDLENBQUEsUUFBN0IsRUFBQyxJQUFDLENBQUEsYUFBQSxNQUFGLEVBQVUsSUFBQyxDQUFBLG9CQUFBO01BQ1gsSUFBQyxDQUFBLFFBQVEsQ0FBQyxZQUFWLENBQXVCLElBQUMsQ0FBQSxPQUF4QjtNQUVBLElBQUMsQ0FBQSxXQUFELEdBQWUsSUFBQyxDQUFBLE1BQU0sQ0FBQyxjQUFSLENBQUE7TUFDZixJQUFDLENBQUEsZUFBRCxHQUFtQixJQUFDLENBQUEsTUFBTSxDQUFDLG1CQUFSLENBQTRCLElBQUMsQ0FBQSxXQUE3QixFQUEwQyxpQkFBMUM7TUFHbkIsSUFBQyxDQUFBLFdBQVcsQ0FBQyxXQUFiLENBQXlCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtpQkFDdkIsS0FBQyxDQUFBLGFBQWEsQ0FBQyxTQUFTLENBQUMsTUFBekIsQ0FBZ0MsMEJBQWhDLEVBQTRELEtBQUMsQ0FBQSxVQUFELENBQUEsQ0FBNUQ7UUFEdUI7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXpCO0lBUlc7O3lDQVdiLE9BQUEsR0FBUyxTQUFBO01BQ1AsSUFBQyxDQUFBLGVBQWUsQ0FBQyxPQUFqQixDQUFBO2FBQ0EsSUFBQyxDQUFBLFdBQVcsQ0FBQyxPQUFiLENBQUE7SUFGTzs7eUNBSVQsTUFBQSxHQUFRLFNBQUE7QUFDTixVQUFBO0FBQUE7QUFBQSxXQUFBLHFDQUFBOztRQUNFLElBQUMsQ0FBQSxNQUFNLENBQUMsMEJBQVIsQ0FBbUMsS0FBbkM7QUFERjthQUVBLElBQUMsQ0FBQSxLQUFELENBQUE7SUFITTs7eUNBS1IsdUJBQUEsR0FBeUIsU0FBQTtNQUN2QixJQUFDLENBQUEsTUFBTSxDQUFDLHVCQUFSLENBQWdDLElBQUMsQ0FBQSxxQkFBRCxDQUFBLENBQWhDO2FBQ0EsSUFBQyxDQUFBLEtBQUQsQ0FBQTtJQUZ1Qjs7eUNBSXpCLEtBQUEsR0FBTyxTQUFBO2FBQ0wsSUFBQyxDQUFBLFlBQUQsQ0FBQTtJQURLOzt5Q0FHUCxPQUFBLEdBQVMsU0FBQTthQUNQLElBQUMsQ0FBQSxXQUFXLENBQUMsY0FBYixDQUFBLENBQUEsS0FBaUM7SUFEMUI7O3lDQUtULGVBQUEsR0FBaUIsU0FBQyxLQUFEO2FBQ2YsSUFBQyxDQUFBLFdBQVcsQ0FBQyxlQUFiLENBQTZCLEtBQTdCO0lBRGU7O3lDQUdqQixVQUFBLEdBQVksU0FBQTthQUNWLElBQUMsQ0FBQSxXQUFXLENBQUMsY0FBYixDQUFBLENBQUEsR0FBZ0M7SUFEdEI7O3lDQUdaLFVBQUEsR0FBWSxTQUFBO2FBQ1YsSUFBQyxDQUFBLFdBQVcsQ0FBQyxVQUFiLENBQUE7SUFEVTs7eUNBR1osY0FBQSxHQUFnQixTQUFBO2FBQ2QsSUFBQyxDQUFBLFdBQVcsQ0FBQyxjQUFiLENBQUE7SUFEYzs7eUNBR2hCLFlBQUEsR0FBYyxTQUFBO2FBQ1osSUFBQyxDQUFBLFdBQVcsQ0FBQyxLQUFiLENBQUE7SUFEWTs7eUNBR2QscUJBQUEsR0FBdUIsU0FBQTthQUNyQixJQUFDLENBQUEsV0FBVyxDQUFDLFVBQWIsQ0FBQSxDQUF5QixDQUFDLEdBQTFCLENBQThCLFNBQUMsTUFBRDtlQUM1QixNQUFNLENBQUMsY0FBUCxDQUFBO01BRDRCLENBQTlCO0lBRHFCOzt5Q0FJdkIsZ0JBQUEsR0FBa0IsU0FBQyxLQUFEO2FBQ2hCLElBQUMsQ0FBQSxXQUFXLENBQUMsV0FBYixDQUF5QjtRQUFBLHNCQUFBLEVBQXdCLEtBQXhCO09BQXpCLENBQXdELENBQUEsQ0FBQTtJQUR4Qzs7Ozs7QUEzRHBCIiwic291cmNlc0NvbnRlbnQiOlsiXyA9IHJlcXVpcmUgJ3VuZGVyc2NvcmUtcGx1cydcblxuZGVjb3JhdGlvbk9wdGlvbnMgPSB7dHlwZTogJ2hpZ2hsaWdodCcsIGNsYXNzOiAndmltLW1vZGUtcGx1cy1wZXJzaXN0ZW50LXNlbGVjdGlvbid9XG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIFBlcnNpc3RlbnRTZWxlY3Rpb25NYW5hZ2VyXG4gIHBhdHRlcm5zOiBudWxsXG5cbiAgY29uc3RydWN0b3I6IChAdmltU3RhdGUpIC0+XG4gICAge0BlZGl0b3IsIEBlZGl0b3JFbGVtZW50fSA9IEB2aW1TdGF0ZVxuICAgIEB2aW1TdGF0ZS5vbkRpZERlc3Ryb3koQGRlc3Ryb3kpXG5cbiAgICBAbWFya2VyTGF5ZXIgPSBAZWRpdG9yLmFkZE1hcmtlckxheWVyKClcbiAgICBAZGVjb3JhdGlvbkxheWVyID0gQGVkaXRvci5kZWNvcmF0ZU1hcmtlckxheWVyKEBtYXJrZXJMYXllciwgZGVjb3JhdGlvbk9wdGlvbnMpXG5cbiAgICAjIFVwZGF0ZSBjc3Mgb24gZXZlcnkgbWFya2VyIHVwZGF0ZS5cbiAgICBAbWFya2VyTGF5ZXIub25EaWRVcGRhdGUgPT5cbiAgICAgIEBlZGl0b3JFbGVtZW50LmNsYXNzTGlzdC50b2dnbGUoXCJoYXMtcGVyc2lzdGVudC1zZWxlY3Rpb25cIiwgQGhhc01hcmtlcnMoKSlcblxuICBkZXN0cm95OiA9PlxuICAgIEBkZWNvcmF0aW9uTGF5ZXIuZGVzdHJveSgpXG4gICAgQG1hcmtlckxheWVyLmRlc3Ryb3koKVxuXG4gIHNlbGVjdDogLT5cbiAgICBmb3IgcmFuZ2UgaW4gQGdldE1hcmtlckJ1ZmZlclJhbmdlcygpXG4gICAgICBAZWRpdG9yLmFkZFNlbGVjdGlvbkZvckJ1ZmZlclJhbmdlKHJhbmdlKVxuICAgIEBjbGVhcigpXG5cbiAgc2V0U2VsZWN0ZWRCdWZmZXJSYW5nZXM6IC0+XG4gICAgQGVkaXRvci5zZXRTZWxlY3RlZEJ1ZmZlclJhbmdlcyhAZ2V0TWFya2VyQnVmZmVyUmFuZ2VzKCkpXG4gICAgQGNsZWFyKClcblxuICBjbGVhcjogLT5cbiAgICBAY2xlYXJNYXJrZXJzKClcblxuICBpc0VtcHR5OiAtPlxuICAgIEBtYXJrZXJMYXllci5nZXRNYXJrZXJDb3VudCgpIGlzIDBcblxuICAjIE1hcmtlcnNcbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIG1hcmtCdWZmZXJSYW5nZTogKHJhbmdlKSAtPlxuICAgIEBtYXJrZXJMYXllci5tYXJrQnVmZmVyUmFuZ2UocmFuZ2UpXG5cbiAgaGFzTWFya2VyczogLT5cbiAgICBAbWFya2VyTGF5ZXIuZ2V0TWFya2VyQ291bnQoKSA+IDBcblxuICBnZXRNYXJrZXJzOiAtPlxuICAgIEBtYXJrZXJMYXllci5nZXRNYXJrZXJzKClcblxuICBnZXRNYXJrZXJDb3VudDogLT5cbiAgICBAbWFya2VyTGF5ZXIuZ2V0TWFya2VyQ291bnQoKVxuXG4gIGNsZWFyTWFya2VyczogLT5cbiAgICBAbWFya2VyTGF5ZXIuY2xlYXIoKVxuXG4gIGdldE1hcmtlckJ1ZmZlclJhbmdlczogLT5cbiAgICBAbWFya2VyTGF5ZXIuZ2V0TWFya2VycygpLm1hcCAobWFya2VyKSAtPlxuICAgICAgbWFya2VyLmdldEJ1ZmZlclJhbmdlKClcblxuICBnZXRNYXJrZXJBdFBvaW50OiAocG9pbnQpIC0+XG4gICAgQG1hcmtlckxheWVyLmZpbmRNYXJrZXJzKGNvbnRhaW5zQnVmZmVyUG9zaXRpb246IHBvaW50KVswXVxuIl19
