(function() {
  var ColorParser;

  module.exports = ColorParser = (function() {
    function ColorParser(registry, context) {
      this.registry = registry;
      this.context = context;
    }

    ColorParser.prototype.parse = function(expression, scope, collectVariables) {
      var e, res, _i, _len, _ref;
      if (scope == null) {
        scope = '*';
      }
      if (collectVariables == null) {
        collectVariables = true;
      }
      if ((expression == null) || expression === '') {
        return void 0;
      }
      _ref = this.registry.getExpressionsForScope(scope);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        e = _ref[_i];
        if (e.match(expression)) {
          res = e.parse(expression, this.context);
          if (collectVariables) {
            res.variables = this.context.readUsedVariables();
          }
          return res;
        }
      }
      return void 0;
    };

    return ColorParser;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvcGlnbWVudHMvbGliL2NvbG9yLXBhcnNlci5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFDQTtBQUFBLE1BQUEsV0FBQTs7QUFBQSxFQUFBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDUyxJQUFBLHFCQUFFLFFBQUYsRUFBYSxPQUFiLEdBQUE7QUFBdUIsTUFBdEIsSUFBQyxDQUFBLFdBQUEsUUFBcUIsQ0FBQTtBQUFBLE1BQVgsSUFBQyxDQUFBLFVBQUEsT0FBVSxDQUF2QjtJQUFBLENBQWI7O0FBQUEsMEJBRUEsS0FBQSxHQUFPLFNBQUMsVUFBRCxFQUFhLEtBQWIsRUFBd0IsZ0JBQXhCLEdBQUE7QUFDTCxVQUFBLHNCQUFBOztRQURrQixRQUFNO09BQ3hCOztRQUQ2QixtQkFBaUI7T0FDOUM7QUFBQSxNQUFBLElBQXdCLG9CQUFKLElBQW1CLFVBQUEsS0FBYyxFQUFyRDtBQUFBLGVBQU8sTUFBUCxDQUFBO09BQUE7QUFFQTtBQUFBLFdBQUEsMkNBQUE7cUJBQUE7QUFDRSxRQUFBLElBQUcsQ0FBQyxDQUFDLEtBQUYsQ0FBUSxVQUFSLENBQUg7QUFDRSxVQUFBLEdBQUEsR0FBTSxDQUFDLENBQUMsS0FBRixDQUFRLFVBQVIsRUFBb0IsSUFBQyxDQUFBLE9BQXJCLENBQU4sQ0FBQTtBQUNBLFVBQUEsSUFBZ0QsZ0JBQWhEO0FBQUEsWUFBQSxHQUFHLENBQUMsU0FBSixHQUFnQixJQUFDLENBQUEsT0FBTyxDQUFDLGlCQUFULENBQUEsQ0FBaEIsQ0FBQTtXQURBO0FBRUEsaUJBQU8sR0FBUCxDQUhGO1NBREY7QUFBQSxPQUZBO0FBUUEsYUFBTyxNQUFQLENBVEs7SUFBQSxDQUZQLENBQUE7O3VCQUFBOztNQUZGLENBQUE7QUFBQSIKfQ==

//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/pigments/lib/color-parser.coffee
