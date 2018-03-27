var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _helpers = require('../helpers');

var React = undefined;
var ReactDOM = undefined;
var Component = undefined;

var PanelDock = (function () {
  function PanelDock(delegate) {
    var _this = this;

    _classCallCheck(this, PanelDock);

    this.element = document.createElement('div');
    this.subscriptions = new _atom.CompositeDisposable();
    this.subscriptions.add(atom.config.observe('linter-ui-default.panelHeight', function (panelHeight) {
      var paneContainer = atom.workspace.paneContainerForItem(_this);
      // NOTE: This is an internal API access
      // It's necessary because there's no Public API for it yet
      if (paneContainer && typeof paneContainer.state === 'object' && typeof paneContainer.state.size === 'number' && typeof paneContainer.render === 'function') {
        paneContainer.state.size = panelHeight;
        paneContainer.render(paneContainer.state);
      }
    }));

    if (!React) {
      React = require('react');
    }
    if (!ReactDOM) {
      ReactDOM = require('react-dom');
    }
    if (!Component) {
      Component = require('./component');
    }

    ReactDOM.render(React.createElement(Component, { delegate: delegate }), this.element);
  }

  _createClass(PanelDock, [{
    key: 'getURI',
    value: function getURI() {
      return _helpers.WORKSPACE_URI;
    }
  }, {
    key: 'getTitle',
    value: function getTitle() {
      return 'Linter';
    }
  }, {
    key: 'getDefaultLocation',
    value: function getDefaultLocation() {
      return 'bottom';
    }
  }, {
    key: 'getAllowedLocations',
    value: function getAllowedLocations() {
      return ['center', 'bottom', 'top'];
    }
  }, {
    key: 'getPreferredHeight',
    value: function getPreferredHeight() {
      return atom.config.get('linter-ui-default.panelHeight');
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this.subscriptions.dispose();
      var paneContainer = atom.workspace.paneContainerForItem(this);
      if (paneContainer) {
        if (typeof paneContainer.state === 'object' && typeof paneContainer.state.size === 'number') {
          atom.config.set('linter-ui-default.panelHeight', paneContainer.state.size);
        }
        paneContainer.paneForItem(this).destroyItem(this, true);
      }
    }
  }]);

  return PanelDock;
})();

