Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _sbConfigFile = require('sb-config-file');

var _sbConfigFile2 = _interopRequireDefault(_sbConfigFile);

var _atomSelectList = require('atom-select-list');

var _atomSelectList2 = _interopRequireDefault(_atomSelectList);

var _atom = require('atom');

var _helpers = require('./helpers');

var ToggleProviders = (function () {
  function ToggleProviders(action, providers) {
    _classCallCheck(this, ToggleProviders);

    this.action = action;
    this.config = null;
    this.emitter = new _atom.Emitter();
    this.providers = providers;
    this.subscriptions = new _atom.CompositeDisposable();

    this.subscriptions.add(this.emitter);
  }

  _createClass(ToggleProviders, [{
    key: 'getConfig',
    value: _asyncToGenerator(function* () {
      if (!this.config) {
        this.config = yield (0, _helpers.getConfigFile)();
      }
      return this.config;
    })
  }, {
    key: 'getItems',
    value: _asyncToGenerator(function* () {
      var disabled = yield (yield this.getConfig()).get('disabled');
      if (this.action === 'disable') {
        return this.providers.filter(function (name) {
          return !disabled.includes(name);
        });
      }
      return disabled;
    })
  }, {
    key: 'process',
    value: _asyncToGenerator(function* (name) {
      var config = yield this.getConfig();
      var disabled = yield config.get('disabled');
      if (this.action === 'disable') {
        disabled.push(name);
        this.emitter.emit('did-disable', name);
      } else {
        var index = disabled.indexOf(name);
        if (index !== -1) {
          disabled.splice(index, 1);
        }
      }
      yield this.config.set('disabled', disabled);
    })
  }, {
    key: 'show',
    value: _asyncToGenerator(function* () {
      var _this = this;

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
          _this.process(item)['catch'](function (e) {
            return console.error('[Linter] Unable to process toggle:', e);
          }).then(function () {
            return _this.dispose();
          });
        },
        didCancelSelection: function didCancelSelection() {
          _this.dispose();
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

exports['default'] = ToggleProviders;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci9saWIvdG9nZ2xlLXZpZXcuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OzRCQUV1QixnQkFBZ0I7Ozs7OEJBQ1osa0JBQWtCOzs7O29CQUNZLE1BQU07O3VCQUNqQyxXQUFXOztJQUlwQixlQUFlO0FBT3ZCLFdBUFEsZUFBZSxDQU90QixNQUFvQixFQUFFLFNBQXdCLEVBQUU7MEJBUHpDLGVBQWU7O0FBUWhDLFFBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFBO0FBQ3BCLFFBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFBO0FBQ2xCLFFBQUksQ0FBQyxPQUFPLEdBQUcsbUJBQWEsQ0FBQTtBQUM1QixRQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQTtBQUMxQixRQUFJLENBQUMsYUFBYSxHQUFHLCtCQUF5QixDQUFBOztBQUU5QyxRQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUE7R0FDckM7O2VBZmtCLGVBQWU7OzZCQWdCbkIsYUFBd0I7QUFDckMsVUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUU7QUFDaEIsWUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLDZCQUFlLENBQUE7T0FDcEM7QUFDRCxhQUFPLElBQUksQ0FBQyxNQUFNLENBQUE7S0FDbkI7Ozs2QkFDYSxhQUEyQjtBQUN2QyxVQUFNLFFBQVEsR0FBRyxNQUFNLENBQUMsTUFBTSxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUEsQ0FBRSxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUE7QUFDL0QsVUFBSSxJQUFJLENBQUMsTUFBTSxLQUFLLFNBQVMsRUFBRTtBQUM3QixlQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLFVBQUEsSUFBSTtpQkFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDO1NBQUEsQ0FBQyxDQUFBO09BQy9EO0FBQ0QsYUFBTyxRQUFRLENBQUE7S0FDaEI7Ozs2QkFDWSxXQUFDLElBQVksRUFBaUI7QUFDekMsVUFBTSxNQUFNLEdBQUcsTUFBTSxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUE7QUFDckMsVUFBTSxRQUF1QixHQUFHLE1BQU0sTUFBTSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQTtBQUM1RCxVQUFJLElBQUksQ0FBQyxNQUFNLEtBQUssU0FBUyxFQUFFO0FBQzdCLGdCQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO0FBQ25CLFlBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsQ0FBQTtPQUN2QyxNQUFNO0FBQ0wsWUFBTSxLQUFLLEdBQUcsUUFBUSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQTtBQUNwQyxZQUFJLEtBQUssS0FBSyxDQUFDLENBQUMsRUFBRTtBQUNoQixrQkFBUSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUE7U0FDMUI7T0FDRjtBQUNELFlBQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLFFBQVEsQ0FBQyxDQUFBO0tBQzVDOzs7NkJBQ1MsYUFBRzs7O0FBQ1gsVUFBTSxjQUFjLEdBQUcsZ0NBQW1CO0FBQ3hDLGFBQUssRUFBRSxNQUFNLElBQUksQ0FBQyxRQUFRLEVBQUU7QUFDNUIsb0JBQVksRUFBRSxrQkFBa0I7QUFDaEMsd0JBQWdCLEVBQUUsMEJBQUEsSUFBSTtpQkFBSSxJQUFJO1NBQUE7QUFDOUIsc0JBQWMsRUFBRSx3QkFBQyxJQUFJLEVBQUs7QUFDeEIsY0FBTSxFQUFFLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQTtBQUN2QyxZQUFFLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQTtBQUNyQixpQkFBTyxFQUFFLENBQUE7U0FDVjtBQUNELDJCQUFtQixFQUFFLDZCQUFDLElBQUksRUFBSztBQUM3QixnQkFBSyxPQUFPLENBQUMsSUFBSSxDQUFDLFNBQU0sQ0FBQyxVQUFBLENBQUM7bUJBQUksT0FBTyxDQUFDLEtBQUssQ0FBQyxvQ0FBb0MsRUFBRSxDQUFDLENBQUM7V0FBQSxDQUFDLENBQUMsSUFBSSxDQUFDO21CQUFNLE1BQUssT0FBTyxFQUFFO1dBQUEsQ0FBQyxDQUFBO1NBQ2pIO0FBQ0QsMEJBQWtCLEVBQUUsOEJBQU07QUFDeEIsZ0JBQUssT0FBTyxFQUFFLENBQUE7U0FDZjtPQUNGLENBQUMsQ0FBQTtBQUNGLFVBQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDLEVBQUUsSUFBSSxFQUFFLGNBQWMsRUFBRSxDQUFDLENBQUE7O0FBRXBFLG9CQUFjLENBQUMsS0FBSyxFQUFFLENBQUE7QUFDdEIsVUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMscUJBQWUsWUFBVztBQUMvQyxhQUFLLENBQUMsT0FBTyxFQUFFLENBQUE7T0FDaEIsQ0FBQyxDQUFDLENBQUE7S0FDSjs7O1dBQ1csc0JBQUMsUUFBcUIsRUFBYztBQUM5QyxhQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLGFBQWEsRUFBRSxRQUFRLENBQUMsQ0FBQTtLQUNoRDs7O1dBQ1csc0JBQUMsUUFBaUMsRUFBYztBQUMxRCxhQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLGFBQWEsRUFBRSxRQUFRLENBQUMsQ0FBQTtLQUNoRDs7O1dBQ00sbUJBQUc7QUFDUixVQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQTtBQUNoQyxVQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxDQUFBO0tBQzdCOzs7U0E1RWtCLGVBQWU7OztxQkFBZixlQUFlIiwiZmlsZSI6Ii9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci9saWIvdG9nZ2xlLXZpZXcuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBAZmxvdyAqL1xuXG5pbXBvcnQgQ29uZmlnRmlsZSBmcm9tICdzYi1jb25maWctZmlsZSdcbmltcG9ydCBTZWxlY3RMaXN0VmlldyBmcm9tICdhdG9tLXNlbGVjdC1saXN0J1xuaW1wb3J0IHsgQ29tcG9zaXRlRGlzcG9zYWJsZSwgRW1pdHRlciwgRGlzcG9zYWJsZSB9IGZyb20gJ2F0b20nXG5pbXBvcnQgeyBnZXRDb25maWdGaWxlIH0gZnJvbSAnLi9oZWxwZXJzJ1xuXG50eXBlIFRvZ2dsZUFjdGlvbiA9ICdlbmFibGUnIHwgJ2Rpc2FibGUnXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFRvZ2dsZVByb3ZpZGVycyB7XG4gIGFjdGlvbjogVG9nZ2xlQWN0aW9uO1xuICBjb25maWc6IENvbmZpZ0ZpbGU7XG4gIGVtaXR0ZXI6IEVtaXR0ZXI7XG4gIHByb3ZpZGVyczogQXJyYXk8c3RyaW5nPjtcbiAgc3Vic2NyaXB0aW9uczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcblxuICBjb25zdHJ1Y3RvcihhY3Rpb246IFRvZ2dsZUFjdGlvbiwgcHJvdmlkZXJzOiBBcnJheTxzdHJpbmc+KSB7XG4gICAgdGhpcy5hY3Rpb24gPSBhY3Rpb25cbiAgICB0aGlzLmNvbmZpZyA9IG51bGxcbiAgICB0aGlzLmVtaXR0ZXIgPSBuZXcgRW1pdHRlcigpXG4gICAgdGhpcy5wcm92aWRlcnMgPSBwcm92aWRlcnNcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG5cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKHRoaXMuZW1pdHRlcilcbiAgfVxuICBhc3luYyBnZXRDb25maWcoKTogUHJvbWlzZTxDb25maWdGaWxlPiB7XG4gICAgaWYgKCF0aGlzLmNvbmZpZykge1xuICAgICAgdGhpcy5jb25maWcgPSBhd2FpdCBnZXRDb25maWdGaWxlKClcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuY29uZmlnXG4gIH1cbiAgYXN5bmMgZ2V0SXRlbXMoKTogUHJvbWlzZTxBcnJheTxzdHJpbmc+PiB7XG4gICAgY29uc3QgZGlzYWJsZWQgPSBhd2FpdCAoYXdhaXQgdGhpcy5nZXRDb25maWcoKSkuZ2V0KCdkaXNhYmxlZCcpXG4gICAgaWYgKHRoaXMuYWN0aW9uID09PSAnZGlzYWJsZScpIHtcbiAgICAgIHJldHVybiB0aGlzLnByb3ZpZGVycy5maWx0ZXIobmFtZSA9PiAhZGlzYWJsZWQuaW5jbHVkZXMobmFtZSkpXG4gICAgfVxuICAgIHJldHVybiBkaXNhYmxlZFxuICB9XG4gIGFzeW5jIHByb2Nlc3MobmFtZTogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgY29uZmlnID0gYXdhaXQgdGhpcy5nZXRDb25maWcoKVxuICAgIGNvbnN0IGRpc2FibGVkOiBBcnJheTxzdHJpbmc+ID0gYXdhaXQgY29uZmlnLmdldCgnZGlzYWJsZWQnKVxuICAgIGlmICh0aGlzLmFjdGlvbiA9PT0gJ2Rpc2FibGUnKSB7XG4gICAgICBkaXNhYmxlZC5wdXNoKG5hbWUpXG4gICAgICB0aGlzLmVtaXR0ZXIuZW1pdCgnZGlkLWRpc2FibGUnLCBuYW1lKVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBpbmRleCA9IGRpc2FibGVkLmluZGV4T2YobmFtZSlcbiAgICAgIGlmIChpbmRleCAhPT0gLTEpIHtcbiAgICAgICAgZGlzYWJsZWQuc3BsaWNlKGluZGV4LCAxKVxuICAgICAgfVxuICAgIH1cbiAgICBhd2FpdCB0aGlzLmNvbmZpZy5zZXQoJ2Rpc2FibGVkJywgZGlzYWJsZWQpXG4gIH1cbiAgYXN5bmMgc2hvdygpIHtcbiAgICBjb25zdCBzZWxlY3RMaXN0VmlldyA9IG5ldyBTZWxlY3RMaXN0Vmlldyh7XG4gICAgICBpdGVtczogYXdhaXQgdGhpcy5nZXRJdGVtcygpLFxuICAgICAgZW1wdHlNZXNzYWdlOiAnTm8gbWF0Y2hlcyBmb3VuZCcsXG4gICAgICBmaWx0ZXJLZXlGb3JJdGVtOiBpdGVtID0+IGl0ZW0sXG4gICAgICBlbGVtZW50Rm9ySXRlbTogKGl0ZW0pID0+IHtcbiAgICAgICAgY29uc3QgbGkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaScpXG4gICAgICAgIGxpLnRleHRDb250ZW50ID0gaXRlbVxuICAgICAgICByZXR1cm4gbGlcbiAgICAgIH0sXG4gICAgICBkaWRDb25maXJtU2VsZWN0aW9uOiAoaXRlbSkgPT4ge1xuICAgICAgICB0aGlzLnByb2Nlc3MoaXRlbSkuY2F0Y2goZSA9PiBjb25zb2xlLmVycm9yKCdbTGludGVyXSBVbmFibGUgdG8gcHJvY2VzcyB0b2dnbGU6JywgZSkpLnRoZW4oKCkgPT4gdGhpcy5kaXNwb3NlKCkpXG4gICAgICB9LFxuICAgICAgZGlkQ2FuY2VsU2VsZWN0aW9uOiAoKSA9PiB7XG4gICAgICAgIHRoaXMuZGlzcG9zZSgpXG4gICAgICB9LFxuICAgIH0pXG4gICAgY29uc3QgcGFuZWwgPSBhdG9tLndvcmtzcGFjZS5hZGRNb2RhbFBhbmVsKHsgaXRlbTogc2VsZWN0TGlzdFZpZXcgfSlcblxuICAgIHNlbGVjdExpc3RWaWV3LmZvY3VzKClcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKG5ldyBEaXNwb3NhYmxlKGZ1bmN0aW9uKCkge1xuICAgICAgcGFuZWwuZGVzdHJveSgpXG4gICAgfSkpXG4gIH1cbiAgb25EaWREaXNwb3NlKGNhbGxiYWNrOiAoKCkgPT4gYW55KSk6IERpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLmVtaXR0ZXIub24oJ2RpZC1kaXNwb3NlJywgY2FsbGJhY2spXG4gIH1cbiAgb25EaWREaXNhYmxlKGNhbGxiYWNrOiAoKG5hbWU6IHN0cmluZykgPT4gYW55KSk6IERpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLmVtaXR0ZXIub24oJ2RpZC1kaXNhYmxlJywgY2FsbGJhY2spXG4gIH1cbiAgZGlzcG9zZSgpIHtcbiAgICB0aGlzLmVtaXR0ZXIuZW1pdCgnZGlkLWRpc3Bvc2UnKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiAgfVxufVxuIl19