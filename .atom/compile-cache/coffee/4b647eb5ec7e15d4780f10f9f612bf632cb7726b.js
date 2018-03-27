
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
      var isWin, tempFile;
      this.debug('phpcbf', options);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvYXRvbS1iZWF1dGlmeS9zcmMvYmVhdXRpZmllcnMvcGhwY2JmLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7QUFBQTtFQUlBO0FBSkEsTUFBQSxrQkFBQTtJQUFBOzs7RUFLQSxVQUFBLEdBQWEsT0FBQSxDQUFRLGNBQVI7O0VBRWIsTUFBTSxDQUFDLE9BQVAsR0FBdUI7Ozs7Ozs7cUJBQ3JCLElBQUEsR0FBTTs7cUJBQ04sSUFBQSxHQUFNOztxQkFDTixjQUFBLEdBQWdCOztxQkFFaEIsT0FBQSxHQUFTO01BQ1AsQ0FBQSxFQUNFO1FBQUEsUUFBQSxFQUFVO1VBQUMsVUFBRCxFQUFhLFNBQUMsUUFBRDtZQUNyQixJQUFJLFFBQUo7cUJBQ0UsU0FERjthQUFBLE1BQUE7cUJBQ2dCLE9BRGhCOztVQURxQixDQUFiO1NBQVY7T0FGSztNQU1QLEdBQUEsRUFBSyxJQU5FOzs7cUJBU1QsUUFBQSxHQUFVLFNBQUMsSUFBRCxFQUFPLFFBQVAsRUFBaUIsT0FBakI7QUFDUixVQUFBO01BQUEsSUFBQyxDQUFBLEtBQUQsQ0FBTyxRQUFQLEVBQWlCLE9BQWpCO01BRUEsS0FBQSxHQUFRLElBQUMsQ0FBQTtNQUNULElBQUcsS0FBSDtlQUVFLElBQUMsQ0FBQSxPQUFPLENBQUMsR0FBVCxDQUFhLENBQ29CLE9BQU8sQ0FBQyxXQUF2QyxHQUFBLElBQUMsQ0FBQSxLQUFELENBQU8sT0FBTyxDQUFDLFdBQWYsQ0FBQSxHQUFBLE1BRFcsRUFFWCxJQUFDLENBQUEsS0FBRCxDQUFPLFFBQVAsQ0FGVyxDQUFiLENBR0UsQ0FBQyxJQUhILENBR1EsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQyxLQUFEO0FBQ04sZ0JBQUE7WUFBQSxLQUFDLENBQUEsS0FBRCxDQUFPLGNBQVAsRUFBdUIsS0FBdkI7WUFDQSxDQUFBLEdBQUksT0FBQSxDQUFRLFFBQVI7WUFDSixJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7WUFFUCxVQUFBLEdBQWEsQ0FBQyxDQUFDLElBQUYsQ0FBTyxLQUFQLEVBQWMsU0FBQyxDQUFEO3FCQUFPLENBQUEsSUFBTSxJQUFJLENBQUMsVUFBTCxDQUFnQixDQUFoQjtZQUFiLENBQWQ7WUFDYixLQUFDLENBQUEsT0FBRCxDQUFTLFlBQVQsRUFBdUIsVUFBdkI7WUFDQSxLQUFDLENBQUEsS0FBRCxDQUFPLFlBQVAsRUFBcUIsVUFBckIsRUFBaUMsS0FBakM7WUFFQSxJQUFHLGtCQUFIO2NBSUUsTUFBQSxHQUFTLElBQUksQ0FBQyxPQUFMLENBQWEsVUFBYixDQUFBLEtBQThCO2NBQ3ZDLElBQUEsR0FBVSxNQUFILEdBQWUsVUFBZixHQUErQjtxQkFFdEMsS0FBQyxDQUFBLEdBQUQsQ0FBSyxJQUFMLEVBQVcsQ0FDVCxDQUFrQixNQUFsQixHQUFBLFVBQUEsR0FBQSxNQURTLEVBRVQsWUFGUyxFQUcyQixPQUFPLENBQUMsUUFBNUMsR0FBQSxhQUFBLEdBQWMsT0FBTyxDQUFDLFFBQXRCLEdBQUEsTUFIUyxFQUlULFFBQUEsR0FBVyxLQUFDLENBQUEsUUFBRCxDQUFVLE1BQVYsRUFBa0IsSUFBbEIsQ0FKRixDQUFYLEVBS0s7Z0JBQ0QsZ0JBQUEsRUFBa0IsSUFEakI7Z0JBRUQsSUFBQSxFQUFNO2tCQUNKLElBQUEsRUFBTSxzQ0FERjtpQkFGTDtnQkFLRCxPQUFBLEVBQVMsU0FBQyxLQUFEO3lCQUNQLEtBQUssQ0FBQyxHQUFOLENBQUE7Z0JBRE8sQ0FMUjtlQUxMLENBYUUsQ0FBQyxJQWJILENBYVEsU0FBQTt1QkFDSixLQUFDLENBQUEsUUFBRCxDQUFVLFFBQVY7Y0FESSxDQWJSLEVBUEY7YUFBQSxNQUFBO2NBd0JFLEtBQUMsQ0FBQSxPQUFELENBQVMsbUJBQVQ7cUJBRUEsS0FBQyxDQUFBLE9BQU8sQ0FBQyxNQUFULENBQWdCLEtBQUMsQ0FBQSxvQkFBRCxDQUNkLFFBRGMsRUFFZDtnQkFDQSxJQUFBLEVBQU0sOENBRE47Z0JBRUEsT0FBQSxFQUFTLGFBRlQ7Z0JBR0EsVUFBQSxFQUFZLGFBSFo7ZUFGYyxDQUFoQixFQTFCRjs7VUFUTTtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FIUixFQUZGO09BQUEsTUFBQTtlQWtERSxJQUFDLENBQUEsR0FBRCxDQUFLLFFBQUwsRUFBZSxDQUNiLFlBRGEsRUFFdUIsT0FBTyxDQUFDLFFBQTVDLEdBQUEsYUFBQSxHQUFjLE9BQU8sQ0FBQyxRQUF0QixHQUFBLE1BRmEsRUFHYixRQUFBLEdBQVcsSUFBQyxDQUFBLFFBQUQsQ0FBVSxNQUFWLEVBQWtCLElBQWxCLENBSEUsQ0FBZixFQUlLO1VBQ0QsZ0JBQUEsRUFBa0IsSUFEakI7VUFFRCxJQUFBLEVBQU07WUFDSixJQUFBLEVBQU0sOENBREY7V0FGTDtVQUtELE9BQUEsRUFBUyxTQUFDLEtBQUQ7bUJBQ1AsS0FBSyxDQUFDLEdBQU4sQ0FBQTtVQURPLENBTFI7U0FKTCxDQVlFLENBQUMsSUFaSCxDQVlRLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUE7bUJBQ0osS0FBQyxDQUFBLFFBQUQsQ0FBVSxRQUFWO1VBREk7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBWlIsRUFsREY7O0lBSlE7Ozs7S0FkMEI7QUFQdEMiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcblJlcXVpcmVzIGh0dHBzOi8vZ2l0aHViLmNvbS9GcmllbmRzT2ZQSFAvcGhwY2JmXG4jIyNcblxuXCJ1c2Ugc3RyaWN0XCJcbkJlYXV0aWZpZXIgPSByZXF1aXJlKCcuL2JlYXV0aWZpZXInKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIFBIUENCRiBleHRlbmRzIEJlYXV0aWZpZXJcbiAgbmFtZTogXCJQSFBDQkZcIlxuICBsaW5rOiBcImh0dHA6Ly9waHAubmV0L21hbnVhbC9lbi9pbnN0YWxsLnBocFwiXG4gIGlzUHJlSW5zdGFsbGVkOiBmYWxzZVxuXG4gIG9wdGlvbnM6IHtcbiAgICBfOlxuICAgICAgc3RhbmRhcmQ6IFtcInN0YW5kYXJkXCIsIChzdGFuZGFyZCkgLT5cbiAgICAgICAgaWYgKHN0YW5kYXJkKSB0aGVuIFxcXG4gICAgICAgICAgc3RhbmRhcmQgZWxzZSBcIlBFQVJcIlxuICAgICAgXVxuICAgIFBIUDogdHJ1ZVxuICB9XG5cbiAgYmVhdXRpZnk6ICh0ZXh0LCBsYW5ndWFnZSwgb3B0aW9ucykgLT5cbiAgICBAZGVidWcoJ3BocGNiZicsIG9wdGlvbnMpXG5cbiAgICBpc1dpbiA9IEBpc1dpbmRvd3NcbiAgICBpZiBpc1dpblxuICAgICAgIyBGaW5kIHBocGNiZi5waGFyIHNjcmlwdFxuICAgICAgQFByb21pc2UuYWxsKFtcbiAgICAgICAgQHdoaWNoKG9wdGlvbnMucGhwY2JmX3BhdGgpIGlmIG9wdGlvbnMucGhwY2JmX3BhdGhcbiAgICAgICAgQHdoaWNoKCdwaHBjYmYnKVxuICAgICAgXSkudGhlbigocGF0aHMpID0+XG4gICAgICAgIEBkZWJ1ZygncGhwY2JmIHBhdGhzJywgcGF0aHMpXG4gICAgICAgIF8gPSByZXF1aXJlICdsb2Rhc2gnXG4gICAgICAgIHBhdGggPSByZXF1aXJlICdwYXRoJ1xuICAgICAgICAjIEdldCBmaXJzdCB2YWxpZCwgYWJzb2x1dGUgcGF0aFxuICAgICAgICBwaHBjYmZQYXRoID0gXy5maW5kKHBhdGhzLCAocCkgLT4gcCBhbmQgcGF0aC5pc0Fic29sdXRlKHApIClcbiAgICAgICAgQHZlcmJvc2UoJ3BocGNiZlBhdGgnLCBwaHBjYmZQYXRoKVxuICAgICAgICBAZGVidWcoJ3BocGNiZlBhdGgnLCBwaHBjYmZQYXRoLCBwYXRocylcbiAgICAgICAgIyBDaGVjayBpZiBwaHBjYmYgcGF0aCB3YXMgZm91bmRcbiAgICAgICAgaWYgcGhwY2JmUGF0aD9cbiAgICAgICAgICAjIEZvdW5kIHBocGNiZiBwYXRoXG5cbiAgICAgICAgICAjIENoZWNrIGlmIHBocGNiZiBpcyBhbiBleGVjdXRhYmxlXG4gICAgICAgICAgaXNFeGVjID0gcGF0aC5leHRuYW1lKHBocGNiZlBhdGgpIGlzbnQgJydcbiAgICAgICAgICBleGVjID0gaWYgaXNFeGVjIHRoZW4gcGhwY2JmUGF0aCBlbHNlIFwicGhwXCJcblxuICAgICAgICAgIEBydW4oZXhlYywgW1xuICAgICAgICAgICAgcGhwY2JmUGF0aCB1bmxlc3MgaXNFeGVjXG4gICAgICAgICAgICBcIi0tbm8tcGF0Y2hcIlxuICAgICAgICAgICAgXCItLXN0YW5kYXJkPSN7b3B0aW9ucy5zdGFuZGFyZH1cIiBpZiBvcHRpb25zLnN0YW5kYXJkXG4gICAgICAgICAgICB0ZW1wRmlsZSA9IEB0ZW1wRmlsZShcInRlbXBcIiwgdGV4dClcbiAgICAgICAgICAgIF0sIHtcbiAgICAgICAgICAgICAgaWdub3JlUmV0dXJuQ29kZTogdHJ1ZVxuICAgICAgICAgICAgICBoZWxwOiB7XG4gICAgICAgICAgICAgICAgbGluazogXCJodHRwOi8vcGhwLm5ldC9tYW51YWwvZW4vaW5zdGFsbC5waHBcIlxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIG9uU3RkaW46IChzdGRpbikgLT5cbiAgICAgICAgICAgICAgICBzdGRpbi5lbmQoKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC50aGVuKD0+XG4gICAgICAgICAgICAgIEByZWFkRmlsZSh0ZW1wRmlsZSlcbiAgICAgICAgICAgIClcbiAgICAgICAgZWxzZVxuICAgICAgICAgIEB2ZXJib3NlKCdwaHBjYmYgbm90IGZvdW5kIScpXG4gICAgICAgICAgIyBDb3VsZCBub3QgZmluZCBwaHBjYmYgcGF0aFxuICAgICAgICAgIEBQcm9taXNlLnJlamVjdChAY29tbWFuZE5vdEZvdW5kRXJyb3IoXG4gICAgICAgICAgICAncGhwY2JmJ1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgbGluazogXCJodHRwczovL2dpdGh1Yi5jb20vc3F1aXpsYWJzL1BIUF9Db2RlU25pZmZlclwiXG4gICAgICAgICAgICBwcm9ncmFtOiBcInBocGNiZi5waGFyXCJcbiAgICAgICAgICAgIHBhdGhPcHRpb246IFwiUEhQQ0JGIFBhdGhcIlxuICAgICAgICAgICAgfSlcbiAgICAgICAgICApXG4gICAgICApXG4gICAgZWxzZVxuICAgICAgQHJ1bihcInBocGNiZlwiLCBbXG4gICAgICAgIFwiLS1uby1wYXRjaFwiXG4gICAgICAgIFwiLS1zdGFuZGFyZD0je29wdGlvbnMuc3RhbmRhcmR9XCIgaWYgb3B0aW9ucy5zdGFuZGFyZFxuICAgICAgICB0ZW1wRmlsZSA9IEB0ZW1wRmlsZShcInRlbXBcIiwgdGV4dClcbiAgICAgICAgXSwge1xuICAgICAgICAgIGlnbm9yZVJldHVybkNvZGU6IHRydWVcbiAgICAgICAgICBoZWxwOiB7XG4gICAgICAgICAgICBsaW5rOiBcImh0dHBzOi8vZ2l0aHViLmNvbS9zcXVpemxhYnMvUEhQX0NvZGVTbmlmZmVyXCJcbiAgICAgICAgICB9XG4gICAgICAgICAgb25TdGRpbjogKHN0ZGluKSAtPlxuICAgICAgICAgICAgc3RkaW4uZW5kKClcbiAgICAgICAgfSlcbiAgICAgICAgLnRoZW4oPT5cbiAgICAgICAgICBAcmVhZEZpbGUodGVtcEZpbGUpXG4gICAgICAgIClcbiJdfQ==
