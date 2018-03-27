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
  // eslint-disable-next-line no-param-reassign
  config.emitKey = (0, _cryptoRandomString2['default'])(10);

  return new Promise(function (resolve, reject) {
    var errSub = worker.on('task:error', function () {
      for (var _len = arguments.length, err = Array(_len), _key = 0; _key < _len; _key++) {
        err[_key] = arguments[_key];
      }

      var msg = err[0];
      var stack = err[1];

      // Re-throw errors from the task
      var error = new Error(msg);
      // Set the stack to the one given to us by the worker
      error.stack = stack;
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
exports.getFixableRules = getFixableRules;

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
exports.handleError = handleError;

/**
 * Given a raw response from ESLint, this processes the messages into a format
 * compatible with the Linter API.
 * @param  {Object}     messages   The messages from ESLint's response
 * @param  {TextEditor} textEditor The Atom::TextEditor of the file the messages belong to
 * @param  {bool}       showRule   Whether to show the rule in the messages
 * @param  {Object}     worker     The current Worker Task to send Debug jobs to
 * @return {Promise}               The messages transformed into Linter messages
 */

var processESLintMessages = _asyncToGenerator(function* (messages, textEditor, showRule, worker) {
  return Promise.all(messages.map(_asyncToGenerator(function* (_ref2) {
    var fatal = _ref2.fatal;
    var originalMessage = _ref2.message;
    var line = _ref2.line;
    var severity = _ref2.severity;
    var ruleId = _ref2.ruleId;
    var column = _ref2.column;
    var fix = _ref2.fix;
    var endLine = _ref2.endLine;
    var endColumn = _ref2.endColumn;

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

    var ret = {
      severity: severity === 1 ? 'warning' : 'error',
      location: {
        file: filePath
      }
    };

    if (ruleId) {
      ret.url = (0, _eslintRuleDocumentation2['default'])(ruleId).url;
    }

    var range = undefined;
    try {
      if (eslintFullRange) {
        var buffer = textEditor.getBuffer();
        validatePoint(buffer, msgLine, msgCol);
        validatePoint(buffer, msgEndLine, msgEndCol);
        range = [[msgLine, msgCol], [msgEndLine, msgEndCol]];
      } else {
        range = (0, _atomLinter.generateRange)(textEditor, msgLine, msgCol);
      }
      ret.location.position = range;

      var ruleAppendix = showRule ? ' (' + (ruleId || 'Fatal') + ')' : '';
      ret.excerpt = '' + message + ruleAppendix;

      if (linterFix) {
        ret.solutions = [linterFix];
      }
    } catch (err) {
      ret = yield generateInvalidTrace({
        msgLine: msgLine,
        msgCol: msgCol,
        msgEndLine: msgEndLine,
        msgEndCol: msgEndCol,
        eslintFullRange: eslintFullRange,
        filePath: filePath,
        textEditor: textEditor,
        ruleId: ruleId,
        message: message,
        worker: worker
      });
    }

    return ret;
  })));
}

/**
 * Processes the response from the lint job
 * @param  {Object}     response   The raw response from the job
 * @param  {TextEditor} textEditor The Atom::TextEditor of the file the messages belong to
 * @param  {bool}       showRule   Whether to show the rule in the messages
 * @param  {Object}     worker     The current Worker Task to send Debug jobs to
 * @return {Promise}               The messages transformed into Linter messages
 */
);

exports.processESLintMessages = processESLintMessages;

var processJobResponse = _asyncToGenerator(function* (response, textEditor, showRule, worker) {
  if (Object.prototype.hasOwnProperty.call(response, 'fixableRules')) {
    fixableRules.clear();
    response.fixableRules.forEach(function (rule) {
      return fixableRules.add(rule);
    });
  }
  return processESLintMessages(response.messages, textEditor, showRule, worker);
});

exports.processJobResponse = processJobResponse;

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

'use babel';

var fixableRules = new Set();

/**
 * Start the worker process if it hasn't already been started
 * @param  {Task} worker The worker process reference to act on
 * @return {undefined}
 */
var startWorker = function startWorker(worker) {
  if (worker.started) {
    // Worker start request has already been sent
    return;
  }
  // Send empty arguments as we don't use them in the worker
  worker.start([]);
  // NOTE: Modifies the Task of the worker, but it's the only clean way to track this
  // eslint-disable-next-line no-param-reassign
  worker.started = true;
};
function getFixableRules() {
  return Array.from(fixableRules.values());
}

function validatePoint(textBuffer, line, col) {
  // Clip the given point to a valid one, and check if it equals the original
  if (!textBuffer.clipPosition([line, col]).isEqual([line, col])) {
    throw new Error(line + ':' + col + ' isn\'t a valid point!');
  }
}

function handleError(textEditor, error) {
  var stack = error.stack;
  var message = error.message;

  // Only show the first line of the message as the excerpt
  var excerpt = 'Error while running ESLint: ' + message.split('\n')[0] + '.';
  return [{
    severity: 'error',
    excerpt: excerpt,
    description: '<div style="white-space: pre-wrap">' + message + '\n<hr />' + stack + '</div>',
    location: {
      file: textEditor.getPath(),
      position: (0, _atomLinter.generateRange)(textEditor)
    }
  }];
}

var generateInvalidTrace = _asyncToGenerator(function* (_ref) {
  var msgLine = _ref.msgLine;
  var msgCol = _ref.msgCol;
  var msgEndLine = _ref.msgEndLine;
  var msgEndCol = _ref.msgEndCol;
  var eslintFullRange = _ref.eslintFullRange;
  var filePath = _ref.filePath;
  var textEditor = _ref.textEditor;
  var ruleId = _ref.ruleId;
  var message = _ref.message;
  var worker = _ref.worker;

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1Ly5hdG9tL3BhY2thZ2VzL2xpbnRlci1lc2xpbnQvc3JjL2hlbHBlcnMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7SUFtQ3NCLE9BQU8scUJBQXRCLFdBQXVCLE1BQU0sRUFBRSxNQUFNLEVBQUU7O0FBRTVDLGFBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQTs7Ozs7QUFLbkIsUUFBTSxDQUFDLE9BQU8sR0FBRyxxQ0FBbUIsRUFBRSxDQUFDLENBQUE7O0FBRXZDLFNBQU8sSUFBSSxPQUFPLENBQUMsVUFBQyxPQUFPLEVBQUUsTUFBTSxFQUFLO0FBQ3RDLFFBQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxFQUFFLENBQUMsWUFBWSxFQUFFLFlBQVk7d0NBQVIsR0FBRztBQUFILFdBQUc7OztVQUNyQyxHQUFHLEdBQVcsR0FBRztVQUFaLEtBQUssR0FBSSxHQUFHOzs7QUFFeEIsVUFBTSxLQUFLLEdBQUcsSUFBSSxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUE7O0FBRTVCLFdBQUssQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFBO0FBQ25CLFlBQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQTtLQUNkLENBQUMsQ0FBQTtBQUNGLFFBQU0sV0FBVyxHQUFHLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxVQUFDLElBQUksRUFBSztBQUN0RCxZQUFNLENBQUMsT0FBTyxFQUFFLENBQUE7QUFDaEIsaUJBQVcsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtBQUNyQixhQUFPLENBQUMsSUFBSSxDQUFDLENBQUE7S0FDZCxDQUFDLENBQUE7O0FBRUYsUUFBSTtBQUNGLFlBQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUE7S0FDcEIsQ0FBQyxPQUFPLENBQUMsRUFBRTtBQUNWLGFBQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUE7S0FDakI7R0FDRixDQUFDLENBQUE7Q0FDSDs7Ozs7SUFhcUIsWUFBWSxx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QVMsR0FBRyxDQUFDLENBQUEsQUFBRSxDQUFBO0dBQ3ZEO0FBQ0QsTUFBTSxTQUFTLG1CQUFnQixlQUFlLEdBQUcsYUFBYSxHQUFHLE9BQU8sQ0FBQSxVQUFLLFdBQVcsQUFBRSxDQUFBO0FBQzFGLE1BQU0sUUFBUSxHQUFHLHdEQUF3RCxDQUFBO0FBQ3pFLE1BQU0sU0FBUyxvQ0FBaUMsTUFBTSxPQUFHLENBQUE7QUFDekQsTUFBTSxLQUFLLEdBQUcsa0JBQWtCLENBQUMsU0FBUyxDQUFDLENBQUE7QUFDM0MsTUFBTSxJQUFJLEdBQUcsa0JBQWtCLENBQUMsQ0FDOUIsMEVBQTBFLGNBQy9ELE1BQU0sUUFDakIsU0FBUyxFQUNULEVBQUUsRUFBRSxFQUFFLEVBQ04sMkVBQTJFLEVBQzNFLEVBQUUsRUFBRSxFQUFFLEVBQ04sb0JBQW9CLEVBQ3BCLFNBQVMsRUFDVCxJQUFJLENBQUMsU0FBUyxFQUFDLE1BQU0sWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFBLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxFQUNuRCxLQUFLLENBQ04sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQTs7QUFFYixNQUFNLFFBQVEsR0FBRztBQUNmLFFBQUksRUFBRSxRQUFRO0FBQ2QsWUFBUSxFQUFFLCtCQUFjLFVBQVUsRUFBRSxDQUFDLENBQUM7R0FDdkMsQ0FBQTtBQUNELE1BQU0sV0FBVyxHQUFNLFFBQVEsZUFBVSxLQUFLLGNBQVMsSUFBSSxBQUFFLENBQUE7O0FBRTdELFNBQU87QUFDTCxZQUFRLEVBQUUsT0FBTztBQUNqQixXQUFPLEVBQUUsQUFBRyxTQUFTLDJDQUNuQixvQ0FBb0M7QUFDdEMsT0FBRyxFQUFFLFdBQVc7QUFDaEIsWUFBUSxFQUFSLFFBQVE7QUFDUixlQUFXLEVBQUssU0FBUyw0QkFBdUIsT0FBTyxBQUFFO0dBQzFELENBQUE7Q0FDRixDQUFBLENBQUEiLCJmaWxlIjoiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvbGludGVyLWVzbGludC9zcmMvaGVscGVycy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnXG5cbmltcG9ydCB7IGpvaW4gfSBmcm9tICdwYXRoJ1xuaW1wb3J0IHJ1bGVVUkkgZnJvbSAnZXNsaW50LXJ1bGUtZG9jdW1lbnRhdGlvbidcbmltcG9ydCB7IGdlbmVyYXRlUmFuZ2UgfSBmcm9tICdhdG9tLWxpbnRlcidcbmltcG9ydCBjcnlwdG9SYW5kb21TdHJpbmcgZnJvbSAnY3J5cHRvLXJhbmRvbS1zdHJpbmcnXG5cbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBpbXBvcnQvbm8tZXh0cmFuZW91cy1kZXBlbmRlbmNpZXMsIGltcG9ydC9leHRlbnNpb25zXG5pbXBvcnQgeyBSYW5nZSB9IGZyb20gJ2F0b20nXG5cbmNvbnN0IGZpeGFibGVSdWxlcyA9IG5ldyBTZXQoKVxuXG4vKipcbiAqIFN0YXJ0IHRoZSB3b3JrZXIgcHJvY2VzcyBpZiBpdCBoYXNuJ3QgYWxyZWFkeSBiZWVuIHN0YXJ0ZWRcbiAqIEBwYXJhbSAge1Rhc2t9IHdvcmtlciBUaGUgd29ya2VyIHByb2Nlc3MgcmVmZXJlbmNlIHRvIGFjdCBvblxuICogQHJldHVybiB7dW5kZWZpbmVkfVxuICovXG5jb25zdCBzdGFydFdvcmtlciA9ICh3b3JrZXIpID0+IHtcbiAgaWYgKHdvcmtlci5zdGFydGVkKSB7XG4gICAgLy8gV29ya2VyIHN0YXJ0IHJlcXVlc3QgaGFzIGFscmVhZHkgYmVlbiBzZW50XG4gICAgcmV0dXJuXG4gIH1cbiAgLy8gU2VuZCBlbXB0eSBhcmd1bWVudHMgYXMgd2UgZG9uJ3QgdXNlIHRoZW0gaW4gdGhlIHdvcmtlclxuICB3b3JrZXIuc3RhcnQoW10pXG4gIC8vIE5PVEU6IE1vZGlmaWVzIHRoZSBUYXNrIG9mIHRoZSB3b3JrZXIsIGJ1dCBpdCdzIHRoZSBvbmx5IGNsZWFuIHdheSB0byB0cmFjayB0aGlzXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1wYXJhbS1yZWFzc2lnblxuICB3b3JrZXIuc3RhcnRlZCA9IHRydWVcbn1cblxuLyoqXG4gKiBTZW5kIGEgam9iIHRvIHRoZSB3b3JrZXIgYW5kIHJldHVybiB0aGUgcmVzdWx0c1xuICogQHBhcmFtICB7VGFza30gd29ya2VyIFRoZSB3b3JrZXIgVGFzayB0byB1c2VcbiAqIEBwYXJhbSAge09iamVjdH0gY29uZmlnIENvbmZpZ3VyYXRpb24gZm9yIHRoZSBqb2IgdG8gc2VuZCB0byB0aGUgd29ya2VyXG4gKiBAcmV0dXJuIHtPYmplY3R8U3RyaW5nfEVycm9yfSAgICAgICAgVGhlIGRhdGEgcmV0dXJuZWQgZnJvbSB0aGUgd29ya2VyXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzZW5kSm9iKHdvcmtlciwgY29uZmlnKSB7XG4gIC8vIEVuc3VyZSB0aGUgd29ya2VyIGlzIHN0YXJ0ZWRcbiAgc3RhcnRXb3JrZXIod29ya2VyKVxuICAvLyBFeHBhbmQgdGhlIGNvbmZpZyB3aXRoIGEgdW5pcXVlIElEIHRvIGVtaXQgb25cbiAgLy8gTk9URTogSm9icyBfbXVzdF8gaGF2ZSBhIHVuaXF1ZSBJRCBhcyB0aGV5IGFyZSBjb21wbGV0ZWx5IGFzeW5jIGFuZCByZXN1bHRzXG4gIC8vIGNhbiBhcnJpdmUgYmFjayBpbiBhbnkgb3JkZXIuXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1wYXJhbS1yZWFzc2lnblxuICBjb25maWcuZW1pdEtleSA9IGNyeXB0b1JhbmRvbVN0cmluZygxMClcblxuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGNvbnN0IGVyclN1YiA9IHdvcmtlci5vbigndGFzazplcnJvcicsICguLi5lcnIpID0+IHtcbiAgICAgIGNvbnN0IFttc2csIHN0YWNrXSA9IGVyclxuICAgICAgLy8gUmUtdGhyb3cgZXJyb3JzIGZyb20gdGhlIHRhc2tcbiAgICAgIGNvbnN0IGVycm9yID0gbmV3IEVycm9yKG1zZylcbiAgICAgIC8vIFNldCB0aGUgc3RhY2sgdG8gdGhlIG9uZSBnaXZlbiB0byB1cyBieSB0aGUgd29ya2VyXG4gICAgICBlcnJvci5zdGFjayA9IHN0YWNrXG4gICAgICByZWplY3QoZXJyb3IpXG4gICAgfSlcbiAgICBjb25zdCByZXNwb25zZVN1YiA9IHdvcmtlci5vbihjb25maWcuZW1pdEtleSwgKGRhdGEpID0+IHtcbiAgICAgIGVyclN1Yi5kaXNwb3NlKClcbiAgICAgIHJlc3BvbnNlU3ViLmRpc3Bvc2UoKVxuICAgICAgcmVzb2x2ZShkYXRhKVxuICAgIH0pXG4gICAgLy8gU2VuZCB0aGUgam9iIG9uIHRvIHRoZSB3b3JrZXJcbiAgICB0cnkge1xuICAgICAgd29ya2VyLnNlbmQoY29uZmlnKVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoZSlcbiAgICB9XG4gIH0pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRGaXhhYmxlUnVsZXMoKSB7XG4gIHJldHVybiBBcnJheS5mcm9tKGZpeGFibGVSdWxlcy52YWx1ZXMoKSlcbn1cblxuZnVuY3Rpb24gdmFsaWRhdGVQb2ludCh0ZXh0QnVmZmVyLCBsaW5lLCBjb2wpIHtcbiAgLy8gQ2xpcCB0aGUgZ2l2ZW4gcG9pbnQgdG8gYSB2YWxpZCBvbmUsIGFuZCBjaGVjayBpZiBpdCBlcXVhbHMgdGhlIG9yaWdpbmFsXG4gIGlmICghdGV4dEJ1ZmZlci5jbGlwUG9zaXRpb24oW2xpbmUsIGNvbF0pLmlzRXF1YWwoW2xpbmUsIGNvbF0pKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGAke2xpbmV9OiR7Y29sfSBpc24ndCBhIHZhbGlkIHBvaW50IWApXG4gIH1cbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldERlYnVnSW5mbyh3b3JrZXIpIHtcbiAgY29uc3QgdGV4dEVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICBsZXQgZmlsZVBhdGhcbiAgbGV0IGVkaXRvclNjb3Blc1xuICBpZiAoYXRvbS53b3Jrc3BhY2UuaXNUZXh0RWRpdG9yKHRleHRFZGl0b3IpKSB7XG4gICAgZmlsZVBhdGggPSB0ZXh0RWRpdG9yLmdldFBhdGgoKVxuICAgIGVkaXRvclNjb3BlcyA9IHRleHRFZGl0b3IuZ2V0TGFzdEN1cnNvcigpLmdldFNjb3BlRGVzY3JpcHRvcigpLmdldFNjb3Blc0FycmF5KClcbiAgfSBlbHNlIHtcbiAgICAvLyBTb21laG93IHRoaXMgY2FuIGJlIGNhbGxlZCB3aXRoIG5vIGFjdGl2ZSBUZXh0RWRpdG9yLCBpbXBvc3NpYmxlIEkga25vdy4uLlxuICAgIGZpbGVQYXRoID0gJ3Vua25vd24nXG4gICAgZWRpdG9yU2NvcGVzID0gWyd1bmtub3duJ11cbiAgfVxuICBjb25zdCBwYWNrYWdlUGF0aCA9IGF0b20ucGFja2FnZXMucmVzb2x2ZVBhY2thZ2VQYXRoKCdsaW50ZXItZXNsaW50JylcbiAgbGV0IGxpbnRlckVzbGludE1ldGFcbiAgaWYgKHBhY2thZ2VQYXRoID09PSB1bmRlZmluZWQpIHtcbiAgICAvLyBBcHBhcmVudGx5IGZvciBzb21lIHVzZXJzIHRoZSBwYWNrYWdlIHBhdGggZmFpbHMgdG8gcmVzb2x2ZVxuICAgIGxpbnRlckVzbGludE1ldGEgPSB7IHZlcnNpb246ICd1bmtub3duIScgfVxuICB9IGVsc2Uge1xuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBpbXBvcnQvbm8tZHluYW1pYy1yZXF1aXJlXG4gICAgbGludGVyRXNsaW50TWV0YSA9IHJlcXVpcmUoam9pbihwYWNrYWdlUGF0aCwgJ3BhY2thZ2UuanNvbicpKVxuICB9XG4gIGNvbnN0IGNvbmZpZyA9IGF0b20uY29uZmlnLmdldCgnbGludGVyLWVzbGludCcpXG4gIGNvbnN0IGhvdXJzU2luY2VSZXN0YXJ0ID0gTWF0aC5yb3VuZCgocHJvY2Vzcy51cHRpbWUoKSAvIDM2MDApICogMTApIC8gMTBcbiAgbGV0IHJldHVyblZhbFxuICB0cnkge1xuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgc2VuZEpvYih3b3JrZXIsIHtcbiAgICAgIHR5cGU6ICdkZWJ1ZycsXG4gICAgICBjb25maWcsXG4gICAgICBmaWxlUGF0aFxuICAgIH0pXG4gICAgcmV0dXJuVmFsID0ge1xuICAgICAgYXRvbVZlcnNpb246IGF0b20uZ2V0VmVyc2lvbigpLFxuICAgICAgbGludGVyRXNsaW50VmVyc2lvbjogbGludGVyRXNsaW50TWV0YS52ZXJzaW9uLFxuICAgICAgbGludGVyRXNsaW50Q29uZmlnOiBjb25maWcsXG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgaW1wb3J0L25vLWR5bmFtaWMtcmVxdWlyZVxuICAgICAgZXNsaW50VmVyc2lvbjogcmVxdWlyZShqb2luKHJlc3BvbnNlLnBhdGgsICdwYWNrYWdlLmpzb24nKSkudmVyc2lvbixcbiAgICAgIGhvdXJzU2luY2VSZXN0YXJ0LFxuICAgICAgcGxhdGZvcm06IHByb2Nlc3MucGxhdGZvcm0sXG4gICAgICBlc2xpbnRUeXBlOiByZXNwb25zZS50eXBlLFxuICAgICAgZXNsaW50UGF0aDogcmVzcG9uc2UucGF0aCxcbiAgICAgIGVkaXRvclNjb3BlcyxcbiAgICB9XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKGAke2Vycm9yfWApXG4gIH1cbiAgcmV0dXJuIHJldHVyblZhbFxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2VuZXJhdGVEZWJ1Z1N0cmluZyh3b3JrZXIpIHtcbiAgY29uc3QgZGVidWcgPSBhd2FpdCBnZXREZWJ1Z0luZm8od29ya2VyKVxuICBjb25zdCBkZXRhaWxzID0gW1xuICAgIGBBdG9tIHZlcnNpb246ICR7ZGVidWcuYXRvbVZlcnNpb259YCxcbiAgICBgbGludGVyLWVzbGludCB2ZXJzaW9uOiAke2RlYnVnLmxpbnRlckVzbGludFZlcnNpb259YCxcbiAgICBgRVNMaW50IHZlcnNpb246ICR7ZGVidWcuZXNsaW50VmVyc2lvbn1gLFxuICAgIGBIb3VycyBzaW5jZSBsYXN0IEF0b20gcmVzdGFydDogJHtkZWJ1Zy5ob3Vyc1NpbmNlUmVzdGFydH1gLFxuICAgIGBQbGF0Zm9ybTogJHtkZWJ1Zy5wbGF0Zm9ybX1gLFxuICAgIGBVc2luZyAke2RlYnVnLmVzbGludFR5cGV9IEVTTGludCBmcm9tOiAke2RlYnVnLmVzbGludFBhdGh9YCxcbiAgICBgQ3VycmVudCBmaWxlJ3Mgc2NvcGVzOiAke0pTT04uc3RyaW5naWZ5KGRlYnVnLmVkaXRvclNjb3BlcywgbnVsbCwgMil9YCxcbiAgICBgbGludGVyLWVzbGludCBjb25maWd1cmF0aW9uOiAke0pTT04uc3RyaW5naWZ5KGRlYnVnLmxpbnRlckVzbGludENvbmZpZywgbnVsbCwgMil9YFxuICBdXG4gIHJldHVybiBkZXRhaWxzLmpvaW4oJ1xcbicpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoYW5kbGVFcnJvcih0ZXh0RWRpdG9yLCBlcnJvcikge1xuICBjb25zdCB7IHN0YWNrLCBtZXNzYWdlIH0gPSBlcnJvclxuICAvLyBPbmx5IHNob3cgdGhlIGZpcnN0IGxpbmUgb2YgdGhlIG1lc3NhZ2UgYXMgdGhlIGV4Y2VycHRcbiAgY29uc3QgZXhjZXJwdCA9IGBFcnJvciB3aGlsZSBydW5uaW5nIEVTTGludDogJHttZXNzYWdlLnNwbGl0KCdcXG4nKVswXX0uYFxuICByZXR1cm4gW3tcbiAgICBzZXZlcml0eTogJ2Vycm9yJyxcbiAgICBleGNlcnB0LFxuICAgIGRlc2NyaXB0aW9uOiBgPGRpdiBzdHlsZT1cIndoaXRlLXNwYWNlOiBwcmUtd3JhcFwiPiR7bWVzc2FnZX1cXG48aHIgLz4ke3N0YWNrfTwvZGl2PmAsXG4gICAgbG9jYXRpb246IHtcbiAgICAgIGZpbGU6IHRleHRFZGl0b3IuZ2V0UGF0aCgpLFxuICAgICAgcG9zaXRpb246IGdlbmVyYXRlUmFuZ2UodGV4dEVkaXRvciksXG4gICAgfSxcbiAgfV1cbn1cblxuY29uc3QgZ2VuZXJhdGVJbnZhbGlkVHJhY2UgPSBhc3luYyAoe1xuICBtc2dMaW5lLCBtc2dDb2wsIG1zZ0VuZExpbmUsIG1zZ0VuZENvbCxcbiAgZXNsaW50RnVsbFJhbmdlLCBmaWxlUGF0aCwgdGV4dEVkaXRvciwgcnVsZUlkLCBtZXNzYWdlLCB3b3JrZXJcbn0pID0+IHtcbiAgbGV0IGVyck1zZ1JhbmdlID0gYCR7bXNnTGluZSArIDF9OiR7bXNnQ29sfWBcbiAgaWYgKGVzbGludEZ1bGxSYW5nZSkge1xuICAgIGVyck1zZ1JhbmdlICs9IGAgLSAke21zZ0VuZExpbmUgKyAxfToke21zZ0VuZENvbCArIDF9YFxuICB9XG4gIGNvbnN0IHJhbmdlVGV4dCA9IGBSZXF1ZXN0ZWQgJHtlc2xpbnRGdWxsUmFuZ2UgPyAnc3RhcnQgcG9pbnQnIDogJ3JhbmdlJ306ICR7ZXJyTXNnUmFuZ2V9YFxuICBjb25zdCBpc3N1ZVVSTCA9ICdodHRwczovL2dpdGh1Yi5jb20vQXRvbUxpbnRlci9saW50ZXItZXNsaW50L2lzc3Vlcy9uZXcnXG4gIGNvbnN0IHRpdGxlVGV4dCA9IGBJbnZhbGlkIHBvc2l0aW9uIGdpdmVuIGJ5ICcke3J1bGVJZH0nYFxuICBjb25zdCB0aXRsZSA9IGVuY29kZVVSSUNvbXBvbmVudCh0aXRsZVRleHQpXG4gIGNvbnN0IGJvZHkgPSBlbmNvZGVVUklDb21wb25lbnQoW1xuICAgICdFU0xpbnQgcmV0dXJuZWQgYSBwb2ludCB0aGF0IGRpZCBub3QgZXhpc3QgaW4gdGhlIGRvY3VtZW50IGJlaW5nIGVkaXRlZC4nLFxuICAgIGBSdWxlOiBcXGAke3J1bGVJZH1cXGBgLFxuICAgIHJhbmdlVGV4dCxcbiAgICAnJywgJycsXG4gICAgJzwhLS0gSWYgYXQgYWxsIHBvc3NpYmxlLCBwbGVhc2UgaW5jbHVkZSBjb2RlIHRvIHJlcHJvZHVjZSB0aGlzIGlzc3VlISAtLT4nLFxuICAgICcnLCAnJyxcbiAgICAnRGVidWcgaW5mb3JtYXRpb246JyxcbiAgICAnYGBganNvbicsXG4gICAgSlNPTi5zdHJpbmdpZnkoYXdhaXQgZ2V0RGVidWdJbmZvKHdvcmtlciksIG51bGwsIDIpLFxuICAgICdgYGAnXG4gIF0uam9pbignXFxuJykpXG5cbiAgY29uc3QgbG9jYXRpb24gPSB7XG4gICAgZmlsZTogZmlsZVBhdGgsXG4gICAgcG9zaXRpb246IGdlbmVyYXRlUmFuZ2UodGV4dEVkaXRvciwgMCksXG4gIH1cbiAgY29uc3QgbmV3SXNzdWVVUkwgPSBgJHtpc3N1ZVVSTH0/dGl0bGU9JHt0aXRsZX0mYm9keT0ke2JvZHl9YFxuXG4gIHJldHVybiB7XG4gICAgc2V2ZXJpdHk6ICdlcnJvcicsXG4gICAgZXhjZXJwdDogYCR7dGl0bGVUZXh0fS4gU2VlIHRoZSBkZXNjcmlwdGlvbiBmb3IgZGV0YWlscy4gYCArXG4gICAgICAnQ2xpY2sgdGhlIFVSTCB0byBvcGVuIGEgbmV3IGlzc3VlIScsXG4gICAgdXJsOiBuZXdJc3N1ZVVSTCxcbiAgICBsb2NhdGlvbixcbiAgICBkZXNjcmlwdGlvbjogYCR7cmFuZ2VUZXh0fVxcbk9yaWdpbmFsIG1lc3NhZ2U6ICR7bWVzc2FnZX1gXG4gIH1cbn1cblxuLyoqXG4gKiBHaXZlbiBhIHJhdyByZXNwb25zZSBmcm9tIEVTTGludCwgdGhpcyBwcm9jZXNzZXMgdGhlIG1lc3NhZ2VzIGludG8gYSBmb3JtYXRcbiAqIGNvbXBhdGlibGUgd2l0aCB0aGUgTGludGVyIEFQSS5cbiAqIEBwYXJhbSAge09iamVjdH0gICAgIG1lc3NhZ2VzICAgVGhlIG1lc3NhZ2VzIGZyb20gRVNMaW50J3MgcmVzcG9uc2VcbiAqIEBwYXJhbSAge1RleHRFZGl0b3J9IHRleHRFZGl0b3IgVGhlIEF0b206OlRleHRFZGl0b3Igb2YgdGhlIGZpbGUgdGhlIG1lc3NhZ2VzIGJlbG9uZyB0b1xuICogQHBhcmFtICB7Ym9vbH0gICAgICAgc2hvd1J1bGUgICBXaGV0aGVyIHRvIHNob3cgdGhlIHJ1bGUgaW4gdGhlIG1lc3NhZ2VzXG4gKiBAcGFyYW0gIHtPYmplY3R9ICAgICB3b3JrZXIgICAgIFRoZSBjdXJyZW50IFdvcmtlciBUYXNrIHRvIHNlbmQgRGVidWcgam9icyB0b1xuICogQHJldHVybiB7UHJvbWlzZX0gICAgICAgICAgICAgICBUaGUgbWVzc2FnZXMgdHJhbnNmb3JtZWQgaW50byBMaW50ZXIgbWVzc2FnZXNcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHByb2Nlc3NFU0xpbnRNZXNzYWdlcyhtZXNzYWdlcywgdGV4dEVkaXRvciwgc2hvd1J1bGUsIHdvcmtlcikge1xuICByZXR1cm4gUHJvbWlzZS5hbGwobWVzc2FnZXMubWFwKGFzeW5jICh7XG4gICAgZmF0YWwsIG1lc3NhZ2U6IG9yaWdpbmFsTWVzc2FnZSwgbGluZSwgc2V2ZXJpdHksIHJ1bGVJZCwgY29sdW1uLCBmaXgsIGVuZExpbmUsIGVuZENvbHVtblxuICB9KSA9PiB7XG4gICAgY29uc3QgbWVzc2FnZSA9IGZhdGFsID8gb3JpZ2luYWxNZXNzYWdlLnNwbGl0KCdcXG4nKVswXSA6IG9yaWdpbmFsTWVzc2FnZVxuICAgIGNvbnN0IGZpbGVQYXRoID0gdGV4dEVkaXRvci5nZXRQYXRoKClcbiAgICBjb25zdCB0ZXh0QnVmZmVyID0gdGV4dEVkaXRvci5nZXRCdWZmZXIoKVxuICAgIGxldCBsaW50ZXJGaXggPSBudWxsXG4gICAgaWYgKGZpeCkge1xuICAgICAgY29uc3QgZml4UmFuZ2UgPSBuZXcgUmFuZ2UoXG4gICAgICAgIHRleHRCdWZmZXIucG9zaXRpb25Gb3JDaGFyYWN0ZXJJbmRleChmaXgucmFuZ2VbMF0pLFxuICAgICAgICB0ZXh0QnVmZmVyLnBvc2l0aW9uRm9yQ2hhcmFjdGVySW5kZXgoZml4LnJhbmdlWzFdKVxuICAgICAgKVxuICAgICAgbGludGVyRml4ID0ge1xuICAgICAgICBwb3NpdGlvbjogZml4UmFuZ2UsXG4gICAgICAgIHJlcGxhY2VXaXRoOiBmaXgudGV4dFxuICAgICAgfVxuICAgIH1cbiAgICBsZXQgbXNnQ29sXG4gICAgbGV0IG1zZ0VuZExpbmVcbiAgICBsZXQgbXNnRW5kQ29sXG4gICAgbGV0IGVzbGludEZ1bGxSYW5nZSA9IGZhbHNlXG5cbiAgICAvKlxuICAgICBOb3RlOiBFU0xpbnQgcG9zaXRpb25zIGFyZSAxLWluZGV4ZWQsIHdoaWxlIEF0b20gZXhwZWN0cyAwLWluZGV4ZWQsXG4gICAgIHBvc2l0aW9ucy4gV2UgYXJlIHN1YnRyYWN0aW5nIDEgZnJvbSB0aGVzZSB2YWx1ZXMgaGVyZSBzbyB3ZSBkb24ndCBoYXZlIHRvXG4gICAgIGtlZXAgZG9pbmcgc28gaW4gbGF0ZXIgdXNlcy5cbiAgICAgKi9cbiAgICBjb25zdCBtc2dMaW5lID0gbGluZSAtIDFcbiAgICBpZiAodHlwZW9mIGVuZENvbHVtbiAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIGVuZExpbmUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICBlc2xpbnRGdWxsUmFuZ2UgPSB0cnVlXG4gICAgICAvLyBIZXJlIHdlIGFsd2F5cyB3YW50IHRoZSBjb2x1bW4gdG8gYmUgYSBudW1iZXJcbiAgICAgIG1zZ0NvbCA9IE1hdGgubWF4KDAsIGNvbHVtbiAtIDEpXG4gICAgICBtc2dFbmRMaW5lID0gZW5kTGluZSAtIDFcbiAgICAgIG1zZ0VuZENvbCA9IGVuZENvbHVtbiAtIDFcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gV2Ugd2FudCBtc2dDb2wgdG8gcmVtYWluIHVuZGVmaW5lZCBpZiBpdCB3YXMgaW5pdGlhbGx5IHNvXG4gICAgICAvLyBgZ2VuZXJhdGVSYW5nZWAgd2lsbCBnaXZlIHVzIGEgcmFuZ2Ugb3ZlciB0aGUgZW50aXJlIGxpbmVcbiAgICAgIG1zZ0NvbCA9IHR5cGVvZiBjb2x1bW4gIT09ICd1bmRlZmluZWQnID8gY29sdW1uIC0gMSA6IGNvbHVtblxuICAgIH1cblxuICAgIGxldCByZXQgPSB7XG4gICAgICBzZXZlcml0eTogc2V2ZXJpdHkgPT09IDEgPyAnd2FybmluZycgOiAnZXJyb3InLFxuICAgICAgbG9jYXRpb246IHtcbiAgICAgICAgZmlsZTogZmlsZVBhdGgsXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHJ1bGVJZCkge1xuICAgICAgcmV0LnVybCA9IHJ1bGVVUkkocnVsZUlkKS51cmxcbiAgICB9XG5cbiAgICBsZXQgcmFuZ2VcbiAgICB0cnkge1xuICAgICAgaWYgKGVzbGludEZ1bGxSYW5nZSkge1xuICAgICAgICBjb25zdCBidWZmZXIgPSB0ZXh0RWRpdG9yLmdldEJ1ZmZlcigpXG4gICAgICAgIHZhbGlkYXRlUG9pbnQoYnVmZmVyLCBtc2dMaW5lLCBtc2dDb2wpXG4gICAgICAgIHZhbGlkYXRlUG9pbnQoYnVmZmVyLCBtc2dFbmRMaW5lLCBtc2dFbmRDb2wpXG4gICAgICAgIHJhbmdlID0gW1ttc2dMaW5lLCBtc2dDb2xdLCBbbXNnRW5kTGluZSwgbXNnRW5kQ29sXV1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJhbmdlID0gZ2VuZXJhdGVSYW5nZSh0ZXh0RWRpdG9yLCBtc2dMaW5lLCBtc2dDb2wpXG4gICAgICB9XG4gICAgICByZXQubG9jYXRpb24ucG9zaXRpb24gPSByYW5nZVxuXG4gICAgICBjb25zdCBydWxlQXBwZW5kaXggPSBzaG93UnVsZSA/IGAgKCR7cnVsZUlkIHx8ICdGYXRhbCd9KWAgOiAnJ1xuICAgICAgcmV0LmV4Y2VycHQgPSBgJHttZXNzYWdlfSR7cnVsZUFwcGVuZGl4fWBcblxuICAgICAgaWYgKGxpbnRlckZpeCkge1xuICAgICAgICByZXQuc29sdXRpb25zID0gW2xpbnRlckZpeF1cbiAgICAgIH1cbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIHJldCA9IGF3YWl0IGdlbmVyYXRlSW52YWxpZFRyYWNlKHtcbiAgICAgICAgbXNnTGluZSxcbiAgICAgICAgbXNnQ29sLFxuICAgICAgICBtc2dFbmRMaW5lLFxuICAgICAgICBtc2dFbmRDb2wsXG4gICAgICAgIGVzbGludEZ1bGxSYW5nZSxcbiAgICAgICAgZmlsZVBhdGgsXG4gICAgICAgIHRleHRFZGl0b3IsXG4gICAgICAgIHJ1bGVJZCxcbiAgICAgICAgbWVzc2FnZSxcbiAgICAgICAgd29ya2VyXG4gICAgICB9KVxuICAgIH1cblxuICAgIHJldHVybiByZXRcbiAgfSkpXG59XG5cbi8qKlxuICogUHJvY2Vzc2VzIHRoZSByZXNwb25zZSBmcm9tIHRoZSBsaW50IGpvYlxuICogQHBhcmFtICB7T2JqZWN0fSAgICAgcmVzcG9uc2UgICBUaGUgcmF3IHJlc3BvbnNlIGZyb20gdGhlIGpvYlxuICogQHBhcmFtICB7VGV4dEVkaXRvcn0gdGV4dEVkaXRvciBUaGUgQXRvbTo6VGV4dEVkaXRvciBvZiB0aGUgZmlsZSB0aGUgbWVzc2FnZXMgYmVsb25nIHRvXG4gKiBAcGFyYW0gIHtib29sfSAgICAgICBzaG93UnVsZSAgIFdoZXRoZXIgdG8gc2hvdyB0aGUgcnVsZSBpbiB0aGUgbWVzc2FnZXNcbiAqIEBwYXJhbSAge09iamVjdH0gICAgIHdvcmtlciAgICAgVGhlIGN1cnJlbnQgV29ya2VyIFRhc2sgdG8gc2VuZCBEZWJ1ZyBqb2JzIHRvXG4gKiBAcmV0dXJuIHtQcm9taXNlfSAgICAgICAgICAgICAgIFRoZSBtZXNzYWdlcyB0cmFuc2Zvcm1lZCBpbnRvIExpbnRlciBtZXNzYWdlc1xuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcHJvY2Vzc0pvYlJlc3BvbnNlKHJlc3BvbnNlLCB0ZXh0RWRpdG9yLCBzaG93UnVsZSwgd29ya2VyKSB7XG4gIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwocmVzcG9uc2UsICdmaXhhYmxlUnVsZXMnKSkge1xuICAgIGZpeGFibGVSdWxlcy5jbGVhcigpXG4gICAgcmVzcG9uc2UuZml4YWJsZVJ1bGVzLmZvckVhY2gocnVsZSA9PiBmaXhhYmxlUnVsZXMuYWRkKHJ1bGUpKVxuICB9XG4gIHJldHVybiBwcm9jZXNzRVNMaW50TWVzc2FnZXMocmVzcG9uc2UubWVzc2FnZXMsIHRleHRFZGl0b3IsIHNob3dSdWxlLCB3b3JrZXIpXG59XG4iXX0=