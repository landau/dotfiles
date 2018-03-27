(function() {
  var VariableParser, VariableScanner, countLines, _ref;

  _ref = [], VariableParser = _ref[0], countLines = _ref[1];

  module.exports = VariableScanner = (function() {
    function VariableScanner(params) {
      if (params == null) {
        params = {};
      }
      if (VariableParser == null) {
        VariableParser = require('./variable-parser');
      }
      this.parser = params.parser, this.registry = params.registry, this.scope = params.scope;
      if (this.parser == null) {
        this.parser = new VariableParser(this.registry);
      }
    }

    VariableScanner.prototype.getRegExp = function() {
      return new RegExp(this.registry.getRegExpForScope(this.scope), 'gm');
    };

    VariableScanner.prototype.search = function(text, start) {
      var index, lastIndex, line, lineCountIndex, match, matchText, regexp, result, v, _i, _len;
      if (start == null) {
        start = 0;
      }
      if (this.registry.getExpressionsForScope(this.scope).length === 0) {
        return;
      }
      if (countLines == null) {
        countLines = require('./utils').countLines;
      }
      regexp = this.getRegExp();
      regexp.lastIndex = start;
      while (match = regexp.exec(text)) {
        matchText = match[0];
        index = match.index;
        lastIndex = regexp.lastIndex;
        result = this.parser.parse(matchText);
        if (result != null) {
          result.lastIndex += index;
          if (result.length > 0) {
            result.range[0] += index;
            result.range[1] += index;
            line = -1;
            lineCountIndex = 0;
            for (_i = 0, _len = result.length; _i < _len; _i++) {
              v = result[_i];
              v.range[0] += index;
              v.range[1] += index;
              line = v.line = line + countLines(text.slice(lineCountIndex, +v.range[0] + 1 || 9e9));
              lineCountIndex = v.range[0];
            }
            return result;
          } else {
            regexp.lastIndex = result.lastIndex;
          }
        }
      }
      return void 0;
    };

    return VariableScanner;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvcGlnbWVudHMvbGliL3ZhcmlhYmxlLXNjYW5uZXIuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGlEQUFBOztBQUFBLEVBQUEsT0FBK0IsRUFBL0IsRUFBQyx3QkFBRCxFQUFpQixvQkFBakIsQ0FBQTs7QUFBQSxFQUVBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDUyxJQUFBLHlCQUFDLE1BQUQsR0FBQTs7UUFBQyxTQUFPO09BQ25COztRQUFBLGlCQUFrQixPQUFBLENBQVEsbUJBQVI7T0FBbEI7QUFBQSxNQUVDLElBQUMsQ0FBQSxnQkFBQSxNQUFGLEVBQVUsSUFBQyxDQUFBLGtCQUFBLFFBQVgsRUFBcUIsSUFBQyxDQUFBLGVBQUEsS0FGdEIsQ0FBQTs7UUFHQSxJQUFDLENBQUEsU0FBYyxJQUFBLGNBQUEsQ0FBZSxJQUFDLENBQUEsUUFBaEI7T0FKSjtJQUFBLENBQWI7O0FBQUEsOEJBTUEsU0FBQSxHQUFXLFNBQUEsR0FBQTthQUNMLElBQUEsTUFBQSxDQUFPLElBQUMsQ0FBQSxRQUFRLENBQUMsaUJBQVYsQ0FBNEIsSUFBQyxDQUFBLEtBQTdCLENBQVAsRUFBNEMsSUFBNUMsRUFESztJQUFBLENBTlgsQ0FBQTs7QUFBQSw4QkFTQSxNQUFBLEdBQVEsU0FBQyxJQUFELEVBQU8sS0FBUCxHQUFBO0FBQ04sVUFBQSxxRkFBQTs7UUFEYSxRQUFNO09BQ25CO0FBQUEsTUFBQSxJQUFVLElBQUMsQ0FBQSxRQUFRLENBQUMsc0JBQVYsQ0FBaUMsSUFBQyxDQUFBLEtBQWxDLENBQXdDLENBQUMsTUFBekMsS0FBbUQsQ0FBN0Q7QUFBQSxjQUFBLENBQUE7T0FBQTs7UUFFQSxhQUFjLE9BQUEsQ0FBUSxTQUFSLENBQWtCLENBQUM7T0FGakM7QUFBQSxNQUlBLE1BQUEsR0FBUyxJQUFDLENBQUEsU0FBRCxDQUFBLENBSlQsQ0FBQTtBQUFBLE1BS0EsTUFBTSxDQUFDLFNBQVAsR0FBbUIsS0FMbkIsQ0FBQTtBQU9BLGFBQU0sS0FBQSxHQUFRLE1BQU0sQ0FBQyxJQUFQLENBQVksSUFBWixDQUFkLEdBQUE7QUFDRSxRQUFDLFlBQWEsUUFBZCxDQUFBO0FBQUEsUUFDQyxRQUFTLE1BQVQsS0FERCxDQUFBO0FBQUEsUUFFQyxZQUFhLE9BQWIsU0FGRCxDQUFBO0FBQUEsUUFJQSxNQUFBLEdBQVMsSUFBQyxDQUFBLE1BQU0sQ0FBQyxLQUFSLENBQWMsU0FBZCxDQUpULENBQUE7QUFNQSxRQUFBLElBQUcsY0FBSDtBQUNFLFVBQUEsTUFBTSxDQUFDLFNBQVAsSUFBb0IsS0FBcEIsQ0FBQTtBQUVBLFVBQUEsSUFBRyxNQUFNLENBQUMsTUFBUCxHQUFnQixDQUFuQjtBQUNFLFlBQUEsTUFBTSxDQUFDLEtBQU0sQ0FBQSxDQUFBLENBQWIsSUFBbUIsS0FBbkIsQ0FBQTtBQUFBLFlBQ0EsTUFBTSxDQUFDLEtBQU0sQ0FBQSxDQUFBLENBQWIsSUFBbUIsS0FEbkIsQ0FBQTtBQUFBLFlBR0EsSUFBQSxHQUFPLENBQUEsQ0FIUCxDQUFBO0FBQUEsWUFJQSxjQUFBLEdBQWlCLENBSmpCLENBQUE7QUFNQSxpQkFBQSw2Q0FBQTs2QkFBQTtBQUNFLGNBQUEsQ0FBQyxDQUFDLEtBQU0sQ0FBQSxDQUFBLENBQVIsSUFBYyxLQUFkLENBQUE7QUFBQSxjQUNBLENBQUMsQ0FBQyxLQUFNLENBQUEsQ0FBQSxDQUFSLElBQWMsS0FEZCxDQUFBO0FBQUEsY0FFQSxJQUFBLEdBQU8sQ0FBQyxDQUFDLElBQUYsR0FBUyxJQUFBLEdBQU8sVUFBQSxDQUFXLElBQUssOENBQWhCLENBRnZCLENBQUE7QUFBQSxjQUdBLGNBQUEsR0FBaUIsQ0FBQyxDQUFDLEtBQU0sQ0FBQSxDQUFBLENBSHpCLENBREY7QUFBQSxhQU5BO0FBWUEsbUJBQU8sTUFBUCxDQWJGO1dBQUEsTUFBQTtBQWVFLFlBQUEsTUFBTSxDQUFDLFNBQVAsR0FBbUIsTUFBTSxDQUFDLFNBQTFCLENBZkY7V0FIRjtTQVBGO01BQUEsQ0FQQTtBQWtDQSxhQUFPLE1BQVAsQ0FuQ007SUFBQSxDQVRSLENBQUE7OzJCQUFBOztNQUpGLENBQUE7QUFBQSIKfQ==

//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/pigments/lib/variable-scanner.coffee
