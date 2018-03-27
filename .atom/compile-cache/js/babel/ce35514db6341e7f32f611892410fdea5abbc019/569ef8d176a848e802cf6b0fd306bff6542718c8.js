Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _disposify = require('disposify');

var _disposify2 = _interopRequireDefault(_disposify);

var _element = require('./element');

var _element2 = _interopRequireDefault(_element);

var _registry = require('./registry');

var _registry2 = _interopRequireDefault(_registry);

var BusySignal = (function () {
  function BusySignal() {
    var _this = this;

    _classCallCheck(this, BusySignal);

    this.element = new _element2['default']();
    this.registry = new _registry2['default']();
    this.subscriptions = new _atom.CompositeDisposable();

    this.subscriptions.add(this.element);
    this.subscriptions.add(this.registry);

    this.registry.onDidUpdate(function () {
      _this.element.update(_this.registry.getTilesActive(), _this.registry.getTilesOld());
    });
  }

  _createClass(BusySignal, [{
    key: 'attach',
    value: function attach(statusBar) {
      this.subscriptions.add((0, _disposify2['default'])(statusBar.addRightTile({
        item: this.element,
        priority: 500
      })));
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this.subscriptions.dispose();
    }
  }]);

  return BusySignal;
})();

exports['default'] = BusySignal;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2J1c3ktc2lnbmFsL2xpYi9tYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7b0JBRW9DLE1BQU07O3lCQUNwQixXQUFXOzs7O3VCQUNiLFdBQVc7Ozs7d0JBQ1YsWUFBWTs7OztJQUVaLFVBQVU7QUFLbEIsV0FMUSxVQUFVLEdBS2Y7OzswQkFMSyxVQUFVOztBQU0zQixRQUFJLENBQUMsT0FBTyxHQUFHLDBCQUFhLENBQUE7QUFDNUIsUUFBSSxDQUFDLFFBQVEsR0FBRywyQkFBYyxDQUFBO0FBQzlCLFFBQUksQ0FBQyxhQUFhLEdBQUcsK0JBQXlCLENBQUE7O0FBRTlDLFFBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQTtBQUNwQyxRQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUE7O0FBRXJDLFFBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLFlBQU07QUFDOUIsWUFBSyxPQUFPLENBQUMsTUFBTSxDQUFDLE1BQUssUUFBUSxDQUFDLGNBQWMsRUFBRSxFQUFFLE1BQUssUUFBUSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUE7S0FDakYsQ0FBQyxDQUFBO0dBQ0g7O2VBaEJrQixVQUFVOztXQWlCdkIsZ0JBQUMsU0FBaUIsRUFBRTtBQUN4QixVQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyw0QkFBVSxTQUFTLENBQUMsWUFBWSxDQUFDO0FBQ3RELFlBQUksRUFBRSxJQUFJLENBQUMsT0FBTztBQUNsQixnQkFBUSxFQUFFLEdBQUc7T0FDZCxDQUFDLENBQUMsQ0FBQyxDQUFBO0tBQ0w7OztXQUNNLG1CQUFHO0FBQ1IsVUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtLQUM3Qjs7O1NBekJrQixVQUFVOzs7cUJBQVYsVUFBVSIsImZpbGUiOiIvVXNlcnMvdGxhbmRhdS9kb3RmaWxlcy8uYXRvbS9wYWNrYWdlcy9idXN5LXNpZ25hbC9saWIvbWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIEBmbG93ICovXG5cbmltcG9ydCB7IENvbXBvc2l0ZURpc3Bvc2FibGUgfSBmcm9tICdhdG9tJ1xuaW1wb3J0IGRpc3Bvc2lmeSBmcm9tICdkaXNwb3NpZnknXG5pbXBvcnQgRWxlbWVudCBmcm9tICcuL2VsZW1lbnQnXG5pbXBvcnQgUmVnaXN0cnkgZnJvbSAnLi9yZWdpc3RyeSdcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQnVzeVNpZ25hbCB7XG4gIGVsZW1lbnQ6IEVsZW1lbnQ7XG4gIHJlZ2lzdHJ5OiBSZWdpc3RyeTtcbiAgc3Vic2NyaXB0aW9uczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLmVsZW1lbnQgPSBuZXcgRWxlbWVudCgpXG4gICAgdGhpcy5yZWdpc3RyeSA9IG5ldyBSZWdpc3RyeSgpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZCh0aGlzLmVsZW1lbnQpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZCh0aGlzLnJlZ2lzdHJ5KVxuXG4gICAgdGhpcy5yZWdpc3RyeS5vbkRpZFVwZGF0ZSgoKSA9PiB7XG4gICAgICB0aGlzLmVsZW1lbnQudXBkYXRlKHRoaXMucmVnaXN0cnkuZ2V0VGlsZXNBY3RpdmUoKSwgdGhpcy5yZWdpc3RyeS5nZXRUaWxlc09sZCgpKVxuICAgIH0pXG4gIH1cbiAgYXR0YWNoKHN0YXR1c0JhcjogT2JqZWN0KSB7XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChkaXNwb3NpZnkoc3RhdHVzQmFyLmFkZFJpZ2h0VGlsZSh7XG4gICAgICBpdGVtOiB0aGlzLmVsZW1lbnQsXG4gICAgICBwcmlvcml0eTogNTAwLFxuICAgIH0pKSlcbiAgfVxuICBkaXNwb3NlKCkge1xuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiAgfVxufVxuIl19