(function() {
  var BufferColorsScanner, ColorContext, ColorExpression, ColorScanner, ColorsChunkSize, ExpressionsRegistry;

  ColorScanner = require('../color-scanner');

  ColorContext = require('../color-context');

  ColorExpression = require('../color-expression');

  ExpressionsRegistry = require('../expressions-registry');

  ColorsChunkSize = 100;

  BufferColorsScanner = (function() {
    function BufferColorsScanner(config) {
      var colorVariables, registry, variables;
      this.buffer = config.buffer, variables = config.variables, colorVariables = config.colorVariables, this.bufferPath = config.bufferPath, this.scope = config.scope, registry = config.registry;
      registry = ExpressionsRegistry.deserialize(registry, ColorExpression);
      this.context = new ColorContext({
        variables: variables,
        colorVariables: colorVariables,
        referencePath: this.bufferPath,
        registry: registry
      });
      this.scanner = new ColorScanner({
        context: this.context
      });
      this.results = [];
    }

    BufferColorsScanner.prototype.scan = function() {
      var lastIndex, result;
      if (this.bufferPath == null) {
        return;
      }
      lastIndex = 0;
      while (result = this.scanner.search(this.buffer, this.scope, lastIndex)) {
        this.results.push(result);
        if (this.results.length >= ColorsChunkSize) {
          this.flushColors();
        }
        lastIndex = result.lastIndex;
      }
      return this.flushColors();
    };

    BufferColorsScanner.prototype.flushColors = function() {
      emit('scan-buffer:colors-found', this.results);
      return this.results = [];
    };

    return BufferColorsScanner;

  })();

  module.exports = function(config) {
    return new BufferColorsScanner(config).scan();
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvcGlnbWVudHMvbGliL3Rhc2tzL3NjYW4tYnVmZmVyLWNvbG9ycy1oYW5kbGVyLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxzR0FBQTs7QUFBQSxFQUFBLFlBQUEsR0FBZSxPQUFBLENBQVEsa0JBQVIsQ0FBZixDQUFBOztBQUFBLEVBQ0EsWUFBQSxHQUFlLE9BQUEsQ0FBUSxrQkFBUixDQURmLENBQUE7O0FBQUEsRUFFQSxlQUFBLEdBQWtCLE9BQUEsQ0FBUSxxQkFBUixDQUZsQixDQUFBOztBQUFBLEVBR0EsbUJBQUEsR0FBc0IsT0FBQSxDQUFRLHlCQUFSLENBSHRCLENBQUE7O0FBQUEsRUFJQSxlQUFBLEdBQWtCLEdBSmxCLENBQUE7O0FBQUEsRUFNTTtBQUNTLElBQUEsNkJBQUMsTUFBRCxHQUFBO0FBQ1gsVUFBQSxtQ0FBQTtBQUFBLE1BQUMsSUFBQyxDQUFBLGdCQUFBLE1BQUYsRUFBVSxtQkFBQSxTQUFWLEVBQXFCLHdCQUFBLGNBQXJCLEVBQXFDLElBQUMsQ0FBQSxvQkFBQSxVQUF0QyxFQUFrRCxJQUFDLENBQUEsZUFBQSxLQUFuRCxFQUEwRCxrQkFBQSxRQUExRCxDQUFBO0FBQUEsTUFDQSxRQUFBLEdBQVcsbUJBQW1CLENBQUMsV0FBcEIsQ0FBZ0MsUUFBaEMsRUFBMEMsZUFBMUMsQ0FEWCxDQUFBO0FBQUEsTUFFQSxJQUFDLENBQUEsT0FBRCxHQUFlLElBQUEsWUFBQSxDQUFhO0FBQUEsUUFBQyxXQUFBLFNBQUQ7QUFBQSxRQUFZLGdCQUFBLGNBQVo7QUFBQSxRQUE0QixhQUFBLEVBQWUsSUFBQyxDQUFBLFVBQTVDO0FBQUEsUUFBd0QsVUFBQSxRQUF4RDtPQUFiLENBRmYsQ0FBQTtBQUFBLE1BR0EsSUFBQyxDQUFBLE9BQUQsR0FBZSxJQUFBLFlBQUEsQ0FBYTtBQUFBLFFBQUUsU0FBRCxJQUFDLENBQUEsT0FBRjtPQUFiLENBSGYsQ0FBQTtBQUFBLE1BSUEsSUFBQyxDQUFBLE9BQUQsR0FBVyxFQUpYLENBRFc7SUFBQSxDQUFiOztBQUFBLGtDQU9BLElBQUEsR0FBTSxTQUFBLEdBQUE7QUFDSixVQUFBLGlCQUFBO0FBQUEsTUFBQSxJQUFjLHVCQUFkO0FBQUEsY0FBQSxDQUFBO09BQUE7QUFBQSxNQUNBLFNBQUEsR0FBWSxDQURaLENBQUE7QUFFQSxhQUFNLE1BQUEsR0FBUyxJQUFDLENBQUEsT0FBTyxDQUFDLE1BQVQsQ0FBZ0IsSUFBQyxDQUFBLE1BQWpCLEVBQXlCLElBQUMsQ0FBQSxLQUExQixFQUFpQyxTQUFqQyxDQUFmLEdBQUE7QUFDRSxRQUFBLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFjLE1BQWQsQ0FBQSxDQUFBO0FBRUEsUUFBQSxJQUFrQixJQUFDLENBQUEsT0FBTyxDQUFDLE1BQVQsSUFBbUIsZUFBckM7QUFBQSxVQUFBLElBQUMsQ0FBQSxXQUFELENBQUEsQ0FBQSxDQUFBO1NBRkE7QUFBQSxRQUdDLFlBQWEsT0FBYixTQUhELENBREY7TUFBQSxDQUZBO2FBUUEsSUFBQyxDQUFBLFdBQUQsQ0FBQSxFQVRJO0lBQUEsQ0FQTixDQUFBOztBQUFBLGtDQWtCQSxXQUFBLEdBQWEsU0FBQSxHQUFBO0FBQ1gsTUFBQSxJQUFBLENBQUssMEJBQUwsRUFBaUMsSUFBQyxDQUFBLE9BQWxDLENBQUEsQ0FBQTthQUNBLElBQUMsQ0FBQSxPQUFELEdBQVcsR0FGQTtJQUFBLENBbEJiLENBQUE7OytCQUFBOztNQVBGLENBQUE7O0FBQUEsRUE2QkEsTUFBTSxDQUFDLE9BQVAsR0FBaUIsU0FBQyxNQUFELEdBQUE7V0FDWCxJQUFBLG1CQUFBLENBQW9CLE1BQXBCLENBQTJCLENBQUMsSUFBNUIsQ0FBQSxFQURXO0VBQUEsQ0E3QmpCLENBQUE7QUFBQSIKfQ==

//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/pigments/lib/tasks/scan-buffer-colors-handler.coffee
