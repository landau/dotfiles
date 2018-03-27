Object.defineProperty(exports, '__esModule', {
  value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _sbEventKit = require('sb-event-kit');

var BusySignal = (function () {
  function BusySignal() {
    _classCallCheck(this, BusySignal);

    this.executing = new Set();
    this.subscriptions = new _sbEventKit.CompositeDisposable();
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
      if (!provider) {
        return;
      }
      provider.clear();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci11aS1kZWZhdWx0L2xpYi9idXN5LXNpZ25hbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OzBCQUVvQyxjQUFjOztJQUc3QixVQUFVO0FBUWxCLFdBUlEsVUFBVSxHQVFmOzBCQVJLLFVBQVU7O0FBUzNCLFFBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQTtBQUMxQixRQUFJLENBQUMsYUFBYSxHQUFHLHFDQUF5QixDQUFBO0dBQy9DOztlQVhrQixVQUFVOztXQVl2QixnQkFBQyxRQUFnQixFQUFFO0FBQ3ZCLFVBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFBO0FBQ2pDLFVBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQTtLQUNkOzs7V0FDSyxrQkFBRztBQUNQLFVBQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUE7QUFDOUIsVUFBSSxDQUFDLFFBQVEsRUFBRTtBQUNiLGVBQU07T0FDUDtBQUNELGNBQVEsQ0FBQyxLQUFLLEVBQUUsQ0FBQTtBQUNoQixVQUFNLE9BQW9DLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQTs7QUFFdEQsd0JBQW1DLElBQUksQ0FBQyxTQUFTLEVBQUU7WUFBdEMsU0FBUSxTQUFSLFFBQVE7WUFBRSxPQUFNLFNBQU4sTUFBTTs7QUFDM0IsWUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFRLENBQUMsQ0FBQTtBQUNqQyxZQUFJLENBQUMsS0FBSyxFQUFFO0FBQ1YsaUJBQU8sQ0FBQyxHQUFHLENBQUMsU0FBUSxFQUFFLEtBQUssR0FBRyxFQUFFLENBQUMsQ0FBQTtTQUNsQztBQUNELGFBQUssQ0FBQyxJQUFJLENBQUMsT0FBTSxDQUFDLElBQUksQ0FBQyxDQUFBO09BQ3hCOztBQUVELHlCQUFnQyxPQUFPLEVBQUU7OztZQUE3QixVQUFRO1lBQUUsS0FBSzs7QUFDekIsWUFBTSxJQUFJLEdBQUcsVUFBUSxZQUFVLElBQUksQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLFVBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFLLEVBQUUsQ0FBQTtBQUM5RSxnQkFBUSxDQUFDLEdBQUcsTUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBRyxDQUFBO09BQzNDO0FBQ0QsYUFBTyxDQUFDLEtBQUssRUFBRSxDQUFBO0tBQ2hCOzs7V0FDVyxzQkFBQyxNQUFjLEVBQUUsUUFBaUIsRUFBVztBQUN2RCxXQUFLLElBQU0sS0FBSyxJQUFJLElBQUksQ0FBQyxTQUFTLEVBQUU7QUFDbEMsWUFBSSxLQUFLLENBQUMsTUFBTSxLQUFLLE1BQU0sSUFBSSxLQUFLLENBQUMsUUFBUSxLQUFLLFFBQVEsRUFBRTtBQUMxRCxpQkFBTyxLQUFLLENBQUE7U0FDYjtPQUNGO0FBQ0QsYUFBTyxJQUFJLENBQUE7S0FDWjs7O1dBQ2MseUJBQUMsTUFBYyxFQUFFLFFBQWlCLEVBQUU7QUFDakQsVUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsRUFBRTtBQUN2QyxlQUFNO09BQ1A7QUFDRCxVQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxFQUFFLE1BQU0sRUFBTixNQUFNLEVBQUUsUUFBUSxFQUFSLFFBQVEsRUFBRSxDQUFDLENBQUE7QUFDeEMsVUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFBO0tBQ2Q7OztXQUNlLDBCQUFDLE1BQWMsRUFBRSxRQUFpQixFQUFFO0FBQ2xELFVBQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxDQUFBO0FBQ2pELFVBQUksS0FBSyxFQUFFO0FBQ1QsWUFBSSxDQUFDLFNBQVMsVUFBTyxDQUFDLEtBQUssQ0FBQyxDQUFBO0FBQzVCLFlBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQTtPQUNkO0tBQ0Y7OztXQUNNLG1CQUFHO0FBQ1IsVUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFO0FBQ2pCLFlBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLENBQUE7T0FDdEI7QUFDRCxVQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxDQUFBO0FBQ3RCLFVBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLENBQUE7S0FDN0I7OztTQWxFa0IsVUFBVTs7O3FCQUFWLFVBQVUiLCJmaWxlIjoiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvbGludGVyLXVpLWRlZmF1bHQvbGliL2J1c3ktc2lnbmFsLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogQGZsb3cgKi9cblxuaW1wb3J0IHsgQ29tcG9zaXRlRGlzcG9zYWJsZSB9IGZyb20gJ3NiLWV2ZW50LWtpdCdcbmltcG9ydCB0eXBlIHsgTGludGVyIH0gZnJvbSAnLi90eXBlcydcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQnVzeVNpZ25hbCB7XG4gIHByb3ZpZGVyOiA/T2JqZWN0O1xuICBleGVjdXRpbmc6IFNldDx7XG4gICAgbGludGVyOiBMaW50ZXIsXG4gICAgZmlsZVBhdGg6ID9zdHJpbmcsXG4gIH0+O1xuICBzdWJzY3JpcHRpb25zOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuZXhlY3V0aW5nID0gbmV3IFNldCgpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuICB9XG4gIGF0dGFjaChyZWdpc3RyeTogT2JqZWN0KSB7XG4gICAgdGhpcy5wcm92aWRlciA9IHJlZ2lzdHJ5LmNyZWF0ZSgpXG4gICAgdGhpcy51cGRhdGUoKVxuICB9XG4gIHVwZGF0ZSgpIHtcbiAgICBjb25zdCBwcm92aWRlciA9IHRoaXMucHJvdmlkZXJcbiAgICBpZiAoIXByb3ZpZGVyKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgcHJvdmlkZXIuY2xlYXIoKVxuICAgIGNvbnN0IGZpbGVNYXA6IE1hcDw/c3RyaW5nLCBBcnJheTxzdHJpbmc+PiA9IG5ldyBNYXAoKVxuXG4gICAgZm9yIChjb25zdCB7IGZpbGVQYXRoLCBsaW50ZXIgfSBvZiB0aGlzLmV4ZWN1dGluZykge1xuICAgICAgbGV0IG5hbWVzID0gZmlsZU1hcC5nZXQoZmlsZVBhdGgpXG4gICAgICBpZiAoIW5hbWVzKSB7XG4gICAgICAgIGZpbGVNYXAuc2V0KGZpbGVQYXRoLCBuYW1lcyA9IFtdKVxuICAgICAgfVxuICAgICAgbmFtZXMucHVzaChsaW50ZXIubmFtZSlcbiAgICB9XG5cbiAgICBmb3IgKGNvbnN0IFtmaWxlUGF0aCwgbmFtZXNdIG9mIGZpbGVNYXApIHtcbiAgICAgIGNvbnN0IHBhdGggPSBmaWxlUGF0aCA/IGAgb24gJHthdG9tLnByb2plY3QucmVsYXRpdml6ZVBhdGgoZmlsZVBhdGgpWzFdfWAgOiAnJ1xuICAgICAgcHJvdmlkZXIuYWRkKGAke25hbWVzLmpvaW4oJywgJyl9JHtwYXRofWApXG4gICAgfVxuICAgIGZpbGVNYXAuY2xlYXIoKVxuICB9XG4gIGdldEV4ZWN1dGluZyhsaW50ZXI6IExpbnRlciwgZmlsZVBhdGg6ID9zdHJpbmcpOiA/T2JqZWN0IHtcbiAgICBmb3IgKGNvbnN0IGVudHJ5IG9mIHRoaXMuZXhlY3V0aW5nKSB7XG4gICAgICBpZiAoZW50cnkubGludGVyID09PSBsaW50ZXIgJiYgZW50cnkuZmlsZVBhdGggPT09IGZpbGVQYXRoKSB7XG4gICAgICAgIHJldHVybiBlbnRyeVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbnVsbFxuICB9XG4gIGRpZEJlZ2luTGludGluZyhsaW50ZXI6IExpbnRlciwgZmlsZVBhdGg6ID9zdHJpbmcpIHtcbiAgICBpZiAodGhpcy5nZXRFeGVjdXRpbmcobGludGVyLCBmaWxlUGF0aCkpIHtcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICB0aGlzLmV4ZWN1dGluZy5hZGQoeyBsaW50ZXIsIGZpbGVQYXRoIH0pXG4gICAgdGhpcy51cGRhdGUoKVxuICB9XG4gIGRpZEZpbmlzaExpbnRpbmcobGludGVyOiBMaW50ZXIsIGZpbGVQYXRoOiA/c3RyaW5nKSB7XG4gICAgY29uc3QgZW50cnkgPSB0aGlzLmdldEV4ZWN1dGluZyhsaW50ZXIsIGZpbGVQYXRoKVxuICAgIGlmIChlbnRyeSkge1xuICAgICAgdGhpcy5leGVjdXRpbmcuZGVsZXRlKGVudHJ5KVxuICAgICAgdGhpcy51cGRhdGUoKVxuICAgIH1cbiAgfVxuICBkaXNwb3NlKCkge1xuICAgIGlmICh0aGlzLnByb3ZpZGVyKSB7XG4gICAgICB0aGlzLnByb3ZpZGVyLmNsZWFyKClcbiAgICB9XG4gICAgdGhpcy5leGVjdXRpbmcuY2xlYXIoKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiAgfVxufVxuIl19