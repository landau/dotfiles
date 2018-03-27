var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atomSelectList = require('atom-select-list');

var _atomSelectList2 = _interopRequireDefault(_atomSelectList);

var _atom = require('atom');

var ToggleProviders = (function () {
  function ToggleProviders(action, providers) {
    var _this = this;

    _classCallCheck(this, ToggleProviders);

    this.action = action;
    this.emitter = new _atom.Emitter();
    this.providers = providers;
    this.subscriptions = new _atom.CompositeDisposable();

    this.subscriptions.add(this.emitter);
    this.subscriptions.add(atom.config.observe('linter.disabledProviders', function (disabledProviders) {
      _this.disabledProviders = disabledProviders;
    }));
  }

  _createClass(ToggleProviders, [{
    key: 'getItems',
    value: _asyncToGenerator(function* () {
      var _this2 = this;

      if (this.action === 'disable') {
        return this.providers.filter(function (name) {
          return !_this2.disabledProviders.includes(name);
        });
      }
      return this.disabledProviders;
    })
  }, {
    key: 'process',
    value: _asyncToGenerator(function* (name) {
      if (this.action === 'disable') {
        this.disabledProviders.push(name);
        this.emitter.emit('did-disable', name);
      } else {
        var index = this.disabledProviders.indexOf(name);
        if (index !== -1) {
          this.disabledProviders.splice(index, 1);
        }
      }
      atom.config.set('linter.disabledProviders', this.disabledProviders);
    })
  }, {
    key: 'show',
    value: _asyncToGenerator(function* () {
      var _this3 = this;

      var selectListView = new _atomSelectList2['default']({
        items: yield this.getItems(),
        emptyMessage: 'No matches found',
        filterKeyForItem: function filterKeyForItem(item) {
          return item;
        },
        elementForItem: function elementForItem(item) {
          var li = document.createElement('li');
          li.textContent = item;
          return li;
        },
        didConfirmSelection: function didConfirmSelection(item) {
          _this3.process(item)['catch'](function (e) {
            return console.error('[Linter] Unable to process toggle:', e);
          }).then(function () {
            return _this3.dispose();
          });
        },
        didCancelSelection: function didCancelSelection() {
          _this3.dispose();
        }
      });
      var panel = atom.workspace.addModalPanel({ item: selectListView });

      selectListView.focus();
      this.subscriptions.add(new _atom.Disposable(function () {
        panel.destroy();
      }));
    })
  }, {
    key: 'onDidDispose',
    value: function onDidDispose(callback) {
      return this.emitter.on('did-dispose', callback);
    }
  }, {
    key: 'onDidDisable',
    value: function onDidDisable(callback) {
      return this.emitter.on('did-disable', callback);
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this.emitter.emit('did-dispose');
      this.subscriptions.dispose();
    }
  }]);

  return ToggleProviders;
})();

