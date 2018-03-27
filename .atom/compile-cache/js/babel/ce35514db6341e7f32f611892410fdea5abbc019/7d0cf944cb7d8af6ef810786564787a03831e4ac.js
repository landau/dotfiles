Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

// import Moment from 'moment'

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
      if (!this.Moment) {
        this.Moment = require('moment');
      }

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2F0b20tY2xvY2svbGliL2F0b20tY2xvY2stdmlldy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7OztvQkFFb0MsTUFBTTs7OztBQUYxQyxXQUFXLENBQUM7O0lBS1MsYUFBYTtBQUVyQixXQUZRLGFBQWEsQ0FFcEIsU0FBUyxFQUFFOzBCQUZKLGFBQWE7O0FBRzlCLFFBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFBO0FBQzFCLFFBQUksQ0FBQyxhQUFhLEdBQUcsK0JBQXlCLENBQUE7R0FDL0M7O2VBTGtCLGFBQWE7O1dBTzNCLGlCQUFHO0FBQ04sVUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFBO0FBQ2xCLFVBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQTtLQUNsQjs7O1dBRVMsc0JBQUc7OztBQUNYLFVBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQTtBQUN0QixVQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQTtBQUMzQixVQUFJLENBQUMsV0FBVyxFQUFFLENBQUE7O0FBRWxCLFVBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLGdCQUFnQixFQUFFO0FBQ3pELDJCQUFtQixFQUFFO2lCQUFNLE1BQUssTUFBTSxFQUFFO1NBQUE7T0FDekMsQ0FBQyxDQUFDLENBQUE7O0FBRUgsVUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsdUJBQXVCLEVBQUUsWUFBTTtBQUM1RSxjQUFLLGFBQWEsRUFBRSxDQUFBO09BQ3JCLENBQUMsQ0FBQyxDQUFBOztBQUVILFVBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLG1CQUFtQixFQUFFLFlBQU07QUFDeEUsY0FBSyxhQUFhLEVBQUUsQ0FBQTtP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QyxNQUFNLENBQUMsQ0FBQTtLQUNuRDs7O1dBRU0saUJBQUMsS0FBSyxFQUFFO0FBQ2IsVUFBSSxLQUFLLEVBQ1AsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsU0FBUyxJQUFJLGlCQUFpQixDQUFBLEtBRXRELElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUE7S0FDekM7OztXQUVLLGtCQUFHO0FBQ1AsV0FBSyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQTtBQUNsQyxVQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsS0FBSyxLQUFLLE1BQU0sR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFBO0tBQzVEOzs7V0FFTSxtQkFBRztBQUNSLFVBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQTtBQUNsQixVQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxDQUFBO0FBQzVCLFVBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUE7S0FDbEQ7OztTQXhHa0IsYUFBYTs7O3FCQUFiLGFBQWEiLCJmaWxlIjoiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvYXRvbS1jbG9jay9saWIvYXRvbS1jbG9jay12aWV3LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbmltcG9ydCB7IENvbXBvc2l0ZURpc3Bvc2FibGUgfSBmcm9tICdhdG9tJ1xuLy8gaW1wb3J0IE1vbWVudCBmcm9tICdtb21lbnQnXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEF0b21DbG9ja1ZpZXcge1xuXG4gIGNvbnN0cnVjdG9yKHN0YXR1c0Jhcikge1xuICAgIHRoaXMuc3RhdHVzQmFyID0gc3RhdHVzQmFyXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuICB9XG5cbiAgc3RhcnQoKSB7XG4gICAgdGhpcy5kcmF3RWxlbWVudCgpXG4gICAgdGhpcy5pbml0aWFsaXplKClcbiAgfVxuXG4gIGluaXRpYWxpemUoKSB7XG4gICAgdGhpcy5zZXRDb25maWdWYWx1ZXMoKVxuICAgIHRoaXMuc2V0SWNvbih0aGlzLnNob3dJY29uKVxuICAgIHRoaXMuc3RhcnRUaWNrZXIoKVxuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbW1hbmRzLmFkZCgnYXRvbS13b3Jrc3BhY2UnLCB7XG4gICAgICAnYXRvbS1jbG9jazp0b2dnbGUnOiAoKSA9PiB0aGlzLnRvZ2dsZSgpXG4gICAgfSkpXG5cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlKCdhdG9tLWNsb2NrLmRhdGVGb3JtYXQnLCAoKSA9PiB7XG4gICAgICB0aGlzLnJlZnJlc2hUaWNrZXIoKVxuICAgIH0pKVxuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbmZpZy5vbkRpZENoYW5nZSgnYXRvbS1jbG9jay5sb2NhbGUnLCAoKSA9PiB7XG4gICAgICB0aGlzLnJlZnJlc2hUaWNrZXIoKVxuICAgIH0pKVxuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbmZpZy5vbkRpZENoYW5nZSgnYXRvbS1jbG9jay5yZWZyZXNoSW50ZXJ2YWwnLCAoKSA9PiB7XG4gICAgICB0aGlzLnJlZnJlc2hUaWNrZXIoKVxuICAgIH0pKVxuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbmZpZy5vbkRpZENoYW5nZSgnYXRvbS1jbG9jay5zaG93Q2xvY2tJY29uJywgKCkgPT4ge1xuICAgICAgdGhpcy5zZXRDb25maWdWYWx1ZXMoKVxuICAgICAgdGhpcy5zZXRJY29uKHRoaXMuc2hvd0ljb24pXG4gICAgfSkpXG4gIH1cblxuICBkcmF3RWxlbWVudCgpIHtcbiAgICB0aGlzLmVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgIHRoaXMuZWxlbWVudC5pZCA9ICdhdG9tLWNsb2NrJ1xuICAgIHRoaXMuZWxlbWVudC5jbGFzc05hbWUgPSAnaW5saW5lLWJsb2NrJ1xuICAgIHRoaXMuZWxlbWVudC5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJykpXG5cbiAgICB0aGlzLnN0YXR1c0Jhci5hZGRSaWdodFRpbGUoe1xuICAgICAgaXRlbTogdGhpcy5lbGVtZW50LFxuICAgICAgcHJpb3JpdHk6IC0xXG4gICAgfSlcbiAgfVxuXG4gIHNldENvbmZpZ1ZhbHVlcygpIHtcbiAgICB0aGlzLmRhdGVGb3JtYXQgPSBhdG9tLmNvbmZpZy5nZXQoJ2F0b20tY2xvY2suZGF0ZUZvcm1hdCcpXG4gICAgdGhpcy5sb2NhbGUgPSBhdG9tLmNvbmZpZy5nZXQoJ2F0b20tY2xvY2subG9jYWxlJylcbiAgICB0aGlzLnJlZnJlc2hJbnRlcnZhbCA9IGF0b20uY29uZmlnLmdldCgnYXRvbS1jbG9jay5yZWZyZXNoSW50ZXJ2YWwnKSAqIDEwMDBcbiAgICB0aGlzLnNob3dJY29uID0gYXRvbS5jb25maWcuZ2V0KCdhdG9tLWNsb2NrLnNob3dDbG9ja0ljb24nKVxuICB9XG5cbiAgc3RhcnRUaWNrZXIoKSB7XG4gICAgdGhpcy5zZXREYXRlKClcbiAgICB2YXIgbmV4dFRpY2sgPSB0aGlzLnJlZnJlc2hJbnRlcnZhbCAtIChEYXRlLm5vdygpICUgdGhpcy5yZWZyZXNoSW50ZXJ2YWwpXG4gICAgdGhpcy50aWNrID0gc2V0VGltZW91dCAoKCkgPT4gIHsgdGhpcy5zdGFydFRpY2tlcigpIH0sIG5leHRUaWNrKVxuICB9XG5cbiAgY2xlYXJUaWNrZXIoKSB7XG4gICAgaWYgKHRoaXMudGljaylcbiAgICAgIGNsZWFyVGltZW91dCh0aGlzLnRpY2spXG4gIH1cblxuICByZWZyZXNoVGlja2VyKCkge1xuICAgIHRoaXMuc2V0Q29uZmlnVmFsdWVzKClcbiAgICB0aGlzLmNsZWFyVGlja2VyKClcbiAgICB0aGlzLnN0YXJ0VGlja2VyKClcbiAgfVxuXG4gIHNldERhdGUoKSB7XG4gICAgdGhpcy5kYXRlID0gdGhpcy5nZXREYXRlKHRoaXMubG9jYWxlLCB0aGlzLmRhdGVGb3JtYXQpXG4gICAgdGhpcy5lbGVtZW50LmZpcnN0Q2hpbGQudGV4dENvbnRlbnQgPSB0aGlzLmRhdGVcbiAgfVxuXG4gIGdldERhdGUobG9jYWxlLCBmb3JtYXQpIHtcbiAgICBpZiAoIXRoaXMuTW9tZW50KSB7XG4gICAgICB0aGlzLk1vbWVudCA9IHJlcXVpcmUoJ21vbWVudCcpXG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuTW9tZW50KCkubG9jYWxlKGxvY2FsZSkuZm9ybWF0KGZvcm1hdClcbiAgfVxuXG4gIHNldEljb24odG9TZXQpIHtcbiAgICBpZiAodG9TZXQpXG4gICAgICB0aGlzLmVsZW1lbnQuZmlyc3RDaGlsZC5jbGFzc05hbWUgKz0gJ2ljb24gaWNvbi1jbG9jaydcbiAgICBlbHNlXG4gICAgICB0aGlzLmVsZW1lbnQuZmlyc3RDaGlsZC5jbGFzc05hbWUgPSAnJ1xuICB9XG5cbiAgdG9nZ2xlKCkge1xuICAgIHN0eWxlID0gdGhpcy5lbGVtZW50LnN0eWxlLmRpc3BsYXlcbiAgICB0aGlzLmVsZW1lbnQuc3R5bGUuZGlzcGxheSA9IHN0eWxlID09PSAnbm9uZScgPyAnJyA6ICdub25lJ1xuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLmNsZWFyVGlja2VyKClcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG4gICAgdGhpcy5lbGVtZW50LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodGhpcy5lbGVtZW50KVxuICB9XG5cbn1cbiJdfQ==