
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
      PHP: {
        phpcbf_path: true,
        phpcbf_version: true,
        standard: true
      }
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
              return _this.run(exec, [!isExec ? phpcbfPath : void 0, options.phpcbf_version !== 3 ? "--no-patch" : void 0, options.standard ? "--standard=" + options.standard : void 0, tempFile = _this.tempFile("temp", text)], {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvYXRvbS1iZWF1dGlmeS9zcmMvYmVhdXRpZmllcnMvcGhwY2JmLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7QUFBQTtFQUlBO0FBSkEsTUFBQSxrQkFBQTtJQUFBOzs7RUFLQSxVQUFBLEdBQWEsT0FBQSxDQUFRLGNBQVI7O0VBRWIsTUFBTSxDQUFDLE9BQVAsR0FBdUI7Ozs7Ozs7cUJBQ3JCLElBQUEsR0FBTTs7cUJBQ04sSUFBQSxHQUFNOztxQkFDTixjQUFBLEdBQWdCOztxQkFFaEIsT0FBQSxHQUFTO01BQ1AsR0FBQSxFQUNFO1FBQUEsV0FBQSxFQUFhLElBQWI7UUFDQSxjQUFBLEVBQWdCLElBRGhCO1FBRUEsUUFBQSxFQUFVLElBRlY7T0FGSzs7O3FCQU9ULFFBQUEsR0FBVSxTQUFDLElBQUQsRUFBTyxRQUFQLEVBQWlCLE9BQWpCO0FBQ1IsVUFBQTtNQUFBLElBQUMsQ0FBQSxLQUFELENBQU8sUUFBUCxFQUFpQixPQUFqQjtNQUNBLGFBQUEsR0FBZ0IsQ0FBQyxXQUFELEVBQWMsZ0JBQWQsRUFBZ0MsbUJBQWhDLEVBQXFELGFBQXJEO01BQ2hCLFlBQUEsR0FBZSxJQUFDLENBQUEsUUFBRCxDQUFVLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBYixDQUFBLENBQXdCLENBQUEsQ0FBQSxDQUFsQyxFQUFzQyxhQUF0QztNQUVmLElBQW1DLFlBQW5DO1FBQUEsT0FBTyxDQUFDLFFBQVIsR0FBbUIsYUFBbkI7O01BRUEsS0FBQSxHQUFRLElBQUMsQ0FBQTtNQUNULElBQUcsS0FBSDtlQUVFLElBQUMsQ0FBQSxPQUFPLENBQUMsR0FBVCxDQUFhLENBQ29CLE9BQU8sQ0FBQyxXQUF2QyxHQUFBLElBQUMsQ0FBQSxLQUFELENBQU8sT0FBTyxDQUFDLFdBQWYsQ0FBQSxHQUFBLE1BRFcsRUFFWCxJQUFDLENBQUEsS0FBRCxDQUFPLFFBQVAsQ0FGVyxDQUFiLENBR0UsQ0FBQyxJQUhILENBR1EsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQyxLQUFEO0FBQ04sZ0JBQUE7WUFBQSxLQUFDLENBQUEsS0FBRCxDQUFPLGNBQVAsRUFBdUIsS0FBdkI7WUFDQSxDQUFBLEdBQUksT0FBQSxDQUFRLFFBQVI7WUFDSixJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7WUFFUCxVQUFBLEdBQWEsQ0FBQyxDQUFDLElBQUYsQ0FBTyxLQUFQLEVBQWMsU0FBQyxDQUFEO3FCQUFPLENBQUEsSUFBTSxJQUFJLENBQUMsVUFBTCxDQUFnQixDQUFoQjtZQUFiLENBQWQ7WUFDYixLQUFDLENBQUEsT0FBRCxDQUFTLFlBQVQsRUFBdUIsVUFBdkI7WUFDQSxLQUFDLENBQUEsS0FBRCxDQUFPLFlBQVAsRUFBcUIsVUFBckIsRUFBaUMsS0FBakM7WUFFQSxJQUFHLGtCQUFIO2NBSUUsTUFBQSxHQUFTLElBQUksQ0FBQyxPQUFMLENBQWEsVUFBYixDQUFBLEtBQThCO2NBQ3ZDLElBQUEsR0FBVSxNQUFILEdBQWUsVUFBZixHQUErQjtxQkFFdEMsS0FBQyxDQUFBLEdBQUQsQ0FBSyxJQUFMLEVBQVcsQ0FDVCxDQUFrQixNQUFsQixHQUFBLFVBQUEsR0FBQSxNQURTLEVBRVcsT0FBTyxDQUFDLGNBQVIsS0FBMEIsQ0FBOUMsR0FBQSxZQUFBLEdBQUEsTUFGUyxFQUcyQixPQUFPLENBQUMsUUFBNUMsR0FBQSxhQUFBLEdBQWMsT0FBTyxDQUFDLFFBQXRCLEdBQUEsTUFIUyxFQUlULFFBQUEsR0FBVyxLQUFDLENBQUEsUUFBRCxDQUFVLE1BQVYsRUFBa0IsSUFBbEIsQ0FKRixDQUFYLEVBS0s7Z0JBQ0QsZ0JBQUEsRUFBa0IsSUFEakI7Z0JBRUQsSUFBQSxFQUFNO2tCQUNKLElBQUEsRUFBTSxzQ0FERjtpQkFGTDtnQkFLRCxPQUFBLEVBQVMsU0FBQyxLQUFEO3lCQUNQLEtBQUssQ0FBQyxHQUFOLENBQUE7Z0JBRE8sQ0FMUjtlQUxMLENBYUUsQ0FBQyxJQWJILENBYVEsU0FBQTt1QkFDSixLQUFDLENBQUEsUUFBRCxDQUFVLFFBQVY7Y0FESSxDQWJSLEVBUEY7YUFBQSxNQUFBO2NBd0JFLEtBQUMsQ0FBQSxPQUFELENBQVMsbUJBQVQ7cUJBRUEsS0FBQyxDQUFBLE9BQU8sQ0FBQyxNQUFULENBQWdCLEtBQUMsQ0FBQSxvQkFBRCxDQUNkLFFBRGMsRUFFZDtnQkFDQSxJQUFBLEVBQU0sOENBRE47Z0JBRUEsT0FBQSxFQUFTLGFBRlQ7Z0JBR0EsVUFBQSxFQUFZLGFBSFo7ZUFGYyxDQUFoQixFQTFCRjs7VUFUTTtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FIUixFQUZGO09BQUEsTUFBQTtlQWtERSxJQUFDLENBQUEsR0FBRCxDQUFLLFFBQUwsRUFBZSxDQUNiLFlBRGEsRUFFdUIsT0FBTyxDQUFDLFFBQTVDLEdBQUEsYUFBQSxHQUFjLE9BQU8sQ0FBQyxRQUF0QixHQUFBLE1BRmEsRUFHYixRQUFBLEdBQVcsSUFBQyxDQUFBLFFBQUQsQ0FBVSxNQUFWLEVBQWtCLElBQWxCLENBSEUsQ0FBZixFQUlLO1VBQ0QsZ0JBQUEsRUFBa0IsSUFEakI7VUFFRCxJQUFBLEVBQU07WUFDSixJQUFBLEVBQU0sOENBREY7V0FGTDtVQUtELE9BQUEsRUFBUyxTQUFDLEtBQUQ7bUJBQ1AsS0FBSyxDQUFDLEdBQU4sQ0FBQTtVQURPLENBTFI7U0FKTCxDQVlFLENBQUMsSUFaSCxDQVlRLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUE7bUJBQ0osS0FBQyxDQUFBLFFBQUQsQ0FBVSxRQUFWO1VBREk7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBWlIsRUFsREY7O0lBUlE7Ozs7S0FaMEI7QUFQdEMiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcblJlcXVpcmVzIGh0dHBzOi8vZ2l0aHViLmNvbS9GcmllbmRzT2ZQSFAvcGhwY2JmXG4jIyNcblxuXCJ1c2Ugc3RyaWN0XCJcbkJlYXV0aWZpZXIgPSByZXF1aXJlKCcuL2JlYXV0aWZpZXInKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIFBIUENCRiBleHRlbmRzIEJlYXV0aWZpZXJcbiAgbmFtZTogXCJQSFBDQkZcIlxuICBsaW5rOiBcImh0dHA6Ly9waHAubmV0L21hbnVhbC9lbi9pbnN0YWxsLnBocFwiXG4gIGlzUHJlSW5zdGFsbGVkOiBmYWxzZVxuXG4gIG9wdGlvbnM6IHtcbiAgICBQSFA6XG4gICAgICBwaHBjYmZfcGF0aDogdHJ1ZVxuICAgICAgcGhwY2JmX3ZlcnNpb246IHRydWVcbiAgICAgIHN0YW5kYXJkOiB0cnVlXG4gIH1cblxuICBiZWF1dGlmeTogKHRleHQsIGxhbmd1YWdlLCBvcHRpb25zKSAtPlxuICAgIEBkZWJ1ZygncGhwY2JmJywgb3B0aW9ucylcbiAgICBzdGFuZGFyZEZpbGVzID0gWydwaHBjcy54bWwnLCAncGhwY3MueG1sLmRpc3QnLCAncGhwY3MucnVsZXNldC54bWwnLCAncnVsZXNldC54bWwnXVxuICAgIHN0YW5kYXJkRmlsZSA9IEBmaW5kRmlsZShhdG9tLnByb2plY3QuZ2V0UGF0aHMoKVswXSwgc3RhbmRhcmRGaWxlcylcblxuICAgIG9wdGlvbnMuc3RhbmRhcmQgPSBzdGFuZGFyZEZpbGUgaWYgc3RhbmRhcmRGaWxlXG5cbiAgICBpc1dpbiA9IEBpc1dpbmRvd3NcbiAgICBpZiBpc1dpblxuICAgICAgIyBGaW5kIHBocGNiZi5waGFyIHNjcmlwdFxuICAgICAgQFByb21pc2UuYWxsKFtcbiAgICAgICAgQHdoaWNoKG9wdGlvbnMucGhwY2JmX3BhdGgpIGlmIG9wdGlvbnMucGhwY2JmX3BhdGhcbiAgICAgICAgQHdoaWNoKCdwaHBjYmYnKVxuICAgICAgXSkudGhlbigocGF0aHMpID0+XG4gICAgICAgIEBkZWJ1ZygncGhwY2JmIHBhdGhzJywgcGF0aHMpXG4gICAgICAgIF8gPSByZXF1aXJlICdsb2Rhc2gnXG4gICAgICAgIHBhdGggPSByZXF1aXJlICdwYXRoJ1xuICAgICAgICAjIEdldCBmaXJzdCB2YWxpZCwgYWJzb2x1dGUgcGF0aFxuICAgICAgICBwaHBjYmZQYXRoID0gXy5maW5kKHBhdGhzLCAocCkgLT4gcCBhbmQgcGF0aC5pc0Fic29sdXRlKHApIClcbiAgICAgICAgQHZlcmJvc2UoJ3BocGNiZlBhdGgnLCBwaHBjYmZQYXRoKVxuICAgICAgICBAZGVidWcoJ3BocGNiZlBhdGgnLCBwaHBjYmZQYXRoLCBwYXRocylcbiAgICAgICAgIyBDaGVjayBpZiBwaHBjYmYgcGF0aCB3YXMgZm91bmRcbiAgICAgICAgaWYgcGhwY2JmUGF0aD9cbiAgICAgICAgICAjIEZvdW5kIHBocGNiZiBwYXRoXG5cbiAgICAgICAgICAjIENoZWNrIGlmIHBocGNiZiBpcyBhbiBleGVjdXRhYmxlXG4gICAgICAgICAgaXNFeGVjID0gcGF0aC5leHRuYW1lKHBocGNiZlBhdGgpIGlzbnQgJydcbiAgICAgICAgICBleGVjID0gaWYgaXNFeGVjIHRoZW4gcGhwY2JmUGF0aCBlbHNlIFwicGhwXCJcblxuICAgICAgICAgIEBydW4oZXhlYywgW1xuICAgICAgICAgICAgcGhwY2JmUGF0aCB1bmxlc3MgaXNFeGVjXG4gICAgICAgICAgICBcIi0tbm8tcGF0Y2hcIiB1bmxlc3Mgb3B0aW9ucy5waHBjYmZfdmVyc2lvbiBpcyAzXG4gICAgICAgICAgICBcIi0tc3RhbmRhcmQ9I3tvcHRpb25zLnN0YW5kYXJkfVwiIGlmIG9wdGlvbnMuc3RhbmRhcmRcbiAgICAgICAgICAgIHRlbXBGaWxlID0gQHRlbXBGaWxlKFwidGVtcFwiLCB0ZXh0KVxuICAgICAgICAgICAgXSwge1xuICAgICAgICAgICAgICBpZ25vcmVSZXR1cm5Db2RlOiB0cnVlXG4gICAgICAgICAgICAgIGhlbHA6IHtcbiAgICAgICAgICAgICAgICBsaW5rOiBcImh0dHA6Ly9waHAubmV0L21hbnVhbC9lbi9pbnN0YWxsLnBocFwiXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgb25TdGRpbjogKHN0ZGluKSAtPlxuICAgICAgICAgICAgICAgIHN0ZGluLmVuZCgpXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLnRoZW4oPT5cbiAgICAgICAgICAgICAgQHJlYWRGaWxlKHRlbXBGaWxlKVxuICAgICAgICAgICAgKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgQHZlcmJvc2UoJ3BocGNiZiBub3QgZm91bmQhJylcbiAgICAgICAgICAjIENvdWxkIG5vdCBmaW5kIHBocGNiZiBwYXRoXG4gICAgICAgICAgQFByb21pc2UucmVqZWN0KEBjb21tYW5kTm90Rm91bmRFcnJvcihcbiAgICAgICAgICAgICdwaHBjYmYnXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICBsaW5rOiBcImh0dHBzOi8vZ2l0aHViLmNvbS9zcXVpemxhYnMvUEhQX0NvZGVTbmlmZmVyXCJcbiAgICAgICAgICAgIHByb2dyYW06IFwicGhwY2JmLnBoYXJcIlxuICAgICAgICAgICAgcGF0aE9wdGlvbjogXCJQSFBDQkYgUGF0aFwiXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIClcbiAgICAgIClcbiAgICBlbHNlXG4gICAgICBAcnVuKFwicGhwY2JmXCIsIFtcbiAgICAgICAgXCItLW5vLXBhdGNoXCJcbiAgICAgICAgXCItLXN0YW5kYXJkPSN7b3B0aW9ucy5zdGFuZGFyZH1cIiBpZiBvcHRpb25zLnN0YW5kYXJkXG4gICAgICAgIHRlbXBGaWxlID0gQHRlbXBGaWxlKFwidGVtcFwiLCB0ZXh0KVxuICAgICAgICBdLCB7XG4gICAgICAgICAgaWdub3JlUmV0dXJuQ29kZTogdHJ1ZVxuICAgICAgICAgIGhlbHA6IHtcbiAgICAgICAgICAgIGxpbms6IFwiaHR0cHM6Ly9naXRodWIuY29tL3NxdWl6bGFicy9QSFBfQ29kZVNuaWZmZXJcIlxuICAgICAgICAgIH1cbiAgICAgICAgICBvblN0ZGluOiAoc3RkaW4pIC0+XG4gICAgICAgICAgICBzdGRpbi5lbmQoKVxuICAgICAgICB9KVxuICAgICAgICAudGhlbig9PlxuICAgICAgICAgIEByZWFkRmlsZSh0ZW1wRmlsZSlcbiAgICAgICAgKVxuIl19
