
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

    FortranBeautifier.prototype.isPreInstalled = false;

    FortranBeautifier.prototype.options = {
      Fortran: true
    };

    FortranBeautifier.prototype.beautify = function(text, language, options) {
      var args, emacs_path, emacs_script_path, tempFile;
      this.debug('fortran-beautifier', options);
      emacs_path = options.emacs_path;
      emacs_script_path = options.emacs_script_path;
      if (!emacs_script_path) {
        emacs_script_path = path.resolve(__dirname, "emacs-fortran-formating-script.lisp");
      }
      this.debug('fortran-beautifier', 'emacs script path: ' + emacs_script_path);
      args = ['--batch', '-l', emacs_script_path, '-f', 'f90-batch-indent-region', tempFile = this.tempFile("temp", text)];
      if (emacs_path) {
        return this.run(emacs_path, args, {
          ignoreReturnCode: false
        }).then((function(_this) {
          return function() {
            return _this.readFile(tempFile);
          };
        })(this));
      } else {
        return this.run("emacs", args, {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvYXRvbS1iZWF1dGlmeS9zcmMvYmVhdXRpZmllcnMvZm9ydHJhbi1iZWF1dGlmaWVyL2luZGV4LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7QUFBQTtFQUlBO0FBSkEsTUFBQSxtQ0FBQTtJQUFBOzs7RUFLQSxVQUFBLEdBQWEsT0FBQSxDQUFRLGVBQVI7O0VBQ2IsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUVQLE1BQU0sQ0FBQyxPQUFQLEdBQXVCOzs7Ozs7O2dDQUNyQixJQUFBLEdBQU07O2dDQUNOLElBQUEsR0FBTTs7Z0NBQ04sY0FBQSxHQUFnQjs7Z0NBRWhCLE9BQUEsR0FBUztNQUNQLE9BQUEsRUFBUyxJQURGOzs7Z0NBSVQsUUFBQSxHQUFVLFNBQUMsSUFBRCxFQUFPLFFBQVAsRUFBaUIsT0FBakI7QUFDUixVQUFBO01BQUEsSUFBQyxDQUFBLEtBQUQsQ0FBTyxvQkFBUCxFQUE2QixPQUE3QjtNQUVBLFVBQUEsR0FBYSxPQUFPLENBQUM7TUFDckIsaUJBQUEsR0FBb0IsT0FBTyxDQUFDO01BRTVCLElBQUcsQ0FBSSxpQkFBUDtRQUNFLGlCQUFBLEdBQW9CLElBQUksQ0FBQyxPQUFMLENBQWEsU0FBYixFQUF3QixxQ0FBeEIsRUFEdEI7O01BR0EsSUFBQyxDQUFBLEtBQUQsQ0FBTyxvQkFBUCxFQUE2QixxQkFBQSxHQUF3QixpQkFBckQ7TUFFQSxJQUFBLEdBQU8sQ0FDTCxTQURLLEVBRUwsSUFGSyxFQUdMLGlCQUhLLEVBSUwsSUFKSyxFQUtMLHlCQUxLLEVBTUwsUUFBQSxHQUFXLElBQUMsQ0FBQSxRQUFELENBQVUsTUFBVixFQUFrQixJQUFsQixDQU5OO01BU1AsSUFBRyxVQUFIO2VBQ0UsSUFBQyxDQUFBLEdBQUQsQ0FBSyxVQUFMLEVBQWlCLElBQWpCLEVBQXVCO1VBQUMsZ0JBQUEsRUFBa0IsS0FBbkI7U0FBdkIsQ0FDRSxDQUFDLElBREgsQ0FDUSxDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFBO21CQUNKLEtBQUMsQ0FBQSxRQUFELENBQVUsUUFBVjtVQURJO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQURSLEVBREY7T0FBQSxNQUFBO2VBTUUsSUFBQyxDQUFBLEdBQUQsQ0FBSyxPQUFMLEVBQWMsSUFBZCxFQUFvQjtVQUFDLGdCQUFBLEVBQWtCLEtBQW5CO1NBQXBCLENBQ0UsQ0FBQyxJQURILENBQ1EsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQTttQkFDSixLQUFDLENBQUEsUUFBRCxDQUFVLFFBQVY7VUFESTtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FEUixFQU5GOztJQXBCUTs7OztLQVRxQztBQVJqRCIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuUmVxdWlyZXMgaHR0cHM6Ly93d3cuZ251Lm9yZy9zb2Z0d2FyZS9lbWFjcy9cbiMjI1xuXG5cInVzZSBzdHJpY3RcIlxuQmVhdXRpZmllciA9IHJlcXVpcmUoJy4uL2JlYXV0aWZpZXInKVxucGF0aCA9IHJlcXVpcmUoXCJwYXRoXCIpXG5cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgRm9ydHJhbkJlYXV0aWZpZXIgZXh0ZW5kcyBCZWF1dGlmaWVyXG4gIG5hbWU6IFwiRm9ydHJhbiBCZWF1dGlmaWVyXCJcbiAgbGluazogXCJodHRwczovL3d3dy5nbnUub3JnL3NvZnR3YXJlL2VtYWNzL1wiXG4gIGlzUHJlSW5zdGFsbGVkOiBmYWxzZVxuXG4gIG9wdGlvbnM6IHtcbiAgICBGb3J0cmFuOiB0cnVlXG4gIH1cblxuICBiZWF1dGlmeTogKHRleHQsIGxhbmd1YWdlLCBvcHRpb25zKSAtPlxuICAgIEBkZWJ1ZygnZm9ydHJhbi1iZWF1dGlmaWVyJywgb3B0aW9ucylcblxuICAgIGVtYWNzX3BhdGggPSBvcHRpb25zLmVtYWNzX3BhdGhcbiAgICBlbWFjc19zY3JpcHRfcGF0aCA9IG9wdGlvbnMuZW1hY3Nfc2NyaXB0X3BhdGhcblxuICAgIGlmIG5vdCBlbWFjc19zY3JpcHRfcGF0aFxuICAgICAgZW1hY3Nfc2NyaXB0X3BhdGggPSBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcImVtYWNzLWZvcnRyYW4tZm9ybWF0aW5nLXNjcmlwdC5saXNwXCIpXG5cbiAgICBAZGVidWcoJ2ZvcnRyYW4tYmVhdXRpZmllcicsICdlbWFjcyBzY3JpcHQgcGF0aDogJyArIGVtYWNzX3NjcmlwdF9wYXRoKVxuXG4gICAgYXJncyA9IFtcbiAgICAgICctLWJhdGNoJ1xuICAgICAgJy1sJ1xuICAgICAgZW1hY3Nfc2NyaXB0X3BhdGhcbiAgICAgICctZidcbiAgICAgICdmOTAtYmF0Y2gtaW5kZW50LXJlZ2lvbidcbiAgICAgIHRlbXBGaWxlID0gQHRlbXBGaWxlKFwidGVtcFwiLCB0ZXh0KVxuICAgICAgXVxuXG4gICAgaWYgZW1hY3NfcGF0aFxuICAgICAgQHJ1bihlbWFjc19wYXRoLCBhcmdzLCB7aWdub3JlUmV0dXJuQ29kZTogZmFsc2V9KVxuICAgICAgICAudGhlbig9PlxuICAgICAgICAgIEByZWFkRmlsZSh0ZW1wRmlsZSlcbiAgICAgICAgKVxuICAgIGVsc2VcbiAgICAgIEBydW4oXCJlbWFjc1wiLCBhcmdzLCB7aWdub3JlUmV0dXJuQ29kZTogZmFsc2V9KVxuICAgICAgICAudGhlbig9PlxuICAgICAgICAgIEByZWFkRmlsZSh0ZW1wRmlsZSlcbiAgICAgICAgKVxuIl19
