Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.spawnWorker = spawnWorker;
exports.showError = showError;
exports.ruleURI = ruleURI;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _child_process = require('child_process');

var _child_process2 = _interopRequireDefault(_child_process);

var _atom = require('atom');

var _processCommunication = require('process-communication');

var _path = require('path');

'use babel';

function spawnWorker() {
  var env = Object.create(process.env);

  delete env.NODE_PATH;
  delete env.NODE_ENV;
  delete env.OS;

  var child = _child_process2['default'].fork((0, _path.join)(__dirname, 'worker.js'), [], { env: env, silent: true });
  var worker = (0, _processCommunication.createFromProcess)(child);

  child.stdout.on('data', function (chunk) {
    console.log('[Linter-ESLint] STDOUT', chunk.toString());
  });
  child.stderr.on('data', function (chunk) {
    console.log('[Linter-ESLint] STDERR', chunk.toString());
  });

  return { worker: worker, subscription: new _atom.Disposable(function () {
      worker.kill();
    }) };
}

function showError(givenMessage) {
  var givenDetail = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

  var detail = undefined;
  var message = undefined;
  if (message instanceof Error) {
    detail = message.stack;
    message = message.message;
  } else {
    detail = givenDetail;
    message = givenMessage;
  }
  atom.notifications.addError('[Linter-ESLint] ' + message, {
    detail: detail,
    dismissable: true
  });
}

