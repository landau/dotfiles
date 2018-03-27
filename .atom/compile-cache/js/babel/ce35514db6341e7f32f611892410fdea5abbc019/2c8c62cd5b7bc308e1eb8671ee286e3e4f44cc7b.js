Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _atom = require('atom');

var _atomLinter = require('atom-linter');

var _atomAutocomplete = require('atom-autocomplete');

var _helpers = require('./helpers');

var _coverageView = require('./coverage-view');

var _coverageView2 = _interopRequireDefault(_coverageView);

var spawnedServers = new Set();
var defaultFlowFile = _path2['default'].resolve(__dirname, '..', 'vendor', '.flowconfig');
var defaultFlowBinLocation = 'node_modules/.bin/flow';
var grammarScopes = ['source.js', 'source.js.jsx'];

exports['default'] = {
  activate: function activate() {
    var _this = this;

    // eslint-disable-next-line global-require
    require('atom-package-deps').install('flow-ide', true);

    this.subscriptions = new _atom.CompositeDisposable();
    this.subscriptions.add(atom.config.observe('flow-ide.executablePath', function (executablePath) {
      _this.executablePath = executablePath;
    }));
    this.subscriptions.add(atom.config.observe('flow-ide.onlyIfAppropriate', function (onlyIfAppropriate) {
      _this.onlyIfAppropriate = onlyIfAppropriate;
    }));

    this.hyperclickPriority = null;
    var restartNotification = undefined;
    this.subscriptions.add(atom.config.observe('flow-ide.hyperclickPriority', function (hyperclickPriority) {
      if (_this.hyperclickPriority != null) {
        if (hyperclickPriority !== _this.hyperclickPriority && restartNotification === undefined) {
          restartNotification = atom.notifications.addSuccess('Restart atom to update flow-ide priority?', {
            dismissable: true,
            buttons: [{
              text: 'Restart',
              onDidClick: function onDidClick() {
                return atom.restartApplication();
              }
            }]
          });
          restartNotification.onDidDismiss(function () {
            restartNotification = undefined;
          });
        }
      }
      _this.hyperclickPriority = hyperclickPriority;
    }));
    this.subscriptions.add(atom.config.observe('flow-ide.showUncovered', function (showUncovered) {
      _this.showUncovered = showUncovered;
      // lint again so that the coverage actually updates
      var view = atom.views.getView(atom.workspace.getActiveTextEditor());
      if (view) {
        atom.commands.dispatch(view, 'linter:lint');
      }
    }));
    this.subscriptions.add(atom.workspace.onDidChangeActivePaneItem(function (item) {
      if (_this.coverageView) {
        var coverage = _this.coverages.get(item);
        if (coverage) {
          _this.coverageView.update(coverage);
        } else {
          _this.coverageView.reset();
        }
      }
    }));

    this.coverages = new WeakMap();
  },

  getExecutablePath: _asyncToGenerator(function* (fileDirectory) {
    return this.executablePath || (yield (0, _atomLinter.findCachedAsync)(fileDirectory, defaultFlowBinLocation)) || 'flow';
  }),

  deactivate: function deactivate() {
    var _this2 = this;

    this.subscriptions.dispose();
    spawnedServers.forEach(function (rootDirectory) {
      var executable = _this2.executablePath || (0, _atomLinter.findCached)(rootDirectory, defaultFlowBinLocation) || 'flow';
      (0, _atomLinter.exec)(executable, ['stop'], {
        cwd: rootDirectory,
        timeout: 60 * 1000,
        detached: true,
        ignoreExitCode: true
      })['catch'](function () {
        return null;
      }); // <-- ignore all errors
    });
  },

  provideLinter: function provideLinter() {
    return [this.provideStatusLinter(), this.provideCoverageLinter()];
  },

  provideStatusLinter: function provideStatusLinter() {
    var _this3 = this;

    var linter = {
      name: 'Flow IDE',
      scope: 'project',
      grammarScopes: grammarScopes,
      lintsOnChange: false,
      // eslint-disable-next-line arrow-parens
      lint: _asyncToGenerator(function* (textEditor) {
        var configFile = undefined;
        var filePath = textEditor.getPath();
        var fileDirectory = _path2['default'].dirname(filePath);

        if (_this3.onlyIfAppropriate) {
          configFile = yield (0, _atomLinter.findCachedAsync)(fileDirectory, '.flowconfig');
          if (!configFile) {
            return [];
          }
        }

        var executable = yield _this3.getExecutablePath(fileDirectory);

        var result = undefined;
        try {
          result = yield (0, _atomLinter.exec)(executable, ['status', '--json'], {
            cwd: fileDirectory,
            timeout: 60 * 1000,
            uniqueKey: 'flow-ide-linter',
            ignoreExitCode: true
          });
          if (result === null) {
            return null;
          }
        } catch (error) {
          if (error.message.indexOf(_helpers.INIT_MESSAGE) !== -1 && configFile) {
            spawnedServers.add(_path2['default'].dirname(configFile));
          }
          if (error.message.indexOf(_helpers.INIT_MESSAGE) !== -1 || error.message.indexOf(_helpers.RECHECKING_MESSAGE) !== -1) {
            return linter.lint(textEditor);
          } else if (error.code === 'ENOENT') {
            throw new Error('Unable to find `flow` executable.');
          } else {
            throw error;
          }
        }

        return (0, _helpers.toStatusLinterMessages)(result);
      })
    };
    return linter;
  },
  provideCoverageLinter: function provideCoverageLinter() {
    var _this4 = this;

    var linter = {
      name: 'Flow IDE Coverage',
      scope: 'file',
      grammarScopes: grammarScopes,
      lintsOnChange: false,
      lint: _asyncToGenerator(function* (textEditor) {
        var configFile = undefined;
        var filePath = textEditor.getPath();
        var fileDirectory = _path2['default'].dirname(filePath);

        if (_this4.onlyIfAppropriate) {
          configFile = yield (0, _atomLinter.findCachedAsync)(fileDirectory, '.flowconfig');
          if (!configFile) {
            return [];
          }
        }

        var executable = yield _this4.getExecutablePath(fileDirectory);

        var result = undefined;
        try {
          result = yield (0, _atomLinter.exec)(executable, ['coverage', filePath, '--json'], {
            cwd: fileDirectory,
            timeout: 60 * 1000,
            uniqueKey: 'flow-ide-coverage',
            ignoreExitCode: true
          });
          if (result === null) {
            return null;
          }
        } catch (error) {
          if (error.message.indexOf(_helpers.INIT_MESSAGE) !== -1 && configFile) {
            spawnedServers.add(_path2['default'].dirname(configFile));
          }
          if (error.message.indexOf(_helpers.INIT_MESSAGE) !== -1 || error.message.indexOf(_helpers.RECHECKING_MESSAGE) !== -1) {
            return linter.lint(textEditor);
          } else if (error.code === 'ENOENT') {
            throw new Error('Unable to find `flow` executable.');
          } else {
            throw error;
          }
        }

        var coverage = JSON.parse(result);
        _this4.coverages.set(textEditor, coverage);
        if (_this4.coverageView) {
          _this4.coverageView.update(coverage);
        }
        return _this4.showUncovered ? (0, _helpers.toCoverageLinterMessages)(coverage) : [];
      })
    };
    return linter;
  },

  provideAutocomplete: function provideAutocomplete() {
    var _this5 = this;

    var provider = {
      selector: grammarScopes.map(function (item) {
        return '.' + item;
      }).join(', '),
      disableForSelector: '.comment',
      inclusionPriority: 100,
      // eslint-disable-next-line arrow-parens
      getSuggestions: _asyncToGenerator(function* (params) {
        var editor = params.editor;
        var bufferPosition = params.bufferPosition;
        var activatedManually = params.activatedManually;

        var prefix = params.prefix;
        var filePath = editor.getPath();
        if (!filePath) {
          // We not process files without filepath
          return [];
        }

        var fileDirectory = _path2['default'].dirname(filePath);
        var fileContents = (0, _helpers.injectPosition)(editor.getText(), editor, bufferPosition);
        var flowOptions = ['autocomplete', '--json', filePath];

        var configFile = yield (0, _atomLinter.findCachedAsync)(fileDirectory, '.flowconfig');
        if (!configFile) {
          if (_this5.onlyIfAppropriate) {
            return [];
          }
          flowOptions = ['autocomplete', '--root', defaultFlowFile, '--json', filePath];
        }

        // NOTE: Fix for class properties autocompletion
        if (prefix === '.') {
          prefix = '';
        }

        if (!(0, _atomAutocomplete.shouldTriggerAutocomplete)({ activatedManually: activatedManually, bufferPosition: bufferPosition, editor: editor })) {
          return [];
        }

        var result = undefined;
        try {
          result = yield (0, _atomLinter.exec)((yield _this5.getExecutablePath(fileDirectory)), flowOptions, {
            cwd: fileDirectory,
            stdin: fileContents,
            timeout: 60 * 1000,
            uniqueKey: 'flow-ide-autocomplete',
            ignoreExitCode: true
          });
          if (result === null) {
            return [];
          }
        } catch (error) {
          if (error.message.indexOf(_helpers.INIT_MESSAGE) !== -1 && configFile) {
            spawnedServers.add(_path2['default'].dirname(configFile));
          }
          if (error.message.indexOf(_helpers.INIT_MESSAGE) !== -1 || error.message.indexOf(_helpers.RECHECKING_MESSAGE) !== -1) {
            return provider.getSuggestions(params);
          }
          throw error;
        }

        return (0, _helpers.toAutocompleteSuggestions)(result, prefix);
      })
    };
    return provider;
  },

  provideHyperclick: function provideHyperclick() {
    var _this6 = this;

    var provider = {
      priority: this.hyperclickPriority,
      grammarScopes: grammarScopes,
      getSuggestionForWord: _asyncToGenerator(function* (textEditor, text, range) {
        var filePath = textEditor.getPath();
        if (!filePath) {
          return null;
        }

        var fileDirectory = _path2['default'].dirname(filePath);
        var configFile = yield (0, _atomLinter.findCachedAsync)(fileDirectory, '.flowconfig');
        if (!configFile) {
          return null;
        }

        var flowOptions = ['get-def', '--json', '--path=' + filePath, range.start.row + 1, range.start.column + 1];

        var result = undefined;
        try {
          result = yield (0, _atomLinter.exec)((yield _this6.getExecutablePath(fileDirectory)), flowOptions, {
            cwd: fileDirectory,
            stdin: textEditor.getText(),
            ignoreExitCode: true,
            timeout: 60 * 1000,
            uniqueKey: 'flow-ide-hyperclick'
          });
          if (result === null) {
            return null;
          }
        } catch (error) {
          if (error.message.indexOf(_helpers.INIT_MESSAGE) !== -1 && configFile) {
            spawnedServers.add(_path2['default'].dirname(configFile));
          }
          if (error.message.indexOf(_helpers.INIT_MESSAGE) !== -1 || error.message.indexOf(_helpers.RECHECKING_MESSAGE) !== -1) {
            return provider.getSuggestionForWord(textEditor, text, range);
          }
          throw error;
        }
        var jsonResult = JSON.parse(result);

        if (!jsonResult.path) {
          return null;
        }

        return {
          range: range,
          callback: function callback() {
            atom.workspace.open(jsonResult.path, { searchAllPanes: true }).then(function (editor) {
              editor.setCursorBufferPosition([jsonResult.line - 1, jsonResult.start - 1]);
            });
          }
        };
      })
    };
    return provider;
  },

  consumeDatatip: function consumeDatatip(datatipService) {
    var _this7 = this;

    var provider = {
      providerName: 'flow-ide',
      priority: 1,
      grammarScopes: grammarScopes,
      datatip: _asyncToGenerator(function* (editor, point) {
        var filePath = editor.getPath();
        if (!filePath) {
          return null;
        }

        var fileDirectory = _path2['default'].dirname(filePath);
        var configFile = yield (0, _atomLinter.findCachedAsync)(fileDirectory, '.flowconfig');
        if (!configFile) {
          return null;
        }

        var flowOptions = ['type-at-pos', '--json', '--path=' + filePath, point.row + 1, point.column + 1];

        var result = undefined;
        try {
          result = yield (0, _atomLinter.exec)((yield _this7.getExecutablePath(fileDirectory)), flowOptions, {
            cwd: fileDirectory,
            stdin: editor.getText(),
            timeout: 60 * 1000,
            uniqueKey: 'flow-ide-type-at-pos',
            ignoreExitCode: true
          });
          if (result === null) {
            return null;
          }
        } catch (error) {
          if (error.message.indexOf(_helpers.INIT_MESSAGE) !== -1 && configFile) {
            spawnedServers.add(_path2['default'].dirname(configFile));
          }
          if (error.message.indexOf(_helpers.INIT_MESSAGE) !== -1 || error.message.indexOf(_helpers.RECHECKING_MESSAGE) !== -1) {
            return provider.datatip(editor, point);
          }
          throw error;
        }

        return (0, _helpers.toDatatip)(editor, point, result);
      })
    };
    this.subscriptions.add(datatipService.addProvider(provider));
  },

  consumeStatusBar: function consumeStatusBar(statusBar) {
    this.coverageView = new _coverageView2['default']();
    this.coverageView.initialize();
    this.statusBar = statusBar.addLeftTile({ item: this.coverageView, priority: 10 });
  }
};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2Zsb3ctaWRlL2xpYi9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7OztvQkFFaUIsTUFBTTs7OztvQkFDYSxNQUFNOzswQkFFUSxhQUFhOztnQ0FDckIsbUJBQW1COzt1QkFTdEQsV0FBVzs7NEJBQ08saUJBQWlCOzs7O0FBRzFDLElBQU0sY0FBMkIsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFBO0FBQzdDLElBQU0sZUFBZSxHQUFHLGtCQUFLLE9BQU8sQ0FBQyxTQUFTLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxhQUFhLENBQUMsQ0FBQTtBQUM5RSxJQUFNLHNCQUFzQixHQUFHLHdCQUF3QixDQUFBO0FBQ3ZELElBQU0sYUFBYSxHQUFHLENBQUMsV0FBVyxFQUFFLGVBQWUsQ0FBQyxDQUFBOztxQkFFckM7QUFDYixVQUFRLEVBQUEsb0JBQUc7Ozs7QUFFVCxXQUFPLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxDQUFBOztBQUV0RCxRQUFJLENBQUMsYUFBYSxHQUFHLCtCQUF5QixDQUFBO0FBQzlDLFFBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLHlCQUF5QixFQUFFLFVBQUMsY0FBYyxFQUFLO0FBQ3hGLFlBQUssY0FBYyxHQUFHLGNBQWMsQ0FBQTtLQUNyQyxDQUFDLENBQUMsQ0FBQTtBQUNILFFBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLDRCQUE0QixFQUFFLFVBQUMsaUJBQWlCLEVBQUs7QUFDOUYsWUFBSyxpQkFBaUIsR0FBRyxpQkFBaUIsQ0FBQTtLQUMzQyxDQUFDLENBQUMsQ0FBQTs7QUFFSCxRQUFJLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxDQUFBO0FBQzlCLFFBQUksbUJBQW1C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cnMvdGxhbmRhdS9kb3RmaWxlcy8uYXRvbS9wYWNrYWdlcy9mbG93LWlkZS9saWIvaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBAZmxvdyAqL1xuXG5pbXBvcnQgUGF0aCBmcm9tICdwYXRoJ1xuaW1wb3J0IHsgQ29tcG9zaXRlRGlzcG9zYWJsZSB9IGZyb20gJ2F0b20nXG5pbXBvcnQgdHlwZSB7IFRleHRFZGl0b3IsIFBvaW50LCBSYW5nZSB9IGZyb20gJ2F0b20nXG5pbXBvcnQgeyBleGVjLCBmaW5kQ2FjaGVkLCBmaW5kQ2FjaGVkQXN5bmMgfSBmcm9tICdhdG9tLWxpbnRlcidcbmltcG9ydCB7IHNob3VsZFRyaWdnZXJBdXRvY29tcGxldGUgfSBmcm9tICdhdG9tLWF1dG9jb21wbGV0ZSdcbmltcG9ydCB7XG4gIElOSVRfTUVTU0FHRSxcbiAgUkVDSEVDS0lOR19NRVNTQUdFLFxuICBpbmplY3RQb3NpdGlvbixcbiAgdG9TdGF0dXNMaW50ZXJNZXNzYWdlcyxcbiAgdG9Db3ZlcmFnZUxpbnRlck1lc3NhZ2VzLFxuICB0b0F1dG9jb21wbGV0ZVN1Z2dlc3Rpb25zLFxuICB0b0RhdGF0aXAsXG59IGZyb20gJy4vaGVscGVycydcbmltcG9ydCBDb3ZlcmFnZVZpZXcgZnJvbSAnLi9jb3ZlcmFnZS12aWV3J1xuaW1wb3J0IHR5cGUgeyBDb3ZlcmFnZU9iamVjdCB9IGZyb20gJy4vdHlwZXMnXG5cbmNvbnN0IHNwYXduZWRTZXJ2ZXJzOiBTZXQ8c3RyaW5nPiA9IG5ldyBTZXQoKVxuY29uc3QgZGVmYXVsdEZsb3dGaWxlID0gUGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4uJywgJ3ZlbmRvcicsICcuZmxvd2NvbmZpZycpXG5jb25zdCBkZWZhdWx0Rmxvd0JpbkxvY2F0aW9uID0gJ25vZGVfbW9kdWxlcy8uYmluL2Zsb3cnXG5jb25zdCBncmFtbWFyU2NvcGVzID0gWydzb3VyY2UuanMnLCAnc291cmNlLmpzLmpzeCddXG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgYWN0aXZhdGUoKSB7XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGdsb2JhbC1yZXF1aXJlXG4gICAgcmVxdWlyZSgnYXRvbS1wYWNrYWdlLWRlcHMnKS5pbnN0YWxsKCdmbG93LWlkZScsIHRydWUpXG5cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbmZpZy5vYnNlcnZlKCdmbG93LWlkZS5leGVjdXRhYmxlUGF0aCcsIChleGVjdXRhYmxlUGF0aCkgPT4ge1xuICAgICAgdGhpcy5leGVjdXRhYmxlUGF0aCA9IGV4ZWN1dGFibGVQYXRoXG4gICAgfSkpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbmZpZy5vYnNlcnZlKCdmbG93LWlkZS5vbmx5SWZBcHByb3ByaWF0ZScsIChvbmx5SWZBcHByb3ByaWF0ZSkgPT4ge1xuICAgICAgdGhpcy5vbmx5SWZBcHByb3ByaWF0ZSA9IG9ubHlJZkFwcHJvcHJpYXRlXG4gICAgfSkpXG5cbiAgICB0aGlzLmh5cGVyY2xpY2tQcmlvcml0eSA9IG51bGxcbiAgICBsZXQgcmVzdGFydE5vdGlmaWNhdGlvblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb25maWcub2JzZXJ2ZSgnZmxvdy1pZGUuaHlwZXJjbGlja1ByaW9yaXR5JywgKGh5cGVyY2xpY2tQcmlvcml0eSkgPT4ge1xuICAgICAgaWYgKHRoaXMuaHlwZXJjbGlja1ByaW9yaXR5ICE9IG51bGwpIHtcbiAgICAgICAgaWYgKGh5cGVyY2xpY2tQcmlvcml0eSAhPT0gdGhpcy5oeXBlcmNsaWNrUHJpb3JpdHkgJiYgcmVzdGFydE5vdGlmaWNhdGlvbiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgcmVzdGFydE5vdGlmaWNhdGlvbiA9IGF0b20ubm90aWZpY2F0aW9ucy5hZGRTdWNjZXNzKCdSZXN0YXJ0IGF0b20gdG8gdXBkYXRlIGZsb3ctaWRlIHByaW9yaXR5PycsIHtcbiAgICAgICAgICAgIGRpc21pc3NhYmxlOiB0cnVlLFxuICAgICAgICAgICAgYnV0dG9uczogW3tcbiAgICAgICAgICAgICAgdGV4dDogJ1Jlc3RhcnQnLFxuICAgICAgICAgICAgICBvbkRpZENsaWNrOiAoKSA9PiBhdG9tLnJlc3RhcnRBcHBsaWNhdGlvbigpLFxuICAgICAgICAgICAgfV0sXG4gICAgICAgICAgfSlcbiAgICAgICAgICByZXN0YXJ0Tm90aWZpY2F0aW9uLm9uRGlkRGlzbWlzcygoKSA9PiB7IHJlc3RhcnROb3RpZmljYXRpb24gPSB1bmRlZmluZWQgfSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdGhpcy5oeXBlcmNsaWNrUHJpb3JpdHkgPSBoeXBlcmNsaWNrUHJpb3JpdHlcbiAgICB9KSlcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29uZmlnLm9ic2VydmUoJ2Zsb3ctaWRlLnNob3dVbmNvdmVyZWQnLCAoc2hvd1VuY292ZXJlZCkgPT4ge1xuICAgICAgdGhpcy5zaG93VW5jb3ZlcmVkID0gc2hvd1VuY292ZXJlZFxuICAgICAgLy8gbGludCBhZ2FpbiBzbyB0aGF0IHRoZSBjb3ZlcmFnZSBhY3R1YWxseSB1cGRhdGVzXG4gICAgICBjb25zdCB2aWV3ID0gYXRvbS52aWV3cy5nZXRWaWV3KGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKSlcbiAgICAgIGlmICh2aWV3KSB7XG4gICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2godmlldywgJ2xpbnRlcjpsaW50JylcbiAgICAgIH1cbiAgICB9KSlcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20ud29ya3NwYWNlLm9uRGlkQ2hhbmdlQWN0aXZlUGFuZUl0ZW0oKGl0ZW06ID9UZXh0RWRpdG9yKTogdm9pZCA9PiB7XG4gICAgICBpZiAodGhpcy5jb3ZlcmFnZVZpZXcpIHtcbiAgICAgICAgY29uc3QgY292ZXJhZ2UgPSB0aGlzLmNvdmVyYWdlcy5nZXQoaXRlbSlcbiAgICAgICAgaWYgKGNvdmVyYWdlKSB7XG4gICAgICAgICAgdGhpcy5jb3ZlcmFnZVZpZXcudXBkYXRlKGNvdmVyYWdlKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuY292ZXJhZ2VWaWV3LnJlc2V0KClcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pKVxuXG4gICAgdGhpcy5jb3ZlcmFnZXMgPSBuZXcgV2Vha01hcCgpXG4gIH0sXG5cbiAgYXN5bmMgZ2V0RXhlY3V0YWJsZVBhdGgoZmlsZURpcmVjdG9yeTogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICByZXR1cm4gKFxuICAgICAgdGhpcy5leGVjdXRhYmxlUGF0aCB8fFxuICAgICAgYXdhaXQgZmluZENhY2hlZEFzeW5jKGZpbGVEaXJlY3RvcnksIGRlZmF1bHRGbG93QmluTG9jYXRpb24pIHx8XG4gICAgICAnZmxvdydcbiAgICApXG4gIH0sXG5cbiAgZGVhY3RpdmF0ZSgpIHtcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG4gICAgc3Bhd25lZFNlcnZlcnMuZm9yRWFjaCgocm9vdERpcmVjdG9yeSkgPT4ge1xuICAgICAgY29uc3QgZXhlY3V0YWJsZSA9IHRoaXMuZXhlY3V0YWJsZVBhdGggfHwgZmluZENhY2hlZChyb290RGlyZWN0b3J5LCBkZWZhdWx0Rmxvd0JpbkxvY2F0aW9uKSB8fCAnZmxvdydcbiAgICAgIGV4ZWMoZXhlY3V0YWJsZSwgWydzdG9wJ10sIHtcbiAgICAgICAgY3dkOiByb290RGlyZWN0b3J5LFxuICAgICAgICB0aW1lb3V0OiA2MCAqIDEwMDAsXG4gICAgICAgIGRldGFjaGVkOiB0cnVlLFxuICAgICAgICBpZ25vcmVFeGl0Q29kZTogdHJ1ZSxcbiAgICAgIH0pLmNhdGNoKCgpID0+IG51bGwpIC8vIDwtLSBpZ25vcmUgYWxsIGVycm9yc1xuICAgIH0pXG4gIH0sXG5cbiAgcHJvdmlkZUxpbnRlcigpOiBPYmplY3RbXSB7XG4gICAgcmV0dXJuIFt0aGlzLnByb3ZpZGVTdGF0dXNMaW50ZXIoKSwgdGhpcy5wcm92aWRlQ292ZXJhZ2VMaW50ZXIoKV1cbiAgfSxcblxuICBwcm92aWRlU3RhdHVzTGludGVyKCk6IE9iamVjdCB7XG4gICAgY29uc3QgbGludGVyID0ge1xuICAgICAgbmFtZTogJ0Zsb3cgSURFJyxcbiAgICAgIHNjb3BlOiAncHJvamVjdCcsXG4gICAgICBncmFtbWFyU2NvcGVzLFxuICAgICAgbGludHNPbkNoYW5nZTogZmFsc2UsXG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgYXJyb3ctcGFyZW5zXG4gICAgICBsaW50OiBhc3luYyAodGV4dEVkaXRvcikgPT4ge1xuICAgICAgICBsZXQgY29uZmlnRmlsZVxuICAgICAgICBjb25zdCBmaWxlUGF0aCA9IHRleHRFZGl0b3IuZ2V0UGF0aCgpXG4gICAgICAgIGNvbnN0IGZpbGVEaXJlY3RvcnkgPSBQYXRoLmRpcm5hbWUoZmlsZVBhdGgpXG5cbiAgICAgICAgaWYgKHRoaXMub25seUlmQXBwcm9wcmlhdGUpIHtcbiAgICAgICAgICBjb25maWdGaWxlID0gYXdhaXQgZmluZENhY2hlZEFzeW5jKGZpbGVEaXJlY3RvcnksICcuZmxvd2NvbmZpZycpXG4gICAgICAgICAgaWYgKCFjb25maWdGaWxlKSB7XG4gICAgICAgICAgICByZXR1cm4gW11cbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBleGVjdXRhYmxlID0gYXdhaXQgdGhpcy5nZXRFeGVjdXRhYmxlUGF0aChmaWxlRGlyZWN0b3J5KVxuXG4gICAgICAgIGxldCByZXN1bHRcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICByZXN1bHQgPSBhd2FpdCBleGVjKGV4ZWN1dGFibGUsIFsnc3RhdHVzJywgJy0tanNvbiddLCB7XG4gICAgICAgICAgICBjd2Q6IGZpbGVEaXJlY3RvcnksXG4gICAgICAgICAgICB0aW1lb3V0OiA2MCAqIDEwMDAsXG4gICAgICAgICAgICB1bmlxdWVLZXk6ICdmbG93LWlkZS1saW50ZXInLFxuICAgICAgICAgICAgaWdub3JlRXhpdENvZGU6IHRydWUsXG4gICAgICAgICAgfSlcbiAgICAgICAgICBpZiAocmVzdWx0ID09PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbFxuICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICBpZiAoZXJyb3IubWVzc2FnZS5pbmRleE9mKElOSVRfTUVTU0FHRSkgIT09IC0xICYmIGNvbmZpZ0ZpbGUpIHtcbiAgICAgICAgICAgIHNwYXduZWRTZXJ2ZXJzLmFkZChQYXRoLmRpcm5hbWUoY29uZmlnRmlsZSkpXG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChlcnJvci5tZXNzYWdlLmluZGV4T2YoSU5JVF9NRVNTQUdFKSAhPT0gLTEgfHwgZXJyb3IubWVzc2FnZS5pbmRleE9mKFJFQ0hFQ0tJTkdfTUVTU0FHRSkgIT09IC0xKSB7XG4gICAgICAgICAgICByZXR1cm4gbGludGVyLmxpbnQodGV4dEVkaXRvcilcbiAgICAgICAgICB9IGVsc2UgaWYgKGVycm9yLmNvZGUgPT09ICdFTk9FTlQnKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VuYWJsZSB0byBmaW5kIGBmbG93YCBleGVjdXRhYmxlLicpXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IGVycm9yXG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRvU3RhdHVzTGludGVyTWVzc2FnZXMocmVzdWx0KVxuICAgICAgfSxcbiAgICB9XG4gICAgcmV0dXJuIGxpbnRlclxuICB9LFxuICBwcm92aWRlQ292ZXJhZ2VMaW50ZXIoKTogT2JqZWN0IHtcbiAgICBjb25zdCBsaW50ZXIgPSB7XG4gICAgICBuYW1lOiAnRmxvdyBJREUgQ292ZXJhZ2UnLFxuICAgICAgc2NvcGU6ICdmaWxlJyxcbiAgICAgIGdyYW1tYXJTY29wZXMsXG4gICAgICBsaW50c09uQ2hhbmdlOiBmYWxzZSxcbiAgICAgIGxpbnQ6IGFzeW5jICh0ZXh0RWRpdG9yOiBUZXh0RWRpdG9yKSA9PiB7XG4gICAgICAgIGxldCBjb25maWdGaWxlXG4gICAgICAgIGNvbnN0IGZpbGVQYXRoID0gdGV4dEVkaXRvci5nZXRQYXRoKClcbiAgICAgICAgY29uc3QgZmlsZURpcmVjdG9yeSA9IFBhdGguZGlybmFtZShmaWxlUGF0aClcblxuICAgICAgICBpZiAodGhpcy5vbmx5SWZBcHByb3ByaWF0ZSkge1xuICAgICAgICAgIGNvbmZpZ0ZpbGUgPSBhd2FpdCBmaW5kQ2FjaGVkQXN5bmMoZmlsZURpcmVjdG9yeSwgJy5mbG93Y29uZmlnJylcbiAgICAgICAgICBpZiAoIWNvbmZpZ0ZpbGUpIHtcbiAgICAgICAgICAgIHJldHVybiBbXVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGV4ZWN1dGFibGUgPSBhd2FpdCB0aGlzLmdldEV4ZWN1dGFibGVQYXRoKGZpbGVEaXJlY3RvcnkpXG5cbiAgICAgICAgbGV0IHJlc3VsdDogc3RyaW5nXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgcmVzdWx0ID0gYXdhaXQgZXhlYyhleGVjdXRhYmxlLCBbJ2NvdmVyYWdlJywgZmlsZVBhdGgsICctLWpzb24nXSwge1xuICAgICAgICAgICAgY3dkOiBmaWxlRGlyZWN0b3J5LFxuICAgICAgICAgICAgdGltZW91dDogNjAgKiAxMDAwLFxuICAgICAgICAgICAgdW5pcXVlS2V5OiAnZmxvdy1pZGUtY292ZXJhZ2UnLFxuICAgICAgICAgICAgaWdub3JlRXhpdENvZGU6IHRydWUsXG4gICAgICAgICAgfSlcbiAgICAgICAgICBpZiAocmVzdWx0ID09PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbFxuICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICBpZiAoZXJyb3IubWVzc2FnZS5pbmRleE9mKElOSVRfTUVTU0FHRSkgIT09IC0xICYmIGNvbmZpZ0ZpbGUpIHtcbiAgICAgICAgICAgIHNwYXduZWRTZXJ2ZXJzLmFkZChQYXRoLmRpcm5hbWUoY29uZmlnRmlsZSkpXG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChlcnJvci5tZXNzYWdlLmluZGV4T2YoSU5JVF9NRVNTQUdFKSAhPT0gLTEgfHwgZXJyb3IubWVzc2FnZS5pbmRleE9mKFJFQ0hFQ0tJTkdfTUVTU0FHRSkgIT09IC0xKSB7XG4gICAgICAgICAgICByZXR1cm4gbGludGVyLmxpbnQodGV4dEVkaXRvcilcbiAgICAgICAgICB9IGVsc2UgaWYgKGVycm9yLmNvZGUgPT09ICdFTk9FTlQnKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VuYWJsZSB0byBmaW5kIGBmbG93YCBleGVjdXRhYmxlLicpXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IGVycm9yXG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgY292ZXJhZ2U6IENvdmVyYWdlT2JqZWN0ID0gSlNPTi5wYXJzZShyZXN1bHQpXG4gICAgICAgIHRoaXMuY292ZXJhZ2VzLnNldCh0ZXh0RWRpdG9yLCBjb3ZlcmFnZSlcbiAgICAgICAgaWYgKHRoaXMuY292ZXJhZ2VWaWV3KSB7XG4gICAgICAgICAgdGhpcy5jb3ZlcmFnZVZpZXcudXBkYXRlKGNvdmVyYWdlKVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLnNob3dVbmNvdmVyZWQgPyB0b0NvdmVyYWdlTGludGVyTWVzc2FnZXMoY292ZXJhZ2UpIDogW11cbiAgICAgIH0sXG4gICAgfVxuICAgIHJldHVybiBsaW50ZXJcbiAgfSxcblxuICBwcm92aWRlQXV0b2NvbXBsZXRlKCk6IE9iamVjdCB7XG4gICAgY29uc3QgcHJvdmlkZXIgPSB7XG4gICAgICBzZWxlY3RvcjogZ3JhbW1hclNjb3Blcy5tYXAoaXRlbSA9PiBgLiR7aXRlbX1gKS5qb2luKCcsICcpLFxuICAgICAgZGlzYWJsZUZvclNlbGVjdG9yOiAnLmNvbW1lbnQnLFxuICAgICAgaW5jbHVzaW9uUHJpb3JpdHk6IDEwMCxcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBhcnJvdy1wYXJlbnNcbiAgICAgIGdldFN1Z2dlc3Rpb25zOiBhc3luYyAocGFyYW1zKSA9PiB7XG4gICAgICAgIGNvbnN0IHsgZWRpdG9yLCBidWZmZXJQb3NpdGlvbiwgYWN0aXZhdGVkTWFudWFsbHkgfSA9IHBhcmFtc1xuICAgICAgICBsZXQgcHJlZml4ID0gcGFyYW1zLnByZWZpeFxuICAgICAgICBjb25zdCBmaWxlUGF0aCA9IGVkaXRvci5nZXRQYXRoKClcbiAgICAgICAgaWYgKCFmaWxlUGF0aCkge1xuICAgICAgICAgIC8vIFdlIG5vdCBwcm9jZXNzIGZpbGVzIHdpdGhvdXQgZmlsZXBhdGhcbiAgICAgICAgICByZXR1cm4gW11cbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGZpbGVEaXJlY3RvcnkgPSBQYXRoLmRpcm5hbWUoZmlsZVBhdGgpXG4gICAgICAgIGNvbnN0IGZpbGVDb250ZW50cyA9IGluamVjdFBvc2l0aW9uKGVkaXRvci5nZXRUZXh0KCksIGVkaXRvciwgYnVmZmVyUG9zaXRpb24pXG4gICAgICAgIGxldCBmbG93T3B0aW9ucyA9IFsnYXV0b2NvbXBsZXRlJywgJy0tanNvbicsIGZpbGVQYXRoXVxuXG4gICAgICAgIGNvbnN0IGNvbmZpZ0ZpbGUgPSBhd2FpdCBmaW5kQ2FjaGVkQXN5bmMoZmlsZURpcmVjdG9yeSwgJy5mbG93Y29uZmlnJylcbiAgICAgICAgaWYgKCFjb25maWdGaWxlKSB7XG4gICAgICAgICAgaWYgKHRoaXMub25seUlmQXBwcm9wcmlhdGUpIHtcbiAgICAgICAgICAgIHJldHVybiBbXVxuICAgICAgICAgIH1cbiAgICAgICAgICBmbG93T3B0aW9ucyA9IFsnYXV0b2NvbXBsZXRlJywgJy0tcm9vdCcsIGRlZmF1bHRGbG93RmlsZSwgJy0tanNvbicsIGZpbGVQYXRoXVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gTk9URTogRml4IGZvciBjbGFzcyBwcm9wZXJ0aWVzIGF1dG9jb21wbGV0aW9uXG4gICAgICAgIGlmIChwcmVmaXggPT09ICcuJykge1xuICAgICAgICAgIHByZWZpeCA9ICcnXG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXNob3VsZFRyaWdnZXJBdXRvY29tcGxldGUoeyBhY3RpdmF0ZWRNYW51YWxseSwgYnVmZmVyUG9zaXRpb24sIGVkaXRvciB9KSkge1xuICAgICAgICAgIHJldHVybiBbXVxuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHJlc3VsdFxuICAgICAgICB0cnkge1xuICAgICAgICAgIHJlc3VsdCA9IGF3YWl0IGV4ZWMoYXdhaXQgdGhpcy5nZXRFeGVjdXRhYmxlUGF0aChmaWxlRGlyZWN0b3J5KSwgZmxvd09wdGlvbnMsIHtcbiAgICAgICAgICAgIGN3ZDogZmlsZURpcmVjdG9yeSxcbiAgICAgICAgICAgIHN0ZGluOiBmaWxlQ29udGVudHMsXG4gICAgICAgICAgICB0aW1lb3V0OiA2MCAqIDEwMDAsXG4gICAgICAgICAgICB1bmlxdWVLZXk6ICdmbG93LWlkZS1hdXRvY29tcGxldGUnLFxuICAgICAgICAgICAgaWdub3JlRXhpdENvZGU6IHRydWUsXG4gICAgICAgICAgfSlcbiAgICAgICAgICBpZiAocmVzdWx0ID09PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm4gW11cbiAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgaWYgKGVycm9yLm1lc3NhZ2UuaW5kZXhPZihJTklUX01FU1NBR0UpICE9PSAtMSAmJiBjb25maWdGaWxlKSB7XG4gICAgICAgICAgICBzcGF3bmVkU2VydmVycy5hZGQoUGF0aC5kaXJuYW1lKGNvbmZpZ0ZpbGUpKVxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoZXJyb3IubWVzc2FnZS5pbmRleE9mKElOSVRfTUVTU0FHRSkgIT09IC0xIHx8IGVycm9yLm1lc3NhZ2UuaW5kZXhPZihSRUNIRUNLSU5HX01FU1NBR0UpICE9PSAtMSkge1xuICAgICAgICAgICAgcmV0dXJuIHByb3ZpZGVyLmdldFN1Z2dlc3Rpb25zKHBhcmFtcylcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhyb3cgZXJyb3JcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0b0F1dG9jb21wbGV0ZVN1Z2dlc3Rpb25zKHJlc3VsdCwgcHJlZml4KVxuICAgICAgfSxcbiAgICB9XG4gICAgcmV0dXJuIHByb3ZpZGVyXG4gIH0sXG5cbiAgcHJvdmlkZUh5cGVyY2xpY2soKTogSHlwZXJjbGlja1Byb3ZpZGVyIHtcbiAgICBjb25zdCBwcm92aWRlciA9IHtcbiAgICAgIHByaW9yaXR5OiB0aGlzLmh5cGVyY2xpY2tQcmlvcml0eSxcbiAgICAgIGdyYW1tYXJTY29wZXMsXG4gICAgICBnZXRTdWdnZXN0aW9uRm9yV29yZDogYXN5bmMgKHRleHRFZGl0b3I6IFRleHRFZGl0b3IsIHRleHQ6IHN0cmluZywgcmFuZ2U6IFJhbmdlKTogUHJvbWlzZTw/SHlwZXJjbGlja1N1Z2dlc3Rpb24+ID0+IHtcbiAgICAgICAgY29uc3QgZmlsZVBhdGggPSB0ZXh0RWRpdG9yLmdldFBhdGgoKVxuICAgICAgICBpZiAoIWZpbGVQYXRoKSB7XG4gICAgICAgICAgcmV0dXJuIG51bGxcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGZpbGVEaXJlY3RvcnkgPSBQYXRoLmRpcm5hbWUoZmlsZVBhdGgpXG4gICAgICAgIGNvbnN0IGNvbmZpZ0ZpbGUgPSBhd2FpdCBmaW5kQ2FjaGVkQXN5bmMoZmlsZURpcmVjdG9yeSwgJy5mbG93Y29uZmlnJylcbiAgICAgICAgaWYgKCFjb25maWdGaWxlKSB7XG4gICAgICAgICAgcmV0dXJuIG51bGxcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGZsb3dPcHRpb25zID0gW1xuICAgICAgICAgICdnZXQtZGVmJyxcbiAgICAgICAgICAnLS1qc29uJyxcbiAgICAgICAgICAnLS1wYXRoPScgKyBmaWxlUGF0aCxcbiAgICAgICAgICByYW5nZS5zdGFydC5yb3cgKyAxLFxuICAgICAgICAgIHJhbmdlLnN0YXJ0LmNvbHVtbiArIDEsXG4gICAgICAgIF1cblxuICAgICAgICBsZXQgcmVzdWx0XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgcmVzdWx0ID0gYXdhaXQgZXhlYyhhd2FpdCB0aGlzLmdldEV4ZWN1dGFibGVQYXRoKGZpbGVEaXJlY3RvcnkpLCBmbG93T3B0aW9ucywge1xuICAgICAgICAgICAgY3dkOiBmaWxlRGlyZWN0b3J5LFxuICAgICAgICAgICAgc3RkaW46IHRleHRFZGl0b3IuZ2V0VGV4dCgpLFxuICAgICAgICAgICAgaWdub3JlRXhpdENvZGU6IHRydWUsXG4gICAgICAgICAgICB0aW1lb3V0OiA2MCAqIDEwMDAsXG4gICAgICAgICAgICB1bmlxdWVLZXk6ICdmbG93LWlkZS1oeXBlcmNsaWNrJyxcbiAgICAgICAgICB9KVxuICAgICAgICAgIGlmIChyZXN1bHQgPT09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsXG4gICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgIGlmIChlcnJvci5tZXNzYWdlLmluZGV4T2YoSU5JVF9NRVNTQUdFKSAhPT0gLTEgJiYgY29uZmlnRmlsZSkge1xuICAgICAgICAgICAgc3Bhd25lZFNlcnZlcnMuYWRkKFBhdGguZGlybmFtZShjb25maWdGaWxlKSlcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGVycm9yLm1lc3NhZ2UuaW5kZXhPZihJTklUX01FU1NBR0UpICE9PSAtMSB8fCBlcnJvci5tZXNzYWdlLmluZGV4T2YoUkVDSEVDS0lOR19NRVNTQUdFKSAhPT0gLTEpIHtcbiAgICAgICAgICAgIHJldHVybiBwcm92aWRlci5nZXRTdWdnZXN0aW9uRm9yV29yZCh0ZXh0RWRpdG9yLCB0ZXh0LCByYW5nZSlcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhyb3cgZXJyb3JcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBqc29uUmVzdWx0ID0gSlNPTi5wYXJzZShyZXN1bHQpXG5cbiAgICAgICAgaWYgKCFqc29uUmVzdWx0LnBhdGgpIHtcbiAgICAgICAgICByZXR1cm4gbnVsbFxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICByYW5nZSxcbiAgICAgICAgICBjYWxsYmFjaygpIHtcbiAgICAgICAgICAgIGF0b20ud29ya3NwYWNlLm9wZW4oanNvblJlc3VsdC5wYXRoLCB7IHNlYXJjaEFsbFBhbmVzOiB0cnVlIH0pLnRoZW4oKGVkaXRvcikgPT4ge1xuICAgICAgICAgICAgICBlZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oW2pzb25SZXN1bHQubGluZSAtIDEsIGpzb25SZXN1bHQuc3RhcnQgLSAxXSlcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgfSxcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICB9XG4gICAgcmV0dXJuIHByb3ZpZGVyXG4gIH0sXG5cbiAgY29uc3VtZURhdGF0aXAoZGF0YXRpcFNlcnZpY2U6IGFueSkge1xuICAgIGNvbnN0IHByb3ZpZGVyID0ge1xuICAgICAgcHJvdmlkZXJOYW1lOiAnZmxvdy1pZGUnLFxuICAgICAgcHJpb3JpdHk6IDEsXG4gICAgICBncmFtbWFyU2NvcGVzLFxuICAgICAgZGF0YXRpcDogYXN5bmMgKGVkaXRvcjogVGV4dEVkaXRvciwgcG9pbnQ6IFBvaW50KTogUHJvbWlzZTxhbnk+ID0+IHtcbiAgICAgICAgY29uc3QgZmlsZVBhdGggPSBlZGl0b3IuZ2V0UGF0aCgpXG4gICAgICAgIGlmICghZmlsZVBhdGgpIHtcbiAgICAgICAgICByZXR1cm4gbnVsbFxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZmlsZURpcmVjdG9yeSA9IFBhdGguZGlybmFtZShmaWxlUGF0aClcbiAgICAgICAgY29uc3QgY29uZmlnRmlsZSA9IGF3YWl0IGZpbmRDYWNoZWRBc3luYyhmaWxlRGlyZWN0b3J5LCAnLmZsb3djb25maWcnKVxuICAgICAgICBpZiAoIWNvbmZpZ0ZpbGUpIHtcbiAgICAgICAgICByZXR1cm4gbnVsbFxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZmxvd09wdGlvbnMgPSBbXG4gICAgICAgICAgJ3R5cGUtYXQtcG9zJyxcbiAgICAgICAgICAnLS1qc29uJyxcbiAgICAgICAgICAnLS1wYXRoPScgKyBmaWxlUGF0aCxcbiAgICAgICAgICBwb2ludC5yb3cgKyAxLFxuICAgICAgICAgIHBvaW50LmNvbHVtbiArIDEsXG4gICAgICAgIF1cblxuICAgICAgICBsZXQgcmVzdWx0XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgcmVzdWx0ID0gYXdhaXQgZXhlYyhhd2FpdCB0aGlzLmdldEV4ZWN1dGFibGVQYXRoKGZpbGVEaXJlY3RvcnkpLCBmbG93T3B0aW9ucywge1xuICAgICAgICAgICAgY3dkOiBmaWxlRGlyZWN0b3J5LFxuICAgICAgICAgICAgc3RkaW46IGVkaXRvci5nZXRUZXh0KCksXG4gICAgICAgICAgICB0aW1lb3V0OiA2MCAqIDEwMDAsXG4gICAgICAgICAgICB1bmlxdWVLZXk6ICdmbG93LWlkZS10eXBlLWF0LXBvcycsXG4gICAgICAgICAgICBpZ25vcmVFeGl0Q29kZTogdHJ1ZSxcbiAgICAgICAgICB9KVxuICAgICAgICAgIGlmIChyZXN1bHQgPT09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsXG4gICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgIGlmIChlcnJvci5tZXNzYWdlLmluZGV4T2YoSU5JVF9NRVNTQUdFKSAhPT0gLTEgJiYgY29uZmlnRmlsZSkge1xuICAgICAgICAgICAgc3Bhd25lZFNlcnZlcnMuYWRkKFBhdGguZGlybmFtZShjb25maWdGaWxlKSlcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGVycm9yLm1lc3NhZ2UuaW5kZXhPZihJTklUX01FU1NBR0UpICE9PSAtMSB8fCBlcnJvci5tZXNzYWdlLmluZGV4T2YoUkVDSEVDS0lOR19NRVNTQUdFKSAhPT0gLTEpIHtcbiAgICAgICAgICAgIHJldHVybiBwcm92aWRlci5kYXRhdGlwKGVkaXRvciwgcG9pbnQpXG4gICAgICAgICAgfVxuICAgICAgICAgIHRocm93IGVycm9yXG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdG9EYXRhdGlwKGVkaXRvciwgcG9pbnQsIHJlc3VsdClcbiAgICAgIH0sXG4gICAgfVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoZGF0YXRpcFNlcnZpY2UuYWRkUHJvdmlkZXIocHJvdmlkZXIpKVxuICB9LFxuXG4gIGNvbnN1bWVTdGF0dXNCYXIoc3RhdHVzQmFyOiBhbnkpOiB2b2lkIHtcbiAgICB0aGlzLmNvdmVyYWdlVmlldyA9IG5ldyBDb3ZlcmFnZVZpZXcoKVxuICAgIHRoaXMuY292ZXJhZ2VWaWV3LmluaXRpYWxpemUoKVxuICAgIHRoaXMuc3RhdHVzQmFyID0gc3RhdHVzQmFyLmFkZExlZnRUaWxlKHsgaXRlbTogdGhpcy5jb3ZlcmFnZVZpZXcsIHByaW9yaXR5OiAxMCB9KVxuICB9LFxufVxuIl19