module.exports = ToggleProviders;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1Ly5hdG9tL3BhY2thZ2VzL2xpbnRlci9saWIvdG9nZ2xlLXZpZXcuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OEJBRTJCLGtCQUFrQjs7OztvQkFDWSxNQUFNOztJQUl6RCxlQUFlO0FBT1IsV0FQUCxlQUFlLENBT1AsTUFBb0IsRUFBRSxTQUF3QixFQUFFOzs7MEJBUHhELGVBQWU7O0FBUWpCLFFBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFBO0FBQ3BCLFFBQUksQ0FBQyxPQUFPLEdBQUcsbUJBQWEsQ0FBQTtBQUM1QixRQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQTtBQUMxQixRQUFJLENBQUMsYUFBYSxHQUFHLCtCQUF5QixDQUFBOztBQUU5QyxRQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUE7QUFDcEMsUUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsMEJBQTBCLEVBQUUsVUFBQyxpQkFBaUIsRUFBSztBQUM1RixZQUFLLGlCQUFpQixHQUFHLGlCQUFpQixDQUFBO0tBQzNDLENBQUMsQ0FBQyxDQUFBO0dBQ0o7O2VBakJHLGVBQWU7OzZCQWtCTCxhQUEyQjs7O0FBQ3ZDLFVBQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxTQUFTLEVBQUU7QUFDN0IsZUFBTyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxVQUFBLElBQUk7aUJBQUksQ0FBQyxPQUFLLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUM7U0FBQSxDQUFDLENBQUE7T0FDN0U7QUFDRCxhQUFPLElBQUksQ0FBQyxpQkFBaUIsQ0FBQTtLQUM5Qjs7OzZCQUNZLFdBQUMsSUFBWSxFQUFpQjtBQUN6QyxVQUFJLElBQUksQ0FBQyxNQUFNLEtBQUssU0FBUyxFQUFFO0FBQzdCLFlBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7QUFDakMsWUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxDQUFBO09BQ3ZDLE1BQU07QUFDTCxZQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFBO0FBQ2xELFlBQUksS0FBSyxLQUFLLENBQUMsQ0FBQyxFQUFFO0FBQ2hCLGNBQUksQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFBO1NBQ3hDO09BQ0Y7QUFDRCxVQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQywwQkFBMEIsRUFBRSxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQTtLQUNwRTs7OzZCQUNTLGFBQUc7OztBQUNYLFVBQU0sY0FBYyxHQUFHLGdDQUFtQjtBQUN4QyxhQUFLLEVBQUUsTUFBTSxJQUFJLENBQUMsUUFBUSxFQUFFO0FBQzVCLG9CQUFZLEVBQUUsa0JBQWtCO0FBQ2hDLHdCQUFnQixFQUFFLDBCQUFBLElBQUk7aUJBQUksSUFBSTtTQUFBO0FBQzlCLHNCQUFjLEVBQUUsd0JBQUMsSUFBSSxFQUFLO0FBQ3hCLGNBQU0sRUFBRSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUE7QUFDdkMsWUFBRSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUE7QUFDckIsaUJBQU8sRUFBRSxDQUFBO1NBQ1Y7QUFDRCwyQkFBbUIsRUFBRSw2QkFBQyxJQUFJLEVBQUs7QUFDN0IsaUJBQUssT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFNLENBQUMsVUFBQSxDQUFDO21CQUFJLE9BQU8sQ0FBQyxLQUFLLENBQUMsb0NBQW9DLEVBQUUsQ0FBQyxDQUFDO1dBQUEsQ0FBQyxDQUFDLElBQUksQ0FBQzttQkFBTSxPQUFLLE9BQU8sRUFBRTtXQUFBLENBQUMsQ0FBQTtTQUNqSDtBQUNELDBCQUFrQixFQUFFLDhCQUFNO0FBQ3hCLGlCQUFLLE9BQU8sRUFBRSxDQUFBO1NBQ2Y7T0FDRixDQUFDLENBQUE7QUFDRixVQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQyxFQUFFLElBQUksRUFBRSxjQUFjLEVBQUUsQ0FBQyxDQUFBOztBQUVwRSxvQkFBYyxDQUFDLEtBQUssRUFBRSxDQUFBO0FBQ3RCLFVBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLHFCQUFlLFlBQVc7QUFDL0MsYUFBSyxDQUFDLE9BQU8sRUFBRSxDQUFBO09BQ2hCLENBQUMsQ0FBQyxDQUFBO0tBQ0o7OztXQUNXLHNCQUFDLFFBQXFCLEVBQWM7QUFDOUMsYUFBTyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxhQUFhLEVBQUUsUUFBUSxDQUFDLENBQUE7S0FDaEQ7OztXQUNXLHNCQUFDLFFBQWlDLEVBQWM7QUFDMUQsYUFBTyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxhQUFhLEVBQUUsUUFBUSxDQUFDLENBQUE7S0FDaEQ7OztXQUNNLG1CQUFHO0FBQ1IsVUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUE7QUFDaEMsVUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtLQUM3Qjs7O1NBckVHLGVBQWU7OztBQXdFckIsTUFBTSxDQUFDLE9BQU8sR0FBRyxlQUFlLENBQUEiLCJmaWxlIjoiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvbGludGVyL2xpYi90b2dnbGUtdmlldy5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIEBmbG93ICovXG5cbmltcG9ydCBTZWxlY3RMaXN0VmlldyBmcm9tICdhdG9tLXNlbGVjdC1saXN0J1xuaW1wb3J0IHsgQ29tcG9zaXRlRGlzcG9zYWJsZSwgRW1pdHRlciwgRGlzcG9zYWJsZSB9IGZyb20gJ2F0b20nXG5cbnR5cGUgVG9nZ2xlQWN0aW9uID0gJ2VuYWJsZScgfCAnZGlzYWJsZSdcblxuY2xhc3MgVG9nZ2xlUHJvdmlkZXJzIHtcbiAgYWN0aW9uOiBUb2dnbGVBY3Rpb247XG4gIGVtaXR0ZXI6IEVtaXR0ZXI7XG4gIHByb3ZpZGVyczogQXJyYXk8c3RyaW5nPjtcbiAgc3Vic2NyaXB0aW9uczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcbiAgZGlzYWJsZWRQcm92aWRlcnM6IEFycmF5PHN0cmluZz47XG5cbiAgY29uc3RydWN0b3IoYWN0aW9uOiBUb2dnbGVBY3Rpb24sIHByb3ZpZGVyczogQXJyYXk8c3RyaW5nPikge1xuICAgIHRoaXMuYWN0aW9uID0gYWN0aW9uXG4gICAgdGhpcy5lbWl0dGVyID0gbmV3IEVtaXR0ZXIoKVxuICAgIHRoaXMucHJvdmlkZXJzID0gcHJvdmlkZXJzXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZCh0aGlzLmVtaXR0ZXIpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbmZpZy5vYnNlcnZlKCdsaW50ZXIuZGlzYWJsZWRQcm92aWRlcnMnLCAoZGlzYWJsZWRQcm92aWRlcnMpID0+IHtcbiAgICAgIHRoaXMuZGlzYWJsZWRQcm92aWRlcnMgPSBkaXNhYmxlZFByb3ZpZGVyc1xuICAgIH0pKVxuICB9XG4gIGFzeW5jIGdldEl0ZW1zKCk6IFByb21pc2U8QXJyYXk8c3RyaW5nPj4ge1xuICAgIGlmICh0aGlzLmFjdGlvbiA9PT0gJ2Rpc2FibGUnKSB7XG4gICAgICByZXR1cm4gdGhpcy5wcm92aWRlcnMuZmlsdGVyKG5hbWUgPT4gIXRoaXMuZGlzYWJsZWRQcm92aWRlcnMuaW5jbHVkZXMobmFtZSkpXG4gICAgfVxuICAgIHJldHVybiB0aGlzLmRpc2FibGVkUHJvdmlkZXJzXG4gIH1cbiAgYXN5bmMgcHJvY2VzcyhuYW1lOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAodGhpcy5hY3Rpb24gPT09ICdkaXNhYmxlJykge1xuICAgICAgdGhpcy5kaXNhYmxlZFByb3ZpZGVycy5wdXNoKG5hbWUpXG4gICAgICB0aGlzLmVtaXR0ZXIuZW1pdCgnZGlkLWRpc2FibGUnLCBuYW1lKVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBpbmRleCA9IHRoaXMuZGlzYWJsZWRQcm92aWRlcnMuaW5kZXhPZihuYW1lKVxuICAgICAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgICAgICB0aGlzLmRpc2FibGVkUHJvdmlkZXJzLnNwbGljZShpbmRleCwgMSlcbiAgICAgIH1cbiAgICB9XG4gICAgYXRvbS5jb25maWcuc2V0KCdsaW50ZXIuZGlzYWJsZWRQcm92aWRlcnMnLCB0aGlzLmRpc2FibGVkUHJvdmlkZXJzKVxuICB9XG4gIGFzeW5jIHNob3coKSB7XG4gICAgY29uc3Qgc2VsZWN0TGlzdFZpZXcgPSBuZXcgU2VsZWN0TGlzdFZpZXcoe1xuICAgICAgaXRlbXM6IGF3YWl0IHRoaXMuZ2V0SXRlbXMoKSxcbiAgICAgIGVtcHR5TWVzc2FnZTogJ05vIG1hdGNoZXMgZm91bmQnLFxuICAgICAgZmlsdGVyS2V5Rm9ySXRlbTogaXRlbSA9PiBpdGVtLFxuICAgICAgZWxlbWVudEZvckl0ZW06IChpdGVtKSA9PiB7XG4gICAgICAgIGNvbnN0IGxpID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGknKVxuICAgICAgICBsaS50ZXh0Q29udGVudCA9IGl0ZW1cbiAgICAgICAgcmV0dXJuIGxpXG4gICAgICB9LFxuICAgICAgZGlkQ29uZmlybVNlbGVjdGlvbjogKGl0ZW0pID0+IHtcbiAgICAgICAgdGhpcy5wcm9jZXNzKGl0ZW0pLmNhdGNoKGUgPT4gY29uc29sZS5lcnJvcignW0xpbnRlcl0gVW5hYmxlIHRvIHByb2Nlc3MgdG9nZ2xlOicsIGUpKS50aGVuKCgpID0+IHRoaXMuZGlzcG9zZSgpKVxuICAgICAgfSxcbiAgICAgIGRpZENhbmNlbFNlbGVjdGlvbjogKCkgPT4ge1xuICAgICAgICB0aGlzLmRpc3Bvc2UoKVxuICAgICAgfSxcbiAgICB9KVxuICAgIGNvbnN0IHBhbmVsID0gYXRvbS53b3Jrc3BhY2UuYWRkTW9kYWxQYW5lbCh7IGl0ZW06IHNlbGVjdExpc3RWaWV3IH0pXG5cbiAgICBzZWxlY3RMaXN0Vmlldy5mb2N1cygpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChuZXcgRGlzcG9zYWJsZShmdW5jdGlvbigpIHtcbiAgICAgIHBhbmVsLmRlc3Ryb3koKVxuICAgIH0pKVxuICB9XG4gIG9uRGlkRGlzcG9zZShjYWxsYmFjazogKCgpID0+IGFueSkpOiBEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5lbWl0dGVyLm9uKCdkaWQtZGlzcG9zZScsIGNhbGxiYWNrKVxuICB9XG4gIG9uRGlkRGlzYWJsZShjYWxsYmFjazogKChuYW1lOiBzdHJpbmcpID0+IGFueSkpOiBEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5lbWl0dGVyLm9uKCdkaWQtZGlzYWJsZScsIGNhbGxiYWNrKVxuICB9XG4gIGRpc3Bvc2UoKSB7XG4gICAgdGhpcy5lbWl0dGVyLmVtaXQoJ2RpZC1kaXNwb3NlJylcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBUb2dnbGVQcm92aWRlcnNcbiJdfQ==