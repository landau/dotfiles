
/*
Requires http://uncrustify.sourceforge.net/
 */

(function() {
  "use strict";
  var Beautifier, Uncrustify, _, cfg, expandHomeDir, path,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('../beautifier');

  cfg = require("./cfg");

  path = require("path");

  expandHomeDir = require('expand-home-dir');

  _ = require('lodash');

  module.exports = Uncrustify = (function(superClass) {
    extend(Uncrustify, superClass);

    function Uncrustify() {
      return Uncrustify.__super__.constructor.apply(this, arguments);
    }

    Uncrustify.prototype.name = "Uncrustify";

    Uncrustify.prototype.link = "https://github.com/uncrustify/uncrustify";

    Uncrustify.prototype.isPreInstalled = false;

    Uncrustify.prototype.options = {
      Apex: true,
      C: true,
      "C++": true,
      "C#": true,
      "Objective-C": true,
      D: true,
      Pawn: true,
      Vala: true,
      Java: true,
      Arduino: true
    };

    Uncrustify.prototype.beautify = function(text, language, options) {
      return new this.Promise(function(resolve, reject) {
        var basePath, configPath, editor, expandedConfigPath, projectPath;
        configPath = options.configPath;
        if (!configPath) {
          return cfg(options, function(error, cPath) {
            if (error) {
              throw error;
            }
            return resolve(cPath);
          });
        } else {
          editor = atom.workspace.getActiveTextEditor();
          if (editor != null) {
            basePath = path.dirname(editor.getPath());
            projectPath = atom.workspace.project.getPaths()[0];
            expandedConfigPath = expandHomeDir(configPath);
            configPath = path.resolve(projectPath, expandedConfigPath);
            return resolve(configPath);
          } else {
            return reject(new Error("No Uncrustify Config Path set! Please configure Uncrustify with Atom Beautify."));
          }
        }
      }).then((function(_this) {
        return function(configPath) {
          var lang, outputFile;
          lang = "C";
          switch (language) {
            case "Apex":
              lang = "Apex";
              break;
            case "C":
              lang = "C";
              break;
            case "C++":
              lang = "CPP";
              break;
            case "C#":
              lang = "CS";
              break;
            case "Objective-C":
            case "Objective-C++":
              lang = "OC+";
              break;
            case "D":
              lang = "D";
              break;
            case "Pawn":
              lang = "PAWN";
              break;
            case "Vala":
              lang = "VALA";
              break;
            case "Java":
              lang = "JAVA";
              break;
            case "Arduino":
              lang = "CPP";
          }
          return _this.run("uncrustify", ["-c", configPath, "-f", _this.tempFile("input", text), "-o", outputFile = _this.tempFile("output", text), "-l", lang], {
            help: {
              link: "http://sourceforge.net/projects/uncrustify/"
            }
          }).then(function() {
            return _this.readFile(outputFile);
          });
        };
      })(this));
    };

    return Uncrustify;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvYXRvbS1iZWF1dGlmeS9zcmMvYmVhdXRpZmllcnMvdW5jcnVzdGlmeS9pbmRleC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7O0FBQUE7RUFHQTtBQUhBLE1BQUEsbURBQUE7SUFBQTs7O0VBSUEsVUFBQSxHQUFhLE9BQUEsQ0FBUSxlQUFSOztFQUNiLEdBQUEsR0FBTSxPQUFBLENBQVEsT0FBUjs7RUFDTixJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7O0VBQ1AsYUFBQSxHQUFnQixPQUFBLENBQVEsaUJBQVI7O0VBQ2hCLENBQUEsR0FBSSxPQUFBLENBQVEsUUFBUjs7RUFFSixNQUFNLENBQUMsT0FBUCxHQUF1Qjs7Ozs7Ozt5QkFDckIsSUFBQSxHQUFNOzt5QkFDTixJQUFBLEdBQU07O3lCQUNOLGNBQUEsR0FBZ0I7O3lCQUVoQixPQUFBLEdBQVM7TUFDUCxJQUFBLEVBQU0sSUFEQztNQUVQLENBQUEsRUFBRyxJQUZJO01BR1AsS0FBQSxFQUFPLElBSEE7TUFJUCxJQUFBLEVBQU0sSUFKQztNQUtQLGFBQUEsRUFBZSxJQUxSO01BTVAsQ0FBQSxFQUFHLElBTkk7TUFPUCxJQUFBLEVBQU0sSUFQQztNQVFQLElBQUEsRUFBTSxJQVJDO01BU1AsSUFBQSxFQUFNLElBVEM7TUFVUCxPQUFBLEVBQVMsSUFWRjs7O3lCQWFULFFBQUEsR0FBVSxTQUFDLElBQUQsRUFBTyxRQUFQLEVBQWlCLE9BQWpCO0FBRVIsYUFBVyxJQUFBLElBQUMsQ0FBQSxPQUFELENBQVMsU0FBQyxPQUFELEVBQVUsTUFBVjtBQUNsQixZQUFBO1FBQUEsVUFBQSxHQUFhLE9BQU8sQ0FBQztRQUNyQixJQUFBLENBQU8sVUFBUDtpQkFFRSxHQUFBLENBQUksT0FBSixFQUFhLFNBQUMsS0FBRCxFQUFRLEtBQVI7WUFDWCxJQUFlLEtBQWY7QUFBQSxvQkFBTSxNQUFOOzttQkFDQSxPQUFBLENBQVEsS0FBUjtVQUZXLENBQWIsRUFGRjtTQUFBLE1BQUE7VUFPRSxNQUFBLEdBQVMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBZixDQUFBO1VBQ1QsSUFBRyxjQUFIO1lBQ0UsUUFBQSxHQUFXLElBQUksQ0FBQyxPQUFMLENBQWEsTUFBTSxDQUFDLE9BQVAsQ0FBQSxDQUFiO1lBQ1gsV0FBQSxHQUFjLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLFFBQXZCLENBQUEsQ0FBa0MsQ0FBQSxDQUFBO1lBR2hELGtCQUFBLEdBQXFCLGFBQUEsQ0FBYyxVQUFkO1lBQ3JCLFVBQUEsR0FBYSxJQUFJLENBQUMsT0FBTCxDQUFhLFdBQWIsRUFBMEIsa0JBQTFCO21CQUNiLE9BQUEsQ0FBUSxVQUFSLEVBUEY7V0FBQSxNQUFBO21CQVNFLE1BQUEsQ0FBVyxJQUFBLEtBQUEsQ0FBTSxnRkFBTixDQUFYLEVBVEY7V0FSRjs7TUFGa0IsQ0FBVCxDQXFCWCxDQUFDLElBckJVLENBcUJMLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxVQUFEO0FBSUosY0FBQTtVQUFBLElBQUEsR0FBTztBQUNQLGtCQUFPLFFBQVA7QUFBQSxpQkFDTyxNQURQO2NBRUksSUFBQSxHQUFPO0FBREo7QUFEUCxpQkFHTyxHQUhQO2NBSUksSUFBQSxHQUFPO0FBREo7QUFIUCxpQkFLTyxLQUxQO2NBTUksSUFBQSxHQUFPO0FBREo7QUFMUCxpQkFPTyxJQVBQO2NBUUksSUFBQSxHQUFPO0FBREo7QUFQUCxpQkFTTyxhQVRQO0FBQUEsaUJBU3NCLGVBVHRCO2NBVUksSUFBQSxHQUFPO0FBRFc7QUFUdEIsaUJBV08sR0FYUDtjQVlJLElBQUEsR0FBTztBQURKO0FBWFAsaUJBYU8sTUFiUDtjQWNJLElBQUEsR0FBTztBQURKO0FBYlAsaUJBZU8sTUFmUDtjQWdCSSxJQUFBLEdBQU87QUFESjtBQWZQLGlCQWlCTyxNQWpCUDtjQWtCSSxJQUFBLEdBQU87QUFESjtBQWpCUCxpQkFtQk8sU0FuQlA7Y0FvQkksSUFBQSxHQUFPO0FBcEJYO2lCQXNCQSxLQUFDLENBQUEsR0FBRCxDQUFLLFlBQUwsRUFBbUIsQ0FDakIsSUFEaUIsRUFFakIsVUFGaUIsRUFHakIsSUFIaUIsRUFJakIsS0FBQyxDQUFBLFFBQUQsQ0FBVSxPQUFWLEVBQW1CLElBQW5CLENBSmlCLEVBS2pCLElBTGlCLEVBTWpCLFVBQUEsR0FBYSxLQUFDLENBQUEsUUFBRCxDQUFVLFFBQVYsRUFBb0IsSUFBcEIsQ0FOSSxFQU9qQixJQVBpQixFQVFqQixJQVJpQixDQUFuQixFQVNLO1lBQUEsSUFBQSxFQUFNO2NBQ1AsSUFBQSxFQUFNLDZDQURDO2FBQU47V0FUTCxDQVlFLENBQUMsSUFaSCxDQVlRLFNBQUE7bUJBQ0osS0FBQyxDQUFBLFFBQUQsQ0FBVSxVQUFWO1VBREksQ0FaUjtRQTNCSTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FyQks7SUFGSDs7OztLQWxCOEI7QUFWMUMiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcblJlcXVpcmVzIGh0dHA6Ly91bmNydXN0aWZ5LnNvdXJjZWZvcmdlLm5ldC9cbiMjI1xuXCJ1c2Ugc3RyaWN0XCJcbkJlYXV0aWZpZXIgPSByZXF1aXJlKCcuLi9iZWF1dGlmaWVyJylcbmNmZyA9IHJlcXVpcmUoXCIuL2NmZ1wiKVxucGF0aCA9IHJlcXVpcmUoXCJwYXRoXCIpXG5leHBhbmRIb21lRGlyID0gcmVxdWlyZSgnZXhwYW5kLWhvbWUtZGlyJylcbl8gPSByZXF1aXJlKCdsb2Rhc2gnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIFVuY3J1c3RpZnkgZXh0ZW5kcyBCZWF1dGlmaWVyXG4gIG5hbWU6IFwiVW5jcnVzdGlmeVwiXG4gIGxpbms6IFwiaHR0cHM6Ly9naXRodWIuY29tL3VuY3J1c3RpZnkvdW5jcnVzdGlmeVwiXG4gIGlzUHJlSW5zdGFsbGVkOiBmYWxzZVxuXG4gIG9wdGlvbnM6IHtcbiAgICBBcGV4OiB0cnVlXG4gICAgQzogdHJ1ZVxuICAgIFwiQysrXCI6IHRydWVcbiAgICBcIkMjXCI6IHRydWVcbiAgICBcIk9iamVjdGl2ZS1DXCI6IHRydWVcbiAgICBEOiB0cnVlXG4gICAgUGF3bjogdHJ1ZVxuICAgIFZhbGE6IHRydWVcbiAgICBKYXZhOiB0cnVlXG4gICAgQXJkdWlubzogdHJ1ZVxuICB9XG5cbiAgYmVhdXRpZnk6ICh0ZXh0LCBsYW5ndWFnZSwgb3B0aW9ucykgLT5cbiAgICAjIGNvbnNvbGUubG9nKCd1bmNydXN0aWZ5LmJlYXV0aWZ5JywgbGFuZ3VhZ2UsIG9wdGlvbnMpXG4gICAgcmV0dXJuIG5ldyBAUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSAtPlxuICAgICAgY29uZmlnUGF0aCA9IG9wdGlvbnMuY29uZmlnUGF0aFxuICAgICAgdW5sZXNzIGNvbmZpZ1BhdGhcbiAgICAgICAgIyBObyBjdXN0b20gY29uZmlnIHBhdGhcbiAgICAgICAgY2ZnIG9wdGlvbnMsIChlcnJvciwgY1BhdGgpIC0+XG4gICAgICAgICAgdGhyb3cgZXJyb3IgaWYgZXJyb3JcbiAgICAgICAgICByZXNvbHZlIGNQYXRoXG4gICAgICBlbHNlXG4gICAgICAgICMgSGFzIGN1c3RvbSBjb25maWcgcGF0aFxuICAgICAgICBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgICAgICAgaWYgZWRpdG9yP1xuICAgICAgICAgIGJhc2VQYXRoID0gcGF0aC5kaXJuYW1lKGVkaXRvci5nZXRQYXRoKCkpXG4gICAgICAgICAgcHJvamVjdFBhdGggPSBhdG9tLndvcmtzcGFjZS5wcm9qZWN0LmdldFBhdGhzKClbMF1cbiAgICAgICAgICAjIGNvbnNvbGUubG9nKGJhc2VQYXRoKTtcbiAgICAgICAgICAjIEV4cGFuZCBIb21lIERpcmVjdG9yeSBpbiBDb25maWcgUGF0aFxuICAgICAgICAgIGV4cGFuZGVkQ29uZmlnUGF0aCA9IGV4cGFuZEhvbWVEaXIoY29uZmlnUGF0aClcbiAgICAgICAgICBjb25maWdQYXRoID0gcGF0aC5yZXNvbHZlKHByb2plY3RQYXRoLCBleHBhbmRlZENvbmZpZ1BhdGgpXG4gICAgICAgICAgcmVzb2x2ZSBjb25maWdQYXRoXG4gICAgICAgIGVsc2VcbiAgICAgICAgICByZWplY3QobmV3IEVycm9yKFwiTm8gVW5jcnVzdGlmeSBDb25maWcgUGF0aCBzZXQhIFBsZWFzZSBjb25maWd1cmUgVW5jcnVzdGlmeSB3aXRoIEF0b20gQmVhdXRpZnkuXCIpKVxuICAgIClcbiAgICAudGhlbigoY29uZmlnUGF0aCkgPT5cblxuXG4gICAgICAjIFNlbGVjdCBVbmNydXN0aWZ5IGxhbmd1YWdlXG4gICAgICBsYW5nID0gXCJDXCIgIyBEZWZhdWx0IGlzIENcbiAgICAgIHN3aXRjaCBsYW5ndWFnZVxuICAgICAgICB3aGVuIFwiQXBleFwiXG4gICAgICAgICAgbGFuZyA9IFwiQXBleFwiXG4gICAgICAgIHdoZW4gXCJDXCJcbiAgICAgICAgICBsYW5nID0gXCJDXCJcbiAgICAgICAgd2hlbiBcIkMrK1wiXG4gICAgICAgICAgbGFuZyA9IFwiQ1BQXCJcbiAgICAgICAgd2hlbiBcIkMjXCJcbiAgICAgICAgICBsYW5nID0gXCJDU1wiXG4gICAgICAgIHdoZW4gXCJPYmplY3RpdmUtQ1wiLCBcIk9iamVjdGl2ZS1DKytcIlxuICAgICAgICAgIGxhbmcgPSBcIk9DK1wiXG4gICAgICAgIHdoZW4gXCJEXCJcbiAgICAgICAgICBsYW5nID0gXCJEXCJcbiAgICAgICAgd2hlbiBcIlBhd25cIlxuICAgICAgICAgIGxhbmcgPSBcIlBBV05cIlxuICAgICAgICB3aGVuIFwiVmFsYVwiXG4gICAgICAgICAgbGFuZyA9IFwiVkFMQVwiXG4gICAgICAgIHdoZW4gXCJKYXZhXCJcbiAgICAgICAgICBsYW5nID0gXCJKQVZBXCJcbiAgICAgICAgd2hlbiBcIkFyZHVpbm9cIlxuICAgICAgICAgIGxhbmcgPSBcIkNQUFwiXG5cbiAgICAgIEBydW4oXCJ1bmNydXN0aWZ5XCIsIFtcbiAgICAgICAgXCItY1wiXG4gICAgICAgIGNvbmZpZ1BhdGhcbiAgICAgICAgXCItZlwiXG4gICAgICAgIEB0ZW1wRmlsZShcImlucHV0XCIsIHRleHQpXG4gICAgICAgIFwiLW9cIlxuICAgICAgICBvdXRwdXRGaWxlID0gQHRlbXBGaWxlKFwib3V0cHV0XCIsIHRleHQpXG4gICAgICAgIFwiLWxcIlxuICAgICAgICBsYW5nXG4gICAgICAgIF0sIGhlbHA6IHtcbiAgICAgICAgICBsaW5rOiBcImh0dHA6Ly9zb3VyY2Vmb3JnZS5uZXQvcHJvamVjdHMvdW5jcnVzdGlmeS9cIlxuICAgICAgICB9KVxuICAgICAgICAudGhlbig9PlxuICAgICAgICAgIEByZWFkRmlsZShvdXRwdXRGaWxlKVxuICAgICAgICApXG4gICAgKVxuIl19
