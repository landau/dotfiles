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
    greeter = new _greeter2['default']();

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

    if (!atom.inSpecMode()) {
      // eslint-disable-next-line global-require
      require('atom-package-deps').install('linter', true);
    }

    instance = new _main2['default']();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci9saWIvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O29CQUUyQixNQUFNOztvQkFDZCxRQUFROzs7O3VCQUNQLFdBQVc7Ozs7QUFHL0IsSUFBSSxPQUFPLFlBQUEsQ0FBQTtBQUNYLElBQUksUUFBUSxZQUFBLENBQUE7O3FCQUVHO0FBQ2IsVUFBUSxFQUFBLG9CQUFHO0FBQ1QsV0FBTyxHQUFHLDBCQUFhLENBQUE7O0FBRXZCLFFBQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFBOztBQUUvQyxRQUFNLGdCQUFnQixHQUFHLENBQ3ZCLFdBQVcsRUFDWCxtQkFBbUIsRUFDbkIscUJBQXFCLEVBQ3JCLHVCQUF1QixFQUN2QixvQkFBb0IsRUFDcEIsaUJBQWlCLEVBQ2pCLHVCQUF1QixFQUN2QixlQUFlLEVBQ2YsZ0JBQWdCLEVBQ2hCLGlCQUFpQixFQUNqQixrQkFBa0IsRUFDbEIsZ0JBQWdCLEVBQ2hCLGtCQUFrQixFQUNsQix3QkFBd0IsRUFDeEIsbUJBQW1CLEVBQ25CLHFCQUFxQixFQUNyQixrQkFBa0IsRUFDbEIsa0JBQWtCLEVBQ2xCLHFCQUFxQixFQUNyQixpQkFBaUIsRUFDakIsb0JBQW9CLENBQ3JCLENBQUE7QUFDRCxRQUFJLGdCQUFnQixDQUFDLElBQUksQ0FBQyxVQUFBLE1BQU07YUFBSyxDQUFBLEdBQUUsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxNQUFNLENBQUM7S0FBQyxDQUFDLEVBQUU7QUFDcEYsYUFBTyxDQUFDLFdBQVcsRUFBRSxDQUFBO0tBQ3RCO0FBQ0Qsb0JBQWdCLENBQUMsT0FBTyxDQUFDLFVBQUMsQ0FBQyxFQUFLO0FBQUUsVUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLGFBQVcsQ0FBQyxDQUFHLENBQUE7S0FBRSxDQUFDLENBQUE7O0FBRXJFLFFBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLEVBQUU7O0FBRXRCLGFBQU8sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUE7S0FDckQ7O0FBRUQsWUFBUSxHQUFHLHVCQUFZLENBQUE7R0FDeEI7QUFDRCxlQUFhLEVBQUEsdUJBQUMsTUFBc0IsRUFBYztBQUNoRCxRQUFNLE9BQU8sR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFBO0FBQ2pDLFNBQUssSUFBTSxLQUFLLElBQUksT0FBTyxFQUFFO0FBQzNCLGNBQVEsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUE7S0FDMUI7QUFDRCxXQUFPLHFCQUFlLFlBQU07QUFDMUIsV0FBSyxJQUFNLEtBQUssSUFBSSxPQUFPLEVBQUU7QUFDM0IsZ0JBQVEsQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUE7T0FDN0I7S0FDRixDQUFDLENBQUE7R0FDSDtBQUNELHFCQUFtQixFQUFBLDZCQUFDLE1BQXNCLEVBQWM7QUFDdEQsUUFBTSxPQUFPLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQTtBQUNqQyxTQUFLLElBQU0sS0FBSyxJQUFJLE9BQU8sRUFBRTtBQUMzQixZQUFNLENBQUMsSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLElBQUksU0FBUyxDQUFBO0FBQ3RDLFlBQU0sQ0FBQyxTQUFTLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQTtBQUM1QyxjQUFRLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQTtLQUNoQztBQUNELFdBQU8scUJBQWUsWUFBTTtBQUMxQixXQUFLLElBQU0sS0FBSyxJQUFJLE9BQU8sRUFBRTtBQUMzQixnQkFBUSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQTtPQUM3QjtLQUNGLENBQUMsQ0FBQTtHQUNIO0FBQ0QsV0FBUyxFQUFBLG1CQUFDLEVBQU0sRUFBYztBQUM1QixRQUFNLEdBQUcsR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFBO0FBQ3pCLFNBQUssSUFBTSxLQUFLLElBQUksR0FBRyxFQUFFO0FBQ3ZCLGNBQVEsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUE7S0FDdEI7QUFDRCxXQUFPLHFCQUFlLFlBQU07QUFDMUIsV0FBSyxJQUFNLEtBQUssSUFBSSxHQUFHLEVBQUU7QUFDdkIsZ0JBQVEsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUE7T0FDekI7S0FDRixDQUFDLENBQUE7R0FDSDtBQUNELGNBQVksRUFBQSx3QkFBVztBQUNyQixXQUFPLFVBQUEsS0FBSzthQUNWLFFBQVEsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7S0FBQSxDQUFBO0dBQzVDO0FBQ0Qsb0JBQWtCLEVBQUEsOEJBQVc7QUFDM0IsV0FBTztBQUNMLGNBQVEsRUFBRSxrQkFBQSxLQUFLO2VBQUksUUFBUSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztPQUFBO0tBQzdELENBQUE7R0FDRjtBQUNELFlBQVUsRUFBQSxzQkFBRztBQUNYLFlBQVEsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtBQUNsQixXQUFPLENBQUMsT0FBTyxFQUFFLENBQUE7R0FDbEI7Q0FDRiIsImZpbGUiOiIvVXNlcnMvdGxhbmRhdS9kb3RmaWxlcy8uYXRvbS9wYWNrYWdlcy9saW50ZXIvbGliL2luZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogQGZsb3cgKi9cblxuaW1wb3J0IHsgRGlzcG9zYWJsZSB9IGZyb20gJ2F0b20nXG5pbXBvcnQgTGludGVyIGZyb20gJy4vbWFpbidcbmltcG9ydCBHcmVldGVyIGZyb20gJy4vZ3JlZXRlcidcbmltcG9ydCB0eXBlIHsgVUksIExpbnRlciBhcyBMaW50ZXJQcm92aWRlciB9IGZyb20gJy4vdHlwZXMnXG5cbmxldCBncmVldGVyXG5sZXQgaW5zdGFuY2VcblxuZXhwb3J0IGRlZmF1bHQge1xuICBhY3RpdmF0ZSgpIHtcbiAgICBncmVldGVyID0gbmV3IEdyZWV0ZXIoKVxuXG4gICAgY29uc3QgbGludGVyQ29uZmlncyA9IGF0b20uY29uZmlnLmdldCgnbGludGVyJylcbiAgICAvLyBVbnNldCB2MSBjb25maWdzXG4gICAgY29uc3QgcmVtb3ZlZFYxQ29uZmlncyA9IFtcbiAgICAgICdsaW50T25GbHknLFxuICAgICAgJ2xpbnRPbkZseUludGVydmFsJyxcbiAgICAgICdpZ25vcmVkTWVzc2FnZVR5cGVzJyxcbiAgICAgICdpZ25vcmVWQ1NJZ25vcmVkRmlsZXMnLFxuICAgICAgJ2lnbm9yZU1hdGNoZWRGaWxlcycsXG4gICAgICAnc2hvd0Vycm9ySW5saW5lJyxcbiAgICAgICdpbmxpbmVUb29sdGlwSW50ZXJ2YWwnLFxuICAgICAgJ2d1dHRlckVuYWJsZWQnLFxuICAgICAgJ2d1dHRlclBvc2l0aW9uJyxcbiAgICAgICd1bmRlcmxpbmVJc3N1ZXMnLFxuICAgICAgJ3Nob3dQcm92aWRlck5hbWUnLFxuICAgICAgJ3Nob3dFcnJvclBhbmVsJyxcbiAgICAgICdlcnJvclBhbmVsSGVpZ2h0JyxcbiAgICAgICdhbHdheXNUYWtlTWluaW11bVNwYWNlJyxcbiAgICAgICdkaXNwbGF5TGludGVySW5mbycsXG4gICAgICAnZGlzcGxheUxpbnRlclN0YXR1cycsXG4gICAgICAnc2hvd0Vycm9yVGFiTGluZScsXG4gICAgICAnc2hvd0Vycm9yVGFiRmlsZScsXG4gICAgICAnc2hvd0Vycm9yVGFiUHJvamVjdCcsXG4gICAgICAnc3RhdHVzSWNvblNjb3BlJyxcbiAgICAgICdzdGF0dXNJY29uUG9zaXRpb24nLFxuICAgIF1cbiAgICBpZiAocmVtb3ZlZFYxQ29uZmlncy5zb21lKGNvbmZpZyA9PiAoe30uaGFzT3duUHJvcGVydHkuY2FsbChsaW50ZXJDb25maWdzLCBjb25maWcpKSkpIHtcbiAgICAgIGdyZWV0ZXIuc2hvd1dlbGNvbWUoKVxuICAgIH1cbiAgICByZW1vdmVkVjFDb25maWdzLmZvckVhY2goKGUpID0+IHsgYXRvbS5jb25maWcudW5zZXQoYGxpbnRlci4ke2V9YCkgfSlcblxuICAgIGlmICghYXRvbS5pblNwZWNNb2RlKCkpIHtcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBnbG9iYWwtcmVxdWlyZVxuICAgICAgcmVxdWlyZSgnYXRvbS1wYWNrYWdlLWRlcHMnKS5pbnN0YWxsKCdsaW50ZXInLCB0cnVlKVxuICAgIH1cblxuICAgIGluc3RhbmNlID0gbmV3IExpbnRlcigpXG4gIH0sXG4gIGNvbnN1bWVMaW50ZXIobGludGVyOiBMaW50ZXJQcm92aWRlcik6IERpc3Bvc2FibGUge1xuICAgIGNvbnN0IGxpbnRlcnMgPSBbXS5jb25jYXQobGludGVyKVxuICAgIGZvciAoY29uc3QgZW50cnkgb2YgbGludGVycykge1xuICAgICAgaW5zdGFuY2UuYWRkTGludGVyKGVudHJ5KVxuICAgIH1cbiAgICByZXR1cm4gbmV3IERpc3Bvc2FibGUoKCkgPT4ge1xuICAgICAgZm9yIChjb25zdCBlbnRyeSBvZiBsaW50ZXJzKSB7XG4gICAgICAgIGluc3RhbmNlLmRlbGV0ZUxpbnRlcihlbnRyeSlcbiAgICAgIH1cbiAgICB9KVxuICB9LFxuICBjb25zdW1lTGludGVyTGVnYWN5KGxpbnRlcjogTGludGVyUHJvdmlkZXIpOiBEaXNwb3NhYmxlIHtcbiAgICBjb25zdCBsaW50ZXJzID0gW10uY29uY2F0KGxpbnRlcilcbiAgICBmb3IgKGNvbnN0IGVudHJ5IG9mIGxpbnRlcnMpIHtcbiAgICAgIGxpbnRlci5uYW1lID0gbGludGVyLm5hbWUgfHwgJ1Vua25vd24nXG4gICAgICBsaW50ZXIubGludE9uRmx5ID0gQm9vbGVhbihsaW50ZXIubGludE9uRmx5KVxuICAgICAgaW5zdGFuY2UuYWRkTGludGVyKGVudHJ5LCB0cnVlKVxuICAgIH1cbiAgICByZXR1cm4gbmV3IERpc3Bvc2FibGUoKCkgPT4ge1xuICAgICAgZm9yIChjb25zdCBlbnRyeSBvZiBsaW50ZXJzKSB7XG4gICAgICAgIGluc3RhbmNlLmRlbGV0ZUxpbnRlcihlbnRyeSlcbiAgICAgIH1cbiAgICB9KVxuICB9LFxuICBjb25zdW1lVUkodWk6IFVJKTogRGlzcG9zYWJsZSB7XG4gICAgY29uc3QgdWlzID0gW10uY29uY2F0KHVpKVxuICAgIGZvciAoY29uc3QgZW50cnkgb2YgdWlzKSB7XG4gICAgICBpbnN0YW5jZS5hZGRVSShlbnRyeSlcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBEaXNwb3NhYmxlKCgpID0+IHtcbiAgICAgIGZvciAoY29uc3QgZW50cnkgb2YgdWlzKSB7XG4gICAgICAgIGluc3RhbmNlLmRlbGV0ZVVJKGVudHJ5KVxuICAgICAgfVxuICAgIH0pXG4gIH0sXG4gIHByb3ZpZGVJbmRpZSgpOiBPYmplY3Qge1xuICAgIHJldHVybiBpbmRpZSA9PlxuICAgICAgaW5zdGFuY2UucmVnaXN0cnlJbmRpZS5yZWdpc3RlcihpbmRpZSwgMilcbiAgfSxcbiAgcHJvdmlkZUluZGllTGVnYWN5KCk6IE9iamVjdCB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHJlZ2lzdGVyOiBpbmRpZSA9PiBpbnN0YW5jZS5yZWdpc3RyeUluZGllLnJlZ2lzdGVyKGluZGllLCAxKSxcbiAgICB9XG4gIH0sXG4gIGRlYWN0aXZhdGUoKSB7XG4gICAgaW5zdGFuY2UuZGlzcG9zZSgpXG4gICAgZ3JlZXRlci5kaXNwb3NlKClcbiAgfSxcbn1cbiJdfQ==