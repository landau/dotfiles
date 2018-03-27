var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _helpers = require('../helpers');

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
        ' ',
        _react2['default'].createElement(
          'a',
          { href: '#', onClick: function () {
              return (0, _helpers.openExternally)(message);
            } },
          _react2['default'].createElement('span', { className: 'icon icon-link linter-icon' })
        )
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci11aS1kZWZhdWx0L2xpYi90b29sdGlwL21lc3NhZ2UtbGVnYWN5LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7cUJBRWtCLE9BQU87Ozs7dUJBQ00sWUFBWTs7QUFJM0MsSUFBTSxPQUFPLEdBQUcsU0FBUyxDQUFBO0FBQ3pCLElBQUksY0FBYyxHQUFHLENBQUMsQ0FBQTs7SUFFaEIsY0FBYztZQUFkLGNBQWM7O1dBQWQsY0FBYzswQkFBZCxjQUFjOzsrQkFBZCxjQUFjOztTQUtsQixLQUFLLEdBRUQ7QUFDRixtQkFBYSxFQUFFLEtBQUs7S0FDckI7OztlQVRHLGNBQWM7O1dBVUQsNkJBQUc7OztBQUNsQixVQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsWUFBTTtBQUN2QyxjQUFLLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQTtPQUNsQixDQUFDLENBQUE7QUFDRixVQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsWUFBTTtBQUN2QyxjQUFLLFFBQVEsQ0FBQyxFQUFFLGFBQWEsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFBO09BQ3ZDLENBQUMsQ0FBQTtBQUNGLFVBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLGdCQUFnQixDQUFDLFlBQU07QUFDekMsY0FBSyxRQUFRLENBQUMsRUFBRSxhQUFhLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQTtPQUN4QyxDQUFDLENBQUE7S0FDSDs7O1dBQ0ssa0JBQUc7QUFDUCxhQUFPLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxlQUFlLEVBQUUsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQTtLQUN0Rzs7O1dBQ2UsNEJBQUc7bUJBQ2EsSUFBSSxDQUFD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QUFDLE9BQU8sR0FBRyxjQUFjLENBQUEiLCJmaWxlIjoiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvbGludGVyLXVpLWRlZmF1bHQvbGliL3Rvb2x0aXAvbWVzc2FnZS1sZWdhY3kuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBAZmxvdyAqL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnXG5pbXBvcnQgeyBvcGVuRXh0ZXJuYWxseSB9IGZyb20gJy4uL2hlbHBlcnMnXG5pbXBvcnQgdHlwZSBUb29sdGlwRGVsZWdhdGUgZnJvbSAnLi9kZWxlZ2F0ZSdcbmltcG9ydCB0eXBlIHsgTWVzc2FnZUxlZ2FjeSB9IGZyb20gJy4uL3R5cGVzJ1xuXG5jb25zdCBORVdMSU5FID0gL1xcclxcbnxcXG4vXG5sZXQgTUVTU0FHRV9OVU1CRVIgPSAwXG5cbmNsYXNzIE1lc3NhZ2VFbGVtZW50IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgcHJvcHM6IHtcbiAgICBtZXNzYWdlOiBNZXNzYWdlTGVnYWN5LFxuICAgIGRlbGVnYXRlOiBUb29sdGlwRGVsZWdhdGUsXG4gIH07XG4gIHN0YXRlOiB7XG4gICAgbXVsdGlMaW5lU2hvdzogYm9vbGVhbixcbiAgfSA9IHtcbiAgICBtdWx0aUxpbmVTaG93OiBmYWxzZSxcbiAgfTtcbiAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgdGhpcy5wcm9wcy5kZWxlZ2F0ZS5vblNob3VsZFVwZGF0ZSgoKSA9PiB7XG4gICAgICB0aGlzLnNldFN0YXRlKHt9KVxuICAgIH0pXG4gICAgdGhpcy5wcm9wcy5kZWxlZ2F0ZS5vblNob3VsZEV4cGFuZCgoKSA9PiB7XG4gICAgICB0aGlzLnNldFN0YXRlKHsgbXVsdGlMaW5lU2hvdzogdHJ1ZSB9KVxuICAgIH0pXG4gICAgdGhpcy5wcm9wcy5kZWxlZ2F0ZS5vblNob3VsZENvbGxhcHNlKCgpID0+IHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoeyBtdWx0aUxpbmVTaG93OiBmYWxzZSB9KVxuICAgIH0pXG4gIH1cbiAgcmVuZGVyKCkge1xuICAgIHJldHVybiBORVdMSU5FLnRlc3QodGhpcy5wcm9wcy5tZXNzYWdlLnRleHQgfHwgJycpID8gdGhpcy5yZW5kZXJNdWx0aUxpbmUoKSA6IHRoaXMucmVuZGVyU2luZ2xlTGluZSgpXG4gIH1cbiAgcmVuZGVyU2luZ2xlTGluZSgpIHtcbiAgICBjb25zdCB7IG1lc3NhZ2UsIGRlbGVnYXRlIH0gPSB0aGlzLnByb3BzXG5cbiAgICBjb25zdCBudW1iZXIgPSArK01FU1NBR0VfTlVNQkVSXG4gICAgY29uc3QgZWxlbWVudElEID0gYGxpbnRlci1tZXNzYWdlLSR7bnVtYmVyfWBcbiAgICBjb25zdCBpc0VsZW1lbnQgPSBtZXNzYWdlLmh0bWwgJiYgdHlwZW9mIG1lc3NhZ2UuaHRtbCA9PT0gJ29iamVjdCdcbiAgICBpZiAoaXNFbGVtZW50KSB7XG4gICAgICBzZXRJbW1lZGlhdGUoZnVuY3Rpb24oKSB7XG4gICAgICAgIGNvbnN0IGVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChlbGVtZW50SUQpXG4gICAgICAgIGlmIChlbGVtZW50KSB7XG4gICAgICAgICAgLy8gJEZsb3dJZ25vcmU6IFRoaXMgaXMgYW4gSFRNTCBFbGVtZW50IDpcXFxuICAgICAgICAgIGVsZW1lbnQuYXBwZW5kQ2hpbGQobWVzc2FnZS5odG1sLmNsb25lTm9kZSh0cnVlKSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zb2xlLndhcm4oJ1tMaW50ZXJdIFVuYWJsZSB0byBnZXQgZWxlbWVudCBmb3IgbW91bnRlZCBtZXNzYWdlJywgbnVtYmVyLCBtZXNzYWdlKVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH1cblxuICAgIHJldHVybiAoPGxpbnRlci1tZXNzYWdlIGNsYXNzPXttZXNzYWdlLnNldmVyaXR5fT5cbiAgICAgIHsgZGVsZWdhdGUuc2hvd1Byb3ZpZGVyTmFtZSA/IGAke21lc3NhZ2UubGludGVyTmFtZX06IGAgOiAnJyB9XG4gICAgICA8c3BhbiBpZD17ZWxlbWVudElEfSBkYW5nZXJvdXNseVNldElubmVySFRNTD17IWlzRWxlbWVudCAmJiBtZXNzYWdlLmh0bWwgPyB7IF9faHRtbDogbWVzc2FnZS5odG1sIH0gOiBudWxsfT5cbiAgICAgICAgeyBtZXNzYWdlLnRleHQgfVxuICAgICAgPC9zcGFuPlxuICAgICAgeycgJ31cbiAgICAgIDxhIGhyZWY9XCIjXCIgb25DbGljaz17KCkgPT4gb3BlbkV4dGVybmFsbHkobWVzc2FnZSl9PlxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJpY29uIGljb24tbGluayBsaW50ZXItaWNvblwiIC8+XG4gICAgICA8L2E+XG4gICAgPC9saW50ZXItbWVzc2FnZT4pXG4gIH1cblxuICByZW5kZXJNdWx0aUxpbmUoKSB7XG4gICAgY29uc3QgeyBtZXNzYWdlLCBkZWxlZ2F0ZSB9ID0gdGhpcy5wcm9wc1xuXG4gICAgY29uc3QgdGV4dCA9IG1lc3NhZ2UudGV4dCA/IG1lc3NhZ2UudGV4dC5zcGxpdChORVdMSU5FKSA6IFtdXG4gICAgY29uc3QgY2h1bmtzID0gdGV4dC5tYXAoZW50cnkgPT4gZW50cnkudHJpbSgpKS5tYXAoKGVudHJ5LCBpbmRleCkgPT4gZW50cnkubGVuZ3RoICYmIDxzcGFuIGNsYXNzTmFtZT17aW5kZXggIT09IDAgJiYgJ2xpbnRlci1saW5lJ30+e2VudHJ5fTwvc3Bhbj4pLmZpbHRlcihlID0+IGUpXG5cbiAgICByZXR1cm4gKDxsaW50ZXItbWVzc2FnZSBjbGFzcz17bWVzc2FnZS5zZXZlcml0eX0+XG4gICAgICA8YSBocmVmPVwiI1wiIG9uQ2xpY2s9eygpID0+IHRoaXMuc2V0U3RhdGUoeyBtdWx0aUxpbmVTaG93OiAhdGhpcy5zdGF0ZS5tdWx0aUxpbmVTaG93IH0pfT5cbiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPXtgaWNvbiBsaW50ZXItaWNvbiBpY29uLSR7dGhpcy5zdGF0ZS5tdWx0aUxpbmVTaG93ID8gJ2NoZXZyb24tZG93bicgOiAnY2hldnJvbi1yaWdodCd9YH0gLz5cbiAgICAgIDwvYT5cbiAgICAgIHsgZGVsZWdhdGUuc2hvd1Byb3ZpZGVyTmFtZSA/IGAke21lc3NhZ2UubGludGVyTmFtZX06IGAgOiAnJyB9XG4gICAgICB7IGNodW5rc1swXSB9XG4gICAgICB7JyAnfVxuICAgICAgeyB0aGlzLnN0YXRlLm11bHRpTGluZVNob3cgJiYgY2h1bmtzLnNsaWNlKDEpIH1cbiAgICA8L2xpbnRlci1tZXNzYWdlPilcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IE1lc3NhZ2VFbGVtZW50XG4iXX0=