(function() {
  var Color, ColorBuffer, ColorExpression, ColorMarker, CompositeDisposable, Emitter, Range, Task, VariablesCollection, fs, _ref,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  fs = require('fs');

  _ref = require('atom'), Emitter = _ref.Emitter, CompositeDisposable = _ref.CompositeDisposable, Task = _ref.Task, Range = _ref.Range;

  Color = require('./color');

  ColorMarker = require('./color-marker');

  ColorExpression = require('./color-expression');

  VariablesCollection = require('./variables-collection');

  module.exports = ColorBuffer = (function() {
    function ColorBuffer(params) {
      var colorMarkers, saveSubscription, _ref1;
      if (params == null) {
        params = {};
      }
      this.editor = params.editor, this.project = params.project, colorMarkers = params.colorMarkers;
      _ref1 = this.editor, this.id = _ref1.id, this.displayBuffer = _ref1.displayBuffer;
      this.emitter = new Emitter;
      this.subscriptions = new CompositeDisposable;
      this.ignoredScopes = [];
      this.colorMarkersByMarkerId = {};
      this.subscriptions.add(this.editor.onDidDestroy((function(_this) {
        return function() {
          return _this.destroy();
        };
      })(this)));
      this.subscriptions.add(this.editor.displayBuffer.onDidTokenize((function(_this) {
        return function() {
          var _ref2;
          return (_ref2 = _this.getColorMarkers()) != null ? _ref2.forEach(function(marker) {
            return marker.checkMarkerScope(true);
          }) : void 0;
        };
      })(this)));
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
      results = [];
      taskPath = require.resolve('./tasks/scan-buffer-variables-handler');
      editor = this.editor;
      buffer = this.editor.getBuffer();
      config = {
        buffer: this.editor.getText(),
        registry: this.project.getVariableExpressionsRegistry().serialize()
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvcGlnbWVudHMvbGliL2NvbG9yLWJ1ZmZlci5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsMEhBQUE7SUFBQSxxSkFBQTs7QUFBQSxFQUFBLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUixDQUFMLENBQUE7O0FBQUEsRUFDQSxPQUE4QyxPQUFBLENBQVEsTUFBUixDQUE5QyxFQUFDLGVBQUEsT0FBRCxFQUFVLDJCQUFBLG1CQUFWLEVBQStCLFlBQUEsSUFBL0IsRUFBcUMsYUFBQSxLQURyQyxDQUFBOztBQUFBLEVBRUEsS0FBQSxHQUFRLE9BQUEsQ0FBUSxTQUFSLENBRlIsQ0FBQTs7QUFBQSxFQUdBLFdBQUEsR0FBYyxPQUFBLENBQVEsZ0JBQVIsQ0FIZCxDQUFBOztBQUFBLEVBSUEsZUFBQSxHQUFrQixPQUFBLENBQVEsb0JBQVIsQ0FKbEIsQ0FBQTs7QUFBQSxFQUtBLG1CQUFBLEdBQXNCLE9BQUEsQ0FBUSx3QkFBUixDQUx0QixDQUFBOztBQUFBLEVBT0EsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNTLElBQUEscUJBQUMsTUFBRCxHQUFBO0FBQ1gsVUFBQSxxQ0FBQTs7UUFEWSxTQUFPO09BQ25CO0FBQUEsTUFBQyxJQUFDLENBQUEsZ0JBQUEsTUFBRixFQUFVLElBQUMsQ0FBQSxpQkFBQSxPQUFYLEVBQW9CLHNCQUFBLFlBQXBCLENBQUE7QUFBQSxNQUNBLFFBQXdCLElBQUMsQ0FBQSxNQUF6QixFQUFDLElBQUMsQ0FBQSxXQUFBLEVBQUYsRUFBTSxJQUFDLENBQUEsc0JBQUEsYUFEUCxDQUFBO0FBQUEsTUFFQSxJQUFDLENBQUEsT0FBRCxHQUFXLEdBQUEsQ0FBQSxPQUZYLENBQUE7QUFBQSxNQUdBLElBQUMsQ0FBQSxhQUFELEdBQWlCLEdB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

//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/pigments/lib/color-buffer.coffee
