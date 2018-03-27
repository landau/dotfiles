
/*
Requires https://github.com/FriendsOfPHP/phpcbf
 */

(function() {
  "use strict";
  var Beautifier, PHPCBF,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  module.exports = PHPCBF = (function(superClass) {
    extend(PHPCBF, superClass);

    function PHPCBF() {
      return PHPCBF.__super__.constructor.apply(this, arguments);
    }

    PHPCBF.prototype.name = "PHPCBF";

    PHPCBF.prototype.link = "http://php.net/manual/en/install.php";

    PHPCBF.prototype.isPreInstalled = false;

    PHPCBF.prototype.options = {
      _: {
        standard: [
          "standard", function(standard) {
            if (standard) {
              return standard;
            } else {
              return "PEAR";
            }
          }
        ]
      },
      PHP: true
    };

    PHPCBF.prototype.beautify = function(text, language, options) {
      var isWin, standardFile, standardFiles, tempFile;
      this.debug('phpcbf', options);
      standardFiles = ['phpcs.xml', 'phpcs.xml.dist', 'phpcs.ruleset.xml', 'ruleset.xml'];
      standardFile = this.findFile(atom.project.getPaths()[0], standardFiles);
      if (standardFile) {
        options.standard = standardFile;
      }
      isWin = this.isWindows;
      if (isWin) {
        return this.Promise.all([options.phpcbf_path ? this.which(options.phpcbf_path) : void 0, this.which('phpcbf')]).then((function(_this) {
          return function(paths) {
            var _, exec, isExec, path, phpcbfPath, tempFile;
            _this.debug('phpcbf paths', paths);
            _ = require('lodash');
            path = require('path');
            phpcbfPath = _.find(paths, function(p) {
              return p && path.isAbsolute(p);
            });
            _this.verbose('phpcbfPath', phpcbfPath);
            _this.debug('phpcbfPath', phpcbfPath, paths);
            if (phpcbfPath != null) {
              isExec = path.extname(phpcbfPath) !== '';
              exec = isExec ? phpcbfPath : "php";
              return _this.run(exec, [!isExec ? phpcbfPath : void 0, "--no-patch", options.standard ? "--standard=" + options.standard : void 0, tempFile = _this.tempFile("temp", text)], {
                ignoreReturnCode: true,
                help: {
                  link: "http://php.net/manual/en/install.php"
                },
                onStdin: function(stdin) {
                  return stdin.end();
                }
              }).then(function() {
                return _this.readFile(tempFile);
              });
            } else {
              _this.verbose('phpcbf not found!');
              return _this.Promise.reject(_this.commandNotFoundError('phpcbf', {
                link: "https://github.com/squizlabs/PHP_CodeSniffer",
                program: "phpcbf.phar",
                pathOption: "PHPCBF Path"
              }));
            }
          };
        })(this));
      } else {
        return this.run("phpcbf", ["--no-patch", options.standard ? "--standard=" + options.standard : void 0, tempFile = this.tempFile("temp", text)], {
          ignoreReturnCode: true,
          help: {
            link: "https://github.com/squizlabs/PHP_CodeSniffer"
          },
          onStdin: function(stdin) {
            return stdin.end();
          }
        }).then((function(_this) {
          return function() {
            return _this.readFile(tempFile);
          };
        })(this));
      }
    };

    return PHPCBF;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvYXRvbS1iZWF1dGlmeS9zcmMvYmVhdXRpZmllcnMvcGhwY2JmLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7QUFBQTtFQUlBO0FBSkEsTUFBQSxrQkFBQTtJQUFBOzs7RUFLQSxVQUFBLEdBQWEsT0FBQSxDQUFRLGNBQVI7O0VBRWIsTUFBTSxDQUFDLE9BQVAsR0FBdUI7Ozs7Ozs7cUJBQ3JCLElBQUEsR0FBTTs7cUJBQ04sSUFBQSxHQUFNOztxQkFDTixjQUFBLEdBQWdCOztxQkFFaEIsT0FBQSxHQUFTO01BQ1AsQ0FBQSxFQUNFO1FBQUEsUUFBQSxFQUFVO1VBQUMsVUFBRCxFQUFhLFNBQUMsUUFBRDtZQUNyQixJQUFJLFFBQUo7cUJBQ0UsU0FERjthQUFBLE1BQUE7cUJBQ2dCLE9BRGhCOztVQURxQixDQUFiO1NBQVY7T0FGSztNQU1QLEdBQUEsRUFBSyxJQU5FOzs7cUJBU1QsUUFBQSxHQUFVLFNBQUMsSUFBRCxFQUFPLFFBQVAsRUFBaUIsT0FBakI7QUFDUixVQUFBO01BQUEsSUFBQyxDQUFBLEtBQUQsQ0FBTyxRQUFQLEVBQWlCLE9BQWpCO01BQ0EsYUFBQSxHQUFnQixDQUFDLFdBQUQsRUFBYyxnQkFBZCxFQUFnQyxtQkFBaEMsRUFBcUQsYUFBckQ7TUFDaEIsWUFBQSxHQUFlLElBQUMsQ0FBQSxRQUFELENBQVUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFiLENBQUEsQ0FBd0IsQ0FBQSxDQUFBLENBQWxDLEVBQXNDLGFBQXRDO01BRWYsSUFBbUMsWUFBbkM7UUFBQSxPQUFPLENBQUMsUUFBUixHQUFtQixhQUFuQjs7TUFFQSxLQUFBLEdBQVEsSUFBQyxDQUFBO01BQ1QsSUFBRyxLQUFIO2VBRUUsSUFBQyxDQUFBLE9BQU8sQ0FBQyxHQUFULENBQWEsQ0FDb0IsT0FBTyxDQUFDLFdBQXZDLEdBQUEsSUFBQyxDQUFBLEtBQUQsQ0FBTyxPQUFPLENBQUMsV0FBZixDQUFBLEdBQUEsTUFEVyxFQUVYLElBQUMsQ0FBQSxLQUFELENBQU8sUUFBUCxDQUZXLENBQWIsQ0FHRSxDQUFDLElBSEgsQ0FHUSxDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFDLEtBQUQ7QUFDTixnQkFBQTtZQUFBLEtBQUMsQ0FBQSxLQUFELENBQU8sY0FBUCxFQUF1QixLQUF2QjtZQUNBLENBQUEsR0FBSSxPQUFBLENBQVEsUUFBUjtZQUNKLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjtZQUVQLFVBQUEsR0FBYSxDQUFDLENBQUMsSUFBRixDQUFPLEtBQVAsRUFBYyxTQUFDLENBQUQ7cUJBQU8sQ0FBQSxJQUFNLElBQUksQ0FBQyxVQUFMLENBQWdCLENBQWhCO1lBQWIsQ0FBZDtZQUNiLEtBQUMsQ0FBQSxPQUFELENBQVMsWUFBVCxFQUF1QixVQUF2QjtZQUNBLEtBQUMsQ0FBQSxLQUFELENBQU8sWUFBUCxFQUFxQixVQUFyQixFQUFpQyxLQUFqQztZQUVBLElBQUcsa0JBQUg7Y0FJRSxNQUFBLEdBQVMsSUFBSSxDQUFDLE9BQUwsQ0FBYSxVQUFiLENBQUEsS0FBOEI7Y0FDdkMsSUFBQSxHQUFVLE1BQUgsR0FBZSxVQUFmLEdBQStCO3FCQUV0QyxLQUFDLENBQUEsR0FBRCxDQUFLLElBQUwsRUFBVyxDQUNULENBQWtCLE1BQWxCLEdBQUEsVUFBQSxHQUFBLE1BRFMsRUFFVCxZQUZTLEVBRzJCLE9BQU8sQ0FBQyxRQUE1QyxHQUFBLGFBQUEsR0FBYyxPQUFPLENBQUMsUUFBdEIsR0FBQSxNQUhTLEVBSVQsUUFBQSxHQUFXLEtBQUMsQ0FBQSxRQUFELENBQVUsTUFBVixFQUFrQixJQUFsQixDQUpGLENBQVgsRUFLSztnQkFDRCxnQkFBQSxFQUFrQixJQURqQjtnQkFFRCxJQUFBLEVBQU07a0JBQ0osSUFBQSxFQUFNLHNDQURGO2lCQUZMO2dCQUtELE9BQUEsRUFBUyxTQUFDLEtBQUQ7eUJBQ1AsS0FBSyxDQUFDLEdBQU4sQ0FBQTtnQkFETyxDQUxSO2VBTEwsQ0FhRSxDQUFDLElBYkgsQ0FhUSxTQUFBO3VCQUNKLEtBQUMsQ0FBQSxRQUFELENBQVUsUUFBVjtjQURJLENBYlIsRUFQRjthQUFBLE1BQUE7Y0F3QkUsS0FBQyxDQUFBLE9BQUQsQ0FBUyxtQkFBVDtxQkFFQSxLQUFDLENBQUEsT0FBTyxDQUFDLE1BQVQsQ0FBZ0IsS0FBQyxDQUFBLG9CQUFELENBQ2QsUUFEYyxFQUVkO2dCQUNBLElBQUEsRUFBTSw4Q0FETjtnQkFFQSxPQUFBLEVBQVMsYUFGVDtnQkFHQSxVQUFBLEVBQVksYUFIWjtlQUZjLENBQWhCLEVBMUJGOztVQVRNO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUhSLEVBRkY7T0FBQSxNQUFBO2VBa0RFLElBQUMsQ0FBQSxHQUFELENBQUssUUFBTCxFQUFlLENBQ2IsWUFEYSxFQUV1QixPQUFPLENBQUMsUUFBNUMsR0FBQSxhQUFBLEdBQWMsT0FBTyxDQUFDLFFBQXRCLEdBQUEsTUFGYSxFQUdiLFFBQUEsR0FBVyxJQUFDLENBQUEsUUFBRCxDQUFVLE1BQVYsRUFBa0IsSUFBbEIsQ0FIRSxDQUFmLEVBSUs7VUFDRCxnQkFBQSxFQUFrQixJQURqQjtVQUVELElBQUEsRUFBTTtZQUNKLElBQUEsRUFBTSw4Q0FERjtXQUZMO1VBS0QsT0FBQSxFQUFTLFNBQUMsS0FBRDttQkFDUCxLQUFLLENBQUMsR0FBTixDQUFBO1VBRE8sQ0FMUjtTQUpMLENBWUUsQ0FBQyxJQVpILENBWVEsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQTttQkFDSixLQUFDLENBQUEsUUFBRCxDQUFVLFFBQVY7VUFESTtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FaUixFQWxERjs7SUFSUTs7OztLQWQwQjtBQVB0QyIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuUmVxdWlyZXMgaHR0cHM6Ly9naXRodWIuY29tL0ZyaWVuZHNPZlBIUC9waHBjYmZcbiMjI1xuXG5cInVzZSBzdHJpY3RcIlxuQmVhdXRpZmllciA9IHJlcXVpcmUoJy4vYmVhdXRpZmllcicpXG5cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgUEhQQ0JGIGV4dGVuZHMgQmVhdXRpZmllclxuICBuYW1lOiBcIlBIUENCRlwiXG4gIGxpbms6IFwiaHR0cDovL3BocC5uZXQvbWFudWFsL2VuL2luc3RhbGwucGhwXCJcbiAgaXNQcmVJbnN0YWxsZWQ6IGZhbHNlXG5cbiAgb3B0aW9uczoge1xuICAgIF86XG4gICAgICBzdGFuZGFyZDogW1wic3RhbmRhcmRcIiwgKHN0YW5kYXJkKSAtPlxuICAgICAgICBpZiAoc3RhbmRhcmQpIHRoZW4gXFxcbiAgICAgICAgICBzdGFuZGFyZCBlbHNlIFwiUEVBUlwiXG4gICAgICBdXG4gICAgUEhQOiB0cnVlXG4gIH1cblxuICBiZWF1dGlmeTogKHRleHQsIGxhbmd1YWdlLCBvcHRpb25zKSAtPlxuICAgIEBkZWJ1ZygncGhwY2JmJywgb3B0aW9ucylcbiAgICBzdGFuZGFyZEZpbGVzID0gWydwaHBjcy54bWwnLCAncGhwY3MueG1sLmRpc3QnLCAncGhwY3MucnVsZXNldC54bWwnLCAncnVsZXNldC54bWwnXVxuICAgIHN0YW5kYXJkRmlsZSA9IEBmaW5kRmlsZShhdG9tLnByb2plY3QuZ2V0UGF0aHMoKVswXSwgc3RhbmRhcmRGaWxlcyk7XG5cbiAgICBvcHRpb25zLnN0YW5kYXJkID0gc3RhbmRhcmRGaWxlIGlmIHN0YW5kYXJkRmlsZVxuXG4gICAgaXNXaW4gPSBAaXNXaW5kb3dzXG4gICAgaWYgaXNXaW5cbiAgICAgICMgRmluZCBwaHBjYmYucGhhciBzY3JpcHRcbiAgICAgIEBQcm9taXNlLmFsbChbXG4gICAgICAgIEB3aGljaChvcHRpb25zLnBocGNiZl9wYXRoKSBpZiBvcHRpb25zLnBocGNiZl9wYXRoXG4gICAgICAgIEB3aGljaCgncGhwY2JmJylcbiAgICAgIF0pLnRoZW4oKHBhdGhzKSA9PlxuICAgICAgICBAZGVidWcoJ3BocGNiZiBwYXRocycsIHBhdGhzKVxuICAgICAgICBfID0gcmVxdWlyZSAnbG9kYXNoJ1xuICAgICAgICBwYXRoID0gcmVxdWlyZSAncGF0aCdcbiAgICAgICAgIyBHZXQgZmlyc3QgdmFsaWQsIGFic29sdXRlIHBhdGhcbiAgICAgICAgcGhwY2JmUGF0aCA9IF8uZmluZChwYXRocywgKHApIC0+IHAgYW5kIHBhdGguaXNBYnNvbHV0ZShwKSApXG4gICAgICAgIEB2ZXJib3NlKCdwaHBjYmZQYXRoJywgcGhwY2JmUGF0aClcbiAgICAgICAgQGRlYnVnKCdwaHBjYmZQYXRoJywgcGhwY2JmUGF0aCwgcGF0aHMpXG4gICAgICAgICMgQ2hlY2sgaWYgcGhwY2JmIHBhdGggd2FzIGZvdW5kXG4gICAgICAgIGlmIHBocGNiZlBhdGg/XG4gICAgICAgICAgIyBGb3VuZCBwaHBjYmYgcGF0aFxuXG4gICAgICAgICAgIyBDaGVjayBpZiBwaHBjYmYgaXMgYW4gZXhlY3V0YWJsZVxuICAgICAgICAgIGlzRXhlYyA9IHBhdGguZXh0bmFtZShwaHBjYmZQYXRoKSBpc250ICcnXG4gICAgICAgICAgZXhlYyA9IGlmIGlzRXhlYyB0aGVuIHBocGNiZlBhdGggZWxzZSBcInBocFwiXG5cbiAgICAgICAgICBAcnVuKGV4ZWMsIFtcbiAgICAgICAgICAgIHBocGNiZlBhdGggdW5sZXNzIGlzRXhlY1xuICAgICAgICAgICAgXCItLW5vLXBhdGNoXCJcbiAgICAgICAgICAgIFwiLS1zdGFuZGFyZD0je29wdGlvbnMuc3RhbmRhcmR9XCIgaWYgb3B0aW9ucy5zdGFuZGFyZFxuICAgICAgICAgICAgdGVtcEZpbGUgPSBAdGVtcEZpbGUoXCJ0ZW1wXCIsIHRleHQpXG4gICAgICAgICAgICBdLCB7XG4gICAgICAgICAgICAgIGlnbm9yZVJldHVybkNvZGU6IHRydWVcbiAgICAgICAgICAgICAgaGVscDoge1xuICAgICAgICAgICAgICAgIGxpbms6IFwiaHR0cDovL3BocC5uZXQvbWFudWFsL2VuL2luc3RhbGwucGhwXCJcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBvblN0ZGluOiAoc3RkaW4pIC0+XG4gICAgICAgICAgICAgICAgc3RkaW4uZW5kKClcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAudGhlbig9PlxuICAgICAgICAgICAgICBAcmVhZEZpbGUodGVtcEZpbGUpXG4gICAgICAgICAgICApXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBAdmVyYm9zZSgncGhwY2JmIG5vdCBmb3VuZCEnKVxuICAgICAgICAgICMgQ291bGQgbm90IGZpbmQgcGhwY2JmIHBhdGhcbiAgICAgICAgICBAUHJvbWlzZS5yZWplY3QoQGNvbW1hbmROb3RGb3VuZEVycm9yKFxuICAgICAgICAgICAgJ3BocGNiZidcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgIGxpbms6IFwiaHR0cHM6Ly9naXRodWIuY29tL3NxdWl6bGFicy9QSFBfQ29kZVNuaWZmZXJcIlxuICAgICAgICAgICAgcHJvZ3JhbTogXCJwaHBjYmYucGhhclwiXG4gICAgICAgICAgICBwYXRoT3B0aW9uOiBcIlBIUENCRiBQYXRoXCJcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgKVxuICAgICAgKVxuICAgIGVsc2VcbiAgICAgIEBydW4oXCJwaHBjYmZcIiwgW1xuICAgICAgICBcIi0tbm8tcGF0Y2hcIlxuICAgICAgICBcIi0tc3RhbmRhcmQ9I3tvcHRpb25zLnN0YW5kYXJkfVwiIGlmIG9wdGlvbnMuc3RhbmRhcmRcbiAgICAgICAgdGVtcEZpbGUgPSBAdGVtcEZpbGUoXCJ0ZW1wXCIsIHRleHQpXG4gICAgICAgIF0sIHtcbiAgICAgICAgICBpZ25vcmVSZXR1cm5Db2RlOiB0cnVlXG4gICAgICAgICAgaGVscDoge1xuICAgICAgICAgICAgbGluazogXCJodHRwczovL2dpdGh1Yi5jb20vc3F1aXpsYWJzL1BIUF9Db2RlU25pZmZlclwiXG4gICAgICAgICAgfVxuICAgICAgICAgIG9uU3RkaW46IChzdGRpbikgLT5cbiAgICAgICAgICAgIHN0ZGluLmVuZCgpXG4gICAgICAgIH0pXG4gICAgICAgIC50aGVuKD0+XG4gICAgICAgICAgQHJlYWRGaWxlKHRlbXBGaWxlKVxuICAgICAgICApXG4iXX0=
