var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _helpers = require('../helpers');

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
      if (paneContainer && typeof paneContainer.state.size === 'number' && typeof paneContainer.render === 'function') {
        paneContainer.state.size = panelHeight;
        paneContainer.render(paneContainer.state);
      }
    }));

    var React = require('react');
    var ReactDOM = require('react-dom');
    var Component = require('./component');

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
      var parentElement = this.element.parentElement;
      if (parentElement) {
        var _parentElement$getBoundingClientRect = parentElement.getBoundingClientRect();

        var height = _parentElement$getBoundingClientRect.height;

        if (height > 0) {
          atom.config.set('linter-ui-default.panelHeight', height);
        }
      }

      this.subscriptions.dispose();
      var paneContainer = atom.workspace.paneContainerForItem(this);
      if (paneContainer) {
        paneContainer.paneForItem(this).destroyItem(this, true);
      }
    }
  }]);

  return PanelDock;
})();

module.exports = PanelDock;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1Ly5hdG9tL3BhY2thZ2VzL2xpbnRlci11aS1kZWZhdWx0L2xpYi9wYW5lbC9kb2NrLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7b0JBRW9DLE1BQU07O3VCQUNaLFlBQVk7O0lBRXBDLFNBQVM7QUFJRixXQUpQLFNBQVMsQ0FJRCxRQUFnQixFQUFFOzs7MEJBSjFCLFNBQVM7O0FBS1gsUUFBSSxDQUFDLE9BQU8sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFBO0FBQzVDLFFBQUksQ0FBQyxhQUFhLEdBQUcsK0JBQXlCLENBQUE7QUFDOUMsUUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsK0JBQStCLEVBQUUsVUFBQyxXQUFXLEVBQUs7QUFDM0YsVUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxvQkFBb0IsT0FBTSxDQUFBOzs7QUFHL0QsVUFBSSxhQUFhLElBQUksT0FBTyxhQUFhLENBQUMsS0FBSyxDQUFDLElBQUksS0FBSyxRQUFRLElBQUksT0FBTyxhQUFhLENBQUMsTUFBTSxLQUFLLFVBQVUsRUFBRTtBQUMvRyxxQkFBYSxDQUFDLEtBQUssQ0FBQyxJQUFJLEdBQUcsV0FBVyxDQUFBO0FBQ3RDLHFCQUFhLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQTtPQUMxQztLQUNGLENBQUMsQ0FBQyxDQUFBOztBQUVILFFBQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQTtBQUM5QixRQUFNLFFBQVEsR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUE7QUFDckMsUUFBTSxTQUFTLEdBQUcsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFBOztBQUV4QyxZQUFRLENBQUMsTUFBTSxDQUFDLG9CQUFDLFNBQVMsSUFBQyxRQUFRLEVBQUUsUUFBUSxBQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUE7R0FDakU7O2VBdEJHLFNBQVM7O1dBdUJQLGtCQUFHO0FBQ1Asb0NBQW9CO0tBQ3JCOzs7V0FDTyxvQkFBRztBQUNULGFBQU8sUUFBUSxDQUFBO0tBQ2hCOzs7V0FDaUIsOEJBQUc7QUFDbkIsYUFBTyxRQUFRLENBQUE7S0FDaEI7OztXQUNrQiwrQkFBRztBQUNwQixhQUFPLENBQUMsUUFBUSxFQUFFLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQTtLQUNuQzs7O1dBQ2lCLDhCQUFHO0FBQ25CLGFBQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsK0JBQStCLENBQUMsQ0FBQTtLQUN4RDs7O1dBQ00sbUJBQUc7QUFDUixVQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQTtBQUNoRCxVQUFJLGFBQWEsRUFBRTttREFDRSxhQUFhLENBQUMscUJBQXFCLEVBQUU7O1lBQWhELE1BQU0sd0NBQU4sTUFBTTs7QUFDZCxZQUFJLE1BQU0sR0FBRyxDQUFDLEVBQUU7QUFDZCxjQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQywrQkFBK0IsRUFBRSxNQUFNLENBQUMsQ0FBQTtTQUN6RDtPQUNGOztBQUVELFVBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLENBQUE7QUFDNUIsVUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsQ0FBQTtBQUMvRCxVQUFJLGFBQWEsRUFBRTtBQUNqQixxQkFBYSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFBO09BQ3hEO0tBQ0Y7OztTQXBERyxTQUFTOzs7QUF1RGYsTUFBTSxDQUFDLE9BQU8sR0FBRyxTQUFTLENBQUEiLCJmaWxlIjoiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvbGludGVyLXVpLWRlZmF1bHQvbGliL3BhbmVsL2RvY2suanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBAZmxvdyAqL1xuXG5pbXBvcnQgeyBDb21wb3NpdGVEaXNwb3NhYmxlIH0gZnJvbSAnYXRvbSdcbmltcG9ydCB7IFdPUktTUEFDRV9VUkkgfSBmcm9tICcuLi9oZWxwZXJzJ1xuXG5jbGFzcyBQYW5lbERvY2sge1xuICBlbGVtZW50OiBIVE1MRWxlbWVudDtcbiAgc3Vic2NyaXB0aW9uczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcblxuICBjb25zdHJ1Y3RvcihkZWxlZ2F0ZTogT2JqZWN0KSB7XG4gICAgdGhpcy5lbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbmZpZy5vYnNlcnZlKCdsaW50ZXItdWktZGVmYXVsdC5wYW5lbEhlaWdodCcsIChwYW5lbEhlaWdodCkgPT4ge1xuICAgICAgY29uc3QgcGFuZUNvbnRhaW5lciA9IGF0b20ud29ya3NwYWNlLnBhbmVDb250YWluZXJGb3JJdGVtKHRoaXMpXG4gICAgICAvLyBOT1RFOiBUaGlzIGlzIGFuIGludGVybmFsIEFQSSBhY2Nlc3NcbiAgICAgIC8vIEl0J3MgbmVjZXNzYXJ5IGJlY2F1c2UgdGhlcmUncyBubyBQdWJsaWMgQVBJIGZvciBpdCB5ZXRcbiAgICAgIGlmIChwYW5lQ29udGFpbmVyICYmIHR5cGVvZiBwYW5lQ29udGFpbmVyLnN0YXRlLnNpemUgPT09ICdudW1iZXInICYmIHR5cGVvZiBwYW5lQ29udGFpbmVyLnJlbmRlciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBwYW5lQ29udGFpbmVyLnN0YXRlLnNpemUgPSBwYW5lbEhlaWdodFxuICAgICAgICBwYW5lQ29udGFpbmVyLnJlbmRlcihwYW5lQ29udGFpbmVyLnN0YXRlKVxuICAgICAgfVxuICAgIH0pKVxuXG4gICAgY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpXG4gICAgY29uc3QgUmVhY3RET00gPSByZXF1aXJlKCdyZWFjdC1kb20nKVxuICAgIGNvbnN0IENvbXBvbmVudCA9IHJlcXVpcmUoJy4vY29tcG9uZW50JylcblxuICAgIFJlYWN0RE9NLnJlbmRlcig8Q29tcG9uZW50IGRlbGVnYXRlPXtkZWxlZ2F0ZX0gLz4sIHRoaXMuZWxlbWVudClcbiAgfVxuICBnZXRVUkkoKSB7XG4gICAgcmV0dXJuIFdPUktTUEFDRV9VUklcbiAgfVxuICBnZXRUaXRsZSgpIHtcbiAgICByZXR1cm4gJ0xpbnRlcidcbiAgfVxuICBnZXREZWZhdWx0TG9jYXRpb24oKSB7XG4gICAgcmV0dXJuICdib3R0b20nXG4gIH1cbiAgZ2V0QWxsb3dlZExvY2F0aW9ucygpIHtcbiAgICByZXR1cm4gWydjZW50ZXInLCAnYm90dG9tJywgJ3RvcCddXG4gIH1cbiAgZ2V0UHJlZmVycmVkSGVpZ2h0KCkge1xuICAgIHJldHVybiBhdG9tLmNvbmZpZy5nZXQoJ2xpbnRlci11aS1kZWZhdWx0LnBhbmVsSGVpZ2h0JylcbiAgfVxuICBkaXNwb3NlKCkge1xuICAgIGNvbnN0IHBhcmVudEVsZW1lbnQgPSB0aGlzLmVsZW1lbnQucGFyZW50RWxlbWVudFxuICAgIGlmIChwYXJlbnRFbGVtZW50KSB7XG4gICAgICBjb25zdCB7IGhlaWdodCB9ID0gcGFyZW50RWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgICAgaWYgKGhlaWdodCA+IDApIHtcbiAgICAgICAgYXRvbS5jb25maWcuc2V0KCdsaW50ZXItdWktZGVmYXVsdC5wYW5lbEhlaWdodCcsIGhlaWdodClcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG4gICAgY29uc3QgcGFuZUNvbnRhaW5lciA9IGF0b20ud29ya3NwYWNlLnBhbmVDb250YWluZXJGb3JJdGVtKHRoaXMpXG4gICAgaWYgKHBhbmVDb250YWluZXIpIHtcbiAgICAgIHBhbmVDb250YWluZXIucGFuZUZvckl0ZW0odGhpcykuZGVzdHJveUl0ZW0odGhpcywgdHJ1ZSlcbiAgICB9XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBQYW5lbERvY2tcbiJdfQ==