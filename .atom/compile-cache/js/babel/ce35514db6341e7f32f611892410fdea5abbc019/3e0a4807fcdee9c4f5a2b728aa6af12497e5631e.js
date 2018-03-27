Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _sbEventKit = require('sb-event-kit');

var _delegate = require('./delegate');

var _delegate2 = _interopRequireDefault(_delegate);

var _message = require('./message');

var _message2 = _interopRequireDefault(_message);

var _messageLegacy = require('./message-legacy');

var _messageLegacy2 = _interopRequireDefault(_messageLegacy);

var _helpers = require('../helpers');

var TooltipElement = (function () {
  function TooltipElement(messages, position, textEditor) {
    var _this = this;

    _classCallCheck(this, TooltipElement);

    this.emitter = new _sbEventKit.Emitter();
    this.element = document.createElement('div');
    this.messages = messages;
    this.subscriptions = new _sbEventKit.CompositeDisposable();

    this.subscriptions.add(this.emitter);
    this.marker = textEditor.markBufferRange([position, position]);
    this.marker.onDidDestroy(function () {
      return _this.emitter.emit('did-destroy');
    });

    var delegate = new _delegate2['default']();
    this.element.id = 'linter-tooltip';
    textEditor.decorateMarker(this.marker, {
      type: 'overlay',
      item: this.element
    });
    this.subscriptions.add(delegate);

    var children = [];
    messages.forEach(function (message) {
      if (message.version === 2) {
        children.push(_react2['default'].createElement(_message2['default'], { key: message.key, delegate: delegate, message: message }));
        return;
      }
      children.push(_react2['default'].createElement(_messageLegacy2['default'], { key: message.key, delegate: delegate, message: message }));
      if (message.trace && message.trace.length) {
        children.push.apply(children, _toConsumableArray(message.trace.map(function (trace, index) {
          return _react2['default'].createElement(_messageLegacy2['default'], { key: trace.key + ':trace:' + index, delegate: delegate, message: trace });
        })));
      }
    });
    _reactDom2['default'].render(_react2['default'].createElement(
      'linter-messages',
      null,
      children
    ), this.element);
  }

  _createClass(TooltipElement, [{
    key: 'isValid',
    value: function isValid(position, messages) {
      var range = (0, _helpers.$range)(this.messages[0]);
      return !!(this.messages.length === 1 && messages.has(this.messages[0]) && range && range.containsPoint(position));
    }
  }, {
    key: 'onDidDestroy',
    value: function onDidDestroy(callback) {
      this.emitter.on('did-destroy', callback);
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this.emitter.emit('did-destroy');
      this.subscriptions.dispose();
    }
  }]);

  return TooltipElement;
})();

