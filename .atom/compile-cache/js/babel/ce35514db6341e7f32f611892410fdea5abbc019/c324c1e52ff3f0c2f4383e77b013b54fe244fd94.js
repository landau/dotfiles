Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _child_process = require('child_process');

'use babel';

var fs = require('fs');

var IOUtil = (function () {
  function IOUtil() {
    _classCallCheck(this, IOUtil);
  }

  _createClass(IOUtil, [{
    key: 'readDir',
    value: function readDir(path) {
      return new Promise(function (resolve) {
        fs.readdir(path, function (err, names) {
          if (err) {
            // TODO reject promise on error and notify user about error afterwards
            atom.notifications.addError('autocomplete-java:\n' + err, { dismissable: true });
            resolve([]);
          } else {
            resolve(names);
          }
        });
      });
    }
  }, {
    key: 'readFile',
    value: function readFile(path, noErrorMessage) {
      return new Promise(function (resolve) {
        fs.readFile(path, 'utf8', function (err, data) {
          if (err) {
            // TODO reject promise on error and notify user about error afterwards
            if (!noErrorMessage) {
              atom.notifications.addError('autocomplete-java:\n' + err, { dismissable: true });
            }
            resolve('');
          } else {
            resolve(data);
          }
        });
      });
    }

    // TODO avoid large maxBuffer by using spawn instead
  }, {
    key: 'exec',
    value: function exec(command, ignoreError, noErrorMessage) {
      return new Promise(function (resolve) {
        (0, _child_process.exec)(command, { maxBuffer: 2000 * 1024 }, function (err, stdout) {
          if (err && !ignoreError) {
            // TODO reject promise on error and notify user about error afterwards
            if (!noErrorMessage) {
              atom.notifications.addError('autocomplete-java:\n' + err, { dismissable: true });
            } else {
              console.warn('autocomplete-java: ' + err + '\n' + command);
            }
            resolve('');
          } else {
            resolve(stdout);
          }
        });
      });
    }
  }]);

  return IOUtil;
})();

