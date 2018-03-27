var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var BusySignal = (function () {
  function BusySignal() {
    var _this = this;

    _classCallCheck(this, BusySignal);

    this.executing = new Set();
    this.providerTitles = new Set();
    this.subscriptions = new _atom.CompositeDisposable();

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
      var _this2 = this;

      var provider = this.provider;
      if (!provider) return;
      if (!this.useBusySignal) return;
      var fileMap = new Map();
      var currentTitles = new Set();

      for (var _ref2 of this.executing) {
        var _filePath = _ref2.filePath;
        var _linter = _ref2.linter;

        var names = fileMap.get(_filePath);
        if (!names) {
          fileMap.set(_filePath, names = []);
        }
        names.push(_linter.name);
      }

      var _loop = function (_ref3) {
        _ref32 = _slicedToArray(_ref3, 2);
        var filePath = _ref32[0];
        var names = _ref32[1];

        var path = filePath ? ' on ' + atom.project.relativizePath(filePath)[1] : '';
        names.forEach(function (name) {
          var title = '' + name + path;
          currentTitles.add(title);
          if (!_this2.providerTitles.has(title)) {
            // Add the title since it hasn't been seen before
            _this2.providerTitles.add(title);
            provider.add(title);
          }
        });
      };

      for (var _ref3 of fileMap) {
        var _ref32;

        _loop(_ref3);
      }

      // Remove any titles no longer active
      this.providerTitles.forEach(function (title) {
        if (!currentTitles.has(title)) {
          provider.remove(title);
          _this2.providerTitles['delete'](title);
        }
      });

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
      this.providerTitles.clear();
      this.executing.clear();
      this.subscriptions.dispose();
    }
  }]);

  return BusySignal;
})();

