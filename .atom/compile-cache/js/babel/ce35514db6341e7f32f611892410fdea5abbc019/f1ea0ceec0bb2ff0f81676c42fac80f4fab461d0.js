Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

var _atom = require('atom');

var _main = require('./main');

var _main2 = _interopRequireDefault(_main);

// Internal variables
var instance = undefined;

var idleCallbacks = new Set();

exports['default'] = {
  activate: function activate() {
    this.subscriptions = new _atom.CompositeDisposable();

    instance = new _main2['default']();
    this.subscriptions.add(instance);

    // TODO: Remove this after a few version bumps
    var oldConfigCallbackID = window.requestIdleCallback(_asyncToGenerator(function* () {
      idleCallbacks['delete'](oldConfigCallbackID);
      var FS = require('sb-fs');
      var Path = require('path');
      var Greeter = require('./greeter');

      // Greet the user if they are coming from Linter v1
      var greeter = new Greeter();
      this.subscriptions.add(greeter);
      var linterConfigs = atom.config.get('linter');
      // Unset v1 configs
      var removedV1Configs = ['lintOnFly', 'lintOnFlyInterval', 'ignoredMessageTypes', 'ignoreVCSIgnoredFiles', 'ignoreMatchedFiles', 'showErrorInline', 'inlineTooltipInterval', 'gutterEnabled', 'gutterPosition', 'underlineIssues', 'showProviderName', 'showErrorPanel', 'errorPanelHeight', 'alwaysTakeMinimumSpace', 'displayLinterInfo', 'displayLinterStatus', 'showErrorTabLine', 'showErrorTabFile', 'showErrorTabProject', 'statusIconScope', 'statusIconPosition'];
      if (removedV1Configs.some(function (config) {
        return ({}).hasOwnProperty.call(linterConfigs, config);
      })) {
        greeter.showWelcome();
      }
      removedV1Configs.forEach(function (e) {
        atom.config.unset('linter.' + e);
      });

      // There was an external config file in use briefly, migrate any use of that to settings
      var oldConfigFile = Path.join(atom.getConfigDirPath(), 'linter-config.json');
      if (yield FS.exists(oldConfigFile)) {
        var disabledProviders = atom.config.get('linter.disabledProviders');
        try {
          var oldConfigFileContents = yield FS.readFile(oldConfigFile, 'utf8');
          disabledProviders = disabledProviders.concat(JSON.parse(oldConfigFileContents).disabled);
        } catch (_) {
          console.error('[Linter] Error reading old state file', _);
        }
        atom.config.set('linter.disabledProviders', disabledProviders);
        try {
          yield FS.unlink(oldConfigFile);
        } catch (_) {/* No Op */}
      }
    }).bind(this));
    idleCallbacks.add(oldConfigCallbackID);

    var linterDepsCallback = window.requestIdleCallback(function linterDepsInstall() {
      idleCallbacks['delete'](linterDepsCallback);
      if (!atom.inSpecMode()) {
        // eslint-disable-next-line global-require
        require('atom-package-deps').install('linter', true);
      }
    });
    idleCallbacks.add(linterDepsCallback);
  },
  consumeLinter: function consumeLinter(linter) {
    var linters = [].concat(linter);
    for (var entry of linters) {
      instance.addLinter(entry);
    }
    return new _atom.Disposable(function () {
      for (var entry of linters) {
        instance.deleteLinter(entry);
      }
    });
  },
  consumeLinterLegacy: function consumeLinterLegacy(linter) {
    var linters = [].concat(linter);
    for (var entry of linters) {
      linter.name = linter.name || 'Unknown';
      linter.lintOnFly = Boolean(linter.lintOnFly);
      instance.addLinter(entry, true);
    }
    return new _atom.Disposable(function () {
      for (var entry of linters) {
        instance.deleteLinter(entry);
      }
    });
  },
  consumeUI: function consumeUI(ui) {
    var uis = [].concat(ui);
    for (var entry of uis) {
      instance.addUI(entry);
    }
    return new _atom.Disposable(function () {
      for (var entry of uis) {
        instance.deleteUI(entry);
      }
    });
  },
  provideIndie: function provideIndie() {
    return function (indie) {
      return instance.addIndie(indie);
    };
  },
  provideIndieLegacy: function provideIndieLegacy() {
    return {
      register: function register(indie) {
        return instance.addLegacyIndie(indie);
      }
    };
  },
  deactivate: function deactivate() {
    idleCallbacks.forEach(function (callbackID) {
      return window.cancelIdleCallback(callbackID);
    });
    idleCallbacks.clear();
    this.subscriptions.dispose();
  }
};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci9saWIvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7b0JBRWdELE1BQU07O29CQUVuQyxRQUFROzs7OztBQUkzQixJQUFJLFFBQVEsWUFBQSxDQUFBOztBQUVaLElBQU0sYUFBYSxHQUFHLElBQUksR0FBRyxFQUFFLENBQUE7O3FCQUVoQjtBQUNiLFVBQVEsRUFBQSxvQkFBRztBQUNULFFBQUksQ0FBQyxhQUFhLEdBQUcsK0JBQXlCLENBQUE7O0FBRTlDLFlBQVEsR0FBRyx1QkFBWSxDQUFBO0FBQ3ZCLFFBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFBOzs7QUFHaEMsUUFBTSxtQkFBbUIsR0FBRyxNQUFNLENBQUMsbUJBQW1CLENBQUMsa0JBQUEsYUFBa0M7QUFDdkYsbUJBQWEsVUFBTyxDQUFDLG1CQUFtQixDQUFDLENBQUE7QUFDekMsVUFBTSxFQUFFLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFBO0FBQzNCLFVBQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQTtBQUM1QixVQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUE7OztBQUdwQyxVQUFNLE9BQU8sR0FBRyxJQUFJLE9BQU8sRUFBRSxDQUFBO0FBQzdCLFVBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFBO0FBQy9CLFVBQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFBOztBQUUvQyxVQUFNLGdCQUFnQixHQUFHLENBQ3ZCLFdBQVcsRUFDWCxtQkFBbUIsRUFDbkIscUJBQXFCLEVBQ3JCLHVCQUF1QixFQUN2QixvQkFBb0IsRUFDcEIsaUJBQWlCLEVBQ2pCLHVCQUF1QixFQUN2QixlQUFlLEVBQ2YsZ0JBQWdCLEVBQ2hCLGlCQUFp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Q0FBQyxrQkFBa0IsQ0FBQyxVQUFVLENBQUM7S0FBQSxDQUFDLENBQUE7QUFDMUUsaUJBQWEsQ0FBQyxLQUFLLEVBQUUsQ0FBQTtBQUNyQixRQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxDQUFBO0dBQzdCO0NBQ0YiLCJmaWxlIjoiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvbGludGVyL2xpYi9pbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIEBmbG93ICovXG5cbmltcG9ydCB7IENvbXBvc2l0ZURpc3Bvc2FibGUsIERpc3Bvc2FibGUgfSBmcm9tICdhdG9tJ1xuXG5pbXBvcnQgTGludGVyIGZyb20gJy4vbWFpbidcbmltcG9ydCB0eXBlIHsgVUksIExpbnRlciBhcyBMaW50ZXJQcm92aWRlciB9IGZyb20gJy4vdHlwZXMnXG5cbi8vIEludGVybmFsIHZhcmlhYmxlc1xubGV0IGluc3RhbmNlXG5cbmNvbnN0IGlkbGVDYWxsYmFja3MgPSBuZXcgU2V0KClcblxuZXhwb3J0IGRlZmF1bHQge1xuICBhY3RpdmF0ZSgpIHtcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG5cbiAgICBpbnN0YW5jZSA9IG5ldyBMaW50ZXIoKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoaW5zdGFuY2UpXG5cbiAgICAvLyBUT0RPOiBSZW1vdmUgdGhpcyBhZnRlciBhIGZldyB2ZXJzaW9uIGJ1bXBzXG4gICAgY29uc3Qgb2xkQ29uZmlnQ2FsbGJhY2tJRCA9IHdpbmRvdy5yZXF1ZXN0SWRsZUNhbGxiYWNrKGFzeW5jIGZ1bmN0aW9uIGxpbnRlck9sZENvbmZpZ3MoKSB7XG4gICAgICBpZGxlQ2FsbGJhY2tzLmRlbGV0ZShvbGRDb25maWdDYWxsYmFja0lEKVxuICAgICAgY29uc3QgRlMgPSByZXF1aXJlKCdzYi1mcycpXG4gICAgICBjb25zdCBQYXRoID0gcmVxdWlyZSgncGF0aCcpXG4gICAgICBjb25zdCBHcmVldGVyID0gcmVxdWlyZSgnLi9ncmVldGVyJylcblxuICAgICAgLy8gR3JlZXQgdGhlIHVzZXIgaWYgdGhleSBhcmUgY29taW5nIGZyb20gTGludGVyIHYxXG4gICAgICBjb25zdCBncmVldGVyID0gbmV3IEdyZWV0ZXIoKVxuICAgICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChncmVldGVyKVxuICAgICAgY29uc3QgbGludGVyQ29uZmlncyA9IGF0b20uY29uZmlnLmdldCgnbGludGVyJylcbiAgICAgIC8vIFVuc2V0IHYxIGNvbmZpZ3NcbiAgICAgIGNvbnN0IHJlbW92ZWRWMUNvbmZpZ3MgPSBbXG4gICAgICAgICdsaW50T25GbHknLFxuICAgICAgICAnbGludE9uRmx5SW50ZXJ2YWwnLFxuICAgICAgICAnaWdub3JlZE1lc3NhZ2VUeXBlcycsXG4gICAgICAgICdpZ25vcmVWQ1NJZ25vcmVkRmlsZXMnLFxuICAgICAgICAnaWdub3JlTWF0Y2hlZEZpbGVzJyxcbiAgICAgICAgJ3Nob3dFcnJvcklubGluZScsXG4gICAgICAgICdpbmxpbmVUb29sdGlwSW50ZXJ2YWwnLFxuICAgICAgICAnZ3V0dGVyRW5hYmxlZCcsXG4gICAgICAgICdndXR0ZXJQb3NpdGlvbicsXG4gICAgICAgICd1bmRlcmxpbmVJc3N1ZXMnLFxuICAgICAgICAnc2hvd1Byb3ZpZGVyTmFtZScsXG4gICAgICAgICdzaG93RXJyb3JQYW5lbCcsXG4gICAgICAgICdlcnJvclBhbmVsSGVpZ2h0JyxcbiAgICAgICAgJ2Fsd2F5c1Rha2VNaW5pbXVtU3BhY2UnLFxuICAgICAgICAnZGlzcGxheUxpbnRlckluZm8nLFxuICAgICAgICAnZGlzcGxheUxpbnRlclN0YXR1cycsXG4gICAgICAgICdzaG93RXJyb3JUYWJMaW5lJyxcbiAgICAgICAgJ3Nob3dFcnJvclRhYkZpbGUnLFxuICAgICAgICAnc2hvd0Vycm9yVGFiUHJvamVjdCcsXG4gICAgICAgICdzdGF0dXNJY29uU2NvcGUnLFxuICAgICAgICAnc3RhdHVzSWNvblBvc2l0aW9uJyxcbiAgICAgIF1cbiAgICAgIGlmIChyZW1vdmVkVjFDb25maWdzLnNvbWUoY29uZmlnID0+ICh7fS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGxpbnRlckNvbmZpZ3MsIGNvbmZpZykpKSkge1xuICAgICAgICBncmVldGVyLnNob3dXZWxjb21lKClcbiAgICAgIH1cbiAgICAgIHJlbW92ZWRWMUNvbmZpZ3MuZm9yRWFjaCgoZSkgPT4geyBhdG9tLmNvbmZpZy51bnNldChgbGludGVyLiR7ZX1gKSB9KVxuXG4gICAgICAvLyBUaGVyZSB3YXMgYW4gZXh0ZXJuYWwgY29uZmlnIGZpbGUgaW4gdXNlIGJyaWVmbHksIG1pZ3JhdGUgYW55IHVzZSBvZiB0aGF0IHRvIHNldHRpbmdzXG4gICAgICBjb25zdCBvbGRDb25maWdGaWxlID0gUGF0aC5qb2luKGF0b20uZ2V0Q29uZmlnRGlyUGF0aCgpLCAnbGludGVyLWNvbmZpZy5qc29uJylcbiAgICAgIGlmIChhd2FpdCBGUy5leGlzdHMob2xkQ29uZmlnRmlsZSkpIHtcbiAgICAgICAgbGV0IGRpc2FibGVkUHJvdmlkZXJzID0gYXRvbS5jb25maWcuZ2V0KCdsaW50ZXIuZGlzYWJsZWRQcm92aWRlcnMnKVxuICAgICAgICB0cnkge1xuICAgICAgICAgIGNvbnN0IG9sZENvbmZpZ0ZpbGVDb250ZW50cyA9IGF3YWl0IEZTLnJlYWRGaWxlKG9sZENvbmZpZ0ZpbGUsICd1dGY4JylcbiAgICAgICAgICBkaXNhYmxlZFByb3ZpZGVycyA9IGRpc2FibGVkUHJvdmlkZXJzLmNvbmNhdChKU09OLnBhcnNlKG9sZENvbmZpZ0ZpbGVDb250ZW50cykuZGlzYWJsZWQpXG4gICAgICAgIH0gY2F0Y2ggKF8pIHsgY29uc29sZS5lcnJvcignW0xpbnRlcl0gRXJyb3IgcmVhZGluZyBvbGQgc3RhdGUgZmlsZScsIF8pIH1cbiAgICAgICAgYXRvbS5jb25maWcuc2V0KCdsaW50ZXIuZGlzYWJsZWRQcm92aWRlcnMnLCBkaXNhYmxlZFByb3ZpZGVycylcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBhd2FpdCBGUy51bmxpbmsob2xkQ29uZmlnRmlsZSlcbiAgICAgICAgfSBjYXRjaCAoXykgeyAvKiBObyBPcCAqLyB9XG4gICAgICB9XG4gICAgfS5iaW5kKHRoaXMpKVxuICAgIGlkbGVDYWxsYmFja3MuYWRkKG9sZENvbmZpZ0NhbGxiYWNrSUQpXG5cbiAgICBjb25zdCBsaW50ZXJEZXBzQ2FsbGJhY2sgPSB3aW5kb3cucmVxdWVzdElkbGVDYWxsYmFjayhmdW5jdGlvbiBsaW50ZXJEZXBzSW5zdGFsbCgpIHtcbiAgICAgIGlkbGVDYWxsYmFja3MuZGVsZXRlKGxpbnRlckRlcHNDYWxsYmFjaylcbiAgICAgIGlmICghYXRvbS5pblNwZWNNb2RlKCkpIHtcbiAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGdsb2JhbC1yZXF1aXJlXG4gICAgICAgIHJlcXVpcmUoJ2F0b20tcGFja2FnZS1kZXBzJykuaW5zdGFsbCgnbGludGVyJywgdHJ1ZSlcbiAgICAgIH1cbiAgICB9KVxuICAgIGlkbGVDYWxsYmFja3MuYWRkKGxpbnRlckRlcHNDYWxsYmFjaylcbiAgfSxcbiAgY29uc3VtZUxpbnRlcihsaW50ZXI6IExpbnRlclByb3ZpZGVyKTogRGlzcG9zYWJsZSB7XG4gICAgY29uc3QgbGludGVycyA9IFtdLmNvbmNhdChsaW50ZXIpXG4gICAgZm9yIChjb25zdCBlbnRyeSBvZiBsaW50ZXJzKSB7XG4gICAgICBpbnN0YW5jZS5hZGRMaW50ZXIoZW50cnkpXG4gICAgfVxuICAgIHJldHVybiBuZXcgRGlzcG9zYWJsZSgoKSA9PiB7XG4gICAgICBmb3IgKGNvbnN0IGVudHJ5IG9mIGxpbnRlcnMpIHtcbiAgICAgICAgaW5zdGFuY2UuZGVsZXRlTGludGVyKGVudHJ5KVxuICAgICAgfVxuICAgIH0pXG4gIH0sXG4gIGNvbnN1bWVMaW50ZXJMZWdhY3kobGludGVyOiBMaW50ZXJQcm92aWRlcik6IERpc3Bvc2FibGUge1xuICAgIGNvbnN0IGxpbnRlcnMgPSBbXS5jb25jYXQobGludGVyKVxuICAgIGZvciAoY29uc3QgZW50cnkgb2YgbGludGVycykge1xuICAgICAgbGludGVyLm5hbWUgPSBsaW50ZXIubmFtZSB8fCAnVW5rbm93bidcbiAgICAgIGxpbnRlci5saW50T25GbHkgPSBCb29sZWFuKGxpbnRlci5saW50T25GbHkpXG4gICAgICBpbnN0YW5jZS5hZGRMaW50ZXIoZW50cnksIHRydWUpXG4gICAgfVxuICAgIHJldHVybiBuZXcgRGlzcG9zYWJsZSgoKSA9PiB7XG4gICAgICBmb3IgKGNvbnN0IGVudHJ5IG9mIGxpbnRlcnMpIHtcbiAgICAgICAgaW5zdGFuY2UuZGVsZXRlTGludGVyKGVudHJ5KVxuICAgICAgfVxuICAgIH0pXG4gIH0sXG4gIGNvbnN1bWVVSSh1aTogVUkpOiBEaXNwb3NhYmxlIHtcbiAgICBjb25zdCB1aXMgPSBbXS5jb25jYXQodWkpXG4gICAgZm9yIChjb25zdCBlbnRyeSBvZiB1aXMpIHtcbiAgICAgIGluc3RhbmNlLmFkZFVJKGVudHJ5KVxuICAgIH1cbiAgICByZXR1cm4gbmV3IERpc3Bvc2FibGUoKCkgPT4ge1xuICAgICAgZm9yIChjb25zdCBlbnRyeSBvZiB1aXMpIHtcbiAgICAgICAgaW5zdGFuY2UuZGVsZXRlVUkoZW50cnkpXG4gICAgICB9XG4gICAgfSlcbiAgfSxcbiAgcHJvdmlkZUluZGllKCk6IE9iamVjdCB7XG4gICAgcmV0dXJuIGluZGllID0+XG4gICAgICBpbnN0YW5jZS5hZGRJbmRpZShpbmRpZSlcbiAgfSxcbiAgcHJvdmlkZUluZGllTGVnYWN5KCk6IE9iamVjdCB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHJlZ2lzdGVyOiBpbmRpZSA9PiBpbnN0YW5jZS5hZGRMZWdhY3lJbmRpZShpbmRpZSksXG4gICAgfVxuICB9LFxuICBkZWFjdGl2YXRlKCkge1xuICAgIGlkbGVDYWxsYmFja3MuZm9yRWFjaChjYWxsYmFja0lEID0+IHdpbmRvdy5jYW5jZWxJZGxlQ2FsbGJhY2soY2FsbGJhY2tJRCkpXG4gICAgaWRsZUNhbGxiYWNrcy5jbGVhcigpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICB9LFxufVxuIl19