function ruleURI(ruleId) {
  return 'http://eslint.org/docs/rules/' + ruleId;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci1lc2xpbnQvc3JjL2hlbHBlcnMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OzZCQUV5QixlQUFlOzs7O29CQUNiLE1BQU07O29DQUNDLHVCQUF1Qjs7b0JBQ3BDLE1BQU07O0FBTDNCLFdBQVcsQ0FBQTs7QUFPSixTQUFTLFdBQVcsR0FBRztBQUM1QixNQUFNLEdBQUcsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQTs7QUFFdEMsU0FBTyxHQUFHLENBQUMsU0FBUyxDQUFBO0FBQ3BCLFNBQU8sR0FBRyxDQUFDLFFBQVEsQ0FBQTtBQUNuQixTQUFPLEdBQUcsQ0FBQyxFQUFFLENBQUE7O0FBRWIsTUFBTSxLQUFLLEdBQUcsMkJBQWEsSUFBSSxDQUFDLGdCQUFLLFNBQVMsRUFBRSxXQUFXLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUgsR0FBRyxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFBO0FBQ3hGLE1BQU0sTUFBTSxHQUFHLDZDQUFrQixLQUFLLENBQUMsQ0FBQTs7QUFFdkMsT0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLFVBQUMsS0FBSyxFQUFLO0FBQ2pDLFdBQU8sQ0FBQyxHQUFHLENBQUMsd0JBQXdCLEVBQUUsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUE7R0FDeEQsQ0FBQyxDQUFBO0FBQ0YsT0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLFVBQUMsS0FBSyxFQUFLO0FBQ2pDLFdBQU8sQ0FBQyxHQUFHLENBQUMsd0JBQXdCLEVBQUUsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUE7R0FDeEQsQ0FBQyxDQUFBOztBQUVGLFNBQU8sRUFBRSxNQUFNLEVBQU4sTUFBTSxFQUFFLFlBQVksRUFBRSxxQkFBZSxZQUFNO0FBQ2xELFlBQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQTtLQUNkLENBQUMsRUFBRSxDQUFBO0NBQ0w7O0FBRU0sU0FBUyxTQUFTLENBQUMsWUFBWSxFQUFzQjtNQUFwQixXQUFXLHlEQUFHLElBQUk7O0FBQ3hELE1BQUksTUFBTSxZQUFBLENBQUE7QUFDVixNQUFJLE9BQU8sWUFBQSxDQUFBO0FBQ1gsTUFBSSxPQUFPLFlBQVksS0FBSyxFQUFFO0FBQzVCLFVBQU0sR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFBO0FBQ3RCLFdBQU8sR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFBO0dBQzFCLE1BQU07QUFDTCxVQUFNLEdBQUcsV0FBVyxDQUFBO0FBQ3BCLFdBQU8sR0FBRyxZQUFZLENBQUE7R0FDdkI7QUFDRCxNQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsc0JBQW9CLE9BQU8sRUFBSTtBQUN4RCxVQUFNLEVBQU4sTUFBTTtBQUNOLGVBQVcsRUFBRSxJQUFJO0dBQ2xCLENBQUMsQ0FBQTtDQUNIOztBQUVNLFNBQVMsT0FBTyxDQUFDLE1BQU0sRUFBRTtBQUM5QiwyQ0FBdUMsTUFBTSxDQUFFO0NBQ2hEIiwiZmlsZSI6Ii9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci1lc2xpbnQvc3JjL2hlbHBlcnMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJ1xuXG5pbXBvcnQgQ2hpbGRQcm9jZXNzIGZyb20gJ2NoaWxkX3Byb2Nlc3MnXG5pbXBvcnQgeyBEaXNwb3NhYmxlIH0gZnJvbSAnYXRvbSdcbmltcG9ydCB7IGNyZWF0ZUZyb21Qcm9jZXNzIH0gZnJvbSAncHJvY2Vzcy1jb21tdW5pY2F0aW9uJ1xuaW1wb3J0IHsgam9pbiB9IGZyb20gJ3BhdGgnXG5cbmV4cG9ydCBmdW5jdGlvbiBzcGF3bldvcmtlcigpIHtcbiAgY29uc3QgZW52ID0gT2JqZWN0LmNyZWF0ZShwcm9jZXNzLmVudilcblxuICBkZWxldGUgZW52Lk5PREVfUEFUSFxuICBkZWxldGUgZW52Lk5PREVfRU5WXG4gIGRlbGV0ZSBlbnYuT1NcblxuICBjb25zdCBjaGlsZCA9IENoaWxkUHJvY2Vzcy5mb3JrKGpvaW4oX19kaXJuYW1lLCAnd29ya2VyLmpzJyksIFtdLCB7IGVudiwgc2lsZW50OiB0cnVlIH0pXG4gIGNvbnN0IHdvcmtlciA9IGNyZWF0ZUZyb21Qcm9jZXNzKGNoaWxkKVxuXG4gIGNoaWxkLnN0ZG91dC5vbignZGF0YScsIChjaHVuaykgPT4ge1xuICAgIGNvbnNvbGUubG9nKCdbTGludGVyLUVTTGludF0gU1RET1VUJywgY2h1bmsudG9TdHJpbmcoKSlcbiAgfSlcbiAgY2hpbGQuc3RkZXJyLm9uKCdkYXRhJywgKGNodW5rKSA9PiB7XG4gICAgY29uc29sZS5sb2coJ1tMaW50ZXItRVNMaW50XSBTVERFUlInLCBjaHVuay50b1N0cmluZygpKVxuICB9KVxuXG4gIHJldHVybiB7IHdvcmtlciwgc3Vic2NyaXB0aW9uOiBuZXcgRGlzcG9zYWJsZSgoKSA9PiB7XG4gICAgd29ya2VyLmtpbGwoKVxuICB9KSB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzaG93RXJyb3IoZ2l2ZW5NZXNzYWdlLCBnaXZlbkRldGFpbCA9IG51bGwpIHtcbiAgbGV0IGRldGFpbFxuICBsZXQgbWVzc2FnZVxuICBpZiAobWVzc2FnZSBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgZGV0YWlsID0gbWVzc2FnZS5zdGFja1xuICAgIG1lc3NhZ2UgPSBtZXNzYWdlLm1lc3NhZ2VcbiAgfSBlbHNlIHtcbiAgICBkZXRhaWwgPSBnaXZlbkRldGFpbFxuICAgIG1lc3NhZ2UgPSBnaXZlbk1lc3NhZ2VcbiAgfVxuICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoYFtMaW50ZXItRVNMaW50XSAke21lc3NhZ2V9YCwge1xuICAgIGRldGFpbCxcbiAgICBkaXNtaXNzYWJsZTogdHJ1ZVxuICB9KVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcnVsZVVSSShydWxlSWQpIHtcbiAgcmV0dXJuIGBodHRwOi8vZXNsaW50Lm9yZy9kb2NzL3J1bGVzLyR7cnVsZUlkfWBcbn1cbiJdfQ==
//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/linter-eslint/src/helpers.js
