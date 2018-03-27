(function() {
  var CompositeDisposable, HighlightSearchManager, decorationOptions, matchScopes, ref, scanEditor;

  CompositeDisposable = require('atom').CompositeDisposable;

  ref = require('./utils'), scanEditor = ref.scanEditor, matchScopes = ref.matchScopes;

  decorationOptions = {
    type: 'highlight',
    "class": 'vim-mode-plus-highlight-search'
  };

  module.exports = HighlightSearchManager = (function() {
    function HighlightSearchManager(vimState) {
      var ref1;
      this.vimState = vimState;
      ref1 = this.vimState, this.editor = ref1.editor, this.editorElement = ref1.editorElement, this.globalState = ref1.globalState;
      this.disposables = new CompositeDisposable;
      this.markerLayer = this.editor.addMarkerLayer();
      this.disposables.add(this.vimState.onDidDestroy(this.destroy.bind(this)));
      this.decorationLayer = this.editor.decorateMarkerLayer(this.markerLayer, decorationOptions);
      this.disposables.add(this.globalState.onDidChange((function(_this) {
        return function(arg) {
          var name, newValue;
          name = arg.name, newValue = arg.newValue;
          if (name === 'highlightSearchPattern') {
            if (newValue) {
              return _this.refresh();
            } else {
              return _this.clearMarkers();
            }
          }
        };
      })(this)));
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
      var i, len, pattern, range, ref1, results;
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
      if (matchScopes(this.editorElement, this.vimState.getConfig('highlightSearchExcludeScopes'))) {
        return;
      }
      ref1 = scanEditor(this.editor, pattern);
      results = [];
      for (i = 0, len = ref1.length; i < len; i++) {
        range = ref1[i];
        results.push(this.markerLayer.markBufferRange(range, {
          invalidate: 'inside'
        }));
      }
      return results;
    };

    return HighlightSearchManager;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvaGlnaGxpZ2h0LXNlYXJjaC1tYW5hZ2VyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUMsc0JBQXVCLE9BQUEsQ0FBUSxNQUFSOztFQUN4QixNQUE0QixPQUFBLENBQVEsU0FBUixDQUE1QixFQUFDLDJCQUFELEVBQWE7O0VBRWIsaUJBQUEsR0FDRTtJQUFBLElBQUEsRUFBTSxXQUFOO0lBQ0EsQ0FBQSxLQUFBLENBQUEsRUFBTyxnQ0FEUDs7O0VBSUYsTUFBTSxDQUFDLE9BQVAsR0FDTTtJQUNTLGdDQUFDLFFBQUQ7QUFDWCxVQUFBO01BRFksSUFBQyxDQUFBLFdBQUQ7TUFDWixPQUEwQyxJQUFDLENBQUEsUUFBM0MsRUFBQyxJQUFDLENBQUEsY0FBQSxNQUFGLEVBQVUsSUFBQyxDQUFBLHFCQUFBLGFBQVgsRUFBMEIsSUFBQyxDQUFBLG1CQUFBO01BQzNCLElBQUMsQ0FBQSxXQUFELEdBQWUsSUFBSTtNQUNuQixJQUFDLENBQUEsV0FBRCxHQUFlLElBQUMsQ0FBQSxNQUFNLENBQUMsY0FBUixDQUFBO01BRWYsSUFBQyxDQUFBLFdBQVcsQ0FBQyxHQUFiLENBQWlCLElBQUMsQ0FBQSxRQUFRLENBQUMsWUFBVixDQUF1QixJQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsQ0FBYyxJQUFkLENBQXZCLENBQWpCO01BQ0EsSUFBQyxDQUFBLGVBQUQsR0FBbUIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxtQkFBUixDQUE0QixJQUFDLENBQUEsV0FBN0IsRUFBMEMsaUJBQTFDO01BSW5CLElBQUMsQ0FBQSxXQUFXLENBQUMsR0FBYixDQUFpQixJQUFDLENBQUEsV0FBVyxDQUFDLFdBQWIsQ0FBeUIsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLEdBQUQ7QUFDeEMsY0FBQTtVQUQwQyxpQkFBTTtVQUNoRCxJQUFHLElBQUEsS0FBUSx3QkFBWDtZQUNFLElBQUcsUUFBSDtxQkFDRSxLQUFDLENBQUEsT0FBRCxDQUFBLEVBREY7YUFBQSxNQUFBO3FCQUdFLEtBQUMsQ0FBQSxZQUFELENBQUEsRUFIRjthQURGOztRQUR3QztNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBekIsQ0FBakI7SUFWVzs7cUNBaUJiLE9BQUEsR0FBUyxTQUFBO01BQ1AsSUFBQyxDQUFBLGVBQWUsQ0FBQyxPQUFqQixDQUFBO01BQ0EsSUFBQyxDQUFBLFdBQVcsQ0FBQyxPQUFiLENBQUE7YUFDQSxJQUFDLENBQUEsV0FBVyxDQUFDLE9BQWIsQ0FBQTtJQUhPOztxQ0FPVCxVQUFBLEdBQVksU0FBQTthQUNWLElBQUMsQ0FBQSxXQUFXLENBQUMsY0FBYixDQUFBLENBQUEsR0FBZ0M7SUFEdEI7O3FDQUdaLFVBQUEsR0FBWSxTQUFBO2FBQ1YsSUFBQyxDQUFBLFdBQVcsQ0FBQyxVQUFiLENBQUE7SUFEVTs7cUNBR1osWUFBQSxHQUFjLFNBQUE7YUFDWixJQUFDLENBQUEsV0FBVyxDQUFDLEtBQWIsQ0FBQTtJQURZOztxQ0FHZCxPQUFBLEdBQVMsU0FBQTtBQUNQLFVBQUE7TUFBQSxJQUFDLENBQUEsWUFBRCxDQUFBO01BRUEsSUFBQSxDQUFjLElBQUMsQ0FBQSxRQUFRLENBQUMsU0FBVixDQUFvQixpQkFBcEIsQ0FBZDtBQUFBLGVBQUE7O01BQ0EsSUFBQSxDQUFjLElBQUMsQ0FBQSxRQUFRLENBQUMsU0FBVixDQUFBLENBQWQ7QUFBQSxlQUFBOztNQUNBLElBQUEsQ0FBYyxDQUFBLE9BQUEsR0FBVSxJQUFDLENBQUEsV0FBVyxDQUFDLEdBQWIsQ0FBaUIsd0JBQWpCLENBQVYsQ0FBZDtBQUFBLGVBQUE7O01BQ0EsSUFBVSxXQUFBLENBQVksSUFBQyxDQUFBLGFBQWIsRUFBNEIsSUFBQyxDQUFBLFFBQVEsQ0FBQyxTQUFWLENBQW9CLDhCQUFwQixDQUE1QixDQUFWO0FBQUEsZUFBQTs7QUFFQTtBQUFBO1dBQUEsc0NBQUE7O3FCQUNFLElBQUMsQ0FBQSxXQUFXLENBQUMsZUFBYixDQUE2QixLQUE3QixFQUFvQztVQUFBLFVBQUEsRUFBWSxRQUFaO1NBQXBDO0FBREY7O0lBUk87Ozs7O0FBM0NYIiwic291cmNlc0NvbnRlbnQiOlsie0NvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSAnYXRvbSdcbntzY2FuRWRpdG9yLCBtYXRjaFNjb3Blc30gPSByZXF1aXJlICcuL3V0aWxzJ1xuXG5kZWNvcmF0aW9uT3B0aW9ucyA9XG4gIHR5cGU6ICdoaWdobGlnaHQnXG4gIGNsYXNzOiAndmltLW1vZGUtcGx1cy1oaWdobGlnaHQtc2VhcmNoJ1xuXG4jIEdlbmVyYWwgcHVycG9zZSB1dGlsaXR5IGNsYXNzIHRvIG1ha2UgQXRvbSdzIG1hcmtlciBtYW5hZ2VtZW50IGVhc2llci5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIEhpZ2hsaWdodFNlYXJjaE1hbmFnZXJcbiAgY29uc3RydWN0b3I6IChAdmltU3RhdGUpIC0+XG4gICAge0BlZGl0b3IsIEBlZGl0b3JFbGVtZW50LCBAZ2xvYmFsU3RhdGV9ID0gQHZpbVN0YXRlXG4gICAgQGRpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcbiAgICBAbWFya2VyTGF5ZXIgPSBAZWRpdG9yLmFkZE1hcmtlckxheWVyKClcblxuICAgIEBkaXNwb3NhYmxlcy5hZGQgQHZpbVN0YXRlLm9uRGlkRGVzdHJveShAZGVzdHJveS5iaW5kKHRoaXMpKVxuICAgIEBkZWNvcmF0aW9uTGF5ZXIgPSBAZWRpdG9yLmRlY29yYXRlTWFya2VyTGF5ZXIoQG1hcmtlckxheWVyLCBkZWNvcmF0aW9uT3B0aW9ucylcblxuICAgICMgUmVmcmVzaCBoaWdobGlnaHQgYmFzZWQgb24gZ2xvYmFsU3RhdGUuaGlnaGxpZ2h0U2VhcmNoUGF0dGVybiBjaGFuZ2VzLlxuICAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIEBkaXNwb3NhYmxlcy5hZGQgQGdsb2JhbFN0YXRlLm9uRGlkQ2hhbmdlICh7bmFtZSwgbmV3VmFsdWV9KSA9PlxuICAgICAgaWYgbmFtZSBpcyAnaGlnaGxpZ2h0U2VhcmNoUGF0dGVybidcbiAgICAgICAgaWYgbmV3VmFsdWVcbiAgICAgICAgICBAcmVmcmVzaCgpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBAY2xlYXJNYXJrZXJzKClcblxuICBkZXN0cm95OiAtPlxuICAgIEBkZWNvcmF0aW9uTGF5ZXIuZGVzdHJveSgpXG4gICAgQGRpc3Bvc2FibGVzLmRpc3Bvc2UoKVxuICAgIEBtYXJrZXJMYXllci5kZXN0cm95KClcblxuICAjIE1hcmtlcnNcbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIGhhc01hcmtlcnM6IC0+XG4gICAgQG1hcmtlckxheWVyLmdldE1hcmtlckNvdW50KCkgPiAwXG5cbiAgZ2V0TWFya2VyczogLT5cbiAgICBAbWFya2VyTGF5ZXIuZ2V0TWFya2VycygpXG5cbiAgY2xlYXJNYXJrZXJzOiAtPlxuICAgIEBtYXJrZXJMYXllci5jbGVhcigpXG5cbiAgcmVmcmVzaDogLT5cbiAgICBAY2xlYXJNYXJrZXJzKClcblxuICAgIHJldHVybiB1bmxlc3MgQHZpbVN0YXRlLmdldENvbmZpZygnaGlnaGxpZ2h0U2VhcmNoJylcbiAgICByZXR1cm4gdW5sZXNzIEB2aW1TdGF0ZS5pc1Zpc2libGUoKVxuICAgIHJldHVybiB1bmxlc3MgcGF0dGVybiA9IEBnbG9iYWxTdGF0ZS5nZXQoJ2hpZ2hsaWdodFNlYXJjaFBhdHRlcm4nKVxuICAgIHJldHVybiBpZiBtYXRjaFNjb3BlcyhAZWRpdG9yRWxlbWVudCwgQHZpbVN0YXRlLmdldENvbmZpZygnaGlnaGxpZ2h0U2VhcmNoRXhjbHVkZVNjb3BlcycpKVxuXG4gICAgZm9yIHJhbmdlIGluIHNjYW5FZGl0b3IoQGVkaXRvciwgcGF0dGVybilcbiAgICAgIEBtYXJrZXJMYXllci5tYXJrQnVmZmVyUmFuZ2UocmFuZ2UsIGludmFsaWRhdGU6ICdpbnNpZGUnKVxuIl19
