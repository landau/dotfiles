Object.defineProperty(exports, '__esModule', {
  value: true
});

/**
 * Utility helper to copy a file into the OS temp directory.
 *
 * @param  {string} fileToCopyPath  Path of the file to be copied
 * @return {string}                 Full path of the file in copy destination
 */
// eslint-disable-next-line import/prefer-default-export

var copyFileToTempDir = _asyncToGenerator(function* (fileToCopyPath) {
  var tempFixtureDir = fs.mkdtempSync((0, _os.tmpdir)() + path.sep);
  return copyFileToDir(fileToCopyPath, tempFixtureDir);
});

exports.copyFileToTempDir = copyFileToTempDir;

var getNotification = _asyncToGenerator(function* (expectedMessage) {
  return new Promise(function (resolve) {
    var notificationSub = undefined;
    var newNotification = function newNotification(notification) {
      if (notification.getMessage() !== expectedMessage) {
        // As the specs execute asynchronously, it's possible a notification
        // from a different spec was grabbed, if the message doesn't match what
        // is expected simply return and keep waiting for the next message.
        return;
      }
      // Dispose of the notificaiton subscription
      notificationSub.dispose();
      resolve(notification);
    };
    // Subscribe to Atom's notifications
    notificationSub = atom.notifications.onDidAddNotification(newNotification);
  });
});

