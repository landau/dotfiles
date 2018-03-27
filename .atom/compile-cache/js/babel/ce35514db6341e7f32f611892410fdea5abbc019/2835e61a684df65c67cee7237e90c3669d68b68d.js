Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

'use babel';

var AtomClockView = (function () {
  function AtomClockView(statusBar) {
    _classCallCheck(this, AtomClockView);

    this.statusBar = statusBar;
    this.subscriptions = new _atom.CompositeDisposable();
  }

  _createClass(AtomClockView, [{
    key: 'start',
    value: function start() {
      this.drawElement();
      this.initialize();
    }
  }, {
    key: 'initialize',
    value: function initialize() {
      var _this = this;

      this.setConfigValues();
      this.setIcon(this.showIcon);
      this.startTicker();

      this.subscriptions.add(atom.commands.add('atom-workspace', {
        'atom-clock:toggle': function atomClockToggle() {
          return _this.toggle();
        }
      }));

      this.subscriptions.add(atom.config.onDidChange('atom-clock.dateFormat', function () {
        _this.refreshTicker();
      }));

      this.subscriptions.add(atom.config.onDidChange('atom-clock.locale', function () {
        _this.refreshTicker();
      }));

      this.subscriptions.add(atom.config.onDidChange('atom-clock.refreshInterval', function () {
        _this.refreshTicker();
      }));

      this.subscriptions.add(atom.config.onDidChange('atom-clock.showClockIcon', function () {
        _this.setConfigValues();
        _this.setIcon(_this.showIcon);
      }));
    }
  }, {
    key: 'drawElement',
    value: function drawElement() {
      this.element = document.createElement('div');
      this.element.id = 'atom-clock';
      this.element.className = 'inline-block';
      this.element.appendChild(document.createElement('span'));

      this.statusBar.addRightTile({
        item: this.element,
        priority: -1
      });
    }
  }, {
    key: 'setConfigValues',
    value: function setConfigValues() {
      this.dateFormat = atom.config.get('atom-clock.dateFormat');
      this.locale = atom.config.get('atom-clock.locale');
      this.refreshInterval = atom.config.get('atom-clock.refreshInterval') * 1000;
      this.showIcon = atom.config.get('atom-clock.showClockIcon');
    }
  }, {
    key: 'startTicker',
    value: function startTicker() {
      var _this2 = this;

      this.setDate();
      var nextTick = this.refreshInterval - Date.now() % this.refreshInterval;
      this.tick = setTimeout(function () {
        _this2.startTicker();
      }, nextTick);
    }
  }, {
    key: 'clearTicker',
    value: function clearTicker() {
      if (this.tick) clearTimeout(this.tick);
    }
  }, {
    key: 'refreshTicker',
    value: function refreshTicker() {
      this.setConfigValues();
      this.clearTicker();
      this.startTicker();
    }
  }, {
    key: 'setDate',
    value: function setDate() {
      this.date = this.getDate(this.locale, this.dateFormat);
      this.element.firstChild.textContent = this.date;
    }
  }, {
    key: 'getDate',
    value: function getDate(locale, format) {
      return (0, _moment2['default'])().locale(locale).format(format);
    }
  }, {
    key: 'setIcon',
    value: function setIcon(toSet) {
      if (toSet) this.element.firstChild.className += 'icon icon-clock';else this.element.firstChild.className = '';
    }
  }, {
    key: 'toggle',
    value: function toggle() {
      style = this.element.style.display;
      this.element.style.display = style === 'none' ? '' : 'none';
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      this.clearTicker();
      this.subscriptions.dispose();
      this.element.parentNode.removeChild(this.element);
    }
  }]);

  return AtomClockView;
})();

