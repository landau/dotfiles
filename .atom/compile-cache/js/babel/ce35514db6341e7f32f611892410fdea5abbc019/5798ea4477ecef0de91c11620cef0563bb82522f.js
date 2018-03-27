function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

/* global emit */

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _atomLinter = require('atom-linter');

var _workerHelpers = require('./worker-helpers');

var Helpers = _interopRequireWildcard(_workerHelpers);

var _isConfigAtHomeRoot = require('./is-config-at-home-root');

var _isConfigAtHomeRoot2 = _interopRequireDefault(_isConfigAtHomeRoot);

'use babel';

process.title = 'linter-eslint helper';

function lintJob(_ref) {
  var cliEngineOptions = _ref.cliEngineOptions;
  var contents = _ref.contents;
  var eslint = _ref.eslint;
  var filePath = _ref.filePath;

  var cliEngine = new eslint.CLIEngine(cliEngineOptions);
  return cliEngine.executeOnText(contents, filePath);
}

function fixJob(_ref2) {
  var cliEngineOptions = _ref2.cliEngineOptions;
  var contents = _ref2.contents;
  var eslint = _ref2.eslint;
  var filePath = _ref2.filePath;

  var report = lintJob({ cliEngineOptions: cliEngineOptions, contents: contents, eslint: eslint, filePath: filePath });

  eslint.CLIEngine.outputFixes(report);

  if (!report.results.length || !report.results[0].messages.length) {
    return 'Linter-ESLint: Fix complete.';
  }
  return 'Linter-ESLint: Fix attempt complete, but linting errors remain.';
}

