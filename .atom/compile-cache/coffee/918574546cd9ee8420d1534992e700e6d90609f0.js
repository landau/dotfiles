(function() {
  var ExpressionsRegistry, VariableExpression, registry, sass_handler;

  ExpressionsRegistry = require('./expressions-registry');

  VariableExpression = require('./variable-expression');

  module.exports = registry = new ExpressionsRegistry(VariableExpression);

  registry.createExpression('pigments:less', '^[ \\t]*(@[a-zA-Z0-9\\-_]+)\\s*:\\s*([^;\\n\\r]+);?', ['less']);

  registry.createExpression('pigments:scss_params', '^[ \\t]*@(mixin|include|function)\\s+[a-zA-Z0-9\\-_]+\\s*\\([^\\)]+\\)', ['scss', 'sass', 'haml'], function(match, solver) {
    match = match[0];
    return solver.endParsing(match.length - 1);
  });

  sass_handler = function(match, solver) {
    var all_hyphen, all_underscore;
    solver.appendResult(match[1], match[2], 0, match[0].length, {
      isDefault: match[3] != null
    });
    if (match[1].match(/[-_]/)) {
      all_underscore = match[1].replace(/-/g, '_');
      all_hyphen = match[1].replace(/_/g, '-');
      if (match[1] !== all_underscore) {
        solver.appendResult(all_underscore, match[2], 0, match[0].length, {
          isAlternate: true,
          isDefault: match[3] != null
        });
      }
      if (match[1] !== all_hyphen) {
        solver.appendResult(all_hyphen, match[2], 0, match[0].length, {
          isAlternate: true,
          isDefault: match[3] != null
        });
      }
    }
    return solver.endParsing(match[0].length);
  };

  registry.createExpression('pigments:scss', '^[ \\t]*(\\$[a-zA-Z0-9\\-_]+)\\s*:\\s*(.*?)(\\s*!default)?\\s*;', ['scss', 'haml'], sass_handler);

  registry.createExpression('pigments:sass', '^[ \\t]*(\\$[a-zA-Z0-9\\-_]+)\\s*:\\s*([^\\{]*?)(\\s*!default)?\\s*(?:$|\\/)', ['sass', 'haml'], sass_handler);

  registry.createExpression('pigments:css_vars', '(--[^\\s:]+):\\s*([^\\n;]+);', ['css'], function(match, solver) {
    solver.appendResult("var(" + match[1] + ")", match[2], 0, match[0].length);
    return solver.endParsing(match[0].length);
  });

  registry.createExpression('pigments:stylus_hash', '^[ \\t]*([a-zA-Z_$][a-zA-Z0-9\\-_]*)\\s*=\\s*\\{([^=]*)\\}', ['styl', 'stylus'], function(match, solver) {
    var buffer, char, commaSensitiveBegin, commaSensitiveEnd, content, current, inCommaSensitiveContext, key, name, scope, scopeBegin, scopeEnd, value, _i, _len, _ref, _ref1;
    buffer = '';
    _ref = match, match = _ref[0], name = _ref[1], content = _ref[2];
    current = match.indexOf(content);
    scope = [name];
    scopeBegin = /\{/;
    scopeEnd = /\}/;
    commaSensitiveBegin = /\(|\[/;
    commaSensitiveEnd = /\)|\]/;
    inCommaSensitiveContext = false;
    for (_i = 0, _len = content.length; _i < _len; _i++) {
      char = content[_i];
      if (scopeBegin.test(char)) {
        scope.push(buffer.replace(/[\s:]/g, ''));
        buffer = '';
      } else if (scopeEnd.test(char)) {
        scope.pop();
        if (scope.length === 0) {
          return solver.endParsing(current);
        }
      } else if (commaSensitiveBegin.test(char)) {
        buffer += char;
        inCommaSensitiveContext = true;
      } else if (inCommaSensitiveContext) {
        buffer += char;
        inCommaSensitiveContext = !commaSensitiveEnd.test(char);
      } else if (/[,\n]/.test(char)) {
        buffer = buffer.replace(/\s+/g, '');
        if (buffer.length) {
          _ref1 = buffer.split(/\s*:\s*/), key = _ref1[0], value = _ref1[1];
          solver.appendResult(scope.concat(key).join('.'), value, current - buffer.length - 1, current);
        }
        buffer = '';
      } else {
        buffer += char;
      }
      current++;
    }
    scope.pop();
    if (scope.length === 0) {
      return solver.endParsing(current + 1);
    } else {
      return solver.abortParsing();
    }
  });

  registry.createExpression('pigments:stylus', '^[ \\t]*([a-zA-Z_$][a-zA-Z0-9\\-_]*)\\s*=(?!=)\\s*([^\\n\\r;]*);?$', ['styl', 'stylus']);

  registry.createExpression('pigments:latex', '\\\\definecolor(\\{[^\\}]+\\})\\{([^\\}]+)\\}\\{([^\\}]+)\\}', ['tex'], function(match, solver) {
    var mode, name, value, values, _;
    _ = match[0], name = match[1], mode = match[2], value = match[3];
    value = (function() {
      switch (mode) {
        case 'RGB':
          return "rgb(" + value + ")";
        case 'gray':
          return "gray(" + (Math.round(parseFloat(value) * 100)) + "%)";
        case 'rgb':
          values = value.split(',').map(function(n) {
            return Math.floor(n * 255);
          });
          return "rgb(" + (values.join(',')) + ")";
        case 'cmyk':
          return "cmyk(" + value + ")";
        case 'HTML':
          return "#" + value;
        default:
          return value;
      }
    })();
    solver.appendResult(name, value, 0, _.length, {
      noNamePrefix: true
    });
    return solver.endParsing(_.length);
  });

  registry.createExpression('pigments:latex_mix', '\\\\definecolor(\\{[^\\}]+\\})(\\{[^\\}\\n!]+[!][^\\}\\n]+\\})', ['tex'], function(match, solver) {
    var name, value, _;
    _ = match[0], name = match[1], value = match[2];
    solver.appendResult(name, value, 0, _.length, {
      noNamePrefix: true
    });
    return solver.endParsing(_.length);
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvcGlnbWVudHMvbGliL3ZhcmlhYmxlLWV4cHJlc3Npb25zLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSwrREFBQTs7QUFBQSxFQUFBLG1CQUFBLEdBQXNCLE9BQUEsQ0FBUSx3QkFBUixDQUF0QixDQUFBOztBQUFBLEVBQ0Esa0JBQUEsR0FBcUIsT0FBQSxDQUFRLHVCQUFSLENBRHJCLENBQUE7O0FBQUEsRUFHQSxNQUFNLENBQUMsT0FBUCxHQUFpQixRQUFBLEdBQWUsSUFBQSxtQkFBQSxDQUFvQixrQkFBcEIsQ0FIaEMsQ0FBQTs7QUFBQSxFQUtBLFFBQVEsQ0FBQyxnQkFBVCxDQUEwQixlQUExQixFQUEyQyxxREFBM0MsRUFBa0csQ0FBQyxNQUFELENBQWxHLENBTEEsQ0FBQTs7QUFBQSxFQVFBLFFBQVEsQ0FBQyxnQkFBVCxDQUEwQixzQkFBMUIsRUFBa0Qsd0VBQWxELEVBQTRILENBQUMsTUFBRCxFQUFTLE1BQVQsRUFBaUIsTUFBakIsQ0FBNUgsRUFBc0osU0FBQyxLQUFELEVBQVEsTUFBUixHQUFBO0FBQ3BKLElBQUMsUUFBUyxRQUFWLENBQUE7V0FDQSxNQUFNLENBQUMsVUFBUCxDQUFrQixLQUFLLENBQUMsTUFBTixHQUFlLENBQWpDLEVBRm9KO0VBQUEsQ0FBdEosQ0FSQSxDQUFBOztBQUFBLEVBWUEsWUFBQSxHQUFlLFNBQUMsS0FBRCxFQUFRLE1BQVIsR0FBQTtBQUNiLFFBQUEsMEJBQUE7QUFBQSxJQUFBLE1BQU0sQ0FBQyxZQUFQLENBQW9CLEtBQU0sQ0FBQSxDQUFBLENBQTFCLEVBQThCLEtBQU0sQ0FBQSxDQUFBLENBQXBDLEVBQXdDLENBQXhDLEVBQTJDLEtBQU0sQ0FBQSxDQUFBLENBQUUsQ0FBQyxNQUFwRCxFQUE0RDtB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

//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/pigments/lib/variable-expressions.coffee
