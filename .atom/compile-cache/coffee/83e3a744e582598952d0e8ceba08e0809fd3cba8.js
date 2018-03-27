(function() {
  var CompositeDisposable, HighlightSearchManager,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  CompositeDisposable = require('atom').CompositeDisposable;

  module.exports = HighlightSearchManager = (function() {
    function HighlightSearchManager(vimState) {
      var decorationOptions, ref;
      this.vimState = vimState;
      this.destroy = bind(this.destroy, this);
      ref = this.vimState, this.editor = ref.editor, this.editorElement = ref.editorElement, this.globalState = ref.globalState;
      this.disposables = new CompositeDisposable;
      this.disposables.add(this.vimState.onDidDestroy(this.destroy));
      this.disposables.add(this.editor.onDidStopChanging((function(_this) {
        return function() {
          return _this.refresh();
        };
      })(this)));
      this.markerLayer = this.editor.addMarkerLayer();
      decorationOptions = {
        type: 'highlight',
        "class": 'vim-mode-plus-highlight-search'
      };
      this.decorationLayer = this.editor.decorateMarkerLayer(this.markerLayer, decorationOptions);
    }

    HighlightSearchManager.prototype.destroy = function() {
      this.decorationLayer.destroy();
      this.disposables.dispose();
      return this.markerLayer.destroy();
    };

    HighlightSearchManager.prototype.hasMarkers = function() {
      return this.markerLayer.getMarkerCount() > 0;
    };

    HighlightSearchManager.prototype.getMarkers = function() {
      return this.markerLayer.getMarkers();
    };

    HighlightSearchManager.prototype.clearMarkers = function() {
      return this.markerLayer.clear();
    };

    HighlightSearchManager.prototype.refresh = function() {
      var i, len, pattern, range, ref, results;
      this.clearMarkers();
      if (!this.vimState.getConfig('highlightSearch')) {
        return;
      }
      if (!this.vimState.isVisible()) {
        return;
      }
      if (!(pattern = this.globalState.get('highlightSearchPattern'))) {
        return;
      }
      if (this.vimState.utils.matchScopes(this.editorElement, this.vimState.getConfig('highlightSearchExcludeScopes'))) {
        return;
      }
      ref = this.vimState.utils.scanEditor(this.editor, pattern);
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        range = ref[i];
        if (!range.isEmpty()) {
          results.push(this.markerLayer.markBufferRange(range, {
            invalidate: 'inside'
          }));
        }
      }
      return results;
    };

    return HighlightSearchManager;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvaGlnaGxpZ2h0LXNlYXJjaC1tYW5hZ2VyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsMkNBQUE7SUFBQTs7RUFBQyxzQkFBdUIsT0FBQSxDQUFRLE1BQVI7O0VBR3hCLE1BQU0sQ0FBQyxPQUFQLEdBQ007SUFDUyxnQ0FBQyxRQUFEO0FBQ1gsVUFBQTtNQURZLElBQUMsQ0FBQSxXQUFEOztNQUNaLE1BQTBDLElBQUMsQ0FBQSxRQUEzQyxFQUFDLElBQUMsQ0FBQSxhQUFBLE1BQUYsRUFBVSxJQUFDLENBQUEsb0JBQUEsYUFBWCxFQUEwQixJQUFDLENBQUEsa0JBQUE7TUFDM0IsSUFBQyxDQUFBLFdBQUQsR0FBZSxJQUFJO01BRW5CLElBQUMsQ0FBQSxXQUFXLENBQUMsR0FBYixDQUFpQixJQUFDLENBQUEsUUFBUSxDQUFDLFlBQVYsQ0FBdUIsSUFBQyxDQUFBLE9BQXhCLENBQWpCO01BQ0EsSUFBQyxDQUFBLFdBQVcsQ0FBQyxHQUFiLENBQWlCLElBQUMsQ0FBQSxNQUFNLENBQUMsaUJBQVIsQ0FBMEIsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO2lCQUFHLEtBQUMsQ0FBQSxPQUFELENBQUE7UUFBSDtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBMUIsQ0FBakI7TUFFQSxJQUFDLENBQUEsV0FBRCxHQUFlLElBQUMsQ0FBQSxNQUFNLENBQUMsY0FBUixDQUFBO01BQ2YsaUJBQUEsR0FBb0I7UUFBQyxJQUFBLEVBQU0sV0FBUDtRQUFvQixDQUFBLEtBQUEsQ0FBQSxFQUFPLGdDQUEzQjs7TUFDcEIsSUFBQyxDQUFBLGVBQUQsR0FBbUIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxtQkFBUixDQUE0QixJQUFDLENBQUEsV0FBN0IsRUFBMEMsaUJBQTFDO0lBVFI7O3FDQVdiLE9BQUEsR0FBUyxTQUFBO01BQ1AsSUFBQyxDQUFBLGVBQWUsQ0FBQyxPQUFqQixDQUFBO01BQ0EsSUFBQyxDQUFBLFdBQVcsQ0FBQyxPQUFiLENBQUE7YUFDQSxJQUFDLENBQUEsV0FBVyxDQUFDLE9BQWIsQ0FBQTtJQUhPOztxQ0FPVCxVQUFBLEdBQVksU0FBQTthQUNWLElBQUMsQ0FBQSxXQUFXLENBQUMsY0FBYixDQUFBLENBQUEsR0FBZ0M7SUFEdEI7O3FDQUdaLFVBQUEsR0FBWSxTQUFBO2FBQ1YsSUFBQyxDQUFBLFdBQVcsQ0FBQyxVQUFiLENBQUE7SUFEVTs7cUNBR1osWUFBQSxHQUFjLFNBQUE7YUFDWixJQUFDLENBQUEsV0FBVyxDQUFDLEtBQWIsQ0FBQTtJQURZOztxQ0FHZCxPQUFBLEdBQVMsU0FBQTtBQUNQLFVBQUE7TUFBQSxJQUFDLENBQUEsWUFBRCxDQUFBO01BRUEsSUFBQSxDQUFjLElBQUMsQ0FBQSxRQUFRLENBQUMsU0FBVixDQUFvQixpQkFBcEIsQ0FBZDtBQUFBLGVBQUE7O01BQ0EsSUFBQSxDQUFjLElBQUMsQ0FBQSxRQUFRLENBQUMsU0FBVixDQUFBLENBQWQ7QUFBQSxlQUFBOztNQUNBLElBQUEsQ0FBYyxDQUFBLE9BQUEsR0FBVSxJQUFDLENBQUEsV0FBVyxDQUFDLEdBQWIsQ0FBaUIsd0JBQWpCLENBQVYsQ0FBZDtBQUFBLGVBQUE7O01BQ0EsSUFBVSxJQUFDLENBQUEsUUFBUSxDQUFDLEtBQUssQ0FBQyxXQUFoQixDQUE0QixJQUFDLENBQUEsYUFBN0IsRUFBNEMsSUFBQyxDQUFBLFFBQVEsQ0FBQyxTQUFWLENBQW9CLDhCQUFwQixDQUE1QyxDQUFWO0FBQUEsZUFBQTs7QUFFQTtBQUFBO1dBQUEscUNBQUE7O1lBQStELENBQUksS0FBSyxDQUFDLE9BQU4sQ0FBQTt1QkFDakUsSUFBQyxDQUFBLFdBQVcsQ0FBQyxlQUFiLENBQTZCLEtBQTdCLEVBQW9DO1lBQUEsVUFBQSxFQUFZLFFBQVo7V0FBcEM7O0FBREY7O0lBUk87Ozs7O0FBaENYIiwic291cmNlc0NvbnRlbnQiOlsie0NvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSAnYXRvbSdcblxuIyBHZW5lcmFsIHB1cnBvc2UgdXRpbGl0eSBjbGFzcyB0byBtYWtlIEF0b20ncyBtYXJrZXIgbWFuYWdlbWVudCBlYXNpZXIuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBIaWdobGlnaHRTZWFyY2hNYW5hZ2VyXG4gIGNvbnN0cnVjdG9yOiAoQHZpbVN0YXRlKSAtPlxuICAgIHtAZWRpdG9yLCBAZWRpdG9yRWxlbWVudCwgQGdsb2JhbFN0YXRlfSA9IEB2aW1TdGF0ZVxuICAgIEBkaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG5cbiAgICBAZGlzcG9zYWJsZXMuYWRkIEB2aW1TdGF0ZS5vbkRpZERlc3Ryb3koQGRlc3Ryb3kpXG4gICAgQGRpc3Bvc2FibGVzLmFkZCBAZWRpdG9yLm9uRGlkU3RvcENoYW5naW5nID0+IEByZWZyZXNoKClcblxuICAgIEBtYXJrZXJMYXllciA9IEBlZGl0b3IuYWRkTWFya2VyTGF5ZXIoKVxuICAgIGRlY29yYXRpb25PcHRpb25zID0ge3R5cGU6ICdoaWdobGlnaHQnLCBjbGFzczogJ3ZpbS1tb2RlLXBsdXMtaGlnaGxpZ2h0LXNlYXJjaCd9XG4gICAgQGRlY29yYXRpb25MYXllciA9IEBlZGl0b3IuZGVjb3JhdGVNYXJrZXJMYXllcihAbWFya2VyTGF5ZXIsIGRlY29yYXRpb25PcHRpb25zKVxuXG4gIGRlc3Ryb3k6ID0+XG4gICAgQGRlY29yYXRpb25MYXllci5kZXN0cm95KClcbiAgICBAZGlzcG9zYWJsZXMuZGlzcG9zZSgpXG4gICAgQG1hcmtlckxheWVyLmRlc3Ryb3koKVxuXG4gICMgTWFya2Vyc1xuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgaGFzTWFya2VyczogLT5cbiAgICBAbWFya2VyTGF5ZXIuZ2V0TWFya2VyQ291bnQoKSA+IDBcblxuICBnZXRNYXJrZXJzOiAtPlxuICAgIEBtYXJrZXJMYXllci5nZXRNYXJrZXJzKClcblxuICBjbGVhck1hcmtlcnM6IC0+XG4gICAgQG1hcmtlckxheWVyLmNsZWFyKClcblxuICByZWZyZXNoOiAtPlxuICAgIEBjbGVhck1hcmtlcnMoKVxuXG4gICAgcmV0dXJuIHVubGVzcyBAdmltU3RhdGUuZ2V0Q29uZmlnKCdoaWdobGlnaHRTZWFyY2gnKVxuICAgIHJldHVybiB1bmxlc3MgQHZpbVN0YXRlLmlzVmlzaWJsZSgpXG4gICAgcmV0dXJuIHVubGVzcyBwYXR0ZXJuID0gQGdsb2JhbFN0YXRlLmdldCgnaGlnaGxpZ2h0U2VhcmNoUGF0dGVybicpXG4gICAgcmV0dXJuIGlmIEB2aW1TdGF0ZS51dGlscy5tYXRjaFNjb3BlcyhAZWRpdG9yRWxlbWVudCwgQHZpbVN0YXRlLmdldENvbmZpZygnaGlnaGxpZ2h0U2VhcmNoRXhjbHVkZVNjb3BlcycpKVxuXG4gICAgZm9yIHJhbmdlIGluIEB2aW1TdGF0ZS51dGlscy5zY2FuRWRpdG9yKEBlZGl0b3IsIHBhdHRlcm4pIHdoZW4gbm90IHJhbmdlLmlzRW1wdHkoKVxuICAgICAgQG1hcmtlckxheWVyLm1hcmtCdWZmZXJSYW5nZShyYW5nZSwgaW52YWxpZGF0ZTogJ2luc2lkZScpXG4iXX0=
