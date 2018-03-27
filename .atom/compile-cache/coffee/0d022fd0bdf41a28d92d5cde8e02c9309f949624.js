(function() {
  var ColorExpression, Emitter, ExpressionsRegistry, vm,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  Emitter = require('atom').Emitter;

  ColorExpression = require('./color-expression');

  vm = require('vm');

  module.exports = ExpressionsRegistry = (function() {
    ExpressionsRegistry.deserialize = function(serializedData, expressionsType) {
      var data, handle, name, registry, _ref;
      registry = new ExpressionsRegistry(expressionsType);
      _ref = serializedData.expressions;
      for (name in _ref) {
        data = _ref[name];
        handle = vm.runInNewContext(data.handle.replace('function', "handle = function"), {
          console: console,
          require: require
        });
        registry.createExpression(name, data.regexpString, data.priority, data.scopes, handle);
      }
      registry.regexpString = serializedData.regexpString;
      return registry;
    };

    function ExpressionsRegistry(expressionsType) {
      this.expressionsType = expressionsType;
      this.colorExpressions = {};
      this.emitter = new Emitter;
    }

    ExpressionsRegistry.prototype.dispose = function() {
      return this.emitter.dispose();
    };

    ExpressionsRegistry.prototype.onDidAddExpression = function(callback) {
      return this.emitter.on('did-add-expression', callback);
    };

    ExpressionsRegistry.prototype.onDidRemoveExpression = function(callback) {
      return this.emitter.on('did-remove-expression', callback);
    };

    ExpressionsRegistry.prototype.onDidUpdateExpressions = function(callback) {
      return this.emitter.on('did-update-expressions', callback);
    };

    ExpressionsRegistry.prototype.getExpressions = function() {
      var e, k;
      return ((function() {
        var _ref, _results;
        _ref = this.colorExpressions;
        _results = [];
        for (k in _ref) {
          e = _ref[k];
          _results.push(e);
        }
        return _results;
      }).call(this)).sort(function(a, b) {
        return b.priority - a.priority;
      });
    };

    ExpressionsRegistry.prototype.getExpressionsForScope = function(scope) {
      var expressions;
      expressions = this.getExpressions();
      if (scope === '*') {
        return expressions;
      }
      return expressions.filter(function(e) {
        return __indexOf.call(e.scopes, '*') >= 0 || __indexOf.call(e.scopes, scope) >= 0;
      });
    };

    ExpressionsRegistry.prototype.getExpression = function(name) {
      return this.colorExpressions[name];
    };

    ExpressionsRegistry.prototype.getRegExp = function() {
      return this.regexpString != null ? this.regexpString : this.regexpString = this.getExpressions().map(function(e) {
        return "(" + e.regexpString + ")";
      }).join('|');
    };

    ExpressionsRegistry.prototype.getRegExpForScope = function(scope) {
      return this.regexpString != null ? this.regexpString : this.regexpString = this.getExpressionsForScope(scope).map(function(e) {
        return "(" + e.regexpString + ")";
      }).join('|');
    };

    ExpressionsRegistry.prototype.createExpression = function(name, regexpString, priority, scopes, handle) {
      var newExpression;
      if (priority == null) {
        priority = 0;
      }
      if (scopes == null) {
        scopes = ['*'];
      }
      if (typeof priority === 'function') {
        handle = priority;
        scopes = ['*'];
        priority = 0;
      } else if (typeof priority === 'object') {
        if (typeof scopes === 'function') {
          handle = scopes;
        }
        scopes = priority;
        priority = 0;
      }
      newExpression = new this.expressionsType({
        name: name,
        regexpString: regexpString,
        scopes: scopes,
        priority: priority,
        handle: handle
      });
      return this.addExpression(newExpression);
    };

    ExpressionsRegistry.prototype.addExpression = function(expression, batch) {
      if (batch == null) {
        batch = false;
      }
      delete this.regexpString;
      this.colorExpressions[expression.name] = expression;
      if (!batch) {
        this.emitter.emit('did-add-expression', {
          name: expression.name,
          registry: this
        });
        this.emitter.emit('did-update-expressions', {
          name: expression.name,
          registry: this
        });
      }
      return expression;
    };

    ExpressionsRegistry.prototype.createExpressions = function(expressions) {
      return this.addExpressions(expressions.map((function(_this) {
        return function(e) {
          var expression, handle, name, priority, regexpString, scopes;
          name = e.name, regexpString = e.regexpString, handle = e.handle, priority = e.priority, scopes = e.scopes;
          if (priority == null) {
            priority = 0;
          }
          expression = new _this.expressionsType({
            name: name,
            regexpString: regexpString,
            scopes: scopes,
            handle: handle
          });
          expression.priority = priority;
          return expression;
        };
      })(this)));
    };

    ExpressionsRegistry.prototype.addExpressions = function(expressions) {
      var expression, _i, _len;
      for (_i = 0, _len = expressions.length; _i < _len; _i++) {
        expression = expressions[_i];
        this.addExpression(expression, true);
        this.emitter.emit('did-add-expression', {
          name: expression.name,
          registry: this
        });
      }
      return this.emitter.emit('did-update-expressions', {
        registry: this
      });
    };

    ExpressionsRegistry.prototype.removeExpression = function(name) {
      delete this.regexpString;
      delete this.colorExpressions[name];
      this.emitter.emit('did-remove-expression', {
        name: name,
        registry: this
      });
      return this.emitter.emit('did-update-expressions', {
        name: name,
        registry: this
      });
    };

    ExpressionsRegistry.prototype.serialize = function() {
      var expression, key, out, _ref, _ref1;
      out = {
        regexpString: this.getRegExp(),
        expressions: {}
      };
      _ref = this.colorExpressions;
      for (key in _ref) {
        expression = _ref[key];
        out.expressions[key] = {
          name: expression.name,
          regexpString: expression.regexpString,
          priority: expression.priority,
          scopes: expression.scopes,
          handle: (_ref1 = expression.handle) != null ? _ref1.toString() : void 0
        };
      }
      return out;
    };

    return ExpressionsRegistry;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvcGlnbWVudHMvbGliL2V4cHJlc3Npb25zLXJlZ2lzdHJ5LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxpREFBQTtJQUFBLHFKQUFBOztBQUFBLEVBQUMsVUFBVyxPQUFBLENBQVEsTUFBUixFQUFYLE9BQUQsQ0FBQTs7QUFBQSxFQUNBLGVBQUEsR0FBa0IsT0FBQSxDQUFRLG9CQUFSLENBRGxCLENBQUE7O0FBQUEsRUFFQSxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVIsQ0FGTCxDQUFBOztBQUFBLEVBSUEsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNKLElBQUEsbUJBQUMsQ0FBQSxXQUFELEdBQWMsU0FBQyxjQUFELEVBQWlCLGVBQWpCLEdBQUE7QUFDWixVQUFBLGtDQUFBO0FBQUEsTUFBQSxRQUFBLEdBQWUsSUFBQSxtQkFBQSxDQUFvQixlQUFwQixDQUFmLENBQUE7QUFFQTtBQUFBLFdBQUEsWUFBQTswQkFBQTtBQUNFLFFBQUEsTUFBQSxHQUFTLEVBQUUsQ0FBQyxlQUFILENBQW1CLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBWixDQUFvQixVQUFwQixFQUFnQyxtQkFBaEMsQ0FBbkIsRUFBeUU7QUFBQSxVQUFDLFNBQUEsT0FBRDtBQUFBLFVBQVUsU0FBQSxPQUFWO1NBQXpFLENBQVQsQ0FBQTtBQUFBLFFBQ0EsUUFBUSxDQUFDLGdCQUFULENBQTBCLElBQTFCLEVBQWdDLElBQUksQ0FBQyxZQUFyQyxFQUFtRCxJQUFJLENBQUMsUUFBeEQsRUFBa0UsSUFBSSxDQUFDLE1BQXZFLEVBQStFLE1BQS9FLENBREEsQ0FERjtBQUFBLE9BRkE7QUFBQSxNQU1BLFFBQVEsQ0FBQyxZQUFULEdBQXdCLGNBQWMsQ0FBQyxZQU52QyxDQUFBO2FBUUEsU0FU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

//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/pigments/lib/expressions-registry.coffee
