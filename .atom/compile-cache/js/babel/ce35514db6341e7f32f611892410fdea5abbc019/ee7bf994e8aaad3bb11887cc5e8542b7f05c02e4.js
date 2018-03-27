var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _sbReactTable = require('sb-react-table');

var _sbReactTable2 = _interopRequireDefault(_sbReactTable);

var _reactResizableBox = require('react-resizable-box');

var _reactResizableBox2 = _interopRequireDefault(_reactResizableBox);

var _helpers = require('../helpers');

var PanelComponent = (function (_React$Component) {
  _inherits(PanelComponent, _React$Component);

  function PanelComponent(props, context) {
    var _this = this;

    _classCallCheck(this, PanelComponent);

    _get(Object.getPrototypeOf(PanelComponent.prototype), 'constructor', this).call(this, props, context);

    this.onClick = function (e, row) {
      if (process.platform === 'darwin' ? e.metaKey : e.ctrlKey) {
        if (e.shiftKey) {
          (0, _helpers.openExternally)(row);
        } else {
          (0, _helpers.visitMessage)(row, true);
        }
      } else {
        (0, _helpers.visitMessage)(row);
      }
    };

    this.onResize = function (direction, size) {
      _this.setState({ tempHeight: size.height });
    };

    this.onResizeStop = function (direction, size) {
      _this.props.delegate.updatePanelHeight(size.height);
    };

    this.state = {
      messages: this.props.delegate.filteredMessages,
      visibility: this.props.delegate.visibility,
      tempHeight: null
    };
  }

  _createClass(PanelComponent, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this2 = this;

      this.props.delegate.onDidChangeMessages(function (messages) {
        _this2.setState({ messages: messages });
      });
      this.props.delegate.onDidChangeVisibility(function (visibility) {
        _this2.setState({ visibility: visibility });
      });
      this.props.delegate.onDidChangePanelConfig(function () {
        _this2.setState({ tempHeight: null });
      });
    }
  }, {
    key: 'render',
    value: function render() {
      var delegate = this.props.delegate;

      var columns = [{ key: 'severity', label: 'Severity', sortable: true }, { key: 'linterName', label: 'Provider', sortable: true }, { key: 'excerpt', label: 'Description', onClick: this.onClick }, { key: 'line', label: 'Line', sortable: true, onClick: this.onClick }];
      if (delegate.panelRepresents === 'Entire Project') {
        columns.push({ key: 'file', label: 'File', sortable: true, onClick: this.onClick });
      }

      var height = undefined;
      var customStyle = { overflowY: 'scroll' };
      if (this.state.tempHeight) {
        height = this.state.tempHeight;
      } else if (delegate.panelTakesMinimumHeight) {
        height = 'auto';
        customStyle.maxHeight = delegate.panelHeight;
      } else {
        height = delegate.panelHeight;
      }
      delegate.setPanelVisibility(this.state.visibility && (!delegate.panelTakesMinimumHeight || !!this.state.messages.length));

      return _react2['default'].createElement(
        _reactResizableBox2['default'],
        { isResizable: { top: true }, onResize: this.onResize, onResizeStop: this.onResizeStop, height: height, width: 'auto', customStyle: customStyle },
        _react2['default'].createElement(
          'div',
          { id: 'linter-panel', tabIndex: '-1' },
          _react2['default'].createElement(_sbReactTable2['default'], {
            rows: this.state.messages,
            columns: columns,

            initialSort: [{ column: 'severity', type: 'desc' }, { column: 'file', type: 'asc' }, { column: 'line', type: 'asc' }],
            sort: _helpers.sortMessages,
            rowKey: function (i) {
              return i.key;
            },

            renderHeaderColumn: function (i) {
              return i.label;
            },
            renderBodyColumn: PanelComponent.renderRowColumn,

            style: { width: '100%' },
            className: 'linter'
          })
        )
      );
    }
  }], [{
    key: 'renderRowColumn',
    value: function renderRowColumn(row, column) {
      var range = (0, _helpers.$range)(row);

      switch (column) {
        case 'file':
          return (0, _helpers.getPathOfMessage)(row);
        case 'line':
          return range ? range.start.row + 1 + ':' + (range.start.column + 1) : '';
        case 'excerpt':
          if (row.version === 1) {
            if (row.html) {
              return _react2['default'].createElement('span', { dangerouslySetInnerHTML: { __html: row.html } });
            }
            return row.text || '';
          }
          return row.excerpt;
        case 'severity':
          return _helpers.severityNames[row.severity];
        default:
          return row[column];
      }
    }
  }]);

  return PanelComponent;
})(_react2['default'].Component);

