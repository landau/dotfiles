Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _humanizeTime = require('humanize-time');

var _humanizeTime2 = _interopRequireDefault(_humanizeTime);

var _atom = require('atom');

var _provider = require('./provider');

var _provider2 = _interopRequireDefault(_provider);

var Registry = (function () {
  function Registry() {
    var _this = this;

    _classCallCheck(this, Registry);

    this.emitter = new _atom.Emitter();
    this.providers = new Set();
    this.itemsActive = [];
    this.itemsHistory = [];
    this.subscriptions = new _atom.CompositeDisposable();

    this.subscriptions.add(this.emitter);
    this.subscriptions.add(atom.config.observe('busy-signal.itemsToShowInHistory', function (itemsToShowInHistory) {
      var previousValue = _this.itemsToShowInHistory;
      _this.itemsToShowInHistory = parseInt(itemsToShowInHistory, 10);
      if (typeof previousValue === 'number') {
        _this.emitter.emit('did-update');
      }
    }));
  }

  // Public method

  _createClass(Registry, [{
    key: 'create',
    value: function create() {
      var _this2 = this;

      var provider = new _provider2['default']();
      provider.onDidAdd(function (status) {
        _this2.statusAdd(provider, status);
      });
      provider.onDidRemove(function (title) {
        _this2.statusRemove(provider, title);
      });
      provider.onDidClear(function () {
        _this2.statusClear(provider);
      });
      provider.onDidDispose(function () {
        _this2.statusClear(provider);
        _this2.providers['delete'](provider);
      });
      this.providers.add(provider);
      return provider;
    }
  }, {
    key: 'statusAdd',
    value: function statusAdd(provider, status) {
      for (var i = 0; i < this.itemsActive.length; i++) {
        var entry = this.itemsActive[i];
        if (entry.title === status.title && entry.provider === provider) {
          // Item already exists, ignore
          break;
        }
      }

      this.itemsActive.push({
        title: status.title,
        priority: status.priority,
        provider: provider,
        timeAdded: Date.now(),
        timeRemoved: null
      });
      this.emitter.emit('did-update');
    }
  }, {
    key: 'statusRemove',
    value: function statusRemove(provider, title) {
      for (var i = 0; i < this.itemsActive.length; i++) {
        var entry = this.itemsActive[i];
        if (entry.provider === provider && entry.title === title) {
          this.pushIntoHistory(i, entry);
          this.emitter.emit('did-update');
          break;
        }
      }
    }
  }, {
    key: 'statusClear',
    value: function statusClear(provider) {
      var triggerUpdate = false;
      for (var i = 0; i < this.itemsActive.length; i++) {
        var entry = this.itemsActive[i];
        if (entry.provider === provider) {
          this.pushIntoHistory(i, entry);
          triggerUpdate = true;
          i--;
        }
      }
      if (triggerUpdate) {
        this.emitter.emit('did-update');
      }
    }
  }, {
    key: 'pushIntoHistory',
    value: function pushIntoHistory(index, item) {
      item.timeRemoved = Date.now();
      this.itemsActive.splice(index, 1);
      this.itemsHistory = this.itemsHistory.concat([item]).slice(-1000);
    }
  }, {
    key: 'getActiveTitles',
    value: function getActiveTitles() {
      return this.itemsActive.slice().sort(function (a, b) {
        return a.priority - b.priority;
      }).map(function (i) {
        return i.title;
      });
    }
  }, {
    key: 'getOldTitles',
    value: function getOldTitles() {
      var toReturn = [];
      var history = this.itemsHistory;
      var activeTitles = this.getActiveTitles();
      var mergedTogether = history.map(function (i) {
        return i.title;
      }).concat(activeTitles);

      for (var i = 0, _length = history.length; i < _length; i++) {
        var item = history[i];
        if (mergedTogether.lastIndexOf(item.title) === i) {
          toReturn.push({
            title: item.title,
            duration: (0, _humanizeTime2['default'])(item.timeRemoved && item.timeRemoved - item.timeAdded)
          });
        }
      }

      return toReturn.slice(-1 * this.itemsToShowInHistory);
    }
  }, {
    key: 'onDidUpdate',
    value: function onDidUpdate(callback) {
      return this.emitter.on('did-update', callback);
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this.subscriptions.dispose();
      for (var provider of this.providers) {
        provider.dispose();
      }
    }
  }]);

  return Registry;
})();

