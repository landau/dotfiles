(function() {
  var Color, ColorContext, ColorExpression, Emitter, VariablesCollection, nextId, registry, _ref,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  _ref = [], Emitter = _ref[0], ColorExpression = _ref[1], ColorContext = _ref[2], Color = _ref[3], registry = _ref[4];

  nextId = 0;

  module.exports = VariablesCollection = (function() {
    VariablesCollection.deserialize = function(state) {
      return new VariablesCollection(state);
    };

    Object.defineProperty(VariablesCollection.prototype, 'length', {
      get: function() {
        return this.variables.length;
      },
      enumerable: true
    });

    function VariablesCollection(state) {
      if (Emitter == null) {
        Emitter = require('atom').Emitter;
      }
      this.emitter = new Emitter;
      this.variables = [];
      this.variableNames = [];
      this.colorVariables = [];
      this.variablesByPath = {};
      this.dependencyGraph = {};
      this.initialize(state != null ? state.content : void 0);
    }

    VariablesCollection.prototype.onDidChange = function(callback) {
      return this.emitter.on('did-change', callback);
    };

    VariablesCollection.prototype.onceInitialized = function(callback) {
      var disposable;
      if (callback == null) {
        return;
      }
      if (this.initialized) {
        return callback();
      } else {
        return disposable = this.emitter.on('did-initialize', function() {
          disposable.dispose();
          return callback();
        });
      }
    };

    VariablesCollection.prototype.initialize = function(content) {
      var iteration;
      if (content == null) {
        content = [];
      }
      iteration = (function(_this) {
        return function(cb) {
          var end, start, v;
          start = new Date;
          end = new Date;
          while (content.length > 0 && end - start < 100) {
            v = content.shift();
            _this.restoreVariable(v);
          }
          if (content.length > 0) {
            return requestAnimationFrame(function() {
              return iteration(cb);
            });
          } else {
            return typeof cb === "function" ? cb() : void 0;
          }
        };
      })(this);
      return iteration((function(_this) {
        return function() {
          _this.initialized = true;
          return _this.emitter.emit('did-initialize');
        };
      })(this));
    };

    VariablesCollection.prototype.getVariables = function() {
      return this.variables.slice();
    };

    VariablesCollection.prototype.getNonColorVariables = function() {
      return this.getVariables().filter(function(v) {
        return !v.isColor;
      });
    };

    VariablesCollection.prototype.getVariablesForPath = function(path) {
      var _ref1;
      return (_ref1 = this.variablesByPath[path]) != null ? _ref1 : [];
    };

    VariablesCollection.prototype.getVariableByName = function(name) {
      return this.collectVariablesByName([name]).pop();
    };

    VariablesCollection.prototype.getVariableById = function(id) {
      var v, _i, _len, _ref1;
      _ref1 = this.variables;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        v = _ref1[_i];
        if (v.id === id) {
          return v;
        }
      }
    };

    VariablesCollection.prototype.getVariablesForPaths = function(paths) {
      var p, res, _i, _len;
      res = [];
      for (_i = 0, _len = paths.length; _i < _len; _i++) {
        p = paths[_i];
        if (p in this.variablesByPath) {
          res = res.concat(this.variablesByPath[p]);
        }
      }
      return res;
    };

    VariablesCollection.prototype.getColorVariables = function() {
      return this.colorVariables.slice();
    };

    VariablesCollection.prototype.find = function(properties) {
      var _ref1;
      return (_ref1 = this.findAll(properties)) != null ? _ref1[0] : void 0;
    };

    VariablesCollection.prototype.findAll = function(properties) {
      var keys;
      if (properties == null) {
        properties = {};
      }
      keys = Object.keys(properties);
      if (keys.length === 0) {
        return null;
      }
      return this.variables.filter(function(v) {
        return keys.every(function(k) {
          var a, b, _ref1;
          if (((_ref1 = v[k]) != null ? _ref1.isEqual : void 0) != null) {
            return v[k].isEqual(properties[k]);
          } else if (Array.isArray(b = properties[k])) {
            a = v[k];
            return a.length === b.length && a.every(function(value) {
              return __indexOf.call(b, value) >= 0;
            });
          } else {
            return v[k] === properties[k];
          }
        });
      });
    };

    VariablesCollection.prototype.updateCollection = function(collection, paths) {
      var created, destroyed, path, pathsCollection, pathsToDestroy, remainingPaths, results, updated, v, _i, _j, _k, _len, _len1, _len2, _name, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7;
      pathsCollection = {};
      remainingPaths = [];
      for (_i = 0, _len = collection.length; _i < _len; _i++) {
        v = collection[_i];
        if (pathsCollection[_name = v.path] == null) {
          pathsCollection[_name] = [];
        }
        pathsCollection[v.path].push(v);
        if (_ref1 = v.path, __indexOf.call(remainingPaths, _ref1) < 0) {
          remainingPaths.push(v.path);
        }
      }
      results = {
        created: [],
        destroyed: [],
        updated: []
      };
      for (path in pathsCollection) {
        collection = pathsCollection[path];
        _ref2 = this.updatePathCollection(path, collection, true) || {}, created = _ref2.created, updated = _ref2.updated, destroyed = _ref2.destroyed;
        if (created != null) {
          results.created = results.created.concat(created);
        }
        if (updated != null) {
          results.updated = results.updated.concat(updated);
        }
        if (destroyed != null) {
          results.destroyed = results.destroyed.concat(destroyed);
        }
      }
      if (paths != null) {
        pathsToDestroy = collection.length === 0 ? paths : paths.filter(function(p) {
          return __indexOf.call(remainingPaths, p) < 0;
        });
        for (_j = 0, _len1 = pathsToDestroy.length; _j < _len1; _j++) {
          path = pathsToDestroy[_j];
          _ref3 = this.updatePathCollection(path, collection, true) || {}, created = _ref3.created, updated = _ref3.updated, destroyed = _ref3.destroyed;
          if (created != null) {
            results.created = results.created.concat(created);
          }
          if (updated != null) {
            results.updated = results.updated.concat(updated);
          }
          if (destroyed != null) {
            results.destroyed = results.destroyed.concat(destroyed);
          }
        }
      }
      results = this.updateDependencies(results);
      if (((_ref4 = results.created) != null ? _ref4.length : void 0) === 0) {
        delete results.created;
      }
      if (((_ref5 = results.updated) != null ? _ref5.length : void 0) === 0) {
        delete results.updated;
      }
      if (((_ref6 = results.destroyed) != null ? _ref6.length : void 0) === 0) {
        delete results.destroyed;
      }
      if (results.destroyed != null) {
        _ref7 = results.destroyed;
        for (_k = 0, _len2 = _ref7.length; _k < _len2; _k++) {
          v = _ref7[_k];
          this.deleteVariableReferences(v);
        }
      }
      return this.emitChangeEvent(results);
    };

    VariablesCollection.prototype.updatePathCollection = function(path, collection, batch) {
      var destroyed, pathCollection, results, status, v, _i, _j, _len, _len1;
      if (batch == null) {
        batch = false;
      }
      pathCollection = this.variablesByPath[path] || [];
      results = this.addMany(collection, true);
      destroyed = [];
      for (_i = 0, _len = pathCollection.length; _i < _len; _i++) {
        v = pathCollection[_i];
        status = this.getVariableStatusInCollection(v, collection)[0];
        if (status === 'created') {
          destroyed.push(this.remove(v, true));
        }
      }
      if (destroyed.length > 0) {
        results.destroyed = destroyed;
      }
      if (batch) {
        return results;
      } else {
        results = this.updateDependencies(results);
        for (_j = 0, _len1 = destroyed.length; _j < _len1; _j++) {
          v = destroyed[_j];
          this.deleteVariableReferences(v);
        }
        return this.emitChangeEvent(results);
      }
    };

    VariablesCollection.prototype.add = function(variable, batch) {
      var previousVariable, status, _ref1;
      if (batch == null) {
        batch = false;
      }
      _ref1 = this.getVariableStatus(variable), status = _ref1[0], previousVariable = _ref1[1];
      variable["default"] || (variable["default"] = variable.path.match(/\/.pigments$/));
      switch (status) {
        case 'moved':
          previousVariable.range = variable.range;
          previousVariable.bufferRange = variable.bufferRange;
          return void 0;
        case 'updated':
          return this.updateVariable(previousVariable, variable, batch);
        case 'created':
          return this.createVariable(variable, batch);
      }
    };

    VariablesCollection.prototype.addMany = function(variables, batch) {
      var res, results, status, v, variable, _i, _len;
      if (batch == null) {
        batch = false;
      }
      results = {};
      for (_i = 0, _len = variables.length; _i < _len; _i++) {
        variable = variables[_i];
        res = this.add(variable, true);
        if (res != null) {
          status = res[0], v = res[1];
          if (results[status] == null) {
            results[status] = [];
          }
          results[status].push(v);
        }
      }
      if (batch) {
        return results;
      } else {
        return this.emitChangeEvent(this.updateDependencies(results));
      }
    };

    VariablesCollection.prototype.remove = function(variable, batch) {
      var results;
      if (batch == null) {
        batch = false;
      }
      variable = this.find(variable);
      if (variable == null) {
        return;
      }
      this.variables = this.variables.filter(function(v) {
        return v !== variable;
      });
      if (variable.isColor) {
        this.colorVariables = this.colorVariables.filter(function(v) {
          return v !== variable;
        });
      }
      if (batch) {
        return variable;
      } else {
        results = this.updateDependencies({
          destroyed: [variable]
        });
        this.deleteVariableReferences(variable);
        return this.emitChangeEvent(results);
      }
    };

    VariablesCollection.prototype.removeMany = function(variables, batch) {
      var destroyed, results, v, variable, _i, _j, _len, _len1;
      if (batch == null) {
        batch = false;
      }
      destroyed = [];
      for (_i = 0, _len = variables.length; _i < _len; _i++) {
        variable = variables[_i];
        destroyed.push(this.remove(variable, true));
      }
      results = {
        destroyed: destroyed
      };
      if (batch) {
        return results;
      } else {
        results = this.updateDependencies(results);
        for (_j = 0, _len1 = destroyed.length; _j < _len1; _j++) {
          v = destroyed[_j];
          if (v != null) {
            this.deleteVariableReferences(v);
          }
        }
        return this.emitChangeEvent(results);
      }
    };

    VariablesCollection.prototype.deleteVariablesForPaths = function(paths) {
      return this.removeMany(this.getVariablesForPaths(paths));
    };

    VariablesCollection.prototype.deleteVariableReferences = function(variable) {
      var a, dependencies;
      dependencies = this.getVariableDependencies(variable);
      a = this.variablesByPath[variable.path];
      a.splice(a.indexOf(variable), 1);
      a = this.variableNames;
      a.splice(a.indexOf(variable.name), 1);
      this.removeDependencies(variable.name, dependencies);
      return delete this.dependencyGraph[variable.name];
    };

    VariablesCollection.prototype.getContext = function() {
      if (ColorContext == null) {
        ColorContext = require('./color-context');
      }
      if (registry == null) {
        registry = require('./color-expressions');
      }
      return new ColorContext({
        variables: this.variables,
        colorVariables: this.colorVariables,
        registry: registry
      });
    };

    VariablesCollection.prototype.evaluateVariables = function(variables, callback) {
      var iteration, remainingVariables, updated;
      updated = [];
      remainingVariables = variables.slice();
      iteration = (function(_this) {
        return function(cb) {
          var end, isColor, start, v, wasColor;
          start = new Date;
          end = new Date;
          while (remainingVariables.length > 0 && end - start < 100) {
            v = remainingVariables.shift();
            wasColor = v.isColor;
            _this.evaluateVariableColor(v, wasColor);
            isColor = v.isColor;
            if (isColor !== wasColor) {
              updated.push(v);
              if (isColor) {
                _this.buildDependencyGraph(v);
              }
              end = new Date;
            }
          }
          if (remainingVariables.length > 0) {
            return requestAnimationFrame(function() {
              return iteration(cb);
            });
          } else {
            return typeof cb === "function" ? cb() : void 0;
          }
        };
      })(this);
      return iteration((function(_this) {
        return function() {
          if (updated.length > 0) {
            _this.emitChangeEvent(_this.updateDependencies({
              updated: updated
            }));
          }
          return typeof callback === "function" ? callback(updated) : void 0;
        };
      })(this));
    };

    VariablesCollection.prototype.updateVariable = function(previousVariable, variable, batch) {
      var added, newDependencies, previousDependencies, removed, _ref1;
      previousDependencies = this.getVariableDependencies(previousVariable);
      previousVariable.value = variable.value;
      previousVariable.range = variable.range;
      previousVariable.bufferRange = variable.bufferRange;
      this.evaluateVariableColor(previousVariable, previousVariable.isColor);
      newDependencies = this.getVariableDependencies(previousVariable);
      _ref1 = this.diffArrays(previousDependencies, newDependencies), removed = _ref1.removed, added = _ref1.added;
      this.removeDependencies(variable.name, removed);
      this.addDependencies(variable.name, added);
      if (batch) {
        return ['updated', previousVariable];
      } else {
        return this.emitChangeEvent(this.updateDependencies({
          updated: [previousVariable]
        }));
      }
    };

    VariablesCollection.prototype.restoreVariable = function(variable) {
      var _base, _name;
      if (Color == null) {
        Color = require('./color');
      }
      this.variableNames.push(variable.name);
      this.variables.push(variable);
      variable.id = nextId++;
      if (variable.isColor) {
        variable.color = new Color(variable.color);
        variable.color.variables = variable.variables;
        this.colorVariables.push(variable);
        delete variable.variables;
      }
      if ((_base = this.variablesByPath)[_name = variable.path] == null) {
        _base[_name] = [];
      }
      this.variablesByPath[variable.path].push(variable);
      return this.buildDependencyGraph(variable);
    };

    VariablesCollection.prototype.createVariable = function(variable, batch) {
      var _base, _name;
      this.variableNames.push(variable.name);
      this.variables.push(variable);
      variable.id = nextId++;
      if ((_base = this.variablesByPath)[_name = variable.path] == null) {
        _base[_name] = [];
      }
      this.variablesByPath[variable.path].push(variable);
      this.evaluateVariableColor(variable);
      this.buildDependencyGraph(variable);
      if (batch) {
        return ['created', variable];
      } else {
        return this.emitChangeEvent(this.updateDependencies({
          created: [variable]
        }));
      }
    };

    VariablesCollection.prototype.evaluateVariableColor = function(variable, wasColor) {
      var color, context;
      if (wasColor == null) {
        wasColor = false;
      }
      context = this.getContext();
      color = context.readColor(variable.value, true);
      if (color != null) {
        if (wasColor && color.isEqual(variable.color)) {
          return false;
        }
        variable.color = color;
        variable.isColor = true;
        if (__indexOf.call(this.colorVariables, variable) < 0) {
          this.colorVariables.push(variable);
        }
        return true;
      } else if (wasColor) {
        delete variable.color;
        variable.isColor = false;
        this.colorVariables = this.colorVariables.filter(function(v) {
          return v !== variable;
        });
        return true;
      }
    };

    VariablesCollection.prototype.getVariableStatus = function(variable) {
      if (this.variablesByPath[variable.path] == null) {
        return ['created', variable];
      }
      return this.getVariableStatusInCollection(variable, this.variablesByPath[variable.path]);
    };

    VariablesCollection.prototype.getVariableStatusInCollection = function(variable, collection) {
      var status, v, _i, _len;
      for (_i = 0, _len = collection.length; _i < _len; _i++) {
        v = collection[_i];
        status = this.compareVariables(v, variable);
        switch (status) {
          case 'identical':
            return ['unchanged', v];
          case 'move':
            return ['moved', v];
          case 'update':
            return ['updated', v];
        }
      }
      return ['created', variable];
    };

    VariablesCollection.prototype.compareVariables = function(v1, v2) {
      var sameLine, sameName, sameRange, sameValue;
      sameName = v1.name === v2.name;
      sameValue = v1.value === v2.value;
      sameLine = v1.line === v2.line;
      sameRange = v1.range[0] === v2.range[0] && v1.range[1] === v2.range[1];
      if ((v1.bufferRange != null) && (v2.bufferRange != null)) {
        sameRange && (sameRange = v1.bufferRange.isEqual(v2.bufferRange));
      }
      if (sameName && sameValue) {
        if (sameRange) {
          return 'identical';
        } else {
          return 'move';
        }
      } else if (sameName) {
        if (sameRange || sameLine) {
          return 'update';
        } else {
          return 'different';
        }
      }
    };

    VariablesCollection.prototype.buildDependencyGraph = function(variable) {
      var a, dependencies, dependency, _base, _i, _len, _ref1, _results;
      dependencies = this.getVariableDependencies(variable);
      _results = [];
      for (_i = 0, _len = dependencies.length; _i < _len; _i++) {
        dependency = dependencies[_i];
        a = (_base = this.dependencyGraph)[dependency] != null ? _base[dependency] : _base[dependency] = [];
        if (_ref1 = variable.name, __indexOf.call(a, _ref1) < 0) {
          _results.push(a.push(variable.name));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    VariablesCollection.prototype.getVariableDependencies = function(variable) {
      var dependencies, v, variables, _i, _len, _ref1, _ref2, _ref3;
      dependencies = [];
      if (_ref1 = variable.value, __indexOf.call(this.variableNames, _ref1) >= 0) {
        dependencies.push(variable.value);
      }
      if (((_ref2 = variable.color) != null ? (_ref3 = _ref2.variables) != null ? _ref3.length : void 0 : void 0) > 0) {
        variables = variable.color.variables;
        for (_i = 0, _len = variables.length; _i < _len; _i++) {
          v = variables[_i];
          if (__indexOf.call(dependencies, v) < 0) {
            dependencies.push(v);
          }
        }
      }
      return dependencies;
    };

    VariablesCollection.prototype.collectVariablesByName = function(names) {
      var v, variables, _i, _len, _ref1, _ref2;
      variables = [];
      _ref1 = this.variables;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        v = _ref1[_i];
        if (_ref2 = v.name, __indexOf.call(names, _ref2) >= 0) {
          variables.push(v);
        }
      }
      return variables;
    };

    VariablesCollection.prototype.removeDependencies = function(from, to) {
      var dependencies, v, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = to.length; _i < _len; _i++) {
        v = to[_i];
        if (dependencies = this.dependencyGraph[v]) {
          dependencies.splice(dependencies.indexOf(from), 1);
          if (dependencies.length === 0) {
            _results.push(delete this.dependencyGraph[v]);
          } else {
            _results.push(void 0);
          }
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    VariablesCollection.prototype.addDependencies = function(from, to) {
      var v, _base, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = to.length; _i < _len; _i++) {
        v = to[_i];
        if ((_base = this.dependencyGraph)[v] == null) {
          _base[v] = [];
        }
        _results.push(this.dependencyGraph[v].push(from));
      }
      return _results;
    };

    VariablesCollection.prototype.updateDependencies = function(_arg) {
      var created, createdVariableNames, dependencies, destroyed, dirtyVariableNames, dirtyVariables, name, updated, variable, variables, _i, _j, _k, _len, _len1, _len2;
      created = _arg.created, updated = _arg.updated, destroyed = _arg.destroyed;
      this.updateColorVariablesExpression();
      variables = [];
      dirtyVariableNames = [];
      if (created != null) {
        variables = variables.concat(created);
        createdVariableNames = created.map(function(v) {
          return v.name;
        });
      } else {
        createdVariableNames = [];
      }
      if (updated != null) {
        variables = variables.concat(updated);
      }
      if (destroyed != null) {
        variables = variables.concat(destroyed);
      }
      variables = variables.filter(function(v) {
        return v != null;
      });
      for (_i = 0, _len = variables.length; _i < _len; _i++) {
        variable = variables[_i];
        if (dependencies = this.dependencyGraph[variable.name]) {
          for (_j = 0, _len1 = dependencies.length; _j < _len1; _j++) {
            name = dependencies[_j];
            if (__indexOf.call(dirtyVariableNames, name) < 0 && __indexOf.call(createdVariableNames, name) < 0) {
              dirtyVariableNames.push(name);
            }
          }
        }
      }
      dirtyVariables = this.collectVariablesByName(dirtyVariableNames);
      for (_k = 0, _len2 = dirtyVariables.length; _k < _len2; _k++) {
        variable = dirtyVariables[_k];
        if (this.evaluateVariableColor(variable, variable.isColor)) {
          if (updated == null) {
            updated = [];
          }
          updated.push(variable);
        }
      }
      return {
        created: created,
        destroyed: destroyed,
        updated: updated
      };
    };

    VariablesCollection.prototype.emitChangeEvent = function(_arg) {
      var created, destroyed, updated;
      created = _arg.created, destroyed = _arg.destroyed, updated = _arg.updated;
      if ((created != null ? created.length : void 0) || (destroyed != null ? destroyed.length : void 0) || (updated != null ? updated.length : void 0)) {
        this.updateColorVariablesExpression();
        return this.emitter.emit('did-change', {
          created: created,
          destroyed: destroyed,
          updated: updated
        });
      }
    };

    VariablesCollection.prototype.updateColorVariablesExpression = function() {
      var colorVariables;
      if (registry == null) {
        registry = require('./color-expressions');
      }
      colorVariables = this.getColorVariables();
      if (colorVariables.length > 0) {
        if (ColorExpression == null) {
          ColorExpression = require('./color-expression');
        }
        return registry.addExpression(ColorExpression.colorExpressionForColorVariables(colorVariables));
      } else {
        return registry.removeExpression('pigments:variables');
      }
    };

    VariablesCollection.prototype.diffArrays = function(a, b) {
      var added, removed, v, _i, _j, _len, _len1;
      removed = [];
      added = [];
      for (_i = 0, _len = a.length; _i < _len; _i++) {
        v = a[_i];
        if (__indexOf.call(b, v) < 0) {
          removed.push(v);
        }
      }
      for (_j = 0, _len1 = b.length; _j < _len1; _j++) {
        v = b[_j];
        if (__indexOf.call(a, v) < 0) {
          added.push(v);
        }
      }
      return {
        removed: removed,
        added: added
      };
    };

    VariablesCollection.prototype.serialize = function() {
      return {
        deserializer: 'VariablesCollection',
        content: this.variables.map(function(v) {
          var res;
          res = {
            name: v.name,
            value: v.value,
            path: v.path,
            range: v.range,
            line: v.line
          };
          if (v.isAlternate) {
            res.isAlternate = true;
          }
          if (v.noNamePrefix) {
            res.noNamePrefix = true;
          }
          if (v["default"]) {
            res["default"] = true;
          }
          if (v.isColor) {
            res.isColor = true;
            res.color = v.color.serialize();
            if (v.color.variables != null) {
              res.variables = v.color.variables;
            }
          }
          return res;
        })
      };
    };

    return VariablesCollection;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvcGlnbWVudHMvbGliL3ZhcmlhYmxlcy1jb2xsZWN0aW9uLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSwwRkFBQTtJQUFBLHFKQUFBOztBQUFBLEVBQUEsT0FBNEQsRUFBNUQsRUFBQyxpQkFBRCxFQUFVLHlCQUFWLEVBQTJCLHNCQUEzQixFQUF5QyxlQUF6QyxFQUFnRCxrQkFBaEQsQ0FBQTs7QUFBQSxFQUVBLE1BQUEsR0FBUyxDQUZULENBQUE7O0FBQUEsRUFJQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ0osSUFBQSxtQkFBQyxDQUFBLFdBQUQsR0FBYyxTQUFDLEtBQUQsR0FBQTthQUNSLElBQUEsbUJBQUEsQ0FBb0IsS0FBcEIsRUFEUTtJQUFBLENBQWQsQ0FBQTs7QUFBQSxJQUdBLE1BQU0sQ0FBQyxjQUFQLENBQXNCLG1CQUFDLENBQUEsU0FBdkIsRUFBa0MsUUFBbEMsRUFBNEM7QUFBQSxNQUMxQyxHQUFBLEVBQUssU0FBQSxHQUFBO2VBQUcsSUFBQyxDQUFBLFNBQVMsQ0FBQyxPQUFkO01BQUEsQ0FEcUM7QUFBQSxNQUUxQyxVQUFBLEVBQVksSUFGOEI7S0FBNUMsQ0FIQSxDQUFBOztBQVFhLElBQUEsNkJBQUMsS0FBRCxHQUFBOztRQUNYLFVBQVcsT0FBQSxDQUFRLE1BQVIsQ0FBZSxDQUFDO09BQTNCO0FBQUEsTUFFQSxJQUFDLENBQUEsT0FBRCxHQUFXLEdBQUEsQ0FBQSxPQUZYLENBQUE7QUFBQSxNQUdBLElBQUMsQ0FBQSxTQUFELEdBQWEsRUFIYixDQUFBO0FBQUEsTUFJQSxJQUFDLENBQUEsYUFBRCxHQUFpQixFQUpqQixDQUFBO0FBQUEsTUFLQSxJQUFDLENBQUEsY0FBRCxHQUFrQixFQUxsQixDQUFBO0FBQUEsTUFNQSxJ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

//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/pigments/lib/variables-collection.coffee
