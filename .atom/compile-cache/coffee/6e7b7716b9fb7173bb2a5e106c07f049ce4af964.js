
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

    PHPCBF.prototype.executables = [
      {
        name: "PHPCBF",
        cmd: "phpcbf",
        homepage: "https://github.com/squizlabs/PHP_CodeSniffer",
        installation: "https://github.com/squizlabs/PHP_CodeSniffer#installation",
        version: {
          args: ['--version']
        },
        docker: {
          image: "unibeautify/phpcbf"
        }
      }
    ];

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
              return _this.run(exec, [!isExec ? phpcbfPath : void 0, options.phpcbf_version !== 3 ? "--no-patch" : void 0, options.standard ? "--standard=" + options.standard : void 0, tempFile = _this.tempFile("temp", text, ".php")], {
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
        return this.run("phpcbf", [options.phpcbf_version !== 3 ? "--no-patch" : void 0, options.standard ? "--standard=" + options.standard : void 0, tempFile = this.tempFile("temp", text, ".php")], {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvYXRvbS1iZWF1dGlmeS9zcmMvYmVhdXRpZmllcnMvcGhwY2JmLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7QUFBQTtFQUlBO0FBSkEsTUFBQSxrQkFBQTtJQUFBOzs7RUFLQSxVQUFBLEdBQWEsT0FBQSxDQUFRLGNBQVI7O0VBRWIsTUFBTSxDQUFDLE9BQVAsR0FBdUI7Ozs7Ozs7cUJBQ3JCLElBQUEsR0FBTTs7cUJBQ04sSUFBQSxHQUFNOztxQkFDTixXQUFBLEdBQWE7TUFDWDtRQUNFLElBQUEsRUFBTSxRQURSO1FBRUUsR0FBQSxFQUFLLFFBRlA7UUFHRSxRQUFBLEVBQVUsOENBSFo7UUFJRSxZQUFBLEVBQWMsMkRBSmhCO1FBS0UsT0FBQSxFQUFTO1VBQ1AsSUFBQSxFQUFNLENBQUMsV0FBRCxDQURDO1NBTFg7UUFRRSxNQUFBLEVBQVE7VUFDTixLQUFBLEVBQU8sb0JBREQ7U0FSVjtPQURXOzs7cUJBY2IsY0FBQSxHQUFnQjs7cUJBRWhCLE9BQUEsR0FBUztNQUNQLEdBQUEsRUFDRTtRQUFBLFdBQUEsRUFBYSxJQUFiO1FBQ0EsY0FBQSxFQUFnQixJQURoQjtRQUVBLFFBQUEsRUFBVSxJQUZWO09BRks7OztxQkFPVCxRQUFBLEdBQVUsU0FBQyxJQUFELEVBQU8sUUFBUCxFQUFpQixPQUFqQjtBQUNSLFVBQUE7TUFBQSxJQUFDLENBQUEsS0FBRCxDQUFPLFFBQVAsRUFBaUIsT0FBakI7TUFDQSxhQUFBLEdBQWdCLENBQUMsV0FBRCxFQUFjLGdCQUFkLEVBQWdDLG1CQUFoQyxFQUFxRCxhQUFyRDtNQUNoQixZQUFBLEdBQWUsSUFBQyxDQUFBLFFBQUQsQ0FBVSxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQWIsQ0FBQSxDQUF3QixDQUFBLENBQUEsQ0FBbEMsRUFBc0MsYUFBdEM7TUFFZixJQUFtQyxZQUFuQztRQUFBLE9BQU8s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QkFBQSxTQUFBO21CQUNKLEtBQUMsQ0FBQSxRQUFELENBQVUsUUFBVjtVQURJO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQVpSLEVBbERGOztJQVJROzs7O0tBMUIwQjtBQVB0QyIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuUmVxdWlyZXMgaHR0cHM6Ly9naXRodWIuY29tL0ZyaWVuZHNPZlBIUC9waHBjYmZcbiMjI1xuXG5cInVzZSBzdHJpY3RcIlxuQmVhdXRpZmllciA9IHJlcXVpcmUoJy4vYmVhdXRpZmllcicpXG5cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgUEhQQ0JGIGV4dGVuZHMgQmVhdXRpZmllclxuICBuYW1lOiBcIlBIUENCRlwiXG4gIGxpbms6IFwiaHR0cDovL3BocC5uZXQvbWFudWFsL2VuL2luc3RhbGwucGhwXCJcbiAgZXhlY3V0YWJsZXM6IFtcbiAgICB7XG4gICAgICBuYW1lOiBcIlBIUENCRlwiXG4gICAgICBjbWQ6IFwicGhwY2JmXCJcbiAgICAgIGhvbWVwYWdlOiBcImh0dHBzOi8vZ2l0aHViLmNvbS9zcXVpemxhYnMvUEhQX0NvZGVTbmlmZmVyXCJcbiAgICAgIGluc3RhbGxhdGlvbjogXCJodHRwczovL2dpdGh1Yi5jb20vc3F1aXpsYWJzL1BIUF9Db2RlU25pZmZlciNpbnN0YWxsYXRpb25cIlxuICAgICAgdmVyc2lvbjoge1xuICAgICAgICBhcmdzOiBbJy0tdmVyc2lvbiddXG4gICAgICB9XG4gICAgICBkb2NrZXI6IHtcbiAgICAgICAgaW1hZ2U6IFwidW5pYmVhdXRpZnkvcGhwY2JmXCJcbiAgICAgIH1cbiAgICB9XG4gIF1cbiAgaXNQcmVJbnN0YWxsZWQ6IGZhbHNlXG5cbiAgb3B0aW9uczoge1xuICAgIFBIUDpcbiAgICAgIHBocGNiZl9wYXRoOiB0cnVlXG4gICAgICBwaHBjYmZfdmVyc2lvbjogdHJ1ZVxuICAgICAgc3RhbmRhcmQ6IHRydWVcbiAgfVxuXG4gIGJlYXV0aWZ5OiAodGV4dCwgbGFuZ3VhZ2UsIG9wdGlvbnMpIC0+XG4gICAgQGRlYnVnKCdwaHBjYmYnLCBvcHRpb25zKVxuICAgIHN0YW5kYXJkRmlsZXMgPSBbJ3BocGNzLnhtbCcsICdwaHBjcy54bWwuZGlzdCcsICdwaHBjcy5ydWxlc2V0LnhtbCcsICdydWxlc2V0LnhtbCddXG4gICAgc3RhbmRhcmRGaWxlID0gQGZpbmRGaWxlKGF0b20ucHJvamVjdC5nZXRQYXRocygpWzBdLCBzdGFuZGFyZEZpbGVzKVxuXG4gICAgb3B0aW9ucy5zdGFuZGFyZCA9IHN0YW5kYXJkRmlsZSBpZiBzdGFuZGFyZEZpbGVcblxuICAgIGlzV2luID0gQGlzV2luZG93c1xuICAgIGlmIGlzV2luXG4gICAgICAjIEZpbmQgcGhwY2JmLnBoYXIgc2NyaXB0XG4gICAgICBAUHJvbWlzZS5hbGwoW1xuICAgICAgICBAd2hpY2gob3B0aW9ucy5waHBjYmZfcGF0aCkgaWYgb3B0aW9ucy5waHBjYmZfcGF0aFxuICAgICAgICBAd2hpY2goJ3BocGNiZicpXG4gICAgICBdKS50aGVuKChwYXRocykgPT5cbiAgICAgICAgQGRlYnVnKCdwaHBjYmYgcGF0aHMnLCBwYXRocylcbiAgICAgICAgXyA9IHJlcXVpcmUgJ2xvZGFzaCdcbiAgICAgICAgcGF0aCA9IHJlcXVpcmUgJ3BhdGgnXG4gICAgICAgICMgR2V0IGZpcnN0IHZhbGlkLCBhYnNvbHV0ZSBwYXRoXG4gICAgICAgIHBocGNiZlBhdGggPSBfLmZpbmQocGF0aHMsIChwKSAtPiBwIGFuZCBwYXRoLmlzQWJzb2x1dGUocCkgKVxuICAgICAgICBAdmVyYm9zZSgncGhwY2JmUGF0aCcsIHBocGNiZlBhdGgpXG4gICAgICAgIEBkZWJ1ZygncGhwY2JmUGF0aCcsIHBocGNiZlBhdGgsIHBhdGhzKVxuICAgICAgICAjIENoZWNrIGlmIHBocGNiZiBwYXRoIHdhcyBmb3VuZFxuICAgICAgICBpZiBwaHBjYmZQYXRoP1xuICAgICAgICAgICMgRm91bmQgcGhwY2JmIHBhdGhcblxuICAgICAgICAgICMgQ2hlY2sgaWYgcGhwY2JmIGlzIGFuIGV4ZWN1dGFibGVcbiAgICAgICAgICBpc0V4ZWMgPSBwYXRoLmV4dG5hbWUocGhwY2JmUGF0aCkgaXNudCAnJ1xuICAgICAgICAgIGV4ZWMgPSBpZiBpc0V4ZWMgdGhlbiBwaHBjYmZQYXRoIGVsc2UgXCJwaHBcIlxuXG4gICAgICAgICAgQHJ1bihleGVjLCBbXG4gICAgICAgICAgICBwaHBjYmZQYXRoIHVubGVzcyBpc0V4ZWNcbiAgICAgICAgICAgIFwiLS1uby1wYXRjaFwiIHVubGVzcyBvcHRpb25zLnBocGNiZl92ZXJzaW9uIGlzIDNcbiAgICAgICAgICAgIFwiLS1zdGFuZGFyZD0je29wdGlvbnMuc3RhbmRhcmR9XCIgaWYgb3B0aW9ucy5zdGFuZGFyZFxuICAgICAgICAgICAgdGVtcEZpbGUgPSBAdGVtcEZpbGUoXCJ0ZW1wXCIsIHRleHQsIFwiLnBocFwiKVxuICAgICAgICAgICAgXSwge1xuICAgICAgICAgICAgICBpZ25vcmVSZXR1cm5Db2RlOiB0cnVlXG4gICAgICAgICAgICAgIGhlbHA6IHtcbiAgICAgICAgICAgICAgICBsaW5rOiBcImh0dHA6Ly9waHAubmV0L21hbnVhbC9lbi9pbnN0YWxsLnBocFwiXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgb25TdGRpbjogKHN0ZGluKSAtPlxuICAgICAgICAgICAgICAgIHN0ZGluLmVuZCgpXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLnRoZW4oPT5cbiAgICAgICAgICAgICAgQHJlYWRGaWxlKHRlbXBGaWxlKVxuICAgICAgICAgICAgKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgQHZlcmJvc2UoJ3BocGNiZiBub3QgZm91bmQhJylcbiAgICAgICAgICAjIENvdWxkIG5vdCBmaW5kIHBocGNiZiBwYXRoXG4gICAgICAgICAgQFByb21pc2UucmVqZWN0KEBjb21tYW5kTm90Rm91bmRFcnJvcihcbiAgICAgICAgICAgICdwaHBjYmYnXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICBsaW5rOiBcImh0dHBzOi8vZ2l0aHViLmNvbS9zcXVpemxhYnMvUEhQX0NvZGVTbmlmZmVyXCJcbiAgICAgICAgICAgIHByb2dyYW06IFwicGhwY2JmLnBoYXJcIlxuICAgICAgICAgICAgcGF0aE9wdGlvbjogXCJQSFBDQkYgUGF0aFwiXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIClcbiAgICAgIClcbiAgICBlbHNlXG4gICAgICBAcnVuKFwicGhwY2JmXCIsIFtcbiAgICAgICAgXCItLW5vLXBhdGNoXCIgdW5sZXNzIG9wdGlvbnMucGhwY2JmX3ZlcnNpb24gaXMgM1xuICAgICAgICBcIi0tc3RhbmRhcmQ9I3tvcHRpb25zLnN0YW5kYXJkfVwiIGlmIG9wdGlvbnMuc3RhbmRhcmRcbiAgICAgICAgdGVtcEZpbGUgPSBAdGVtcEZpbGUoXCJ0ZW1wXCIsIHRleHQsIFwiLnBocFwiKVxuICAgICAgICBdLCB7XG4gICAgICAgICAgaWdub3JlUmV0dXJuQ29kZTogdHJ1ZVxuICAgICAgICAgIGhlbHA6IHtcbiAgICAgICAgICAgIGxpbms6IFwiaHR0cHM6Ly9naXRodWIuY29tL3NxdWl6bGFicy9QSFBfQ29kZVNuaWZmZXJcIlxuICAgICAgICAgIH1cbiAgICAgICAgICBvblN0ZGluOiAoc3RkaW4pIC0+XG4gICAgICAgICAgICBzdGRpbi5lbmQoKVxuICAgICAgICB9KVxuICAgICAgICAudGhlbig9PlxuICAgICAgICAgIEByZWFkRmlsZSh0ZW1wRmlsZSlcbiAgICAgICAgKVxuIl19
