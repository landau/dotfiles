(function() {
  var ATOM_VARIABLES, ColorBuffer, ColorMarkerElement, ColorProject, ColorSearch, CompositeDisposable, Emitter, Palette, PathsLoader, PathsScanner, Range, SERIALIZE_MARKERS_VERSION, SERIALIZE_VERSION, THEME_VARIABLES, VariablesCollection, compareArray, minimatch, scopeFromFileName, _ref,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  _ref = [], ColorBuffer = _ref[0], ColorSearch = _ref[1], Palette = _ref[2], ColorMarkerElement = _ref[3], VariablesCollection = _ref[4], PathsLoader = _ref[5], PathsScanner = _ref[6], Emitter = _ref[7], CompositeDisposable = _ref[8], Range = _ref[9], SERIALIZE_VERSION = _ref[10], SERIALIZE_MARKERS_VERSION = _ref[11], THEME_VARIABLES = _ref[12], ATOM_VARIABLES = _ref[13], scopeFromFileName = _ref[14], minimatch = _ref[15];

  compareArray = function(a, b) {
    var i, v, _i, _len;
    if ((a == null) || (b == null)) {
      return false;
    }
    if (a.length !== b.length) {
      return false;
    }
    for (i = _i = 0, _len = a.length; _i < _len; i = ++_i) {
      v = a[i];
      if (v !== b[i]) {
        return false;
      }
    }
    return true;
  };

  module.exports = ColorProject = (function() {
    ColorProject.deserialize = function(state) {
      var markersVersion, _ref1;
      if (SERIALIZE_VERSION == null) {
        _ref1 = require('./versions'), SERIALIZE_VERSION = _ref1.SERIALIZE_VERSION, SERIALIZE_MARKERS_VERSION = _ref1.SERIALIZE_MARKERS_VERSION;
      }
      markersVersion = SERIALIZE_MARKERS_VERSION;
      if (atom.inDevMode() && atom.project.getPaths().some(function(p) {
        return p.match(/\/pigments$/);
      })) {
        markersVersion += '-dev';
      }
      if ((state != null ? state.version : void 0) !== SERIALIZE_VERSION) {
        state = {};
      }
      if ((state != null ? state.markersVersion : void 0) !== markersVersion) {
        delete state.variables;
        delete state.buffers;
      }
      if (!compareArray(state.globalSourceNames, atom.config.get('pigments.sourceNames')) || !compareArray(state.globalIgnoredNames, atom.config.get('pigments.ignoredNames'))) {
        delete state.variables;
        delete state.buffers;
        delete state.paths;
      }
      return new ColorProject(state);
    };

    function ColorProject(state) {
      var buffers, svgColorExpression, timestamp, variables, _ref1;
      if (state == null) {
        state = {};
      }
      if (Emitter == null) {
        _ref1 = require('atom'), Emitter = _ref1.Emitter, CompositeDisposable = _ref1.CompositeDisposable, Range = _ref1.Range;
      }
      if (VariablesCollection == null) {
        VariablesCollection = require('./variables-collection');
      }
      this.includeThemes = state.includeThemes, this.ignoredNames = state.ignoredNames, this.sourceNames = state.sourceNames, this.ignoredScopes = state.ignoredScopes, this.paths = state.paths, this.searchNames = state.searchNames, this.ignoreGlobalSourceNames = state.ignoreGlobalSourceNames, this.ignoreGlobalIgnoredNames = state.ignoreGlobalIgnoredNames, this.ignoreGlobalIgnoredScopes = state.ignoreGlobalIgnoredScopes, this.ignoreGlobalSearchNames = state.ignoreGlobalSearchNames, this.ignoreGlobalSupportedFiletypes = state.ignoreGlobalSupportedFiletypes, this.supportedFiletypes = state.supportedFiletypes, variables = state.variables, timestamp = state.timestamp, buffers = state.buffers;
      this.emitter = new Emitter;
      this.subscriptions = new CompositeDisposable;
      this.colorBuffersByEditorId = {};
      this.bufferStates = buffers != null ? buffers : {};
      this.variableExpressionsRegistry = require('./variable-expressions');
      this.colorExpressionsRegistry = require('./color-expressions');
      if (variables != null) {
        this.variables = atom.deserializers.deserialize(variables);
      } else {
        this.variables = new VariablesCollection;
      }
      this.subscriptions.add(this.variables.onDidChange((function(_this) {
        return function(results) {
          return _this.emitVariablesChangeEvent(results);
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('pigments.sourceNames', (function(_this) {
        return function() {
          return _this.updatePaths();
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('pigments.ignoredNames', (function(_this) {
        return function() {
          return _this.updatePaths();
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('pigments.ignoredBufferNames', (function(_this) {
        return function(ignoredBufferNames) {
          _this.ignoredBufferNames = ignoredBufferNames;
          return _this.updateColorBuffers();
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('pigments.ignoredScopes', (function(_this) {
        return function() {
          return _this.emitter.emit('did-change-ignored-scopes', _this.getIgnoredScopes());
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('pigments.supportedFiletypes', (function(_this) {
        return function() {
          _this.updateIgnoredFiletypes();
          return _this.emitter.emit('did-change-ignored-scopes', _this.getIgnoredScopes());
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('pigments.markerType', function(type) {
        if (type != null) {
          if (ColorMarkerElement == null) {
            ColorMarkerElement = require('./color-marker-element');
          }
          return ColorMarkerElement.setMarkerType(type);
        }
      }));
      this.subscriptions.add(atom.config.observe('pigments.ignoreVcsIgnoredPaths', (function(_this) {
        return function() {
          return _this.loadPathsAndVariables();
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('pigments.sassShadeAndTintImplementation', (function(_this) {
        return function() {
          return _this.colorExpressionsRegistry.emitter.emit('did-update-expressions', {
            registry: _this.colorExpressionsRegistry
          });
        };
      })(this)));
      svgColorExpression = this.colorExpressionsRegistry.getExpression('pigments:named_colors');
      this.subscriptions.add(atom.config.observe('pigments.filetypesForColorWords', (function(_this) {
        return function(scopes) {
          svgColorExpression.scopes = scopes != null ? scopes : [];
          return _this.colorExpressionsRegistry.emitter.emit('did-update-expressions', {
            name: svgColorExpression.name,
            registry: _this.colorExpressionsRegistry
          });
        };
      })(this)));
      this.subscriptions.add(this.colorExpressionsRegistry.onDidUpdateExpressions((function(_this) {
        return function(_arg) {
          var name;
          name = _arg.name;
          if ((_this.paths == null) || name === 'pigments:variables') {
            return;
          }
          return _this.variables.evaluateVariables(_this.variables.getVariables(), function() {
            var colorBuffer, id, _ref2, _results;
            _ref2 = _this.colorBuffersByEditorId;
            _results = [];
            for (id in _ref2) {
              colorBuffer = _ref2[id];
              _results.push(colorBuffer.update());
            }
            return _results;
          });
        };
      })(this)));
      this.subscriptions.add(this.variableExpressionsRegistry.onDidUpdateExpressions((function(_this) {
        return function() {
          if (_this.paths == null) {
            return;
          }
          return _this.reloadVariablesForPaths(_this.getPaths());
        };
      })(this)));
      if (timestamp != null) {
        this.timestamp = new Date(Date.parse(timestamp));
      }
      this.updateIgnoredFiletypes();
      if (this.paths != null) {
        this.initialize();
      }
      this.initializeBuffers();
    }

    ColorProject.prototype.onDidInitialize = function(callback) {
      return this.emitter.on('did-initialize', callback);
    };

    ColorProject.prototype.onDidDestroy = function(callback) {
      return this.emitter.on('did-destroy', callback);
    };

    ColorProject.prototype.onDidUpdateVariables = function(callback) {
      return this.emitter.on('did-update-variables', callback);
    };

    ColorProject.prototype.onDidCreateColorBuffer = function(callback) {
      return this.emitter.on('did-create-color-buffer', callback);
    };

    ColorProject.prototype.onDidChangeIgnoredScopes = function(callback) {
      return this.emitter.on('did-change-ignored-scopes', callback);
    };

    ColorProject.prototype.onDidChangePaths = function(callback) {
      return this.emitter.on('did-change-paths', callback);
    };

    ColorProject.prototype.observeColorBuffers = function(callback) {
      var colorBuffer, id, _ref1;
      _ref1 = this.colorBuffersByEditorId;
      for (id in _ref1) {
        colorBuffer = _ref1[id];
        callback(colorBuffer);
      }
      return this.onDidCreateColorBuffer(callback);
    };

    ColorProject.prototype.isInitialized = function() {
      return this.initialized;
    };

    ColorProject.prototype.isDestroyed = function() {
      return this.destroyed;
    };

    ColorProject.prototype.initialize = function() {
      if (this.isInitialized()) {
        return Promise.resolve(this.variables.getVariables());
      }
      if (this.initializePromise != null) {
        return this.initializePromise;
      }
      return this.initializePromise = new Promise((function(_this) {
        return function(resolve) {
          return _this.variables.onceInitialized(resolve);
        };
      })(this)).then((function(_this) {
        return function() {
          return _this.loadPathsAndVariables();
        };
      })(this)).then((function(_this) {
        return function() {
          if (_this.includeThemes) {
            return _this.includeThemesVariables();
          }
        };
      })(this)).then((function(_this) {
        return function() {
          var variables;
          _this.initialized = true;
          variables = _this.variables.getVariables();
          _this.emitter.emit('did-initialize', variables);
          return variables;
        };
      })(this));
    };

    ColorProject.prototype.destroy = function() {
      var buffer, id, _ref1;
      if (this.destroyed) {
        return;
      }
      if (PathsScanner == null) {
        PathsScanner = require('./paths-scanner');
      }
      this.destroyed = true;
      PathsScanner.terminateRunningTask();
      _ref1 = this.colorBuffersByEditorId;
      for (id in _ref1) {
        buffer = _ref1[id];
        buffer.destroy();
      }
      this.colorBuffersByEditorId = null;
      this.subscriptions.dispose();
      this.subscriptions = null;
      this.emitter.emit('did-destroy', this);
      return this.emitter.dispose();
    };

    ColorProject.prototype.reload = function() {
      return this.initialize().then((function(_this) {
        return function() {
          _this.variables.reset();
          _this.paths = [];
          return _this.loadPathsAndVariables();
        };
      })(this)).then((function(_this) {
        return function() {
          return atom.notifications.addSuccess("Pigments successfully reloaded", {
            dismissable: true,
            description: "Found:\n- **" + _this.paths.length + "** path(s)\n- **" + (_this.getVariables().length) + "** variables(s) including **" + (_this.getColorVariables().length) + "** color(s)"
          });
        };
      })(this))["catch"](function(reason) {
        var detail, stack;
        detail = reason.message;
        stack = reason.stack;
        atom.notifications.addError("Pigments couldn't be reloaded", {
          detail: detail,
          stack: stack,
          dismissable: true
        });
        return console.error(reason);
      });
    };

    ColorProject.prototype.loadPathsAndVariables = function() {
      var destroyed;
      destroyed = null;
      return this.loadPaths().then((function(_this) {
        return function(_arg) {
          var dirtied, path, removed, _i, _len;
          dirtied = _arg.dirtied, removed = _arg.removed;
          if (removed.length > 0) {
            _this.paths = _this.paths.filter(function(p) {
              return __indexOf.call(removed, p) < 0;
            });
            _this.deleteVariablesForPaths(removed);
          }
          if ((_this.paths != null) && dirtied.length > 0) {
            for (_i = 0, _len = dirtied.length; _i < _len; _i++) {
              path = dirtied[_i];
              if (__indexOf.call(_this.paths, path) < 0) {
                _this.paths.push(path);
              }
            }
            if (_this.variables.length) {
              return dirtied;
            } else {
              return _this.paths;
            }
          } else if (_this.paths == null) {
            return _this.paths = dirtied;
          } else if (!_this.variables.length) {
            return _this.paths;
          } else {
            return [];
          }
        };
      })(this)).then((function(_this) {
        return function(paths) {
          return _this.loadVariablesForPaths(paths);
        };
      })(this)).then((function(_this) {
        return function(results) {
          if (results != null) {
            return _this.variables.updateCollection(results);
          }
        };
      })(this));
    };

    ColorProject.prototype.findAllColors = function() {
      var patterns;
      if (ColorSearch == null) {
        ColorSearch = require('./color-search');
      }
      patterns = this.getSearchNames();
      return new ColorSearch({
        sourceNames: patterns,
        project: this,
        ignoredNames: this.getIgnoredNames(),
        context: this.getContext()
      });
    };

    ColorProject.prototype.setColorPickerAPI = function(colorPickerAPI) {
      this.colorPickerAPI = colorPickerAPI;
    };

    ColorProject.prototype.initializeBuffers = function() {
      return this.subscriptions.add(atom.workspace.observeTextEditors((function(_this) {
        return function(editor) {
          var buffer, bufferElement, editorPath;
          editorPath = editor.getPath();
          if ((editorPath == null) || _this.isBufferIgnored(editorPath)) {
            return;
          }
          buffer = _this.colorBufferForEditor(editor);
          if (buffer != null) {
            bufferElement = atom.views.getView(buffer);
            return bufferElement.attach();
          }
        };
      })(this)));
    };

    ColorProject.prototype.hasColorBufferForEditor = function(editor) {
      if (this.destroyed || (editor == null)) {
        return false;
      }
      return this.colorBuffersByEditorId[editor.id] != null;
    };

    ColorProject.prototype.colorBufferForEditor = function(editor) {
      var buffer, state, subscription;
      if (this.destroyed) {
        return;
      }
      if (editor == null) {
        return;
      }
      if (ColorBuffer == null) {
        ColorBuffer = require('./color-buffer');
      }
      if (this.colorBuffersByEditorId[editor.id] != null) {
        return this.colorBuffersByEditorId[editor.id];
      }
      if (this.bufferStates[editor.id] != null) {
        state = this.bufferStates[editor.id];
        state.editor = editor;
        state.project = this;
        delete this.bufferStates[editor.id];
      } else {
        state = {
          editor: editor,
          project: this
        };
      }
      this.colorBuffersByEditorId[editor.id] = buffer = new ColorBuffer(state);
      this.subscriptions.add(subscription = buffer.onDidDestroy((function(_this) {
        return function() {
          _this.subscriptions.remove(subscription);
          subscription.dispose();
          return delete _this.colorBuffersByEditorId[editor.id];
        };
      })(this)));
      this.emitter.emit('did-create-color-buffer', buffer);
      return buffer;
    };

    ColorProject.prototype.colorBufferForPath = function(path) {
      var colorBuffer, id, _ref1;
      _ref1 = this.colorBuffersByEditorId;
      for (id in _ref1) {
        colorBuffer = _ref1[id];
        if (colorBuffer.editor.getPath() === path) {
          return colorBuffer;
        }
      }
    };

    ColorProject.prototype.updateColorBuffers = function() {
      var buffer, bufferElement, e, editor, id, _i, _len, _ref1, _ref2, _results;
      _ref1 = this.colorBuffersByEditorId;
      for (id in _ref1) {
        buffer = _ref1[id];
        if (this.isBufferIgnored(buffer.editor.getPath())) {
          buffer.destroy();
          delete this.colorBuffersByEditorId[id];
        }
      }
      try {
        if (this.colorBuffersByEditorId != null) {
          _ref2 = atom.workspace.getTextEditors();
          _results = [];
          for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
            editor = _ref2[_i];
            if (this.hasColorBufferForEditor(editor) || this.isBufferIgnored(editor.getPath())) {
              continue;
            }
            buffer = this.colorBufferForEditor(editor);
            if (buffer != null) {
              bufferElement = atom.views.getView(buffer);
              _results.push(bufferElement.attach());
            } else {
              _results.push(void 0);
            }
          }
          return _results;
        }
      } catch (_error) {
        e = _error;
        return console.log(e);
      }
    };

    ColorProject.prototype.isBufferIgnored = function(path) {
      var source, sources, _i, _len, _ref1;
      if (minimatch == null) {
        minimatch = require('minimatch');
      }
      path = atom.project.relativize(path);
      sources = (_ref1 = this.ignoredBufferNames) != null ? _ref1 : [];
      for (_i = 0, _len = sources.length; _i < _len; _i++) {
        source = sources[_i];
        if (minimatch(path, source, {
          matchBase: true,
          dot: true
        })) {
          return true;
        }
      }
      return false;
    };

    ColorProject.prototype.getPaths = function() {
      var _ref1;
      return (_ref1 = this.paths) != null ? _ref1.slice() : void 0;
    };

    ColorProject.prototype.appendPath = function(path) {
      if (path != null) {
        return this.paths.push(path);
      }
    };

    ColorProject.prototype.hasPath = function(path) {
      var _ref1;
      return __indexOf.call((_ref1 = this.paths) != null ? _ref1 : [], path) >= 0;
    };

    ColorProject.prototype.loadPaths = function(noKnownPaths) {
      if (noKnownPaths == null) {
        noKnownPaths = false;
      }
      if (PathsLoader == null) {
        PathsLoader = require('./paths-loader');
      }
      return new Promise((function(_this) {
        return function(resolve, reject) {
          var config, knownPaths, rootPaths, _ref1;
          rootPaths = _this.getRootPaths();
          knownPaths = noKnownPaths ? [] : (_ref1 = _this.paths) != null ? _ref1 : [];
          config = {
            knownPaths: knownPaths,
            timestamp: _this.timestamp,
            ignoredNames: _this.getIgnoredNames(),
            paths: rootPaths,
            traverseIntoSymlinkDirectories: atom.config.get('pigments.traverseIntoSymlinkDirectories'),
            sourceNames: _this.getSourceNames(),
            ignoreVcsIgnores: atom.config.get('pigments.ignoreVcsIgnoredPaths')
          };
          return PathsLoader.startTask(config, function(results) {
            var isDescendentOfRootPaths, p, _i, _len;
            for (_i = 0, _len = knownPaths.length; _i < _len; _i++) {
              p = knownPaths[_i];
              isDescendentOfRootPaths = rootPaths.some(function(root) {
                return p.indexOf(root) === 0;
              });
              if (!isDescendentOfRootPaths) {
                if (results.removed == null) {
                  results.removed = [];
                }
                results.removed.push(p);
              }
            }
            return resolve(results);
          });
        };
      })(this));
    };

    ColorProject.prototype.updatePaths = function() {
      if (!this.initialized) {
        return Promise.resolve();
      }
      return this.loadPaths().then((function(_this) {
        return function(_arg) {
          var dirtied, p, removed, _i, _len;
          dirtied = _arg.dirtied, removed = _arg.removed;
          _this.deleteVariablesForPaths(removed);
          _this.paths = _this.paths.filter(function(p) {
            return __indexOf.call(removed, p) < 0;
          });
          for (_i = 0, _len = dirtied.length; _i < _len; _i++) {
            p = dirtied[_i];
            if (__indexOf.call(_this.paths, p) < 0) {
              _this.paths.push(p);
            }
          }
          _this.emitter.emit('did-change-paths', _this.getPaths());
          return _this.reloadVariablesForPaths(dirtied);
        };
      })(this));
    };

    ColorProject.prototype.isVariablesSourcePath = function(path) {
      var source, sources, _i, _len;
      if (!path) {
        return false;
      }
      if (minimatch == null) {
        minimatch = require('minimatch');
      }
      path = atom.project.relativize(path);
      sources = this.getSourceNames();
      for (_i = 0, _len = sources.length; _i < _len; _i++) {
        source = sources[_i];
        if (minimatch(path, source, {
          matchBase: true,
          dot: true
        })) {
          return true;
        }
      }
    };

    ColorProject.prototype.isIgnoredPath = function(path) {
      var ignore, ignoredNames, _i, _len;
      if (!path) {
        return false;
      }
      if (minimatch == null) {
        minimatch = require('minimatch');
      }
      path = atom.project.relativize(path);
      ignoredNames = this.getIgnoredNames();
      for (_i = 0, _len = ignoredNames.length; _i < _len; _i++) {
        ignore = ignoredNames[_i];
        if (minimatch(path, ignore, {
          matchBase: true,
          dot: true
        })) {
          return true;
        }
      }
    };

    ColorProject.prototype.scopeFromFileName = function(path) {
      var scope;
      if (scopeFromFileName == null) {
        scopeFromFileName = require('./scope-from-file-name');
      }
      scope = scopeFromFileName(path);
      if (scope === 'sass' || scope === 'scss') {
        scope = [scope, this.getSassScopeSuffix()].join(':');
      }
      return scope;
    };

    ColorProject.prototype.getPalette = function() {
      if (Palette == null) {
        Palette = require('./palette');
      }
      if (!this.isInitialized()) {
        return new Palette;
      }
      return new Palette(this.getColorVariables());
    };

    ColorProject.prototype.getContext = function() {
      return this.variables.getContext();
    };

    ColorProject.prototype.getVariables = function() {
      return this.variables.getVariables();
    };

    ColorProject.prototype.getVariableExpressionsRegistry = function() {
      return this.variableExpressionsRegistry;
    };

    ColorProject.prototype.getVariableById = function(id) {
      return this.variables.getVariableById(id);
    };

    ColorProject.prototype.getVariableByName = function(name) {
      return this.variables.getVariableByName(name);
    };

    ColorProject.prototype.getColorVariables = function() {
      return this.variables.getColorVariables();
    };

    ColorProject.prototype.getColorExpressionsRegistry = function() {
      return this.colorExpressionsRegistry;
    };

    ColorProject.prototype.showVariableInFile = function(variable) {
      return atom.workspace.open(variable.path).then(function(editor) {
        var buffer, bufferRange, _ref1;
        if (Range == null) {
          _ref1 = require('atom'), Emitter = _ref1.Emitter, CompositeDisposable = _ref1.CompositeDisposable, Range = _ref1.Range;
        }
        buffer = editor.getBuffer();
        bufferRange = Range.fromObject([buffer.positionForCharacterIndex(variable.range[0]), buffer.positionForCharacterIndex(variable.range[1])]);
        return editor.setSelectedBufferRange(bufferRange, {
          autoscroll: true
        });
      });
    };

    ColorProject.prototype.emitVariablesChangeEvent = function(results) {
      return this.emitter.emit('did-update-variables', results);
    };

    ColorProject.prototype.loadVariablesForPath = function(path) {
      return this.loadVariablesForPaths([path]);
    };

    ColorProject.prototype.loadVariablesForPaths = function(paths) {
      return new Promise((function(_this) {
        return function(resolve, reject) {
          return _this.scanPathsForVariables(paths, function(results) {
            return resolve(results);
          });
        };
      })(this));
    };

    ColorProject.prototype.getVariablesForPath = function(path) {
      return this.variables.getVariablesForPath(path);
    };

    ColorProject.prototype.getVariablesForPaths = function(paths) {
      return this.variables.getVariablesForPaths(paths);
    };

    ColorProject.prototype.deleteVariablesForPath = function(path) {
      return this.deleteVariablesForPaths([path]);
    };

    ColorProject.prototype.deleteVariablesForPaths = function(paths) {
      return this.variables.deleteVariablesForPaths(paths);
    };

    ColorProject.prototype.reloadVariablesForPath = function(path) {
      return this.reloadVariablesForPaths([path]);
    };

    ColorProject.prototype.reloadVariablesForPaths = function(paths) {
      var promise;
      promise = Promise.resolve();
      if (!this.isInitialized()) {
        promise = this.initialize();
      }
      return promise.then((function(_this) {
        return function() {
          if (paths.some(function(path) {
            return __indexOf.call(_this.paths, path) < 0;
          })) {
            return Promise.resolve([]);
          }
          return _this.loadVariablesForPaths(paths);
        };
      })(this)).then((function(_this) {
        return function(results) {
          return _this.variables.updateCollection(results, paths);
        };
      })(this));
    };

    ColorProject.prototype.scanPathsForVariables = function(paths, callback) {
      var colorBuffer;
      if (paths.length === 1 && (colorBuffer = this.colorBufferForPath(paths[0]))) {
        return colorBuffer.scanBufferForVariables().then(function(results) {
          return callback(results);
        });
      } else {
        if (PathsScanner == null) {
          PathsScanner = require('./paths-scanner');
        }
        return PathsScanner.startTask(paths.map((function(_this) {
          return function(p) {
            return [p, _this.scopeFromFileName(p)];
          };
        })(this)), this.variableExpressionsRegistry, function(results) {
          return callback(results);
        });
      }
    };

    ColorProject.prototype.loadThemesVariables = function() {
      var div, html, iterator, variables;
      if (THEME_VARIABLES == null) {
        THEME_VARIABLES = require('./uris').THEME_VARIABLES;
      }
      if (ATOM_VARIABLES == null) {
        ATOM_VARIABLES = require('./atom-variables');
      }
      iterator = 0;
      variables = [];
      html = '';
      ATOM_VARIABLES.forEach(function(v) {
        return html += "<div class='" + v + "'>" + v + "</div>";
      });
      div = document.createElement('div');
      div.className = 'pigments-sampler';
      div.innerHTML = html;
      document.body.appendChild(div);
      ATOM_VARIABLES.forEach(function(v, i) {
        var color, end, node, variable;
        node = div.children[i];
        color = getComputedStyle(node).color;
        end = iterator + v.length + color.length + 4;
        variable = {
          name: "@" + v,
          line: i,
          value: color,
          range: [iterator, end],
          path: THEME_VARIABLES
        };
        iterator = end;
        return variables.push(variable);
      });
      document.body.removeChild(div);
      return variables;
    };

    ColorProject.prototype.getRootPaths = function() {
      return atom.project.getPaths();
    };

    ColorProject.prototype.getSassScopeSuffix = function() {
      var _ref1, _ref2;
      return (_ref1 = (_ref2 = this.sassShadeAndTintImplementation) != null ? _ref2 : atom.config.get('pigments.sassShadeAndTintImplementation')) != null ? _ref1 : 'compass';
    };

    ColorProject.prototype.setSassShadeAndTintImplementation = function(sassShadeAndTintImplementation) {
      this.sassShadeAndTintImplementation = sassShadeAndTintImplementation;
      return this.colorExpressionsRegistry.emitter.emit('did-update-expressions', {
        registry: this.colorExpressionsRegistry
      });
    };

    ColorProject.prototype.getSourceNames = function() {
      var names, _ref1, _ref2;
      names = ['.pigments'];
      names = names.concat((_ref1 = this.sourceNames) != null ? _ref1 : []);
      if (!this.ignoreGlobalSourceNames) {
        names = names.concat((_ref2 = atom.config.get('pigments.sourceNames')) != null ? _ref2 : []);
      }
      return names;
    };

    ColorProject.prototype.setSourceNames = function(sourceNames) {
      this.sourceNames = sourceNames != null ? sourceNames : [];
      if ((this.initialized == null) && (this.initializePromise == null)) {
        return;
      }
      return this.initialize().then((function(_this) {
        return function() {
          return _this.loadPathsAndVariables(true);
        };
      })(this));
    };

    ColorProject.prototype.setIgnoreGlobalSourceNames = function(ignoreGlobalSourceNames) {
      this.ignoreGlobalSourceNames = ignoreGlobalSourceNames;
      return this.updatePaths();
    };

    ColorProject.prototype.getSearchNames = function() {
      var names, _ref1, _ref2, _ref3, _ref4;
      names = [];
      names = names.concat((_ref1 = this.sourceNames) != null ? _ref1 : []);
      names = names.concat((_ref2 = this.searchNames) != null ? _ref2 : []);
      if (!this.ignoreGlobalSearchNames) {
        names = names.concat((_ref3 = atom.config.get('pigments.sourceNames')) != null ? _ref3 : []);
        names = names.concat((_ref4 = atom.config.get('pigments.extendedSearchNames')) != null ? _ref4 : []);
      }
      return names;
    };

    ColorProject.prototype.setSearchNames = function(searchNames) {
      this.searchNames = searchNames != null ? searchNames : [];
    };

    ColorProject.prototype.setIgnoreGlobalSearchNames = function(ignoreGlobalSearchNames) {
      this.ignoreGlobalSearchNames = ignoreGlobalSearchNames;
    };

    ColorProject.prototype.getIgnoredNames = function() {
      var names, _ref1, _ref2, _ref3;
      names = (_ref1 = this.ignoredNames) != null ? _ref1 : [];
      if (!this.ignoreGlobalIgnoredNames) {
        names = names.concat((_ref2 = this.getGlobalIgnoredNames()) != null ? _ref2 : []);
        names = names.concat((_ref3 = atom.config.get('core.ignoredNames')) != null ? _ref3 : []);
      }
      return names;
    };

    ColorProject.prototype.getGlobalIgnoredNames = function() {
      var _ref1;
      return (_ref1 = atom.config.get('pigments.ignoredNames')) != null ? _ref1.map(function(p) {
        if (/\/\*$/.test(p)) {
          return p + '*';
        } else {
          return p;
        }
      }) : void 0;
    };

    ColorProject.prototype.setIgnoredNames = function(ignoredNames) {
      this.ignoredNames = ignoredNames != null ? ignoredNames : [];
      if ((this.initialized == null) && (this.initializePromise == null)) {
        return Promise.reject('Project is not initialized yet');
      }
      return this.initialize().then((function(_this) {
        return function() {
          var dirtied;
          dirtied = _this.paths.filter(function(p) {
            return _this.isIgnoredPath(p);
          });
          _this.deleteVariablesForPaths(dirtied);
          _this.paths = _this.paths.filter(function(p) {
            return !_this.isIgnoredPath(p);
          });
          return _this.loadPathsAndVariables(true);
        };
      })(this));
    };

    ColorProject.prototype.setIgnoreGlobalIgnoredNames = function(ignoreGlobalIgnoredNames) {
      this.ignoreGlobalIgnoredNames = ignoreGlobalIgnoredNames;
      return this.updatePaths();
    };

    ColorProject.prototype.getIgnoredScopes = function() {
      var scopes, _ref1, _ref2;
      scopes = (_ref1 = this.ignoredScopes) != null ? _ref1 : [];
      if (!this.ignoreGlobalIgnoredScopes) {
        scopes = scopes.concat((_ref2 = atom.config.get('pigments.ignoredScopes')) != null ? _ref2 : []);
      }
      scopes = scopes.concat(this.ignoredFiletypes);
      return scopes;
    };

    ColorProject.prototype.setIgnoredScopes = function(ignoredScopes) {
      this.ignoredScopes = ignoredScopes != null ? ignoredScopes : [];
      return this.emitter.emit('did-change-ignored-scopes', this.getIgnoredScopes());
    };

    ColorProject.prototype.setIgnoreGlobalIgnoredScopes = function(ignoreGlobalIgnoredScopes) {
      this.ignoreGlobalIgnoredScopes = ignoreGlobalIgnoredScopes;
      return this.emitter.emit('did-change-ignored-scopes', this.getIgnoredScopes());
    };

    ColorProject.prototype.setSupportedFiletypes = function(supportedFiletypes) {
      this.supportedFiletypes = supportedFiletypes != null ? supportedFiletypes : [];
      this.updateIgnoredFiletypes();
      return this.emitter.emit('did-change-ignored-scopes', this.getIgnoredScopes());
    };

    ColorProject.prototype.updateIgnoredFiletypes = function() {
      return this.ignoredFiletypes = this.getIgnoredFiletypes();
    };

    ColorProject.prototype.getIgnoredFiletypes = function() {
      var filetypes, scopes, _ref1, _ref2;
      filetypes = (_ref1 = this.supportedFiletypes) != null ? _ref1 : [];
      if (!this.ignoreGlobalSupportedFiletypes) {
        filetypes = filetypes.concat((_ref2 = atom.config.get('pigments.supportedFiletypes')) != null ? _ref2 : []);
      }
      if (filetypes.length === 0) {
        filetypes = ['*'];
      }
      if (filetypes.some(function(type) {
        return type === '*';
      })) {
        return [];
      }
      scopes = filetypes.map(function(ext) {
        var _ref3;
        return (_ref3 = atom.grammars.selectGrammar("file." + ext)) != null ? _ref3.scopeName.replace(/\./g, '\\.') : void 0;
      }).filter(function(scope) {
        return scope != null;
      });
      return ["^(?!\\.(" + (scopes.join('|')) + "))"];
    };

    ColorProject.prototype.setIgnoreGlobalSupportedFiletypes = function(ignoreGlobalSupportedFiletypes) {
      this.ignoreGlobalSupportedFiletypes = ignoreGlobalSupportedFiletypes;
      this.updateIgnoredFiletypes();
      return this.emitter.emit('did-change-ignored-scopes', this.getIgnoredScopes());
    };

    ColorProject.prototype.themesIncluded = function() {
      return this.includeThemes;
    };

    ColorProject.prototype.setIncludeThemes = function(includeThemes) {
      if (includeThemes === this.includeThemes) {
        return Promise.resolve();
      }
      this.includeThemes = includeThemes;
      if (this.includeThemes) {
        return this.includeThemesVariables();
      } else {
        return this.disposeThemesVariables();
      }
    };

    ColorProject.prototype.includeThemesVariables = function() {
      this.themesSubscription = atom.themes.onDidChangeActiveThemes((function(_this) {
        return function() {
          var variables;
          if (!_this.includeThemes) {
            return;
          }
          if (THEME_VARIABLES == null) {
            THEME_VARIABLES = require('./uris').THEME_VARIABLES;
          }
          variables = _this.loadThemesVariables();
          return _this.variables.updatePathCollection(THEME_VARIABLES, variables);
        };
      })(this));
      this.subscriptions.add(this.themesSubscription);
      return this.variables.addMany(this.loadThemesVariables());
    };

    ColorProject.prototype.disposeThemesVariables = function() {
      if (THEME_VARIABLES == null) {
        THEME_VARIABLES = require('./uris').THEME_VARIABLES;
      }
      this.subscriptions.remove(this.themesSubscription);
      this.variables.deleteVariablesForPaths([THEME_VARIABLES]);
      return this.themesSubscription.dispose();
    };

    ColorProject.prototype.getTimestamp = function() {
      return new Date();
    };

    ColorProject.prototype.serialize = function() {
      var data, _ref1;
      if (SERIALIZE_VERSION == null) {
        _ref1 = require('./versions'), SERIALIZE_VERSION = _ref1.SERIALIZE_VERSION, SERIALIZE_MARKERS_VERSION = _ref1.SERIALIZE_MARKERS_VERSION;
      }
      data = {
        deserializer: 'ColorProject',
        timestamp: this.getTimestamp(),
        version: SERIALIZE_VERSION,
        markersVersion: SERIALIZE_MARKERS_VERSION,
        globalSourceNames: atom.config.get('pigments.sourceNames'),
        globalIgnoredNames: atom.config.get('pigments.ignoredNames')
      };
      if (this.ignoreGlobalSourceNames != null) {
        data.ignoreGlobalSourceNames = this.ignoreGlobalSourceNames;
      }
      if (this.ignoreGlobalSearchNames != null) {
        data.ignoreGlobalSearchNames = this.ignoreGlobalSearchNames;
      }
      if (this.ignoreGlobalIgnoredNames != null) {
        data.ignoreGlobalIgnoredNames = this.ignoreGlobalIgnoredNames;
      }
      if (this.ignoreGlobalIgnoredScopes != null) {
        data.ignoreGlobalIgnoredScopes = this.ignoreGlobalIgnoredScopes;
      }
      if (this.includeThemes != null) {
        data.includeThemes = this.includeThemes;
      }
      if (this.ignoredScopes != null) {
        data.ignoredScopes = this.ignoredScopes;
      }
      if (this.ignoredNames != null) {
        data.ignoredNames = this.ignoredNames;
      }
      if (this.sourceNames != null) {
        data.sourceNames = this.sourceNames;
      }
      if (this.searchNames != null) {
        data.searchNames = this.searchNames;
      }
      data.buffers = this.serializeBuffers();
      if (this.isInitialized()) {
        data.paths = this.paths;
        data.variables = this.variables.serialize();
      }
      return data;
    };

    ColorProject.prototype.serializeBuffers = function() {
      var colorBuffer, id, out, _ref1;
      out = {};
      _ref1 = this.colorBuffersByEditorId;
      for (id in _ref1) {
        colorBuffer = _ref1[id];
        out[id] = colorBuffer.serialize();
      }
      return out;
    };

    return ColorProject;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvcGlnbWVudHMvbGliL2NvbG9yLXByb2plY3QuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHlSQUFBO0lBQUEscUpBQUE7O0FBQUEsRUFBQSxPQVFJLEVBUkosRUFDRSxxQkFERixFQUNlLHFCQURmLEVBRUUsaUJBRkYsRUFFVyw0QkFGWCxFQUUrQiw2QkFGL0IsRUFHRSxxQkFIRixFQUdlLHNCQUhmLEVBSUUsaUJBSkYsRUFJVyw2QkFKWCxFQUlnQyxlQUpoQyxFQUtFLDRCQUxGLEVBS3FCLG9DQUxyQixFQUtnRCwwQkFMaEQsRUFLaUUseUJBTGpFLEVBTUUsNEJBTkYsRUFPRSxvQkFQRixDQUFBOztBQUFBLEVBVUEsWUFBQSxHQUFlLFNBQUMsQ0FBRCxFQUFHLENBQUgsR0FBQTtBQUNiLFFBQUEsY0FBQTtBQUFBLElBQUEsSUFBb0IsV0FBSixJQUFjLFdBQTlCO0FBQUEsYUFBTyxLQUFQLENBQUE7S0FBQTtBQUNBLElBQUEsSUFBb0IsQ0FBQyxDQUFDLE1BQUYsS0FBWSxDQUFDLENBQUMsTUFBbEM7QUFBQSxhQUFPLEtBQVAsQ0FBQTtLQURBO0FBRUEsU0FBQSxnREFBQTtlQUFBO1VBQStCLENBQUEsS0FBTyxDQUFFLENBQUEsQ0FBQTtBQUF4QyxlQUFPLEtBQVA7T0FBQTtBQUFBLEtBRkE7QUFHQSxXQUFPLElBQVAsQ0FKYTtFQUFBLENBVmYsQ0FBQTs7QUFBQSxFQWdCQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ0osSUFBQSxZQUFDLENBQUEsV0FBRCxHQUFjLFNBQUMsS0FBRCxHQUFBO0FBQ1osVUFBQSxxQkFBQTtBQUFBLE1BQUEsSUFBTyx5QkFBUDtBQUNFLFFBQUEsUUFBaUQsT0FBQSxDQUFRLFlBQVIsQ0FBakQsRUFBQywwQkFBQSxp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

//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/pigments/lib/color-project.coffee
