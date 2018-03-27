(function() {
  var ColorExpression, Emitter, ExpressionsRegistry, vm,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  Emitter = require('event-kit').Emitter;

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
      registry.regexpStrings['none'] = serializedData.regexpString;
      return registry;
    };

    function ExpressionsRegistry(expressionsType) {
      this.expressionsType = expressionsType;
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
      var expressions, matchScope;
      expressions = this.getExpressions();
      if (scope === '*') {
        return expressions;
      }
      matchScope = function(a) {
        return function(b) {
          var aa, ab, ba, bb, _ref, _ref1;
          _ref = a.split(':'), aa = _ref[0], ab = _ref[1];
          _ref1 = b.split(':'), ba = _ref1[0], bb = _ref1[1];
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvcGlnbWVudHMvbGliL2V4cHJlc3Npb25zLXJlZ2lzdHJ5LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxpREFBQTtJQUFBLHFKQUFBOztBQUFBLEVBQUMsVUFBVyxPQUFBLENBQVEsV0FBUixFQUFYLE9BQUQsQ0FBQTs7QUFBQSxFQUNBLGVBQUEsR0FBa0IsT0FBQSxDQUFRLG9CQUFSLENBRGxCLENBQUE7O0FBQUEsRUFFQSxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVIsQ0FGTCxDQUFBOztBQUFBLEVBSUEsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNKLElBQUEsbUJBQUMsQ0FBQSxXQUFELEdBQWMsU0FBQyxjQUFELEVBQWlCLGVBQWpCLEdBQUE7QUFDWixVQUFBLGtDQUFBO0FBQUEsTUFBQSxRQUFBLEdBQWUsSUFBQSxtQkFBQSxDQUFvQixlQUFwQixDQUFmLENBQUE7QUFFQTtBQUFBLFdBQUEsWUFBQTswQkFBQTtBQUNFLFFBQUEsTUFBQSxHQUFTLEVBQUUsQ0FBQyxlQUFILENBQW1CLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBWixDQUFvQixVQUFwQixFQUFnQyxtQkFBaEMsQ0FBbkIsRUFBeUU7QUFBQSxVQUFDLFNBQUEsT0FBRDtBQUFBLFVBQVUsU0FBQSxPQUFWO1NBQXpFLENBQVQsQ0FBQTtBQUFBLFFBQ0EsUUFBUSxDQUFDLGdCQUFULENBQTBCLElBQTFCLEVBQWdDLElBQUksQ0FBQyxZQUFyQyxFQUFtRCxJQUFJLENBQUMsUUFBeEQsRUFBa0UsSUFBSSxDQUFDLE1BQXZFLEVBQStFLE1BQS9FLENBREEsQ0FERjtBQUFBLE9BRkE7QUFBQSxNQU1BLFFBQVEsQ0FBQyxhQUFjLENBQUEsTUFBQSxDQUF2QixHQUFpQyxjQUFjLENBQUMsWUFO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

//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/pigments/lib/expressions-registry.coffee