exports['default'] = Registry;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2J1c3ktc2lnbmFsL2xpYi9yZWdpc3RyeS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OzRCQUV5QixlQUFlOzs7O29CQUNLLE1BQU07O3dCQUc5QixZQUFZOzs7O0lBR1osUUFBUTtBQVFoQixXQVJRLFFBQVEsR0FRYjs7OzBCQVJLLFFBQVE7O0FBU3pCLFFBQUksQ0FBQyxPQUFPLEdBQUcsbUJBQWEsQ0FBQTtBQUM1QixRQUFJLENBQUMsU0FBUyxHQUFHLElBQUksR0FBRyxFQUFFLENBQUE7QUFDMUIsUUFBSSxDQUFDLFdBQVcsR0FBRyxFQUFFLENBQUE7QUFDckIsUUFBSSxDQUFDLFlBQVksR0FBRyxFQUFFLENBQUE7QUFDdEIsUUFBSSxDQUFDLGFBQWEsR0FBRywrQkFBeUIsQ0FBQTs7QUFFOUMsUUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFBO0FBQ3BDLFFBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLGtDQUFrQyxFQUFFLFVBQUMsb0JBQW9CLEVBQUs7QUFDdkcsVUFBTSxhQUFhLEdBQUcsTUFBSyxvQkFBb0IsQ0FBQTtBQUMvQyxZQUFLLG9CQUFvQixHQUFHLFFBQVEsQ0FBQyxvQkFBb0IsRUFBRSxFQUFFLENBQUMsQ0FBQTtBQUM5RCxVQUFJLE9BQU8sYUFBYSxLQUFLLFFBQVEsRUFBRTtBQUNyQyxjQUFLLE9BQU8sQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUE7T0FDaEM7S0FDRixDQUFDLENBQUMsQ0FBQTtHQUNKOzs7O2VBdkJrQixRQUFROztXQXlCckIsa0JBQWE7OztBQUNqQixVQUFNLFFBQVEsR0FBRywyQkFBYyxDQUFBO0FBQy9CLGNBQVEsQ0FBQyxRQUFRLENBQUMsVUFBQyxNQUFNLEVBQUs7QUFDNUIsZUFBSyxTQUFTLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFBO09BQ2pDLENBQUMsQ0FBQTtBQUNGLGNBQVEsQ0FBQyxXQUFXLENBQUMsVUFBQyxLQUFLLEVBQUs7QUFDOUIsZUFBSyxZQUFZLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFBO09BQ25DLENBQUMsQ0FBQTtBQUNGLGNBQVEsQ0FBQyxVQUFVLENBQUMsWUFBTTtBQUN4QixlQUFLLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQTtPQUMzQixDQUFDLENBQUE7QUFDRixjQUFRLENBQUMsWUFBWSxDQUFDLFlBQU07QUFDMUIsZUFBSyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUE7QUFDMUIsZUFBSyxTQUFTLFVBQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQTtPQUNoQyxDQUFDLENBQUE7QUFDRixVQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQTtBQUM1QixhQUFPLFFBQVEsQ0FBQTtLQUNoQjs7O1dBQ1EsbUJBQUMsUUFBa0IsRUFBRSxNQUEyQyxFQUFRO0FBQy9FLFdBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUNoRCxZQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBQ2pDLFlBQUksS0FBSyxDQUFDLEtBQUssS0FBSyxNQUFNLENBQUMsS0FBSyxJQUFJLEtBQUssQ0FBQyxRQUFRLEtBQUssUUFBUSxFQUFFOztBQUUvRCxnQkFBSztTQUNOO09BQ0Y7O0FBRUQsVUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUM7QUFDcEIsYUFBSyxFQUFFLE1BQU0sQ0FBQyxLQUFLO0FBQ25CLGdCQUFRLEVBQUUsTUFBTSxDQUFDLFFBQVE7QUFDekIsZ0JBQVEsRUFBUixRQUFRO0FBQ1IsaUJBQVMsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFO0FBQ3JCLG1CQUFXLEVBQUUsSUFBSTtPQUNsQixDQUFDLENBQUE7QUFDRixVQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQTtLQUNoQzs7O1dBQ1csc0JBQUMsUUFBa0IsRUFBRSxLQUFhLEVBQVE7QUFDcEQsV0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQ2hELFlBQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUE7QUFDakMsWUFBSSxLQUFLLENBQUMsUUFBUSxLQUFLLFFBQVEsSUFBSSxLQUFLLENBQUMsS0FBSyxLQUFLLEtBQUssRUFBRTtBQUN4RCxjQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQTtBQUM5QixjQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQTtBQUMvQixnQkFBSztTQUNOO09BQ0Y7S0FDRjs7O1dBQ1UscUJBQUMsUUFBa0IsRUFBUTtBQUNwQyxVQUFJLGFBQWEsR0FBRyxLQUFLLENBQUE7QUFDekIsV0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQ2hELFlBQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUE7QUFDakMsWUFBSSxLQUFLLENBQUMsUUFBUSxLQUFLLFFBQVEsRUFBRTtBQUMvQixjQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQTtBQUM5Qix1QkFBYSxHQUFHLElBQUksQ0FBQTtBQUNwQixXQUFDLEVBQUUsQ0FBQTtTQUNKO09BQ0Y7QUFDRCxVQUFJLGFBQWEsRUFBRTtBQUNqQixZQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQTtPQUNoQztLQUNGOzs7V0FDYyx5QkFBQyxLQUFhLEVBQUUsSUFBWSxFQUFRO0FBQ2pELFVBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFBO0FBQzdCLFVBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQTtBQUNqQyxVQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQTtLQUNsRTs7O1dBQ2MsMkJBQWtCO0FBQy9CLGFBQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxJQUFJLENBQUMsVUFBUyxDQUFDLEVBQUUsQ0FBQyxFQUFFO0FBQ2xELGVBQU8sQ0FBQyxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFBO09BQy9CLENBQUMsQ0FBQyxHQUFHLENBQUMsVUFBQSxDQUFDO2VBQUksQ0FBQyxDQUFDLEtBQUs7T0FBQSxDQUFDLENBQUE7S0FDckI7OztXQUNXLHdCQUErQztBQUN6RCxVQUFNLFFBQVEsR0FBRyxFQUFFLENBQUE7QUFDbkIsVUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQTtBQUNqQyxVQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUE7QUFDM0MsVUFBTSxjQUFjLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFBLENBQUM7ZUFBSSxDQUFDLENBQUMsS0FBSztPQUFBLENBQUMsQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUE7O0FBRXJFLFdBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLE9BQU0sR0FBRyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxPQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDeEQsWUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBQ3ZCLFlBQUksY0FBYyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxFQUFFO0FBQ2hELGtCQUFRLENBQUMsSUFBSSxDQUFDO0FBQ1osaUJBQUssRUFBRSxJQUFJLENBQUMsS0FBSztBQUNqQixvQkFBUSxFQUFFLCtCQUFhLElBQUksQ0FBQyxXQUFXLElBQUksSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO1dBQzlFLENBQUMsQ0FBQTtTQUNIO09BQ0Y7O0FBRUQsYUFBTyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxDQUFBO0tBQ3REOzs7V0FDVSxxQkFBQyxRQUFrQixFQUFjO0FBQzFDLGFBQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsWUFBWSxFQUFFLFFBQVEsQ0FBQyxDQUFBO0tBQy9DOzs7V0FDTSxtQkFBRztBQUNSLFVBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLENBQUE7QUFDNUIsV0FBSyxJQUFNLFFBQVEsSUFBSSxJQUFJLENBQUMsU0FBUyxFQUFFO0FBQ3JDLGdCQUFRLENBQUMsT0FBTyxFQUFFLENBQUE7T0FDbkI7S0FDRjs7O1NBekhrQixRQUFROzs7cUJBQVIsUUFBUSIsImZpbGUiOiIvVXNlcnMvdGxhbmRhdS9kb3RmaWxlcy8uYXRvbS9wYWNrYWdlcy9idXN5LXNpZ25hbC9saWIvcmVnaXN0cnkuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBAZmxvdyAqL1xuXG5pbXBvcnQgaHVtYW5pemVUaW1lIGZyb20gJ2h1bWFuaXplLXRpbWUnXG5pbXBvcnQgeyBDb21wb3NpdGVEaXNwb3NhYmxlLCBFbWl0dGVyIH0gZnJvbSAnYXRvbSdcbmltcG9ydCB0eXBlIHsgRGlzcG9zYWJsZSB9IGZyb20gJ2F0b20nXG5cbmltcG9ydCBQcm92aWRlciBmcm9tICcuL3Byb3ZpZGVyJ1xuaW1wb3J0IHR5cGUgeyBTaWduYWwgfSBmcm9tICcuL3R5cGVzJ1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSZWdpc3RyeSB7XG4gIGVtaXR0ZXI6IEVtaXR0ZXJcbiAgcHJvdmlkZXJzOiBTZXQ8UHJvdmlkZXI+XG4gIGl0ZW1zQWN0aXZlOiBBcnJheTxTaWduYWw+XG4gIGl0ZW1zSGlzdG9yeTogQXJyYXk8U2lnbmFsPlxuICBzdWJzY3JpcHRpb25zOiBDb21wb3NpdGVEaXNwb3NhYmxlXG4gIGl0ZW1zVG9TaG93SW5IaXN0b3J5OiBudW1iZXJcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLmVtaXR0ZXIgPSBuZXcgRW1pdHRlcigpXG4gICAgdGhpcy5wcm92aWRlcnMgPSBuZXcgU2V0KClcbiAgICB0aGlzLml0ZW1zQWN0aXZlID0gW11cbiAgICB0aGlzLml0ZW1zSGlzdG9yeSA9IFtdXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZCh0aGlzLmVtaXR0ZXIpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbmZpZy5vYnNlcnZlKCdidXN5LXNpZ25hbC5pdGVtc1RvU2hvd0luSGlzdG9yeScsIChpdGVtc1RvU2hvd0luSGlzdG9yeSkgPT4ge1xuICAgICAgY29uc3QgcHJldmlvdXNWYWx1ZSA9IHRoaXMuaXRlbXNUb1Nob3dJbkhpc3RvcnlcbiAgICAgIHRoaXMuaXRlbXNUb1Nob3dJbkhpc3RvcnkgPSBwYXJzZUludChpdGVtc1RvU2hvd0luSGlzdG9yeSwgMTApXG4gICAgICBpZiAodHlwZW9mIHByZXZpb3VzVmFsdWUgPT09ICdudW1iZXInKSB7XG4gICAgICAgIHRoaXMuZW1pdHRlci5lbWl0KCdkaWQtdXBkYXRlJylcbiAgICAgIH1cbiAgICB9KSlcbiAgfVxuICAvLyBQdWJsaWMgbWV0aG9kXG4gIGNyZWF0ZSgpOiBQcm92aWRlciB7XG4gICAgY29uc3QgcHJvdmlkZXIgPSBuZXcgUHJvdmlkZXIoKVxuICAgIHByb3ZpZGVyLm9uRGlkQWRkKChzdGF0dXMpID0+IHtcbiAgICAgIHRoaXMuc3RhdHVzQWRkKHByb3ZpZGVyLCBzdGF0dXMpXG4gICAgfSlcbiAgICBwcm92aWRlci5vbkRpZFJlbW92ZSgodGl0bGUpID0+IHtcbiAgICAgIHRoaXMuc3RhdHVzUmVtb3ZlKHByb3ZpZGVyLCB0aXRsZSlcbiAgICB9KVxuICAgIHByb3ZpZGVyLm9uRGlkQ2xlYXIoKCkgPT4ge1xuICAgICAgdGhpcy5zdGF0dXNDbGVhcihwcm92aWRlcilcbiAgICB9KVxuICAgIHByb3ZpZGVyLm9uRGlkRGlzcG9zZSgoKSA9PiB7XG4gICAgICB0aGlzLnN0YXR1c0NsZWFyKHByb3ZpZGVyKVxuICAgICAgdGhpcy5wcm92aWRlcnMuZGVsZXRlKHByb3ZpZGVyKVxuICAgIH0pXG4gICAgdGhpcy5wcm92aWRlcnMuYWRkKHByb3ZpZGVyKVxuICAgIHJldHVybiBwcm92aWRlclxuICB9XG4gIHN0YXR1c0FkZChwcm92aWRlcjogUHJvdmlkZXIsIHN0YXR1czogeyB0aXRsZTogc3RyaW5nLCBwcmlvcml0eTogbnVtYmVyIH0pOiB2b2lkIHtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuaXRlbXNBY3RpdmUubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IGVudHJ5ID0gdGhpcy5pdGVtc0FjdGl2ZVtpXVxuICAgICAgaWYgKGVudHJ5LnRpdGxlID09PSBzdGF0dXMudGl0bGUgJiYgZW50cnkucHJvdmlkZXIgPT09IHByb3ZpZGVyKSB7XG4gICAgICAgIC8vIEl0ZW0gYWxyZWFkeSBleGlzdHMsIGlnbm9yZVxuICAgICAgICBicmVha1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuaXRlbXNBY3RpdmUucHVzaCh7XG4gICAgICB0aXRsZTogc3RhdHVzLnRpdGxlLFxuICAgICAgcHJpb3JpdHk6IHN0YXR1cy5wcmlvcml0eSxcbiAgICAgIHByb3ZpZGVyLFxuICAgICAgdGltZUFkZGVkOiBEYXRlLm5vdygpLFxuICAgICAgdGltZVJlbW92ZWQ6IG51bGwsXG4gICAgfSlcbiAgICB0aGlzLmVtaXR0ZXIuZW1pdCgnZGlkLXVwZGF0ZScpXG4gIH1cbiAgc3RhdHVzUmVtb3ZlKHByb3ZpZGVyOiBQcm92aWRlciwgdGl0bGU6IHN0cmluZyk6IHZvaWQge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5pdGVtc0FjdGl2ZS5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgZW50cnkgPSB0aGlzLml0ZW1zQWN0aXZlW2ldXG4gICAgICBpZiAoZW50cnkucHJvdmlkZXIgPT09IHByb3ZpZGVyICYmIGVudHJ5LnRpdGxlID09PSB0aXRsZSkge1xuICAgICAgICB0aGlzLnB1c2hJbnRvSGlzdG9yeShpLCBlbnRyeSlcbiAgICAgICAgdGhpcy5lbWl0dGVyLmVtaXQoJ2RpZC11cGRhdGUnKVxuICAgICAgICBicmVha1xuICAgICAgfVxuICAgIH1cbiAgfVxuICBzdGF0dXNDbGVhcihwcm92aWRlcjogUHJvdmlkZXIpOiB2b2lkIHtcbiAgICBsZXQgdHJpZ2dlclVwZGF0ZSA9IGZhbHNlXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLml0ZW1zQWN0aXZlLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBlbnRyeSA9IHRoaXMuaXRlbXNBY3RpdmVbaV1cbiAgICAgIGlmIChlbnRyeS5wcm92aWRlciA9PT0gcHJvdmlkZXIpIHtcbiAgICAgICAgdGhpcy5wdXNoSW50b0hpc3RvcnkoaSwgZW50cnkpXG4gICAgICAgIHRyaWdnZXJVcGRhdGUgPSB0cnVlXG4gICAgICAgIGktLVxuICAgICAgfVxuICAgIH1cbiAgICBpZiAodHJpZ2dlclVwZGF0ZSkge1xuICAgICAgdGhpcy5lbWl0dGVyLmVtaXQoJ2RpZC11cGRhdGUnKVxuICAgIH1cbiAgfVxuICBwdXNoSW50b0hpc3RvcnkoaW5kZXg6IG51bWJlciwgaXRlbTogU2lnbmFsKTogdm9pZCB7XG4gICAgaXRlbS50aW1lUmVtb3ZlZCA9IERhdGUubm93KClcbiAgICB0aGlzLml0ZW1zQWN0aXZlLnNwbGljZShpbmRleCwgMSlcbiAgICB0aGlzLml0ZW1zSGlzdG9yeSA9IHRoaXMuaXRlbXNIaXN0b3J5LmNvbmNhdChbaXRlbV0pLnNsaWNlKC0xMDAwKVxuICB9XG4gIGdldEFjdGl2ZVRpdGxlcygpOiBBcnJheTxzdHJpbmc+IHtcbiAgICByZXR1cm4gdGhpcy5pdGVtc0FjdGl2ZS5zbGljZSgpLnNvcnQoZnVuY3Rpb24oYSwgYikge1xuICAgICAgcmV0dXJuIGEucHJpb3JpdHkgLSBiLnByaW9yaXR5XG4gICAgfSkubWFwKGkgPT4gaS50aXRsZSlcbiAgfVxuICBnZXRPbGRUaXRsZXMoKTogQXJyYXk8eyB0aXRsZTogc3RyaW5nLCBkdXJhdGlvbjogc3RyaW5nIH0+IHtcbiAgICBjb25zdCB0b1JldHVybiA9IFtdXG4gICAgY29uc3QgaGlzdG9yeSA9IHRoaXMuaXRlbXNIaXN0b3J5XG4gICAgY29uc3QgYWN0aXZlVGl0bGVzID0gdGhpcy5nZXRBY3RpdmVUaXRsZXMoKVxuICAgIGNvbnN0IG1lcmdlZFRvZ2V0aGVyID0gaGlzdG9yeS5tYXAoaSA9PiBpLnRpdGxlKS5jb25jYXQoYWN0aXZlVGl0bGVzKVxuXG4gICAgZm9yIChsZXQgaSA9IDAsIGxlbmd0aCA9IGhpc3RvcnkubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IGl0ZW0gPSBoaXN0b3J5W2ldXG4gICAgICBpZiAobWVyZ2VkVG9nZXRoZXIubGFzdEluZGV4T2YoaXRlbS50aXRsZSkgPT09IGkpIHtcbiAgICAgICAgdG9SZXR1cm4ucHVzaCh7XG4gICAgICAgICAgdGl0bGU6IGl0ZW0udGl0bGUsXG4gICAgICAgICAgZHVyYXRpb246IGh1bWFuaXplVGltZShpdGVtLnRpbWVSZW1vdmVkICYmIGl0ZW0udGltZVJlbW92ZWQgLSBpdGVtLnRpbWVBZGRlZCksXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRvUmV0dXJuLnNsaWNlKC0xICogdGhpcy5pdGVtc1RvU2hvd0luSGlzdG9yeSlcbiAgfVxuICBvbkRpZFVwZGF0ZShjYWxsYmFjazogRnVuY3Rpb24pOiBEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5lbWl0dGVyLm9uKCdkaWQtdXBkYXRlJywgY2FsbGJhY2spXG4gIH1cbiAgZGlzcG9zZSgpIHtcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG4gICAgZm9yIChjb25zdCBwcm92aWRlciBvZiB0aGlzLnByb3ZpZGVycykge1xuICAgICAgcHJvdmlkZXIuZGlzcG9zZSgpXG4gICAgfVxuICB9XG59XG4iXX0=