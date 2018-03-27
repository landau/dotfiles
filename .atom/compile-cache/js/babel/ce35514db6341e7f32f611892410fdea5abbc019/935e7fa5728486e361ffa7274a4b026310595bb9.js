Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _marked = require('marked');

var _marked2 = _interopRequireDefault(_marked);

var _helpers = require('../helpers');

var MessageElement = (function (_React$Component) {
  _inherits(MessageElement, _React$Component);

  function MessageElement() {
    _classCallCheck(this, MessageElement);

    _get(Object.getPrototypeOf(MessageElement.prototype), 'constructor', this).apply(this, arguments);

    this.state = {
      description: '',
      descriptionShow: false
    };
    this.descriptionLoading = false;
  }

  _createClass(MessageElement, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this = this;

      this.props.delegate.onShouldUpdate(function () {
        _this.setState({});
      });
      this.props.delegate.onShouldExpand(function () {
        if (!_this.state.descriptionShow) {
          _this.toggleDescription();
        }
      });
      this.props.delegate.onShouldCollapse(function () {
        if (_this.state.descriptionShow) {
          _this.toggleDescription();
        }
      });
    }
  }, {
    key: 'toggleDescription',
    value: function toggleDescription() {
      var _this2 = this;

      var result = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

      var newStatus = !this.state.descriptionShow;
      var description = this.state.description || this.props.message.description;

      if (!newStatus && !result) {
        this.setState({ descriptionShow: false });
        return;
      }
      if (typeof description === 'string' || result) {
        var descriptionToUse = (0, _marked2['default'])(result || description);
        this.setState({ descriptionShow: true, description: descriptionToUse });
      } else if (typeof description === 'function') {
        this.setState({ descriptionShow: true });
        if (this.descriptionLoading) {
          return;
        }
        this.descriptionLoading = true;
        new Promise(function (resolve) {
          resolve(description());
        }).then(function (response) {
          if (typeof response !== 'string') {
            throw new Error('Expected result to be string, got: ' + typeof response);
          }
          _this2.toggleDescription(response);
        })['catch'](function (error) {
          console.log('[Linter] Error getting descriptions', error);
          _this2.descriptionLoading = false;
          if (_this2.state.descriptionShow) {
            _this2.toggleDescription();
          }
        });
      } else {
        console.error('[Linter] Invalid description detected, expected string or function but got:', typeof description);
      }
    }
  }, {
    key: 'render',
    value: function render() {
      var _this3 = this;

      var _props = this.props;
      var message = _props.message;
      var delegate = _props.delegate;

      return _react2['default'].createElement(
        'linter-message',
        { 'class': message.severity },
        message.description && _react2['default'].createElement(
          'a',
          { href: '#', onClick: function () {
              return _this3.toggleDescription();
            } },
          _react2['default'].createElement('span', { className: 'icon linter-icon icon-' + (this.state.descriptionShow ? 'chevron-down' : 'chevron-right') })
        ),
        _react2['default'].createElement(
          'linter-excerpt',
          null,
          delegate.showProviderName ? message.linterName + ': ' : '',
          message.excerpt
        ),
        ' ',
        message.reference && message.reference.file && _react2['default'].createElement(
          'a',
          { href: '#', onClick: function () {
              return (0, _helpers.visitMessage)(message, true);
            } },
          _react2['default'].createElement('span', { className: 'icon linter-icon icon-alignment-aligned-to' })
        ),
        _react2['default'].createElement(
          'a',
          { href: '#', onClick: function () {
              return (0, _helpers.openExternally)(message);
            } },
          _react2['default'].createElement('span', { className: 'icon linter-icon icon-link' })
        ),
        this.state.descriptionShow && _react2['default'].createElement('div', { dangerouslySetInnerHTML: { __html: this.state.description || 'Loading...' }, 'class': 'linter-line' })
      );
    }
  }]);

  return MessageElement;
})(_react2['default'].Component);

