(function() {
  var VariableParser, VariableScanner, countLines;

  countLines = require('./utils').countLines;

  VariableParser = require('./variable-parser');

  module.exports = VariableScanner = (function() {
    function VariableScanner(params) {
      if (params == null) {
        params = {};
      }
      this.parser = params.parser, this.registry = params.registry;
      if (this.parser == null) {
        this.parser = new VariableParser(this.registry);
      }
    }

    VariableScanner.prototype.getRegExp = function() {
      return this.regexp != null ? this.regexp : this.regexp = new RegExp(this.registry.getRegExp(), 'gm');
    };

    VariableScanner.prototype.search = function(text, start) {
      var index, lastIndex, line, lineCountIndex, match, matchText, regexp, result, v, _i, _len;
      if (start == null) {
        start = 0;
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvcGlnbWVudHMvbGliL3ZhcmlhYmxlLXNjYW5uZXIuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDJDQUFBOztBQUFBLEVBQUMsYUFBYyxPQUFBLENBQVEsU0FBUixFQUFkLFVBQUQsQ0FBQTs7QUFBQSxFQUNBLGNBQUEsR0FBaUIsT0FBQSxDQUFRLG1CQUFSLENBRGpCLENBQUE7O0FBQUEsRUFHQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ1MsSUFBQSx5QkFBQyxNQUFELEdBQUE7O1FBQUMsU0FBTztPQUNuQjtBQUFBLE1BQUMsSUFBQyxDQUFBLGdCQUFBLE1BQUYsRUFBVSxJQUFDLENBQUEsa0JBQUEsUUFBWCxDQUFBOztRQUNBLElBQUMsQ0FBQSxTQUFjLElBQUEsY0FBQSxDQUFlLElBQUMsQ0FBQSxRQUFoQjtPQUZKO0lBQUEsQ0FBYjs7QUFBQSw4QkFJQSxTQUFBLEdBQVcsU0FBQSxHQUFBO21DQUNULElBQUMsQ0FBQSxTQUFELElBQUMsQ0FBQSxTQUFjLElBQUEsTUFBQSxDQUFPLElBQUMsQ0FBQSxRQUFRLENBQUMsU0FBVixDQUFBLENBQVAsRUFBOEIsSUFBOUIsRUFETjtJQUFBLENBSlgsQ0FBQTs7QUFBQSw4QkFPQSxNQUFBLEdBQVEsU0FBQyxJQUFELEVBQU8sS0FBUCxHQUFBO0FBQ04sVUFBQSxxRkFBQTs7UUFEYSxRQUFNO09BQ25CO0FBQUEsTUFBQSxNQUFBLEdBQVMsSUFBQyxDQUFBLFNBQUQsQ0FBQSxDQUFULENBQUE7QUFBQSxNQUNBLE1BQU0sQ0FBQyxTQUFQLEdBQW1CLEtBRG5CLENBQUE7QUFHQSxhQUFNLEtBQUEsR0FBUSxNQUFNLENBQUMsSUFBUCxDQUFZLElBQVosQ0FBZCxHQUFBO0FBQ0UsUUFBQyxZQUFhLFFBQWQsQ0FBQTtBQUFBLFFBQ0MsUUFBUyxNQUFULEtBREQsQ0FBQTtBQUFBLFFBRUMsWUFBYSxPQUFiLFNBRkQsQ0FBQTtBQUFBLFFBSUEsTUFBQSxHQUFTLElBQUMsQ0FBQSxNQUFNLENBQUMsS0FBUixDQUFjLFNBQWQsQ0FKVCxDQUFBO0FBTUEsUUFBQSxJQUFHLGNBQUg7QUFDRSxVQUFBLE1BQU0sQ0FBQyxTQUFQLElBQW9CLEtBQXBCLENBQUE7QUFFQSxVQUFBLElBQUcsTUFBTSxDQUFDLE1BQVAsR0FBZ0IsQ0FBbkI7QUFDRSxZQUFBLE1BQU0sQ0FBQyxLQUFNLENBQUEsQ0FBQSxDQUFiLElBQW1CLEtBQW5CLENBQUE7QUFBQSxZQUNBLE1BQU0sQ0FBQyxLQUFNLENBQUEsQ0FBQSxDQUFiLElBQW1CLEtBRG5CLENBQUE7QUFBQSxZQUdBLElBQUEsR0FBTyxDQUFBLENBSFAsQ0FBQTtBQUFBLFlBSUEsY0FBQSxHQUFpQixDQUpqQixDQUFBO0FBTUEsaUJBQUEsNkNBQUE7NkJBQUE7QUFDRSxjQUFBLENBQUMsQ0FBQyxLQUFNLENBQUEsQ0FBQSxDQUFSLElBQWMsS0FBZCxDQUFBO0FBQUEsY0FDQSxDQUFDLENBQUMsS0FBTSxDQUFBLENBQUEsQ0FBUixJQUFjLEtBRGQsQ0FBQTtBQUFBLGNBRUEsSUFBQSxHQUFPLENBQUMsQ0FBQyxJQUFGLEdBQVMsSUFBQSxHQUFPLFVBQUEsQ0FBVyxJQUFLLDhDQUFoQixDQUZ2QixDQUFBO0FBQUEsY0FHQSxjQUFBLEdBQWlCLENBQUMsQ0FBQyxLQUFNLENBQUEsQ0FBQSxDQUh6QixDQURGO0FBQUEsYUFOQTtBQVlBLG1CQUFPLE1BQVAsQ0FiRjtXQUFBLE1BQUE7QUFlRSxZQUFBLE1BQU0sQ0FBQyxTQUFQLEdBQW1CLE1BQU0sQ0FBQyxTQUExQixDQWZGO1dBSEY7U0FQRjtNQUFBLENBSEE7QUE4QkEsYUFBTyxNQUFQLENBL0JNO0lBQUEsQ0FQUixDQUFBOzsyQkFBQTs7TUFMRixDQUFBO0FBQUEiCn0=

//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/pigments/lib/variable-scanner.coffee
