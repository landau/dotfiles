Object.defineProperty(exports, '__esModule', {
  value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _sbEventKit = require('sb-event-kit');

var BusySignal = (function () {
  function BusySignal() {
    var _this = this;

    _classCallCheck(this, BusySignal);

    this.executing = new Set();
    this.subscriptions = new _sbEventKit.CompositeDisposable();

    this.subscriptions.add(atom.config.observe('linter-ui-default.useBusySignal', function (useBusySignal) {
      _this.useBusySignal = useBusySignal;
    }));
  }

  _createClass(BusySignal, [{
    key: 'attach',
    value: function attach(registry) {
      this.provider = registry.create();
      this.update();
    }
  }, {
    key: 'update',
    value: function update() {
      var provider = this.provider;
      if (!provider) return;
      provider.clear();
      if (!this.useBusySignal) return;
      var fileMap = new Map();

      for (var _ref2 of this.executing) {
        var _filePath = _ref2.filePath;
        var _linter = _ref2.linter;

        var names = fileMap.get(_filePath);
        if (!names) {
          fileMap.set(_filePath, names = []);
        }
        names.push(_linter.name);
      }

      for (var _ref33 of fileMap) {
        var _ref32 = _slicedToArray(_ref33, 2);

        var _filePath2 = _ref32[0];
        var names = _ref32[1];

        var path = _filePath2 ? ' on ' + atom.project.relativizePath(_filePath2)[1] : '';
        provider.add('' + names.join(', ') + path);
      }
      fileMap.clear();
    }
  }, {
    key: 'getExecuting',
    value: function getExecuting(linter, filePath) {
      for (var entry of this.executing) {
        if (entry.linter === linter && entry.filePath === filePath) {
          return entry;
        }
      }
      return null;
    }
  }, {
    key: 'didBeginLinting',
    value: function didBeginLinting(linter, filePath) {
      if (this.getExecuting(linter, filePath)) {
        return;
      }
      this.executing.add({ linter: linter, filePath: filePath });
      this.update();
    }
  }, {
    key: 'didFinishLinting',
    value: function didFinishLinting(linter, filePath) {
      var entry = this.getExecuting(linter, filePath);
      if (entry) {
        this.executing['delete'](entry);
        this.update();
      }
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      if (this.provider) {
        this.provider.clear();
      }
      this.executing.clear();
      this.subscriptions.dispose();
    }
  }]);

  return BusySignal;
})();

exports['default'] = BusySignal;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci11aS1kZWZhdWx0L2xpYi9idXN5LXNpZ25hbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OzBCQUVvQyxjQUFjOztJQUc3QixVQUFVO0FBU2xCLFdBVFEsVUFBVSxHQVNmOzs7MEJBVEssVUFBVTs7QUFVM0IsUUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFBO0FBQzFCLFFBQUksQ0FBQyxhQUFhLEdBQUcscUNBQXlCLENBQUE7O0FBRTlDLFFBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLGlDQUFpQyxFQUFFLFVBQUMsYUFBYSxFQUFLO0FBQy9GLFlBQUssYUFBYSxHQUFHLGFBQWEsQ0FBQTtLQUNuQyxDQUFDLENBQUMsQ0FBQTtHQUNKOztlQWhCa0IsVUFBVTs7V0FpQnZCLGdCQUFDLFFBQWdCLEVBQUU7QUFDdkIsVUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUE7QUFDakMsVUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFBO0tBQ2Q7OztXQUNLLGtCQUFHO0FBQ1AsVUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQTtBQUM5QixVQUFJLENBQUMsUUFBUSxFQUFFLE9BQU07QUFDckIsY0FBUSxDQUFDLEtBQUssRUFBRSxDQUFBO0FBQ2hCLFVBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLE9BQU07QUFDL0IsVUFBTSxPQUFvQyxHQUFHLElBQUksR0FBRyxFQUFFLENBQUE7O0FBRXRELHdCQUFtQyxJQUFJLENBQUMsU0FBUyxFQUFFO1lBQXRDLFNBQVEsU0FBUixRQUFRO1lBQUUsT0FBTSxTQUFOLE1BQU07O0FBQzNCLFlBQUksS0FBSyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUSxDQUFDLENBQUE7QUFDakMsWUFBSSxDQUFDLEtBQUssRUFBRTtBQUNWLGlCQUFPLENBQUMsR0FBRyxDQUFDLFNBQVEsRUFBRSxLQUFLLEdBQUcsRUFBRSxDQUFDLENBQUE7U0FDbEM7QUFDRCxhQUFLLENBQUMsSUFBSSxDQUFDLE9BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQTtPQUN4Qjs7QUFFRCx5QkFBZ0MsT0FBTyxFQUFFOzs7WUFBN0IsVUFBUTtZQUFFLEtBQUs7O0FBQ3pCLFlBQU0sSUFBSSxHQUFHLFVBQVEsWUFBVSxJQUFJLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxVQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBSyxFQUFFLENBQUE7QUFDOUUsZ0JBQVEsQ0FBQyxHQUFHLE1BQUksS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUcsQ0FBQTtPQUMzQztBQUNELGFBQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQTtLQUNoQjs7O1dBQ1csc0JBQUMsTUFBYyxFQUFFLFFBQWlCLEVBQVc7QUFDdkQsV0FBSyxJQUFNLEtBQUssSUFBSSxJQUFJLENBQUMsU0FBUyxFQUFFO0FBQ2xDLFlBQUksS0FBSyxDQUFDLE1BQU0sS0FBSyxNQUFNLElBQUksS0FBSyxDQUFDLFFBQVEsS0FBSyxRQUFRLEVBQUU7QUFDMUQsaUJBQU8sS0FBSyxDQUFBO1NBQ2I7T0FDRjtBQUNELGFBQU8sSUFBSSxDQUFBO0tBQ1o7OztXQUNjLHlCQUFDLE1BQWMsRUFBRSxRQUFpQixFQUFFO0FBQ2pELFVBQUksSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLEVBQUU7QUFDdkMsZUFBTTtPQUNQO0FBQ0QsVUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsRUFBRSxNQUFNLEVBQU4sTUFBTSxFQUFFLFFBQVEsRUFBUixRQUFRLEVBQUUsQ0FBQyxDQUFBO0FBQ3hDLFVBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQTtLQUNkOzs7V0FDZSwwQkFBQyxNQUFjLEVBQUUsUUFBaUIsRUFBRTtBQUNsRCxVQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQTtBQUNqRCxVQUFJLEtBQUssRUFBRTtBQUNULFlBQUksQ0FBQyxTQUFTLFVBQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQTtBQUM1QixZQUFJLENBQUMsTUFBTSxFQUFFLENBQUE7T0FDZDtLQUNGOzs7V0FDTSxtQkFBRztBQUNSLFVBQUksSUFBSSxDQUFDLFFBQVEsRUFBRTtBQUNqQixZQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxDQUFBO09BQ3RCO0FBQ0QsVUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsQ0FBQTtBQUN0QixVQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxDQUFBO0tBQzdCOzs7U0F0RWtCLFVBQVU7OztxQkFBVixVQUFVIiwiZmlsZSI6Ii9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci11aS1kZWZhdWx0L2xpYi9idXN5LXNpZ25hbC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIEBmbG93ICovXG5cbmltcG9ydCB7IENvbXBvc2l0ZURpc3Bvc2FibGUgfSBmcm9tICdzYi1ldmVudC1raXQnXG5pbXBvcnQgdHlwZSB7IExpbnRlciB9IGZyb20gJy4vdHlwZXMnXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEJ1c3lTaWduYWwge1xuICBwcm92aWRlcjogP09iamVjdDtcbiAgZXhlY3V0aW5nOiBTZXQ8e1xuICAgIGxpbnRlcjogTGludGVyLFxuICAgIGZpbGVQYXRoOiA/c3RyaW5nLFxuICB9PjtcbiAgdXNlQnVzeVNpZ25hbDogYm9vbGVhbjtcbiAgc3Vic2NyaXB0aW9uczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLmV4ZWN1dGluZyA9IG5ldyBTZXQoKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb25maWcub2JzZXJ2ZSgnbGludGVyLXVpLWRlZmF1bHQudXNlQnVzeVNpZ25hbCcsICh1c2VCdXN5U2lnbmFsKSA9PiB7XG4gICAgICB0aGlzLnVzZUJ1c3lTaWduYWwgPSB1c2VCdXN5U2lnbmFsXG4gICAgfSkpXG4gIH1cbiAgYXR0YWNoKHJlZ2lzdHJ5OiBPYmplY3QpIHtcbiAgICB0aGlzLnByb3ZpZGVyID0gcmVnaXN0cnkuY3JlYXRlKClcbiAgICB0aGlzLnVwZGF0ZSgpXG4gIH1cbiAgdXBkYXRlKCkge1xuICAgIGNvbnN0IHByb3ZpZGVyID0gdGhpcy5wcm92aWRlclxuICAgIGlmICghcHJvdmlkZXIpIHJldHVyblxuICAgIHByb3ZpZGVyLmNsZWFyKClcbiAgICBpZiAoIXRoaXMudXNlQnVzeVNpZ25hbCkgcmV0dXJuXG4gICAgY29uc3QgZmlsZU1hcDogTWFwPD9zdHJpbmcsIEFycmF5PHN0cmluZz4+ID0gbmV3IE1hcCgpXG5cbiAgICBmb3IgKGNvbnN0IHsgZmlsZVBhdGgsIGxpbnRlciB9IG9mIHRoaXMuZXhlY3V0aW5nKSB7XG4gICAgICBsZXQgbmFtZXMgPSBmaWxlTWFwLmdldChmaWxlUGF0aClcbiAgICAgIGlmICghbmFtZXMpIHtcbiAgICAgICAgZmlsZU1hcC5zZXQoZmlsZVBhdGgsIG5hbWVzID0gW10pXG4gICAgICB9XG4gICAgICBuYW1lcy5wdXNoKGxpbnRlci5uYW1lKVxuICAgIH1cblxuICAgIGZvciAoY29uc3QgW2ZpbGVQYXRoLCBuYW1lc10gb2YgZmlsZU1hcCkge1xuICAgICAgY29uc3QgcGF0aCA9IGZpbGVQYXRoID8gYCBvbiAke2F0b20ucHJvamVjdC5yZWxhdGl2aXplUGF0aChmaWxlUGF0aClbMV19YCA6ICcnXG4gICAgICBwcm92aWRlci5hZGQoYCR7bmFtZXMuam9pbignLCAnKX0ke3BhdGh9YClcbiAgICB9XG4gICAgZmlsZU1hcC5jbGVhcigpXG4gIH1cbiAgZ2V0RXhlY3V0aW5nKGxpbnRlcjogTGludGVyLCBmaWxlUGF0aDogP3N0cmluZyk6ID9PYmplY3Qge1xuICAgIGZvciAoY29uc3QgZW50cnkgb2YgdGhpcy5leGVjdXRpbmcpIHtcbiAgICAgIGlmIChlbnRyeS5saW50ZXIgPT09IGxpbnRlciAmJiBlbnRyeS5maWxlUGF0aCA9PT0gZmlsZVBhdGgpIHtcbiAgICAgICAgcmV0dXJuIGVudHJ5XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBudWxsXG4gIH1cbiAgZGlkQmVnaW5MaW50aW5nKGxpbnRlcjogTGludGVyLCBmaWxlUGF0aDogP3N0cmluZykge1xuICAgIGlmICh0aGlzLmdldEV4ZWN1dGluZyhsaW50ZXIsIGZpbGVQYXRoKSkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIHRoaXMuZXhlY3V0aW5nLmFkZCh7IGxpbnRlciwgZmlsZVBhdGggfSlcbiAgICB0aGlzLnVwZGF0ZSgpXG4gIH1cbiAgZGlkRmluaXNoTGludGluZyhsaW50ZXI6IExpbnRlciwgZmlsZVBhdGg6ID9zdHJpbmcpIHtcbiAgICBjb25zdCBlbnRyeSA9IHRoaXMuZ2V0RXhlY3V0aW5nKGxpbnRlciwgZmlsZVBhdGgpXG4gICAgaWYgKGVudHJ5KSB7XG4gICAgICB0aGlzLmV4ZWN1dGluZy5kZWxldGUoZW50cnkpXG4gICAgICB0aGlzLnVwZGF0ZSgpXG4gICAgfVxuICB9XG4gIGRpc3Bvc2UoKSB7XG4gICAgaWYgKHRoaXMucHJvdmlkZXIpIHtcbiAgICAgIHRoaXMucHJvdmlkZXIuY2xlYXIoKVxuICAgIH1cbiAgICB0aGlzLmV4ZWN1dGluZy5jbGVhcigpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICB9XG59XG4iXX0=