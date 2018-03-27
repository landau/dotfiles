var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var NEWLINE = /\r\n|\n/;
var MESSAGE_NUMBER = 0;

var MessageElement = (function (_React$Component) {
  _inherits(MessageElement, _React$Component);

  function MessageElement() {
    _classCallCheck(this, MessageElement);

    _get(Object.getPrototypeOf(MessageElement.prototype), 'constructor', this).apply(this, arguments);

    this.state = {
      multiLineShow: false
    };
  }

  _createClass(MessageElement, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this = this;

      this.props.delegate.onShouldUpdate(function () {
        _this.setState({});
      });
      this.props.delegate.onShouldExpand(function () {
        _this.setState({ multiLineShow: true });
      });
      this.props.delegate.onShouldCollapse(function () {
        _this.setState({ multiLineShow: false });
      });
    }
  }, {
    key: 'render',
    value: function render() {
      return NEWLINE.test(this.props.message.text || '') ? this.renderMultiLine() : this.renderSingleLine();
    }
  }, {
    key: 'renderSingleLine',
    value: function renderSingleLine() {
      var _props = this.props;
      var message = _props.message;
      var delegate = _props.delegate;

      var number = ++MESSAGE_NUMBER;
      var elementID = 'linter-message-' + number;
      var isElement = message.html && typeof message.html === 'object';
      if (isElement) {
        setImmediate(function () {
          var element = document.getElementById(elementID);
          if (element) {
            // $FlowIgnore: This is an HTML Element :\
            element.appendChild(message.html.cloneNode(true));
          } else {
            console.warn('[Linter] Unable to get element for mounted message', number, message);
          }
        });
      }

      return _react2['default'].createElement(
        'linter-message',
        { 'class': message.severity },
        delegate.showProviderName ? message.linterName + ': ' : '',
        _react2['default'].createElement(
          'span',
          { id: elementID, dangerouslySetInnerHTML: !isElement && message.html ? { __html: message.html } : null },
          message.text
        ),
        ' '
      );
    }
  }, {
    key: 'renderMultiLine',
    value: function renderMultiLine() {
      var _this2 = this;

      var _props2 = this.props;
      var message = _props2.message;
      var delegate = _props2.delegate;

      var text = message.text ? message.text.split(NEWLINE) : [];
      var chunks = text.map(function (entry) {
        return entry.trim();
      }).map(function (entry, index) {
        return entry.length && _react2['default'].createElement(
          'span',
          { className: index !== 0 && 'linter-line' },
          entry
        );
      }).filter(function (e) {
        return e;
      });

      return _react2['default'].createElement(
        'linter-message',
        { 'class': message.severity },
        _react2['default'].createElement(
          'a',
          { href: '#', onClick: function () {
              return _this2.setState({ multiLineShow: !_this2.state.multiLineShow });
            } },
          _react2['default'].createElement('span', { className: 'icon linter-icon icon-' + (this.state.multiLineShow ? 'chevron-down' : 'chevron-right') })
        ),
        delegate.showProviderName ? message.linterName + ': ' : '',
        chunks[0],
        ' ',
        this.state.multiLineShow && chunks.slice(1)
      );
    }
  }]);

  return MessageElement;
})(_react2['default'].Component);

