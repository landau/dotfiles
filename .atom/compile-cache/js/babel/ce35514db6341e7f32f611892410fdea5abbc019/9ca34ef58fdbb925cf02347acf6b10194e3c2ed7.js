Object.defineProperty(exports, '__esModule', {
  value: true
});

/**
 * Send a job to the worker and return the results
 * @param  {Task} worker The worker Task to use
 * @param  {Object} config Configuration for the job to send to the worker
 * @return {Object|String|Error}        The data returned from the worker
 */

var sendJob = _asyncToGenerator(function* (worker, config) {
  // Ensure the worker is started
  startWorker(worker);
  // Expand the config with a unique ID to emit on
  // NOTE: Jobs _must_ have a unique ID as they are completely async and results
  // can arrive back in any order.
  config.emitKey = (0, _cryptoRandomString2['default'])(10);

  return new Promise(function (resolve, reject) {
    var errSub = worker.on('task:error', function () {
      // Re-throw errors from the task
      var error = new Error(arguments[0]);
      // Set the stack to the one given to us by the worker
      error.stack = arguments[1];
      reject(error);
    });
    var responseSub = worker.on(config.emitKey, function (data) {
      errSub.dispose();
      responseSub.dispose();
      resolve(data);
    });
    // Send the job on to the worker
    try {
      worker.send(config);
    } catch (e) {
      console.error(e);
    }
  });
});

exports.sendJob = sendJob;
exports.showError = showError;

var getDebugInfo = _asyncToGenerator(function* (worker) {
  var textEditor = atom.workspace.getActiveTextEditor();
  var filePath = undefined;
  var editorScopes = undefined;
  if (atom.workspace.isTextEditor(textEditor)) {
    filePath = textEditor.getPath();
    editorScopes = textEditor.getLastCursor().getScopeDescriptor().getScopesArray();
  } else {
    // Somehow this can be called with no active TextEditor, impossible I know...
    filePath = 'unknown';
    editorScopes = ['unknown'];
  }
  var packagePath = atom.packages.resolvePackagePath('linter-eslint');
  var linterEslintMeta = undefined;
  if (packagePath === undefined) {
    // Apparently for some users the package path fails to resolve
    linterEslintMeta = { version: 'unknown!' };
  } else {
    // eslint-disable-next-line import/no-dynamic-require
    linterEslintMeta = require((0, _path.join)(packagePath, 'package.json'));
  }
  var config = atom.config.get('linter-eslint');
  var hoursSinceRestart = Math.round(process.uptime() / 3600 * 10) / 10;
  var returnVal = undefined;
  try {
    var response = yield sendJob(worker, {
      type: 'debug',
      config: config,
      filePath: filePath
    });
    returnVal = {
      atomVersion: atom.getVersion(),
      linterEslintVersion: linterEslintMeta.version,
      linterEslintConfig: config,
      // eslint-disable-next-line import/no-dynamic-require
      eslintVersion: require((0, _path.join)(response.path, 'package.json')).version,
      hoursSinceRestart: hoursSinceRestart,
      platform: process.platform,
      eslintType: response.type,
      eslintPath: response.path,
      editorScopes: editorScopes
    };
  } catch (error) {
    atom.notifications.addError('' + error);
  }
  return returnVal;
});

exports.getDebugInfo = getDebugInfo;

var generateDebugString = _asyncToGenerator(function* (worker) {
  var debug = yield getDebugInfo(worker);
  var details = ['Atom version: ' + debug.atomVersion, 'linter-eslint version: ' + debug.linterEslintVersion, 'ESLint version: ' + debug.eslintVersion, 'Hours since last Atom restart: ' + debug.hoursSinceRestart, 'Platform: ' + debug.platform, 'Using ' + debug.eslintType + ' ESLint from: ' + debug.eslintPath, 'Current file\'s scopes: ' + JSON.stringify(debug.editorScopes, null, 2), 'linter-eslint configuration: ' + JSON.stringify(debug.linterEslintConfig, null, 2)];
  return details.join('\n');
});

exports.generateDebugString = generateDebugString;

/**
 * Given a raw response from ESLint, this processes the messages into a format
 * compatible with the Linter API.
 * @param  {Object}     response   The raw response from ESLint
 * @param  {TextEditor} textEditor The Atom::TextEditor of the file the messages belong to
 * @param  {bool}       showRule   Whether to show the rule in the messages
 * @param  {Object}     worker     The current Worker Task to send Debug jobs to
 * @return {Promise}               The messages transformed into Linter messages
 */

