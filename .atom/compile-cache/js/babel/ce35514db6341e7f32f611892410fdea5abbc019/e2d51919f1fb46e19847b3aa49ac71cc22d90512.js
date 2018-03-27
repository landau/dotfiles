var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _atom = require('atom');

var _delegate = require('./delegate');

var _delegate2 = _interopRequireDefault(_delegate);

var _component = require('./component');

var _component2 = _interopRequireDefault(_component);

var Panel = (function () {
  function Panel() {
    _classCallCheck(this, Panel);

    this.subscriptions = new _atom.CompositeDisposable();

    var element = document.createElement('div');
    var panel = atom.workspace.addBottomPanel({
      item: element,
      visible: true,
      priority: 500
    });
    this.subscriptions.add(new _atom.Disposable(function () {
      panel.destroy();
    }));

    this.delegate = new _delegate2['default'](panel);
    this.subscriptions.add(this.delegate);

    _reactDom2['default'].render(_react2['default'].createElement(_component2['default'], { delegate: this.delegate }), element);
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

module.exports = Panel;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci11aS1kZWZhdWx0L2xpYi9wYW5lbC9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7cUJBRWtCLE9BQU87Ozs7d0JBQ0osV0FBVzs7OztvQkFDZ0IsTUFBTTs7d0JBRWpDLFlBQVk7Ozs7eUJBQ1gsYUFBYTs7OztJQUc3QixLQUFLO0FBSUUsV0FKUCxLQUFLLEdBSUs7MEJBSlYsS0FBSzs7QUFLUCxRQUFJLENBQUMsYUFBYSxHQUFHLCtCQUF5QixDQUFBOztBQUU5QyxRQUFNLE9BQU8sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFBO0FBQzdDLFFBQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDO0FBQzFDLFVBQUksRUFBRSxPQUFPO0FBQ2IsYUFBTyxFQUFFLElBQUk7QUFDYixjQUFRLEVBQUUsR0FBRztLQUNkLENBQUMsQ0FBQTtBQUNGLFFBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLHFCQUFlLFlBQVc7QUFDL0MsV0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFBO0tBQ2hCLENBQUMsQ0FBQyxDQUFBOztBQUVILFFBQUksQ0FBQyxRQUFRLEdBQUcsMEJBQWEsS0FBSyxDQUFDLENBQUE7QUFDbkMsUUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFBOztBQUVyQywwQkFBUyxNQUFNLENBQUMsMkRBQVcsUUFBUSxFQUFFLElBQUksQ0FBQyxRQUFRLEFBQUMsR0FBRyxFQUFFLE9BQU8sQ0FBQyxDQUFBO0dBQ2pFOztlQXJCRyxLQUFLOztXQXNCSCxnQkFBQyxRQUE4QixFQUFRO0FBQzNDLFVBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFBO0tBQy9COzs7V0FDTSxtQkFBRztBQUNSLFVBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLENBQUE7S0FDN0I7OztTQTNCRyxLQUFLOzs7QUE4QlgsTUFBTSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUEiLCJmaWxlIjoiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvbGludGVyLXVpLWRlZmF1bHQvbGliL3BhbmVsL2luZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogQGZsb3cgKi9cblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0J1xuaW1wb3J0IFJlYWN0RE9NIGZyb20gJ3JlYWN0LWRvbSdcbmltcG9ydCB7IENvbXBvc2l0ZURpc3Bvc2FibGUsIERpc3Bvc2FibGUgfSBmcm9tICdhdG9tJ1xuXG5pbXBvcnQgRGVsZWdhdGUgZnJvbSAnLi9kZWxlZ2F0ZSdcbmltcG9ydCBDb21wb25lbnQgZnJvbSAnLi9jb21wb25lbnQnXG5pbXBvcnQgdHlwZSB7IExpbnRlck1lc3NhZ2UgfSBmcm9tICcuLi90eXBlcydcblxuY2xhc3MgUGFuZWwge1xuICBkZWxlZ2F0ZTogRGVsZWdhdGU7XG4gIHN1YnNjcmlwdGlvbnM6IENvbXBvc2l0ZURpc3Bvc2FibGU7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuXG4gICAgY29uc3QgZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgY29uc3QgcGFuZWwgPSBhdG9tLndvcmtzcGFjZS5hZGRCb3R0b21QYW5lbCh7XG4gICAgICBpdGVtOiBlbGVtZW50LFxuICAgICAgdmlzaWJsZTogdHJ1ZSxcbiAgICAgIHByaW9yaXR5OiA1MDAsXG4gICAgfSlcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKG5ldyBEaXNwb3NhYmxlKGZ1bmN0aW9uKCkge1xuICAgICAgcGFuZWwuZGVzdHJveSgpXG4gICAgfSkpXG5cbiAgICB0aGlzLmRlbGVnYXRlID0gbmV3IERlbGVnYXRlKHBhbmVsKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQodGhpcy5kZWxlZ2F0ZSlcblxuICAgIFJlYWN0RE9NLnJlbmRlcig8Q29tcG9uZW50IGRlbGVnYXRlPXt0aGlzLmRlbGVnYXRlfSAvPiwgZWxlbWVudClcbiAgfVxuICB1cGRhdGUobWVzc2FnZXM6IEFycmF5PExpbnRlck1lc3NhZ2U+KTogdm9pZCB7XG4gICAgdGhpcy5kZWxlZ2F0ZS51cGRhdGUobWVzc2FnZXMpXG4gIH1cbiAgZGlzcG9zZSgpIHtcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBQYW5lbFxuIl19