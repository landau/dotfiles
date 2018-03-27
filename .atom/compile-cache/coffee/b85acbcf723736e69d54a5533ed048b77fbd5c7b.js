(function() {
  var Color, ColorBuffer, ColorMarker, CompositeDisposable, Emitter, Range, Task, VariablesCollection, fs, _ref,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  _ref = [], Color = _ref[0], ColorMarker = _ref[1], VariablesCollection = _ref[2], Emitter = _ref[3], CompositeDisposable = _ref[4], Task = _ref[5], Range = _ref[6], fs = _ref[7];

  module.exports = ColorBuffer = (function() {
    function ColorBuffer(params) {
      var colorMarkers, saveSubscription, tokenized, _ref1;
      if (params == null) {
        params = {};
      }
      if (Emitter == null) {
        _ref1 = require('atom'), Emitter = _ref1.Emitter, CompositeDisposable = _ref1.CompositeDisposable, Task = _ref1.Task, Range = _ref1.Range;
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
          var _ref2;
          return (_ref2 = _this.getColorMarkers()) != null ? _ref2.forEach(function(marker) {
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
        if (fs == null) {
          fs = require('fs');
        }
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
      if (Color == null) {
        Color = require('./color');
      }
      if (ColorMarker == null) {
        ColorMarker = require('./color-marker');
      }
      this.updateVariableRanges();
      return this.colorMarkers = colorMarkers.filter(function(state) {
        return state != null;
      }).map((function(_this) {
        return function(state) {
          var color, marker, _ref1;
          marker = (_ref1 = _this.editor.getMarker(state.markerId)) != null ? _ref1 : _this.markerLayer.markBufferRange(state.bufferRange, {
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
      return this.markerLayer.findMarkers().forEach((function(_this) {
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

    ColorBuffer.prototype.getScope = function() {
      return this.project.scopeFromFileName(this.getPath());
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
        scope: this.getScope()
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
      if (ColorMarker == null) {
        ColorMarker = require('./color-marker');
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
      if (Color == null) {
        Color = require('./color');
      }
      results = [];
      taskPath = require.resolve('./tasks/scan-buffer-colors-handler');
      buffer = this.editor.getBuffer();
      registry = this.project.getColorExpressionsRegistry().serialize();
      if (options.variables != null) {
        if (VariablesCollection == null) {
          VariablesCollection = require('./variables-collection');
        }
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
        scope: this.getScope(),
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvcGlnbWVudHMvbGliL2NvbG9yLWJ1ZmZlci5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEseUdBQUE7SUFBQSxxSkFBQTs7QUFBQSxFQUFBLE9BSUksRUFKSixFQUNFLGVBREYsRUFDUyxxQkFEVCxFQUNzQiw2QkFEdEIsRUFFRSxpQkFGRixFQUVXLDZCQUZYLEVBRWdDLGNBRmhDLEVBRXNDLGVBRnRDLEVBR0UsWUFIRixDQUFBOztBQUFBLEVBTUEsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNTLElBQUEscUJBQUMsTUFBRCxHQUFBO0FBQ1gsVUFBQSxnREFBQTs7UUFEWSxTQUFPO09BQ25CO0FBQUEsTUFBQSxJQUFPLGVBQVA7QUFDRSxRQUFBLFFBQThDLE9BQUEsQ0FBUSxNQUFSLENBQTlDLEVBQUMsZ0JBQUEsT0FBRCxFQUFVLDRCQUFBLG1CQUFWLEVBQStCLGFBQUEsSUFBL0IsRUFBcUMsY0FBQSxLQUFyQyxDQURGO09BQUE7QUFBQSxNQUdDLElBQUMsQ0FBQSxnQkFBQSxNQUFGLEVBQVUsSUFBQyxDQUFBLGlCQUFBLE9BQVgsRUFBb0Isc0JBQUEsWUFIcEIsQ0FBQTtBQUFBLE1BSUMsSUFBQyxDQUFBLEtBQU0sSUFBQyxDQUFBLE9BQVAsRUFKRixDQUFBO0FBQUEsTUFLQSxJQUFDLENBQUEsT0FBRCxHQUFXLEdBQUEsQ0FBQSxPQUxYLENBQUE7QUFBQSxNQU1BLElBQUMsQ0FBQSxhQUFELEdBQWlCLEdBQUEsQ0FBQSxtQkFOakIsQ0FBQTtBQUFBLE1BT0EsSUFBQyxDQUFBLGFBQUQsR0FBZSxFQVBmLENBQUE7QUFBQSxNQVNBLElBQUMsQ0FBQSxzQkFBRCxHQUEwQixFQVQxQixDQUFBO0FBQUEsTUFXQSxJQUFDLENBQUEsYUFBYSxDQUFDLEdB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

//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/pigments/lib/color-buffer.coffee
