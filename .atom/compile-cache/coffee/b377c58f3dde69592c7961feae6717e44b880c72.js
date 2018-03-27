(function() {
  var BufferedProcess, CompositeDisposable, DefinitionsView, Disposable, InterpreterLookup, OverrideView, RenameView, Selector, UsagesView, _, filter, log, ref, selectorsMatchScopeChain;

  ref = require('atom'), Disposable = ref.Disposable, CompositeDisposable = ref.CompositeDisposable, BufferedProcess = ref.BufferedProcess;

  selectorsMatchScopeChain = require('./scope-helpers').selectorsMatchScopeChain;

  Selector = require('selector-kit').Selector;

  DefinitionsView = require('./definitions-view');

  UsagesView = require('./usages-view');

  OverrideView = require('./override-view');

  RenameView = require('./rename-view');

  InterpreterLookup = require('./interpreters-lookup');

  log = require('./log');

  _ = require('underscore');

  filter = void 0;

  module.exports = {
    selector: '.source.python',
    disableForSelector: '.source.python .comment, .source.python .string',
    inclusionPriority: 2,
    suggestionPriority: atom.config.get('autocomplete-python.suggestionPriority'),
    excludeLowerPriority: false,
    cacheSize: 10,
    _addEventListener: function(editor, eventName, handler) {
      var disposable, editorView;
      editorView = atom.views.getView(editor);
      editorView.addEventListener(eventName, handler);
      disposable = new Disposable(function() {
        log.debug('Unsubscribing from event listener ', eventName, handler);
        return editorView.removeEventListener(eventName, handler);
      });
      return disposable;
    },
    _noExecutableError: function(error) {
      if (this.providerNoExecutable) {
        return;
      }
      log.warning('No python executable found', error);
      atom.notifications.addWarning('autocomplete-python unable to find python binary.', {
        detail: "Please set path to python executable manually in package\nsettings and restart your editor. Be sure to migrate on new settings\nif everything worked on previous version.\nDetailed error message: " + error + "\n\nCurrent config: " + (atom.config.get('autocomplete-python.pythonPaths')),
        dismissable: true
      });
      return this.providerNoExecutable = true;
    },
    _spawnDaemon: function() {
      var interpreter, ref1;
      interpreter = InterpreterLookup.getInterpreter();
      log.debug('Using interpreter', interpreter);
      this.provider = new BufferedProcess({
        command: interpreter || 'python',
        args: [__dirname + '/completion.py'],
        stdout: (function(_this) {
          return function(data) {
            return _this._deserialize(data);
          };
        })(this),
        stderr: (function(_this) {
          return function(data) {
            var ref1, requestId, resolve, results1;
            if (data.indexOf('is not recognized as an internal or external') > -1) {
              return _this._noExecutableError(data);
            }
            log.debug("autocomplete-python traceback output: " + data);
            if (data.indexOf('jedi') > -1) {
              if (atom.config.get('autocomplete-python.outputProviderErrors')) {
                atom.notifications.addWarning('Looks like this error originated from Jedi. Please do not\nreport such issues in autocomplete-python issue tracker. Report\nthem directly to Jedi. Turn off `outputProviderErrors` setting\nto hide such errors in future. Traceback output:', {
                  detail: "" + data,
                  dismissable: true
                });
              }
            } else {
              atom.notifications.addError('autocomplete-python traceback output:', {
                detail: "" + data,
                dismissable: true
              });
            }
            log.debug("Forcing to resolve " + (Object.keys(_this.requests).length) + " promises");
            ref1 = _this.requests;
            results1 = [];
            for (requestId in ref1) {
              resolve = ref1[requestId];
              if (typeof resolve === 'function') {
                resolve([]);
              }
              results1.push(delete _this.requests[requestId]);
            }
            return results1;
          };
        })(this),
        exit: (function(_this) {
          return function(code) {
            return log.warning('Process exit with', code, _this.provider);
          };
        })(this)
      });
      this.provider.onWillThrowError((function(_this) {
        return function(arg) {
          var error, handle;
          error = arg.error, handle = arg.handle;
          if (error.code === 'ENOENT' && error.syscall.indexOf('spawn') === 0) {
            _this._noExecutableError(error);
            _this.dispose();
            return handle();
          } else {
            throw error;
          }
        };
      })(this));
      if ((ref1 = this.provider.process) != null) {
        ref1.stdin.on('error', function(err) {
          return log.debug('stdin', err);
        });
      }
      return setTimeout((function(_this) {
        return function() {
          log.debug('Killing python process after timeout...');
          if (_this.provider && _this.provider.process) {
            return _this.provider.kill();
          }
        };
      })(this), 60 * 10 * 1000);
    },
    constructor: function() {
      var err, selector;
      this.requests = {};
      this.responses = {};
      this.provider = null;
      this.disposables = new CompositeDisposable;
      this.subscriptions = {};
      this.definitionsView = null;
      this.usagesView = null;
      this.renameView = null;
      this.snippetsManager = null;
      log.debug("Init autocomplete-python with priority " + this.suggestionPriority);
      try {
        this.triggerCompletionRegex = RegExp(atom.config.get('autocomplete-python.triggerCompletionRegex'));
      } catch (error1) {
        err = error1;
        atom.notifications.addWarning('autocomplete-python invalid regexp to trigger autocompletions.\nFalling back to default value.', {
          detail: "Original exception: " + err,
          dismissable: true
        });
        atom.config.set('autocomplete-python.triggerCompletionRegex', '([\.\ ]|[a-zA-Z_][a-zA-Z0-9_]*)');
        this.triggerCompletionRegex = /([\.\ ]|[a-zA-Z_][a-zA-Z0-9_]*)/;
      }
      selector = 'atom-text-editor[data-grammar~=python]';
      atom.commands.add(selector, 'autocomplete-python:go-to-definition', (function(_this) {
        return function() {
          return _this.goToDefinition();
        };
      })(this));
      atom.commands.add(selector, 'autocomplete-python:complete-arguments', (function(_this) {
        return function() {
          var editor;
          editor = atom.workspace.getActiveTextEditor();
          return _this._completeArguments(editor, editor.getCursorBufferPosition(), true);
        };
      })(this));
      atom.commands.add(selector, 'autocomplete-python:show-usages', (function(_this) {
        return function() {
          var bufferPosition, editor;
          editor = atom.workspace.getActiveTextEditor();
          bufferPosition = editor.getCursorBufferPosition();
          if (_this.usagesView) {
            _this.usagesView.destroy();
          }
          _this.usagesView = new UsagesView();
          return _this.getUsages(editor, bufferPosition).then(function(usages) {
            return _this.usagesView.setItems(usages);
          });
        };
      })(this));
      atom.commands.add(selector, 'autocomplete-python:override-method', (function(_this) {
        return function() {
          var bufferPosition, editor;
          editor = atom.workspace.getActiveTextEditor();
          bufferPosition = editor.getCursorBufferPosition();
          if (_this.overrideView) {
            _this.overrideView.destroy();
          }
          _this.overrideView = new OverrideView();
          return _this.getMethods(editor, bufferPosition).then(function(arg) {
            var bufferPosition, indent, methods;
            methods = arg.methods, indent = arg.indent, bufferPosition = arg.bufferPosition;
            _this.overrideView.indent = indent;
            _this.overrideView.bufferPosition = bufferPosition;
            return _this.overrideView.setItems(methods);
          });
        };
      })(this));
      atom.commands.add(selector, 'autocomplete-python:rename', (function(_this) {
        return function() {
          var bufferPosition, editor;
          editor = atom.workspace.getActiveTextEditor();
          bufferPosition = editor.getCursorBufferPosition();
          return _this.getUsages(editor, bufferPosition).then(function(usages) {
            if (_this.renameView) {
              _this.renameView.destroy();
            }
            if (usages.length > 0) {
              _this.renameView = new RenameView(usages);
              return _this.renameView.onInput(function(newName) {
                var _relative, fileName, project, ref1, ref2, results1;
                ref1 = _.groupBy(usages, 'fileName');
                results1 = [];
                for (fileName in ref1) {
                  usages = ref1[fileName];
                  ref2 = atom.project.relativizePath(fileName), project = ref2[0], _relative = ref2[1];
                  if (project) {
                    results1.push(_this._updateUsagesInFile(fileName, usages, newName));
                  } else {
                    results1.push(log.debug('Ignoring file outside of project', fileName));
                  }
                }
                return results1;
              });
            } else {
              if (_this.usagesView) {
                _this.usagesView.destroy();
              }
              _this.usagesView = new UsagesView();
              return _this.usagesView.setItems(usages);
            }
          });
        };
      })(this));
      atom.workspace.observeTextEditors((function(_this) {
        return function(editor) {
          _this._handleGrammarChangeEvent(editor, editor.getGrammar());
          return editor.onDidChangeGrammar(function(grammar) {
            return _this._handleGrammarChangeEvent(editor, grammar);
          });
        };
      })(this));
      return atom.config.onDidChange('autocomplete-plus.enableAutoActivation', (function(_this) {
        return function() {
          return atom.workspace.observeTextEditors(function(editor) {
            return _this._handleGrammarChangeEvent(editor, editor.getGrammar());
          });
        };
      })(this));
    },
    _updateUsagesInFile: function(fileName, usages, newName) {
      var columnOffset;
      columnOffset = {};
      return atom.workspace.open(fileName, {
        activateItem: false
      }).then(function(editor) {
        var buffer, column, i, len, line, name, usage;
        buffer = editor.getBuffer();
        for (i = 0, len = usages.length; i < len; i++) {
          usage = usages[i];
          name = usage.name, line = usage.line, column = usage.column;
          if (columnOffset[line] == null) {
            columnOffset[line] = 0;
          }
          log.debug('Replacing', usage, 'with', newName, 'in', editor.id);
          log.debug('Offset for line', line, 'is', columnOffset[line]);
          buffer.setTextInRange([[line - 1, column + columnOffset[line]], [line - 1, column + name.length + columnOffset[line]]], newName);
          columnOffset[line] += newName.length - name.length;
        }
        return buffer.save();
      });
    },
    _showSignatureOverlay: function(event) {
      var cursor, disableForSelector, editor, getTooltip, i, len, marker, ref1, scopeChain, scopeDescriptor, wordBufferRange;
      if (this.markers) {
        ref1 = this.markers;
        for (i = 0, len = ref1.length; i < len; i++) {
          marker = ref1[i];
          log.debug('destroying old marker', marker);
          marker.destroy();
        }
      } else {
        this.markers = [];
      }
      selectorsMatchScopeChain = require('./scope-helpers').selectorsMatchScopeChain;
      Selector = require('selector-kit').Selector;
      cursor = event.cursor;
      editor = event.cursor.editor;
      wordBufferRange = cursor.getCurrentWordBufferRange();
      scopeDescriptor = editor.scopeDescriptorForBufferPosition(event.newBufferPosition);
      scopeChain = scopeDescriptor.getScopeChain();
      disableForSelector = this.disableForSelector + ", .source.python .numeric, .source.python .integer, .source.python .decimal, .source.python .punctuation, .source.python .keyword, .source.python .storage, .source.python .variable.parameter, .source.python .entity.name";
      disableForSelector = Selector.create(disableForSelector);
      if (selectorsMatchScopeChain(disableForSelector, scopeChain)) {
        log.debug('do nothing for this selector');
        return;
      }
      marker = editor.markBufferRange(wordBufferRange, {
        persistent: false,
        invalidate: 'never'
      });
      this.markers.push(marker);
      getTooltip = (function(_this) {
        return function(editor, bufferPosition) {
          var payload;
          payload = {
            id: _this._generateRequestId('tooltip', editor, bufferPosition),
            lookup: 'tooltip',
            path: editor.getPath(),
            source: editor.getText(),
            line: bufferPosition.row,
            column: bufferPosition.column,
            config: _this._generateRequestConfig()
          };
          _this._sendRequest(_this._serialize(payload));
          return new Promise(function(resolve) {
            return _this.requests[payload.id] = resolve;
          });
        };
      })(this);
      return getTooltip(editor, event.newBufferPosition).then((function(_this) {
        return function(results) {
          var column, decoration, description, fileName, line, ref2, text, type, view;
          if (results.length > 0) {
            ref2 = results[0], text = ref2.text, fileName = ref2.fileName, line = ref2.line, column = ref2.column, type = ref2.type, description = ref2.description;
            description = description.trim();
            if (!description) {
              return;
            }
            view = document.createElement('autocomplete-python-suggestion');
            view.appendChild(document.createTextNode(description));
            decoration = editor.decorateMarker(marker, {
              type: 'overlay',
              item: view,
              position: 'head'
            });
            return log.debug('decorated marker', marker);
          }
        };
      })(this));
    },
    _handleGrammarChangeEvent: function(editor, grammar) {
      var disposable, eventId, eventName;
      eventName = 'keyup';
      eventId = editor.id + "." + eventName;
      if (grammar.scopeName === 'source.python') {
        if (atom.config.get('autocomplete-python.showTooltips') === true) {
          editor.onDidChangeCursorPosition((function(_this) {
            return function(event) {
              return _this._showSignatureOverlay(event);
            };
          })(this));
        }
        if (!atom.config.get('autocomplete-plus.enableAutoActivation')) {
          log.debug('Ignoring keyup events due to autocomplete-plus settings.');
          return;
        }
        disposable = this._addEventListener(editor, eventName, (function(_this) {
          return function(e) {
            var bracketIdentifiers;
            bracketIdentifiers = {
              'U+0028': 'qwerty',
              'U+0038': 'german',
              'U+0035': 'azerty',
              'U+0039': 'other'
            };
            if (e.keyIdentifier in bracketIdentifiers) {
              log.debug('Trying to complete arguments on keyup event', e);
              return _this._completeArguments(editor, editor.getCursorBufferPosition());
            }
          };
        })(this));
        this.disposables.add(disposable);
        this.subscriptions[eventId] = disposable;
        return log.debug('Subscribed on event', eventId);
      } else {
        if (eventId in this.subscriptions) {
          this.subscriptions[eventId].dispose();
          return log.debug('Unsubscribed from event', eventId);
        }
      }
    },
    _serialize: function(request) {
      log.debug('Serializing request to be sent to Jedi', request);
      return JSON.stringify(request);
    },
    _sendRequest: function(data, respawned) {
      var process;
      log.debug('Pending requests:', Object.keys(this.requests).length, this.requests);
      if (Object.keys(this.requests).length > 10) {
        log.debug('Cleaning up request queue to avoid overflow, ignoring request');
        this.requests = {};
        if (this.provider && this.provider.process) {
          log.debug('Killing python process');
          this.provider.kill();
          return;
        }
      }
      if (this.provider && this.provider.process) {
        process = this.provider.process;
        if (process.exitCode === null && process.signalCode === null) {
          if (this.provider.process.pid) {
            return this.provider.process.stdin.write(data + '\n');
          } else {
            return log.debug('Attempt to communicate with terminated process', this.provider);
          }
        } else if (respawned) {
          atom.notifications.addWarning(["Failed to spawn daemon for autocomplete-python.", "Completions will not work anymore", "unless you restart your editor."].join(' '), {
            detail: ["exitCode: " + process.exitCode, "signalCode: " + process.signalCode].join('\n'),
            dismissable: true
          });
          return this.dispose();
        } else {
          this._spawnDaemon();
          this._sendRequest(data, {
            respawned: true
          });
          return log.debug('Re-spawning python process...');
        }
      } else {
        log.debug('Spawning python process...');
        this._spawnDaemon();
        return this._sendRequest(data);
      }
    },
    _deserialize: function(response) {
      var bufferPosition, cacheSizeDelta, e, editor, i, id, ids, j, len, len1, ref1, ref2, ref3, resolve, responseSource, results1;
      log.debug('Deserealizing response from Jedi', response);
      log.debug("Got " + (response.trim().split('\n').length) + " lines");
      ref1 = response.trim().split('\n');
      results1 = [];
      for (i = 0, len = ref1.length; i < len; i++) {
        responseSource = ref1[i];
        try {
          response = JSON.parse(responseSource);
        } catch (error1) {
          e = error1;
          throw new Error("Failed to parse JSON from \"" + responseSource + "\".\nOriginal exception: " + e);
        }
        if (response['arguments']) {
          editor = this.requests[response['id']];
          if (typeof editor === 'object') {
            bufferPosition = editor.getCursorBufferPosition();
            if (response['id'] === this._generateRequestId('arguments', editor, bufferPosition)) {
              if ((ref2 = this.snippetsManager) != null) {
                ref2.insertSnippet(response['arguments'], editor);
              }
            }
          }
        } else {
          resolve = this.requests[response['id']];
          if (typeof resolve === 'function') {
            resolve(response['results']);
          }
        }
        cacheSizeDelta = Object.keys(this.responses).length > this.cacheSize;
        if (cacheSizeDelta > 0) {
          ids = Object.keys(this.responses).sort((function(_this) {
            return function(a, b) {
              return _this.responses[a]['timestamp'] - _this.responses[b]['timestamp'];
            };
          })(this));
          ref3 = ids.slice(0, cacheSizeDelta);
          for (j = 0, len1 = ref3.length; j < len1; j++) {
            id = ref3[j];
            log.debug('Removing old item from cache with ID', id);
            delete this.responses[id];
          }
        }
        this.responses[response['id']] = {
          source: responseSource,
          timestamp: Date.now()
        };
        log.debug('Cached request with ID', response['id']);
        results1.push(delete this.requests[response['id']]);
      }
      return results1;
    },
    _generateRequestId: function(type, editor, bufferPosition, text) {
      if (!text) {
        text = editor.getText();
      }
      return require('crypto').createHash('md5').update([editor.getPath(), text, bufferPosition.row, bufferPosition.column, type].join()).digest('hex');
    },
    _generateRequestConfig: function() {
      var args, extraPaths;
      extraPaths = InterpreterLookup.applySubstitutions(atom.config.get('autocomplete-python.extraPaths').split(';'));
      args = {
        'extraPaths': extraPaths,
        'useSnippets': atom.config.get('autocomplete-python.useSnippets'),
        'caseInsensitiveCompletion': atom.config.get('autocomplete-python.caseInsensitiveCompletion'),
        'showDescriptions': atom.config.get('autocomplete-python.showDescriptions'),
        'fuzzyMatcher': atom.config.get('autocomplete-python.fuzzyMatcher')
      };
      return args;
    },
    setSnippetsManager: function(snippetsManager) {
      this.snippetsManager = snippetsManager;
    },
    _completeArguments: function(editor, bufferPosition, force) {
      var disableForSelector, line, lines, payload, prefix, scopeChain, scopeDescriptor, suffix, useSnippets;
      useSnippets = atom.config.get('autocomplete-python.useSnippets');
      if (!force && useSnippets === 'none') {
        atom.commands.dispatch(document.querySelector('atom-text-editor'), 'autocomplete-plus:activate');
        return;
      }
      scopeDescriptor = editor.scopeDescriptorForBufferPosition(bufferPosition);
      scopeChain = scopeDescriptor.getScopeChain();
      disableForSelector = Selector.create(this.disableForSelector);
      if (selectorsMatchScopeChain(disableForSelector, scopeChain)) {
        log.debug('Ignoring argument completion inside of', scopeChain);
        return;
      }
      lines = editor.getBuffer().getLines();
      line = lines[bufferPosition.row];
      prefix = line.slice(bufferPosition.column - 1, bufferPosition.column);
      if (prefix !== '(') {
        log.debug('Ignoring argument completion with prefix', prefix);
        return;
      }
      suffix = line.slice(bufferPosition.column, line.length);
      if (!/^(\)(?:$|\s)|\s|$)/.test(suffix)) {
        log.debug('Ignoring argument completion with suffix', suffix);
        return;
      }
      payload = {
        id: this._generateRequestId('arguments', editor, bufferPosition),
        lookup: 'arguments',
        path: editor.getPath(),
        source: editor.getText(),
        line: bufferPosition.row,
        column: bufferPosition.column,
        config: this._generateRequestConfig()
      };
      this._sendRequest(this._serialize(payload));
      return new Promise((function(_this) {
        return function() {
          return _this.requests[payload.id] = editor;
        };
      })(this));
    },
    _fuzzyFilter: function(candidates, query) {
      if (candidates.length !== 0 && (query !== ' ' && query !== '.' && query !== '(')) {
        if (filter == null) {
          filter = require('fuzzaldrin-plus').filter;
        }
        candidates = filter(candidates, query, {
          key: 'text'
        });
      }
      return candidates;
    },
    getSuggestions: function(arg) {
      var bufferPosition, editor, lastIdentifier, line, lines, matches, payload, prefix, requestId, scopeDescriptor;
      editor = arg.editor, bufferPosition = arg.bufferPosition, scopeDescriptor = arg.scopeDescriptor, prefix = arg.prefix;
      if (!this.triggerCompletionRegex.test(prefix)) {
        return [];
      }
      bufferPosition = {
        row: bufferPosition.row,
        column: bufferPosition.column
      };
      lines = editor.getBuffer().getLines();
      if (atom.config.get('autocomplete-python.fuzzyMatcher')) {
        line = lines[bufferPosition.row];
        lastIdentifier = /\.?[a-zA-Z_][a-zA-Z0-9_]*$/.exec(line.slice(0, bufferPosition.column));
        if (lastIdentifier) {
          bufferPosition.column = lastIdentifier.index + 1;
          lines[bufferPosition.row] = line.slice(0, bufferPosition.column);
        }
      }
      requestId = this._generateRequestId('completions', editor, bufferPosition, lines.join('\n'));
      if (requestId in this.responses) {
        log.debug('Using cached response with ID', requestId);
        matches = JSON.parse(this.responses[requestId]['source'])['results'];
        if (atom.config.get('autocomplete-python.fuzzyMatcher')) {
          return this._fuzzyFilter(matches, prefix);
        } else {
          return matches;
        }
      }
      payload = {
        id: requestId,
        prefix: prefix,
        lookup: 'completions',
        path: editor.getPath(),
        source: editor.getText(),
        line: bufferPosition.row,
        column: bufferPosition.column,
        config: this._generateRequestConfig()
      };
      this._sendRequest(this._serialize(payload));
      return new Promise((function(_this) {
        return function(resolve) {
          if (atom.config.get('autocomplete-python.fuzzyMatcher')) {
            return _this.requests[payload.id] = function(matches) {
              return resolve(_this._fuzzyFilter(matches, prefix));
            };
          } else {
            return _this.requests[payload.id] = resolve;
          }
        };
      })(this));
    },
    getDefinitions: function(editor, bufferPosition) {
      var payload;
      payload = {
        id: this._generateRequestId('definitions', editor, bufferPosition),
        lookup: 'definitions',
        path: editor.getPath(),
        source: editor.getText(),
        line: bufferPosition.row,
        column: bufferPosition.column,
        config: this._generateRequestConfig()
      };
      this._sendRequest(this._serialize(payload));
      return new Promise((function(_this) {
        return function(resolve) {
          return _this.requests[payload.id] = resolve;
        };
      })(this));
    },
    getUsages: function(editor, bufferPosition) {
      var payload;
      payload = {
        id: this._generateRequestId('usages', editor, bufferPosition),
        lookup: 'usages',
        path: editor.getPath(),
        source: editor.getText(),
        line: bufferPosition.row,
        column: bufferPosition.column,
        config: this._generateRequestConfig()
      };
      this._sendRequest(this._serialize(payload));
      return new Promise((function(_this) {
        return function(resolve) {
          return _this.requests[payload.id] = resolve;
        };
      })(this));
    },
    getMethods: function(editor, bufferPosition) {
      var indent, lines, payload;
      indent = bufferPosition.column;
      lines = editor.getBuffer().getLines();
      lines.splice(bufferPosition.row + 1, 0, "  def __autocomplete_python(s):");
      lines.splice(bufferPosition.row + 2, 0, "    s.");
      payload = {
        id: this._generateRequestId('methods', editor, bufferPosition),
        lookup: 'methods',
        path: editor.getPath(),
        source: lines.join('\n'),
        line: bufferPosition.row + 2,
        column: 6,
        config: this._generateRequestConfig()
      };
      this._sendRequest(this._serialize(payload));
      return new Promise((function(_this) {
        return function(resolve) {
          return _this.requests[payload.id] = function(methods) {
            return resolve({
              methods: methods,
              indent: indent,
              bufferPosition: bufferPosition
            });
          };
        };
      })(this));
    },
    goToDefinition: function(editor, bufferPosition) {
      if (!editor) {
        editor = atom.workspace.getActiveTextEditor();
      }
      if (!bufferPosition) {
        bufferPosition = editor.getCursorBufferPosition();
      }
      if (this.definitionsView) {
        this.definitionsView.destroy();
      }
      this.definitionsView = new DefinitionsView();
      return this.getDefinitions(editor, bufferPosition).then((function(_this) {
        return function(results) {
          _this.definitionsView.setItems(results);
          if (results.length === 1) {
            return _this.definitionsView.confirmed(results[0]);
          }
        };
      })(this));
    },
    dispose: function() {
      this.disposables.dispose();
      if (this.provider) {
        return this.provider.kill();
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvYXV0b2NvbXBsZXRlLXB5dGhvbi9saWIvcHJvdmlkZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxNQUFxRCxPQUFBLENBQVEsTUFBUixDQUFyRCxFQUFDLDJCQUFELEVBQWEsNkNBQWIsRUFBa0M7O0VBQ2pDLDJCQUE0QixPQUFBLENBQVEsaUJBQVI7O0VBQzVCLFdBQVksT0FBQSxDQUFRLGNBQVI7O0VBQ2IsZUFBQSxHQUFrQixPQUFBLENBQVEsb0JBQVI7O0VBQ2xCLFVBQUEsR0FBYSxPQUFBLENBQVEsZUFBUjs7RUFDYixZQUFBLEdBQWUsT0FBQSxDQUFRLGlCQUFSOztFQUNmLFVBQUEsR0FBYSxPQUFBLENBQVEsZUFBUjs7RUFDYixpQkFBQSxHQUFvQixPQUFBLENBQVEsdUJBQVI7O0VBQ3BCLEdBQUEsR0FBTSxPQUFBLENBQVEsT0FBUjs7RUFDTixDQUFBLEdBQUksT0FBQSxDQUFRLFlBQVI7O0VBQ0osTUFBQSxHQUFTOztFQUVULE1BQU0sQ0FBQyxPQUFQLEdBQ0U7SUFBQSxRQUFBLEVBQVUsZ0JBQVY7SUFDQSxrQkFBQSxFQUFvQixpREFEcEI7SUFFQSxpQkFBQSxFQUFtQixDQUZuQjtJQUdBLGtCQUFBLEVBQW9CLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQix3Q0FBaEIsQ0FIcEI7SUFJQSxvQkFBQSxFQUFzQixLQUp0QjtJQUtBLFNBQUEsRUFBVyxFQUxYO0lBT0EsaUJBQUEsRUFBbUIsU0FBQyxNQUFELEVBQVMsU0FBVCxFQUFvQixPQUFwQjtBQUNqQixVQUFBO01BQUEsVUFBQSxHQUFhLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBWCxDQUFtQixNQUFuQjtNQUNiLFVBQVUsQ0FBQyxnQkFBWCxDQUE0QixTQUE1QixFQUF1QyxPQUF2QztNQUNBLFVBQUEsR0FBaUIs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TUFDQSxJQUFHLElBQUMsQ0FBQSxRQUFKO2VBQ0UsSUFBQyxDQUFBLFFBQVEsQ0FBQyxJQUFWLENBQUEsRUFERjs7SUFGTyxDQWpnQlQ7O0FBYkYiLCJzb3VyY2VzQ29udGVudCI6WyJ7RGlzcG9zYWJsZSwgQ29tcG9zaXRlRGlzcG9zYWJsZSwgQnVmZmVyZWRQcm9jZXNzfSA9IHJlcXVpcmUgJ2F0b20nXG57c2VsZWN0b3JzTWF0Y2hTY29wZUNoYWlufSA9IHJlcXVpcmUgJy4vc2NvcGUtaGVscGVycydcbntTZWxlY3Rvcn0gPSByZXF1aXJlICdzZWxlY3Rvci1raXQnXG5EZWZpbml0aW9uc1ZpZXcgPSByZXF1aXJlICcuL2RlZmluaXRpb25zLXZpZXcnXG5Vc2FnZXNWaWV3ID0gcmVxdWlyZSAnLi91c2FnZXMtdmlldydcbk92ZXJyaWRlVmlldyA9IHJlcXVpcmUgJy4vb3ZlcnJpZGUtdmlldydcblJlbmFtZVZpZXcgPSByZXF1aXJlICcuL3JlbmFtZS12aWV3J1xuSW50ZXJwcmV0ZXJMb29rdXAgPSByZXF1aXJlICcuL2ludGVycHJldGVycy1sb29rdXAnXG5sb2cgPSByZXF1aXJlICcuL2xvZydcbl8gPSByZXF1aXJlICd1bmRlcnNjb3JlJ1xuZmlsdGVyID0gdW5kZWZpbmVkXG5cbm1vZHVsZS5leHBvcnRzID1cbiAgc2VsZWN0b3I6ICcuc291cmNlLnB5dGhvbidcbiAgZGlzYWJsZUZvclNlbGVjdG9yOiAnLnNvdXJjZS5weXRob24gLmNvbW1lbnQsIC5zb3VyY2UucHl0aG9uIC5zdHJpbmcnXG4gIGluY2x1c2lvblByaW9yaXR5OiAyXG4gIHN1Z2dlc3Rpb25Qcmlvcml0eTogYXRvbS5jb25maWcuZ2V0KCdhdXRvY29tcGxldGUtcHl0aG9uLnN1Z2dlc3Rpb25Qcmlvcml0eScpXG4gIGV4Y2x1ZGVMb3dlclByaW9yaXR5OiBmYWxzZVxuICBjYWNoZVNpemU6IDEwXG5cbiAgX2FkZEV2ZW50TGlzdGVuZXI6IChlZGl0b3IsIGV2ZW50TmFtZSwgaGFuZGxlcikgLT5cbiAgICBlZGl0b3JWaWV3ID0gYXRvbS52aWV3cy5nZXRWaWV3IGVkaXRvclxuICAgIGVkaXRvclZpZXcuYWRkRXZlbnRMaXN0ZW5lciBldmVudE5hbWUsIGhhbmRsZXJcbiAgICBkaXNwb3NhYmxlID0gbmV3IERpc3Bvc2FibGUgLT5cbiAgICAgIGxvZy5kZWJ1ZyAnVW5zdWJzY3JpYmluZyBmcm9tIGV2ZW50IGxpc3RlbmVyICcsIGV2ZW50TmFtZSwgaGFuZGxlclxuICAgICAgZWRpdG9yVmlldy5yZW1vdmVFdmVudExpc3RlbmVyIGV2ZW50TmFtZSwgaGFuZGxlclxuICAgIHJldHVybiBkaXNwb3NhYmxlXG5cbiAgX25vRXhlY3V0YWJsZUVycm9yOiAoZXJyb3IpIC0+XG4gICAgaWYgQHByb3ZpZGVyTm9FeGVjdXRhYmxlXG4gICAgICByZXR1cm5cbiAgICBsb2cud2FybmluZyAnTm8gcHl0aG9uIGV4ZWN1dGFibGUgZm91bmQnLCBlcnJvclxuICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nKFxuICAgICAgJ2F1dG9jb21wbGV0ZS1weXRob24gdW5hYmxlIHRvIGZpbmQgcHl0aG9uIGJpbmFyeS4nLCB7XG4gICAgICBkZXRhaWw6IFwiXCJcIlBsZWFzZSBzZXQgcGF0aCB0byBweXRob24gZXhlY3V0YWJsZSBtYW51YWxseSBpbiBwYWNrYWdlXG4gICAgICBzZXR0aW5ncyBhbmQgcmVzdGFydCB5b3VyIGVkaXRvci4gQmUgc3VyZSB0byBtaWdyYXRlIG9uIG5ldyBzZXR0aW5nc1xuICAgICAgaWYgZXZlcnl0aGluZyB3b3JrZWQgb24gcHJldmlvdXMgdmVyc2lvbi5cbiAgICAgIERldGFpbGVkIGVycm9yIG1lc3NhZ2U6ICN7ZXJyb3J9XG5cbiAgICAgIEN1cnJlbnQgY29uZmlnOiAje2F0b20uY29uZmlnLmdldCgnYXV0b2NvbXBsZXRlLXB5dGhvbi5weXRob25QYXRocycpfVwiXCJcIlxuICAgICAgZGlzbWlzc2FibGU6IHRydWV9KVxuICAgIEBwcm92aWRlck5vRXhlY3V0YWJsZSA9IHRydWVcblxuICBfc3Bhd25EYWVtb246IC0+XG4gICAgaW50ZXJwcmV0ZXIgPSBJbnRlcnByZXRlckxvb2t1cC5nZXRJbnRlcnByZXRlcigpXG4gICAgbG9nLmRlYnVnICdVc2luZyBpbnRlcnByZXRlcicsIGludGVycHJldGVyXG4gICAgQHByb3ZpZGVyID0gbmV3IEJ1ZmZlcmVkUHJvY2Vzc1xuICAgICAgY29tbWFuZDogaW50ZXJwcmV0ZXIgb3IgJ3B5dGhvbidcbiAgICAgIGFyZ3M6IFtfX2Rpcm5hbWUgKyAnL2NvbXBsZXRpb24ucHknXVxuICAgICAgc3Rkb3V0OiAoZGF0YSkgPT5cbiAgICAgICAgQF9kZXNlcmlhbGl6ZShkYXRhKVxuICAgICAgc3RkZXJyOiAoZGF0YSkgPT5cbiAgICAgICAgaWYgZGF0YS5pbmRleE9mKCdpcyBub3QgcmVjb2duaXplZCBhcyBhbiBpbnRlcm5hbCBvciBleHRlcm5hbCcpID4gLTFcbiAgICAgICAgICByZXR1cm4gQF9ub0V4ZWN1dGFibGVFcnJvcihkYXRhKVxuICAgICAgICBsb2cuZGVidWcgXCJhdXRvY29tcGxldGUtcHl0aG9uIHRyYWNlYmFjayBvdXRwdXQ6ICN7ZGF0YX1cIlxuICAgICAgICBpZiBkYXRhLmluZGV4T2YoJ2plZGknKSA+IC0xXG4gICAgICAgICAgaWYgYXRvbS5jb25maWcuZ2V0KCdhdXRvY29tcGxldGUtcHl0aG9uLm91dHB1dFByb3ZpZGVyRXJyb3JzJylcbiAgICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nKFxuICAgICAgICAgICAgICAnJydMb29rcyBsaWtlIHRoaXMgZXJyb3Igb3JpZ2luYXRlZCBmcm9tIEplZGkuIFBsZWFzZSBkbyBub3RcbiAgICAgICAgICAgICAgcmVwb3J0IHN1Y2ggaXNzdWVzIGluIGF1dG9jb21wbGV0ZS1weXRob24gaXNzdWUgdHJhY2tlci4gUmVwb3J0XG4gICAgICAgICAgICAgIHRoZW0gZGlyZWN0bHkgdG8gSmVkaS4gVHVybiBvZmYgYG91dHB1dFByb3ZpZGVyRXJyb3JzYCBzZXR0aW5nXG4gICAgICAgICAgICAgIHRvIGhpZGUgc3VjaCBlcnJvcnMgaW4gZnV0dXJlLiBUcmFjZWJhY2sgb3V0cHV0OicnJywge1xuICAgICAgICAgICAgICBkZXRhaWw6IFwiI3tkYXRhfVwiLFxuICAgICAgICAgICAgICBkaXNtaXNzYWJsZTogdHJ1ZX0pXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoXG4gICAgICAgICAgICAnYXV0b2NvbXBsZXRlLXB5dGhvbiB0cmFjZWJhY2sgb3V0cHV0OicsIHtcbiAgICAgICAgICAgICAgZGV0YWlsOiBcIiN7ZGF0YX1cIixcbiAgICAgICAgICAgICAgZGlzbWlzc2FibGU6IHRydWV9KVxuXG4gICAgICAgIGxvZy5kZWJ1ZyBcIkZvcmNpbmcgdG8gcmVzb2x2ZSAje09iamVjdC5rZXlzKEByZXF1ZXN0cykubGVuZ3RofSBwcm9taXNlc1wiXG4gICAgICAgIGZvciByZXF1ZXN0SWQsIHJlc29sdmUgb2YgQHJlcXVlc3RzXG4gICAgICAgICAgaWYgdHlwZW9mIHJlc29sdmUgPT0gJ2Z1bmN0aW9uJ1xuICAgICAgICAgICAgcmVzb2x2ZShbXSlcbiAgICAgICAgICBkZWxldGUgQHJlcXVlc3RzW3JlcXVlc3RJZF1cblxuICAgICAgZXhpdDogKGNvZGUpID0+XG4gICAgICAgIGxvZy53YXJuaW5nICdQcm9jZXNzIGV4aXQgd2l0aCcsIGNvZGUsIEBwcm92aWRlclxuICAgIEBwcm92aWRlci5vbldpbGxUaHJvd0Vycm9yICh7ZXJyb3IsIGhhbmRsZX0pID0+XG4gICAgICBpZiBlcnJvci5jb2RlIGlzICdFTk9FTlQnIGFuZCBlcnJvci5zeXNjYWxsLmluZGV4T2YoJ3NwYXduJykgaXMgMFxuICAgICAgICBAX25vRXhlY3V0YWJsZUVycm9yKGVycm9yKVxuICAgICAgICBAZGlzcG9zZSgpXG4gICAgICAgIGhhbmRsZSgpXG4gICAgICBlbHNlXG4gICAgICAgIHRocm93IGVycm9yXG5cbiAgICBAcHJvdmlkZXIucHJvY2Vzcz8uc3RkaW4ub24gJ2Vycm9yJywgKGVycikgLT5cbiAgICAgIGxvZy5kZWJ1ZyAnc3RkaW4nLCBlcnJcblxuICAgIHNldFRpbWVvdXQgPT5cbiAgICAgIGxvZy5kZWJ1ZyAnS2lsbGluZyBweXRob24gcHJvY2VzcyBhZnRlciB0aW1lb3V0Li4uJ1xuICAgICAgaWYgQHByb3ZpZGVyIGFuZCBAcHJvdmlkZXIucHJvY2Vzc1xuICAgICAgICBAcHJvdmlkZXIua2lsbCgpXG4gICAgLCA2MCAqIDEwICogMTAwMFxuXG4gIGNvbnN0cnVjdG9yOiAtPlxuICAgIEByZXF1ZXN0cyA9IHt9XG4gICAgQHJlc3BvbnNlcyA9IHt9XG4gICAgQHByb3ZpZGVyID0gbnVsbFxuICAgIEBkaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG4gICAgQHN1YnNjcmlwdGlvbnMgPSB7fVxuICAgIEBkZWZpbml0aW9uc1ZpZXcgPSBudWxsXG4gICAgQHVzYWdlc1ZpZXcgPSBudWxsXG4gICAgQHJlbmFtZVZpZXcgPSBudWxsXG4gICAgQHNuaXBwZXRzTWFuYWdlciA9IG51bGxcblxuICAgIGxvZy5kZWJ1ZyBcIkluaXQgYXV0b2NvbXBsZXRlLXB5dGhvbiB3aXRoIHByaW9yaXR5ICN7QHN1Z2dlc3Rpb25Qcmlvcml0eX1cIlxuXG4gICAgdHJ5XG4gICAgICBAdHJpZ2dlckNvbXBsZXRpb25SZWdleCA9IFJlZ0V4cCBhdG9tLmNvbmZpZy5nZXQoXG4gICAgICAgICdhdXRvY29tcGxldGUtcHl0aG9uLnRyaWdnZXJDb21wbGV0aW9uUmVnZXgnKVxuICAgIGNhdGNoIGVyclxuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFdhcm5pbmcoXG4gICAgICAgICcnJ2F1dG9jb21wbGV0ZS1weXRob24gaW52YWxpZCByZWdleHAgdG8gdHJpZ2dlciBhdXRvY29tcGxldGlvbnMuXG4gICAgICAgIEZhbGxpbmcgYmFjayB0byBkZWZhdWx0IHZhbHVlLicnJywge1xuICAgICAgICBkZXRhaWw6IFwiT3JpZ2luYWwgZXhjZXB0aW9uOiAje2Vycn1cIlxuICAgICAgICBkaXNtaXNzYWJsZTogdHJ1ZX0pXG4gICAgICBhdG9tLmNvbmZpZy5zZXQoJ2F1dG9jb21wbGV0ZS1weXRob24udHJpZ2dlckNvbXBsZXRpb25SZWdleCcsXG4gICAgICAgICAgICAgICAgICAgICAgJyhbXFwuXFwgXXxbYS16QS1aX11bYS16QS1aMC05X10qKScpXG4gICAgICBAdHJpZ2dlckNvbXBsZXRpb25SZWdleCA9IC8oW1xcLlxcIF18W2EtekEtWl9dW2EtekEtWjAtOV9dKikvXG5cbiAgICBzZWxlY3RvciA9ICdhdG9tLXRleHQtZWRpdG9yW2RhdGEtZ3JhbW1hcn49cHl0aG9uXSdcbiAgICBhdG9tLmNvbW1hbmRzLmFkZCBzZWxlY3RvciwgJ2F1dG9jb21wbGV0ZS1weXRob246Z28tdG8tZGVmaW5pdGlvbicsID0+XG4gICAgICBAZ29Ub0RlZmluaXRpb24oKVxuICAgIGF0b20uY29tbWFuZHMuYWRkIHNlbGVjdG9yLCAnYXV0b2NvbXBsZXRlLXB5dGhvbjpjb21wbGV0ZS1hcmd1bWVudHMnLCA9PlxuICAgICAgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgICBAX2NvbXBsZXRlQXJndW1lbnRzKGVkaXRvciwgZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCksIHRydWUpXG5cbiAgICBhdG9tLmNvbW1hbmRzLmFkZCBzZWxlY3RvciwgJ2F1dG9jb21wbGV0ZS1weXRob246c2hvdy11c2FnZXMnLCA9PlxuICAgICAgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgICBidWZmZXJQb3NpdGlvbiA9IGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpXG4gICAgICBpZiBAdXNhZ2VzVmlld1xuICAgICAgICBAdXNhZ2VzVmlldy5kZXN0cm95KClcbiAgICAgIEB1c2FnZXNWaWV3ID0gbmV3IFVzYWdlc1ZpZXcoKVxuICAgICAgQGdldFVzYWdlcyhlZGl0b3IsIGJ1ZmZlclBvc2l0aW9uKS50aGVuICh1c2FnZXMpID0+XG4gICAgICAgIEB1c2FnZXNWaWV3LnNldEl0ZW1zKHVzYWdlcylcblxuICAgIGF0b20uY29tbWFuZHMuYWRkIHNlbGVjdG9yLCAnYXV0b2NvbXBsZXRlLXB5dGhvbjpvdmVycmlkZS1tZXRob2QnLCA9PlxuICAgICAgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgICBidWZmZXJQb3NpdGlvbiA9IGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpXG4gICAgICBpZiBAb3ZlcnJpZGVWaWV3XG4gICAgICAgIEBvdmVycmlkZVZpZXcuZGVzdHJveSgpXG4gICAgICBAb3ZlcnJpZGVWaWV3ID0gbmV3IE92ZXJyaWRlVmlldygpXG4gICAgICBAZ2V0TWV0aG9kcyhlZGl0b3IsIGJ1ZmZlclBvc2l0aW9uKS50aGVuICh7bWV0aG9kcywgaW5kZW50LCBidWZmZXJQb3NpdGlvbn0pID0+XG4gICAgICAgIEBvdmVycmlkZVZpZXcuaW5kZW50ID0gaW5kZW50XG4gICAgICAgIEBvdmVycmlkZVZpZXcuYnVmZmVyUG9zaXRpb24gPSBidWZmZXJQb3NpdGlvblxuICAgICAgICBAb3ZlcnJpZGVWaWV3LnNldEl0ZW1zKG1ldGhvZHMpXG5cbiAgICBhdG9tLmNvbW1hbmRzLmFkZCBzZWxlY3RvciwgJ2F1dG9jb21wbGV0ZS1weXRob246cmVuYW1lJywgPT5cbiAgICAgIGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgICAgYnVmZmVyUG9zaXRpb24gPSBlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKVxuICAgICAgQGdldFVzYWdlcyhlZGl0b3IsIGJ1ZmZlclBvc2l0aW9uKS50aGVuICh1c2FnZXMpID0+XG4gICAgICAgIGlmIEByZW5hbWVWaWV3XG4gICAgICAgICAgQHJlbmFtZVZpZXcuZGVzdHJveSgpXG4gICAgICAgIGlmIHVzYWdlcy5sZW5ndGggPiAwXG4gICAgICAgICAgQHJlbmFtZVZpZXcgPSBuZXcgUmVuYW1lVmlldyh1c2FnZXMpXG4gICAgICAgICAgQHJlbmFtZVZpZXcub25JbnB1dCAobmV3TmFtZSkgPT5cbiAgICAgICAgICAgIGZvciBmaWxlTmFtZSwgdXNhZ2VzIG9mIF8uZ3JvdXBCeSh1c2FnZXMsICdmaWxlTmFtZScpXG4gICAgICAgICAgICAgIFtwcm9qZWN0LCBfcmVsYXRpdmVdID0gYXRvbS5wcm9qZWN0LnJlbGF0aXZpemVQYXRoKGZpbGVOYW1lKVxuICAgICAgICAgICAgICBpZiBwcm9qZWN0XG4gICAgICAgICAgICAgICAgQF91cGRhdGVVc2FnZXNJbkZpbGUoZmlsZU5hbWUsIHVzYWdlcywgbmV3TmFtZSlcbiAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGxvZy5kZWJ1ZyAnSWdub3JpbmcgZmlsZSBvdXRzaWRlIG9mIHByb2plY3QnLCBmaWxlTmFtZVxuICAgICAgICBlbHNlXG4gICAgICAgICAgaWYgQHVzYWdlc1ZpZXdcbiAgICAgICAgICAgIEB1c2FnZXNWaWV3LmRlc3Ryb3koKVxuICAgICAgICAgIEB1c2FnZXNWaWV3ID0gbmV3IFVzYWdlc1ZpZXcoKVxuICAgICAgICAgIEB1c2FnZXNWaWV3LnNldEl0ZW1zKHVzYWdlcylcblxuICAgIGF0b20ud29ya3NwYWNlLm9ic2VydmVUZXh0RWRpdG9ycyAoZWRpdG9yKSA9PlxuICAgICAgQF9oYW5kbGVHcmFtbWFyQ2hhbmdlRXZlbnQoZWRpdG9yLCBlZGl0b3IuZ2V0R3JhbW1hcigpKVxuICAgICAgZWRpdG9yLm9uRGlkQ2hhbmdlR3JhbW1hciAoZ3JhbW1hcikgPT5cbiAgICAgICAgQF9oYW5kbGVHcmFtbWFyQ2hhbmdlRXZlbnQoZWRpdG9yLCBncmFtbWFyKVxuXG4gICAgYXRvbS5jb25maWcub25EaWRDaGFuZ2UgJ2F1dG9jb21wbGV0ZS1wbHVzLmVuYWJsZUF1dG9BY3RpdmF0aW9uJywgPT5cbiAgICAgIGF0b20ud29ya3NwYWNlLm9ic2VydmVUZXh0RWRpdG9ycyAoZWRpdG9yKSA9PlxuICAgICAgICBAX2hhbmRsZUdyYW1tYXJDaGFuZ2VFdmVudChlZGl0b3IsIGVkaXRvci5nZXRHcmFtbWFyKCkpXG5cbiAgX3VwZGF0ZVVzYWdlc0luRmlsZTogKGZpbGVOYW1lLCB1c2FnZXMsIG5ld05hbWUpIC0+XG4gICAgY29sdW1uT2Zmc2V0ID0ge31cbiAgICBhdG9tLndvcmtzcGFjZS5vcGVuKGZpbGVOYW1lLCBhY3RpdmF0ZUl0ZW06IGZhbHNlKS50aGVuIChlZGl0b3IpIC0+XG4gICAgICBidWZmZXIgPSBlZGl0b3IuZ2V0QnVmZmVyKClcbiAgICAgIGZvciB1c2FnZSBpbiB1c2FnZXNcbiAgICAgICAge25hbWUsIGxpbmUsIGNvbHVtbn0gPSB1c2FnZVxuICAgICAgICBjb2x1bW5PZmZzZXRbbGluZV0gPz0gMFxuICAgICAgICBsb2cuZGVidWcgJ1JlcGxhY2luZycsIHVzYWdlLCAnd2l0aCcsIG5ld05hbWUsICdpbicsIGVkaXRvci5pZFxuICAgICAgICBsb2cuZGVidWcgJ09mZnNldCBmb3IgbGluZScsIGxpbmUsICdpcycsIGNvbHVtbk9mZnNldFtsaW5lXVxuICAgICAgICBidWZmZXIuc2V0VGV4dEluUmFuZ2UoW1xuICAgICAgICAgIFtsaW5lIC0gMSwgY29sdW1uICsgY29sdW1uT2Zmc2V0W2xpbmVdXSxcbiAgICAgICAgICBbbGluZSAtIDEsIGNvbHVtbiArIG5hbWUubGVuZ3RoICsgY29sdW1uT2Zmc2V0W2xpbmVdXSxcbiAgICAgICAgICBdLCBuZXdOYW1lKVxuICAgICAgICBjb2x1bW5PZmZzZXRbbGluZV0gKz0gbmV3TmFtZS5sZW5ndGggLSBuYW1lLmxlbmd0aFxuICAgICAgYnVmZmVyLnNhdmUoKVxuXG5cbiAgX3Nob3dTaWduYXR1cmVPdmVybGF5OiAoZXZlbnQpIC0+XG4gICAgaWYgQG1hcmtlcnNcbiAgICAgIGZvciBtYXJrZXIgaW4gQG1hcmtlcnNcbiAgICAgICAgbG9nLmRlYnVnICdkZXN0cm95aW5nIG9sZCBtYXJrZXInLCBtYXJrZXJcbiAgICAgICAgbWFya2VyLmRlc3Ryb3koKVxuICAgIGVsc2VcbiAgICAgIEBtYXJrZXJzID0gW11cblxuICAgIHtzZWxlY3RvcnNNYXRjaFNjb3BlQ2hhaW59ID0gcmVxdWlyZSAnLi9zY29wZS1oZWxwZXJzJ1xuICAgIHtTZWxlY3Rvcn0gPSByZXF1aXJlICdzZWxlY3Rvci1raXQnXG5cbiAgICBjdXJzb3IgPSBldmVudC5jdXJzb3JcbiAgICBlZGl0b3IgPSBldmVudC5jdXJzb3IuZWRpdG9yXG4gICAgd29yZEJ1ZmZlclJhbmdlID0gY3Vyc29yLmdldEN1cnJlbnRXb3JkQnVmZmVyUmFuZ2UoKVxuICAgIHNjb3BlRGVzY3JpcHRvciA9IGVkaXRvci5zY29wZURlc2NyaXB0b3JGb3JCdWZmZXJQb3NpdGlvbihcbiAgICAgIGV2ZW50Lm5ld0J1ZmZlclBvc2l0aW9uKVxuICAgIHNjb3BlQ2hhaW4gPSBzY29wZURlc2NyaXB0b3IuZ2V0U2NvcGVDaGFpbigpXG5cbiAgICBkaXNhYmxlRm9yU2VsZWN0b3IgPSBcIiN7QGRpc2FibGVGb3JTZWxlY3Rvcn0sIC5zb3VyY2UucHl0aG9uIC5udW1lcmljLCAuc291cmNlLnB5dGhvbiAuaW50ZWdlciwgLnNvdXJjZS5weXRob24gLmRlY2ltYWwsIC5zb3VyY2UucHl0aG9uIC5wdW5jdHVhdGlvbiwgLnNvdXJjZS5weXRob24gLmtleXdvcmQsIC5zb3VyY2UucHl0aG9uIC5zdG9yYWdlLCAuc291cmNlLnB5dGhvbiAudmFyaWFibGUucGFyYW1ldGVyLCAuc291cmNlLnB5dGhvbiAuZW50aXR5Lm5hbWVcIlxuICAgIGRpc2FibGVGb3JTZWxlY3RvciA9IFNlbGVjdG9yLmNyZWF0ZShkaXNhYmxlRm9yU2VsZWN0b3IpXG5cbiAgICBpZiBzZWxlY3RvcnNNYXRjaFNjb3BlQ2hhaW4oZGlzYWJsZUZvclNlbGVjdG9yLCBzY29wZUNoYWluKVxuICAgICAgbG9nLmRlYnVnICdkbyBub3RoaW5nIGZvciB0aGlzIHNlbGVjdG9yJ1xuICAgICAgcmV0dXJuXG5cbiAgICBtYXJrZXIgPSBlZGl0b3IubWFya0J1ZmZlclJhbmdlKFxuICAgICAgd29yZEJ1ZmZlclJhbmdlLFxuICAgICAge3BlcnNpc3RlbnQ6IGZhbHNlLCBpbnZhbGlkYXRlOiAnbmV2ZXInfSlcblxuICAgIEBtYXJrZXJzLnB1c2gobWFya2VyKVxuXG4gICAgZ2V0VG9vbHRpcCA9IChlZGl0b3IsIGJ1ZmZlclBvc2l0aW9uKSA9PlxuICAgICAgcGF5bG9hZCA9XG4gICAgICAgIGlkOiBAX2dlbmVyYXRlUmVxdWVzdElkKCd0b29sdGlwJywgZWRpdG9yLCBidWZmZXJQb3NpdGlvbilcbiAgICAgICAgbG9va3VwOiAndG9vbHRpcCdcbiAgICAgICAgcGF0aDogZWRpdG9yLmdldFBhdGgoKVxuICAgICAgICBzb3VyY2U6IGVkaXRvci5nZXRUZXh0KClcbiAgICAgICAgbGluZTogYnVmZmVyUG9zaXRpb24ucm93XG4gICAgICAgIGNvbHVtbjogYnVmZmVyUG9zaXRpb24uY29sdW1uXG4gICAgICAgIGNvbmZpZzogQF9nZW5lcmF0ZVJlcXVlc3RDb25maWcoKVxuICAgICAgQF9zZW5kUmVxdWVzdChAX3NlcmlhbGl6ZShwYXlsb2FkKSlcbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZSAocmVzb2x2ZSkgPT5cbiAgICAgICAgQHJlcXVlc3RzW3BheWxvYWQuaWRdID0gcmVzb2x2ZVxuXG4gICAgZ2V0VG9vbHRpcChlZGl0b3IsIGV2ZW50Lm5ld0J1ZmZlclBvc2l0aW9uKS50aGVuIChyZXN1bHRzKSA9PlxuICAgICAgaWYgcmVzdWx0cy5sZW5ndGggPiAwXG4gICAgICAgIHt0ZXh0LCBmaWxlTmFtZSwgbGluZSwgY29sdW1uLCB0eXBlLCBkZXNjcmlwdGlvbn0gPSByZXN1bHRzWzBdXG5cbiAgICAgICAgZGVzY3JpcHRpb24gPSBkZXNjcmlwdGlvbi50cmltKClcbiAgICAgICAgaWYgbm90IGRlc2NyaXB0aW9uXG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIHZpZXcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhdXRvY29tcGxldGUtcHl0aG9uLXN1Z2dlc3Rpb24nKVxuICAgICAgICB2aWV3LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGRlc2NyaXB0aW9uKSlcbiAgICAgICAgZGVjb3JhdGlvbiA9IGVkaXRvci5kZWNvcmF0ZU1hcmtlcihtYXJrZXIsIHtcbiAgICAgICAgICAgIHR5cGU6ICdvdmVybGF5JyxcbiAgICAgICAgICAgIGl0ZW06IHZpZXcsXG4gICAgICAgICAgICBwb3NpdGlvbjogJ2hlYWQnXG4gICAgICAgIH0pXG4gICAgICAgIGxvZy5kZWJ1ZygnZGVjb3JhdGVkIG1hcmtlcicsIG1hcmtlcilcblxuICBfaGFuZGxlR3JhbW1hckNoYW5nZUV2ZW50OiAoZWRpdG9yLCBncmFtbWFyKSAtPlxuICAgIGV2ZW50TmFtZSA9ICdrZXl1cCdcbiAgICBldmVudElkID0gXCIje2VkaXRvci5pZH0uI3tldmVudE5hbWV9XCJcbiAgICBpZiBncmFtbWFyLnNjb3BlTmFtZSA9PSAnc291cmNlLnB5dGhvbidcblxuICAgICAgaWYgYXRvbS5jb25maWcuZ2V0KCdhdXRvY29tcGxldGUtcHl0aG9uLnNob3dUb29sdGlwcycpIGlzIHRydWVcbiAgICAgICAgZWRpdG9yLm9uRGlkQ2hhbmdlQ3Vyc29yUG9zaXRpb24gKGV2ZW50KSA9PlxuICAgICAgICAgIEBfc2hvd1NpZ25hdHVyZU92ZXJsYXkoZXZlbnQpXG5cbiAgICAgIGlmIG5vdCBhdG9tLmNvbmZpZy5nZXQoJ2F1dG9jb21wbGV0ZS1wbHVzLmVuYWJsZUF1dG9BY3RpdmF0aW9uJylcbiAgICAgICAgbG9nLmRlYnVnICdJZ25vcmluZyBrZXl1cCBldmVudHMgZHVlIHRvIGF1dG9jb21wbGV0ZS1wbHVzIHNldHRpbmdzLidcbiAgICAgICAgcmV0dXJuXG4gICAgICBkaXNwb3NhYmxlID0gQF9hZGRFdmVudExpc3RlbmVyIGVkaXRvciwgZXZlbnROYW1lLCAoZSkgPT5cbiAgICAgICAgYnJhY2tldElkZW50aWZpZXJzID1cbiAgICAgICAgICAnVSswMDI4JzogJ3F3ZXJ0eSdcbiAgICAgICAgICAnVSswMDM4JzogJ2dlcm1hbidcbiAgICAgICAgICAnVSswMDM1JzogJ2F6ZXJ0eSdcbiAgICAgICAgICAnVSswMDM5JzogJ290aGVyJ1xuICAgICAgICBpZiBlLmtleUlkZW50aWZpZXIgb2YgYnJhY2tldElkZW50aWZpZXJzXG4gICAgICAgICAgbG9nLmRlYnVnICdUcnlpbmcgdG8gY29tcGxldGUgYXJndW1lbnRzIG9uIGtleXVwIGV2ZW50JywgZVxuICAgICAgICAgIEBfY29tcGxldGVBcmd1bWVudHMoZWRpdG9yLCBlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKSlcbiAgICAgIEBkaXNwb3NhYmxlcy5hZGQgZGlzcG9zYWJsZVxuICAgICAgQHN1YnNjcmlwdGlvbnNbZXZlbnRJZF0gPSBkaXNwb3NhYmxlXG4gICAgICBsb2cuZGVidWcgJ1N1YnNjcmliZWQgb24gZXZlbnQnLCBldmVudElkXG4gICAgZWxzZVxuICAgICAgaWYgZXZlbnRJZCBvZiBAc3Vic2NyaXB0aW9uc1xuICAgICAgICBAc3Vic2NyaXB0aW9uc1tldmVudElkXS5kaXNwb3NlKClcbiAgICAgICAgbG9nLmRlYnVnICdVbnN1YnNjcmliZWQgZnJvbSBldmVudCcsIGV2ZW50SWRcblxuICBfc2VyaWFsaXplOiAocmVxdWVzdCkgLT5cbiAgICBsb2cuZGVidWcgJ1NlcmlhbGl6aW5nIHJlcXVlc3QgdG8gYmUgc2VudCB0byBKZWRpJywgcmVxdWVzdFxuICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShyZXF1ZXN0KVxuXG4gIF9zZW5kUmVxdWVzdDogKGRhdGEsIHJlc3Bhd25lZCkgLT5cbiAgICBsb2cuZGVidWcgJ1BlbmRpbmcgcmVxdWVzdHM6JywgT2JqZWN0LmtleXMoQHJlcXVlc3RzKS5sZW5ndGgsIEByZXF1ZXN0c1xuICAgIGlmIE9iamVjdC5rZXlzKEByZXF1ZXN0cykubGVuZ3RoID4gMTBcbiAgICAgIGxvZy5kZWJ1ZyAnQ2xlYW5pbmcgdXAgcmVxdWVzdCBxdWV1ZSB0byBhdm9pZCBvdmVyZmxvdywgaWdub3JpbmcgcmVxdWVzdCdcbiAgICAgIEByZXF1ZXN0cyA9IHt9XG4gICAgICBpZiBAcHJvdmlkZXIgYW5kIEBwcm92aWRlci5wcm9jZXNzXG4gICAgICAgIGxvZy5kZWJ1ZyAnS2lsbGluZyBweXRob24gcHJvY2VzcydcbiAgICAgICAgQHByb3ZpZGVyLmtpbGwoKVxuICAgICAgICByZXR1cm5cblxuICAgIGlmIEBwcm92aWRlciBhbmQgQHByb3ZpZGVyLnByb2Nlc3NcbiAgICAgIHByb2Nlc3MgPSBAcHJvdmlkZXIucHJvY2Vzc1xuICAgICAgaWYgcHJvY2Vzcy5leGl0Q29kZSA9PSBudWxsIGFuZCBwcm9jZXNzLnNpZ25hbENvZGUgPT0gbnVsbFxuICAgICAgICBpZiBAcHJvdmlkZXIucHJvY2Vzcy5waWRcbiAgICAgICAgICByZXR1cm4gQHByb3ZpZGVyLnByb2Nlc3Muc3RkaW4ud3JpdGUoZGF0YSArICdcXG4nKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgbG9nLmRlYnVnICdBdHRlbXB0IHRvIGNvbW11bmljYXRlIHdpdGggdGVybWluYXRlZCBwcm9jZXNzJywgQHByb3ZpZGVyXG4gICAgICBlbHNlIGlmIHJlc3Bhd25lZFxuICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkV2FybmluZyhcbiAgICAgICAgICBbXCJGYWlsZWQgdG8gc3Bhd24gZGFlbW9uIGZvciBhdXRvY29tcGxldGUtcHl0aG9uLlwiXG4gICAgICAgICAgIFwiQ29tcGxldGlvbnMgd2lsbCBub3Qgd29yayBhbnltb3JlXCJcbiAgICAgICAgICAgXCJ1bmxlc3MgeW91IHJlc3RhcnQgeW91ciBlZGl0b3IuXCJdLmpvaW4oJyAnKSwge1xuICAgICAgICAgIGRldGFpbDogW1wiZXhpdENvZGU6ICN7cHJvY2Vzcy5leGl0Q29kZX1cIlxuICAgICAgICAgICAgICAgICAgIFwic2lnbmFsQ29kZTogI3twcm9jZXNzLnNpZ25hbENvZGV9XCJdLmpvaW4oJ1xcbicpLFxuICAgICAgICAgIGRpc21pc3NhYmxlOiB0cnVlfSlcbiAgICAgICAgQGRpc3Bvc2UoKVxuICAgICAgZWxzZVxuICAgICAgICBAX3NwYXduRGFlbW9uKClcbiAgICAgICAgQF9zZW5kUmVxdWVzdChkYXRhLCByZXNwYXduZWQ6IHRydWUpXG4gICAgICAgIGxvZy5kZWJ1ZyAnUmUtc3Bhd25pbmcgcHl0aG9uIHByb2Nlc3MuLi4nXG4gICAgZWxzZVxuICAgICAgbG9nLmRlYnVnICdTcGF3bmluZyBweXRob24gcHJvY2Vzcy4uLidcbiAgICAgIEBfc3Bhd25EYWVtb24oKVxuICAgICAgQF9zZW5kUmVxdWVzdChkYXRhKVxuXG4gIF9kZXNlcmlhbGl6ZTogKHJlc3BvbnNlKSAtPlxuICAgIGxvZy5kZWJ1ZyAnRGVzZXJlYWxpemluZyByZXNwb25zZSBmcm9tIEplZGknLCByZXNwb25zZVxuICAgIGxvZy5kZWJ1ZyBcIkdvdCAje3Jlc3BvbnNlLnRyaW0oKS5zcGxpdCgnXFxuJykubGVuZ3RofSBsaW5lc1wiXG4gICAgZm9yIHJlc3BvbnNlU291cmNlIGluIHJlc3BvbnNlLnRyaW0oKS5zcGxpdCgnXFxuJylcbiAgICAgIHRyeVxuICAgICAgICByZXNwb25zZSA9IEpTT04ucGFyc2UocmVzcG9uc2VTb3VyY2UpXG4gICAgICBjYXRjaCBlXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlwiXCJGYWlsZWQgdG8gcGFyc2UgSlNPTiBmcm9tIFxcXCIje3Jlc3BvbnNlU291cmNlfVxcXCIuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBPcmlnaW5hbCBleGNlcHRpb246ICN7ZX1cIlwiXCIpXG5cbiAgICAgIGlmIHJlc3BvbnNlWydhcmd1bWVudHMnXVxuICAgICAgICBlZGl0b3IgPSBAcmVxdWVzdHNbcmVzcG9uc2VbJ2lkJ11dXG4gICAgICAgIGlmIHR5cGVvZiBlZGl0b3IgPT0gJ29iamVjdCdcbiAgICAgICAgICBidWZmZXJQb3NpdGlvbiA9IGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpXG4gICAgICAgICAgIyBDb21wYXJlIHJlc3BvbnNlIElEIHdpdGggY3VycmVudCBzdGF0ZSB0byBhdm9pZCBzdGFsZSBjb21wbGV0aW9uc1xuICAgICAgICAgIGlmIHJlc3BvbnNlWydpZCddID09IEBfZ2VuZXJhdGVSZXF1ZXN0SWQoJ2FyZ3VtZW50cycsIGVkaXRvciwgYnVmZmVyUG9zaXRpb24pXG4gICAgICAgICAgICBAc25pcHBldHNNYW5hZ2VyPy5pbnNlcnRTbmlwcGV0KHJlc3BvbnNlWydhcmd1bWVudHMnXSwgZWRpdG9yKVxuICAgICAgZWxzZVxuICAgICAgICByZXNvbHZlID0gQHJlcXVlc3RzW3Jlc3BvbnNlWydpZCddXVxuICAgICAgICBpZiB0eXBlb2YgcmVzb2x2ZSA9PSAnZnVuY3Rpb24nXG4gICAgICAgICAgcmVzb2x2ZShyZXNwb25zZVsncmVzdWx0cyddKVxuICAgICAgY2FjaGVTaXplRGVsdGEgPSBPYmplY3Qua2V5cyhAcmVzcG9uc2VzKS5sZW5ndGggPiBAY2FjaGVTaXplXG4gICAgICBpZiBjYWNoZVNpemVEZWx0YSA+IDBcbiAgICAgICAgaWRzID0gT2JqZWN0LmtleXMoQHJlc3BvbnNlcykuc29ydCAoYSwgYikgPT5cbiAgICAgICAgICByZXR1cm4gQHJlc3BvbnNlc1thXVsndGltZXN0YW1wJ10gLSBAcmVzcG9uc2VzW2JdWyd0aW1lc3RhbXAnXVxuICAgICAgICBmb3IgaWQgaW4gaWRzLnNsaWNlKDAsIGNhY2hlU2l6ZURlbHRhKVxuICAgICAgICAgIGxvZy5kZWJ1ZyAnUmVtb3Zpbmcgb2xkIGl0ZW0gZnJvbSBjYWNoZSB3aXRoIElEJywgaWRcbiAgICAgICAgICBkZWxldGUgQHJlc3BvbnNlc1tpZF1cbiAgICAgIEByZXNwb25zZXNbcmVzcG9uc2VbJ2lkJ11dID1cbiAgICAgICAgc291cmNlOiByZXNwb25zZVNvdXJjZVxuICAgICAgICB0aW1lc3RhbXA6IERhdGUubm93KClcbiAgICAgIGxvZy5kZWJ1ZyAnQ2FjaGVkIHJlcXVlc3Qgd2l0aCBJRCcsIHJlc3BvbnNlWydpZCddXG4gICAgICBkZWxldGUgQHJlcXVlc3RzW3Jlc3BvbnNlWydpZCddXVxuXG4gIF9nZW5lcmF0ZVJlcXVlc3RJZDogKHR5cGUsIGVkaXRvciwgYnVmZmVyUG9zaXRpb24sIHRleHQpIC0+XG4gICAgaWYgbm90IHRleHRcbiAgICAgIHRleHQgPSBlZGl0b3IuZ2V0VGV4dCgpXG4gICAgcmV0dXJuIHJlcXVpcmUoJ2NyeXB0bycpLmNyZWF0ZUhhc2goJ21kNScpLnVwZGF0ZShbXG4gICAgICBlZGl0b3IuZ2V0UGF0aCgpLCB0ZXh0LCBidWZmZXJQb3NpdGlvbi5yb3csXG4gICAgICBidWZmZXJQb3NpdGlvbi5jb2x1bW4sIHR5cGVdLmpvaW4oKSkuZGlnZXN0KCdoZXgnKVxuXG4gIF9nZW5lcmF0ZVJlcXVlc3RDb25maWc6IC0+XG4gICAgZXh0cmFQYXRocyA9IEludGVycHJldGVyTG9va3VwLmFwcGx5U3Vic3RpdHV0aW9ucyhcbiAgICAgIGF0b20uY29uZmlnLmdldCgnYXV0b2NvbXBsZXRlLXB5dGhvbi5leHRyYVBhdGhzJykuc3BsaXQoJzsnKSlcbiAgICBhcmdzID1cbiAgICAgICdleHRyYVBhdGhzJzogZXh0cmFQYXRoc1xuICAgICAgJ3VzZVNuaXBwZXRzJzogYXRvbS5jb25maWcuZ2V0KCdhdXRvY29tcGxldGUtcHl0aG9uLnVzZVNuaXBwZXRzJylcbiAgICAgICdjYXNlSW5zZW5zaXRpdmVDb21wbGV0aW9uJzogYXRvbS5jb25maWcuZ2V0KFxuICAgICAgICAnYXV0b2NvbXBsZXRlLXB5dGhvbi5jYXNlSW5zZW5zaXRpdmVDb21wbGV0aW9uJylcbiAgICAgICdzaG93RGVzY3JpcHRpb25zJzogYXRvbS5jb25maWcuZ2V0KFxuICAgICAgICAnYXV0b2NvbXBsZXRlLXB5dGhvbi5zaG93RGVzY3JpcHRpb25zJylcbiAgICAgICdmdXp6eU1hdGNoZXInOiBhdG9tLmNvbmZpZy5nZXQoJ2F1dG9jb21wbGV0ZS1weXRob24uZnV6enlNYXRjaGVyJylcbiAgICByZXR1cm4gYXJnc1xuXG4gIHNldFNuaXBwZXRzTWFuYWdlcjogKEBzbmlwcGV0c01hbmFnZXIpIC0+XG5cbiAgX2NvbXBsZXRlQXJndW1lbnRzOiAoZWRpdG9yLCBidWZmZXJQb3NpdGlvbiwgZm9yY2UpIC0+XG4gICAgdXNlU25pcHBldHMgPSBhdG9tLmNvbmZpZy5nZXQoJ2F1dG9jb21wbGV0ZS1weXRob24udXNlU25pcHBldHMnKVxuICAgIGlmIG5vdCBmb3JjZSBhbmQgdXNlU25pcHBldHMgPT0gJ25vbmUnXG4gICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2F0b20tdGV4dC1lZGl0b3InKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2F1dG9jb21wbGV0ZS1wbHVzOmFjdGl2YXRlJylcbiAgICAgIHJldHVyblxuICAgIHNjb3BlRGVzY3JpcHRvciA9IGVkaXRvci5zY29wZURlc2NyaXB0b3JGb3JCdWZmZXJQb3NpdGlvbihidWZmZXJQb3NpdGlvbilcbiAgICBzY29wZUNoYWluID0gc2NvcGVEZXNjcmlwdG9yLmdldFNjb3BlQ2hhaW4oKVxuICAgIGRpc2FibGVGb3JTZWxlY3RvciA9IFNlbGVjdG9yLmNyZWF0ZShAZGlzYWJsZUZvclNlbGVjdG9yKVxuICAgIGlmIHNlbGVjdG9yc01hdGNoU2NvcGVDaGFpbihkaXNhYmxlRm9yU2VsZWN0b3IsIHNjb3BlQ2hhaW4pXG4gICAgICBsb2cuZGVidWcgJ0lnbm9yaW5nIGFyZ3VtZW50IGNvbXBsZXRpb24gaW5zaWRlIG9mJywgc2NvcGVDaGFpblxuICAgICAgcmV0dXJuXG5cbiAgICAjIHdlIGRvbid0IHdhbnQgdG8gY29tcGxldGUgYXJndW1lbnRzIGluc2lkZSBvZiBleGlzdGluZyBjb2RlXG4gICAgbGluZXMgPSBlZGl0b3IuZ2V0QnVmZmVyKCkuZ2V0TGluZXMoKVxuICAgIGxpbmUgPSBsaW5lc1tidWZmZXJQb3NpdGlvbi5yb3ddXG4gICAgcHJlZml4ID0gbGluZS5zbGljZShidWZmZXJQb3NpdGlvbi5jb2x1bW4gLSAxLCBidWZmZXJQb3NpdGlvbi5jb2x1bW4pXG4gICAgaWYgcHJlZml4IGlzbnQgJygnXG4gICAgICBsb2cuZGVidWcgJ0lnbm9yaW5nIGFyZ3VtZW50IGNvbXBsZXRpb24gd2l0aCBwcmVmaXgnLCBwcmVmaXhcbiAgICAgIHJldHVyblxuICAgIHN1ZmZpeCA9IGxpbmUuc2xpY2UgYnVmZmVyUG9zaXRpb24uY29sdW1uLCBsaW5lLmxlbmd0aFxuICAgIGlmIG5vdCAvXihcXCkoPzokfFxccyl8XFxzfCQpLy50ZXN0KHN1ZmZpeClcbiAgICAgIGxvZy5kZWJ1ZyAnSWdub3JpbmcgYXJndW1lbnQgY29tcGxldGlvbiB3aXRoIHN1ZmZpeCcsIHN1ZmZpeFxuICAgICAgcmV0dXJuXG5cbiAgICBwYXlsb2FkID1cbiAgICAgIGlkOiBAX2dlbmVyYXRlUmVxdWVzdElkKCdhcmd1bWVudHMnLCBlZGl0b3IsIGJ1ZmZlclBvc2l0aW9uKVxuICAgICAgbG9va3VwOiAnYXJndW1lbnRzJ1xuICAgICAgcGF0aDogZWRpdG9yLmdldFBhdGgoKVxuICAgICAgc291cmNlOiBlZGl0b3IuZ2V0VGV4dCgpXG4gICAgICBsaW5lOiBidWZmZXJQb3NpdGlvbi5yb3dcbiAgICAgIGNvbHVtbjogYnVmZmVyUG9zaXRpb24uY29sdW1uXG4gICAgICBjb25maWc6IEBfZ2VuZXJhdGVSZXF1ZXN0Q29uZmlnKClcblxuICAgIEBfc2VuZFJlcXVlc3QoQF9zZXJpYWxpemUocGF5bG9hZCkpXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlID0+XG4gICAgICBAcmVxdWVzdHNbcGF5bG9hZC5pZF0gPSBlZGl0b3JcblxuICBfZnV6enlGaWx0ZXI6IChjYW5kaWRhdGVzLCBxdWVyeSkgLT5cbiAgICBpZiBjYW5kaWRhdGVzLmxlbmd0aCBpc250IDAgYW5kIHF1ZXJ5IG5vdCBpbiBbJyAnLCAnLicsICcoJ11cbiAgICAgIGZpbHRlciA/PSByZXF1aXJlKCdmdXp6YWxkcmluLXBsdXMnKS5maWx0ZXJcbiAgICAgIGNhbmRpZGF0ZXMgPSBmaWx0ZXIoY2FuZGlkYXRlcywgcXVlcnksIGtleTogJ3RleHQnKVxuICAgIHJldHVybiBjYW5kaWRhdGVzXG5cbiAgZ2V0U3VnZ2VzdGlvbnM6ICh7ZWRpdG9yLCBidWZmZXJQb3NpdGlvbiwgc2NvcGVEZXNjcmlwdG9yLCBwcmVmaXh9KSAtPlxuICAgIGlmIG5vdCBAdHJpZ2dlckNvbXBsZXRpb25SZWdleC50ZXN0KHByZWZpeClcbiAgICAgIHJldHVybiBbXVxuICAgIGJ1ZmZlclBvc2l0aW9uID1cbiAgICAgIHJvdzogYnVmZmVyUG9zaXRpb24ucm93XG4gICAgICBjb2x1bW46IGJ1ZmZlclBvc2l0aW9uLmNvbHVtblxuICAgIGxpbmVzID0gZWRpdG9yLmdldEJ1ZmZlcigpLmdldExpbmVzKClcbiAgICBpZiBhdG9tLmNvbmZpZy5nZXQoJ2F1dG9jb21wbGV0ZS1weXRob24uZnV6enlNYXRjaGVyJylcbiAgICAgICMgd2Ugd2FudCB0byBkbyBvdXIgb3duIGZpbHRlcmluZywgaGlkZSBhbnkgZXhpc3Rpbmcgc3VmZml4IGZyb20gSmVkaVxuICAgICAgbGluZSA9IGxpbmVzW2J1ZmZlclBvc2l0aW9uLnJvd11cbiAgICAgIGxhc3RJZGVudGlmaWVyID0gL1xcLj9bYS16QS1aX11bYS16QS1aMC05X10qJC8uZXhlYyhcbiAgICAgICAgbGluZS5zbGljZSAwLCBidWZmZXJQb3NpdGlvbi5jb2x1bW4pXG4gICAgICBpZiBsYXN0SWRlbnRpZmllclxuICAgICAgICBidWZmZXJQb3NpdGlvbi5jb2x1bW4gPSBsYXN0SWRlbnRpZmllci5pbmRleCArIDFcbiAgICAgICAgbGluZXNbYnVmZmVyUG9zaXRpb24ucm93XSA9IGxpbmUuc2xpY2UoMCwgYnVmZmVyUG9zaXRpb24uY29sdW1uKVxuICAgIHJlcXVlc3RJZCA9IEBfZ2VuZXJhdGVSZXF1ZXN0SWQoXG4gICAgICAnY29tcGxldGlvbnMnLCBlZGl0b3IsIGJ1ZmZlclBvc2l0aW9uLCBsaW5lcy5qb2luKCdcXG4nKSlcbiAgICBpZiByZXF1ZXN0SWQgb2YgQHJlc3BvbnNlc1xuICAgICAgbG9nLmRlYnVnICdVc2luZyBjYWNoZWQgcmVzcG9uc2Ugd2l0aCBJRCcsIHJlcXVlc3RJZFxuICAgICAgIyBXZSBoYXZlIHRvIHBhcnNlIEpTT04gb24gZWFjaCByZXF1ZXN0IGhlcmUgdG8gcGFzcyBvbmx5IGEgY29weVxuICAgICAgbWF0Y2hlcyA9IEpTT04ucGFyc2UoQHJlc3BvbnNlc1tyZXF1ZXN0SWRdWydzb3VyY2UnXSlbJ3Jlc3VsdHMnXVxuICAgICAgaWYgYXRvbS5jb25maWcuZ2V0KCdhdXRvY29tcGxldGUtcHl0aG9uLmZ1enp5TWF0Y2hlcicpXG4gICAgICAgIHJldHVybiBAX2Z1enp5RmlsdGVyKG1hdGNoZXMsIHByZWZpeClcbiAgICAgIGVsc2VcbiAgICAgICAgcmV0dXJuIG1hdGNoZXNcbiAgICBwYXlsb2FkID1cbiAgICAgIGlkOiByZXF1ZXN0SWRcbiAgICAgIHByZWZpeDogcHJlZml4XG4gICAgICBsb29rdXA6ICdjb21wbGV0aW9ucydcbiAgICAgIHBhdGg6IGVkaXRvci5nZXRQYXRoKClcbiAgICAgIHNvdXJjZTogZWRpdG9yLmdldFRleHQoKVxuICAgICAgbGluZTogYnVmZmVyUG9zaXRpb24ucm93XG4gICAgICBjb2x1bW46IGJ1ZmZlclBvc2l0aW9uLmNvbHVtblxuICAgICAgY29uZmlnOiBAX2dlbmVyYXRlUmVxdWVzdENvbmZpZygpXG5cbiAgICBAX3NlbmRSZXF1ZXN0KEBfc2VyaWFsaXplKHBheWxvYWQpKVxuICAgIHJldHVybiBuZXcgUHJvbWlzZSAocmVzb2x2ZSkgPT5cbiAgICAgIGlmIGF0b20uY29uZmlnLmdldCgnYXV0b2NvbXBsZXRlLXB5dGhvbi5mdXp6eU1hdGNoZXInKVxuICAgICAgICBAcmVxdWVzdHNbcGF5bG9hZC5pZF0gPSAobWF0Y2hlcykgPT5cbiAgICAgICAgICByZXNvbHZlKEBfZnV6enlGaWx0ZXIobWF0Y2hlcywgcHJlZml4KSlcbiAgICAgIGVsc2VcbiAgICAgICAgQHJlcXVlc3RzW3BheWxvYWQuaWRdID0gcmVzb2x2ZVxuXG4gIGdldERlZmluaXRpb25zOiAoZWRpdG9yLCBidWZmZXJQb3NpdGlvbikgLT5cbiAgICBwYXlsb2FkID1cbiAgICAgIGlkOiBAX2dlbmVyYXRlUmVxdWVzdElkKCdkZWZpbml0aW9ucycsIGVkaXRvciwgYnVmZmVyUG9zaXRpb24pXG4gICAgICBsb29rdXA6ICdkZWZpbml0aW9ucydcbiAgICAgIHBhdGg6IGVkaXRvci5nZXRQYXRoKClcbiAgICAgIHNvdXJjZTogZWRpdG9yLmdldFRleHQoKVxuICAgICAgbGluZTogYnVmZmVyUG9zaXRpb24ucm93XG4gICAgICBjb2x1bW46IGJ1ZmZlclBvc2l0aW9uLmNvbHVtblxuICAgICAgY29uZmlnOiBAX2dlbmVyYXRlUmVxdWVzdENvbmZpZygpXG5cbiAgICBAX3NlbmRSZXF1ZXN0KEBfc2VyaWFsaXplKHBheWxvYWQpKVxuICAgIHJldHVybiBuZXcgUHJvbWlzZSAocmVzb2x2ZSkgPT5cbiAgICAgIEByZXF1ZXN0c1twYXlsb2FkLmlkXSA9IHJlc29sdmVcblxuICBnZXRVc2FnZXM6IChlZGl0b3IsIGJ1ZmZlclBvc2l0aW9uKSAtPlxuICAgIHBheWxvYWQgPVxuICAgICAgaWQ6IEBfZ2VuZXJhdGVSZXF1ZXN0SWQoJ3VzYWdlcycsIGVkaXRvciwgYnVmZmVyUG9zaXRpb24pXG4gICAgICBsb29rdXA6ICd1c2FnZXMnXG4gICAgICBwYXRoOiBlZGl0b3IuZ2V0UGF0aCgpXG4gICAgICBzb3VyY2U6IGVkaXRvci5nZXRUZXh0KClcbiAgICAgIGxpbmU6IGJ1ZmZlclBvc2l0aW9uLnJvd1xuICAgICAgY29sdW1uOiBidWZmZXJQb3NpdGlvbi5jb2x1bW5cbiAgICAgIGNvbmZpZzogQF9nZW5lcmF0ZVJlcXVlc3RDb25maWcoKVxuXG4gICAgQF9zZW5kUmVxdWVzdChAX3NlcmlhbGl6ZShwYXlsb2FkKSlcbiAgICByZXR1cm4gbmV3IFByb21pc2UgKHJlc29sdmUpID0+XG4gICAgICBAcmVxdWVzdHNbcGF5bG9hZC5pZF0gPSByZXNvbHZlXG5cbiAgZ2V0TWV0aG9kczogKGVkaXRvciwgYnVmZmVyUG9zaXRpb24pIC0+XG4gICAgaW5kZW50ID0gYnVmZmVyUG9zaXRpb24uY29sdW1uXG4gICAgbGluZXMgPSBlZGl0b3IuZ2V0QnVmZmVyKCkuZ2V0TGluZXMoKVxuICAgIGxpbmVzLnNwbGljZShidWZmZXJQb3NpdGlvbi5yb3cgKyAxLCAwLCBcIiAgZGVmIF9fYXV0b2NvbXBsZXRlX3B5dGhvbihzKTpcIilcbiAgICBsaW5lcy5zcGxpY2UoYnVmZmVyUG9zaXRpb24ucm93ICsgMiwgMCwgXCIgICAgcy5cIilcbiAgICBwYXlsb2FkID1cbiAgICAgIGlkOiBAX2dlbmVyYXRlUmVxdWVzdElkKCdtZXRob2RzJywgZWRpdG9yLCBidWZmZXJQb3NpdGlvbilcbiAgICAgIGxvb2t1cDogJ21ldGhvZHMnXG4gICAgICBwYXRoOiBlZGl0b3IuZ2V0UGF0aCgpXG4gICAgICBzb3VyY2U6IGxpbmVzLmpvaW4oJ1xcbicpXG4gICAgICBsaW5lOiBidWZmZXJQb3NpdGlvbi5yb3cgKyAyXG4gICAgICBjb2x1bW46IDZcbiAgICAgIGNvbmZpZzogQF9nZW5lcmF0ZVJlcXVlc3RDb25maWcoKVxuXG4gICAgQF9zZW5kUmVxdWVzdChAX3NlcmlhbGl6ZShwYXlsb2FkKSlcbiAgICByZXR1cm4gbmV3IFByb21pc2UgKHJlc29sdmUpID0+XG4gICAgICBAcmVxdWVzdHNbcGF5bG9hZC5pZF0gPSAobWV0aG9kcykgLT5cbiAgICAgICAgcmVzb2x2ZSh7bWV0aG9kcywgaW5kZW50LCBidWZmZXJQb3NpdGlvbn0pXG5cbiAgZ29Ub0RlZmluaXRpb246IChlZGl0b3IsIGJ1ZmZlclBvc2l0aW9uKSAtPlxuICAgIGlmIG5vdCBlZGl0b3JcbiAgICAgIGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgIGlmIG5vdCBidWZmZXJQb3NpdGlvblxuICAgICAgYnVmZmVyUG9zaXRpb24gPSBlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKVxuICAgIGlmIEBkZWZpbml0aW9uc1ZpZXdcbiAgICAgIEBkZWZpbml0aW9uc1ZpZXcuZGVzdHJveSgpXG4gICAgQGRlZmluaXRpb25zVmlldyA9IG5ldyBEZWZpbml0aW9uc1ZpZXcoKVxuICAgIEBnZXREZWZpbml0aW9ucyhlZGl0b3IsIGJ1ZmZlclBvc2l0aW9uKS50aGVuIChyZXN1bHRzKSA9PlxuICAgICAgQGRlZmluaXRpb25zVmlldy5zZXRJdGVtcyhyZXN1bHRzKVxuICAgICAgaWYgcmVzdWx0cy5sZW5ndGggPT0gMVxuICAgICAgICBAZGVmaW5pdGlvbnNWaWV3LmNvbmZpcm1lZChyZXN1bHRzWzBdKVxuXG4gIGRpc3Bvc2U6IC0+XG4gICAgQGRpc3Bvc2FibGVzLmRpc3Bvc2UoKVxuICAgIGlmIEBwcm92aWRlclxuICAgICAgQHByb3ZpZGVyLmtpbGwoKVxuIl19
