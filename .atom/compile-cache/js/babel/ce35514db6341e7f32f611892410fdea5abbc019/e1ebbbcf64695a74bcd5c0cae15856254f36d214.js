Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _atom = require('atom');

var _main = require('./main');

var _main2 = _interopRequireDefault(_main);

var _greeter = require('./greeter');

var _greeter2 = _interopRequireDefault(_greeter);

var greeter = undefined;
var instance = undefined;

exports['default'] = {
  activate: function activate() {
    if (!atom.inSpecMode()) {
      // eslint-disable-next-line global-require
      require('atom-package-deps').install('linter', true);
    }
    greeter = new _greeter2['default']();
    instance = new _main2['default']();

    greeter.activate()['catch'](function (e) {
      return console.error('[Linter-UI-Default] Error', e);
    });
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
      return instance.registryIndie.register(indie, 2);
    };
  },
  provideIndieLegacy: function provideIndieLegacy() {
    return {
      register: function register(indie) {
        return instance.registryIndie.register(indie, 1);
      }
    };
  },
  deactivate: function deactivate() {
    instance.dispose();
    greeter.dispose();
  }
};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci9saWIvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O29CQUUyQixNQUFNOztvQkFDZCxRQUFROzs7O3VCQUNQLFdBQVc7Ozs7QUFHL0IsSUFBSSxPQUFPLFlBQUEsQ0FBQTtBQUNYLElBQUksUUFBUSxZQUFBLENBQUE7O3FCQUVHO0FBQ2IsVUFBUSxFQUFBLG9CQUFHO0FBQ1QsUUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsRUFBRTs7QUFFdEIsYUFBTyxDQUFDLG1CQUFtQixDQUFDLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQTtLQUNyRDtBQUNELFdBQU8sR0FBRywwQkFBYSxDQUFBO0FBQ3ZCLFlBQVEsR0FBRyx1QkFBWSxDQUFBOztBQUV2QixXQUFPLENBQUMsUUFBUSxFQUFFLFNBQU0sQ0FBQyxVQUFBLENBQUM7YUFBSSxPQUFPLENBQUMsS0FBSyxDQUFDLDJCQUEyQixFQUFFLENBQUMsQ0FBQztLQUFBLENBQUMsQ0FBQTtHQUM3RTtBQUNELGVBQWEsRUFBQSx1QkFBQyxNQUFzQixFQUFjO0FBQ2hELFFBQU0sT0FBTyxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUE7QUFDakMsU0FBSyxJQUFNLEtBQUssSUFBSSxPQUFPLEVBQUU7QUFDM0IsY0FBUSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQTtLQUMxQjtBQUNELFdBQU8scUJBQWUsWUFBTTtBQUMxQixXQUFLLElBQU0sS0FBSyxJQUFJLE9BQU8sRUFBRTtBQUMzQixnQkFBUSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQTtPQUM3QjtLQUNGLENBQUMsQ0FBQTtHQUNIO0FBQ0QscUJBQW1CLEVBQUEsNkJBQUMsTUFBc0IsRUFBYztBQUN0RCxRQUFNLE9BQU8sR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFBO0FBQ2pDLFNBQUssSUFBTSxLQUFLLElBQUksT0FBTyxFQUFFO0FBQzNCLFlBQU0sQ0FBQyxJQUFJLEdBQUcsTUFBTSxDQUFDLElBQUksSUFBSSxTQUFTLENBQUE7QUFDdEMsWUFBTSxDQUFDLFNBQVMsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFBO0FBQzVDLGNBQVEsQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFBO0tBQ2hDO0FBQ0QsV0FBTyxxQkFBZSxZQUFNO0FBQzFCLFdBQUssSUFBTSxLQUFLLElBQUksT0FBTyxFQUFFO0FBQzNCLGdCQUFRLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFBO09BQzdCO0tBQ0YsQ0FBQyxDQUFBO0dBQ0g7QUFDRCxXQUFTLEVBQUEsbUJBQUMsRUFBTSxFQUFjO0FBQzVCLFFBQU0sR0FBRyxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUE7QUFDekIsU0FBSyxJQUFNLEtBQUssSUFBSSxHQUFHLEVBQUU7QUFDdkIsY0FBUSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQTtLQUN0QjtBQUNELFdBQU8scUJBQWUsWUFBTTtBQUMxQixXQUFLLElBQU0sS0FBSyxJQUFJLEdBQUcsRUFBRTtBQUN2QixnQkFBUSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQTtPQUN6QjtLQUNGLENBQUMsQ0FBQTtHQUNIO0FBQ0QsY0FBWSxFQUFBLHdCQUFXO0FBQ3JCLFdBQU8sVUFBQSxLQUFLO2FBQ1YsUUFBUSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztLQUFBLENBQUE7R0FDNUM7QUFDRCxvQkFBa0IsRUFBQSw4QkFBVztBQUMzQixXQUFPO0FBQ0wsY0FBUSxFQUFFLGtCQUFBLEtBQUs7ZUFBSSxRQUFRLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO09BQUE7S0FDN0QsQ0FBQTtHQUNGO0FBQ0QsWUFBVSxFQUFBLHNCQUFHO0FBQ1gsWUFBUSxDQUFDLE9BQU8sRUFBRSxDQUFBO0FBQ2xCLFdBQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQTtHQUNsQjtDQUNGIiwiZmlsZSI6Ii9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci9saWIvaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBAZmxvdyAqL1xuXG5pbXBvcnQgeyBEaXNwb3NhYmxlIH0gZnJvbSAnYXRvbSdcbmltcG9ydCBMaW50ZXIgZnJvbSAnLi9tYWluJ1xuaW1wb3J0IEdyZWV0ZXIgZnJvbSAnLi9ncmVldGVyJ1xuaW1wb3J0IHR5cGUgeyBVSSwgTGludGVyIGFzIExpbnRlclByb3ZpZGVyIH0gZnJvbSAnLi90eXBlcydcblxubGV0IGdyZWV0ZXJcbmxldCBpbnN0YW5jZVxuXG5leHBvcnQgZGVmYXVsdCB7XG4gIGFjdGl2YXRlKCkge1xuICAgIGlmICghYXRvbS5pblNwZWNNb2RlKCkpIHtcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBnbG9iYWwtcmVxdWlyZVxuICAgICAgcmVxdWlyZSgnYXRvbS1wYWNrYWdlLWRlcHMnKS5pbnN0YWxsKCdsaW50ZXInLCB0cnVlKVxuICAgIH1cbiAgICBncmVldGVyID0gbmV3IEdyZWV0ZXIoKVxuICAgIGluc3RhbmNlID0gbmV3IExpbnRlcigpXG5cbiAgICBncmVldGVyLmFjdGl2YXRlKCkuY2F0Y2goZSA9PiBjb25zb2xlLmVycm9yKCdbTGludGVyLVVJLURlZmF1bHRdIEVycm9yJywgZSkpXG4gIH0sXG4gIGNvbnN1bWVMaW50ZXIobGludGVyOiBMaW50ZXJQcm92aWRlcik6IERpc3Bvc2FibGUge1xuICAgIGNvbnN0IGxpbnRlcnMgPSBbXS5jb25jYXQobGludGVyKVxuICAgIGZvciAoY29uc3QgZW50cnkgb2YgbGludGVycykge1xuICAgICAgaW5zdGFuY2UuYWRkTGludGVyKGVudHJ5KVxuICAgIH1cbiAgICByZXR1cm4gbmV3IERpc3Bvc2FibGUoKCkgPT4ge1xuICAgICAgZm9yIChjb25zdCBlbnRyeSBvZiBsaW50ZXJzKSB7XG4gICAgICAgIGluc3RhbmNlLmRlbGV0ZUxpbnRlcihlbnRyeSlcbiAgICAgIH1cbiAgICB9KVxuICB9LFxuICBjb25zdW1lTGludGVyTGVnYWN5KGxpbnRlcjogTGludGVyUHJvdmlkZXIpOiBEaXNwb3NhYmxlIHtcbiAgICBjb25zdCBsaW50ZXJzID0gW10uY29uY2F0KGxpbnRlcilcbiAgICBmb3IgKGNvbnN0IGVudHJ5IG9mIGxpbnRlcnMpIHtcbiAgICAgIGxpbnRlci5uYW1lID0gbGludGVyLm5hbWUgfHwgJ1Vua25vd24nXG4gICAgICBsaW50ZXIubGludE9uRmx5ID0gQm9vbGVhbihsaW50ZXIubGludE9uRmx5KVxuICAgICAgaW5zdGFuY2UuYWRkTGludGVyKGVudHJ5LCB0cnVlKVxuICAgIH1cbiAgICByZXR1cm4gbmV3IERpc3Bvc2FibGUoKCkgPT4ge1xuICAgICAgZm9yIChjb25zdCBlbnRyeSBvZiBsaW50ZXJzKSB7XG4gICAgICAgIGluc3RhbmNlLmRlbGV0ZUxpbnRlcihlbnRyeSlcbiAgICAgIH1cbiAgICB9KVxuICB9LFxuICBjb25zdW1lVUkodWk6IFVJKTogRGlzcG9zYWJsZSB7XG4gICAgY29uc3QgdWlzID0gW10uY29uY2F0KHVpKVxuICAgIGZvciAoY29uc3QgZW50cnkgb2YgdWlzKSB7XG4gICAgICBpbnN0YW5jZS5hZGRVSShlbnRyeSlcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBEaXNwb3NhYmxlKCgpID0+IHtcbiAgICAgIGZvciAoY29uc3QgZW50cnkgb2YgdWlzKSB7XG4gICAgICAgIGluc3RhbmNlLmRlbGV0ZVVJKGVudHJ5KVxuICAgICAgfVxuICAgIH0pXG4gIH0sXG4gIHByb3ZpZGVJbmRpZSgpOiBPYmplY3Qge1xuICAgIHJldHVybiBpbmRpZSA9PlxuICAgICAgaW5zdGFuY2UucmVnaXN0cnlJbmRpZS5yZWdpc3RlcihpbmRpZSwgMilcbiAgfSxcbiAgcHJvdmlkZUluZGllTGVnYWN5KCk6IE9iamVjdCB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHJlZ2lzdGVyOiBpbmRpZSA9PiBpbnN0YW5jZS5yZWdpc3RyeUluZGllLnJlZ2lzdGVyKGluZGllLCAxKSxcbiAgICB9XG4gIH0sXG4gIGRlYWN0aXZhdGUoKSB7XG4gICAgaW5zdGFuY2UuZGlzcG9zZSgpXG4gICAgZ3JlZXRlci5kaXNwb3NlKClcbiAgfSxcbn1cbiJdfQ==