exports['default'] = MessageElement;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci11aS1kZWZhdWx0L2xpYi90b29sdGlwL21lc3NhZ2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7cUJBRWtCLE9BQU87Ozs7c0JBQ04sUUFBUTs7Ozt1QkFFa0IsWUFBWTs7SUFJcEMsY0FBYztZQUFkLGNBQWM7O1dBQWQsY0FBYzswQkFBZCxjQUFjOzsrQkFBZCxjQUFjOztTQUtqQyxLQUFLLEdBR0Q7QUFDRixpQkFBVyxFQUFFLEVBQUU7QUFDZixxQkFBZSxFQUFFLEtBQUs7S0FDdkI7U0FDRCxrQkFBa0IsR0FBWSxLQUFLOzs7ZUFaaEIsY0FBYzs7V0FjaEIsNkJBQUc7OztBQUNsQixVQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsWUFBTTtBQUN2QyxjQUFLLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQTtPQUNsQixDQUFDLENBQUE7QUFDRixVQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsWUFBTTtBQUN2QyxZQUFJLENBQUMsTUFBSyxLQUFLLENBQUMsZUFBZSxFQUFFO0FBQy9CLGdCQUFLLGlCQUFpQixFQUFFLENBQUE7U0FDekI7T0FDRixDQUFDLENBQUE7QUFDRixVQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxZQUFNO0FBQ3pDLFlBQUksTUFBSyxLQUFLLENBQUMsZUFBZSxFQUFFO0FBQzlCLGdCQUFLLGlCQUFpQixFQUFFLENBQUE7U0FDekI7T0FDRixDQUFDLENBQUE7S0FDSDs7O1dBQ2dCLDZCQUF5Qjs7O1VBQXhCLE1BQWUseURBQUcsSUFBSTs7QUFDdEMsVUFBTSxTQUFTLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQTtBQUM3QyxVQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsSUFBSSxJQUFJLENBQUMs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RUFBRSxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsSUFBSSxZQUFZLEVBQUUsQUFBQyxFQUFDLFNBQU0sYUFBYSxHQUFPLEFBQzdHO09BQ2MsQ0FBQztLQUNuQjs7O1NBekZrQixjQUFjO0dBQVMsbUJBQU0sU0FBUzs7cUJBQXRDLGNBQWMiLCJmaWxlIjoiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvbGludGVyLXVpLWRlZmF1bHQvbGliL3Rvb2x0aXAvbWVzc2FnZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIEBmbG93ICovXG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCdcbmltcG9ydCBtYXJrZWQgZnJvbSAnbWFya2VkJ1xuXG5pbXBvcnQgeyB2aXNpdE1lc3NhZ2UsIG9wZW5FeHRlcm5hbGx5IH0gZnJvbSAnLi4vaGVscGVycydcbmltcG9ydCB0eXBlIFRvb2x0aXBEZWxlZ2F0ZSBmcm9tICcuL2RlbGVnYXRlJ1xuaW1wb3J0IHR5cGUgeyBNZXNzYWdlIH0gZnJvbSAnLi4vdHlwZXMnXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1lc3NhZ2VFbGVtZW50IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgcHJvcHM6IHtcbiAgICBtZXNzYWdlOiBNZXNzYWdlLFxuICAgIGRlbGVnYXRlOiBUb29sdGlwRGVsZWdhdGUsXG4gIH07XG4gIHN0YXRlOiB7XG4gICAgZGVzY3JpcHRpb246IHN0cmluZyxcbiAgICBkZXNjcmlwdGlvblNob3c6IGJvb2xlYW4sXG4gIH0gPSB7XG4gICAgZGVzY3JpcHRpb246ICcnLFxuICAgIGRlc2NyaXB0aW9uU2hvdzogZmFsc2UsXG4gIH07XG4gIGRlc2NyaXB0aW9uTG9hZGluZzogYm9vbGVhbiA9IGZhbHNlO1xuXG4gIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgIHRoaXMucHJvcHMuZGVsZWdhdGUub25TaG91bGRVcGRhdGUoKCkgPT4ge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7fSlcbiAgICB9KVxuICAgIHRoaXMucHJvcHMuZGVsZWdhdGUub25TaG91bGRFeHBhbmQoKCkgPT4ge1xuICAgICAgaWYgKCF0aGlzLnN0YXRlLmRlc2NyaXB0aW9uU2hvdykge1xuICAgICAgICB0aGlzLnRvZ2dsZURlc2NyaXB0aW9uKClcbiAgICAgIH1cbiAgICB9KVxuICAgIHRoaXMucHJvcHMuZGVsZWdhdGUub25TaG91bGRDb2xsYXBzZSgoKSA9PiB7XG4gICAgICBpZiAodGhpcy5zdGF0ZS5kZXNjcmlwdGlvblNob3cpIHtcbiAgICAgICAgdGhpcy50b2dnbGVEZXNjcmlwdGlvbigpXG4gICAgICB9XG4gICAgfSlcbiAgfVxuICB0b2dnbGVEZXNjcmlwdGlvbihyZXN1bHQ6ID9zdHJpbmcgPSBudWxsKSB7XG4gICAgY29uc3QgbmV3U3RhdHVzID0gIXRoaXMuc3RhdGUuZGVzY3JpcHRpb25TaG93XG4gICAgY29uc3QgZGVzY3JpcHRpb24gPSB0aGlzLnN0YXRlLmRlc2NyaXB0aW9uIHx8IHRoaXMucHJvcHMubWVzc2FnZS5kZXNjcmlwdGlvblxuXG4gICAgaWYgKCFuZXdTdGF0dXMgJiYgIXJlc3VsdCkge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7IGRlc2NyaXB0aW9uU2hvdzogZmFsc2UgfSlcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBpZiAodHlwZW9mIGRlc2NyaXB0aW9uID09PSAnc3RyaW5nJyB8fCByZXN1bHQpIHtcbiAgICAgIGNvbnN0IGRlc2NyaXB0aW9uVG9Vc2UgPSBtYXJrZWQocmVzdWx0IHx8IGRlc2NyaXB0aW9uKVxuICAgICAgdGhpcy5zZXRTdGF0ZSh7IGRlc2NyaXB0aW9uU2hvdzogdHJ1ZSwgZGVzY3JpcHRpb246IGRlc2NyaXB0aW9uVG9Vc2UgfSlcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBkZXNjcmlwdGlvbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7IGRlc2NyaXB0aW9uU2hvdzogdHJ1ZSB9KVxuICAgICAgaWYgKHRoaXMuZGVzY3JpcHRpb25Mb2FkaW5nKSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgdGhpcy5kZXNjcmlwdGlvbkxvYWRpbmcgPSB0cnVlXG4gICAgICBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlKSB7IHJlc29sdmUoZGVzY3JpcHRpb24oKSkgfSlcbiAgICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgICAgaWYgKHR5cGVvZiByZXNwb25zZSAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgRXhwZWN0ZWQgcmVzdWx0IHRvIGJlIHN0cmluZywgZ290OiAke3R5cGVvZiByZXNwb25zZX1gKVxuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLnRvZ2dsZURlc2NyaXB0aW9uKHJlc3BvbnNlKVxuICAgICAgICB9KVxuICAgICAgICAuY2F0Y2goKGVycm9yKSA9PiB7XG4gICAgICAgICAgY29uc29sZS5sb2coJ1tMaW50ZXJdIEVycm9yIGdldHRpbmcgZGVzY3JpcHRpb25zJywgZXJyb3IpXG4gICAgICAgICAgdGhpcy5kZXNjcmlwdGlvbkxvYWRpbmcgPSBmYWxzZVxuICAgICAgICAgIGlmICh0aGlzLnN0YXRlLmRlc2NyaXB0aW9uU2hvdykge1xuICAgICAgICAgICAgdGhpcy50b2dnbGVEZXNjcmlwdGlvbigpXG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdbTGludGVyXSBJbnZhbGlkIGRlc2NyaXB0aW9uIGRldGVjdGVkLCBleHBlY3RlZCBzdHJpbmcgb3IgZnVuY3Rpb24gYnV0IGdvdDonLCB0eXBlb2YgZGVzY3JpcHRpb24pXG4gICAgfVxuICB9XG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCB7IG1lc3NhZ2UsIGRlbGVnYXRlIH0gPSB0aGlzLnByb3BzXG5cbiAgICByZXR1cm4gKDxsaW50ZXItbWVzc2FnZSBjbGFzcz17bWVzc2FnZS5zZXZlcml0eX0+XG4gICAgICB7IG1lc3NhZ2UuZGVzY3JpcHRpb24gJiYgKFxuICAgICAgICA8YSBocmVmPVwiI1wiIG9uQ2xpY2s9eygpID0+IHRoaXMudG9nZ2xlRGVzY3JpcHRpb24oKX0+XG4gICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPXtgaWNvbiBsaW50ZXItaWNvbiBpY29uLSR7dGhpcy5zdGF0ZS5kZXNjcmlwdGlvblNob3cgPyAnY2hldnJvbi1kb3duJyA6ICdjaGV2cm9uLXJpZ2h0J31gfT48L3NwYW4+XG4gICAgICAgIDwvYT5cbiAgICAgICl9XG4gICAgICA8bGludGVyLWV4Y2VycHQ+XG4gICAgICAgIHsgZGVsZWdhdGUuc2hvd1Byb3ZpZGVyTmFtZSA/IGAke21lc3NhZ2UubGludGVyTmFtZX06IGAgOiAnJyB9XG4gICAgICAgIHsgbWVzc2FnZS5leGNlcnB0IH1cbiAgICAgIDwvbGludGVyLWV4Y2VycHQ+eycgJ31cbiAgICAgIHsgbWVzc2FnZS5yZWZlcmVuY2UgJiYgbWVzc2FnZS5yZWZlcmVuY2UuZmlsZSAmJiAoXG4gICAgICAgIDxhIGhyZWY9XCIjXCIgb25DbGljaz17KCkgPT4gdmlzaXRNZXNzYWdlKG1lc3NhZ2UsIHRydWUpfT5cbiAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJpY29uIGxpbnRlci1pY29uIGljb24tYWxpZ25tZW50LWFsaWduZWQtdG9cIj48L3NwYW4+XG4gICAgICAgIDwvYT5cbiAgICAgICl9XG4gICAgICA8YSBocmVmPVwiI1wiIG9uQ2xpY2s9eygpID0+IG9wZW5FeHRlcm5hbGx5KG1lc3NhZ2UpfT5cbiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiaWNvbiBsaW50ZXItaWNvbiBpY29uLWxpbmtcIj48L3NwYW4+XG4gICAgICA8L2E+XG4gICAgICB7IHRoaXMuc3RhdGUuZGVzY3JpcHRpb25TaG93ICYmIChcbiAgICAgICAgPGRpdiBkYW5nZXJvdXNseVNldElubmVySFRNTD17eyBfX2h0bWw6IHRoaXMuc3RhdGUuZGVzY3JpcHRpb24gfHwgJ0xvYWRpbmcuLi4nIH19IGNsYXNzPVwibGludGVyLWxpbmVcIj48L2Rpdj5cbiAgICAgICkgfVxuICAgIDwvbGludGVyLW1lc3NhZ2U+KVxuICB9XG59XG4iXX0=