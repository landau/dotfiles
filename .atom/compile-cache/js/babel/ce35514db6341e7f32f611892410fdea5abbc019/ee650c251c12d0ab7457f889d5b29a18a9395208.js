var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _url = require('url');

var url = _interopRequireWildcard(_url);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _marked = require('marked');

var _marked2 = _interopRequireDefault(_marked);

var _helpers = require('../helpers');

function findHref(el) {
  while (el && !el.classList.contains('linter-line')) {
    if (el instanceof HTMLAnchorElement) {
      return el.href;
    }
    el = el.parentElement;
  }
  return null;
}

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

    this.openFile = function (ev) {
      if (!(ev.target instanceof HTMLElement)) {
        return;
      }
      var href = findHref(ev.target);
      if (!href) {
        return;
      }
      // parse the link. e.g. atom://linter?file=<path>&row=<number>&column=<number>

      var _url$parse = url.parse(href, true);

      var protocol = _url$parse.protocol;
      var hostname = _url$parse.hostname;
      var query = _url$parse.query;

      var file = query && query.file;
      if (protocol !== 'atom:' || hostname !== 'linter' || !file) {
        return;
      }
      var row = query && query.row ? parseInt(query.row, 10) : 0;
      var column = query && query.column ? parseInt(query.column, 10) : 0;
      (0, _helpers.openFile)(file, { row: row, column: column });
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
        { 'class': message.severity, onClick: this.openFile },
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
        message.url && _react2['default'].createElement(
          'a',
          { href: '#', onClick: function () {
              return (0, _helpers.openExternally)(message);
            } },
          _react2['default'].createElement('span', { className: 'icon linter-icon icon-link' })
        ),
        this.state.descriptionShow && _react2['default'].createElement('div', { dangerouslySetInnerHTML: { __html: this.state.description || 'Loading...' }, className: 'linter-line' })
      );
    }
  }]);

  return MessageElement;
})(_react2['default'].Component);

