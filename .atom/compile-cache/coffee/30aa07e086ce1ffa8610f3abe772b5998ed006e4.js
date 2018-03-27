(function() {
  var Emitter, ExpressionsRegistry, vm, _ref,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  _ref = [], Emitter = _ref[0], vm = _ref[1];

  module.exports = ExpressionsRegistry = (function() {
    ExpressionsRegistry.deserialize = function(serializedData, expressionsType) {
      var data, handle, name, registry, _ref1;
      if (vm == null) {
        vm = require('vm');
      }
      registry = new ExpressionsRegistry(expressionsType);
      _ref1 = serializedData.expressions;
      for (name in _ref1) {
        data = _ref1[name];
        handle = vm.runInNewContext(data.handle.replace('function', "handle = function"), {
          console: console,
          require: require
        });
        registry.createExpression(name, data.regexpString, data.priority, data.scopes, handle);
      }
      registry.regexpStrings['none'] = serializedData.regexpString;
      return registry;
    };

    function ExpressionsRegistry(expressionsType) {
      this.expressionsType = expressionsType;
      if (Emitter == null) {
        Emitter = require('event-kit').Emitter;
      }
      this.colorExpressions = {};
      this.emitter = new Emitter;
      this.regexpStrings = {};
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
        var _ref1, _results;
        _ref1 = this.colorExpressions;
        _results = [];
        for (k in _ref1) {
          e = _ref1[k];
          _results.push(e);
        }
        return _results;
      }).call(this)).sort(function(a, b) {
        return b.priority - a.priority;
      });
    };

    ExpressionsRegistry.prototype.getExpressionsForScope = function(scope) {
      var expressions, matchScope;
      expressions = this.getExpressions();
      if (scope === '*') {
        return expressions;
      }
      matchScope = function(a) {
        return function(b) {
          var aa, ab, ba, bb, _ref1, _ref2;
          _ref1 = a.split(':'), aa = _ref1[0], ab = _ref1[1];
          _ref2 = b.split(':'), ba = _ref2[0], bb = _ref2[1];
          return aa === ba && ((ab == null) || (bb == null) || ab === bb);
        };
      };
      return expressions.filter(function(e) {
        return __indexOf.call(e.scopes, '*') >= 0 || e.scopes.some(matchScope(scope));
      });
    };

    ExpressionsRegistry.prototype.getExpression = function(name) {
      return this.colorExpressions[name];
    };

    ExpressionsRegistry.prototype.getRegExp = function() {
      var _base;
      return (_base = this.regexpStrings)['none'] != null ? _base['none'] : _base['none'] = this.getExpressions().map(function(e) {
        return "(" + e.regexpString + ")";
      }).join('|');
    };

    ExpressionsRegistry.prototype.getRegExpForScope = function(scope) {
      var _base;
      return (_base = this.regexpStrings)[scope] != null ? _base[scope] : _base[scope] = this.getExpressionsForScope(scope).map(function(e) {
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
      if (!(scopes.length === 1 && scopes[0] === '*')) {
        scopes.push('pigments');
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
      this.regexpStrings = {};
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
      delete this.colorExpressions[name];
      this.regexpStrings = {};
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
      var expression, key, out, _ref1, _ref2;
      out = {
        regexpString: this.getRegExp(),
        expressions: {}
      };
      _ref1 = this.colorExpressions;
      for (key in _ref1) {
        expression = _ref1[key];
        out.expressions[key] = {
          name: expression.name,
          regexpString: expression.regexpString,
          priority: expression.priority,
          scopes: expression.scopes,
          handle: (_ref2 = expression.handle) != null ? _ref2.toString() : void 0
        };
      }
      return out;
    };

    return ExpressionsRegistry;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvcGlnbWVudHMvbGliL2V4cHJlc3Npb25zLXJlZ2lzdHJ5LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxzQ0FBQTtJQUFBLHFKQUFBOztBQUFBLEVBQUEsT0FBZ0IsRUFBaEIsRUFBQyxpQkFBRCxFQUFVLFlBQVYsQ0FBQTs7QUFBQSxFQUVBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDSixJQUFBLG1CQUFDLENBQUEsV0FBRCxHQUFjLFNBQUMsY0FBRCxFQUFpQixlQUFqQixHQUFBO0FBQ1osVUFBQSxtQ0FBQTs7UUFBQSxLQUFNLE9BQUEsQ0FBUSxJQUFSO09BQU47QUFBQSxNQUVBLFFBQUEsR0FBZSxJQUFBLG1CQUFBLENBQW9CLGVBQXBCLENBRmYsQ0FBQTtBQUlBO0FBQUEsV0FBQSxhQUFBOzJCQUFBO0FBQ0UsUUFBQSxNQUFBLEdBQVMsRUFBRSxDQUFDLGVBQUgsQ0FBbUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFaLENBQW9CLFVBQXBCLEVBQWdDLG1CQUFoQyxDQUFuQixFQUF5RTtBQUFBLFVBQUMsU0FBQSxPQUFEO0FBQUEsVUFBVSxTQUFBLE9BQVY7U0FBekUsQ0FBVCxDQUFBO0FBQUEsUUFDQSxRQUFRLENBQUMsZ0JBQVQsQ0FBMEIsSUFBMUIsRUFBZ0MsSUFBSSxDQUFDLFlBQXJDLEVBQW1ELElBQUksQ0FBQyxRQUF4RCxFQUFrRSxJQUFJLENBQUMsTUFBdkUsRUFBK0UsTUFBL0UsQ0FEQSxDQURGO0FBQUEsT0FKQTtBQUFBLE1BUUEsUUFBUSxDQUFDLGFBQWMsQ0FBQSxNQUFBLENBQXZCLEdBQWlDLGNBQWMsQ0FBQyxZQVJoRCxDQUFBO2FBVUEsU0FYWTtJQUFBLENBQWQsQ0FBQTs7QUFjYSxJQUFBLDZCQUFFLGVBQUYsR0FBQTtB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

//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/pigments/lib/expressions-registry.coffee
