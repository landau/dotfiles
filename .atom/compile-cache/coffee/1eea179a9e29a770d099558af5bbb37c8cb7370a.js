
/*
Requires https://github.com/hhatto/autopep8
 */

(function() {
  "use strict";
  var Autopep8, Beautifier,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  module.exports = Autopep8 = (function(superClass) {
    extend(Autopep8, superClass);

    function Autopep8() {
      return Autopep8.__super__.constructor.apply(this, arguments);
    }

    Autopep8.prototype.name = "autopep8";

    Autopep8.prototype.link = "https://github.com/hhatto/autopep8";

    Autopep8.prototype.executables = [
      {
        name: "autopep8",
        cmd: "autopep8",
        homepage: "https://github.com/hhatto/autopep8",
        installation: "https://github.com/hhatto/autopep8#installation",
        version: {
          parse: function(text) {
            return text.match(/autopep8 (\d+\.\d+\.\d+)/)[1];
          },
          runOptions: {
            returnStderr: true
          }
        },
        docker: {
          image: "unibeautify/autopep8"
        }
      }, {
        name: "isort",
        cmd: "isort",
        optional: true,
        homepage: "https://github.com/timothycrosley/isort",
        installation: "https://github.com/timothycrosley/isort#installing-isort",
        version: {
          parse: function(text) {
            return text.match(/VERSION (\d+\.\d+\.\d+)/)[1];
          }
        }
      }
    ];

    Autopep8.prototype.options = {
      Python: true
    };

    Autopep8.prototype.beautify = function(text, language, options) {
      var tempFile;
      return this.exe("autopep8").run([tempFile = this.tempFile("input", text), "-i", options.max_line_length != null ? ["--max-line-length", "" + options.max_line_length] : void 0, options.indent_size != null ? ["--indent-size", "" + options.indent_size] : void 0, options.ignore != null ? ["--ignore", "" + (options.ignore.join(','))] : void 0]).then((function(_this) {
        return function() {
          var editor, filePath, projectPath;
          if (options.sort_imports) {
            editor = atom.workspace.getActiveTextEditor();
            filePath = editor.getPath();
            projectPath = atom.project.relativizePath(filePath)[0];
            return _this.exe("isort").run(["-sp", projectPath, tempFile]).then(function() {
              return _this.readFile(tempFile);
            });
          } else {
            return _this.readFile(tempFile);
          }
        };
      })(this));
    };

    return Autopep8;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvYXRvbS1iZWF1dGlmeS9zcmMvYmVhdXRpZmllcnMvYXV0b3BlcDguY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7OztBQUFBO0VBSUE7QUFKQSxNQUFBLG9CQUFBO0lBQUE7OztFQUtBLFVBQUEsR0FBYSxPQUFBLENBQVEsY0FBUjs7RUFFYixNQUFNLENBQUMsT0FBUCxHQUF1Qjs7Ozs7Ozt1QkFFckIsSUFBQSxHQUFNOzt1QkFDTixJQUFBLEdBQU07O3VCQUNOLFdBQUEsR0FBYTtNQUNYO1FBQ0UsSUFBQSxFQUFNLFVBRFI7UUFFRSxHQUFBLEVBQUssVUFGUDtRQUdFLFFBQUEsRUFBVSxvQ0FIWjtRQUlFLFlBQUEsRUFBYyxpREFKaEI7UUFLRSxPQUFBLEVBQVM7VUFDUCxLQUFBLEVBQU8sU0FBQyxJQUFEO21CQUFVLElBQUksQ0FBQyxLQUFMLENBQVcsMEJBQVgsQ0FBdUMsQ0FBQSxDQUFBO1VBQWpELENBREE7VUFFUCxVQUFBLEVBQVk7WUFDVixZQUFBLEVBQWMsSUFESjtXQUZMO1NBTFg7UUFXRSxNQUFBLEVBQVE7VUFDTixLQUFBLEVBQU8sc0JBREQ7U0FYVjtPQURXLEVBZ0JYO1FBQ0UsSUFBQSxFQUFNLE9BRFI7UUFFRSxHQUFBLEVBQUssT0FGUDtRQUdFLFFBQUEsRUFBVSxJQUhaO1FBSUUsUUFBQSxFQUFVLHlDQUpaO1FBS0UsWUFBQSxFQUFjLDBEQUxoQjtRQU1FLE9BQUEsRUFBUztVQUNQLEtBQUEsRUFBTyxTQUFDLElBQUQ7bUJBQVUsSUFBSSxDQUFDLEtBQUwsQ0FBVyx5QkFBWCxDQUFzQyxDQUFBLENBQUE7VUFBaEQsQ0FEQTtTQU5YO09BaEJXOzs7dUJBNEJiLE9BQUEsR0FBUztNQUNQLE1BQUEsRUFBUSxJQUREOzs7dUJBSVQsUUFBQSxHQUFVLFNBQUMsSUFBRCxFQUFPLFFBQVAsRUFBaUIsT0FBakI7QUFDUixVQUFBO2FBQUEsSUFBQyxDQUFBLEdBQUQsQ0FBSyxVQUFMLENBQWdCLENBQUMsR0FBakIsQ0FBcUIsQ0FDakIsUUFBQSxHQUFXLElBQUMsQ0FBQSxRQUFELENBQVUsT0FBVixFQUFtQixJQUFuQixDQURNLEVBRWpCLElBRmlCLEVBR3NDLCtCQUF2RCxHQUFBLENBQUMsbUJBQUQsRUFBc0IsRUFBQSxHQUFHLE9BQU8sQ0FBQyxlQUFqQyxDQUFBLEdBQUEsTUFIaUIsRUFJNkIsMkJBQTlDLEdBQUEsQ0FBQyxlQUFELEVBQWlCLEVBQUEsR0FBRyxPQUFPLENBQUMsV0FBNUIsQ0FBQSxHQUFBLE1BSmlCLEVBSzZCLHNCQUE5QyxHQUFBLENBQUMsVUFBRCxFQUFZLEVBQUEsR0FBRSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBZixDQUFvQixHQUFwQixDQUFELENBQWQsQ0FBQSxHQUFBLE1BTGlCLENBQXJCLENBT0UsQ0FBQyxJQVBILENBT1EsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO0FBQ0osY0FBQTtVQUFBLElBQUcsT0FBTyxDQUFDLFlBQVg7WUFDRSxNQUFBLEdBQVMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBZixDQUFBO1lBQ1QsUUFBQSxHQUFXLE1BQU0sQ0FBQyxPQUFQLENBQUE7WUFDWCxXQUFBLEdBQWMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxjQUFiLENBQTRCLFFBQTVCLENBQXNDLENBQUEsQ0FBQTttQkFFcEQsS0FBQyxDQUFBLEdBQUQsQ0FBSyxPQUFMLENBQ0UsQ0FBQyxHQURILENBRUksQ0FBQyxLQUFELEVBQVEsV0FBUixFQUFxQixRQUFyQixDQUZKLENBSUUsQ0FBQyxJQUpILENBSVEsU0FBQTtxQkFDSixLQUFDLENBQUEsUUFBRCxDQUFVLFFBQVY7WUFESSxDQUpSLEVBTEY7V0FBQSxNQUFBO21CQWFFLEtBQUMsQ0FBQSxRQUFELENBQVUsUUFBVixFQWJGOztRQURJO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQVBSO0lBRFE7Ozs7S0FwQzRCO0FBUHhDIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG5SZXF1aXJlcyBodHRwczovL2dpdGh1Yi5jb20vaGhhdHRvL2F1dG9wZXA4XG4jIyNcblxuXCJ1c2Ugc3RyaWN0XCJcbkJlYXV0aWZpZXIgPSByZXF1aXJlKCcuL2JlYXV0aWZpZXInKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIEF1dG9wZXA4IGV4dGVuZHMgQmVhdXRpZmllclxuXG4gIG5hbWU6IFwiYXV0b3BlcDhcIlxuICBsaW5rOiBcImh0dHBzOi8vZ2l0aHViLmNvbS9oaGF0dG8vYXV0b3BlcDhcIlxuICBleGVjdXRhYmxlczogW1xuICAgIHtcbiAgICAgIG5hbWU6IFwiYXV0b3BlcDhcIlxuICAgICAgY21kOiBcImF1dG9wZXA4XCJcbiAgICAgIGhvbWVwYWdlOiBcImh0dHBzOi8vZ2l0aHViLmNvbS9oaGF0dG8vYXV0b3BlcDhcIlxuICAgICAgaW5zdGFsbGF0aW9uOiBcImh0dHBzOi8vZ2l0aHViLmNvbS9oaGF0dG8vYXV0b3BlcDgjaW5zdGFsbGF0aW9uXCJcbiAgICAgIHZlcnNpb246IHtcbiAgICAgICAgcGFyc2U6ICh0ZXh0KSAtPiB0ZXh0Lm1hdGNoKC9hdXRvcGVwOCAoXFxkK1xcLlxcZCtcXC5cXGQrKS8pWzFdXG4gICAgICAgIHJ1bk9wdGlvbnM6IHtcbiAgICAgICAgICByZXR1cm5TdGRlcnI6IHRydWVcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgZG9ja2VyOiB7XG4gICAgICAgIGltYWdlOiBcInVuaWJlYXV0aWZ5L2F1dG9wZXA4XCJcbiAgICAgIH1cbiAgICB9XG4gICAge1xuICAgICAgbmFtZTogXCJpc29ydFwiXG4gICAgICBjbWQ6IFwiaXNvcnRcIlxuICAgICAgb3B0aW9uYWw6IHRydWVcbiAgICAgIGhvbWVwYWdlOiBcImh0dHBzOi8vZ2l0aHViLmNvbS90aW1vdGh5Y3Jvc2xleS9pc29ydFwiXG4gICAgICBpbnN0YWxsYXRpb246IFwiaHR0cHM6Ly9naXRodWIuY29tL3RpbW90aHljcm9zbGV5L2lzb3J0I2luc3RhbGxpbmctaXNvcnRcIlxuICAgICAgdmVyc2lvbjoge1xuICAgICAgICBwYXJzZTogKHRleHQpIC0+IHRleHQubWF0Y2goL1ZFUlNJT04gKFxcZCtcXC5cXGQrXFwuXFxkKykvKVsxXVxuICAgICAgfVxuICAgIH1cbiAgXVxuXG4gIG9wdGlvbnM6IHtcbiAgICBQeXRob246IHRydWVcbiAgfVxuXG4gIGJlYXV0aWZ5OiAodGV4dCwgbGFuZ3VhZ2UsIG9wdGlvbnMpIC0+XG4gICAgQGV4ZShcImF1dG9wZXA4XCIpLnJ1bihbXG4gICAgICAgIHRlbXBGaWxlID0gQHRlbXBGaWxlKFwiaW5wdXRcIiwgdGV4dClcbiAgICAgICAgXCItaVwiXG4gICAgICAgIFtcIi0tbWF4LWxpbmUtbGVuZ3RoXCIsIFwiI3tvcHRpb25zLm1heF9saW5lX2xlbmd0aH1cIl0gaWYgb3B0aW9ucy5tYXhfbGluZV9sZW5ndGg/XG4gICAgICAgIFtcIi0taW5kZW50LXNpemVcIixcIiN7b3B0aW9ucy5pbmRlbnRfc2l6ZX1cIl0gaWYgb3B0aW9ucy5pbmRlbnRfc2l6ZT9cbiAgICAgICAgW1wiLS1pZ25vcmVcIixcIiN7b3B0aW9ucy5pZ25vcmUuam9pbignLCcpfVwiXSBpZiBvcHRpb25zLmlnbm9yZT9cbiAgICAgIF0pXG4gICAgICAudGhlbig9PlxuICAgICAgICBpZiBvcHRpb25zLnNvcnRfaW1wb3J0c1xuICAgICAgICAgIGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgICAgICAgIGZpbGVQYXRoID0gZWRpdG9yLmdldFBhdGgoKVxuICAgICAgICAgIHByb2plY3RQYXRoID0gYXRvbS5wcm9qZWN0LnJlbGF0aXZpemVQYXRoKGZpbGVQYXRoKVswXVxuXG4gICAgICAgICAgQGV4ZShcImlzb3J0XCIpXG4gICAgICAgICAgICAucnVuKFxuICAgICAgICAgICAgICBbXCItc3BcIiwgcHJvamVjdFBhdGgsIHRlbXBGaWxlXSxcbiAgICAgICAgICAgIClcbiAgICAgICAgICAgIC50aGVuKD0+XG4gICAgICAgICAgICAgIEByZWFkRmlsZSh0ZW1wRmlsZSlcbiAgICAgICAgICAgIClcbiAgICAgICAgZWxzZVxuICAgICAgICAgIEByZWFkRmlsZSh0ZW1wRmlsZSlcbiAgICAgIClcbiJdfQ==
