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
      title: 'Disable using .eslintignore files',
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci1lc2xpbnQvc3JjL21haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7b0JBRTJDLE1BQU07O3VCQUNELFdBQVc7OzBCQUNwQyxhQUFhOzs7O0FBSnBDLFdBQVcsQ0FBQTs7QUFNWCxNQUFNLENBQUMsT0FBTyxHQUFHO0FBQ2YsUUFBTSxFQUFFO0FBQ04saUJBQWEsRUFBRTtBQUNiLFdBQUssRUFBRSxpQkFBaUI7QUFDeEIsaUJBQVcsRUFBRSxvRUFBb0U7QUFDakYsVUFBSSxFQUFFLFNBQVM7QUFDZixpQkFBUyxLQUFLO0tBQ2Y7QUFDRCxtQkFBZSxFQUFFO0FBQ2YsV0FBSyxFQUFFLGdDQUFnQztBQUN2QyxpQkFBVyxFQUFFLHFDQUFxQztBQUNsRCxVQUFJLEVBQUUsU0FBUztBQUNmLGlCQUFTLEtBQUs7S0FDZjtBQUNELHVCQUFtQixFQUFFO0FBQ25CLFdBQUssRUFBRSwwQkFBMEI7QUFDakMsVUFBSSxFQUFFLFNBQVM7QUFDZixpQkFBUyxJQUFJO0tBQ2Q7QUFDRCw2QkFBeUIsRUFBRTtBQUN6QixXQUFLLEVBQUUsdUVBQXVFO0FBQzlFLFVBQUksRUFBRSxTQUFTO0FBQ2YsaUJBQVMsSUFBSTtLQUNkO0FBQ0QsZ0JBQVksRUFBRTtBQUNaLFdBQUssRUFBRSxnQkFBZ0I7QUFDdkIsaUJBQVcsRUFBRSw2REFBNkQ7QUFDMUUsVUFBSSxFQUFFLFFBQVE7QUFDZCxpQkFBUyxFQUFFO0tBQ1o7QUFDRCxrQkFBYyxFQUFFO0FBQ2QsV0FBSyxFQUFFLCtCQUErQjtBQUN0QyxpQkFBVyxFQUFFLDBDQUEwQztBQUN2RCxVQUFJLEVBQUUsUUFBUTtBQUNkLGlCQUFTLEVBQUU7S0FDWjtBQUNELGtCQUFjLEVBQUU7QUFDZCxXQUFLLEVBQUUsa0JBQWtCO0FBQ3pCLGlCQUFXLEVBQUUsbURBQW1EO0FBQ2hFLFVBQUksRUFBRSxRQUFRO0FBQ2QsaUJBQVMsRUFBRTtLQUNaO0FB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LElBQUksK0NBQ3ZCLE1BQU0sSUFBSSxPQUFPLENBQUEsVUFBSyxNQUFNLFVBQUssNkJBQVcsT0FBTyxDQUFDLENBQUUsQ0FBQTthQUM1RCxNQUFNO0FBQ0wsaUJBQUcsQ0FBQyxJQUFJLEdBQUcsT0FBTyxDQUFBO2FBQ25CO0FBQ0QsZ0JBQUksU0FBUyxFQUFFO0FBQ2IsaUJBQUcsQ0FBQyxHQUFHLEdBQUcsU0FBUyxDQUFBO2FBQ3BCO0FBQ0QsbUJBQU8sR0FBRyxDQUFBO1dBQ1gsQ0FBQztTQUFBLENBQ0gsQ0FBQTtPQUNGO0tBQ0YsQ0FBQTtHQUNGO0NBQ0YsQ0FBQSIsImZpbGUiOiIvVXNlcnMvdGxhbmRhdS9kb3RmaWxlcy8uYXRvbS9wYWNrYWdlcy9saW50ZXItZXNsaW50L3NyYy9tYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCdcblxuaW1wb3J0IHsgQ29tcG9zaXRlRGlzcG9zYWJsZSwgUmFuZ2UgfSBmcm9tICdhdG9tJ1xuaW1wb3J0IHsgc3Bhd25Xb3JrZXIsIHNob3dFcnJvciwgcnVsZVVSSSB9IGZyb20gJy4vaGVscGVycydcbmltcG9ydCBlc2NhcGVIVE1MIGZyb20gJ2VzY2FwZS1odG1sJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgY29uZmlnOiB7XG4gICAgbGludEh0bWxGaWxlczoge1xuICAgICAgdGl0bGU6ICdMaW50IEhUTUwgRmlsZXMnLFxuICAgICAgZGVzY3JpcHRpb246ICdZb3Ugc2hvdWxkIGFsc28gYWRkIGBlc2xpbnQtcGx1Z2luLWh0bWxgIHRvIHlvdXIgLmVzbGludHJjIHBsdWdpbnMnLFxuICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICB9LFxuICAgIHVzZUdsb2JhbEVzbGludDoge1xuICAgICAgdGl0bGU6ICdVc2UgZ2xvYmFsIEVTTGludCBpbnN0YWxsYXRpb24nLFxuICAgICAgZGVzY3JpcHRpb246ICdNYWtlIHN1cmUgeW91IGhhdmUgaXQgaW4geW91ciAkUEFUSCcsXG4gICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICBkZWZhdWx0OiBmYWxzZVxuICAgIH0sXG4gICAgc2hvd1J1bGVJZEluTWVzc2FnZToge1xuICAgICAgdGl0bGU6ICdTaG93IFJ1bGUgSUQgaW4gTWVzc2FnZXMnLFxuICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgIH0sXG4gICAgZGlzYWJsZVdoZW5Ob0VzbGludENvbmZpZzoge1xuICAgICAgdGl0bGU6ICdEaXNhYmxlIHdoZW4gbm8gRVNMaW50IGNvbmZpZyBpcyBmb3VuZCAoaW4gcGFja2FnZS5qc29uIG9yIC5lc2xpbnRyYyknLFxuICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgIH0sXG4gICAgZXNsaW50cmNQYXRoOiB7XG4gICAgICB0aXRsZTogJy5lc2xpbnRyYyBQYXRoJyxcbiAgICAgIGRlc2NyaXB0aW9uOiBcIkl0IHdpbGwgb25seSBiZSB1c2VkIHdoZW4gdGhlcmUncyBubyBjb25maWcgZmlsZSBpbiBwcm9qZWN0XCIsXG4gICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgIGRlZmF1bHQ6ICcnXG4gICAgfSxcbiAgICBnbG9iYWxOb2RlUGF0aDoge1xuICAgICAgdGl0bGU6ICdHbG9iYWwgTm9kZSBJbnN0YWxsYXRpb24gUGF0aCcsXG4gICAgICBkZXNjcmlwdGlvbjogJ1dyaXRlIHRoZSB2YWx1ZSBvZiBgbnBtIGdldCBwcmVmaXhgIGhlcmUnLFxuICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICBkZWZhdWx0OiAnJ1xuICAgIH0sXG4gICAgZXNsaW50UnVsZXNEaXI6IHtcbiAgICAgIHRpdGxlOiAnRVNMaW50IFJ1bGVzIERpcicsXG4gICAgICBkZXNjcmlwdGlvbjogJ1NwZWNpZnkgYSBkaXJlY3RvcnkgZm9yIEVTTGludCB0byBsb2FkIHJ1bGVzIGZyb20nLFxuICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICBkZWZhdWx0OiAnJ1xuICAgIH0sXG4gICAgZGlzYWJsZUVzbGludElnbm9yZToge1xuICAgICAgdGl0bGU6ICdEaXNhYmxlIHVzaW5nIC5lc2xpbnRpZ25vcmUgZmlsZXMnLFxuICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICB9LFxuICAgIGRpc2FibGVGU0NhY2hlOiB7XG4gICAgICB0aXRsZTogJ0Rpc2FibGUgRmlsZVN5c3RlbSBDYWNoZScsXG4gICAgICBkZXNjcmlwdGlvbjogJ1BhdGhzIG9mIG5vZGVfbW9kdWxlcywgLmVzbGludGlnbm9yZSBhbmQgb3RoZXJzIGFyZSBjYWNoZWQnLFxuICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICB9LFxuICAgIGZpeE9uU2F2ZToge1xuICAgICAgdGl0bGU6ICdGaXggZXJyb3JzIG9uIHNhdmUnLFxuICAgICAgZGVzY3JpcHRpb246ICdIYXZlIGVzbGludCBhdHRlbXB0IHRvIGZpeCBzb21lIGVycm9ycyBhdXRvbWF0aWNhbGx5IHdoZW4gc2F2aW5nIHRoZSBmaWxlLicsXG4gICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICBkZWZhdWx0OiBmYWxzZVxuICAgIH1cbiAgfSxcbiAgYWN0aXZhdGUoKSB7XG4gICAgcmVxdWlyZSgnYXRvbS1wYWNrYWdlLWRlcHMnKS5pbnN0YWxsKClcblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcbiAgICB0aGlzLmFjdGl2ZSA9IHRydWVcbiAgICB0aGlzLndvcmtlciA9IG51bGxcbiAgICB0aGlzLnNjb3BlcyA9IFsnc291cmNlLmpzJywgJ3NvdXJjZS5qc3gnLCAnc291cmNlLmpzLmpzeCcsICdzb3VyY2UuYmFiZWwnLCAnc291cmNlLmpzLXNlbWFudGljJ11cblxuICAgIGNvbnN0IGVtYmVkZGVkU2NvcGUgPSAnc291cmNlLmpzLmVtYmVkZGVkLmh0bWwnXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbmZpZy5vYnNlcnZlKCdsaW50ZXItZXNsaW50LmxpbnRIdG1sRmlsZXMnLCBsaW50SHRtbEZpbGVzID0+IHtcbiAgICAgIGlmIChsaW50SHRtbEZpbGVzKSB7XG4gICAgICAgIHRoaXMuc2NvcGVzLnB1c2goZW1iZWRkZWRTY29wZSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmICh0aGlzLnNjb3Blcy5pbmRleE9mKGVtYmVkZGVkU2NvcGUpICE9PSAtMSkge1xuICAgICAgICAgIHRoaXMuc2NvcGVzLnNwbGljZSh0aGlzLnNjb3Blcy5pbmRleE9mKGVtYmVkZGVkU2NvcGUpLCAxKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSkpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLndvcmtzcGFjZS5vYnNlcnZlVGV4dEVkaXRvcnMoKGVkaXRvcikgPT4ge1xuICAgICAgZWRpdG9yLm9uRGlkU2F2ZSgoKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLnNjb3Blcy5pbmRleE9mKGVkaXRvci5nZXRHcmFtbWFyKCkuc2NvcGVOYW1lKSAhPT0gLTEgJiZcbiAgICAgICAgICAgIGF0b20uY29uZmlnLmdldCgnbGludGVyLWVzbGludC5maXhPblNhdmUnKSkge1xuICAgICAgICAgIHRoaXMud29ya2VyLnJlcXVlc3QoJ2pvYicsIHtcbiAgICAgICAgICAgIHR5cGU6ICdmaXgnLFxuICAgICAgICAgICAgY29uZmlnOiBhdG9tLmNvbmZpZy5nZXQoJ2xpbnRlci1lc2xpbnQnKSxcbiAgICAgICAgICAgIGZpbGVQYXRoOiBlZGl0b3IuZ2V0UGF0aCgpXG4gICAgICAgICAgfSkuY2F0Y2goKHJlc3BvbnNlKSA9PlxuICAgICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFdhcm5pbmcocmVzcG9uc2UpXG4gICAgICAgICAgKVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH0pKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20tdGV4dC1lZGl0b3InLCB7XG4gICAgICAnbGludGVyLWVzbGludDpmaXgtZmlsZSc6ICgpID0+IHtcbiAgICAgICAgY29uc3QgdGV4dEVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgICAgICBjb25zdCBmaWxlUGF0aCA9IHRleHRFZGl0b3IuZ2V0UGF0aCgpXG5cbiAgICAgICAgaWYgKCF0ZXh0RWRpdG9yIHx8IHRleHRFZGl0b3IuaXNNb2RpZmllZCgpKSB7XG4gICAgICAgICAgLy8gQWJvcnQgZm9yIGludmFsaWQgb3IgdW5zYXZlZCB0ZXh0IGVkaXRvcnNcbiAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoJ0xpbnRlci1FU0xpbnQ6IFBsZWFzZSBzYXZlIGJlZm9yZSBmaXhpbmcnKVxuICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy53b3JrZXIucmVxdWVzdCgnam9iJywge1xuICAgICAgICAgIHR5cGU6ICdmaXgnLFxuICAgICAgICAgIGNvbmZpZzogYXRvbS5jb25maWcuZ2V0KCdsaW50ZXItZXNsaW50JyksXG4gICAgICAgICAgZmlsZVBhdGhcbiAgICAgICAgfSkudGhlbigocmVzcG9uc2UpID0+XG4gICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFN1Y2Nlc3MocmVzcG9uc2UpXG4gICAgICAgICkuY2F0Y2goKHJlc3BvbnNlKSA9PlxuICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nKHJlc3BvbnNlKVxuICAgICAgICApXG4gICAgICB9XG4gICAgfSkpXG5cbiAgICBjb25zdCBpbml0aWFsaXplV29ya2VyID0gKCkgPT4ge1xuICAgICAgY29uc3QgeyB3b3JrZXIsIHN1YnNjcmlwdGlvbiB9ID0gc3Bhd25Xb3JrZXIoKVxuICAgICAgdGhpcy53b3JrZXIgPSB3b3JrZXJcbiAgICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoc3Vic2NyaXB0aW9uKVxuICAgICAgd29ya2VyLm9uRGlkRXhpdCgoKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLmFjdGl2ZSkge1xuICAgICAgICAgIHNob3dFcnJvcignV29ya2VyIGRpZWQgdW5leHBlY3RlZGx5JywgJ0NoZWNrIHlvdXIgY29uc29sZSBmb3IgbW9yZSAnICtcbiAgICAgICAgICAnaW5mby4gQSBuZXcgd29ya2VyIHdpbGwgYmUgc3Bhd25lZCBpbnN0YW50bHkuJylcbiAgICAgICAgICBzZXRUaW1lb3V0KGluaXRpYWxpemVXb3JrZXIsIDEwMDApXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfVxuICAgIGluaXRpYWxpemVXb3JrZXIoKVxuICB9LFxuICBkZWFjdGl2YXRlKCkge1xuICAgIHRoaXMuYWN0aXZlID0gZmFsc2VcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG4gIH0sXG4gIHByb3ZpZGVMaW50ZXIoKSB7XG4gICAgY29uc3QgSGVscGVycyA9IHJlcXVpcmUoJ2F0b20tbGludGVyJylcbiAgICByZXR1cm4ge1xuICAgICAgbmFtZTogJ0VTTGludCcsXG4gICAgICBncmFtbWFyU2NvcGVzOiB0aGlzLnNjb3BlcyxcbiAgICAgIHNjb3BlOiAnZmlsZScsXG4gICAgICBsaW50T25GbHk6IHRydWUsXG4gICAgICBsaW50OiB0ZXh0RWRpdG9yID0+IHtcbiAgICAgICAgY29uc3QgdGV4dCA9IHRleHRFZGl0b3IuZ2V0VGV4dCgpXG4gICAgICAgIGlmICh0ZXh0Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoW10pXG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZmlsZVBhdGggPSB0ZXh0RWRpdG9yLmdldFBhdGgoKVxuICAgICAgICBjb25zdCBzaG93UnVsZSA9IGF0b20uY29uZmlnLmdldCgnbGludGVyLWVzbGludC5zaG93UnVsZUlkSW5NZXNzYWdlJylcblxuICAgICAgICByZXR1cm4gdGhpcy53b3JrZXIucmVxdWVzdCgnam9iJywge1xuICAgICAgICAgIGNvbnRlbnRzOiB0ZXh0LFxuICAgICAgICAgIHR5cGU6ICdsaW50JyxcbiAgICAgICAgICBjb25maWc6IGF0b20uY29uZmlnLmdldCgnbGludGVyLWVzbGludCcpLFxuICAgICAgICAgIGZpbGVQYXRoXG4gICAgICAgIH0pLnRoZW4oKHJlc3BvbnNlKSA9PlxuICAgICAgICAgIHJlc3BvbnNlLm1hcCgoeyBtZXNzYWdlLCBsaW5lLCBzZXZlcml0eSwgcnVsZUlkLCBjb2x1bW4sIGZpeCB9KSA9PiB7XG4gICAgICAgICAgICBjb25zdCB0ZXh0QnVmZmVyID0gdGV4dEVkaXRvci5nZXRCdWZmZXIoKVxuICAgICAgICAgICAgbGV0IGxpbnRlckZpeCA9IG51bGxcbiAgICAgICAgICAgIGlmIChmaXgpIHtcbiAgICAgICAgICAgICAgY29uc3QgZml4UmFuZ2UgPSBuZXcgUmFuZ2UoXG4gICAgICAgICAgICAgICAgdGV4dEJ1ZmZlci5wb3NpdGlvbkZvckNoYXJhY3RlckluZGV4KGZpeC5yYW5nZVswXSksXG4gICAgICAgICAgICAgICAgdGV4dEJ1ZmZlci5wb3NpdGlvbkZvckNoYXJhY3RlckluZGV4KGZpeC5yYW5nZVsxXSlcbiAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICBsaW50ZXJGaXggPSB7XG4gICAgICAgICAgICAgICAgcmFuZ2U6IGZpeFJhbmdlLFxuICAgICAgICAgICAgICAgIG5ld1RleHQ6IGZpeC50ZXh0XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHJhbmdlID0gSGVscGVycy5yYW5nZUZyb21MaW5lTnVtYmVyKHRleHRFZGl0b3IsIGxpbmUgLSAxKVxuICAgICAgICAgICAgaWYgKGNvbHVtbikge1xuICAgICAgICAgICAgICByYW5nZVswXVsxXSA9IGNvbHVtbiAtIDFcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChjb2x1bW4gPiByYW5nZVsxXVsxXSkge1xuICAgICAgICAgICAgICByYW5nZVsxXVsxXSA9IGNvbHVtbiAtIDFcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHJldCA9IHtcbiAgICAgICAgICAgICAgZmlsZVBhdGgsXG4gICAgICAgICAgICAgIHR5cGU6IHNldmVyaXR5ID09PSAxID8gJ1dhcm5pbmcnIDogJ0Vycm9yJyxcbiAgICAgICAgICAgICAgcmFuZ2VcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChzaG93UnVsZSkge1xuICAgICAgICAgICAgICBjb25zdCBlbE5hbWUgPSBydWxlSWQgPyAnYScgOiAnc3BhbidcbiAgICAgICAgICAgICAgY29uc3QgaHJlZiA9IHJ1bGVJZCA/IGAgaHJlZj0ke3J1bGVVUkkocnVsZUlkKX1gIDogJydcbiAgICAgICAgICAgICAgcmV0Lmh0bWwgPSBgPCR7ZWxOYW1lfSR7aHJlZn0gY2xhc3M9XCJiYWRnZSBiYWRnZS1mbGV4aWJsZSBlc2xpbnRcIj5gICtcbiAgICAgICAgICAgICAgICBgJHtydWxlSWQgfHwgJ0ZhdGFsJ308LyR7ZWxOYW1lfT4gJHtlc2NhcGVIVE1MKG1lc3NhZ2UpfWBcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHJldC50ZXh0ID0gbWVzc2FnZVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGxpbnRlckZpeCkge1xuICAgICAgICAgICAgICByZXQuZml4ID0gbGludGVyRml4XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmV0XG4gICAgICAgICAgfSlcbiAgICAgICAgKVxuICAgICAgfVxuICAgIH1cbiAgfVxufVxuIl19
//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/linter-eslint/src/main.js
