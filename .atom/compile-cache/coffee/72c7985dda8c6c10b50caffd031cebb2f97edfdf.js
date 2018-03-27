(function() {
  var Range;

  Range = require('atom').Range;

  module.exports = {
    copyType: function(text) {
      if (text.lastIndexOf("\n") === text.length - 1) {
        return 'linewise';
      } else if (text.lastIndexOf("\r") === text.length - 1) {
        return 'linewise';
      } else {
        return 'character';
      }
    },
    mergeRanges: function(oldRange, newRange) {
      oldRange = Range.fromObject(oldRange);
      newRange = Range.fromObject(newRange);
      if (oldRange.isEmpty()) {
        return newRange;
      } else {
        return oldRange.union(newRange);
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUvbGliL3V0aWxzLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxLQUFBOztBQUFBLEVBQUMsUUFBUyxPQUFBLENBQVEsTUFBUixFQUFULEtBQUQsQ0FBQTs7QUFBQSxFQUVBLE1BQU0sQ0FBQyxPQUFQLEdBT0U7QUFBQSxJQUFBLFFBQUEsRUFBVSxTQUFDLElBQUQsR0FBQTtBQUNSLE1BQUEsSUFBRyxJQUFJLENBQUMsV0FBTCxDQUFpQixJQUFqQixDQUFBLEtBQTBCLElBQUksQ0FBQyxNQUFMLEdBQWMsQ0FBM0M7ZUFDRSxXQURGO09BQUEsTUFFSyxJQUFHLElBQUksQ0FBQyxXQUFMLENBQWlCLElBQWpCLENBQUEsS0FBMEIsSUFBSSxDQUFDLE1BQUwsR0FBYyxDQUEzQztlQUNILFdBREc7T0FBQSxNQUFBO2VBR0gsWUFIRztPQUhHO0lBQUEsQ0FBVjtBQUFBLElBV0EsV0FBQSxFQUFhLFNBQUMsUUFBRCxFQUFXLFFBQVgsR0FBQTtBQUNYLE1BQUEsUUFBQSxHQUFXLEtBQUssQ0FBQyxVQUFOLENBQWlCLFFBQWpCLENBQVgsQ0FBQTtBQUFBLE1BQ0EsUUFBQSxHQUFXLEtBQUssQ0FBQyxVQUFOLENBQWlCLFFBQWpCLENBRFgsQ0FBQTtBQUVBLE1BQUEsSUFBRyxRQUFRLENBQUMsT0FBVCxDQUFBLENBQUg7ZUFDRSxTQURGO09BQUEsTUFBQTtlQUdFLFFBQVEsQ0FBQyxLQUFULENBQWUsUUFBZixFQUhGO09BSFc7SUFBQSxDQVhiO0dBVEYsQ0FBQTtBQUFBIgp9

//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/vim-mode/lib/utils.coffee