exports['default'] = AtomClockView;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2F0b20tY2xvY2svbGliL2F0b20tY2xvY2stdmlldy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O29CQUVvQyxNQUFNOztzQkFDdkIsUUFBUTs7OztBQUgzQixXQUFXLENBQUM7O0lBS1MsYUFBYTtBQUVyQixXQUZRLGFBQWEsQ0FFcEIsU0FBUyxFQUFFOzBCQUZKLGFBQWE7O0FBRzlCLFFBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFBO0FBQzFCLFFBQUksQ0FBQyxhQUFhLEdBQUcsK0JBQXlCLENBQUE7R0FDL0M7O2VBTGtCLGFBQWE7O1dBTzNCLGlCQUFHO0FBQ04sVUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFBO0FBQ2xCLFVBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQTtLQUNsQjs7O1dBRVMsc0JBQUc7OztBQUNYLFVBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQTtBQUN0QixVQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQTtBQUMzQixVQUFJLENBQUMsV0FBVyxFQUFFLENBQUE7O0FBRWxCLFVBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLGdCQUFnQixFQUFFO0FBQ3pELDJCQUFtQixFQUFFO2lCQUFNLE1BQUssTUFBTSxFQUFFO1NBQUE7T0FDekMsQ0FBQyxDQUFDLENBQUE7O0FBRUgsVUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsdUJBQXVCLEVBQUUsWUFBTTtBQUM1RSxjQUFLLGFBQWEsRUFBRSxDQUFBO09BQ3JCLENBQUMsQ0FBQyxDQUFBOztBQUVILFVBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLG1CQUFtQixFQUFFLFlBQU07QUFDeEUsY0FBSyxhQUFhLEVBQUUsQ0FBQTtPQUNyQixDQUFDLENBQUMsQ0FBQTs7QUFFSCxVQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyw0QkFBNEIsRUFBRSxZQUFNO0FBQ2pGLGNBQUssYUFBYSxFQUFFLENBQUE7T0FDckIsQ0FBQyxDQUFDLENBQUE7O0FBRUgsVUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsMEJBQTBCLEVBQUUsWUFBTTtBQUMvRSxjQUFLLGVBQWUsRUFBRSxDQUFBO0FBQ3RCLGNBQUssT0FBTyxDQUFDLE1BQUssUUFBUSxDQUFDLENBQUE7T0FDNUIsQ0FBQyxDQUFDLENBQUE7S0FDSjs7O1dBRVUsdUJBQUc7QUFDWixVQUFJLENBQUMsT0FBTyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUE7QUFDNUMsVUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLEdBQUcsWUFBWSxDQUFBO0FBQzlCLFVBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxHQUFHLGNBQWMsQ0FBQTtBQUN2QyxVQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUE7O0FBRXhELFVBQUksQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDO0FBQzFCLFlBQUksRUFBRSxJQUFJLENBQUMsT0FBTztBQUNsQixnQkFBUSxFQUFFLENBQUMsQ0FBQztPQUNiLENBQUMsQ0FBQTtLQUNIOzs7V0FFYywyQkFBRztBQUNoQixVQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLHVCQUF1QixDQUFDLENBQUE7QUFDMUQsVUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFBO0FBQ2xELFVBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsNEJBQTRCLENBQUMsR0FBRyxJQUFJLENBQUE7QUFDM0UsVUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQywwQkFBMEIsQ0FBQyxDQUFBO0tBQzVEOzs7V0FFVSx1QkFBRzs7O0FBQ1osVUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFBO0FBQ2QsVUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLGVBQWUsR0FBSSxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLGVBQWUsQUFBQyxDQUFBO0FBQ3pFLFVBQUksQ0FBQyxJQUFJLEdBQUcsVUFBVSxDQUFFLFlBQU87QUFBRSxlQUFLLFdBQVcsRUFBRSxDQUFBO09BQUUsRUFBRSxRQUFRLENBQUMsQ0FBQTtLQUNqRTs7O1dBRVUsdUJBQUc7QUFDWixVQUFJLElBQUksQ0FBQyxJQUFJLEVBQ1gsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtLQUMxQjs7O1dBRVkseUJBQUc7QUFDZCxVQUFJLENBQUMsZUFBZSxFQUFFLENBQUE7QUFDdEIsVUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFBO0FBQ2xCLFVBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQTtLQUNuQjs7O1dBRU0sbUJBQUc7QUFDUixVQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUE7QUFDdEQsVUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUE7S0FDaEQ7OztXQUVNLGlCQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUU7QUFDdEIsYUFBTywwQkFBUSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUE7S0FDOUM7OztXQUVNLGlCQUFDLEtBQUssRUFBRTtBQUNiLFVBQUksS0FBSyxFQUNQLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLFNBQVMsSUFBSSxpQkFBaUIsQ0FBQSxLQUV0RCxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFBO0tBQ3pDOzs7V0FFSyxrQkFBRztBQUNQLFdBQUssR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUE7QUFDbEMsVUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLEtBQUssS0FBSyxNQUFNLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQTtLQUM1RDs7O1dBRU0sbUJBQUc7QUFDUixVQUFJLENBQUMsV0FBVyxFQUFFLENBQUE7QUFDbEIsVUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtBQUM1QixVQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFBO0tBQ2xEOzs7U0FwR2tCLGFBQWE7OztxQkFBYixhQUFhIiwiZmlsZSI6Ii9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2F0b20tY2xvY2svbGliL2F0b20tY2xvY2stdmlldy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5pbXBvcnQgeyBDb21wb3NpdGVEaXNwb3NhYmxlIH0gZnJvbSAnYXRvbSdcbmltcG9ydCBNb21lbnQgZnJvbSAnbW9tZW50J1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBdG9tQ2xvY2tWaWV3IHtcblxuICBjb25zdHJ1Y3RvcihzdGF0dXNCYXIpIHtcbiAgICB0aGlzLnN0YXR1c0JhciA9IHN0YXR1c0JhclxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcbiAgfVxuXG4gIHN0YXJ0KCkge1xuICAgIHRoaXMuZHJhd0VsZW1lbnQoKVxuICAgIHRoaXMuaW5pdGlhbGl6ZSgpXG4gIH1cblxuICBpbml0aWFsaXplKCkge1xuICAgIHRoaXMuc2V0Q29uZmlnVmFsdWVzKClcbiAgICB0aGlzLnNldEljb24odGhpcy5zaG93SWNvbilcbiAgICB0aGlzLnN0YXJ0VGlja2VyKClcblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20td29ya3NwYWNlJywge1xuICAgICAgJ2F0b20tY2xvY2s6dG9nZ2xlJzogKCkgPT4gdGhpcy50b2dnbGUoKVxuICAgIH0pKVxuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbmZpZy5vbkRpZENoYW5nZSgnYXRvbS1jbG9jay5kYXRlRm9ybWF0JywgKCkgPT4ge1xuICAgICAgdGhpcy5yZWZyZXNoVGlja2VyKClcbiAgICB9KSlcblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb25maWcub25EaWRDaGFuZ2UoJ2F0b20tY2xvY2subG9jYWxlJywgKCkgPT4ge1xuICAgICAgdGhpcy5yZWZyZXNoVGlja2VyKClcbiAgICB9KSlcblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb25maWcub25EaWRDaGFuZ2UoJ2F0b20tY2xvY2sucmVmcmVzaEludGVydmFsJywgKCkgPT4ge1xuICAgICAgdGhpcy5yZWZyZXNoVGlja2VyKClcbiAgICB9KSlcblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb25maWcub25EaWRDaGFuZ2UoJ2F0b20tY2xvY2suc2hvd0Nsb2NrSWNvbicsICgpID0+IHtcbiAgICAgIHRoaXMuc2V0Q29uZmlnVmFsdWVzKClcbiAgICAgIHRoaXMuc2V0SWNvbih0aGlzLnNob3dJY29uKVxuICAgIH0pKVxuICB9XG5cbiAgZHJhd0VsZW1lbnQoKSB7XG4gICAgdGhpcy5lbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICB0aGlzLmVsZW1lbnQuaWQgPSAnYXRvbS1jbG9jaydcbiAgICB0aGlzLmVsZW1lbnQuY2xhc3NOYW1lID0gJ2lubGluZS1ibG9jaydcbiAgICB0aGlzLmVsZW1lbnQuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpKVxuXG4gICAgdGhpcy5zdGF0dXNCYXIuYWRkUmlnaHRUaWxlKHtcbiAgICAgIGl0ZW06IHRoaXMuZWxlbWVudCxcbiAgICAgIHByaW9yaXR5OiAtMVxuICAgIH0pXG4gIH1cblxuICBzZXRDb25maWdWYWx1ZXMoKSB7XG4gICAgdGhpcy5kYXRlRm9ybWF0ID0gYXRvbS5jb25maWcuZ2V0KCdhdG9tLWNsb2NrLmRhdGVGb3JtYXQnKVxuICAgIHRoaXMubG9jYWxlID0gYXRvbS5jb25maWcuZ2V0KCdhdG9tLWNsb2NrLmxvY2FsZScpXG4gICAgdGhpcy5yZWZyZXNoSW50ZXJ2YWwgPSBhdG9tLmNvbmZpZy5nZXQoJ2F0b20tY2xvY2sucmVmcmVzaEludGVydmFsJykgKiAxMDAwXG4gICAgdGhpcy5zaG93SWNvbiA9IGF0b20uY29uZmlnLmdldCgnYXRvbS1jbG9jay5zaG93Q2xvY2tJY29uJylcbiAgfVxuXG4gIHN0YXJ0VGlja2VyKCkge1xuICAgIHRoaXMuc2V0RGF0ZSgpXG4gICAgdmFyIG5leHRUaWNrID0gdGhpcy5yZWZyZXNoSW50ZXJ2YWwgLSAoRGF0ZS5ub3coKSAlIHRoaXMucmVmcmVzaEludGVydmFsKVxuICAgIHRoaXMudGljayA9IHNldFRpbWVvdXQgKCgpID0+ICB7IHRoaXMuc3RhcnRUaWNrZXIoKSB9LCBuZXh0VGljaylcbiAgfVxuXG4gIGNsZWFyVGlja2VyKCkge1xuICAgIGlmICh0aGlzLnRpY2spXG4gICAgICBjbGVhclRpbWVvdXQodGhpcy50aWNrKVxuICB9XG5cbiAgcmVmcmVzaFRpY2tlcigpIHtcbiAgICB0aGlzLnNldENvbmZpZ1ZhbHVlcygpXG4gICAgdGhpcy5jbGVhclRpY2tlcigpXG4gICAgdGhpcy5zdGFydFRpY2tlcigpXG4gIH1cblxuICBzZXREYXRlKCkge1xuICAgIHRoaXMuZGF0ZSA9IHRoaXMuZ2V0RGF0ZSh0aGlzLmxvY2FsZSwgdGhpcy5kYXRlRm9ybWF0KVxuICAgIHRoaXMuZWxlbWVudC5maXJzdENoaWxkLnRleHRDb250ZW50ID0gdGhpcy5kYXRlXG4gIH1cblxuICBnZXREYXRlKGxvY2FsZSwgZm9ybWF0KSB7XG4gICAgcmV0dXJuIE1vbWVudCgpLmxvY2FsZShsb2NhbGUpLmZvcm1hdChmb3JtYXQpXG4gIH1cblxuICBzZXRJY29uKHRvU2V0KSB7XG4gICAgaWYgKHRvU2V0KVxuICAgICAgdGhpcy5lbGVtZW50LmZpcnN0Q2hpbGQuY2xhc3NOYW1lICs9ICdpY29uIGljb24tY2xvY2snXG4gICAgZWxzZVxuICAgICAgdGhpcy5lbGVtZW50LmZpcnN0Q2hpbGQuY2xhc3NOYW1lID0gJydcbiAgfVxuXG4gIHRvZ2dsZSgpIHtcbiAgICBzdHlsZSA9IHRoaXMuZWxlbWVudC5zdHlsZS5kaXNwbGF5XG4gICAgdGhpcy5lbGVtZW50LnN0eWxlLmRpc3BsYXkgPSBzdHlsZSA9PT0gJ25vbmUnID8gJycgOiAnbm9uZSdcbiAgfVxuXG4gIGRlc3Ryb3koKSB7XG4gICAgdGhpcy5jbGVhclRpY2tlcigpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICAgIHRoaXMuZWxlbWVudC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRoaXMuZWxlbWVudClcbiAgfVxuXG59XG4iXX0=