module.exports = MessageElement;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1Ly5hdG9tL3BhY2thZ2VzL2xpbnRlci11aS1kZWZhdWx0L2xpYi90b29sdGlwL21lc3NhZ2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O21CQUVxQixLQUFLOztJQUFkLEdBQUc7O3FCQUNHLE9BQU87Ozs7c0JBQ04sUUFBUTs7Ozt1QkFFNEIsWUFBWTs7QUFJbkUsU0FBUyxRQUFRLENBQUMsRUFBWSxFQUFXO0FBQ3ZDLFNBQU8sRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLEVBQUU7QUFDbEQsUUFBSSxFQUFFLFlBQVksaUJBQWlCLEVBQUU7QUFDbkMsYUFBTyxFQUFFLENBQUMsSUFBSSxDQUFBO0tBQ2Y7QUFDRCxNQUFFLEdBQUcsRUFBRSxDQUFDLGFBQWEsQ0FBQTtHQUN0QjtBQUNELFNBQU8sSUFBSSxDQUFBO0NBQ1o7O0lBRUssY0FBYztZQUFkLGNBQWM7O1dBQWQsY0FBYzswQkFBZCxjQUFjOzsrQkFBZCxjQUFjOztTQUtsQixLQUFLLEdBR0Q7QUFDRixpQkFBVyxFQUFFLEVBQUU7QUFDZixxQkFBZSxFQUFFLEtBQUs7S0FDdkI7U0FDRCxrQkFBa0IsR0FBWSxLQUFLOztTQW9EbkMsUUFBUSxHQUFHLFVBQUMsRUFBRSxFQUFZO0FBQ3hCLFVBQUksRUFBRSxFQUFFLENBQUMsTUFBTSxZQUFZLFdBQVcsQ0FBQSxBQUFDLEVBQUU7QUFDdkMsZUFBTTtPQUNQO0FBQ0QsVUFBTSxJQUFJLEdBQUcsUUFBUSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQTtBQUNoQyxVQUFJLENBQUMsSUFBSSxFQUFFO0FBQ1QsZUFBTTtPQUNQOzs7dUJBRXFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQzs7VUFBbkQsUUFBUSxjQUFSLFFBQVE7VUFBRSxRQUFRLGNBQVIsUUFBUTtVQUFFLEtBQUssY0FBTCxLQUFLOztBQUNqQyxVQUFN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QUMsR0FBRyxFQUFDLE9BQU8sRUFBRTtxQkFBTSw2QkFBZSxPQUFPLENBQUM7YUFBQSxBQUFDO1VBQ2xFLDJDQUFNLFNBQVMsRUFBQyw0QkFBNEIsR0FBRztTQUM3QztRQUNGLElBQUksQ0FBQyxLQUFLLENBQUMsZUFBZSxJQUMxQiwwQ0FBSyx1QkFBdUIsRUFBRSxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsSUFBSSxZQUFZLEVBQUUsQUFBQyxFQUFDLFNBQVMsRUFBQyxhQUFhLEdBQUcsQUFDN0c7T0FDYyxDQUFDO0tBQ25COzs7U0EzR0csY0FBYztHQUFTLG1CQUFNLFNBQVM7O0FBOEc1QyxNQUFNLENBQUMsT0FBTyxHQUFHLGNBQWMsQ0FBQSIsImZpbGUiOiIvVXNlcnMvdGxhbmRhdS8uYXRvbS9wYWNrYWdlcy9saW50ZXItdWktZGVmYXVsdC9saWIvdG9vbHRpcC9tZXNzYWdlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogQGZsb3cgKi9cblxuaW1wb3J0ICogYXMgdXJsIGZyb20gJ3VybCdcbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCdcbmltcG9ydCBtYXJrZWQgZnJvbSAnbWFya2VkJ1xuXG5pbXBvcnQgeyB2aXNpdE1lc3NhZ2UsIG9wZW5FeHRlcm5hbGx5LCBvcGVuRmlsZSB9IGZyb20gJy4uL2hlbHBlcnMnXG5pbXBvcnQgdHlwZSBUb29sdGlwRGVsZWdhdGUgZnJvbSAnLi9kZWxlZ2F0ZSdcbmltcG9ydCB0eXBlIHsgTWVzc2FnZSB9IGZyb20gJy4uL3R5cGVzJ1xuXG5mdW5jdGlvbiBmaW5kSHJlZihlbDogP0VsZW1lbnQpOiA/c3RyaW5nIHtcbiAgd2hpbGUgKGVsICYmICFlbC5jbGFzc0xpc3QuY29udGFpbnMoJ2xpbnRlci1saW5lJykpIHtcbiAgICBpZiAoZWwgaW5zdGFuY2VvZiBIVE1MQW5jaG9yRWxlbWVudCkge1xuICAgICAgcmV0dXJuIGVsLmhyZWZcbiAgICB9XG4gICAgZWwgPSBlbC5wYXJlbnRFbGVtZW50XG4gIH1cbiAgcmV0dXJuIG51bGxcbn1cblxuY2xhc3MgTWVzc2FnZUVsZW1lbnQgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBwcm9wczoge1xuICAgIG1lc3NhZ2U6IE1lc3NhZ2UsXG4gICAgZGVsZWdhdGU6IFRvb2x0aXBEZWxlZ2F0ZSxcbiAgfTtcbiAgc3RhdGU6IHtcbiAgICBkZXNjcmlwdGlvbjogc3RyaW5nLFxuICAgIGRlc2NyaXB0aW9uU2hvdzogYm9vbGVhbixcbiAgfSA9IHtcbiAgICBkZXNjcmlwdGlvbjogJycsXG4gICAgZGVzY3JpcHRpb25TaG93OiBmYWxzZSxcbiAgfTtcbiAgZGVzY3JpcHRpb25Mb2FkaW5nOiBib29sZWFuID0gZmFsc2U7XG5cbiAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgdGhpcy5wcm9wcy5kZWxlZ2F0ZS5vblNob3VsZFVwZGF0ZSgoKSA9PiB7XG4gICAgICB0aGlzLnNldFN0YXRlKHt9KVxuICAgIH0pXG4gICAgdGhpcy5wcm9wcy5kZWxlZ2F0ZS5vblNob3VsZEV4cGFuZCgoKSA9PiB7XG4gICAgICBpZiAoIXRoaXMuc3RhdGUuZGVzY3JpcHRpb25TaG93KSB7XG4gICAgICAgIHRoaXMudG9nZ2xlRGVzY3JpcHRpb24oKVxuICAgICAgfVxuICAgIH0pXG4gICAgdGhpcy5wcm9wcy5kZWxlZ2F0ZS5vblNob3VsZENvbGxhcHNlKCgpID0+IHtcbiAgICAgIGlmICh0aGlzLnN0YXRlLmRlc2NyaXB0aW9uU2hvdykge1xuICAgICAgICB0aGlzLnRvZ2dsZURlc2NyaXB0aW9uKClcbiAgICAgIH1cbiAgICB9KVxuICB9XG4gIHRvZ2dsZURlc2NyaXB0aW9uKHJlc3VsdDogP3N0cmluZyA9IG51bGwpIHtcbiAgICBjb25zdCBuZXdTdGF0dXMgPSAhdGhpcy5zdGF0ZS5kZXNjcmlwdGlvblNob3dcbiAgICBjb25zdCBkZXNjcmlwdGlvbiA9IHRoaXMuc3RhdGUuZGVzY3JpcHRpb24gfHwgdGhpcy5wcm9wcy5tZXNzYWdlLmRlc2NyaXB0aW9uXG5cbiAgICBpZiAoIW5ld1N0YXR1cyAmJiAhcmVzdWx0KSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHsgZGVzY3JpcHRpb25TaG93OiBmYWxzZSB9KVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGlmICh0eXBlb2YgZGVzY3JpcHRpb24gPT09ICdzdHJpbmcnIHx8IHJlc3VsdCkge1xuICAgICAgY29uc3QgZGVzY3JpcHRpb25Ub1VzZSA9IG1hcmtlZChyZXN1bHQgfHwgZGVzY3JpcHRpb24pXG4gICAgICB0aGlzLnNldFN0YXRlKHsgZGVzY3JpcHRpb25TaG93OiB0cnVlLCBkZXNjcmlwdGlvbjogZGVzY3JpcHRpb25Ub1VzZSB9KVxuICAgIH0gZWxzZSBpZiAodHlwZW9mIGRlc2NyaXB0aW9uID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHsgZGVzY3JpcHRpb25TaG93OiB0cnVlIH0pXG4gICAgICBpZiAodGhpcy5kZXNjcmlwdGlvbkxvYWRpbmcpIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICB0aGlzLmRlc2NyaXB0aW9uTG9hZGluZyA9IHRydWVcbiAgICAgIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUpIHsgcmVzb2x2ZShkZXNjcmlwdGlvbigpKSB9KVxuICAgICAgICAudGhlbigocmVzcG9uc2UpID0+IHtcbiAgICAgICAgICBpZiAodHlwZW9mIHJlc3BvbnNlICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBFeHBlY3RlZCByZXN1bHQgdG8gYmUgc3RyaW5nLCBnb3Q6ICR7dHlwZW9mIHJlc3BvbnNlfWApXG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMudG9nZ2xlRGVzY3JpcHRpb24ocmVzcG9uc2UpXG4gICAgICAgIH0pXG4gICAgICAgIC5jYXRjaCgoZXJyb3IpID0+IHtcbiAgICAgICAgICBjb25zb2xlLmxvZygnW0xpbnRlcl0gRXJyb3IgZ2V0dGluZyBkZXNjcmlwdGlvbnMnLCBlcnJvcilcbiAgICAgICAgICB0aGlzLmRlc2NyaXB0aW9uTG9hZGluZyA9IGZhbHNlXG4gICAgICAgICAgaWYgKHRoaXMuc3RhdGUuZGVzY3JpcHRpb25TaG93KSB7XG4gICAgICAgICAgICB0aGlzLnRvZ2dsZURlc2NyaXB0aW9uKClcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ1tMaW50ZXJdIEludmFsaWQgZGVzY3JpcHRpb24gZGV0ZWN0ZWQsIGV4cGVjdGVkIHN0cmluZyBvciBmdW5jdGlvbiBidXQgZ290OicsIHR5cGVvZiBkZXNjcmlwdGlvbilcbiAgICB9XG4gIH1cbiAgb3BlbkZpbGUgPSAoZXY6IEV2ZW50KSA9PiB7XG4gICAgaWYgKCEoZXYudGFyZ2V0IGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgY29uc3QgaHJlZiA9IGZpbmRIcmVmKGV2LnRhcmdldClcbiAgICBpZiAoIWhyZWYpIHtcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICAvLyBwYXJzZSB0aGUgbGluay4gZS5nLiBhdG9tOi8vbGludGVyP2ZpbGU9PHBhdGg+JnJvdz08bnVtYmVyPiZjb2x1bW49PG51bWJlcj5cbiAgICBjb25zdCB7IHByb3RvY29sLCBob3N0bmFtZSwgcXVlcnkgfSA9IHVybC5wYXJzZShocmVmLCB0cnVlKVxuICAgIGNvbnN0IGZpbGUgPSBxdWVyeSAmJiBxdWVyeS5maWxlXG4gICAgaWYgKHByb3RvY29sICE9PSAnYXRvbTonIHx8IGhvc3RuYW1lICE9PSAnbGludGVyJyB8fCAhZmlsZSkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGNvbnN0IHJvdyA9IHF1ZXJ5ICYmIHF1ZXJ5LnJvdyA/IHBhcnNlSW50KHF1ZXJ5LnJvdywgMTApIDogMFxuICAgIGNvbnN0IGNvbHVtbiA9IHF1ZXJ5ICYmIHF1ZXJ5LmNvbHVtbiA/IHBhcnNlSW50KHF1ZXJ5LmNvbHVtbiwgMTApIDogMFxuICAgIG9wZW5GaWxlKGZpbGUsIHsgcm93LCBjb2x1bW4gfSlcbiAgfVxuICByZW5kZXIoKSB7XG4gICAgY29uc3QgeyBtZXNzYWdlLCBkZWxlZ2F0ZSB9ID0gdGhpcy5wcm9wc1xuXG4gICAgcmV0dXJuICg8bGludGVyLW1lc3NhZ2UgY2xhc3M9e21lc3NhZ2Uuc2V2ZXJpdHl9IG9uQ2xpY2s9e3RoaXMub3BlbkZpbGV9PlxuICAgICAgeyBtZXNzYWdlLmRlc2NyaXB0aW9uICYmIChcbiAgICAgICAgPGEgaHJlZj1cIiNcIiBvbkNsaWNrPXsoKSA9PiB0aGlzLnRvZ2dsZURlc2NyaXB0aW9uKCl9PlxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT17YGljb24gbGludGVyLWljb24gaWNvbi0ke3RoaXMuc3RhdGUuZGVzY3JpcHRpb25TaG93ID8gJ2NoZXZyb24tZG93bicgOiAnY2hldnJvbi1yaWdodCd9YH0gLz5cbiAgICAgICAgPC9hPlxuICAgICAgKX1cbiAgICAgIDxsaW50ZXItZXhjZXJwdD5cbiAgICAgICAgeyBkZWxlZ2F0ZS5zaG93UHJvdmlkZXJOYW1lID8gYCR7bWVzc2FnZS5saW50ZXJOYW1lfTogYCA6ICcnIH1cbiAgICAgICAgeyBtZXNzYWdlLmV4Y2VycHQgfVxuICAgICAgPC9saW50ZXItZXhjZXJwdD57JyAnfVxuICAgICAgeyBtZXNzYWdlLnJlZmVyZW5jZSAmJiBtZXNzYWdlLnJlZmVyZW5jZS5maWxlICYmIChcbiAgICAgICAgPGEgaHJlZj1cIiNcIiBvbkNsaWNrPXsoKSA9PiB2aXNpdE1lc3NhZ2UobWVzc2FnZSwgdHJ1ZSl9PlxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImljb24gbGludGVyLWljb24gaWNvbi1hbGlnbm1lbnQtYWxpZ25lZC10b1wiIC8+XG4gICAgICAgIDwvYT5cbiAgICAgICl9XG4gICAgICB7IG1lc3NhZ2UudXJsICYmIDxhIGhyZWY9XCIjXCIgb25DbGljaz17KCkgPT4gb3BlbkV4dGVybmFsbHkobWVzc2FnZSl9PlxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJpY29uIGxpbnRlci1pY29uIGljb24tbGlua1wiIC8+XG4gICAgICA8L2E+fVxuICAgICAgeyB0aGlzLnN0YXRlLmRlc2NyaXB0aW9uU2hvdyAmJiAoXG4gICAgICAgIDxkaXYgZGFuZ2Vyb3VzbHlTZXRJbm5lckhUTUw9e3sgX19odG1sOiB0aGlzLnN0YXRlLmRlc2NyaXB0aW9uIHx8ICdMb2FkaW5nLi4uJyB9fSBjbGFzc05hbWU9XCJsaW50ZXItbGluZVwiIC8+XG4gICAgICApIH1cbiAgICA8L2xpbnRlci1tZXNzYWdlPilcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IE1lc3NhZ2VFbGVtZW50XG4iXX0=