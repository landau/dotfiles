var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _atom = require('atom');

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

    this.emitter = new _atom.Emitter();
    this.element = document.createElement('div');
    this.messages = messages;
    this.subscriptions = new _atom.CompositeDisposable();

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
        children.push.apply(children, _toConsumableArray(message.trace.map(function (trace) {
          return _react2['default'].createElement(_messageLegacy2['default'], { key: message.key + ':trace:' + trace.key, delegate: delegate, message: trace });
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

module.exports = TooltipElement;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci11aS1kZWZhdWx0L2xpYi90b29sdGlwL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O3FCQUVrQixPQUFPOzs7O3dCQUNKLFdBQVc7Ozs7b0JBQ2EsTUFBTTs7d0JBRzlCLFlBQVk7Ozs7dUJBQ04sV0FBVzs7Ozs2QkFDTCxrQkFBa0I7Ozs7dUJBQzVCLFlBQVk7O0lBRzdCLGNBQWM7QUFPUCxXQVBQLGNBQWMsQ0FPTixRQUE4QixFQUFFLFFBQWUsRUFBRSxVQUFzQixFQUFFOzs7MEJBUGpGLGNBQWM7O0FBUWhCLFFBQUksQ0FBQyxPQUFPLEdBQUcsbUJBQWEsQ0FBQTtBQUM1QixRQUFJLENBQUMsT0FBTyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUE7QUFDNUMsUUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUE7QUFDeEIsUUFBSSxDQUFDLGFBQWEsR0FBRywrQkFBeUIsQ0FBQTs7QUFFOUMsUUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFBO0FBQ3BDLFFBQUksQ0FBQyxNQUFNLEdBQUcsVUFBVSxDQUFDLGVBQWUsQ0FBQyxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFBO0FBQzlELFFBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDO2FBQU0sTUFBSyxPQUFPLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQztLQUFBLENBQUMsQ0FBQTs7QUFFaEUsUUFBTSxRQUFRLEdBQUcsMkJBQWMsQ0FBQTtBQUMvQixRQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsR0FBRyxnQkFBZ0IsQ0FBQTtBQUNsQyxjQUFVLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUU7QUFDckMsVUFBSSxFQUFFLFNBQVM7QUFDZixVQUFJLEVBQUUsSUFBSSxDQUFDLE9BQU87S0FDbkIsQ0FBQyxDQUFBO0FBQ0YsUUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUE7O0FBRWhDLFFBQU0sUUFBUSxHQUFHLEVBQUUsQ0FBQTtBQUNuQixZQUFRLENBQUMsT0FBTyxDQUFDLFVBQUMsT0FBTyxFQUFLO0FBQzVCLFVBQUksT0FBTyxDQUFDLE9BQU8sS0FBSyxDQUFDLEVBQUU7QUFDekIsZ0JBQVEsQ0FBQyxJQUFJLENBQUMseURBQWdCLEdBQUcsRUFBRSxPQUFPLENBQUMsR0FBRyxBQUFDLEVBQUMsUUFBUSxFQUFFLFFBQVEsQUFBQyxFQUFDLE9BQU8sRUFBRSxPQUFPLEFBQUMsR0FBRyxDQUFDLENBQUE7QUFDekYsZUFBTTtPQUNQO0FBQ0QsY0FBUSxDQUFDLElBQUksQ0FBQywrREFBc0IsR0FBRyxFQUFFLE9BQU8sQ0FBQyxHQUFHLEFBQUMsRUFBQyxRQUFRLEVBQUUsUUFBUSxBQUFDLEVBQUMsT0FBTyxFQUFFLE9BQU8sQUFBQyxHQUFHLENBQUMsQ0FBQTtBQUMvRixVQUFJLE9BQU8sQ0FBQyxLQUFLLElBQUksT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUU7QUFDekMsZ0JBQVEsQ0FBQyxJQUFJLE1BQUEsQ0FBYixRQUFRLHFCQUFTLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFVBQUEsS0FBSztpQkFDdEMsK0RBQXNCLEdBQUcsRUFBSyxPQUFPLENBQUMsR0FBRyxlQUFVLEtBQUssQ0FBQyxHQUFHLEFBQUcsRUFBQyxRQUFRLEVBQUUsUUFBUSxBQUFDLEVBQUMsT0FBTyxFQUFFLEtBQUssQUFBQyxHQUFHO1NBQUEsQ0FDdkcsRUFBQyxDQUFBO09BQ0g7S0FDRixDQUFDLENBQUE7QUFDRiwwQkFBUyxNQUFNLENBQUM7OztNQUFrQixRQUFRO0tBQW1CLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFBO0dBQzdFOztlQXZDRyxjQUFjOztXQXdDWCxpQkFBQyxRQUFlLEVBQUUsUUFBNEIsRUFBVztBQUM5RCxVQUFNLEtBQUssR0FBRyxxQkFBTyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7QUFDdEMsYUFBTyxDQUFDLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEtBQUssQ0FBQyxJQUFJLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssSUFBSSxLQUFLLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFBLEFBQUMsQ0FBQTtLQUNsSDs7O1dBQ1csc0JBQUMsUUFBcUIsRUFBYztBQUM5QyxVQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxhQUFhLEVBQUUsUUFBUSxDQUFDLENBQUE7S0FDekM7OztXQUNNLG1CQUFHO0FBQ1IsVUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUE7QUFDaEMsVUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtLQUM3Qjs7O1NBbERHLGNBQWM7OztBQXFEcEIsTUFBTSxDQUFDLE9BQU8sR0FBRyxjQUFjLENBQUEiLCJmaWxlIjoiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvbGludGVyLXVpLWRlZmF1bHQvbGliL3Rvb2x0aXAvaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBAZmxvdyAqL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnXG5pbXBvcnQgUmVhY3RET00gZnJvbSAncmVhY3QtZG9tJ1xuaW1wb3J0IHsgQ29tcG9zaXRlRGlzcG9zYWJsZSwgRW1pdHRlciB9IGZyb20gJ2F0b20nXG5pbXBvcnQgdHlwZSB7IERpc3Bvc2FibGUsIFBvaW50LCBUZXh0RWRpdG9yIH0gZnJvbSAnYXRvbSdcblxuaW1wb3J0IERlbGVnYXRlIGZyb20gJy4vZGVsZWdhdGUnXG5pbXBvcnQgTWVzc2FnZUVsZW1lbnQgZnJvbSAnLi9tZXNzYWdlJ1xuaW1wb3J0IE1lc3NhZ2VFbGVtZW50TGVnYWN5IGZyb20gJy4vbWVzc2FnZS1sZWdhY3knXG5pbXBvcnQgeyAkcmFuZ2UgfSBmcm9tICcuLi9oZWxwZXJzJ1xuaW1wb3J0IHR5cGUgeyBMaW50ZXJNZXNzYWdlIH0gZnJvbSAnLi4vdHlwZXMnXG5cbmNsYXNzIFRvb2x0aXBFbGVtZW50IHtcbiAgbWFya2VyOiBPYmplY3Q7XG4gIGVsZW1lbnQ6IEhUTUxFbGVtZW50O1xuICBlbWl0dGVyOiBFbWl0dGVyO1xuICBtZXNzYWdlczogQXJyYXk8TGludGVyTWVzc2FnZT47XG4gIHN1YnNjcmlwdGlvbnM6IENvbXBvc2l0ZURpc3Bvc2FibGU7XG5cbiAgY29uc3RydWN0b3IobWVzc2FnZXM6IEFycmF5PExpbnRlck1lc3NhZ2U+LCBwb3NpdGlvbjogUG9pbnQsIHRleHRFZGl0b3I6IFRleHRFZGl0b3IpIHtcbiAgICB0aGlzLmVtaXR0ZXIgPSBuZXcgRW1pdHRlcigpXG4gICAgdGhpcy5lbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICB0aGlzLm1lc3NhZ2VzID0gbWVzc2FnZXNcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG5cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKHRoaXMuZW1pdHRlcilcbiAgICB0aGlzLm1hcmtlciA9IHRleHRFZGl0b3IubWFya0J1ZmZlclJhbmdlKFtwb3NpdGlvbiwgcG9zaXRpb25dKVxuICAgIHRoaXMubWFya2VyLm9uRGlkRGVzdHJveSgoKSA9PiB0aGlzLmVtaXR0ZXIuZW1pdCgnZGlkLWRlc3Ryb3knKSlcblxuICAgIGNvbnN0IGRlbGVnYXRlID0gbmV3IERlbGVnYXRlKClcbiAgICB0aGlzLmVsZW1lbnQuaWQgPSAnbGludGVyLXRvb2x0aXAnXG4gICAgdGV4dEVkaXRvci5kZWNvcmF0ZU1hcmtlcih0aGlzLm1hcmtlciwge1xuICAgICAgdHlwZTogJ292ZXJsYXknLFxuICAgICAgaXRlbTogdGhpcy5lbGVtZW50LFxuICAgIH0pXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChkZWxlZ2F0ZSlcblxuICAgIGNvbnN0IGNoaWxkcmVuID0gW11cbiAgICBtZXNzYWdlcy5mb3JFYWNoKChtZXNzYWdlKSA9PiB7XG4gICAgICBpZiAobWVzc2FnZS52ZXJzaW9uID09PSAyKSB7XG4gICAgICAgIGNoaWxkcmVuLnB1c2goPE1lc3NhZ2VFbGVtZW50IGtleT17bWVzc2FnZS5rZXl9IGRlbGVnYXRlPXtkZWxlZ2F0ZX0gbWVzc2FnZT17bWVzc2FnZX0gLz4pXG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgY2hpbGRyZW4ucHVzaCg8TWVzc2FnZUVsZW1lbnRMZWdhY3kga2V5PXttZXNzYWdlLmtleX0gZGVsZWdhdGU9e2RlbGVnYXRlfSBtZXNzYWdlPXttZXNzYWdlfSAvPilcbiAgICAgIGlmIChtZXNzYWdlLnRyYWNlICYmIG1lc3NhZ2UudHJhY2UubGVuZ3RoKSB7XG4gICAgICAgIGNoaWxkcmVuLnB1c2goLi4ubWVzc2FnZS50cmFjZS5tYXAodHJhY2UgPT5cbiAgICAgICAgICA8TWVzc2FnZUVsZW1lbnRMZWdhY3kga2V5PXtgJHttZXNzYWdlLmtleX06dHJhY2U6JHt0cmFjZS5rZXl9YH0gZGVsZWdhdGU9e2RlbGVnYXRlfSBtZXNzYWdlPXt0cmFjZX0gLz4sXG4gICAgICAgICkpXG4gICAgICB9XG4gICAgfSlcbiAgICBSZWFjdERPTS5yZW5kZXIoPGxpbnRlci1tZXNzYWdlcz57Y2hpbGRyZW59PC9saW50ZXItbWVzc2FnZXM+LCB0aGlzLmVsZW1lbnQpXG4gIH1cbiAgaXNWYWxpZChwb3NpdGlvbjogUG9pbnQsIG1lc3NhZ2VzOiBTZXQ8TGludGVyTWVzc2FnZT4pOiBib29sZWFuIHtcbiAgICBjb25zdCByYW5nZSA9ICRyYW5nZSh0aGlzLm1lc3NhZ2VzWzBdKVxuICAgIHJldHVybiAhISh0aGlzLm1lc3NhZ2VzLmxlbmd0aCA9PT0gMSAmJiBtZXNzYWdlcy5oYXModGhpcy5tZXNzYWdlc1swXSkgJiYgcmFuZ2UgJiYgcmFuZ2UuY29udGFpbnNQb2ludChwb3NpdGlvbikpXG4gIH1cbiAgb25EaWREZXN0cm95KGNhbGxiYWNrOiAoKCkgPT4gYW55KSk6IERpc3Bvc2FibGUge1xuICAgIHRoaXMuZW1pdHRlci5vbignZGlkLWRlc3Ryb3knLCBjYWxsYmFjaylcbiAgfVxuICBkaXNwb3NlKCkge1xuICAgIHRoaXMuZW1pdHRlci5lbWl0KCdkaWQtZGVzdHJveScpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gVG9vbHRpcEVsZW1lbnRcbiJdfQ==