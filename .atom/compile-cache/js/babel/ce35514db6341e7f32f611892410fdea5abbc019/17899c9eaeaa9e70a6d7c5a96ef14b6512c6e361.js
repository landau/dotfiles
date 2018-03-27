Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _commands = require('./commands');

var _commands2 = _interopRequireDefault(_commands);

var _viewList = require('./view-list');

var _viewList2 = _interopRequireDefault(_viewList);

var _providersList = require('./providers-list');

var _providersList2 = _interopRequireDefault(_providersList);

var _providersHighlight = require('./providers-highlight');

var _providersHighlight2 = _interopRequireDefault(_providersHighlight);

var Intentions = (function () {
  function Intentions() {
    var _this = this;

    _classCallCheck(this, Intentions);

    this.active = null;
    this.commands = new _commands2['default']();
    this.providersList = new _providersList2['default']();
    this.providersHighlight = new _providersHighlight2['default']();
    this.subscriptions = new _atom.CompositeDisposable();

    this.subscriptions.add(this.commands);
    this.subscriptions.add(this.providersList);
    this.subscriptions.add(this.providersHighlight);

    this.commands.onListShow(_asyncToGenerator(function* (textEditor) {
      var results = yield _this.providersList.trigger(textEditor);
      if (!results.length) {
        return false;
      }

      var listView = new _viewList2['default']();
      var subscriptions = new _atom.CompositeDisposable();

      listView.activate(textEditor, results);
      listView.onDidSelect(function (intention) {
        intention.selected();
        subscriptions.dispose();
      });

      subscriptions.add(listView);
      subscriptions.add(new _atom.Disposable(function () {
        if (_this.active === subscriptions) {
          _this.active = null;
        }
      }));
      subscriptions.add(_this.commands.onListMove(function (movement) {
        listView.move(movement);
      }));
      subscriptions.add(_this.commands.onListConfirm(function () {
        listView.select();
      }));
      subscriptions.add(_this.commands.onListHide(function () {
        subscriptions.dispose();
      }));
      _this.active = subscriptions;
      return true;
    }));
    this.commands.onHighlightsShow(_asyncToGenerator(function* (textEditor) {
      var results = yield _this.providersHighlight.trigger(textEditor);
      if (!results.length) {
        return false;
      }

      var painted = _this.providersHighlight.paint(textEditor, results);
      var subscriptions = new _atom.CompositeDisposable();

      subscriptions.add(new _atom.Disposable(function () {
        if (_this.active === subscriptions) {
          _this.active = null;
        }
      }));
      subscriptions.add(_this.commands.onHighlightsHide(function () {
        subscriptions.dispose();
      }));
      subscriptions.add(painted);
      _this.active = subscriptions;

      return true;
    }));
  }

  _createClass(Intentions, [{
    key: 'activate',
    value: function activate() {
      this.commands.activate();
    }
  }, {
    key: 'consumeListProvider',
    value: function consumeListProvider(provider) {
      this.providersList.addProvider(provider);
    }
  }, {
    key: 'deleteListProvider',
    value: function deleteListProvider(provider) {
      this.providersList.deleteProvider(provider);
    }
  }, {
    key: 'consumeHighlightProvider',
    value: function consumeHighlightProvider(provider) {
      this.providersHighlight.addProvider(provider);
    }
  }, {
    key: 'deleteHighlightProvider',
    value: function deleteHighlightProvider(provider) {
      this.providersHighlight.deleteProvider(provider);
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this.subscriptions.dispose();
      if (this.active) {
        this.active.dispose();
      }
    }
  }]);

  return Intentions;
})();

