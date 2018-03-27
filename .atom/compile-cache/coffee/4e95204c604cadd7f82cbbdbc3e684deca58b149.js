(function() {
  var path;

  path = require('path');

  module.exports = {
    config: {
      jsxhintExecutablePath: {
        type: 'string',
        "default": path.join(__dirname, '..', 'node_modules', '.bin'),
        description: 'Path of `jsxhint` executable.'
      },
      harmony: {
        type: 'boolean',
        "default": false,
        description: 'Use react esprima with ES6 transformation support.'
      }
    },
    activate: function() {
      return console.log('activate linter-jsxhint');
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvbGludGVyLWpzeGhpbnQvbGliL2luaXQuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLElBQUE7O0FBQUEsRUFBQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FBUCxDQUFBOztBQUFBLEVBRUEsTUFBTSxDQUFDLE9BQVAsR0FDRTtBQUFBLElBQUEsTUFBQSxFQUNFO0FBQUEsTUFBQSxxQkFBQSxFQUNFO0FBQUEsUUFBQSxJQUFBLEVBQU0sUUFBTjtBQUFBLFFBQ0EsU0FBQSxFQUFTLElBQUksQ0FBQyxJQUFMLENBQVUsU0FBVixFQUFxQixJQUFyQixFQUEyQixjQUEzQixFQUEyQyxNQUEzQyxDQURUO0FBQUEsUUFFQSxXQUFBLEVBQWEsK0JBRmI7T0FERjtBQUFBLE1BSUEsT0FBQSxFQUNFO0FBQUEsUUFBQSxJQUFBLEVBQU0sU0FBTjtBQUFBLFFBQ0EsU0FBQSxFQUFTLEtBRFQ7QUFBQSxRQUVBLFdBQUEsRUFBYSxvREFGYjtPQUxGO0tBREY7QUFBQSxJQVVBLFFBQUEsRUFBVSxTQUFBLEdBQUE7YUFDUixPQUFPLENBQUMsR0FBUixDQUFZLHlCQUFaLEVBRFE7SUFBQSxDQVZWO0dBSEYsQ0FBQTtBQUFBIgp9

//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/linter-jsxhint/lib/init.coffee
