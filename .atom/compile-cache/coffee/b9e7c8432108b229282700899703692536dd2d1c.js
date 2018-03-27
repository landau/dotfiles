(function() {
  var BlendModes, Color, ColorContext, ColorExpression, ColorParser, DVIPnames, SVGColors, clamp, clampInt, comma, float, floatOrPercent, hexadecimal, int, intOrPercent, namePrefixes, notQuote, optionalPercent, pe, percent, ps, scopeFromFileName, split, variables, _ref, _ref1,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  Color = require('./color');

  ColorParser = null;

  ColorExpression = require('./color-expression');

  SVGColors = require('./svg-colors');

  DVIPnames = require('./dvipnames');

  BlendModes = require('./blend-modes');

  scopeFromFileName = require('./scope-from-file-name');

  _ref = require('./utils'), split = _ref.split, clamp = _ref.clamp, clampInt = _ref.clampInt;

  _ref1 = require('./regexes'), int = _ref1.int, float = _ref1.float, percent = _ref1.percent, optionalPercent = _ref1.optionalPercent, intOrPercent = _ref1.intOrPercent, floatOrPercent = _ref1.floatOrPercent, comma = _ref1.comma, notQuote = _ref1.notQuote, hexadecimal = _ref1.hexadecimal, ps = _ref1.ps, pe = _ref1.pe, variables = _ref1.variables, namePrefixes = _ref1.namePrefixes;

  module.exports = ColorContext = (function() {
    function ColorContext(options) {
      var colorVariables, expr, sorted, v, _i, _j, _len, _len1, _ref2, _ref3;
      if (options == null) {
        options = {};
      }
      this.sortPaths = __bind(this.sortPaths, this);
      variables = options.variables, colorVariables = options.colorVariables, this.referenceVariable = options.referenceVariable, this.referencePath = options.referencePath, this.rootPaths = options.rootPaths, this.parser = options.parser, this.colorVars = options.colorVars, this.vars = options.vars, this.defaultVars = options.defaultVars, this.defaultColorVars = options.defaultColorVars, sorted = options.sorted, this.registry = options.registry;
      if (variables == null) {
        variables = [];
      }
      if (colorVariables == null) {
        colorVariables = [];
      }
      if (this.rootPaths == null) {
        this.rootPaths = [];
      }
      if (this.referenceVariable != null) {
        if (this.referencePath == null) {
          this.referencePath = this.referenceVariable.path;
        }
      }
      if (this.sorted) {
        this.variables = variables;
        this.colorVariables = colorVariables;
      } else {
        this.variables = variables.slice().sort(this.sortPaths);
        this.colorVariables = colorVariables.slice().sort(this.sortPaths);
      }
      if (this.vars == null) {
        this.vars = {};
        this.colorVars = {};
        this.defaultVars = {};
        this.defaultColorVars = {};
        _ref2 = this.variables;
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          v = _ref2[_i];
          this.vars[v.name] = v;
          if (v.path.match(/\/.pigments$/)) {
            this.defaultVars[v.name] = v;
          }
        }
        _ref3 = this.colorVariables;
        for (_j = 0, _len1 = _ref3.length; _j < _len1; _j++) {
          v = _ref3[_j];
          this.colorVars[v.name] = v;
          if (v.path.match(/\/.pigments$/)) {
            this.defaultColorVars[v.name] = v;
          }
        }
      }
      if ((this.registry.getExpression('pigments:variables') == null) && this.colorVariables.length > 0) {
        expr = ColorExpression.colorExpressionForColorVariables(this.colorVariables);
        this.registry.addExpression(expr);
      }
      if (this.parser == null) {
        ColorParser = require('./color-parser');
        this.parser = new ColorParser(this.registry, this);
      }
      this.usedVariables = [];
      this.resolvedVariables = [];
    }

    ColorContext.prototype.sortPaths = function(a, b) {
      var rootA, rootB, rootReference;
      if (this.referencePath != null) {
        if (a.path === b.path) {
          return 0;
        }
        if (a.path === this.referencePath) {
          return 1;
        }
        if (b.path === this.referencePath) {
          return -1;
        }
        rootReference = this.rootPathForPath(this.referencePath);
        rootA = this.rootPathForPath(a.path);
        rootB = this.rootPathForPath(b.path);
        if (rootA === rootB) {
          return 0;
        }
        if (rootA === rootReference) {
          return 1;
        }
        if (rootB === rootReference) {
          return -1;
        }
        return 0;
      } else {
        return 0;
      }
    };

    ColorContext.prototype.rootPathForPath = function(path) {
      var root, _i, _len, _ref2;
      _ref2 = this.rootPaths;
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        root = _ref2[_i];
        if (path.indexOf("" + root + "/") === 0) {
          return root;
        }
      }
    };

    ColorContext.prototype.clone = function() {
      return new ColorContext({
        variables: this.variables,
        colorVariables: this.colorVariables,
        referenceVariable: this.referenceVariable,
        parser: this.parser,
        vars: this.vars,
        colorVars: this.colorVars,
        defaultVars: this.defaultVars,
        defaultColorVars: this.defaultColorVars,
        sorted: true
      });
    };

    ColorContext.prototype.containsVariable = function(variableName) {
      return __indexOf.call(this.getVariablesNames(), variableName) >= 0;
    };

    ColorContext.prototype.hasColorVariables = function() {
      return this.colorVariables.length > 0;
    };

    ColorContext.prototype.getVariables = function() {
      return this.variables;
    };

    ColorContext.prototype.getColorVariables = function() {
      return this.colorVariables;
    };

    ColorContext.prototype.getVariablesNames = function() {
      return this.varNames != null ? this.varNames : this.varNames = Object.keys(this.vars);
    };

    ColorContext.prototype.getVariablesCount = function() {
      return this.varCount != null ? this.varCount : this.varCount = this.getVariablesNames().length;
    };

    ColorContext.prototype.readUsedVariables = function() {
      var usedVariables, v, _i, _len, _ref2;
      usedVariables = [];
      _ref2 = this.usedVariables;
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        v = _ref2[_i];
        if (__indexOf.call(usedVariables, v) < 0) {
          usedVariables.push(v);
        }
      }
      this.usedVariables = [];
      this.resolvedVariables = [];
      return usedVariables;
    };

    ColorContext.prototype.getValue = function(value) {
      var lastRealValue, lookedUpValues, realValue, _ref2, _ref3;
      _ref2 = [], realValue = _ref2[0], lastRealValue = _ref2[1];
      lookedUpValues = [value];
      while ((realValue = (_ref3 = this.vars[value]) != null ? _ref3.value : void 0) && __indexOf.call(lookedUpValues, realValue) < 0) {
        this.usedVariables.push(value);
        value = lastRealValue = realValue;
        lookedUpValues.push(realValue);
      }
      if (__indexOf.call(lookedUpValues, realValue) >= 0) {
        return void 0;
      } else {
        return lastRealValue;
      }
    };

    ColorContext.prototype.readColorExpression = function(value) {
      if (this.colorVars[value] != null) {
        this.usedVariables.push(value);
        return this.colorVars[value].value;
      } else {
        return value;
      }
    };

    ColorContext.prototype.readColor = function(value, keepAllVariables) {
      var realValue, result, scope, _ref2;
      if (keepAllVariables == null) {
        keepAllVariables = false;
      }
      if (__indexOf.call(this.usedVariables, value) >= 0 && !(__indexOf.call(this.resolvedVariables, value) >= 0)) {
        return;
      }
      realValue = this.readColorExpression(value);
      if ((realValue == null) || __indexOf.call(this.usedVariables, realValue) >= 0) {
        return;
      }
      scope = this.colorVars[value] != null ? scopeFromFileName(this.colorVars[value].path) : '*';
      this.usedVariables = this.usedVariables.filter(function(v) {
        return v !== realValue;
      });
      result = this.parser.parse(realValue, scope, false);
      if (result != null) {
        if (result.invalid && (this.defaultColorVars[realValue] != null)) {
          result = this.readColor(this.defaultColorVars[realValue].value);
          value = realValue;
        }
      } else if (this.defaultColorVars[value] != null) {
        this.usedVariables.push(value);
        result = this.readColor(this.defaultColorVars[value].value);
      } else {
        if (this.vars[value] != null) {
          this.usedVariables.push(value);
        }
      }
      if (result != null) {
        this.resolvedVariables.push(value);
        if (keepAllVariables || __indexOf.call(this.usedVariables, value) < 0) {
          result.variables = ((_ref2 = result.variables) != null ? _ref2 : []).concat(this.readUsedVariables());
        }
      }
      return result;
    };

    ColorContext.prototype.readFloat = function(value) {
      var res;
      res = parseFloat(value);
      if (isNaN(res) && (this.vars[value] != null)) {
        this.usedVariables.push(value);
        res = this.readFloat(this.vars[value].value);
      }
      if (isNaN(res) && (this.defaultVars[value] != null)) {
        this.usedVariables.push(value);
        res = this.readFloat(this.defaultVars[value].value);
      }
      return res;
    };

    ColorContext.prototype.readInt = function(value, base) {
      var res;
      if (base == null) {
        base = 10;
      }
      res = parseInt(value, base);
      if (isNaN(res) && (this.vars[value] != null)) {
        this.usedVariables.push(value);
        res = this.readInt(this.vars[value].value);
      }
      if (isNaN(res) && (this.defaultVars[value] != null)) {
        this.usedVariables.push(value);
        res = this.readInt(this.defaultVars[value].value);
      }
      return res;
    };

    ColorContext.prototype.readPercent = function(value) {
      if (!/\d+/.test(value) && (this.vars[value] != null)) {
        this.usedVariables.push(value);
        value = this.readPercent(this.vars[value].value);
      }
      if (!/\d+/.test(value) && (this.defaultVars[value] != null)) {
        this.usedVariables.push(value);
        value = this.readPercent(this.defaultVars[value].value);
      }
      return Math.round(parseFloat(value) * 2.55);
    };

    ColorContext.prototype.readIntOrPercent = function(value) {
      var res;
      if (!/\d+/.test(value) && (this.vars[value] != null)) {
        this.usedVariables.push(value);
        value = this.readIntOrPercent(this.vars[value].value);
      }
      if (!/\d+/.test(value) && (this.defaultVars[value] != null)) {
        this.usedVariables.push(value);
        value = this.readIntOrPercent(this.defaultVars[value].value);
      }
      if (value == null) {
        return NaN;
      }
      if (typeof value === 'number') {
        return value;
      }
      if (value.indexOf('%') !== -1) {
        res = Math.round(parseFloat(value) * 2.55);
      } else {
        res = parseInt(value);
      }
      return res;
    };

    ColorContext.prototype.readFloatOrPercent = function(value) {
      var res;
      if (!/\d+/.test(value) && (this.vars[value] != null)) {
        this.usedVariables.push(value);
        value = this.readFloatOrPercent(this.vars[value].value);
      }
      if (!/\d+/.test(value) && (this.defaultVars[value] != null)) {
        this.usedVariables.push(value);
        value = this.readFloatOrPercent(this.defaultVars[value].value);
      }
      if (value == null) {
        return NaN;
      }
      if (typeof value === 'number') {
        return value;
      }
      if (value.indexOf('%') !== -1) {
        res = parseFloat(value) / 100;
      } else {
        res = parseFloat(value);
        if (res > 1) {
          res = res / 100;
        }
        res;
      }
      return res;
    };

    ColorContext.prototype.SVGColors = SVGColors;

    ColorContext.prototype.Color = Color;

    ColorContext.prototype.BlendModes = BlendModes;

    ColorContext.prototype.split = function(value) {
      return split(value);
    };

    ColorContext.prototype.clamp = function(value) {
      return clamp(value);
    };

    ColorContext.prototype.clampInt = function(value) {
      return clampInt(value);
    };

    ColorContext.prototype.isInvalid = function(color) {
      return !Color.isValid(color);
    };

    ColorContext.prototype.readParam = function(param, block) {
      var name, re, value, _, _ref2;
      re = RegExp("\\$(\\w+):\\s*((-?" + this.float + ")|" + this.variablesRE + ")");
      if (re.test(param)) {
        _ref2 = re.exec(param), _ = _ref2[0], name = _ref2[1], value = _ref2[2];
        return block(name, value);
      }
    };

    ColorContext.prototype.contrast = function(base, dark, light, threshold) {
      var _ref2;
      if (dark == null) {
        dark = new Color('black');
      }
      if (light == null) {
        light = new Color('white');
      }
      if (threshold == null) {
        threshold = 0.43;
      }
      if (dark.luma > light.luma) {
        _ref2 = [dark, light], light = _ref2[0], dark = _ref2[1];
      }
      if (base.luma > threshold) {
        return dark;
      } else {
        return light;
      }
    };

    ColorContext.prototype.mixColors = function(color1, color2, amount, round) {
      var color, inverse;
      if (amount == null) {
        amount = 0.5;
      }
      if (round == null) {
        round = Math.floor;
      }
      if (!((color1 != null) && (color2 != null) && !isNaN(amount))) {
        return new Color(NaN, NaN, NaN, NaN);
      }
      inverse = 1 - amount;
      color = new Color;
      color.rgba = [round(color1.red * amount + color2.red * inverse), round(color1.green * amount + color2.green * inverse), round(color1.blue * amount + color2.blue * inverse), color1.alpha * amount + color2.alpha * inverse];
      return color;
    };

    ColorContext.prototype.int = int;

    ColorContext.prototype.float = float;

    ColorContext.prototype.percent = percent;

    ColorContext.prototype.optionalPercent = optionalPercent;

    ColorContext.prototype.intOrPercent = intOrPercent;

    ColorContext.prototype.floatOrPercent = floatOrPercent;

    ColorContext.prototype.comma = comma;

    ColorContext.prototype.notQuote = notQuote;

    ColorContext.prototype.hexadecimal = hexadecimal;

    ColorContext.prototype.ps = ps;

    ColorContext.prototype.pe = pe;

    ColorContext.prototype.variablesRE = variables;

    ColorContext.prototype.namePrefixes = namePrefixes;

    return ColorContext;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvcGlnbWVudHMvbGliL2NvbG9yLWNvbnRleHQuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQ0E7QUFBQSxNQUFBLDhRQUFBO0lBQUE7eUpBQUE7O0FBQUEsRUFBQSxLQUFBLEdBQVEsT0FBQSxDQUFRLFNBQVIsQ0FBUixDQUFBOztBQUFBLEVBQ0EsV0FBQSxHQUFjLElBRGQsQ0FBQTs7QUFBQSxFQUVBLGVBQUEsR0FBa0IsT0FBQSxDQUFRLG9CQUFSLENBRmxCLENBQUE7O0FBQUEsRUFHQSxTQUFBLEdBQVksT0FBQSxDQUFRLGNBQVIsQ0FIWixDQUFBOztBQUFBLEVBSUEsU0FBQSxHQUFZLE9BQUEsQ0FBUSxhQUFSLENBSlosQ0FBQTs7QUFBQSxFQUtBLFVBQUEsR0FBYSxPQUFBLENBQVEsZUFBUixDQUxiLENBQUE7O0FBQUEsRUFNQSxpQkFBQSxHQUFvQixPQUFBLENBQVEsd0JBQVIsQ0FOcEIsQ0FBQTs7QUFBQSxFQU9BLE9BQTJCLE9BQUEsQ0FBUSxTQUFSLENBQTNCLEVBQUMsYUFBQSxLQUFELEVBQVEsYUFBQSxLQUFSLEVBQWUsZ0JBQUEsUUFQZixDQUFBOztBQUFBLEVBUUEsUUFjSSxPQUFBLENBQVEsV0FBUixDQWRKLEVBQ0UsWUFBQSxHQURGLEVBRUUsY0FBQSxLQUZGLEVBR0UsZ0JBQUEsT0FIRixFQUlFLHdCQUFBLGVBSkYsRUFLRSxxQkFBQSxZQUxGLEVBTUUsdUJBQUEsY0FORixFQU9FLGNBQUEsS0FQRixFQVFFLGlCQUFBLFFBUkYsRUFTRSxvQkFBQSxXQVRGLEVBVUUsV0FBQSxFQVZGLEVBV0UsV0FBQSxFQVhGLEVBWUUsa0JBQUEsU0FaRixFQWFFLHFCQUFBLFlBckJGLENBQUE7O0FBQUEsRUF3QkEsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNTLElBQUEsc0JBQUMsT0FBRCxHQUFBO0FBQ1gsVUFBQSxrRUFBQTs7UUFEWSxVQUFRO09BQ3BCO0FBQUEsbURBQUEsQ0FBQTtBQUFBLE1BQUMsb0JBQUEsU0FBRCxFQUFZLHlCQUFBLGNBQVosRUFBNEIsSUFBQyxDQUFBLDRCQUFBLGlCQUE3QixFQUFnRCxJQUFDLENBQUEsd0JBQUEsYUFBakQsRUFBZ0UsSUFBQyxDQUFBLG9CQUFBLFNBQWpFLEVBQTRFLElBQUMsQ0FBQSxpQkFBQSxNQUE3RSxFQUFxRixJQUFDLENBQUEsb0JBQUEsU0FBdEYsRUFBaUcsSUFBQyxDQUFBLGVBQUEsSUFBbEcsRUFBd0csSUFBQyxDQUFBLHNCQUFBLFdBQXpHLEVBQXNILElBQUMsQ0FBQSwyQkFBQSxnQkFBdkgsRUFBeUksaUJBQUEsTUFBekksRUFBaUosSUFBQyxDQUFBLG1CQUFBLFFBQWxKLENBQUE7O1FBRUEsWUFBYTtPQUZiOztRQUdBLGlCQUFrQjtPQUhsQjs7UUFJQSxJQUFDLENBQUEsWUFBYTtPQUpkO0FBS0EsTUFBQSxJQUE2Qyw4QkFBN0M7O1VBQUEsSUFBQyxDQUFBLGdCQUFpQixJQUFDLENBQUEsaUJBQWlCLENBQUM7U0FBckM7T0FMQTtBQU9BLE1BQUEsSUFBRyxJQUFDLENBQUEsTUFBSjtBQUNFLFFBQUEsSUFBQyxDQUFBLFNBQUQsR0FBYSxTQUFiLENBQUE7QUFBQSxRQUNBLElBQUMsQ0FBQSxjQUFELEdBQWtCLGNBRGxCLENBREY7T0FBQSxNQUFBO0FBSUUsUUFBQSxJQUFDLENBQUEsU0FBRCxHQUFhLFNBQVMsQ0FBQyxLQUFWLENBQUEsQ0FBaUIsQ0FBQyxJQUFsQixDQUF1QixJQUFDLENBQUEsU0FBeEIsQ0FBYixDQUFBO0FBQUEsUUFDQSxJQUFDLENBQUEsY0FBRCxHQUFrQixjQUFjLENBQUMsS0FBZixDQUFBLENBQXNCLENBQUMsSUFBdkIsQ0FBNEIsSUFBQyxDQUFBLFNBQTdCLENBRGxCLENBSkY7T0FQQTtBQWNBLE1BQUEsSUFBTyxpQkFBUDtBQUNFLFFBQUEsSUFBQyxDQUFBLElBQUQsR0FBUSxFQUFSLENBQUE7QUFBQSxRQUNBLElBQUMsQ0FBQSxTQUFELEdBQWEsRUFEYixDQUFBO0FBQUEsUUFFQSxJQUFDLENBQUEsV0FBRCxHQUFlLEVBRmYsQ0FBQTtBQUFBLFFBR0EsSUFBQyxDQUFBLGdCQUFELEdBQW9CLEVBSHBCLENBQUE7QUFLQTtBQUFBLGFBQUEsNENBQUE7d0JBQUE7QUFDRSxVQUFBLElBQUMsQ0FBQSxJQUFLLENBQUEsQ0FBQyxDQUFDLElBQUYsQ0FBTixHQUFnQixDQUFoQixDQUFBO0FBQ0EsVUFBQSxJQUE0QixDQUFDLENBQUMsSUFBSSxDQUFDLEtBQVAsQ0FBYSxjQUFiLENBQTVCO0FBQUEsWUFBQSxJQUFDLENBQUEsV0FBWSxDQUFBLENBQUMsQ0FBQyxJQUFGLENBQWIsR0FBdUIsQ0FBdkIsQ0FBQTtXQUZGO0FBQUEsU0FMQTtBQVNBO0FBQUEsYUFBQSw4Q0FBQTt3QkFBQTtBQUNFLFVBQUEsSUFBQyxDQUFBLFNBQVUsQ0FBQSxDQUFDLENBQUMsSUFBRixDQUFYLEdBQXFCLENBQXJCLENBQUE7QUFDQSxVQUFBLElBQWlDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBUCxDQUFhLGNBQWIsQ0FBakM7QUFBQSxZQUFBLElBQUMsQ0FBQSxnQkFBaUIsQ0FBQSxDQUFDLENBQUMsSUFBRixDQUFsQixHQUE0QixDQUE1QixDQUFBO1dBRkY7QUFBQSxTQVZGO09BZEE7QUE0QkEsTUFBQSxJQUFPLDJEQUFKLElBQXVELElBQUMsQ0FBQSxjQUFjLENBQUMsTUFBaEIsR0FBeUIsQ0FBbkY7QUFDRSxRQUFBLElBQUEsR0FBTyxlQUFlLENBQUMsZ0NBQWhCLENBQWlELElBQUMsQ0FBQSxjQUFsRCxDQUFQLENBQUE7QUFBQSxRQUNBLElBQUMsQ0FBQSxRQUFRLENBQUMsYUFBVixDQUF3QixJQUF4QixDQURBLENBREY7T0E1QkE7QUFnQ0EsTUFBQSxJQUFPLG1CQUFQO0FBQ0UsUUFBQSxXQUFBLEdBQWMsT0FBQSxDQUFRLGdCQUFSLENBQWQsQ0FBQTtBQUFBLFFBQ0EsSUFBQyxDQUFBLE1BQUQsR0FBYyxJQUFBLFdBQUEsQ0FBWSxJQUFDLENBQUEsUUFBYixFQUF1QixJQUF2QixDQURkLENBREY7T0FoQ0E7QUFBQSxNQW9DQSxJQUFDLENBQUEsYUFBRCxHQUFpQixFQXBDakIsQ0FBQTtBQUFBLE1BcUNBLElBQUMsQ0FBQSxpQkFBRCxHQUFxQixFQXJDckIsQ0FEVztJQUFBLENBQWI7O0FBQUEsMkJBd0NBLFNBQUEsR0FBVyxTQUFDLENBQUQsRUFBRyxDQUFILEdBQUE7QUFDVCxVQUFBLDJCQUFBO0FBQUEsTUFBQSxJQUFHLDBCQUFIO0FBQ0UsUUFBQSxJQUFZLENBQUMsQ0FBQyxJQUFGLEtBQVUsQ0FBQyxDQUFDLElBQXhCO0FBQUEsaUJBQU8sQ0FBUCxDQUFBO1NBQUE7QUFDQSxRQUFBLElBQVksQ0FBQyxDQUFDLElBQUYsS0FBVSxJQUFDLENBQUEsYUFBdkI7QUFBQSxpQkFBTyxDQUFQLENBQUE7U0FEQTtBQUVBLFFBQUEsSUFBYSxDQUFDLENBQUMsSUFBRixLQUFVLElBQUMsQ0FBQSxhQUF4QjtBQUFBLGlCQUFPLENBQUEsQ0FBUCxDQUFBO1NBRkE7QUFBQSxRQUlBLGFBQUEsR0FBZ0IsSUFBQyxDQUFBLGVBQUQsQ0FBaUIsSUFBQyxDQUFBLGFBQWxCLENBSmhCLENBQUE7QUFBQSxRQUtBLEtBQUEsR0FBUSxJQUFDLENBQUEsZUFBRCxDQUFpQixDQUFDLENBQUMsSUFBbkIsQ0FMUixDQUFBO0FBQUEsUUFNQSxLQUFBLEdBQVEsSUFBQyxDQUFBLGVBQUQsQ0FBaUIsQ0FBQyxDQUFDLElBQW5CLENBTlIsQ0FBQTtBQVFBLFFBQUEsSUFBWSxLQUFBLEtBQVMsS0FBckI7QUFBQSxpQkFBTyxDQUFQLENBQUE7U0FSQTtBQVNBLFFBQUEsSUFBWSxLQUFBLEtBQVMsYUFBckI7QUFBQSxpQkFBTyxDQUFQLENBQUE7U0FUQTtBQVVBLFFBQUEsSUFBYSxLQUFBLEtBQVMsYUFBdEI7QUFBQSxpQkFBTyxDQUFBLENBQVAsQ0FBQTtTQVZBO2VBWUEsRUFiRjtPQUFBLE1BQUE7ZUFlRSxFQWZGO09BRFM7SUFBQSxDQXhDWCxDQUFBOztBQUFBLDJCQTBEQSxlQUFBLEdBQWlCLFNBQUMsSUFBRCxHQUFBO0FBQ2YsVUFBQSxxQkFBQTtBQUFBO0FBQUEsV0FBQSw0Q0FBQTt5QkFBQTtZQUF3QyxJQUFJLENBQUMsT0FBTCxDQUFhLEVBQUEsR0FBRyxJQUFILEdBQVEsR0FBckIsQ0FBQSxLQUE0QjtBQUFwRSxpQkFBTyxJQUFQO1NBQUE7QUFBQSxPQURlO0lBQUEsQ0ExRGpCLENBQUE7O0FBQUEsMkJBNkRBLEtBQUEsR0FBTyxTQUFBLEdBQUE7YUFDRCxJQUFBLFlBQUEsQ0FBYTtBQUFBLFFBQ2QsV0FBRCxJQUFDLENBQUEsU0FEYztBQUFBLFFBRWQsZ0JBQUQsSUFBQyxDQUFBLGNBRmM7QUFBQSxRQUdkLG1CQUFELElBQUMsQ0FBQSxpQkFIYztBQUFBLFFBSWQsUUFBRCxJQUFDLENBQUEsTUFKYztBQUFBLFFBS2QsTUFBRCxJQUFDLENBQUEsSUFMYztBQUFBLFFBTWQsV0FBRCxJQUFDLENBQUEsU0FOYztBQUFBLFFBT2QsYUFBRCxJQUFDLENBQUEsV0FQYztBQUFBLFFBUWQsa0JBQUQsSUFBQyxDQUFBLGdCQVJjO0FBQUEsUUFTZixNQUFBLEVBQVEsSUFUTztPQUFiLEVBREM7SUFBQSxDQTdEUCxDQUFBOztBQUFBLDJCQWtGQSxnQkFBQSxHQUFrQixTQUFDLFlBQUQsR0FBQTthQUFrQixlQUFnQixJQUFDLENBQUEsaUJBQUQsQ0FBQSxDQUFoQixFQUFBLFlBQUEsT0FBbEI7SUFBQSxDQWxGbEIsQ0FBQTs7QUFBQSwyQkFvRkEsaUJBQUEsR0FBbUIsU0FBQSxHQUFBO2FBQUcsSUFBQyxDQUFBLGNBQWMsQ0FBQyxNQUFoQixHQUF5QixFQUE1QjtJQUFBLENBcEZuQixDQUFBOztBQUFBLDJCQXNGQSxZQUFBLEdBQWMsU0FBQSxHQUFBO2FBQUcsSUFBQyxDQUFBLFVBQUo7SUFBQSxDQXRGZCxDQUFBOztBQUFBLDJCQXdGQSxpQkFBQSxHQUFtQixTQUFBLEdBQUE7YUFBRyxJQUFDLENBQUEsZUFBSjtJQUFBLENBeEZuQixDQUFBOztBQUFBLDJCQTBGQSxpQkFBQSxHQUFtQixTQUFBLEdBQUE7cUNBQUcsSUFBQyxDQUFBLFdBQUQsSUFBQyxDQUFBLFdBQVksTUFBTSxDQUFDLElBQVAsQ0FBWSxJQUFDLENBQUEsSUFBYixFQUFoQjtJQUFBLENBMUZuQixDQUFBOztBQUFBLDJCQTRGQSxpQkFBQSxHQUFtQixTQUFBLEdBQUE7cUNBQUcsSUFBQyxDQUFBLFdBQUQsSUFBQyxDQUFBLFdBQVksSUFBQyxDQUFBLGlCQUFELENBQUEsQ0FBb0IsQ0FBQyxPQUFyQztJQUFBLENBNUZuQixDQUFBOztBQUFBLDJCQThGQSxpQkFBQSxHQUFtQixTQUFBLEdBQUE7QUFDakIsVUFBQSxpQ0FBQTtBQUFBLE1BQUEsYUFBQSxHQUFnQixFQUFoQixDQUFBO0FBQ0E7QUFBQSxXQUFBLDRDQUFBO3NCQUFBO1lBQWtELGVBQVMsYUFBVCxFQUFBLENBQUE7QUFBbEQsVUFBQSxhQUFhLENBQUMsSUFBZCxDQUFtQixDQUFuQixDQUFBO1NBQUE7QUFBQSxPQURBO0FBQUEsTUFFQSxJQUFDLENBQUEsYUFBRCxHQUFpQixFQUZqQixDQUFBO0FBQUEsTUFHQSxJQUFDLENBQUEsaUJBQUQsR0FBcUIsRUFIckIsQ0FBQTthQUlBLGNBTGlCO0lBQUEsQ0E5Rm5CLENBQUE7O0FBQUEsMkJBNkdBLFFBQUEsR0FBVSxTQUFDLEtBQUQsR0FBQTtBQUNSLFVBQUEsc0RBQUE7QUFBQSxNQUFBLFFBQTZCLEVBQTdCLEVBQUMsb0JBQUQsRUFBWSx3QkFBWixDQUFBO0FBQUEsTUFDQSxjQUFBLEdBQWlCLENBQUMsS0FBRCxDQURqQixDQUFBO0FBR0EsYUFBTSxDQUFDLFNBQUEsNkNBQXdCLENBQUUsY0FBM0IsQ0FBQSxJQUFzQyxlQUFpQixjQUFqQixFQUFBLFNBQUEsS0FBNUMsR0FBQTtBQUNFLFFBQUEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxJQUFmLENBQW9CLEtBQXBCLENBQUEsQ0FBQTtBQUFBLFFBQ0EsS0FBQSxHQUFRLGFBQUEsR0FBZ0IsU0FEeEIsQ0FBQTtBQUFBLFFBRUEsY0FBYyxDQUFDLElBQWYsQ0FBb0IsU0FBcEIsQ0FGQSxDQURGO01BQUEsQ0FIQTtBQVFBLE1BQUEsSUFBRyxlQUFhLGNBQWIsRUFBQSxTQUFBLE1BQUg7ZUFBb0MsT0FBcEM7T0FBQSxNQUFBO2VBQW1ELGNBQW5EO09BVFE7SUFBQSxDQTdHVixDQUFBOztBQUFBLDJCQXdIQSxtQkFBQSxHQUFxQixTQUFDLEtBQUQsR0FBQTtBQUNuQixNQUFBLElBQUcsNkJBQUg7QUFDRSxRQUFBLElBQUMsQ0FBQSxhQUFhLENBQUMsSUFBZixDQUFvQixLQUFwQixDQUFBLENBQUE7ZUFDQSxJQUFDLENBQUEsU0FBVSxDQUFBLEtBQUEsQ0FBTSxDQUFDLE1BRnBCO09BQUEsTUFBQTtlQUlFLE1BSkY7T0FEbUI7SUFBQSxDQXhIckIsQ0FBQTs7QUFBQSwyQkErSEEsU0FBQSxHQUFXLFNBQUMsS0FBRCxFQUFRLGdCQUFSLEdBQUE7QUFDVCxVQUFBLCtCQUFBOztRQURpQixtQkFBaUI7T0FDbEM7QUFBQSxNQUFBLElBQVUsZUFBUyxJQUFDLENBQUEsYUFBVixFQUFBLEtBQUEsTUFBQSxJQUE0QixDQUFBLENBQUssZUFBUyxJQUFDLENBQUEsaUJBQVYsRUFBQSxLQUFBLE1BQUQsQ0FBMUM7QUFBQSxjQUFBLENBQUE7T0FBQTtBQUFBLE1BRUEsU0FBQSxHQUFZLElBQUMsQ0FBQSxtQkFBRCxDQUFxQixLQUFyQixDQUZaLENBQUE7QUFJQSxNQUFBLElBQWMsbUJBQUosSUFBa0IsZUFBYSxJQUFDLENBQUEsYUFBZCxFQUFBLFNBQUEsTUFBNUI7QUFBQSxjQUFBLENBQUE7T0FKQTtBQUFBLE1BTUEsS0FBQSxHQUFXLDZCQUFILEdBQ04saUJBQUEsQ0FBa0IsSUFBQyxDQUFBLFNBQVUsQ0FBQSxLQUFBLENBQU0sQ0FBQyxJQUFwQyxDQURNLEdBR04sR0FURixDQUFBO0FBQUEsTUFXQSxJQUFDLENBQUEsYUFBRCxHQUFpQixJQUFDLENBQUEsYUFBYSxDQUFDLE1BQWYsQ0FBc0IsU0FBQyxDQUFELEdBQUE7ZUFBTyxDQUFBLEtBQU8sVUFBZDtNQUFBLENBQXRCLENBWGpCLENBQUE7QUFBQSxNQVlBLE1BQUEsR0FBUyxJQUFDLENBQUEsTUFBTSxDQUFDLEtBQVIsQ0FBYyxTQUFkLEVBQXlCLEtBQXpCLEVBQWdDLEtBQWhDLENBWlQsQ0FBQTtBQWNBLE1BQUEsSUFBRyxjQUFIO0FBQ0UsUUFBQSxJQUFHLE1BQU0sQ0FBQyxPQUFQLElBQW1CLDBDQUF0QjtBQUNFLFVBQUEsTUFBQSxHQUFTLElBQUMsQ0FBQSxTQUFELENBQVcsSUFBQyxDQUFBLGdCQUFpQixDQUFBLFNBQUEsQ0FBVSxDQUFDLEtBQXhDLENBQVQsQ0FBQTtBQUFBLFVBQ0EsS0FBQSxHQUFRLFNBRFIsQ0FERjtTQURGO09BQUEsTUFLSyxJQUFHLG9DQUFIO0FBQ0gsUUFBQSxJQUFDLENBQUEsYUFBYSxDQUFDLElBQWYsQ0FBb0IsS0FBcEIsQ0FBQSxDQUFBO0FBQUEsUUFDQSxNQUFBLEdBQVMsSUFBQyxDQUFBLFNBQUQsQ0FBVyxJQUFDLENBQUEsZ0JBQWlCLENBQUEsS0FBQSxDQUFNLENBQUMsS0FBcEMsQ0FEVCxDQURHO09BQUEsTUFBQTtBQUtILFFBQUEsSUFBOEIsd0JBQTlCO0FBQUEsVUFBQSxJQUFDLENBQUEsYUFBYSxDQUFDLElBQWYsQ0FBb0IsS0FBcEIsQ0FBQSxDQUFBO1NBTEc7T0FuQkw7QUEwQkEsTUFBQSxJQUFHLGNBQUg7QUFDRSxRQUFBLElBQUMsQ0FBQSxpQkFBaUIsQ0FBQyxJQUFuQixDQUF3QixLQUF4QixDQUFBLENBQUE7QUFDQSxRQUFBLElBQUcsZ0JBQUEsSUFBb0IsZUFBYSxJQUFDLENBQUEsYUFBZCxFQUFBLEtBQUEsS0FBdkI7QUFDRSxVQUFBLE1BQU0sQ0FBQyxTQUFQLEdBQW1CLDhDQUFvQixFQUFwQixDQUF1QixDQUFDLE1BQXhCLENBQStCLElBQUMsQ0FBQSxpQkFBRCxDQUFBLENBQS9CLENBQW5CLENBREY7U0FGRjtPQTFCQTtBQStCQSxhQUFPLE1BQVAsQ0FoQ1M7SUFBQSxDQS9IWCxDQUFBOztBQUFBLDJCQWlLQSxTQUFBLEdBQVcsU0FBQyxLQUFELEdBQUE7QUFDVCxVQUFBLEdBQUE7QUFBQSxNQUFBLEdBQUEsR0FBTSxVQUFBLENBQVcsS0FBWCxDQUFOLENBQUE7QUFFQSxNQUFBLElBQUcsS0FBQSxDQUFNLEdBQU4sQ0FBQSxJQUFlLDBCQUFsQjtBQUNFLFFBQUEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxJQUFmLENBQW9CLEtBQXBCLENBQUEsQ0FBQTtBQUFBLFFBQ0EsR0FBQSxHQUFNLElBQUMsQ0FBQSxTQUFELENBQVcsSUFBQyxDQUFBLElBQUssQ0FBQSxLQUFBLENBQU0sQ0FBQyxLQUF4QixDQUROLENBREY7T0FGQTtBQU1BLE1BQUEsSUFBRyxLQUFBLENBQU0sR0FBTixDQUFBLElBQWUsaUNBQWxCO0FBQ0UsUUFBQSxJQUFDLENBQUEsYUFBYSxDQUFDLElBQWYsQ0FBb0IsS0FBcEIsQ0FBQSxDQUFBO0FBQUEsUUFDQSxHQUFBLEdBQU0sSUFBQyxDQUFBLFNBQUQsQ0FBVyxJQUFDLENBQUEsV0FBWSxDQUFBLEtBQUEsQ0FBTSxDQUFDLEtBQS9CLENBRE4sQ0FERjtPQU5BO2FBVUEsSUFYUztJQUFBLENBaktYLENBQUE7O0FBQUEsMkJBOEtBLE9BQUEsR0FBUyxTQUFDLEtBQUQsRUFBUSxJQUFSLEdBQUE7QUFDUCxVQUFBLEdBQUE7O1FBRGUsT0FBSztPQUNwQjtBQUFBLE1BQUEsR0FBQSxHQUFNLFFBQUEsQ0FBUyxLQUFULEVBQWdCLElBQWhCLENBQU4sQ0FBQTtBQUVBLE1BQUEsSUFBRyxLQUFBLENBQU0sR0FBTixDQUFBLElBQWUsMEJBQWxCO0FBQ0UsUUFBQSxJQUFDLENBQUEsYUFBYSxDQUFDLElBQWYsQ0FBb0IsS0FBcEIsQ0FBQSxDQUFBO0FBQUEsUUFDQSxHQUFBLEdBQU0sSUFBQyxDQUFBLE9BQUQsQ0FBUyxJQUFDLENBQUEsSUFBSyxDQUFBLEtBQUEsQ0FBTSxDQUFDLEtBQXRCLENBRE4sQ0FERjtPQUZBO0FBTUEsTUFBQSxJQUFHLEtBQUEsQ0FBTSxHQUFOLENBQUEsSUFBZSxpQ0FBbEI7QUFDRSxRQUFBLElBQUMsQ0FBQSxhQUFhLENBQUMsSUFBZixDQUFvQixLQUFwQixDQUFBLENBQUE7QUFBQSxRQUNBLEdBQUEsR0FBTSxJQUFDLENBQUEsT0FBRCxDQUFTLElBQUMsQ0FBQSxXQUFZLENBQUEsS0FBQSxDQUFNLENBQUMsS0FBN0IsQ0FETixDQURGO09BTkE7YUFVQSxJQVhPO0lBQUEsQ0E5S1QsQ0FBQTs7QUFBQSwyQkEyTEEsV0FBQSxHQUFhLFNBQUMsS0FBRCxHQUFBO0FBQ1gsTUFBQSxJQUFHLENBQUEsS0FBUyxDQUFDLElBQU4sQ0FBVyxLQUFYLENBQUosSUFBMEIsMEJBQTdCO0FBQ0UsUUFBQSxJQUFDLENBQUEsYUFBYSxDQUFDLElBQWYsQ0FBb0IsS0FBcEIsQ0FBQSxDQUFBO0FBQUEsUUFDQSxLQUFBLEdBQVEsSUFBQyxDQUFBLFdBQUQsQ0FBYSxJQUFDLENBQUEsSUFBSyxDQUFBLEtBQUEsQ0FBTSxDQUFDLEtBQTFCLENBRFIsQ0FERjtPQUFBO0FBSUEsTUFBQSxJQUFHLENBQUEsS0FBUyxDQUFDLElBQU4sQ0FBVyxLQUFYLENBQUosSUFBMEIsaUNBQTdCO0FBQ0UsUUFBQSxJQUFDLENBQUEsYUFBYSxDQUFDLElBQWYsQ0FBb0IsS0FBcEIsQ0FBQSxDQUFBO0FBQUEsUUFDQSxLQUFBLEdBQVEsSUFBQyxDQUFBLFdBQUQsQ0FBYSxJQUFDLENBQUEsV0FBWSxDQUFBLEtBQUEsQ0FBTSxDQUFDLEtBQWpDLENBRFIsQ0FERjtPQUpBO2FBUUEsSUFBSSxDQUFDLEtBQUwsQ0FBVyxVQUFBLENBQVcsS0FBWCxDQUFBLEdBQW9CLElBQS9CLEVBVFc7SUFBQSxDQTNMYixDQUFBOztBQUFBLDJCQXNNQSxnQkFBQSxHQUFrQixTQUFDLEtBQUQsR0FBQTtBQUNoQixVQUFBLEdBQUE7QUFBQSxNQUFBLElBQUcsQ0FBQSxLQUFTLENBQUMsSUFBTixDQUFXLEtBQVgsQ0FBSixJQUEwQiwwQkFBN0I7QUFDRSxRQUFBLElBQUMsQ0FBQSxhQUFhLENBQUMsSUFBZixDQUFvQixLQUFwQixDQUFBLENBQUE7QUFBQSxRQUNBLEtBQUEsR0FBUSxJQUFDLENBQUEsZ0JBQUQsQ0FBa0IsSUFBQyxDQUFBLElBQUssQ0FBQSxLQUFBLENBQU0sQ0FBQyxLQUEvQixDQURSLENBREY7T0FBQTtBQUlBLE1BQUEsSUFBRyxDQUFBLEtBQVMsQ0FBQyxJQUFOLENBQVcsS0FBWCxDQUFKLElBQTBCLGlDQUE3QjtBQUNFLFFBQUEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxJQUFmLENBQW9CLEtBQXBCLENBQUEsQ0FBQTtBQUFBLFFBQ0EsS0FBQSxHQUFRLElBQUMsQ0FBQSxnQkFBRCxDQUFrQixJQUFDLENBQUEsV0FBWSxDQUFBLEtBQUEsQ0FBTSxDQUFDLEtBQXRDLENBRFIsQ0FERjtPQUpBO0FBUUEsTUFBQSxJQUFrQixhQUFsQjtBQUFBLGVBQU8sR0FBUCxDQUFBO09BUkE7QUFTQSxNQUFBLElBQWdCLE1BQUEsQ0FBQSxLQUFBLEtBQWdCLFFBQWhDO0FBQUEsZUFBTyxLQUFQLENBQUE7T0FUQTtBQVdBLE1BQUEsSUFBRyxLQUFLLENBQUMsT0FBTixDQUFjLEdBQWQsQ0FBQSxLQUF3QixDQUFBLENBQTNCO0FBQ0UsUUFBQSxHQUFBLEdBQU0sSUFBSSxDQUFDLEtBQUwsQ0FBVyxVQUFBLENBQVcsS0FBWCxDQUFBLEdBQW9CLElBQS9CLENBQU4sQ0FERjtPQUFBLE1BQUE7QUFHRSxRQUFBLEdBQUEsR0FBTSxRQUFBLENBQVMsS0FBVCxDQUFOLENBSEY7T0FYQTthQWdCQSxJQWpCZ0I7SUFBQSxDQXRNbEIsQ0FBQTs7QUFBQSwyQkF5TkEsa0JBQUEsR0FBb0IsU0FBQyxLQUFELEdBQUE7QUFDbEIsVUFBQSxHQUFBO0FBQUEsTUFBQSxJQUFHLENBQUEsS0FBUyxDQUFDLElBQU4sQ0FBVyxLQUFYLENBQUosSUFBMEIsMEJBQTdCO0FBQ0UsUUFBQSxJQUFDLENBQUEsYUFBYSxDQUFDLElBQWYsQ0FBb0IsS0FBcEIsQ0FBQSxDQUFBO0FBQUEsUUFDQSxLQUFBLEdBQVEsSUFBQyxDQUFBLGtCQUFELENBQW9CLElBQUMsQ0FBQSxJQUFLLENBQUEsS0FBQSxDQUFNLENBQUMsS0FBakMsQ0FEUixDQURGO09BQUE7QUFJQSxNQUFBLElBQUcsQ0FBQSxLQUFTLENBQUMsSUFBTixDQUFXLEtBQVgsQ0FBSixJQUEwQixpQ0FBN0I7QUFDRSxRQUFBLElBQUMsQ0FBQSxhQUFhLENBQUMsSUFBZixDQUFvQixLQUFwQixDQUFBLENBQUE7QUFBQSxRQUNBLEtBQUEsR0FBUSxJQUFDLENBQUEsa0JBQUQsQ0FBb0IsSUFBQyxDQUFBLFdBQVksQ0FBQSxLQUFBLENBQU0sQ0FBQyxLQUF4QyxDQURSLENBREY7T0FKQTtBQVFBLE1BQUEsSUFBa0IsYUFBbEI7QUFBQSxlQUFPLEdBQVAsQ0FBQTtPQVJBO0FBU0EsTUFBQSxJQUFnQixNQUFBLENBQUEsS0FBQSxLQUFnQixRQUFoQztBQUFBLGVBQU8sS0FBUCxDQUFBO09BVEE7QUFXQSxNQUFBLElBQUcsS0FBSyxDQUFDLE9BQU4sQ0FBYyxHQUFkLENBQUEsS0FBd0IsQ0FBQSxDQUEzQjtBQUNFLFFBQUEsR0FBQSxHQUFNLFVBQUEsQ0FBVyxLQUFYLENBQUEsR0FBb0IsR0FBMUIsQ0FERjtPQUFBLE1BQUE7QUFHRSxRQUFBLEdBQUEsR0FBTSxVQUFBLENBQVcsS0FBWCxDQUFOLENBQUE7QUFDQSxRQUFBLElBQW1CLEdBQUEsR0FBTSxDQUF6QjtBQUFBLFVBQUEsR0FBQSxHQUFNLEdBQUEsR0FBTSxHQUFaLENBQUE7U0FEQTtBQUFBLFFBRUEsR0FGQSxDQUhGO09BWEE7YUFrQkEsSUFuQmtCO0lBQUEsQ0F6TnBCLENBQUE7O0FBQUEsMkJBc1BBLFNBQUEsR0FBVyxTQXRQWCxDQUFBOztBQUFBLDJCQXdQQSxLQUFBLEdBQU8sS0F4UFAsQ0FBQTs7QUFBQSwyQkEwUEEsVUFBQSxHQUFZLFVBMVBaLENBQUE7O0FBQUEsMkJBNFBBLEtBQUEsR0FBTyxTQUFDLEtBQUQsR0FBQTthQUFXLEtBQUEsQ0FBTSxLQUFOLEVBQVg7SUFBQSxDQTVQUCxDQUFBOztBQUFBLDJCQThQQSxLQUFBLEdBQU8sU0FBQyxLQUFELEdBQUE7YUFBVyxLQUFBLENBQU0sS0FBTixFQUFYO0lBQUEsQ0E5UFAsQ0FBQTs7QUFBQSwyQkFnUUEsUUFBQSxHQUFVLFNBQUMsS0FBRCxHQUFBO2FBQVcsUUFBQSxDQUFTLEtBQVQsRUFBWDtJQUFBLENBaFFWLENBQUE7O0FBQUEsMkJBa1FBLFNBQUEsR0FBVyxTQUFDLEtBQUQsR0FBQTthQUFXLENBQUEsS0FBUyxDQUFDLE9BQU4sQ0FBYyxLQUFkLEVBQWY7SUFBQSxDQWxRWCxDQUFBOztBQUFBLDJCQW9RQSxTQUFBLEdBQVcsU0FBQyxLQUFELEVBQVEsS0FBUixHQUFBO0FBQ1QsVUFBQSx5QkFBQTtBQUFBLE1BQUEsRUFBQSxHQUFLLE1BQUEsQ0FBRyxvQkFBQSxHQUFpQixJQUFDLENBQUEsS0FBbEIsR0FBd0IsSUFBeEIsR0FBNEIsSUFBQyxDQUFBLFdBQTdCLEdBQXlDLEdBQTVDLENBQUwsQ0FBQTtBQUNBLE1BQUEsSUFBRyxFQUFFLENBQUMsSUFBSCxDQUFRLEtBQVIsQ0FBSDtBQUNFLFFBQUEsUUFBbUIsRUFBRSxDQUFDLElBQUgsQ0FBUSxLQUFSLENBQW5CLEVBQUMsWUFBRCxFQUFJLGVBQUosRUFBVSxnQkFBVixDQUFBO2VBRUEsS0FBQSxDQUFNLElBQU4sRUFBWSxLQUFaLEVBSEY7T0FGUztJQUFBLENBcFFYLENBQUE7O0FBQUEsMkJBMlFBLFFBQUEsR0FBVSxTQUFDLElBQUQsRUFBTyxJQUFQLEVBQWdDLEtBQWhDLEVBQTBELFNBQTFELEdBQUE7QUFDUixVQUFBLEtBQUE7O1FBRGUsT0FBUyxJQUFBLEtBQUEsQ0FBTSxPQUFOO09BQ3hCOztRQUR3QyxRQUFVLElBQUEsS0FBQSxDQUFNLE9BQU47T0FDbEQ7O1FBRGtFLFlBQVU7T0FDNUU7QUFBQSxNQUFBLElBQWlDLElBQUksQ0FBQyxJQUFMLEdBQVksS0FBSyxDQUFDLElBQW5EO0FBQUEsUUFBQSxRQUFnQixDQUFDLElBQUQsRUFBTyxLQUFQLENBQWhCLEVBQUMsZ0JBQUQsRUFBUSxlQUFSLENBQUE7T0FBQTtBQUVBLE1BQUEsSUFBRyxJQUFJLENBQUMsSUFBTCxHQUFZLFNBQWY7ZUFDRSxLQURGO09BQUEsTUFBQTtlQUdFLE1BSEY7T0FIUTtJQUFBLENBM1FWLENBQUE7O0FBQUEsMkJBbVJBLFNBQUEsR0FBVyxTQUFDLE1BQUQsRUFBUyxNQUFULEVBQWlCLE1BQWpCLEVBQTZCLEtBQTdCLEdBQUE7QUFDVCxVQUFBLGNBQUE7O1FBRDBCLFNBQU87T0FDakM7O1FBRHNDLFFBQU0sSUFBSSxDQUFDO09BQ2pEO0FBQUEsTUFBQSxJQUFBLENBQUEsQ0FBNEMsZ0JBQUEsSUFBWSxnQkFBWixJQUF3QixDQUFBLEtBQUksQ0FBTSxNQUFOLENBQXhFLENBQUE7QUFBQSxlQUFXLElBQUEsS0FBQSxDQUFNLEdBQU4sRUFBVyxHQUFYLEVBQWdCLEdBQWhCLEVBQXFCLEdBQXJCLENBQVgsQ0FBQTtPQUFBO0FBQUEsTUFFQSxPQUFBLEdBQVUsQ0FBQSxHQUFJLE1BRmQsQ0FBQTtBQUFBLE1BR0EsS0FBQSxHQUFRLEdBQUEsQ0FBQSxLQUhSLENBQUE7QUFBQSxNQUtBLEtBQUssQ0FBQyxJQUFOLEdBQWEsQ0FDWCxLQUFBLENBQU0sTUFBTSxDQUFDLEdBQVAsR0FBYSxNQUFiLEdBQXNCLE1BQU0sQ0FBQyxHQUFQLEdBQWEsT0FBekMsQ0FEVyxFQUVYLEtBQUEsQ0FBTSxNQUFNLENBQUMsS0FBUCxHQUFlLE1BQWYsR0FBd0IsTUFBTSxDQUFDLEtBQVAsR0FBZSxPQUE3QyxDQUZXLEVBR1gsS0FBQSxDQUFNLE1BQU0sQ0FBQyxJQUFQLEdBQWMsTUFBZCxHQUF1QixNQUFNLENBQUMsSUFBUCxHQUFjLE9BQTNDLENBSFcsRUFJWCxNQUFNLENBQUMsS0FBUCxHQUFlLE1BQWYsR0FBd0IsTUFBTSxDQUFDLEtBQVAsR0FBZSxPQUo1QixDQUxiLENBQUE7YUFZQSxNQWJTO0lBQUEsQ0FuUlgsQ0FBQTs7QUFBQSwyQkEwU0EsR0FBQSxHQUFLLEdBMVNMLENBQUE7O0FBQUEsMkJBNFNBLEtBQUEsR0FBTyxLQTVTUCxDQUFBOztBQUFBLDJCQThTQSxPQUFBLEdBQVMsT0E5U1QsQ0FBQTs7QUFBQSwyQkFnVEEsZUFBQSxHQUFpQixlQWhUakIsQ0FBQTs7QUFBQSwyQkFrVEEsWUFBQSxHQUFjLFlBbFRkLENBQUE7O0FBQUEsMkJBb1RBLGNBQUEsR0FBZ0IsY0FwVGhCLENBQUE7O0FBQUEsMkJBc1RBLEtBQUEsR0FBTyxLQXRUUCxDQUFBOztBQUFBLDJCQXdUQSxRQUFBLEdBQVUsUUF4VFYsQ0FBQTs7QUFBQSwyQkEwVEEsV0FBQSxHQUFhLFdBMVRiLENBQUE7O0FBQUEsMkJBNFRBLEVBQUEsR0FBSSxFQTVUSixDQUFBOztBQUFBLDJCQThUQSxFQUFBLEdBQUksRUE5VEosQ0FBQTs7QUFBQSwyQkFnVUEsV0FBQSxHQUFhLFNBaFViLENBQUE7O0FBQUEsMkJBa1VBLFlBQUEsR0FBYyxZQWxVZCxDQUFBOzt3QkFBQTs7TUExQkYsQ0FBQTtBQUFBIgp9

//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/pigments/lib/color-context.coffee