var processESLintMessages = _asyncToGenerator(function* (response, textEditor, showRule, worker) {
  return Promise.all(response.map(_asyncToGenerator(function* (_ref) {
    var fatal = _ref.fatal;
    var originalMessage = _ref.message;
    var line = _ref.line;
    var severity = _ref.severity;
    var ruleId = _ref.ruleId;
    var column = _ref.column;
    var fix = _ref.fix;
    var endLine = _ref.endLine;
    var endColumn = _ref.endColumn;

    var message = fatal ? originalMessage.split('\n')[0] : originalMessage;
    var filePath = textEditor.getPath();
    var textBuffer = textEditor.getBuffer();
    var linterFix = null;
    if (fix) {
      var fixRange = new _atom.Range(textBuffer.positionForCharacterIndex(fix.range[0]), textBuffer.positionForCharacterIndex(fix.range[1]));
      linterFix = {
        position: fixRange,
        replaceWith: fix.text
      };
    }
    var msgCol = undefined;
    var msgEndLine = undefined;
    var msgEndCol = undefined;
    var eslintFullRange = false;

    /*
     Note: ESLint positions are 1-indexed, while Atom expects 0-indexed,
     positions. We are subtracting 1 from these values here so we don't have to
     keep doing so in later uses.
     */
    var msgLine = line - 1;
    if (typeof endColumn !== 'undefined' && typeof endLine !== 'undefined') {
      eslintFullRange = true;
      // Here we always want the column to be a number
      msgCol = Math.max(0, column - 1);
      msgEndLine = endLine - 1;
      msgEndCol = endColumn - 1;
    } else {
      // We want msgCol to remain undefined if it was initially so
      // `generateRange` will give us a range over the entire line
      msgCol = typeof column !== 'undefined' ? column - 1 : column;
    }

    var ret = undefined;
    var range = undefined;
    try {
      if (eslintFullRange) {
        validatePoint(textEditor, msgLine, msgCol);
        validatePoint(textEditor, msgEndLine, msgEndCol);
        range = [[msgLine, msgCol], [msgEndLine, msgEndCol]];
      } else {
        range = (0, _atomLinter.generateRange)(textEditor, msgLine, msgCol);
      }
      ret = {
        severity: severity === 1 ? 'warning' : 'error',
        location: {
          file: filePath,
          position: range
        }
      };

      if (ruleId) {
        ret.url = (0, _eslintRuleDocumentation2['default'])(ruleId).url;
      }

      var ruleAppendix = showRule ? ' (' + (ruleId || 'Fatal') + ')' : '';
      ret.excerpt = '' + message + ruleAppendix;

      if (linterFix) {
        ret.solutions = [linterFix];
      }
    } catch (err) {
      if (!err.message.startsWith('Line number ') && !err.message.startsWith('Column start ')) {
        // This isn't an invalid point error from `generateRange`, re-throw it
        throw err;
      }
      ret = yield generateInvalidTrace(msgLine, msgCol, msgEndLine, msgEndCol, eslintFullRange, filePath, textEditor, ruleId, message, worker);
    }

    return ret;
  })));
});

exports.processESLintMessages = processESLintMessages;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

var _path = require('path');

var _eslintRuleDocumentation = require('eslint-rule-documentation');

var _eslintRuleDocumentation2 = _interopRequireDefault(_eslintRuleDocumentation);

var _atomLinter = require('atom-linter');

var _cryptoRandomString = require('crypto-random-string');

var _cryptoRandomString2 = _interopRequireDefault(_cryptoRandomString);

// eslint-disable-next-line import/no-extraneous-dependencies, import/extensions

var _atom = require('atom');

/**
 * Start the worker process if it hasn't already been started
 * @param  {Task} worker The worker process reference to act on
 * @return {undefined}
 */
'use babel';

var startWorker = function startWorker(worker) {
  if (worker.started) {
    // Worker start request has already been sent
    return;
  }
  // Send empty arguments as we don't use them in the worker
  worker.start([]);
  // NOTE: Modifies the Task of the worker, but it's the only clean way to track this
  worker.started = true;
};
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

function validatePoint(textEditor, line, col) {
  var buffer = textEditor.getBuffer();
  // Clip the given point to a valid one, and check if it equals the original
  if (!buffer.clipPosition([line, col]).isEqual([line, col])) {
    throw new Error(line + ':' + col + ' isn\'t a valid point!');
  }
}

