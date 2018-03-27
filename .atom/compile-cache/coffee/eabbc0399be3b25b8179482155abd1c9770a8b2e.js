(function() {
  var CompositeDisposable, PersistentSelectionManager, _;

  _ = require('underscore-plus');

  CompositeDisposable = require('atom').CompositeDisposable;

  module.exports = PersistentSelectionManager = (function() {
    PersistentSelectionManager.prototype.patterns = null;

    function PersistentSelectionManager(vimState) {
      var options, ref;
      this.vimState = vimState;
      ref = this.vimState, this.editor = ref.editor, this.editorElement = ref.editorElement;
      this.disposables = new CompositeDisposable;
      this.disposables.add(this.vimState.onDidDestroy(this.destroy.bind(this)));
      this.markerLayer = this.editor.addMarkerLayer();
      options = {
        type: 'highlight',
        "class": 'vim-mode-plus-persistent-selection'
      };
      this.decorationLayer = this.editor.decorateMarkerLayer(this.markerLayer, options);
      this.markerLayer.onDidUpdate((function(_this) {
        return function() {
          return _this.editorElement.classList.toggle("has-persistent-selection", _this.hasMarkers());
        };
      })(this));
    }

    PersistentSelectionManager.prototype.destroy = function() {
      this.decorationLayer.destroy();
      this.disposables.dispose();
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
      var i, len, marker, ref, results;
      ref = this.markerLayer.getMarkers();
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        marker = ref[i];
        results.push(marker.destroy());
      }
      return results;
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvcGVyc2lzdGVudC1zZWxlY3Rpb24tbWFuYWdlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVI7O0VBQ0gsc0JBQXVCLE9BQUEsQ0FBUSxNQUFSOztFQUV4QixNQUFNLENBQUMsT0FBUCxHQUNNO3lDQUNKLFFBQUEsR0FBVTs7SUFFRyxvQ0FBQyxRQUFEO0FBQ1gsVUFBQTtNQURZLElBQUMsQ0FBQSxXQUFEO01BQ1osTUFBNEIsSUFBQyxDQUFBLFFBQTdCLEVBQUMsSUFBQyxDQUFBLGFBQUEsTUFBRixFQUFVLElBQUMsQ0FBQSxvQkFBQTtNQUNYLElBQUMsQ0FBQSxXQUFELEdBQWUsSUFBSTtNQUNuQixJQUFDLENBQUEsV0FBVyxDQUFDLEdBQWIsQ0FBaUIsSUFBQyxDQUFBLFFBQVEsQ0FBQyxZQUFWLENBQXVCLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFjLElBQWQsQ0FBdkIsQ0FBakI7TUFFQSxJQUFDLENBQUEsV0FBRCxHQUFlLElBQUMsQ0FBQSxNQUFNLENBQUMsY0FBUixDQUFBO01BQ2YsT0FBQSxHQUFVO1FBQUMsSUFBQSxFQUFNLFdBQVA7UUFBb0IsQ0FBQSxLQUFBLENBQUEsRUFBTyxvQ0FBM0I7O01BQ1YsSUFBQyxDQUFBLGVBQUQsR0FBbUIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxtQkFBUixDQUE0QixJQUFDLENBQUEsV0FBN0IsRUFBMEMsT0FBMUM7TUFHbkIsSUFBQyxDQUFBLFdBQVcsQ0FBQyxXQUFiLENBQXlCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtpQkFDdkIsS0FBQyxDQUFBLGFBQWEsQ0FBQyxTQUFTLENBQUMsTUFBekIsQ0FBZ0MsMEJBQWhDLEVBQTRELEtBQUMsQ0FBQSxVQUFELENBQUEsQ0FBNUQ7UUFEdUI7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXpCO0lBVlc7O3lDQWFiLE9BQUEsR0FBUyxTQUFBO01BQ1AsSUFBQyxDQUFBLGVBQWUsQ0FBQyxPQUFqQixDQUFBO01BQ0EsSUFBQyxDQUFBLFdBQVcsQ0FBQyxPQUFiLENBQUE7YUFDQSxJQUFDLENBQUEsV0FBVyxDQUFDLE9BQWIsQ0FBQTtJQUhPOzt5Q0FLVCxNQUFBLEdBQVEsU0FBQTtBQUNOLFVBQUE7QUFBQTtBQUFBLFdBQUEscUNBQUE7O1FBQ0UsSUFBQyxDQUFBLE1BQU0sQ0FBQywwQkFBUixDQUFtQyxLQUFuQztBQURGO2FBRUEsSUFBQyxDQUFBLEtBQUQsQ0FBQTtJQUhNOzt5Q0FLUix1QkFBQSxHQUF5QixTQUFBO01BQ3ZCLElBQUMsQ0FBQSxNQUFNLENBQUMsdUJBQVIsQ0FBZ0MsSUFBQyxDQUFBLHFCQUFELENBQUEsQ0FBaEM7YUFDQSxJQUFDLENBQUEsS0FBRCxDQUFBO0lBRnVCOzt5Q0FJekIsS0FBQSxHQUFPLFNBQUE7YUFDTCxJQUFDLENBQUEsWUFBRCxDQUFBO0lBREs7O3lDQUdQLE9BQUEsR0FBUyxTQUFBO2FBQ1AsSUFBQyxDQUFBLFdBQVcsQ0FBQyxjQUFiLENBQUEsQ0FBQSxLQUFpQztJQUQxQjs7eUNBS1QsZUFBQSxHQUFpQixTQUFDLEtBQUQ7YUFDZixJQUFDLENBQUEsV0FBVyxDQUFDLGVBQWIsQ0FBNkIsS0FBN0I7SUFEZTs7eUNBR2pCLFVBQUEsR0FBWSxTQUFBO2FBQ1YsSUFBQyxDQUFBLFdBQVcsQ0FBQyxjQUFiLENBQUEsQ0FBQSxHQUFnQztJQUR0Qjs7eUNBR1osVUFBQSxHQUFZLFNBQUE7YUFDVixJQUFDLENBQUEsV0FBVyxDQUFDLFVBQWIsQ0FBQTtJQURVOzt5Q0FHWixjQUFBLEdBQWdCLFNBQUE7YUFDZCxJQUFDLENBQUEsV0FBVyxDQUFDLGNBQWIsQ0FBQTtJQURjOzt5Q0FHaEIsWUFBQSxHQUFjLFNBQUE7QUFDWixVQUFBO0FBQUE7QUFBQTtXQUFBLHFDQUFBOztxQkFBQSxNQUFNLENBQUMsT0FBUCxDQUFBO0FBQUE7O0lBRFk7O3lDQUdkLHFCQUFBLEdBQXVCLFNBQUE7YUFDckIsSUFBQyxDQUFBLFdBQVcsQ0FBQyxVQUFiLENBQUEsQ0FBeUIsQ0FBQyxHQUExQixDQUE4QixTQUFDLE1BQUQ7ZUFDNUIsTUFBTSxDQUFDLGNBQVAsQ0FBQTtNQUQ0QixDQUE5QjtJQURxQjs7eUNBSXZCLGdCQUFBLEdBQWtCLFNBQUMsS0FBRDthQUNoQixJQUFDLENBQUEsV0FBVyxDQUFDLFdBQWIsQ0FBeUI7UUFBQSxzQkFBQSxFQUF3QixLQUF4QjtPQUF6QixDQUF3RCxDQUFBLENBQUE7SUFEeEM7Ozs7O0FBN0RwQiIsInNvdXJjZXNDb250ZW50IjpbIl8gPSByZXF1aXJlICd1bmRlcnNjb3JlLXBsdXMnXG57Q29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlICdhdG9tJ1xuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBQZXJzaXN0ZW50U2VsZWN0aW9uTWFuYWdlclxuICBwYXR0ZXJuczogbnVsbFxuXG4gIGNvbnN0cnVjdG9yOiAoQHZpbVN0YXRlKSAtPlxuICAgIHtAZWRpdG9yLCBAZWRpdG9yRWxlbWVudH0gPSBAdmltU3RhdGVcbiAgICBAZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuICAgIEBkaXNwb3NhYmxlcy5hZGQgQHZpbVN0YXRlLm9uRGlkRGVzdHJveShAZGVzdHJveS5iaW5kKHRoaXMpKVxuXG4gICAgQG1hcmtlckxheWVyID0gQGVkaXRvci5hZGRNYXJrZXJMYXllcigpXG4gICAgb3B0aW9ucyA9IHt0eXBlOiAnaGlnaGxpZ2h0JywgY2xhc3M6ICd2aW0tbW9kZS1wbHVzLXBlcnNpc3RlbnQtc2VsZWN0aW9uJ31cbiAgICBAZGVjb3JhdGlvbkxheWVyID0gQGVkaXRvci5kZWNvcmF0ZU1hcmtlckxheWVyKEBtYXJrZXJMYXllciwgb3B0aW9ucylcblxuICAgICMgVXBkYXRlIGNzcyBvbiBldmVyeSBtYXJrZXIgdXBkYXRlLlxuICAgIEBtYXJrZXJMYXllci5vbkRpZFVwZGF0ZSA9PlxuICAgICAgQGVkaXRvckVsZW1lbnQuY2xhc3NMaXN0LnRvZ2dsZShcImhhcy1wZXJzaXN0ZW50LXNlbGVjdGlvblwiLCBAaGFzTWFya2VycygpKVxuXG4gIGRlc3Ryb3k6IC0+XG4gICAgQGRlY29yYXRpb25MYXllci5kZXN0cm95KClcbiAgICBAZGlzcG9zYWJsZXMuZGlzcG9zZSgpXG4gICAgQG1hcmtlckxheWVyLmRlc3Ryb3koKVxuXG4gIHNlbGVjdDogLT5cbiAgICBmb3IgcmFuZ2UgaW4gQGdldE1hcmtlckJ1ZmZlclJhbmdlcygpXG4gICAgICBAZWRpdG9yLmFkZFNlbGVjdGlvbkZvckJ1ZmZlclJhbmdlKHJhbmdlKVxuICAgIEBjbGVhcigpXG5cbiAgc2V0U2VsZWN0ZWRCdWZmZXJSYW5nZXM6IC0+XG4gICAgQGVkaXRvci5zZXRTZWxlY3RlZEJ1ZmZlclJhbmdlcyhAZ2V0TWFya2VyQnVmZmVyUmFuZ2VzKCkpXG4gICAgQGNsZWFyKClcblxuICBjbGVhcjogLT5cbiAgICBAY2xlYXJNYXJrZXJzKClcblxuICBpc0VtcHR5OiAtPlxuICAgIEBtYXJrZXJMYXllci5nZXRNYXJrZXJDb3VudCgpIGlzIDBcblxuICAjIE1hcmtlcnNcbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIG1hcmtCdWZmZXJSYW5nZTogKHJhbmdlKSAtPlxuICAgIEBtYXJrZXJMYXllci5tYXJrQnVmZmVyUmFuZ2UocmFuZ2UpXG5cbiAgaGFzTWFya2VyczogLT5cbiAgICBAbWFya2VyTGF5ZXIuZ2V0TWFya2VyQ291bnQoKSA+IDBcblxuICBnZXRNYXJrZXJzOiAtPlxuICAgIEBtYXJrZXJMYXllci5nZXRNYXJrZXJzKClcblxuICBnZXRNYXJrZXJDb3VudDogLT5cbiAgICBAbWFya2VyTGF5ZXIuZ2V0TWFya2VyQ291bnQoKVxuXG4gIGNsZWFyTWFya2VyczogLT5cbiAgICBtYXJrZXIuZGVzdHJveSgpIGZvciBtYXJrZXIgaW4gQG1hcmtlckxheWVyLmdldE1hcmtlcnMoKVxuXG4gIGdldE1hcmtlckJ1ZmZlclJhbmdlczogLT5cbiAgICBAbWFya2VyTGF5ZXIuZ2V0TWFya2VycygpLm1hcCAobWFya2VyKSAtPlxuICAgICAgbWFya2VyLmdldEJ1ZmZlclJhbmdlKClcblxuICBnZXRNYXJrZXJBdFBvaW50OiAocG9pbnQpIC0+XG4gICAgQG1hcmtlckxheWVyLmZpbmRNYXJrZXJzKGNvbnRhaW5zQnVmZmVyUG9zaXRpb246IHBvaW50KVswXVxuIl19
