(function() {
  var ATOM_VARIABLES, ColorBuffer, ColorProject, ColorSearch, CompositeDisposable, Emitter, Palette, PathsLoader, PathsScanner, Range, SERIALIZE_MARKERS_VERSION, SERIALIZE_VERSION, THEME_VARIABLES, VariablesCollection, compareArray, minimatch, ref, scopeFromFileName,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  ref = [], ColorBuffer = ref[0], ColorSearch = ref[1], Palette = ref[2], VariablesCollection = ref[3], PathsLoader = ref[4], PathsScanner = ref[5], Emitter = ref[6], CompositeDisposable = ref[7], Range = ref[8], SERIALIZE_VERSION = ref[9], SERIALIZE_MARKERS_VERSION = ref[10], THEME_VARIABLES = ref[11], ATOM_VARIABLES = ref[12], scopeFromFileName = ref[13], minimatch = ref[14];

  compareArray = function(a, b) {
    var i, j, len, v;
    if ((a == null) || (b == null)) {
      return false;
    }
    if (a.length !== b.length) {
      return false;
    }
    for (i = j = 0, len = a.length; j < len; i = ++j) {
      v = a[i];
      if (v !== b[i]) {
        return false;
      }
    }
    return true;
  };

  module.exports = ColorProject = (function() {
    ColorProject.deserialize = function(state) {
      var markersVersion, ref1;
      if (SERIALIZE_VERSION == null) {
        ref1 = require('./versions'), SERIALIZE_VERSION = ref1.SERIALIZE_VERSION, SERIALIZE_MARKERS_VERSION = ref1.SERIALIZE_MARKERS_VERSION;
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
      var buffers, ref1, svgColorExpression, timestamp, variables;
      if (state == null) {
        state = {};
      }
      if (Emitter == null) {
        ref1 = require('atom'), Emitter = ref1.Emitter, CompositeDisposable = ref1.CompositeDisposable, Range = ref1.Range;
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
        return function(arg) {
          var name;
          name = arg.name;
          if ((_this.paths == null) || name === 'pigments:variables') {
            return;
          }
          return _this.variables.evaluateVariables(_this.variables.getVariables(), function() {
            var colorBuffer, id, ref2, results1;
            ref2 = _this.colorBuffersByEditorId;
            results1 = [];
            for (id in ref2) {
              colorBuffer = ref2[id];
              results1.push(colorBuffer.update());
            }
            return results1;
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
      var colorBuffer, id, ref1;
      ref1 = this.colorBuffersByEditorId;
      for (id in ref1) {
        colorBuffer = ref1[id];
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
      var buffer, id, ref1;
      if (this.destroyed) {
        return;
      }
      if (PathsScanner == null) {
        PathsScanner = require('./paths-scanner');
      }
      this.destroyed = true;
      PathsScanner.terminateRunningTask();
      ref1 = this.colorBuffersByEditorId;
      for (id in ref1) {
        buffer = ref1[id];
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
          if (atom.config.get('pigments.notifyReloads')) {
            return atom.notifications.addSuccess("Pigments successfully reloaded", {
              dismissable: atom.config.get('pigments.dismissableReloadNotifications'),
              description: "Found:\n- **" + _this.paths.length + "** path(s)\n- **" + (_this.getVariables().length) + "** variables(s) including **" + (_this.getColorVariables().length) + "** color(s)"
            });
          } else {
            return console.log("Found:\n- " + _this.paths.length + " path(s)\n- " + (_this.getVariables().length) + " variables(s) including " + (_this.getColorVariables().length) + " color(s)");
          }
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
        return function(arg) {
          var dirtied, j, len, path, removed;
          dirtied = arg.dirtied, removed = arg.removed;
          if (removed.length > 0) {
            _this.paths = _this.paths.filter(function(p) {
              return indexOf.call(removed, p) < 0;
            });
            _this.deleteVariablesForPaths(removed);
          }
          if ((_this.paths != null) && dirtied.length > 0) {
            for (j = 0, len = dirtied.length; j < len; j++) {
              path = dirtied[j];
              if (indexOf.call(_this.paths, path) < 0) {
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
      var colorBuffer, id, ref1;
      ref1 = this.colorBuffersByEditorId;
      for (id in ref1) {
        colorBuffer = ref1[id];
        if (colorBuffer.editor.getPath() === path) {
          return colorBuffer;
        }
      }
    };

    ColorProject.prototype.updateColorBuffers = function() {
      var buffer, bufferElement, e, editor, id, j, len, ref1, ref2, results1;
      ref1 = this.colorBuffersByEditorId;
      for (id in ref1) {
        buffer = ref1[id];
        if (this.isBufferIgnored(buffer.editor.getPath())) {
          buffer.destroy();
          delete this.colorBuffersByEditorId[id];
        }
      }
      try {
        if (this.colorBuffersByEditorId != null) {
          ref2 = atom.workspace.getTextEditors();
          results1 = [];
          for (j = 0, len = ref2.length; j < len; j++) {
            editor = ref2[j];
            if (this.hasColorBufferForEditor(editor) || this.isBufferIgnored(editor.getPath())) {
              continue;
            }
            buffer = this.colorBufferForEditor(editor);
            if (buffer != null) {
              bufferElement = atom.views.getView(buffer);
              results1.push(bufferElement.attach());
            } else {
              results1.push(void 0);
            }
          }
          return results1;
        }
      } catch (error) {
        e = error;
        return console.log(e);
      }
    };

    ColorProject.prototype.isBufferIgnored = function(path) {
      var j, len, ref1, source, sources;
      if (minimatch == null) {
        minimatch = require('minimatch');
      }
      path = atom.project.relativize(path);
      sources = (ref1 = this.ignoredBufferNames) != null ? ref1 : [];
      for (j = 0, len = sources.length; j < len; j++) {
        source = sources[j];
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
      var ref1;
      return (ref1 = this.paths) != null ? ref1.slice() : void 0;
    };

    ColorProject.prototype.appendPath = function(path) {
      if (path != null) {
        return this.paths.push(path);
      }
    };

    ColorProject.prototype.hasPath = function(path) {
      var ref1;
      return indexOf.call((ref1 = this.paths) != null ? ref1 : [], path) >= 0;
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
          var config, knownPaths, ref1, rootPaths;
          rootPaths = _this.getRootPaths();
          knownPaths = noKnownPaths ? [] : (ref1 = _this.paths) != null ? ref1 : [];
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
            var isDescendentOfRootPaths, j, len, p;
            for (j = 0, len = knownPaths.length; j < len; j++) {
              p = knownPaths[j];
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
        return function(arg) {
          var dirtied, j, len, p, removed;
          dirtied = arg.dirtied, removed = arg.removed;
          _this.deleteVariablesForPaths(removed);
          _this.paths = _this.paths.filter(function(p) {
            return indexOf.call(removed, p) < 0;
          });
          for (j = 0, len = dirtied.length; j < len; j++) {
            p = dirtied[j];
            if (indexOf.call(_this.paths, p) < 0) {
              _this.paths.push(p);
            }
          }
          _this.emitter.emit('did-change-paths', _this.getPaths());
          return _this.reloadVariablesForPaths(dirtied);
        };
      })(this));
    };

    ColorProject.prototype.isVariablesSourcePath = function(path) {
      var j, len, source, sources;
      if (!path) {
        return false;
      }
      if (minimatch == null) {
        minimatch = require('minimatch');
      }
      path = atom.project.relativize(path);
      sources = this.getSourceNames();
      for (j = 0, len = sources.length; j < len; j++) {
        source = sources[j];
        if (minimatch(path, source, {
          matchBase: true,
          dot: true
        })) {
          return true;
        }
      }
    };

    ColorProject.prototype.isIgnoredPath = function(path) {
      var ignore, ignoredNames, j, len;
      if (!path) {
        return false;
      }
      if (minimatch == null) {
        minimatch = require('minimatch');
      }
      path = atom.project.relativize(path);
      ignoredNames = this.getIgnoredNames();
      for (j = 0, len = ignoredNames.length; j < len; j++) {
        ignore = ignoredNames[j];
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
        var buffer, bufferRange, ref1;
        if (Range == null) {
          ref1 = require('atom'), Emitter = ref1.Emitter, CompositeDisposable = ref1.CompositeDisposable, Range = ref1.Range;
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
            return indexOf.call(_this.paths, path) < 0;
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
      var ref1, ref2;
      return (ref1 = (ref2 = this.sassShadeAndTintImplementation) != null ? ref2 : atom.config.get('pigments.sassShadeAndTintImplementation')) != null ? ref1 : 'compass';
    };

    ColorProject.prototype.setSassShadeAndTintImplementation = function(sassShadeAndTintImplementation) {
      this.sassShadeAndTintImplementation = sassShadeAndTintImplementation;
      return this.colorExpressionsRegistry.emitter.emit('did-update-expressions', {
        registry: this.colorExpressionsRegistry
      });
    };

    ColorProject.prototype.getSourceNames = function() {
      var names, ref1, ref2;
      names = ['.pigments'];
      names = names.concat((ref1 = this.sourceNames) != null ? ref1 : []);
      if (!this.ignoreGlobalSourceNames) {
        names = names.concat((ref2 = atom.config.get('pigments.sourceNames')) != null ? ref2 : []);
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
      var names, ref1, ref2, ref3, ref4;
      names = [];
      names = names.concat((ref1 = this.sourceNames) != null ? ref1 : []);
      names = names.concat((ref2 = this.searchNames) != null ? ref2 : []);
      if (!this.ignoreGlobalSearchNames) {
        names = names.concat((ref3 = atom.config.get('pigments.sourceNames')) != null ? ref3 : []);
        names = names.concat((ref4 = atom.config.get('pigments.extendedSearchNames')) != null ? ref4 : []);
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
      var names, ref1, ref2, ref3;
      names = (ref1 = this.ignoredNames) != null ? ref1 : [];
      if (!this.ignoreGlobalIgnoredNames) {
        names = names.concat((ref2 = this.getGlobalIgnoredNames()) != null ? ref2 : []);
        names = names.concat((ref3 = atom.config.get('core.ignoredNames')) != null ? ref3 : []);
      }
      return names;
    };

    ColorProject.prototype.getGlobalIgnoredNames = function() {
      var ref1;
      return (ref1 = atom.config.get('pigments.ignoredNames')) != null ? ref1.map(function(p) {
        if (/\/\*$/.test(p)) {
          return p + '*';
        } else {
          return p;
        }
      }) : void 0;
    };

    ColorProject.prototype.setIgnoredNames = function(ignoredNames1) {
      this.ignoredNames = ignoredNames1 != null ? ignoredNames1 : [];
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
      var ref1, ref2, scopes;
      scopes = (ref1 = this.ignoredScopes) != null ? ref1 : [];
      if (!this.ignoreGlobalIgnoredScopes) {
        scopes = scopes.concat((ref2 = atom.config.get('pigments.ignoredScopes')) != null ? ref2 : []);
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
      var filetypes, ref1, ref2, scopes;
      filetypes = (ref1 = this.supportedFiletypes) != null ? ref1 : [];
      if (!this.ignoreGlobalSupportedFiletypes) {
        filetypes = filetypes.concat((ref2 = atom.config.get('pigments.supportedFiletypes')) != null ? ref2 : []);
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
        var ref3;
        return (ref3 = atom.grammars.selectGrammar("file." + ext)) != null ? ref3.scopeName.replace(/\./g, '\\.') : void 0;
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
      var data, ref1;
      if (SERIALIZE_VERSION == null) {
        ref1 = require('./versions'), SERIALIZE_VERSION = ref1.SERIALIZE_VERSION, SERIALIZE_MARKERS_VERSION = ref1.SERIALIZE_MARKERS_VERSION;
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
      var colorBuffer, id, out, ref1;
      out = {};
      ref1 = this.colorBuffersByEditorId;
      for (id in ref1) {
        colorBuffer = ref1[id];
        out[id] = colorBuffer.serialize();
      }
      return out;
    };

    return ColorProject;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvcGlnbWVudHMvbGliL2NvbG9yLXByb2plY3QuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSxvUUFBQTtJQUFBOztFQUFBLE1BUUksRUFSSixFQUNFLG9CQURGLEVBQ2Usb0JBRGYsRUFFRSxnQkFGRixFQUVXLDRCQUZYLEVBR0Usb0JBSEYsRUFHZSxxQkFIZixFQUlFLGdCQUpGLEVBSVcsNEJBSlgsRUFJZ0MsY0FKaEMsRUFLRSwwQkFMRixFQUtxQixtQ0FMckIsRUFLZ0QseUJBTGhELEVBS2lFLHdCQUxqRSxFQU1FLDJCQU5GLEVBT0U7O0VBR0YsWUFBQSxHQUFlLFNBQUMsQ0FBRCxFQUFHLENBQUg7QUFDYixRQUFBO0lBQUEsSUFBb0IsV0FBSixJQUFjLFdBQTlCO0FBQUEsYUFBTyxNQUFQOztJQUNBLElBQW9CLENBQUMsQ0FBQyxNQUFGLEtBQVksQ0FBQyxDQUFDLE1BQWxDO0FBQUEsYUFBTyxNQUFQOztBQUNBLFNBQUEsMkNBQUE7O1VBQStCLENBQUEsS0FBTyxDQUFFLENBQUEsQ0FBQTtBQUF4QyxlQUFPOztBQUFQO0FBQ0EsV0FBTztFQUpNOztFQU1mLE1BQU0sQ0FBQyxPQUFQLEdBQ007SUFDSixZQUFDLENBQUEsV0FBRCxHQUFjLFNBQUMsS0FBRDtBQUNaLFVBQUE7TUFBQSxJQUFPLHlCQUFQO1FBQ0UsT0FBaUQsT0FBQSxDQUFRLFlBQVIsQ0FBakQsRUFBQywwQ0FBRCxFQUFvQiwyREFEdEI7O01BR0EsY0FBQSxHQUFpQjtNQUNqQixJQUE0QixJQUFJLENBQUMsU0FBTCxDQUFBLENBQUEsSUFBcUIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFiLENBQUEsQ0FBdUIsQ0FBQyxJQUF4QixDQUE2QixTQUFDLENBQUQ7ZUFBTyxDQUFDLENBQUMsS0FBRixDQUFRLGFBQVI7TUFBUCxDQUE3QixDQUFqRDtRQUFBLGNB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RywwQkFBSDtRQUNFLElBQUksQ0FBQyxhQUFMLEdBQXFCLElBQUMsQ0FBQSxjQUR4Qjs7TUFFQSxJQUFHLDBCQUFIO1FBQ0UsSUFBSSxDQUFDLGFBQUwsR0FBcUIsSUFBQyxDQUFBLGNBRHhCOztNQUVBLElBQUcseUJBQUg7UUFDRSxJQUFJLENBQUMsWUFBTCxHQUFvQixJQUFDLENBQUEsYUFEdkI7O01BRUEsSUFBRyx3QkFBSDtRQUNFLElBQUksQ0FBQyxXQUFMLEdBQW1CLElBQUMsQ0FBQSxZQUR0Qjs7TUFFQSxJQUFHLHdCQUFIO1FBQ0UsSUFBSSxDQUFDLFdBQUwsR0FBbUIsSUFBQyxDQUFBLFlBRHRCOztNQUdBLElBQUksQ0FBQyxPQUFMLEdBQWUsSUFBQyxDQUFBLGdCQUFELENBQUE7TUFFZixJQUFHLElBQUMsQ0FBQSxhQUFELENBQUEsQ0FBSDtRQUNFLElBQUksQ0FBQyxLQUFMLEdBQWEsSUFBQyxDQUFBO1FBQ2QsSUFBSSxDQUFDLFNBQUwsR0FBaUIsSUFBQyxDQUFBLFNBQVMsQ0FBQyxTQUFYLENBQUEsRUFGbkI7O2FBSUE7SUFyQ1M7OzJCQXVDWCxnQkFBQSxHQUFrQixTQUFBO0FBQ2hCLFVBQUE7TUFBQSxHQUFBLEdBQU07QUFDTjtBQUFBLFdBQUEsVUFBQTs7UUFDRSxHQUFJLENBQUEsRUFBQSxDQUFKLEdBQVUsV0FBVyxDQUFDLFNBQVosQ0FBQTtBQURaO2FBRUE7SUFKZ0I7Ozs7O0FBOXJCcEIiLCJzb3VyY2VzQ29udGVudCI6WyJbXG4gIENvbG9yQnVmZmVyLCBDb2xvclNlYXJjaCxcbiAgUGFsZXR0ZSwgVmFyaWFibGVzQ29sbGVjdGlvbixcbiAgUGF0aHNMb2FkZXIsIFBhdGhzU2Nhbm5lcixcbiAgRW1pdHRlciwgQ29tcG9zaXRlRGlzcG9zYWJsZSwgUmFuZ2UsXG4gIFNFUklBTElaRV9WRVJTSU9OLCBTRVJJQUxJWkVfTUFSS0VSU19WRVJTSU9OLCBUSEVNRV9WQVJJQUJMRVMsIEFUT01fVkFSSUFCTEVTLFxuICBzY29wZUZyb21GaWxlTmFtZSxcbiAgbWluaW1hdGNoXG5dID0gW11cblxuY29tcGFyZUFycmF5ID0gKGEsYikgLT5cbiAgcmV0dXJuIGZhbHNlIGlmIG5vdCBhPyBvciBub3QgYj9cbiAgcmV0dXJuIGZhbHNlIHVubGVzcyBhLmxlbmd0aCBpcyBiLmxlbmd0aFxuICByZXR1cm4gZmFsc2UgZm9yIHYsaSBpbiBhIHdoZW4gdiBpc250IGJbaV1cbiAgcmV0dXJuIHRydWVcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgQ29sb3JQcm9qZWN0XG4gIEBkZXNlcmlhbGl6ZTogKHN0YXRlKSAtPlxuICAgIHVubGVzcyBTRVJJQUxJWkVfVkVSU0lPTj9cbiAgICAgIHtTRVJJQUxJWkVfVkVSU0lPTiwgU0VSSUFMSVpFX01BUktFUlNfVkVSU0lPTn0gPSByZXF1aXJlICcuL3ZlcnNpb25zJ1xuXG4gICAgbWFya2Vyc1ZlcnNpb24gPSBTRVJJQUxJWkVfTUFSS0VSU19WRVJTSU9OXG4gICAgbWFya2Vyc1ZlcnNpb24gKz0gJy1kZXYnIGlmIGF0b20uaW5EZXZNb2RlKCkgYW5kIGF0b20ucHJvamVjdC5nZXRQYXRocygpLnNvbWUgKHApIC0+IHAubWF0Y2goL1xcL3BpZ21lbnRzJC8pXG5cbiAgICBpZiBzdGF0ZT8udmVyc2lvbiBpc250IFNFUklBTElaRV9WRVJTSU9OXG4gICAgICBzdGF0ZSA9IHt9XG5cbiAgICBpZiBzdGF0ZT8ubWFya2Vyc1ZlcnNpb24gaXNudCBtYXJrZXJzVmVyc2lvblxuICAgICAgZGVsZXRlIHN0YXRlLnZhcmlhYmxlc1xuICAgICAgZGVsZXRlIHN0YXRlLmJ1ZmZlcnNcblxuICAgIGlmIG5vdCBjb21wYXJlQXJyYXkoc3RhdGUuZ2xvYmFsU291cmNlTmFtZXMsIGF0b20uY29uZmlnLmdldCgncGlnbWVudHMuc291cmNlTmFtZXMnKSkgb3Igbm90IGNvbXBhcmVBcnJheShzdGF0ZS5nbG9iYWxJZ25vcmVkTmFtZXMsIGF0b20uY29uZmlnLmdldCgncGlnbWVudHMuaWdub3JlZE5hbWVzJykpXG4gICAgICBkZWxldGUgc3RhdGUudmFyaWFibGVzXG4gICAgICBkZWxldGUgc3RhdGUuYnVmZmVyc1xuICAgICAgZGVsZXRlIHN0YXRlLnBhdGhzXG5cbiAgICBuZXcgQ29sb3JQcm9qZWN0KHN0YXRlKVxuXG4gIGNvbnN0cnVjdG9yOiAoc3RhdGU9e30pIC0+XG4gICAge0VtaXR0ZXIsIENvbXBvc2l0ZURpc3Bvc2FibGUsIFJhbmdlfSA9IHJlcXVpcmUgJ2F0b20nIHVubGVzcyBFbWl0dGVyP1xuICAgIFZhcmlhYmxlc0NvbGxlY3Rpb24gPz0gcmVxdWlyZSAnLi92YXJpYWJsZXMtY29sbGVjdGlvbidcblxuICAgIHtcbiAgICAgIEBpbmNsdWRlVGhlbWVzLCBAaWdub3JlZE5hbWVzLCBAc291cmNlTmFtZXMsIEBpZ25vcmVkU2NvcGVzLCBAcGF0aHMsIEBzZWFyY2hOYW1lcywgQGlnbm9yZUdsb2JhbFNvdXJjZU5hbWVzLCBAaWdub3JlR2xvYmFsSWdub3JlZE5hbWVzLCBAaWdub3JlR2xvYmFsSWdub3JlZFNjb3BlcywgQGlnbm9yZUdsb2JhbFNlYXJjaE5hbWVzLCBAaWdub3JlR2xvYmFsU3VwcG9ydGVkRmlsZXR5cGVzLCBAc3VwcG9ydGVkRmlsZXR5cGVzLCB2YXJpYWJsZXMsIHRpbWVzdGFtcCwgYnVmZmVyc1xuICAgIH0gPSBzdGF0ZVxuXG4gICAgQGVtaXR0ZXIgPSBuZXcgRW1pdHRlclxuICAgIEBzdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcbiAgICBAY29sb3JCdWZmZXJzQnlFZGl0b3JJZCA9IHt9XG4gICAgQGJ1ZmZlclN0YXRlcyA9IGJ1ZmZlcnMgPyB7fVxuXG4gICAgQHZhcmlhYmxlRXhwcmVzc2lvbnNSZWdpc3RyeSA9IHJlcXVpcmUgJy4vdmFyaWFibGUtZXhwcmVzc2lvbnMnXG4gICAgQGNvbG9yRXhwcmVzc2lvbnNSZWdpc3RyeSA9IHJlcXVpcmUgJy4vY29sb3ItZXhwcmVzc2lvbnMnXG5cbiAgICBpZiB2YXJpYWJsZXM/XG4gICAgICBAdmFyaWFibGVzID0gYXRvbS5kZXNlcmlhbGl6ZXJzLmRlc2VyaWFsaXplKHZhcmlhYmxlcylcbiAgICBlbHNlXG4gICAgICBAdmFyaWFibGVzID0gbmV3IFZhcmlhYmxlc0NvbGxlY3Rpb25cblxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBAdmFyaWFibGVzLm9uRGlkQ2hhbmdlIChyZXN1bHRzKSA9PlxuICAgICAgQGVtaXRWYXJpYWJsZXNDaGFuZ2VFdmVudChyZXN1bHRzKVxuXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29uZmlnLm9ic2VydmUgJ3BpZ21lbnRzLnNvdXJjZU5hbWVzJywgPT5cbiAgICAgIEB1cGRhdGVQYXRocygpXG5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb25maWcub2JzZXJ2ZSAncGlnbWVudHMuaWdub3JlZE5hbWVzJywgPT5cbiAgICAgIEB1cGRhdGVQYXRocygpXG5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb25maWcub2JzZXJ2ZSAncGlnbWVudHMuaWdub3JlZEJ1ZmZlck5hbWVzJywgKEBpZ25vcmVkQnVmZmVyTmFtZXMpID0+XG4gICAgICBAdXBkYXRlQ29sb3JCdWZmZXJzKClcblxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbmZpZy5vYnNlcnZlICdwaWdtZW50cy5pZ25vcmVkU2NvcGVzJywgPT5cbiAgICAgIEBlbWl0dGVyLmVtaXQoJ2RpZC1jaGFuZ2UtaWdub3JlZC1zY29wZXMnLCBAZ2V0SWdub3JlZFNjb3BlcygpKVxuXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29uZmlnLm9ic2VydmUgJ3BpZ21lbnRzLnN1cHBvcnRlZEZpbGV0eXBlcycsID0+XG4gICAgICBAdXBkYXRlSWdub3JlZEZpbGV0eXBlcygpXG4gICAgICBAZW1pdHRlci5lbWl0KCdkaWQtY2hhbmdlLWlnbm9yZWQtc2NvcGVzJywgQGdldElnbm9yZWRTY29wZXMoKSlcblxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbmZpZy5vYnNlcnZlICdwaWdtZW50cy5pZ25vcmVWY3NJZ25vcmVkUGF0aHMnLCA9PlxuICAgICAgQGxvYWRQYXRoc0FuZFZhcmlhYmxlcygpXG5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb25maWcub2JzZXJ2ZSAncGlnbWVudHMuc2Fzc1NoYWRlQW5kVGludEltcGxlbWVudGF0aW9uJywgPT5cbiAgICAgIEBjb2xvckV4cHJlc3Npb25zUmVnaXN0cnkuZW1pdHRlci5lbWl0ICdkaWQtdXBkYXRlLWV4cHJlc3Npb25zJywge1xuICAgICAgICByZWdpc3RyeTogQGNvbG9yRXhwcmVzc2lvbnNSZWdpc3RyeVxuICAgICAgfVxuXG4gICAgc3ZnQ29sb3JFeHByZXNzaW9uID0gQGNvbG9yRXhwcmVzc2lvbnNSZWdpc3RyeS5nZXRFeHByZXNzaW9uKCdwaWdtZW50czpuYW1lZF9jb2xvcnMnKVxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbmZpZy5vYnNlcnZlICdwaWdtZW50cy5maWxldHlwZXNGb3JDb2xvcldvcmRzJywgKHNjb3BlcykgPT5cbiAgICAgIHN2Z0NvbG9yRXhwcmVzc2lvbi5zY29wZXMgPSBzY29wZXMgPyBbXVxuICAgICAgQGNvbG9yRXhwcmVzc2lvbnNSZWdpc3RyeS5lbWl0dGVyLmVtaXQgJ2RpZC11cGRhdGUtZXhwcmVzc2lvbnMnLCB7XG4gICAgICAgIG5hbWU6IHN2Z0NvbG9yRXhwcmVzc2lvbi5uYW1lXG4gICAgICAgIHJlZ2lzdHJ5OiBAY29sb3JFeHByZXNzaW9uc1JlZ2lzdHJ5XG4gICAgICB9XG5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgQGNvbG9yRXhwcmVzc2lvbnNSZWdpc3RyeS5vbkRpZFVwZGF0ZUV4cHJlc3Npb25zICh7bmFtZX0pID0+XG4gICAgICByZXR1cm4gaWYgbm90IEBwYXRocz8gb3IgbmFtZSBpcyAncGlnbWVudHM6dmFyaWFibGVzJ1xuICAgICAgQHZhcmlhYmxlcy5ldmFsdWF0ZVZhcmlhYmxlcyBAdmFyaWFibGVzLmdldFZhcmlhYmxlcygpLCA9PlxuICAgICAgICBjb2xvckJ1ZmZlci51cGRhdGUoKSBmb3IgaWQsIGNvbG9yQnVmZmVyIG9mIEBjb2xvckJ1ZmZlcnNCeUVkaXRvcklkXG5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgQHZhcmlhYmxlRXhwcmVzc2lvbnNSZWdpc3RyeS5vbkRpZFVwZGF0ZUV4cHJlc3Npb25zID0+XG4gICAgICByZXR1cm4gdW5sZXNzIEBwYXRocz9cbiAgICAgIEByZWxvYWRWYXJpYWJsZXNGb3JQYXRocyhAZ2V0UGF0aHMoKSlcblxuICAgIEB0aW1lc3RhbXAgPSBuZXcgRGF0ZShEYXRlLnBhcnNlKHRpbWVzdGFtcCkpIGlmIHRpbWVzdGFtcD9cblxuICAgIEB1cGRhdGVJZ25vcmVkRmlsZXR5cGVzKClcblxuICAgIEBpbml0aWFsaXplKCkgaWYgQHBhdGhzP1xuICAgIEBpbml0aWFsaXplQnVmZmVycygpXG5cbiAgb25EaWRJbml0aWFsaXplOiAoY2FsbGJhY2spIC0+XG4gICAgQGVtaXR0ZXIub24gJ2RpZC1pbml0aWFsaXplJywgY2FsbGJhY2tcblxuICBvbkRpZERlc3Ryb3k6IChjYWxsYmFjaykgLT5cbiAgICBAZW1pdHRlci5vbiAnZGlkLWRlc3Ryb3knLCBjYWxsYmFja1xuXG4gIG9uRGlkVXBkYXRlVmFyaWFibGVzOiAoY2FsbGJhY2spIC0+XG4gICAgQGVtaXR0ZXIub24gJ2RpZC11cGRhdGUtdmFyaWFibGVzJywgY2FsbGJhY2tcblxuICBvbkRpZENyZWF0ZUNvbG9yQnVmZmVyOiAoY2FsbGJhY2spIC0+XG4gICAgQGVtaXR0ZXIub24gJ2RpZC1jcmVhdGUtY29sb3ItYnVmZmVyJywgY2FsbGJhY2tcblxuICBvbkRpZENoYW5nZUlnbm9yZWRTY29wZXM6IChjYWxsYmFjaykgLT5cbiAgICBAZW1pdHRlci5vbiAnZGlkLWNoYW5nZS1pZ25vcmVkLXNjb3BlcycsIGNhbGxiYWNrXG5cbiAgb25EaWRDaGFuZ2VQYXRoczogKGNhbGxiYWNrKSAtPlxuICAgIEBlbWl0dGVyLm9uICdkaWQtY2hhbmdlLXBhdGhzJywgY2FsbGJhY2tcblxuICBvYnNlcnZlQ29sb3JCdWZmZXJzOiAoY2FsbGJhY2spIC0+XG4gICAgY2FsbGJhY2soY29sb3JCdWZmZXIpIGZvciBpZCxjb2xvckJ1ZmZlciBvZiBAY29sb3JCdWZmZXJzQnlFZGl0b3JJZFxuICAgIEBvbkRpZENyZWF0ZUNvbG9yQnVmZmVyKGNhbGxiYWNrKVxuXG4gIGlzSW5pdGlhbGl6ZWQ6IC0+IEBpbml0aWFsaXplZFxuXG4gIGlzRGVzdHJveWVkOiAtPiBAZGVzdHJveWVkXG5cbiAgaW5pdGlhbGl6ZTogLT5cbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKEB2YXJpYWJsZXMuZ2V0VmFyaWFibGVzKCkpIGlmIEBpc0luaXRpYWxpemVkKClcbiAgICByZXR1cm4gQGluaXRpYWxpemVQcm9taXNlIGlmIEBpbml0aWFsaXplUHJvbWlzZT9cbiAgICBAaW5pdGlhbGl6ZVByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT5cbiAgICAgIEB2YXJpYWJsZXMub25jZUluaXRpYWxpemVkKHJlc29sdmUpXG4gICAgKVxuICAgIC50aGVuID0+XG4gICAgICBAbG9hZFBhdGhzQW5kVmFyaWFibGVzKClcbiAgICAudGhlbiA9PlxuICAgICAgQGluY2x1ZGVUaGVtZXNWYXJpYWJsZXMoKSBpZiBAaW5jbHVkZVRoZW1lc1xuICAgIC50aGVuID0+XG4gICAgICBAaW5pdGlhbGl6ZWQgPSB0cnVlXG5cbiAgICAgIHZhcmlhYmxlcyA9IEB2YXJpYWJsZXMuZ2V0VmFyaWFibGVzKClcbiAgICAgIEBlbWl0dGVyLmVtaXQgJ2RpZC1pbml0aWFsaXplJywgdmFyaWFibGVzXG4gICAgICB2YXJpYWJsZXNcblxuICBkZXN0cm95OiAtPlxuICAgIHJldHVybiBpZiBAZGVzdHJveWVkXG5cbiAgICBQYXRoc1NjYW5uZXIgPz0gcmVxdWlyZSAnLi9wYXRocy1zY2FubmVyJ1xuXG4gICAgQGRlc3Ryb3llZCA9IHRydWVcblxuICAgIFBhdGhzU2Nhbm5lci50ZXJtaW5hdGVSdW5uaW5nVGFzaygpXG5cbiAgICBidWZmZXIuZGVzdHJveSgpIGZvciBpZCxidWZmZXIgb2YgQGNvbG9yQnVmZmVyc0J5RWRpdG9ySWRcbiAgICBAY29sb3JCdWZmZXJzQnlFZGl0b3JJZCA9IG51bGxcblxuICAgIEBzdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICAgIEBzdWJzY3JpcHRpb25zID0gbnVsbFxuXG4gICAgQGVtaXR0ZXIuZW1pdCAnZGlkLWRlc3Ryb3knLCB0aGlzXG4gICAgQGVtaXR0ZXIuZGlzcG9zZSgpXG5cbiAgcmVsb2FkOiAtPlxuICAgIEBpbml0aWFsaXplKCkudGhlbiA9PlxuICAgICAgQHZhcmlhYmxlcy5yZXNldCgpXG4gICAgICBAcGF0aHMgPSBbXVxuICAgICAgQGxvYWRQYXRoc0FuZFZhcmlhYmxlcygpXG4gICAgLnRoZW4gPT5cbiAgICAgIGlmIGF0b20uY29uZmlnLmdldCgncGlnbWVudHMubm90aWZ5UmVsb2FkcycpXG4gICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRTdWNjZXNzKFwiUGlnbWVudHMgc3VjY2Vzc2Z1bGx5IHJlbG9hZGVkXCIsIGRpc21pc3NhYmxlOiBhdG9tLmNvbmZpZy5nZXQoJ3BpZ21lbnRzLmRpc21pc3NhYmxlUmVsb2FkTm90aWZpY2F0aW9ucycpLCBkZXNjcmlwdGlvbjogXCJcIlwiRm91bmQ6XG4gICAgICAgIC0gKioje0BwYXRocy5sZW5ndGh9KiogcGF0aChzKVxuICAgICAgICAtICoqI3tAZ2V0VmFyaWFibGVzKCkubGVuZ3RofSoqIHZhcmlhYmxlcyhzKSBpbmNsdWRpbmcgKioje0BnZXRDb2xvclZhcmlhYmxlcygpLmxlbmd0aH0qKiBjb2xvcihzKVxuICAgICAgICBcIlwiXCIpXG4gICAgICBlbHNlXG4gICAgICAgIGNvbnNvbGUubG9nKFwiXCJcIkZvdW5kOlxuICAgICAgICAtICN7QHBhdGhzLmxlbmd0aH0gcGF0aChzKVxuICAgICAgICAtICN7QGdldFZhcmlhYmxlcygpLmxlbmd0aH0gdmFyaWFibGVzKHMpIGluY2x1ZGluZyAje0BnZXRDb2xvclZhcmlhYmxlcygpLmxlbmd0aH0gY29sb3IocylcbiAgICAgICAgXCJcIlwiKVxuICAgIC5jYXRjaCAocmVhc29uKSAtPlxuICAgICAgZGV0YWlsID0gcmVhc29uLm1lc3NhZ2VcbiAgICAgIHN0YWNrID0gcmVhc29uLnN0YWNrXG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoXCJQaWdtZW50cyBjb3VsZG4ndCBiZSByZWxvYWRlZFwiLCB7ZGV0YWlsLCBzdGFjaywgZGlzbWlzc2FibGU6IHRydWV9KVxuICAgICAgY29uc29sZS5lcnJvciByZWFzb25cblxuICBsb2FkUGF0aHNBbmRWYXJpYWJsZXM6IC0+XG4gICAgZGVzdHJveWVkID0gbnVsbFxuXG4gICAgQGxvYWRQYXRocygpLnRoZW4gKHtkaXJ0aWVkLCByZW1vdmVkfSkgPT5cbiAgICAgICMgV2UgY2FuIGZpbmQgcmVtb3ZlZCBmaWxlcyBvbmx5IHdoZW4gdGhlcmUncyBhbHJlYWR5IHBhdGhzIGZyb21cbiAgICAgICMgYSBzZXJpYWxpemVkIHN0YXRlXG4gICAgICBpZiByZW1vdmVkLmxlbmd0aCA+IDBcbiAgICAgICAgQHBhdGhzID0gQHBhdGhzLmZpbHRlciAocCkgLT4gcCBub3QgaW4gcmVtb3ZlZFxuICAgICAgICBAZGVsZXRlVmFyaWFibGVzRm9yUGF0aHMocmVtb3ZlZClcblxuICAgICAgIyBUaGVyZSB3YXMgc2VyaWFsaXplZCBwYXRocywgYW5kIHRoZSBpbml0aWFsaXphdGlvbiBkaXNjb3ZlcmVkXG4gICAgICAjIHNvbWUgbmV3IG9yIGRpcnR5IG9uZXMuXG4gICAgICBpZiBAcGF0aHM/IGFuZCBkaXJ0aWVkLmxlbmd0aCA+IDBcbiAgICAgICAgQHBhdGhzLnB1c2ggcGF0aCBmb3IgcGF0aCBpbiBkaXJ0aWVkIHdoZW4gcGF0aCBub3QgaW4gQHBhdGhzXG5cbiAgICAgICAgIyBUaGVyZSB3YXMgYWxzbyBzZXJpYWxpemVkIHZhcmlhYmxlcywgc28gd2UnbGwgcmVzY2FuIG9ubHkgdGhlXG4gICAgICAgICMgZGlydHkgcGF0aHNcbiAgICAgICAgaWYgQHZhcmlhYmxlcy5sZW5ndGhcbiAgICAgICAgICBkaXJ0aWVkXG4gICAgICAgICMgVGhlcmUgd2FzIG5vIHZhcmlhYmxlcywgc28gaXQncyBwcm9iYWJseSBiZWNhdXNlIHRoZSBtYXJrZXJzXG4gICAgICAgICMgdmVyc2lvbiBjaGFuZ2VkLCB3ZSdsbCByZXNjYW4gYWxsIHRoZSBmaWxlc1xuICAgICAgICBlbHNlXG4gICAgICAgICAgQHBhdGhzXG4gICAgICAjIFRoZXJlIHdhcyBubyBzZXJpYWxpemVkIHBhdGhzLCBzbyB0aGVyZSdzIG5vIHZhcmlhYmxlcyBuZWl0aGVyXG4gICAgICBlbHNlIHVubGVzcyBAcGF0aHM/XG4gICAgICAgIEBwYXRocyA9IGRpcnRpZWRcbiAgICAgICMgT25seSB0aGUgbWFya2VycyB2ZXJzaW9uIGNoYW5nZWQsIGFsbCB0aGUgcGF0aHMgZnJvbSB0aGUgc2VyaWFsaXplZFxuICAgICAgIyBzdGF0ZSB3aWxsIGJlIHJlc2Nhbm5lZFxuICAgICAgZWxzZSB1bmxlc3MgQHZhcmlhYmxlcy5sZW5ndGhcbiAgICAgICAgQHBhdGhzXG4gICAgICAjIE5vdGhpbmcgY2hhbmdlZCwgdGhlcmUncyBubyBkaXJ0eSBwYXRocyB0byByZXNjYW5cbiAgICAgIGVsc2VcbiAgICAgICAgW11cbiAgICAudGhlbiAocGF0aHMpID0+XG4gICAgICBAbG9hZFZhcmlhYmxlc0ZvclBhdGhzKHBhdGhzKVxuICAgIC50aGVuIChyZXN1bHRzKSA9PlxuICAgICAgQHZhcmlhYmxlcy51cGRhdGVDb2xsZWN0aW9uKHJlc3VsdHMpIGlmIHJlc3VsdHM/XG5cbiAgZmluZEFsbENvbG9yczogLT5cbiAgICBDb2xvclNlYXJjaCA/PSByZXF1aXJlICcuL2NvbG9yLXNlYXJjaCdcblxuICAgIHBhdHRlcm5zID0gQGdldFNlYXJjaE5hbWVzKClcbiAgICBuZXcgQ29sb3JTZWFyY2hcbiAgICAgIHNvdXJjZU5hbWVzOiBwYXR0ZXJuc1xuICAgICAgcHJvamVjdDogdGhpc1xuICAgICAgaWdub3JlZE5hbWVzOiBAZ2V0SWdub3JlZE5hbWVzKClcbiAgICAgIGNvbnRleHQ6IEBnZXRDb250ZXh0KClcblxuICBzZXRDb2xvclBpY2tlckFQSTogKEBjb2xvclBpY2tlckFQSSkgLT5cblxuICAjIyAgICAjIyMjIyMjIyAgIyMgICAgICMjICMjIyMjIyMjICMjIyMjIyMjICMjIyMjIyMjICMjIyMjIyMjICAgIyMjIyMjXG4gICMjICAgICMjICAgICAjIyAjIyAgICAgIyMgIyMgICAgICAgIyMgICAgICAgIyMgICAgICAgIyMgICAgICMjICMjICAgICMjXG4gICMjICAgICMjICAgICAjIyAjIyAgICAgIyMgIyMgICAgICAgIyMgICAgICAgIyMgICAgICAgIyMgICAgICMjICMjXG4gICMjICAgICMjIyMjIyMjICAjIyAgICAgIyMgIyMjIyMjICAgIyMjIyMjICAgIyMjIyMjICAgIyMjIyMjIyMgICAjIyMjIyNcbiAgIyMgICAgIyMgICAgICMjICMjICAgICAjIyAjIyAgICAgICAjIyAgICAgICAjIyAgICAgICAjIyAgICMjICAgICAgICAgIyNcbiAgIyMgICAgIyMgICAgICMjICMjICAgICAjIyAjIyAgICAgICAjIyAgICAgICAjIyAgICAgICAjIyAgICAjIyAgIyMgICAgIyNcbiAgIyMgICAgIyMjIyMjIyMgICAjIyMjIyMjICAjIyAgICAgICAjIyAgICAgICAjIyMjIyMjIyAjIyAgICAgIyMgICMjIyMjI1xuXG4gIGluaXRpYWxpemVCdWZmZXJzOiAtPlxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLndvcmtzcGFjZS5vYnNlcnZlVGV4dEVkaXRvcnMgKGVkaXRvcikgPT5cbiAgICAgIGVkaXRvclBhdGggPSBlZGl0b3IuZ2V0UGF0aCgpXG4gICAgICByZXR1cm4gaWYgbm90IGVkaXRvclBhdGg/IG9yIEBpc0J1ZmZlcklnbm9yZWQoZWRpdG9yUGF0aClcblxuICAgICAgYnVmZmVyID0gQGNvbG9yQnVmZmVyRm9yRWRpdG9yKGVkaXRvcilcbiAgICAgIGlmIGJ1ZmZlcj9cbiAgICAgICAgYnVmZmVyRWxlbWVudCA9IGF0b20udmlld3MuZ2V0VmlldyhidWZmZXIpXG4gICAgICAgIGJ1ZmZlckVsZW1lbnQuYXR0YWNoKClcblxuICBoYXNDb2xvckJ1ZmZlckZvckVkaXRvcjogKGVkaXRvcikgLT5cbiAgICByZXR1cm4gZmFsc2UgaWYgQGRlc3Ryb3llZCBvciBub3QgZWRpdG9yP1xuICAgIEBjb2xvckJ1ZmZlcnNCeUVkaXRvcklkW2VkaXRvci5pZF0/XG5cbiAgY29sb3JCdWZmZXJGb3JFZGl0b3I6IChlZGl0b3IpIC0+XG4gICAgcmV0dXJuIGlmIEBkZXN0cm95ZWRcbiAgICByZXR1cm4gdW5sZXNzIGVkaXRvcj9cblxuICAgIENvbG9yQnVmZmVyID89IHJlcXVpcmUgJy4vY29sb3ItYnVmZmVyJ1xuXG4gICAgaWYgQGNvbG9yQnVmZmVyc0J5RWRpdG9ySWRbZWRpdG9yLmlkXT9cbiAgICAgIHJldHVybiBAY29sb3JCdWZmZXJzQnlFZGl0b3JJZFtlZGl0b3IuaWRdXG5cbiAgICBpZiBAYnVmZmVyU3RhdGVzW2VkaXRvci5pZF0/XG4gICAgICBzdGF0ZSA9IEBidWZmZXJTdGF0ZXNbZWRpdG9yLmlkXVxuICAgICAgc3RhdGUuZWRpdG9yID0gZWRpdG9yXG4gICAgICBzdGF0ZS5wcm9qZWN0ID0gdGhpc1xuICAgICAgZGVsZXRlIEBidWZmZXJTdGF0ZXNbZWRpdG9yLmlkXVxuICAgIGVsc2VcbiAgICAgIHN0YXRlID0ge2VkaXRvciwgcHJvamVjdDogdGhpc31cblxuICAgIEBjb2xvckJ1ZmZlcnNCeUVkaXRvcklkW2VkaXRvci5pZF0gPSBidWZmZXIgPSBuZXcgQ29sb3JCdWZmZXIoc3RhdGUpXG5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgc3Vic2NyaXB0aW9uID0gYnVmZmVyLm9uRGlkRGVzdHJveSA9PlxuICAgICAgQHN1YnNjcmlwdGlvbnMucmVtb3ZlKHN1YnNjcmlwdGlvbilcbiAgICAgIHN1YnNjcmlwdGlvbi5kaXNwb3NlKClcbiAgICAgIGRlbGV0ZSBAY29sb3JCdWZmZXJzQnlFZGl0b3JJZFtlZGl0b3IuaWRdXG5cbiAgICBAZW1pdHRlci5lbWl0ICdkaWQtY3JlYXRlLWNvbG9yLWJ1ZmZlcicsIGJ1ZmZlclxuXG4gICAgYnVmZmVyXG5cbiAgY29sb3JCdWZmZXJGb3JQYXRoOiAocGF0aCkgLT5cbiAgICBmb3IgaWQsY29sb3JCdWZmZXIgb2YgQGNvbG9yQnVmZmVyc0J5RWRpdG9ySWRcbiAgICAgIHJldHVybiBjb2xvckJ1ZmZlciBpZiBjb2xvckJ1ZmZlci5lZGl0b3IuZ2V0UGF0aCgpIGlzIHBhdGhcblxuICB1cGRhdGVDb2xvckJ1ZmZlcnM6IC0+XG4gICAgZm9yIGlkLCBidWZmZXIgb2YgQGNvbG9yQnVmZmVyc0J5RWRpdG9ySWRcbiAgICAgIGlmIEBpc0J1ZmZlcklnbm9yZWQoYnVmZmVyLmVkaXRvci5nZXRQYXRoKCkpXG4gICAgICAgIGJ1ZmZlci5kZXN0cm95KClcbiAgICAgICAgZGVsZXRlIEBjb2xvckJ1ZmZlcnNCeUVkaXRvcklkW2lkXVxuXG4gICAgdHJ5XG4gICAgICBpZiBAY29sb3JCdWZmZXJzQnlFZGl0b3JJZD9cbiAgICAgICAgZm9yIGVkaXRvciBpbiBhdG9tLndvcmtzcGFjZS5nZXRUZXh0RWRpdG9ycygpXG4gICAgICAgICAgY29udGludWUgaWYgQGhhc0NvbG9yQnVmZmVyRm9yRWRpdG9yKGVkaXRvcikgb3IgQGlzQnVmZmVySWdub3JlZChlZGl0b3IuZ2V0UGF0aCgpKVxuXG4gICAgICAgICAgYnVmZmVyID0gQGNvbG9yQnVmZmVyRm9yRWRpdG9yKGVkaXRvcilcbiAgICAgICAgICBpZiBidWZmZXI/XG4gICAgICAgICAgICBidWZmZXJFbGVtZW50ID0gYXRvbS52aWV3cy5nZXRWaWV3KGJ1ZmZlcilcbiAgICAgICAgICAgIGJ1ZmZlckVsZW1lbnQuYXR0YWNoKClcblxuICAgIGNhdGNoIGVcbiAgICAgIGNvbnNvbGUubG9nIGVcblxuICBpc0J1ZmZlcklnbm9yZWQ6IChwYXRoKSAtPlxuICAgIG1pbmltYXRjaCA/PSByZXF1aXJlICdtaW5pbWF0Y2gnXG5cbiAgICBwYXRoID0gYXRvbS5wcm9qZWN0LnJlbGF0aXZpemUocGF0aClcbiAgICBzb3VyY2VzID0gQGlnbm9yZWRCdWZmZXJOYW1lcyA/IFtdXG4gICAgcmV0dXJuIHRydWUgZm9yIHNvdXJjZSBpbiBzb3VyY2VzIHdoZW4gbWluaW1hdGNoKHBhdGgsIHNvdXJjZSwgbWF0Y2hCYXNlOiB0cnVlLCBkb3Q6IHRydWUpXG4gICAgZmFsc2VcblxuICAjIyAgICAjIyMjIyMjIyAgICAgIyMjICAgICMjIyMjIyMjICMjICAgICAjIyAgIyMjIyMjXG4gICMjICAgICMjICAgICAjIyAgICMjICMjICAgICAgIyMgICAgIyMgICAgICMjICMjICAgICMjXG4gICMjICAgICMjICAgICAjIyAgIyMgICAjIyAgICAgIyMgICAgIyMgICAgICMjICMjXG4gICMjICAgICMjIyMjIyMjICAjIyAgICAgIyMgICAgIyMgICAgIyMjIyMjIyMjICAjIyMjIyNcbiAgIyMgICAgIyMgICAgICAgICMjIyMjIyMjIyAgICAjIyAgICAjIyAgICAgIyMgICAgICAgIyNcbiAgIyMgICAgIyMgICAgICAgICMjICAgICAjIyAgICAjIyAgICAjIyAgICAgIyMgIyMgICAgIyNcbiAgIyMgICAgIyMgICAgICAgICMjICAgICAjIyAgICAjIyAgICAjIyAgICAgIyMgICMjIyMjI1xuXG4gIGdldFBhdGhzOiAtPiBAcGF0aHM/LnNsaWNlKClcblxuICBhcHBlbmRQYXRoOiAocGF0aCkgLT4gQHBhdGhzLnB1c2gocGF0aCkgaWYgcGF0aD9cblxuICBoYXNQYXRoOiAocGF0aCkgLT4gcGF0aCBpbiAoQHBhdGhzID8gW10pXG5cbiAgbG9hZFBhdGhzOiAobm9Lbm93blBhdGhzPWZhbHNlKSAtPlxuICAgIFBhdGhzTG9hZGVyID89IHJlcXVpcmUgJy4vcGF0aHMtbG9hZGVyJ1xuXG4gICAgbmV3IFByb21pc2UgKHJlc29sdmUsIHJlamVjdCkgPT5cbiAgICAgIHJvb3RQYXRocyA9IEBnZXRSb290UGF0aHMoKVxuICAgICAga25vd25QYXRocyA9IGlmIG5vS25vd25QYXRocyB0aGVuIFtdIGVsc2UgQHBhdGhzID8gW11cbiAgICAgIGNvbmZpZyA9IHtcbiAgICAgICAga25vd25QYXRoc1xuICAgICAgICBAdGltZXN0YW1wXG4gICAgICAgIGlnbm9yZWROYW1lczogQGdldElnbm9yZWROYW1lcygpXG4gICAgICAgIHBhdGhzOiByb290UGF0aHNcbiAgICAgICAgdHJhdmVyc2VJbnRvU3ltbGlua0RpcmVjdG9yaWVzOiBhdG9tLmNvbmZpZy5nZXQgJ3BpZ21lbnRzLnRyYXZlcnNlSW50b1N5bWxpbmtEaXJlY3RvcmllcydcbiAgICAgICAgc291cmNlTmFtZXM6IEBnZXRTb3VyY2VOYW1lcygpXG4gICAgICAgIGlnbm9yZVZjc0lnbm9yZXM6IGF0b20uY29uZmlnLmdldCgncGlnbWVudHMuaWdub3JlVmNzSWdub3JlZFBhdGhzJylcbiAgICAgIH1cbiAgICAgIFBhdGhzTG9hZGVyLnN0YXJ0VGFzayBjb25maWcsIChyZXN1bHRzKSA9PlxuICAgICAgICBmb3IgcCBpbiBrbm93blBhdGhzXG4gICAgICAgICAgaXNEZXNjZW5kZW50T2ZSb290UGF0aHMgPSByb290UGF0aHMuc29tZSAocm9vdCkgLT5cbiAgICAgICAgICAgIHAuaW5kZXhPZihyb290KSBpcyAwXG5cbiAgICAgICAgICB1bmxlc3MgaXNEZXNjZW5kZW50T2ZSb290UGF0aHNcbiAgICAgICAgICAgIHJlc3VsdHMucmVtb3ZlZCA/PSBbXVxuICAgICAgICAgICAgcmVzdWx0cy5yZW1vdmVkLnB1c2gocClcblxuICAgICAgICByZXNvbHZlKHJlc3VsdHMpXG5cbiAgdXBkYXRlUGF0aHM6IC0+XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpIHVubGVzcyBAaW5pdGlhbGl6ZWRcblxuICAgIEBsb2FkUGF0aHMoKS50aGVuICh7ZGlydGllZCwgcmVtb3ZlZH0pID0+XG4gICAgICBAZGVsZXRlVmFyaWFibGVzRm9yUGF0aHMocmVtb3ZlZClcblxuICAgICAgQHBhdGhzID0gQHBhdGhzLmZpbHRlciAocCkgLT4gcCBub3QgaW4gcmVtb3ZlZFxuICAgICAgQHBhdGhzLnB1c2gocCkgZm9yIHAgaW4gZGlydGllZCB3aGVuIHAgbm90IGluIEBwYXRoc1xuXG4gICAgICBAZW1pdHRlci5lbWl0ICdkaWQtY2hhbmdlLXBhdGhzJywgQGdldFBhdGhzKClcbiAgICAgIEByZWxvYWRWYXJpYWJsZXNGb3JQYXRocyhkaXJ0aWVkKVxuXG4gIGlzVmFyaWFibGVzU291cmNlUGF0aDogKHBhdGgpIC0+XG4gICAgcmV0dXJuIGZhbHNlIHVubGVzcyBwYXRoXG5cbiAgICBtaW5pbWF0Y2ggPz0gcmVxdWlyZSAnbWluaW1hdGNoJ1xuICAgIHBhdGggPSBhdG9tLnByb2plY3QucmVsYXRpdml6ZShwYXRoKVxuICAgIHNvdXJjZXMgPSBAZ2V0U291cmNlTmFtZXMoKVxuXG4gICAgcmV0dXJuIHRydWUgZm9yIHNvdXJjZSBpbiBzb3VyY2VzIHdoZW4gbWluaW1hdGNoKHBhdGgsIHNvdXJjZSwgbWF0Y2hCYXNlOiB0cnVlLCBkb3Q6IHRydWUpXG5cbiAgaXNJZ25vcmVkUGF0aDogKHBhdGgpIC0+XG4gICAgcmV0dXJuIGZhbHNlIHVubGVzcyBwYXRoXG5cbiAgICBtaW5pbWF0Y2ggPz0gcmVxdWlyZSAnbWluaW1hdGNoJ1xuICAgIHBhdGggPSBhdG9tLnByb2plY3QucmVsYXRpdml6ZShwYXRoKVxuICAgIGlnbm9yZWROYW1lcyA9IEBnZXRJZ25vcmVkTmFtZXMoKVxuXG4gICAgcmV0dXJuIHRydWUgZm9yIGlnbm9yZSBpbiBpZ25vcmVkTmFtZXMgd2hlbiBtaW5pbWF0Y2gocGF0aCwgaWdub3JlLCBtYXRjaEJhc2U6IHRydWUsIGRvdDogdHJ1ZSlcblxuICBzY29wZUZyb21GaWxlTmFtZTogKHBhdGgpIC0+XG4gICAgc2NvcGVGcm9tRmlsZU5hbWUgPz0gcmVxdWlyZSAnLi9zY29wZS1mcm9tLWZpbGUtbmFtZSdcblxuICAgIHNjb3BlID0gc2NvcGVGcm9tRmlsZU5hbWUocGF0aClcblxuICAgIGlmIHNjb3BlIGlzICdzYXNzJyBvciBzY29wZSBpcyAnc2NzcydcbiAgICAgIHNjb3BlID0gW3Njb3BlLCBAZ2V0U2Fzc1Njb3BlU3VmZml4KCldLmpvaW4oJzonKVxuXG4gICAgc2NvcGVcblxuICAjIyAgICAjIyAgICAgIyMgICAgIyMjICAgICMjIyMjIyMjICAgIyMjIyMjXG4gICMjICAgICMjICAgICAjIyAgICMjICMjICAgIyMgICAgICMjICMjICAgICMjXG4gICMjICAgICMjICAgICAjIyAgIyMgICAjIyAgIyMgICAgICMjICMjXG4gICMjICAgICMjICAgICAjIyAjIyAgICAgIyMgIyMjIyMjIyMgICAjIyMjIyNcbiAgIyMgICAgICMjICAgIyMgICMjIyMjIyMjIyAjIyAgICMjICAgICAgICAgIyNcbiAgIyMgICAgICAjIyAjIyAgICMjICAgICAjIyAjIyAgICAjIyAgIyMgICAgIyNcbiAgIyMgICAgICAgIyMjICAgICMjICAgICAjIyAjIyAgICAgIyMgICMjIyMjI1xuXG4gIGdldFBhbGV0dGU6IC0+XG4gICAgUGFsZXR0ZSA/PSByZXF1aXJlICcuL3BhbGV0dGUnXG5cbiAgICByZXR1cm4gbmV3IFBhbGV0dGUgdW5sZXNzIEBpc0luaXRpYWxpemVkKClcbiAgICBuZXcgUGFsZXR0ZShAZ2V0Q29sb3JWYXJpYWJsZXMoKSlcblxuICBnZXRDb250ZXh0OiAtPiBAdmFyaWFibGVzLmdldENvbnRleHQoKVxuXG4gIGdldFZhcmlhYmxlczogLT4gQHZhcmlhYmxlcy5nZXRWYXJpYWJsZXMoKVxuXG4gIGdldFZhcmlhYmxlRXhwcmVzc2lvbnNSZWdpc3RyeTogLT4gQHZhcmlhYmxlRXhwcmVzc2lvbnNSZWdpc3RyeVxuXG4gIGdldFZhcmlhYmxlQnlJZDogKGlkKSAtPiBAdmFyaWFibGVzLmdldFZhcmlhYmxlQnlJZChpZClcblxuICBnZXRWYXJpYWJsZUJ5TmFtZTogKG5hbWUpIC0+IEB2YXJpYWJsZXMuZ2V0VmFyaWFibGVCeU5hbWUobmFtZSlcblxuICBnZXRDb2xvclZhcmlhYmxlczogLT4gQHZhcmlhYmxlcy5nZXRDb2xvclZhcmlhYmxlcygpXG5cbiAgZ2V0Q29sb3JFeHByZXNzaW9uc1JlZ2lzdHJ5OiAtPiBAY29sb3JFeHByZXNzaW9uc1JlZ2lzdHJ5XG5cbiAgc2hvd1ZhcmlhYmxlSW5GaWxlOiAodmFyaWFibGUpIC0+XG4gICAgYXRvbS53b3Jrc3BhY2Uub3Blbih2YXJpYWJsZS5wYXRoKS50aGVuIChlZGl0b3IpIC0+XG4gICAgICB7RW1pdHRlciwgQ29tcG9zaXRlRGlzcG9zYWJsZSwgUmFuZ2V9ID0gcmVxdWlyZSAnYXRvbScgdW5sZXNzIFJhbmdlP1xuXG4gICAgICBidWZmZXIgPSBlZGl0b3IuZ2V0QnVmZmVyKClcblxuICAgICAgYnVmZmVyUmFuZ2UgPSBSYW5nZS5mcm9tT2JqZWN0IFtcbiAgICAgICAgYnVmZmVyLnBvc2l0aW9uRm9yQ2hhcmFjdGVySW5kZXgodmFyaWFibGUucmFuZ2VbMF0pXG4gICAgICAgIGJ1ZmZlci5wb3NpdGlvbkZvckNoYXJhY3RlckluZGV4KHZhcmlhYmxlLnJhbmdlWzFdKVxuICAgICAgXVxuXG4gICAgICBlZGl0b3Iuc2V0U2VsZWN0ZWRCdWZmZXJSYW5nZShidWZmZXJSYW5nZSwgYXV0b3Njcm9sbDogdHJ1ZSlcblxuICBlbWl0VmFyaWFibGVzQ2hhbmdlRXZlbnQ6IChyZXN1bHRzKSAtPlxuICAgIEBlbWl0dGVyLmVtaXQgJ2RpZC11cGRhdGUtdmFyaWFibGVzJywgcmVzdWx0c1xuXG4gIGxvYWRWYXJpYWJsZXNGb3JQYXRoOiAocGF0aCkgLT4gQGxvYWRWYXJpYWJsZXNGb3JQYXRocyBbcGF0aF1cblxuICBsb2FkVmFyaWFibGVzRm9yUGF0aHM6IChwYXRocykgLT5cbiAgICBuZXcgUHJvbWlzZSAocmVzb2x2ZSwgcmVqZWN0KSA9PlxuICAgICAgQHNjYW5QYXRoc0ZvclZhcmlhYmxlcyBwYXRocywgKHJlc3VsdHMpID0+IHJlc29sdmUocmVzdWx0cylcblxuICBnZXRWYXJpYWJsZXNGb3JQYXRoOiAocGF0aCkgLT4gQHZhcmlhYmxlcy5nZXRWYXJpYWJsZXNGb3JQYXRoKHBhdGgpXG5cbiAgZ2V0VmFyaWFibGVzRm9yUGF0aHM6IChwYXRocykgLT4gQHZhcmlhYmxlcy5nZXRWYXJpYWJsZXNGb3JQYXRocyhwYXRocylcblxuICBkZWxldGVWYXJpYWJsZXNGb3JQYXRoOiAocGF0aCkgLT4gQGRlbGV0ZVZhcmlhYmxlc0ZvclBhdGhzIFtwYXRoXVxuXG4gIGRlbGV0ZVZhcmlhYmxlc0ZvclBhdGhzOiAocGF0aHMpIC0+XG4gICAgQHZhcmlhYmxlcy5kZWxldGVWYXJpYWJsZXNGb3JQYXRocyhwYXRocylcblxuICByZWxvYWRWYXJpYWJsZXNGb3JQYXRoOiAocGF0aCkgLT4gQHJlbG9hZFZhcmlhYmxlc0ZvclBhdGhzIFtwYXRoXVxuXG4gIHJlbG9hZFZhcmlhYmxlc0ZvclBhdGhzOiAocGF0aHMpIC0+XG4gICAgcHJvbWlzZSA9IFByb21pc2UucmVzb2x2ZSgpXG4gICAgcHJvbWlzZSA9IEBpbml0aWFsaXplKCkgdW5sZXNzIEBpc0luaXRpYWxpemVkKClcblxuICAgIHByb21pc2VcbiAgICAudGhlbiA9PlxuICAgICAgaWYgcGF0aHMuc29tZSgocGF0aCkgPT4gcGF0aCBub3QgaW4gQHBhdGhzKVxuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKFtdKVxuXG4gICAgICBAbG9hZFZhcmlhYmxlc0ZvclBhdGhzKHBhdGhzKVxuICAgIC50aGVuIChyZXN1bHRzKSA9PlxuICAgICAgQHZhcmlhYmxlcy51cGRhdGVDb2xsZWN0aW9uKHJlc3VsdHMsIHBhdGhzKVxuXG4gIHNjYW5QYXRoc0ZvclZhcmlhYmxlczogKHBhdGhzLCBjYWxsYmFjaykgLT5cbiAgICBpZiBwYXRocy5sZW5ndGggaXMgMSBhbmQgY29sb3JCdWZmZXIgPSBAY29sb3JCdWZmZXJGb3JQYXRoKHBhdGhzWzBdKVxuICAgICAgY29sb3JCdWZmZXIuc2NhbkJ1ZmZlckZvclZhcmlhYmxlcygpLnRoZW4gKHJlc3VsdHMpIC0+IGNhbGxiYWNrKHJlc3VsdHMpXG4gICAgZWxzZVxuICAgICAgUGF0aHNTY2FubmVyID89IHJlcXVpcmUgJy4vcGF0aHMtc2Nhbm5lcidcblxuICAgICAgUGF0aHNTY2FubmVyLnN0YXJ0VGFzayBwYXRocy5tYXAoKHApID0+IFtwLCBAc2NvcGVGcm9tRmlsZU5hbWUocCldKSwgQHZhcmlhYmxlRXhwcmVzc2lvbnNSZWdpc3RyeSwgKHJlc3VsdHMpIC0+IGNhbGxiYWNrKHJlc3VsdHMpXG5cbiAgbG9hZFRoZW1lc1ZhcmlhYmxlczogLT5cbiAgICB7VEhFTUVfVkFSSUFCTEVTfSA9IHJlcXVpcmUgJy4vdXJpcycgdW5sZXNzIFRIRU1FX1ZBUklBQkxFUz9cbiAgICBBVE9NX1ZBUklBQkxFUyA/PSByZXF1aXJlICcuL2F0b20tdmFyaWFibGVzJ1xuXG4gICAgaXRlcmF0b3IgPSAwXG4gICAgdmFyaWFibGVzID0gW11cbiAgICBodG1sID0gJydcbiAgICBBVE9NX1ZBUklBQkxFUy5mb3JFYWNoICh2KSAtPiBodG1sICs9IFwiPGRpdiBjbGFzcz0nI3t2fSc+I3t2fTwvZGl2PlwiXG5cbiAgICBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgIGRpdi5jbGFzc05hbWUgPSAncGlnbWVudHMtc2FtcGxlcidcbiAgICBkaXYuaW5uZXJIVE1MID0gaHRtbFxuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoZGl2KVxuXG4gICAgQVRPTV9WQVJJQUJMRVMuZm9yRWFjaCAodixpKSAtPlxuICAgICAgbm9kZSA9IGRpdi5jaGlsZHJlbltpXVxuICAgICAgY29sb3IgPSBnZXRDb21wdXRlZFN0eWxlKG5vZGUpLmNvbG9yXG4gICAgICBlbmQgPSBpdGVyYXRvciArIHYubGVuZ3RoICsgY29sb3IubGVuZ3RoICsgNFxuXG4gICAgICB2YXJpYWJsZSA9XG4gICAgICAgIG5hbWU6IFwiQCN7dn1cIlxuICAgICAgICBsaW5lOiBpXG4gICAgICAgIHZhbHVlOiBjb2xvclxuICAgICAgICByYW5nZTogW2l0ZXJhdG9yLGVuZF1cbiAgICAgICAgcGF0aDogVEhFTUVfVkFSSUFCTEVTXG5cbiAgICAgIGl0ZXJhdG9yID0gZW5kXG4gICAgICB2YXJpYWJsZXMucHVzaCh2YXJpYWJsZSlcblxuICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQoZGl2KVxuICAgIHJldHVybiB2YXJpYWJsZXNcblxuICAjIyAgICAgIyMjIyMjICAjIyMjIyMjIyAjIyMjIyMjIyAjIyMjIyMjIyAjIyMjICMjICAgICMjICAjIyMjIyMgICAgIyMjIyMjXG4gICMjICAgICMjICAgICMjICMjICAgICAgICAgICMjICAgICAgICMjICAgICAjIyAgIyMjICAgIyMgIyMgICAgIyMgICMjICAgICMjXG4gICMjICAgICMjICAgICAgICMjICAgICAgICAgICMjICAgICAgICMjICAgICAjIyAgIyMjIyAgIyMgIyMgICAgICAgICMjXG4gICMjICAgICAjIyMjIyMgICMjIyMjIyAgICAgICMjICAgICAgICMjICAgICAjIyAgIyMgIyMgIyMgIyMgICAjIyMjICAjIyMjIyNcbiAgIyMgICAgICAgICAgIyMgIyMgICAgICAgICAgIyMgICAgICAgIyMgICAgICMjICAjIyAgIyMjIyAjIyAgICAjIyAgICAgICAgIyNcbiAgIyMgICAgIyMgICAgIyMgIyMgICAgICAgICAgIyMgICAgICAgIyMgICAgICMjICAjIyAgICMjIyAjIyAgICAjIyAgIyMgICAgIyNcbiAgIyMgICAgICMjIyMjIyAgIyMjIyMjIyMgICAgIyMgICAgICAgIyMgICAgIyMjIyAjIyAgICAjIyAgIyMjIyMjICAgICMjIyMjI1xuXG4gIGdldFJvb3RQYXRoczogLT4gYXRvbS5wcm9qZWN0LmdldFBhdGhzKClcblxuICBnZXRTYXNzU2NvcGVTdWZmaXg6IC0+XG4gICAgQHNhc3NTaGFkZUFuZFRpbnRJbXBsZW1lbnRhdGlvbiA/IGF0b20uY29uZmlnLmdldCgncGlnbWVudHMuc2Fzc1NoYWRlQW5kVGludEltcGxlbWVudGF0aW9uJykgPyAnY29tcGFzcydcblxuICBzZXRTYXNzU2hhZGVBbmRUaW50SW1wbGVtZW50YXRpb246IChAc2Fzc1NoYWRlQW5kVGludEltcGxlbWVudGF0aW9uKSAtPlxuICAgIEBjb2xvckV4cHJlc3Npb25zUmVnaXN0cnkuZW1pdHRlci5lbWl0ICdkaWQtdXBkYXRlLWV4cHJlc3Npb25zJywge1xuICAgICAgcmVnaXN0cnk6IEBjb2xvckV4cHJlc3Npb25zUmVnaXN0cnlcbiAgICB9XG5cbiAgZ2V0U291cmNlTmFtZXM6IC0+XG4gICAgbmFtZXMgPSBbJy5waWdtZW50cyddXG4gICAgbmFtZXMgPSBuYW1lcy5jb25jYXQoQHNvdXJjZU5hbWVzID8gW10pXG4gICAgdW5sZXNzIEBpZ25vcmVHbG9iYWxTb3VyY2VOYW1lc1xuICAgICAgbmFtZXMgPSBuYW1lcy5jb25jYXQoYXRvbS5jb25maWcuZ2V0KCdwaWdtZW50cy5zb3VyY2VOYW1lcycpID8gW10pXG4gICAgbmFtZXNcblxuICBzZXRTb3VyY2VOYW1lczogKEBzb3VyY2VOYW1lcz1bXSkgLT5cbiAgICByZXR1cm4gaWYgbm90IEBpbml0aWFsaXplZD8gYW5kIG5vdCBAaW5pdGlhbGl6ZVByb21pc2U/XG5cbiAgICBAaW5pdGlhbGl6ZSgpLnRoZW4gPT4gQGxvYWRQYXRoc0FuZFZhcmlhYmxlcyh0cnVlKVxuXG4gIHNldElnbm9yZUdsb2JhbFNvdXJjZU5hbWVzOiAoQGlnbm9yZUdsb2JhbFNvdXJjZU5hbWVzKSAtPlxuICAgIEB1cGRhdGVQYXRocygpXG5cbiAgZ2V0U2VhcmNoTmFtZXM6IC0+XG4gICAgbmFtZXMgPSBbXVxuICAgIG5hbWVzID0gbmFtZXMuY29uY2F0KEBzb3VyY2VOYW1lcyA/IFtdKVxuICAgIG5hbWVzID0gbmFtZXMuY29uY2F0KEBzZWFyY2hOYW1lcyA/IFtdKVxuICAgIHVubGVzcyBAaWdub3JlR2xvYmFsU2VhcmNoTmFtZXNcbiAgICAgIG5hbWVzID0gbmFtZXMuY29uY2F0KGF0b20uY29uZmlnLmdldCgncGlnbWVudHMuc291cmNlTmFtZXMnKSA/IFtdKVxuICAgICAgbmFtZXMgPSBuYW1lcy5jb25jYXQoYXRvbS5jb25maWcuZ2V0KCdwaWdtZW50cy5leHRlbmRlZFNlYXJjaE5hbWVzJykgPyBbXSlcbiAgICBuYW1lc1xuXG4gIHNldFNlYXJjaE5hbWVzOiAoQHNlYXJjaE5hbWVzPVtdKSAtPlxuXG4gIHNldElnbm9yZUdsb2JhbFNlYXJjaE5hbWVzOiAoQGlnbm9yZUdsb2JhbFNlYXJjaE5hbWVzKSAtPlxuXG4gIGdldElnbm9yZWROYW1lczogLT5cbiAgICBuYW1lcyA9IEBpZ25vcmVkTmFtZXMgPyBbXVxuICAgIHVubGVzcyBAaWdub3JlR2xvYmFsSWdub3JlZE5hbWVzXG4gICAgICBuYW1lcyA9IG5hbWVzLmNvbmNhdChAZ2V0R2xvYmFsSWdub3JlZE5hbWVzKCkgPyBbXSlcbiAgICAgIG5hbWVzID0gbmFtZXMuY29uY2F0KGF0b20uY29uZmlnLmdldCgnY29yZS5pZ25vcmVkTmFtZXMnKSA/IFtdKVxuICAgIG5hbWVzXG5cbiAgZ2V0R2xvYmFsSWdub3JlZE5hbWVzOiAtPlxuICAgIGF0b20uY29uZmlnLmdldCgncGlnbWVudHMuaWdub3JlZE5hbWVzJyk/Lm1hcCAocCkgLT5cbiAgICAgIGlmIC9cXC9cXCokLy50ZXN0KHApIHRoZW4gcCArICcqJyBlbHNlIHBcblxuICBzZXRJZ25vcmVkTmFtZXM6IChAaWdub3JlZE5hbWVzPVtdKSAtPlxuICAgIGlmIG5vdCBAaW5pdGlhbGl6ZWQ/IGFuZCBub3QgQGluaXRpYWxpemVQcm9taXNlP1xuICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KCdQcm9qZWN0IGlzIG5vdCBpbml0aWFsaXplZCB5ZXQnKVxuXG4gICAgQGluaXRpYWxpemUoKS50aGVuID0+XG4gICAgICBkaXJ0aWVkID0gQHBhdGhzLmZpbHRlciAocCkgPT4gQGlzSWdub3JlZFBhdGgocClcbiAgICAgIEBkZWxldGVWYXJpYWJsZXNGb3JQYXRocyhkaXJ0aWVkKVxuXG4gICAgICBAcGF0aHMgPSBAcGF0aHMuZmlsdGVyIChwKSA9PiAhQGlzSWdub3JlZFBhdGgocClcbiAgICAgIEBsb2FkUGF0aHNBbmRWYXJpYWJsZXModHJ1ZSlcblxuICBzZXRJZ25vcmVHbG9iYWxJZ25vcmVkTmFtZXM6IChAaWdub3JlR2xvYmFsSWdub3JlZE5hbWVzKSAtPlxuICAgIEB1cGRhdGVQYXRocygpXG5cbiAgZ2V0SWdub3JlZFNjb3BlczogLT5cbiAgICBzY29wZXMgPSBAaWdub3JlZFNjb3BlcyA/IFtdXG4gICAgdW5sZXNzIEBpZ25vcmVHbG9iYWxJZ25vcmVkU2NvcGVzXG4gICAgICBzY29wZXMgPSBzY29wZXMuY29uY2F0KGF0b20uY29uZmlnLmdldCgncGlnbWVudHMuaWdub3JlZFNjb3BlcycpID8gW10pXG5cbiAgICBzY29wZXMgPSBzY29wZXMuY29uY2F0KEBpZ25vcmVkRmlsZXR5cGVzKVxuICAgIHNjb3Blc1xuXG4gIHNldElnbm9yZWRTY29wZXM6IChAaWdub3JlZFNjb3Blcz1bXSkgLT5cbiAgICBAZW1pdHRlci5lbWl0KCdkaWQtY2hhbmdlLWlnbm9yZWQtc2NvcGVzJywgQGdldElnbm9yZWRTY29wZXMoKSlcblxuICBzZXRJZ25vcmVHbG9iYWxJZ25vcmVkU2NvcGVzOiAoQGlnbm9yZUdsb2JhbElnbm9yZWRTY29wZXMpIC0+XG4gICAgQGVtaXR0ZXIuZW1pdCgnZGlkLWNoYW5nZS1pZ25vcmVkLXNjb3BlcycsIEBnZXRJZ25vcmVkU2NvcGVzKCkpXG5cbiAgc2V0U3VwcG9ydGVkRmlsZXR5cGVzOiAoQHN1cHBvcnRlZEZpbGV0eXBlcz1bXSkgLT5cbiAgICBAdXBkYXRlSWdub3JlZEZpbGV0eXBlcygpXG4gICAgQGVtaXR0ZXIuZW1pdCgnZGlkLWNoYW5nZS1pZ25vcmVkLXNjb3BlcycsIEBnZXRJZ25vcmVkU2NvcGVzKCkpXG5cbiAgdXBkYXRlSWdub3JlZEZpbGV0eXBlczogLT5cbiAgICBAaWdub3JlZEZpbGV0eXBlcyA9IEBnZXRJZ25vcmVkRmlsZXR5cGVzKClcblxuICBnZXRJZ25vcmVkRmlsZXR5cGVzOiAtPlxuICAgIGZpbGV0eXBlcyA9IEBzdXBwb3J0ZWRGaWxldHlwZXMgPyBbXVxuXG4gICAgdW5sZXNzIEBpZ25vcmVHbG9iYWxTdXBwb3J0ZWRGaWxldHlwZXNcbiAgICAgIGZpbGV0eXBlcyA9IGZpbGV0eXBlcy5jb25jYXQoYXRvbS5jb25maWcuZ2V0KCdwaWdtZW50cy5zdXBwb3J0ZWRGaWxldHlwZXMnKSA/IFtdKVxuXG4gICAgZmlsZXR5cGVzID0gWycqJ10gaWYgZmlsZXR5cGVzLmxlbmd0aCBpcyAwXG5cbiAgICByZXR1cm4gW10gaWYgZmlsZXR5cGVzLnNvbWUgKHR5cGUpIC0+IHR5cGUgaXMgJyonXG5cbiAgICBzY29wZXMgPSBmaWxldHlwZXMubWFwIChleHQpIC0+XG4gICAgICBhdG9tLmdyYW1tYXJzLnNlbGVjdEdyYW1tYXIoXCJmaWxlLiN7ZXh0fVwiKT8uc2NvcGVOYW1lLnJlcGxhY2UoL1xcLi9nLCAnXFxcXC4nKVxuICAgIC5maWx0ZXIgKHNjb3BlKSAtPiBzY29wZT9cblxuICAgIFtcIl4oPyFcXFxcLigje3Njb3Blcy5qb2luKCd8Jyl9KSlcIl1cblxuICBzZXRJZ25vcmVHbG9iYWxTdXBwb3J0ZWRGaWxldHlwZXM6IChAaWdub3JlR2xvYmFsU3VwcG9ydGVkRmlsZXR5cGVzKSAtPlxuICAgIEB1cGRhdGVJZ25vcmVkRmlsZXR5cGVzKClcbiAgICBAZW1pdHRlci5lbWl0KCdkaWQtY2hhbmdlLWlnbm9yZWQtc2NvcGVzJywgQGdldElnbm9yZWRTY29wZXMoKSlcblxuICB0aGVtZXNJbmNsdWRlZDogLT4gQGluY2x1ZGVUaGVtZXNcblxuICBzZXRJbmNsdWRlVGhlbWVzOiAoaW5jbHVkZVRoZW1lcykgLT5cbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCkgaWYgaW5jbHVkZVRoZW1lcyBpcyBAaW5jbHVkZVRoZW1lc1xuXG4gICAgQGluY2x1ZGVUaGVtZXMgPSBpbmNsdWRlVGhlbWVzXG4gICAgaWYgQGluY2x1ZGVUaGVtZXNcbiAgICAgIEBpbmNsdWRlVGhlbWVzVmFyaWFibGVzKClcbiAgICBlbHNlXG4gICAgICBAZGlzcG9zZVRoZW1lc1ZhcmlhYmxlcygpXG5cbiAgaW5jbHVkZVRoZW1lc1ZhcmlhYmxlczogLT5cbiAgICBAdGhlbWVzU3Vic2NyaXB0aW9uID0gYXRvbS50aGVtZXMub25EaWRDaGFuZ2VBY3RpdmVUaGVtZXMgPT5cbiAgICAgIHJldHVybiB1bmxlc3MgQGluY2x1ZGVUaGVtZXNcblxuICAgICAge1RIRU1FX1ZBUklBQkxFU30gPSByZXF1aXJlICcuL3VyaXMnIHVubGVzcyBUSEVNRV9WQVJJQUJMRVM/XG5cbiAgICAgIHZhcmlhYmxlcyA9IEBsb2FkVGhlbWVzVmFyaWFibGVzKClcbiAgICAgIEB2YXJpYWJsZXMudXBkYXRlUGF0aENvbGxlY3Rpb24oVEhFTUVfVkFSSUFCTEVTLCB2YXJpYWJsZXMpXG5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgQHRoZW1lc1N1YnNjcmlwdGlvblxuICAgIEB2YXJpYWJsZXMuYWRkTWFueShAbG9hZFRoZW1lc1ZhcmlhYmxlcygpKVxuXG4gIGRpc3Bvc2VUaGVtZXNWYXJpYWJsZXM6IC0+XG4gICAge1RIRU1FX1ZBUklBQkxFU30gPSByZXF1aXJlICcuL3VyaXMnIHVubGVzcyBUSEVNRV9WQVJJQUJMRVM/XG5cbiAgICBAc3Vic2NyaXB0aW9ucy5yZW1vdmUgQHRoZW1lc1N1YnNjcmlwdGlvblxuICAgIEB2YXJpYWJsZXMuZGVsZXRlVmFyaWFibGVzRm9yUGF0aHMoW1RIRU1FX1ZBUklBQkxFU10pXG4gICAgQHRoZW1lc1N1YnNjcmlwdGlvbi5kaXNwb3NlKClcblxuICBnZXRUaW1lc3RhbXA6IC0+IG5ldyBEYXRlKClcblxuICBzZXJpYWxpemU6IC0+XG4gICAgdW5sZXNzIFNFUklBTElaRV9WRVJTSU9OP1xuICAgICAge1NFUklBTElaRV9WRVJTSU9OLCBTRVJJQUxJWkVfTUFSS0VSU19WRVJTSU9OfSA9IHJlcXVpcmUgJy4vdmVyc2lvbnMnXG5cbiAgICBkYXRhID1cbiAgICAgIGRlc2VyaWFsaXplcjogJ0NvbG9yUHJvamVjdCdcbiAgICAgIHRpbWVzdGFtcDogQGdldFRpbWVzdGFtcCgpXG4gICAgICB2ZXJzaW9uOiBTRVJJQUxJWkVfVkVSU0lPTlxuICAgICAgbWFya2Vyc1ZlcnNpb246IFNFUklBTElaRV9NQVJLRVJTX1ZFUlNJT05cbiAgICAgIGdsb2JhbFNvdXJjZU5hbWVzOiBhdG9tLmNvbmZpZy5nZXQoJ3BpZ21lbnRzLnNvdXJjZU5hbWVzJylcbiAgICAgIGdsb2JhbElnbm9yZWROYW1lczogYXRvbS5jb25maWcuZ2V0KCdwaWdtZW50cy5pZ25vcmVkTmFtZXMnKVxuXG4gICAgaWYgQGlnbm9yZUdsb2JhbFNvdXJjZU5hbWVzP1xuICAgICAgZGF0YS5pZ25vcmVHbG9iYWxTb3VyY2VOYW1lcyA9IEBpZ25vcmVHbG9iYWxTb3VyY2VOYW1lc1xuICAgIGlmIEBpZ25vcmVHbG9iYWxTZWFyY2hOYW1lcz9cbiAgICAgIGRhdGEuaWdub3JlR2xvYmFsU2VhcmNoTmFtZXMgPSBAaWdub3JlR2xvYmFsU2VhcmNoTmFtZXNcbiAgICBpZiBAaWdub3JlR2xvYmFsSWdub3JlZE5hbWVzP1xuICAgICAgZGF0YS5pZ25vcmVHbG9iYWxJZ25vcmVkTmFtZXMgPSBAaWdub3JlR2xvYmFsSWdub3JlZE5hbWVzXG4gICAgaWYgQGlnbm9yZUdsb2JhbElnbm9yZWRTY29wZXM/XG4gICAgICBkYXRhLmlnbm9yZUdsb2JhbElnbm9yZWRTY29wZXMgPSBAaWdub3JlR2xvYmFsSWdub3JlZFNjb3Blc1xuICAgIGlmIEBpbmNsdWRlVGhlbWVzP1xuICAgICAgZGF0YS5pbmNsdWRlVGhlbWVzID0gQGluY2x1ZGVUaGVtZXNcbiAgICBpZiBAaWdub3JlZFNjb3Blcz9cbiAgICAgIGRhdGEuaWdub3JlZFNjb3BlcyA9IEBpZ25vcmVkU2NvcGVzXG4gICAgaWYgQGlnbm9yZWROYW1lcz9cbiAgICAgIGRhdGEuaWdub3JlZE5hbWVzID0gQGlnbm9yZWROYW1lc1xuICAgIGlmIEBzb3VyY2VOYW1lcz9cbiAgICAgIGRhdGEuc291cmNlTmFtZXMgPSBAc291cmNlTmFtZXNcbiAgICBpZiBAc2VhcmNoTmFtZXM/XG4gICAgICBkYXRhLnNlYXJjaE5hbWVzID0gQHNlYXJjaE5hbWVzXG5cbiAgICBkYXRhLmJ1ZmZlcnMgPSBAc2VyaWFsaXplQnVmZmVycygpXG5cbiAgICBpZiBAaXNJbml0aWFsaXplZCgpXG4gICAgICBkYXRhLnBhdGhzID0gQHBhdGhzXG4gICAgICBkYXRhLnZhcmlhYmxlcyA9IEB2YXJpYWJsZXMuc2VyaWFsaXplKClcblxuICAgIGRhdGFcblxuICBzZXJpYWxpemVCdWZmZXJzOiAtPlxuICAgIG91dCA9IHt9XG4gICAgZm9yIGlkLGNvbG9yQnVmZmVyIG9mIEBjb2xvckJ1ZmZlcnNCeUVkaXRvcklkXG4gICAgICBvdXRbaWRdID0gY29sb3JCdWZmZXIuc2VyaWFsaXplKClcbiAgICBvdXRcbiJdfQ==
