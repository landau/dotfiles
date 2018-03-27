(function() {
  var ColorScanner, countLines;

  countLines = null;

  module.exports = ColorScanner = (function() {
    function ColorScanner(_arg) {
      this.context = (_arg != null ? _arg : {}).context;
      this.parser = this.context.parser;
      this.registry = this.context.registry;
    }

    ColorScanner.prototype.getRegExp = function() {
      return new RegExp(this.registry.getRegExp(), 'g');
    };

    ColorScanner.prototype.getRegExpForScope = function(scope) {
      return new RegExp(this.registry.getRegExpForScope(scope), 'g');
    };

    ColorScanner.prototype.search = function(text, scope, start) {
      var color, index, lastIndex, match, matchText, regexp;
      if (start == null) {
        start = 0;
      }
      if (countLines == null) {
        countLines = require('./utils').countLines;
      }
      regexp = this.getRegExpForScope(scope);
      regexp.lastIndex = start;
      if (match = regexp.exec(text)) {
        matchText = match[0];
        lastIndex = regexp.lastIndex;
        color = this.parser.parse(matchText, scope);
        if ((index = matchText.indexOf(color.colorExpression)) > 0) {
          lastIndex += -matchText.length + index + color.colorExpression.length;
          matchText = color.colorExpression;
        }
        return {
          color: color,
          match: matchText,
          lastIndex: lastIndex,
          range: [lastIndex - matchText.length, lastIndex],
          line: countLines(text.slice(0, +(lastIndex - matchText.length) + 1 || 9e9)) - 1
        };
      }
    };

    return ColorScanner;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvcGlnbWVudHMvbGliL2NvbG9yLXNjYW5uZXIuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHdCQUFBOztBQUFBLEVBQUEsVUFBQSxHQUFhLElBQWIsQ0FBQTs7QUFBQSxFQUVBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDUyxJQUFBLHNCQUFDLElBQUQsR0FBQTtBQUNYLE1BRGEsSUFBQyxDQUFBLDBCQUFGLE9BQVcsSUFBVCxPQUNkLENBQUE7QUFBQSxNQUFBLElBQUMsQ0FBQSxNQUFELEdBQVUsSUFBQyxDQUFBLE9BQU8sQ0FBQyxNQUFuQixDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsUUFBRCxHQUFZLElBQUMsQ0FBQSxPQUFPLENBQUMsUUFEckIsQ0FEVztJQUFBLENBQWI7O0FBQUEsMkJBSUEsU0FBQSxHQUFXLFNBQUEsR0FBQTthQUNMLElBQUEsTUFBQSxDQUFPLElBQUMsQ0FBQSxRQUFRLENBQUMsU0FBVixDQUFBLENBQVAsRUFBOEIsR0FBOUIsRUFESztJQUFBLENBSlgsQ0FBQTs7QUFBQSwyQkFPQSxpQkFBQSxHQUFtQixTQUFDLEtBQUQsR0FBQTthQUNiLElBQUEsTUFBQSxDQUFPLElBQUMsQ0FBQSxRQUFRLENBQUMsaUJBQVYsQ0FBNEIsS0FBNUIsQ0FBUCxFQUEyQyxHQUEzQyxFQURhO0lBQUEsQ0FQbkIsQ0FBQTs7QUFBQSwyQkFVQSxNQUFBLEdBQVEsU0FBQyxJQUFELEVBQU8sS0FBUCxFQUFjLEtBQWQsR0FBQTtBQUNOLFVBQUEsaURBQUE7O1FBRG9CLFFBQU07T0FDMUI7QUFBQSxNQUFBLElBQXdDLGtCQUF4QztBQUFBLFFBQUMsYUFBYyxPQUFBLENBQVEsU0FBUixFQUFkLFVBQUQsQ0FBQTtPQUFBO0FBQUEsTUFFQSxNQUFBLEdBQVMsSUFBQyxDQUFBLGlCQUFELENBQW1CLEtBQW5CLENBRlQsQ0FBQTtBQUFBLE1BR0EsTUFBTSxDQUFDLFNBQVAsR0FBbUIsS0FIbkIsQ0FBQTtBQUtBLE1BQUEsSUFBRyxLQUFBLEdBQVEsTUFBTSxDQUFDLElBQVAsQ0FBWSxJQUFaLENBQVg7QUFDRSxRQUFDLFlBQWEsUUFBZCxDQUFBO0FBQUEsUUFDQyxZQUFhLE9BQWIsU0FERCxDQUFBO0FBQUEsUUFHQSxLQUFBLEdBQVEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxLQUFSLENBQWMsU0FBZCxFQUF5QixLQUF6QixDQUhSLENBQUE7QUFPQSxRQUFBLElBQUcsQ0FBQyxLQUFBLEdBQVEsU0FBUyxDQUFDLE9BQVYsQ0FBa0IsS0FBSyxDQUFDLGVBQXhCLENBQVQsQ0FBQSxHQUFxRCxDQUF4RDtBQUNFLFVBQUEsU0FBQSxJQUFhLENBQUEsU0FBVSxDQUFDLE1BQVgsR0FBb0IsS0FBcEIsR0FBNEIsS0FBSyxDQUFDLGVBQWUsQ0FBQyxNQUEvRCxDQUFBO0FBQUEsVUFDQSxTQUFBLEdBQVksS0FBSyxDQUFDLGVBRGxCLENBREY7U0FQQTtlQVdBO0FBQUEsVUFBQSxLQUFBLEVBQU8sS0FBUDtBQUFBLFVBQ0EsS0FBQSxFQUFPLFNBRFA7QUFBQSxVQUVBLFNBQUEsRUFBVyxTQUZYO0FBQUEsVUFHQSxLQUFBLEVBQU8sQ0FDTCxTQUFBLEdBQVksU0FBUyxDQUFDLE1BRGpCLEVBRUwsU0FGSyxDQUhQO0FBQUEsVUFPQSxJQUFBLEVBQU0sVUFBQSxDQUFXLElBQUsscURBQWhCLENBQUEsR0FBb0QsQ0FQMUQ7VUFaRjtPQU5NO0lBQUEsQ0FWUixDQUFBOzt3QkFBQTs7TUFKRixDQUFBO0FBQUEiCn0=

//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/pigments/lib/color-scanner.coffee
