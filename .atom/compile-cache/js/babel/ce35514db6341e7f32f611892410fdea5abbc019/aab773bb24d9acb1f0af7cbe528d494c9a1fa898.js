Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

// eslint-disable-next-line import/extensions

var _atom = require('atom');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _message = require('./message');

var _message2 = _interopRequireDefault(_message);

var _helpers = require('./helpers');

var _helpers2 = _interopRequireDefault(_helpers);

exports['default'] = {
  config: {
    executablePath: {
      type: 'string',
      'default': 'flow',
      description: 'Absolute path to the Flow executable on your system.'
    }
  },

  activate: function activate() {
    var _this = this;

    require('atom-package-deps').install('linter-flow');

    this.lastConfigError = {};
    this.flowInstances = new Set();

    this.subscriptions = new _atom.CompositeDisposable();
    this.subscriptions.add(atom.config.observe('linter-flow.executablePath', function (pathToFlow) {
      _this.pathToFlow = pathToFlow;
    }));
  },

  deactivate: function deactivate() {
    var _this2 = this;

    var helpers = require('atom-linter');

    if (atom.inDevMode()) {
      console.log('linter-flow:: Stopping flow...');
    }
    this.flowInstances.forEach(function (cwd) {
      return helpers.exec(_this2.pathToFlow, ['stop'], { cwd: cwd })['catch'](function () {
        return null;
      });
    });
    this.subscriptions.dispose();
  },

  provideLinter: function provideLinter() {
    var _this3 = this;

    var helpers = require('atom-linter');

    return {
      grammarScopes: ['source.js', 'source.js.jsx', 'source.babel', 'source.js-semantic', 'source.es6'],
      scope: 'project',
      name: 'Flow',
      lintOnFly: true,
      lint: function lint(TextEditor) {
        var filePath = TextEditor.getPath();
        var fileText = TextEditor.getText();

        // Is flow enabled for current file?
        if (!fileText || fileText.indexOf('@flow') === -1) {
          return Promise.resolve([]);
        }

        // Check if .flowconfig file is present
        var flowConfig = helpers.find(filePath, '.flowconfig');
        if (!flowConfig) {
          // Only warn every 5 min
          if (!_this3.lastConfigError[filePath] || _this3.lastConfigError[filePath] + 5 * 60 * 1000 < Date.now()) {
            atom.notifications.addWarning('[Linter-Flow] Missing .flowconfig file.', {
              detail: 'To get started with Flow, run `flow init`.',
              dismissable: true
            });
            _this3.lastConfigError[filePath] = Date.now();
          }
          return Promise.resolve([]);
        } else if (Object.hasOwnProperty.call(_this3.lastConfigError, filePath)) {
          delete _this3.lastConfigError[filePath];
        }

        var args = undefined;
        var options = undefined;

        var cwd = _path2['default'].dirname(flowConfig);
        _this3.flowInstances.add(cwd);
        // Use `check-contents` for unsaved files, and `status` for saved files.
        if (TextEditor.isModified()) {
          args = ['check-contents', '--json', '--root', cwd, filePath];
          options = { cwd: cwd, stdin: fileText, ignoreExitCode: true };
        } else {
          args = ['status', '--json', filePath];
          options = { cwd: cwd, ignoreExitCode: true };
        }

        return (0, _helpers2['default'])(_this3.pathToFlow, args, options).then(JSON.parse).then(_message2['default']);
      }
    };
  }
};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci1mbG93L2xpYi9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7OztvQkFHb0MsTUFBTTs7b0JBQ3pCLE1BQU07Ozs7dUJBRUEsV0FBVzs7Ozt1QkFFaEIsV0FBVzs7OztxQkFFZDtBQUNiLFFBQU0sRUFBRTtBQUNOLGtCQUFjLEVBQUU7QUFDZCxVQUFJLEVBQUUsUUFBUTtBQUNkLGlCQUFTLE1BQU07QUFDZixpQkFBVyxFQUFFLHNEQUFzRDtLQUNwRTtHQUNGOztBQUVELFVBQVEsRUFBQSxvQkFBUzs7O0FBQ2YsV0FBTyxDQUFDLG1CQUFtQixDQUFDLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDOztBQUVwRCxRQUFJLENBQUMsZUFBZSxHQUFHLEVBQUUsQ0FBQztBQUMxQixRQUFJLENBQUMsYUFBYSxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7O0FBRS9CLFFBQUksQ0FBQyxhQUFhLEdBQUcsK0JBQXlCLENBQUM7QUFDL0MsUUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsNEJBQTRCLEVBQUUsVUFBQyxVQUFVLEVBQUs7QUFDdkYsWUFBSyxVQUFVLEdBQUcsVUFBVSxDQUFDO0tBQzlCLENBQUMsQ0FBQyxDQUFDO0dBQ0w7O0FBRUQsWUFBVSxFQUFBLHNCQUFTOzs7QUFDakIsUUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDOztBQUV2QyxRQUFJLElBQUksQ0FBQyxTQUFTLEVBQUUsRUFBRTtBQUNwQixhQUFPLENBQUMsR0FBRyxDQUFDLGdDQUFnQyxDQUFDLENBQUM7S0FDL0M7QUFDRCxRQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxVQUFBLEdBQUc7YUFDNUIsT0FBTyxDQUNKLElBQUksQ0FBQyxPQUFLLFVBQVUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxFQUFF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ZmlsZSI6Ii9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci1mbG93L2xpYi9pbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIEBmbG93ICovXG5cbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBpbXBvcnQvZXh0ZW5zaW9uc1xuaW1wb3J0IHsgQ29tcG9zaXRlRGlzcG9zYWJsZSB9IGZyb20gJ2F0b20nO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5cbmltcG9ydCBoYW5kbGVEYXRhIGZyb20gJy4vbWVzc2FnZSc7XG5pbXBvcnQgdHlwZSB7IExpbnRlciB9IGZyb20gJy4vdHlwZXMnO1xuaW1wb3J0IGNoZWNrIGZyb20gJy4vaGVscGVycyc7XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgY29uZmlnOiB7XG4gICAgZXhlY3V0YWJsZVBhdGg6IHtcbiAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgZGVmYXVsdDogJ2Zsb3cnLFxuICAgICAgZGVzY3JpcHRpb246ICdBYnNvbHV0ZSBwYXRoIHRvIHRoZSBGbG93IGV4ZWN1dGFibGUgb24geW91ciBzeXN0ZW0uJyxcbiAgICB9LFxuICB9LFxuXG4gIGFjdGl2YXRlKCk6IHZvaWQge1xuICAgIHJlcXVpcmUoJ2F0b20tcGFja2FnZS1kZXBzJykuaW5zdGFsbCgnbGludGVyLWZsb3cnKTtcblxuICAgIHRoaXMubGFzdENvbmZpZ0Vycm9yID0ge307XG4gICAgdGhpcy5mbG93SW5zdGFuY2VzID0gbmV3IFNldCgpO1xuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29uZmlnLm9ic2VydmUoJ2xpbnRlci1mbG93LmV4ZWN1dGFibGVQYXRoJywgKHBhdGhUb0Zsb3cpID0+IHtcbiAgICAgIHRoaXMucGF0aFRvRmxvdyA9IHBhdGhUb0Zsb3c7XG4gICAgfSkpO1xuICB9LFxuXG4gIGRlYWN0aXZhdGUoKTogdm9pZCB7XG4gICAgY29uc3QgaGVscGVycyA9IHJlcXVpcmUoJ2F0b20tbGludGVyJyk7XG5cbiAgICBpZiAoYXRvbS5pbkRldk1vZGUoKSkge1xuICAgICAgY29uc29sZS5sb2coJ2xpbnRlci1mbG93OjogU3RvcHBpbmcgZmxvdy4uLicpO1xuICAgIH1cbiAgICB0aGlzLmZsb3dJbnN0YW5jZXMuZm9yRWFjaChjd2QgPT5cbiAgICAgIGhlbHBlcnNcbiAgICAgICAgLmV4ZWModGhpcy5wYXRoVG9GbG93LCBbJ3N0b3AnXSwgeyBjd2QgfSlcbiAgICAgICAgLmNhdGNoKCgpID0+IG51bGwpLFxuICAgICk7XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgfSxcblxuICBwcm92aWRlTGludGVyKCk6IExpbnRlciB7XG4gICAgY29uc3QgaGVscGVycyA9IHJlcXVpcmUoJ2F0b20tbGludGVyJyk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgZ3JhbW1hclNjb3BlczogW1xuICAgICAgICAnc291cmNlLmpzJyxcbiAgICAgICAgJ3NvdXJjZS5qcy5qc3gnLFxuICAgICAgICAnc291cmNlLmJhYmVsJyxcbiAgICAgICAgJ3NvdXJjZS5qcy1zZW1hbnRpYycsXG4gICAgICAgICdzb3VyY2UuZXM2JyxcbiAgICAgIF0sXG4gICAgICBzY29wZTogJ3Byb2plY3QnLFxuICAgICAgbmFtZTogJ0Zsb3cnLFxuICAgICAgbGludE9uRmx5OiB0cnVlLFxuICAgICAgbGludDogKFRleHRFZGl0b3IpID0+IHtcbiAgICAgICAgY29uc3QgZmlsZVBhdGggPSBUZXh0RWRpdG9yLmdldFBhdGgoKTtcbiAgICAgICAgY29uc3QgZmlsZVRleHQgPSBUZXh0RWRpdG9yLmdldFRleHQoKTtcblxuICAgICAgICAvLyBJcyBmbG93IGVuYWJsZWQgZm9yIGN1cnJlbnQgZmlsZT9cbiAgICAgICAgaWYgKCFmaWxlVGV4dCB8fCBmaWxlVGV4dC5pbmRleE9mKCdAZmxvdycpID09PSAtMSkge1xuICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoW10pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ2hlY2sgaWYgLmZsb3djb25maWcgZmlsZSBpcyBwcmVzZW50XG4gICAgICAgIGNvbnN0IGZsb3dDb25maWcgPSBoZWxwZXJzLmZpbmQoZmlsZVBhdGgsICcuZmxvd2NvbmZpZycpO1xuICAgICAgICBpZiAoIWZsb3dDb25maWcpIHtcbiAgICAgICAgICAvLyBPbmx5IHdhcm4gZXZlcnkgNSBtaW5cbiAgICAgICAgICBpZiAoIXRoaXMubGFzdENvbmZpZ0Vycm9yW2ZpbGVQYXRoXSB8fFxuICAgICAgICAgICAgICB0aGlzLmxhc3RDb25maWdFcnJvcltmaWxlUGF0aF0gKyAoNSAqIDYwICogMTAwMCkgPCBEYXRlLm5vdygpKSB7XG4gICAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkV2FybmluZygnW0xpbnRlci1GbG93XSBNaXNzaW5nIC5mbG93Y29uZmlnIGZpbGUuJywge1xuICAgICAgICAgICAgICBkZXRhaWw6ICdUbyBnZXQgc3RhcnRlZCB3aXRoIEZsb3csIHJ1biBgZmxvdyBpbml0YC4nLFxuICAgICAgICAgICAgICBkaXNtaXNzYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5sYXN0Q29uZmlnRXJyb3JbZmlsZVBhdGhdID0gRGF0ZS5ub3coKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShbXSk7XG4gICAgICAgIH0gZWxzZSBpZiAoT2JqZWN0Lmhhc093blByb3BlcnR5LmNhbGwodGhpcy5sYXN0Q29uZmlnRXJyb3IsIGZpbGVQYXRoKSkge1xuICAgICAgICAgIGRlbGV0ZSB0aGlzLmxhc3RDb25maWdFcnJvcltmaWxlUGF0aF07XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgYXJncztcbiAgICAgICAgbGV0IG9wdGlvbnM7XG5cbiAgICAgICAgY29uc3QgY3dkID0gcGF0aC5kaXJuYW1lKGZsb3dDb25maWcpO1xuICAgICAgICB0aGlzLmZsb3dJbnN0YW5jZXMuYWRkKGN3ZCk7XG4gICAgICAgIC8vIFVzZSBgY2hlY2stY29udGVudHNgIGZvciB1bnNhdmVkIGZpbGVzLCBhbmQgYHN0YXR1c2AgZm9yIHNhdmVkIGZpbGVzLlxuICAgICAgICBpZiAoVGV4dEVkaXRvci5pc01vZGlmaWVkKCkpIHtcbiAgICAgICAgICBhcmdzID0gWydjaGVjay1jb250ZW50cycsICctLWpzb24nLCAnLS1yb290JywgY3dkLCBmaWxlUGF0aF07XG4gICAgICAgICAgb3B0aW9ucyA9IHsgY3dkLCBzdGRpbjogZmlsZVRleHQsIGlnbm9yZUV4aXRDb2RlOiB0cnVlIH07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgYXJncyA9IFsnc3RhdHVzJywgJy0tanNvbicsIGZpbGVQYXRoXTtcbiAgICAgICAgICBvcHRpb25zID0geyBjd2QsIGlnbm9yZUV4aXRDb2RlOiB0cnVlIH07XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gY2hlY2sodGhpcy5wYXRoVG9GbG93LCBhcmdzLCBvcHRpb25zKVxuICAgICAgICAgIC50aGVuKEpTT04ucGFyc2UpXG4gICAgICAgICAgLnRoZW4oaGFuZGxlRGF0YSk7XG4gICAgICB9LFxuICAgIH07XG4gIH0sXG59O1xuIl19