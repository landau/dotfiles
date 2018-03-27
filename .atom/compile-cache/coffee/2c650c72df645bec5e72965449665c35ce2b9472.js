(function() {
  var BlendModes, Color, ColorContext, ColorExpression, ColorParser, SVGColors, clamp, clampInt, comma, float, floatOrPercent, hexadecimal, int, intOrPercent, namePrefixes, notQuote, optionalPercent, pe, percent, ps, scopeFromFileName, split, variables, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  _ref = [], Color = _ref[0], ColorParser = _ref[1], ColorExpression = _ref[2], SVGColors = _ref[3], BlendModes = _ref[4], int = _ref[5], float = _ref[6], percent = _ref[7], optionalPercent = _ref[8], intOrPercent = _ref[9], floatOrPercent = _ref[10], comma = _ref[11], notQuote = _ref[12], hexadecimal = _ref[13], ps = _ref[14], pe = _ref[15], variables = _ref[16], namePrefixes = _ref[17], split = _ref[18], clamp = _ref[19], clampInt = _ref[20], scopeFromFileName = _ref[21];

  module.exports = ColorContext = (function() {
    function ColorContext(options) {
      var colorVariables, expr, sorted, v, _i, _j, _len, _len1, _ref1, _ref2, _ref3;
      if (options == null) {
        options = {};
      }
      this.sortPaths = __bind(this.sortPaths, this);
      if (Color == null) {
        Color = require('./color');
        SVGColors = require('./svg-colors');
        BlendModes = require('./blend-modes');
        if (ColorExpression == null) {
          ColorExpression = require('./color-expression');
        }
        _ref1 = require('./regexes'), int = _ref1.int, float = _ref1.float, percent = _ref1.percent, optionalPercent = _ref1.optionalPercent, intOrPercent = _ref1.intOrPercent, floatOrPercent = _ref1.floatOrPercent, comma = _ref1.comma, notQuote = _ref1.notQuote, hexadecimal = _ref1.hexadecimal, ps = _ref1.ps, pe = _ref1.pe, variables = _ref1.variables, namePrefixes = _ref1.namePrefixes;
        ColorContext.prototype.SVGColors = SVGColors;
        ColorContext.prototype.Color = Color;
        ColorContext.prototype.BlendModes = BlendModes;
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
      }
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
          if (!v["default"]) {
            this.vars[v.name] = v;
          }
          if (v["default"]) {
            this.defaultVars[v.name] = v;
          }
        }
        _ref3 = this.colorVariables;
        for (_j = 0, _len1 = _ref3.length; _j < _len1; _j++) {
          v = _ref3[_j];
          if (!v["default"]) {
            this.colorVars[v.name] = v;
          }
          if (v["default"]) {
            this.defaultColorVars[v.name] = v;
          }
        }
      }
      if ((this.registry.getExpression('pigments:variables') == null) && this.colorVariables.length > 0) {
        expr = ColorExpression.colorExpressionForColorVariables(this.colorVariables);
        this.registry.addExpression(expr);
      }
      if (this.parser == null) {
        if (ColorParser == null) {
          ColorParser = require('./color-parser');
        }
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
      var root, _i, _len, _ref1;
      _ref1 = this.rootPaths;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        root = _ref1[_i];
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
      var usedVariables, v, _i, _len, _ref1;
      usedVariables = [];
      _ref1 = this.usedVariables;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        v = _ref1[_i];
        if (__indexOf.call(usedVariables, v) < 0) {
          usedVariables.push(v);
        }
      }
      this.usedVariables = [];
      this.resolvedVariables = [];
      return usedVariables;
    };

    ColorContext.prototype.getValue = function(value) {
      var lastRealValue, lookedUpValues, realValue, _ref1, _ref2;
      _ref1 = [], realValue = _ref1[0], lastRealValue = _ref1[1];
      lookedUpValues = [value];
      while ((realValue = (_ref2 = this.vars[value]) != null ? _ref2.value : void 0) && __indexOf.call(lookedUpValues, realValue) < 0) {
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
      } else if (this.defaultColorVars[value] != null) {
        this.usedVariables.push(value);
        return this.defaultColorVars[value].value;
      } else {
        return value;
      }
    };

    ColorContext.prototype.readColor = function(value, keepAllVariables) {
      var realValue, result, scope, _ref1;
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
          result.variables = ((_ref1 = result.variables) != null ? _ref1 : []).concat(this.readUsedVariables());
        }
      }
      return result;
    };

    ColorContext.prototype.scopeFromFileName = function(path) {
      var scope;
      if (scopeFromFileName == null) {
        scopeFromFileName = require('./scope-from-file-name');
      }
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

    ColorContext.prototype.split = function(value) {
      var _ref1;
      if (split == null) {
        _ref1 = require('./utils'), split = _ref1.split, clamp = _ref1.clamp, clampInt = _ref1.clampInt;
      }
      return split(value);
    };

    ColorContext.prototype.clamp = function(value) {
      var _ref1;
      if (clamp == null) {
        _ref1 = require('./utils'), split = _ref1.split, clamp = _ref1.clamp, clampInt = _ref1.clampInt;
      }
      return clamp(value);
    };

    ColorContext.prototype.clampInt = function(value) {
      var _ref1;
      if (clampInt == null) {
        _ref1 = require('./utils'), split = _ref1.split, clamp = _ref1.clamp, clampInt = _ref1.clampInt;
      }
      return clampInt(value);
    };

    ColorContext.prototype.isInvalid = function(color) {
      return !Color.isValid(color);
    };

    ColorContext.prototype.readParam = function(param, block) {
      var name, re, value, _, _ref1;
      re = RegExp("\\$(\\w+):\\s*((-?" + this.float + ")|" + this.variablesRE + ")");
      if (re.test(param)) {
        _ref1 = re.exec(param), _ = _ref1[0], name = _ref1[1], value = _ref1[2];
        return block(name, value);
      }
    };

    ColorContext.prototype.contrast = function(base, dark, light, threshold) {
      var _ref1;
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
        _ref1 = [dark, light], light = _ref1[0], dark = _ref1[1];
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

    return ColorContext;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvcGlnbWVudHMvbGliL2NvbG9yLWNvbnRleHQuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDRQQUFBO0lBQUE7eUpBQUE7O0FBQUEsRUFBQSxPQUtJLEVBTEosRUFDRSxlQURGLEVBQ1MscUJBRFQsRUFDc0IseUJBRHRCLEVBQ3VDLG1CQUR2QyxFQUNrRCxvQkFEbEQsRUFFRSxhQUZGLEVBRU8sZUFGUCxFQUVjLGlCQUZkLEVBRXVCLHlCQUZ2QixFQUV3QyxzQkFGeEMsRUFFc0QseUJBRnRELEVBRXNFLGdCQUZ0RSxFQUdFLG1CQUhGLEVBR1ksc0JBSFosRUFHeUIsYUFIekIsRUFHNkIsYUFIN0IsRUFHaUMsb0JBSGpDLEVBRzRDLHVCQUg1QyxFQUlFLGdCQUpGLEVBSVMsZ0JBSlQsRUFJZ0IsbUJBSmhCLEVBSTBCLDRCQUoxQixDQUFBOztBQUFBLEVBT0EsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNTLElBQUEsc0JBQUMsT0FBRCxHQUFBO0FBQ1gsVUFBQSx5RUFBQTs7UUFEWSxVQUFRO09BQ3BCO0FBQUEsbURBQUEsQ0FBQTtBQUFBLE1BQUEsSUFBTyxhQUFQO0FBQ0UsUUFBQSxLQUFBLEdBQVEsT0FBQSxDQUFRLFNBQVIsQ0FBUixDQUFBO0FBQUEsUUFDQSxTQUFBLEdBQVksT0FBQSxDQUFRLGNBQVIsQ0FEWixDQUFBO0FBQUEsUUFFQSxVQUFBLEdBQWEsT0FBQSxDQUFRLGVBQVIsQ0FGYixDQUFBOztVQUdBLGtCQUFtQixPQUFBLENBQVEsb0JBQVI7U0FIbkI7QUFBQSxRQUtBLFFBR0ksT0FBQSxDQUFRLFdBQVIsQ0FISixFQUNFLFlBQUEsR0FERixFQUNPLGNBQUEsS0FEUCxFQUNjLGdCQUFBLE9BRGQsRUFDdUIsd0JBQUEsZUFEdkIsRUFD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

//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/pigments/lib/color-context.coffee