module.exports = _asyncToGenerator(function* () {
  process.on('message', function (jobConfig) {
    var contents = jobConfig.contents;
    var type = jobConfig.type;
    var config = jobConfig.config;
    var filePath = jobConfig.filePath;
    var projectPath = jobConfig.projectPath;
    var rules = jobConfig.rules;
    var emitKey = jobConfig.emitKey;

    if (config.disableFSCache) {
      _atomLinter.FindCache.clear();
    }

    var fileDir = _path2['default'].dirname(filePath);
    var eslint = Helpers.getESLintInstance(fileDir, config, projectPath);
    var configPath = Helpers.getConfigPath(fileDir);
    var noProjectConfig = configPath === null || (0, _isConfigAtHomeRoot2['default'])(configPath);
    if (noProjectConfig && config.disableWhenNoEslintConfig) {
      emit(emitKey, []);
      return;
    }

    var relativeFilePath = Helpers.getRelativePath(fileDir, filePath, config);

    var cliEngineOptions = Helpers.getCLIEngineOptions(type, config, rules, relativeFilePath, fileDir, configPath);

    var response = undefined;
    if (type === 'lint') {
      var report = lintJob({ cliEngineOptions: cliEngineOptions, contents: contents, eslint: eslint, filePath: filePath });
      response = report.results.length ? report.results[0].messages : [];
    } else if (type === 'fix') {
      response = fixJob({ cliEngineOptions: cliEngineOptions, contents: contents, eslint: eslint, filePath: filePath });
    } else if (type === 'debug') {
      var modulesDir = _path2['default'].dirname((0, _atomLinter.findCached)(fileDir, 'node_modules/eslint') || '');
      response = Helpers.findESLintDirectory(modulesDir, config);
    }
    emit(emitKey, response);
  });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1Ly5hdG9tL3BhY2thZ2VzL2xpbnRlci1lc2xpbnQvc3JjL3dvcmtlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7OztvQkFJaUIsTUFBTTs7OzswQkFDZSxhQUFhOzs2QkFDMUIsa0JBQWtCOztJQUEvQixPQUFPOztrQ0FDWSwwQkFBMEI7Ozs7QUFQekQsV0FBVyxDQUFBOztBQVNYLE9BQU8sQ0FBQyxLQUFLLEdBQUcsc0JBQXNCLENBQUE7O0FBRXRDLFNBQVMsT0FBTyxDQUFDLElBQWdELEVBQUU7TUFBaEQsZ0JBQWdCLEdBQWxCLElBQWdELENBQTlDLGdCQUFnQjtNQUFFLFFBQVEsR0FBNUIsSUFBZ0QsQ0FBNUIsUUFBUTtNQUFFLE1BQU0sR0FBcEMsSUFBZ0QsQ0FBbEIsTUFBTTtNQUFFLFFBQVEsR0FBOUMsSUFBZ0QsQ0FBVixRQUFROztBQUM3RCxNQUFNLFNBQVMsR0FBRyxJQUFJLE1BQU0sQ0FBQyxTQUFTLENBQUMsZ0JBQWdCLENBQUMsQ0FBQTtBQUN4RCxTQUFPLFNBQVMsQ0FBQyxhQUFhLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFBO0NBQ25EOztBQUVELFNBQVMsTUFBTSxDQUFDLEtBQWdELEVBQUU7TUFBaEQsZ0JBQWdCLEdBQWxCLEtBQWdELENBQTlDLGdCQUFnQjtNQUFFLFFBQVEsR0FBNUIsS0FBZ0QsQ0FBNUIsUUFBUTtNQUFFLE1BQU0sR0FBcEMsS0FBZ0QsQ0FBbEIsTUFBTTtNQUFFLFFBQVEsR0FBOUMsS0FBZ0QsQ0FBVixRQUFROztBQUM1RCxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsRUFBRSxnQkFBZ0IsRUFBaEIsZ0JBQWdCLEVBQUUsUUFBUSxFQUFSLFFBQVEsRUFBRSxNQUFNLEVBQU4sTUFBTSxFQUFFLFFBQVEsRUFBUixRQUFRLEVBQUUsQ0FBQyxDQUFBOztBQUV4RSxRQUFNLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQTs7QUFFcEMsTUFBSSxD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bmRhdS8uYXRvbS9wYWNrYWdlcy9saW50ZXItZXNsaW50L3NyYy93b3JrZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJ1xuXG4vKiBnbG9iYWwgZW1pdCAqL1xuXG5pbXBvcnQgUGF0aCBmcm9tICdwYXRoJ1xuaW1wb3J0IHsgRmluZENhY2hlLCBmaW5kQ2FjaGVkIH0gZnJvbSAnYXRvbS1saW50ZXInXG5pbXBvcnQgKiBhcyBIZWxwZXJzIGZyb20gJy4vd29ya2VyLWhlbHBlcnMnXG5pbXBvcnQgaXNDb25maWdBdEhvbWVSb290IGZyb20gJy4vaXMtY29uZmlnLWF0LWhvbWUtcm9vdCdcblxucHJvY2Vzcy50aXRsZSA9ICdsaW50ZXItZXNsaW50IGhlbHBlcidcblxuZnVuY3Rpb24gbGludEpvYih7IGNsaUVuZ2luZU9wdGlvbnMsIGNvbnRlbnRzLCBlc2xpbnQsIGZpbGVQYXRoIH0pIHtcbiAgY29uc3QgY2xpRW5naW5lID0gbmV3IGVzbGludC5DTElFbmdpbmUoY2xpRW5naW5lT3B0aW9ucylcbiAgcmV0dXJuIGNsaUVuZ2luZS5leGVjdXRlT25UZXh0KGNvbnRlbnRzLCBmaWxlUGF0aClcbn1cblxuZnVuY3Rpb24gZml4Sm9iKHsgY2xpRW5naW5lT3B0aW9ucywgY29udGVudHMsIGVzbGludCwgZmlsZVBhdGggfSkge1xuICBjb25zdCByZXBvcnQgPSBsaW50Sm9iKHsgY2xpRW5naW5lT3B0aW9ucywgY29udGVudHMsIGVzbGludCwgZmlsZVBhdGggfSlcblxuICBlc2xpbnQuQ0xJRW5naW5lLm91dHB1dEZpeGVzKHJlcG9ydClcblxuICBpZiAoIXJlcG9ydC5yZXN1bHRzLmxlbmd0aCB8fCAhcmVwb3J0LnJlc3VsdHNbMF0ubWVzc2FnZXMubGVuZ3RoKSB7XG4gICAgcmV0dXJuICdMaW50ZXItRVNMaW50OiBGaXggY29tcGxldGUuJ1xuICB9XG4gIHJldHVybiAnTGludGVyLUVTTGludDogRml4IGF0dGVtcHQgY29tcGxldGUsIGJ1dCBsaW50aW5nIGVycm9ycyByZW1haW4uJ1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGFzeW5jIGZ1bmN0aW9uICgpIHtcbiAgcHJvY2Vzcy5vbignbWVzc2FnZScsIChqb2JDb25maWcpID0+IHtcbiAgICBjb25zdCB7IGNvbnRlbnRzLCB0eXBlLCBjb25maWcsIGZpbGVQYXRoLCBwcm9qZWN0UGF0aCwgcnVsZXMsIGVtaXRLZXkgfSA9IGpvYkNvbmZpZ1xuICAgIGlmIChjb25maWcuZGlzYWJsZUZTQ2FjaGUpIHtcbiAgICAgIEZpbmRDYWNoZS5jbGVhcigpXG4gICAgfVxuXG4gICAgY29uc3QgZmlsZURpciA9IFBhdGguZGlybmFtZShmaWxlUGF0aClcbiAgICBjb25zdCBlc2xpbnQgPSBIZWxwZXJzLmdldEVTTGludEluc3RhbmNlKGZpbGVEaXIsIGNvbmZpZywgcHJvamVjdFBhdGgpXG4gICAgY29uc3QgY29uZmlnUGF0aCA9IEhlbHBlcnMuZ2V0Q29uZmlnUGF0aChmaWxlRGlyKVxuICAgIGNvbnN0IG5vUHJvamVjdENvbmZpZyA9IChjb25maWdQYXRoID09PSBudWxsIHx8IGlzQ29uZmlnQXRIb21lUm9vdChjb25maWdQYXRoKSlcbiAgICBpZiAobm9Qcm9qZWN0Q29uZmlnICYmIGNvbmZpZy5kaXNhYmxlV2hlbk5vRXNsaW50Q29uZmlnKSB7XG4gICAgICBlbWl0KGVtaXRLZXksIFtdKVxuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgY29uc3QgcmVsYXRpdmVGaWxlUGF0aCA9IEhlbHBlcnMuZ2V0UmVsYXRpdmVQYXRoKGZpbGVEaXIsIGZpbGVQYXRoLCBjb25maWcpXG5cbiAgICBjb25zdCBjbGlFbmdpbmVPcHRpb25zID0gSGVscGVycy5nZXRDTElFbmdpbmVPcHRpb25zKFxuICAgICAgdHlwZSwgY29uZmlnLCBydWxlcywgcmVsYXRpdmVGaWxlUGF0aCwgZmlsZURpciwgY29uZmlnUGF0aFxuICAgIClcblxuICAgIGxldCByZXNwb25zZVxuICAgIGlmICh0eXBlID09PSAnbGludCcpIHtcbiAgICAgIGNvbnN0IHJlcG9ydCA9IGxpbnRKb2IoeyBjbGlFbmdpbmVPcHRpb25zLCBjb250ZW50cywgZXNsaW50LCBmaWxlUGF0aCB9KVxuICAgICAgcmVzcG9uc2UgPSByZXBvcnQucmVzdWx0cy5sZW5ndGggPyByZXBvcnQucmVzdWx0c1swXS5tZXNzYWdlcyA6IFtdXG4gICAgfSBlbHNlIGlmICh0eXBlID09PSAnZml4Jykge1xuICAgICAgcmVzcG9uc2UgPSBmaXhKb2IoeyBjbGlFbmdpbmVPcHRpb25zLCBjb250ZW50cywgZXNsaW50LCBmaWxlUGF0aCB9KVxuICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ2RlYnVnJykge1xuICAgICAgY29uc3QgbW9kdWxlc0RpciA9IFBhdGguZGlybmFtZShmaW5kQ2FjaGVkKGZpbGVEaXIsICdub2RlX21vZHVsZXMvZXNsaW50JykgfHwgJycpXG4gICAgICByZXNwb25zZSA9IEhlbHBlcnMuZmluZEVTTGludERpcmVjdG9yeShtb2R1bGVzRGlyLCBjb25maWcpXG4gICAgfVxuICAgIGVtaXQoZW1pdEtleSwgcmVzcG9uc2UpXG4gIH0pXG59XG4iXX0=