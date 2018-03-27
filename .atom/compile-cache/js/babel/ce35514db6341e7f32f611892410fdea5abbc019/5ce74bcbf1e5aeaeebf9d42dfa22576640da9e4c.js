Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

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
      this.setTooltip(this.showTooltip);
      this.setIcon(this.showIcon);
      this.setUTCClass(this.showUTC);
      this.startTicker();

      this.subscriptions.add(atom.commands.add('atom-workspace', {
        'atom-clock:toggle': function atomClockToggle() {
          return _this.toggle();
        },
        'atom-clock:utc-mode': function atomClockUtcMode() {
          return atom.config.set('atom-clock.showUTC', !_this.showUTC);
        }
      }));

      this.subscriptions.add(atom.config.onDidChange('atom-clock.dateFormat', function () {
        _this.refreshTicker();
      }));

      this.subscriptions.add(atom.config.onDidChange('atom-clock.showTooltip', function () {
        _this.setConfigValues();
        _this.setTooltip(_this.showTooltip);
      }));

      this.subscriptions.add(atom.config.onDidChange('atom-clock.tooltipDateFormat', function () {
        _this.refreshTicker();
      }));

      this.subscriptions.add(atom.config.onDidChange('atom-clock.locale', function () {
        _this.refreshTicker();
      }));

      this.subscriptions.add(atom.config.onDidChange('atom-clock.showUTC', function () {
        _this.refreshTicker();
        _this.setUTCClass(_this.showUTC);
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
      this.element.classList.add('atom-clock', 'inline-block');

      this.iconElement = document.createElement('span');
      this.iconElement.classList.add('atom-clock-icon');

      this.timeElement = document.createElement('span');
      this.timeElement.classList.add('atom-clock-time');

      this.element.appendChild(this.iconElement);
      this.element.appendChild(this.timeElement);

      this.statusBar.addRightTile({
        item: this.element,
        priority: -500
      });
    }
  }, {
    key: 'setConfigValues',
    value: function setConfigValues() {
      this.dateFormat = atom.config.get('atom-clock.dateFormat');
      this.showTooltip = atom.config.get('atom-clock.showTooltip');
      this.tooltipDateFormat = atom.config.get('atom-clock.tooltipDateFormat');
      this.locale = atom.config.get('atom-clock.locale');
      this.showUTC = atom.config.get('atom-clock.showUTC');
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
      this.timeElement.textContent = this.date;
    }
  }, {
    key: 'getDate',
    value: function getDate(locale, format) {
      if (!this.Moment) this.Moment = require('moment');

      var moment = this.Moment().locale(locale);

      if (this.showUTC) moment.utc();

      return moment.format(format);
    }
  }, {
    key: 'setIcon',
    value: function setIcon(toSet) {
      if (toSet) this.iconElement.classList.add('icon', 'icon-clock');else this.iconElement.classList.remove('icon', 'icon-clock');
    }
  }, {
    key: 'setTooltip',
    value: function setTooltip(toSet) {
      var _this3 = this;

      if (this.tooltip === undefined) this.tooltip = atom.tooltips.add(this.element, {
        title: function title() {
          return _this3.getDate(_this3.locale, _this3.tooltipDateFormat);
        },
        'class': 'atom-clock-tooltip'
      });

      if (toSet) atom.tooltips.findTooltips(this.element)[0].enable();else atom.tooltips.findTooltips(this.element)[0].disable();
    }
  }, {
    key: 'setUTCClass',
    value: function setUTCClass(toSet) {
      if (toSet) {
        this.element.classList.add('atom-clock-utc');
        atom.tooltips.findTooltips(this.element)[0].getTooltipElement().classList.add('atom-clock-utc');
      } else {
        this.element.classList.remove('atom-clock-utc');
        atom.tooltips.findTooltips(this.element)[0].getTooltipElement().classList.remove('atom-clock-utc');
      }
    }
  }, {
    key: 'toggle',
    value: function toggle() {
      var style = this.element.style.display;
      this.element.style.display = style === 'none' ? '' : 'none';
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      this.clearTicker();
      this.subscriptions.dispose();
      this.tooltip.dispose();
      this.element.remove();
    }
  }]);

  return AtomClockView;
})();

