(function() {
  var Color, ColorBuffer, ColorExpression, ColorMarker, CompositeDisposable, Emitter, Range, Task, VariablesCollection, fs, scopeFromFileName, _ref,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  fs = require('fs');

  _ref = require('atom'), Emitter = _ref.Emitter, CompositeDisposable = _ref.CompositeDisposable, Task = _ref.Task, Range = _ref.Range;

  Color = require('./color');

  ColorMarker = require('./color-marker');

  ColorExpression = require('./color-expression');

  VariablesCollection = require('./variables-collection');

  scopeFromFileName = require('./scope-from-file-name');

  module.exports = ColorBuffer = (function() {
    function ColorBuffer(params) {
      var colorMarkers, saveSubscription, tokenized;
      if (params == null) {
        params = {};
      }
      this.editor = params.editor, this.project = params.project, colorMarkers = params.colorMarkers;
      this.id = this.editor.id;
      this.emitter = new Emitter;
      this.subscriptions = new CompositeDisposable;
      this.ignoredScopes = [];
      this.colorMarkersByMarkerId = {};
      this.subscriptions.add(this.editor.onDidDestroy((function(_this) {
        return function() {
          return _this.destroy();
        };
      })(this)));
      tokenized = (function(_this) {
        return function() {
          var _ref1;
          return (_ref1 = _this.getColorMarkers()) != null ? _ref1.forEach(function(marker) {
            return marker.checkMarkerScope(true);
          }) : void 0;
        };
      })(this);
      if (this.editor.onDidTokenize != null) {
        this.subscriptions.add(this.editor.onDidTokenize(tokenized));
      } else {
        this.subscriptions.add(this.editor.displayBuffer.onDidTokenize(tokenized));
      }
      this.subscriptions.add(this.editor.onDidChange((function(_this) {
        return function() {
          if (_this.initialized && _this.variableInitialized) {
            _this.terminateRunningTask();
          }
          if (_this.timeout != null) {
            return clearTimeout(_this.timeout);
          }
        };
      })(this)));
      this.subscriptions.add(this.editor.onDidStopChanging((function(_this) {
        return function() {
          if (_this.delayBeforeScan === 0) {
            return _this.update();
          } else {
            if (_this.timeout != null) {
              clearTimeout(_this.timeout);
            }
            return _this.timeout = setTimeout(function() {
              _this.update();
              return _this.timeout = null;
            }, _this.delayBeforeScan);
          }
        };
      })(this)));
      this.subscriptions.add(this.editor.onDidChangePath((function(_this) {
        return function(path) {
          if (_this.isVariablesSource()) {
            _this.project.appendPath(path);
          }
          return _this.update();
        };
      })(this)));
      if ((this.project.getPaths() != null) && this.isVariablesSource() && !this.project.hasPath(this.editor.getPath())) {
        if (fs.existsSync(this.editor.getPath())) {
          this.project.appendPath(this.editor.getPath());
        } else {
          saveSubscription = this.editor.onDidSave((function(_this) {
            return function(_arg) {
              var path;
              path = _arg.path;
              _this.project.appendPath(path);
              _this.update();
              saveSubscription.dispose();
              return _this.subscriptions.remove(saveSubscription);
            };
          })(this));
          this.subscriptions.add(saveSubscription);
        }
      }
      this.subscriptions.add(this.project.onDidUpdateVariables((function(_this) {
        return function() {
          if (!_this.variableInitialized) {
            return;
          }
          return _this.scanBufferForColors().then(function(results) {
            return _this.updateColorMarkers(results);
          });
        };
      })(this)));
      this.subscriptions.add(this.project.onDidChangeIgnoredScopes((function(_this) {
        return function() {
          return _this.updateIgnoredScopes();
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('pigments.delayBeforeScan', (function(_this) {
        return function(delayBeforeScan) {
          _this.delayBeforeScan = delayBeforeScan != null ? delayBeforeScan : 0;
        };
      })(this)));
      if (this.editor.addMarkerLayer != null) {
        this.markerLayer = this.editor.addMarkerLayer();
        this.editor.findMarkers({
          type: 'pigments-color'
        }).forEach(function(m) {
          return m.destroy();
        });
      } else {
        this.markerLayer = this.editor;
      }
      if (colorMarkers != null) {
        this.restoreMarkersState(colorMarkers);
        this.cleanUnusedTextEditorMarkers();
      }
      this.updateIgnoredScopes();
      this.initialize();
    }

    ColorBuffer.prototype.onDidUpdateColorMarkers = function(callback) {
      return this.emitter.on('did-update-color-markers', callback);
    };

    ColorBuffer.prototype.onDidDestroy = function(callback) {
      return this.emitter.on('did-destroy', callback);
    };

    ColorBuffer.prototype.initialize = function() {
      if (this.colorMarkers != null) {
        return Promise.resolve();
      }
      if (this.initializePromise != null) {
        return this.initializePromise;
      }
      this.updateVariableRanges();
      this.initializePromise = this.scanBufferForColors().then((function(_this) {
        return function(results) {
          return _this.createColorMarkers(results);
        };
      })(this)).then((function(_this) {
        return function(results) {
          _this.colorMarkers = results;
          return _this.initialized = true;
        };
      })(this));
      this.initializePromise.then((function(_this) {
        return function() {
          return _this.variablesAvailable();
        };
      })(this));
      return this.initializePromise;
    };

    ColorBuffer.prototype.restoreMarkersState = function(colorMarkers) {
      this.updateVariableRanges();
      return this.colorMarkers = colorMarkers.filter(function(state) {
        return state != null;
      }).map((function(_this) {
        return function(state) {
          var color, marker, _ref1;
          marker = (_ref1 = _this.editor.getMarker(state.markerId)) != null ? _ref1 : _this.markerLayer.markBufferRange(state.bufferRange, {
            type: 'pigments-color',
            invalidate: 'touch'
          });
          color = new Color(state.color);
          color.variables = state.variables;
          color.invalid = state.invalid;
          return _this.colorMarkersByMarkerId[marker.id] = new ColorMarker({
            marker: marker,
            color: color,
            text: state.text,
            colorBuffer: _this
          });
        };
      })(this));
    };

    ColorBuffer.prototype.cleanUnusedTextEditorMarkers = function() {
      return this.markerLayer.findMarkers({
        type: 'pigments-color'
      }).forEach((function(_this) {
        return function(m) {
          if (_this.colorMarkersByMarkerId[m.id] == null) {
            return m.destroy();
          }
        };
      })(this));
    };

    ColorBuffer.prototype.variablesAvailable = function() {
      if (this.variablesPromise != null) {
        return this.variablesPromise;
      }
      return this.variablesPromise = this.project.initialize().then((function(_this) {
        return function(results) {
          if (_this.destroyed) {
            return;
          }
          if (results == null) {
            return;
          }
          if (_this.isIgnored() && _this.isVariablesSource()) {
            return _this.scanBufferForVariables();
          }
        };
      })(this)).then((function(_this) {
        return function(results) {
          return _this.scanBufferForColors({
            variables: results
          });
        };
      })(this)).then((function(_this) {
        return function(results) {
          return _this.updateColorMarkers(results);
        };
      })(this)).then((function(_this) {
        return function() {
          return _this.variableInitialized = true;
        };
      })(this))["catch"](function(reason) {
        return console.log(reason);
      });
    };

    ColorBuffer.prototype.update = function() {
      var promise;
      this.terminateRunningTask();
      promise = this.isIgnored() ? this.scanBufferForVariables() : !this.isVariablesSource() ? Promise.resolve([]) : this.project.reloadVariablesForPath(this.editor.getPath());
      return promise.then((function(_this) {
        return function(results) {
          return _this.scanBufferForColors({
            variables: results
          });
        };
      })(this)).then((function(_this) {
        return function(results) {
          return _this.updateColorMarkers(results);
        };
      })(this))["catch"](function(reason) {
        return console.log(reason);
      });
    };

    ColorBuffer.prototype.terminateRunningTask = function() {
      var _ref1;
      return (_ref1 = this.task) != null ? _ref1.terminate() : void 0;
    };

    ColorBuffer.prototype.destroy = function() {
      var _ref1;
      if (this.destroyed) {
        return;
      }
      this.terminateRunningTask();
      this.subscriptions.dispose();
      if ((_ref1 = this.colorMarkers) != null) {
        _ref1.forEach(function(marker) {
          return marker.destroy();
        });
      }
      this.destroyed = true;
      this.emitter.emit('did-destroy');
      return this.emitter.dispose();
    };

    ColorBuffer.prototype.isVariablesSource = function() {
      return this.project.isVariablesSourcePath(this.editor.getPath());
    };

    ColorBuffer.prototype.isIgnored = function() {
      var p;
      p = this.editor.getPath();
      return this.project.isIgnoredPath(p) || !atom.project.contains(p);
    };

    ColorBuffer.prototype.isDestroyed = function() {
      return this.destroyed;
    };

    ColorBuffer.prototype.getPath = function() {
      return this.editor.getPath();
    };

    ColorBuffer.prototype.updateIgnoredScopes = function() {
      var _ref1;
      this.ignoredScopes = this.project.getIgnoredScopes().map(function(scope) {
        try {
          return new RegExp(scope);
        } catch (_error) {}
      }).filter(function(re) {
        return re != null;
      });
      if ((_ref1 = this.getColorMarkers()) != null) {
        _ref1.forEach(function(marker) {
          return marker.checkMarkerScope(true);
        });
      }
      return this.emitter.emit('did-update-color-markers', {
        created: [],
        destroyed: []
      });
    };

    ColorBuffer.prototype.updateVariableRanges = function() {
      var variablesForBuffer;
      variablesForBuffer = this.project.getVariablesForPath(this.editor.getPath());
      return variablesForBuffer.forEach((function(_this) {
        return function(variable) {
          return variable.bufferRange != null ? variable.bufferRange : variable.bufferRange = Range.fromObject([_this.editor.getBuffer().positionForCharacterIndex(variable.range[0]), _this.editor.getBuffer().positionForCharacterIndex(variable.range[1])]);
        };
      })(this));
    };

    ColorBuffer.prototype.scanBufferForVariables = function() {
      var buffer, config, editor, results, taskPath;
      if (this.destroyed) {
        return Promise.reject("This ColorBuffer is already destroyed");
      }
      if (!this.editor.getPath()) {
        return Promise.resolve([]);
      }
      results = [];
      taskPath = require.resolve('./tasks/scan-buffer-variables-handler');
      editor = this.editor;
      buffer = this.editor.getBuffer();
      config = {
        buffer: this.editor.getText(),
        registry: this.project.getVariableExpressionsRegistry().serialize(),
        scope: scopeFromFileName(this.editor.getPath())
      };
      return new Promise((function(_this) {
        return function(resolve, reject) {
          _this.task = Task.once(taskPath, config, function() {
            _this.task = null;
            return resolve(results);
          });
          return _this.task.on('scan-buffer:variables-found', function(variables) {
            return results = results.concat(variables.map(function(variable) {
              variable.path = editor.getPath();
              variable.bufferRange = Range.fromObject([buffer.positionForCharacterIndex(variable.range[0]), buffer.positionForCharacterIndex(variable.range[1])]);
              return variable;
            }));
          });
        };
      })(this));
    };

    ColorBuffer.prototype.getMarkerLayer = function() {
      return this.markerLayer;
    };

    ColorBuffer.prototype.getColorMarkers = function() {
      return this.colorMarkers;
    };

    ColorBuffer.prototype.getValidColorMarkers = function() {
      var _ref1, _ref2;
      return (_ref1 = (_ref2 = this.getColorMarkers()) != null ? _ref2.filter(function(m) {
        var _ref3;
        return ((_ref3 = m.color) != null ? _ref3.isValid() : void 0) && !m.isIgnored();
      }) : void 0) != null ? _ref1 : [];
    };

    ColorBuffer.prototype.getColorMarkerAtBufferPosition = function(bufferPosition) {
      var marker, markers, _i, _len;
      markers = this.markerLayer.findMarkers({
        type: 'pigments-color',
        containsBufferPosition: bufferPosition
      });
      for (_i = 0, _len = markers.length; _i < _len; _i++) {
        marker = markers[_i];
        if (this.colorMarkersByMarkerId[marker.id] != null) {
          return this.colorMarkersByMarkerId[marker.id];
        }
      }
    };

    ColorBuffer.prototype.createColorMarkers = function(results) {
      if (this.destroyed) {
        return Promise.resolve([]);
      }
      return new Promise((function(_this) {
        return function(resolve, reject) {
          var newResults, processResults;
          newResults = [];
          processResults = function() {
            var marker, result, startDate;
            startDate = new Date;
            if (_this.editor.isDestroyed()) {
              return resolve([]);
            }
            while (results.length) {
              result = results.shift();
              marker = _this.markerLayer.markBufferRange(result.bufferRange, {
                type: 'pigments-color',
                invalidate: 'touch'
              });
              newResults.push(_this.colorMarkersByMarkerId[marker.id] = new ColorMarker({
                marker: marker,
                color: result.color,
                text: result.match,
                colorBuffer: _this
              }));
              if (new Date() - startDate > 10) {
                requestAnimationFrame(processResults);
                return;
              }
            }
            return resolve(newResults);
          };
          return processResults();
        };
      })(this));
    };

    ColorBuffer.prototype.findExistingMarkers = function(results) {
      var newMarkers, toCreate;
      newMarkers = [];
      toCreate = [];
      return new Promise((function(_this) {
        return function(resolve, reject) {
          var processResults;
          processResults = function() {
            var marker, result, startDate;
            startDate = new Date;
            while (results.length) {
              result = results.shift();
              if (marker = _this.findColorMarker(result)) {
                newMarkers.push(marker);
              } else {
                toCreate.push(result);
              }
              if (new Date() - startDate > 10) {
                requestAnimationFrame(processResults);
                return;
              }
            }
            return resolve({
              newMarkers: newMarkers,
              toCreate: toCreate
            });
          };
          return processResults();
        };
      })(this));
    };

    ColorBuffer.prototype.updateColorMarkers = function(results) {
      var createdMarkers, newMarkers;
      newMarkers = null;
      createdMarkers = null;
      return this.findExistingMarkers(results).then((function(_this) {
        return function(_arg) {
          var markers, toCreate;
          markers = _arg.newMarkers, toCreate = _arg.toCreate;
          newMarkers = markers;
          return _this.createColorMarkers(toCreate);
        };
      })(this)).then((function(_this) {
        return function(results) {
          var toDestroy;
          createdMarkers = results;
          newMarkers = newMarkers.concat(results);
          if (_this.colorMarkers != null) {
            toDestroy = _this.colorMarkers.filter(function(marker) {
              return __indexOf.call(newMarkers, marker) < 0;
            });
            toDestroy.forEach(function(marker) {
              delete _this.colorMarkersByMarkerId[marker.id];
              return marker.destroy();
            });
          } else {
            toDestroy = [];
          }
          _this.colorMarkers = newMarkers;
          return _this.emitter.emit('did-update-color-markers', {
            created: createdMarkers,
            destroyed: toDestroy
          });
        };
      })(this));
    };

    ColorBuffer.prototype.findColorMarker = function(properties) {
      var marker, _i, _len, _ref1;
      if (properties == null) {
        properties = {};
      }
      if (this.colorMarkers == null) {
        return;
      }
      _ref1 = this.colorMarkers;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        marker = _ref1[_i];
        if (marker != null ? marker.match(properties) : void 0) {
          return marker;
        }
      }
    };

    ColorBuffer.prototype.findColorMarkers = function(properties) {
      var markers;
      if (properties == null) {
        properties = {};
      }
      properties.type = 'pigments-color';
      markers = this.markerLayer.findMarkers(properties);
      return markers.map((function(_this) {
        return function(marker) {
          return _this.colorMarkersByMarkerId[marker.id];
        };
      })(this)).filter(function(marker) {
        return marker != null;
      });
    };

    ColorBuffer.prototype.findValidColorMarkers = function(properties) {
      return this.findColorMarkers(properties).filter((function(_this) {
        return function(marker) {
          var _ref1;
          return (marker != null) && ((_ref1 = marker.color) != null ? _ref1.isValid() : void 0) && !(marker != null ? marker.isIgnored() : void 0);
        };
      })(this));
    };

    ColorBuffer.prototype.selectColorMarkerAndOpenPicker = function(colorMarker) {
      var _ref1;
      if (this.destroyed) {
        return;
      }
      this.editor.setSelectedBufferRange(colorMarker.marker.getBufferRange());
      if (!((_ref1 = this.editor.getSelectedText()) != null ? _ref1.match(/^#[0-9a-fA-F]{3,8}$/) : void 0)) {
        return;
      }
      if (this.project.colorPickerAPI != null) {
        return this.project.colorPickerAPI.open(this.editor, this.editor.getLastCursor());
      }
    };

    ColorBuffer.prototype.scanBufferForColors = function(options) {
      var buffer, collection, config, registry, results, taskPath, variables, _ref1, _ref2, _ref3, _ref4, _ref5;
      if (options == null) {
        options = {};
      }
      if (this.destroyed) {
        return Promise.reject("This ColorBuffer is already destroyed");
      }
      results = [];
      taskPath = require.resolve('./tasks/scan-buffer-colors-handler');
      buffer = this.editor.getBuffer();
      registry = this.project.getColorExpressionsRegistry().serialize();
      if (options.variables != null) {
        collection = new VariablesCollection();
        collection.addMany(options.variables);
        options.variables = collection;
      }
      variables = this.isVariablesSource() ? ((_ref2 = (_ref3 = options.variables) != null ? _ref3.getVariables() : void 0) != null ? _ref2 : []).concat((_ref1 = this.project.getVariables()) != null ? _ref1 : []) : (_ref4 = (_ref5 = options.variables) != null ? _ref5.getVariables() : void 0) != null ? _ref4 : [];
      delete registry.expressions['pigments:variables'];
      delete registry.regexpString;
      config = {
        buffer: this.editor.getText(),
        bufferPath: this.getPath(),
        variables: variables,
        colorVariables: variables.filter(function(v) {
          return v.isColor;
        }),
        registry: registry
      };
      return new Promise((function(_this) {
        return function(resolve, reject) {
          _this.task = Task.once(taskPath, config, function() {
            _this.task = null;
            return resolve(results);
          });
          return _this.task.on('scan-buffer:colors-found', function(colors) {
            return results = results.concat(colors.map(function(res) {
              res.color = new Color(res.color);
              res.bufferRange = Range.fromObject([buffer.positionForCharacterIndex(res.range[0]), buffer.positionForCharacterIndex(res.range[1])]);
              return res;
            }));
          });
        };
      })(this));
    };

    ColorBuffer.prototype.serialize = function() {
      var _ref1;
      return {
        id: this.id,
        path: this.editor.getPath(),
        colorMarkers: (_ref1 = this.colorMarkers) != null ? _ref1.map(function(marker) {
          return marker.serialize();
        }) : void 0
      };
    };

    return ColorBuffer;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvcGlnbWVudHMvbGliL2NvbG9yLWJ1ZmZlci5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsNklBQUE7SUFBQSxxSkFBQTs7QUFBQSxFQUFBLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUixDQUFMLENBQUE7O0FBQUEsRUFDQSxPQUE4QyxPQUFBLENBQVEsTUFBUixDQUE5QyxFQUFDLGVBQUEsT0FBRCxFQUFVLDJCQUFBLG1CQUFWLEVBQStCLFlBQUEsSUFBL0IsRUFBcUMsYUFBQSxLQURyQyxDQUFBOztBQUFBLEVBRUEsS0FBQSxHQUFRLE9BQUEsQ0FBUSxTQUFSLENBRlIsQ0FBQTs7QUFBQSxFQUdBLFdBQUEsR0FBYyxPQUFBLENBQVEsZ0JBQVIsQ0FIZCxDQUFBOztBQUFBLEVBSUEsZUFBQSxHQUFrQixPQUFBLENBQVEsb0JBQVIsQ0FKbEIsQ0FBQTs7QUFBQSxFQUtBLG1CQUFBLEdBQXNCLE9BQUEsQ0FBUSx3QkFBUixDQUx0QixDQUFBOztBQUFBLEVBTUEsaUJBQUEsR0FBb0IsT0FBQSxDQUFRLHdCQUFSLENBTnBCLENBQUE7O0FBQUEsRUFRQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ1MsSUFBQSxxQkFBQyxNQUFELEdBQUE7QUFDWCxVQUFBLHlDQUFBOztRQURZLFNBQU87T0FDbkI7QUFBQSxNQUFDLElBQUMsQ0FBQSxnQkFBQSxNQUFGLEVBQVUsSUFBQyxDQUFBLGlCQUFBLE9BQVgsRUFBb0Isc0JBQUEsWUFBcEIsQ0FBQTtBQUFBLE1BQ0MsSUFBQyxDQUFBLEtBQU0sSUFBQyxDQUFBLE9BQVAsRUFERixDQUFBO0FBQUEsTUFFQSxJQUFDLENBQUEsT0FBRCxHQUFXLEdBQUEsQ0FBQSxPQUZYLENBQUE7QUFBQSxNQUdBLElBQUMsQ0FBQSxh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

//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/pigments/lib/color-buffer.coffee
