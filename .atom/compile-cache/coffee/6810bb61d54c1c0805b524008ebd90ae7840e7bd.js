(function() {
  var ATOM_VARIABLES, ColorBuffer, ColorContext, ColorMarkerElement, ColorProject, ColorSearch, CompositeDisposable, Emitter, Palette, PathsLoader, PathsScanner, Range, SERIALIZE_MARKERS_VERSION, SERIALIZE_VERSION, THEME_VARIABLES, VariablesCollection, compareArray, minimatch, _ref, _ref1,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  minimatch = require('minimatch');

  _ref = require('atom'), Emitter = _ref.Emitter, CompositeDisposable = _ref.CompositeDisposable, Range = _ref.Range;

  _ref1 = require('./versions'), SERIALIZE_VERSION = _ref1.SERIALIZE_VERSION, SERIALIZE_MARKERS_VERSION = _ref1.SERIALIZE_MARKERS_VERSION;

  THEME_VARIABLES = require('./uris').THEME_VARIABLES;

  ColorBuffer = require('./color-buffer');

  ColorContext = require('./color-context');

  ColorSearch = require('./color-search');

  Palette = require('./palette');

  PathsLoader = require('./paths-loader');

  PathsScanner = require('./paths-scanner');

  ColorMarkerElement = require('./color-marker-element');

  VariablesCollection = require('./variables-collection');

  ATOM_VARIABLES = ['text-color', 'text-color-subtle', 'text-color-highlight', 'text-color-selected', 'text-color-info', 'text-color-success', 'text-color-warning', 'text-color-error', 'background-color-info', 'background-color-success', 'background-color-warning', 'background-color-error', 'background-color-highlight', 'background-color-selected', 'app-background-color', 'base-background-color', 'base-border-color', 'pane-item-background-color', 'pane-item-border-color', 'input-background-color', 'input-border-color', 'tool-panel-background-color', 'tool-panel-border-color', 'inset-panel-background-color', 'inset-panel-border-color', 'panel-heading-background-color', 'panel-heading-border-color', 'overlay-background-color', 'overlay-border-color', 'button-background-color', 'button-background-color-hover', 'button-background-color-selected', 'button-border-color', 'tab-bar-background-color', 'tab-bar-border-color', 'tab-background-color', 'tab-background-color-active', 'tab-border-color', 'tree-view-background-color', 'tree-view-border-color', 'ui-site-color-1', 'ui-site-color-2', 'ui-site-color-3', 'ui-site-color-4', 'ui-site-color-5', 'syntax-text-color', 'syntax-cursor-color', 'syntax-selection-color', 'syntax-background-color', 'syntax-wrap-guide-color', 'syntax-indent-guide-color', 'syntax-invisible-character-color', 'syntax-result-marker-color', 'syntax-result-marker-color-selected', 'syntax-gutter-text-color', 'syntax-gutter-text-color-selected', 'syntax-gutter-background-color', 'syntax-gutter-background-color-selected', 'syntax-color-renamed', 'syntax-color-added', 'syntax-color-modified', 'syntax-color-removed'];

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
      var markersVersion;
      markersVersion = SERIALIZE_MARKERS_VERSION;
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
      var buffers, defaultScopes, includeThemes, svgColorExpression, timestamp, variables;
      if (state == null) {
        state = {};
      }
      includeThemes = state.includeThemes, this.ignoredNames = state.ignoredNames, this.sourceNames = state.sourceNames, this.ignoredScopes = state.ignoredScopes, this.paths = state.paths, this.searchNames = state.searchNames, this.ignoreGlobalSourceNames = state.ignoreGlobalSourceNames, this.ignoreGlobalIgnoredNames = state.ignoreGlobalIgnoredNames, this.ignoreGlobalIgnoredScopes = state.ignoreGlobalIgnoredScopes, this.ignoreGlobalSearchNames = state.ignoreGlobalSearchNames, this.ignoreGlobalSupportedFiletypes = state.ignoreGlobalSupportedFiletypes, this.supportedFiletypes = state.supportedFiletypes, variables = state.variables, timestamp = state.timestamp, buffers = state.buffers;
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
          return ColorMarkerElement.setMarkerType(type);
        }
      }));
      this.subscriptions.add(atom.config.observe('pigments.ignoreVcsIgnoredPaths', (function(_this) {
        return function() {
          return _this.loadPathsAndVariables();
        };
      })(this)));
      svgColorExpression = this.colorExpressionsRegistry.getExpression('pigments:named_colors');
      defaultScopes = svgColorExpression.scopes.slice();
      this.subscriptions.add(atom.config.observe('pigments.extendedFiletypesForColorWords', (function(_this) {
        return function(scopes) {
          svgColorExpression.scopes = defaultScopes.concat(scopes);
          return _this.colorExpressionsRegistry.emitter.emit('did-update-expressions', {
            name: svgColorExpression.name,
            registry: _this.colorExpressionsRegistry
          });
        };
      })(this)));
      this.subscriptions.add(this.colorExpressionsRegistry.onDidUpdateExpressions((function(_this) {
        return function(_arg) {
          var colorBuffer, id, name, _ref2, _results;
          name = _arg.name;
          if ((_this.paths == null) || name === 'pigments:variables') {
            return;
          }
          _this.variables.evaluateVariables(_this.variables.getVariables());
          _ref2 = _this.colorBuffersByEditorId;
          _results = [];
          for (id in _ref2) {
            colorBuffer = _ref2[id];
            _results.push(colorBuffer.update());
          }
          return _results;
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
      if (includeThemes) {
        this.setIncludeThemes(includeThemes);
      }
      this.updateIgnoredFiletypes();
      if ((this.paths != null) && (this.variables.length != null)) {
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
      var colorBuffer, id, _ref2;
      _ref2 = this.colorBuffersByEditorId;
      for (id in _ref2) {
        colorBuffer = _ref2[id];
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
      return this.initializePromise = this.loadPathsAndVariables().then((function(_this) {
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
      var buffer, id, _ref2;
      if (this.destroyed) {
        return;
      }
      this.destroyed = true;
      PathsScanner.terminateRunningTask();
      _ref2 = this.colorBuffersByEditorId;
      for (id in _ref2) {
        buffer = _ref2[id];
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
      patterns = this.getSearchNames();
      return new ColorSearch({
        sourceNames: patterns,
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
          var buffer, bufferElement;
          if (_this.isBufferIgnored(editor.getPath())) {
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
      var colorBuffer, id, _ref2;
      _ref2 = this.colorBuffersByEditorId;
      for (id in _ref2) {
        colorBuffer = _ref2[id];
        if (colorBuffer.editor.getPath() === path) {
          return colorBuffer;
        }
      }
    };

    ColorProject.prototype.updateColorBuffers = function() {
      var buffer, bufferElement, e, editor, id, _i, _len, _ref2, _ref3, _results;
      _ref2 = this.colorBuffersByEditorId;
      for (id in _ref2) {
        buffer = _ref2[id];
        if (this.isBufferIgnored(buffer.editor.getPath())) {
          buffer.destroy();
          delete this.colorBuffersByEditorId[id];
        }
      }
      try {
        if (this.colorBuffersByEditorId != null) {
          _ref3 = atom.workspace.getTextEditors();
          _results = [];
          for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
            editor = _ref3[_i];
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
      var source, sources, _i, _len, _ref2;
      path = atom.project.relativize(path);
      sources = (_ref2 = this.ignoredBufferNames) != null ? _ref2 : [];
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
      var _ref2;
      return (_ref2 = this.paths) != null ? _ref2.slice() : void 0;
    };

    ColorProject.prototype.appendPath = function(path) {
      if (path != null) {
        return this.paths.push(path);
      }
    };

    ColorProject.prototype.hasPath = function(path) {
      var _ref2;
      return __indexOf.call((_ref2 = this.paths) != null ? _ref2 : [], path) >= 0;
    };

    ColorProject.prototype.loadPaths = function(noKnownPaths) {
      if (noKnownPaths == null) {
        noKnownPaths = false;
      }
      return new Promise((function(_this) {
        return function(resolve, reject) {
          var config, knownPaths, rootPaths, _ref2;
          rootPaths = _this.getRootPaths();
          knownPaths = noKnownPaths ? [] : (_ref2 = _this.paths) != null ? _ref2 : [];
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

    ColorProject.prototype.getPalette = function() {
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
        var buffer, bufferRange;
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
        return PathsScanner.startTask(paths, this.variableExpressionsRegistry, function(results) {
          return callback(results);
        });
      }
    };

    ColorProject.prototype.loadThemesVariables = function() {
      var div, html, iterator, variables;
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

    ColorProject.prototype.getSourceNames = function() {
      var names, _ref2, _ref3;
      names = ['.pigments'];
      names = names.concat((_ref2 = this.sourceNames) != null ? _ref2 : []);
      if (!this.ignoreGlobalSourceNames) {
        names = names.concat((_ref3 = atom.config.get('pigments.sourceNames')) != null ? _ref3 : []);
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
      var names, _ref2, _ref3, _ref4, _ref5;
      names = [];
      names = names.concat((_ref2 = this.sourceNames) != null ? _ref2 : []);
      names = names.concat((_ref3 = this.searchNames) != null ? _ref3 : []);
      if (!this.ignoreGlobalSearchNames) {
        names = names.concat((_ref4 = atom.config.get('pigments.sourceNames')) != null ? _ref4 : []);
        names = names.concat((_ref5 = atom.config.get('pigments.extendedSearchNames')) != null ? _ref5 : []);
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
      var names, _ref2, _ref3, _ref4;
      names = (_ref2 = this.ignoredNames) != null ? _ref2 : [];
      if (!this.ignoreGlobalIgnoredNames) {
        names = names.concat((_ref3 = this.getGlobalIgnoredNames()) != null ? _ref3 : []);
        names = names.concat((_ref4 = atom.config.get('core.ignoredNames')) != null ? _ref4 : []);
      }
      return names;
    };

    ColorProject.prototype.getGlobalIgnoredNames = function() {
      var _ref2;
      return (_ref2 = atom.config.get('pigments.ignoredNames')) != null ? _ref2.map(function(p) {
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
      var scopes, _ref2, _ref3;
      scopes = (_ref2 = this.ignoredScopes) != null ? _ref2 : [];
      if (!this.ignoreGlobalIgnoredScopes) {
        scopes = scopes.concat((_ref3 = atom.config.get('pigments.ignoredScopes')) != null ? _ref3 : []);
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
      var filetypes, scopes, _ref2, _ref3;
      filetypes = (_ref2 = this.supportedFiletypes) != null ? _ref2 : [];
      if (!this.ignoreGlobalSupportedFiletypes) {
        filetypes = filetypes.concat((_ref3 = atom.config.get('pigments.supportedFiletypes')) != null ? _ref3 : []);
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
        var _ref4;
        return (_ref4 = atom.grammars.selectGrammar("file." + ext)) != null ? _ref4.scopeName.replace(/\./g, '\\.') : void 0;
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
        this.themesSubscription = atom.themes.onDidChangeActiveThemes((function(_this) {
          return function() {
            var variables;
            if (!_this.includeThemes) {
              return;
            }
            variables = _this.loadThemesVariables();
            return _this.variables.updatePathCollection(THEME_VARIABLES, variables);
          };
        })(this));
        this.subscriptions.add(this.themesSubscription);
        return this.variables.addMany(this.loadThemesVariables());
      } else {
        this.subscriptions.remove(this.themesSubscription);
        this.variables.deleteVariablesForPaths([THEME_VARIABLES]);
        return this.themesSubscription.dispose();
      }
    };

    ColorProject.prototype.getTimestamp = function() {
      return new Date();
    };

    ColorProject.prototype.serialize = function() {
      var data;
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
      var colorBuffer, id, out, _ref2;
      out = {};
      _ref2 = this.colorBuffersByEditorId;
      for (id in _ref2) {
        colorBuffer = _ref2[id];
        out[id] = colorBuffer.serialize();
      }
      return out;
    };

    return ColorProject;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvcGlnbWVudHMvbGliL2NvbG9yLXByb2plY3QuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDJSQUFBO0lBQUEscUpBQUE7O0FBQUEsRUFBQSxTQUFBLEdBQVksT0FBQSxDQUFRLFdBQVIsQ0FBWixDQUFBOztBQUFBLEVBQ0EsT0FBd0MsT0FBQSxDQUFRLE1BQVIsQ0FBeEMsRUFBQyxlQUFBLE9BQUQsRUFBVSwyQkFBQSxtQkFBVixFQUErQixhQUFBLEtBRC9CLENBQUE7O0FBQUEsRUFHQSxRQUFpRCxPQUFBLENBQVEsWUFBUixDQUFqRCxFQUFDLDBCQUFBLGlCQUFELEVBQW9CLGtDQUFBLHlCQUhwQixDQUFBOztBQUFBLEVBSUMsa0JBQW1CLE9BQUEsQ0FBUSxRQUFSLEVBQW5CLGVBSkQsQ0FBQTs7QUFBQSxFQUtBLFdBQUEsR0FBYyxPQUFBLENBQVEsZ0JBQVIsQ0FMZCxDQUFBOztBQUFBLEVBTUEsWUFBQSxHQUFlLE9BQUEsQ0FBUSxpQkFBUixDQU5mLENBQUE7O0FBQUEsRUFPQSxXQUFBLEdBQWMsT0FBQSxDQUFRLGdCQUFSLENBUGQsQ0FBQTs7QUFBQSxFQVFBLE9BQUEsR0FBVSxPQUFBLENBQVEsV0FBUixDQVJWLENBQUE7O0FBQUEsRUFTQSxXQUFBLEdBQWMsT0FBQSxDQUFRLGdCQUFSLENBVGQsQ0FBQTs7QUFBQSxFQVVBLFlBQUEsR0FBZSxPQUFBLENBQVEsaUJBQVIsQ0FWZixDQUFBOztBQUFBLEVBV0Esa0JBQUEsR0FBcUIsT0FBQSxDQUFRLHdCQUFSLENBWHJCLENBQUE7O0FBQUEsRUFZQSxtQkFBQSxHQUFzQixPQUFBLENBQVEsd0JBQVIsQ0FadEIsQ0FBQTs7QUFBQSxFQWNBLGNBQUEsR0FBaUIsQ0FDZixZQURlLEVBRWYsbUJBRmUsRUFHZixzQkFIZSxFQUlmLHFCQUplLEVBS2YsaUJBTGUsRUFNZixvQkFOZSxFQU9mLG9CQVBlLEVBUWYsa0JBUmUsRUFTZix1QkFUZSxFQVVmLDBCQVZlLEVBV2YsMEJBWGUsRUFZZix3QkFaZSxFQWFmLDRCQWJlLEVBY2YsMkJBZGUsRUFlZixzQkFmZSxFQWdCZix1QkFoQmUsRUFpQmYsbUJBakJlLEVBa0JmLDRCQWxCZSxFQW1CZix3QkFuQmUsRUFvQmYsd0JBcEJlLEVBcUJmLG9CQXJCZSxFQXNCZiw2QkF0QmUsRUF1QmYseUJBdkJlLEVBd0JmLDhCQXhCZSxFQXlCZiwwQkF6QmUsRUEwQmYsZ0NBMUJlLEVBMkJmLDRCQTNCZSxFQTRCZiwwQkE1QmUsRUE2QmYsc0JBN0JlLEVBOEJmLHlCQTlCZSxFQStCZiwrQkEvQmUsRUFnQ2Ysa0NBaENlLEVBaUNmLHFCQWpDZSxFQWtDZiwwQkFsQ2UsRUFtQ2Ysc0JBbkNlLEVBb0NmLHNCQXBDZSxFQXFDZiw2QkFyQ2UsRUFzQ2Ysa0JBdENlLEVBdUNmLDRCQXZDZSxFQXdDZix3QkF4Q2UsRUF5Q2YsaUJBekNlLEVBMENmLGlCQTFDZSxFQTJDZixpQkEzQ2UsRUE0Q2YsaUJBNUNlLEVBNkNmLGlCQTdDZSxFQThDZixtQkE5Q2UsRUErQ2YscUJBL0NlLEVBZ0RmLHdCQWhEZSxFQWlEZix5QkFqRGUsRUFrRGYseUJBbERlLEVBbURmLDJCQW5EZSxFQW9EZixrQ0FwRGUsRUFxRGYsNEJBckRlLEVBc0RmLHFDQXREZSxFQXVEZiwwQkF2RGUsRUF3RGYsbUNBeERlLEVBeURmLGdDQXpEZSxFQTBEZix5Q0ExRGUsRUEyRGYsc0JBM0RlLEVBNERmLG9CQTVEZSxFQTZEZix1QkE3RGUsRUE4RGYsc0JBOURlLENBZGpCLENBQUE7O0FBQUEsRUErRUEsWUFBQSxHQUFlLFNBQUMsQ0FBRCxFQUFHLENBQUgsR0FBQTtBQUNiLFFBQUEsY0FBQTtBQUFBLElBQUEsSUFBb0IsV0FBSixJQUFjLFdBQTlCO0FBQUEsYUFBTyxLQUFQLENBQUE7S0FBQTtBQUNBLElBQUEsSUFBb0IsQ0FBQyxDQUFDLE1BQUYsS0FBWSxDQUFDLENBQUMsTUFBbEM7QUFBQSxhQUFPLEtBQVAsQ0FBQTtLQURBO0FBRUEsU0FBQSxnREFBQTtlQUFBO1VBQStCLENBQUEsS0FBTyxDQUFFLENBQUEsQ0FBQTtBQUF4QyxlQUFPLEtBQVA7T0FBQTtBQUFBLEtBRkE7QUFHQSxXQUFPLElBQVAsQ0FKYTtFQUFBLENBL0VmLENBQUE7O0FBQUEsRUFxRkEsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNKLElBQUEsWUFBQyxDQUFBLFdBQUQsR0FBYyxTQUFDLEtBQUQsR0FBQTtBQUNaLFVBQUEsY0FBQTtBQUFBLE1BQUEsY0FBQSxHQUFpQix5QkFBakIsQ0FBQTtBQUNBLE1BQUEscUJBQUcsS0FBSyxDQUFFLGlCQUFQLEtBQW9CLGlCQUF2QjtBQUNFLFFBQUEsS0FBQSxHQUFRLEVBQVIsQ0FERjtPQURBO0FBSUEsTUFBQSxxQkFBRyxLQUFLLENBQUUsd0JBQVAsS0FBMkIsY0FBOUI7QUFDRSxRQUFBLE1BQUEsQ0FBQSxLQUFZLENBQUMsU0FBYixDQUFBO0FBQUEsUUFDQSxNQUFBLENBQUEsS0FBWSxDQUFDLE9BRGIsQ0FERjtPQUpBO0FBUUEsTUFBQSxJQUFHLENBQUEsWUFBSSxDQUFhLEtBQUssQ0FBQyxpQkFBbkIsRUFBc0MsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHNCQUFoQixDQUF0QyxDQUFKLElBQXNGLENBQUEsWUFBSSxDQUFhLEtBQUssQ0FBQyxrQkFBbkIsRUFBdUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHVCQUFoQixDQUF2QyxDQUE3RjtBQUNFLFFBQUEsTUFBQSxDQUFBLEtBQVksQ0FBQyxTQUFiLENBQUE7QUFBQSxRQUNBLE1BQUEsQ0FBQSxLQUFZLENBQUMsT0FEYixDQUFBO0FBQUEsUUFFQSxNQUFBLENBQUEsS0FBWSxDQUFDLEtBRmIsQ0FERjtPQVJBO2FBYUksSUFBQSxZQUFBLENBQWEsS0FBYixFQWRRO0lBQUEsQ0FBZCxDQUFBOztBQWdCYSxJQUFBLHNCQUFDLEtBQUQsR0FBQTtBQUNYLFVBQUEsK0VBQUE7O1FBRFksUUFBTTtPQUNsQjtBQUFBLE1BQ0Usc0JBQUEsYUFERixFQUNpQixJQUFDLENBQUEscUJBQUEsWUFEbEIsRUFDZ0MsSUFBQyxDQUFBLG9CQUFBLFdBRGpDLEVBQzhDLElBQUMsQ0FBQSxzQkFBQSxhQUQvQyxFQUM4RCxJQUFDLENBQUEsY0FBQSxLQUQvRCxFQUNzRSxJQUFDLENBQUEsb0JBQUEsV0FEdkUsRUFDb0YsSUFBQyxDQUFBLGdDQUFBLHVCQURyRixFQUM4RyxJQUFDLENBQUEsaUNBQUEsd0JBRC9HLEVBQ3lJLElBQUMsQ0FBQSxrQ0FBQSx5QkFEMUksRUFDcUssSUFBQyxDQUFBLGdDQUFBLHVCQUR0SyxFQUMrTCxJQUFDLENBQUEsdUNBQUEsOEJBRGhNLEVBQ2dPLElBQUMsQ0FBQSwyQkFBQSxrQkFEak8sRUFDcVAsa0JBQUEsU0FEclAsRUFDZ1Esa0JBQUEsU0FEaFEsRUFDMlEsZ0JBQUEsT0FEM1EsQ0FBQTtBQUFBLE1BR0EsSUFBQyxDQUFBLE9BQUQsR0FBVyxHQUFBLENBQUEsT0FIWCxDQUFBO0FBQUEsTUFJQSxJQUFDLENBQUEsYUFBRCxHQUFpQixHQUFBLENBQUEsbUJBSmpCLENBQUE7QUFBQSxNQUtBLElBQUMsQ0FBQSxzQkFBRCxHQUEwQixFQUwxQixDQUFBO0FBQUEsTUFNQSxJQUFDLENBQUEsWUFBRCxxQkFBZ0IsVUFBVSxFQU4xQixDQUFBO0FBQUEsTUFRQSxJQUFDLENBQUEsMkJBQUQsR0FBK0IsT0FBQSxDQUFRLHdCQUFSLENBUi9CLENBQUE7QUFBQSxNQVNBLElBQUMsQ0FBQSx3QkFBRCxHQUE0QixPQUFBLENBQVEscUJBQVIsQ0FUNUIsQ0FBQTtBQVdBLE1BQUEsSUFBRyxpQkFBSDtBQUNFLFFBQUEsSUFBQyxDQUFBLFNBQUQsR0FBYSxJQUFJLENBQUMsYUFBYSxDQUFDLFdBQW5CLENBQStCLFNBQS9CLENBQWIsQ0FERjtPQUFBLE1BQUE7QUFHRSxRQUFBLElBQUMsQ0FBQSxTQUFELEdBQWEsR0FBQSxDQUFBLG1CQUFiLENBSEY7T0FYQTtBQUFBLE1BZ0JBLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFDLENBQUEsU0FBUyxDQUFDLFdBQVgsQ0FBdUIsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsT0FBRCxHQUFBO2lCQUN4QyxLQUFDLENBQUEsd0JBQUQsQ0FBMEIsT0FBMUIsRUFEd0M7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF2QixDQUFuQixDQWhCQSxDQUFBO0FBQUEsTUFtQkEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBWixDQUFvQixzQkFBcEIsRUFBNEMsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtpQkFDN0QsS0FBQyxDQUFBLFdBQUQsQ0FBQSxFQUQ2RDtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTVDLENBQW5CLENBbkJBLENBQUE7QUFBQSxNQXNCQSxJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFaLENBQW9CLHVCQUFwQixFQUE2QyxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO2lCQUM5RCxLQUFDLENBQUEsV0FBRCxDQUFBLEVBRDhEO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBN0MsQ0FBbkIsQ0F0QkEsQ0FBQTtBQUFBLE1BeUJBLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFJLENBQUMsTUFBTSxDQUFDLE9BQVosQ0FBb0IsNkJBQXBCLEVBQW1ELENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFFLGtCQUFGLEdBQUE7QUFDcEUsVUFEcUUsS0FBQyxDQUFBLHFCQUFBLGtCQUN0RSxDQUFBO2lCQUFBLEtBQUMsQ0FBQSxrQkFBRCxDQUFBLEVBRG9FO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbkQsQ0FBbkIsQ0F6QkEsQ0FBQTtBQUFBLE1BNEJBLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFJLENBQUMsTUFBTSxDQUFDLE9BQVosQ0FBb0Isd0JBQXBCLEVBQThDLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7aUJBQy9ELEtBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFjLDJCQUFkLEVBQTJDLEtBQUMsQ0FBQSxnQkFBRCxDQUFBLENBQTNDLEVBRCtEO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBOUMsQ0FBbkIsQ0E1QkEsQ0FBQTtBQUFBLE1BK0JBLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFJLENBQUMsTUFBTSxDQUFDLE9BQVosQ0FBb0IsNkJBQXBCLEVBQW1ELENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7QUFDcEUsVUFBQSxLQUFDLENBQUEsc0JBQUQsQ0FBQSxDQUFBLENBQUE7aUJBQ0EsS0FBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQWMsMkJBQWQsRUFBMkMsS0FBQyxDQUFBLGdCQUFELENBQUEsQ0FBM0MsRUFGb0U7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFuRCxDQUFuQixDQS9CQSxDQUFBO0FBQUEsTUFtQ0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBWixDQUFvQixxQkFBcEIsRUFBMkMsU0FBQyxJQUFELEdBQUE7QUFDNUQsUUFBQSxJQUEwQyxZQUExQztpQkFBQSxrQkFBa0IsQ0FBQyxhQUFuQixDQUFpQyxJQUFqQyxFQUFBO1NBRDREO01BQUEsQ0FBM0MsQ0FBbkIsQ0FuQ0EsQ0FBQTtBQUFBLE1Bc0NBLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFJLENBQUMsTUFBTSxDQUFDLE9BQVosQ0FBb0IsZ0NBQXBCLEVBQXNELENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7aUJBQ3ZFLEtBQUMsQ0FBQSxxQkFBRCxDQUFBLEVBRHVFO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBdEQsQ0FBbkIsQ0F0Q0EsQ0FBQTtBQUFBLE1BeUNBLGtCQUFBLEdBQXFCLElBQUMsQ0FBQSx3QkFBd0IsQ0FBQyxhQUExQixDQUF3Qyx1QkFBeEMsQ0F6Q3JCLENBQUE7QUFBQSxNQTBDQSxhQUFBLEdBQWdCLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxLQUExQixDQUFBLENBMUNoQixDQUFBO0FBQUEsTUEyQ0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBWixDQUFvQix5Q0FBcEIsRUFBK0QsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsTUFBRCxHQUFBO0FBQ2hGLFVBQUEsa0JBQWtCLENBQUMsTUFBbkIsR0FBNEIsYUFBYSxDQUFDLE1BQWQsQ0FBcUIsTUFBckIsQ0FBNUIsQ0FBQTtpQkFDQSxLQUFDLENBQUEsd0JBQXdCLENBQUMsT0FBTyxDQUFDLElBQWxDLENBQXVDLHdCQUF2QyxFQUFpRTtBQUFBLFlBQy9ELElBQUEsRUFBTSxrQkFBa0IsQ0FBQyxJQURzQztBQUFBLFlBRS9ELFFBQUEsRUFBVSxLQUFDLENBQUEsd0JBRm9EO1dBQWpFLEVBRmdGO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBL0QsQ0FBbkIsQ0EzQ0EsQ0FBQTtBQUFBLE1Ba0RBLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFDLENBQUEsd0JBQXdCLENBQUMsc0JBQTFCLENBQWlELENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFDLElBQUQsR0FBQTtBQUNsRSxjQUFBLHNDQUFBO0FBQUEsVUFEb0UsT0FBRCxLQUFDLElBQ3BFLENBQUE7QUFBQSxVQUFBLElBQWMscUJBQUosSUFBZSxJQUFBLEtBQVEsb0JBQWpDO0FBQUEsa0JBQUEsQ0FBQTtXQUFBO0FBQUEsVUFDQSxLQUFDLENBQUEsU0FBUyxDQUFDLGlCQUFYLENBQTZCLEtBQUMsQ0FBQSxTQUFTLENBQUMsWUFBWCxDQUFBLENBQTdCLENBREEsQ0FBQTtBQUVBO0FBQUE7ZUFBQSxXQUFBO29DQUFBO0FBQUEsMEJBQUEsV0FBVyxDQUFDLE1BQVosQ0FBQSxFQUFBLENBQUE7QUFBQTswQkFIa0U7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFqRCxDQUFuQixDQWxEQSxDQUFBO0FBQUEsTUF1REEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUMsQ0FBQSwyQkFBMkIsQ0FBQyxzQkFBN0IsQ0FBb0QsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtBQUNyRSxVQUFBLElBQWMsbUJBQWQ7QUFBQSxrQkFBQSxDQUFBO1dBQUE7aUJBQ0EsS0FBQyxDQUFBLHVCQUFELENBQXlCLEtBQUMsQ0FBQSxRQUFELENBQUEsQ0FBekIsRUFGcUU7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFwRCxDQUFuQixDQXZEQSxDQUFBO0FBMkRBLE1BQUEsSUFBZ0QsaUJBQWhEO0FBQUEsUUFBQSxJQUFDLENBQUEsU0FBRCxHQUFpQixJQUFBLElBQUEsQ0FBSyxJQUFJLENBQUMsS0FBTCxDQUFXLFNBQVgsQ0FBTCxDQUFqQixDQUFBO09BM0RBO0FBNkRBLE1BQUEsSUFBb0MsYUFBcEM7QUFBQSxRQUFBLElBQUMsQ0FBQSxnQkFBRCxDQUFrQixhQUFsQixDQUFBLENBQUE7T0E3REE7QUFBQSxNQThEQSxJQUFDLENBQUEsc0JBQUQsQ0FBQSxDQTlEQSxDQUFBO0FBZ0VBLE1BQUEsSUFBaUIsb0JBQUEsSUFBWSwrQkFBN0I7QUFBQSxRQUFBLElBQUMsQ0FBQSxVQUFELENBQUEsQ0FBQSxDQUFBO09BaEVBO0FBQUEsTUFpRUEsSUFBQyxDQUFBLGlCQUFELENBQUEsQ0FqRUEsQ0FEVztJQUFBLENBaEJiOztBQUFBLDJCQW9GQSxlQUFBLEdBQWlCLFNBQUMsUUFBRCxHQUFBO2FBQ2YsSUFBQyxDQUFBLE9BQU8sQ0FBQyxFQUFULENBQVksZ0JBQVosRUFBOEIsUUFBOUIsRUFEZTtJQUFBLENBcEZqQixDQUFBOztBQUFBLDJCQXVGQSxZQUFBLEdBQWMsU0FBQyxRQUFELEdBQUE7YUFDWixJQUFDLENBQUEsT0FBTyxDQUFDLEVBQVQsQ0FBWSxhQUFaLEVBQTJCLFFBQTNCLEVBRFk7SUFBQSxDQXZGZCxDQUFBOztBQUFBLDJCQTBGQSxvQkFBQSxHQUFzQixTQUFDLFFBQUQsR0FBQTthQUNwQixJQUFDLENBQUEsT0FBTyxDQUFDLEVBQVQsQ0FBWSxzQkFBWixFQUFvQyxRQUFwQyxFQURvQjtJQUFBLENBMUZ0QixDQUFBOztBQUFBLDJCQTZGQSxzQkFBQSxHQUF3QixTQUFDLFFBQUQsR0FBQTthQUN0QixJQUFDLENBQUEsT0FBTyxDQUFDLEVBQVQsQ0FBWSx5QkFBWixFQUF1QyxRQUF2QyxFQURzQjtJQUFBLENBN0Z4QixDQUFBOztBQUFBLDJCQWdHQSx3QkFBQSxHQUEwQixTQUFDLFFBQUQsR0FBQTthQUN4QixJQUFDLENBQUEsT0FBTyxDQUFDLEVBQVQsQ0FBWSwyQkFBWixFQUF5QyxRQUF6QyxFQUR3QjtJQUFBLENBaEcxQixDQUFBOztBQUFBLDJCQW1HQSxnQkFBQSxHQUFrQixTQUFDLFFBQUQsR0FBQTthQUNoQixJQUFDLENBQUEsT0FBTyxDQUFDLEVBQVQsQ0FBWSxrQkFBWixFQUFnQyxRQUFoQyxFQURnQjtJQUFBLENBbkdsQixDQUFBOztBQUFBLDJCQXNHQSxtQkFBQSxHQUFxQixTQUFDLFFBQUQsR0FBQTtBQUNuQixVQUFBLHNCQUFBO0FBQUE7QUFBQSxXQUFBLFdBQUE7Z0NBQUE7QUFBQSxRQUFBLFFBQUEsQ0FBUyxXQUFULENBQUEsQ0FBQTtBQUFBLE9BQUE7YUFDQSxJQUFDLENBQUEsc0JBQUQsQ0FBd0IsUUFBeEIsRUFGbUI7SUFBQSxDQXRHckIsQ0FBQTs7QUFBQSwyQkEwR0EsYUFBQSxHQUFlLFNBQUEsR0FBQTthQUFHLElBQUMsQ0FBQSxZQUFKO0lBQUEsQ0ExR2YsQ0FBQTs7QUFBQSwyQkE0R0EsV0FBQSxHQUFhLFNBQUEsR0FBQTthQUFHLElBQUMsQ0FBQSxVQUFKO0lBQUEsQ0E1R2IsQ0FBQTs7QUFBQSwyQkE4R0EsVUFBQSxHQUFZLFNBQUEsR0FBQTtBQUNWLE1BQUEsSUFBcUQsSUFBQyxDQUFBLGFBQUQsQ0FBQSxDQUFyRDtBQUFBLGVBQU8sT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsSUFBQyxDQUFBLFNBQVMsQ0FBQyxZQUFYLENBQUEsQ0FBaEIsQ0FBUCxDQUFBO09BQUE7QUFDQSxNQUFBLElBQTZCLDhCQUE3QjtBQUFBLGVBQU8sSUFBQyxDQUFBLGlCQUFSLENBQUE7T0FEQTthQUdBLElBQUMsQ0FBQSxpQkFBRCxHQUFxQixJQUFDLENBQUEscUJBQUQsQ0FBQSxDQUF3QixDQUFDLElBQXpCLENBQThCLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7QUFDakQsY0FBQSxTQUFBO0FBQUEsVUFBQSxLQUFDLENBQUEsV0FBRCxHQUFlLElBQWYsQ0FBQTtBQUFBLFVBRUEsU0FBQSxHQUFZLEtBQUMsQ0FBQSxTQUFTLENBQUMsWUFBWCxDQUFBLENBRlosQ0FBQTtBQUFBLFVBR0EsS0FBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQWMsZ0JBQWQsRUFBZ0MsU0FBaEMsQ0FIQSxDQUFBO2lCQUlBLFVBTGlEO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBOUIsRUFKWDtJQUFBLENBOUdaLENBQUE7O0FBQUEsMkJBeUhBLE9BQUEsR0FBUyxTQUFBLEdBQUE7QUFDUCxVQUFBLGlCQUFBO0FBQUEsTUFBQSxJQUFVLElBQUMsQ0FBQSxTQUFYO0FBQUEsY0FBQSxDQUFBO09BQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxTQUFELEdBQWEsSUFEYixDQUFBO0FBQUEsTUFHQSxZQUFZLENBQUMsb0JBQWIsQ0FBQSxDQUhBLENBQUE7QUFLQTtBQUFBLFdBQUEsV0FBQTsyQkFBQTtBQUFBLFFBQUEsTUFBTSxDQUFDLE9BQVAsQ0FBQSxDQUFBLENBQUE7QUFBQSxPQUxBO0FBQUEsTUFNQSxJQUFDLENBQUEsc0JBQUQsR0FBMEIsSUFOMUIsQ0FBQTtBQUFBLE1BUUEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxPQUFmLENBQUEsQ0FSQSxDQUFBO0FBQUEsTUFTQSxJQUFDLENBQUEsYUFBRCxHQUFpQixJQVRqQixDQUFBO0FBQUEsTUFXQSxJQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsQ0FBYyxhQUFkLEVBQTZCLElBQTdCLENBWEEsQ0FBQTthQVlBLElBQUMsQ0FBQSxPQUFPLENBQUMsT0FBVCxDQUFBLEVBYk87SUFBQSxDQXpIVCxDQUFBOztBQUFBLDJCQXdJQSxxQkFBQSxHQUF1QixTQUFBLEdBQUE7QUFDckIsVUFBQSxTQUFBO0FBQUEsTUFBQSxTQUFBLEdBQVksSUFBWixDQUFBO2FBRUEsSUFBQyxDQUFBLFNBQUQsQ0FBQSxDQUFZLENBQUMsSUFBYixDQUFrQixDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQyxJQUFELEdBQUE7QUFHaEIsY0FBQSxnQ0FBQTtBQUFBLFVBSGtCLGVBQUEsU0FBUyxlQUFBLE9BRzNCLENBQUE7QUFBQSxVQUFBLElBQUcsT0FBTyxDQUFDLE1BQVIsR0FBaUIsQ0FBcEI7QUFDRSxZQUFBLEtBQUMsQ0FBQSxLQUFELEdBQVMsS0FBQyxDQUFBLEtBQUssQ0FBQyxNQUFQLENBQWMsU0FBQyxDQUFELEdBQUE7cUJBQU8sZUFBUyxPQUFULEVBQUEsQ0FBQSxNQUFQO1lBQUEsQ0FBZCxDQUFULENBQUE7QUFBQSxZQUNBLEtBQUMsQ0FBQSx1QkFBRCxDQUF5QixPQUF6QixDQURBLENBREY7V0FBQTtBQU1BLFVBQUEsSUFBRyxxQkFBQSxJQUFZLE9BQU8sQ0FBQyxNQUFSLEdBQWlCLENBQWhDO0FBQ0UsaUJBQUEsOENBQUE7aUNBQUE7a0JBQTBDLGVBQVksS0FBQyxDQUFBLEtBQWIsRUFBQSxJQUFBO0FBQTFDLGdCQUFBLEtBQUMsQ0FBQSxLQUFLLENBQUMsSUFBUCxDQUFZLElBQVosQ0FBQTtlQUFBO0FBQUEsYUFBQTtBQUlBLFlBQUEsSUFBRyxLQUFDLENBQUEsU0FBUyxDQUFDLE1BQWQ7cUJBQ0UsUUFERjthQUFBLE1BQUE7cUJBS0UsS0FBQyxDQUFBLE1BTEg7YUFMRjtXQUFBLE1BWUssSUFBTyxtQkFBUDttQkFDSCxLQUFDLENBQUEsS0FBRCxHQUFTLFFBRE47V0FBQSxNQUlBLElBQUEsQ0FBQSxLQUFRLENBQUEsU0FBUyxDQUFDLE1BQWxCO21CQUNILEtBQUMsQ0FBQSxNQURFO1dBQUEsTUFBQTttQkFJSCxHQUpHO1dBekJXO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbEIsQ0E4QkEsQ0FBQyxJQTlCRCxDQThCTSxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQyxLQUFELEdBQUE7aUJBQ0osS0FBQyxDQUFBLHFCQUFELENBQXVCLEtBQXZCLEVBREk7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQTlCTixDQWdDQSxDQUFDLElBaENELENBZ0NNLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFDLE9BQUQsR0FBQTtBQUNKLFVBQUEsSUFBd0MsZUFBeEM7bUJBQUEsS0FBQyxDQUFBLFNBQVMsQ0FBQyxnQkFBWCxDQUE0QixPQUE1QixFQUFBO1dBREk7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQWhDTixFQUhxQjtJQUFBLENBeEl2QixDQUFBOztBQUFBLDJCQThLQSxhQUFBLEdBQWUsU0FBQSxHQUFBO0FBQ2IsVUFBQSxRQUFBO0FBQUEsTUFBQSxRQUFBLEdBQVcsSUFBQyxDQUFBLGNBQUQsQ0FBQSxDQUFYLENBQUE7YUFDSSxJQUFBLFdBQUEsQ0FDRjtBQUFBLFFBQUEsV0FBQSxFQUFhLFFBQWI7QUFBQSxRQUNBLFlBQUEsRUFBYyxJQUFDLENBQUEsZUFBRCxDQUFBLENBRGQ7QUFBQSxRQUVBLE9BQUEsRUFBUyxJQUFDLENBQUEsVUFBRCxDQUFBLENBRlQ7T0FERSxFQUZTO0lBQUEsQ0E5S2YsQ0FBQTs7QUFBQSwyQkFxTEEsaUJBQUEsR0FBbUIsU0FBRSxjQUFGLEdBQUE7QUFBbUIsTUFBbEIsSUFBQyxDQUFBLGlCQUFBLGNBQWlCLENBQW5CO0lBQUEsQ0FyTG5CLENBQUE7O0FBQUEsMkJBK0xBLGlCQUFBLEdBQW1CLFNBQUEsR0FBQTthQUNqQixJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxrQkFBZixDQUFrQyxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQyxNQUFELEdBQUE7QUFDbkQsY0FBQSxxQkFBQTtBQUFBLFVBQUEsSUFBVSxLQUFDLENBQUEsZUFBRCxDQUFpQixNQUFNLENBQUMsT0FBUCxDQUFBLENBQWpCLENBQVY7QUFBQSxrQkFBQSxDQUFBO1dBQUE7QUFBQSxVQUVBLE1BQUEsR0FBUyxLQUFDLENBQUEsb0JBQUQsQ0FBc0IsTUFBdEIsQ0FGVCxDQUFBO0FBR0EsVUFBQSxJQUFHLGNBQUg7QUFDRSxZQUFBLGFBQUEsR0FBZ0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFYLENBQW1CLE1BQW5CLENBQWhCLENBQUE7bUJBQ0EsYUFBYSxDQUFDLE1BQWQsQ0FBQSxFQUZGO1dBSm1EO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbEMsQ0FBbkIsRUFEaUI7SUFBQSxDQS9MbkIsQ0FBQTs7QUFBQSwyQkF3TUEsdUJBQUEsR0FBeUIsU0FBQyxNQUFELEdBQUE7QUFDdkIsTUFBQSxJQUFnQixJQUFDLENBQUEsU0FBRCxJQUFrQixnQkFBbEM7QUFBQSxlQUFPLEtBQVAsQ0FBQTtPQUFBO2FBQ0EsK0NBRnVCO0lBQUEsQ0F4TXpCLENBQUE7O0FBQUEsMkJBNE1BLG9CQUFBLEdBQXNCLFNBQUMsTUFBRCxHQUFBO0FBQ3BCLFVBQUEsMkJBQUE7QUFBQSxNQUFBLElBQVUsSUFBQyxDQUFBLFNBQVg7QUFBQSxjQUFBLENBQUE7T0FBQTtBQUNBLE1BQUEsSUFBYyxjQUFkO0FBQUEsY0FBQSxDQUFBO09BREE7QUFFQSxNQUFBLElBQUcsOENBQUg7QUFDRSxlQUFPLElBQUMsQ0FBQSxzQkFBdUIsQ0FBQSxNQUFNLENBQUMsRUFBUCxDQUEvQixDQURGO09BRkE7QUFLQSxNQUFBLElBQUcsb0NBQUg7QUFDRSxRQUFBLEtBQUEsR0FBUSxJQUFDLENBQUEsWUFBYSxDQUFBLE1BQU0sQ0FBQyxFQUFQLENBQXRCLENBQUE7QUFBQSxRQUNBLEtBQUssQ0FBQyxNQUFOLEdBQWUsTUFEZixDQUFBO0FBQUEsUUFFQSxLQUFLLENBQUMsT0FBTixHQUFnQixJQUZoQixDQUFBO0FBQUEsUUFHQSxNQUFBLENBQUEsSUFBUSxDQUFBLFlBQWEsQ0FBQSxNQUFNLENBQUMsRUFBUCxDQUhyQixDQURGO09BQUEsTUFBQTtBQU1FLFFBQUEsS0FBQSxHQUFRO0FBQUEsVUFBQyxRQUFBLE1BQUQ7QUFBQSxVQUFTLE9BQUEsRUFBUyxJQUFsQjtTQUFSLENBTkY7T0FMQTtBQUFBLE1BYUEsSUFBQyxDQUFBLHNCQUF1QixDQUFBLE1BQU0sQ0FBQyxFQUFQLENBQXhCLEdBQXFDLE1BQUEsR0FBYSxJQUFBLFdBQUEsQ0FBWSxLQUFaLENBYmxELENBQUE7QUFBQSxNQWVBLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixZQUFBLEdBQWUsTUFBTSxDQUFDLFlBQVAsQ0FBb0IsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtBQUNwRCxVQUFBLEtBQUMsQ0FBQSxhQUFhLENBQUMsTUFBZixDQUFzQixZQUF0QixDQUFBLENBQUE7QUFBQSxVQUNBLFlBQVksQ0FBQyxPQUFiLENBQUEsQ0FEQSxDQUFBO2lCQUVBLE1BQUEsQ0FBQSxLQUFRLENBQUEsc0JBQXVCLENBQUEsTUFBTSxDQUFDLEVBQVAsRUFIcUI7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFwQixDQUFsQyxDQWZBLENBQUE7QUFBQSxNQW9CQSxJQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsQ0FBYyx5QkFBZCxFQUF5QyxNQUF6QyxDQXBCQSxDQUFBO2FBc0JBLE9BdkJvQjtJQUFBLENBNU10QixDQUFBOztBQUFBLDJCQXFPQSxrQkFBQSxHQUFvQixTQUFDLElBQUQsR0FBQTtBQUNsQixVQUFBLHNCQUFBO0FBQUE7QUFBQSxXQUFBLFdBQUE7Z0NBQUE7QUFDRSxRQUFBLElBQXNCLFdBQVcsQ0FBQyxNQUFNLENBQUMsT0FBbkIsQ0FBQSxDQUFBLEtBQWdDLElBQXREO0FBQUEsaUJBQU8sV0FBUCxDQUFBO1NBREY7QUFBQSxPQURrQjtJQUFBLENBck9wQixDQUFBOztBQUFBLDJCQXlPQSxrQkFBQSxHQUFvQixTQUFBLEdBQUE7QUFDbEIsVUFBQSxzRUFBQTtBQUFBO0FBQUEsV0FBQSxXQUFBOzJCQUFBO0FBQ0UsUUFBQSxJQUFHLElBQUMsQ0FBQSxlQUFELENBQWlCLE1BQU0sQ0FBQyxNQUFNLENBQUMsT0FBZCxDQUFBLENBQWpCLENBQUg7QUFDRSxVQUFBLE1BQU0sQ0FBQyxPQUFQLENBQUEsQ0FBQSxDQUFBO0FBQUEsVUFDQSxNQUFBLENBQUEsSUFBUSxDQUFBLHNCQUF1QixDQUFBLEVBQUEsQ0FEL0IsQ0FERjtTQURGO0FBQUEsT0FBQTtBQUtBO0FBQ0UsUUFBQSxJQUFHLG1DQUFIO0FBQ0U7QUFBQTtlQUFBLDRDQUFBOytCQUFBO0FBQ0UsWUFBQSxJQUFZLElBQUMsQ0FBQSx1QkFBRCxDQUF5QixNQUF6QixDQUFBLElBQW9DLElBQUMsQ0FBQSxlQUFELENBQWlCLE1BQU0sQ0FBQyxPQUFQLENBQUEsQ0FBakIsQ0FBaEQ7QUFBQSx1QkFBQTthQUFBO0FBQUEsWUFFQSxNQUFBLEdBQVMsSUFBQyxDQUFBLG9CQUFELENBQXNCLE1BQXRCLENBRlQsQ0FBQTtBQUdBLFlBQUEsSUFBRyxjQUFIO0FBQ0UsY0FBQSxhQUFBLEdBQWdCLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBWCxDQUFtQixNQUFuQixDQUFoQixDQUFBO0FBQUEsNEJBQ0EsYUFBYSxDQUFDLE1BQWQsQ0FBQSxFQURBLENBREY7YUFBQSxNQUFBO29DQUFBO2FBSkY7QUFBQTswQkFERjtTQURGO09BQUEsY0FBQTtBQVdFLFFBREksVUFDSixDQUFBO2VBQUEsT0FBTyxDQUFDLEdBQVIsQ0FBWSxDQUFaLEVBWEY7T0FOa0I7SUFBQSxDQXpPcEIsQ0FBQTs7QUFBQSwyQkE0UEEsZUFBQSxHQUFpQixTQUFDLElBQUQsR0FBQTtBQUNmLFVBQUEsZ0NBQUE7QUFBQSxNQUFBLElBQUEsR0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQWIsQ0FBd0IsSUFBeEIsQ0FBUCxDQUFBO0FBQUEsTUFDQSxPQUFBLHVEQUFnQyxFQURoQyxDQUFBO0FBRUEsV0FBQSw4Q0FBQTs2QkFBQTtZQUF1QyxTQUFBLENBQVUsSUFBVixFQUFnQixNQUFoQixFQUF3QjtBQUFBLFVBQUEsU0FBQSxFQUFXLElBQVg7QUFBQSxVQUFpQixHQUFBLEVBQUssSUFBdEI7U0FBeEI7QUFBdkMsaUJBQU8sSUFBUDtTQUFBO0FBQUEsT0FGQTthQUdBLE1BSmU7SUFBQSxDQTVQakIsQ0FBQTs7QUFBQSwyQkEwUUEsUUFBQSxHQUFVLFNBQUEsR0FBQTtBQUFHLFVBQUEsS0FBQTtpREFBTSxDQUFFLEtBQVIsQ0FBQSxXQUFIO0lBQUEsQ0ExUVYsQ0FBQTs7QUFBQSwyQkE0UUEsVUFBQSxHQUFZLFNBQUMsSUFBRCxHQUFBO0FBQVUsTUFBQSxJQUFxQixZQUFyQjtlQUFBLElBQUMsQ0FBQSxLQUFLLENBQUMsSUFBUCxDQUFZLElBQVosRUFBQTtPQUFWO0lBQUEsQ0E1UVosQ0FBQTs7QUFBQSwyQkE4UUEsT0FBQSxHQUFTLFNBQUMsSUFBRCxHQUFBO0FBQVUsVUFBQSxLQUFBO2FBQUEsc0RBQWtCLEVBQWxCLEVBQUEsSUFBQSxPQUFWO0lBQUEsQ0E5UVQsQ0FBQTs7QUFBQSwyQkFnUkEsU0FBQSxHQUFXLFNBQUMsWUFBRCxHQUFBOztRQUFDLGVBQWE7T0FDdkI7YUFBSSxJQUFBLE9BQUEsQ0FBUSxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQyxPQUFELEVBQVUsTUFBVixHQUFBO0FBQ1YsY0FBQSxvQ0FBQTtBQUFBLFVBQUEsU0FBQSxHQUFZLEtBQUMsQ0FBQSxZQUFELENBQUEsQ0FBWixDQUFBO0FBQUEsVUFDQSxVQUFBLEdBQWdCLFlBQUgsR0FBcUIsRUFBckIsMkNBQXNDLEVBRG5ELENBQUE7QUFBQSxVQUVBLE1BQUEsR0FBUztBQUFBLFlBQ1AsWUFBQSxVQURPO0FBQUEsWUFFTixXQUFELEtBQUMsQ0FBQSxTQUZNO0FBQUEsWUFHUCxZQUFBLEVBQWMsS0FBQyxDQUFBLGVBQUQsQ0FBQSxDQUhQO0FBQUEsWUFJUCxLQUFBLEVBQU8sU0FKQTtBQUFBLFlBS1AsOEJBQUEsRUFBZ0MsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHlDQUFoQixDQUx6QjtBQUFBLFlBTVAsV0FBQSxFQUFhLEtBQUMsQ0FBQSxjQUFELENBQUEsQ0FOTjtBQUFBLFlBT1AsZ0JBQUEsRUFBa0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLGdDQUFoQixDQVBYO1dBRlQsQ0FBQTtpQkFXQSxXQUFXLENBQUMsU0FBWixDQUFzQixNQUF0QixFQUE4QixTQUFDLE9BQUQsR0FBQTtBQUM1QixnQkFBQSxvQ0FBQTtBQUFBLGlCQUFBLGlEQUFBO2lDQUFBO0FBQ0UsY0FBQSx1QkFBQSxHQUEwQixTQUFTLENBQUMsSUFBVixDQUFlLFNBQUMsSUFBRCxHQUFBO3VCQUN2QyxDQUFDLENBQUMsT0FBRixDQUFVLElBQVYsQ0FBQSxLQUFtQixFQURvQjtjQUFBLENBQWYsQ0FBMUIsQ0FBQTtBQUdBLGNBQUEsSUFBQSxDQUFBLHVCQUFBOztrQkFDRSxPQUFPLENBQUMsVUFBVztpQkFBbkI7QUFBQSxnQkFDQSxPQUFPLENBQUMsT0FBTyxDQUFDLElBQWhCLENBQXFCLENBQXJCLENBREEsQ0FERjtlQUpGO0FBQUEsYUFBQTttQkFRQSxPQUFBLENBQVEsT0FBUixFQVQ0QjtVQUFBLENBQTlCLEVBWlU7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFSLEVBREs7SUFBQSxDQWhSWCxDQUFBOztBQUFBLDJCQXdTQSxXQUFBLEdBQWEsU0FBQSxHQUFBO0FBQ1gsTUFBQSxJQUFBLENBQUEsSUFBaUMsQ0FBQSxXQUFqQztBQUFBLGVBQU8sT0FBTyxDQUFDLE9BQVIsQ0FBQSxDQUFQLENBQUE7T0FBQTthQUVBLElBQUMsQ0FBQSxTQUFELENBQUEsQ0FBWSxDQUFDLElBQWIsQ0FBa0IsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsSUFBRCxHQUFBO0FBQ2hCLGNBQUEsNkJBQUE7QUFBQSxVQURrQixlQUFBLFNBQVMsZUFBQSxPQUMzQixDQUFBO0FBQUEsVUFBQSxLQUFDLENBQUEsdUJBQUQsQ0FBeUIsT0FBekIsQ0FBQSxDQUFBO0FBQUEsVUFFQSxLQUFDLENBQUEsS0FBRCxHQUFTLEtBQUMsQ0FBQSxLQUFLLENBQUMsTUFBUCxDQUFjLFNBQUMsQ0FBRCxHQUFBO21CQUFPLGVBQVMsT0FBVCxFQUFBLENBQUEsTUFBUDtVQUFBLENBQWQsQ0FGVCxDQUFBO0FBR0EsZUFBQSw4Q0FBQTs0QkFBQTtnQkFBcUMsZUFBUyxLQUFDLENBQUEsS0FBVixFQUFBLENBQUE7QUFBckMsY0FBQSxLQUFDLENBQUEsS0FBSyxDQUFDLElBQVAsQ0FBWSxDQUFaLENBQUE7YUFBQTtBQUFBLFdBSEE7QUFBQSxVQUtBLEtBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFjLGtCQUFkLEVBQWtDLEtBQUMsQ0FBQSxRQUFELENBQUEsQ0FBbEMsQ0FMQSxDQUFBO2lCQU1BLEtBQUMsQ0FBQSx1QkFBRCxDQUF5QixPQUF6QixFQVBnQjtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWxCLEVBSFc7SUFBQSxDQXhTYixDQUFBOztBQUFBLDJCQW9UQSxxQkFBQSxHQUF1QixTQUFDLElBQUQsR0FBQTtBQUNyQixVQUFBLHlCQUFBO0FBQUEsTUFBQSxJQUFBLENBQUEsSUFBQTtBQUFBLGVBQU8sS0FBUCxDQUFBO09BQUE7QUFBQSxNQUNBLElBQUEsR0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQWIsQ0FBd0IsSUFBeEIsQ0FEUCxDQUFBO0FBQUEsTUFFQSxPQUFBLEdBQVUsSUFBQyxDQUFBLGNBQUQsQ0FBQSxDQUZWLENBQUE7QUFHQSxXQUFBLDhDQUFBOzZCQUFBO1lBQXVDLFNBQUEsQ0FBVSxJQUFWLEVBQWdCLE1BQWhCLEVBQXdCO0FBQUEsVUFBQSxTQUFBLEVBQVcsSUFBWDtBQUFBLFVBQWlCLEdBQUEsRUFBSyxJQUF0QjtTQUF4QjtBQUF2QyxpQkFBTyxJQUFQO1NBQUE7QUFBQSxPQUpxQjtJQUFBLENBcFR2QixDQUFBOztBQUFBLDJCQTBUQSxhQUFBLEdBQWUsU0FBQyxJQUFELEdBQUE7QUFDYixVQUFBLDhCQUFBO0FBQUEsTUFBQSxJQUFBLENBQUEsSUFBQTtBQUFBLGVBQU8sS0FBUCxDQUFBO09BQUE7QUFBQSxNQUNBLElBQUEsR0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQWIsQ0FBd0IsSUFBeEIsQ0FEUCxDQUFBO0FBQUEsTUFFQSxZQUFBLEdBQWUsSUFBQyxDQUFBLGVBQUQsQ0FBQSxDQUZmLENBQUE7QUFHQSxXQUFBLG1EQUFBO2tDQUFBO1lBQTRDLFNBQUEsQ0FBVSxJQUFWLEVBQWdCLE1BQWhCLEVBQXdCO0FBQUEsVUFBQSxTQUFBLEVBQVcsSUFBWDtBQUFBLFVBQWlCLEdBQUEsRUFBSyxJQUF0QjtTQUF4QjtBQUE1QyxpQkFBTyxJQUFQO1NBQUE7QUFBQSxPQUphO0lBQUEsQ0ExVGYsQ0FBQTs7QUFBQSwyQkF3VUEsVUFBQSxHQUFZLFNBQUEsR0FBQTtBQUNWLE1BQUEsSUFBQSxDQUFBLElBQTJCLENBQUEsYUFBRCxDQUFBLENBQTFCO0FBQUEsZUFBTyxHQUFBLENBQUEsT0FBUCxDQUFBO09BQUE7YUFDSSxJQUFBLE9BQUEsQ0FBUSxJQUFDLENBQUEsaUJBQUQsQ0FBQSxDQUFSLEVBRk07SUFBQSxDQXhVWixDQUFBOztBQUFBLDJCQTRVQSxVQUFBLEdBQVksU0FBQSxHQUFBO2FBQUcsSUFBQyxDQUFBLFNBQVMsQ0FBQyxVQUFYLENBQUEsRUFBSDtJQUFBLENBNVVaLENBQUE7O0FBQUEsMkJBOFVBLFlBQUEsR0FBYyxTQUFBLEdBQUE7YUFBRyxJQUFDLENBQUEsU0FBUyxDQUFDLFlBQVgsQ0FBQSxFQUFIO0lBQUEsQ0E5VWQsQ0FBQTs7QUFBQSwyQkFnVkEsOEJBQUEsR0FBZ0MsU0FBQSxHQUFBO2FBQUcsSUFBQyxDQUFBLDRCQUFKO0lBQUEsQ0FoVmhDLENBQUE7O0FBQUEsMkJBa1ZBLGVBQUEsR0FBaUIsU0FBQyxFQUFELEdBQUE7YUFBUSxJQUFDLENBQUEsU0FBUyxDQUFDLGVBQVgsQ0FBMkIsRUFBM0IsRUFBUjtJQUFBLENBbFZqQixDQUFBOztBQUFBLDJCQW9WQSxpQkFBQSxHQUFtQixTQUFDLElBQUQsR0FBQTthQUFVLElBQUMsQ0FBQSxTQUFTLENBQUMsaUJBQVgsQ0FBNkIsSUFBN0IsRUFBVjtJQUFBLENBcFZuQixDQUFBOztBQUFBLDJCQXNWQSxpQkFBQSxHQUFtQixTQUFBLEdBQUE7YUFBRyxJQUFDLENBQUEsU0FBUyxDQUFDLGlCQUFYLENBQUEsRUFBSDtJQUFBLENBdFZuQixDQUFBOztBQUFBLDJCQXdWQSwyQkFBQSxHQUE2QixTQUFBLEdBQUE7YUFBRyxJQUFDLENBQUEseUJBQUo7SUFBQSxDQXhWN0IsQ0FBQTs7QUFBQSwyQkEwVkEsa0JBQUEsR0FBb0IsU0FBQyxRQUFELEdBQUE7YUFDbEIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFmLENBQW9CLFFBQVEsQ0FBQyxJQUE3QixDQUFrQyxDQUFDLElBQW5DLENBQXdDLFNBQUMsTUFBRCxHQUFBO0FBQ3RDLFlBQUEsbUJBQUE7QUFBQSxRQUFBLE1BQUEsR0FBUyxNQUFNLENBQUMsU0FBUCxDQUFBLENBQVQsQ0FBQTtBQUFBLFFBRUEsV0FBQSxHQUFjLEtBQUssQ0FBQyxVQUFOLENBQWlCLENBQzdCLE1BQU0sQ0FBQyx5QkFBUCxDQUFpQyxRQUFRLENBQUMsS0FBTSxDQUFBLENBQUEsQ0FBaEQsQ0FENkIsRUFFN0IsTUFBTSxDQUFDLHlCQUFQLENBQWlDLFFBQVEsQ0FBQyxLQUFNLENBQUEsQ0FBQSxDQUFoRCxDQUY2QixDQUFqQixDQUZkLENBQUE7ZUFPQSxNQUFNLENBQUMsc0JBQVAsQ0FBOEIsV0FBOUIsRUFBMkM7QUFBQSxVQUFBLFVBQUEsRUFBWSxJQUFaO1NBQTNDLEVBUnNDO01BQUEsQ0FBeEMsRUFEa0I7SUFBQSxDQTFWcEIsQ0FBQTs7QUFBQSwyQkFxV0Esd0JBQUEsR0FBMEIsU0FBQyxPQUFELEdBQUE7YUFDeEIsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQWMsc0JBQWQsRUFBc0MsT0FBdEMsRUFEd0I7SUFBQSxDQXJXMUIsQ0FBQTs7QUFBQSwyQkF3V0Esb0JBQUEsR0FBc0IsU0FBQyxJQUFELEdBQUE7YUFBVSxJQUFDLENBQUEscUJBQUQsQ0FBdUIsQ0FBQyxJQUFELENBQXZCLEVBQVY7SUFBQSxDQXhXdEIsQ0FBQTs7QUFBQSwyQkEwV0EscUJBQUEsR0FBdUIsU0FBQyxLQUFELEdBQUE7YUFDakIsSUFBQSxPQUFBLENBQVEsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsT0FBRCxFQUFVLE1BQVYsR0FBQTtpQkFDVixLQUFDLENBQUEscUJBQUQsQ0FBdUIsS0FBdkIsRUFBOEIsU0FBQyxPQUFELEdBQUE7bUJBQWEsT0FBQSxDQUFRLE9BQVIsRUFBYjtVQUFBLENBQTlCLEVBRFU7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFSLEVBRGlCO0lBQUEsQ0ExV3ZCLENBQUE7O0FBQUEsMkJBOFdBLG1CQUFBLEdBQXFCLFNBQUMsSUFBRCxHQUFBO2FBQVUsSUFBQyxDQUFBLFNBQVMsQ0FBQyxtQkFBWCxDQUErQixJQUEvQixFQUFWO0lBQUEsQ0E5V3JCLENBQUE7O0FBQUEsMkJBZ1hBLG9CQUFBLEdBQXNCLFNBQUMsS0FBRCxHQUFBO2FBQVcsSUFBQyxDQUFBLFNBQVMsQ0FBQyxvQkFBWCxDQUFnQyxLQUFoQyxFQUFYO0lBQUEsQ0FoWHRCLENBQUE7O0FBQUEsMkJBa1hBLHNCQUFBLEdBQXdCLFNBQUMsSUFBRCxHQUFBO2FBQVUsSUFBQyxDQUFBLHVCQUFELENBQXlCLENBQUMsSUFBRCxDQUF6QixFQUFWO0lBQUEsQ0FsWHhCLENBQUE7O0FBQUEsMkJBb1hBLHVCQUFBLEdBQXlCLFNBQUMsS0FBRCxHQUFBO2FBQ3ZCLElBQUMsQ0FBQSxTQUFTLENBQUMsdUJBQVgsQ0FBbUMsS0FBbkMsRUFEdUI7SUFBQSxDQXBYekIsQ0FBQTs7QUFBQSwyQkF1WEEsc0JBQUEsR0FBd0IsU0FBQyxJQUFELEdBQUE7YUFBVSxJQUFDLENBQUEsdUJBQUQsQ0FBeUIsQ0FBQyxJQUFELENBQXpCLEVBQVY7SUFBQSxDQXZYeEIsQ0FBQTs7QUFBQSwyQkF5WEEsdUJBQUEsR0FBeUIsU0FBQyxLQUFELEdBQUE7QUFDdkIsVUFBQSxPQUFBO0FBQUEsTUFBQSxPQUFBLEdBQVUsT0FBTyxDQUFDLE9BQVIsQ0FBQSxDQUFWLENBQUE7QUFDQSxNQUFBLElBQUEsQ0FBQSxJQUFnQyxDQUFBLGFBQUQsQ0FBQSxDQUEvQjtBQUFBLFFBQUEsT0FBQSxHQUFVLElBQUMsQ0FBQSxVQUFELENBQUEsQ0FBVixDQUFBO09BREE7YUFHQSxPQUNBLENBQUMsSUFERCxDQUNNLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7QUFDSixVQUFBLElBQUcsS0FBSyxDQUFDLElBQU4sQ0FBVyxTQUFDLElBQUQsR0FBQTttQkFBVSxlQUFZLEtBQUMsQ0FBQSxLQUFiLEVBQUEsSUFBQSxNQUFWO1VBQUEsQ0FBWCxDQUFIO0FBQ0UsbUJBQU8sT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsRUFBaEIsQ0FBUCxDQURGO1dBQUE7aUJBR0EsS0FBQyxDQUFBLHFCQUFELENBQXVCLEtBQXZCLEVBSkk7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUROLENBTUEsQ0FBQyxJQU5ELENBTU0sQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsT0FBRCxHQUFBO2lCQUNKLEtBQUMsQ0FBQSxTQUFTLENBQUMsZ0JBQVgsQ0FBNEIsT0FBNUIsRUFBcUMsS0FBckMsRUFESTtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBTk4sRUFKdUI7SUFBQSxDQXpYekIsQ0FBQTs7QUFBQSwyQkFzWUEscUJBQUEsR0FBdUIsU0FBQyxLQUFELEVBQVEsUUFBUixHQUFBO0FBQ3JCLFVBQUEsV0FBQTtBQUFBLE1BQUEsSUFBRyxLQUFLLENBQUMsTUFBTixLQUFnQixDQUFoQixJQUFzQixDQUFBLFdBQUEsR0FBYyxJQUFDLENBQUEsa0JBQUQsQ0FBb0IsS0FBTSxDQUFBLENBQUEsQ0FBMUIsQ0FBZCxDQUF6QjtlQUNFLFdBQVcsQ0FBQyxzQkFBWixDQUFBLENBQW9DLENBQUMsSUFBckMsQ0FBMEMsU0FBQyxPQUFELEdBQUE7aUJBQWEsUUFBQSxDQUFTLE9BQVQsRUFBYjtRQUFBLENBQTFDLEVBREY7T0FBQSxNQUFBO2VBR0UsWUFBWSxDQUFDLFNBQWIsQ0FBdUIsS0FBdkIsRUFBOEIsSUFBQyxDQUFBLDJCQUEvQixFQUE0RCxTQUFDLE9BQUQsR0FBQTtpQkFBYSxRQUFBLENBQVMsT0FBVCxFQUFiO1FBQUEsQ0FBNUQsRUFIRjtPQURxQjtJQUFBLENBdFl2QixDQUFBOztBQUFBLDJCQTRZQSxtQkFBQSxHQUFxQixTQUFBLEdBQUE7QUFDbkIsVUFBQSw4QkFBQTtBQUFBLE1BQUEsUUFBQSxHQUFXLENBQVgsQ0FBQTtBQUFBLE1BQ0EsU0FBQSxHQUFZLEVBRFosQ0FBQTtBQUFBLE1BRUEsSUFBQSxHQUFPLEVBRlAsQ0FBQTtBQUFBLE1BR0EsY0FBYyxDQUFDLE9BQWYsQ0FBdUIsU0FBQyxDQUFELEdBQUE7ZUFBTyxJQUFBLElBQVMsY0FBQSxHQUFjLENBQWQsR0FBZ0IsSUFBaEIsR0FBb0IsQ0FBcEIsR0FBc0IsU0FBdEM7TUFBQSxDQUF2QixDQUhBLENBQUE7QUFBQSxNQUtBLEdBQUEsR0FBTSxRQUFRLENBQUMsYUFBVCxDQUF1QixLQUF2QixDQUxOLENBQUE7QUFBQSxNQU1BLEdBQUcsQ0FBQyxTQUFKLEdBQWdCLGtCQU5oQixDQUFBO0FBQUEsTUFPQSxHQUFHLENBQUMsU0FBSixHQUFnQixJQVBoQixDQUFBO0FBQUEsTUFRQSxRQUFRLENBQUMsSUFBSSxDQUFDLFdBQWQsQ0FBMEIsR0FBMUIsQ0FSQSxDQUFBO0FBQUEsTUFVQSxjQUFjLENBQUMsT0FBZixDQUF1QixTQUFDLENBQUQsRUFBRyxDQUFILEdBQUE7QUFDckIsWUFBQSwwQkFBQTtBQUFBLFFBQUEsSUFBQSxHQUFPLEdBQUcsQ0FBQyxRQUFTLENBQUEsQ0FBQSxDQUFwQixDQUFBO0FBQUEsUUFDQSxLQUFBLEdBQVEsZ0JBQUEsQ0FBaUIsSUFBakIsQ0FBc0IsQ0FBQyxLQUQvQixDQUFBO0FBQUEsUUFFQSxHQUFBLEdBQU0sUUFBQSxHQUFXLENBQUMsQ0FBQyxNQUFiLEdBQXNCLEtBQUssQ0FBQyxNQUE1QixHQUFxQyxDQUYzQyxDQUFBO0FBQUEsUUFJQSxRQUFBLEdBQ0U7QUFBQSxVQUFBLElBQUEsRUFBTyxHQUFBLEdBQUcsQ0FBVjtBQUFBLFVBQ0EsSUFBQSxFQUFNLENBRE47QUFBQSxVQUVBLEtBQUEsRUFBTyxLQUZQO0FBQUEsVUFHQSxLQUFBLEVBQU8sQ0FBQyxRQUFELEVBQVUsR0FBVixDQUhQO0FBQUEsVUFJQSxJQUFBLEVBQU0sZUFKTjtTQUxGLENBQUE7QUFBQSxRQVdBLFFBQUEsR0FBVyxHQVhYLENBQUE7ZUFZQSxTQUFTLENBQUMsSUFBVixDQUFlLFFBQWYsRUFicUI7TUFBQSxDQUF2QixDQVZBLENBQUE7QUFBQSxNQXlCQSxRQUFRLENBQUMsSUFBSSxDQUFDLFdBQWQsQ0FBMEIsR0FBMUIsQ0F6QkEsQ0FBQTtBQTBCQSxhQUFPLFNBQVAsQ0EzQm1CO0lBQUEsQ0E1WXJCLENBQUE7O0FBQUEsMkJBaWJBLFlBQUEsR0FBYyxTQUFBLEdBQUE7YUFBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQWIsQ0FBQSxFQUFIO0lBQUEsQ0FqYmQsQ0FBQTs7QUFBQSwyQkFtYkEsY0FBQSxHQUFnQixTQUFBLEdBQUE7QUFDZCxVQUFBLG1CQUFBO0FBQUEsTUFBQSxLQUFBLEdBQVEsQ0FBQyxXQUFELENBQVIsQ0FBQTtBQUFBLE1BQ0EsS0FBQSxHQUFRLEtBQUssQ0FBQyxNQUFOLDhDQUE0QixFQUE1QixDQURSLENBQUE7QUFFQSxNQUFBLElBQUEsQ0FBQSxJQUFRLENBQUEsdUJBQVI7QUFDRSxRQUFBLEtBQUEsR0FBUSxLQUFLLENBQUMsTUFBTixxRUFBdUQsRUFBdkQsQ0FBUixDQURGO09BRkE7YUFJQSxNQUxjO0lBQUEsQ0FuYmhCLENBQUE7O0FBQUEsMkJBMGJBLGNBQUEsR0FBZ0IsU0FBRSxXQUFGLEdBQUE7QUFDZCxNQURlLElBQUMsQ0FBQSxvQ0FBQSxjQUFZLEVBQzVCLENBQUE7QUFBQSxNQUFBLElBQWMsMEJBQUosSUFBMEIsZ0NBQXBDO0FBQUEsY0FBQSxDQUFBO09BQUE7YUFFQSxJQUFDLENBQUEsVUFBRCxDQUFBLENBQWEsQ0FBQyxJQUFkLENBQW1CLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7aUJBQUcsS0FBQyxDQUFBLHFCQUFELENBQXVCLElBQXZCLEVBQUg7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFuQixFQUhjO0lBQUEsQ0ExYmhCLENBQUE7O0FBQUEsMkJBK2JBLDBCQUFBLEdBQTRCLFNBQUUsdUJBQUYsR0FBQTtBQUMxQixNQUQyQixJQUFDLENBQUEsMEJBQUEsdUJBQzVCLENBQUE7YUFBQSxJQUFDLENBQUEsV0FBRCxDQUFBLEVBRDBCO0lBQUEsQ0EvYjVCLENBQUE7O0FBQUEsMkJBa2NBLGNBQUEsR0FBZ0IsU0FBQSxHQUFBO0FBQ2QsVUFBQSxpQ0FBQTtBQUFBLE1BQUEsS0FBQSxHQUFRLEVBQVIsQ0FBQTtBQUFBLE1BQ0EsS0FBQSxHQUFRLEtBQUssQ0FBQyxNQUFOLDhDQUE0QixFQUE1QixDQURSLENBQUE7QUFBQSxNQUVBLEtBQUEsR0FBUSxLQUFLLENBQUMsTUFBTiw4Q0FBNEIsRUFBNUIsQ0FGUixDQUFBO0FBR0EsTUFBQSxJQUFBLENBQUEsSUFBUSxDQUFBLHVCQUFSO0FBQ0UsUUFBQSxLQUFBLEdBQVEsS0FBSyxDQUFDLE1BQU4scUVBQXVELEVBQXZELENBQVIsQ0FBQTtBQUFBLFFBQ0EsS0FBQSxHQUFRLEtBQUssQ0FBQyxNQUFOLDZFQUErRCxFQUEvRCxDQURSLENBREY7T0FIQTthQU1BLE1BUGM7SUFBQSxDQWxjaEIsQ0FBQTs7QUFBQSwyQkEyY0EsY0FBQSxHQUFnQixTQUFFLFdBQUYsR0FBQTtBQUFtQixNQUFsQixJQUFDLENBQUEsb0NBQUEsY0FBWSxFQUFLLENBQW5CO0lBQUEsQ0EzY2hCLENBQUE7O0FBQUEsMkJBNmNBLDBCQUFBLEdBQTRCLFNBQUUsdUJBQUYsR0FBQTtBQUE0QixNQUEzQixJQUFDLENBQUEsMEJBQUEsdUJBQTBCLENBQTVCO0lBQUEsQ0E3YzVCLENBQUE7O0FBQUEsMkJBK2NBLGVBQUEsR0FBaUIsU0FBQSxHQUFBO0FBQ2YsVUFBQSwwQkFBQTtBQUFBLE1BQUEsS0FBQSxpREFBd0IsRUFBeEIsQ0FBQTtBQUNBLE1BQUEsSUFBQSxDQUFBLElBQVEsQ0FBQSx3QkFBUjtBQUNFLFFBQUEsS0FBQSxHQUFRLEtBQUssQ0FBQyxNQUFOLDBEQUF3QyxFQUF4QyxDQUFSLENBQUE7QUFBQSxRQUNBLEtBQUEsR0FBUSxLQUFLLENBQUMsTUFBTixrRUFBb0QsRUFBcEQsQ0FEUixDQURGO09BREE7YUFJQSxNQUxlO0lBQUEsQ0EvY2pCLENBQUE7O0FBQUEsMkJBc2RBLHFCQUFBLEdBQXVCLFNBQUEsR0FBQTtBQUNyQixVQUFBLEtBQUE7K0VBQXdDLENBQUUsR0FBMUMsQ0FBOEMsU0FBQyxDQUFELEdBQUE7QUFDNUMsUUFBQSxJQUFHLE9BQU8sQ0FBQyxJQUFSLENBQWEsQ0FBYixDQUFIO2lCQUF3QixDQUFBLEdBQUksSUFBNUI7U0FBQSxNQUFBO2lCQUFxQyxFQUFyQztTQUQ0QztNQUFBLENBQTlDLFdBRHFCO0lBQUEsQ0F0ZHZCLENBQUE7O0FBQUEsMkJBMGRBLGVBQUEsR0FBaUIsU0FBRSxZQUFGLEdBQUE7QUFDZixNQURnQixJQUFDLENBQUEsc0NBQUEsZUFBYSxFQUM5QixDQUFBO0FBQUEsTUFBQSxJQUFPLDBCQUFKLElBQTBCLGdDQUE3QjtBQUNFLGVBQU8sT0FBTyxDQUFDLE1BQVIsQ0FBZSxnQ0FBZixDQUFQLENBREY7T0FBQTthQUdBLElBQUMsQ0FBQSxVQUFELENBQUEsQ0FBYSxDQUFDLElBQWQsQ0FBbUIsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtBQUNqQixjQUFBLE9BQUE7QUFBQSxVQUFBLE9BQUEsR0FBVSxLQUFDLENBQUEsS0FBSyxDQUFDLE1BQVAsQ0FBYyxTQUFDLENBQUQsR0FBQTttQkFBTyxLQUFDLENBQUEsYUFBRCxDQUFlLENBQWYsRUFBUDtVQUFBLENBQWQsQ0FBVixDQUFBO0FBQUEsVUFDQSxLQUFDLENBQUEsdUJBQUQsQ0FBeUIsT0FBekIsQ0FEQSxDQUFBO0FBQUEsVUFHQSxLQUFDLENBQUEsS0FBRCxHQUFTLEtBQUMsQ0FBQSxLQUFLLENBQUMsTUFBUCxDQUFjLFNBQUMsQ0FBRCxHQUFBO21CQUFPLENBQUEsS0FBRSxDQUFBLGFBQUQsQ0FBZSxDQUFmLEVBQVI7VUFBQSxDQUFkLENBSFQsQ0FBQTtpQkFJQSxLQUFDLENBQUEscUJBQUQsQ0FBdUIsSUFBdkIsRUFMaUI7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFuQixFQUplO0lBQUEsQ0ExZGpCLENBQUE7O0FBQUEsMkJBcWVBLDJCQUFBLEdBQTZCLFNBQUUsd0JBQUYsR0FBQTtBQUMzQixNQUQ0QixJQUFDLENBQUEsMkJBQUEsd0JBQzdCLENBQUE7YUFBQSxJQUFDLENBQUEsV0FBRCxDQUFBLEVBRDJCO0lBQUEsQ0FyZTdCLENBQUE7O0FBQUEsMkJBd2VBLGdCQUFBLEdBQWtCLFNBQUEsR0FBQTtBQUNoQixVQUFBLG9CQUFBO0FBQUEsTUFBQSxNQUFBLGtEQUEwQixFQUExQixDQUFBO0FBQ0EsTUFBQSxJQUFBLENBQUEsSUFBUSxDQUFBLHlCQUFSO0FBQ0UsUUFBQSxNQUFBLEdBQVMsTUFBTSxDQUFDLE1BQVAsdUVBQTBELEVBQTFELENBQVQsQ0FERjtPQURBO0FBQUEsTUFJQSxNQUFBLEdBQVMsTUFBTSxDQUFDLE1BQVAsQ0FBYyxJQUFDLENBQUEsZ0JBQWYsQ0FKVCxDQUFBO2FBS0EsT0FOZ0I7SUFBQSxDQXhlbEIsQ0FBQTs7QUFBQSwyQkFnZkEsZ0JBQUEsR0FBa0IsU0FBRSxhQUFGLEdBQUE7QUFDaEIsTUFEaUIsSUFBQyxDQUFBLHdDQUFBLGdCQUFjLEVBQ2hDLENBQUE7YUFBQSxJQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsQ0FBYywyQkFBZCxFQUEyQyxJQUFDLENBQUEsZ0JBQUQsQ0FBQSxDQUEzQyxFQURnQjtJQUFBLENBaGZsQixDQUFBOztBQUFBLDJCQW1mQSw0QkFBQSxHQUE4QixTQUFFLHlCQUFGLEdBQUE7QUFDNUIsTUFENkIsSUFBQyxDQUFBLDRCQUFBLHlCQUM5QixDQUFBO2FBQUEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQWMsMkJBQWQsRUFBMkMsSUFBQyxDQUFBLGdCQUFELENBQUEsQ0FBM0MsRUFENEI7SUFBQSxDQW5mOUIsQ0FBQTs7QUFBQSwyQkFzZkEscUJBQUEsR0FBdUIsU0FBRSxrQkFBRixHQUFBO0FBQ3JCLE1BRHNCLElBQUMsQ0FBQSxrREFBQSxxQkFBbUIsRUFDMUMsQ0FBQTtBQUFBLE1BQUEsSUFBQyxDQUFBLHNCQUFELENBQUEsQ0FBQSxDQUFBO2FBQ0EsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQWMsMkJBQWQsRUFBMkMsSUFBQyxDQUFBLGdCQUFELENBQUEsQ0FBM0MsRUFGcUI7SUFBQSxDQXRmdkIsQ0FBQTs7QUFBQSwyQkEwZkEsc0JBQUEsR0FBd0IsU0FBQSxHQUFBO2FBQ3RCLElBQUMsQ0FBQSxnQkFBRCxHQUFvQixJQUFDLENBQUEsbUJBQUQsQ0FBQSxFQURFO0lBQUEsQ0ExZnhCLENBQUE7O0FBQUEsMkJBNmZBLG1CQUFBLEdBQXFCLFNBQUEsR0FBQTtBQUNuQixVQUFBLCtCQUFBO0FBQUEsTUFBQSxTQUFBLHVEQUFrQyxFQUFsQyxDQUFBO0FBRUEsTUFBQSxJQUFBLENBQUEsSUFBUSxDQUFBLDhCQUFSO0FBQ0UsUUFBQSxTQUFBLEdBQVksU0FBUyxDQUFDLE1BQVYsNEVBQWtFLEVBQWxFLENBQVosQ0FERjtPQUZBO0FBS0EsTUFBQSxJQUFxQixTQUFTLENBQUMsTUFBVixLQUFvQixDQUF6QztBQUFBLFFBQUEsU0FBQSxHQUFZLENBQUMsR0FBRCxDQUFaLENBQUE7T0FMQTtBQU9BLE1BQUEsSUFBYSxTQUFTLENBQUMsSUFBVixDQUFlLFNBQUMsSUFBRCxHQUFBO2VBQVUsSUFBQSxLQUFRLElBQWxCO01BQUEsQ0FBZixDQUFiO0FBQUEsZUFBTyxFQUFQLENBQUE7T0FQQTtBQUFBLE1BU0EsTUFBQSxHQUFTLFNBQVMsQ0FBQyxHQUFWLENBQWMsU0FBQyxHQUFELEdBQUE7QUFDckIsWUFBQSxLQUFBO21GQUEwQyxDQUFFLFNBQVMsQ0FBQyxPQUF0RCxDQUE4RCxLQUE5RCxFQUFxRSxLQUFyRSxXQURxQjtNQUFBLENBQWQsQ0FFVCxDQUFDLE1BRlEsQ0FFRCxTQUFDLEtBQUQsR0FBQTtlQUFXLGNBQVg7TUFBQSxDQUZDLENBVFQsQ0FBQTthQWFBLENBQUUsVUFBQSxHQUFTLENBQUMsTUFBTSxDQUFDLElBQVAsQ0FBWSxHQUFaLENBQUQsQ0FBVCxHQUEyQixJQUE3QixFQWRtQjtJQUFBLENBN2ZyQixDQUFBOztBQUFBLDJCQTZnQkEsaUNBQUEsR0FBbUMsU0FBRSw4QkFBRixHQUFBO0FBQ2pDLE1BRGtDLElBQUMsQ0FBQSxpQ0FBQSw4QkFDbkMsQ0FBQTtBQUFBLE1BQUEsSUFBQyxDQUFBLHNCQUFELENBQUEsQ0FBQSxDQUFBO2FBQ0EsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQWMsMkJBQWQsRUFBMkMsSUFBQyxDQUFBLGdCQUFELENBQUEsQ0FBM0MsRUFGaUM7SUFBQSxDQTdnQm5DLENBQUE7O0FBQUEsMkJBaWhCQSxjQUFBLEdBQWdCLFNBQUEsR0FBQTthQUFHLElBQUMsQ0FBQSxjQUFKO0lBQUEsQ0FqaEJoQixDQUFBOztBQUFBLDJCQW1oQkEsZ0JBQUEsR0FBa0IsU0FBQyxhQUFELEdBQUE7QUFDaEIsTUFBQSxJQUE0QixhQUFBLEtBQWlCLElBQUMsQ0FBQSxhQUE5QztBQUFBLGVBQU8sT0FBTyxDQUFDLE9BQVIsQ0FBQSxDQUFQLENBQUE7T0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLGFBQUQsR0FBaUIsYUFGakIsQ0FBQTtBQUdBLE1BQUEsSUFBRyxJQUFDLENBQUEsYUFBSjtBQUNFLFFBQUEsSUFBQyxDQUFBLGtCQUFELEdBQXNCLElBQUksQ0FBQyxNQUFNLENBQUMsdUJBQVosQ0FBb0MsQ0FBQSxTQUFBLEtBQUEsR0FBQTtpQkFBQSxTQUFBLEdBQUE7QUFDeEQsZ0JBQUEsU0FBQTtBQUFBLFlBQUEsSUFBQSxDQUFBLEtBQWUsQ0FBQSxhQUFmO0FBQUEsb0JBQUEsQ0FBQTthQUFBO0FBQUEsWUFFQSxTQUFBLEdBQVksS0FBQyxDQUFBLG1CQUFELENBQUEsQ0FGWixDQUFBO21CQUdBLEtBQUMsQ0FBQSxTQUFTLENBQUMsb0JBQVgsQ0FBZ0MsZUFBaEMsRUFBaUQsU0FBakQsRUFKd0Q7VUFBQSxFQUFBO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFwQyxDQUF0QixDQUFBO0FBQUEsUUFNQSxJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBQyxDQUFBLGtCQUFwQixDQU5BLENBQUE7ZUFPQSxJQUFDLENBQUEsU0FBUyxDQUFDLE9BQVgsQ0FBbUIsSUFBQyxDQUFBLG1CQUFELENBQUEsQ0FBbkIsRUFSRjtPQUFBLE1BQUE7QUFVRSxRQUFBLElBQUMsQ0FBQSxhQUFhLENBQUMsTUFBZixDQUFzQixJQUFDLENBQUEsa0JBQXZCLENBQUEsQ0FBQTtBQUFBLFFBQ0EsSUFBQyxDQUFBLFNBQVMsQ0FBQyx1QkFBWCxDQUFtQyxDQUFDLGVBQUQsQ0FBbkMsQ0FEQSxDQUFBO2VBRUEsSUFBQyxDQUFBLGtCQUFrQixDQUFDLE9BQXBCLENBQUEsRUFaRjtPQUpnQjtJQUFBLENBbmhCbEIsQ0FBQTs7QUFBQSwyQkFxaUJBLFlBQUEsR0FBYyxTQUFBLEdBQUE7YUFBTyxJQUFBLElBQUEsQ0FBQSxFQUFQO0lBQUEsQ0FyaUJkLENBQUE7O0FBQUEsMkJBdWlCQSxTQUFBLEdBQVcsU0FBQSxHQUFBO0FBQ1QsVUFBQSxJQUFBO0FBQUEsTUFBQSxJQUFBLEdBQ0U7QUFBQSxRQUFBLFlBQUEsRUFBYyxjQUFkO0FBQUEsUUFDQSxTQUFBLEVBQVcsSUFBQyxDQUFBLFlBQUQsQ0FBQSxDQURYO0FBQUEsUUFFQSxPQUFBLEVBQVMsaUJBRlQ7QUFBQSxRQUdBLGNBQUEsRUFBZ0IseUJBSGhCO0FBQUEsUUFJQSxpQkFBQSxFQUFtQixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0Isc0JBQWhCLENBSm5CO0FBQUEsUUFLQSxrQkFBQSxFQUFvQixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsdUJBQWhCLENBTHBCO09BREYsQ0FBQTtBQVFBLE1BQUEsSUFBRyxvQ0FBSDtBQUNFLFFBQUEsSUFBSSxDQUFDLHVCQUFMLEdBQStCLElBQUMsQ0FBQSx1QkFBaEMsQ0FERjtPQVJBO0FBVUEsTUFBQSxJQUFHLG9DQUFIO0FBQ0UsUUFBQSxJQUFJLENBQUMsdUJBQUwsR0FBK0IsSUFBQyxDQUFBLHVCQUFoQyxDQURGO09BVkE7QUFZQSxNQUFBLElBQUcscUNBQUg7QUFDRSxRQUFBLElBQUksQ0FBQyx3QkFBTCxHQUFnQyxJQUFDLENBQUEsd0JBQWpDLENBREY7T0FaQTtBQWNBLE1BQUEsSUFBRyxzQ0FBSDtBQUNFLFFBQUEsSUFBSSxDQUFDLHlCQUFMLEdBQWlDLElBQUMsQ0FBQSx5QkFBbEMsQ0FERjtPQWRBO0FBZ0JBLE1BQUEsSUFBRywwQkFBSDtBQUNFLFFBQUEsSUFBSSxDQUFDLGFBQUwsR0FBcUIsSUFBQyxDQUFBLGFBQXRCLENBREY7T0FoQkE7QUFrQkEsTUFBQSxJQUFHLDBCQUFIO0FBQ0UsUUFBQSxJQUFJLENBQUMsYUFBTCxHQUFxQixJQUFDLENBQUEsYUFBdEIsQ0FERjtPQWxCQTtBQW9CQSxNQUFBLElBQUcseUJBQUg7QUFDRSxRQUFBLElBQUksQ0FBQyxZQUFMLEdBQW9CLElBQUMsQ0FBQSxZQUFyQixDQURGO09BcEJBO0FBc0JBLE1BQUEsSUFBRyx3QkFBSDtBQUNFLFFBQUEsSUFBSSxDQUFDLFdBQUwsR0FBbUIsSUFBQyxDQUFBLFdBQXBCLENBREY7T0F0QkE7QUF3QkEsTUFBQSxJQUFHLHdCQUFIO0FBQ0UsUUFBQSxJQUFJLENBQUMsV0FBTCxHQUFtQixJQUFDLENBQUEsV0FBcEIsQ0FERjtPQXhCQTtBQUFBLE1BMkJBLElBQUksQ0FBQyxPQUFMLEdBQWUsSUFBQyxDQUFBLGdCQUFELENBQUEsQ0EzQmYsQ0FBQTtBQTZCQSxNQUFBLElBQUcsSUFBQyxDQUFBLGFBQUQsQ0FBQSxDQUFIO0FBQ0UsUUFBQSxJQUFJLENBQUMsS0FBTCxHQUFhLElBQUMsQ0FBQSxLQUFkLENBQUE7QUFBQSxRQUNBLElBQUksQ0FBQyxTQUFMLEdBQWlCLElBQUMsQ0FBQSxTQUFTLENBQUMsU0FBWCxDQUFBLENBRGpCLENBREY7T0E3QkE7YUFpQ0EsS0FsQ1M7SUFBQSxDQXZpQlgsQ0FBQTs7QUFBQSwyQkEya0JBLGdCQUFBLEdBQWtCLFNBQUEsR0FBQTtBQUNoQixVQUFBLDJCQUFBO0FBQUEsTUFBQSxHQUFBLEdBQU0sRUFBTixDQUFBO0FBQ0E7QUFBQSxXQUFBLFdBQUE7Z0NBQUE7QUFDRSxRQUFBLEdBQUksQ0FBQSxFQUFBLENBQUosR0FBVSxXQUFXLENBQUMsU0FBWixDQUFBLENBQVYsQ0FERjtBQUFBLE9BREE7YUFHQSxJQUpnQjtJQUFBLENBM2tCbEIsQ0FBQTs7d0JBQUE7O01BdkZGLENBQUE7QUFBQSIKfQ==

//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/pigments/lib/color-project.coffee
