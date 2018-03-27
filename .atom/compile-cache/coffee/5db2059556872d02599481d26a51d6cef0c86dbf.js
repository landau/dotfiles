(function() {
  var Color, ColorExpression, createVariableRegExpString, _ref;

  _ref = [], createVariableRegExpString = _ref[0], Color = _ref[1];

  module.exports = ColorExpression = (function() {
    ColorExpression.colorExpressionForContext = function(context) {
      return this.colorExpressionForColorVariables(context.getColorVariables());
    };

    ColorExpression.colorExpressionRegexpForColorVariables = function(colorVariables) {
      if (createVariableRegExpString == null) {
        createVariableRegExpString = require('./regexes').createVariableRegExpString;
      }
      return createVariableRegExpString(colorVariables);
    };

    ColorExpression.colorExpressionForColorVariables = function(colorVariables) {
      var paletteRegexpString;
      paletteRegexpString = this.colorExpressionRegexpForColorVariables(colorVariables);
      return new ColorExpression({
        name: 'pigments:variables',
        regexpString: paletteRegexpString,
        scopes: ['*'],
        priority: 1,
        handle: function(match, expression, context) {
          var baseColor, evaluated, name, _;
          _ = match[0], _ = match[1], name = match[2];
          if (name == null) {
            name = match[0];
          }
          evaluated = context.readColorExpression(name);
          if (evaluated === name) {
            return this.invalid = true;
          }
          baseColor = context.readColor(evaluated);
          this.colorExpression = name;
          this.variables = baseColor != null ? baseColor.variables : void 0;
          if (context.isInvalid(baseColor)) {
            return this.invalid = true;
          }
          return this.rgba = baseColor.rgba;
        }
      });
    };

    function ColorExpression(_arg) {
      this.name = _arg.name, this.regexpString = _arg.regexpString, this.scopes = _arg.scopes, this.priority = _arg.priority, this.handle = _arg.handle;
      this.regexp = new RegExp("^" + this.regexpString + "$");
    }

    ColorExpression.prototype.match = function(expression) {
      return this.regexp.test(expression);
    };

    ColorExpression.prototype.parse = function(expression, context) {
      var color;
      if (!this.match(expression)) {
        return null;
      }
      if (Color == null) {
        Color = require('./color');
      }
      color = new Color();
      color.colorExpression = expression;
      color.expressionHandler = this.name;
      this.handle.call(color, this.regexp.exec(expression), expression, context);
      return color;
    };

    ColorExpression.prototype.search = function(text, start) {
      var lastIndex, match, range, re, results, _ref1;
      if (start == null) {
        start = 0;
      }
      results = void 0;
      re = new RegExp(this.regexpString, 'g');
      re.lastIndex = start;
      if (_ref1 = re.exec(text), match = _ref1[0], _ref1) {
        lastIndex = re.lastIndex;
        range = [lastIndex - match.length, lastIndex];
        results = {
          range: range,
          match: text.slice(range[0], range[1])
        };
      }
      return results;
    };

    return ColorExpression;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvcGlnbWVudHMvbGliL2NvbG9yLWV4cHJlc3Npb24uY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHdEQUFBOztBQUFBLEVBQUEsT0FBc0MsRUFBdEMsRUFBQyxvQ0FBRCxFQUE2QixlQUE3QixDQUFBOztBQUFBLEVBRUEsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNKLElBQUEsZUFBQyxDQUFBLHlCQUFELEdBQTRCLFNBQUMsT0FBRCxHQUFBO2FBQzFCLElBQUMsQ0FBQSxnQ0FBRCxDQUFrQyxPQUFPLENBQUMsaUJBQVIsQ0FBQSxDQUFsQyxFQUQwQjtJQUFBLENBQTVCLENBQUE7O0FBQUEsSUFHQSxlQUFDLENBQUEsc0NBQUQsR0FBeUMsU0FBQyxjQUFELEdBQUE7QUFDdkMsTUFBQSxJQUFPLGtDQUFQO0FBQ0UsUUFBQyw2QkFBOEIsT0FBQSxDQUFRLFdBQVIsRUFBOUIsMEJBQUQsQ0FERjtPQUFBO2FBR0EsMEJBQUEsQ0FBMkIsY0FBM0IsRUFKdUM7SUFBQSxDQUh6QyxDQUFBOztBQUFBLElBU0EsZUFBQyxDQUFBLGdDQUFELEdBQW1DLFNBQUMsY0FBRCxHQUFBO0FBQ2pDLFVBQUEsbUJBQUE7QUFBQSxNQUFBLG1CQUFBLEdBQXNCLElBQUMsQ0FBQSxzQ0FBRCxDQUF3QyxjQUF4QyxDQUF0QixDQUFBO2FBRUksSUFBQSxlQUFBLENBQ0Y7QUFBQSxRQUFBLElBQUEsRUFBTSxvQkFBTjtBQUFBLFFBQ0EsWUFBQSxFQUFjLG1CQURkO0FBQUEsUUFFQSxNQUFBLEVBQVEsQ0FBQyxHQUFELENBRlI7QUFBQSxRQUdBLFFBQUEsRUFBVSxDQUhWO0FBQUEsUUFJQSxNQUFBLEVBQVEsU0FBQyxLQUFELEVBQVEsVUFBUixFQUFvQixPQUFwQixHQUFBO0FBQ04s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

//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/pigments/lib/color-expression.coffee
