var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _sbReactTable = require('sb-react-table');

var _sbReactTable2 = _interopRequireDefault(_sbReactTable);

var _helpers = require('../helpers');

var PanelComponent = (function (_React$Component) {
  _inherits(PanelComponent, _React$Component);

  function PanelComponent(props, context) {
    _classCallCheck(this, PanelComponent);

    _get(Object.getPrototypeOf(PanelComponent.prototype), 'constructor', this).call(this, props, context);

    this.onClick = function (e, row) {
      if (e.target.tagName === 'A') {
        return;
      }
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

    this.state = {
      messages: this.props.delegate.filteredMessages
    };
  }

  _createClass(PanelComponent, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this = this;

      this.props.delegate.onDidChangeMessages(function (messages) {
        _this.setState({ messages: messages });
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

      var customStyle = { overflowY: 'scroll', height: '100%' };

      return _react2['default'].createElement(
        'div',
        { id: 'linter-panel', tabIndex: '-1', style: customStyle },
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1Ly5hdG9tL3BhY2thZ2VzL2xpbnRlci11aS1kZWZhdWx0L2xpYi9wYW5lbC9jb21wb25lbnQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztxQkFFa0IsT0FBTzs7Ozs0QkFDRixnQkFBZ0I7Ozs7dUJBQzZELFlBQVk7O0lBSTFHLGNBQWM7WUFBZCxjQUFjOztBQU9QLFdBUFAsY0FBYyxDQU9OLEtBQWEsRUFBRSxPQUFnQixFQUFFOzBCQVB6QyxjQUFjOztBQVFoQiwrQkFSRSxjQUFjLDZDQVFWLEtBQUssRUFBRSxPQUFPLEVBQUM7O1NBVXZCLE9BQU8sR0FBRyxVQUFDLENBQUMsRUFBYyxHQUFHLEVBQW9CO0FBQy9DLFVBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxPQUFPLEtBQUssR0FBRyxFQUFFO0FBQzVCLGVBQU07T0FDUDtBQUNELFVBQUksT0FBTyxDQUFDLFFBQVEsS0FBSyxRQUFRLEdBQUcsQ0FBQyxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUMsT0FBTyxFQUFFO0FBQ3pELFlBQUksQ0FBQyxDQUFDLFFBQVEsRUFBRTtBQUNkLHVDQUFlLEdBQUcsQ0FBQyxDQUFBO1NBQ3BCLE1BQU07QUFDTCxxQ0FBYSxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUE7U0FDeEI7T0FDRixNQUFNO0FBQ0wsbUNBQWEsR0FBRyxDQUFDLENBQUE7T0FDbEI7S0FDRjs7QUF0QkMsUUFBSSxDQUFDLEtBQUssR0FBRztBQUNYLGNBQVEsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0I7S0FDL0MsQ0FBQTtHQUNGOztlQVpHLGNBQWM7O1dBYUQsNkJBQUc7OztBQUNsQixVQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxtQkFBbUIsQ0FBQyxVQUFDLFFBQVEsRUFBSztBQUNwRCxjQUFLLFFBQVEsQ0FBQyxFQUFFLFFBQVEsRUFBUixRQUFRLEVBQUUsQ0FBQyxDQUFBO09BQzVCLENBQUMsQ0FBQTtLQUNI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QUFDcEIsYUFBSyxVQUFVO0FBQ2IsaUJBQU8sdUJBQWMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFBO0FBQUEsQUFDcEM7QUFDRSxpQkFBTyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUE7QUFBQSxPQUNyQjtLQUNGOzs7U0F0RkcsY0FBYztHQUFTLG1CQUFNLFNBQVM7O0FBeUY1QyxNQUFNLENBQUMsT0FBTyxHQUFHLGNBQWMsQ0FBQSIsImZpbGUiOiIvVXNlcnMvdGxhbmRhdS8uYXRvbS9wYWNrYWdlcy9saW50ZXItdWktZGVmYXVsdC9saWIvcGFuZWwvY29tcG9uZW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogQGZsb3cgKi9cblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0J1xuaW1wb3J0IFJlYWN0VGFibGUgZnJvbSAnc2ItcmVhY3QtdGFibGUnXG5pbXBvcnQgeyAkcmFuZ2UsIHNldmVyaXR5TmFtZXMsIHNvcnRNZXNzYWdlcywgdmlzaXRNZXNzYWdlLCBvcGVuRXh0ZXJuYWxseSwgZ2V0UGF0aE9mTWVzc2FnZSB9IGZyb20gJy4uL2hlbHBlcnMnXG5pbXBvcnQgdHlwZSBEZWxlZ2F0ZSBmcm9tICcuL2RlbGVnYXRlJ1xuaW1wb3J0IHR5cGUgeyBMaW50ZXJNZXNzYWdlIH0gZnJvbSAnLi4vdHlwZXMnXG5cbmNsYXNzIFBhbmVsQ29tcG9uZW50IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgcHJvcHM6IHtcbiAgICBkZWxlZ2F0ZTogRGVsZWdhdGUsXG4gIH07XG4gIHN0YXRlOiB7XG4gICAgbWVzc2FnZXM6IEFycmF5PExpbnRlck1lc3NhZ2U+LFxuICB9O1xuICBjb25zdHJ1Y3Rvcihwcm9wczogT2JqZWN0LCBjb250ZXh0OiA/T2JqZWN0KSB7XG4gICAgc3VwZXIocHJvcHMsIGNvbnRleHQpXG4gICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgIG1lc3NhZ2VzOiB0aGlzLnByb3BzLmRlbGVnYXRlLmZpbHRlcmVkTWVzc2FnZXMsXG4gICAgfVxuICB9XG4gIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgIHRoaXMucHJvcHMuZGVsZWdhdGUub25EaWRDaGFuZ2VNZXNzYWdlcygobWVzc2FnZXMpID0+IHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoeyBtZXNzYWdlcyB9KVxuICAgIH0pXG4gIH1cbiAgb25DbGljayA9IChlOiBNb3VzZUV2ZW50LCByb3c6IExpbnRlck1lc3NhZ2UpID0+IHtcbiAgICBpZiAoZS50YXJnZXQudGFnTmFtZSA9PT0gJ0EnKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgaWYgKHByb2Nlc3MucGxhdGZvcm0gPT09ICdkYXJ3aW4nID8gZS5tZXRhS2V5IDogZS5jdHJsS2V5KSB7XG4gICAgICBpZiAoZS5zaGlmdEtleSkge1xuICAgICAgICBvcGVuRXh0ZXJuYWxseShyb3cpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2aXNpdE1lc3NhZ2Uocm93LCB0cnVlKVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB2aXNpdE1lc3NhZ2Uocm93KVxuICAgIH1cbiAgfVxuICByZW5kZXIoKSB7XG4gICAgY29uc3QgeyBkZWxlZ2F0ZSB9ID0gdGhpcy5wcm9wc1xuICAgIGNvbnN0IGNvbHVtbnMgPSBbXG4gICAgICB7IGtleTogJ3NldmVyaXR5JywgbGFiZWw6ICdTZXZlcml0eScsIHNvcnRhYmxlOiB0cnVlIH0sXG4gICAgICB7IGtleTogJ2xpbnRlck5hbWUnLCBsYWJlbDogJ1Byb3ZpZGVyJywgc29ydGFibGU6IHRydWUgfSxcbiAgICAgIHsga2V5OiAnZXhjZXJwdCcsIGxhYmVsOiAnRGVzY3JpcHRpb24nLCBvbkNsaWNrOiB0aGlzLm9uQ2xpY2sgfSxcbiAgICAgIHsga2V5OiAnbGluZScsIGxhYmVsOiAnTGluZScsIHNvcnRhYmxlOiB0cnVlLCBvbkNsaWNrOiB0aGlzLm9uQ2xpY2sgfSxcbiAgICBdXG4gICAgaWYgKGRlbGVnYXRlLnBhbmVsUmVwcmVzZW50cyA9PT0gJ0VudGlyZSBQcm9qZWN0Jykge1xuICAgICAgY29sdW1ucy5wdXNoKHsga2V5OiAnZmlsZScsIGxhYmVsOiAnRmlsZScsIHNvcnRhYmxlOiB0cnVlLCBvbkNsaWNrOiB0aGlzLm9uQ2xpY2sgfSlcbiAgICB9XG5cbiAgICBjb25zdCBjdXN0b21TdHlsZTogT2JqZWN0ID0geyBvdmVyZmxvd1k6ICdzY3JvbGwnLCBoZWlnaHQ6ICcxMDAlJyB9XG5cbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBpZD1cImxpbnRlci1wYW5lbFwiIHRhYkluZGV4PVwiLTFcIiBzdHlsZT17Y3VzdG9tU3R5bGV9PlxuICAgICAgICA8UmVhY3RUYWJsZVxuICAgICAgICAgIHJvd3M9e3RoaXMuc3RhdGUubWVzc2FnZXN9XG4gICAgICAgICAgY29sdW1ucz17Y29sdW1uc31cblxuICAgICAgICAgIGluaXRpYWxTb3J0PXtbeyBjb2x1bW46ICdzZXZlcml0eScsIHR5cGU6ICdkZXNjJyB9LCB7IGNvbHVtbjogJ2ZpbGUnLCB0eXBlOiAnYXNjJyB9LCB7IGNvbHVtbjogJ2xpbmUnLCB0eXBlOiAnYXNjJyB9XX1cbiAgICAgICAgICBzb3J0PXtzb3J0TWVzc2FnZXN9XG4gICAgICAgICAgcm93S2V5PXtpID0+IGkua2V5fVxuXG4gICAgICAgICAgcmVuZGVySGVhZGVyQ29sdW1uPXtpID0+IGkubGFiZWx9XG4gICAgICAgICAgcmVuZGVyQm9keUNvbHVtbj17UGFuZWxDb21wb25lbnQucmVuZGVyUm93Q29sdW1ufVxuXG4gICAgICAgICAgc3R5bGU9e3sgd2lkdGg6ICcxMDAlJyB9fVxuICAgICAgICAgIGNsYXNzTmFtZT1cImxpbnRlclwiXG4gICAgICAgIC8+XG4gICAgICA8L2Rpdj5cbiAgICApXG4gIH1cbiAgc3RhdGljIHJlbmRlclJvd0NvbHVtbihyb3c6IExpbnRlck1lc3NhZ2UsIGNvbHVtbjogc3RyaW5nKTogc3RyaW5nIHwgT2JqZWN0IHtcbiAgICBjb25zdCByYW5nZSA9ICRyYW5nZShyb3cpXG5cbiAgICBzd2l0Y2ggKGNvbHVtbikge1xuICAgICAgY2FzZSAnZmlsZSc6XG4gICAgICAgIHJldHVybiBnZXRQYXRoT2ZNZXNzYWdlKHJvdylcbiAgICAgIGNhc2UgJ2xpbmUnOlxuICAgICAgICByZXR1cm4gcmFuZ2UgPyBgJHtyYW5nZS5zdGFydC5yb3cgKyAxfToke3JhbmdlLnN0YXJ0LmNvbHVtbiArIDF9YCA6ICcnXG4gICAgICBjYXNlICdleGNlcnB0JzpcbiAgICAgICAgaWYgKHJvdy52ZXJzaW9uID09PSAxKSB7XG4gICAgICAgICAgaWYgKHJvdy5odG1sKSB7XG4gICAgICAgICAgICByZXR1cm4gPHNwYW4gZGFuZ2Vyb3VzbHlTZXRJbm5lckhUTUw9e3sgX19odG1sOiByb3cuaHRtbCB9fSAvPlxuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gcm93LnRleHQgfHwgJydcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcm93LmV4Y2VycHRcbiAgICAgIGNhc2UgJ3NldmVyaXR5JzpcbiAgICAgICAgcmV0dXJuIHNldmVyaXR5TmFtZXNbcm93LnNldmVyaXR5XVxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIHJvd1tjb2x1bW5dXG4gICAgfVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gUGFuZWxDb21wb25lbnRcbiJdfQ==