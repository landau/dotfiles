(function() {
  var decimal, float, int, namePrefixes, percent, variables;

  int = '\\d+';

  decimal = "\\." + int;

  float = "(?:" + int + decimal + "|" + int + "|" + decimal + ")";

  percent = float + "%";

  variables = '(?:@[a-zA-Z0-9\\-_]+|\\$[a-zA-Z0-9\\-_]+|[a-zA-Z_][a-zA-Z0-9\\-_]*)';

  namePrefixes = '^| |\\t|:|=|,|\\n|\'|"|`|\\(|\\[|\\{|>';

  module.exports = {
    int: int,
    float: float,
    percent: percent,
    optionalPercent: float + "%?",
    intOrPercent: "(?:" + percent + "|" + int + ")",
    floatOrPercent: "(?:" + percent + "|" + float + ")",
    comma: '\\s*,\\s*',
    notQuote: "[^\"'`\\n\\r]+",
    hexadecimal: '[\\da-fA-F]',
    ps: '\\(\\s*',
    pe: '\\s*\\)',
    variables: variables,
    namePrefixes: namePrefixes,
    createVariableRegExpString: function(variables) {
      var i, j, len, len1, res, v, variableNamesWithPrefix, variableNamesWithoutPrefix, withPrefixes, withoutPrefixes;
      variableNamesWithPrefix = [];
      variableNamesWithoutPrefix = [];
      withPrefixes = variables.filter(function(v) {
        return !v.noNamePrefix;
      });
      withoutPrefixes = variables.filter(function(v) {
        return v.noNamePrefix;
      });
      res = [];
      if (withPrefixes.length > 0) {
        for (i = 0, len = withPrefixes.length; i < len; i++) {
          v = withPrefixes[i];
          variableNamesWithPrefix.push(v.name.replace(/[-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"));
        }
        res.push("((?:" + namePrefixes + ")(" + (variableNamesWithPrefix.join('|')) + ")(\\s+!default)?(?!_|-|\\w|\\d|[ \\t]*[\\.:=]))");
      }
      if (withoutPrefixes.length > 0) {
        for (j = 0, len1 = withoutPrefixes.length; j < len1; j++) {
          v = withoutPrefixes[j];
          variableNamesWithoutPrefix.push(v.name.replace(/[-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"));
        }
        res.push("(" + (variableNamesWithoutPrefix.join('|')) + ")");
      }
      return res.join('|');
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvcGlnbWVudHMvbGliL3JlZ2V4ZXMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxHQUFBLEdBQU07O0VBQ04sT0FBQSxHQUFVLEtBQUEsR0FBTTs7RUFDaEIsS0FBQSxHQUFRLEtBQUEsR0FBTSxHQUFOLEdBQVksT0FBWixHQUFvQixHQUFwQixHQUF1QixHQUF2QixHQUEyQixHQUEzQixHQUE4QixPQUE5QixHQUFzQzs7RUFDOUMsT0FBQSxHQUFhLEtBQUQsR0FBTzs7RUFDbkIsU0FBQSxHQUFZOztFQUNaLFlBQUEsR0FBZTs7RUFFZixNQUFNLENBQUMsT0FBUCxHQUNFO0lBQUEsR0FBQSxFQUFLLEdBQUw7SUFDQSxLQUFBLEVBQU8sS0FEUDtJQUVBLE9BQUEsRUFBUyxPQUZUO0lBR0EsZUFBQSxFQUFvQixLQUFELEdBQU8sSUFIMUI7SUFJQSxZQUFBLEVBQWMsS0FBQSxHQUFNLE9BQU4sR0FBYyxHQUFkLEdBQWlCLEdBQWpCLEdBQXFCLEdBSm5DO0lBS0EsY0FBQSxFQUFnQixLQUFBLEdBQU0sT0FBTixHQUFjLEdBQWQsR0FBaUIsS0FBakIsR0FBdUIsR0FMdkM7SUFNQSxLQUFBLEVBQU8sV0FOUDtJQU9BLFFBQUEsRUFBVSxnQkFQVjtJQVFBLFdBQUEsRUFBYSxhQVJiO0lBU0EsRUFBQSxFQUFJLFNBVEo7SUFVQSxFQUFBLEVBQUksU0FWSjtJQVdBLFNBQUEsRUFBVyxTQVhYO0lBWUEsWUFBQSxFQUFjLFlBWmQ7SUFhQSwwQkFBQSxFQUE0QixTQUFDLFNBQUQ7QUFDMUIsVUFBQTtNQUFBLHVCQUFBLEdBQTBCO01BQzFCLDBCQUFBLEdBQTZCO01BQzdCLFlBQUEsR0FBZSxTQUFTLENBQUMsTUFBVixDQUFpQixTQUFDLENBQUQ7ZUFBTyxDQUFJLENBQUMsQ0FBQztNQUFiLENBQWpCO01BQ2YsZUFBQSxHQUFrQixTQUFTLENBQUMsTUFBVixDQUFpQixTQUFDLENBQUQ7ZUFBTyxDQUFDLENBQUM7TUFBVCxDQUFqQjtNQUVsQixHQUFBLEdBQU07TUFFTixJQUFHLFlBQVksQ0FBQyxNQUFiLEdBQXNCLENBQXpCO0FBQ0UsYUFBQSw4Q0FBQTs7VUFDRSx1QkFBdUIsQ0FBQyxJQUF4QixDQUE2QixDQUFDLENBQUMsSUFBSSxDQUFDLE9BQVAsQ0FBZSxvQ0FBZixFQUFxRCxNQUFyRCxDQUE3QjtBQURGO1FBR0EsR0FBRyxDQUFDLElBQUosQ0FBUyxNQUFBLEdBQU8sWUFBUCxHQUFvQixJQUFwQixHQUF1QixDQUFDLHVCQUF1QixDQUFDLElBQXhCLENBQTZCLEdBQTdCLENBQUQsQ0FBdkIsR0FBMEQsaURBQW5FLEVBSkY7O01BTUEsSUFBRyxlQUFlLENBQUMsTUFBaEIsR0FBeUIsQ0FBNUI7QUFDRSxhQUFBLG1EQUFBOztVQUNFLDBCQUEwQixDQUFDLElBQTNCLENBQWdDLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBUCxDQUFlLG9DQUFmLEVBQXFELE1BQXJELENBQWhDO0FBREY7UUFHQSxHQUFHLENBQUMsSUFBSixDQUFTLEdBQUEsR0FBRyxDQUFDLDBCQUEwQixDQUFDLElBQTNCLENBQWdDLEdBQWhDLENBQUQsQ0FBSCxHQUF5QyxHQUFsRCxFQUpGOzthQU1BLEdBQUcsQ0FBQyxJQUFKLENBQVMsR0FBVDtJQXBCMEIsQ0FiNUI7O0FBUkYiLCJzb3VyY2VzQ29udGVudCI6WyJpbnQgPSAnXFxcXGQrJ1xuZGVjaW1hbCA9IFwiXFxcXC4je2ludH1cIlxuZmxvYXQgPSBcIig/OiN7aW50fSN7ZGVjaW1hbH18I3tpbnR9fCN7ZGVjaW1hbH0pXCJcbnBlcmNlbnQgPSBcIiN7ZmxvYXR9JVwiXG52YXJpYWJsZXMgPSAnKD86QFthLXpBLVowLTlcXFxcLV9dK3xcXFxcJFthLXpBLVowLTlcXFxcLV9dK3xbYS16QS1aX11bYS16QS1aMC05XFxcXC1fXSopJ1xubmFtZVByZWZpeGVzID0gJ158IHxcXFxcdHw6fD18LHxcXFxcbnxcXCd8XCJ8YHxcXFxcKHxcXFxcW3xcXFxce3w+J1xuXG5tb2R1bGUuZXhwb3J0cyA9XG4gIGludDogaW50XG4gIGZsb2F0OiBmbG9hdFxuICBwZXJjZW50OiBwZXJjZW50XG4gIG9wdGlvbmFsUGVyY2VudDogXCIje2Zsb2F0fSU/XCJcbiAgaW50T3JQZXJjZW50OiBcIig/OiN7cGVyY2VudH18I3tpbnR9KVwiXG4gIGZsb2F0T3JQZXJjZW50OiBcIig/OiN7cGVyY2VudH18I3tmbG9hdH0pXCJcbiAgY29tbWE6ICdcXFxccyosXFxcXHMqJ1xuICBub3RRdW90ZTogXCJbXlxcXCInYFxcXFxuXFxcXHJdK1wiXG4gIGhleGFkZWNpbWFsOiAnW1xcXFxkYS1mQS1GXSdcbiAgcHM6ICdcXFxcKFxcXFxzKidcbiAgcGU6ICdcXFxccypcXFxcKSdcbiAgdmFyaWFibGVzOiB2YXJpYWJsZXNcbiAgbmFtZVByZWZpeGVzOiBuYW1lUHJlZml4ZXNcbiAgY3JlYXRlVmFyaWFibGVSZWdFeHBTdHJpbmc6ICh2YXJpYWJsZXMpIC0+XG4gICAgdmFyaWFibGVOYW1lc1dpdGhQcmVmaXggPSBbXVxuICAgIHZhcmlhYmxlTmFtZXNXaXRob3V0UHJlZml4ID0gW11cbiAgICB3aXRoUHJlZml4ZXMgPSB2YXJpYWJsZXMuZmlsdGVyICh2KSAtPiBub3Qgdi5ub05hbWVQcmVmaXhcbiAgICB3aXRob3V0UHJlZml4ZXMgPSB2YXJpYWJsZXMuZmlsdGVyICh2KSAtPiB2Lm5vTmFtZVByZWZpeFxuXG4gICAgcmVzID0gW11cblxuICAgIGlmIHdpdGhQcmVmaXhlcy5sZW5ndGggPiAwXG4gICAgICBmb3IgdiBpbiB3aXRoUHJlZml4ZXNcbiAgICAgICAgdmFyaWFibGVOYW1lc1dpdGhQcmVmaXgucHVzaCB2Lm5hbWUucmVwbGFjZSgvWy1cXFtcXF1cXC9cXHtcXH1cXChcXClcXCpcXCtcXD9cXC5cXFxcXFxeXFwkXFx8XS9nLCBcIlxcXFwkJlwiKVxuXG4gICAgICByZXMucHVzaCBcIigoPzoje25hbWVQcmVmaXhlc30pKCN7dmFyaWFibGVOYW1lc1dpdGhQcmVmaXguam9pbignfCcpfSkoXFxcXHMrIWRlZmF1bHQpPyg/IV98LXxcXFxcd3xcXFxcZHxbIFxcXFx0XSpbXFxcXC46PV0pKVwiXG5cbiAgICBpZiB3aXRob3V0UHJlZml4ZXMubGVuZ3RoID4gMFxuICAgICAgZm9yIHYgaW4gd2l0aG91dFByZWZpeGVzXG4gICAgICAgIHZhcmlhYmxlTmFtZXNXaXRob3V0UHJlZml4LnB1c2ggdi5uYW1lLnJlcGxhY2UoL1stXFxbXFxdXFwvXFx7XFx9XFwoXFwpXFwqXFwrXFw/XFwuXFxcXFxcXlxcJFxcfF0vZywgXCJcXFxcJCZcIilcblxuICAgICAgcmVzLnB1c2ggXCIoI3t2YXJpYWJsZU5hbWVzV2l0aG91dFByZWZpeC5qb2luKCd8Jyl9KVwiXG5cbiAgICByZXMuam9pbignfCcpXG4iXX0=
