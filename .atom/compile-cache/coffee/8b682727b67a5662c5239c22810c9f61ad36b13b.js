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
    solver.appendResult([match[1], match[2], 0, match[0].length]);
    if (match[1].match(/[-_]/)) {
      all_underscore = match[1].replace(/-/g, '_');
      all_hyphen = match[1].replace(/_/g, '-');
      if (match[1] !== all_underscore) {
        solver.appendResult([all_underscore, match[2], 0, match[0].length]);
      }
      if (match[1] !== all_hyphen) {
        solver.appendResult([all_hyphen, match[2], 0, match[0].length]);
      }
    }
    return solver.endParsing(match[0].length);
  };

  registry.createExpression('pigments:scss', '^[ \\t]*(\\$[a-zA-Z0-9\\-_]+)\\s*:\\s*(.*?)(\\s*!default)?\\s*;', ['scss', 'haml'], sass_handler);

  registry.createExpression('pigments:sass', '^[ \\t]*(\\$[a-zA-Z0-9\\-_]+)\\s*:\\s*([^\\{]*?)(\\s*!default)?\\s*(?:$|\\/)', ['sass', 'haml'], sass_handler);

  registry.createExpression('pigments:css_vars', '(--[^\\s:]+):\\s*([^\\n;]+);', ['css'], function(match, solver) {
    solver.appendResult(["var(" + match[1] + ")", match[2], 0, match[0].length]);
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
          solver.appendResult([scope.concat(key).join('.'), value, current - buffer.length - 1, current]);
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

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvcGlnbWVudHMvbGliL3ZhcmlhYmxlLWV4cHJlc3Npb25zLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSwrREFBQTs7QUFBQSxFQUFBLG1CQUFBLEdBQXNCLE9BQUEsQ0FBUSx3QkFBUixDQUF0QixDQUFBOztBQUFBLEVBQ0Esa0JBQUEsR0FBcUIsT0FBQSxDQUFRLHVCQUFSLENBRHJCLENBQUE7O0FBQUEsRUFHQSxNQUFNLENBQUMsT0FBUCxHQUFpQixRQUFBLEdBQWUsSUFBQSxtQkFBQSxDQUFvQixrQkFBcEIsQ0FIaEMsQ0FBQTs7QUFBQSxFQUtBLFFBQVEsQ0FBQyxnQkFBVCxDQUEwQixlQUExQixFQUEyQyxxREFBM0MsRUFBa0csQ0FBQyxNQUFELENBQWxHLENBTEEsQ0FBQTs7QUFBQSxFQVFBLFFBQVEsQ0FBQyxnQkFBVCxDQUEwQixzQkFBMUIsRUFBa0Qsd0VBQWxELEVBQTRILENBQUMsTUFBRCxFQUFTLE1BQVQsRUFBaUIsTUFBakIsQ0FBNUgsRUFBc0osU0FBQyxLQUFELEVBQVEsTUFBUixHQUFBO0FBQ3BKLElBQUMsUUFBUyxRQUFWLENBQUE7V0FDQSxNQUFNLENBQUMsVUFBUCxDQUFrQixLQUFLLENBQUMsTUFBTixHQUFlLENBQWpDLEVBRm9KO0VBQUEsQ0FBdEosQ0FSQSxDQUFBOztBQUFBLEVBWUEsWUFBQSxHQUFlLFNBQUMsS0FBRCxFQUFRLE1BQVIsR0FBQTtBQUNiLFFBQUEsMEJBQUE7QUFBQSxJQUFBLE1BQU0sQ0FBQyxZQUFQLENBQW9CLENBQ2xCLEtBQU0sQ0FBQSxDQUFBLENBRFksRUFFbEIsS0FBTSxDQUFBLENBQUEsQ0FGWSxFQUdsQixDQUhrQixFQUlsQixLQUFNLENBQUEsQ0FBQSxDQUFFLENBQUMsTUFKUyxDQUFw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

//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/pigments/lib/variable-expressions.coffee
