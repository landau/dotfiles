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
        }
      });

      if (toSet) atom.tooltips.findTooltips(this.element)[0].enable();else atom.tooltips.findTooltips(this.element)[0].disable();
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1Ly5hdG9tL3BhY2thZ2VzL2F0b20tY2xvY2svbGliL2F0b20tY2xvY2stdmlldy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7OztvQkFFb0MsTUFBTTs7QUFGMUMsV0FBVyxDQUFDOztJQUlTLGFBQWE7QUFFckIsV0FGUSxhQUFhLENBRXBCLFNBQVMsRUFBRTswQkFGSixhQUFhOztBQUc5QixRQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQTtBQUMxQixRQUFJLENBQUMsYUFBYSxHQUFHLCtCQUF5QixDQUFBO0dBQy9DOztlQUxrQixhQUFhOztXQU8zQixpQkFBRztBQUNOLFVBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQTtBQUNsQixVQUFJLENBQUMsVUFBVSxFQUFFLENBQUE7S0FDbEI7OztXQUVTLHNCQUFHOzs7QUFDWCxVQUFJLENBQUMsZUFBZSxFQUFFLENBQUE7QUFDdEIsVUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUE7QUFDakMsVUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUE7QUFDM0IsVUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFBOztBQUVsQixVQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRTtBQUN6RCwyQkFBbUIsRUFBRTtpQkFBTSxNQUFLLE1BQU0sRUFBRTtTQUFBO0FBQ3hDLDZCQUFxQixFQUFFO2lCQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLG9CQUFvQixFQUFFLENBQUMsTUFBSyxPQUFPLENBQUM7U0FBQTtPQUNsRixDQUFDLENBQUMsQ0FBQTs7QUFFSCxVQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyx1QkFBdUIsRUFBRSxZQUFNO0FBQzVFLGNBQUssYUFBYSxFQUFFLENBQUE7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SSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFBO0FBQ3RDLFVBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxLQUFLLEtBQUssTUFBTSxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUE7S0FDNUQ7OztXQUVNLG1CQUFHO0FBQ1IsVUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFBO0FBQ2xCLFVBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLENBQUE7QUFDNUIsVUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQTtBQUN0QixVQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFBO0tBQ3RCOzs7U0FuSmtCLGFBQWE7OztxQkFBYixhQUFhIiwiZmlsZSI6Ii9Vc2Vycy90bGFuZGF1Ly5hdG9tL3BhY2thZ2VzL2F0b20tY2xvY2svbGliL2F0b20tY2xvY2stdmlldy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5pbXBvcnQgeyBDb21wb3NpdGVEaXNwb3NhYmxlIH0gZnJvbSAnYXRvbSdcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQXRvbUNsb2NrVmlldyB7XG5cbiAgY29uc3RydWN0b3Ioc3RhdHVzQmFyKSB7XG4gICAgdGhpcy5zdGF0dXNCYXIgPSBzdGF0dXNCYXJcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG4gIH1cblxuICBzdGFydCgpIHtcbiAgICB0aGlzLmRyYXdFbGVtZW50KClcbiAgICB0aGlzLmluaXRpYWxpemUoKVxuICB9XG5cbiAgaW5pdGlhbGl6ZSgpIHtcbiAgICB0aGlzLnNldENvbmZpZ1ZhbHVlcygpXG4gICAgdGhpcy5zZXRUb29sdGlwKHRoaXMuc2hvd1Rvb2x0aXApXG4gICAgdGhpcy5zZXRJY29uKHRoaXMuc2hvd0ljb24pXG4gICAgdGhpcy5zdGFydFRpY2tlcigpXG5cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXdvcmtzcGFjZScsIHtcbiAgICAgICdhdG9tLWNsb2NrOnRvZ2dsZSc6ICgpID0+IHRoaXMudG9nZ2xlKCksXG4gICAgICAnYXRvbS1jbG9jazp1dGMtbW9kZSc6ICgpID0+IGF0b20uY29uZmlnLnNldCgnYXRvbS1jbG9jay5zaG93VVRDJywgIXRoaXMuc2hvd1VUQylcbiAgICB9KSlcblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb25maWcub25EaWRDaGFuZ2UoJ2F0b20tY2xvY2suZGF0ZUZvcm1hdCcsICgpID0+IHtcbiAgICAgIHRoaXMucmVmcmVzaFRpY2tlcigpXG4gICAgfSkpXG5cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlKCdhdG9tLWNsb2NrLnNob3dUb29sdGlwJywgKCkgPT4ge1xuICAgICAgdGhpcy5zZXRDb25maWdWYWx1ZXMoKVxuICAgICAgdGhpcy5zZXRUb29sdGlwKHRoaXMuc2hvd1Rvb2x0aXApXG4gICAgfSkpXG5cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlKCdhdG9tLWNsb2NrLnRvb2x0aXBEYXRlRm9ybWF0JywgKCkgPT4ge1xuICAgICAgdGhpcy5yZWZyZXNoVGlja2VyKClcbiAgICB9KSlcblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb25maWcub25EaWRDaGFuZ2UoJ2F0b20tY2xvY2subG9jYWxlJywgKCkgPT4ge1xuICAgICAgdGhpcy5yZWZyZXNoVGlja2VyKClcbiAgICB9KSlcblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb25maWcub25EaWRDaGFuZ2UoJ2F0b20tY2xvY2suc2hvd1VUQycsICgpID0+IHtcbiAgICAgIHRoaXMucmVmcmVzaFRpY2tlcigpXG4gICAgfSkpXG5cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlKCdhdG9tLWNsb2NrLnJlZnJlc2hJbnRlcnZhbCcsICgpID0+IHtcbiAgICAgIHRoaXMucmVmcmVzaFRpY2tlcigpXG4gICAgfSkpXG5cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlKCdhdG9tLWNsb2NrLnNob3dDbG9ja0ljb24nLCAoKSA9PiB7XG4gICAgICB0aGlzLnNldENvbmZpZ1ZhbHVlcygpXG4gICAgICB0aGlzLnNldEljb24odGhpcy5zaG93SWNvbilcbiAgICB9KSlcblxuICB9XG5cbiAgZHJhd0VsZW1lbnQoKSB7XG4gICAgdGhpcy5lbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnYXRvbS1jbG9jaycsICdpbmxpbmUtYmxvY2snKVxuXG4gICAgdGhpcy5pY29uRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKVxuICAgIHRoaXMuaWNvbkVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnYXRvbS1jbG9jay1pY29uJylcblxuICAgIHRoaXMudGltZUVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJylcbiAgICB0aGlzLnRpbWVFbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2F0b20tY2xvY2stdGltZScpXG5cbiAgICB0aGlzLmVsZW1lbnQuYXBwZW5kQ2hpbGQodGhpcy5pY29uRWxlbWVudClcbiAgICB0aGlzLmVsZW1lbnQuYXBwZW5kQ2hpbGQodGhpcy50aW1lRWxlbWVudClcblxuICAgIHRoaXMuc3RhdHVzQmFyLmFkZFJpZ2h0VGlsZSh7XG4gICAgICBpdGVtOiB0aGlzLmVsZW1lbnQsXG4gICAgICBwcmlvcml0eTogLTUwMFxuICAgIH0pXG4gIH1cblxuICBzZXRDb25maWdWYWx1ZXMoKSB7XG4gICAgdGhpcy5kYXRlRm9ybWF0ID0gYXRvbS5jb25maWcuZ2V0KCdhdG9tLWNsb2NrLmRhdGVGb3JtYXQnKVxuICAgIHRoaXMuc2hvd1Rvb2x0aXAgPSBhdG9tLmNvbmZpZy5nZXQoJ2F0b20tY2xvY2suc2hvd1Rvb2x0aXAnKVxuICAgIHRoaXMudG9vbHRpcERhdGVGb3JtYXQgPSBhdG9tLmNvbmZpZy5nZXQoJ2F0b20tY2xvY2sudG9vbHRpcERhdGVGb3JtYXQnKVxuICAgIHRoaXMubG9jYWxlID0gYXRvbS5jb25maWcuZ2V0KCdhdG9tLWNsb2NrLmxvY2FsZScpXG4gICAgdGhpcy5zaG93VVRDID0gYXRvbS5jb25maWcuZ2V0KCdhdG9tLWNsb2NrLnNob3dVVEMnKVxuICAgIHRoaXMucmVmcmVzaEludGVydmFsID0gYXRvbS5jb25maWcuZ2V0KCdhdG9tLWNsb2NrLnJlZnJlc2hJbnRlcnZhbCcpICogMTAwMFxuICAgIHRoaXMuc2hvd0ljb24gPSBhdG9tLmNvbmZpZy5nZXQoJ2F0b20tY2xvY2suc2hvd0Nsb2NrSWNvbicpXG4gIH1cblxuICBzdGFydFRpY2tlcigpIHtcbiAgICB0aGlzLnNldERhdGUoKVxuICAgIHZhciBuZXh0VGljayA9IHRoaXMucmVmcmVzaEludGVydmFsIC0gKERhdGUubm93KCkgJSB0aGlzLnJlZnJlc2hJbnRlcnZhbClcbiAgICB0aGlzLnRpY2sgPSBzZXRUaW1lb3V0ICgoKSA9PiAgeyB0aGlzLnN0YXJ0VGlja2VyKCkgfSwgbmV4dFRpY2spXG4gIH1cblxuICBjbGVhclRpY2tlcigpIHtcbiAgICBpZiAodGhpcy50aWNrKVxuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMudGljaylcbiAgfVxuXG4gIHJlZnJlc2hUaWNrZXIoKSB7XG4gICAgdGhpcy5zZXRDb25maWdWYWx1ZXMoKVxuICAgIHRoaXMuY2xlYXJUaWNrZXIoKVxuICAgIHRoaXMuc3RhcnRUaWNrZXIoKVxuICB9XG5cbiAgc2V0RGF0ZSgpIHtcbiAgICB0aGlzLmRhdGUgPSB0aGlzLmdldERhdGUodGhpcy5sb2NhbGUsIHRoaXMuZGF0ZUZvcm1hdClcbiAgICB0aGlzLnRpbWVFbGVtZW50LnRleHRDb250ZW50ID0gdGhpcy5kYXRlXG4gIH1cblxuICBnZXREYXRlKGxvY2FsZSwgZm9ybWF0KSB7XG4gICAgaWYgKCF0aGlzLk1vbWVudClcbiAgICAgIHRoaXMuTW9tZW50ID0gcmVxdWlyZSgnbW9tZW50JylcblxuICAgIHZhciBtb21lbnQgPSB0aGlzLk1vbWVudCgpLmxvY2FsZShsb2NhbGUpXG5cbiAgICBpZiAodGhpcy5zaG93VVRDKVxuICAgICAgbW9tZW50LnV0YygpXG5cbiAgICByZXR1cm4gbW9tZW50LmZvcm1hdChmb3JtYXQpXG4gIH1cblxuICBzZXRJY29uKHRvU2V0KSB7XG4gICAgaWYgKHRvU2V0KVxuICAgICAgdGhpcy5pY29uRWxlbWVudC5jbGFzc0xpc3QuYWRkKCdpY29uJywgJ2ljb24tY2xvY2snKVxuICAgIGVsc2VcbiAgICAgIHRoaXMuaWNvbkVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnaWNvbicsICdpY29uLWNsb2NrJylcbiAgfVxuXG4gIHNldFRvb2x0aXAodG9TZXQpIHtcbiAgICBpZiAodGhpcy50b29sdGlwID09PSB1bmRlZmluZWQpXG4gICAgICB0aGlzLnRvb2x0aXAgPSBhdG9tLnRvb2x0aXBzLmFkZCh0aGlzLmVsZW1lbnQsIHtcbiAgICAgICAgdGl0bGU6ICgpID0+IHRoaXMuZ2V0RGF0ZSh0aGlzLmxvY2FsZSwgdGhpcy50b29sdGlwRGF0ZUZvcm1hdClcbiAgICAgIH0pXG5cbiAgICBpZiAodG9TZXQpXG4gICAgICBhdG9tLnRvb2x0aXBzLmZpbmRUb29sdGlwcyh0aGlzLmVsZW1lbnQpWzBdLmVuYWJsZSgpXG4gICAgZWxzZVxuICAgICAgYXRvbS50b29sdGlwcy5maW5kVG9vbHRpcHModGhpcy5lbGVtZW50KVswXS5kaXNhYmxlKClcbiAgfVxuXG4gIHRvZ2dsZSgpIHtcbiAgICB2YXIgc3R5bGUgPSB0aGlzLmVsZW1lbnQuc3R5bGUuZGlzcGxheVxuICAgIHRoaXMuZWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gc3R5bGUgPT09ICdub25lJyA/ICcnIDogJ25vbmUnXG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIHRoaXMuY2xlYXJUaWNrZXIoKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiAgICB0aGlzLnRvb2x0aXAuZGlzcG9zZSgpXG4gICAgdGhpcy5lbGVtZW50LnJlbW92ZSgpXG4gIH1cbn1cbiJdfQ==