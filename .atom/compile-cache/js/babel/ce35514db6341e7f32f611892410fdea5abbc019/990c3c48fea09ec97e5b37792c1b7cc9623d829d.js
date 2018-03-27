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
          return (0, _escapeHtml2['default'])(item.title) + ' (' + item.duration + ')';
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2J1c3ktc2lnbmFsL2xpYi9lbGVtZW50LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OzBCQUVtQixhQUFhOzs7O0FBR2hDLElBQU0sWUFBWSxHQUFHLE1BQU0sQ0FBQTs7SUFFZCxhQUFhO1lBQWIsYUFBYTs7V0FBYixhQUFhOzBCQUFiLGFBQWE7OytCQUFiLGFBQWE7OztlQUFiLGFBQWE7O1dBS1QsMkJBQUc7QUFDaEIsVUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUE7QUFDbkIsVUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLENBQUE7QUFDbEMsVUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsc0JBQXNCLENBQUMsQ0FBQTtLQUMzQzs7O1dBQ0ssZ0JBQUMsTUFBcUIsRUFBRSxPQUFtRCxFQUFFO0FBQ2pGLFVBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQTtBQUM3QixVQUFNLGNBQWMsR0FBRyxFQUFFLENBQUE7QUFDekIsVUFBSSxPQUFPLENBQUMsTUFBTSxFQUFFO0FBQ2xCLHNCQUFjLENBQUMsSUFBSSxDQUFDLDJCQUEyQixFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBUyxJQUFJLEVBQUU7QUFDMUUsaUJBQVUsNkJBQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFLLElBQUksQ0FBQyxRQUFRLE9BQUc7U0FDbEQsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFBO09BQ2pCO0FBQ0QsVUFBSSxNQUFNLENBQUMsTUFBTSxFQUFFO0FBQ2pCLHNCQUFjLENBQUMsSUFBSSxDQUFDLDJCQUEyQixFQUFFLE1BQU0sQ0FBQyxHQUFHLHlCQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUE7T0FDbEY7QUFDRCxVQUFJLGNBQWMsQ0FBQyxNQUFNLEVBQUU7QUFDekIsWUFBSSxDQUFDLFVBQVUsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUE7T0FDN0MsTUFBTTtBQUNMLFlBQUksQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDLENBQUE7T0FDOUI7S0FDRjs7O1dBQ00saUJBQUMsSUFBYSxFQUFFOzs7QUFDckIsVUFBSSxJQUFJLEVBQUU7QUFDUixZQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQTtBQUMxQixZQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQTtBQUM3QixZQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQTtBQUMvQixvQkFBWSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQTtPQUNuQyxNQUFNOztBQUVMLFlBQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQTtBQUMxQixZQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsYUFBYSxJQUFJLENBQUMsQ0FBQTtBQUN4QyxZQUFNLGNBQWMsR0FBRyxPQUFPLEdBQUcsUUFBUSxDQUFBO0FBQ3pDLFlBQUksY0FBYyxHQUFHLElBQUksRUFBRTtBQUN6QixjQUFJLENBQUMsZUFBZSxHQUFHLFVBQVUsQ0FBQzttQkFBTSxNQUFLLE9BQU8sQ0FBQyxLQUFLLENBQUM7V0FBQSxFQUFFLGNBQWMsR0FBRyxHQUFHLENBQUMsQ0FBQTtTQUNuRixNQUFNO0FBQ0wsY0FBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUE7QUFDMUIsY0FBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUE7U0FDOUI7T0FDRjtLQUNGOzs7V0FDUyxvQkFBQyxLQUFhLEVBQUU7QUFDeEIsVUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFO0FBQ2hCLFlBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUE7T0FDdkI7QUFDRCxVQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRTtBQUNyQyxhQUFLLHNDQUFvQyxLQUFLLFdBQVE7T0FDdkQsQ0FBQyxDQUFBO0tBQ0g7OztXQUNNLG1CQUFHO0FBQ1IsVUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQTtLQUN2Qjs7O1NBeERVLGFBQWE7R0FBUyxXQUFXOzs7O0FBMkQ5QyxJQUFNLE9BQU8sR0FBRyxRQUFRLENBQUMsZUFBZSxDQUFDLGFBQWEsRUFBRTtBQUN0RCxXQUFTLEVBQUUsYUFBYSxDQUFDLFNBQVM7Q0FDbkMsQ0FBQyxDQUFBOztxQkFFYSxPQUFPIiwiZmlsZSI6Ii9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2J1c3ktc2lnbmFsL2xpYi9lbGVtZW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogQGZsb3cgKi9cblxuaW1wb3J0IGVzY2FwZSBmcm9tICdlc2NhcGUtaHRtbCdcbmltcG9ydCB0eXBlIHsgRGlzcG9zYWJsZSB9IGZyb20gJ2F0b20nXG5cbmNvbnN0IE1FU1NBR0VfSURMRSA9ICdJZGxlJ1xuXG5leHBvcnQgY2xhc3MgU2lnbmFsRWxlbWVudCBleHRlbmRzIEhUTUxFbGVtZW50IHtcbiAgdG9vbHRpcDogRGlzcG9zYWJsZTtcbiAgYWN0aXZhdGVkTGFzdDogP251bWJlcjtcbiAgZGVhY3RpdmF0ZVRpbWVyOiA/bnVtYmVyO1xuXG4gIGNyZWF0ZWRDYWxsYmFjaygpIHtcbiAgICB0aGlzLnVwZGF0ZShbXSwgW10pXG4gICAgdGhpcy5jbGFzc0xpc3QuYWRkKCdpbmxpbmUtYmxvY2snKVxuICAgIHRoaXMuY2xhc3NMaXN0LmFkZCgnbG9hZGluZy1zcGlubmVyLXRpbnknKVxuICB9XG4gIHVwZGF0ZSh0aXRsZXM6IEFycmF5PHN0cmluZz4sIGhpc3Rvcnk6IEFycmF5PHsgdGl0bGU6IHN0cmluZywgZHVyYXRpb246IHN0cmluZyB9Pikge1xuICAgIHRoaXMuc2V0QnVzeSghIXRpdGxlcy5sZW5ndGgpXG4gICAgY29uc3QgdG9vbHRpcE1lc3NhZ2UgPSBbXVxuICAgIGlmIChoaXN0b3J5Lmxlbmd0aCkge1xuICAgICAgdG9vbHRpcE1lc3NhZ2UucHVzaCgnPHN0cm9uZz5IaXN0b3J5Ojwvc3Ryb25nPicsIGhpc3RvcnkubWFwKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgcmV0dXJuIGAke2VzY2FwZShpdGVtLnRpdGxlKX0gKCR7aXRlbS5kdXJhdGlvbn0pYFxuICAgICAgfSkuam9pbignPGJyPicpKVxuICAgIH1cbiAgICBpZiAodGl0bGVzLmxlbmd0aCkge1xuICAgICAgdG9vbHRpcE1lc3NhZ2UucHVzaCgnPHN0cm9uZz5DdXJyZW50Ojwvc3Ryb25nPicsIHRpdGxlcy5tYXAoZXNjYXBlKS5qb2luKCc8YnI+JykpXG4gICAgfVxuICAgIGlmICh0b29sdGlwTWVzc2FnZS5sZW5ndGgpIHtcbiAgICAgIHRoaXMuc2V0VG9vbHRpcCh0b29sdGlwTWVzc2FnZS5qb2luKCc8YnI+JykpXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuc2V0VG9vbHRpcChNRVNTQUdFX0lETEUpXG4gICAgfVxuICB9XG4gIHNldEJ1c3koYnVzeTogYm9vbGVhbikge1xuICAgIGlmIChidXN5KSB7XG4gICAgICB0aGlzLmNsYXNzTGlzdC5hZGQoJ2J1c3knKVxuICAgICAgdGhpcy5jbGFzc0xpc3QucmVtb3ZlKCdpZGxlJylcbiAgICAgIHRoaXMuYWN0aXZhdGVkTGFzdCA9IERhdGUubm93KClcbiAgICAgIGNsZWFyVGltZW91dCh0aGlzLmRlYWN0aXZhdGVUaW1lcilcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gVGhlIGxvZ2ljIGJlbG93IG1ha2VzIHN1cmUgdGhhdCBidXN5IHNpZ25hbCBpcyBzaG93biBmb3IgYXQgbGVhc3QgMSBzZWNvbmRcbiAgICAgIGNvbnN0IHRpbWVOb3cgPSBEYXRlLm5vdygpXG4gICAgICBjb25zdCB0aW1lVGhlbiA9IHRoaXMuYWN0aXZhdGVkTGFzdCB8fCAwXG4gICAgICBjb25zdCB0aW1lRGlmZmVyZW5jZSA9IHRpbWVOb3cgLSB0aW1lVGhlblxuICAgICAgaWYgKHRpbWVEaWZmZXJlbmNlIDwgMTAwMCkge1xuICAgICAgICB0aGlzLmRlYWN0aXZhdGVUaW1lciA9IHNldFRpbWVvdXQoKCkgPT4gdGhpcy5zZXRCdXN5KGZhbHNlKSwgdGltZURpZmZlcmVuY2UgKyAxMDApXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmNsYXNzTGlzdC5hZGQoJ2lkbGUnKVxuICAgICAgICB0aGlzLmNsYXNzTGlzdC5yZW1vdmUoJ2J1c3knKVxuICAgICAgfVxuICAgIH1cbiAgfVxuICBzZXRUb29sdGlwKHRpdGxlOiBzdHJpbmcpIHtcbiAgICBpZiAodGhpcy50b29sdGlwKSB7XG4gICAgICB0aGlzLnRvb2x0aXAuZGlzcG9zZSgpXG4gICAgfVxuICAgIHRoaXMudG9vbHRpcCA9IGF0b20udG9vbHRpcHMuYWRkKHRoaXMsIHtcbiAgICAgIHRpdGxlOiBgPGRpdiBzdHlsZT1cInRleHQtYWxpZ246IGxlZnQ7XCI+JHt0aXRsZX08L2Rpdj5gLFxuICAgIH0pXG4gIH1cbiAgZGlzcG9zZSgpIHtcbiAgICB0aGlzLnRvb2x0aXAuZGlzcG9zZSgpXG4gIH1cbn1cblxuY29uc3QgZWxlbWVudCA9IGRvY3VtZW50LnJlZ2lzdGVyRWxlbWVudCgnYnVzeS1zaWduYWwnLCB7XG4gIHByb3RvdHlwZTogU2lnbmFsRWxlbWVudC5wcm90b3R5cGUsXG59KVxuXG5leHBvcnQgZGVmYXVsdCBlbGVtZW50XG4iXX0=