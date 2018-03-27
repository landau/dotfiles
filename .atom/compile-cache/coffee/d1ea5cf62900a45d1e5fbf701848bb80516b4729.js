(function() {
  "use strict";
  var Beautifier, ESLintFixer, Path, allowUnsafeNewFunction,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  Path = require('path');

  allowUnsafeNewFunction = require('loophole').allowUnsafeNewFunction;

  module.exports = ESLintFixer = (function(superClass) {
    extend(ESLintFixer, superClass);

    function ESLintFixer() {
      return ESLintFixer.__super__.constructor.apply(this, arguments);
    }

    ESLintFixer.prototype.name = "ESLint Fixer";

    ESLintFixer.prototype.link = "https://github.com/eslint/eslint";

    ESLintFixer.prototype.options = {
      JavaScript: false
    };

    ESLintFixer.prototype.beautify = function(text, language, options) {
      return new this.Promise(function(resolve, reject) {
        var editor, filePath, projectPath, result;
        editor = atom.workspace.getActiveTextEditor();
        filePath = editor.getPath();
        projectPath = atom.project.relativizePath(filePath)[0];
        result = null;
        return allowUnsafeNewFunction(function() {
          var CLIEngine, cli, err, importPath;
          importPath = Path.join(projectPath, 'node_modules', 'eslint');
          try {
            CLIEngine = require(importPath).CLIEngine;
            cli = new CLIEngine({
              fix: true,
              cwd: projectPath
            });
            result = cli.executeOnText(text).results[0];
            return resolve(result.output);
          } catch (error) {
            err = error;
            return reject(err);
          }
        });
      });
    };

    return ESLintFixer;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvYXRvbS1iZWF1dGlmeS9zcmMvYmVhdXRpZmllcnMvZXNsaW50LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtFQUFBO0FBQUEsTUFBQSxxREFBQTtJQUFBOzs7RUFFQSxVQUFBLEdBQWEsT0FBQSxDQUFRLGNBQVI7O0VBQ2IsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUNOLHlCQUEwQixPQUFBLENBQVEsVUFBUjs7RUFFM0IsTUFBTSxDQUFDLE9BQVAsR0FBdUI7Ozs7Ozs7MEJBQ3JCLElBQUEsR0FBTTs7MEJBQ04sSUFBQSxHQUFNOzswQkFFTixPQUFBLEdBQVM7TUFDUCxVQUFBLEVBQVksS0FETDs7OzBCQUlULFFBQUEsR0FBVSxTQUFDLElBQUQsRUFBTyxRQUFQLEVBQWlCLE9BQWpCO0FBQ1IsYUFBVyxJQUFBLElBQUMsQ0FBQSxPQUFELENBQVMsU0FBQyxPQUFELEVBQVUsTUFBVjtBQUNsQixZQUFBO1FBQUEsTUFBQSxHQUFTLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQWYsQ0FBQTtRQUNULFFBQUEsR0FBVyxNQUFNLENBQUMsT0FBUCxDQUFBO1FBQ1gsV0FBQSxHQUFjLElBQUksQ0FBQyxPQUFPLENBQUMsY0FBYixDQUE0QixRQUE1QixDQUFzQyxDQUFBLENBQUE7UUFFcEQsTUFBQSxHQUFTO2VBQ1Qsc0JBQUEsQ0FBdUIsU0FBQTtBQUNyQixjQUFBO1VBQUEsVUFBQSxHQUFhLElBQUksQ0FBQyxJQUFMLENBQVUsV0FBVixFQUF1QixjQUF2QixFQUF1QyxRQUF2QztBQUNiO1lBQ0UsU0FBQSxHQUFZLE9BQUEsQ0FBUSxVQUFSLENBQW1CLENBQUM7WUFFaEMsR0FBQSxHQUFVLElBQUEsU0FBQSxDQUFVO2NBQUEsR0FBQSxFQUFLLElBQUw7Y0FBVyxHQUFBLEVBQUssV0FBaEI7YUFBVjtZQUNWLE1BQUEsR0FBUyxHQUFHLENBQUMsYUFBSixDQUFrQixJQUFsQixDQUF1QixDQUFDLE9BQVEsQ0FBQSxDQUFBO21CQUV6QyxPQUFBLENBQVEsTUFBTSxDQUFDLE1BQWYsRUFORjtXQUFBLGFBQUE7WUFPTTttQkFDSixNQUFBLENBQU8sR0FBUCxFQVJGOztRQUZxQixDQUF2QjtNQU5rQixDQUFUO0lBREg7Ozs7S0FSK0I7QUFOM0MiLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIlxuXG5CZWF1dGlmaWVyID0gcmVxdWlyZSgnLi9iZWF1dGlmaWVyJylcblBhdGggPSByZXF1aXJlKCdwYXRoJylcbnthbGxvd1Vuc2FmZU5ld0Z1bmN0aW9ufSA9IHJlcXVpcmUgJ2xvb3Bob2xlJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIEVTTGludEZpeGVyIGV4dGVuZHMgQmVhdXRpZmllclxuICBuYW1lOiBcIkVTTGludCBGaXhlclwiXG4gIGxpbms6IFwiaHR0cHM6Ly9naXRodWIuY29tL2VzbGludC9lc2xpbnRcIlxuXG4gIG9wdGlvbnM6IHtcbiAgICBKYXZhU2NyaXB0OiBmYWxzZVxuICB9XG5cbiAgYmVhdXRpZnk6ICh0ZXh0LCBsYW5ndWFnZSwgb3B0aW9ucykgLT5cbiAgICByZXR1cm4gbmV3IEBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpIC0+XG4gICAgICBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgICAgIGZpbGVQYXRoID0gZWRpdG9yLmdldFBhdGgoKVxuICAgICAgcHJvamVjdFBhdGggPSBhdG9tLnByb2plY3QucmVsYXRpdml6ZVBhdGgoZmlsZVBhdGgpWzBdXG5cbiAgICAgIHJlc3VsdCA9IG51bGxcbiAgICAgIGFsbG93VW5zYWZlTmV3RnVuY3Rpb24gLT5cbiAgICAgICAgaW1wb3J0UGF0aCA9IFBhdGguam9pbihwcm9qZWN0UGF0aCwgJ25vZGVfbW9kdWxlcycsICdlc2xpbnQnKVxuICAgICAgICB0cnlcbiAgICAgICAgICBDTElFbmdpbmUgPSByZXF1aXJlKGltcG9ydFBhdGgpLkNMSUVuZ2luZVxuXG4gICAgICAgICAgY2xpID0gbmV3IENMSUVuZ2luZShmaXg6IHRydWUsIGN3ZDogcHJvamVjdFBhdGgpXG4gICAgICAgICAgcmVzdWx0ID0gY2xpLmV4ZWN1dGVPblRleHQodGV4dCkucmVzdWx0c1swXVxuXG4gICAgICAgICAgcmVzb2x2ZSByZXN1bHQub3V0cHV0XG4gICAgICAgIGNhdGNoIGVyclxuICAgICAgICAgIHJlamVjdChlcnIpXG4gICAgKVxuIl19
