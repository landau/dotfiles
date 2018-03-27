Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _sbEventKit = require('sb-event-kit');

var TooltipDelegate = (function () {
  function TooltipDelegate() {
    var _this = this;

    _classCallCheck(this, TooltipDelegate);

    this.emitter = new _sbEventKit.Emitter();
    this.expanded = false;
    this.subscriptions = new _sbEventKit.CompositeDisposable();

    this.subscriptions.add(this.emitter);
    this.subscriptions.add(atom.config.observe('linter-ui-default.showProviderName', function (showProviderName) {
      var shouldUpdate = typeof _this.showProviderName !== 'undefined';
      _this.showProviderName = showProviderName;
      if (shouldUpdate) {
        _this.emitter.emit('should-update');
      }
    }));
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'linter-ui-default:expand-tooltip': function linterUiDefaultExpandTooltip(event) {
        if (_this.expanded) {
          return;
        }
        _this.expanded = true;
        _this.emitter.emit('should-expand');

        // If bound to a key, collapse when that key is released, just like old times
        if (event.originalEvent && event.originalEvent.isTrusted) {
          // $FlowIgnore: document.body is never null
          document.body.addEventListener('keyup', function eventListener() {
            // $FlowIgnore: document.body is never null
            document.body.removeEventListener('keyup', eventListener);
            atom.commands.dispatch(atom.views.getView(atom.workspace), 'linter-ui-default:collapse-tooltip');
          });
        }
      },
      'linter-ui-default:collapse-tooltip': function linterUiDefaultCollapseTooltip() {
        _this.expanded = false;
        _this.emitter.emit('should-collapse');
      }
    }));
  }

  _createClass(TooltipDelegate, [{
    key: 'onShouldUpdate',
    value: function onShouldUpdate(callback) {
      return this.emitter.on('should-update', callback);
    }
  }, {
    key: 'onShouldExpand',
    value: function onShouldExpand(callback) {
      return this.emitter.on('should-expand', callback);
    }
  }, {
    key: 'onShouldCollapse',
    value: function onShouldCollapse(callback) {
      return this.emitter.on('should-collapse', callback);
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this.emitter.dispose();
    }
  }]);

  return TooltipDelegate;
})();

