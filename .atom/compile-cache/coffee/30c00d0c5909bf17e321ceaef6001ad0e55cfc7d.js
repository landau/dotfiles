
/*
Requires https://www.gnu.org/software/emacs/
 */

(function() {
  "use strict";
  var Beautifier, FortranBeautifier, path,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('../beautifier');

  path = require("path");

  module.exports = FortranBeautifier = (function(superClass) {
    extend(FortranBeautifier, superClass);

    function FortranBeautifier() {
      return FortranBeautifier.__super__.constructor.apply(this, arguments);
    }

    FortranBeautifier.prototype.name = "Fortran Beautifier";

    FortranBeautifier.prototype.link = "https://www.gnu.org/software/emacs/";

    FortranBeautifier.prototype.executables = [
      {
        name: "Emacs",
        cmd: "emacs",
        homepage: "https://www.gnu.org/software/emacs/",
        installation: "https://www.gnu.org/software/emacs/",
        version: {
          parse: function(text) {
            return text.match(/Emacs (\d+\.\d+\.\d+)/)[1];
          }
        }
      }
    ];

    FortranBeautifier.prototype.options = {
      Fortran: true
    };

    FortranBeautifier.prototype.beautify = function(text, language, options) {
      var args, emacs, emacs_path, emacs_script_path, tempFile;
      this.debug('fortran-beautifier', options);
      emacs = this.exe("emacs");
      emacs_path = options.emacs_path;
      emacs_script_path = options.emacs_script_path;
      if (!emacs_script_path) {
        emacs_script_path = path.resolve(__dirname, "emacs-fortran-formating-script.lisp");
      }
      this.debug('fortran-beautifier', 'emacs script path: ' + emacs_script_path);
      args = ['--batch', '-l', emacs_script_path, '-f', 'f90-batch-indent-region', tempFile = this.tempFile("temp", text)];
      if (emacs_path) {
        this.deprecate("The \"emacs_path\" has been deprecated. Please switch to using the config with path \"Executables - Emacs - Path\" in Atom-Beautify package settings now.");
        return this.run(emacs_path, args, {
          ignoreReturnCode: false
        }).then((function(_this) {
          return function() {
            return _this.readFile(tempFile);
          };
        })(this));
      } else {
        return emacs.run(args, {
          ignoreReturnCode: false
        }).then((function(_this) {
          return function() {
            return _this.readFile(tempFile);
          };
        })(this));
      }
    };

    return FortranBeautifier;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvYXRvbS1iZWF1dGlmeS9zcmMvYmVhdXRpZmllcnMvZm9ydHJhbi1iZWF1dGlmaWVyL2luZGV4LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7QUFBQTtFQUlBO0FBSkEsTUFBQSxtQ0FBQTtJQUFBOzs7RUFLQSxVQUFBLEdBQWEsT0FBQSxDQUFRLGVBQVI7O0VBQ2IsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUVQLE1BQU0sQ0FBQyxPQUFQLEdBQXVCOzs7Ozs7O2dDQUNyQixJQUFBLEdBQU07O2dDQUNOLElBQUEsR0FBTTs7Z0NBQ04sV0FBQSxHQUFhO01BQ1g7UUFDRSxJQUFBLEVBQU0sT0FEUjtRQUVFLEdBQUEsRUFBSyxPQUZQO1FBR0UsUUFBQSxFQUFVLHFDQUhaO1FBSUUsWUFBQSxFQUFjLHFDQUpoQjtRQUtFLE9BQUEsRUFBUztVQUNQLEtBQUEsRUFBTyxTQUFDLElBQUQ7bUJBQVUsSUFBSSxDQUFDLEtBQUwsQ0FBVyx1QkFBWCxDQUFvQyxDQUFBLENBQUE7VUFBOUMsQ0FEQTtTQUxYO09BRFc7OztnQ0FZYixPQUFBLEdBQVM7TUFDUCxPQUFBLEVBQVMsSUFERjs7O2dDQUlULFFBQUEsR0FBVSxTQUFDLElBQUQsRUFBTyxRQUFQLEVBQWlCLE9BQWpCO0FBQ1IsVUFBQTtNQUFBLElBQUMsQ0FBQSxLQUFELENBQU8sb0JBQVAsRUFBNkIsT0FBN0I7TUFDQSxLQUFBLEdBQVEsSUFBQyxDQUFBLEdBQUQsQ0FBSyxPQUFMO01BRVIsVUFBQSxHQUFhLE9BQU8sQ0FBQztNQUNyQixpQkFBQSxHQUFvQixPQUFPLENBQUM7TUFFNUIsSUFBRyxDQUFJLGlCQUFQO1FBQ0UsaUJBQUEsR0FBb0IsSUFBSSxDQUFDLE9BQUwsQ0FBYSxTQUFiLEVBQXdCLHFDQUF4QixFQUR0Qjs7TUFHQSxJQUFDLENBQUEsS0FBRCxDQUFPLG9CQUFQLEVBQTZCLHFCQUFBLEdBQXdCLGlCQUFyRDtNQUVBLElBQUEsR0FBTyxDQUNMLFNBREssRUFFTCxJQUZLLEVBR0wsaUJBSEssRUFJTCxJQUpLLEVBS0wseUJBTEssRUFNTCxRQUFBLEdBQVcsSUFBQyxDQUFBLFFBQUQsQ0FBVSxNQUFWLEVBQWtCLElBQWxCLENBTk47TUFTUCxJQUFHLFVBQUg7UUFDRSxJQUFDLENBQUEsU0FBRCxDQUFXLDJKQUFYO2VBQ0EsSUFBQyxDQUFBLEdBQUQsQ0FBSyxVQUFMLEVBQWlCLElBQWpCLEVBQXVCO1VBQUMsZ0JBQUEsRUFBa0IsS0FBbkI7U0FBdkIsQ0FDRSxDQUFDLElBREgsQ0FDUSxDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFBO21CQUNKLEtBQUMsQ0FBQSxRQUFELENBQVUsUUFBVjtVQURJO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQURSLEVBRkY7T0FBQSxNQUFBO2VBT0UsS0FBSyxDQUFDLEdBQU4sQ0FBVSxJQUFWLEVBQWdCO1VBQUMsZ0JBQUEsRUFBa0IsS0FBbkI7U0FBaEIsQ0FDRSxDQUFDLElBREgsQ0FDUSxDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFBO21CQUNKLEtBQUMsQ0FBQSxRQUFELENBQVUsUUFBVjtVQURJO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQURSLEVBUEY7O0lBckJROzs7O0tBbkJxQztBQVJqRCIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuUmVxdWlyZXMgaHR0cHM6Ly93d3cuZ251Lm9yZy9zb2Z0d2FyZS9lbWFjcy9cbiMjI1xuXG5cInVzZSBzdHJpY3RcIlxuQmVhdXRpZmllciA9IHJlcXVpcmUoJy4uL2JlYXV0aWZpZXInKVxucGF0aCA9IHJlcXVpcmUoXCJwYXRoXCIpXG5cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgRm9ydHJhbkJlYXV0aWZpZXIgZXh0ZW5kcyBCZWF1dGlmaWVyXG4gIG5hbWU6IFwiRm9ydHJhbiBCZWF1dGlmaWVyXCJcbiAgbGluazogXCJodHRwczovL3d3dy5nbnUub3JnL3NvZnR3YXJlL2VtYWNzL1wiXG4gIGV4ZWN1dGFibGVzOiBbXG4gICAge1xuICAgICAgbmFtZTogXCJFbWFjc1wiXG4gICAgICBjbWQ6IFwiZW1hY3NcIlxuICAgICAgaG9tZXBhZ2U6IFwiaHR0cHM6Ly93d3cuZ251Lm9yZy9zb2Z0d2FyZS9lbWFjcy9cIlxuICAgICAgaW5zdGFsbGF0aW9uOiBcImh0dHBzOi8vd3d3LmdudS5vcmcvc29mdHdhcmUvZW1hY3MvXCJcbiAgICAgIHZlcnNpb246IHtcbiAgICAgICAgcGFyc2U6ICh0ZXh0KSAtPiB0ZXh0Lm1hdGNoKC9FbWFjcyAoXFxkK1xcLlxcZCtcXC5cXGQrKS8pWzFdXG4gICAgICB9XG4gICAgfVxuICBdXG5cbiAgb3B0aW9uczoge1xuICAgIEZvcnRyYW46IHRydWVcbiAgfVxuXG4gIGJlYXV0aWZ5OiAodGV4dCwgbGFuZ3VhZ2UsIG9wdGlvbnMpIC0+XG4gICAgQGRlYnVnKCdmb3J0cmFuLWJlYXV0aWZpZXInLCBvcHRpb25zKVxuICAgIGVtYWNzID0gQGV4ZShcImVtYWNzXCIpXG5cbiAgICBlbWFjc19wYXRoID0gb3B0aW9ucy5lbWFjc19wYXRoXG4gICAgZW1hY3Nfc2NyaXB0X3BhdGggPSBvcHRpb25zLmVtYWNzX3NjcmlwdF9wYXRoXG5cbiAgICBpZiBub3QgZW1hY3Nfc2NyaXB0X3BhdGhcbiAgICAgIGVtYWNzX3NjcmlwdF9wYXRoID0gcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCJlbWFjcy1mb3J0cmFuLWZvcm1hdGluZy1zY3JpcHQubGlzcFwiKVxuXG4gICAgQGRlYnVnKCdmb3J0cmFuLWJlYXV0aWZpZXInLCAnZW1hY3Mgc2NyaXB0IHBhdGg6ICcgKyBlbWFjc19zY3JpcHRfcGF0aClcblxuICAgIGFyZ3MgPSBbXG4gICAgICAnLS1iYXRjaCdcbiAgICAgICctbCdcbiAgICAgIGVtYWNzX3NjcmlwdF9wYXRoXG4gICAgICAnLWYnXG4gICAgICAnZjkwLWJhdGNoLWluZGVudC1yZWdpb24nXG4gICAgICB0ZW1wRmlsZSA9IEB0ZW1wRmlsZShcInRlbXBcIiwgdGV4dClcbiAgICAgIF1cblxuICAgIGlmIGVtYWNzX3BhdGhcbiAgICAgIEBkZXByZWNhdGUoXCJUaGUgXFxcImVtYWNzX3BhdGhcXFwiIGhhcyBiZWVuIGRlcHJlY2F0ZWQuIFBsZWFzZSBzd2l0Y2ggdG8gdXNpbmcgdGhlIGNvbmZpZyB3aXRoIHBhdGggXFxcIkV4ZWN1dGFibGVzIC0gRW1hY3MgLSBQYXRoXFxcIiBpbiBBdG9tLUJlYXV0aWZ5IHBhY2thZ2Ugc2V0dGluZ3Mgbm93LlwiKVxuICAgICAgQHJ1bihlbWFjc19wYXRoLCBhcmdzLCB7aWdub3JlUmV0dXJuQ29kZTogZmFsc2V9KVxuICAgICAgICAudGhlbig9PlxuICAgICAgICAgIEByZWFkRmlsZSh0ZW1wRmlsZSlcbiAgICAgICAgKVxuICAgIGVsc2VcbiAgICAgIGVtYWNzLnJ1bihhcmdzLCB7aWdub3JlUmV0dXJuQ29kZTogZmFsc2V9KVxuICAgICAgICAudGhlbig9PlxuICAgICAgICAgIEByZWFkRmlsZSh0ZW1wRmlsZSlcbiAgICAgICAgKVxuIl19
