(function() {
  var Color, ColorExpression, createVariableRegExpString;

  Color = require('./color');

  createVariableRegExpString = require('./regexes').createVariableRegExpString;

  module.exports = ColorExpression = (function() {
    ColorExpression.colorExpressionForContext = function(context) {
      return this.colorExpressionForColorVariables(context.getColorVariables());
    };

    ColorExpression.colorExpressionRegexpForColorVariables = function(colorVariables) {
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
          _ = match[0], name = match[1];
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
      color = new Color();
      color.colorExpression = expression;
      color.expressionHandler = this.name;
      this.handle.call(color, this.regexp.exec(expression), expression, context);
      return color;
    };

    ColorExpression.prototype.search = function(text, start) {
      var lastIndex, match, range, re, results, _ref;
      if (start == null) {
        start = 0;
      }
      results = void 0;
      re = new RegExp(this.regexpString, 'g');
      re.lastIndex = start;
      if (_ref = re.exec(text), match = _ref[0], _ref) {
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvcGlnbWVudHMvbGliL2NvbG9yLWV4cHJlc3Npb24uY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGtEQUFBOztBQUFBLEVBQUEsS0FBQSxHQUFRLE9BQUEsQ0FBUSxTQUFSLENBQVIsQ0FBQTs7QUFBQSxFQUNDLDZCQUE4QixPQUFBLENBQVEsV0FBUixFQUE5QiwwQkFERCxDQUFBOztBQUFBLEVBR0EsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNKLElBQUEsZUFBQyxDQUFBLHlCQUFELEdBQTRCLFNBQUMsT0FBRCxHQUFBO2FBQzFCLElBQUMsQ0FBQSxnQ0FBRCxDQUFrQyxPQUFPLENBQUMsaUJBQVIsQ0FBQSxDQUFsQyxFQUQwQjtJQUFBLENBQTVCLENBQUE7O0FBQUEsSUFHQSxlQUFDLENBQUEsc0NBQUQsR0FBeUMsU0FBQyxjQUFELEdBQUE7YUFDdkMsMEJBQUEsQ0FBMkIsY0FBM0IsRUFEdUM7SUFBQSxDQUh6QyxDQUFBOztBQUFBLElBTUEsZUFBQyxDQUFBLGdDQUFELEdBQW1DLFNBQUMsY0FBRCxHQUFBO0FBQ2pDLFVBQUEsbUJBQUE7QUFBQSxNQUFBLG1CQUFBLEdBQXNCLElBQUMsQ0FBQSxzQ0FBRCxDQUF3QyxjQUF4QyxDQUF0QixDQUFBO2FBRUksSUFBQSxlQUFBLENBQ0Y7QUFBQSxRQUFBLElBQUEsRUFBTSxvQkFBTjtBQUFBLFFBQ0EsWUFBQSxFQUFjLG1CQURkO0FBQUEsUUFFQSxNQUFBLEVBQVEsQ0FBQyxHQUFELENBRlI7QUFBQSxRQUdBLFFBQUEsRUFBVSxDQUhWO0FBQUEsUUFJQSxNQUFBLEVBQVEsU0FBQyxLQUFELEVBQVEsVUFBUixFQUFvQixPQUFwQixHQUFBO0FBQ04sY0FBQSw2QkFBQTtBQUFBLFVBQUMsWUFBRCxFQUFH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

//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/pigments/lib/color-expression.coffee
