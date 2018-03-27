Object.defineProperty(exports, '__esModule', {
  value: true
});

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

  function PanelComponent() {
    var _this = this;

    _classCallCheck(this, PanelComponent);

    _get(Object.getPrototypeOf(PanelComponent.prototype), 'constructor', this).apply(this, arguments);

    this.state = {
      messages: [],
      visibility: false,
      tempHeight: null
    };

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
      this.setState({ messages: this.props.delegate.filteredMessages, visibility: this.props.delegate.visibility });
    }
  }, {
    key: 'render',
    value: function render() {
      var columns = [{ key: 'severity', label: 'Severity', sortable: true }, { key: 'linterName', label: 'Provider', sortable: true }, { key: 'excerpt', label: 'Description' }, { key: 'line', label: 'Line', sortable: true, onClick: this.onClick }, { key: 'file', label: 'File', sortable: true, onClick: this.onClick }];

      var height = undefined;
      var customStyle = { 'overflow-y': 'scroll' };
      if (this.state.tempHeight) {
        height = this.state.tempHeight;
      } else if (this.props.delegate.panelTakesMinimumHeight) {
        height = 'auto';
        customStyle.maxHeight = this.props.delegate.panelHeight;
      } else {
        height = this.props.delegate.panelHeight;
      }
      this.props.delegate.setPanelVisibility(this.state.visibility && (!this.props.delegate.panelTakesMinimumHeight || !!this.state.messages.length));

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

exports['default'] = PanelComponent;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci11aS1kZWZhdWx0L2xpYi9wYW5lbC9jb21wb25lbnQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7cUJBRWtCLE9BQU87Ozs7NEJBQ0YsZ0JBQWdCOzs7O2lDQUNkLHFCQUFxQjs7Ozt1QkFDc0QsWUFBWTs7SUFJM0YsY0FBYztZQUFkLGNBQWM7O1dBQWQsY0FBYzs7OzBCQUFkLGNBQWM7OytCQUFkLGNBQWM7O1NBSWpDLEtBQUssR0FJRDtBQUNGLGNBQVEsRUFBRSxFQUFFO0FBQ1osZ0JBQVUsRUFBRSxLQUFLO0FBQ2pCLGdCQUFVLEVBQUUsSUFBSTtLQUNqQjs7U0FhRCxPQUFPLEdBQUcsVUFBQyxDQUFDLEVBQWMsR0FBRyxFQUFvQjtBQUMvQyxVQUFJLE9BQU8sQ0FBQyxRQUFRLEtBQUssUUFBUSxHQUFHLENBQUMsQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDLE9BQU8sRUFBRTtBQUN6RCxZQUFJLENBQUMsQ0FBQyxRQUFRLEVBQUU7QUFDZCx1Q0FBZSxHQUFHLENBQUMsQ0FBQTtTQUNwQixNQUFNO0FBQ0wscUNBQWEsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFBO1NBQ3hCO09BQ0YsTUFBTTtBQUNMLG1DQUFhLEdBQUcsQ0FBQyxDQUFBO09BQ2xCO0tBQ0Y7O1NBQ0QsUUFBUSxHQUFHLFVBQUMsU0FBUyxFQUFTLElBQUksRUFBd0M7QUFDeEUsWUFBSyxRQUFRLENBQUMsRUFBRSxVQUFVLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUE7S0FDM0M7O1NBQ0QsWUFBWSxHQUFHLFVBQUMsU0FBUyxFQUFTLElBQUksRUFBd0M7QUFDNUUsWUFBSyxLQUFLLENBQUMsUUFBUSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQTtLQUNuRDs7O2VBekNrQixjQUFjOztXQWFoQiw2QkFBRzs7O0FBQ2xCLFVBQUksQ0FB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QUFNLHVCQUF1QixFQUFFLEVBQUUsTUFBTSxFQUFFLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQUFBQyxHQUFHLENBQUE7YUFDL0Q7QUFDRCxtQkFBTyxHQUFHLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQTtXQUN0QjtBQUNELGlCQUFPLEdBQUcsQ0FBQyxPQUFPLENBQUE7QUFBQSxBQUNwQixhQUFLLFVBQVU7QUFDYixpQkFBTyx1QkFBYyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUE7QUFBQSxBQUNwQztBQUNFLGlCQUFPLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQTtBQUFBLE9BQ3JCO0tBQ0Y7OztTQXpHa0IsY0FBYztHQUFTLG1CQUFNLFNBQVM7O3FCQUF0QyxjQUFjIiwiZmlsZSI6Ii9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci11aS1kZWZhdWx0L2xpYi9wYW5lbC9jb21wb25lbnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBAZmxvdyAqL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnXG5pbXBvcnQgUmVhY3RUYWJsZSBmcm9tICdzYi1yZWFjdC10YWJsZSdcbmltcG9ydCBSZXNpemFibGVCb3ggZnJvbSAncmVhY3QtcmVzaXphYmxlLWJveCdcbmltcG9ydCB7ICRyYW5nZSwgc2V2ZXJpdHlOYW1lcywgc29ydE1lc3NhZ2VzLCB2aXNpdE1lc3NhZ2UsIG9wZW5FeHRlcm5hbGx5LCBnZXRQYXRoT2ZNZXNzYWdlIH0gZnJvbSAnLi4vaGVscGVycydcbmltcG9ydCB0eXBlIERlbGVnYXRlIGZyb20gJy4vZGVsZWdhdGUnXG5pbXBvcnQgdHlwZSB7IExpbnRlck1lc3NhZ2UgfSBmcm9tICcuLi90eXBlcydcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUGFuZWxDb21wb25lbnQgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBwcm9wczoge1xuICAgIGRlbGVnYXRlOiBEZWxlZ2F0ZSxcbiAgfTtcbiAgc3RhdGU6IHtcbiAgICBtZXNzYWdlczogQXJyYXk8TGludGVyTWVzc2FnZT4sXG4gICAgdmlzaWJpbGl0eTogYm9vbGVhbixcbiAgICB0ZW1wSGVpZ2h0OiA/bnVtYmVyLFxuICB9ID0ge1xuICAgIG1lc3NhZ2VzOiBbXSxcbiAgICB2aXNpYmlsaXR5OiBmYWxzZSxcbiAgICB0ZW1wSGVpZ2h0OiBudWxsLFxuICB9O1xuICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICB0aGlzLnByb3BzLmRlbGVnYXRlLm9uRGlkQ2hhbmdlTWVzc2FnZXMoKG1lc3NhZ2VzKSA9PiB7XG4gICAgICB0aGlzLnNldFN0YXRlKHsgbWVzc2FnZXMgfSlcbiAgICB9KVxuICAgIHRoaXMucHJvcHMuZGVsZWdhdGUub25EaWRDaGFuZ2VWaXNpYmlsaXR5KCh2aXNpYmlsaXR5KSA9PiB7XG4gICAgICB0aGlzLnNldFN0YXRlKHsgdmlzaWJpbGl0eSB9KVxuICAgIH0pXG4gICAgdGhpcy5wcm9wcy5kZWxlZ2F0ZS5vbkRpZENoYW5nZVBhbmVsQ29uZmlnKCgpID0+IHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoeyB0ZW1wSGVpZ2h0OiBudWxsIH0pXG4gICAgfSlcbiAgICB0aGlzLnNldFN0YXRlKHsgbWVzc2FnZXM6IHRoaXMucHJvcHMuZGVsZWdhdGUuZmlsdGVyZWRNZXNzYWdlcywgdmlzaWJpbGl0eTogdGhpcy5wcm9wcy5kZWxlZ2F0ZS52aXNpYmlsaXR5IH0pXG4gIH1cbiAgb25DbGljayA9IChlOiBNb3VzZUV2ZW50LCByb3c6IExpbnRlck1lc3NhZ2UpID0+IHtcbiAgICBpZiAocHJvY2Vzcy5wbGF0Zm9ybSA9PT0gJ2RhcndpbicgPyBlLm1ldGFLZXkgOiBlLmN0cmxLZXkpIHtcbiAgICAgIGlmIChlLnNoaWZ0S2V5KSB7XG4gICAgICAgIG9wZW5FeHRlcm5hbGx5KHJvdylcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZpc2l0TWVzc2FnZShyb3csIHRydWUpXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHZpc2l0TWVzc2FnZShyb3cpXG4gICAgfVxuICB9XG4gIG9uUmVzaXplID0gKGRpcmVjdGlvbjogJ3RvcCcsIHNpemU6IHsgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIgfSkgPT4ge1xuICAgIHRoaXMuc2V0U3RhdGUoeyB0ZW1wSGVpZ2h0OiBzaXplLmhlaWdodCB9KVxuICB9XG4gIG9uUmVzaXplU3RvcCA9IChkaXJlY3Rpb246ICd0b3AnLCBzaXplOiB7IHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyIH0pID0+IHtcbiAgICB0aGlzLnByb3BzLmRlbGVnYXRlLnVwZGF0ZVBhbmVsSGVpZ2h0KHNpemUuaGVpZ2h0KVxuICB9XG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCBjb2x1bW5zID0gW1xuICAgICAgeyBrZXk6ICdzZXZlcml0eScsIGxhYmVsOiAnU2V2ZXJpdHknLCBzb3J0YWJsZTogdHJ1ZSB9LFxuICAgICAgeyBrZXk6ICdsaW50ZXJOYW1lJywgbGFiZWw6ICdQcm92aWRlcicsIHNvcnRhYmxlOiB0cnVlIH0sXG4gICAgICB7IGtleTogJ2V4Y2VycHQnLCBsYWJlbDogJ0Rlc2NyaXB0aW9uJyB9LFxuICAgICAgeyBrZXk6ICdsaW5lJywgbGFiZWw6ICdMaW5lJywgc29ydGFibGU6IHRydWUsIG9uQ2xpY2s6IHRoaXMub25DbGljayB9LFxuICAgICAgeyBrZXk6ICdmaWxlJywgbGFiZWw6ICdGaWxlJywgc29ydGFibGU6IHRydWUsIG9uQ2xpY2s6IHRoaXMub25DbGljayB9LFxuICAgIF1cblxuICAgIGxldCBoZWlnaHRcbiAgICBjb25zdCBjdXN0b21TdHlsZTogT2JqZWN0ID0geyAnb3ZlcmZsb3cteSc6ICdzY3JvbGwnIH1cbiAgICBpZiAodGhpcy5zdGF0ZS50ZW1wSGVpZ2h0KSB7XG4gICAgICBoZWlnaHQgPSB0aGlzLnN0YXRlLnRlbXBIZWlnaHRcbiAgICB9IGVsc2UgaWYgKHRoaXMucHJvcHMuZGVsZWdhdGUucGFuZWxUYWtlc01pbmltdW1IZWlnaHQpIHtcbiAgICAgIGhlaWdodCA9ICdhdXRvJ1xuICAgICAgY3VzdG9tU3R5bGUubWF4SGVpZ2h0ID0gdGhpcy5wcm9wcy5kZWxlZ2F0ZS5wYW5lbEhlaWdodFxuICAgIH0gZWxzZSB7XG4gICAgICBoZWlnaHQgPSB0aGlzLnByb3BzLmRlbGVnYXRlLnBhbmVsSGVpZ2h0XG4gICAgfVxuICAgIHRoaXMucHJvcHMuZGVsZWdhdGUuc2V0UGFuZWxWaXNpYmlsaXR5KHRoaXMuc3RhdGUudmlzaWJpbGl0eSAmJiAoIXRoaXMucHJvcHMuZGVsZWdhdGUucGFuZWxUYWtlc01pbmltdW1IZWlnaHQgfHwgISF0aGlzLnN0YXRlLm1lc3NhZ2VzLmxlbmd0aCkpXG5cbiAgICByZXR1cm4gKFxuICAgICAgPFJlc2l6YWJsZUJveCBpc1Jlc2l6YWJsZT17eyB0b3A6IHRydWUgfX0gb25SZXNpemU9e3RoaXMub25SZXNpemV9IG9uUmVzaXplU3RvcD17dGhpcy5vblJlc2l6ZVN0b3B9IGhlaWdodD17aGVpZ2h0fSB3aWR0aD1cImF1dG9cIiBjdXN0b21TdHlsZT17Y3VzdG9tU3R5bGV9PlxuICAgICAgICA8ZGl2IGlkPVwibGludGVyLXBhbmVsXCIgdGFiSW5kZXg9XCItMVwiPlxuICAgICAgICAgIDxSZWFjdFRhYmxlXG4gICAgICAgICAgICByb3dzPXt0aGlzLnN0YXRlLm1lc3NhZ2VzfVxuICAgICAgICAgICAgY29sdW1ucz17Y29sdW1uc31cblxuICAgICAgICAgICAgaW5pdGlhbFNvcnQ9e1t7IGNvbHVtbjogJ3NldmVyaXR5JywgdHlwZTogJ2Rlc2MnIH0sIHsgY29sdW1uOiAnZmlsZScsIHR5cGU6ICdhc2MnIH0sIHsgY29sdW1uOiAnbGluZScsIHR5cGU6ICdhc2MnIH1dfVxuICAgICAgICAgICAgc29ydD17c29ydE1lc3NhZ2VzfVxuICAgICAgICAgICAgcm93S2V5PXtpID0+IGkua2V5fVxuXG4gICAgICAgICAgICByZW5kZXJIZWFkZXJDb2x1bW49e2kgPT4gaS5sYWJlbH1cbiAgICAgICAgICAgIHJlbmRlckJvZHlDb2x1bW49e1BhbmVsQ29tcG9uZW50LnJlbmRlclJvd0NvbHVtbn1cblxuICAgICAgICAgICAgc3R5bGU9e3sgd2lkdGg6ICcxMDAlJyB9fVxuICAgICAgICAgICAgY2xhc3NOYW1lPSdsaW50ZXInXG4gICAgICAgICAgLz5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L1Jlc2l6YWJsZUJveD5cbiAgICApXG4gIH1cbiAgc3RhdGljIHJlbmRlclJvd0NvbHVtbihyb3c6IExpbnRlck1lc3NhZ2UsIGNvbHVtbjogc3RyaW5nKTogc3RyaW5nIHwgT2JqZWN0IHtcbiAgICBjb25zdCByYW5nZSA9ICRyYW5nZShyb3cpXG5cbiAgICBzd2l0Y2ggKGNvbHVtbikge1xuICAgICAgY2FzZSAnZmlsZSc6XG4gICAgICAgIHJldHVybiBnZXRQYXRoT2ZNZXNzYWdlKHJvdylcbiAgICAgIGNhc2UgJ2xpbmUnOlxuICAgICAgICByZXR1cm4gcmFuZ2UgPyBgJHtyYW5nZS5zdGFydC5yb3cgKyAxfToke3JhbmdlLnN0YXJ0LmNvbHVtbiArIDF9YCA6ICcnXG4gICAgICBjYXNlICdleGNlcnB0JzpcbiAgICAgICAgaWYgKHJvdy52ZXJzaW9uID09PSAxKSB7XG4gICAgICAgICAgaWYgKHJvdy5odG1sKSB7XG4gICAgICAgICAgICByZXR1cm4gPHNwYW4gZGFuZ2Vyb3VzbHlTZXRJbm5lckhUTUw9e3sgX19odG1sOiByb3cuaHRtbCB9fSAvPlxuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gcm93LnRleHQgfHwgJydcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcm93LmV4Y2VycHRcbiAgICAgIGNhc2UgJ3NldmVyaXR5JzpcbiAgICAgICAgcmV0dXJuIHNldmVyaXR5TmFtZXNbcm93LnNldmVyaXR5XVxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIHJvd1tjb2x1bW5dXG4gICAgfVxuICB9XG59XG4iXX0=