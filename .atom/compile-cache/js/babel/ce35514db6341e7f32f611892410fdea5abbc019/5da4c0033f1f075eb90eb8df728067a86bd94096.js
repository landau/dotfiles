function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

// eslint-disable-next-line import/no-extraneous-dependencies, import/extensions

var _atom = require('atom');

// Dependencies
// NOTE: We are not directly requiring these in order to reduce the time it
// takes to require this file as that causes delays in Atom loading this package
'use babel';var path = undefined;
var helpers = undefined;
var workerHelpers = undefined;
var isConfigAtHomeRoot = undefined;

// Configuration
var scopes = [];
var showRule = undefined;
var lintHtmlFiles = undefined;
var ignoredRulesWhenModified = undefined;
var ignoredRulesWhenFixing = undefined;
var disableWhenNoEslintConfig = undefined;

// Internal variables
var idleCallbacks = new Set();

// Internal functions
var idsToIgnoredRules = function idsToIgnoredRules(ruleIds) {
  return ruleIds.reduce(function (ids, id) {
    ids[id] = 0; // 0 is the severity to turn off a rule
    return ids;
  }, {});
};

// Worker still hasn't initialized, since the queued idle callbacks are
// done in order, waiting on a newly queued idle callback will ensure that
// the worker has been initialized
var waitOnIdle = _asyncToGenerator(function* () {
  return new Promise(function (resolve) {
    var callbackID = window.requestIdleCallback(function () {
      idleCallbacks['delete'](callbackID);
      resolve();
    });
    idleCallbacks.add(callbackID);
  });
});

