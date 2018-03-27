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
          console.log(v.name, v.value, v["default"]);
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
        console.log(this.vars);
        console.log(this.defaultVars);
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
