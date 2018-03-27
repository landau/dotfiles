Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _ms = require('ms');

var _ms2 = _interopRequireDefault(_ms);

var _atom = require('atom');

var _provider = require('./provider');

var _provider2 = _interopRequireDefault(_provider);

var Registry = (function () {
  function Registry() {
    _classCallCheck(this, Registry);

    this.emitter = new _atom.Emitter();
    this.providers = new Set();
    this.subscriptions = new _atom.CompositeDisposable();
    this.subscriptions.add(this.emitter);

    this.statuses = new Map();
    this.statusHistory = [];
  }

  // Public method

  _createClass(Registry, [{
    key: 'create',
    value: function create() {
      var _this = this;

      var provider = new _provider2['default']();
      provider.onDidAdd(function (status) {
        _this.statusAdd(provider, status);
      });
      provider.onDidRemove(function (title) {
        _this.statusRemove(provider, title);
      });
      provider.onDidClear(function () {
        _this.statusClear(provider);
      });
      provider.onDidDispose(function () {
        _this.statusClear(provider);
        _this.providers['delete'](provider);
      });
      this.providers.add(provider);
      return provider;
    }
  }, {
    key: 'statusAdd',
    value: function statusAdd(provider, title) {
      var key = provider.id + '::' + title;
      if (this.statuses.has(key)) {
        // This will help catch bugs in providers
        throw new Error('Status \'' + title + '\' is already set');
      }

      var entry = {
        key: key,
        title: title,
        provider: provider,
        timeStarted: Date.now(),
        timeStopped: null
      };
      this.statuses.set(entry.key, entry);
      this.emitter.emit('did-update');
    }
  }, {
    key: 'statusRemove',
    value: function statusRemove(provider, title) {
      var key = provider.id + '::' + title;
      var value = this.statuses.get(key);
      if (value) {
        this.pushIntoHistory(value);
        this.statuses['delete'](key);
        this.emitter.emit('did-update');
      }
    }
  }, {
    key: 'statusClear',
    value: function statusClear(provider) {
      var _this2 = this;

      var triggerUpdate = false;
      this.statuses.forEach(function (value) {
        if (value.provider === provider) {
          triggerUpdate = true;
          _this2.pushIntoHistory(value);
          _this2.statuses['delete'](value.key);
        }
      });
      if (triggerUpdate) {
        this.emitter.emit('did-update');
      }
    }
  }, {
    key: 'pushIntoHistory',
    value: function pushIntoHistory(status) {
      status.timeStopped = Date.now();
      var i = this.statusHistory.length;
      while (i--) {
        if (this.statusHistory[i].key === status.key) {
          this.statusHistory.splice(i, 1);
          break;
        }
      }
      this.statusHistory.push(status);
      this.statusHistory = this.statusHistory.slice(-10);
    }
  }, {
    key: 'getTilesActive',
    value: function getTilesActive() {
      return Array.from(this.statuses.values()).sort(function (a, b) {
        return b.timeStarted - a.timeStarted;
      }).map(function (a) {
        return a.title;
      });
    }
  }, {
    key: 'getTilesOld',
    value: function getTilesOld() {
      var _this3 = this;

      var oldTiles = [];

      this.statusHistory.forEach(function (entry) {
        if (_this3.statuses.has(entry.key)) return;
        oldTiles.push({
          title: entry.title,
          duration: (0, _ms2['default'])((entry.timeStopped || 0) - entry.timeStarted)
        });
      });

      return oldTiles;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2J1c3ktc2lnbmFsL2xpYi9yZWdpc3RyeS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O2tCQUVlLElBQUk7Ozs7b0JBQzBCLE1BQU07O3dCQUc5QixZQUFZOzs7O0lBR1osUUFBUTtBQVFoQixXQVJRLFFBQVEsR0FRYjswQkFSSyxRQUFROztBQVN6QixRQUFJLENBQUMsT0FBTyxHQUFHLG1CQUFhLENBQUE7QUFDNUIsUUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFBO0FBQzFCLFFBQUksQ0FBQyxhQUFhLEdBQUcsK0JBQXlCLENBQUE7QUFDOUMsUUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFBOztBQUVwQyxRQUFJLENBQUMsUUFBUSxHQUFHLElBQUksR0FBRyxFQUFFLENBQUE7QUFDekIsUUFBSSxDQUFDLGFBQWEsR0FBRyxFQUFFLENBQUE7R0FDeEI7Ozs7ZUFoQmtCLFFBQVE7O1dBa0JyQixrQkFBYTs7O0FBQ2pCLFVBQU0sUUFBUSxHQUFHLDJCQUFjLENBQUE7QUFDL0IsY0FBUSxDQUFDLFFBQVEsQ0FBQyxVQUFDLE1BQU0sRUFBSztBQUM1QixjQUFLLFNBQVMsQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUE7T0FDakMsQ0FBQyxDQUFBO0FBQ0YsY0FBUSxDQUFDLFdBQVcsQ0FBQyxVQUFDLEtBQUssRUFBSztBQUM5QixjQUFLLFlBQVksQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUE7T0FDbkMsQ0FBQyxDQUFBO0FBQ0YsY0FBUSxDQUFDLFVBQVUsQ0FBQyxZQUFNO0FBQ3hCLGNBQUssV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFBO09BQzNCLENBQUMsQ0FBQTtBQUNGLGNBQVEsQ0FBQyxZQUFZLENBQUMsWUFBTTtBQUMxQixjQUFLLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQTtB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USxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQUMsQ0FBQyxFQUFFLENBQUM7ZUFBSyxDQUFDLENBQUMsV0FBVyxHQUFHLENBQUMsQ0FBQyxXQUFXO09BQUEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFBLENBQUM7ZUFBSSxDQUFDLENBQUMsS0FBSztPQUFBLENBQUMsQ0FBQTtLQUMxRzs7O1dBQ1UsdUJBQStDOzs7QUFDeEQsVUFBTSxRQUFRLEdBQUcsRUFBRSxDQUFBOztBQUVuQixVQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxVQUFDLEtBQUssRUFBSztBQUNwQyxZQUFJLE9BQUssUUFBUSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsT0FBTTtBQUN4QyxnQkFBUSxDQUFDLElBQUksQ0FBQztBQUNaLGVBQUssRUFBRSxLQUFLLENBQUMsS0FBSztBQUNsQixrQkFBUSxFQUFFLHFCQUFHLENBQUMsS0FBSyxDQUFDLFdBQVcsSUFBSSxDQUFDLENBQUEsR0FBSSxLQUFLLENBQUMsV0FBVyxDQUFDO1NBQzNELENBQUMsQ0FBQTtPQUNILENBQUMsQ0FBQTs7QUFFRixhQUFPLFFBQVEsQ0FBQTtLQUNoQjs7O1dBQ1UscUJBQUMsUUFBa0IsRUFBYztBQUMxQyxhQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLFlBQVksRUFBRSxRQUFRLENBQUMsQ0FBQTtLQUMvQzs7O1dBQ00sbUJBQUc7QUFDUixVQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxDQUFBO0FBQzVCLFdBQUssSUFBTSxRQUFRLElBQUksSUFBSSxDQUFDLFNBQVMsRUFBRTtBQUNyQyxnQkFBUSxDQUFDLE9BQU8sRUFBRSxDQUFBO09BQ25CO0tBQ0Y7OztTQS9Ha0IsUUFBUTs7O3FCQUFSLFFBQVEiLCJmaWxlIjoiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvYnVzeS1zaWduYWwvbGliL3JlZ2lzdHJ5LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogQGZsb3cgKi9cblxuaW1wb3J0IG1zIGZyb20gJ21zJ1xuaW1wb3J0IHsgQ29tcG9zaXRlRGlzcG9zYWJsZSwgRW1pdHRlciB9IGZyb20gJ2F0b20nXG5pbXBvcnQgdHlwZSB7IERpc3Bvc2FibGUgfSBmcm9tICdhdG9tJ1xuXG5pbXBvcnQgUHJvdmlkZXIgZnJvbSAnLi9wcm92aWRlcidcbmltcG9ydCB0eXBlIHsgU2lnbmFsSW50ZXJuYWwgfSBmcm9tICcuL3R5cGVzJ1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSZWdpc3RyeSB7XG4gIGVtaXR0ZXI6IEVtaXR0ZXJcbiAgcHJvdmlkZXJzOiBTZXQ8UHJvdmlkZXI+XG4gIHN1YnNjcmlwdGlvbnM6IENvbXBvc2l0ZURpc3Bvc2FibGVcblxuICBzdGF0dXNlczogTWFwPHN0cmluZywgU2lnbmFsSW50ZXJuYWw+XG4gIHN0YXR1c0hpc3Rvcnk6IEFycmF5PFNpZ25hbEludGVybmFsPlxuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuZW1pdHRlciA9IG5ldyBFbWl0dGVyKClcbiAgICB0aGlzLnByb3ZpZGVycyA9IG5ldyBTZXQoKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKHRoaXMuZW1pdHRlcilcblxuICAgIHRoaXMuc3RhdHVzZXMgPSBuZXcgTWFwKClcbiAgICB0aGlzLnN0YXR1c0hpc3RvcnkgPSBbXVxuICB9XG4gIC8vIFB1YmxpYyBtZXRob2RcbiAgY3JlYXRlKCk6IFByb3ZpZGVyIHtcbiAgICBjb25zdCBwcm92aWRlciA9IG5ldyBQcm92aWRlcigpXG4gICAgcHJvdmlkZXIub25EaWRBZGQoKHN0YXR1cykgPT4ge1xuICAgICAgdGhpcy5zdGF0dXNBZGQocHJvdmlkZXIsIHN0YXR1cylcbiAgICB9KVxuICAgIHByb3ZpZGVyLm9uRGlkUmVtb3ZlKCh0aXRsZSkgPT4ge1xuICAgICAgdGhpcy5zdGF0dXNSZW1vdmUocHJvdmlkZXIsIHRpdGxlKVxuICAgIH0pXG4gICAgcHJvdmlkZXIub25EaWRDbGVhcigoKSA9PiB7XG4gICAgICB0aGlzLnN0YXR1c0NsZWFyKHByb3ZpZGVyKVxuICAgIH0pXG4gICAgcHJvdmlkZXIub25EaWREaXNwb3NlKCgpID0+IHtcbiAgICAgIHRoaXMuc3RhdHVzQ2xlYXIocHJvdmlkZXIpXG4gICAgICB0aGlzLnByb3ZpZGVycy5kZWxldGUocHJvdmlkZXIpXG4gICAgfSlcbiAgICB0aGlzLnByb3ZpZGVycy5hZGQocHJvdmlkZXIpXG4gICAgcmV0dXJuIHByb3ZpZGVyXG4gIH1cbiAgc3RhdHVzQWRkKHByb3ZpZGVyOiBQcm92aWRlciwgdGl0bGU6IHN0cmluZyk6IHZvaWQge1xuICAgIGNvbnN0IGtleSA9IGAke3Byb3ZpZGVyLmlkfTo6JHt0aXRsZX1gXG4gICAgaWYgKHRoaXMuc3RhdHVzZXMuaGFzKGtleSkpIHtcbiAgICAgIC8vIFRoaXMgd2lsbCBoZWxwIGNhdGNoIGJ1Z3MgaW4gcHJvdmlkZXJzXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFN0YXR1cyAnJHt0aXRsZX0nIGlzIGFscmVhZHkgc2V0YClcbiAgICB9XG5cbiAgICBjb25zdCBlbnRyeSA9IHtcbiAgICAgIGtleSxcbiAgICAgIHRpdGxlLFxuICAgICAgcHJvdmlkZXIsXG4gICAgICB0aW1lU3RhcnRlZDogRGF0ZS5ub3coKSxcbiAgICAgIHRpbWVTdG9wcGVkOiBudWxsLFxuICAgIH1cbiAgICB0aGlzLnN0YXR1c2VzLnNldChlbnRyeS5rZXksIGVudHJ5KVxuICAgIHRoaXMuZW1pdHRlci5lbWl0KCdkaWQtdXBkYXRlJylcbiAgfVxuICBzdGF0dXNSZW1vdmUocHJvdmlkZXI6IFByb3ZpZGVyLCB0aXRsZTogc3RyaW5nKTogdm9pZCB7XG4gICAgY29uc3Qga2V5ID0gYCR7cHJvdmlkZXIuaWR9Ojoke3RpdGxlfWBcbiAgICBjb25zdCB2YWx1ZSA9IHRoaXMuc3RhdHVzZXMuZ2V0KGtleSlcbiAgICBpZiAodmFsdWUpIHtcbiAgICAgIHRoaXMucHVzaEludG9IaXN0b3J5KHZhbHVlKVxuICAgICAgdGhpcy5zdGF0dXNlcy5kZWxldGUoa2V5KVxuICAgICAgdGhpcy5lbWl0dGVyLmVtaXQoJ2RpZC11cGRhdGUnKVxuICAgIH1cbiAgfVxuICBzdGF0dXNDbGVhcihwcm92aWRlcjogUHJvdmlkZXIpOiB2b2lkIHtcbiAgICBsZXQgdHJpZ2dlclVwZGF0ZSA9IGZhbHNlXG4gICAgdGhpcy5zdGF0dXNlcy5mb3JFYWNoKCh2YWx1ZSkgPT4ge1xuICAgICAgaWYgKHZhbHVlLnByb3ZpZGVyID09PSBwcm92aWRlcikge1xuICAgICAgICB0cmlnZ2VyVXBkYXRlID0gdHJ1ZVxuICAgICAgICB0aGlzLnB1c2hJbnRvSGlzdG9yeSh2YWx1ZSlcbiAgICAgICAgdGhpcy5zdGF0dXNlcy5kZWxldGUodmFsdWUua2V5KVxuICAgICAgfVxuICAgIH0pXG4gICAgaWYgKHRyaWdnZXJVcGRhdGUpIHtcbiAgICAgIHRoaXMuZW1pdHRlci5lbWl0KCdkaWQtdXBkYXRlJylcbiAgICB9XG4gIH1cbiAgcHVzaEludG9IaXN0b3J5KHN0YXR1czogU2lnbmFsSW50ZXJuYWwpOiB2b2lkIHtcbiAgICBzdGF0dXMudGltZVN0b3BwZWQgPSBEYXRlLm5vdygpXG4gICAgbGV0IGkgPSB0aGlzLnN0YXR1c0hpc3RvcnkubGVuZ3RoXG4gICAgd2hpbGUgKGktLSkge1xuICAgICAgaWYgKHRoaXMuc3RhdHVzSGlzdG9yeVtpXS5rZXkgPT09IHN0YXR1cy5rZXkpIHtcbiAgICAgICAgdGhpcy5zdGF0dXNIaXN0b3J5LnNwbGljZShpLCAxKVxuICAgICAgICBicmVha1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLnN0YXR1c0hpc3RvcnkucHVzaChzdGF0dXMpXG4gICAgdGhpcy5zdGF0dXNIaXN0b3J5ID0gdGhpcy5zdGF0dXNIaXN0b3J5LnNsaWNlKC0xMClcbiAgfVxuICBnZXRUaWxlc0FjdGl2ZSgpOiBBcnJheTxzdHJpbmc+IHtcbiAgICByZXR1cm4gQXJyYXkuZnJvbSh0aGlzLnN0YXR1c2VzLnZhbHVlcygpKS5zb3J0KChhLCBiKSA9PiBiLnRpbWVTdGFydGVkIC0gYS50aW1lU3RhcnRlZCkubWFwKGEgPT4gYS50aXRsZSlcbiAgfVxuICBnZXRUaWxlc09sZCgpOiBBcnJheTx7IHRpdGxlOiBzdHJpbmcsIGR1cmF0aW9uOiBzdHJpbmcgfT4ge1xuICAgIGNvbnN0IG9sZFRpbGVzID0gW11cblxuICAgIHRoaXMuc3RhdHVzSGlzdG9yeS5mb3JFYWNoKChlbnRyeSkgPT4ge1xuICAgICAgaWYgKHRoaXMuc3RhdHVzZXMuaGFzKGVudHJ5LmtleSkpIHJldHVyblxuICAgICAgb2xkVGlsZXMucHVzaCh7XG4gICAgICAgIHRpdGxlOiBlbnRyeS50aXRsZSxcbiAgICAgICAgZHVyYXRpb246IG1zKChlbnRyeS50aW1lU3RvcHBlZCB8fCAwKSAtIGVudHJ5LnRpbWVTdGFydGVkKSxcbiAgICAgIH0pXG4gICAgfSlcblxuICAgIHJldHVybiBvbGRUaWxlc1xuICB9XG4gIG9uRGlkVXBkYXRlKGNhbGxiYWNrOiBGdW5jdGlvbik6IERpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLmVtaXR0ZXIub24oJ2RpZC11cGRhdGUnLCBjYWxsYmFjaylcbiAgfVxuICBkaXNwb3NlKCkge1xuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiAgICBmb3IgKGNvbnN0IHByb3ZpZGVyIG9mIHRoaXMucHJvdmlkZXJzKSB7XG4gICAgICBwcm92aWRlci5kaXNwb3NlKClcbiAgICB9XG4gIH1cbn1cbiJdfQ==