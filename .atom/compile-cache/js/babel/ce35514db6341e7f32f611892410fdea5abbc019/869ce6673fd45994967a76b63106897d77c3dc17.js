Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _escapeHtml = require('escape-html');

var _escapeHtml2 = _interopRequireDefault(_escapeHtml);

var MESSAGE_IDLE = 'Idle';

var SignalElement = (function (_HTMLElement) {
  _inherits(SignalElement, _HTMLElement);

  function SignalElement() {
    _classCallCheck(this, SignalElement);

    _get(Object.getPrototypeOf(SignalElement.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(SignalElement, [{
    key: 'createdCallback',

    // $FlowIgnore: Flow has invalid typing of createdCallback
    value: function createdCallback() {
      this.update([], []);
      this.classList.add('inline-block');
      this.classList.add('loading-spinner-tiny');
    }
  }, {
    key: 'update',
    value: function update(titles, history) {
      this.setBusy(!!titles.length);
      var tooltipMessage = [];
      if (history.length) {
        tooltipMessage.push('<strong>History:</strong>', history.map(function (item) {
          return (0, _escapeHtml2['default'])(item.title) + ' ( duration: ' + item.duration + ' )';
        }).join('<br>'));
      }
      if (titles.length) {
        tooltipMessage.push('<strong>Current:</strong>', titles.map(_escapeHtml2['default']).join('<br>'));
      }
      if (tooltipMessage.length) {
        this.setTooltip(tooltipMessage.join('<br>'));
      } else {
        this.setTooltip(MESSAGE_IDLE);
      }
    }
  }, {
    key: 'setBusy',
    value: function setBusy(busy) {
      var _this = this;

      if (busy) {
        this.classList.add('busy');
        this.classList.remove('idle');
        this.activatedLast = Date.now();
        clearTimeout(this.deactivateTimer);
      } else {
        // The logic below makes sure that busy signal is shown for at least 1 second
        var timeNow = Date.now();
        var timeThen = this.activatedLast || 0;
        var timeDifference = timeNow - timeThen;
        if (timeDifference < 1000) {
          this.deactivateTimer = setTimeout(function () {
            return _this.setBusy(false);
          }, timeDifference + 100);
        } else {
          this.classList.add('idle');
          this.classList.remove('busy');
        }
      }
    }
  }, {
    key: 'setTooltip',
    value: function setTooltip(title) {
      if (this.tooltip) {
        this.tooltip.dispose();
      }
      this.tooltip = atom.tooltips.add(this, {
        title: '<div style="text-align: left;">' + title + '</div>'
      });
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this.tooltip.dispose();
    }
  }]);

  return SignalElement;
})(HTMLElement);

exports.SignalElement = SignalElement;

var element = document.registerElement('busy-signal', {
  prototype: SignalElement.prototype
});

exports['default'] = element;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2J1c3ktc2lnbmFsL2xpYi9lbGVtZW50LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OzBCQUVtQixhQUFhOzs7O0FBR2hDLElBQU0sWUFBWSxHQUFHLE1BQU0sQ0FBQTs7SUFFZCxhQUFhO1lBQWIsYUFBYTs7V0FBYixhQUFhOzBCQUFiLGFBQWE7OytCQUFiLGFBQWE7OztlQUFiLGFBQWE7Ozs7V0FNVCwyQkFBRztBQUNoQixVQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQTtBQUNuQixVQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsQ0FBQTtBQUNsQyxVQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFBO0tBQzNDOzs7V0FDSyxnQkFBQyxNQUFxQixFQUFFLE9BQW1ELEVBQUU7QUFDakYsVUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFBO0FBQzdCLFVBQU0sY0FBYyxHQUFHLEVBQUUsQ0FBQTtBQUN6QixVQUFJLE9BQU8sQ0FBQyxNQUFNLEVBQUU7QUFDbEIsc0JBQWMsQ0FBQyxJQUFJLENBQUMsMkJBQTJCLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFTLElBQUksRUFBRTtBQUMxRSxpQkFBVSw2QkFBTyxJQUFJLENBQUMsS0FBSyxDQUFDLHFCQUFnQixJQUFJLENBQUMsUUFBUSxRQUFJO1NBQzlELENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQTtPQUNqQjtBQUNELFVBQUksTUFBTSxDQUFDLE1BQU0sRUFBRTtBQUNqQixzQkFBYyxDQUFDLElBQUksQ0FBQywyQkFBMkIsRUFBRSxNQUFNLENBQUMsR0FBRyx5QkFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFBO09BQ2xGO0FBQ0QsVUFBSSxjQUFjLENBQUMsTUFBTSxFQUFFO0FBQ3pCLFlBQUksQ0FBQyxVQUFVLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFBO09BQzdDLE1BQU07QUFDTCxZQUFJLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxDQUFBO09BQzlCO0tBQ0Y7OztXQUNNLGlCQUFDLElBQWEsRUFBRTs7O0FBQ3JCLFVBQUksSUFBSSxFQUFFO0FBQ1IsWUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUE7QUFDMUIsWUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUE7QUFDN0IsWUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUE7QUFDL0Isb0JBQVksQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUE7T0FDbkMsTUFBTTs7QUFFTCxZQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUE7QUFDMUIsWUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLGFBQWEsSUFBSSxDQUFDLENBQUE7QUFDeEMsWUFBTSxjQUFjLEdBQUcsT0FBTyxHQUFHLFFBQVEsQ0FBQTtBQUN6QyxZQUFJLGNBQWMsR0FBRyxJQUFJLEVBQUU7QUFDekIsY0FBSSxDQUFDLGVBQWUsR0FBRyxVQUFVLENBQUM7bUJBQU0sTUFBSyxPQUFPLENBQUMsS0FBSyxDQUFDO1dBQUEsRUFBRSxjQUFjLEdBQUcsR0FBRyxDQUFDLENBQUE7U0FDbkYsTUFBTTtBQUNMLGNBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFBO0FBQzFCLGNBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFBO1NBQzlCO09BQ0Y7S0FDRjs7O1dBQ1Msb0JBQUMsS0FBYSxFQUFFO0FBQ3hCLFVBQUksSUFBSSxDQUFDLE9BQU8sRUFBRTtBQUNoQixZQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFBO09BQ3ZCO0FBQ0QsVUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUU7QUFDckMsYUFBSyxzQ0FBb0MsS0FBSyxXQUFRO09BQ3ZELENBQUMsQ0FBQTtLQUNIOzs7V0FDTSxtQkFBRztBQUNSLFVBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUE7S0FDdkI7OztTQXpEVSxhQUFhO0dBQVMsV0FBVzs7OztBQTREOUMsSUFBTSxPQUFPLEdBQUcsUUFBUSxDQUFDLGVBQWUsQ0FBQyxhQUFhLEVBQUU7QUFDdEQsV0FBUyxFQUFFLGFBQWEsQ0FBQyxTQUFTO0NBQ25DLENBQUMsQ0FBQTs7cUJBRWEsT0FBTyIsImZpbGUiOiIvVXNlcnMvdGxhbmRhdS9kb3RmaWxlcy8uYXRvbS9wYWNrYWdlcy9idXN5LXNpZ25hbC9saWIvZWxlbWVudC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIEBmbG93ICovXG5cbmltcG9ydCBlc2NhcGUgZnJvbSAnZXNjYXBlLWh0bWwnXG5pbXBvcnQgdHlwZSB7IERpc3Bvc2FibGUgfSBmcm9tICdhdG9tJ1xuXG5jb25zdCBNRVNTQUdFX0lETEUgPSAnSWRsZSdcblxuZXhwb3J0IGNsYXNzIFNpZ25hbEVsZW1lbnQgZXh0ZW5kcyBIVE1MRWxlbWVudCB7XG4gIHRvb2x0aXA6IERpc3Bvc2FibGU7XG4gIGFjdGl2YXRlZExhc3Q6ID9udW1iZXI7XG4gIGRlYWN0aXZhdGVUaW1lcjogP251bWJlcjtcblxuICAvLyAkRmxvd0lnbm9yZTogRmxvdyBoYXMgaW52YWxpZCB0eXBpbmcgb2YgY3JlYXRlZENhbGxiYWNrXG4gIGNyZWF0ZWRDYWxsYmFjaygpIHtcbiAgICB0aGlzLnVwZGF0ZShbXSwgW10pXG4gICAgdGhpcy5jbGFzc0xpc3QuYWRkKCdpbmxpbmUtYmxvY2snKVxuICAgIHRoaXMuY2xhc3NMaXN0LmFkZCgnbG9hZGluZy1zcGlubmVyLXRpbnknKVxuICB9XG4gIHVwZGF0ZSh0aXRsZXM6IEFycmF5PHN0cmluZz4sIGhpc3Rvcnk6IEFycmF5PHsgdGl0bGU6IHN0cmluZywgZHVyYXRpb246IHN0cmluZyB9Pikge1xuICAgIHRoaXMuc2V0QnVzeSghIXRpdGxlcy5sZW5ndGgpXG4gICAgY29uc3QgdG9vbHRpcE1lc3NhZ2UgPSBbXVxuICAgIGlmIChoaXN0b3J5Lmxlbmd0aCkge1xuICAgICAgdG9vbHRpcE1lc3NhZ2UucHVzaCgnPHN0cm9uZz5IaXN0b3J5Ojwvc3Ryb25nPicsIGhpc3RvcnkubWFwKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgcmV0dXJuIGAke2VzY2FwZShpdGVtLnRpdGxlKX0gKCBkdXJhdGlvbjogJHtpdGVtLmR1cmF0aW9ufSApYFxuICAgICAgfSkuam9pbignPGJyPicpKVxuICAgIH1cbiAgICBpZiAodGl0bGVzLmxlbmd0aCkge1xuICAgICAgdG9vbHRpcE1lc3NhZ2UucHVzaCgnPHN0cm9uZz5DdXJyZW50Ojwvc3Ryb25nPicsIHRpdGxlcy5tYXAoZXNjYXBlKS5qb2luKCc8YnI+JykpXG4gICAgfVxuICAgIGlmICh0b29sdGlwTWVzc2FnZS5sZW5ndGgpIHtcbiAgICAgIHRoaXMuc2V0VG9vbHRpcCh0b29sdGlwTWVzc2FnZS5qb2luKCc8YnI+JykpXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuc2V0VG9vbHRpcChNRVNTQUdFX0lETEUpXG4gICAgfVxuICB9XG4gIHNldEJ1c3koYnVzeTogYm9vbGVhbikge1xuICAgIGlmIChidXN5KSB7XG4gICAgICB0aGlzLmNsYXNzTGlzdC5hZGQoJ2J1c3knKVxuICAgICAgdGhpcy5jbGFzc0xpc3QucmVtb3ZlKCdpZGxlJylcbiAgICAgIHRoaXMuYWN0aXZhdGVkTGFzdCA9IERhdGUubm93KClcbiAgICAgIGNsZWFyVGltZW91dCh0aGlzLmRlYWN0aXZhdGVUaW1lcilcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gVGhlIGxvZ2ljIGJlbG93IG1ha2VzIHN1cmUgdGhhdCBidXN5IHNpZ25hbCBpcyBzaG93biBmb3IgYXQgbGVhc3QgMSBzZWNvbmRcbiAgICAgIGNvbnN0IHRpbWVOb3cgPSBEYXRlLm5vdygpXG4gICAgICBjb25zdCB0aW1lVGhlbiA9IHRoaXMuYWN0aXZhdGVkTGFzdCB8fCAwXG4gICAgICBjb25zdCB0aW1lRGlmZmVyZW5jZSA9IHRpbWVOb3cgLSB0aW1lVGhlblxuICAgICAgaWYgKHRpbWVEaWZmZXJlbmNlIDwgMTAwMCkge1xuICAgICAgICB0aGlzLmRlYWN0aXZhdGVUaW1lciA9IHNldFRpbWVvdXQoKCkgPT4gdGhpcy5zZXRCdXN5KGZhbHNlKSwgdGltZURpZmZlcmVuY2UgKyAxMDApXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmNsYXNzTGlzdC5hZGQoJ2lkbGUnKVxuICAgICAgICB0aGlzLmNsYXNzTGlzdC5yZW1vdmUoJ2J1c3knKVxuICAgICAgfVxuICAgIH1cbiAgfVxuICBzZXRUb29sdGlwKHRpdGxlOiBzdHJpbmcpIHtcbiAgICBpZiAodGhpcy50b29sdGlwKSB7XG4gICAgICB0aGlzLnRvb2x0aXAuZGlzcG9zZSgpXG4gICAgfVxuICAgIHRoaXMudG9vbHRpcCA9IGF0b20udG9vbHRpcHMuYWRkKHRoaXMsIHtcbiAgICAgIHRpdGxlOiBgPGRpdiBzdHlsZT1cInRleHQtYWxpZ246IGxlZnQ7XCI+JHt0aXRsZX08L2Rpdj5gLFxuICAgIH0pXG4gIH1cbiAgZGlzcG9zZSgpIHtcbiAgICB0aGlzLnRvb2x0aXAuZGlzcG9zZSgpXG4gIH1cbn1cblxuY29uc3QgZWxlbWVudCA9IGRvY3VtZW50LnJlZ2lzdGVyRWxlbWVudCgnYnVzeS1zaWduYWwnLCB7XG4gIHByb3RvdHlwZTogU2lnbmFsRWxlbWVudC5wcm90b3R5cGUsXG59KVxuXG5leHBvcnQgZGVmYXVsdCBlbGVtZW50XG4iXX0=