var makeFixes = _asyncToGenerator(function* (textEditor) {
  return new Promise(_asyncToGenerator(function* (resolve) {
    // Subscribe to the file reload event
    var editorReloadSub = textEditor.getBuffer().onDidReload(_asyncToGenerator(function* () {
      editorReloadSub.dispose();
      // File has been reloaded in Atom, notification checking will happen
      // async either way, but should already be finished at this point
      resolve();
    }));

    // Now that all the required subscriptions are active, send off a fix request
    atom.commands.dispatch(atom.views.getView(textEditor), 'linter-eslint:fix-file');
    var expectedMessage = 'Linter-ESLint: Fix complete.';
    var notification = yield getNotification(expectedMessage);

    expect(notification.getMessage()).toBe(expectedMessage);
    expect(notification.getType()).toBe('success');
  }));
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

var _path = require('path');

var path = _interopRequireWildcard(_path);

var _fs = require('fs');

var fs = _interopRequireWildcard(_fs);

var _os = require('os');

var _rimraf = require('rimraf');

var _rimraf2 = _interopRequireDefault(_rimraf);

// eslint-disable-next-line no-unused-vars

var _jasmineFix = require('jasmine-fix');

var _srcMain = require('../src/main');

var _srcMain2 = _interopRequireDefault(_srcMain);

'use babel';

var fixturesDir = path.join(__dirname, 'fixtures');

var fixtures = {
  good: ['files', 'good.js'],
  bad: ['files', 'bad.js'],
  badInline: ['files', 'badInline.js'],
  empty: ['files', 'empty.js'],
  fix: ['files', 'fix.js'],
  cache: ['files', '.eslintcache'],
  config: ['configs', '.eslintrc.yml'],
  ignored: ['eslintignore', 'ignored.js'],
  endRange: ['end-range', 'no-unreachable.js'],
  badCache: ['badCache'],
  modifiedIgnore: ['modified-ignore-rule', 'foo.js'],
  modifiedIgnoreSpace: ['modified-ignore-rule', 'foo-space.js'],
  importing: ['import-resolution', 'nested', 'importing.js'],
  badImport: ['import-resolution', 'nested', 'badImport.js'],
  fixablePlugin: ['plugin-import', 'life.js'],
  eslintignoreDir: ['eslintignore'],
  eslintIgnoreKeyDir: ['configs', 'eslintignorekey']
};

var paths = Object.keys(fixtures).reduce(function (accumulator, fixture) {
  var acc = accumulator;
  acc[fixture] = path.join.apply(path, [fixturesDir].concat(_toConsumableArray(fixtures[fixture])));
  return acc;
}, {});

/**
 * Async helper to copy a file from one place to another on the filesystem.
 * @param  {string} fileToCopyPath  Path of the file to be copied
 * @param  {string} destinationDir  Directory to paste the file into
 * @return {string}                 Full path of the file in copy destination
 */
function copyFileToDir(fileToCopyPath, destinationDir) {
  return new Promise(function (resolve) {
    var destinationPath = path.join(destinationDir, path.basename(fileToCopyPath));
    var ws = fs.createWriteStream(destinationPath);
    ws.on('close', function () {
      return resolve(destinationPath);
    });
    fs.createReadStream(fileToCopyPath).pipe(ws);
  });
}

describe('The eslint provider for Linter', function () {
  var linterProvider = _srcMain2['default'].provideLinter();
  var lint = linterProvider.lint;

  (0, _jasmineFix.beforeEach)(_asyncToGenerator(function* () {
    atom.config.set('linter-eslint.disableFSCache', false);
    atom.config.set('linter-eslint.disableEslintIgnore', true);

    // Activate the JavaScript language so Atom knows what the files are
    yield atom.packages.activatePackage('language-javascript');
    // Activate the provider
    yield atom.packages.activatePackage('linter-eslint');
  }));

  describe('checks bad.js and', function () {
    var editor = null;
    (0, _jasmineFix.beforeEach)(_asyncToGenerator(function* () {
      editor = yield atom.workspace.open(paths.bad);
    }));

    (0, _jasmineFix.it)('verifies the messages', _asyncToGenerator(function* () {
      var messages = yield lint(editor);
      expect(messages.length).toBe(2);

      var expected0 = "'foo' is not defined. (no-undef)";
      var expected0Url = 'https://eslint.org/docs/rules/no-undef';
      var expected1 = 'Extra semicolon. (semi)';
      var expected1Url = 'https://eslint.org/docs/rules/semi';

      expect(messages[0].severity).toBe('error');
      expect(messages[0].excerpt).toBe(expected0);
      expect(messages[0].url).toBe(expected0Url);
      expect(messages[0].location.file).toBe(paths.bad);
      expect(messages[0].location.position).toEqual([[0, 0], [0, 3]]);
      expect(messages[0].solutions).not.toBeDefined();

      expect(messages[1].severity).toBe('error');
      expect(messages[1].excerpt).toBe(expected1);
      expect(messages[1].url).toBe(expected1Url);
      expect(messages[1].location.file).toBe(paths.bad);
      expect(messages[1].location.position).toEqual([[0, 8], [0, 9]]);
      expect(messages[1].solutions.length).toBe(1);
      expect(messages[1].solutions[0].position).toEqual([[0, 6], [0, 9]]);
      expect(messages[1].solutions[0].replaceWith).toBe('42');
    }));
  });

  (0, _jasmineFix.it)('finds nothing wrong with an empty file', _asyncToGenerator(function* () {
    var editor = yield atom.workspace.open(paths.empty);
    var messages = yield lint(editor);

    expect(messages.length).toBe(0);
  }));

  (0, _jasmineFix.it)('finds nothing wrong with a valid file', _asyncToGenerator(function* () {
    var editor = yield atom.workspace.open(paths.good);
    var messages = yield lint(editor);

    expect(messages.length).toBe(0);
  }));

  (0, _jasmineFix.it)('reports the fixes for fixable errors', _asyncToGenerator(function* () {
    var editor = yield atom.workspace.open(paths.fix);
    var messages = yield lint(editor);

    expect(messages[0].solutions[0].position).toEqual([[0, 10], [1, 8]]);
    expect(messages[0].solutions[0].replaceWith).toBe('6\nfunction');

    expect(messages[1].solutions[0].position).toEqual([[2, 0], [2, 1]]);
    expect(messages[1].solutions[0].replaceWith).toBe('  ');
  }));

  describe('when resolving import paths using eslint-plugin-import', function () {
    (0, _jasmineFix.it)('correctly resolves imports from parent', _asyncToGenerator(function* () {
      var editor = yield atom.workspace.open(paths.importing);
      var messages = yield lint(editor);

      expect(messages.length).toBe(0);
    }));

    (0, _jasmineFix.it)('shows a message for an invalid import', _asyncToGenerator(function* () {
      var editor = yield atom.workspace.open(paths.badImport);
      var messages = yield lint(editor);
      var expected = "Unable to resolve path to module '../nonexistent'. (import/no-unresolved)";
      var expectedUrl = 'https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/no-unresolved.md';

      expect(messages.length).toBe(1);
      expect(messages[0].severity).toBe('error');
      expect(messages[0].excerpt).toBe(expected);
      expect(messages[0].url).toBe(expectedUrl);
      expect(messages[0].location.file).toBe(paths.badImport);
      expect(messages[0].location.position).toEqual([[0, 24], [0, 40]]);
      expect(messages[0].solutions).not.toBeDefined();
    }));
  });

  describe('when a file is specified in an .eslintignore file', function () {
    (0, _jasmineFix.beforeEach)(function () {
      atom.config.set('linter-eslint.disableEslintIgnore', false);
    });

    (0, _jasmineFix.it)('will not give warnings when linting the file', _asyncToGenerator(function* () {
      var editor = yield atom.workspace.open(paths.ignored);
      var messages = yield lint(editor);

      expect(messages.length).toBe(0);
    }));

    (0, _jasmineFix.it)('will not give warnings when autofixing the file', _asyncToGenerator(function* () {
      var editor = yield atom.workspace.open(paths.ignored);
      atom.commands.dispatch(atom.views.getView(editor), 'linter-eslint:fix-file');
      var expectedMessage = 'Linter-ESLint: Fix complete.';
      var notification = yield getNotification(expectedMessage);

      expect(notification.getMessage()).toBe(expectedMessage);
    }));
  });

  describe('when a file is not specified in .eslintignore file', _asyncToGenerator(function* () {
    (0, _jasmineFix.it)('will give warnings when linting the file', _asyncToGenerator(function* () {
      var tempPath = yield copyFileToTempDir(path.join(paths.eslintignoreDir, 'ignored.js'));
      var tempDir = path.dirname(tempPath);

      var editor = yield atom.workspace.open(tempPath);
      atom.config.set('linter-eslint.disableEslintIgnore', false);
      yield copyFileToDir(path.join(paths.eslintignoreDir, '.eslintrc.yaml'), tempDir);

      var messages = yield lint(editor);
      expect(messages.length).toBe(1);
      _rimraf2['default'].sync(tempDir);
    }));
  }));

  describe('when a file is specified in an eslintIgnore key in package.json', function () {
    (0, _jasmineFix.it)('will still lint the file if an .eslintignore file is present', _asyncToGenerator(function* () {
      atom.config.set('linter-eslint.disableEslintIgnore', false);
      var editor = yield atom.workspace.open(path.join(paths.eslintIgnoreKeyDir, 'ignored.js'));
      var messages = yield lint(editor);

      expect(messages.length).toBe(1);
    }));

    (0, _jasmineFix.it)('will not give warnings when linting the file', _asyncToGenerator(function* () {
      var tempPath = yield copyFileToTempDir(path.join(paths.eslintIgnoreKeyDir, 'ignored.js'));
      var tempDir = path.dirname(tempPath);

      var editor = yield atom.workspace.open(tempPath);
      atom.config.set('linter-eslint.disableEslintIgnore', false);
      yield copyFileToDir(path.join(paths.eslintIgnoreKeyDir, 'package.json'), tempDir);

      var messages = yield lint(editor);
      expect(messages.length).toBe(0);
      _rimraf2['default'].sync(tempDir);
    }));
  });

  describe('fixes errors', function () {
    var firstLint = _asyncToGenerator(function* (textEditor) {
      var messages = yield lint(textEditor);
      // The original file has two errors
      expect(messages.length).toBe(2);
    });

    var editor = undefined;
    var tempDir = undefined;

    (0, _jasmineFix.beforeEach)(_asyncToGenerator(function* () {
      // Copy the file to a temporary folder
      var tempFixturePath = yield copyFileToTempDir(paths.fix);
      editor = yield atom.workspace.open(tempFixturePath);
      tempDir = path.dirname(tempFixturePath);
      // Copy the config to the same temporary directory
      yield copyFileToDir(paths.config, tempDir);
    }));

    afterEach(function () {
      // Remove the temporary directory
      _rimraf2['default'].sync(tempDir);
    });

    (0, _jasmineFix.it)('should fix linting errors', _asyncToGenerator(function* () {
      yield firstLint(editor);
      yield makeFixes(editor);
      var messagesAfterFixing = yield lint(editor);

      expect(messagesAfterFixing.length).toBe(0);
    }));

    (0, _jasmineFix.it)('should not fix linting errors for rules that are disabled with rulesToDisableWhileFixing', _asyncToGenerator(function* () {
      atom.config.set('linter-eslint.rulesToDisableWhileFixing', ['semi']);

      yield firstLint(editor);
      yield makeFixes(editor);
      var messagesAfterFixing = yield lint(editor);
      var expected = 'Extra semicolon. (semi)';
      var expectedUrl = 'https://eslint.org/docs/rules/semi';

      expect(messagesAfterFixing.length).toBe(1);
      expect(messagesAfterFixing[0].excerpt).toBe(expected);
      expect(messagesAfterFixing[0].url).toBe(expectedUrl);
    }));
  });

  describe('when an eslint cache file is present', function () {
    var editor = undefined;
    var tempDir = undefined;

    (0, _jasmineFix.beforeEach)(_asyncToGenerator(function* () {
      // Copy the file to a temporary folder
      var tempFixturePath = yield copyFileToTempDir(paths.fix);
      editor = yield atom.workspace.open(tempFixturePath);
      tempDir = path.dirname(tempFixturePath);
      // Copy the config to the same temporary directory
      yield copyFileToDir(paths.config, tempDir);
    }));

    afterEach(function () {
      // Remove the temporary directory
      _rimraf2['default'].sync(tempDir);
    });

    (0, _jasmineFix.it)('does not delete the cache file when performing fixes', _asyncToGenerator(function* () {
      var tempCacheFile = yield copyFileToDir(paths.cache, tempDir);
      var checkCachefileExists = function checkCachefileExists() {
        fs.statSync(tempCacheFile);
      };
      expect(checkCachefileExists).not.toThrow();
      yield makeFixes(editor);
      expect(checkCachefileExists).not.toThrow();
    }));
  });

  describe('Ignores specified rules when editing', function () {
    var expectedPath = undefined;

    var checkNoConsole = function checkNoConsole(message) {
      var text = 'Unexpected console statement. (no-console)';
      var url = 'https://eslint.org/docs/rules/no-console';
      expect(message.severity).toBe('error');
      expect(message.excerpt).toBe(text);
      expect(message.url).toBe(url);
      expect(message.location.file).toBe(expectedPath);
      expect(message.location.position).toEqual([[0, 0], [0, 11]]);
    };

    var checkNoTrailingSpace = function checkNoTrailingSpace(message) {
      var text = 'Trailing spaces not allowed. (no-trailing-spaces)';
      var url = 'https://eslint.org/docs/rules/no-trailing-spaces';

      expect(message.severity).toBe('error');
      expect(message.excerpt).toBe(text);
      expect(message.url).toBe(url);
      expect(message.location.file).toBe(expectedPath);
      expect(message.location.position).toEqual([[1, 9], [1, 10]]);
    };

    var checkBefore = function checkBefore(messages) {
      expect(messages.length).toBe(1);
      checkNoConsole(messages[0]);
    };

    var checkNew = function checkNew(messages) {
      expect(messages.length).toBe(2);
      checkNoConsole(messages[0]);
      checkNoTrailingSpace(messages[1]);
    };

    var checkAfter = function checkAfter(messages) {
      expect(messages.length).toBe(1);
      checkNoConsole(messages[0]);
    };

    (0, _jasmineFix.it)('does nothing on saved files', _asyncToGenerator(function* () {
      atom.config.set('linter-eslint.rulesToSilenceWhileTyping', ['no-trailing-spaces']);
      atom.config.set('linter-eslint.ignoreFixableRulesWhileTyping', true);
      expectedPath = paths.modifiedIgnoreSpace;
      var editor = yield atom.workspace.open(expectedPath);
      // Run once to populate the fixable rules list
      yield lint(editor);
      // Run again for the testable results
      var messages = yield lint(editor);
      checkNew(messages);
    }));

    (0, _jasmineFix.it)('allows ignoring a specific list of rules when modified', _asyncToGenerator(function* () {
      expectedPath = paths.modifiedIgnore;
      var editor = yield atom.workspace.open(expectedPath);

      // Verify expected error before
      var firstMessages = yield lint(editor);
      checkBefore(firstMessages);

      // Insert a space into the editor
      editor.getBuffer().insert([1, 9], ' ');

      // Verify the space is showing an error
      var messages = yield lint(editor);
      checkNew(messages);

      // Enable the option under test
      atom.config.set('linter-eslint.rulesToSilenceWhileTyping', ['no-trailing-spaces']);

      // Check the lint results
      var newMessages = yield lint(editor);
      checkAfter(newMessages);
    }));

    (0, _jasmineFix.it)('allows ignoring all fixable rules while typing', _asyncToGenerator(function* () {
      expectedPath = paths.modifiedIgnore;
      var editor = yield atom.workspace.open(expectedPath);

      // Verify no error before
      var firstMessages = yield lint(editor);
      checkBefore(firstMessages);

      // Insert a space into the editor
      editor.getBuffer().insert([1, 9], ' ');

      // Verify the space is showing an error
      var messages = yield lint(editor);
      checkNew(messages);

      // Enable the option under test
      // NOTE: Depends on no-trailing-spaces being marked as fixable by ESLint
      atom.config.set('linter-eslint.ignoreFixableRulesWhileTyping', true);

      // Check the lint results
      var newMessages = yield lint(editor);
      checkAfter(newMessages);
    }));

    (0, _jasmineFix.it)('allows ignoring fixible rules from plugins while typing', _asyncToGenerator(function* () {
      expectedPath = paths.fixablePlugin;
      var editor = yield atom.workspace.open(expectedPath);

      // Verify no error before the editor is modified
      var firstMessages = yield lint(editor);
      expect(firstMessages.length).toBe(0);

      // Remove the newline between the import and console log
      editor.getBuffer().deleteRow(1);

      // Verify there is an error for the fixable import/newline-after-import rule
      var messages = yield lint(editor);
      expect(messages.length).toBe(1);
      expect(messages[0].severity).toBe('error');
      expect(messages[0].excerpt).toBe('Expected empty line after import statement not followed by another import. (import/newline-after-import)');

      // Enable the option under test
      // NOTE: Depends on mport/newline-after-import rule being marked as fixable
      atom.config.set('linter-eslint.ignoreFixableRulesWhileTyping', true);

      // Check the lint results
      var newMessages = yield lint(editor);
      expect(newMessages.length).toBe(0);
    }));
  });

  describe('prints debugging information with the `debug` command', function () {
    var editor = undefined;
    var expectedMessage = 'linter-eslint debugging information';
    (0, _jasmineFix.beforeEach)(_asyncToGenerator(function* () {
      editor = yield atom.workspace.open(paths.good);
    }));

    (0, _jasmineFix.it)('shows an info notification', _asyncToGenerator(function* () {
      atom.commands.dispatch(atom.views.getView(editor), 'linter-eslint:debug');
      var notification = yield getNotification(expectedMessage);

      expect(notification.getMessage()).toBe(expectedMessage);
      expect(notification.getType()).toEqual('info');
    }));

    (0, _jasmineFix.it)('includes debugging information in the details', _asyncToGenerator(function* () {
      atom.commands.dispatch(atom.views.getView(editor), 'linter-eslint:debug');
      var notification = yield getNotification(expectedMessage);
      var detail = notification.getDetail();

      expect(detail.includes('Atom version: ' + atom.getVersion())).toBe(true);
      expect(detail.includes('linter-eslint version:')).toBe(true);
      expect(detail.includes('Platform: ' + process.platform)).toBe(true);
      expect(detail.includes('linter-eslint configuration:')).toBe(true);
      expect(detail.includes('Using local project ESLint')).toBe(true);
    }));
  });

  (0, _jasmineFix.it)('handles ranges in messages', _asyncToGenerator(function* () {
    var editor = yield atom.workspace.open(paths.endRange);
    var messages = yield lint(editor);
    var expected = 'Unreachable code. (no-unreachable)';
    var expectedUrl = 'https://eslint.org/docs/rules/no-unreachable';

    expect(messages[0].severity).toBe('error');
    expect(messages[0].excerpt).toBe(expected);
    expect(messages[0].url).toBe(expectedUrl);
    expect(messages[0].location.file).toBe(paths.endRange);
    expect(messages[0].location.position).toEqual([[5, 2], [6, 15]]);
  }));

  describe('when setting `disableWhenNoEslintConfig` is false', function () {
    var editor = undefined;
    var tempFilePath = undefined;
    var tempFixtureDir = undefined;

    (0, _jasmineFix.beforeEach)(_asyncToGenerator(function* () {
      atom.config.set('linter-eslint.disableWhenNoEslintConfig', false);

      tempFilePath = yield copyFileToTempDir(paths.badInline);
      editor = yield atom.workspace.open(tempFilePath);
      tempFixtureDir = path.dirname(tempFilePath);
    }));

    afterEach(function () {
      _rimraf2['default'].sync(tempFixtureDir);
    });

    (0, _jasmineFix.it)('errors when no config file is found', _asyncToGenerator(function* () {
      var messages = yield lint(editor);
      var expected = 'Error while running ESLint: No ESLint configuration found..';
      var description = '<div style="white-space: pre-wrap">No ESLint configuration found.\n<hr />Error: No ESLint configuration found.\n    at Config.getLocalConfigHierarchy';
      // The rest of the description includes paths specific to the computer running it
      expect(messages.length).toBe(1);
      expect(messages[0].severity).toBe('error');
      expect(messages[0].excerpt).toBe(expected);
      expect(messages[0].description.startsWith(description)).toBe(true);
      expect(messages[0].url).not.toBeDefined();
      expect(messages[0].location.file).toBe(tempFilePath);
      expect(messages[0].location.position).toEqual([[0, 0], [0, 28]]);
    }));
  });

  describe('when `disableWhenNoEslintConfig` is true', function () {
    var editor = undefined;
    var tempFixtureDir = undefined;

    (0, _jasmineFix.beforeEach)(_asyncToGenerator(function* () {
      atom.config.set('linter-eslint.disableWhenNoEslintConfig', true);

      var tempFilePath = yield copyFileToTempDir(paths.badInline);
      editor = yield atom.workspace.open(tempFilePath);
      tempFixtureDir = path.dirname(tempFilePath);
    }));

    afterEach(function () {
      _rimraf2['default'].sync(tempFixtureDir);
    });

    (0, _jasmineFix.it)('does not report errors when no config file is found', _asyncToGenerator(function* () {
      var messages = yield lint(editor);

      expect(messages.length).toBe(0);
    }));
  });

  describe('lets ESLint handle configuration', function () {
    (0, _jasmineFix.it)('works when the cache fails', _asyncToGenerator(function* () {
      // Ensure the cache is enabled, since we will be taking advantage of
      // a failing in it's operation
      atom.config.set('linter-eslint.disableFSCache', false);
      var fooPath = path.join(paths.badCache, 'temp', 'foo.js');
      var newConfigPath = path.join(paths.badCache, 'temp', '.eslintrc.js');
      var editor = yield atom.workspace.open(fooPath);
      function undefMsg(varName) {
        return '\'' + varName + '\' is not defined. (no-undef)';
      }
      var expectedUrl = 'https://eslint.org/docs/rules/no-undef';

      // Trigger a first lint to warm up the cache with the first config result
      var messages = yield lint(editor);
      expect(messages.length).toBe(2);
      expect(messages[0].severity).toBe('error');
      expect(messages[0].excerpt).toBe(undefMsg('console'));
      expect(messages[0].url).toBe(expectedUrl);
      expect(messages[0].location.file).toBe(fooPath);
      expect(messages[0].location.position).toEqual([[1, 2], [1, 9]]);
      expect(messages[1].severity).toBe('error');
      expect(messages[1].excerpt).toBe(undefMsg('bar'));
      expect(messages[1].url).toBe(expectedUrl);
      expect(messages[1].location.file).toBe(fooPath);
      expect(messages[1].location.position).toEqual([[1, 14], [1, 17]]);

      // Write the new configuration file
      var newConfig = {
        env: {
          browser: true
        }
      };
      var configContents = 'module.exports = ' + JSON.stringify(newConfig, null, 2) + '\n';
      fs.writeFileSync(newConfigPath, configContents);

      // Lint again, ESLint should recognise the new configuration
      // The cached config results are still pointing at the _parent_ file. ESLint
      // would partially handle this situation if the config file was specified
      // from the cache.
      messages = yield lint(editor);
      expect(messages.length).toBe(1);
      expect(messages[0].severity).toBe('error');
      expect(messages[0].excerpt).toBe(undefMsg('bar'));
      expect(messages[0].url).toBe(expectedUrl);
      expect(messages[0].location.file).toBe(fooPath);
      expect(messages[0].location.position).toEqual([[1, 14], [1, 17]]);

      // Update the configuration
      newConfig.rules = {
        'no-undef': 'off'
      };
      configContents = 'module.exports = ' + JSON.stringify(newConfig, null, 2) + '\n';
      fs.writeFileSync(newConfigPath, configContents);

      // Lint again, if the cache was specifying the file ESLint at this point
      // would fail to update the configuration fully, and would still report a
      // no-undef error.
      messages = yield lint(editor);
      expect(messages.length).toBe(0);

      // Delete the temporary configuration file
      fs.unlinkSync(newConfigPath);
    }));
  });

  describe('works with HTML files', function () {
    var embeddedScope = 'source.js.embedded.html';
    var scopes = linterProvider.grammarScopes;

    (0, _jasmineFix.it)('adds the HTML scope when the setting is enabled', function () {
      expect(scopes.includes(embeddedScope)).toBe(false);
      atom.config.set('linter-eslint.lintHtmlFiles', true);
      expect(scopes.includes(embeddedScope)).toBe(true);
      atom.config.set('linter-eslint.lintHtmlFiles', false);
      expect(scopes.includes(embeddedScope)).toBe(false);
    });

    (0, _jasmineFix.it)('keeps the HTML scope with custom scopes', function () {
      expect(scopes.includes(embeddedScope)).toBe(false);
      atom.config.set('linter-eslint.lintHtmlFiles', true);
      expect(scopes.includes(embeddedScope)).toBe(true);
      atom.config.set('linter-eslint.scopes', ['foo.bar']);
      expect(scopes.includes(embeddedScope)).toBe(true);
    });
  });

  describe('handles the Show Rule ID in Messages option', function () {
    var expectedUrl = 'https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/no-unresolved.md';

    (0, _jasmineFix.it)('shows the rule ID when enabled', _asyncToGenerator(function* () {
      atom.config.set('linter-eslint.showRuleIdInMessage', true);
      var editor = yield atom.workspace.open(paths.badImport);
      var messages = yield lint(editor);
      var expected = "Unable to resolve path to module '../nonexistent'. (import/no-unresolved)";

      expect(messages.length).toBe(1);
      expect(messages[0].severity).toBe('error');
      expect(messages[0].excerpt).toBe(expected);
      expect(messages[0].url).toBe(expectedUrl);
      expect(messages[0].location.file).toBe(paths.badImport);
      expect(messages[0].location.position).toEqual([[0, 24], [0, 40]]);
      expect(messages[0].solutions).not.toBeDefined();
    }));

    (0, _jasmineFix.it)("doesn't show the rule ID when disabled", _asyncToGenerator(function* () {
      atom.config.set('linter-eslint.showRuleIdInMessage', false);
      var editor = yield atom.workspace.open(paths.badImport);
      var messages = yield lint(editor);
      var expected = "Unable to resolve path to module '../nonexistent'.";

      expect(messages.length).toBe(1);
      expect(messages[0].severity).toBe('error');
      expect(messages[0].excerpt).toBe(expected);
      expect(messages[0].url).toBe(expectedUrl);
      expect(messages[0].location.file).toBe(paths.badImport);
      expect(messages[0].location.position).toEqual([[0, 24], [0, 40]]);
      expect(messages[0].solutions).not.toBeDefined();
    }));
  });

  describe("registers an 'ESLint Fix' right click menu command", function () {
    // NOTE: Reaches into the private data of the ContextMenuManager, there is
    // no public method to check this though so...
    expect(atom.contextMenu.itemSets.some(function (itemSet) {
      return(
        // Matching selector...
        itemSet.selector === 'atom-text-editor:not(.mini), .overlayer' && itemSet.items.some(function (item) {
          return(
            // Matching command...
            item.command === 'linter-eslint:fix-file' &&
            // Matching label
            item.label === 'ESLint Fix' &&
            // And has a function controlling display
            typeof item.shouldDisplay === 'function'
          );
        })
      );
    }));
  });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1Ly5hdG9tL3BhY2thZ2VzL2xpbnRlci1lc2xpbnQvc3BlYy9saW50ZXItZXNsaW50LXNwZWMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0lBNkRzQixpQkFBaUIscUJBQWhDLFdBQWlDLGNBQWMsRUFBRTtBQUN0RCxNQUFNLGNBQWMsR0FBRyxFQUFFLENBQUMsV0FBVyxDQUFDLGlCQUFRLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFBO0FBQzFELFNBQU8sYUFBYSxDQUFDLGNBQWMsRUFBRSxjQUFjLENBQUMsQ0FBQTtDQUNyRDs7OztJQUVjLGVBQWUscUJBQTlCLFdBQStCLGVBQWUsRUFBRTtBQUM5QyxTQUFPLElBQUksT0FBTyxDQUFDLFVBQUMsT0FBTyxFQUFLO0FBQzlCLFFBQUksZUFBZSxZQUFBLENBQUE7QUFDbkIsUUFBTSxlQUFlLEdBQUcsU0FBbEIsZUFBZSxDQUFJLFlBQVksRUFBSztBQUN4QyxVQUFJLFlBQVksQ0FBQyxVQUFVLEVBQUUsS0FBSyxlQUFlLEVBQUU7Ozs7QUFJakQsZUFBTTtPQUNQOztBQUVELHFCQUFlLENBQUMsT0FBTyxFQUFFLENBQUE7QUFDekIsYUFBTyxDQUFDLFlBQVksQ0FBQyxDQUFBO0tBQ3RCLENBQUE7O0FBRUQsbUJBQWUsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLG9CQUFvQixDQUFDLGVBQWUsQ0FBQyxDQUFBO0dBQzNFLENBQUMsQ0FBQTtDQUNIOztJQUVjLFNBQVMscUJBQXhCLFdBQXlCLFVBQVUsRUFBRTtBQUNuQyxTQUFPLElBQUksT0FBTyxtQkFBQyxXQUFPLE9BQU8sRUFBSzs7QUFFcEMsUUFBTSxlQUFlLEdBQUcsVUFBVSxDQUFDLFNBQVMsRUFBRSxDQUFDLFdBQVcsbUJBQUMsYUFBWTtBQUNyRSxxQkFBZSxDQUFDLE9BQU8sRUFBRSxDQUFBOzs7QUFHekIsYUFBTyxFQUFFLENBQUE7S0FDVixFQUFDLENBQUE7OztBQUdGLFFBQUksQ0FBQyxR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QVksR0FBRyx3Q0FBd0MsQ0FBQTtBQUM3RCxVQUFNLFNBQVMsR0FBRyx5QkFBeUIsQ0FBQTtBQUMzQyxVQUFNLFlBQVksR0FBRyxvQ0FBb0MsQ0FBQTs7QUFFekQsWUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUE7QUFDMUMsWUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUE7QUFDM0MsWUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUE7QUFDMUMsWUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQTtBQUNqRCxZQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7QUFDL0QsWUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLENBQUE7O0FBRS9DLFlBQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFBO0FBQzFDLFlBQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFBO0FBQzNDLFlBQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FB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QU8sQ0FBQyxDQUFBO0FBQzFDLFlBQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFBO0FBQ3JELFlBQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFBO0FBQ3pDLFlBQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQTtBQUMvQyxZQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7QUFDL0QsWUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUE7QUFDMUMsWUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUE7QUFDakQsWUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUE7QUFDekMsWUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFBO0FBQy9DLFlBQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FB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YWdlcy9saW50ZXItZXNsaW50L3NwZWMvbGludGVyLWVzbGludC1zcGVjLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCdcblxuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJ1xuaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMnXG5pbXBvcnQgeyB0bXBkaXIgfSBmcm9tICdvcydcbmltcG9ydCByaW1yYWYgZnJvbSAncmltcmFmJ1xuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVudXNlZC12YXJzXG5pbXBvcnQgeyBiZWZvcmVFYWNoLCBpdCwgZml0IH0gZnJvbSAnamFzbWluZS1maXgnXG5pbXBvcnQgbGludGVyRXNsaW50IGZyb20gJy4uL3NyYy9tYWluJ1xuXG5jb25zdCBmaXh0dXJlc0RpciA9IHBhdGguam9pbihfX2Rpcm5hbWUsICdmaXh0dXJlcycpXG5cbmNvbnN0IGZpeHR1cmVzID0ge1xuICBnb29kOiBbJ2ZpbGVzJywgJ2dvb2QuanMnXSxcbiAgYmFkOiBbJ2ZpbGVzJywgJ2JhZC5qcyddLFxuICBiYWRJbmxpbmU6IFsnZmlsZXMnLCAnYmFkSW5saW5lLmpzJ10sXG4gIGVtcHR5OiBbJ2ZpbGVzJywgJ2VtcHR5LmpzJ10sXG4gIGZpeDogWydmaWxlcycsICdmaXguanMnXSxcbiAgY2FjaGU6IFsnZmlsZXMnLCAnLmVzbGludGNhY2hlJ10sXG4gIGNvbmZpZzogWydjb25maWdzJywgJy5lc2xpbnRyYy55bWwnXSxcbiAgaWdub3JlZDogWydlc2xpbnRpZ25vcmUnLCAnaWdub3JlZC5qcyddLFxuICBlbmRSYW5nZTogWydlbmQtcmFuZ2UnLCAnbm8tdW5yZWFjaGFibGUuanMnXSxcbiAgYmFkQ2FjaGU6IFsnYmFkQ2FjaGUnXSxcbiAgbW9kaWZpZWRJZ25vcmU6IFsnbW9kaWZpZWQtaWdub3JlLXJ1bGUnLCAnZm9vLmpzJ10sXG4gIG1vZGlmaWVkSWdub3JlU3BhY2U6IFsnbW9kaWZpZWQtaWdub3JlLXJ1bGUnLCAnZm9vLXNwYWNlLmpzJ10sXG4gIGltcG9ydGluZzogWydpbXBvcnQtcmVzb2x1dGlvbicsICduZXN0ZWQnLCAnaW1wb3J0aW5nLmpzJ10sXG4gIGJhZEltcG9ydDogWydpbXBvcnQtcmVzb2x1dGlvbicsICduZXN0ZWQnLCAnYmFkSW1wb3J0LmpzJ10sXG4gIGZpeGFibGVQbHVnaW46IFsncGx1Z2luLWltcG9ydCcsICdsaWZlLmpzJ10sXG4gIGVzbGludGlnbm9yZURpcjogWydlc2xpbnRpZ25vcmUnXSxcbiAgZXNsaW50SWdub3JlS2V5RGlyOiBbJ2NvbmZpZ3MnLCAnZXNsaW50aWdub3Jla2V5J11cbn1cblxuY29uc3QgcGF0aHMgPSBPYmplY3Qua2V5cyhmaXh0dXJlcylcbiAgLnJlZHVjZSgoYWNjdW11bGF0b3IsIGZpeHR1cmUpID0+IHtcbiAgICBjb25zdCBhY2MgPSBhY2N1bXVsYXRvclxuICAgIGFjY1tmaXh0dXJlXSA9IHBhdGguam9pbihmaXh0dXJlc0RpciwgLi4uKGZpeHR1cmVzW2ZpeHR1cmVdKSlcbiAgICByZXR1cm4gYWNjXG4gIH0sIHt9KVxuXG4vKipcbiAqIEFzeW5jIGhlbHBlciB0byBjb3B5IGEgZmlsZSBmcm9tIG9uZSBwbGFjZSB0byBhbm90aGVyIG9uIHRoZSBmaWxlc3lzdGVtLlxuICogQHBhcmFtICB7c3RyaW5nfSBmaWxlVG9Db3B5UGF0aCAgUGF0aCBvZiB0aGUgZmlsZSB0byBiZSBjb3BpZWRcbiAqIEBwYXJhbSAge3N0cmluZ30gZGVzdGluYXRpb25EaXIgIERpcmVjdG9yeSB0byBwYXN0ZSB0aGUgZmlsZSBpbnRvXG4gKiBAcmV0dXJuIHtzdHJpbmd9ICAgICAgICAgICAgICAgICBGdWxsIHBhdGggb2YgdGhlIGZpbGUgaW4gY29weSBkZXN0aW5hdGlvblxuICovXG5mdW5jdGlvbiBjb3B5RmlsZVRvRGlyKGZpbGVUb0NvcHlQYXRoLCBkZXN0aW5hdGlvbkRpcikge1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICBjb25zdCBkZXN0aW5hdGlvblBhdGggPSBwYXRoLmpvaW4oZGVzdGluYXRpb25EaXIsIHBhdGguYmFzZW5hbWUoZmlsZVRvQ29weVBhdGgpKVxuICAgIGNvbnN0IHdzID0gZnMuY3JlYXRlV3JpdGVTdHJlYW0oZGVzdGluYXRpb25QYXRoKVxuICAgIHdzLm9uKCdjbG9zZScsICgpID0+IHJlc29sdmUoZGVzdGluYXRpb25QYXRoKSlcbiAgICBmcy5jcmVhdGVSZWFkU3RyZWFtKGZpbGVUb0NvcHlQYXRoKS5waXBlKHdzKVxuICB9KVxufVxuXG4vKipcbiAqIFV0aWxpdHkgaGVscGVyIHRvIGNvcHkgYSBmaWxlIGludG8gdGhlIE9TIHRlbXAgZGlyZWN0b3J5LlxuICpcbiAqIEBwYXJhbSAge3N0cmluZ30gZmlsZVRvQ29weVBhdGggIFBhdGggb2YgdGhlIGZpbGUgdG8gYmUgY29waWVkXG4gKiBAcmV0dXJuIHtzdHJpbmd9ICAgICAgICAgICAgICAgICBGdWxsIHBhdGggb2YgdGhlIGZpbGUgaW4gY29weSBkZXN0aW5hdGlvblxuICovXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgaW1wb3J0L3ByZWZlci1kZWZhdWx0LWV4cG9ydFxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNvcHlGaWxlVG9UZW1wRGlyKGZpbGVUb0NvcHlQYXRoKSB7XG4gIGNvbnN0IHRlbXBGaXh0dXJlRGlyID0gZnMubWtkdGVtcFN5bmModG1wZGlyKCkgKyBwYXRoLnNlcClcbiAgcmV0dXJuIGNvcHlGaWxlVG9EaXIoZmlsZVRvQ29weVBhdGgsIHRlbXBGaXh0dXJlRGlyKVxufVxuXG5hc3luYyBmdW5jdGlvbiBnZXROb3RpZmljYXRpb24oZXhwZWN0ZWRNZXNzYWdlKSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgIGxldCBub3RpZmljYXRpb25TdWJcbiAgICBjb25zdCBuZXdOb3RpZmljYXRpb24gPSAobm90aWZpY2F0aW9uKSA9PiB7XG4gICAgICBpZiAobm90aWZpY2F0aW9uLmdldE1lc3NhZ2UoKSAhPT0gZXhwZWN0ZWRNZXNzYWdlKSB7XG4gICAgICAgIC8vIEFzIHRoZSBzcGVjcyBleGVjdXRlIGFzeW5jaHJvbm91c2x5LCBpdCdzIHBvc3NpYmxlIGEgbm90aWZpY2F0aW9uXG4gICAgICAgIC8vIGZyb20gYSBkaWZmZXJlbnQgc3BlYyB3YXMgZ3JhYmJlZCwgaWYgdGhlIG1lc3NhZ2UgZG9lc24ndCBtYXRjaCB3aGF0XG4gICAgICAgIC8vIGlzIGV4cGVjdGVkIHNpbXBseSByZXR1cm4gYW5kIGtlZXAgd2FpdGluZyBmb3IgdGhlIG5leHQgbWVzc2FnZS5cbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICAvLyBEaXNwb3NlIG9mIHRoZSBub3RpZmljYWl0b24gc3Vic2NyaXB0aW9uXG4gICAgICBub3RpZmljYXRpb25TdWIuZGlzcG9zZSgpXG4gICAgICByZXNvbHZlKG5vdGlmaWNhdGlvbilcbiAgICB9XG4gICAgLy8gU3Vic2NyaWJlIHRvIEF0b20ncyBub3RpZmljYXRpb25zXG4gICAgbm90aWZpY2F0aW9uU3ViID0gYXRvbS5ub3RpZmljYXRpb25zLm9uRGlkQWRkTm90aWZpY2F0aW9uKG5ld05vdGlmaWNhdGlvbilcbiAgfSlcbn1cblxuYXN5bmMgZnVuY3Rpb24gbWFrZUZpeGVzKHRleHRFZGl0b3IpIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKGFzeW5jIChyZXNvbHZlKSA9PiB7XG4gICAgLy8gU3Vic2NyaWJlIHRvIHRoZSBmaWxlIHJlbG9hZCBldmVudFxuICAgIGNvbnN0IGVkaXRvclJlbG9hZFN1YiA9IHRleHRFZGl0b3IuZ2V0QnVmZmVyKCkub25EaWRSZWxvYWQoYXN5bmMgKCkgPT4ge1xuICAgICAgZWRpdG9yUmVsb2FkU3ViLmRpc3Bvc2UoKVxuICAgICAgLy8gRmlsZSBoYXMgYmVlbiByZWxvYWRlZCBpbiBBdG9tLCBub3RpZmljYXRpb24gY2hlY2tpbmcgd2lsbCBoYXBwZW5cbiAgICAgIC8vIGFzeW5jIGVpdGhlciB3YXksIGJ1dCBzaG91bGQgYWxyZWFkeSBiZSBmaW5pc2hlZCBhdCB0aGlzIHBvaW50XG4gICAgICByZXNvbHZlKClcbiAgICB9KVxuXG4gICAgLy8gTm93IHRoYXQgYWxsIHRoZSByZXF1aXJlZCBzdWJzY3JpcHRpb25zIGFyZSBhY3RpdmUsIHNlbmQgb2ZmIGEgZml4IHJlcXVlc3RcbiAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKGF0b20udmlld3MuZ2V0Vmlldyh0ZXh0RWRpdG9yKSwgJ2xpbnRlci1lc2xpbnQ6Zml4LWZpbGUnKVxuICAgIGNvbnN0IGV4cGVjdGVkTWVzc2FnZSA9ICdMaW50ZXItRVNMaW50OiBGaXggY29tcGxldGUuJ1xuICAgIGNvbnN0IG5vdGlmaWNhdGlvbiA9IGF3YWl0IGdldE5vdGlmaWNhdGlvbihleHBlY3RlZE1lc3NhZ2UpXG5cbiAgICBleHBlY3Qobm90aWZpY2F0aW9uLmdldE1lc3NhZ2UoKSkudG9CZShleHBlY3RlZE1lc3NhZ2UpXG4gICAgZXhwZWN0KG5vdGlmaWNhdGlvbi5nZXRUeXBlKCkpLnRvQmUoJ3N1Y2Nlc3MnKVxuICB9KVxufVxuXG5kZXNjcmliZSgnVGhlIGVzbGludCBwcm92aWRlciBmb3IgTGludGVyJywgKCkgPT4ge1xuICBjb25zdCBsaW50ZXJQcm92aWRlciA9IGxpbnRlckVzbGludC5wcm92aWRlTGludGVyKClcbiAgY29uc3QgeyBsaW50IH0gPSBsaW50ZXJQcm92aWRlclxuXG4gIGJlZm9yZUVhY2goYXN5bmMgKCkgPT4ge1xuICAgIGF0b20uY29uZmlnLnNldCgnbGludGVyLWVzbGludC5kaXNhYmxlRlNDYWNoZScsIGZhbHNlKVxuICAgIGF0b20uY29uZmlnLnNldCgnbGludGVyLWVzbGludC5kaXNhYmxlRXNsaW50SWdub3JlJywgdHJ1ZSlcblxuICAgIC8vIEFjdGl2YXRlIHRoZSBKYXZhU2NyaXB0IGxhbmd1YWdlIHNvIEF0b20ga25vd3Mgd2hhdCB0aGUgZmlsZXMgYXJlXG4gICAgYXdhaXQgYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoJ2xhbmd1YWdlLWphdmFzY3JpcHQnKVxuICAgIC8vIEFjdGl2YXRlIHRoZSBwcm92aWRlclxuICAgIGF3YWl0IGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKCdsaW50ZXItZXNsaW50JylcbiAgfSlcblxuICBkZXNjcmliZSgnY2hlY2tzIGJhZC5qcyBhbmQnLCAoKSA9PiB7XG4gICAgbGV0IGVkaXRvciA9IG51bGxcbiAgICBiZWZvcmVFYWNoKGFzeW5jICgpID0+IHtcbiAgICAgIGVkaXRvciA9IGF3YWl0IGF0b20ud29ya3NwYWNlLm9wZW4ocGF0aHMuYmFkKVxuICAgIH0pXG5cbiAgICBpdCgndmVyaWZpZXMgdGhlIG1lc3NhZ2VzJywgYXN5bmMgKCkgPT4ge1xuICAgICAgY29uc3QgbWVzc2FnZXMgPSBhd2FpdCBsaW50KGVkaXRvcilcbiAgICAgIGV4cGVjdChtZXNzYWdlcy5sZW5ndGgpLnRvQmUoMilcblxuICAgICAgY29uc3QgZXhwZWN0ZWQwID0gXCInZm9vJyBpcyBub3QgZGVmaW5lZC4gKG5vLXVuZGVmKVwiXG4gICAgICBjb25zdCBleHBlY3RlZDBVcmwgPSAnaHR0cHM6Ly9lc2xpbnQub3JnL2RvY3MvcnVsZXMvbm8tdW5kZWYnXG4gICAgICBjb25zdCBleHBlY3RlZDEgPSAnRXh0cmEgc2VtaWNvbG9uLiAoc2VtaSknXG4gICAgICBjb25zdCBleHBlY3RlZDFVcmwgPSAnaHR0cHM6Ly9lc2xpbnQub3JnL2RvY3MvcnVsZXMvc2VtaSdcblxuICAgICAgZXhwZWN0KG1lc3NhZ2VzWzBdLnNldmVyaXR5KS50b0JlKCdlcnJvcicpXG4gICAgICBleHBlY3QobWVzc2FnZXNbMF0uZXhjZXJwdCkudG9CZShleHBlY3RlZDApXG4gICAgICBleHBlY3QobWVzc2FnZXNbMF0udXJsKS50b0JlKGV4cGVjdGVkMFVybClcbiAgICAgIGV4cGVjdChtZXNzYWdlc1swXS5sb2NhdGlvbi5maWxlKS50b0JlKHBhdGhzLmJhZClcbiAgICAgIGV4cGVjdChtZXNzYWdlc1swXS5sb2NhdGlvbi5wb3NpdGlvbikudG9FcXVhbChbWzAsIDBdLCBbMCwgM11dKVxuICAgICAgZXhwZWN0KG1lc3NhZ2VzWzBdLnNvbHV0aW9ucykubm90LnRvQmVEZWZpbmVkKClcblxuICAgICAgZXhwZWN0KG1lc3NhZ2VzWzFdLnNldmVyaXR5KS50b0JlKCdlcnJvcicpXG4gICAgICBleHBlY3QobWVzc2FnZXNbMV0uZXhjZXJwdCkudG9CZShleHBlY3RlZDEpXG4gICAgICBleHBlY3QobWVzc2FnZXNbMV0udXJsKS50b0JlKGV4cGVjdGVkMVVybClcbiAgICAgIGV4cGVjdChtZXNzYWdlc1sxXS5sb2NhdGlvbi5maWxlKS50b0JlKHBhdGhzLmJhZClcbiAgICAgIGV4cGVjdChtZXNzYWdlc1sxXS5sb2NhdGlvbi5wb3NpdGlvbikudG9FcXVhbChbWzAsIDhdLCBbMCwgOV1dKVxuICAgICAgZXhwZWN0KG1lc3NhZ2VzWzFdLnNvbHV0aW9ucy5sZW5ndGgpLnRvQmUoMSlcbiAgICAgIGV4cGVjdChtZXNzYWdlc1sxXS5zb2x1dGlvbnNbMF0ucG9zaXRpb24pLnRvRXF1YWwoW1swLCA2XSwgWzAsIDldXSlcbiAgICAgIGV4cGVjdChtZXNzYWdlc1sxXS5zb2x1dGlvbnNbMF0ucmVwbGFjZVdpdGgpLnRvQmUoJzQyJylcbiAgICB9KVxuICB9KVxuXG4gIGl0KCdmaW5kcyBub3RoaW5nIHdyb25nIHdpdGggYW4gZW1wdHkgZmlsZScsIGFzeW5jICgpID0+IHtcbiAgICBjb25zdCBlZGl0b3IgPSBhd2FpdCBhdG9tLndvcmtzcGFjZS5vcGVuKHBhdGhzLmVtcHR5KVxuICAgIGNvbnN0IG1lc3NhZ2VzID0gYXdhaXQgbGludChlZGl0b3IpXG5cbiAgICBleHBlY3QobWVzc2FnZXMubGVuZ3RoKS50b0JlKDApXG4gIH0pXG5cbiAgaXQoJ2ZpbmRzIG5vdGhpbmcgd3Jvbmcgd2l0aCBhIHZhbGlkIGZpbGUnLCBhc3luYyAoKSA9PiB7XG4gICAgY29uc3QgZWRpdG9yID0gYXdhaXQgYXRvbS53b3Jrc3BhY2Uub3BlbihwYXRocy5nb29kKVxuICAgIGNvbnN0IG1lc3NhZ2VzID0gYXdhaXQgbGludChlZGl0b3IpXG5cbiAgICBleHBlY3QobWVzc2FnZXMubGVuZ3RoKS50b0JlKDApXG4gIH0pXG5cbiAgaXQoJ3JlcG9ydHMgdGhlIGZpeGVzIGZvciBmaXhhYmxlIGVycm9ycycsIGFzeW5jICgpID0+IHtcbiAgICBjb25zdCBlZGl0b3IgPSBhd2FpdCBhdG9tLndvcmtzcGFjZS5vcGVuKHBhdGhzLmZpeClcbiAgICBjb25zdCBtZXNzYWdlcyA9IGF3YWl0IGxpbnQoZWRpdG9yKVxuXG4gICAgZXhwZWN0KG1lc3NhZ2VzWzBdLnNvbHV0aW9uc1swXS5wb3NpdGlvbikudG9FcXVhbChbWzAsIDEwXSwgWzEsIDhdXSlcbiAgICBleHBlY3QobWVzc2FnZXNbMF0uc29sdXRpb25zWzBdLnJlcGxhY2VXaXRoKS50b0JlKCc2XFxuZnVuY3Rpb24nKVxuXG4gICAgZXhwZWN0KG1lc3NhZ2VzWzFdLnNvbHV0aW9uc1swXS5wb3NpdGlvbikudG9FcXVhbChbWzIsIDBdLCBbMiwgMV1dKVxuICAgIGV4cGVjdChtZXNzYWdlc1sxXS5zb2x1dGlvbnNbMF0ucmVwbGFjZVdpdGgpLnRvQmUoJyAgJylcbiAgfSlcblxuICBkZXNjcmliZSgnd2hlbiByZXNvbHZpbmcgaW1wb3J0IHBhdGhzIHVzaW5nIGVzbGludC1wbHVnaW4taW1wb3J0JywgKCkgPT4ge1xuICAgIGl0KCdjb3JyZWN0bHkgcmVzb2x2ZXMgaW1wb3J0cyBmcm9tIHBhcmVudCcsIGFzeW5jICgpID0+IHtcbiAgICAgIGNvbnN0IGVkaXRvciA9IGF3YWl0IGF0b20ud29ya3NwYWNlLm9wZW4ocGF0aHMuaW1wb3J0aW5nKVxuICAgICAgY29uc3QgbWVzc2FnZXMgPSBhd2FpdCBsaW50KGVkaXRvcilcblxuICAgICAgZXhwZWN0KG1lc3NhZ2VzLmxlbmd0aCkudG9CZSgwKVxuICAgIH0pXG5cbiAgICBpdCgnc2hvd3MgYSBtZXNzYWdlIGZvciBhbiBpbnZhbGlkIGltcG9ydCcsIGFzeW5jICgpID0+IHtcbiAgICAgIGNvbnN0IGVkaXRvciA9IGF3YWl0IGF0b20ud29ya3NwYWNlLm9wZW4ocGF0aHMuYmFkSW1wb3J0KVxuICAgICAgY29uc3QgbWVzc2FnZXMgPSBhd2FpdCBsaW50KGVkaXRvcilcbiAgICAgIGNvbnN0IGV4cGVjdGVkID0gXCJVbmFibGUgdG8gcmVzb2x2ZSBwYXRoIHRvIG1vZHVsZSAnLi4vbm9uZXhpc3RlbnQnLiAoaW1wb3J0L25vLXVucmVzb2x2ZWQpXCJcbiAgICAgIGNvbnN0IGV4cGVjdGVkVXJsID0gJ2h0dHBzOi8vZ2l0aHViLmNvbS9iZW5tb3NoZXIvZXNsaW50LXBsdWdpbi1pbXBvcnQvYmxvYi9tYXN0ZXIvZG9jcy9ydWxlcy9uby11bnJlc29sdmVkLm1kJ1xuXG4gICAgICBleHBlY3QobWVzc2FnZXMubGVuZ3RoKS50b0JlKDEpXG4gICAgICBleHBlY3QobWVzc2FnZXNbMF0uc2V2ZXJpdHkpLnRvQmUoJ2Vycm9yJylcbiAgICAgIGV4cGVjdChtZXNzYWdlc1swXS5leGNlcnB0KS50b0JlKGV4cGVjdGVkKVxuICAgICAgZXhwZWN0KG1lc3NhZ2VzWzBdLnVybCkudG9CZShleHBlY3RlZFVybClcbiAgICAgIGV4cGVjdChtZXNzYWdlc1swXS5sb2NhdGlvbi5maWxlKS50b0JlKHBhdGhzLmJhZEltcG9ydClcbiAgICAgIGV4cGVjdChtZXNzYWdlc1swXS5sb2NhdGlvbi5wb3NpdGlvbikudG9FcXVhbChbWzAsIDI0XSwgWzAsIDQwXV0pXG4gICAgICBleHBlY3QobWVzc2FnZXNbMF0uc29sdXRpb25zKS5ub3QudG9CZURlZmluZWQoKVxuICAgIH0pXG4gIH0pXG5cbiAgZGVzY3JpYmUoJ3doZW4gYSBmaWxlIGlzIHNwZWNpZmllZCBpbiBhbiAuZXNsaW50aWdub3JlIGZpbGUnLCAoKSA9PiB7XG4gICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICBhdG9tLmNvbmZpZy5zZXQoJ2xpbnRlci1lc2xpbnQuZGlzYWJsZUVzbGludElnbm9yZScsIGZhbHNlKVxuICAgIH0pXG5cbiAgICBpdCgnd2lsbCBub3QgZ2l2ZSB3YXJuaW5ncyB3aGVuIGxpbnRpbmcgdGhlIGZpbGUnLCBhc3luYyAoKSA9PiB7XG4gICAgICBjb25zdCBlZGl0b3IgPSBhd2FpdCBhdG9tLndvcmtzcGFjZS5vcGVuKHBhdGhzLmlnbm9yZWQpXG4gICAgICBjb25zdCBtZXNzYWdlcyA9IGF3YWl0IGxpbnQoZWRpdG9yKVxuXG4gICAgICBleHBlY3QobWVzc2FnZXMubGVuZ3RoKS50b0JlKDApXG4gICAgfSlcblxuICAgIGl0KCd3aWxsIG5vdCBnaXZlIHdhcm5pbmdzIHdoZW4gYXV0b2ZpeGluZyB0aGUgZmlsZScsIGFzeW5jICgpID0+IHtcbiAgICAgIGNvbnN0IGVkaXRvciA9IGF3YWl0IGF0b20ud29ya3NwYWNlLm9wZW4ocGF0aHMuaWdub3JlZClcbiAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goYXRvbS52aWV3cy5nZXRWaWV3KGVkaXRvciksICdsaW50ZXItZXNsaW50OmZpeC1maWxlJylcbiAgICAgIGNvbnN0IGV4cGVjdGVkTWVzc2FnZSA9ICdMaW50ZXItRVNMaW50OiBGaXggY29tcGxldGUuJ1xuICAgICAgY29uc3Qgbm90aWZpY2F0aW9uID0gYXdhaXQgZ2V0Tm90aWZpY2F0aW9uKGV4cGVjdGVkTWVzc2FnZSlcblxuICAgICAgZXhwZWN0KG5vdGlmaWNhdGlvbi5nZXRNZXNzYWdlKCkpLnRvQmUoZXhwZWN0ZWRNZXNzYWdlKVxuICAgIH0pXG4gIH0pXG5cbiAgZGVzY3JpYmUoJ3doZW4gYSBmaWxlIGlzIG5vdCBzcGVjaWZpZWQgaW4gLmVzbGludGlnbm9yZSBmaWxlJywgYXN5bmMgKCkgPT4ge1xuICAgIGl0KCd3aWxsIGdpdmUgd2FybmluZ3Mgd2hlbiBsaW50aW5nIHRoZSBmaWxlJywgYXN5bmMgKCkgPT4ge1xuICAgICAgY29uc3QgdGVtcFBhdGggPSBhd2FpdCBjb3B5RmlsZVRvVGVtcERpcihwYXRoLmpvaW4ocGF0aHMuZXNsaW50aWdub3JlRGlyLCAnaWdub3JlZC5qcycpKVxuICAgICAgY29uc3QgdGVtcERpciA9IHBhdGguZGlybmFtZSh0ZW1wUGF0aClcblxuICAgICAgY29uc3QgZWRpdG9yID0gYXdhaXQgYXRvbS53b3Jrc3BhY2Uub3Blbih0ZW1wUGF0aClcbiAgICAgIGF0b20uY29uZmlnLnNldCgnbGludGVyLWVzbGludC5kaXNhYmxlRXNsaW50SWdub3JlJywgZmFsc2UpXG4gICAgICBhd2FpdCBjb3B5RmlsZVRvRGlyKHBhdGguam9pbihwYXRocy5lc2xpbnRpZ25vcmVEaXIsICcuZXNsaW50cmMueWFtbCcpLCB0ZW1wRGlyKVxuXG4gICAgICBjb25zdCBtZXNzYWdlcyA9IGF3YWl0IGxpbnQoZWRpdG9yKVxuICAgICAgZXhwZWN0KG1lc3NhZ2VzLmxlbmd0aCkudG9CZSgxKVxuICAgICAgcmltcmFmLnN5bmModGVtcERpcilcbiAgICB9KVxuICB9KVxuXG4gIGRlc2NyaWJlKCd3aGVuIGEgZmlsZSBpcyBzcGVjaWZpZWQgaW4gYW4gZXNsaW50SWdub3JlIGtleSBpbiBwYWNrYWdlLmpzb24nLCAoKSA9PiB7XG4gICAgaXQoJ3dpbGwgc3RpbGwgbGludCB0aGUgZmlsZSBpZiBhbiAuZXNsaW50aWdub3JlIGZpbGUgaXMgcHJlc2VudCcsIGFzeW5jICgpID0+IHtcbiAgICAgIGF0b20uY29uZmlnLnNldCgnbGludGVyLWVzbGludC5kaXNhYmxlRXNsaW50SWdub3JlJywgZmFsc2UpXG4gICAgICBjb25zdCBlZGl0b3IgPSBhd2FpdCBhdG9tLndvcmtzcGFjZS5vcGVuKHBhdGguam9pbihwYXRocy5lc2xpbnRJZ25vcmVLZXlEaXIsICdpZ25vcmVkLmpzJykpXG4gICAgICBjb25zdCBtZXNzYWdlcyA9IGF3YWl0IGxpbnQoZWRpdG9yKVxuXG4gICAgICBleHBlY3QobWVzc2FnZXMubGVuZ3RoKS50b0JlKDEpXG4gICAgfSlcblxuICAgIGl0KCd3aWxsIG5vdCBnaXZlIHdhcm5pbmdzIHdoZW4gbGludGluZyB0aGUgZmlsZScsIGFzeW5jICgpID0+IHtcbiAgICAgIGNvbnN0IHRlbXBQYXRoID0gYXdhaXQgY29weUZpbGVUb1RlbXBEaXIocGF0aC5qb2luKHBhdGhzLmVzbGludElnbm9yZUtleURpciwgJ2lnbm9yZWQuanMnKSlcbiAgICAgIGNvbnN0IHRlbXBEaXIgPSBwYXRoLmRpcm5hbWUodGVtcFBhdGgpXG5cbiAgICAgIGNvbnN0IGVkaXRvciA9IGF3YWl0IGF0b20ud29ya3NwYWNlLm9wZW4odGVtcFBhdGgpXG4gICAgICBhdG9tLmNvbmZpZy5zZXQoJ2xpbnRlci1lc2xpbnQuZGlzYWJsZUVzbGludElnbm9yZScsIGZhbHNlKVxuICAgICAgYXdhaXQgY29weUZpbGVUb0RpcihwYXRoLmpvaW4ocGF0aHMuZXNsaW50SWdub3JlS2V5RGlyLCAncGFja2FnZS5qc29uJyksIHRlbXBEaXIpXG5cbiAgICAgIGNvbnN0IG1lc3NhZ2VzID0gYXdhaXQgbGludChlZGl0b3IpXG4gICAgICBleHBlY3QobWVzc2FnZXMubGVuZ3RoKS50b0JlKDApXG4gICAgICByaW1yYWYuc3luYyh0ZW1wRGlyKVxuICAgIH0pXG4gIH0pXG5cbiAgZGVzY3JpYmUoJ2ZpeGVzIGVycm9ycycsICgpID0+IHtcbiAgICBsZXQgZWRpdG9yXG4gICAgbGV0IHRlbXBEaXJcblxuICAgIGJlZm9yZUVhY2goYXN5bmMgKCkgPT4ge1xuICAgICAgLy8gQ29weSB0aGUgZmlsZSB0byBhIHRlbXBvcmFyeSBmb2xkZXJcbiAgICAgIGNvbnN0IHRlbXBGaXh0dXJlUGF0aCA9IGF3YWl0IGNvcHlGaWxlVG9UZW1wRGlyKHBhdGhzLmZpeClcbiAgICAgIGVkaXRvciA9IGF3YWl0IGF0b20ud29ya3NwYWNlLm9wZW4odGVtcEZpeHR1cmVQYXRoKVxuICAgICAgdGVtcERpciA9IHBhdGguZGlybmFtZSh0ZW1wRml4dHVyZVBhdGgpXG4gICAgICAvLyBDb3B5IHRoZSBjb25maWcgdG8gdGhlIHNhbWUgdGVtcG9yYXJ5IGRpcmVjdG9yeVxuICAgICAgYXdhaXQgY29weUZpbGVUb0RpcihwYXRocy5jb25maWcsIHRlbXBEaXIpXG4gICAgfSlcblxuICAgIGFmdGVyRWFjaCgoKSA9PiB7XG4gICAgICAvLyBSZW1vdmUgdGhlIHRlbXBvcmFyeSBkaXJlY3RvcnlcbiAgICAgIHJpbXJhZi5zeW5jKHRlbXBEaXIpXG4gICAgfSlcblxuICAgIGFzeW5jIGZ1bmN0aW9uIGZpcnN0TGludCh0ZXh0RWRpdG9yKSB7XG4gICAgICBjb25zdCBtZXNzYWdlcyA9IGF3YWl0IGxpbnQodGV4dEVkaXRvcilcbiAgICAgIC8vIFRoZSBvcmlnaW5hbCBmaWxlIGhhcyB0d28gZXJyb3JzXG4gICAgICBleHBlY3QobWVzc2FnZXMubGVuZ3RoKS50b0JlKDIpXG4gICAgfVxuXG4gICAgaXQoJ3Nob3VsZCBmaXggbGludGluZyBlcnJvcnMnLCBhc3luYyAoKSA9PiB7XG4gICAgICBhd2FpdCBmaXJzdExpbnQoZWRpdG9yKVxuICAgICAgYXdhaXQgbWFrZUZpeGVzKGVkaXRvcilcbiAgICAgIGNvbnN0IG1lc3NhZ2VzQWZ0ZXJGaXhpbmcgPSBhd2FpdCBsaW50KGVkaXRvcilcblxuICAgICAgZXhwZWN0KG1lc3NhZ2VzQWZ0ZXJGaXhpbmcubGVuZ3RoKS50b0JlKDApXG4gICAgfSlcblxuICAgIGl0KCdzaG91bGQgbm90IGZpeCBsaW50aW5nIGVycm9ycyBmb3IgcnVsZXMgdGhhdCBhcmUgZGlzYWJsZWQgd2l0aCBydWxlc1RvRGlzYWJsZVdoaWxlRml4aW5nJywgYXN5bmMgKCkgPT4ge1xuICAgICAgYXRvbS5jb25maWcuc2V0KCdsaW50ZXItZXNsaW50LnJ1bGVzVG9EaXNhYmxlV2hpbGVGaXhpbmcnLCBbJ3NlbWknXSlcblxuICAgICAgYXdhaXQgZmlyc3RMaW50KGVkaXRvcilcbiAgICAgIGF3YWl0IG1ha2VGaXhlcyhlZGl0b3IpXG4gICAgICBjb25zdCBtZXNzYWdlc0FmdGVyRml4aW5nID0gYXdhaXQgbGludChlZGl0b3IpXG4gICAgICBjb25zdCBleHBlY3RlZCA9ICdFeHRyYSBzZW1pY29sb24uIChzZW1pKSdcbiAgICAgIGNvbnN0IGV4cGVjdGVkVXJsID0gJ2h0dHBzOi8vZXNsaW50Lm9yZy9kb2NzL3J1bGVzL3NlbWknXG5cbiAgICAgIGV4cGVjdChtZXNzYWdlc0FmdGVyRml4aW5nLmxlbmd0aCkudG9CZSgxKVxuICAgICAgZXhwZWN0KG1lc3NhZ2VzQWZ0ZXJGaXhpbmdbMF0uZXhjZXJwdCkudG9CZShleHBlY3RlZClcbiAgICAgIGV4cGVjdChtZXNzYWdlc0FmdGVyRml4aW5nWzBdLnVybCkudG9CZShleHBlY3RlZFVybClcbiAgICB9KVxuICB9KVxuXG4gIGRlc2NyaWJlKCd3aGVuIGFuIGVzbGludCBjYWNoZSBmaWxlIGlzIHByZXNlbnQnLCAoKSA9PiB7XG4gICAgbGV0IGVkaXRvclxuICAgIGxldCB0ZW1wRGlyXG5cbiAgICBiZWZvcmVFYWNoKGFzeW5jICgpID0+IHtcbiAgICAgIC8vIENvcHkgdGhlIGZpbGUgdG8gYSB0ZW1wb3JhcnkgZm9sZGVyXG4gICAgICBjb25zdCB0ZW1wRml4dHVyZVBhdGggPSBhd2FpdCBjb3B5RmlsZVRvVGVtcERpcihwYXRocy5maXgpXG4gICAgICBlZGl0b3IgPSBhd2FpdCBhdG9tLndvcmtzcGFjZS5vcGVuKHRlbXBGaXh0dXJlUGF0aClcbiAgICAgIHRlbXBEaXIgPSBwYXRoLmRpcm5hbWUodGVtcEZpeHR1cmVQYXRoKVxuICAgICAgLy8gQ29weSB0aGUgY29uZmlnIHRvIHRoZSBzYW1lIHRlbXBvcmFyeSBkaXJlY3RvcnlcbiAgICAgIGF3YWl0IGNvcHlGaWxlVG9EaXIocGF0aHMuY29uZmlnLCB0ZW1wRGlyKVxuICAgIH0pXG5cbiAgICBhZnRlckVhY2goKCkgPT4ge1xuICAgICAgLy8gUmVtb3ZlIHRoZSB0ZW1wb3JhcnkgZGlyZWN0b3J5XG4gICAgICByaW1yYWYuc3luYyh0ZW1wRGlyKVxuICAgIH0pXG5cbiAgICBpdCgnZG9lcyBub3QgZGVsZXRlIHRoZSBjYWNoZSBmaWxlIHdoZW4gcGVyZm9ybWluZyBmaXhlcycsIGFzeW5jICgpID0+IHtcbiAgICAgIGNvbnN0IHRlbXBDYWNoZUZpbGUgPSBhd2FpdCBjb3B5RmlsZVRvRGlyKHBhdGhzLmNhY2hlLCB0ZW1wRGlyKVxuICAgICAgY29uc3QgY2hlY2tDYWNoZWZpbGVFeGlzdHMgPSAoKSA9PiB7XG4gICAgICAgIGZzLnN0YXRTeW5jKHRlbXBDYWNoZUZpbGUpXG4gICAgICB9XG4gICAgICBleHBlY3QoY2hlY2tDYWNoZWZpbGVFeGlzdHMpLm5vdC50b1Rocm93KClcbiAgICAgIGF3YWl0IG1ha2VGaXhlcyhlZGl0b3IpXG4gICAgICBleHBlY3QoY2hlY2tDYWNoZWZpbGVFeGlzdHMpLm5vdC50b1Rocm93KClcbiAgICB9KVxuICB9KVxuXG4gIGRlc2NyaWJlKCdJZ25vcmVzIHNwZWNpZmllZCBydWxlcyB3aGVuIGVkaXRpbmcnLCAoKSA9PiB7XG4gICAgbGV0IGV4cGVjdGVkUGF0aFxuXG4gICAgY29uc3QgY2hlY2tOb0NvbnNvbGUgPSAobWVzc2FnZSkgPT4ge1xuICAgICAgY29uc3QgdGV4dCA9ICdVbmV4cGVjdGVkIGNvbnNvbGUgc3RhdGVtZW50LiAobm8tY29uc29sZSknXG4gICAgICBjb25zdCB1cmwgPSAnaHR0cHM6Ly9lc2xpbnQub3JnL2RvY3MvcnVsZXMvbm8tY29uc29sZSdcbiAgICAgIGV4cGVjdChtZXNzYWdlLnNldmVyaXR5KS50b0JlKCdlcnJvcicpXG4gICAgICBleHBlY3QobWVzc2FnZS5leGNlcnB0KS50b0JlKHRleHQpXG4gICAgICBleHBlY3QobWVzc2FnZS51cmwpLnRvQmUodXJsKVxuICAgICAgZXhwZWN0KG1lc3NhZ2UubG9jYXRpb24uZmlsZSkudG9CZShleHBlY3RlZFBhdGgpXG4gICAgICBleHBlY3QobWVzc2FnZS5sb2NhdGlvbi5wb3NpdGlvbikudG9FcXVhbChbWzAsIDBdLCBbMCwgMTFdXSlcbiAgICB9XG5cbiAgICBjb25zdCBjaGVja05vVHJhaWxpbmdTcGFjZSA9IChtZXNzYWdlKSA9PiB7XG4gICAgICBjb25zdCB0ZXh0ID0gJ1RyYWlsaW5nIHNwYWNlcyBub3QgYWxsb3dlZC4gKG5vLXRyYWlsaW5nLXNwYWNlcyknXG4gICAgICBjb25zdCB1cmwgPSAnaHR0cHM6Ly9lc2xpbnQub3JnL2RvY3MvcnVsZXMvbm8tdHJhaWxpbmctc3BhY2VzJ1xuXG4gICAgICBleHBlY3QobWVzc2FnZS5zZXZlcml0eSkudG9CZSgnZXJyb3InKVxuICAgICAgZXhwZWN0KG1lc3NhZ2UuZXhjZXJwdCkudG9CZSh0ZXh0KVxuICAgICAgZXhwZWN0KG1lc3NhZ2UudXJsKS50b0JlKHVybClcbiAgICAgIGV4cGVjdChtZXNzYWdlLmxvY2F0aW9uLmZpbGUpLnRvQmUoZXhwZWN0ZWRQYXRoKVxuICAgICAgZXhwZWN0KG1lc3NhZ2UubG9jYXRpb24ucG9zaXRpb24pLnRvRXF1YWwoW1sxLCA5XSwgWzEsIDEwXV0pXG4gICAgfVxuXG4gICAgY29uc3QgY2hlY2tCZWZvcmUgPSAobWVzc2FnZXMpID0+IHtcbiAgICAgIGV4cGVjdChtZXNzYWdlcy5sZW5ndGgpLnRvQmUoMSlcbiAgICAgIGNoZWNrTm9Db25zb2xlKG1lc3NhZ2VzWzBdKVxuICAgIH1cblxuICAgIGNvbnN0IGNoZWNrTmV3ID0gKG1lc3NhZ2VzKSA9PiB7XG4gICAgICBleHBlY3QobWVzc2FnZXMubGVuZ3RoKS50b0JlKDIpXG4gICAgICBjaGVja05vQ29uc29sZShtZXNzYWdlc1swXSlcbiAgICAgIGNoZWNrTm9UcmFpbGluZ1NwYWNlKG1lc3NhZ2VzWzFdKVxuICAgIH1cblxuICAgIGNvbnN0IGNoZWNrQWZ0ZXIgPSAobWVzc2FnZXMpID0+IHtcbiAgICAgIGV4cGVjdChtZXNzYWdlcy5sZW5ndGgpLnRvQmUoMSlcbiAgICAgIGNoZWNrTm9Db25zb2xlKG1lc3NhZ2VzWzBdKVxuICAgIH1cblxuICAgIGl0KCdkb2VzIG5vdGhpbmcgb24gc2F2ZWQgZmlsZXMnLCBhc3luYyAoKSA9PiB7XG4gICAgICBhdG9tLmNvbmZpZy5zZXQoJ2xpbnRlci1lc2xpbnQucnVsZXNUb1NpbGVuY2VXaGlsZVR5cGluZycsIFsnbm8tdHJhaWxpbmctc3BhY2VzJ10pXG4gICAgICBhdG9tLmNvbmZpZy5zZXQoJ2xpbnRlci1lc2xpbnQuaWdub3JlRml4YWJsZVJ1bGVzV2hpbGVUeXBpbmcnLCB0cnVlKVxuICAgICAgZXhwZWN0ZWRQYXRoID0gcGF0aHMubW9kaWZpZWRJZ25vcmVTcGFjZVxuICAgICAgY29uc3QgZWRpdG9yID0gYXdhaXQgYXRvbS53b3Jrc3BhY2Uub3BlbihleHBlY3RlZFBhdGgpXG4gICAgICAvLyBSdW4gb25jZSB0byBwb3B1bGF0ZSB0aGUgZml4YWJsZSBydWxlcyBsaXN0XG4gICAgICBhd2FpdCBsaW50KGVkaXRvcilcbiAgICAgIC8vIFJ1biBhZ2FpbiBmb3IgdGhlIHRlc3RhYmxlIHJlc3VsdHNcbiAgICAgIGNvbnN0IG1lc3NhZ2VzID0gYXdhaXQgbGludChlZGl0b3IpXG4gICAgICBjaGVja05ldyhtZXNzYWdlcylcbiAgICB9KVxuXG4gICAgaXQoJ2FsbG93cyBpZ25vcmluZyBhIHNwZWNpZmljIGxpc3Qgb2YgcnVsZXMgd2hlbiBtb2RpZmllZCcsIGFzeW5jICgpID0+IHtcbiAgICAgIGV4cGVjdGVkUGF0aCA9IHBhdGhzLm1vZGlmaWVkSWdub3JlXG4gICAgICBjb25zdCBlZGl0b3IgPSBhd2FpdCBhdG9tLndvcmtzcGFjZS5vcGVuKGV4cGVjdGVkUGF0aClcblxuICAgICAgLy8gVmVyaWZ5IGV4cGVjdGVkIGVycm9yIGJlZm9yZVxuICAgICAgY29uc3QgZmlyc3RNZXNzYWdlcyA9IGF3YWl0IGxpbnQoZWRpdG9yKVxuICAgICAgY2hlY2tCZWZvcmUoZmlyc3RNZXNzYWdlcylcblxuICAgICAgLy8gSW5zZXJ0IGEgc3BhY2UgaW50byB0aGUgZWRpdG9yXG4gICAgICBlZGl0b3IuZ2V0QnVmZmVyKCkuaW5zZXJ0KFsxLCA5XSwgJyAnKVxuXG4gICAgICAvLyBWZXJpZnkgdGhlIHNwYWNlIGlzIHNob3dpbmcgYW4gZXJyb3JcbiAgICAgIGNvbnN0IG1lc3NhZ2VzID0gYXdhaXQgbGludChlZGl0b3IpXG4gICAgICBjaGVja05ldyhtZXNzYWdlcylcblxuICAgICAgLy8gRW5hYmxlIHRoZSBvcHRpb24gdW5kZXIgdGVzdFxuICAgICAgYXRvbS5jb25maWcuc2V0KCdsaW50ZXItZXNsaW50LnJ1bGVzVG9TaWxlbmNlV2hpbGVUeXBpbmcnLCBbJ25vLXRyYWlsaW5nLXNwYWNlcyddKVxuXG4gICAgICAvLyBDaGVjayB0aGUgbGludCByZXN1bHRzXG4gICAgICBjb25zdCBuZXdNZXNzYWdlcyA9IGF3YWl0IGxpbnQoZWRpdG9yKVxuICAgICAgY2hlY2tBZnRlcihuZXdNZXNzYWdlcylcbiAgICB9KVxuXG4gICAgaXQoJ2FsbG93cyBpZ25vcmluZyBhbGwgZml4YWJsZSBydWxlcyB3aGlsZSB0eXBpbmcnLCBhc3luYyAoKSA9PiB7XG4gICAgICBleHBlY3RlZFBhdGggPSBwYXRocy5tb2RpZmllZElnbm9yZVxuICAgICAgY29uc3QgZWRpdG9yID0gYXdhaXQgYXRvbS53b3Jrc3BhY2Uub3BlbihleHBlY3RlZFBhdGgpXG5cbiAgICAgIC8vIFZlcmlmeSBubyBlcnJvciBiZWZvcmVcbiAgICAgIGNvbnN0IGZpcnN0TWVzc2FnZXMgPSBhd2FpdCBsaW50KGVkaXRvcilcbiAgICAgIGNoZWNrQmVmb3JlKGZpcnN0TWVzc2FnZXMpXG5cbiAgICAgIC8vIEluc2VydCBhIHNwYWNlIGludG8gdGhlIGVkaXRvclxuICAgICAgZWRpdG9yLmdldEJ1ZmZlcigpLmluc2VydChbMSwgOV0sICcgJylcblxuICAgICAgLy8gVmVyaWZ5IHRoZSBzcGFjZSBpcyBzaG93aW5nIGFuIGVycm9yXG4gICAgICBjb25zdCBtZXNzYWdlcyA9IGF3YWl0IGxpbnQoZWRpdG9yKVxuICAgICAgY2hlY2tOZXcobWVzc2FnZXMpXG5cbiAgICAgIC8vIEVuYWJsZSB0aGUgb3B0aW9uIHVuZGVyIHRlc3RcbiAgICAgIC8vIE5PVEU6IERlcGVuZHMgb24gbm8tdHJhaWxpbmctc3BhY2VzIGJlaW5nIG1hcmtlZCBhcyBmaXhhYmxlIGJ5IEVTTGludFxuICAgICAgYXRvbS5jb25maWcuc2V0KCdsaW50ZXItZXNsaW50Lmlnbm9yZUZpeGFibGVSdWxlc1doaWxlVHlwaW5nJywgdHJ1ZSlcblxuICAgICAgLy8gQ2hlY2sgdGhlIGxpbnQgcmVzdWx0c1xuICAgICAgY29uc3QgbmV3TWVzc2FnZXMgPSBhd2FpdCBsaW50KGVkaXRvcilcbiAgICAgIGNoZWNrQWZ0ZXIobmV3TWVzc2FnZXMpXG4gICAgfSlcblxuICAgIGl0KCdhbGxvd3MgaWdub3JpbmcgZml4aWJsZSBydWxlcyBmcm9tIHBsdWdpbnMgd2hpbGUgdHlwaW5nJywgYXN5bmMgKCkgPT4ge1xuICAgICAgZXhwZWN0ZWRQYXRoID0gcGF0aHMuZml4YWJsZVBsdWdpblxuICAgICAgY29uc3QgZWRpdG9yID0gYXdhaXQgYXRvbS53b3Jrc3BhY2Uub3BlbihleHBlY3RlZFBhdGgpXG5cbiAgICAgIC8vIFZlcmlmeSBubyBlcnJvciBiZWZvcmUgdGhlIGVkaXRvciBpcyBtb2RpZmllZFxuICAgICAgY29uc3QgZmlyc3RNZXNzYWdlcyA9IGF3YWl0IGxpbnQoZWRpdG9yKVxuICAgICAgZXhwZWN0KGZpcnN0TWVzc2FnZXMubGVuZ3RoKS50b0JlKDApXG5cbiAgICAgIC8vIFJlbW92ZSB0aGUgbmV3bGluZSBiZXR3ZWVuIHRoZSBpbXBvcnQgYW5kIGNvbnNvbGUgbG9nXG4gICAgICBlZGl0b3IuZ2V0QnVmZmVyKCkuZGVsZXRlUm93KDEpXG5cbiAgICAgIC8vIFZlcmlmeSB0aGVyZSBpcyBhbiBlcnJvciBmb3IgdGhlIGZpeGFibGUgaW1wb3J0L25ld2xpbmUtYWZ0ZXItaW1wb3J0IHJ1bGVcbiAgICAgIGNvbnN0IG1lc3NhZ2VzID0gYXdhaXQgbGludChlZGl0b3IpXG4gICAgICBleHBlY3QobWVzc2FnZXMubGVuZ3RoKS50b0JlKDEpXG4gICAgICBleHBlY3QobWVzc2FnZXNbMF0uc2V2ZXJpdHkpLnRvQmUoJ2Vycm9yJylcbiAgICAgIGV4cGVjdChtZXNzYWdlc1swXS5leGNlcnB0KS50b0JlKCdFeHBlY3RlZCBlbXB0eSBsaW5lIGFmdGVyIGltcG9ydCBzdGF0ZW1lbnQgbm90IGZvbGxvd2VkIGJ5IGFub3RoZXIgaW1wb3J0LiAoaW1wb3J0L25ld2xpbmUtYWZ0ZXItaW1wb3J0KScpXG5cbiAgICAgIC8vIEVuYWJsZSB0aGUgb3B0aW9uIHVuZGVyIHRlc3RcbiAgICAgIC8vIE5PVEU6IERlcGVuZHMgb24gbXBvcnQvbmV3bGluZS1hZnRlci1pbXBvcnQgcnVsZSBiZWluZyBtYXJrZWQgYXMgZml4YWJsZVxuICAgICAgYXRvbS5jb25maWcuc2V0KCdsaW50ZXItZXNsaW50Lmlnbm9yZUZpeGFibGVSdWxlc1doaWxlVHlwaW5nJywgdHJ1ZSlcblxuICAgICAgLy8gQ2hlY2sgdGhlIGxpbnQgcmVzdWx0c1xuICAgICAgY29uc3QgbmV3TWVzc2FnZXMgPSBhd2FpdCBsaW50KGVkaXRvcilcbiAgICAgIGV4cGVjdChuZXdNZXNzYWdlcy5sZW5ndGgpLnRvQmUoMClcbiAgICB9KVxuICB9KVxuXG4gIGRlc2NyaWJlKCdwcmludHMgZGVidWdnaW5nIGluZm9ybWF0aW9uIHdpdGggdGhlIGBkZWJ1Z2AgY29tbWFuZCcsICgpID0+IHtcbiAgICBsZXQgZWRpdG9yXG4gICAgY29uc3QgZXhwZWN0ZWRNZXNzYWdlID0gJ2xpbnRlci1lc2xpbnQgZGVidWdnaW5nIGluZm9ybWF0aW9uJ1xuICAgIGJlZm9yZUVhY2goYXN5bmMgKCkgPT4ge1xuICAgICAgZWRpdG9yID0gYXdhaXQgYXRvbS53b3Jrc3BhY2Uub3BlbihwYXRocy5nb29kKVxuICAgIH0pXG5cbiAgICBpdCgnc2hvd3MgYW4gaW5mbyBub3RpZmljYXRpb24nLCBhc3luYyAoKSA9PiB7XG4gICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKGF0b20udmlld3MuZ2V0VmlldyhlZGl0b3IpLCAnbGludGVyLWVzbGludDpkZWJ1ZycpXG4gICAgICBjb25zdCBub3RpZmljYXRpb24gPSBhd2FpdCBnZXROb3RpZmljYXRpb24oZXhwZWN0ZWRNZXNzYWdlKVxuXG4gICAgICBleHBlY3Qobm90aWZpY2F0aW9uLmdldE1lc3NhZ2UoKSkudG9CZShleHBlY3RlZE1lc3NhZ2UpXG4gICAgICBleHBlY3Qobm90aWZpY2F0aW9uLmdldFR5cGUoKSkudG9FcXVhbCgnaW5mbycpXG4gICAgfSlcblxuICAgIGl0KCdpbmNsdWRlcyBkZWJ1Z2dpbmcgaW5mb3JtYXRpb24gaW4gdGhlIGRldGFpbHMnLCBhc3luYyAoKSA9PiB7XG4gICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKGF0b20udmlld3MuZ2V0VmlldyhlZGl0b3IpLCAnbGludGVyLWVzbGludDpkZWJ1ZycpXG4gICAgICBjb25zdCBub3RpZmljYXRpb24gPSBhd2FpdCBnZXROb3RpZmljYXRpb24oZXhwZWN0ZWRNZXNzYWdlKVxuICAgICAgY29uc3QgZGV0YWlsID0gbm90aWZpY2F0aW9uLmdldERldGFpbCgpXG5cbiAgICAgIGV4cGVjdChkZXRhaWwuaW5jbHVkZXMoYEF0b20gdmVyc2lvbjogJHthdG9tLmdldFZlcnNpb24oKX1gKSkudG9CZSh0cnVlKVxuICAgICAgZXhwZWN0KGRldGFpbC5pbmNsdWRlcygnbGludGVyLWVzbGludCB2ZXJzaW9uOicpKS50b0JlKHRydWUpXG4gICAgICBleHBlY3QoZGV0YWlsLmluY2x1ZGVzKGBQbGF0Zm9ybTogJHtwcm9jZXNzLnBsYXRmb3JtfWApKS50b0JlKHRydWUpXG4gICAgICBleHBlY3QoZGV0YWlsLmluY2x1ZGVzKCdsaW50ZXItZXNsaW50IGNvbmZpZ3VyYXRpb246JykpLnRvQmUodHJ1ZSlcbiAgICAgIGV4cGVjdChkZXRhaWwuaW5jbHVkZXMoJ1VzaW5nIGxvY2FsIHByb2plY3QgRVNMaW50JykpLnRvQmUodHJ1ZSlcbiAgICB9KVxuICB9KVxuXG4gIGl0KCdoYW5kbGVzIHJhbmdlcyBpbiBtZXNzYWdlcycsIGFzeW5jICgpID0+IHtcbiAgICBjb25zdCBlZGl0b3IgPSBhd2FpdCBhdG9tLndvcmtzcGFjZS5vcGVuKHBhdGhzLmVuZFJhbmdlKVxuICAgIGNvbnN0IG1lc3NhZ2VzID0gYXdhaXQgbGludChlZGl0b3IpXG4gICAgY29uc3QgZXhwZWN0ZWQgPSAnVW5yZWFjaGFibGUgY29kZS4gKG5vLXVucmVhY2hhYmxlKSdcbiAgICBjb25zdCBleHBlY3RlZFVybCA9ICdodHRwczovL2VzbGludC5vcmcvZG9jcy9ydWxlcy9uby11bnJlYWNoYWJsZSdcblxuICAgIGV4cGVjdChtZXNzYWdlc1swXS5zZXZlcml0eSkudG9CZSgnZXJyb3InKVxuICAgIGV4cGVjdChtZXNzYWdlc1swXS5leGNlcnB0KS50b0JlKGV4cGVjdGVkKVxuICAgIGV4cGVjdChtZXNzYWdlc1swXS51cmwpLnRvQmUoZXhwZWN0ZWRVcmwpXG4gICAgZXhwZWN0KG1lc3NhZ2VzWzBdLmxvY2F0aW9uLmZpbGUpLnRvQmUocGF0aHMuZW5kUmFuZ2UpXG4gICAgZXhwZWN0KG1lc3NhZ2VzWzBdLmxvY2F0aW9uLnBvc2l0aW9uKS50b0VxdWFsKFtbNSwgMl0sIFs2LCAxNV1dKVxuICB9KVxuXG4gIGRlc2NyaWJlKCd3aGVuIHNldHRpbmcgYGRpc2FibGVXaGVuTm9Fc2xpbnRDb25maWdgIGlzIGZhbHNlJywgKCkgPT4ge1xuICAgIGxldCBlZGl0b3JcbiAgICBsZXQgdGVtcEZpbGVQYXRoXG4gICAgbGV0IHRlbXBGaXh0dXJlRGlyXG5cbiAgICBiZWZvcmVFYWNoKGFzeW5jICgpID0+IHtcbiAgICAgIGF0b20uY29uZmlnLnNldCgnbGludGVyLWVzbGludC5kaXNhYmxlV2hlbk5vRXNsaW50Q29uZmlnJywgZmFsc2UpXG5cbiAgICAgIHRlbXBGaWxlUGF0aCA9IGF3YWl0IGNvcHlGaWxlVG9UZW1wRGlyKHBhdGhzLmJhZElubGluZSlcbiAgICAgIGVkaXRvciA9IGF3YWl0IGF0b20ud29ya3NwYWNlLm9wZW4odGVtcEZpbGVQYXRoKVxuICAgICAgdGVtcEZpeHR1cmVEaXIgPSBwYXRoLmRpcm5hbWUodGVtcEZpbGVQYXRoKVxuICAgIH0pXG5cbiAgICBhZnRlckVhY2goKCkgPT4ge1xuICAgICAgcmltcmFmLnN5bmModGVtcEZpeHR1cmVEaXIpXG4gICAgfSlcblxuICAgIGl0KCdlcnJvcnMgd2hlbiBubyBjb25maWcgZmlsZSBpcyBmb3VuZCcsIGFzeW5jICgpID0+IHtcbiAgICAgIGNvbnN0IG1lc3NhZ2VzID0gYXdhaXQgbGludChlZGl0b3IpXG4gICAgICBjb25zdCBleHBlY3RlZCA9ICdFcnJvciB3aGlsZSBydW5uaW5nIEVTTGludDogTm8gRVNMaW50IGNvbmZpZ3VyYXRpb24gZm91bmQuLidcbiAgICAgIGNvbnN0IGRlc2NyaXB0aW9uID0gYDxkaXYgc3R5bGU9XCJ3aGl0ZS1zcGFjZTogcHJlLXdyYXBcIj5ObyBFU0xpbnQgY29uZmlndXJhdGlvbiBmb3VuZC5cbjxociAvPkVycm9yOiBObyBFU0xpbnQgY29uZmlndXJhdGlvbiBmb3VuZC5cbiAgICBhdCBDb25maWcuZ2V0TG9jYWxDb25maWdIaWVyYXJjaHlgXG4gICAgICAvLyBUaGUgcmVzdCBvZiB0aGUgZGVzY3JpcHRpb24gaW5jbHVkZXMgcGF0aHMgc3BlY2lmaWMgdG8gdGhlIGNvbXB1dGVyIHJ1bm5pbmcgaXRcbiAgICAgIGV4cGVjdChtZXNzYWdlcy5sZW5ndGgpLnRvQmUoMSlcbiAgICAgIGV4cGVjdChtZXNzYWdlc1swXS5zZXZlcml0eSkudG9CZSgnZXJyb3InKVxuICAgICAgZXhwZWN0KG1lc3NhZ2VzWzBdLmV4Y2VycHQpLnRvQmUoZXhwZWN0ZWQpXG4gICAgICBleHBlY3QobWVzc2FnZXNbMF0uZGVzY3JpcHRpb24uc3RhcnRzV2l0aChkZXNjcmlwdGlvbikpLnRvQmUodHJ1ZSlcbiAgICAgIGV4cGVjdChtZXNzYWdlc1swXS51cmwpLm5vdC50b0JlRGVmaW5lZCgpXG4gICAgICBleHBlY3QobWVzc2FnZXNbMF0ubG9jYXRpb24uZmlsZSkudG9CZSh0ZW1wRmlsZVBhdGgpXG4gICAgICBleHBlY3QobWVzc2FnZXNbMF0ubG9jYXRpb24ucG9zaXRpb24pLnRvRXF1YWwoW1swLCAwXSwgWzAsIDI4XV0pXG4gICAgfSlcbiAgfSlcblxuICBkZXNjcmliZSgnd2hlbiBgZGlzYWJsZVdoZW5Ob0VzbGludENvbmZpZ2AgaXMgdHJ1ZScsICgpID0+IHtcbiAgICBsZXQgZWRpdG9yXG4gICAgbGV0IHRlbXBGaXh0dXJlRGlyXG5cbiAgICBiZWZvcmVFYWNoKGFzeW5jICgpID0+IHtcbiAgICAgIGF0b20uY29uZmlnLnNldCgnbGludGVyLWVzbGludC5kaXNhYmxlV2hlbk5vRXNsaW50Q29uZmlnJywgdHJ1ZSlcblxuICAgICAgY29uc3QgdGVtcEZpbGVQYXRoID0gYXdhaXQgY29weUZpbGVUb1RlbXBEaXIocGF0aHMuYmFkSW5saW5lKVxuICAgICAgZWRpdG9yID0gYXdhaXQgYXRvbS53b3Jrc3BhY2Uub3Blbih0ZW1wRmlsZVBhdGgpXG4gICAgICB0ZW1wRml4dHVyZURpciA9IHBhdGguZGlybmFtZSh0ZW1wRmlsZVBhdGgpXG4gICAgfSlcblxuICAgIGFmdGVyRWFjaCgoKSA9PiB7XG4gICAgICByaW1yYWYuc3luYyh0ZW1wRml4dHVyZURpcilcbiAgICB9KVxuXG4gICAgaXQoJ2RvZXMgbm90IHJlcG9ydCBlcnJvcnMgd2hlbiBubyBjb25maWcgZmlsZSBpcyBmb3VuZCcsIGFzeW5jICgpID0+IHtcbiAgICAgIGNvbnN0IG1lc3NhZ2VzID0gYXdhaXQgbGludChlZGl0b3IpXG5cbiAgICAgIGV4cGVjdChtZXNzYWdlcy5sZW5ndGgpLnRvQmUoMClcbiAgICB9KVxuICB9KVxuXG4gIGRlc2NyaWJlKCdsZXRzIEVTTGludCBoYW5kbGUgY29uZmlndXJhdGlvbicsICgpID0+IHtcbiAgICBpdCgnd29ya3Mgd2hlbiB0aGUgY2FjaGUgZmFpbHMnLCBhc3luYyAoKSA9PiB7XG4gICAgICAvLyBFbnN1cmUgdGhlIGNhY2hlIGlzIGVuYWJsZWQsIHNpbmNlIHdlIHdpbGwgYmUgdGFraW5nIGFkdmFudGFnZSBvZlxuICAgICAgLy8gYSBmYWlsaW5nIGluIGl0J3Mgb3BlcmF0aW9uXG4gICAgICBhdG9tLmNvbmZpZy5zZXQoJ2xpbnRlci1lc2xpbnQuZGlzYWJsZUZTQ2FjaGUnLCBmYWxzZSlcbiAgICAgIGNvbnN0IGZvb1BhdGggPSBwYXRoLmpvaW4ocGF0aHMuYmFkQ2FjaGUsICd0ZW1wJywgJ2Zvby5qcycpXG4gICAgICBjb25zdCBuZXdDb25maWdQYXRoID0gcGF0aC5qb2luKHBhdGhzLmJhZENhY2hlLCAndGVtcCcsICcuZXNsaW50cmMuanMnKVxuICAgICAgY29uc3QgZWRpdG9yID0gYXdhaXQgYXRvbS53b3Jrc3BhY2Uub3Blbihmb29QYXRoKVxuICAgICAgZnVuY3Rpb24gdW5kZWZNc2codmFyTmFtZSkge1xuICAgICAgICByZXR1cm4gYCcke3Zhck5hbWV9JyBpcyBub3QgZGVmaW5lZC4gKG5vLXVuZGVmKWBcbiAgICAgIH1cbiAgICAgIGNvbnN0IGV4cGVjdGVkVXJsID0gJ2h0dHBzOi8vZXNsaW50Lm9yZy9kb2NzL3J1bGVzL25vLXVuZGVmJ1xuXG4gICAgICAvLyBUcmlnZ2VyIGEgZmlyc3QgbGludCB0byB3YXJtIHVwIHRoZSBjYWNoZSB3aXRoIHRoZSBmaXJzdCBjb25maWcgcmVzdWx0XG4gICAgICBsZXQgbWVzc2FnZXMgPSBhd2FpdCBsaW50KGVkaXRvcilcbiAgICAgIGV4cGVjdChtZXNzYWdlcy5sZW5ndGgpLnRvQmUoMilcbiAgICAgIGV4cGVjdChtZXNzYWdlc1swXS5zZXZlcml0eSkudG9CZSgnZXJyb3InKVxuICAgICAgZXhwZWN0KG1lc3NhZ2VzWzBdLmV4Y2VycHQpLnRvQmUodW5kZWZNc2coJ2NvbnNvbGUnKSlcbiAgICAgIGV4cGVjdChtZXNzYWdlc1swXS51cmwpLnRvQmUoZXhwZWN0ZWRVcmwpXG4gICAgICBleHBlY3QobWVzc2FnZXNbMF0ubG9jYXRpb24uZmlsZSkudG9CZShmb29QYXRoKVxuICAgICAgZXhwZWN0KG1lc3NhZ2VzWzBdLmxvY2F0aW9uLnBvc2l0aW9uKS50b0VxdWFsKFtbMSwgMl0sIFsxLCA5XV0pXG4gICAgICBleHBlY3QobWVzc2FnZXNbMV0uc2V2ZXJpdHkpLnRvQmUoJ2Vycm9yJylcbiAgICAgIGV4cGVjdChtZXNzYWdlc1sxXS5leGNlcnB0KS50b0JlKHVuZGVmTXNnKCdiYXInKSlcbiAgICAgIGV4cGVjdChtZXNzYWdlc1sxXS51cmwpLnRvQmUoZXhwZWN0ZWRVcmwpXG4gICAgICBleHBlY3QobWVzc2FnZXNbMV0ubG9jYXRpb24uZmlsZSkudG9CZShmb29QYXRoKVxuICAgICAgZXhwZWN0KG1lc3NhZ2VzWzFdLmxvY2F0aW9uLnBvc2l0aW9uKS50b0VxdWFsKFtbMSwgMTRdLCBbMSwgMTddXSlcblxuICAgICAgLy8gV3JpdGUgdGhlIG5ldyBjb25maWd1cmF0aW9uIGZpbGVcbiAgICAgIGNvbnN0IG5ld0NvbmZpZyA9IHtcbiAgICAgICAgZW52OiB7XG4gICAgICAgICAgYnJvd3NlcjogdHJ1ZSxcbiAgICAgICAgfSxcbiAgICAgIH1cbiAgICAgIGxldCBjb25maWdDb250ZW50cyA9IGBtb2R1bGUuZXhwb3J0cyA9ICR7SlNPTi5zdHJpbmdpZnkobmV3Q29uZmlnLCBudWxsLCAyKX1cXG5gXG4gICAgICBmcy53cml0ZUZpbGVTeW5jKG5ld0NvbmZpZ1BhdGgsIGNvbmZpZ0NvbnRlbnRzKVxuXG4gICAgICAvLyBMaW50IGFnYWluLCBFU0xpbnQgc2hvdWxkIHJlY29nbmlzZSB0aGUgbmV3IGNvbmZpZ3VyYXRpb25cbiAgICAgIC8vIFRoZSBjYWNoZWQgY29uZmlnIHJlc3VsdHMgYXJlIHN0aWxsIHBvaW50aW5nIGF0IHRoZSBfcGFyZW50XyBmaWxlLiBFU0xpbnRcbiAgICAgIC8vIHdvdWxkIHBhcnRpYWxseSBoYW5kbGUgdGhpcyBzaXR1YXRpb24gaWYgdGhlIGNvbmZpZyBmaWxlIHdhcyBzcGVjaWZpZWRcbiAgICAgIC8vIGZyb20gdGhlIGNhY2hlLlxuICAgICAgbWVzc2FnZXMgPSBhd2FpdCBsaW50KGVkaXRvcilcbiAgICAgIGV4cGVjdChtZXNzYWdlcy5sZW5ndGgpLnRvQmUoMSlcbiAgICAgIGV4cGVjdChtZXNzYWdlc1swXS5zZXZlcml0eSkudG9CZSgnZXJyb3InKVxuICAgICAgZXhwZWN0KG1lc3NhZ2VzWzBdLmV4Y2VycHQpLnRvQmUodW5kZWZNc2coJ2JhcicpKVxuICAgICAgZXhwZWN0KG1lc3NhZ2VzWzBdLnVybCkudG9CZShleHBlY3RlZFVybClcbiAgICAgIGV4cGVjdChtZXNzYWdlc1swXS5sb2NhdGlvbi5maWxlKS50b0JlKGZvb1BhdGgpXG4gICAgICBleHBlY3QobWVzc2FnZXNbMF0ubG9jYXRpb24ucG9zaXRpb24pLnRvRXF1YWwoW1sxLCAxNF0sIFsxLCAxN11dKVxuXG4gICAgICAvLyBVcGRhdGUgdGhlIGNvbmZpZ3VyYXRpb25cbiAgICAgIG5ld0NvbmZpZy5ydWxlcyA9IHtcbiAgICAgICAgJ25vLXVuZGVmJzogJ29mZicsXG4gICAgICB9XG4gICAgICBjb25maWdDb250ZW50cyA9IGBtb2R1bGUuZXhwb3J0cyA9ICR7SlNPTi5zdHJpbmdpZnkobmV3Q29uZmlnLCBudWxsLCAyKX1cXG5gXG4gICAgICBmcy53cml0ZUZpbGVTeW5jKG5ld0NvbmZpZ1BhdGgsIGNvbmZpZ0NvbnRlbnRzKVxuXG4gICAgICAvLyBMaW50IGFnYWluLCBpZiB0aGUgY2FjaGUgd2FzIHNwZWNpZnlpbmcgdGhlIGZpbGUgRVNMaW50IGF0IHRoaXMgcG9pbnRcbiAgICAgIC8vIHdvdWxkIGZhaWwgdG8gdXBkYXRlIHRoZSBjb25maWd1cmF0aW9uIGZ1bGx5LCBhbmQgd291bGQgc3RpbGwgcmVwb3J0IGFcbiAgICAgIC8vIG5vLXVuZGVmIGVycm9yLlxuICAgICAgbWVzc2FnZXMgPSBhd2FpdCBsaW50KGVkaXRvcilcbiAgICAgIGV4cGVjdChtZXNzYWdlcy5sZW5ndGgpLnRvQmUoMClcblxuICAgICAgLy8gRGVsZXRlIHRoZSB0ZW1wb3JhcnkgY29uZmlndXJhdGlvbiBmaWxlXG4gICAgICBmcy51bmxpbmtTeW5jKG5ld0NvbmZpZ1BhdGgpXG4gICAgfSlcbiAgfSlcblxuICBkZXNjcmliZSgnd29ya3Mgd2l0aCBIVE1MIGZpbGVzJywgKCkgPT4ge1xuICAgIGNvbnN0IGVtYmVkZGVkU2NvcGUgPSAnc291cmNlLmpzLmVtYmVkZGVkLmh0bWwnXG4gICAgY29uc3Qgc2NvcGVzID0gbGludGVyUHJvdmlkZXIuZ3JhbW1hclNjb3Blc1xuXG4gICAgaXQoJ2FkZHMgdGhlIEhUTUwgc2NvcGUgd2hlbiB0aGUgc2V0dGluZyBpcyBlbmFibGVkJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KHNjb3Blcy5pbmNsdWRlcyhlbWJlZGRlZFNjb3BlKSkudG9CZShmYWxzZSlcbiAgICAgIGF0b20uY29uZmlnLnNldCgnbGludGVyLWVzbGludC5saW50SHRtbEZpbGVzJywgdHJ1ZSlcbiAgICAgIGV4cGVjdChzY29wZXMuaW5jbHVkZXMoZW1iZWRkZWRTY29wZSkpLnRvQmUodHJ1ZSlcbiAgICAgIGF0b20uY29uZmlnLnNldCgnbGludGVyLWVzbGludC5saW50SHRtbEZpbGVzJywgZmFsc2UpXG4gICAgICBleHBlY3Qoc2NvcGVzLmluY2x1ZGVzKGVtYmVkZGVkU2NvcGUpKS50b0JlKGZhbHNlKVxuICAgIH0pXG5cbiAgICBpdCgna2VlcHMgdGhlIEhUTUwgc2NvcGUgd2l0aCBjdXN0b20gc2NvcGVzJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KHNjb3Blcy5pbmNsdWRlcyhlbWJlZGRlZFNjb3BlKSkudG9CZShmYWxzZSlcbiAgICAgIGF0b20uY29uZmlnLnNldCgnbGludGVyLWVzbGludC5saW50SHRtbEZpbGVzJywgdHJ1ZSlcbiAgICAgIGV4cGVjdChzY29wZXMuaW5jbHVkZXMoZW1iZWRkZWRTY29wZSkpLnRvQmUodHJ1ZSlcbiAgICAgIGF0b20uY29uZmlnLnNldCgnbGludGVyLWVzbGludC5zY29wZXMnLCBbJ2Zvby5iYXInXSlcbiAgICAgIGV4cGVjdChzY29wZXMuaW5jbHVkZXMoZW1iZWRkZWRTY29wZSkpLnRvQmUodHJ1ZSlcbiAgICB9KVxuICB9KVxuXG4gIGRlc2NyaWJlKCdoYW5kbGVzIHRoZSBTaG93IFJ1bGUgSUQgaW4gTWVzc2FnZXMgb3B0aW9uJywgKCkgPT4ge1xuICAgIGNvbnN0IGV4cGVjdGVkVXJsID0gJ2h0dHBzOi8vZ2l0aHViLmNvbS9iZW5tb3NoZXIvZXNsaW50LXBsdWdpbi1pbXBvcnQvYmxvYi9tYXN0ZXIvZG9jcy9ydWxlcy9uby11bnJlc29sdmVkLm1kJ1xuXG4gICAgaXQoJ3Nob3dzIHRoZSBydWxlIElEIHdoZW4gZW5hYmxlZCcsIGFzeW5jICgpID0+IHtcbiAgICAgIGF0b20uY29uZmlnLnNldCgnbGludGVyLWVzbGludC5zaG93UnVsZUlkSW5NZXNzYWdlJywgdHJ1ZSlcbiAgICAgIGNvbnN0IGVkaXRvciA9IGF3YWl0IGF0b20ud29ya3NwYWNlLm9wZW4ocGF0aHMuYmFkSW1wb3J0KVxuICAgICAgY29uc3QgbWVzc2FnZXMgPSBhd2FpdCBsaW50KGVkaXRvcilcbiAgICAgIGNvbnN0IGV4cGVjdGVkID0gXCJVbmFibGUgdG8gcmVzb2x2ZSBwYXRoIHRvIG1vZHVsZSAnLi4vbm9uZXhpc3RlbnQnLiAoaW1wb3J0L25vLXVucmVzb2x2ZWQpXCJcblxuICAgICAgZXhwZWN0KG1lc3NhZ2VzLmxlbmd0aCkudG9CZSgxKVxuICAgICAgZXhwZWN0KG1lc3NhZ2VzWzBdLnNldmVyaXR5KS50b0JlKCdlcnJvcicpXG4gICAgICBleHBlY3QobWVzc2FnZXNbMF0uZXhjZXJwdCkudG9CZShleHBlY3RlZClcbiAgICAgIGV4cGVjdChtZXNzYWdlc1swXS51cmwpLnRvQmUoZXhwZWN0ZWRVcmwpXG4gICAgICBleHBlY3QobWVzc2FnZXNbMF0ubG9jYXRpb24uZmlsZSkudG9CZShwYXRocy5iYWRJbXBvcnQpXG4gICAgICBleHBlY3QobWVzc2FnZXNbMF0ubG9jYXRpb24ucG9zaXRpb24pLnRvRXF1YWwoW1swLCAyNF0sIFswLCA0MF1dKVxuICAgICAgZXhwZWN0KG1lc3NhZ2VzWzBdLnNvbHV0aW9ucykubm90LnRvQmVEZWZpbmVkKClcbiAgICB9KVxuXG4gICAgaXQoXCJkb2Vzbid0IHNob3cgdGhlIHJ1bGUgSUQgd2hlbiBkaXNhYmxlZFwiLCBhc3luYyAoKSA9PiB7XG4gICAgICBhdG9tLmNvbmZpZy5zZXQoJ2xpbnRlci1lc2xpbnQuc2hvd1J1bGVJZEluTWVzc2FnZScsIGZhbHNlKVxuICAgICAgY29uc3QgZWRpdG9yID0gYXdhaXQgYXRvbS53b3Jrc3BhY2Uub3BlbihwYXRocy5iYWRJbXBvcnQpXG4gICAgICBjb25zdCBtZXNzYWdlcyA9IGF3YWl0IGxpbnQoZWRpdG9yKVxuICAgICAgY29uc3QgZXhwZWN0ZWQgPSBcIlVuYWJsZSB0byByZXNvbHZlIHBhdGggdG8gbW9kdWxlICcuLi9ub25leGlzdGVudCcuXCJcblxuICAgICAgZXhwZWN0KG1lc3NhZ2VzLmxlbmd0aCkudG9CZSgxKVxuICAgICAgZXhwZWN0KG1lc3NhZ2VzWzBdLnNldmVyaXR5KS50b0JlKCdlcnJvcicpXG4gICAgICBleHBlY3QobWVzc2FnZXNbMF0uZXhjZXJwdCkudG9CZShleHBlY3RlZClcbiAgICAgIGV4cGVjdChtZXNzYWdlc1swXS51cmwpLnRvQmUoZXhwZWN0ZWRVcmwpXG4gICAgICBleHBlY3QobWVzc2FnZXNbMF0ubG9jYXRpb24uZmlsZSkudG9CZShwYXRocy5iYWRJbXBvcnQpXG4gICAgICBleHBlY3QobWVzc2FnZXNbMF0ubG9jYXRpb24ucG9zaXRpb24pLnRvRXF1YWwoW1swLCAyNF0sIFswLCA0MF1dKVxuICAgICAgZXhwZWN0KG1lc3NhZ2VzWzBdLnNvbHV0aW9ucykubm90LnRvQmVEZWZpbmVkKClcbiAgICB9KVxuICB9KVxuXG4gIGRlc2NyaWJlKFwicmVnaXN0ZXJzIGFuICdFU0xpbnQgRml4JyByaWdodCBjbGljayBtZW51IGNvbW1hbmRcIiwgKCkgPT4ge1xuICAgIC8vIE5PVEU6IFJlYWNoZXMgaW50byB0aGUgcHJpdmF0ZSBkYXRhIG9mIHRoZSBDb250ZXh0TWVudU1hbmFnZXIsIHRoZXJlIGlzXG4gICAgLy8gbm8gcHVibGljIG1ldGhvZCB0byBjaGVjayB0aGlzIHRob3VnaCBzby4uLlxuICAgIGV4cGVjdChhdG9tLmNvbnRleHRNZW51Lml0ZW1TZXRzLnNvbWUoaXRlbVNldCA9PlxuICAgICAgLy8gTWF0Y2hpbmcgc2VsZWN0b3IuLi5cbiAgICAgIGl0ZW1TZXQuc2VsZWN0b3IgPT09ICdhdG9tLXRleHQtZWRpdG9yOm5vdCgubWluaSksIC5vdmVybGF5ZXInICYmXG4gICAgICBpdGVtU2V0Lml0ZW1zLnNvbWUoaXRlbSA9PlxuICAgICAgICAvLyBNYXRjaGluZyBjb21tYW5kLi4uXG4gICAgICAgIGl0ZW0uY29tbWFuZCA9PT0gJ2xpbnRlci1lc2xpbnQ6Zml4LWZpbGUnICYmXG4gICAgICAgIC8vIE1hdGNoaW5nIGxhYmVsXG4gICAgICAgIGl0ZW0ubGFiZWwgPT09ICdFU0xpbnQgRml4JyAmJlxuICAgICAgICAvLyBBbmQgaGFzIGEgZnVuY3Rpb24gY29udHJvbGxpbmcgZGlzcGxheVxuICAgICAgICB0eXBlb2YgaXRlbS5zaG91bGREaXNwbGF5ID09PSAnZnVuY3Rpb24nKSkpXG4gIH0pXG59KVxuIl19