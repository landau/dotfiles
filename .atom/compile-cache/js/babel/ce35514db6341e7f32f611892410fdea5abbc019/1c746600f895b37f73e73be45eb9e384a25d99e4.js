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
      this.adjustElementSize();

      this.subscriptions.add(atom.commands.add('atom-workspace', {
        'atom-clock:toggle': function atomClockToggle() {
          return _this.toggle();
        }
      }));

      this.subscriptions.add(atom.config.onDidChange('atom-clock.dateFormat', function () {
        _this.refreshTicker();
        _this.adjustElementSize();
      }));

      this.subscriptions.add(atom.config.onDidChange('atom-clock.locale', function () {
        _this.refreshTicker();
        _this.adjustElementSize();
      }));

      this.subscriptions.add(atom.config.onDidChange('atom-clock.refreshInterval', function () {
        _this.refreshTicker();
      }));

      this.subscriptions.add(atom.config.onDidChange('atom-clock.showClockIcon', function () {
        _this.setConfigValues();
        _this.setIcon(_this.showIcon);
        _this.adjustElementSize();
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
    key: 'adjustElementSize',
    value: function adjustElementSize() {
      var contentWidth = this.element.firstChild.getBoundingClientRect().width + 5;
      this.element.style.width = contentWidth + 5 + 'px';
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2F0b20tY2xvY2svbGliL2F0b20tY2xvY2stdmlldy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7OztvQkFFb0MsTUFBTTs7QUFGMUMsV0FBVyxDQUFDOztJQUlTLGFBQWE7QUFFckIsV0FGUSxhQUFhLENBRXBCLFNBQVMsRUFBRTswQkFGSixhQUFhOztBQUc5QixRQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQTtBQUMxQixRQUFJLENBQUMsYUFBYSxHQUFHLCtCQUF5QixDQUFBO0dBQy9DOztlQUxrQixhQUFhOztXQU8zQixpQkFBRztBQUNOLFVBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQTtBQUNsQixVQUFJLENBQUMsVUFBVSxFQUFFLENBQUE7S0FDbEI7OztXQUVTLHNCQUFHOzs7QUFDWCxVQUFJLENBQUMsZUFBZSxFQUFFLENBQUE7QUFDdEIsVUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUE7QUFDM0IsVUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFBO0FBQ2xCLFVBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFBOztBQUV4QixVQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRTtBQUN6RCwyQkFBbUIsRUFBRTtpQkFBTSxNQUFLLE1BQU0sRUFBRTtTQUFBO09BQ3pDLENBQUMsQ0FBQyxDQUFBOztBQUVILFVBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLHVCQUF1QixFQUFFLFlBQU07QUFDNUUsY0FBSyxhQUFhLEVBQUUsQ0FBQTtBQUNwQixjQUFLLGlCQUFpQixFQUFFLENBQUE7T0FDekIsQ0FBQyxDQUFDLENBQUE7O0FBRUgsVUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0s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SUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUE7S0FDbkQ7OztXQUVnQiw2QkFBRztBQUNsQixVQUFJLFlBQVksR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxxQkFBcUIsRUFBRSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUE7QUFDNUUsVUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLFlBQVksR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFBO0tBQ25EOzs7V0FFTSxpQkFBQyxLQUFLLEVBQUU7QUFDYixVQUFJLEtBQUssRUFDUCxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxTQUFTLElBQUksaUJBQWlCLENBQUEsS0FFdEQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQTtLQUN6Qzs7O1dBRUssa0JBQUc7QUFDUCxVQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUE7QUFDdEMsVUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLEtBQUssS0FBSyxNQUFNLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQTtLQUM1RDs7O1dBRU0sbUJBQUc7QUFDUixVQUFJLENBQUMsV0FBVyxFQUFFLENBQUE7QUFDbEIsVUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtBQUM1QixVQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFBO0tBQ2xEOzs7U0FoSGtCLGFBQWE7OztxQkFBYixhQUFhIiwiZmlsZSI6Ii9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2F0b20tY2xvY2svbGliL2F0b20tY2xvY2stdmlldy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5pbXBvcnQgeyBDb21wb3NpdGVEaXNwb3NhYmxlIH0gZnJvbSAnYXRvbSdcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQXRvbUNsb2NrVmlldyB7XG5cbiAgY29uc3RydWN0b3Ioc3RhdHVzQmFyKSB7XG4gICAgdGhpcy5zdGF0dXNCYXIgPSBzdGF0dXNCYXJcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG4gIH1cblxuICBzdGFydCgpIHtcbiAgICB0aGlzLmRyYXdFbGVtZW50KClcbiAgICB0aGlzLmluaXRpYWxpemUoKVxuICB9XG5cbiAgaW5pdGlhbGl6ZSgpIHtcbiAgICB0aGlzLnNldENvbmZpZ1ZhbHVlcygpXG4gICAgdGhpcy5zZXRJY29uKHRoaXMuc2hvd0ljb24pXG4gICAgdGhpcy5zdGFydFRpY2tlcigpXG4gICAgdGhpcy5hZGp1c3RFbGVtZW50U2l6ZSgpXG5cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXdvcmtzcGFjZScsIHtcbiAgICAgICdhdG9tLWNsb2NrOnRvZ2dsZSc6ICgpID0+IHRoaXMudG9nZ2xlKClcbiAgICB9KSlcblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb25maWcub25EaWRDaGFuZ2UoJ2F0b20tY2xvY2suZGF0ZUZvcm1hdCcsICgpID0+IHtcbiAgICAgIHRoaXMucmVmcmVzaFRpY2tlcigpXG4gICAgICB0aGlzLmFkanVzdEVsZW1lbnRTaXplKClcbiAgICB9KSlcblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb25maWcub25EaWRDaGFuZ2UoJ2F0b20tY2xvY2subG9jYWxlJywgKCkgPT4ge1xuICAgICAgdGhpcy5yZWZyZXNoVGlja2VyKClcbiAgICAgIHRoaXMuYWRqdXN0RWxlbWVudFNpemUoKVxuICAgIH0pKVxuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbmZpZy5vbkRpZENoYW5nZSgnYXRvbS1jbG9jay5yZWZyZXNoSW50ZXJ2YWwnLCAoKSA9PiB7XG4gICAgICB0aGlzLnJlZnJlc2hUaWNrZXIoKVxuICAgIH0pKVxuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbmZpZy5vbkRpZENoYW5nZSgnYXRvbS1jbG9jay5zaG93Q2xvY2tJY29uJywgKCkgPT4ge1xuICAgICAgdGhpcy5zZXRDb25maWdWYWx1ZXMoKVxuICAgICAgdGhpcy5zZXRJY29uKHRoaXMuc2hvd0ljb24pXG4gICAgICB0aGlzLmFkanVzdEVsZW1lbnRTaXplKClcbiAgICB9KSlcblxuICB9XG5cbiAgZHJhd0VsZW1lbnQoKSB7XG4gICAgdGhpcy5lbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICB0aGlzLmVsZW1lbnQuY2xhc3NOYW1lID0gJ2F0b20tY2xvY2snXG4gICAgdGhpcy5lbGVtZW50LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKSlcblxuICAgIHRoaXMuc3RhdHVzQmFyLmFkZFJpZ2h0VGlsZSh7XG4gICAgICBpdGVtOiB0aGlzLmVsZW1lbnQsXG4gICAgICBwcmlvcml0eTogLTFcbiAgICB9KVxuICB9XG5cbiAgc2V0Q29uZmlnVmFsdWVzKCkge1xuICAgIHRoaXMuZGF0ZUZvcm1hdCA9IGF0b20uY29uZmlnLmdldCgnYXRvbS1jbG9jay5kYXRlRm9ybWF0JylcbiAgICB0aGlzLmxvY2FsZSA9IGF0b20uY29uZmlnLmdldCgnYXRvbS1jbG9jay5sb2NhbGUnKVxuICAgIHRoaXMucmVmcmVzaEludGVydmFsID0gYXRvbS5jb25maWcuZ2V0KCdhdG9tLWNsb2NrLnJlZnJlc2hJbnRlcnZhbCcpICogMTAwMFxuICAgIHRoaXMuc2hvd0ljb24gPSBhdG9tLmNvbmZpZy5nZXQoJ2F0b20tY2xvY2suc2hvd0Nsb2NrSWNvbicpXG4gIH1cblxuICBzdGFydFRpY2tlcigpIHtcbiAgICB0aGlzLnNldERhdGUoKVxuICAgIHZhciBuZXh0VGljayA9IHRoaXMucmVmcmVzaEludGVydmFsIC0gKERhdGUubm93KCkgJSB0aGlzLnJlZnJlc2hJbnRlcnZhbClcbiAgICB0aGlzLnRpY2sgPSBzZXRUaW1lb3V0ICgoKSA9PiAgeyB0aGlzLnN0YXJ0VGlja2VyKCkgfSwgbmV4dFRpY2spXG4gIH1cblxuICBjbGVhclRpY2tlcigpIHtcbiAgICBpZiAodGhpcy50aWNrKVxuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMudGljaylcbiAgfVxuXG4gIHJlZnJlc2hUaWNrZXIoKSB7XG4gICAgdGhpcy5zZXRDb25maWdWYWx1ZXMoKVxuICAgIHRoaXMuY2xlYXJUaWNrZXIoKVxuICAgIHRoaXMuc3RhcnRUaWNrZXIoKVxuICB9XG5cbiAgc2V0RGF0ZSgpIHtcbiAgICB0aGlzLmRhdGUgPSB0aGlzLmdldERhdGUodGhpcy5sb2NhbGUsIHRoaXMuZGF0ZUZvcm1hdClcbiAgICB0aGlzLmVsZW1lbnQuZmlyc3RDaGlsZC50ZXh0Q29udGVudCA9IHRoaXMuZGF0ZVxuICB9XG5cbiAgZ2V0RGF0ZShsb2NhbGUsIGZvcm1hdCkge1xuICAgIGlmICghdGhpcy5Nb21lbnQpXG4gICAgICB0aGlzLk1vbWVudCA9IHJlcXVpcmUoJ21vbWVudCcpXG5cbiAgICByZXR1cm4gdGhpcy5Nb21lbnQoKS5sb2NhbGUobG9jYWxlKS5mb3JtYXQoZm9ybWF0KVxuICB9XG5cbiAgYWRqdXN0RWxlbWVudFNpemUoKSB7XG4gICAgdmFyIGNvbnRlbnRXaWR0aCA9IHRoaXMuZWxlbWVudC5maXJzdENoaWxkLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLndpZHRoICsgNVxuICAgIHRoaXMuZWxlbWVudC5zdHlsZS53aWR0aCA9IGNvbnRlbnRXaWR0aCArIDUgKyAncHgnXG4gIH1cblxuICBzZXRJY29uKHRvU2V0KSB7XG4gICAgaWYgKHRvU2V0KVxuICAgICAgdGhpcy5lbGVtZW50LmZpcnN0Q2hpbGQuY2xhc3NOYW1lICs9ICdpY29uIGljb24tY2xvY2snXG4gICAgZWxzZVxuICAgICAgdGhpcy5lbGVtZW50LmZpcnN0Q2hpbGQuY2xhc3NOYW1lID0gJydcbiAgfVxuXG4gIHRvZ2dsZSgpIHtcbiAgICB2YXIgc3R5bGUgPSB0aGlzLmVsZW1lbnQuc3R5bGUuZGlzcGxheVxuICAgIHRoaXMuZWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gc3R5bGUgPT09ICdub25lJyA/ICcnIDogJ25vbmUnXG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIHRoaXMuY2xlYXJUaWNrZXIoKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiAgICB0aGlzLmVsZW1lbnQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0aGlzLmVsZW1lbnQpXG4gIH1cblxufVxuIl19