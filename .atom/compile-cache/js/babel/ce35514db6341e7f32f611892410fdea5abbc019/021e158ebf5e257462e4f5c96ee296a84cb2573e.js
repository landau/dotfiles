function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _workerHelpers = require('./worker-helpers');

var Helpers = _interopRequireWildcard(_workerHelpers);

var _processCommunication = require('process-communication');

var _atomLinter = require('atom-linter');

'use babel';
// Note: 'use babel' doesn't work in forked processes
process.title = 'linter-eslint helper';

var ignoredMessages = [
// V1
'File ignored because of your .eslintignore file. Use --no-ignore to override.',
// V2
'File ignored because of a matching ignore pattern. Use --no-ignore to override.',
// V2.11.1
'File ignored because of a matching ignore pattern. Use "--no-ignore" to override.'];

function lintJob(argv, contents, eslint, configPath, config) {
  if (configPath === null && config.disableWhenNoEslintConfig) {
    return [];
  }
  eslint.execute(argv, contents);
  return global.__LINTER_ESLINT_RESPONSE.filter(function (e) {
    return !ignoredMessages.includes(e.message);
  });
}
function fixJob(argv, eslint) {
  try {
    eslint.execute(argv);
    return 'Linter-ESLint: Fix Complete';
  } catch (err) {
    throw new Error('Linter-ESLint: Fix Attempt Completed, Linting Errors Remain');
  }
}

(0, _processCommunication.create)().onRequest('job', function (_ref, job) {
  var contents = _ref.contents;
  var type = _ref.type;
  var config = _ref.config;
  var filePath = _ref.filePath;

  global.__LINTER_ESLINT_RESPONSE = [];

  if (config.disableFSCache) {
    _atomLinter.FindCache.clear();
  }

  var fileDir = _path2['default'].dirname(filePath);
  var eslint = Helpers.getESLintInstance(fileDir, config);
  var configPath = Helpers.getConfigPath(fileDir);
  var relativeFilePath = Helpers.getRelativePath(fileDir, filePath, config);

  var argv = Helpers.getArgv(type, config, relativeFilePath, fileDir, configPath);

  if (type === 'lint') {
    job.response = lintJob(argv, contents, eslint, configPath, config);
  } else if (type === 'fix') {
    job.response = fixJob(argv, eslint);
  }
});