exports['default'] = TooltipDelegate;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci11aS1kZWZhdWx0L2xpYi90b29sdGlwL2RlbGVnYXRlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OzBCQUU2QyxjQUFjOztJQUd0QyxlQUFlO0FBTXZCLFdBTlEsZUFBZSxHQU1wQjs7OzBCQU5LLGVBQWU7O0FBT2hDLFFBQUksQ0FBQyxPQUFPLEdBQUcseUJBQWEsQ0FBQTtBQUM1QixRQUFJLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQTtBQUNyQixRQUFJLENBQUMsYUFBYSxHQUFHLHFDQUF5QixDQUFBOztBQUU5QyxRQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUE7QUFDcEMsUUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsb0NBQW9DLEVBQUUsVUFBQyxnQkFBZ0IsRUFBSztBQUNyRyxVQUFNLFlBQVksR0FBRyxPQUFPLE1BQUssZ0JBQWdCLEtBQUssV0FBVyxDQUFBO0FBQ2pFLFlBQUssZ0JBQWdCLEdBQUcsZ0JBQWdCLENBQUE7QUFDeEMsVUFBSSxZQUFZLEVBQUU7QUFDaEIsY0FBSyxPQUFPLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFBO09BQ25DO0tBQ0YsQ0FBQyxDQUFDLENBQUE7QUFDSCxRQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRTtBQUN6RCx3Q0FBa0MsRUFBRSxzQ0FBQyxLQUFLLEVBQUs7QUFDN0MsWUFBSSxNQUFLLFFBQVEsRUFBRTtBQUNqQixpQkFBTTtTQUNQO0FBQ0QsY0FBSyxRQUFRLEdBQUcsSUFBSSxDQUFBO0FBQ3BCLGNBQUssT0FBTyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQTs7O0FBR2xDLFlBQUksS0FBSyxDQUFDLGFBQWEsSUFBSSxLQUFLLENBQUMsYUFBYSxDQUFDLFNBQVMsRUFBRTs7QUFFeEQsa0JBQVEsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLFNBQVMsYUFBYSxHQUFHOztBQUUvRCxvQkFBUSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLEVBQUUsYUFBYSxDQUFDLENBQUE7QUFDekQsZ0JBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxvQ0FBb0MsQ0FBQyxDQUFBO1dBQ2pHLENBQUMsQ0FBQTtTQUNIO09BQ0Y7QUFDRCwwQ0FBb0MsRUFBRSwwQ0FBTTtBQUMxQyxjQUFLLFFBQVEsR0FBRyxLQUFLLENBQUE7QUFDckIsY0FBSyxPQUFPLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUE7T0FDckM7S0FDRixDQUFDLENBQUMsQ0FBQTtHQUNKOztlQTFDa0IsZUFBZTs7V0EyQ3BCLHdCQUFDLFFBQXFCLEVBQWM7QUFDaEQsYUFBTyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxlQUFlLEVBQUUsUUFBUSxDQUFDLENBQUE7S0FDbEQ7OztXQUNhLHdCQUFDLFFBQXFCLEVBQWM7QUFDaEQsYUFBTyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxlQUFlLEVBQUUsUUFBUSxDQUFDLENBQUE7S0FDbEQ7OztXQUNlLDBCQUFDLFFBQXFCLEVBQWM7QUFDbEQsYUFBTyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxpQkFBaUIsRUFBRSxRQUFRLENBQUMsQ0FBQTtLQUNwRDs7O1dBQ00sbUJBQUc7QUFDUixVQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFBO0tBQ3ZCOzs7U0F0RGtCLGVBQWU7OztxQkFBZixlQUFlIiwiZmlsZSI6Ii9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci11aS1kZWZhdWx0L2xpYi90b29sdGlwL2RlbGVnYXRlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogQGZsb3cgKi9cblxuaW1wb3J0IHsgQ29tcG9zaXRlRGlzcG9zYWJsZSwgRW1pdHRlciB9IGZyb20gJ3NiLWV2ZW50LWtpdCdcbmltcG9ydCB0eXBlIHsgRGlzcG9zYWJsZSB9IGZyb20gJ3NiLWV2ZW50LWtpdCdcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVG9vbHRpcERlbGVnYXRlIHtcbiAgZW1pdHRlcjogRW1pdHRlcjtcbiAgZXhwYW5kZWQ6IGJvb2xlYW47XG4gIHN1YnNjcmlwdGlvbnM6IENvbXBvc2l0ZURpc3Bvc2FibGU7XG4gIHNob3dQcm92aWRlck5hbWU6IGJvb2xlYW47XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5lbWl0dGVyID0gbmV3IEVtaXR0ZXIoKVxuICAgIHRoaXMuZXhwYW5kZWQgPSBmYWxzZVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQodGhpcy5lbWl0dGVyKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb25maWcub2JzZXJ2ZSgnbGludGVyLXVpLWRlZmF1bHQuc2hvd1Byb3ZpZGVyTmFtZScsIChzaG93UHJvdmlkZXJOYW1lKSA9PiB7XG4gICAgICBjb25zdCBzaG91bGRVcGRhdGUgPSB0eXBlb2YgdGhpcy5zaG93UHJvdmlkZXJOYW1lICE9PSAndW5kZWZpbmVkJ1xuICAgICAgdGhpcy5zaG93UHJvdmlkZXJOYW1lID0gc2hvd1Byb3ZpZGVyTmFtZVxuICAgICAgaWYgKHNob3VsZFVwZGF0ZSkge1xuICAgICAgICB0aGlzLmVtaXR0ZXIuZW1pdCgnc2hvdWxkLXVwZGF0ZScpXG4gICAgICB9XG4gICAgfSkpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbW1hbmRzLmFkZCgnYXRvbS13b3Jrc3BhY2UnLCB7XG4gICAgICAnbGludGVyLXVpLWRlZmF1bHQ6ZXhwYW5kLXRvb2x0aXAnOiAoZXZlbnQpID0+IHtcbiAgICAgICAgaWYgKHRoaXMuZXhwYW5kZWQpIHtcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICB0aGlzLmV4cGFuZGVkID0gdHJ1ZVxuICAgICAgICB0aGlzLmVtaXR0ZXIuZW1pdCgnc2hvdWxkLWV4cGFuZCcpXG5cbiAgICAgICAgLy8gSWYgYm91bmQgdG8gYSBrZXksIGNvbGxhcHNlIHdoZW4gdGhhdCBrZXkgaXMgcmVsZWFzZWQsIGp1c3QgbGlrZSBvbGQgdGltZXNcbiAgICAgICAgaWYgKGV2ZW50Lm9yaWdpbmFsRXZlbnQgJiYgZXZlbnQub3JpZ2luYWxFdmVudC5pc1RydXN0ZWQpIHtcbiAgICAgICAgICAvLyAkRmxvd0lnbm9yZTogZG9jdW1lbnQuYm9keSBpcyBuZXZlciBudWxsXG4gICAgICAgICAgZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIGZ1bmN0aW9uIGV2ZW50TGlzdGVuZXIoKSB7XG4gICAgICAgICAgICAvLyAkRmxvd0lnbm9yZTogZG9jdW1lbnQuYm9keSBpcyBuZXZlciBudWxsXG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleXVwJywgZXZlbnRMaXN0ZW5lcilcbiAgICAgICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goYXRvbS52aWV3cy5nZXRWaWV3KGF0b20ud29ya3NwYWNlKSwgJ2xpbnRlci11aS1kZWZhdWx0OmNvbGxhcHNlLXRvb2x0aXAnKVxuICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICAnbGludGVyLXVpLWRlZmF1bHQ6Y29sbGFwc2UtdG9vbHRpcCc6ICgpID0+IHtcbiAgICAgICAgdGhpcy5leHBhbmRlZCA9IGZhbHNlXG4gICAgICAgIHRoaXMuZW1pdHRlci5lbWl0KCdzaG91bGQtY29sbGFwc2UnKVxuICAgICAgfSxcbiAgICB9KSlcbiAgfVxuICBvblNob3VsZFVwZGF0ZShjYWxsYmFjazogKCgpID0+IGFueSkpOiBEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5lbWl0dGVyLm9uKCdzaG91bGQtdXBkYXRlJywgY2FsbGJhY2spXG4gIH1cbiAgb25TaG91bGRFeHBhbmQoY2FsbGJhY2s6ICgoKSA9PiBhbnkpKTogRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuZW1pdHRlci5vbignc2hvdWxkLWV4cGFuZCcsIGNhbGxiYWNrKVxuICB9XG4gIG9uU2hvdWxkQ29sbGFwc2UoY2FsbGJhY2s6ICgoKSA9PiBhbnkpKTogRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuZW1pdHRlci5vbignc2hvdWxkLWNvbGxhcHNlJywgY2FsbGJhY2spXG4gIH1cbiAgZGlzcG9zZSgpIHtcbiAgICB0aGlzLmVtaXR0ZXIuZGlzcG9zZSgpXG4gIH1cbn1cbiJdfQ==