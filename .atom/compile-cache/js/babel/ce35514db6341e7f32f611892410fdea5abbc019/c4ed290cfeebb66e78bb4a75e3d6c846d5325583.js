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
var ignoreFixableRulesWhileTyping = undefined;

// Internal variables
var idleCallbacks = new Set();

// Internal functions
var idsToIgnoredRules = function idsToIgnoredRules(ruleIds) {
  return ruleIds.reduce(function (ids, id) {
    // eslint-disable-next-line no-param-reassign
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

var validScope = function validScope(editor) {
  return editor.getCursors().some(function (cursor) {
    return cursor.getScopeDescriptor().getScopesArray().some(function (scope) {
      return scopes.includes(scope);
    });
  });
};

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
        if (validScope(editor) && atom.config.get('linter-eslint.fixOnSave')) {
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

    this.subscriptions.add(atom.config.observe('linter-eslint.ignoreFixableRulesWhileTyping', function (value) {
      ignoreFixableRulesWhileTyping = value;
    }));

    this.subscriptions.add(atom.contextMenu.add({
      'atom-text-editor:not(.mini), .overlayer': [{
        label: 'ESLint Fix',
        command: 'linter-eslint:fix-file',
        shouldDisplay: function shouldDisplay(evt) {
          var activeEditor = atom.workspace.getActiveTextEditor();
          if (!activeEditor) {
            return false;
          }
          // Black magic!
          // Compares the private component property of the active TextEditor
          //   against the components of the elements
          var evtIsActiveEditor = evt.path.some(function (elem) {
            return(
              // Atom v1.19.0+
              elem.component && activeEditor.component && elem.component === activeEditor.component
            );
          });
          // Only show if it was the active editor and it is a valid scope
          return evtIsActiveEditor && validScope(activeEditor);
        }
      }]
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

        if (!helpers) {
          helpers = require('./helpers');
        }

        var rules = {};
        if (textEditor.isModified() && Object.keys(ignoredRulesWhenModified).length > 0) {
          rules = ignoredRulesWhenModified;
        }
        if (textEditor.isModified() && ignoreFixableRulesWhileTyping) {
          // Note that this list will only contain rules after the first lint job
          rules = idsToIgnoredRules(helpers.getFixableRules());
        }

        if (!_this2.worker) {
          yield waitOnIdle();
        }

        var response = undefined;
        try {
          response = yield helpers.sendJob(_this2.worker, {
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
          return helpers.processJobResponse(response, textEditor, showRule, _this2.worker);
        } catch (error) {
          return helpers.handleError(textEditor, error);
        }
      })
    };
  },

  fixJob: _asyncToGenerator(function* () {
    var isSave = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

    var textEditor = atom.workspace.getActiveTextEditor();

    if (!textEditor || !atom.workspace.isTextEditor(textEditor)) {
      // Silently return if the TextEditor is invalid
      return;
    }

    if (textEditor.isModified()) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1Ly5hdG9tL3BhY2thZ2VzL2xpbnRlci1lc2xpbnQvc3JjL21haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztvQkFHMEMsTUFBTTs7Ozs7QUFIaEQsV0FBVyxDQUFBLEFBUVgsSUFBSSxJQUFJLFlBQUEsQ0FBQTtBQUNSLElBQUksT0FBTyxZQUFBLENBQUE7QUFDWCxJQUFJLGFBQWEsWUFBQSxDQUFBO0FBQ2pCLElBQUksa0JBQWtCLFlBQUEsQ0FBQTs7O0FBR3RCLElBQU0sTUFBTSxHQUFHLEVBQUUsQ0FBQTtBQUNqQixJQUFJLFFBQVEsWUFBQSxDQUFBO0FBQ1osSUFBSSxhQUFhLFlBQUEsQ0FBQTtBQUNqQixJQUFJLHdCQUF3QixZQUFBLENBQUE7QUFDNUIsSUFBSSxzQkFBc0IsWUFBQSxDQUFBO0FBQzFCLElBQUkseUJBQXlCLFlBQUEsQ0FBQTtBQUM3QixJQUFJLDZCQUE2QixZQUFBLENBQUE7OztBQUdqQyxJQUFNLGFBQWEsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFBOzs7QUFHL0IsSUFBTSxpQkFBaUIsR0FBRyxTQUFwQixpQkFBaUIsQ0FBRyxPQUFPO1NBQy9CLE9BQU8sQ0FBQyxNQUFNLENBQUMsVUFBQyxHQUFHLEVBQUUsRUFBRSxFQUFLOztBQUUxQixPQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFBO0FBQ1gsV0FBTyxHQUFHLENBQUE7R0FDWCxFQUFFLEVBQUUsQ0FBQztDQUFBLENBQUE7Ozs7O0FBS1IsSUFBTSxVQUFVLHFCQUFHO1NBQ2pCLElBQUksT0FBTyxDQUFDLFVBQUMsT0FBTyxFQUFLO0FBQ3ZCLFFBQU0sVUFBVSxHQUFHLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxZQUFNO0FBQ2xELG1CQUFhLFVBQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQTtBQUNoQyxhQUFPLEVBQUUsQ0FBQTtLQUNWLENBQUMsQ0FBQTtBQUNGLGlCQUFhLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFBO0dB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L2xpbnRlci1lc2xpbnQvc3JjL21haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJ1xuXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgaW1wb3J0L25vLWV4dHJhbmVvdXMtZGVwZW5kZW5jaWVzLCBpbXBvcnQvZXh0ZW5zaW9uc1xuaW1wb3J0IHsgQ29tcG9zaXRlRGlzcG9zYWJsZSwgVGFzayB9IGZyb20gJ2F0b20nXG5cbi8vIERlcGVuZGVuY2llc1xuLy8gTk9URTogV2UgYXJlIG5vdCBkaXJlY3RseSByZXF1aXJpbmcgdGhlc2UgaW4gb3JkZXIgdG8gcmVkdWNlIHRoZSB0aW1lIGl0XG4vLyB0YWtlcyB0byByZXF1aXJlIHRoaXMgZmlsZSBhcyB0aGF0IGNhdXNlcyBkZWxheXMgaW4gQXRvbSBsb2FkaW5nIHRoaXMgcGFja2FnZVxubGV0IHBhdGhcbmxldCBoZWxwZXJzXG5sZXQgd29ya2VySGVscGVyc1xubGV0IGlzQ29uZmlnQXRIb21lUm9vdFxuXG4vLyBDb25maWd1cmF0aW9uXG5jb25zdCBzY29wZXMgPSBbXVxubGV0IHNob3dSdWxlXG5sZXQgbGludEh0bWxGaWxlc1xubGV0IGlnbm9yZWRSdWxlc1doZW5Nb2RpZmllZFxubGV0IGlnbm9yZWRSdWxlc1doZW5GaXhpbmdcbmxldCBkaXNhYmxlV2hlbk5vRXNsaW50Q29uZmlnXG5sZXQgaWdub3JlRml4YWJsZVJ1bGVzV2hpbGVUeXBpbmdcblxuLy8gSW50ZXJuYWwgdmFyaWFibGVzXG5jb25zdCBpZGxlQ2FsbGJhY2tzID0gbmV3IFNldCgpXG5cbi8vIEludGVybmFsIGZ1bmN0aW9uc1xuY29uc3QgaWRzVG9JZ25vcmVkUnVsZXMgPSBydWxlSWRzID0+XG4gIHJ1bGVJZHMucmVkdWNlKChpZHMsIGlkKSA9PiB7XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXBhcmFtLXJlYXNzaWduXG4gICAgaWRzW2lkXSA9IDAgLy8gMCBpcyB0aGUgc2V2ZXJpdHkgdG8gdHVybiBvZmYgYSBydWxlXG4gICAgcmV0dXJuIGlkc1xuICB9LCB7fSlcblxuLy8gV29ya2VyIHN0aWxsIGhhc24ndCBpbml0aWFsaXplZCwgc2luY2UgdGhlIHF1ZXVlZCBpZGxlIGNhbGxiYWNrcyBhcmVcbi8vIGRvbmUgaW4gb3JkZXIsIHdhaXRpbmcgb24gYSBuZXdseSBxdWV1ZWQgaWRsZSBjYWxsYmFjayB3aWxsIGVuc3VyZSB0aGF0XG4vLyB0aGUgd29ya2VyIGhhcyBiZWVuIGluaXRpYWxpemVkXG5jb25zdCB3YWl0T25JZGxlID0gYXN5bmMgKCkgPT5cbiAgbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICBjb25zdCBjYWxsYmFja0lEID0gd2luZG93LnJlcXVlc3RJZGxlQ2FsbGJhY2soKCkgPT4ge1xuICAgICAgaWRsZUNhbGxiYWNrcy5kZWxldGUoY2FsbGJhY2tJRClcbiAgICAgIHJlc29sdmUoKVxuICAgIH0pXG4gICAgaWRsZUNhbGxiYWNrcy5hZGQoY2FsbGJhY2tJRClcbiAgfSlcblxuY29uc3QgdmFsaWRTY29wZSA9IGVkaXRvciA9PiBlZGl0b3IuZ2V0Q3Vyc29ycygpLnNvbWUoY3Vyc29yID0+XG4gIGN1cnNvci5nZXRTY29wZURlc2NyaXB0b3IoKS5nZXRTY29wZXNBcnJheSgpLnNvbWUoc2NvcGUgPT5cbiAgICBzY29wZXMuaW5jbHVkZXMoc2NvcGUpKSlcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGFjdGl2YXRlKCkge1xuICAgIGxldCBjYWxsYmFja0lEXG4gICAgY29uc3QgaW5zdGFsbExpbnRlckVzbGludERlcHMgPSAoKSA9PiB7XG4gICAgICBpZGxlQ2FsbGJhY2tzLmRlbGV0ZShjYWxsYmFja0lEKVxuICAgICAgaWYgKCFhdG9tLmluU3BlY01vZGUoKSkge1xuICAgICAgICByZXF1aXJlKCdhdG9tLXBhY2thZ2UtZGVwcycpLmluc3RhbGwoJ2xpbnRlci1lc2xpbnQnKVxuICAgICAgfVxuICAgIH1cbiAgICBjYWxsYmFja0lEID0gd2luZG93LnJlcXVlc3RJZGxlQ2FsbGJhY2soaW5zdGFsbExpbnRlckVzbGludERlcHMpXG4gICAgaWRsZUNhbGxiYWNrcy5hZGQoY2FsbGJhY2tJRClcblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcbiAgICB0aGlzLndvcmtlciA9IG51bGxcblxuICAgIGNvbnN0IGVtYmVkZGVkU2NvcGUgPSAnc291cmNlLmpzLmVtYmVkZGVkLmh0bWwnXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbmZpZy5vYnNlcnZlKFxuICAgICAgJ2xpbnRlci1lc2xpbnQubGludEh0bWxGaWxlcycsXG4gICAgICAodmFsdWUpID0+IHtcbiAgICAgICAgbGludEh0bWxGaWxlcyA9IHZhbHVlXG4gICAgICAgIGlmIChsaW50SHRtbEZpbGVzKSB7XG4gICAgICAgICAgc2NvcGVzLnB1c2goZW1iZWRkZWRTY29wZSlcbiAgICAgICAgfSBlbHNlIGlmIChzY29wZXMuaW5kZXhPZihlbWJlZGRlZFNjb3BlKSAhPT0gLTEpIHtcbiAgICAgICAgICBzY29wZXMuc3BsaWNlKHNjb3Blcy5pbmRleE9mKGVtYmVkZGVkU2NvcGUpLCAxKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgKSlcblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb25maWcub2JzZXJ2ZShcbiAgICAgICdsaW50ZXItZXNsaW50LnNjb3BlcycsXG4gICAgICAodmFsdWUpID0+IHtcbiAgICAgICAgLy8gUmVtb3ZlIGFueSBvbGQgc2NvcGVzXG4gICAgICAgIHNjb3Blcy5zcGxpY2UoMCwgc2NvcGVzLmxlbmd0aClcbiAgICAgICAgLy8gQWRkIHRoZSBjdXJyZW50IHNjb3Blc1xuICAgICAgICBBcnJheS5wcm90b3R5cGUucHVzaC5hcHBseShzY29wZXMsIHZhbHVlKVxuICAgICAgICAvLyBFbnN1cmUgSFRNTCBsaW50aW5nIHN0aWxsIHdvcmtzIGlmIHRoZSBzZXR0aW5nIGlzIHVwZGF0ZWRcbiAgICAgICAgaWYgKGxpbnRIdG1sRmlsZXMgJiYgIXNjb3Blcy5pbmNsdWRlcyhlbWJlZGRlZFNjb3BlKSkge1xuICAgICAgICAgIHNjb3Blcy5wdXNoKGVtYmVkZGVkU2NvcGUpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICApKVxuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLndvcmtzcGFjZS5vYnNlcnZlVGV4dEVkaXRvcnMoKGVkaXRvcikgPT4ge1xuICAgICAgZWRpdG9yLm9uRGlkU2F2ZShhc3luYyAoKSA9PiB7XG4gICAgICAgIGlmICh2YWxpZFNjb3BlKGVkaXRvcikgJiYgYXRvbS5jb25maWcuZ2V0KCdsaW50ZXItZXNsaW50LmZpeE9uU2F2ZScpKSB7XG4gICAgICAgICAgYXdhaXQgdGhpcy5maXhKb2IodHJ1ZSlcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9KSlcblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20tdGV4dC1lZGl0b3InLCB7XG4gICAgICAnbGludGVyLWVzbGludDpkZWJ1Zyc6IGFzeW5jICgpID0+IHtcbiAgICAgICAgaWYgKCFoZWxwZXJzKSB7XG4gICAgICAgICAgaGVscGVycyA9IHJlcXVpcmUoJy4vaGVscGVycycpXG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF0aGlzLndvcmtlcikge1xuICAgICAgICAgIGF3YWl0IHdhaXRPbklkbGUoKVxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGRlYnVnU3RyaW5nID0gYXdhaXQgaGVscGVycy5nZW5lcmF0ZURlYnVnU3RyaW5nKHRoaXMud29ya2VyKVxuICAgICAgICBjb25zdCBub3RpZmljYXRpb25PcHRpb25zID0geyBkZXRhaWw6IGRlYnVnU3RyaW5nLCBkaXNtaXNzYWJsZTogdHJ1ZSB9XG4gICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRJbmZvKCdsaW50ZXItZXNsaW50IGRlYnVnZ2luZyBpbmZvcm1hdGlvbicsIG5vdGlmaWNhdGlvbk9wdGlvbnMpXG4gICAgICB9XG4gICAgfSkpXG5cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXRleHQtZWRpdG9yJywge1xuICAgICAgJ2xpbnRlci1lc2xpbnQ6Zml4LWZpbGUnOiBhc3luYyAoKSA9PiB7XG4gICAgICAgIGF3YWl0IHRoaXMuZml4Sm9iKClcbiAgICAgIH1cbiAgICB9KSlcblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb25maWcub2JzZXJ2ZShcbiAgICAgICdsaW50ZXItZXNsaW50LnNob3dSdWxlSWRJbk1lc3NhZ2UnLFxuICAgICAgKHZhbHVlKSA9PiB7IHNob3dSdWxlID0gdmFsdWUgfVxuICAgICkpXG5cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29uZmlnLm9ic2VydmUoXG4gICAgICAnbGludGVyLWVzbGludC5kaXNhYmxlV2hlbk5vRXNsaW50Q29uZmlnJyxcbiAgICAgICh2YWx1ZSkgPT4geyBkaXNhYmxlV2hlbk5vRXNsaW50Q29uZmlnID0gdmFsdWUgfVxuICAgICkpXG5cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29uZmlnLm9ic2VydmUoXG4gICAgICAnbGludGVyLWVzbGludC5ydWxlc1RvU2lsZW5jZVdoaWxlVHlwaW5nJyxcbiAgICAgIChpZHMpID0+IHsgaWdub3JlZFJ1bGVzV2hlbk1vZGlmaWVkID0gaWRzVG9JZ25vcmVkUnVsZXMoaWRzKSB9XG4gICAgKSlcblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb25maWcub2JzZXJ2ZShcbiAgICAgICdsaW50ZXItZXNsaW50LnJ1bGVzVG9EaXNhYmxlV2hpbGVGaXhpbmcnLFxuICAgICAgKGlkcykgPT4geyBpZ25vcmVkUnVsZXNXaGVuRml4aW5nID0gaWRzVG9JZ25vcmVkUnVsZXMoaWRzKSB9XG4gICAgKSlcblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb25maWcub2JzZXJ2ZShcbiAgICAgICdsaW50ZXItZXNsaW50Lmlnbm9yZUZpeGFibGVSdWxlc1doaWxlVHlwaW5nJyxcbiAgICAgICh2YWx1ZSkgPT4geyBpZ25vcmVGaXhhYmxlUnVsZXNXaGlsZVR5cGluZyA9IHZhbHVlIH1cbiAgICApKVxuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbnRleHRNZW51LmFkZCh7XG4gICAgICAnYXRvbS10ZXh0LWVkaXRvcjpub3QoLm1pbmkpLCAub3ZlcmxheWVyJzogW3tcbiAgICAgICAgbGFiZWw6ICdFU0xpbnQgRml4JyxcbiAgICAgICAgY29tbWFuZDogJ2xpbnRlci1lc2xpbnQ6Zml4LWZpbGUnLFxuICAgICAgICBzaG91bGREaXNwbGF5OiAoZXZ0KSA9PiB7XG4gICAgICAgICAgY29uc3QgYWN0aXZlRWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgICAgICAgaWYgKCFhY3RpdmVFZGl0b3IpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBCbGFjayBtYWdpYyFcbiAgICAgICAgICAvLyBDb21wYXJlcyB0aGUgcHJpdmF0ZSBjb21wb25lbnQgcHJvcGVydHkgb2YgdGhlIGFjdGl2ZSBUZXh0RWRpdG9yXG4gICAgICAgICAgLy8gICBhZ2FpbnN0IHRoZSBjb21wb25lbnRzIG9mIHRoZSBlbGVtZW50c1xuICAgICAgICAgIGNvbnN0IGV2dElzQWN0aXZlRWRpdG9yID0gZXZ0LnBhdGguc29tZShlbGVtID0+XG4gICAgICAgICAgICAvLyBBdG9tIHYxLjE5LjArXG4gICAgICAgICAgICAoZWxlbS5jb21wb25lbnQgJiYgYWN0aXZlRWRpdG9yLmNvbXBvbmVudCAmJlxuICAgICAgICAgICAgICBlbGVtLmNvbXBvbmVudCA9PT0gYWN0aXZlRWRpdG9yLmNvbXBvbmVudCkpXG4gICAgICAgICAgLy8gT25seSBzaG93IGlmIGl0IHdhcyB0aGUgYWN0aXZlIGVkaXRvciBhbmQgaXQgaXMgYSB2YWxpZCBzY29wZVxuICAgICAgICAgIHJldHVybiBldnRJc0FjdGl2ZUVkaXRvciAmJiB2YWxpZFNjb3BlKGFjdGl2ZUVkaXRvcilcbiAgICAgICAgfVxuICAgICAgfV1cbiAgICB9KSlcblxuICAgIGNvbnN0IGluaXRpYWxpemVFU0xpbnRXb3JrZXIgPSAoKSA9PiB7XG4gICAgICB0aGlzLndvcmtlciA9IG5ldyBUYXNrKHJlcXVpcmUucmVzb2x2ZSgnLi93b3JrZXIuanMnKSlcbiAgICB9XG4gICAgLy8gSW5pdGlhbGl6ZSB0aGUgd29ya2VyIGR1cmluZyBhbiBpZGxlIHRpbWVcbiAgICB3aW5kb3cucmVxdWVzdElkbGVDYWxsYmFjayhpbml0aWFsaXplRVNMaW50V29ya2VyKVxuICB9LFxuXG4gIGRlYWN0aXZhdGUoKSB7XG4gICAgaWYgKHRoaXMud29ya2VyICE9PSBudWxsKSB7XG4gICAgICB0aGlzLndvcmtlci50ZXJtaW5hdGUoKVxuICAgICAgdGhpcy53b3JrZXIgPSBudWxsXG4gICAgfVxuICAgIGlkbGVDYWxsYmFja3MuZm9yRWFjaChjYWxsYmFja0lEID0+IHdpbmRvdy5jYW5jZWxJZGxlQ2FsbGJhY2soY2FsbGJhY2tJRCkpXG4gICAgaWRsZUNhbGxiYWNrcy5jbGVhcigpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICB9LFxuXG4gIHByb3ZpZGVMaW50ZXIoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG5hbWU6ICdFU0xpbnQnLFxuICAgICAgZ3JhbW1hclNjb3Blczogc2NvcGVzLFxuICAgICAgc2NvcGU6ICdmaWxlJyxcbiAgICAgIGxpbnRzT25DaGFuZ2U6IHRydWUsXG4gICAgICBsaW50OiBhc3luYyAodGV4dEVkaXRvcikgPT4ge1xuICAgICAgICBjb25zdCB0ZXh0ID0gdGV4dEVkaXRvci5nZXRUZXh0KClcbiAgICAgICAgaWYgKHRleHQubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgcmV0dXJuIFtdXG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZmlsZVBhdGggPSB0ZXh0RWRpdG9yLmdldFBhdGgoKVxuXG4gICAgICAgIGlmICghaGVscGVycykge1xuICAgICAgICAgIGhlbHBlcnMgPSByZXF1aXJlKCcuL2hlbHBlcnMnKVxuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHJ1bGVzID0ge31cbiAgICAgICAgaWYgKHRleHRFZGl0b3IuaXNNb2RpZmllZCgpICYmIE9iamVjdC5rZXlzKGlnbm9yZWRSdWxlc1doZW5Nb2RpZmllZCkubGVuZ3RoID4gMCkge1xuICAgICAgICAgIHJ1bGVzID0gaWdub3JlZFJ1bGVzV2hlbk1vZGlmaWVkXG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRleHRFZGl0b3IuaXNNb2RpZmllZCgpICYmIGlnbm9yZUZpeGFibGVSdWxlc1doaWxlVHlwaW5nKSB7XG4gICAgICAgICAgLy8gTm90ZSB0aGF0IHRoaXMgbGlzdCB3aWxsIG9ubHkgY29udGFpbiBydWxlcyBhZnRlciB0aGUgZmlyc3QgbGludCBqb2JcbiAgICAgICAgICBydWxlcyA9IGlkc1RvSWdub3JlZFJ1bGVzKGhlbHBlcnMuZ2V0Rml4YWJsZVJ1bGVzKCkpXG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRoaXMud29ya2VyKSB7XG4gICAgICAgICAgYXdhaXQgd2FpdE9uSWRsZSgpXG4gICAgICAgIH1cblxuICAgICAgICBsZXQgcmVzcG9uc2VcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICByZXNwb25zZSA9IGF3YWl0IGhlbHBlcnMuc2VuZEpvYih0aGlzLndvcmtlciwge1xuICAgICAgICAgICAgdHlwZTogJ2xpbnQnLFxuICAgICAgICAgICAgY29udGVudHM6IHRleHQsXG4gICAgICAgICAgICBjb25maWc6IGF0b20uY29uZmlnLmdldCgnbGludGVyLWVzbGludCcpLFxuICAgICAgICAgICAgcnVsZXMsXG4gICAgICAgICAgICBmaWxlUGF0aCxcbiAgICAgICAgICAgIHByb2plY3RQYXRoOiBhdG9tLnByb2plY3QucmVsYXRpdml6ZVBhdGgoZmlsZVBhdGgpWzBdIHx8ICcnXG4gICAgICAgICAgfSlcbiAgICAgICAgICBpZiAodGV4dEVkaXRvci5nZXRUZXh0KCkgIT09IHRleHQpIHtcbiAgICAgICAgICAgIC8qXG4gICAgICAgICAgICBUaGUgZWRpdG9yIHRleHQgaGFzIGJlZW4gbW9kaWZpZWQgc2luY2UgdGhlIGxpbnQgd2FzIHRyaWdnZXJlZCxcbiAgICAgICAgICAgIGFzIHdlIGNhbid0IGJlIHN1cmUgdGhhdCB0aGUgcmVzdWx0cyB3aWxsIG1hcCBwcm9wZXJseSBiYWNrIHRvXG4gICAgICAgICAgICB0aGUgbmV3IGNvbnRlbnRzLCBzaW1wbHkgcmV0dXJuIGBudWxsYCB0byB0ZWxsIHRoZVxuICAgICAgICAgICAgYHByb3ZpZGVMaW50ZXJgIGNvbnN1bWVyIG5vdCB0byB1cGRhdGUgdGhlIHNhdmVkIHJlc3VsdHMuXG4gICAgICAgICAgICAqL1xuICAgICAgICAgICAgcmV0dXJuIG51bGxcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGhlbHBlcnMucHJvY2Vzc0pvYlJlc3BvbnNlKHJlc3BvbnNlLCB0ZXh0RWRpdG9yLCBzaG93UnVsZSwgdGhpcy53b3JrZXIpXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgcmV0dXJuIGhlbHBlcnMuaGFuZGxlRXJyb3IodGV4dEVkaXRvciwgZXJyb3IpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgYXN5bmMgZml4Sm9iKGlzU2F2ZSA9IGZhbHNlKSB7XG4gICAgY29uc3QgdGV4dEVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuXG4gICAgaWYgKCF0ZXh0RWRpdG9yIHx8ICFhdG9tLndvcmtzcGFjZS5pc1RleHRFZGl0b3IodGV4dEVkaXRvcikpIHtcbiAgICAgIC8vIFNpbGVudGx5IHJldHVybiBpZiB0aGUgVGV4dEVkaXRvciBpcyBpbnZhbGlkXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBpZiAodGV4dEVkaXRvci5pc01vZGlmaWVkKCkpIHtcbiAgICAgIC8vIEFib3J0IGZvciBpbnZhbGlkIG9yIHVuc2F2ZWQgdGV4dCBlZGl0b3JzXG4gICAgICBjb25zdCBtZXNzYWdlID0gJ0xpbnRlci1FU0xpbnQ6IFBsZWFzZSBzYXZlIGJlZm9yZSBmaXhpbmcnXG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IobWVzc2FnZSlcbiAgICB9XG5cbiAgICBpZiAoIXBhdGgpIHtcbiAgICAgIHBhdGggPSByZXF1aXJlKCdwYXRoJylcbiAgICB9XG4gICAgaWYgKCFpc0NvbmZpZ0F0SG9tZVJvb3QpIHtcbiAgICAgIGlzQ29uZmlnQXRIb21lUm9vdCA9IHJlcXVpcmUoJy4vaXMtY29uZmlnLWF0LWhvbWUtcm9vdCcpXG4gICAgfVxuICAgIGlmICghd29ya2VySGVscGVycykge1xuICAgICAgd29ya2VySGVscGVycyA9IHJlcXVpcmUoJy4vd29ya2VyLWhlbHBlcnMnKVxuICAgIH1cblxuICAgIGNvbnN0IGZpbGVQYXRoID0gdGV4dEVkaXRvci5nZXRQYXRoKClcbiAgICBjb25zdCBmaWxlRGlyID0gcGF0aC5kaXJuYW1lKGZpbGVQYXRoKVxuICAgIGNvbnN0IHByb2plY3RQYXRoID0gYXRvbS5wcm9qZWN0LnJlbGF0aXZpemVQYXRoKGZpbGVQYXRoKVswXVxuXG4gICAgLy8gR2V0IHRoZSB0ZXh0IGZyb20gdGhlIGVkaXRvciwgc28gd2UgY2FuIHVzZSBleGVjdXRlT25UZXh0XG4gICAgY29uc3QgdGV4dCA9IHRleHRFZGl0b3IuZ2V0VGV4dCgpXG4gICAgLy8gRG8gbm90IHRyeSB0byBtYWtlIGZpeGVzIG9uIGFuIGVtcHR5IGZpbGVcbiAgICBpZiAodGV4dC5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIC8vIERvIG5vdCB0cnkgdG8gZml4IGlmIGxpbnRpbmcgc2hvdWxkIGJlIGRpc2FibGVkXG4gICAgY29uc3QgY29uZmlnUGF0aCA9IHdvcmtlckhlbHBlcnMuZ2V0Q29uZmlnUGF0aChmaWxlRGlyKVxuICAgIGNvbnN0IG5vUHJvamVjdENvbmZpZyA9IChjb25maWdQYXRoID09PSBudWxsIHx8IGlzQ29uZmlnQXRIb21lUm9vdChjb25maWdQYXRoKSlcbiAgICBpZiAobm9Qcm9qZWN0Q29uZmlnICYmIGRpc2FibGVXaGVuTm9Fc2xpbnRDb25maWcpIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGxldCBydWxlcyA9IHt9XG4gICAgaWYgKE9iamVjdC5rZXlzKGlnbm9yZWRSdWxlc1doZW5GaXhpbmcpLmxlbmd0aCA+IDApIHtcbiAgICAgIHJ1bGVzID0gaWdub3JlZFJ1bGVzV2hlbkZpeGluZ1xuICAgIH1cblxuICAgIGlmICghaGVscGVycykge1xuICAgICAgaGVscGVycyA9IHJlcXVpcmUoJy4vaGVscGVycycpXG4gICAgfVxuICAgIGlmICghdGhpcy53b3JrZXIpIHtcbiAgICAgIGF3YWl0IHdhaXRPbklkbGUoKVxuICAgIH1cblxuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGhlbHBlcnMuc2VuZEpvYih0aGlzLndvcmtlciwge1xuICAgICAgICB0eXBlOiAnZml4JyxcbiAgICAgICAgY29uZmlnOiBhdG9tLmNvbmZpZy5nZXQoJ2xpbnRlci1lc2xpbnQnKSxcbiAgICAgICAgY29udGVudHM6IHRleHQsXG4gICAgICAgIHJ1bGVzLFxuICAgICAgICBmaWxlUGF0aCxcbiAgICAgICAgcHJvamVjdFBhdGhcbiAgICAgIH0pXG4gICAgICBpZiAoIWlzU2F2ZSkge1xuICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkU3VjY2VzcyhyZXNwb25zZSlcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nKGVyci5tZXNzYWdlKVxuICAgIH1cbiAgfSxcbn1cbiJdfQ==