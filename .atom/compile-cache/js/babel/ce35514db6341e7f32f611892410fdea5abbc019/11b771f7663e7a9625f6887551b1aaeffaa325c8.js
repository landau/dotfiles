Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _sbEventKit = require('sb-event-kit');

var _delegate = require('./delegate');

var _delegate2 = _interopRequireDefault(_delegate);

var _component = require('./component');

var _component2 = _interopRequireDefault(_component);

var Panel = (function () {
  function Panel() {
    _classCallCheck(this, Panel);

    var element = document.createElement('div');
    var panel = atom.workspace.addBottomPanel({
      item: element,
      visible: true,
      priority: 500
    });
    this.delegate = new _delegate2['default'](panel);
    this.subscriptions = new _sbEventKit.CompositeDisposable();

    _reactDom2['default'].render(_react2['default'].createElement(_component2['default'], { delegate: this.delegate }), element);
    this.subscriptions.add(function () {
      panel.destroy();
    });
    this.subscriptions.add(this.delegate);
  }

  _createClass(Panel, [{
    key: 'update',
    value: function update(messages) {
      this.delegate.update(messages);
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this.subscriptions.dispose();
    }
  }]);

  return Panel;
})();

exports['default'] = Panel;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci11aS1kZWZhdWx0L2xpYi9wYW5lbC9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O3FCQUVrQixPQUFPOzs7O3dCQUNKLFdBQVc7Ozs7MEJBQ0ksY0FBYzs7d0JBRTdCLFlBQVk7Ozs7eUJBQ1gsYUFBYTs7OztJQUdkLEtBQUs7QUFJYixXQUpRLEtBQUssR0FJVjswQkFKSyxLQUFLOztBQUt0QixRQUFNLE9BQU8sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFBO0FBQzdDLFFBQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDO0FBQzFDLFVBQUksRUFBRSxPQUFPO0FBQ2IsYUFBTyxFQUFFLElBQUk7QUFDYixjQUFRLEVBQUUsR0FBRztLQUNkLENBQUMsQ0FBQTtBQUNGLFFBQUksQ0FBQyxRQUFRLEdBQUcsMEJBQWEsS0FBSyxDQUFDLENBQUE7QUFDbkMsUUFBSSxDQUFDLGFBQWEsR0FBRyxxQ0FBeUIsQ0FBQTs7QUFFOUMsMEJBQVMsTUFBTSxDQUFDLDJEQUFXLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUSxBQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQTtBQUNoRSxRQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxZQUFXO0FBQ2hDLFdBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQTtLQUNoQixDQUFDLENBQUE7QUFDRixRQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUE7R0FDdEM7O2VBbkJrQixLQUFLOztXQW9CbEIsZ0JBQUMsUUFBOEIsRUFBUTtBQUMzQyxVQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQTtLQUMvQjs7O1dBQ00sbUJBQUc7QUFDUixVQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxDQUFBO0tBQzdCOzs7U0F6QmtCLEtBQUs7OztxQkFBTCxLQUFLIiwiZmlsZSI6Ii9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci11aS1kZWZhdWx0L2xpYi9wYW5lbC9pbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIEBmbG93ICovXG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCdcbmltcG9ydCBSZWFjdERPTSBmcm9tICdyZWFjdC1kb20nXG5pbXBvcnQgeyBDb21wb3NpdGVEaXNwb3NhYmxlIH0gZnJvbSAnc2ItZXZlbnQta2l0J1xuXG5pbXBvcnQgRGVsZWdhdGUgZnJvbSAnLi9kZWxlZ2F0ZSdcbmltcG9ydCBDb21wb25lbnQgZnJvbSAnLi9jb21wb25lbnQnXG5pbXBvcnQgdHlwZSB7IExpbnRlck1lc3NhZ2UgfSBmcm9tICcuLi90eXBlcydcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUGFuZWwge1xuICBkZWxlZ2F0ZTogRGVsZWdhdGU7XG4gIHN1YnNjcmlwdGlvbnM6IENvbXBvc2l0ZURpc3Bvc2FibGU7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgY29uc3QgZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgY29uc3QgcGFuZWwgPSBhdG9tLndvcmtzcGFjZS5hZGRCb3R0b21QYW5lbCh7XG4gICAgICBpdGVtOiBlbGVtZW50LFxuICAgICAgdmlzaWJsZTogdHJ1ZSxcbiAgICAgIHByaW9yaXR5OiA1MDAsXG4gICAgfSlcbiAgICB0aGlzLmRlbGVnYXRlID0gbmV3IERlbGVnYXRlKHBhbmVsKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcblxuICAgIFJlYWN0RE9NLnJlbmRlcig8Q29tcG9uZW50IGRlbGVnYXRlPXt0aGlzLmRlbGVnYXRlfSAvPiwgZWxlbWVudClcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGZ1bmN0aW9uKCkge1xuICAgICAgcGFuZWwuZGVzdHJveSgpXG4gICAgfSlcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKHRoaXMuZGVsZWdhdGUpXG4gIH1cbiAgdXBkYXRlKG1lc3NhZ2VzOiBBcnJheTxMaW50ZXJNZXNzYWdlPik6IHZvaWQge1xuICAgIHRoaXMuZGVsZWdhdGUudXBkYXRlKG1lc3NhZ2VzKVxuICB9XG4gIGRpc3Bvc2UoKSB7XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICB9XG59XG4iXX0=