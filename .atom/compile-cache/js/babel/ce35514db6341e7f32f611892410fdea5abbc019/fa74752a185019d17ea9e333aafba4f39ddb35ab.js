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
      this.element.parentNode.removeChild(this.element);
    }
  }]);

  return AtomClockView;
})();

exports['default'] = AtomClockView;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2F0b20tY2xvY2svbGliL2F0b20tY2xvY2stdmlldy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7OztvQkFFb0MsTUFBTTs7QUFGMUMsV0FBVyxDQUFDOztJQUlTLGFBQWE7QUFFckIsV0FGUSxhQUFhLENBRXBCLFNBQVMsRUFBRTswQkFGSixhQUFhOztBQUc5QixRQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQTtBQUMxQixRQUFJLENBQUMsYUFBYSxHQUFHLCtCQUF5QixDQUFBO0dBQy9DOztlQUxrQixhQUFhOztXQU8zQixpQkFBRztBQUNOLFVBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQTtBQUNsQixVQUFJLENBQUMsVUFBVSxFQUFFLENBQUE7S0FDbEI7OztXQUVTLHNCQUFHOzs7QUFDWCxVQUFJLENBQUMsZUFBZSxFQUFFLENBQUE7QUFDdEIsVUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUE7QUFDM0IsVUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFBOztBQUVsQixVQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRTtBQUN6RCwyQkFBbUIsRUFBRTtpQkFBTSxNQUFLLE1BQU0sRUFBRTtTQUFBO09BQ3pDLENBQUMsQ0FBQyxDQUFBOztBQUVILFVBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLHVCQUF1QixFQUFFLFlBQU07QUFDNUUsY0FBSyxhQUFhLEVBQUUsQ0FBQTtPQUNyQixDQUFDLENBQUMsQ0FBQTs7QUFFSCxVQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxtQkFBbUIsRUFBRSxZQUFNO0FBQ3hFLGNBQUssYUFBYSxFQUFFLENBQUE7T0FD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SyxFQUNQLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLFNBQVMsSUFBSSxpQkFBaUIsQ0FBQSxLQUV0RCxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFBO0tBQ3pDOzs7V0FFSyxrQkFBRztBQUNQLFVBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQTtBQUN0QyxVQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsS0FBSyxLQUFLLE1BQU0sR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFBO0tBQzVEOzs7V0FFTSxtQkFBRztBQUNSLFVBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQTtBQUNsQixVQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxDQUFBO0FBQzVCLFVBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUE7S0FDbEQ7OztTQXZHa0IsYUFBYTs7O3FCQUFiLGFBQWEiLCJmaWxlIjoiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvYXRvbS1jbG9jay9saWIvYXRvbS1jbG9jay12aWV3LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbmltcG9ydCB7IENvbXBvc2l0ZURpc3Bvc2FibGUgfSBmcm9tICdhdG9tJ1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBdG9tQ2xvY2tWaWV3IHtcblxuICBjb25zdHJ1Y3RvcihzdGF0dXNCYXIpIHtcbiAgICB0aGlzLnN0YXR1c0JhciA9IHN0YXR1c0JhclxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcbiAgfVxuXG4gIHN0YXJ0KCkge1xuICAgIHRoaXMuZHJhd0VsZW1lbnQoKVxuICAgIHRoaXMuaW5pdGlhbGl6ZSgpXG4gIH1cblxuICBpbml0aWFsaXplKCkge1xuICAgIHRoaXMuc2V0Q29uZmlnVmFsdWVzKClcbiAgICB0aGlzLnNldEljb24odGhpcy5zaG93SWNvbilcbiAgICB0aGlzLnN0YXJ0VGlja2VyKClcblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20td29ya3NwYWNlJywge1xuICAgICAgJ2F0b20tY2xvY2s6dG9nZ2xlJzogKCkgPT4gdGhpcy50b2dnbGUoKVxuICAgIH0pKVxuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbmZpZy5vbkRpZENoYW5nZSgnYXRvbS1jbG9jay5kYXRlRm9ybWF0JywgKCkgPT4ge1xuICAgICAgdGhpcy5yZWZyZXNoVGlja2VyKClcbiAgICB9KSlcblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb25maWcub25EaWRDaGFuZ2UoJ2F0b20tY2xvY2subG9jYWxlJywgKCkgPT4ge1xuICAgICAgdGhpcy5yZWZyZXNoVGlja2VyKClcbiAgICB9KSlcblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb25maWcub25EaWRDaGFuZ2UoJ2F0b20tY2xvY2sucmVmcmVzaEludGVydmFsJywgKCkgPT4ge1xuICAgICAgdGhpcy5yZWZyZXNoVGlja2VyKClcbiAgICB9KSlcblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb25maWcub25EaWRDaGFuZ2UoJ2F0b20tY2xvY2suc2hvd0Nsb2NrSWNvbicsICgpID0+IHtcbiAgICAgIHRoaXMuc2V0Q29uZmlnVmFsdWVzKClcbiAgICAgIHRoaXMuc2V0SWNvbih0aGlzLnNob3dJY29uKVxuICAgIH0pKVxuXG4gIH1cblxuICBkcmF3RWxlbWVudCgpIHtcbiAgICB0aGlzLmVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgIHRoaXMuZWxlbWVudC5jbGFzc05hbWUgPSAnYXRvbS1jbG9jaydcbiAgICB0aGlzLmVsZW1lbnQuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpKVxuXG4gICAgdGhpcy5zdGF0dXNCYXIuYWRkUmlnaHRUaWxlKHtcbiAgICAgIGl0ZW06IHRoaXMuZWxlbWVudCxcbiAgICAgIHByaW9yaXR5OiAtMVxuICAgIH0pXG4gIH1cblxuICBzZXRDb25maWdWYWx1ZXMoKSB7XG4gICAgdGhpcy5kYXRlRm9ybWF0ID0gYXRvbS5jb25maWcuZ2V0KCdhdG9tLWNsb2NrLmRhdGVGb3JtYXQnKVxuICAgIHRoaXMubG9jYWxlID0gYXRvbS5jb25maWcuZ2V0KCdhdG9tLWNsb2NrLmxvY2FsZScpXG4gICAgdGhpcy5yZWZyZXNoSW50ZXJ2YWwgPSBhdG9tLmNvbmZpZy5nZXQoJ2F0b20tY2xvY2sucmVmcmVzaEludGVydmFsJykgKiAxMDAwXG4gICAgdGhpcy5zaG93SWNvbiA9IGF0b20uY29uZmlnLmdldCgnYXRvbS1jbG9jay5zaG93Q2xvY2tJY29uJylcbiAgfVxuXG4gIHN0YXJ0VGlja2VyKCkge1xuICAgIHRoaXMuc2V0RGF0ZSgpXG4gICAgdmFyIG5leHRUaWNrID0gdGhpcy5yZWZyZXNoSW50ZXJ2YWwgLSAoRGF0ZS5ub3coKSAlIHRoaXMucmVmcmVzaEludGVydmFsKVxuICAgIHRoaXMudGljayA9IHNldFRpbWVvdXQgKCgpID0+ICB7IHRoaXMuc3RhcnRUaWNrZXIoKSB9LCBuZXh0VGljaylcbiAgfVxuXG4gIGNsZWFyVGlja2VyKCkge1xuICAgIGlmICh0aGlzLnRpY2spXG4gICAgICBjbGVhclRpbWVvdXQodGhpcy50aWNrKVxuICB9XG5cbiAgcmVmcmVzaFRpY2tlcigpIHtcbiAgICB0aGlzLnNldENvbmZpZ1ZhbHVlcygpXG4gICAgdGhpcy5jbGVhclRpY2tlcigpXG4gICAgdGhpcy5zdGFydFRpY2tlcigpXG4gIH1cblxuICBzZXREYXRlKCkge1xuICAgIHRoaXMuZGF0ZSA9IHRoaXMuZ2V0RGF0ZSh0aGlzLmxvY2FsZSwgdGhpcy5kYXRlRm9ybWF0KVxuICAgIHRoaXMuZWxlbWVudC5maXJzdENoaWxkLnRleHRDb250ZW50ID0gdGhpcy5kYXRlXG4gIH1cblxuICBnZXREYXRlKGxvY2FsZSwgZm9ybWF0KSB7XG4gICAgaWYgKCF0aGlzLk1vbWVudClcbiAgICAgIHRoaXMuTW9tZW50ID0gcmVxdWlyZSgnbW9tZW50JylcblxuICAgIHJldHVybiB0aGlzLk1vbWVudCgpLmxvY2FsZShsb2NhbGUpLmZvcm1hdChmb3JtYXQpXG4gIH1cblxuICBzZXRJY29uKHRvU2V0KSB7XG4gICAgaWYgKHRvU2V0KVxuICAgICAgdGhpcy5lbGVtZW50LmZpcnN0Q2hpbGQuY2xhc3NOYW1lICs9ICdpY29uIGljb24tY2xvY2snXG4gICAgZWxzZVxuICAgICAgdGhpcy5lbGVtZW50LmZpcnN0Q2hpbGQuY2xhc3NOYW1lID0gJydcbiAgfVxuXG4gIHRvZ2dsZSgpIHtcbiAgICB2YXIgc3R5bGUgPSB0aGlzLmVsZW1lbnQuc3R5bGUuZGlzcGxheVxuICAgIHRoaXMuZWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gc3R5bGUgPT09ICdub25lJyA/ICcnIDogJ25vbmUnXG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIHRoaXMuY2xlYXJUaWNrZXIoKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiAgICB0aGlzLmVsZW1lbnQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0aGlzLmVsZW1lbnQpXG4gIH1cblxufVxuIl19