var generateInvalidTrace = _asyncToGenerator(function* (msgLine, msgCol, msgEndLine, msgEndCol, eslintFullRange, filePath, textEditor, ruleId, message, worker) {
  var errMsgRange = msgLine + 1 + ':' + msgCol;
  if (eslintFullRange) {
    errMsgRange += ' - ' + (msgEndLine + 1) + ':' + (msgEndCol + 1);
  }
  var rangeText = 'Requested ' + (eslintFullRange ? 'start point' : 'range') + ': ' + errMsgRange;
  var issueURL = 'https://github.com/AtomLinter/linter-eslint/issues/new';
  var titleText = 'Invalid position given by \'' + ruleId + '\'';
  var title = encodeURIComponent(titleText);
  var body = encodeURIComponent(['ESLint returned a point that did not exist in the document being edited.', 'Rule: `' + ruleId + '`', rangeText, '', '', '<!-- If at all possible, please include code to reproduce this issue! -->', '', '', 'Debug information:', '```json', JSON.stringify((yield getDebugInfo(worker)), null, 2), '```'].join('\n'));

  var location = {
    file: filePath,
    position: (0, _atomLinter.generateRange)(textEditor, 0)
  };
  var newIssueURL = issueURL + '?title=' + title + '&body=' + body;

  return {
    severity: 'error',
    excerpt: titleText + '. See the description for details. ' + 'Click the URL to open a new issue!',
    url: newIssueURL,
    location: location,
    description: rangeText + '\nOriginal message: ' + message
  };
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1Ly5hdG9tL3BhY2thZ2VzL2xpbnRlci1lc2xpbnQvc3JjL2hlbHBlcnMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7SUFnQ3NCLE9BQU8scUJBQXRCLFdBQXVCLE1BQU0sRUFBRSxNQUFNLEVBQUU7O0FBRTVDLGFBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQTs7OztBQUluQixRQUFNLENBQUMsT0FBTyxHQUFHLHFDQUFtQixFQUFFLENBQUMsQ0FBQTs7QUFFdkMsU0FBTyxJQUFJLE9BQU8sQ0FBQyxVQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUs7QUFDdEMsUUFBTSxNQUFNLEdBQUcsTUFBTSxDQUFDLEVBQUUsQ0FBQyxZQUFZLEVBQUUsWUFBWTs7QUFFakQsVUFBTSxLQUFLLEdBQUcsSUFBSSxLQUFLLENBQUMsVUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFBOztBQUUvQixXQUFLLENBQUMsS0FBSyxHQUFHLFVBQUksQ0FBQyxDQUFDLENBQUE7QUFDcEIsWUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFBO0tBQ2QsQ0FBQyxDQUFBO0FBQ0YsUUFBTSxXQUFXLEdBQUcsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLFVBQUMsSUFBSSxFQUFLO0FBQ3RELFlBQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQTtBQUNoQixpQkFBVyxDQUFDLE9BQU8sRUFBRSxDQUFBO0FBQ3JCLGFBQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQTtLQUNkLENBQUMsQ0FBQTs7QUFFRixRQUFJO0FBQ0YsWUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQTtLQUNwQixDQUFDLE9BQU8sQ0FBQyxFQUFFO0FBQ1YsYUFBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQTtLQUNqQjtHQUNGLENBQUMsQ0FBQTtDQUNIOzs7OztJQTBCcUIsWUFBWSxxQkFBM0IsV0FBNEIsTUFBTSxFQUFFO0FBQ3pDLE1BQU0sVUFBVSxHQUFHLElB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QUNSLGVBQVcsRUFBSyxTQUFTLDRCQUF1QixPQUFPLEFBQUU7R0FDMUQsQ0FBQTtDQUNGLENBQUEsQ0FBQSIsImZpbGUiOiIvVXNlcnMvdGxhbmRhdS8uYXRvbS9wYWNrYWdlcy9saW50ZXItZXNsaW50L3NyYy9oZWxwZXJzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCdcblxuaW1wb3J0IHsgam9pbiB9IGZyb20gJ3BhdGgnXG5pbXBvcnQgcnVsZVVSSSBmcm9tICdlc2xpbnQtcnVsZS1kb2N1bWVudGF0aW9uJ1xuaW1wb3J0IHsgZ2VuZXJhdGVSYW5nZSB9IGZyb20gJ2F0b20tbGludGVyJ1xuaW1wb3J0IGNyeXB0b1JhbmRvbVN0cmluZyBmcm9tICdjcnlwdG8tcmFuZG9tLXN0cmluZydcblxuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGltcG9ydC9uby1leHRyYW5lb3VzLWRlcGVuZGVuY2llcywgaW1wb3J0L2V4dGVuc2lvbnNcbmltcG9ydCB7IFJhbmdlIH0gZnJvbSAnYXRvbSdcblxuLyoqXG4gKiBTdGFydCB0aGUgd29ya2VyIHByb2Nlc3MgaWYgaXQgaGFzbid0IGFscmVhZHkgYmVlbiBzdGFydGVkXG4gKiBAcGFyYW0gIHtUYXNrfSB3b3JrZXIgVGhlIHdvcmtlciBwcm9jZXNzIHJlZmVyZW5jZSB0byBhY3Qgb25cbiAqIEByZXR1cm4ge3VuZGVmaW5lZH1cbiAqL1xuY29uc3Qgc3RhcnRXb3JrZXIgPSAod29ya2VyKSA9PiB7XG4gIGlmICh3b3JrZXIuc3RhcnRlZCkge1xuICAgIC8vIFdvcmtlciBzdGFydCByZXF1ZXN0IGhhcyBhbHJlYWR5IGJlZW4gc2VudFxuICAgIHJldHVyblxuICB9XG4gIC8vIFNlbmQgZW1wdHkgYXJndW1lbnRzIGFzIHdlIGRvbid0IHVzZSB0aGVtIGluIHRoZSB3b3JrZXJcbiAgd29ya2VyLnN0YXJ0KFtdKVxuICAvLyBOT1RFOiBNb2RpZmllcyB0aGUgVGFzayBvZiB0aGUgd29ya2VyLCBidXQgaXQncyB0aGUgb25seSBjbGVhbiB3YXkgdG8gdHJhY2sgdGhpc1xuICB3b3JrZXIuc3RhcnRlZCA9IHRydWVcbn1cblxuLyoqXG4gKiBTZW5kIGEgam9iIHRvIHRoZSB3b3JrZXIgYW5kIHJldHVybiB0aGUgcmVzdWx0c1xuICogQHBhcmFtICB7VGFza30gd29ya2VyIFRoZSB3b3JrZXIgVGFzayB0byB1c2VcbiAqIEBwYXJhbSAge09iamVjdH0gY29uZmlnIENvbmZpZ3VyYXRpb24gZm9yIHRoZSBqb2IgdG8gc2VuZCB0byB0aGUgd29ya2VyXG4gKiBAcmV0dXJuIHtPYmplY3R8U3RyaW5nfEVycm9yfSAgICAgICAgVGhlIGRhdGEgcmV0dXJuZWQgZnJvbSB0aGUgd29ya2VyXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzZW5kSm9iKHdvcmtlciwgY29uZmlnKSB7XG4gIC8vIEVuc3VyZSB0aGUgd29ya2VyIGlzIHN0YXJ0ZWRcbiAgc3RhcnRXb3JrZXIod29ya2VyKVxuICAvLyBFeHBhbmQgdGhlIGNvbmZpZyB3aXRoIGEgdW5pcXVlIElEIHRvIGVtaXQgb25cbiAgLy8gTk9URTogSm9icyBfbXVzdF8gaGF2ZSBhIHVuaXF1ZSBJRCBhcyB0aGV5IGFyZSBjb21wbGV0ZWx5IGFzeW5jIGFuZCByZXN1bHRzXG4gIC8vIGNhbiBhcnJpdmUgYmFjayBpbiBhbnkgb3JkZXIuXG4gIGNvbmZpZy5lbWl0S2V5ID0gY3J5cHRvUmFuZG9tU3RyaW5nKDEwKVxuXG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgY29uc3QgZXJyU3ViID0gd29ya2VyLm9uKCd0YXNrOmVycm9yJywgKC4uLmVycikgPT4ge1xuICAgICAgLy8gUmUtdGhyb3cgZXJyb3JzIGZyb20gdGhlIHRhc2tcbiAgICAgIGNvbnN0IGVycm9yID0gbmV3IEVycm9yKGVyclswXSlcbiAgICAgIC8vIFNldCB0aGUgc3RhY2sgdG8gdGhlIG9uZSBnaXZlbiB0byB1cyBieSB0aGUgd29ya2VyXG4gICAgICBlcnJvci5zdGFjayA9IGVyclsxXVxuICAgICAgcmVqZWN0KGVycm9yKVxuICAgIH0pXG4gICAgY29uc3QgcmVzcG9uc2VTdWIgPSB3b3JrZXIub24oY29uZmlnLmVtaXRLZXksIChkYXRhKSA9PiB7XG4gICAgICBlcnJTdWIuZGlzcG9zZSgpXG4gICAgICByZXNwb25zZVN1Yi5kaXNwb3NlKClcbiAgICAgIHJlc29sdmUoZGF0YSlcbiAgICB9KVxuICAgIC8vIFNlbmQgdGhlIGpvYiBvbiB0byB0aGUgd29ya2VyXG4gICAgdHJ5IHtcbiAgICAgIHdvcmtlci5zZW5kKGNvbmZpZylcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBjb25zb2xlLmVycm9yKGUpXG4gICAgfVxuICB9KVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc2hvd0Vycm9yKGdpdmVuTWVzc2FnZSwgZ2l2ZW5EZXRhaWwgPSBudWxsKSB7XG4gIGxldCBkZXRhaWxcbiAgbGV0IG1lc3NhZ2VcbiAgaWYgKG1lc3NhZ2UgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgIGRldGFpbCA9IG1lc3NhZ2Uuc3RhY2tcbiAgICBtZXNzYWdlID0gbWVzc2FnZS5tZXNzYWdlXG4gIH0gZWxzZSB7XG4gICAgZGV0YWlsID0gZ2l2ZW5EZXRhaWxcbiAgICBtZXNzYWdlID0gZ2l2ZW5NZXNzYWdlXG4gIH1cbiAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKGBbTGludGVyLUVTTGludF0gJHttZXNzYWdlfWAsIHtcbiAgICBkZXRhaWwsXG4gICAgZGlzbWlzc2FibGU6IHRydWVcbiAgfSlcbn1cblxuZnVuY3Rpb24gdmFsaWRhdGVQb2ludCh0ZXh0RWRpdG9yLCBsaW5lLCBjb2wpIHtcbiAgY29uc3QgYnVmZmVyID0gdGV4dEVkaXRvci5nZXRCdWZmZXIoKVxuICAvLyBDbGlwIHRoZSBnaXZlbiBwb2ludCB0byBhIHZhbGlkIG9uZSwgYW5kIGNoZWNrIGlmIGl0IGVxdWFscyB0aGUgb3JpZ2luYWxcbiAgaWYgKCFidWZmZXIuY2xpcFBvc2l0aW9uKFtsaW5lLCBjb2xdKS5pc0VxdWFsKFtsaW5lLCBjb2xdKSkge1xuICAgIHRocm93IG5ldyBFcnJvcihgJHtsaW5lfToke2NvbH0gaXNuJ3QgYSB2YWxpZCBwb2ludCFgKVxuICB9XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXREZWJ1Z0luZm8od29ya2VyKSB7XG4gIGNvbnN0IHRleHRFZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgbGV0IGZpbGVQYXRoXG4gIGxldCBlZGl0b3JTY29wZXNcbiAgaWYgKGF0b20ud29ya3NwYWNlLmlzVGV4dEVkaXRvcih0ZXh0RWRpdG9yKSkge1xuICAgIGZpbGVQYXRoID0gdGV4dEVkaXRvci5nZXRQYXRoKClcbiAgICBlZGl0b3JTY29wZXMgPSB0ZXh0RWRpdG9yLmdldExhc3RDdXJzb3IoKS5nZXRTY29wZURlc2NyaXB0b3IoKS5nZXRTY29wZXNBcnJheSgpXG4gIH0gZWxzZSB7XG4gICAgLy8gU29tZWhvdyB0aGlzIGNhbiBiZSBjYWxsZWQgd2l0aCBubyBhY3RpdmUgVGV4dEVkaXRvciwgaW1wb3NzaWJsZSBJIGtub3cuLi5cbiAgICBmaWxlUGF0aCA9ICd1bmtub3duJ1xuICAgIGVkaXRvclNjb3BlcyA9IFsndW5rbm93biddXG4gIH1cbiAgY29uc3QgcGFja2FnZVBhdGggPSBhdG9tLnBhY2thZ2VzLnJlc29sdmVQYWNrYWdlUGF0aCgnbGludGVyLWVzbGludCcpXG4gIGxldCBsaW50ZXJFc2xpbnRNZXRhXG4gIGlmIChwYWNrYWdlUGF0aCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgLy8gQXBwYXJlbnRseSBmb3Igc29tZSB1c2VycyB0aGUgcGFja2FnZSBwYXRoIGZhaWxzIHRvIHJlc29sdmVcbiAgICBsaW50ZXJFc2xpbnRNZXRhID0geyB2ZXJzaW9uOiAndW5rbm93biEnIH1cbiAgfSBlbHNlIHtcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgaW1wb3J0L25vLWR5bmFtaWMtcmVxdWlyZVxuICAgIGxpbnRlckVzbGludE1ldGEgPSByZXF1aXJlKGpvaW4ocGFja2FnZVBhdGgsICdwYWNrYWdlLmpzb24nKSlcbiAgfVxuICBjb25zdCBjb25maWcgPSBhdG9tLmNvbmZpZy5nZXQoJ2xpbnRlci1lc2xpbnQnKVxuICBjb25zdCBob3Vyc1NpbmNlUmVzdGFydCA9IE1hdGgucm91bmQoKHByb2Nlc3MudXB0aW1lKCkgLyAzNjAwKSAqIDEwKSAvIDEwXG4gIGxldCByZXR1cm5WYWxcbiAgdHJ5IHtcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHNlbmRKb2Iod29ya2VyLCB7XG4gICAgICB0eXBlOiAnZGVidWcnLFxuICAgICAgY29uZmlnLFxuICAgICAgZmlsZVBhdGhcbiAgICB9KVxuICAgIHJldHVyblZhbCA9IHtcbiAgICAgIGF0b21WZXJzaW9uOiBhdG9tLmdldFZlcnNpb24oKSxcbiAgICAgIGxpbnRlckVzbGludFZlcnNpb246IGxpbnRlckVzbGludE1ldGEudmVyc2lvbixcbiAgICAgIGxpbnRlckVzbGludENvbmZpZzogY29uZmlnLFxuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGltcG9ydC9uby1keW5hbWljLXJlcXVpcmVcbiAgICAgIGVzbGludFZlcnNpb246IHJlcXVpcmUoam9pbihyZXNwb25zZS5wYXRoLCAncGFja2FnZS5qc29uJykpLnZlcnNpb24sXG4gICAgICBob3Vyc1NpbmNlUmVzdGFydCxcbiAgICAgIHBsYXRmb3JtOiBwcm9jZXNzLnBsYXRmb3JtLFxuICAgICAgZXNsaW50VHlwZTogcmVzcG9uc2UudHlwZSxcbiAgICAgIGVzbGludFBhdGg6IHJlc3BvbnNlLnBhdGgsXG4gICAgICBlZGl0b3JTY29wZXMsXG4gICAgfVxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcihgJHtlcnJvcn1gKVxuICB9XG4gIHJldHVybiByZXR1cm5WYWxcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdlbmVyYXRlRGVidWdTdHJpbmcod29ya2VyKSB7XG4gIGNvbnN0IGRlYnVnID0gYXdhaXQgZ2V0RGVidWdJbmZvKHdvcmtlcilcbiAgY29uc3QgZGV0YWlscyA9IFtcbiAgICBgQXRvbSB2ZXJzaW9uOiAke2RlYnVnLmF0b21WZXJzaW9ufWAsXG4gICAgYGxpbnRlci1lc2xpbnQgdmVyc2lvbjogJHtkZWJ1Zy5saW50ZXJFc2xpbnRWZXJzaW9ufWAsXG4gICAgYEVTTGludCB2ZXJzaW9uOiAke2RlYnVnLmVzbGludFZlcnNpb259YCxcbiAgICBgSG91cnMgc2luY2UgbGFzdCBBdG9tIHJlc3RhcnQ6ICR7ZGVidWcuaG91cnNTaW5jZVJlc3RhcnR9YCxcbiAgICBgUGxhdGZvcm06ICR7ZGVidWcucGxhdGZvcm19YCxcbiAgICBgVXNpbmcgJHtkZWJ1Zy5lc2xpbnRUeXBlfSBFU0xpbnQgZnJvbTogJHtkZWJ1Zy5lc2xpbnRQYXRofWAsXG4gICAgYEN1cnJlbnQgZmlsZSdzIHNjb3BlczogJHtKU09OLnN0cmluZ2lmeShkZWJ1Zy5lZGl0b3JTY29wZXMsIG51bGwsIDIpfWAsXG4gICAgYGxpbnRlci1lc2xpbnQgY29uZmlndXJhdGlvbjogJHtKU09OLnN0cmluZ2lmeShkZWJ1Zy5saW50ZXJFc2xpbnRDb25maWcsIG51bGwsIDIpfWBcbiAgXVxuICByZXR1cm4gZGV0YWlscy5qb2luKCdcXG4nKVxufVxuXG5jb25zdCBnZW5lcmF0ZUludmFsaWRUcmFjZSA9IGFzeW5jIChcbiAgbXNnTGluZSwgbXNnQ29sLCBtc2dFbmRMaW5lLCBtc2dFbmRDb2wsXG4gIGVzbGludEZ1bGxSYW5nZSwgZmlsZVBhdGgsIHRleHRFZGl0b3IsIHJ1bGVJZCwgbWVzc2FnZSwgd29ya2VyXG4pID0+IHtcbiAgbGV0IGVyck1zZ1JhbmdlID0gYCR7bXNnTGluZSArIDF9OiR7bXNnQ29sfWBcbiAgaWYgKGVzbGludEZ1bGxSYW5nZSkge1xuICAgIGVyck1zZ1JhbmdlICs9IGAgLSAke21zZ0VuZExpbmUgKyAxfToke21zZ0VuZENvbCArIDF9YFxuICB9XG4gIGNvbnN0IHJhbmdlVGV4dCA9IGBSZXF1ZXN0ZWQgJHtlc2xpbnRGdWxsUmFuZ2UgPyAnc3RhcnQgcG9pbnQnIDogJ3JhbmdlJ306ICR7ZXJyTXNnUmFuZ2V9YFxuICBjb25zdCBpc3N1ZVVSTCA9ICdodHRwczovL2dpdGh1Yi5jb20vQXRvbUxpbnRlci9saW50ZXItZXNsaW50L2lzc3Vlcy9uZXcnXG4gIGNvbnN0IHRpdGxlVGV4dCA9IGBJbnZhbGlkIHBvc2l0aW9uIGdpdmVuIGJ5ICcke3J1bGVJZH0nYFxuICBjb25zdCB0aXRsZSA9IGVuY29kZVVSSUNvbXBvbmVudCh0aXRsZVRleHQpXG4gIGNvbnN0IGJvZHkgPSBlbmNvZGVVUklDb21wb25lbnQoW1xuICAgICdFU0xpbnQgcmV0dXJuZWQgYSBwb2ludCB0aGF0IGRpZCBub3QgZXhpc3QgaW4gdGhlIGRvY3VtZW50IGJlaW5nIGVkaXRlZC4nLFxuICAgIGBSdWxlOiBcXGAke3J1bGVJZH1cXGBgLFxuICAgIHJhbmdlVGV4dCxcbiAgICAnJywgJycsXG4gICAgJzwhLS0gSWYgYXQgYWxsIHBvc3NpYmxlLCBwbGVhc2UgaW5jbHVkZSBjb2RlIHRvIHJlcHJvZHVjZSB0aGlzIGlzc3VlISAtLT4nLFxuICAgICcnLCAnJyxcbiAgICAnRGVidWcgaW5mb3JtYXRpb246JyxcbiAgICAnYGBganNvbicsXG4gICAgSlNPTi5zdHJpbmdpZnkoYXdhaXQgZ2V0RGVidWdJbmZvKHdvcmtlciksIG51bGwsIDIpLFxuICAgICdgYGAnXG4gIF0uam9pbignXFxuJykpXG5cbiAgY29uc3QgbG9jYXRpb24gPSB7XG4gICAgZmlsZTogZmlsZVBhdGgsXG4gICAgcG9zaXRpb246IGdlbmVyYXRlUmFuZ2UodGV4dEVkaXRvciwgMCksXG4gIH1cbiAgY29uc3QgbmV3SXNzdWVVUkwgPSBgJHtpc3N1ZVVSTH0/dGl0bGU9JHt0aXRsZX0mYm9keT0ke2JvZHl9YFxuXG4gIHJldHVybiB7XG4gICAgc2V2ZXJpdHk6ICdlcnJvcicsXG4gICAgZXhjZXJwdDogYCR7dGl0bGVUZXh0fS4gU2VlIHRoZSBkZXNjcmlwdGlvbiBmb3IgZGV0YWlscy4gYCArXG4gICAgICAnQ2xpY2sgdGhlIFVSTCB0byBvcGVuIGEgbmV3IGlzc3VlIScsXG4gICAgdXJsOiBuZXdJc3N1ZVVSTCxcbiAgICBsb2NhdGlvbixcbiAgICBkZXNjcmlwdGlvbjogYCR7cmFuZ2VUZXh0fVxcbk9yaWdpbmFsIG1lc3NhZ2U6ICR7bWVzc2FnZX1gXG4gIH1cbn1cblxuLyoqXG4gKiBHaXZlbiBhIHJhdyByZXNwb25zZSBmcm9tIEVTTGludCwgdGhpcyBwcm9jZXNzZXMgdGhlIG1lc3NhZ2VzIGludG8gYSBmb3JtYXRcbiAqIGNvbXBhdGlibGUgd2l0aCB0aGUgTGludGVyIEFQSS5cbiAqIEBwYXJhbSAge09iamVjdH0gICAgIHJlc3BvbnNlICAgVGhlIHJhdyByZXNwb25zZSBmcm9tIEVTTGludFxuICogQHBhcmFtICB7VGV4dEVkaXRvcn0gdGV4dEVkaXRvciBUaGUgQXRvbTo6VGV4dEVkaXRvciBvZiB0aGUgZmlsZSB0aGUgbWVzc2FnZXMgYmVsb25nIHRvXG4gKiBAcGFyYW0gIHtib29sfSAgICAgICBzaG93UnVsZSAgIFdoZXRoZXIgdG8gc2hvdyB0aGUgcnVsZSBpbiB0aGUgbWVzc2FnZXNcbiAqIEBwYXJhbSAge09iamVjdH0gICAgIHdvcmtlciAgICAgVGhlIGN1cnJlbnQgV29ya2VyIFRhc2sgdG8gc2VuZCBEZWJ1ZyBqb2JzIHRvXG4gKiBAcmV0dXJuIHtQcm9taXNlfSAgICAgICAgICAgICAgIFRoZSBtZXNzYWdlcyB0cmFuc2Zvcm1lZCBpbnRvIExpbnRlciBtZXNzYWdlc1xuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcHJvY2Vzc0VTTGludE1lc3NhZ2VzKHJlc3BvbnNlLCB0ZXh0RWRpdG9yLCBzaG93UnVsZSwgd29ya2VyKSB7XG4gIHJldHVybiBQcm9taXNlLmFsbChyZXNwb25zZS5tYXAoYXN5bmMgKHtcbiAgICBmYXRhbCwgbWVzc2FnZTogb3JpZ2luYWxNZXNzYWdlLCBsaW5lLCBzZXZlcml0eSwgcnVsZUlkLCBjb2x1bW4sIGZpeCwgZW5kTGluZSwgZW5kQ29sdW1uXG4gIH0pID0+IHtcbiAgICBjb25zdCBtZXNzYWdlID0gZmF0YWwgPyBvcmlnaW5hbE1lc3NhZ2Uuc3BsaXQoJ1xcbicpWzBdIDogb3JpZ2luYWxNZXNzYWdlXG4gICAgY29uc3QgZmlsZVBhdGggPSB0ZXh0RWRpdG9yLmdldFBhdGgoKVxuICAgIGNvbnN0IHRleHRCdWZmZXIgPSB0ZXh0RWRpdG9yLmdldEJ1ZmZlcigpXG4gICAgbGV0IGxpbnRlckZpeCA9IG51bGxcbiAgICBpZiAoZml4KSB7XG4gICAgICBjb25zdCBmaXhSYW5nZSA9IG5ldyBSYW5nZShcbiAgICAgICAgdGV4dEJ1ZmZlci5wb3NpdGlvbkZvckNoYXJhY3RlckluZGV4KGZpeC5yYW5nZVswXSksXG4gICAgICAgIHRleHRCdWZmZXIucG9zaXRpb25Gb3JDaGFyYWN0ZXJJbmRleChmaXgucmFuZ2VbMV0pXG4gICAgICApXG4gICAgICBsaW50ZXJGaXggPSB7XG4gICAgICAgIHBvc2l0aW9uOiBmaXhSYW5nZSxcbiAgICAgICAgcmVwbGFjZVdpdGg6IGZpeC50ZXh0XG4gICAgICB9XG4gICAgfVxuICAgIGxldCBtc2dDb2xcbiAgICBsZXQgbXNnRW5kTGluZVxuICAgIGxldCBtc2dFbmRDb2xcbiAgICBsZXQgZXNsaW50RnVsbFJhbmdlID0gZmFsc2VcblxuICAgIC8qXG4gICAgIE5vdGU6IEVTTGludCBwb3NpdGlvbnMgYXJlIDEtaW5kZXhlZCwgd2hpbGUgQXRvbSBleHBlY3RzIDAtaW5kZXhlZCxcbiAgICAgcG9zaXRpb25zLiBXZSBhcmUgc3VidHJhY3RpbmcgMSBmcm9tIHRoZXNlIHZhbHVlcyBoZXJlIHNvIHdlIGRvbid0IGhhdmUgdG9cbiAgICAga2VlcCBkb2luZyBzbyBpbiBsYXRlciB1c2VzLlxuICAgICAqL1xuICAgIGNvbnN0IG1zZ0xpbmUgPSBsaW5lIC0gMVxuICAgIGlmICh0eXBlb2YgZW5kQ29sdW1uICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgZW5kTGluZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIGVzbGludEZ1bGxSYW5nZSA9IHRydWVcbiAgICAgIC8vIEhlcmUgd2UgYWx3YXlzIHdhbnQgdGhlIGNvbHVtbiB0byBiZSBhIG51bWJlclxuICAgICAgbXNnQ29sID0gTWF0aC5tYXgoMCwgY29sdW1uIC0gMSlcbiAgICAgIG1zZ0VuZExpbmUgPSBlbmRMaW5lIC0gMVxuICAgICAgbXNnRW5kQ29sID0gZW5kQ29sdW1uIC0gMVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBXZSB3YW50IG1zZ0NvbCB0byByZW1haW4gdW5kZWZpbmVkIGlmIGl0IHdhcyBpbml0aWFsbHkgc29cbiAgICAgIC8vIGBnZW5lcmF0ZVJhbmdlYCB3aWxsIGdpdmUgdXMgYSByYW5nZSBvdmVyIHRoZSBlbnRpcmUgbGluZVxuICAgICAgbXNnQ29sID0gdHlwZW9mIGNvbHVtbiAhPT0gJ3VuZGVmaW5lZCcgPyBjb2x1bW4gLSAxIDogY29sdW1uXG4gICAgfVxuXG4gICAgbGV0IHJldFxuICAgIGxldCByYW5nZVxuICAgIHRyeSB7XG4gICAgICBpZiAoZXNsaW50RnVsbFJhbmdlKSB7XG4gICAgICAgIHZhbGlkYXRlUG9pbnQodGV4dEVkaXRvciwgbXNnTGluZSwgbXNnQ29sKVxuICAgICAgICB2YWxpZGF0ZVBvaW50KHRleHRFZGl0b3IsIG1zZ0VuZExpbmUsIG1zZ0VuZENvbClcbiAgICAgICAgcmFuZ2UgPSBbW21zZ0xpbmUsIG1zZ0NvbF0sIFttc2dFbmRMaW5lLCBtc2dFbmRDb2xdXVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmFuZ2UgPSBnZW5lcmF0ZVJhbmdlKHRleHRFZGl0b3IsIG1zZ0xpbmUsIG1zZ0NvbClcbiAgICAgIH1cbiAgICAgIHJldCA9IHtcbiAgICAgICAgc2V2ZXJpdHk6IHNldmVyaXR5ID09PSAxID8gJ3dhcm5pbmcnIDogJ2Vycm9yJyxcbiAgICAgICAgbG9jYXRpb246IHtcbiAgICAgICAgICBmaWxlOiBmaWxlUGF0aCxcbiAgICAgICAgICBwb3NpdGlvbjogcmFuZ2VcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAocnVsZUlkKSB7XG4gICAgICAgIHJldC51cmwgPSBydWxlVVJJKHJ1bGVJZCkudXJsXG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHJ1bGVBcHBlbmRpeCA9IHNob3dSdWxlID8gYCAoJHtydWxlSWQgfHwgJ0ZhdGFsJ30pYCA6ICcnXG4gICAgICByZXQuZXhjZXJwdCA9IGAke21lc3NhZ2V9JHtydWxlQXBwZW5kaXh9YFxuXG4gICAgICBpZiAobGludGVyRml4KSB7XG4gICAgICAgIHJldC5zb2x1dGlvbnMgPSBbbGludGVyRml4XVxuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgaWYgKCFlcnIubWVzc2FnZS5zdGFydHNXaXRoKCdMaW5lIG51bWJlciAnKSAmJlxuICAgICAgICAhZXJyLm1lc3NhZ2Uuc3RhcnRzV2l0aCgnQ29sdW1uIHN0YXJ0ICcpXG4gICAgICApIHtcbiAgICAgICAgLy8gVGhpcyBpc24ndCBhbiBpbnZhbGlkIHBvaW50IGVycm9yIGZyb20gYGdlbmVyYXRlUmFuZ2VgLCByZS10aHJvdyBpdFxuICAgICAgICB0aHJvdyBlcnJcbiAgICAgIH1cbiAgICAgIHJldCA9IGF3YWl0IGdlbmVyYXRlSW52YWxpZFRyYWNlKFxuICAgICAgICBtc2dMaW5lLCBtc2dDb2wsIG1zZ0VuZExpbmUsIG1zZ0VuZENvbCxcbiAgICAgICAgZXNsaW50RnVsbFJhbmdlLCBmaWxlUGF0aCwgdGV4dEVkaXRvciwgcnVsZUlkLCBtZXNzYWdlLCB3b3JrZXJcbiAgICAgIClcbiAgICB9XG5cbiAgICByZXR1cm4gcmV0XG4gIH0pKVxufVxuIl19