
/*
Requires https://github.com/nrc/rustfmt
 */

(function() {
  "use strict";
  var Beautifier, Rustfmt, path, versionCheckState,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  path = require('path');

  versionCheckState = false;

  module.exports = Rustfmt = (function(superClass) {
    extend(Rustfmt, superClass);

    function Rustfmt() {
      return Rustfmt.__super__.constructor.apply(this, arguments);
    }

    Rustfmt.prototype.name = "rustfmt";

    Rustfmt.prototype.link = "https://github.com/nrc/rustfmt";

    Rustfmt.prototype.isPreInstalled = false;

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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvYXRvbS1iZWF1dGlmeS9zcmMvYmVhdXRpZmllcnMvcnVzdGZtdC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7O0FBQUE7RUFJQTtBQUpBLE1BQUEsNENBQUE7SUFBQTs7O0VBS0EsVUFBQSxHQUFhLE9BQUEsQ0FBUSxjQUFSOztFQUNiLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFFUCxpQkFBQSxHQUFvQjs7RUFFcEIsTUFBTSxDQUFDLE9BQVAsR0FBdUI7Ozs7Ozs7c0JBQ3JCLElBQUEsR0FBTTs7c0JBQ04sSUFBQSxHQUFNOztzQkFDTixjQUFBLEdBQWdCOztzQkFFaEIsT0FBQSxHQUFTO01BQ1AsSUFBQSxFQUFNLElBREM7OztzQkFJVCxRQUFBLEdBQVUsU0FBQyxJQUFELEVBQU8sUUFBUCxFQUFpQixPQUFqQixFQUEwQixPQUExQjtBQUNSLFVBQUE7TUFBQSxHQUFBLEdBQU0sT0FBTyxDQUFDLFFBQVIsSUFBcUIsSUFBSSxDQUFDLE9BQUwsQ0FBYSxPQUFPLENBQUMsUUFBckI7TUFDM0IsT0FBQSxHQUFVLE9BQU8sQ0FBQyxZQUFSLElBQXdCO01BQ2xDLElBQUEsR0FBTztRQUNMLElBQUEsRUFBTSxnQ0FERDtRQUVMLE9BQUEsRUFBUyxTQUZKO1FBR0wsVUFBQSxFQUFZLHFCQUhQOztNQVNQLENBQUEsR0FBTyxpQkFBQSxLQUFxQixPQUF4QixHQUNGLElBQUMsQ0FBQSxPQUFPLENBQUMsT0FBVCxDQUFBLENBREUsR0FHRixJQUFDLENBQUEsR0FBRCxDQUFLLE9BQUwsRUFBYyxDQUFDLFdBQUQsQ0FBZCxFQUE2QjtRQUFBLElBQUEsRUFBTSxJQUFOO09BQTdCLENBQ0UsQ0FBQyxJQURILENBQ1EsU0FBQyxNQUFEO1FBQ0osSUFBRyxzQkFBc0IsQ0FBQyxJQUF2QixDQUE0QixNQUFNLENBQUMsSUFBUCxDQUFBLENBQTVCLENBQUg7VUFDRSxpQkFBQSxHQUFvQjtBQUNwQixnQkFBVSxJQUFBLEtBQUEsQ0FBTSx5Q0FBTixFQUZaO1NBQUEsTUFBQTtVQUlFLGlCQUFBLEdBQW9CO2lCQUNwQixPQUxGOztNQURJLENBRFI7YUFVRixDQUFDLENBQUMsSUFBRixDQUFPLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtpQkFDTCxLQUFDLENBQUEsR0FBRCxDQUFLLE9BQUwsRUFBYyxFQUFkLEVBQWtCO1lBQ2hCLEdBQUEsRUFBSyxHQURXO1lBRWhCLElBQUEsRUFBTSxJQUZVO1lBR2hCLE9BQUEsRUFBUyxTQUFDLEtBQUQ7cUJBQ1AsS0FBSyxDQUFDLEdBQU4sQ0FBVSxJQUFWO1lBRE8sQ0FITztXQUFsQjtRQURLO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFQO0lBekJROzs7O0tBVDJCO0FBVnZDIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG5SZXF1aXJlcyBodHRwczovL2dpdGh1Yi5jb20vbnJjL3J1c3RmbXRcbiMjI1xuXG5cInVzZSBzdHJpY3RcIlxuQmVhdXRpZmllciA9IHJlcXVpcmUoJy4vYmVhdXRpZmllcicpXG5wYXRoID0gcmVxdWlyZSgncGF0aCcpXG5cbnZlcnNpb25DaGVja1N0YXRlID0gZmFsc2VcblxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBSdXN0Zm10IGV4dGVuZHMgQmVhdXRpZmllclxuICBuYW1lOiBcInJ1c3RmbXRcIlxuICBsaW5rOiBcImh0dHBzOi8vZ2l0aHViLmNvbS9ucmMvcnVzdGZtdFwiXG4gIGlzUHJlSW5zdGFsbGVkOiBmYWxzZVxuXG4gIG9wdGlvbnM6IHtcbiAgICBSdXN0OiB0cnVlXG4gIH1cblxuICBiZWF1dGlmeTogKHRleHQsIGxhbmd1YWdlLCBvcHRpb25zLCBjb250ZXh0KSAtPlxuICAgIGN3ZCA9IGNvbnRleHQuZmlsZVBhdGggYW5kIHBhdGguZGlybmFtZSBjb250ZXh0LmZpbGVQYXRoXG4gICAgcHJvZ3JhbSA9IG9wdGlvbnMucnVzdGZtdF9wYXRoIG9yIFwicnVzdGZtdFwiXG4gICAgaGVscCA9IHtcbiAgICAgIGxpbms6IFwiaHR0cHM6Ly9naXRodWIuY29tL25yYy9ydXN0Zm10XCJcbiAgICAgIHByb2dyYW06IFwicnVzdGZtdFwiXG4gICAgICBwYXRoT3B0aW9uOiBcIlJ1c3QgLSBSdXN0Zm10IFBhdGhcIlxuICAgIH1cblxuICAgICMgMC41LjAgaXMgYSByZWxhdGl2ZWx5IG5ldyB2ZXJzaW9uIGF0IHRoZSBwb2ludCBvZiB3cml0aW5nLFxuICAgICMgYnV0IGlzIGVzc2VudGlhbCBmb3IgdGhpcyB0byB3b3JrIHdpdGggc3RkaW4uXG4gICAgIyA9PiBDaGVjayBmb3IgaXQgc3BlY2lmaWNhbGx5LlxuICAgIHAgPSBpZiB2ZXJzaW9uQ2hlY2tTdGF0ZSA9PSBwcm9ncmFtXG4gICAgICBAUHJvbWlzZS5yZXNvbHZlKClcbiAgICBlbHNlXG4gICAgICBAcnVuKHByb2dyYW0sIFtcIi0tdmVyc2lvblwiXSwgaGVscDogaGVscClcbiAgICAgICAgLnRoZW4oKHN0ZG91dCkgLT5cbiAgICAgICAgICBpZiAvXjBcXC4oPzpbMC00XVxcLlswLTldKS8udGVzdChzdGRvdXQudHJpbSgpKVxuICAgICAgICAgICAgdmVyc2lvbkNoZWNrU3RhdGUgPSBmYWxzZVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwicnVzdGZtdCB2ZXJzaW9uIDAuNS4wIG9yIG5ld2VyIHJlcXVpcmVkXCIpXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgdmVyc2lvbkNoZWNrU3RhdGUgPSBwcm9ncmFtXG4gICAgICAgICAgICB1bmRlZmluZWRcbiAgICAgICAgKVxuXG4gICAgcC50aGVuKD0+XG4gICAgICBAcnVuKHByb2dyYW0sIFtdLCB7XG4gICAgICAgIGN3ZDogY3dkXG4gICAgICAgIGhlbHA6IGhlbHBcbiAgICAgICAgb25TdGRpbjogKHN0ZGluKSAtPlxuICAgICAgICAgIHN0ZGluLmVuZCB0ZXh0XG4gICAgICB9KVxuICAgIClcbiJdfQ==