process.exit = function () {/* Stop eslint from closing the daemon */};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci1lc2xpbnQvc3JjL3dvcmtlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O29CQUlpQixNQUFNOzs7OzZCQUNFLGtCQUFrQjs7SUFBL0IsT0FBTzs7b0NBQ0ksdUJBQXVCOzswQkFDcEIsYUFBYTs7QUFQdkMsV0FBVyxDQUFBOztBQUVYLE9BQU8sQ0FBQyxLQUFLLEdBQUcsc0JBQXNCLENBQUE7O0FBT3RDLElBQU0sZUFBZSxHQUFHOztBQUV0QiwrRUFBK0U7O0FBRS9FLGlGQUFpRjs7QUFFakYsbUZBQW1GLENBQ3BGLENBQUE7O0FBRUQsU0FBUyxPQUFPLENBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRTtBQUMzRCxNQUFJLFVBQVUsS0FBSyxJQUFJLElBQUksTUFBTSxDQUFDLHlCQUF5QixFQUFFO0FBQzNELFdBQU8sRUFBRSxDQUFBO0dBQ1Y7QUFDRCxRQUFNLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQTtBQUM5QixTQUFPLE1BQU0sQ0FBQyx3QkFBd0IsQ0FDbkMsTUFBTSxDQUFDLFVBQUEsQ0FBQztXQUFJLENBQUMsZUFBZSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDO0dBQUEsQ0FBQyxDQUFBO0NBQ3JEO0FBQ0QsU0FBUyxNQUFNLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRTtBQUM1QixNQUFJO0FBQ0YsVUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQTtBQUNwQixXQUFPLDZCQUE2QixDQUFBO0dBQ3JDLENBQUMsT0FBTyxHQUFHLEVBQUU7QUFDWixVQUFNLElBQUksS0FBSyxDQUFDLDZEQUE2RCxDQUFDLENBQUE7R0FDL0U7Q0FDRjs7QUFFRCxtQ0FBUSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsVUFBQyxJQUFvQyxFQUFFLEdBQUcsRUFBSztNQUE1QyxRQUFRLEdBQVYsSUFBb0MsQ0FBbEMsUUFBUTtNQUFFLElBQUksR0FBaEIsSUFBb0MsQ0FBeEIsSUFBSTtNQUFFLE1BQU0sR0FBeEIsSUFBb0MsQ0FBbEIsTUFBTTtNQUFFLFFBQVEsR0FBbEMsSUFBb0MsQ0FBVixRQUFROztBQUMzRCxRQUFNLENBQUMsd0JBQXdCLEdBQUcsRUFBRSxDQUFBOztBQUVwQyxNQUFJLE1BQU0sQ0FBQyxjQUFjLEVBQUU7QUFDekIsMEJBQVUsS0FBSyxFQUFFLENBQUE7R0FDbEI7O0FBRUQsTUFBTSxPQUFPLEdBQUcsa0JBQUssT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFBO0FBQ3RDLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUE7QUFDekQsTUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQTtBQUNqRCxNQUFNLGdCQUFnQixHQUFHLE9BQU8sQ0FBQyxlQUFlLENBQUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQTs7QUFFM0UsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLGdCQUFnQixFQUFFLE9BQU8sRUFBRSxVQUFVLENBQUMsQ0FBQTs7QUFFakYsTUFBSSxJQUFJLEtBQUssTUFBTSxFQUFFO0FBQ25CLE9BQUcsQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRSxNQUFNLENBQUMsQ0FBQTtHQUNuRSxNQUFNLElBQUksSUFBSSxLQUFLLEtBQUssRUFBRTtBQUN6QixPQUFHLENBQUMsUUFBUSxHQUFHLE1BQU0sQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUE7R0FDcEM7Q0FDRixDQUFDLENBQUE7O0FBRUYsT0FBTyxDQUFDLElBQUksR0FBRyxZQUFZLDJDQUE2QyxDQUFBIiwiZmlsZSI6Ii9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci1lc2xpbnQvc3JjL3dvcmtlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnXG4vLyBOb3RlOiAndXNlIGJhYmVsJyBkb2Vzbid0IHdvcmsgaW4gZm9ya2VkIHByb2Nlc3Nlc1xucHJvY2Vzcy50aXRsZSA9ICdsaW50ZXItZXNsaW50IGhlbHBlcidcblxuaW1wb3J0IFBhdGggZnJvbSAncGF0aCdcbmltcG9ydCAqIGFzIEhlbHBlcnMgZnJvbSAnLi93b3JrZXItaGVscGVycydcbmltcG9ydCB7IGNyZWF0ZSB9IGZyb20gJ3Byb2Nlc3MtY29tbXVuaWNhdGlvbidcbmltcG9ydCB7IEZpbmRDYWNoZSB9IGZyb20gJ2F0b20tbGludGVyJ1xuXG5jb25zdCBpZ25vcmVkTWVzc2FnZXMgPSBbXG4gIC8vIFYxXG4gICdGaWxlIGlnbm9yZWQgYmVjYXVzZSBvZiB5b3VyIC5lc2xpbnRpZ25vcmUgZmlsZS4gVXNlIC0tbm8taWdub3JlIHRvIG92ZXJyaWRlLicsXG4gIC8vIFYyXG4gICdGaWxlIGlnbm9yZWQgYmVjYXVzZSBvZiBhIG1hdGNoaW5nIGlnbm9yZSBwYXR0ZXJuLiBVc2UgLS1uby1pZ25vcmUgdG8gb3ZlcnJpZGUuJyxcbiAgLy8gVjIuMTEuMVxuICAnRmlsZSBpZ25vcmVkIGJlY2F1c2Ugb2YgYSBtYXRjaGluZyBpZ25vcmUgcGF0dGVybi4gVXNlIFwiLS1uby1pZ25vcmVcIiB0byBvdmVycmlkZS4nLFxuXVxuXG5mdW5jdGlvbiBsaW50Sm9iKGFyZ3YsIGNvbnRlbnRzLCBlc2xpbnQsIGNvbmZpZ1BhdGgsIGNvbmZpZykge1xuICBpZiAoY29uZmlnUGF0aCA9PT0gbnVsbCAmJiBjb25maWcuZGlzYWJsZVdoZW5Ob0VzbGludENvbmZpZykge1xuICAgIHJldHVybiBbXVxuICB9XG4gIGVzbGludC5leGVjdXRlKGFyZ3YsIGNvbnRlbnRzKVxuICByZXR1cm4gZ2xvYmFsLl9fTElOVEVSX0VTTElOVF9SRVNQT05TRVxuICAgIC5maWx0ZXIoZSA9PiAhaWdub3JlZE1lc3NhZ2VzLmluY2x1ZGVzKGUubWVzc2FnZSkpXG59XG5mdW5jdGlvbiBmaXhKb2IoYXJndiwgZXNsaW50KSB7XG4gIHRyeSB7XG4gICAgZXNsaW50LmV4ZWN1dGUoYXJndilcbiAgICByZXR1cm4gJ0xpbnRlci1FU0xpbnQ6IEZpeCBDb21wbGV0ZSdcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdMaW50ZXItRVNMaW50OiBGaXggQXR0ZW1wdCBDb21wbGV0ZWQsIExpbnRpbmcgRXJyb3JzIFJlbWFpbicpXG4gIH1cbn1cblxuY3JlYXRlKCkub25SZXF1ZXN0KCdqb2InLCAoeyBjb250ZW50cywgdHlwZSwgY29uZmlnLCBmaWxlUGF0aCB9LCBqb2IpID0+IHtcbiAgZ2xvYmFsLl9fTElOVEVSX0VTTElOVF9SRVNQT05TRSA9IFtdXG5cbiAgaWYgKGNvbmZpZy5kaXNhYmxlRlNDYWNoZSkge1xuICAgIEZpbmRDYWNoZS5jbGVhcigpXG4gIH1cblxuICBjb25zdCBmaWxlRGlyID0gUGF0aC5kaXJuYW1lKGZpbGVQYXRoKVxuICBjb25zdCBlc2xpbnQgPSBIZWxwZXJzLmdldEVTTGludEluc3RhbmNlKGZpbGVEaXIsIGNvbmZpZylcbiAgY29uc3QgY29uZmlnUGF0aCA9IEhlbHBlcnMuZ2V0Q29uZmlnUGF0aChmaWxlRGlyKVxuICBjb25zdCByZWxhdGl2ZUZpbGVQYXRoID0gSGVscGVycy5nZXRSZWxhdGl2ZVBhdGgoZmlsZURpciwgZmlsZVBhdGgsIGNvbmZpZylcblxuICBjb25zdCBhcmd2ID0gSGVscGVycy5nZXRBcmd2KHR5cGUsIGNvbmZpZywgcmVsYXRpdmVGaWxlUGF0aCwgZmlsZURpciwgY29uZmlnUGF0aClcblxuICBpZiAodHlwZSA9PT0gJ2xpbnQnKSB7XG4gICAgam9iLnJlc3BvbnNlID0gbGludEpvYihhcmd2LCBjb250ZW50cywgZXNsaW50LCBjb25maWdQYXRoLCBjb25maWcpXG4gIH0gZWxzZSBpZiAodHlwZSA9PT0gJ2ZpeCcpIHtcbiAgICBqb2IucmVzcG9uc2UgPSBmaXhKb2IoYXJndiwgZXNsaW50KVxuICB9XG59KVxuXG5wcm9jZXNzLmV4aXQgPSBmdW5jdGlvbiAoKSB7IC8qIFN0b3AgZXNsaW50IGZyb20gY2xvc2luZyB0aGUgZGFlbW9uICovIH1cbiJdfQ==
//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/linter-eslint/src/worker.js