exports['default'] = new IOUtil();
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2F1dG9jb21wbGV0ZS1qYXZhL2xpYi9pb1V0aWwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7NkJBRXFCLGVBQWU7O0FBRnBDLFdBQVcsQ0FBQzs7QUFHWixJQUFNLEVBQUUsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7O0lBRW5CLE1BQU07V0FBTixNQUFNOzBCQUFOLE1BQU07OztlQUFOLE1BQU07O1dBRUgsaUJBQUMsSUFBSSxFQUFFO0FBQ1osYUFBTyxJQUFJLE9BQU8sQ0FBQyxVQUFDLE9BQU8sRUFBSztBQUM5QixVQUFFLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxVQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUs7QUFDL0IsY0FBSSxHQUFHLEVBQUU7O0FBRVAsZ0JBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLHNCQUFzQixHQUFHLEdBQUcsRUFDdEQsRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztBQUN6QixtQkFBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1dBQ2IsTUFBTTtBQUNMLG1CQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7V0FDaEI7U0FDRixDQUFDLENBQUM7T0FDSixDQUFDLENBQUM7S0FDSjs7O1dBRU8sa0JBQUMsSUFBSSxFQUFFLGNBQWMsRUFBRTtBQUM3QixhQUFPLElBQUksT0FBTyxDQUFDLFVBQUMsT0FBTyxFQUFLO0FBQzlCLFVBQUUsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxVQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUs7QUFDdkMsY0FBSSxHQUFHLEVBQUU7O0FBRVAsZ0JBQUksQ0FBQyxjQUFjLEVBQUU7QUFDbkIsa0JBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLHNCQUFzQixHQUFHLEdBQUcsRUFDdEQsRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQzthQUMxQjtBQUNELG1CQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7V0FDYixNQUFNO0FBQ0wsbUJBQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztXQUNmO1NBQ0YsQ0FBQyxDQUFDO09BQ0osQ0FBQyxDQUFDO0tBQ0o7Ozs7O1dBR0csY0FBQyxPQUFPLEVBQUUsV0FBVyxFQUFFLGNBQWMsRUFBRTtBQUN6QyxhQUFPLElBQUksT0FBTyxDQUFDLFVBQUMsT0FBTyxFQUFLO0FBQzlCLGlDQUFLLE9BQU8sRUFBRSxFQUFFLFNBQVMsRUFBRSxJQUFJLEdBQUcsSUFBSSxFQUFFLEVBQUUsVUFBQyxHQUFHLEVBQUUsTUFBTSxFQUFLO0FBQ3pELGNBQUksR0FBRyxJQUFJLENBQUMsV0FBVyxFQUFFOztBQUV2QixnQkFBSSxDQUFDLGNBQWMsRUFBRTtBQUNuQixrQkFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsc0JBQXNCLEdBQUcsR0FBRyxFQUN0RCxFQUFFLFdBQVcsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO2FBQzFCLE1BQU07QUFDTCxxQkFBTyxDQUFDLElBQUksQ0FBQyxxQkFBcUIsR0FBRyxHQUFHLEdBQUcsSUFBSSxHQUFHLE9BQU8sQ0FBQyxDQUFDO2FBQzVEO0FBQ0QsbUJBQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztXQUNiLE1BQU07QUFDTCxtQkFBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1dBQ2pCO1NBQ0YsQ0FBQyxDQUFDO09BQ0osQ0FBQyxDQUFDO0tBQ0o7OztTQXBERyxNQUFNOzs7cUJBd0RHLElBQUksTUFBTSxFQUFFIiwiZmlsZSI6Ii9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2F1dG9jb21wbGV0ZS1qYXZhL2xpYi9pb1V0aWwuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuaW1wb3J0IHsgZXhlYyB9IGZyb20gJ2NoaWxkX3Byb2Nlc3MnO1xuY29uc3QgZnMgPSByZXF1aXJlKCdmcycpO1xuXG5jbGFzcyBJT1V0aWwge1xuXG4gIHJlYWREaXIocGF0aCkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgZnMucmVhZGRpcihwYXRoLCAoZXJyLCBuYW1lcykgPT4ge1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgLy8gVE9ETyByZWplY3QgcHJvbWlzZSBvbiBlcnJvciBhbmQgbm90aWZ5IHVzZXIgYWJvdXQgZXJyb3IgYWZ0ZXJ3YXJkc1xuICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcignYXV0b2NvbXBsZXRlLWphdmE6XFxuJyArIGVycixcbiAgICAgICAgICAgIHsgZGlzbWlzc2FibGU6IHRydWUgfSk7XG4gICAgICAgICAgcmVzb2x2ZShbXSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmVzb2x2ZShuYW1lcyk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgcmVhZEZpbGUocGF0aCwgbm9FcnJvck1lc3NhZ2UpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgIGZzLnJlYWRGaWxlKHBhdGgsICd1dGY4JywgKGVyciwgZGF0YSkgPT4ge1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgLy8gVE9ETyByZWplY3QgcHJvbWlzZSBvbiBlcnJvciBhbmQgbm90aWZ5IHVzZXIgYWJvdXQgZXJyb3IgYWZ0ZXJ3YXJkc1xuICAgICAgICAgIGlmICghbm9FcnJvck1lc3NhZ2UpIHtcbiAgICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcignYXV0b2NvbXBsZXRlLWphdmE6XFxuJyArIGVycixcbiAgICAgICAgICAgICAgeyBkaXNtaXNzYWJsZTogdHJ1ZSB9KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmVzb2x2ZSgnJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmVzb2x2ZShkYXRhKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICAvLyBUT0RPIGF2b2lkIGxhcmdlIG1heEJ1ZmZlciBieSB1c2luZyBzcGF3biBpbnN0ZWFkXG4gIGV4ZWMoY29tbWFuZCwgaWdub3JlRXJyb3IsIG5vRXJyb3JNZXNzYWdlKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICBleGVjKGNvbW1hbmQsIHsgbWF4QnVmZmVyOiAyMDAwICogMTAyNCB9LCAoZXJyLCBzdGRvdXQpID0+IHtcbiAgICAgICAgaWYgKGVyciAmJiAhaWdub3JlRXJyb3IpIHtcbiAgICAgICAgICAvLyBUT0RPIHJlamVjdCBwcm9taXNlIG9uIGVycm9yIGFuZCBub3RpZnkgdXNlciBhYm91dCBlcnJvciBhZnRlcndhcmRzXG4gICAgICAgICAgaWYgKCFub0Vycm9yTWVzc2FnZSkge1xuICAgICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKCdhdXRvY29tcGxldGUtamF2YTpcXG4nICsgZXJyLFxuICAgICAgICAgICAgICB7IGRpc21pc3NhYmxlOiB0cnVlIH0pO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oJ2F1dG9jb21wbGV0ZS1qYXZhOiAnICsgZXJyICsgJ1xcbicgKyBjb21tYW5kKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmVzb2x2ZSgnJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmVzb2x2ZShzdGRvdXQpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG59XG5cbmV4cG9ydCBkZWZhdWx0IG5ldyBJT1V0aWwoKTtcbiJdfQ==