module.exports = {
  activate: function activate() {
    var _this = this;

    var callbackID = undefined;
    var installLinterEslintDeps = function installLinterEslintDeps() {
      idleCallbacks['delete'](callbackID);
      if (!atom.inSpecMode()) {
        require('atom-package-deps').install('linter-eslint');
      }
    };
    callbackID = window.requestIdleCallback(installLinterEslintDeps);
    idleCallbacks.add(callbackID);

    this.subscriptions = new _atom.CompositeDisposable();
    this.worker = null;

    var embeddedScope = 'source.js.embedded.html';
    this.subscriptions.add(atom.config.observe('linter-eslint.lintHtmlFiles', function (value) {
      lintHtmlFiles = value;
      if (lintHtmlFiles) {
        scopes.push(embeddedScope);
      } else if (scopes.indexOf(embeddedScope) !== -1) {
        scopes.splice(scopes.indexOf(embeddedScope), 1);
      }
    }));

    this.subscriptions.add(atom.config.observe('linter-eslint.scopes', function (value) {
      // Remove any old scopes
      scopes.splice(0, scopes.length);
      // Add the current scopes
      Array.prototype.push.apply(scopes, value);
      // Ensure HTML linting still works if the setting is updated
      if (lintHtmlFiles && !scopes.includes(embeddedScope)) {
        scopes.push(embeddedScope);
      }
    }));

    this.subscriptions.add(atom.workspace.observeTextEditors(function (editor) {
      editor.onDidSave(_asyncToGenerator(function* () {
        var validScope = editor.getCursors().some(function (cursor) {
          return cursor.getScopeDescriptor().getScopesArray().some(function (scope) {
            return scopes.includes(scope);
          });
        });
        if (validScope && atom.config.get('linter-eslint.fixOnSave')) {
          yield _this.fixJob(true);
        }
      }));
    }));

    this.subscriptions.add(atom.commands.add('atom-text-editor', {
      'linter-eslint:debug': _asyncToGenerator(function* () {
        if (!helpers) {
          helpers = require('./helpers');
        }
        if (!_this.worker) {
          yield waitOnIdle();
        }
        var debugString = yield helpers.generateDebugString(_this.worker);
        var notificationOptions = { detail: debugString, dismissable: true };
        atom.notifications.addInfo('linter-eslint debugging information', notificationOptions);
      })
    }));

    this.subscriptions.add(atom.commands.add('atom-text-editor', {
      'linter-eslint:fix-file': _asyncToGenerator(function* () {
        yield _this.fixJob();
      })
    }));

    this.subscriptions.add(atom.config.observe('linter-eslint.showRuleIdInMessage', function (value) {
      showRule = value;
    }));

    this.subscriptions.add(atom.config.observe('linter-eslint.disableWhenNoEslintConfig', function (value) {
      disableWhenNoEslintConfig = value;
    }));

    this.subscriptions.add(atom.config.observe('linter-eslint.rulesToSilenceWhileTyping', function (ids) {
      ignoredRulesWhenModified = idsToIgnoredRules(ids);
    }));

    this.subscriptions.add(atom.config.observe('linter-eslint.rulesToDisableWhileFixing', function (ids) {
      ignoredRulesWhenFixing = idsToIgnoredRules(ids);
    }));

    var initializeESLintWorker = function initializeESLintWorker() {
      _this.worker = new _atom.Task(require.resolve('./worker.js'));
    };
    // Initialize the worker during an idle time
    window.requestIdleCallback(initializeESLintWorker);
  },

  deactivate: function deactivate() {
    if (this.worker !== null) {
      this.worker.terminate();
      this.worker = null;
    }
    idleCallbacks.forEach(function (callbackID) {
      return window.cancelIdleCallback(callbackID);
    });
    idleCallbacks.clear();
    this.subscriptions.dispose();
  },

  provideLinter: function provideLinter() {
    var _this2 = this;

    return {
      name: 'ESLint',
      grammarScopes: scopes,
      scope: 'file',
      lintsOnChange: true,
      lint: _asyncToGenerator(function* (textEditor) {
        var text = textEditor.getText();
        if (text.length === 0) {
          return [];
        }
        var filePath = textEditor.getPath();

        var rules = {};
        if (textEditor.isModified() && Object.keys(ignoredRulesWhenModified).length > 0) {
          rules = ignoredRulesWhenModified;
        }

        if (!helpers) {
          helpers = require('./helpers');
        }

        if (!_this2.worker) {
          yield waitOnIdle();
        }

        var response = yield helpers.sendJob(_this2.worker, {
          type: 'lint',
          contents: text,
          config: atom.config.get('linter-eslint'),
          rules: rules,
          filePath: filePath,
          projectPath: atom.project.relativizePath(filePath)[0] || ''
        });

        if (textEditor.getText() !== text) {
          /*
             The editor text has been modified since the lint was triggered,
             as we can't be sure that the results will map properly back to
             the new contents, simply return `null` to tell the
             `provideLinter` consumer not to update the saved results.
           */
          return null;
        }
        return helpers.processESLintMessages(response, textEditor, showRule, _this2.worker);
      })
    };
  },

  fixJob: _asyncToGenerator(function* () {
    var isSave = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

    var textEditor = atom.workspace.getActiveTextEditor();

    if (!textEditor || textEditor.isModified()) {
      // Abort for invalid or unsaved text editors
      var message = 'Linter-ESLint: Please save before fixing';
      atom.notifications.addError(message);
    }

    if (!path) {
      path = require('path');
    }
    if (!isConfigAtHomeRoot) {
      isConfigAtHomeRoot = require('./is-config-at-home-root');
    }
    if (!workerHelpers) {
      workerHelpers = require('./worker-helpers');
    }

    var filePath = textEditor.getPath();
    var fileDir = path.dirname(filePath);
    var projectPath = atom.project.relativizePath(filePath)[0];

    // Get the text from the editor, so we can use executeOnText
    var text = textEditor.getText();
    // Do not try to make fixes on an empty file
    if (text.length === 0) {
      return;
    }

    // Do not try to fix if linting should be disabled
    var configPath = workerHelpers.getConfigPath(fileDir);
    var noProjectConfig = configPath === null || isConfigAtHomeRoot(configPath);
    if (noProjectConfig && disableWhenNoEslintConfig) {
      return;
    }

    var rules = {};
    if (Object.keys(ignoredRulesWhenFixing).length > 0) {
      rules = ignoredRulesWhenFixing;
    }

    if (!helpers) {
      helpers = require('./helpers');
    }
    if (!this.worker) {
      yield waitOnIdle();
    }

    try {
      var response = yield helpers.sendJob(this.worker, {
        type: 'fix',
        config: atom.config.get('linter-eslint'),
        contents: text,
        rules: rules,
        filePath: filePath,
        projectPath: projectPath
      });
      if (!isSave) {
        atom.notifications.addSuccess(response);
      }
    } catch (err) {
      atom.notifications.addWarning(err.message);
    }
  })
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1Ly5hdG9tL3BhY2thZ2VzL2xpbnRlci1lc2xpbnQvc3JjL21haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztvQkFHMEMsTUFBTTs7Ozs7QUFIaEQsV0FBVyxDQUFBLEFBUVgsSUFBSSxJQUFJLFlBQUEsQ0FBQTtBQUNSLElBQUksT0FBTyxZQUFBLENBQUE7QUFDWCxJQUFJLGFBQWEsWUFBQSxDQUFBO0FBQ2pCLElBQUksa0JBQWtCLFlBQUEsQ0FBQTs7O0FBR3RCLElBQU0sTUFBTSxHQUFHLEVBQUUsQ0FBQTtBQUNqQixJQUFJLFFBQVEsWUFBQSxDQUFBO0FBQ1osSUFBSSxhQUFhLFlBQUEsQ0FBQTtBQUNqQixJQUFJLHdCQUF3QixZQUFBLENBQUE7QUFDNUIsSUFBSSxzQkFBc0IsWUFBQSxDQUFBO0FBQzFCLElBQUkseUJBQXlCLFlBQUEsQ0FBQTs7O0FBRzdCLElBQU0sYUFBYSxHQUFHLElBQUksR0FBRyxFQUFFLENBQUE7OztBQUcvQixJQUFNLGlCQUFpQixHQUFHLFNBQXBCLGlCQUFpQixDQUFHLE9BQU87U0FDL0IsT0FBTyxDQUFDLE1BQU0sQ0FBQyxVQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUs7QUFDMUIsT0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQTtBQUNYLFdBQU8sR0FBRyxDQUFBO0dBQ1gsRUFBRSxFQUFFLENBQUM7Q0FBQSxDQUFBOzs7OztBQUtSLElBQU0sVUFBVSxxQkFBRztTQUNqQixJQUFJLE9BQU8sQ0FBQyxVQUFDLE9BQU8sRUFBSztBQUN2QixRQUFNLFVBQVUsR0FBRyxNQUFNLENBQUMsbUJBQW1CLENBQUMsWUFBTTtBQUNsRCxtQkFBYSxVQUFPLENBQUMsVUFBVSxDQUFDLENBQUE7QUFDaEMsYUFBTyxFQUFFLENBQUE7S0FDVixDQUFDLENBQUE7QUFDRixpQkFBYSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQTtHQUM5QixDQUFDO0NBQUEsQ0FBQSxDQUFBOztBQUVK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QUFLLEdBQUcsRUFBRSxDQUFBO0FBQ2QsUUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtBQUNsRCxXQUFLLEdBQUcsc0JBQXNCLENBQUE7S0FDL0I7O0FBRUQsUUFBSSxDQUFDLE9BQU8sRUFBRTtBQUNaLGFBQU8sR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUE7S0FDL0I7QUFDRCxRQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRTtBQUNoQixZQUFNLFVBQVUsRUFBRSxDQUFBO0tBQ25COztBQUVELFFBQUk7QUFDRixVQUFNLFFBQVEsR0FBRyxNQUFNLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRTtBQUNsRCxZQUFJLEVBQUUsS0FBSztBQUNYLGNBQU0sRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUM7QUFDeEMsZ0JBQVEsRUFBRSxJQUFJO0FBQ2QsYUFBSyxFQUFMLEtBQUs7QUFDTCxnQkFBUSxFQUFSLFFBQVE7QUFDUixtQkFBVyxFQUFYLFdBQVc7T0FDWixDQUFDLENBQUE7QUFDRixVQUFJLENBQUMsTUFBTSxFQUFFO0FBQ1gsWUFBSSxDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUE7T0FDeEM7S0FDRixDQUFDLE9BQU8sR0FBRyxFQUFFO0FBQ1osVUFBSSxDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFBO0tBQzNDO0dBQ0YsQ0FBQTtDQUNGLENBQUEiLCJmaWxlIjoiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvbGludGVyLWVzbGludC9zcmMvbWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnXG5cbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBpbXBvcnQvbm8tZXh0cmFuZW91cy1kZXBlbmRlbmNpZXMsIGltcG9ydC9leHRlbnNpb25zXG5pbXBvcnQgeyBDb21wb3NpdGVEaXNwb3NhYmxlLCBUYXNrIH0gZnJvbSAnYXRvbSdcblxuLy8gRGVwZW5kZW5jaWVzXG4vLyBOT1RFOiBXZSBhcmUgbm90IGRpcmVjdGx5IHJlcXVpcmluZyB0aGVzZSBpbiBvcmRlciB0byByZWR1Y2UgdGhlIHRpbWUgaXRcbi8vIHRha2VzIHRvIHJlcXVpcmUgdGhpcyBmaWxlIGFzIHRoYXQgY2F1c2VzIGRlbGF5cyBpbiBBdG9tIGxvYWRpbmcgdGhpcyBwYWNrYWdlXG5sZXQgcGF0aFxubGV0IGhlbHBlcnNcbmxldCB3b3JrZXJIZWxwZXJzXG5sZXQgaXNDb25maWdBdEhvbWVSb290XG5cbi8vIENvbmZpZ3VyYXRpb25cbmNvbnN0IHNjb3BlcyA9IFtdXG5sZXQgc2hvd1J1bGVcbmxldCBsaW50SHRtbEZpbGVzXG5sZXQgaWdub3JlZFJ1bGVzV2hlbk1vZGlmaWVkXG5sZXQgaWdub3JlZFJ1bGVzV2hlbkZpeGluZ1xubGV0IGRpc2FibGVXaGVuTm9Fc2xpbnRDb25maWdcblxuLy8gSW50ZXJuYWwgdmFyaWFibGVzXG5jb25zdCBpZGxlQ2FsbGJhY2tzID0gbmV3IFNldCgpXG5cbi8vIEludGVybmFsIGZ1bmN0aW9uc1xuY29uc3QgaWRzVG9JZ25vcmVkUnVsZXMgPSBydWxlSWRzID0+XG4gIHJ1bGVJZHMucmVkdWNlKChpZHMsIGlkKSA9PiB7XG4gICAgaWRzW2lkXSA9IDAgLy8gMCBpcyB0aGUgc2V2ZXJpdHkgdG8gdHVybiBvZmYgYSBydWxlXG4gICAgcmV0dXJuIGlkc1xuICB9LCB7fSlcblxuLy8gV29ya2VyIHN0aWxsIGhhc24ndCBpbml0aWFsaXplZCwgc2luY2UgdGhlIHF1ZXVlZCBpZGxlIGNhbGxiYWNrcyBhcmVcbi8vIGRvbmUgaW4gb3JkZXIsIHdhaXRpbmcgb24gYSBuZXdseSBxdWV1ZWQgaWRsZSBjYWxsYmFjayB3aWxsIGVuc3VyZSB0aGF0XG4vLyB0aGUgd29ya2VyIGhhcyBiZWVuIGluaXRpYWxpemVkXG5jb25zdCB3YWl0T25JZGxlID0gYXN5bmMgKCkgPT5cbiAgbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICBjb25zdCBjYWxsYmFja0lEID0gd2luZG93LnJlcXVlc3RJZGxlQ2FsbGJhY2soKCkgPT4ge1xuICAgICAgaWRsZUNhbGxiYWNrcy5kZWxldGUoY2FsbGJhY2tJRClcbiAgICAgIHJlc29sdmUoKVxuICAgIH0pXG4gICAgaWRsZUNhbGxiYWNrcy5hZGQoY2FsbGJhY2tJRClcbiAgfSlcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGFjdGl2YXRlKCkge1xuICAgIGxldCBjYWxsYmFja0lEXG4gICAgY29uc3QgaW5zdGFsbExpbnRlckVzbGludERlcHMgPSAoKSA9PiB7XG4gICAgICBpZGxlQ2FsbGJhY2tzLmRlbGV0ZShjYWxsYmFja0lEKVxuICAgICAgaWYgKCFhdG9tLmluU3BlY01vZGUoKSkge1xuICAgICAgICByZXF1aXJlKCdhdG9tLXBhY2thZ2UtZGVwcycpLmluc3RhbGwoJ2xpbnRlci1lc2xpbnQnKVxuICAgICAgfVxuICAgIH1cbiAgICBjYWxsYmFja0lEID0gd2luZG93LnJlcXVlc3RJZGxlQ2FsbGJhY2soaW5zdGFsbExpbnRlckVzbGludERlcHMpXG4gICAgaWRsZUNhbGxiYWNrcy5hZGQoY2FsbGJhY2tJRClcblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcbiAgICB0aGlzLndvcmtlciA9IG51bGxcblxuICAgIGNvbnN0IGVtYmVkZGVkU2NvcGUgPSAnc291cmNlLmpzLmVtYmVkZGVkLmh0bWwnXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbmZpZy5vYnNlcnZlKCdsaW50ZXItZXNsaW50LmxpbnRIdG1sRmlsZXMnLFxuICAgICAgKHZhbHVlKSA9PiB7XG4gICAgICAgIGxpbnRIdG1sRmlsZXMgPSB2YWx1ZVxuICAgICAgICBpZiAobGludEh0bWxGaWxlcykge1xuICAgICAgICAgIHNjb3Blcy5wdXNoKGVtYmVkZGVkU2NvcGUpXG4gICAgICAgIH0gZWxzZSBpZiAoc2NvcGVzLmluZGV4T2YoZW1iZWRkZWRTY29wZSkgIT09IC0xKSB7XG4gICAgICAgICAgc2NvcGVzLnNwbGljZShzY29wZXMuaW5kZXhPZihlbWJlZGRlZFNjb3BlKSwgMSlcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICApXG5cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgYXRvbS5jb25maWcub2JzZXJ2ZSgnbGludGVyLWVzbGludC5zY29wZXMnLCAodmFsdWUpID0+IHtcbiAgICAgICAgLy8gUmVtb3ZlIGFueSBvbGQgc2NvcGVzXG4gICAgICAgIHNjb3Blcy5zcGxpY2UoMCwgc2NvcGVzLmxlbmd0aClcbiAgICAgICAgLy8gQWRkIHRoZSBjdXJyZW50IHNjb3Blc1xuICAgICAgICBBcnJheS5wcm90b3R5cGUucHVzaC5hcHBseShzY29wZXMsIHZhbHVlKVxuICAgICAgICAvLyBFbnN1cmUgSFRNTCBsaW50aW5nIHN0aWxsIHdvcmtzIGlmIHRoZSBzZXR0aW5nIGlzIHVwZGF0ZWRcbiAgICAgICAgaWYgKGxpbnRIdG1sRmlsZXMgJiYgIXNjb3Blcy5pbmNsdWRlcyhlbWJlZGRlZFNjb3BlKSkge1xuICAgICAgICAgIHNjb3Blcy5wdXNoKGVtYmVkZGVkU2NvcGUpXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgKVxuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLndvcmtzcGFjZS5vYnNlcnZlVGV4dEVkaXRvcnMoKGVkaXRvcikgPT4ge1xuICAgICAgZWRpdG9yLm9uRGlkU2F2ZShhc3luYyAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHZhbGlkU2NvcGUgPSBlZGl0b3IuZ2V0Q3Vyc29ycygpLnNvbWUoY3Vyc29yID0+XG4gICAgICAgICAgY3Vyc29yLmdldFNjb3BlRGVzY3JpcHRvcigpLmdldFNjb3Blc0FycmF5KCkuc29tZShzY29wZSA9PlxuICAgICAgICAgICAgc2NvcGVzLmluY2x1ZGVzKHNjb3BlKSkpXG4gICAgICAgIGlmICh2YWxpZFNjb3BlICYmIGF0b20uY29uZmlnLmdldCgnbGludGVyLWVzbGludC5maXhPblNhdmUnKSkge1xuICAgICAgICAgIGF3YWl0IHRoaXMuZml4Sm9iKHRydWUpXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfSkpXG5cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXRleHQtZWRpdG9yJywge1xuICAgICAgJ2xpbnRlci1lc2xpbnQ6ZGVidWcnOiBhc3luYyAoKSA9PiB7XG4gICAgICAgIGlmICghaGVscGVycykge1xuICAgICAgICAgIGhlbHBlcnMgPSByZXF1aXJlKCcuL2hlbHBlcnMnKVxuICAgICAgICB9XG4gICAgICAgIGlmICghdGhpcy53b3JrZXIpIHtcbiAgICAgICAgICBhd2FpdCB3YWl0T25JZGxlKClcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBkZWJ1Z1N0cmluZyA9IGF3YWl0IGhlbHBlcnMuZ2VuZXJhdGVEZWJ1Z1N0cmluZyh0aGlzLndvcmtlcilcbiAgICAgICAgY29uc3Qgbm90aWZpY2F0aW9uT3B0aW9ucyA9IHsgZGV0YWlsOiBkZWJ1Z1N0cmluZywgZGlzbWlzc2FibGU6IHRydWUgfVxuICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkSW5mbygnbGludGVyLWVzbGludCBkZWJ1Z2dpbmcgaW5mb3JtYXRpb24nLCBub3RpZmljYXRpb25PcHRpb25zKVxuICAgICAgfVxuICAgIH0pKVxuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbW1hbmRzLmFkZCgnYXRvbS10ZXh0LWVkaXRvcicsIHtcbiAgICAgICdsaW50ZXItZXNsaW50OmZpeC1maWxlJzogYXN5bmMgKCkgPT4ge1xuICAgICAgICBhd2FpdCB0aGlzLmZpeEpvYigpXG4gICAgICB9XG4gICAgfSkpXG5cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29uZmlnLm9ic2VydmUoJ2xpbnRlci1lc2xpbnQuc2hvd1J1bGVJZEluTWVzc2FnZScsXG4gICAgICAodmFsdWUpID0+IHtcbiAgICAgICAgc2hvd1J1bGUgPSB2YWx1ZVxuICAgICAgfSlcbiAgICApXG5cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29uZmlnLm9ic2VydmUoJ2xpbnRlci1lc2xpbnQuZGlzYWJsZVdoZW5Ob0VzbGludENvbmZpZycsXG4gICAgICAodmFsdWUpID0+IHtcbiAgICAgICAgZGlzYWJsZVdoZW5Ob0VzbGludENvbmZpZyA9IHZhbHVlXG4gICAgICB9KVxuICAgIClcblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb25maWcub2JzZXJ2ZSgnbGludGVyLWVzbGludC5ydWxlc1RvU2lsZW5jZVdoaWxlVHlwaW5nJywgKGlkcykgPT4ge1xuICAgICAgaWdub3JlZFJ1bGVzV2hlbk1vZGlmaWVkID0gaWRzVG9JZ25vcmVkUnVsZXMoaWRzKVxuICAgIH0pKVxuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbmZpZy5vYnNlcnZlKCdsaW50ZXItZXNsaW50LnJ1bGVzVG9EaXNhYmxlV2hpbGVGaXhpbmcnLCAoaWRzKSA9PiB7XG4gICAgICBpZ25vcmVkUnVsZXNXaGVuRml4aW5nID0gaWRzVG9JZ25vcmVkUnVsZXMoaWRzKVxuICAgIH0pKVxuXG4gICAgY29uc3QgaW5pdGlhbGl6ZUVTTGludFdvcmtlciA9ICgpID0+IHtcbiAgICAgIHRoaXMud29ya2VyID0gbmV3IFRhc2socmVxdWlyZS5yZXNvbHZlKCcuL3dvcmtlci5qcycpKVxuICAgIH1cbiAgICAvLyBJbml0aWFsaXplIHRoZSB3b3JrZXIgZHVyaW5nIGFuIGlkbGUgdGltZVxuICAgIHdpbmRvdy5yZXF1ZXN0SWRsZUNhbGxiYWNrKGluaXRpYWxpemVFU0xpbnRXb3JrZXIpXG4gIH0sXG5cbiAgZGVhY3RpdmF0ZSgpIHtcbiAgICBpZiAodGhpcy53b3JrZXIgIT09IG51bGwpIHtcbiAgICAgIHRoaXMud29ya2VyLnRlcm1pbmF0ZSgpXG4gICAgICB0aGlzLndvcmtlciA9IG51bGxcbiAgICB9XG4gICAgaWRsZUNhbGxiYWNrcy5mb3JFYWNoKGNhbGxiYWNrSUQgPT4gd2luZG93LmNhbmNlbElkbGVDYWxsYmFjayhjYWxsYmFja0lEKSlcbiAgICBpZGxlQ2FsbGJhY2tzLmNsZWFyKClcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG4gIH0sXG5cbiAgcHJvdmlkZUxpbnRlcigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbmFtZTogJ0VTTGludCcsXG4gICAgICBncmFtbWFyU2NvcGVzOiBzY29wZXMsXG4gICAgICBzY29wZTogJ2ZpbGUnLFxuICAgICAgbGludHNPbkNoYW5nZTogdHJ1ZSxcbiAgICAgIGxpbnQ6IGFzeW5jICh0ZXh0RWRpdG9yKSA9PiB7XG4gICAgICAgIGNvbnN0IHRleHQgPSB0ZXh0RWRpdG9yLmdldFRleHQoKVxuICAgICAgICBpZiAodGV4dC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICByZXR1cm4gW11cbiAgICAgICAgfVxuICAgICAgICBjb25zdCBmaWxlUGF0aCA9IHRleHRFZGl0b3IuZ2V0UGF0aCgpXG5cbiAgICAgICAgbGV0IHJ1bGVzID0ge31cbiAgICAgICAgaWYgKHRleHRFZGl0b3IuaXNNb2RpZmllZCgpICYmIE9iamVjdC5rZXlzKGlnbm9yZWRSdWxlc1doZW5Nb2RpZmllZCkubGVuZ3RoID4gMCkge1xuICAgICAgICAgIHJ1bGVzID0gaWdub3JlZFJ1bGVzV2hlbk1vZGlmaWVkXG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIWhlbHBlcnMpIHtcbiAgICAgICAgICBoZWxwZXJzID0gcmVxdWlyZSgnLi9oZWxwZXJzJylcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghdGhpcy53b3JrZXIpIHtcbiAgICAgICAgICBhd2FpdCB3YWl0T25JZGxlKClcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgaGVscGVycy5zZW5kSm9iKHRoaXMud29ya2VyLCB7XG4gICAgICAgICAgdHlwZTogJ2xpbnQnLFxuICAgICAgICAgIGNvbnRlbnRzOiB0ZXh0LFxuICAgICAgICAgIGNvbmZpZzogYXRvbS5jb25maWcuZ2V0KCdsaW50ZXItZXNsaW50JyksXG4gICAgICAgICAgcnVsZXMsXG4gICAgICAgICAgZmlsZVBhdGgsXG4gICAgICAgICAgcHJvamVjdFBhdGg6IGF0b20ucHJvamVjdC5yZWxhdGl2aXplUGF0aChmaWxlUGF0aClbMF0gfHwgJydcbiAgICAgICAgfSlcblxuICAgICAgICBpZiAodGV4dEVkaXRvci5nZXRUZXh0KCkgIT09IHRleHQpIHtcbiAgICAgICAgICAvKlxuICAgICAgICAgICAgIFRoZSBlZGl0b3IgdGV4dCBoYXMgYmVlbiBtb2RpZmllZCBzaW5jZSB0aGUgbGludCB3YXMgdHJpZ2dlcmVkLFxuICAgICAgICAgICAgIGFzIHdlIGNhbid0IGJlIHN1cmUgdGhhdCB0aGUgcmVzdWx0cyB3aWxsIG1hcCBwcm9wZXJseSBiYWNrIHRvXG4gICAgICAgICAgICAgdGhlIG5ldyBjb250ZW50cywgc2ltcGx5IHJldHVybiBgbnVsbGAgdG8gdGVsbCB0aGVcbiAgICAgICAgICAgICBgcHJvdmlkZUxpbnRlcmAgY29uc3VtZXIgbm90IHRvIHVwZGF0ZSB0aGUgc2F2ZWQgcmVzdWx0cy5cbiAgICAgICAgICAgKi9cbiAgICAgICAgICByZXR1cm4gbnVsbFxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBoZWxwZXJzLnByb2Nlc3NFU0xpbnRNZXNzYWdlcyhyZXNwb25zZSwgdGV4dEVkaXRvciwgc2hvd1J1bGUsIHRoaXMud29ya2VyKVxuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICBhc3luYyBmaXhKb2IoaXNTYXZlID0gZmFsc2UpIHtcbiAgICBjb25zdCB0ZXh0RWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG5cbiAgICBpZiAoIXRleHRFZGl0b3IgfHwgdGV4dEVkaXRvci5pc01vZGlmaWVkKCkpIHtcbiAgICAgIC8vIEFib3J0IGZvciBpbnZhbGlkIG9yIHVuc2F2ZWQgdGV4dCBlZGl0b3JzXG4gICAgICBjb25zdCBtZXNzYWdlID0gJ0xpbnRlci1FU0xpbnQ6IFBsZWFzZSBzYXZlIGJlZm9yZSBmaXhpbmcnXG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IobWVzc2FnZSlcbiAgICB9XG5cbiAgICBpZiAoIXBhdGgpIHtcbiAgICAgIHBhdGggPSByZXF1aXJlKCdwYXRoJylcbiAgICB9XG4gICAgaWYgKCFpc0NvbmZpZ0F0SG9tZVJvb3QpIHtcbiAgICAgIGlzQ29uZmlnQXRIb21lUm9vdCA9IHJlcXVpcmUoJy4vaXMtY29uZmlnLWF0LWhvbWUtcm9vdCcpXG4gICAgfVxuICAgIGlmICghd29ya2VySGVscGVycykge1xuICAgICAgd29ya2VySGVscGVycyA9IHJlcXVpcmUoJy4vd29ya2VyLWhlbHBlcnMnKVxuICAgIH1cblxuICAgIGNvbnN0IGZpbGVQYXRoID0gdGV4dEVkaXRvci5nZXRQYXRoKClcbiAgICBjb25zdCBmaWxlRGlyID0gcGF0aC5kaXJuYW1lKGZpbGVQYXRoKVxuICAgIGNvbnN0IHByb2plY3RQYXRoID0gYXRvbS5wcm9qZWN0LnJlbGF0aXZpemVQYXRoKGZpbGVQYXRoKVswXVxuXG4gICAgLy8gR2V0IHRoZSB0ZXh0IGZyb20gdGhlIGVkaXRvciwgc28gd2UgY2FuIHVzZSBleGVjdXRlT25UZXh0XG4gICAgY29uc3QgdGV4dCA9IHRleHRFZGl0b3IuZ2V0VGV4dCgpXG4gICAgLy8gRG8gbm90IHRyeSB0byBtYWtlIGZpeGVzIG9uIGFuIGVtcHR5IGZpbGVcbiAgICBpZiAodGV4dC5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIC8vIERvIG5vdCB0cnkgdG8gZml4IGlmIGxpbnRpbmcgc2hvdWxkIGJlIGRpc2FibGVkXG4gICAgY29uc3QgY29uZmlnUGF0aCA9IHdvcmtlckhlbHBlcnMuZ2V0Q29uZmlnUGF0aChmaWxlRGlyKVxuICAgIGNvbnN0IG5vUHJvamVjdENvbmZpZyA9IChjb25maWdQYXRoID09PSBudWxsIHx8IGlzQ29uZmlnQXRIb21lUm9vdChjb25maWdQYXRoKSlcbiAgICBpZiAobm9Qcm9qZWN0Q29uZmlnICYmIGRpc2FibGVXaGVuTm9Fc2xpbnRDb25maWcpIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGxldCBydWxlcyA9IHt9XG4gICAgaWYgKE9iamVjdC5rZXlzKGlnbm9yZWRSdWxlc1doZW5GaXhpbmcpLmxlbmd0aCA+IDApIHtcbiAgICAgIHJ1bGVzID0gaWdub3JlZFJ1bGVzV2hlbkZpeGluZ1xuICAgIH1cblxuICAgIGlmICghaGVscGVycykge1xuICAgICAgaGVscGVycyA9IHJlcXVpcmUoJy4vaGVscGVycycpXG4gICAgfVxuICAgIGlmICghdGhpcy53b3JrZXIpIHtcbiAgICAgIGF3YWl0IHdhaXRPbklkbGUoKVxuICAgIH1cblxuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGhlbHBlcnMuc2VuZEpvYih0aGlzLndvcmtlciwge1xuICAgICAgICB0eXBlOiAnZml4JyxcbiAgICAgICAgY29uZmlnOiBhdG9tLmNvbmZpZy5nZXQoJ2xpbnRlci1lc2xpbnQnKSxcbiAgICAgICAgY29udGVudHM6IHRleHQsXG4gICAgICAgIHJ1bGVzLFxuICAgICAgICBmaWxlUGF0aCxcbiAgICAgICAgcHJvamVjdFBhdGhcbiAgICAgIH0pXG4gICAgICBpZiAoIWlzU2F2ZSkge1xuICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkU3VjY2VzcyhyZXNwb25zZSlcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nKGVyci5tZXNzYWdlKVxuICAgIH1cbiAgfSxcbn1cbiJdfQ==