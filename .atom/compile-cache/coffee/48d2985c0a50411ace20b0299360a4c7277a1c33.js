
/*
Requires https://github.com/nrc/rustfmt
 */

(function() {
  "use strict";
  var Beautifier, Rustfmt, path, versionCheckState,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Beautifier = require('./beautifier');

  path = require('path');

  versionCheckState = false;

  module.exports = Rustfmt = (function(_super) {
    __extends(Rustfmt, _super);

    function Rustfmt() {
      return Rustfmt.__super__.constructor.apply(this, arguments);
    }

    Rustfmt.prototype.name = "rustfmt";

    Rustfmt.prototype.options = {
      Rust: true
    };

    Rustfmt.prototype.beautify = function(text, language, options, context) {
      var cwd, help, p, program;
      cwd = context.filePath && path.dirname(context.filePath);
      program = options.rustfmt_path || "rustfmt";
      help = {
        link: "https://github.com/nrc/rustfmt",
        program: "rustfmt",
        pathOption: "Rust - Rustfmt Path"
      };
      p = versionCheckState === program ? this.Promise.resolve() : this.run(program, ["--version"], {
        help: help
      }).then(function(stdout) {
        if (/^0\.(?:[0-4]\.[0-9])/.test(stdout.trim())) {
          versionCheckState = false;
          throw new Error("rustfmt version 0.5.0 or newer required");
        } else {
          versionCheckState = program;
          return void 0;
        }
      });
      return p.then((function(_this) {
        return function() {
          return _this.run(program, [], {
            cwd: cwd,
            help: help,
            onStdin: function(stdin) {
              return stdin.end(text);
            }
          });
        };
      })(this));
    };

    return Rustfmt;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvYXRvbS1iZWF1dGlmeS9zcmMvYmVhdXRpZmllcnMvcnVzdGZtdC5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBOztHQUFBO0FBQUE7QUFBQTtBQUFBLEVBSUEsWUFKQSxDQUFBO0FBQUEsTUFBQSw0Q0FBQTtJQUFBO21TQUFBOztBQUFBLEVBS0EsVUFBQSxHQUFhLE9BQUEsQ0FBUSxjQUFSLENBTGIsQ0FBQTs7QUFBQSxFQU1BLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQU5QLENBQUE7O0FBQUEsRUFRQSxpQkFBQSxHQUFvQixLQVJwQixDQUFBOztBQUFBLEVBVUEsTUFBTSxDQUFDLE9BQVAsR0FBdUI7QUFDckIsOEJBQUEsQ0FBQTs7OztLQUFBOztBQUFBLHNCQUFBLElBQUEsR0FBTSxTQUFOLENBQUE7O0FBQUEsc0JBRUEsT0FBQSxHQUFTO0FBQUEsTUFDUCxJQUFBLEVBQU0sSUFEQztLQUZULENBQUE7O0FBQUEsc0JBTUEsUUFBQSxHQUFVLFNBQUMsSUFBRCxFQUFPLFFBQVAsRUFBaUIsT0FBakIsRUFBMEIsT0FBMUIsR0FBQTtBQUNSLFVBQUEscUJBQUE7QUFBQSxNQUFBLEdBQUEsR0FBTSxPQUFPLENBQUMsUUFBUixJQUFxQixJQUFJLENBQUMsT0FBTCxDQUFhLE9BQU8sQ0FBQyxRQUFyQixDQUEzQixDQUFBO0FBQUEsTUFDQSxPQUFBLEdBQVUsT0FBTyxDQUFDLFlBQVIsSUFBd0IsU0FEbEMsQ0FBQTtBQUFBLE1BRUEsSUFBQSxHQUFPO0FBQUEsUUFDTCxJQUFBLEVBQU0sZ0NBREQ7QUFBQSxRQUVMLE9BQUEsRUFBUyxTQUZKO0FBQUEsUUFHTCxVQUFBLEVBQVkscUJBSFA7T0FGUCxDQUFBO0FBQUEsTUFXQSxDQUFBLEdBQU8saUJBQUEsS0FBcUIsT0FBeEIsR0FDRixJQUFDLENBQUEsT0FBTyxDQUFDLE9BQVQsQ0FBQSxDQURFLEdBR0YsSUFBQyxDQUFBLEdBQUQsQ0FBSyxPQUFMLEVBQWMsQ0FBQyxXQUFELENBQWQsRUFBNkI7QUFBQSxRQUFBLElBQUEsRUFBTSxJQUFOO09BQTdCLENBQ0UsQ0FBQyxJQURILENBQ1EsU0FBQyxNQUFELEdBQUE7QUFDSixRQUFBLElBQUcsc0JBQXNCLENBQUMsSUFBdkIsQ0FBNEIsTUFBTSxDQUFDLElBQVAsQ0FBQSxDQUE1QixDQUFIO0FBQ0UsVUFBQSxpQkFBQSxHQUFvQixLQUFwQixDQUFBO0FBQ0EsZ0JBQVUsSUFBQSxLQUFBLENBQU0seUNBQU4sQ0FBVixDQUZGO1NBQUEsTUFBQTtBQUlFLFVBQUEsaUJBQUEsR0FBb0IsT0FBcEIsQ0FBQTtpQkFDQSxPQUxGO1NBREk7TUFBQSxDQURSLENBZEYsQ0FBQTthQXdCQSxDQUFDLENBQUMsSUFBRixDQUFPLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7aUJBQ0wsS0FBQyxDQUFBLEdBQUQsQ0FBSyxPQUFMLEVBQWMsRUFBZCxFQUFrQjtBQUFBLFlBQ2hCLEdBQUEsRUFBSyxHQURXO0FBQUEsWUFFaEIsSUFBQSxFQUFNLElBRlU7QUFBQSxZQUdoQixPQUFBLEVBQVMsU0FBQyxLQUFELEdBQUE7cUJBQ1AsS0FBSyxDQUFDLEdBQU4sQ0FBVSxJQUFWLEVBRE87WUFBQSxDQUhPO1dBQWxCLEVBREs7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFQLEVBekJRO0lBQUEsQ0FOVixDQUFBOzttQkFBQTs7S0FEcUMsV0FWdkMsQ0FBQTtBQUFBIgp9

//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/atom-beautify/src/beautifiers/rustfmt.coffee
