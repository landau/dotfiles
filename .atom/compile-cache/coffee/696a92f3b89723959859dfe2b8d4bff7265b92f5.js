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
      variables = options.variables, colorVariables = options.colorVariables, this.referenceVariable = options.referenceVariable, this.referencePath = options.referencePath, this.rootPaths = options.rootPaths, this.parser = options.parser, this.colorVars = options.colorVars, this.vars = options.vars, this.defaultVars = options.defaultVars, this.defaultColorVars = options.defaultColorVars, sorted = options.sorted, this.registry = options.registry, this.sassScopeSuffix = options.sassScopeSuffix;
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
      scope = this.colorVars[value] != null ? this.scopeFromFileName(this.colorVars[value].path) : '*';
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

    ColorContext.prototype.scopeFromFileName = function(path) {
      var scope;
      scope = scopeFromFileName(path);
      if (scope === 'sass' || scope === 'scss') {
        scope = [scope, this.sassScopeSuffix].join(':');
      }
      return scope;
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvcGlnbWVudHMvbGliL2NvbG9yLWNvbnRleHQuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQ0E7QUFBQSxNQUFBLDhRQUFBO0lBQUE7eUpBQUE7O0FBQUEsRUFBQSxLQUFBLEdBQVEsT0FBQSxDQUFRLFNBQVIsQ0FBUixDQUFBOztBQUFBLEVBQ0EsV0FBQSxHQUFjLElBRGQsQ0FBQTs7QUFBQSxFQUVBLGVBQUEsR0FBa0IsT0FBQSxDQUFRLG9CQUFSLENBRmxCLENBQUE7O0FBQUEsRUFHQSxTQUFBLEdBQVksT0FBQSxDQUFRLGNBQVIsQ0FIWixDQUFBOztBQUFBLEVBSUEsU0FBQSxHQUFZLE9BQUEsQ0FBUSxhQUFSLENBSlosQ0FBQTs7QUFBQSxFQUtBLFVBQUEsR0FBYSxPQUFBLENBQVEsZUFBUixDQUxiLENBQUE7O0FBQUEsRUFNQSxpQkFBQSxHQUFvQixPQUFBLENBQVEsd0JBQVIsQ0FOcEIsQ0FBQTs7QUFBQSxFQU9BLE9BQTJCLE9BQUEsQ0FBUSxTQUFSLENBQTNCLEVBQUMsYUFBQSxLQUFELEVBQVEsYUFBQSxLQUFSLEVBQWUsZ0JBQUEsUUFQZixDQUFBOztBQUFBLEVBUUEsUUFjSSxPQUFBLENBQVEsV0FBUixDQWRKLEVBQ0UsWUFBQSxHQURGLEVBRUUsY0FBQSxLQUZGLEVBR0UsZ0JBQUEsT0FIRixFQUlFLHdCQUFBLGVBSkYsRUFLRSxxQkFBQSxZQUxGLEVBTUUsdUJBQUEsY0FORixFQU9FLGNBQUEsS0FQRixFQVFFLGlCQUFBLFFBUkYsRUFTRSxvQkFBQSxXQVRGLEVBVUUsV0FBQSxFQVZGLEVBV0UsV0FBQSxFQVhGLEVBWUUsa0JBQUEsU0FaRixFQWFFLHFCQUFBLFlBckJGLENBQUE7O0FBQUEsRUF3QkEsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNTLElB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

//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/pigments/lib/color-context.coffee
