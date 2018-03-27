(function() {
  var settings;

  settings = {
    config: {
      startInInsertMode: {
        type: 'boolean',
        "default": false
      },
      useSmartcaseForSearch: {
        type: 'boolean',
        "default": false
      },
      wrapLeftRightMotion: {
        type: 'boolean',
        "default": false
      },
      useClipboardAsDefaultRegister: {
        type: 'boolean',
        "default": true
      },
      numberRegex: {
        type: 'string',
        "default": '-?[0-9]+',
        description: 'Use this to control how Ctrl-A/Ctrl-X finds numbers; use "(?:\\B-)?[0-9]+" to treat numbers as positive if the minus is preceded by a character, e.g. in "identifier-1".'
      }
    }
  };

  Object.keys(settings.config).forEach(function(k) {
    return settings[k] = function() {
      return atom.config.get('vim-mode.' + k);
    };
  });

  settings.defaultRegister = function() {
    if (settings.useClipboardAsDefaultRegister()) {
      return '*';
    } else {
      return '"';
    }
  };

  module.exports = settings;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUvbGliL3NldHRpbmdzLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUNBO0FBQUEsTUFBQSxRQUFBOztBQUFBLEVBQUEsUUFBQSxHQUNFO0FBQUEsSUFBQSxNQUFBLEVBQ0U7QUFBQSxNQUFBLGlCQUFBLEVBQ0U7QUFBQSxRQUFBLElBQUEsRUFBTSxTQUFOO0FBQUEsUUFDQSxTQUFBLEVBQVMsS0FEVDtPQURGO0FBQUEsTUFHQSxxQkFBQSxFQUNFO0FBQUEsUUFBQSxJQUFBLEVBQU0sU0FBTjtBQUFBLFFBQ0EsU0FBQSxFQUFTLEtBRFQ7T0FKRjtBQUFBLE1BTUEsbUJBQUEsRUFDRTtBQUFBLFFBQUEsSUFBQSxFQUFNLFNBQU47QUFBQSxRQUNBLFNBQUEsRUFBUyxLQURUO09BUEY7QUFBQSxNQVNBLDZCQUFBLEVBQ0U7QUFBQSxRQUFBLElBQUEsRUFBTSxTQUFOO0FBQUEsUUFDQSxTQUFBLEVBQVMsSUFEVDtPQVZGO0FBQUEsTUFZQSxXQUFBLEVBQ0U7QUFBQSxRQUFBLElBQUEsRUFBTSxRQUFOO0FBQUEsUUFDQSxTQUFBLEVBQVMsVUFEVDtBQUFBLFFBRUEsV0FBQSxFQUFhLDBLQUZiO09BYkY7S0FERjtHQURGLENBQUE7O0FBQUEsRUFtQkEsTUFBTSxDQUFDLElBQVAsQ0FBWSxRQUFRLENBQUMsTUFBckIsQ0FBNEIsQ0FBQyxPQUE3QixDQUFxQyxTQUFDLENBQUQsR0FBQTtXQUNuQyxRQUFTLENBQUEsQ0FBQSxDQUFULEdBQWMsU0FBQSxHQUFBO2FBQ1osSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLFdBQUEsR0FBWSxDQUE1QixFQURZO0lBQUEsRUFEcUI7RUFBQSxDQUFyQyxDQW5CQSxDQUFBOztBQUFBLEVBdUJBLFFBQVEsQ0FBQyxlQUFULEdBQTJCLFNBQUEsR0FBQTtBQUN6QixJQUFBLElBQUcsUUFBUSxDQUFDLDZCQUFULENBQUEsQ0FBSDthQUFpRCxJQUFqRDtLQUFBLE1BQUE7YUFBMEQsSUFBMUQ7S0FEeUI7RUFBQSxDQXZCM0IsQ0FBQTs7QUFBQSxFQTBCQSxNQUFNLENBQUMsT0FBUCxHQUFpQixRQTFCakIsQ0FBQTtBQUFBIgp9

//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/vim-mode/lib/settings.coffee
