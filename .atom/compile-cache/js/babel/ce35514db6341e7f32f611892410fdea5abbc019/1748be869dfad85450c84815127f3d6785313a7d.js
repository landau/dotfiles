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

var goodPath = path.join(fixturesDir, 'files', 'good.js');
var badPath = path.join(fixturesDir, 'files', 'bad.js');
var badInlinePath = path.join(fixturesDir, 'files', 'badInline.js');
var emptyPath = path.join(fixturesDir, 'files', 'empty.js');
var fixPath = path.join(fixturesDir, 'files', 'fix.js');
var cachePath = path.join(fixturesDir, 'files', '.eslintcache');
var configPath = path.join(fixturesDir, 'configs', '.eslintrc.yml');
var importingpath = path.join(fixturesDir, 'import-resolution', 'nested', 'importing.js');
var badImportPath = path.join(fixturesDir, 'import-resolution', 'nested', 'badImport.js');
var ignoredPath = path.join(fixturesDir, 'eslintignore', 'ignored.js');
var modifiedIgnorePath = path.join(fixturesDir, 'modified-ignore-rule', 'foo.js');
var modifiedIgnoreSpacePath = path.join(fixturesDir, 'modified-ignore-rule', 'foo-space.js');
var endRangePath = path.join(fixturesDir, 'end-range', 'no-unreachable.js');
var badCachePath = path.join(fixturesDir, 'badCache');

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

/**
 * Utility helper to copy a file into the OS temp directory.
 *
 * @param  {string} fileToCopyPath  Path of the file to be copied
 * @return {string}                 Full path of the file in copy destination
 */