exports['default'] = Intentions;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2ludGVudGlvbnMvbGliL21haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O29CQUVnRCxNQUFNOzt3QkFFakMsWUFBWTs7Ozt3QkFDWixhQUFhOzs7OzZCQUNSLGtCQUFrQjs7OztrQ0FDYix1QkFBdUI7Ozs7SUFHakMsVUFBVTtBQU1sQixXQU5RLFVBQVUsR0FNZjs7OzBCQU5LLFVBQVU7O0FBTzNCLFFBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFBO0FBQ2xCLFFBQUksQ0FBQyxRQUFRLEdBQUcsMkJBQWMsQ0FBQTtBQUM5QixRQUFJLENBQUMsYUFBYSxHQUFHLGdDQUFtQixDQUFBO0FBQ3hDLFFBQUksQ0FBQyxrQkFBa0IsR0FBRyxxQ0FBd0IsQ0FBQTtBQUNsRCxRQUFJLENBQUMsYUFBYSxHQUFHLCtCQUF5QixDQUFBOztBQUU5QyxRQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUE7QUFDckMsUUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFBO0FBQzFDLFFBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFBOztBQUUvQyxRQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsbUJBQUMsV0FBTSxVQUFVLEVBQUk7QUFDM0MsVUFBTSxPQUFPLEdBQUcsTUFBTSxNQUFLLGFBQWEsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUE7QUFDNUQsVUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUU7QUFDbkIsZUFBTyxLQUFLLENBQUE7T0FDYjs7QUFFRCxVQUFNLFFBQVEsR0FBRywyQkFBYyxDQUFBO0FBQy9CLFVBQU0sYUFBYSxHQUFHLCtCQUF5QixDQUFBOztBQUUvQyxjQUFRLENBQUMsUUFBUSxDQUFDLFVBQVUsRUFB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Q0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLENBQUE7QUFDNUIsVUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFO0FBQ2YsWUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQTtPQUN0QjtLQUNGOzs7U0E3RmtCLFVBQVU7OztxQkFBVixVQUFVIiwiZmlsZSI6Ii9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2ludGVudGlvbnMvbGliL21haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBAZmxvdyAqL1xuXG5pbXBvcnQgeyBDb21wb3NpdGVEaXNwb3NhYmxlLCBEaXNwb3NhYmxlIH0gZnJvbSAnYXRvbSdcblxuaW1wb3J0IENvbW1hbmRzIGZyb20gJy4vY29tbWFuZHMnXG5pbXBvcnQgTGlzdFZpZXcgZnJvbSAnLi92aWV3LWxpc3QnXG5pbXBvcnQgUHJvdmlkZXJzTGlzdCBmcm9tICcuL3Byb3ZpZGVycy1saXN0J1xuaW1wb3J0IFByb3ZpZGVyc0hpZ2hsaWdodCBmcm9tICcuL3Byb3ZpZGVycy1oaWdobGlnaHQnXG5pbXBvcnQgdHlwZSB7IExpc3RQcm92aWRlciwgSGlnaGxpZ2h0UHJvdmlkZXIgfSBmcm9tICcuL3R5cGVzJ1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBJbnRlbnRpb25zIHtcbiAgYWN0aXZlOiA/RGlzcG9zYWJsZTtcbiAgY29tbWFuZHM6IENvbW1hbmRzO1xuICBwcm92aWRlcnNMaXN0OiBQcm92aWRlcnNMaXN0O1xuICBwcm92aWRlcnNIaWdobGlnaHQ6IFByb3ZpZGVyc0hpZ2hsaWdodDtcbiAgc3Vic2NyaXB0aW9uczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5hY3RpdmUgPSBudWxsXG4gICAgdGhpcy5jb21tYW5kcyA9IG5ldyBDb21tYW5kcygpXG4gICAgdGhpcy5wcm92aWRlcnNMaXN0ID0gbmV3IFByb3ZpZGVyc0xpc3QoKVxuICAgIHRoaXMucHJvdmlkZXJzSGlnaGxpZ2h0ID0gbmV3IFByb3ZpZGVyc0hpZ2hsaWdodCgpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZCh0aGlzLmNvbW1hbmRzKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQodGhpcy5wcm92aWRlcnNMaXN0KVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQodGhpcy5wcm92aWRlcnNIaWdobGlnaHQpXG5cbiAgICB0aGlzLmNvbW1hbmRzLm9uTGlzdFNob3coYXN5bmMgdGV4dEVkaXRvciA9PiB7XG4gICAgICBjb25zdCByZXN1bHRzID0gYXdhaXQgdGhpcy5wcm92aWRlcnNMaXN0LnRyaWdnZXIodGV4dEVkaXRvcilcbiAgICAgIGlmICghcmVzdWx0cy5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGxpc3RWaWV3ID0gbmV3IExpc3RWaWV3KClcbiAgICAgIGNvbnN0IHN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG5cbiAgICAgIGxpc3RWaWV3LmFjdGl2YXRlKHRleHRFZGl0b3IsIHJlc3VsdHMpXG4gICAgICBsaXN0Vmlldy5vbkRpZFNlbGVjdChmdW5jdGlvbihpbnRlbnRpb24pIHtcbiAgICAgICAgaW50ZW50aW9uLnNlbGVjdGVkKClcbiAgICAgICAgc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiAgICAgIH0pXG5cbiAgICAgIHN1YnNjcmlwdGlvbnMuYWRkKGxpc3RWaWV3KVxuICAgICAgc3Vic2NyaXB0aW9ucy5hZGQobmV3IERpc3Bvc2FibGUoKCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5hY3RpdmUgPT09IHN1YnNjcmlwdGlvbnMpIHtcbiAgICAgICAgICB0aGlzLmFjdGl2ZSA9IG51bGxcbiAgICAgICAgfVxuICAgICAgfSkpXG4gICAgICBzdWJzY3JpcHRpb25zLmFkZCh0aGlzLmNvbW1hbmRzLm9uTGlzdE1vdmUoZnVuY3Rpb24obW92ZW1lbnQpIHtcbiAgICAgICAgbGlzdFZpZXcubW92ZShtb3ZlbWVudClcbiAgICAgIH0pKVxuICAgICAgc3Vic2NyaXB0aW9ucy5hZGQodGhpcy5jb21tYW5kcy5vbkxpc3RDb25maXJtKGZ1bmN0aW9uKCkge1xuICAgICAgICBsaXN0Vmlldy5zZWxlY3QoKVxuICAgICAgfSkpXG4gICAgICBzdWJzY3JpcHRpb25zLmFkZCh0aGlzLmNvbW1hbmRzLm9uTGlzdEhpZGUoZnVuY3Rpb24oKSB7XG4gICAgICAgIHN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG4gICAgICB9KSlcbiAgICAgIHRoaXMuYWN0aXZlID0gc3Vic2NyaXB0aW9uc1xuICAgICAgcmV0dXJuIHRydWVcbiAgICB9KVxuICAgIHRoaXMuY29tbWFuZHMub25IaWdobGlnaHRzU2hvdyhhc3luYyB0ZXh0RWRpdG9yID0+IHtcbiAgICAgIGNvbnN0IHJlc3VsdHMgPSBhd2FpdCB0aGlzLnByb3ZpZGVyc0hpZ2hsaWdodC50cmlnZ2VyKHRleHRFZGl0b3IpXG4gICAgICBpZiAoIXJlc3VsdHMubGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgfVxuXG4gICAgICBjb25zdCBwYWludGVkID0gdGhpcy5wcm92aWRlcnNIaWdobGlnaHQucGFpbnQodGV4dEVkaXRvciwgcmVzdWx0cylcbiAgICAgIGNvbnN0IHN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG5cbiAgICAgIHN1YnNjcmlwdGlvbnMuYWRkKG5ldyBEaXNwb3NhYmxlKCgpID0+IHtcbiAgICAgICAgaWYgKHRoaXMuYWN0aXZlID09PSBzdWJzY3JpcHRpb25zKSB7XG4gICAgICAgICAgdGhpcy5hY3RpdmUgPSBudWxsXG4gICAgICAgIH1cbiAgICAgIH0pKVxuICAgICAgc3Vic2NyaXB0aW9ucy5hZGQodGhpcy5jb21tYW5kcy5vbkhpZ2hsaWdodHNIaWRlKGZ1bmN0aW9uKCkge1xuICAgICAgICBzdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICAgICAgfSkpXG4gICAgICBzdWJzY3JpcHRpb25zLmFkZChwYWludGVkKVxuICAgICAgdGhpcy5hY3RpdmUgPSBzdWJzY3JpcHRpb25zXG5cbiAgICAgIHJldHVybiB0cnVlXG4gICAgfSlcbiAgfVxuICBhY3RpdmF0ZSgpIHtcbiAgICB0aGlzLmNvbW1hbmRzLmFjdGl2YXRlKClcbiAgfVxuICBjb25zdW1lTGlzdFByb3ZpZGVyKHByb3ZpZGVyOiBMaXN0UHJvdmlkZXIpIHtcbiAgICB0aGlzLnByb3ZpZGVyc0xpc3QuYWRkUHJvdmlkZXIocHJvdmlkZXIpXG4gIH1cbiAgZGVsZXRlTGlzdFByb3ZpZGVyKHByb3ZpZGVyOiBMaXN0UHJvdmlkZXIpIHtcbiAgICB0aGlzLnByb3ZpZGVyc0xpc3QuZGVsZXRlUHJvdmlkZXIocHJvdmlkZXIpXG4gIH1cbiAgY29uc3VtZUhpZ2hsaWdodFByb3ZpZGVyKHByb3ZpZGVyOiBIaWdobGlnaHRQcm92aWRlcikge1xuICAgIHRoaXMucHJvdmlkZXJzSGlnaGxpZ2h0LmFkZFByb3ZpZGVyKHByb3ZpZGVyKVxuICB9XG4gIGRlbGV0ZUhpZ2hsaWdodFByb3ZpZGVyKHByb3ZpZGVyOiBIaWdobGlnaHRQcm92aWRlcikge1xuICAgIHRoaXMucHJvdmlkZXJzSGlnaGxpZ2h0LmRlbGV0ZVByb3ZpZGVyKHByb3ZpZGVyKVxuICB9XG4gIGRpc3Bvc2UoKSB7XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICAgIGlmICh0aGlzLmFjdGl2ZSkge1xuICAgICAgdGhpcy5hY3RpdmUuZGlzcG9zZSgpXG4gICAgfVxuICB9XG59XG4iXX0=