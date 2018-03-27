
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

    Autopep8.prototype.isPreInstalled = false;

    Autopep8.prototype.options = {
      Python: true
    };

    Autopep8.prototype.beautify = function(text, language, options) {
      var tempFile;
      return this.run("autopep8", [tempFile = this.tempFile("input", text), "-i", options.max_line_length != null ? ["--max-line-length", "" + options.max_line_length] : void 0, options.indent_size != null ? ["--indent-size", "" + options.indent_size] : void 0, options.ignore != null ? ["--ignore", "" + (options.ignore.join(','))] : void 0], {
        help: {
          link: "https://github.com/hhatto/autopep8"
        }
      }).then((function(_this) {
        return function() {
          if (options.sort_imports) {
            return _this.run("isort", [tempFile], {
              help: {
                link: "https://github.com/timothycrosley/isort"
              }
            }).then(function() {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvYXRvbS1iZWF1dGlmeS9zcmMvYmVhdXRpZmllcnMvYXV0b3BlcDguY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7OztBQUFBO0VBSUE7QUFKQSxNQUFBLG9CQUFBO0lBQUE7OztFQUtBLFVBQUEsR0FBYSxPQUFBLENBQVEsY0FBUjs7RUFFYixNQUFNLENBQUMsT0FBUCxHQUF1Qjs7Ozs7Ozt1QkFFckIsSUFBQSxHQUFNOzt1QkFDTixJQUFBLEdBQU07O3VCQUNOLGNBQUEsR0FBZ0I7O3VCQUVoQixPQUFBLEdBQVM7TUFDUCxNQUFBLEVBQVEsSUFERDs7O3VCQUlULFFBQUEsR0FBVSxTQUFDLElBQUQsRUFBTyxRQUFQLEVBQWlCLE9BQWpCO0FBQ1IsVUFBQTthQUFBLElBQUMsQ0FBQSxHQUFELENBQUssVUFBTCxFQUFpQixDQUNmLFFBQUEsR0FBVyxJQUFDLENBQUEsUUFBRCxDQUFVLE9BQVYsRUFBbUIsSUFBbkIsQ0FESSxFQUVmLElBRmUsRUFHd0MsK0JBQXZELEdBQUEsQ0FBQyxtQkFBRCxFQUFzQixFQUFBLEdBQUcsT0FBTyxDQUFDLGVBQWpDLENBQUEsR0FBQSxNQUhlLEVBSStCLDJCQUE5QyxHQUFBLENBQUMsZUFBRCxFQUFpQixFQUFBLEdBQUcsT0FBTyxDQUFDLFdBQTVCLENBQUEsR0FBQSxNQUplLEVBSytCLHNCQUE5QyxHQUFBLENBQUMsVUFBRCxFQUFZLEVBQUEsR0FBRSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBZixDQUFvQixHQUFwQixDQUFELENBQWQsQ0FBQSxHQUFBLE1BTGUsQ0FBakIsRUFNSztRQUFBLElBQUEsRUFBTTtVQUNQLElBQUEsRUFBTSxvQ0FEQztTQUFOO09BTkwsQ0FTRSxDQUFDLElBVEgsQ0FTUSxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7VUFDSixJQUFHLE9BQU8sQ0FBQyxZQUFYO21CQUNFLEtBQUMsQ0FBQSxHQUFELENBQUssT0FBTCxFQUNFLENBQUMsUUFBRCxDQURGLEVBRUU7Y0FBQSxJQUFBLEVBQU07Z0JBQ0osSUFBQSxFQUFNLHlDQURGO2VBQU47YUFGRixDQUtBLENBQUMsSUFMRCxDQUtNLFNBQUE7cUJBQ0osS0FBQyxDQUFBLFFBQUQsQ0FBVSxRQUFWO1lBREksQ0FMTixFQURGO1dBQUEsTUFBQTttQkFVRSxLQUFDLENBQUEsUUFBRCxDQUFVLFFBQVYsRUFWRjs7UUFESTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FUUjtJQURROzs7O0tBVjRCO0FBUHhDIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG5SZXF1aXJlcyBodHRwczovL2dpdGh1Yi5jb20vaGhhdHRvL2F1dG9wZXA4XG4jIyNcblxuXCJ1c2Ugc3RyaWN0XCJcbkJlYXV0aWZpZXIgPSByZXF1aXJlKCcuL2JlYXV0aWZpZXInKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIEF1dG9wZXA4IGV4dGVuZHMgQmVhdXRpZmllclxuXG4gIG5hbWU6IFwiYXV0b3BlcDhcIlxuICBsaW5rOiBcImh0dHBzOi8vZ2l0aHViLmNvbS9oaGF0dG8vYXV0b3BlcDhcIlxuICBpc1ByZUluc3RhbGxlZDogZmFsc2VcblxuICBvcHRpb25zOiB7XG4gICAgUHl0aG9uOiB0cnVlXG4gIH1cblxuICBiZWF1dGlmeTogKHRleHQsIGxhbmd1YWdlLCBvcHRpb25zKSAtPlxuICAgIEBydW4oXCJhdXRvcGVwOFwiLCBbXG4gICAgICB0ZW1wRmlsZSA9IEB0ZW1wRmlsZShcImlucHV0XCIsIHRleHQpXG4gICAgICBcIi1pXCJcbiAgICAgIFtcIi0tbWF4LWxpbmUtbGVuZ3RoXCIsIFwiI3tvcHRpb25zLm1heF9saW5lX2xlbmd0aH1cIl0gaWYgb3B0aW9ucy5tYXhfbGluZV9sZW5ndGg/XG4gICAgICBbXCItLWluZGVudC1zaXplXCIsXCIje29wdGlvbnMuaW5kZW50X3NpemV9XCJdIGlmIG9wdGlvbnMuaW5kZW50X3NpemU/XG4gICAgICBbXCItLWlnbm9yZVwiLFwiI3tvcHRpb25zLmlnbm9yZS5qb2luKCcsJyl9XCJdIGlmIG9wdGlvbnMuaWdub3JlP1xuICAgICAgXSwgaGVscDoge1xuICAgICAgICBsaW5rOiBcImh0dHBzOi8vZ2l0aHViLmNvbS9oaGF0dG8vYXV0b3BlcDhcIlxuICAgICAgfSlcbiAgICAgIC50aGVuKD0+XG4gICAgICAgIGlmIG9wdGlvbnMuc29ydF9pbXBvcnRzXG4gICAgICAgICAgQHJ1bihcImlzb3J0XCIsXG4gICAgICAgICAgICBbdGVtcEZpbGVdLFxuICAgICAgICAgICAgaGVscDoge1xuICAgICAgICAgICAgICBsaW5rOiBcImh0dHBzOi8vZ2l0aHViLmNvbS90aW1vdGh5Y3Jvc2xleS9pc29ydFwiXG4gICAgICAgICAgfSlcbiAgICAgICAgICAudGhlbig9PlxuICAgICAgICAgICAgQHJlYWRGaWxlKHRlbXBGaWxlKVxuICAgICAgICAgIClcbiAgICAgICAgZWxzZVxuICAgICAgICAgIEByZWFkRmlsZSh0ZW1wRmlsZSlcbiAgICAgIClcbiJdfQ==
