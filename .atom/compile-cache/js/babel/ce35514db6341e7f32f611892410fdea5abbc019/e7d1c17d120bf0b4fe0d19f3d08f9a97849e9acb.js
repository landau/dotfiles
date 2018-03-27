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

var fixableRules = new Set();
var sendRules = false;

/**
 * Modifies the closed-over fixableRules variable when called _if_ there are
 * newly-loaded fixable rules or fixable rules are removed from the set of all
 * loaded rules, according to the eslint `linter` instance that is passed in.
 *
 * @param  {Object} linter eslint 'linter' instance
 * @return {void}
 */
function updateFixableRules(linter) {
  if (linter === undefined) {
    // ESLint < v4 doesn't support this property
    return;
  }

  // Build a set of fixable rules based on the rules loaded in the provided linter
  var currentRules = new Set();
  linter.getRules().forEach(function (props, rule) {
    if (Object.prototype.hasOwnProperty.call(props, 'meta') && Object.prototype.hasOwnProperty.call(props.meta, 'fixable')) {
      currentRules.add(rule);
    }
  });

  // Unless something has changed, we won't need to send updated set of fixableRules
  sendRules = false;

  // Check for new fixable rules added since the last time we sent fixableRules
  var newRules = new Set(currentRules);
  fixableRules.forEach(function (rule) {
    return newRules['delete'](rule);
  });
  if (newRules.size > 0) {
    sendRules = true;
  }

  // Check for fixable rules that were removed since the last time we sent fixableRules
  var removedRules = new Set(fixableRules);
  currentRules.forEach(function (rule) {
    return removedRules['delete'](rule);
  });
  if (removedRules.size > 0) {
    sendRules = true;
  }

  if (sendRules) {
    // Rebuild fixableRules
    fixableRules.clear();
    currentRules.forEach(function (rule) {
      return fixableRules.add(rule);
    });
  }
}

