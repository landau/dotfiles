(function() {
  "use strict";
  var Beautifier, MarkoBeautifier,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Beautifier = require('./beautifier');

  module.exports = MarkoBeautifier = (function(_super) {
    __extends(MarkoBeautifier, _super);

    function MarkoBeautifier() {
      return MarkoBeautifier.__super__.constructor.apply(this, arguments);
    }

    MarkoBeautifier.prototype.name = 'Marko Beautifier';

    MarkoBeautifier.prototype.link = "https://github.com/marko-js/marko-prettyprint";

    MarkoBeautifier.prototype.options = {
      Marko: true
    };

    MarkoBeautifier.prototype.beautify = function(text, language, options, context) {
      return new this.Promise(function(resolve, reject) {
        var error, i, indent, indent_char, indent_size, markoPrettyprint, prettyprintOptions, _i, _ref;
        markoPrettyprint = require('marko-prettyprint');
        indent_char = options.indent_char || ' ';
        indent_size = options.indent_size || 4;
        indent = '';
        for (i = _i = 0, _ref = indent_size - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
          indent += indent_char;
        }
        prettyprintOptions = {
          syntax: options.syntax,
          filename: (context != null) && (context.filePath != null) ? context.filePath : require.resolve('marko-prettyprint'),
          indent: indent
        };
        try {
          return resolve(markoPrettyprint(text, prettyprintOptions));
        } catch (_error) {
          error = _error;
          return reject(error);
        }
      });
    };

    return MarkoBeautifier;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvYXRvbS1iZWF1dGlmeS9zcmMvYmVhdXRpZmllcnMvbWFya28tYmVhdXRpZmllci5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLEVBQUEsWUFBQSxDQUFBO0FBQUEsTUFBQSwyQkFBQTtJQUFBO21TQUFBOztBQUFBLEVBQ0EsVUFBQSxHQUFhLE9BQUEsQ0FBUSxjQUFSLENBRGIsQ0FBQTs7QUFBQSxFQUdBLE1BQU0sQ0FBQyxPQUFQLEdBQXVCO0FBRXJCLHNDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSw4QkFBQSxJQUFBLEdBQU0sa0JBQU4sQ0FBQTs7QUFBQSw4QkFDQSxJQUFBLEdBQU0sK0NBRE4sQ0FBQTs7QUFBQSw4QkFHQSxPQUFBLEdBQ0U7QUFBQSxNQUFBLEtBQUEsRUFBTyxJQUFQO0tBSkYsQ0FBQTs7QUFBQSw4QkFNQSxRQUFBLEdBQVUsU0FBQyxJQUFELEVBQU8sUUFBUCxFQUFpQixPQUFqQixFQUEwQixPQUExQixHQUFBO0FBRVIsYUFBVyxJQUFBLElBQUMsQ0FBQSxPQUFELENBQVMsU0FBQyxPQUFELEVBQVUsTUFBVixHQUFBO0FBQ2xCLFlBQUEsMEZBQUE7QUFBQSxRQUFBLGdCQUFBLEdBQW1CLE9BQUEsQ0FBUSxtQkFBUixDQUFuQixDQUFBO0FBQUEsUUFFQSxXQUFBLEdBQWMsT0FBTyxDQUFDLFdBQVIsSUFBdUIsR0FGckMsQ0FBQTtBQUFBLFFBR0EsV0FBQSxHQUFjLE9BQU8sQ0FBQyxXQUFSLElBQXVCLENBSHJDLENBQUE7QUFBQSxRQUtBLE1BQUEsR0FBUyxFQUxULENBQUE7QUFPQSxhQUFTLG9HQUFULEdBQUE7QUFDRSxVQUFBLE1BQUEsSUFBVSxXQUFWLENBREY7QUFBQSxTQVBBO0FBQUEsUUFVQSxrQkFBQSxHQUNFO0FBQUEsVUFBQSxNQUFBLEVBQVMsT0FBTyxDQUFDLE1BQWpCO0FBQUEsVUFDQSxRQUFBLEVBQWEsaUJBQUEsSUFBYSwwQkFBaEIsR0FBdUMsT0FBTyxDQUFDLFFBQS9DLEdBQTZELE9BQU8sQ0FBQyxPQUFSLENBQWdCLG1CQUFoQixDQUR2RTtBQUFBLFVBRUEsTUFBQSxFQUFRLE1BRlI7U0FYRixDQUFBO0FBZUE7aUJBQ0UsT0FBQSxDQUFRLGdCQUFBLENBQWlCLElBQWpCLEVBQXVCLGtCQUF2QixDQUFSLEVBREY7U0FBQSxjQUFBO0FBSUUsVUFGSSxjQUVKLENBQUE7aUJBQUEsTUFBQSxDQUFPLEtBQVAsRUFKRjtTQWhCa0I7TUFBQSxDQUFULENBQVgsQ0FGUTtJQUFBLENBTlYsQ0FBQTs7MkJBQUE7O0tBRjZDLFdBSC9DLENBQUE7QUFBQSIKfQ==

//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/atom-beautify/src/beautifiers/marko-beautifier.coffee
