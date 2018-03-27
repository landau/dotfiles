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
      this.element.className = 'atom-clock';
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
      this.showTooltip = atom.config.get('atom-clock.showTooltip');
      this.tooltipDateFormat = atom.config.get('atom-clock.tooltipDateFormat');
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
      if (!this.Moment) this.Moment = require('moment');

      return this.Moment().locale(locale).format(format);
    }
  }, {
    key: 'setIcon',
    value: function setIcon(toSet) {
      if (toSet) this.element.firstChild.className += 'icon icon-clock';else this.element.firstChild.className = '';
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
      this.element.parentNode.removeChild(this.element);
    }
  }]);

  return AtomClockView;
})();

exports['default'] = AtomClockView;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1Ly5hdG9tL3BhY2thZ2VzL2F0b20tY2xvY2svbGliL2F0b20tY2xvY2stdmlldy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7OztvQkFFb0MsTUFBTTs7QUFGMUMsV0FBVyxDQUFDOztJQUlTLGFBQWE7QUFFckIsV0FGUSxhQUFhLENBRXBCLFNBQVMsRUFBRTswQkFGSixhQUFhOztBQUc5QixRQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQTtBQUMxQixRQUFJLENBQUMsYUFBYSxHQUFHLCtCQUF5QixDQUFBO0dBQy9DOztlQUxrQixhQUFhOztXQU8zQixpQkFBRztBQUNOLFVBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQTtBQUNsQixVQUFJLENBQUMsVUFBVSxFQUFFLENBQUE7S0FDbEI7OztXQUVTLHNCQUFHOzs7QUFDWCxVQUFJLENBQUMsZUFBZSxFQUFFLENBQUE7QUFDdEIsVUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUE7QUFDakMsVUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUE7QUFDM0IsVUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFBOztBQUVsQixVQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRTtBQUN6RCwyQkFBbUIsRUFBRTtpQkFBTSxNQUFLLE1BQU0sRUFBRTtTQUFBO09BQ3pDLENBQUMsQ0FBQyxDQUFBOztBQUVILFVBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLHVCQUF1QixFQUFFLFlBQU07QUFDNUUsY0FBSyxhQUFhLEVBQUUsQ0FBQTtPQUNyQixDQUFDLENBQUMsQ0FBQTs7QUFFSCxVQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyx3QkFB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T0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUEsS0FFcEQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFBO0tBQ3hEOzs7V0FFSyxrQkFBRztBQUNQLFVBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQTtBQUN0QyxVQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsS0FBSyxLQUFLLE1BQU0sR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFBO0tBQzVEOzs7V0FFTSxtQkFBRztBQUNSLFVBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQTtBQUNsQixVQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxDQUFBO0FBQzVCLFVBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUE7QUFDdEIsVUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQTtLQUNsRDs7O1NBaElrQixhQUFhOzs7cUJBQWIsYUFBYSIsImZpbGUiOiIvVXNlcnMvdGxhbmRhdS8uYXRvbS9wYWNrYWdlcy9hdG9tLWNsb2NrL2xpYi9hdG9tLWNsb2NrLXZpZXcuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuaW1wb3J0IHsgQ29tcG9zaXRlRGlzcG9zYWJsZSB9IGZyb20gJ2F0b20nXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEF0b21DbG9ja1ZpZXcge1xuXG4gIGNvbnN0cnVjdG9yKHN0YXR1c0Jhcikge1xuICAgIHRoaXMuc3RhdHVzQmFyID0gc3RhdHVzQmFyXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuICB9XG5cbiAgc3RhcnQoKSB7XG4gICAgdGhpcy5kcmF3RWxlbWVudCgpXG4gICAgdGhpcy5pbml0aWFsaXplKClcbiAgfVxuXG4gIGluaXRpYWxpemUoKSB7XG4gICAgdGhpcy5zZXRDb25maWdWYWx1ZXMoKVxuICAgIHRoaXMuc2V0VG9vbHRpcCh0aGlzLnNob3dUb29sdGlwKVxuICAgIHRoaXMuc2V0SWNvbih0aGlzLnNob3dJY29uKVxuICAgIHRoaXMuc3RhcnRUaWNrZXIoKVxuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbW1hbmRzLmFkZCgnYXRvbS13b3Jrc3BhY2UnLCB7XG4gICAgICAnYXRvbS1jbG9jazp0b2dnbGUnOiAoKSA9PiB0aGlzLnRvZ2dsZSgpXG4gICAgfSkpXG5cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlKCdhdG9tLWNsb2NrLmRhdGVGb3JtYXQnLCAoKSA9PiB7XG4gICAgICB0aGlzLnJlZnJlc2hUaWNrZXIoKVxuICAgIH0pKVxuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbmZpZy5vbkRpZENoYW5nZSgnYXRvbS1jbG9jay5zaG93VG9vbHRpcCcsICgpID0+IHtcbiAgICAgIHRoaXMuc2V0Q29uZmlnVmFsdWVzKClcbiAgICAgIHRoaXMuc2V0VG9vbHRpcCh0aGlzLnNob3dUb29sdGlwKVxuICAgIH0pKVxuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbmZpZy5vbkRpZENoYW5nZSgnYXRvbS1jbG9jay50b29sdGlwRGF0ZUZvcm1hdCcsICgpID0+IHtcbiAgICAgIHRoaXMucmVmcmVzaFRpY2tlcigpXG4gICAgfSkpXG5cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlKCdhdG9tLWNsb2NrLmxvY2FsZScsICgpID0+IHtcbiAgICAgIHRoaXMucmVmcmVzaFRpY2tlcigpXG4gICAgfSkpXG5cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlKCdhdG9tLWNsb2NrLnJlZnJlc2hJbnRlcnZhbCcsICgpID0+IHtcbiAgICAgIHRoaXMucmVmcmVzaFRpY2tlcigpXG4gICAgfSkpXG5cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlKCdhdG9tLWNsb2NrLnNob3dDbG9ja0ljb24nLCAoKSA9PiB7XG4gICAgICB0aGlzLnNldENvbmZpZ1ZhbHVlcygpXG4gICAgICB0aGlzLnNldEljb24odGhpcy5zaG93SWNvbilcbiAgICB9KSlcblxuICB9XG5cbiAgZHJhd0VsZW1lbnQoKSB7XG4gICAgdGhpcy5lbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICB0aGlzLmVsZW1lbnQuY2xhc3NOYW1lID0gJ2F0b20tY2xvY2snXG4gICAgdGhpcy5lbGVtZW50LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKSlcblxuICAgIHRoaXMuc3RhdHVzQmFyLmFkZFJpZ2h0VGlsZSh7XG4gICAgICBpdGVtOiB0aGlzLmVsZW1lbnQsXG4gICAgICBwcmlvcml0eTogLTFcbiAgICB9KVxuICB9XG5cbiAgc2V0Q29uZmlnVmFsdWVzKCkge1xuICAgIHRoaXMuZGF0ZUZvcm1hdCA9IGF0b20uY29uZmlnLmdldCgnYXRvbS1jbG9jay5kYXRlRm9ybWF0JylcbiAgICB0aGlzLnNob3dUb29sdGlwID0gYXRvbS5jb25maWcuZ2V0KCdhdG9tLWNsb2NrLnNob3dUb29sdGlwJylcbiAgICB0aGlzLnRvb2x0aXBEYXRlRm9ybWF0ID0gYXRvbS5jb25maWcuZ2V0KCdhdG9tLWNsb2NrLnRvb2x0aXBEYXRlRm9ybWF0JylcbiAgICB0aGlzLmxvY2FsZSA9IGF0b20uY29uZmlnLmdldCgnYXRvbS1jbG9jay5sb2NhbGUnKVxuICAgIHRoaXMucmVmcmVzaEludGVydmFsID0gYXRvbS5jb25maWcuZ2V0KCdhdG9tLWNsb2NrLnJlZnJlc2hJbnRlcnZhbCcpICogMTAwMFxuICAgIHRoaXMuc2hvd0ljb24gPSBhdG9tLmNvbmZpZy5nZXQoJ2F0b20tY2xvY2suc2hvd0Nsb2NrSWNvbicpXG4gIH1cblxuICBzdGFydFRpY2tlcigpIHtcbiAgICB0aGlzLnNldERhdGUoKVxuICAgIHZhciBuZXh0VGljayA9IHRoaXMucmVmcmVzaEludGVydmFsIC0gKERhdGUubm93KCkgJSB0aGlzLnJlZnJlc2hJbnRlcnZhbClcbiAgICB0aGlzLnRpY2sgPSBzZXRUaW1lb3V0ICgoKSA9PiAgeyB0aGlzLnN0YXJ0VGlja2VyKCkgfSwgbmV4dFRpY2spXG4gIH1cblxuICBjbGVhclRpY2tlcigpIHtcbiAgICBpZiAodGhpcy50aWNrKVxuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMudGljaylcbiAgfVxuXG4gIHJlZnJlc2hUaWNrZXIoKSB7XG4gICAgdGhpcy5zZXRDb25maWdWYWx1ZXMoKVxuICAgIHRoaXMuY2xlYXJUaWNrZXIoKVxuICAgIHRoaXMuc3RhcnRUaWNrZXIoKVxuICB9XG5cbiAgc2V0RGF0ZSgpIHtcbiAgICB0aGlzLmRhdGUgPSB0aGlzLmdldERhdGUodGhpcy5sb2NhbGUsIHRoaXMuZGF0ZUZvcm1hdClcbiAgICB0aGlzLmVsZW1lbnQuZmlyc3RDaGlsZC50ZXh0Q29udGVudCA9IHRoaXMuZGF0ZVxuICB9XG5cbiAgZ2V0RGF0ZShsb2NhbGUsIGZvcm1hdCkge1xuICAgIGlmICghdGhpcy5Nb21lbnQpXG4gICAgICB0aGlzLk1vbWVudCA9IHJlcXVpcmUoJ21vbWVudCcpXG5cbiAgICByZXR1cm4gdGhpcy5Nb21lbnQoKS5sb2NhbGUobG9jYWxlKS5mb3JtYXQoZm9ybWF0KVxuICB9XG5cbiAgc2V0SWNvbih0b1NldCkge1xuICAgIGlmICh0b1NldClcbiAgICAgIHRoaXMuZWxlbWVudC5maXJzdENoaWxkLmNsYXNzTmFtZSArPSAnaWNvbiBpY29uLWNsb2NrJ1xuICAgIGVsc2VcbiAgICAgIHRoaXMuZWxlbWVudC5maXJzdENoaWxkLmNsYXNzTmFtZSA9ICcnXG4gIH1cblxuICBzZXRUb29sdGlwKHRvU2V0KSB7XG4gICAgaWYgKHRoaXMudG9vbHRpcCA9PT0gdW5kZWZpbmVkKVxuICAgICAgdGhpcy50b29sdGlwID0gYXRvbS50b29sdGlwcy5hZGQodGhpcy5lbGVtZW50LCB7XG4gICAgICAgIHRpdGxlOiAoKSA9PiB0aGlzLmdldERhdGUodGhpcy5sb2NhbGUsIHRoaXMudG9vbHRpcERhdGVGb3JtYXQpXG4gICAgICB9KVxuXG4gICAgaWYgKHRvU2V0KVxuICAgICAgYXRvbS50b29sdGlwcy5maW5kVG9vbHRpcHModGhpcy5lbGVtZW50KVswXS5lbmFibGUoKVxuICAgIGVsc2VcbiAgICAgIGF0b20udG9vbHRpcHMuZmluZFRvb2x0aXBzKHRoaXMuZWxlbWVudClbMF0uZGlzYWJsZSgpXG4gIH1cblxuICB0b2dnbGUoKSB7XG4gICAgdmFyIHN0eWxlID0gdGhpcy5lbGVtZW50LnN0eWxlLmRpc3BsYXlcbiAgICB0aGlzLmVsZW1lbnQuc3R5bGUuZGlzcGxheSA9IHN0eWxlID09PSAnbm9uZScgPyAnJyA6ICdub25lJ1xuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLmNsZWFyVGlja2VyKClcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG4gICAgdGhpcy50b29sdGlwLmRpc3Bvc2UoKVxuICAgIHRoaXMuZWxlbWVudC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRoaXMuZWxlbWVudClcbiAgfVxufVxuIl19