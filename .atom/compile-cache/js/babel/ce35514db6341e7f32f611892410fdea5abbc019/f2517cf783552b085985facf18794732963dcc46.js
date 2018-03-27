function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _atom = require('atom');

var _helpers = require('./helpers');

var _escapeHtml = require('escape-html');

var _escapeHtml2 = _interopRequireDefault(_escapeHtml);

'use babel';

module.exports = {
  config: {
    lintHtmlFiles: {
      title: 'Lint HTML Files',
      description: 'You should also add `eslint-plugin-html` to your .eslintrc plugins',
      type: 'boolean',
      'default': false
    },
    useGlobalEslint: {
      title: 'Use global ESLint installation',
      description: 'Make sure you have it in your $PATH',
      type: 'boolean',
      'default': false
    },
    showRuleIdInMessage: {
      title: 'Show Rule ID in Messages',
      type: 'boolean',
      'default': true
    },
    disableWhenNoEslintConfig: {
      title: 'Disable when no ESLint config is found (in package.json or .eslintrc)',
      type: 'boolean',
      'default': true
    },
    eslintrcPath: {
      title: '.eslintrc Path',
      description: "It will only be used when there's no config file in project",
      type: 'string',
      'default': ''
    },
    globalNodePath: {
      title: 'Global Node Installation Path',
      description: 'Write the value of `npm get prefix` here',
      type: 'string',
      'default': ''
    },
    eslintRulesDir: {
      title: 'ESLint Rules Dir',
      description: 'Specify a directory for ESLint to load rules from',
      type: 'string',
      'default': ''
    },
    disableEslintIgnore: {
      title: 'Don\'t use .eslintignore files',
      type: 'boolean',
      'default': false
    },
    disableFSCache: {
      title: 'Disable FileSystem Cache',
      description: 'Paths of node_modules, .eslintignore and others are cached',
      type: 'boolean',
      'default': false
    },
    fixOnSave: {
      title: 'Fix errors on save',
      description: 'Have eslint attempt to fix some errors automatically when saving the file.',
      type: 'boolean',
      'default': false
    }
  },
  activate: function activate() {
    var _this = this;

    require('atom-package-deps').install();

    this.subscriptions = new _atom.CompositeDisposable();
    this.active = true;
    this.worker = null;
    this.scopes = ['source.js', 'source.jsx', 'source.js.jsx', 'source.babel', 'source.js-semantic'];

    var embeddedScope = 'source.js.embedded.html';
    this.subscriptions.add(atom.config.observe('linter-eslint.lintHtmlFiles', function (lintHtmlFiles) {
      if (lintHtmlFiles) {
        _this.scopes.push(embeddedScope);
      } else {
        if (_this.scopes.indexOf(embeddedScope) !== -1) {
          _this.scopes.splice(_this.scopes.indexOf(embeddedScope), 1);
        }
      }
    }));
    this.subscriptions.add(atom.workspace.observeTextEditors(function (editor) {
      editor.onDidSave(function () {
        if (_this.scopes.indexOf(editor.getGrammar().scopeName) !== -1 && atom.config.get('linter-eslint.fixOnSave')) {
          _this.worker.request('job', {
            type: 'fix',
            config: atom.config.get('linter-eslint'),
            filePath: editor.getPath()
          })['catch'](function (response) {
            return atom.notifications.addWarning(response);
          });
        }
      });
    }));
    this.subscriptions.add(atom.commands.add('atom-text-editor', {
      'linter-eslint:fix-file': function linterEslintFixFile() {
        var textEditor = atom.workspace.getActiveTextEditor();
        var filePath = textEditor.getPath();

        if (!textEditor || textEditor.isModified()) {
          // Abort for invalid or unsaved text editors
          atom.notifications.addError('Linter-ESLint: Please save before fixing');
          return;
        }

        _this.worker.request('job', {
          type: 'fix',
          config: atom.config.get('linter-eslint'),
          filePath: filePath
        }).then(function (response) {
          return atom.notifications.addSuccess(response);
        })['catch'](function (response) {
          return atom.notifications.addWarning(response);
        });
      }
    }));

    var initializeWorker = function initializeWorker() {
      var _spawnWorker = (0, _helpers.spawnWorker)();

      var worker = _spawnWorker.worker;
      var subscription = _spawnWorker.subscription;

      _this.worker = worker;
      _this.subscriptions.add(subscription);
      worker.onDidExit(function () {
        if (_this.active) {
          (0, _helpers.showError)('Worker died unexpectedly', 'Check your console for more ' + 'info. A new worker will be spawned instantly.');
          setTimeout(initializeWorker, 1000);
        }
      });
    };
    initializeWorker();
  },
  deactivate: function deactivate() {
    this.active = false;
    this.subscriptions.dispose();
  },
  provideLinter: function provideLinter() {
    var _this2 = this;

    var Helpers = require('atom-linter');
    return {
      name: 'ESLint',
      grammarScopes: this.scopes,
      scope: 'file',
      lintOnFly: true,
      lint: function lint(textEditor) {
        var text = textEditor.getText();
        if (text.length === 0) {
          return Promise.resolve([]);
        }
        var filePath = textEditor.getPath();
        var showRule = atom.config.get('linter-eslint.showRuleIdInMessage');

        return _this2.worker.request('job', {
          contents: text,
          type: 'lint',
          config: atom.config.get('linter-eslint'),
          filePath: filePath
        }).then(function (response) {
          return response.map(function (_ref) {
            var message = _ref.message;
            var line = _ref.line;
            var severity = _ref.severity;
            var ruleId = _ref.ruleId;
            var column = _ref.column;
            var fix = _ref.fix;

            var textBuffer = textEditor.getBuffer();
            var linterFix = null;
            if (fix) {
              var fixRange = new _atom.Range(textBuffer.positionForCharacterIndex(fix.range[0]), textBuffer.positionForCharacterIndex(fix.range[1]));
              linterFix = {
                range: fixRange,
                newText: fix.text
              };
            }
            var range = Helpers.rangeFromLineNumber(textEditor, line - 1);
            if (column) {
              range[0][1] = column - 1;
            }
            if (column > range[1][1]) {
              range[1][1] = column - 1;
            }
            var ret = {
              filePath: filePath,
              type: severity === 1 ? 'Warning' : 'Error',
              range: range
            };
            if (showRule) {
              var elName = ruleId ? 'a' : 'span';
              var href = ruleId ? ' href=' + (0, _helpers.ruleURI)(ruleId) : '';
              ret.html = '<' + elName + href + ' class="badge badge-flexible eslint">' + ((ruleId || 'Fatal') + '</' + elName + '> ' + (0, _escapeHtml2['default'])(message));
            } else {
              ret.text = message;
            }
            if (linterFix) {
              ret.fix = linterFix;
            }
            return ret;
          });
        });
      }
    };
  }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci1lc2xpbnQvc3JjL21haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7b0JBRTJDLE1BQU07O3VCQUNELFdBQVc7OzBCQUNwQyxhQUFhOzs7O0FBSnBDLFdBQVcsQ0FBQTs7QUFNWCxNQUFNLENBQUMsT0FBTyxHQUFHO0FBQ2YsUUFBTSxFQUFFO0FBQ04saUJBQWEsRUFBRTtBQUNiLFdBQUssRUFBRSxpQkFBaUI7QUFDeEIsaUJBQVcsRUFBRSxvRUFBb0U7QUFDakYsVUFBSSxFQUFFLFNBQVM7QUFDZixpQkFBUyxLQUFLO0tBQ2Y7QUFDRCxtQkFBZSxFQUFFO0FBQ2YsV0FBSyxFQUFFLGdDQUFnQztBQUN2QyxpQkFBVyxFQUFFLHFDQUFxQztBQUNsRCxVQUFJLEVBQUUsU0FBUztBQUNmLGlCQUFTLEtBQUs7S0FDZjtBQUNELHVCQUFtQixFQUFFO0FBQ25CLFdBQUssRUFBRSwwQkFBMEI7QUFDakMsVUFBSSxFQUFFLFNBQVM7QUFDZixpQkFBUyxJQUFJO0tBQ2Q7QUFDRCw2QkFBeUIsRUFBRTtBQUN6QixXQUFLLEVBQUUsdUVBQXVFO0FBQzlFLFVBQUksRUFBRSxTQUFTO0FBQ2YsaUJBQVMsSUFBSTtLQUNkO0FBQ0QsZ0JBQVksRUFBRTtBQUNaLFdBQUssRUFBRSxnQkFBZ0I7QUFDdkIsaUJBQVcsRUFBRSw2REFBNkQ7QUFDMUUsVUFBSSxFQUFFLFFBQVE7QUFDZCxpQkFBUyxFQUFFO0tBQ1o7QUFDRCxrQkFBYyxFQUFFO0FBQ2QsV0FBSyxFQUFFLCtCQUErQjtBQUN0QyxpQkFBVyxFQUFFLDBDQUEwQztBQUN2RCxVQUFJLEVBQUUsUUFBUTtBQUNkLGlCQUFTLEVBQUU7S0FDWjtBQUNELGtCQUFjLEVBQUU7QUFDZCxXQUFLLEVBQUUsa0JBQWtCO0FBQ3pCLGlCQUFXLEVBQUUsbURBQW1EO0FBQ2hFLFVBQUksRUFBRSxRQUFRO0FBQ2QsaUJBQVMsRUFBRTtLQUNaO0FB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LElBQUksK0NBQ3ZCLE1BQU0sSUFBSSxPQUFPLENBQUEsVUFBSyxNQUFNLFVBQUssNkJBQVcsT0FBTyxDQUFDLENBQUUsQ0FBQTthQUM1RCxNQUFNO0FBQ0wsaUJBQUcsQ0FBQyxJQUFJLEdBQUcsT0FBTyxDQUFBO2FBQ25CO0FBQ0QsZ0JBQUksU0FBUyxFQUFFO0FBQ2IsaUJBQUcsQ0FBQyxHQUFHLEdBQUcsU0FBUyxDQUFBO2FBQ3BCO0FBQ0QsbUJBQU8sR0FBRyxDQUFBO1dBQ1gsQ0FBQztTQUFBLENBQ0gsQ0FBQTtPQUNGO0tBQ0YsQ0FBQTtHQUNGO0NBQ0YsQ0FBQSIsImZpbGUiOiIvVXNlcnMvdGxhbmRhdS9kb3RmaWxlcy8uYXRvbS9wYWNrYWdlcy9saW50ZXItZXNsaW50L3NyYy9tYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCdcblxuaW1wb3J0IHsgQ29tcG9zaXRlRGlzcG9zYWJsZSwgUmFuZ2UgfSBmcm9tICdhdG9tJ1xuaW1wb3J0IHsgc3Bhd25Xb3JrZXIsIHNob3dFcnJvciwgcnVsZVVSSSB9IGZyb20gJy4vaGVscGVycydcbmltcG9ydCBlc2NhcGVIVE1MIGZyb20gJ2VzY2FwZS1odG1sJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgY29uZmlnOiB7XG4gICAgbGludEh0bWxGaWxlczoge1xuICAgICAgdGl0bGU6ICdMaW50IEhUTUwgRmlsZXMnLFxuICAgICAgZGVzY3JpcHRpb246ICdZb3Ugc2hvdWxkIGFsc28gYWRkIGBlc2xpbnQtcGx1Z2luLWh0bWxgIHRvIHlvdXIgLmVzbGludHJjIHBsdWdpbnMnLFxuICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICB9LFxuICAgIHVzZUdsb2JhbEVzbGludDoge1xuICAgICAgdGl0bGU6ICdVc2UgZ2xvYmFsIEVTTGludCBpbnN0YWxsYXRpb24nLFxuICAgICAgZGVzY3JpcHRpb246ICdNYWtlIHN1cmUgeW91IGhhdmUgaXQgaW4geW91ciAkUEFUSCcsXG4gICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICBkZWZhdWx0OiBmYWxzZVxuICAgIH0sXG4gICAgc2hvd1J1bGVJZEluTWVzc2FnZToge1xuICAgICAgdGl0bGU6ICdTaG93IFJ1bGUgSUQgaW4gTWVzc2FnZXMnLFxuICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgIH0sXG4gICAgZGlzYWJsZVdoZW5Ob0VzbGludENvbmZpZzoge1xuICAgICAgdGl0bGU6ICdEaXNhYmxlIHdoZW4gbm8gRVNMaW50IGNvbmZpZyBpcyBmb3VuZCAoaW4gcGFja2FnZS5qc29uIG9yIC5lc2xpbnRyYyknLFxuICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgIH0sXG4gICAgZXNsaW50cmNQYXRoOiB7XG4gICAgICB0aXRsZTogJy5lc2xpbnRyYyBQYXRoJyxcbiAgICAgIGRlc2NyaXB0aW9uOiBcIkl0IHdpbGwgb25seSBiZSB1c2VkIHdoZW4gdGhlcmUncyBubyBjb25maWcgZmlsZSBpbiBwcm9qZWN0XCIsXG4gICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgIGRlZmF1bHQ6ICcnXG4gICAgfSxcbiAgICBnbG9iYWxOb2RlUGF0aDoge1xuICAgICAgdGl0bGU6ICdHbG9iYWwgTm9kZSBJbnN0YWxsYXRpb24gUGF0aCcsXG4gICAgICBkZXNjcmlwdGlvbjogJ1dyaXRlIHRoZSB2YWx1ZSBvZiBgbnBtIGdldCBwcmVmaXhgIGhlcmUnLFxuICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICBkZWZhdWx0OiAnJ1xuICAgIH0sXG4gICAgZXNsaW50UnVsZXNEaXI6IHtcbiAgICAgIHRpdGxlOiAnRVNMaW50IFJ1bGVzIERpcicsXG4gICAgICBkZXNjcmlwdGlvbjogJ1NwZWNpZnkgYSBkaXJlY3RvcnkgZm9yIEVTTGludCB0byBsb2FkIHJ1bGVzIGZyb20nLFxuICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICBkZWZhdWx0OiAnJ1xuICAgIH0sXG4gICAgZGlzYWJsZUVzbGludElnbm9yZToge1xuICAgICAgdGl0bGU6ICdEb25cXCd0IHVzZSAuZXNsaW50aWdub3JlIGZpbGVzJyxcbiAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgfSxcbiAgICBkaXNhYmxlRlNDYWNoZToge1xuICAgICAgdGl0bGU6ICdEaXNhYmxlIEZpbGVTeXN0ZW0gQ2FjaGUnLFxuICAgICAgZGVzY3JpcHRpb246ICdQYXRocyBvZiBub2RlX21vZHVsZXMsIC5lc2xpbnRpZ25vcmUgYW5kIG90aGVycyBhcmUgY2FjaGVkJyxcbiAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgfSxcbiAgICBmaXhPblNhdmU6IHtcbiAgICAgIHRpdGxlOiAnRml4IGVycm9ycyBvbiBzYXZlJyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnSGF2ZSBlc2xpbnQgYXR0ZW1wdCB0byBmaXggc29tZSBlcnJvcnMgYXV0b21hdGljYWxseSB3aGVuIHNhdmluZyB0aGUgZmlsZS4nLFxuICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICB9XG4gIH0sXG4gIGFjdGl2YXRlKCkge1xuICAgIHJlcXVpcmUoJ2F0b20tcGFja2FnZS1kZXBzJykuaW5zdGFsbCgpXG5cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG4gICAgdGhpcy5hY3RpdmUgPSB0cnVlXG4gICAgdGhpcy53b3JrZXIgPSBudWxsXG4gICAgdGhpcy5zY29wZXMgPSBbJ3NvdXJjZS5qcycsICdzb3VyY2UuanN4JywgJ3NvdXJjZS5qcy5qc3gnLCAnc291cmNlLmJhYmVsJywgJ3NvdXJjZS5qcy1zZW1hbnRpYyddXG5cbiAgICBjb25zdCBlbWJlZGRlZFNjb3BlID0gJ3NvdXJjZS5qcy5lbWJlZGRlZC5odG1sJ1xuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb25maWcub2JzZXJ2ZSgnbGludGVyLWVzbGludC5saW50SHRtbEZpbGVzJywgbGludEh0bWxGaWxlcyA9PiB7XG4gICAgICBpZiAobGludEh0bWxGaWxlcykge1xuICAgICAgICB0aGlzLnNjb3Blcy5wdXNoKGVtYmVkZGVkU2NvcGUpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAodGhpcy5zY29wZXMuaW5kZXhPZihlbWJlZGRlZFNjb3BlKSAhPT0gLTEpIHtcbiAgICAgICAgICB0aGlzLnNjb3Blcy5zcGxpY2UodGhpcy5zY29wZXMuaW5kZXhPZihlbWJlZGRlZFNjb3BlKSwgMSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS53b3Jrc3BhY2Uub2JzZXJ2ZVRleHRFZGl0b3JzKChlZGl0b3IpID0+IHtcbiAgICAgIGVkaXRvci5vbkRpZFNhdmUoKCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5zY29wZXMuaW5kZXhPZihlZGl0b3IuZ2V0R3JhbW1hcigpLnNjb3BlTmFtZSkgIT09IC0xICYmXG4gICAgICAgICAgICBhdG9tLmNvbmZpZy5nZXQoJ2xpbnRlci1lc2xpbnQuZml4T25TYXZlJykpIHtcbiAgICAgICAgICB0aGlzLndvcmtlci5yZXF1ZXN0KCdqb2InLCB7XG4gICAgICAgICAgICB0eXBlOiAnZml4JyxcbiAgICAgICAgICAgIGNvbmZpZzogYXRvbS5jb25maWcuZ2V0KCdsaW50ZXItZXNsaW50JyksXG4gICAgICAgICAgICBmaWxlUGF0aDogZWRpdG9yLmdldFBhdGgoKVxuICAgICAgICAgIH0pLmNhdGNoKChyZXNwb25zZSkgPT5cbiAgICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nKHJlc3BvbnNlKVxuICAgICAgICAgIClcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9KSlcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXRleHQtZWRpdG9yJywge1xuICAgICAgJ2xpbnRlci1lc2xpbnQ6Zml4LWZpbGUnOiAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHRleHRFZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgICAgICAgY29uc3QgZmlsZVBhdGggPSB0ZXh0RWRpdG9yLmdldFBhdGgoKVxuXG4gICAgICAgIGlmICghdGV4dEVkaXRvciB8fCB0ZXh0RWRpdG9yLmlzTW9kaWZpZWQoKSkge1xuICAgICAgICAgIC8vIEFib3J0IGZvciBpbnZhbGlkIG9yIHVuc2F2ZWQgdGV4dCBlZGl0b3JzXG4gICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKCdMaW50ZXItRVNMaW50OiBQbGVhc2Ugc2F2ZSBiZWZvcmUgZml4aW5nJylcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMud29ya2VyLnJlcXVlc3QoJ2pvYicsIHtcbiAgICAgICAgICB0eXBlOiAnZml4JyxcbiAgICAgICAgICBjb25maWc6IGF0b20uY29uZmlnLmdldCgnbGludGVyLWVzbGludCcpLFxuICAgICAgICAgIGZpbGVQYXRoXG4gICAgICAgIH0pLnRoZW4oKHJlc3BvbnNlKSA9PlxuICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRTdWNjZXNzKHJlc3BvbnNlKVxuICAgICAgICApLmNhdGNoKChyZXNwb25zZSkgPT5cbiAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkV2FybmluZyhyZXNwb25zZSlcbiAgICAgICAgKVxuICAgICAgfVxuICAgIH0pKVxuXG4gICAgY29uc3QgaW5pdGlhbGl6ZVdvcmtlciA9ICgpID0+IHtcbiAgICAgIGNvbnN0IHsgd29ya2VyLCBzdWJzY3JpcHRpb24gfSA9IHNwYXduV29ya2VyKClcbiAgICAgIHRoaXMud29ya2VyID0gd29ya2VyXG4gICAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKHN1YnNjcmlwdGlvbilcbiAgICAgIHdvcmtlci5vbkRpZEV4aXQoKCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5hY3RpdmUpIHtcbiAgICAgICAgICBzaG93RXJyb3IoJ1dvcmtlciBkaWVkIHVuZXhwZWN0ZWRseScsICdDaGVjayB5b3VyIGNvbnNvbGUgZm9yIG1vcmUgJyArXG4gICAgICAgICAgJ2luZm8uIEEgbmV3IHdvcmtlciB3aWxsIGJlIHNwYXduZWQgaW5zdGFudGx5LicpXG4gICAgICAgICAgc2V0VGltZW91dChpbml0aWFsaXplV29ya2VyLCAxMDAwKVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH1cbiAgICBpbml0aWFsaXplV29ya2VyKClcbiAgfSxcbiAgZGVhY3RpdmF0ZSgpIHtcbiAgICB0aGlzLmFjdGl2ZSA9IGZhbHNlXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICB9LFxuICBwcm92aWRlTGludGVyKCkge1xuICAgIGNvbnN0IEhlbHBlcnMgPSByZXF1aXJlKCdhdG9tLWxpbnRlcicpXG4gICAgcmV0dXJuIHtcbiAgICAgIG5hbWU6ICdFU0xpbnQnLFxuICAgICAgZ3JhbW1hclNjb3BlczogdGhpcy5zY29wZXMsXG4gICAgICBzY29wZTogJ2ZpbGUnLFxuICAgICAgbGludE9uRmx5OiB0cnVlLFxuICAgICAgbGludDogdGV4dEVkaXRvciA9PiB7XG4gICAgICAgIGNvbnN0IHRleHQgPSB0ZXh0RWRpdG9yLmdldFRleHQoKVxuICAgICAgICBpZiAodGV4dC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKFtdKVxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGZpbGVQYXRoID0gdGV4dEVkaXRvci5nZXRQYXRoKClcbiAgICAgICAgY29uc3Qgc2hvd1J1bGUgPSBhdG9tLmNvbmZpZy5nZXQoJ2xpbnRlci1lc2xpbnQuc2hvd1J1bGVJZEluTWVzc2FnZScpXG5cbiAgICAgICAgcmV0dXJuIHRoaXMud29ya2VyLnJlcXVlc3QoJ2pvYicsIHtcbiAgICAgICAgICBjb250ZW50czogdGV4dCxcbiAgICAgICAgICB0eXBlOiAnbGludCcsXG4gICAgICAgICAgY29uZmlnOiBhdG9tLmNvbmZpZy5nZXQoJ2xpbnRlci1lc2xpbnQnKSxcbiAgICAgICAgICBmaWxlUGF0aFxuICAgICAgICB9KS50aGVuKChyZXNwb25zZSkgPT5cbiAgICAgICAgICByZXNwb25zZS5tYXAoKHsgbWVzc2FnZSwgbGluZSwgc2V2ZXJpdHksIHJ1bGVJZCwgY29sdW1uLCBmaXggfSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgdGV4dEJ1ZmZlciA9IHRleHRFZGl0b3IuZ2V0QnVmZmVyKClcbiAgICAgICAgICAgIGxldCBsaW50ZXJGaXggPSBudWxsXG4gICAgICAgICAgICBpZiAoZml4KSB7XG4gICAgICAgICAgICAgIGNvbnN0IGZpeFJhbmdlID0gbmV3IFJhbmdlKFxuICAgICAgICAgICAgICAgIHRleHRCdWZmZXIucG9zaXRpb25Gb3JDaGFyYWN0ZXJJbmRleChmaXgucmFuZ2VbMF0pLFxuICAgICAgICAgICAgICAgIHRleHRCdWZmZXIucG9zaXRpb25Gb3JDaGFyYWN0ZXJJbmRleChmaXgucmFuZ2VbMV0pXG4gICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgbGludGVyRml4ID0ge1xuICAgICAgICAgICAgICAgIHJhbmdlOiBmaXhSYW5nZSxcbiAgICAgICAgICAgICAgICBuZXdUZXh0OiBmaXgudGV4dFxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCByYW5nZSA9IEhlbHBlcnMucmFuZ2VGcm9tTGluZU51bWJlcih0ZXh0RWRpdG9yLCBsaW5lIC0gMSlcbiAgICAgICAgICAgIGlmIChjb2x1bW4pIHtcbiAgICAgICAgICAgICAgcmFuZ2VbMF1bMV0gPSBjb2x1bW4gLSAxXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoY29sdW1uID4gcmFuZ2VbMV1bMV0pIHtcbiAgICAgICAgICAgICAgcmFuZ2VbMV1bMV0gPSBjb2x1bW4gLSAxXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCByZXQgPSB7XG4gICAgICAgICAgICAgIGZpbGVQYXRoLFxuICAgICAgICAgICAgICB0eXBlOiBzZXZlcml0eSA9PT0gMSA/ICdXYXJuaW5nJyA6ICdFcnJvcicsXG4gICAgICAgICAgICAgIHJhbmdlXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoc2hvd1J1bGUpIHtcbiAgICAgICAgICAgICAgY29uc3QgZWxOYW1lID0gcnVsZUlkID8gJ2EnIDogJ3NwYW4nXG4gICAgICAgICAgICAgIGNvbnN0IGhyZWYgPSBydWxlSWQgPyBgIGhyZWY9JHtydWxlVVJJKHJ1bGVJZCl9YCA6ICcnXG4gICAgICAgICAgICAgIHJldC5odG1sID0gYDwke2VsTmFtZX0ke2hyZWZ9IGNsYXNzPVwiYmFkZ2UgYmFkZ2UtZmxleGlibGUgZXNsaW50XCI+YCArXG4gICAgICAgICAgICAgICAgYCR7cnVsZUlkIHx8ICdGYXRhbCd9PC8ke2VsTmFtZX0+ICR7ZXNjYXBlSFRNTChtZXNzYWdlKX1gXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICByZXQudGV4dCA9IG1lc3NhZ2VcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChsaW50ZXJGaXgpIHtcbiAgICAgICAgICAgICAgcmV0LmZpeCA9IGxpbnRlckZpeFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJldFxuICAgICAgICAgIH0pXG4gICAgICAgIClcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cbiJdfQ==
//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/linter-eslint/src/main.js
