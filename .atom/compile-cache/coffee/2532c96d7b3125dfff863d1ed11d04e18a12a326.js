
/*
Requires clang-format (https://clang.llvm.org)
 */

(function() {
  "use strict";
  var Beautifier, ClangFormat, fs, path,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Beautifier = require('./beautifier');

  path = require('path');

  fs = require('fs');

  module.exports = ClangFormat = (function(_super) {
    __extends(ClangFormat, _super);

    function ClangFormat() {
      return ClangFormat.__super__.constructor.apply(this, arguments);
    }

    ClangFormat.prototype.name = "clang-format";

    ClangFormat.prototype.options = {
      "C++": false,
      "C": false,
      "Objective-C": false
    };


    /*
      Dump contents to a given file
     */

    ClangFormat.prototype.dumpToFile = function(name, contents) {
      if (name == null) {
        name = "atom-beautify-dump";
      }
      if (contents == null) {
        contents = "";
      }
      return new this.Promise((function(_this) {
        return function(resolve, reject) {
          return fs.open(name, "w", function(err, fd) {
            _this.debug('dumpToFile', name, err, fd);
            if (err) {
              return reject(err);
            }
            return fs.write(fd, contents, function(err) {
              if (err) {
                return reject(err);
              }
              return fs.close(fd, function(err) {
                if (err) {
                  return reject(err);
                }
                return resolve(name);
              });
            });
          });
        };
      })(this));
    };

    ClangFormat.prototype.beautify = function(text, language, options) {
      return new this.Promise(function(resolve, reject) {
        var currDir, currFile, dumpFile, editor, fullPath, _ref;
        editor = typeof atom !== "undefined" && atom !== null ? (_ref = atom.workspace) != null ? _ref.getActiveTextEditor() : void 0 : void 0;
        if (editor != null) {
          fullPath = editor.getPath();
          currDir = path.dirname(fullPath);
          currFile = path.basename(fullPath);
          dumpFile = path.join(currDir, ".atom-beautify." + currFile);
          return resolve(dumpFile);
        } else {
          return reject(new Error("No active editor found!"));
        }
      }).then((function(_this) {
        return function(dumpFile) {
          return _this.run("clang-format", [_this.dumpToFile(dumpFile, text), ["--style=file"]], {
            help: {
              link: "https://clang.llvm.org/docs/ClangFormat.html"
            }
          })["finally"](function() {
            return fs.unlink(dumpFile);
          });
        };
      })(this));
    };

    return ClangFormat;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvYXRvbS1iZWF1dGlmeS9zcmMvYmVhdXRpZmllcnMvY2xhbmctZm9ybWF0LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUE7O0dBQUE7QUFBQTtBQUFBO0FBQUEsRUFJQSxZQUpBLENBQUE7QUFBQSxNQUFBLGlDQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFLQSxVQUFBLEdBQWEsT0FBQSxDQUFRLGNBQVIsQ0FMYixDQUFBOztBQUFBLEVBTUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSLENBTlAsQ0FBQTs7QUFBQSxFQU9BLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUixDQVBMLENBQUE7O0FBQUEsRUFTQSxNQUFNLENBQUMsT0FBUCxHQUF1QjtBQUVyQixrQ0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsMEJBQUEsSUFBQSxHQUFNLGNBQU4sQ0FBQTs7QUFBQSwwQkFFQSxPQUFBLEdBQVM7QUFBQSxNQUNQLEtBQUEsRUFBTyxLQURBO0FBQUEsTUFFUCxHQUFBLEVBQUssS0FGRTtBQUFBLE1BR1AsYUFBQSxFQUFlLEtBSFI7S0FGVCxDQUFBOztBQVFBO0FBQUE7O09BUkE7O0FBQUEsMEJBV0EsVUFBQSxHQUFZLFNBQUMsSUFBRCxFQUE4QixRQUE5QixHQUFBOztRQUFDLE9BQU87T0FDbEI7O1FBRHdDLFdBQVc7T0FDbkQ7QUFBQSxhQUFXLElBQUEsSUFBQyxDQUFBLE9BQUQsQ0FBUyxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQyxPQUFELEVBQVUsTUFBVixHQUFBO2lCQUNsQixFQUFFLENBQUMsSUFBSCxDQUFRLElBQVIsRUFBYyxHQUFkLEVBQW1CLFNBQUMsR0FBRCxFQUFNLEVBQU4sR0FBQTtBQUNqQixZQUFBLEtBQUMsQ0FBQSxLQUFELENBQU8sWUFBUCxFQUFxQixJQUFyQixFQUEyQixHQUEzQixFQUFnQyxFQUFoQyxDQUFBLENBQUE7QUFDQSxZQUFBLElBQXNCLEdBQXRCO0FBQUEscUJBQU8sTUFBQSxDQUFPLEdBQVAsQ0FBUCxDQUFBO2FBREE7bUJBRUEsRUFBRSxDQUFDLEtBQUgsQ0FBUyxFQUFULEVBQWEsUUFBYixFQUF1QixTQUFDLEdBQUQsR0FBQTtBQUNyQixjQUFBLElBQXNCLEdBQXRCO0FBQUEsdUJBQU8sTUFBQSxDQUFPLEdBQVAsQ0FBUCxDQUFBO2VBQUE7cUJBQ0EsRUFBRSxDQUFDLEtBQUgsQ0FBUyxFQUFULEVBQWEsU0FBQyxHQUFELEdBQUE7QUFDWCxnQkFBQSxJQUFzQixHQUF0QjtBQUFBLHlCQUFPLE1BQUEsQ0FBTyxHQUFQLENBQVAsQ0FBQTtpQkFBQTt1QkFDQSxPQUFBLENBQVEsSUFBUixFQUZXO2NBQUEsQ0FBYixFQUZxQjtZQUFBLENBQXZCLEVBSGlCO1VBQUEsQ0FBbkIsRUFEa0I7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFULENBQVgsQ0FEVTtJQUFBLENBWFosQ0FBQTs7QUFBQSwwQkEwQkEsUUFBQSxHQUFVLFNBQUMsSUFBRCxFQUFPLFFBQVAsRUFBaUIsT0FBakIsR0FBQTtBQWFSLGFBQVcsSUFBQSxJQUFDLENBQUEsT0FBRCxDQUFTLFNBQUMsT0FBRCxFQUFVLE1BQVYsR0FBQTtBQUNsQixZQUFBLG1EQUFBO0FBQUEsUUFBQSxNQUFBLHdGQUF3QixDQUFFLG1CQUFqQixDQUFBLG1CQUFULENBQUE7QUFDQSxRQUFBLElBQUcsY0FBSDtBQUNFLFVBQUEsUUFBQSxHQUFXLE1BQU0sQ0FBQyxPQUFQLENBQUEsQ0FBWCxDQUFBO0FBQUEsVUFDQSxPQUFBLEdBQVUsSUFBSSxDQUFDLE9BQUwsQ0FBYSxRQUFiLENBRFYsQ0FBQTtBQUFBLFVBRUEsUUFBQSxHQUFXLElBQUksQ0FBQyxRQUFMLENBQWMsUUFBZCxDQUZYLENBQUE7QUFBQSxVQUdBLFFBQUEsR0FBVyxJQUFJLENBQUMsSUFBTCxDQUFVLE9BQVYsRUFBb0IsaUJBQUEsR0FBaUIsUUFBckMsQ0FIWCxDQUFBO2lCQUlBLE9BQUEsQ0FBUSxRQUFSLEVBTEY7U0FBQSxNQUFBO2lCQU9FLE1BQUEsQ0FBVyxJQUFBLEtBQUEsQ0FBTSx5QkFBTixDQUFYLEVBUEY7U0FGa0I7TUFBQSxDQUFULENBV1gsQ0FBQyxJQVhVLENBV0wsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsUUFBRCxHQUFBO0FBRUosaUJBQU8sS0FBQyxDQUFBLEdBQUQsQ0FBSyxjQUFMLEVBQXFCLENBQzFCLEtBQUMsQ0FBQSxVQUFELENBQVksUUFBWixFQUFzQixJQUF0QixDQUQwQixFQUUxQixDQUFDLGNBQUQsQ0FGMEIsQ0FBckIsRUFHRjtBQUFBLFlBQUEsSUFBQSxFQUFNO0FBQUEsY0FDUCxJQUFBLEVBQU0sOENBREM7YUFBTjtXQUhFLENBS0gsQ0FBQyxTQUFELENBTEcsQ0FLTyxTQUFBLEdBQUE7bUJBQ1YsRUFBRSxDQUFDLE1BQUgsQ0FBVSxRQUFWLEVBRFU7VUFBQSxDQUxQLENBQVAsQ0FGSTtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBWEssQ0FBWCxDQWJRO0lBQUEsQ0ExQlYsQ0FBQTs7dUJBQUE7O0tBRnlDLFdBVDNDLENBQUE7QUFBQSIKfQ==

//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/atom-beautify/src/beautifiers/clang-format.coffee