exports['default'] = TooltipElement;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci11aS1kZWZhdWx0L2xpYi90b29sdGlwL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztxQkFFa0IsT0FBTzs7Ozt3QkFDSixXQUFXOzs7OzBCQUNhLGNBQWM7O3dCQUl0QyxZQUFZOzs7O3VCQUNOLFdBQVc7Ozs7NkJBQ0wsa0JBQWtCOzs7O3VCQUM1QixZQUFZOztJQUdkLGNBQWM7QUFPdEIsV0FQUSxjQUFjLENBT3JCLFFBQThCLEVBQUUsUUFBZSxFQUFFLFVBQXNCLEVBQUU7OzswQkFQbEUsY0FBYzs7QUFRL0IsUUFBSSxDQUFDLE9BQU8sR0FBRyx5QkFBYSxDQUFBO0FBQzVCLFFBQUksQ0FBQyxPQUFPLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQTtBQUM1QyxRQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQTtBQUN4QixRQUFJLENBQUMsYUFBYSxHQUFHLHFDQUF5QixDQUFBOztBQUU5QyxRQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUE7QUFDcEMsUUFBSSxDQUFDLE1BQU0sR0FBRyxVQUFVLENBQUMsZUFBZSxDQUFDLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUE7QUFDOUQsUUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUM7YUFBTSxNQUFLLE9BQU8sQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDO0tBQUEsQ0FBQyxDQUFBOztBQUVoRSxRQUFNLFFBQVEsR0FBRywyQkFBYyxDQUFBO0FBQy9CLFFBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxHQUFHLGdCQUFnQixDQUFBO0FBQ2xDLGNBQVUsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRTtBQUNyQyxVQUFJLEVBQUUsU0FBUztBQUNmLFVBQUksRUFBRSxJQUFJLENBQUMsT0FBTztLQUNuQixDQUFDLENBQUE7QUFDRixRQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQTs7QUFFaEMsUUFBTSxRQUFRLEdBQUcsRUFBRSxDQUFBO0FBQ25CLFlBQVEsQ0FBQyxPQUFPLENBQUMsVUFBQyxPQUFPLEVBQUs7QUFDNUIsVUFBSSxPQUFPLENBQUMsT0FBTyxLQUFLLENBQUMsRUFBRTtBQUN6QixnQkFBUSxDQUFDLElBQUksQ0FBQyx5REFBZ0IsR0FBRyxFQUFFLE9BQU8sQ0FBQyxHQUFHLEFBQUMsRUFBQyxRQUFRLEVBQUUsUUFBUSxBQUFDLEVBQUMsT0FBTyxFQUFFLE9BQU8sQUFBQyxHQUFHLENBQUMsQ0FBQTtBQUN6RixlQUFNO09BQ1A7QUFDRCxjQUFRLENBQUMsSUFBSSxDQUFDLCtEQUFzQixHQUFHLEVBQUUsT0FBTyxDQUFDLEdBQUcsQUFBQyxFQUFDLFFBQVEsRUFBRSxRQUFRLEFBQUMsRUFBQyxPQUFPLEVBQUUsT0FBTyxBQUFDLEdBQUcsQ0FBQyxDQUFBO0FBQy9GLFVBQUksT0FBTyxDQUFDLEtBQUssSUFBSSxPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRTtBQUN6QyxnQkFBUSxDQUFDLElBQUksTUFBQSxDQUFiLFFBQVEscUJBQVMsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsVUFBQyxLQUFLLEVBQUUsS0FBSztpQkFDOUMsK0RBQXNCLEdBQUcsRUFBSyxLQUFLLENBQUMsR0FBRyxlQUFVLEtBQUssQUFBRyxFQUFDLFFBQVEsRUFBRSxRQUFRLEFBQUMsRUFBQyxPQUFPLEVBQUUsS0FBSyxBQUFDLEdBQUc7U0FBQSxDQUNqRyxFQUFDLENBQUE7T0FDSDtLQUNGLENBQUMsQ0FBQTtBQUNGLDBCQUFTLE1BQU0sQ0FBQzs7O01BQWtCLFFBQVE7S0FBbUIsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUE7R0FDN0U7O2VBdkNrQixjQUFjOztXQXdDMUIsaUJBQUMsUUFBZSxFQUFFLFFBQTRCLEVBQVc7QUFDOUQsVUFBTSxLQUFLLEdBQUcscUJBQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBQ3RDLGFBQU8sQ0FBQyxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxLQUFLLENBQUMsSUFBSSxRQUFRLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLElBQUksS0FBSyxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQSxBQUFDLENBQUE7S0FDbEg7OztXQUNXLHNCQUFDLFFBQXFCLEVBQWM7QUFDOUMsVUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsYUFBYSxFQUFFLFFBQVEsQ0FBQyxDQUFBO0tBQ3pDOzs7V0FDTSxtQkFBRztBQUNSLFVBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFBO0FBQ2hDLFVBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLENBQUE7S0FDN0I7OztTQWxEa0IsY0FBYzs7O3FCQUFkLGNBQWMiLCJmaWxlIjoiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvbGludGVyLXVpLWRlZmF1bHQvbGliL3Rvb2x0aXAvaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBAZmxvdyAqL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnXG5pbXBvcnQgUmVhY3RET00gZnJvbSAncmVhY3QtZG9tJ1xuaW1wb3J0IHsgQ29tcG9zaXRlRGlzcG9zYWJsZSwgRW1pdHRlciB9IGZyb20gJ3NiLWV2ZW50LWtpdCdcbmltcG9ydCB0eXBlIHsgUG9pbnQsIFRleHRFZGl0b3IgfSBmcm9tICdhdG9tJ1xuaW1wb3J0IHR5cGUgeyBEaXNwb3NhYmxlIH0gZnJvbSAnc2ItZXZlbnQta2l0J1xuXG5pbXBvcnQgRGVsZWdhdGUgZnJvbSAnLi9kZWxlZ2F0ZSdcbmltcG9ydCBNZXNzYWdlRWxlbWVudCBmcm9tICcuL21lc3NhZ2UnXG5pbXBvcnQgTWVzc2FnZUVsZW1lbnRMZWdhY3kgZnJvbSAnLi9tZXNzYWdlLWxlZ2FjeSdcbmltcG9ydCB7ICRyYW5nZSB9IGZyb20gJy4uL2hlbHBlcnMnXG5pbXBvcnQgdHlwZSB7IExpbnRlck1lc3NhZ2UgfSBmcm9tICcuLi90eXBlcydcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVG9vbHRpcEVsZW1lbnQge1xuICBtYXJrZXI6IE9iamVjdDtcbiAgZWxlbWVudDogSFRNTEVsZW1lbnQ7XG4gIGVtaXR0ZXI6IEVtaXR0ZXI7XG4gIG1lc3NhZ2VzOiBBcnJheTxMaW50ZXJNZXNzYWdlPjtcbiAgc3Vic2NyaXB0aW9uczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcblxuICBjb25zdHJ1Y3RvcihtZXNzYWdlczogQXJyYXk8TGludGVyTWVzc2FnZT4sIHBvc2l0aW9uOiBQb2ludCwgdGV4dEVkaXRvcjogVGV4dEVkaXRvcikge1xuICAgIHRoaXMuZW1pdHRlciA9IG5ldyBFbWl0dGVyKClcbiAgICB0aGlzLmVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgIHRoaXMubWVzc2FnZXMgPSBtZXNzYWdlc1xuICAgIHRoaXMuc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQodGhpcy5lbWl0dGVyKVxuICAgIHRoaXMubWFya2VyID0gdGV4dEVkaXRvci5tYXJrQnVmZmVyUmFuZ2UoW3Bvc2l0aW9uLCBwb3NpdGlvbl0pXG4gICAgdGhpcy5tYXJrZXIub25EaWREZXN0cm95KCgpID0+IHRoaXMuZW1pdHRlci5lbWl0KCdkaWQtZGVzdHJveScpKVxuXG4gICAgY29uc3QgZGVsZWdhdGUgPSBuZXcgRGVsZWdhdGUoKVxuICAgIHRoaXMuZWxlbWVudC5pZCA9ICdsaW50ZXItdG9vbHRpcCdcbiAgICB0ZXh0RWRpdG9yLmRlY29yYXRlTWFya2VyKHRoaXMubWFya2VyLCB7XG4gICAgICB0eXBlOiAnb3ZlcmxheScsXG4gICAgICBpdGVtOiB0aGlzLmVsZW1lbnQsXG4gICAgfSlcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGRlbGVnYXRlKVxuXG4gICAgY29uc3QgY2hpbGRyZW4gPSBbXVxuICAgIG1lc3NhZ2VzLmZvckVhY2goKG1lc3NhZ2UpID0+IHtcbiAgICAgIGlmIChtZXNzYWdlLnZlcnNpb24gPT09IDIpIHtcbiAgICAgICAgY2hpbGRyZW4ucHVzaCg8TWVzc2FnZUVsZW1lbnQga2V5PXttZXNzYWdlLmtleX0gZGVsZWdhdGU9e2RlbGVnYXRlfSBtZXNzYWdlPXttZXNzYWdlfSAvPilcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICBjaGlsZHJlbi5wdXNoKDxNZXNzYWdlRWxlbWVudExlZ2FjeSBrZXk9e21lc3NhZ2Uua2V5fSBkZWxlZ2F0ZT17ZGVsZWdhdGV9IG1lc3NhZ2U9e21lc3NhZ2V9IC8+KVxuICAgICAgaWYgKG1lc3NhZ2UudHJhY2UgJiYgbWVzc2FnZS50cmFjZS5sZW5ndGgpIHtcbiAgICAgICAgY2hpbGRyZW4ucHVzaCguLi5tZXNzYWdlLnRyYWNlLm1hcCgodHJhY2UsIGluZGV4KSA9PlxuICAgICAgICAgIDxNZXNzYWdlRWxlbWVudExlZ2FjeSBrZXk9e2Ake3RyYWNlLmtleX06dHJhY2U6JHtpbmRleH1gfSBkZWxlZ2F0ZT17ZGVsZWdhdGV9IG1lc3NhZ2U9e3RyYWNlfSAvPlxuICAgICAgICApKVxuICAgICAgfVxuICAgIH0pXG4gICAgUmVhY3RET00ucmVuZGVyKDxsaW50ZXItbWVzc2FnZXM+e2NoaWxkcmVufTwvbGludGVyLW1lc3NhZ2VzPiwgdGhpcy5lbGVtZW50KVxuICB9XG4gIGlzVmFsaWQocG9zaXRpb246IFBvaW50LCBtZXNzYWdlczogU2V0PExpbnRlck1lc3NhZ2U+KTogYm9vbGVhbiB7XG4gICAgY29uc3QgcmFuZ2UgPSAkcmFuZ2UodGhpcy5tZXNzYWdlc1swXSlcbiAgICByZXR1cm4gISEodGhpcy5tZXNzYWdlcy5sZW5ndGggPT09IDEgJiYgbWVzc2FnZXMuaGFzKHRoaXMubWVzc2FnZXNbMF0pICYmIHJhbmdlICYmIHJhbmdlLmNvbnRhaW5zUG9pbnQocG9zaXRpb24pKVxuICB9XG4gIG9uRGlkRGVzdHJveShjYWxsYmFjazogKCgpID0+IGFueSkpOiBEaXNwb3NhYmxlIHtcbiAgICB0aGlzLmVtaXR0ZXIub24oJ2RpZC1kZXN0cm95JywgY2FsbGJhY2spXG4gIH1cbiAgZGlzcG9zZSgpIHtcbiAgICB0aGlzLmVtaXR0ZXIuZW1pdCgnZGlkLWRlc3Ryb3knKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiAgfVxufVxuIl19