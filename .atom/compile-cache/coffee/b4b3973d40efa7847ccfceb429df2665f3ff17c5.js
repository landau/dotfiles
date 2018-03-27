(function() {
  var path;

  path = require('path');

  module.exports = function(p) {
    if (p == null) {
      return;
    }
    if (p.match(/\/\.pigments$/)) {
      return 'pigments';
    } else {
      return path.extname(p).slice(1);
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvcGlnbWVudHMvbGliL3Njb3BlLWZyb20tZmlsZS1uYW1lLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxJQUFBOztBQUFBLEVBQUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSLENBQVAsQ0FBQTs7QUFBQSxFQUNBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFNBQUMsQ0FBRCxHQUFBO0FBQ2YsSUFBQSxJQUFjLFNBQWQ7QUFBQSxZQUFBLENBQUE7S0FBQTtBQUNBLElBQUEsSUFBRyxDQUFDLENBQUMsS0FBRixDQUFRLGVBQVIsQ0FBSDthQUFpQyxXQUFqQztLQUFBLE1BQUE7YUFBaUQsSUFBSSxDQUFDLE9BQUwsQ0FBYSxDQUFiLENBQWdCLFVBQWpFO0tBRmU7RUFBQSxDQURqQixDQUFBO0FBQUEiCn0=

//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/pigments/lib/scope-from-file-name.coffee