module.exports = PanelComponent;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci11aS1kZWZhdWx0L2xpYi9wYW5lbC9jb21wb25lbnQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztxQkFFa0IsT0FBTzs7Ozs0QkFDRixnQkFBZ0I7Ozs7aUNBQ2QscUJBQXFCOzs7O3VCQUNzRCxZQUFZOztJQUkxRyxjQUFjO1lBQWQsY0FBYzs7QUFTUCxXQVRQLGNBQWMsQ0FTTixLQUFhLEVBQUUsT0FBZ0IsRUFBRTs7OzBCQVR6QyxjQUFjOztBQVVoQiwrQkFWRSxjQUFjLDZDQVVWLEtBQUssRUFBRSxPQUFPLEVBQUM7O1NBa0J2QixPQUFPLEdBQUcsVUFBQyxDQUFDLEVBQWMsR0FBRyxFQUFvQjtBQUMvQyxVQUFJLE9BQU8sQ0FBQyxRQUFRLEtBQUssUUFBUSxHQUFHLENBQUMsQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDLE9BQU8sRUFBRTtBQUN6RCxZQUFJLENBQUMsQ0FBQyxRQUFRLEVBQUU7QUFDZCx1Q0FBZSxHQUFHLENBQUMsQ0FBQTtTQUNwQixNQUFNO0FBQ0wscUNBQWEsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFBO1NBQ3hCO09BQ0YsTUFBTTtBQUNMLG1DQUFhLEdBQUcsQ0FBQyxDQUFBO09BQ2xCO0tBQ0Y7O1NBQ0QsUUFBUSxHQUFHLFVBQUMsU0FBUyxFQUFTLElBQUksRUFBd0M7QUFDeEUsWUFBSyxRQUFRLENBQUMsRUFBRSxVQUFVLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUE7S0FDM0M7O1NBQ0QsWUFBWSxHQUFHLFVBQUMsU0FBUyxFQUFTLElBQUksRUFBd0M7QUFDNUUsWUFBSyxLQUFLLENBQUMsUUFBUSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQTtLQUNuRDs7QUFqQ0MsUUFBSSxDQUFDLEtBQUssR0FBRztBQUNYLGNBQVEsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEs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LEVBQUU7QUFDckIsZ0JBQUksR0FBRyxDQUFDLElBQUksRUFBRTtBQUNaLHFCQUFPLDJDQUFNLHVCQUF1QixFQUFFLEVBQUUsTUFBTSxFQUFFLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQUFBQyxHQUFHLENBQUE7YUFDL0Q7QUFDRCxtQkFBTyxHQUFHLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQTtXQUN0QjtBQUNELGlCQUFPLEdBQUcsQ0FBQyxPQUFPLENBQUE7QUFBQSxBQUNwQixhQUFLLFVBQVU7QUFDYixpQkFBTyx1QkFBYyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUE7QUFBQSxBQUNwQztBQUNFLGlCQUFPLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQTtBQUFBLE9BQ3JCO0tBQ0Y7OztTQS9HRyxjQUFjO0dBQVMsbUJBQU0sU0FBUzs7QUFrSDVDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsY0FBYyxDQUFBIiwiZmlsZSI6Ii9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci11aS1kZWZhdWx0L2xpYi9wYW5lbC9jb21wb25lbnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBAZmxvdyAqL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnXG5pbXBvcnQgUmVhY3RUYWJsZSBmcm9tICdzYi1yZWFjdC10YWJsZSdcbmltcG9ydCBSZXNpemFibGVCb3ggZnJvbSAncmVhY3QtcmVzaXphYmxlLWJveCdcbmltcG9ydCB7ICRyYW5nZSwgc2V2ZXJpdHlOYW1lcywgc29ydE1lc3NhZ2VzLCB2aXNpdE1lc3NhZ2UsIG9wZW5FeHRlcm5hbGx5LCBnZXRQYXRoT2ZNZXNzYWdlIH0gZnJvbSAnLi4vaGVscGVycydcbmltcG9ydCB0eXBlIERlbGVnYXRlIGZyb20gJy4vZGVsZWdhdGUnXG5pbXBvcnQgdHlwZSB7IExpbnRlck1lc3NhZ2UgfSBmcm9tICcuLi90eXBlcydcblxuY2xhc3MgUGFuZWxDb21wb25lbnQgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBwcm9wczoge1xuICAgIGRlbGVnYXRlOiBEZWxlZ2F0ZSxcbiAgfTtcbiAgc3RhdGU6IHtcbiAgICBtZXNzYWdlczogQXJyYXk8TGludGVyTWVzc2FnZT4sXG4gICAgdmlzaWJpbGl0eTogYm9vbGVhbixcbiAgICB0ZW1wSGVpZ2h0OiA/bnVtYmVyLFxuICB9O1xuICBjb25zdHJ1Y3Rvcihwcm9wczogT2JqZWN0LCBjb250ZXh0OiA/T2JqZWN0KSB7XG4gICAgc3VwZXIocHJvcHMsIGNvbnRleHQpXG4gICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgIG1lc3NhZ2VzOiB0aGlzLnByb3BzLmRlbGVnYXRlLmZpbHRlcmVkTWVzc2FnZXMsXG4gICAgICB2aXNpYmlsaXR5OiB0aGlzLnByb3BzLmRlbGVnYXRlLnZpc2liaWxpdHksXG4gICAgICB0ZW1wSGVpZ2h0OiBudWxsLFxuICAgIH1cbiAgfVxuICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICB0aGlzLnByb3BzLmRlbGVnYXRlLm9uRGlkQ2hhbmdlTWVzc2FnZXMoKG1lc3NhZ2VzKSA9PiB7XG4gICAgICB0aGlzLnNldFN0YXRlKHsgbWVzc2FnZXMgfSlcbiAgICB9KVxuICAgIHRoaXMucHJvcHMuZGVsZWdhdGUub25EaWRDaGFuZ2VWaXNpYmlsaXR5KCh2aXNpYmlsaXR5KSA9PiB7XG4gICAgICB0aGlzLnNldFN0YXRlKHsgdmlzaWJpbGl0eSB9KVxuICAgIH0pXG4gICAgdGhpcy5wcm9wcy5kZWxlZ2F0ZS5vbkRpZENoYW5nZVBhbmVsQ29uZmlnKCgpID0+IHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoeyB0ZW1wSGVpZ2h0OiBudWxsIH0pXG4gICAgfSlcbiAgfVxuICBvbkNsaWNrID0gKGU6IE1vdXNlRXZlbnQsIHJvdzogTGludGVyTWVzc2FnZSkgPT4ge1xuICAgIGlmIChwcm9jZXNzLnBsYXRmb3JtID09PSAnZGFyd2luJyA/IGUubWV0YUtleSA6IGUuY3RybEtleSkge1xuICAgICAgaWYgKGUuc2hpZnRLZXkpIHtcbiAgICAgICAgb3BlbkV4dGVybmFsbHkocm93KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmlzaXRNZXNzYWdlKHJvdywgdHJ1ZSlcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdmlzaXRNZXNzYWdlKHJvdylcbiAgICB9XG4gIH1cbiAgb25SZXNpemUgPSAoZGlyZWN0aW9uOiAndG9wJywgc2l6ZTogeyB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlciB9KSA9PiB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7IHRlbXBIZWlnaHQ6IHNpemUuaGVpZ2h0IH0pXG4gIH1cbiAgb25SZXNpemVTdG9wID0gKGRpcmVjdGlvbjogJ3RvcCcsIHNpemU6IHsgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIgfSkgPT4ge1xuICAgIHRoaXMucHJvcHMuZGVsZWdhdGUudXBkYXRlUGFuZWxIZWlnaHQoc2l6ZS5oZWlnaHQpXG4gIH1cbiAgcmVuZGVyKCkge1xuICAgIGNvbnN0IHsgZGVsZWdhdGUgfSA9IHRoaXMucHJvcHNcbiAgICBjb25zdCBjb2x1bW5zID0gW1xuICAgICAgeyBrZXk6ICdzZXZlcml0eScsIGxhYmVsOiAnU2V2ZXJpdHknLCBzb3J0YWJsZTogdHJ1ZSB9LFxuICAgICAgeyBrZXk6ICdsaW50ZXJOYW1lJywgbGFiZWw6ICdQcm92aWRlcicsIHNvcnRhYmxlOiB0cnVlIH0sXG4gICAgICB7IGtleTogJ2V4Y2VycHQnLCBsYWJlbDogJ0Rlc2NyaXB0aW9uJywgb25DbGljazogdGhpcy5vbkNsaWNrIH0sXG4gICAgICB7IGtleTogJ2xpbmUnLCBsYWJlbDogJ0xpbmUnLCBzb3J0YWJsZTogdHJ1ZSwgb25DbGljazogdGhpcy5vbkNsaWNrIH0sXG4gICAgXVxuICAgIGlmIChkZWxlZ2F0ZS5wYW5lbFJlcHJlc2VudHMgPT09ICdFbnRpcmUgUHJvamVjdCcpIHtcbiAgICAgIGNvbHVtbnMucHVzaCh7IGtleTogJ2ZpbGUnLCBsYWJlbDogJ0ZpbGUnLCBzb3J0YWJsZTogdHJ1ZSwgb25DbGljazogdGhpcy5vbkNsaWNrIH0pXG4gICAgfVxuXG4gICAgbGV0IGhlaWdodFxuICAgIGNvbnN0IGN1c3RvbVN0eWxlOiBPYmplY3QgPSB7IG92ZXJmbG93WTogJ3Njcm9sbCcgfVxuICAgIGlmICh0aGlzLnN0YXRlLnRlbXBIZWlnaHQpIHtcbiAgICAgIGhlaWdodCA9IHRoaXMuc3RhdGUudGVtcEhlaWdodFxuICAgIH0gZWxzZSBpZiAoZGVsZWdhdGUucGFuZWxUYWtlc01pbmltdW1IZWlnaHQpIHtcbiAgICAgIGhlaWdodCA9ICdhdXRvJ1xuICAgICAgY3VzdG9tU3R5bGUubWF4SGVpZ2h0ID0gZGVsZWdhdGUucGFuZWxIZWlnaHRcbiAgICB9IGVsc2Uge1xuICAgICAgaGVpZ2h0ID0gZGVsZWdhdGUucGFuZWxIZWlnaHRcbiAgICB9XG4gICAgZGVsZWdhdGUuc2V0UGFuZWxWaXNpYmlsaXR5KHRoaXMuc3RhdGUudmlzaWJpbGl0eSAmJiAoIWRlbGVnYXRlLnBhbmVsVGFrZXNNaW5pbXVtSGVpZ2h0IHx8ICEhdGhpcy5zdGF0ZS5tZXNzYWdlcy5sZW5ndGgpKVxuXG4gICAgcmV0dXJuIChcbiAgICAgIDxSZXNpemFibGVCb3ggaXNSZXNpemFibGU9e3sgdG9wOiB0cnVlIH19IG9uUmVzaXplPXt0aGlzLm9uUmVzaXplfSBvblJlc2l6ZVN0b3A9e3RoaXMub25SZXNpemVTdG9wfSBoZWlnaHQ9e2hlaWdodH0gd2lkdGg9XCJhdXRvXCIgY3VzdG9tU3R5bGU9e2N1c3RvbVN0eWxlfT5cbiAgICAgICAgPGRpdiBpZD1cImxpbnRlci1wYW5lbFwiIHRhYkluZGV4PVwiLTFcIj5cbiAgICAgICAgICA8UmVhY3RUYWJsZVxuICAgICAgICAgICAgcm93cz17dGhpcy5zdGF0ZS5tZXNzYWdlc31cbiAgICAgICAgICAgIGNvbHVtbnM9e2NvbHVtbnN9XG5cbiAgICAgICAgICAgIGluaXRpYWxTb3J0PXtbeyBjb2x1bW46ICdzZXZlcml0eScsIHR5cGU6ICdkZXNjJyB9LCB7IGNvbHVtbjogJ2ZpbGUnLCB0eXBlOiAnYXNjJyB9LCB7IGNvbHVtbjogJ2xpbmUnLCB0eXBlOiAnYXNjJyB9XX1cbiAgICAgICAgICAgIHNvcnQ9e3NvcnRNZXNzYWdlc31cbiAgICAgICAgICAgIHJvd0tleT17aSA9PiBpLmtleX1cblxuICAgICAgICAgICAgcmVuZGVySGVhZGVyQ29sdW1uPXtpID0+IGkubGFiZWx9XG4gICAgICAgICAgICByZW5kZXJCb2R5Q29sdW1uPXtQYW5lbENvbXBvbmVudC5yZW5kZXJSb3dDb2x1bW59XG5cbiAgICAgICAgICAgIHN0eWxlPXt7IHdpZHRoOiAnMTAwJScgfX1cbiAgICAgICAgICAgIGNsYXNzTmFtZT1cImxpbnRlclwiXG4gICAgICAgICAgLz5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L1Jlc2l6YWJsZUJveD5cbiAgICApXG4gIH1cbiAgc3RhdGljIHJlbmRlclJvd0NvbHVtbihyb3c6IExpbnRlck1lc3NhZ2UsIGNvbHVtbjogc3RyaW5nKTogc3RyaW5nIHwgT2JqZWN0IHtcbiAgICBjb25zdCByYW5nZSA9ICRyYW5nZShyb3cpXG5cbiAgICBzd2l0Y2ggKGNvbHVtbikge1xuICAgICAgY2FzZSAnZmlsZSc6XG4gICAgICAgIHJldHVybiBnZXRQYXRoT2ZNZXNzYWdlKHJvdylcbiAgICAgIGNhc2UgJ2xpbmUnOlxuICAgICAgICByZXR1cm4gcmFuZ2UgPyBgJHtyYW5nZS5zdGFydC5yb3cgKyAxfToke3JhbmdlLnN0YXJ0LmNvbHVtbiArIDF9YCA6ICcnXG4gICAgICBjYXNlICdleGNlcnB0JzpcbiAgICAgICAgaWYgKHJvdy52ZXJzaW9uID09PSAxKSB7XG4gICAgICAgICAgaWYgKHJvdy5odG1sKSB7XG4gICAgICAgICAgICByZXR1cm4gPHNwYW4gZGFuZ2Vyb3VzbHlTZXRJbm5lckhUTUw9e3sgX19odG1sOiByb3cuaHRtbCB9fSAvPlxuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gcm93LnRleHQgfHwgJydcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcm93LmV4Y2VycHRcbiAgICAgIGNhc2UgJ3NldmVyaXR5JzpcbiAgICAgICAgcmV0dXJuIHNldmVyaXR5TmFtZXNbcm93LnNldmVyaXR5XVxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIHJvd1tjb2x1bW5dXG4gICAgfVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gUGFuZWxDb21wb25lbnRcbiJdfQ==