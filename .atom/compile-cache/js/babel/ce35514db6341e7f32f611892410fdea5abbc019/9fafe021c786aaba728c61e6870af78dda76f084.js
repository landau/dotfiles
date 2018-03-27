Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _lodash = require('lodash');

var _atom = require('atom');

var _AtomAutocompleteProvider = require('./AtomAutocompleteProvider');

var _JavaClassLoader = require('./JavaClassLoader');

var _atomJavaUtil = require('./atomJavaUtil');

var _atomJavaUtil2 = _interopRequireDefault(_atomJavaUtil);

'use babel';

var AtomAutocompletePackage = (function () {
  function AtomAutocompletePackage() {
    _classCallCheck(this, AtomAutocompletePackage);

    this.config = require('./config.json');
    this.subscriptions = undefined;
    this.provider = undefined;
    this.classLoader = undefined;
    this.classpath = null;
    this.initialized = false;
  }

  _createClass(AtomAutocompletePackage, [{
    key: 'activate',
    value: function activate() {
      var _this = this;

      this.classLoader = new _JavaClassLoader.JavaClassLoader(atom.config.get('autocomplete-java.javaHome'));
      this.provider = new _AtomAutocompleteProvider.AtomAutocompleteProvider(this.classLoader);
      this.subscriptions = new _atom.CompositeDisposable();

      // Listen for commands
      this.subscriptions.add(atom.commands.add('atom-workspace', 'autocomplete-java:organize-imports', function () {
        _this._organizeImports();
      }));
      this.subscriptions.add(atom.commands.add('atom-workspace', 'autocomplete-java:refresh-project', function () {
        if (_this.initialized) {
          _this._refresh(false);
        }
      }));
      this.subscriptions.add(atom.commands.add('atom-workspace', 'autocomplete-java:full-refresh', function () {
        if (_this.initialized) {
          _this._refresh(true);
        }
      }));

      // Listen for config changes
      // TODO refactor: bypasses provider.configure()
      this.subscriptions.add(atom.config.observe('autocomplete-java.inclusionPriority', function (val) {
        _this.provider.inclusionPriority = val;
      }));
      this.subscriptions.add(atom.config.observe('autocomplete-java.excludeLowerPriority', function (val) {
        _this.provider.excludeLowerPriority = val;
      }));
      this.subscriptions.add(atom.config.observe('autocomplete-java.foldImports', function (val) {
        _this.provider.foldImports = val;
      }));

      // Listen for buffer change
      this.subscriptions.add(atom.workspace.onDidStopChangingActivePaneItem(function (paneItem) {
        _this._onChange(paneItem);
      }));

      // Listen for file save
      atom.workspace.observeTextEditors(function (editor) {
        if (_this.subscriptions) {
          _this.subscriptions.add(editor.getBuffer().onWillSave(function () {
            _this._onSave(editor);
          }));
        }
      });

      // Start full refresh
      setTimeout(function () {
        // Refresh all classes
        _this.initialized = true;
        _this._refresh(true);
      }, 300);
    }
  }, {
    key: 'deactivate',
    value: function deactivate() {
      this.subscriptions.dispose();
      this.provider = null;
      this.classLoader = null;
      this.subscriptions = null;
      this.classpath = null;
      this.initialized = false;
    }
  }, {
    key: 'getProvider',
    value: function getProvider() {
      return this.provider;
    }

    // Commands

  }, {
    key: '_refresh',
    value: _asyncToGenerator(function* (fullRefresh) {
      // Refresh provider settings
      // TODO observe config changes
      this.provider.configure(atom.config.get('autocomplete-java'));
      this.classLoader.setJavaHome(atom.config.get('autocomplete-java.javaHome'));

      // Load classes using classpath
      var classpath = yield this._loadClasspath();
      if (classpath) {
        this.classLoader.loadClasses(classpath, atom.config.get('autocomplete-java.loadClassMembers'), fullRefresh);
      }
    })
  }, {
    key: '_refreshClass',
    value: function _refreshClass(className, delayMillis) {
      var _this2 = this;

      setTimeout(function () {
        if (_this2.classpath) {
          _this2.classLoader.loadClass(className, _this2.classpath, atom.config.get('autocomplete-java.loadClassMembers'));
        } else {
          console.warn('autocomplete-java: classpath not set.');
        }
      }, delayMillis);
    }
  }, {
    key: '_organizeImports',
    value: function _organizeImports() {
      var editor = atom.workspace.getActiveTextEditor();
      if (this._isJavaFile(editor)) {
        _atomJavaUtil2['default'].organizeImports(editor, null, atom.config.get('autocomplete-java.foldImports'));
      }
    }
  }, {
    key: '_onChange',
    value: function _onChange(paneItem) {
      var _this3 = this;

      if (this._isJavaFile(paneItem)) {
        // Active file has changed -> fold imports
        if (atom.config.get('autocomplete-java.foldImports')) {
          _atomJavaUtil2['default'].foldImports(paneItem);
        }
        // Active file has changed -> touch every imported class
        _lodash._.each(_atomJavaUtil2['default'].getImports(paneItem), function (imp) {
          try {
            _this3.classLoader.touchClass(imp.match(/import\s*(\S*);/)[1]);
          } catch (err) {
            // console.warn(err);
          }
        });
      }
    }
  }, {
    key: '_onSave',
    value: function _onSave(editor) {
      // TODO use onDidSave for refreshing and onWillSave for organizing imports
      if (this._isJavaFile(editor)) {
        // Refresh saved class after it has been compiled
        if (atom.config.get('autocomplete-java.refreshClassOnSave')) {
          var fileMatch = editor.getPath().match(/\/([^\/]*)\.java/);
          var packageMatch = editor.getText().match(/package\s(.*);/);
          if (fileMatch && packageMatch) {
            // TODO use file watcher instead of hardcoded timeout
            var className = packageMatch[1] + '.' + fileMatch[1];
            this._refreshClass(className, 3000);
          }
        }
      }
    }

    // Util methods

  }, {
    key: '_isJavaFile',
    value: function _isJavaFile(editor) {
      return editor instanceof _atom.TextEditor && editor.getPath() && editor.getPath().match(/\.java$/);
    }

    // TODO: this is a quick hack for loading classpath. replace with
    // atom-javaenv once it has been implemented
  }, {
    key: '_loadClasspath',
    value: _asyncToGenerator(function* () {
      var _this4 = this;

      var separator = null;
      var classpathSet = new Set();
      var classpathFileName = atom.config.get('autocomplete-java.classpathFilePath');

      yield atom.workspace.scan(/^.+$/, { paths: ['*' + classpathFileName] }, function (file) {
        separator = file.filePath.indexOf(':') !== -1 ? ';' : ':';
        _lodash._.each(file.matches, function (match) {
          // NOTE: The :\ replace is a quick hack for supporting Windows
          // absolute paths e.g E:\myProject\lib
          _lodash._.each(match.matchText.replace(':\\', '+\\').split(/[\:\;]+/), function (path) {
            classpathSet.add(_this4._asAbsolutePath(file.filePath, path.replace('+\\', ':\\')));
          });
        });
      });

      var classpath = '';
      _lodash._.each([].concat(_toConsumableArray(classpathSet)), function (path) {
        classpath = classpath + path + separator;
      });
      this.classpath = classpath;
      return classpath;
    })

    // TODO: this is a quick hack for loading path. replace with atom-javaenv
    // once it has been implemented
  }, {
    key: '_asAbsolutePath',
    value: function _asAbsolutePath(currentFilePath, path) {
      var p = path;
      var dirPath = currentFilePath.match(/(.*)[\\\/]/)[1];
      var addBaseDir = false;
      // Remove ../ or ..\ from beginning
      while (/^\.\.[\\\/]/.test(p)) {
        addBaseDir = true;
        dirPath = dirPath.match(/(.*)[\\\/]/)[1];
        p = p.substring(3);
      }
      // Remove ./ or .\ from beginning
      while (/^\.[\\\/]/.test(p)) {
        addBaseDir = true;
        p = p.substring(2);
      }
      return addBaseDir ? dirPath + '/' + p : p;
    }
  }]);

  return AtomAutocompletePackage;
})();

