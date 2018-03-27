
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvYXRvbS1iZWF1dGlmeS9zcmMvYmVhdXRpZmllcnMvcGhwY2JmLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7QUFBQTtFQUlBO0FBSkEsTUFBQSxrQkFBQTtJQUFBOzs7RUFLQSxVQUFBLEdBQWEsT0FBQSxDQUFRLGNBQVI7O0VBRWIsTUFBTSxDQUFDLE9BQVAsR0FBdUI7Ozs7Ozs7cUJBQ3JCLElBQUEsR0FBTTs7cUJBQ04sSUFBQSxHQUFNOztxQkFDTixjQUFBLEdBQWdCOztxQkFFaEIsT0FBQSxHQUFTO01BQ1AsQ0FBQSxFQUNFO1FBQUEsUUFBQSxFQUFVO1VBQUMsVUFBRCxFQUFhLFNBQUMsUUFBRDtZQUNyQixJQUFJLFFBQUo7cUJBQ0UsU0FERjthQUFBLE1BQUE7cUJBQ2dCLE9BRGhCOztVQURxQixDQUFiO1NBQVY7T0FGSztNQU1QLEdBQUEsRUFBSyxJQU5FOzs7cUJBU1QsUUFBQSxHQUFVLFNBQUMsSUFBRCxFQUFPLFFBQVAsRUFBaUIsT0FBakI7QUFDUixVQUFBO01BQUEsSUFBQyxDQUFBLEtBQUQsQ0FBTyxRQUFQLEVBQWlCLE9BQWpCO01BQ0EsYUFBQSxHQUFnQixDQUFDLFdBQUQsRUFBYyxnQkFBZCxFQUFnQyxtQkFBaEMsRUFBcUQsYUFBckQ7TUFDaEIsWUFBQSxHQUFlLElBQUMsQ0FBQSxRQUFELENBQVUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFiLENBQUEsQ0FBd0IsQ0FBQSxDQUFBLENBQWxDLEVBQXNDLGFBQXRDO01BRWYsSUFBbUMsWUFBbkM7UUFBQSxPQUFPLENBQUMsUUFBUixHQUFtQixhQUFuQjs7TUFFQSxLQUFBLEdBQVEsSUFBQyxDQUFBO01BQ1QsSUFBRyxLQUFIO2VBRUUsSUFBQyxDQUFBLE9BQU8sQ0FBQyxHQUFULENBQWEsQ0FDb0IsT0FBTyxDQUFDLFdBQXZDLEdBQUEsSUFBQyxDQUFBLEtBQUQsQ0FBTyxPQUFPLENBQUMsV0FBZixDQUFBLEdBQUEsTUFEVyxFQUVYLElBQUMsQ0FBQSxLQUFELENBQU8sUUFBUCxDQUZXLENBQWIsQ0FHRSxDQUFDLElBSEgsQ0FHUSxDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFDLEtBQUQ7QUFDTixnQkFBQTtZQUFBLEtBQUMsQ0FBQSxLQUFELENBQU8sY0FBUCxFQUF1QixLQUF2QjtZQUNBLENBQUEsR0FBSSxPQUFBLENBQVEsUUFBUjtZQUNKLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjtZQUVQLFVBQUEsR0FBYSxDQUFDLENBQUMsSUFBRixDQUFPLEtBQVAsRUFBYyxTQUFDLENBQUQ7cUJBQU8sQ0FBQSxJQUFNLElBQUksQ0FBQyxVQUFMLENBQWdCLENBQWhCO1lBQWIsQ0FBZDtZQUNiLEtBQUMsQ0FBQSxPQUFELENBQVMsWUFBVCxFQUF1QixVQUF2QjtZQUNBLEtBQUMsQ0FBQSxLQUFELENBQU8sWUFBUCxFQUFxQixVQUFyQixFQUFpQyxLQUFqQztZQUVBLElBQUcsa0JBQUg7Y0FJRSxNQUFBLEdBQVMsSUFBSSxDQUFDLE9BQUwsQ0FBYSxVQUFiLENBQUEsS0FBOEI7Y0FDdkMsSUFBQSxHQUFVLE1BQUgsR0FBZSxVQUFmLEdBQStCO3FCQUV0QyxLQUFDLENBQUEsR0FBRCxDQUFLLElBQUwsRUFBVyxDQUNULENBQWtCLE1BQWxCLEdBQUEsVUFBQSxHQUFBLE1BRFMsRUFFVCxZQUZTLEVBRzJCLE9BQU8sQ0FBQyxRQUE1QyxHQUFBLGFBQUEsR0FBYyxPQUFPLENBQUMsUUFBdEIsR0FBQSxNQUhTLEVBSVQsUUFBQSxHQUFXLEtBQUMsQ0FBQSxRQUFELENBQVUsTUFBVixFQUFrQixJQUFsQixDQUpGLENBQVgsRUFLSztnQkFDRCxnQkFBQSxFQUFrQixJQURqQjtnQkFFRCxJQUFBLEVBQU07a0JBQ0osSUFBQSxFQUFNLHNDQURGO2lCQUZMO2dCQUtELE9BQUEsRUFBUyxTQUFDLEtBQUQ7eUJBQ1AsS0FBSyxDQUFDLEdBQU4sQ0FBQTtnQkFETyxDQUxSO2VBTEwsQ0FhRSxDQUFDLElBYkgsQ0FhUSxTQUFBO3VCQUNKLEtBQUMsQ0FBQSxRQUFELENBQVUsUUFBVjtjQURJLENBYlIsRUFQRjthQUFBLE1BQUE7Y0F3QkUsS0FBQyxDQUFBLE9BQUQsQ0FBUyxtQkFBVDtxQkFFQSxLQUFDLENBQUEsT0FBTyxDQUFDLE1BQVQsQ0FBZ0IsS0FBQyxDQUFBLG9CQUFELENBQ2QsUUFEYyxFQUVkO2dCQUNBLElBQUEsRUFBTSw4Q0FETjtnQkFFQSxPQUFBLEVBQVMsYUFGVDtnQkFHQSxVQUFBLEVBQVksYUFIWjtlQUZjLENBQWhCLEVBMUJGOztVQVRNO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUhSLEVBRkY7T0FBQSxNQUFBO2VBa0RFLElBQUMsQ0FBQSxHQUFELENBQUssUUFBTCxFQUFlLENBQ2IsWUFEYSxFQUV1QixPQUFPLENBQUMsUUFBNUMsR0FBQSxhQUFBLEdBQWMsT0FBTyxDQUFDLFFBQXRCLEdBQUEsTUFGYSxFQUdiLFFBQUEsR0FBVyxJQUFDLENBQUEsUUFBRCxDQUFVLE1BQVYsRUFBa0IsSUFBbEIsQ0FIRSxDQUFmLEVBSUs7VUFDRCxnQkFBQSxFQUFrQixJQURqQjtVQUVELElBQUEsRUFBTTtZQUNKLElBQUEsRUFBTSw4Q0FERjtXQUZMO1VBS0QsT0FBQSxFQUFTLFNBQUMsS0FBRDttQkFDUCxLQUFLLENBQUMsR0FBTixDQUFBO1VBRE8sQ0FMUjtTQUpMLENBWUUsQ0FBQyxJQVpILENBWVEsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQTttQkFDSixLQUFDLENBQUEsUUFBRCxDQUFVLFFBQVY7VUFESTtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FaUixFQWxERjs7SUFSUTs7OztLQWQwQjtBQVB0QyIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuUmVxdWlyZXMgaHR0cHM6Ly9naXRodWIuY29tL0ZyaWVuZHNPZlBIUC9waHBjYmZcbiMjI1xuXG5cInVzZSBzdHJpY3RcIlxuQmVhdXRpZmllciA9IHJlcXVpcmUoJy4vYmVhdXRpZmllcicpXG5cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgUEhQQ0JGIGV4dGVuZHMgQmVhdXRpZmllclxuICBuYW1lOiBcIlBIUENCRlwiXG4gIGxpbms6IFwiaHR0cDovL3BocC5uZXQvbWFudWFsL2VuL2luc3RhbGwucGhwXCJcbiAgaXNQcmVJbnN0YWxsZWQ6IGZhbHNlXG5cbiAgb3B0aW9uczoge1xuICAgIF86XG4gICAgICBzdGFuZGFyZDogW1wic3RhbmRhcmRcIiwgKHN0YW5kYXJkKSAtPlxuICAgICAgICBpZiAoc3RhbmRhcmQpIHRoZW4gXFxcbiAgICAgICAgICBzdGFuZGFyZCBlbHNlIFwiUEVBUlwiXG4gICAgICBdXG4gICAgUEhQOiB0cnVlXG4gIH1cblxuICBiZWF1dGlmeTogKHRleHQsIGxhbmd1YWdlLCBvcHRpb25zKSAtPlxuICAgIEBkZWJ1ZygncGhwY2JmJywgb3B0aW9ucylcbiAgICBzdGFuZGFyZEZpbGVzID0gWydwaHBjcy54bWwnLCAncGhwY3MueG1sLmRpc3QnLCAncGhwY3MucnVsZXNldC54bWwnLCAncnVsZXNldC54bWwnXVxuICAgIHN0YW5kYXJkRmlsZSA9IEBmaW5kRmlsZShhdG9tLnByb2plY3QuZ2V0UGF0aHMoKVswXSwgc3RhbmRhcmRGaWxlcylcblxuICAgIG9wdGlvbnMuc3RhbmRhcmQgPSBzdGFuZGFyZEZpbGUgaWYgc3RhbmRhcmRGaWxlXG5cbiAgICBpc1dpbiA9IEBpc1dpbmRvd3NcbiAgICBpZiBpc1dpblxuICAgICAgIyBGaW5kIHBocGNiZi5waGFyIHNjcmlwdFxuICAgICAgQFByb21pc2UuYWxsKFtcbiAgICAgICAgQHdoaWNoKG9wdGlvbnMucGhwY2JmX3BhdGgpIGlmIG9wdGlvbnMucGhwY2JmX3BhdGhcbiAgICAgICAgQHdoaWNoKCdwaHBjYmYnKVxuICAgICAgXSkudGhlbigocGF0aHMpID0+XG4gICAgICAgIEBkZWJ1ZygncGhwY2JmIHBhdGhzJywgcGF0aHMpXG4gICAgICAgIF8gPSByZXF1aXJlICdsb2Rhc2gnXG4gICAgICAgIHBhdGggPSByZXF1aXJlICdwYXRoJ1xuICAgICAgICAjIEdldCBmaXJzdCB2YWxpZCwgYWJzb2x1dGUgcGF0aFxuICAgICAgICBwaHBjYmZQYXRoID0gXy5maW5kKHBhdGhzLCAocCkgLT4gcCBhbmQgcGF0aC5pc0Fic29sdXRlKHApIClcbiAgICAgICAgQHZlcmJvc2UoJ3BocGNiZlBhdGgnLCBwaHBjYmZQYXRoKVxuICAgICAgICBAZGVidWcoJ3BocGNiZlBhdGgnLCBwaHBjYmZQYXRoLCBwYXRocylcbiAgICAgICAgIyBDaGVjayBpZiBwaHBjYmYgcGF0aCB3YXMgZm91bmRcbiAgICAgICAgaWYgcGhwY2JmUGF0aD9cbiAgICAgICAgICAjIEZvdW5kIHBocGNiZiBwYXRoXG5cbiAgICAgICAgICAjIENoZWNrIGlmIHBocGNiZiBpcyBhbiBleGVjdXRhYmxlXG4gICAgICAgICAgaXNFeGVjID0gcGF0aC5leHRuYW1lKHBocGNiZlBhdGgpIGlzbnQgJydcbiAgICAgICAgICBleGVjID0gaWYgaXNFeGVjIHRoZW4gcGhwY2JmUGF0aCBlbHNlIFwicGhwXCJcblxuICAgICAgICAgIEBydW4oZXhlYywgW1xuICAgICAgICAgICAgcGhwY2JmUGF0aCB1bmxlc3MgaXNFeGVjXG4gICAgICAgICAgICBcIi0tbm8tcGF0Y2hcIlxuICAgICAgICAgICAgXCItLXN0YW5kYXJkPSN7b3B0aW9ucy5zdGFuZGFyZH1cIiBpZiBvcHRpb25zLnN0YW5kYXJkXG4gICAgICAgICAgICB0ZW1wRmlsZSA9IEB0ZW1wRmlsZShcInRlbXBcIiwgdGV4dClcbiAgICAgICAgICAgIF0sIHtcbiAgICAgICAgICAgICAgaWdub3JlUmV0dXJuQ29kZTogdHJ1ZVxuICAgICAgICAgICAgICBoZWxwOiB7XG4gICAgICAgICAgICAgICAgbGluazogXCJodHRwOi8vcGhwLm5ldC9tYW51YWwvZW4vaW5zdGFsbC5waHBcIlxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIG9uU3RkaW46IChzdGRpbikgLT5cbiAgICAgICAgICAgICAgICBzdGRpbi5lbmQoKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC50aGVuKD0+XG4gICAgICAgICAgICAgIEByZWFkRmlsZSh0ZW1wRmlsZSlcbiAgICAgICAgICAgIClcbiAgICAgICAgZWxzZVxuICAgICAgICAgIEB2ZXJib3NlKCdwaHBjYmYgbm90IGZvdW5kIScpXG4gICAgICAgICAgIyBDb3VsZCBub3QgZmluZCBwaHBjYmYgcGF0aFxuICAgICAgICAgIEBQcm9taXNlLnJlamVjdChAY29tbWFuZE5vdEZvdW5kRXJyb3IoXG4gICAgICAgICAgICAncGhwY2JmJ1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgbGluazogXCJodHRwczovL2dpdGh1Yi5jb20vc3F1aXpsYWJzL1BIUF9Db2RlU25pZmZlclwiXG4gICAgICAgICAgICBwcm9ncmFtOiBcInBocGNiZi5waGFyXCJcbiAgICAgICAgICAgIHBhdGhPcHRpb246IFwiUEhQQ0JGIFBhdGhcIlxuICAgICAgICAgICAgfSlcbiAgICAgICAgICApXG4gICAgICApXG4gICAgZWxzZVxuICAgICAgQHJ1bihcInBocGNiZlwiLCBbXG4gICAgICAgIFwiLS1uby1wYXRjaFwiXG4gICAgICAgIFwiLS1zdGFuZGFyZD0je29wdGlvbnMuc3RhbmRhcmR9XCIgaWYgb3B0aW9ucy5zdGFuZGFyZFxuICAgICAgICB0ZW1wRmlsZSA9IEB0ZW1wRmlsZShcInRlbXBcIiwgdGV4dClcbiAgICAgICAgXSwge1xuICAgICAgICAgIGlnbm9yZVJldHVybkNvZGU6IHRydWVcbiAgICAgICAgICBoZWxwOiB7XG4gICAgICAgICAgICBsaW5rOiBcImh0dHBzOi8vZ2l0aHViLmNvbS9zcXVpemxhYnMvUEhQX0NvZGVTbmlmZmVyXCJcbiAgICAgICAgICB9XG4gICAgICAgICAgb25TdGRpbjogKHN0ZGluKSAtPlxuICAgICAgICAgICAgc3RkaW4uZW5kKClcbiAgICAgICAgfSlcbiAgICAgICAgLnRoZW4oPT5cbiAgICAgICAgICBAcmVhZEZpbGUodGVtcEZpbGUpXG4gICAgICAgIClcbiJdfQ==