module.exports = BusySignal;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1Ly5hdG9tL3BhY2thZ2VzL2xpbnRlci11aS1kZWZhdWx0L2xpYi9idXN5LXNpZ25hbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7b0JBRW9DLE1BQU07O0lBR3BDLFVBQVU7QUFVSCxXQVZQLFVBQVUsR0FVQTs7OzBCQVZWLFVBQVU7O0FBV1osUUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFBO0FBQzFCLFFBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQTtBQUMvQixRQUFJLENBQUMsYUFBYSxHQUFHLCtCQUF5QixDQUFBOztBQUU5QyxRQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxpQ0FBaUMsRUFBRSxVQUFDLGFBQWEsRUFBSztBQUMvRixZQUFLLGFBQWEsR0FBRyxhQUFhLENBQUE7S0FDbkMsQ0FBQyxDQUFDLENBQUE7R0FDSjs7ZUFsQkcsVUFBVTs7V0FtQlIsZ0JBQUMsUUFBZ0IsRUFBRTtBQUN2QixVQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQTtBQUNqQyxVQUFJLENBQUMsTUFBTSxFQUFFLENBQUE7S0FDZDs7O1dBQ0ssa0JBQUc7OztBQUNQLFVBQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUE7QUFDOUIsVUFBSSxDQUFDLFFBQVEsRUFBRSxPQUFNO0FBQ3JCLFVBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLE9BQU07QUFDL0IsVUFBTSxPQUFvQyxHQUFHLElBQUksR0FBRyxFQUFFLENBQUE7QUFDdEQsVUFBTSxhQUFhLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQTs7QUFFL0Isd0JBQW1DLElBQUksQ0FBQyxTQUFTLEVBQUU7WUFBdEMsU0FBUSxTQUFSLFFBQVE7WUFBRSxPQUFNLFNBQU4sTUFBTTs7QUFDM0IsWUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFD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L1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvbGludGVyLXVpLWRlZmF1bHQvbGliL2J1c3ktc2lnbmFsLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogQGZsb3cgKi9cblxuaW1wb3J0IHsgQ29tcG9zaXRlRGlzcG9zYWJsZSB9IGZyb20gJ2F0b20nXG5pbXBvcnQgdHlwZSB7IExpbnRlciB9IGZyb20gJy4vdHlwZXMnXG5cbmNsYXNzIEJ1c3lTaWduYWwge1xuICBwcm92aWRlcjogP09iamVjdDtcbiAgZXhlY3V0aW5nOiBTZXQ8e1xuICAgIGxpbnRlcjogTGludGVyLFxuICAgIGZpbGVQYXRoOiA/c3RyaW5nLFxuICB9PjtcbiAgcHJvdmlkZXJUaXRsZXM6IFNldDxzdHJpbmc+O1xuICB1c2VCdXN5U2lnbmFsOiBib29sZWFuO1xuICBzdWJzY3JpcHRpb25zOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuZXhlY3V0aW5nID0gbmV3IFNldCgpXG4gICAgdGhpcy5wcm92aWRlclRpdGxlcyA9IG5ldyBTZXQoKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb25maWcub2JzZXJ2ZSgnbGludGVyLXVpLWRlZmF1bHQudXNlQnVzeVNpZ25hbCcsICh1c2VCdXN5U2lnbmFsKSA9PiB7XG4gICAgICB0aGlzLnVzZUJ1c3lTaWduYWwgPSB1c2VCdXN5U2lnbmFsXG4gICAgfSkpXG4gIH1cbiAgYXR0YWNoKHJlZ2lzdHJ5OiBPYmplY3QpIHtcbiAgICB0aGlzLnByb3ZpZGVyID0gcmVnaXN0cnkuY3JlYXRlKClcbiAgICB0aGlzLnVwZGF0ZSgpXG4gIH1cbiAgdXBkYXRlKCkge1xuICAgIGNvbnN0IHByb3ZpZGVyID0gdGhpcy5wcm92aWRlclxuICAgIGlmICghcHJvdmlkZXIpIHJldHVyblxuICAgIGlmICghdGhpcy51c2VCdXN5U2lnbmFsKSByZXR1cm5cbiAgICBjb25zdCBmaWxlTWFwOiBNYXA8P3N0cmluZywgQXJyYXk8c3RyaW5nPj4gPSBuZXcgTWFwKClcbiAgICBjb25zdCBjdXJyZW50VGl0bGVzID0gbmV3IFNldCgpXG5cbiAgICBmb3IgKGNvbnN0IHsgZmlsZVBhdGgsIGxpbnRlciB9IG9mIHRoaXMuZXhlY3V0aW5nKSB7XG4gICAgICBsZXQgbmFtZXMgPSBmaWxlTWFwLmdldChmaWxlUGF0aClcbiAgICAgIGlmICghbmFtZXMpIHtcbiAgICAgICAgZmlsZU1hcC5zZXQoZmlsZVBhdGgsIG5hbWVzID0gW10pXG4gICAgICB9XG4gICAgICBuYW1lcy5wdXNoKGxpbnRlci5uYW1lKVxuICAgIH1cblxuICAgIGZvciAoY29uc3QgW2ZpbGVQYXRoLCBuYW1lc10gb2YgZmlsZU1hcCkge1xuICAgICAgY29uc3QgcGF0aCA9IGZpbGVQYXRoID8gYCBvbiAke2F0b20ucHJvamVjdC5yZWxhdGl2aXplUGF0aChmaWxlUGF0aClbMV19YCA6ICcnXG4gICAgICBuYW1lcy5mb3JFYWNoKChuYW1lKSA9PiB7XG4gICAgICAgIGNvbnN0IHRpdGxlID0gYCR7bmFtZX0ke3BhdGh9YFxuICAgICAgICBjdXJyZW50VGl0bGVzLmFkZCh0aXRsZSlcbiAgICAgICAgaWYgKCF0aGlzLnByb3ZpZGVyVGl0bGVzLmhhcyh0aXRsZSkpIHtcbiAgICAgICAgICAvLyBBZGQgdGhlIHRpdGxlIHNpbmNlIGl0IGhhc24ndCBiZWVuIHNlZW4gYmVmb3JlXG4gICAgICAgICAgdGhpcy5wcm92aWRlclRpdGxlcy5hZGQodGl0bGUpXG4gICAgICAgICAgcHJvdmlkZXIuYWRkKHRpdGxlKVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH1cblxuICAgIC8vIFJlbW92ZSBhbnkgdGl0bGVzIG5vIGxvbmdlciBhY3RpdmVcbiAgICB0aGlzLnByb3ZpZGVyVGl0bGVzLmZvckVhY2goKHRpdGxlKSA9PiB7XG4gICAgICBpZiAoIWN1cnJlbnRUaXRsZXMuaGFzKHRpdGxlKSkge1xuICAgICAgICBwcm92aWRlci5yZW1vdmUodGl0bGUpXG4gICAgICAgIHRoaXMucHJvdmlkZXJUaXRsZXMuZGVsZXRlKHRpdGxlKVxuICAgICAgfVxuICAgIH0pXG5cbiAgICBmaWxlTWFwLmNsZWFyKClcbiAgfVxuICBnZXRFeGVjdXRpbmcobGludGVyOiBMaW50ZXIsIGZpbGVQYXRoOiA/c3RyaW5nKTogP09iamVjdCB7XG4gICAgZm9yIChjb25zdCBlbnRyeSBvZiB0aGlzLmV4ZWN1dGluZykge1xuICAgICAgaWYgKGVudHJ5LmxpbnRlciA9PT0gbGludGVyICYmIGVudHJ5LmZpbGVQYXRoID09PSBmaWxlUGF0aCkge1xuICAgICAgICByZXR1cm4gZW50cnlcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG51bGxcbiAgfVxuICBkaWRCZWdpbkxpbnRpbmcobGludGVyOiBMaW50ZXIsIGZpbGVQYXRoOiA/c3RyaW5nKSB7XG4gICAgaWYgKHRoaXMuZ2V0RXhlY3V0aW5nKGxpbnRlciwgZmlsZVBhdGgpKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgdGhpcy5leGVjdXRpbmcuYWRkKHsgbGludGVyLCBmaWxlUGF0aCB9KVxuICAgIHRoaXMudXBkYXRlKClcbiAgfVxuICBkaWRGaW5pc2hMaW50aW5nKGxpbnRlcjogTGludGVyLCBmaWxlUGF0aDogP3N0cmluZykge1xuICAgIGNvbnN0IGVudHJ5ID0gdGhpcy5nZXRFeGVjdXRpbmcobGludGVyLCBmaWxlUGF0aClcbiAgICBpZiAoZW50cnkpIHtcbiAgICAgIHRoaXMuZXhlY3V0aW5nLmRlbGV0ZShlbnRyeSlcbiAgICAgIHRoaXMudXBkYXRlKClcbiAgICB9XG4gIH1cbiAgZGlzcG9zZSgpIHtcbiAgICBpZiAodGhpcy5wcm92aWRlcikge1xuICAgICAgdGhpcy5wcm92aWRlci5jbGVhcigpXG4gICAgfVxuICAgIHRoaXMucHJvdmlkZXJUaXRsZXMuY2xlYXIoKVxuICAgIHRoaXMuZXhlY3V0aW5nLmNsZWFyKClcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBCdXN5U2lnbmFsXG4iXX0=