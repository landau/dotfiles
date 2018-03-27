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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1Ly5hdG9tL3BhY2thZ2VzL2J1c3ktc2lnbmFsL2xpYi9lbGVtZW50LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OzBCQUVtQixhQUFhOzs7O0FBR2hDLElBQU0sWUFBWSxHQUFHLE1BQU0sQ0FBQTs7SUFFZCxhQUFhO1lBQWIsYUFBYTs7V0FBYixhQUFhOzBCQUFiLGFBQWE7OytCQUFiLGFBQWE7OztlQUFiLGFBQWE7O1dBS1QsMkJBQUc7QUFDaEIsVUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUE7QUFDbkIsVUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLENBQUE7S0FDbkM7OztXQUNLLGdCQUFDLE1BQXFCLEVBQUUsT0FBbUQsRUFBRTtBQUNqRixVQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUE7QUFDN0IsVUFBTSxjQUFjLEdBQUcsRUFBRSxDQUFBO0FBQ3pCLFVBQUksT0FBTyxDQUFDLE1BQU0sRUFBRTtBQUNsQixzQkFBYyxDQUFDLElBQUksQ0FBQywyQkFBMkIsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVMsSUFBSSxFQUFFO0FBQzFFLGlCQUFVLDZCQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBSyxJQUFJLENBQUMsUUFBUSxPQUFHO1NBQ2xELENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQTtPQUNqQjtBQUNELFVBQUksTUFBTSxDQUFDLE1BQU0sRUFBRTtBQUNqQixzQkFBYyxDQUFDLElBQUksQ0FBQywyQkFBMkIsRUFBRSxNQUFNLENBQUMsR0FBRyx5QkFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFBO09BQ2xGO0FBQ0QsVUFBSSxjQUFjLENBQUMsTUFBTSxFQUFFO0FBQ3pCLFlBQUksQ0FBQyxVQUFVLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFBO09BQzdDLE1BQU07QUFDTCxZQUFJLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxDQUFBO09BQzlCO0tBQ0Y7OztXQUNNLGlCQUFDLElBQWEsRUFBRTs7O0FBQ3JCLFVBQUksSUFBSSxFQUFFO0FBQ1IsWUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUE7QUFDMUIsWUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUE7QUFDN0IsWUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUE7QUFDL0Isb0JBQVksQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUE7T0FDbkMsTUFBTTs7QUFFTCxZQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUE7QUFDMUIsWUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLGFBQWEsSUFBSSxDQUFDLENBQUE7QUFDeEMsWUFBTSxjQUFjLEdBQUcsT0FBTyxHQUFHLFFBQVEsQ0FBQTtBQUN6QyxZQUFJLGNBQWMsR0FBRyxJQUFJLEVBQUU7QUFDekIsY0FBSSxDQUFDLGVBQWUsR0FBRyxVQUFVLENBQUM7bUJBQU0sTUFBSyxPQUFPLENBQUMsS0FBSyxDQUFDO1dBQUEsRUFBRSxjQUFjLEdBQUcsR0FBRyxDQUFDLENBQUE7U0FDbkYsTUFBTTtBQUNMLGNBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFBO0FBQzFCLGNBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFBO1NBQzlCO09BQ0Y7S0FDRjs7O1dBQ1Msb0JBQUMsS0FBYSxFQUFFO0FBQ3hCLFVBQUksSUFBSSxDQUFDLE9BQU8sRUFBRTtBQUNoQixZQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFBO09BQ3ZCO0FBQ0QsVUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUU7QUFDckMsYUFBSyxzQ0FBb0MsS0FBSyxXQUFRO09BQ3ZELENBQUMsQ0FBQTtLQUNIOzs7V0FDTSxtQkFBRztBQUNSLFVBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUE7S0FDdkI7OztTQXZEVSxhQUFhO0dBQVMsV0FBVzs7OztBQTBEOUMsSUFBTSxPQUFPLEdBQUcsUUFBUSxDQUFDLGVBQWUsQ0FBQyxhQUFhLEVBQUU7QUFDdEQsV0FBUyxFQUFFLGFBQWEsQ0FBQyxTQUFTO0NBQ25DLENBQUMsQ0FBQTs7cUJBRWEsT0FBTyIsImZpbGUiOiIvVXNlcnMvdGxhbmRhdS8uYXRvbS9wYWNrYWdlcy9idXN5LXNpZ25hbC9saWIvZWxlbWVudC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIEBmbG93ICovXG5cbmltcG9ydCBlc2NhcGUgZnJvbSAnZXNjYXBlLWh0bWwnXG5pbXBvcnQgdHlwZSB7IERpc3Bvc2FibGUgfSBmcm9tICdhdG9tJ1xuXG5jb25zdCBNRVNTQUdFX0lETEUgPSAnSWRsZSdcblxuZXhwb3J0IGNsYXNzIFNpZ25hbEVsZW1lbnQgZXh0ZW5kcyBIVE1MRWxlbWVudCB7XG4gIHRvb2x0aXA6IERpc3Bvc2FibGU7XG4gIGFjdGl2YXRlZExhc3Q6ID9udW1iZXI7XG4gIGRlYWN0aXZhdGVUaW1lcjogP251bWJlcjtcblxuICBjcmVhdGVkQ2FsbGJhY2soKSB7XG4gICAgdGhpcy51cGRhdGUoW10sIFtdKVxuICAgIHRoaXMuY2xhc3NMaXN0LmFkZCgnaW5saW5lLWJsb2NrJylcbiAgfVxuICB1cGRhdGUodGl0bGVzOiBBcnJheTxzdHJpbmc+LCBoaXN0b3J5OiBBcnJheTx7IHRpdGxlOiBzdHJpbmcsIGR1cmF0aW9uOiBzdHJpbmcgfT4pIHtcbiAgICB0aGlzLnNldEJ1c3koISF0aXRsZXMubGVuZ3RoKVxuICAgIGNvbnN0IHRvb2x0aXBNZXNzYWdlID0gW11cbiAgICBpZiAoaGlzdG9yeS5sZW5ndGgpIHtcbiAgICAgIHRvb2x0aXBNZXNzYWdlLnB1c2goJzxzdHJvbmc+SGlzdG9yeTo8L3N0cm9uZz4nLCBoaXN0b3J5Lm1hcChmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgIHJldHVybiBgJHtlc2NhcGUoaXRlbS50aXRsZSl9ICgke2l0ZW0uZHVyYXRpb259KWBcbiAgICAgIH0pLmpvaW4oJzxicj4nKSlcbiAgICB9XG4gICAgaWYgKHRpdGxlcy5sZW5ndGgpIHtcbiAgICAgIHRvb2x0aXBNZXNzYWdlLnB1c2goJzxzdHJvbmc+Q3VycmVudDo8L3N0cm9uZz4nLCB0aXRsZXMubWFwKGVzY2FwZSkuam9pbignPGJyPicpKVxuICAgIH1cbiAgICBpZiAodG9vbHRpcE1lc3NhZ2UubGVuZ3RoKSB7XG4gICAgICB0aGlzLnNldFRvb2x0aXAodG9vbHRpcE1lc3NhZ2Uuam9pbignPGJyPicpKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnNldFRvb2x0aXAoTUVTU0FHRV9JRExFKVxuICAgIH1cbiAgfVxuICBzZXRCdXN5KGJ1c3k6IGJvb2xlYW4pIHtcbiAgICBpZiAoYnVzeSkge1xuICAgICAgdGhpcy5jbGFzc0xpc3QuYWRkKCdidXN5JylcbiAgICAgIHRoaXMuY2xhc3NMaXN0LnJlbW92ZSgnaWRsZScpXG4gICAgICB0aGlzLmFjdGl2YXRlZExhc3QgPSBEYXRlLm5vdygpXG4gICAgICBjbGVhclRpbWVvdXQodGhpcy5kZWFjdGl2YXRlVGltZXIpXG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFRoZSBsb2dpYyBiZWxvdyBtYWtlcyBzdXJlIHRoYXQgYnVzeSBzaWduYWwgaXMgc2hvd24gZm9yIGF0IGxlYXN0IDEgc2Vjb25kXG4gICAgICBjb25zdCB0aW1lTm93ID0gRGF0ZS5ub3coKVxuICAgICAgY29uc3QgdGltZVRoZW4gPSB0aGlzLmFjdGl2YXRlZExhc3QgfHwgMFxuICAgICAgY29uc3QgdGltZURpZmZlcmVuY2UgPSB0aW1lTm93IC0gdGltZVRoZW5cbiAgICAgIGlmICh0aW1lRGlmZmVyZW5jZSA8IDEwMDApIHtcbiAgICAgICAgdGhpcy5kZWFjdGl2YXRlVGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHRoaXMuc2V0QnVzeShmYWxzZSksIHRpbWVEaWZmZXJlbmNlICsgMTAwKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5jbGFzc0xpc3QuYWRkKCdpZGxlJylcbiAgICAgICAgdGhpcy5jbGFzc0xpc3QucmVtb3ZlKCdidXN5JylcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgc2V0VG9vbHRpcCh0aXRsZTogc3RyaW5nKSB7XG4gICAgaWYgKHRoaXMudG9vbHRpcCkge1xuICAgICAgdGhpcy50b29sdGlwLmRpc3Bvc2UoKVxuICAgIH1cbiAgICB0aGlzLnRvb2x0aXAgPSBhdG9tLnRvb2x0aXBzLmFkZCh0aGlzLCB7XG4gICAgICB0aXRsZTogYDxkaXYgc3R5bGU9XCJ0ZXh0LWFsaWduOiBsZWZ0O1wiPiR7dGl0bGV9PC9kaXY+YCxcbiAgICB9KVxuICB9XG4gIGRpc3Bvc2UoKSB7XG4gICAgdGhpcy50b29sdGlwLmRpc3Bvc2UoKVxuICB9XG59XG5cbmNvbnN0IGVsZW1lbnQgPSBkb2N1bWVudC5yZWdpc3RlckVsZW1lbnQoJ2J1c3ktc2lnbmFsJywge1xuICBwcm90b3R5cGU6IFNpZ25hbEVsZW1lbnQucHJvdG90eXBlLFxufSlcblxuZXhwb3J0IGRlZmF1bHQgZWxlbWVudFxuIl19