function copyFileToTempDir(fileToCopyPath) {
  return new Promise(_asyncToGenerator(function* (resolve) {
    var tempFixtureDir = fs.mkdtempSync((0, _os.tmpdir)() + path.sep);
    resolve((yield copyFileToDir(fileToCopyPath, tempFixtureDir)));
  }));
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
      editor = yield atom.workspace.open(badPath);
    }));

    (0, _jasmineFix.it)('verifies the messages', _asyncToGenerator(function* () {
      var messages = yield lint(editor);
      expect(messages.length).toBe(2);

      var expected0 = "'foo' is not defined. (no-undef)";
      var expected0Url = 'http://eslint.org/docs/rules/no-undef';
      var expected1 = 'Extra semicolon. (semi)';
      var expected1Url = 'http://eslint.org/docs/rules/semi';

      expect(messages[0].severity).toBe('error');
      expect(messages[0].excerpt).toBe(expected0);
      expect(messages[0].url).toBe(expected0Url);
      expect(messages[0].location.file).toBe(badPath);
      expect(messages[0].location.position).toEqual([[0, 0], [0, 3]]);
      expect(messages[0].solutions).not.toBeDefined();

      expect(messages[1].severity).toBe('error');
      expect(messages[1].excerpt).toBe(expected1);
      expect(messages[1].url).toBe(expected1Url);
      expect(messages[1].location.file).toBe(badPath);
      expect(messages[1].location.position).toEqual([[0, 8], [0, 9]]);
      expect(messages[1].solutions.length).toBe(1);
      expect(messages[1].solutions[0].position).toEqual([[0, 6], [0, 9]]);
      expect(messages[1].solutions[0].replaceWith).toBe('42');
    }));
  });

  (0, _jasmineFix.it)('finds nothing wrong with an empty file', _asyncToGenerator(function* () {
    var editor = yield atom.workspace.open(emptyPath);
    var messages = yield lint(editor);

    expect(messages.length).toBe(0);
  }));

  (0, _jasmineFix.it)('finds nothing wrong with a valid file', _asyncToGenerator(function* () {
    var editor = yield atom.workspace.open(goodPath);
    var messages = yield lint(editor);

    expect(messages.length).toBe(0);
  }));

  (0, _jasmineFix.it)('reports the fixes for fixable errors', _asyncToGenerator(function* () {
    var editor = yield atom.workspace.open(fixPath);
    var messages = yield lint(editor);

    expect(messages[0].solutions[0].position).toEqual([[0, 10], [1, 8]]);
    expect(messages[0].solutions[0].replaceWith).toBe('6\nfunction');

    expect(messages[1].solutions[0].position).toEqual([[2, 0], [2, 1]]);
    expect(messages[1].solutions[0].replaceWith).toBe('  ');
  }));

  describe('when resolving import paths using eslint-plugin-import', function () {
    (0, _jasmineFix.it)('correctly resolves imports from parent', _asyncToGenerator(function* () {
      var editor = yield atom.workspace.open(importingpath);
      var messages = yield lint(editor);

      expect(messages.length).toBe(0);
    }));

    (0, _jasmineFix.it)('shows a message for an invalid import', _asyncToGenerator(function* () {
      var editor = yield atom.workspace.open(badImportPath);
      var messages = yield lint(editor);
      var expected = "Unable to resolve path to module '../nonexistent'. (import/no-unresolved)";
      var expectedUrl = 'https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/no-unresolved.md';

      expect(messages.length).toBe(1);
      expect(messages[0].severity).toBe('error');
      expect(messages[0].excerpt).toBe(expected);
      expect(messages[0].url).toBe(expectedUrl);
      expect(messages[0].location.file).toBe(badImportPath);
      expect(messages[0].location.position).toEqual([[0, 24], [0, 39]]);
      expect(messages[0].solutions).not.toBeDefined();
    }));
  });

  describe('when a file is specified in an .eslintignore file', function () {
    (0, _jasmineFix.beforeEach)(function () {
      atom.config.set('linter-eslint.disableEslintIgnore', false);
    });

    (0, _jasmineFix.it)('will not give warnings when linting the file', _asyncToGenerator(function* () {
      var editor = yield atom.workspace.open(ignoredPath);
      var messages = yield lint(editor);

      expect(messages.length).toBe(0);
    }));

    (0, _jasmineFix.it)('will not give warnings when autofixing the file', _asyncToGenerator(function* () {
      var editor = yield atom.workspace.open(ignoredPath);
      atom.commands.dispatch(atom.views.getView(editor), 'linter-eslint:fix-file');
      var expectedMessage = 'Linter-ESLint: Fix complete.';
      var notification = yield getNotification(expectedMessage);

      expect(notification.getMessage()).toBe(expectedMessage);
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
      var tempFixturePath = yield copyFileToTempDir(fixPath);
      editor = yield atom.workspace.open(tempFixturePath);
      tempDir = path.dirname(tempFixturePath);
      // Copy the config to the same temporary directory
      yield copyFileToDir(configPath, tempDir);
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

    // NOTE: This actually works, but if both specs in this describe() are enabled
    // a bug within Atom is somewhat reliably triggered, so this needs to stay
    // disabled for now
    xit('should not fix linting errors for rules that are disabled with rulesToDisableWhileFixing', _asyncToGenerator(function* () {
      atom.config.set('linter-eslint.rulesToDisableWhileFixing', ['semi']);

      yield firstLint(editor);
      yield makeFixes(editor);
      var messagesAfterFixing = yield lint(editor);
      var expected = 'Extra semicolon. (semi)';
      var expectedUrl = 'http://eslint.org/docs/rules/semi';

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
      var tempFixturePath = yield copyFileToTempDir(fixPath);
      editor = yield atom.workspace.open(tempFixturePath);
      tempDir = path.dirname(tempFixturePath);
      // Copy the config to the same temporary directory
      yield copyFileToDir(configPath, tempDir);
    }));

    afterEach(function () {
      // Remove the temporary directory
      _rimraf2['default'].sync(tempDir);
    });

    (0, _jasmineFix.it)('does not delete the cache file when performing fixes', _asyncToGenerator(function* () {
      var tempCacheFile = yield copyFileToDir(cachePath, tempDir);
      var checkCachefileExists = function checkCachefileExists() {
        fs.statSync(tempCacheFile);
      };
      expect(checkCachefileExists).not.toThrow();
      yield makeFixes(editor);
      expect(checkCachefileExists).not.toThrow();
    }));
  });

  describe('Ignores specified rules when editing', function () {
    var expected = 'Trailing spaces not allowed. (no-trailing-spaces)';
    var expectedUrl = 'http://eslint.org/docs/rules/no-trailing-spaces';

    (0, _jasmineFix.it)('does nothing on saved files', _asyncToGenerator(function* () {
      atom.config.set('linter-eslint.rulesToSilenceWhileTyping', ['no-trailing-spaces']);
      var editor = yield atom.workspace.open(modifiedIgnoreSpacePath);
      var messages = yield lint(editor);

      expect(messages.length).toBe(1);
      expect(messages[0].severity).toBe('error');
      expect(messages[0].excerpt).toBe(expected);
      expect(messages[0].url).toBe(expectedUrl);
      expect(messages[0].location.file).toBe(modifiedIgnoreSpacePath);
      expect(messages[0].location.position).toEqual([[0, 9], [0, 10]]);
    }));

    (0, _jasmineFix.it)('works when the file is modified', _asyncToGenerator(function* () {
      var editor = yield atom.workspace.open(modifiedIgnorePath);

      // Verify no error before
      var firstMessages = yield lint(editor);
      expect(firstMessages.length).toBe(0);

      // Insert a space into the editor
      editor.getBuffer().insert([0, 9], ' ');

      // Verify the space is showing an error
      var messages = yield lint(editor);
      expect(messages.length).toBe(1);
      expect(messages[0].severity).toBe('error');
      expect(messages[0].excerpt).toBe(expected);
      expect(messages[0].url).toBe(expectedUrl);
      expect(messages[0].location.file).toBe(modifiedIgnorePath);
      expect(messages[0].location.position).toEqual([[0, 9], [0, 10]]);

      // Enable the option under test
      atom.config.set('linter-eslint.rulesToSilenceWhileTyping', ['no-trailing-spaces']);

      // Check the lint results
      var newMessages = yield lint(editor);
      expect(newMessages.length).toBe(0);
    }));
  });

  describe('prints debugging information with the `debug` command', function () {
    var editor = undefined;
    var expectedMessage = 'linter-eslint debugging information';
    (0, _jasmineFix.beforeEach)(_asyncToGenerator(function* () {
      editor = yield atom.workspace.open(goodPath);
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
    var editor = yield atom.workspace.open(endRangePath);
    var messages = yield lint(editor);
    var expected = 'Unreachable code. (no-unreachable)';
    var expectedUrl = 'http://eslint.org/docs/rules/no-unreachable';

    expect(messages[0].severity).toBe('error');
    expect(messages[0].excerpt).toBe(expected);
    expect(messages[0].url).toBe(expectedUrl);
    expect(messages[0].location.file).toBe(endRangePath);
    expect(messages[0].location.position).toEqual([[5, 2], [6, 15]]);
  }));

  describe('when setting `disableWhenNoEslintConfig` is false', function () {
    var editor = undefined;
    var tempFixtureDir = undefined;

    (0, _jasmineFix.beforeEach)(_asyncToGenerator(function* () {
      atom.config.set('linter-eslint.disableWhenNoEslintConfig', false);

      var tempFilePath = yield copyFileToTempDir(badInlinePath);
      editor = yield atom.workspace.open(tempFilePath);
      tempFixtureDir = path.dirname(tempFilePath);
    }));

    afterEach(function () {
      _rimraf2['default'].sync(tempFixtureDir);
    });

    (0, _jasmineFix.it)('errors when no config file is found', _asyncToGenerator(function* () {
      var didError = undefined;
      var gotLintingErrors = undefined;

      try {
        var messages = yield lint(editor);
        // Older versions of ESLint will report an error
        // (or if current user running tests has a config in their home directory)
        var expected = "'foo' is not defined. (no-undef)";
        var expectedUrl = 'http://eslint.org/docs/rules/no-undef';
        expect(messages.length).toBe(1);
        expect(messages[0].excerpt).toBe(expected);
        expect(messages[0].url).toBe(expectedUrl);
        gotLintingErrors = true;
      } catch (err) {
        // Newer versions of ESLint will throw an exception
        expect(err.message).toBe('No ESLint configuration found.');
        didError = true;
      }

      expect(didError || gotLintingErrors).toBe(true);
    }));
  });

  describe('when `disableWhenNoEslintConfig` is true', function () {
    var editor = undefined;
    var tempFixtureDir = undefined;

    (0, _jasmineFix.beforeEach)(_asyncToGenerator(function* () {
      atom.config.set('linter-eslint.disableWhenNoEslintConfig', true);

      var tempFilePath = yield copyFileToTempDir(badInlinePath);
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
      var fooPath = path.join(badCachePath, 'temp', 'foo.js');
      var newConfigPath = path.join(badCachePath, 'temp', '.eslintrc.js');
      var editor = yield atom.workspace.open(fooPath);
      function undefMsg(varName) {
        return '\'' + varName + '\' is not defined. (no-undef)';
      }
      var expectedUrl = 'http://eslint.org/docs/rules/no-undef';

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
      var editor = yield atom.workspace.open(badImportPath);
      var messages = yield lint(editor);
      var expected = "Unable to resolve path to module '../nonexistent'. (import/no-unresolved)";

      expect(messages.length).toBe(1);
      expect(messages[0].severity).toBe('error');
      expect(messages[0].excerpt).toBe(expected);
      expect(messages[0].url).toBe(expectedUrl);
      expect(messages[0].location.file).toBe(badImportPath);
      expect(messages[0].location.position).toEqual([[0, 24], [0, 39]]);
      expect(messages[0].solutions).not.toBeDefined();
    }));

    (0, _jasmineFix.it)("doesn't show the rule ID when disabled", _asyncToGenerator(function* () {
      atom.config.set('linter-eslint.showRuleIdInMessage', false);
      var editor = yield atom.workspace.open(badImportPath);
      var messages = yield lint(editor);
      var expected = "Unable to resolve path to module '../nonexistent'.";

      expect(messages.length).toBe(1);
      expect(messages[0].severity).toBe('error');
      expect(messages[0].excerpt).toBe(expected);
      expect(messages[0].url).toBe(expectedUrl);
      expect(messages[0].location.file).toBe(badImportPath);
      expect(messages[0].location.position).toEqual([[0, 24], [0, 39]]);
      expect(messages[0].solutions).not.toBeDefined();
    }));
  });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1Ly5hdG9tL3BhY2thZ2VzL2xpbnRlci1lc2xpbnQvc3BlYy9saW50ZXItZXNsaW50LXNwZWMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IklBMkRlLGVBQWUscUJBQTlCLFdBQStCLGVBQWUsRUFBRTtBQUM5QyxTQUFPLElBQUksT0FBTyxDQUFDLFVBQUMsT0FBTyxFQUFLO0FBQzlCLFFBQUksZUFBZSxZQUFBLENBQUE7QUFDbkIsUUFBTSxlQUFlLEdBQUcsU0FBbEIsZUFBZSxDQUFJLFlBQVksRUFBSztBQUN4QyxVQUFJLFlBQVksQ0FBQyxVQUFVLEVBQUUsS0FBSyxlQUFlLEVBQUU7Ozs7QUFJakQsZUFBTTtPQUNQOztBQUVELHFCQUFlLENBQUMsT0FBTyxFQUFFLENBQUE7QUFDekIsYUFBTyxDQUFDLFlBQVksQ0FBQyxDQUFBO0tBQ3RCLENBQUE7O0FBRUQsbUJBQWUsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLG9CQUFvQixDQUFDLGVBQWUsQ0FBQyxDQUFBO0dBQzNFLENBQUMsQ0FBQTtDQUNIOztJQUVjLFNBQVMscUJBQXhCLFdBQXlCLFVBQVUsRUFBRTtBQUNuQyxTQUFPLElBQUksT0FBTyxtQkFBQyxXQUFPLE9BQU8sRUFBSzs7QUFFcEMsUUFBTSxlQUFlLEdBQUcsVUFBVSxDQUFDLFNBQVMsRUFBRSxDQUFDLFdBQVcsbUJBQUMsYUFBWTtBQUNyRSxxQkFBZSxDQUFDLE9BQU8sRUFBRSxDQUFBOzs7QUFHekIsYUFBTyxFQUFFLENBQUE7S0FDVixFQUFDLENBQUE7OztBQUdGLFFBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxFQUFFLHdCQUF3QixDQUFDLENBQUE7QUFDaEYsUUFBTSxlQUFlLEdBQUcsOEJBQThCLENBQUE7QUFDdEQsUUFBTSxZQUFZLEdBQUcsTUFBTSxlQUFlLENBQUMsZUFBZSxDQUFDLENBQUE7O0FBRTNELFVBQU0sQ0FB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QUFDLFFBQVEsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUNqRSxZQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsQ0FBQTtLQUNoRCxFQUFDLENBQUE7R0FDSCxDQUFDLENBQUE7Q0FDSCxDQUFDLENBQUEiLCJmaWxlIjoiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvbGludGVyLWVzbGludC9zcGVjL2xpbnRlci1lc2xpbnQtc3BlYy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnXG5cbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCdcbmltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzJ1xuaW1wb3J0IHsgdG1wZGlyIH0gZnJvbSAnb3MnXG5pbXBvcnQgcmltcmFmIGZyb20gJ3JpbXJhZidcbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bnVzZWQtdmFyc1xuaW1wb3J0IHsgYmVmb3JlRWFjaCwgaXQsIGZpdCB9IGZyb20gJ2phc21pbmUtZml4J1xuaW1wb3J0IGxpbnRlckVzbGludCBmcm9tICcuLi9zcmMvbWFpbidcblxuY29uc3QgZml4dHVyZXNEaXIgPSBwYXRoLmpvaW4oX19kaXJuYW1lLCAnZml4dHVyZXMnKVxuXG5jb25zdCBnb29kUGF0aCA9IHBhdGguam9pbihmaXh0dXJlc0RpciwgJ2ZpbGVzJywgJ2dvb2QuanMnKVxuY29uc3QgYmFkUGF0aCA9IHBhdGguam9pbihmaXh0dXJlc0RpciwgJ2ZpbGVzJywgJ2JhZC5qcycpXG5jb25zdCBiYWRJbmxpbmVQYXRoID0gcGF0aC5qb2luKGZpeHR1cmVzRGlyLCAnZmlsZXMnLCAnYmFkSW5saW5lLmpzJylcbmNvbnN0IGVtcHR5UGF0aCA9IHBhdGguam9pbihmaXh0dXJlc0RpciwgJ2ZpbGVzJywgJ2VtcHR5LmpzJylcbmNvbnN0IGZpeFBhdGggPSBwYXRoLmpvaW4oZml4dHVyZXNEaXIsICdmaWxlcycsICdmaXguanMnKVxuY29uc3QgY2FjaGVQYXRoID0gcGF0aC5qb2luKGZpeHR1cmVzRGlyLCAnZmlsZXMnLCAnLmVzbGludGNhY2hlJylcbmNvbnN0IGNvbmZpZ1BhdGggPSBwYXRoLmpvaW4oZml4dHVyZXNEaXIsICdjb25maWdzJywgJy5lc2xpbnRyYy55bWwnKVxuY29uc3QgaW1wb3J0aW5ncGF0aCA9IHBhdGguam9pbihmaXh0dXJlc0RpcixcbiAgJ2ltcG9ydC1yZXNvbHV0aW9uJywgJ25lc3RlZCcsICdpbXBvcnRpbmcuanMnKVxuY29uc3QgYmFkSW1wb3J0UGF0aCA9IHBhdGguam9pbihmaXh0dXJlc0RpcixcbiAgJ2ltcG9ydC1yZXNvbHV0aW9uJywgJ25lc3RlZCcsICdiYWRJbXBvcnQuanMnKVxuY29uc3QgaWdub3JlZFBhdGggPSBwYXRoLmpvaW4oZml4dHVyZXNEaXIsICdlc2xpbnRpZ25vcmUnLCAnaWdub3JlZC5qcycpXG5jb25zdCBtb2RpZmllZElnbm9yZVBhdGggPSBwYXRoLmpvaW4oZml4dHVyZXNEaXIsXG4gICdtb2RpZmllZC1pZ25vcmUtcnVsZScsICdmb28uanMnKVxuY29uc3QgbW9kaWZpZWRJZ25vcmVTcGFjZVBhdGggPSBwYXRoLmpvaW4oZml4dHVyZXNEaXIsXG4gICdtb2RpZmllZC1pZ25vcmUtcnVsZScsICdmb28tc3BhY2UuanMnKVxuY29uc3QgZW5kUmFuZ2VQYXRoID0gcGF0aC5qb2luKGZpeHR1cmVzRGlyLCAnZW5kLXJhbmdlJywgJ25vLXVucmVhY2hhYmxlLmpzJylcbmNvbnN0IGJhZENhY2hlUGF0aCA9IHBhdGguam9pbihmaXh0dXJlc0RpciwgJ2JhZENhY2hlJylcblxuLyoqXG4gKiBBc3luYyBoZWxwZXIgdG8gY29weSBhIGZpbGUgZnJvbSBvbmUgcGxhY2UgdG8gYW5vdGhlciBvbiB0aGUgZmlsZXN5c3RlbS5cbiAqIEBwYXJhbSAge3N0cmluZ30gZmlsZVRvQ29weVBhdGggIFBhdGggb2YgdGhlIGZpbGUgdG8gYmUgY29waWVkXG4gKiBAcGFyYW0gIHtzdHJpbmd9IGRlc3RpbmF0aW9uRGlyICBEaXJlY3RvcnkgdG8gcGFzdGUgdGhlIGZpbGUgaW50b1xuICogQHJldHVybiB7c3RyaW5nfSAgICAgICAgICAgICAgICAgRnVsbCBwYXRoIG9mIHRoZSBmaWxlIGluIGNvcHkgZGVzdGluYXRpb25cbiAqL1xuZnVuY3Rpb24gY29weUZpbGVUb0RpcihmaWxlVG9Db3B5UGF0aCwgZGVzdGluYXRpb25EaXIpIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgY29uc3QgZGVzdGluYXRpb25QYXRoID0gcGF0aC5qb2luKGRlc3RpbmF0aW9uRGlyLCBwYXRoLmJhc2VuYW1lKGZpbGVUb0NvcHlQYXRoKSlcbiAgICBjb25zdCB3cyA9IGZzLmNyZWF0ZVdyaXRlU3RyZWFtKGRlc3RpbmF0aW9uUGF0aClcbiAgICB3cy5vbignY2xvc2UnLCAoKSA9PiByZXNvbHZlKGRlc3RpbmF0aW9uUGF0aCkpXG4gICAgZnMuY3JlYXRlUmVhZFN0cmVhbShmaWxlVG9Db3B5UGF0aCkucGlwZSh3cylcbiAgfSlcbn1cblxuLyoqXG4gKiBVdGlsaXR5IGhlbHBlciB0byBjb3B5IGEgZmlsZSBpbnRvIHRoZSBPUyB0ZW1wIGRpcmVjdG9yeS5cbiAqXG4gKiBAcGFyYW0gIHtzdHJpbmd9IGZpbGVUb0NvcHlQYXRoICBQYXRoIG9mIHRoZSBmaWxlIHRvIGJlIGNvcGllZFxuICogQHJldHVybiB7c3RyaW5nfSAgICAgICAgICAgICAgICAgRnVsbCBwYXRoIG9mIHRoZSBmaWxlIGluIGNvcHkgZGVzdGluYXRpb25cbiAqL1xuZnVuY3Rpb24gY29weUZpbGVUb1RlbXBEaXIoZmlsZVRvQ29weVBhdGgpIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKGFzeW5jIChyZXNvbHZlKSA9PiB7XG4gICAgY29uc3QgdGVtcEZpeHR1cmVEaXIgPSBmcy5ta2R0ZW1wU3luYyh0bXBkaXIoKSArIHBhdGguc2VwKVxuICAgIHJlc29sdmUoYXdhaXQgY29weUZpbGVUb0RpcihmaWxlVG9Db3B5UGF0aCwgdGVtcEZpeHR1cmVEaXIpKVxuICB9KVxufVxuXG5hc3luYyBmdW5jdGlvbiBnZXROb3RpZmljYXRpb24oZXhwZWN0ZWRNZXNzYWdlKSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgIGxldCBub3RpZmljYXRpb25TdWJcbiAgICBjb25zdCBuZXdOb3RpZmljYXRpb24gPSAobm90aWZpY2F0aW9uKSA9PiB7XG4gICAgICBpZiAobm90aWZpY2F0aW9uLmdldE1lc3NhZ2UoKSAhPT0gZXhwZWN0ZWRNZXNzYWdlKSB7XG4gICAgICAgIC8vIEFzIHRoZSBzcGVjcyBleGVjdXRlIGFzeW5jaHJvbm91c2x5LCBpdCdzIHBvc3NpYmxlIGEgbm90aWZpY2F0aW9uXG4gICAgICAgIC8vIGZyb20gYSBkaWZmZXJlbnQgc3BlYyB3YXMgZ3JhYmJlZCwgaWYgdGhlIG1lc3NhZ2UgZG9lc24ndCBtYXRjaCB3aGF0XG4gICAgICAgIC8vIGlzIGV4cGVjdGVkIHNpbXBseSByZXR1cm4gYW5kIGtlZXAgd2FpdGluZyBmb3IgdGhlIG5leHQgbWVzc2FnZS5cbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICAvLyBEaXNwb3NlIG9mIHRoZSBub3RpZmljYWl0b24gc3Vic2NyaXB0aW9uXG4gICAgICBub3RpZmljYXRpb25TdWIuZGlzcG9zZSgpXG4gICAgICByZXNvbHZlKG5vdGlmaWNhdGlvbilcbiAgICB9XG4gICAgLy8gU3Vic2NyaWJlIHRvIEF0b20ncyBub3RpZmljYXRpb25zXG4gICAgbm90aWZpY2F0aW9uU3ViID0gYXRvbS5ub3RpZmljYXRpb25zLm9uRGlkQWRkTm90aWZpY2F0aW9uKG5ld05vdGlmaWNhdGlvbilcbiAgfSlcbn1cblxuYXN5bmMgZnVuY3Rpb24gbWFrZUZpeGVzKHRleHRFZGl0b3IpIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKGFzeW5jIChyZXNvbHZlKSA9PiB7XG4gICAgLy8gU3Vic2NyaWJlIHRvIHRoZSBmaWxlIHJlbG9hZCBldmVudFxuICAgIGNvbnN0IGVkaXRvclJlbG9hZFN1YiA9IHRleHRFZGl0b3IuZ2V0QnVmZmVyKCkub25EaWRSZWxvYWQoYXN5bmMgKCkgPT4ge1xuICAgICAgZWRpdG9yUmVsb2FkU3ViLmRpc3Bvc2UoKVxuICAgICAgLy8gRmlsZSBoYXMgYmVlbiByZWxvYWRlZCBpbiBBdG9tLCBub3RpZmljYXRpb24gY2hlY2tpbmcgd2lsbCBoYXBwZW5cbiAgICAgIC8vIGFzeW5jIGVpdGhlciB3YXksIGJ1dCBzaG91bGQgYWxyZWFkeSBiZSBmaW5pc2hlZCBhdCB0aGlzIHBvaW50XG4gICAgICByZXNvbHZlKClcbiAgICB9KVxuXG4gICAgLy8gTm93IHRoYXQgYWxsIHRoZSByZXF1aXJlZCBzdWJzY3JpcHRpb25zIGFyZSBhY3RpdmUsIHNlbmQgb2ZmIGEgZml4IHJlcXVlc3RcbiAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKGF0b20udmlld3MuZ2V0Vmlldyh0ZXh0RWRpdG9yKSwgJ2xpbnRlci1lc2xpbnQ6Zml4LWZpbGUnKVxuICAgIGNvbnN0IGV4cGVjdGVkTWVzc2FnZSA9ICdMaW50ZXItRVNMaW50OiBGaXggY29tcGxldGUuJ1xuICAgIGNvbnN0IG5vdGlmaWNhdGlvbiA9IGF3YWl0IGdldE5vdGlmaWNhdGlvbihleHBlY3RlZE1lc3NhZ2UpXG5cbiAgICBleHBlY3Qobm90aWZpY2F0aW9uLmdldE1lc3NhZ2UoKSkudG9CZShleHBlY3RlZE1lc3NhZ2UpXG4gICAgZXhwZWN0KG5vdGlmaWNhdGlvbi5nZXRUeXBlKCkpLnRvQmUoJ3N1Y2Nlc3MnKVxuICB9KVxufVxuXG5kZXNjcmliZSgnVGhlIGVzbGludCBwcm92aWRlciBmb3IgTGludGVyJywgKCkgPT4ge1xuICBjb25zdCBsaW50ZXJQcm92aWRlciA9IGxpbnRlckVzbGludC5wcm92aWRlTGludGVyKClcbiAgY29uc3QgbGludCA9IGxpbnRlclByb3ZpZGVyLmxpbnRcblxuICBiZWZvcmVFYWNoKGFzeW5jICgpID0+IHtcbiAgICBhdG9tLmNvbmZpZy5zZXQoJ2xpbnRlci1lc2xpbnQuZGlzYWJsZUZTQ2FjaGUnLCBmYWxzZSlcbiAgICBhdG9tLmNvbmZpZy5zZXQoJ2xpbnRlci1lc2xpbnQuZGlzYWJsZUVzbGludElnbm9yZScsIHRydWUpXG5cbiAgICAvLyBBY3RpdmF0ZSB0aGUgSmF2YVNjcmlwdCBsYW5ndWFnZSBzbyBBdG9tIGtub3dzIHdoYXQgdGhlIGZpbGVzIGFyZVxuICAgIGF3YWl0IGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKCdsYW5ndWFnZS1qYXZhc2NyaXB0JylcbiAgICAvLyBBY3RpdmF0ZSB0aGUgcHJvdmlkZXJcbiAgICBhd2FpdCBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZSgnbGludGVyLWVzbGludCcpXG4gIH0pXG5cbiAgZGVzY3JpYmUoJ2NoZWNrcyBiYWQuanMgYW5kJywgKCkgPT4ge1xuICAgIGxldCBlZGl0b3IgPSBudWxsXG4gICAgYmVmb3JlRWFjaChhc3luYyAoKSA9PiB7XG4gICAgICBlZGl0b3IgPSBhd2FpdCBhdG9tLndvcmtzcGFjZS5vcGVuKGJhZFBhdGgpXG4gICAgfSlcblxuICAgIGl0KCd2ZXJpZmllcyB0aGUgbWVzc2FnZXMnLCBhc3luYyAoKSA9PiB7XG4gICAgICBjb25zdCBtZXNzYWdlcyA9IGF3YWl0IGxpbnQoZWRpdG9yKVxuICAgICAgZXhwZWN0KG1lc3NhZ2VzLmxlbmd0aCkudG9CZSgyKVxuXG4gICAgICBjb25zdCBleHBlY3RlZDAgPSBcIidmb28nIGlzIG5vdCBkZWZpbmVkLiAobm8tdW5kZWYpXCJcbiAgICAgIGNvbnN0IGV4cGVjdGVkMFVybCA9ICdodHRwOi8vZXNsaW50Lm9yZy9kb2NzL3J1bGVzL25vLXVuZGVmJ1xuICAgICAgY29uc3QgZXhwZWN0ZWQxID0gJ0V4dHJhIHNlbWljb2xvbi4gKHNlbWkpJ1xuICAgICAgY29uc3QgZXhwZWN0ZWQxVXJsID0gJ2h0dHA6Ly9lc2xpbnQub3JnL2RvY3MvcnVsZXMvc2VtaSdcblxuICAgICAgZXhwZWN0KG1lc3NhZ2VzWzBdLnNldmVyaXR5KS50b0JlKCdlcnJvcicpXG4gICAgICBleHBlY3QobWVzc2FnZXNbMF0uZXhjZXJwdCkudG9CZShleHBlY3RlZDApXG4gICAgICBleHBlY3QobWVzc2FnZXNbMF0udXJsKS50b0JlKGV4cGVjdGVkMFVybClcbiAgICAgIGV4cGVjdChtZXNzYWdlc1swXS5sb2NhdGlvbi5maWxlKS50b0JlKGJhZFBhdGgpXG4gICAgICBleHBlY3QobWVzc2FnZXNbMF0ubG9jYXRpb24ucG9zaXRpb24pLnRvRXF1YWwoW1swLCAwXSwgWzAsIDNdXSlcbiAgICAgIGV4cGVjdChtZXNzYWdlc1swXS5zb2x1dGlvbnMpLm5vdC50b0JlRGVmaW5lZCgpXG5cbiAgICAgIGV4cGVjdChtZXNzYWdlc1sxXS5zZXZlcml0eSkudG9CZSgnZXJyb3InKVxuICAgICAgZXhwZWN0KG1lc3NhZ2VzWzFdLmV4Y2VycHQpLnRvQmUoZXhwZWN0ZWQxKVxuICAgICAgZXhwZWN0KG1lc3NhZ2VzWzFdLnVybCkudG9CZShleHBlY3RlZDFVcmwpXG4gICAgICBleHBlY3QobWVzc2FnZXNbMV0ubG9jYXRpb24uZmlsZSkudG9CZShiYWRQYXRoKVxuICAgICAgZXhwZWN0KG1lc3NhZ2VzWzFdLmxvY2F0aW9uLnBvc2l0aW9uKS50b0VxdWFsKFtbMCwgOF0sIFswLCA5XV0pXG4gICAgICBleHBlY3QobWVzc2FnZXNbMV0uc29sdXRpb25zLmxlbmd0aCkudG9CZSgxKVxuICAgICAgZXhwZWN0KG1lc3NhZ2VzWzFdLnNvbHV0aW9uc1swXS5wb3NpdGlvbikudG9FcXVhbChbWzAsIDZdLCBbMCwgOV1dKVxuICAgICAgZXhwZWN0KG1lc3NhZ2VzWzFdLnNvbHV0aW9uc1swXS5yZXBsYWNlV2l0aCkudG9CZSgnNDInKVxuICAgIH0pXG4gIH0pXG5cbiAgaXQoJ2ZpbmRzIG5vdGhpbmcgd3Jvbmcgd2l0aCBhbiBlbXB0eSBmaWxlJywgYXN5bmMgKCkgPT4ge1xuICAgIGNvbnN0IGVkaXRvciA9IGF3YWl0IGF0b20ud29ya3NwYWNlLm9wZW4oZW1wdHlQYXRoKVxuICAgIGNvbnN0IG1lc3NhZ2VzID0gYXdhaXQgbGludChlZGl0b3IpXG5cbiAgICBleHBlY3QobWVzc2FnZXMubGVuZ3RoKS50b0JlKDApXG4gIH0pXG5cbiAgaXQoJ2ZpbmRzIG5vdGhpbmcgd3Jvbmcgd2l0aCBhIHZhbGlkIGZpbGUnLCBhc3luYyAoKSA9PiB7XG4gICAgY29uc3QgZWRpdG9yID0gYXdhaXQgYXRvbS53b3Jrc3BhY2Uub3Blbihnb29kUGF0aClcbiAgICBjb25zdCBtZXNzYWdlcyA9IGF3YWl0IGxpbnQoZWRpdG9yKVxuXG4gICAgZXhwZWN0KG1lc3NhZ2VzLmxlbmd0aCkudG9CZSgwKVxuICB9KVxuXG4gIGl0KCdyZXBvcnRzIHRoZSBmaXhlcyBmb3IgZml4YWJsZSBlcnJvcnMnLCBhc3luYyAoKSA9PiB7XG4gICAgY29uc3QgZWRpdG9yID0gYXdhaXQgYXRvbS53b3Jrc3BhY2Uub3BlbihmaXhQYXRoKVxuICAgIGNvbnN0IG1lc3NhZ2VzID0gYXdhaXQgbGludChlZGl0b3IpXG5cbiAgICBleHBlY3QobWVzc2FnZXNbMF0uc29sdXRpb25zWzBdLnBvc2l0aW9uKS50b0VxdWFsKFtbMCwgMTBdLCBbMSwgOF1dKVxuICAgIGV4cGVjdChtZXNzYWdlc1swXS5zb2x1dGlvbnNbMF0ucmVwbGFjZVdpdGgpLnRvQmUoJzZcXG5mdW5jdGlvbicpXG5cbiAgICBleHBlY3QobWVzc2FnZXNbMV0uc29sdXRpb25zWzBdLnBvc2l0aW9uKS50b0VxdWFsKFtbMiwgMF0sIFsyLCAxXV0pXG4gICAgZXhwZWN0KG1lc3NhZ2VzWzFdLnNvbHV0aW9uc1swXS5yZXBsYWNlV2l0aCkudG9CZSgnICAnKVxuICB9KVxuXG4gIGRlc2NyaWJlKCd3aGVuIHJlc29sdmluZyBpbXBvcnQgcGF0aHMgdXNpbmcgZXNsaW50LXBsdWdpbi1pbXBvcnQnLCAoKSA9PiB7XG4gICAgaXQoJ2NvcnJlY3RseSByZXNvbHZlcyBpbXBvcnRzIGZyb20gcGFyZW50JywgYXN5bmMgKCkgPT4ge1xuICAgICAgY29uc3QgZWRpdG9yID0gYXdhaXQgYXRvbS53b3Jrc3BhY2Uub3BlbihpbXBvcnRpbmdwYXRoKVxuICAgICAgY29uc3QgbWVzc2FnZXMgPSBhd2FpdCBsaW50KGVkaXRvcilcblxuICAgICAgZXhwZWN0KG1lc3NhZ2VzLmxlbmd0aCkudG9CZSgwKVxuICAgIH0pXG5cbiAgICBpdCgnc2hvd3MgYSBtZXNzYWdlIGZvciBhbiBpbnZhbGlkIGltcG9ydCcsIGFzeW5jICgpID0+IHtcbiAgICAgIGNvbnN0IGVkaXRvciA9IGF3YWl0IGF0b20ud29ya3NwYWNlLm9wZW4oYmFkSW1wb3J0UGF0aClcbiAgICAgIGNvbnN0IG1lc3NhZ2VzID0gYXdhaXQgbGludChlZGl0b3IpXG4gICAgICBjb25zdCBleHBlY3RlZCA9IFwiVW5hYmxlIHRvIHJlc29sdmUgcGF0aCB0byBtb2R1bGUgJy4uL25vbmV4aXN0ZW50Jy4gKGltcG9ydC9uby11bnJlc29sdmVkKVwiXG4gICAgICBjb25zdCBleHBlY3RlZFVybCA9ICdodHRwczovL2dpdGh1Yi5jb20vYmVubW9zaGVyL2VzbGludC1wbHVnaW4taW1wb3J0L2Jsb2IvbWFzdGVyL2RvY3MvcnVsZXMvbm8tdW5yZXNvbHZlZC5tZCdcblxuICAgICAgZXhwZWN0KG1lc3NhZ2VzLmxlbmd0aCkudG9CZSgxKVxuICAgICAgZXhwZWN0KG1lc3NhZ2VzWzBdLnNldmVyaXR5KS50b0JlKCdlcnJvcicpXG4gICAgICBleHBlY3QobWVzc2FnZXNbMF0uZXhjZXJwdCkudG9CZShleHBlY3RlZClcbiAgICAgIGV4cGVjdChtZXNzYWdlc1swXS51cmwpLnRvQmUoZXhwZWN0ZWRVcmwpXG4gICAgICBleHBlY3QobWVzc2FnZXNbMF0ubG9jYXRpb24uZmlsZSkudG9CZShiYWRJbXBvcnRQYXRoKVxuICAgICAgZXhwZWN0KG1lc3NhZ2VzWzBdLmxvY2F0aW9uLnBvc2l0aW9uKS50b0VxdWFsKFtbMCwgMjRdLCBbMCwgMzldXSlcbiAgICAgIGV4cGVjdChtZXNzYWdlc1swXS5zb2x1dGlvbnMpLm5vdC50b0JlRGVmaW5lZCgpXG4gICAgfSlcbiAgfSlcblxuICBkZXNjcmliZSgnd2hlbiBhIGZpbGUgaXMgc3BlY2lmaWVkIGluIGFuIC5lc2xpbnRpZ25vcmUgZmlsZScsICgpID0+IHtcbiAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgIGF0b20uY29uZmlnLnNldCgnbGludGVyLWVzbGludC5kaXNhYmxlRXNsaW50SWdub3JlJywgZmFsc2UpXG4gICAgfSlcblxuICAgIGl0KCd3aWxsIG5vdCBnaXZlIHdhcm5pbmdzIHdoZW4gbGludGluZyB0aGUgZmlsZScsIGFzeW5jICgpID0+IHtcbiAgICAgIGNvbnN0IGVkaXRvciA9IGF3YWl0IGF0b20ud29ya3NwYWNlLm9wZW4oaWdub3JlZFBhdGgpXG4gICAgICBjb25zdCBtZXNzYWdlcyA9IGF3YWl0IGxpbnQoZWRpdG9yKVxuXG4gICAgICBleHBlY3QobWVzc2FnZXMubGVuZ3RoKS50b0JlKDApXG4gICAgfSlcblxuICAgIGl0KCd3aWxsIG5vdCBnaXZlIHdhcm5pbmdzIHdoZW4gYXV0b2ZpeGluZyB0aGUgZmlsZScsIGFzeW5jICgpID0+IHtcbiAgICAgIGNvbnN0IGVkaXRvciA9IGF3YWl0IGF0b20ud29ya3NwYWNlLm9wZW4oaWdub3JlZFBhdGgpXG4gICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKGF0b20udmlld3MuZ2V0VmlldyhlZGl0b3IpLCAnbGludGVyLWVzbGludDpmaXgtZmlsZScpXG4gICAgICBjb25zdCBleHBlY3RlZE1lc3NhZ2UgPSAnTGludGVyLUVTTGludDogRml4IGNvbXBsZXRlLidcbiAgICAgIGNvbnN0IG5vdGlmaWNhdGlvbiA9IGF3YWl0IGdldE5vdGlmaWNhdGlvbihleHBlY3RlZE1lc3NhZ2UpXG5cbiAgICAgIGV4cGVjdChub3RpZmljYXRpb24uZ2V0TWVzc2FnZSgpKS50b0JlKGV4cGVjdGVkTWVzc2FnZSlcbiAgICB9KVxuICB9KVxuXG4gIGRlc2NyaWJlKCdmaXhlcyBlcnJvcnMnLCAoKSA9PiB7XG4gICAgbGV0IGVkaXRvclxuICAgIGxldCB0ZW1wRGlyXG5cbiAgICBiZWZvcmVFYWNoKGFzeW5jICgpID0+IHtcbiAgICAgIC8vIENvcHkgdGhlIGZpbGUgdG8gYSB0ZW1wb3JhcnkgZm9sZGVyXG4gICAgICBjb25zdCB0ZW1wRml4dHVyZVBhdGggPSBhd2FpdCBjb3B5RmlsZVRvVGVtcERpcihmaXhQYXRoKVxuICAgICAgZWRpdG9yID0gYXdhaXQgYXRvbS53b3Jrc3BhY2Uub3Blbih0ZW1wRml4dHVyZVBhdGgpXG4gICAgICB0ZW1wRGlyID0gcGF0aC5kaXJuYW1lKHRlbXBGaXh0dXJlUGF0aClcbiAgICAgIC8vIENvcHkgdGhlIGNvbmZpZyB0byB0aGUgc2FtZSB0ZW1wb3JhcnkgZGlyZWN0b3J5XG4gICAgICBhd2FpdCBjb3B5RmlsZVRvRGlyKGNvbmZpZ1BhdGgsIHRlbXBEaXIpXG4gICAgfSlcblxuICAgIGFmdGVyRWFjaCgoKSA9PiB7XG4gICAgICAvLyBSZW1vdmUgdGhlIHRlbXBvcmFyeSBkaXJlY3RvcnlcbiAgICAgIHJpbXJhZi5zeW5jKHRlbXBEaXIpXG4gICAgfSlcblxuICAgIGFzeW5jIGZ1bmN0aW9uIGZpcnN0TGludCh0ZXh0RWRpdG9yKSB7XG4gICAgICBjb25zdCBtZXNzYWdlcyA9IGF3YWl0IGxpbnQodGV4dEVkaXRvcilcbiAgICAgIC8vIFRoZSBvcmlnaW5hbCBmaWxlIGhhcyB0d28gZXJyb3JzXG4gICAgICBleHBlY3QobWVzc2FnZXMubGVuZ3RoKS50b0JlKDIpXG4gICAgfVxuXG4gICAgaXQoJ3Nob3VsZCBmaXggbGludGluZyBlcnJvcnMnLCBhc3luYyAoKSA9PiB7XG4gICAgICBhd2FpdCBmaXJzdExpbnQoZWRpdG9yKVxuICAgICAgYXdhaXQgbWFrZUZpeGVzKGVkaXRvcilcbiAgICAgIGNvbnN0IG1lc3NhZ2VzQWZ0ZXJGaXhpbmcgPSBhd2FpdCBsaW50KGVkaXRvcilcblxuICAgICAgZXhwZWN0KG1lc3NhZ2VzQWZ0ZXJGaXhpbmcubGVuZ3RoKS50b0JlKDApXG4gICAgfSlcblxuICAgIC8vIE5PVEU6IFRoaXMgYWN0dWFsbHkgd29ya3MsIGJ1dCBpZiBib3RoIHNwZWNzIGluIHRoaXMgZGVzY3JpYmUoKSBhcmUgZW5hYmxlZFxuICAgIC8vIGEgYnVnIHdpdGhpbiBBdG9tIGlzIHNvbWV3aGF0IHJlbGlhYmx5IHRyaWdnZXJlZCwgc28gdGhpcyBuZWVkcyB0byBzdGF5XG4gICAgLy8gZGlzYWJsZWQgZm9yIG5vd1xuICAgIHhpdCgnc2hvdWxkIG5vdCBmaXggbGludGluZyBlcnJvcnMgZm9yIHJ1bGVzIHRoYXQgYXJlIGRpc2FibGVkIHdpdGggcnVsZXNUb0Rpc2FibGVXaGlsZUZpeGluZycsIGFzeW5jICgpID0+IHtcbiAgICAgIGF0b20uY29uZmlnLnNldCgnbGludGVyLWVzbGludC5ydWxlc1RvRGlzYWJsZVdoaWxlRml4aW5nJywgWydzZW1pJ10pXG5cbiAgICAgIGF3YWl0IGZpcnN0TGludChlZGl0b3IpXG4gICAgICBhd2FpdCBtYWtlRml4ZXMoZWRpdG9yKVxuICAgICAgY29uc3QgbWVzc2FnZXNBZnRlckZpeGluZyA9IGF3YWl0IGxpbnQoZWRpdG9yKVxuICAgICAgY29uc3QgZXhwZWN0ZWQgPSAnRXh0cmEgc2VtaWNvbG9uLiAoc2VtaSknXG4gICAgICBjb25zdCBleHBlY3RlZFVybCA9ICdodHRwOi8vZXNsaW50Lm9yZy9kb2NzL3J1bGVzL3NlbWknXG5cbiAgICAgIGV4cGVjdChtZXNzYWdlc0FmdGVyRml4aW5nLmxlbmd0aCkudG9CZSgxKVxuICAgICAgZXhwZWN0KG1lc3NhZ2VzQWZ0ZXJGaXhpbmdbMF0uZXhjZXJwdCkudG9CZShleHBlY3RlZClcbiAgICAgIGV4cGVjdChtZXNzYWdlc0FmdGVyRml4aW5nWzBdLnVybCkudG9CZShleHBlY3RlZFVybClcbiAgICB9KVxuICB9KVxuXG4gIGRlc2NyaWJlKCd3aGVuIGFuIGVzbGludCBjYWNoZSBmaWxlIGlzIHByZXNlbnQnLCAoKSA9PiB7XG4gICAgbGV0IGVkaXRvclxuICAgIGxldCB0ZW1wRGlyXG5cbiAgICBiZWZvcmVFYWNoKGFzeW5jICgpID0+IHtcbiAgICAgIC8vIENvcHkgdGhlIGZpbGUgdG8gYSB0ZW1wb3JhcnkgZm9sZGVyXG4gICAgICBjb25zdCB0ZW1wRml4dHVyZVBhdGggPSBhd2FpdCBjb3B5RmlsZVRvVGVtcERpcihmaXhQYXRoKVxuICAgICAgZWRpdG9yID0gYXdhaXQgYXRvbS53b3Jrc3BhY2Uub3Blbih0ZW1wRml4dHVyZVBhdGgpXG4gICAgICB0ZW1wRGlyID0gcGF0aC5kaXJuYW1lKHRlbXBGaXh0dXJlUGF0aClcbiAgICAgIC8vIENvcHkgdGhlIGNvbmZpZyB0byB0aGUgc2FtZSB0ZW1wb3JhcnkgZGlyZWN0b3J5XG4gICAgICBhd2FpdCBjb3B5RmlsZVRvRGlyKGNvbmZpZ1BhdGgsIHRlbXBEaXIpXG4gICAgfSlcblxuICAgIGFmdGVyRWFjaCgoKSA9PiB7XG4gICAgICAvLyBSZW1vdmUgdGhlIHRlbXBvcmFyeSBkaXJlY3RvcnlcbiAgICAgIHJpbXJhZi5zeW5jKHRlbXBEaXIpXG4gICAgfSlcblxuICAgIGl0KCdkb2VzIG5vdCBkZWxldGUgdGhlIGNhY2hlIGZpbGUgd2hlbiBwZXJmb3JtaW5nIGZpeGVzJywgYXN5bmMgKCkgPT4ge1xuICAgICAgY29uc3QgdGVtcENhY2hlRmlsZSA9IGF3YWl0IGNvcHlGaWxlVG9EaXIoY2FjaGVQYXRoLCB0ZW1wRGlyKVxuICAgICAgY29uc3QgY2hlY2tDYWNoZWZpbGVFeGlzdHMgPSAoKSA9PiB7XG4gICAgICAgIGZzLnN0YXRTeW5jKHRlbXBDYWNoZUZpbGUpXG4gICAgICB9XG4gICAgICBleHBlY3QoY2hlY2tDYWNoZWZpbGVFeGlzdHMpLm5vdC50b1Rocm93KClcbiAgICAgIGF3YWl0IG1ha2VGaXhlcyhlZGl0b3IpXG4gICAgICBleHBlY3QoY2hlY2tDYWNoZWZpbGVFeGlzdHMpLm5vdC50b1Rocm93KClcbiAgICB9KVxuICB9KVxuXG4gIGRlc2NyaWJlKCdJZ25vcmVzIHNwZWNpZmllZCBydWxlcyB3aGVuIGVkaXRpbmcnLCAoKSA9PiB7XG4gICAgY29uc3QgZXhwZWN0ZWQgPSAnVHJhaWxpbmcgc3BhY2VzIG5vdCBhbGxvd2VkLiAobm8tdHJhaWxpbmctc3BhY2VzKSdcbiAgICBjb25zdCBleHBlY3RlZFVybCA9ICdodHRwOi8vZXNsaW50Lm9yZy9kb2NzL3J1bGVzL25vLXRyYWlsaW5nLXNwYWNlcydcblxuICAgIGl0KCdkb2VzIG5vdGhpbmcgb24gc2F2ZWQgZmlsZXMnLCBhc3luYyAoKSA9PiB7XG4gICAgICBhdG9tLmNvbmZpZy5zZXQoJ2xpbnRlci1lc2xpbnQucnVsZXNUb1NpbGVuY2VXaGlsZVR5cGluZycsIFsnbm8tdHJhaWxpbmctc3BhY2VzJ10pXG4gICAgICBjb25zdCBlZGl0b3IgPSBhd2FpdCBhdG9tLndvcmtzcGFjZS5vcGVuKG1vZGlmaWVkSWdub3JlU3BhY2VQYXRoKVxuICAgICAgY29uc3QgbWVzc2FnZXMgPSBhd2FpdCBsaW50KGVkaXRvcilcblxuICAgICAgZXhwZWN0KG1lc3NhZ2VzLmxlbmd0aCkudG9CZSgxKVxuICAgICAgZXhwZWN0KG1lc3NhZ2VzWzBdLnNldmVyaXR5KS50b0JlKCdlcnJvcicpXG4gICAgICBleHBlY3QobWVzc2FnZXNbMF0uZXhjZXJwdCkudG9CZShleHBlY3RlZClcbiAgICAgIGV4cGVjdChtZXNzYWdlc1swXS51cmwpLnRvQmUoZXhwZWN0ZWRVcmwpXG4gICAgICBleHBlY3QobWVzc2FnZXNbMF0ubG9jYXRpb24uZmlsZSkudG9CZShtb2RpZmllZElnbm9yZVNwYWNlUGF0aClcbiAgICAgIGV4cGVjdChtZXNzYWdlc1swXS5sb2NhdGlvbi5wb3NpdGlvbikudG9FcXVhbChbWzAsIDldLCBbMCwgMTBdXSlcbiAgICB9KVxuXG4gICAgaXQoJ3dvcmtzIHdoZW4gdGhlIGZpbGUgaXMgbW9kaWZpZWQnLCBhc3luYyAoKSA9PiB7XG4gICAgICBjb25zdCBlZGl0b3IgPSBhd2FpdCBhdG9tLndvcmtzcGFjZS5vcGVuKG1vZGlmaWVkSWdub3JlUGF0aClcblxuICAgICAgLy8gVmVyaWZ5IG5vIGVycm9yIGJlZm9yZVxuICAgICAgY29uc3QgZmlyc3RNZXNzYWdlcyA9IGF3YWl0IGxpbnQoZWRpdG9yKVxuICAgICAgZXhwZWN0KGZpcnN0TWVzc2FnZXMubGVuZ3RoKS50b0JlKDApXG5cbiAgICAgIC8vIEluc2VydCBhIHNwYWNlIGludG8gdGhlIGVkaXRvclxuICAgICAgZWRpdG9yLmdldEJ1ZmZlcigpLmluc2VydChbMCwgOV0sICcgJylcblxuICAgICAgLy8gVmVyaWZ5IHRoZSBzcGFjZSBpcyBzaG93aW5nIGFuIGVycm9yXG4gICAgICBjb25zdCBtZXNzYWdlcyA9IGF3YWl0IGxpbnQoZWRpdG9yKVxuICAgICAgZXhwZWN0KG1lc3NhZ2VzLmxlbmd0aCkudG9CZSgxKVxuICAgICAgZXhwZWN0KG1lc3NhZ2VzWzBdLnNldmVyaXR5KS50b0JlKCdlcnJvcicpXG4gICAgICBleHBlY3QobWVzc2FnZXNbMF0uZXhjZXJwdCkudG9CZShleHBlY3RlZClcbiAgICAgIGV4cGVjdChtZXNzYWdlc1swXS51cmwpLnRvQmUoZXhwZWN0ZWRVcmwpXG4gICAgICBleHBlY3QobWVzc2FnZXNbMF0ubG9jYXRpb24uZmlsZSkudG9CZShtb2RpZmllZElnbm9yZVBhdGgpXG4gICAgICBleHBlY3QobWVzc2FnZXNbMF0ubG9jYXRpb24ucG9zaXRpb24pLnRvRXF1YWwoW1swLCA5XSwgWzAsIDEwXV0pXG5cbiAgICAgIC8vIEVuYWJsZSB0aGUgb3B0aW9uIHVuZGVyIHRlc3RcbiAgICAgIGF0b20uY29uZmlnLnNldCgnbGludGVyLWVzbGludC5ydWxlc1RvU2lsZW5jZVdoaWxlVHlwaW5nJywgWyduby10cmFpbGluZy1zcGFjZXMnXSlcblxuICAgICAgLy8gQ2hlY2sgdGhlIGxpbnQgcmVzdWx0c1xuICAgICAgY29uc3QgbmV3TWVzc2FnZXMgPSBhd2FpdCBsaW50KGVkaXRvcilcbiAgICAgIGV4cGVjdChuZXdNZXNzYWdlcy5sZW5ndGgpLnRvQmUoMClcbiAgICB9KVxuICB9KVxuXG4gIGRlc2NyaWJlKCdwcmludHMgZGVidWdnaW5nIGluZm9ybWF0aW9uIHdpdGggdGhlIGBkZWJ1Z2AgY29tbWFuZCcsICgpID0+IHtcbiAgICBsZXQgZWRpdG9yXG4gICAgY29uc3QgZXhwZWN0ZWRNZXNzYWdlID0gJ2xpbnRlci1lc2xpbnQgZGVidWdnaW5nIGluZm9ybWF0aW9uJ1xuICAgIGJlZm9yZUVhY2goYXN5bmMgKCkgPT4ge1xuICAgICAgZWRpdG9yID0gYXdhaXQgYXRvbS53b3Jrc3BhY2Uub3Blbihnb29kUGF0aClcbiAgICB9KVxuXG4gICAgaXQoJ3Nob3dzIGFuIGluZm8gbm90aWZpY2F0aW9uJywgYXN5bmMgKCkgPT4ge1xuICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChhdG9tLnZpZXdzLmdldFZpZXcoZWRpdG9yKSwgJ2xpbnRlci1lc2xpbnQ6ZGVidWcnKVxuICAgICAgY29uc3Qgbm90aWZpY2F0aW9uID0gYXdhaXQgZ2V0Tm90aWZpY2F0aW9uKGV4cGVjdGVkTWVzc2FnZSlcblxuICAgICAgZXhwZWN0KG5vdGlmaWNhdGlvbi5nZXRNZXNzYWdlKCkpLnRvQmUoZXhwZWN0ZWRNZXNzYWdlKVxuICAgICAgZXhwZWN0KG5vdGlmaWNhdGlvbi5nZXRUeXBlKCkpLnRvRXF1YWwoJ2luZm8nKVxuICAgIH0pXG5cbiAgICBpdCgnaW5jbHVkZXMgZGVidWdnaW5nIGluZm9ybWF0aW9uIGluIHRoZSBkZXRhaWxzJywgYXN5bmMgKCkgPT4ge1xuICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChhdG9tLnZpZXdzLmdldFZpZXcoZWRpdG9yKSwgJ2xpbnRlci1lc2xpbnQ6ZGVidWcnKVxuICAgICAgY29uc3Qgbm90aWZpY2F0aW9uID0gYXdhaXQgZ2V0Tm90aWZpY2F0aW9uKGV4cGVjdGVkTWVzc2FnZSlcbiAgICAgIGNvbnN0IGRldGFpbCA9IG5vdGlmaWNhdGlvbi5nZXREZXRhaWwoKVxuXG4gICAgICBleHBlY3QoZGV0YWlsLmluY2x1ZGVzKGBBdG9tIHZlcnNpb246ICR7YXRvbS5nZXRWZXJzaW9uKCl9YCkpLnRvQmUodHJ1ZSlcbiAgICAgIGV4cGVjdChkZXRhaWwuaW5jbHVkZXMoJ2xpbnRlci1lc2xpbnQgdmVyc2lvbjonKSkudG9CZSh0cnVlKVxuICAgICAgZXhwZWN0KGRldGFpbC5pbmNsdWRlcyhgUGxhdGZvcm06ICR7cHJvY2Vzcy5wbGF0Zm9ybX1gKSkudG9CZSh0cnVlKVxuICAgICAgZXhwZWN0KGRldGFpbC5pbmNsdWRlcygnbGludGVyLWVzbGludCBjb25maWd1cmF0aW9uOicpKS50b0JlKHRydWUpXG4gICAgICBleHBlY3QoZGV0YWlsLmluY2x1ZGVzKCdVc2luZyBsb2NhbCBwcm9qZWN0IEVTTGludCcpKS50b0JlKHRydWUpXG4gICAgfSlcbiAgfSlcblxuICBpdCgnaGFuZGxlcyByYW5nZXMgaW4gbWVzc2FnZXMnLCBhc3luYyAoKSA9PiB7XG4gICAgY29uc3QgZWRpdG9yID0gYXdhaXQgYXRvbS53b3Jrc3BhY2Uub3BlbihlbmRSYW5nZVBhdGgpXG4gICAgY29uc3QgbWVzc2FnZXMgPSBhd2FpdCBsaW50KGVkaXRvcilcbiAgICBjb25zdCBleHBlY3RlZCA9ICdVbnJlYWNoYWJsZSBjb2RlLiAobm8tdW5yZWFjaGFibGUpJ1xuICAgIGNvbnN0IGV4cGVjdGVkVXJsID0gJ2h0dHA6Ly9lc2xpbnQub3JnL2RvY3MvcnVsZXMvbm8tdW5yZWFjaGFibGUnXG5cbiAgICBleHBlY3QobWVzc2FnZXNbMF0uc2V2ZXJpdHkpLnRvQmUoJ2Vycm9yJylcbiAgICBleHBlY3QobWVzc2FnZXNbMF0uZXhjZXJwdCkudG9CZShleHBlY3RlZClcbiAgICBleHBlY3QobWVzc2FnZXNbMF0udXJsKS50b0JlKGV4cGVjdGVkVXJsKVxuICAgIGV4cGVjdChtZXNzYWdlc1swXS5sb2NhdGlvbi5maWxlKS50b0JlKGVuZFJhbmdlUGF0aClcbiAgICBleHBlY3QobWVzc2FnZXNbMF0ubG9jYXRpb24ucG9zaXRpb24pLnRvRXF1YWwoW1s1LCAyXSwgWzYsIDE1XV0pXG4gIH0pXG5cbiAgZGVzY3JpYmUoJ3doZW4gc2V0dGluZyBgZGlzYWJsZVdoZW5Ob0VzbGludENvbmZpZ2AgaXMgZmFsc2UnLCAoKSA9PiB7XG4gICAgbGV0IGVkaXRvclxuICAgIGxldCB0ZW1wRml4dHVyZURpclxuXG4gICAgYmVmb3JlRWFjaChhc3luYyAoKSA9PiB7XG4gICAgICBhdG9tLmNvbmZpZy5zZXQoJ2xpbnRlci1lc2xpbnQuZGlzYWJsZVdoZW5Ob0VzbGludENvbmZpZycsIGZhbHNlKVxuXG4gICAgICBjb25zdCB0ZW1wRmlsZVBhdGggPSBhd2FpdCBjb3B5RmlsZVRvVGVtcERpcihiYWRJbmxpbmVQYXRoKVxuICAgICAgZWRpdG9yID0gYXdhaXQgYXRvbS53b3Jrc3BhY2Uub3Blbih0ZW1wRmlsZVBhdGgpXG4gICAgICB0ZW1wRml4dHVyZURpciA9IHBhdGguZGlybmFtZSh0ZW1wRmlsZVBhdGgpXG4gICAgfSlcblxuICAgIGFmdGVyRWFjaCgoKSA9PiB7XG4gICAgICByaW1yYWYuc3luYyh0ZW1wRml4dHVyZURpcilcbiAgICB9KVxuXG4gICAgaXQoJ2Vycm9ycyB3aGVuIG5vIGNvbmZpZyBmaWxlIGlzIGZvdW5kJywgYXN5bmMgKCkgPT4ge1xuICAgICAgbGV0IGRpZEVycm9yXG4gICAgICBsZXQgZ290TGludGluZ0Vycm9yc1xuXG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBtZXNzYWdlcyA9IGF3YWl0IGxpbnQoZWRpdG9yKVxuICAgICAgICAvLyBPbGRlciB2ZXJzaW9ucyBvZiBFU0xpbnQgd2lsbCByZXBvcnQgYW4gZXJyb3JcbiAgICAgICAgLy8gKG9yIGlmIGN1cnJlbnQgdXNlciBydW5uaW5nIHRlc3RzIGhhcyBhIGNvbmZpZyBpbiB0aGVpciBob21lIGRpcmVjdG9yeSlcbiAgICAgICAgY29uc3QgZXhwZWN0ZWQgPSBcIidmb28nIGlzIG5vdCBkZWZpbmVkLiAobm8tdW5kZWYpXCJcbiAgICAgICAgY29uc3QgZXhwZWN0ZWRVcmwgPSAnaHR0cDovL2VzbGludC5vcmcvZG9jcy9ydWxlcy9uby11bmRlZidcbiAgICAgICAgZXhwZWN0KG1lc3NhZ2VzLmxlbmd0aCkudG9CZSgxKVxuICAgICAgICBleHBlY3QobWVzc2FnZXNbMF0uZXhjZXJwdCkudG9CZShleHBlY3RlZClcbiAgICAgICAgZXhwZWN0KG1lc3NhZ2VzWzBdLnVybCkudG9CZShleHBlY3RlZFVybClcbiAgICAgICAgZ290TGludGluZ0Vycm9ycyA9IHRydWVcbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAvLyBOZXdlciB2ZXJzaW9ucyBvZiBFU0xpbnQgd2lsbCB0aHJvdyBhbiBleGNlcHRpb25cbiAgICAgICAgZXhwZWN0KGVyci5tZXNzYWdlKS50b0JlKCdObyBFU0xpbnQgY29uZmlndXJhdGlvbiBmb3VuZC4nKVxuICAgICAgICBkaWRFcnJvciA9IHRydWVcbiAgICAgIH1cblxuICAgICAgZXhwZWN0KGRpZEVycm9yIHx8IGdvdExpbnRpbmdFcnJvcnMpLnRvQmUodHJ1ZSlcbiAgICB9KVxuICB9KVxuXG4gIGRlc2NyaWJlKCd3aGVuIGBkaXNhYmxlV2hlbk5vRXNsaW50Q29uZmlnYCBpcyB0cnVlJywgKCkgPT4ge1xuICAgIGxldCBlZGl0b3JcbiAgICBsZXQgdGVtcEZpeHR1cmVEaXJcblxuICAgIGJlZm9yZUVhY2goYXN5bmMgKCkgPT4ge1xuICAgICAgYXRvbS5jb25maWcuc2V0KCdsaW50ZXItZXNsaW50LmRpc2FibGVXaGVuTm9Fc2xpbnRDb25maWcnLCB0cnVlKVxuXG4gICAgICBjb25zdCB0ZW1wRmlsZVBhdGggPSBhd2FpdCBjb3B5RmlsZVRvVGVtcERpcihiYWRJbmxpbmVQYXRoKVxuICAgICAgZWRpdG9yID0gYXdhaXQgYXRvbS53b3Jrc3BhY2Uub3Blbih0ZW1wRmlsZVBhdGgpXG4gICAgICB0ZW1wRml4dHVyZURpciA9IHBhdGguZGlybmFtZSh0ZW1wRmlsZVBhdGgpXG4gICAgfSlcblxuICAgIGFmdGVyRWFjaCgoKSA9PiB7XG4gICAgICByaW1yYWYuc3luYyh0ZW1wRml4dHVyZURpcilcbiAgICB9KVxuXG4gICAgaXQoJ2RvZXMgbm90IHJlcG9ydCBlcnJvcnMgd2hlbiBubyBjb25maWcgZmlsZSBpcyBmb3VuZCcsIGFzeW5jICgpID0+IHtcbiAgICAgIGNvbnN0IG1lc3NhZ2VzID0gYXdhaXQgbGludChlZGl0b3IpXG5cbiAgICAgIGV4cGVjdChtZXNzYWdlcy5sZW5ndGgpLnRvQmUoMClcbiAgICB9KVxuICB9KVxuXG4gIGRlc2NyaWJlKCdsZXRzIEVTTGludCBoYW5kbGUgY29uZmlndXJhdGlvbicsICgpID0+IHtcbiAgICBpdCgnd29ya3Mgd2hlbiB0aGUgY2FjaGUgZmFpbHMnLCBhc3luYyAoKSA9PiB7XG4gICAgICAvLyBFbnN1cmUgdGhlIGNhY2hlIGlzIGVuYWJsZWQsIHNpbmNlIHdlIHdpbGwgYmUgdGFraW5nIGFkdmFudGFnZSBvZlxuICAgICAgLy8gYSBmYWlsaW5nIGluIGl0J3Mgb3BlcmF0aW9uXG4gICAgICBhdG9tLmNvbmZpZy5zZXQoJ2xpbnRlci1lc2xpbnQuZGlzYWJsZUZTQ2FjaGUnLCBmYWxzZSlcbiAgICAgIGNvbnN0IGZvb1BhdGggPSBwYXRoLmpvaW4oYmFkQ2FjaGVQYXRoLCAndGVtcCcsICdmb28uanMnKVxuICAgICAgY29uc3QgbmV3Q29uZmlnUGF0aCA9IHBhdGguam9pbihiYWRDYWNoZVBhdGgsICd0ZW1wJywgJy5lc2xpbnRyYy5qcycpXG4gICAgICBjb25zdCBlZGl0b3IgPSBhd2FpdCBhdG9tLndvcmtzcGFjZS5vcGVuKGZvb1BhdGgpXG4gICAgICBmdW5jdGlvbiB1bmRlZk1zZyh2YXJOYW1lKSB7XG4gICAgICAgIHJldHVybiBgJyR7dmFyTmFtZX0nIGlzIG5vdCBkZWZpbmVkLiAobm8tdW5kZWYpYFxuICAgICAgfVxuICAgICAgY29uc3QgZXhwZWN0ZWRVcmwgPSAnaHR0cDovL2VzbGludC5vcmcvZG9jcy9ydWxlcy9uby11bmRlZidcblxuICAgICAgLy8gVHJpZ2dlciBhIGZpcnN0IGxpbnQgdG8gd2FybSB1cCB0aGUgY2FjaGUgd2l0aCB0aGUgZmlyc3QgY29uZmlnIHJlc3VsdFxuICAgICAgbGV0IG1lc3NhZ2VzID0gYXdhaXQgbGludChlZGl0b3IpXG4gICAgICBleHBlY3QobWVzc2FnZXMubGVuZ3RoKS50b0JlKDIpXG4gICAgICBleHBlY3QobWVzc2FnZXNbMF0uc2V2ZXJpdHkpLnRvQmUoJ2Vycm9yJylcbiAgICAgIGV4cGVjdChtZXNzYWdlc1swXS5leGNlcnB0KS50b0JlKHVuZGVmTXNnKCdjb25zb2xlJykpXG4gICAgICBleHBlY3QobWVzc2FnZXNbMF0udXJsKS50b0JlKGV4cGVjdGVkVXJsKVxuICAgICAgZXhwZWN0KG1lc3NhZ2VzWzBdLmxvY2F0aW9uLmZpbGUpLnRvQmUoZm9vUGF0aClcbiAgICAgIGV4cGVjdChtZXNzYWdlc1swXS5sb2NhdGlvbi5wb3NpdGlvbikudG9FcXVhbChbWzEsIDJdLCBbMSwgOV1dKVxuICAgICAgZXhwZWN0KG1lc3NhZ2VzWzFdLnNldmVyaXR5KS50b0JlKCdlcnJvcicpXG4gICAgICBleHBlY3QobWVzc2FnZXNbMV0uZXhjZXJwdCkudG9CZSh1bmRlZk1zZygnYmFyJykpXG4gICAgICBleHBlY3QobWVzc2FnZXNbMV0udXJsKS50b0JlKGV4cGVjdGVkVXJsKVxuICAgICAgZXhwZWN0KG1lc3NhZ2VzWzFdLmxvY2F0aW9uLmZpbGUpLnRvQmUoZm9vUGF0aClcbiAgICAgIGV4cGVjdChtZXNzYWdlc1sxXS5sb2NhdGlvbi5wb3NpdGlvbikudG9FcXVhbChbWzEsIDE0XSwgWzEsIDE3XV0pXG5cbiAgICAgIC8vIFdyaXRlIHRoZSBuZXcgY29uZmlndXJhdGlvbiBmaWxlXG4gICAgICBjb25zdCBuZXdDb25maWcgPSB7XG4gICAgICAgIGVudjoge1xuICAgICAgICAgIGJyb3dzZXI6IHRydWUsXG4gICAgICAgIH0sXG4gICAgICB9XG4gICAgICBsZXQgY29uZmlnQ29udGVudHMgPSBgbW9kdWxlLmV4cG9ydHMgPSAke0pTT04uc3RyaW5naWZ5KG5ld0NvbmZpZywgbnVsbCwgMil9XFxuYFxuICAgICAgZnMud3JpdGVGaWxlU3luYyhuZXdDb25maWdQYXRoLCBjb25maWdDb250ZW50cylcblxuICAgICAgLy8gTGludCBhZ2FpbiwgRVNMaW50IHNob3VsZCByZWNvZ25pc2UgdGhlIG5ldyBjb25maWd1cmF0aW9uXG4gICAgICAvLyBUaGUgY2FjaGVkIGNvbmZpZyByZXN1bHRzIGFyZSBzdGlsbCBwb2ludGluZyBhdCB0aGUgX3BhcmVudF8gZmlsZS4gRVNMaW50XG4gICAgICAvLyB3b3VsZCBwYXJ0aWFsbHkgaGFuZGxlIHRoaXMgc2l0dWF0aW9uIGlmIHRoZSBjb25maWcgZmlsZSB3YXMgc3BlY2lmaWVkXG4gICAgICAvLyBmcm9tIHRoZSBjYWNoZS5cbiAgICAgIG1lc3NhZ2VzID0gYXdhaXQgbGludChlZGl0b3IpXG4gICAgICBleHBlY3QobWVzc2FnZXMubGVuZ3RoKS50b0JlKDEpXG4gICAgICBleHBlY3QobWVzc2FnZXNbMF0uc2V2ZXJpdHkpLnRvQmUoJ2Vycm9yJylcbiAgICAgIGV4cGVjdChtZXNzYWdlc1swXS5leGNlcnB0KS50b0JlKHVuZGVmTXNnKCdiYXInKSlcbiAgICAgIGV4cGVjdChtZXNzYWdlc1swXS51cmwpLnRvQmUoZXhwZWN0ZWRVcmwpXG4gICAgICBleHBlY3QobWVzc2FnZXNbMF0ubG9jYXRpb24uZmlsZSkudG9CZShmb29QYXRoKVxuICAgICAgZXhwZWN0KG1lc3NhZ2VzWzBdLmxvY2F0aW9uLnBvc2l0aW9uKS50b0VxdWFsKFtbMSwgMTRdLCBbMSwgMTddXSlcblxuICAgICAgLy8gVXBkYXRlIHRoZSBjb25maWd1cmF0aW9uXG4gICAgICBuZXdDb25maWcucnVsZXMgPSB7XG4gICAgICAgICduby11bmRlZic6ICdvZmYnLFxuICAgICAgfVxuICAgICAgY29uZmlnQ29udGVudHMgPSBgbW9kdWxlLmV4cG9ydHMgPSAke0pTT04uc3RyaW5naWZ5KG5ld0NvbmZpZywgbnVsbCwgMil9XFxuYFxuICAgICAgZnMud3JpdGVGaWxlU3luYyhuZXdDb25maWdQYXRoLCBjb25maWdDb250ZW50cylcblxuICAgICAgLy8gTGludCBhZ2FpbiwgaWYgdGhlIGNhY2hlIHdhcyBzcGVjaWZ5aW5nIHRoZSBmaWxlIEVTTGludCBhdCB0aGlzIHBvaW50XG4gICAgICAvLyB3b3VsZCBmYWlsIHRvIHVwZGF0ZSB0aGUgY29uZmlndXJhdGlvbiBmdWxseSwgYW5kIHdvdWxkIHN0aWxsIHJlcG9ydCBhXG4gICAgICAvLyBuby11bmRlZiBlcnJvci5cbiAgICAgIG1lc3NhZ2VzID0gYXdhaXQgbGludChlZGl0b3IpXG4gICAgICBleHBlY3QobWVzc2FnZXMubGVuZ3RoKS50b0JlKDApXG5cbiAgICAgIC8vIERlbGV0ZSB0aGUgdGVtcG9yYXJ5IGNvbmZpZ3VyYXRpb24gZmlsZVxuICAgICAgZnMudW5saW5rU3luYyhuZXdDb25maWdQYXRoKVxuICAgIH0pXG4gIH0pXG5cbiAgZGVzY3JpYmUoJ3dvcmtzIHdpdGggSFRNTCBmaWxlcycsICgpID0+IHtcbiAgICBjb25zdCBlbWJlZGRlZFNjb3BlID0gJ3NvdXJjZS5qcy5lbWJlZGRlZC5odG1sJ1xuICAgIGNvbnN0IHNjb3BlcyA9IGxpbnRlclByb3ZpZGVyLmdyYW1tYXJTY29wZXNcblxuICAgIGl0KCdhZGRzIHRoZSBIVE1MIHNjb3BlIHdoZW4gdGhlIHNldHRpbmcgaXMgZW5hYmxlZCcsICgpID0+IHtcbiAgICAgIGV4cGVjdChzY29wZXMuaW5jbHVkZXMoZW1iZWRkZWRTY29wZSkpLnRvQmUoZmFsc2UpXG4gICAgICBhdG9tLmNvbmZpZy5zZXQoJ2xpbnRlci1lc2xpbnQubGludEh0bWxGaWxlcycsIHRydWUpXG4gICAgICBleHBlY3Qoc2NvcGVzLmluY2x1ZGVzKGVtYmVkZGVkU2NvcGUpKS50b0JlKHRydWUpXG4gICAgICBhdG9tLmNvbmZpZy5zZXQoJ2xpbnRlci1lc2xpbnQubGludEh0bWxGaWxlcycsIGZhbHNlKVxuICAgICAgZXhwZWN0KHNjb3Blcy5pbmNsdWRlcyhlbWJlZGRlZFNjb3BlKSkudG9CZShmYWxzZSlcbiAgICB9KVxuXG4gICAgaXQoJ2tlZXBzIHRoZSBIVE1MIHNjb3BlIHdpdGggY3VzdG9tIHNjb3BlcycsICgpID0+IHtcbiAgICAgIGV4cGVjdChzY29wZXMuaW5jbHVkZXMoZW1iZWRkZWRTY29wZSkpLnRvQmUoZmFsc2UpXG4gICAgICBhdG9tLmNvbmZpZy5zZXQoJ2xpbnRlci1lc2xpbnQubGludEh0bWxGaWxlcycsIHRydWUpXG4gICAgICBleHBlY3Qoc2NvcGVzLmluY2x1ZGVzKGVtYmVkZGVkU2NvcGUpKS50b0JlKHRydWUpXG4gICAgICBhdG9tLmNvbmZpZy5zZXQoJ2xpbnRlci1lc2xpbnQuc2NvcGVzJywgWydmb28uYmFyJ10pXG4gICAgICBleHBlY3Qoc2NvcGVzLmluY2x1ZGVzKGVtYmVkZGVkU2NvcGUpKS50b0JlKHRydWUpXG4gICAgfSlcbiAgfSlcblxuICBkZXNjcmliZSgnaGFuZGxlcyB0aGUgU2hvdyBSdWxlIElEIGluIE1lc3NhZ2VzIG9wdGlvbicsICgpID0+IHtcbiAgICBjb25zdCBleHBlY3RlZFVybCA9ICdodHRwczovL2dpdGh1Yi5jb20vYmVubW9zaGVyL2VzbGludC1wbHVnaW4taW1wb3J0L2Jsb2IvbWFzdGVyL2RvY3MvcnVsZXMvbm8tdW5yZXNvbHZlZC5tZCdcblxuICAgIGl0KCdzaG93cyB0aGUgcnVsZSBJRCB3aGVuIGVuYWJsZWQnLCBhc3luYyAoKSA9PiB7XG4gICAgICBhdG9tLmNvbmZpZy5zZXQoJ2xpbnRlci1lc2xpbnQuc2hvd1J1bGVJZEluTWVzc2FnZScsIHRydWUpXG4gICAgICBjb25zdCBlZGl0b3IgPSBhd2FpdCBhdG9tLndvcmtzcGFjZS5vcGVuKGJhZEltcG9ydFBhdGgpXG4gICAgICBjb25zdCBtZXNzYWdlcyA9IGF3YWl0IGxpbnQoZWRpdG9yKVxuICAgICAgY29uc3QgZXhwZWN0ZWQgPSBcIlVuYWJsZSB0byByZXNvbHZlIHBhdGggdG8gbW9kdWxlICcuLi9ub25leGlzdGVudCcuIChpbXBvcnQvbm8tdW5yZXNvbHZlZClcIlxuXG4gICAgICBleHBlY3QobWVzc2FnZXMubGVuZ3RoKS50b0JlKDEpXG4gICAgICBleHBlY3QobWVzc2FnZXNbMF0uc2V2ZXJpdHkpLnRvQmUoJ2Vycm9yJylcbiAgICAgIGV4cGVjdChtZXNzYWdlc1swXS5leGNlcnB0KS50b0JlKGV4cGVjdGVkKVxuICAgICAgZXhwZWN0KG1lc3NhZ2VzWzBdLnVybCkudG9CZShleHBlY3RlZFVybClcbiAgICAgIGV4cGVjdChtZXNzYWdlc1swXS5sb2NhdGlvbi5maWxlKS50b0JlKGJhZEltcG9ydFBhdGgpXG4gICAgICBleHBlY3QobWVzc2FnZXNbMF0ubG9jYXRpb24ucG9zaXRpb24pLnRvRXF1YWwoW1swLCAyNF0sIFswLCAzOV1dKVxuICAgICAgZXhwZWN0KG1lc3NhZ2VzWzBdLnNvbHV0aW9ucykubm90LnRvQmVEZWZpbmVkKClcbiAgICB9KVxuXG4gICAgaXQoXCJkb2Vzbid0IHNob3cgdGhlIHJ1bGUgSUQgd2hlbiBkaXNhYmxlZFwiLCBhc3luYyAoKSA9PiB7XG4gICAgICBhdG9tLmNvbmZpZy5zZXQoJ2xpbnRlci1lc2xpbnQuc2hvd1J1bGVJZEluTWVzc2FnZScsIGZhbHNlKVxuICAgICAgY29uc3QgZWRpdG9yID0gYXdhaXQgYXRvbS53b3Jrc3BhY2Uub3BlbihiYWRJbXBvcnRQYXRoKVxuICAgICAgY29uc3QgbWVzc2FnZXMgPSBhd2FpdCBsaW50KGVkaXRvcilcbiAgICAgIGNvbnN0IGV4cGVjdGVkID0gXCJVbmFibGUgdG8gcmVzb2x2ZSBwYXRoIHRvIG1vZHVsZSAnLi4vbm9uZXhpc3RlbnQnLlwiXG5cbiAgICAgIGV4cGVjdChtZXNzYWdlcy5sZW5ndGgpLnRvQmUoMSlcbiAgICAgIGV4cGVjdChtZXNzYWdlc1swXS5zZXZlcml0eSkudG9CZSgnZXJyb3InKVxuICAgICAgZXhwZWN0KG1lc3NhZ2VzWzBdLmV4Y2VycHQpLnRvQmUoZXhwZWN0ZWQpXG4gICAgICBleHBlY3QobWVzc2FnZXNbMF0udXJsKS50b0JlKGV4cGVjdGVkVXJsKVxuICAgICAgZXhwZWN0KG1lc3NhZ2VzWzBdLmxvY2F0aW9uLmZpbGUpLnRvQmUoYmFkSW1wb3J0UGF0aClcbiAgICAgIGV4cGVjdChtZXNzYWdlc1swXS5sb2NhdGlvbi5wb3NpdGlvbikudG9FcXVhbChbWzAsIDI0XSwgWzAsIDM5XV0pXG4gICAgICBleHBlY3QobWVzc2FnZXNbMF0uc29sdXRpb25zKS5ub3QudG9CZURlZmluZWQoKVxuICAgIH0pXG4gIH0pXG59KVxuIl19