module.exports = PanelDock;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1Ly5hdG9tL3BhY2thZ2VzL2xpbnRlci11aS1kZWZhdWx0L2xpYi9wYW5lbC9kb2NrLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7b0JBRW9DLE1BQU07O3VCQUNaLFlBQVk7O0FBRTFDLElBQUksS0FBSyxZQUFBLENBQUE7QUFDVCxJQUFJLFFBQVEsWUFBQSxDQUFBO0FBQ1osSUFBSSxTQUFTLFlBQUEsQ0FBQTs7SUFFUCxTQUFTO0FBSUYsV0FKUCxTQUFTLENBSUQsUUFBZ0IsRUFBRTs7OzBCQUoxQixTQUFTOztBQUtYLFFBQUksQ0FBQyxPQUFPLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQTtBQUM1QyxRQUFJLENBQUMsYUFBYSxHQUFHLCtCQUF5QixDQUFBO0FBQzlDLFFBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLCtCQUErQixFQUFFLFVBQUMsV0FBVyxFQUFLO0FBQzNGLFVBQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsb0JBQW9CLE9BQU0sQ0FBQTs7O0FBRy9ELFVBQUksYUFBYSxJQUFJLE9BQU8sYUFBYSxDQUFDLEtBQUssS0FBSyxRQUFRLElBQUksT0FBTyxhQUFhLENBQUMsS0FBSyxDQUFDLElBQUksS0FBSyxRQUFRLElBQUksT0FBTyxhQUFhLENBQUMsTUFBTSxLQUFLLFVBQVUsRUFBRTtBQUMxSixxQkFBYSxDQUFDLEtBQUssQ0FBQyxJQUFJLEdBQUcsV0FBVyxDQUFBO0FBQ3RDLHFCQUFhLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQTtPQUMxQztLQUNGLENBQUMsQ0FBQyxDQUFBOztBQUVILFFBQUksQ0FBQyxLQUFLLEVBQUU7QUFDVixXQUFLLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFBO0tBQ3pCO0FBQ0QsUUFBSSxDQUFDLFFBQVEsRUFBRTtBQUNiLGNBQVEsR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUE7S0FDaEM7QUFDRCxRQUFJLENBQUMsU0FBUyxFQUFFO0FBQ2QsZUFBUyxHQUFHLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQTtLQUNuQzs7QUFFRCxZQUFRLENBQUMsTUFBTSxDQUFDLG9CQUFDLFNBQVMsSUFBQyxRQUFRLEVBQUUsUUFBUSxBQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUE7R0FDakU7O2VBNUJHLFNBQVM7O1dBNkJQLGtCQUFHO0FBQ1Asb0NBQW9CO0tBQ3JCOzs7V0FDTyxvQkFBRztBQUNULGFBQU8sUUFBUSxDQUFBO0tBQ2hCOzs7V0FDaUIsOEJBQUc7QUFDbkIsYUFBTyxRQUFRLENBQUE7S0FDaEI7OztXQUNrQiwrQkFBRztBQUNwQixhQUFPLENBQUMsUUFBUSxFQUFFLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQTtLQUNuQzs7O1dBQ2lCLDhCQUFHO0FBQ25CLGFBQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsK0JBQStCLENBQUMsQ0FBQTtLQUN4RDs7O1dBQ00sbUJBQUc7QUFDUixVQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxDQUFBO0FBQzVCLFVBQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLENBQUE7QUFDL0QsVUFBSSxhQUFhLEVBQUU7QUFDakIsWUFBSSxPQUFPLGFBQWEsQ0FBQyxLQUFLLEtBQUssUUFBUSxJQUFJLE9BQU8sYUFBYSxDQUFDLEtBQUssQ0FBQyxJQUFJLEtBQUssUUFBUSxFQUFFO0FBQzNGLGNBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLCtCQUErQixFQUFFLGFBQWEsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUE7U0FDM0U7QUFDRCxxQkFBYSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFBO09BQ3hEO0tBQ0Y7OztTQXJERyxTQUFTOzs7QUF3RGYsTUFBTSxDQUFDLE9BQU8sR0FBRyxTQUFTLENBQUEiLCJmaWxlIjoiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvbGludGVyLXVpLWRlZmF1bHQvbGliL3BhbmVsL2RvY2suanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBAZmxvdyAqL1xuXG5pbXBvcnQgeyBDb21wb3NpdGVEaXNwb3NhYmxlIH0gZnJvbSAnYXRvbSdcbmltcG9ydCB7IFdPUktTUEFDRV9VUkkgfSBmcm9tICcuLi9oZWxwZXJzJ1xuXG5sZXQgUmVhY3RcbmxldCBSZWFjdERPTVxubGV0IENvbXBvbmVudFxuXG5jbGFzcyBQYW5lbERvY2sge1xuICBlbGVtZW50OiBIVE1MRWxlbWVudDtcbiAgc3Vic2NyaXB0aW9uczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcblxuICBjb25zdHJ1Y3RvcihkZWxlZ2F0ZTogT2JqZWN0KSB7XG4gICAgdGhpcy5lbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbmZpZy5vYnNlcnZlKCdsaW50ZXItdWktZGVmYXVsdC5wYW5lbEhlaWdodCcsIChwYW5lbEhlaWdodCkgPT4ge1xuICAgICAgY29uc3QgcGFuZUNvbnRhaW5lciA9IGF0b20ud29ya3NwYWNlLnBhbmVDb250YWluZXJGb3JJdGVtKHRoaXMpXG4gICAgICAvLyBOT1RFOiBUaGlzIGlzIGFuIGludGVybmFsIEFQSSBhY2Nlc3NcbiAgICAgIC8vIEl0J3MgbmVjZXNzYXJ5IGJlY2F1c2UgdGhlcmUncyBubyBQdWJsaWMgQVBJIGZvciBpdCB5ZXRcbiAgICAgIGlmIChwYW5lQ29udGFpbmVyICYmIHR5cGVvZiBwYW5lQ29udGFpbmVyLnN0YXRlID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgcGFuZUNvbnRhaW5lci5zdGF0ZS5zaXplID09PSAnbnVtYmVyJyAmJiB0eXBlb2YgcGFuZUNvbnRhaW5lci5yZW5kZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgcGFuZUNvbnRhaW5lci5zdGF0ZS5zaXplID0gcGFuZWxIZWlnaHRcbiAgICAgICAgcGFuZUNvbnRhaW5lci5yZW5kZXIocGFuZUNvbnRhaW5lci5zdGF0ZSlcbiAgICAgIH1cbiAgICB9KSlcblxuICAgIGlmICghUmVhY3QpIHtcbiAgICAgIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKVxuICAgIH1cbiAgICBpZiAoIVJlYWN0RE9NKSB7XG4gICAgICBSZWFjdERPTSA9IHJlcXVpcmUoJ3JlYWN0LWRvbScpXG4gICAgfVxuICAgIGlmICghQ29tcG9uZW50KSB7XG4gICAgICBDb21wb25lbnQgPSByZXF1aXJlKCcuL2NvbXBvbmVudCcpXG4gICAgfVxuXG4gICAgUmVhY3RET00ucmVuZGVyKDxDb21wb25lbnQgZGVsZWdhdGU9e2RlbGVnYXRlfSAvPiwgdGhpcy5lbGVtZW50KVxuICB9XG4gIGdldFVSSSgpIHtcbiAgICByZXR1cm4gV09SS1NQQUNFX1VSSVxuICB9XG4gIGdldFRpdGxlKCkge1xuICAgIHJldHVybiAnTGludGVyJ1xuICB9XG4gIGdldERlZmF1bHRMb2NhdGlvbigpIHtcbiAgICByZXR1cm4gJ2JvdHRvbSdcbiAgfVxuICBnZXRBbGxvd2VkTG9jYXRpb25zKCkge1xuICAgIHJldHVybiBbJ2NlbnRlcicsICdib3R0b20nLCAndG9wJ11cbiAgfVxuICBnZXRQcmVmZXJyZWRIZWlnaHQoKSB7XG4gICAgcmV0dXJuIGF0b20uY29uZmlnLmdldCgnbGludGVyLXVpLWRlZmF1bHQucGFuZWxIZWlnaHQnKVxuICB9XG4gIGRpc3Bvc2UoKSB7XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICAgIGNvbnN0IHBhbmVDb250YWluZXIgPSBhdG9tLndvcmtzcGFjZS5wYW5lQ29udGFpbmVyRm9ySXRlbSh0aGlzKVxuICAgIGlmIChwYW5lQ29udGFpbmVyKSB7XG4gICAgICBpZiAodHlwZW9mIHBhbmVDb250YWluZXIuc3RhdGUgPT09ICdvYmplY3QnICYmIHR5cGVvZiBwYW5lQ29udGFpbmVyLnN0YXRlLnNpemUgPT09ICdudW1iZXInKSB7XG4gICAgICAgIGF0b20uY29uZmlnLnNldCgnbGludGVyLXVpLWRlZmF1bHQucGFuZWxIZWlnaHQnLCBwYW5lQ29udGFpbmVyLnN0YXRlLnNpemUpXG4gICAgICB9XG4gICAgICBwYW5lQ29udGFpbmVyLnBhbmVGb3JJdGVtKHRoaXMpLmRlc3Ryb3lJdGVtKHRoaXMsIHRydWUpXG4gICAgfVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gUGFuZWxEb2NrXG4iXX0=