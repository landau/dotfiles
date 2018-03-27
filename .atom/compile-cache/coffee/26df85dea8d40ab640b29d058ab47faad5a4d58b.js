
/*
Requires clang-format (https://clang.llvm.org)
 */

(function() {
  "use strict";
  var Beautifier, ClangFormat, fs, path,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  path = require('path');

  fs = require('fs');

  module.exports = ClangFormat = (function(superClass) {
    extend(ClangFormat, superClass);

    function ClangFormat() {
      return ClangFormat.__super__.constructor.apply(this, arguments);
    }

    ClangFormat.prototype.name = "clang-format";

    ClangFormat.prototype.link = "https://clang.llvm.org/docs/ClangFormat.html";

    ClangFormat.prototype.isPreInstalled = false;

    ClangFormat.prototype.options = {
      "C++": false,
      "C": false,
      "Objective-C": false,
      "GLSL": true
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
        var currDir, currFile, dumpFile, editor, fullPath, ref;
        editor = typeof atom !== "undefined" && atom !== null ? (ref = atom.workspace) != null ? ref.getActiveTextEditor() : void 0 : void 0;
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvYXRvbS1iZWF1dGlmeS9zcmMvYmVhdXRpZmllcnMvY2xhbmctZm9ybWF0LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7QUFBQTtFQUlBO0FBSkEsTUFBQSxpQ0FBQTtJQUFBOzs7RUFLQSxVQUFBLEdBQWEsT0FBQSxDQUFRLGNBQVI7O0VBQ2IsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUNQLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUjs7RUFFTCxNQUFNLENBQUMsT0FBUCxHQUF1Qjs7Ozs7OzswQkFFckIsSUFBQSxHQUFNOzswQkFDTixJQUFBLEdBQU07OzBCQUNOLGNBQUEsR0FBZ0I7OzBCQUVoQixPQUFBLEdBQVM7TUFDUCxLQUFBLEVBQU8sS0FEQTtNQUVQLEdBQUEsRUFBSyxLQUZFO01BR1AsYUFBQSxFQUFlLEtBSFI7TUFJUCxNQUFBLEVBQVEsSUFKRDs7OztBQU9UOzs7OzBCQUdBLFVBQUEsR0FBWSxTQUFDLElBQUQsRUFBOEIsUUFBOUI7O1FBQUMsT0FBTzs7O1FBQXNCLFdBQVc7O0FBQ25ELGFBQVcsSUFBQSxJQUFDLENBQUEsT0FBRCxDQUFTLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxPQUFELEVBQVUsTUFBVjtpQkFDbEIsRUFBRSxDQUFDLElBQUgsQ0FBUSxJQUFSLEVBQWMsR0FBZCxFQUFtQixTQUFDLEdBQUQsRUFBTSxFQUFOO1lBQ2pCLEtBQUMsQ0FBQSxLQUFELENBQU8sWUFBUCxFQUFxQixJQUFyQixFQUEyQixHQUEzQixFQUFnQyxFQUFoQztZQUNBLElBQXNCLEdBQXRCO0FBQUEscUJBQU8sTUFBQSxDQUFPLEdBQVAsRUFBUDs7bUJBQ0EsRUFBRSxDQUFDLEtBQUgsQ0FBUyxFQUFULEVBQWEsUUFBYixFQUF1QixTQUFDLEdBQUQ7Y0FDckIsSUFBc0IsR0FBdEI7QUFBQSx1QkFBTyxNQUFBLENBQU8sR0FBUCxFQUFQOztxQkFDQSxFQUFFLENBQUMsS0FBSCxDQUFTLEVBQVQsRUFBYSxTQUFDLEdBQUQ7Z0JBQ1gsSUFBc0IsR0FBdEI7QUFBQSx5QkFBTyxNQUFBLENBQU8sR0FBUCxFQUFQOzt1QkFDQSxPQUFBLENBQVEsSUFBUjtjQUZXLENBQWI7WUFGcUIsQ0FBdkI7VUFIaUIsQ0FBbkI7UUFEa0I7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVQ7SUFERDs7MEJBZVosUUFBQSxHQUFVLFNBQUMsSUFBRCxFQUFPLFFBQVAsRUFBaUIsT0FBakI7QUFhUixhQUFXLElBQUEsSUFBQyxDQUFBLE9BQUQsQ0FBUyxTQUFDLE9BQUQsRUFBVSxNQUFWO0FBQ2xCLFlBQUE7UUFBQSxNQUFBLHNGQUF3QixDQUFFLG1CQUFqQixDQUFBO1FBQ1QsSUFBRyxjQUFIO1VBQ0UsUUFBQSxHQUFXLE1BQU0sQ0FBQyxPQUFQLENBQUE7VUFDWCxPQUFBLEdBQVUsSUFBSSxDQUFDLE9BQUwsQ0FBYSxRQUFiO1VBQ1YsUUFBQSxHQUFXLElBQUksQ0FBQyxRQUFMLENBQWMsUUFBZDtVQUNYLFFBQUEsR0FBVyxJQUFJLENBQUMsSUFBTCxDQUFVLE9BQVYsRUFBbUIsaUJBQUEsR0FBa0IsUUFBckM7aUJBQ1gsT0FBQSxDQUFRLFFBQVIsRUFMRjtTQUFBLE1BQUE7aUJBT0UsTUFBQSxDQUFXLElBQUEsS0FBQSxDQUFNLHlCQUFOLENBQVgsRUFQRjs7TUFGa0IsQ0FBVCxDQVdYLENBQUMsSUFYVSxDQVdMLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxRQUFEO0FBRUosaUJBQU8sS0FBQyxDQUFBLEdBQUQsQ0FBSyxjQUFMLEVBQXFCLENBQzFCLEtBQUMsQ0FBQSxVQUFELENBQVksUUFBWixFQUFzQixJQUF0QixDQUQwQixFQUUxQixDQUFDLGNBQUQsQ0FGMEIsQ0FBckIsRUFHRjtZQUFBLElBQUEsRUFBTTtjQUNQLElBQUEsRUFBTSw4Q0FEQzthQUFOO1dBSEUsQ0FLSCxFQUFDLE9BQUQsRUFMRyxDQUtPLFNBQUE7bUJBQ1YsRUFBRSxDQUFDLE1BQUgsQ0FBVSxRQUFWO1VBRFUsQ0FMUDtRQUZIO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQVhLO0lBYkg7Ozs7S0EvQitCO0FBVDNDIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG5SZXF1aXJlcyBjbGFuZy1mb3JtYXQgKGh0dHBzOi8vY2xhbmcubGx2bS5vcmcpXG4jIyNcblxuXCJ1c2Ugc3RyaWN0XCJcbkJlYXV0aWZpZXIgPSByZXF1aXJlKCcuL2JlYXV0aWZpZXInKVxucGF0aCA9IHJlcXVpcmUoJ3BhdGgnKVxuZnMgPSByZXF1aXJlKCdmcycpXG5cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgQ2xhbmdGb3JtYXQgZXh0ZW5kcyBCZWF1dGlmaWVyXG5cbiAgbmFtZTogXCJjbGFuZy1mb3JtYXRcIlxuICBsaW5rOiBcImh0dHBzOi8vY2xhbmcubGx2bS5vcmcvZG9jcy9DbGFuZ0Zvcm1hdC5odG1sXCJcbiAgaXNQcmVJbnN0YWxsZWQ6IGZhbHNlXG5cbiAgb3B0aW9uczoge1xuICAgIFwiQysrXCI6IGZhbHNlXG4gICAgXCJDXCI6IGZhbHNlXG4gICAgXCJPYmplY3RpdmUtQ1wiOiBmYWxzZVxuICAgIFwiR0xTTFwiOiB0cnVlXG4gIH1cblxuICAjIyNcbiAgICBEdW1wIGNvbnRlbnRzIHRvIGEgZ2l2ZW4gZmlsZVxuICAjIyNcbiAgZHVtcFRvRmlsZTogKG5hbWUgPSBcImF0b20tYmVhdXRpZnktZHVtcFwiLCBjb250ZW50cyA9IFwiXCIpIC0+XG4gICAgcmV0dXJuIG5ldyBAUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PlxuICAgICAgZnMub3BlbihuYW1lLCBcIndcIiwgKGVyciwgZmQpID0+XG4gICAgICAgIEBkZWJ1ZygnZHVtcFRvRmlsZScsIG5hbWUsIGVyciwgZmQpXG4gICAgICAgIHJldHVybiByZWplY3QoZXJyKSBpZiBlcnJcbiAgICAgICAgZnMud3JpdGUoZmQsIGNvbnRlbnRzLCAoZXJyKSAtPlxuICAgICAgICAgIHJldHVybiByZWplY3QoZXJyKSBpZiBlcnJcbiAgICAgICAgICBmcy5jbG9zZShmZCwgKGVycikgLT5cbiAgICAgICAgICAgIHJldHVybiByZWplY3QoZXJyKSBpZiBlcnJcbiAgICAgICAgICAgIHJlc29sdmUobmFtZSlcbiAgICAgICAgICApXG4gICAgICAgIClcbiAgICAgIClcbiAgICApXG5cbiAgYmVhdXRpZnk6ICh0ZXh0LCBsYW5ndWFnZSwgb3B0aW9ucykgLT5cbiAgICAjIE5PVEU6IE9uZSBtYXkgd29uZGVyIHdoeSB0aGlzIGNvZGUgZ29lcyBhIGxvbmcgd2F5IHRvIGNvbnN0cnVjdCBhIGZpbGVcbiAgICAjIHBhdGggYW5kIGR1bXAgY29udGVudCB1c2luZyBhIGN1c3RvbSBgZHVtcFRvRmlsZWAuIFdvdWxkbid0IGl0IGJlIGVhc2llclxuICAgICMgdG8gdXNlIGBAdGVtcEZpbGVgIGluc3RlYWQ/IFRoZSByZWFzb24gaGVyZSBpcyB0byB3b3JrIGFyb3VuZCB0aGVcbiAgICAjIGNsYW5nLWZvcm1hdCBjb25maWcgZmlsZSBsb2NhdGluZyBtZWNoYW5pc20uIEFzIGluZGljYXRlZCBpbiB0aGUgbWFudWFsLFxuICAgICMgY2xhbmctZm9ybWF0ICh3aXRoIGAtLXN0eWxlIGZpbGVgKSB0cmllcyB0byBsb2NhdGUgYSBgLmNsYW5nLWZvcm1hdGBcbiAgICAjIGNvbmZpZyBmaWxlIGluIGRpcmVjdG9yeSBhbmQgcGFyZW50IGRpcmVjdG9yaWVzIG9mIHRoZSBpbnB1dCBmaWxlLFxuICAgICMgYW5kIHJldHJlYXQgdG8gZGVmYXVsdCBzdHlsZSBpZiBub3QgZm91bmQuIFByb2plY3RzIG9mdGVuIG1ha2VzIHVzZSBvZlxuICAgICMgdGhpcyBydWxlIHRvIGRlZmluZSB0aGVpciBvd24gc3R5bGUgaW4gaXRzIHRvcCBkaXJlY3RvcnkuIFVzZXJzIG9mdGVuXG4gICAgIyBwdXQgYSBgLmNsYW5nLWZvcm1hdGAgaW4gdGhlaXIgJEhPTUUgdG8gZGVmaW5lIGhpcy9oZXIgc3R5bGUuIFRvIGhvbm9yXG4gICAgIyB0aGlzIHJ1bGUsIHdlIEhBVkUgVE8gZ2VuZXJhdGUgdGhlIHRlbXAgZmlsZSBpbiBUSEUgU0FNRSBkaXJlY3RvcnkgYXNcbiAgICAjIHRoZSBlZGl0aW5nIGZpbGUuIEhvd2V2ZXIsIHRoaXMgbWVjaGFuaXNtIGlzIG5vdCBkaXJlY3RseSBzdXBwb3J0ZWQgYnlcbiAgICAjIGF0b20tYmVhdXRpZnkgYXQgdGhlIG1vbWVudC4gU28gd2UgaW50cm9kdWNlIGxvdHMgb2YgY29kZSBoZXJlLlxuICAgIHJldHVybiBuZXcgQFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgLT5cbiAgICAgIGVkaXRvciA9IGF0b20/LndvcmtzcGFjZT8uZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgICBpZiBlZGl0b3I/XG4gICAgICAgIGZ1bGxQYXRoID0gZWRpdG9yLmdldFBhdGgoKVxuICAgICAgICBjdXJyRGlyID0gcGF0aC5kaXJuYW1lKGZ1bGxQYXRoKVxuICAgICAgICBjdXJyRmlsZSA9IHBhdGguYmFzZW5hbWUoZnVsbFBhdGgpXG4gICAgICAgIGR1bXBGaWxlID0gcGF0aC5qb2luKGN1cnJEaXIsIFwiLmF0b20tYmVhdXRpZnkuI3tjdXJyRmlsZX1cIilcbiAgICAgICAgcmVzb2x2ZSBkdW1wRmlsZVxuICAgICAgZWxzZVxuICAgICAgICByZWplY3QobmV3IEVycm9yKFwiTm8gYWN0aXZlIGVkaXRvciBmb3VuZCFcIikpXG4gICAgKVxuICAgIC50aGVuKChkdW1wRmlsZSkgPT5cbiAgICAgICMgY29uc29sZS5sb2coXCJjbGFuZy1mb3JtYXRcIiwgZHVtcEZpbGUpXG4gICAgICByZXR1cm4gQHJ1bihcImNsYW5nLWZvcm1hdFwiLCBbXG4gICAgICAgIEBkdW1wVG9GaWxlKGR1bXBGaWxlLCB0ZXh0KVxuICAgICAgICBbXCItLXN0eWxlPWZpbGVcIl1cbiAgICAgICAgXSwgaGVscDoge1xuICAgICAgICAgIGxpbms6IFwiaHR0cHM6Ly9jbGFuZy5sbHZtLm9yZy9kb2NzL0NsYW5nRm9ybWF0Lmh0bWxcIlxuICAgICAgICB9KS5maW5hbGx5KCAtPlxuICAgICAgICAgIGZzLnVubGluayhkdW1wRmlsZSlcbiAgICAgICAgKVxuICAgIClcbiJdfQ==