module.exports = MessageElement;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1Ly5hdG9tL3BhY2thZ2VzL2xpbnRlci11aS1kZWZhdWx0L2xpYi90b29sdGlwL21lc3NhZ2UtbGVnYWN5LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7cUJBRWtCLE9BQU87Ozs7QUFJekIsSUFBTSxPQUFPLEdBQUcsU0FBUyxDQUFBO0FBQ3pCLElBQUksY0FBYyxHQUFHLENBQUMsQ0FBQTs7SUFFaEIsY0FBYztZQUFkLGNBQWM7O1dBQWQsY0FBYzswQkFBZCxjQUFjOzsrQkFBZCxjQUFjOztTQUtsQixLQUFLLEdBRUQ7QUFDRixtQkFBYSxFQUFFLEtBQUs7S0FDckI7OztlQVRHLGNBQWM7O1dBVUQsNkJBQUc7OztBQUNsQixVQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsWUFBTTtBQUN2QyxjQUFLLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQTtPQUNsQixDQUFDLENBQUE7QUFDRixVQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsWUFBTTtBQUN2QyxjQUFLLFFBQVEsQ0FBQyxFQUFFLGFBQWEsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFBO09BQ3ZDLENBQUMsQ0FBQTtBQUNGLFVBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLGdCQUFnQixDQUFDLFlBQU07QUFDekMsY0FBSyxRQUFRLENBQUMsRUFBRSxhQUFhLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQTtPQUN4QyxDQUFDLENBQUE7S0FDSDs7O1dBQ0ssa0JBQUc7QUFDUCxhQUFPLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxlQUFlLEVBQUUsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQTtLQUN0Rzs7O1dBQ2UsNEJBQUc7bUJBQ2EsSUFBSSxDQUFDLEtBQUs7VUFBaEMsT0FBTyxVQUFQLE9BQU87VUFBRSxRQUFRLFVBQVIsUUFBUTs7QUFFekIsVUFBTSxNQUFNLEdBQUcsRUFBRSxjQUFjLENBQUE7QUFDL0IsVUFBTSxTQUFTLHVCQUFxQixNQUFNLEFBQUUsQ0FBQTtBQUM1QyxVQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMsSUFBSSxJQUFJLE9BQU8sT0FBTyxDQUFDLElBQUksS0FBSyxRQUFRLENBQUE7QUFDbEUsVUFBSSxTQUFTLEVBQUU7QUFDYixvQkFBWSxDQUFDLFlBQVc7QUFDdEIsY0FBTSxPQUFPLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsQ0FBQTtBQUNsRCxjQUFJLE9BQU8sRUFBRTs7QUFFWCxtQkFBTyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFBO1dBQ2xELE1BQU07QUFDTCxtQkFBTyxDQUFDLElBQUksQ0FBQyxvREFBb0QsRUFBRSxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUE7V0FDcEY7U0FDRixDQUFDLENBQUE7T0FDSDs7QUFFRCxhQUFROztVQUFnQixTQUFPLE9BQU8sQ0FBQyxRQUFRLEFBQUM7UUFDNUMsUUFBUSxDQUFDLGdCQUFnQixHQUFNLE9BQU8sQ0FBQyxVQUFVLFVBQU8sRUFBRTtRQUM1RDs7WUFBTSxFQUFFLEVBQUUsU0FBUyxBQUFDLEVBQUMsdUJBQXVCLEVBQUUsQ0FBQyxTQUFTLElBQUksT0FBTyxDQUFDLElBQUksR0FBRyxFQUFFLE1BQU0sRUFBRSxPQUFPLENBQUMsSUFBSSxFQUFFLEdBQUcsSUFBSSxBQUFDO1VBQ3ZHLE9BQU8sQ0FBQyxJQUFJO1NBQ1Q7UUFDTixHQUFHO09BQ1csQ0FBQztLQUNuQjs7O1dBRWMsMkJBQUc7OztvQkFDYyxJQUFJLENBQUMsS0FBSztVQUFoQyxPQUFPLFdBQVAsT0FBTztVQUFFLFFBQVEsV0FBUixRQUFROztBQUV6QixVQUFNLElBQUksR0FBRyxPQUFPLENBQUMsSUFBSSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQTtBQUM1RCxVQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQUEsS0FBSztlQUFJLEtBQUssQ0FBQyxJQUFJLEVBQUU7T0FBQSxDQUFDLENBQUMsR0FBRyxDQUFDLFVBQUMsS0FBSyxFQUFFLEtBQUs7ZUFBSyxLQUFLLENBQUMsTUFBTSxJQUFJOztZQUFNLFNBQVMsRUFBRSxLQUFLLEtBQUssQ0FBQyxJQUFJLGFBQWEsQUFBQztVQUFFLEtBQUs7U0FBUTtPQUFBLENBQUMsQ0FBQyxNQUFNLENBQUMsVUFBQSxDQUFDO2VBQUksQ0FBQztPQUFBLENBQUMsQ0FBQTs7QUFFbEssYUFBUTs7VUFBZ0IsU0FBTyxPQUFPLENBQUMsUUFBUSxBQUFDO1FBQzlDOztZQUFHLElBQUksRUFBQyxHQUFHLEVBQUMsT0FBTyxFQUFFO3FCQUFNLE9BQUssUUFBUSxDQUFDLEVBQUUsYUFBYSxFQUFFLENBQUMsT0FBSyxLQUFLLENBQUMsYUFBYSxFQUFFLENBQUM7YUFBQSxBQUFDO1VBQ3JGLDJDQUFNLFNBQVMsOEJBQTJCLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxHQUFHLGNBQWMsR0FBRyxlQUFlLENBQUEsQUFBRyxHQUFHO1NBQ3pHO1FBQ0YsUUFBUSxDQUFDLGdCQUFnQixHQUFNLE9BQU8sQ0FBQyxVQUFVLFVBQU8sRUFBRTtRQUMxRCxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQ1YsR0FBRztRQUNGLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxJQUFJLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO09BQzlCLENBQUM7S0FDbkI7OztTQWxFRyxjQUFjO0dBQVMsbUJBQU0sU0FBUzs7QUFxRTVDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsY0FBYyxDQUFBIiwiZmlsZSI6Ii9Vc2Vycy90bGFuZGF1Ly5hdG9tL3BhY2thZ2VzL2xpbnRlci11aS1kZWZhdWx0L2xpYi90b29sdGlwL21lc3NhZ2UtbGVnYWN5LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogQGZsb3cgKi9cblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHR5cGUgVG9vbHRpcERlbGVnYXRlIGZyb20gJy4vZGVsZWdhdGUnXG5pbXBvcnQgdHlwZSB7IE1lc3NhZ2VMZWdhY3kgfSBmcm9tICcuLi90eXBlcydcblxuY29uc3QgTkVXTElORSA9IC9cXHJcXG58XFxuL1xubGV0IE1FU1NBR0VfTlVNQkVSID0gMFxuXG5jbGFzcyBNZXNzYWdlRWxlbWVudCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gIHByb3BzOiB7XG4gICAgbWVzc2FnZTogTWVzc2FnZUxlZ2FjeSxcbiAgICBkZWxlZ2F0ZTogVG9vbHRpcERlbGVnYXRlLFxuICB9O1xuICBzdGF0ZToge1xuICAgIG11bHRpTGluZVNob3c6IGJvb2xlYW4sXG4gIH0gPSB7XG4gICAgbXVsdGlMaW5lU2hvdzogZmFsc2UsXG4gIH07XG4gIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgIHRoaXMucHJvcHMuZGVsZWdhdGUub25TaG91bGRVcGRhdGUoKCkgPT4ge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7fSlcbiAgICB9KVxuICAgIHRoaXMucHJvcHMuZGVsZWdhdGUub25TaG91bGRFeHBhbmQoKCkgPT4ge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7IG11bHRpTGluZVNob3c6IHRydWUgfSlcbiAgICB9KVxuICAgIHRoaXMucHJvcHMuZGVsZWdhdGUub25TaG91bGRDb2xsYXBzZSgoKSA9PiB7XG4gICAgICB0aGlzLnNldFN0YXRlKHsgbXVsdGlMaW5lU2hvdzogZmFsc2UgfSlcbiAgICB9KVxuICB9XG4gIHJlbmRlcigpIHtcbiAgICByZXR1cm4gTkVXTElORS50ZXN0KHRoaXMucHJvcHMubWVzc2FnZS50ZXh0IHx8ICcnKSA/IHRoaXMucmVuZGVyTXVsdGlMaW5lKCkgOiB0aGlzLnJlbmRlclNpbmdsZUxpbmUoKVxuICB9XG4gIHJlbmRlclNpbmdsZUxpbmUoKSB7XG4gICAgY29uc3QgeyBtZXNzYWdlLCBkZWxlZ2F0ZSB9ID0gdGhpcy5wcm9wc1xuXG4gICAgY29uc3QgbnVtYmVyID0gKytNRVNTQUdFX05VTUJFUlxuICAgIGNvbnN0IGVsZW1lbnRJRCA9IGBsaW50ZXItbWVzc2FnZS0ke251bWJlcn1gXG4gICAgY29uc3QgaXNFbGVtZW50ID0gbWVzc2FnZS5odG1sICYmIHR5cGVvZiBtZXNzYWdlLmh0bWwgPT09ICdvYmplY3QnXG4gICAgaWYgKGlzRWxlbWVudCkge1xuICAgICAgc2V0SW1tZWRpYXRlKGZ1bmN0aW9uKCkge1xuICAgICAgICBjb25zdCBlbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoZWxlbWVudElEKVxuICAgICAgICBpZiAoZWxlbWVudCkge1xuICAgICAgICAgIC8vICRGbG93SWdub3JlOiBUaGlzIGlzIGFuIEhUTUwgRWxlbWVudCA6XFxcbiAgICAgICAgICBlbGVtZW50LmFwcGVuZENoaWxkKG1lc3NhZ2UuaHRtbC5jbG9uZU5vZGUodHJ1ZSkpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc29sZS53YXJuKCdbTGludGVyXSBVbmFibGUgdG8gZ2V0IGVsZW1lbnQgZm9yIG1vdW50ZWQgbWVzc2FnZScsIG51bWJlciwgbWVzc2FnZSlcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9XG5cbiAgICByZXR1cm4gKDxsaW50ZXItbWVzc2FnZSBjbGFzcz17bWVzc2FnZS5zZXZlcml0eX0+XG4gICAgICB7IGRlbGVnYXRlLnNob3dQcm92aWRlck5hbWUgPyBgJHttZXNzYWdlLmxpbnRlck5hbWV9OiBgIDogJycgfVxuICAgICAgPHNwYW4gaWQ9e2VsZW1lbnRJRH0gZGFuZ2Vyb3VzbHlTZXRJbm5lckhUTUw9eyFpc0VsZW1lbnQgJiYgbWVzc2FnZS5odG1sID8geyBfX2h0bWw6IG1lc3NhZ2UuaHRtbCB9IDogbnVsbH0+XG4gICAgICAgIHsgbWVzc2FnZS50ZXh0IH1cbiAgICAgIDwvc3Bhbj5cbiAgICAgIHsnICd9XG4gICAgPC9saW50ZXItbWVzc2FnZT4pXG4gIH1cblxuICByZW5kZXJNdWx0aUxpbmUoKSB7XG4gICAgY29uc3QgeyBtZXNzYWdlLCBkZWxlZ2F0ZSB9ID0gdGhpcy5wcm9wc1xuXG4gICAgY29uc3QgdGV4dCA9IG1lc3NhZ2UudGV4dCA/IG1lc3NhZ2UudGV4dC5zcGxpdChORVdMSU5FKSA6IFtdXG4gICAgY29uc3QgY2h1bmtzID0gdGV4dC5tYXAoZW50cnkgPT4gZW50cnkudHJpbSgpKS5tYXAoKGVudHJ5LCBpbmRleCkgPT4gZW50cnkubGVuZ3RoICYmIDxzcGFuIGNsYXNzTmFtZT17aW5kZXggIT09IDAgJiYgJ2xpbnRlci1saW5lJ30+e2VudHJ5fTwvc3Bhbj4pLmZpbHRlcihlID0+IGUpXG5cbiAgICByZXR1cm4gKDxsaW50ZXItbWVzc2FnZSBjbGFzcz17bWVzc2FnZS5zZXZlcml0eX0+XG4gICAgICA8YSBocmVmPVwiI1wiIG9uQ2xpY2s9eygpID0+IHRoaXMuc2V0U3RhdGUoeyBtdWx0aUxpbmVTaG93OiAhdGhpcy5zdGF0ZS5tdWx0aUxpbmVTaG93IH0pfT5cbiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPXtgaWNvbiBsaW50ZXItaWNvbiBpY29uLSR7dGhpcy5zdGF0ZS5tdWx0aUxpbmVTaG93ID8gJ2NoZXZyb24tZG93bicgOiAnY2hldnJvbi1yaWdodCd9YH0gLz5cbiAgICAgIDwvYT5cbiAgICAgIHsgZGVsZWdhdGUuc2hvd1Byb3ZpZGVyTmFtZSA/IGAke21lc3NhZ2UubGludGVyTmFtZX06IGAgOiAnJyB9XG4gICAgICB7IGNodW5rc1swXSB9XG4gICAgICB7JyAnfVxuICAgICAgeyB0aGlzLnN0YXRlLm11bHRpTGluZVNob3cgJiYgY2h1bmtzLnNsaWNlKDEpIH1cbiAgICA8L2xpbnRlci1tZXNzYWdlPilcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IE1lc3NhZ2VFbGVtZW50XG4iXX0=