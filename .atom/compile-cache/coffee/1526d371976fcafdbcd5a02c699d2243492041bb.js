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