exports['default'] = AtomClockView;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1Ly5hdG9tL3BhY2thZ2VzL2F0b20tY2xvY2svbGliL2F0b20tY2xvY2stdmlldy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7OztvQkFFb0MsTUFBTTs7QUFGMUMsV0FBVyxDQUFDOztJQUlTLGFBQWE7QUFFckIsV0FGUSxhQUFhLENBRXBCLFNBQVMsRUFBRTswQkFGSixhQUFhOztBQUc5QixRQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQTtBQUMxQixRQUFJLENBQUMsYUFBYSxHQUFHLCtCQUF5QixDQUFBO0dBQy9DOztlQUxrQixhQUFhOztXQU8zQixpQkFBRztBQUNOLFVBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQTtBQUNsQixVQUFJLENBQUMsVUFBVSxFQUFFLENBQUE7S0FDbEI7OztXQUVTLHNCQUFHOzs7QUFDWCxVQUFJLENBQUMsZUFBZSxFQUFFLENBQUE7QUFDdEIsVUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUE7QUFDakMsVUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUE7QUFDM0IsVUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUE7QUFDOUIsVUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFBOztBQUVsQixVQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRTtBQUN6RCwyQkFBbUIsRUFBRTtpQkFBTSxNQUFLLE1BQU0sRUFBRTtTQUFBO0FBQ3hDLDZCQUFxQixFQUFFO2lCQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLG9CQUFvQixFQUFFLENBQUMsTUFBSyxPQUFPLENBQUM7U0FBQTtPQUNsRixDQUFDLENBQUMsQ0FBQTs7QUFFSCxVQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFdB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c2Vycy90bGFuZGF1Ly5hdG9tL3BhY2thZ2VzL2F0b20tY2xvY2svbGliL2F0b20tY2xvY2stdmlldy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5pbXBvcnQgeyBDb21wb3NpdGVEaXNwb3NhYmxlIH0gZnJvbSAnYXRvbSdcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQXRvbUNsb2NrVmlldyB7XG5cbiAgY29uc3RydWN0b3Ioc3RhdHVzQmFyKSB7XG4gICAgdGhpcy5zdGF0dXNCYXIgPSBzdGF0dXNCYXJcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG4gIH1cblxuICBzdGFydCgpIHtcbiAgICB0aGlzLmRyYXdFbGVtZW50KClcbiAgICB0aGlzLmluaXRpYWxpemUoKVxuICB9XG5cbiAgaW5pdGlhbGl6ZSgpIHtcbiAgICB0aGlzLnNldENvbmZpZ1ZhbHVlcygpXG4gICAgdGhpcy5zZXRUb29sdGlwKHRoaXMuc2hvd1Rvb2x0aXApXG4gICAgdGhpcy5zZXRJY29uKHRoaXMuc2hvd0ljb24pXG4gICAgdGhpcy5zZXRVVENDbGFzcyh0aGlzLnNob3dVVEMpXG4gICAgdGhpcy5zdGFydFRpY2tlcigpXG5cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXdvcmtzcGFjZScsIHtcbiAgICAgICdhdG9tLWNsb2NrOnRvZ2dsZSc6ICgpID0+IHRoaXMudG9nZ2xlKCksXG4gICAgICAnYXRvbS1jbG9jazp1dGMtbW9kZSc6ICgpID0+IGF0b20uY29uZmlnLnNldCgnYXRvbS1jbG9jay5zaG93VVRDJywgIXRoaXMuc2hvd1VUQylcbiAgICB9KSlcblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb25maWcub25EaWRDaGFuZ2UoJ2F0b20tY2xvY2suZGF0ZUZvcm1hdCcsICgpID0+IHtcbiAgICAgIHRoaXMucmVmcmVzaFRpY2tlcigpXG4gICAgfSkpXG5cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlKCdhdG9tLWNsb2NrLnNob3dUb29sdGlwJywgKCkgPT4ge1xuICAgICAgdGhpcy5zZXRDb25maWdWYWx1ZXMoKVxuICAgICAgdGhpcy5zZXRUb29sdGlwKHRoaXMuc2hvd1Rvb2x0aXApXG4gICAgfSkpXG5cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlKCdhdG9tLWNsb2NrLnRvb2x0aXBEYXRlRm9ybWF0JywgKCkgPT4ge1xuICAgICAgdGhpcy5yZWZyZXNoVGlja2VyKClcbiAgICB9KSlcblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb25maWcub25EaWRDaGFuZ2UoJ2F0b20tY2xvY2subG9jYWxlJywgKCkgPT4ge1xuICAgICAgdGhpcy5yZWZyZXNoVGlja2VyKClcbiAgICB9KSlcblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb25maWcub25EaWRDaGFuZ2UoJ2F0b20tY2xvY2suc2hvd1VUQycsICgpID0+IHtcbiAgICAgIHRoaXMucmVmcmVzaFRpY2tlcigpXG4gICAgICB0aGlzLnNldFVUQ0NsYXNzKHRoaXMuc2hvd1VUQylcbiAgICB9KSlcblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb25maWcub25EaWRDaGFuZ2UoJ2F0b20tY2xvY2sucmVmcmVzaEludGVydmFsJywgKCkgPT4ge1xuICAgICAgdGhpcy5yZWZyZXNoVGlja2VyKClcbiAgICB9KSlcblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb25maWcub25EaWRDaGFuZ2UoJ2F0b20tY2xvY2suc2hvd0Nsb2NrSWNvbicsICgpID0+IHtcbiAgICAgIHRoaXMuc2V0Q29uZmlnVmFsdWVzKClcbiAgICAgIHRoaXMuc2V0SWNvbih0aGlzLnNob3dJY29uKVxuICAgIH0pKVxuXG4gIH1cblxuICBkcmF3RWxlbWVudCgpIHtcbiAgICB0aGlzLmVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuYWRkKCdhdG9tLWNsb2NrJywgJ2lubGluZS1ibG9jaycpXG5cbiAgICB0aGlzLmljb25FbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpXG4gICAgdGhpcy5pY29uRWxlbWVudC5jbGFzc0xpc3QuYWRkKCdhdG9tLWNsb2NrLWljb24nKVxuXG4gICAgdGhpcy50aW1lRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKVxuICAgIHRoaXMudGltZUVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnYXRvbS1jbG9jay10aW1lJylcblxuICAgIHRoaXMuZWxlbWVudC5hcHBlbmRDaGlsZCh0aGlzLmljb25FbGVtZW50KVxuICAgIHRoaXMuZWxlbWVudC5hcHBlbmRDaGlsZCh0aGlzLnRpbWVFbGVtZW50KVxuXG4gICAgdGhpcy5zdGF0dXNCYXIuYWRkUmlnaHRUaWxlKHtcbiAgICAgIGl0ZW06IHRoaXMuZWxlbWVudCxcbiAgICAgIHByaW9yaXR5OiAtNTAwXG4gICAgfSlcbiAgfVxuXG4gIHNldENvbmZpZ1ZhbHVlcygpIHtcbiAgICB0aGlzLmRhdGVGb3JtYXQgPSBhdG9tLmNvbmZpZy5nZXQoJ2F0b20tY2xvY2suZGF0ZUZvcm1hdCcpXG4gICAgdGhpcy5zaG93VG9vbHRpcCA9IGF0b20uY29uZmlnLmdldCgnYXRvbS1jbG9jay5zaG93VG9vbHRpcCcpXG4gICAgdGhpcy50b29sdGlwRGF0ZUZvcm1hdCA9IGF0b20uY29uZmlnLmdldCgnYXRvbS1jbG9jay50b29sdGlwRGF0ZUZvcm1hdCcpXG4gICAgdGhpcy5sb2NhbGUgPSBhdG9tLmNvbmZpZy5nZXQoJ2F0b20tY2xvY2subG9jYWxlJylcbiAgICB0aGlzLnNob3dVVEMgPSBhdG9tLmNvbmZpZy5nZXQoJ2F0b20tY2xvY2suc2hvd1VUQycpXG4gICAgdGhpcy5yZWZyZXNoSW50ZXJ2YWwgPSBhdG9tLmNvbmZpZy5nZXQoJ2F0b20tY2xvY2sucmVmcmVzaEludGVydmFsJykgKiAxMDAwXG4gICAgdGhpcy5zaG93SWNvbiA9IGF0b20uY29uZmlnLmdldCgnYXRvbS1jbG9jay5zaG93Q2xvY2tJY29uJylcbiAgfVxuXG4gIHN0YXJ0VGlja2VyKCkge1xuICAgIHRoaXMuc2V0RGF0ZSgpXG4gICAgdmFyIG5leHRUaWNrID0gdGhpcy5yZWZyZXNoSW50ZXJ2YWwgLSAoRGF0ZS5ub3coKSAlIHRoaXMucmVmcmVzaEludGVydmFsKVxuICAgIHRoaXMudGljayA9IHNldFRpbWVvdXQgKCgpID0+ICB7IHRoaXMuc3RhcnRUaWNrZXIoKSB9LCBuZXh0VGljaylcbiAgfVxuXG4gIGNsZWFyVGlja2VyKCkge1xuICAgIGlmICh0aGlzLnRpY2spXG4gICAgICBjbGVhclRpbWVvdXQodGhpcy50aWNrKVxuICB9XG5cbiAgcmVmcmVzaFRpY2tlcigpIHtcbiAgICB0aGlzLnNldENvbmZpZ1ZhbHVlcygpXG4gICAgdGhpcy5jbGVhclRpY2tlcigpXG4gICAgdGhpcy5zdGFydFRpY2tlcigpXG4gIH1cblxuICBzZXREYXRlKCkge1xuICAgIHRoaXMuZGF0ZSA9IHRoaXMuZ2V0RGF0ZSh0aGlzLmxvY2FsZSwgdGhpcy5kYXRlRm9ybWF0KVxuICAgIHRoaXMudGltZUVsZW1lbnQudGV4dENvbnRlbnQgPSB0aGlzLmRhdGVcbiAgfVxuXG4gIGdldERhdGUobG9jYWxlLCBmb3JtYXQpIHtcbiAgICBpZiAoIXRoaXMuTW9tZW50KVxuICAgICAgdGhpcy5Nb21lbnQgPSByZXF1aXJlKCdtb21lbnQnKVxuXG4gICAgdmFyIG1vbWVudCA9IHRoaXMuTW9tZW50KCkubG9jYWxlKGxvY2FsZSlcblxuICAgIGlmICh0aGlzLnNob3dVVEMpXG4gICAgICBtb21lbnQudXRjKClcblxuICAgIHJldHVybiBtb21lbnQuZm9ybWF0KGZvcm1hdClcbiAgfVxuXG4gIHNldEljb24odG9TZXQpIHtcbiAgICBpZiAodG9TZXQpXG4gICAgICB0aGlzLmljb25FbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2ljb24nLCAnaWNvbi1jbG9jaycpXG4gICAgZWxzZVxuICAgICAgdGhpcy5pY29uRWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdpY29uJywgJ2ljb24tY2xvY2snKVxuICB9XG5cbiAgc2V0VG9vbHRpcCh0b1NldCkge1xuICAgIGlmICh0aGlzLnRvb2x0aXAgPT09IHVuZGVmaW5lZClcbiAgICAgIHRoaXMudG9vbHRpcCA9IGF0b20udG9vbHRpcHMuYWRkKHRoaXMuZWxlbWVudCwge1xuICAgICAgICB0aXRsZTogKCkgPT4gdGhpcy5nZXREYXRlKHRoaXMubG9jYWxlLCB0aGlzLnRvb2x0aXBEYXRlRm9ybWF0KSxcbiAgICAgICAgY2xhc3M6ICdhdG9tLWNsb2NrLXRvb2x0aXAnXG4gICAgICB9KVxuXG4gICAgaWYgKHRvU2V0KVxuICAgICAgYXRvbS50b29sdGlwcy5maW5kVG9vbHRpcHModGhpcy5lbGVtZW50KVswXS5lbmFibGUoKVxuICAgIGVsc2VcbiAgICAgIGF0b20udG9vbHRpcHMuZmluZFRvb2x0aXBzKHRoaXMuZWxlbWVudClbMF0uZGlzYWJsZSgpXG4gIH1cblxuICBzZXRVVENDbGFzcyh0b1NldCkge1xuICAgIGlmICh0b1NldCkge1xuICAgICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2F0b20tY2xvY2stdXRjJylcbiAgICAgIGF0b20udG9vbHRpcHMuZmluZFRvb2x0aXBzKHRoaXMuZWxlbWVudClbMF0uZ2V0VG9vbHRpcEVsZW1lbnQoKS5jbGFzc0xpc3QuYWRkKCdhdG9tLWNsb2NrLXV0YycpXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdhdG9tLWNsb2NrLXV0YycpXG4gICAgICBhdG9tLnRvb2x0aXBzLmZpbmRUb29sdGlwcyh0aGlzLmVsZW1lbnQpWzBdLmdldFRvb2x0aXBFbGVtZW50KCkuY2xhc3NMaXN0LnJlbW92ZSgnYXRvbS1jbG9jay11dGMnKVxuICAgIH1cbiAgfVxuXG5cbiAgdG9nZ2xlKCkge1xuICAgIHZhciBzdHlsZSA9IHRoaXMuZWxlbWVudC5zdHlsZS5kaXNwbGF5XG4gICAgdGhpcy5lbGVtZW50LnN0eWxlLmRpc3BsYXkgPSBzdHlsZSA9PT0gJ25vbmUnID8gJycgOiAnbm9uZSdcbiAgfVxuXG4gIGRlc3Ryb3koKSB7XG4gICAgdGhpcy5jbGVhclRpY2tlcigpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICAgIHRoaXMudG9vbHRpcC5kaXNwb3NlKClcbiAgICB0aGlzLmVsZW1lbnQucmVtb3ZlKClcbiAgfVxufVxuIl19