exports['default'] = new AtomAutocompletePackage();
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2F1dG9jb21wbGV0ZS1qYXZhL2xpYi9hdG9tQXV0b2NvbXBsZXRlUGFja2FnZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztzQkFFa0IsUUFBUTs7b0JBQ0MsTUFBTTs7d0NBRVEsNEJBQTRCOzsrQkFDckMsbUJBQW1COzs0QkFDMUIsZ0JBQWdCOzs7O0FBUHpDLFdBQVcsQ0FBQzs7SUFTTix1QkFBdUI7QUFFaEIsV0FGUCx1QkFBdUIsR0FFYjswQkFGVix1QkFBdUI7O0FBR3pCLFFBQUksQ0FBQyxNQUFNLEdBQUcsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0FBQ3ZDLFFBQUksQ0FBQyxhQUFhLEdBQUcsU0FBUyxDQUFDO0FBQy9CLFFBQUksQ0FBQyxRQUFRLEdBQUcsU0FBUyxDQUFDO0FBQzFCLFFBQUksQ0FBQyxXQUFXLEdBQUcsU0FBUyxDQUFDO0FBQzdCLFFBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO0FBQ3RCLFFBQUksQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDO0dBQzFCOztlQVRHLHVCQUF1Qjs7V0FXbkIsb0JBQUc7OztBQUNULFVBQUksQ0FBQyxXQUFXLEdBQUcscUNBQ2pCLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLDRCQUE0QixDQUFDLENBQUMsQ0FBQztBQUNqRCxVQUFJLENBQUMsUUFBUSxHQUFHLHVEQUE2QixJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDL0QsVUFBSSxDQUFDLGFBQWEsR0FBRywrQkFBeUIsQ0FBQzs7O0FBRy9DLFVBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUNwQixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRSxvQ0FBb0MsRUFDeEUsWUFBTTtBQUNKLGNBQUssZ0JBQWdCLEVBQUUsQ0FBQztPQUN6QixDQUFDLENBQ0gsQ0FBQztBQUNGLFVBQUksQ0FBQyxhQUFh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QU8sR0FBRyxlQUFlLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3JELFVBQUksVUFBVSxHQUFHLEtBQUssQ0FBQzs7QUFFdkIsYUFBTyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFO0FBQzVCLGtCQUFVLEdBQUcsSUFBSSxDQUFDO0FBQ2xCLGVBQU8sR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3pDLFNBQUMsR0FBRyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO09BQ3BCOztBQUVELGFBQU8sV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRTtBQUMxQixrQkFBVSxHQUFHLElBQUksQ0FBQztBQUNsQixTQUFDLEdBQUcsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztPQUNwQjtBQUNELGFBQU8sVUFBVSxHQUFHLE9BQU8sR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztLQUMzQzs7O1NBMU5HLHVCQUF1Qjs7O3FCQThOZCxJQUFJLHVCQUF1QixFQUFFIiwiZmlsZSI6Ii9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2F1dG9jb21wbGV0ZS1qYXZhL2xpYi9hdG9tQXV0b2NvbXBsZXRlUGFja2FnZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5pbXBvcnQgeyBfIH0gZnJvbSAnbG9kYXNoJztcbmltcG9ydCB7IFRleHRFZGl0b3IgfSBmcm9tICdhdG9tJztcbmltcG9ydCB7IENvbXBvc2l0ZURpc3Bvc2FibGUgfSBmcm9tICdhdG9tJztcbmltcG9ydCB7IEF0b21BdXRvY29tcGxldGVQcm92aWRlciB9IGZyb20gJy4vQXRvbUF1dG9jb21wbGV0ZVByb3ZpZGVyJztcbmltcG9ydCB7IEphdmFDbGFzc0xvYWRlciB9IGZyb20gJy4vSmF2YUNsYXNzTG9hZGVyJztcbmltcG9ydCBhdG9tSmF2YVV0aWwgZnJvbSAnLi9hdG9tSmF2YVV0aWwnO1xuXG5jbGFzcyBBdG9tQXV0b2NvbXBsZXRlUGFja2FnZSB7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5jb25maWcgPSByZXF1aXJlKCcuL2NvbmZpZy5qc29uJyk7XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zID0gdW5kZWZpbmVkO1xuICAgIHRoaXMucHJvdmlkZXIgPSB1bmRlZmluZWQ7XG4gICAgdGhpcy5jbGFzc0xvYWRlciA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLmNsYXNzcGF0aCA9IG51bGw7XG4gICAgdGhpcy5pbml0aWFsaXplZCA9IGZhbHNlO1xuICB9XG5cbiAgYWN0aXZhdGUoKSB7XG4gICAgdGhpcy5jbGFzc0xvYWRlciA9IG5ldyBKYXZhQ2xhc3NMb2FkZXIoXG4gICAgICBhdG9tLmNvbmZpZy5nZXQoJ2F1dG9jb21wbGV0ZS1qYXZhLmphdmFIb21lJykpO1xuICAgIHRoaXMucHJvdmlkZXIgPSBuZXcgQXRvbUF1dG9jb21wbGV0ZVByb3ZpZGVyKHRoaXMuY2xhc3NMb2FkZXIpO1xuICAgIHRoaXMuc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG5cbiAgICAvLyBMaXN0ZW4gZm9yIGNvbW1hbmRzXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChcbiAgICAgIGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXdvcmtzcGFjZScsICdhdXRvY29tcGxldGUtamF2YTpvcmdhbml6ZS1pbXBvcnRzJyxcbiAgICAgICgpID0+IHtcbiAgICAgICAgdGhpcy5fb3JnYW5pemVJbXBvcnRzKCk7XG4gICAgICB9KVxuICAgICk7XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChcbiAgICAgIGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXdvcmtzcGFjZScsICdhdXRvY29tcGxldGUtamF2YTpyZWZyZXNoLXByb2plY3QnLFxuICAgICAgKCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5pbml0aWFsaXplZCkge1xuICAgICAgICAgIHRoaXMuX3JlZnJlc2goZmFsc2UpO1xuICAgICAgICB9XG4gICAgICB9KVxuICAgICk7XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChcbiAgICAgIGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXdvcmtzcGFjZScsICdhdXRvY29tcGxldGUtamF2YTpmdWxsLXJlZnJlc2gnLFxuICAgICAgKCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5pbml0aWFsaXplZCkge1xuICAgICAgICAgIHRoaXMuX3JlZnJlc2godHJ1ZSk7XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgKTtcblxuICAgIC8vIExpc3RlbiBmb3IgY29uZmlnIGNoYW5nZXNcbiAgICAvLyBUT0RPIHJlZmFjdG9yOiBieXBhc3NlcyBwcm92aWRlci5jb25maWd1cmUoKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoXG4gICAgICBhdG9tLmNvbmZpZy5vYnNlcnZlKCdhdXRvY29tcGxldGUtamF2YS5pbmNsdXNpb25Qcmlvcml0eScsICh2YWwpID0+IHtcbiAgICAgICAgdGhpcy5wcm92aWRlci5pbmNsdXNpb25Qcmlvcml0eSA9IHZhbDtcbiAgICAgIH0pXG4gICAgKTtcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgYXRvbS5jb25maWcub2JzZXJ2ZSgnYXV0b2NvbXBsZXRlLWphdmEuZXhjbHVkZUxvd2VyUHJpb3JpdHknLCAodmFsKSA9PiB7XG4gICAgICAgIHRoaXMucHJvdmlkZXIuZXhjbHVkZUxvd2VyUHJpb3JpdHkgPSB2YWw7XG4gICAgICB9KVxuICAgICk7XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChcbiAgICAgIGF0b20uY29uZmlnLm9ic2VydmUoJ2F1dG9jb21wbGV0ZS1qYXZhLmZvbGRJbXBvcnRzJywgKHZhbCkgPT4ge1xuICAgICAgICB0aGlzLnByb3ZpZGVyLmZvbGRJbXBvcnRzID0gdmFsO1xuICAgICAgfSlcbiAgICApO1xuXG4gICAgLy8gTGlzdGVuIGZvciBidWZmZXIgY2hhbmdlXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChcbiAgICAgIGF0b20ud29ya3NwYWNlLm9uRGlkU3RvcENoYW5naW5nQWN0aXZlUGFuZUl0ZW0oKHBhbmVJdGVtKSA9PiB7XG4gICAgICAgIHRoaXMuX29uQ2hhbmdlKHBhbmVJdGVtKTtcbiAgICAgIH0pXG4gICAgKTtcblxuICAgIC8vIExpc3RlbiBmb3IgZmlsZSBzYXZlXG4gICAgYXRvbS53b3Jrc3BhY2Uub2JzZXJ2ZVRleHRFZGl0b3JzKGVkaXRvciA9PiB7XG4gICAgICBpZiAodGhpcy5zdWJzY3JpcHRpb25zKSB7XG4gICAgICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoZWRpdG9yLmdldEJ1ZmZlcigpLm9uV2lsbFNhdmUoKCkgPT4ge1xuICAgICAgICAgIHRoaXMuX29uU2F2ZShlZGl0b3IpO1xuICAgICAgICB9KSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBTdGFydCBmdWxsIHJlZnJlc2hcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIC8vIFJlZnJlc2ggYWxsIGNsYXNzZXNcbiAgICAgIHRoaXMuaW5pdGlhbGl6ZWQgPSB0cnVlO1xuICAgICAgdGhpcy5fcmVmcmVzaCh0cnVlKTtcbiAgICB9LCAzMDApO1xuICB9XG5cbiAgZGVhY3RpdmF0ZSgpIHtcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpO1xuICAgIHRoaXMucHJvdmlkZXIgPSBudWxsO1xuICAgIHRoaXMuY2xhc3NMb2FkZXIgPSBudWxsO1xuICAgIHRoaXMuc3Vic2NyaXB0aW9ucyA9IG51bGw7XG4gICAgdGhpcy5jbGFzc3BhdGggPSBudWxsO1xuICAgIHRoaXMuaW5pdGlhbGl6ZWQgPSBmYWxzZTtcbiAgfVxuXG4gIGdldFByb3ZpZGVyKCkge1xuICAgIHJldHVybiB0aGlzLnByb3ZpZGVyO1xuICB9XG5cbiAgLy8gQ29tbWFuZHNcblxuICBhc3luYyBfcmVmcmVzaChmdWxsUmVmcmVzaCkge1xuICAgIC8vIFJlZnJlc2ggcHJvdmlkZXIgc2V0dGluZ3NcbiAgICAvLyBUT0RPIG9ic2VydmUgY29uZmlnIGNoYW5nZXNcbiAgICB0aGlzLnByb3ZpZGVyLmNvbmZpZ3VyZShhdG9tLmNvbmZpZy5nZXQoJ2F1dG9jb21wbGV0ZS1qYXZhJykpO1xuICAgIHRoaXMuY2xhc3NMb2FkZXIuc2V0SmF2YUhvbWUoYXRvbS5jb25maWcuZ2V0KCdhdXRvY29tcGxldGUtamF2YS5qYXZhSG9tZScpKTtcblxuICAgIC8vIExvYWQgY2xhc3NlcyB1c2luZyBjbGFzc3BhdGhcbiAgICBjb25zdCBjbGFzc3BhdGggPSBhd2FpdCB0aGlzLl9sb2FkQ2xhc3NwYXRoKCk7XG4gICAgaWYgKGNsYXNzcGF0aCkge1xuICAgICAgdGhpcy5jbGFzc0xvYWRlci5sb2FkQ2xhc3NlcyhjbGFzc3BhdGgsXG4gICAgICAgIGF0b20uY29uZmlnLmdldCgnYXV0b2NvbXBsZXRlLWphdmEubG9hZENsYXNzTWVtYmVycycpLCBmdWxsUmVmcmVzaCk7XG4gICAgfVxuICB9XG5cbiAgX3JlZnJlc2hDbGFzcyhjbGFzc05hbWUsIGRlbGF5TWlsbGlzKSB7XG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICBpZiAodGhpcy5jbGFzc3BhdGgpIHtcbiAgICAgICAgdGhpcy5jbGFzc0xvYWRlci5sb2FkQ2xhc3MoY2xhc3NOYW1lLCB0aGlzLmNsYXNzcGF0aCxcbiAgICAgICAgICBhdG9tLmNvbmZpZy5nZXQoJ2F1dG9jb21wbGV0ZS1qYXZhLmxvYWRDbGFzc01lbWJlcnMnKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLndhcm4oJ2F1dG9jb21wbGV0ZS1qYXZhOiBjbGFzc3BhdGggbm90IHNldC4nKTtcbiAgICAgIH1cbiAgICB9LCBkZWxheU1pbGxpcyk7XG4gIH1cblxuICBfb3JnYW5pemVJbXBvcnRzKCkge1xuICAgIGNvbnN0IGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKTtcbiAgICBpZiAodGhpcy5faXNKYXZhRmlsZShlZGl0b3IpKSB7XG4gICAgICBhdG9tSmF2YVV0aWwub3JnYW5pemVJbXBvcnRzKGVkaXRvciwgbnVsbCxcbiAgICAgICAgYXRvbS5jb25maWcuZ2V0KCdhdXRvY29tcGxldGUtamF2YS5mb2xkSW1wb3J0cycpKTtcbiAgICB9XG4gIH1cblxuICBfb25DaGFuZ2UocGFuZUl0ZW0pIHtcbiAgICBpZiAodGhpcy5faXNKYXZhRmlsZShwYW5lSXRlbSkpIHtcbiAgICAgIC8vIEFjdGl2ZSBmaWxlIGhhcyBjaGFuZ2VkIC0+IGZvbGQgaW1wb3J0c1xuICAgICAgaWYgKGF0b20uY29uZmlnLmdldCgnYXV0b2NvbXBsZXRlLWphdmEuZm9sZEltcG9ydHMnKSkge1xuICAgICAgICBhdG9tSmF2YVV0aWwuZm9sZEltcG9ydHMocGFuZUl0ZW0pO1xuICAgICAgfVxuICAgICAgLy8gQWN0aXZlIGZpbGUgaGFzIGNoYW5nZWQgLT4gdG91Y2ggZXZlcnkgaW1wb3J0ZWQgY2xhc3NcbiAgICAgIF8uZWFjaChhdG9tSmF2YVV0aWwuZ2V0SW1wb3J0cyhwYW5lSXRlbSksIGltcCA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgdGhpcy5jbGFzc0xvYWRlci50b3VjaENsYXNzKGltcC5tYXRjaCgvaW1wb3J0XFxzKihcXFMqKTsvKVsxXSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgIC8vIGNvbnNvbGUud2FybihlcnIpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBfb25TYXZlKGVkaXRvcikge1xuICAgIC8vIFRPRE8gdXNlIG9uRGlkU2F2ZSBmb3IgcmVmcmVzaGluZyBhbmQgb25XaWxsU2F2ZSBmb3Igb3JnYW5pemluZyBpbXBvcnRzXG4gICAgaWYgKHRoaXMuX2lzSmF2YUZpbGUoZWRpdG9yKSkge1xuICAgICAgLy8gUmVmcmVzaCBzYXZlZCBjbGFzcyBhZnRlciBpdCBoYXMgYmVlbiBjb21waWxlZFxuICAgICAgaWYgKGF0b20uY29uZmlnLmdldCgnYXV0b2NvbXBsZXRlLWphdmEucmVmcmVzaENsYXNzT25TYXZlJykpIHtcbiAgICAgICAgY29uc3QgZmlsZU1hdGNoID0gZWRpdG9yLmdldFBhdGgoKS5tYXRjaCgvXFwvKFteXFwvXSopXFwuamF2YS8pO1xuICAgICAgICBjb25zdCBwYWNrYWdlTWF0Y2ggPSBlZGl0b3IuZ2V0VGV4dCgpLm1hdGNoKC9wYWNrYWdlXFxzKC4qKTsvKTtcbiAgICAgICAgaWYgKGZpbGVNYXRjaCAmJiBwYWNrYWdlTWF0Y2gpIHtcbiAgICAgICAgICAvLyBUT0RPIHVzZSBmaWxlIHdhdGNoZXIgaW5zdGVhZCBvZiBoYXJkY29kZWQgdGltZW91dFxuICAgICAgICAgIGNvbnN0IGNsYXNzTmFtZSA9IHBhY2thZ2VNYXRjaFsxXSArICcuJyArIGZpbGVNYXRjaFsxXTtcbiAgICAgICAgICB0aGlzLl9yZWZyZXNoQ2xhc3MoY2xhc3NOYW1lLCAzMDAwKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIFV0aWwgbWV0aG9kc1xuXG4gIF9pc0phdmFGaWxlKGVkaXRvcikge1xuICAgIHJldHVybiBlZGl0b3IgaW5zdGFuY2VvZiBUZXh0RWRpdG9yICYmIGVkaXRvci5nZXRQYXRoKCkgJiZcbiAgICAgIGVkaXRvci5nZXRQYXRoKCkubWF0Y2goL1xcLmphdmEkLyk7XG4gIH1cblxuICAvLyBUT0RPOiB0aGlzIGlzIGEgcXVpY2sgaGFjayBmb3IgbG9hZGluZyBjbGFzc3BhdGguIHJlcGxhY2Ugd2l0aFxuICAvLyBhdG9tLWphdmFlbnYgb25jZSBpdCBoYXMgYmVlbiBpbXBsZW1lbnRlZFxuICBhc3luYyBfbG9hZENsYXNzcGF0aCgpIHtcbiAgICBsZXQgc2VwYXJhdG9yID0gbnVsbDtcbiAgICBjb25zdCBjbGFzc3BhdGhTZXQgPSBuZXcgU2V0KCk7XG4gICAgY29uc3QgY2xhc3NwYXRoRmlsZU5hbWUgPVxuICAgICAgYXRvbS5jb25maWcuZ2V0KCdhdXRvY29tcGxldGUtamF2YS5jbGFzc3BhdGhGaWxlUGF0aCcpO1xuXG4gICAgYXdhaXQgYXRvbS53b3Jrc3BhY2Uuc2NhbigvXi4rJC8sIHsgcGF0aHM6IFsnKicgKyBjbGFzc3BhdGhGaWxlTmFtZV0gfSxcbiAgICBmaWxlID0+IHtcbiAgICAgIHNlcGFyYXRvciA9IGZpbGUuZmlsZVBhdGguaW5kZXhPZignOicpICE9PSAtMSA/ICc7JyA6ICc6JztcbiAgICAgIF8uZWFjaChmaWxlLm1hdGNoZXMsIG1hdGNoID0+IHtcbiAgICAgICAgLy8gTk9URTogVGhlIDpcXCByZXBsYWNlIGlzIGEgcXVpY2sgaGFjayBmb3Igc3VwcG9ydGluZyBXaW5kb3dzXG4gICAgICAgIC8vIGFic29sdXRlIHBhdGhzIGUuZyBFOlxcbXlQcm9qZWN0XFxsaWJcbiAgICAgICAgXy5lYWNoKG1hdGNoLm1hdGNoVGV4dC5yZXBsYWNlKCc6XFxcXCcsICcrXFxcXCcpLnNwbGl0KC9bXFw6XFw7XSsvKSwgcGF0aCA9PiB7XG4gICAgICAgICAgY2xhc3NwYXRoU2V0LmFkZCh0aGlzLl9hc0Fic29sdXRlUGF0aChmaWxlLmZpbGVQYXRoLFxuICAgICAgICAgICAgcGF0aC5yZXBsYWNlKCcrXFxcXCcsICc6XFxcXCcpKSk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBsZXQgY2xhc3NwYXRoID0gJyc7XG4gICAgXy5lYWNoKFsuLi5jbGFzc3BhdGhTZXRdLCBwYXRoID0+IHtcbiAgICAgIGNsYXNzcGF0aCA9IGNsYXNzcGF0aCArIHBhdGggKyBzZXBhcmF0b3I7XG4gICAgfSk7XG4gICAgdGhpcy5jbGFzc3BhdGggPSBjbGFzc3BhdGg7XG4gICAgcmV0dXJuIGNsYXNzcGF0aDtcbiAgfVxuXG4gIC8vIFRPRE86IHRoaXMgaXMgYSBxdWljayBoYWNrIGZvciBsb2FkaW5nIHBhdGguIHJlcGxhY2Ugd2l0aCBhdG9tLWphdmFlbnZcbiAgLy8gb25jZSBpdCBoYXMgYmVlbiBpbXBsZW1lbnRlZFxuICBfYXNBYnNvbHV0ZVBhdGgoY3VycmVudEZpbGVQYXRoLCBwYXRoKSB7XG4gICAgbGV0IHAgPSBwYXRoO1xuICAgIGxldCBkaXJQYXRoID0gY3VycmVudEZpbGVQYXRoLm1hdGNoKC8oLiopW1xcXFxcXC9dLylbMV07XG4gICAgbGV0IGFkZEJhc2VEaXIgPSBmYWxzZTtcbiAgICAvLyBSZW1vdmUgLi4vIG9yIC4uXFwgZnJvbSBiZWdpbm5pbmdcbiAgICB3aGlsZSAoL15cXC5cXC5bXFxcXFxcL10vLnRlc3QocCkpIHtcbiAgICAgIGFkZEJhc2VEaXIgPSB0cnVlO1xuICAgICAgZGlyUGF0aCA9IGRpclBhdGgubWF0Y2goLyguKilbXFxcXFxcL10vKVsxXTtcbiAgICAgIHAgPSBwLnN1YnN0cmluZygzKTtcbiAgICB9XG4gICAgLy8gUmVtb3ZlIC4vIG9yIC5cXCBmcm9tIGJlZ2lubmluZ1xuICAgIHdoaWxlICgvXlxcLltcXFxcXFwvXS8udGVzdChwKSkge1xuICAgICAgYWRkQmFzZURpciA9IHRydWU7XG4gICAgICBwID0gcC5zdWJzdHJpbmcoMik7XG4gICAgfVxuICAgIHJldHVybiBhZGRCYXNlRGlyID8gZGlyUGF0aCArICcvJyArIHAgOiBwO1xuICB9XG5cbn1cblxuZXhwb3J0IGRlZmF1bHQgbmV3IEF0b21BdXRvY29tcGxldGVQYWNrYWdlKCk7XG4iXX0=