function lintJob(_ref) {
  var cliEngineOptions = _ref.cliEngineOptions;
  var contents = _ref.contents;
  var eslint = _ref.eslint;
  var filePath = _ref.filePath;

  var cliEngine = new eslint.CLIEngine(cliEngineOptions);
  var report = cliEngine.executeOnText(contents, filePath);
  // Use the internal (undocumented) `linter` instance attached to the cliEngine
  // to check the loaded rules (including plugin rules) and update our list of fixable rules.
  updateFixableRules(cliEngine.linter);
  return report;
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
      emit(emitKey, { messages: [] });
      return;
    }

    var relativeFilePath = Helpers.getRelativePath(fileDir, filePath, config, projectPath);

    var cliEngineOptions = Helpers.getCLIEngineOptions(type, config, rules, relativeFilePath, fileDir, configPath);

    var response = undefined;
    if (type === 'lint') {
      var report = lintJob({ cliEngineOptions: cliEngineOptions, contents: contents, eslint: eslint, filePath: filePath });
      response = {
        messages: report.results.length ? report.results[0].messages : []
      };
      if (sendRules) {
        response.fixableRules = Array.from(fixableRules.keys());
      }
    } else if (type === 'fix') {
      response = fixJob({ cliEngineOptions: cliEngineOptions, contents: contents, eslint: eslint, filePath: filePath });
    } else if (type === 'debug') {
      var modulesDir = _path2['default'].dirname((0, _atomLinter.findCached)(fileDir, 'node_modules/eslint') || '');
      response = Helpers.findESLintDirectory(modulesDir, config, projectPath);
    }
    emit(emitKey, response);
  });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1Ly5hdG9tL3BhY2thZ2VzL2xpbnRlci1lc2xpbnQvc3JjL3dvcmtlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7OztvQkFJaUIsTUFBTTs7OzswQkFDZSxhQUFhOzs2QkFDMUIsa0JBQWtCOztJQUEvQixPQUFPOztrQ0FDWSwwQkFBMEI7Ozs7QUFQekQsV0FBVyxDQUFBOztBQVNYLE9BQU8sQ0FBQyxLQUFLLEdBQUcsc0JBQXNCLENBQUE7O0FBRXRDLElBQU0sWUFBWSxHQUFHLElBQUksR0FBRyxFQUFFLENBQUE7QUFDOUIsSUFBSSxTQUFTLEdBQUcsS0FBSyxDQUFBOzs7Ozs7Ozs7O0FBVXJCLFNBQVMsa0JBQWtCLENBQUMsTUFBTSxFQUFFO0FBQ2xDLE1BQUksTUFBTSxLQUFLLFNBQVMsRUFBRTs7QUFFeEIsV0FBTTtHQUNQOzs7QUFHRCxNQUFNLFlBQVksR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFBO0FBQzlCLFFBQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxPQUFPLENBQUMsVUFBQyxLQUFLLEVBQUUsSUFBSSxFQUFLO0FBQ3pDLFFBQ0UsTUFBTSxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsSUFDbkQsTUFBTSxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLEVBQzNEO0FBQ0Esa0JBQVksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUE7S0FDdkI7R0FDRixDQUFDLENBQUE7OztBQUdGLFdBQVMsR0FBRyxLQUFLLENBQUE7OztBQUdqQixNQUFNLFFBQVEsR0FBRyxJQUFJLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQTtBQUN0QyxjQUFZLENBQUMsT0FBTyxDQUFDLFVBQUEsSUFBSTtXQUFJLFFBQVEsVUFBTyxDQUFDLElBQUksQ0FBQztHQUFBLENBQUMsQ0FBQTtBQUNuRCxNQUFJLFFB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QUFRLEdBQUcsTUFBTSxDQUFDLEVBQUUsZ0JBQWdCLEVBQWhCLGdCQUFnQixFQUFFLFFBQVEsRUFBUixRQUFRLEVBQUUsTUFBTSxFQUFOLE1BQU0sRUFBRSxRQUFRLEVBQVIsUUFBUSxFQUFFLENBQUMsQ0FBQTtLQUNwRSxNQUFNLElBQUksSUFBSSxLQUFLLE9BQU8sRUFBRTtBQUMzQixVQUFNLFVBQVUsR0FBRyxrQkFBSyxPQUFPLENBQUMsNEJBQVcsT0FBTyxFQUFFLHFCQUFxQixDQUFDLElBQUksRUFBRSxDQUFDLENBQUE7QUFDakYsY0FBUSxHQUFHLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxVQUFVLEVBQUUsTUFBTSxFQUFFLFdBQVcsQ0FBQyxDQUFBO0tBQ3hFO0FBQ0QsUUFBSSxDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FBQTtHQUN4QixDQUFDLENBQUE7Q0FDSCxDQUFBLENBQUEiLCJmaWxlIjoiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvbGludGVyLWVzbGludC9zcmMvd29ya2VyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCdcblxuLyogZ2xvYmFsIGVtaXQgKi9cblxuaW1wb3J0IFBhdGggZnJvbSAncGF0aCdcbmltcG9ydCB7IEZpbmRDYWNoZSwgZmluZENhY2hlZCB9IGZyb20gJ2F0b20tbGludGVyJ1xuaW1wb3J0ICogYXMgSGVscGVycyBmcm9tICcuL3dvcmtlci1oZWxwZXJzJ1xuaW1wb3J0IGlzQ29uZmlnQXRIb21lUm9vdCBmcm9tICcuL2lzLWNvbmZpZy1hdC1ob21lLXJvb3QnXG5cbnByb2Nlc3MudGl0bGUgPSAnbGludGVyLWVzbGludCBoZWxwZXInXG5cbmNvbnN0IGZpeGFibGVSdWxlcyA9IG5ldyBTZXQoKVxubGV0IHNlbmRSdWxlcyA9IGZhbHNlXG5cbi8qKlxuICogTW9kaWZpZXMgdGhlIGNsb3NlZC1vdmVyIGZpeGFibGVSdWxlcyB2YXJpYWJsZSB3aGVuIGNhbGxlZCBfaWZfIHRoZXJlIGFyZVxuICogbmV3bHktbG9hZGVkIGZpeGFibGUgcnVsZXMgb3IgZml4YWJsZSBydWxlcyBhcmUgcmVtb3ZlZCBmcm9tIHRoZSBzZXQgb2YgYWxsXG4gKiBsb2FkZWQgcnVsZXMsIGFjY29yZGluZyB0byB0aGUgZXNsaW50IGBsaW50ZXJgIGluc3RhbmNlIHRoYXQgaXMgcGFzc2VkIGluLlxuICpcbiAqIEBwYXJhbSAge09iamVjdH0gbGludGVyIGVzbGludCAnbGludGVyJyBpbnN0YW5jZVxuICogQHJldHVybiB7dm9pZH1cbiAqL1xuZnVuY3Rpb24gdXBkYXRlRml4YWJsZVJ1bGVzKGxpbnRlcikge1xuICBpZiAobGludGVyID09PSB1bmRlZmluZWQpIHtcbiAgICAvLyBFU0xpbnQgPCB2NCBkb2Vzbid0IHN1cHBvcnQgdGhpcyBwcm9wZXJ0eVxuICAgIHJldHVyblxuICB9XG5cbiAgLy8gQnVpbGQgYSBzZXQgb2YgZml4YWJsZSBydWxlcyBiYXNlZCBvbiB0aGUgcnVsZXMgbG9hZGVkIGluIHRoZSBwcm92aWRlZCBsaW50ZXJcbiAgY29uc3QgY3VycmVudFJ1bGVzID0gbmV3IFNldCgpXG4gIGxpbnRlci5nZXRSdWxlcygpLmZvckVhY2goKHByb3BzLCBydWxlKSA9PiB7XG4gICAgaWYgKFxuICAgICAgT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHByb3BzLCAnbWV0YScpICYmXG4gICAgICBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwocHJvcHMubWV0YSwgJ2ZpeGFibGUnKVxuICAgICkge1xuICAgICAgY3VycmVudFJ1bGVzLmFkZChydWxlKVxuICAgIH1cbiAgfSlcblxuICAvLyBVbmxlc3Mgc29tZXRoaW5nIGhhcyBjaGFuZ2VkLCB3ZSB3b24ndCBuZWVkIHRvIHNlbmQgdXBkYXRlZCBzZXQgb2YgZml4YWJsZVJ1bGVzXG4gIHNlbmRSdWxlcyA9IGZhbHNlXG5cbiAgLy8gQ2hlY2sgZm9yIG5ldyBmaXhhYmxlIHJ1bGVzIGFkZGVkIHNpbmNlIHRoZSBsYXN0IHRpbWUgd2Ugc2VudCBmaXhhYmxlUnVsZXNcbiAgY29uc3QgbmV3UnVsZXMgPSBuZXcgU2V0KGN1cnJlbnRSdWxlcylcbiAgZml4YWJsZVJ1bGVzLmZvckVhY2gocnVsZSA9PiBuZXdSdWxlcy5kZWxldGUocnVsZSkpXG4gIGlmIChuZXdSdWxlcy5zaXplID4gMCkge1xuICAgIHNlbmRSdWxlcyA9IHRydWVcbiAgfVxuXG4gIC8vIENoZWNrIGZvciBmaXhhYmxlIHJ1bGVzIHRoYXQgd2VyZSByZW1vdmVkIHNpbmNlIHRoZSBsYXN0IHRpbWUgd2Ugc2VudCBmaXhhYmxlUnVsZXNcbiAgY29uc3QgcmVtb3ZlZFJ1bGVzID0gbmV3IFNldChmaXhhYmxlUnVsZXMpXG4gIGN1cnJlbnRSdWxlcy5mb3JFYWNoKHJ1bGUgPT4gcmVtb3ZlZFJ1bGVzLmRlbGV0ZShydWxlKSlcbiAgaWYgKHJlbW92ZWRSdWxlcy5zaXplID4gMCkge1xuICAgIHNlbmRSdWxlcyA9IHRydWVcbiAgfVxuXG4gIGlmIChzZW5kUnVsZXMpIHtcbiAgICAvLyBSZWJ1aWxkIGZpeGFibGVSdWxlc1xuICAgIGZpeGFibGVSdWxlcy5jbGVhcigpXG4gICAgY3VycmVudFJ1bGVzLmZvckVhY2gocnVsZSA9PiBmaXhhYmxlUnVsZXMuYWRkKHJ1bGUpKVxuICB9XG59XG5cbmZ1bmN0aW9uIGxpbnRKb2IoeyBjbGlFbmdpbmVPcHRpb25zLCBjb250ZW50cywgZXNsaW50LCBmaWxlUGF0aCB9KSB7XG4gIGNvbnN0IGNsaUVuZ2luZSA9IG5ldyBlc2xpbnQuQ0xJRW5naW5lKGNsaUVuZ2luZU9wdGlvbnMpXG4gIGNvbnN0IHJlcG9ydCA9IGNsaUVuZ2luZS5leGVjdXRlT25UZXh0KGNvbnRlbnRzLCBmaWxlUGF0aClcbiAgLy8gVXNlIHRoZSBpbnRlcm5hbCAodW5kb2N1bWVudGVkKSBgbGludGVyYCBpbnN0YW5jZSBhdHRhY2hlZCB0byB0aGUgY2xpRW5naW5lXG4gIC8vIHRvIGNoZWNrIHRoZSBsb2FkZWQgcnVsZXMgKGluY2x1ZGluZyBwbHVnaW4gcnVsZXMpIGFuZCB1cGRhdGUgb3VyIGxpc3Qgb2YgZml4YWJsZSBydWxlcy5cbiAgdXBkYXRlRml4YWJsZVJ1bGVzKGNsaUVuZ2luZS5saW50ZXIpXG4gIHJldHVybiByZXBvcnRcbn1cblxuZnVuY3Rpb24gZml4Sm9iKHsgY2xpRW5naW5lT3B0aW9ucywgY29udGVudHMsIGVzbGludCwgZmlsZVBhdGggfSkge1xuICBjb25zdCByZXBvcnQgPSBsaW50Sm9iKHsgY2xpRW5naW5lT3B0aW9ucywgY29udGVudHMsIGVzbGludCwgZmlsZVBhdGggfSlcblxuICBlc2xpbnQuQ0xJRW5naW5lLm91dHB1dEZpeGVzKHJlcG9ydClcblxuICBpZiAoIXJlcG9ydC5yZXN1bHRzLmxlbmd0aCB8fCAhcmVwb3J0LnJlc3VsdHNbMF0ubWVzc2FnZXMubGVuZ3RoKSB7XG4gICAgcmV0dXJuICdMaW50ZXItRVNMaW50OiBGaXggY29tcGxldGUuJ1xuICB9XG4gIHJldHVybiAnTGludGVyLUVTTGludDogRml4IGF0dGVtcHQgY29tcGxldGUsIGJ1dCBsaW50aW5nIGVycm9ycyByZW1haW4uJ1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGFzeW5jICgpID0+IHtcbiAgcHJvY2Vzcy5vbignbWVzc2FnZScsIChqb2JDb25maWcpID0+IHtcbiAgICBjb25zdCB7XG4gICAgICBjb250ZW50cywgdHlwZSwgY29uZmlnLCBmaWxlUGF0aCwgcHJvamVjdFBhdGgsIHJ1bGVzLCBlbWl0S2V5XG4gICAgfSA9IGpvYkNvbmZpZ1xuICAgIGlmIChjb25maWcuZGlzYWJsZUZTQ2FjaGUpIHtcbiAgICAgIEZpbmRDYWNoZS5jbGVhcigpXG4gICAgfVxuXG4gICAgY29uc3QgZmlsZURpciA9IFBhdGguZGlybmFtZShmaWxlUGF0aClcbiAgICBjb25zdCBlc2xpbnQgPSBIZWxwZXJzLmdldEVTTGludEluc3RhbmNlKGZpbGVEaXIsIGNvbmZpZywgcHJvamVjdFBhdGgpXG4gICAgY29uc3QgY29uZmlnUGF0aCA9IEhlbHBlcnMuZ2V0Q29uZmlnUGF0aChmaWxlRGlyKVxuICAgIGNvbnN0IG5vUHJvamVjdENvbmZpZyA9IChjb25maWdQYXRoID09PSBudWxsIHx8IGlzQ29uZmlnQXRIb21lUm9vdChjb25maWdQYXRoKSlcbiAgICBpZiAobm9Qcm9qZWN0Q29uZmlnICYmIGNvbmZpZy5kaXNhYmxlV2hlbk5vRXNsaW50Q29uZmlnKSB7XG4gICAgICBlbWl0KGVtaXRLZXksIHsgbWVzc2FnZXM6IFtdIH0pXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBjb25zdCByZWxhdGl2ZUZpbGVQYXRoID0gSGVscGVycy5nZXRSZWxhdGl2ZVBhdGgoZmlsZURpciwgZmlsZVBhdGgsIGNvbmZpZywgcHJvamVjdFBhdGgpXG5cbiAgICBjb25zdCBjbGlFbmdpbmVPcHRpb25zID0gSGVscGVyc1xuICAgICAgLmdldENMSUVuZ2luZU9wdGlvbnModHlwZSwgY29uZmlnLCBydWxlcywgcmVsYXRpdmVGaWxlUGF0aCwgZmlsZURpciwgY29uZmlnUGF0aClcblxuICAgIGxldCByZXNwb25zZVxuICAgIGlmICh0eXBlID09PSAnbGludCcpIHtcbiAgICAgIGNvbnN0IHJlcG9ydCA9IGxpbnRKb2IoeyBjbGlFbmdpbmVPcHRpb25zLCBjb250ZW50cywgZXNsaW50LCBmaWxlUGF0aCB9KVxuICAgICAgcmVzcG9uc2UgPSB7XG4gICAgICAgIG1lc3NhZ2VzOiByZXBvcnQucmVzdWx0cy5sZW5ndGggPyByZXBvcnQucmVzdWx0c1swXS5tZXNzYWdlcyA6IFtdXG4gICAgICB9XG4gICAgICBpZiAoc2VuZFJ1bGVzKSB7XG4gICAgICAgIHJlc3BvbnNlLmZpeGFibGVSdWxlcyA9IEFycmF5LmZyb20oZml4YWJsZVJ1bGVzLmtleXMoKSlcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICdmaXgnKSB7XG4gICAgICByZXNwb25zZSA9IGZpeEpvYih7IGNsaUVuZ2luZU9wdGlvbnMsIGNvbnRlbnRzLCBlc2xpbnQsIGZpbGVQYXRoIH0pXG4gICAgfSBlbHNlIGlmICh0eXBlID09PSAnZGVidWcnKSB7XG4gICAgICBjb25zdCBtb2R1bGVzRGlyID0gUGF0aC5kaXJuYW1lKGZpbmRDYWNoZWQoZmlsZURpciwgJ25vZGVfbW9kdWxlcy9lc2xpbnQnKSB8fCAnJylcbiAgICAgIHJlc3BvbnNlID0gSGVscGVycy5maW5kRVNMaW50RGlyZWN0b3J5KG1vZHVsZXNEaXIsIGNvbmZpZywgcHJvamVjdFBhdGgpXG4gICAgfVxuICAgIGVtaXQoZW1pdEtleSwgcmVzcG9uc2UpXG4gIH0pXG59XG4iXX0=